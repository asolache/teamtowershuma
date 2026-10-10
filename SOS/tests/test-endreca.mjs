/* L'endreça · una pàgina, una feina
 * ──────────────────────────────────
 * Les guardes de `check-landing.js` miren el marcatge. Això mira **la
 * pantalla**, que és on viuen els tres defectes que aquesta endreça podia
 * cometre en silenci:
 *
 *   1. **Una secció perduda.** Es talla de la portada i no s'enganxa a la
 *      pàgina nova. No peta res, la portada es veu més curta i el contingut
 *      senzillament ja no existeix.
 *   2. **Una pàgina sense el seu CSS.** El marcatge es muda i el full d'estil
 *      es queda a la pàgina vella. El bloc hi és i surt sense estil — i això
 *      només ho veu qui obri aquella pàgina.
 *   3. **Un camí que no filtra.** Les portes són a la portada i el filtre al
 *      catàleg: si el sector es perd pel camí, qui ve d'una porta aterra
 *      davant dels vint-i-un paquets i no peta res.
 *
 * I les dues coses que el pla deia que no són automàtiques, mesurades tan a
 * prop com una màquina hi pot arribar: que a la primera pantalla se sàpiga
 * què es compra, i que cada sector trobi la seva porta sense llegir-se la
 * pàgina sencera.
 *
 *   node SOS/tests/test-endreca.mjs
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ARREL = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const U = f => 'file://' + join(ARREL, f);
const PORTADA = U('index.html'), CAT = U('cataleg.html'), QS = U('qui-som.html'), VNA = U('SOS/vna.html');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const errs = [];
const obre = async (url, w = 1280, h = 900) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(url.replace(/^.*\//, '') + ': ' + e.message));
  await p.goto(url);
  await p.waitForTimeout(350);
  return { ctx, p };
};

console.log('\nL\'endreça · una pàgina, una feina');

/* ── 1 · Cap secció perduda ───────────────────────────────────────────────
   Les onze que marxen han d'existir **a la seva pàgina nova** i no a la
   portada. Que no hi siguin a cap dels dos llocs és el defecte que aquesta
   endreça pot cometre sense que res peti. */
console.log('\n1 · Cap secció perduda: hi són allà, i no aquí');
{
  const ON = [
    [CAT, ['cataleg', 'cost', 'aprenent', 'glossari']],
    [QS, ['facilitador', 'relat', 'trajectoria', 'objeccions']]
  ];
  const { ctx, p } = await obre(PORTADA);
  const aLaPortada = await p.evaluate(() =>
    [...document.querySelectorAll('section[id]')].map(s => s.id));
  for (const [url, ids] of ON) {
    const { ctx: c2, p: p2 } = await obre(url);
    const aqui = await p2.evaluate(() =>
      [...document.querySelectorAll('section[id]')].map(s => s.id));
    const falten = ids.filter(i => !aqui.includes(i));
    const dobles = ids.filter(i => aLaPortada.includes(i));
    ok(!falten.length, `${url.replace(/^.*\//, '')}: hi són les ${ids.length} seccions`
      + (falten.length ? ` — falta ${falten.join(', ')}` : ''));
    ok(!dobles.length, '  i cap es queda també a la portada'
      + (dobles.length ? ': ' + dobles.join(', ') : ''));
    await c2.close();
  }
  /* I les quatre del mètode, que se'n van a `/vna`. */
  const { ctx: c3, p: p3 } = await obre(VNA);
  const vna = await p3.evaluate(() => ({
    constr: document.querySelectorAll('.ct-t[data-f]').length,
    rols: document.querySelectorAll('.rl-p').length,
    xarxa: !!document.getElementById('mvXarxa')
  }));
  ok(vna.constr >= 5 && vna.rols >= 10 && vna.xarxa,
    `i el mètode és a /vna: ${vna.constr} construccions, ${vna.rols} rols i el mapa de la casa`);
  ok(!['rengles', 'rols', 'xarxa', 'fentpinya'].some(i => aLaPortada.includes(i)),
    '  i cap de les quatre es queda a la portada');
  await c3.close();
  await ctx.close();
}

/* ── 2 · Cap pàgina sense el seu CSS ──────────────────────────────────────
   Es mesura **sobre l'estil calculat** i no sobre les classes: un bloc amb la
   classa posada i sense regla es llegeix igual al marcatge i surt pla a la
   pantalla. Es mira el que delata un bloc sense estil —que no tingui ni fons,
   ni vora, ni graella— en els contenidors que en una pàgina amb estil en
   tenen. */
console.log('\n2 · Cap bloc sense el seu CSS');
{
  for (const [url, sel] of [[CAT, '.paquet'], [QS, '.faq-item'], [PORTADA, '.srv']]) {
    const { ctx, p } = await obre(url);
    const r = await p.evaluate(s => {
      const el = document.querySelector(s);
      if (!el) return null;
      const c = getComputedStyle(el);
      const vora = ['Top', 'Right', 'Bottom', 'Left'].map(k => c['border' + k + 'Width']).join(' ');
      const pad = ['Top', 'Right', 'Bottom', 'Left'].map(k => c['padding' + k]).join(' ');
      return { bg: c.backgroundColor, vora, pad, disp: c.display };
    }, sel);
    const teEstil = r && (/[1-9]/.test(r.vora) || /[1-9]/.test(r.pad) || /flex|grid/.test(r.disp));
    ok(teEstil,
      `${url.replace(/^.*\//, '')}: ${sel} té estil · ${r ? r.disp + ' · vores ' + r.vora : 'no hi és'}`);
    await ctx.close();
  }
}

/* ── 3 · Les tres portes filtren de debò ──────────────────────────────────
   No que hi hagi tres botons: **que el que es veu canviï**. I que el sector no
   es perdi en el salt de pàgina, que és la peça nova. */
console.log('\n3 · Les tres portes, i el sector que no es perd pel camí');
{
  const { ctx, p } = await obre(PORTADA);
  const portes = await p.evaluate(() => [...document.querySelectorAll('a[data-sec]')]
    .map(a => [a.dataset.sec, a.getAttribute('href')]));
  ok(portes.length >= 6, `${portes.length} portes a la portada: el hero i el repte en porten tres cadascun`);
  const sensS = portes.filter(([s, h]) => !new RegExp('[?&]s=' + s + '\\b').test(h || ''));
  ok(!sensS.length, 'i totes porten el seu sector a l\'adreça'
    + (sensS.length ? ' — sense: ' + sensS.map(x => x[0]).join(', ') : ''));
  await ctx.close();

  const vist = {};
  for (const sec of ['admin', 'tercer', 'empresa']) {
    const { ctx: c2, p: p2 } = await obre(CAT + '?s=' + sec);
    const r = await p2.evaluate(() => ({
      vis: [...document.querySelectorAll('.paquet')].filter(x => !x.hidden)
        .map(x => x.dataset.sector.split(' ')),
      tot: document.querySelectorAll('.paquet').length,
      premut: (document.querySelector('.pk-f.on') || {}).dataset?.sec,
      famsBuides: [...document.querySelectorAll('.pk-fam')]
        .filter(f => !f.hidden && !f.querySelector('.paquet:not([hidden])')).length
    }));
    vist[sec] = r.vis.length;
    ok(r.premut === sec && r.vis.length > 0 && r.vis.length < r.tot && r.vis.every(l => l.includes(sec)),
      `arribar-hi per «${sec}» deixa ${r.vis.length} paquets de ${r.tot}, tots seus`);
    ok(!r.famsBuides, '  i cap família es queda amb el títol i la graella buida');
    await c2.close();
  }
  ok(new Set(Object.values(vist)).size > 1,
    `i les tres no donen el mateix número (${Object.entries(vist).map(([k, v]) => k + ' ' + v).join(' · ')})`);
}

/* ── 4 · La portada porta a les tres pàgines, fora del menú ───────────────
   *Un enllaç al peu és una nota, no un pont.* I una entrada al desplegable és
   un índex: hi són totes les pàgines del lloc, i per tant no diu res. */
console.log('\n4 · Els tres serveis són ponts i no notes');
/* Des del 10/10/2026 la portada parla de tres ofertes —el diagnòstic i el mapa
   de valor, la web i el SOS com a formació— i els ponts són cap a elles. Un
   enllaç dins de la seva targeta ja diu què s'hi troba: la targeta ho explica. */
{
  const { ctx, p } = await obre(PORTADA);
  const r = await p.evaluate(() => {
    const dins = sel => [...document.querySelectorAll(sel)]
      .filter(a => !a.closest('nav') && !a.closest('footer'))
      .map(a => { const b = a.getBoundingClientRect();
        return { y: b.top + scrollY, txt: a.innerText.replace(/\s+/g, ' ').trim(), srv: !!a.closest('.srv') }; });
    return {
      alt: document.body.scrollHeight,
      diag: dins('a[href="/SOS/diagnostic.html"]'),
      web: dins('a[href="/mapa-web/"]'),
      sos: dins('a[href="/SOS/"]')
    };
  });
  [['el diagnòstic', r.diag], ['la web', r.web], ['el SOS', r.sos]].forEach(([nom, l]) => {
    ok(l.length > 0, `hi ha camí cap a ${nom} fora del menú i del peu (${l.length})`);
    if (l.length) ok(Math.min(...l.map(x => x.y)) < r.alt / 2,
      `  i el primer és a la primera meitat (${Math.round(Math.min(...l.map(x => x.y)))} de ${r.alt})`);
    const diu = l.some(x => x.txt.length > 24 || x.srv);
    if (l.length) ok(diu, `  i algun diu què s'hi troba, no només com es diu`);
  });
  await ctx.close();
}

/* ── 5 · La primera pantalla diu què es compra ────────────────────────────
   La prova que el pla deia que no és automàtica, mesurada tan a prop com es
   pot: **sense fer scroll**, s'han de veure les tres portes, el titular i la
   primera crida. Si una d'elles cau per sota del plec, qui arriba ha de decidir
   si baixa abans de saber si això va amb ell. */
console.log('\n5 · A la primera pantalla: què es compra i si va amb tu');
{
  for (const [w, h] of [[1280, 860], [1440, 900], [390, 844]]) {
    const { ctx, p } = await obre(PORTADA, w, h);
    const r = await p.evaluate(() => {
      const b = s => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().bottom) : -1; };
      return { portes: b('.hero-portes'), h1: b('.hero h1'), cta: b('.hero-actions'), fold: innerHeight,
        sectors: [...document.querySelectorAll('.hero-portes a')].map(a => a.innerText.trim()) };
    });
    /* A mòbil el hero és una columna i la crida cau sota el plec: hi ha un
       botó enganxat a baix que fa aquesta feina, i exigir-ho aquí voldria dir
       escurçar el hero fins que no digués res. El que **sí** ha de ser cert a
       les tres amplades és el que decideix si algú es queda: **les portes i el
       titular**. Qui no sap si això va amb ell no fa scroll. */
    ok(r.portes > 0 && r.portes <= r.fold && r.h1 <= r.fold,
      `${w}×${h}: les portes i el titular caben a la primera pantalla (${r.portes} · ${r.h1} de ${r.fold})`);
    if (w >= 1280) ok(r.cta <= r.fold,
      `  i a sobretaula, també la crida (${r.cta} de ${r.fold})`);
    if (w === 1280) ok(r.sectors.length === 3 && r.sectors.every(t => t.length > 3),
      `i les tres portes es llegeixen senceres: ${r.sectors.join(' · ')}`);
    await ctx.close();
  }
}

/* ── 6 · Cap error de JavaScript a cap de les quatre ──────────────────────
   Mudar seccions vol dir mudar el seu codi, i un tros de codi que es queda a
   la pàgina vella no peta allà: peta **a la nova**, i només quan algú hi
   arriba. */
console.log('\n6 · Les quatre pàgines obren sense cap error');
{
  for (const u of [PORTADA, CAT, QS, VNA]) {
    const { ctx } = await obre(u);
    await ctx.close();
  }
  ok(!errs.length, 'cap error de JavaScript a les quatre pàgines'
    + (errs.length ? ': ' + errs.slice(0, 3).join(' · ') : ''));
}

await b.close();
console.log('\n' + (fail ? `❌ ${fail} fallen de ${pass + fail}` : `✅ ${pass} assercions, totes verdes`));
process.exit(fail ? 1 : 0);
