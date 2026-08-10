/* V74 · Connectar el que penja de tu.
   Ampliar el selector era la part fàcil. El que es prova aquí és la part que
   importa: que enllaçar un fill NO faci doble comptatge, perquè `rollup()` ja
   l'agrega cap amunt i el fons distingeix «verificat» d'«estimat». Un número
   inflat amb aparença de verificat és el pitjor que li pot passar a això. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.linkCandidates);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

/* Una comarca amb una MATRIU, i sota la MATRIU un banc de temps municipal.
   A part, un germà de la MATRIU i un projecte d'una altra comarca. */
const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const mk = (name, type, parentId, lvl) => {
    const n = S.newNode(name, lvl || 'projecte', parentId || null);
    if (type) { n.dynamicType = type; S.seedFromDynamic(n, S.dynById(type)); }
    n.offers = []; n.objects = []; n.ledger = [];
    S.state.nodes.push(n); return n;
  };
  const comarca = mk('Alt Penedès', null, null, 'comarca');
  const matriu = mk('MATRIU del Penedès', 'matriu', comarca.id);
  const fill = mk('Banc de Temps de Vilafranca', 'banc_temps', matriu.id);
  const germa = mk('Biblioteca de les Coses', 'biblioteca_coses', comarca.id);
  const lluny = mk('Banc de Temps del Garraf', 'banc_temps', null);

  const oferta = (n, k) => { for (let i = 0; i < k; i++) S.offersOf(n).push(S.newOffer({ kind: 'oferta', category: 'cures' })); };
  oferta(fill, 5); oferta(lluny, 3);
  for (let i = 0; i < 4; i++) S.objectesPush ? 0 : S.objectsOf(germa).push(S.newObject({ name: 'Objecte ' + i }));
  for (const n of S.state.nodes) await S.persist(n);
  return { comarca: comarca.id, matriu: matriu.id, fill: fill.id, germa: germa.id, lluny: lluny.id };
});

console.log('\n1 · Ara els fills hi surten — que era el que no passava');
const cand = await page.evaluate((s) => {
  const S = window.__SOS;
  const c = S.linkCandidates(S.byId(s.matriu));
  return {
    propis: c.propis.map(n => n.name), germans: c.germans.map(n => n.name),
    fora: c.fora.map(n => n.name)
  };
}, seed);
ok(cand.propis.includes('Banc de Temps de Vilafranca'),
  'el banc de temps que penja de la MATRIU hi és: ' + cand.propis.join(', '));
ok(cand.germans.includes('Biblioteca de les Coses'),
  'i els germans segueixen sortint: ' + cand.germans.join(', '));
ok(cand.fora.includes('Banc de Temps del Garraf'),
  'i la resta de la xarxa hi és, però a part: ' + cand.fora.join(', '));

console.log('\n2 · Els grups no es trepitgen i un node no s\'ofereix a si mateix');
const nets = await page.evaluate((s) => {
  const S = window.__SOS;
  const c = S.linkCandidates(S.byId(s.matriu));
  const tots = [...c.propis, ...c.germans, ...c.fora].map(n => n.id);
  return { dup: tots.length !== new Set(tots).size, jo: tots.includes(s.matriu) };
}, seed);
ok(!nets.dup, 'cap node surt a dos grups alhora');
ok(!nets.jo, 'i la MATRIU no s\'ofereix a si mateixa');

console.log('\n3 · El que ja està connectat deixa de sortir');
const ja = await page.evaluate(async (s) => {
  const S = window.__SOS;
  const m = S.byId(s.matriu);
  S.linksOf(m).push(s.fill); await S.persist(m);
  const c = S.linkCandidates(m);
  return c.propis.map(n => n.id);
}, seed);
ok(!ja.includes(seed.fill), 'un recurs connectat no es torna a oferir');

console.log('\n══ El que de debò importa: el doble comptatge ══');

console.log('\n4 · Un fill connectat NO suma al total de fora');
const dob = await page.evaluate(async (s) => {
  const S = window.__SOS;
  const m = S.byId(s.matriu);
  const r = S.ecosystemResources(m);           // ja té el fill connectat de §3
  return { hores: r.hores, propies: r.horesPropies, propis: r.propis.length, defora: r.defora.length };
}, seed);
ok(dob.propies === 5, 'les 5 ofertes del fill es compten a part: horesPropies=' + dob.propies);
ok(dob.hores === 0, 'i NO se sumen al total d\'ofertes de fora (' + dob.hores + ')');
ok(dob.propis === 1 && dob.defora === 0, 'els enllaços queden classificats: 1 propi, 0 de fora');

console.log('\n5 · Un que NO penja de tu sí que suma, perquè no entra per cap altra banda');
const fora = await page.evaluate(async (s) => {
  const S = window.__SOS;
  const m = S.byId(s.matriu);
  S.linksOf(m).push(s.lluny); await S.persist(m);
  const r = S.ecosystemResources(m);
  return { hores: r.hores, propies: r.horesPropies, defora: r.defora.length };
}, seed);
ok(fora.hores === 3, 'les 3 ofertes del node de fora sí que sumen');
ok(fora.propies === 5, 'i les pròpies segueixen a part, sense barrejar-se');
ok(fora.defora === 1, 'un enllaç de fora');

console.log('\n6 · La suma de tots dos no és el que es publica com a total');
const total = await page.evaluate((s) => {
  const S = window.__SOS;
  const r = S.ecosystemResources(S.byId(s.matriu));
  return { mostrat: r.hores, siHoSumessim: r.hores + r.horesPropies };
}, seed);
ok(total.mostrat === 3 && total.siHoSumessim === 8,
  'es mostren 3, no 8: sumar-los seria comptar el fill dues vegades (rollup ja l\'agrega)');

console.log('\n7 · A la pantalla es diu, no s\'amaga');
const ui = await page.evaluate(async (s) => {
  const S = window.__SOS;
  S.selectNode(s.matriu);
  await new Promise(r => setTimeout(r, 120));
  S.state.tab = 'ecosistema';
  S.render(); await new Promise(r => setTimeout(r, 200));
  const txt = document.querySelector('#workspace').textContent;
  return {
    avis: /ja compten a l'agregat/.test(txt),
    noSumen: /no se sumen a mà/.test(txt),
    propies: /pròpies/.test(txt)
  };
}, seed);
ok(ui.avis, 'l\'avís hi és: els propis ja compten a l\'agregat');
ok(ui.noSumen, 'i es diu la regla: propi i agregat no se sumen a mà');
ok(ui.propies, 'i el comptador ensenya les pròpies a part');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
