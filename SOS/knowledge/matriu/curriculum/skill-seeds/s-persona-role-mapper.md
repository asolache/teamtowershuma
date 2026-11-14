---
id: s-persona-role-mapper
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Persona-Role Mapper"
purpose: >
  Donada una llista de rols VNA candidats i un conjunt de transcripcions
  d'entrevistes, construeix la matriu n:m que mapeja quina persona juga
  quin rol, amb un nivell de confiança per cada associació.

competency_refs:
  - c-02.1-identify-vna-roles

agent_ref: "@agent_dharma_ontologist"

input_schema:
  type: object
  required:
    - candidate_roles
    - transcripts
  properties:
    candidate_roles:
      type: array
      description: "Llista de rols VNA candidats (output del s-vna-role-extractor)"
      items:
        type: object
        required: [role_id, role_name]
    transcripts:
      type: array
      description: "Transcripcions de les entrevistes"
      items:
        type: object
        required: [person_id, content]
    organization_context:
      type: string
      description: "Context organitzatiu opcional"

output_schema:
  type: object
  required:
    - persona_role_map
  properties:
    persona_role_map:
      type: array
      items:
        type: object
        required: [person_id, role_id, confidence]
        properties:
          person_id:
            type: string
          role_id:
            type: string
          confidence:
            type: number
            minimum: 0
            maximum: 1
          evidence:
            type: array
            items:
              type: string
            description: "Citacions textuals que justifiquen l'associació"

context_tokens: 1500
dependencies:
  - s-vna-role-extractor

sos_context: critical
---

# Persona-Role Mapper

## Què fa

Construeix la **matriu de mapeig persona ↔ rol VNA**. Per cada associació
proposa un nivell de confiança (0-1) i les evidències textuals (frases
concretes de la transcripció) que la justifiquen.

És el pas següent natural després del `s-vna-role-extractor`: aquell
extreu els rols; aquest decideix qui juga cada rol.

## Quan invocar-la

- Quan ja tens els rols VNA candidats (output del s-vna-role-extractor)
- Quan vols saber **qui pot ser substituït** i qui no
- Quan vols detectar **persones que juguen massa rols** (sobrecàrrega)
- Quan vols detectar **rols sense persona assignada** (forats al sistema)

## Prompt nucli

```
Ets un especialista en Value Network Analysis. Donat aquest catàleg de
rols VNA i aquestes transcripcions d'entrevistes, construeix la matriu
de mapeig persona↔rol amb nivell de confiança.

INSTRUCCIONS:
1. Per cada persona, identifica QUINS rols juga (poden ser diversos)
2. Per cada associació persona-rol, dóna confiança 0-1 basada en:
   - Evidència explícita: "jo faig X" → 0.9-1.0
   - Evidència implícita: "quan apareix X, em truquen a mi" → 0.6-0.8
   - Inferència: el context suggereix que ho fa → 0.3-0.5
3. Inclou la citació textual que justifica cada associació
4. NO inferis: si no tens evidència ≥0.3, no inclouis l'associació
5. Marca persones que juguen >4 rols (possible sobrecàrrega estructural)
6. Marca rols del catàleg sense persona associada (possible forat)

OUTPUT:
JSON amb persona_role_map, amb cada entrada incloent person_id, role_id,
confidence (0-1) i evidence (llista de citacions).

CATÀLEG DE ROLS: {{candidate_roles}}
TRANSCRIPCIONS: {{transcripts}}
CONTEXT: {{organization_context}}
```

## Notes de qualitat

- Si una persona té només 1 rol assignat amb confiança alta, **no és
  necessàriament error** — pot ser un especialista. Demana validació
  humana abans de dir "està infrautilitzada".
- Si un rol té 5+ persones associades amb confiança alta, **probablement
  és massa genèric** — convida a refinar el catàleg de rols.

---

*Skill-seed v0.1 · pendent validació CoP Mapejador VNA*
