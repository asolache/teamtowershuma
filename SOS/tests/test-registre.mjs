/* V72 · El registre públic surt del calaix.
   El que es prova sobretot és el que NO surt: cap nom, cap import per persona,
   cap `did`. I la propietat que ho fa útil: amb el rebut a la mà pots demostrar
   que hi ets, i sense ell el registre no diu res de ningú. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.proveInclusion);

const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Banc de Temps de Vilafranca', 'projecte', null);
  n.dynamicType = 'banc_temps'; n.ledger = [];
  const m = S.newMember({ name: 'Montserrat Puig', phone: '600111222' });
  S.membersOf(n).push(m);
  S.state.nodes.push(n);
  await S.pushLedger(n.ledger, { id: 'h1', ts: '2026-05-01T09:00:00Z', type: 'temps', value: 4,
    what: 'Classes de català', memberId: m.id });
  await S.pushLedger(n.ledger, { id: 'h2', ts: '2026-05-02T09:00:00Z', type: 'temps', value: 2,
    what: 'Hort comunitari', memberId: m.id });
  await S.persist(n);
  return { hash: n.ledger.find(e => e.id === 'h1').hash };
});

console.log('\n1 · El que surt són hashes i totals, mai files');
const pack = await page.evaluate(async () => {
  const S = window.__SOS;
  const p = await S.registerPublicPack();
  return {
    txt: JSON.stringify(p), leaves: (p.leaves || []).length,
    accions: p.scope.accions, hores: p.totals.hores,
    teRoot: !!p.root, teCid: !!p.cid, teSig: !!(p.sig && p.signer)
  };
});
ok(pack.accions === 2 && pack.leaves === 2, 'hi ha les dues accions, com a dues fulles');
ok(pack.hores === 6, 'i els totals hi són: ' + pack.hores + ' hores');
ok(!/Montserrat|600111222|Classes de català|Hort comunitari/.test(pack.txt),
  'cap nom, cap telèfon i cap descripció d\'apunt');
ok(!/did:sos/.test(pack.txt.replace(/"signer":\{[^}]*\}/, '')),
  'i cap `did` fora del de qui signa el paquet');
ok(pack.teRoot && pack.teCid && pack.teSig, 'porta arrel, CID i firma');

console.log('\n2 · El sedàs de fuites es passa abans de publicar, no després');
const leak = await page.evaluate(async () => {
  const S = window.__SOS;
  /* Un apunt on el hash porta un nom. No hauria de passar mai, i justament per
     això el sedàs hi és: el dia que un camp nou arrossegui text lliure cap a
     les fulles, això ho atura abans de sortir. */
  const brut = [{ id: 'x', ts: '2026-05-03T00:00:00Z', type: 'temps', value: 1,
    hash: 'Montserrat Puig', nodeId: 'n', signed: true, chained: true }];
  let r;
  try { await S.registerPublicPack({ list: brut }); r = { threw: false }; }
  catch (e) { r = { threw: true, code: e.code, msg: e.msg }; }
  return r;
});
ok(leak.threw && leak.code === 'leak', 'si portés dades de persones, no es publica');
ok(/Montserrat/.test(leak.msg), 'i es diu què ho ha aturat: ' + leak.msg);

console.log('\n3 · Cada versió apunta a la seva mare');
const cadena = await page.evaluate(async () => {
  const S = window.__SOS;
  const v1 = await S.registerPublicPack();
  const v2 = await S.registerPublicPack({ parent: v1.cid });
  return { p1: v1.parent, p2: v2.parent, cid1: v1.cid, file: S.registerFileName(v2),
    ver1: (await S.verifyRegisterPack(v1)).ok, ver2: (await S.verifyRegisterPack(v2)).ok };
});
ok(cadena.p1 === null, 'la primera no té mare');
ok(cadena.p2 === cadena.cid1, 'la segona apunta a la primera: així es pot recórrer la cadena sense refiar-se del punter');
ok(cadena.ver1 && cadena.ver2, 'i totes dues verifiquen: el pare entra abans de signar, no després');
ok(/^registre\/v\//.test(cadena.file), 'i sap a quin fitxer va: ' + cadena.file);

console.log('\n4 · La prova d\'inclusió: hi ets, i no cal ensenyar què diu el teu apunt');
const prova = await page.evaluate(async (h) => {
  const S = window.__SOS;
  const pack = await S.registerPublicPack();
  const idx = { versions: [{ cid: pack.cid, file: 'v/x.json', ts: pack.ts }] };
  const files = { 'registre/index.json': idx, 'registre/v/x.json': pack };
  const orig = window.fetch;
  window.fetch = async (u) => {
    const k = String(u).split('?')[0];
    if (files[k]) return { json: async () => files[k] };
    throw new Error('404');
  };
  try {
    return {
      meu: await S.proveInclusion(h),
      altre: await S.proveInclusion('un-hash-que-no-hi-es'),
      buit: await S.proveInclusion('')
    };
  } finally { window.fetch = orig; }
}, seed.hash);
ok(prova.meu.ok && prova.meu.accions === 2, 'el meu apunt hi és, i diu de quina versió');
ok(!prova.altre.ok && /encara no és/.test(prova.altre.reason), 'un que no hi és: «' + prova.altre.reason + '»');
ok(!prova.buit.ok && /hash/.test(prova.buit.reason), 'sense hash, es demana: «' + prova.buit.reason + '»');

console.log('\n5 · Una versió que no quadra no prova res');
const dolenta = await page.evaluate(async (h) => {
  const S = window.__SOS;
  const pack = await S.registerPublicPack();
  pack.scope.accions = 999;                       // manipulada després de signar
  const files = {
    'registre/index.json': { versions: [{ cid: pack.cid, file: 'v/x.json' }] },
    'registre/v/x.json': pack
  };
  const orig = window.fetch;
  window.fetch = async (u) => {
    const k = String(u).split('?')[0];
    if (files[k]) return { json: async () => files[k] };
    throw new Error('404');
  };
  try { return await S.proveInclusion(h); } finally { window.fetch = orig; }
}, seed.hash);
ok(!dolenta.ok, 'encara que el hash hi sigui, una versió manipulada no compta com a prova');

console.log('\n6 · L\'índex existeix al repositori i comença buit');
const real = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'registre', 'index.json'), 'utf8'));
ok(Array.isArray(real.versions) && real.versions.length === 0,
  'registre/index.json hi és i no porta cap versió inventada');

console.log('\n7 · Sense token no és un error: dona el fitxer i el camí');
const senseToken = await page.evaluate(async () => {
  const S = window.__SOS;
  const pack = await S.registerPublicPack();
  return await S.publishRegisterPack(pack, {});
});
ok(senseToken.mode === 'fitxer' && /^SOS\/registre\/v\//.test(senseToken.path),
  'mode fitxer, cap a ' + senseToken.path);

console.log('\n8 · Ancorar: què porta l\'esdeveniment, i què NO');
const anc = await page.evaluate(async () => {
  const S = window.__SOS;
  const pack = await S.registerPublicPack();
  const ev = await S.nostrBuildRegisterAnchor(pack, 'pk');
  const c = JSON.parse(ev.content);
  let sense;
  try { await S.anchorRegisterPack(pack); sense = { threw: false }; }
  catch (e) { sense = { threw: true, code: e.code, msg: e.msg }; }
  return { ev, c, sense, leaves: pack.leaves.length };
});
ok(anc.c.registre && anc.c.root, 'l\'esdeveniment porta el CID i l\'arrel');
ok(!/leaves|totals/.test(JSON.stringify(anc.ev)),
  'i cap fulla ni cap total: als relés hi va la petjada, no el registre');
ok(anc.ev.tags.some(t => t[0] === 'd' && t[1] === 'sos-registre'),
  'amb `d` fix, així la versió nova substitueix l\'anterior en comptes d\'apilar-se');
ok(anc.sense.threw && anc.sense.code === 'nosigner',
  'sense extensió NIP-07 es nega i explica què es perd: ' + String(anc.sense.msg).slice(0, 60) + '…');

console.log('\n9 · Pinnar: el SOS no puja res, i ho diu');
const pin = await page.evaluate(async () => {
  const S = window.__SOS;
  const pack = await S.registerPublicPack();
  let sense;
  try { await S.markPinned(pack, { target: 'arweave', url: '  ' }); sense = { threw: false }; }
  catch (e) { sense = { threw: true, code: e.code, msg: e.msg }; }
  const amb = await S.markPinned(pack, { target: 'arweave', url: 'ar://abc123' });
  const anc = (await S.loadAnchors()).find(a => a.cid === pack.cid);
  return { sense, amb, guardat: anc && anc.location, targets: S.PIN_TARGETS.map(t => t.id) };
});
ok(pin.sense.threw && pin.sense.code === 'nourl',
  'sense adreça no es desa: «' + String(pin.sense.msg).slice(0, 62) + '…»');
ok(/Arweave · ar:\/\/abc123/.test(pin.guardat || ''),
  'amb adreça, queda apuntat a l\'ancoratge: ' + pin.guardat);
ok(pin.targets.includes('arweave') && pin.targets.includes('ipfs'),
  'hi ha Arweave i IPFS com a destins');

console.log('\n10 · A la pantalla');
const ui = await page.evaluate(async () => {
  const S = window.__SOS;
  S.openRegisterPackModal();
  await new Promise(r => setTimeout(r, 400));
  const has = ['#rpPub', '#rpAnchor', '#rpPin', '#rpProve', '#rpHash', '#rpCopyRoot'].filter(x => !!document.querySelector(x));
  const txt = document.querySelector('.modal').textContent;
  S.closeModal();
  return { has: has.length, capEnsenyar: /No cal ensenyar què diu/.test(txt) };
});
ok(ui.has === 6, 'hi ha publicar, ancorar, fer permanent, comprovar, el camp del hash i copiar l\'arrel');
ok(ui.capEnsenyar, 'i es diu que per comprovar-ho no cal ensenyar el contingut de l\'apunt');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
