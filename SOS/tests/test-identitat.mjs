/* V59 · El `did` mana sobre el nom.
   Dos casos que abans corrompien dades en silenci: dos veïns que es diuen igual
   fusionats en un, i una persona escrita de dues maneres partida en dues. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.identityIndex);

const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const bt = S.newNode('Banc de Temps', 'projecte', null); bt.dynamicType = 'banc_temps';
  const bib = S.newNode('Biblioteca', 'projecte', null); bib.dynamicType = 'biblioteca_coses';
  S.state.nodes.push(bt, bib);
  await S.persist(bt); await S.persist(bib);
  return { bt: bt.id, bib: bib.id };
});

console.log('\n1 · Sense cap did, es comporta com abans');
const plain = await page.evaluate((ids) => {
  const S = window.__SOS;
  const bt = S.byId(ids.bt);
  const a = S.joinNode(bt, { name: 'Anna Puig' });
  const a2 = S.joinNode(bt, { name: 'anna  puig' });   // mateix nom, altra grafia
  return { same: a.id === a2.id, n: S.membersOf(bt).length };
}, seed);
ok(plain.same && plain.n === 1, 'el mateix nom segueix trobant la mateixa fitxa');

console.log('\n2 · El mateix did uneix encara que el nom s\'escrigui diferent');
const united = await page.evaluate(async (ids) => {
  const S = window.__SOS;
  const bt = S.byId(ids.bt), bib = S.byId(ids.bib);
  const DID = 'did:sos:ed25519:ALVARO';
  // Al banc de temps s'apunta com «Àlvaro»; a la biblioteca, amb el nom llarg.
  const m1 = S.joinNode(bt, { name: 'Àlvaro', did: DID });
  const m2 = S.joinNode(bib, { name: 'Alvaro Solache', did: DID });
  await S.persist(bt); await S.persist(bib);
  const known = S.knownPersons();
  const me = known.find(p => p.dids.includes(DID));
  return {
    twoRecords: m1.id !== m2.id,
    onePerson: known.filter(p => p.dids.includes(DID)).length === 1,
    nodes: me ? me.nodes.length : 0,
    aka: me ? me.aka : [],
    canonSame: S.canonKeyOf(m1) === S.canonKeyOf(m2),
    profileFromShort: S.personProfile('Àlvaro').presence.length,
    profileFromLong: S.personProfile('Alvaro Solache').presence.length
  };
}, seed);
ok(united.twoRecords, 'segueixen sent dues fitxes, una per node');
ok(united.onePerson && united.nodes === 2, 'però una sola persona, present als dos nodes');
ok(united.canonSame, 'les dues fitxes comparteixen clau canònica');
ok(united.aka.length === 1, 'i es diu amb quins altres noms se l\'ha escrita: ' + JSON.stringify(united.aka));
ok(united.profileFromShort === 2 && united.profileFromLong === 2,
  'el perfil surt sencer tant si el busques per un nom com per l\'altre');

console.log('\n3 · Dos did diferents no s\'uneixen mai, encara que es diguin igual');
const twins = await page.evaluate(async (ids) => {
  const S = window.__SOS;
  const bt = S.byId(ids.bt);
  const A = 'did:sos:ed25519:ANNA-1', B = 'did:sos:ed25519:ANNA-2';
  const m1 = S.joinNode(bt, { name: 'Anna Roca', did: A });
  const m2 = S.joinNode(bt, { name: 'Anna Roca', did: B });
  await S.persist(bt);
  const known = S.knownPersons();
  const rocas = known.filter(p => /anna roca/i.test(p.name));
  return {
    different: m1.id !== m2.id,
    two: rocas.length === 2,
    flagged: rocas.every(p => p.conflict),
    idxAmb: S.identityIndex().ambiguous.some(a => a.name === 'anna-roca')
  };
}, seed);
ok(twins.different && twins.two, 'dues persones amb el mateix nom segueixen sent dues');
ok(twins.flagged, 'i totes dues es marquen com a nom ambigu, en comptes d\'amagar-ho');
ok(twins.idxAmb, 'l\'índex d\'identitat sap quins noms són ambigus');

console.log('\n4 · Una fitxa reclamada per un altre no es pren');
const steal = await page.evaluate(async (ids) => {
  const S = window.__SOS;
  const bib = S.byId(ids.bib);
  const OWNER = 'did:sos:ed25519:BRU-OK', OTHER = 'did:sos:ed25519:BRU-NO';
  const mine = S.joinNode(bib, { name: 'Bru Soler', did: OWNER });
  const theirs = S.joinNode(bib, { name: 'Bru Soler', did: OTHER });
  await S.persist(bib);
  return { different: mine.id !== theirs.id, ownerKept: mine.did === OWNER, otherOwn: theirs.did === OTHER };
}, seed);
ok(steal.different, 'apuntar-se amb un did diferent no s\'endú la fitxa d\'un altre');
ok(steal.ownerKept && steal.otherOwn, 'cadascú es queda amb la seva');

console.log('\n5 · Un nom sense did s\'adopta si no hi ha ambigüitat');
const adopt = await page.evaluate((ids) => {
  const S = window.__SOS;
  const idx = S.identityIndex();
  return {
    // «Àlvaro» apunta a un sol did → s'adopta
    alvaro: S.canonKeyOfName('Àlvaro', idx),
    // «Anna Roca» apunta a dos → no s'endevina
    anna: S.canonKeyOfName('Anna Roca', idx),
    desconegut: S.canonKeyOfName('Ningú Coneixut', idx),
    buit: S.canonKeyOfName('', idx)
  };
}, seed);
ok(/^did:/.test(adopt.alvaro), 'un nom que apunta a un sol did es resol a aquell did');
ok(!/^did:/.test(adopt.anna), 'un nom ambigu NO s\'endevina: es queda pel nom');
ok(adopt.desconegut === 'ningu-coneixut', 'un nom sense did es queda tal qual');
ok(adopt.buit === '', 'i un nom buit no resol res');

console.log('\n6 · El rànquing compta una persona un cop, i dues com a dues');
const rank = await page.evaluate(async (ids) => {
  const S = window.__SOS;
  const bt = S.byId(ids.bt), bib = S.byId(ids.bib);
  const DID = 'did:sos:ed25519:ALVARO';
  const mBt = S.membersOf(bt).find(m => m.did === DID);
  const mBib = S.membersOf(bib).find(m => m.did === DID);
  const T = new Date().toISOString();
  bt.ledger = [{ id: 'r1', ts: T, type: 'temps', value: 6, sig: 'x', memberId: mBt.id, who: 'Àlvaro' }];
  bib.ledger = [{ id: 'r2', ts: T, type: 'temps', value: 4, sig: 'x', memberId: mBib.id, who: 'Alvaro Solache' }];
  await S.persist(bt); await S.persist(bib);
  const l = S.activityRanking();
  const mine = l.filter(p => p.key === 'did:' + DID);
  const roques = l.filter(p => /anna roca/i.test(p.name));
  return {
    one: mine.length === 1,
    hours: mine.length ? mine[0].donat : null,
    nodes: mine.length ? mine[0].nodes : null,
    aka: mine.length ? mine[0].aka : [],
    roques: roques.length
  };
}, seed);
ok(rank.one, 'l\'Àlvaro surt una sola vegada al rànquing, no dues');
ok(rank.hours === 10 && rank.nodes === 2, 'i amb les hores dels dos nodes sumades: ' + rank.hours + ' h');
ok(rank.aka.length === 1, 'el rànquing també sap l\'altre nom');

console.log('\n7 · Reclamar una fitxa la uneix amb la resta');
const claim = await page.evaluate(async (ids) => {
  const S = window.__SOS;
  const bt = S.byId(ids.bt);
  // Una fitxa antiga, sense did, escrita d'una tercera manera.
  const vella = S.joinNode(bt, { name: 'A. Solache' });
  await S.persist(bt);
  const before = S.activityRanking().filter(p => p.key === 'did:did:sos:ed25519:ALVARO').length;
  vella.did = 'did:sos:ed25519:ALVARO';    // com deixaria claimMember la fitxa
  await S.persist(bt);
  const me = S.knownPersons().find(p => p.dids.includes('did:sos:ed25519:ALVARO'));
  return { before, nodes: me ? me.nodes.length : 0, aka: me ? me.aka.length : 0 };
}, seed);
ok(claim.nodes === 3, 'en reclamar-la, la fitxa vella s\'uneix a la mateixa persona');
ok(claim.aka === 2, 'i els tres noms queden registrats com a variants');

console.log('\n8 · Res d\'això reescriu història signada');
const history = await page.evaluate((ids) => {
  const S = window.__SOS;
  const bt = S.byId(ids.bt);
  return {
    e1: bt.ledger.find(e => e.id === 'r1'),
    stillSigned: bt.ledger.every(e => e.sig === 'x')
  };
}, seed);
ok(history.stillSigned, 'els apunts conserven la seva signatura');
ok(history.e1 && history.e1.who === 'Àlvaro',
  'i el `who` de l\'apunt segueix sent el que es va escriure: la identitat es resol, no es reescriu');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
