---
id: s-pain-quantifier
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Pain Quantifier"
purpose: >
  Donat un pain_statement validat i dades del sector, estima el cost
  real del dolor per pacient (€/any, hores/setmana) i el cost agregat
  al mercat objectiu (TAM del problema, no del producte).

competency_refs:
  - c-01.1-articulate-pain

agent_ref: "@agent_problem_clarifier"

input_schema:
  type: object
  required:
    - pain_statement
  properties:
    pain_statement:
      type: string
    market_size_estimate:
      type: integer
      description: "Pacients potencials al mercat objectiu (opcional)"
    sector_data:
      type: string
      description: "Dades del sector si en tens (opcional)"

output_schema:
  type: object
  required:
    - cost_per_patient
    - aggregate_market_cost
    - confidence
  properties:
    cost_per_patient:
      type: object
      properties:
        euros_per_year: { type: number }
        hours_per_week: { type: number }
        opportunity_cost: { type: string }
    aggregate_market_cost:
      type: object
      properties:
        total_euros_per_year: { type: number }
        total_hours_per_year: { type: number }
    confidence:
      type: string
      enum: [high, medium, low]
    assumptions:
      type: array
      items: { type: string }

context_tokens: 1000
dependencies:
  - s-pain-articulator

sos_context: primary
---

# Pain Quantifier

## Què fa

Posa números (estimats però defensables) al dolor articulat. Calcula:

- Cost per pacient individual (€/any, hores/setmana, oportunitat perduda)
- Cost agregat al mercat objectiu
- Nivell de confiança dels càlculs
- Assumptions explícites (no amagues els nombres màgics)

## Quan invocar-la

- Després de tenir un pain_statement validat
- Per justificar la grandària de l'oportunitat davant la CoP o partners
- **NO** com a substitut d'investigació real al mercat — és estimació

## Prompt nucli

```
Ets economista de problemes. Donat aquest pain_statement, estima:

1. COST PER PACIENT:
   - €/any (cost directe + indirecte)
   - Hores/setmana invertides en el dolor
   - Cost d'oportunitat (què no fan perquè estan dedicant-se a això)

2. COST AGREGAT AL MERCAT:
   - Si tens market_size: total = cost_per_patient × market_size
   - Si no tens market_size: estima'l amb 2-3 assumptions explícites

3. CONFIDENCE:
   - high: tens dades del sector que ho suporten
   - medium: extrapolació raonable amb 2-3 assumptions
   - low: estimació amb >3 assumptions sense confirmació

4. ASSUMPTIONS:
   - Cada assumption ha d'estar explícita
   - Format: "Si A i B, llavors C..."

REGLES:
- Sigues conservador en estimacions positives
- Sigues exhaustiu en costos indirectes (sovint més grans que els directes)
- Mai inventis dades del sector — millor confidence: low amb honestedat
  que confidence: high amb mentides

PAIN: {{pain_statement}}
MARKET: {{market_size_estimate}}
DATA: {{sector_data}}
```

## Notes

- Si confidence sempre surt low, és senyal que cal investigació real
  abans no avanci el projecte
- El cost d'oportunitat acostuma a ser el més difícil de quantificar
  i el més rellevant — pressiona aquí

---

*Skill-seed v0.1 · pendent validació CoP Iniciador de projectes*
