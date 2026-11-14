---
id: s-life-thread-finder
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Life Thread Finder"
purpose: >
  Donada una autobiografia professional/personal del cursant (en text
  lliure) i el projecte, identifica el fil conductor: la pregunta o el
  tema que recórrer la seva trajectòria i que aquest projecte és la
  pròxima resposta. Genera l'argumentari "per què aquest projecte és
  la continuació natural" amb evidència biogràfica.

competency_refs:
  - c-01.5-connect-deep-motivation

agent_ref: "@agent_purpose_distiller"

input_schema:
  type: object
  required:
    - autobiography
    - current_project
  properties:
    autobiography:
      type: string
      description: "Narrativa professional i personal en text lliure"
    current_project:
      type: string

output_schema:
  type: object
  required:
    - life_thread
    - biographical_evidence
    - continuity_argument
  properties:
    life_thread:
      type: string
      description: "1-2 frases identificant la pregunta o tema central"
    biographical_evidence:
      type: array
      items:
        type: object
        required: [moment, year, connection_to_thread]
    continuity_argument:
      type: string
      description: "Per què aquest projecte és la continuació natural"

context_tokens: 1500
dependencies: []

sos_context: critical
---

# Life Thread Finder

## Què fa

Llegeix l'autobiografia del cursant (història professional + personal,
escrita en text lliure) i identifica el **fil conductor**: la pregunta
o tema que recorre la trajectòria. Connecta el projecte actual amb
aquest fil, mostrant per què aquest projecte és la continuació natural
i no un canvi aleatori de direcció.

És la skill que **converteix biografia en argumentari**.

## Quan invocar-la

- Després que el cursant hagi escrit l'autobiografia lliurement (1-3
  pàgines)
- Per donar suport a l'argumentari "per què tu" del C-01.3 i
  l'exercici personal de C-01.5
- **NO** abans d'escriure l'autobiografia: la skill no la genera, la
  llegeix

## Prompt nucli

```
Ets analista narratiu. Llegeix aquesta autobiografia i el projecte
actual. La teva tasca: trobar el FIL CONDUCTOR que recórrer la
trajectòria del cursant.

PROCÉS:
1. LIFE_THREAD: identifica en 1-2 frases la pregunta o tema central
   que apareix repetidament a la història. Format possible:
   "Per què X?" o "Com aconseguir Y?" o "Com resoldre el conflicte
   entre Z i W?"
   
   Si no detectes un fil clar, dis-ho honestament — pot ser que el
   cursant encara no l'hagi articulat bé.

2. BIOGRAPHICAL_EVIDENCE: 3-5 moments concrets de la història on el
   fil apareix:
   - Moment: descripció breu
   - Year: any aproximat
   - Connection_to_thread: com aquest moment encarna el fil

3. CONTINUITY_ARGUMENT: 1 paràgraf explicant per què aquest projecte
   actual és la continuació natural del fil. NO afalagar — argumentar.

REGLES:
- No inventis moments biogràfics: només cites el que estigui a
  l'autobiografia
- Si el fil que detectes NO connecta amb el projecte actual, dis-ho:
  pot ser senyal que el projecte no encaixa amb la trajectòria del
  cursant (cosa important de saber abans d'invertir-hi anys)
- Sigues honest sobre limitacions: 3 pàgines d'autobiografia no
  capturen una vida sencera

AUTOBIOGRAFIA: {{autobiography}}
PROJECTE: {{current_project}}
```

## Notes

- Si la skill diu "no detecto fil clar", val la pena re-escriure
  l'autobiografia amb més temps o explorar amb la skill
  s-motivation-interviewer abans no avanci
- L'output d'aquesta skill **és input directe** per al storytelling
  del D-07 (Comunicar el projecte) — perquè la narrativa pública
  beguda de la mateixa font que la motivació personal

---

*Skill-seed v0.1 · pendent validació CoP Iniciador de projectes*
