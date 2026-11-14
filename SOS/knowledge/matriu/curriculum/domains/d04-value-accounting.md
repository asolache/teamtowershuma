---
id: d04-value-accounting
type: domain
mode: linear
version: v0.1
status: draft
author: "@alvaro"

name: "Comptabilitzar el valor"
subtitle: "Slicing Pie, triple entrada, fons cooperatiu"
objective: >
  El cursant aplica el mètode Slicing Pie al seu projecte amb
  multiplicadors de risc i fase, configura el Ledger a SOS V11,
  i entén com el seu pie individual es connecta al pie cooperatiu
  de la Matriu.

competencies: []
competencies_planned: 5

cop_ref: cop-cap-de-finances-coop
sos_module: "Value Ledger"

prerequisites:
  - d02-value-mapping
  - d03-team-structure
unlocks:
  - d05-ai-agent-operations
  - d06-contracts-payments

sos_context: critical
keywords:
  - Slicing Pie
  - Mike Moyer
  - triple entrada
  - FairShares
  - fons cooperatiu
  - pie cooperatiu de la Matriu
  - FMV
  - Recoupment Day
  - phase multipliers
  - tokenòmica

references:
  - "Mike Moyer (2012) · Slicing Pie · Funding Your Company Without Funds"
  - "Mike Moyer (2014) · Will Work for Pie"
  - "Ridley-Duff · FairShares Model"
  - "knowledge/vision/slicing-pie-mike-moyer.md (SOS V11)"
---

# D-04 · Comptabilitzar el valor

## El que aprens

Aprens a **comptar valor en totes les seves dimensions** — monetari, temps,
intangible, IP, reputació — i a repartir-lo justament entre tots els
participants del projecte. El mètode central és **Slicing Pie** de
Mike Moyer, amb les extensions de SOS V11 (multiplicadors de fase, alfa
bonus). El marc més ample és la **comptabilitat de triple entrada** i,
per a escala xarxa, el **pie cooperatiu de la Matriu**.

Aquest domini és el cor financer del projecte cooperatiu — però no com
es planteja a una escola de negocis convencional. Aquí, **cada hora
queda registrada al Ledger amb el seu multiplicador**, cada intangible
té el seu *Fair Market Value*, i el sistema premia qui arrisca abans.

## Per què aquí (i no abans)

Comptabilitzar valor sense **rols clars (D-02)** i sense **estructura
operativa (D-03)** és impossible: no saps a qui pertany cada hora. Una
vegada tens SOC i SOPs definits, però, el Slicing Pie esdevé directe:
**cada SOP executat per un rol genera slices al pie d'aquell rol**.

També és **anterior a D-05 (Agents IA)** perquè els agents han de tenir
preu/cost definits per al Ledger. Si el sistema comptable no està clar
abans d'introduir agents, l'eixam IA acaba comptabilitzat malament
(o no comptabilitzat del tot, que és pitjor).

## El recorregut (provisional)

Cinc competències previstes, totes en `draft`:

**C-04.1 · Aplicar Slicing Pie canonical.** Multiplicadors de risc de Moyer:
cash ×4, hores ×2, IP variable. Calcular slices d'una contribució real.

**C-04.2 · Calcular FMV per rol del teu projecte.** Quant val una hora del
rol "Mapejador VNA" del teu projecte? Catàleg sectorial + ajustaments.

**C-04.3 · Configurar el Slicing Pie Ledger a SOS.** Connectar SOC + SOPs
del D-03 al Ledger. Cada acció genera slices automàticament.

**C-04.4 · Aplicar phase multipliers.** Extensió SOS V11: pre-seed ×1.5,
MVP ×1.3, validation ×1.1, scale ×1.0, mature ×0.8. Per què premiem qui
arrisca abans.

**C-04.5 · Connectar amb el pie cooperatiu de la Matriu.** Com la teva
contribució individual al teu projecte es projecta al fons cooperatiu de la
xarxa de projectes. Comptabilitat de triple entrada. Auditabilitat.

## Connexió amb SOS

Suport tècnic al mòdul **Value Ledger** del swarm. Agents involucrats:

- **`@agent_token_economist`** — Calcula slices i suggereix optimitzacions
- **`@agent_fair_value_appraiser`** — Estima FMV per rol/sector
- **`@agent_phase_detector`** — Detecta canvi de fase del projecte

Les skill-seeds principals (pendents):

- `s-slicing-pie-calculator` — Calcula slices d'una contribució
- `s-fmv-by-role-lookup` — Consulta FMV sectorial per rol
- `s-ledger-validator` — Valida la integritat del Ledger

I els SOPs validats per la CoP Cap de finances coop (pendents).

## Sortides del domini

Quan completes el D-04, has produït:

- Slicing Pie Ledger configurat i operatiu
- FMV definit per cada rol del projecte
- Phase multiplier actual del projecte establert
- Connexió amb el pie cooperatiu de la Matriu (si aplicable)
- Procediment d'audit comptable trimestral

Aquests artefactes alimenten:

- **D-05** (perquè els agents IA tinguin cost calculat al Ledger)
- **D-06** (perquè els contractes reflecteixin la realitat del Slicing Pie)

---

*D-04 v0.1 · linear · status: draft · pendent revisió CoP Cap de finances coop*
