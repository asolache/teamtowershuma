---
id: s-daily-practice-designer
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Daily Practice Designer"
purpose: >
  Dissenya una rutina diària mínima i sostenible per al cursant a
  partir de les seves àncores d'identitat, el seu nivell d'energia
  realista i les seves restriccions de vida (família, horari, etc.).
  Cap recepta universal — protocol personal.

competency_refs:
  - c-00.5-daily-practice

agent_ref: "@agent_introspection_mirror"

input_schema:
  type: object
  required:
    - identity_anchors
    - life_constraints
  properties:
    identity_anchors:
      type: array
      description: "Output del s-identity-anchor-finder"
    life_constraints:
      type: object
      properties:
        family: { type: string, description: "Família, fills, parella, etc." }
        work_schedule: { type: string }
        travel_frequency: { type: string }
        health_factors: { type: string }
    energy_pattern:
      type: string
      description: "Quan funciona millor el cursant (matí, vespre, nit)"

output_schema:
  type: object
  required:
    - daily_routine
    - non_negotiables
    - adaptable_elements
  properties:
    daily_routine:
      type: array
      items:
        type: object
        required: [time_of_day, activity, duration_minutes, anchor_ref]
    non_negotiables:
      type: array
      description: "1-2 elements que NO es salten"
      items: { type: string }
    adaptable_elements:
      type: array
      description: "Resta d'elements amb suggeriments d'adaptació"
      items:
        type: object
        required: [element, default, adapt_when]

context_tokens: 1300
dependencies:
  - s-identity-anchor-finder

sos_context: critical
---

# Daily Practice Designer

## Què fa

Dissenya una pràctica diària **realista** per al cursant. Cap recepta
copiada — combina les àncores d'identitat amb les restriccions reals
de la vida del cursant.

## Quan invocar-la

- Al C-00.5 per a primer disseny
- Després de 3 mesos d'execució per a revisió/ajustament
- Després de canvi vital significatiu (mudança, fill, canvi de feina)

## Prompt nucli

```
Ets dissenyador de pràctiques diàries sostenibles. Pren les àncores
d'identitat del cursant i les seves restriccions vitals. Dissenya una
rutina que:

CRITERIS:
1. MÍNIMA: si la pot fer en un dia dolent, sí. Si no, simplificar.
2. PERSONAL: connectada a les àncores, no genèrica
3. NON-NEGOTIABLE parcial: 1-2 elements sagrats, la resta adaptable
4. MESURABLE: el cursant pot dir si l'ha fet o no

ESTRUCTURA SUGGERIDA (no obligatòria):
- Començament del dia: 1 element (silenci, escriure, caminar)
- Durant el dia: 1-2 microelements (pausa, respiració, ancorada)
- Final del dia: 1 element (revisió, gratitud, journal)

RESPECTAR ENERGY_PATTERN: si el cursant funciona millor al matí,
posa-li allà la pràctica més important. Si és nit, mou-la.

ADAPTABILITAT:
- adapt_when: quan es pot saltar/modificar (viatges, malaltia, etc.)
- default: què fer en dies normals

REGLES:
- Mai més de 3 elements obligatoris
- Mai més de 30 min total al dia (sumant tot)
- Sempre incloure 1 element sense pantalles
- Si el cursant té família/fills, el disseny ha d'encaixar-hi

ÀNCORES: {{identity_anchors}}
RESTRICCIONS: {{life_constraints}}
ENERGIA: {{energy_pattern}}
```

## Notes

- El disseny inicial sempre és **massa ambiciós** — la primera versió
  rep retallades després de 2 setmanes
- Cal complementar amb s-adherence-tracker per saber si la rutina funciona

---

*Skill-seed v0.1 · pendent validació CoP Mentor intern*
