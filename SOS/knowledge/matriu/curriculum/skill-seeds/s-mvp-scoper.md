---
id: s-mvp-scoper
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "MVP Scoper"
purpose: >
  Donada la definició del projecte (dolor + stakeholders + propòsit),
  proposa 3-5 opcions d'MVP construibles en 4 setmanes, amb estimacions
  d'esforç, cost, i potencial d'aprenentatge per cada una. Filtre fort:
  cap MVP que requereixi >80 hores humanes o >2.000€.

competency_refs:
  - c-01.4-define-mvp

agent_ref: "@agent_mvp_designer"

input_schema:
  type: object
  required:
    - pain_statement
    - target_stakeholders
  properties:
    pain_statement:
      type: string
    target_stakeholders:
      type: array
    team_skills:
      type: array
      items: { type: string }
    sector_context:
      type: string

output_schema:
  type: object
  required:
    - mvp_options
  properties:
    mvp_options:
      type: array
      items:
        type: object
        required: [type, description, effort_hours, cost_euros, learning_potential, fits_constraints]
        properties:
          type:
            type: string
            enum: [workshop, pdf_pagat, consultoria, demo, plantilla, comunitat, curs_online, auditoria, prototip, altres]
          description: { type: string }
          effort_hours: { type: integer }
          cost_euros: { type: integer }
          learning_potential:
            type: string
            enum: [high, medium, low]
          fits_constraints: { type: boolean }

context_tokens: 1400
dependencies:
  - s-pain-articulator
  - s-stakeholder-mapper

sos_context: critical
---

# MVP Scoper

## Què fa

Proposa MVPs concrets construibles en 4 setmanes a partir del dolor i
els stakeholders identificats. Cada opció amb estimació realista
d'esforç, cost i potencial d'aprenentatge. Filtre fort: si excedeix
80 hores o 2.000€, marca `fits_constraints: false`.

## Quan invocar-la

- Després de tenir dolor i stakeholders definits (D-01.1, D-01.2)
- Quan estàs decidint el primer experiment del projecte
- **NO** per a llançaments grans: això són D-08

## Prompt nucli

```
Ets dissenyador d'MVPs. Pren el dolor, els stakeholders i el context.
Proposa 3-5 opcions d'MVP construibles en 4 setmanes, de tipus diferent
quan sigui possible.

PER CADA OPCIÓ:
- Type: workshop, pdf_pagat, consultoria, demo, plantilla, comunitat,
  curs_online, auditoria, prototip, altres
- Description: 1-2 frases concretes ("Workshop d'una jornada sobre X
  per a 8 caps de cooperatives a Barcelona el [data]")
- Effort_hours: estimació realista, no optimista
- Cost_euros: cost directe (lloguer, viatge, eines, etc.)
- Learning_potential:
  - high: pot invalidar la hipòtesi principal en 4 setmanes
  - medium: aprens algunes coses però no decisives
  - low: confirma intuïcions sense desafiar-les
- Fits_constraints: true si effort ≤80h I cost ≤2.000€

REGLES:
- Inclou variats: workshop + consultoria + plantilla + ... (no tots
  de tipus similar)
- Sigues realista: si un workshop sol calen 40 hores per fer-lo bé,
  no posis 15
- Prioritza learning_potential: si totes són low, refines el dolor
  abans no triïs MVP

DOLOR: {{pain_statement}}
STAKEHOLDERS: {{target_stakeholders}}
SKILLS: {{team_skills}}
SECTOR: {{sector_context}}
```

## Notes

- Workshop sol ser la millor opció per a projectes amb component
  formatiu o consultiu
- Si totes les opcions surten amb fits_constraints: false, el projecte
  necessita un MVP fora del catàleg standard — pensar-ho amb la CoP

---

*Skill-seed v0.1 · pendent validació CoP Iniciador de projectes*
