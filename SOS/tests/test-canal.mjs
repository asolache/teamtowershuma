/* V65 · El canal asíncron.
   El que es prova aquí és sobretot que el repositori **no dona veritat**: un
   paquet ben firmat que porti apunts sense firma no els cola, i un paquet
   xifrat amb una altra clau no s'obre. I que llegir dues vegades no duplica
   res, que és el que fa que es pugui reintentar sense pensar-hi. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await b.newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.buildChannelPack);

const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const bt = S.newNode('Banc de Temps', 'projecte', null); bt.dynamicType = 'banc_temps';
  S.state.nodes.push(bt); await S.persist(bt);
  const L = bt.ledger = [];
  await S.pushLedger(L, { id: 'r1', ts: '2026-02-01T09:00:00Z', type: 'temps', value: 3, who: 'Bru' });
  await S.pushLedger(L, { id: 'r2', ts: '2026-02-02T09:00:00Z', type: 'temps', value: 5, who: 'Anna' });
  await S.persist(bt);
  return { id: bt.id };
});

console.log('\n1 · Sense clau del node no es publica a mitges');
const nokey = await page.evaluate(async (s) => {
  const S = window.__SOS;
  try { await S.buildChannelPack(S.byId(s.id), 'banc de temps'); return { threw: false }; }
  catch (e) { return { threw: true, code: e.code, msg: e.msg || '' }; }
}, seed);
ok(nokey.threw && nokey.code === 'nokey', 'es nega a construir el paquet i diu per què');
ok(/clar/.test(nokey.msg), 'i avisa que publicar-lo seria publicar-ho en clar: ' + nokey.msg);

console.log('\n2 · Amb clau, el paquet va xifrat i firmat');
const built = await page.evaluate(async (s) => {
  const S = window.__SOS;
  const n = S.byId(s.id);
  const key = await S.generateNodeKey();
  await S.shareNodeKeyWithMember(n, await S.myExchangeCard(), key);   // el camí real (V29)
  await S.persist(n);
  const pack = await S.buildChannelPack(n, 'banc de temps');
  const txt = JSON.stringify(pack);
  return {
    type: pack.type, theme: pack.theme, count: pack.count,
    xifrat: !!pack.enc && !pack.body,
    firmat: !!(pack.sig && pack.signer && pack.signer.did),
    fuita: /Bru|Anna|Banc de Temps/.test(txt),
    nomFora: 'nodeName' in pack,
    path: S.channelFileName(pack)
  };
}, seed);
ok(built.type === 'sos-channel-pack' && built.count === 2, 'el paquet porta els dos apunts firmats');
ok(built.theme === 'banc-de-temps', 'i el tema queda com a slug: ' + built.theme);
ok(built.xifrat && built.firmat, 'va xifrat i el sobre va signat');
ok(!built.fuita, 'del paquet no en surt cap nom llegible sense la clau');
ok(!built.nomFora, 'ni tan sols el nom del node: a fora només hi ha el tema i l\'id');
ok(/^canal\/banc-de-temps\//.test(built.path), 'i sap a quin fitxer del repositori va: ' + built.path);

console.log('\n3 · Llegir-lo en un altre SOS que té la clau');
const read = await page.evaluate(async (s) => {
  const S = window.__SOS;
  const origen = S.byId(s.id);
  const pack = await S.buildChannelPack(origen, 'banc de temps');
  // Un altre node, buit, amb la mateixa clau compartida (el mateix banc de temps).
  const meu = S.newNode('Banc de Temps', 'projecte', null); meu.dynamicType = 'banc_temps';
  meu.envelopes = (origen.envelopes || []).slice();    // la mateixa clau compartida
  meu.ledger = [];
  S.state.nodes.push(meu); await S.persist(meu);
  const r1 = await S.readChannelPack(pack, meu);
  const r2 = await S.readChannelPack(pack, meu);      // segona vegada
  return { r1, r2, n: meu.ledger.length, ids: meu.ledger.map(e => e.id).sort() };
}, seed);
ok(read.r1.ok && read.r1.added === 2, 'entren els dos apunts');
ok(read.r2.ok && read.r2.added === 0 && read.n === 2, 'llegir-lo dues vegades no en duplica cap');
ok(JSON.stringify(read.ids) === '["r1","r2"]', 'i són els mateixos apunts: ' + JSON.stringify(read.ids));

console.log('\n4 · El transport NO dona veritat');
const trust = await page.evaluate(async (s) => {
  const S = window.__SOS;
  const origen = S.byId(s.id);
  const meu = S.newNode('Còpia', 'projecte', null);
  meu.envelopes = (origen.envelopes || []).slice(); meu.ledger = [];
  S.state.nodes.push(meu); await S.persist(meu);

  // Un paquet perfectament signat per mi, però amb un apunt colat sense firma.
  const key = await S.getMyNodeKey(meu);
  const body = {
    receipts: [
      origen.ledger.find(e => e.id === 'r1'),
      { id: 'colat', ts: '2026-02-03T00:00:00Z', type: 'temps', value: 999, who: 'Ningú' }
    ], members: []
  };
  const pack = { type: 'sos-channel-pack', v: 1, theme: 'banc-de-temps', nodeId: meu.id,
    nodeName: meu.name, ts: new Date().toISOString(), count: 2, body: null };
  pack.enc = await S.encryptWithKey(key, body);
  await S.signRecord(pack);                       // el sobre és impecable

  const r = await S.readChannelPack(pack, meu);
  return { added: r.added, rejected: r.rejected, ids: meu.ledger.map(e => e.id) };
}, seed);
ok(!read.ids.includes('colat') && !trust.ids.includes('colat'),
  'l\'apunt sense firma no entra, tot i que el sobre estigui ben signat');
ok(trust.added === 1 && trust.rejected === 1, 'entra el bo i es compta el descartat');

console.log('\n5 · Un sobre manipulat no s\'obre');
const tampered = await page.evaluate(async (s) => {
  const S = window.__SOS;
  const n = S.byId(s.id);
  const pack = await S.buildChannelPack(n, 'banc de temps');
  pack.nodeId = 'un-altre-node';                 // canviat després de signar
  const v = await S.verifyChannelPack(pack, n);
  return { ok: v.ok, reason: v.reason || '' };
}, seed);
ok(!tampered.ok && /firma/.test(tampered.reason), 'es rebutja i diu què falla: ' + tampered.reason);

console.log('\n6 · Sense la clau es veu que hi ha alguna cosa, i prou');
const locked = await page.evaluate(async (s) => {
  const S = window.__SOS;
  const pack = await S.buildChannelPack(S.byId(s.id), 'banc de temps');
  const altre = S.newNode('Un node qualsevol', 'projecte', null);
  altre.ledger = []; S.state.nodes.push(altre);
  await S.shareNodeKeyWithMember(altre, await S.myExchangeCard(), await S.generateNodeKey());  // una altra clau
  await S.persist(altre);
  const r = await S.readChannelPack(pack, altre);
  return { ok: r.ok, locked: r.locked, added: r.added, n: altre.ledger.length, reason: r.reason };
}, seed);
ok(!locked.ok && locked.locked, 'es diu que és xifrat amb una altra clau, no que estigui trencat');
ok(locked.added === 0 && locked.n === 0, 'i no entra res al node que no hi té res a veure');

console.log('\n7 · L\'índex del canal, tal com és al repositori');
/* `file://` bloqueja `fetch`, així que el fitxer es comprova des de Node i el
   comportament de la funció amb un `fetch` simulat. Provar-ho amb un servidor
   només per a això afegiria una peça mòbil i no provaria res més. */
const real = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'canal', 'index.json'), 'utf8'));
ok(Array.isArray(real.packs) && real.packs.length === 0, 'canal/index.json existeix i comença buit, com supply/');

console.log('\n8 · Baixar el canal fusiona el que pot i no es queixa de la resta');
const pull = await page.evaluate(async (s) => {
  const S = window.__SOS;
  const origen = S.byId(s.id);
  const pack = await S.buildChannelPack(origen, 'banc de temps');
  const meu = S.newNode('Receptor', 'projecte', null);
  meu.envelopes = (origen.envelopes || []).slice(); meu.ledger = [];
  S.state.nodes.push(meu); await S.persist(meu);

  // Un canal amb tres paquets: el bo, un d'un altre tema i un que no es baixa.
  const files = {
    'canal/index.json': { themes: ['banc-de-temps'], packs: [
      { theme: 'banc-de-temps', file: 'banc-de-temps/bo.json' },
      { theme: 'biblioteca', file: 'biblioteca/altre.json' },
      { theme: 'banc-de-temps', file: 'banc-de-temps/trencat.json' }] },
    'canal/banc-de-temps/bo.json': pack
  };
  const orig = window.fetch;
  window.fetch = async (u) => {
    const k = String(u).split('?')[0];
    if (files[k]) return { json: async () => files[k] };
    throw new Error('404');
  };
  try { return { r: await S.pullChannel(meu, 'banc de temps'), n: meu.ledger.length }; }
  finally { window.fetch = orig; }
}, seed);
ok(pull.r.read === 1 && pull.r.added === 2, 'llegeix el del seu tema i n\'entren els dos apunts');
ok(pull.r.failed === 1, 'el que no es pot baixar es compta com a fallat, no atura la resta');
ok(pull.n === 2, 'i el paquet de l\'altre tema ni es toca');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
