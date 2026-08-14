/* Fase 3 · El rànquing dins del teu node.
   `activityRanking({scopeId})` ja sabia limitar-se a un subarbre; el que faltava
   era poder-hi arribar. Veure't a la xarxa sencera diu poc: al costat de 500
   persones, ser el 340è no vol dir res.

   Però reduir l'àmbit fa **pitjor** el problema de la veda 56 —un rànquing en una
   eina de suport mutu es pot girar en contra— i no millor: en un grup de cinc,
   ser l'últim assenyala algú concret. El que es prova aquí, sobretot, és que per
   sota de cinc persones no hi hagi ordre, i que la regla es digui. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await b.newPage({ viewport: { width: 1280, height: 900 } });
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.rankingScope);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

/* Dos nodes germans sota el mateix municipi: un petit (3 persones) i un gran
   (6). Així es pot provar la mateixa regla als dos costats del llindar, i el
   pare, que els conté tots dos. */
const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const muni = S.newNode('Torrelles de Foix', 'municipi', null);
  S.state.nodes.push(muni); await S.persist(muni);
  const mk = async (nom, gent) => {
    const n = S.newNode(nom, 'projecte', muni.id);
    n.dynamicType = 'banc_temps'; S.seedFromDynamic(n, S.dynById('banc_temps'));
    const ids = [];
    for (const g of gent) { const m = S.newMember({ name: g }); S.membersOf(n).push(m); ids.push(m); }
    S.state.nodes.push(n);
    /* Aportacions signades: el rànquing només compta el que està signat. */
    for (let i = 0; i < ids.length; i++) {
      await S.pushLedger(n.ledger || (n.ledger = []), { id: nom + i, ts: new Date().toISOString(),
        type: 'temps', value: (ids.length - i) * 2, memberId: ids[i].id, category: 'cuina',
        who: ids[i].name, what: 'Aportació de ' + ids[i].name });
    }
    await S.persist(n);
    return n;
  };
  const petit = await mk('Grup petit', ['Ada Roig', 'Bru Solé', 'Cel Mas']);
  const gran = await mk('Grup gran', ['Dani Pons', 'Eva Serra', 'Foix Vila', 'Gal Ruiz', 'Ona Prat', 'Pau Ferrer']);
  await S.setActivePersona('Ada Roig');
  return { muni: muni.id, petit: petit.id, gran: gran.id };
});

console.log('\n1 · L\'àmbit es pot triar: xarxa, node, i el que el conté');
const ambits = await page.evaluate((s) => {
  const S = window.__SOS;
  S.selectNode(s.petit);
  const a = S.rankingScopes();
  return { n: a.length, lbls: a.map(x => x.lbl), teParent: a.some(x => /el que el conté/.test(x.lbl)) };
}, seed);
ok(ambits.n === 3 && ambits.teParent,
  'tres àmbits des d\'un node: ' + ambits.lbls.join(' · '));

console.log('\n2 · Cada àmbit compta la seva gent, no la de tothom');
const compta = await page.evaluate((s) => {
  const S = window.__SOS;
  return { xarxa: S.rankingScope('').persones,
    petit: S.rankingScope(s.petit).persones,
    gran: S.rankingScope(s.gran).persones,
    pare: S.rankingScope(s.muni).persones };
}, seed);
ok(compta.petit === 3 && compta.gran === 6,
  'el grup petit en té ' + compta.petit + ' i el gran ' + compta.gran);
ok(compta.pare === 9 && compta.xarxa === 9,
  'i el municipi que els conté suma els dos: ' + compta.pare + ' — «fill o pare» és un àmbit de debò');

console.log('\n══ El que importa: un rànquing necessita gent per ser segur ══');

console.log('\n3 · Amb menys de 5 persones no hi ha ordre, i es diu per què');
const petit = await page.evaluate((s) => {
  const S = window.__SOS;
  const r = S.rankingScope(s.petit);
  return { ranquing: r.ranquing, persones: r.persones, diu: r.diu, files: r.files.length,
    min: S.RANK_MIN_PERSONES };
}, seed);
ok(!petit.ranquing && petit.persones < petit.min,
  petit.persones + ' persones, per sota del mínim de ' + petit.min + ': cap ordre');
ok(/assenyala algú concret/.test(petit.diu || ''),
  'i es diu el motiu, no s\'amaga: «' + petit.diu + '»');
ok(petit.files === 3,
  'però les aportacions segueixen sortint: no ordenar no és amagar');

console.log('\n4 · A partir de 5, rànquing complet');
const gran = await page.evaluate((s) => {
  const S = window.__SOS;
  const r = S.rankingScope(s.gran);
  return { ranquing: r.ranquing, persones: r.persones, diu: r.diu,
    ordenat: r.files.every((f, i) => !i || f.punts <= r.files[i - 1].punts) };
}, seed);
ok(gran.ranquing && gran.diu === null,
  gran.persones + ' persones: rànquing, i sense cap avís que no cal');
ok(gran.ordenat, 'i surt ordenat de més a menys punts');

console.log('\n5 · A la pantalla: el número desapareix, la fila no');
const ui = await page.evaluate(async (s) => {
  const S = window.__SOS;
  const mira = async (id) => {
    S.state.rankScope = id; S.state.activeId = null; S.state.homeView = 'gent';
    S.render(); await new Promise(r => setTimeout(r, 200));
    const box = document.querySelector('#rkBody');
    const files = [...box.querySelectorAll('.rk-row')];
    return { files: files.length,
      ambNumero: files.filter(f => !f.querySelector('.rk-pos.flat')).length,
      plans: files.filter(f => f.querySelector('.rk-pos.flat')).length,
      punts: box.querySelectorAll('.rk-pts').length,
      avis: /assenyala algú concret/.test(box.textContent) };
  };
  const p = await mira(s.petit);
  const g = await mira(s.gran);
  return { p, g };
}, seed);
ok(ui.p.files === 3 && ui.p.plans === 3 && ui.p.punts === 0,
  'al grup petit surten les 3 files sense número ni punts');
ok(ui.p.avis, 'amb l\'avís que explica per què');
ok(ui.g.files === 6 && ui.g.ambNumero === 6 && ui.g.punts === 6 && !ui.g.avis,
  'i al gran, les 6 amb número i punts, sense avís');

console.log('\n6 · La resta de la veda 56 segueix dempeus a qualsevol àmbit');
const veda56 = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.gran);
  /* Una estimació de l'oracle no ha de puntuar ningú, ni tan sols al node. */
  const abans = S.rankingScope(s.gran).files[0].punts;
  await S.pushLedger(n.ledger, { id: 'est1', ts: new Date().toISOString(), type: 'temps',
    value: 999, memberId: S.membersOf(n)[0].id, estimate: true, who: 'Dani Pons', what: 'estimat' });
  await S.persist(n);
  const despres = S.rankingScope(s.gran).files.find(f => /Dani/.test(f.name));
  return { abans, despres: despres && despres.punts,
    reciproc: S.rankingScope(s.gran).files.every(f => typeof f.reciprocitat === 'number') };
}, seed);
ok(veda56.abans === veda56.despres,
  'una estimació de l\'oracle no mou el rànquing del node: ' + veda56.abans + ' → ' + veda56.despres);
ok(veda56.reciproc, 'i la reciprocitat segueix comptant a l\'escala petita');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
