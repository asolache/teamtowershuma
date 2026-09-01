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
const llegeix = p => { try { return readFileSync(p, 'utf8'); } catch (e) { return null; } };
const APP = readFileSync(join(ARREL, 'SOS', 'index.html'), 'utf8');
const PAG = readFileSync(join(ARREL, 'SOS', 'comando.html'), 'utf8');
/* Les altres pàgines que anomenen herois. No han de dir-los TOTS —el blog en
   pot parlar de tres—, però els que diguin han de ser del roster. El post de
   l'origen va estar mesos dient «Afrodita», «Ectoplasman» i «Corporació Món
   Mort» mentre l'app ja en deia uns altres, i no ho mirava res. */
/* `comando.html` hi és a la llista tot i tenir la seva pròpia comprovació més
   avall: aquella mira les FITXES d'heroi i no toca el `<head>`. La descripció
   i la targeta de compartir van quedar dient «Corporació Món Mort» i «Zero
   servidor» mesos després d'haver-ho corregit al cos, i és justament el text
   que surt a Google i a WhatsApp — el que més gent llegeix i el que ningú
   mira. Una comprovació que només mira el que es veu a la pàgina deixa fora
   el que la representa a fora.

   `joc.html` hi és perquè el joc reparteix els herois en rols jugables, i un
   nom mal escrit allà és el mateix personatge convertit en dos —el que ja va
   passar amb les quatre grafies de Guiri-Guay. */
const ALTRES = ['comando.html', 'blog.html', 'uneix-te.html', 'online.html', 'crm.html', 'joc.html', 'escola.html', 'intro.html'].map(f => ({
  f, txt: (() => { try { return readFileSync(join(ARREL, 'SOS', f), 'utf8'); } catch (e) { return null; } })()
}));

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
  /* Repetits. Aquesta comprovació hi és perquè va faltar: en regenerar les
     fitxes, les velles es van quedar i la pàgina en va tenir 26 en comptes de
     14. Mirant només «quins noms sobren» i «quins falten» no en sobrava cap ni
     en faltava cap —tots els duplicats eren noms bons—, i la guarda va aprovar
     una pàgina amb cada heroi pintat dues vegades. Comparar conjunts no és
     comparar llistes. */
  const vistosP = new Set(), dupsP = new Set();
  aPagina.forEach(n => { if (vistosP.has(n)) dupsP.add(n); vistosP.add(n); });
  if (dupsP.size) bad(`comando.html pinta ${pl(dupsP.size, 'heroi', 'herois')} dues vegades: ${[...dupsP].slice(0, 5).join(', ')}`);
  if (!sobren.length && !falten.length && !dupsP.size) ok(`comando.html ensenya els mateixos ${aPagina.length} herois`);
  else {
    if (sobren.length) bad(`comando.html ensenya ${pl(sobren.length, 'heroi', 'herois')} que no són al roster: ${sobren.join(', ')}`);
    if (falten.length) bad(`comando.html no ensenya ${pl(falten.length, 'heroi', 'herois')} del roster: ${falten.join(', ')}`);
  }
  /* El comptador de la portada es va escriure a mà i deia 8 quan n'hi havia 9. */
  const comptador = PAG.match(/<div class="n">(\d+)<\/div><div class="l">herois canònics/);
  if (!comptador) bad('no es troba el comptador d\'herois canònics a comando.html');
  else if (Number(comptador[1]) === roster.length && aPagina.length === roster.length) ok(`i el comptador diu ${comptador[1]}, que és el que n'hi ha`);
  else if (aPagina.length !== roster.length) bad(`la pàgina pinta ${aPagina.length} fitxes i el roster en té ${roster.length}`);
  else bad(`el comptador diu ${comptador[1]} herois canònics i n'hi ha ${roster.length}`);
}

// ── 4b · Les pàgines que reparteixen herois no se'n poden inventar ───────
/* El joc dona un heroi a cada rol, el programa d'escola també, i la intro en
   posa sis a la pantalla. Cadascuna és una llista nova, i una llista nova és
   exactament per on va tornar a entrar l'error de la veda 109 —quatre llistes
   que coincidien a equivocar-se. Aquí es comprova que els noms que reparteixen
   siguin del roster i prou. */
const REPARTEIXEN = [
  { f: 'joc.html', re: /heroi:'((?:[^'\\]|\\.)*)'/g },
  { f: 'intro.html', re: /\{n:'((?:[^'\\]|\\.)*)',ic:/g }
];
let repFails = 0, repTotal = 0;
REPARTEIXEN.forEach(({ f, re }) => {
  const txt = llegeix(join(ARREL, 'SOS', f));
  if (txt === null) return;
  const noms = [...new Set([...txt.matchAll(re)].map(m => m[1].replace(/\\'/g, "'")))];
  if (!noms.length) { repFails++; bad(`${f} no reparteix cap heroi — o ha canviat el format i aquesta comprovació s'ha quedat cega`); return; }
  repTotal += noms.length;
  const forans = noms.filter(n => !roster.includes(n));
  if (forans.length) { repFails++; bad(`${f} reparteix herois que no són al roster: ${forans.join(', ')}`); }
});
if (!repFails) ok(`${repTotal} mencions d'heroi a les pàgines que en reparteixen, totes del roster`);

// ── 5 · Les altres pàgines no diuen noms vells ───────────────────────────
/* Es busquen les grafies antigues i els noms que ja no existeixen. Una llista
   negra explícita, no una heurística: el que va passar és que uns noms es van
   canviar en un lloc i van quedar vius en un altre, i això només es detecta
   sabent quins eren. Quan un nom canviï, s'afegeix aquí el vell. */
const VELLS = ['Afrodito', 'Ectoplasman', 'Guiriguai', 'Guiriguay', 'GuiriGuay',
  'Pigmentona', 'La Anguila', 'Medusa Andalusa',
  /* «Horacio Motomachi» va sortir d'aquesta llista el dia que va arribar el
     tema que porta aquest títol. No hi era per cap error trobat: la vaig posar
     jo per si de cas, i no ha existit mai a cap pàgina. Una llista negra
     inventada prohibeix coses certes, que és el contrari del que ha de fer.
     Queda per resoldre si el nom del roster és «Horacio» o el llarg; això ho
     diu l'autor, no la guarda (veda 109). */
  'Corporació Món Mort', 'Corporacio Mon Mort', 'Món Mort', 'Mon Mort',
  /* No són noms, però són el mateix problema: text que es va corregir al cos
     i va quedar viu allà on no mira ningú. */
  'Zero servidor', 'Local-first', 'local-first'];

/* El codex i la pàgina de vedes també. La veda 109 va posar la regla —una sola
   llista mana— i la guarda mirava les pàgines i no el document que declara la
   regla: el codex va seguir mesos amb vuit herois, `Guiriguai` i `Ectoplasman`.
   Veda 112.

   Amb una excepció necessària: les vedes **anomenen** els noms vells per
   explicar què va fallar, i anomenar no és utilitzar. Els exemples van entre
   cometes —`Guiriguai`, «La Anguila»— i aquí es buiden abans de mirar. Una
   guarda que no sap distingir-ho acaba prohibint parlar del passat. */
/* Els comentaris de codi fora. Es buiden, no s'esborren, perquè les línies no
   ballin si un dia es vol dir on és el problema. */
const senseComentaris = t => t
  .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
  .replace(/^[ \t]*\/\/.*$/gm, '');
const senseCites = t => t
  .replace(/`[^`\n]*`/g, '``')
  /* A `vedes.html` les cometes simples del codex ja són `<code>`: si només es
     miressin els accents greus, la pàgina generada acusaria d'error viu els
     mateixos exemples que el codex té permès citar, i les dues comprovacions
     dirien coses diferents del mateix text. */
  .replace(/<code>[\s\S]*?<\/code>/g, '<code></code>')
  .replace(/«[^»\n]*»/g, '«»')
  .replace(/“[^”\n]*”/g, '“”');
const DOCS = [
  { f: 'knowledge/codex.md', txt: llegeix(join(ARREL, 'SOS', 'knowledge', 'codex.md')) },
  { f: 'vedes.html', txt: llegeix(join(ARREL, 'SOS', 'vedes.html')) },
  /* I l'app. És d'on surt el roster, i precisament per això no se la mirava
     ningú: el nom vell del vilà va sobreviure mesos a la missió del mòdul
     Comando i a la sinopsi de la vista —dos textos que llegeix tothom— mentre
     totes les guardes donaven verd.

     Dels comentaris de codi no. Un comentari és el gremi parlant amb ell
     mateix i allà «local-first» vol dir el que vol dir; el problema de la veda
     107 és el mateix mot **a la cara de qui no és del gremi**. I les vedes
     escrites com a comentari citen els noms vells per explicar-los: acusar-les
     seria prohibir explicar què va fallar. */
  { f: 'index.html', txt: senseComentaris(APP) }
];

let restes = 0;
ALTRES.forEach(({ f, txt }) => {
  if (txt === null) return;   // la pàgina pot no existir: no és feina d'aquesta guarda
  const trobats = VELLS.filter(v => txt.includes(v));
  if (trobats.length) { restes++; bad(`${f} encara diu: ${trobats.join(', ')}`); }
});
if (!restes) ok(`${ALTRES.filter(x => x.txt !== null).length} pàgines més, cap amb noms vells`);

let restesDoc = 0;
DOCS.forEach(({ f, txt }) => {
  if (txt === null) return;
  const net = senseCites(txt);
  const trobats = VELLS.filter(v => net.includes(v));
  if (trobats.length) {
    restesDoc++;
    bad(`${f} fa servir noms vells fora de cometes: ${trobats.join(', ')} — ` +
      'si és un exemple del que va fallar, va entre cometes; si no, és un error viu');
  }
});
if (!restesDoc) ok(`${DOCS.filter(x => x.txt !== null).length} documents de coneixement, cap amb noms vells en ús`);

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} al relat.` : '\n✅ El relat quadra.');
process.exit(fails ? 1 : 0);
