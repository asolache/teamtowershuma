---
id: s-value-conversion-finder
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Value Conversion Finder"
purpose: >
  Identifica oportunitats de conversió de valor (intangible → tangible)
  al mapa VNA del projecte, distingint conversions sostenibles
  (enforteixen la xarxa) de conversions extractives (la consumeixen).

competency_refs:
  - c-02.5-convert-value-flows

agent_ref: "@agent_synaptic_weaver"

input_schema:
  type: object
  required:
    - vna_map
    - role_health_report
  properties:
    vna_map: { type: object }
    role_health_report: { type: array }
    sector_context:
      type: string
      description: "Sector del projecte (opcional)"

output_schema:
  type: object
  required:
    - conversion_opportunities
  properties:
    conversion_opportunities:
      type: array
      items:
        type: object
        required: [opportunity_id, source_role, intangible_input, tangible_output, type, sustainability]
        properties:
          opportunity_id: { type: string }
          source_role: { type: string }
          intangible_input: { type: string }
          tangible_output: { type: string }
          type:
            type: string
            enum: [consultoria, formacio, llicencia, producte, comunitat, emergent]
          sustainability:
            type: string
            enum: [sostenible, extractiva, mixta]
          rationale: { type: string }
          first_experiment: { type: string }

context_tokens: 1600
dependencies:
  - s-vna-health-analyzer

sos_context: critical
---

# Value Conversion Finder

## Què fa

Per cada rol del mapa, busca **inputs intangibles que podrien convertir-se
en outputs tangibles** (productes, serveis, llicències, memberships, etc.).
Categoritza cada oportunitat com a:

- **Sostenible** — la conversió enforteix la xarxa intangible original
- **Extractiva** — la conversió consumeix la xarxa
- **Mixta** — depèn de com s'executi

És la skill que **multiplica els ingressos potencials del projecte**, i
també la que pot **trencar-lo si s'usa malament**.

## Quan invocar-la

- Quan tens mapa VNA validat + Health Score calculat
- Especialment per a rols amb sobrant d'intangibles (donen més del que reben)
- **No** abans de la conversa de C-02.5 amb la CoP — és una eina, no una decisió

## Prompt nucli

```
Ets estrateg de Value Network Analysis especialitzat en conversió de valor.
Per cada rol del mapa, busca oportunitats de convertir intangibles en
tangibles.

LES 5 CONVERSIONS CLÀSSIQUES:
1. Consultoria — pericia → hora facturable
2. Formació/workshop — coneixement → entrades pagades
3. Llicència de mètode — sistema propietari → fees recurrents
4. Producte empaquetat — solució recurrent → SaaS / venda
5. Comunitat de pagament — relacions → membership

També busca conversions EMERGENTS (la 6a) que combinen intangibles del
mapa de forma original. La 6a sol ser on hi ha el valor diferencial.

PER CADA OPORTUNITAT, CATEGORITZA:
- SOSTENIBLE si: la conversió enforteix la xarxa intangible original
  (exemple: documentar coneixement en llibre atreu nous membres a la CoP)
- EXTRACTIVA si: la conversió consumeix la xarxa
  (exemple: vendre consultoria intensiva als clients que abans ajudaves
  gratis erosiona la xarxa intangible)
- MIXTA si: pot anar de qualsevol manera segons execució

PER CADA UNA, PROPOSA:
- first_experiment: experiment mínim de 4 setmanes per validar viabilitat
- rationale: per què aquesta conversió específicament, no una altra

REGLES:
- No prioritzar les sostenibles per omissió: marca-les però no ordenis
- Mai ocultar oportunitats extractives: cal que el cursant les vegi i
  conscientment les descarti

MAPA: {{vna_map}}
HEALTH: {{role_health_report}}
SECTOR: {{sector_context}}
```

## Notes

- La decisió final de quina conversió aplicar **mai és de la skill** —
  és humana, validada per la CoP
- Per a un projecte cooperatiu, conversions extractives són un *anti-pattern*

---

*Skill-seed v0.1 · pendent validació CoP Mapejador VNA*
