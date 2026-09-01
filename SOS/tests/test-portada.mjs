/* La primera pantalla de teamtowershuma.com · que s'entengui sense llegir
   ─────────────────────────────────────────────────────────────────────────
   El que es prova aquí no és que la portada «es vegi bé», sinó que la primera
   pantalla digui el negoci sola:

   · **Dos castells i no un graf.** Hi havia un diagrama de nodes abstracte amb
     la paraula «VNA» al mig, que és exactament el gergó que la veda 107 prohibeix
     a la cara de qui no és del gremi. Ara hi ha la metàfora que ja era al nom de
     la casa.
   · **El dibuix i el número diuen el mateix.** Si l'etiqueta diu 4 i n'hi ha 5
     pintats, la comparació és falsa i ningú se n'assabenta.
   · **El mateix clic als dos costats.** La diferència no pot ser el que li fem
     a cadascun: ha de ser quanta base tenia.
   · **Es veu sense fer scroll**, que és l'únic lloc on serveix de res.

   Veda 113. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const nova = async (w = 1280, h = 900) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(APP);
  await p.waitForSelector('#ctBtn');
  /* L'idioma es guarda al navegador i aquesta prova el vol conegut. */
  await p.evaluate(() => { try { localStorage.removeItem('tt_lang'); } catch (e) { } });
  return { ctx, p, errs };
};

console.log('\n1 · La metàfora és la del nom de la casa, no un graf abstracte');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const hero = document.querySelector('.hero');
    return {
      castells: !!hero.querySelector('.castells'),
      graf: !!hero.querySelector('.vna-diagram'),
      vna: /\bVNA\b/.test(hero.textContent),
      pinya: /pinya/i.test(hero.textContent),
      titol: !!hero.querySelector('.castells title'),
      desc: !!hero.querySelector('.castells desc')
    };
  });
  ok(r.castells, 'la primera pantalla ensenya els dos castells');
  ok(!r.graf, 'i ja no el diagrama de nodes que hi havia');
  ok(!r.vna, 'la paraula «VNA» no surt a la primera pantalla — era gergó a la cara de qui entra (veda 107)');
  ok(r.pinya, 'i sí que hi surt la pinya, que és el que explica el negoci');
  ok(r.titol && r.desc, 'el dibuix porta títol i descripció per a qui no el pot veure');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n2 · El dibuix i el número diuen el mateix');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    /* La pinya és la gent que NO forma part del tronc: tot `use` que no penja
       del grup que cau. Comptar-ho des del DOM i no des d'una constant és el
       que fa que la prova serveixi de res. */
    const pinya = g => [...document.querySelectorAll('#' + g + ' use')]
      .filter(u => !u.closest('.ct-torre')).length;
    const num = id => parseInt((document.getElementById(id).textContent.match(/\d+/) || [0])[0], 10);
    const tronc = g => document.querySelectorAll('#' + g + ' .ct-torre use').length;
    return { pE: pinya('ctEsq'), pD: pinya('ctDre'), nE: num('ctEstEsq'), nD: num('ctEstDre'),
      tE: tronc('ctEsq'), tD: tronc('ctDre') };
  });
  ok(r.pE === r.nE, `l'etiqueta de l'esquerra diu ${r.nE} i n'hi ha ${r.pE} pintats a la pinya`);
  ok(r.pD === r.nD, `la de la dreta diu ${r.nD} i n'hi ha ${r.pD}`);
  ok(r.pD > r.pE * 2, `i la diferència es veu: ${r.pD} contra ${r.pE}`);
  ok(r.tE === r.tD, `el castell de dalt és el mateix als dos costats (${r.tE} persones) — si no, no es compara res`);
  await ctx.close();
}

console.log('\n3 · En marxa una i passa el que passa a la vida');
{
  const { ctx, p, errs } = await nova();
  const abans = await p.evaluate(() => ({
    cau: document.getElementById('ctEsq').classList.contains('ct-cau'),
    foraE: document.getElementById('ctPeE').classList.contains('ct-fora'),
    foraD: document.getElementById('ctPeD').classList.contains('ct-fora')
  }));
  ok(!abans.cau && !abans.foraE && !abans.foraD, 'de bon principi hi són totes i el castell aguanta');

  await p.click('#ctBtn');
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => ({
    foraE: document.getElementById('ctPeE').classList.contains('ct-fora'),
    foraD: document.getElementById('ctPeD').classList.contains('ct-fora'),
    cauE: document.getElementById('ctEsq').classList.contains('ct-cau'),
    cauD: document.getElementById('ctDre').classList.contains('ct-cau'),
    koE: !document.getElementById('ctEstEsqKo').classList.contains('ct-amaga'),
    okE: !document.getElementById('ctEstEsq').classList.contains('ct-amaga'),
    okD: !document.getElementById('ctEstDreOk').classList.contains('ct-amaga'),
    girat: Math.round(new DOMMatrix(getComputedStyle(
      document.querySelector('#ctEsq .ct-torre')).transform).m21 * 100) !== 0
  }));
  ok(r.foraE && r.foraD, 'el mateix clic en treu una de cada costat — la diferència ha de ser la base, no el que els fem');
  ok(r.cauE && !r.cauD, 'cau el que en tenia quatre i no el que en tenia catorze');
  ok(r.girat, 'i el castell caigut es veu caigut, no només retolat');
  ok(r.koE && !r.okE, 'a l\'esquerra ho diu: «cau»');
  ok(r.okD, 'i a la dreta: «aguanta»');

  await p.click('#ctBtn');
  await p.waitForTimeout(900);
  const t = await p.evaluate(() => ({
    cau: document.getElementById('ctEsq').classList.contains('ct-cau'),
    fora: document.getElementById('ctPeE').classList.contains('ct-fora'),
    btn: document.getElementById('ctBtnA').hidden
  }));
  ok(!t.cau && !t.fora && !t.btn, 'i es pot tornar enrere: qui hi arriba pot provar-ho dues vegades');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n4 · Es veu sense fer scroll, que és on serveix de res');
for (const [w, h] of [[1280, 900], [1440, 900], [390, 844]]) {
  const { ctx, p } = await nova(w, h);
  const r = await p.evaluate(() => {
    const c = document.querySelector('.castells').getBoundingClientRect();
    const btn = document.getElementById('ctBtn').getBoundingClientRect();
    const cta = document.querySelector('.hero .btn-primary').getBoundingClientRect();
    return { dalt: Math.round(c.top), baix: Math.round(c.bottom), btn: Math.round(btn.bottom),
      cta: Math.round(cta.bottom), fold: innerHeight, ample: document.documentElement.scrollWidth };
  });
  ok(r.baix <= r.fold, `${w}px · el dibuix sencer cap a la primera pantalla (acaba a ${r.baix} de ${r.fold})`);
  ok(r.btn <= r.fold, `${w}px · i el botó per provar-ho també`);
  ok(r.ample <= w, `${w}px · la pàgina no se'n va de costat`);
  if (w >= 1280) ok(r.cta <= r.fold, `${w}px · i el botó de diagnòstic no cau per sota del plec (${r.cta})`);
  await ctx.close();
}

console.log('\n5 · També en castellà');
{
  const { ctx, p } = await nova();
  await p.click('.lang-btn[data-lang="es"]');
  await p.waitForTimeout(200);
  const r = await p.evaluate(() => {
    const hero = document.querySelector('.hero');
    return { pinya: /piña/i.test(hero.textContent), esq: document.getElementById('ctEstEsq').textContent,
      btn: document.getElementById('ctBtnA').textContent, ca: /pinya/i.test(hero.textContent) };
  });
  ok(r.pinya, 'la metàfora es tradueix i no es queda a mitges');
  ok(/sosteniendo/i.test(r.esq), 'els comptadors del dibuix també: «' + r.esq + '»');
  ok(!/En marxa/.test(r.btn), 'i el botó, que viu dins del dibuix: «' + r.btn + '»');
  await ctx.close();
}

console.log('\n6 · El que ja hi havia segueix sent-hi');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const hero = document.querySelector('.hero');
    return {
      dolor: hero.querySelectorAll('.hero-pains li').length,
      diag: !!hero.querySelector('a[href*="diagnostic"]'),
      sos: !!hero.querySelector('a[href="/SOS/"]'),
      finan: /subvencions/i.test(hero.textContent),
      seccions: document.querySelectorAll('section[id]').length
    };
  });
  ok(r.dolor === 3, 'els tres dolors del principi no s\'han perdut pel camí');
  ok(r.diag && r.sos, 'els dos camins de sortida segueixen a la primera pantalla');
  ok(r.finan, 'i la línia que diu qui ho paga, que és la primera pregunta d\'un ajuntament');
  ok(r.seccions === 14, `la resta de la pàgina segueix sencera (${r.seccions} seccions amb àncora)`);
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
