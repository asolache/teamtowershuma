---
id: s-network-balance-analyzer
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Network Balance Analyzer"
purpose: >
  Donat un mapa VNA amb transaccions classificades, analitza el balanç
  tangible/intangible global de la xarxa i detecta desequilibris
  sistèmics que ningú al projecte estigui veient encara.

competency_refs:
  - c-02.2-distinguish-tangible-intangible

agent_ref: "@agent_dharma_ontologist"

input_schema:
  type: object
  required:
    - vna_map
  properties:
    vna_map:
      type: object
      description: "Mapa VNA amb rols i transaccions classificades"

output_schema:
  type: object
  required:
    - balance_report
  properties:
    balance_report:
      type: object
      properties:
        tangible_ratio: { type: number }
        intangible_ratio: { type: number }
        imbalanced_roles:
          type: array
          items:
            type: object
            required: [role_id, imbalance_type, severity]
        systemic_observations:
          type: array
          items: { type: string }

context_tokens: 1200
dependencies:
  - s-transaction-classifier

sos_context: primary
---

# Network Balance Analyzer

## Què fa

Llegeix un mapa VNA i calcula la proporció global tangible/intangible
de la xarxa. Detecta rols amb desequilibris (només dona intangibles,
només rep tangibles, etc.) i emet observacions sistèmiques sobre la
salut estructural del projecte.

## Quan invocar-la

- Just després de tenir el mapa VNA amb transaccions classificades
- Quan sospites que la xarxa té dependència excessiva d'un tipus de
  transacció
- Com a pas previ al càlcul de Health Score (C-02.4)

## Prompt nucli

```
Ets analista de Value Network Analysis. Donat aquest mapa amb transaccions
classificades (tangibles i intangibles), calcula:

1. Proporció global tangible/intangible (per nombre i per pes estimat)
2. Per cada rol: ratio tangible-out/intangible-out i tangible-in/intangible-in
3. Marca com "imbalanced" qualsevol rol on aquestes ratios divergeixen >70%
4. Emet 3-5 observacions sistèmiques sobre què veus a la xarxa global

Una xarxa sana sol tenir 30-40% transaccions tangibles i 60-70% intangibles.
Desviacions importants són significatives.

MAPA: {{vna_map}}
```

## Notes

- No diagnosticis patologies aquí — això pertoca a `s-pathology-detector`
- Sí emet hipòtesis que la CoP pugui validar
- Inclou exemples concrets del mapa per justificar cada observació

---

*Skill-seed v0.1 · pendent validació CoP Mapejador VNA*
