/* E14 · El Bloc B, que existia i l'app no citava mai.
   `formacio.html` és la font única de la docència i `FORMACIO_MODULES` només
   n'és l'esquelet referenciable. La pàgina tenia 16 mòduls i l'app en modelava
   8: els vuit del Bloc B —facilitació, cures, finançament, formes jurídiques,
   RGPD, formació de formadors— existien sencers i **cap itinerari de rol els
   oferia**.

   Aquí es prova el que el `check-formacio.js` no pot provar des de fora: que
   ara arribin de debò a la persona per la porta per on hi ha de passar, que és
   el pla de mentoria. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.FORMACIO_MODULES);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

console.log('\n1 · El temari sencer, no la meitat');
const mods = await page.evaluate(() => {
  const S = window.__SOS;
  return { n: S.FORMACIO_MODULES.length,
    ids: S.FORMACIO_MODULES.map(m => m.id),
    blocB: S.FORMACIO_MODULES.filter(m => m.n >= 9).map(m => m.title),
    nivells: [...new Set(S.FORMACIO_MODULES.map(m => m.level))].sort() };
});
ok(mods.n === 16, 'l\'app modela ' + mods.n + ' mòduls');
ok(mods.blocB.length === 8, 'els 8 del Bloc B hi són: ' + mods.blocB[0] + '…');
ok(mods.nivells.join(',') === 'N0,N1,N2,N3', 'i cobreixen els quatre nivells: ' + mods.nivells.join(' '));

console.log('\n2 · Cada mòdul porta a la seva secció, no a la pàgina sencera');
const url = await page.evaluate(() => {
  const S = window.__SOS;
  return { u: S.moduleUrl('m12'), tots: S.FORMACIO_MODULES.every(m => S.moduleUrl(m.id).endsWith('#' + m.id)) };
});
ok(url.u === 'formacio.html#m12' && url.tots,
  'l\'enllaç del mòdul 12 és ' + url.u + ', i tots segueixen el mateix patró');

console.log('\n══ El que importa: que arribin a la persona ══');

console.log('\n3 · Un itinerari de mentoria ara els ofereix');
/* Abans, un coordinador o un simpatitzant no veia mai res del Bloc B, perquè
   cap mòdul del seu rol existia a l'esquelet. */
const plans = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Torrelles', 'projecte', null);
  n.dynamicType = 'banc_temps'; S.seedFromDynamic(n, S.dynById('banc_temps'));
  const m = S.newMember({ name: 'Ona Prat', role: 'coordinador' });
  S.membersOf(n).push(m);
  S.state.nodes.push(n); await S.persist(n);
  const out = {};
  for (const r of ['coordinador', 'simpatitzant', 'mentor', 'guardian']) {
    const p = await S.aiPrepareMentoring('Ona Prat', { role: r });
    out[r] = { total: p.modules.length, blocB: p.modules.filter(x => x.n >= 9).map(x => x.n) };
  }
  return out;
});
['coordinador', 'simpatitzant', 'mentor', 'guardian'].forEach(r => {
  ok(plans[r].total > 0 && plans[r].blocB.length > 0,
    r.padEnd(13) + ' → ' + plans[r].total + ' mòduls, ' + plans[r].blocB.length +
    ' del Bloc B (M' + plans[r].blocB.join(', M') + ')');
});

console.log('\n4 · El mentor és l\'únic que arriba a formació de formadors');
const m16 = await page.evaluate(() => {
  const S = window.__SOS;
  const mod = S.FORMACIO_MODULES.find(m => m.id === 'm16');
  return { level: mod.level, roles: mod.roles };
});
ok(m16.level === 'N3' && m16.roles.join() === 'mentor',
  'M16 és N3 i només del mentor: acompanyar altres no és el primer que fas');

console.log('\n5 · Cap rol es queda sense camí');
const rols = await page.evaluate(() => {
  const S = window.__SOS;
  const tots = Object.keys(S.SOS_ROLES);
  return tots.map(r => ({ r, n: S.FORMACIO_MODULES.filter(m => m.roles.includes(r)).length,
    h: S.FORMACIO_MODULES.filter(m => m.roles.includes(r)).reduce((a, m) => a + m.hours, 0) }));
});
ok(rols.every(x => x.n > 0),
  'els ' + rols.length + ' rols tenen mòduls: ' + rols.map(x => x.r.slice(0, 4) + ' ' + x.n).join(' · '));
ok(rols.every(x => x.h > 0 && !isNaN(x.h)),
  'i totes les càrregues horàries són números: ' + rols.map(x => x.h).join('/') + ' h');

console.log('\n6 · El pla de mentoria segueix ordenant per nivell');
/* Afegir vuit mòduls no ha de desordenar el que ja funcionava: primer el teu
   esglaó, després el següent. */
const ordre = await page.evaluate(async () => {
  const S = window.__SOS;
  const p = await S.aiPrepareMentoring('Ona Prat', { role: 'coordinador' });
  const lv = ['N0', 'N1', 'N2', 'N3'];
  const idx = p.modules.map(m => lv.indexOf(m.level));
  return { creixent: idx.every((x, i) => !i || x >= idx[i - 1]), idx };
});
ok(ordre.creixent, 'els mòduls surten de menys a més nivell: ' + ordre.idx.join(''));

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
