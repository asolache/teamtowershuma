---
id: sop-experiment-de-conversio
type: sop
version: v0.1
status: draft
author: "@alvaro"

name: "Dissenyar i executar el primer experiment de conversió"
purpose: >
  Procediment per transformar una oportunitat de conversió de l'inventari
  en un experiment real de 4 setmanes amb hipòtesi mesurable, mètriques
  d'èxit i protocol de decisió post-experiment.

cop_ref: cop-mapejador-vna
applies_to:
  - competency: c-02.5-convert-value-flows

effort_minutes: 120
steps_count: 7
---

# SOP · Dissenyar i executar el primer experiment de conversió

## Objectiu

Convertir una hipòtesi de conversió en un experiment validable en
4 setmanes amb cost acotat, output observable i criteri clar
d'èxit/fracàs/pivot.

## Pre-requisits

- value_conversion_inventory amb mínim 1 oportunitat sostenible/mixta
- Conversa prèvia amb la CoP per seleccionar la primera oportunitat
- Pressupost acotat: màxim 40 hores humanes + costos directes <500€

## Passos

1. **Seleccionar 1 oportunitat** (mai 2-3 alhora). Criteris:
   - Sostenible o mixta sota condicions identificables
   - Pot validar-se en 4 setmanes
   - Cost màxim definit i acotat

2. **Invocar s-conversion-impact-estimator** per projectar impacte a la
   xarxa. Si risk_level surt **critical**, no avancis: torna a inventari
   o consulta amb la CoP.

3. **Formular hipòtesi mesurable**: format "Si fem X, esperem que
   passi Y en 4 setmanes, mesurat per Z".
   - X: acció concreta
   - Y: resultat esperat (no abstracte: "vendre 5 entrades a workshop")
   - Z: indicador objectiu

4. **Disseny d'experiment minimalista**:
   - **Setmana 1**: preparació (producte/missatge/canal)
   - **Setmana 2-3**: execució amb stakeholders del mapa
   - **Setmana 4**: mesura, anàlisi, decisió
   - Cap d'aquestes setmanes hauria d'absorbir més de 10 hores

5. **Definir el criteri de decisió** abans d'iniciar:
   - Èxit: Y assolit o superat → escala
   - Pivot parcial: Y entre 50-99% → ajusta i torna a provar
   - Fracàs: Y <50% → tornar a inventari, no insistir en aquesta
     oportunitat

6. **Executar i mesurar amb honestedat**: registra cada mètrica el mateix
   dia. Sense ajustar la hipòtesi a posteriori per "salvar" l'experiment.

7. **Decisió post-experiment** amb la CoP:
   - Què hem après del projecte (no només de la conversió específica)?
   - Què passa amb la xarxa intangible original (s'ha reforçat? S'ha
     erosionat?)?
   - Pròxim pas: escalar, pivotar, o tornar a inventari?

## Criteris d'èxit

- Experiment executat en ≤4 setmanes
- Mètriques registrades amb honestedat
- Decisió post-experiment documentada i compartida amb la CoP
- **Independentment del resultat**, el projecte ha après alguna cosa nova
  sobre la seva xarxa de valor

## Errades a evitar

- **Iniciar sense criteri de fracàs**: garanteix que insistiràs en una
  cosa que no funciona
- **Ajustar hipòtesi a meitat de l'experiment**: és reset, no ajust
- **Escalar abans de mesurar**: si funciona la setmana 2, no és senyal
  d'escalar — és senyal d'esperar a setmana 4 i confirmar
- **No mesurar l'efecte a la xarxa intangible**: tot l'experiment es
  pot semblar exitós mentre erosiona el que fa que el projecte tingui
  valor

---

*SOP v0.1 · status: draft · pendent ratificació CoP Mapejador VNA*
