/* V84 · El projecte és teu; la plantilla només diu de quina mena és.
   Clicar una targeta creava la venture a l'instant i li posava **el nom de la
   plantilla**: cinc projectes d'energia a cinc pobles es deien tots «Energia».
   Aquí es prova que el nom es pugui posar, que la plantilla segueixi fent la
   seva feina —el mapa de valor i el tipus— i que qui ja té projectes amb nom de
   catàleg els pugui reanomenar. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.openActivityGallery);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('MATRIU de l\'Alt Penedès', 'projecte', null);
  n.dynamicType = 'matriu';
  S.seedFromDynamic(n, S.dynById('matriu'));
  S.state.nodes.push(n); await S.persist(n);
  S.selectNode(n.id);
  return { id: n.id };
});

console.log('\n1 · Triar una plantilla ja no crea res de cop');
const tria = await page.evaluate(async (id) => {
  const S = window.__SOS, n = S.byId(id);
  S.openActivityGallery(n);
  await new Promise(r => setTimeout(r, 120));
  const m = document.querySelector('.modal');
  const abans = S.venturesOf(n).length;
  const crear = m.querySelector('#agCreate');
  const desactivat = crear.disabled;
  m.querySelector('#agCrit .dyn-card').click();
  await new Promise(r => setTimeout(r, 80));
  return { abans, despres: S.venturesOf(n).length, desactivat,
    araActiu: !m.querySelector('#agCreate').disabled,
    seleccionades: m.querySelectorAll('.dyn-card.sel').length,
    tria: m.querySelector('#agSel').textContent.replace(/\s+/g, ' ').trim(),
    placeholder: m.querySelector('#agName').placeholder };
}, seed.id);
ok(tria.abans === 0 && tria.despres === 0, 'clicar la targeta no ha creat cap projecte');
ok(tria.desactivat && tria.araActiu, 'el botó de crear s\'activa quan hi ha plantilla triada');
ok(tria.seleccionades === 1, 'i es veu quina està triada');
ok(/de quina mena/i.test(tria.tria) === false && tria.tria.length > 5,
  'es diu què s\'ha triat: «' + tria.tria.slice(0, 60) + '»');
ok(/Alt Penedès/.test(tria.placeholder) && !/de MATRIU de/.test(tria.placeholder),
  'i el nom se suggereix amb el lloc, sense encadenar dos «de»: «' + tria.placeholder + '»');

console.log('\n2 · El nom que escrius és el nom del projecte');
const creat = await page.evaluate(async (id) => {
  const S = window.__SOS;
  const m = document.querySelector('.modal');
  m.querySelector('#agName').value = 'Comunitat Energètica de Vilafranca';
  m.querySelector('#agCreate').click();
  await new Promise(r => setTimeout(r, 350));
  const v = S.venturesOf(S.byId(id))[0];
  return { name: v.name, activityId: v.activityId, rols: v.vna.roles.length,
    fluxos: v.vna.exchanges.length, tipus: v.projectType };
}, seed.id);
ok(creat.name === 'Comunitat Energètica de Vilafranca',
  'el projecte es diu com tu vols: «' + creat.name + '»');
ok(!!creat.activityId, 'i la plantilla es guarda com a tipus (' + creat.activityId + ')');
ok(creat.rols > 0 && creat.fluxos > 0,
  'amb el mapa de valor que hi porta: ' + creat.rols + ' rols i ' + creat.fluxos + ' fluxos');

console.log('\n3 · Dos projectes de la mateixa mena a pobles diferents');
const dos = await page.evaluate(async (id) => {
  const S = window.__SOS, n = S.byId(id);
  S.openActivityGallery(n);
  await new Promise(r => setTimeout(r, 120));
  const m = document.querySelector('.modal');
  m.querySelector('#agCrit .dyn-card').click();
  m.querySelector('#agName').value = 'Comunitat Energètica del Vendrell';
  m.querySelector('#agCreate').click();
  await new Promise(r => setTimeout(r, 350));
  const vs = S.venturesOf(S.byId(id));
  return { noms: vs.map(v => v.name), mateixTipus: vs[0].activityId === vs[1].activityId };
}, seed.id);
ok(dos.noms.length === 2 && dos.noms[0] !== dos.noms[1],
  'es diuen diferent: ' + dos.noms.join(' · '));
ok(dos.mateixTipus, 'i són de la mateixa mena, que és el que la plantilla ha de dir');

console.log('\n══ El que importa: que la mena no desaparegui amb el nom ══');

console.log('\n4 · A la cartera, el tipus segueix sent visible');
const cartera = await page.evaluate((id) => {
  const S = window.__SOS;
  S.selectNode(id); S.state.tab = 'cartera'; S.render();
  const txt = document.querySelector('#workspace').textContent.replace(/\s+/g, ' ');
  const v = S.venturesOf(S.byId(id))[0];
  return { txt, teNom: txt.indexOf(v.name) >= 0, mena: S.actMeta(v.activityId).name,
    teMena: txt.indexOf(S.actMeta(v.activityId).name) >= 0 };
}, seed.id);
ok(cartera.teNom, 'hi surt el nom teu');
ok(cartera.teMena,
  'i també de quina mena és («' + cartera.mena + '»), que abans es veia perquè era el nom');

console.log('\n5 · El que ja estava creat es pot reanomenar');
const rename = await page.evaluate(async (id) => {
  const S = window.__SOS, n = S.byId(id);
  /* Un projecte de la vida real: creat abans de la V84, amb nom de catàleg. */
  const vell = S.newVenture(n, S.actMeta('cures'));
  S.venturesOf(n).push(vell); await S.persist(n);
  const abans = vell.name;
  S.openVentureDetail(n, vell);
  await new Promise(r => setTimeout(r, 150));
  const m = document.querySelector('.modal');
  const teCamp = !!m.querySelector('#vdName');
  const menaVisible = /De quina mena és/.test(m.textContent);
  m.querySelector('#vdName').value = 'Cures del barri de la Girada';
  m.querySelector('#vdRename').click();
  await new Promise(r => setTimeout(r, 250));
  const titol = m.querySelector('h2').textContent;
  S.closeModal();
  const v = S.venturesOf(S.byId(id)).find(x => x.id === vell.id);
  return { abans, teCamp, menaVisible, ara: v.name, tipusIntacte: v.activityId, titol };
}, seed.id);
ok(rename.teCamp && rename.menaVisible,
  'la fitxa té camp de nom i diu de quina mena és el projecte');
ok(rename.abans !== rename.ara && rename.ara === 'Cures del barri de la Girada',
  'de «' + rename.abans + '» a «' + rename.ara + '»');
ok(rename.tipusIntacte === 'cures',
  'i el tipus no s\'ha mogut: és el que sosté el mapa de valor');
ok(/Cures del barri/.test(rename.titol), 'el títol de la fitxa es refresca sense tancar-la');

console.log('\n6 · Sense nom, la plantilla segueix servint');
const senseNom = await page.evaluate(async (id) => {
  const S = window.__SOS, n = S.byId(id);
  S.openActivityGallery(n);
  await new Promise(r => setTimeout(r, 120));
  const m = document.querySelector('.modal');
  m.querySelectorAll('.ag-tab')[1].click();
  await new Promise(r => setTimeout(r, 80));
  m.querySelector('#agProto .dyn-card').click();
  m.querySelector('#agCreate').click();
  await new Promise(r => setTimeout(r, 350));
  const vs = S.venturesOf(S.byId(id));
  return { nom: vs[vs.length - 1].name, proto: vs[vs.length - 1].prototypeId };
}, seed.id);
ok(senseNom.nom.length > 0 && !!senseNom.proto,
  'qui no vol pensar el nom no es queda encallat: «' + senseNom.nom + '»');

console.log('\n7 · I no es pot deixar sense nom');
const buit = await page.evaluate(async (id) => {
  const S = window.__SOS, n = S.byId(id);
  const v = S.venturesOf(n)[0];
  const abans = v.name;
  S.openVentureDetail(n, v);
  await new Promise(r => setTimeout(r, 150));
  const m = document.querySelector('.modal');
  m.querySelector('#vdName').value = '   ';
  m.querySelector('#vdRename').click();
  await new Promise(r => setTimeout(r, 200));
  S.closeModal();
  return { abans, ara: S.venturesOf(S.byId(id))[0].name };
}, seed.id);
ok(buit.abans === buit.ara, 'un nom en blanc no esborra el que hi havia');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
