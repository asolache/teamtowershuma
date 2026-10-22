/* La marca d'una organització (22/10/2026): estàndard amb marge per personalitzar.
   La pell és una; una organització hi posa el seu color, la seva lletra i la
   forma amb el mateix marca.json de la seva web, i el color sempre es llegeix. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
const Marca = createRequire(import.meta.url)('../lib/marca.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

console.log('\n1 · Les regles són les de la web del client');
const m = Marca.neta({ color: '#ffcc00', lletra: 'serif', forma: 'recta', logoSvg: '<svg onload="x()"></svg>', res: 1 });
ok(m.color === '#ffcc00' && m.lletra === 'serif' && m.forma === 'recta' && !m.logoSvg && !('res' in m), 'neta() guarda color, lletra i forma, i treu el logo amb scripts i el que no és de marca');
const clar = /html:root\{--indigo:(#[0-9a-f]{6})\}/.exec(Marca.pell(m))[1];
ok(Marca.contrast(clar, '#fbfaf7') >= 4.5, 'un groc clar s\'enfosqueix fins a llegir-se sobre el paper (' + clar + ')');
ok(Marca.pell({}) === '', 'sense marca, la pell de sempre');

console.log('\n2 · L\'app la posa i la recorda');
const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await (await b.newContext({ viewport: { width: 1280, height: 860 } })).newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS);
await page.evaluate(() => window.__SOS.openSettingsModal());
ok(await page.$('#stMarca input[type=file]') && await page.$('#stMarcaTreu'), 'Configuració ofereix carregar marca.json i treure-la');
await page.setInputFiles('#stMarca input', { name: 'marca.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ color: '#ffcc00', forma: 'recta' })) });
await page.waitForFunction(() => document.getElementById('sosMarca'));
const ind = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--indigo').trim());
ok(await ind() === clar, 'l\'accent de tota l\'app és el de la marca (' + await ind() + ')');
await page.reload();
await page.waitForFunction(() => window.__SOS);
ok(await ind() === clar, 'i hi és abans de pintar quan es torna a obrir');
await page.evaluate(() => window.__SOS.openSettingsModal());
await page.click('#stMarcaTreu');
await page.waitForFunction(() => getComputedStyle(document.documentElement).getPropertyValue('--indigo').trim() === '#4f46e5');
ok(true, 'treure-la torna la pell de sempre');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' passen'));
process.exit(fail ? 1 : 0);
