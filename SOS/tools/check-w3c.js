#!/usr/bin/env node
/* Guarda W3C · el mínim que tota pàgina del lloc i del SOS compleix
 * ─────────────────────────────────────────────────────────────────────────────
 * Revisió DRY i W3C del 02/11/2026 (pla-disseny.md §6). El que es mesura sense
 * navegador, sobre el marcatge tal com surt del repositori (sense <script>,
 * <style> ni comentaris):
 *
 *   1. `<html lang>`, `<meta name="viewport">` i un `<title>` amb text.
 *   2. Un sol `<h1>` per pàgina (les excepcions, amb el perquè).
 *   3. Cap `id` repetit: un `aria-labelledby` o un `<label for>` que apunta a
 *      un id doble llegeix el primer, i no se sap quin és.
 *   4. Cap `<img>` sense `alt` (buit si és decoració).
 *   5. Les pàgines amb la barra del lloc (`<!--/TT-NAV-->`) tenen `<main>`.
 *   6. Cada camp de formulari que es veu té nom per a qui no hi veu: un
 *      `<label for>`, un `<label>` que l'embolcalla, `aria-label`,
 *      `aria-labelledby` o `title`. El `placeholder` no compta: desapareix en
 *      escriure i molts lectors no el llegeixen. Els formularis amagats
 *      (`hidden`, els de Netlify) i els camps `hidden` no es veuen.
 *
 * Ús:  node SOS/tools/check-w3c.js
 */
'use strict';
const { readFileSync, readdirSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };

/* Les pàgines: les d'arrel, les carpetes amb index.html i les del SOS. */
const pagines = [];
readdirSync(ARREL, { withFileTypes: true }).forEach(e => {
  if (e.isFile() && e.name.endsWith('.html')) pagines.push(e.name);
  else if (e.isDirectory() && !/^(\.|node_modules|blog$)/.test(e.name) && existsSync(join(ARREL, e.name, 'index.html')))
    pagines.push(e.name + '/index.html');
});
readdirSync(join(ARREL, 'SOS')).filter(f => f.endsWith('.html')).forEach(f => pagines.push('SOS/' + f));

/* Sense un sol <h1>, i per què. */
const SENSE_H1 = {
  'SOS/intro.html': 'és una pantalla d\'entrada a pantalla completa, sense document',
  'SOS/joc.html': 'és un joc a pantalla completa',
  'SOS/blog.html': 'porta el títol en català i en castellà, i se\'n veu un',
  'v3/index.html': 'prototip antic de portada, fora del menú',
  'v4/index.html': 'prototip antic de portada, fora del menú'
};

const net = s => s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<!--[\s\S]*?-->/g, '');

let camps = 0, ids = 0;
pagines.sort().forEach(p => {
  const s = readFileSync(join(ARREL, p), 'utf8'), b = net(s), mal = [];
  if (!/<html[^>]*\blang="[a-z]{2}/i.test(s)) mal.push('sense <html lang>');
  if (!/<meta[^>]*name="viewport"/i.test(s)) mal.push('sense viewport');
  if (!/<title>[^<\s][^<]*<\/title>/i.test(s)) mal.push('sense <title>');
  /* Les pàgines amb la barra del lloc porten el contingut dins <main>, perquè
     el lector pugui saltar la barra d'un sol cop. */
  if (s.includes('<!--/TT-NAV-->') && !/<main\b/i.test(b)) mal.push('sense <main>');
  const h1 = (b.match(/<h1\b/gi) || []).length;
  if (h1 !== 1 && !SENSE_H1[p]) mal.push(h1 + ' <h1>');
  const vist = {}, dobles = [];
  (b.match(/\sid="[^"]+"/g) || []).forEach(x => { const k = x.slice(5, -1); if (vist[k]) dobles.push(k); vist[k] = 1; });
  ids += Object.keys(vist).length;
  if (dobles.length) mal.push('id repetit: ' + [...new Set(dobles)].join(', '));
  const sensAlt = (b.match(/<img\b[^>]*>/gi) || []).filter(i => !/\balt=/i.test(i)).length;
  if (sensAlt) mal.push(sensAlt + ' <img> sense alt');
  /* Els camps: fora els formularis amagats i el que ja embolcalla un <label>. */
  const fors = new Set([...b.matchAll(/<label\b[^>]*\bfor="([^"]+)"/gi)].map(m => m[1]));
  const visibles = b.replace(/<form\b[^>]*\shidden[\s>][\s\S]*?<\/form>/gi, '').replace(/<label\b[\s\S]*?<\/label>/gi, '');
  const muts = [];
  for (const m of visibles.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)) {
    const a = m[2];
    if (/type="(hidden|submit|button|reset|image)"/i.test(a) || /\shidden(\s|=|$)/.test(a)) continue;
    camps++;
    const id = (a.match(/\bid="([^"]+)"/) || [])[1];
    if (/aria-label(ledby)?=|\btitle="/.test(a) || (id && fors.has(id))) continue;
    muts.push(id || m[1]);
  }
  if (muts.length) mal.push('camps sense nom: ' + muts.join(', '));
  if (mal.length) bad(p + ': ' + mal.join(' · '));
});
if (!fails) ok(`${pagines.length} pàgines amb llengua, viewport, títol i un sol <h1> (${Object.keys(SENSE_H1).length} excepcions dites)`);
if (!fails) ok(`${ids} ids sense cap repetit, cap imatge sense alt i ${camps} camps amb nom`);
console.log(fails ? `\n❌ ${fails} pàgines no passen el mínim W3C.` : '\n✅ El mínim W3C, a totes les pàgines.');
process.exit(fails ? 1 : 0);
