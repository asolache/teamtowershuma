/* V60 i V61 · L'oferta comuna surt del calaix, i el pont de claus diu qui
   ancora. Els dos punts que decideixen si això val alguna cosa: que el que
   s'entra no pugui filtrar dades, i que no es digui «verificat» del que no
   s'ha verificat. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

// L'app amb http:// perquè el `fetch` de supply/ no el bloqui l'origen file://.
const MIME = { '.html': 'text/html', '.json': 'application/json', '.md': 'text/plain' };
let extraPacks = {};
const srv = createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (extraPacks[url]) { res.writeHead(200, { 'content-type': 'application/json' }); return res.end(extraPacks[url]); }
  try {
    const p = join(ROOT, url === '/' ? 'index.html' : url.replace(/^\//, ''));
    if (!p.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    /* Es llegeix ABANS d'escriure la capçalera. Fer-ho al revés funcionava
       mentre tot existís i tombava el procés sencer el dia que el navegador
       demanava una cosa que no hi era —un favicon— perquè el `catch` provava
       d'enviar un 404 amb les capçaleres ja enviades. El servidor de proves
       s'ha d'assemblar a un de real també quan la resposta és un error. */
    const cos = readFileSync(p);
    const ext = p.slice(p.lastIndexOf('.'));
    res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream' });
    res.end(cos);
  } catch (e) { res.writeHead(404); res.end('no'); }
});
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const BASE = 'http://127.0.0.1:' + srv.address().port + '/';

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await b.newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(BASE + 'index.html');
await page.waitForFunction(() => window.__SOS && window.__SOS.updateCommonSupply);

console.log('\n1 · El sedàs d\'entrada descarta el que pot fer mal');
const clean = await page.evaluate(() => {
  const S = window.__SOS;
  const good = { kind: 'habilitat', dir: 'ofereix', category: 'reparacions', label: 'Reparacions',
    count: 3, people: 2, nodeName: 'Banc de Temps', place: 'Torrelles' };
  return {
    good: S.sanitizeSupplyRow(good, 'x'),
    email: S.sanitizeSupplyRow(Object.assign({}, good, { label: 'Truca a anna@exemple.cat' }), 'x'),
    tel: S.sanitizeSupplyRow(Object.assign({}, good, { nodeName: 'Bru +34600111222' }), 'x'),
    did: S.sanitizeSupplyRow(Object.assign({}, good, { place: 'did:sos:ed25519:AAA' }), 'x'),
    extra: S.sanitizeSupplyRow(Object.assign({}, good, { who: 'Anna Puig', phone: '600' }), 'x'),
    noKind: S.sanitizeSupplyRow({ label: 'Res', dir: 'ofereix' }, 'x'),
    noLabel: S.sanitizeSupplyRow({ kind: 'habilitat', dir: 'ofereix' }, 'x'),
    junk: S.sanitizeSupplyRow('no sóc un objecte', 'x')
  };
});
ok(clean.good && clean.good.label === 'Reparacions', 'una fila correcta passa');
ok(clean.good.source === 'x', 'i queda marcada amb d\'on ve');
ok(clean.email === null && clean.tel === null && clean.did === null,
  'correus, telèfons i dids fan que la fila es descarti sencera');
ok(clean.extra && clean.extra.who === undefined && clean.extra.phone === undefined,
  'els camps que no són del contracte públic no entren, encara que la fila passi');
ok(clean.noKind === null && clean.noLabel === null && clean.junk === null,
  'una fila incompleta o que no és un objecte no entra');

console.log('\n2 · Llegir l\'oferta comuna no toca la teva');
extraPacks['/supply/index.json'] = JSON.stringify({ packs: [{ name: 'Garraf', file: 'test-garraf.json' }] });
extraPacks['/supply/test-garraf.json'] = JSON.stringify({
  supply: [
    { kind: 'habilitat', dir: 'ofereix', category: 'idiomes', label: 'Idiomes', count: 4, people: 3, nodeName: 'BdT Sitges', place: 'Sitges' },
    { kind: 'objecte', dir: 'ofereix', category: 'bricolatge', label: 'Bricolatge', count: 2, people: 2, nodeName: 'Biblioteca Vilanova', place: 'Vilanova' },
    { kind: 'habilitat', dir: 'busca', category: 'cuina', label: 'anna@exemple.cat', count: 1, people: 1, nodeName: 'X', place: 'Y' }
  ]
});
const read = await page.evaluate(async () => {
  const S = window.__SOS;
  const nodesBefore = S.state.nodes.length;
  const r = await S.updateCommonSupply(true);
  return {
    r, rows: S.state.commonSupply.length,
    nodesSame: S.state.nodes.length === nodesBefore,
    labels: S.state.commonSupply.map(x => x.label),
    at: !!S.state.commonSupplyAt
  };
});
ok(read.r.packs === 1 && read.rows === 2, 'entren les dues files netes i la bruta es queda fora');
ok(!read.labels.includes('anna@exemple.cat'), 'el correu no ha entrat ni venint del repositori oficial');
ok(read.nodesSame, 'llegir l\'oferta comuna no crea cap node');
ok(read.at, 'i es recorda quan es va llegir');

console.log('\n3 · Es busca dins del que han publicat altres');
const search = await page.evaluate(() => {
  const S = window.__SOS;
  return {
    idiomes: S.commonSupplyMatches('idiomes').length,
    lloc: S.commonSupplyMatches('sitges').length,
    soloObj: S.commonSupplyMatches('', { kinds: ['objecte'] }).length,
    soloBusca: S.commonSupplyMatches('', { dirs: ['busca'] }).length,
    tot: S.commonSupplyMatches('').length,
    res: S.commonSupplyMatches('paracaigudes').length
  };
});
ok(search.idiomes === 1 && search.lloc === 1, 'es troba per allò que és i pel lloc');
ok(search.soloObj === 1 && search.soloBusca === 0, 'els filtres de tipus i direcció funcionen');
ok(search.tot === 2 && search.res === 0, 'i no s\'inventa resultats');

console.log('\n4 · La cerca ho ensenya a part i diu que és de fora');
await page.evaluate(() => window.__SOS.openSupplySearch());
await page.waitForSelector('.modal #spCommon');
const ui = await page.evaluate(() => {
  const box = document.querySelector('.modal #spCommon');
  return {
    hasHead: /resta de la xarxa/i.test(box.innerText),
    rows: box.querySelectorAll('.sp-r').length,
    badge: /publicat/i.test(box.innerText),
    saysApart: /no es barreja/i.test(box.innerText),
    hasUpdate: /actualitza l'oferta comuna/i.test(box.innerText)
  };
});
ok(ui.hasHead && ui.rows === 2, 'les files de fora surten en una secció pròpia');
ok(ui.badge, 'marcades com a publicades per altres');
ok(ui.saysApart, 'i es diu que no es barregen amb les teves');
ok(ui.hasUpdate, 'amb el botó per tornar-les a llegir');
await page.evaluate(() => window.__SOS.closeModal());

console.log('\n5 · El manifest del comú existeix i està buit a posta');
// Es treu la simulació: aquí es comprova el fitxer real del repositori.
extraPacks = {};
const manifest = await page.evaluate(async () => {
  const r = await fetch('supply/index.json', { cache: 'no-store' });
  return { okStatus: r.ok, j: await r.json() };
});
ok(manifest.okStatus, 'supply/index.json es serveix');
ok(Array.isArray(manifest.j.packs) && manifest.j.packs.length === 0,
  'i comença sense cap paquet: no hi ha res inventat');
ok(/on preguntar/i.test(manifest.j.description || ''), 'el manifest diu què hi ha i què no');

console.log('\n6 · L\'id d\'un event Nostr es calcula segons NIP-01');
const evt = await page.evaluate(async () => {
  const S = window.__SOS;
  const e = { pubkey: 'a'.repeat(64), created_at: 1700000000, kind: 30078, tags: [['d', 'x']], content: 'hola' };
  const id = await S.nostrEventId(e);
  const again = await S.nostrEventId(e);
  const other = await S.nostrEventId(Object.assign({}, e, { content: 'hola!' }));
  return { id, same: id === again, other, hex: /^[0-9a-f]{64}$/.test(id) };
});
ok(evt.hex, 'l\'id és un sha256 en hexadecimal de 64 caràcters');
ok(evt.same && evt.id !== evt.other, 'determinista, i canvia si canvia el contingut');

console.log('\n7 · El pont es verifica en el que es pot, i diu el que no');
const link = await page.evaluate(async () => {
  const S = window.__SOS;
  const id = await S.getIdentity();
  // Es fabrica el pont sense extensió NIP-07: la banda did és real i firmada;
  // la banda Nostr s'imita per poder provar el lligam.
  const pubkey = 'b'.repeat(64);
  const l = { type: S.KEY_LINK_TYPE, did: id.did, nostr: pubkey, ts: new Date().toISOString(), app: 'sos-teamtowers' };
  await S.signRecord(l);
  const e = { kind: 30078, created_at: Math.floor(Date.now() / 1000),
    tags: [['d', 'sos-key-link']], content: JSON.stringify(l), pubkey };
  e.id = await S.nostrEventId(e);
  const good = await S.verifyKeyLink({ link: l, event: e });

  // Manipulat: el contingut de l'event ja no és el registre firmat.
  const e2 = Object.assign({}, e, { content: JSON.stringify(Object.assign({}, l, { nostr: 'c'.repeat(64) })) });
  const tampered = await S.verifyKeyLink({ link: l, event: e2 });

  // Una clau declarada que no és la de l'event.
  const e3 = Object.assign({}, e, { pubkey: 'd'.repeat(64) });
  const wrongKey = await S.verifyKeyLink({ link: l, event: e3 });

  // Un id que no quadra amb la serialització.
  const e4 = Object.assign({}, e, { id: '0'.repeat(64) });
  const badId = await S.verifyKeyLink({ link: l, event: e4 });

  return { good, tampered, wrongKey, badId, notLink: await S.verifyKeyLink({ link: { type: 'altra' }, event: e }) };
});
ok(link.good.ok, 'un pont ben format es dona per bo');
ok(link.good.did.ok, 'la banda did:sos es verifica de debò');
ok(link.good.binding.ok && link.good.binding.contentMatch && link.good.binding.keyMatch && link.good.binding.idMatch,
  'i el lligam es comprova en les tres coses: contingut, clau i id');
ok(link.good.nostr.verified === false && /Schnorr|secp256k1/i.test(link.good.nostr.reason),
  'la firma Nostr NO es dona per verificada, i es diu per què');
ok(/rel[ée]/i.test(link.good.nostr.reason), 'i es diu què sí que la prova: que un relé l\'accepti');
ok(!link.tampered.ok && !link.tampered.binding.contentMatch, 'un event manipulat no passa');
ok(!link.wrongKey.ok && !link.wrongKey.binding.keyMatch, 'una clau que no és la de l\'event no passa');
ok(!link.badId.ok && !link.badId.binding.idMatch, 'un id que no quadra no passa');
ok(!link.notLink.ok && link.notLink.reason === 'not_key_link', 'i el que no és un pont es rebutja pel que és');

console.log('\n8 · Sense extensió NIP-07 no es fa veure que es pot');
const noSigner = await page.evaluate(async () => {
  const S = window.__SOS;
  try { await S.buildKeyLink(); return { threw: false }; }
  catch (e) { return { threw: true, msg: (e && e.msg) || String(e) }; }
});
ok(noSigner.threw && /NIP-07/.test(noSigner.msg), 'sense extensió, ho diu clar en comptes de fallar per dins');

await b.close(); srv.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
