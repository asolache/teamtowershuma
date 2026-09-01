#!/usr/bin/env node
/* La guarda que hauria caçat que faltava mig temari.
 *
 * `formacio.html` és la font única de la docència i `FORMACIO_MODULES` (dins de
 * `SOS/index.html`) només n'és **l'esquelet referenciable**: el que permet que un
 * itinerari de rol digui «et toca el mòdul 9» i hi porti. Que siguin dues coses
 * separades està bé i és deliberat; el que no pot ser és que es desincronitzin
 * en silenci, i és exactament el que havia passat: la pàgina tenia 16 mòduls i
 * l'app en modelava 8. Els vuit del Bloc B —facilitació, cures, finançament,
 * formes jurídiques, RGPD, formació de formadors— existien sencers i **cap
 * itinerari els citava mai**.
 *
 * Ningú se n'assabenta perquè els dos costats funcionen: la pàgina es llegeix bé
 * i l'app no dona cap error. Només es nota si algú compta, i comptar és el que
 * fa aquesta guarda.
 *
 * Falla per dues coses, i totes dues deixen algú a mig camí:
 *   · Un mòdul de l'app sense àncora a la pàgina → l'enllaç no va enlloc.
 *   · Un mòdul de la pàgina que l'app no modela → ningú l'hi enviarà mai.
 *
 * Ús:  node SOS/tools/check-formacio.js
 */
/* `require` i no `import`, com la resta de guardes: el fitxer és `.js`, el
 * repositori no declara `"type":"module"`, i només el Node modern endevina que
 * això és un mòdul. Amb `import` passava aquí i petava al CI amb Node 18. */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const here = __dirname;
const app = readFileSync(join(here, '..', 'index.html'), 'utf8');
const page = readFileSync(join(here, '..', 'formacio.html'), 'utf8');

let bad = 0;
const ok = m => console.log('  ✓ ' + m);
const no = m => { bad++; console.log('  ✗ ' + m); };

console.log('\nGuarda de la formació · esquelet ↔ docència');

/* Els mòduls que l'app modela. Es llegeix el bloc de la constant i prou: buscar
   `id:'mN'` per tot el fitxer atraparia qualsevol altra cosa que s'hi assembli. */
const i = app.indexOf('const FORMACIO_MODULES=[');
if (i < 0) { console.log('  ✗ no es troba FORMACIO_MODULES'); process.exit(1); }
const bloc = app.slice(i, app.indexOf('\n];', i));
const mods = [...bloc.matchAll(/\{id:'(m\d+)',n:(\d+),title:'((?:[^'\\]|\\.)*)',hours:([\d.]+),level:'(N\d)',roles:\[([^\]]*)\]/g)]
  .map(m => ({ id: m[1], n: +m[2], title: m[3].replace(/\\'/g, "'"), hours: +m[4], level: m[5],
    roles: m[6].split(',').map(r => r.replace(/'/g, '').trim()).filter(Boolean) }));
/* Si el regex deixa de casar amb com estan escrits els mòduls, això comptaria
   zero i diria que tot quadra. Una guarda que no troba res no ha de dir que
   està tot bé: ha de dir que no ha trobat res. */
const declaratsAlText = (bloc.match(/\{id:'m\d+'/g) || []).length;
if (mods.length !== declaratsAlText)
  no(`el lector n'ha entès ${mods.length} de ${declaratsAlText}: el format dels mòduls ha canviat i aquesta guarda s'ha quedat cega`);

/* Les àncores que la pàgina ofereix de debò. */
const ancores = new Set([...page.matchAll(/id="(m\d+)"/g)].map(m => m[1]));

const declarats = new Set(mods.map(m => m.id));
const orfes = mods.filter(m => !ancores.has(m.id));
const invisibles = [...ancores].filter(a => !declarats.has(a))
  .sort((a, b) => +a.slice(1) - +b.slice(1));

if (!orfes.length) ok(`${mods.length} mòduls de l'app, tots amb àncora a formacio.html`);
else no(`${orfes.length} mòdul(s) de l'app apunten a una àncora que no existeix: ` +
  orfes.map(m => m.id).join(', ') + ' — l\'enllaç deixa la persona a mig camí');

if (!invisibles.length) ok(`${ancores.size} mòduls a la pàgina, tots modelats per l'app`);
else no(`${invisibles.length} mòdul(s) existeixen a formacio.html i l'app no els modela: ` +
  invisibles.join(', ') + ' — cap itinerari de rol els oferirà mai');

/* El joc també cita mòduls. Cada nivell del joc ensenya quins mòduls de la
   formació de veritat li toquen i hi enllaça; si un d'aquests id no existeix,
   qui hi clica cau a la pàgina i no hi passa res —el navegador no es queixa
   d'una àncora morta. És el mateix error que la resta d'aquesta guarda, però
   des del joc, i el joc és per on entrarà molta gent. */
const joc = readFileSync(join(here, '..', 'joc.html'), 'utf8');
const delJoc = [...new Set([...joc.matchAll(/\[\s*'(m\d+)'\s*,/g)].map(m => m[1]))];
const mortes = delJoc.filter(id => !ancores.has(id));
if (!delJoc.length) no('el joc no cita cap mòdul de formació — els nivells han de portar a la docència');
else if (!mortes.length) ok(`${delJoc.length} mòduls citats pel joc, tots amb àncora a formacio.html`);
else no(`el joc enllaça mòduls que no existeixen: ${mortes.join(', ')} — el clic no va enlloc`);

/* I el programa d'escola. La guia metodològica diu al professorat on és la
   formació de cada sessió; si un enllaç és mort, el mestre es queda sense el
   material justament al lloc on li dèiem que el trobaria. */
const escola = readFileSync(join(here, '..', 'escola.html'), 'utf8');
const deEscola = [...new Set([...escola.matchAll(/formacio\.html#(m\d+)/g)].map(m => m[1]))];
const mortesE = deEscola.filter(id => !ancores.has(id));
if (!deEscola.length) no('escola.html no enllaça cap mòdul — la guia del professorat ha de portar a la formació');
else if (!mortesE.length) ok(`${deEscola.length} mòduls citats pel programa d'escola, tots amb àncora`);
else no(`escola.html enllaça mòduls que no existeixen: ${mortesE.join(', ')}`);

/* Cada rol ha de tenir camí. Un rol sense cap mòdul és algú a qui la formació no
   li parla, i això no ho diu cap error: simplement no li surt res. */
const rolesApp = [...new Set(mods.flatMap(m => m.roles))].sort();
const sensePas = rolesApp.filter(r => !mods.some(m => m.roles.includes(r)));
if (!sensePas.length) ok(`${rolesApp.length} rols citats, tots amb almenys un mòdul`);
else no('rols sense cap mòdul: ' + sensePas.join(', '));

/* Informatiu, no falla: quants mòduls veu cada rol i quantes hores li suposa.
   Un rol amb un sol mòdul no és un error, però val la pena veure-ho. */
console.log('  · càrrega per rol:');
rolesApp.forEach(r => {
  const seus = mods.filter(m => m.roles.includes(r));
  const h = seus.reduce((a, m) => a + m.hours, 0);
  console.log(`      ${r.padEnd(14)} ${String(seus.length).padStart(2)} mòduls · ${h} h`);
});

/* També informatiu: els nivells que cobreix el temari. Si algun nivell es queda
   sense cap mòdul, qui hi arribi no té on continuar. */
const perNivell = ['N0', 'N1', 'N2', 'N3'].map(l => l + ':' + mods.filter(m => m.level === l).length);
console.log('  · per nivell: ' + perNivell.join(' · '));

console.log(bad ? '\n❌ L\'esquelet i la docència no quadren.' : '\n✅ L\'esquelet i la docència quadren.');
process.exit(bad ? 1 : 0);
