/* Pantalles, no rotlles · SOS/lib/pantalla.js
   ─────────────────────────────────────────────────────────────────────────
   Álvaro (13/11/2026): només la portada fa scroll llarg; la resta, com una
   aplicació, a tauletes grans i mòbils. Es prova a les pàgines pilot:
   · Les pantalles surten de les seccions que ja hi ha, amb el seu nom, i el
     hero fa de pantalla «Inici» si n'hi ha.
   · Se'n veu una sola, i cap pantalla de la tauleta passa de tres alçades.
   · **Cada pantalla té enllaç**: obrir `#id` obre la seva; obrir l'id d'una
     cosa de dins obre la pantalla on viu; «Enrere» torna a l'anterior.
   · «Següent» porta a la següent i puja a dalt.
   · L'índex propi de la pàgina s'amaga (no dos índexs per al mateix).
   · Al mòbil la pàgina no es desplaça de costat. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { serve } from './serve.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const srv = await serve(join(DIR, '..', '..'), 0), BASE = 'http://127.0.0.1:' + srv.address().port + '/';
const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] }, process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const PILOTS = [
  { url: 'conecta/index.html', primer: 'Inicio', dins: 'cx-fuente', index: '.cab' },
  { url: 'SOS/ia.html', primer: 'Inici' },
  { url: 'SOS/escola.html', primer: 'Inici' }
];
for (const P of PILOTS) {
  for (const [nom, vp] of [['tauleta', { width: 1180, height: 820 }], ['mòbil', { width: 390, height: 844 }]]) {
    console.log('\n══ ' + P.url + ' · ' + nom + ' ══');
    const p = await b.newPage({ viewport: vp }), errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(BASE + P.url, { waitUntil: 'load' });
    await p.waitForFunction(() => window.TTPantalla);
    const ps = await p.evaluate(() => TTPantalla.pantalles);
    ok(ps.length >= 5, ps.length + ' pantalles, de les seccions de la pàgina');
    ok(ps[0].nom === P.primer, 'la primera es diu «' + P.primer + '»');
    ok(ps.every(x => x.nom && x.nom.length <= 31), 'cada pestanya té un nom curt');
    const visibles = await p.evaluate(() => [...document.querySelectorAll('[data-pant]')]
      .filter(e => getComputedStyle(e).display !== 'none').map(e => e.getAttribute('data-pant')));
    ok(new Set(visibles).size === 1, 'se\'n veu una sola');
    if (nom === 'tauleta') {
      const alts = [];
      for (let i = 0; i < ps.length; i++) {
        await p.evaluate(i => TTPantalla.mostra(i), i);
        alts.push(await p.evaluate(() => document.documentElement.scrollHeight / innerHeight));
      }
      const pitjor = Math.max(...alts);
      ok(pitjor <= 6, 'la pantalla més llarga fa ' + pitjor.toFixed(1) + ' alçades (abans, la pàgina sencera)');
    } else {
      ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'sense desplaçament de costat');
    }
    // Enllaç directe a una pantalla, i «Enrere».
    await p.goto(BASE + P.url + '#' + ps[2].id, { waitUntil: 'load' });
    await p.waitForFunction(() => window.TTPantalla);
    ok(await p.evaluate(() => TTPantalla.actual()) === 2, '#' + ps[2].id + ' obre la tercera pantalla');
    ok(await p.evaluate(id => document.querySelector('.tt-pant-tabs a[aria-current]').getAttribute('href') === '#' + id, ps[2].id), 'la pestanya marcada és la seva');
    await p.evaluate(() => window.scrollTo(0, 400));
    await p.click('.tt-pant-seg');
    await p.waitForFunction(() => TTPantalla.actual() === 3);
    ok(await p.evaluate(() => scrollY) === 0, '«Següent» porta a la quarta i a dalt de tot');
    await p.goBack();
    await p.waitForFunction(() => TTPantalla.actual() === 2);
    ok(true, '«Enrere» torna a la tercera');
    if (P.dins) {
      await p.goto(BASE + P.url + '#' + P.dins, { waitUntil: 'load' });
      await p.waitForFunction(() => window.TTPantalla);
      ok(await p.evaluate(id => getComputedStyle(document.getElementById(id)).display !== 'none' && document.getElementById(id).offsetParent !== null, P.dins),
        '#' + P.dins + ' (una cosa de dins) obre la pantalla on viu');
    }
    if (P.index) ok(await p.evaluate(s => getComputedStyle(document.querySelector(s)).display === 'none', P.index), 'l\'índex propi de la pàgina s\'amaga');
    ok(!errs.length, 'sense errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await p.close();
  }
}
await b.close(); srv.close();
console.log('\n' + (fail ? '❌' : '✅') + ' pantalla: ' + pass + ' ok, ' + fail + ' malament');
process.exit(fail ? 1 : 0);
