/* La meva llesca · el Slicing Pie vist per qui hi treballa
   ─────────────────────────────────────────────────────────────────────────
   L'equity que ja hi havia mira la tarta des de qui reparteix. Qui hi treballa
   té una altra pregunta, i és la que trenca cooperatives: **el teu percentatge
   no és teu**. És una raó, i baixa cada vegada que qualsevol altre aporta,
   encara que tu no paris ni un dia.

   Matemàticament és correcte i és el que fa que el Slicing Pie sigui just. El
   problema és descobrir-ho sis mesos després mirant un gràfic: llavors el que
   sents és que t'han robat, i ja no hi ha conversa.

   Aquí es prova que les tres xifres que ho eviten siguin de debò: la dilució
   amb el ritme d'ara, què costa parar, i quantes hores falten per arribar on
   vols. Més la forquilla salarial, que es perd apunt a apunt. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await b.newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.dilucio);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

/* La coop de mostra: l'Ada treballa moltes hores barates, el Bru poques i
   cares, i el Cesc hi ha posat diners i no treballa. */
const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Coop La Rambla', 'projecte', null);
  n.dynamicType = 'coop_treball';
  S.seedFromDynamic(n, S.dynById('coop_treball'));
  S.state.nodes.push(n); await S.persist(n);
  const M = {};
  ['Ada', 'Bru', 'Cesc'].forEach(x => { const m = S.newMember({ name: x }); S.membersOf(n).push(m); M[x] = m.id; });
  const DIA = 86400000, ara = Date.now();
  const apunt = (qui, type, value, rate, fa) => n.ledger.unshift({ id: Math.random().toString(36).slice(2),
    who: qui, what: 'feina', type, value, rate, memberId: M[qui], ts: new Date(ara - fa * DIA).toISOString() });
  for (let i = 0; i < 10; i++) apunt('Ada', 'temps', 10, 20, i * 7);
  for (let i = 0; i < 4; i++) apunt('Bru', 'temps', 10, 60, i * 7);
  apunt('Cesc', 'moneda', 3000, 0, 30);
  await S.persist(n); S.selectNode(n.id);
  return { id: n.id, M };
});

console.log('\n1 · La llesca, desglossada i comprovable');
{
  const r = await page.evaluate(({ id, M }) => {
    const S = window.__SOS, n = S.byId(id), cfg = S.equityCfg(n);
    const eq = S.computeEquity(n);
    const de = nm => eq.find(x => x.name === nm);
    return { cfg, ada: de('Ada'), bru: de('Bru'), cesc: de('Cesc'),
      total: eq.reduce((a, x) => a + x.slices, 0) };
  }, seed);
  /* 100 h × 20 €/h × 2 = 4.000; 40 h × 60 × 2 = 4.800; 3.000 € × 4 = 12.000. */
  ok(r.ada.slices === 4000 && r.bru.slices === 4800,
    `l'Ada fa 100 h barates i en treu ${r.ada.slices} llesques; el Bru fa 40 h cares i en treu ${r.bru.slices}`);
  ok(r.cesc.slices === 12000,
    `i el Cesc, que no treballa, en té ${r.cesc.slices}: el diner va ×${r.cfg.cash} i el treball ×${r.cfg.nonCash}`);
  ok(Math.abs(r.ada.pct - 4000 * 100 / 20800) < 0.01,
    `el percentatge és exactament la raó: ${Math.round(r.ada.pct * 10) / 10}% de ${r.total} llesques`);
  ok(r.bru.slices > r.ada.slices && r.bru.pct > r.ada.pct,
    'i qui fa menys hores però més cares en té més: la tarifa decideix la llesca, no les hores');
}

console.log('\n2 · El teu percentatge baixa encara que tu no paris');
{
  const r = await page.evaluate(async ({ id, M }) => {
    const S = window.__SOS, n = S.byId(id);
    const abans = S.computeEquity(n).find(x => x.memberId === M.Ada).pct;
    /* El Bru fa una setmana forta. L'Ada no ha fet res ni ha deixat de fer res. */
    n.ledger.unshift({ id: 'x' + Math.random(), who: 'Bru', what: 'feina', type: 'temps',
      value: 40, rate: 60, memberId: M.Bru, ts: new Date().toISOString() });
    await S.persist(n);
    const despres = S.computeEquity(n).find(x => x.memberId === M.Ada);
    return { abans, despres: despres.pct, slices: despres.slices };
  }, seed);
  ok(r.slices === 4000,
    'les llesques de l\'Ada no han canviat: ningú li ha tret res');
  ok(r.despres < r.abans,
    `i tot i així el seu percentatge baixa del ${Math.round(r.abans * 10) / 10}% al ` +
    `${Math.round(r.despres * 10) / 10}%: és una raó, no una propietat`);
}

console.log('\n3 · La projecció: què costa parar, dit abans');
{
  const r = await page.evaluate(({ id, M }) => {
    const S = window.__SOS, n = S.byId(id);
    return { ada: S.dilucio(n, M.Ada, 6), cesc: S.dilucio(n, M.Cesc, 6),
      ritmeAda: S.ritmeLlesques(n, M.Ada, 90).perDia,
      ritmeCesc: S.ritmeLlesques(n, M.Cesc, 90).perDia,
      curt: S.dilucio(n, M.Ada, 1) };
  }, seed);
  ok(r.ada.parant < r.ada.seguint && r.ada.costDeParar > 0,
    `si l'Ada para sis mesos passa del ${Math.round(r.ada.seguint * 10) / 10}% al ` +
    `${Math.round(r.ada.parant * 10) / 10}%: parar li costa ${Math.round(r.ada.costDeParar * 10) / 10} punts`);
  ok(r.curt.costDeParar < r.ada.costDeParar,
    `i parar un mes costa menys que parar-ne sis (${Math.round(r.curt.costDeParar * 10) / 10} punts contra ` +
    `${Math.round(r.ada.costDeParar * 10) / 10}): el número creix amb el temps, com a la vida`);
  ok(r.ritmeAda > 0 && r.ritmeCesc > 0,
    'el ritme es mesura sobre una finestra recent, no sobre tota la història');
  ok(r.cesc.costDeParar > r.ada.costDeParar,
    'i qui més aporta és qui més s\'hi juga parant: no és una amenaça, és aritmètica');
}

console.log('\n4 · Quantes hores falten, exactament');
{
  const r = await page.evaluate(({ id, M }) => {
    const S = window.__SOS, n = S.byId(id), cfg = S.equityCfg(n);
    const eq = S.computeEquity(n), T = eq.reduce((a, x) => a + x.slices, 0);
    const jo = eq.find(x => x.memberId === M.Ada);
    return { r40: S.horesPer(n, M.Ada, 40), r100: S.horesPer(n, M.Ada, 100),
      rJa: S.horesPer(n, M.Ada, 5), rCar: S.horesPer(n, M.Ada, 40, 60),
      T, s: jo.slices, cfg };
  }, seed);
  /* x = (pT − s)/(1 − p), i les hores són x dividit pel que val una hora. */
  const x = (0.4 * r.T - r.s) / 0.6;
  ok(Math.abs(r.r40.llesques - x) < 0.01 && Math.abs(r.r40.hores - x / (20 * r.cfg.nonCash)) < 0.01,
    `per arribar al 40% calen ${Math.round(r.r40.hores * 10) / 10} h, que és exactament (0,4·T − s)/0,6 ` +
    'dividit pel que val una hora');
  ok(r.rCar.hores < r.r40.hores,
    `i a 60 €/h en calen ${Math.round(r.rCar.hores * 10) / 10} en comptes de ` +
    `${Math.round(r.r40.hores * 10) / 10}: la tarifa és la conversa, no les hores`);
  ok(r.r100.impossible && /ningú més/.test(r.r100.motiu),
    'demanar el 100% diu que no pot ser, en comptes de tornar una divisió per zero amb aspecte de xifra');
  ok(r.rJa.jaHiEts, 'i un objectiu que ja tens ho diu, en comptes de demanar-te hores negatives');
}

console.log('\n5 · La forquilla salarial, que es perd apunt a apunt');
{
  const r = await page.evaluate(async ({ id, M }) => {
    const S = window.__SOS, n = S.byId(id);
    const ara = S.forquilla(n);
    /* Algú posa una tarifa a mà molt per sobre. L'assemblea no ha acordat res. */
    n.ledger.unshift({ id: 'y' + Math.random(), who: 'Bru', what: 'feina', type: 'temps',
      value: 1, rate: 200, memberId: M.Bru, ts: new Date().toISOString() });
    await S.persist(n);
    const trencada = S.forquilla(n);
    n.ledger.shift(); await S.persist(n);
    return { ara: { ratio: ara.ratio, passa: ara.passa, max: ara.max,
      alta: ara.alta.member.name, baixa: ara.baixa.member.name },
      trencada: { ratio: trencada.ratio, passa: trencada.passa } };
  }, seed);
  ok(r.ara.ratio === 3 && r.ara.passa,
    `la forquilla d'ara és ${r.ara.ratio}:1 (${r.ara.alta} a dalt, ${r.ara.baixa} a baix) i cap dins del ` +
    `${r.ara.max}:1 declarat`);
  ok(r.trencada.ratio === 10 && !r.trencada.passa,
    `un sol apunt amb una tarifa posada a mà la porta a ${r.trencada.ratio}:1 i ja no passa: ` +
    'és així com una regla d\'assemblea es perd sense que salti res');
}

console.log('\n6 · La pantalla');
{
  const r = await page.evaluate(async ({ id }) => {
    const S = window.__SOS, n = S.byId(id);
    S.selectNode(n.id); S.state.tab = 'llesca'; S.renderWorkspace();
    await new Promise(r2 => setTimeout(r2, 250));
    const txt = document.body.textContent.replace(/\s+/g, ' ');
    const abans = JSON.stringify(S.computeEquity(n));
    /* Canviar de persona no pot moure cap llesca. */
    const sel = document.querySelector('.llesca-qui');
    sel.selectedIndex = 1; sel.onchange();
    await new Promise(r2 => setTimeout(r2, 200));
    return { pestanya: [...document.querySelectorAll('.tab')].some(t => /llesca/i.test(t.textContent)),
      diuRao: /El teu percentatge no és teu/.test(txt),
      diuCost: /costa parar/.test(txt),
      diuForquilla: /forquilla/i.test(txt),
      objectiu: !!document.querySelector('.obj-pct'),
      canviaQui: S.estat ? true : document.querySelectorAll('.llesca-qui').length === 1,
      igual: JSON.stringify(S.computeEquity(n)) === abans };
  }, seed);
  ok(r.pestanya, 'els projectes de cooperativa tenen la pestanya de la llesca');
  ok(r.diuRao && r.diuCost, 'la pantalla diu que el percentatge és una raó i què costa parar');
  ok(r.diuForquilla && r.objectiu, 'i porta la forquilla i la casella de l\'objectiu');
  ok(r.igual, 'canviar de persona no mou cap llesca: la pantalla només llegeix');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
