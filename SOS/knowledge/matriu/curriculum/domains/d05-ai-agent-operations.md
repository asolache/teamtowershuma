---
id: d05-ai-agent-operations
type: domain
mode: linear
version: v0.1
status: draft
author: "@alvaro"

name: "Operar amb agents IA"
subtitle: "Work Orders, swarm, skill-seeds"
objective: >
  El cursant dissenya Work Orders sobre els SOPs del projecte, coordina
  el swarm SOS V11, configura skill-seeds específiques per al seu domini,
  i audita la qualitat dels outputs IA dins el Ledger.

competencies: []
competencies_planned: 5

cop_ref: cop-coordinador-eixam-ia
sos_module: "Work Order Engine"

prerequisites:
  - d03-team-structure
  - d04-value-accounting
unlocks:
  - d07-project-communication

sos_context: critical
keywords:
  - Work Orders
  - swarm
  - agents IA
  - skill-seeds
  - local-first
  - permaweb
  - glass-box AI
  - audit IA
  - delegació

references:
  - "SOS V11 codex (/SKILL.md)"
  - "knowledge/vision/queen-swarm-protocol.md"
---

# D-05 · Operar amb agents IA

## El que aprens

Aprens a **dissenyar tasques automatitzables** sobre els SOPs ja definits, i
a coordinar el swarm d'agents IA de SOS V11 perquè els executi de manera
auditable. **Cada hora d'agent computa al Ledger igual que una hora
humana.** Si un agent escriu un mòdul, l'hora va al pie del rol que va
encarregar el Work Order.

Aquest no és un domini "d'aprendre a fer servir ChatGPT". És **operació
de swarm cooperatiu**: configures skill-seeds, instancies agents amb
context personalitzat, i veus com l'eixam s'organitza al voltant de les
teves Work Orders. Glass-box, no caixa negra.

## Per què aquí (i no abans)

Operar amb agents IA pressuposa:

- **Saber qui ets fent-ho (D-00)** — sinó t'absorbeix
- **Saber què fas (D-01)** — sinó perds rumb
- **Saber com flueix valor (D-02)** — sinó l'IA va contra la xarxa
- **Saber com s'estructura el treball (D-03)** — sinó els Work Orders no
  encaixen amb la realitat operativa
- **Saber com comptes el valor (D-04)** — sinó el cost dels agents queda fora
  del Ledger i el sistema esdevé opac

Per això D-05 ve **després** d'aquests cinc. Saltar-lo és la receptura
clàssica per quedar enredat amb la IA.

## El recorregut (provisional)

Cinc competències previstes, totes en `draft`:

**C-05.1 · Dissenyar Work Orders sobre SOPs.** Cada SOP repetitiu és candidat
a Work Order. Definir input, output esperat, criteri d'acceptació.

**C-05.2 · Coordinar el swarm SOS V11.** Quins agents per quina tasca. Com
es paral·lelitzen. Quan s'esperen.

**C-05.3 · Configurar skill-seeds específiques.** Adaptar les skill-seeds
generals als rols i a la cultura del teu projecte.

**C-05.4 · Auditar outputs IA.** Glass-box: saber per què un agent ha
respost el que ha respost. Detectar al·lucinacions abans que arribin al
Ledger.

**C-05.5 · Distribuir tasques humanes vs màquina.** Decidir què val la pena
delegar i què conserves com a treball humà. Connexió fort amb D-00.

## Connexió amb SOS

Suport tècnic al mòdul **Work Order Engine**. Agents involucrats:

- **`@agent_swarm_orchestrator`** — Coordina les crides al swarm
- **`@agent_work_order_planner`** — Dissenya WO a partir de SOPs
- **`@agent_output_auditor`** — Valida outputs abans d'arribar al Ledger

Les skill-seeds principals (pendents):

- `s-work-order-designer` — Genera WO inicial d'un SOP
- `s-swarm-task-router` — Decideix quin agent va a quina tasca
- `s-hallucination-detector` — Detecta inconsistències a outputs IA

I els SOPs validats per la CoP Coordinador d'eixam IA (pendents).

## Sortides del domini

Quan completes el D-05, has produït:

- Catàleg de Work Orders del teu projecte
- Skill-seeds personalitzades a la teva cultura
- Procediment d'audit IA setmanal
- Procediment de delegació humà/màquina
- Connexió amb el Ledger del D-04 (cost real per WO)

Aquests artefactes alimenten:

- **D-07** (perquè els agents generen primers borradors de comunicació)
- **D-08** (perquè els agents acompanyen el llançament del producte)

---

*D-05 v0.1 · linear · status: draft · pendent revisió CoP Coordinador d'eixam IA*
