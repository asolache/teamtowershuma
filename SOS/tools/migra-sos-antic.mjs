/* Migra el coneixement de mapes de valor del SOS antic a la base única (15/11/2026).
   ─────────────────────────────────────────────────────────────────────────
   L'Àlvar (15/11/2026): «integra todo lo que audites del código antiguo
   susceptible de ayudarnos a dar el salto en la página de crea tu mapa».

   El repositori asolache/teamtowershuma-sos està aturat des del 18/10/2026.
   Tenia, en codi i en Markdown, molt de saber de mapes per sector i per domini
   que el SOS d'ara no feia servir. Aquest script el llegeix UNA vegada i
   l'escriu, net, a SOS/knowledge/vna/base/fonts/sos-antic.json. Des d'aquí,
   aquest fitxer és la font: el repositori antic no es torna a llegir.

   Què s'emporta (i què no):
     · dominis    · js/core/domainDetector.js DOMAIN_PACKS: 24 dominis amb
                    paraules, rols arquetip i nivell de castell, intangibles,
                    patrons recíprocs, entregables i transaccions canòniques.
     · subtipus   · js/core/sectorSubtypes.js: 4-6 subtipus per sector.
     · rols       · js/core/sectorRoleCatalog.js: el vocabulari de rol per sector.
     · sectors    · knowledge/sectors/*.md: rols canònics (SENSE la tarifa
                    fmv_usd_h: res de preus a la base, que surt a la web),
                    SOPs canònics, paraules i essència.
     · socs       · knowledge/socs/lifecycle/*.md (idea, mvp, validació, escala):
                    principis i resultats esperats de cada fase.
     · casos      · knowledge/benchmarks/vna-quality-cases.json: 20 casos amb
                    el que un bon mapa ha de portar.
   Les lletres de sector del SOS antic són de la CNAE-2009 (J = 58-63, …):
   es guarden amb el seu rang de divisions perquè la base les pugui creuar
   amb la NACE 2.1, que té lletres diferents a partir de la J.

   Ús: node SOS/tools/migra-sos-antic.mjs ../teamtowershuma-sos
   (necessita python3 amb PyYAML per llegir les capçaleres dels .md). */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ARREL = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ANTIC = resolve(process.argv[2] || join(ARREL, '..', 'teamtowershuma-sos'));
const SORTIDA = join(ARREL, 'SOS', 'knowledge', 'vna', 'base', 'fonts', 'sos-antic.json');
const mod = f => import(pathToFileURL(join(ANTIC, 'js', 'core', f)).href);

/* Les divisions de cada lletra a la CNAE-2009 (la del SOS antic). */
export const CNAE2009 = { A: '01-03', B: '05-09', C: '10-33', D: '35', E: '36-39', F: '41-43', G: '45-47', H: '49-53', I: '55-56',
  J: '58-63', K: '64-66', L: '68', M: '69-75', N: '77-82', O: '84', P: '85', Q: '86-88', R: '90-93', S: '94-96', T: '97-98', U: '99', UV: '97-99' };

/* Les capçaleres YAML dels .md, amb PyYAML: el node no en porta cap lector. */
function capcaleres(fitxers) {
  const py = 'import sys,json,yaml\nout={}\nfor f in sys.argv[1:]:\n t=open(f,encoding="utf8").read()\n p=t.split("---",2)\n out[f]=yaml.safe_load(p[1]) if t.startswith("---") and len(p)>2 else {}\nprint(json.dumps(out,ensure_ascii=False,default=str))';
  return JSON.parse(execFileSync('python3', ['-I', '-c', py, ...fitxers], { encoding: 'utf8', maxBuffer: 64 << 20 }));
}

const net = s => String(s == null ? '' : s).trim();
const llista = v => (Array.isArray(v) ? v : []).map(x => (typeof x === 'string' ? net(x) : x)).filter(Boolean);

async function main() {
  const git = execFileSync('git', ['-C', ANTIC, 'log', '-1', '--format=%h %cs'], { encoding: 'utf8' }).trim();
  const { DOMAIN_PACKS } = await mod('domainDetector.js');
  const { SECTOR_SUBTYPES } = await mod('sectorSubtypes.js');
  const { SECTOR_ROLES } = await mod('sectorRoleCatalog.js');

  const dominis = Object.entries(DOMAIN_PACKS).map(([id, p]) => ({
    id, nom: p.label, paraules: llista(p.keywords), sectors2009: llista(p.sectorHints),
    rols: (p.archetypes || []).map(a => ({ id: a.id, nom: a.name, castell: a.castell || null, diu: net(a.desc) })),
    intangibles: llista(p.intangibles), patrons: llista(p.patterns),
    entregables: llista(p.deliverables_tangible),
    transaccions: (p.transactions_canonical || []).map(t => (typeof t === 'string' ? t : { de: t.from, a: t.to, que: t.deliverable || t.what || t.name, tipus: t.type || t.kind || null }))
  }));

  const dirSec = join(ANTIC, 'knowledge', 'sectors'), dirCicle = join(ANTIC, 'knowledge', 'socs', 'lifecycle');
  const fs = readdirSync(dirSec).filter(f => f.endsWith('.md')).map(f => join(dirSec, f));
  const fc = readdirSync(dirCicle).filter(f => f.endsWith('.md')).map(f => join(dirCicle, f));
  const cap = capcaleres([...fs, ...fc]);

  const sectors = fs.map(f => {
    const h = cap[f] || {}, lletra = net(h.sector_id) || f.split('/').pop().replace('.md', '');
    return { lletra2009: lletra, divisions: CNAE2009[lletra] || null, nom: net(h.sector_name), paraules: llista(h.tags),
      /* Sense fmv_usd_h ni cap altra xifra de preu. */
      rols: (h.roles || []).map(r => ({ id: r.id, nom: net(r.name), diu: net(r.description), castell: r.castell_level || null, qui: net(r.typical_actor), paraules: llista(r.tags) })),
      sops: (h.sops_canonical || []).map(s => ({ id: s.id, nom: net(s.title), diu: net(s.description), castell: s.castell_level || null })),
      subtipus: (SECTOR_SUBTYPES[lletra] || []).map(s => ({ id: s.id, nom: s.label, diu: s.hint, context: s.iaContextHint })),
      vocabulari: Object.fromEntries(Object.entries(SECTOR_ROLES[lletra] || {}).map(([k, r]) => [k, { nom: r.name, diu: r.description }])) };
  });

  const cicle = fc.map(f => { const h = cap[f] || {}; return { id: net(h.id), fase: f.split('/').pop().replace('.md', ''), diu: net(h.purpose), essencia: net(h.essence),
    principis: llista(h.guiding_principles), resultats: llista(h.expected_outcomes || h.outcomes) }; });

  const bench = JSON.parse(readFileSync(join(ANTIC, 'knowledge', 'benchmarks', 'vna-quality-cases.json'), 'utf8'));
  const casos = (bench.cases || []).map(c => ({ id: c.id, diu: net(c.description), sector2009: c.sector, domini: c.expected_domain || null,
    rolsMin: c.expected_roles_min || null, haDeTenir: llista(c.must_include_role_kinds) }));

  const out = { nota: "Migrat UNA vegada del SOS antic (asolache/teamtowershuma-sos) per SOS/tools/migra-sos-antic.mjs. Des del 15/11/2026 la font és aquest fitxer; el repositori antic no es torna a llegir. Sense preus.",
    origen: 'teamtowershuma-sos ' + git, dominis, sectors, cicle, casos };
  writeFileSync(SORTIDA, JSON.stringify(out, null, 1) + '\n');
  console.log('sos-antic.json: ' + dominis.length + ' dominis · ' + sectors.length + ' sectors (' + sectors.reduce((s, x) => s + x.rols.length, 0) + ' rols, ' +
    sectors.reduce((s, x) => s + x.sops.length, 0) + ' SOPs) · ' + cicle.length + ' fases · ' + casos.length + ' casos');
}
main().catch(e => { console.error('✗ ' + e.message); process.exit(1); });
