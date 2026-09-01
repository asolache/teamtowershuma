#!/usr/bin/env node
/* Guarda del programa d'escola · que sigui el SOS i no un joc amb el logotip
 * ─────────────────────────────────────────────────────────────────────────
 * `SOS/escola.html` diu una cosa forta: que la Fàbrica de Superherois **és el
 * SOS a mida d'aula**. Si això és cert, s'ha de poder comprovar; i si no ho és,
 * el programa és una manualitat amb la nostra marca a sobre, que és pitjor que
 * no tenir-ne.
 *
 * Aquesta guarda comprova les quatre coses que ho fan cert:
 *
 *   1. **Cada superpoder és una categoria de veritat del banc de temps.** Si un
 *      dia n'hi ha un que no ho és, el mapa de recursos de la classe deixa de
 *      ser un assaig del mapa d'un poble i passa a ser un invent.
 *   2. **Cada superarma és un tipus d'objecte de la biblioteca de les coses.**
 *   3. **No hi ha cap camp per al nom real d'un infant.** No és una casella que
 *      es pugui desmarcar: és que el camp no ha d'existir. I el que viatja a la
 *      IA és una llista tancada, `CAMPS_IA`, on cap clau pot ser un nom real.
 *   4. **La regla hi és escrita**: el cromo es dissenya i els superpoders es
 *      guanyen. Sense aquesta frase el programa es pot llegir com un concurs.
 *
 * Veda 114.
 *
 * Ús:  node SOS/tools/check-escola.js
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const APP = readFileSync(join(ARREL, 'SOS', 'index.html'), 'utf8');
const PAG = readFileSync(join(ARREL, 'SOS', 'escola.html'), 'utf8');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

console.log('\nGuarda del programa d\'escola · Fàbrica de Superherois');

/* ── Les llistes del SOS, que són les que manen ─────────────────────────── */
const catsSOS = new Set(
  [...(APP.match(/^const SKILL_POLARITY=\{[^}]*\}/m) || [''])[0].matchAll(/([a-z]+):/g)].map(m => m[1]));
const bloc = s => (PAG.match(new RegExp('^const ' + s + '=\\[[\\s\\S]*?\\n\\];', 'm')) || [''])[0];
const objBloc = (APP.match(/^const OBJECT_TOP20=\[[\s\S]*?\n\];/m) || [''])[0];
const tipusSOS = new Set([...objBloc.matchAll(/typ:'([a-z]+)'/g)].map(m => m[1]));

if (!catsSOS.size || !tipusSOS.size) {
  bad('no s\'han pogut llegir les llistes del SOS: aquesta guarda no pot comprovar res');
  console.log('\n❌ 1 problema.');
  process.exit(1);
}

/* ── 1 · Els superpoders són categories del banc de temps ───────────────── */
const poders = [...bloc('PODERS').matchAll(/\{id:'([^']+)',lbl:'((?:[^'\\]|\\.)*)',cat:'([^']+)'/g)]
  .map(m => ({ id: m[1], lbl: m[2].replace(/\\'/g, "'"), cat: m[3] }));
if (!poders.length) bad('no s\'ha trobat la llista PODERS a escola.html');
else {
  const forans = poders.filter(p => !catsSOS.has(p.cat));
  if (!forans.length) ok(`${poders.length} superpoders, tots amb categoria del banc de temps`);
  else bad(`${pl(forans.length, 'superpoder', 'superpoders')} amb una categoria que el SOS no té: ` +
    forans.map(p => `${p.id}→${p.cat}`).join(', ') +
    ' — llavors el mapa de la classe no assaja res');
  const dups = poders.map(p => p.id).filter((v, i, a) => a.indexOf(v) !== i);
  if (dups.length) bad('superpoders repetits: ' + dups.join(', '));
}

/* ── 2 · Les superarmes són objectes de la biblioteca ───────────────────── */
const armes = [...bloc('ARMES').matchAll(/\{id:'([^']+)',lbl:'((?:[^'\\]|\\.)*)',typ:'([^']+)'/g)]
  .map(m => ({ id: m[1], typ: m[3] }));
if (!armes.length) bad('no s\'ha trobat la llista ARMES a escola.html');
else {
  const forans = armes.filter(a => !tipusSOS.has(a.typ));
  if (!forans.length) ok(`${armes.length} superarmes, totes amb tipus de la biblioteca de les coses`);
  else bad(`${pl(forans.length, 'superarma', 'superarmes')} amb un tipus que el SOS no té: ` +
    forans.map(a => `${a.id}→${a.typ}`).join(', '));
}

/* ── 3 · Enlloc del programa hi ha lloc per al nom d'un infant ──────────── */
/* Es miren els camps d'entrada de debò. Un `<input>` que demani «nom» a seques
   —o cognom, o classe, o escola— és el que no pot existir: a partir del moment
   que hi és, algú l'omplirà amb el nom d'una criatura. */
const inputs = [...PAG.matchAll(/<input[^>]*>/g)].map(m => m[0]);
const sospitosos = inputs.filter(t => {
  const txt = t.toLowerCase();
  if (/id="f?nom"/.test(txt) || /nom d'heroi|nom d&#39;heroi/.test(txt)) return false;
  return /placeholder="[^"]*\b(nom|cognom|alumn|nen|nena|classe|curs|escola)/.test(txt);
});
/* I les etiquetes: un camp que es diu «nom d'heroi» està bé; un que es digui
   «nom i cognoms» no, digui el que digui el `placeholder`. */
const etiquetes = [...PAG.matchAll(/<label[^>]*>([^<]+)<\/label>/g)].map(m => m[1].toLowerCase());
const malEtiquetats = etiquetes.filter(l =>
  /\b(cognom|nom i |nom real|nom de l'alumn|alumne|alumna|classe|curs|escola)\b/.test(l));
if (!sospitosos.length && !malEtiquetats.length) {
  ok(`${inputs.length} camps d'entrada, cap que demani el nom real d'un infant`);
} else {
  if (sospitosos.length) bad('camp que pot recollir el nom d\'un infant: ' + sospitosos[0].slice(0, 90));
  if (malEtiquetats.length) bad('etiqueta que demana dades d\'un infant: «' + malEtiquetats[0] + '»');
}

/* Cada clau que viatja a la IA ha de ser de la llista tancada I l'ha de produir
   la funció que la construeix. Una clau declarada i no produïda no fa mal; una
   produïda i no declarada seria un camp que surt sense que ho digui ningú. */
const camps = [...(PAG.match(/const CAMPS_IA=\[[^\]]*\]/) || [''])[0].matchAll(/'([^']+)'/g)].map(m => m[1]);
const construeix = (PAG.match(/function carregaIA\(\)\{[\s\S]*?\n\}/) || [''])[0];
const produides = [...construeix.matchAll(/([a-zA-Z0-9_]+):/g)].map(m => m[1]);
if (!camps.length) bad('no s\'ha trobat CAMPS_IA: no es pot saber què viatja');
else {
  const prohibides = camps.filter(c => /nom$|cognom|alumn|classe|curs|escola|real/i.test(c) && c !== 'heroi');
  const noDeclarades = produides.filter(k => !camps.includes(k));
  if (!prohibides.length) ok(`${camps.length} camps cap a la IA, cap que pugui ser un nom real: ${camps.join(', ')}`);
  else bad('CAMPS_IA porta una clau que pot ser un nom real: ' + prohibides.join(', '));
  if (!noDeclarades.length) ok('i el que es construeix no té cap camp que la llista no declari');
  else bad(`carregaIA() produeix camps que CAMPS_IA no declara: ${noDeclarades.join(', ')} — ` +
    'avui no surten, i el dia que algú els afegeixi a la llista sortiran sense que ho hagi mirat ningú');
}

/* ── 4 · La regla, escrita ──────────────────────────────────────────────── */
const diu = [
  [/el cromo es dissenya[^.]*els superpoders es guanyen/i, 'el cromo es dissenya i els superpoders es guanyen'],
  [/qui l'ha rebuda|qui ha rebut l'ajuda|una altra persona diu que l'has/i, 'que l\'estrella la posa qui rep l\'ajuda'],
  [/no surt d'aquest ordinador|no viatja enlloc/i, 'que la taula de la classe no surt del dispositiu']
];
const falten = diu.filter(([re]) => !re.test(PAG)).map(x => x[1]);
if (!falten.length) ok('la pàgina diu les tres coses que fan que això no sigui un concurs');
else bad('la pàgina ja no diu: ' + falten.join(' · '));

/* ── 5 · Les dues accions, i en aquest ordre ────────────────────────────── */
const a1 = PAG.indexOf('Acció 1'), a2 = PAG.indexOf('Acció 2');
if (a1 > 0 && a2 > a1) ok('l\'Acció 1 (fabricar) va abans de l\'Acció 2 (guanyar-se-la)');
else bad('no es troben les dues accions en ordre: primer es fabrica el cromo, després es guanyen les estrelles');

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} al programa d'escola.`
  : '\n✅ El programa d\'escola quadra amb el SOS.');
process.exit(fails ? 1 : 0);
