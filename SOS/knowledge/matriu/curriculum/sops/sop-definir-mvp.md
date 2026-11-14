---
id: sop-definir-mvp
type: sop
version: v0.1
status: draft
author: "@alvaro"

name: "Definir el primer artefacte mínim viable"
purpose: >
  Procediment per generar i seleccionar la primera opció d'MVP del
  projecte, amb spec d'1 pàgina (calendari, pressupost, mètrica
  d'èxit/fracàs) abans de començar la construcció.

cop_ref: cop-iniciador-de-projectes
applies_to:
  - competency: c-01.4-define-mvp

effort_minutes: 90
steps_count: 6
---

# SOP · Definir el primer artefacte mínim viable

## Objectiu

Produir el `mvp_spec` d'1 pàgina amb: descripció en 1 frase, calendari
de 4 setmanes, pressupost màxim, hipòtesi en format "Si... llavors..."
i mètriques d'èxit/fracàs.

## Pre-requisits

- Dolor articulat i quantificat (C-01.1)
- Stakeholders prioritaris identificats (C-01.2)
- Propòsit validat (C-01.3)

## Passos

1. **Generar opcions** amb s-mvp-scoper: 3-5 candidats variats.

2. **Per cada opció, avaluar 4 dimensions** (1-5):
   - Construible en 4 setmanes
   - Cost acotat (<2.000€)
   - Mesurable amb mètrica clara
   - Significatiu (si fracassa, hem aprés alguna cosa rellevant)

3. **Tria l'opció amb major suma**. **NO triïs per la que sigui més
   impressionant.**

4. **Formular hipòtesi** amb s-mvp-hypothesis-formulator: format
   estricte "Si X, llavors Y dins de Z" amb thresholds d'èxit/fracàs.

5. **Escriure mvp_spec** d'1 pàgina:
   - 1 frase de descripció
   - Públic objectiu (concret)
   - Calendari (data inici, data entrega)
   - Pressupost màxim
   - Hipòtesi i mètriques
   - Criteri d'èxit / fracàs / pivot

6. **Reset amb CoP** abans de començar a construir.

## Criteris d'èxit

- MVP construible en ≤4 setmanes amb ≤80h humanes
- Hipòtesi que pot fracassar visiblement
- CoP ha validat l'spec

## Errades a evitar

- **MVP de 6 mesos**: és producte, no MVP
- **Hipòtesi que sempre "va bé"**: no aprendreu res
- **Sense criteri de fracàs**: insistireu en una cosa que no funciona

---

*SOP v0.1 · status: draft · pendent ratificació CoP Iniciador de projectes*
