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
const svg = (PORTADA.match(/<svg id="collaSvg"[\s\S]*?<\/svg>/) || [''])[0];
if (!svg) bad('no es troba el dibuix de la colla a la portada: aquesta comprovació no pot mirar res');
else {
  const nodes = [...svg.matchAll(/data-id="(\w+)"[\s\S]{0,160}?<circle cx="(\d+)"\s+cy="(\d+)" r="(\d+)"/g)]
    .map(m => ({ id: m[1], x: +m[2], y: +m[3], r: +m[4] }));
  /* Els extrems de cada camí: el primer `M` i l'últim parell de coordenades.
     Val tant per a rectes (`L`) com per a corbes (`Q`), que és el que hi ha. */
  const punts = [];
  [...svg.matchAll(/<path d="M([\d.]+),([\d.]+)[^"]*?([\d.]+),([\d.]+)"/g)].forEach(m => {
    punts.push([+m[1], +m[2]], [+m[3], +m[4]]);
  });
  if (!nodes.length || !punts.length) bad('no s\'han pogut llegir els nodes o les arestes del dibuix de la portada');
  else {
    const aprop = n => punts.some(p => Math.hypot(p[0] - n.x, p[1] - n.y) <= n.r + 14);
    const solts = nodes.filter(n => !aprop(n));
    if (!solts.length) ok(`i al dibuix de la portada els ${nodes.length} rols tenen alguna línia que hi arriba`);
    else bad(`${pl(solts.length, 'rol dibuixat sense cap línia', 'rols dibuixats sense cap línia')} a la portada: `
      + solts.map(n => n.id).join(', ') + ' — al dibuix són decoració, encara que les dades diguin que no ho són');
  }
}

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} al mapa de valor.`
  : '\n✅ El mapa de valor i la portada diuen el mateix.');
process.exit(fails ? 1 : 0);
