/* La pàgina de preus · que es pugui triar i contractar sense inventar cap xifra
   ─────────────────────────────────────────────────────────────────────────
   `SOS/pressupost.html` va passar a ser la pàgina de preus el 09/10/2026. Es
   prova el que la fa una pàgina de compra i no un «contacta'ns»:

   · **Cap import inventat.** Un preu buit a `PREUS` es llegeix «preu a
     confirmar», i cap targeta en treu una xifra.
   · **Contracta obre la comanda**, i sense nom, correu i l'acceptació de com
     es paga no surt res.
   · **Una sola crida**, al formulari `comanda` de Netlify, i només en prémer.
   · **Les dues llengües**, i el pressupost a mida segueix a sota. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));
const PAG = 'file://' + join(DIR, '..', 'pressupost.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
/* Un `fetch` fals: es compta qui crida i què envia, sense xarxa. */
await p.addInitScript(() => {
  try { localStorage.clear(); } catch (e) { }
  window.__crides = [];
  window.fetch = async (url, o) => { window.__crides.push({ url, body: o && o.body }); return { ok: true, status: 200 }; };
});
await p.goto(PAG);
await p.waitForSelector('#preus');

console.log('\n1 · Els preus, sense cap xifra inventada');
{
  const r = await p.evaluate(() => ({
    targetes: document.querySelectorAll('#preus .pv-c').length,
    preus: [...document.querySelectorAll('[data-preu]')].map(e => e.textContent.trim()),
    contracta: document.querySelectorAll('#preus [data-contracta]').length,
    h1: document.querySelector('h1').textContent,
    amida: !!document.querySelector('#amida') && !!document.querySelector('#pForm'),
    flux: document.querySelector('.pv-flux').textContent
  }));
  ok(r.targetes === 4, 'quatre maneres d\'entrar');
  ok(r.preus[0] === 'Gratis', 'l\'esborrany del mapa és gratis');
  ok(r.preus.slice(1).every(t => t === 'Preu a confirmar'), 'els imports buits diuen «preu a confirmar»: ' + r.preus.join(' · '));
  ok(!r.preus.some(t => /\d/.test(t)), 'i cap targeta no treu una xifra que ningú ha donat');
  ok(r.contracta === 4, 'tres «Contracta» i un «Avisa\'m» per al sistema viu');
  ok(/Preus i contractació/.test(r.h1), 'el títol és el de la pàgina de preus');
  ok(r.amida && /35, 55 o 80 €\/h/.test(r.flux), 'i a sota, el pressupost a mida per fluxos amb l\'escala pública');
}

console.log('\n2 · Contracta: sense dades no surt res');
{
  await p.click('[data-contracta="t2"]');
  const obert = await p.evaluate(() => document.querySelector('#cm').open && document.querySelector('#cmQu').textContent);
  ok(/Taller d'equip/.test(obert || ''), 'el botó obre la comanda del que has triat: ' + obert);
  await p.click('#cEnvia');
  const r = await p.evaluate(() => ({ err: document.querySelector('#cErr').classList.contains('on'), n: window.__crides.length }));
  ok(r.err && r.n === 0, 'sense nom, correu ni acceptació, avisa i no envia res');
  await p.fill('#cNom', 'Júlia Ferrer');
  await p.fill('#cMail', 'julia@example.org');
  await p.click('#cEnvia');
  const r2 = await p.evaluate(() => window.__crides.length);
  ok(r2 === 0, 'sense acceptar com es paga, tampoc');
}

console.log('\n3 · La comanda s\'envia una vegada, al formulari de Netlify');
{
  await p.check('#cAcc');
  await p.fill('#cOrg', 'La Cooperativa');
  await p.click('#cEnvia');
  await p.waitForTimeout(150);
  const r = await p.evaluate(() => ({ c: window.__crides, ok: !document.querySelector('#cOk').hidden }));
  const cos = new URLSearchParams(r.c[0] ? r.c[0].body : '');
  ok(r.c.length === 1 && r.c[0].url === '/', 'una sola crida, al formulari del lloc');
  ok(cos.get('form-name') === 'comanda' && cos.get('paquet') === 'Taller d\'equip' && cos.get('preu') === 'a confirmar',
    'amb el formulari «comanda», el que s\'ha triat i el preu tal com està');
  ok(/COMANDA · Taller d'equip/.test(cos.get('resum') || '') && /es paga abans de començar/.test(cos.get('resum') || ''),
    'i un resum que diu què s\'ha acceptat');
  ok(r.ok, 'i diu que l\'ha rebuda');
  const nf = await p.evaluate(() => !!document.querySelector('form[name="comanda"][data-netlify="true"]'));
  ok(nf, 'el formulari amagat hi és perquè Netlify el doni d\'alta');
}

console.log('\n4 · En castellà');
{
  await p.click('#cTanca');
  await p.click('.lang-b[data-lang="es"]');
  await p.waitForTimeout(200);
  const r = await p.evaluate(() => ({
    h1: document.querySelector('h1').textContent,
    preu: document.querySelector('[data-preu="t3"]').textContent,
    cta: document.querySelector('[data-contracta="t1"]').textContent,
    t3: document.querySelector('[data-i18n="pv.t3.n"]').textContent
  }));
  ok(/Precios y contratación/.test(r.h1) && r.preu === 'Precio a confirmar' && r.cta === 'Contrata' && r.t3 === 'Tu negocio operativo',
    'títol, preus, botons i noms en castellà');
}

ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
await b.close();
console.log(fail ? `\n❌ ${fail} fallen` : `\n✅ ${pass} assercions, totes verdes`);
process.exit(fail ? 1 : 0);
