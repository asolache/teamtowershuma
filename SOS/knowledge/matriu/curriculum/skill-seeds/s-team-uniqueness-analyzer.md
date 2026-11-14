---
id: s-team-uniqueness-analyzer
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Team Uniqueness Analyzer"
purpose: >
  Donada la composició de l'equip fundador (experiències, accessos,
  reputacions, IP) i el sector del projecte, identifica la combinació
  única d'actius que cap competidor pot replicar fàcilment. Distingeix
  talent genèric d'avantatge real.

competency_refs:
  - c-01.3-validate-purpose

agent_ref: "@agent_purpose_distiller"

input_schema:
  type: object
  required:
    - team_members
    - project_sector
  properties:
    team_members:
      type: array
      items:
        type: object
        required: [name, professional_history, networks, ip_or_methods]
    project_sector:
      type: string
    competitive_landscape:
      type: string
      description: "Què tenen els competidors actuals (opcional)"

output_schema:
  type: object
  required:
    - unique_combination
    - founder_market_fit
  properties:
    unique_combination:
      type: object
      properties:
        combined_assets:
          type: array
          items: { type: string }
        what_competitors_lack:
          type: string
        replication_difficulty:
          type: string
          enum: [low, medium, high]
    founder_market_fit:
      type: string
      enum: [strong, moderate, weak]
    recommendations:
      type: array
      items: { type: string }

context_tokens: 1300
dependencies: []

sos_context: critical
---

# Team Uniqueness Analyzer

## Què fa

Analitza l'equip fundador per identificar la **combinació única
d'actius** que justifica el "per què tu". No mira talent aïllat (que
es pot contractar) sinó la confluència d'experiències, accessos,
relacions i mètodes que **junts** no es poden replicar fàcilment.

També avalua el **founder-market fit**: si la combinació de l'equip
encaixa amb el sector concret del projecte.

## Quan invocar-la

- Al D-01 per construir el "per què tu"
- Quan estàs avaluant si fa falta cofundador addicional
- Quan estàs preparant pitch per a inversors

## Prompt nucli

```
Ets analista de founder-market fit. Pren la composició de l'equip i el
sector. Analitza:

1. UNIQUE COMBINATION:
   - combined_assets: la llista d'actius que, JUNTS al mateix equip,
     són rars al sector. Cada actiu és la suma de mínim 2 dimensions
     (ex: "experiència regulatòria + xarxa cooperativa catalana" és
     més únic que cada dimensió per separat)
   - what_competitors_lack: què tenen els competidors que NO tenen
     aquests actius
   - replication_difficulty:
     - low: un altre equip ho podria muntar en 6 mesos
     - medium: requeriria 2-3 anys
     - high: requeriria una dècada (és l'únic punt segur)

2. FOUNDER_MARKET_FIT:
   - strong: l'equip té actius específicament rellevants per a aquest sector
   - moderate: experiència general aplicable, sense actius únics del sector
   - weak: l'equip podria ser de qualsevol sector

3. RECOMMENDATIONS:
   - Què afegir a l'equip si fit és weak/moderate
   - Quins actius cal documentar/visibilitzar
   - Punts ciecs de l'anàlisi

REGLES:
- "Som apassionats" NO és actiu únic
- "Tenim experiència de 20 anys" sí, si està verificable
- "Coneixem 50 cooperatives" sí, si específicament al sector
- Sigues honest: si el fit és weak, dis-ho — millor saber-ho ara

EQUIP: {{team_members}}
SECTOR: {{project_sector}}
COMPETÈNCIA: {{competitive_landscape}}
```

## Notes

- Sovint un equip pensa que té founder-market fit fort quan en realitat
  és moderate. La skill ha de ser dura aquí.
- Si surt weak, no vol dir abandonar — vol dir reforçar equip o
  reposicionar projecte abans no avanci

---

*Skill-seed v0.1 · pendent validació CoP Iniciador de projectes*
