---
id: s-mvp-hypothesis-formulator
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "MVP Hypothesis Formulator"
purpose: >
  Per a una opció d'MVP escollida, formula la hipòtesi de validació
  en format invalidable: "Si X, llavors Y dins de Z". Defineix també
  el criteri d'èxit/fracàs concret i les mètriques observables.

competency_refs:
  - c-01.4-define-mvp

agent_ref: "@agent_mvp_designer"

input_schema:
  type: object
  required:
    - mvp_option
    - pain_statement
  properties:
    mvp_option:
      type: object
      description: "Una opció del s-mvp-scoper"
    pain_statement:
      type: string

output_schema:
  type: object
  required:
    - hypothesis
    - success_criteria
    - failure_criteria
    - metrics
  properties:
    hypothesis:
      type: string
      description: "Format: 'Si X, llavors Y dins de Z'"
    success_criteria:
      type: object
      properties:
        threshold: { type: string }
        next_step: { type: string }
    failure_criteria:
      type: object
      properties:
        threshold: { type: string }
        next_step: { type: string }
    metrics:
      type: array
      items:
        type: object
        required: [name, when_measured, target_value]

context_tokens: 1000
dependencies:
  - s-mvp-scoper

sos_context: critical
---

# MVP Hypothesis Formulator

## Què fa

Pren una opció d'MVP i la converteix en **experiment científic
mini-empresarial**: hipòtesi invalidable, criteri d'èxit/fracàs
clar abans d'iniciar, mètriques observables amb dates.

## Quan invocar-la

- Just després de triar quina opció del s-mvp-scoper executar
- Abans de començar la construcció de l'MVP
- **NO** durant ni després de l'execució: aquesta skill defineix el
  marc, no l'avalua

## Prompt nucli

```
Ets metodòleg d'experiments. Pren l'MVP escollit i formula:

1. HYPOTHESIS: format estricte
   "Si [persones tipus X] tenen accés a [artefacte concret Y] durant
   [temps Z], llavors [comportament observable W] hauria de passar
   dins de [període mesurable]."
   
   - W ha de ser observable, no abstracte ("interès" no val; "sol·licitar
     conversa de seguiment" sí)
   - El període ha de ser concret (4 setmanes, no "aviat")

2. SUCCESS_CRITERIA:
   - Threshold: nombre/percentatge mínim per considerar èxit
   - Next_step: què fer si succeeix (escalar, iterar, etc.)

3. FAILURE_CRITERIA:
   - Threshold: per sota d'aquest valor és fracàs clar
   - Next_step: pivotar, tornar a inventari, abandonar

4. METRICS:
   - Per cada mètrica: name, when_measured, target_value
   - Mínim 2 mètriques observables
   - Cap mètrica abstracta tipus "satisfacció"

REGLES:
- La hipòtesi ha de poder fracassar visiblement. Si no, no és bona.
- Distingeix between thresholds: success_threshold > failure_threshold,
  amb una franja entre ells = "pivot parcial"
- Sigues conservador en success_criteria; sigues clar en failure_criteria

MVP: {{mvp_option}}
PAIN: {{pain_statement}}
```

## Notes

- Si la hipòtesi resultant no pot fracassar visiblement, refines la
  definició de l'MVP fins que sí pugui
- La franja entre success i failure (pivot parcial) ha d'estar
  definida abans, no després

---

*Skill-seed v0.1 · pendent validació CoP Iniciador de projectes*
