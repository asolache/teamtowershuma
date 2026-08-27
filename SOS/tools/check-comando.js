#!/usr/bin/env node
/* Guarda del relat · que quatre llistes no diguin quatre noms del mateix
   ─────────────────────────────────────────────────────────────────────────
   El Comando es va escriure en llocs diferents i en moments diferents, i cap
   d'ells sabia dels altres. El dia que es va anar a comprovar, el mateix
   personatge tenia **quatre grafies** repartides per l'aplicació —`Guiriguay`,
   `Guiriguai`, `GuiriGuay`, `Guiri-Guay`— i a la pàgina pública en faltaven
   quatre que sí que surten als còmics.

   Això no peta mai. Simplement, qui llegeix una pantalla i després una altra
   creu que hi ha dos personatges, i el relat deixa de sostenir-se sol.

   La regla que aquesta guarda imposa és una de sola: **`CANONICAL_HEROES` és
   l'única llista d'on surten els noms.** Qui vulgui anomenar un heroi ha de fer
   servir un dels d'allà, o marcar-lo amb `previ:true` si l'autor encara no l'ha
   confirmat. **`previ` no vol dir «no surt al còmic»**: Reciclator viu en un
   vídeo i Fraktalman té tema propi, i tots dos són tan reals com els del còmic.
   Confondre les dues coses va tenir quatre personatges de veritat marcats com a
   provisionals.

   Aquesta guarda comprova que les llistes coincideixin entre elles. Si el que
   diuen és cert **no ho pot comprovar cap programa**: això ho diu qui ha escrit
   l'obra, i quan ho diu, es corregeix aquí.

   node SOS/tools/check-comando.js */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const APP = readFileSync(join(ARREL, 'SOS', 'index.html'), 'utf8');
const PAG = readFileSync(join(ARREL, 'SOS', 'comando.html'), 'utf8');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

console.log('\nGuarda del relat · Comando Molekulon');

// ── El roster declarat ───────────────────────────────────────────────────
const bloc = (APP.match(/^const CANONICAL_HEROES=\[[\s\S]*?\n\];/m) || [''])[0];
const roster = [...bloc.matchAll(/name:'((?:[^'\\]|\\.)*)'/g)].map(m => m[1].replace(/\\'/g, "'"));
if (!roster.length) {
  /* Sense el roster no es diu «cap problema»: es diu que no s'ha pogut mirar. */
  bad('no es troba CANONICAL_HEROES: aquesta guarda no pot comprovar res');
  console.log('\n❌ 1 problema.');
  process.exit(1);
}
ok(`roster declarat amb ${roster.length} herois: ${roster.join(', ')}`);

// ── 1 · Cap nom repetit al roster ────────────────────────────────────────
const vistos = new Set(), dups = new Set();
roster.forEach(n => { if (vistos.has(n)) dups.add(n); vistos.add(n); });
if (!dups.size) ok('cap nom repetit');
else bad(`${pl(dups.size, 'nom repetit', 'noms repetits')} al roster: ${[...dups].join(', ')}`);

// ── 2 · Tot heroi anomenat a l'app és del roster ─────────────────────────
/* Es miren les dues llistes que anomenen herois: les pantalles amb frase
   (`HERO_SCREENS`) i els fundadors lligats al panteó (`COMANDO_FOUNDERS`). */
const anomenats = [];
const screens = (APP.match(/^const HERO_SCREENS=\{[\s\S]*?\n\};/m) || [''])[0];
[...screens.matchAll(/\{(previ:true,)?hero:'((?:[^'\\]|\\.)*)'/g)].forEach(m =>
  anomenats.push({ on: 'HERO_SCREENS', nom: m[2].replace(/\\'/g, "'"), previ: !!m[1] }));
const founders = (APP.match(/^const COMANDO_FOUNDERS=\[[\s\S]*?\n\];/m) || [''])[0];
[...founders.matchAll(/\{(previ:true,)?hero:'((?:[^'\\]|\\.)*)'/g)].forEach(m =>
  anomenats.push({ on: 'COMANDO_FOUNDERS', nom: m[2].replace(/\\'/g, "'"), previ: !!m[1] }));

if (!anomenats.length) bad('no s\'ha pogut llegir cap llista que anomeni herois');
else {
  const forans = anomenats.filter(x => !x.previ && !roster.includes(x.nom));
  const previs = anomenats.filter(x => x.previ);
  if (!forans.length) ok(`${anomenats.length} mencions a l'app, totes del roster o marcades com a previes`);
  else bad(`${pl(forans.length, 'heroi', 'herois')} que no són al roster: ` +
    forans.map(x => `${x.nom} (${x.on})`).join(', ') +
    ' — o s\'afegeixen a CANONICAL_HEROES o es marquen amb `previ:true`');
  if (previs.length) console.log(`  · ${pl(previs.length, 'marcat', 'marcats')} com a previ (l'autor encara no ho ha confirmat): ` +
    previs.map(x => x.nom).join(', '));
}

// ── 3 · Cada personatge diu què fa i què vol dir ─────────────────────────
/* Un heroi sense `power` no diu res; un sense `vna` és decoració, i llavors el
   relat deixa de ser un pont amb la resta de l'eina i passa a ser un fullet.
   La `lletra` no és obligatòria —de dos personatges encara no en tenim—, però
   la que hi ha ha d'anar entre cometes baixes i **en castellà**: és una cita
   del còmic, i traduir-la la convertiria en un resum. */
const fitxes = [...bloc.matchAll(/\{name:'((?:[^'\\]|\\.)*)'[\s\S]*?\}(?=,\n  \{name:|\n\];)/g)]
  .map(m => ({ nom: m[1].replace(/\\'/g, "'"), txt: m[0] }));
const sensePower = fitxes.filter(f => !/\bpower:'/.test(f.txt)).map(f => f.nom);
const senseVna = fitxes.filter(f => !/\bvna:'/.test(f.txt)).map(f => f.nom);
const senseArma = fitxes.filter(f => !/\barma:'/.test(f.txt)).map(f => f.nom);
if (!sensePower.length && !senseVna.length) ok(`els ${fitxes.length} porten poder i equivalència a un equip`);
else {
  if (sensePower.length) bad(`sense poder: ${sensePower.join(', ')}`);
  if (senseVna.length) bad(`sense equivalència a un equip: ${senseVna.join(', ')} — sense això el relat és decoració`);
}
if (senseArma.length) console.log(`  · ${senseArma.length} sense superarma declarada: ${senseArma.join(', ')}`);
const lletres = fitxes.filter(f => /\blletra:'/.test(f.txt));
const malCitades = lletres.filter(f => !/lletra:'«/.test(f.txt)).map(f => f.nom);
if (!malCitades.length) ok(`${lletres.length} versos citats literalment`);
else bad(`lletra que no va entre cometes baixes: ${malCitades.join(', ')} — una cita que es reescriu deixa de ser-ho`);

// ── 4 · La pàgina pública diu els mateixos noms ──────────────────────────
/* La pàgina és HTML a mà i no llegeix la constant, així que pot quedar-se
   enrere sense que res avisi. Va passar: deia vuit herois amb poders que no
   eren els del còmic mentre l'app ja en deia uns altres. */
const aPagina = [...PAG.matchAll(/class="hcard-nm">([^<]+)</g)].map(m => m[1].trim());
if (!aPagina.length) bad('no s\'han trobat les fitxes d\'heroi a comando.html');
else {
  const sobren = aPagina.filter(n => !roster.includes(n));
  const falten = roster.filter(n => !aPagina.includes(n));
  if (!sobren.length && !falten.length) ok(`comando.html ensenya els mateixos ${aPagina.length} herois`);
  else {
    if (sobren.length) bad(`comando.html ensenya ${pl(sobren.length, 'heroi', 'herois')} que no són al roster: ${sobren.join(', ')}`);
    if (falten.length) bad(`comando.html no ensenya ${pl(falten.length, 'heroi', 'herois')} del roster: ${falten.join(', ')}`);
  }
  /* El comptador de la portada es va escriure a mà i deia 8 quan n'hi havia 9. */
  const comptador = PAG.match(/<div class="n">(\d+)<\/div><div class="l">herois canònics/);
  if (!comptador) bad('no es troba el comptador d\'herois canònics a comando.html');
  else if (Number(comptador[1]) === roster.length) ok(`i el comptador diu ${comptador[1]}, que és el que n'hi ha`);
  else bad(`el comptador diu ${comptador[1]} herois canònics i n'hi ha ${roster.length}`);
}

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} al relat.` : '\n✅ El relat quadra.');
process.exit(fails ? 1 : 0);
