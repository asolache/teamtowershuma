#!/usr/bin/env node
/* La pell · una paleta declarada un cop, escrita a totes les pàgines
 * ─────────────────────────────────────────────────────────────────────────────
 * Hi havia **la mateixa paleta copiada a vint-i-nou fitxers**, amb tres jocs de
 * noms diferents i derives que ningú havia decidit: `--card` amb quatre valors
 * (#111118, #191926, #1a1a28), `--bg` amb dos, `--muted` amb dos, `--border`
 * amb tres. Cap d'aquestes diferències volia dir res: són el rastre de
 * vint-i-tres pàgines escrites en moments diferents copiant la del costat.
 *
 * Això no peta mai. El que fa és que **cap canvi de pell sigui possible**: per
 * passar el lloc a clar calia editar vint-i-nou blocs a mà i esperar no
 * deixar-se'n cap, que és exactament com es perden les coses en aquesta casa.
 *
 * ── Per què clar, i per què ara ─────────────────────────────────────────────
 * `/vna` va passar a clar i editorial el 03/10/2026 perquè és on viu el
 * producte, i el referent no és una pantalla d'aplicació sinó **el full de
 * paper d'estrassa de la sala**. La resta del lloc públic hi va al darrere.
 *
 * **L'aplicació (`SOS/index.html`) no.** És una altra superfície: una eina que
 * s'obre cada dia i no una pàgina que es llegeix un cop, té la seva barra i és
 * al 99 % del seu sostre de pes. Un lloc clar i una eina fosca és una decisió,
 * no un oblit, i per això consta escrita aquí i a `FORA_DE_LA_PELL`.
 *
 * ── Els contrastos, comprovats i no triats a ull ────────────────────────────
 * Tots els colors de text sobre `--bg` passen AA (≥ 4,5:1), i es van mesurar
 * abans d'escriure'ls, no després:
 *
 *   --light 9,1:1 · --intang 6,8:1 · --indigo 6,1:1 · --blue 5,7:1
 *   --gold 5,3:1 · --red 5,2:1 · --muted 5,2:1 · --green 5,1:1 · --orange 4,8:1
 *
 * Els de la portada fosca —#00b0ff, #e040fb, #00e676— no arribaven ni a 3:1
 * sobre paper: estaven triats per brillar damunt de negre. Canviar el fons
 * sense canviar-los hauria deixat mig lloc il·legible **sense que res petés**.
 *
 * ── L'escala, que és el terra de 15 px ──────────────────────────────────────
 * `--t0` és 0,9375rem = 15 px i és **el mínim de tot el lloc**. Surt de `/vna`,
 * que en tenia trenta-dues declaracions per sota i la més petita a 9,5 px dins
 * de la peça que ven el producte més car de la casa.
 *
 * ── Ús ──────────────────────────────────────────────────────────────────────
 *   node SOS/tools/build-pell.js            escriu la paleta a totes
 *   node SOS/tools/build-pell.js --check    falla si alguna ha derivat
 */
'use strict';
const { readFileSync, writeFileSync, existsSync, readdirSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const SOS = join(ARREL, 'SOS');
const CHECK = process.argv.includes('--check');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

/* ══ LA PALETA ═══════════════════════════════════════════════════════════════
   Els noms són els que ja feien servir vint-i-una pàgines. No es reanomenen
   aquí: canviar `--text` per `--tinta` a tot arreu seria un canvi de sis-centes
   línies que no es veu, i barrejar-lo amb el canvi de pell faria impossible
   llegir quina de les dues coses ha trencat res.

   Dos noms que ara menteixen una mica i es queden igualment, amb el motiu:
   **`--light`** vol dir «text secundari» i sobre paper és més fosc que el
   principal; **`--panel`** i **`--card`** s'han intercanviat el paper (la
   targeta és la més clara, no la més fosca). Reanomenar-los va al backlog. */
const PELL = [
  ['--bg', '#fbfaf7', 'el paper'],
  ['--panel', '#f4f1ea', 'el fons d\'un bloc'],
  ['--card', '#ffffff', 'una targeta, que és el més clar'],
  ['--text', '#15130f', 'la tinta'],
  ['--light', '#4a463e', 'text secundari · 9,1:1'],
  ['--muted', '#5e594d', 'text apagat · 6,8:1 · i 5,7 sobre un fons tenyit'],
  ['--border', '#ddd7c8', 'la vora'],
  ['--border-strong', '#cac3b0', 'la vora que s\'ha de veure'],
  ['--indigo', '#4f46e5', '6,1:1'],
  ['--blue', '#005795', 'tangible · 6,2:1 · i 5,3 sobre un vel del seu to'],
  ['--purple', '#a3187f', 'intangible · 6,8:1'],
  ['--green', '#0c6640', '5,9:1 · i 5,4 sobre un vel del seu to'],
  ['--orange', '#9c4408', '5,9:1 · i 5,0 sobre --panel'],
  ['--red', '#c0392b', '5,2:1'],
  ['--gold', '#8a6000', '5,3:1'],
  /* El text **a sobre** d'un accent ple. Era `var(--white)`, i sobre fosc anava
     bé perquè volia dir «el color clar»: el mateix token servia per al text de
     la pàgina i per al d'un botó indi. Sobre paper es parteixen en dos —la
     pàgina vol tinta i el botó segueix volent blanc— i un sol nom per a dues
     coses deixava els botons a 3:1. */
  ['--on-accent', '#ffffff', 'text a sobre d\'un accent ple'],
  ['--mono', '\'SF Mono\',Monaco,Consolas,monospace', ''],
  /* L'escala. Cap text del lloc per sota de `--t0`, i hi ha guarda. */
  ['--t0', '.9375rem', '15 px · el terra'],
  ['--t1', '1.0625rem', '17 px · el cos'],
  ['--t2', '1.25rem', ''],
  ['--t3', 'clamp(1.3rem,2.4vw,1.65rem)', ''],
  ['--t4', 'clamp(1.75rem,4vw,2.6rem)', ''],
  ['--t5', 'clamp(2.1rem,6vw,3.5rem)', '']
];

/* ══ QUI LA PORTA, I QUI NO ══════════════════════════════════════════════════
   La llista és explícita a posta: afegir una pàgina ha de ser una decisió que
   inclogui dir de quin color és. */
const FORA_DE_LA_PELL = {
  'SOS/index.html': 'És l\'aplicació i no una pàgina: s\'obre cada dia, té barra pròpia i va al 99 % del seu sostre de pes. Fosca a posta.',
  'SOS/joc.html': 'És una pantalla de joc a pantalla completa, amb la seva pròpia atmosfera.',
  'home-nova.html': 'Esborrany de redisseny amb `noindex`. El genera `build-vitrina.js`.',
  'finances.html': 'Eina interna de comptes.',
  'ia.html': 'Prova d\'assistent. La pàgina pública és `/SOS/ia.html`.',
  'premsa.html': 'Pàgina de la generació anterior, amb paleta pròpia. Es refà o es retira a l\'endreça.'
};

/* Les pàgines de l'arrel es llegeixen del directori i no d'una llista escrita:
   `cataleg.html` i `qui-som.html` van néixer el 04/10/2026 i, amb una llista a
   mà, haurien nascut sense pell i amb la guarda verda. El que sí que és
   explícit és qui en queda fora, i per què. */
const PAGINES = [].concat(
  readdirSync(ARREL).filter(f => /\.html$/.test(f)),
  readdirSync(SOS).filter(f => /\.html$/.test(f)).map(f => 'SOS/' + f)
).filter(f => !FORA_DE_LA_PELL[f]).sort();

/* ══ EL BLOC ═════════════════════════════════════════════════════════════════ */
function bloc() {
  const ample = Math.max(...PELL.map(p => p[0].length));
  return PELL.map(([k, v, per]) =>
    `  ${k.padEnd(ample)}: ${v};${per ? '   /* ' + per + ' */' : ''}`).join('\n');
}

/* ══ ESCRIURE ════════════════════════════════════════════════════════════════
   Les marques van **dins del `:root`** de cada pàgina, i el que hi hagi fora
   d'elles és de la pàgina i no es toca: hi ha fitxers amb tokens propis que
   no són de la pell (`--retol` al Comando, `--normal` al directori). */
const OBRE = '/*TT-PELL*/', TANCA = '/*/TT-PELL*/';
let escrits = 0, vells = [], sense = [];

PAGINES.forEach(rel => {
  const f = join(ARREL, rel);
  if (!existsSync(f)) { bad('no existeix ' + rel); return; }
  const txt = readFileSync(f, 'utf8');
  const i = txt.indexOf(OBRE), j = txt.indexOf(TANCA);
  if (i < 0 || j <= i) { sense.push(rel); return; }
  const nou = OBRE + '\n' + bloc() + '\n' + TANCA;
  if (txt.slice(i, j + TANCA.length) === nou) return;
  vells.push(rel);
  if (!CHECK) { writeFileSync(f, txt.slice(0, i) + nou + txt.slice(j + TANCA.length)); escrits++; }
});

console.log('\nLa pell · una paleta, ' + PAGINES.length + ' pàgines');

if (sense.length) bad(`${pl(sense.length, 'pàgina', 'pàgines')} sense les marques ${OBRE}: `
  + sense.slice(0, 6).join(', ') + (sense.length > 6 ? ` … (+${sense.length - 6})` : ''));

/* ══ LA GUARDA QUE IMPORTA ═══════════════════════════════════════════════════
   Una pàgina pot portar les marques i **tornar a declarar un token de la pell
   per sota**, que és com es van produir les derives d'abans: algú copia el
   bloc del costat, hi canvia un valor i la pàgina queda diferent sense que
   ningú ho decideixi. Es compta fora de les marques. */
{
  const noms = PELL.map(p => p[0]);
  const dobles = [];
  PAGINES.forEach(rel => {
    const f = join(ARREL, rel);
    if (!existsSync(f)) return;
    const txt = readFileSync(f, 'utf8');
    const i = txt.indexOf(OBRE), j = txt.indexOf(TANCA);
    if (i < 0 || j <= i) return;
    const fora = txt.slice(0, i) + txt.slice(j + TANCA.length);
    /* Es busca **en qualsevol posició** i no a principi de línia: la paleta de
       `build-vedes.js` anava tota en una sola línia dins d'un `:root{…}` i
       aquesta guarda no la veia, de manera que la pàgina es quedava fosca i
       deia que tot anava bé. */
    const seus = noms.filter(n => new RegExp('[{;\\s]' + n + '\\s*:', '').test(fora));
    if (seus.length) dobles.push(`${rel} → ${seus.join(', ')}`);
  });
  if (dobles.length) bad(`${pl(dobles.length, 'pàgina redeclara', 'pàgines redeclaren')} tokens de la pell `
    + 'fora de les marques: ' + dobles.slice(0, 4).join(' · ')
    + ' — és així com es van produir les derives que aquest fitxer existeix per acabar');
  else ok('cap pàgina redeclara un token de la pell pel seu compte');
}

/* I que cap pàgina es quedi fora sense que algú ho hagi decidit. */
{
  const totes = [].concat(['index.html'], readdirSync(SOS).filter(f => /\.html$/.test(f)).map(f => 'SOS/' + f),
    readdirSync(ARREL).filter(f => /\.html$/.test(f) && f !== 'index.html'));
  const orfes = totes.filter(f => !PAGINES.includes(f) && !FORA_DE_LA_PELL[f]);
  if (orfes.length) bad(`${pl(orfes.length, 'pàgina', 'pàgines')} ni a la pell ni al registre de les que en queden fora: `
    + orfes.join(', ') + ' — una excepció sense motiu escrit és un descuit');
  else ok(`${PAGINES.length} pàgines amb la pell i ${Object.keys(FORA_DE_LA_PELL).length} fora, amb el motiu`);
}

if (CHECK) {
  if (vells.length) bad(`${pl(vells.length, 'pàgina té', 'pàgines tenen')} la pell vella: `
    + vells.slice(0, 6).join(', ') + ' — torna a executar build-pell.js');
  else if (!sense.length) ok('la paleta és la mateixa a totes');
} else if (escrits) ok(`paleta escrita a ${pl(escrits, 'pàgina', 'pàgines')}`);
else if (!sense.length) ok('la paleta ja hi era a totes');

console.log(fails ? '\n❌ La pell no quadra.'
  : `\n✅ La pell · ${PELL.length} tokens a ${PAGINES.length} pàgines` + (CHECK ? '.' : ` · ${escrits} escrita/es.`));
process.exit(fails ? 1 : 0);
