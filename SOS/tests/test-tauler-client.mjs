/* El tauler del client · SOS/lib/tauler-client.js
   ─────────────────────────────────────────────────────────────────────────
   · Les targetes surten de les fletxes del mapa, una per sentit.
   · El que no es paga i els diners van a «Lo lleva una persona», mai al tauler.
   · Sense «cuándo pasa» i «quién lo revisa» no hi ha paquet: «Por definir».
   · «Que vaya solo» només si la regla del tauler diu que ho pot fer una màquina.
   · A /cliente/: definir, moure, enllaç per targeta i que es desa amb el mapa. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { serve } from './serve.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const req = createRequire(import.meta.url);
const TC = req('../lib/tauler-client.js'), MM = req('../lib/models-mapa.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

console.log('\n══ tauler-client.js ══');
const auto = (q, k) => MM.automatitza(q, k, 'es');
const pairs = [
  ['Escuela', 'Quien quiere ser profesor', 'tangible', 'el presupuesto del curso', 'tangible', 'la factura de la matrícula'],
  ['Escuela', 'Quien me recomienda', 'intangible', 'una comunidad', 'intangible', 'alumnos nuevos'],
  ['Escuela', 'Quien avala el título', 'tangible', 'el informe del curso', 'tangible', 'el sello']
];
const cs = TC.cartes(pairs, auto);
ok(cs.length === 6 && new Set(cs.map(c => c.id)).size === 6, 'una tarjeta por flecha y sentido, con su enlace propio');
const per = cs.filter(c => TC.columna(c, {}) === 'persona').map(c => c.que);
ok(per.includes('una comunidad') && per.includes('alumnos nuevos') && per.includes('la factura de la matrícula'), 'lo que no se paga y el dinero los lleva una persona: ' + per.join(', '));
const pres = cs.find(c => c.que === 'el presupuesto del curso'), sello = cs.find(c => c.que === 'el sello');
ok(pres.qui === 'maquina' && TC.columna(pres, {}) === 'c1', 'el presupuesto lo puede preparar una máquina, y empieza por definir');
ok(TC.columna(pres, { col: 'c3', quan: 'Cada vez', revisa: '' }) === 'c1', 'sin quién lo revisa no hay paquete, aunque lo pidan solo');
ok(TC.columna(pres, { col: 'c3', quan: 'Cada vez', revisa: 'Escuela' }) === 'c3', 'con el paquete hecho puede ir solo');
ok(sello.qui !== 'maquina' && TC.columna(sello, { col: 'c3', quan: 'Cada mes', revisa: 'Escuela' }) === 'c2', 'lo que la regla no deja preparar a una máquina se queda en «Definido»');
const r = TC.resum(cs, { [pres.id]: { col: 'c3', quan: 'Cada vez que alguien lo pide', porta: 'las fechas', revisa: 'Escuela' } }, 'es');
ok(/Tablero: \d+ por definir · 0 definidos · 1 que irán solos/.test(r) && /el presupuesto del curso .*las fechas.*Escuela · que vaya solo/.test(r), 'el encargo lleva cada paquete en una línea');
ok(TC.resum([], {}, 'es') === '', 'sin mapa, nada');

const srv = await serve(join(DIR, '..', '..'), 0), URL_ = 'http://127.0.0.1:' + srv.address().port + '/cliente/index.html';
const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] }, process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
for (const [nom, vp] of [['mòbil', { width: 375, height: 800 }], ['escriptori', { width: 1280, height: 900 }]]) {
  console.log('\n══ /cliente/#tablero · ' + nom + ' ══');
  const ctx = await b.newContext({ viewport: vp }), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL_);
  ok(/tarjeta/.test(await p.textContent('#cl-tauler')), 'sin mapa, el tablero explica qué aparecerá');
  await p.evaluate(() => localStorage.setItem('tt.cliente.v1', JSON.stringify({ casa: 'Escuela', org: 'Escuela Sol', alcance: 'global', respuestas: {}, alrededor: [
    { quien: 'Quien quiere ser profesor', meDa: 'la factura de la matrícula', meDaEs: 'tangible', leDoy: 'el presupuesto del curso', leDoyEs: 'tangible' },
    { quien: 'Quien me recomienda', meDa: 'alumnos nuevos', meDaEs: 'intangible', leDoy: 'una comunidad', leDoyEs: 'intangible' },
    { quien: 'Quien avala el título', meDa: 'el sello', meDaEs: 'tangible', leDoy: 'el informe del curso', leDoyEs: 'tangible' }] })));
  await p.reload();
  const card = p.locator('#cl-tauler article', { hasText: 'El presupuesto del curso' });
  ok(await card.getAttribute('data-col') === 'c1', 'el presupuesto aparece en «Por definir»');
  ok(/Lo lleva una persona · 3/.test(await p.textContent('#cl-tauler')), 'y lo que no se paga y el dinero, aparte');
  await card.getByRole('button', { name: 'Definir' }).click();
  if (nom === 'mòbil') {
    ok(await p.evaluate(() => [...document.querySelectorAll('#cl-tauler form input, #cl-tauler form textarea, #cl-tauler form select')].every(e => parseFloat(getComputedStyle(e).fontSize) >= 16)), 'iPhone: los campos tienen 16 px, Safari no amplía la página al escribir');
    await p.focus('#cl-tauler form textarea');
    ok(await p.evaluate(() => getComputedStyle(document.querySelector('.viu-b')).display === 'none' && getComputedStyle(document.querySelector('.avanc-pill')).display === 'none'), 'iPhone: al escribir, los botones flotantes no tapan el campo');
  }
  await p.locator('#cl-tauler form button[type=submit]').click();
  await p.locator('#cl-tauler form fieldset button', { hasText: 'Cada vez que alguien lo pide' }).click();
  await p.fill('#cl-tauler form textarea', 'las fechas y el número de alumnos');
  await p.locator('#cl-tauler form button[type=submit]').click();
  ok(await card.getAttribute('data-col') === 'c2', 'definido el paquete, pasa a «Definido»');
  await card.getByRole('button', { name: 'Que vaya solo →' }).click();
  ok(await card.getAttribute('data-col') === 'c3' && /Pedido/.test(await card.textContent()), 'y se pide que vaya solo, sin hacer ver que ya funciona');
  const desat = await p.evaluate(() => JSON.parse(localStorage.getItem('tt.cliente.v1')).tauler);
  ok(Object.values(desat || {}).some(e => e.col === 'c3' && /fechas/.test(e.porta)), 'se guarda con el mapa');
  const id = await card.getAttribute('id');
  await p.goto(URL_ + '#' + id); await p.waitForTimeout(300);
  ok(await p.locator('#' + id).evaluate(e => e.classList.contains('tc-on')), 'cada tarjeta tiene su enlace y se abre marcada');
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'sin desplazamiento de lado');
  const cols = await p.locator('#cl-tauler .tc-n a').evaluateAll(as => as.map(a => a.getAttribute('href')));
  ok(cols.length === 3 && (await p.evaluate(hs => hs.every(h => document.getElementById(h.slice(1))), cols)), 'los contadores llevan a cada columna');
  await p.goto(URL_.replace('index.html', 'index.html?lang=ca') + '#tablero');
  ok(/Que vagi sol/.test(await p.textContent('#cl-tauler')) && /El teu tauler/.test(await p.textContent('#tablero')), 'en catalán también');
  ok(!errs.length, 'sin errores' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await ctx.close();
}
await b.close(); srv.close();
console.log('\n' + pass + ' ✓ · ' + fail + ' ✗');
process.exit(fail ? 1 : 0);
