/* V87 · La caixa de la DAO · el sostre.
   V85 va provar que **no aparegui crèdit sense pagar**. Això prova la porta de
   sortida, que és el problema contrari: que el que s'ha carregat **no se'n vagi
   de mare**. Gairebé tot són intents de gastar més del que toca, i el més
   important de tots és el primer: que un sostre sense posar no vulgui dir
   «il·limitat». */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.daoBudget);
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
  /* Dues entrades ben diferents, i tota la gràcia és que no es barregin:
     100 que carrega una sòcia (és seu) i 100 que la casa aporta al fons (és el
     que la DAO pot gastar). Les dues es cobren igual: rebut signat (V85). */
  const cobra = async (ord) => {
    const rebut = { order: ord.id, import: ord.import, ts: new Date().toISOString() };
    await S.signRecord(rebut);
    await S.confirmTopUp(n, ord.id, rebut);
  };
  await cobra(await S.newTopUp(n, { memberId: m.id, amount: 100, concept: 'Càrrega inicial' }));
  await cobra(await S.newFunding(n, { amount: 100, concept: 'Orígens de descàrrega', de: 'Àlvar' }));
  return { id: n.id, mem: m.id };
});

console.log('\n0 · Una aportació al fons no és crèdit de ningú');
const fons = await page.evaluate((s) => {
  const S = window.__SOS, n = S.byId(s.id), b = S.daoBudget(n), w = S.walletBalance(n, s.mem);
  return { caixa: b.caixa, aportat: b.aportat, deMembres: b.deMembres,
    compromes: b.compromes, lliure: b.lliure, saldoSocia: w.saldo };
}, seed);
ok(fons.caixa === 200 && fons.aportat === 100 && fons.deMembres === 100,
  'a la caixa hi ha ' + fons.caixa + ': ' + fons.aportat + ' aportats i ' + fons.deMembres + ' de sòcies');
ok(fons.compromes === 100 && fons.lliure === 100,
  'però només ' + fons.lliure + ' són lliures: els altres ' + fons.compromes + ' es deuen');
ok(fons.saldoSocia === 100, 'i el saldo de la sòcia no el toca l\'aportació: ' + fons.saldoSocia);

console.log('\n══ El que importa: que un sostre sense posar no sigui «sense límit» ══');

console.log('\n1 · Amb 100 a la caixa i cap sostre, no surt res');
const zero = await page.evaluate((s) => {
  const S = window.__SOS, n = S.byId(s.id);
  /* Operador posat a mà per aïllar la porta del sostre; la de l'operador es
     prova a banda al pas 3. */
  S.daoCfg(n).operador = 'cooperativa';
  const bu = S.daoBudget(n);
  const r = S.canSpend(n, 1);
  return { caixa: bu.lliure, sostre: bu.sostreMes, ok: r.ok, motiu: r.motiu, limit: r.limit };
}, seed);
ok(zero.caixa === 100 && zero.sostre === 0, 'hi ha ' + zero.caixa + ' de lliures i el sostre és ' + zero.sostre);
ok(!zero.ok && /Zero vol dir zero/.test(zero.motiu),
  'i no surt ni 1: «' + zero.motiu + '»');

console.log('\n2 · I gastar de debò tampoc escriu res');
const capApunt = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  const abans = (n.ledger || []).length;
  const r = await S.daoSpend(n, { amount: 10, what: 'Origen de descàrrega' });
  return { r, abans, despres: (S.byId(s.id).ledger || []).length, lliure: S.daoBudget(S.byId(s.id)).lliure };
}, seed);
ok(!capApunt.r.ok && capApunt.despres === capApunt.abans,
  'el registre no creix: el límit es comprova ABANS, no s\'apunta i després es lamenta');
ok(capApunt.lliure === 100, 'i el que és lliure segueix a 100');

console.log('\n3 · Sense operador tampoc, encara que hi hagi sostre');
const sensOp = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  /* Sostre generós i cap operador: l'ordre de les portes importa. */
  S.daoCfg(n).sostreMes = 50; S.daoCfg(n).operador = 'cap';
  const r = S.canSpend(n, 10);
  return { ok: r.ok, motiu: r.motiu, limit: r.limit };
}, seed);
ok(!sensOp.ok && sensOp.limit === 'operador',
  'primer cal saber qui l\'opera: «' + sensOp.motiu + '»');

console.log('\n4 · Designar operador és una decisió firmada, no editar un camp');
const dec = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  S.daoCfg(n).sostreMes = 0;
  const r = await S.daoDecide(n, { operador: 'cooperativa', sostreMes: 50, sostreDia: 20 },
    { qui: 'Marta Vidal' });
  const d = S.daoDecisionsOf(S.byId(s.id))[0];
  const v = await S.verifyRecord(d);
  return { ok: r.ok, teSig: !!(d && d.sig), verifica: v.ok, qui: d && d.qui,
    abans: d && d.abans.sostreMes, despres: d && d.despres.sostreMes,
    operador: S.daoBudget(S.byId(s.id)).operador.id };
}, seed);
ok(dec.ok && dec.teSig && dec.verifica, 'la decisió es firma i la firma verifica');
ok(dec.abans === 0 && dec.despres === 50 && dec.qui === 'Marta Vidal',
  'i guarda què hi havia abans i qui la pren: ' + dec.abans + '→' + dec.despres + ' per ' + dec.qui);
ok(dec.operador === 'cooperativa', 'l\'opera la cooperativa');

console.log('\n5 · Ara sí que surt, i cada despesa baixa el que queda');
const gasta = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  const r1 = await S.daoSpend(n, { amount: 15, what: 'Mirall d\'orígens · mes 1' });
  const bu = S.daoBudget(S.byId(s.id));
  return { ok: r1.ok, lliure: bu.lliure, gastatMes: bu.gastatMes, restaMes: bu.restaMes, restaDia: bu.restaDia };
}, seed);
ok(gasta.ok && gasta.lliure === 85, 'de 100 lliures a ' + gasta.lliure);
ok(gasta.restaMes === 35 && gasta.restaDia === 5,
  'queden ' + gasta.restaMes + ' del mes i ' + gasta.restaDia + ' del dia');

console.log('\n6 · El sostre diari mossega abans que el mensual');
const dia = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  const r = await S.daoSpend(n, { amount: 10, what: 'Una altra avui' });
  return { ok: r.ok, limit: r.limit, motiu: r.motiu, gastat: S.daoBudget(S.byId(s.id)).gastat };
}, seed);
ok(!dia.ok && dia.limit === 'dia' && dia.gastat === 15,
  'el diari atura els 10 encara que del mes en quedin 35: «' + dia.motiu + '»');

console.log('\n7 · El mensual no es pot esquivar gastant a poc a poc');
const degoteig = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  await S.daoDecide(n, { sostreDia: 0 }, { qui: 'Marta Vidal' });   // sense límit diari
  let fets = 0, ultim = null;
  for (let i = 0; i < 10; i++) {
    const r = await S.daoSpend(S.byId(s.id), { amount: 5, what: 'degoteig ' + i });
    if (r.ok) fets++; else { ultim = r; break; }
  }
  const bu = S.daoBudget(S.byId(s.id));
  return { fets, motiu: ultim && ultim.motiu, gastatMes: bu.gastatMes, sostre: bu.sostreMes };
}, seed);
ok(degoteig.gastatMes === 50 && degoteig.gastatMes === degoteig.sostre,
  'set despeses de 5 sobre 15 ja fets = ' + degoteig.gastatMes + ', i para clavat al sostre');
ok(degoteig.fets === 7 && /queden 0/.test(degoteig.motiu || ''),
  'la vuitena no passa: «' + degoteig.motiu + '»');

console.log('\n8 · L\'aturada mana per damunt de tot');
const stop = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  await S.daoDecide(n, { sostreMes: 500 }, { qui: 'Marta Vidal' });
  const potAbans = S.canSpend(S.byId(s.id), 10).ok;
  await S.daoDecide(S.byId(s.id), { aturada: true }, { qui: 'Marta Vidal', motiu: 'Revisió de comptes' });
  const r = await S.daoSpend(S.byId(s.id), { amount: 10, what: 'tot i l\'aturada' });
  return { potAbans, ok: r.ok, motiu: r.motiu, gastat: S.daoBudget(S.byId(s.id)).gastat };
}, seed);
ok(stop.potAbans, 'amb el sostre pujat a 500 sí que podria');
ok(!stop.ok && /Revisió de comptes/.test(stop.motiu) && stop.gastat === 50,
  'i amb l\'aturada no, amb el motiu escrit: «' + stop.motiu + '»');

console.log('\n9 · El crèdit que es deu a les sòcies no és gastable, per molt sostre que hi hagi');
const buida = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  await S.daoDecide(n, { aturada: false }, { qui: 'Marta Vidal' });
  const bu = S.daoBudget(S.byId(s.id));
  const r = S.canSpend(S.byId(s.id), bu.lliure + 1);
  /* Encara hi ha 150 a la caixa: 100 que deu a la Marta i 50 de lliures. */
  const capDinsDeCaixa = bu.lliure + 1 <= bu.caixa;
  return { caixa: bu.caixa, compromes: bu.compromes, lliure: bu.lliure, sostre: bu.sostreMes,
    capDinsDeCaixa, ok: r.ok, limit: r.limit, motiu: r.motiu };
}, seed);
ok(buida.capDinsDeCaixa && !buida.ok && buida.limit === 'lliure',
  'amb sostre ' + buida.sostre + ' i ' + buida.caixa + ' a la caixa, demanar ' + (buida.lliure + 1) + ' hi cabria — i no passa');
ok(/no és nostre/.test(buida.motiu),
  'perquè ' + buida.compromes + ' es deuen: «' + buida.motiu.slice(0, 120) + '…»');

console.log('\n10 · La despesa de la DAO no és la d\'una persona');
const separat = await page.evaluate((s) => {
  const S = window.__SOS, n = S.byId(s.id), w = S.walletBalance(n, s.mem);
  const daoEntries = (n.ledger || []).filter(e => e.dao);
  return { gastatPersona: w.gastat, saldoPersona: w.saldo, daoEntries: daoEntries.length,
    ambMembre: daoEntries.filter(e => e.memberId).length };
}, seed);
ok(separat.ambMembre === 0, 'cap dels ' + separat.daoEntries + ' apunts de la DAO va a nom de ningú');
ok(separat.gastatPersona === 0 && separat.saldoPersona === 100,
  'i el moneder de la Marta no s\'ha mogut: saldo ' + separat.saldoPersona);

console.log('\n11 · Una càrrega cobrada no es perd en una fusió');
const fusio = await page.evaluate(async (s) => {
  const S = window.__SOS;
  return { append: S.APPEND_ONLY.includes('carregues') && S.APPEND_ONLY.includes('daoDecisions'),
    teUpdated: !!S.carregesOf(S.byId(s.id)).find(o => o.estat === 'confirmada').updatedAt };
}, seed);
ok(fusio.append, 'càrregues i decisions es fusionen per unió, no per «l\'últim mana»');
ok(fusio.teUpdated, 'i la confirmada porta `updatedAt`, que és el que la fa guanyar');

console.log('\n12 · La pantalla diu què passaria abans de desar-ho');
const ui = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  S.openDaoCaixa(n);
  await new Promise(r => setTimeout(r, 150));
  const m = document.querySelector('.modal');
  const ambSostre = m.querySelector('#dcProva').textContent;
  m.querySelector('#dcMes').value = '0';
  m.querySelector('#dcMes').dispatchEvent(new Event('input'));
  const sense = m.querySelector('#dcProva').textContent;
  const txt = m.textContent.replace(/\s+/g, ' ');
  S.closeModal();
  return { ambSostre, sense, txt };
}, seed);
ok(/passaria/.test(ui.ambSostre) && /no passaria/.test(ui.sense),
  'canviar el número diu si deixaria passar: «' + ui.sense.slice(0, 80) + '…»');
ok(/0 vol dir que no surt res/.test(ui.txt), 'i la pantalla diu què vol dir el zero');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
