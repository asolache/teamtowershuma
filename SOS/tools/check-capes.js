#!/usr/bin/env node
/* Guarda de la veda 188 · les cinc capes es diuen amb paraules de tothom.
 *
 *  1. `SOS/lib/capes.js` té les cinc capes, amb paraula en cada llengua, i cap
 *     paraula no és el nom sànscrit.
 *  2. Cap pàgina ni codi de vista no escriu el nom sànscrit d'una capa, fora
 *     dels llocs que expliquen l'origen.
 *  3. Cap fitxer de vista no té una llista pròpia de paraules de capa: totes
 *     surten de capes.js (veda 71).
 *
 * Ús: node SOS/tools/check-capes.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ARREL = path.join(__dirname, '..', '..');
const C = require('../lib/capes.js');
const errors = [];

/* 1 · La font. */
if (C.CAPES.length !== 5) errors.push('capes.js ha de tenir cinc capes, en té ' + C.CAPES.length);
C.CAPES.forEach(c => C.LLENGUES.forEach(ll => {
  const w = c.nom[ll];
  if (!w) errors.push('capes.js: la capa ' + c.id + ' no té paraula en ' + ll);
  else if (w.toLowerCase() === c.s.toLowerCase()) errors.push('capes.js: la paraula de ' + c.id + ' en ' + ll + ' és el sànscrit');
}));

/* Els llocs que expliquen l'origen, o que en guarden la dada, poden dir-lo. */
const PERMESOS = new Set([
  'SOS/lib/capes.js', 'SOS/cervell/codex-parse.js', 'SOS/cervell/teamtowers.json',
  'SOS/blog.html', 'SOS/vedes.html'
]);
/* A cervell.html, només dins la secció que ho explica. */
const SECCIO = { 'SOS/cervell.html': /<section class="koshes"[\s\S]*?<\/section>/ };

const SANSCRIT = new RegExp('\\b(' + C.CAPES.map(c => c.s).join('|') + ')\\b');
const LLISTA = /\b(?:vijnana|discerniment)\s*:\s*'(?:Criteri|Criterio|Discerniment|Discernimiento)'/;

function fitxers(dir, filtre) {
  const d = path.join(ARREL, dir);
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d).filter(filtre).map(f => path.join(dir, f).split(path.sep).join('/'));
}
const html = f => f.endsWith('.html');
const js = f => f.endsWith('.js');
const RUTES = [
  ...fitxers('.', html), ...fitxers('SOS', html), ...fitxers('cliente', html), ...fitxers('cliente', js),
  ...fitxers('SOS/cervell', js), ...fitxers('SOS/lib', js)
];

RUTES.forEach(r => {
  let text = fs.readFileSync(path.join(ARREL, r), 'utf8');
  if (!PERMESOS.has(r)) {
    if (SECCIO[r]) text = text.replace(SECCIO[r], '');
    const m = text.match(SANSCRIT);
    if (m) errors.push(r + ': diu «' + m[1] + '» fora de l\'explicació de l\'origen. Fes servir Capes.nom() (SOS/lib/capes.js).');
  }
  if (r !== 'SOS/lib/capes.js' && LLISTA.test(text)) errors.push(r + ': té una llista pròpia de paraules de capa. Llegeix-les de SOS/lib/capes.js.');
});

if (errors.length) {
  console.error('✗ Les capes (veda 188):\n  · ' + errors.join('\n  · '));
  process.exit(1);
}
console.log('✓ Les capes es diuen amb paraules de tothom a ' + RUTES.length + ' fitxers (veda 188)');
