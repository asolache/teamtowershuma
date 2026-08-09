/* V67 · Les tres coses que converteixen la beta en informació.
   E2 · la fusió deixa rastre — i sobretot, no menteix sobre el que ha substituït
   E7 · un camí per dir «això s'ha trencat» — que no s'endugui dades de ningú
   E8 · la còpia no depèn d'una persona — i designar no compta com custodiar */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.custodyStatus);

console.log('\n══ E2 · La fusió deixa rastre ══');

console.log('\n1 · El que s\'uneix es compta com a entrat, no com a substituït');
const r1 = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Banc', 'projecte', null); n.dynamicType = 'banc_temps';
  n.ledger = []; S.state.nodes.push(n); await S.persist(n);
  await S.pushLedger(n.ledger, { id: 'meu', ts: '2026-03-01T00:00:00Z', type: 'temps', value: 3 });
  await S.persist(n);

  const inc = JSON.parse(JSON.stringify(n));
  inc.updatedAt = '2099-01-01T00:00:00Z';
  inc.ledger = [{ id: 'seu', ts: '2026-03-02T00:00:00Z', type: 'temps', value: 5 }];
  const rep = await S.mergeIncoming({ nodes: [inc] });
  return { rep, n: S.byId(n.id).ledger.length, ids: S.byId(n.id).ledger.map(e => e.id).sort() };
});
ok(r1.rep.apunts.ledger === 1, 'l\'apunt que entra es compta a ledger: +' + r1.rep.apunts.ledger);
ok(r1.n === 2 && JSON.stringify(r1.ids) === '["meu","seu"]', 'i hi són els dos, el meu i el seu');
ok(r1.rep.sobreescrits.length === 0, 'i no es diu que s\'hagi substituït res, perquè no s\'ha substituït');

console.log('\n2 · El que SÍ s\'ha substituït es diu, amb nom i camps');
const r2 = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('El meu node', 'projecte', null);
  n.vna = { roles: ['A', 'B'], exchanges: [] }; n.ledger = [];
  S.state.nodes.push(n); await S.persist(n);

  const inc = JSON.parse(JSON.stringify(n));
  inc.updatedAt = '2099-01-01T00:00:00Z';
  inc.vna = { roles: ['X'], exchanges: [] };
  inc.name = 'El seu node';
  const rep = await S.mergeIncoming({ nodes: [inc] });
  return { rep, txt: S.mergeReportText(rep), html: S.mergeReportHTML(rep) };
});
ok(r2.rep.sobreescrits.length === 1, 'es reporta el node substituït');
ok(r2.rep.sobreescrits[0].camps.includes('vna') && r2.rep.sobreescrits[0].camps.includes('name'),
  'i quins camps: ' + r2.rep.sobreescrits[0].camps.join(', '));
ok(r2.rep.sobreescrits[0].name === 'El meu node',
  'amb el nom que TU li tenies, no el que li acaben de posar');
ok(/sobreescrit/.test(r2.txt), 'el resum ho diu: ' + r2.txt);
ok(/uneixen, no se&#39;n perd cap|uneixen, no se'n perd cap/.test(r2.html) || !/\+/.test(r2.html),
  'i l\'informe distingeix el que s\'uneix del que se substitueix');

console.log('\n3 · Sense res a dir, no s\'inventa cap número');
const r3 = await page.evaluate(async () => {
  const S = window.__SOS;
  const rep = await S.mergeIncoming({ nodes: [] });
  return { txt: S.mergeReportText(rep), n: rep.sobreescrits.length };
});
ok(/al dia/.test(r3.txt), '«' + r3.txt + '»');

console.log('\n══ E7 · Dir que s\'ha trencat ══');

console.log('\n4 · L\'informe porta context i cap dada de ningú');
const r4 = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Banc del Pere', 'projecte', null); n.dynamicType = 'banc_temps';
  S.state.nodes.push(n); await S.persist(n);
  S.membersOf(n).push(S.newMember({ name: 'Montserrat Puig', phone: '600111222' }));
  await S.persist(n);
  S.state.activeId = n.id;
  S.noteError('error', 'no s\'ha pogut desar');
  const inc = S.buildIncident('he clicat a desar i no ha passat res');
  const md = S.incidentMarkdown(inc);
  return {
    md, teErrors: inc.errors.length > 0,
    teVersio: !!inc.versio, teSocis: inc.node && inc.node.socis === 1,
    fuita: /Montserrat|600111222|Banc del Pere/.test(md),
    leak: S.verifyNoLeak(inc)
  };
});
ok(r4.teVersio && r4.teSocis, 'porta versió i comptadors del node (1 soci)');
ok(r4.teErrors && /no s'ha pogut desar/.test(r4.md), 'i els errors que ja havien passat, recollits sols');
ok(!r4.fuita, 'i cap nom de persona, telèfon ni nom de node');
ok(r4.leak.ok, 'el sedàs de fuites hi dona el vistiplau');

console.log('\n5 · Si la persona hi escriu un nom, s\'avisa abans d\'enviar');
const r5 = await page.evaluate(() => {
  const S = window.__SOS;
  const inc = S.buildIncident('la Montserrat Puig no pot entrar');
  return S.verifyNoLeak(inc);
});
ok(!r5.ok && r5.leaks.length > 0, 'es detecta: ' + (r5.leaks[0] || ''));

console.log('\n6 · A la pantalla: es veu tot el que s\'enviarà');
const r6 = await page.evaluate(async () => {
  const S = window.__SOS;
  S.openIncidentReport();
  await new Promise(r => setTimeout(r, 60));
  const pre = document.querySelector('#incPre');
  const has = !!document.querySelector('#incCopy') && !!document.querySelector('#incGh');
  const txt = pre ? pre.textContent : '';
  S.closeModal();
  return { has, teMd: /Errors recollits/.test(txt), llarg: txt.length };
});
ok(r6.has, 'hi ha copiar i obrir incidència');
ok(r6.teMd && r6.llarg > 80, 'i el text complet és a la vista abans d\'enviar-lo');

console.log('\n══ E8 · La còpia no depèn d\'una persona ══');

console.log('\n7 · Designar NO és custodiar');
const r7 = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Node amb custòdia', 'projecte', null);
  n.ledger = []; S.state.nodes.push(n); await S.persist(n);
  const sol = S.custodyStatus(n);
  const a = S.newMember({ name: 'A' }), c = S.newMember({ name: 'B' });
  a.did = 'did:sos:aaa'; c.did = 'did:sos:bbb';
  S.membersOf(n).push(a, c); await S.persist(n);
  await S.setCustodian(n, a.id, true);
  await S.setCustodian(n, c.id, true);
  const des = S.custodyStatus(n);
  await S.markCustodyDelivered(n, [a.id]);
  const una = S.custodyStatus(n);
  await S.markCustodyDelivered(n, [c.id]);
  const dues = S.custodyStatus(n);
  return { sol, des, una, dues, id: n.id };
});
ok(/es perd el node/.test(r7.sol.msg), 'sol: «' + r7.sol.msg + '»');
ok(r7.des.designats === 2 && r7.des.ambCopia === 0 && !r7.des.ok,
  'dos designats i cap còpia: NO compta com a resolt');
ok(/Designar no és custodiar/.test(r7.des.msg), 'i ho diu així: «' + r7.des.msg + '»');
ok(/2 persones designades/.test(r7.des.msg), 'i en català correcte, no «personaes»');
ok(r7.una.ambCopia === 1 && !r7.una.ok, 'amb una sola còpia encara no n\'hi ha prou');
ok(r7.dues.ambCopia === 2 && r7.dues.ok, 'amb dues, sí: «' + r7.dues.msg + '»');

console.log('\n8 · Sense identitat no es pot custodiar res');
const r8 = await page.evaluate(async (id) => {
  const S = window.__SOS;
  const n = S.byId(id);
  const m = S.newMember({ name: 'Sense did' });
  S.membersOf(n).push(m); await S.persist(n);
  try { await S.setCustodian(n, m.id, true); return { threw: false }; }
  catch (e) { return { threw: true, code: e.code, msg: e.msg }; }
}, r7.id);
ok(r8.threw && r8.code === 'nodid', 'es nega i explica per què: ' + r8.msg);

console.log('\n9 · La còpia va xifrada, i restaurar-la UNEIX');
const r9 = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Node per copiar', 'projecte', null); n.ledger = [];
  S.state.nodes.push(n);
  await S.shareNodeKeyWithMember(n, await S.myExchangeCard(), await S.generateNodeKey());
  await S.pushLedger(n.ledger, { id: 'vell', ts: '2026-01-01T00:00:00Z', type: 'temps', value: 2 });
  await S.persist(n);

  const pack = await S.buildCustodyPack(n);
  const fuita = /Node per copiar|vell/.test(JSON.stringify(pack));

  // Mentrestant el node ha seguit vivint: la còpia no ha de matar el que hi ha.
  await S.pushLedger(n.ledger, { id: 'nou', ts: '2026-06-01T00:00:00Z', type: 'temps', value: 4 });
  await S.persist(n);

  const res = await S.restoreFromCustodyPack(pack);
  const after = S.byId(n.id).ledger.map(e => e.id).sort();
  return { fuita, res, after };
});
ok(!r9.fuita, 'del paquet no en surt res llegible');
ok(r9.res.ok && r9.res.afegits === 0, 'restaurar una còpia que ja tens no afegeix res');
ok(JSON.stringify(r9.after) === '["nou","vell"]',
  'i sobretot NO esborra el que s\'havia apuntat després: ' + JSON.stringify(r9.after));

console.log('\n10 · Una còpia manipulada no es restaura');
const r10 = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.state.nodes.find(x => x.name === 'Node per copiar');
  const pack = await S.buildCustodyPack(n);
  pack.apunts = 999;
  return await S.restoreFromCustodyPack(pack);
});
ok(!r10.ok && /firma/.test(r10.reason), 'es rebutja: ' + r10.reason);

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
