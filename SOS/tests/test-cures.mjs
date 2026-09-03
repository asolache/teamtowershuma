/* Cures · avisar abans que passi, no comptar-ho després
   ─────────────────────────────────────────────────────────────────────────
   Les eines de cures compten hores fetes. El que trenca una xarxa de cura no
   és que les hores no estiguin comptades: és que **la càrrega es concentra i
   no ho veu ningú fins que una persona crema i plega** — i llavors la gent que
   acompanyava es queda sense ningú.

   Per això aquí es declara el compromís i no el fet, i d'això en surt la
   projecció: si aquesta persona plega, qui es queda sol. Aquí es prova que
   aquell número sigui de debò —que canviï quan canvia la xarxa— i les dues
   regles que el context imposa: cap dada de salut i els noms només per a qui
   sosté el node. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.curesResum);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

/* El barri de mostra: la Marta ho porta gairebé tot, que és el cas que
   aquesta pantalla existeix per veure abans que passi. */
const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Cures del barri', 'projecte', null);
  n.dynamicType = 'suport_mutu';
  S.seedFromDynamic(n, S.dynById('suport_mutu'));
  S.state.nodes.push(n); await S.persist(n);
  const M = {};
  ['Marta', 'Jordi', 'Núria', 'Pau', 'Rosa', 'Enric'].forEach(x => {
    const m = S.newMember({ name: x }); S.membersOf(n).push(m); M[x] = m.id;
  });
  [['Marta', 'Rosa', 'companyia', 'setmana', 2], ['Marta', 'Enric', 'visites', 'setmana', 2],
   ['Marta', 'Pau', 'compra', 'setmana', 3], ['Jordi', 'Rosa', 'trucada', 'quinzena', 1],
   ['Núria', 'Enric', 'apats', 'mes', 2]]
    .forEach(([a, c, q, cd, h]) => S.curesOf(n).push(S.newCura({ cuidaId: M[a], cuidatId: M[c], que: q, cada: cd, hores: h })));
  await S.persist(n);
  S.selectNode(n.id);
  return { id: n.id, M };
});

console.log('\n1 · La càrrega, comptada per compromís i no per hora feta');
{
  const r = await page.evaluate(({ id, M }) => {
    const S = window.__SOS, n = S.byId(id);
    return { marta: S.carregaCures(n, M.Marta), jordi: S.carregaCures(n, M.Jordi),
      nuria: S.carregaCures(n, M.Núria), resum: S.curesResum(n),
      llindar: S.CURES_LLINDAR,
      sobre: S.sobrecarregades(n).map(x => x.member.name) };
  }, seed);
  ok(r.marta.hores === 7 && r.marta.persones === 3,
    `la Marta porta ${r.marta.hores} h a la setmana i ${r.marta.persones} persones`);
  ok(r.jordi.hores === 0.5,
    `«cada quinze dies» compta la meitat: 1 h quinzenal són ${r.jordi.hores} h/setmana, no 1`);
  ok(Math.abs(r.nuria.hores - 12 / 52 * 2) < 0.01,
    `i «un cop al mes» compta ${r.nuria.hores} h/setmana, no 2`);
  ok(r.resum.concentracio > 80,
    `una sola persona porta el ${r.resum.concentracio}% de les hores: això no és una xarxa`);
  ok(r.sobre.length === 1 && r.sobre[0] === 'Marta',
    `i passa del llindar declarat (${r.llindar.hores} h o ${r.llindar.persones} persones): ${r.sobre.join(', ')}`);
}

console.log('\n2 · La projecció: qui es queda sense ningú');
{
  const r = await page.evaluate(({ id, M }) => {
    const S = window.__SOS, n = S.byId(id);
    return { marta: S.siPlega(n, M.Marta).orfes.map(o => o.name),
      jordi: S.siPlega(n, M.Jordi).orfes.map(o => o.name),
      fragils: S.fragilsCures(n).map(f => f.member.name),
      cobPau: S.coberturaCures(n, M.Pau).n,
      cobRosa: S.coberturaCures(n, M.Rosa).n,
      pitjor: S.curesResum(n).pitjor };
  }, seed);
  ok(r.marta.length === 1 && r.marta[0] === 'Pau',
    `si plega la Marta, ${r.marta.join(', ')} es queda sense ningú — i no la Rosa ni l'Enric, ` +
    'que tenen algú altre');
  ok(r.jordi.length === 0,
    'si plega el Jordi no es queda ningú sol: la Rosa també té la Marta');
  ok(r.fragils.length === 1 && r.cobPau === 1 && r.cobRosa === 2,
    `la cobertura fràgil és exactament qui té una sola cuidadora: ${r.fragils.join(', ')}`);
  ok(r.pitjor === 1, `i la pitjor baixa deixaria ${r.pitjor} persona sense ningú`);
}

console.log('\n3 · Posar-hi una segona persona canvia el número, que és tot el sentit');
{
  const r = await page.evaluate(async ({ id, M }) => {
    const S = window.__SOS, n = S.byId(id);
    const abans = { fragils: S.fragilsCures(n).length, pitjor: S.curesResum(n).pitjor,
      orfes: S.siPlega(n, M.Marta).orfes.length };
    /* El Jordi es fa càrrec del Pau una setmana sí i una no. */
    S.curesOf(n).push(S.newCura({ cuidaId: M.Jordi, cuidatId: M.Pau, que: 'trucada', cada: 'quinzena', hores: 1 }));
    await S.persist(n);
    const despres = { fragils: S.fragilsCures(n).length, pitjor: S.curesResum(n).pitjor,
      orfes: S.siPlega(n, M.Marta).orfes.length,
      martaIgual: S.carregaCures(n, M.Marta).hores };
    /* I si es tanca aquell acompanyament, torna enrere: el que compta és el
       que està actiu, no el que s'ha declarat mai. */
    const ultim = S.curesOf(n)[S.curesOf(n).length - 1];
    ultim.actiu = false; await S.persist(n);
    const tancat = { fragils: S.fragilsCures(n).length, orfes: S.siPlega(n, M.Marta).orfes.length };
    ultim.actiu = true; await S.persist(n);
    return { abans, despres, tancat };
  }, seed);
  ok(r.abans.orfes === 1 && r.despres.orfes === 0,
    'donar-li una segona cuidadora al Pau fa que ja no es quedi sol si plega la Marta');
  ok(r.despres.fragils === 0 && r.despres.pitjor === 0,
    'i llavors no queda ningú amb cobertura fràgil, ni cap baixa deixa ningú sense ningú');
  ok(r.despres.martaIgual === 7,
    'la càrrega de la Marta no baixa: el que s\'arregla no és que faci menys hores, ' +
    'és que aquelles persones tinguin algú més');
  ok(r.tancat.fragils === 1 && r.tancat.orfes === 1,
    'i tancar l\'acompanyament ho desfà: compta el que està actiu, no el que s\'ha declarat mai');
}

console.log('\n4 · Cap dada de salut, i ningú s\'acompanya a si mateix');
{
  const r = await page.evaluate(({ id, M }) => {
    const S = window.__SOS, n = S.byId(id);
    const c = S.newCura({ cuidaId: M.Marta, cuidatId: M.Pau, que: 'inventat', cada: 'sempre', hores: -5 });
    return { cats: S.CURES_QUE.map(x => x[0]),
      camps: Object.keys(c),
      queDolent: S.curesQueMeta('inventat')[0],
      cadaDolent: S.curesCadaMeta('sempre')[0],
      horesNegatives: c.hores,
      notaMax: S.newCura({ cuidaId: M.Marta, cuidatId: M.Pau, notes: 'x'.repeat(400) }).notes.length };
  }, seed);
  ok(!r.camps.some(k => /salut|diagnost|situacio|estat/i.test(k)),
    `l'acompanyament només desa el que fa falta per organitzar-se: ${r.camps.join(', ')}`);
  ok(r.queDolent === 'altres' && r.cadaDolent === 'puntual',
    'un tipus o una periodicitat que no són a la llista cauen al valor neutre, no peten');
  ok(r.horesNegatives === 0, 'i unes hores negatives es queden a zero');
  ok(r.notaMax === 160, `la nota d'organització es talla a ${r.notaMax} caràcters: no és un diari`);
}

console.log('\n5 · La pantalla: què s\'ensenya i a qui');
{
  const r = await page.evaluate(async ({ id }) => {
    const S = window.__SOS, n = S.byId(id);
    S.selectNode(n.id); S.state.tab = 'cures'; S.renderWorkspace();
    await new Promise(r2 => setTimeout(r2, 250));
    const txt = document.body.textContent.replace(/\s+/g, ' ');
    return { pestanya: [...document.querySelectorAll('.tab')].some(t => /Cures/.test(t.textContent)),
      cards: document.querySelectorAll('.ent-card').length,
      diuOrfes: /es queda sense ningú|es queden sense ningú/.test(txt),
      diuLlindar: new RegExp(S.CURES_LLINDAR.hores + ' h\\/setmana').test(txt),
      diuConcentracio: /concentració/i.test(txt),
      noms: /Marta/.test(txt),
      escriu: !!document.querySelector('input,textarea') };
  }, seed);
  ok(r.pestanya, 'els projectes de suport mutu tenen pestanya de cures');
  ok(r.cards >= 10, `la pantalla pinta el resum, la càrrega, la cobertura i el quadre (${r.cards} targetes)`);
  ok(r.diuOrfes, 'i diu qui es quedaria sense ningú amb la frase que s\'entén');
  ok(r.diuLlindar && r.diuConcentracio, 'amb el llindar i la concentració a la vista');
  ok(r.noms, 'qui sosté el node hi veu els noms: és qui ha de trucar');
  ok(!r.escriu, 'i la pantalla no té cap camp obert on escriure res sobre ningú');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
