/* V70 · La home també és del rol de qui la mira.
   Igual que a V66, el risc no és amagar poc: és amagar el que algú necessita.
   Per això aquí es prova sobretot el que NO desapareix, i que sempre hi hagi
   una manera de veure-ho tot. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.homeSections);

console.log('\n1 · Cada rol comença per allò seu');
const roles = await page.evaluate(() => {
  const S = window.__SOS;
  const has = { cami: true, passos: true, atencio: true, aprop: true, xarxa: true, moviment: true };
  const out = {};
  Object.keys(S.HOME_SECTIONS).forEach(r => { out[r] = S.homeSections(r, { showAll: false, has }); });
  return out;
});
ok(roles.simpatitzant.length < roles.coordinador.length,
  'qui només mira en veu menys que qui sosté el node: ' + roles.simpatitzant.length + ' vs ' + roles.coordinador.length);
ok(!roles.simpatitzant.includes('xarxa'),
  'a qui només mira no se li dona el cercador de tota la xarxa');
ok(roles.simpatitzant.includes('aprop'),
  'però sí qui necessita el que sap fer, que és el que converteix mirar en participar');
ok(roles.coordinador.includes('atencio') && roles.coordinador.includes('xarxa'),
  'qui sosté el node veu el que reclama atenció i la xarxa');
ok(Object.values(roles).every(v => v.includes('cami') && v.includes('moviment')),
  'i tots els rols conserven el camí i el moviment recent');

console.log('\n2 · Una secció buida no ocupa lloc, però una amb contingut no s\'amaga mai');
const buides = await page.evaluate(() => {
  const S = window.__SOS;
  const sense = S.homeSections('coordinador', { showAll: false, has: { atencio: false, passos: false, xarxa: true, cami: true, moviment: true } });
  const amb = S.homeSections('coordinador', { showAll: false, has: { atencio: true, passos: true, xarxa: true, cami: true, moviment: true } });
  return { sense, amb };
});
ok(!buides.sense.includes('atencio'), 'sense res que reclami atenció, no es pinta la secció');
ok(buides.amb.includes('atencio'), 'amb alguna cosa, hi torna a ser');

console.log('\n3 · «Mostra-ho tot» i que es recordi');
const all = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.homeSections('simpatitzant', { showAll: true, has: {} }).length;
  await S.setShowAllHome(true);
  S.state.showAllHome = false;
  const recordat = await S.loadShowAllHome();
  await S.setShowAllHome(false);
  return { n, recordat, apagat: S.state.showAllHome, total: S.HOME_ALL.length };
});
ok(all.n === all.total, 'amb «mostra-ho tot» hi són les ' + all.total);
ok(all.recordat === true && !all.apagat, 'la preferència sobreviu a tancar l\'app i es pot apagar');

console.log('\n4 · Mai una home buida');
const mai = await page.evaluate(() => {
  const S = window.__SOS;
  return S.homeSections('simpatitzant', { showAll: false, has: { cami: false, aprop: false, moviment: false } });
});
ok(mai.length >= 2, 'si el filtre la deixaria buida, no es filtra: ' + mai.join(', '));

console.log('\n5 · El proper pas surt del que hi ha, no del que falta per estrenar');
const passos = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Biblioteca de les Coses', 'projecte', null);
  n.dynamicType = 'biblioteca_coses'; n.ledger = [];
  S.seedFromDynamic(n, S.dynById('biblioteca_coses'));
  ['A', 'B', 'C'].forEach(x => S.membersOf(n).push(S.newMember({ name: 'Soci ' + x })));
  S.state.nodes.push(n); await S.persist(n);
  await S.markOnboardingDone();
  const d = S.buildDashboard();
  return S.homeNextSteps(d).map(x => x.t);
}, {});
ok(passos.some(t => /primeres hores/.test(t)),
  'amb socis i cap apunt, el primer pas és registrar hores: «' + passos[0] + '»');
ok(!/^Prova:/.test(passos[0]),
  'i no un «Prova: …» de completista');

console.log('\n6 · A la pantalla de debò');
const ui = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.setShowAllHome(false);
  S.state.activeId = null; S.state.homeView = 'tauler';
  S.render(); await new Promise(r => setTimeout(r, 150));
  const ws = document.querySelector('#workspace');
  const primaris = ws.querySelectorAll('.ent-card .btn-primary').length;
  const more = ws.querySelector('.dash-more');
  const seccions = ws.querySelectorAll('.ent-grp-lbl').length;
  const cov = ws.querySelector('.dash-cov-det');
  const covObert = cov ? cov.open : null;
  if (more) { more.click(); await new Promise(r => setTimeout(r, 150)); }
  const seccions2 = document.querySelectorAll('#workspace .ent-grp-lbl').length;
  await S.setShowAllHome(false);
  return { primaris, teMore: !!more, seccions, seccions2, teCov: !!cov, covObert };
});
ok(ui.primaris === 1, 'una sola acció primària a tota la home, no dues (' + ui.primaris + ')');
ok(ui.teCov && ui.covObert === false, 'la graella d\'adopció hi és, però plegada');
ok(ui.teMore, 'es diu que hi ha seccions amagades');
ok(ui.seccions2 > ui.seccions, 'i en clicar-ho apareixen: ' + ui.seccions + ' → ' + ui.seccions2);

console.log('\n7 · El que s\'ha tret de la targeta segueix sent al llançador');
const llanc = await page.evaluate(() => {
  const S = window.__SOS;
  S.openLauncher();
  const txt = document.querySelector('.modal').textContent;
  S.closeModal();
  return ['Registre públic', 'Què hi ha a prop', 'Federacions', 'ancoratges']
    .filter(x => new RegExp(x, 'i').test(txt));
});
ok(llanc.length === 4, 'els quatre botons que ja no hi són continuen al llançador: ' + llanc.join(' · '));

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
