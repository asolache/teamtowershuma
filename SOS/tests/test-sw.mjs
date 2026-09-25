/* La còpia local · que el SOS no es torni a baixar sencer cada vegada
 *
 * El SOS pesa mig mega en gzip i fins ara es baixava sencer a cada visita: 10
 * segons amb 3G lent, i 10 segons **cada cop**. `SOS/sw.js` ho arregla, i
 * aquesta prova comprova les tres coses que han de ser certes perquè valgui la
 * pena i no faci mal:
 *
 *   1. Que es registri de debò. Va fallar al primer intent —el registre
 *      esperava l'esdeveniment `load`, que ja havia passat quan arrenca l'app—
 *      i no donava cap error: simplement no passava res.
 *   2. Que la segona visita no torni a demanar-ho tot.
 *   3. Que sense cobertura l'app segueixi obrint-se.
 *
 * Cal servir per HTTP: un service worker no es registra des de `file://`, que
 * és com corren les altres proves. Per això aquesta aixeca un servidor.
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ARREL = process.cwd().endsWith('SOS/tests') ? join(process.cwd(), '..', '..') : process.cwd();
const PORT = 8794;
const TIPUS = { html: 'text/html', js: 'text/javascript', webmanifest: 'application/manifest+json' };
let servides = 0;

const srv = createServer((q, r) => {
  let f = q.url.split('?')[0];
  if (f.endsWith('/')) f += 'index.html';
  const p = join(ARREL, decodeURIComponent(f));
  if (!existsSync(p) || !p.startsWith(ARREL)) { r.writeHead(404); r.end('no'); return; }
  servides++;
  r.writeHead(200, { 'content-type': (TIPUS[p.split('.').pop()] || 'text/plain') + '; charset=utf-8' });
  r.end(readFileSync(p));
});
await new Promise(ok => srv.listen(PORT, ok));

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const URL_APP = `http://localhost:${PORT}/SOS/index.html`;

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const ctx = await b.newContext();
let err = null;

console.log('\n1 · Es registra i pren el control');
const p = await ctx.newPage();
p.on('pageerror', e => { err = e.message; });
await p.goto(URL_APP, { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(5000);
const reg = await p.evaluate(async () => {
  const g = await navigator.serviceWorker.getRegistration();
  return { hi: !!g, actiu: !!(g && g.active), ctrl: !!navigator.serviceWorker.controller };
});
ok(reg.hi && reg.actiu, 'el service worker s\'activa');
ok(reg.ctrl, 'i controla la pàgina');
ok(!err, 'sense cap error de pàgina' + (err ? ': ' + err : ''));

console.log('\n2 · La segona visita gairebé no demana res');
await p.waitForTimeout(1500);
const abans = servides;
const p2 = await ctx.newPage();
const t0 = Date.now();
await p2.goto(URL_APP, { waitUntil: 'domcontentloaded' });
await p2.waitForFunction(() => window.__SOS && window.__SOS.state, { timeout: 15000 });
const ms = Date.now() - t0;
const noves = servides - abans;
console.log(`  · ${noves} peticions al servidor · interactiu en ${ms} ms`);
/* Amb «còpia primer i refresc a sota» la segona visita serveix de la memòria
   cau i demana el refresc de fons: es tolera el refresc, no una baixada nova
   de tot el que hi ha a la porta. */
ok(noves <= 3, `la segona visita no torna a baixar l'app (${noves} peticions)`);

console.log('\n3 · Sense cobertura, segueix obrint-se');
await ctx.setOffline(true);
let viu = true;
try {
  const p3 = await ctx.newPage();
  await p3.goto(URL_APP, { waitUntil: 'domcontentloaded' });
  await p3.waitForFunction(() => window.__SOS && window.__SOS.state, { timeout: 12000 });
} catch (e) { viu = false; }
ok(viu, 'l\'app arrenca sencera sense xarxa');
await ctx.setOffline(false);

console.log('\n4 · El que la còpia no toca');
const sw = readFileSync(join(ARREL, 'SOS', 'sw.js'), 'utf8');
ok(/url\.origin !== self\.location\.origin/.test(sw),
  'no intercepta res que vagi a fora: l\'API d\'IA i els relés passen de llarg');
ok(/req\.method !== 'GET'/.test(sw), 'ni res que no sigui una lectura');
ok(/versio-nova/.test(sw), 'i avisa la pestanya quan el refresc porta codi nou');

await b.close();
srv.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
