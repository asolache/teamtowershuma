---
id: s-stakeholder-mapper
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Stakeholder Mapper"
purpose: >
  Donat un projecte definit i la xarxa personal/professional de l'equip,
  identifica i categoritza stakeholders potencials, els avalua per
  accessibilitat × impacte, i prioritza els primers contactes.

competency_refs:
  - c-01.2-identify-stakeholders

agent_ref: "@agent_stakeholder_finder"

input_schema:
  type: object
  required:
    - project_summary
    - team_network
  properties:
    project_summary:
      type: string
    team_network:
      type: array
      description: "Contactes que l'equip ja té relació o accés"
      items:
        type: object
        required: [name, current_role, relationship_type]
    sector_context:
      type: string

output_schema:
  type: object
  required:
    - stakeholder_map
  properties:
    stakeholder_map:
      type: array
      items:
        type: object
        required: [name, category, accessibility, impact, priority]
        properties:
          name: { type: string }
          category:
            type: string
            enum: [pacient, partner, mentor, adversari, indiferent, broker]
          accessibility: { type: integer, minimum: 0, maximum: 10 }
          impact: { type: integer, minimum: 0, maximum: 10 }
          priority: { type: number }
          first_contact_approach:
            type: string

context_tokens: 1400
dependencies: []

sos_context: critical
---

# Stakeholder Mapper

## Què fa

Pren la xarxa de l'equip i categoritza cada contacte segons el seu paper
potencial al projecte (pacient, partner, mentor, adversari, indiferent,
broker). Calcula prioritat per accessibilitat × impacte i suggereix
l'aproximació per al primer contacte.

## Quan invocar-la

- Al D-01 després de definir el dolor i abans del primer contacte
- Quan vols repassar la teva xarxa amb mirada estratègica, no
  d'amistat
- **NO** ho usis per a contactes que ja coneixes molt: per a aquests,
  el teu judici sap més que la skill

## Prompt nucli

```
Ets analista de xarxes de stakeholders. Pren el resum del projecte i la
xarxa de l'equip. Per cada contacte:

1. CATEGORY (pot ser >1):
   - pacient: pateix el dolor que el projecte resol
   - partner: pot aportar recursos complementaris
   - mentor: té experiència, fa estalviar errades
   - adversari: pot tenir interès actiu que no funcioni
   - indiferent: ni suma ni resta sense activació
   - broker: coneix tot el sector, no és pacient ni partner

2. ACCESSIBILITY (0-10):
   - 10: pots tenir conversa de 30 min aquesta setmana
   - 5: requereix recomanació o presentació
   - 1: és pràcticament impossible (sense influència)

3. IMPACT (0-10):
   - 10: el seu "sí" canviaria el projecte
   - 5: el seu "sí" ajuda significativament
   - 1: el seu "sí" és simbòlic

4. PRIORITY = accessibility × impact (no és suma!)

5. FIRST_CONTACT_APPROACH:
   - Email curt amb assumpte X
   - Sol·licitud LinkedIn amb missatge Y
   - Presentació via Z (broker)
   - Acte públic on serà present

REGLES:
- Si no en saps res, posa accessibility i impact = 5 (mig) amb nota
- Identifica brokers de xarxa: sovint són la palanca principal
- Marca adversaris explícitament: no els puguis ignorar

PROJECTE: {{project_summary}}
XARXA: {{team_network}}
SECTOR: {{sector_context}}
```

## Notes

- Si la majoria dels contactes són "indiferent" o "amistat",
  probablement la xarxa de l'equip no està prou alineada amb el sector
  del projecte → cal expansió de xarxa abans no avanci el D-02
- Els brokers identificats són **palanques d'alta multiplicació**

---

*Skill-seed v0.1 · pendent validació CoP Iniciador de projectes*
