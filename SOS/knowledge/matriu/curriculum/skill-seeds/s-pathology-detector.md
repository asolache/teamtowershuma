---
id: s-pathology-detector
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "VNA Pathology Detector"
purpose: >
  Detecta patologies estructurals emergents al mapa VNA que no estan
  a la llista canonical de 6 (aïllat, cuell d'ampolla, callejón, extractor,
  donador exhaurit, connector ofegat). Proposa noms i caracteritzacions
  per a la CoP perquè formin part del catàleg evolutiu.

competency_refs:
  - c-02.4-analyze-role-health

agent_ref: "@agent_synaptic_weaver"

input_schema:
  type: object
  required:
    - vna_map
    - role_health_report
  properties:
    vna_map: { type: object }
    role_health_report: { type: array }

output_schema:
  type: object
  required:
    - emergent_patologies
  properties:
    emergent_patologies:
      type: array
      items:
        type: object
        required: [proposed_name, characterization, instances_found]
        properties:
          proposed_name: { type: string }
          characterization: { type: string }
          instances_found:
            type: array
            items: { type: string }
          severity_pattern: { type: string }
          cop_validation_needed: { type: boolean }

context_tokens: 1300
dependencies:
  - s-vna-health-analyzer

sos_context: secondary
---

# VNA Pathology Detector

## Què fa

Mentre `s-vna-health-analyzer` aplica les 6 patologies canonical,
aquesta skill **busca patrons emergents** que el catàleg actual no
captura. La seva tasca: ampliar el llenguatge clínic de VNA al
projecte concret.

## Quan invocar-la

- Després de tenir el `role_health_report` generat
- Quan vols enriquir el catàleg de patologies de la CoP Mapejador VNA
- Quan el projecte té característiques sectorials que les patologies
  generals no capten

## Prompt nucli

```
Ets investigador clínic VNA. Tens un mapa i el seu health report. La
teva tasca: identificar patrons patològics que NO estan al catàleg
canonical de 6 patologies (aïllat, cuell d'ampolla, callejón sin salida,
extractor intangible, donador exhaurit, connector ofegat).

CRITERIS DE PATOLOGIA EMERGENT:
1. Es repeteix en ≥2 rols (no és cas aïllat)
2. No quadra perfectament en cap de les 6 canonical
3. Té un patró estructural identificable (no és buit)
4. Pot ser anomenat amb un terme curt i evocador

PER CADA PATOLOGIA EMERGENT:
- proposed_name: nom curt (CAT)
- characterization: 1-2 frases que la descriuen
- instances_found: rols del mapa que la presenten
- severity_pattern: com afecta el sistema
- cop_validation_needed: true sempre (cal que la CoP la ratifiqui)

Si no detectes patologies emergents, retorna llista buida i diu-ho.
Mai inventis patologies per omplir.

MAPA: {{vna_map}}
HEALTH: {{role_health_report}}
```

## Notes

- Aquesta skill **proposa** vocabulari, no l'estableix. La CoP Mapejador
  VNA decideix si una patologia emergent passa al catàleg canonical
- Per a sectors específics (cooperativisme, art, IA, etc.) sovint
  emergeixen patologies pròpies que mereixen nom

---

*Skill-seed v0.1 · pendent validació CoP Mapejador VNA*
