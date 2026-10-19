/* La revisió UX del 17/10/2026 · una acció principal i un mapa que es llegeix.
   · La benvinguda tenia dos botons primaris competint: ara només un, i és el
     pas següent quan n'hi ha.
   · Diversos fluxos del mateix sentit entre dos rols es dibuixaven damunt l'un
     de l'altre, amb les etiquetes apilades: ara cap etiqueta en tapa una altra.
   · I el mapa d'un projecte comença dins la primera pantalla. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS);
await page.waitForTimeout(1500);

console.log('\n1 · La benvinguda té un sol botó principal, i és el pas següent');
await page.click('#obHero');
await page.waitForSelector('#shSave');
await page.fill('#shName', 'Marta Vidal');
await page.fill('#shMuni', 'Vilafranca del Penedès');
await page.click('#shSave');
await page.waitForSelector('#wcGo');
const w = await page.evaluate(() => ({
  prim: document.querySelectorAll('.modal .btn-primary').length,
  go: document.querySelector('#wcGo').textContent.trim(),
  element: (document.querySelector('#wcNext') || {}).textContent || ''
}));
ok(w.prim === 1, 'un sol botó primari (' + w.prim + ')');
ok(!/Comando/.test(await page.textContent('.modal')), 'i parla de tu, no del Comando');
ok(/node/i.test(w.go), 'i és el pas següent: «' + w.go + '»');
ok(/element/i.test(w.element), 'l\'element continua a un clic, com a opció secundària');
await page.click('#wcLater');

console.log('\n2 · Un projecte amb fluxos paral·lels: el mapa es llegeix i es veu');
const r = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Prova mapa', 'projecte', null);
  S.seedFromDynamic(n, S.dynById('mapeig_vna'));
  S.state.nodes.push(n); await S.persist(n);
  S.state.tab = 'map'; S.selectNode(n.id);
  await new Promise(r2 => setTimeout(r2, 300));
  const svg = [...document.querySelectorAll('#workspace svg')].find(s => s.querySelector('path[marker-end]'));
  const ts = [...svg.querySelectorAll('text')].filter(t => t.getAttribute('font-size') === '8.5')
    .map(t => t.getBoundingClientRect());
  let xocs = 0;
  for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) {
    const a = ts[i], c = ts[j];
    const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left);
    const oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
    if (ox > a.width * .6 && oy > a.height * .6) xocs++;
  }
  return { etiquetes: ts.length, xocs, top: Math.round(svg.getBoundingClientRect().top + scrollY),
    franja: !!document.querySelector('.nh-dyn .dd-eina') };
});
ok(r.etiquetes >= 8, r.etiquetes + ' etiquetes de flux al mapa');
ok(r.xocs === 0, 'cap etiqueta tapada per una altra (' + r.xocs + ' xocs)');
ok(r.top < 900, 'el mapa comença dins la primera pantalla (y = ' + r.top + ')');
ok(r.franja, 'l\'eina del projecte segueix a un clic, en una sola franja');

console.log('\n3 · «El meu negoci» primer, «Què ha passat?» i cada flux com una comanda');
const n3 = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('El meu celler', 'projecte', null);
  S.seedFromDynamic(n, S.DYNAMICS[0]);
  S.state.nodes.push(n); await S.persist(n);
  S.state.tab = 'map'; S.selectNode(n.id);
  await new Promise(r2 => setTimeout(r2, 300));
  const pas = [...document.querySelectorAll('.fl-pas')];
  const ex = n.vna.exchanges, rs = n.vna.roles, nm = id => rs.find(r => r.id === id).name;
  const pagament = ex.find(x => nm(x.from) === 'Clients' && x.label === 'pagament');
  return { primer: S.DYNAMICS[0].id, barres: pas.length, quatre: pas.every(p => p.children.length === 4),
    promes: pas.every(p => p.querySelectorAll('.fet').length >= 1),
    caixa: !!document.querySelector('#flQp'), id: n.id, pagament: pagament.id };
});
ok(n3.primer === 'negoci', 'la primera opció en crear un projecte és «El meu negoci»');
ok(n3.barres >= 5 && n3.quatre && n3.promes, n3.barres + ' fluxos amb els quatre passos, i tots almenys promesos');
ok(n3.caixa, 'hi ha la caixa «Què ha passat?»');
await page.fill('#flQp', 'Els clients han fet el pagament de la comanda');
await page.press('#flQp', 'Enter');
await page.waitForSelector('#leFlow');
const sel = await page.$eval('#leFlow', s => s.value);
ok(sel === n3.pagament, 'i troba el flux pels noms: Clients → pagament → El negoci');
ok(/pagament/.test(await page.$eval('#leWhat', i => i.value)), 'amb la frase com a concepte, a l\'espera de registrar');
await page.fill('#leVal', '120');
await page.click('#leSave');
await page.waitForTimeout(400);
const rebut = await page.evaluate(() => [...document.querySelectorAll('.flowl-row')]
  .some(r => r.querySelectorAll('.fl-pas .fet').length === 4));
ok(rebut, 'un cop apuntat, el flux surt com a rebut');

console.log('\n4 · El mapa de comarques i el QR es carreguen quan cal (lib/)');
await page.evaluate(() => { const S = window.__SOS; S.state.activeId = null; S.state.homeView = 'mapa'; S.render(); });
await page.waitForFunction(() => document.querySelectorAll('.cm-path').length > 40, null, { timeout: 5000 }).catch(() => {});
ok(await page.evaluate(() => document.querySelectorAll('.cm-path').length) > 40, 'el mapa de Catalunya surt sencer després de carregar-lo');
/* El QR només surt amb una oferta WebRTC oberta: aquí es prova que lib/qrcode.js
   és on _qrBlock el busca i que dibuixa. */
const qr = await page.evaluate(() => new Promise(ok => {
  const sc = document.createElement('script'); sc.src = 'lib/qrcode.js';
  sc.onload = () => { const d = document.createElement('div'); new QRCode(d, { text: 'hola', width: 100, height: 100 }); ok(!!d.querySelector('canvas,img')); };
  sc.onerror = () => ok(false); document.head.appendChild(sc);
}));
ok(qr, 'i lib/qrcode.js dibuixa el QR d\'aparellament');

console.log('\n5 · El mapa viu: el que circula es mou, el que no es veu aturat, i la xarxa real entra privada');
const viu = await page.evaluate(async () => {
  const S = window.__SOS;
  await new Promise((ok, ko) => { const sc = document.createElement('script'); sc.src = 'lib/flux-viu.js'; sc.onload = ok; sc.onerror = ko; document.head.appendChild(sc); });
  const ara = Date.parse('2026-10-18T12:00:00Z'), d = n => new Date(ara - n * 864e5).toISOString();
  const est = (f, ts) => FluxViu.estat(f, ts, ara).estat;
  const unit = {
    mai: est({}, []),
    viu: est({ ritme: 'setmana' }, [d(3)]),
    apagant: est({ ritme: 'setmana' }, [d(10)]),
    aturat: est({ ritme: 'setmana' }, [d(20)]),
    deduit: FluxViu.ritmeDies({}, [d(28), d(21), d(14), d(7)]),
    senseRitme: est({}, [d(45)])
  };
  const n = S.newNode('Xarxa real', 'projecte', null);
  S.state.nodes.push(n); await S.persist(n);
  const pak = { type: 'sos-xarxa-real', v: 1, nodes: [
    { id: 'jo', name: 'TeamTowers', kind: 'nosaltres' },
    { id: 'zoho:1', name: 'Celler Prova', kind: 'lead', url: 'https://crm.zoho.eu/crm/tab/Leads/1' },
    { id: 'zoho:2', name: 'Espai Prova', kind: 'lead', url: 'javascript:alert(1)' }],
    fluxos: [
      { id: 'gmail:a', from: 'jo', to: 'zoho:1', label: 'Proposta', ritme: 'setmana', fets: [{ id: 'm1', ts: new Date(Date.now() - 2 * 864e5).toISOString(), what: 'Correu' }] },
      { id: 'gmail:b', from: 'zoho:2', to: 'jo', label: 'Consulta', ritme: 'setmana', fets: [{ id: 'm2', ts: new Date(Date.now() - 40 * 864e5).toISOString() }] },
      { id: 'gmail:c', from: 'jo', to: 'zoho:2', label: 'Seguiment' }] };
  const c1 = FluxViu.importa(n, pak, S.uid), c2 = FluxViu.importa(n, pak, S.uid);
  await S.persist(n);
  S.state.tab = 'map'; S.selectNode(n.id);
  await new Promise(r2 => setTimeout(r2, 500));
  const svg = [...document.querySelectorAll('#workspace svg')].find(s => s.querySelector('path[data-ex]'));
  return { unit, c1, c2, rols: n.vna.roles.length,
    viu: svg.querySelectorAll('.fv-viu').length, pols: svg.querySelectorAll('.fv-pols').length,
    aturat: svg.querySelectorAll('.fv-aturat').length, mai: svg.querySelectorAll('.fv-mai').length,
    urls: [...svg.querySelectorAll('[data-url]')].map(e => e.getAttribute('data-url')),
    boto: !!document.querySelector('.vna-xr input[type=file]') };
});
ok(viu.unit.mai === 'mai' && viu.unit.viu === 'viu' && viu.unit.apagant === 'apagant' && viu.unit.aturat === 'aturat',
  'els quatre estats surten del ritme i de l\'últim cop (' + JSON.stringify(viu.unit) + ')');
ok(viu.unit.deduit === 7 && viu.unit.senseRitme === 'apagant', 'sense ritme declarat es dedueix dels apunts, i si no, es compta mensual');
ok(viu.c1.rols === 3 && viu.c1.fluxos === 3 && viu.c1.fets === 2, 'el paquet entra: 3 nodes, 3 fluxos, 2 fets');
ok(viu.c2.rols === 0 && viu.c2.fluxos === 0 && viu.c2.fets === 0 && viu.rols === 3, 'tornar-lo a carregar no duplica res');
ok(viu.viu === 1 && viu.pols === 1, 'el flux que circula es mou en la seva direcció');
ok(viu.aturat === 1 && viu.mai === 1, 'el que fa tard surt aturat, i el que no ha circulat mai, com una promesa');
ok(viu.urls.length === 1 && viu.urls[0].startsWith('https://crm.zoho.eu/'), 'només els orígens https s\'obren en una pestanya nova');
ok(viu.boto, 'el mapa ofereix carregar la xarxa real');
await page.evaluate(() => { history.replaceState(null, '', '?viu'); location.reload(); });
await page.waitForFunction(() => window.__SOS);
await page.waitForFunction(() => document.querySelectorAll('#workspace .fv-pols').length > 0, null, { timeout: 5000 }).catch(() => {});
const ex = await page.evaluate(() => ({ pols: document.querySelectorAll('#workspace .fv-pols').length,
  aturat: document.querySelectorAll('#workspace .fv-aturat').length, mai: document.querySelectorAll('#workspace .fv-mai').length,
  apagant: document.querySelectorAll('#workspace .fv-apagant').length }));
ok(ex.pols >= 2 && ex.aturat >= 1 && ex.mai >= 1 && ex.apagant >= 1, '?viu obre un exemple amb els quatre estats (' + JSON.stringify(ex) + ')');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' passen'));
process.exit(fail ? 1 : 0);
