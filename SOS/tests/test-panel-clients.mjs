/* El tablero de clientes del panel · /cliente/#panel
   ─────────────────────────────────────────────────────────────────────────
   Álvaro (11/11/2026): «tablero de gestión de clientes que vaya también en el
   iPhone». La función del panel se simula; se prueba la vista:
   · Cada invitado sale en su fase: la que él puso o, si no, la de sus datos.
   · «→» lo pasa a la siguiente y se guarda (PUT {mail, fase}); «←» lo devuelve.
   · Si no se puede guardar, vuelve a donde estaba y lo dice.
   · En el iPhone: las columnas se deslizan de lado sin mover la página, los
     botones de fase llevan a cada columna y la clave no amplía la pantalla. */
import { chromium, devices } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { serve } from './serve.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const conv = (mail, nom, x) => Object.assign({ mail, nom, tope: 2, params: { org: nom + ' SL' }, enllac: 'https://x/cliente/?inv=a', gastat: 0, voltes: 0, ultim: '', entrat: '', espai: null }, x);
const DADES = { estat: 'fet', ia: { actiu: true, tope: 0.5, topeDia: 5 }, dia: { usd: 0 }, mes: { usd: 0, persones: 0 }, variable: [], convidats: [
  conv('maria@ele.es', 'María', { fase: 'propuesta', entrat: '2026-11-05T10:00:00Z', espai: { persones: 4, programes: 2, formularis: 1, disseny: true, actualitzada: '2026-11-10T10:00:00Z' } }),
  conv('sara@bodega.es', 'Sara', { espai: { persones: 3, programes: 0, formularis: null, disseny: false } }),
  conv('aida@vilar.es', 'Aida')] };

const srv = await serve(join(DIR, '..', '..'), 0), URL_ = 'http://127.0.0.1:' + srv.address().port + '/cliente/index.html#panel';
const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] }, process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
for (const [nom, opc] of [['iPhone', Object.assign({}, devices['iPhone 13'], { deviceScaleFactor: 1 })], ['escritorio', { viewport: { width: 1280, height: 900 } }]]) {
  console.log('\n══ /cliente/#panel · tablero · ' + nom + ' ══');
  const ctx = await b.newContext(opc), p = await ctx.newPage(), errs = [], puts = [];
  let falla = false;
  p.on('pageerror', e => errs.push(e.message));
  await p.route('**/.netlify/functions/convidats**', r => {
    const m = r.request().method();
    if (m === 'PUT') { puts.push(JSON.parse(r.request().postData())); return falla ? r.fulfill({ status: 400, contentType: 'application/json', body: '{"motiu":"sin red"}' }) : r.fulfill({ contentType: 'application/json', body: '{"estat":"fet","convidat":{}}' }); }
    return r.fulfill({ contentType: 'application/json', body: JSON.stringify(DADES) });
  });
  await p.goto(URL_);
  if (nom === 'iPhone') ok(await p.$eval('#pn-clau', e => parseFloat(getComputedStyle(e).fontSize) >= 16), 'la clave tiene 16 px: Safari no amplía la pantalla');
  await p.fill('#pn-clau', 't'.repeat(32)); await p.click('text=Entrar');
  await p.waitForSelector('.pn-tauler');
  const a = s => p.locator('.pn-k', { hasText: s });
  ok(await a('María').evaluate(e => e.closest('.pn-col').id) === 'pn-col-propuesta', 'María, en la fase que le puso él');
  ok(await a('Sara').evaluate(e => e.closest('.pn-col').id) === 'pn-col-mapa', 'Sara, sin fase pero con gente en su mapa: «Haciendo su mapa»');
  ok(await a('Aida').evaluate(e => e.closest('.pn-col').id) === 'pn-col-invitado', 'Aida, sin nada: «Invitado»');
  await a('Sara').getByRole('button', { name: 'Propuesta enviada →' }).click();
  ok(await a('Sara').evaluate(e => e.closest('.pn-col').id) === 'pn-col-propuesta' && puts.at(-1).fase === 'propuesta' && puts.at(-1).mail === 'sara@bodega.es', '«→» la pasa a la siguiente y se guarda');
  await a('Sara').getByRole('button', { name: 'Volver a «Haciendo su mapa»' }).click();
  ok(await a('Sara').evaluate(e => e.closest('.pn-col').id) === 'pn-col-mapa', '«←» la devuelve');
  falla = true;
  await a('Aida').getByRole('button', { name: 'Haciendo su mapa →' }).click();
  await p.waitForTimeout(200);
  ok(await a('Aida').evaluate(e => e.closest('.pn-col').id) === 'pn-col-invitado' && /No se ha movido/.test(await p.textContent('.pn-cos')), 'si no se guarda, vuelve a su sitio y lo dice');
  falla = false;
  await a('María').getByRole('button', { name: 'Ficha' }).click();
  ok(await p.evaluate(() => document.activeElement && document.activeElement.id === 'pn-c-maria-ele-es'), '«Ficha» lleva a su ficha completa');
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'la página no se mueve de lado');
  if (nom === 'iPhone') {
    ok(await p.$eval('.pn-tauler', e => e.scrollWidth > e.clientWidth && getComputedStyle(e).scrollSnapType.includes('x')), 'las columnas se deslizan de lado, una a una');
    await p.locator('.pn-xip', { hasText: 'Entregado' }).click(); await p.waitForTimeout(600);
    ok(await p.$eval('.pn-tauler', e => e.scrollLeft > 0), 'los botones de fase llevan a su columna');
    ok(await p.$$eval('.pn-ka .btn', bs => bs.every(x => x.getBoundingClientRect().height >= 44)), 'botones de 44 px, para el dedo');
  } else ok(await p.$eval('.pn-tauler', e => e.scrollWidth <= e.clientWidth + 1), 'en el escritorio, las cinco columnas a la vista');
  ok(!errs.length, 'sin errores' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await ctx.close();
}
await b.close(); srv.close();
console.log('\n' + pass + ' ✓ · ' + fail + ' ✗');
process.exit(fail ? 1 : 0);
