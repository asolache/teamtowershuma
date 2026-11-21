/* El pla de desenvolupament · de l'ikigai al kanban, en Node pur.
   Que el nivell següent demani el que diu la guia, que l'ikigai ordeni sense
   treure res, que les targetes siguin del kanban únic i no es dupliquin, i que
   la importació de LinkedIn compti les validacions sense guardar mai qui valida. */
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const P = require('../lib/pla-desenvolupament.js');
const K = require('../lib/kanban.js');
const D = require('../knowledge/formacio/moduls.json');

let ok = 0;
const prova = (nom, fn) => { fn(); ok++; console.log('  ✓ ' + nom); };
console.log('\nEl pla de desenvolupament');

prova('22 mòduls generats, amb pràctica en català i castellà', () => {
  assert.equal(D.moduls.length, 22);
  D.moduls.forEach(m => { assert.ok(m.practica.ca.p && m.practica.es.e && m.t.es && m.nivell); });
});
prova('de N0 a N1: només pràctiques fins a N1 i del teu rol', () => {
  const pl = P.pla({ nivell: 'N0', rols: ['superheroi'] }, D);
  assert.equal(pl.objectiu, 'N1');
  pl.passos.forEach(x => { assert.ok(['N0', 'N1'].includes(x.nivell)); assert.ok(x.delRol); });
});
prova('de N1 a N2: totes les de les àrees A i B fins a N2, menys les fetes', () => {
  const pl = P.pla({ nivell: 'N1', rols: ['coordinador'], fets: ['m1', 'm3'] }, D);
  const ids = pl.passos.map(x => x.id);
  assert.ok(!ids.includes('m1') && !ids.includes('m3') && !ids.includes('m16') && !ids.includes('m17'));
  assert.ok(ids.includes('m5') && ids.includes('m15'));
});
prova('cap a N3: la docència, enllaçar nodes i el simulacre', () => {
  const ids = P.pla({ nivell: 'N2', rols: ['mentor'] }, D).passos.map(x => x.id);
  assert.ok(ids.includes('m16') && ids.includes('x-enllac') && ids.includes('x-simulacre'));
});
prova('l\'ikigai ordena i diu per què, sense treure cap pràctica', () => {
  const sense = P.pla({ nivell: 'N0', rols: ['superheroi'] }, D);
  const amb = P.pla({ nivell: 'N0', rols: ['superheroi'], ikigai: { falta: ['préstamo de objetos'] }, llengua: 'es' }, D);
  assert.equal(amb.passos.length, sense.passos.length);
  assert.equal(amb.passos[0].id, 'm4');
  assert.match(amb.passos[0].motius[0], /préstamo de objetos/);
});
prova('l\'itinerari d\'organització és l\'àrea C', () => {
  const pl = P.pla({ via: 'organitzacio' }, D);
  assert.equal(pl.objectiu, 'C');
  assert.deepEqual(pl.passos.map(x => x.id).sort(), ['m17', 'm18', 'm19', 'm20', 'm21', 'm22']);
});
prova('les targetes són del kanban únic, de formació, amb l\'evidència d\'entregable', () => {
  const pl = P.pla({ nivell: 'N0', rols: ['superheroi'] }, D);
  const cs = K.neteja({ cards: P.targetes(pl, { qui: 'Ana' }) }).cards;
  assert.equal(cs.length, pl.passos.length);
  cs.forEach(c => { assert.equal(c.tipus, 'formacion'); assert.equal(c.col, 'todo'); assert.ok(c.entregable); assert.match(c.id, /^pd-/); });
});
prova('tornar a fer el pla no duplica ni torna el que s\'ha tret', () => {
  const t = P.targetes(P.pla({ nivell: 'N0', rols: ['superheroi'] }, D), {});
  const k1 = P.afegeix({ cards: [] }, t);
  const k2 = P.afegeix({ cards: k1.cards.slice(1), fora: [k1.cards[0].id] }, t);
  assert.equal(k2.cards.length, k1.cards.length - 1);
});
prova('LinkedIn · Skills.csv', () => {
  const r = P.importaSkills('Name\nMediación\n"Gestión de proyectos, ágil"\n');
  assert.equal(r.font, 'skills-csv');
  assert.deepEqual(r.skills.map(x => x.label), ['Mediación', 'Gestión de proyectos, ágil']);
});
prova('LinkedIn · validacions rebudes: compta quants, mai qui', () => {
  const r = P.importaSkills('Endorsement Date,Skill Name,Endorser First Name,Endorser Last Name,Endorser Public Url,Endorsement Status\n' +
    '2024/01/01,Mediación,Ana,Pérez,https://x,ACCEPTED\n2024/01/02,Mediación,Joan,Puig,https://y,ACCEPTED\n2024/01/03,Mediación,Eva,Roig,https://z,REJECTED\n');
  assert.deepEqual(r.skills, [{ label: 'Mediación', validacions: 2 }]);
  assert.ok(!/Ana|Joan|Pérez/.test(JSON.stringify(r)));
});
prova('LinkedIn · text enganxat de l\'apartat Aptituds', () => {
  const r = P.importaSkills('Aptitudes\nFacilitación de grupos\nValidado por Ana Pérez y 11 contactos más\nGestión comunitaria\n5 validaciones\nMostrar todas las aptitudes (23)\n');
  assert.deepEqual(r.skills, [{ label: 'Facilitación de grupos', validacions: 12 }, { label: 'Gestión comunitaria', validacions: 5 }]);
  assert.ok(!/Ana/.test(JSON.stringify(r)));
});

console.log(`\n✅ ${ok} proves del pla de desenvolupament.`);
