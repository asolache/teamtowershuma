---
id: s-vna-map-validator
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "VNA Map Validator"
purpose: >
  Pren un mapa VNA esborrany i la llista de preguntes de validació
  amb stakeholders, sintetitza les respostes rebudes i genera el
  mapa final validat (o llista d'aspectes a re-validar).

competency_refs:
  - c-02.3-draw-vna-map

agent_ref: "@agent_genesis_architect"

input_schema:
  type: object
  required:
    - draft_map
    - validation_feedback
  properties:
    draft_map:
      type: object
      description: "Mapa VNA esborrany (output de s-vna-map-builder)"
    validation_feedback:
      type: array
      description: "Feedback dels stakeholders en format estructurat"
      items:
        type: object
        required: [stakeholder_id, item_type, item_id, agreement]

output_schema:
  type: object
  required:
    - validated_map
    - pending_reviews
  properties:
    validated_map:
      type: object
      description: "Mapa amb només els elements validats"
    pending_reviews:
      type: array
      items:
        type: object
        required: [item_id, reason]

context_tokens: 1500
dependencies:
  - s-vna-map-builder

sos_context: primary
---

# VNA Map Validator

## Què fa

Tanca el cicle de validació del mapa VNA. Pren l'esborrany generat per
`s-vna-map-builder`, processa el feedback dels stakeholders entrevistats
(que han pogut dir "sí", "no" o "matissem"), i produeix:

- El **mapa final validat** amb només elements ratificats per ≥2 stakeholders
- Una **llista d'aspectes pendents** que necessiten més validació o
  conversa abans de tancar

## Quan invocar-la

- Després d'haver fet la ronda de validació amb stakeholders (SOP
  `sop-validar-mapa-amb-stakeholders`)
- Abans de publicar el mapa com a artefacte versionat del projecte

## Prompt nucli

```
Ets validador VNA. Pren aquest mapa esborrany i el feedback dels
stakeholders, i produeix:

1. VALIDATED_MAP: només elements amb consens ≥2 stakeholders (mateix sentit)
2. PENDING_REVIEWS: elements amb dissens o feedback incomplet

REGLES:
- Un element validat necessita confirmació de ≥2 stakeholders amb mateix sentit
- Si hi ha dissens, marca'l a pending_reviews amb la raó
- Si 1 stakeholder confirma i ningú més diu res, queda pending (no validat)
- Mai eliminis silenciosament un element del mapa: tot el que cau ha de
  quedar a pending_reviews amb explicació

OUTPUT: dos JSONs amb el motiu de cada decisió documentat.

ESBORRANY: {{draft_map}}
FEEDBACK: {{validation_feedback}}
```

## Notes

- Aquesta validació no acaba mai del tot: és normal que el mapa final
  tingui sempre alguns elements pending. **Un mapa amb 100% consens és
  sospitós** (ningú no ha pensat amb fricció)

---

*Skill-seed v0.1 · pendent validació CoP Mapejador VNA*
