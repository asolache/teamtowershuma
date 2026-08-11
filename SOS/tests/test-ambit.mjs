/* V82 · E5 · Sincronitzar només el que porta informació.
   `hello` enviava el SOS sencer. En un cas de comarca normal, 121 nodes de 122
   són esquelet geogràfic buit: la càrrega no és el que la gent ha fet, és el
   bastiment. Aquí es mesura que baixi de debò —no que «hauria de baixar»— i,
   sobretot, que baixant **no es perdi res**, que és l'única manera que això té
   de sortir malament. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const obre = async (nom) => {
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  p.on('pageerror', e => { fail++; console.log('  ✗ pageerror(' + nom + '): ' + e.message); });
  await p.goto(APP);
  await p.waitForFunction(() => window.__SOS && window.__SOS.syncIndex);
  await p.evaluate(async (n) => {
    await window.__SOS.markOnboardingDone();
    await window.__SOS.setActivePersona(n);
  }, nom);
  return p;
};

/* Una comarca com les de debò: molts nodes geogràfics i poca cosa a dins. */
const comarca = async (pg) => pg.evaluate(async () => {
  const S = window.__SOS;
  const com = S.newNode('Alt Penedès', 'comarca', null);
  S.state.nodes.push(com); await S.persist(com);
  for (let i = 0; i < 30; i++) {
    const m = S.newNode('Municipi ' + i, 'municipi', com.id);
    S.state.nodes.push(m); await S.persist(m);
    for (let j = 0; j < 3; j++) {
      const bar = S.newNode('Barri ' + i + '-' + j, 'barri', m.id);
      S.state.nodes.push(bar); await S.persist(bar);
    }
  }
  return S.state.nodes.length;
});

const A = await obre('Anna Camp');
const B = await obre('Blai Roig');
const nA = await comarca(A);

console.log('\n1 · La mesura: què és el que pesava');
const mida = await A.evaluate(() => {
  const S = window.__SOS;
  const sencer = JSON.stringify({ type: 'hello', me: {}, nodes: S.state.nodes,
    entities: S.state.entities, tombstones: S.state.tombstones }).length;
  const nou = JSON.stringify({ type: 'hello', proto: S.SYNC_PROTO, me: {},
    idx: S.syncIndex(), tombstones: S.state.tombstones }).length;
  return { nodes: S.state.nodes.length, sencer, nou,
    ambCos: S.state.nodes.filter(n => S.nodeHasSubstance(n)).length };
});
ok(mida.ambCos === 0,
  mida.nodes + ' nodes i cap amb contingut humà: tot és esquelet');
ok(mida.nou < mida.sencer / 3,
  'la salutació passa de ' + Math.round(mida.sencer / 1024) + ' KB a ' +
  Math.round(mida.nou / 1024) + ' KB (' + Math.round(mida.nou * 100 / mida.sencer) + ' %)');

console.log('\n2 · Un esquelet viatja com a esquelet i es reconstrueix igual');
const stub = await A.evaluate(() => {
  const S = window.__SOS;
  const n = S.state.nodes.find(x => x.nodeLevel === 'municipi');
  const s = S.syncStub(n);
  const tornat = S.expandStub(JSON.parse(JSON.stringify(s)));
  const iguals = ['id', 'name', 'nodeLevel', 'parentId', 'updatedAt'].every(k => tornat[k] === n[k]);
  return { abans: JSON.stringify(n).length, stub: JSON.stringify(s).length, iguals,
    teVna: !!(tornat.vna && tornat.vna.roles), teKanban: !!tornat.kanban, teLedger: Array.isArray(tornat.ledger) };
});
/* Un 38 % per node, no el 60 % que semblava a ull: les dues dates ISO són un
   terç del que queda. L'estalvi gros és l'altre —no tornar a enviar el que ja
   tens—, i val més que el número d'aquí digui la veritat. */
ok(stub.stub < stub.abans * 0.7,
  'de ' + stub.abans + ' a ' + stub.stub + ' bytes per node d\'esquelet (' +
  Math.round(stub.stub * 100 / stub.abans) + ' %)');
ok(stub.iguals && stub.teVna && stub.teKanban && stub.teLedger,
  'i en arribar torna a ser un node complet, amb els valors per defecte de sempre');

console.log('\n══ El que importa: que estalviar no perdi res ══');

console.log('\n3 · Amb feina de debò, arriba tot');
await A.evaluate(async () => {
  const S = window.__SOS;
  const pare = S.state.nodes.find(x => x.nodeLevel === 'municipi');
  const n = S.newNode('Banc de Temps de Vilafranca', 'projecte', pare.id);
  n.dynamicType = 'banc_temps';
  S.seedFromDynamic(n, S.dynById('banc_temps'));
  const m = S.newMember({ name: 'Marta Vidal' });
  S.membersOf(n).push(m);
  S.offersOf(n).push(S.newOffer({ kind: 'oferta', category: 'cuina', memberId: m.id, title: 'Cuinar per a colles' }));
  await S.pushLedger(n.ledger, { id: 'v1', ts: '2026-06-01T09:00:00Z', type: 'temps', value: 4,
    memberId: m.id, category: 'cuina' });
  S.state.nodes.push(n); await S.persist(n);
});

const empalma = async (x, y) => {
  const o = await x.evaluate(() => window.__SOS.syncCreateOffer());
  const r = await y.evaluate(c => window.__SOS.syncAcceptOffer(c), o);
  await x.evaluate(c => window.__SOS.syncAcceptAnswer(c), r);
  const espera = pg => pg.waitForFunction(
    () => window.__SOS.syncSessions().some(s => s.estat === 'open'), null, { timeout: 15000 });
  await Promise.all([espera(x), espera(y)]);
};
await empalma(A, B);

let rebut = false;
try {
  await B.waitForFunction(() => window.__SOS.state.nodes.length > 100 &&
    window.__SOS.state.nodes.some(n => /Banc de Temps de Vilafranca/.test(n.name)),
    null, { timeout: 20000 });
  rebut = true;
} catch (e) { /* ho diu l'asserció */ }
ok(rebut, 'la B rep la comarca sencera i el node amb feina');

const complet = await B.evaluate(() => {
  const S = window.__SOS;
  const n = S.state.nodes.find(x => /Vilafranca/.test(x.name));
  return { nodes: S.state.nodes.length, socis: n ? S.membersOf(n).length : 0,
    ofertes: n ? S.offersOf(n).length : 0, apunts: n ? (n.ledger || []).length : 0,
    tipus: n ? n.dynamicType : '', mapa: n ? ((n.vna && n.vna.roles) || []).length : 0 };
});
ok(complet.nodes === nA + 1, 'hi són tots els nodes (' + complet.nodes + ' de ' + (nA + 1) + ')');
ok(complet.socis === 1 && complet.ofertes === 1 && complet.apunts === 1,
  'i el que porta contingut arriba sencer: soci, oferta i apunt');
ok(complet.tipus === 'banc_temps' && complet.mapa > 0,
  'amb el tipus de dinàmica i el mapa de valor, que no són camps d\'esquelet');

console.log('\n4 · Tornar a sincronitzar ja no mou res');
const segona = await A.evaluate(() => {
  const S = window.__SOS;
  /* El que l'altre costat demanaria del meu índex si tornéssim a començar. */
  return { vol: S.syncWant(S.syncIndex()).length };
});
ok(segona.vol === 0,
  'amb tot al dia, del propi índex no se n\'ha de demanar res (' + segona.vol + ')');
const creuat = await B.evaluate(async () => {
  const S = window.__SOS;
  return S.syncWant(S.syncIndex()).length;
});
ok(creuat === 0, 'i per la banda de la B, igual');

console.log('\n5 · La guarda: un esquelet no pot buidar un node amb contingut');
const guarda = await B.evaluate(async () => {
  const S = window.__SOS;
  const n = S.state.nodes.find(x => /Vilafranca/.test(x.name));
  const abans = { socis: S.membersOf(n).length, mapa: ((n.vna && n.vna.roles) || []).length,
    tipus: n.dynamicType };
  /* Un esquelet del MATEIX node, més nou. És el cas real: algú amb el node buit
     el toca i el seu `updatedAt` passa a ser el més recent. */
  const fals = { _stub: 1, id: n.id, name: n.name, nodeLevel: n.nodeLevel,
    parentId: n.parentId, createdAt: n.createdAt, updatedAt: new Date(Date.now() + 60000).toISOString() };
  await S.mergeIncoming({ nodes: [S.expandStub(fals)], entities: [], tombstones: {} });
  const d = S.byId(n.id);
  return { abans, despres: { socis: S.membersOf(d).length,
    mapa: ((d.vna && d.vna.roles) || []).length, tipus: d.dynamicType } };
});
ok(guarda.despres.socis === guarda.abans.socis && guarda.despres.socis > 0,
  'els socis no es perden (' + guarda.despres.socis + ')');
ok(guarda.despres.mapa === guarda.abans.mapa && guarda.despres.mapa > 0,
  'ni el mapa de valor, que no és un camp que s\'uneixi: ' + guarda.despres.mapa + ' rols');
ok(guarda.despres.tipus === 'banc_temps',
  'ni el tipus de dinàmica: seguiria sent un banc de temps');

console.log('\n6 · I un node nou de debò segueix arribant');
await B.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Biblioteca del Vendrell', 'projecte', null);
  n.dynamicType = 'biblioteca_coses';
  S.seedFromDynamic(n, S.dynById('biblioteca_coses'));
  S.state.nodes.push(n); await S.persist(n);
});
let nou = false;
try {
  await A.waitForFunction(() => window.__SOS.state.nodes.some(n => /Biblioteca del Vendrell/.test(n.name)),
    null, { timeout: 12000 });
  nou = true;
} catch (e) { /* ho diu l'asserció */ }
ok(nou, 'estalviar no vol dir tancar-se: el que és nou segueix viatjant');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
