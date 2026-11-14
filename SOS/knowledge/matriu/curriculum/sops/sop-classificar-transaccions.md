---
id: sop-classificar-transaccions
type: sop
version: v0.1
status: draft
author: "@alvaro"

name: "Classificar transaccions tangible vs intangible"
purpose: >
  Procediment per classificar cada transacció identificada al projecte
  com a tangible (contractual, mesurable) o intangible (informal,
  basada en confiança o coneixement). Inclou criteri d'arbitratge per
  als casos ambigus.

cop_ref: cop-mapejador-vna
applies_to:
  - competency: c-02.2-distinguish-tangible-intangible

effort_minutes: 45
steps_count: 5
---

# SOP · Classificar transaccions tangible vs intangible

## Objectiu

Garantir que la classificació de transaccions del mapa VNA segueix
criteris consistents, no intuïtius. Un mapa amb classificació
inconsistent produeix anàlisis errades.

## Pre-requisits

- Llista de transaccions identificades (output del mapeig inicial)
- Llista de rols VNA validada (output de sop-validar-rols-amb-stakeholders)

## Passos

1. **Aplicar el criteri base** (no físic, sinó contractual):
   - TANGIBLE: hi ha factura, contracte, ingrés o intercanvi mesurable
     en €/hores/unitats?
   - INTANGIBLE: és informació, favor, consell, reputació, accés,
     connexió, suport emocional?

2. **Per als casos ambigus**, aplica el test del trencament:
   - *"Si demà aquesta transacció desaparegués, com es notaria?"*
   - Pèrdua quantificable immediata: tangible
   - Erosió lenta de relació o reputació: intangible
   - **Els dos efectes alhora**: classifica com a MIXTA (registra al mapa)

3. **Identificar les "falses tangibles"** — transaccions amb aparença
   contractual però essència intangible:
   - Clàusula d'un contracte que no es complirà (signada per simbolisme)
   - Factura simbòlica entre socis (entre 1€ i 100€) on el valor real
     és confiança
   - Aquestes són **intangibles disfressades de tangibles**

4. **Identificar les "falses intangibles"** — transaccions aparentment
   informals però amb pes contractual implícit:
   - Cessió d'ús implícita (sense paper però vinculant per costum)
   - Recomanació formal entre professionals (genera obligacions de
     reciprocitat)

5. **Documentar la classificació** al JSON de transaccions amb camp
   `classification_rationale` que justifica casos no obvis.

## Criteris d'èxit

- Cada transacció té classificació (mai null)
- Casos no obvis tenen `classification_rationale` documentat
- Les "falses tangibles" i "falses intangibles" estan etiquetades

## Errades a evitar

- **Classificar tot com a tangible** (món del business plan): pèrdues
  el 70% del valor que sosté el projecte
- **Classificar tot com a intangible** (món cooperativista naïf): pèrdues
  la mesurabilitat del Slicing Pie
- **No documentar el rationale**: un altre validador no podrà entendre
  per què vas classificar X com a tangible si no està explicat

---

*SOP v0.1 · status: draft · pendent ratificació CoP Mapejador VNA*
