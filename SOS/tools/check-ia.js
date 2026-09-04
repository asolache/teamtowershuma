#!/usr/bin/env node
/* Guarda de la pàgina d'IA · que el que hi promet segueixi sent veritat
 * ─────────────────────────────────────────────────────────────────────────
 * `SOS/ia.html` és l'única pàgina de la casa que ven **el que fem amb IA**, i
 * per això és l'única on una promesa falsa costa diners i credibilitat alhora.
 * En diu quatre coses molt concretes:
 *
 *   1. Que els frens de l'IA existeixen al repositori i es poden anar a mirar.
 *   2. Que la prova del mètode és aquest mateix repositori, i n'enumera peces.
 *   3. Que es venen uns paquets, que estan al catàleg.
 *   4. Que el preu surt del mapa de cost.
 *
 * Les quatre es poden tornar falses sense que peti res: es reanomena una
 * pàgina, es retira un paquet del catàleg, es canvia una àncora. Aquesta
 * guarda comprova que cada porta que la pàgina obre porti on diu.
 *
 * Ús:  node SOS/tools/check-ia.js
 */
'use strict';
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const SOS = join(__dirname, '..');
const ARREL = join(SOS, '..');
const src = readFileSync(join(SOS, 'ia.html'), 'utf8');
const portada = readFileSync(join(ARREL, 'index.html'), 'utf8');
const { PAQUETS, SOS_PAQUETS } = require('./build-oferta.js');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

console.log('\nGuarda de la pàgina d\'IA · ia.html');

/* El text visible, sense estils ni scripts ni comentaris: el que llegeix una
   persona i no el que hi hem escrit per a nosaltres. */
const visible = src.replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '');

/* ── 1 · Les dues menes de flux, totes dues ───────────────────────────────
   La tesi de la pàgina és que es decideixen junts. Si un dia en queda una
   sola, la pàgina ven automatització i prou —que és el que tothom ven. */
const teTang = /class="flux tang"/.test(src), teIntang = /class="flux intang"/.test(src);
if (teTang && teIntang) ok('hi són els dos fluxos: tangible i intangible');
else bad(`falta el flux ${!teTang ? 'tangible' : 'intangible'} — la tesi de la pàgina és que es decideixen junts`);

/* ── 2 · Els quatre frens ─────────────────────────────────────────────────
   Són el que distingeix aquesta oferta de la de qualsevol altre. Menys de
   quatre i el que queda és una declaració d'intencions. */
const frens = (src.match(/class="fre"/g) || []).length;
if (frens >= 4) ok(`${frens} frens declarats`);
else bad(`només ${frens} frens: sense els quatre, «IA amb frens» és una frase`);

/* ── 3 · Cap porta a un lloc que no existeix ──────────────────────────────
   La regla de la casa, i aquí compta doble: la pàgina diu «es pot anar a
   mirar» i qui hi vagi ha de trobar-ho. */
const enllacos = [...visible.matchAll(/href="([^"#][^"]*?)"/g)].map(m => m[1])
  .filter(h => !/^https?:|^mailto:/.test(h));
const trencats = [...new Set(enllacos)].filter(h => {
  const net = h.split('#')[0];
  if (!net) return false;
  return !existsSync(join(SOS, net));
});
if (!enllacos.length) bad('la pàgina no enllaça res: si diu que es pot anar a mirar, ha de portar-hi');
else if (!trencats.length) ok(`${new Set(enllacos).size} enllaços interns, tots a un fitxer que existeix`);
else bad(`${pl(trencats.length, 'enllaç', 'enllaços')} a un fitxer que no hi és (${trencats.join(', ')})`);

/* ── 4 · Els paquets que ven són al catàleg ───────────────────────────────
   La pàgina enllaça fitxes de la portada per l'àncora. Si un paquet es retira
   o es reanomena, aquests clics baixen fins al peu i no passa res més. */
const ids = [...new Set([...src.matchAll(/index\.html#pk-([a-z0-9-]+)/g)].map(m => m[1]))];
const alCataleg = new Set(PAQUETS.concat(SOS_PAQUETS).map(p => p.id));
const fantasmes = ids.filter(id => !alCataleg.has(id));
if (!ids.length) bad('la pàgina no enllaça cap paquet: qui hi arriba no sap què contractar');
else if (!fantasmes.length) ok(`${ids.length} paquets enllaçats, tots al catàleg`);
else bad(`${pl(fantasmes.length, 'paquet enllaçat no existeix', 'paquets enllaçats no existeixen')} (${fantasmes.join(', ')}) — el clic no va enlloc`);

/* I al revés: la família «digital» del catàleg s'ha de poder explicar des
   d'aquí. Un paquet que es ven i que cap pàgina explica és un paquet que ningú
   entén prou per comprar-lo. */
const digitals = PAQUETS.filter(p => p.fam === 'digital');
const muts = digitals.filter(p => !ids.includes(p.id));
if (!digitals.length) bad('no hi ha cap paquet de la família digital al catàleg');
else if (!muts.length) ok(`els ${digitals.length} paquets de «Digital i IA» s'expliquen en aquesta pàgina`);
else bad(`${pl(muts.length, 'paquet digital no s\'explica', 'paquets digitals no s\'expliquen')} enlloc (${muts.map(p => p.id).join(', ')})`);

/* ── 5 · El mapa de cost, i que hi sigui ──────────────────────────────────
   La pàgina remet a `#cost` de la portada. Si la secció desaparegués, el peu
   diria on es calcula el preu i no portaria a res. */
if (!/index\.html#cost/.test(src)) bad('la pàgina no diu d\'on surt el preu: ha de portar al mapa de cost');
else if (/id="cost"/.test(portada)) ok('remet al mapa de cost de la portada, que hi és');
else bad('remet a #cost de la portada i allà no hi ha cap secció amb aquest id');

/* ── 6 · Les paraules que la guia de marca prohibeix ──────────────────────
   Una pàgina que ven IA és on més fàcil és caure-hi. */
const PROHIBIDES = [
  [/disruptiu|disruptiva|disruptivo/i, 'disruptiu'],
  [/solucions innovadores/i, 'solucions innovadores'],
  [/revolucion(a|ari)/i, 'revolucionari'],
  [/empoderament\b(?!\s+(de|per|dels|de les))/i, 'empoderament sense objecte']
];
const dites = PROHIBIDES.filter(([re]) => re.test(visible)).map(([, n]) => n);
if (!dites.length) ok('cap paraula de fullet al text visible');
else bad(`${pl(dites.length, 'paraula prohibida', 'paraules prohibides')} per la guia de marca: ${dites.join(', ')}`);

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} a la pàgina d'IA.` : '\n✅ La pàgina d\'IA quadra.');
process.exit(fails ? 1 : 0);
