#!/usr/bin/env python3
"""
Build i validació del currículum de la Matriu.

Llegit tots els MD de domains/, competencies/, skill-seeds/, sops/,
els valida contra el schema, genera el JSON consumible per l'HTML
d'auditoria, i mostra l'inventari complet.

Ús:
    python3 build.py        # mode validació + build
    python3 build.py --json # només genera el JSON sense logs
"""
import os, re, sys, json, yaml, pathlib

REQUIRED_FIELDS = {
    'domain': ['id', 'type', 'name', 'objective', 'cop_ref', 'competencies'],
    'competency': ['id', 'type', 'domain_ref', 'name', 'objective', 'verified_by',
                   'skill_seeds', 'agent_ref', 'cop_ref'],
    'skill-seed': ['id', 'type', 'competency_refs', 'agent_ref'],
    'sop': ['id', 'type', 'cop_ref'],  # 'competency_refs' pot venir via 'applies_to'
    'schema': ['id', 'type'],
    'index': ['id', 'type'],
}

# Per a SOPs, les refs poden estar al camp 'applies_to' (estructura més rica)
# o al 'competency_refs' (estructura plana)
def extract_sop_competency_refs(meta):
    """Treu refs de competències d'un SOP siguin com siguin."""
    refs = list(meta.get('competency_refs', []) or [])
    applies_to = meta.get('applies_to', []) or []
    for entry in applies_to:
        if isinstance(entry, dict) and entry.get('competency'):
            refs.append(entry['competency'])
    return refs

BASE = pathlib.Path(__file__).parent

def parse_md(filepath):
    """Extreu frontmatter + cos d'un MD."""
    with open(filepath) as f:
        content = f.read()
    m = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
    if not m:
        return {'meta': {}, 'body': content, 'error': 'no_frontmatter'}
    try:
        meta = yaml.safe_load(m.group(1)) or {}
    except Exception as e:
        return {'meta': {}, 'body': m.group(2), 'error': f'yaml_error: {e}'}
    return {'meta': meta, 'body': m.group(2).strip()}

def validate_item(item, filepath):
    """Retorna llista d'errors o []."""
    errors = []
    if item.get('error'):
        return [f"{filepath}: {item['error']}"]
    meta = item['meta']
    type_ = meta.get('type')
    if not type_:
        errors.append(f"{filepath}: falta camp 'type'")
        return errors
    required = REQUIRED_FIELDS.get(type_, [])
    for field in required:
        if field not in meta:
            errors.append(f"{filepath}: falta camp obligatori '{field}'")
    return errors

def main():
    quiet = '--json' in sys.argv

    data = {
        'domains': [],
        'competencies': [],
        'skill_seeds': [],
        'sops': [],
        '_meta': {
            'schema_version': 'v0.1',
            'generated_at': str(pathlib.Path(__file__).stat().st_mtime),
        }
    }
    all_errors = []
    all_ids = set()

    # Recollir tots els MD
    sources = {
        'domains': BASE / 'domains',
        'competencies': BASE / 'competencies',
        'skill_seeds': BASE / 'skill-seeds',
        'sops': BASE / 'sops',
    }

    for key, folder in sources.items():
        if not folder.exists():
            continue
        for md_file in sorted(folder.glob('*.md')):
            item = parse_md(md_file)
            item['file'] = md_file.name
            data[key].append(item)
            errors = validate_item(item, str(md_file.relative_to(BASE)))
            all_errors.extend(errors)
            id_ = item['meta'].get('id')
            if id_ in all_ids:
                all_errors.append(f"{md_file.name}: ID duplicat '{id_}'")
            if id_:
                all_ids.add(id_)

    # Validar referències creuades (warnings, no errors — durant el pilot)
    warnings = []
    for cat in ['domains', 'competencies', 'skill_seeds', 'sops']:
        for item in data[cat]:
            meta = item['meta']
            for ref_field in ['domain_ref', 'cop_ref', 'agent_ref']:
                val = meta.get(ref_field)
                if val and ref_field == 'domain_ref' and val not in all_ids:
                    warnings.append(
                        f"{item['file']}: ref '{val}' a {ref_field} no existeix encara"
                    )
            for list_field in ['competencies', 'skill_seeds', 'competency_refs', 'sops']:
                refs = meta.get(list_field, []) or []
                for ref in refs:
                    if ref not in all_ids:
                        warnings.append(
                            f"{item['file']}: ref '{ref}' a {list_field} no existeix encara"
                        )
            # SOPs poden tenir applies_to amb refs
            if meta.get('type') == 'sop':
                for ref in extract_sop_competency_refs(meta):
                    if ref not in all_ids:
                        warnings.append(
                            f"{item['file']}: ref '{ref}' a applies_to no existeix encara"
                        )

    # Guardar JSON
    output = BASE / 'html' / 'curriculum-data.json'
    output.parent.mkdir(exist_ok=True)
    with open(output, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)

    if quiet:
        print(json.dumps(data, ensure_ascii=False, indent=2, default=str))
        return

    # Report
    print("=" * 70)
    print("  CURRÍCULUM DE LA MATRIU · Build report")
    print("=" * 70)
    print(f"\nInventari:")
    print(f"  Dominis:      {len(data['domains'])}/10")
    print(f"  Competències: {len(data['competencies'])}")
    print(f"  Skill-seeds:  {len(data['skill_seeds'])}")
    print(f"  SOPs:         {len(data['sops'])}")
    print(f"  Total IDs:    {len(all_ids)}")

    print(f"\nDominis amb MD:")
    for d in data['domains']:
        meta = d['meta']
        comp_count = sum(1 for c in data['competencies']
                         if c['meta'].get('domain_ref') == meta.get('id'))
        print(f"  ✓ {meta.get('id', '?'):30s} · {comp_count} comp · {meta.get('status', '?')}")

    print(f"\nValidació:")
    if all_errors:
        for e in all_errors:
            print(f"  ✗ ERROR: {e}")
        print(f"\n  TOTAL: {len(all_errors)} errors")

    if warnings:
        print(f"\n  Warnings ({len(warnings)} referències a fitxers encara no creats):")
        # Agrupar warnings per fitxer destí faltant
        missing = {}
        for w in warnings:
            # Extreure el ref que falta
            m = re.search(r"ref '([^']+)' a (\w+) no existeix", w)
            if m:
                ref, field = m.groups()
                missing.setdefault(ref, []).append(w)
        for ref, ws in sorted(missing.items()):
            print(f"    ◌ falta: {ref}")

    if not all_errors and not warnings:
        print(f"  ✓ Cap error ni warning. Tots els {len(all_ids)} IDs validats.")
    elif not all_errors:
        print(f"\n  ✓ Cap error · {len(warnings)} warnings (acceptables al pilot)")

    print(f"\nJSON generat: {output.relative_to(BASE)}")

    if all_errors:
        sys.exit(1)

if __name__ == '__main__':
    main()
