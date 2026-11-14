---
id: s-vna-health-analyzer
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "VNA Health Analyzer"
purpose: >
  Calcula el Health Score (0-100) de cada rol del mapa VNA, aplicant
  la fórmula canonical: 4 propietats × 15 punts + patologies × 10 +
  contagi × 5. Output: report estructurat amb diagnòstic per rol.

competency_refs:
  - c-02.4-analyze-role-health

agent_ref: "@agent_dharma_ontologist"

input_schema:
  type: object
  required:
    - vna_map
  properties:
    vna_map:
      type: object
      description: "Mapa VNA validat (output de s-vna-map-validator)"

output_schema:
  type: object
  required:
    - role_health_report
  properties:
    role_health_report:
      type: array
      items:
        type: object
        required: [role_id, score, properties_failed, patologies, contagi]
        properties:
          role_id: { type: string }
          score: { type: integer, minimum: 0, maximum: 100 }
          properties_failed:
            type: array
            items: { type: string }
          patologies:
            type: array
            items: { type: string }
          contagi: { type: integer }
          severity:
            type: string
            enum: [healthy, warning, urgent]
          evidence:
            type: array
            items: { type: string }

context_tokens: 1500
dependencies:
  - s-vna-map-builder

sos_context: critical
---

# VNA Health Analyzer

## Què fa

Aplica el càlcul de Health Score canonical (definit a la competència
C-02.4) a cada rol del mapa VNA. Output: report estructurat amb score,
propietats que fallen, patologies detectades, contagi i severity per
cada rol.

## Quan invocar-la

- Quan tens un mapa VNA validat (no abans!)
- Com a pas previ a la proposta d'intervencions humanes

## Prompt nucli

```
Ets analista de Health Score VNA. Per cada rol del mapa, calcula:

1. Quantes de les 4 propietats observables fallen:
   - Reciprocitat (per cada intangible donat, hi ha intangible rebut?)
   - Densitat (té ≥3 connexions amb rols diferents?)
   - Equilibri tangible/intangible (no només contractes ni només favors?)
   - Càrrega (no està sobrecarregat ni infrautilitzat?)

2. Quantes de les 6 patologies clàssiques presenta:
   - Aïllat (només 1 connexió)
   - Cuell d'ampolla (tot passa per ell)
   - Callejón sin salida (rep intangibles, no produeix output)
   - Extractor intangible (rep favors, no torna)
   - Donador exhaurit (dona intangibles, no rep res)
   - Connector ofegat (és el punt de pas de tot)

3. Quants veïns tenen Health Score <50 (contagi)

FÓRMULA:
   score = 100 - (properties_failed × 15) - (patologies × 10) - (contagi × 5)

SEVERITY:
   <40 = urgent, 40-69 = warning, 70+ = healthy

PER CADA ROL: inclou 2-3 evidències textuals del mapa (citacions de
transaccions o paths) que justifiquen la diagnosi.

MAPA: {{vna_map}}
```

## Notes

- Aquesta skill **calcula i diagnostica**. NO proposa intervencions —
  això és feina humana, no IA (per evitar intervencions sense context).
- Si un rol surt amb score 100, demana validació: rarament passa en
  xarxes reals.

---

*Skill-seed v0.1 · pendent validació CoP Mapejador VNA*
