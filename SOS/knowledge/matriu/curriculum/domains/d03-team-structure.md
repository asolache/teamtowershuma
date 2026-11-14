---
id: d03-team-structure
type: domain
mode: linear
version: v0.1
status: draft
author: "@alvaro"

name: "Estructurar la colla"
subtitle: "SOCs, SOPs, mètode casteller"
objective: >
  El cursant dissenya el Sistema Organitzatiu Cooperatiu (SOC) del
  seu projecte sobre els rols VNA identificats, redacta SOPs amb la
  seva CoP, i aplica les 10 competències de la colla castellera al
  treball d'equip real.

competencies: []
competencies_planned: 5

cop_ref: cop-cap-de-colla
sos_module: "SOC/SOP Designer"

prerequisites:
  - d02-value-mapping
unlocks:
  - d04-value-accounting
  - d05-ai-agent-operations

sos_context: critical
keywords:
  - SOC
  - sistema organitzatiu cooperatiu
  - SOP
  - holacràcia
  - mètode casteller
  - 10 competències de la colla
  - lideratge compartit
  - confiança operativa
  - cap de colla
  - acotxador invisible

references:
  - "TeamTowers.eu · Metanoia dels Castells (20+ anys)"
  - "Robertson · Holacracy"
  - "Federació Catalana de Castellers · Reglament tècnic"
---

# D-03 · Estructurar la colla

## El que aprens

Aprens a transformar el **mapa VNA** del teu projecte (D-02) en una estructura
operativa que funcioni cada dia: qui fa què, com es prenen les decisions, com
es valoren els intercanvis intangibles, com es manté la confiança a sota
pressió.

L'eina central són dos artefactes acoplats: els **SOCs** (Sistemes
Organitzatius Cooperatius) que defineixen com s'agrupen els rols, i els
**SOPs** (Standard Operating Procedures) que defineixen com s'executen.
Tots dos validats per la **CoP Cap de colla**, no decretats per algú.

I per damunt de tot, el **mètode casteller**: 20+ anys d'experiència
TeamTowers aplicant la *metanoia dels castells* al treball corporatiu.

## Per què aquí (i no abans)

L'estructura ha de venir **després del mapa**, mai abans. Quan dissenyes
SOCs sobre l'organigrama (no sobre el mapa VNA), reprodueixes les
patologies de l'organigrama. Quan dissenyes SOCs sobre el mapa VNA,
optimitzes pel flux real de valor.

El mètode casteller és aquí (no com a peça aïllada del cicle) perquè
**és l'aspecte humà de l'estructura**. Sense aquesta dimensió, els SOCs i
SOPs queden com a paperassa. Amb aquesta dimensió, esdevenen pràctica viva.

## El recorregut (provisional)

Cinc competències previstes, totes en `draft`:

**C-03.1 · Dissenyar SOCs holacràtics.** A partir dels rols del mapa VNA,
definir cercles d'autoritat (decisions), no jerarquia.

**C-03.2 · Escriure SOPs amb la teva CoP.** Procediment estandarditzat per a
una tasca recurrent del projecte, validat per la CoP del rol associat.

**C-03.3 · Aplicar les 10 competències de la colla.** *Confiança, Comunicació,
Esforç, Coordinació, Lideratge compartit, Pinya, Equilibri, Respecte,
Constància, Aprenentatge col·lectiu*. Cada una té el seu exercici pràctic.

**C-03.4 · Construir confiança operativa.** Tècniques per generar (i mantenir)
confiança real entre persones que potser no es coneixien fa 3 mesos.

**C-03.5 · Detectar i resoldre disfuncions.** Quan algun rol col·lapsa, quan
la cultura no escolta l'estructura, quan la pinya no està compacta:
diagnòstic i intervenció.

## Connexió amb SOS

Suport tècnic al mòdul **SOC/SOP Designer**. Agents involucrats:

- **`@agent_castell_director`** — Aplica el mètode casteller al disseny
- **`@agent_holacracy_architect`** — Construeix cercles d'autoritat
- **`@agent_sop_writer`** — Redacta SOPs en format ratificable per CoP

Les skill-seeds principals (pendents):

- `s-soc-designer` — Genera SOC inicial des d'un mapa VNA
- `s-sop-drafter` — Esborrany de SOP a partir d'una pràctica observada

I els SOPs validats per la CoP Cap de colla (pendents).

## Sortides del domini

Quan completes el D-03, has produït:

- SOC del projecte (cercles d'autoritat amb rols VNA assignats)
- Almenys 5 SOPs operatius validats per la CoP
- Pràctica de les 10 competències castelleres incorporada
- Procediment de gestió de conflictes

Aquests artefactes alimenten:

- **D-04** (perquè el Slicing Pie aplica sobre els rols del SOC)
- **D-05** (perquè els agents IA executen Work Orders dels SOPs)
- **D-06** (perquè els contractes legals reflecteixen els acords del SOC)

---

*D-03 v0.1 · linear · status: draft · pendent revisió CoP Cap de colla*
