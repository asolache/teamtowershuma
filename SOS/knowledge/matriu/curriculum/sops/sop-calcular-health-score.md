---
id: sop-calcular-health-score
type: sop
version: v0.1
status: draft
author: "@alvaro"

name: "Calcular Health Score de cada rol"
purpose: >
  Procediment per aplicar la fórmula canonical de Health Score VNA a
  cada rol del mapa, generar el role_health_report i emetre el diagnòstic
  estructural del projecte.

cop_ref: cop-mapejador-vna
applies_to:
  - competency: c-02.4-analyze-role-health

effort_minutes: 75
steps_count: 5
---

# SOP · Calcular Health Score de cada rol

## Objectiu

Produir un report estructurat de la salut de cada rol del mapa VNA, amb
score (0-100), severity, propietats que fallen, patologies detectades
i evidència del mapa.

## Pre-requisits

- Mapa VNA validat (output del sop-validar-mapa-amb-stakeholders)
- Balance report (output del sop-analitzar-balanc-tangible-intangible)

## Passos

1. **Invocar s-vna-health-analyzer** sobre el mapa validat. Genera primer
   report amb scores i diagnòstics canonical.

2. **Invocar s-pathology-detector** per detectar patologies emergents
   no canonical. Afegeix-les al report (marcades amb flag
   `requires_cop_validation: true`).

3. **Revisió humana per rol amb severity urgent (<40)**:
   - Llegeix l'evidència del mapa
   - Confirma que el diagnòstic és correcte
   - Si discrepes, anota el dissens al report (no elimines la diagnosi
     automàtica, sí afegeixes la teva)

4. **Conversa amb la CoP Mapejador VNA** sobre:
   - Rols urgent: cal intervenció ràpida?
   - Patologies emergents: incorporar-les al catàleg de la CoP?
   - Patrons creuats: 3+ rols amb la mateixa patologia indica problema
     sistèmic, no individual

5. **Publicar role_health_report** com a artefacte versionat amb:
   - Score per rol
   - Patologies (canonical + emergents)
   - Notes humanes als urgent
   - Llista de rols a prioritzar per a intervenció (input del SOP següent)

## Criteris d'èxit

- Tots els rols del mapa tenen score calculat
- Els rols urgent tenen revisió humana documentada
- Patologies emergents estan marcades per validació de CoP

## Errades a evitar

- **Fiar-se 100% del càlcul automàtic**: la IA pot capturar patrons
  però no entén el context. Per als casos critical, sempre revisió humana.
- **Treure rols del mapa per "millorar" els scores**: és un anti-patró.
  Si elimines un rol patològic, perds el diagnòstic.
- **Voler intervenir tot a la vegada**: prioritza 1-2 rols urgent i
  ataca'ls bé abans de passar als següents.

---

*SOP v0.1 · status: draft · pendent ratificació CoP Mapejador VNA*
