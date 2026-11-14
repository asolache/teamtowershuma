---
id: s-identity-anchor-finder
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Identity Anchor Finder"
purpose: >
  Suggereix 3-5 activitats que el cursant **mai delegui** a agents IA,
  perquè són on viu la seva veu creativa singular. Combina el mapa
  Johari (zona 3) amb el life_thread per identificar les àncores
  d'identitat.

competency_refs:
  - c-00.3-identity-in-swarm

agent_ref: "@agent_introspection_mirror"

input_schema:
  type: object
  required:
    - johari_map
  properties:
    johari_map:
      type: object
    life_thread:
      type: string
      description: "Output del s-life-thread-finder (opcional però útil)"
    current_practice:
      type: array
      description: "Què fa el cursant actualment cada dia"

output_schema:
  type: object
  required:
    - identity_anchors
  properties:
    identity_anchors:
      type: array
      maxItems: 5
      items:
        type: object
        required: [activity, why_anchor, frequency, non_negotiable]
        properties:
          activity: { type: string }
          why_anchor: { type: string }
          frequency: { type: string }
          non_negotiable: { type: boolean }

context_tokens: 1200
dependencies:
  - s-personal-knowledge-mapper

sos_context: critical
---

# Identity Anchor Finder

## Què fa

Identifica les 3-5 activitats que sostenen la identitat creativa del
cursant. **Aquestes activitats no es deleguen mai a agents IA**, encara
que pugui ser tècnicament factible. Són la raó per la qual el seu
treball té veu singular.

## Quan invocar-la

- Al C-00.3, després de tenir el mapa Johari
- Quan el cursant ha detectat símptomes de dissolució i necessita
  re-ancorar
- En transicions vitals (canvi de feina, projectes nous)

## Prompt nucli

```
Ets analista d'identitat creativa. Identifica 3-5 àncores d'identitat
del cursant: activitats que sostenen la seva veu singular i que no
hauria de delegar a agents IA.

CRITERIS PER A UNA ÀNCORA:
1. Connecta amb la zona 3 del Johari (no-sap-que-sap)
2. Si la deleguessin, el cursant perdria identitat reconeixible
3. És practicable (no aspiracional)
4. Pot tenir frequency setmanal o més freqüent

PROCÉS:
1. Pren les intuïcions de la zona 3 com a candidats
2. Cerca al life_thread les activitats recurrents
3. Compara amb current_practice (què ja fa)
4. Suggereix 3-5 àncores ordenades per intensitat

PER CADA ÀNCORA:
- Activity: descripció concreta ("escriure 30 min al matí abans de pantalles")
- Why_anchor: per què aquesta activitat sosté la identitat singular
- Frequency: diari, setmanal, etc.
- Non_negotiable: true només per a 1-2 de les 5. La resta admeten
  flexibilitat.

REGLES:
- Mai marquis més de 2 com non_negotiable: la resta s'ha d'ajustar a la vida
- Si no detectes àncores clares, el cursant necessita més treball previ
  (no inventis àncores genèriques)

JOHARI: {{johari_map}}
LIFE_THREAD: {{life_thread}}
PRACTICE: {{current_practice}}
```

## Notes

- Aquestes àncores són input directe per al C-00.5 (Pràctica diària)
- Si el cursant porta 6+ mesos sense practicar cap àncora suggerida,
  no eren les seves — re-explorar

---

*Skill-seed v0.1 · pendent validació CoP Mentor intern*
