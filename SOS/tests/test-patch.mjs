/* V68 · El relé porta proves, no només xat.
   Dos navegadors i un servidor de debò. El que es prova, sobretot, és que el
   relé **no escriu història**: no pot fer aparèixer nodes, no pot colar apunts
   sense firma, i el que hi passa no el pot llegir qui l'allotja. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { startRelayMock } from './relay-mock.mjs';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const until = async (fn, ms = 8000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (await fn()) return true; await new Promise(r => setTimeout(r, 100)); }
  return false;
};

const mock = await startRelayMock();
const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const mkPage = async (persona) => {
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  p.on('pageerror', e => { fail++; console.log('  ✗ pageerror(' + persona + '): ' + e.message); });
  await p.goto(APP);
  await p.waitForFunction(() => window.__SOS && window.__SOS.buildPatch);
  await p.evaluate(async (n) => { await window.__SOS.setActivePersona(n); }, persona);
  return p;
};
const A = await mkPage('Anna Puig');
const B = await mkPage('Bru Soler');

const NODE = 'nd-banc';
/* El mateix node als dos costats i la mateixa clau del node — però cadascú la
   rep **al seu sobre** (V29): la de l'Anna va xifrada per a l'Anna i la del Bru
   per al Bru. Copiar-li a l'un el sobre de l'altre no serveix de res, i és
   exactament la garantia que volem. */
const bCard = await B.evaluate(async () => JSON.stringify(await window.__SOS.myExchangeCard()));
const envs = await A.evaluate(async ({ id, card }) => {
  const S = window.__SOS;
  const nd = S.newNode('Banc de Temps', 'projecte', null);
  nd.id = id; nd.dynamicType = 'banc_temps'; nd.ledger = [];
  S.state.nodes.push(nd);
  const k = await S.generateNodeKey();
  await S.shareNodeKeyWithMember(nd, await S.myExchangeCard(), k);   // per a mi
  await S.shareNodeKeyWithMember(nd, JSON.parse(card), k);           // i per al Bru
  await S.persist(nd);
  return JSON.stringify(nd.envelopes || []);
}, { id: NODE, card: bCard });
await B.evaluate(async ({ id, e }) => {
  const S = window.__SOS;
  const nd = S.newNode('Banc de Temps', 'projecte', null);
  nd.id = id; nd.dynamicType = 'banc_temps'; nd.ledger = [];
  nd.envelopes = JSON.parse(e);
  S.state.nodes.push(nd); await S.persist(nd);
}, { id: NODE, e: envs });
ok(await B.evaluate(async (id) => !!(await window.__SOS.getMyNodeKey(window.__SOS.byId(id))), NODE),
  'el Bru pot obrir la clau del node amb el seu propi sobre');

const connect = async (p) => p.evaluate(async (host) => {
  const S = window.__SOS;
  await S.saveRelay({ url: 'ws://' + host, key: 'anon-de-prova', room: 'penedes-2026', on: true });
  return S.relayConnect();
}, mock.host);

console.log('\n1 · Els dos a la mateixa sala');
await connect(A); await connect(B);
ok(await until(async () =>
  (await A.evaluate(() => window.__SOS.relayState())) === 'obert' &&
  (await B.evaluate(() => window.__SOS.relayState())) === 'obert'), 'les dues connexions obertes');

console.log('\n2 · Un apunt de l\'Anna arriba al Bru sense quedar cara a cara');
await A.evaluate(async (id) => {
  const S = window.__SOS;
  const nd = S.byId(id);
  await S.pushLedger(nd.ledger, { id: 'h1', ts: '2026-04-01T10:00:00Z', type: 'temps', value: 3, what: 'Hort' });
  await S.persist(nd);
  await S.relaySendPatch(nd);          // el que el debounce faria sol al cap de 4 s
}, NODE);
const arribat = await until(async () => (await B.evaluate((id) =>
  (window.__SOS.byId(id).ledger || []).some(e => e.id === 'h1'), NODE)));
ok(arribat, 'el Bru té l\'apunt de l\'Anna, i ningú s\'ha mogut de casa');

console.log('\n3 · Rebre\'l dues vegades no en duplica cap');
await A.evaluate(async (id) => { await window.__SOS.relaySendPatch(window.__SOS.byId(id)); }, NODE);
await new Promise(r => setTimeout(r, 700));
const n2 = await B.evaluate((id) => window.__SOS.byId(id).ledger.length, NODE);
ok(n2 === 1, 'segueix havent-hi un sol apunt: ' + n2);

console.log('\n4 · Els dos apunten alhora i no es perd cap');
await B.evaluate(async (id) => {
  const S = window.__SOS;
  const nd = S.byId(id);
  await S.pushLedger(nd.ledger, { id: 'h2', ts: '2026-04-02T10:00:00Z', type: 'temps', value: 5, what: 'Cangur' });
  await S.persist(nd);
  await S.relaySendPatch(nd);
}, NODE);
const tots = await until(async () => (await A.evaluate((id) =>
  window.__SOS.byId(id).ledger.length, NODE)) === 2);
const idsA = await A.evaluate((id) => window.__SOS.byId(id).ledger.map(e => e.id).sort(), NODE);
ok(tots && JSON.stringify(idsA) === '["h1","h2"]', 'l\'Anna té els dos: ' + JSON.stringify(idsA));

console.log('\n5 · Qui allotja el relé no pot llegir res del que hi passa');
const vist = mock.messages.filter(m => /"event":"patch"/.test(m));
ok(vist.length > 0, 'el servidor ha vist passar ' + vist.length + ' patch(es)');
ok(!vist.some(m => /Hort|Cangur|Banc de Temps/.test(m)),
  'i en cap hi surt què s\'ha apuntat ni com es diu el node');

console.log('\n6 · El relé NO pot fer aparèixer nodes');
const abans = await B.evaluate(() => window.__SOS.state.nodes.length);
await B.evaluate(async () => {
  const S = window.__SOS;
  await S._rlOnPatch({ pack: { type: 'sos-patch', v: 1, nodeId: 'nd-que-no-tinc', ts: new Date().toISOString(), enc: { iv: 'x', ct: 'y' } } });
});
ok(await B.evaluate(() => window.__SOS.state.nodes.length) === abans,
  'un patch d\'un node que no tens es descarta, no el crea');

console.log('\n7 · El relé NO pot colar apunts sense firma');
const colat = await B.evaluate(async (id) => {
  const S = window.__SOS;
  const nd = S.byId(id);
  const key = await S.getMyNodeKey(nd);
  const pack = { type: 'sos-patch', v: 1, nodeId: id, ts: new Date().toISOString(), count: 1, body: null };
  pack.enc = await S.encryptWithKey(key, { receipts: [{ id: 'fals', ts: '2026-05-01T00:00:00Z', type: 'temps', value: 999 }] });
  await S.signRecord(pack);                     // sobre impecable
  await S._rlOnPatch({ pack });
  return nd.ledger.map(e => e.id);
}, NODE);
ok(!colat.includes('fals'), 'l\'apunt sense firma no entra: ' + JSON.stringify(colat));

console.log('\n8 · Un sobre manipulat no s\'obre');
const tocat = await B.evaluate(async (id) => {
  const S = window.__SOS;
  const pack = await S.buildPatch(S.byId(id));
  pack.count = 99;
  const r = await S.openPack(pack, 'sos-patch', S.byId(id));
  return { ok: r.ok, reason: r.reason };
}, NODE);
ok(!tocat.ok && /firma/.test(tocat.reason), 'es rebutja: ' + tocat.reason);

console.log('\n9 · El que ha portat el relé es pot veure');
const c = await B.evaluate(() => window.__SOS.relayContribution());
ok(c.rebuts >= 1 && c.apunts >= 1, 'el relé ha portat ' + c.apunts + ' apunt(s) en ' + c.rebuts + ' patch(es)');

await b.close(); await mock.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
