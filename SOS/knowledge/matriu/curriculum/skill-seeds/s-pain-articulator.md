---
id: s-pain-articulator
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Pain Articulator"
purpose: >
  Donada una descripció de projecte i transcripcions d'entrevistes amb
  pacients potencials, sintetitza 3-5 statements de dolor candidats en
  format estandarditzat i avalua la qualitat de cada un (real, articulable,
  inventat).

competency_refs:
  - c-01.1-articulate-pain

agent_ref: "@agent_problem_clarifier"

input_schema:
  type: object
  required:
    - project_description
    - patient_interviews
  properties:
    project_description:
      type: string
      description: "Descripció inicial del projecte (pot ser molt rough)"
    patient_interviews:
      type: array
      description: "Transcripcions o resums d'entrevistes amb pacients potencials"
      items:
        type: object
        required: [patient_id, content]

output_schema:
  type: object
  required:
    - pain_statements
  properties:
    pain_statements:
      type: array
      items:
        type: object
        required: [statement, frequency, cost_estimate, quality]
        properties:
          statement:
            type: string
            description: "Format 'Quan X, [tipus persona] pateix Y...'"
          frequency: { type: integer, description: "Nombre d'entrevistes que el confirmen" }
          cost_estimate: { type: string }
          quality:
            type: string
            enum: [real-articulable, real-no-articulable, inventat, ambigu]
          evidence:
            type: array
            items: { type: string }

context_tokens: 1500
dependencies: []

sos_context: critical
---

# Pain Articulator

## Què fa

Llegeix transcripcions d'entrevistes amb pacients potencials i sintetitza
els dolors recurrents en format estandarditzat. Categoritza cada dolor com
a real-articulable (el millor punt de partida), real-no-articulable
(existeix però el pacient no sap nomenar-lo), inventat (no apareix
espontàniament a les entrevistes) o ambigu.

## Quan invocar-la

- Quan ja tens transcripcions de mínim 5-10 entrevistes amb pacients
- Després de la primera ronda d'exploració de problema
- **NO** abans d'entrevistes: la skill no inventa dolors, els troba

## Prompt nucli

```
Ets analista de Problem Discovery. Llegeix aquesta descripció de projecte
i les transcripcions d'entrevistes. Sintetitza 3-5 statements de dolor
candidats.

PER CADA DOLOR:
1. Format estricte: "Quan [situació concreta i recurrent], [tipus de
   persona específic] pateix [conseqüència mesurable], i actualment no
   té millor opció que [hack manual o resignació]."
2. Frequency: en quantes entrevistes apareix
3. Cost_estimate: en €/any, hores/setmana, o salut/oportunitat
4. Quality:
   - real-articulable: pacients el descriuen espontàniament
   - real-no-articulable: existeix però el pacient no sap nomenar-lo (tu sí)
   - inventat: el pacient no el menciona, sembla pressuposat per l'equip
   - ambigu: dades insuficients
5. Evidence: 2-3 citacions textuals d'entrevistes que el justifiquen

REGLES:
- No inventis dolors: si no apareix a les entrevistes, no l'incloguis
- Marca com a "inventat" qualsevol dolor que el project_description mencioni
  però els pacients no
- Prioritza freqüència sobre dramatisme: el dolor més útil sol ser
  l'avorrit que afecta molta gent

PROJECTE: {{project_description}}
ENTREVISTES: {{patient_interviews}}
```

## Notes de qualitat

- Si tots els dolors surten "inventats", **alerta a l'equip**: vol dir
  que han projectat les seves intuïcions sobre el mercat sense escoltar.
- Si surten 5+ dolors "real-articulable", probablement n'hi ha massa
  diferents al mateix moment — pot ser senyal de manca de focus al
  projecte.

---

*Skill-seed v0.1 · pendent validació CoP Iniciador de projectes*
