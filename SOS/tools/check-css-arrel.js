#!/usr/bin/env node
/* Guarda del CSS de les pàgines d'arrel · el que cap prova veurà mai.
 *
 * **Una secció que marxa s'emporta el seu CSS.** És la mateixa regla que
 * `check-landing.js` aplica a les guardes, i falla de la mateixa manera: en
 * silenci. Una regla que anomena una classe que ja no és a la pàgina no peta,
 * no es veu i no pinta res — només pesa. A la portada n'hi havia **85, 10 KB**,
 * el rastre de seccions retirades en rondes anteriors sense el seu estil:
 * `.repte-veus` del repte que va marxar al SOS, `.oferta-card` del catàleg
 * d'abans dels paquets, `.sos-grid`, `.tx-card`, `.pull-quote`.
 *
 * I l'error contrari, que és el car: **una classe que el marcatge fa servir i
 * el CSS no declara**. Això sí que es veu —el bloc surt sense estil— però
 * només si algú obre aquella pàgina, i és exactament el que passa quan una
 * secció es muda a una pàgina nova i l'estil es queda a la vella.
 *
 * Ús:  node SOS/tools/check-css-arrel.js
 */
'use strict';
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');

/* Les pàgines d'arrel que es vigilen, i les que no, amb el motiu escrit.
   `home-nova.html`, `finances.html`, `ia.html` i `premsa.html` són maquetes
   anteriors que no es publiquen des del menú: entrarien amb centenars de
   troballes i cap d'elles seria feina d'avui. */
const PAGINES = ['index.html', 'cataleg.html', 'qui-som.html', 'premsa.html'];
const FORA = {
  'home-nova.html': 'maqueta alternativa, fora del menú i de la pell',
  'finances.html': 'pàgina interna, no enllaçada des del menú',
  'ia.html': 'pàgina interna, no enllaçada des del menú'
};

let fails = 0;
const bad = m => { console.error('  ✗ ' + m); fails++; };
const ok = m => console.log('  ✓ ' + m);
const pl = (n, u, p) => `${n} ${n === 1 ? u : p}`;
const mostra = l => l.slice(0, 6).join(', ') + (l.length > 6 ? `, i ${l.length - 6} més` : '');

/* ── Llegir el full d'estil i el marcatge ──────────────────────────────────
   **Tots** els `<style>` de la pàgina, i no el primer. Aquesta guarda llegia
   només el del `<head>`, i el 04/10/2026 la barra única va passar a portar el
   seu CSS **dins del seu bloc generat, al cos** —que és el que impedeix que
   torni a haver-hi vint-i-set còpies que divergeixen. Amb un sol `<style>`
   llegit, les classes de la barra sortien «usades i estilades en una altra
   pàgina»: la guarda acusava precisament el patró que la casa fa servir.

   I el CSS es treu del cos abans de buscar-hi classes: `.lang-b.on{…}` dins
   d'un `<style>` no és marcatge, i comptar-lo com a tal fa que una regla es
   doni per viva només perquè s'ha escrit. */
function parteix(src) {
  if (src.indexOf('<style>') < 0) return null;
  const css = [...src.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const cos = src.slice(src.indexOf('<body'), src.lastIndexOf('</body>'))
    .replace(/<style>[\s\S]*?<\/style>/g, '');
  return { css, cos };
}

/* Les regles, una per una. Es camina caràcter a caràcter i no amb una
   expressió regular perquè un comentari pot portar claus a dins —i n'hi ha,
   amb exemples de codi— i una regla dins d'una `@media` no és una regla
   d'arrel. */
function regles(css) {
  const out = [];
  let prof = 0, buf = '', i = 0;
  while (i < css.length) {
    if (css.startsWith('/*', i)) { const j = css.indexOf('*/', i) + 2; buf += css.slice(i, j); i = j; continue; }
    const c = css[i];
    buf += c;
    if (c === '{') prof++;
    else if (c === '}') { prof--; if (prof === 0) { out.push(buf); buf = ''; } }
    i++;
  }
  if (buf.trim()) out.push(buf);
  /* Una `@media` és una capsa de regles: s'obre i es miren les de dins. */
  const pla = [];
  out.forEach(r => {
    const cap = r.split('{')[0].trim();
    if (/^@(media|supports)/.test(cap)) pla.push(...regles(r.slice(r.indexOf('{') + 1, r.lastIndexOf('}'))));
    else pla.push(r);
  });
  return pla;
}

/* Els noms que el marcatge o el codi poden anomenar. Es mira ample a posta:
   val més deixar passar una regla morta que acusar-ne una de viva. */
function anomenats(cos) {
  const n = new Set();
  for (const m of cos.matchAll(/class="([^"]*)"/g)) m[1].split(/\s+/).forEach(c => c && n.add(c));
  for (const m of cos.matchAll(/id="([^"]+)"/g)) n.add('#' + m[1]);
  /* El JavaScript construeix classes amb cadenes: `classList.add('on')`,
     `querySelectorAll('.pk-f')`, `'pk-' + id`. Qualsevol literal curt que
     sembli una llista de noms compta com a ús. */
  for (const m of cos.matchAll(/['"`]([^'"`\n]{1,160})['"`]/g)) {
    const t = m[1];
    for (const x of t.matchAll(/(?<![\w-])\.([a-zA-Z][\w-]*)/g)) n.add(x[1]);
    for (const x of t.matchAll(/(?<![\w-])#([a-zA-Z][\w-]*)/g)) n.add('#' + x[1]);
    if (/^[\w\s-]+$/.test(t)) t.split(/\s+/).forEach(c => c && n.add(c));
  }
  return n;
}

const noms = sel => {
  const s = sel.replace(/\/\*[\s\S]*?\*\//g, '');
  const c = [...s.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m => m[1]);
  const i = [...s.matchAll(/#([a-zA-Z][\w-]*)/g)].map(m => '#' + m[1]);
  return [...c, ...i];
};

console.log('\nGuarda del CSS de les pàgines d\'arrel');

const estat = {};
PAGINES.forEach(f => {
  const ruta = join(ARREL, f);
  if (!existsSync(ruta)) return bad(`no existeix ${f}`);
  const p = parteix(readFileSync(ruta, 'utf8'));
  if (!p) return bad(`${f} no té full d'estil en línia: aquesta guarda no pot mirar res`);
  const declarats = new Set();
  const rs = regles(p.css).map(r => {
    const sel = r.split('{')[0].replace(/\/\*[\s\S]*?\*\//g, '').trim();
    return { sel, n: (!sel || sel.startsWith('@')) ? [] : noms(sel), b: r.length };
  });
  rs.forEach(r => r.n.forEach(x => declarats.add(x)));
  const alMarcatge = new Set();
  for (const m of p.cos.matchAll(/class="([^"]*)"/g)) m[1].split(/\s+/).forEach(c => c && alMarcatge.add(c));
  estat[f] = { rs, declarats, alMarcatge, vius: anomenats(p.cos) };
});

/* ── 1 · Cap regla que no pinti res ───────────────────────────────────────
   És el rastre d'una secció retirada sense el seu estil. No peta, no es veu i
   no pinta res: només pesa. */
/* Els components comuns (`build-components.js`) no compten: el bloc és el
   mateix a totes les pàgines a posta, i una pàgina sense targetes porta la
   regla de la targeta igual que una pàgina sense taules porta el reset de les
   taules. Demanar-li que se la tregui seria demanar-li que torni a tenir la
   seva còpia. */
const { NOMS: COMPONENTS } = require('./build-components.js');
const comuna = r => r.n.every(x => COMPONENTS.includes(x));
Object.entries(estat).forEach(([f, e]) => {
  const orfes = [];
  let bytes = 0;
  e.rs.forEach(r => {
    if (!r.n.length || comuna(r)) return;
    if (!r.n.some(x => e.vius.has(x))) { orfes.push(r.sel.slice(0, 48)); bytes += r.b; }
  });
  if (!orfes.length) ok(`${f}: cap regla de CSS que no pinti res`);
  else bad(`${f}: ${pl(orfes.length, 'regla de CSS no pinta res', 'regles de CSS no pinten res')} `
    + `(${(bytes / 1024).toFixed(1)} KB) — ${mostra(orfes)}. Una secció que marxa s'emporta el seu CSS.`);
});

/* ── 2 · L'estil no es pot quedar a l'altra pàgina ────────────────────────
   La manera concreta com aquesta endreça pot trencar coses en silenci: una
   secció es muda a una pàgina nova i el seu bloc de CSS es queda a la vella.
   El marcatge és correcte, la guarda de dalt és verda a les dues bandes, i el
   bloc surt sense estil — i això només ho veu qui obri aquella pàgina.

   Per això es compara **entre pàgines** i no dins d'una: una classe que una
   pàgina fa servir i una altra estila, i la seva no, és exactament això. Les
   classes que no estila ningú no hi entren: són ganxos de JavaScript i marques
   per a les proves, no estils que s'hagin perdut pel camí. */
const totEstilat = new Set();
Object.values(estat).forEach(e => e.declarats.forEach(x => totEstilat.add(x)));
let perdudes = 0;
Object.entries(estat).forEach(([f, e]) => {
  const sense = [...e.alMarcatge]
    .filter(c => !e.declarats.has(c) && totEstilat.has(c))
    .sort();
  if (sense.length) {
    perdudes += sense.length;
    const on = sense.map(c => {
      const altra = Object.keys(estat).find(g => g !== f && estat[g].declarats.has(c));
      return `${c} (l'estila ${altra})`;
    });
    bad(`${f}: ${pl(sense.length, 'classe es fa servir aquí i s\'estila en una altra pàgina', 'classes es fan servir aquí i s\'estilen en una altra pàgina')}: `
      + `${mostra(on)} — el bloc hi és i surt sense estil`);
  }
});
if (!perdudes) ok(`cap pàgina fa servir una classe que una altra estila i ella no`);

const fores = Object.keys(FORA);
ok(`${pl(fores.length, 'pàgina queda', 'pàgines queden')} fora amb el motiu escrit: `
  + fores.map(f => `${f} (${FORA[f]})`).join(' · '));

if (fails) { console.error(`\n❌ ${pl(fails, 'problema', 'problemes')} al CSS de l'arrel.\n`); process.exit(1); }
console.log('\n✅ Cada regla de CSS pinta alguna cosa, i cap estil s\'ha quedat a l\'altra pàgina.\n');
