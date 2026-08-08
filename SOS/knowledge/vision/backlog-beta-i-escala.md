# Backlog cap a la beta — i el mapa de valor dels següents passos

> Estat de partida mesurat el 2026-08-08 sobre `SOS/index.html` (14.430 línies,
> 360 KB gzip, 19 suites de test verdes, V63). Tot el que aquí es diu que falla
> s'ha comprovat executant l'app, no llegint-la.

---

## 0 · El que ha canviat la prioritat de tot

Abans de fer cap llista calia saber què passa quan **dues persones apunten hores
al mateix node sense estar connectades** i després sincronitzen. És el cas
normal d'un banc de temps: dos veïns, dos telèfons, cap servidor.

Es va provar. Resultat:

```
base + Bru(3 h)   ⟵ dispositiu A
base + Anna(5 h)  ⟵ dispositiu B, un segon més tard
                  ↓ sincronitzen
ledger: ["base", "anna"]      → PERDUT: bru
```

**Les 3 hores del Bru desapareixen.** Sense avís, sense tombstone, sense rastre.

El motiu és a `mergeIncoming`: els nodes es resolen per **LWW de node sencer**
—`local.updatedAt < n.updatedAt` → es reemplaça el node **complet**—, i el
ledger, els socis, els objectes, les ofertes i les ventures viuen **a dins del
node**. El xat és l'única col·lecció que es fusiona per unió, i el comentari del
codi explica exactament per què:

> *«amb LWW sencer, dues persones escrivint alhora es perdrien missatges, i el
> que es perd en un xat no es recupera de cap altra banda»*

El raonament és correcte i és **el mateix** per al ledger. La diferència és que
un missatge perdut es pot tornar a escriure i **una hora treballada no**. La
mateixa sonda confirma que els socis també es perden: qui s'apunta al dispositiu
que perd el LWW deixa d'existir.

Això no és un defecte més de la llista. És la premissa del SOS —un registre
signat i encadenat en què et pots refiar— fallant al primer cas real amb dues
persones. **Mentre això hi sigui, no hi ha beta**: la beta seria un experiment
per comprovar quanta feina de la gent es perd.

---

## 1 · Metaskill de la xarxa de la beta

Segons VNA, primer el propòsit; els rols i els fluxos després.

**Missió** — Que un grup real de veïns porti el seu banc de temps o la seva
biblioteca amb el SOS durant tres mesos **sense perdre cap hora** i sense que
calgui que ningú els ho torni a explicar cada setmana.

**Visió** — Cada comarca amb almenys un node viu, i el fons cooperatiu comptant
valor **verificat** en comptes d'estimat: la xifra gran del projecte deixa de
ser una projecció i passa a ser una suma d'hores que algú va confirmar.

**Objectius** — tots mesurables amb el que l'app **ja calcula**, sense
instrumentació nova:

| Objectiu | Com es mesura | Avui |
|---|---|---|
| Cap apunt perdut en sincronitzar | la sonda de fusió, com a test de regressió | **es perden** |
| 3 nodes als 90 dies amb activitat setmanal | `activityFeed` · `ventureSilence` | 0 |
| 5 comarques amb cobertura > 0 | `countryCoverage(rootId)` | 0 |
| Fons amb valor verificat > 0 | `networkFund().verificat` | tot estimat |
| Reciprocitat ≥ 60 % als nodes vius | `vnaAudit(n).recPct` | sense dades reals |

**Valors de la xarxa** — el que ja diuen les vedes: no es diu «verificat» del que
no s'ha verificat; el que no s'envia no es pot filtrar; una capacitat que no hi
és es diu, no es supleix.

---

## 2 · Mapa de valor dels següents passos

### 2.1 Rols

Rols funcionals, no càrrecs. Els tres últims **no existeixen avui** i és
precisament per això que hi ha fluxos trencats.

| # | Rol | Què aporta | Què n'ha de rebre |
|---|---|---|---|
| R1 | **Qui aporta** | hores, objectes, sabers | saldo fiable, reconeixement, pertinença |
| R2 | **Qui sosté el node** | obre'l, el manté viu, convida | llegitimitat, eines que no li fallin, relleu |
| R3 | **Qui confirma** | vistiplau del que s'ha apuntat | confiança que el registre val |
| R4 | **Entitat amfitriona** | espai, llista de contactes, marca | activitat, dades del seu territori |
| R5 | **Qui acompanya** (TeamTowers) | formació, diagnòstic, mentoria | casos reals, evidència del model |
| R6 | **Qui manté el codi** | l'app, les vedes, les correccions | senyal del que falla de debò |
| R7 | **La resta de la xarxa** | altres nodes, federacions temàtiques | massa crítica, coincidències |
| R8 | **Administració** | marc, espai, de vegades diners | dades agregades del que passa al territori |
| R9 | **Qui allotja el pont** *(opcional)* | un relé perquè es vegin en viu | — *(no rep res avui)* |
| **R10** | **Qui recull el que falla** | ⚠️ **no existeix** | — |
| **R11** | **Qui custodia la còpia** | ⚠️ **no existeix** | — |
| **R12** | **Qui sosté la segona llengua** | ⚠️ **no existeix** | — |

### 2.2 Fluxos

`T` tangible · `I` intangible · `↔` recíproc · `⊘` trencat avui

| Origen → Destí | Tipus | Què flueix | Estat |
|---|---|---|---|
| R1 ↔ R1 | T | hores de servei, préstec d'objectes | ✅ |
| R1 ↔ R1 | I | reciprocitat, confiança de veïnatge | ✅ |
| R1 → R2 | T | apunts al ledger | **⊘ es perden en sincronitzar** |
| R2 → R1 | T | saldo, historial signat | **⊘ no fiable mentre E1** |
| R2 → R1 | I | reconeixement, sentit de pertinença | ✅ (rànquing, missions) |
| R3 → R2 | T | confirmacions signades | ✅ (V43) |
| R3 → R1 | I | que el que apuntes val alguna cosa | ✅ |
| R2 ↔ R7 | T | fusió de dades entre nodes | **⊘ un company alhora, cara a cara** |
| R2 ↔ R7 | I | coincidències, federació temàtica | ⚠️ depèn del flux anterior |
| R4 → R2 | T | espai, contactes | ✅ fora de l'app |
| R2 → R4 | T | activitat del seu territori | ✅ (`measure`, `consolidate`) |
| R4 → R2 | I | legitimitat davant del veïnat | ✅ |
| R5 → R2 | I | formació, itinerari, acompanyament | ✅ (mentoria, diagnòstic) |
| R2 → R5 | I | casos reals que validen el model | ⚠️ només si els nodes duren |
| R1 → R6 | I | **senyal del que s'ha trencat** | **⊘ no hi ha cap camí a l'app** |
| R6 → R1 | T | correccions, versions | ✅ unidireccional |
| R8 → R2 | T | marc, espai, subvenció | ✅ fora de l'app |
| R2 → R8 | T | dades agregades del territori | ✅ (`toPublicPack`) |
| R9 → R2 | T | presència i entrega en viu | ⚠️ **només xat**, no el registre |
| R2 → R9 | I | — | **⊘ qui allotja no rep res** |
| R2 → R11 | T | còpia xifrada del node | **⊘ el rol no existeix** |

### 2.3 Salut de la xarxa

| Indicador | Diagnòstic |
|---|---|
| **Reciprocitat** | Trencada a l'arrel: **qui aporta dona hores i rep un registre que es pot perdre**. Tota la resta de reciprocitat del mapa descansa sobre aquest retorn. |
| **Densitat** | **Topologia estrella** cap a R2. Qui sosté el node és qui té el dispositiu amb la còpia bona, qui sincronitza, qui convida i qui guarda la còpia. |
| **Coll d'ampolla** | R2 concentra molt més del 40 % dels fluxos. Si plega, el node desapareix — no perquè la gent marxi, sinó perquè les dades eren al seu telèfon. |
| **Diversitat** | Bona: la barreja tangible/intangible és rica i està ben modelada. No és aquí el problema. |
| **Rols aïllats** | R9 (qui allotja el pont) no rep res: dona infraestructura i no en treu ni reconeixement. Un rol que només dona s'apaga. |
| **Fluxos trencats** | Els tres rols que falten (R10, R11, R12) es dedueixen **exactament** dels tres fluxos tallats. És el principi de rols faltants de VNA funcionant com hauria. |
| **Alineació a metaskill** | Alta. Cap flux del mapa és soroll; el problema no és què hi ha, és què no arriba. |

---

## 3 · Backlog

Ordenat perquè cada tanda **desbloqueja** la següent. Cada entrada diu quin flux
trencat repara — si no en repara cap, no és a la llista.

### Tanda 0 · Sense això no hi ha beta

**E1 · La sincronització no pot perdre res** — *repara R1→R2, R2→R1*
Fusió per unió de les col·leccions **append-only** dins del node (ledger, socis,
objectes, ofertes, ventures, evidències, riscos), com ja es fa amb el xat; LWW
només per als camps escalars (nom, nivell, configuració).

La part difícil no és la unió: és que **el ledger va encadenat per hash**. Dues
cadenes que han crescut per separat no es poden entrellaçar sense un ordre
global, i un ordre global vol dir un servidor —exactament el que el SOS no vol
ser. Recomanació: **una cadena per autor** (`did`), que és el que ja permet la
identitat de V59. Cadascú encadena el que signa; el node és la unió de cadenes,
i cada cadena es verifica sola. `verifyChain` passa a ser per autor.

Cost real: és la peça més cara de tot el backlog i toca el nucli. No hi ha
drecera honesta.

**E2 · La fusió ha de deixar rastre** — *repara R2→R1 (confiança)*
Avui el toast diu «Sincronitzat · N canvis» i **N no compta el que s'ha perdut**.
Ha de dir què ha entrat, què ha xocat i què s'ha descartat. Mentre E1 no hi
sigui, això és el mínim per no mentir; després, segueix sent el que fa auditable
una fusió.

### Tanda 1 · Que convergeixi sense que tothom es vegi amb tothom

**E3 · El relé porta patches signats, no només xat** — *repara R2↔R7, R9*
El relé ja existeix, ja és opcional i configurat per l'usuari, i el topic ja és
un hash. Cada patch va **signat pel `did`** i es verifica en rebre'l: el relé
transporta, no escriu història, perquè no té clau. És el pas que converteix N
aparellaments cara a cara en una xarxa que convergeix sola.
*I dona a R9 el que avui no rep: el seu relé passa a ser infraestructura de la
qual algú depèn i a qui es pot reconèixer.*

**E4 · Més d'un company alhora** — *repara R2↔R7*
`_pc` i `_dc` són singletons: **una connexió alhora**. Passar a un mapa de
connexions perquè una trobada de tres persones no siguin tres torns.

**E5 · Sincronitzar només l'àmbit compartit** — *repara R2↔R7 a escala*
`hello` envia `state.nodes` i `state.entities` **sencers**. A escala de comarca,
això és tota la comarca a cada aparellament, i creix amb el quadrat de la gent.
Enviar només l'àmbit que les dues bandes comparteixen.

### Tanda 2 · Que ho pugui fer servir gent que no som nosaltres

**E6 · Segona llengua (ca · es)** — *repara l'accés, crea R12*
`<html lang="ca">` i el text incrustat al codi. Per a Euskadi i per a bona part
de Catalunya cal una segona llengua. L'euskera després, com vas dit — però la
**capa** que ho farà possible s'ha de posar ara, perquè fer-la amb 14.430 línies
ja escrites és car i amb 20.000 ho serà més.

**E7 · Un camí per dir «això s'ha trencat»** — *repara R1→R6, crea R10*
No existeix. El senyal de què falla només arriba si algú et truca. En una beta
amb gent que no et coneix, això vol dir que **no arribarà**: la gent no es queixa,
plega. Un botó que reculli context (versió, node, què feia) i el deixi enviar o
copiar.

**E8 · La còpia deixa de dependre d'una persona** — *repara R2→R11, crea R11*
Si qui sosté el node perd el telèfon, la història del node se'n va amb ell.
`exportBackup` existeix i els envelopes xifrats per membre també (V29): falta el
**rol** i la rutina que reparteixi la còpia entre diversos membres. És el que
treu R2 de ser un punt únic de fallada.

### Tanda 3 · Que aguanti el pes

**E9 · Pes** — 360 KB gzip, **90 % del sostre declarat**. Amb dades mòbils d'un
poble, i amb un sol fitxer no hi ha caché parcial: cada canvi es baixa sencer.
Abans d'afegir res gran, decidir si es puja el sostre o si se separa alguna cosa.

**E10 · Escala de debò** — `test-escala` prova 500 nodes i 5.000 apunts. Una
comarca real amb 30 municipis és més gran, i amb E5 encara sense fer, cada
aparellament ho mou tot. Mesurar el cas de comarca abans de prometre'l.

---

## 4 · El que aquest backlog **no** fa

- **No toca el relat** (Comando Molekulon, cromos, panteó). Segueix sent la
  reducció més gran disponible en termes de KISS i segueix esperant que diguis
  si encara enganxa gent.
- **No puja res a Arweave.** Continua sent manual, i es diu.
- **No promet multi-node federat amb consens.** Amb E1+E3 la xarxa convergeix;
  el consens entre nodes que no es refien és un altre problema i no és el de la
  beta.
- **No inclou la traducció a l'euskera**, només la capa que la farà possible.

---

## 5 · Per on començar demà

E1. No perquè sigui el més vistós —no ho és— sinó perquè **tota la reciprocitat
del mapa penja d'ell**: mentre qui aporta pugui perdre el que ha aportat, cap
altra millora canvia què li passa a la persona que hi confia.

I perquè la prova ja està escrita: la sonda que ha demostrat el forat és el test
de regressió que dirà quan és tapat.
