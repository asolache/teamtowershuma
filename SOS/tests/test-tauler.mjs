/* El tauler · el rastre que ha de quedar quan una cosa deixa de ser omnipresent.
   Regressió de la fase 1: el taulell d'operacions vivia al lateral i es veia des
   de qualsevol pantalla. En passar-lo al tauler es va guanyar un marc i es va
   perdre això —mirant un node, el que t'esperava no era enlloc, i qui torna a
   l'app aterra a l'últim node que mirava.

   No es duplica el panell (tenir la mateixa cosa a dos llocs és pitjor que no
   tenir-la): queda un botó permanent que diu **que hi ha alguna cosa i on és**.
   I el progrés, que existia al model i no es veia enlloc. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.updateTaulerBtn);
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
  S.state.activeId = null; S.state.homeView = 'tauler'; S.render();
  return { muni: muni.id, node: n.id, mem: m.id };
});

console.log('\n══ El que importa: des d\'un node, saber que el tauler t\'espera ══');

console.log('\n1 · Al tauler, el botó del tauler no hi és (ja hi ets)');
const alTauler = await page.evaluate(() => {
  const b2 = document.querySelector('#btnTauler');
  return { hi: !!b2, amagat: b2.hidden };
});
ok(alTauler.hi && alTauler.amagat, 'existeix però està amagat: un botó cap a on ja ets és soroll');

console.log('\n2 · Mirant un node, hi és i hi porta');
const alNode = await page.evaluate(async (s) => {
  const S = window.__SOS;
  S.selectNode(s.node);
  await new Promise(r => setTimeout(r, 250));
  const b2 = document.querySelector('#btnTauler');
  const opsEnlloc = !document.querySelector('#opsPanel');
  const visible = !b2.hidden;
  b2.click();
  await new Promise(r => setTimeout(r, 250));
  return { visible, opsEnlloc, tornat: !S.state.activeId && S.state.homeView === 'tauler',
    opsTornat: !!document.querySelector('#workspace #opsPanel') };
}, seed);
ok(alNode.visible, 'des d\'un node el botó apareix');
ok(alNode.opsEnlloc, 'i el taulell NO es duplica al node: hi ha rastre, no còpia');
ok(alNode.tornat && alNode.opsTornat, 'clicant-lo tornes al tauler i el taulell hi és');

console.log('\n3 · El botó diu QUANTES coses t\'esperen, no només que n\'hi ha');
const compte = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.node);
  const llegeix = () => {
    const b2 = document.querySelector('#btnTauler');
    return { n: document.querySelector('#taulerN').textContent,
      alerta: b2.classList.contains('te-feina'), aria: b2.getAttribute('aria-label') };
  };
  S.selectNode(s.node); await new Promise(r => setTimeout(r, 200));
  const abans = llegeix();
  /* Perquè hi hagi vistiplau pendent cal que la fitxa estigui RECLAMADA: sense
     reclamar, `submitEntry` escriu directament i això és la veda 43 funcionant
     bé, no un error. */
  await S.claimMember(n, S.membersOf(n).find(x => x.id === s.mem));
  await S.submitEntry(n, { id: 'p1', ts: new Date().toISOString(), type: 'temps', value: 2,
    memberId: s.mem, what: 'Hores a nom de la Marta' }, { byName: 'Pau Ferrer' });
  S.render(); await new Promise(r => setTimeout(r, 200));
  const despres = llegeix();
  return { abans, despres };
}, seed);
ok(compte.abans.n === '' && !compte.abans.alerta,
  'sense res pendent, cap número i cap alarma');
ok(compte.despres.n !== '' && compte.despres.alerta,
  'amb una cosa pendent, el número surt i el botó s\'encén: «' + compte.despres.aria + '»');

console.log('\n4 · El progrés diu QUÈ falta, amb el número');
/* «Segueix així» no és un pas. «Et falten 20 h» sí. */
/* Persona nova, sense res: els passos anteriors ja han mogut la Marta i el
   test ha de dir el mateix passi el que passi abans. */
const prog = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.node);
  const nou = S.newMember({ name: 'Nou Vingut' });
  S.membersOf(n).push(nou); await S.persist(n);
  const zero = S.nextLevelGap('Nou Vingut');
  await S.pushLedger(n.ledger || (n.ledger = []), { id: 'h9', ts: new Date().toISOString(),
    type: 'temps', value: 8, memberId: nou.id, category: 'cuina', what: 'Cuina' });
  await S.persist(n);
  const vuit = S.nextLevelGap('Nou Vingut');
  return { zero: { lv: zero.nivell, diu: zero.diu },
    vuit: { lv: vuit.nivell, h: vuit.hores, diu: vuit.diu } };
}, seed);
ok(prog.zero.lv === 'N0' && /primera aportació/.test(prog.zero.diu),
  'de zero: «' + prog.zero.diu + '»');
ok(prog.vuit.lv === 'N1' && prog.vuit.h === 8 && /12 h més/.test(prog.vuit.diu),
  'amb 8 h diu exactament què falta, amb el número: «' + prog.vuit.diu + '»');

console.log('\n5 · A la pantalla, i portant on es tanca el forat');
const ui = await page.evaluate(async () => {
  const S = window.__SOS;
  S.state.activeId = null; S.state.homeView = 'tauler'; S.render();
  await new Promise(r => setTimeout(r, 250));
  const box = document.querySelector('#workspace #progres');
  if (!box) return { hi: false };
  const btn = box.querySelector('button');
  btn.click();
  await new Promise(r => setTimeout(r, 250));
  const h = (document.querySelector('.modal h2') || {}).textContent || '';
  S.closeModal();
  return { hi: true, txt: box.textContent.replace(/\s+/g, ' '), btn: btn.textContent, modal: h };
});
ok(ui.hi && /h més|primera aportació|et falta/.test(ui.txt),
  'el progrés surt al tauler i diu què falta: ' + ui.txt.slice(0, 80) + '…');
ok(/Registra/.test(ui.btn) && ui.modal.length > 0,
  'i el botó porta a registrar, que és on es tanca el forat: obre «' + ui.modal + '»');

console.log('\n6 · No compara amb ningú');
/* Comparar ja ho fa el rànquing, amb les seves proteccions (veda 103). Un
   nivell és contra tu mateix. */
const solitari = await page.evaluate(() => {
  const box = document.querySelector('#workspace #progres');
  const t = box.textContent;
  return { comparatiu: /millor que|pitjor que|posició|rànquing|\d+è/i.test(t), txt: t.slice(0, 60) };
});
ok(!solitari.comparatiu, 'el progrés no diu la teva posició respecte de ningú');

console.log('\n7 · A 360 px la topbar segueix cabent amb els dos botons nous');
const mob = await ctx.newPage();
await mob.setViewportSize({ width: 360, height: 740 });
await mob.goto(APP);
await mob.waitForFunction(() => window.__SOS);
const petit = await mob.evaluate(async () => {
  const S = window.__SOS; await S.markOnboardingDone();
  const m = S.newNode('Vila', 'municipi', null); S.state.nodes.push(m); await S.persist(m);
  S.selectNode(m.id);
  await new Promise(r => setTimeout(r, 300));
  const de = document.documentElement;
  const qui = [...document.querySelectorAll('body *')]
    .map(e => ({ t: e.tagName + '.' + String(e.className || '').slice(0, 26), r: e.getBoundingClientRect() }))
    .filter(x => x.r.right > de.clientWidth + 0.5)
    .slice(0, 4).map(x => x.t + ' [' + Math.round(x.r.left) + '→' + Math.round(x.r.right) + ']');
  return { overflow: de.scrollWidth - de.clientWidth, qui,
    taulerVisible: !document.querySelector('#btnTauler').hidden };
});
ok(petit.overflow <= 0, 'sense desbordament horitzontal a 360 px (' + petit.overflow + ' px)' +
  (petit.overflow > 0 ? ' · ' + petit.qui.join(' · ') : ''));
ok(petit.taulerVisible, 'i el botó del tauler també hi és a mòbil');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
