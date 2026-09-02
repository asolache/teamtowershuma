# Guia de funcionament de la MATRIU

> La MATRIU és la incubadora del SOS. No incuba idees en abstracte: incuba
> **activitats crítiques d'un territori concret** fins que caminen soles.
>
> Aquest document explica com funciona avui, què fa cada peça i per què.
> Per al que encara falta, mira `pla-millora.md`.

---

## 1. Què és i què no és

**És** una incubadora cooperativa que:
- Parteix del **mapa de valor** (VNA de Verna Allee), no del pla de negoci.
- Reparteix propietat per **aportació real** (Slicing Pie de Mike Moyer), no per negociació prèvia.
- Fa **circular** valor entre projectes germans (model Mondragón), no acumular-lo en un.
- Exigeix **evidència** per avançar d'etapa, no permís.
- Mesura l'èxit en **impacte psicosocial** tant com en euros.

**No és** una cartera d'inversió. No hi ha ronda, ni valoració pre-money, ni exit.
La graduació no és una venda: és que el projecte deixa de necessitar la incubadora.

---

## 2. Anatomia: les 4 pestanyes

Un node amb `dynamicType: 'matriu'` mostra quatre pestanyes:

| Pestanya | Què hi ha | Funció clau |
|---|---|---|
| 👥 **Socis** | Persones i entitats de la incubadora | `membersOf(node)` |
| 🌱 **Cartera** | Les ventures + impacte + fons + intercooperació | `renderMatriuVentures` |
| 🕸 **Ecosistema** | Enllaços a banc de temps, biblioteca, entitats | `linksOf(node)` |
| 🥧 **Equity** | Slicing Pie del fons global | `computeEquity(node)` |

La **Cartera** és el cor. De dalt a baix mostra:
1. Impacte psicosocial (`matriuPsychoImpact`)
2. Intercooperació agregada (`cooperationSummary`)
3. Fons cooperatiu mobilitzat (`fundRollup`)
4. Valor estimat del fons amb rang d'incertesa (`fundValue`)
5. Les targetes de venture, agrupades per etapa

---

## 3. El cicle d'incubació

```
   crear ──▶ IDEA ──▶ PROTOTIP ──▶ VALIDACIÓ ──▶ GRADUACIÓ ──▶ node propi
              │          │            │
           porta 1    porta 2      porta 3
```

Cada fletxa és una **porta amb criteris** (`stageGate`). No es passa per clic:
el botó surt 🔒 amb el nombre de criteris pendents fins que es compleixen tots.

### Porta 1 · Idea → Prototip
| Criteri | Per què |
|---|---|
| Algú lidera la venture | Sense responsable no hi ha projecte, hi ha desig |
| ≥3 rols funcionals al mapa | Menys de 3 no és una xarxa, és un encàrrec |
| ≥3 fluxos de valor | Cal saber què es mou entre qui |

### Porta 2 · Prototip → Validació
| Criteri | Per què |
|---|---|
| Pla d'sprints sembrat | El mapa s'ha convertit en feina concreta |
| Primer sprint tancat | S'ha completat un cicle sencer, no només començat |
| ≥30% del backlog fet | Hi ha tracció real, no només planificació |
| ≥1 aportació al ledger | Algú hi ha posat hores o diners de veritat |

### Porta 3 · Validació → Graduació
Les comprovacions de `ventureReadiness` — cinc sempre, i una sisena només als
tipus amb ànim de lucre:

| Criteri | Per què |
|---|---|
| Té soci líder assignat | Continuïtat després de sortir |
| Almenys 1 sprint completat | Capacitat d'execució demostrada |
| ≥60% dels items del backlog fets | El gruix de la feina fundacional està fet |
| ≥3 aportacions al ledger | Hi ha comptabilitat de valor real |
| Cap membre concentra >70% equity | No surt amb una dependència fatal |
| El llindar de sostenibilitat és assolible *(només amb ànim de lucre)* | Graduar sense saber si es cobreixen costos és enviar el projecte a tancar. A un projecte comunitari no se li demana, perquè no és la seva feina |

**Per què el límit del 70%**: una venture on una sola persona té el 85% no és una
cooperativa, és un autònom amb ajudants. Graduar-la seria enviar-la a trencar-se.

---

## 4. Crear una venture: tres vies

Totes tres desemboquen al mateix objecte `venture`; canvia d'on ve el mapa.

### Via A · Activitat crítica del territori (14 plantilles)
`CRITICAL_ACTIVITIES` — dinamització comercial, ocupació, habitatge, energia,
alimentació, cures, cultura, turisme, economia circular, digitalització,
joventut, mobilitat, acollida i territori.
Cadascuna porta rols, fluxos i kanban propis del sector.

> Aquest document deia **10** quan a l'app ja n'hi havia **14**. Ho va trobar
> `tools/check-matriu.js` el primer cop que va córrer, i és exactament el motiu
> pel qual la pàgina pública no copia d'aquí sinó que es compara amb el codi: un
> document explicatiu envelleix sense petar mai.

**Quan fer-la servir**: quan el territori té una necessitat clara i sectorial.

### Via B · Prototip de mapa de valor (6 genèrics, cobreixen el 80%)
`PROTOTYPE_MAPS` — servei de proximitat, producte artesà, consultoria/servei
tècnic, producte digital/SaaS, cura social, educació/formació.
Cadascun ≥4 rols, ≥8 fluxos amb barreja tangible/intangible.

**Quan fer-la servir**: quan saps la *forma* del projecte (servei? producte?
procés?) però no encaixa en cap sector predefinit.

### Via C · Planificador IA
Descrius la demanda comunitària en text lliure i `aiPlanValueFlows` proposa
rols i fluxos. Amb clau Claude fa una crida real; sense clau, fa un
**fallback heurístic** que tria el prototip més proper per coincidència de
paraules — mai es queda en blanc.

**Quan fer-la servir**: quan la demanda és específica i no la reconeixes en cap
plantilla («reparació de bicis de barri per a joves i gent gran, caps de setmana»).

### El tipus de projecte (transversal a les tres vies)
`PROJECT_TYPES` determina la configuració d'equity heretada:

| Tipus | FMV base | Multipl. no-cash | Multipl. cash | Formes jurídiques |
|---|---|---|---|---|
| 🏘 Comunitari | 15 €/h | ×1 | ×2 | associació, fundació, informal |
| 🤝 Cooperativa | 25 €/h | ×2 | ×4 | SCCL, SCP, SL cooperativa |
| 👤 Autònom | 30 €/h | ×2 | ×5 | autònom, autònom col·laborador |
| 🏢 Empresa | 40 €/h | ×3 | ×6 | SL, SLU, SA |

El multiplicador cash és sempre superior al no-cash perquè el diner té més risc
de pèrdua total que el temps: qui posa 1.000 € els pot perdre tots; qui posa
40 hores manté l'aprenentatge. Això és Slicing Pie ortodox.

---

## 5. El pla d'sprints: del mapa a la feina

`seedSprintPlanFromMap(v)` converteix el mapa de valor en un backlog viu.
Genera tres sprints i **no es duplica** si el tornes a cridar:

| Sprint | Objectiu | D'on surten els items |
|---|---|---|
| **S1 · Fonaments** (2 setm.) | Cobrir els rols amb persones reals | 1 item per rol del VNA + missió/visió |
| **S2 · Activació dels fluxos** (2 setm.) | Que cada intercanvi passi ≥1 cop | 1 item per flux del VNA |
| **S3 · MVP entregable** (3 setm.) | Un MVP replicable | kanban-seed de l'activitat + 2 tests |

Els items tenen 4 tipus: 👤 `role` · ⇄ `flow` · 📦 `deliverable` · 🧪 `test`.

**La idea de fons**: un mapa de valor que ningú executa és un dibuix. Convertir
cada rol i cada flux en una casella que algú ha de marcar és el que fa que el
diagnòstic VNA es transformi en organització real.

Quan una venture es gradua, els items **no fets** viatgen al node nou com a
targetes de kanban. Cap feina es perd.

---

## 6. Comptabilitat de valor

### Slicing Pie per venture
```
slices(temps)  = hores × FMV × multiplicador_noCash
slices(diner)  = euros × multiplicador_cash
%              = slices_persona / slices_totals
```
Cada venture té la **seva pròpia tarta**, separada del fons de la MATRIU.
Es recalcula sola a cada aportació: no cal renegociar mai.

### Fons cooperatiu
- `fundRollup(node)` — què s'ha mobilitzat: hores, objectes, talent, capital.
- `fundValue(node)` — quant val, amb **rang ±30%** i desglossament auditable.
  Els preus surten de l'oracle (`ORACLE_FMV_DEFAULTS` per skill,
  `ORACLE_OBJECT_DEFAULTS` per tipologia d'objecte, amb depreciació per anys),
  editables per node. Glass-Box: cada xifra mostra d'on ve.

### Intercooperació (Mondragón)
`transferBetweenVentures` mou hores, objectes, talent o capital d'una venture a
una altra. Cada transferència queda **signada i encadenada** (hash chain).
`cooperationSummary` ho agrega a la Cartera.

**Per què importa**: que el valor circuli entre projectes germans i no s'acumuli
en un de sol és exactament el que distingeix una incubadora cooperativa d'una
cartera d'inversió.

---

## 7. Impacte psicosocial: per què la MATRIU és un model

`matriuPsychoImpact(node)` calcula el que els comptes no veuen:

| Mètrica | Com es calcula | Què diu |
|---|---|---|
| **Temps donat** | Σ hores del ledger (node + ventures) | Volum de compromís real |
| **Reciprocitat** | intangibles / (intangibles + tangibles) | Si la xarxa és relacional o transaccional |
| **Persones actives** | membres únics amb ≥1 aportació / cens | Si participen o només consten |
| **Ventures de cura** | coincidència amb vocabulari de cura | Quant s'orienta contra la soledat i l'exclusió |
| **Connexions creuades** | ventures + entitats de l'ecosistema | Densitat del teixit |
| **Hores solidàries** | hores amb FMV < 10 €/h | Temps donat sense contrapartida econòmica |

Una MATRIU amb molts euros i reciprocitat del 10% està construint un mercat.
Una amb reciprocitat del 45% està construint comunitat. **La xifra que importa
no és el fons, és la proporció.**

---

## 8. Salut del mapa de valor

`buildHealth(v)` aplica el diagnòstic VNA a cada venture:

| Indicador | Verd | Què vol dir si és vermell |
|---|---|---|
| **Reciprocitat** | ≥60% | Els fluxos van en una direcció: algú dona i no rep |
| **Densitat** | ≥40% | Topologia estrella: tot passa pel nucli, fràgil |
| **Diversitat** | T+I | Només tangibles = mercat; només intangibles = insostenible |
| **Rols aïllats** | cap | Hi ha rols dibuixats que no intercanvien res |

**Nota tècnica**: els fluxos es desen canònicament com `'tangible'`/`'intangible'`.
`normKind()` accepta també les abreviatures `'T'`/`'I'` que van arribar a
persistir-se, perquè les dades antigues segueixin diagnosticant bé.

---

## 9. El Comando: qui sosté el projecte

Un **Comando** és una colla castellera: el grup de persones que sostenen el
projecte, cadascú al seu lloc. Existeix a dos nivells:

- **De node** — `newProjectComando(node, {...})`
- **D'entitat** — `newEntityComando(entity, {...})`

Cada Comando té nom, missió, membres amb rol funcional i focus, i opcionalment
un mini mapa de valor propi sembrat des d'un prototip.

**Entitats i Comandos són cosins**: qualsevol entitat del directori pot tenir el
seu equip gestor, i els membres es referencien per `personKey` — així queden
lligats al roster global del Comando Molekulon sense duplicar registres.

---

## 10. Graduació

Quan la porta 3 està verda, `graduateVenture(node, v)`:

1. Crea un **node projecte germà** de la MATRIU (mateix pare territorial).
2. Copia el mapa de valor sencer (rols + fluxos).
3. Passa el kanban-seed **i els items de backlog no acabats** com a targetes.
4. Escriu `metaskill.mission` i `metaskill.legacy` amb l'origen i els sprints fets.
5. Marca la venture `stage: 'graduacio'` amb `graduatedAt` i enllaça `graduatedNodeId`.
6. Selecciona el node nou.

Si la porta no està verda retorna `null` i mostra què falta. **La graduació no
es pot forçar des de la UI.**

---

## 11. Rastre i verificabilitat

Tot el que passa a la MATRIU queda al **registre d'activitat** (`activityFeed`):
ventures creades i graduades, sprints tancats, aportacions, intercooperacions,
propostes, comandos. Filtrable per tipus, agrupat per dia, exportable a CSV.

Per a proves públiques:
- `buildAnchorPack(node)` genera un paquet content-addressable (CID SHA-256).
- `nostrPublishAnchor` publica el `mainHash` com a event NIP-33 replaceable.
- Qualsevol pot verificar el pack sense confiar en TeamTowers.

---

## 12. Recepta d'arrencada (primera MATRIU)

1. **Ubica el territori** i crea un projecte de tipus MATRIU.
2. **Dona d'alta 3-5 socis** reals (no simulats).
3. **Connecta l'ecosistema**: enllaça el banc de temps i la biblioteca del
   territori si existeixen — la MATRIU en beurà per assignar recursos.
4. **Incuba 2 ventures**, no 6. Amb dues aprens el cicle; amb sis el dilueixes.
5. Per cada venture: assigna lead → sembra el pla d'sprints → obre la porta 1.
6. **Registra aportacions reals** a mesura que passen. El ledger no és un informe
   a final de mes: és el mecanisme que reparteix la propietat.
7. Quan dues ventures es necessitin, fes una **intercooperació** i mira com es
   mou el fons.
8. Revisa l'**impacte psicosocial** cada mes. Si la reciprocitat baixa, el
   projecte s'està transaccionalitzant.
9. Gradua quan la porta 3 sigui verda — ni abans (es trenca) ni després
   (es fa dependent).

---

## Referències metodològiques

- **Verna Allee** — *Value Networks and the true nature of collaboration*
  (`../references/vna-verna-allee.md`)
- **Mike Moyer** — *Slicing Pie: Funding Your Company Without Funds*
- **Mondragón Corporación Cooperativa** — intercooperació i fons de reserva
- **Codex Antigravity V11–V17** — (`../codex.md`)
