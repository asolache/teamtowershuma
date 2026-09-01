/* La intro · que les dues vistes siguin la mateixa pel·lícula
   ─────────────────────────────────────────────────────────────────────────
   El que ven aquesta peça no és que sigui bonica: és que **el Comando i el SOS
   són la mateixa cosa vista de dues maneres**. Això només és cert si el
   muntatge ho és, i és el que es prova aquí:

   · **Un sol tall.** Els mateixos setze plans, les mateixes durades i el mateix
     rètol al mateix fotograma a totes dues pells. Si una vista tingués un pla
     de més, serien dos vídeos i dues promeses.
   · **Les dues pells s'animen alhora.** Si només s'animés la visible, canviar
     de vista a mitja reproducció ensenyaria l'altra congelada — i el salt
     delataria que són dos dibuixos i no un pla.
   · **La pinya creix i el castell aguanta.** L'S4 cau amb quatre i l'S14
     aguanta amb catorze. Si el final caigués, el vídeo diria el contrari del
     que fa la casa (veda 110).
   · **Els talls cauen al compàs.** El tema va a 80,2 ppm i cada pla dura un
     nombre rodó de mitjos compassos. Si un cau entremig, la peça sona a
     presentació amb música de fons i no a peça muntada.
   · **Mana el rellotge del tema.** Amb dos rellotges corrent sols, al minut ja
     no van junts i el primer que es perd és justament el tall al compàs.
   · **I sense el fitxer, la peça funciona igual**: la música és l'única part
     opcional, i es comprova bloquejant la petició, no esborrant res.

   Veda 115. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'intro.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const nova = async (w = 1280, h = 900) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(APP);
  await p.waitForFunction(() => window.__INTRO);
  return { ctx, p, errs };
};

console.log('\n1 · Un sol tall per a les dues vistes');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const I = window.__INTRO;
    return { n: I.PLANS.length, total: I.total(),
      sensRet: I.PLANS.filter(x => x.id !== 'S16' && (!x.ret || !x.retEs)).map(x => x.id),
      sensCam: I.PLANS.filter(x => !x.cam).length,
      ids: I.PLANS.map(x => x.id),
      dupIds: I.PLANS.map(x => x.id).filter((v, i, a) => a.indexOf(v) !== i) };
  });
  ok(r.n === 16, `setze plans (${r.n})`);
  ok(!r.dupIds.length, 'cap identificador de pla repetit');
  ok(r.total === 89796, `vuitanta-nou segons i escaig comptats (${r.total / 1000} s)`);
  ok(!r.sensRet.length, 'tots els plans porten rètol en català i castellà' +
    (r.sensRet.length ? ': falta a ' + r.sensRet.join(', ') : ''));
  ok(r.sensCam === 0, 'i tots diuen quina càmera fan, que és el que llegeix qui ho munti');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n2 · Les dues pells hi són sempre i s\'animen alhora');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const I = window.__INTRO, out = [];
    for (let i = 0; i < I.PLANS.length; i++) {
      I.ves(i, 0);
      const pells = document.querySelectorAll('#cine > .pell');
      /* S'anima i es mira que TOTES DUES pells hagin canviat. Si només canviés
         la visible, el canvi de vista en marxa mostraria l'altra congelada. */
      const abans = [...pells].map(x => x.innerHTML);
      I.anima(0.85);
      const despres = [...pells].map(x => x.innerHTML);
      out.push({ id: I.PLANS[i].id, n: pells.length,
        mou: abans.map((a, k) => a !== despres[k]) });
    }
    return out;
  });
  ok(r.every(x => x.n === 2), 'cada pla es munta amb les dues pells alhora');
  const quiets = r.filter(x => !x.mou[0] || !x.mou[1]).map(x => x.id);
  ok(!quiets.length, 'i les dues es mouen amb la mateixa crida' +
    (quiets.length ? ' — es queden quietes a: ' + quiets.join(', ') : ''));
  ok(errs.length === 0, 'sense errors recorrent els setze plans' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n3 · Canviar de vista no reinicia res');
{
  const { ctx, p } = await nova();
  await p.evaluate(() => { const I = window.__INTRO; I.ves(5, 0); I.anima(.6); });
  const abans = await p.evaluate(() => ({ i: window.__INTRO.S.i, t: window.__INTRO.S.t,
    html: document.querySelector('#cine').innerHTML.length }));
  await p.click('#btVista');
  const despres = await p.evaluate(() => ({ i: window.__INTRO.S.i, t: window.__INTRO.S.t,
    vista: window.__INTRO.S.vista, cls: document.getElementById('escenari').className,
    html: document.querySelector('#cine').innerHTML.length }));
  ok(despres.vista === 'c' && /vc/.test(despres.cls), 'el botó canvia a la vista Comando');
  ok(despres.i === abans.i && despres.t === abans.t, 'i el pla i el temps no es mouen');
  ok(despres.html === abans.html, 'l\'escena no es torna a muntar: només es fon d\'una pell a l\'altra');
  await ctx.close();
}

console.log('\n4 · El castell cau amb quatre i aguanta amb catorze');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const I = window.__INTRO;
    const compta = id => {
      const i = I.PLANS.findIndex(x => x.id === id);
      I.ves(i, 0);
      const c = document.querySelector('#cine .pell-c');
      return { pinya: c.querySelectorAll('.pinya use, .pinya g').length,
        tronc: c.querySelector('.tronc') };
    };
    const s4 = compta('S4');
    I.anima(1);
    const gir4 = (s4.tronc.getAttribute('transform') || '').match(/rotate\(([-\d.]+)/);
    const s14 = compta('S14');
    I.anima(1);
    const gir14 = (s14.tronc.getAttribute('transform') || '').match(/rotate\(([-\d.]+)/);
    return { p4: s4.pinya, p14: s14.pinya,
      gir4: gir4 ? Math.abs(+gir4[1]) : 0, gir14: gir14 ? Math.abs(+gir14[1]) : 0 };
  });
  ok(r.p4 === 4, `l'S4 té quatre a la pinya (${r.p4})`);
  ok(r.p14 === 14, `l'S14 en té catorze (${r.p14})`);
  ok(r.gir4 > 20, `i el de quatre cau: gira ${r.gir4.toFixed(0)}°`);
  ok(r.gir14 < 3, `mentre el de catorze aguanta: ${r.gir14.toFixed(1)}° — si aquí caigués, el vídeo diria el contrari del que fem`);
  await ctx.close();
}

console.log('\n5 · El tall de 30 s és un subconjunt, no una altra peça');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const I = window.__INTRO;
    const complet = I.PLANS.map(x => x.id);
    I.S.tall = true;
    const cut = I.llista();
    const dur = I.total();
    I.S.tall = false;
    return { ids: cut.map(x => x.id), dur, complet,
      ordre: cut.map(x => complet.indexOf(x.id)) };
  });
  ok(r.ids.length >= 6 && r.ids.length <= 8, `${r.ids.length} plans al tall curt: ${r.ids.join(' ')}`);
  ok(r.ids.every(id => r.complet.includes(id)), 'tots surten del muntatge complet');
  ok(r.ordre.every((v, i, a) => i === 0 || v > a[i - 1]), 'i en el mateix ordre');
  ok(r.dur <= 34000 && r.dur >= 26000, `dura ${r.dur / 1000} s, que és el que cap a una xarxa`);
  ok(r.ids.includes('S16'), 'i acaba amb el rètol, que és el que ha de quedar');
  await ctx.close();
}

console.log('\n6 · Els talls cauen al compàs del tema');
{
  const { ctx, p } = await nova();
  await p.waitForTimeout(1200);
  const r = await p.evaluate(() => {
    const I = window.__INTRO, s = I.so();
    /* 80,2 pulsacions per minut · un compàs de 4 cada 2,993 s. Cada pla ha de
       durar un nombre rodó de mitjos compassos: si un cau entremig, la peça
       sona a presentació amb música de fons i no a peça muntada. */
    const COMPAS = 2993;
    const fora = I.PLANS.filter(x => Math.abs((x.dur / COMPAS) * 2 - Math.round((x.dur / COMPAS) * 2)) > 0.01);
    const curts = I.PLANS.filter(x => x.curt)
      .filter(x => Math.abs((x.curt / COMPAS) * 2 - Math.round((x.curt / COMPAS) * 2)) > 0.01);
    return { fora: fora.map(x => x.id), curts: curts.map(x => x.id), teSo: I.teSo(),
      dur: s && s.duration, total: I.total(), tall: I.SO_TALL, so: I.SO };
  });
  ok(!r.fora.length, 'els setze plans duren un nombre rodó de mitjos compassos' +
    (r.fora.length ? ' — se n\'escapen: ' + r.fora.join(', ') : ''));
  ok(!r.curts.length, 'i els del tall curt també');
  ok(r.teSo, 'el tema carrega: ' + r.so);
  ok(r.dur > r.total / 1000, `el retall (${r.dur.toFixed(1)} s) cobreix la peça sencera (${r.total / 1000} s)`);
  ok(r.tall + 33 <= r.dur, `i el desplaçament del tall curt (${r.tall} s) hi cap sense sortir-se'n`);
  await ctx.close();
}

console.log('\n7 · Mana el rellotge del tema, no el del navegador');
{
  const { ctx, p } = await nova();
  await p.waitForTimeout(1200);
  await p.evaluate(() => window.__INTRO.juga());
  await p.waitForTimeout(2200);
  const r = await p.evaluate(() => {
    const I = window.__INTRO, s = I.so();
    const d = { t: I.S.t, a: s.currentTime * 1000 - I.soOffset() * 1000, vol: s.volume, pausa: s.paused };
    I.atura();
    return d;
  });
  ok(!r.pausa, 'el tema sona amb la peça');
  ok(Math.abs(r.t - r.a) < 120,
    `i el temps de la peça i el del tema van junts (${Math.round(r.t)} ms contra ${Math.round(r.a)} ms)`);
  ok(r.vol > 0.5, 'amb el volum ja pujat després de l\'entrada');
  const q = await p.evaluate(() => window.__INTRO.so().paused);
  ok(q, 'i en aturar la peça, s\'atura');
  await ctx.close();
}

console.log('\n8 · Sense el fitxer, la peça funciona igual');
{
  /* La música és l'única part opcional, i això s'ha de poder comprovar sense
     esborrar-la: es bloqueja la petició i es mira que la peça vagi igual. */
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/comando-horacio.mp3', r => r.abort());
  await p.goto(APP);
  await p.waitForFunction(() => window.__INTRO);
  await p.waitForTimeout(900);
  const avis = await p.evaluate(() => document.querySelector('#avisSo').textContent);
  const r = await p.evaluate(() => {
    const I = window.__INTRO;
    I.ves(3, 0); I.anima(.8);
    I.juga(); const va = I.S.va; I.atura();
    return { va, teSo: I.teSo(), pla: I.S.i };
  });
  ok(!r.teSo, 'sense el fitxer, la pàgina sap que no en té');
  ok(/sense música/i.test(avis), 'i ho diu: «' + avis.slice(0, 40) + '…»');
  ok(r.va && r.pla === 3, 'la peça es reprodueix i es navega igual');
  ok(errs.length === 0, 'un àudio que no carrega no trenca res' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n9 · Es pot fer servir amb el teclat i amb el dit');
{
  const { ctx, p } = await nova();
  await p.evaluate(() => window.__INTRO.ves(0, 0));
  await p.keyboard.press('ArrowRight');
  const seg = await p.evaluate(() => window.__INTRO.S.i);
  await p.keyboard.press('ArrowLeft');
  const tor = await p.evaluate(() => window.__INTRO.S.i);
  await p.keyboard.press('v');
  const vis = await p.evaluate(() => window.__INTRO.S.vista);
  const r = await p.evaluate(() => ({
    segs: document.querySelectorAll('#barra .seg').length,
    etiqueta: !!document.querySelector('#barra .seg').getAttribute('aria-label'),
    llengua: document.querySelector('#btLlengua').textContent
  }));
  ok(seg === 1, 'la fletxa dreta passa al pla següent');
  ok(tor === 0, 'i l\'esquerra torna enrere');
  ok(vis === 'c', 'la tecla V canvia de vista');
  ok(r.segs === 16, 'la barra té un tros per pla, i s\'hi pot clicar');
  ok(r.etiqueta, 'cada tros diu on porta per a qui no el veu');
  ok(r.llengua === 'CA', 'i els rètols comencen en català');
  await p.click('#btLlengua');
  const es = await p.evaluate(() => document.querySelector('#mRetol').textContent);
  ok(/mismos cuatro/.test(es), 'el botó d\'idioma els passa al castellà: «' + es + '»');
  await ctx.close();
}

console.log('\n10 · Cap al mòbil i cap al portàtil');
for (const [w, h] of [[390, 844], [1280, 900]]) {
  const { ctx, p, errs } = await nova(w, h);
  const r = await p.evaluate(() => {
    const esc = document.getElementById('escenari').getBoundingClientRect();
    return { ample: document.documentElement.scrollWidth, esc: Math.round(esc.width),
      dins: Math.round(esc.bottom) };
  });
  ok(r.ample <= w, `${w}px · la pàgina no se'n va de costat`);
  ok(r.esc > 200 && r.esc <= w, `${w}px · l'escenari hi cap (${r.esc}px)`);
  ok(errs.length === 0, `${w}px · sense errors de pàgina`);
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
