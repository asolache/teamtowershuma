---
id: d02-value-mapping
type: domain
mode: linear
version: v0.1
status: draft
author: "@alvaro"

name: "Mapejar el valor (VNA)"
subtitle: "Llenguatge fundacional · roles, transaccions, deliverables"
objective: >
  El cursant sap modelar la xarxa real d'intercanvis del seu projecte
  segons la metodologia Value Network Analysis de Verna Allee, i
  analitzar la salut estructural de cada rol.

competencies:
  - c-02.1-identify-vna-roles
  - c-02.2-distinguish-tangible-intangible
  - c-02.3-draw-vna-map
  - c-02.4-analyze-role-health
  - c-02.5-convert-value-flows
competencies_planned: 5
competencies_drafted: 5

cop_ref: cop-mapejador-vna
sos_module: "VNA Mapper"

prerequisites:
  - d01-project-definition
unlocks:
  - d03-team-structure
  - d04-value-accounting

sos_context: critical
keywords:
  - VNA
  - Verna Allee
  - value network analysis
  - rols
  - transaccions tangibles
  - transaccions intangibles
  - entregables
  - health score
  - conversió de valor

references:
  - "Verna Allee (2008) · Value Network Analysis and value conversion of tangible and intangible assets · Journal of Intellectual Capital Vol.9 No.1 pp.5-24"
  - "knowledge/vision/vna-principles.md (SOS V11)"
---

# D-02 · Mapejar el valor (VNA)

## El que aprens

Aprens a mirar el teu projecte i veure-hi **la xarxa real d'intercanvis** que
el farà funcionar — no l'organigrama oficial, no el business plan, no la
landing. La xarxa real.

El mètode és el **Value Network Analysis** (VNA) de Verna Allee, publicat el
2008 al *Journal of Intellectual Capital*. És el llenguatge fundacional del
cicle: tots els dominis que vénen després (D-03 a D-08) s'expressen amb el
vocabulari que aquí aprens.

## Per què aquí (i no abans)

El VNA és **una lent**, no la cosa. La cosa és el projecte. Si comences pel
VNA sense projecte definit, estàs aprenent una eina sense context, com
estudiar microscopi sense mostres.

Un cop ja tens el projecte definit (D-01) — saps quin dolor resols i a qui —
el VNA t'ajuda a entendre com **fluirà el valor** dins i fora d'aquest projecte
concret. Abans del projecte, el VNA és abstracció. Després del projecte,
és **la lent que el fa intel·ligible**.

És el primer pas que produeix un artefacte tècnic durador: el **mapa VNA del
teu projecte**. Aquest mapa serà la *font de veritat* per tot el que ve
després — SOCs, Slicing Pie, Work Orders, contractes, comunicació.

## El recorregut (provisional)

Cinc competències previstes, **3 amb pilot** (de la versió anterior del
currículum, ara revisades per encaixar amb el nou D-01):

**C-02.1 · Identificar rols VNA (no càrrecs).** El primer salt cognitiu:
deixar de pensar en càrrecs i començar a pensar en activitats al flux de
valor. Sense això, tot el que segueix no funciona.

**C-02.2 · Distingir transaccions tangibles vs intangibles.** El segon
vocabulari clau: una transacció pot ser contractual (factura, ingrés) o
informal (informació, favor, consell).

**C-02.3 · Dibuixar el mapa VNA del projecte.** Posar-ho tot junt: el graf
complet. Sense node central. El valor és una propietat emergent de la
xarxa sencera.

**C-02.4 · Analitzar la salut d'un rol (Health Score).** Tens el mapa: ara saps
llegir-lo. Quin rol està sobrecarregat? Quin està desconnectat? Quin rep
intangibles sense retornar-ne?

**C-02.5 · Convertir un input intangible en output tangible.** La competència
més difícil i la més rendible. *La pericia professional (intangible) es
transforma en consultoria (tangible)*.

## Connexió amb SOS

Suport tècnic al mòdul **VNA Mapper**, accessible des de `/SOS/map`. Agents
involucrats:

- **`@agent_dharma_ontologist`** — Categoritza rols i transaccions d'entrevistes
- **`@agent_genesis_architect`** — Sintetitza el mapa des dels fragments
- **`@agent_synaptic_weaver`** — Suggereix conversions de valor possibles

Les skill-seeds principals:

- `s-vna-role-extractor` — Extreu rols candidats d'entrevistes transcrites
- `s-transaction-classifier` — Classifica transaccions tangible/intangible

I els SOPs validats per la CoP Mapejador VNA:

- `sop-entrevistar-per-rols` — Estructura de les entrevistes inicials
- `sop-validar-mapa-amb-stakeholders` — Procés de validació abans de publicar

## Sortides del domini

Quan completes el D-02, has produït:

- Llista validada de rols VNA del projecte
- Mapa VNA publicat (`.json` consumible per `VnaMapRenderer.js`)
- Anàlisi de salut estructural amb almenys un cas per rol crític
- Almenys una proposta de conversió de valor (intangible → tangible)

I aquests artefactes alimenten directament:

- **D-03** (per dissenyar SOCs i SOPs sobre els rols identificats)
- **D-04** (per assignar Slicing Pie als rols, no als càrrecs)
- **D-09** (per identificar les CoPs segons els rols que jugues)

---

*D-02 v0.1 · linear · status: draft · pendent revisió CoP Mapejador VNA*
*Nota: aquest era el D-01 a la versió anterior del currículum. Renumerat
i ajustat perquè el projecte ja existeixi quan s'arriba aquí.*
