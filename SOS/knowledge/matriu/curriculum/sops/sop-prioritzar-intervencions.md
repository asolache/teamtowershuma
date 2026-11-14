---
id: sop-prioritzar-intervencions
type: sop
version: v0.1
status: draft
author: "@alvaro"

name: "Prioritzar intervencions sobre rols patològics"
purpose: >
  Procediment per generar la llista de propostes d'intervenció a partir
  del role_health_report, ordenades per impacte sistèmic i viabilitat,
  per executar-les en cicles d'iteració amb la CoP.

cop_ref: cop-mapejador-vna
applies_to:
  - competency: c-02.4-analyze-role-health

effort_minutes: 90
steps_count: 6
---

# SOP · Prioritzar intervencions sobre rols patològics

## Objectiu

Convertir el diagnòstic (role_health_report) en pla d'acció executable,
amb intervencions concretes, criteris d'èxit i ordre d'execució.

## Pre-requisits

- role_health_report publicat (output del sop-calcular-health-score)
- Conversa prèvia amb la CoP sobre els rols urgent

## Passos

1. **Per cada rol amb score <70**, escriu una **proposta d'intervenció**:
   - Patologia objectiu (de la llista de 6 + emergents)
   - Hipòtesi: si fem X, esperem que el score passi de A a B
   - Acció concreta (no abstracta): "redistribuir la transacció Y del
     rol Z al rol W"
   - **Evidència del mapa** que justifica la intervenció

2. **Estima impacte i esforç**:
   - Impacte: a quants rols afecta? Quina millora projectada al score
     global de la xarxa?
   - Esforç: hores humanes + dies-calendari
   - Risc: pot trencar alguna cosa? Quins efectes secundaris?

3. **Calcula prioritat** per cada intervenció:
   - Prioritat = (Impacte × Urgència) / (Esforç × Risc)
   - Ordena de major a menor

4. **Selecciona les 3 intervencions top**: no més. Una colla pot
   absorbir 2-3 intervencions estructurals alhora. Més és recepta
   per a fracàs.

5. **Per cada intervenció seleccionada, escriu el criteri d'èxit**:
   - Què mesurarem (1-2 indicadors observables)
   - Quan ho mesurarem (4 setmanes, 8 setmanes...)
   - Quan decidirem si la intervenció va bé, malament o cal pivotar

6. **Documentar al `intervention_proposals.json`** i compartir amb la
   CoP per ratificació final abans d'executar.

## Criteris d'èxit

- 3 intervencions top documentades amb tot el detall
- Cada una té evidència del mapa, hipòtesi, criteris d'èxit, calendari
- La CoP ha ratificat la priorització abans d'iniciar

## Errades a evitar

- **Voler intervenir tots els rols urgent alhora**: la xarxa no pot
  absorbir tantes pertorbacions simultànies
- **Intervencions sense criteri de mesura**: queden com a propostes
  vagues que ningú avalua i acaben oblidades
- **Saltar la ratificació de la CoP**: una intervenció no validada per
  la CoP és iniciativa unilateral, no canvi sistèmic

---

*SOP v0.1 · status: draft · pendent ratificació CoP Mapejador VNA*
