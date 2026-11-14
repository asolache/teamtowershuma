---
id: s-cognitive-load-monitor
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Cognitive Load Monitor"
purpose: >
  Estima la càrrega cognitiva del cursant a un moment donat a partir
  d'observacions i context, identificant quina funció mental
  (atenció, judici, decisió, memòria) està saturada. Suggereix
  intervencions específiques per la funció saturada.

competency_refs:
  - c-00.4-recognize-mind-functions

agent_ref: "@agent_dharma_ontologist"

input_schema:
  type: object
  required:
    - current_activity
    - subjective_state
  properties:
    current_activity:
      type: string
      description: "Què està fent ara el cursant"
    subjective_state:
      type: string
      description: "Com es sent (cansat, alerta, distret, etc.)"
    hours_into_session:
      type: number
    agents_active:
      type: integer
      description: "Quants agents IA estan actius a la sessió"

output_schema:
  type: object
  required:
    - load_assessment
    - saturated_function
    - intervention
  properties:
    load_assessment:
      type: string
      enum: [low, moderate, high, critical]
    saturated_function:
      type: string
      enum: [atencio, judici, decisio, memoria, none]
      description: "Quina funció mental està més saturada"
    intervention:
      type: object
      properties:
        immediate: { type: string, description: "Què fer ara mateix" }
        short_term: { type: string, description: "Què canviar en els pròxims 30 min" }

context_tokens: 800
dependencies: []

sos_context: primary
---

# Cognitive Load Monitor

## Què fa

Estima en quina funció mental el cursant té càrrega alta i suggereix
intervenció específica. **No és diagnòstic** — és observació
estructurada per ajudar el cursant a auto-regular-se.

## Quan invocar-la

- Quan el cursant sent que treballa malament i no sap per què
- Quan apareixen errors o pèrdua de focus
- Preventivament: cada 90 min de sessió intensa amb IA

## Prompt nucli

```
Ets observador de càrrega cognitiva. A partir de l'activitat i l'estat
subjectiu, identifica quina funció mental està saturada i suggereix
intervenció.

DETECTAR FUNCIÓ SATURADA:
- ATENCIÓ saturada: cursant es distreu, mira el mòbil, llegeix 3 cops
  el mateix paràgraf
- JUDICI saturat: cursant no pot decidir si X és bo o no, totes les
  opcions li semblen vàlides o totes invàlides
- DECISIÓ saturada: cursant pospone tries, fa scroll, evita compromisos
- MEMÒRIA saturada: cursant oblida el que estava fent, fa preguntes
  ja respostes, perd el fil

INTERVENCIONS PER FUNCIÓ:
- Atenció saturada: pausa 15 min sense pantalles, caminar
- Judici saturat: aturar avaluació, posar criteris explícits, demanar
  segona opinió humana
- Decisió saturada: reduir opcions a 2, time-boxing de 5 min, no
  optimitzar
- Memòria saturada: pausa, escriure el que toca, dormir si és tarda

REGLES:
- Si agents_active >5: probablement la càrrega és real, no subjectiva
- Si hours_into_session >3: probablement cal pausa real, no només
  intervenció petita
- Mai diagnostiquis problemes mèdics: si la saturació és persistent
  i intensa, sugereix conversa amb humà (mentor o professional)

ACTIVITY: {{current_activity}}
STATE: {{subjective_state}}
HOURS: {{hours_into_session}}
AGENTS: {{agents_active}}
```

## Notes

- Aquesta skill funciona millor com a *prompt periòdic* (cada 90 min)
  que com a *crida en crisi*
- Pot integrar-se amb el daily_practice del C-00.5

---

*Skill-seed v0.1 · pendent validació CoP Mentor intern*
