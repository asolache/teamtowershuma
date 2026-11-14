---
id: s-blind-spot-explorer
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Blind Spot Explorer"
purpose: >
  Genera preguntes específiques perquè observadors externs (mentors,
  parella, amics de confiança) puguin oferir feedback sobre la zona 4
  del cursant (no-sap-que-no-sap). Adaptades a la trajectòria del
  cursant; mai genèriques.

competency_refs:
  - c-00.1-map-current-mind

agent_ref: "@agent_introspection_mirror"

input_schema:
  type: object
  required:
    - cursant_summary
    - relationship_type
  properties:
    cursant_summary:
      type: string
    relationship_type:
      type: string
      enum: [partner, close_friend, teamcoach, peer, family, colleague]
    duration_known:
      type: string
      description: "Quant de temps fa que coneix el cursant"

output_schema:
  type: object
  required:
    - questions_for_observer
    - meta_instructions
  properties:
    questions_for_observer:
      type: array
      items: { type: string }
    meta_instructions:
      type: string
      description: "Instruccions per a qui rep les preguntes (com respondre amb honestedat)"

context_tokens: 1000
dependencies:
  - s-personal-knowledge-mapper

sos_context: primary
---

# Blind Spot Explorer

## Què fa

Genera preguntes específiques per a un observador extern concret —
adaptades al tipus de relació i a la història del cursant. L'objectiu:
extreure observacions sobre la zona 4 (no-sap-que-no-sap) que cap
introspecció solitària pot trobar.

## Quan invocar-la

- Després que el cursant hagi omplert zones 1, 2 i parcialment 3
- Per cada observador extern, una sessió diferent de preguntes
- **NO** automatitzis-ho amb formulari massiu: cal personalització

## Prompt nucli

```
Ets facilitador d'introspecció col·laborativa. Genera preguntes per a un
observador extern que conegui bé el cursant.

ADAPTAR AL TIPUS DE RELACIÓ:
- Partner/family: preguntes íntimes acceptables, però evitar atac
- Close_friend: preguntes sobre patrons, no sobre defectes
- Teamcoach: preguntes sobre dinàmica professional i resistències
- Colleague: preguntes acotades a l'àmbit laboral

PER CADA RELACIÓ, genera 5-7 preguntes que:
1. Inviten a observacions concretes ("recordes algun moment on...?"),
   no opinions vaes
2. Surten amb format on l'observador pot dir "no ho sé" sense conflicte
3. No demanen jutjar el cursant — demanen observar-lo
4. Cobreixen 3 àrees: patrons recurrents, reaccions sorprenents,
   contradiccions percebudes

META_INSTRUCTIONS per a l'observador:
- "La teva resposta no ha de ser còmoda per al cursant; ha de ser
  honesta. El cursant ha demanat aquesta conversa precisament per a
  això."
- "Si tens dubtes, prefereix dir-ho. Si no recordes exemples concrets,
  digues que no en tens."
- "Aquest exercici no és per resoldre res — és per descobrir."

CURSANT: {{cursant_summary}}
RELACIÓ: {{relationship_type}} · {{duration_known}}
```

## Notes

- Quants més observadors diversos (≥3 de tipus diferents), millor
- Les respostes han de ser anònimes per al cursant si l'observador
  ho prefereix
- L'agregació de respostes la fa el cursant + s-personal-knowledge-mapper,
  no aquesta skill

---

*Skill-seed v0.1 · pendent validació CoP Mentor intern*
