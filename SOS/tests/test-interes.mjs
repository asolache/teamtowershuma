/* L'interès · dir «m'interessa» no és apuntar res
   (backlog, «Els fluxos de comunicació entre persones»; pla-millora-sos.md, punt 4)

   Abans, davant d'una oferta d'hores, el botó obria «Registra un intercanvi» i
   et demanava les hores d'una feina que encara no havies fet. El que es prova:

   · **Que dir que t'interessa no toqui res compartit**: ni el registre, ni els
     pendents de confirmar, ni la llista de socis del node.
   · **Que no es perdi**: surt a «Les meves tasques» fins que es tanca.
   · **Que apuntar-ho després funcioni com sempre**, i que l'interès només es
     tanqui quan l'apunt s'ha desat.
   · **Que deixar-ho el tanqui dient-ho**, sense esborrar-lo. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.interesNou);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

/* Un banc de temps amb dues persones: la Gina ofereix podar i en Pere busca
   qui li porti caixes. Qui mira és la Marta, que encara no n'és sòcia. */
const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Banc de temps de Foix', 'projecte', null);
  n.dynamicType = 'banc_temps'; S.seedFromDynamic(n, S.dynById('banc_temps'));
  const gina = S.newMember({ name: 'Gina Roca' }), pere = S.newMember({ name: 'Pere Mas' });
  S.membersOf(n).push(gina, pere);
  S.offersOf(n).push(S.newOffer({ kind: 'oferta', category: 'jardineria', memberId: gina.id, title: 'Podar' }));
  S.offersOf(n).push(S.newOffer({ kind: 'demanda', category: 'transport', memberId: pere.id, title: 'Portar caixes' }));
  S.state.nodes.push(n); await S.persist(n);
  S.setActivePersona('Marta Vidal');
  return { n: n.id, gina: gina.id, pere: pere.id };
});

const estat = () => page.evaluate((s) => {
  const S = window.__SOS, n = S.byId(s.n);
  return { apunts: (n.ledger || []).length, pendents: S.pendingOf(n).length, socis: S.membersOf(n).length,
    oberts: S.interessosOberts().length, tots: S.interessosLlegeix().length };
}, seed);

console.log('\n1 · «M\'interessa» no toca res compartit');
const abans = await estat();
const botons = await page.evaluate((s) => {
  const S = window.__SOS;
  const files = S.supplyIndex().filter(x => x.node.id === s.n && x.kind === 'habilitat');
  return files.map(x => { const a = S.supplyAction(x); a.fn(); return x.dir + ' · ' + a.label; });
}, seed);
const despres = await estat();
ok(botons.length === 2 && botons.every(l => /interessa/i.test(l)),
  'els dos botons diuen el que fan: ' + botons.join(' | '));
ok(!(await page.evaluate(() => !!document.querySelector('#exSave'))),
  'i cap obre «Registra un intercanvi»');
ok(despres.apunts === abans.apunts && despres.pendents === abans.pendents,
  'ni el registre ni els pendents es mouen: ' + despres.apunts + ' apunts, ' + despres.pendents + ' pendents');
ok(despres.socis === abans.socis, 'i la Marta no queda apuntada com a sòcia del node');
ok(despres.oberts === 2, 'queden dos interessos oberts, al navegador de qui els ha dit');

console.log('\n2 · Dir-ho dues vegades no en fa dos');
{
  await page.evaluate((s) => {
    const S = window.__SOS;
    S.supplyIndex().filter(x => x.node.id === s.n && x.kind === 'habilitat').forEach(x => S.supplyAction(x).fn());
  }, seed);
  ok((await estat()).oberts === 2, 'segueixen sent dos');
}

console.log('\n3 · No es perd: surt a «Les meves tasques»');
const tasques = await page.evaluate(() =>
  window.__SOS.lesMevesTasques({}).filter(t => t.kind === 'interes').map(t => t.title));
ok(tasques.length === 2, 'dues tasques d\'interès: ' + tasques.join(' | '));
ok(tasques.some(t => /Podar · Gina Roca/.test(t)), 'amb què és i amb qui');

console.log('\n4 · Apuntar-ho, quan ja està fet, va pel camí de sempre');
{
  await page.evaluate(() => {
    const S = window.__SOS, it = S.interessosOberts().find(i => i.que === 'Podar');
    S.openInteres(it);
  });
  await page.click('#inFet');
  await page.waitForSelector('#exSave');
  const pre = await page.evaluate((s) => {
    const q = id => document.querySelector(id);
    const S = window.__SOS, n = S.byId(s.n);
    const marta = S.membersOf(n).find(m => m.name === 'Marta Vidal');
    return { what: q('#exWhat').value, from: q('#exFrom').value, to: q('#exTo').value,
      gina: s.gina, marta: marta && marta.id, oberts: S.interessosOberts().length };
  }, seed);
  ok(pre.what === 'Podar', 'el formulari ja porta què era');
  ok(pre.from === pre.gina && pre.to === pre.marta, 'i qui dona (la Gina) i qui rep (la Marta)');
  ok(pre.oberts === 2, 'obrir el formulari encara no tanca l\'interès');
  await page.fill('#exH', '2');
  await page.click('#exSave');
  await page.waitForFunction(() => !document.querySelector('#exSave'));
  await page.waitForTimeout(300);
  const fet = await estat();
  ok(fet.pendents + fet.apunts > despres.pendents + despres.apunts,
    'ara sí que hi ha un apunt, pendent que la Gina el confirmi');
  ok(fet.oberts === 1, 'i l\'interès de podar es tanca');
  const tancat = await page.evaluate(() => window.__SOS.interessosLlegeix().find(i => i.que === 'Podar').tancat);
  ok(tancat && tancat.motiu === 'apuntat', 'tancat amb el motiu: «' + (tancat && tancat.motiu) + '»');
}

console.log('\n5 · Deixar-ho el tanca dient-ho, i no l\'esborra');
{
  await page.evaluate(() => {
    const S = window.__SOS; S.openInteres(S.interessosOberts()[0]);
  });
  await page.click('#inDeixa');
  const r = await estat();
  const motius = await page.evaluate(() => window.__SOS.interessosLlegeix().map(i => i.tancat && i.tancat.motiu));
  ok(r.oberts === 0, 'no en queda cap d\'obert');
  ok(r.tots === 2 && motius.includes('deixat'), 'però tots dos hi són, amb el motiu: ' + motius.join(', '));
  const t = await page.evaluate(() => window.__SOS.lesMevesTasques({}).filter(x => x.kind === 'interes').length);
  ok(t === 0, 'i ja no surten a la safata');
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
