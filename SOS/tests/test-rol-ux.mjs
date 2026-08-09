/* V66 · El full de ruta del rol decideix què es veu.
   El risc d'aquesta funció no és que amagui poc: és que amagui feina que algú
   ja ha fet. Per això la meitat d'aquest fitxer prova el que NO s'amaga. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.visibleTabs);

const TDEFS = [['resum', '◧ Resum', 0], ['map', '◉ Mapa', 0], ['kanban', '▤ Tauler', 0],
  ['ledger', '⊞ Comptes', 0], ['xat', '💬 Conversa', 0], ['socis', '👥 Socis', 0],
  ['banctemps', '⏳ Ofertes', 0], ['equity', '🥧 Equity', 0]];

console.log('\n1 · Cada rol comença pel seu');
const roles = await page.evaluate((t) => {
  const S = window.__SOS, out = {};
  Object.keys(S.ROLE_TABS).forEach(r => {
    out[r] = S.visibleTabs(t, { role: r, showAll: false, activeTab: null }).map(x => x[0]);
  });
  return out;
}, TDEFS);
ok(roles.simpatitzant.length < TDEFS.length, 'a qui només mira, se li\'n mostren menys: ' + roles.simpatitzant.join(', '));
ok(roles.superheroi.includes('ledger') && !roles.superheroi.includes('equity'),
  'qui aporta hores veu els comptes i no l\'equity');
ok(roles.mentor.includes('equity') && !roles.mentor.includes('kanban'),
  'qui mentoritza veu l\'equity i no el tauler de tasques');
ok(roles.coordinador.length > roles.simpatitzant.length,
  'qui sosté el node en veu més que qui hi passa: ' + roles.coordinador.length + ' vs ' + roles.simpatitzant.length);
ok(Object.values(roles).every(v => v.length >= 2), 'i cap rol es queda amb una pantalla sola');

console.log('\n2 · El que té contingut NO s\'amaga mai');
const content = await page.evaluate((t) => {
  const S = window.__SOS;
  const amb = t.map(x => x[0] === 'equity' ? ['equity', '🥧 Equity', 7] : x);
  return {
    sense: S.visibleTabs(t, { role: 'superheroi', showAll: false, activeTab: null }).map(x => x[0]),
    amb: S.visibleTabs(amb, { role: 'superheroi', showAll: false, activeTab: null }).map(x => x[0])
  };
}, TDEFS);
ok(!content.sense.includes('equity'), 'buida i fora del rol: no es mostra');
ok(content.amb.includes('equity'),
  'amb set registres a dins: es mostra encara que el rol no la necessiti');

console.log('\n3 · La pestanya on ets no desapareix sota els peus');
const active = await page.evaluate((t) => {
  const S = window.__SOS;
  return S.visibleTabs(t, { role: 'simpatitzant', showAll: false, activeTab: 'equity' }).map(x => x[0]);
}, TDEFS);
ok(active.includes('equity'), 'si hi ets a dins, hi segueix sent');

console.log('\n4 · «Mostra-ho tot» ho torna a ensenyar, i es recorda');
const all = await page.evaluate(async (t) => {
  const S = window.__SOS;
  const n = S.visibleTabs(t, { role: 'simpatitzant', showAll: true, activeTab: null }).length;
  await S.setShowAllTabs(true);
  const desat = S.state.showAllTabs;
  S.state.showAllTabs = false;
  await S.loadShowAllTabs();                       // com en tornar a obrir l'app
  const recordat = S.state.showAllTabs;
  await S.setShowAllTabs(false);
  return { n, desat, recordat, apagat: S.state.showAllTabs };
}, TDEFS);
ok(all.n === TDEFS.length, 'amb «mostra-ho tot» hi són totes: ' + all.n);
ok(all.desat && all.recordat, 'la preferència sobreviu a tancar l\'app');
ok(!all.apagat, 'i es pot tornar a apagar');

console.log('\n5 · Mai una llista buida, passi el que passi');
const never = await page.evaluate(() => {
  const S = window.__SOS;
  // Un node amb pestanyes que cap rol no reclama i totes buides.
  const rares = [['cohort', '▦ Cohort', 0], ['ecosistema', '🕸 Eco', 0]];
  return {
    n: S.visibleTabs(rares, { role: 'simpatitzant', showAll: false, activeTab: null }).length,
    buit: S.visibleTabs([], { role: 'superheroi', showAll: false, activeTab: null }).length
  };
});
ok(never.n === 2, 'si no en quedaria cap, es mostren totes en comptes de deixar-ho en blanc');
ok(never.buit === 0, 'i una llista buida segueix sent buida, sense petar');

console.log('\n6 · A la pantalla de debò: es diu quantes s\'amaguen i es desamaguen');
const ui = await page.evaluate(async () => {
  const S = window.__SOS;
  const bt = S.newNode('Banc de Temps', 'projecte', null); bt.dynamicType = 'banc_temps';
  S.seedFromDynamic(bt, S.dynById('banc_temps'));
  S.state.nodes.push(bt); await S.persist(bt);
  await S.setShowAllTabs(false);
  S.selectNode(bt.id);
  await new Promise(r => setTimeout(r, 80));
  const more = [...document.querySelectorAll('#workspace .tabs .tab-more')];
  const abans = document.querySelectorAll('#workspace .tabs .tab').length;
  if (more.length) { more[0].click(); await new Promise(r => setTimeout(r, 80)); }
  const despres = document.querySelectorAll('#workspace .tabs .tab').length;
  const txt = [...document.querySelectorAll('#workspace .tabs .tab-more')].map(x => x.textContent).join('');
  await S.setShowAllTabs(false);
  return { teBoto: more.length > 0, abans, despres, txt };
});
ok(ui.teBoto, 'hi ha el botó que diu que n\'hi ha més');
ok(ui.despres > ui.abans, 'i en clicar-lo n\'apareixen: ' + ui.abans + ' → ' + ui.despres);
ok(/nom[ée]s el meu rol/i.test(ui.txt), 'i llavors ofereix tornar al seu rol');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
