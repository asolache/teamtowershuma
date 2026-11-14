---
id: s-influence-map-builder
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Influence Map Builder"
purpose: >
  Construeix un mapa visual d'influència del sector a partir de
  l'stakeholder_map: qui parla amb qui, qui té poder formal vs
  informal, on són els colls d'ampolla d'influència. Identifica els
  punts de palanca òptims per a entrada al sector.

competency_refs:
  - c-01.2-identify-stakeholders

agent_ref: "@agent_stakeholder_finder"

input_schema:
  type: object
  required:
    - stakeholder_map
  properties:
    stakeholder_map:
      type: array
      description: "Output del s-stakeholder-mapper"
    known_connections:
      type: array
      description: "Relacions conegudes entre stakeholders"
      items:
        type: object
        required: [from, to, strength]

output_schema:
  type: object
  required:
    - influence_map
    - leverage_points
  properties:
    influence_map:
      type: object
      properties:
        nodes:
          type: array
          items:
            type: object
            required: [stakeholder_id, formal_power, informal_power]
        edges:
          type: array
          items:
            type: object
            required: [from, to, strength, direction]
    leverage_points:
      type: array
      description: "Stakeholders que, activats, mobilitzen molts altres"

context_tokens: 1300
dependencies:
  - s-stakeholder-mapper

sos_context: primary
---

# Influence Map Builder

## Què fa

Visualitza el sector com a xarxa d'influència. No és un organigrama —
és una representació de **qui escolta a qui** dins del sector. Permet
identificar punts de palanca: persones que, si les convences, mobilitzen
molts altres automàticament.

## Quan invocar-la

- Després de tenir l'stakeholder_map del s-stakeholder-mapper
- Quan tens almenys 15 stakeholders identificats
- Per dissenyar la seqüència òptima de primers contactes

## Prompt nucli

```
Ets analista de xarxes d'influència. Pren l'stakeholder_map i les
relacions conegudes. Construeix:

1. INFLUENCE MAP:
   - NODES amb: stakeholder_id, formal_power (paper a la jerarquia),
     informal_power (capacitat real d'influir)
   - EDGES: from → to, strength (0-1), direction (one-way o reciprocal)

2. DETECTA aquests patrons:
   - Formal power alt + informal power baix = càrrec sense seguiment
   - Formal power baix + informal power alt = influencer ocult
     (sovint més útil que els formals!)
   - Hub: stakeholder amb >5 connexions sortints
   - Bridge: stakeholder que connecta clusters separats

3. LEVERAGE POINTS:
   - Identifica els 3-5 stakeholders amb millor ratio influence/accessibility
   - Aquests són els punts d'entrada òptims al sector
   - Per cada un, explica per què

REGLES:
- No inventis connexions: si no tens dades, queda buit
- Els influencers ocults (formal baix + informal alt) són sovint la
  millor inversió de temps
- Si trobes un hub molt connectat, alerta: pot ser bona palanca però
  també gatekeeper

STAKEHOLDERS: {{stakeholder_map}}
CONNEXIONS: {{known_connections}}
```

## Notes

- Si no hi ha prou known_connections (≤5), la skill produeix mapa de
  baixa fiabilitat. Aprofundir converses amb 2-3 brokers per omplir
  abans de re-invocar.

---

*Skill-seed v0.1 · pendent validació CoP Iniciador de projectes*
