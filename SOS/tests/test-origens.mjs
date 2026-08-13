/* E13.1 · D'on es baixa el que ha publicat la xarxa.
   Llegir el que altres han publicat ja funcionava, però sortia d'un sol lloc
   escrit dins del codi: el dia que aquell lloc no respon, la xarxa desapareix
   per a tothom alhora i ningú pot apuntar a un altre costat.

   El que es prova aquí és sobretot **què es diu quan surt malament**: un origen
   que cau en silenci és pitjor que no tenir-ne, perquè no es distingeix de
   «encara no hi ha res publicat». */
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

/* Dos orígens simulats interceptant la xarxa: un que respon i un que no. Cal
   fer-ho amb `route` i no amb un mock de l'app: el que es prova és el `fetch`
   de debò, amb els seus errors de debò. */
const IDX_A = { at: new Date().toISOString(), packs: [{ file: 'a.json', name: 'Node A' }] };
const PACK_A = { supply: [
  { kind: 'skill', dir: 'ofereix', label: 'Cuina', category: 'cuina', count: 3, people: 2, nodeName: 'Foix' },
  { kind: 'skill', dir: 'demana', label: 'Fusteria', category: 'bricolatge', count: 1, people: 1, nodeName: 'Foix' }
] };
const VELL = new Date(Date.now() - 40 * 86400000).toISOString();
const IDX_VELL = { at: VELL, packs: [{ file: 'a.json', name: 'Mirall vell' }] };

await page.route('**/mirall-ok.example/**', r => {
  const u = r.request().url();
  r.fulfill({ status: 200, contentType: 'application/json',
    body: JSON.stringify(/index\.json/.test(u) ? IDX_A : PACK_A) });
});
await page.route('**/mirall-vell.example/**', r => {
  const u = r.request().url();
  r.fulfill({ status: 200, contentType: 'application/json',
    body: JSON.stringify(/index\.json/.test(u) ? IDX_VELL : PACK_A) });
});
await page.route('**/caigut.example/**', r => r.fulfill({ status: 503, body: 'down' }));

await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.fetchFromOrigins);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

console.log('\n1 · Sempre hi ha almenys un origen, i no es pot treure');
const base = await page.evaluate(async () => {
  const S = window.__SOS;
  const l = S.originsList();
  await S.removeOrigin(l[0].id);            // intent de treure el de casa
  return { n: l.length, id: l[0].id, fix: !!l[0].fix, despres: S.originsList().length };
});
ok(base.n === 1 && base.fix, 'de sèrie n\'hi ha 1 i està marcat com a fix');
ok(base.despres === 1, 'i treure\'l no fa res: sense ell no quedaria manera de llegir res');

console.log('\n2 · Un origen ha de ser https i no es repeteix');
const valida = await page.evaluate(async () => {
  const S = window.__SOS, out = {};
  const prova = async (o) => { try { await S.addOrigin(o); return 'ok'; } catch (e) { return e.msg; } };
  out.buit = await prova({ nom: 'x', base: '' });
  out.http = await prova({ nom: 'x', base: 'http://insegur.example/' });
  out.bo = await prova({ nom: 'Mirall OK', base: 'https://mirall-ok.example' });
  out.repe = await prova({ nom: 'Un altre nom', base: 'https://mirall-ok.example/' });
  out.llista = S.originsList().map(o => o.base);
  return out;
});
ok(/Falta/.test(valida.buit), 'sense adreça no: «' + valida.buit + '»');
ok(/https/.test(valida.http), 'http pelat tampoc: «' + valida.http + '»');
ok(valida.bo === 'ok' && valida.llista[1] === 'https://mirall-ok.example/',
  'i el bo entra amb la barra final posada: ' + valida.llista[1]);
ok(/ja hi és/.test(valida.repe), 'el mateix dos cops no: «' + valida.repe + '»');

console.log('\n══ El que importa: què es diu quan un origen no respon ══');

console.log('\n3 · El primer que respon mana, i es diu quin ha estat');
const serveix = await page.evaluate(async () => {
  const S = window.__SOS;
  /* Es posa un caigut davant del bo per veure que es passa de llarg. */
  await S.saveOrigins([{ id: 'x1', nom: 'Caigut', base: 'https://caigut.example/' },
    { id: 'x2', nom: 'Mirall OK', base: 'https://mirall-ok.example/' }]);
  const r = await S.updateCommonSupply(true);
  return { rows: r.rows, packs: r.packs, origen: r.origen && r.origen.nom,
    provats: (r.provats || []).map(p => p.origen.nom), edat: r.edat && r.edat.text };
});
ok(serveix.rows === 2 && serveix.origen === 'Mirall OK',
  serveix.rows + ' files servides per «' + serveix.origen + '»');
ok(serveix.provats.length === 2 && /D’aquí mateix|D'aquí mateix/.test(serveix.provats[0]),
  'i queda constància dels que no han pogut: ' + serveix.provats.join(', '));

console.log('\n4 · Amb tots caiguts NO es diu «no hi ha res publicat»');
/* És la mentida fàcil d'aquesta pantalla, i la que fa que ningú sàpiga mai si
   la xarxa és buida o si el seu origen és mort. */
const mort = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.saveOrigins([{ id: 'x1', nom: 'Caigut', base: 'https://caigut.example/' }]);
  const r = await S.updateCommonSupply(true);
  return { rows: r.rows, origen: r.origen, motiu: r.motiu || '' };
});
ok(mort.rows === 0 && mort.origen === null, 'no arriba res');
ok(/Cap dels \d+ orígens respon/.test(mort.motiu) && /HTTP 503/.test(mort.motiu),
  'i es diu que no responen, amb el codi: «' + mort.motiu.slice(0, 110) + '…»');

console.log('\n5 · Un mirall que s’ha quedat enrere ho confessa');
const vell = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.saveOrigins([{ id: 'x3', nom: 'Mirall vell', base: 'https://mirall-vell.example/' }]);
  const r = await S.updateCommonSupply(true);
  const senseData = S.originAge({ packs: [] });
  return { text: r.edat && r.edat.text, dies: r.edat && r.edat.dies,
    diu: r.edat && r.edat.diu, senseData };
});
ok(vell.diu && vell.dies >= 39, 'diu que és ' + vell.text);
ok(!vell.senseData.diu && /no diu de quan/.test(vell.senseData.text),
  'i si l\'índex no porta data, es diu que no la porta: «' + vell.senseData.text + '»');

console.log('\n6 · El sedàs d’entrada segueix manant, vingui d’on vingui');
const sedas = await page.evaluate(async () => {
  const S = window.__SOS;
  const fila = (x) => S.sanitizeSupplyRow(Object.assign(
    { kind: 'skill', dir: 'ofereix', label: 'Cuina', category: 'cuina', nodeName: 'Foix' }, x), 'x');
  /* Dues xarxes diferents, i val la pena distingir-les. La primera és la llista
     blanca: un camp que ningú ha declarat no passa, ni tan sols per ser mirat. */
  const extra = fila({ contact: 'marta@example.com' });
  /* La segona és per al que s'amaga DINS d'un camp legítim, que és on la llista
     blanca sola no arriba. Aquí la fila sencera cau. */
  const amagat = fila({ label: 'Cuina · escriu-me a marta@example.com' });
  const tel = fila({ label: 'Fusteria +34 600 000 000' });
  return { camps: extra && Object.keys(extra), teContact: !!(extra && extra.contact),
    amagat, tel };
});
ok(sedas.camps && !sedas.teContact,
  'un camp no declarat ni s\'arrossega: passen només ' + sedas.camps.join(', '));
ok(sedas.amagat === null && sedas.tel === null,
  'i el que s\'amaga dins d\'un camp legítim —un correu, un telèfon— tomba la fila sencera');

console.log('\n7 · La pantalla deixa afegir-ne i provar-los');
const ui = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.saveOrigins([{ id: 'x2', nom: 'Mirall OK', base: 'https://mirall-ok.example/' },
    { id: 'x1', nom: 'Caigut', base: 'https://caigut.example/' }]);
  S.openOrigins();
  await new Promise(r => setTimeout(r, 150));
  const m = document.querySelector('.modal');
  const files = m.querySelectorAll('#orList .ent-card').length;
  m.querySelector('#orTest').click();
  await new Promise(r => setTimeout(r, 700));
  const estats = [...m.querySelectorAll('#orList .ent-badges')].map(x => x.textContent.trim());
  const txt = m.textContent.replace(/\s+/g, ' ');
  S.closeModal();
  return { files, estats, txt };
});
ok(ui.files === 3, 'es veuen els ' + ui.files + ' orígens en ordre');
ok(/respon · 1 paquets/.test(ui.estats[1] || '') && /no respon/.test(ui.estats[2] || ''),
  'provar-los diu quin va i quin no: «' + (ui.estats[1] || '') + '» / «' + (ui.estats[2] || '') + '»');
ok(/no és fiar-se/.test(ui.txt),
  'i es diu que afegir un origen no és fiar-se\'n: el sedàs segueix manant');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
