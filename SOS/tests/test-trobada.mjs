/* V80 · E4 · Més d'un company alhora.
   Abans, cada aparellament tancava l'anterior: una trobada de tres persones eren
   tres torns. Canviar el singleton per un mapa és la meitat fàcil; la que
   importa és la segona —amb A↔B i A↔C oberts, un canvi de la B **no arribava
   mai a la C**, i tres persones connectades seguien sent dues converses.

   Això es prova amb tres SOS de debò parlant per WebRTC, no amb mocks: el que
   podria fallar (canals, reenviament, bucles) no es veu de cap altra manera. */
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
  await p.waitForFunction(() => window.__SOS && window.__SOS.syncSessions);
  await p.evaluate(async (n) => {
    const S = window.__SOS;
    await S.markOnboardingDone();
    await S.setActivePersona(n);
  }, nom);
  return p;
};

/* A al mig, B i C a les bandes. És la forma que té una trobada real: qui convoca
   té la connexió amb tothom, i els altres no es coneixen entre ells. */
const A = await obre('Anna Camp');
const B = await obre('Blai Roig');
const C = await obre('Cesc Duran');

const empalma = async (x, y) => {
  const oferta = await x.evaluate(() => window.__SOS.syncCreateOffer());
  const resposta = await y.evaluate(o => window.__SOS.syncAcceptOffer(o), oferta);
  await x.evaluate(r => window.__SOS.syncAcceptAnswer(r), resposta);
  /* Que el canal estigui obert de debò abans de seguir. Sense això, el test
     mesuraria la velocitat de la màquina i no el codi. */
  const espera = pg => pg.waitForFunction(
    () => window.__SOS.syncSessions().some(s => s.estat === 'open'), null, { timeout: 15000 });
  await Promise.all([espera(x), espera(y)]);
};

console.log('\n1 · Dues connexions alhora, i cap tanca l\'altra');
let empalmat = true;
try {
  await empalma(A, B);
  await empalma(A, C);
} catch (e) { empalmat = false; console.log('  ⚠ no s\'ha pogut establir WebRTC: ' + e.message); }
ok(empalmat, 'A s\'ha connectat amb B i amb C');

const sess = await A.evaluate(() => window.__SOS.syncSessions());
ok(sess.filter(s => s.estat === 'open').length === 2,
  'l\'A té ' + sess.filter(s => s.estat === 'open').length + ' sessions obertes alhora');
const peers = await A.evaluate(() => window.__SOS.syncPeers().map(p => p.name));
ok(peers.length === 2 && peers.some(n => /Blai/.test(n)) && peers.some(n => /Cesc/.test(n)),
  'i les veu totes dues: ' + peers.join(' · '));

console.log('\n2 · La presència ensenya els dos, no només l\'últim');
const presencia = await A.evaluate(() => window.__SOS.presenceState().online
  .filter(p => p.via === 'canal obert').map(p => p.name));
ok(presencia.length === 2, 'a la pantalla de gent hi surten tots dos (' + presencia.length + ')');

console.log('\n══ El que importa: que una trobada de tres sigui una trobada ══');

console.log('\n3 · El que crea la B arriba a la C, que no hi està connectada');
await B.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Biblioteca de les Coses de Gràcia', 'projecte', null);
  n.dynamicType = 'biblioteca_coses';
  S.seedFromDynamic(n, S.dynById('biblioteca_coses'));
  S.state.nodes.push(n);
  await S.persist(n);
});
const arriba = async (pg) => {
  try {
    await pg.waitForFunction(
      () => window.__SOS.state.nodes.some(n => /Biblioteca de les Coses de Gràcia/.test(n.name)),
      null, { timeout: 12000 });
    return true;
  } catch (e) { return false; }
};
ok(await arriba(A), 'l\'A el rep (està connectada amb la B)');
ok(await arriba(C),
  'i la C també, sense estar connectada amb la B: l\'A l\'ha reenviat');

console.log('\n4 · I al revés, perquè no sigui una casualitat de direcció');
await C.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Comunitat Energètica del Poble-sec', 'projecte', null);
  S.state.nodes.push(n);
  await S.persist(n);
});
const arribaCE = async (pg) => {
  try {
    await pg.waitForFunction(
      () => window.__SOS.state.nodes.some(n => /Comunitat Energètica del Poble-sec/.test(n.name)),
      null, { timeout: 12000 });
    return true;
  } catch (e) { return false; }
};
ok(await arribaCE(B), 'el que crea la C arriba a la B pel mateix camí');

console.log('\n5 · I no fa voltes: el mateix canvi no torna mai');
/* La prova del bucle: si el reenviament no filtrés pel `mid`, el triangle es
   passaria el mateix apunt per sempre i el node apareixeria duplicat o el
   comptador de missatges no pararia de créixer. */
const voltes = await A.evaluate(async () => {
  const S = window.__SOS;
  const abans = S.state.nodes.length;
  /* Un patch que ja s'ha vist: reenviar-lo ha de ser un no-res. */
  const mid = 'mid-de-prova';
  const primer = S.syncBroadcast(null, 'node', { mid });
  const segon = S.syncBroadcast(null, 'node', { mid });
  await new Promise(r => setTimeout(r, 600));
  return { abans, despres: S.state.nodes.length, primer, segon };
});
ok(voltes.abans === voltes.despres,
  'cap node duplicat després de l\'anada i tornada (' + voltes.despres + ')');

const dup = await Promise.all([A, B, C].map(p => p.evaluate(() =>
  window.__SOS.state.nodes.filter(n => /Biblioteca de les Coses de Gràcia/.test(n.name)).length)));
ok(dup.every(n => n === 1), 'i el node reenviat existeix un sol cop a cada SOS: ' + dup.join(' · '));

console.log('\n6 · Tancar-ne una no tanca les altres');
/* Es tanca **una** sessió a posta, que és el cas que es pot provar de veritat:
   un company que desapareix sense avisar no es nota fins que venç la connexió,
   i esperar-ho aquí seria mesurar el temps d'espera de WebRTC, no el codi. */
const tanc = await A.evaluate(async () => {
  const S = window.__SOS;
  const obertes = S.syncSessions().filter(s => s.estat === 'open');
  const quiEra = obertes[0].peer ? obertes[0].peer.name : '';
  const n = S.syncDisconnect(obertes[0].id);
  await new Promise(r => setTimeout(r, 300));
  return { abans: obertes.length, tancades: n, quiEra,
    queden: S.syncSessions().filter(s => s.estat === 'open').length,
    peers: S.syncPeers().map(p => p.name) };
});
ok(tanc.abans === 2 && tanc.tancades === 1 && tanc.queden === 1,
  'se n\'acaba una i en queda una oberta, no cap');
ok(tanc.peers.length === 1 && tanc.peers[0] !== tanc.quiEra,
  'i la que queda és l\'altra: ' + tanc.peers.join(' · ') + ' (s\'ha acabat la de ' + tanc.quiEra + ')');

console.log('\n7 · I el que queda obert segueix funcionant');
await C.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Cures del Raval', 'projecte', null);
  S.state.nodes.push(n); await S.persist(n);
});
let segueix = false;
try {
  await A.waitForFunction(() => window.__SOS.state.nodes.some(n => /Cures del Raval/.test(n.name)),
    null, { timeout: 12000 });
  segueix = true;
} catch (e) { /* ho dirà l'asserció */ }
ok(segueix, 'acabar una sessió no ha trencat l\'altra');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
