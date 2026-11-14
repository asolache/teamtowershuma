---
id: sop-inventari-conversions
type: sop
version: v0.1
status: draft
author: "@alvaro"

name: "Inventariar oportunitats de conversió de valor"
purpose: >
  Procediment per identificar sistemàticament totes les oportunitats
  de conversió intangible→tangible al projecte, categoritzar-les
  (sostenible/extractiva/mixta) i preparar el terreny per a la selecció
  de la primera oportunitat a experimentar.

cop_ref: cop-mapejador-vna
applies_to:
  - competency: c-02.5-convert-value-flows

effort_minutes: 60
steps_count: 5
---

# SOP · Inventariar oportunitats de conversió de valor

## Objectiu

Generar el `value_conversion_inventory.json`: catàleg complet
d'oportunitats de conversió al projecte, amb categorització de
sostenibilitat per a cada una.

## Pre-requisits

- Mapa VNA validat
- role_health_report publicat
- (Opcional) Coneixement sectorial sobre què es paga al mercat

## Passos

1. **Invocar s-value-conversion-finder** sobre el mapa i el health
   report. Genera primer inventari amb les 5 conversions clàssiques +
   emergents.

2. **Revisió crítica per categoria**:
   - **Sostenibles**: revisar si la projecció és realista. *La
     consultoria reforça la xarxa només si manté hores no facturables
     per a generació d'intangibles nous.*
   - **Extractives**: no eliminar-les de l'inventari! Documenten què
     **no** s'ha de fer. Visible = decidible.
   - **Mixtes**: identificar les condicions sota les quals serien
     sostenibles o extractives

3. **Buscar la conversió emergent (la 6a)** del projecte:
   - Quins intangibles del mapa, en combinació, generen valor que no
     existeix avui al mercat?
   - **Aquesta sol ser la conversió de major valor diferencial**
   - Si no en trobes cap, el projecte té poc valor diferencial — pensa-ho

4. **Per cada oportunitat sostenible o mixta**, omple el camp
   `first_experiment`: experiment de 4 setmanes que validaria viabilitat
   sense compromís llarg

5. **Documentar** l'inventari complet, amb categoria, rationale i
   experiment de cada oportunitat. Inclou les extractives amb el flag
   `do_not_pursue: true` i la raó.

## Criteris d'èxit

- Mínim 3 oportunitats al catàleg
- Almenys 1 oportunitat sostenible viable
- Almenys 1 conversió emergent identificada (si no, alerta de baix
  valor diferencial)
- Cada oportunitat té rationale i experiment

## Errades a evitar

- **Inventari només d'oportunitats sostenibles**: amagaràs riscos del
  projecte, no els resoldràs
- **Voler categoritzar amb certesa absoluta**: les "mixtes" són la
  majoria. Acceptar la incertesa és part de la maduresa estratègica
- **Saltar la 6a conversió per pressa**: pot ser la més important;
  perdre-la per pressa és car

---

*SOP v0.1 · status: draft · pendent ratificació CoP Mapejador VNA*
