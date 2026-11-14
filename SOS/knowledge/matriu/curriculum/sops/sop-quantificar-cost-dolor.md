---
id: sop-quantificar-cost-dolor
type: sop
version: v0.1
status: draft
author: "@alvaro"

name: "Quantificar el cost del dolor"
purpose: >
  Procediment per convertir les transcripcions d'entrevistes en números
  defensables: cost per pacient (€/any, hores/setmana, oportunitat) i
  cost agregat al mercat objectiu.

cop_ref: cop-iniciador-de-projectes
applies_to:
  - competency: c-01.1-articulate-pain

effort_minutes: 60
steps_count: 5
---

# SOP · Quantificar el cost del dolor

## Objectiu

Produir estimacions defensables del cost econòmic, temporal i d'oportunitat
del dolor per pacient i al mercat agregat, amb assumptions explícites.

## Pre-requisits

- 10+ transcripcions d'entrevistes amb pacients (output del SOP anterior)
- Estimació del mercat objectiu (encara que sigui rough)

## Passos

1. **Extreure dades brutes de cada entrevista**:
   - Hores invertides en el dolor per setmana/mes
   - Cost econòmic directe (eines comprades, serveis contractats)
   - Cost d'oportunitat (què no fan perquè estan amb el dolor)

2. **Triangular per cada dimensió**: si 3 entrevistats diuen 4-6 hores
   setmanals, l'estimació és 4-6h. Si diuen 1, 4 i 12 hores, hi ha
   massa variància — revisar mostra.

3. **Aplicar Fair Market Value** per a les hores (€/hora segons sector).
   Cost = hores × FMV.

4. **Agregar al mercat**:
   - Si tens market_size: cost_total = cost_per_pacient × market_size
   - Si no en tens: assumeix amb explicitació ("assumim 5.000 cooperatives
     a Catalunya, font: X")

5. **Documentar** cost_per_patient + aggregate_market_cost + assumptions
   al `pain_evidence_log`.

## Criteris d'èxit

- Cost per pacient quantificat en €/any (mínim)
- Cost agregat al mercat estimat amb assumptions explícites
- Confidence level honest (high/medium/low)

## Errades a evitar

- **Cost optimista**: inflar números per justificar el projecte
- **Cost amagat**: ignorar el cost d'oportunitat (sovint és el més gran)
- **Sense assumptions explícites**: si no es poden auditar, no valen

---

*SOP v0.1 · status: draft · pendent ratificació CoP Iniciador de projectes*
