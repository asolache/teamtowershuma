/* V73 · Sortir a la comunitat.
   Entrar al SOS ja era fàcil. El que es provava malament és que ningú et deia
   què et faltava per ser visible, i el silenci semblava normal. Aquí es prova
   que cada estat digui el motiu concret i el següent pas — i, sobretot, que
   distingeixi «puc arreglar-ho jo» de «depèn d'algú altre». */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
/* La veda 77 en forma d'asserció: no es demana convertir-se en res, es diu que
   et puguin trobar. */
const perfilDemanaAlta = t => /donar-te d'alta|dona't d'alta|registra't/i.test(t || '');
const resum = t => String(t || '').replace(/\s+/g, ' ').match(/No estàs[^.]*\./)?.[0] || String(t || '').slice(0, 60);

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await b.newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.communityStatus);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

console.log('\n1 · Sense perfil');
const s1 = await page.evaluate(() => {
  const S = window.__SOS;
  S.state.activePersona = null;
  const c = S.communityStatus();
  return { codi: c.codi, visible: c.visible, msg: c.msg, acte: c.acte, teAct: typeof c.act === 'function' };
});
ok(s1.codi === 'sense-perfil' && !s1.visible, 'es diu que falta el perfil');
ok(s1.teAct && /perfil/i.test(s1.acte), 'i el següent pas és un botó: «' + s1.acte + '»');

console.log('\n2 · Amb perfil però sense cap node');
const s2 = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.setActivePersona('Marta Vidal');
  const c = S.communityStatus();
  return { codi: c.codi, msg: c.msg, acte: c.acte };
});
ok(s2.codi === 'sense-node', 'es diu que no ets a cap node');
ok(/es troba pels nodes/i.test(s2.msg), 'i per què importa: «' + s2.msg + '»');

console.log('\n3 · Amb node però sense cap oferta');
const s3 = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Banc de Temps', 'projecte', null);
  n.dynamicType = 'banc_temps';
  S.seedFromDynamic(n, S.dynById('banc_temps'));
  S.membersOf(n).push(S.newMember({ name: 'Marta Vidal' }));
  n.offers = [];
  S.state.nodes.push(n); await S.persist(n);
  const c = S.communityStatus();
  return { codi: c.codi, msg: c.msg, acte: c.acte, id: n.id };
});
ok(s3.codi === 'sense-oferta', 'un node buit no et fa visible');
ok(/no s'ofereix no es pot trobar/.test(s3.msg), 'i es diu per què: «' + s3.msg + '»');

console.log('\n4 · Amb oferta però el node no publica');
const s4 = await page.evaluate(async (id) => {
  const S = window.__SOS;
  const n = S.byId(id);
  S.offersOf(n).push(S.newOffer({ kind: 'oferta', category: 'cures', memberId: S.membersOf(n)[0].id }));
  await S.persist(n);
  const c = S.communityStatus();
  return { codi: c.codi, msg: c.msg, acte: c.acte };
}, s3.id);
ok(s4.codi === 'sense-publicar' || s4.codi === 'depen-altri',
  'es detecta que el node no publica (' + s4.codi + ')');
ok(/ningú de fora|decisió és de qui el sosté/i.test(s4.msg), '«' + s4.msg + '»');

console.log('\n5 · La distinció que importa: ho puc arreglar jo, o depèn d\'algú altre');
const s5 = await page.evaluate(async (id) => {
  const S = window.__SOS;
  const n = S.byId(id);
  const meu = S.canWrite(n);
  return { meu, codi: S.communityStatus().codi };
}, s3.id);
ok((s5.meu && s5.codi === 'sense-publicar') || (!s5.meu && s5.codi === 'depen-altri'),
  s5.meu ? 'el node és meu: el codi diu que ho puc activar jo'
         : 'el node no és meu: el codi diu que depèn de qui el sosté');

console.log('\n6 · Publicant, es diu que sí');
const s6 = await page.evaluate(async (id) => {
  const S = window.__SOS;
  await S.setPublishScope(S.byId(id), { skills: true, objects: false });
  const c = S.communityStatus();
  return { codi: c.codi, visible: c.visible, msg: c.msg };
}, s3.id);
ok(s6.visible && s6.codi === 'visible', 'ara sí: «' + s6.msg + '»');

console.log('\n7 · La benvinguda buida deixa de ser un carreró');
const w = await page.evaluate(async (id) => {
  const S = window.__SOS;
  await S.setPublishScope(S.byId(id), { skills: false, objects: false });
  const sol = S.welcomeEvent('Marta Vidal');
  await S.setPublishScope(S.byId(id), { skills: true, objects: false });
  const visible = S.welcomeEvent('Marta Vidal');
  return { sol: { buit: sol.buit, msg: sol.buitMsg, te: !!sol.seguent }, visible: { msg: visible.buitMsg } };
}, s3.id);
ok(w.sol.buit && w.sol.te, 'sense coincidències hi ha un següent pas concret, no una frase maca');
ok(/no publiquen|decisió/i.test(w.sol.msg), 'i diu el motiu real: «' + String(w.sol.msg).slice(0, 70) + '…»');
ok(/primer/i.test(w.visible.msg) && !/publiquen/i.test(w.visible.msg),
  'si ja et poden trobar, el missatge és un altre: «' + String(w.visible.msg).slice(0, 60) + '…»');

console.log('\n8 · A la home, quan no et poden trobar es diu allà mateix');
const home = await page.evaluate(async (id) => {
  const S = window.__SOS;
  await S.setPublishScope(S.byId(id), { skills: false, objects: false });
  S.state.activeId = null; S.state.homeView = 'tauler'; await S.setShowAllHome(true);
  S.render(); await new Promise(r => setTimeout(r, 150));
  const btn = document.querySelector('#homeVisible');
  const prim1 = document.querySelectorAll('#workspace .ent-card .btn-primary').length;
  const txt = document.querySelector('#workspace').textContent;
  await S.setPublishScope(S.byId(id), { skills: true, objects: false });
  S.render(); await new Promise(r => setTimeout(r, 150));
  const btn2 = document.querySelector('#homeVisible');
  const prim2 = document.querySelectorAll('#workspace .ent-card .btn-primary').length;
  await S.setShowAllHome(false);
  return { teBtn: !!btn, txt: /no publiquen|decisió/i.test(txt), desapareix: !btn2,
    primarisInvisible: prim1, primarisVisible: prim2 };
}, s3.id);
ok(home.teBtn && home.txt, 'hi surt el motiu i el botó per arreglar-ho');
ok(home.desapareix, 'i quan ja et poden trobar, l\'avís desapareix en comptes de quedar-se fent soroll');
/* La regla de la veda 73 val per a tota la home, no per targeta: si no et
   poden trobar, la resta del camí no porta enlloc i el pas següent baixa a
   secundari. Afegir un avís important NO pot ser afegir un segon primari. */
ok(home.primarisInvisible === 1 && home.primarisVisible === 1,
  'una sola acció primària als dos estats (' + home.primarisInvisible + ' / ' + home.primarisVisible + ')');

console.log('\n9 · L\'entrada: la frase que ja estava escrita, i el verb');
const tour = await page.evaluate(async () => {
  const S = window.__SOS;
  S.closeModal();
  S.openOnboardingTour();
  await new Promise(r => setTimeout(r, 150));
  const primer = document.querySelector('.modal').textContent;
  /* Avança fins al pas del perfil per llegir com es demana. */
  let perfil = '';
  for (let i = 0; i < 6; i++) {
    const next = [...document.querySelectorAll('.modal button')].find(b => /Següent|Segueix/i.test(b.textContent));
    if (!next) break;
    next.click(); await new Promise(r => setTimeout(r, 90));
    const t = document.querySelector('.modal');
    if (t && /primer pas concret/i.test(t.textContent)) { perfil = t.textContent; break; }
  }
  S.closeModal();
  return { primer, perfil };
});
ok(/un nou univers/i.test(tour.primer) && /aventura comuna/i.test(tour.primer),
  'el primer que es veu és que cada persona és un univers, abans de demanar res');
ok(/ja hi eres/i.test(tour.primer),
  'i que ja hi eres: no s\'hi entra, s\'hi reconeix');
ok(!perfilDemanaAlta(tour.perfil), 'el perfil no es demana com una alta: «' + resum(tour.perfil) + '»');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
