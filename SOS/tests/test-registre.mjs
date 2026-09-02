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

/* ── El número del Comando ─────────────────────────────────────────────────
   La pel·lícula va d'un reclutament de 150.000 i cadascú té el seu número. La
   temptació és un comptador en un servidor; el que es prova aquí és que no cal
   —i que el que es publica per fer-ho possible no diu qui és ningú. */
console.log('\n11 · El número es guanya, i sense aportació signada no n\'hi ha cap');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS;
    const n = S.newNode('Colla de prova', 'projecte', null);
    n.dynamicType = 'banc_temps'; n.ledger = []; S.state.nodes.push(n);
    const jordi = S.newMember({ name: 'Jordi Sense Res' });
    S.membersOf(n).push(jordi);
    /* Un apunt a pèl: ni signat ni encadenat. És el forat pel qual s'hi colaria
       qualsevol que sabés escriure un nom. */
    n.ledger.push({ id: 'crua', ts: '2026-01-01T09:00:00Z', type: 'temps', value: 99, memberId: jordi.id });
    await S.persist(n);
    const pack = await S.buildRegisterPack();
    return { altes: pack.altes.length, primeres: S.primeresAltes().length,
      alta: await S.altaDe('Jordi Sense Res') };
  });
  ok(r.primeres === 1 && r.altes === 1,
    'només compta la gent amb una aportació signada i encadenada, i n\'hi ha ' + r.altes);
  ok(!r.alta.ok && /encara no/.test(r.alta.per || ''),
    `i qui no en té cap no té número ni cap de provisional: «${r.alta.per}»`);
  ok(r.alta.ok !== true, 'un número provisional seria pitjor que cap: algú l\'hauria dit en veu alta');
}

console.log('\n12 · El compromís d\'alta no diu qui és ningú, i el seu titular el pot refer');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS;
    const idx = S.ledgerIndex().filter(x => x.signed && x.chained);
    const un = idx[0];
    const c = await S.altaCommitment(un.signer, un.hash);
    const altre = await S.altaCommitment(un.signer, un.hash);
    const fals = await S.altaCommitment(un.signer, 'un-hash-que-no-es-seu');
    const pack = await S.buildRegisterPack();
    const txt = JSON.stringify(pack);
    const noms = S.state.nodes.flatMap(nd => S.membersOf(nd).map(m => m.name));
    return { c, igual: c === altre, fals: fals !== c, llarg: c.length,
      duEls: noms.filter(nm => txt.includes(nm)),
      /* La propietat de debò: el compromís no ÉS cap de les dues peces. No que
         les peces no surtin enlloc —el hash de cada apunt ja es publica com a
         fulla, que és el que fa possible la prova d'inclusió— sinó que d'una
         fulla i d'un did no se'n dedueix el compromís sense tenir-los tots dos
         i saber quin va amb quin. */
      esFulla: (pack.leaves || []).indexOf(c) >= 0,
      esDid: c === un.signer || String(un.signer).includes(c),
      hashPublic: (pack.leaves || []).indexOf(un.hash) >= 0,
      leak: S.verifyNoLeak(pack) };
  });
  ok(r.llarg === 22 && r.igual,
    `el compromís és de ${r.llarg} caràcters i sempre surt el mateix amb les mateixes peces`);
  ok(r.fals, 'i amb un hash que no és el seu, surt un altre: no el pot refer qui no té les dues peces');
  ok(!r.duEls.length, 'la versió publicada no porta cap nom' + (r.duEls.length ? ': ' + r.duEls : ''));
  ok(!r.esFulla && !r.esDid,
    'el compromís no és cap de les dues peces: ni una fulla del registre ni el did:sos');
  /* I el límit, escrit com a asserció perquè no s'oblidi: les fulles SÍ que són
     públiques, i qui ja tingui el teu did pot trobar-hi el teu número. No es pot
     evitar sense trencar el que ho fa útil —que qualsevol ho pugui verificar— i
     per això es diu en comptes de fer veure que no passa. */
  ok(r.hashPublic,
    'les fulles són públiques a posta: és el que fa possible la prova d\'inclusió, ' +
    'i vol dir que qui ja tingui el teu did:sos pot trobar el teu número');
  ok(r.leak.ok, 'i passa el sedàs de fuites com qualsevol altre paquet públic');
}

console.log('\n13 · El número és la posició, i la fixa la publicació');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS;
    /* Dues versions simulades, servides des de la memòria: la primera amb dues
       altes i la segona amb una de nova. El número de la tercera persona ha de
       sortir 3, i el de la primera no s'ha de moure. */
    const v1 = await S.buildRegisterPack(null, { altesJa: [] });
    const abans = v1.altes.slice();
    const v2 = await S.buildRegisterPack(null, { altesJa: abans });
    return { v1: { altes: v1.altes.length, abans: v1.altesAbans, total: v1.altesTotal },
      v2: { altes: v2.altes.length, abans: v2.altesAbans, total: v2.altesTotal },
      ver1: await S.verifyRegisterPack(v1), ver2: await S.verifyRegisterPack(v2) };
  });
  ok(r.v1.abans === 0 && r.v1.total === r.v1.altes,
    `la primera versió numera del 1 al ${r.v1.total}`);
  ok(r.v2.altes === 0 && r.v2.abans === r.v1.total && r.v2.total === r.v1.total,
    'i la següent no torna a numerar ningú: les altes són un delta, no una llista sencera');
  ok(r.ver1.ok && r.ver2.ok, 'totes dues verifiquen');
}

console.log('\n14 · Tocar les altes trenca la verificació');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS;
    const base = await S.buildRegisterPack();
    /* El CID es refà a cada manipulació. Sense això tot petava a `cid_mismatch`
       abans d'arribar a les comprovacions de les altes, i les branques noves no
       s'haurien provat mai: una comprovació que no s'arriba a executar és
       decoració. Aquí es fa de compte que qui manipula sap el que fa. */
    const refes = async p => { const { cid, ...rest } = p;
      p.cid = 'sha256:' + await S.sha256(new TextEncoder().encode(S._canonAll(rest))); return p; };
    const clon = () => JSON.parse(JSON.stringify(base));
    const mou = await refes(Object.assign(clon(), { altesAbans: 500 }));
    const cola = clon(); cola.altes = cola.altes.concat(['AAAAAAAAAAAAAAAAAAAAAA']); await refes(cola);
    const mal = clon(); mal.altes = ['Marta Vidal']; await refes(mal);
    const rep = clon(); rep.altes = base.altes.concat(base.altes); await refes(rep);
    return { base: (await S.verifyRegisterPack(base)).ok,
      mou: await S.verifyRegisterPack(mou), cola: await S.verifyRegisterPack(cola),
      mal: await S.verifyRegisterPack(mal), rep: await S.verifyRegisterPack(rep) };
  });
  ok(r.base, 'el paquet acabat de fer verifica');
  ok(!r.mou.ok, `moure la posició de sortida el trenca (${r.mou.reason}): ningú pot canviar el número d'una alta`);
  ok(!r.cola.ok, `colar-hi una alta el trenca (${r.cola.reason})`);
  ok(!r.mal.ok, `i una alta que no és un compromís, també (${r.mal.reason}): al registre no hi cap un nom`);
  ok(!r.rep.ok, `una alta repetida el trenca (${r.rep.reason}): ningú té dos números`);
}

console.log('\n15 · Què costa publicar-ho, amb la xifra i la data');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS;
    const pes = S.pesRegistre(await S.buildRegisterPack());
    return { pes, arw: S.ARWEAVE, target: S.COMANDO_TARGET };
  });
  ok(r.arw.gratis === 102400 && !!r.arw.data && !!r.arw.font,
    `el preu de referència porta data («${r.arw.data}») i font, i el llindar gratuït és 100 KiB`);
  ok(r.pes.gratis && r.pes.cabenGratis > 3000,
    `una versió hi cap de sobres: hi caben ${r.pes.cabenGratis} altes per pujada gratuïta`);
  ok(r.pes.comando.versions <= 60 && r.pes.comando.usd < 1,
    `els ${r.target} sencers són ${r.pes.comando.mib} MB en ${r.pes.comando.versions} versions: ` +
    `0 € aprofitant el llindar, i ${r.pes.comando.usd} $ pagant-ho tot a tarifa`);
  ok(r.pes.perAlta <= 30, `cada alta ocupa ${r.pes.perAlta} bytes: el que fa que la xifra sigui aquesta i no una altra`);
}

console.log('\n16 · A la IA del personatge se li dona el número, i no se\'l pot inventar');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS;
    const sense = S.characterContext('Montserrat Puig', { skillsFree: [{ label: 'cuina' }] }, null);
    const amb = S.characterContext('Montserrat Puig', { skillsFree: [{ label: 'cuina' }] },
      { ok: true, numero: 4217, primera: { ts: '2026-05-01T09:00:00Z', que: 'Classes de català' } });
    const b = S.AI.intents.character_dossier;
    return { sense: { numero: sense.numero, txt: b.build(sense) },
      amb: { numero: amb.numero, txt: b.build(amb) },
      sys: b.system, req: b.tool.input_schema.required };
  });
  ok(r.amb.numero === 4217 && /Número al Comando: 4217 de 150000/.test(r.amb.txt),
    'amb número, el prompt el porta amb la data i l\'aportació que el van guanyar');
  ok(r.sense.numero === null && /Número al Comando: encara cap/.test(r.sense.txt) &&
    /NO te'n pots inventar cap/.test(r.sense.txt),
    'i sense número també es diu: callar-ho és el que fa que la IA se n\'inventi un');
  ok(r.req.indexOf('incorporacio') >= 0,
    'l\'escena d\'incorporació al reclutament és obligatòria, no opcional');
  ok(/no és un rànquing|NO és un rànquing/.test(r.sys),
    'i al prompt hi diu que el número no és un rànquing: és l\'error que una IA de guió comet sola');
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
