---
id: s-dissolution-detector
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Dissolution Detector"
purpose: >
  Analitza el log d'auto-observació del cursant (apuntat 2-3 cops al
  dia durant 2 setmanes) i detecta símptomes de dissolució (apatia
  creativa, sensació de plagi, fatiga de decisió, identitat funcional).
  Genera alertes graduals abans no apareixi col·lapse.

competency_refs:
  - c-00.3-identity-in-swarm

agent_ref: "@agent_introspection_mirror"

input_schema:
  type: object
  required:
    - self_observation_log
  properties:
    self_observation_log:
      type: array
      description: "Anotacions del cursant"
      items:
        type: object
        required: [timestamp, observation]
        properties:
          timestamp: { type: string }
          observation: { type: string }
          mood: { type: string }
          ai_usage_intensity: { type: string }

output_schema:
  type: object
  required:
    - dissolution_assessment
    - symptoms_detected
    - recommendations
  properties:
    dissolution_assessment:
      type: string
      enum: [healthy, mild-symptoms, moderate-risk, high-risk]
    symptoms_detected:
      type: array
      items:
        type: object
        required: [symptom, frequency, evidence]
    recommendations:
      type: array
      items: { type: string }

context_tokens: 1200
dependencies: []

sos_context: critical
---

# Dissolution Detector

## Què fa

Llegeix les auto-observacions del cursant durant 2 setmanes i detecta
patrons de dissolució (definits a C-00.3). Quan apareixen, ho marca
gradualment perquè el cursant pugui intervenir abans no col·lapsi.

**No diagnostica.** Observa i ajuda a observar.

## Quan invocar-la

- Setmanalment durant els primers 2 mesos del cicle SOS
- Després d'un canvi gran d'intensitat amb IA
- Quan el cursant ho demani

## Prompt nucli

```
Ets observador de patrons en l'auto-observació del cursant. Detecta
símptomes de dissolució de la identitat creativa (treball amb IA).

QUATRE SÍMPTOMES CANONICALS:
1. APATIA CREATIVA: "no tinc ganes de crear", "ja no em ve la idea"
2. SENSACIÓ DE PLAGI: "això no sembla meu", "podria ser de qualsevol"
3. FATIGA DE DECISIÓ: "no sé quina opció triar", "tot em sembla igual"
4. IDENTITAT FUNCIONAL: el cursant es defineix per com fa servir eines,
   no per què crea

DISSOLUTION_ASSESSMENT:
- healthy: cap símptoma o aïllats sense repetició
- mild-symptoms: 1 símptoma apareix ≥2 vegades
- moderate-risk: 2+ símptomes recurrents
- high-risk: 3-4 símptomes recurrents amb intensitat creixent

PER CADA SÍMPTOMA DETECTAT:
- Frequency: quantes vegades apareix
- Evidence: 1-2 citacions textuals del log

RECOMMENDATIONS:
- Per a mild: una pràctica de retorn al centre per dia
- Per a moderate: revisar mapa Johari + delegation_boundaries
- Per a high: pausar IA 2-3 dies, conversa amb CoP Mentor intern

REGLES:
- Mai patologitzis. La dissolució és un fenomen, no una malaltia.
- Si el log té només 1 setmana, marca low_confidence

LOG: {{self_observation_log}}
```

## Notes

- Si la skill detecta high-risk repetidament malgrat intervencions,
  l'IA pot no ser el problema central — pot haver-hi causes externes
  (estrès no relacionat, dol no resolt). Mentor humà.

---

*Skill-seed v0.1 · pendent validació CoP Mentor intern*
