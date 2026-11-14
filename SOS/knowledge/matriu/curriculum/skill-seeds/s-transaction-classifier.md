---
id: s-transaction-classifier
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"
last_modified: 2026-05-20

name: "Transaction Classifier (Tangible vs Intangible)"
purpose: >
  Donada la descripció textual d'una transacció (qui-què-a qui), determina
  si és tangible o intangible segons el criteri contractual de Verna Allee,
  amb una puntuació de confiança i la justificació explicita.

competency_refs:
  - c-02.2-distinguish-tangible-intangible

agent_ref: "@agent_dharma_ontologist"

input_schema:
  type: object
  required:
    - transactions
  properties:
    transactions:
      type: array
      items:
        type: object
        required: [id, origin_role, destination_role, description]
        properties:
          id: { type: string }
          origin_role: { type: string, description: "ID o nom del rol origen" }
          destination_role: { type: string, description: "ID o nom del rol destinació" }
          description: { type: string, description: "Què s'intercanvia, en text lliure" }
          context: { type: string, description: "Opcional: organització, freqüència, formalització" }

output_schema:
  type: object
  required:
    - classified_transactions
  properties:
    classified_transactions:
      type: array
      items:
        type: object
        required: [id, classification, confidence, justification]
        properties:
          id: { type: string }
          classification:
            type: string
            enum: [tangible, intangible, ambiguous]
          confidence:
            type: number
            minimum: 0
            maximum: 1
            description: "0.0 a 1.0; <0.7 demana validació humana"
          justification:
            type: object
            required: [is_expected, is_billable, has_clause]
            properties:
              is_expected:
                type: boolean
                description: "Es produiria queixa formal si no es donés?"
              is_billable:
                type: boolean
                description: "Es pot mesurar en € sense ambigüitat?"
              has_clause:
                type: boolean
                description: "Existeix una clàusula (escrita o oral explícita)?"
              reasoning:
                type: string
                description: "Frase amb el raonament curt"
          deliverable_hint:
            type: string
            description: "Nom suggerit per a l'entregable (per al mapa visual)"

context_load_tokens: 800

dependencies:
  - s-vna-role-extractor  # idealment es corre després

sos_context: critical
---

# s-transaction-classifier

## Propòsit operatiu

Accelera la C-01.2 (distingir tangibles vs intangibles). Quan tens la llista de transaccions però has d'etiquetar-ne 50, fer-ho a mà és lent i propens a errors d'inconsistència. Aquesta skill aplica el criteri canonical de Verna Allee de forma uniforme.

**Important:** la skill **no és definitiva**. Cada classificació té una `confidence`. Les que estan per sota de 0.7 demanen validació humana obligatòria.

## Prompt mestre (glass-box)

```
Ets un expert en VNA (Value Network Analysis) seguint Verna Allee (2008).

T'enviem una llista de transaccions entre rols. Per cada una, has de classificar-la
com a TANGIBLE, INTANGIBLE o AMBIGUOUS, aplicant aquest criteri:

És TANGIBLE si com a mínim DUES d'aquestes tres condicions són certes:
- És esperada (no produir-la generaria queixa formal)
- És facturable (es pot mesurar en € sense ambigüitat)
- Té clàusula explícita (escrita o oral)

És INTANGIBLE si totes tres condicions són clarament FALSES.

És AMBIGUOUS si:
- Hi ha una sola condició certa de les tres
- L'evidència és insuficient per decidir
- Hi ha contradicció entre el contingut i el context

Per a cada transacció, retorna:
- classification: tangible | intangible | ambiguous
- confidence: 0.0 a 1.0 (com de segura estàs)
- justification amb els tres flags i una frase de raonament
- deliverable_hint: el nom natural del que s'intercanvia

Recorda: la naturalesa CONTRACTUAL és el criteri, no la materialitat física.
Un PDF pot ser tangible (entregable facturat) o intangible (favor entre col·legues).
Una conversa pot ser tangible (consultoria) o intangible (consell espontani).
```

## Exemple d'entrada

```json
{
  "transactions": [
    {
      "id": "t-001",
      "origin_role": "Comptable",
      "destination_role": "Director General",
      "description": "Informe mensual de tresoreria amb projeccions a 90 dies",
      "context": "Forma part del paquet contractual de la directora financera"
    },
    {
      "id": "t-002",
      "origin_role": "Recepcionista",
      "destination_role": "Comercials",
      "description": "Avisar abans que arribi un client per què està enfadat segons la trucada prèvia",
      "context": "No documentat enlloc, però els comercials hi compten"
    },
    {
      "id": "t-003",
      "origin_role": "Mentor extern",
      "destination_role": "CEO",
      "description": "Trucada mensual de 1h on revisem el rumb del negoci",
      "context": "Sense factura, però amb constància d'agenda"
    }
  ]
}
```

## Exemple de sortida

```json
{
  "classified_transactions": [
    {
      "id": "t-001",
      "classification": "tangible",
      "confidence": 0.95,
      "justification": {
        "is_expected": true,
        "is_billable": true,
        "has_clause": true,
        "reasoning": "Forma part del contracte; entregable mesurable; no produir-lo seria incompliment"
      },
      "deliverable_hint": "Informe mensual de tresoreria"
    },
    {
      "id": "t-002",
      "classification": "intangible",
      "confidence": 0.82,
      "justification": {
        "is_expected": false,
        "is_billable": false,
        "has_clause": false,
        "reasoning": "Sense documentació ni clàusula. Els comercials hi compten però no podrien queixar-se formalment si la recepcionista no ho fes"
      },
      "deliverable_hint": "Pre-avís emocional"
    },
    {
      "id": "t-003",
      "classification": "ambiguous",
      "confidence": 0.55,
      "justification": {
        "is_expected": true,
        "is_billable": false,
        "has_clause": false,
        "reasoning": "Constància d'agenda regular suggereix expectativa, però l'absència de factura i clàusula la deixa al territori del 'compromís informal entre col·legues amb agenda compartida'. Requereix validació humana: pregunta a la CoP si hi ha equivalent simbòlic (mentoria amb intercanvi de visibilitat)"
      },
      "deliverable_hint": "Sessió de mentoria estratègica"
    }
  ]
}
```

Observa el cas `t-003`: la skill no inventa. **Reconeix la seva pròpia incertesa** i passa la decisió a la CoP. Això és glass-box.

## Casos límit

| Cas | Comportament esperat |
|---|---|
| Descripció <10 paraules | Returna `ambiguous` amb `confidence: 0.3` i petició d'enriquiment |
| Transacció que sembla bidireccional | La marca com a `ambiguous` i suggereix dividir-la en dues transaccions separades |
| Idioma diferent al català | Tradueix internament; retorna en català |
| Hi ha context contradictori amb la descripció | Marca `ambiguous` i posa la contradicció al `reasoning` |

## Heurístiques internes

- **"Cada X (interval)"** sense context contractual → expectativa intangible (`is_expected: true`, `has_clause: false`)
- **Paraula "compromís"** sense factura ni clàusula → intangible amb alta confiança
- **Paraula "deliverable" o "entregable"** → tangible probable
- **"Va començar com a favor i ara és habitual"** → ambiguous amb alta confiança, demana decisió
- **Transaccions sense periodicitat clara però amb expectativa** → intangible amb confidence mitjà

## Validació downstream

L'output passa pel SOP `sop-classificar-transaccions`. Els casos `ambiguous` o amb `confidence < 0.7` són candidats obligatoris de revisió per la CoP. Quan la CoP ratifica una classificació, l'evidència s'incorpora a futures versions del prompt (millora iterativa de la skill).

---

*Skill-seed v0.1 · glass-box · agent @agent_dharma_ontologist*
