/* «Ja tinc perfil» (03/11/2026): qui ja en té un entra sense passar per l'alta.
   · A la portada hi ha «Entra →», i #/entra obre la pantalla.
   · Tres camins: una còpia, un altre aparell i la fitxa de /online.
   · Una còpia que no és del SOS es diu, no es menja en silenci.
   · Sense identitat a l'aparell, la fitxa de /online demana portar-la primer. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.openEntra);
await page.waitForTimeout(800);

console.log('\n1 · La porta');
ok(await page.evaluate(() => !!document.querySelector('#onboarding #obEntra')), 'a la portada hi ha «Entra →»');
await page.click('#obEntra');
await page.waitForTimeout(300);
const r = await page.evaluate(() => ({ hash: location.hash, ops: document.querySelectorAll('#modalRoot .ent-op').length,
  t: (document.querySelector('#modalRoot h2') || {}).textContent }));
ok(r.hash === '#/entra', 'porta a #/entra (' + r.hash + ')');
ok(/Entra/.test(r.t || ''), 'la pantalla és «Ja tens perfil? Entra»');
ok(r.ops === 3, 'amb tres camins: còpia, altre aparell i /online');

console.log('\n2 · Una còpia que no ho és');
const dir = mkdtempSync(join(tmpdir(), 'entra-'));
writeFileSync(join(dir, 'no.json'), JSON.stringify({ hola: 1 }));
await page.setInputFiles('#enFitxer', join(dir, 'no.json'));
await page.waitForTimeout(300);
ok(await page.evaluate(() => /no és una còpia/.test(document.querySelector('#enMsg').textContent)), 'es diu que no és una còpia del SOS');

console.log('\n3 · La fitxa de /online sense identitat');
await page.evaluate(async () => { const all = await new Promise(r => { const q = indexedDB.open('SOS_MVP', 1); q.onsuccess = () => { const db = q.result; const tx = db.transaction('nodes', 'readwrite'); tx.objectStore('nodes').delete('__identity'); tx.oncomplete = () => r(); }; }); });
await page.click('#enOnline');
await page.waitForTimeout(400);
ok(await page.evaluate(() => /encara no té la teva identitat/.test(document.querySelector('#enMsg').textContent)), 'demana portar primer la identitat');

console.log('\n4 · Crear-ne un');
await page.click('#enNou');
await page.waitForTimeout(300);
ok(await page.evaluate(() => !!document.querySelector('#modalRoot #shName')), '«Crea el teu perfil» obre l\'alta');
await b.close();
console.log('\n' + pass + ' ✓ · ' + fail + ' ✗');
process.exit(fail ? 1 : 0);
