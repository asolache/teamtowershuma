---
id: s-vna-role-extractor
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"
last_modified: 2026-05-20

name: "VNA Role Extractor"
purpose: >
  Donada una transcripció d'entrevista (o un conjunt de transcripcions),
  extreu rols VNA candidats com a llista de verbs en infinitiu, agrupats
  per similitud semàntica.

competency_refs:
  - c-02.1-identify-vna-roles

agent_ref: "@agent_dharma_ontologist"

input_schema:
  type: object
  required:
    - transcripts
  properties:
    transcripts:
      type: array
      description: "Llista de transcripcions d'entrevistes"
      items:
        type: object
        required: [person_id, content]
        properties:
          person_id:
            type: string
            description: "Identificador anonimitzat de la persona entrevistada"
          content:
            type: string
            description: "Text complet de la transcripció"
          context:
            type: string
            description: "Opcional: organització, posició formal, etc."
    organization_context:
      type: string
      description: "Sector, mida i tipus d'organització (opcional, ajuda al matching)"

output_schema:
  type: object
  required:
    - candidate_roles
    - persona_role_map
  properties:
    candidate_roles:
      type: array
      items:
        type: object
        required: [id, name, verbs, type_hint]
        properties:
          id:
            type: string
            description: "ID generat: role-{slug}"
          name:
            type: string
            description: "Nom del rol VNA en català, format substantiu"
          verbs:
            type: array
            description: "Verbs en infinitiu agrupats sota aquest rol"
            items: { type: string }
          type_hint:
            type: string
            enum: [tangible, intangible, mixed]
            description: "Pista inicial; cal validar manualment"
          evidence:
            type: array
            description: "Cites textuals que justifiquen aquest rol"
            items: { type: string }
    persona_role_map:
      type: array
      items:
        type: object
        required: [person_id, role_ids]
        properties:
          person_id: { type: string }
          role_ids:
            type: array
            items: { type: string }

context_load_tokens: 1200

dependencies: []

sos_context: critical
---

# s-vna-role-extractor

## Propòsit operatiu

Aquesta skill-seed accelera la C-01.1 (identificar rols VNA). El cursant fa les entrevistes; la skill llegeix les transcripcions i en treu un primer borrador de rols agrupats. El cursant valida o refusa cada agrupació amb la CoP.

**No substitueix la intuïció humana** — la valida i la fa més ràpida. La decisió final sempre és humana.

## Prompt mestre (glass-box)

Quan SOS invoca aquesta skill, el text que envia a l'LLM és aquest:

```
Ets un analista de xarxes de valor (VNA) seguint Verna Allee (2008).

T'enviem transcripcions d'entrevistes amb persones d'una organització.
La pregunta clau de cada entrevista era: "Què passa si demà no véns?"

La teva tasca: identificar ROLS VNA com a ACTIVITATS al flux de valor,
NO com a càrrecs ni com a posicions a l'organigrama.

Regles:
1. Un rol és un VERB CONJUGADA O SUBSTANTIVAT que descriu una activitat
   específica que aporta valor: "moderar conflictes financers", "Connector
   amb banca", "alimentar el gat de recepció".
2. Una persona pot jugar diversos rols simultanis. Detecta'ls tots.
3. Un rol pot ser jugat per diverses persones. Si detectes el mateix verb
   a diverses transcripcions, agrupa'l com un sol rol.
4. Distingeix entre rols TANGIBLES (els que produeixen entregables contractuals,
   facturables) i INTANGIBLES (els que sostenen la xarxa sense contracte:
   pacificadors, connectors, cuidadors).
5. Per a cada rol identificat, conserva les CITES TEXTUALS que el justifiquen.
6. Output en JSON conformant a l'output_schema.

Si una transcripció és ambigua o massa curta per extreure rols, indica-ho
explícitament en lloc d'inventar-ne.

[Transcripcions a continuació]
```

## Exemple d'entrada

```json
{
  "transcripts": [
    {
      "person_id": "P03",
      "content": "Si demà no vinc... mira, ningú saluda els clients quan entren. Ningú avisa al de logística que els paquets s'acumulen al passadís. Tinc la llista de qui ha trucat preguntant pel director — això tampoc no està anotat enlloc. I el gat... fa 3 anys que l'alimento jo. Si jo no vinc, no menja."
    }
  ],
  "organization_context": "PIME industrial, 12 persones, sector logística"
}
```

## Exemple de sortida

```json
{
  "candidate_roles": [
    {
      "id": "role-saludar-clients",
      "name": "Saludador de clients",
      "verbs": ["saludar clients", "rebre visitants"],
      "type_hint": "intangible",
      "evidence": ["ningú saluda els clients quan entren"]
    },
    {
      "id": "role-alerta-logistica",
      "name": "Alertador de logística",
      "verbs": ["avisar de paquets acumulats"],
      "type_hint": "intangible",
      "evidence": ["ningú avisa al de logística que els paquets s'acumulen"]
    },
    {
      "id": "role-tracking-trucades-direccio",
      "name": "Tracker de trucades a direcció",
      "verbs": ["registrar trucades", "filtrar contactes amb director"],
      "type_hint": "intangible",
      "evidence": ["tinc la llista de qui ha trucat preguntant pel director"]
    },
    {
      "id": "role-cuidador-recepcio",
      "name": "Cuidador del gat de recepció",
      "verbs": ["alimentar el gat"],
      "type_hint": "intangible",
      "evidence": ["el gat... fa 3 anys que l'alimento jo"]
    }
  ],
  "persona_role_map": [
    {
      "person_id": "P03",
      "role_ids": [
        "role-saludar-clients",
        "role-alerta-logistica",
        "role-tracking-trucades-direccio",
        "role-cuidador-recepcio"
      ]
    }
  ]
}
```

**Important:** l'organigrama deia "recepcionista". El VNA veu quatre rols intangibles. Aquest és l'efecte clau de la skill.

## Casos límit

| Cas | Comportament esperat |
|---|---|
| Transcripció buida o <50 paraules | Retorna `candidate_roles: []` amb una nota a `metadata.warnings` |
| Persona que respon "no passa res si demà no vinc" | Retorna un únic rol `role-ceremonial-presence` amb baixa confiança, i suggereix entrevista més profunda |
| Verbs contradictoris a diferents transcripcions | Crea dos rols separats; no fusiona automàticament |
| Idioma diferent del català/castellà | Tradueix internament però manté el rol en català al output |

## Heurístiques internes

- **Verbs amb emoció implícita** ("la gent em truca quan...") són pistes d'intangibles
- **Verbs amb mètrica** ("genero 30 informes al mes") són pistes de tangibles
- **Verbs negatius** ("ningú s'enfada perquè jo...") són pistes de rols pacificadors invisibles
- **Verbs amb llistat de noms propis** ("conec personalment X, Y, Z") són pistes de rols connectors

## Validació downstream

La sortida d'aquesta skill **mai és final**. Ha de passar pel SOP `sop-validar-rols-amb-stakeholders` abans de ser commitada al `role_list` definitiu del projecte. La CoP Mapejador VNA pot ratificar la skill si veu que les seves propostes són consistentment validades > 80% del temps.

---

*Skill-seed v0.1 · glass-box · agent @agent_dharma_ontologist*
