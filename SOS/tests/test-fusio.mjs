/* V64 · Sincronitzar no pot destruir res.
   Aquest fitxer era `probes/sonda-fusio.mjs` i demostrava el forat: dues
   persones apuntant sense estar connectades, i en sincronitzar es perdien les
   hores de la que tenia l'`updatedAt` més antic. Ara les assercions van
   girades. La resta del fitxer prova el que fa que la unió sigui possible: que
   cada autor encadena el seu. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.mergeAppendOnly);

console.log('\n1 · Dues persones apunten hores sense estar connectades');
const led = await page.evaluate(async () => {
  const S = window.__SOS;
  const bt = S.newNode('Banc de Temps', 'projecte', null); bt.dynamicType = 'banc_temps';
  bt.ledger = [{ id: 'base', ts: '2026-01-01T00:00:00Z', type: 'temps', value: 1, who: 'Base', sig: 'x' }];
  S.state.nodes.push(bt); await S.persist(bt);
  const anna = JSON.parse(JSON.stringify(bt));   // la còpia que se'n va endur

  bt.ledger.unshift({ id: 'bru', ts: '2026-02-01T09:00:00Z', type: 'temps', value: 3, who: 'Bru', sig: 'x' });
  await S.persist(bt);

  anna.ledger.unshift({ id: 'anna', ts: '2026-02-01T11:00:00Z', type: 'temps', value: 5, who: 'Anna', sig: 'x' });
  anna.updatedAt = new Date(Date.parse(bt.updatedAt) + 1000).toISOString();

  await S.mergeIncoming({ nodes: [anna], entities: [], tombstones: {} });
  const a = S.byId(bt.id);
  return { ids: (a.ledger || []).map(e => e.id), id: bt.id };
});
ok(led.ids.includes('bru') && led.ids.includes('anna'), 'hi són els dos apunts: ' + JSON.stringify(led.ids));
ok(led.ids.includes('base'), 'i el que ja hi era abans no s\'ha perdut pel camí');
ok(led.ids.length === 3, 'sense duplicats: 3 apunts, no 4');
ok(led.ids[0] === 'anna' && led.ids[2] === 'base', 'i queden del més nou al més vell');

console.log('\n2 · I els socis que s\'han apuntat mentrestant');
const mem = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Biblioteca', 'projecte', null); n.dynamicType = 'biblioteca_coses';
  S.state.nodes.push(n); await S.persist(n);
  const copy = JSON.parse(JSON.stringify(n));
  S.joinNode(n, { name: 'Bru Soler' }); await S.persist(n);
  copy.members = (copy.members || []).concat([{ id: 'm-anna', name: 'Anna Puig', kind: 'persona' }]);
  copy.updatedAt = new Date(Date.parse(n.updatedAt) + 1000).toISOString();
  await S.mergeIncoming({ nodes: [copy], entities: [], tombstones: {} });
  return S.membersOf(S.byId(n.id)).map(x => x.name).sort();
});
ok(mem.length === 2, 'hi són tots dos: ' + JSON.stringify(mem));

console.log('\n3 · Fusionar dues vegades no duplica ni canvia res');
const idem = await page.evaluate(async (id) => {
  const S = window.__SOS;
  const before = S.byId(id).ledger.map(e => e.id).join('|');
  const copy = JSON.parse(JSON.stringify(S.byId(id)));
  copy.updatedAt = new Date(Date.parse(copy.updatedAt) + 5000).toISOString();
  await S.mergeIncoming({ nodes: [copy], entities: [], tombstones: {} });
  return { before, after: S.byId(id).ledger.map(e => e.id).join('|') };
}, led.id);
ok(idem.before === idem.after, 'la fusió és idempotent');

console.log('\n4 · Del mateix registre es queda el més ric, no el més nou');
const rich = await page.evaluate(() => {
  const S = window.__SOS;
  const sense = { id: 'x', ts: '2026-03-01T00:00:00Z', value: 1 };
  const amb = { id: 'x', ts: '2026-01-01T00:00:00Z', value: 1, sig: 'firma' };
  const a = S.mergeAppendOnly([sense], [amb], 'ledger');
  const pocs = { id: 'p', got: ['un'], ts: '2026-03-01T00:00:00Z' };
  const molts = { id: 'p', got: ['un', 'dos'], ts: '2026-01-01T00:00:00Z' };
  const c = S.mergeAppendOnly([pocs], [molts], 'pending');
  return { signat: !!a[0].sig, confirmacions: (c[0].got || []).length, n: a.length };
});
ok(rich.n === 1 && rich.signat, 'el que porta firma guanya el que no en porta, encara que sigui més vell');
ok(rich.confirmacions === 2, 'i el que porta més confirmacions guanya el que en porta menys');

console.log('\n5 · Cada autor encadena el seu (és el que fa possible la unió)');
const chain = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Cadenes', 'projecte', null);
  S.state.nodes.push(n); await S.persist(n);
  const L = n.ledger = [];
  await S.pushLedger(L, { id: 'a1', ts: '2026-01-01T00:00:00Z', type: 'temps', value: 1 });
  await S.pushLedger(L, { id: 'a2', ts: '2026-01-02T00:00:00Z', type: 'temps', value: 2 });
  const first = L.find(e => e.id === 'a1'), second = L.find(e => e.id === 'a2');
  const v = await S.verifyLedger(L);
  return {
    prevBuit: first.prevHash === '',
    encadenat: second.prevHash === first.hash,
    autor: S.entryAuthor(second).startsWith('did:sos:'),
    mode: v.chain.mode, ok: v.chain.ok
  };
});
ok(chain.prevBuit && chain.encadenat, 'els apunts d\'un mateix autor s\'encadenen entre ells');
ok(chain.autor, 'i cada apunt sap de qui és la cadena, pel `did`');
ok(chain.ok && chain.mode === 'autor', 'verifyLedger valida la cadena per autor');

console.log('\n6 · La cadena d\'un no depèn de la de l\'altre');
const two = await page.evaluate(async () => {
  const S = window.__SOS;
  const L = [];
  await S.pushLedger(L, { id: 'meu1', ts: '2026-01-01T00:00:00Z', value: 1 });
  // Un apunt d'una altra persona, amb la seva pròpia cadena començada de nou.
  L.unshift({ id: 'seu1', ts: '2026-01-03T00:00:00Z', value: 9, prevHash: '', hash: 'h-seu',
              sig: 'x', signer: { did: 'did:sos:ed25519:ALTRE', alg: 'Ed25519', pubJwk: {} } });
  await S.pushLedger(L, { id: 'meu2', ts: '2026-01-04T00:00:00Z', value: 2 });
  const meu2 = L.find(e => e.id === 'meu2'), meu1 = L.find(e => e.id === 'meu1');
  return { saltaLAltre: meu2.prevHash === meu1.hash, autors: new Set(L.map(e => S.entryAuthor(e))).size };
});
ok(two.saltaLAltre, 'el meu apunt encadena amb el meu anterior, no amb el que hi ha entremig');
ok(two.autors === 2, 'i el ledger sosté dues cadenes alhora sense barrejar-les');

console.log('\n7 · Els ledgers escrits abans de V64 segueixen valent');
const legacy = await page.evaluate(async () => {
  const S = window.__SOS;
  // Cadena global antiga: encadenada per ordre, amb autors diferents.
  const L = [{ id: 'g1', ts: '2026-01-01T00:00:00Z', value: 1 },
             { id: 'g2', ts: '2026-01-02T00:00:00Z', value: 2 },
             { id: 'g3', ts: '2026-01-03T00:00:00Z', value: 3 }];
  await S.chainLedger(L);
  L[1].signer = { did: 'did:sos:ed25519:A', alg: 'Ed25519', pubJwk: {} };
  const v = await S.verifyLedger(L.slice().reverse());
  return { ok: v.chain.ok, mode: v.chain.mode };
});
ok(legacy.ok && legacy.mode === 'global',
  'una cadena global antiga es valida com a global, en comptes de dir-se trencada');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
