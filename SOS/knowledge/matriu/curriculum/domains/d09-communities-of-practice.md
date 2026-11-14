---
id: d09-communities-of-practice
type: domain
mode: transversal
version: v0.1
status: draft
author: "@alvaro"

name: "Comunitats de Pràctica"
subtitle: "Cervell col·lectiu · activable des del primer dia"
objective: >
  El cursant identifica els seus rols VNA universals, es connecta a
  les CoPs corresponents, contribueix amb SOPs validats al cervell
  col·lectiu, i lidera una CoP nova quan apareix el rol.

competencies: []
competencies_planned: 5

cop_ref: cop-cuidador-de-la-pinya
sos_module: "Collective Brain"

prerequisites: []  # Transversal: no requereix dominis previs
unlocks: []  # Tampoc bloqueja cap altre

sos_context: critical
keywords:
  - comunitats de pràctica
  - CoPs
  - rols VNA universals
  - cervell col·lectiu
  - SOPs ratificats
  - 43things
  - Usenet asíncron
  - learning network
  - Etienne Wenger

references:
  - "Etienne Wenger · Communities of Practice"
  - "knowledge/vision/communities-of-practice.md"
  - "Vision: 43things meets Usenet"
---

# D-09 · Comunitats de Pràctica

## El que aprens

Aprens a **integrar-te en la xarxa de la Matriu** a través dels teus rols
VNA universals. La pregunta de fons: *quin Cap de colla és aplicable a
totes les colles, no només a la teva?*

Cada **rol VNA universal** (Cap de colla, Acotxador invisible, Músic,
Dissenyador de cartera...) té la seva **CoP transversal**: practicants
de diferents projectes que comparteixen ofici. **Tu hi entres pels rols
que jugues**, no pel sector on operes.

L'efecte multiplicador és aquest: **tot el que tu valides amb la teva
CoP, t'arriba multiplicat**. Els SOPs ratificats per CoPs alimenten el
cervell col·lectiu de SOS, i els agents IA del teu propi projecte els
fan servir com a base de coneixement de qualitat.

## Per què transversal (i no en una posició fixa)

Aquesta és una decisió arquitectònica important. **Les CoPs eren D-09 al
disseny anterior**, després del cicle lineal. Però mirant-ho amb fredor:

- **Pots connectar-te a una CoP des del D-00.** Si reps mentoria interna,
  ja n'estàs participant.
- **Cada domini del cicle té la seva CoP.** D-02 → Mapejador VNA,
  D-03 → Cap de colla, D-04 → Cap de finances coop, etc.
- **Les CoPs són infraestructura social**, no un mòdul d'aprenentatge.

Per això D-09 és ara **transversal**: activable des del primer dia,
amb intensitat creixent a mesura que avances al cicle. Si arribes al D-08
sense tocar les CoPs, t'has perdut **la meitat del valor de la Matriu**.

## El recorregut (provisional)

Cinc competències previstes, totes en `draft`:

**C-09.1 · Identificar els teus rols VNA universals.** Quins rols dels que
jugues són transferibles a altres projectes? La resposta defineix les
CoPs on encaixes.

**C-09.2 · Connectar-te a CoPs existents.** Procediment d'entrada, expectatives,
calendari de trobades asíncrones.

**C-09.3 · Validar SOPs per a la teva CoP.** Cicle DRAFT → REVIEW →
APPROVED-BY-COP → CONSUMIBLE. Aprens a revisar SOPs d'altres.

**C-09.4 · Contribuir al cervell col·lectiu.** Què aportes tu que millora
els outputs IA dels altres? Patrons, errades a evitar, refinaments.

**C-09.5 · Liderar una CoP nova.** Si jugues un rol universal que encara no
té CoP, la pots posar en marxa. Procediment d'inici (3+ practicants actius
en projectes diferents).

## Connexió amb SOS

Suport tècnic al mòdul **Collective Brain**. Agents involucrats:

- **`@agent_universal_role_detector`** — Identifica rols VNA universals
- **`@agent_sop_reviewer`** — Acompanya el procés de revisió per CoP
- **`@agent_collective_synthesizer`** — Sintetitza aprenentatges de CoPs

Les skill-seeds principals (pendents):

- `s-universal-role-extractor`
- `s-sop-review-helper`
- `s-cop-onboarding`

I els SOPs validats per la CoP Cuidador de la pinya (pendents).

## Sortides del domini (continues, no terminals)

A diferència dels dominis lineals, D-09 **no es completa mai**. Mentre estàs
al cicle, contribueixes:

- Llista identificada dels teus rols VNA universals
- Pertinença activa a 2-5 CoPs
- SOPs validats que aportes al cervell col·lectiu
- (Eventualment) Lideratge d'una CoP nova si el teu rol no en té

---

*D-09 v0.1 · transversal · status: draft · pendent revisió CoP Cuidador de la pinya*
