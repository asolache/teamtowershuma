# Backlog cap a la beta — i el mapa de valor dels següents passos

> Estat de partida mesurat el 2026-08-08 sobre `SOS/index.html` (V63, 360 KB
> gzip, 19 suites verdes). Tot el que aquí es diu que falla s'ha comprovat
> executant l'app, no llegint-la.
>
> **§0 descriu el forat tal com era.** Es deixa escrit perquè és el que explica
> l'ordre de tot el que ve després — no perquè segueixi obert: **V64 el tanca**.

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

> **Actualització (2026-08-08) · V64 i V65 fets.**
>
> **V64 — E1.** La sortida no va ser «una cadena o l'altra» sinó **triple
> entrada**: el que dona, el que rep i el **rebut** que tots dos guarden signat.
> La cadena única segueix existint —és la dels rebuts— i cada autor encadena el
> seu. `probes/sonda-fusio.mjs` és ara `test-fusio.mjs`, amb les assercions
> girades.
>
> **V65 — E11.** El repositori passa a ser un **canal asíncron per tema**:
> paquets xifrats amb la clau del node, signats, verificats apunt per apunt en
> arribar. Només possible gràcies a V64 —els apunts són idempotents i s'uneixen
> sense conflicte, així que un directori al qual tothom afegeix convergeix sol.

---

## 0.bis · El valor humà, que és el que decideix les prioritats

Val la pena escriure-ho perquè és el que fa que una llista tècnica tingui un
ordre i no un altre.

Una hora de feina d'un veí que no té diners però té temps **no la recorda
ningú**. No surt a cap nòmina, no compta per a cap subvenció, i quan aquella
persona necessita ajuda, no hi ha res que digui el que ha donat. El SOS existeix
perquè aquella hora quedi escrita d'una manera que **ningú pugui esborrar ni
negar** — ni un ajuntament que canvia, ni una associació que plega, ni una
empresa que tanca el servidor.

Per això la pèrdua d'apunts en sincronitzar no era «un bug». Era el sistema
fallant exactament allà on prometia el contrari, i **a qui menys ho pot
permetre**: qui apunta poc, apunta tard i des d'un telèfon vell.

I per això l'**antifragilitat** no és un adorn d'enginyeria. Un sistema fràgil
falla quan creix: amb la cadena única, cada còpia de més era una oportunitat de
conflicte, i créixer feia el registre pitjor. Un sistema antifràgil **es fa fort
quan creix**: amb el rebut compartit, cada persona que en guarda una còpia és
una prova de més. Que hi hagi més gent no és un risc que cal gestionar — és el
que fa que la teva hora sigui indiscutible.

**Criteri, doncs, per a tot el que ve:** una entrada d'aquest backlog val la
pena si fa que **créixer enforteixi el registre**. Si el fa més fràgil, no entra
per molt bé que soni.

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
| Cap apunt perdut en sincronitzar | `test-fusio.mjs`, 14 assercions | ✅ **assolit a V64** |
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
| R1 → R2 | T | apunts al ledger | ✅ **reparat a V64** (unió, no LWW) |
| R2 → R1 | T | saldo, historial signat | ✅ **reparat a V64** |
| R2 → R1 | I | reconeixement, sentit de pertinença | ✅ (rànquing, missions) |
| R3 → R2 | T | confirmacions signades | ✅ (V43) |
| R3 → R1 | I | que el que apuntes val alguna cosa | ✅ |
| R2 ↔ R7 | T | fusió de dades entre nodes | ✅ **reparat a V65** (canal asíncron) |
| R2 ↔ R7 | I | coincidències, federació temàtica | ✅ ja no depèn de coincidir en el temps |
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

## 3 · Primer, quina beta

La prioritat de tota la resta depèn d'una decisió que encara no s'ha pres, i que
no és tècnica:

| | **Beta A · un dispositiu per node** | **Beta B · cada persona amb el seu SOS** |
|---|---|---|
| Qui apunta | el nucli que sosté el node | cadascú el que fa |
| E1 (pèrdua d'apunts) | **no es dispara** si ningú més edita aquell node | **es dispara el primer dia** |
| Què prova | que l'eina serveix a un banc de temps real | que la tesi P2P del SOS s'aguanta |
| Es pot començar | en setmanes | quan E1 estigui fet |

**Recomanació: totes dues, en aquest ordre.** Beta A com a pilot curt per saber
si l'eina ajuda de debò —cosa que encara no sap ningú— mentre es construeix E1;
Beta B quan E1 estigui tancat. Fer només Beta A seria no provar el SOS: la raó
de ser del projecte és que cadascú tingui el seu. Esperar a E1 per començar
seria perdre mesos sense saber si el que estem arreglant li importa a algú.

**Advertiment sobre Beta A:** que E1 «no es dispari» és una **disciplina, no una
garantia**. L'app no la imposa: hi ha 108 llocs que criden `persist`, i qualsevol
acció d'un segon posseïdor d'aquell node li puja l'`updatedAt` i pot sobreescriure
el del nucli. El que sí que s'ha comprovat és que **arrencar l'app no toca cap
node** —el boot no persisteix res—, així que una còpia only-lectura no fa mal per
si sola.

---

## 4 · Backlog prioritzat

`P0` sense això no s'obre · `P1` sense això no escala · `P2` aguantar el pes ·
`P3` arribar més lluny

El cost és una estimació relativa, no un compromís de calendari.

| | Què | Per a quina beta | Depèn de | Cost | Si s'ajorna |
|---|---|---|---|---|---|
| ~~P0~~ | ~~**E1** · triple entrada + cadena per autor~~ | **✅ fet a V64** | — | — | — |
| ~~P0~~ | ~~**E11** · GitHub com a canal asíncron per tema~~ | **✅ fet a V65** | — | — | — |
| **P0** | **E12** · la UX la mana el full de ruta del rol | A i B | — | mitjà | 32 accions i 13 pestanyes per a tothom, i cadascú n'ha de fer servir sis |
| **P0** | **E2** · la fusió deixa rastre | A i B | — | baix | El toast diu «N canvis» i N no compta el que s'ha perdut |
| **P0** | **E7** · camí per dir «això s'ha trencat» | A i B | — | baix | Amb desconeguts no reps queixes: reps abandonaments |
| **P0** | **E8** · la còpia no depèn d'una persona | A i B | — | mitjà · les peces hi són | Qui perd el telèfon s'endú el node |
| **P1** | **E3** · el relé porta patches signats | B | E1 | mitjà | Convergir exigeix que tothom es vegi amb tothom |
| **P1** | **E4** · més d'un company alhora | B | E3 | mitjà | Una trobada de tres són tres torns |
| **P2** | **E5** · sincronitzar només l'àmbit compartit | B a escala | E1, E3 | mitjà | Cada aparellament mou tota la comarca |
| **P2** | **E10** · mesurar l'escala de comarca | B a escala | E5 | baix | Es promet una escala que no s'ha provat |
| **P2** | **E9** · pes | A i B | — | variable | 90 % del sostre, i cada canvi es baixa sencer |
| **P3** | **E6** · segona llengua (ca · es) | Euskadi | — | **alt** i creix cada dia | Euskadi no arrenca; i a 20.000 línies costarà més |

### Les tres decisions que amaga aquesta taula

1. **E1 abans que E3.** Un relé que reparteix patches sobre una fusió que perd
   dades reparteix la pèrdua més de pressa. L'ordre no és negociable.
2. **E6 baixa a P3, però el rellotge corre.** Per a una beta a Catalunya el
   català no és cap barrera, i per això no és P0. Però és l'única entrada de la
   llista el **cost de la qual creix cada setmana** que no es fa: cada tanda de
   feina hi afegeix text incrustat. Si Euskadi entra al pla d'aquest any, puja a
   P1 tota sola.
3. **E7 i E2 són barates i van primer.** Costen poc i són el que converteix la
   beta en informació. Sense elles la beta genera anècdotes.

### Ordre de treball suggerit

```
Setmanes 1-2   E2 · E7 · E8            → Beta A pot començar
Setmanes 1-6   E1 (en paral·lel)       → cadena per autor
Setmanes 7-9   E3 · E4                 → Beta B pot començar
Després        E5 · E10 · E9 · E6      → segons on vagi la beta
```

---

## 5 · El detall de cada entrada

### ✅ E1 · Triple entrada i cadena per autor — *fet a V64*

El que dona, el que rep i el **rebut** que tots dos guarden signat. El rebut és
la tercera entrada i és la que mana; la «cadena única» és la dels rebuts, i
cada autor encadena els seus (`prevHash` apunta a l'anterior del mateix `did`).

Dues persones que apunten alhora fan créixer dues cadenes que no es trepitgen, i
**la unió de les dues és vàlida sense reordenar res** — que és exactament el que
evita necessitar un ordre global, i per tant un servidor.

Fet: `entryAuthor`, `pushLedger` per autor, `verifyLedger` amb mode
`autor`/`global`, `APPEND_ONLY` + `mergeAppendOnly` amb regla del **més ric**
(firma per sobre de no-firma, més confirmacions per sobre de menys — **mai el
més nou pel fet de ser més nou**, que és el que ens havia portat fins aquí).
Els ledgers escrits abans de V64 es validen com a globals i segueixen valent.

### P0 · Sense això no s'obre

### ✅ E11 · El canal asíncron — *fet a V65*
El relé demana que **dues persones hi siguin alhora**. En un poble això no passa
gairebé mai: la gent obre l'app el diumenge al vespre, no totes el mateix
diumenge. Un canal que exigeix simultaneïtat és un canal que no s'usarà.

El repositori ja fa aquest paper dues vegades —l'**atles** i `SOS/supply/`— i
ningú ho havia llegit com el que és: **un bus asíncron, durable, versionat, amb
historial, auditable i gratis**. Cadascú hi deixa els seus rebuts signats quan
pot; qui arriba després, se'ls troba. Ningú ha d'estar connectat alhora.

Amb els rebuts de V64 això funciona sense res més: **són idempotents i s'uneixen
sense conflicte**, així que un fitxer per tema al qual tothom afegeix convergeix
sol. Sense triple entrada això hauria estat impossible; per això E11 depèn d'E1
i no al revés.

I és la peça **antifràgil** per excel·lència: cada còpia del repositori —cada
fork, cada clon, cada CDN— és una còpia més del registre. Com més gent el fa
servir, més difícil és perdre'l.

*El relé no desapareix: segueix sent el que dona la presència en viu. El que
canvia és que deixa de ser l'únic camí perquè les dades es trobin.*

**E12 · La UX la mana el full de ruta del rol** — *repara l'accés, i és la
simplificació més gran que queda*
Avui tothom veu el mateix: 13 pestanyes, 32 accions al llançador, 17 rutes. Una
persona que només ve a apuntar tres hores al mes n'ha de fer servir sis, i les
ha de trobar entre totes les altres.

Les peces hi són totes i **no s'han connectat**: `ROLE_JOURNEYS`, `activeRoleId`,
`journeyProgress`, i cada `CONTEXT_GUIDES` ja porta la seva `lens` per rol. El
que falta és que el full de ruta del rol **decideixi què es veu**, no només què
es ressalta.

És KISS de veritat: no és treure funcions —cadascuna serveix a algú— sinó que
cadascú vegi **el seu següent pas** i la resta quedi a un clic al llançador,
que per això es va agrupar a V63.

**E2 · La fusió ha de deixar rastre** — *repara R2→R1 (confiança)*
Avui el toast diu «Sincronitzat · N canvis» i **N no compta el que s'ha perdut**.
Ha de dir què ha entrat, què ha xocat i què s'ha descartat. Mentre E1 no hi
sigui, això és el mínim per no mentir; després, segueix sent el que fa auditable
una fusió.

**E7 · Un camí per dir «això s'ha trencat»** — *repara R1→R6, crea R10*
No existeix. El senyal de què falla només arriba si algú et truca. En una beta
amb gent que no et coneix, això vol dir que **no arribarà**: la gent no es queixa,
plega. Un botó que reculli context (versió, node, què feia) i el deixi enviar o
copiar. És dels més barats de la llista i és el que converteix la beta en
informació en comptes d'anècdotes.

**E8 · La còpia deixa de dependre d'una persona** — *repara R2→R11, crea R11*
Si qui sosté el node perd el telèfon, la història del node se'n va amb ell.
`exportBackup` existeix i els envelopes xifrats per membre també (V29): falta el
**rol** i la rutina que reparteixi la còpia entre diversos membres. És el que
treu R2 de ser un punt únic de fallada, i val per a totes dues betes.

### P1 · Sense això no escala

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

### P2 · Aguantar el pes

**E5 · Sincronitzar només l'àmbit compartit** — *repara R2↔R7 a escala*
`hello` envia `state.nodes` i `state.entities` **sencers**. A escala de comarca,
això és tota la comarca a cada aparellament, i creix amb el quadrat de la gent.
Enviar només l'àmbit que les dues bandes comparteixen.

**E10 · Escala de debò** — `test-escala` prova 500 nodes i 5.000 apunts. Una
comarca real amb 30 municipis és més gran, i amb E5 encara sense fer, cada
aparellament ho mou tot. Mesurar el cas de comarca abans de prometre'l.

**E9 · Pes** — 360 KB gzip, **90 % del sostre declarat**. Amb dades mòbils d'un
poble, i amb un sol fitxer no hi ha caché parcial: cada canvi es baixa sencer.
Abans d'afegir res gran, decidir si es puja el sostre o si se separa alguna cosa.

### P3 · Arribar més lluny

**E6 · Segona llengua (ca · es)** — *repara l'accés, crea R12*
`<html lang="ca">` i el text incrustat al codi. Per a una beta a Catalunya el
català no és cap barrera, i per això no és P0. Per a Euskadi ho és tot.

És l'única entrada de la llista el **cost de la qual creix cada setmana que no es
fa**: cada tanda hi afegeix text incrustat. Amb 14.430 línies ja és car; amb
20.000 ho serà més. Si Euskadi entra al pla d'aquest any, puja a P1 tota sola.
L'euskera, després, com vas dir — però la **capa** que ho farà possible és això.

---

## 6 · El que aquest backlog **no** fa

- **No toca el relat** (Comando Molekulon, cromos, panteó). Segueix sent la
  reducció més gran disponible en termes de KISS i segueix esperant que diguis
  si encara enganxa gent.
- **No puja res a Arweave.** Continua sent manual, i es diu.
- **No promet multi-node federat amb consens.** Amb E1+E3 la xarxa convergeix;
  el consens entre nodes que no es refien és un altre problema i no és el de la
  beta.
- **No inclou la traducció a l'euskera**, només la capa que la farà possible.

---

## 7 · Per on començar demà

**E1 i E7 el mateix dia**, per motius oposats.

**E1** perquè **tota la reciprocitat del mapa penja d'ell**: mentre qui aporta
pugui perdre el que ha aportat, cap altra millora canvia què li passa a la
persona que hi confia. És el més car i el més avorrit de tot el backlog, i no hi
ha drecera honesta. La prova ja està escrita: la sonda que ha demostrat el forat
és el test de regressió que dirà quan és tapat.

**E7** perquè costa una tarda i és l'única cosa de la llista que fa que la
setmana que ve **sapiguem alguna cosa que avui no sabem**. Tota la resta és
arreglar el que ja sabem que està malament.

I una que no és feina de codi: **decidir quina beta** (§3). Fins que no estigui
decidit, E1 sembla urgent o ajornable segons el dia, i això és senyal que la
pregunta que falta no és tècnica.
