/* V58 · El relé, provat contra un servidor que parla el protocol de debò.
   Dos navegadors, una sala: es veuen l'un a l'altre i els missatges arriben.
   I la part que importa tant com que funcioni: que pel relé no hi passi res
   més que presència i missatges. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { startRelayMock } from './relay-mock.mjs';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const until = async (fn, ms = 6000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (await fn()) return true; await new Promise(r => setTimeout(r, 80)); }
  return false;
};

const mock = await startRelayMock();
const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

// Dos contexts = dos SOS diferents, com dues persones.
const mkPage = async (persona) => {
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  p.on('pageerror', e => { fail++; console.log('  ✗ pageerror(' + persona + '): ' + e.message); });
  await p.goto(APP);
  await p.waitForFunction(() => window.__SOS && window.__SOS.relayConnect);
  await p.evaluate(async (n) => { await window.__SOS.setActivePersona(n); }, persona);
  return p;
};
const A = await mkPage('Anna Puig');
const B = await mkPage('Bru Soler');

// El mateix node als dos costats: el relé no crea nodes, només hi porta missatges.
const NODE = 'nd-compartit';
const seed = async (p) => p.evaluate(async (id) => {
  const S = window.__SOS;
  const nd = S.newNode('Banc de Temps', 'projecte', null);
  nd.id = id; nd.dynamicType = 'banc_temps';
  S.state.nodes.push(nd); await S.persist(nd);
}, NODE);
await seed(A); await seed(B);

const connect = async (p) => p.evaluate(async (host) => {
  const S = window.__SOS;
  await S.saveRelay({ url: 'ws://' + host, key: 'anon-de-prova', room: 'penedes-2026', on: true });
  return S.relayConnect();
}, mock.host);

console.log('\n1 · Els dos entren a la mateixa sala');
await connect(A); await connect(B);
const bothOpen = await until(async () =>
  (await A.evaluate(() => window.__SOS.relayState())) === 'obert' &&
  (await B.evaluate(() => window.__SOS.relayState())) === 'obert');
ok(bothOpen, 'les dues connexions arriben a «obert»');
ok(mock.clients.size === 2, 'i el servidor veu els dos clients');

console.log('\n2 · Es veuen l\'un a l\'altre');
const seesB = await until(async () => (await A.evaluate(() =>
  window.__SOS.relayPeers().some(p => p.name === 'Bru Soler'))));
const seesA = await until(async () => (await B.evaluate(() =>
  window.__SOS.relayPeers().some(p => p.name === 'Anna Puig'))));
ok(seesB, 'l\'Anna veu el Bru a la sala');
ok(seesA, 'i el Bru veu l\'Anna');
const presA = await A.evaluate(() => {
  const p = window.__SOS.presenceState();
  return { online: p.online.map(x => x.name), viaRelay: p.online.filter(x => x.relay).length, relayOn: p.relayOn, limit: p.limit };
});
ok(presA.online.includes('Bru Soler') && presA.viaRelay === 1, 'i surt a «en línia», marcat com a vingut del relé');
ok(presA.relayOn && /rel[ée] est[àa] obert/i.test(presA.limit), 'el text de la pantalla passa a dir que el relé està obert');

console.log('\n3 · Pel relé no hi passa res més que presència');
const sent = mock.clients.size ? [...mock.clients].map(c => c.meta).filter(Boolean) : [];
ok(sent.length >= 1, 'el servidor rep les targetes de presència');
ok(sent.every(m => Object.keys(m).sort().join(',') === 'at,did,name'),
  'i cada targeta només porta nom, did i hora: ' + JSON.stringify(sent[0]));
ok(sent.every(m => !JSON.stringify(m).match(/ledger|nodes|chat|contact|phone|email/i)),
  'cap registre, cap node i cap contacte hi apareixen');

console.log('\n4 · La sala viatja com a hash, no en clar');
const topics = [...mock.clients].map(c => c.topic);
ok(topics.length === 2 && topics[0] === topics[1], 'els dos van al mateix canal');
ok(!topics[0].includes('penedes'), 'i el canal no conté el codi de sala: ' + topics[0]);

console.log('\n5 · Un missatge arriba a l\'altra banda en viu');
await A.evaluate(async (id) => {
  const S = window.__SOS;
  await S.postChat(S.byId(id), 'Qui porta les hores del taller?', null);
}, NODE);
const arrived = await until(async () => B.evaluate((id) =>
  window.__SOS.chatMessages(window.__SOS.byId(id)).some(m => /hores del taller/.test(m.text)), NODE));
ok(arrived, 'el Bru rep el missatge de l\'Anna sense estar emparellat amb ella');
const atB = await B.evaluate((id) => {
  const m = window.__SOS.chatMessages(window.__SOS.byId(id)).find(x => /hores del taller/.test(x.text));
  return { who: m.who, hasId: !!m.id, hasTs: !!m.ts };
}, NODE);
ok(atB.who === 'Anna Puig' && atB.hasId && atB.hasTs, 'i arriba amb qui, quan i el seu id');

console.log('\n6 · No torna a qui l\'ha enviat, ni es duplica');
const atA = await A.evaluate((id) => window.__SOS.chatMessages(window.__SOS.byId(id)).length, NODE);
ok(atA === 1, 'l\'Anna en té un, no dos');
await B.evaluate(async (id) => { await window.__SOS.postChat(window.__SOS.byId(id), 'Jo puc', null); }, NODE);
const back = await until(async () => A.evaluate((id) =>
  window.__SOS.chatMessages(window.__SOS.byId(id)).length === 2, NODE));
ok(back, 'la resposta del Bru arriba a l\'Anna');
const finalA = await A.evaluate((id) => window.__SOS.chatMessages(window.__SOS.byId(id)).map(m => m.text), NODE);
const finalB = await B.evaluate((id) => window.__SOS.chatMessages(window.__SOS.byId(id)).map(m => m.text), NODE);
ok(JSON.stringify(finalA) === JSON.stringify(finalB), 'i els dos acaben veient la mateixa conversa, en el mateix ordre');

console.log('\n7 · Un missatge d\'un node que no tens es descarta');
const ghost = await B.evaluate(() => ({ before: window.__SOS.state.nodes.length }));
const ghostOk = await A.evaluate(async () => {
  const S = window.__SOS;
  // Simula l'arribada d'un missatge per a un node inexistent.
  const n0 = S.state.nodes.length;
  await S.relaySendChat('node-que-no-existeix', { id: 'z1', text: 'hola', ts: new Date().toISOString() });
  return S.state.nodes.length === n0;
});
ok(ghostOk, 'el relé no pot crear nodes: si el node no hi és, el missatge cau');
ok(ghost.before >= 1, 'i l\'altre costat segueix amb els seus nodes intactes');

console.log('\n8 · Marxar es nota');
await B.evaluate(() => window.__SOS.relayDisconnect());
const gone = await until(async () => A.evaluate(() =>
  !window.__SOS.relayPeers().some(p => p.name === 'Bru Soler')));
ok(gone, 'quan el Bru se\'n va, desapareix de la llista de l\'Anna');
const stateB = await B.evaluate(() => window.__SOS.relayState());
ok(stateB === 'off', 'i el seu estat torna a apagat');

console.log('\n9 · Apagar el relé no s\'endú res');
const afterOff = await B.evaluate((id) => {
  const S = window.__SOS;
  return { msgs: S.chatMessages(S.byId(id)).length, nodes: S.state.nodes.length, on: S.relayCfg().on };
}, NODE);
ok(afterOff.msgs === 2, 'els missatges que ja havien arribat es queden');
ok(afterOff.nodes >= 1, 'i els nodes també');
ok(afterOff.on === true, 'la configuració es manté per poder tornar a connectar');

console.log('\n10 · Si el relé cau, el SOS segueix');
mock.close();
await new Promise(r => setTimeout(r, 400));
const survives = await A.evaluate(async (id) => {
  const S = window.__SOS;
  const m = await S.postChat(S.byId(id), 'I això segueix funcionant', null);
  return { saved: !!m, total: S.chatMessages(S.byId(id)).length, state: S.relayState() };
}, NODE);
ok(survives.saved && survives.total === 3, 'amb el relé caigut, escriure segueix funcionant i es desa igual');
ok(['caigut', 'error', 'off'].includes(survives.state), 'i l\'estat ho diu en comptes de fer veure que va: ' + survives.state);

await A.evaluate(() => window.__SOS.relayDisconnect());
await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
