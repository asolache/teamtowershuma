---
id: s-mind-function-classifier
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Mind Function Classifier"
purpose: >
  Per a una tasca concreta del cursant, identifica quina funció mental
  predomina (atenció, judici, decisió, memòria, intuïció) i, per tant,
  quin tipus d'IA o de pausa va millor. Pont entre vocabulari vèdic
  i cognició contemporània.

competency_refs:
  - c-00.4-recognize-mind-functions

agent_ref: "@agent_dharma_ontologist"

input_schema:
  type: object
  required:
    - task_description
  properties:
    task_description:
      type: string
    context:
      type: string
      description: "Context del cursant: tipus de projecte, temps disponible"

output_schema:
  type: object
  required:
    - primary_function
    - secondary_function
    - vedic_correspondence
    - ai_suitability
  properties:
    primary_function:
      type: string
      enum: [atencio, judici, decisio, memoria, intuicio]
    secondary_function:
      type: string
    vedic_correspondence:
      type: object
      properties:
        sanskrit_term: { type: string }
        explanation: { type: string }
    ai_suitability:
      type: string
      enum: [excellent, good, acceptable, poor, never]
    recommendation:
      type: string

context_tokens: 900
dependencies: []

sos_context: primary
---

# Mind Function Classifier

## Què fa

Per a una tasca concreta, identifica quina funció mental predomina i
si val la pena delegar-la a IA. Connecta amb el vocabulari vèdic
**només quan aporta matís**, no com a decoració.

## Quan invocar-la

- Quan el cursant està dissenyant un workflow nou
- Per decidir si una tasca específica val la pena delegar
- Per articular per què certes feines són esgotadores i d'altres no

## Prompt nucli

```
Ets classificador de funcions cognitives. Pren la tasca descrita i
identifica:

1. PRIMARY_FUNCTION (la dominant):
   - atenció: cal sostenir focus continuat (lectura, edició)
   - judici: cal discriminar entre opcions (revisar, decidir qualitat)
   - decisió: cal triar entre alternatives (estratègia, prioritzar)
   - memòria: cal recordar/recuperar info (síntesi, escriure des de fonts)
   - intuïció: cal connectar coses no obvies (creativitat, diagnòstic)

2. SECONDARY_FUNCTION: la segona més present

3. VEDIC_CORRESPONDENCE (només si aporta matís):
   - atenció → manas (la ment que percep)
   - judici → buddhi (la ment que discrimina)
   - decisió → buddhi també, en mode executiu
   - memòria → chitta (el reservori)
   - intuïció → combinació de buddhi + chitta + ahamkara

   Inclou explicació funcional, MAI espiritualisme decoratiu.

4. AI_SUITABILITY:
   - excellent: tasques de memòria o atenció procedimental (síntesi,
     resum, formatat)
   - good: tasques de judici amb criteris explícits
   - acceptable: decisió amb opcions ben definides
   - poor: intuïció que requereix context idiosincràtic
   - never: tasques que SÓN la veu pròpia del cursant (motivació
     profunda, narrativa íntima)

5. RECOMMENDATION: una frase concreta

TASK: {{task_description}}
CONTEXT: {{context}}
```

## Notes

- Aquesta classificació no és definitiva: una tasca pot requerir
  diferents funcions en moments diferents
- Si la funció és "intuïció" i ai_suitability és "poor", val la
  pena respectar — l'IA fa fingit d'intuïció però no la genera

---

*Skill-seed v0.1 · pendent validació CoP Mentor intern*
