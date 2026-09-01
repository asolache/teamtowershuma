/* El mapa de valor amb un castell · que sigui una anàlisi i no un dibuix
   ─────────────────────────────────────────────────────────────────────────
   Un graf bonic no és un VNA. El que el converteix en anàlisi són les
   preguntes que s'hi fan, i és el que es prova aquí:

   · **Les dues menes de lliurament, sempre les dues.** Si només hi hagués el
     tangible seria un diagrama de processos; si només l'intangible, un pòster.
   · **Qui només dona es calcula, no s'assenyala.** El pas 6 marca els rols amb
     fletxes de sortida i cap d'entrada llegint el graf. Si es marquessin a mà,
     el dia que canviïn les fletxes seguiria assenyalant els d'abans.
   · **Treure un node té un cost comptat.** El pas 7 diu quants lliuraments es
     perden, i el número surt del graf.
   · **Cada rol diu el que diu la portada**, paraula per paraula.

   Veda 116. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const APP = 'file://' + join(AQUI, '..', 'vna.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const nova = async (w = 1280, h = 1000) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(APP);
  await p.waitForFunction(() => window.__VNA);
  return { ctx, p, errs };
};

console.log('\n1 · Els dotze rols i les dues menes de lliurament');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const V = window.__VNA;
    return { rols: V.ROLS.length, fluxos: V.FLUXOS.length,
      t: V.FLUXOS.filter(x => x[2] === 't').length,
      i: V.FLUXOS.filter(x => x[2] === 'i').length,
      senseT: V.ROLS.filter(x => !x.t).map(x => x.id),
      senseI: V.ROLS.filter(x => !x.i).map(x => x.id),
      sensePoble: V.ROLS.filter(x => !x.poble).map(x => x.id),
      motiu: V.FLUXOS.filter(x => !x[3]).length };
  });
  ok(r.rols === 12, `dotze rols (${r.rols})`);
  ok(!r.senseT.length && !r.senseI.length,
    'cadascun diu què dona de tangible i d\'intangible — les dues sempre');
  ok(!r.sensePoble.length, 'i què vol dir al poble, que és on va a parar tot això');
  ok(r.t > 0 && r.i > 0, `${r.t} lliuraments que es veuen i ${r.i} que no`);
  ok(r.motiu === 0, 'cada lliurament porta escrit de quina frase surt — cap inventat');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n2 · El text és el de la portada, paraula per paraula');
{
  const portada = readFileSync(join(AQUI, '..', '..', 'index.html'), 'utf8');
  const { ctx, p } = await nova();
  const rols = await p.evaluate(() => window.__VNA.ROLS.map(r => ({ id: r.id, t: r.t, i: r.i })));
  /* Es busca el text literal dins de la portada: si algú el reescriu aquí, la
     mateixa colla queda explicada de dues maneres (veda 109). */
  const fora = rols.filter(r => !portada.includes(r.t.replace(/'/g, "\\'")) ||
    !portada.includes(r.i.replace(/'/g, "\\'")));
  ok(!fora.length, 'els dotze textos surten tal qual de la portada' +
    (fora.length ? ' — se n\'aparten: ' + fora.map(x => x.id).join(', ') : ''));
  await ctx.close();
}

console.log('\n3 · Els nou passos, i que cadascun ensenyi una cosa diferent');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const V = window.__VNA, out = [];
    for (let i = 0; i < V.PASSOS.length; i++) {
      V.S.i = i; V.S.sel = null; V.pinta();
      out.push({ n: V.PASSOS[i].n, t: document.querySelector('#pT').textContent,
        fletxes: document.querySelectorAll('#llenc path[marker-end]').length,
        nodes: document.querySelectorAll('#llenc .nd').length });
    }
    return out;
  });
  ok(r.length === 9, `nou passos (${r.length})`);
  ok(r.every(x => x.nodes === 12), 'els dotze rols hi són a tots');
  ok(r[0].fletxes === 0 && r[1].fletxes === 0, 'els dos primers no ensenyen cap fletxa: primer la colla, després els rols');
  ok(r[2].fletxes > 0 && r[3].fletxes > 0, 'el 3 ensenya el tangible i el 4 l\'intangible');
  ok(r[4].fletxes === r[2].fletxes + r[3].fletxes,
    `i el 5 les ensenya totes dues alhora (${r[4].fletxes} = ${r[2].fletxes} + ${r[3].fletxes})`);
  ok(new Set(r.map(x => x.t)).size === 9, 'els nou títols són diferents: cap pas repeteix el del davant');
  ok(errs.length === 0, 'sense errors recorrent els nou passos' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n4 · Qui només dona es calcula, no s\'assenyala a mà');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const V = window.__VNA;
    const dona = {}, rep = {};
    V.FLUXOS.forEach(([f, t]) => { dona[f] = (dona[f] || 0) + 1; rep[t] = (rep[t] || 0) + 1; });
    const esperat = V.ROLS.filter(x => dona[x.id] && !rep[x.id]).map(x => x.id).sort();
    const dit = V.solsDonen().slice().sort();
    /* I es comprova que canviant el graf canviï el resultat: una funció que
       retornés una llista escrita a mà passaria la comprovació de sobre. */
    V.FLUXOS.push(['segons', 'musics', 'i', 'prova']);
    const despres = V.solsDonen().slice().sort();
    V.FLUXOS.pop();
    return { esperat, dit, despres };
  });
  ok(r.dit.join() === r.esperat.join(),
    `els que donen i no reben surten del graf: ${r.dit.join(', ')}`);
  ok(!r.despres.includes('musics') && r.dit.includes('musics'),
    'i si algú els dona alguna cosa, deixen de sortir-hi — es calcula de debò');
  await ctx.close();
}

console.log('\n5 · Treure un rol té un cost, i el cost es compta');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const V = window.__VNA;
    const i = V.PASSOS.findIndex(x => x.mira === 'treu');
    V.S.i = i; V.S.sel = null; V.pinta();
    const txt = document.querySelector('#llenc').textContent;
    const perdudes = V.FLUXOS.filter(([f, t]) => f === 'musics' || t === 'musics').length;
    return { i, txt, perdudes, surt: txt.includes(perdudes + ' lliuraments perduts') };
  });
  ok(r.i >= 0, 'hi ha el pas de treure un rol');
  ok(r.perdudes > 0, `treure els Músics perd ${r.perdudes} lliuraments`);
  ok(r.surt, 'i el número que es pinta és el que surt del graf, no un que hi hem posat');
  await ctx.close();
}

console.log('\n6 · Tocar un rol ensenya què dona');
{
  const { ctx, p } = await nova();
  await p.evaluate(() => { window.__VNA.S.i = 4; window.__VNA.pinta(); });
  const buit = await p.evaluate(() => document.querySelector('#fitxa').textContent);
  await p.evaluate(() => window.__VNA.tria('musics'));
  const ple = await p.evaluate(() => document.querySelector('#fitxa').textContent);
  ok(/Toca qualsevol rol/.test(buit), 'de bon principi la fitxa diu què s\'ha de fer');
  ok(/Rellotge de Xarxa/.test(ple), 'i en tocar-ne un, hi surt el seu títol');
  ok(/telemetria acústica/.test(ple) && /flux grupal/.test(ple),
    'amb el tangible i l\'intangible tal com estan escrits');
  ok(/dona \d+ lliurament/.test(ple), 'i quants lliuraments dona i quants en rep');
  await p.evaluate(() => window.__VNA.tria('musics'));
  const tancat = await p.evaluate(() => document.querySelector('#fitxa').textContent);
  ok(/Toca qualsevol rol/.test(tancat), 'i tornant-lo a tocar es tanca');
  await ctx.close();
}

console.log('\n7 · El pas 8 canvia els noms i no el graf');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const V = window.__VNA;
    V.S.i = 4; V.pinta();
    const colla = document.querySelector('#llenc').textContent;
    const f1 = document.querySelectorAll('#llenc path[marker-end]').length;
    V.S.i = 7; V.pinta();
    const poble = document.querySelector('#llenc').textContent;
    const f2 = document.querySelectorAll('#llenc path[marker-end]').length;
    return { colla, poble, f1, f2 };
  });
  ok(r.f1 === r.f2, `el graf és el mateix als dos passos (${r.f1} lliuraments)`);
  ok(/Una colla/.test(r.colla) && /Un poble/.test(r.poble), 'i el retolet diu de què parlem a cada un');
  ok(/veïnat/.test(r.poble) || /Veïnat/.test(r.poble), 'al pas 8 hi surten els noms del poble');
  ok(/Baixos/.test(r.poble), 'i el nom casteller es queda a sota: és una lectura, no una substitució');
  await ctx.close();
}

console.log('\n8 · Es pot recórrer amb el teclat, i cap al mòbil');
{
  const { ctx, p } = await nova();
  await p.evaluate(() => { window.__VNA.S.i = 0; window.__VNA.pinta(); });
  await p.keyboard.press('ArrowRight');
  const un = await p.evaluate(() => window.__VNA.S.i);
  await p.keyboard.press('ArrowLeft');
  const zero = await p.evaluate(() => window.__VNA.S.i);
  const r = await p.evaluate(() => ({
    enrere: document.querySelector('#btEnrere').disabled,
    tecles: document.querySelectorAll('#passos button').length,
    focus: [...document.querySelectorAll('#llenc .nd')].every(n => n.getAttribute('tabindex') === '0'),
    etiqueta: document.querySelector('#llenc .nd').getAttribute('aria-label')
  }));
  ok(un === 1 && zero === 0, 'les fletxes mouen entre passos');
  ok(r.enrere, 'al primer pas el botó d\'enrere està apagat i no enganya');
  ok(r.tecles === 9, 'la barra de passos té els nou trossos');
  ok(r.focus && !!r.etiqueta, 'i cada rol es pot enfocar amb el teclat i diu qui és');
  await ctx.close();
}
for (const [w, h] of [[390, 844], [1280, 1000]]) {
  const { ctx, p, errs } = await nova(w, h);
  const r = await p.evaluate(() => ({ ample: document.documentElement.scrollWidth,
    esc: Math.round(document.querySelector('.escena').getBoundingClientRect().width) }));
  ok(r.ample <= w, `${w}px · la pàgina no se'n va de costat`);
  ok(r.esc > 200 && r.esc <= w, `${w}px · el dibuix hi cap (${r.esc}px)`);
  ok(errs.length === 0, `${w}px · sense errors de pàgina`);
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
