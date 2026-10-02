# Backlog de desenvolupament SOS

Font única de veritat del desenvolupament. Cada bloc pendent es prioritza, i el
que es tanca es tanca **amb el que s'ha mesurat**, no amb un «fet».

> **Repàs del 26/09/2026.** La llista de PRs de sota **s'ha quedat al #57** i el
> repositori va pel #163: hi falten un centenar d'entrades. No es reconstrueix a
> posteriori —una llista de cent títols escrits de memòria seria pitjor que no
> tenir-la, perquè semblaria un registre. El que val d'aquest document és **el
> bloc pendent i les seccions tancades amb la seva mesura**; la llista de PRs és
> històrica i es llegeix com el que és. L'historial de debò és `git log`.

## PRs mergejats · històric fins al #57 (la llista no es manté; l'historial és `git log`)

- **#57 · Xifratge multi-membre ECDH-P256** — envelope per membre, no cal passphrase compartida
- **#56 · Cerca global ⌘K + Onboarding tour** — palette + tour de benvinguda de 4 pantalles
- **#55 · Pings offer/demand descentralitzat** — matching cross-node
- **#54 · Guardian request UI** — observer demana ser Guardian; owner valida
- **#53 · Origen Comando (Mazinguer/Horacio) + Launcher global + backlog al codex**
- **#52 · Comando Molekulon view · cromos + protagonistes + director filter**
- **#51 · Fix iPad multi-select + top-20 curats + wallet passkey + multivers**
- **#50 · Veda V16 Seny/Rauxa/Castells + 3 posts blog + marketing base**
- **#48 · Home per perfils + blog intern comercial + terme "cremades" → "sobrecarregades"**
- **#47 · Federació Guardians UI (Penrose-√població + Gini)**
- **#46 · Sabiduria UI · propostes, vots signats, consell IA**
- **#45 · AI valuation assistant + arquetips vèdic/celta/andí/secular**
- **#44 · Intercooperació entre ventures (Mondragón)**
- **#43 · Kit narratiu Molekulon (UI)**
- **#42 · GitHub OAuth device flow + IA revisa PRs end-to-end**
- **#41 · 5 nous intents IA (molekulon_invite, narrative_kit, valuation, governance, pr_review)**
- **#40 · AES-GCM xifratge per node + passphrase wrap**
- **#39 · Simulador Impacte Catalunya**
- **#38 · Molekulon Shakti/Shiva + reputació verificable**
- **#37 · Guardians · federació Penrose (model)**
- **#36 · Oracle FMV + Valor del fons**
- **#35 · Sabiduria + rols + main canònic (model)**
- **#34 · Signing als ledger writes + integritat UI**
- **#33 · did:key + firma + cadena hash**
- **#32 · AI adapter DRY + codex V11-V15**

## Bloc pendent (prioritzat)

> **Pla de millora del SOS, mesurat (10/09/2026):** `pla-millora-sos.md`. Deu
> punts amb evidència, cost i com es comprova cadascun; els tres primers són
> barats i van abans del playtest. El que hi ha aquí sota no el repeteix.


### Molekulon · fet, i el cap solt que queda

**Fet (16/09/2026):** Molekulandia és el tercer model de sèrie del SOS
(`MOLEKULANDIA_MODEL`), té pàgina pròpia a `/molekulon` i la decisió
d'arquitectura és escrita a `vision/molekulon-estat-liquid.md`: **fork del
model, no del codi** (veda 153). Esquelet de 19 nodes contra els 47 de
Catalunya; guarda `build-molekulon.js --check` amb vuit regles.

**Queda una cosa, i no és de codi:** el subdomini
`molekulon.teamtowershuma.com` necessita un *domain alias* a Netlify i un CNAME
al DNS de `teamtowershuma.com`. Mentre no hi sigui, l'adreça canònica és
`/molekulon` i la pàgina ho diu així —no promet un subdomini que no respon. Quan
hi sigui, caldrà una regla més a `_redirects` per portar l'arrel d'aquest
amfitrió a `/SOS/molekulon.html`.

**I una cosa que s'ha decidit no fer:** catàleg de colles i de taules. Els dos
nivells de baix de `MOL_GEO` són buits a posta —una llista tancada de colles
seria estructura sòlida entrant per la porta del darrere.

---

### Ordre recomanat · la meva prioritització

**Criteri**, dit abans de la llista perquè es pugui discutir l'ordre sense
discutir cada punt: (1) primer el que **avui impedeix que el SOS el faci servir
més d'una persona**; (2) després el que fa que **el valor comptat sigui just**,
perquè comptar malament durant mesos no es pot corregir després; (3) després **la
cara pública**, que és la que dona tracció però és **irreversible**; (4) al final
el que **depèn de tercers** (relés, trackers, proveïdors), que no pot ser mai el
camí crític d'una eina que ha de funcionar sense xarxa.

---

### Un CRM que s'actualitza sol · Zoho o el nostre, i què bloqueja cadascun

**Demanat per l'Àlvar (28/09/2026):** «integra'm amb Zoho o tenir muntat un
excel·lent CRM autoactualitzable en la seva màxima expressió», i **analitzar
amb IA qui és el lead a partir del seu web** per segmentar-ne el potencial de
venda.

**Què ja hi és (fet el mateix dia):** el formulari demana **el web i a què es
dediquen**, viatgen al resum, al JSON i al pont; i `crm.html` calcula el
`potencial` —alt / mitjà / baix— **amb els motius escrits al costat**, perquè
un número sol no diu si el truques per pressa o per tipus, i són dues trucades
diferents.

**El que falta, i el mur que hi ha al mig.** Les tres coses demanades
—llegir el seu web, mantenir-se al dia sol, i parlar amb Zoho— **xoquen totes
amb el mateix**: `crm.html` és una pàgina que s'obre al navegador i no té
servidor.

| El que es vol | Per què no es pot des d'aquí |
|---|---|
| Llegir el web del lead | El navegador **no pot llegir un altre domini** (CORS). I el model tampoc navega: si li passem una URL, el que en dirà serà inferit del nom, no llegit |
| Actualitzar-se sol | Sense res corrent al servidor, només s'actualitza quan algú obre la pestanya |
| Escriure a Zoho | La seva API demana un `client_secret` i un refresc de token. **Una clau dins d'un HTML públic és una clau regalada** |

**La sortida, i és una de sola:** una **funció serverless a Netlify** —ja hi som
allotjats— que faci les tres coses amb les claus al seu costat: rebre
l'enviament del formulari, buscar el web, demanar a l'IA la lectura, i empènyer
la fitxa cap a Zoho o cap al nostre magatzem.

**Ordre que proposo**, i el primer és el que més val i menys costa:

1. **Enriquiment amb IA a petició** (mig dia). Una funció que rep una URL, en
   baixa el text visible i el passa a un intent com els set d'entregables, amb
   els mateixos frens: no pot inventar, marca el que no ha trobat, i **diu
   d'on ho ha tret**. Retorna sector, mida aparent i una lectura de potencial
   **com a hipòtesi**, no com a dada. Al CRM, un botó per lead.
2. **La ingesta automàtica** (mig dia). Avui el camí és enganxar el correu o el
   JSON a mà. Netlify Forms ja rep l'enviament del diagnòstic: la mateixa funció
   pot deixar-lo escrit sense que ningú enganxi res.
3. **Zoho, o no** (un dia, i primer la decisió). Zoho aporta l'embut, les
   plantilles i l'app de mòbil. Costa que les dades dels vostres leads passen
   a viure a un tercer, que és exactament el contrari del que ven aquesta casa
   a tota la resta de pantalles. **Això no ho decideix el codi.** Si la resposta
   és Zoho, la funció escriu allà i `crm.html` passa a ser una vista; si és que
   no, el que falta al nostre és poc: recordatoris, historial de converses i una
   exportació que Zoho pugui llegir el dia que canviï la resposta.

**Els dos frens que no es negocien**, i venen escrits d'abans:

- **Cap clau al client.** Ni de Zoho ni de l'IA. Van a les variables d'entorn
  de la funció (veda de sempre: el `service_role` no surt mai del servidor).
- **El que la IA en digui és una hipòtesi i s'etiqueta com a tal.** Un
  «potencial alt» inferit d'un domini, posat al costat d'un potencial calculat
  de dades reals, es llegeix igual —i llavors ja no se sap què és què. Vedes
  156 i 158: una estimació no entra mai on s'espera una dada.

---

### El diagnòstic d'organització · fet (28/09/2026)

**Demanat per l'Àlvar (28/09/2026).** `SOS/diagnostic.html` és el **diagnòstic
comunitari**: pregunta pel teu municipi, per la població i pel teixit, i
proposa un itinerari amb subvencions públiques. Serveix per a un ajuntament,
un consell comarcal, una entitat o una cooperativa —i **no serveix per a una
empresa que truca per un taller**.

**El que es demana:** un formulari que ajudi a definir una **proposta de
diagnòstic per a una organització**, i que de passada ens digui què vol
comprar. Concretament:

1. **L'objectiu de la consulta.** No és el mateix que et demanin un
   *icebreaker* per a una jornada, un *teambuilding* d'un dia, o una millora
   d'equip amb consultoria i formació en mapa de valor. Avui tot això cau al
   mateix formulari de pressupost i s'ha de deduir del text lliure.
2. **Quin producte del catàleg** encaixa: Fent Pinya, producció
   d'esdeveniments, programa d'equip gestor, comunitats de pràctica…
3. **Segmentar el tipus d'organització**, que canvia les preguntes: una
   multinacional amb un departament de formació no es pregunta el mateix que
   una cooperativa de vint persones.
4. **Que serveixi als dos costats**: al lead, perquè se'n va amb una proposta
   i no amb un «ja et direm»; i a nosaltres, per qualificar.

**Per què no és el comunitari amb els noms canviats**, que és la temptació:
el comunitari proposa **itinerari, durada i via de finançament pública** a
partir del territori. L'organització no té subvenció municipal ni població;
té **pressupost, calendari i un dolor concret**, i el que decideix la proposta
és l'objectiu de la consulta, no el cens.

**El que ja hi ha per aprofitar:** `PROFILES` i el motor de recomanació de
`diagnostic.html`, el catàleg declarat a `build-oferta.js` amb el filtre de
sector, i `pressupost.html`, que ja recull contacte i pressupost.

**El que no s'ha de fer sense decidir-ho abans:** duplicar el motor. Si acaben
sent dos formularis amb dues taules de recomanació, divergiran —i el dia que
divergeixin ningú se n'adonarà, perquè tots dos seguiran tornant una proposta
raonable.

**Com s'ha resolt.** `diagnostic.html` és ara **la tria**; el comunitari viu a
`diagnostic-territori.html` i el nou a `diagnostic-org.html`. Els enllaços de la
portada no s'han tocat.

**L'eix no és qui ets, és què vols que passi.** Sis objectius declarats a
`build-diagnosi-org.js`, cadascun amb els paquets del catàleg que hi encaixen
**pels seus ids**, i el tipus d'organització només decideix quines preguntes
s'obren —format o dolor— i com es llegeix la proposta.

**El tipus que no existia és `agencia`**: una agència o un DMC no decideix,
revèn. El catàleg castellers del 2026 està escrit per a elles i el formulari no
en tenia ni la casella.

**Sense preu a posta**: la xifra es parla i el pont és `pressupost.html`.

**El motor no s'ha duplicat**, que era l'avís: el que es comparteix són els
blocs generats de contacte i d'organització (`build-formularis.js`, ara amb
`fam` per família), i cada branca té la seva taula.

**Queda obert i no és de codi:** confirmar que el pla de Netlify d'aquest lloc
inclou **Forms** i amb quin límit (el gratuït són 100 enviaments/mes). Si no hi
fos, el `mailto:` segueix sent la sortida i només cal no pintar el botó.

---

### Del mapa al Kanban que s'executa sol · fet, i què queda

**Fet (25–26/09/2026), PRs #160, #161 i #163.** L'anàlisi sencera és a
`../negoci/mapa-kanban-ia.md`; aquí només el que cal saber per no refer-ho.

La regla, en una línia: **cada flux del mapa és una carta. Si és tangible i el
seu entregable és d'un tipus declarat, la pot preparar una màquina. Si és
intangible, va a la persona que porta el rol —i la màquina no la toca mai.**

| Peça | Què fa |
|---|---|
| `ENTREGABLES` | Vuit tipus tancats. **Un diu que no surt d'una màquina**, amb el motiu escrit: sense aquella entrada la taula semblaria dir que tot és automatitzable |
| `fluxAutomatitzable` | Exigeix que el flux sigui **explícitament tangible**; una mena desconeguda cau del costat segur |
| `repartimentMaquina` | El número que ven, al costat del diagnòstic de salut |
| `desviacioMapa` | Què preveu el model que no tens. Diu «desviació» i **mai «incompliment»** |
| `openTipusEntregable` | Classificar un flux a mà, quan l'etiqueta no ho diu |
| `openPreparaEntregable` | Prepara → **es pot corregir** → s'accepta. Res no existeix fins que algú ho prem |
| `acceptacioEntregables` | **La mesura**: quants s'accepten sense tocar. Per sota del 70 % vol dir que falten dades al mapa |
| `openEntregableAcceptat` | La documentació, penjada de la transacció |
| `totalsComanda` | L'aritmètica de la comanda, **al codi i no al model** |
| `sedasFitxa` | El sedàs de `verifyNoLeak` per al que surt a fora |

**Els set intents hi són** (acta, informe, convocatòria, justificació, inventari,
comanda, fitxa), **17 guardes** a `check-entregables.js` totes provades
trencant-les, i 107 assercions a `test-entregables.mjs`.

**El que queda d'aquesta línia, i no és codi:** **mirar el percentatge.** La
mesura hi és i encara no té dades. Quan n'hi hagi, el número diu on cal actuar:
si és alt, el mapa és bo i l'automatització val la pena; si és baix, el problema
no és el prompt —és que el mapa no diu prou coses per escriure el document. **No
s'afegeix res més d'aquesta línia sense haver-lo mirat**, que era tota la raó de
fer-los un per un.

**Vedes que en van sortir:** 154 (acceptat sense poder corregir no vol dir res) ·
155 (una guarda que es compta a si mateixa) · 156 (una estimació no entra en una
casella comptable) · 157 (una pantalla que no es pot prémer no existeix) ·
158 (un model no suma, i una taula que ja tens no es demana) · 159 (el que surt a
fora passa pel sedàs de sempre, i el bloqueja).

---

### La UX del SOS com un Kanban sencer · assignar a una persona i documentar la transacció

**Demanat per l'Àlvar (25/09/2026).** Que tot el que es planifica visqui en un
sol Kanban; que una tasca **s'assigni a una persona** segons el context de la
tasca i qui hi està implicat; i que hi hagi **documentació associada a les
transaccions** d'un node o d'un projecte.

**El que ja hi ha, perquè no es refaci:**

| Peça | On és | Què fa avui |
|---|---|---|
| La safata única | `lesMevesTasques()` | Normalitza les onze fonts a una llista, amb filtres de territori i tema |
| Les columnes | `KCOLS` (per fer / fent / fet) | Només les targetes de tauler es poden moure: són les úniques amb estat desat |
| Mapa → carta | `seedSprintPlanFromMap` | Cada flux del mapa genera la seva carta, amb el tipus d'entregable al títol |
| Qui pot fer-ho | `fluxAutomatitzable`, `repartimentMaquina` | Diu si la carta la pot preparar una màquina o va sempre a una persona |
| Rols → persones | `roleOwner`, `assignRoleMember`, `suggestRoleMembers`, `rolesSobrecarrega` | Ja assigna **persones a rols**, amb proposta i avís de sobrecàrrega |
| Documentació | `x.entregables[]` a l'intercanvi + `openEntregableAcceptat` | L'entregable acceptat penja del flux, diu si es va corregir i guarda l'original de la màquina |
| Classificació | `openTipusEntregable` | Dir a mà quin entregable produeix un flux, quan l'etiqueta no ho diu |

**El que falta de debò, i és menys del que sembla:**

1. ~~**La tasca no té persona, té rol.**~~ **FET (01/10/2026).** `personaDeTasca(m)`
   encadena tasca → flux → rol emissor → persona, i l'ordre **és la regla**:
   primer el que ja s'ha decidit a la carta (`ownerId`), després el que deriva
   el mapa, i si el rol no té ningú **es proposa amb `suggestRoleMembers` i no
   s'imposa**. Invertir aquest ordre no petaria i aniria desfent assignacions
   fetes a mà cada cop que algú toqués el mapa: hi ha guarda a `check-perfil.js`
   i està provada trencant-la.

   A la targeta del tauler es diu **de qui és i d'on surt que és seva** —una
   tasca assignada a dit és una opinió; una derivada del mapa és el mapa
   funcionant—, i quan el rol és lliure el botó porta a `openRolePerson`, que
   ja proposa. I **les missions que fas i les que vols assignar** són un filtre
   de la mateixa llista i no una pantalla nova: «👤 Les meves» i «⚠ Per
   assignar». Era el punt 3 de l'entrada de la UX, i fer aquest l'ha fet.

   *El text original, per si cal: el flux diu quin rol el porta i `roleOwner`
   diu qui porta el rol, però ningú els encadena.*
   L'assignació **hauria de derivar-se del mapa** (el rol que emet el flux) i
   només caure a una tria manual quan el rol no té ningú o en té més d'un —i
   llavors proposar amb `suggestRoleMembers`, que ja pondera càrrega i encaix.
   *Assignar a dit el que el mapa ja diu és tornar a fer el mapa a mà.*
2. **Les onze fonts no tenen totes estat.** Moure una missió o una alerta de
   cures no es pot desar enlloc: o se'ls dona estat propi, o el Kanban ha de
   dir clarament quines targetes es mouen i quines només s'obren. Avui ho fa
   així i **és la decisió correcta**; el que falla és que no s'explica.
3. **La documentació és només de l'entregable acceptat.** Un fitxer adjunt, un
   enllaç o una nota lliure penjats de la transacció encara no hi caben.
   `EVIDENCE_KINDS`/`evidenceOf` ja fan això per a les revisions: el més barat
   és **estendre'ls a l'intercanvi**, no inventar-ne un segon magatzem. *(I quan
   es faci, el que surti a fora ha de passar per `sedasFitxa` o pel seu
   equivalent: un adjunt és la via més curta per publicar una dada de ningú
   sense voler —veda 159.)*
4. **El projecte no té la seva vista.** La documentació penja del flux; no hi ha
   cap lloc que digui «tot el que s'ha produït en aquest projecte».

**El que jo faria, i per què:** primer el punt 1 —és el que converteix el mapa
en repartiment de feina i és el que es ven—, després el 3 amb `evidenceOf`, i
deixar el 4 per al final: una vista de projecte sense res a dins no s'omple
sola. El punt 2 no és feina de codi sinó d'una frase a la pantalla.

**El sostre.** `check-kiss.js` és a 540 KB i l'app s'hi acosta. Això no cap
sencer sense pujar-lo una altra vegada, i el criteri no canvia: **es puja amb el
motiu escrit al commit, i només quan el que es compra és menys pantalles, no
més.**

---

### La portada, amb una sola jerarquia · fet (01/10/2026)

**El que es venia era una trajectòria.** El hero deia «Dels castells al flux de
valor» i les tres caselles d'evolució obrien amb TeamTowers el 2005: llegit de
dalt a baix, el producte —anàlisi, disseny i desenvolupament de sistemes pels
quals flueix el valor— no sortia fins a la quarta pantalla.

Ara el hero nomena l'ofici, les caselles van etiquetades com el que són (*la
prova que funciona*), i `#fentpinya` baixa al pis de la història. **Ordre nou:**
`dues-vistes` · `rengles` · `rols` · `enfoc` · `glossari` · `fentpinya` ·
`relat` · `xarxa` · `facilitador` · … *(`#mapaval` ja no existeix: és la primera
pestanya de `#dues-vistes`.)*

**La xarxa, dibuixada amb el propi mètode (`#xarxa`).** «TeamTowers» sortia com
a reputació —trenta-dos clients amb font escrita— i no com el que és: un mapa de
valor entre els quatre oficis de l'Àlvar i els rols d'agències, empreses i
institucions. Set rols, setze lliuraments, i **les troballes les compta el
generador**:

- **Quatre oficis i una sola persona.** Només hi ha **un** intercanvi de dins
  cap a dins (el mapa alimenta la formació i la formació torna els casos). El
  mapa no ho dissimula perquè és el que la xarxa ha de resoldre: que cada rol el
  pugui fer algú altre.
- **Les agències compren el mètode i venen la relació** — la mateixa
  particularitat que el distribuïdor del celler.
- I té **la seva vista castell**, amb el mateix `pinyaDeMapa()`: «Qui mapa el
  valor» carrega quatre vents sobre una sola posició. Era la prova que la
  derivació és general i no estava afinada per al celler.

`svgCeller` s'ha generalitzat a **`svgMapa(mapa, id)`**; el dibuix del celler
surt **byte a byte igual que abans**, que és com s'ha comprovat que el canvi no
toca res del que ja hi havia. Guarda nova: la xarxa ha de tenir **les dues
bandes** i ha de dir que **no és una llista de clients**.

**Els projectes de la xarxa (`#sos`).** La banda deia una cosa certa però curta
—que el SOS és gratuït— i no deia què se n'endú qui no ens contracta mai. Ara
són dos: el SOS (eina + setze mòduls) i el Comando (el relat obert).

**L'alt tiquet, al catàleg.** `fent-pinya-vna`, 4.500–12.000 €, `punt: 'nou'` i
`font: 'estimacio'`. Els vint anys de taller **no en són la prova**, i el camp
`punt` existeix per impedir exactament això. Hi porten dos objectius del
diagnòstic d'organització.

**El joc d'arquetips casteller al SOS.** Sisè joc d'`ARCHETYPE_SETS`, vuit
posicions amb les vuit mateixes `fn`, i el mapatge posició → funció declarat amb
el motiu al costat. Vuit línies: 538 KB de 540. Guarda: l'app i
`build-castells.js` han de dir **les mateixes posicions amb les mateixes
funcions**, provada esborrant-ne una.

**I l'arrel, que era un forat de 24 pàgines.** Hi ha 25 fitxers HTML publicats a
la raíz i **24 no s'enllaçaven des de cap lloc**: ni portada, ni README, ni menú.
Pàgines senceres —els clients, els esdeveniments del Penedès, el laboratori de
VNA, la premsa— a les quals només hi arribava qui en sabia l'adreça.

- `build-nav.js` té un grup nou **«La casa»** amb `arrel: true`, i aquelles
  quatre ja surten al menú de les 23 pàgines del SOS i de la portada.
- **`FORA_DEL_MENU_ARREL`**: les 21 restants, amb el motiu escrit. La majoria
  són **una generació anterior del lloc** (consultoria de RRHH, «Sistema
  Integral», tokenomics), publicades, indexables i signades «TeamTowers Humà»
  parlant de món corporatiu. **Decidir què se'n fa no és feina de codi**
  —actualitzar-les, posar-los `noindex` o retirar-les— i per això queda anotat.
- `events.html` **ja la signa qui la signa**: era «TeamTowers Humà» al títol, a
  l'autor, a l'`schema` i al peu d'una pàgina de producció corporativa.
- ⚠ **Pendent, i bloqueja promocionar-la més:** `events.html` porta **tres
  testimonis anònims** («Dirección de Recursos Humanos · Empresa Tecnológica
  Internacional»). A la portada, `check-landing.js` regla 10 els petaria. O se'ls
  posa font a `trajectoria.md`, o es retiren.

---

### El cas d'IKEA, amb el detall (02/10/2026)

**Dit per l'Àlvar:** a IKEA es van fer **dos mapes de valor: el de la direcció
i el de l'àrea de serveis**. Abans la paret deia només «dues aplicacions de
Value Network Analysis», que és la sigla i prou.

La fila de `trajectoria.md` ho recull amb la data i qui ho ha dit, i d'allà
surt a la paret de la portada. **La guarda que vigilava IKEA s'ha estret**: ja
no n'hi ha prou que digui «VNA», ha de dir **quines dues àrees**. Qualsevol pot
dir que ha aplicat un mètode; dir quines dues àrees es van mapar és el que ho
fa comprovable per qui hi era.

*Falten els anys.*

**I `clients.html` fora.** L'Àlvar: *«ja surt a la landing, no la vull així»*.
Deia el mateix que la paret de `#clients` i el detall de `#trajectoria` i ho
deia pitjor. `/clients` → `/#trajectoria` amb 301.

---

### Les dues llengües no arribaven a la meitat de la portada (02/10/2026)

**Demanat per l'Àlvar:** *«revisa que el form de pressupost i diagnòstic i la
home surtin ben traduïdes al cat i a l'esp»*. El que es va trobar és pitjor que
«mal traduïdes»:

| Superfície | Estat trobat |
|---|---|
| Portada · seccions escrites a mà | ✅ traduïdes (468 claus, paritat vigilada) |
| Portada · blocs **generats** | ❌ **només català** — `#rols`, `#xarxa`, `#rengles`, `#dues-vistes` senceres |
| El menú (24 pàgines + portada) | ❌ **només català** |
| `SOS/pressupost.html` | ❌ **sense cap mecanisme de traducció** |
| `SOS/diagnostic.html` i les dues branques | ❌ **sense cap mecanisme de traducció** |

**Per què no petava.** `check-landing.js` comprova que **les claus que hi ha**
quadrin: cap repetida, les dues llengües amb les mateixes, cap òrfena, cap
morta. Tot verd. *Una guarda que compta el que hi ha mai no troba el que no hi
és*, i el que faltava era clau: els generadors declaraven el text només en
català i l'escrivien a dins d'una pàgina amb dos diccionaris. Qui triava
castellà llegia el hero en castellà i **el producte en català**.

**Què s'ha fet.** El patró era a casa: `build-oferta.js` ja declarava les dues
llengües i escrivia les claus als dos diccionaris de la portada entre marques.
S'ha portat a tres generadors més:

- **`build-nav.js`** — el menú, amb `T(ca, es)` per etiqueta. Les pàgines del
  SOS són monolingües i s'hi escriu el català; la portada rep `data-i18n` i les
  claus van als dos diccionaris. 51 claus.
- **`build-castells.js`** — `POSICIONS` (11), `MENES` (3), `ON` (4), `FIGURES`
  (5), `VARIABLES` (3) i les frases dels blocs, que vivien **escrites dins de
  les funcions** i per això no es podien traduir sense declarar-les.
- **`build-mapavalor.js`** — `XARXA`: títol, lead, les tres troballes i l'avís.

De **654 claus** a la portada, amb paritat. `#rols` va de 22 fragments en
català a 1.

**On viu la mesura, i per què no és una guarda.** Es va intentar com a regla
estàtica a `check-landing.js` i **comptava 61 falsos positius**: un `<strong>`
dins d'un `<p data-i18n-html>` no té clau pròpia i no li fa falta —el
diccionari substitueix l'HTML del pare— i una expressió regular no sap on acaba
un paràgraf llarg. La mesura de debò demana el DOM i la llengua canviada, i
això és `SOS/tests/test-i18n-home.mjs`, amb **el sostre a la xifra mesurada i
una línia per secció** perquè una regressió en una no es pugui amagar darrere
d'una millora en una altra. I una asserció que el total sol deixaria passar:
**cap secció nova sense traduir**.

**El que queda, comptat: 59 fragments.** Tres coses, i cap és prosa de venda:

1. **Els `<title>` dels dibuixos** — text de ratolí a sobre. Surten dels noms
   de node i de les etiquetes de cada lliurament de `CELLER` i `XARXA`: ~80
   cadenes, i es tradueixen quan el cas es declari en dues llengües.
2. **Les frases que el generador munta comptant** —«3 vents sobre una sola
   posició»—, fetes amb trossos i una xifra. Traduir-les vol declarar cada tros.
3. **Els noms de les dimensions** d'una variable, que vénen del SOS i ja tenen
   el seu diccionari allà.

⚠ **I el que NO s'ha fet, que és la meitat de la petició:** `pressupost.html` i
els tres diagnòstics **no tenen cap mecanisme de traducció** —ni `data-i18n`,
ni `data-ca`, ni botó de llengua, `<html lang="ca">` i prou—. No és que estiguin
mal traduïts: **estan només en català**. I són justament les dues pantalles on
algú demana un preu o explica el seu cas.

Això no és posar-hi claus: és portar-hi el mecanisme sencer (diccionari, botó,
`setLang`, i la memòria de la tria) a quatre pàgines autocontingudes, i decidir
si el diccionari es declara a cada pàgina o es genera des d'un sol lloc —que és
el que faria `build-formularis.js`, que ja les escriu.

---

### Les pàgines de l'arrel només afirmen el que poden sostenir (02/10/2026)

Quedaven tres pàgines a l'arrel —`clients.html`, `curs_vna.html`,
`premsa.html`— de la maqueta anterior, al menú i **sense cap guarda**.
`check-landing.js` només mira `index.html`. Mirant-les una per una:

**`clients.html` publicava tres cites que ningú ha dit.** Atribuïdes a un
«Director de Transformación Digital» de **Telefónica**, una «Directora de
RRHH» de **Novartis** i un **CEO de BBVA**, amb inicials d'avatar i tot, i amb
afirmacions concretes («optimizar procesos clave en solo tres meses»).

Els **noms d'empresa sí que tenen font** —fila a `trajectoria.md`, que diu que
van ser clients de TeamTowers— però **les cites no en tenien cap**. És una
distinció que importa: dir que algú va ser client és una cosa; posar-li paraules
a la boca a un càrrec d'un banc és una altra, i molt més forta.

I amb elles, «100+ organitzacions transformades», «25+ països», «94 % de
satisfacció». A `premsa.html`, «50+ aparicions», «15+ països», «5M+ d'abast».
**Cap amb font.** Xifres rodones, que són les que més fàcil es repeteixen i les
que menys es poden defensar.

**Què s'ha fet.** Les cites, fora. Les xifres agregades, fora, i al seu lloc
les tres que es poden defensar —32 clients amb font, 20 anys, 2 aplicacions de
VNA a IKEA— més la frase que diu **el que no consta**: «de cada client consta
que ho va ser; de la majoria no consta quina entrega concreta va ser».

I els enllaços: les tres pàgines apuntaven a mitja generació retirada
(`/valor`, `/app`, `/coops`, `/rrhh`, `/equip`, `/colla`) i a tres adreces que
**no han existit mai** (`/contacto`, `/masia`, `/prensa`). Ara van on viu ara
allò, no a una redirecció que diu «ja no hi és».

**La guarda: `check-arrel.js`** (a CI). Quatre regles, i la primera no és la
que semblaria:

1. **Cap cita.** No «cap cita sense font»: **cap cita**. Al coneixement de la
   casa no hi ha ni una sola declaració de client recollida, o sigui que
   qualsevol que aparegui l'ha escrit algú de dins. El dia que n'hi hagi una de
   debò es posa la fila a `trajectoria.md` i es relaxa **a posta**, que és
   diferent de no tenir la regla.
2. **Cap xifra agregada sense font.** Les permeses es declaren a `XIFRES` amb
   la fila que les sosté. Afegir-ne una vol dir afegir la font primer.
3. **Cap enllaç intern cap a enlloc** — val un fitxer o una redirecció
   declarada a `_redirects`, i res més.
4. **Tota pàgina diu qui la signa** (`<meta name="author">`): una pàgina sense
   autor no es pot revisar.

Provada trencant-la per les dues bandes: posant una xifra de 5M+ i posant una
cita. Les dues petan.

> **El que de debò hi havia aquí**: *una pàgina que no té guarda no és una
> pàgina que estigui bé, és una pàgina que ningú ha mirat.* Tres pàgines al
> menú i cap regla, i el que hi havia a dins eren cites inventades a nom de
> tres empreses reals.

⚠ **El que queda, i és per a l'Àlvar:** `premsa.html` llista **aparicions
datades concretes** —«Quarts de Nou (TV3), 22/10/2022», i quatre més— que **no
tenen fila a `trajectoria.md`**. Són prou específiques per ser reals i per això
no s'han tocat; l'únic mitjà documentat al coneixement és l'article d'*El
Periódico* del 2007. Cada aparició vol la seva fila: mitjà, data i enllaç o
«només en emissió».

---

### L'arrel, neta (01/10/2026)

**Decidit per l'Àlvar**, després que el registre d'orfes fes visible el
problema: *«events quitala, fes neteja»*.

Hi havia **25 fitxers HTML publicats a la raíz i 24 sense cap enllaç** des de
la portada, el README o el menú. La majoria eren **una generació anterior del
lloc** —consultoria de RRHH, «Sistema Integral», tokenomics, dues apps de VNA—
indexables i dient una altra cosa sobre el mateix que diu la portada d'avui. Un
lloc que diu dues coses no en diu cap.

**Retirades (18):** `events.html`, i amb ella `app`, `app_coops`, `colla`,
`lacolla`, `comptabilitat`, `comptabilitat_de_valor`, `coops`, `rrhh`,
`sistema_integral`, `valor`, `mapas`, `equip`, `tokenomics`,
`tokenomics_config`, més tres fitxers morts (`dev`, `devs`, `test`).

**Queden 7:** `index.html`, `clients.html`, `curs_vna.html`, `premsa.html` (les
tres últimes, al menú), `home-nova.html` (esborrany amb `noindex`),
`finances.html` i `ia.html` (eines internes, amb el motiu escrit).

**Cada adreça té la seva redirecció 301**, i cap va a la portada per defecte:
`/valor` i `/mapas` → `/SOS/vna.html`, `/comptabilitat_de_valor` →
`/SOS/formacio.html`, `/equip` → `/#facilitador`, `/events` i la resta →
`/#cataleg`. *Una redirecció a l'arrel és una manera elegant de dir «ja no hi
és»: qui buscava mapes de valor ha d'arribar als mapes de valor.*

I els enllaços cap a `/events` que quedaven a les pàgines supervivents
(`clients.html`, `premsa.html`) s'han tret: un enllaç mort dins d'una llista
deixa un punt buit i no peta mai.

**El registre `FORA_DEL_MENU_ARREL` es queda**, i és el que impedeix que això
torni a passar: una pàgina publicada i no enllaçada ha de ser una decisió amb
el motiu escrit. *Un registre d'orfes no era la solució —era la llista d'un
problema—, però és el que el va fer visible.*

⚠ **El que encara queda:** `clients.html`, `curs_vna.html` i `premsa.html`
segueixen sent de la maqueta antiga i no han passat per la guia de marca. I els
tres testimonis anònims eren a `events.html`, que ja no hi és.

---

### El zoom · primer tram fet (01/10/2026)

**El gest ja hi és.** El mapa d'un node es dibuixava sol i el que hi ha a dins
es navegava per l'arbre del costat: **un explorador de fitxers al costat d'un
graf**, dues maneres d'ensenyar la mateixa jerarquia. Ara els llocs de dins
surten **al centre del mapa** i clicar-hi el fa el mapa sencer.

És **zoom semàntic** i no un llenç amb pinça i rodeta: 6 KB, cap llibreria, i
el gest reusa `selectNode` i `ancestors`, que ja hi eren. Tres decisions:

- **La forma distingeix.** Un rol és un cercle i un lloc un rectangle rodó. Si
  tots dos fossin cercles, clicar-ne un faria dues coses diferents sense avisar.
- **Cada lloc diu què hi trobaràs abans d'entrar** (`zoomDins`): quants rols,
  quants intercanvis, quants llocs a dins — o «encara sense mapa». Entrar en un
  lloc buit sense saber-ho és el que fa que la gent deixi de clicar.
- **La molla de pa** (`vnaMolla`) va a sobre del llenç. Un zoom sense sortida és
  un cul-de-sac, que és la veda 62.

**I el cas que abans amagava el que hi havia:** un node amb llocs a dins i cap
rol propi deia «afegeix rols» i **no ensenyava els llocs**. El mapa amagava
justament el que hi havia.

**El sostre: 540 → 546 KB**, amb el motiu escrit a `check-kiss.js`. El criteri
no canvia —es puja quan es compren *menys* pantalles— i aquí és literalment
això: l'arbre passa a ser una drecera, no l'única manera d'arribar enlloc.

**La guarda, i com es va provar.** `check-vna.js` comprova que els fills
arribin al llenç, que entrar-hi passi per `selectNode`, que cada lloc digui què
té, que s'obrin amb teclat i que hi hagi camí de tornada. Provada traient la
crida del dibuix — i **la primera versió de la guarda deia que tot anava bé**:
`children()` seguia escrit i calculat, i no arribava a la pantalla. Es va haver
d'estrènyer per exigir que s'enganxi, no només que es llegeixi. *Llegir-los no
és pintar-los* — la mateixa classe de defecte que el marcatge viu amb el CSS a
l'altra pàgina.

`test-zoom.mjs` (20 assercions) hi afegeix la que la guarda no pot veure:
**entrar pel mapa ha de moure l'arbre del costat**. Si no passés per
`selectNode`, el graf canviaria i l'arbre es quedaria assenyalant el node
anterior — i l'app quedaria en dos estats segons per on hi hagis entrat.

**El que queda d'aquesta petició** (l'entrada de sota segueix sent vàlida):
entrar als edificis que tenen pàgina pròpia (`einaDe` ja hi és i la icona ja
surt, però el clic encara va al node i no a la pàgina), i la matriu com a
pàgina que ho expliqui.

---

### El zoom · «més intuïtiu que un paper i un llapis» (demanat 01/10/2026)

**Demanat per l'Àlvar**, i és una petició de **model d'interacció**, no de
pantalla: la matriu (`/SOS/matriu.html`) i la nova UX d'usuari final del SOS han
de ser **més intuïtives que un paper i un llapis** on dibuixes les teves xarxes
de valor —rols, transaccions tangibles i intangibles, i entregables.

> **La clau és el zoom.** Hi ha **un sol graf** amb el teu mapa de valor sencer,
> i s'hi fa **zoom** sobre un entorn, un projecte o un edifici —la biblioteca,
> el banc, la botiga, els serveis, el bar— i continues dins. Per a una empresa,
> el mateix gest és **un zoom dins del graf del SOS**.

**Per què això és una peça i no un retoc.** Avui el SOS té el mapa de valor en
una portada (`homeView='mapa'`), Molekulandia com a model del poble sencer, i
els edificis com a pàgines separades (`/SOS/compra.html`, `energia.html`,
`habitatge.html`, `banc-temps.html`, `biblioteca.html`). **Són el mateix graf a
escales diferents i avui es naveguen com a llocs diferents**: qui hi entra ha
d'aprendre's un mapa de pàgines en comptes de moure's per un de sol.

El zoom ho col·lapsa: **una sola superfície i un sol gest.** No és una vista
nova —és la que hauria de fer innecessàries unes quantes, i per això encaixa amb
el sostre (`check-kiss.js`: 5 portades de 5, 538 KB de 540) en comptes de
lluitar-hi. *El criteri de sempre: es puja el sostre quan el que es compra són
**menys** pantalles, no més.*

**El que ja hi ha i s'hi ha de cosir, no escriure:**

| Peça | On és | Què aporta al zoom |
|---|---|---|
| `expandPairs`, `mapFlowsOf` | l'app | el graf: rols i intercanvis amb les dues menes |
| `ENTREGABLES`, `entregableDe` | l'app i `build-mapavalor.js` | els entregables, que són la tercera cosa que es dibuixa |
| `pinyaDeMapa()` | `build-castells.js` | **la segona vista del mateix graf**, ja derivada i provada |
| `DYNAMICS`, `EINES_SOS`, `einaDe` | `build-nav.js` i l'app | quin edifici correspon a quina dinàmica: **el destí de cada zoom** |
| `descendants`, `subtreeIds`, `scopeIds`, `rollup` | l'app | l'escala ja existeix com a dada; el que falta és el gest |
| `PROTOTYPE_MAPS`, `protoSuggerit` | l'app | què dibuixar quan encara no hi ha res |

**El que no s'ha de fer:** un llenç nou al costat del que hi ha. Dos llocs on
dibuixar el mateix graf divergirien el primer dia, i no petaria res —seria la
mateixa classe de defecte que les dues vistes que no es parlaven.

**La prova que no és automàtica, i que és el criteri que ha demanat ell:** posar
algú davant amb un projecte seu i que **dibuixi el seu mapa sense que ningú li
expliqui res**. Si necessita una explicació, el paper i el llapis guanyen.

---

### A qui es ven això · del ciutadà al family office

**Dit per l'Àlvar el 01/10/2026**, i canvia el que es construeix: el mateix
sistema serveix **empreses, cooperatives, xarxes, comunitats, autònoms,
ciutadans i persones**, i a sobre s'hi poden muntar **productes de luxe per a
client premium corporate o d'estil *family office***.

**L'arquitectura ho aguanta i convé dir per què**: el graf i el zoom són els
mateixos per a tots; el que canvia és **l'escala i l'acompanyament**. Un
ciutadà dibuixa el seu mapa sol i de franc; un *family office* compra que algú
el dissenyi, el sostingui i respongui. **El producte car no és un programa
diferent: és el mateix amb una altra entrega** —i això és el que fa que el
regal i el preu alt no es contradiguin.

*El que falta per poder-ho vendre així: el tram alt del catàleg només té
`fent-pinya-vna` (nou, 4.500–12.000 €). Un producte d'estil family office vol
dir dir què s'entrega, quantes vegades s'ha fet i amb quins diners es paga —els
set camps de sempre— i mentre no s'hagi entregat cap vegada, `punt: 'nou'`.*

---

### Desenvolupament de negoci · els fronts oberts (01/10/2026)

**Llista de l'Àlvar**, per seguir desenvolupant negoci. No són clients
entregats: són **fronts de desenvolupament**, i es diu perquè la diferència
importa.

| Front | Què és |
|---|---|
| **Fent pinya** | L'experiència castellera, i ara el paquet `fent-pinya-vna` |
| **SOS** | L'eina i la formació-acció |
| **Cal Segue** | Front obert al territori |
| **Events Penedès** | Producció i dinamització · `events.html` |
| **La bodega de Sara** | Front obert · celler |
| **Elisa Solache** | Front obert |
| **Vanguardia Vintage** | Front obert |
| **La Teresita** | Front obert |

> ⚠ **Cap d'aquests noms pot sortir a la portada com a client** fins que tingui
> **fila a `SOS/knowledge/negoci/trajectoria.md`** amb qui ho ha dit i quan.
> `check-landing.js` (regla 10) ho peta, i amb raó: un nom d'empresa a una
> pàgina pública és una afirmació sobre un tercer. Aquí hi són com a **feina a
> fer**, que és una altra cosa i no es publica.

**El que cal de cada front, i és sempre el mateix:** què se li ven del catàleg,
en quin estat està la conversa, i si ja hi ha entregat alguna cosa —perquè el
dia que n'hi hagi, és el que converteix `punt: 'nou'` en `punt: 'provat'`, que
és l'única manera honesta de fer-ho pujar.

*Això és feina de CRM i el CRM ja existeix (`/SOS/crm.html`, fora del menú a
posta perquè hi ha converses de gent real). L'entrada «Un CRM que s'actualitza
sol» d'aquest mateix document és el que falta per no portar aquesta taula a mà.*

---

### El dibuix de la colla i el graf declarat no diuen el mateix

Arreglat el cas que es va veure —**les mans i els laterals sortien com a dos
cercles solts** a la portada, quan són el primer cordó i qui aguanta els
segons—, i posada la guarda que llegeix el dibuix i no només les dades
(`check-vna.js`, regla 5).

Però mirant-ho de prop, **el dibuix de la portada i els `FLUXOS` de `vna.html`
divergeixen en més coses**, i no s'han tocat perquè cadascuna és una decisió
sobre castells i no sobre codi:

| Al dibuix | Al graf declarat |
|---|---|
| `musics → baixos` pintat d'intangible (taronja, discontínua) | Declarat **tangible**: «la melodia diu on és l'Enxaneta» |
| `enxaneta → cap` pintat d'intangible | Declarat **tangible**: «l'aleta valida la càrrega» |
| Fletxa cap a les **crosses** des dels baixos | Declarat al revés: `crosses → baixos` |
| `cap → terços` i `cap → enxaneta` dibuixats | **No existeixen** a `FLUXOS` |
| `musics → segons` dibuixat | **No existeix** a `FLUXOS` |

Dues sortides, i s'ha de triar:

1. **El dibuix passa a generar-se del graf.** És el patró de la casa i acaba amb
   la divergència per sempre, però un mapa de castell col·locat automàticament
   queda pitjor que el que hi ha, que està posat a ull i es llegeix bé.
2. **Les arestes del dibuix porten `data-de` i `data-a`**, i la guarda compara
   una per una contra `FLUXOS`. Més barat, i deixa el dibuix tal com està.

La segona sembla la bona, però obliga a decidir abans **quina de les dues
versions és la correcta** a cada fila de la taula —i això ho sap qui sap de
castells, no el codi.

---

### Els fluxos de comunicació entre persones · anàlisi, i el forat que hi ha al mig

**El defecte, dit en una frase: el SOS sap registrar un fet que ja ha passat i
sap confirmar-lo, però no té cap estat per a un fet que s'està acordant.** Entre
«algú ofereix» i «queda apuntat al registre» hi ha una conversa, un compromís i
una feina, i ara mateix aquestes tres coses passen fora de l'eina —al WhatsApp
del grup, al carrer— i tornen al SOS quan ja estan fetes.

Es nota en dos llocs, i el segon és el que va fer saltar això:

- **Des d'una coincidència** (`supplyMatches`), el disseny actual «tanca
  l'intercanvi directament» des del resultat. No hi ha cap pas de «m'interessa».
  Qui troba la coincidència ha d'anar a buscar l'altra persona pel seu compte.
- **Des d'una tasca** (`lesMevesTasques`), dir «m'hi poso» obre la pantalla
  d'apuntar l'intercanvi. Però si encara no l'has fet, aquella pantalla et demana
  que declaris una cosa que no ha passat. **El botó és correcte i la pantalla que
  obre no.**

#### Què hi ha avui, per no reinventar-ho

| Peça | Què fa | Què no fa |
|---|---|---|
| `chatOf(node)`, `postChat`, `renderXat`, `chatInbox` | **Un mur per node.** Tothom del node el llegeix | No hi ha fil entre dues persones, ni fil per assumpte |
| `CHAT_REFS` | Un missatge **pot citar** un flux, un apunt, una tasca, una iniciativa, un objecte o una oferta | Res del citat apunta cap enrere al missatge: la conversa és un cul-de-sac |
| El xat d'`online.html` | 1 a 1 de veritat, xifrat, entre dos `did`, pel relé | Viu **al directori i no a l'app**, i no sap res de tasques ni d'ofertes |
| `supplyMatches` / `openMatchesModal` | Troba parells oferta ↔ demanda, fins i tot entre nodes veïns | No obre conversa: o tanques l'intercanvi o no passa res |
| `submitEntry` → `pendingInbox` → `confirmPending` | **La meitat de després funciona bé**: un apunt no compta fins que l'altra part el confirma | Només serveix per a fets consumats |
| `reserveObject` | **El precedent que ja existeix**: un objecte es pot reservar abans de prestar-se, amb llista d'espera | Només per a objectes. Una hora o un coneixement no es poden reservar |

Aquesta última fila és la pista: **per als objectes, l'estat intermedi ja el vam
necessitar i el vam fer.** Per a les hores i el coneixement, no — i són la major
part del que es mou.

#### Els estats que falten

Avui n'hi ha dos: *no existeix* → *apuntat i pendent de confirmar* → *confirmat*.
En falten tres al mig, i cadascun ha de poder-se deixar a mitges sense embrutar
el registre:

1. **Interès** — «això em serveix» / «m'hi poso». No compromet ningú i no toca el
   registre. És el que hauria d'obrir el botó de la tasca, en comptes de la
   pantalla d'apuntar.
2. **Acord** — les dues parts diuen què, qui, quan i quant. Aquí sí que hi ha dos
   noms i una data. **No és un apunt**: és una promesa, i una promesa que no es
   compleix s'ha de poder tancar dient-ho, no esborrant-la.
3. **Fet, i encara no apuntat** — la feina està feta i falta escriure-la. És
   l'estat on avui la gent es queda i des d'on es perden les hores.

Només després ve `submitEntry`, que ja hi és i ja funciona.

#### La conversa

**No es fa una missatgeria nova.** Cada acord obre **el seu fil, penjat del
context**, i el xat del node segueix sent el mur. Una safata de missatges sense
assumpte torna a ser un WhatsApp, i el WhatsApp ja el tenen.

#### Les dues decisions, preses

**1 · El fil penja del context, no de les persones.** Del subnode, del projecte
o de la iniciativa a la MATRIU, de l'objecte, de l'oferta o del flux
d'intercanvi. No hi ha safata de missatges directes.

És la decisió correcta i val la pena dir per què, perquè és el que evita el
projecte que ningú vol: **una missatgeria.** Un fil que penja d'una cosa sap de
què parla, es pot tancar sol quan aquella cosa es resol, apareix on és útil —a
sota de la tasca, no en una safata a part— i no genera la obligació d'estar
disponible que té un xat obert. `CHAT_REFS` ja té les sis menes de context i
`chatRefsFor` només ofereix les que existeixen de debò al node: la meitat de la
feina està feta.

Tres coses que la decisió arrossega i que s'han de resoldre en implementar-la:

- **La visibilitat del fil no és la del context.** Un objecte o una tasca són del
  node i els veu tot el node; el fil d'un acord entre dues persones, no. El fil
  **penja** del context i **es veu** només qui hi és, fins que es converteix en
  apunt. Si s'hereta la visibilitat del context, la decisió 2 queda desfeta el
  primer dia.
- **Un context pot ser de dos nodes.** Una coincidència entre nodes veïns no
  penja d'un node sol. La sortida barata: el fil viu al node de qui l'obre i
  l'altra part hi entra pel `did`, que és com ja funciona la resta.
- **Quan el context desapareix, el fil no.** `chatRefAlive` ja resol això per als
  missatges del mur: una referència que ja no existeix es marca de morta, no
  s'amaga. El fil ha de fer igual —una conversa sobre una oferta retirada segueix
  sent la prova del que es va acordar.

**2 · Un acord que encara no s'ha complert no és públic.** Un apunt confirmat sí
que ho és, per disseny. Un acord, no: dir en obert qui ha promès què i no ho ha
fet és una llista de deutors, i això no és aquesta eina. El veuen les dues parts
fins que es converteix en apunt.

#### La pantalla de tasques com a lloc principal

L'encàrrec és que `lesMevesTasques` passi de ser una pestanya a ser **la
pantalla per defecte**, amb la planificació a la vista i el botó que et posa a la
feina. Tres coses concretes:

- **Veure el planning, no només la llista.** Les tasques ja porten columna
  (`tascaCol`) i flux del mapa (`fluxDeTasca`); falta l'eix del temps, que ja
  existeix als sprints (`sprintsOf`, `sprintProgress`) i que la pantalla de
  tasques encara no llegeix.
- **«M'hi poso» ha de portar a l'estat 1, no al registre.** És el canvi més petit
  de tots i el que arregla el que es va notar.
- **Un botó per tasca que sigui el següent pas de debò**, que segons la tasca és
  obrir el fil, reservar, o apuntar — i no sempre apuntar.

I el sostre: `SOS/index.html` va molt just de mida (`check-kiss.js`). Això no és
una miniapp més, és treure passos de sobre; però si cal pujar el sostre, es puja
amb el motiu escrit al commit, com diu el CI.

**Res d'això s'ha implementat.** És l'anàlisi que es va demanar, per poder
decidir l'ordre; el primer pas barat i aïllat és el botó de la tasca.

---

### La intro del Comando · esborrany de guió fet, rodatge pendent

`SOS/intro.html` explica el SOS —el problema dels projectes ciutadans i l'eina
que hi posa esquelet— i feia de portada del Comando perquè no n'hi havia cap
altra. Una intro que explica l'eina no presenta la història (veda 150).

**Fet:** el guió d'una intro pròpia del Comando, declarat a `build-comando.js` i
escrit a `knowledge/vision/comando-intro.md`. Catorze plans, 1:45, tall de 30 s.
**És la història dels dos còmics publicats**, en el seu ordre: els dos-cents
milions → el mandat del Gran Molekulon → Purpleman i l'aire → l'abric de cuir
d'Afrodito → el bajón de l'Omni Turd 6300 → el col·lapse de Matadeón → el paper
higiènic de Mr. McGragor → el forat de cuc → el páramo i la llavor → l'acte III.
Acaba amb la pregunta «i tu, t'hi apuntes?» i dues portes: `index.html#/alta` per
a qui vol fer-se el personatge ara i `uneix-te.html` per a qui només vol dir què
fa al barri.

Onze dels catorze plans citen un tros de la història publicada a `comando.html` i
el generador comprova que hi sigui: un guió que resumeix una història s'equivoca
inventant-se un detall que sona bé, i això no peta mai sol.

**Trobat revisant-ho, i no arreglat aquí:** dels tres supervilans de
`COMANDO_VILLAINS`, només **Mr. McGragor** surt a `comando.html`. **Max Miedox**
(la por que paralitza abans de començar) i **Mala Yerbax** (el rumor que corroeix
la confiança) viuen només dins de l'app, i són els dos que més se semblen al que
mata un projecte ciutadà de debò. La pàgina té secció d'herois i no en té de
vilans. No s'ha fet aquí perquè seria eixamplar un encàrrec de guió a una secció
nova de la pàgina, però és una pantalla que falta.

**Comprovat, perquè era la por raonable:** no dupliquem l'alta. Hi ha **un sol
registre** (`openSuperheroiOnboarding`, ruta `#/alta`), i tant `comando.html` com
`uneix-te.html` només hi porten: cap de les dues té formulari propi. El
vocabulari tampoc està partit —el formulari ja demana «superpoders» i
«superarmes». Ara hi ha guarda que ho manté així (veda 151).

**Pendent, i no és de codi:**

- **Que l'autor el corregeixi.** La veu en off és una proposta. Els noms, l'ordre
  i el to els sap ell.
- **Les imatges del còmic.** Vuit plans necessiten vinyetes que ja estan
  dibuixades (1, 2, 3, 4, 7, 8, 11, 12) i el guió les demana una per una. Dos
  plans són captura de pantalla de l'app i es poden gravar avui; dos són rodatge
  curt de carrer. Tres surten de material que ja existeix: la Bomba Disco, el
  directe de la Floresta i Mr. McGragor. Van a `SOS/media/`.
- **Un nom que no he pogut identificar.** A la conversa hi va sortir un
  supervilà que a la transcripció es llegeix «Dalgaltras», i no és a
  `COMANDO_VILLAINS` ni surt enlloc del repositori. No l'he inventat ni l'he
  desat: si existeix, cal el nom ben escrit i què fa. Els que sí que hi són:
  Max Miedox, Mala Yerbax i Mr. McGragor.
- **Si es munta, on va.** Avui `intro.html` és al menú com «La intro». Amb dues
  intros s'ha de decidir si la del Comando viu a `comando.html`, si té pàgina
  pròpia, o si `intro.html` es reparteix en dues. No s'ha decidit i no s'ha de
  decidir des del codi.

El final de la història **no** és al guió ni hi ha d'entrar: no és en aquest
repositori.

---

### Els nicks reservats dels fundadors del Comando · fet

L'encàrrec deia «crea els usuaris al directori de tots els fundadors». Fet
literalment seria publicar dotze fitxes a nom de dotze persones reals, firmades
per una clau que no és la seva. Fet a l'inrevés: **reserva pública + convit +
alta signada per la persona.** Veda 148.

- `SOS/tools/build-convits.js` declara les dotze reserves (nick ↔ fundador de
  `COMANDO_FOUNDERS`) i escriu `CONVITS` a `online.html`. Al repositori hi ha
  **el hash del codi i no el codi**: `--nou <nick>` l'encunya, l'ensenya un sol
  cop amb l'enllaç fet, i dona la línia per enganxar.
- `online.html#convit=<codi>` obre l'alta amb el nick posat i un cartell que
  diu tres coses: aquí no hi havia cap fitxa teva, la que publiquis la firmarà
  la teva clau, i **reservar no bloqueja el nick a ningú**. El camp no es
  bloqueja: un convit no és una assignació.
- `test-convit.mjs` (19 assercions) prova sobretot el que **no** passa: no es
  publica res, un codi que no és no obre res, una reserva sense codi encunyat no
  s'obre amb un codi buit, i una fitxa amb el nick reservat i el did d'un altre
  no passa la validació.

**El que queda i és de l'autor:** encunyar els dotze codis i donar-los. La
pàgina i el document ja diuen quantes reserves tenen codi i quantes no.

---

**P0 · Les dues dinàmiques fundacionals no tenen pàgina** — **fet**

> **Fet**: `SOS/banc-temps.html` i `SOS/biblioteca.html`, amb `build-comuns.js`
> (la fita, el tauler, el mapa de valor, la governança, els dos modes d'objecte
> i les dues taules de valor, tot llegit de `DYNAMICS`, `ORACLE_OBJECT_DEFAULTS`,
> `WEAR_RATES`, `LIBRARY_TYPES` i `OBJECT_MODES`), `check-comuns.js` amb sis
> regles provades trencant-les, `test-comuns.mjs` (23 assercions) i les dues
> entrades a `EINES` de `build-nav.js`, que ja no apunten a l'app. Veda 149.
>
> **Troballa pel camí**: `LIBRARY_TYPES` declara dotze tipologies i
> `ORACLE_OBJECT_DEFAULTS` només en té onze — **`jocs` no té valor base** i cau
> a «altres» (70 €). No és un error de càlcul, l'app fa exactament això, però és
> una taula incompleta que no havia mirat ningú. El generador ho diu cada
> vegada que corre. **Queda decidir quant val de debò un joc de taula**, que ho
> diu qui coneix el fons, no el codi.
>
> **El que queda d'aquesta part**: el suport mutu i les cures segueixen sense
> pàgina, i és la tercera dinàmica d'entrada fàcil. La seva té un problema
> propi que les altres dues no tenen —els noms de qui rep cura no poden sortir
> de la sala— i per això no s'ha fet de passada.

De les dotze dinàmiques del catàleg, sis ja tenen la seva pàgina pública —La
Compra, L'Energia, L'Habitatge, la MATRIU, el mapa de valor i Molekulandia— i
**les dues que expliquen què és el SOS, no**:

| Dinàmica | Pàgina | Avui |
|---|---|---|
| Banc de temps | **falta** | `EINES` a `build-nav.js` diu `index.html` · «A dins de l'app» |
| Biblioteca de les coses | **falta** | igual |
| Suport mutu / cures | falta | igual |

És l'error de sempre girat del revés: hi ha pàgina per a les dinàmiques
d'entrada difícil i no per a les dues que qualsevol entén de seguida i que són
**per on comença tothom**. Qui arriba a la portada i vol saber què és un banc de
temps ha d'obrir l'aplicació sencera, que és demanar-li una decisió abans de
respondre-li la pregunta.

El que ha de portar cadascuna, amb la mateixa espina que ja tenen les altres
sis: què és amb una frase que no faci servir la paraula «plataforma», com
comença un grup de zero, què passa el primer dia i què el sisè mes, què compta
com una hora i qui ho confirma, i la porta a l'eina. La biblioteca, a més, ha de
dir la part que ningú explica i és la que fa fallar la dinàmica: **què passa
quan una cosa es trenca o no torna** —el SOS ja ho calcula (`WEAR_RATES`,
`loanValue`, `recordLoanWear`, `logRepair`) i cap pàgina ho diu.

Quan existeixin, entren a `EINES` de `build-nav.js` i al menú; la guarda del menú
ja comprova que cada dinàmica del catàleg tingui una eina que existeix.

---

**P0 · El comptador del Comando, petit i sempre a la vista** — pendent

Avui el compte cap als 150.000 només es veu obrint el modal del Comando. Ha
d'estar **a la barra de l'app, petit, i actualitzar-se** quan el número canvia
—no només en carregar la pàgina.

Tres coses que decideixen si això és útil o soroll, i que van escrites abans de
fer-ho:

- **Quin número.** El del Comando (`comandoRoster().length` sobre
  `COMANDO_TARGET`) i no el fons: el fons ja té la seva portada (`#/fons`) i és
  una xifra en euros que a la barra no es pot llegir de reüll. *Si el que volies
  era el fons, digues-m'ho i giro l'eix.*
- **Que s'actualitzi de debò.** Un comptador que es pinta un cop i es queda
  mentint és pitjor que no tenir-lo: ha de repintar-se quan hi ha una aportació
  nova, que és quan el número canvia.
- **Que no menteixi el que compta.** «Superherois validats» vol dir gent amb
  alguna cosa registrada i confirmada, no altes. Ja va passar un cop que això
  comptava socis de qualsevol node i s'etiquetava «validats»; el comptador de la
  barra no pot tornar-hi.

---

**P0 · El repte, dit per als dos sectors · i el mapa de valor privat** — (a) fet, (b) pendent

Dues coses que van juntes perquè totes dues surten del mateix: **la
metodologia és una i els productes són dos**, i avui la portada només explica
el repte d'un dels dos.

### (a) `#enfoc` i la resta de seccions: un sol repte, dos sectors — **fet**

> **Fet**: `#enfoc` reescrit amb les dues bandes de costat i les mateixes tres
> preguntes, la frase pont, dues portes noves al catàleg que filtren de debò
> (el selector del filtre ja no depèn d'un contenidor), `#relat` amb la
> trajectòria corporativa que ja teníem documentada, `#fentpinya` dient que va
> néixer per a equips d'empresa, `#cost` dient que el sostre de 5.000 € és una
> regla de l'administració i no una tarifa, i dues objeccions noves —com es
> contracta des d'una empresa, i què passa amb el que el mapa revela sobre
> persones. Cinc regles noves a `check-landing.js`, totes provades trencant-les,
> i les seccions 9 i 10 de `test-portada.mjs`. Veda 147.
>
> **El que queda d'aquesta part**: els formularis. `diagnostic.html` i
> `pressupost.html` ja pregunten quina mena d'entitat ets (`ORGS` amb el seu
> `sector`) i el text del voltant encara no canvia amb la resposta.

El diagnòstic original, que és el que això venia a arreglar:

El hero ja obre dues portes —empreses i cooperatives / ajuntaments, consells i
entitats— i el catàleg ja filtra per sector. **La secció del repte, no.** Diu:

> «La majoria de **projectes ciutadans** —bancs de temps, biblioteques de coses,
> comunitats energètiques, horts comunitaris— neixen amb una empenta enorme de
> voluntariat… Dues o tres persones ho sostenen tot fins que es cremen.»

Tot això és cert i **una empresa que hi arriba no s'hi reconeix**: llegeix
«voluntariat» i «horts comunitaris» i conclou que això no va amb ella. Ha
travessat el hero que li deia que sí. Aquesta és la incoherència, i no és de
disseny: és que el text es va escriure quan la portada només venia al món
comunitari.

El patró **és el mateix a les dues bandes** i és el que s'ha de dir sense
canviar de mètode:

| | Sector públic i comunitari | Empresa i cooperativa |
|---|---|---|
| Qui ho sosté | dues o tres persones voluntàries | dues o tres persones clau, sovint sense el rol al paper |
| Què falla | governança, rols i relleu generacional | governança, rols i relleu — i ningú sap qui sap què |
| Què no es veu | confiança veïnal, favors, coneixement acumulat | coneixement tàcit, xarxes informals, reputació interna |
| Què passa quan marxen | el projecte marxa amb elles | se'n va el que no era a cap procediment |

**El mateix objectiu, i s'ha de dir així:** millorar **psicosocialment i
econòmicament** qualsevol organització, i **mesurar-ho pel mapeig dels fluxos de
valor**. Aquesta frase és el pont entre les dues portes i avui no és enlloc.

El que s'ha de revisar, secció per secció, amb aquest criteri:

- **`#enfoc`** — reescriure el repte perquè s'hi reconeguin els dos. La frase
  «un projecte ciutadà no fracassa per falta de cor, fracassa per falta
  d'esquelet» és bona i **el que li falta és la seva bessona d'empresa**, no
  substituir-la.
- **`#glossari`** — les sis paraules es van triar per a un públic; comprovar
  quines no diuen res a una direcció de persones.
- **`#relat` («D'on ve això»), `#com` i `#aprenent` («s'aprèn fent»)** — el
  relat és Àlvar → psicologia de grups → TeamTowers → Humà, i **ja és mixt**
  (InfoJobs, Foment del Treball, 150 organitzacions). Avui la portada no ho fa
  servir per legitimar la banda privada: el titular de `#relat` diu «vint anys
  aixecant castells» i el que hi ha a sota és, en bona part, món corporatiu.
- **`#fentpinya`** — l'experiència castellera és el producte amb més
  quilòmetres i **es va vendre a empreses primer**; la secció l'explica com si
  fos comunitària.
- **`#cataleg`** — el filtre existeix; falta que **cada família digui el mateix
  producte a les dues bandes** en comptes de semblar dos catàlegs. Comença per
  `#pk-mapa-organitzacio` i `#pk-diagnostic-teixit`, que són el mateix mètode
  amb dos noms.
- **`#cost`** — l'escala de tres nivells i el sostre de 5.000 € són del sector
  públic; el que decideix un preu a una empresa no és el mateix i la secció no
  ho diu.
- **`#trajectoria` i `#objeccions`** — les objeccions de preu i contractació són
  diferents a una regidoria i a un comitè de direcció, i ara només hi ha les
  d'una.
- **`SOS/ia.html`, `SOS/diagnostic.html` i `SOS/pressupost.html`** — el formulari
  ja pregunta quina mena d'entitat ets (`ORGS` amb el seu `sector`); el text del
  voltant encara no canvia amb la resposta.

**El criteri per saber si està fet:** que una directora de persones d'una empresa
de 200 persones i una tècnica de participació d'un ajuntament de 8.000 habitants
llegeixin la mateixa secció i **totes dues s'hi reconeguin**, sense que cap de
les dues hagi de traduir mentalment l'exemple de l'altra.

### (b) Mapes de valor privats d'una organització

**Una web per fer mapes de valor d'una organització on només hi entrin jo, el
meu equip i el client.** Al catàleg el paquet ja existeix
(`#pk-mapa-organitzacio`) i **l'eina per entregar-lo, no**: `SOS/vna.html` és
explicativa i pública —serveix per entendre el mètode amb una colla
castellera— i l'app és del territori, no d'un encàrrec. Avui aquesta feina es
lliura fora del repositori, que és exactament el lloc on el mètode no es pot
millorar ni mesurar.

Aquí hi ha d'haver **excel·lència**, perquè és on el SOS i TeamTowers Humà diuen
el mateix: la metodologia és una, els productes són dos, i el que es mesura és
el mapeig dels fluxos de valor.

El que ja hi ha i no s'ha de tornar a fer:

- **La local-first i les claus.** `generateNodeKey`, `encryptWithKey`,
  `wrapKeyWithPass`, `shareNodeKeyWithMember` i els sobres per membre ja fan
  exactament la figura «només aquestes persones ho poden llegir», i el servidor
  —quan n'hi ha— **només guarda**, no desxifra.
- **L'abast de publicació.** `publishScopeOf` / `setPublishScope` ja decideixen
  què surt i què no. Un espai de client és `publishScope` buit i prou.
- **El mapa mateix.** `mapFlowsOf`, `vnaAudit`, `suggestReturn`, `aiPlanValueFlows`
  i `aiSuggestMap` ja fan el mapa, l'auditen i proposen retorns.

El que falta, i és on és la feina de debò:

1. **L'espai de client** com a concepte: un lloc amb el seu mapa, els seus rols,
   la seva gent i **la seva llista de qui hi pot entrar**, que avui no existeix
   com a unitat —hi ha nodes, i un node no és un encàrrec.
2. **Convidar sense donar un compte.** L'única manera honesta amb el codex és
   passar la clau del node a qui hi ha d'entrar; falta el camí de fer-ho que no
   demani entendre què és una clau.
3. **La proposta de valor intangible, feta tangible amb IA.** És el que el
   client compra: que d'una conversa i uns documents en surti **el mapa dels
   fluxos intangibles amb el seu valor estimat**, amb el fre de sempre —la IA
   proposa, una persona valida, i cada línia diu d'on surt. `SOS/ia.html` ja
   declara el marc; falta l'entregable.
4. **L'allotjament més barat que compleixi el codex.** Cap servidor que pugui
   llegir el contingut, cap compte obligatori i el client se n'ha de poder
   endur tot. Cal comparar-ho i **escriure per què es tria el que es triï**, no
   decidir-ho pel camí.

**Dues coses que s'han de decidir abans de codificar**, i que no pot decidir el
codi:

- **Qui és l'amo del mapa quan s'acaba l'encàrrec.** Si és el client, el nostre
  accés s'ha de poder retirar i s'ha de veure que s'ha retirat. Si és compartit,
  s'ha de dir a la proposta i no a la lletra petita.
- **Què passa amb el que el mapa revela.** Un mapa de valor honest ensenya qui
  sosté què, i això dins d'una empresa **té conseqüències per a persones
  concretes**. La regla d'aquesta casa —els noms de les cures només els veu qui
  sosté el node— ha de tenir la seva versió aquí, escrita, abans del primer
  client.

---

**P0 · Revisió UX del flux de valor cap al fons** — feta i implementada

La revisió completa és a `SOS/knowledge/vision/review-ux-flux-de-valor.md`. Va
sortir de tres coses que el SOS deia i l'app no feia: que el model és replicable,
que la destinació és el fons cooperatiu, i que Catalunya és el primer cas i no
l'únic.

1. ~~**Catalunya soldada al codi**~~ · **fet (V54)**. Era un cas particular al
   lloc d'una plantilla, en sis punts: nivells, institucions del mapa de valor,
   tipus d'entitat, catàleg geogràfic, resolutors de cadena amb `pais:'Catalunya'`
   literal, i un esquelet d'un sol país. Ara hi ha `COUNTRY_MODELS` amb Catalunya
   com a referència de només lectura, forkejable; els nivells són dades
   (renombrables i retallables) però els seus ids no canvien mai; i l'assistent
   «crea el teu país» deixa un país viu en comptes d'un node buit.
2. ~~**El fons no tenia porta**~~ · **fet (V55)**. Ruta `#/fons` enllaçable, amb
   verificat (signat, hores en hores) separat de l'estimació de l'oracle (amb
   rang i font), comparació amb la fita del pla fundador sense interpolar, i
   desglossament per dinàmica i per node. `networkFund` ja no depèn de la MATRIU:
   un territori amb bancs de temps i biblioteques té fons.
3. ~~**El país ensenyava la portada d'un barri**~~ · **fet (V55)**. Cabina amb
   fons, cobertura (quines regions encara no tenen res) i les que més es mouen.
   Les sis targetes de rol es queden per als nivells on serveixen.
4. **Missions de xarxa** · **pendent**. Avui `missions()` només diu què *em* toca
   a mi. La feina que no és de ningú en particular —«tres comarques sense cap
   dinàmica»— no la veu ningú i per tant no la fa ningú. La cobertura ja la
   calcula (`countryCoverage`); falta convertir-la en missions.
5. ~~**Catàleg territorial d'un segon país**~~ · **fet (V54)**. **Euskadi** entra
   de sèrie amb estructura foral: 3 territoris històrics, 21 comarques i
   quadrilles, municipis principals de cada comarca (llista **parcial**, i ho
   diu), tipus d'entitat forals (Diputació Foral, Juntes Generals, Quadrilla) i
   un mapa de valor propi on **les Diputacions aporten al Govern**, no al revés.
   Etiquetes en català; la traducció a l'èuscar queda per a la beta.
6. **Traducció a l'èuscar del model d'Euskadi** · **pendent, per a la beta**.
   Els topònims ja hi són en la seva forma oficial i no s'han de tocar; el que
   falta traduir són les etiquetes de nivell i els noms dels rols.

---

**P0b · Gent: rànquing, presència, xat i captació** — fet (V56–V57)

1. ~~**Rànquing de qui mou la xarxa**~~ · **fet (V56)**. Puntua només el que està
   **signat** —les estimacions de l'oracle no donen reputació a ningú— amb factor
   de **reciprocitat** (donar i rebre val més que només donar) i decaïment
   temporal. Cada posició porta el seu **perquè**, construït al mateix lloc que
   el número.
2. ~~**Xat ancorat a nodes i fluxos**~~ · **fet (V57)**. La conversa penja d'un
   node i cada missatge pot citar un flux del mapa, un apunt, una tasca, una
   iniciativa, un objecte o una oferta. **Fusió per unió**, no LWW: sincronitzar
   no pot esborrar el que l'altre acabava d'escriure.
3. ~~**Landing de captació**~~ · **fet**. `SOS/uneix-te.html` — el dolor primer,
   el tracte (què hi poses / què en treus), els quatre rols, els quatre passos i
   **què NO fa**. Acaba a `#/alta`, que obre directament el formulari.
4. ~~**Presència real de tota la xarxa**~~ · **fet (V58)**. Relé **opcional i
   apagat de sèrie**, sobre WebSocket a pèl (compatible amb Supabase Realtime).
   **Cap URL ni clau al codi**: cada comunitat hi posa el seu servidor. Hi passen
   només presència i missatges; mai el ledger ni els nodes. La sala viatja com a
   hash. Provat amb dos navegadors contra un servidor que parla el protocol
   (`relay-mock.mjs`).
5. **Entrega diferida pel relé** · **pendent**. Avui el relé entrega en viu: si
   qui ha de rebre no hi és, el missatge li arriba al proper sync directe. Per a
   una bústia de debò caldria emmagatzemar missatges al servidor, i això és una
   decisió diferent —passaria de relé a dipositari.

---

**P1 · Ara — sense això, el SOS és monousuari**

1. ~~**Sync en viu**~~ · **ja hi era**. En anar a fer-ho es va comprovar que
   `syncBroadcast` ja emet un `patch` a cada `persist`/`persistEntity` i que
   `deleteNode`/`deleteEntity` propaguen tombstone; `test-collab` ho verifica
   d'extrem a extrem amb dos navegadors (`liveChangeReachesTheOtherSide`). El que
   queda d'aquella línia és el **codi de sala** i el **QR**, que són a P3 perquè
   depenen de tercers. *Prioritzar sobre memòria i no sobre el codi porta a
   posar de primer el que ja està fet.*
2. **Vistiplau de l'altra banda** · **fet (V43)**. `submitEntry` és el camí únic:
   si la contrapart ha reclamat la fitxa amb el seu `did`, l'apunt **no entra al
   ledger** i queda com a petició signada fins que hi digui la seva; si no l'ha
   reclamada, tot funciona com abans. Els préstecs passen pel mateix lloc
   (`submitLoan`). Safata `⏳ Esperen el teu vistiplau` amb pastilla a la barra,
   entrada al tauler d'atenció i a la paleta. L'apunt guarda la data del fet i
   qui l'ha validat. 46 assercions a `test-vistiplau`.
3. **Pont entre taxonomies** banc de temps ↔ biblioteca · **fet (V44)**.
   `SUPPLY_DOMAINS` és una capa d'àmbits per sobre de les dues llistes, que no en
   substitueix cap: set àmbits fan de pont de debò (reparació, electrònica,
   cuina, hort, costura, infància, cures) i vuit tenen una sola banda a
   consciència. La banda de coincidències distingeix **exacta** de **mateix
   àmbit** i diu quines dues coses creua; un àmbit que no travessa res no es
   mostra. Filtre d'àmbit amb xip (no es pot escriure a la caixa de cerca perquè
   no és el text de cap fitxa) i sortida des del «no hi ha res». 36 assercions a
   `test-pont`.

**P1 completat.** El següent és P2.

**P2 · Tot seguit — que el que es compta sigui just**

4. **Biblioteca circular** · **fet (V45)**. `OBJECT_MODES` separa donació de
   posada a disposició; `loanValue` valora **per préstec** amb coeficient de
   desgast per tipologia i s'escriu **al retorn**, no en prestar; `logRepair`
   registra la sessió amb mentora **i aprenents**, tots dos com a aportació;
   `circularStats` dona els indicadors del certificat (préstecs, compra evitada,
   reparacions, hores formatives, objectes salvats). Tipus d'apunt propi
   (`objecte`, amb `estimate:true`) perquè un valor estimat no es coli on hi ha
   d'haver diner real. 54 assercions a `test-circular`.
5. **Rols múltiples per context** · **fet (V46)**. `rolesOfPersonIn(node,nom)` i
   `rolesOfPerson(nom)` dedueixen els rols de l'evidència que ja hi havia
   (`mentorsOf`, `govOf`, ledger, objectes, ofertes), cadascun amb el seu perquè
   i els nodes on el fa. `primaryRole` substitueix el «primer que trobo
   recorrent nodes», que depenia de l'ordre de creació. `mentor` entra a
   `SOS_ROLES` amb recorregut propi i frase de lent a les dotze pantalles. La
   lent es tria amb un selector visible (`setLensRole`) i el perfil mostra tots
   els rols alhora. 44 assercions a `test-rols`.

**P2 completat.** El següent és P3 · la cara pública.

**P3 · Després — la cara pública, quan ja hi ha què publicar**

6. **`publicPack` d'habilitats i objectes amb privadesa verificable** ·
   **fet (V47)**. El gra és **agregat**: categoria + municipi + quants, i el
   paquet diu **on preguntar, no a qui**. *Deny by default* node a node i per
   separat per a habilitats i objectes (`publishScopeOf`, `setPublishScope`).
   **Els títols lliures no surten** —«Trepant d'en Quim Ferrer» hauria publicat
   un nom sense que ningú ho decidís. `verifyNoLeak` és **codi i no un test**:
   busca tots els noms, contactes, `did`, títols i apunts del SOS dins del JSON
   que viatjarà, rebutja qualsevol clau fora de la llista blanca, i **si falla
   el botó no publica**. `readSupplyPack` aplica el mateix sedàs a l'entrada.
   La pantalla ensenya la taula sencera abans de descarregar. 43 assercions a
   `test-publica`.
7. **Control de versions de les publicacions** · **fet (V48)**. Cada publicació
   guarda el seu **CID i el del seu pare**; `publicationDiff` diu **què** ha
   canviat (afegit, modificat, retirat) i `pubStatus` si el que tens ara és
   diferent del que vas publicar. El CID **no inclou la data de generació**, així
   que una versió és un canvi de contingut i no una passada de rellotge, i
   publicar el mateix dues vegades no crea versió nova. `rollbackPublication`
   torna enrere **publicant una versió nova** amb contingut antic, sense esborrar
   cap versió intermèdia. El versionat automàtic (`setAutoPublish`) s'atura si
   `verifyNoLeak` troba una fuita. 42 assercions a `test-versions`.

   **El que NO fa, dit clar**: no puja res a cap servidor. La sincronització
   remota depèn de relés de tercers (Nostr, Arweave, IPFS) i és al tram P5;
   anomenar «sincronització» el que és versionat local seria vendre el que no hi
   ha. L'historial és el que farà que, quan la xarxa hi sigui, publicar-hi sigui
   només el darrer pas.
8. **Lectura de QR des de dins** (`A4`) · **fet (V49)**. `qrCapabilities`,
   `decodeQR` i `openQRScanner` amb `BarcodeDetector`: càmera en viu o foto
   triada, i el codi arriba directament a la casella d'aparellament (les dues
   bandes: invitació i resposta). **No hi és a tot arreu** —comprovat: el
   Chromium d'escriptori Linux no el porta, Android i ChromeOS sí— i com que
   **el que escaneja és el mòbil**, la resposta correcta no és encastar un
   descodificador de 250 KB sinó dir-ho: la pantalla anomena l'API que falta,
   diu on sí que va, i deixa sempre el camí d'enganxar el text. 30 assercions a
   `test-qr`.

   **Codi de sala** (`A3`) · **mogut a P5, amb prova**. Els trackers WSS
   (`tracker.openwebtorrent.com`, `tracker.webtorrent.dev`, `tracker.files.fm`)
   **no responen des d'aquest entorn**. Escriure el client de tracker sense
   poder-lo verificar de cap manera deixaria codi que sembla fet i que ningú
   sabria si ha funcionat mai. Es fa quan hi hagi una xarxa on provar-ho.

**P3 completat** (excepte el codi de sala, mogut a P5 per la prova de dalt).

**P4 · Quan l'MVP estigui polit**

9. **App de mòbil per missions** · **fet (V51)**. `missions()` reuneix el que el
   sistema ja sabia (`pendingInbox`, `dashboardAttention`, `supplyMatches`,
   `dueStatus`, `journeyProgress`, reptes del tier) i ho converteix en una
   **portada pròpia** sense arbre, sense pestanyes i sense res per configurar:
   una llista, un botó gros per missió. Cada missió diu **què passarà si la fas**
   i quant costa; l'ordre és **per qui espera**, no per importància abstracta.
   Mai és buida per a qui té perfil. Ruta `#/missions`, entrada des del tauler i
   de la paleta. 36 assercions a `test-missions`.

   **Decisió d'arquitectura resolta**: un sol fitxer amb capa de portada, no un
   segon `index.html`. El cost mesurat és una funció i un bloc de CSS, i es manté
   el zero-servidor. *(Va aparèixer un tercer desbordament a 360 px: amb la
   sessió activa la barra tornava a sortir. El text de l'estat de sync s'amaga
   de la vista però no dels lectors de pantalla.)*
10. **MATRIU F5–F8**. F1–F4 ja fan que sigui un servei; aquestes la completen.
    - **F5 finançament i tràmits** · **fet (V52)**. Pipeline (`fundingOf`,
      `addFunding`, `fundingSummary`) que separa **demanat de concedit** —el que
      has demanat no és teu— i `fundingAlerts` que puja els venciments al tauler
      amb **severitat màxima**: és l'única cosa que caduca sola, i un termini
      passat es diu «ha passat fa N dies», no «pendent». Checklist jurídica
      (`LEGAL_STEPS`, `legalChecklist`) sobre el `juridic` que cada
      `PROJECT_TYPE` ja portava i que no servia per a res.
    - **F6 formació lligada a l'etapa** · **fet (V52)**. `STAGE_MODULE` connecta
      cada etapa amb el seu mòdul (idea→M3, prototip→M4, validació→M6,
      graduació→M5) i `stageTraining` diu qui de l'equip real l'ha fet. Surt a
      les comprovacions marcat com a **`soft`: no bloqueja graduar**, perquè es
      marca a mà i no es pot aturar ningú per una casella que ell mateix omple.
    - **F7 seguiment post-graduació** · **fet (V53)**. `graduatedNodeId` existia
      i no el llegia ningú. `postGradReviews` obre les fites de **3, 6 i 12
      mesos** —la resposta la posa una persona, perquè un projecte pot tenir el
      ledger quiet i estar viu— i `survivalRate` dona l'indicador **de la
      incubadora**. Sense revisions la taxa és `null` i no zero; es calcula
      **només sobre les revisades**; i una fita superada per una revisió
      posterior deixa de reclamar-se.
    - **F8 evidències** · **fet (V53)**. `addEvidence` accepta enllaç, nota o
      fitxer i en guarda sempre el **hash**, així es pot ancorar sense publicar
      el contingut. **El fitxer no entra al node** (viatjaria pel sync i pel pack
      públic): va a un registre local de tipus `evidence`, dins de
      `PRIVATE_DB_TYPES`. `evidenceCoverage` mira **només els items fets**, i és
      `soft`: demanar-la per graduar convidaria a adjuntar qualsevol cosa.
    - 46 assercions a `test-matriu-f56` i 42 a `test-matriu-f78`.

**P4 completat.** La MATRIU té les vuit fases del pla.
11. **Rendiment amb 500 nodes i 5.000 apunts** + **accessibilitat** ·
    **fet (V50)**. No s'ofega: render 33 ms (el segon, 5 ms), i cap funció que
    recorri tot el SOS passa de 25 ms —`ledgerIndex` 11, `supplyIndex` 4,
    `searchSupply` 21, `knownPersons` 6, `rolesOfPerson` 2. L'única cara és
    `verifyNoLeak` (211 ms) i ho és a posta: compara tot el SOS contra el JSON
    que sortirà, un cop per publicació. Accessibilitat: `lang`, títol, cap
    `tabindex` positiu, 37 botons amb nom, 7 camps etiquetats, un sol `h1`
    visible, sense salts de nivell, i Escape tanca els modals.
    **Dos defectes reals trobats, tots dos a 360 px** (`test-mobilenav` corre a
    375 i no els veia): la barra de pestanyes no podia encongir-se i feia
    desplaçar la pàgina —ara llisca ella—, i la barra superior sumava 361 px.
    32 assercions a `test-escala`.

**P5 · Bloquejat per tercers — no és camí crític**

12. Ancoratge Nostr / Arweave / IPFS, wallets W2/W3, integració profunda d'AI
    review de PRs, coordenades a les entitats del directori. Tot això depèn
    d'infraestructura externa. Que quedi al backlog no vol dir que sigui el
    següent: vol dir que **quan la xarxa hi sigui, ja sabem què fer-hi**.
13. **Codi de sala per sincronitzar** (trackers WSS + reconnexió). Baixat aquí
    des de P3 amb la prova feta: cap dels tres trackers públics respon des de
    l'entorn de desenvolupament. La publicació remota del `SupplyPack` (V47/V48)
    viu al mateix calaix i pel mateix motiu.

---

**El que NO faria ara**, i per què val la pena dir-ho: multi-peer (>2 alhora),
hub always-on, i conversió d'slices a participacions jurídiques. Els tres són
grans, cap dels tres no desbloqueja res del que hi ha per sobre, i els tres
tenen molt més sentit quan hi hagi comunitats reals fent-lo servir i sabrem què
demanen de debò.

### Onada en curs · qualitat dels mapes + tauler com a lloc únic

**Fet:**
1. **Auditoria completa dels mapes precarregats** — les 36 definicions que sembren
   mapes (5 nivells territorials + 23 reptes, 11 dinàmiques, 14 activitats
   crítiques, 6 prototips). Resultat i llindars a
   `../vision/auditoria-mapes.md`. Salut mínima del sistema: 13/100 → **86/100**.
2. **DRY de la sembra** — forma canònica `pairs` i un únic `mapFlowsOf`, que fan
   servir els sis camins que creen mapes. Abans: quatre implementacions, quatre
   qualitats.
3. **Actuar sense navegar** — `NODE_ACTIONS` + `openQuickAct` + panell de xarxa al
   tauler: cercar qualsevol node de Catalunya i registrar-hi valor, donar d'alta
   gent, publicar oferta o obrir l'assemblea sense sortir del tauler.

4. **El bucle tancat** — pings a la fila del node i al panell d'accions, intercanvi
   tancat des del tauler, i **retorn visible** (`valueSnapshot` → `valueDelta` →
   `showValueReturn`) que diu què ha canviat i proposa el següent moviment.

6. **Ledger personal i registre públic cercable** — `ledgerIndex` com a font
   única, `openMyLedger` accessible des del tauler i del perfil, i
   `openPublicRegister` amb cerca en text lliure i **verificació criptogràfica
   real** de cada firma. Exportable a CSV/JSON i enllaçat amb l'ancoratge.

5. **La reputació compta tot el valor aportat** — `personProfile` recull les
   aportacions de tots els nodes i ventures, el diner entra com a hores
   equivalents i l'escala s'ha recalibrat (40/150/450/1100). Veda V23.

7. **Consolidació entre nivells sense doble comptatge** — `measure(nodeIds)` com a
   únic lloc on es compta valor territorial (apunts deduplicats per node ·
   venture · apunt), `consolidate` amb columnes `propi` / `agregat` / `total`
   mesurat, i `consolidateSet` que detecta els nodes **redundants** d'un conjunt
   qualsevol. Panell visible al Resum del territori i a les accions ràpides del
   tauler. Veda V24. Prerequisit resolt per a les federacions temàtiques.

**Següent, per ordre:** ~~F1 de la MATRIU~~ · ~~federacions temàtiques~~ —
**les dues ja estan fetes, i aquest apartat contradiu la resta del document**
(repàs del 26/09/2026):

- **F1 · acompanyament** consta com a feta a la secció «MATRIU · pla de millora
  èpic» d'aquest mateix fitxer (F1–F4 fetes, pendents F5–F8). Al codi hi són
  `mentorsOf`, `sessionsOf`, `addMentor`, `logSession`, `ventureSilence`,
  `silentVentures` i `mentoringSummary`.
- **Federacions temàtiques** hi són: `themesOf`, `themeSlug`, `allThemes`,
  `themeFederation`, `themeNeighbours`, `openFederations`, `openTheme` i
  `openNodeThemes`, amb la consolidació per `consolidateSet`.

Una llista de «següents» que ja s'han fet és pitjor que no tenir-ne: fa que qui
la llegeixi desconfiï de tota la resta del document. **El següent de debò
d'aquesta onada són F5–F8 de la MATRIU**, i estan on toca, a la seva secció.

### Onada actual — user acquisition + traction
1. **Landing/onboarding més agressiu** — crear vista/pantalla dedicada a captació d'usuaris amb funcionalitats crítiques de tracció (CTA directe a crear perfil, comptador de superherois viu, testimonis).
2. **Registre d'usuaris descentralitzat** — perfil accessible des de la web SOS única, integrant amb els sistemes ja disponibles (did:key + WebAuthn passkey + Nostr NIP-05).
3. **Superarmes al perfil superheroi** *(fet a l'onada actual — cromo mostra superpoders + superarmes)*.
4. **Gamification per nivells** *(fet — Aprenent/Bronze/Plata/Or/Llegenda + reptes per desbloquejar el següent)*.
5. **Transmedia enllaços** *(fet — SoundCloud, YouTube, Amazon, Instagram al modal Comando)*.
6. **Vista territorial resum + incentiu al terreny** *(fet — panell "Baixa al terreny" a país/provincia/comarca).

### Onada permaweb · identitat portable + ancoratge del registre

**Fet:**
1. **Còpia xifrada de la identitat** — `exportIdentity` / `importIdentity`
   (PBKDF2 210k · AES-GCM), amb pantalla pròpia i entrada des del panell
   d'identitat. Resol que esborrar el navegador destruïa el `did:sos` i que el
   mateix humà amb dos aparells fos dues persones al registre. Veda V25.
2. **Ancoratge del registre sencer** — `buildRegisterPack` /
   `verifyRegisterPack` amb una arrel sobre totes les accions. El botó «Ancora»
   del registre obria l'ancoratge d'un node i, des del tauler, no obria res.
   Veda V26.
3. **CID que no cobria res** — `JSON.stringify(pack, Object.keys(pack).sort())`
   filtra les claus **a tota la profunditat**: `{totals:{hores:8}}` es
   serialitzava com `{totals:{}}`, així que es podien canviar hores i euros
   sense moure el CID. Defecte heretat de `buildAnchorPack`, corregit amb
   `_canon` (claus ordenades a tots els nivells) per als dos packs.
4. **Pla de muntatge iMac + iPad** — `../vision/muntatge-imac-ipad.md`.

5. **Col·laboració de debò** — enllaç d'invitació (`#/sync/<codi>`) que s'obre
   d'un clic amb el codi carregat, presentació mútua (`did:sos` + nom) abans que
   res es fusioni, i memòria de l'últim company. Veda V27.

6. **Federacions temàtiques** (model del.icio.us) — `node.themes`, `allThemes`,
   `themeFederation` (sobre `consolidateSet`, sense doble comptatge) i
   `themeNeighbours`, que és el moviment que fa que etiquetar valgui la pena:
   des d'un node veus **qui més treballa els teus temes**. Pantalles pròpies,
   entrada des del tauler, del llançador, de la paleta, de les accions del node
   i de la ruta `#/federacions`. Veda V28.

7. **F1 de la MATRIU · acompanyament** — mentors amb àmbit
   (`MENTOR_SCOPES`), sessions que entren al ledger de la venture signades i
   generen slices (`logSession`), i detecció de silenci (`ventureSilence`,
   `silentVentures`) visible a la Cartera i al tauler. Veda V29. La MATRIU deixa
   de ser un repositori d'estructures i passa a ser un servei.

8. **F3 de la MATRIU · riscos i bloquejos** — riscos amb probabilitat, impacte
   i **pla de mitigació**; bloquejos amb **qui els desbloqueja** i quants dies
   fa que duren; `ventureLight` calcula el semàfor de cada iniciativa i
   `matriuLights` ordena la cartera pitjor primer. El tauler d'atenció puja els
   bloquejos de 14 dies o més per damunt de tot i avisa dels riscos alts sense
   pla. Veda V36.

9. **Res no interromp el que estàs fent** — `modal()` buida `#modalRoot`, així
   que el tour d'acollida amb retard destruïa la pantalla que tenies oberta i
   el que hi havies escrit (el registre d'hores inclòs). Ara `modalOpen()`
   comprova si estàs ocupat i el tour espera o renuncia. Veda V35.

10. **F4 de la MATRIU · vista de cohort** — pestanya `▦ Cohort` amb una fila per
    iniciativa i les mateixes onze columnes (etapa, semàfor, preparació,
    backlog, hores, equity màx, salut del mapa, dies sense moure's, mentores,
    incidències). Ordenable per qualsevol columna en tots dos sentits, filtrable
    per etapa i semàfor, amb **embut per estadis** i **exportació CSV**.
    `mapHealthScore` resumeix el mapa de valor en un número comparable. Cap
    xifra és nova: el semàfor de la taula és el mateix `ventureLight` de la
    cartera. Veda V37.

11. **F2 de la MATRIU · viabilitat econòmica** — model d'ingressos (font, tipus,
    preu per unitat, unitats/mes) i estructura de costos separada en fixos i
    variables. `ventureEconomics` calcula el **llindar de sostenibilitat**
    (fixos ÷ marge unitari) i en diu l'estat: sostenible · assolible ·
    dependent · impossible · incomplet. **Els ajuts no compten al llindar.**
    `fundRunway` diu quants mesos aguanta el fons amb el ritme de crema actual.
    Nova comprovació a la porta 3 **només** per als tipus amb ànim de lucre.
    Columna de viabilitat a la cohort i al CSV. Veda V38.

12. **Alta de soci i identitat de les persones** — les tres capes fetes:
    `knownPersons()` (índex derivat de tota la gent del SOS) amb el formulari
    d'alta de **dues portes**; reclamació de fitxa **signada** amb el `did`
    propi, amb la comprovació `signer.did === member.did`; i **fusió de
    duplicats** que repunta l'estat mutable però **no reescriu mai història
    signada** —s'hi accedeix per taula d'àlies. Equity, saldos, reputació i
    perfil resolen per àlies. Veda V39.

13. **Cerca: l'eix és la cosa, la direcció és un atribut** — dos tipus
    (habilitat, objecte) en comptes de tres, i s'ofereix/es busca com a atribut
    filtrable, ordenable i visible a cada fila. La categoria és la clau
    d'aparellament, i d'aquí surt la banda de **coincidències**. Les llistes
    d'espera passen a ser demanda d'objecte visible. Cinc criteris d'ordre en
    tots dos sentits. Veda V40.

14. **Còpia de seguretat de tot el SOS local** — `exportBackup` /
    `importBackup` s'emporten **la base de dades sencera** (no només la
    identitat): nodes, socis, registre, iniciatives, biblioteca, entitats. Amb
    contrasenya, el fitxer va xifrat (PBKDF2 210k · AES-GCM, la mateixa pila que
    la identitat); **en blanc, va en clar** —i llavors el botó ho diu: «⚠
    Descarrega SENSE xifrar», perquè qui tingui el fitxer podrà llegir-ho tot i
    **signar en el teu nom**. Hi ha casella per treure la identitat de la còpia.
    En restaurar, primer es mostra què hi ha dins (registres, data, si porta
    identitat) i només després s'importa; substituir-ho tot és opcional i
    demana confirmació. Entrada des del panell d'identitat. Veda V42.

**Següent, per ordre:**
1. **Codi de sala per sincronitzar** — l'aparellament segueix sent per sessió.
   Descobriment via trackers WSS + reconnexió amb l'últim codi.
2. **Lectura de QR des de dins del SOS** (`BarcodeDetector`) — el QR es genera
   però l'escaneig depèn de la càmera del sistema.
3. **Més de dos alhora** — avui la sincronització és punt a punt; una assemblea
   de debò en vol N.

### Onada UX · el perfil s'edita i el catàleg és únic

**Fet:**
1. **El perfil s'edita, no es torna a començar** — `profileSnapshot` reconstrueix
   què té publicat la persona a tot el SOS, el formulari s'obre omplert i marcat,
   i desar **reconcilia** (afegeix el nou, retira el desmarcat) en comptes de
   duplicar. Els botons diuen «Edita» quan toca. Un objecte prestat no es
   retira mai. Veda V31.
2. **Cerca centralitzada per proximitat** — `supplyIndex`/`searchSupply` són el
   catàleg únic de tot el SOS (habilitats, objectes, demandes de qualsevol
   node), i `proximity` ordena de més a prop a més lluny **sense inventar
   quilòmetres**: es fa servir l'arbre territorial, i coordenades reals només si
   n'hi ha. Pantalla `🔎 Què hi ha a prop` al tauler i a `#/aprop`. Veda V32.

3. **Operar des del resultat** — `supplyAction`: cada resultat porta l'acció que
   li toca (hores, oferir-se, préstec, llista d'espera) i, si no ets soci
   d'aquell node, l'alta es fa sola. Veda V33.
4. **Coordenades reals** — `parseCoordText`/`applyCoords` llegeixen CSV i JSON
   d'ICGC/Idescat/OSM, la geolocalització del navegador marca la teva població,
   i la pantalla `📍 Coordenades` mostra la cobertura. Sense coordenades, la
   cerca **diu** que ordena per territori i no per km. Veda V34.

5. **Confirmació de l'altra banda** — `submitEntry`/`submitLoan` com a camí
   únic: si la contrapart ha reclamat la fitxa, l'apunt queda com a **petició
   signada** i no toca el ledger fins que hi ha vistiplau; si no l'ha reclamada,
   res canvia. Safata pròpia, pastilla a la barra i primer lloc al tauler
   d'atenció. Veda V43.

**Pendent d'aquesta línia:**
- **Coordenades a les entitats del directori**, no només als territoris.

### Publicar a la permaweb · el repositori públic del SOS

**L'objectiu, dit clar**: que una persona d'un poble faci servir el SOS, premi
un botó, i **el que ha decidit compartir quedi publicat** perquè algú altre ho
trobi. Que se senti la màgia. Tot el que hem construït fins ara és el registre
privat; això és la cara pública.

**Què hi ha ja i què falta.** No es comença de zero — cal **investigar què està
acabat abans de tocar res**:

- `toPublicPack` / `mergePack` — ja publiquen i fusionen **entitats** del
  directori amb `visibility==='public'`, amb tombstones i LWW. És el patró bo,
  però **només cobreix entitats**.
- `buildRegisterPack` / `verifyRegisterPack` (V26) — arrel i CID sobre el
  registre sencer. Serveix per **provar** el que es publica, no per publicar-ho.
- `nostrPublishAnchor` (NIP-07) i `rememberAnchor` / `compareAnchor` (V30) — ja
  ancoren i comparen. **Falta la publicació del contingut**, no només de l'arrel.
- `GH` (device flow) — hi és, i el control de versions de git **pot ser útil de
  debò aquí**: un repositori públic és un lloc perfectament vàlid per a un
  paquet signat i versionat, i ja en sabem el camí.

**El que falta de veritat, per ordre:**

1. **Un `publicPack` que cobreixi habilitats i objectes, no només entitats.**
   Habilitats i ofertes **per ubicació**, amb la mateixa forma canònica i
   signada que la resta.
2. **Privadesa per disseny, i verificable.** Aquesta és la part que no es pot
   improvisar: publicar «hi ha algú a Manresa que fa fusteria» no és publicar
   qui és, ni el seu telèfon, ni el seu ledger. Cal decidir **el gra**
   —probablement categoria + municipi + un identificador opac de contacte— i
   tenir **un test que ho comprovi**: cap dada privada dins del pack, com ja fa
   `privacyNoLeak` a `test-matriu`. La regla ha de ser *deny by default*: només
   surt el que està marcat explícitament com a públic.
3. **Sincronització automàtica de la part que triïs, amb control de versions.**
   Escollir l'abast (aquest node, aquests temes, aquesta comarca), i que es
   publiqui sol quan canvia. Cada publicació és **una versió**, amb el seu CID i
   el seu pare: es pot veure què va canviar, i tornar enrere. Aquí git no és una
   metàfora, és una opció real d'implementació.
4. **Que sigui intuïtiu, o no servirà de res.** Aquesta és la condició, no un
   acabat: com més senzill sigui publicar, més comunitat. La forma que volem és
   **formar agents locals** —persones del territori amb l'habilitat de publicar
   a la permaweb— i això vol dir que el camí ha de ser prou curt perquè es pugui
   ensenyar en una tarda i recordar la setmana següent.

**Riscos que cal dir en veu alta**: publicar és irreversible a la pràctica
—un pack replicat no es desfà—, així que el pas de publicar ha de mostrar
**exactament què sortirà** abans de fer-ho, i qui no ho entengui no ha de poder
prémer el botó sense veure-ho. I depèn de relés i xarxes de tercers
(Nostr, Arweave, IPFS), que és l'únic tros del SOS que no és autosuficient: cal
que funcioni degradat quan no hi ha xarxa, i que ho digui.

### Després de l'MVP · l'app de mòbil per a la gent

**On som i on anem.** Ara mateix estem construint les **bases** i l'app
d'**administració i gestió**: la MATRIU, la biblioteca i el banc de temps
operatius, i el SOS com a escola i facilitador del desenvolupament comunitari.
Això és feina de qui coordina, no de qui participa.

Un cop l'MVP estigui polit amb les tres eines funcionant, el pas següent és
**una altra app, no la mateixa amb la pantalla més petita**:

- **Fluxos totalment predefinits.** Res de configurar. Cada cosa que es pot fer
  és un camí tancat, d'una pantalla a la següent, sense decisions de disseny per
  a l'usuari.
- **Llista de missions.** La unitat d'ús no és el menú, és **la missió**: què em
  toca fer ara i què passarà quan ho faci. La llista viu a la portada.
  L'esquelet ja existeix (`ROLE_JOURNEYS`, `journeyProgress`, `HERO_CHALLENGES`,
  `dashboardAttention`); el que falta és que **sigui la interfície**, no un
  panell més dins d'un tauler.
- **User-friendly de debò**: poques accions per pantalla, text curt, res que
  demani entendre el model de dades. Tot el que avui és un modal amb quinze
  camps ha de ser tres passos amb un camp cadascun.

**La línia que separa les dues apps**: la de gestió mostra **estructura** (qui,
on, quant, per què); la de mòbil mostra **el següent pas**. Barrejar-les és el
que fa que una eina comunitària només l'acabin fent servir tres persones.

**Pendent de decidir**: si és la mateixa `index.html` amb una capa de portada
diferent —cosa que manté el zero-servidor i el fitxer únic— o un segon fitxer
autocontingut que comparteix el mateix IndexedDB i el mateix `did:sos`. La
primera opció és la coherent amb les vedes; cal comprovar que no fa la pàgina
massa gran.

### Una persona té diversos rols alhora

**Defecte de model, no de pantalla.** `roleOfPerson` retorna **un** rol i
`activeRoleId()` n'agafa un de sol per decidir la lent de tot el SOS. Però una
persona real és **superheroina al seu barri, mentora d'una MATRIU i
simpatitzant en un altre poble** a la vegada. La implicació no és un estat
global: **depèn del node i del que hi fa**.

Cap on ha d'anar:

- **Els rols són per context**, no per persona. El mateix humà pot ser
  `superheroi` a la biblioteca del seu barri i `mentor` a la MATRIU de la
  comarca, i totes dues coses són certes alhora.
- **El rol es dedueix del que fa, no d'una casella.** Si acompanya ventures, és
  mentora — ja hi ha `mentorsOf`. Si aporta hores i objectes, és superheroina.
  Si coordina un node, guardiana. El sistema ja té l'evidència; el que fa és
  aplanar-la a un sol valor.
- **`mentor` ni tan sols existeix a `SOS_ROLES`**, tot i que la MATRIU (F1) ja
  té mentors amb àmbit. Cal afegir-l'hi amb el seu recorregut propi.
- **La lent del SOS ha de ser triable**: «ara miro el SOS com a mentora» i la
  guia contextual, les missions i el tauler canvien en conseqüència. Amb un
  selector visible, no endevinat.

Encaixa amb V39: quan una persona reclama la seva fitxa amb el seu `did`, els
seus rols de tots els nodes es poden reunir sota una sola identitat sense
haver-los d'aplanar a un.

### Biblioteca de les coses · valor de l'aportació i economia circular

**Pendent.** Avui donar un objecte a la biblioteca no val res al registre: es
publica i prou. Però una biblioteca de les coses **produeix valor real** que ara
no es comptabilitza enlloc, i per això no es pot certificar ni retribuir.

**1 · Valor de l'aportació en posar un objecte.** El formulari d'objecte ha de
distingir dues coses que ara es confonen:

- **Donació** — l'objecte passa al comú. El valor és el bé cedit: entra al
  ledger com a aportació de qui el dona, valorat amb l'oracle
  (`oracleObjectValue`) i ajustat per estat i antiguitat.
- **Posada a disposició** (segueix sent teu, el prestes) — el valor **no** és el
  preu de l'objecte, perquè no el regales. El que aportes és **el risc i el
  desgast**: que se't faci malbé, que torni pitjor, i la revisió, reparació o
  reciclatge que aquell objecte generarà. Aquest és un flux de valor propi de la
  biblioteca, i és exactament el que un certificat d'economia circular ha de
  poder demostrar.

Cal, doncs, un **coeficient de desgast per tipologia i ús**: una eina elèctrica
prestada quaranta vegades no aporta el mateix que una tenda de campanya
prestada dues. La proposta és valorar per préstec, no d'una sola vegada: cada
retorn genera un apunt petit i signat a favor de qui l'ha posat a disposició.
Així el valor s'acumula amb l'ús real i no amb una declaració inicial.

**Regla d'honestedat**: aquests valors són **estimacions de l'oracle**, i s'han
de mostrar com a tals, amb la font a la vista (Glass-Box, com `fundValue`). Un
número inventat que sembli comptabilitat és pitjor que no tenir-lo.

**2 · Reparació: mentor i aprenent aporten valor tots dos.** La vessant de
reparació és on la biblioteca deixa de ser un magatzem i passa a ser una escola.
El model ha d'incentivar les dues bandes:

- **La mentora** aporta hores d'ofici i, sobretot, **transferència de
  coneixement** — un intangible que a la VNA és el flux que sosté tota la resta.
- **L'aprenent no és un cost**: mentre aprèn, **repara de debò**, i aquella
  reparació és valor lliurat a la comunitat. Ha de generar-li reputació pel que
  aporta, no només un certificat pel que aprèn.

Encaixa amb el que ja hi ha: `logSession` de la MATRIU (F1) ja converteix una
sessió d'acompanyament en apunts signats al ledger. Aquí caldria l'equivalent
per a la biblioteca —una **sessió de reparació** amb objecte, mentora, aprenents
i hores— que generi apunts per a tothom qui hi ha posat temps. Reutilitzar el
mateix camí d'escriptura, no inventar-ne un de nou (veda V22: un sol camí).

**3 · Per què això importa.** L'objectiu de fons és **automatitzar el registre
de la comptabilitat de valor** de tothom qui hi participa. Un model *fair*
no és el que reparteix bé al final: és el que **compta bé pel camí**, i que
compta el que normalment no es compta —el risc de qui presta, el temps de qui
ensenya, i la feina de qui aprèn fent.

**Ordre suggerit**: (1) donació vs posada a disposició amb valor per préstec ·
(2) sessió de reparació amb mentora i aprenents · (3) indicadors agregats per al
certificat circular (objectes salvats de l'abocador, reparacions, hores
formatives, valor evitat).

**Depèn de**: `oracleObjectValue` i `ORACLE_OBJECT_DEFAULTS` (ja hi són),
`pushLedger` (ja és el choke point), i el pont de taxonomies entre banc de temps
i biblioteca que ja consta com a pendent més amunt.

### Identitat i alta de socis · fet (V39)

**El problema que hi havia.** `newMember` encunyava un `uid()` nou cada vegada. La mateixa
persona donada d'alta a la MATRIU, al banc de temps i a la biblioteca són **tres
registres sense cap relació**, units només pel `personKey`, que avui és
literalment el nom normalitzat. Conseqüències: canvia-li el nom en un lloc i es
parteix en dues persones; dues Martes de pobles diferents es fusionen soles.

**Disseny en tres capes, de menys a més compromís:**

1. **Triar d'entre qui ja hi és.** Un índex de persones derivat (no desat) que
   escombra tots els nodes i agrupa per `personKey`. El formulari d'alta passa a
   tenir dues portes: *«Ja hi és»* — llista de qui el SOS ja coneix, amb els
   nodes on participa i el seu nivell — i *«Algú nou»*. Triar-ne una copia nom,
   contacte i entitat, i **estampa el `personKey`** al registre nou: el vincle
   passa a ser explícit, no una coincidència d'ortografia.

2. **`did` al registre de soci.** Quan una persona **reclama** la seva fitxa amb
   la seva identitat (`getIdentity()` → `did:sos`), el registre guarda el `did` i
   una **reclamació signada** sobre `{nodeId, memberId, did}`. A partir d'aquí el
   que uneix els registres és la identitat, no el nom: canvia't el nom quan
   vulguis. Dos registres amb el mateix `did` són la mateixa persona **per
   prova**, no per suposició. Una fitxa ja reclamada per un altre `did` no es pot
   tornar a reclamar sense que l'original signi el traspàs.

3. **Fusió de fitxes duplicades.** `mergePersons(a,b)` per quan un mateix humà té
   dues fitxes (una errata, «Marta R.» i «Marta Roca»). Ha de repuntar
   `memberId` a ledger, ofertes, propietaris i prestataris d'objectes, mentors i
   leads de venture. **Mai reescriu història signada**: un apunt signat amb l'id
   antic conserva la seva signatura i es resol per una taula d'àlies; reescriure
   l'apunt trencaria la seva cadena de hash. La fitxa absorbida queda com a
   làpida amb `mergedInto`, i la fusió és ella mateixa un registre signat.

**Estat**: les tres capes fetes i verificades (74 assercions a `test-identitat`),
inclosa la prova que la cadena de hash i les signatures sobreviuen una fusió.

**Pendent d'aquesta línia**: propagar la reclamació entre nodes (avui es reclama
fitxa a fitxa; hauria de poder-se reclamar tot el que és teu d'un cop), i que
la fusió entre nodes diferents —no només dins d'un— tingui sentit quan calgui.

### Cerca · l'eix és la cosa, no la direcció — fet (V40)

`searchSupply` tractava habilitat, objecte i demanda com tres categories
paral·leles. Però **una demanda no és una mena de cosa, és una direcció sobre
una cosa**. Fet: dos tipus (habilitat, objecte); `dir` (`ofereix`/`busca`) com a
atribut a cada fila; cinc criteris d'ordre (`SUPPLY_SORTS`) en tots dos sentits;
`supplyMatches` per a la banda de coincidències; i les llistes d'espera
convertides en demanda d'objecte visible.

**El pont entre les dues taxonomies · fet (V44)**: `SUPPLY_DOMAINS` posa una capa
d'àmbits per sobre de les dues llistes sense substituir-ne cap. Set fan de pont
de debò; vuit tenen una sola banda perquè forçar-hi una equivalència seria
mentir. La banda de coincidències separa **exacta** de **mateix àmbit**, diu
quines dues coses creua, i amaga l'àmbit que no travessa res que l'exacta no
digui ja. El filtre d'àmbit és un xip, no un text a la caixa de cerca —«Reparar i
bricolar» no és el títol de cap fitxa i posar-l'hi hauria donat zero resultats.

### Defectes trobats i encara oberts

- ~~**Un objecte valia hores**~~ · **resolt (V55)**. V45 va afegir el tipus
  d'apunt `objecte` amb el valor **en euros** (donacions i desgast per préstec),
  però tres llocs seguien assumint «el que no és moneda són hores»: `measure()`
  —que alimenta cada roll-up i cada panell de consolidació—, el total «Temps
  aportat» de `renderLedger`, i la taula de projectes del dashboard. Cada préstec
  d'una biblioteca inflava les hores del territori amb un import en €. Ara
  `measure` retorna `objectes` com a calaix propi i cap dels tres el barreja.


- ~~**El selector d'idioma de la landing és inabastable a 1280 px**~~ · **no es
  reprodueix (mesurat el 26/09/2026)**, i val la pena dir per què, perquè
  l'error era del diagnòstic i no del codi. Mesures d'ara mateix del botó
  `.lang-btn[data-lang="es"]`:

  | Finestra | x del botó | Dins del viewport | Scroll horitzontal |
  |---|---:|---|---|
  | 1280 px | 1146 | sí | no |
  | 1440 px | **1342** | sí | no |
  | 390 px | 256 | sí | no |

  **El 1342 de l'apunt original és exactament la posició a 1440 px.** O sigui: la
  mesura es va prendre en una finestra de 1440 i es va escriure com si fos de
  1280, i d'aquí va sortir la conclusió que sortia del viewport. A cap de les
  tres amplades surt, i a cap hi ha scroll horitzontal.

  La lliçó, que és la que val més que el defecte: **una mesura sense l'amplada
  al costat no és una mesura.** Un timeout en clicar un botó té moltes causes i
  «està fora de pantalla» només és una; donar-la per bona sense comprovar-la va
  deixar aquí un any un defecte que no existia.

- ~~`updateAtles` no era idempotent~~ · **resolt (V41)**. Eren dues coses: el
  `catch` buit s'empassava els paquets que fallaven i deia «ja estava al dia», i
  la càrrega automàtica d'arrencada corria alhora que la manual fusionant els
  mateixos paquets. Amb el recompte de fallades i un pany d'una sola càrrega en
  vol: 17 · 17 · 17 estable.
- ~~`ventureGraduates` i `home3ActionButtons`~~ · **no eren defectes de l'app,
  eren tests obsolets**. El primer esperava que una venture sense feina feta
  gradués —la porta fa bé de bloquejar-la—; ara comprova les dues cares. El
  segon comptava exactament tres botons a la home, que se'n va menjar cada cop
  que hi afegíem una targeta; ara comprova que cada perfil tingui la seva acció.
  Tenir tests vermells que no són defectes erosiona la confiança en tota la
  suite: o són verds o no hi són.
- ~~`tier1IsSearchActionsPersona`~~ · **sí que era una regressió meva**, i la
  única d'aquesta línia. La pastilla del vistiplau (V43) es va afegir com a quart
  botó permanent de la barra, amagat amb `display:none`. La barra té **tres**
  controls d'alta freqüència i prou. Ara la pastilla **no existeix al DOM** quan
  no hi ha res esperant, i el test comprova les dues cares: tres per defecte,
  quatre quan algú espera. Un botó invisible que ocupa lloc a l'estructura és un
  botó que algun dia sortirà per accident.
- ~~`everyRoleHasItsCard`~~ · **buit real de la V46**: `mentor` va entrar a
  `SOS_ROLES` amb recorregut, lents i mòduls, però **la portada es va quedar
  enrere** i el rol no hi tenia targeta. Afegir un rol i deixar-lo sense targeta
  el fa invisible justament al lloc on la gent decideix què és. (El test antic
  buscava la paraula «Comunitat» i s'havia trencat en renombrar l'etiqueta; ara
  comprova que **cap rol es quedi sense targeta**, que és la invariant.)
- ~~`ventureGraduates` a `test-matriu-main`~~ · el mateix test obsolet que ja es
  va corregir a `test-matriu`, en un segon fitxer. Ara comprova les dues cares, i
  de passada documenta una cosa que val la pena: amb **una sola persona
  aportant-hi, l'equity és del 100% i la porta ho para**. Una iniciativa que
  depèn d'algú sol no està preparada per sortir.
- ~~`test-atles`, `test-atles-main`, `test-atles2`, `test-dir`~~ · **infraestructura
  i recomptes fixos, no defectes**. Els quatre esperaven un servidor HTTP que
  ningú arrencava (l'atles fa `fetch` i `file://` el bloqueja): ara se'l munten
  ells amb `serve.mjs`. Tres fixaven «6 entitats» quan l'atles ja en té 17;
  comproven la invariant —que en carrega alguna, que **tots els paquets
  arriben** (`updateAtles.last.complete`, V41) i que la segona càrrega dona el
  mateix— en comptes d'un número que canvia cada cop que l'atles creix. I
  `test-dir` llegia el recompte **amb la càrrega a mig fer**, així que la
  comparació d'després de recarregar fallava per una cursa del test.
- ~~`test-formacio`~~ · **tampoc era un defecte, era un test obsolet**. Fixava
  `.module === 8` i quatre recomptes de caixes a 8, i `formacio.html` ja té 16
  mòduls; a més, els mòduls nous fan servir `.box.metode` on els primers feien
  servir `.box.eines` —la mateixa caixa amb un altre nom, no una que falti. Ara
  comprova les invariants de debò: els ids van de `m1` fins a l'últim **sense
  forats**, i **cap mòdul es queda sense les seves quatre caixes**. Deixa de
  posar-se vermell cada cop que la formació creix.

### Backlog crític restant (del codex V17)
3. **Sign records via WebAuthn** (no només vinculació) — refactor de signRecord per acceptar signer alternatiu
4. **Ancoratge Nostr P1** — `wss://relay.damus.io` publicació de mainHash *(bloqueja: cal relés reachable)*
5. **Snapshot Arweave / IPFS+OTS** — notarització permanent opt-in *(bloqueja: xarxa/paga)*
6. **AI review PRs deep integration** — GitHub App webhook fluid *(bloqueja: infra externa)*
10. **Wallets W2 (Nostr NIP-07) / W3 (EIP-712)** *(bloqueja: providers)*

### Qualitative tests de l'app
- Playtest guidat: 5 persones fan el fluid onboarding + creació perfil + primer intercanvi + primera aportació signada; recollir friccions.
- A/B test del text de la home (fase llavor vs directe).
- Test de comprensió del cromo (una persona sense context: entén tier, superpoders, superarmes, level bar?).
- Test d'accessibilitat WCAG 2.1 AA (contrast, keyboard nav, screen reader).
- Test de rendiment amb 500 nodes + 5.000 apunts al ledger.
- Compatibilitat: iPad Safari, Android Chrome, Firefox desktop, Edge.

### MATRIU · pla de millora èpic
Auditoria completa, defectes corregits i 8 fases pendents a
**`../matriu/pla-millora.md`**. Com funciona avui: **`../matriu/guia-funcionament.md`**.

**F1 acompanyament**, **F2 viabilitat econòmica**, **F3 riscos/bloquejos** i
**F4 vista de cohort** ja estan fetes — són les que fan que la MATRIU deixi de
ser un repositori d'estructures i passi a ser un servei que es pot coordinar.
Pendents: F5 finançament i tràmits · F6 formació lligada a l'etapa ·
F7 seguiment post-graduació · F8 evidències.

### Visió de fons · Catalunya com a estat líquid descentralitzat

Anotat com a horitzó del model, no com a feina d'una onada. És el marc que dona
sentit a la federació de nodes que ja hi ha implementada.

**La tesi.** Catalunya com a **estat líquid**: no una estructura fixa que
administra un territori, sinó una **federació de federacions** que es recompon
segons el que cal sostenir en cada moment. La cohesió no la dona l'aparell —
la dona una **cultura compartida**.

**Els valors.** Sintetitzats en **seny i rauxa**, i el lloc on aquests dos
conviuen sense contradicció és la **cultura castellera**: el càlcul i el risc a
la mateixa pinya. D'aquí surten els quatre valors que ja fem servir com a
criteri de decisió (Força · Equilibri · Valor · Seny) i el fet que el castell
sigui l'única metàfora del SOS que no és decorativa: descriu una estructura on
la base és més ampla que el cim i on ningú puja sense que algú el sostingui.

**Què hi ha ja construït que hi apunta**
- Nodes territorials encaixats (país → província → comarca → municipi → barri)
  que existeixen i funcionen per separat.
- Assemblea federativa amb pes **Penrose-√població i correcció de Gini**: un
  municipi petit no queda esborrat per un de gran.
- Governança per **sabiduria** (quòrum de guardians) i registre públic de
  decisions ancorable, que no depèn de cap servidor central.
- Sync **P2P** entre navegadors: la federació no necessita un node mestre.

**Què hi falta per sostenir la tesi** (no prioritzat, per pensar)
- **Adhesió i sortida explícites**: com un node entra i surt d'una federació
  sense trencar el que ja ha comptabilitzat. Un estat líquid sense dret de
  sortida és un estat sòlid amb bon màrqueting.
- **Federacions per tema, no només per territori** (energia, cures, habitatge):
  el mateix node dins de diverses federacions alhora. Vegeu el detall a sota —
  és la peça que fa que «líquid» vulgui dir alguna cosa operativa.
- **Subsidiarietat comptable**: quina decisió es pren a quin nivell, i com es
  resol el conflicte entre nivells sense recentralitzar.
- **Interoperabilitat entre federacions** que no comparteixen guardians: què és
  suficient per confiar en el mapa de valor d'algú altre.

#### Federacions temàtiques · el vincle és el tema, no el mapa

El que fa que l'estat sigui **líquid** no és la geografia: és que **et federes
quan et vincules a un tema**. El territori segueix sent un eix (i el que ja hi ha
construït), però deixa de ser l'únic.

**El model de referència és `del.icio.us`.** No pel producte —era un gestor
d'adreces— sinó pel mecanisme: **etiquetaves una cosa i, en fer-ho, apareixia la
gent que havia etiquetat el mateix**. Ningú havia de crear un grup, demanar
permís ni acceptar una invitació. El grup emergia de l'acte d'etiquetar. Tres
propietats que val la pena copiar tal qual:

1. **L'etiqueta és una declaració d'interès, no una categoria administrativa.**
   La posa qui participa, no un comitè de taxonomia.
2. **El descobriment és lateral**: de l'etiqueta a les persones, i de les
   persones a les seves altres etiquetes. Així es troba gent amb qui comparteixes
   coses que no sabies que compartíeu.
3. **Els grups es poden agrupar.** Una federació de temes és un tema. Aquesta
   recursivitat és exactament la mateixa que «federació de federacions», i és el
   que evita haver de decidir a priori quin és el nivell correcte.

**Com encaixa amb el que ja tenim**
- Les categories de skills, les tipologies d'objectes i els `dynamicType` ja són,
  de fet, etiquetes: avui serveixen per classificar, no per federar. El salt és
  fer que **etiquetar connecti**.
- Els pings ja fan matching lateral per categoria entre nodes diferents: és el
  mateix mecanisme, però limitat a oferta↔demanda. Generalitzar-lo a interessos.
- Els arquetips declarats del dossier són una etiqueta d'un altre ordre (com sóc,
  no què m'interessa): serveixen per compondre equips, no per federar.

**Decidit · tot valor aportat es comptabilitza, i el valor és el que defineix
el mapa de valor.**

Això tanca la pregunta que quedava oberta (si una federació temàtica és una
comunitat o només un filtre de cerca): **és una comunitat**, perquè té mapa i,
per tant, té comptes. I té una conseqüència de disseny que estalvia feina:

- **No cal cap primitiva nova.** Una federació temàtica és un node com qualsevol
  altre: metaskill + mapa de valor + ledger + governança. L'únic que canvia és
  què la lliga — un tema en comptes d'un límit administratiu.
- **El mapa de valor és l'esquema comptable, no la decoració.** El que compta com
  a valor en aquella federació és exactament el que els seus fluxos declaren.
  Dues federacions poden comptar coses diferents sense contradir-se, perquè
  cadascuna ha declarat el seu mapa.
- **Res queda fora per ser intangible.** Si un flux intangible és al mapa, és
  comptabilitzable: aquesta és la diferència entre reconèixer el treball
  invisible i només anomenar-lo.
- **La reciprocitat és auditable a qualsevol escala.** Els mateixos indicadors
  (`vnaAudit`) valen per a un banc de temps de barri i per a una federació de
  federacions, perquè la unitat d'anàlisi és sempre el mapa.

**El que continua obert**
- Qui pot crear una etiqueta i com s'eviten cent variants del mateix tema sense
  posar-hi un comitè. (Suggerència: fusió proposada, mai automàtica.)
- Com es consolida el valor entre nivells sense comptar-lo dues vegades: el
  `rollup` territorial ja ho fa cap amunt; una persona dins de tres federacions
  temàtiques necessita la mateixa regla.
- Com es fa visible la persona sense convertir-ho en una xarxa social d'exhibició:
  el SOS mostra el que has fet, no el que dius que t'agrada.
- Privadesa: quines etiquetes són públiques i quines es queden al dossier local.

**Font**: converses amb l'Àlvar. Cal desenvolupar-ho com a document de visió
propi quan toqui; aquí queda anotat perquè no es perdi.

### Una miniapp per cada tipus de projecte d'un poble

**El criteri, corregit.** Aquest bloc deia que el banc de temps i la biblioteca
de les coses estaven pendents, i **era fals**: totes dues estan fetes des de fa
temps *dins de l'app*, amb pestanya pròpia (`renderBancTemps`,
`renderBiblioteca`) i el cicle sencer — ofertes i demandes, creuament
(`findMatches`), saldo (`memberBalance`) i registre d'intercanvi signat
(`exchangeHours`) per al banc; reserva, préstec, retard, desgast, donació,
reparació i estadística circular (`reserveObject`, `lendObject`, `dueStatus`,
`recordLoanWear`, `recordDonation`, `logRepair`, `circularStats`) per a la
biblioteca. Escriure-les com a pendents era exactament la mena d'afirmació
caducada que la resta d'aquest repositori existeix per evitar.

La correcció canvia el criteri, i val la pena dir-lo bé: **el que decideix si
una dinàmica necessita pàgina pròpia no és si té eina, sinó a qui serveix.**

- **Dins de l'app** va el que es fa **quan ja hi ets**: apuntar hores, prestar
  un trepant, tancar un intercanvi. Ho fa qui té sessió i context.
- **Pàgina pròpia** té el que ha de **fer una feina abans que ningú s'apunti a
  res**: La Compra dona la comanda per productor amb els mínims; L'Energia dona
  els coeficients i l'amortització. Són portes d'entrada que resolen alguna
  cosa el primer dia, i per això valen la pena com a fitxer a part.

Amb aquest criteri, el banc de temps i la biblioteca **no necessiten pàgina**:
la seva feina és de dins, i ja hi és.

**Fet, i on:**

| Dinàmica | On viu | Què fa |
|---|---|---|
| ⏳ **Banc de temps** | pestanya de l'app | Ofertes i demandes, creuament, saldo d'hores i registre d'intercanvi signat |
| 🧰 **Biblioteca de les coses** | pestanya de l'app | Reserva, préstec, retard, desgast, donació, reparació i estadística circular |
| 🕸 **Mapeig de xarxa de valor** | `vna.html` | El mapa amb rols i intercanvis, i on hi encaixa cadascú |
| 🥬🛒 **Consum agroecològic i compra col·lectiva** | `compra.html` | Cistella del 80%, comanda per productor amb mínims i formats, estalvi per causa i la caixa de cada llar |
| ⚡ **Comunitat energètica** | `energia.html` | Coeficients amb els tres repartiments comparats, estalvi separat, amortització neta i el tràmit amb de qui depèn cada pas. Veda 129 |
| 🤝 **Suport mutu / cures veïnals** | pestanya de l'app | El compromís d'acompanyament (qui, a qui, què, cada quan), la càrrega per cuidadora amb llindar declarat, la cobertura de cada persona acompanyada i **la projecció**: si aquesta plega, qui es queda sense ningú. Cap dada de salut i els noms només per a qui sosté el node. Veda 133 |
| 🛠 **Cooperativa de treball** | pestanya de l'app | El Slicing Pie vist per qui hi treballa: la llesca desglossada, la dilució amb el ritme d'ara, **què costa parar** en punts, quantes hores falten per a un objectiu, i la forquilla salarial calculada de les tarifes reals del registre. Veda 134 |
| 🏠 **Habitatge en cessió d'ús** | `habitatge.html` | El cost amb els comuns, la porta del 20% de recursos no bancaris, la quota per llar amb l'esforç sobre els seus ingressos, el recorregut sencer de l'aportació —qui queda fora per l'entrada i qui per la quota— i què cobra i qui li ho torna a qui marxa. Veda 130 |
| 🌱 **MATRIU** | app + `matriu.html` | La incubadora dins, i el model explicat fora |

**Pendents, amb el criteri de dalt aplicat:**

| Dinàmica | Rols | Què falta, i de quina mena |
|---|---|---|
| 🏘 **Cens d'entitats** | 5 | **A `online.html`**, que ja és el directori: el que falta és l'**alta i la fitxa** des del territori, no només la consulta |

**Tres regles que valen per a totes** (i que surten del que ja ha passat amb La
Compra):

- **Cap xifra sense data ni font.** Les tarifes elèctriques, les quotes i els
  preus caduquen igual que els del pagès. Vedes de La Compra.
- **El mapa de valor de la dinàmica va a dins**, còpia literal, amb guarda que
  el compari amb `DYNAMICS`. Sense això la miniapp és una calculadora amb el nom
  d'una dinàmica a sobre.
- **Cap miniapp cobra ni confirma un cobrament.** El compte sí; el cobrament,
  mai — i el vocabulari ho ha de dir («posar a la caixa», «declarat»).

**Estimació honesta**: una pàgina pròpia és de la mida de La Compra o de
L'Energia — una tanda de feina sencera amb el seu model, la seva guarda i les
seves proves. El que va dins de l'app és més curt, però hi ha el sostre de KISS
a sobre (`SOS/index.html` és al 96%) i cada afegit hi ha d'anar amb la pujada
de sostre justificada al commit. No es poden fer totes de cop, i fer-les a
mitges és pitjor que no fer-les: una eina que no resol la feina de la setmana
no la torna a obrir ningú.

### Molekulandia · fet a `molekulandia.html`

El poble on cada edifici és un projecte del catàleg: **el bar és el banc de
temps, la ferreteria és la biblioteca de les coses**. Onze edificis a l'arcada,
la plaça al mig, i el terme al voltant amb les 14 activitats crítiques i les 6
formes de projecte.

**La peça intel·lectual, resolta i generada.** Sumant les tres fonts surten
**165 caselles de rol amb 116 noms**. La troballa és que la majoria **no són
professions**: 33 són oficis, 31 són maneres de prendre-hi part —ser sòcia no
s'aprèn, s'hi és—, 44 són qui hi ha a fora i 8 són peces del projecte. Els 33
oficis es tanquen en **nou professions**. Ho genera
`tools/build-molekulandia.js` de les taules de `index.html`: la taxonomia es
declara allà, un nom per línia, i un rol nou al catàleg **obliga a decidir de
quina natura és** en comptes de colar-se com a «altres». Veda 131.

**El criteri es va complir:** de cada edifici s'hi entra, i cadascun té
exactament una sortida —o una porta a una eina que existeix (9), o la frase que
diu que encara no n'hi ha cap (2). Cap porta apunta a un fitxer que no hi és, i
`check-molekulandia.js` ho compta.

**El que en va sortir i no s'havia previst:**

| Troballa | Què vol dir |
|---|---|
| **Cultura i relat no s'aprèn a cap edifici de l'arcada** | Existeix només a les activitats del terme (cultura, turisme). És un **forat del catàleg**, no de la professió: hi falta un tipus de projecte que la sostingui |
| **«fora» és la natura més nombrosa (44 de 116)** | Un mapa de valor és sobretot **un mapa de fronteres**: la major part dels noms que hi surten són gent amb qui es tracta, no gent que hi és a dins |
| El casal (suport mutu) i el taller (coop. de treball) són els dos edificis sense eina | Coincideix amb els pendents del bloc anterior, i ara es veu des del poble |

### El directori, endollat a la identitat del SOS · fet

El directori publicava però no pintava. Amb una sola fitxa a la taula —la de
l'autor— la pantalla deia *«1 fitxa descartada… algú ha escrit al directori
sense la clau de qui deia ser»*, i ho deia al mòbil, a la tauleta i a
l'ordinador.

**L'avaria era nostra i era d'una línia.** El `did` es derivava del hash de
`JSON.stringify(jwk)`, i això no és el hash de la clau sinó de com l'ha escrit
qui l'hagi escrit. El navegador exporta el JWK alfabèticament; Postgres el torna
com a `jsonb`, que ordena les claus per longitud. Mateixa clau, dos dids, i
`fitxaValida` descartava tothom. La firma Ed25519 verificava perfectament tota
l'estona. Vedes 135 i 136.

Es va comprovar què costaria si el canvi mogués alguna identitat, perquè no era
obvi: dins de l'app el `did` **no entra mai als bytes signats** i `_didFromJwk`
només s'invoca en crear la identitat, així que l'única verificació de tot el
projecte que el recalcula és la del directori. I la forma canònica **és**
l'alfabètica que el navegador ja feia servir: cap identitat s'ha mogut, comprovat
contra la fitxa ja publicada abans de tocar res.

Sobre això, les dues coses que faltaven perquè el directori i l'eina fossin la
mateixa persona:

- **«Porta el meu perfil del SOS».** Les dues pàgines comparteixen la IndexedDB
  del navegador: el perfil no s'exporta ni s'importa, ja hi és. S'hi arriba pel
  `did` —el criteri de `joinNode`, no el nom— i omple el formulari sense publicar
  res: la previsualització segueix sent l'últim que es veu (veda 47).
- **Entrar amb la identitat del SOS.** El mateix fitxer xifrat que exporta
  l'eina (PBKDF2 210 000 · AES-GCM), amb la mateixa guarda: substituir una
  identitat que ja ha firmat coses no passa sense confirmar-ho. I es pot guardar
  una còpia des d'aquí, perquè qui arribi primer pel directori no es quedi sense
  manera de tornar-hi.

**Queda obert**: la sala de xat no té relé endollat —es xifra i no surt del
navegador—, i el 🏘 cens d'entitats de la taula de dalt segueix sent l'alta i la
fitxa des del territori.

### Parlar el llenguatge del programa municipal que ja existeix

**La idea.** El SOS diu «oferta de servei», «banc de temps», «mapa de valor».
Un ajuntament que ja té un programa en marxa diu una altra cosa —a **Pacs del
Penedès**, el **Consell de l'Experiència**— i qui hi participa s'hi reconeix per
aquell nom, no pel nostre. Avui, per entrar-hi, li demanem que aprengui el
nostre vocabulari primer. És la barrera més barata de treure i la que no es veu.

**El que caldria**, i que és més de comunicació que de codi:

- **Una capa de noms per territori.** El mateix que fa el SOS, dit amb el nom
  del programa local: el que aquí és una oferta d'acompanyament, allà és una
  activitat del Consell de l'Experiència. Ni traducció ni marca blanca:
  **el nom del programa a fora i el mateix registre a dins**, perquè les hores
  segueixin sent hores comparables entre municipis.
- **Un full d'entrada per programa**: què hi guanya l'ajuntament (les hores
  comptades i signades que avui no té), què hi guanya qui hi participa, i què
  **no** és —que no substitueix el programa ni el gestiona.
- **La comunicació de sortida**: com s'expliquen les ofertes a qui ja és al
  programa, que sol arribar-hi en paper i per la regidoria, no per una app.

**Abans de fer res, cal confirmar-ho amb la font.** No sé com funciona el
Consell de l'Experiència de Pacs —qui l'organitza, què hi fa la gent, si té
inscripció i amb quin calendari—, i inventar-s'ho seria exactament l'error que
la resta d'aquest repositori intenta evitar. **Primer una conversa amb qui el
porta, després el disseny.** El mateix per a qualsevol altre programa: el patró
és replicable, els noms no.

**Per què val la pena.** És el camí invers al que hem fet fins ara: en comptes
de portar gent nova al SOS, portar el SOS on la gent ja és. I la gent gran
organitzada per un ajuntament és exactament qui més té a aportar al banc de
temps i qui menys probable és que s'instal·li res pel seu compte.

### El pomodoro i l'oferta navegable · fet

Dues coses que s'assemblen a coses que hi ha a tot arreu, i el que s'ha
construït és exactament el que les fa diferents.

- **El pomodoro acaba al registre.** Un comptador enrere no calia construir-lo;
  el que calia és el final: aquí el temps que dones és una aportació signada, i
  el forat era que ningú apunta les hores perquè quan les apuntaria ja fa dies
  que van passar. Es pot donar per fet abans d'hora —el que compta és la feina,
  no el rellotge—, en corre un de sol, viu al navegador i no al registre, i desa
  **l'hora d'acabar** i no els minuts que falten: un mòbil que s'adorm atura el
  temporitzador i el compte ha de seguir sent cert. Veda 145.
- **La biblioteca i el banc, per zona, tema i els meus grups.** Es miraven node
  per node: per saber si algú de la comarca tenia un trepant calia entrar a cada
  biblioteca. Ara `searchSupply` accepta els **mateixos tres eixos que la
  pantalla de tasques** —zona amb les dues direccions, tema, i els meus grups—
  perquè qui aprèn a navegar en un lloc no ha de tornar a aprendre. I les
  coincidències hi passen també: proposar un intercanvi amb algú que el filtre
  amaga és proposar el que ningú pot fer.
- **Les dues pestanyes tenen sortida.** Un botó a la biblioteca i al banc obre
  la cerca creuada amb aquell àmbit ja triat: la pestanya passa de ser un cul de
  sac a ser un punt de partida.

**Dos defectes trobats pel camí i arreglats**, cap dels dos denunciat per res:

- `var(--accent-green)` s'usava a **quatre llocs** de l'app i el token no
  existeix en aquest fitxer (és el de la portada). Una variable CSS que no
  resol invalida la declaració: quatre colors que no s'aplicaven mai.
- `openSupplySearch(prefill)` només llegia `prefill.q`, i hi havia una crida
  que hi passava un text —`openSupplySearch(g.label)`. `'fusteria'.q` és
  `undefined`: la cerca s'obria en blanc i qui hi clicava tornava a escriure el
  que acabava de llegir. Ara accepta les dues formes.

**Guardes**: quatre regles noves a `check-tasques.js`, provades trencant-les.
**Proves**: `test-pomodoro.mjs`.

**El que queda obert:**

- **El pomodoro no sap quantes estones portes.** Comptar-les voldria dir desar
  un historial, i el que ja es desa de debò són les hores registrades: abans de
  duplicar-ho, val la pena mirar si el registre ja respon la pregunta.
- **La durada és fixa a 25 minuts.** Fer-la triable és fàcil; decidir si val la
  pena és una altra cosa.

### El Comando com a projecte de pel·lícula · fet

El Comando existia sis vegades sense que cap peça digués que les altres hi
fossin: la història dels còmics a `comando.html`, els catorze personatges a
`CANONICAL_HEROES`, el perfil de superheroi/na en un modal, el kit narratiu en
un altre, el multivers en un tercer i Molekulandia en una pàgina a part. El que
faltava no era una peça més sinó **dir què és tot plegat**: una pel·lícula
col·laborativa que faran 150.000 persones, on el personatge de cadascú és el
que ja fa al seu barri.

- **`build-comando.js`** declara els sis eixos (art, ficció, educació,
  inspiració, empoderament de les comunitats i autonomia — cadascun amb la
  pantalla on allò es fa), els quatre passos amb la seva ruta a l'app, les peces
  de vídeo i so, i els enllaços al blog. Les **fitxes d'heroi ja no són una
  còpia a mà**: surten de `CANONICAL_HEROES`, que era el que `check-comando.js`
  vigilava des que van divergir.
- **Ruta `kit`** nova a `MODAL_ROUTES`: sense ella l'enllaç del pas 2 obria
  l'app per la portada i semblava que no hagués passat res.
- **Ponts als dos sentits**: des del modal del Comando a la pàgina del projecte,
  i des del perfil acabat de fer al kit narratiu amb el nom ja posat.
- **`check-comando.js`** guanya cinc regles: la xifra del comptador surt de
  `COMANDO_TARGET`, els quatre mòduls s'obren des de la pàgina, cap enllaç mort
  (fitxer, ruta o àncora), cap peça sense enllaç pintada com a porta, i cap
  paraula de la llista negra de la guia de marca. Veda 146.

**La llista de capítols ja hi és.** L'autor l'ha donada i és a
`MOLEKULON_LINKS.capitols` i a `VIDEOS`: cada capítol presenta un superheroi i
un **supervilà del Mundo Muerto**, i és on viu el videoclip d'Horacio. És
l'única peça que la guarda obliga a tenir adreça —mentre els capítols no en
tinguin una d'un en un, és la porta que sosté la secció.

**Els vídeos, d'un en un.** L'autor n'ha donat tretze i el catàleg n'és a
`VIDEOS`: videoclips d'Horacio, Reciclator, Supergerminador, la Medusa
Andaluza, la Bomba Disco (Guiri-Guay i Flying Frog), Flying Frog, la Formiga
Atòmica, el Risitas i el Príncep de Bekelar, i Mc Greggor; els temes d'Horacio i
del Guiri-Guay; i el directe de la Bomba Disco a la Floresta.

**El que encara falta:**

| Peça | Qui | Què falta |
|---|---|---|
| Pigmentón | Pigmentón | l'URL del videoclip |
| Fraktalman | Fraktalman | l'URL del tema |
| Tekno Kartoffeln | — | l'URL. **Dubte a resolir:** és el mateix vídeo que el de Mc Greggor o un de propi? El missatge els va donar seguits amb un sol enllaç |
| Un taller, filmat | — | l'URL d'una sessió filmada |
| Supergerminador | Supergerminador | la web pròpia (el videoclip ja hi és) |

> **Per què no els he tret jo de la llista.** YouTube està bloquejat per
> l'egress proxy de la sessió (403 tant per WebFetch com per curl): no es pot
> enumerar la playlist ni mirar cap capítol des d'aquí. Tot el que hi ha entrat
> ve del que ha escrit l'autor, no de mirar els vídeos. **N'hi ha més que
> arribaran**: el catàleg està fet per créixer una línia per peça.

**Personatges nous que han entrat pels vídeos**, a `COMANDO_ALLIES`: la Formiga
Atòmica ja hi era i ara diu què fa (modista, superarma **Pistola Amor**), i
s'hi afegeixen **Flying Frog** —la que posa el color al còmic—, **El Risitas**
—el nòvio de la Formiga— i el **Príncep de Bekelar**. Els dos últims van amb
`previ:true`: l'autor n'ha dit el nom i encara no ha dit de quin bàndol són ni
quin paper hi fan. Cap dels quatre entra a `CANONICAL_HEROES`, que exigeix
poder i equivalència a un equip: inventar-los seria fer passar per obra el que
no ho és.

> **Defecte trobat i tancat.** El supervilà tenia **dues grafies**: les dades
> deien `Mc Greggor` i el text dels còmics —`comando.html`, el blog, el codex i
> la funció `ofereixMcGragor` del joc— deia **McGragor**. Era el defecte de la
> veda 109 un pis més avall: la guarda del relat vigilava els noms d'heroi i no
> els dels vilans ni els dels aliats. L'autor ha dit que la bona és la de
> l'obra: **Mr. McGragor**. Unificat a les cinc fitxes que deien l'altra, i la
> guarda s'estén ara als vilans i als aliats amb la grafia vella a la llista
> negra.

**El que sí que ha entrat del contingut dels vídeos:** al capítol de Reciclator
s'hi parla de dues superarmes, la **Bomba Amor** i el **Rayo Cagón**. Van a la
seva fitxa de `CANONICAL_HEROES`, al taller i no a la mà de ningú: el que se
sap és que d'allà en surten, i quin heroi les porta ho diu l'obra. Queda per
mirar la resta de capítols amb el mateix criteri —**cada capítol presenta també
un supervilà**, i `COMANDO_VILLAINS` només en té tres (Max Miedox, Mala Yerbax,
Mc Greggor); si als vídeos n'hi surten més, hi han d'entrar amb el seu nom tal
com el diu l'obra.

I dues coses més que segueixen obertes: l'Amazon i l'Instagram de
`MOLEKULON_LINKS` són provisionals i estan escrits com si fossin certs, i el
final del còmic 3 no és al repositori públic a posta.

### El directori endollat al SOS · nick, territori i xat · fet

Quatre coses que anaven juntes perquè totes surten del mateix: **el directori i
l'app eren dues cases que no es parlaven**, i qui passava d'una a l'altra havia
de tornar a escriure el que ja tenia.

- **`@nick`.** Sense una manera d'anomenar algú, parlar d'una persona vol dir
  enganxar-ne el `did`. Es normalitza abans de firmar, avisa si ja el fa servir
  algú, i **no bloqueja**: aquí ningú reparteix noms. La pàgina diu que qui
  identifica és la firma. Veda 144.
- **El territori es tria, no s'escriu.** `build-geo.js` llegeix `CAT_GEO` i
  `EUS_GEO` de l'app —188 municipis de Catalunya i 125 d'Euskadi, que és qui
  els fa servir per construir l'arbre— i els escriu al directori. La comarca es
  dedueix del municipi i no es demana. Qui és de fora tria país d'una llista de
  78 i escriu el poble: una llista incompleta no ha de deixar ningú fora.
- **El camí des de l'app.** Des del perfil, «Publica'm al directori» obre
  `online.html#alta-sos` amb tot portat. **Cap còpia de dades**: el directori i
  l'app es serveixen del mateix lloc i el directori ja podia llegir el que tens
  apuntat. Copiar-ho a `localStorage` hauria estat una segona còpia que
  envelliria. I arribar-hi no publica res: la previsualització segueix sent
  l'última paraula (veda 47).
- **El xat, endollat.** `online.html` xifrava el missatge i després no tenia on
  enviar-lo: `__SOS_ONLINE_RELAY` era un ganxo que no implementava ningú. Ara hi
  ha relé, i **sense configurar res**: el directori ja parla amb aquest projecte
  Supabase per llegir les fitxes, i el canal de temps real hi va per sobre amb
  la mateixa clau publicable. Es connecta en obrir una conversa i no en carregar
  la pàgina, i pel canal hi passa el blob xifrat i mai el text.

**Guardes**: `check-nick.js` (el nick no identifica, la geografia surt de l'app,
pel relé només hi passa xifrat) i `build-geo.js --check`. Sis regles provades
trencant-les. **Proves**: `test-nick.mjs`.

**El que queda obert d'aquesta onada:**

- **El nick a la permaweb.** Ara viu a la fitxa firmada i prou. Ancorar-lo
  voldria dir decidir què passa quan dos el reclamen, i això és una decisió de
  governança abans que de codi.
- **El kanban com a lloc únic de registre i interacció**, amb pomodoro i
  comptador. No s'ha tocat.
- **La biblioteca i el banc amb filtres per grup, zona i ATG.** No s'ha tocat.
- **`uneix-te.html` substituïda per la landing nova.** No s'ha tocat, i cal
  aclarir quina landing.
- **Provar el relé de debò.** Des d'aquí el proxy bloqueja `supabase.co`, així
  que el que s'ha comprovat és el camí i no la connexió.

### El hero obert, el preu sense tarifa publicada, i el formulari de pressupost · fet

Set coses que es van decidir juntes perquè totes surten de la mateixa: **la
pàgina venia a dues cases i només en nomenava una**, i el preu era una xifra
tancada allà on no es podia tancar.

- **El hero parla als dos sectors.** L'eyebrow deia «per a ajuntaments, consells
  comarcals i entitats» i la meitat de l'oferta —la que té vint anys de
  quilòmetres— quedava fora del que la pàgina deia que venia. Ara nomena les dues
  cases, hi ha **dues portes** que filtren el catàleg, i el titular ja no és
  només comunitari.
- **El catàleg filtra per sector.** Cada paquet declara `privat`, `public` o
  `tots` al generador. Sense JavaScript surten tots, que és l'estat correcte, i
  la família que es queda buida s'amaga amb el seu títol. Veda 142.
- **El taller Fent Pinya i les demostracions ja no publiquen preu.** El que
  costen depèn de quanta gent hi ha, quanta colla cal moure i a quina distància;
  una xifra tancada o espanta o s'ha de desdir. El tarifari 2026 es queda com a
  registre intern a `cataleg-teamtowers-2026.md`.
- **En lloc del preu hi ha el mètode**, sencer i a la pàgina (`#cost`): quatre
  passos —mapa, hores per rol, preu del nivell, despeses directes al seu preu de
  factura— perquè qui llegeix pugui refer el càlcul sense trucar. Veda 140.
- **Escala de tres nivells per hores**, per al sector públic: N1 35 €/h, N2
  55 €/h, N3 80 €/h, sense IVA. El que els separa **no és l'antiguitat**, és
  evidència registrada al SOS — la mateixa que acredita un gestor o un mentor.
- **Itineraris per rol directiu** a `formacio.html`: direcció general, persones,
  innovació, organització, direcció pública i direcció cooperativa. Fins ara els
  itineraris eren rols del SOS, i qui contracta no es diu «guardià del
  territori».
- **Programa de mentoria venible** amb compromís d'evidència i la seva condició
  escrita al mateix paràgraf. Veda 143.
- **`SOS/ia.html`**: fluxos tangibles automatitzats amb frens, intangibles
  mesurats, i la fàbrica —com es dissenyen webs i projectes com el Comando amb
  IA— amb aquest repositori com a prova.
- **`SOS/pressupost.html`** i `build-formularis.js`: els blocs «qui ets» i «d'on
  véns» declarats un cop i escrits al diagnòstic i al pressupost, amb pont per
  `localStorage` perquè el segon no torni a preguntar el que el primer ja sap.
  La proposta suma les forquilles publicades i deixa fora, dites pel seu nom, les
  que no en tenen. Veda 141.
- **La trajectòria real d'Álvaro** a `#facilitador`: InfoJobs, UOC–GEC, Foment
  del Treball, VNA de Verna Allee, Pantheon Work, comunitats.org, i **Fèlix
  Miret com a creador del taller Fent Pinya**. Buidada a
  `SOS/knowledge/negoci/trajectoria.md`.

**Guardes noves**: `check-formularis.js`, `check-ia.js`, `build-formularis.js
--check`, i sis regles més a `check-landing.js`. **Proves noves**:
`test-cost.mjs`, `test-pressupost.mjs`, `test-ia.mjs`.

**El que queda obert d'aquesta onada:**

- **Les hores per rol de cada paquet no estan declarades.** El catàleg publica la
  forquilla i el que la mou; el desglossament d'hores el fa la proposta a mà.
  Declarar-lo per als vint-i-tres o no declarar-lo: mig fet seria pitjor.
- **Els preus unitaris de les despeses directes** (monitor casteller, músic,
  lloguer de faixes) no són al repositori i no me'ls puc inventar.
- **Condicions de reserva i cancel·lació**: segueixen sense existir, i és la
  primera pregunta de qui contracta un esdeveniment.
- **Els itineraris d'inserció** (PIL, Labora't, Prepara't, Singulars, ADA, Dones
  RIU, ACOL, TRFO Joves) no tenen paquet al catàleg, i el Fent Pinya hi encaixa
  amb les seves deu competències. És l'únic dels cinc encaixos que ell mateix
  llista que no té oferta.
- **L'article d'*El Periódico* (2007)** sobre castells i integració és prova
  social amb data i mitjà, i encara no és enllaçat enlloc.

### El catàleg amb tarifa de debò, i totes les pàgines a un clic · fet

Amb el **catàleg comercial TeamTowers 2026** a la mà, el catàleg del web deixa
de portar xifres tancades per mi.

- **Els preus són forquilla amb el que la mou**, i cada un diu d'on surt:
  *tarifa 2026* (2 paquets), *forquilla del model* (8) o *a validar* (9). Un
  preu tancat que ningú ha facturat mai no és més honest que un rang: és un rang
  amb una precisió que no té. Veda 139.
- **El taller Fent Pinya i les demostracions es pinten per trams**, tal com es
  facturen: de 1.700 € (10-29 persones) a 8.925 € (+400), i de 3.300 a 6.500 €
  segons l'alçada. No es negocien.
- **Cada paquet diu què aporta**, que és la pregunta que decideix una compra i
  no hi era. Va abans de les dades i del preu.
- **El sostre dels 5.000 € s'aplica a l'entrada de la forquilla**, no al màxim:
  el que ha de ser cert és que hi hagi manera d'entrar-hi per contractació
  menor. Un festival de tres dies pot passar-lo, i la fitxa diu què l'hi porta.
- **Tots els preus són sense IVA**, i ara ho diu.

**Les xifres, amb la seva font.** El catàleg diu «des del 2005», no 1996: la
portada deia les dues coses i eren incompatibles. Les 60.000 persones són del
taller Fent Pinya i de teamtowers.eu, i el +30-50 % de cohesió porta ara la font
que li faltava —*enquestes internes posteriors a l'esdeveniment*—, que és el que
el fa defensable. El **40 % de retenció d'agències** del catàleg **no s'ha
portat al web**: no porta font, ni mostra, ni període.

**El desplegable de totes les pàgines** a la portada, generat de la mateixa
arquitectura que el menú del SOS (`build-nav.js`), i el modal de l'app rebatejat
«Totes les pàgines». La barra de la portada perd quatre enllaços solts que ara
són al desplegable. I una guarda nova: **cap pàgina de `SOS/` pot existir sense
sortir a un menú o dir per què no** —`crm.html` és privada i ara ho declara.

**La revisió del catàleg PDF** és a
`SOS/knowledge/negoci/cataleg-teamtowers-2026.md`: el contingut buidat, i sis
coses que hi milloraria —la contradicció de dates, les xifres sense font, els
anglicismes que la guia de marca prohibeix, les exclamacions, el que falta i
decideix una compra (pla de pluja, cancel·lació, desplaçaments, edat mínima,
testimonis amb nom) i el pont cap a la resta del catàleg, que no hi és.

**Queda obert**: portar aquestes correccions al PDF mateix, que no es toca des
d'aquí; i les condicions de reserva i cancel·lació, que no consten enlloc.

### Una sola SOS · «Les meves tasques» · fet

El SOS sabia què calia fer i ho sabia **en vuit llocs diferents**: missions,
safata de vistiplaus, tauler d'atenció, riscos, blocatges, alertes de cures,
taulers de projecte i forats de la xarxa. Cap deia «això és el que et toca a
tu». Vuit safates és cap safata, i el defecte només existia a la suma —per això
va durar tant: cadascuna, per si sola, era correcta. Veda 138.

- **Una safata**, `lesMevesTasques()`. **No calcula res de nou**: normalitza les
  onze fonts que ja hi havia i les posa a la mateixa llista.
- **Les columnes són les del tauler que cada projecte ja té** (`KCOLS`: per fer,
  fent, fet). Només les targetes del tauler es poden moure —són les úniques amb
  l'estat desat—, i moure-les des d'aquí les desa al node.
- **Els dos eixos, amb les dues direccions.** Territori (endins = el subarbre;
  enfora = el que et conté i tu no) i tema. Els dos ja existien al codi i no es
  feien servir junts enlloc.
- **Les cures hi entren amb el seu permís**: qui no sosté el node veu el número
  i cap nom, el mateix gate que `renderCures`.
- **Cada tasca diu a quin intercanvi del mapa de valor serveix** quan es pot
  saber. Quan no, no es diu res: `fluxDeTasca` compara text, i acusar el mapa
  d'una limitació del matcher hauria estat la veda 136 una altra vegada.
- **Sostre de KISS de 490 a 510 KB**, justificat: aquesta pantalla no compra una
  funcionalitat nova, en compra una de menys. Cost mesurat: 5 KB gzip.

**Queda obert d'aquesta línia**: les miniapps que viuen fora de l'app —La
Compra, L'Energia, L'Habitatge— tenen dades pròpies a la seva pàgina i **no
poden alimentar aquesta llista**. Cures i llesca sí que hi són, perquè viuen a
dins. Portar-hi les de fora vol decidir abans on viuen les seves dades, i no
s'ha fet aquí.

### La portada v2 · paquetitzat el que ja es fa · fet

Els tres catàlegs que no es parlaven ara són un. Es va **paquetitzar l'oferta
que ja existia** en comptes d'inventar-ne una: els sis serveis del README hi
entren sencers, els S1–S7 del document de negoci també, i les tres famílies
són **els tres oficis** —consultoria, formació, i producció i dinamització—,
amb la versió d'organització i la comunitària del mateix producte convivint
dins de cadascuna.

**El camp que ho fa honest és el punt d'adaptació**: *provat*, *en adaptació* o
*nou*. Sense ell, els vint anys de món corporatiu servirien de prova d'un
producte comunitari que encara no en té, que és el que feia el README. Veda 137.

- **18 paquets**, tots amb per a qui, quant dura, què s'endú, quant costa, amb
  quins diners es paga i quantes vegades s'ha fet. Els d'administració pública,
  per sota de **5.000 €**.
- **Declarat un cop**: `SOS/tools/build-oferta.js` escriu el catàleg a la
  portada (amb les claus dels dos idiomes) i la taula al README. `--check` al CI.
- **L'espina**: benefici → procés → detall, amb el relat de quatre baules
  (Àlvar → psicologia de grups → TeamTowers → Humà) i la formació-acció provada
  amb els projectes propis, tots visitables.
- **El SOS té secció pròpia**: és el projecte, és lliure, i al seu voltant hi ha
  implantació, IA amb frens i l'estudi de contractes intel·ligents —l'estudi, no
  l'eina, perquè l'eina no existeix i es diu.
- **Fora la seguretat quàntica**: no hi ha res construït i les firmes Ed25519
  del SOS no són post-quàntiques.

**Queda obert d'aquesta línia**: el material de visita en paper (un full per
paquet i un guió d'una pàgina), i confirmar les xifres corporatives del README
amb la seva font —s'han retirat els percentatges sense referència, però els
60.000 participants i les 150 empreses encara no tenen data ni document al
costat.

### Revisió de la portada amb l'eix del producte · i el README, que ven una altra empresa · fet a dalt

**El que s'ha demanat**: revisar `index.html` amb **enfocament a conclusió per
producte** —que qui hi entra acabi sabent què contracta— i repassar les
propostes comercials del **README** actualitzant-les amb els productes i
serveis que es volen vendre de debò, per tenir **material de disseny i planing
per a la visita comercial**.

**Els quatre productes**, dits amb les paraules de qui els ven i que ara no són
l'eix de cap de les dues peces:

1. **Consultoria** — disseny i desenvolupament de comunitats.
2. **Formació**.
3. **Producció** de comú-diades.
4. **Dinamització** de comú-diades.

**La primera troballa, i és la que fa mal: el README i la portada venen dues
empreses diferents.**

- El **README** ven consultoria de RRHH corporativa: *«Consultoría estratégica
  de RRHH»*, IKEA, Telefónica, Vodafone, BBVA, Porsche, team building, +30-50 %
  de cohesió en dues hores. Sis serveis, i cap és cap dels quatre de dalt.
- La **portada** ven acció comunitària municipal: 13 serveis en dues famílies
  (metodològics i tecnològics), contractables per ajuntaments i consells
  comarcals, finançables amb Diputació, Ateneus Cooperatius, Leader i Next
  Generation.

Cap de les dues és falsa —són dos negocis que la mateixa persona sap fer— però
qui arriba pel repositori i qui arriba per la web no veuen la mateixa casa, i
els números del README (60.000 participants, 150 empreses) sostenen el discurs
corporatiu i no el comunitari.

**La segona: la portada té serveis, no productes.** Els 13 quadres diuen molt bé
*què és* cada cosa i no diuen res del que decideix una compra: **qui ho compra,
quant dura, què s'endú, quant costa i què fa demà al matí**. La secció de
finançament és l'única que hi arriba, i està una sola vegada al final per a tots
tretze. Un tècnic municipal no pot portar un quadre a una junta.

**I la tercera, que és la que serveix per a la visita: les comú-diades no hi
són.** Producció i dinamització d'una comú-diada és el producte més fàcil
d'explicar en una reunió —una data, un poble, una jornada— i el més fàcil de
finançar, i a la portada no apareix com a producte. Hi ha «Fent Pinya» com a
sessions de cohesió i «posada en marxa de dinàmiques», que en són trossos.

**El que caldria fer**, per ordre:

- **Un sol catàleg, quatre productes**, i els 13 serveis actuals repartits com a
  contingut de dins. La consultoria és on va el mapa del teixit (VNA), la
  governança i el repartiment; la formació és on va Mondragón, l'escola i perdre
  la por a les eines; producció i dinamització són la comú-diada, que avui està
  desmuntada en peces.
- **Una fitxa de producte que conclogui**: per a qui, què s'endú, quant dura, en
  quina forquilla de preu i **quina és la via de finançament d'aquest producte**
  —no la llista genèrica del final. Amb una acció clara per producte.
- **El README reescrit** amb els mateixos quatre productes, i les xifres
  separades per línia: el que ve del món corporatiu és cert i és un actiu, però
  no és la prova del producte comunitari i no es pot fer servir com si ho fos.
- **El material de visita** que en surt sol si les fitxes estan escrites: un
  full per producte i un guió d'una pàgina, en paper, perquè és el que arriba a
  una regidoria.

**Dues regles que ja valen aquí**, i que la guarda de la portada
(`check-landing.js`) hauria d'estendre al catàleg nou:

- **Cap xifra sense data ni font.** Els percentatges d'impacte del README
  (+30-50 %, −47 %, 4×) no diuen d'on surten. O es documenten, o no van a una
  proposta comercial.
- **Cap producte que apunti a una eina que no existeix.** És la mateixa regla que
  ja vigila Molekulandia: si una fitxa promet una pàgina o una plantilla, ha
  d'existir.

### El CRM amb pany, connectat, i cap on ha d'anar

**Demanat per l'Àlvar (28/09/2026):** poder posar-li **una contrasenya** al CRM
i tenir-lo com a CRM de debò; **millorar la integració amb el correu, els
formularis i/o un CRM extern**; i que això acabi evolucionant cap a **un agent
que ajudi en desenvolupament de negoci, planificació i operacions, automatitzant
el que és tangible**. Continua l'entrada «Un CRM que s'actualitza sol» d'aquest
mateix dia; això n'és la part de pany i de camí.

**La contrasenya, i la trampa que té.** `crm.html` és un fitxer estàtic que
qualsevol es pot baixar. Una comprovació de contrasenya escrita a dins **no és
un pany: és un cartell**. Qui obri el codi font la veu, i qui obri la consola
se la salta. I les dades tampoc hi són protegides: viuen al `localStorage`
d'aquest navegador, així que avui **el pany real és el portàtil**.

Tres sortides, i només dues són panys:

| Camí | Què protegeix de debò | Cost |
|---|---|---|
| **Protecció de camí a Netlify** (`/SOS/crm*` amb contrasenya de lloc) | La pàgina no s'arriba a servir. Pany a la porta, no a dins | Minuts, però demana pla de pagament |
| **Netlify Identity o un login davant d'una funció** | Pany real, i a més sap **qui** entra, que és el que cal si un dia hi mira més d'una persona | Un dia, i ja fa falta per a l'enriquiment amb IA |
| Contrasenya dins de l'HTML | Res. Només fa que no s'obri sense voler | Una hora, i **mentiria** |

**El que proposo:** la tercera **només si es diu el que és** —«això evita obrir-lo
sense voler, no protegeix res»—; i que el pany de debò arribi amb la funció
serverless que ja fa falta per llegir el web dels leads. Un pany i un servidor
són la mateixa feina feta un cop.

**La integració amb el correu i els formularis**, per ordre de guany:

1. **Que el diagnòstic entri sol.** Netlify Forms ja rep l'enviament; avui algú
   ha d'enganxar el correu o el JSON a `crm.html`. Un webhook cap a la funció i
   el lead hi és abans que ningú obri res. *És el pas 2 de l'entrada anterior i
   és el que més hores estalvia.*
2. **Llegir el correu, no només rebre'l.** Gran part del que arriba no passa per
   cap formulari: arriba a la bústia. Una lectura del fil que en tregui el
   contacte, què demanen i quan, amb els mateixos frens dels entregables —no
   inventa, marca el que no ha trobat, i diu d'on ho ha tret.
3. **Respondre des d'allà**, amb esborrany i no amb enviament: el CRM prepara,
   la persona prem. Mateixa regla que els entregables (veda 157).

**I cap a on ha d'anar: un agent d'operacions, no un CRM més gran.** El que
demana l'Àlvar no és una graella millor, és **que el treball tangible es faci
sol**. El que ja hi és i s'hi pot enganxar directament: els set intents
d'entregable (`INTENT_ENTREGABLE`), el repartiment màquina/persona
(`fluxAutomatitzable`), i el Kanban. Un lead **és una transacció més**, i una
proposta **és un entregable més** —amb la seva plantilla, la seva revisió
humana i el seu acceptat.

**Per això la primera passa no és tècnica:** portar el lead al mateix taulell
que la resta de feina, en comptes de mantenir-li una pantalla a part. Quan un
lead sigui una targeta, «prepara'm la proposta», «recorda'm de trucar dijous» i
«fes-me el resum del mes» són tres coses que ja saben fer altres parts d'aquesta
casa.

**El que l'Àlvar diu que avui no fa des d'aquí, i és correcte:** *«no faig
pressupostos des d'aquí perquè m'interessa parlar»*. El diagnòstic no diu preus
**a posta**. Que l'agent prepari la conversa —qui són, què volen, què els
proposaríem, què val a la forquilla— **no és el mateix** que enviar-los un preu,
i la diferència s'ha de mantenir quan això s'automatitzi.

---

### Ensenyar l'Àlvar a treure'n el 100 % · un fil llarg, no una entrada

**Demanat per l'Àlvar (28/09/2026):** «vull aprendre a treure't partit al 100 %
en totes les meves operacions i negocis» i que li ho vagi ensenyant.

**El que s'ha vist funcionar en aquest repositori**, i que val fora d'ell:

- **Demanar el resultat, no els passos.** Les millors sessions d'aquí van
  començar amb «vull que passi això» i no amb «fes aquest canvi».
- **Declarar un cop i generar.** Tot el que hi ha en dos llocs divergeix, i
  divergeix **en silenci**. Els 18 generadors d'aquesta casa existeixen per
  això, i el patró és el mateix a un pressupost o a un catàleg de serveis.
- **Una guarda per cada cosa que faria mal sense petar.** El defecte que costa
  car no és el que peta: és el que segueix tornant una resposta raonable.
- **Dir què no es pot.** El valor d'aquestes sessions no ha estat el codi: ha
  estat saber quina d'aquestes coses no es pot fer des d'un HTML estàtic abans
  de pagar per intentar-ho.

**El format que proposo, i és barat:** un document viu
—`knowledge/negoci/treure-partit-ia.md`— amb **un cas real per entrada**: què
es va demanar, què va sortir, què no es va poder i quin és el patró que se'n
pot repetir. Escrit a mesura que passa, no una guia teòrica escrita de cop.

**I una cosa que jo miraria primer**, perquè és la que més hores mou fora del
SOS: **les operacions que avui són a la bústia i al full de càlcul** —comandes,
factures, seguiment de clients, planificació de temporada. Això ja té motor
aquí dins (els set intents), i no s'ha fet servir mai fora del SOS.

---

### La UX del SOS, a l'Apple · ensenyar quan cal, i no abans

**Demanat per l'Àlvar (28/09/2026):** simplificar la UX del SOS cap a **un
Kanban**, i que **tot el contingut que acaba molestant es mostri quan es
necessita**. I concretament: que **crear el perfil i entrar al tauler** millorin
d'arquitectura de la informació, i que ensenyin **les missions que fas o que
vols assignar**.

Va **junt** amb l'entrada «La UX del SOS com un Kanban sencer» (25/09/2026):
allà hi ha el què fa el Kanban, aquí el què s'ensenya i quan.

**El diagnòstic, amb els números d'avui:** `check-kiss.js` compta **36 accions
al llançador** (sostre 36, o sigui al límit), **106 modals**, 7 grups i 22.298
línies. No és que falti contingut: és que **hi surt tot alhora i des del primer
dia**, i qui entra per primera vegada no sap quina de les 36 és la seva.

**El principi, escrit perquè es pugui comprovar:** *una pantalla ensenya el que
es pot fer ara amb el que ja hi ha.* Una acció que necessita un mapa que encara
no existeix no s'ensenya apagada amb un rètol: **no s'ensenya**, i apareix el
dia que el mapa hi és. Això es pot vigilar amb una guarda —cada acció del
llançador declara de què depèn— i llavors el sostre de 36 deixa de ser un
problema, perquè ningú en veu 36.

**Els tres moments, per ordre:**

1. **Crear el perfil.** Avui demana abans de donar. Hauria de sortir-ne amb
   **una cosa feta** —el cromo, que ja es pot crear amb foto— i amb **una sola
   següent acció**, no amb un tauler de 36.
2. **Entrar al tauler.** La primera pantalla ha de respondre tres preguntes en
   aquest ordre: *què he de fer jo ara*, *què espera algú de mi*, *què passa al
   node*. Avui respon la tercera primer.
3. **Les missions.** Les que fas i les que vols assignar són la mateixa llista
   vista des dels dos costats, i és exactament el pont rol→persona que ja és
   al punt 1 de l'entrada del Kanban. **Fer aquell punt és fer aquest.**

**El que NO s'ha de fer, i és temptador:** amagar coses darrere d'un menú
«avançat». Això no és progressiu, és un calaix —el contingut segueix sent-hi,
només que ara ningú el troba mai. La diferència és que **el que s'amaga ha de
poder aparèixer sol** quan es compleix la condició que el fa útil.

**FET (28/09/2026), i el que en queda.**

La portada del SOS és el **teu Kanban**. `HOME_VIEWS` passa a
`['missions','tauler','mapa','fons','gent']` —cinc, el sostre no s'ha tocat— i
la primera mana. El tauler del node es queda com a portada, ara enllaçable a
`#/tauler`, i els enllaços antics de `#/missions` segueixen obrint el mateix.

**El perfil surt dels modals.** Una línia a la capçalera del Kanban: cromo,
nom, graó i hores, que obre el perfil. Una línia i no una fitxa: el que ha
d'omplir aquesta pantalla són les tasques.

**El 80/20 es calcula.** `ACCIONS` puja fora de `openLauncher()` —la portada
l'ha de llegir igual que el menú, i tenir-ne dues seria tenir-ne dues que
divergeixen— i cada acció declara `quan(c)` i `pes`. `contextAccions()`
**no inventa cap predicat**: ajunta els que ja hi havia escampats
(`communityStatus`, `CAPABILITIES[].used`, `nodePulse`, `hasProfile`).

I **una acció principal i prou**: la primera versió en posava cinc, i cinc
botons del mateix pes són una barra d'eines —que torna a deixar la tria a qui
acaba d'entrar, que és el problema que això venia a resoldre. A la pantalla es
va veure de seguida: l'acció secundària «El meu dossier» deia el mateix que la
primera targeta del tauler. **Una acció i el menú.**

Amb l'estat buit la primera és fer-se el perfil; amb perfil i node, publicar;
amb el node rodat, una altra. Mesurat: **8 accions de 36 amb l'estat buit, 35
amb un node rodat**. A 390 px, la primera targeta de feina acaba a 748 px del
plec de 844: **es veu una tasca sencera sense fer scroll**, que és el que abans
no passava.

**Dues portes tancades de més, i les va caçar una prova que ja hi era.**
`test-home.mjs` comprova que el que es treu del tauler segueixi al llançador, i
va fallar: havia posat «Què hi ha a prop» darrere de tenir perfil —quan mirar
què hi ha és justament el que has de poder fer **abans** de donar el teu nom— i
el «Registre públic» darrere del teu registre, quan és públic i de tothom. Les
dues obertes.

**El bloc d'adopció del tauler se'n va.** Era «què podries fer servir i encara
no fas»: deu targetes de deures plegades dins d'un `details`. És el que ara diu
la portada, amb la diferència que importa: allà en surt **una**, i surt perquè
ara serveix.

**Les guardes.** `check-accions.js`, cinc regles, les tres primeres provades
trencant-les: cap acció sense `quan`/`pes`; cap pes fora de `PES_ORDRE`; ni
totes serveixen sempre ni cap; la clau per veure les 36 a la mateixa pantalla;
i la portada no pot demanar-ne més de quatre. `check-tasques.js` regla 4
**s'estreny**: abans valia que la safata fos a `HOME_VIEWS`, ara ha de ser la
primera.

**El que queda, i és l'entrada del Kanban (punt 1):** les missions que assignes
a algú altre. El pont rol→persona segueix sense encadenar-se, i fins que no ho
estigui, «les que vols assignar» no es poden ensenyar.

**El que NO s'ha fet i s'ha de mirar:** el pes és a **534 KB de 540** (99 %).
La propera tanda que toqui `index.html` haurà de mesurar abans d'escriure.

---

**El primer tall, si es vol una passa barata:** ~~que el llançador ordeni i
agrupi per estat del node~~ — fet, i millor: el llançador **filtra**.

---

### Veure l'organització com un cos · fet (01/10/2026), i cap on va

**Demanat per l'Àlvar:** que el client pugui veure **una animació d'un mapa de
valor com un sistema viu** —com un metge veu si la sang flueix pels òrgans—, i
una sèrie de **mapes castellers** (pinya, pilar, torre, 3, 4, 5) per agrupar
els rols d'un mapa **per línies de força**, les rengles. Ve d'un joc casteller
que ja va fer: posant el grup sobre un mapa de pinya i acolorint per una
variable (16PF, estil de personalitat), la distribució es veia d'un cop.

**El pols del mapa (`build-mapavalor.js`).** El mapa del celler que ja hi havia
**circula**: cada lliurament té un pols que recorre el seu camí. I té un segon
botó, que és el que converteix el dibuix en una eina: **aturar-li un node**. El
node és «Qui rep i explica» perquè és la troballa 3 d'aquell mateix cas —avui
no és el rol de ningú— i aturar-lo para **8 dels 16 lliuraments** i deixa
l'operador i el poble amb la meitat del que els arriba.

**Les xifres les compta el generador.** Escrites a mà, el dia que s'afegís un
lliurament el dibuix diria una cosa i la frase una altra, i la que es creuria
el client seria la frase. Hi ha una asserció que les creua.

**Les rengles (`build-castells.js`).** Cinc construccions d'1 a 5 rengles, amb
la pinya dibuixada sencera (de 9 a 48 persones), i cadascuna diu **què vol dir
aquella forma en una casa** —cap figura hi entra sense aquesta frase, o seria
decoració castellera. I un cas treballat: 12 rols en 4 àmbits, amb una rengla
de 5 i una d'1, on els pisos que falten es dibuixen buits. La desigualtat es
veu abans de llegir res.

**⚠ CORREGIT EL MATEIX DIA.** La primera versió deia «rengla» a les columnes
del tronc. **És fals, i l'error era de dimensió, no de nom.** Una rengla és a
la **pinya**: és la filera de gent que es posa **darrere de cada baix**, cap
enfora. No es veu mirant un castell de front — es veu mirant la pinya **des de
dalt**. Dir-li vertical es carregava justament el que fa que això valgui per a
una organització.

**L'anatomia, ara amb font (01/10/2026).** La primera versió també tenia la
composició mal repartida. El glossari de termes castellers i la descripció
d'estructures diuen això, i **l'Àlvar ho havia dit abans de buscar-ho**:
*«el vent va entre dues rengles i agafa una mà de cadascun dels segons»*.

**Rengla** és el nom genèric de cada filera radial. N'hi ha de tres menes:

| | quantes | on va i què agafa |
|---|---|---|
| **Primeres mans** | N | darrere el contrafort; subjecten el segon per darrere |
| **Laterals** | **2N** | darrere les crosses; subjecten les cuixes dels segons pels costats |
| **Vents** | **N** | entre crossa i crossa: **una mà a cada pilar** |

**I el vent canvia la lectura sencera.** La primera versió el tractava de
farciment —«omple i estabilitza, no és per carregar-hi»— i **és al revés del
que importa**: és l'únic que agafa dues columnes alhora, i per tant l'únic que
impedeix que se separin. Traduït: la primera mà sosté una àrea per darrere, el
lateral la reforça pel costat, i **el vent és l'única persona que toca dues
àrees a la vegada**.

D'aquí surt el diagnòstic que abans no existia: **una planta amb els vents
buits és una casa amb àrees que no es toquen** —silos, dit sense dir-ho—, i es
veu de cop mirant-la des de dalt. Al cas dels àmbits es dibuixa exactament
això: quatre primeres mans amb gent i els quatre vents buits.

**D'aquí surt la regla que ho ordena tot: una pinya de N baixos obre 4N
direccions.** Un 2 n'obre 8, un 3 dotze, **un 4 setze** i un 5 vint. Que un 4
n'obri setze **no és una casualitat bonica**: és el que fa que un instrument de
setze factors càpiga exactament en una planta de castell de quatre, un factor
per direcció. Hi ha una guarda que ho comprova, perquè és la tesi.

*Els noms canvien de colla a colla —el que aquí es diu «vent» en algun lloc és
«mà» o «crossa de rengla»—; el que no canvia és l'estructura, i la
visualització fa servir l'estructura. Una correcció de noms no la trenca.*

**Les dues dimensions, que és el que es demanava.** *Horitzontal · la planta*:
quantes direccions té obertes la casa i quanta fondària té cadascuna — és on es
posa la variable. *Vertical · l'alçat*: quants pisos s'intenta aguantar, que és
l'ambició i la part que tothom mira. **Van juntes i no en dues pantalles**: la
planta no sap d'alçada i l'alçat no sap de direccions.

**I la llei que les lliga, que és el que es ven:** en castells no es guanya
alçada sense guanyar base —un 4 de 8 demana folre; un de 9, folre i manilles—,
i **la pinya creix més de pressa que el tronc**. En una casa és igual: cada pis
d'ambició demana **més direccions obertes**, no més gent a la mateixa direcció.

**La lectura que només existeix creuant les dues:** una direcció amb molt gruix
**sobre un vent** és un risc —molta força per una línia que no és per
carregar-hi—. Amb la planta sola no es veu, perquè la fondària es llegeix igual
a tot arreu; amb l'alçat sol tampoc, perquè no sap de direccions.

**I la variable ja hi és.** Tres declarades: els àmbits de la casa (4 sobre un
4), les deu aportacions del SOS (sobre un 3, i **les dues direccions que queden
buides són la lectura**) i un instrument de setze factors sobre la planta de
setze. Era el punt 1 del que quedava pendent fa una hora.

**Una guarda nova que val per tota la portada.** `check-landing.js` comprova
ara que **cap `var(--…)` apunti a una variable que no existeix**: el navegador
descarta la regla sense avisar i allò no es pinta. Es va trobar mirant una
captura —la vora del node aturat no sortia— i de seguida va caçar-ne **quatre
més que ja hi eren**: `--border-strong`, `--bg`, `--bg-card` i `--text`, dues
de les quals les havia posat jo a la paret de clients.

**La pàgina del mètode (`SOS/vna.html`), al dia (01/10/2026).** I un defecte
meu: el dibuix del celler el genera el mateix fitxer per a dues pàgines i
l'estil que el fa circular és **de cada pàgina**. Quan els polsos hi van
entrar, `vna.html` va rebre el marcatge i no l'estil —**setze camins
invisibles que no feien res**, i uns botons que apuntaven al dibuix de l'altra
pàgina. No petava i no es veia: la pàgina es llegia exactament igual que abans.

Arreglat, i amb **guarda al generador**: tota pàgina amb `class="mv-p"` ha de
portar l'animació, l'estat `encallat`, els botons i el codi que els escolta.
Provada traient l'animació a posta. Els botons ja no tenen identificador propi
sinó `data-svg`, perquè n'hi ha a dues pàgines.

La pàgina té ara la **planta d'un quatre amb l'anatomia explicada** —les tres
menes amb el seu compte— i la regla 4N, que és el que li toca: la portada ven i
aquesta ensenya. Generat de la mateixa declaració, que és tot el motiu de
generar-ho.

**Punt 2 del que quedava, fet (01/10/2026): la planta surt del mapa.**

Hi havia dos dibuixos i no dues vistes, i és el defecte més car d'aquesta
entrada perquè **no petava i no es veia**: `build-mapavalor.js` dibuixava el
celler i `build-castells.js` dibuixava plantes de **casos declarats a mà** que
no tenien res a veure amb aquell celler. Dues il·lustracions maquíssimes del
mateix discurs, i qui ho hauria trobat és un client en una visita preguntant «i
això d'on surt?».

`build-castells.js` importa ara `CELLER` de `build-mapavalor.js` i `pinyaDeMapa()`
el tradueix a planta. La regla:

| | |
|---|---|
| **Els baixos** | són els nodes. Set nodes, **4×7 = 28 rengles** |
| **Un vent** | un parell que va i torna **en menes diferents** —tangible cap a un costat, intangible cap a l'altre—. És literalment una mà a cada pilar, i cada mà aguantant una cosa diferent |
| **Una primera mà** | la resta de lliuraments tangibles: el suport directe d'una àrea, el que es factura |
| **Un lateral** | la resta d'intangibles: reforcen pel costat i no surten a cap factura |

I llavors es compara amb el que la pinya **té** —cada pilar obre una primera mà,
un vent i dos laterals—, i el que surt és la lectura. **Les xifres no s'escriuen
enlloc.** El que va sortir, i que no s'havia escrit a cap guió:

- **«Qui rep i explica» té 3 vents sobre una sola posició de vent.** Lliga tres
  àrees i la pinya li dona lloc per a una. És la troballa 3 d'aquell mateix cas
  —avui no és el rol de ningú— **trobada per un altre camí**, el de la geometria.
- **«El distribuïdor» i «El poble» no tenen cap vent.** Donen i reben sempre en
  la mateixa moneda, i per tant no hi ha cap posició que els lligui a una altra
  àrea. Silos, dit amb el dibuix. La troballa 1 del cas, altra vegada per un
  altre camí.
- **2 laterals ocupats de 14.** Gairebé no arriba reforç que no es facturi, que
  és el que diu el graf quan es compten els intangibles.

Que la derivació **reprodueixi sola les troballes escrites a mà** és la prova
que les dues vistes són una. No es va buscar: va sortir de comptar.

**A la portada, una secció i dues pestanyes.** `#mapaval` i `#rengles` eren dues
seccions i tenir-les separades era el que les feia semblar dos dibuixos sense
relació. Ara `#dues-vistes` les porta totes dues sobre el mateix cas, `#rengles`
es queda com la part didàctica (les cinc construccions i les variables) i
`#rols` és el vocabulari nou. Els botons del pols manen **sobre tots dos
dibuixos**: `data-svg` pot nomenar més d'un.

**Les guardes que ho sostenen** (tres a `build-castells.js`, una a
`check-landing.js`, i una prova):

1. **Tot lliurament cau a una rengla i a una sola.** Si la traducció en perd un,
   el castell dibuixa una casa més simple del que és i es veu bonic igualment.
2. **`rengles()` i `direccions()` han de descriure la mateixa pinya.** Dues
   maneres de recórrer-la —per pilar i per angle— i el dia que una divergís
   hi hauria dues anatomies amb el mateix nom.
3. **La planta ha de marcar amb `data-para` el que s'atura.** Provada **traient
   el CSS a posta**: amb la regla fora, el graf es buida i la planta es queda
   sencera, i la prova ho caça. Sense ella, la segona vista seria decoració.
4. **`check-landing.js`**: els botons del pols han de nomenar els dos dibuixos.
   Provada canviant `data-svg` a un sol id.
5. **`test-dues-vistes.mjs`**: treure un parell de `CELLER` en memòria ha de
   moure les dues vistes. És la prova negativa que obliga que la font sigui una.

**I el vocabulari de rols arquetípics (`POSICIONS`), que era el producte que no
es podia comprar.** Qui ha fet el taller surt sabent dir «el meu dos» i «el meu
terç lateral» de casa seva, i aquest vocabulari **no existia escrit en cap
pantalla**: vivia a la memòria de qui hi havia estat, i al codi estava escampat
—tres noms a `MENES`, tres més escrits a mà dins del dibuix de la colla, i la
resta a cap lloc.

Onze posicions, agrupades per on són (pinya, tronc, pom, fora), i cadascuna diu
quatre coses. **La que importa és la segona: què és això en una casa.** Una
guarda peta si una posició només diu què fa en un castell, perquè això és
folklore i no es pot portar a una organització. Vuit d'elles porten `fn` i
ocupen les vuit funcions que l'app ja fa servir a `ARCHETYPE_SETS`, que és el
pont per a un joc d'arquetips castellers al SOS (encara no fet). I totes porten
`aport`, una de les deu aportacions que `encaix()` ja demana.

*La prova que no és automàtica: llegir la llista sense saber de castells i poder
dir «això és en Joan». Si la traducció no hi arriba, el vocabulari no serveix.*

**I la portada té ara una sola jerarquia.** El hero deia «Dels castells al flux
de valor» i les tres caselles d'evolució posaven TeamTowers el 2005: llegit de
dalt a baix, el que es comprava era **una trajectòria**. Ara el hero nomena
l'ofici —anàlisi, disseny i desenvolupament de sistemes pels quals flueix el
valor—, les tres caselles van etiquetades com el que són (*la prova que
funciona*), i `#fentpinya` baixa al pis de la història, just abans de «D'on ve
això». No és una degradació: obrint, els castells es llegien com la marca i el
producte no sortia fins a la quarta pantalla.

**El que queda, i és el que l'Àlvar vol de debò:**

1. **Acolorir per una variable.** Avui el color d'una rengla diu de quin àmbit
   és. El que ell descriu del joc casteller és **pintar la mateixa figura per
   una altra cosa** —16PF, estil, aportació— i veure la distribució. Al SOS ja
   hi ha el vocabulari: `APORTS`, deu aportacions declarades. La peça que falta
   no és el dibuix, és **el selector de variable**.
2. **Que surti del mapa de l'usuari, no del cas de la portada.** ~~Que surti del
   mapa de debò i no d'un cas escrit~~ — fet per al cas del celler (a dalt). El
   que queda és **dins del SOS**: que `renderVNA` ensenyi els rols del node en
   rengles amb `pinyaDeMapa()`, que ja hi és i ja està provat. El pont
   rol→persona (fet) és el que fa que una rengla sàpiga quanta gent té.
3. **Encallar un node del teu mapa, no només del cas.** El pols i l'aturada
   estan al generador de la portada. Al SOS, `vnaAudit` ja calcula salut i
   reciprocitat: el que falta és ensenyar-ho com un cos i no com una llista.

**El que NO s'ha de fer:** prometre una mesura. Un castell **no diu si una casa
va bé** —diu on es concentra el pes, que és una altra cosa i és la que serveix
per decidir. Està escrit a la pantalla i hi ha una asserció que ho vigila.

---

### Idees a explorar (paraking lot)
- **Federated onboarding**: quan aparelles amb un altre dispositiu, importa el seu roster de superherois com a suggerència.
- **Comando digest setmanal** — email o notificació al Guardian amb la setmana del node.
- **Multi-idioma**: primer ES i EN sobre les entrades UI, després tot.
- **Export PDF del kit narratiu** per lliurar a comunitats.
- **Widget embeded** per posar la pinya del fons cooperatiu a webs municipals.
