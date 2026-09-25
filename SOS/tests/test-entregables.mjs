/* Del mapa al Kanban: qui fa cada flux, i la línia que la màquina no creua.
 *
 * `check-entregables.js` llegeix el codi i comprova que la regla hi és escrita
 * en l'ordre correcte. Aquí es comprova l'altra meitat, que és la que val:
 * **que executant-lo faci el que diu**.
 *
 * La prova que importa és la 3. Totes les altres són higiene; aquella és la
 * promesa de la casa —«la màquina no toca cap intangible»— i es prova atacant-la
 * per les tres portes per on es podria colar: una etiqueta que sembla una acta,
 * un tipus escrit a mà a l'intercanvi, i una majúscula al `kind`.
 */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.fluxAutomatitzable);

console.log('\n1 · La taxonomia és tancada i es pot fer servir');
const t = await page.evaluate(() => {
  const S = window.__SOS;
  return {
    n: S.ENTREGABLES.length,
    maq: S.ENTREGABLES.filter(e => e.maquina).length,
    noMaq: S.ENTREGABLES.filter(e => !e.maquina).map(e => e.id),
    meta: !!S.entregableMeta('acta'),
    inventat: S.entregableMeta('no-existeix')
  };
});
ok(t.n === 8, `${t.n} tipus declarats`);
ok(t.maq === 7 && t.noMaq.length === 1, `${t.maq} els pot preparar una màquina i ${t.noMaq.length} no (${t.noMaq.join(', ')})`);
ok(t.meta && t.inventat === null, 'un tipus inventat no existeix: la taxonomia és tancada de debò');

console.log('\n2 · Un flux tangible amb entregable reconegut va a la màquina');
const si = await page.evaluate(() => {
  const S = window.__SOS;
  const cas = l => S.fluxAutomatitzable({ kind: 'tangible', label: l });
  return {
    acta: cas('acta de la reunió mensual'),
    informe: cas('informe de seguiment trimestral'),
    comanda: cas('liquidació de vendes'),
    sensTipus: cas('una cosa que no s\'assembla a res')
  };
});
ok(si.acta.pot && si.acta.tipus === 'acta', 'una acta es reconeix i és candidata');
ok(si.informe.pot && si.informe.tipus === 'informe', 'un informe de seguiment, també');
ok(si.comanda.pot && si.comanda.tipus === 'comanda', 'i una liquidació va a comanda');
ok(!si.sensTipus.pot && /sense entregable/.test(si.sensTipus.motiu),
  'i un tangible que no sabem què produeix NO és candidat: «' + si.sensTipus.motiu + '»');

console.log('\n3 · La línia que la màquina no creua');
const no = await page.evaluate(() => {
  const S = window.__SOS;
  return {
    /* Porta 1: l'etiqueta diu «acta», que és el tipus més automatitzable de
       tots. Si el sistema mirés l'etiqueta abans que la mena, passaria. */
    disfressat: S.fluxAutomatitzable({ kind: 'intangible', label: 'acta de la reunió' }),
    /* Porta 2: algú escriu el tipus a mà a l'intercanvi. El mapa el fa la casa
       i ha de poder declarar tipus — però no per aquí. */
    forcat: S.fluxAutomatitzable({ kind: 'intangible', label: 'confiança', entregable: 'acta' }),
    /* Porta 3: el `kind` escrit d'una altra manera. `isIntangible` ha de
       reconèixer-lo igual, o la porta queda oberta per un detall d'escriptura. */
    majuscula: S.fluxAutomatitzable({ kind: 'Intangible', label: 'acta' }),
    /* I el cas normal, per si de cas el que falla és el contrari. */
    normal: S.fluxAutomatitzable({ kind: 'intangible', label: 'reconeixement i confiança' })
  };
});
ok(!no.disfressat.pot && no.disfressat.motiu === 'intangible',
  'un intangible etiquetat «acta» segueix sent de persona');
ok(!no.forcat.pot && no.forcat.motiu === 'intangible',
  'i un intangible amb el tipus forçat a mà, també: no hi ha porta del darrere');
ok(!no.majuscula.pot, 'ni escrivint la mena amb majúscula');
ok(!no.normal.pot && no.normal.motiu === 'intangible', 'i el cas normal, evidentment');

console.log('\n4 · El repartiment compta el que hi ha');
const rp = await page.evaluate(() => {
  const S = window.__SOS;
  const node = S.newNode('Prova repartiment', 'barri', null);
  node.vna = { roles: [], exchanges: [
    { id: '1', from: 'a', to: 'b', kind: 'tangible', label: 'acta de la trobada' },
    { id: '2', from: 'b', to: 'a', kind: 'tangible', label: 'informe de seguiment' },
    { id: '3', from: 'a', to: 'c', kind: 'tangible', label: 'una cosa rara' },
    { id: '4', from: 'c', to: 'a', kind: 'intangible', label: 'confiança' },
    { id: '5', from: 'b', to: 'c', kind: 'intangible', label: 'reputació' }
  ] };
  return S.repartimentMaquina(node);
});
ok(rp.total === 5, 'compta els cinc fluxos');
ok(rp.maquina === 2, 'dos els pot preparar la màquina');
ok(rp.senseTipus === 1, 'un és tangible però encara no sabem què produeix');
ok(rp.persona === 2, 'i dos són de persona, sempre');
ok(rp.maquina + rp.senseTipus + rp.persona === rp.total, 'i no se\'n perd cap pel camí');
ok(rp.pct === 40, `el percentatge que ven és ${rp.pct} %`);

console.log('\n5 · La desviació respecte al model de referència');
const dv = await page.evaluate(() => {
  const S = window.__SOS;
  const proto = S.PROTOTYPE_MAPS ? S.PROTOTYPE_MAPS[0] : null;
  const node = S.newNode('Prova desviació', 'barri', null);
  // Un mapa que té la meitat dels rols del model i un de propi.
  const noms = proto ? proto.roles.slice(0, 2).concat(['Un rol que només tenim nosaltres']) : [];
  node.vna = { roles: noms.map((n, i) => ({ id: 'r' + i, name: n })), exchanges: [] };
  const d = S.desviacioMapa(node, proto && proto.id);
  return { proto: !!proto, falten: d.rolsFalten.length, propis: d.rolsPropis,
    totalProto: proto ? proto.roles.length : 0, cobert: d.cobert, cobertR: d.cobertR };
});
ok(dv.proto, 'els mapes prototip són accessibles com a model de referència');
ok(dv.falten === dv.totalProto - 2, `hi falten ${dv.falten} rols dels ${dv.totalProto} del model`);
ok(dv.propis.length === 1 && /només tenim nosaltres/.test(dv.propis[0]),
  'i el rol propi es compta a part, no com si sobrés');
ok(dv.cobertR > 0 && dv.cobertR < 100, `la cobertura de rols és ${dv.cobertR} %, ni zero ni cent`);

console.log('\n6 · El pla d\'sprints hereta el tipus i qui el pot fer');
const sp = await page.evaluate(() => {
  const S = window.__SOS;
  const node = S.newNode('Prova sprints', 'barri', null);
  S.state.nodes.push(node);
  const v = S.newVenture(node, { name: 'Venture de prova' });
  v.vna = { roles: [{ id: 'r1', name: 'Nucli gestor' }, { id: 'r2', name: 'Persones usuàries' }],
    exchanges: [
      { id: 'e1', from: 'r1', to: 'r2', kind: 'tangible', label: 'acta de la reunió' },
      { id: 'e2', from: 'r2', to: 'r1', kind: 'intangible', label: 'confiança i vincle' }
    ] };
  v.kanbanSeed = ['Fita de prova'];
  const sps = S.seedSprintPlanFromMap(v);
  const flux = (sps.find(x => /fluxos/i.test(x.name)) || {}).items || [];
  return {
    sprints: sps.length,
    auto: flux.filter(i => i.auto).length,
    noAuto: flux.filter(i => !i.auto).length,
    ambTipus: flux.filter(i => i.entregable).length,
    titolAuto: (flux.find(i => i.auto) || {}).title || '',
    intangAuto: flux.filter(i => i.auto && /confian/i.test(i.title)).length
  };
});
ok(sp.sprints === 3, 'el pla segueix tenint tres sprints');
ok(sp.auto === 1 && sp.noAuto === 1, 'una carta per a la màquina i una per a persona');
ok(sp.ambTipus === 1, 'i només la tangible porta tipus d\'entregable');
ok(/Acta de reunió/.test(sp.titolAuto), 'la carta automatitzable diu què s\'ha de produir: «' + sp.titolAuto + '»');
ok(sp.intangAuto === 0, 'i cap carta intangible ha quedat marcada per a la màquina');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
