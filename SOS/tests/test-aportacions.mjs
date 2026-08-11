/* V83 · Els apunts que ningú comptava.
   Una MATRIU amb quatre aportacions al registre i la pantalla d'equity dient
   «Encara no hi ha aportacions». Les dues frases eren certes: hi ha dos
   formularis que escriuen al ledger i només un posava `memberId`, que és el que
   fa que un apunt compti a la tarta.

   Aquí es prova el forat, els tres llocs on s'ha tapat, i sobretot el que no es
   pot fer per tapar-lo: **reescriure apunts que ja estan signats**. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.unattributedEntries);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('MATRIU del Penedès', 'projecte', null);
  n.dynamicType = 'matriu';
  S.seedFromDynamic(n, S.dynById('matriu'));
  S.state.nodes.push(n); await S.persist(n);
  await S.setActivePersona('Marta Vidal');
  return { id: n.id };
});

console.log('\n1 · El forat: quatre apunts al registre i cap soci a qui van');
const forat = await page.evaluate(async (id) => {
  const S = window.__SOS, n = S.byId(id);
  /* Tal com els escrivia el formulari del tauler: nom escrit a mà, sense
     `memberId`. Sense cap soci al node, encara. */
  for (let i = 0; i < 4; i++)
    await S.pushLedger(n.ledger, { id: 'x' + i, who: 'Marta Vidal', what: 'Feina ' + i,
      type: 'temps', value: 3, ts: new Date().toISOString() });
  await S.persist(n);
  const eq = S.computeEquity(n);
  return { apunts: n.ledger.length, sliceTotal: eq.reduce((a, e) => a + e.slices, 0),
    orfes: S.unattributedEntries(n).length };
}, seed.id);
ok(forat.apunts === 4 && forat.sliceTotal === 0,
  'quatre apunts registrats i zero slices: aquest és el cas del report');
ok(forat.orfes === 4, 'i els quatre consten com a no atribuïts');

console.log('\n2 · La pantalla deixa de dir que no hi ha res');
const pantalla = await page.evaluate((id) => {
  const S = window.__SOS;
  S.selectNode(id); S.state.tab = 'equity'; S.render();
  const txt = document.querySelector('#workspace').textContent.replace(/\s+/g, ' ');
  return { txt, mentia: /Encara no hi ha aportacions/.test(txt) };
}, seed.id);
ok(!pantalla.mentia, 'ja no diu «encara no hi ha aportacions» amb quatre al registre');
ok(/4 apunts al registre, i cap compta aquí/.test(pantalla.txt),
  'diu quants n\'hi ha: «' + (pantalla.txt.match(/Hi ha [^.]*aquí/) || [''])[0] + '»');
ok(/no té socis/.test(pantalla.txt),
  'i el motiu real, que aquí és que el node no té socis');

console.log('\n3 · Amb el soci donat d\'alta, els apunts compten');
const ambSoci = await page.evaluate(async (id) => {
  const S = window.__SOS, n = S.byId(id);
  S.membersOf(n).push(S.newMember({ name: 'Marta Vidal' }));
  await S.persist(n);
  const eq = S.computeEquity(n);
  S.state.tab = 'equity'; S.render();
  const txt = document.querySelector('#workspace').textContent.replace(/\s+/g, ' ');
  return { total: eq.reduce((a, e) => a + e.slices, 0), pelNom: eq.reduce((a, e) => a + (e.pelNom || 0), 0), txt };
}, seed.id);
ok(ambSoci.total > 0, 'la tarta ja reparteix (' + ambSoci.total + ' slices)');
ok(ambSoci.pelNom === 4, 'els quatre compten per coincidència de nom');
ok(/compten aquí perquè el nom escrit coincideix amb un soci/.test(ambSoci.txt),
  'i es diu que compten pel nom, no perquè s\'hi registressin a nom seu');

console.log('\n══ El que importa: no reescriure el que ja està signat ══');

console.log('\n4 · Els apunts segueixen intactes i el registre verifica');
const intacte = await page.evaluate(async (id) => {
  const S = window.__SOS, n = S.byId(id);
  const v = await S.verifyLedger(n.ledger);
  /* `verifyLedger` no torna un `ok` de dalt de tot: torna la cadena i el
     veredicte de cada apunt per separat. Comprovar-ho tot és el que val. */
  const totes = Object.values(v.entries || {});
  return { cadena: v.chain && v.chain.ok, mode: v.chain && v.chain.mode,
    apuntsOk: totes.filter(x => x.ok).length, apunts: totes.length,
    teMemberId: n.ledger.filter(e => e.memberId).length };
}, seed.id);
ok(intacte.teMemberId === 0,
  'cap apunt s\'ha reescrit per posar-hi el memberId que li faltava');
ok(intacte.cadena && intacte.apuntsOk === intacte.apunts && intacte.apunts > 0,
  'i el registre segueix verificant (' + intacte.apuntsOk + '/' + intacte.apunts +
  ' firmes, cadena per ' + intacte.mode + '): l\'atribució és de lectura, no d\'escriptura');

console.log('\n5 · Dos socis amb el mateix nom: no s\'endevina');
const homonims = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('MATRIU amb homònims', 'projecte', null);
  n.dynamicType = 'matriu'; n.ledger = [];
  S.seedFromDynamic(n, S.dynById('matriu'));
  S.membersOf(n).push(S.newMember({ name: 'Joan Puig' }), S.newMember({ name: 'Joan Puig' }));
  S.state.nodes.push(n); await S.persist(n);
  await S.pushLedger(n.ledger, { id: 'h1', who: 'Joan Puig', what: 'Taller',
    type: 'temps', value: 5, ts: new Date().toISOString() });
  await S.persist(n);
  const eq = S.computeEquity(n);
  const orfes = S.unattributedEntries(n);
  return { total: eq.reduce((a, e) => a + e.slices, 0), suggerit: orfes[0].suggerit, id: n.id };
});
/* La veda 59 en forma d'asserció: unir persones pel nom corromp dades en
   silenci. Aquí, davant del dubte, no es reparteix res. */
ok(homonims.total === 0 && !homonims.suggerit,
  'amb dos socis del mateix nom no s\'atribueix a cap dels dos');
const diu = await page.evaluate((id) => {
  const S = window.__SOS;
  S.selectNode(id); S.state.tab = 'equity'; S.render();
  return document.querySelector('#workspace').textContent.replace(/\s+/g, ' ');
}, homonims.id);
ok(/apunts? al registre, i cap compta aquí/.test(diu), 'i la pantalla ho diu en comptes de callar');

console.log('\n6 · L\'origen: el formulari ja no deixa escriure un nom solt');
const form = await page.evaluate((id) => {
  const S = window.__SOS, n = S.byId(id);
  S.openLedgerEntryModal(n, {});
  const m = document.querySelector('.modal');
  const select = m.querySelector('#leMem');
  const opcions = select ? [...select.options].map(o => o.textContent) : [];
  const textVisible = m.querySelector('#leWho') && m.querySelector('#leWho').style.display !== 'none';
  S.closeModal();
  return { teSelect: !!select, opcions, textVisible };
}, seed.id);
ok(form.teSelect && form.opcions.indexOf('Marta Vidal') >= 0,
  'hi ha un selector amb els socis: ' + form.opcions.join(' · '));
ok(!form.textVisible, 'i la caixa de text lliure surt amagada, no per davant');
ok(form.opcions.some(o => /encara no és soci/.test(o)),
  'però s\'hi pot arribar: hi ha aportacions de gent que no és sòcia');

console.log('\n7 · I un apunt registrat ara ja porta el soci');
const nou = await page.evaluate(async (id) => {
  const S = window.__SOS, n = S.byId(id);
  S.openLedgerEntryModal(n, {});
  const m = document.querySelector('.modal');
  m.querySelector('#leWhat').value = 'Sessió de disseny';
  m.querySelector('#leVal').value = '2';
  m.querySelector('#leSave').click();
  await new Promise(r => setTimeout(r, 350));
  const e = S.byId(id).ledger.find(x => x.what === 'Sessió de disseny');
  return { teId: !!(e && e.memberId), who: e ? e.who : '', pelNom: S.computeEquity(S.byId(id))[0].pelNom };
}, seed.id);
ok(nou.teId, 'l\'apunt nou porta memberId i comptarà sempre, no per coincidència');
ok(nou.who === 'Marta Vidal', 'i el nom que es desa és el del soci triat: ' + nou.who);

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
