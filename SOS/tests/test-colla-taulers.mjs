/* Els taulers de la colla · el mètode de la veda 184, en Node pur.
   Que la pinya tingui una rengla per factor, que cada persona vagi al seu
   factor més marcat i com més marcada més a prop de la font, que un lloc no
   tingui mai dues persones, que els forats siguin la base sense ningú, i que
   cap model porti res més que noms de factors. */
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { MODELS, ORDRE } = require('../lib/taulers-models.js');
const C = require('../lib/colla-taulers.js');

let ok = 0;
const prova = (nom, fn) => { fn(); ok++; console.log('  ✓ ' + nom); };

prova('tres models: el 16PF (16), el Big Five obert (5) i el panteó (12)', () => {
  assert.deepEqual(ORDRE, ['16pf', 'big5', 'panteo']);
  assert.equal(MODELS['16pf'].factors.length, 16);
  assert.deepEqual(MODELS['16pf'].factors.map(f => f.id), ['A', 'B', 'C', 'E', 'F', 'G', 'H', 'I', 'L', 'M', 'N', 'O', 'Q1', 'Q2', 'Q3', 'Q4']);
  assert.equal(MODELS.big5.factors.length, 5);
  assert.equal(MODELS.panteo.factors.length, 12);
});
prova('cada factor porta nom, rol i skills dels dos pols a les dues llengües', () => {
  ORDRE.forEach(id => MODELS[id].factors.forEach(f => ['nom', 'rol', 'alt', 'baix'].forEach(c => {
    assert.ok(f[c] && f[c].ca && f[c].es, `${id}.${f.id}.${c}`);
  })));
});
prova('cada model diu la seva llicència i d\'on surt', () => {
  ORDRE.forEach(id => { const m = MODELS[id]; assert.ok(m.llicencia.ca && m.llicencia.es && /^https:\/\//.test(m.font.url), id); });
  assert.match(MODELS['16pf'].llicencia.ca, /drets d'editor/);
});
prova('el decatipus decideix el cordó: 1-2 i 9-10 al pilar, 5-6 al tercer', () => {
  const m = MODELS['16pf'];
  assert.equal(C.cordoDe(C.intensitat(m, 10)), 0);
  assert.equal(C.cordoDe(C.intensitat(m, 1)), 0);
  assert.equal(C.cordoDe(C.intensitat(m, 8)), 1);
  assert.equal(C.cordoDe(C.intensitat(m, 4)), 2);
  assert.equal(C.cordoDe(C.intensitat(m, 6)), 3);
});
const m = MODELS['16pf'];
prova('una persona va a la rengla del seu factor més marcat, amb el seu pol', () => {
  const r = C.calcula(m, [{ nom: 'X', v: { A: 6, E: 2, Q4: 7 } }], { cordons: 2 });
  const q = r.persones[0];
  assert.equal(m.factors[q.f].id, 'E'); assert.equal(q.k, 0); assert.equal(q.pol, '-');
});
prova('si el lloc és ple, un cordó més enfora; mai dues persones al mateix lloc', () => {
  const ps = [1, 2, 3].map(j => ({ nom: 'P' + j, v: { C: 10 } }));
  const r = C.calcula(m, ps, { cordons: 2 });
  assert.deepEqual(r.persones.map(q => q.k), [0, 1, 2]);
  const ocupats = r.llocs.filter(l => l.p !== null);
  assert.equal(new Set(ocupats.map(l => l.f + ':' + l.k)).size, ocupats.length);
});
prova('els forats són els llocs de la base sense ningú', () => {
  const r = C.calcula(m, C.exemple(m), { cordons: 2 });
  assert.equal(r.base, 16 * 2);
  assert.equal(r.forats.length, r.llocs.filter(l => l.req && l.p === null).length);
  assert.equal(r.ocupats + r.forats.length, r.base);
});
prova('un forat proposa qui el pot cobrir, o és una plaça d\'aprenent', () => {
  const r = C.calcula(m, [{ nom: 'X', v: { A: 10, B: 9 } }, { nom: 'Y', v: { A: 9 } }], { cordons: 1 });
  const fB = r.forats.find(x => m.factors[x.f].id === 'B');
  assert.deepEqual(fB.cand.map(c => c.j), [0]);
  const fC = r.forats.find(x => m.factors[x.f].id === 'C');
  assert.deepEqual(fC.cand, []);
});
prova('qui es col·loca a mà es queda on l\'han posat', () => {
  const r = C.calcula(m, [{ nom: 'X', v: { A: 10 }, fix: { f: 5, k: 3 } }], { cordons: 2 });
  assert.equal(r.persones[0].f, 5); assert.equal(r.persones[0].k, 3);
});
prova('el perfil es pot enganxar com a text', () => {
  assert.deepEqual(C.llegeixText(m, 'A=7 q4: 3 Z=1'), { A: 7, Q4: 3 });
  assert.equal(Object.keys(C.llegeixText(m, '1 2 3 4 5 6 7 8 9 10 1 2 3 4 5 6')).length, 16);
});
prova('català i castellà amb les mateixes claus', () => {
  assert.deepEqual(Object.keys(C.T.ca).sort(), Object.keys(C.T.es).sort());
  assert.equal(C.T.ca.kosha.length, C.KMAX + 1);
});
console.log(`✓ Els taulers de la colla: ${ok} proves`);
