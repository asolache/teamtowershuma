---
id: sop-analitzar-balanc-tangible-intangible
type: sop
version: v0.1
status: draft
author: "@alvaro"

name: "Analitzar el balanç tangible/intangible de la xarxa"
purpose: >
  Procediment per diagnosticar la salut sistèmica del projecte basant-se
  en la proporció global tangible/intangible i la distribució per rol.
  Genera un balance report que serà input del càlcul de Health Score.

cop_ref: cop-mapejador-vna
applies_to:
  - competency: c-02.2-distinguish-tangible-intangible

effort_minutes: 30
steps_count: 4
---

# SOP · Analitzar el balanç tangible/intangible de la xarxa

## Objectiu

Detectar desequilibris sistèmics al projecte abans de calcular Health
Scores individuals. Una xarxa amb desequilibri global té patologies
estructurals que cap rol individual pot resoldre.

## Pre-requisits

- Transaccions classificades (sortida del sop-classificar-transaccions)
- Llista de rols validada

## Passos

1. **Càlculs globals**:
   - Total de transaccions tangibles
   - Total de transaccions intangibles
   - Ratio tangible/intangible
   - Range sa: 30-40% tangible, 60-70% intangible

2. **Càlculs per rol**:
   - Per cada rol, llista transaccions OUT (que dóna) i IN (que rep)
   - Per cada llista, calcula ratio tangible/intangible
   - Marca rols amb ratio out-in que divergeix >70% (desequilibri)

3. **Interpretació**:
   - Xarxa amb >50% tangible: **mercantil excessiu** (pot indicar
     erosió d'intangibles, dependència de contractes)
   - Xarxa amb <20% tangible: **subsidi excessiu** (pot indicar
     dependència de voluntariat, manca de captura de valor)
   - Rols amb desequilibri >70%: candidats a patologies estructurals

4. **Generar balance report** com a artefacte versionat amb:
   - Ratios globals
   - Llista de rols desequilibrats amb el tipus de desequilibri
   - 3-5 observacions sistèmiques (no diagnòstics individuals)

## Criteris d'èxit

- Balance report generat com a JSON estructurat
- Cada observació sistèmica té evidència del mapa (no és intuïció)
- El report no diagnostica patologies individuals (això és al
  sop-calcular-health-score)

## Errades a evitar

- **Voler que la ratio global sigui exactament 35/65**: no és una llei,
  és un ordre de magnitud
- **Confondre desequilibri amb patologia**: una empresa nova naturalment
  té més intangibles. Una de madura, més tangibles. El context importa.

---

*SOP v0.1 · status: draft · pendent ratificació CoP Mapejador VNA*
