/* «La màxima de tot és un enllaç.» Les rutes de node eren `#/n/<id>`, amb un id
   a l'atzar que només existia al navegador que l'havia creat: a qualsevol altre
   mòbil, «aquesta vista no existeix». Aquí s'obre cada enllaç en un navegador
   **net** i es comprova que pinta el lloc, que la pestanya hi va, que «enrere»
   torna i que hi ha el botó per copiar-lo. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const vista = p => p.evaluate(() => ({ hash: location.hash,
  h1: (document.querySelector('#workspace h1') || {}).textContent || '',
  tab: (document.querySelector('.tabs .tab.active') || {}).textContent || '' }));
const obre = async (ruta) => {
  const ctx = await b.newContext(); const page = await ctx.newPage();
  page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
  await page.goto(APP);
  await page.waitForFunction(() => window.__SOS && window.__SOS.markOnboardingDone);
  await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });
  await page.goto(APP + ruta);
  await page.waitForFunction(() => document.querySelector('#workspace h1'), null, { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(400);
  return page;
};

console.log('\n1 · Un territori s\'obre pel nom en un navegador que no l\'ha vist mai');
let p = await obre('#/t/catalunya/barcelona/alt-penedes/vilafranca-del-penedes/socis');
let v = await vista(p);
ok(v.h1 === 'Vilafranca del Penedès', 'pinta Vilafranca: ' + v.h1);
ok(/^#\/t\/catalunya\/barcelona\/alt-penedes\/vilafranca-del-penedes/.test(v.hash), 'i l\'URL és el camí de noms: ' + v.hash);

console.log('\n2 · Es poden saltar nivells');
p = await obre('#/t/catalunya/alt-penedes');
v = await vista(p);
ok(v.h1 === 'Alt Penedès', 'catalunya/alt-penedes obre la comarca: ' + v.h1);

console.log('\n3 · Canviar de pestanya deixa rastre i «enrere» hi torna');
const abans = v.hash;
await p.click('.tabs .tab:not(.tab-more):nth-child(2)');
await p.waitForTimeout(300);
const despres = await vista(p);
ok(despres.hash !== abans && despres.hash.startsWith('#/t/'), 'la pestanya canvia l\'URL: ' + despres.hash);
await p.goBack(); await p.waitForTimeout(600);
v = await vista(p);
ok(v.hash === abans, 'enrere torna a ' + abans + ': ' + v.hash);

console.log('\n4 · Cada vista té el botó per copiar l\'enllaç');
ok(!!(await p.$('.nh-actions [aria-label^="Copia l\'enllaç"]')), 'hi ha 🔗 a la capçalera');

console.log('\n5 · Els enllaços antics #/n/<id> segueixen obrint al mateix navegador');
const id = await p.evaluate(() => window.__SOS.state.activeId);
await p.evaluate(i => { location.hash = '#/n/' + i + '/map'; }, id);
await p.waitForTimeout(500);
v = await vista(p);
ok(v.h1 === 'Alt Penedès', '#/n/<id> obre el mateix node: ' + v.h1);

console.log('\n6 · Un tros que no existeix obre el més proper i no peta');
p = await obre('#/t/catalunya/alt-penedes/no-existeix');
v = await vista(p);
ok(v.h1 === 'Alt Penedès', 'queda a l\'Alt Penedès: ' + v.h1);

console.log('\n7 · El fons, l\'impacte a Catalunya i el pla fundador tenen enllaç');
for (const [ruta, txt] of [['#/fons', null], ['#/fons/impacte', 'Impacte'], ['#/fons/pla', 'Mapa de valor estratègic']]) {
  p = await obre(ruta);
  const r = await p.evaluate(() => ({ hash: location.hash, modal: (document.querySelector('#modalRoot h2') || {}).textContent || '' }));
  ok(r.hash === ruta && (!txt || r.modal.includes(txt)), ruta + ' obre ' + (r.modal || 'el fons') + ' i l\'URL es queda: ' + r.hash);
}

console.log('\n8 · El tauler de capes: totes les portades al mateix lloc, amb enllaç');
p = await obre('#/t/catalunya/alt-penedes');
await p.evaluate(() => { location.hash = '#/territoris'; });
await p.waitForSelector('.tb-nav a', { timeout: 5000 }).catch(() => {});
let t = await p.evaluate(() => ({ hash: location.hash, vista: window.__SOS.state.homeView,
  hrefs: [...document.querySelectorAll('.tb-nav a')].map(a => a.getAttribute('href')),
  actual: (document.querySelector('.tb-nav a[aria-current=page]') || {}).textContent || '' }));
ok(t.vista === 'mapa' && t.hash === '#/territoris', '#/territoris obre el mapa de Catalunya (abans #/mapa obria el pla fundador): ' + t.hash);
ok(t.actual === 'Territoris', 'i el tauler la marca com a actual: ' + t.actual);
const totes = ['#/tauler', '#/', '#/gent', '#/aprop', '#/directori', '#/territoris', '#/fons', '#/fons/impacte', '#/fons/pla'];
ok(totes.every(h => t.hrefs.includes(h)), 'cap portada sense lloc: ' + t.hrefs.join(' '));
await p.click('.tb-nav a[data-id="gent"]'); await p.waitForTimeout(500);
t = await p.evaluate(() => ({ hash: location.hash, vista: window.__SOS.state.homeView, n: document.querySelectorAll('.tb-nav').length }));
ok(t.hash === '#/gent' && t.vista === 'gent' && t.n === 1, 'un toc porta a Gent, i el tauler hi segueix, un sol cop: ' + t.hash);
await p.goBack(); await p.waitForTimeout(500);
ok(await p.evaluate(() => window.__SOS.state.homeView) === 'mapa', 'enrere torna als territoris');

await b.close();
console.log('\n' + pass + ' ✓ · ' + fail + ' ✗');
process.exit(fail ? 1 : 0);
