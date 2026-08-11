/* V86 · El lateral passa a ser un taulell d'operacions.
   L'app sabia explicar-se i no deixava operar: tot el que et fa falta cada dia
   vivia darrere d'un modal diferent. Aquí es prova que el taulell digui l'estat
   de debò —i sobretot **la distinció que dona sentit a tot**: tenir una oferta
   no és que se't pugui trobar. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await b.newPage({ viewport: { width: 1280, height: 900 } });
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.opsState);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

console.log('\n1 · Amb nodes però sense ningú actiu, el taulell no fingeix');
/* Amb zero nodes no es veu res de tot això —mana la pantalla d'entrada, i està
   bé que mani. El cas de debò és tenir nodes i encara no tenir perfil. */
const buit = await page.evaluate(async () => {
  const S = window.__SOS;
  const n0 = S.newNode('Torrelles de Foix', 'municipi', null);
  S.state.nodes.push(n0); await S.persist(n0);
  S.state.activePersona = null; S.render();
  const box = document.querySelector('#opsPanel');
  return { txt: box.textContent.replace(/\s+/g, ' '), botons: box.querySelectorAll('button').length };
});
ok(/Encara no hi ha ningú actiu/.test(buit.txt), 'diu que no hi ha ningú i què fer');
ok(buit.botons === 1, 'amb una sola sortida, no una llista de zeros');

const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Banc de Temps de Torrelles', 'projecte', null);
  n.dynamicType = 'banc_temps';
  S.seedFromDynamic(n, S.dynById('banc_temps'));
  const m = S.newMember({ name: 'Marta Vidal' });
  S.membersOf(n).push(m);
  S.offersOf(n).push(S.newOffer({ kind: 'oferta', category: 'cuina', memberId: m.id, title: 'Cuino per a colles' }));
  S.state.nodes.push(n); await S.persist(n);
  await S.setActivePersona('Marta Vidal');
  S.render();
  return { id: n.id, mem: m.id };
});

console.log('\n══ El que importa: tenir una oferta no és que et trobin ══');

console.log('\n2 · Amb una oferta i sense publicar, el taulell ho distingeix');
const abans = await page.evaluate(() => {
  const S = window.__SOS, o = S.opsState();
  const txt = document.querySelector('#opsPanel').textContent.replace(/\s+/g, ' ');
  return { ofertes: o.ofertes, publicades: o.publicades, visible: o.visible, txt };
});
ok(abans.ofertes === 1 && abans.publicades === 0,
  'una oferta, cap publicada: ' + abans.publicades + '/' + abans.ofertes);
ok(!abans.visible && /Encara no et troben/.test(abans.txt),
  'i es diu amb totes les lletres, no amb un número sol');

console.log('\n3 · Publicant, canvia el taulell');
const desp = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  await S.setPublishScope(n, { skills: true, objects: false });
  S.render();
  const o = S.opsState();
  return { publicades: o.publicades, visible: o.visible,
    txt: document.querySelector('#opsPanel').textContent.replace(/\s+/g, ' ') };
}, seed);
ok(desp.publicades === 1 && desp.visible, 'ara 1/1 i visible');
ok(/Se’t pot trobar/.test(desp.txt), 'i el taulell ho diu: «Se’t pot trobar»');

console.log('\n4 · Publicar en un pas: una línia i ja està');
const pub = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  await S.setPublishScope(n, { skills: false, objects: false });
  S.openPublishHub();
  await new Promise(r => setTimeout(r, 150));
  const m = document.querySelector('.modal');
  const passos = m.querySelectorAll('.field').length;
  m.querySelector('#phTitle').value = 'Arreglo bicicletes';
  m.querySelector('#phGo').click();
  await new Promise(r => setTimeout(r, 400));
  const nn = S.byId(s.id);
  const nova = S.offersOf(nn).find(o => o.title === 'Arreglo bicicletes');
  return { passos, teOferta: !!nova, publica: S.publishesAnything(nn),
    obert: !!document.querySelector('.modal') };
}, seed);
ok(pub.passos <= 4, 'el formulari són ' + pub.passos + ' camps, no un recorregut');
ok(pub.teOferta, 'l\'oferta queda creada');
ok(pub.publica, 'i el node passa a publicar en la mateixa acció: era el pas que ningú feia');
ok(!pub.obert, 'i es tanca sol');

console.log('\n5 · El que se’n veu de fora segueix sent l’agregat');
const fora = await page.evaluate((s) => {
  const S = window.__SOS, n = S.byId(s.id);
  const pack = S.supplyPublicPack(n);
  const v = S.verifyNoLeak(pack);
  return { ok: v.ok, leaks: v.leaks, json: JSON.stringify(pack) };
}, seed);
ok(fora.ok, 'el paquet públic no filtra res');
ok(!/Marta Vidal/.test(fora.json) && !/Arreglo bicicletes/.test(fora.json),
  'ni el nom de qui ofereix ni el títol lliure surten de casa');

console.log('\n6 · El cost de publicar: zero mentre la caixa no pugui cobrar');
const cost = await page.evaluate((s) => {
  const S = window.__SOS, n = S.byId(s.id);
  const c0 = S.canPublish(n, s.mem);
  /* Ara amb un preu posat i sense saldo. */
  S.coopCfg(n).publicaCost = 5;
  const c1 = S.canPublish(n, s.mem);
  return { sensePreu: c0, ambPreu: c1, potCobrar: S.tpvStatus(n).potCobrar };
}, seed);
ok(cost.sensePreu.ok && cost.sensePreu.cost === 0,
  'per defecte publicar no costa res: «' + cost.sensePreu.motiu + '»');
ok(!cost.ambPreu.ok && /no et pot barrar el pas/.test(cost.ambPreu.motiu),
  'amb preu i sense manera de carregar, no barra el pas: «' + cost.ambPreu.motiu.slice(-70) + '»');

const passa = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  const off = S.newOffer({ kind: 'demanda', category: 'cures', memberId: s.mem, title: 'Necessito ajuda' });
  const r = await S.publishWithCredit(n, s.mem, off);
  return { cobrat: r.cobrat, saldo: S.walletBalance(n, s.mem).saldo };
}, seed);
ok(passa.cobrat === 0 && passa.saldo === 0,
  'i de fet publica igual i no cobra res: cobrar el que no es pot carregar seria un peatge sense pany');

console.log('\n7 · Amb saldo de debò, sí que es descompta');
const cobra = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  const o = await S.newTopUp(n, { memberId: s.mem, amount: 20 });
  const rebut = { order: o.id, import: 20, ts: new Date().toISOString() };
  await S.signRecord(rebut);
  await S.confirmTopUp(n, o.id, rebut);
  const abans = S.walletBalance(n, s.mem).saldo;
  const off = S.newOffer({ kind: 'oferta', category: 'jardineria', memberId: s.mem, title: 'Podo' });
  const r = await S.publishWithCredit(n, s.mem, off);
  return { abans, cobrat: r.cobrat, despres: S.walletBalance(n, s.mem).saldo };
}, seed);
ok(cobra.abans === 20 && cobra.cobrat === 5 && cobra.despres === 15,
  'de ' + cobra.abans + ' a ' + cobra.despres + ': el cost surt del moneder com un apunt més');

console.log('\n8 · El taulell hi és sense tapar l’arbre de territoris');
const conviu = await page.evaluate(() => ({
  ops: !!document.querySelector('#opsPanel .ops-row'),
  arbre: !!document.querySelector('#treeList .tree-node'),
  ordre: [...document.querySelectorAll('.tree > div')].map(d => d.id || d.className).join(',')
}));
ok(conviu.ops && conviu.arbre, 'hi ha taulell i hi ha arbre');
ok(/^opsPanel,/.test(conviu.ordre),
  'i el taulell va davant de tot, capçalera inclosa: ' + conviu.ordre);

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
