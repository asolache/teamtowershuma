# Pantalles, no rotlles

Decisió de l'Álvaro (13/11/2026): **només la portada fa scroll llarg**. La resta
de pàgines es comporten com una aplicació —sobretot a tauletes grans i mòbils—:
la barra del lloc a dalt, les pantalles de la pàgina en pestanyes, «anterior ·
següent» a baix, i scroll **només** quan el que es mira és de debò una llista
que no hi cap.

## L'estàndard (una sola peça)

`SOS/lib/pantalla.js`. Una pàgina s'hi apunta amb dues coses:

```html
<body data-pantalla>
…
<script src="/SOS/lib/pantalla.js" defer></script>   <!-- lib/pantalla.js des del SOS -->
```

- Les pantalles són les `<section id>` de primer nivell que ja té la pàgina. El
  hero d'abans de la primera fa de pantalla «Inici» si té h1 o prou text.
- Nom de la pestanya: `data-pantalla-nom` a la secció → l'enllaç de l'índex
  propi de la pàgina → el començament de l'h2 (fins a 30 caràcters).
- L'índex propi de la pàgina s'amaga sol: dos índexs serien dos llocs per al
  mateix (regla «tot sempre al mateix lloc», 24/10).
- Cada pantalla és un enllaç `#id`; un `#id` de qualsevol cosa de dins obre la
  seva pantalla; «Enrere» torna a l'anterior (regla «la màxima de tot és un
  link», 24/10). `scrollIntoView` del codi de la pàgina també obre la pantalla.
- Un element que ha de quedar sempre a la vista: `data-pantalla-fix`.
- Sense JS la pàgina és la de sempre; en imprimir surt sencera.
- Test: `SOS/tests/test-pantalla.mjs` (pàgines pilot, tauleta i mòbil).

Què vol dir «que hi càpiga»: a 1180 × 820 (tauleta apaïsada) cada pantalla ha
de fer **una alçada**, dues com a molt. Si una en fa més, és que és una llista
(que llisqui ella, no la pàgina) o que la secció s'ha de partir.

## Auditoria (13/11/2026)

Alçada de la pàgina sencera en pantalles, a tauleta apaïsada 1180 × 820:

| Pàgina | Abans | Ara | Qui la porta |
|---|---|---|---|
| `index.html` (portada) | 21,7 | **es queda amb scroll** | — |
| `conecta/` | 19,6 | pantalles d'1 a 5,7 | pilot ✓ |
| `SOS/ia.html` | 8,9 | pantalles d'1 a 2 | pilot ✓ |
| `SOS/escola.html` | 9,0 | pantalles d'1 a 2,3 | pilot ✓ |
| `SOS/vedes.html` | 178 | — | cua · és una llista: filtre + llista que llisca |
| `SOS/blog.html` | 75 | — | cua · llista d'entrades + lectura d'una |
| `SOS/formacio.html` | 51 | — | cua (catàleg formatiu, fil «Evolucionar el catálogo») |
| `SOS/vna.html` | 29 | — | cua |
| `cataleg.html` | 16,5 | — | cua (i18n: noms amb `data-pantalla-nom`) |
| `cliente/` | 15,9 | — | **fil del kanban** hi treballa: esperar-lo |
| `mapa-web/` | 15,8 | — | cua (és de venda: confirmar si fa de «landing») |
| `SOS/comando.html` | 14,3 | — | cua · no té la barra del lloc |
| `qui-som.html` | 8,8 | — | cua (i18n) |
| `SOS/index.html` (app) | 8,3 | — | **fil «Revisión UX de SOS»** |
| `SOS/uneix-te.html` | 8,4 | — | cua |
| `avis-legal.html` | 7,3 | — | cua · text legal: lectura amb índex |
| `SOS/vna-suport.html` | 7,2 | — | editor: disseny propi d'app |
| `SOS/compra.html` | 6,7 | — | cua |
| `premsa.html` | 3,8 | — | cua |
| resta del SOS | 1,5–3 | — | cua, baixa prioritat |

## La cua

La cua viva és a `guardia.md` (secció A), que és la que treballa el guardià.
La d'aquí sota queda com a registre de la proposta del 13/11.

### Proposta inicial

Per ordre. Una línia = una peça petita, un PR, que espera la tanda.

1. [ ] `cataleg.html` — pantalles amb noms bilingües
2. [ ] `qui-som.html` — ídem
3. [ ] `SOS/vna.html` — pantalles; la lectura del mapa ja va en blocs `.lt`
4. [ ] `SOS/blog.html` — llista d'entrades que llisca + una entrada per pantalla
5. [ ] `SOS/vedes.html` — filtre a dalt, llista que llisca
6. [ ] `SOS/formacio.html` — coordinar amb el fil del catàleg formatiu
7. [ ] `SOS/uneix-te.html`, `SOS/compra.html`, `premsa.html`, `avis-legal.html`
8. [ ] Pantalles de més de 3 alçades a les pàgines pilot: partir o fer llista
9. [ ] Quan n'hi hagi 8 o més: posar el `<script>` dins de les marques de
       `build-nav.js` (un sol lloc) i que cada pàgina només porti `data-pantalla`
10. [ ] `cliente/` i l'app `SOS/index.html`: només quan els seus fils hi diguin sí
