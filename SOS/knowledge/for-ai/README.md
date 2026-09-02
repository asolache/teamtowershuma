# Contracte de treball per a una IA

Aquest fitxer diu **com es treballa aquí**. La taxonomia (`../taxonomia.md`) diu
on va cada cosa i `../MAPA.md` diu què hi ha; això diu què has de fer i què no.

> La versió anterior d'aquest fitxer deia «els 18 vedes» quan ja n'hi havia 116,
> prohibia `localStorage` quan tres pàgines l'usen a posta, i donava números de
> línia de quan el fitxer en tenia 2.000. **Era un mapa fals, i amb un mapa fals
> es va.** Per això ara les xifres que caduquen no s'escriuen aquí: es generen o
> es cerquen.

## 1 · L'ordre de lectura

1. **`../MAPA.md`** — què hi ha i de quina cara és. Generat des de l'arbre.
2. **`../codex.md`** — les vedes. Cadascuna és un error que ja es va cometre; no
   són estil, són llei.
3. **`../taxonomia.md`** — on va el que escriguis.
4. **`CLAUDE.md`** a l'arrel — com vol la comunicació qui hi treballa.
5. **La cara `obra` que et toqui.** `Grep` abans de moure res.

## 2 · El que no es negocia

- **Autocontingut.** Cada pàgina és un fitxer HTML que funciona per `file://`
  sense build, sense `npm install` i sense dependències. **El repositori no té
  `package.json`**: les proves l'instal·len i l'esborren abans de fer commit.
- **Cap servidor propi.** El que passa, passa al navegador de qui hi és.
- **Tota escriptura al llibre passa per `pushLedger()`**: signada i encadenada.
- **Res que anomeni una persona surt sense passar pel sedàs** (`verifyNoLeak`).
- **Les guardes són `require`, no `import`.** Un `.js` amb `import` passa a Node
  22 i peta el CI a Node 18.

Sobre `localStorage`: **no està prohibit; està acotat.** El perfil de capacitats,
La Compra i el joc l'usen a posta perquè són dades d'un dispositiu que no han
d'anar enlloc. El que va a IndexedDB és l'estat del SOS. Si dubtes, mira on ho
desa una pàgina que ja ho fa.

## 3 · Com s'escriu aquí

- **El comentari explica per què, no què.** El codi ja diu què fa. El comentari
  ha de dir quin error evita — i si no n'evita cap, sobra.
- **Res de xifres inventades.** Si una pantalla dona un número, ha de sortir
  d'un càlcul que es pugui refer, amb la seva data i la seva font quan és un
  preu. Mesura abans de decidir; la regla de decisió, escrita **abans** de
  mirar el resultat.
- **Cap promesa que el codi no camini.** Si la interfície ofereix un camí, ha
  d'existir. Veda 120.
- **Una taula declarada, un sol lloc.** Dues còpies de la mateixa llista
  divergeixen en silenci; si n'hi ha d'haver dues, hi ha d'haver una guarda que
  les compari.

## 4 · Guardes i proves

Les guardes viuen a `SOS/tools/check-*.js` i corren al CI. Les proves són
Playwright contra les pàgines de debò per `file://`, a `SOS/tests/`, i
`SOS/tests/run.mjs` les passa totes.

Dues regles que valen més que la resta d'aquesta secció:

- **Una guarda nova s'ha de provar trencant a posta el que ha de trobar.**
  Llegir-la i veure que sembla correcta no compta: una guarda amb un error propi
  es gasta la confiança que necessitarà el dia que trobi una cosa de debò.
- **Quan una prova nova falla, la primera hipòtesi és la prova.** Ha passat
  diverses vegades: el muntatge era meu i el codi tenia raó.

Per posar en marxa l'entorn:

```
npm i -D playwright --no-audit --no-fund
export SOS_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
node SOS/tests/run.mjs
rm -f package.json package-lock.json     # abans de fer commit, sempre
```

## 5 · Diccionari

- **Node** — un territori (país, comarca, municipi, barri) o un projecte.
- **Dinàmica** (`dynamicType`) — el tipus de projecte: banc de temps, biblioteca,
  grup de consum, energia, habitatge, cures…
- **MATRIU** — el node que conté ventures econòmiques i el fons cooperatiu local.
- **Superheroi** — una persona amb superpoders (el que sap fer) i superarmes
  (el que posa en comú).
- **Molekulon** — un grup de 5-12 persones coordinades en un projecte.
- **Comando Molekulon** — tota la gent de l'ecosistema. L'horitzó són 150.000, i
  **cadascú té un número que no reparteix ningú**: és la seva posició al
  registre públic. Veda 125.
- **Sabiduria** — el govern del node: qui el reclama, qui hi és steward, quòrum
  i propostes signades.
- **Rebut** — la tercera anotació: l'apunt i el vistiplau signats en un sol
  objecte portàtil. Veda 126.
- **Veda** — una regla del codex. Es numeren i no es reordenen.

## 6 · Els antipatrons que hem comès de debò

Cadascun és un error real amb la seva veda; la llista és curta perquè només hi
ha el que ha passat:

- **Escriure a `state.nodes[i]` sense `persist(node)`.** El canvi es veu i no es
  desa.
- **Dir «verificat» del que no s'ha verificat.** El pitjor error possible aquí.
- **Comptar altes com si fossin persones.** Un número que puja sense que hagi
  passat res és una mètrica de vanitat. Veda 79.
- **Guardar una xifra derivada.** El número del Comando, el saldo, l'encaix: es
  dedueixen cada cop. Una xifra desada divergeix del que la genera.
- **Ensenyar un color, un nom o una data que no vol dir res al costat d'un que
  sí.** El que es veu gros ha de ser el que diu la veritat. Vedes 121 i 123.
- **Inventar entitats amb IA.** Per a això hi ha `discover_entities`, que
  verifica primer.

## 7 · On és cada cosa

No hi ha números de línia en aquest fitxer, a posta: caduquen en una setmana i
llavors envien la gent a un lloc equivocat amb la cara de saber-ho. **`Grep` la
funció.** El hook de proves al final de `SOS/index.html` (`window.__SOS`) és la
llista de tot el que és cridable, i és el millor índex que hi ha.
