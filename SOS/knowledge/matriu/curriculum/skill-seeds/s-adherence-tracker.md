---
id: s-adherence-tracker
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Adherence Tracker"
purpose: >
  Analitza el log d'adherència a la pràctica diària del cursant
  (mínim 30 dies) i identifica patrons: quins elements es mantenen,
  quins decauen, quins efectes correlativen amb canvis al projecte
  o al cicle SOS. Sense judici, només dades.

competency_refs:
  - c-00.5-daily-practice

agent_ref: "@agent_introspection_mirror"

input_schema:
  type: object
  required:
    - daily_routine
    - adherence_log
  properties:
    daily_routine:
      type: array
      description: "Output del s-daily-practice-designer"
    adherence_log:
      type: array
      items:
        type: object
        required: [date, element_id, completed]
        properties:
          date: { type: string }
          element_id: { type: string }
          completed: { type: boolean }
          notes: { type: string }

output_schema:
  type: object
  required:
    - adherence_report
  properties:
    adherence_report:
      type: object
      properties:
        overall_percentage: { type: number }
        by_element:
          type: array
          items:
            type: object
            required: [element_id, percentage]
        weak_days_pattern:
          type: string
          description: "Quins dies de la setmana cauen més"
        weak_periods:
          type: array
          description: "Períodes (setmanes) amb adherència especialment baixa"
        recommendations:
          type: array
          items: { type: string }

context_tokens: 1000
dependencies:
  - s-daily-practice-designer

sos_context: primary
---

# Adherence Tracker

## Què fa

Analitza el log d'adherència a la pràctica diària. Mostra patrons amb
**dades, no judici**:

- Quin % global d'adherència has tingut
- Quins elements funcionen i quins no
- Quins dies de la setmana cauen més (informació, no culpa)
- Períodes específics de baixa adherència (potser correlacionats amb
  estrès del projecte)

## Quan invocar-la

- Mensualment durant els primers 3 mesos d'una rutina nova
- Trimestralment després
- Quan el cursant noti que la rutina està fallant però no entengui per què

## Prompt nucli

```
Ets analista de patrons d'adherència. Sense judicar, presenta les dades
del log amb claredat.

CÀLCULS:
1. Overall_percentage: % global d'adherència (dies × elements completed
   / dies × elements possibles)
2. By_element: per cada element de la rutina, % d'adherència
3. Weak_days_pattern: hi ha dies de la setmana on l'adherència baixa
   sistemàticament? (Dilluns? Caps de setmana?)
4. Weak_periods: setmanes concretes amb adherència ≤40%

RECOMMENDATIONS (basades en evidència, no en moralitat):
- Si un element té <30% adherència: probablement està mal dissenyat,
  no és falta del cursant
- Si weak_days_pattern és coherent: probablement la rutina no s'ha
  adaptat a la realitat (ex: dilluns matí ple de reunions)
- Si weak_periods correlativen amb fases intenses del projecte:
  la rutina necessita versió "modus crisi" simplificada

REGLES:
- Mai jutgis al cursant. Si l'adherència és baixa, és senyal de mal
  disseny, no de mal cursant.
- Sigues observador, no terapeuta
- Suggereix re-disseny si overall <50% durant 4 setmanes

ROUTINE: {{daily_routine}}
LOG: {{adherence_log}}
```

## Notes

- Una rutina és bona si el cursant la fa, no si "hauria de fer-la"
- Adherència 70-80% és exitós; 100% és sospitós (potser massa fàcil)
- 30-50% és senyal de re-disseny urgent

---

*Skill-seed v0.1 · pendent validació CoP Mentor intern*
