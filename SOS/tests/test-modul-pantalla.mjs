/* Mòdul ↔ pantalla · que cada pantalla del SOS sàpiga on s'aprèn, en Node pur.
   La font és `pantalles` a certificacio.json (via moduls.json): cada mòdul en
   té almenys una, totes existeixen, i la clau de tornada (lib/modul-pantalla.js)
   troba el mòdul des de l'adreça que el navegador té oberta. */
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const MP = require('../lib/modul-pantalla.js');
const D = require('../knowledge/formacio/moduls.json');
const SOS = join(dirname(fileURLToPath(import.meta.url)), '..');

let ok = 0;
const prova = (nom, fn) => { fn(); ok++; console.log('  ✓ ' + nom); };
console.log('\nMòdul ↔ pantalla');

prova('els 22 mòduls diuen a quina pantalla del SOS es fa la pràctica', () => {
  assert.equal(D.moduls.length, 22);
  D.moduls.forEach(m => assert.ok((m.pantalles || []).length >= 1, m.id));
});
prova('cada pàgina citada existeix i porta la tornada al mòdul', () => {
  D.moduls.forEach(m => m.pantalles.forEach(p => {
    const f = p.u.split('#')[0];
    if (!f.startsWith('/SOS/') || f === '/SOS/') return;
    const fit = join(SOS, f.slice(5));
    assert.ok(existsSync(fit), p.u);
    assert.ok(readFileSync(fit, 'utf8').includes('lib/modul-pantalla.js'), f + ' no carrega lib/modul-pantalla.js');
  }));
  assert.ok(readFileSync(join(SOS, 'index.html'), 'utf8').includes('lib/modul-pantalla.js'), 'l\'app no la carrega');
});
prova('la clau: fitxer, ruta de l\'app i subruta del fons', () => {
  assert.equal(MP.clau('/SOS/banc-temps.html', ''), 'banc-temps.html');
  assert.equal(MP.clau('/SOS/', '#/identitat'), '#/identitat');
  assert.equal(MP.clau('/SOS/index.html', '#/fons/impacte'), '#/fons/impacte');
  assert.equal(MP.clau('/SOS/', '#/copia/x'), '#/copia');
  assert.equal(MP.clau('/SOS/', '#/n/abc/socis'), '', 'un node local no és cap pantalla de mòdul');
  assert.equal(MP.clau('/', ''), '', 'la portada del lloc no és l\'app');
});
const IX = MP.index(D);
prova('la tornada troba el mòdul, i tots quan n\'hi ha més d\'un', () => {
  assert.deepEqual(MP.modulsDe(IX, '/SOS/banc-temps.html', '').map(m => m.id), ['m4']);
  assert.deepEqual(MP.modulsDe(IX, '/SOS/', '#/identitat').map(m => m.id), ['m2']);
  const reg = MP.modulsDe(IX, '/SOS/', '#/registre').map(m => m.id);
  assert.ok(reg.includes('m5') && reg.includes('m8'), reg.join());
  assert.equal(MP.modulsDe(IX, '/SOS/blog.html', '').length, 0);
});
prova('formacio.html: cada mòdul enllaça la pantalla i en té la vista sense carregar-la', () => {
  const F = readFileSync(join(SOS, 'formacio.html'), 'utf8');
  D.moduls.forEach(m => {
    const i = F.indexOf(`<!--TT-CERT-${m.id}-->`), z = F.indexOf(`<!--/TT-CERT-${m.id}-->`);
    const tros = F.slice(i, z);
    m.pantalles.forEach(p => {
      assert.ok(tros.includes(`href="${p.u}"`), m.id + ' no enllaça ' + p.u);
      assert.ok(tros.includes(`data-src="${p.u}"`), m.id + ' no en té la vista');
    });
  });
  assert.ok(!/<iframe[^>]* src=/.test(F), 'cap vista es carrega abans d\'obrir-la');
});
prova('certificacio.html: cada pràctica diu la pantalla, també en castellà', () => {
  const C = readFileSync(join(SOS, 'certificacio.html'), 'utf8');
  D.moduls.forEach(m => {
    assert.ok(C.includes(`data-i18n-html="pr.${m.id}.s"`), m.id);
    assert.ok(C.includes(`"pr.${m.id}.s"`), m.id + ' sense castellà');
  });
});

console.log(`\n✅ ${ok} proves de mòdul ↔ pantalla.`);
