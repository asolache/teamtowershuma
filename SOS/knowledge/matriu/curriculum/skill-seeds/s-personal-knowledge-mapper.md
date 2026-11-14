---
id: s-personal-knowledge-mapper
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Personal Knowledge Mapper"
purpose: >
  Guia el cursant a omplir la finestra de Johari cognitiva (les 4 zones
  del coneixement propi) a partir de converses estructurades sobre la
  seva trajectòria i pràctica. Distingeix habilitats de intuïcions.

competency_refs:
  - c-00.1-map-current-mind

agent_ref: "@agent_introspection_mirror"

input_schema:
  type: object
  required:
    - cursant_history
  properties:
    cursant_history:
      type: string
      description: "Resum de la trajectòria professional i personal"
    external_observations:
      type: array
      description: "Observacions d'altres persones sobre el cursant (opcional, alimenta zona 3 i 4)"
      items: { type: string }

output_schema:
  type: object
  required:
    - johari_map
  properties:
    johari_map:
      type: object
      properties:
        sap_que_sap:
          type: array
          items: { type: string }
        sap_que_no_sap:
          type: array
          items: { type: string }
        no_sap_que_sap:
          type: array
          items:
            type: object
            required: [intuicio, evidence]
        no_sap_que_no_sap:
          type: array
          description: "Hipòtesis, no certeses"
          items:
            type: object
            required: [hypothesis, why_explore]
    follow_up_questions:
      type: array
      items: { type: string }

context_tokens: 1400
dependencies: []

sos_context: critical
---

# Personal Knowledge Mapper

## Què fa

Acompanya el cursant a omplir les 4 zones de la finestra de Johari
cognitiva (sap-que-sap, sap-que-no-sap, no-sap-que-sap, no-sap-que-no-sap)
combinant la pròpia trajectòria del cursant amb observacions externes
quan estiguin disponibles.

És la skill amb què es comença el D-00. No completa l'exercici per sí
sola — necessita observadors externs per a les zones 3 i 4.

## Quan invocar-la

- A l'inici de C-00.1
- Quan el cursant té dificultat per articular les zones difícils
- Per estructurar la conversa amb la CoP sobre punts cecs

## Prompt nucli

```
Ets analista de coneixement propi. Pren la trajectòria del cursant i les
observacions externes. Construeix la finestra de Johari cognitiva.

ZONES:
1. SAP QUE SAP: habilitats explícites amb evidència (anys, certificats, casos)
2. SAP QUE NO SAP: àrees on el cursant reconeix forats (idiomes, mètodes)
3. NO SAP QUE SAP: intuïcions detectables amb evidència externa
   - Si algú felicita per X "fàcil", possible intuïció
   - Si el cursant dóna consells valorats sense saber explicar com
4. NO SAP QUE NO SAP: hipòtesis, no certeses
   - Si l'equip o el sector tenen patrons que el cursant no menciona,
     possible punt cec
   - Si certes converses li són sistemàticament difícils

REGLES:
- Zona 1 i 2 del cursant: si dius. Zona 3 i 4: només si tens evidència
  externa (observacions, gaps a la història).
- Per zona 4, formuleu HIPÒTESIS, no certeses ("podria ser que no sàpiga
  sobre X — això s'hauria d'explorar")
- Genera 3-5 follow_up_questions per a la pròxima conversa

HISTÒRIA: {{cursant_history}}
OBSERVACIONS: {{external_observations}}
```

## Notes de qualitat

- Si l'output a zona 3 i 4 és buit, és senyal d'insuficient external
  observation, no de cursant transparent
- Mai diagnosis: els punts cecs surten en hipòtesi i el cursant els
  valida (o no) amb mentors

---

*Skill-seed v0.1 · pendent validació CoP Mentor intern*
