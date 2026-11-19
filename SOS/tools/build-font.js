#!/usr/bin/env node
/* La font i la colla · les dades de la pel·lícula
 * ─────────────────────────────────────────────────────────────────────────────
 * L'Àlvar (16/11/2026): «TeamTowers, equips de torres; l'aigua, la font al mig
 * del castell que dona la vida; el castell és un arbre amb totes les
 * ramificacions, i el mapa mental també és un arbre. Una animació amb totes
 * les vistes que ja tenim perquè, només veient-la, s'entengui el valor que
 * aportem en fer el mapa de valor.» I, de seguida: «una rengla és una filera de
 * persones del centre cap enfora, una línia de força per àrea […] veig el mapa
 * i entenc els forats, el que em falta i, per tant, el que s'ha d'ocupar».
 *
 * Aquí no es declara cap dada. Es llegeix el que ja és a la matriu:
 *   · el mapa de valor de la xarxa de l'aigua solar
 *     (`knowledge/vision/aigua-solar-xarxa.md`, taula «De | A | Tangible |
 *     Intangible de tornada») i les seves troballes numerades;
 *   · les cinc capes del cervell (`cervell/teamtowers.json`, que surt del codex).
 * I s'escriu `SOS/lib/font-dades.js`, que és el que pinta `SOS/lib/font-anima.js`.
 *
 *   node SOS/tools/build-font.js           escriu les dades
 *   node SOS/tools/build-font.js --check   falla si no són les que sortirien ara
 */
'use strict';
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const FONT = 'SOS/knowledge/vision/aigua-solar-xarxa.md';
const CERVELL = 'SOS/cervell/teamtowers.json';
const DESTI = join(ARREL, 'SOS', 'lib', 'font-dades.js');

const md = readFileSync(join(ARREL, FONT), 'utf8');
const fails = [];

/* La taula del mapa: cada fila és un parell, el tangible d'anada i
   l'intangible de tornada. */
const linies = md.split('\n');
const cap = linies.findIndex(l => /^\|\s*De\s*\|\s*A\s*\|\s*Tangible\s*\|/.test(l));
if (cap < 0) fails.push(`${FONT}: no hi trobo la taula «| De | A | Tangible | …»`);
const rols = [], fluxos = [];
const rol = n => { if (rols.indexOf(n) < 0) rols.push(n); return n; };
for (let i = cap + 2; cap >= 0 && i < linies.length && /^\|/.test(linies[i]); i++) {
  const c = linies[i].split('|').slice(1, -1).map(s => s.trim());
  if (c.length < 4 || c.some(x => !x)) { fails.push(`${FONT}: fila ${i + 1} incompleta`); continue; }
  const [de, a, tang, intang] = c;
  fluxos.push({ de: rol(de), a: rol(a), mena: 'tangible', que: tang });
  fluxos.push({ de: a, a: de, mena: 'intangible', que: intang });
}

/* Les troballes: «1. **La frase.** El per què.» Cada una s'enganxa al rol o
   al lliurament que anomena, si n'anomena cap. */
const baixa = s => s.toLowerCase().replace(/[’']/g, "'");
const tr = md.slice(md.indexOf('Les troballes'));
const troballes = [];
const re = /^\d+\.\s+\*\*(.+?)\*\*\s*([\s\S]*?)(?=\n\d+\.\s|\n\n)/gm;
let m;
while ((m = re.exec(tr))) {
  const t = m[1].trim(), d = m[2].replace(/\s+/g, ' ').trim();
  const bt = baixa(t);
  const r = rols.filter(n => bt.includes(baixa(n)));
  const f = fluxos.map((x, i) => (bt.includes(baixa(x.que)) ? i : -1)).filter(i => i >= 0);
  troballes.push({ t, d, rols: r, fluxos: f, ningu: /ningú|no és de ningú/.test(bt) });
}
if (!troballes.length) fails.push(`${FONT}: no hi trobo les troballes numerades`);

const C = JSON.parse(readFileSync(join(ARREL, CERVELL), 'utf8'));
const capes = C.capes.map(c => ({ id: c.id, vedes: C.vedes.filter(v => v[1] === c.id).length }));
if (capes.length !== 5) fails.push(`${CERVELL}: esperava cinc capes i n'hi ha ${capes.length}`);

if (rols.length < 3 || fluxos.length < 4) fails.push(`${FONT}: massa poc mapa (${rols.length} rols, ${fluxos.length} lliuraments)`);
if (fails.length) { fails.forEach(f => console.error('✗ ' + f)); process.exit(1); }

const D = { font: FONT, cervell: CERVELL, rols, fluxos, troballes, capes };
const surt = '/* GENERAT per SOS/tools/build-font.js · no s\'edita a mà.\n'
  + `   Font: ${FONT} i ${CERVELL}. */\n`
  + '(function (g) { g.FontDades = ' + JSON.stringify(D, null, 1).replace(/\n\s*/g, ' ') + '; })(typeof window !== \'undefined\' ? window : this);\n';

if (process.argv.includes('--check')) {
  if (!existsSync(DESTI) || readFileSync(DESTI, 'utf8') !== surt) {
    console.error('✗ SOS/lib/font-dades.js és vell: el mapa de l\'aigua o el codex han canviat. Torna a fer  node SOS/tools/build-font.js');
    process.exit(1);
  }
  console.log(`✓ La font i la colla: ${rols.length} rols, ${fluxos.length} lliuraments i ${troballes.length} troballes, del mapa de l'aigua.`);
} else {
  writeFileSync(DESTI, surt);
  console.log(`✅ SOS/lib/font-dades.js: ${rols.length} rols, ${fluxos.length} lliuraments i ${troballes.length} troballes.`);
}
