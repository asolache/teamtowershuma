# El guardià · el saldo del pla que no es perd

Aprovat per l'Álvaro el 13/11/2026: quan al seu pla de Claude li sobra saldo,
una tasca programada el fa servir per polir el sistema en comptes de deixar-lo
perdre. Treballa **aquesta cola**, de dalt a baix.

## Quan treballa

- Dilluns a divendres a les 22:41 i dissabte i diumenge a les 8:41 (hora de
  Madrid). Mai en horari de projecte de l'Álvaro (dl–dv de 8 a 17 h).
- Si la sessió pot veure el consum del pla (`/usage`, o els `rate_limits` de la
  línia d'estat): **no fa res** si la setmana va per sobre del ritme (el % gastat
  és més alt que el % de setmana que ha passat) o si ja passa del 85 %.
  Si no ho pot veure, treballa igualment: l'horari ja és la protecció.
- **Una peça per execució, un PR com a màxim.** Si topa amb el límit, para i no
  deixa res a mitges al main.

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

## La cola (prioritzada · només coses que es poden fer soles i comprovar)

**A · Pantalles, no rotlles** (estàndard a `pantalles.md`)
1. [ ] `cataleg.html` en pantalles (bilingüe: `data-pantalla-nom` per idioma o noms des de l'i18n)
2. [ ] `qui-som.html` en pantalles
3. [ ] `SOS/vna.html` en pantalles
4. [ ] `SOS/uneix-te.html`, `SOS/compra.html`, `premsa.html` en pantalles
5. [ ] Pantalles de més de 3 alçades a conecta/ia/escola: partir-les o fer-ne llista que llisca
6. [ ] `SOS/blog.html`: llista d'entrades que llisca i una entrada per pantalla
7. [ ] `SOS/vedes.html`: filtre a dalt i llista que llisca
8. [ ] Quan n'hi hagi 8 o més: el `<script>` dins de les marques de `build-nav.js`

**B · Que el que diu el repo sigui veritat**
9. [ ] Passar `node SOS/tests/run.mjs` sencer i arreglar la causa dels que fallin (un per PR)
10. [ ] Enllaços morts del lloc i del SOS (`build-nav.js --check` i un rastreig de `href` interns)
11. [ ] Textos sense traduir: bloc de la pinya de `vna.html` (19 cadenes), bloc de l'embut del blog

**C · Accessibilitat i pes**
12. [ ] Camps sense nom i botons sense text accessible a les pàgines del SOS
13. [ ] Zones tàctils de menys de 44 px a mòbil a les pàgines amb `data-pantalla`
14. [ ] Pes: cap pàgina per sobre del seu sostre gzip (portada 67 KB, app 550 KB); avisar si s'hi acosta

## Esperen l'Álvaro (el guardià no les toca)

- `mapa-web/`: és de venda; ¿fa de «landing» amb scroll o va en pantalles?
- `SOS/formacio.html`: la porta el fil del catàleg formatiu.
