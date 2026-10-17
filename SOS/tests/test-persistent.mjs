/* La base local es demana persistent (auditoria MVP, 17/10/2026). Sense
   `navigator.storage.persist()` el navegador pot esborrar la IndexedDB quan va
   just d'espai, i un client pilot perdria el seu node sense saber-ho. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

console.log('\n1 · En obrir la base, es demana que no s\'esborri');
const ctx = await b.newContext();
await ctx.addInitScript(() => {
  window.__persist = 0;
  const s = navigator.storage;
  if (s) { s.persisted = () => Promise.resolve(false); s.persist = () => { window.__persist++; return Promise.resolve(true); }; }
});
const page = await ctx.newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP, { waitUntil: 'load' });
await page.waitForFunction(() => window.__persist > 0, null, { timeout: 5000 }).catch(() => {});
ok(await page.evaluate(() => window.__persist === 1), 'navigator.storage.persist() es crida un cop');
await ctx.close();

console.log('\n2 · Si ja és persistent, no es torna a demanar');
const ctx2 = await b.newContext();
await ctx2.addInitScript(() => {
  window.__persist = 0;
  const s = navigator.storage;
  if (s) { s.persisted = () => Promise.resolve(true); s.persist = () => { window.__persist++; return Promise.resolve(true); }; }
});
const p2 = await ctx2.newPage();
await p2.goto(APP, { waitUntil: 'load' });
await p2.waitForTimeout(800);
ok(await p2.evaluate(() => window.__persist === 0), 'no es torna a demanar');
await ctx2.close();

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
