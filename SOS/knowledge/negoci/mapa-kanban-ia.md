# Del mapa de valor al Kanban que s'executa sol

> Anàlisi i pla, 2026-09-25. Escrita **llegint el codi**, no de memòria: cada
> cosa que es diu que ja existeix porta el nom de la funció que la fa.

---

## 0 · La pregunta, respondre-la primer

> *«Vull que contemplis molt clarament si realment creus que la meva proposta de
> valor per agafar tracció pot ser donar-li aquest enfoc d'ensenyar a fer servir
> la IA havent fet primer un bon mapa de valor.»*

**Sí, però el titular no és «ensenyem IA».**

L'enfoc és bo i és defensable, i té una cosa que gairebé cap competidor pot
copiar: **l'ordre**. Tothom ven «IA per al teu negoci». Ningú ven «primer et
dibuixem qui dona què a qui, i després la màquina només toca el que ha de
tocar». L'ordre no és un detall de mètode — és l'única resposta seriosa a la
pregunta que enfonsa el 80 % dels projectes d'automatització: *«ho vam
automatitzar i sis mesos després s'havia trencat una cosa que ningú havia
mapat»*.

Ara bé, tres avisos que van abans de qualsevol pla:

**1 · «Ensenyar a fer servir la IA» caduca.** D'aquí a divuit mesos serà
formació de comoditat i la donarà qualsevol. **El mapa no caduca**: és
metodologia de trenta anys i costa d'aprendre. Si el titular és la IA, la
proposta envelleix amb la IA. Si el titular és el mapa i la IA és **el motiu
pel qual el mapa ara es paga sol**, la proposta aguanta.

**2 · Avui la promesa no està coberta.** `SOS/ia.html` ja diu, paraula per
paraula, «automatitzar el tangible, valorar l'intangible» i «primer es dibuixa
el mapa sencer i després es decideix què toca la màquina». **La comunicació ja
hi és; la màquina no.** El SOS d'avui et dona un Kanban de tasques que fas a mà.
El primer client que digui «ensenya-m'ho» hi trobarà una llista de coses per
fer. Això és un risc de credibilitat sobre **l'únic actiu que fa creïble tota la
resta** —l'eina oberta—, i és el motiu pel qual el pla d'aquest document posa
l'eina abans que la comunicació.

**3 · «L'agent executa la tasca» és una promesa molt més gran que «l'agent
redacta l'entregable».** Executar vol dir efectes: enviar, publicar, pagar,
signar. Tota la cultura d'aquest repositori és la contrària —`aiSuggestMap`
proposa, `aiDiscoverEntities` proposa, res entra sense que una persona ho hagi
comprovat—. Un agent que executi cartes del Kanban sol contradiu les vedes de la
casa. **La versió honesta és: la màquina produeix l'entregable, una persona
l'accepta.** És el 80 % del valor i no trenca res.

**Titular recomanat:** *primer el mapa, després la màquina* — i la IA com a
raó per la qual val la pena fer el mapa ara i no d'aquí a cinc anys.

---

## 1 · El que ja existeix (i és molt més del que sembla)

La cadena **mapa → Kanban** ja està construïda. No cal inventar-la; cal
tancar-ne tres baules.

| Peça | Funció al codi | Què fa avui |
|---|---|---|
| Mapa ideal per tipus de projecte | `PROTOTYPE_MAPS` | 5 prototips amb rols, parells tangibles/intangibles **i un `kanban` de fites** |
| Proposta de mapa | `suggestMap`, `aiSuggestMap`, `aiPlanValueFlows` | Proposen rols i fluxos; amb IA o amb heurística si no n'hi ha |
| Salut del mapa | `vnaAudit`, `buildHealth` | Reciprocitat, densitat, diversitat, rols aïllats, **concentració** i una puntuació |
| Reparació | `openReciprocityFixer`, `suggestReturn` | Llista les fletxes que surten i no tornen i proposa el retorn |
| **Mapa → sprints** | **`seedSprintPlanFromMap`** | **S1 rols → owners · S2 cada intercanvi → tasca · S3 `kanbanSeed` → entregables** |
| Carta de Kanban | `addBacklogItem` | `{title, kind, mapRef, ownerId, hours, done}` — **`mapRef` ja lliga la carta al flux o al rol** |
| Qui fa cada rol | `assignRoleMember`, `roleOwner`, `rolesSobrecarrega` | Assigna persones a rols i avisa qui en porta més d'un |
| Portes d'etapa | `stageGate`, `ventureReadiness` | No es passa d'etapa per clic: cal evidència |
| IA amb contracte | `AI_INTENTS` (8 intents) | Cada intent porta `system`, `input_schema`, `build(ctx)` i `coerce()` |

**La conclusió operativa:** *«el Kanban on s'introdueixen els entregables de
cada flux de valor»* que descrius **ja existeix** (`seedSprintPlanFromMap` +
`mapRef`). El que falta no és el Kanban: és que **la carta sàpiga quin
entregable és** i que **hi hagi una màquina capaç de produir-lo**.

---

## 2 · El model, en una regla

Tota la proposta cap en una frase, i aquesta frase és alhora l'arquitectura i
la comunicació:

> **Cada flux del mapa es converteix en una carta del Kanban.
> Si el flux és tangible i el seu entregable és d'un tipus declarat, la carta és
> candidata a la màquina.
> Si és intangible, la carta va a la persona que porta el rol — i la màquina no
> la toca mai.**

Tres conseqüències que val la pena veure:

- **El mapa deixa de ser un diagnòstic i passa a ser una configuració.** El que
  dibuixes és literalment el que després es produeix.
- **L'intangible queda protegit per construcció**, no per bona voluntat. No és
  que decidim no automatitzar les cures: és que el sistema no en té manera.
- **El valor del mapa es fa visible el primer dia.** Mapa dolent → poques cartes
  automatitzables. Mapa bo → moltes. Això és l'argument de venda més fort que
  tindràs mai, perquè **és un número, no una opinió**.

### Les tres baules que falten

**Baula 1 · El mapa ideal i la desviació.** *(És el que demanes de «marcar el
que no té i veure la desviació».)*

Avui `vnaAudit` puntua contra criteris **genèrics** (reciprocitat, densitat…).
El que falta és comparar **el teu mapa** contra **el mapa de referència del teu
tipus de projecte** —que ja existeix, és `PROTOTYPE_MAPS`— i dir-te:

- quins **rols** del model de referència no tens,
- quins **fluxos** hi hauria d'haver i no hi són,
- quins **tens tu i el model no** (que no és un error: és el teu cas, i s'ha de
  poder dir «això és meu i el model no ho preveu»).

És una **diferència entre dos grafs** amb els noms normalitzats. Tècnicament és
barat —unes 150 línies— i **és l'entregable de consultoria**: el client veu en
una pantalla què li falta per assemblar-se al que funciona.

> Cal una precaució escrita: **el prototip és una referència, no una nota.** Un
> mapa que se n'aparta pot ser millor que el model. La pantalla ha de dir
> «desviació», mai «incompliment».

**Baula 2 · L'entregable, amb tipus declarat.**

Avui una carta és un títol. Perquè una màquina la pugui produir, la carta ha de
dir **de quin tipus és el que s'ha de produir**, amb una forma de sortida
coneguda.

Aquí has parlat d'estàndards internacionals, i val més ser clar: **per a aquest
domini no n'hi ha cap que serveixi tal com és.** El que hi ha:

| | Què és | Serveix? |
|---|---|---|
| ISO 9001 §7.5 | Marc de «informació documentada» | Com a marc, sí. Com a taxonomia, no: no llista tipus |
| BPMN 2.0 | Modelatge de processos, estàndard de debò | Sobredimensionat per a un poble; ningú l'escriurà |
| schema.org / DCAT | Descriure artefactes i dades | Útil per **etiquetar** el que surt, no per generar-lo |
| Plantilla de la convocatòria | El que de debò mana a una justificació | **És l'estàndard real**, i canvia per convocatòria |

**La recomanació és no perseguir cap estàndard i declarar una taxonomia tancada
pròpia**, curta, al repositori — exactament com ja són `DYNAMICS`,
`PROTOTYPE_MAPS` i `AI_INTENTS`. Un tipus tancat amb una forma de sortida
declarada és **el que fa possible l'automatització**; un estàndard obert no ho
és. I si algun dia cal parlar amb un sistema de fora, s'etiqueta la sortida amb
schema.org i llestos.

Taxonomia inicial proposada (vuit tipus, i que costi afegir-ne el novè):

`acta` · `informe-periodic` · `justificacio` · `inventari` · `convocatoria` ·
`comanda` · `fitxa-publica` · `comunicat`

Cadascun amb: nom, què és, quins camps necessita del node, quina forma té la
sortida, i **si pot sortir d'una màquina o no**.

**Baula 3 · Un intent d'IA per tipus d'entregable.**

El patró ja hi és i no cal inventar-lo: `AI_INTENTS` té vuit intents i cadascun
porta `system`, `input_schema`, `build(ctx)` i `coerce()`. **Un tipus
d'entregable = un intent més.** El `coerce` és el que garanteix que el que torna
la màquina té la forma declarada, i això ja funciona des del primer dia.

---

## 3 · Els frens, escrits abans de construir res

Sense això, el que surt és una màquina de fer text que ningú pot defensar davant
d'una junta.

1. **La màquina proposa, una persona accepta.** Cap entregable entra al registre
   sense que algú l'hagi acceptat amb el seu `did`. És la veda de la casa i no
   es relaxa per a aquest cas.
2. **Cap flux intangible s'automatitza mai.** No com a criteri: com a **guarda
   que peta**. Si algú declara un intent d'IA per a un flux intangible, el CI
   ha de fallar.
3. **L'entregable diu qui l'ha fet.** Generat per IA, amb quin intent, quin dia,
   i qui l'ha acceptat. Un document que no diu que l'ha escrit una màquina és
   una mentida per omissió el dia que algú ho pregunti.
4. **La màquina no veu dades de persones.** Només la llista tancada de camps que
   el node hagi autoritzat, com ja fa `CAMPS_IA` al programa d'escola.
5. **Cost visible abans de cridar.** `AI_INTENTS` ja porta `max_tokens` per
   intent: la pantalla ha de dir què costarà **abans**, no després.
6. **Sense clau d'IA, el SOS segueix funcionant sencer.** L'automatització és
   una comoditat, mai un requisit. El dia que es tanqui, el registre segueix
   verificant-se.

---

## 4 · El pla · l'eina

Per ordre, i els tres primers no depenen de ningú.

| | Què | Per què aquí | Cost | Estat |
|---|---|---|---|---|
| **1** | **Desviació contra el mapa de referència** — diff de grafs contra `PROTOTYPE_MAPS`, amb rols i fluxos que falten, i els propis marcats com a propis | És l'entregable de consultoria, **es ven sol** i no necessita IA. Dona valor el primer dia | baix | **fet** (`desviacioMapa`, `openDesviacioMapa`) |
| **2** | **Taxonomia d'entregables** (`ENTREGABLES`, vuit tipus) + `kind` a la carta del Kanban + `seedSprintPlanFromMap` que l'assigna | És el contracte que fa possible tota la resta. Sense això, la baula 3 no té on agafar-se | baix | **fet** |
| **3** | **La regla de repartiment**: tangible+tipus → candidata a màquina; intangible → a la persona del rol. Amb el **comptador**: «d'aquestes 34 cartes, 12 les pot fer la màquina» | **És l'argument de venda.** I és el que fa visible que un mapa millor val més | baix | **fet** (`fluxAutomatitzable`, `repartimentMaquina`) |
| **4** | **Dos intents d'IA, no vuit**: `acta` i `informe-periodic`. Els més repetitius i els menys arriscats | Provar el patró amb dos abans de declarar-ne vuit | mitjà | **fet** |
| **5** | **Acceptació i traçabilitat** — el flux proposa → persona accepta → va al registre signat | El que fa defensable l'entregable davant d'una junta | mitjà | **fet** (`openPreparaEntregable`) |
| **6** | **La mesura**: l'esborrany es pot corregir abans d'acceptar-lo, i queda desat el text acceptat, l'original de la màquina i si es va tocar | Sense poder corregir, «acceptat» volia dir «no m'hi barallo»: el número no mesurava res | baix | **fet** (`acceptacioEntregables`) |
| **7** | **Els altres cinc intents**, un per un, mirant el percentatge abans d'afegir el següent | Si el que es mesura és baix, el problema és el mapa, no la IA | alt | en curs · `convocatoria` i `justificacio` fets, queden `inventari`, `comanda`, `fitxa` |

### La línia comptable · el que la justificació de subvenció no fa

La justificació és l'entregable que **més estalvia** —són hores d'enganxar
dades— i el que **més mal fa si falla**: un import equivocat no el veu ningú
fins que el veu qui revisa l'expedient, i llavors no és una correcció sinó un
reintegrament.

Les xifres del SOS són **estimacions amb forquilla de ±30 %** (`FUND_UNCERTAINTY`).
Una memòria d'activitat admet una estimació **dita com a tal**; una taula de
despesa no admet res que no surti d'una factura. Per això aquest intent té una
regla que els altres tres no tenen:

> **Escriu la memòria i no omple la taula de despesa.** La taula surt igualment
> —amb els conceptes i amb el document que caldrà per a cadascun, que és feina
> feta— però els imports els hi posa una persona amb els papers a la mà.

I una cosa que es va arreglar pel camí: **la pantalla passava `xifres: []`
literal**. L'informe declarava a les seves instruccions que llegiria el registre
i no li arribava mai res. No petava i no es notava, perquè tornava un informe
genèric i versemblant —que és com sobreviuen aquests defectes. Ara el context
surt de `contextEntregable`, i **cada xifra viatja etiquetada**: el recompte
d'apunts diu «exacte» i les hores i els euros diuen «ESTIMACIÓ», amb la
forquilla al costat. Si l'etiqueta no viatja amb el número, el document que en
surt la perd.

**Per què la convocatòria va abans que la justificació**, que és la que més
estalvia: perquè una convocatòria **s'equivoca a la vista de tothom** —la gent
no ve, o ve on no toca— i una justificació de subvenció mal feta no la veu
ningú fins que la veu qui no toca. Els intents es proven per ordre de *com de
ràpid es nota l'error*, no per ordre de quant valen.

**Vuit tipus, set automatitzables, cinc pendents.** `acord` no surt d'una
màquina i està escrit a la taula amb el motiu: sense aquella entrada la
taxonomia semblaria dir que tot és automatitzable i que els que falten és que
encara no els hem fet.

### El que es va trobar construint-ho

Dues coses que l'anàlisi no podia veure i la prova sí:

- **`normKind` era fail-open.** Tractava com a **tangible** qualsevol valor que
  no fos exactament `'I'` o `'intangible'`. Mentre només servia per pintar i
  comptar era inofensiu; des que el tangible és el costat que toca la màquina,
  una majúscula obria la porta. `test-entregables.mjs` ho va trobar provant
  `kind:'Intangible'`. Ara la mena es normalitza, i a més
  `fluxAutomatitzable` **exigeix que sigui explícitament tangible** en comptes
  de descartar el que sap que és intangible: una mena desconeguda cau del
  costat segur.
- **El sostre del SOS era a 508 de 510 KB gzip** i el primer intent d'IA no hi
  cabia. Es va mesurar què volia dir el sostre abans de tocar-lo, i la troballa
  va decidir-ho: el fitxer **es tornava a baixar sencer a cada visita** —10,2 s
  amb 3G lent, 2,5 amb 3G— perquè no hi havia service worker. Es va fer
  `SOS/sw.js` primer i es va pujar el sostre després: **la segona visita passa
  de 13 peticions a 1 i arrenca en 482 ms**, i ara el pes és una qüestió de
  claredat del codi i no de la tarifa de dades de ningú. El sostre puja a 540,
  amb el raonament sencer escrit a `check-kiss.js`.

**La mesura que ho governa tot**, i que s'ha de posar des del punt 4:
**quin percentatge d'entregables generats s'accepta sense editar.** Si és alt, el
model funciona. Si és baix, el mapa no és prou bo — i això també és informació
venedora.

---

## 5 · El pla · la comunicació

**El que ja hi és i no s'ha de tocar:** `SOS/ia.html` ja explica els dos fluxos i
ja diu l'ordre. És bona pàgina. El problema no és el que diu: és que **promet
una màquina que encara no hi és**.

**Per ordre:**

1. **Ara, sense construir res:** al mapa de valor de la portada i a `/sos/vna`,
   afegir **la columna que falta** — de cada flux, si és candidat a màquina o
   és de persona. El cas del celler ja hi és i ja té 9 tangibles i 7
   intangibles: **el comptador ja es pot dir avui** i és la manera més barata
   de provar el discurs abans de construir-lo.

2. **Quan hi hagi el punt 3 de l'eina:** el titular del catàleg de consultoria
   passa a ser *«el mapa et diu què pot fer la màquina i què no»*, amb el
   número del client a la proposta. Deixa de ser una promesa i passa a ser una
   mesura.

3. **Quan hi hagi el punt 5:** un paquet nou al catàleg, i **no abans**:
   *«Automatització amb frens · del mapa als entregables»*. Amb el que ja tens:
   el mapa com a prerequisit, la taxonomia com a entregable, i la mesura
   d'acceptació com a criteri d'èxit escrit al contracte.

4. **El que no s'ha de dir mai:** «agents autònoms que executen les teves
   tasques». Ni és el que farem ni és el que volem, i qui ho compra per això
   demanarà una altra cosa a la segona reunió.

**La frase de posicionament**, per si serveix:

> *No automatitzem la teva organització. Primer dibuixem qui sosté què — i
> després la màquina només toca el que no hauria de sostenir ningú.*

---

## 6 · Què faria i què no

**Faria** els punts 1-3 de l'eina en una tanda. Són barats, no depenen de cap
IA, i **el punt 3 tot sol ja canvia la conversa comercial**: un número de
quantes cartes pot fer la màquina és més persuasiu que qualsevol demostració.

**No faria** vuit intents d'IA abans de mesurar-ne un. I **no mouria la
comunicació cap a la IA** fins que el punt 3 estigui a l'eina: la promesa ja
està escrita i el que falta és cobrir-la, no dir-la més fort.

**El que em preocupa i no puc resoldre jo:** si el mercat que tens —ajuntaments,
consells, cooperatives— compra «automatització» o encara compra «ordre». La
resposta la tens tu i no jo, i canvia l'ordre de la comunicació sencera. El
punt 1 del pla d'eina val la pena igualment en tots dos casos, així que es pot
començar per allà mentre ho decideixes.
