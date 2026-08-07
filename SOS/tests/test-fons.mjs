/* V55 · El fons cooperatiu deixa de ser una funció dins la MATRIU i passa a ser
   la destinació visible del flux de valor. El que més importa aquí és que
   verificat i estimat no es barregin mai, i que res es compti dues vegades. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await b.newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.networkFund);

// Un territori amb banc de temps i biblioteca, i CAP MATRIU: el cas que abans
// donava un fons de zero.
const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const pais = S.newNode('Catalunya', 'pais', null);
  const muni = S.newNode('Torrelles de Foix', 'municipi', pais.id);
  const bt = S.newNode('Banc de Temps', 'projecte', muni.id); bt.dynamicType = 'banc_temps';
  const bib = S.newNode('Biblioteca', 'projecte', muni.id); bib.dynamicType = 'biblioteca_coses';
  S.state.nodes.push(pais, muni, bt, bib);
  const E = (o) => Object.assign({ id: 'e' + Math.random().toString(36).slice(2), ts: new Date().toISOString(), who: o.who || 'Anna' }, o);
  // 10 h signades + 4 h sense signar
  bt.ledger = [
    E({ type: 'temps', value: 6, sig: 'x', who: 'Anna' }),
    E({ type: 'temps', value: 4, sig: 'x', who: 'Bru' }),
    E({ type: 'temps', value: 4, who: 'Cesc' })
  ];
  // 200 € signats + 50 € sense signar + 30 € d'objectes (estimació de l'oracle)
  bib.ledger = [
    E({ type: 'moneda', value: 200, sig: 'x', who: 'Anna' }),
    E({ type: 'moneda', value: 50, who: 'Dora' }),
    E({ type: 'objecte', value: 30, estimate: true, sig: 'x', who: 'Anna' })
  ];
  await S.persist(bt); await S.persist(bib);
  return { paisId: pais.id, muniId: muni.id, btId: bt.id };
});

console.log('\n1 · Un territori sense MATRIU ja té fons');
const f = await page.evaluate((id) => window.__SOS.networkFund(id), seed.paisId);
ok(f.registrat.apunts === 6, 'compta els sis apunts del territori');
ok(f.mobilitzat.total > 0, 'el fons no és zero encara que no hi hagi cap MATRIU');
ok(Object.keys(f.byDyn).sort().join(',') === 'banc_temps,biblioteca_coses', 'i sap de quina dinàmica surt cada euro');

console.log('\n2 · Verificat vol dir signat i no estimat');
ok(f.verificat.eur === 200, 'els 50 € sense signar no són verificats');
ok(f.verificat.hores === 10, 'les 4 h sense signar tampoc');
ok(f.verificat.apunts === 3, 'tres apunts verificats: dues hores i un diner');
ok(f.estimats === 1, 'el desgast de préstec es compta com a estimació');
ok(!('total' in f.verificat), 'el verificat no té cap total en euros: les hores es diuen en hores');

console.log('\n3 · L\'estimació va a part, amb rang i font');
ok(f.registrat.hores === 14 && f.registrat.eur === 250 && f.registrat.objectes === 30,
  'el registrat inclou el que no està signat, que és el que es mobilitza');
ok(f.mobilitzat.total === 250 + 30 + 14 * f.fmv, 'mobilitzat = diner + objectes + hores valorades a l\'FMV de l\'àmbit');
ok(f.mobilitzat.min < f.mobilitzat.total && f.mobilitzat.total < f.mobilitzat.max, 'sempre s\'expressa com a rang');
ok(f.mobilitzat.parts.every(p => p.source), 'cada partida diu d\'on surt el número');
ok(f.mobilitzat.parts.some(p => p.source === 'ledger real') && f.mobilitzat.parts.some(p => /oracle/.test(p.source)),
  'i distingeix el ledger real de l\'oracle');
ok(f.verificat.eur <= f.mobilitzat.total, 'el verificat mai supera el mobilitzat');

console.log('\n4 · Res es compta dues vegades');
const dup = await page.evaluate(async (ids) => {
  const S = window.__SOS;
  // Una MATRIU amb una venture al mateix territori: el seu ledger no pot
  // duplicar el que ja compta el node.
  const mat = S.newNode('MATRIU', 'projecte', ids.muniId); mat.dynamicType = 'matriu';
  S.state.nodes.push(mat);
  const v = S.newVenture(mat, { id: 'act', name: 'Prova', roles: [] });
  v.ledger = [{ id: 'vv1', type: 'moneda', value: 100, sig: 'x', who: 'Anna', ts: new Date().toISOString() }];
  S.venturesOf(mat).push(v);
  await S.persist(mat);
  const a = S.networkFund(ids.paisId);
  const b = S.networkFund(ids.paisId);
  const muniFund = S.networkFund(ids.muniId);
  const btFund = S.networkFund(ids.btId);
  return { a: a.registrat, b: b.registrat, muni: muniFund.registrat, bt: btFund.registrat, paisNodes: a.nodes };
}, seed);
ok(dup.a.eur === 350, 'els 100 € de la venture s\'hi sumen un cop');
ok(JSON.stringify(dup.a) === JSON.stringify(dup.b), 'cridar-ho dues vegades dona el mateix: no hi ha estat acumulat');
ok(dup.muni.eur === 350 && dup.muni.hores === 14, 'l\'àmbit municipal veu tot el que hi penja');
ok(dup.bt.hores === 14 && dup.bt.eur === 0, 'i l\'àmbit del banc de temps només veu el seu');

console.log('\n5 · La comparació amb el pla no s\'inventa xifres');
const plan = await page.evaluate(() => {
  const S = window.__SOS;
  return {
    k: [S.parseKpiNum('50k'), S.parseKpiNum('3M'), S.parseKpiNum('0'), S.parseKpiNum('vint mil'), S.parseKpiNum(null)],
    p2026: S.fundPlan(2026), p2027: S.fundPlan(2027), p1999: S.fundPlan(1999), p2999: S.fundPlan(2999)
  };
});
ok(plan.k[0] === 50000 && plan.k[1] === 3000000 && plan.k[2] === 0, '«50k» i «3M» es llegeixen com a números');
ok(plan.k[3] === null && plan.k[4] === null, 'el que no és un número retorna null, no NaN ni zero');
ok(plan.p2026 && plan.p2026.exact && plan.p2026.target === 50000, 'un any declarat retorna la seva fita, marcada com a exacta');
ok(plan.p1999 && !plan.p1999.exact && plan.p1999.year === '2026', 'un any anterior al pla agafa la fita següent i ho diu');
ok(plan.p2999 && !plan.p2999.exact, 'i un any posterior a l\'última fita tampoc es marca com a exacte');

console.log('\n6 · La pantalla existeix, s\'hi arriba per URL i diu la veritat');
await page.evaluate(() => { location.hash = '#/fons'; window.__SOS.applyRoute(); });
await page.waitForFunction(() => /fons cooperatiu/i.test(document.querySelector('#workspace') ? document.querySelector('#workspace').innerText : ''));
const view = await page.evaluate(() => {
  const t = document.querySelector('#workspace').innerText;
  return {
    hash: location.hash, homeView: window.__SOS.state.homeView,
    ver: /Verificat/i.test(t), est: /Mobilitzat/i.test(t),
    saysOracle: /oracle/i.test(t), saysRange: /entre/i.test(t),
    saysPlan: /pla fundador/i.test(t),
    byDyn: /Per din[àa]mica/i.test(t),
    scope: !!document.querySelector('#workspace select')
  };
});
ok(view.hash === '#/fons' && view.homeView === 'fons', 'la ruta #/fons és enllaçable i deixa l\'estat coherent');
ok(view.ver && view.est, 'la pantalla separa verificat de mobilitzat');
ok(view.saysOracle && view.saysRange, 'l\'estimació surt marcada com a oracle i amb rang');
ok(view.saysPlan, 'compara amb el pla fundador');
ok(view.byDyn, 'i desglossa d\'on surt');
ok(view.scope, 'es pot canviar d\'àmbit sense sortir de la pantalla');

console.log('\n7 · Un objecte val euros, no hores (defecte de V45)');
const mix = await page.evaluate((id) => {
  const S = window.__SOS;
  const m = S.measure([...S.scopeIds([id])]);
  return { hores: m.hores, moneda: m.moneda, objectes: m.objectes };
}, seed.paisId);
ok(mix.hores === 14, 'les hores són només hores: els 30 € de l\'objecte no hi cauen');
ok(mix.objectes === 30, 'els objectes tenen el seu propi calaix en euros');
ok(mix.moneda === 350, 'i el diner segueix sent el diner');

console.log('\n8 · La cabina del país diu on NO hi ha res');
const cov = await page.evaluate(async (ids) => {
  const S = window.__SOS;
  const pais = S.byId(ids.paisId);
  // Dues regions més sense res a dins: la cobertura ha de baixar.
  const g = S.newNode('Girona', 'provincia', pais.id);
  const l = S.newNode('Lleida', 'provincia', pais.id);
  const bcn = S.newNode('Barcelona', 'provincia', pais.id);
  S.state.nodes.push(g, l, bcn);
  // El municipi amb les dinàmiques passa a penjar de Barcelona.
  S.byId(ids.muniId).parentId = bcn.id;
  const c = S.countryCoverage(ids.paisId);
  return {
    total: c.total, vives: c.vives, pct: c.pct,
    buides: c.buides.map(r => r.node.name).sort(),
    lider: c.capdavanteres.length ? c.capdavanteres[0].node.name : null
  };
}, seed);
ok(cov.total === 3 && cov.vives === 1, 'una de tres províncies té alguna cosa viva');
ok(cov.pct === 33, 'i la cobertura ho diu en percentatge');
ok(cov.buides.join(',') === 'Girona,Lleida', 'les buides es llisten pel nom, per poder-hi trucar');
ok(cov.lider === 'Barcelona', 'i la que més es mou surt destacada');

const cabin = await page.evaluate((id) => {
  const S = window.__SOS;
  S.state.homeView = 'tauler'; S.selectNode(id);
  const t = document.querySelector('#workspace').innerText;
  return {
    fund: /fons mobilitzat/i.test(t),
    cover: /vives/i.test(t),
    empty: /on no hi ha res encara/i.test(t),
    model: /model territorial/i.test(t),
    noRoles: !/roadmap segons el teu rol/i.test(t)
  };
}, seed.paisId);
ok(cabin.fund && cabin.cover, 'el resum del país encapçala amb fons i cobertura');
ok(cabin.empty, 'i ensenya les regions buides');
ok(cabin.model, 'diu quin model territorial fa servir');
ok(cabin.noRoles, 'les sis targetes de rol ja no ocupen la portada d\'un país amb activitat');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
