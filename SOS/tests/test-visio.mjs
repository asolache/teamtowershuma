/* La visió del SOS (21/11/2026) · pantalles, segona llengua, potencial i fonts.
 *
 * Tres coses que no peten soles i que aquí es miren:
 * · que cada pantalla hi càpiga a tauleta i mòbil (regla «pantalles, no rotlles»);
 * · que el potencial de Catalunya i Espanya surti de SOS/lib/impacte.js —el
 *   mateix càlcul que el simulador de l'app— i no d'una xifra escrita a mà;
 * · que cada [n] citat a la pàgina tingui la seva font a la pantalla «Fonts».
 *
 *   node SOS/tests/test-visio.mjs   (SHOTS=<carpeta> desa captures) */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { serve } from './serve.mjs';

const ARREL = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PORT = 8000 + Math.floor(Math.random() * 900);
const srv = await serve(ARREL, PORT);
const URL = `http://127.0.0.1:${PORT}/SOS/visio.html`;
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const PANT = ['ciutadania', 'estalvi', 'empresa', 'administracio', 'potencial', 'emprenedoria', 'fonts'];

for (const [w, h, nom] of [[1180, 820, 'tauleta'], [390, 844, 'mòbil']]) {
  console.log(`\n${nom} · ${w}×${h}`);
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.documentElement.classList.contains('tt-pant-on')), 'la pàgina va per pantalles');
  for (const id of ['inici'].concat(PANT)) {
    await p.goto(URL + '#' + id); await p.waitForTimeout(250);
    const alt = await p.evaluate(() => document.documentElement.scrollHeight);
    ok(alt / h <= (nom === 'mòbil' ? 3.2 : 2), `#${id} fa ${(alt / h).toFixed(2)} pantalles`);
    if (process.env.SHOTS && ['inici', 'estalvi', 'potencial'].includes(id))
      await p.screenshot({ path: join(process.env.SHOTS, `visio-${nom}-${id}.png`) });
  }
  const amp = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  ok(amp, 'sense scroll horitzontal');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await p.close();
}

console.log('\nEl potencial surt de la llibreria');
const p = await b.newPage();
await p.goto(URL + '#potencial'); await p.waitForTimeout(300);
const r = await p.evaluate(() => {
  const I = window.Impacte, rs = I.escala('catalunya');
  return { esp: I.eur(rs[1].economic.total, 'ca'), txt: document.getElementById('potCat').textContent,
    barres: document.querySelectorAll('#potCat svg rect, #potEsp svg rect').length,
    pob: I.TERRITORIS.catalunya.population };
});
ok(r.txt.includes(r.esp), `Catalunya al 5 %: ${r.esp}, el mateix que calcula Impacte.escala`);
ok(r.barres === 8, `dos gràfics de quatre barres (${r.barres})`);
ok(r.pob === 8210710, 'Catalunya amb la població d\'Idescat a 1/1/2026');

console.log('\nCada cita té la seva font');
const cites = await p.evaluate(() => {
  const ids = [...document.querySelectorAll('sup a[href^="#f"]')].map(a => a.getAttribute('href').slice(1));
  return { ids: [...new Set(ids)], falten: ids.filter(i => !document.getElementById(i)),
    sense: [...document.querySelectorAll('ol.fonts li')].filter(li => !li.querySelector('a') && !li.querySelector('em')).map(li => li.id) };
});
ok(!cites.falten.length, `${cites.ids.length} cites, totes amb la seva entrada` + (cites.falten.length ? ': falten ' + cites.falten : ''));
ok(!cites.sense.length, 'cada font té un enllaç o la referència de l\'obra');

console.log('\nLa segona llengua');
await p.goto(URL + '?lang=es#potencial'); await p.waitForTimeout(300);
const es = await p.evaluate(() => ({ h1: document.querySelector('h1').textContent, lang: document.documentElement.lang,
  pot: document.getElementById('potCat').textContent, tab: [...document.querySelectorAll('.tt-pant-tabs a')].map(a => a.textContent).join('|') }));
ok(es.lang === 'es' && /sociedad/.test(es.h1), 'el títol en castellà');
ok(/Cataluña/.test(es.pot) && /hogares/.test(es.pot), 'el potencial en castellà');
ok(/Ciudadanía/.test(es.tab), 'les pestanyes en castellà');

console.log('\nEl simulador de l\'app, amb Catalunya configurada');
const a = await b.newPage({ viewport: { width: 1180, height: 820 } });
const aerrs = []; a.on('pageerror', e => aerrs.push(e.message));
await a.goto(`http://127.0.0.1:${PORT}/SOS/index.html#/fons/impacte`);
await a.waitForSelector('#impPop', { timeout: 30000 }).catch(() => {});
await a.waitForTimeout(500);
const sim = await a.evaluate(() => ({ pop: document.querySelector('#impPop') && document.querySelector('#impPop').value,
  barres: document.querySelectorAll('#impKPIs svg rect').length, txt: (document.querySelector('#impKPIs') || {}).textContent || '' }));
ok(sim.pop === '8210710', `obre amb Catalunya (${sim.pop})`);
ok(sim.barres === 9, `cinc mòduls i quatre penetracions als gràfics (${sim.barres})`);
ok(!/solitud/.test(sim.txt), 'sense percentatges psicosocials sense font');
if (process.env.SHOTS) await a.screenshot({ path: join(process.env.SHOTS, 'app-simulador.png') });
await a.click('[data-ter="espanya"]'); await a.waitForTimeout(200);
ok(await a.evaluate(() => document.querySelector('#impPop').value) === '49935642', 'el botó Espanya posa la població de l\'INE');
ok(!aerrs.length, 'cap error de JavaScript a l\'app' + (aerrs.length ? ': ' + aerrs[0] : ''));

await b.close(); srv.close();
console.log(`\n${fail ? '❌' : '✅'} visio · ${pass} ok, ${fail} malament`);
process.exit(fail ? 1 : 0);
