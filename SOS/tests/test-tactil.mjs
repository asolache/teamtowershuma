/* Zones tàctils de 44 px · guardia.md, peça C13
   ─────────────────────────────────────────────────────────────────────────
   Al mòbil, el que es toca amb el dit fa com a mínim 44 × 44 px (WCAG 2.5.5):
   · les pestanyes de pantalla i «Anterior / Següent» de SOS/lib/pantalla.js;
   · la creu que tanca l'avís del mòdul (SOS/lib/modul-pantalla.js).
   Es prova a totes les pàgines amb `data-pantalla` (menys /cliente/, que té
   el seu fil). La barra de navegació és de build-nav.js: va a part. */
import { chromium, devices } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { serve } from './serve.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const srv = await serve(join(DIR, '..', '..'), 0), BASE = 'http://127.0.0.1:' + srv.address().port + '/';
const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] }, process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const PAGINES = ['SOS/aigua.html', 'SOS/certificacio.html', 'SOS/compra.html', 'SOS/escola.html',
  'SOS/ia.html', 'SOS/uneix-te.html', 'SOS/vedes.html', 'SOS/visio.html', 'SOS/vna.html',
  'cataleg.html', 'conecta/index.html', 'premsa.html', 'qui-som.html'];
const QUE = '.tt-pant-tabs a, .tt-pant-pag a, .tt-mp-x';
let creus = 0;

for (const u of PAGINES) {
  console.log('\n' + u);
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + u, { waitUntil: 'load' });
  await p.waitForSelector('.tt-pant-tabs a', { timeout: 5000 }).catch(() => {});
  const r = await p.evaluate(q => {
    const v = [...document.querySelectorAll(q)].filter(el => {
      const s = getComputedStyle(el), rc = el.getBoundingClientRect();
      return s.display !== 'none' && s.visibility !== 'hidden' && rc.width && rc.height;
    });
    return {
      n: v.length, x: v.filter(el => el.matches('.tt-mp-x')).length,
      petits: v.map(el => { const rc = el.getBoundingClientRect(); return { t: (el.textContent || '').trim().slice(0, 20), w: rc.width, h: rc.height }; })
        .filter(o => o.w < 44 - .5 || o.h < 44 - .5)
    };
  }, QUE);
  creus += r.x;
  ok(r.n > 0, `hi ha ${r.n} zones de la peça comuna`);
  ok(r.petits.length === 0, 'totes fan 44 × 44 o més' +
    (r.petits.length ? ': ' + r.petits.length + ' no, p. ex. «' + r.petits[0].t + '» ' + Math.round(r.petits[0].w) + '×' + Math.round(r.petits[0].h) : ''));
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}
ok(creus > 0, `la creu de l'avís del mòdul s'ha mesurat a ${creus} pàgines`);

await b.close(); srv.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
