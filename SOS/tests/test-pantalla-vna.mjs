/* El mapa de valor en pantalles · SOS/vna.html amb SOS/lib/pantalla.js
   ─────────────────────────────────────────────────────────────────────────
   Peça 3 de la cua de pantalles.md (guardià, 14/11/2026). Va en un fitxer a
   part de test-pantalla.mjs perquè aquest el toca un altre PR obert; quan
   n'hi hagi prou, s'hi pot ajuntar com un pilot més.
   · Deu pantalles amb nom curt; la primera, «Inici», és el dibuix i les
     lectures, que llisquen elles (la pantalla no passa de dues alçades).
   · Les seccions generades (build-mapavalor.js) porten el seu id.
   · `#construccions` obre la seva pantalla; «Següent» i «Enrere» funcionen.
   · Al mòbil, sense desplaçament de costat; sense errors. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { serve } from './serve.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const srv = await serve(join(DIR, '..', '..'), 0), BASE = 'http://127.0.0.1:' + srv.address().port + '/SOS/vna.html';
const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] }, process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const IDS = ['com-es-llegeix', 'com-es-fa', 'que-sendu', 'a-la-sala', 'quatre-passes', 'els-rols', 'construccions', 'xarxa', 'colla'];
for (const [nom, vp] of [['tauleta', { width: 1180, height: 820 }], ['mòbil', { width: 390, height: 844 }]]) {
  console.log('\n══ SOS/vna.html · ' + nom + ' ══');
  const p = await b.newPage({ viewport: vp }), errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE, { waitUntil: 'load' });
  await p.waitForFunction(() => window.TTPantalla);
  const ps = await p.evaluate(() => TTPantalla.pantalles);
  ok(ps.length === 10, ps.length + ' pantalles');
  ok(ps[0].nom === 'Inici', 'la primera és «Inici», la del dibuix');
  ok(JSON.stringify(ps.slice(1).map(x => x.id)) === JSON.stringify(IDS), 'les altres, amb els seus id: ' + ps.slice(1).map(x => x.id).join(', '));
  ok(ps.every(x => x.nom && x.nom.length <= 20), 'cada pestanya té un nom curt');
  ok(await p.evaluate(() => getComputedStyle(document.getElementById('lzViz')).display !== 'none' && document.getElementById('lzViz').offsetParent !== null),
    'el dibuix es veu a la primera pantalla');
  if (nom === 'tauleta') {
    const alt = await p.evaluate(() => document.documentElement.scrollHeight / innerHeight);
    ok(alt <= 2, '«Inici» fa ' + alt.toFixed(1) + ' alçades (abans, 9,3): les lectures llisquen elles');
    ok(await p.evaluate(() => { const r = document.querySelector('.lz-read'); return r.scrollHeight > r.clientHeight; }), 'la llista de lectures té el seu propi desplaçament');
    const alts = [];
    for (let i = 0; i < ps.length; i++) {
      await p.evaluate(i => TTPantalla.mostra(i), i);
      alts.push(await p.evaluate(() => document.documentElement.scrollHeight / innerHeight));
    }
    ok(Math.max(...alts) <= 6, 'la pantalla més llarga fa ' + Math.max(...alts).toFixed(1) + ' alçades (la pàgina sencera, 29)');
  } else {
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'sense desplaçament de costat');
  }
  await p.goto(BASE + '#construccions', { waitUntil: 'load' });
  await p.waitForFunction(() => window.TTPantalla);
  const i = ps.findIndex(x => x.id === 'construccions');
  ok(await p.evaluate(() => TTPantalla.actual()) === i, '#construccions obre la seva pantalla');
  await p.click('.tt-pant-seg');
  await p.waitForFunction(i => TTPantalla.actual() === i + 1, i);
  ok(true, '«Següent» porta a «' + ps[i + 1].nom + '»');
  await p.goBack();
  await p.waitForFunction(i => TTPantalla.actual() === i, i);
  ok(true, '«Enrere» hi torna');
  ok(!errs.length, 'sense errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await p.close();
}
await b.close(); srv.close();
console.log('\n' + (fail ? '❌' : '✅') + ' pantalla vna: ' + pass + ' ok, ' + fail + ' malament');
process.exit(fail ? 1 : 0);
