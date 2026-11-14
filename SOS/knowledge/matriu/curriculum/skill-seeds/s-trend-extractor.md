---
id: s-trend-extractor
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Trend Extractor"
purpose: >
  Identifica i caracteritza tendències verificables (regulatòries,
  tecnològiques, culturals, econòmiques) que justifiquen el "per què
  ara" del projecte. Cada tendència ha de tenir data o esdeveniment
  concret que la marca, no només descripció genèrica.

competency_refs:
  - c-01.3-validate-purpose

agent_ref: "@agent_purpose_distiller"

input_schema:
  type: object
  required:
    - project_description
    - sector
  properties:
    project_description:
      type: string
    sector:
      type: string
    geographic_scope:
      type: string
      description: "Catalunya, Espanya, UE, global..."

output_schema:
  type: object
  required:
    - trends
  properties:
    trends:
      type: array
      items:
        type: object
        required: [dimension, description, marker_event, relevance]
        properties:
          dimension:
            type: string
            enum: [regulatory, technological, cultural, economic]
          description: { type: string }
          marker_event:
            type: object
            required: [date, event]
            properties:
              date: { type: string }
              event: { type: string }
              source: { type: string }
          relevance:
            type: string
            description: "Com aquesta tendència permet/obliga el projecte"
          window:
            type: object
            properties:
              opens: { type: string }
              closes: { type: string }

context_tokens: 1500
dependencies: []

sos_context: critical
---

# Trend Extractor

## Què fa

Per a un projecte donat, identifica les tendències del món que el fan
possible o necessari **ara**, no fa 5 anys. Cada tendència ha de tenir
una data o esdeveniment concret que la marca (no només "la gent està
més oberta").

Detecta també les **finestres temporals**: quan s'obre l'oportunitat i
quan podria tancar-se.

## Quan invocar-la

- Al D-01 per construir el "per què ara"
- Quan estàs validant la urgència del projecte
- Per justificar timing davant inversors/partners

## Prompt nucli

```
Ets analista de tendències per a estratègia. Per a aquest projecte,
identifica 5-7 tendències verificables a 4 dimensions:

1. REGULATORY: lleis, decrets, directives en vigor o que entren
2. TECHNOLOGICAL: capacitats que ara existeixen i abans no
3. CULTURAL: canvis de comportament demogràfic o generacional
4. ECONOMIC: cicles, crisis, capital disponible, etc.

PER CADA TENDÈNCIA:
- Description: 1-2 frases
- Marker_event: data + esdeveniment concret (ex: "BOE 15/03/2024 publicació
  Llei X sobre Y"). SI NO TENS marker_event verificable, NO incloguis
  la tendència.
- Source: on es pot verificar (BOE, DOGC, report d'una entitat, etc.)
- Relevance: com aquesta tendència permet/obliga el projecte
- Window (opcional): si pots, identifica quan obre i quan tanca
  l'oportunitat associada

REGLES:
- Mai tendències sense marker_event verificable
- Mai "la gent està més oberta a X" sense dada de suport
- Sigues conservador: 3 tendències sòlides val més que 10 vaes
- Si no en trobes prou, dis-ho: pot ser que el "per què ara" no sigui
  prou fort i el projecte necessita reposicionar-se

PROJECTE: {{project_description}}
SECTOR: {{sector}}
ABAST: {{geographic_scope}}
```

## Notes

- Aquesta skill és **sensible a hal·lucinacions de dates**: si l'agent
  inventa lleis o reports que no existeixen, l'output és perillós
- Recomanació: validar manualment cada marker_event amb cerca real
  abans d'incorporar-lo a la documentació del projecte

---

*Skill-seed v0.1 · pendent validació CoP Iniciador de projectes*
