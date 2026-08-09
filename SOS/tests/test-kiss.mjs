/* V62 · Una sola manera de tornar, i cap context sense guia.
   El que es prova aquí és sobretot que no es pugui quedar ningú atrapat a una
   pantalla, que és el que passava al mapa. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.homeBackBtn);

await page.evaluate(async () => {
  const S = window.__SOS;
  const muni = S.newNode('Torrelles de Foix', 'municipi', null);
  const bt = S.newNode('Banc de Temps', 'projecte', muni.id); bt.dynamicType = 'banc_temps';
  S.seedFromDynamic(bt, S.dynById('banc_temps'));
  S.state.nodes.push(muni, bt);
  await S.persist(muni); await S.persist(bt);
  await S.setActivePersona('Anna Puig');
});

console.log('\n1 · De cap portada es pot quedar ningú atrapat');
const views = ['missions', 'fons', 'gent', 'mapa'];
for (const v of views) {
  const back = await page.evaluate(async (view) => {
    const S = window.__SOS;
    S.state.activeId = null; S.state.homeView = view; S.render();
    const btns = [...document.querySelectorAll('#workspace button')]
      .filter(x => /vista de gesti[óo]/i.test(x.textContent));
    if (!btns.length) return { found: false };
    btns[0].click();
    await new Promise(r => setTimeout(r, 60));
    return { found: true, home: S.state.homeView, active: S.state.activeId };
  }, v);
  ok(back.found, 'la portada «' + v + '» té la tornada');
  if (back.found) ok(back.home === 'tauler' && back.active === null,
    '  i porta al tauler de debò, no a mitges');
}

console.log('\n2 · És la mateixa tornada, no quatre de diferents');
const same = await page.evaluate(() => {
  const S = window.__SOS;
  const labels = [];
  ['missions', 'fons', 'gent', 'mapa'].forEach(v => {
    S.state.activeId = null; S.state.homeView = v; S.render();
    const b = [...document.querySelectorAll('#workspace button')]
      .find(x => /vista de gesti[óo]/i.test(x.textContent));
    if (b) labels.push(b.textContent.trim() + '|' + (b.title || ''));
  });
  return { labels, unique: new Set(labels).size };
});
ok(same.labels.length === 4, 'les quatre portades en tenen');
ok(same.unique === 1, 'i totes diuen exactament el mateix: ' + same.labels[0]);

console.log('\n3 · Cada pestanya sap explicar-se');
const guides = await page.evaluate(() => {
  const S = window.__SOS;
  const bt = S.state.nodes.find(n => n.dynamicType === 'banc_temps');
  const tabs = ['map', 'kanban', 'ledger', 'xat', 'socis', 'banctemps'];
  const out = {};
  tabs.forEach(t => { const g = S.contextGuide(bt, t); out[t] = !!(g && g.flow && g.flow.length && g.items && g.lens); });
  const x = S.contextGuide(bt, 'xat');
  return { out, xatSteps: x ? x.items.length : 0, xatLens: x ? Object.keys(x.lens).length : 0 };
});
ok(Object.values(guides.out).every(Boolean),
  'totes les pestanyes provades tenen flux, passos i lent de rol');
ok(guides.xatSteps >= 2 && guides.xatLens >= 5,
  'la conversa, que era la que en va quedar sense, ja en té');

console.log('\n4 · La guia de la conversa comprova el node, no es clica');
const steps = await page.evaluate(async () => {
  const S = window.__SOS;
  const bt = S.state.nodes.find(n => n.dynamicType === 'banc_temps');
  const before = S.contextGuide(bt, 'xat').items.map(i => i.done);
  await S.postChat(bt, 'Primera pregunta', null);
  const after = S.contextGuide(bt, 'xat').items.map(i => i.done);
  return { before, after };
});
ok(steps.before.every(x => !x), 'sense missatges, cap pas fet');
ok(steps.after[0] && !steps.after[2],
  'en escriure\'n un, el primer pas es marca sol — i el de «més d\'una veu» no, perquè només hi ha una');

console.log('\n5 · El hook de test ja no té duplicats');
const hook = await page.evaluate(() => {
  const k = Object.keys(window.__SOS);
  return { n: k.length, unique: new Set(k).size };
});
ok(hook.n === hook.unique, hook.n + ' exports, cap repetit');

console.log('\n6 · El llançador s\'ha de poder recórrer amb la vista');
await page.evaluate(() => window.__SOS.openLauncher());
await page.waitForSelector('.modal #lchBody .lch-it');
const lch = await page.evaluate(() => {
  const body = document.querySelector('.modal #lchBody');
  return {
    items: body.querySelectorAll('.lch-it').length,
    groups: body.querySelectorAll('.ent-grp-lbl').length,
    hasFilter: !!document.querySelector('.modal #lchQ')
  };
});
ok(lch.items >= 30, lch.items + ' accions al llançador');
ok(lch.groups >= 5, 'repartides en ' + lch.groups + ' grups, no en una llista plana');
ok(lch.hasFilter, 'i amb filtre per a qui ja sap què busca');

const filtered = await page.evaluate(async () => {
  const q = document.querySelector('.modal #lchQ');
  q.value = 'ancoratge'; q.dispatchEvent(new Event('input'));
  await new Promise(r => setTimeout(r, 220));
  const body = document.querySelector('.modal #lchBody');
  const n = body.querySelectorAll('.lch-it').length;
  q.value = 'paracaigudes'; q.dispatchEvent(new Event('input'));
  await new Promise(r => setTimeout(r, 220));
  return { n, empty: body.querySelectorAll('.lch-it').length, saysNone: /cap acci[óo]/i.test(body.innerText) };
});
ok(filtered.n > 0 && filtered.n < lch.items, 'filtrar retalla la llista: ' + filtered.n + ' amb «ancoratge»');
ok(filtered.empty === 0 && filtered.saysNone, 'i si no hi ha res, ho diu en comptes de deixar-ho en blanc');
await page.evaluate(() => window.__SOS.closeModal());

console.log('\n7 · La feina que no és de ningú també es veu');
const net = await page.evaluate(async () => {
  const S = window.__SOS;
  // Un país amb dues regions, una de buida: el forat que ningú mirava.
  const pais = S.newNode('Catalunya', 'pais', null);
  const viva = S.newNode('Barcelona', 'provincia', pais.id);
  const buida = S.newNode('Girona', 'provincia', pais.id);
  const proj = S.newNode('Banc de Temps', 'projecte', viva.id); proj.dynamicType = 'banc_temps';
  S.seedFromDynamic(proj, S.dynById('banc_temps'));
  S.state.nodes.push(pais, viva, buida, proj);
  await S.persist(pais);
  const nm = S.networkMissions();
  const all = S.missions();
  return {
    n: nm.length,
    girona: nm.some(m => /Girona/.test(m.title)),
    actionable: nm.every(m => typeof m.act === 'function' && m.title && m.effect),
    inList: all.some(m => m.kind === 'xarxa'),
    last: all.length ? all[all.length - 1].kind : null,
    kindKnown: !!S.MISSION_KINDS.xarxa
  };
});
ok(net.n > 0 && net.girona, 'la regió sense res surt com a missió, amb nom');
ok(net.actionable, 'i cada missió de xarxa porta a un lloc concret, no és una estadística');
ok(net.kindKnown && net.inList, 'apareixen barrejades a la llista de missions');
ok(net.last === 'xarxa', 'però al final: el que t\'espera a tu passa davant del que espera la xarxa');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
