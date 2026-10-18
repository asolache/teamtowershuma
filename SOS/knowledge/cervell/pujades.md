# De pujada · el que els projectes fills ensenyen a la matriu

> Generat per `cervell.js --recull <projecte>`. No l'editis: per adoptar o
> descartar, canvia `estat` a `pujades.json` (`adoptada <veda>` o
> `descartada <motiu>`) i torna a recollir.

## Events Penedès

### veda 4 · adoptada 172

### veda 5 · adoptada 173

### veda 6 · adoptada 174

### veda 7 · adoptada 175

### veda 8 · adoptada 176

### veda 9 · adoptada 177

### veda 10 · adoptada 178

### producte Del formulario a la propuesta · adoptada al catàleg (17/10/2026)

### producte Tu día en una pantalla · adoptada al catàleg (17/10/2026)

### producte La red que se mantiene sola · adoptada al catàleg (17/10/2026)

### producte Tu catálogo de partners · adoptada al catàleg (17/10/2026)

### producte Leads ordenados por potencial · adoptada al catàleg (17/10/2026)

### producte Tu red en el mapa · adoptada al catàleg (17/10/2026)

## Álvaro Solache

### veda 4 — El cerebro de la web lee el codex, no lo copia · proposada

**Dicho por Álvaro el 17/10/2026** al pedir el cerebro como grafo (PR #5).
`cerebro-datos.js` lo escribe `herramientas/cerebro-codex.mjs` leyendo el codex
de cada fuente; no se edita a mano. Lo único que se escribe a mano son las capas
fijadas (`capas.json`) y lo que enseña cada veda (`sintesis.json`). Si el codex
cambia, se vuelve a generar. Es la veda 71 de TeamTowers aplicada a esta web:
una copia a mano diverge en silencio.

**Guarda:** el generador para si una veda trae un saber que no está en la lista.
Que el CI compruebe que `cerebro-datos.js` está al día queda en el backlog.

### veda 5 — Esta web es hija de la matriz: lo heredado no se repite · proposada

**Dicho por Álvaro el 17/10/2026:** «Estoy haciendo tu cerebro #codex.
Intégralo y evoluciónate» y «Sé DRY». El cerebro de este proyecto es el de
TeamTowers, instalado con `cervell.js --nou` y puesto al día con
`--actualitza`. Una regla que ya está en `vedas-heredadas.md` se cita, no se
reescribe: por ejemplo, «una cifra sin fuente no se publica» es la veda 67
heredada. Aquí solo entran las vedas que nacen de esta web, y las que valgan
para todos suben a la matriz con `cervell.js --recull`.

**Guarda:** `guardas/cervell.js --check` en CI. Y el cerebro de la web no
muestra las vedas de la plantilla (1 a 3) como propias: ya están en la matriz.

### veda 6 — La IA se declara, y lo que gasta se elige · adoptada 167

## Molekulon.org

### veda 1 — El relat no és d'aquí: es declara a la matriu i aquí se'n vigila la còpia · proposada

**Dit per l'Àlvar el 2026-10-10**, en treure molekulon.org de teamtowershuma.
Els catorze personatges, les peces de mitjans i el guió de la intro es declaren
una sola vegada a teamtowershuma ([SOS/tools/build-comando.js](https://github.com/asolache/teamtowershuma/blob/main/SOS/tools/build-comando.js)). Aquí n'hi ha
una còpia, `../data/comando.json`, perquè el lloc s'ha de poder construir sense
xarxa. Editar-la aquí sembla que funciona i es desfà sol el dilluns següent.

**Guarda:** `../tools/sync.js` amb `--check`, cada dilluns al CI.

### veda 2 — Una porta pública no pot demanar el compte de ningú · proposada

**Dit per l'Àlvar el 2026-10-11:** el kit era un artefacte de Claude privat i
s'obria com una finestra privada per a tothom menys per a ell. Qui no tenia
compte no hi entrava ni compartint-lo. Ara el kit és `/kit`, a casa: munta la
fitxa sense IA, prepara el text per enganxar a qualsevol xat i la IA la posa qui
escriu, des del seu compte. El projecte no paga cap model ni guarda cap clau.

**Guarda:** `../tools/check.js` (cap enllaç intern a un fitxer que no hi sigui).
Que comprovi també que cap pàgina enllaça `claude.ai` queda al backlog.

### veda 3 — Una marca de confiança es treu de la firma, no de l'última fila · proposada

**Trobat a l'auditoria amb el cervell, 2026-10-17.** La marca «comprovat al
SOS» es donava si l'última fila d'`online_fitxes` d'aquell `did` portava el
mateix @nick. Aquella taula accepta files de qualsevol i Postgres no en pot
comprovar la firma: n'hi havia prou de posar el `did` d'una altra persona per
sortir «comprovat» com ella. És la veda 61 heretada («no es diu verificat del
que no s'ha verificat») trencada per un `join`: quan es creua amb una taula
oberta d'«només afegir», es pren **l'última fila amb firma vàlida**, i la firma
la comprova qui pinta, no qui allotja.

**Guarda:** `../tools/prova-firma.js` al CI. Fabrica fitxes bones i falses i
peta si la pàgina en dona una per bona que no ho és. Es va veure petar abans de
donar-la per bona (veda 50).

### producte El cromo sense compte · proposada

Una pàgina on qualsevol es fa un personatge, el veu pintat al moment i el
baixa, sense registrar-se. Si el vol a la col·lecció, l'envia: el navegador li
guarda una clau d'edició i a la base de dades només n'hi ha el resum. Amb la
mateixa clau el canvia o el retira des de qualsevol aparell. La IA, si la vol,
la posa qui escriu. Aquí: `/kit`, `../sql/001_comando_cromos.sql`.

### producte La col·lecció moderada a mitges · proposada

El primer enviament de cada persona l'aprova l'autor amb un clic; els canvis
d'algú ja aprovat surten sols, i retirar-se no espera ningú. La clau de
moderador no és a cap fitxer, i la porta es tanca sola si algú la prova a cegues.
Aquí: `/personatges`, `/modera`, `../sql/002_auditoria_cervell.sql`.

### producte La marca que es comprova · proposada

Un perfil d'un lloc es lliga amb la identitat firmada d'un altre (el `did` del
SOS) i la marca només surt si el navegador de qui mira comprova la firma. Cap
servidor ha de ser de confiança. Aquí: la veda 3 i `../tools/prova-firma.js`.

### producte Les dades de la matriu, copiades i vigilades · proposada

Una web que pinta dades que es declaren en un altre repositori: en té una
còpia per construir-se sense xarxa, i un treball setmanal avisa si s'ha quedat
vella. Aquí: `../tools/sync.js` i la veda 1.
