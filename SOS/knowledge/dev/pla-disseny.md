# Pla de millora i estandardització del disseny

> **Escrit el 10/10/2026**, el dia que la barra única es parteix en dues (la del
> lloc i la del SOS) i la portada passa a parlar de tres serveis. Mesurat sobre
> el repositori, no sobre el lloc en viu. Aquest pla diu **què falta perquè
> totes les pàgines semblin una sola casa** i en quin ordre fer-ho. La guia de
> marca (`knowledge/marketing/guia-estil-marca.md`) diu *com* ha de ser; això
> diu *on encara no ho és*.

---

## 0 · On som, en quatre frases

1. **La pell ja és una.** `build-pell.js` escriu la mateixa paleta a 27
   pàgines, amb els contrastos mesurats (AA a tot el text sobre `--bg`) i un
   terra de 15 px (`--t0`).
2. **La barra ja és declarada.** `build-nav.js` genera dues barres des d'un sol
   codi: la del lloc (tres ofertes, qui som i el diagnòstic) i la del SOS (les
   eines, aprèn, Molekulon i «Obre el SOS»). Quina porta cada pàgina és a
   `PAGINES_LLOC`.
3. **Els components i el peu, també (des de la fase 2 i 4).** `build-components.js`
   declara els botons, la capçalera de secció i la targeta, i `build-nav.js`
   genera el peu des dels mateixos grups que la barra. El que queda de cada
   pàgina és la seva maquetació.
4. **Dues pàgines del servei web viuen fora de tot**: `/mapa-web/` i `/conecta/`
   tenen capçalera pròpia, no porten la barra ni la pell i són en castellà.

## 1 · Les cinc costures que es veuen

| # | La costura | On | Com es mesura |
|---|---|---|---|
| C1 | **Mides per sota del terra.** Declaracions `font-size` en `rem`/`px` per sota de 15 px escrites a mà | `index.html` 82 · `diagnostic-org` 45 · `diagnostic-territori` 35 · `escola` 35 · `cataleg` 32 · `formacio` 32 · `pressupost` 31 · `qui-som` 30 · `compra` 30 · `mapa-web` 67 · `conecta` 24 | `grep` de `font-size:.Nrem` i `font-size:9–14px` |
| C2 | **Àlies de la pell vella a l'arrel.** `--white`, `--accent-indigo`, `--bg-panel`… declarats només a les pàgines d'arrel | `index.html` 137 usos · `qui-som` 56 · `cataleg` 52 · `premsa` 0 | `grep var(--white\|accent-*\|bg-*)` |
| C3 | **Components repetits a mà.** `.btn-primary`, `.btn-ghost`, `.section-header`, `.section-eyebrow`, targetes: cada pàgina en té la seva còpia, amb radis, ombres i paddings diferents | totes | no hi ha guarda |
| C4 | **Pàgines del servei fora de la casa.** Sense barra, sense pell, capçalera pròpia, només en castellà | `mapa-web/`, `conecta/` | no són a `PAGINES` ni a `build-pell.js` |
| C5 | **`vedes.html` perd la pell.** `build-vedes.js` regenera la pàgina sencera i escriu la paleta vella; `build-pell.js --check` peta (no és al CI) | `SOS/vedes.html` | `node SOS/tools/build-pell.js --check` |

## 2 · El pla, en quatre fases

Cada fase és un PR que es pot provar sol, i cada una acaba amb una guarda al CI
perquè no torni enrere. L'ordre és el de l'impacte que es veu: primer el que
llegeix qui arriba (les pàgines de les tres ofertes), després la resta.

### Fase 1 · Les pàgines que venen (les tres ofertes)

L'objectiu: qui va de la portada a qualsevol de les tres ofertes no nota cap
canvi de casa.

- **Les dues pàgines del servei web dins la casa** (C4): `mapa-web/` i
  `conecta/` passen a portar la barra del lloc i la pell. Cal la versió en
  català (són `noindex` fins aleshores, i ho diuen) i decidir si es
  queden com a carpetes o passen a `SOS/`. **Ho porta el fil del servei web**,
  que és qui és amo d'aquestes pàgines; aquí només es declara a `build-nav.js`
  quan estiguin a punt.
- **El terra de 15 px a les pàgines de l'oferta** (C1): `index.html`,
  `cataleg.html`, `diagnostic*.html`, `pressupost.html`, `vna.html`,
  `vna-suport.html`, `formacio.html`. Cada `font-size` literal passa a
  `var(--t0…t5)`.
- **Guarda:** `check-css-arrel.js` (o una de nova, `check-terra.js`) peta si una
  pàgina de `PAGINES_LLOC` o de l'arrel declara una mida per sota de `--t0`.

### Fase 2 · Un sol joc de components

L'objectiu: un botó és el mateix botó a totes les pàgines.

- **`build-components.js`**, mateix patró que la pell i la barra: declara un
  cop `.btn-primary`, `.btn-ghost`, `.section-header`, `.section-eyebrow`,
  `.targeta` (la de «Tres serveis» n'és el model), i els escriu entre
  marques `/*TT-COMPONENTS*/` a totes les pàgines amb pell. El peu va a la
  fase 4, amb la barra.
- **Les pàgines esborren la seva còpia** d'aquests selectors. És un canvi gran
  en línies i petit en risc, i per això va sol.
- **Guarda:** cap pàgina declara aquests selectors fora del bloc (com ja fa
  `build-nav.js` amb la barra).

### Fase 3 · Els àlies de la pell vella

- **C2**: `--white` → `--text`, `--accent-indigo` → `--indigo`, `--bg-panel` →
  `--panel`… a `index.html`, `cataleg.html` i `qui-som.html`, i els àlies surten
  de la declaració.
- Aprofitar per fer el que la pell ja té anotat al backlog: `--light` vol dir
  «text secundari» i `--panel`/`--card` s'han intercanviat el paper.
  Reanomenar-los és un canvi de moltes línies que no es veu; va sol i amb la
  guarda de tokens.
- **C5**: `build-vedes.js` aplica la pell igual que ja aplica la barra (`posa`
  exportat de `build-pell.js`), i `build-pell.js --check` entra al CI.

### Fase 4 · El peu i les capçaleres

- **Un peu declarat** (`build-peu.js` o dins de `build-nav.js`): les tres
  ofertes, qui som, premsa, contacte i l'avís legal, a totes les pàgines amb
  barra. Avui la portada en té un d'escrit a mà i la majoria de pàgines del SOS
  no en tenen.
- **Una capçalera de pàgina comuna** per a les pàgines de l'oferta: eyebrow,
  títol, entradeta i una sola crida, amb el mateix ritme vertical que «Tres
  serveis». Les pàgines del SOS mantenen la seva perquè són eines.

## 3 · El que no es toca, i per què

- **L'aplicació (`SOS/index.html`) es queda fosca.** És una eina que s'obre cada
  dia, té la seva barra i va al 97–99 % del seu sostre de pes. Ja consta a
  `FORA_DE_LA_PELL`.
- **`joc.html`** és una pantalla de joc a pantalla completa.
- **Els dibuixos generats** (el castell, el mapa del celler, la planta) tenen les
  seves mides en unitats SVG, no en `rem`: la guarda del terra els ha d'excloure.

## 4 · Fet (PR #216)

- Dues barres generades des de `build-nav.js` (`LLOC` i `SOS_GRUPS`), amb les
  guardes per barra: cap destí a dues portes dins d'una barra, totes les pàgines
  porten la que els toca, la del SOS té camí de tornada a la portada.
- Portada: «Tres serveis» substitueix «Tres camins», amb mides de l'escala
  (`--t0`, `--t2`) i colors només de la pell. És el model de targeta per a la
  fase 2.
- El peu de la portada nomena les tres ofertes.
- **C5 tancada.** `build-vedes.js` escriu la pell ell mateix i
  `build-pell.js --check` corre al CI. `/vedes` es publicava sense cap color.
- **Fase 3, la meitat que es veu.** Els àlies `--white`, `--accent-*` i `--bg-*`
  se'n van de la portada, el catàleg i qui som; `check-landing.js` peta si
  tornen. Queda reanomenar `--light` i `--panel`/`--card`.
- **Fase 1, menys `mapa-web/` i `conecta/`.** Les 325 mides per sota del terra
  de les dotze pàgines que venen passen a l'escala, amb els ajustos de
  maquetació que calien (el hero de la portada segueix cabent a la primera
  pantalla a 1280 × 860 i a 390 × 844). Les etiquetes en majúscules
  monoespaiades baixen l'espaiat a `.06em`: a 15 px, `.2em` cridava. Guarda
  nova al CI: `check-terra.js`, amb les 19 regles de text SVG declarades.

## 5 · Fet (fases 2 i 4)

- **Fase 2.** `build-components.js` declara `.btn`, `.btn-primary`,
  `.btn-ghost`, `.btn-sm`, `.section-header`, `.section-eyebrow` i `.targeta`
  (amb `-k`, `-t`, `-d`) i els escriu a les 27 pàgines amb pell, just després
  del `:root`. Les pàgines han esborrat les seves còpies: el `.b`/`.b-pri` del
  SOS, el `.cta` del mètode i de `uneix-te`, el `.btn-g` dels diagnòstics, els
  degradats cap a un lila que la pell no té. Un primari per pantalla (guia §6) i
  44 px d'alçada mínima. Guarda al CI: `build-components.js --check` peta si una
  pàgina en torna a declarar un fora del bloc (el context davant, com `.hero
  .btn-primary`, sí que es pot).
- **Fase 4, el peu.** `build-nav.js` genera el peu entre `<!--TT-PEU-->` a les
  27 pàgines, amb els mateixos grups que la barra: `LLOC` a les pàgines
  públiques (més «Escriu-nos» i el ©) i `SOS_GRUPS` a les del SOS (amb el camí
  de tornada a la portada). Els peus escrits a mà i les seves claus d'idioma
  orfes han sortit. La guarda de la barra també vigila el peu.
- **`/mapa-web/` i `/conecta/`.** Porten la pell, els components, la barra i el
  peu del lloc. Com que són esborranys només en castellà, `build-nav.js` les
  declara a `CARPETES` i hi escriu la barra i el peu en castellà i sense claus.
  La seva capçalera es queda com a índex de la pàgina, sense marca i sense
  `sticky` (ja ho és la barra), i les 82 mides per sota del terra passen a
  `--t0`: `check-terra.js` també les vigila, amb les quatre regles de text del
  dibuix de la xarxa declarades.
- **L'avís legal i la privacitat** (`/avis-legal`). Titular: Alvaro Solache,
  autònom (10/10/2026). Explica què recull el lloc segons el codi: els dos
  formularis (Netlify → Zoho CRM), el directori (Supabase), el pagament
  (Stripe) i el que es queda al navegador. El peu de les 30 pàgines l'enllaça
  (`nv.peu.legal`) i `/aviso-legal`, `/privacitat` i `/privacidad` hi porten.
- **Queda:** el NIF i el domicili de l'avís legal (LSSI art. 10, quan l'Alvaro
  els doni), els botons de dins dels blocs generats per altres eines (`.mv-cta`
  del mapa de valor a la portada i al mètode, `.ct-btn` del contacte) i la
  capçalera de pàgina comuna de la fase 4.
