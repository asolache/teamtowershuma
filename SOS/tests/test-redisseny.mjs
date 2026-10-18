/* El redisseny del SOS (18/10/2026), fases 0 i 1.
   · Fase 0: l'app porta la pell del lloc (paper i tinta), cap text per sota
     de 15 px, i el fosc és una opció de Configuració que es recorda.
   · Fase 1: la portada és «Avui»: el pols dels fluxos i «Què ha passat?», amb
     les altres portades a la fila «Més» i la resta del tauler plegada. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });

/* Els textos per sota del terra, comptats al que es veu (no els dibuixos SVG,
   que van en unitats del dibuix). */
const sotaTerra = () => page.evaluate(() => {
  const out = [];
  document.querySelectorAll('body *').forEach(e => {
    if (e.closest('svg') || !e.offsetParent) return;
    const t = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!t) return;
    const fs = parseFloat(getComputedStyle(e).fontSize);
    if (fs < 14.9) out.push(e.tagName + '.' + e.className + ' ' + fs + 'px');
  });
  return out;
});

console.log('\n1 · La pell del lloc: paper, tinta i el terra de 15 px');
await page.goto(APP);
await page.waitForFunction(() => window.__SOS);
await page.waitForTimeout(800);
const fons = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
ok(fons === 'rgb(251, 250, 247)', 'el fons és el paper del lloc (' + fons + ')');
let sota = await sotaTerra();
ok(!sota.length, 'cap text de la porta per sota de 15 px' + (sota.length ? ': ' + sota.slice(0, 4).join(' · ') : ''));

console.log('\n2 · Avui, amb l\'exemple viu');
await page.goto(APP + '?viu');
await page.waitForFunction(() => window.__SOS);
await page.waitForTimeout(1200);
await page.evaluate(() => { const S = window.__SOS; S.state.activeId = null; S.state.homeView = 'tauler'; S.render(); });
await page.waitForSelector('#avui .av-qp');
const av = await page.evaluate(() => ({
  xifra: document.querySelector('#avui .av-xf b').textContent,
  de: document.querySelector('#avui .av-xf span').textContent,
  primer: (document.querySelector('#avui .av-fet') || {}).className || '',
  fets: document.querySelectorAll('#avui .av-fet').length,
  mapa: !!document.querySelector('#avMapa svg path[data-ex]'),
  mes: [...document.querySelectorAll('.av-mes-b')].map(x => x.textContent),
  plec: !!document.querySelector('details.av-plec') && !document.querySelector('details.av-plec').open,
  dalt: Math.round(document.querySelector('#avui').getBoundingClientRect().top + scrollY)
}));
ok(av.xifra === '3' && /de 6 fluxos/.test(av.de), 'el pols diu 3 de 6 fluxos vius (' + av.xifra + ' ' + av.de + ')');
ok(/av-aturat/.test(av.primer) && av.fets === 2, '«Què ha passat?» posa primer l\'aturat, i n\'hi ha dos');
ok(av.mapa, 'i el mapa del projecte que més circula hi és, petit');
ok(av.mes.length === 4, 'les altres quatre portades, a la fila «Més»');
ok(av.plec, 'la resta del tauler, plegada a «Més del tauler»');
ok(av.dalt < 844, 'Avui comença dins la primera pantalla del mòbil (' + av.dalt + ' px)');
sota = await sotaTerra();
ok(!sota.length, 'cap text d\'Avui per sota de 15 px' + (sota.length ? ': ' + sota.slice(0, 4).join(' · ') : ''));
await page.click('#avui .av-fet');
await page.waitForTimeout(400);
const anat = await page.evaluate(() => ({ id: window.__SOS.state.activeId, tab: window.__SOS.state.tab,
  n: (window.__SOS.byId(window.__SOS.state.activeId) || {}).exempleViu }));
ok(anat.n && anat.tab === 'map', 'tocar un flux parat porta al mapa del seu projecte');
await page.evaluate(() => { const S = window.__SOS; S.state.activeId = null; S.state.homeView = 'tauler'; S.render(); });
await page.click('.av-mes-b');
ok(await page.evaluate(() => window.__SOS.state.homeView) === 'missions', 'la fila «Més» porta a les tasques');

console.log('\n3 · Sense cap flux, Avui no queda buit');
const p2 = await (await b.newContext({ viewport: { width: 1280, height: 860 } })).newPage();
await p2.goto(APP);
await p2.waitForFunction(() => window.__SOS);
await p2.evaluate(async () => { const S = window.__SOS; const n = S.newNode('Sense fluxos', 'projecte', null);
  S.state.nodes.push(n); await S.persist(n); S.state.activeId = null; S.state.homeView = 'tauler'; S.render(); });
ok(await p2.waitForSelector('#avExemple', { state: 'attached' }).then(() => true, () => false), 'ofereix l\'exemple viu');

console.log('\n4 · El fosc, triat i recordat');
await page.evaluate(() => { document.querySelector('#btnMore').click(); document.querySelector('#btnSettings').click(); });
await page.waitForSelector('#stTema [data-t="fosc"]');
await page.click('#stTema [data-t="fosc"]');
const fosc = await page.evaluate(() => ({ t: document.documentElement.dataset.tema, f: getComputedStyle(document.body).backgroundColor }));
ok(fosc.t === 'fosc' && fosc.f === 'rgb(5, 5, 7)', 'el fosc s\'aplica (' + fosc.f + ')');
await page.reload();
await page.waitForFunction(() => window.__SOS);
ok(await page.evaluate(() => document.documentElement.dataset.tema) === 'fosc', 'i es recorda en tornar a obrir');
await page.evaluate(() => { document.querySelector('#btnMore').click(); document.querySelector('#btnSettings').click(); });
await page.click('#stTema [data-t=""]');
ok(await page.evaluate(() => !document.documentElement.dataset.tema), 'i es torna al clar');

console.log('\n5 · «Què necessites?»: una sola barra, amb les teves paraules');
const qn = await page.evaluate(async () => {
  const S = window.__SOS;
  S.closeModal();
  const barra = document.querySelector('#btnSearch');
  const r = { llançador: !!document.querySelector('#btnLauncher'), text: barra.textContent };
  S.openSearchPalette();
  await new Promise(x => setTimeout(x, 120));
  r.suggereix = document.querySelectorAll('#spResults .sp-hit').length;
  const prova = async q => { const i = document.querySelector('#spQ'); i.value = q; i.dispatchEvent(new Event('input'));
    await new Promise(x => setTimeout(x, 60)); return document.querySelector('#spResults').textContent; };
  r.fosc = /Configuraci/.test(await prova('fosc'));
  r.reunio = /Assemblea/.test(await prova('reunió'));
  r.accio = /Pings ecosistema|Diagnòstic comunitari/.test(await prova('diagnòstic'));
  r.totes = !!document.querySelector('#spTotes');
  S.closeModal();
  return r;
});
ok(!qn.llançador && /Què necessites/.test(qn.text), 'la barra «Què necessites?» substitueix el botó «Accions»');
ok(qn.suggereix > 0, 'sense escriure res, proposa el que ara serveix (' + qn.suggereix + ')');
ok(qn.fosc && qn.reunio, 'entén «fosc» i «reunió» encara que les accions es diguin d\'una altra manera');
ok(qn.accio, 'troba les accions del llançador, no només les de la cerca');
ok(qn.totes, 'i el llançador sencer queda a un clic');

await b.close();
console.log(`\n${fail ? '❌' : '✅'} ${pass} ok · ${fail} malament`);
process.exit(fail ? 1 : 0);
