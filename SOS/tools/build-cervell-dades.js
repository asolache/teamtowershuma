#!/usr/bin/env node
/* El cervell de TeamTowers en dades · el que dibuixa la portada
 * ─────────────────────────────────────────────────────────────────────────────
 * Llegeix `SOS/knowledge/codex.md` amb el mateix lector que `SOS/cervell.html`
 * i la pàgina del cervell d'Álvaro (`SOS/cervell/codex-parse.js`) i n'escriu
 * `SOS/cervell/teamtowers.json`: cada veda amb el número, la kosha i el títol, i
 * les cites. La portada no pot carregar el codex sencer (uns 120 KB comprimit)
 * per dibuixar una franja; tampoc el pot copiar a mà, que es quedaria vell.
 *
 *   node SOS/tools/build-cervell-dades.js           escriu el JSON
 *   node SOS/tools/build-cervell-dades.js --check   falla si no és el que sortiria ara
 */
'use strict';
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const CP = require('../cervell/codex-parse.js');

const ARREL = join(__dirname, '..', '..');
const DESTI = join(ARREL, 'SOS', 'cervell', 'teamtowers.json');
const L = CP.lee(readFileSync(join(ARREL, CP.RUTA_CODEX), 'utf8'), { nom: 'tt' });
const num = id => +id.split(':')[1];
const J = {
  font: CP.RUTA_CODEX,
  capes: CP.CAPAS.map(c => ({ id: c.id, n: c.n, s: c.s })),
  vedes: L.nodos.map(n => [n.n, n.capa, n.t]),
  cites: CP.limpia(L.nodos, L.aristas).map(a => [num(a[0]), num(a[1])])
};
const surt = JSON.stringify(J) + '\n';
if (process.argv.includes('--check')) {
  if (!existsSync(DESTI) || readFileSync(DESTI, 'utf8') !== surt) {
    console.error('✗ SOS/cervell/teamtowers.json és vell: el codex ha canviat. Torna a fer  node SOS/tools/build-cervell-dades.js');
    process.exit(1);
  }
  console.log(`✓ El cervell de la portada és el del codex: ${J.vedes.length} vedes i ${J.cites.length} cites.`);
} else {
  writeFileSync(DESTI, surt);
  console.log(`✅ SOS/cervell/teamtowers.json: ${J.vedes.length} vedes i ${J.cites.length} cites.`);
}
