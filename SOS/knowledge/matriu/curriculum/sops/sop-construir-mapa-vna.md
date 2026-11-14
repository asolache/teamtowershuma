---
id: sop-construir-mapa-vna
type: sop
version: v0.1
status: draft
author: "@alvaro"

name: "Construir el mapa VNA del projecte"
purpose: >
  Procediment per sintetitzar els outputs de les skill-seeds anteriors
  (rols, mapeig persona-rol, transaccions classificades) en un mapa
  VNA complet i consistent, en format consumible per VnaMapRenderer.

cop_ref: cop-mapejador-vna
applies_to:
  - competency: c-02.3-draw-vna-map

effort_minutes: 90
steps_count: 6
---

# SOP · Construir el mapa VNA del projecte

## Objectiu

Produir el primer artefacte estable del D-02: un mapa VNA del projecte
en JSON consumible per `VnaMapRenderer.js` de SOS V11, validable pels
stakeholders i utilitzable com a font de veritat per als dominis
següents (D-03, D-04, D-09).

## Pre-requisits

- Llista de rols validada
- Mapeig persona-rol
- Transaccions classificades
- Balance report (resultat del SOP anterior)

## Passos

1. **Invocar s-vna-map-builder** amb tots els inputs anteriors. Genera
   primer esborrany del mapa.

2. **Verificació tècnica**:
   - Tots els nodes són rols (no persones) — *si trobes un node persona,
     és error d'execució*
   - Totes les edges tenen `from`, `to` i `transaction_type`
   - No hi ha rols sense cap connexió (orphan a nivell tècnic — sí pot
     ser-ho a nivell sistèmic, però cal validar)
   - El JSON valida amb el schema de VnaMapRenderer

3. **Lectura visual**:
   - Carrega el JSON a la PaperView/VnaMapView
   - Mira el mapa: hi ha un node central excessiu? Hi ha clusters
     desconnectats?
   - Si l'estructura visual sembla "estranya", probablement reflecteix
     una realitat sistèmica del projecte (no és bug, és feature)

4. **Captura de pantalla i conversa amb la CoP** sobre el primer cop d'ull:
   - "Què veus tu?"
   - "Què t'estranya?"
   - "Què esperaves que aparegués i no hi és?"

5. **Ajustos previs a validació** amb stakeholders (només per a errors
   tècnics, no per a interpretacions; les interpretacions van a la
   validació, no als ajustos previs).

6. **Marcar com a esborrany v0** i passar al sop-validar-mapa-amb-stakeholders.

## Criteris d'èxit

- Mapa JSON estructuralment vàlid
- Captura visual revisada per ≥1 membre de la CoP
- Documentat el rationale d'estructures "estranyes" (no eliminades)

## Errades a evitar

- **Ajustar el mapa abans de validar-lo amb stakeholders**: introduiràs
  el teu sesg sense saber-ho
- **Eliminar rols orphan automàticament**: pot ser un rol invisible
  important. Demana validació
- **Inventar transaccions per "tapar buits"**: si la xarxa té forats,
  el mapa els ha de mostrar — això és diagnòstic, no defecte

---

*SOP v0.1 · status: draft · pendent ratificació CoP Mapejador VNA*
