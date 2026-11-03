/* Totes les pantalles a pantalla completa (diagnòstic d'UX, 3/11/2026).
   · Cap pantalla és una finestreta: ocupa tot l'ample sota la barra de dalt.
   · «← Tornar» a dalt fa el que feia el seu «Tanca», que ja no surt.
   · «Enrere» del navegador o del mòbil tanca la pantalla i no surt de l'app.
   · Configuració i «Digues què s'ha trencat» tenen enllaç propi (#/config, #/avisa).
   · Al projecte, el contingut primer: la guia i la missió neixen plegades. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

for (const vp of [{ width: 1366, height: 900 }, { width: 390, height: 844 }]) {
  console.log('\n· ' + vp.width + ' px');
  const page = await (await b.newContext({ viewport: vp })).newPage();
  page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
  await page.goto(APP + '?viu');
  await page.waitForFunction(() => window.__SOS);
  await page.waitForTimeout(1200);
  await page.evaluate(() => { const r = document.querySelector('#modalRoot'); r.innerHTML = ''; });

  await page.evaluate(() => { location.hash = '#/config'; });
  await page.waitForTimeout(400);
  const m = await page.evaluate(() => {
    const bg = document.querySelector('#modalRoot .modal-bg'), r = bg && bg.getBoundingClientRect();
    const tb = document.querySelector('.topbar').getBoundingClientRect();
    return bg && { w: r.width, top: r.top, tb: tb.bottom, torna: !!bg.querySelector('.mc-torna'), link: [...bg.querySelectorAll('.modal-cap button')].some(x => x.textContent.includes('🔗')),
      tanca: [...bg.querySelectorAll('.modal button')].filter(x => /^\s*Tanca\s*$/.test(x.textContent) && x.offsetParent).length, titol: (bg.querySelector('h2') || {}).textContent };
  });
  ok(m && /Configuraci/.test(m.titol), '#/config obre Configuració');
  ok(m && m.w >= vp.width - 1, 'ocupa tot l\'ample (' + (m && m.w) + ')');
  ok(m && m.top >= m.tb - 1, 'la barra de dalt es veu');
  ok(m && m.torna, 'hi ha «← Tornar»');
  ok(m && m.link, 'té el botó d\'enllaç');
  ok(m && m.tanca === 0, 'cap «Tanca» a la vista');
  await page.click('.mc-torna');
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => !window.__SOS.modalOpen() && location.hash !== '#/config'), '«Tornar» tanca i treu la ruta');

  // Enrere del navegador tanca una pantalla sense ruta
  await page.evaluate(() => window.__SOS.openLangModal());
  await page.waitForTimeout(200);
  ok(await page.evaluate(() => window.__SOS.modalOpen()), 'obre Llengua');
  await page.goBack();
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => !window.__SOS.modalOpen() && !!window.__SOS), 'enrere la tanca i seguim a l\'app');

  // Escape
  await page.evaluate(() => window.__SOS.openLangModal());
  await page.waitForTimeout(200);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  ok(await page.evaluate(() => !window.__SOS.modalOpen()), 'Escape la tanca');

  // Al projecte, el contingut primer
  await page.evaluate(async () => { const S = window.__SOS; await S.setShowAllTabs(true); const nd = S.state.nodes.find(x => x.vna); S.state.tab = 'map'; S.selectNode(nd.id); });
  await page.waitForTimeout(400);
  const p = await page.evaluate(() => ({ guia: !!document.querySelector('.ctx-guide[open]'), ms: document.querySelector('.ms-plec'), msOpen: !!document.querySelector('.ms-plec[open]') }));
  ok(!p.guia, 'la guia del projecte neix plegada');
  ok(p.ms && !p.msOpen, 'missió, visió i objectius, plegats');
  ok(await page.evaluate(() => [...document.querySelectorAll('.tabs .tab')].some(x => /Aportacions/.test(x.textContent))), 'la pestanya es diu «Aportacions»');
}
await b.close();
console.log('\n' + pass + ' ✓ · ' + fail + ' ✗');
process.exit(fail ? 1 : 0);
