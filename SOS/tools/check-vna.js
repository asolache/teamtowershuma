#!/usr/bin/env node
/* Guarda del mapa de valor · una colla, una sola explicació
 * ─────────────────────────────────────────────────────────────────────────
 * La colla castellera surt a dos llocs: a la portada (`COLLA_CA`, amb el que
 * aporta cada rol de tangible i d'intangible) i a `SOS/vna.html`, que és on
 * s'explica què se'n fa. Són dues còpies **deliberades** —cada pàgina ha de
 * funcionar sola, sense carregar l'altra— i per això mateix poden divergir en
 * silenci, que és exactament el que va passar amb els herois del Comando i el
 * que va costar la veda 109.
 *
 * Aquí es comprova que diguin el mateix, paraula per paraula:
 *
 *   1. Els mateixos dotze rols, amb els mateixos identificadors.
 *   2. El mateix títol, el mateix tangible i el mateix intangible per a cada un.
 *   3. Cada lliurament del graf surt d'un rol que existeix.
 *   4. Cap rol es queda sense cap lliurament: un node solt al mapa de valor no
 *      és un rol, és una decoració.
 *
 * Veda 116.
 *
 * Ús:  node SOS/tools/check-vna.js
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const PORTADA = readFileSync(join(ARREL, 'index.html'), 'utf8');
const PAG = readFileSync(join(ARREL, 'SOS', 'vna.html'), 'utf8');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;
const net = s => s.replace(/\\'/g, "'").replace(/\s+/g, ' ').trim();

console.log('\nGuarda del mapa de valor · la colla castellera');

/* ── La colla de la portada ─────────────────────────────────────────────── */
const bloc = (PORTADA.match(/var COLLA_CA = \{[\s\S]*?\n\};/) || [''])[0];
const RE = /(\w+):\s*\{title:'((?:[^'\\]|\\.)*)',\s*t:'((?:[^'\\]|\\.)*)',\s*i:'((?:[^'\\]|\\.)*)'\}/g;
const portada = [...bloc.matchAll(RE)].map(m => ({
  id: m[1], title: net(m[2]), t: net(m[3]), i: net(m[4]) }));

if (!portada.length) {
  /* Sense l'original no es diu «tot bé»: es diu que no s'ha pogut mirar. */
  bad('no es troba COLLA_CA a index.html: aquesta guarda no pot comprovar res');
  console.log('\n❌ 1 problema.');
  process.exit(1);
}
ok(`la portada declara ${portada.length} rols de la colla`);

/* ── Els de la pàgina del mapa ──────────────────────────────────────────── */
const RE2 = /\{id:'(\w+)',x:\d+,y:\d+,lab:'\w+',curt:'((?:[^'\\]|\\.)*)',\s*title:'((?:[^'\\]|\\.)*)',\s*t:'((?:[^'\\]|\\.)*)',\s*i:'((?:[^'\\]|\\.)*)',\s*poble:'((?:[^'\\]|\\.)*)'\}/g;
const pagina = [...PAG.matchAll(RE2)].map(m => ({
  id: m[1], curt: net(m[2]), title: net(m[3]), t: net(m[4]), i: net(m[5]), poble: net(m[6]) }));

const declarats = (PAG.match(/\{id:'\w+',x:\d+,y:\d+,lab:/g) || []).length;
if (pagina.length !== declarats) {
  bad(`el lector n'ha entès ${pagina.length} de ${declarats}: el format dels rols ha canviat i aquesta guarda s'ha quedat cega`);
} else ok(`vna.html declara ${pagina.length} rols`);

/* ── 1 i 2 · els mateixos, i dient el mateix ────────────────────────────── */
const idsP = new Set(portada.map(r => r.id)), idsV = new Set(pagina.map(r => r.id));
const falten = [...idsP].filter(i => !idsV.has(i));
const sobren = [...idsV].filter(i => !idsP.has(i));
if (!falten.length && !sobren.length) ok('els dotze rols són els mateixos als dos llocs');
else {
  if (falten.length) bad(`vna.html no té ${pl(falten.length, 'rol', 'rols')} de la portada: ${falten.join(', ')}`);
  if (sobren.length) bad(`vna.html s'inventa ${pl(sobren.length, 'rol', 'rols')}: ${sobren.join(', ')}`);
}

const difs = [];
pagina.forEach(v => {
  const p = portada.find(x => x.id === v.id);
  if (!p) return;
  ['title', 't', 'i'].forEach(k => { if (p[k] !== v[k]) difs.push(`${v.id}.${k}`); });
});
if (!difs.length) ok('i el títol, el tangible i l\'intangible de cadascun coincideixen paraula per paraula');
else bad(`${pl(difs.length, 'camp', 'camps')} que diuen coses diferents als dos llocs: ${difs.join(', ')} — ` +
  'la mateixa colla explicada de dues maneres és el problema de la veda 109 una altra vegada');

/* ── 3 i 4 · el graf ────────────────────────────────────────────────────── */
const flux = [...PAG.matchAll(/\['(\w+)','(\w+)','([ti])'/g)].map(m => ({ de: m[1], a: m[2], k: m[3] }));
if (!flux.length) bad('no s\'ha trobat cap lliurament: sense graf no hi ha res a analitzar');
else {
  const coneguts = new Set([...idsV, 'terra']);
  const morts = flux.filter(f => !coneguts.has(f.de) || !coneguts.has(f.a));
  if (!morts.length) ok(`${flux.length} lliuraments, tots entre rols que existeixen`);
  else bad(`${pl(morts.length, 'lliurament apunta', 'lliuraments apunten')} a un rol que no hi és: ` +
    morts.slice(0, 4).map(f => f.de + '→' + f.a).join(', '));

  const toca = new Set(flux.flatMap(f => [f.de, f.a]));
  const sols = [...idsV].filter(i => !toca.has(i));
  if (!sols.length) ok('i cap rol es queda sense lliuraments');
  else bad(`${pl(sols.length, 'rol solt', 'rols solts')} al mapa: ${sols.join(', ')} — ` +
    'un node que no dona ni rep res no és un rol, és una decoració');

  const t = flux.filter(f => f.k === 't').length, i = flux.filter(f => f.k === 'i').length;
  if (t && i) ok(`${t} lliuraments que es veuen i ${i} que no — les dues menes hi són`);
  else bad('falta una de les dues menes de lliurament: el mapa deixa de ser un VNA');
}

/* ── 5 · El dibuix de la portada, i no només les seves dades ──────────────
   La regla 4 mira el graf **declarat a `vna.html`** i diu que cap rol s'hi
   queda sol. Era certa, i la portada ensenyava igualment dos cercles solts:
   les **mans** i els **laterals**, dibuixats sense cap línia. `vna.html`
   declarava els seus quatre lliuraments cap als segons —són qui els aguanta,
   el primer cordó de la pinya— i el dibuix no en pintava cap.

   El defecte és el de sempre en aquesta casa: **una guarda que mira les dades
   no veu el dibuix.** Un node sense cap aresta no peta, no desquadra cap
   comptador i es llegeix com una decoració — que és exactament el contrari del
   que aquest mapa vol demostrar.

   Es comprova per geometria i no per etiquetes perquè les arestes són `<path>`
   sense identificador: de cada node se'n treu el centre i el radi, de cada
   camí els seus extrems, i es demana que **cada node tingui algun extrem a
   tocar**. No diu si l'aresta va on toca —això ho sap qui sap de castells—,
   però sí que no n'hi falta cap. */
/* ⚠ **Aquesta comprovació s'ha retirat amb el seu dibuix** (04/10/2026).
   `collaSvg` era a `#fentpinya`, a la portada, i era **la quarta vista dels
   mateixos dotze rols**: `/vna` ja en porta la planta (`VNA-PINYA`), la taula
   (`VNA-ROLS`) i el guió de nou passos (`#colla`). L'endreça el va treure.

   El que aquesta regla vigilava —**cap rol dibuixat sense cap línia que hi
   arribi**— segueix vigilat allà on viu el dibuix que queda: `build-castells.js`
   ho comprova sobre la planta, i ho fa per geometria i no per etiquetes, que
   és el motiu pel qual aquesta regla existia.

   Es deixa escrit i no s'esborra en silenci: una guarda que desapareix sense
   dir on ha anat la seva feina és una regla que ningú sap si es va decidir o
   es va perdre. */

/* ══ EL ZOOM · un sol graf i un sol gest ═════════════════════════════════════
   El mapa d'un node es dibuixava sol i **el que hi ha a dins es navegava per
   l'arbre del costat**: dues maneres d'ensenyar la mateixa jerarquia, i la que
   es llegeix com un mapa és la del graf.

   Tres coses han de seguir sent certes, i cap es veu mirant la pantalla:

   1. **Els llocs de dins es dibuixen.** `children()` ha d'arribar al llenç. Si
      un dia algú treu aquella crida, el mapa torna a ensenyar un sol nivell i
      **no peta**: es llegeix igual de bé i simplement ja no s'hi pot entrar.
   2. **Entrar-hi reusa `selectNode`.** Una segona manera de canviar de node
      divergiria de la primera —l'arbre, les rutes, el `state.expanded`— i el
      dia que passés, entrar per el mapa i entrar per l'arbre deixarien l'app en
      dos estats diferents.
   3. **Hi ha camí de tornada.** Un zoom sense sortida és un cul-de-sac, que és
      la veda 62. La molla de pa surt d'`ancestors`, que ja hi era.

   I una que és la lectura i no la mecànica: **cada lloc ha de dir què hi
   trobaràs abans d'entrar-hi** (`zoomDins`). Entrar en un lloc buit sense
   saber-ho és el que fa que la gent deixi de clicar. */
{
  const app = require('node:fs').readFileSync(
    require('node:path').join(__dirname, '..', 'index.html'), 'utf8');
  const svg = (app.match(/function buildVNASvg\(node\)\{[\s\S]*?\n\}/) || [''])[0];
  const molla = (app.match(/function vnaMolla\(node\)\{[\s\S]*?\n\}/) || [''])[0];
  const li = [];
  if (!svg) li.push('no es troba `buildVNASvg`');
  else {
    if (!/children\(node\.id\)/.test(svg)) li.push('el llenç no llegeix `children()`: el mapa torna a ensenyar un sol nivell');
    /* Llegir-los no és pintar-los. Es va provar traient la crida que els penja
       del dibuix i **la guarda deia que tot anava bé**: `children()` seguia
       escrit, calculat i sense arribar a la pantalla. És la mateixa classe de
       defecte que el marcatge viu amb el CSS a l'altra pàgina. */
    if ((svg.match(/appendChild\(zoom\(\)\)/g) || []).length < 2)
      li.push('`zoom()` es calcula i no s\'enganxa al dibuix als dos casos (amb rols i sense): '
        + 'es llegirien els fills i no es veurien');
    if (!/selectNode\(c\.id\)/.test(svg)) li.push('entrar en un lloc no passa per `selectNode`');
    if (!/zoomDins\(c\)/.test(svg)) li.push('els llocs no diuen què hi trobaràs abans d\'entrar-hi');
    /* La forma distingeix el que es pot clicar. Un lloc és un rectangle rodó i
       un rol un cercle: si tots dos fossin cercles, clicar-ne un faria dues
       coses diferents sense avisar. */
    if (!/mk\('rect'/.test(svg)) li.push('els llocs es dibuixen amb la mateixa forma que els rols');
    /* I amb teclat. Un `<g>` amb `onclick` i sense `tabindex` és un botó que
       només existeix per a qui té ratolí, i no peta mai. */
    if (!/tabindex/.test(svg) || !/keydown/.test(svg))
      li.push('els llocs no s\'obren amb teclat: un `g` amb `onclick` i sense `tabindex` no és un botó');
  }
  if (!molla) li.push('no es troba `vnaMolla`: el zoom no tindria camí de tornada');
  else if (!/ancestors\(node\.id\)/.test(molla)) li.push('la molla de pa no surt d\'`ancestors`');
  else if (!/selectNode\(n\.id\)/.test(molla)) li.push('la molla de pa no torna enlloc');
  /* L'estil ha d'existir a la pàgina, no només el marcatge. És el defecte que
     ja va passar amb els polsos del mapa de valor: marcatge viu i CSS a l'altra
     pàgina, i setze camins invisibles que no feien res. */
  if (!/\.vna-molla\{/.test(app)) li.push('falta el CSS de `.vna-molla`: la molla existiria i no es veuria');
  if (!/\.vna-zn\{cursor:pointer\}/.test(app)) li.push('falta el CSS de `.vna-zn`: els llocs no dirien que es poden clicar');
  if (li.length) bad('el zoom del mapa: ' + li.join(' · '));
  else ok('el zoom: els llocs de dins es dibuixen, diuen què hi trobaràs, s\'obren amb teclat i tenen camí de tornada');
}

/* ══ EL TERRA TIPOGRÀFIC ═════════════════════════════════════════════════════
   La pàgina tenia **32 declaracions per sota de 0,8rem** i les més petites a
   0,58rem —nou píxels i mig— dins de la peça que ven el producte més car de la
   casa. Es va arreglar mirant-la, i mirant-la és com tornaria a caure: una
   regla nova amb `font-size:.72rem` no peta, no desquadra res i es llegeix
   malament només per a qui ja hi veu just.

   Es mesura **el full d'estil de la pàgina**, no el del menú: el menú el
   genera `build-nav.js` i viu a vint-i-tres pàgines, de manera que pujar-lo és
   un canvi d'allà i no d'aquí. Hi ha entrada al backlog i el motiu escrit, que
   és el que distingeix una excepció d'un oblit. */
{
  const TERRA = 0.9375;           // 15 px
  /* El primer bloc d'estil és el de la pàgina; el segon és el del menú, que
     va dins de les marques `SOS-NAV` i no és d'aquest fitxer. */
  const estil = (PAG.match(/<style>([\s\S]*?)<\/style>/) || ['', ''])[1];
  if (!estil) bad('no es troba el full d\'estil de la pàgina: el terra tipogràfic no es pot mesurar');
  else {
    const rem = [...estil.matchAll(/font-size:\s*(\.\d+|\d+(?:\.\d+)?)rem/g)]
      .map(m => parseFloat(m[1])).filter(v => v < TERRA);
    /* I les mides en píxels, que a la pàgina només les porten els dibuixos:
       el full de la sessió i la planta. Allà el píxel és **una unitat del
       dibuix** i la mida de debò depèn de l'escala, de manera que es
       comproven contra l'amplada mínima que la pàgina els dona. */
    const px = [...estil.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)].map(m => parseFloat(m[1]));
    const min = (estil.match(/\.se-svg\{min-width:(\d+)px\}/) || [0, 620])[1];
    const petits = px.filter(v => v * (1040 / 640) < 15 && v < 15);
    if (rem.length) bad(`${pl(rem.length, 'mida de lletra', 'mides de lletra')} per sota de 15 px al CSS `
      + `de /vna: ${[...new Set(rem)].sort().join('rem, ')}rem — el terra és ${TERRA}rem `
      + 'i es va posar perquè la pàgina en tenia 32 per sota');
    else if (petits.length) bad(`${pl(petits.length, 'mida', 'mides')} de dibuix que no arriba a 15 px `
      + `renderitzada: ${[...new Set(petits)].join('px, ')}px (el full s'ensenya a 1040 px d'ample)`);
    else ok(`el terra tipogràfic: cap mida per sota de ${TERRA}rem, i les dels dibuixos arriben a 15 px`);
    void min;
  }
}

/* ══ EL LLENÇ · que els quatre gestos facin alguna cosa ══════════════════════
   Les quatre coses que la pàgina ven —dues vistes, focus, zoom i seqüència—
   acaben totes en una classe de CSS. **Cap peta si desapareix**: el dibuix es
   queda igual de maco i els botons deixen de fer res, que és el defecte que
   aquesta casa ja ha pagat tres vegades (els polsos invisibles, les claus
   mortes del pressupost, els laterals sense línia).

   Es comprova que el marcatge, l'estil i el codi hi siguin **els tres**: amb
   dos de tres, la pàgina es publica i no es veu. */
{
  const li = [];
  const hi = (re, q) => { if (!re.test(PAG)) li.push(q); };
  // 1 · Les dues vistes, i que el commutador les enllaci de debò.
  hi(/id="lz-mapa"/, 'falta el panell de la vista mapa');
  hi(/id="lz-castell"/, 'falta el panell de la vista castell');
  hi(/data-vista="castell"/, 'falta el botó de la vista castell');
  hi(/querySelectorAll\('\.lz-t'\)/, 'el commutador de vistes no té qui l\'escolti');
  hi(/pan\.hidden = !on/, 'el commutador no amaga el panell que no toca: dues pestanyes que no canvien res');
  // 2 · El focus, i el camí de tornada a veure-ho tot.
  hi(/data-foc=""/, 'falta el botó de «veure-ho tot»: un focus sense sortida és un cul-de-sac');
  hi(/\.mv-svg\.focus \.mv-n,/, 'falta el CSS del focus: les classes s\'hi posarien i no s\'apagaria res');
  hi(/function focusNode/, 'els nodes del dibuix no es poden mirar d\'un en un');
  // 3 · El zoom, amb molla de pa i teclat.
  hi(/data-tornar/, 'el zoom no té camí de tornada (veda 62)');
  hi(/class="lz-molla"/, 'falta la molla de pa');
  hi(/data-dins="/, 'cap node del dibuix s\'obre: el zoom del mètode no hi és');
  hi(/data-dins="[\w-]+" tabindex="0" role="button"/,
    'els nodes que s\'obren no són botons: un `g` amb `onclick` i sense `tabindex` només existeix per a qui té ratolí');
  hi(/class="mv-dinsn"/, 'els nodes que s\'obren no diuen què hi trobaràs abans d\'entrar-hi');
  hi(/\.mv-obre\{cursor:pointer\}/, 'falta el CSS de `.mv-obre`: els nodes que s\'obren no dirien que es poden clicar');
  // 4 · La seqüència: l'atribut al dibuix, el CSS que l'encén i el codi.
  hi(/data-seq="\w+:\d+"/, 'cap fletxa diu en quin pas passa: la passa 4 del mètode torna a ser només text');
  hi(/data-seq="sempre"/, 'cap lliurament marcat «sempre»: el que no entra a la seqüència és l\'argument del cas');
  hi(/\.mv-svg\.seq \.mv-f\.pas\{/, 'falta el CSS del recorregut: els passos es marcarien i no es veurien');
  hi(/class="sq-l"/, 'la seqüència no té llista de passos, i sense llista no es pot recórrer a mà');
  hi(/prefers-reduced-motion/, 'el recorregut s\'engega sol i no hi ha regla per a qui ha demanat que res no es mogui');
  if (li.length) bad('el llenç: ' + li.join(' · '));
  else ok('el llenç: les dues vistes es canvien de debò, el focus apaga i torna, el zoom entra '
    + 'i surt amb teclat, i la seqüència té atribut, estil i llista');
}

/* ══ CAP LECTURA DEL DIBUIX PEL COLOR ════════════════════════════════════════
   «Només el camí del canal» triava els rols **comparant el `stroke` del cercle
   amb un hex escrit al JavaScript**. El dia que la paleta va passar a clar, la
   comparació no va trobar cap rol: el botó quedava premut, el dibuix no es
   movia i **no petava res**. Ho va trobar una prova de navegador.

   El color és una decisió de pell i canvia; el camí, la mena i el pas són
   dades del mapa i viatgen com a `data-…`. Una lectura que mira el color
   torna a trencar-se el dia de la pell següent. */
{
  const COL = /(getAttribute\(\s*['"](?:stroke|fill)['"]\s*\)|\.style\.(?:stroke|fill)|getPropertyValue\(\s*['"](?:stroke|fill)['"]\s*\))[^;\n]{0,80}(===?|!==?)[^;\n]{0,40}['"]#?[0-9a-fA-F]{3,8}['"]/;
  const js = (PAG.match(/<script\b[^>]*>([\s\S]*?)<\/script>/g) || []).join('\n');
  if (COL.test(js)) {
    bad('una lectura del dibuix compara el color d\'un traç amb un literal: '
      + 'el dia que canviï la paleta deixarà de trobar res i no petarà. '
      + 'El camí, la mena i el pas van a `data-cami`, `data-mena` i `data-seq`.');
  } else if (!/data-cami="/.test(PAG)) {
    bad('cap node del dibuix porta `data-cami`: el focus per camí no té de què llegir-lo');
  } else ok('cap lectura del dibuix depèn d\'un color: el camí, la mena i el pas són dades');
}

/* ══ LES DUES LLENGÜES ═══════════════════════════════════════════════════════
   La pàgina tenia **dos** `data-i18n` a tot el fitxer —els del menú generat— i
   cap commutador, i era l'única del lloc que no es podia llegir en castellà.
   No petava perquè `check-i18n.js` mira l'app i no aquesta pàgina.

   Dues regles, i la segona és la que troba el que la primera no veu:

   1. **Els dos diccionaris diuen les mateixes claus.** Una clau en un i no en
      l'altre deixa el català escrit al marcatge, i això es llegeix com si la
      traducció hi fos.
   2. **Cap clau òrfena.** Una clau que surt **només als dos diccionaris** i
      enlloc més del fitxer és morta: ningú la demana. És la regla que al
      pressupost va trobar-ne divuit. */
{
  /* Cada llengua té **dos** blocs: el de `build-mapavalor.js` i el de les
     claus que `build-castells.js` hi deixa amb la planta i els rols. Llegir-ne
     només un diria que la meitat de les claus del marcatge no tenen entrada. */
  const dic = M => {
    const ks = [];
    /* Tres blocs i no dos: amb l'endreça (04/10/2026), el mapa de la xarxa de
       la casa viu aquí i porta el seu diccionari (`VNA-XA-I18N`). Amb la
       llista vella, quaranta-set claus seves sortien com a «sense entrada». */
    [`VNA-I18N-${M}`, `VNA-XA-I18N-${M}`, `VNA-CT-I18N-${M}`].forEach(n => {
      const a = PAG.indexOf(`/*${n}*/`), b = PAG.indexOf(`/*/${n}*/`);
      if (a < 0 || b <= a) return;
      [...PAG.slice(a, b).matchAll(/^\s*'([^']+)':/gm)].forEach(m => ks.push(m[1]));
    });
    return ks.length ? ks : null;
  };
  const ca = dic('CA'), es = dic('ES');
  if (!ca || !es) bad('no es troben els dos diccionaris de /vna: la pàgina no es pot comprovar');
  else if (!ca.length) bad('el diccionari català de /vna és buit');
  else {
    const li = [];
    const fa = (a, b, q) => { const f = a.filter(k => !b.includes(k)); if (f.length) li.push(`${f.length} ${q}: ${f.slice(0, 4).join(', ')}`); };
    fa(ca, es, 'clau(s) sense castellà');
    fa(es, ca, 'clau(s) sense català');
    /* La clau que no demana ningú. Es compta quantes vegades surt al fitxer:
       dues vol dir «una a cada diccionari i cap al marcatge». */
    const morts = ca.filter(k => (PAG.split(`'${k}'`).length - 1) <= 2
      && !PAG.includes(`data-i18n="${k}"`) && !PAG.includes(`data-i18n-html="${k}"`)
      && !PAG.includes(`data-i18n-al="${k}"`));
    if (morts.length) li.push(`${morts.length} clau(s) que no demana ningú: ${morts.slice(0, 5).join(', ')}`);
    /* I al revés: una clau al marcatge sense entrada deixa el text escrit a mà
       i la pàgina es queda mig traduïda sense dir-ho. */
    const demanades = [...PAG.matchAll(/data-i18n(?:-html|-al)?="([^"]+)"/g)].map(m => m[1])
      .filter(k => !/^nv\./.test(k));          // les del menú, que són d'un altre diccionari
    const sense = [...new Set(demanades)].filter(k => !ca.includes(k));
    if (sense.length) li.push(`${sense.length} clau(s) al marcatge sense entrada: ${sense.slice(0, 5).join(', ')}`);
    if (!/class="lang-b/.test(PAG)) li.push('no hi ha commutador de llengua');
    if (!/tt_lang/.test(PAG)) li.push('el commutador no comparteix `tt_lang` amb la resta del lloc');
    if (li.length) bad('les dues llengües de /vna: ' + li.join(' · '));
    else ok(`les dues llengües: ${ca.length} claus a cada diccionari, cap òrfena i cap sense entrada`);
  }
}

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} al mapa de valor.`
  : '\n✅ El mapa de valor i la portada diuen el mateix.');
process.exit(fails ? 1 : 0);
