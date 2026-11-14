---
id: sop-validar-mapa-amb-stakeholders
type: sop
version: v0.1
status: draft
author: "@alvaro"
last_modified: 2026-05-20

name: "Validar el mapa VNA amb stakeholders"
purpose: >
  Procés de validació final del mapa VNA abans de publicar-lo com a font
  de veritat del projecte. Detecta omissions, errors de tipificació i
  desequilibris no vists per la persona que ha fet el mapa.

applies_to:
  - competency: c-02.3-draw-vna-map
  - skill_seed: s-vna-map-validator

cop_ref: cop-mapejador-vna

steps_count: 6
estimated_time_min: 90

sos_context: critical
---

# SOP · Validar el mapa VNA amb stakeholders

## Quan utilitzar aquest SOP

Quan tens un primer borrador del mapa VNA al VNA Mapper i abans de declarar-lo "publicat" al teu projecte. La validació separa un mapa que reflecteix les hipòtesis del mapejador d'un que reflecteix la veritat de la xarxa.

**Mai s'utilitza un mapa no validat per a decisions de govern, repartiment d'equity, o disseny organitzatiu.**

## Pre-requisits

- Mapa VNA versió `draft` al VNA Mapper amb totes les transaccions ja classificades
- Llista de 3-5 stakeholders per a la sessió de validació, distribuïts:
  - Almenys 1 persona de **fora** del mapa (perspectiva externa)
  - Almenys 1 persona del mapa que **NO** ha estat entrevistada inicialment (perspectiva fresca)
  - Almenys 1 membre de la CoP Mapejador VNA (validació metodològica)
- Sala física o virtual amb visualització del mapa a pantalla compartida
- 90 minuts de calendari (60 de revisió + 30 d'iteració)

## Passos

### 1. Setup de la sessió (5 min)

Obre el VNA Mapper en mode presentació. **No expliquis el mapa**. Demana a un participant que el descrigui amb les seves paraules. Si la seva descripció no coincideix amb la teva intenció, ja tens el primer feedback: **el mapa no és prou clar**.

### 2. Walk-through pel mapejador (15 min)

Ara sí, presenta el mapa pas a pas. Per cada rol:

- Nom del rol (sense nom propi)
- Què representa al flux de valor
- Transaccions clau d'entrada i sortida

**Demana que prenguin notes silenciosament** durant la presentació. No interactiu encara. L'objectiu és que tothom vegi el mapa sencer abans de discutir-lo.

### 3. Pregunta de la pinya invisible (20 min)

> *"Quins intercanvis intangibles vitals NO veieu al mapa?"*

Aquesta és la pregunta clau. Els mapes en draft sempre tenen massa tangibles i pocs intangibles. **Els stakeholders coneixen els intangibles que el mapejador ha oblidat**.

Anota cada intangible identificat. Per cada un:

- D'on a on flueix?
- Quin entregable?
- Si no existís, qui ho notaria primer?

Si un intangible apareix als ulls de >2 stakeholders però no està al mapa, **és obligatori afegir-lo abans de tancar la sessió**.

### 4. Pregunta dels desequilibris (15 min)

> *"Veieu algun rol que dóna molt i rep poc, o al revés?"*

Aquesta pregunta sovint genera reaccions emocionals: els participants reconeixen patrons d'explotació o acaparament que abans no nomenaven. **Aquesta és una funció social del mapa**, no només analítica.

Anota cada desequilibri detectat. Distingeix entre:

- Desequilibris reals que cal corregir (problema d'estructura)
- Desequilibris aparents que es deuen a omissions al mapa (problema de modelatge)

### 5. Pregunta dels rols invisibles (10 min)

> *"Hi ha algun rol vital que cap dels nostres entrevistats ha esmentat però que ja sabem que existeix?"*

Sovint detecta:

- Rols externs (proveïdor habitual, mentor extern, advocat consultiu)
- Rols ceremonials (presidents d'associacions a què pertany l'organització)
- Rols pels quals tothom dóna per fets (manteniment d'oficines, suport tècnic IT)

### 6. Iteració i tancament (25 min)

Al VNA Mapper directament, davant dels stakeholders:

- Afegeix els intangibles detectats
- Reclassifica les transaccions amb errors
- Renomena rols si la nomenclatura genera confusió
- Marca els desequilibris reals amb una etiqueta `flag: imbalance` per a la C-01.4

Al final, **demana a un stakeholder diferent del de la passa 1** que torni a descriure el mapa amb les seves paraules. Si ara la descripció coincideix amb la intenció del mapejador i amb el que han discutit els altres, **el mapa està validat**.

Canvia l'estat del mapa a `review` al VNA Mapper. Encara no és `approved-by-cop`: això requereix una sessió específica amb la CoP Mapejador VNA, no només amb stakeholders del projecte.

## Indicadors d'èxit

- S'han afegit ≥3 intangibles que no estaven al draft inicial
- S'han detectat ≥1 desequilibri que el mapejador no havia vist
- La descripció final per part d'un participant nou coincideix amb la intenció del mapejador
- Cap participant surt amb la sensació "el meu rol no és reconegut"

## Errors comuns

| Error | Conseqüència | Correcció |
|---|---|---|
| Mapejador defensa el mapa en lloc d'escoltar | Es perd l'oportunitat de validació | "El mapa està viu, jo estic aquí per aprendre" |
| Tots els stakeholders són del mateix grup (tots executius, p. ex.) | Cobertura parcial | Forçar diversitat al pas pre-requisits |
| Saltar la pregunta de la pinya invisible | Mapa queda transaccional | És obligatòria, sempre |
| No iterar al VNA Mapper en directe | Els canvis es perden | Sempre en pantalla compartida, modificacions en directe |
| Marcar com `approved-by-cop` només amb stakeholders | Confusió amb la validació metodològica | `approved-by-cop` requereix sessió específica amb la CoP |

## Notes per a la CoP Mapejador VNA

Aquest SOP genera dades valuoses per a la CoP:

- Quins tipus d'intangibles s'obliden més sovint (pacificadors, connectors...)?
- Quines indústries tenen patrons de desequilibri característics?
- Quins formats de pregunta funcionen millor en quins contextos?

La CoP refina aquest SOP iterativament basant-se en aquestes dades. Cada nova versió ha de tenir el changelog explícit al frontmatter.

---

*SOP v0.1 · pilot · pendent ratificació per CoP Mapejador VNA*
