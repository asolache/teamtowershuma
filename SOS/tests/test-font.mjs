/* La font i la colla · el model, en Node pur.
   Que la pel·lícula compti el que diu el mapa i no s'inventi res: tants llocs
   ocupats com lliuraments dona cada àrea, el pilar buit on una troballa diu
   «no és de ningú», el lliurament aturat on una altra diu «no la recull ningú»,
   i les dues llengües amb les mateixes claus. */
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const D = require('../lib/font-dades.js').FontDades;
const FA = require('../lib/font-anima.js').FontAnima;

let ok = 0;
const prova = (nom, fn) => { fn(); ok++; console.log('  ✓ ' + nom); };

const M = FA.model(D);
prova('una rengla per àrea, amb el pilar i cinc cordons', () => {
  assert.equal(M.n, D.rols.length);
  assert.equal(M.llocs.length, D.rols.length * 6);
});
prova('els llocs ocupats són els lliuraments que dona cada àrea (fins a cinc)', () => {
  D.rols.forEach((r, i) => {
    const dona = D.fluxos.filter(x => x.de === r).length;
    const plens = M.llocs.filter(l => l.rol === i && l.k > 0 && l.ple).length;
    assert.equal(plens, Math.min(5, dona), r);
  });
});
prova('el pilar d\'una àrea que «no és de ningú» surt buit', () => {
  const t = D.troballes.find(x => x.ningu && x.rols.length);
  assert.ok(t, 'cap troballa no diu que una àrea no és de ningú');
  t.rols.forEach(r => assert.equal(M.llocs.find(l => l.rol === D.rols.indexOf(r) && l.k === 0).ple, false));
});
prova('el lliurament que «no recull ningú» queda aturat', () => {
  const t = D.troballes.find(x => x.ningu && x.fluxos.length);
  assert.ok(t);
  t.fluxos.forEach(j => assert.ok(M.aturats[j]));
});
prova('els forats són els llocs buits', () => {
  assert.equal(M.forats.length, M.llocs.filter(l => !l.ple).length);
  assert.ok(M.forats.length > 0);
});
prova('cinc capes del cervell, del codex', () => assert.equal(D.capes.length, 5));
prova('català i castellà amb les mateixes claus i les mateixes escenes', () => {
  const ca = FA.T.ca, es = FA.T.es;
  assert.deepEqual(Object.keys(ca).sort(), Object.keys(es).sort());
  assert.equal(ca.e.length, es.e.length);
  assert.deepEqual(Object.keys(ca.kosha), Object.keys(es.kosha));
  D.capes.forEach(c => assert.ok(ca.kosha[c.id] && es.kosha[c.id], c.id));
});
console.log(`✓ La font i la colla: ${ok} proves`);
