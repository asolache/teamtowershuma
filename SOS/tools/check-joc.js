#!/usr/bin/env node
/* Guarda del joc · les caselles diuen projectes que existeixen
 * ─────────────────────────────────────────────────────────────────────────
 * A la plaça de `SOS/joc.html` hi ha caselles de bonus que porten el nom d'un
 * projecte del SOS —MATRIU, Biblioteca de les Coses, Banc de Temps— i plantar-hi
 * registra una **aportació**. Aquell catàleg és una còpia deliberada de
 * `DYNAMICS` de `SOS/index.html`: el joc és un HTML autocontingut i no pot
 * carregar l'app. Dues còpies deliberades divergeixen en silenci —és el que va
 * passar amb els herois del Comando i el que va costar la veda 109—, i aquí la
 * divergència és pitjor que de costum: la casella seguiria dient un nom que
 * sona a projecte de veritat i ja no ho seria.
 *
 * Es comprova:
 *
 *   1. Cada casella (`proj`, `nom`, `ic`) surt **literalment** a `DYNAMICS`.
 *   2. L'ordre de desbloqueig conté totes les dinàmiques i cap de més, i comença
 *      per una que no costa hores: si comencés per una de pagament, la partida
 *      naixeria bloquejada i no ho notaria ningú fins a jugar-hi.
 *   3. Cada `bonus` declarat té una branca a `aplicaBonus()`. Un bonus escrit i
 *      no implementat és una casella que promet i no dona.
 *   4. Les aportacions arriben al model: hi ha el comptador a la capçalera i
 *      algun nivell les demana. Si no, són una xifra decorativa.
 *
 * Veda 118.
 *
 * Ús:  node SOS/tools/check-joc.js
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const APP = readFileSync(join(ARREL, 'SOS', 'index.html'), 'utf8');
const JOC = readFileSync(join(ARREL, 'SOS', 'joc.html'), 'utf8');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

console.log('\nGuarda del joc · caselles d\'aportació i passos del tauler');

/* ── 1 · Les caselles són projectes del catàleg ─────────────────────────── */
const RE_VAL = /\{proj:'([a-z_]+)',nom:'((?:[^'\\]|\\.)*)',ic:'([^']*)',bonus:'(\w+)'/g;
const caselles = [...JOC.matchAll(RE_VAL)].map(m => ({
  proj: m[1], nom: m[2], ic: m[3], bonus: m[4] }));

const declarades = (JOC.match(/\{proj:'[a-z_]+',nom:'/g) || []).length;
if (!caselles.length) {
  /* Sense poder llegir el catàleg no es diu «tot bé»: es diu que s'és cec. */
  bad('no es troba cap casella de valor a joc.html: aquesta guarda no pot comprovar res');
  console.log('\n❌ 1 problema al joc.');
  process.exit(1);
}
if (caselles.length !== declarades) {
  bad(`el lector n'ha entès ${caselles.length} de ${declarades}: el format ha canviat i la guarda s'ha quedat cega`);
} else ok(`${pl(caselles.length, 'casella declarada', 'caselles declarades')} al joc`);

const fora = caselles.filter(v =>
  !APP.includes(`{id:'${v.proj}',name:'${v.nom}',icon:'${v.ic}'`));
if (!fora.length) ok('i totes surten a DYNAMICS de l\'app amb el mateix nom i la mateixa icona');
else bad(`${pl(fora.length, 'casella no coincideix', 'caselles no coincideixen')} amb DYNAMICS: ` +
  fora.map(v => `${v.proj} («${v.nom}» ${v.ic})`).join(', ') +
  ' — o s\'ha canviat el nom a l\'app, o el joc anomena un projecte que no existeix');

/* ── 2 · L'ordre de desbloqueig ─────────────────────────────────────────── */
/* Només el bloc DINS: `VILANS` té la mateixa forma i, sense acotar, la guarda
   es queixava que els supervilans no es desbloquegen mai. */
const blocDins = (JOC.match(/const DINS=\{[\s\S]*?\n\};/) || [''])[0];
const dinsIds = [...blocDins.matchAll(/^\s{2}(\w+):\{nom:'(?:[^'\\]|\\.)*',ic:'/gm)].map(m => m[1]);
const ordre = ((JOC.match(/const DESBLOQUEIG=\[([^\]]*)\]/) || [])[1] || '')
  .split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean);

if (!dinsIds.length || !ordre.length) {
  bad('no es troben les dinàmiques o l\'ordre de desbloqueig: la guarda no els pot comparar');
} else {
  const falten = dinsIds.filter(d => !ordre.includes(d));
  const sobren = ordre.filter(d => !dinsIds.includes(d));
  const repes = ordre.filter((d, i) => ordre.indexOf(d) !== i);
  if (!falten.length && !sobren.length && !repes.length)
    ok(`l'ordre de desbloqueig conté les ${ordre.length} dinàmiques, cada una un cop`);
  else bad('l\'ordre de desbloqueig no quadra amb les dinàmiques' +
    (falten.length ? ` · no s'obren mai: ${falten.join(', ')}` : '') +
    (sobren.length ? ` · no existeixen: ${sobren.join(', ')}` : '') +
    (repes.length ? ` · repetides: ${repes.join(', ')}` : ''));

  const cost = (JOC.match(new RegExp(`${ordre[0]}:\\{nom:'(?:[^'\\\\]|\\\\.)*',[^}]*?cost:(\\d+)`)) || [])[1];
  if (cost === '0') ok(`i comença per «${ordre[0]}», que no costa hores: el primer moviment és possible`);
  else bad(`la primera dinàmica desbloquejada («${ordre[0]}») costa ${cost} hores: ` +
    'la partida naixeria sense poder fer res');
}

/* ── 3 · Cada bonus fa alguna cosa ──────────────────────────────────────── */
const cos = (JOC.match(/function aplicaBonus\([\s\S]*?\n\}/) || [''])[0];
if (!cos) bad('no es troba aplicaBonus(): no es pot saber si els bonus fan res');
else {
  const orfes = [...new Set(caselles.map(v => v.bonus))]
    .filter(b => !cos.includes(`V.bonus==='${b}'`));
  if (!orfes.length) ok(`els ${new Set(caselles.map(v => v.bonus)).size} bonus declarats tenen branca a aplicaBonus()`);
  else bad(`${pl(orfes.length, 'bonus promès i no fet', 'bonus promesos i no fets')}: ${orfes.join(', ')} — ` +
    'una casella que promet i no dona és pitjor que no tenir-hi casella');
}

/* ── 4 · Les aportacions arriben al model ───────────────────────────────── */
if (/id="pApo"/.test(JOC)) ok('el comptador d\'aportacions és a la capçalera');
else bad('no hi ha comptador d\'aportacions a la capçalera: no es veuen enlloc');

if (/cal:\{[^}]*aportacions:\d+/.test(JOC))
  ok('i algun nivell en demana: compten per pujar, no són decoració');
else bad('cap nivell demana aportacions: registrar-les no serveix de res i el joc ' +
  'ensenyaria que aportar és opcional');

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} al joc.`
  : '\n✅ El joc anomena projectes que existeixen i els passos s\'obren en ordre.');
process.exit(fails ? 1 : 0);
