#!/usr/bin/env node
/* El terra de 15 px · cap text per sota a les pàgines que venen
 * ─────────────────────────────────────────────────────────────────────────────
 * La pell declara `--t0` = 0,9375rem = 15 px com **el mínim de tot el lloc**, i
 * la barra ja el compleix amb guarda. Però entre la barra i el peu cada pàgina
 * té el seu `<style>`, i el 10/10/2026 s'hi van comptar **més de tres-centes
 * mides escrites a mà per sota del terra** a les pàgines de les tres ofertes:
 * etiquetes a 9,3 px, notes a 10,4, llegendes a 11. Res d'això peta. Es llegeix
 * malament, sobretot al mòbil, i és exactament el que la guia de marca (§7)
 * diu que no es negocia.
 *
 * Aquesta guarda llegeix el CSS **propi** de cada pàgina —fora dels blocs
 * generats, que tenen el seu generador i la seva guarda— i peta per qualsevol
 * `font-size` (o `font:` abreujat, o el mínim d'un `clamp()`) per sota del
 * terra, i pels `style="font-size:…"` del marcatge.
 *
 * ── El que no compta, i per què ─────────────────────────────────────────────
 * · Els blocs generats `<!--TT-…-->`: els vigila el seu generador.
 * · Els `<script>`: hi ha fulls d'estil d'**altres documents** (la web del
 *   client que exporta l'editor, la fitxa imprimible) que no són aquesta pàgina.
 * · Les regles que només pinten **text dins d'un SVG**: allà la mida és en
 *   unitats del `viewBox` i el dibuix s'escala, de manera que «11px» no vol dir
 *   11 píxels a la pantalla. Es declaren a `SVG`, selector per selector i amb
 *   el motiu: una excepció sense motiu escrit és un descuit.
 *
 * Ús:  node SOS/tools/check-terra.js
 */
'use strict';
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const { PAGINES_LLOC, CARPETES } = require('./build-nav.js');

/* Les pàgines que venen una de les tres ofertes: les quatre d'arrel, les de
   `SOS/` que porten la barra del lloc, la formació, que és la tercera oferta
   encara que porti la barra del SOS, i les dues carpetes de «La teva web». */
const PAGINES = ['index.html', 'cataleg.html', 'qui-som.html', 'premsa.html', 'avis-legal.html']
  .concat(PAGINES_LLOC.map(p => 'SOS/' + p), ['SOS/formacio.html'], Object.values(CARPETES));

/* Les regles que només pinten text de dibuixos SVG, amb el motiu. */
const SVG = {
  'index.html': {
    '.ct-et': 'Etiquetes del dibuix dels castells: només <text> dins del SVG (viewBox), s\'escalen amb el dibuix.',
    '.ct-est': 'Comptadors del dibuix dels castells: només <text> dins del SVG.',
    '.pl-nom': 'Noms dels nodes de la planta: només <text> dins del SVG (viewBox 0 0 400 400).'
  },
  'SOS/vna.html': {
    '.mv-dinsn': 'Nom dins del node del mapa: <text> del SVG.',
    '.se-abast': 'Abast de la seqüència: <text> del SVG.',
    '.se-peu': 'Peu del dibuix de la seqüència: <text> del SVG.',
    '.se-po text': 'Text dels punts de la seqüència: <text> del SVG.',
    '.se-po.centre text': 'Text del punt central: <text> del SVG.',
    '.se-et text': 'Etiquetes de la seqüència: <text> del SVG.',
    '.se-cor': 'Retol del cor de la seqüència: <text> del SVG.'
  },
  'SOS/vna-suport.html': {
    '.ed-svg .mv-dinsn': 'Nom dins del node a l\'editor: <text> del SVG del llenç.',
    '.ed-svg .ed-nb text': 'Número del node: <text> del SVG.',
    '.ed-svg .ed-num text': 'Ordre de la seqüència: <text> del SVG.',
    '.ed-svg .ed-etq-t': 'Etiqueta d\'un lliurament: <text> del SVG.',
    '.ed-svg .ed-ins': 'Indicació dins del llenç: <text> del SVG.',
    '.ed-svg .ed-gomet text': 'Gomet de zona calenta: <text> del SVG.',
    '.ed-svg .ed-mes text': 'Botó «+» del node: <text> del SVG.',
    '.ed-svg .ed-port text': 'Port d\'un node: <text> del SVG.',
    '.ed-svg .ed-fant-t': 'Rol fantasma proposat: <text> del SVG.'
  },
  'mapa-web/index.html': {
    '.n .s, .n .s-embudo': 'Subtítol de cada rol al mapa de la xarxa: <text> del SVG.',
    '.n-centro text': 'Nom del negoci al centre del mapa: <text> del SVG.',
    '.red-svg .solo-embudo': 'Retol de la vista «embut»: <text> del SVG.',
    '.red-svg .b-duda text': 'Signe del gomet de dubte: <text> del SVG.'
  }
};

const TERRA_PX = 15;
let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };

/* La mida en píxels d'un valor CSS, o null si no es pot saber sense context
   (`em` i `%` depenen del pare: es tracten a part). */
const px = (n, u) => u === 'rem' ? n * 16 : u === 'px' ? n : null;

/* Les mides que una declaració fixa per sota del terra. */
function petites(decl) {
  const out = [];
  const mides = [];
  /* `font-size: X` i `font: … X/…` */
  let m = decl.match(/^\s*font-size\s*:\s*(.+)$/i);
  if (m) mides.push(m[1]);
  m = decl.match(/^\s*font\s*:\s*(.+)$/i);
  if (m) { const s = m[1].match(/(?:^|\s)((?:\d*\.)?\d+(?:rem|px|em|%))(?:\/|\s|$)/); if (s) mides.push(s[1]); }
  mides.forEach(v => {
    v = v.trim().replace(/\s*!important$/, '');
    /* D'un clamp() compta el mínim, que és el que es veu al mòbil; d'un
       max() també; d'un min() qualsevol dels termes pot guanyar. */
    const c = v.match(/^clamp\(\s*([^,]+),/i) || v.match(/^max\(\s*([^,]+),/i);
    const vals = c ? [c[1]] : (/^min\(/i.test(v) ? v.slice(4, -1).split(',') : [v]);
    vals.forEach(x => {
      const n = x.trim().match(/^((?:\d*\.)?\d+)(rem|px|em|%)$/);
      if (!n) return;
      const num = parseFloat(n[1]), u = n[2];
      const p = px(num, u);
      if (p !== null && p < TERRA_PX - 0.01) out.push(x.trim());
      /* `em` i `%` per sota d'1: el text queda més petit que el del pare, i el
         pare de la major part del text és el cos a --t1 o el terra a --t0. */
      if (u === 'em' && num < 0.9375 - 0.001) out.push(x.trim());
      if (u === '%' && num < 93.75 - 0.01) out.push(x.trim());
    });
  });
  return out;
}

const troballes = {};
let total = 0;
PAGINES.forEach(rel => {
  const f = join(ARREL, rel);
  if (!existsSync(f)) { bad(`no existeix ${rel}`); return; }
  let src = readFileSync(f, 'utf8');
  src = src.replace(/<!--((?:TT|SOS)-[A-Z0-9-]+)-->[\s\S]*?<!--\/\1-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '');
  const llista = [];
  const exc = SVG[rel] || {};
  const usades = new Set();
  [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].forEach(st => {
    const css = st[1].replace(/\/\*[\s\S]*?\*\//g, '');
    /* Regla a regla, també dins de `@media`: el selector és el text just abans
       de la clau. */
    for (const r of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const sel = r[1].trim().replace(/\s+/g, ' ');
      r[2].split(';').forEach(d => {
        const p = petites(d);
        if (!p.length) return;
        if (exc[sel]) { usades.add(sel); return; }
        llista.push(`${sel} → ${p.join(', ')}`);
      });
    }
  });
  /* Els `style=""` del marcatge. */
  for (const m of src.matchAll(/style="([^"]*)"/g)) {
    m[1].split(';').forEach(d => {
      const p = petites(d);
      if (p.length) llista.push(`style="${m[1].slice(0, 40)}…" → ${p.join(', ')}`);
    });
  }
  /* Una excepció escrita per a un selector que ja no hi és menteix. */
  Object.keys(exc).filter(s => !usades.has(s))
    .forEach(s => bad(`${rel}: l'excepció SVG «${s}» ja no correspon a cap regla petita: sobra`));
  if (llista.length) { troballes[rel] = llista; total += llista.length; }
});

console.log('\nEl terra de 15 px · les pàgines de les tres ofertes');
Object.entries(troballes).forEach(([rel, l]) =>
  bad(`${rel}: ${l.length} mida(es) per sota del terra — ${l.slice(0, 4).join(' · ')}${l.length > 4 ? ` … (+${l.length - 4})` : ''}`));
if (!total) ok(`les ${PAGINES.length} pàgines: cap text propi per sota de 15 px` +
  (Object.keys(SVG).length ? ` (i ${Object.values(SVG).reduce((a, o) => a + Object.keys(o).length, 0)} regles de dibuix SVG, amb el motiu)` : ''));

/* I la tipografia es serveix des de casa. Amb el <link> a Google Fonts, cada
   visita feia arribar l'adreça IP a Google sense cap necessitat: els mateixos
   fitxers ja eren a SOS/fonts/ per al SOS. L'avís legal (10/10/2026) diu que
   no passa, i aquesta guarda és el que ho manté cert. */
console.log('\nLa tipografia, servida des del lloc');
/* Més `home-nova.html`, que no entra al terra però la genera build-vitrina.js. */
const google = PAGINES.concat(['home-nova.html']).filter(rel => existsSync(join(ARREL, rel))
  && /fonts\.(googleapis|gstatic)\.com/.test(readFileSync(join(ARREL, rel), 'utf8')));
if (google.length) google.forEach(rel =>
  bad(`${rel}: carrega Google Fonts — fes servir <link rel="stylesheet" href="/SOS/fonts/fonts.css">`));
else ok(`les ${PAGINES.length + 1} pàgines: cap petició a Google Fonts`);

console.log(fails ? `\n❌ ${total} mida(es) per sota del terra. Fes servir var(--t0) o més: el terra és 15 px.`
  : '\n✅ Cap text per sota del terra a les pàgines que venen.');
process.exit(fails ? 1 : 0);
