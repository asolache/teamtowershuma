/* V85 · SOS Coop · el moneder i la caixa.
   És la primera vegada que aquest projecte toca diner de debò, i per això aquí
   gairebé tot són intents de fer aparèixer crèdit sense que ningú hagi pagat:
   confirmar sense rebut, amb un rebut sense firma, amb el rebut d'una altra
   comanda, amb un import diferent. Cap ha de colar.

   I la frontera que no es pot creuar mai: **el client no confirma cobraments**.
   Si algun dia una passarel·la digués que sí des del navegador, voldria dir que
   la clau del comerç és dins d'un fitxer que qualsevol es descarrega. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.newTopUp);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('SOS Coop · Foix', 'projecte', null);
  n.dynamicType = 'matriu';
  S.seedFromDynamic(n, S.dynById('matriu'));
  const m = S.newMember({ name: 'Marta Vidal' });
  S.membersOf(n).push(m);
  S.state.nodes.push(n); await S.persist(n);
  S.selectNode(n.id);
  return { id: n.id, mem: m.id };
});

console.log('\n1 · Sense passarel·la, es diu que no es pot cobrar');
const cap = await page.evaluate((id) => {
  const S = window.__SOS, st = S.tpvStatus(S.byId(id));
  return { prov: st.provider.id, configurat: st.configurat, potCobrar: st.potCobrar, diu: st.diu };
}, seed.id);
ok(cap.prov === 'cap' && !cap.configurat, 'cap passarel·la per defecte');
ok(/ningú pot pagar/.test(cap.diu), 'i es diu tal com és: «' + cap.diu + '»');

console.log('\n2 · Cap passarel·la, ni configurada, confirma des del client');
const cliente = await page.evaluate(() => {
  const S = window.__SOS;
  return Object.values(S.TPV_PROVIDERS).map(p => ({ id: p.id, c: p.confirmaAlClient }));
});
ok(cliente.every(p => p.c === false),
  'cap dels ' + cliente.length + ' proveïdors diu que pot confirmar aquí');
const potCobrarSempreFals = await page.evaluate((id) => {
  const S = window.__SOS, n = S.byId(id);
  /* Configurada del tot: ni així. No és una qüestió de configuració. */
  S.coopCfg(n).tpv = { provider: 'redsys', te: ['codi de comerç', 'terminal', 'clau secreta al servidor', 'URL de notificació'] };
  const st = S.tpvStatus(n);
  return { configurat: st.configurat, potCobrar: st.potCobrar };
}, seed.id);
ok(potCobrarSempreFals.configurat && !potCobrarSempreFals.potCobrar,
  'amb Redsys configurat del tot, «configurat» sí i «pot cobrar» no');

console.log('\n3 · El repartiment es veu abans de pagar, i ha de quadrar');
const split = await page.evaluate((id) => {
  const S = window.__SOS, n = S.byId(id);
  const bo = S.coopSplit(100, n);
  S.coopCfg(n).split = { operacio: 80, node: 15, federacio: 20 };
  const mal = S.coopSplit(100, n);
  S.coopCfg(n).split = { operacio: 80, node: 15, federacio: 5 };
  return { quadra: bo.quadra, parts: bo.parts.map(p => p.import), malQuadra: mal.quadra, avis: mal.avis };
}, seed.id);
ok(split.quadra && split.parts.reduce((a, x) => a + x, 0) === 100,
  'de 100 en surten ' + split.parts.join(' + ') + ' = 100');
ok(!split.malQuadra && /sumen 115/.test(split.avis),
  'i si no sumen 100 es diu, no s\'inventa el que falta: «' + split.avis + '»');

console.log('\n══ El que importa: que no aparegui crèdit sense pagar ══');

console.log('\n4 · Una càrrega neix pendent i NO és saldo');
const ordre = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  const o = await S.newTopUp(n, { memberId: s.mem, amount: 50, concept: 'Càrrega inicial' });
  const w = S.walletBalance(n, s.mem);
  return { estat: o.estat, teSig: !!o.sig, saldo: w.saldo, pendent: w.pendent };
}, seed);
ok(ordre.estat === 'pendent' && ordre.teSig, 'la comanda es firma però neix pendent');
ok(ordre.saldo === 0 && ordre.pendent === 50,
  'el saldo segueix a 0 i els 50 consten a part com a pendent');

console.log('\n5 · Els quatre intents de fer-la confirmar sense pagar');
const intents = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  const o = S.carregesOf(n)[0];
  const out = {};
  out.senseRebut = await S.confirmTopUp(n, o.id, null);
  out.senseFirma = await S.confirmTopUp(n, o.id, { order: o.id, import: 50 });
  /* Un rebut ben firmat però d'una altra comanda. */
  const altra = { order: 'una-altra', import: 50, ts: new Date().toISOString() };
  await S.signRecord(altra);
  out.altraComanda = await S.confirmTopUp(n, o.id, altra);
  /* I un de la comanda bona, ben firmat, però per un import diferent. */
  const menys = { order: o.id, import: 5, ts: new Date().toISOString() };
  await S.signRecord(menys);
  out.altreImport = await S.confirmTopUp(n, o.id, menys);
  out.saldo = S.walletBalance(n, s.mem).saldo;
  out.estat = S.carregesOf(n)[0].estat;
  return out;
}, seed);
ok(!intents.senseRebut.ok && /Sense rebut signat/.test(intents.senseRebut.motiu),
  'sense rebut: «' + intents.senseRebut.motiu + '»');
ok(!intents.senseFirma.ok, 'amb un rebut sense firma tampoc');
ok(!intents.altraComanda.ok && /altra comanda/.test(intents.altraComanda.motiu),
  'un rebut vàlid però d\'una altra comanda: «' + intents.altraComanda.motiu + '»');
ok(!intents.altreImport.ok && /diu 5 i la comanda 50/.test(intents.altreImport.motiu),
  'i un per un import diferent: «' + intents.altreImport.motiu + '»');
ok(intents.saldo === 0 && intents.estat === 'pendent',
  'després dels quatre intents, el saldo segueix a 0');

console.log('\n6 · Amb un rebut que verifica de debò, sí');
const bo = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  const o = S.carregesOf(n)[0];
  const rebut = { order: o.id, import: o.import, ref: 'redsys-000123', ts: new Date().toISOString() };
  await S.signRecord(rebut);
  const r = await S.confirmTopUp(n, o.id, rebut);
  const w = S.walletBalance(n, s.mem);
  return { r, saldo: w.saldo, pendent: w.pendent, estat: S.carregesOf(n)[0].estat };
}, seed);
ok(bo.r.ok && bo.estat === 'confirmada', 'la càrrega es confirma');
ok(bo.saldo === 50 && bo.pendent === 0, 'i ara sí que és saldo: ' + bo.saldo);

console.log('\n7 · Gastar surt del registre de sempre, no d\'un segon llibre');
const gasta = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  await S.pushLedger(n.ledger, { id: 'g1', ts: new Date().toISOString(), type: 'credit',
    value: -20, memberId: s.mem, what: 'Suport a operacions' });
  await S.persist(n);
  const w = S.walletBalance(n, s.mem);
  return { saldo: w.saldo, gastat: w.gastat };
}, seed);
ok(gasta.saldo === 30 && gasta.gastat === 20,
  'gastats 20 de 50, queden ' + gasta.saldo + ': el moneder llegeix el ledger del node');

console.log('\n8 · La pantalla diu què no fa, i què no demana mai');
const ui = await page.evaluate((s) => {
  const S = window.__SOS, n = S.byId(s.id);
  S.openCoopWallet(n, s.mem);
  const m = document.querySelector('.modal');
  const txt = m.textContent.replace(/\s+/g, ' ');
  const camps = [...m.querySelectorAll('input')].map(i => (i.id || '') + (i.type || ''));
  S.closeModal();
  return { txt, camps };
}, seed);
ok(/no confirma mai un cobrament/i.test(ui.txt),
  'diu que el SOS no confirma mai un cobrament');
ok(/no demana mai una targeta/i.test(ui.txt),
  'i que no demana mai una targeta');
ok(ui.camps.length === 0, 'i de fet no hi ha cap camp d\'entrada al moneder');
ok(/Encara no s'ha decidit/.test(ui.txt),
  'i es diu que la unitat encara no està decidida, en comptes de fer com si');

console.log('\n9 · La configuració no deixa desar un repartiment que no quadra');
const cfg = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  S.openCoopConfig(n);
  const m = document.querySelector('.modal');
  m.querySelector('#ccFe').value = '40';
  m.querySelector('#ccFe').dispatchEvent(new Event('input'));
  const blocat = m.querySelector('#ccSave').disabled;
  const avis = m.querySelector('#ccSum').textContent;
  m.querySelector('#ccFe').value = '5';
  m.querySelector('#ccFe').dispatchEvent(new Event('input'));
  const lliure = !m.querySelector('#ccSave').disabled;
  S.closeModal();
  return { blocat, avis, lliure };
}, seed);
ok(cfg.blocat && /135/.test(cfg.avis), 'amb 135 no es pot desar: «' + cfg.avis + '»');
ok(cfg.lliure, 'i amb 100 sí');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
