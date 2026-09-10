# Pla de millora del SOS · `sos.teamtowershuma.com`

> **Mesurat el 10 de setembre de 2026** sobre `SOS/index.html` (V78 · 20.788
> línies · 495 KB gzip, 97 % del sostre · 102 modals · 748 funcions · 77 proves),
> **executant l'app amb un navegador buit**, no llegint-la. El lloc en viu no és
> accessible des de l'entorn on s'ha fet això, però l'app és exactament aquest
> fitxer: `/sos` hi redirigeix.
>
> Les revisions anteriors —`review-ux-flux-de-valor.md`, `quatre-preguntes.md`,
> `backlog-beta-i-escala.md`— van tancar el que deien. Aquest pla no les repeteix:
> mira el que cap d'elles mirava, que és **què li passa a algú que hi arriba per
> primera vegada, des d'un telèfon, en un poble**.

---

## 0 · El diagnòstic en tres frases

1. **Per dins és sòlid i per fora és dur d'entrar.** El registre, la fusió sense
   pèrdua, les guardes i les 77 proves són feina de veritat. Però qui hi arriba
   nou ha de passar **sis diapositives** i **una portada que repeteix la de la
   web** abans de trobar el primer botó que fa alguna cosa — i aquell botó queda
   **sota el plec** en escriptori i en mòbil.
2. **Promet «sense servidor, tot al teu navegador» i té una dependència externa
   que la pot bloquejar 13 segons**, i **no s'obre sense xarxa**. Les dues coses
   es noten exactament on més importa: un telèfon vell amb mala cobertura.
3. **El que calcula ho calcula bé. El que falta és el que passa entre dues
   persones** —els estats entre «m'interessa» i «apuntat», que ja estan
   analitzats al backlog— i **saber si tot això li serveix a algú**: el playtest
   amb cinc persones reals és a la llista de proves qualitatives des de fa mesos
   i no s'ha fet mai.

---

## 1 · Les mesures

Tot el que segueix s'ha comprovat executant l'app, i es pot tornar a comprovar.

| Què | Com | Resultat |
|---|---|---|
| Arrencada amb la font de Google **inaccessible** | Playwright, `file://`, sense xarxa cap a `fonts.googleapis.com` | **13,2 – 15,2 s** fins a `load` |
| Arrencada amb la font **bloquejada** (abortada) | Igual, `route.abort()` | **162 – 197 ms** |
| Primer contacte | Navegador buit | Tour de **6 diapositives** → portada amb hero, 3 dolors i 3 targetes → **després** les tres portes |
| Primer botó útil, escriptori 1440×900 | Posició vertical de «Sóc una persona» | **y = 951 px** (plec a 900) |
| Primer botó útil, mòbil 390×844 | Igual | **y = 1.223 px** (plec a 844) |
| Alçada de la pàgina buida | `scrollHeight` | 1.415 px escriptori · 2.193 px mòbil |
| Botons o enllaços a la pàgina buida | visibles | **9**, tots per sota del plec |
| Service worker · manifest | `grep` | **cap** |
| Pes | `check-kiss.js` | 495 KB gzip · **97 % del sostre** (510) |
| Llançador | `check-kiss.js` | **36 accions de 36** (al sostre) |
| Pestanyes | `check-kiss.js` | 15, totes amb guia contextual |
| Accessibilitat, mirada ràpida | `grep` | `outline:none` × 6 · `aria-label` × 9 en 102 modals · 0 `<img>` sense `alt` · `prefers-reduced-motion` × 1 |
| Errors de pàgina | `pageerror` | **cap**, en escriptori ni en mòbil |
| Desbordament horitzontal a 390 px | `scrollWidth` | **cap** |
| Idioma del cos de l'app | `<html lang>` + text incrustat | català; la capa de segona llengua existeix (V69) i **el cos no està traduït** (R12 del backlog de beta: «no existeix») |

---

## 2 · El pla, per ordre

`P0` es fa aquesta setmana i no depèn de res · `P1` és el que fa que la gent es
quedi · `P2` és sostenir el que ja hi ha · `P3` arribar més lluny.

El cost és relatiu i en dies de feina, no un calendari. Cada punt diu **com es
comprova**, perquè aquesta casa no dona per fet res que no tingui guarda.

### P0 · Aquesta setmana, i cap depèn de l'altre

#### 1 · La font deixa de bloquejar l'arrencada

**Evidència.** `SOS/index.html:11` carrega la font amb un `<link rel="stylesheet">`
normal. `display=swap` només actua **un cop el CSS ha arribat**; el CSS mateix
bloqueja el render. Amb la font inaccessible: 13 segons. Sense: 0,2. Una app que
diu «tot viu al teu navegador» té **un sol punt de fallada extern, i és a la
primera línia**.

**Què fer.** Carregar-la sense bloquejar (`media="print" onload="this.media='all'"`
o `rel="preload"` + fallback) i declarar una pila de sistema de veritat a
`--sans` i `--mono`. Millor encara: **allotjar les dues fonts al repositori**,
que és el que faria coherent el «sense servidor». Mateix tractament a
`index.html` de l'arrel i a les pàgines del SOS que la carreguen.

**Cost.** Mig dia. **Com es comprova.** Una prova que arrenca l'app amb
`fonts.googleapis.com` bloquejat i exigeix `load` en menys d'un segon. Sense
aquesta prova, el proper que toqui la capçalera ho tornarà a trencar sense
saber-ho.

#### 2 · S'instal·la i s'obre sense xarxa

**Evidència.** Cap service worker, cap manifest. L'app funciona en local i **no
s'obre si no hi ha cobertura**, que és el cas d'ús que la seva pròpia
documentació posa al centre: «qui apunta poc, apunta tard i des d'un telèfon
vell» (`backlog-beta-i-escala.md` §0.bis).

**Què fer.** Un `manifest.json` (nom, icona, color, `start_url: /SOS/`) i un
service worker mínim que guardi `index.html` i les fonts en caché i serveixi
primer la caché. Amb un sol fitxer autocontingut és **el cas més fàcil que
existeix** per a un service worker: no hi ha res més a cachejar. Cal decidir la
política d'actualització (la versió va a `SOS_VERSION`: quan canvia, es refresca
la caché), i que **mai no cachegi el que ve dels orígens** (`fetchFromOrigins`),
que ja té la seva pròpia política.

**Cost.** Un dia. **Com es comprova.** Una prova que carrega l'app, talla la
xarxa (`context.setOffline(true)`) i la torna a obrir.

#### 3 · El primer botó útil, per sobre del plec

**Evidència.** Un usuari nou veu, en aquest ordre: sis diapositives de tour, un
hero («Converteix la voluntat veïnal…»), tres dolors, tres targetes de producte
(Fent Pinya, Mapa VNA, SOS) — i **llavors** les tres portes: *Sóc una persona ·
Tinc un projecte · Vull explorar*. A 951 px en escriptori i a 1.223 en mòbil.
Tot el que hi ha abans **ja ho ha llegit a la portada** que l'ha portat aquí.

El tour, a més, està **ben pensat** —el seu propi comentari explica l'ordre:
dolor, sistema, qui ets, acció— i per això és una llàstima: sis diapositives
abans de tocar res és el que fa que se'l salti tothom, i «Salta la introducció»
és el botó que més es clica.

**Què fer.**
- **Les tres portes, primer.** Sota una sola frase. El hero, els dolors i les
  targetes de producte baixen a sota de les portes o se'n van: la portada de la
  web ja fa aquesta feina i ho fa millor.
- **El tour passa de sis a tres**, i s'ofereix **després** de la primera acció,
  no abans. Qui acaba de crear el seu perfil és qui té ganes de saber què més hi
  ha; qui acaba d'arribar, no.
- **A mòbil, les tres portes en columna i a la primera pantalla**, que és on avui
  cal fer una pantalla i mitja de scroll per trobar-les.

**Cost.** Un o dos dies. **Com es comprova.** `test-home.mjs` (ja existeix)
afegeix: en un navegador buit, a 390 i a 1440, hi ha una porta amb `top < 700`.
Ho defensarà el dia que algú hi torni a posar una targeta a sobre.

### P1 · El que fa que la gent es quedi

#### 4 · Els estats entre dues persones

**Evidència.** Analitzat i decidit al backlog (*«Els fluxos de comunicació entre
persones»*, 9 de setembre): el SOS registra fets consumats i els confirma, però
**no té cap estat per a un fet que s'està acordant**. Des d'una tasca, «m'hi
poso» obre la pantalla d'apuntar una cosa que encara no ha passat.

**Què fer.** El que ja està escrit, en aquest ordre: (1) «m'hi poso» obre
l'estat d'*interès* i no el registre —**un dia, aïllat, i és el que es va
notar**—; (2) l'*acord* com a objecte, amb fil penjat del context i visible
només per a les dues parts; (3) *fet i encara no apuntat*. Les dues decisions
—fil penjat del context, acord no públic— ja estan preses.

**Cost.** 1 + 4 + 2 dies. **Com es comprova.** `test-tasques.mjs`: «m'hi poso»
no crea cap apunt al ledger.

#### 5 · Les tasques com a pantalla principal

**Evidència.** Decidit al mateix backlog: `lesMevesTasques` ha de ser la pantalla
per defecte, amb el planning a la vista. Les tasques ja porten columna
(`tascaCol`) i flux del mapa (`fluxDeTasca`); l'eix del temps ja existeix als
sprints (`sprintsOf`) i la pantalla no el llegeix.

**Què fer.** Que la vista per defecte d'una persona amb perfil sigui
`missions` i no `tauler`; que llegeixi `sprintsOf` per pintar l'eix del temps; i
que cada tasca porti **el seu següent pas de debò** (obrir el fil, reservar,
apuntar), que és el punt 4.

**Cost.** Tres dies. **Com es comprova.** La prova d'arrencada amb persona
activa acaba a `missions`.

#### 6 · El playtest amb cinc persones — que no és codi i és el més important

**Evidència.** A `backlog.md` → *«Qualitative tests de l'app»*, primera línia:
«Playtest guiat: 5 persones fan onboarding + perfil + primer intercanvi +
primera aportació signada; recollir friccions.» **No s'ha fet mai.** I ja hi ha
el que el converteix en informació: el botó «això s'ha trencat» (V67) recull
versió, node i què feia la persona.

**Què fer.** Cinc persones que no coneguin el projecte, un telèfon cadascuna,
mitja hora, sense ajudar-les. Es mesura només tres coses: **temps fins al primer
apunt**, **on s'encallen** i **si tornen a obrir-la la setmana següent**. Els
punts 1, 2 i 3 d'aquest pla es fan **abans**, perquè si no el playtest mesurarà
la font de Google i el tour, que ja sabem.

**Cost.** Un dia de preparació, una tarda de sessions, un dia d'escriure-ho al
coneixement. **Com es comprova.** Que el resultat entri a `knowledge/` amb la
mateixa forma que aquest document: mesurat, no recordat.

### P2 · Sostenir el que ja hi ha

#### 7 · Accessibilitat: de «cap error» a WCAG AA

**Evidència.** Cap `<img>` sense `alt`, cap error de pàgina, cap desbordament —
la base és bona. Però 6 `outline:none`, **9 `aria-label` per a 102 modals**, un
sol `prefers-reduced-motion`, i cap prova de teclat. Una persona que navegui amb
teclat o amb lector no ha estat mai a l'altra banda d'aquesta app, i la llista
de proves qualitatives ho diu: «Test WCAG 2.1 AA — pendent».

**Què fer.** Tres coses barates i una de cara. Barates: (a) cap `outline:none`
sense `:focus-visible` equivalent; (b) tot modal amb `role="dialog"`,
`aria-modal`, títol referenciat i **focus atrapat** —una sola funció `modal()`
ho fa per als 102—; (c) `Escape` tanca i el focus torna a on era. Cara: una
passada de contrast sobre la paleta (`--muted: #82828d` sobre `#050507` està a
la vora).

**Cost.** Dos dies les barates; la de contrast, mig més. **Com es comprova.**
Una prova que obre cada ruta de `MODAL_ROUTES`, prem `Tab` deu vegades i
exigeix que el focus **no surti del modal**; i que `Escape` el tanqui.

#### 8 · La segona llengua del cos de l'app

**Evidència.** La capa existeix des de V69 (`I18N`, `t()`, `langCoverage`). El
cos **no està traduït**, i el backlog de beta ho deia amb el nom exacte del rol
que falta: *R12 · qui sosté la segona llengua · no existeix*. I diu també el que
la fa diferent de tota la resta: **és l'única entrada el cost de la qual creix
cada setmana**. A 14.430 línies ja era car; ara en són 20.788.

**Què fer.** Decidir-ho, més que fer-ho: o (a) es tradueix ara el que veu una
persona nova (portes, tour, perfil, apuntar, confirmar — unes 300 cadenes) i
`langCoverage` passa a ser guarda al CI amb un mínim que només pot pujar; o (b)
es decideix que l'app és en català i s'atura la capa. **El que no pot seguir és
el mig**: una capa que existeix i no s'omple és el pitjor dels dos mons.

**Cost.** (a) cinc dies i un guardià de llengua; (b) zero. **Com es comprova.**
`langCoverage` al CI amb sostre mínim.

#### 9 · Els sostres, abans que petin

**Evidència.** 495 de 510 KB (97 %) i **36 accions de 36 al llançador**. Els dos
sostres van fer la seva feina —forçar la mesura— i ara diuen una altra cosa: el
proper canvi útil ja no hi cap.

**Què fer.** No pujar-los a cegues. La sortida ja existeix i ja s'ha fet servir:
**les pàgines**. La Compra, l'Energia, l'Habitatge, el Banc de Temps i la
Biblioteca viuen fora de l'app i l'app hi porta. Dels 102 modals, els que
s'obren poques vegades i no toquen el registre —diagnòstic de país, wizard de
model, dossier, cromos, incidències— poden passar a ser pàgines amb el mateix
patró. El llançador, a més, pot agrupar en comptes d'enumerar.

**Cost.** Un dia per decidir la llista mesurant `openX` per freqüència d'ús als
tests, i després mig dia per peça. **Com es comprova.** `check-kiss.js` torna a
tenir marge, i el registre segueix sencer dins de l'app.

#### 10 · Missions de xarxa

**Evidència.** L'únic punt de `review-ux-flux-de-valor.md` que va quedar obert
(§5.5): «tres comarques sense cap dinàmica» no ho veu ningú, i per tant no ho fa
ningú. `countryCoverage` ja calcula la dada.

**Què fer.** Convertir els forats de cobertura en missions al costat de les
personals, amb el mateix format (`MISSION_KINDS`). **Cost.** Un dia.
**Com es comprova.** Un país amb una comarca buida genera una missió que la
nomena.

### P3 · Arribar més lluny

- **`canal/index.json` generat i no mantingut a mà**, com ja es va fer amb
  `supply/`. Els paquets són xifrats per node i cal la clau de cadascun: és un
  generador més gros, no una còpia del que hi ha.
- **`daoSpend` connectat al cost real dels orígens.** Avui sap dir que no i
  ningú el crida des del camí de publicació.
- **`knowledge/references/` té dos fitxers** i el temari en cita sis autors.
  La docència anomena Ostrom, Boal, Mondragón i Penrose i no s'hi pot anar.
- **El mapa de valor privat d'una organització** (backlog P0 b). Segueix sent la
  peça que lliga el SOS amb el que TeamTowers ven a una empresa, i segueix
  sense pantalla.

---

## 3 · El que ja està bé i no s'ha de tocar

Es diu perquè el pla no es llegeixi com una llista de retrets.

- **El registre**: triple entrada, cadena per autor, fusió per unió. És la part
  difícil i està feta i provada (`test-fusio.mjs`).
- **Cap error de pàgina, cap desbordament, cap imatge sense `alt`.** La base
  d'accessibilitat és millor que la de la majoria.
- **Les guardes.** 24 `check-*.js` i 11 generadors amb `--check` al CI. Que
  aquest pla pugui dir «com es comprova» a cada punt és perquè la casa ja
  funciona així.
- **La guia contextual per rol** (`CONTEXT_GUIDES`, V66): cada pestanya diu
  quin és el següent pas, i el comprova contra el node en comptes de clicar-se.
- **El tour, com a text.** L'ordre és bo. El que falla és quan surt i quant
  dura, no què diu.
- **Les pàgines de fora de l'app** com a manera de créixer sense pujar el sostre.
  És el patró que el punt 9 demana repetir.

---

## 4 · Per on començar demà

**Els punts 1, 2 i 3, en aquest ordre, i tots tres abans del playtest.** Són
barats —tres dies entre tots—, no depenen de cap decisió pendent, i són
exactament el que un playtest mesuraria si no s'arreglen primer: la font, la
xarxa i les sis diapositives. Fer el playtest abans seria pagar cinc tardes per
saber el que ja diu aquesta taula.

Després, **el 6** —perquè és l'única cosa de la llista que fa que la setmana
següent sapiguem alguna cosa que avui no sabem—, i **el 4** en paral·lel, perquè
el seu primer pas és d'un dia i és el que es va notar fent servir l'app.

I una que no és feina de codi, igual que al backlog de beta: **decidir el punt
8**. Una capa de llengua mig feta és l'únic deute d'aquesta llista que puja sol.
