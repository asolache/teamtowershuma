/* V77 · Cada superheroi és una pantalla que ja existeix.
   El risc d'afegir relat a una eina és que el relat es posi al davant. Per això
   aquí es prova sobretot el contrari: que la guia digui exactament el mateix
   sense el personatge, que no surti fins que t'ho has guanyat, i que apagar-ho
   no trenqui res. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await b.newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.heroFor);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Banc de Temps de Vilafranca', 'projecte', null);
  n.dynamicType = 'banc_temps'; n.ledger = [];
  S.seedFromDynamic(n, S.dynById('banc_temps'));
  S.membersOf(n).push(S.newMember({ name: 'Marta Vidal' }));
  S.state.nodes.push(n); await S.persist(n);
  await S.setActivePersona('Marta Vidal');
  return { id: n.id };
});

console.log('\n1 · El relat es guanya: sense cap aportació, no surt');
const abans = await page.evaluate(() => {
  const S = window.__SOS;
  return { obert: S.comandoUnlocked(), hero: S.heroFor('ledger') };
});
ok(!abans.obert && !abans.hero,
  'amb el ledger buit no hi ha cap superheroi a les pantalles');

console.log('\n2 · Amb la primera aportació registrada, apareix');
const despres = await page.evaluate(async (id) => {
  const S = window.__SOS;
  const n = S.byId(id);
  await S.pushLedger(n.ledger, { id: 'h1', ts: '2026-06-01T09:00:00Z', type: 'temps', value: 2 });
  await S.persist(n);
  return { obert: S.comandoUnlocked(), hero: S.heroFor('ledger') };
}, seed.id);
ok(despres.obert && despres.hero && despres.hero.hero === 'Mazinguer',
  'el ledger és de Mazinguer: «' + String(despres.hero.line).slice(0, 52) + '…»');

console.log('\n3 · Cada pantalla té el seu, i cap es repeteix');
const tots = await page.evaluate(() => {
  const S = window.__SOS;
  const e = Object.entries(S.HERO_SCREENS);
  return {
    n: e.length,
    herois: e.map(([, v]) => v.hero),
    sensLinia: e.filter(([, v]) => !v.line || v.line.length < 20).length
  };
});
ok(tots.n >= 8, tots.n + ' pantalles amb superheroi');
ok(new Set(tots.herois).size === tots.herois.length, 'cap heroi repetit en dues pantalles');
ok(tots.sensLinia === 0, 'i tots porten la frase que explica què s\'hi fa');

console.log('\n══ El que importa: que el relat no substitueixi res ══');

console.log('\n4 · La guia diu el mateix amb el Comando i sense');
const guia = await page.evaluate(async (id) => {
  const S = window.__SOS;
  S.selectNode(id); await new Promise(r => setTimeout(r, 120));
  S.state.tab = 'ledger';
  const net = t => t.replace(/\s+/g, ' ').trim();
  S.render(); await new Promise(r => setTimeout(r, 180));
  const amb = net(document.querySelector('#workspace').textContent);
  await S.setComandoLens(false);
  S.render(); await new Promise(r => setTimeout(r, 180));
  const sense = net(document.querySelector('#workspace').textContent);
  await S.setComandoLens(true);
  return { amb, sense };
}, seed.id);
ok(/Mazinguer/.test(guia.amb) && !/Mazinguer/.test(guia.sense),
  'amb la lent encesa hi surt Mazinguer, i apagada no');
ok(guia.sense.length > 200 && /Flux de valor/.test(guia.sense),
  'i la guia segueix sencera sense ell: el personatge explica, no substitueix');

console.log('\n5 · Apagar-ho es recorda i no trenca res');
const persist = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.setComandoLens(false);
  S.state.comandoLens = true;
  const recordat = await S.loadComandoLens();
  const heroApagat = S.heroFor('ledger');
  await S.setComandoLens(true);
  return { recordat, heroApagat, torna: !!S.heroFor('ledger') };
});
ok(persist.recordat === false, 'la decisió d\'apagar-ho sobreviu a tancar l\'app');
ok(!persist.heroApagat && persist.torna, 'apagat no en surt cap, i en encendre torna');

console.log('\n6 · A la pantalla hi ha on apagar-ho, i es diu què no canvia');
const ui = await page.evaluate(async () => {
  const S = window.__SOS;
  S.openComandoLens();
  await new Promise(r => setTimeout(r, 80));
  const txt = document.querySelector('.modal').textContent;
  const teBoto = !!document.querySelector('#clOn');
  S.closeModal();
  return { txt, teBoto };
});
ok(ui.teBoto, 'es pot encendre i apagar');
ok(/no canvia res del que l'app fa/.test(ui.txt),
  'i es diu que apagar-ho no canvia res del que l\'app fa');
ok(/és una frase, no una portada/i.test(ui.txt),
  'i què és: una frase, no una portada');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
