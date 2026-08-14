/* Fase 1 de la UX del superheroi · el marc.
   L'app va néixer com un explorador de territoris: una columna fixa de 280 px
   amb l'arbre, i tota la resta a dins. Això obliga tothom a **navegar per
   treballar**. Aquí es prova el marc nou —el tauler mana, l'arbre és un calaix—
   i sobretot les dues coses que el podrien espatllar:

   · Que treure l'arbre del marc no deixi cap node inaccessible (veda 62).
   · Que plegar les ajudes no plegui també les accions. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.paintTree);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const muni = S.newNode('Torrelles de Foix', 'municipi', null);
  S.state.nodes.push(muni); await S.persist(muni);
  const n = S.newNode('Banc de temps de Torrelles', 'projecte', muni.id);
  n.dynamicType = 'banc_temps'; S.seedFromDynamic(n, S.dynById('banc_temps'));
  const m = S.newMember({ name: 'Marta Vidal' });
  S.membersOf(n).push(m);
  S.state.nodes.push(n); await S.persist(n);
  await S.setActivePersona('Marta Vidal');
  S.state.activeId = null; S.state.homeView = 'tauler';
  S.render();
  return { muni: muni.id, node: n.id, mem: m.id };
});

console.log('\n1 · El tauler mana i l\'arbre no hi és fins que el demanes');
const inici = await page.evaluate(() => {
  const sh = document.querySelector('.shell'), t = document.querySelector('#treePanel');
  return { cols: getComputedStyle(sh).gridTemplateColumns.split(' ').length,
    obert: t.classList.contains('open'),
    visible: t.getBoundingClientRect().right > 0,
    boto: !!document.querySelector('#btnTree'),
    aria: document.querySelector('#btnTree').getAttribute('aria-expanded') };
});
ok(inici.cols === 1 && !inici.obert, 'el shell arrenca a una columna i el calaix tancat');
ok(!inici.visible, 'i l\'arbre no ocupa res: està fora de pantalla');
ok(inici.boto && inici.aria === 'false', 'hi ha el botó per obrir-lo, amb aria-expanded');

console.log('\n2 · S\'obre, empeny en comptes de tapar, i es tanca de tres maneres');
const obre = await page.evaluate(async () => {
  const S = window.__SOS;
  document.querySelector('#btnTree').click();
  await new Promise(r => setTimeout(r, 250));
  const sh = document.querySelector('.shell'), t = document.querySelector('#treePanel');
  const empeny = getComputedStyle(sh).gridTemplateColumns.split(' ').length === 2;
  const aria = document.querySelector('#btnTree').getAttribute('aria-expanded');
  const arbre = !!document.querySelector('#treeList .tree-node');
  /* Esc */
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await new Promise(r => setTimeout(r, 250));
  const tancatEsc = !t.classList.contains('open');
  return { empeny, aria, arbre, tancatEsc };
});
ok(obre.aria === 'true' && obre.arbre, 'obert i amb els territoris a dins');
ok(obre.empeny, 'a 1280 px empeny el contingut: obert vol dir obert de debò');
ok(obre.tancatEsc, 'i Esc el tanca');

console.log('\n══ El que importa: treure l\'arbre del marc no pot deixar ningú tancat ══');

console.log('\n3 · Amb el calaix tancat s\'arriba a qualsevol node');
/* És la prova de la veda 62 aplicada a aquest canvi: si l'arbre fos l'única
   manera d'arribar a un node, amagar-lo hauria creat un cul-de-sac. */
const cerca = await page.evaluate(async (s) => {
  const S = window.__SOS;
  await S.setTreeOpen(false);
  S.openSearchPalette();
  await new Promise(r => setTimeout(r, 120));
  const inp = document.querySelector('#spQ');
  inp.value = 'Banc de temps'; inp.dispatchEvent(new Event('input'));
  await new Promise(r => setTimeout(r, 120));
  const hit = document.querySelector('#spResults .sp-hit');
  const teResultat = !!hit;
  hit.click();
  await new Promise(r => setTimeout(r, 250));
  return { teResultat, arribat: S.state.activeId === s.node,
    calaixTancat: !document.querySelector('#treePanel').classList.contains('open') };
}, seed);
ok(cerca.teResultat && cerca.arribat, 'la cerca global hi porta sense obrir l\'arbre');
ok(cerca.calaixTancat, 'i el calaix segueix tancat: no cal per navegar');

console.log('\n4 · L\'estat es recorda entre càrregues');
const recorda = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.setTreeOpen(true);
  const desat = S.state.treeOpen;
  S.state.treeOpen = false;               // com si fos una càrrega nova
  await S.loadTreeOpen();
  return { desat, tornat: S.state.treeOpen };
});
ok(recorda.desat && recorda.tornat, 'qui el clava obert el troba obert');

console.log('\n5 · El taulell és al tauler, sense clics i sense arbre');
const taulell = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.setTreeOpen(false);
  S.state.activeId = null; S.state.homeView = 'tauler'; S.render();
  await new Promise(r => setTimeout(r, 150));
  const ops = document.querySelector('#workspace #opsPanel');
  const dinsArbre = !!document.querySelector('#treePanel #opsPanel');
  const files = ops ? [...ops.querySelectorAll('.ops-row')] : [];
  const clicables = files.filter(f => f.style.cursor === 'pointer');
  return { alTauler: !!ops, dinsArbre, files: files.length,
    teclat: clicables.length > 0 && clicables.every(f => f.getAttribute('role') === 'button' && f.getAttribute('tabindex') === '0'),
    abansDelsComptadors: ops && document.querySelector('#workspace .bib-stats')
      ? !!(ops.compareDocumentPosition(document.querySelector('#workspace .bib-stats')) & Node.DOCUMENT_POSITION_FOLLOWING) : false };
});
ok(taulell.alTauler && !taulell.dinsArbre, 'el taulell viu al tauler i ja no al lateral');
ok(taulell.abansDelsComptadors,
  'i va abans dels comptadors: el que t\'espera passa davant del que has acumulat');
ok(taulell.teclat, 'les files segueixen sent operables amb teclat (veda 94)');

console.log('\n6 · Registrar el que has fet, des del tauler');
const registra = await page.evaluate(async (s) => {
  const S = window.__SOS;
  const llocs = S.logValuePlaces().map(l => l.node.name);
  document.querySelector('#dashLog').click();
  await new Promise(r => setTimeout(r, 250));
  const m = document.querySelector('.modal');
  const h = (m.querySelector('h2') || {}).textContent || '';
  S.closeModal();
  return { llocs, h };
}, seed);
ok(registra.llocs.length === 1,
  'amb un sol lloc no es pregunta on: ' + registra.llocs.join(', '));
ok(!/Registra el que has fet/.test(registra.h) && registra.h.length > 0,
  'i el botó obre directament el formulari d\'apunt: «' + registra.h + '»');

const senseLloc = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.setActivePersona('Ningú Enlloc');
  S.openLogValue();
  await new Promise(r => setTimeout(r, 200));
  const m = document.querySelector('.modal');
  const txt = m.textContent.replace(/\s+/g, ' ');
  const btns = [...m.querySelectorAll('.modal-actions button')].map(x => x.textContent.trim());
  S.closeModal();
  await S.setActivePersona('Marta Vidal');
  return { txt, btns };
});
ok(/Encara no ets a cap node/.test(senseLloc.txt) && senseLloc.btns.some(x => /Obre el meu lloc/.test(x)),
  'i sense cap node no es barra el pas: porta a crear-lo (veda 94) · ' + senseLloc.btns.join(' · '));

console.log('\n7 · Mode flux: es plega l\'explicació, mai l\'acció');
const flux = await page.evaluate(async (s) => {
  const S = window.__SOS;
  /* Cal un node amb **pas pendent**: el sembrat amb `seedFromDynamic` ja té el
     mapa complet i la seva guia diu «✓ tot fet», que no és el cas que es prova. */
  const cru = S.newNode('Node acabat de néixer', 'projecte', s.muni);
  S.state.nodes.push(cru); await S.persist(cru);
  S.selectNode(cru.id);
  await new Promise(r => setTimeout(r, 200));
  const llegeix = () => {
    const d = document.querySelector('.ctx-guide');
    if (!d) return null;
    return { obert: d.open, resum: (d.querySelector('summary') || {}).textContent || '',
      teToca: /et toca:/.test((d.querySelector('summary') || {}).textContent || '') };
  };
  await S.setFlux(false); S.render();
  await new Promise(r => setTimeout(r, 150));
  const normal = llegeix();
  await S.setFlux(true); S.render();
  await new Promise(r => setTimeout(r, 150));
  const plegat = llegeix();
  /* Les accions de la pantalla no poden dependre del mode. */
  const accions = document.querySelectorAll('#workspace .tab-body button').length;
  return { normal, plegat, accions };
}, seed);
ok(flux.normal && flux.normal.obert, 'sense mode flux, la guia s\'obre sola quan hi ha pas pendent');
ok(flux.plegat && !flux.plegat.obert, 'amb mode flux, neix plegada');
ok(flux.plegat && flux.plegat.teToca,
  'i el «et toca» segueix llegint-se sense desplegar res: ' + flux.plegat.resum.replace(/\s+/g, ' ').slice(0, 70));
ok(flux.accions > 0, 'i les accions de la pantalla hi segueixen sent: ' + flux.accions + ' botons');

console.log('\n8 · A 390 px el calaix se superposa i es tanca en triar');
const mob = await ctx.newPage();
await mob.setViewportSize({ width: 390, height: 844 });
await mob.goto(APP);
await mob.waitForFunction(() => window.__SOS && window.__SOS.paintTree);
const petit = await mob.evaluate(async () => {
  const S = window.__SOS;
  await S.markOnboardingDone();
  const muni = S.newNode('Vilafranca', 'municipi', null);
  S.state.nodes.push(muni); await S.persist(muni);
  S.state.activeId = null; S.render();
  await S.setTreeOpen(true);
  await new Promise(r => setTimeout(r, 250));
  const sh = document.querySelector('.shell');
  const superposa = getComputedStyle(sh).gridTemplateColumns.split(' ').length === 1;
  const veu = document.querySelector('#treeVeil').classList.contains('on');
  S.selectNode(muni.id);
  await new Promise(r => setTimeout(r, 250));
  const tancatDespres = !document.querySelector('#treePanel').classList.contains('open');
  const de = document.documentElement;
  return { superposa, veu, tancatDespres, overflow: de.scrollWidth - de.clientWidth };
});
ok(petit.superposa && petit.veu, 'a mòbil se superposa amb vel en comptes de robar amplada');
ok(petit.tancatDespres, 'i en triar un territori es tanca sol: l\'havies obert per anar-hi');
ok(petit.overflow === 0, 'sense desbordament horitzontal');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
