/* L'arrencada no depèn de ningú de fora (pla-millora-sos.md, punt 1).
   L'app carregava la font amb un <link> a Google que bloquejava el render: amb
   Google lent, 13 s fins a `load`; si Google no responia, no s'obria. Aquest
   test la torna a obrir amb **tota la xarxa de fora penjada** —cap petició
   externa respon mai— i exigeix que arrenqui igual i ràpid. El proper que posi
   una dependència externa a la capçalera ho veurà aquí, i no al poble. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

console.log('\n1 · Amb tota la xarxa de fora penjada, l\'app arrenca');
const ctx = await b.newContext();
const page = await ctx.newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
const fora = [];
// Penjar i no avortar: un servidor que no respon és el cas dolent de debò, i
// un `abort` el dissimula perquè el navegador se'n refà en mil·lisegons.
await page.route(/^https?:\/\//, r => { fora.push(r.request().url()); return new Promise(() => {}); });
const t0 = Date.now();
let carregada = true;
await page.goto(APP, { waitUntil: 'load', timeout: 10000 }).catch(() => { carregada = false; });
const ms = Date.now() - t0;
ok(carregada && ms < 3000, 'arriba a `load` en ' + ms + ' ms (sostre 3.000; amb el <link> a Google no hi arribava)');
ok(!fora.some(u => /fonts\.(googleapis|gstatic)\.com/.test(u)),
  'cap petició a Google Fonts' + (fora.length ? ' · peticions de fora: ' + fora.length : ''));

console.log('\n2 · Les fonts són les nostres, no les del sistema');
// Amb un tall de 5 s: si la font torna a dependre de fora, `fonts.ready` no
// es resol mai i el test s'ha de posar vermell, no quedar-se penjat.
const fonts = await page.evaluate(async () => {
  const tall = new Promise(r => setTimeout(r, 5000));
  await Promise.race([tall, Promise.all([document.fonts.ready,
    document.fonts.load('700 16px "Space Grotesk"'), document.fonts.load('400 16px "JetBrains Mono"')])]);
  // `fonts.check` diu que sí quan la font ni tan sols està declarada (no hi ha
  // res a carregar), així que es mira la cara de debò: declarada i carregada.
  const carregada = fam => [...document.fonts].some(f => f.family.replace(/["']/g, '') === fam && f.status === 'loaded');
  return {
    sans: carregada('Space Grotesk'),
    mono: carregada('JetBrains Mono'),
    // Una lletra amb accent i la ela geminada: el català ha de sortir amb la font de l'app.
    accents: carregada('Space Grotesk') && document.fonts.check('400 16px "Space Grotesk"', 'Àlvar, col·lectiu, ç'),
  };
});
ok(fonts.sans, 'Space Grotesk carregada des de `fonts/`');
ok(fonts.mono, 'JetBrains Mono carregada des de `fonts/`');
ok(fonts.accents, 'i cobreix els accents i la ela geminada');
await ctx.close();

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
