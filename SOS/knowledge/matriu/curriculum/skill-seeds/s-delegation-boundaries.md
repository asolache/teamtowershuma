---
id: s-delegation-boundaries
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Delegation Boundaries"
purpose: >
  Pren el mapa Johari cognitiu del cursant i suggereix què val la pena
  delegar a agents IA i què s'ha de retenir, amb justificació. Identifica
  específicament els intangibles propis (zona 3: no-sap-que-sap) com a
  no delegables.

competency_refs:
  - c-00.2-design-extended-brain

agent_ref: "@agent_introspection_mirror"

input_schema:
  type: object
  required:
    - johari_map
    - current_ai_usage
  properties:
    johari_map:
      type: object
      description: "Output del s-personal-knowledge-mapper"
    current_ai_usage:
      type: array
      description: "Tasques actuals on el cursant ja fa servir IA"

output_schema:
  type: object
  required:
    - delegation_recommendations
  properties:
    delegation_recommendations:
      type: array
      items:
        type: object
        required: [task_type, decision, rationale]
        properties:
          task_type: { type: string }
          decision:
            type: string
            enum: [delegate-fully, delegate-with-review, retain, never-delegate]
          rationale: { type: string }
          johari_zone: { type: string }
    danger_alerts:
      type: array
      description: "Avisos sobre delegacions actuals que poden estar dissolent la identitat"
      items: { type: string }

context_tokens: 1300
dependencies:
  - s-personal-knowledge-mapper

sos_context: critical
---

# Delegation Boundaries

## Què fa

A partir del mapa Johari del cursant, decideix:

- **Què val la pena delegar a IA** (zona 1: habilitats explícites)
- **Què val la pena delegar com a aprenentatge** (zona 2: forats coneguts)
- **Què mai delegues** (zona 3: intuïcions; zona 4: punts cecs)

Identifica específicament les delegacions actuals que poden estar
erosionant la identitat creativa del cursant.

## Quan invocar-la

- Després de tenir el mapa Johari del C-00.1
- Quan el cursant està re-dissenyant el seu workflow amb IA
- Periòdicament (cada 6 mesos) per re-avaluar

## Prompt nucli

```
Ets analista de delegació humà-màquina. Donat el mapa Johari del cursant
i el seu ús actual d'IA, recomana què delegar i què no.

REGLA D'OR PER ZONA:
- ZONA 1 (sap que sap): delegate-fully o delegate-with-review.
  L'IA t'imita bé aquí.
- ZONA 2 (sap que no sap): delegate-with-review com a aprenentatge ràpid.
  Tu llegeixes per aprendre.
- ZONA 3 (no sap que sap): RETAIN o NEVER-DELEGATE.
  Aquí viuen les teves intuïcions. Si les delegues, el cursant perd la
  pròpia veu.
- ZONA 4 (no sap que no sap): NEVER-DELEGATE amb agents.
  Els agents replicarien els teus cecs. Necessites mentor humà.

DANGER ALERTS:
- Si current_ai_usage inclou tasques de la zona 3 → marca-ho
- Si el cursant fa servir IA per "totes les decisions estratègiques" →
  alerta de dissolució
- Si la motivació profunda (C-01.5) està accessible per agents → alerta
  crítica

PER CADA RECOMANACIÓ:
- task_type: clar i concret
- decision: una de les 4 opcions
- rationale: per què aquesta decisió (referenciant zona Johari)

MAPA: {{johari_map}}
ÚS ACTUAL: {{current_ai_usage}}
```

## Notes

- És més útil rebre "Never-delegate" justificat que rebre "Delegate fully"
  ràpid: aquí val la pena anar fi
- Les recomanacions han de ser revisades amb la CoP Mentor intern, no
  aplicades automàticament

---

*Skill-seed v0.1 · pendent validació CoP Mentor intern*
