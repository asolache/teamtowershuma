---
id: d06-contracts-payments
type: domain
mode: linear
version: v0.1
status: draft
author: "@alvaro"

name: "Acords i contractes"
subtitle: "Legal + smart contracts + propostes/factures"
objective: >
  El cursant negocia acords cooperatius, redacta contractes legibles
  per humans, implementa smart contracts on aporten valor real, i
  genera propostes, factures i cobraments integrats amb el Ledger.

competencies: []
competencies_planned: 5

cop_ref: cop-negociador-d-acords
sos_module: "Contracts & Payments"

prerequisites:
  - d03-team-structure
  - d04-value-accounting
unlocks:
  - d07-project-communication

sos_context: critical
keywords:
  - contractes legals
  - smart contracts
  - acords cooperatius
  - propostes
  - factures
  - cobrament
  - blockchain
  - Ethereum
  - pacte de socis

references:
  - "Wright & De Filippi · Blockchain and the Law"
  - "FairShares Model · pactes coop multi-stakeholder"
  - "CryptoMarketing · pràctica @alvaro (des 2014)"
---

# D-06 · Acords i contractes

## El que aprens

Aprens a **formalitzar els acords reals del projecte** amb el món exterior
i interior — clients, proveïdors, cofundadors, partners. La novetat: no
només contractes legals tradicionals, sinó **contractes intel·ligents**
quan aporten valor real (no com a moda), i un sistema integrat de
propostes, factures i cobraments connectat al Ledger del D-04.

Cada contracte ha de **reflectir el SOC del D-03 i el Slicing Pie del D-04**.
No pot ser una capa paral·lela: ha de ser la projecció legal del que ja
està definit internament.

## Per què aquí (i no abans)

Els contractes sense estructura interna clara (D-03) ni comptabilitat
operativa (D-04) acaben sent **paper que ningú compleix**. Pitjor: si
els signes abans de tenir el Slicing Pie clar, comprometen el repartiment
just que volies aconseguir.

L'ordre correcte és: primer **com funciona internament** (D-03), després
**com comptabilitzem aportacions** (D-04), després **com ho diem al món
de forma vinculant** (D-06). El D-05 (agents IA) pot ser paral·lel al
D-06 — alguns Work Orders generen contractes automàticament.

## El recorregut (provisional)

Cinc competències previstes, totes en `draft`:

**C-06.1 · Negociar acords cooperatius.** Com es negocia diferent quan estàs
buscant un *win-win* real i no un repartiment de joc suma zero.

**C-06.2 · Redactar contractes legibles.** Contractes que un humà no
advocat pugui entendre. Inspiració: *Common Accord*, contractes modulars.

**C-06.3 · Implementar smart contracts quan aporten valor.** Quan val la pena
i quan no. Triggers automàtics que connecten amb el Ledger. Ethereum,
permaweb.

**C-06.4 · Generar propostes amb SOS.** Propostes integrades amb el VNA del
projecte i el Ledger. Cada proposta enviada queda al cervell col·lectiu.

**C-06.5 · Integrar cobrament al Ledger.** Cada factura cobrada actualitza
slices i pot disparar Recoupment Day. Fluxos auditables.

## Connexió amb SOS

Suport tècnic al mòdul **Contracts & Payments**. Agents involucrats:

- **`@agent_contract_drafter`** — Esborrany de contractes legibles
- **`@agent_smart_contract_designer`** — Avalua viabilitat smart contract
- **`@agent_proposal_generator`** — Genera propostes des del VNA
- **`@agent_invoice_processor`** — Connecta cobraments al Ledger

Les skill-seeds principals (pendents):

- `s-cooperative-agreement-drafter`
- `s-smart-contract-evaluator`
- `s-proposal-builder`
- `s-payment-to-ledger-connector`

I els SOPs validats per la CoP Negociador d'acords (pendents).

## Sortides del domini

Quan completes el D-06, has produït:

- Almenys un contracte signat amb cofundadors/socis basat en VNA + Slicing Pie
- Plantilla de proposta del teu projecte
- Plantilla de factura connectada al Ledger
- Procediment de cobrament integrat
- (Si aplica) Almenys un smart contract operatiu

Aquests artefactes alimenten:

- **D-07** (perquè la comunicació ha de ser consistent amb els acords)
- **D-08** (perquè els productes es venen amb aquests acords)

---

*D-06 v0.1 · linear · status: draft · pendent revisió CoP Negociador d'acords*
