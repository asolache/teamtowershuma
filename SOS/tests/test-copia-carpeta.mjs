/* Còpies automàtiques a una carpeta · les regles, en Node pur.
   Que el nom porti la data en ordre, que només s'esborrin les còpies velles
   d'aquesta peça, que no es copiï si res no ha canviat, i que l'app hi connecti
   les seves peces (cap duplicat de la còpia ni de la clau). */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const C = require('../lib/copia-carpeta.js');
const SOS = join(dirname(fileURLToPath(import.meta.url)), '..');

let ok = 0;
const prova = (nom, fn) => { fn(); ok++; console.log('  ✓ ' + nom); };
console.log('\nCòpies automàtiques a una carpeta');

prova('el nom porta la data i l\'hora, i ordenar-los és ordenar per data', () => {
  assert.equal(C.nomFitxer(new Date(2026, 10, 21, 9, 5, 7)), 'sos-copia-2026-11-21-090507.json');
  const a = C.nomFitxer(new Date(2026, 0, 2, 23, 0, 0)), b = C.nomFitxer(new Date(2026, 9, 1, 1, 0, 0));
  assert.ok([b, a].sort()[0] === a);
});
prova('es guarden les últimes, i no es toca res que no sigui una còpia nostra', () => {
  const noms = Array.from({ length: 16 }, (_, i) => C.nomFitxer(new Date(2026, 10, 1 + i, 10)));
  const s = C.sobren(noms.concat(['acta-assemblea.json', 'sos-copia-notes.txt']), 14);
  assert.deepEqual(s, noms.slice(0, 2));
});
prova('només es copia si ha canviat, i com a molt cada deu minuts', () => {
  const ara = Date.now();
  assert.equal(C.calCopia({ empremta: 'a', ultimaEmpremta: 'a', ultimaTs: 0, ara }), false);
  assert.equal(C.calCopia({ empremta: 'b', ultimaEmpremta: 'a', ultimaTs: ara - 60e3, ara }), false);
  assert.equal(C.calCopia({ empremta: 'b', ultimaEmpremta: 'a', ultimaTs: ara - 11 * 60e3, ara }), true);
  assert.equal(C.calCopia({ empremta: 'b', ultimaEmpremta: 'a', ultimaTs: ara - 60e3, ara, ara_mateix: true }), true);
  assert.equal(C.calCopia({ empremta: 'b', ultimaEmpremta: '', ultimaTs: 0, ara }), true);
});
prova('l\'empremta canvia amb qualsevol canvi de dades', () => {
  const r = [{ id: 'n1', ledger: [1] }];
  assert.equal(C.empremta(r), C.empremta(JSON.parse(JSON.stringify(r))));
  assert.notEqual(C.empremta(r), C.empremta([{ id: 'n1', ledger: [1, 2] }]));
});
prova('l\'app hi connecta la seva còpia i la seva clau (res duplicat)', () => {
  const A = readFileSync(join(SOS, 'index.html'), 'utf8');
  assert.ok(/CopiaCarpeta\.connecta\(\{llegeix:dbGetAll,exporta:exportBackup,clau:_kekFromPass,b64:_b64u,marca:copiaMarca\}\)/.test(A));
  assert.ok(A.includes("CopiaCarpeta.obre()"), 'la pantalla de còpia hi porta');
  const L = readFileSync(join(SOS, 'lib', 'copia-carpeta.js'), 'utf8');
  assert.ok(!/PBKDF2'?\s*,\s*salt/.test(L) && !/deriveKey/.test(L), 'la clau es deriva a l\'app, no aquí');
  assert.ok(!/localStorage/.test(L), 'res de la carpeta ni de la clau a localStorage');
});

console.log(`\n✅ ${ok} proves de les còpies automàtiques.`);
