/* La pàgina dels vedes.
   És una projecció del codex, i el risc d'una projecció és que perdi coses pel
   camí sense que ningú se n'adoni: una veda que no hi surt, un cos buit, un
   ancoratge que no porta enlloc. Aquí es compara la pàgina amb el fitxer
   original, veda a veda, en comptes de mirar si «es veu bé». */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PAGE = 'file://' + join(HERE, '..', 'vedes.html');
const APP = 'file://' + join(HERE, '..', 'index.html');
const CODEX = readFileSync(join(HERE, '..', 'knowledge', 'codex.md'), 'utf8');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

/* Les dues formes de titular que conviuen al codex. Si el generador només en
   reconegués una, la meitat de les vedes desapareixerien de la pàgina i aquest
   test seria l'únic lloc on es notaria. */
const delCodex = [];
CODEX.split('\n').forEach(l => {
  const h = l.match(/^#{2,3}\s+(.*)$/); if (!h) return;
  const a = h[1].trim().match(/^V(\d+)\s*·\s*(.+)$/);
  const b = h[1].trim().match(/^Veda\s+(\d+)\s*[—–-]\s*(.+)$/);
  if (a || b) delCodex.push({ n: Number((a || b)[1]), title: (a || b)[2].trim() });
});

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await b.newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
await page.goto(PAGE);

console.log('\n1 · Hi són totes les del codex, i cap buida');
const arts = await page.$$eval('article.veda', els => els.map(e => ({
  id: e.id,
  titol: e.querySelector('h2').textContent.trim(),
  cos: e.textContent.replace(e.querySelector('.vh').textContent, '').trim().length
})));
ok(arts.length === delCodex.length,
  arts.length + ' vedes a la pàgina i ' + delCodex.length + ' al codex');
const falten = delCodex.filter(v => !arts.some(a => a.id === 'veda-' + v.n));
ok(!falten.length, falten.length ? 'FALTEN: ' + falten.map(v => v.n).join(', ')
  : 'cada veda del codex té el seu article amb ancoratge permanent');
const buides = arts.filter(a => a.cos < 80);
ok(!buides.length, buides.length ? 'amb el cos buit: ' + buides.map(a => a.id).join(', ')
  : 'i cap no ha perdut el cos pel camí');

console.log('\n2 · L\'índex les llista totes, amb el títol i no només el número');
const idx = await page.$$eval('nav.idx li a', els => els.map(e => ({
  href: e.getAttribute('href'), t: (e.querySelector('.t') || {}).textContent || '' })));
ok(idx.length === delCodex.length, idx.length + ' entrades a l\'índex');
ok(idx.every(i => i.t.trim().length > 3), 'totes porten el títol visible, no un tooltip');
const trencats = idx.filter(i => !arts.some(a => '#' + a.id === i.href));
ok(!trencats.length, 'cap enllaç de l\'índex apunta a un ancoratge que no existeix');

console.log('\n3 · La veda 83 diu el que ha de dir, i s\'hi arriba per l\'URL');
await page.goto(PAGE + '#veda-83');
await page.waitForTimeout(300);
const v83 = await page.evaluate(() => {
  const a = document.getElementById('veda-83'); if (!a) return null;
  const r = a.getBoundingClientRect();
  return { txt: a.textContent.replace(/\s+/g, ' '), aVista: r.top > -50 && r.top < window.innerHeight };
});
ok(v83 && v83.aVista, 'l\'enllaç permanent hi porta de debò');
ok(v83 && /cromoTransfer/.test(v83.txt) && /una imatge no prova res/i.test(v83.txt),
  'i el contingut hi és sencer, codi inclòs');

console.log('\n4 · El filtre, que és com es fa servir això de debò');
await page.goto(PAGE);
await page.fill('#q', 'reciprocitat');
await page.waitForTimeout(150);
const filtrat = await page.evaluate(() => ({
  visibles: document.querySelectorAll('article.veda:not(.hidden)').length,
  compte: document.getElementById('count').textContent,
  idxTambe: document.querySelectorAll('nav.idx li:not(.hidden)').length
}));
ok(filtrat.visibles > 0 && filtrat.visibles < delCodex.length,
  'filtra: ' + filtrat.compte);
ok(filtrat.idxTambe === filtrat.visibles, 'i l\'índex es filtra amb elles, no es queda mentint');
await page.fill('#q', 'qwertyuiop');
await page.waitForTimeout(150);
ok(await page.isVisible('#empty'), 'sense resultats es diu, en comptes de deixar la pàgina en blanc');

console.log('\n5 · S\'hi arriba des del SOS');
const app = await b.newPage();
await app.goto(APP);
await app.waitForFunction(() => window.__SOS && window.__SOS.state);
const menu = await app.evaluate(() => {
  const btn = document.getElementById('btnVedes');
  return { hi: !!btn, txt: btn ? btn.textContent.trim() : '' };
});
ok(menu.hi, 'hi ha l\'entrada al menú: «' + menu.txt + '»');
ok(/vedes/i.test(menu.txt), 'i es diu pel seu nom');

console.log('\n6 · Accessible de debò, no de dir-ho');
await page.goto(PAGE);
const a11y = await page.evaluate(() => ({
  lang: document.documentElement.lang,
  h1: document.querySelectorAll('h1').length,
  skip: !!document.querySelector('a.skip[href^="#"]'),
  label: !!document.querySelector('label[for="q"]'),
  viu: document.getElementById('count').getAttribute('aria-live'),
  nav: !!document.querySelector('nav[aria-label]'),
  perma: [...document.querySelectorAll('.perma')].every(a => a.getAttribute('aria-label'))
}));
ok(a11y.lang === 'ca' && a11y.h1 === 1, 'un sol h1 i la llengua declarada');
ok(a11y.skip && a11y.label, 'enllaç per saltar al contingut i etiqueta al filtre');
ok(a11y.viu === 'polite' && a11y.nav, 'el compte del filtre s\'anuncia i l\'índex té nom');
ok(a11y.perma, 'i els enllaços «#» diuen a on van');

const mob = await b.newPage({ viewport: { width: 360, height: 780 } });
await mob.goto(PAGE);
await mob.waitForTimeout(200);
const desborda = await mob.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
ok(!desborda, 'i a 360 px no desborda de costat');

ok(!errs.length, errs.length ? 'errors de JS: ' + errs.join(' · ') : 'cap error de JS a la pàgina');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
