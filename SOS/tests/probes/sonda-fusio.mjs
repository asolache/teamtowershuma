/* SONDA — no és un test, és la prova d'un defecte obert (E1 del backlog de beta).
   ─────────────────────────────────────────────────────────────────────────────
   Viu a `probes/` i no a `tests/` a posta: `run.mjs` només recull `test-*.mjs`
   del seu propi directori, així que això no fa vermella la suite. No és un test
   perquè encara no hi ha res a protegir — descriu el que passa avui.

   Què demostra: `mergeIncoming` resol els nodes per **LWW de node sencer**, i el
   ledger, els socis, els objectes i les ofertes viuen a dins del node. Dues
   persones que apunten sense estar connectades i després sincronitzen **perden
   el que va apuntar la que té l'`updatedAt` més antic**. Sense avís i sense
   rastre.

   El xat ja se salva perquè es fusiona per unió abans del LWW. El raonament
   escrit al codi per fer-ho —«el que es perd en un xat no es recupera de cap
   altra banda»— val igual per al ledger, amb l'agreujant que un missatge es pot
   tornar a escriure i una hora treballada no.

   Quan E1 estigui fet, això es converteix en `test-fusio.mjs` amb les
   assercions girades: els dos apunts hi han de ser.

       node SOS/tests/probes/sonda-fusio.mjs
*/
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'index.html');
const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await b.newPage();
page.on('pageerror', e => console.log('  pageerror: ' + e.message));
await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.mergeIncoming);

console.log('\nSonda 1 · dues persones apunten hores sense estar connectades');
const led = await page.evaluate(async () => {
  const S = window.__SOS;
  const bt = S.newNode('Banc de Temps', 'projecte', null); bt.dynamicType = 'banc_temps';
  bt.ledger = [{ id: 'base', type: 'temps', value: 1, who: 'Base', sig: 'x' }];
  S.state.nodes.push(bt); await S.persist(bt);

  // La còpia que l'Anna es va endur al seu SOS, abans que cap dels dos apuntés.
  const anna = JSON.parse(JSON.stringify(bt));

  // El Bru apunta 3 h al seu dispositiu.
  bt.ledger.push({ id: 'bru', type: 'temps', value: 3, who: 'Bru', sig: 'x' });
  await S.persist(bt);

  // L'Anna apunta 5 h un segon més tard al seu.
  anna.ledger.push({ id: 'anna', type: 'temps', value: 5, who: 'Anna', sig: 'x' });
  anna.updatedAt = new Date(Date.parse(bt.updatedAt) + 1000).toISOString();

  await S.mergeIncoming({ nodes: [anna], entities: [], tombstones: {} });
  return (S.byId(bt.id).ledger || []).map(e => e.id);
});
const lost = ['base', 'bru', 'anna'].filter(x => !led.includes(x));
console.log('  ledger després de sincronitzar: ' + JSON.stringify(led));
console.log(lost.length
  ? '  ✗ s\'ha perdut: ' + lost.join(', ') + ' — hores signades que ja no hi són'
  : '  ✓ unió correcta, els dos apunts hi són');

console.log('\nSonda 2 · i els socis que s\'han apuntat mentrestant');
const mem = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Biblioteca', 'projecte', null); n.dynamicType = 'biblioteca_coses';
  S.state.nodes.push(n); await S.persist(n);
  const copy = JSON.parse(JSON.stringify(n));

  S.joinNode(n, { name: 'Bru Soler' }); await S.persist(n);
  copy.members = (copy.members || []).concat([{ id: 'm-anna', name: 'Anna Puig', kind: 'persona' }]);
  copy.updatedAt = new Date(Date.parse(n.updatedAt) + 1000).toISOString();

  await S.mergeIncoming({ nodes: [copy], entities: [], tombstones: {} });
  return S.membersOf(S.byId(n.id)).map(x => x.name);
});
console.log('  socis després de sincronitzar: ' + JSON.stringify(mem));
console.log(mem.length === 2
  ? '  ✓ hi són tots dos'
  : '  ✗ només en queda un: qui es va apuntar al dispositiu que perd el LWW ja no existeix');

console.log('\nEl xat, en canvi, se salva: es fusiona per unió abans del LWW.');
console.log('E1 del backlog de beta és estendre aquesta unió a la resta.\n');
await b.close();
