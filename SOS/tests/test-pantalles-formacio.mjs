/* Mòdul ↔ pantalla i còpies a una carpeta, al navegador (Playwright, mòbil).
   · Una pàgina d'eina i una ruta de l'app ensenyen la pastilla «S'aprèn al
     mòdul…» que porta a formacio.html#mN.
   · A formacio.html, la vista d'una pantalla no es carrega fins que s'obre.
   · La pantalla de còpia obre la de les còpies automàtiques.
   Si es passa SHOTS=<carpeta>, hi deixa les captures. */
import { chromium, devices } from 'playwright';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { serve } from './serve.mjs';

const ARREL = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PORT = 8791, U = `http://127.0.0.1:${PORT}`;
const SHOTS = process.env.SHOTS || '';
const srv = await serve(ARREL, PORT);
const b = await chromium.launch();
let ok = 0;
const prova = async (nom, fn) => { await fn(); ok++; console.log('  ✓ ' + nom); };
console.log('\nPantalles i formació, al navegador');
try {
  const c = await b.newContext({ ...devices['iPhone 13'] });
  const p = await c.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const shot = async (n, el) => { if (SHOTS) await (el || p).screenshot({ path: join(SHOTS, n + '.png') }); };

  await prova('el Banc de Temps diu a quin mòdul s\'aprèn', async () => {
    await p.goto(U + '/SOS/banc-temps.html');
    await p.waitForSelector('#tt-mp', { timeout: 8000 });
    assert.match(await p.textContent('#tt-mp'), /mòdul 4/);
    assert.equal(await p.getAttribute('#tt-mp a', 'href'), '/SOS/formacio.html#m4');
    await shot('banc-temps');
  });
  await prova('l\'app també: #/identitat torna al mòdul 2', async () => {
    await p.goto(U + '/SOS/index.html#/identitat');
    await p.waitForSelector('#tt-mp', { timeout: 8000 });
    assert.match(await p.textContent('#tt-mp'), /mòdul 2/);
    await shot('app-identitat');
  });
  await prova('la còpia de seguretat porta a les còpies automàtiques', async () => {
    await p.goto(U + '/SOS/index.html#/copia');
    await p.waitForSelector('#cpAuto', { timeout: 8000 });
    await p.click('#cpAuto');
    await p.waitForSelector('dialog.tt-cc[open]', { timeout: 4000 });
    const t = await p.textContent('dialog.tt-cc');
    /* Chromium headless té showDirectoryPicker; un mòbil de debò no: les dues
       branques diuen què passa. */
    assert.ok(/carpeta/i.test(t), t.slice(0, 120));
    await shot('copia-automatica');
  });
  await prova('formacio.html: la vista no es carrega fins que s\'obre', async () => {
    await p.goto(U + '/SOS/formacio.html#m4');
    const f = '#m4 details.vista-pant iframe';
    assert.equal(await p.getAttribute(f, 'src'), null);
    await p.$eval('#m4 details.vista-pant', d => { d.open = true; });
    await p.waitForFunction(s => document.querySelector(s).getAttribute('src'), f, { timeout: 4000 });
    assert.equal(await p.getAttribute(f, 'src'), '/SOS/banc-temps.html');
    await p.waitForTimeout(1500);
    await shot('formacio-m4', await p.$('#m4 .pant-pr'));
    assert.equal(await p.$('#tt-mp'), null, 'formacio.html no és cap pantalla: sense pastilla');
  });
  await prova('sense errors de JavaScript', async () => { assert.deepEqual(errs, []); });
} finally { await b.close(); srv.close(); }
console.log(`\n✅ ${ok} proves de pantalles i formació al navegador.`);
