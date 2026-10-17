/* La revisió UX del 17/10/2026 · una acció principal i un mapa que es llegeix.
   · La benvinguda tenia dos botons primaris competint: ara només un, i és el
     pas següent quan n'hi ha.
   · Diversos fluxos del mateix sentit entre dos rols es dibuixaven damunt l'un
     de l'altre, amb les etiquetes apilades: ara cap etiqueta en tapa una altra.
   · I el mapa d'un projecte comença dins la primera pantalla. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS);
await page.waitForTimeout(1500);

console.log('\n1 · La benvinguda té un sol botó principal, i és el pas següent');
await page.click('#obApunta');
await page.waitForSelector('#shSave');
await page.fill('#shName', 'Marta Vidal');
await page.fill('#shMuni', 'Vilafranca del Penedès');
await page.click('#shSave');
await page.waitForSelector('#wcGo');
const w = await page.evaluate(() => ({
  prim: document.querySelectorAll('.modal .btn-primary').length,
  go: document.querySelector('#wcGo').textContent.trim(),
  element: (document.querySelector('#wcNext') || {}).textContent || ''
}));
ok(w.prim === 1, 'un sol botó primari (' + w.prim + ')');
ok(/node/i.test(w.go), 'i és el pas següent: «' + w.go + '»');
ok(/element/i.test(w.element), 'l\'element continua a un clic, com a opció secundària');
await page.click('#wcLater');

console.log('\n2 · Un projecte amb fluxos paral·lels: el mapa es llegeix i es veu');
const r = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Prova mapa', 'projecte', null);
  S.seedFromDynamic(n, S.dynById('mapeig_vna'));
  S.state.nodes.push(n); await S.persist(n);
  S.state.tab = 'map'; S.selectNode(n.id);
  await new Promise(r2 => setTimeout(r2, 300));
  const svg = [...document.querySelectorAll('#workspace svg')].find(s => s.querySelector('path[marker-end]'));
  const ts = [...svg.querySelectorAll('text')].filter(t => t.getAttribute('font-size') === '8.5')
    .map(t => t.getBoundingClientRect());
  let xocs = 0;
  for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) {
    const a = ts[i], c = ts[j];
    const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left);
    const oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
    if (ox > a.width * .6 && oy > a.height * .6) xocs++;
  }
  return { etiquetes: ts.length, xocs, top: Math.round(svg.getBoundingClientRect().top + scrollY),
    franja: !!document.querySelector('.nh-dyn .dd-eina') };
});
ok(r.etiquetes >= 8, r.etiquetes + ' etiquetes de flux al mapa');
ok(r.xocs === 0, 'cap etiqueta tapada per una altra (' + r.xocs + ' xocs)');
ok(r.top < 900, 'el mapa comença dins la primera pantalla (y = ' + r.top + ')');
ok(r.franja, 'l\'eina del projecte segueix a un clic, en una sola franja');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' passen'));
process.exit(fail ? 1 : 0);
