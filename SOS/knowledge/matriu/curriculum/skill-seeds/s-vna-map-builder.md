---
id: s-vna-map-builder
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "VNA Map Builder"
purpose: >
  Construeix el primer esborrany del mapa VNA d'un projecte a partir
  del catàleg de rols, mapeig persona-rol i transaccions identificades.
  Genera l'estructura del JSON consumible per VnaMapRenderer.

competency_refs:
  - c-02.3-draw-vna-map

agent_ref: "@agent_genesis_architect"

input_schema:
  type: object
  required:
    - candidate_roles
    - persona_role_map
    - transactions
  properties:
    candidate_roles:
      type: array
      description: "Rols VNA del projecte"
    persona_role_map:
      type: array
      description: "Mapeig persones↔rols"
    transactions:
      type: array
      description: "Llista de transaccions classificades"

output_schema:
  type: object
  required:
    - vna_map
  properties:
    vna_map:
      type: object
      required: [nodes, edges, metadata]
      properties:
        nodes:
          type: array
          items:
            type: object
            required: [id, role_name, type]
        edges:
          type: array
          items:
            type: object
            required: [from, to, transaction_type, deliverable]
        metadata: { type: object }

context_tokens: 1800
dependencies:
  - s-vna-role-extractor
  - s-persona-role-mapper
  - s-transaction-classifier

sos_context: critical
---

# VNA Map Builder

## Què fa

Sintetitza tots els fragments anteriors (rols, mapeig, transaccions) en
un mapa VNA complet, en format JSON consumible per `VnaMapRenderer.js`
de SOS V11.

El mapa té:
- **Nodes** — un per rol VNA, no per persona (insistir en aquesta distinció)
- **Edges** — un per transacció identificada, amb classificació tangible/intangible
- **Metadata** — info global (data de generació, nombre rols, balance ratio)

## Quan invocar-la

- Quan ja tens output de s-vna-role-extractor, s-persona-role-mapper i
  s-transaction-classifier
- Per generar el primer borrador validable amb stakeholders

## Prompt nucli

```
Ets arquitecte de Value Network Analysis. Sintetitza aquests fragments
(rols, mapeig persona-rol, transaccions) en un mapa VNA complet.

REGLES:
1. Els NODES són rols, NO persones. Mai posis "Maria" com a node — posa
   "Comptable" o "Pacificadora" (els rols que Maria juga).
2. Les EDGES són transaccions de l'output de s-transaction-classifier.
   Cada edge: from_role → to_role, tipus tangible/intangible, deliverable.
3. La METADATA inclou comptatges globals i ratio tangible/intangible.
4. No inventis rols ni transaccions: només sintetitza el que t'arriba.
5. Detecta inconsistències i marca-les a un camp "issues" del JSON.

OUTPUT: JSON estructurat segons output_schema. Pretty-printed, llegible.

ROLS: {{candidate_roles}}
MAPEIG: {{persona_role_map}}
TRANSACCIONS: {{transactions}}
```

## Notes

- Si una transacció apunta a un rol que no està al catàleg, marca-la
  com a `issue` perquè la CoP la validi
- Si hi ha rols sense cap transacció associada, marca'ls igualment
- El mapa generat encara és un esborrany — necessita validació amb
  l'SOP `sop-validar-mapa-amb-stakeholders`

---

*Skill-seed v0.1 · pendent validació CoP Mapejador VNA*
