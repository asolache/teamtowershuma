---
id: matriu-index
type: index
version: v0.2
status: draft
author: "@alvaro"
purpose: "Índex mestre del currículum de la Matriu. Arquitectura v0.2 amb 11 dominis (2 transversals + 8 lineals + 1 culminació)."
keywords: [matriu, currículum, índex, 11-dominis, cicle-de-vida]
sos_context: critical

# Estat global del currículum
total_domains: 11
linear_domains: [d01, d02, d03, d04, d05, d06, d07, d08]
transversal_domains: [d00, d09]
culmination_domains: [d10]
total_competencies_planned: 53  # 5×10 + 3 (D-10)
pilot_complete: [d00-inner-work, d01-project-definition, d02-value-mapping]
draft_stubs: [d03, d04, d05, d06, d07, d08, d09, d10]
in_review: []
---

# Currículum de la Matriu · Índex v0.2

> El que aprens fent al sistema operatiu de la colla.
> **11 dominis** estructurats en tres modes:
> - **2 transversals** (D-00, D-09) — activables des del primer dia
> - **8 lineals** (D-01 a D-08) — cicle de vida del projecte
> - **1 culminació** (D-10) — només es reconeix després del cicle

## L'arquitectura, en una vista

```
                  D-00 · Treball intern + IA aliada    (transversal)
                   ↓
   ─────────────── CICLE DE VIDA DEL PROJECTE ───────────────
   D-01 → D-02 → D-03 → D-04 → D-05 → D-06 → D-07 → D-08
   ───────────────────────────────────────────────────────────
                   ↓
                  D-09 · Comunitats de Pràctica         (transversal)
                   ↓
                  D-10 · Metanoia                       (culminació)
```

**Les fletxes verticals** indiquen que D-00 alimenta tot el cicle i D-09 es teixeix
durant tot el cicle. **Les fletxes horitzontals** indiquen dependència: el D-02 no
té sentit sense D-01, el D-03 sense D-02, i així successivament.

---

## Els 11 dominis

### Transversals · activables des del primer dia

#### D-00 · Treball intern i IA aliada — 🟢 **pilot complet**
**Mode:** transversal
**Objectiu:** El cursant sosté la seva identitat creativa dins l'eixam humà-màquina.
**CoP:** Mentor intern · **Mòdul SOS:** Inner Studio
**Estat:** 5/5 competències · 10 skill-seeds · 10 SOPs
*Pre-condició per a tot el cicle. Es pot reprendre en qualsevol moment.*
[`domains/d00-inner-work.md`](./domains/d00-inner-work.md)

#### D-09 · Comunitats de Pràctica — ⚪ stub
**Mode:** transversal
**Objectiu:** El cursant s'integra a la xarxa de la Matriu a través dels seus rols VNA universals.
**CoP:** Cuidador de la pinya · **Mòdul SOS:** Collective Brain
*Activable des del D-00. Mai es completa.*
[`domains/d09-communities-of-practice.md`](./domains/d09-communities-of-practice.md)

---

### Cicle de vida del projecte · lineal

#### D-01 · Definir el projecte — 🟢 **pilot complet**
**Objectiu:** Articula el dolor, identifica stakeholders, valida propòsit, defineix MVP inicial.
**CoP:** Iniciador de projectes · **Mòdul SOS:** Project Genesis
**Pre-requisits:** cap (porta d'entrada del cicle) · **Habilita:** D-02
**Estat:** 5/5 competències · 9 skill-seeds · 10 SOPs
[`domains/d01-project-definition.md`](./domains/d01-project-definition.md)

#### D-02 · Mapejar el valor (VNA) — 🟢 **pilot complet**
**Objectiu:** Modela la xarxa real d'intercanvis del projecte amb VNA.
**CoP:** Mapejador VNA · **Mòdul SOS:** VNA Mapper
**Pre-requisits:** D-01 · **Habilita:** D-03, D-04
**Estat:** 5/5 competències · 7 skill-seeds · 8 SOPs
[`domains/d02-value-mapping.md`](./domains/d02-value-mapping.md)

#### D-03 · Estructurar la colla — ⚪ stub
**Objectiu:** Dissenya SOCs i SOPs sobre rols VNA, aplica mètode casteller.
**CoP:** Cap de colla · **Mòdul SOS:** SOC/SOP Designer
**Pre-requisits:** D-02 · **Habilita:** D-04, D-05
[`domains/d03-team-structure.md`](./domains/d03-team-structure.md)

#### D-04 · Comptabilitzar el valor — ⚪ stub
**Objectiu:** Aplica Slicing Pie + triple entrada + connecta amb pie cooperatiu.
**CoP:** Cap de finances coop · **Mòdul SOS:** Value Ledger
**Pre-requisits:** D-02, D-03 · **Habilita:** D-05, D-06
[`domains/d04-value-accounting.md`](./domains/d04-value-accounting.md)

#### D-05 · Operar amb agents IA — ⚪ stub
**Objectiu:** Dissenya Work Orders, coordina swarm, audita outputs IA.
**CoP:** Coordinador d'eixam IA · **Mòdul SOS:** Work Order Engine
**Pre-requisits:** D-03, D-04 · **Habilita:** D-07
[`domains/d05-ai-agent-operations.md`](./domains/d05-ai-agent-operations.md)

#### D-06 · Acords i contractes — ⚪ stub
**Objectiu:** Negocia acords coop, redacta contractes, propostes i factures.
**CoP:** Negociador d'acords · **Mòdul SOS:** Contracts & Payments
**Pre-requisits:** D-03, D-04 · **Habilita:** D-07
[`domains/d06-contracts-payments.md`](./domains/d06-contracts-payments.md)

#### D-07 · Comunicar el projecte — ⚪ stub
**Objectiu:** Construeix landing, Canvan, pitch deck, narrativa coherent.
**CoP:** Narrador del projecte · **Mòdul SOS:** Pitch & Landing Studio
**Pre-requisits:** D-05, D-06 · **Habilita:** D-08
[`domains/d07-project-communication.md`](./domains/d07-project-communication.md)

#### D-08 · Productes i mercat — ⚪ stub
**Objectiu:** Llança producte mínim viable (workshop), prova, itera, escala.
**CoP:** Dissenyador de cartera · **Mòdul SOS:** Product Builder
**Pre-requisits:** D-07 · **Habilita:** (últim del cicle lineal)
[`domains/d08-products-market.md`](./domains/d08-products-market.md)

---

### Culminació · només reconeixible després del cicle

#### D-10 · Metanoia — ⚪ stub
**Mode:** culmination
**Objectiu:** Reconèixer els patrons sistèmics, veure la xarxa des de dintre, tancar el cicle.
**CoP:** Mentor sistèmic · **Mòdul SOS:** Systems View
**Pre-requisits:** D-08 (cicle complet) · **Habilita:** (final)
[`domains/d10-metanoia.md`](./domains/d10-metanoia.md)

---

## Estadístiques

| Indicador | Valor |
|---|---|
| Dominis totals | 11 |
| Dominis amb stub MD | 11 / 11 |
| Dominis amb pilot complet | **3** (D-00, D-01, D-02) |
| Competències planificades | ~53 |
| Competències amb pilot | **15** |
| Skill-seeds amb pilot | **30** |
| SOPs amb pilot | **30** |

## Roadmap d'iteració

**Fase 1 (actual):** Stubs dels 11 dominis ✓

**Fase 2:** Completar D-02 (té el millor pilot, refinar les 3 competències
existents + crear C-02.4 i C-02.5)

**Fase 3:** Una sessió per cada altre domini. Ordre suggerit:
D-01 → D-00 → D-03 → D-04 → D-09 → D-05 → D-06 → D-07 → D-08 → D-10.

(L'ordre comença per D-01 i D-00 perquè són les bases. D-09 entra abans del
final perquè és transversal i serveix per validar els SOPs dels dominis posteriors.)

**Fase 4:** Validació creuada per CoPs simulades.

**Fase 5:** Migració definitiva a SOS V11 via submodule.

---

*Índex v0.2 · TeamTowers SOS V11 · Força · Equilibri · Valor · Seny*
