---
id: sop-entrevistar-per-rols
type: sop
version: v0.1
status: draft
author: "@alvaro"
last_modified: 2026-05-20

name: "Entrevistar per identificar rols VNA"
purpose: >
  Estructura d'entrevista de 30 minuts que produeix les transcripcions
  necessàries per extreure rols VNA candidats d'una persona de l'organització.

applies_to:
  - competency: c-02.1-identify-vna-roles
  - skill_seed: s-vna-role-extractor

cop_ref: cop-mapejador-vna

steps_count: 7
estimated_time_min: 45

sos_context: critical
---

# SOP · Entrevistar per identificar rols VNA

## Quan utilitzar aquest SOP

Quan necessites cartografiar els rols VNA reals d'una organització i tens accés a les persones (no només a la documentació). Fes-ho **abans** de dibuixar cap mapa: el mapa és conseqüència de les entrevistes, no al revés.

## Pre-requisits

- Llista de persones a entrevistar (mínim 5, idealment 60-80% de l'organització)
- Acord explícit que les transcripcions seran anonimitzades i tractades amb confidencialitat
- 45 minuts disponibles per persona (30 d'entrevista + 15 de presa de notes)
- Un dispositiu per gravar o un mètode d'anotació ràpida
- L'SOP `sop-validar-rols-amb-stakeholders` preparat per al pas final

## Passos

### 1. Preparació de l'entorn (5 min)

Lloc neutral, sense interrupcions. **No al despatx del cap**. Cafè o aigua si l'entrevistat ho vol. Explica:

- Per què fas l'entrevista (mapejar la xarxa de valor real, no avaluar)
- Què faràs amb la transcripció (anonimitzar-la, treure'n rols, validar-los amb stakeholders)
- Que res del que diguin tindrà repercussió en el seu lloc de treball

**Demana consentiment per gravar.** Si refusa, pren notes amb pseudònim.

### 2. Pregunta inicial — el contracte (3 min)

> *"Si haguessis de descriure'm el teu lloc de treball formal, tal com posa al contracte, què em diries?"*

Aquesta pregunta serveix per **establir el contrast** entre el càrrec i el rol VNA. Les seves respostes són **el que NO ens interessa**. Però apuntar-ho és imprescindible.

### 3. La pregunta màgica (15 min)

> *"Si demà no véns, què passa? Què deixa de funcionar a l'organització?"*

Deixa que parli lliurement. **No interrompis**. Si calla, espera 10 segons abans de fer una sub-pregunta. Si s'estanca, prova amb:

- *"Què t'ha trucat l'últim cop algú a urgència?"*
- *"Hi ha alguna cosa que fas i que ningú més de l'organització saps fer?"*
- *"Hi ha alguna cosa que has agafat informalment, no perquè et tocava?"*

L'objectiu no és tenir una llista exhaustiva ara mateix — és que la persona vegi la seva pròpia aportació amb ulls nous.

### 4. La pregunta dels intangibles (5 min)

Específica per a captar el que no es veu al organigrama:

> *"Qui et truca per coses que no estan al teu contracte?"*

I com a follow-up:

> *"Què esperen que els donis quan et truquen?"*

Sovint és aquí on apareixen els rols intangibles més valuosos: pacificadores, connectores, cuidadores, traductores.

### 5. Tancament i recollida de pistes (2 min)

> *"Si la teva feina desaparegués, què recomanaries que algú nou aprengués primer?"*

I:

> *"Hi ha alguna persona de l'organització que, segons tu, fa coses que ningú reconeix prou?"*

Aquesta segona pregunta sovint dóna pistes per a entrevistes futures — persones a qui altres han identificat com a "treballadores invisibles".

### 6. Transcripció (15 min)

Just després de l'entrevista (no més tard de 24 hores), transcriu:

- Convertir gravació en text (Whisper ho fa raonablement bé en català)
- Anonimitzar: substituir nom propis per `P{NN}` (P01, P02...)
- Pulir només errors de transcripció evidents, no canviar paraules
- Guardar a `interviews/raw/P{NN}.txt`

### 7. Lliurament a la skill-seed (1 min)

Llegir la transcripció amb la skill `s-vna-role-extractor` per obtenir candidats. Després passar la sortida al SOP `sop-validar-rols-amb-stakeholders`.

## Indicadors d'èxit

- L'entrevistat ha parlat el 70%+ del temps
- La pregunta màgica ha generat almenys 4 respostes diferents
- Apareix com a mínim un rol intangible no documentat
- L'entrevistat surt amb una mirada nova sobre el seu paper

## Errors comuns

| Error | Conseqüència | Correcció |
|---|---|---|
| Fer l'entrevista al despatx del cap | Respostes filtrades, només contracte | Espai neutral |
| Interrompre per validar o repetir | Talla el flux de descobriment | Esperar silencis llargs |
| Tractar "què fas?" com a equivalent a "què passa si demà no véns?" | Resposta = càrrec, no rol | Repetir la pregunta original |
| Saltar el pas de tancament | Perdem pistes per a entrevistes futures | Sempre fer les dues preguntes finals |
| Transcriure dies després | Es perden matisos no verbals que el cervell encara recordaria | Transcriure dins de 24h |

## Notes ètiques

- Les transcripcions no es comparteixen amb terceres parts ni amb la direcció directament
- Els rols VNA finals **mai porten el nom propi** de la persona que ho va dir
- Si l'entrevistat menciona una situació conflictiva amb un altre membre de l'organització, **no es transcriu**: es para la gravació, es prenen notes mentals i s'aborda després via un altre canal apropiat

---

*SOP v0.1 · pilot · pendent ratificació per CoP Mapejador VNA*
