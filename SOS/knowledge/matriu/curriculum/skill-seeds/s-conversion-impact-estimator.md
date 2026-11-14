---
id: s-conversion-impact-estimator
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Conversion Impact Estimator"
purpose: >
  Per a una oportunitat de conversió específica, projecta com afectaria
  la xarxa VNA del projecte: quins rols guanyarien, quins perdrien,
  quins fluxos s'enfortirien i quins s'erosionarien. Genera un mapa
  "abans i després" projectat.

competency_refs:
  - c-02.5-convert-value-flows

agent_ref: "@agent_synaptic_weaver"

input_schema:
  type: object
  required:
    - vna_map
    - conversion_opportunity
  properties:
    vna_map: { type: object }
    conversion_opportunity:
      type: object
      description: "Una sola oportunitat del s-value-conversion-finder"

output_schema:
  type: object
  required:
    - impact_projection
  properties:
    impact_projection:
      type: object
      required: [winners, losers, strengthened_flows, eroded_flows, risk_level]
      properties:
        winners:
          type: array
          items:
            type: object
            required: [role_id, gain_description]
        losers:
          type: array
          items:
            type: object
            required: [role_id, loss_description]
        strengthened_flows:
          type: array
          items: { type: string }
        eroded_flows:
          type: array
          items: { type: string }
        risk_level:
          type: string
          enum: [low, medium, high, critical]
        recommendation:
          type: string

context_tokens: 1400
dependencies:
  - s-value-conversion-finder

sos_context: critical
---

# Conversion Impact Estimator

## Què fa

Donada una oportunitat de conversió de valor, **projecta el seu impacte
a la xarxa VNA**: quins rols se'n beneficiarien, quins en sortirien
perjudicats, quins fluxos s'enfortirien, quins s'erosionarien.

És la **simulació prèvia a l'experiment**. No substitueix l'experiment
(C-02.5 demana un experiment real de 4 setmanes), però evita errades
òbvies abans de gastar recursos.

## Quan invocar-la

- Per a cada oportunitat de conversió seleccionada per a experiment
- Especialment per a conversions amb categoria *mixta* o *extractiva*
  (cal entendre el risc abans d'executar)

## Prompt nucli

```
Ets simulador de Value Network Analysis. Per a aquesta oportunitat de
conversió, projecta com afectaria la xarxa actual:

1. WINNERS: rols que guanyarien valor (tangible o intangible). Per cada
   un, descriu el guany concret.
2. LOSERS: rols que perdrien valor. Per cada un, descriu la pèrdua
   concreta i quantifica si pots.
3. STRENGTHENED_FLOWS: transaccions del mapa que s'enfortirien
4. ERODED_FLOWS: transaccions que s'erosionarien
5. RISK_LEVEL:
   - low: només winners, cap pèrdua estructural
   - medium: pèrdues acotades, recuperables
   - high: erosió significativa de fluxos intangibles clau
   - critical: pot col·lapsar rols essencials

6. RECOMMENDATION: 1-2 frases amb la teva síntesi (proseguir? acotar?
   pivotar?)

REGLES:
- Sigues conservador: davant de dubte, eleva el risk_level
- Mai amaguis losers: la transparència és part de la salut sistèmica
- Cita rols i fluxos del mapa per justificar cada projecció

MAPA: {{vna_map}}
OPORTUNITAT: {{conversion_opportunity}}
```

## Notes

- Aquesta projecció és **hipòtesi, no veritat**. La validació real ve
  amb l'experiment real definit a C-02.5
- Per a oportunitats categoritzades com *extractives* per
  `s-value-conversion-finder`, espera trobar high o critical risk

---

*Skill-seed v0.1 · pendent validació CoP Mapejador VNA*
