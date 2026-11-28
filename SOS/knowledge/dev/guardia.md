---
tipo: proceso
de: casa
rol: [sistemas, operaciones]
fase: sostiene
visible: pública
estado: vigente
etiquetas: [guardia, ia]
---
# El guardià · el saldo del pla que no es perd

Aprovat per l'Álvaro el 13/11/2026: quan al seu pla de Claude li sobra saldo,
una tasca programada el fa servir per polir el sistema en comptes de deixar-lo
perdre. Cada nit treballa **la cola que li toca pel dia** (taula de sota) i,
dins d'aquella cola, la primera peça sense marcar. Això mana per sobre de
«la primera peça de la cola» que pugui dir la tasca programada.

## Quan treballa

- Dilluns a divendres a les 22:41 i dissabte i diumenge a les 8:41 (hora de
  Madrid). Mai en horari de projecte de l'Álvaro (dl–dv de 8 a 17 h).
- Si la sessió pot veure el consum del pla (`/usage`, o els `rate_limits` de la
  línia d'estat): **no fa res** si la setmana va per sobre del ritme (el % gastat
  és més alt que el % de setmana que ha passat) o si ja passa del 85 %.
  Si no ho pot veure, treballa igualment: l'horari ja és la protecció.
- **Una peça per execució, un PR com a màxim.** Si topa amb el límit, para i no
  deixa res a mitges al main.

## Quina cola li toca cada nit (des del 20/11/2026)

L'Álvaro (20/11/2026): aprofitar les nits per fer un cervell de VNA més potent,
perquè el client treballi menys, i que totes les àrees tinguin el seu torn.
El dia de la setmana (hora de Madrid) tria la cola. Si la seva cola no té res
que es pugui fer, agafa la peça següent de la cola A–C.

| Nit | Cola | Model |
|---|---|---|
| dilluns, dimecres, divendres | **D · Oficis VNA**: un lot de 10 classes de `pendents` | Sonnet |
| dimarts | **A–C** (la de sempre) | el de la tasca |
| dijous i diumenge | **E · L'àrea de torn** del cervell | Sonnet |
| dissabte | **D · La jutgessa**: nota a cegues dels oficis de la setmana | Opus |

Els oficis els escriu la mateixa sessió amb el saldo del pla: no cal la clau de
l'API ni cap crèdit. Cada ofici passa per `salutOfici` (sota 70 es descarta) i
entra a `base/oficis-generats.json` com a **esborrany**: una persona el revisa
abans que el vegi un client.

## Què no fa mai

- Mergear, tocar producció o Netlify, escriure fora (correus, Zoho, la web
  d'EP), posar preus públics, o decidir per l'Álvaro (si una peça demana una
  tria seva, la salta i ho deixa escrit aquí sota «Esperen l'Álvaro»).
- Tocar un fitxer que ja té un PR obert d'algú altre: salta la peça.
- `cliente/` i `SOS/index.html` (l'app) mentre els seus fils hi treballin.
- Saltar o desactivar un test per posar-ho en verd.

## Com tanca una peça

1. Branca nova des de `origin/main`; canvi petit; els checks de `ci.yml` i el
   test de Playwright del que ha tocat, en verd en local.
2. PR amb el títol en castellà i «Guardián ·» al davant, que espera la tanda de
   les 13:00 o les 20:00 (CLAUDE.md). Assignat a `asolache`.
3. En el mateix PR, marca la peça `[x]` aquí amb el número del PR.

## Les cues (prioritzades · només coses que es poden fer soles i comprovar)

La nit tria la cua (taula «Quina cola li toca cada nit»); dins de cada cua, de dalt a baix.

**A · Pantalles, no rotlles** (estàndard a `pantalles.md`)
1. [x] `cataleg.html` en pantalles (bilingüe: `data-pantalla-nom` per idioma o noms des de l'i18n) (#368)
2. [x] `qui-som.html` en pantalles: sis pantalles amb noms en català i castellà (#390)
3. [x] `SOS/vna.html` en pantalles (#369)
4. [x] `SOS/uneix-te.html`, `SOS/compra.html`, `premsa.html` en pantalles
   - [x] `premsa.html` · quatre pantalles, noms en català i castellà (#394)
   - [x] `SOS/uneix-te.html` · nou pantalles, de 2,2 alçades com a molt, noms en català (#400)
   - [x] `SOS/compra.html` · Inici i les set pestanyes pròpies, ara de `pantalla.js`; taules, comanda i mapes llisquen (≤ 2,9 alçades) (#406)
5. [x] Pantalles de més de 3 alçades a conecta/ia/escola: a `conecta/` els flujos (4,1) i el catàleg (5,7) ara són llistes que llisquen (1,5); ia i escola ja hi cabien; el test exigeix ≤ 3 (#397)
6. [ ] `SOS/blog.html`: llista d'entrades que llisca i una entrada per pantalla
   - Saltada el 24/11/2026: el PR #430 toca `SOS/blog.html`.
7. [x] `SOS/vedes.html`: filtre fix a dalt; Inici · Índex · Les vedes · Context; índex i vedes llisquen (≤ 1,4 alçades) (#431)
8. [ ] Quan n'hi hagi 8 o més: el `<script>` dins de les marques de `build-nav.js`

**B · Que el que diu el repo sigui veritat**
9. [ ] Passar `node SOS/tests/run.mjs` sencer i arreglar la causa dels que fallin (un per PR)
   - Passada del 15/11/2026: 10 de 137 fitxers fallen.
   - [x] `test-escola` · l'escola ja va en pantalles; el test hi arriba per `#id`, i la prova de la lletra ja no depèn de la font (#381)
   - [ ] `test-cost`, `test-endreca`, `test-ia`, `test-mapavalor`, `test-menu`, `test-vna-llenc` · toquen fitxers dels PR oberts #376/#378 (portada, catàleg, `vna.html`, `build-nav.js`): tornar-hi quan es mergegin
   - [ ] `test-rols`, `test-ux-flux` · són de l'app `SOS/index.html` (fil «Revisión UX de SOS»)
   - [ ] `test-cliente` · és de `cliente/` (fil del kanban)
   - Nota: les peces 1–8 es van saltar el 15/11 perquè #376/#378 toquen aquells fitxers.
10. [x] Enllaços morts del lloc i del SOS: `test-enllacos.mjs` (a la CI) rastreja els `href` de 91 pàgines contra fitxers i `_redirects`; els tres morts de `/ia` i `/finances.html` van on viu ara allò (#432)
   - 25/11/2026 (dimecres, cua D): el lot 2 d'oficis espera el #424 (mateixos fitxers); A6 i A8 esperen el #430 (`blog.html`, `build-nav.js`); de B9, `test-cost`/`test-endreca` són de la portada (#430), `test-mapavalor`/`test-vna-llenc` de `vna.html` (#430) i `test-ia` de `formacio.html`.
11. [ ] Textos sense traduir: bloc de la pinya de `vna.html` (19 cadenes), bloc de l'embut del blog

**C · Accessibilitat i pes**
12. [ ] Camps sense nom i botons sense text accessible a les pàgines del SOS
13. [ ] Zones tàctils de menys de 44 px a mòbil a les pàgines amb `data-pantalla`
   - [x] Passada del 28/11/2026 (dissabte; la jutgessa no té res a jutjar: el lot 1 encara és al #424): a les 13 pàgines amb `data-pantalla` (menys `cliente/`), les pestanyes de `pantalla.js` feien 40 px d'alt i la creu de l'avís del mòdul (`modul-pantalla.js`) 14 × 16; ara, al dit, 44 × 44. `test-tactil.mjs` ho mesura a l'iPhone 13 (#PR)
   - [ ] Falta la barra de navegació (marca, «casa», menú, «Entra», CTA i el CA/ES de `visio.html`: de 23 a 37 px d'alt). És de `build-nav.js`, que toca el #430: tornar-hi quan es mergegi
14. [ ] Pes: cap pàgina per sobre del seu sostre gzip (portada 67 KB, app 550 KB); avisar si s'hi acosta

**D · El cervell de VNA** (`SOS/knowledge/vna/`, veda 186)
15. [x] Mode sense API a `banc-mapes.mjs`: `oficis --lot 10 --a-ma` escriu les
    peticions del lot a `banc-mapes/resultats/a-ma/`, i `--ingereix <fitxer>`
    fa passar les respostes pel mateix camí (salut, descartats, `build-base-vna.js`).
    Test que ho cobreixi. (#405)
16. [ ] Lots de 10 en l'ordre de `pendents` (comença per l'hostaleria, 55.x).
    Marca aquí el lot i el PR: «lot N · codis · entrats/descartats (#PR)».
    Cada ofici diu les àrees que li falten (`arees_falten`, de `MapaValor.arees`):
    una àrea crítica que falta va a «falta», o l'ofici no entra.
17. [ ] La jutgessa del dissabte: `rubrica-ofici.md` sobre els oficis de la
    setmana; els de nota baixa tornen a `pendents` amb el motiu.
    També mira les dotze àrees: les que falten, ¿són de debò fora de l'ofici?
18. [ ] Cada 4 lots: la cobertura de `base.json` (exacta / aproximada /
    només sector) en una línia aquí, per veure si el client ha de triar menys.
19. [ ] Qui decideix (`MapaValor.decideix`, 22/11/2026): a cada ofici i model
    sense ningú que decideixi, el rol que ho fa (propietària, gerència, junta)
    amb el que dona i rep. `build-base-vna.js` ho compta: avui 33 de 35 peces
    amb intercanvis no ho diuen, 13 d'elles oficis.

**E · L'àrea de torn** (les 12 de `taxonomia-universal.json`, per ordre; dues
per setmana, la volta sencera en sis setmanes)
- A cada torn: els documents de l'àrea al cervell del repo (`cervell.js --check`),
  els que hi falten, els enllaços morts i el que el VNA hi diu (els rols i
  intangibles de la base que toquen l'àrea). Un PR petit o, si no cal res, una
  línia aquí.
- [x] direcció i estratègia (#417) · [x] comunicació (#433) · [ ] màrqueting · [ ] vendes ·
  [ ] finances · [ ] logística · [ ] producció · [ ] operacions · [ ] persones ·
  [ ] xarxa i aliances · [ ] sistemes i dades · [ ] legal i compliment
- Torn de **direcció i estratègia** (22/11/2026, #417):
  - Documents: de 25 amb el tronc comú, només `vna/sectors/negoci.md` porta el
    rol; el pla de negoci de la casa (ara a `Teamtowers-estrategia/negocio-huma/formacio-mentoria.md`, privat) i els altres
    quatre de `negoci/` sense capçalera no hi són (vegeu «Esperen l'Álvaro»).
    `cervell.js --check` i `build-nav.js --check` en verd; cap enllaç intern mort
    a `negoci/` ni a `vna/sectors/negoci.md`.
  - VNA (`MapaValor.arees` sobre les 80 peces de `base.json`): 31 cobreixen
    l'àrea (sobretot per «direcció», «gerent», «patronat»), 49 no. Hi falten
    13 dels 14 oficis i els 7 models, `negoci` inclòs: el centre («El negocio»,
    «La bodega»…) decideix, però cap rol ni intercanvi ho diu. Per a la cua D:
    a cada ofici, el rol de qui decideix (propietària, gerència, junta) amb el
    que dona i rep, o `arees.strategy` amb el rol del centre.
  - Decidit per l'Álvaro (22/11/2026): de moment, tot el que porta xifres va a
    privat. Els quatre de `negoci/` amb euros entren al cervell com a `privada` (#419)
    i el mateix dia passen al repositori privat `Teamtowers-estrategia/negocio-huma/`;
    més endavant, una auditoria del cervell (organització i estructura).

- Torn de **comunicació** (26/11/2026, #433):
  - Documents: 9 del tronc comú porten el rol (guia d'estil de la IA, noms
    oficials, portades, guia i flux de valor, els dos de Molekulon i els
    sectors acollida, cultura i joventut). Hi faltaven els dos de
    `knowledge/marketing/`, sense capçalera: ara entren al cervell amb
    comunicació i màrqueting. La guia d'estil de marca, pública i vigent;
    `social-posts.md`, privada i esborrany perquè el sedàs atura «pilot» a la
    crida final. `vision/comando-peli.md` també parla del relat però el genera
    `build-comando.js`: la capçalera s'hi ha de posar al generador (peça a part).
    Cap enllaç relatiu mort als onze; `cervell.js --check` en verd.
  - VNA (`MapaValor.arees` sobre les 35 peces de `base.json` amb intercanvis):
    9 cobreixen l'àrea (sobretot per «relat», «difusió»), 26 no. Hi falten 5
    dels 7 models (`negoci` inclòs), 11 de 14 sectors i 10 de 14 oficis
    (restaurant, botiga, esdeveniments, escola d'idiomes…). Acollida i
    joventut diuen comunicació a la capçalera i el seu mapa no té cap rol ni
    intercanvi que ho digui. Per a la cua D: a cada ofici, qui explica el
    negoci fora (xarxes, ressenyes, premsa local) amb el que dona i rep, o
    `arees.communication: "no-aplica"` si de debò no n'hi ha.

## Esperen l'Álvaro (el guardià no les toca)

- `mapa-web/`: és de venda; ¿fa de «landing» amb scroll o va en pantalles?
- `SOS/formacio.html`: la porta el fil del catàleg formatiu.
- `knowledge-base/stakeholders.html` («Stakeholders Dashboard», en anglès, de la generació anterior): publicada, sense cap enllaç que hi porti i sense estils (`styles.css` no existeix). ¿Es retira amb un 301 com les catorze de l'01/10? Fins llavors, `test-enllacos.mjs` la té apartada.
