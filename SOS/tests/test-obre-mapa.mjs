/* Obrir i tornar un mapa de l'editor a l'app
 * ──────────────────────────────────────────
 * «⇪ Obre un mapa» porta a l'app el JSON de l'editor (o el
 * `cerebro/mapa-real.json` d'un client) i «⧉ Copia el mapa» el torna en la
 * mateixa forma, amb el que l'app no dibuixa (processos, troballes, ideal)
 * intacte. Les dues coses passen per lib/mapa-valor.js.
 *
 *   node SOS/tests/test-obre-mapa.mjs
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let fails = 0, n = 0;
const ok = (c, m) => { n++; if (c) console.log('  ✓ ' + m); else { fails++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await (await b.newContext()).newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(APP); await page.waitForFunction(() => window.__SOS, null, { timeout: 20000 });
try { await page.waitForSelector('#obSkip', { timeout: 3000 }); await page.click('#obSkip'); } catch (e) {}
await page.evaluate(() => { try { window.__SOS.markOnboardingDone(); } catch (e) {} document.querySelectorAll('.modal-bg').forEach(m => m.remove()); });

/* Un mapa inventat, com el que dona l'editor: sis rols, set parells, dos processos. */
const R = ['Qui fa el vi', 'Qui acull', 'Qui dinamitza', 'Qui encarrega', 'Qui serveix', 'Qui cobra'];
const MAPA = {
  abast: 'Des que una empresa pensa una jornada fins que està cobrada',
  roles: R,
  pairs: [[R[0], R[1], 'tangible', 'el vi de la casa', 'intangible', 'què pregunta qui ve'],
    [R[1], R[3], 'tangible', 'la sala i el dia', 'tangible', 'la reserva'],
    [R[2], R[3], 'tangible', 'l\'activitat', 'intangible', 'com ha anat'],
    [R[4], R[1], 'tangible', 'el dinar', 'intangible', 'l\'avís dels horaris'],
    [R[5], R[3], 'tangible', 'la factura', 'tangible', 'el pagament'],
    [R[0], R[3], 'intangible', 'el relat de la vinya', 'intangible', 'les ganes de tornar'],
    [R[2], R[4], 'intangible', 'el ritme del dia', 'intangible', 'quan és a punt']],
  processos: [{ id: 'p', nom: 'La jornada' }, { id: 'q', nom: 'El cobrament' }],
  seq: { 'Qui encarrega→Qui acull': ['p', 1] },
  troballes: [{ t: 'El relat no es factura', d: 'Ningú el cobra' }],
  ideal: { abast: 'El mateix, amb el relat cobrat', roles: R, pairs: [] }
};

console.log('\nObrir i tornar un mapa de l\'editor');

console.log('\n1 · Obrir un mapa a un projecte buit');
const r = await page.evaluate(async txt => {
  const S = window.__SOS;
  const node = S.newNode('Prova d\'obrir', 'projecte', null); S.state.nodes.push(node); await S.persist(node);
  const a = await S.obreMapa(node, txt), b2 = await S.obreMapa(node, txt);
  S.state.tab = 'map'; S.selectNode(node.id);
  await new Promise(x => setTimeout(x, 400));
  const m = S.mapaCanon(node), rv = S.revisaMapa(node);
  return { a, b2, rols: node.vna.roles.length, ex: node.vna.exchanges.length, missio: node.metaskill.mission, m,
    regles: rv.regles.map(g => g.id), punts: rv.punts,
    obre: !!document.querySelector('#vnaObre'), copia: !!document.querySelector('#vnaCopia'),
    salut: (document.querySelector('.health') || {}).innerText || '' };
}, JSON.stringify(MAPA));
ok(r.a.rols === 6 && r.a.fluxos === 14, `entren ${r.a.rols} rols i ${r.a.fluxos} fluxos`);
ok(r.b2.rols === 0 && r.b2.fluxos === 0 && r.ex === 14, 'obrir-lo dos cops no duplica res');
ok(r.missio === MAPA.abast, 'l\'abast passa a ser la missió, si no n\'hi havia');
ok(r.obre && r.copia, 'els dos botons, «⇪ Obre un mapa» i «⧉ Copia el mapa»');

console.log('\n2 · Tornar-lo sense perdre res');
const clau = m => m.pairs.flatMap(p => [p[0] + '→' + p[1] + '|' + p[2] + '|' + p[3], p[1] + '→' + p[0] + '|' + p[4] + '|' + p[5]]).sort().join('\n');
ok(clau(r.m) === clau(MAPA), 'els mateixos catorze lliuraments, amb la seva mena');
ok(JSON.stringify(r.m.processos) === JSON.stringify(MAPA.processos) && JSON.stringify(r.m.troballes) === JSON.stringify(MAPA.troballes), 'processos i troballes, tal com venien');
ok(JSON.stringify(r.m.ideal) === JSON.stringify(MAPA.ideal) && JSON.stringify(r.m.seq) === JSON.stringify(MAPA.seq), 'l\'ideal i la seqüència, també');

console.log('\n3 · Amb processos, compten les deu regles');
ok(r.regles.length === 10, `${r.regles.length} regles, la 10 inclosa (${r.punts}/100)`);
ok(/10 · Més d'un procés/.test(r.salut), 'i el panell les ensenya');

console.log('\n4 · Un fitxer que no és un mapa');
const e = await page.evaluate(async () => { const S = window.__SOS, node = S.state.nodes.find(x => x.name === 'Prova d\'obrir');
  try { await S.obreMapa(node, '{"hola":1}'); return ''; } catch (x) { return x.message; } });
ok(/no és un mapa/.test(e), 'diu per què: «' + e + '»');

console.log('\n5 · Qui ocupa els rols, i l\'escala de cada partner');
const DINS = { abast: 'Des de la vinya fins que el vi arriba a qui el tasta', roles: ['Qui verema', 'Qui elabora', 'Qui ensenya la vinya', 'Qui tasta', 'Qui compra', 'Qui ven'],
  pairs: [['Qui verema', 'Qui elabora', 'tangible', 'el raïm', 'intangible', 'com ha anat la collita']] };
const o = await page.evaluate(async ([txt, dins]) => {
  const S = window.__SOS, node = S.state.nodes.find(x => x.name === 'Prova d\'obrir');
  const m = JSON.parse(txt); m.orgs = [{ nom: 'Celler de prova', rols: ['Qui fa el vi', 'Qui acull', 'Qui dinamitza'], posicionament: 'Vi de vinya alta, fet a casa' },
    { nom: 'Celler veí', rols: ['Qui fa el vi'] }];
  m.dins = { 'Qui fa el vi': dins };
  const r = await S.obreMapa(node, JSON.stringify(m));
  S.state.tab = 'map'; S.selectNode(node.id);
  await new Promise(x => setTimeout(x, 600));
  const box = document.querySelector('.mo'), txtBox = box ? box.innerText : '';
  const canon = S.mapaCanon(node);
  await S.obreMapaOrg(node, 'Celler de prova');
  const fill = S.state.nodes.find(x => x.name === 'Celler de prova' && x.parentId === node.id);
  return { orgs: r.orgs, txt: txtBox, cards: document.querySelectorAll('.mo-c').length, canonOrgs: canon.orgs.length,
    fill: fill ? { rols: fill.vna.roles.length, ex: fill.vna.exchanges.length, missio: fill.metaskill.mission } : null };
}, [JSON.stringify(MAPA), DINS]);
ok(o.orgs === 2 && o.canonOrgs === 2, 'entren dues organitzacions, i tornen al copiar el mapa');
ok(/Celler de prova fa 3 rols/.test(o.txt), 'diu qui fa diversos rols');
ok(/l'ocupen Celler de prova i Celler veí/.test(o.txt) && /A Celler veí li falta un posicionament/.test(o.txt), 'i a qui li falta posicionament en un rol compartit');
ok(/Encara sense fitxa/.test(o.txt) && /per ser Pàgina falta la seva oferta/.test(o.txt), 'cada partner, el seu esglao i el que falta per al següent');
ok(o.fill && o.fill.rols === 6 && o.fill.ex === 2 && o.fill.missio === DINS.abast, '«🗂 El seu mapa» obre el mapa propi com a projecte de dins');

console.log('\n6 · D\'un llenç a l\'altre');
const ed = await page.evaluate(() => { const S = window.__SOS, node = S.state.nodes.find(x => x.name === 'Prova d\'obrir');
  return !!document.querySelector('#vnaEditor') && JSON.stringify(S.mapaCanon(node)); });
ok(!!ed, '«✎ Obre\'l a l\'editor» hi és');
const vs = await page.context().newPage();
await vs.goto(APP.replace('index.html', 'vna-suport.html'));
await vs.evaluate(t => localStorage.setItem('sos-mapa-cap-editor', t), ed);
await vs.goto(APP.replace('index.html', 'vna-suport.html') + '?app');
await vs.waitForTimeout(800);
const camps = await vs.evaluate(() => ({ rols: document.querySelector('#rols').value, abast: document.querySelector('#abast').value, resta: localStorage.getItem('sos-mapa-cap-editor') }));
ok(/Qui fa el vi/.test(camps.rols) && camps.abast === MAPA.abast && camps.resta === null, 'l\'editor l\'obre amb els seus rols i el seu abast, i no en deixa còpia');
await vs.click('#btApp'); await vs.waitForFunction(() => window.__SOS, null, { timeout: 20000 });
await vs.waitForTimeout(800);
const ap = await vs.evaluate(() => { const n = window.__SOS.state.nodes.find(x => x.name === 'El mapa de l\'editor');
  return n ? { rols: n.vna.roles.length, ex: n.vna.exchanges.length } : null; });
ok(ap && ap.rols === 6 && ap.ex === 14, '«🫀 Obre\'l viu a l\'app» el porta a l\'app sencer' + (ap ? ` (${ap.rols} rols, ${ap.ex} fluxos)` : ''));

ok(!errs.length, 'cap error a la pàgina' + (errs.length ? ': ' + errs[0] : ''));
await b.close();
console.log(fails ? `\n❌ ${fails} fallen de ${n}` : `\n✅ ${n} assercions, totes verdes`);
process.exit(fails ? 1 : 0);
