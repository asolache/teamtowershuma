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

console.log('\n7 · Preparar un entregable: la màquina proposa, ningú ha acceptat encara');
const pr = await page.evaluate(async () => {
  const S = window.__SOS;
  const node = S.newNode('Prova entregable', 'barri', null);
  S.state.nodes.push(node);
  node.vna = { roles: [{ id: 'r1', name: 'Nucli gestor' }, { id: 'r2', name: 'Veïnat' }],
    exchanges: [
      { id: 'x1', from: 'r1', to: 'r2', kind: 'tangible', label: 'acta de la trobada' },
      { id: 'x2', from: 'r2', to: 'r1', kind: 'intangible', label: 'confiança' },
      { id: 'x3', from: 'r1', to: 'r2', kind: 'tangible', label: 'una cosa sense nom conegut' }
    ] };
  const obre = x => { S.openPreparaEntregable(node, x); const t = document.querySelector('.modal').innerText; S.closeModal(); return t; };
  const auto = obre(node.vna.exchanges[0]);
  const intang = obre(node.vna.exchanges[1]);
  const sense = obre(node.vna.exchanges[2]);
  return { auto, intang, sense,
    /* Cap dels tres ha escrit res: obrir la pantalla no és acceptar. */
    entregables: node.vna.exchanges.reduce((a, x) => a + ((x.entregables || []).length), 0) };
});
ok(/Acta de reunió/.test(pr.auto) && /esborrany/i.test(pr.auto),
  'un flux automatitzable ofereix preparar un esborrany');
ok(/tokens/.test(pr.auto), 'i diu el cost abans de cridar');
ok(/intangible/i.test(pr.intang) && !/esborrany/i.test(pr.intang),
  'un intangible no ofereix res: diu per què i prou');
ok(/encara no sabem quin entregable/i.test(pr.sense),
  'i un tangible sense tipus demana posar-li nom en comptes de provar-ho igualment');
ok(pr.entregables === 0, 'i obrir les tres pantalles no ha escrit res enlloc');

console.log('\n8 · Els intents existeixen i porten els frens a les instruccions');
const it = await page.evaluate(() => {
  const S = window.__SOS;
  const els = Object.keys(S.INTENT_ENTREGABLE).map(t => ({ t, i: S.INTENT_ENTREGABLE[t] }));
  return els.map(({ t, i }) => {
    const d = S.AI.intents[i];
    return { t, i, hi: !!d, sys: d ? d.system : '', cost: d ? d.max_tokens : 0,
      buits: d ? JSON.stringify(d.tool.input_schema.required).includes('buits') : false };
  });
});
ok(it.length === 4, `${it.length} tipus tenen eina — quatre, no vuit: es fan un per un`);
it.forEach(x => {
  ok(x.hi && x.cost > 0, `\`${x.i}\` existeix i declara el seu cost (${x.cost} tokens)`);
  ok(/\[a completar\]/.test(x.sys), `\`${x.i}\` sap com marcar el que falta`);
  ok(x.buits, `\`${x.i}\` està obligat a retornar els buits, no és opcional`);
});

console.log('\n9 · L\'app funciona igual sense clau d\'IA');
const senseClau = await page.evaluate(async () => {
  const S = window.__SOS;
  try { await S.AI.call('entregable_acta', { node: 'x', flux: 'y' }); return 'ha cridat'; }
  catch (e) { return e.noKey ? 'demana clau' : 'error: ' + (e.msg || ''); }
});
ok(senseClau === 'demana clau', 'sense clau demana clau i no peta: l\'automatització és una comoditat, no un requisit');

console.log('\n10 · «Acceptat» vol dir alguna cosa: la mesura');
const me = await page.evaluate(() => {
  const S = window.__SOS;
  /* Un node de mentida amb tres entregables acceptats: dos sense tocar i un
     corregit. Si la mesura comptés els descartats —que no es desen enlloc—
     aquest número no es podria calcular, i per això només compta els acceptats. */
  const node = { vna: { roles: [], exchanges: [
    { id: 'a', entregables: [{ tipus: 'acta', editat: false }, { tipus: 'acta', editat: true }] },
    { id: 'b', entregables: [{ tipus: 'convocatoria', editat: false }] },
    { id: 'c' }
  ] } };
  const r = S.acceptacioEntregables(node);
  const buit = S.acceptacioEntregables({ vna: { exchanges: [] } });
  return { total: r.total, sense: r.sensetocar, pct: r.pct, tipus: r.per.length,
    acta: (r.per.find(x => x.tipus === 'acta') || {}).sensetocar,
    buitTotal: buit.total, buitPct: buit.pct,
    docs: S.entregablesDeFlux(node.vna.exchanges[0]).length,
    cap: S.entregablesDeFlux(node.vna.exchanges[2]).length };
});
ok(me.total === 3 && me.sense === 2 && me.pct === 67, `3 acceptats, 2 sense tocar, ${me.pct}%`);
ok(me.tipus === 2 && me.acta === 1, 'i el desglossament per tipus quadra');
ok(me.buitTotal === 0 && me.buitPct === null, 'sense cap acceptat el percentatge és null i no 0: zero de zero no és zero per cent');
ok(me.docs === 2 && me.cap === 0, 'la documentació penja de la transacció, i un flux sense cap no peta');

console.log('\n11 · El text pla és el que es corregeix, i es pot comparar');
const tx = await page.evaluate(() => {
  const S = window.__SOS;
  const acta = S.esborranyText('acta', { titol: 'Reunió', data: '3 de març',
    assistents: ['Tresoreria'], acords: [{ que: 'Comprar gerros', qui: 'Logística', quan: 'abril' }],
    pendents: ['Demanar pressupost'], buits: ['hora'] });
  const conv = S.esborranyText('convocatoria', { titol: 'Assemblea', que: 'Aprovar comptes',
    quan: '[a completar]', on: 'Local', ordre: ['Comptes', 'Precs'], qui: ['Sòcies'],
    confirmar: 'Respon al grup', canal: 'Assemblea dijous al local.', buits: ['hora'] });
  return { acta, conv, iguals: S.esborranyText('acta', { titol: 'X' }) === S.esborranyText('acta', { titol: 'X' }) };
});
ok(tx.acta.includes('Comprar gerros') && tx.acta.includes('Logística'), 'l\'acta en text pla porta els acords amb el seu responsable');
ok(!tx.acta.includes('hora'), 'i els buits no hi entren: són un avís sobre el text, no el text');
ok(tx.conv.includes('ORDRE DEL DIA') && tx.conv.includes('Assemblea dijous al local.'), 'la convocatòria porta ordre del dia i text per als canals');
ok(tx.conv.includes('[a completar]'), 'i el que no se sap queda marcat i no inventat');
ok(tx.iguals, 'el mateix esborrany dona el mateix text: si no, tot es llegiria com a corregit');

console.log('\n12 · I que es vegi a la pantalla, no només al codi');
/* La guarda llegeix el codi; aquesta prova el **pinta**. Són coses diferents:
   el botó que faltava existia al codi i no es veia enlloc, i per això aquí es
   construeix la llista de fluxos de debò i es compta el que en surt. */
const ui = await page.evaluate(() => {
  const S = window.__SOS;
  const node = { id: 'n1', name: 'Prova', ledger: [], ventures: [], vna: {
    roles: [{ id: 'r1', name: 'Junta' }, { id: 'r2', name: 'Sòcies' }],
    exchanges: [
      { id: 'x1', from: 'r1', to: 'r2', kind: 'tangible', label: 'acta de la reunió mensual',
        entregables: [
          { tipus: 'acta', editat: false, quan: Date.now(), text: 'A', original: 'A' },
          { tipus: 'acta', editat: true, quan: Date.now(), text: 'B', original: 'A' }] },
      { id: 'x2', from: 'r2', to: 'r1', kind: 'intangible', label: 'confiança' }] } };
  const box = S.buildFlowLedger(node);
  return { mesura: (box.querySelector('.fl-mesura') || {}).textContent || '',
    docs: box.querySelectorAll('.fl-doc').length,
    corregits: box.querySelectorAll('.fl-doc.ed').length,
    qui: [...box.querySelectorAll('.fl-qui-t')].map(e => e.textContent) };
});
ok(/50%/.test(ui.mesura), 'el percentatge d\'acceptació es pinta a la llista de fluxos');
ok(ui.docs === 2 && ui.corregits === 1, 'els dos entregables acceptats hi són, i el corregit va marcat');
ok(ui.qui.includes('👤 De persona, sempre'), 'i l\'intangible segueix dient que és de persona, sempre');

console.log('\n13 · El context arriba, i les xifres diuen que són estimacions');
const ctx = await page.evaluate(() => {
  const S = window.__SOS;
  const node = { id: 'n1', name: 'Ateneu', vna: {
    roles: [{ id: 'r1', name: 'Junta' }, { id: 'r2', name: 'Sòcies' }],
    exchanges: [{ id: 'x1', from: 'r1', to: 'r2', kind: 'tangible', label: 'acta mensual' }] },
    ledger: [{ id: 'e1', type: 'hores', value: 12, flowId: 'x1', personKey: 'p1', signed: true },
             { id: 'e2', type: 'moneda', value: 300, flowId: 'x1', personKey: 'p2' }],
    ventures: [] };
  const c = S.contextEntregable(node, node.vna.exchanges[0]);
  const prompt = S.AI.intents.entregable_justificacio.build(Object.assign({}, c, { notes: '' }));
  return { xifres: c.xifres, flux: c.flux, rols: c.rols, activitat: c.activitat, prompt };
});
ok(ctx.xifres.length > 0, `el context porta ${ctx.xifres.length} xifres del registre, no una llista buida`);
ok(ctx.xifres.filter(x => /ESTIMACIÓ/.test(x)).length === 2, 'les hores i els euros van etiquetats com a estimació');
ok(ctx.xifres.some(x => /apunts al registre.*exacte/.test(x)), 'i el que sí que és exacte —el recompte d\'apunts— ho diu també');
ok(ctx.flux === 'Junta → Sòcies · acta mensual', 'el flux es llegeix com una frase');
ok(ctx.activitat.length === 1, 'i l\'activitat registrada hi entra per al text de la memòria');
ok(/ESTIMACIÓ/.test(ctx.prompt) && /taula de despesa/.test(ctx.prompt),
  'el prompt de la justificació avisa que les estimacions no van a la taula de despesa');
ok(/no s’ha enganxat la convocatòria|No s'ha enganxat la convocatòria/i.test(ctx.prompt),
  'i sense la convocatòria enganxada ho diu com el primer que falta');

console.log('\n14 · La justificació: memòria sí, taula de despesa no');
const ju = await page.evaluate(() => {
  const S = window.__SOS;
  const r = S.AI.intents.entregable_justificacio.coerce({
    titol: 'Justificació 2026', memoria: 'S\'han fet dotze trobades.',
    activitats: [{ que: 'Trobada mensual', quan: 'gener–desembre', indicador: '12 sessions' }],
    despeses: [{ concepte: 'Material fungible', import: '', document: 'factura' },
               { concepte: 'Lloguer del local', import: '450 €', document: 'rebut' }],
    avisos: ['El termini acaba el 31 de gener'], buits: ['import del material'] });
  return { r, html: S.esborranyHTML('justificacio', r), text: S.esborranyText('justificacio', r),
    demana: S.EB_DEMANA.justificacio };
});
ok(ju.r.despeses[0].import === '[a completar]', 'un import buit es força a «[a completar]»: en blanc es llegiria com un zero');
ok(ju.r.despeses[1].import === '450 €', 'i el que et donen es respecta tal com és');
ok(/els imports els poses tu/i.test(ju.html) && /estimacions/i.test(ju.html),
  'la pantalla diu que la taula de despesa no la omple la màquina, i per què');
ok(/TAULA DE DESPESA/.test(ju.text) && /cal factura/.test(ju.text),
  'i el text pla porta cada concepte amb el document que caldrà');
ok(/convocatòria/i.test(ju.demana), 'la pantalla demana enganxar la convocatòria: sense això el document no té forma');

console.log('\n15 · Classificar un flux a mà: la sortida existeix de debò');
const cl = await page.evaluate(() => {
  const S = window.__SOS;
  const node = { id: 'ncl', name: 'Ateneu', ledger: [], ventures: [], kanban: { cards: [] }, vna: {
    roles: [{ id: 'r1', name: 'Junta' }, { id: 'r2', name: 'Sòcies' }],
    exchanges: [{ id: 'x1', from: 'r1', to: 'r2', kind: 'tangible', label: 'el paperot de cada mes' }] } };
  const x = node.vna.exchanges[0];
  const abans = S.fluxAutomatitzable(x);
  // El que fa la pantalla en desar: escriure el tipus a mà.
  x.entregable = 'informe';
  const despres = S.fluxAutomatitzable(x);
  // I treure'l torna a deixar que mani l'etiqueta.
  delete x.entregable;
  const tornat = S.fluxAutomatitzable(x);
  // Un tipus inventat no pot colar-se per aquesta porta.
  x.entregable = 'no-existeix';
  const fals = S.fluxAutomatitzable(x);
  // Ni pot fer automatitzable un intangible.
  const inta = S.fluxAutomatitzable({ kind: 'intangible', label: 'confiança', entregable: 'acta' });
  return { abans: abans.motiu, despres, tornat: tornat.motiu, fals: fals.motiu, inta };
});
ok(cl.abans === 'sense entregable declarat', 'una etiqueta que no diu res deixa el flux sense classificar');
ok(cl.despres.pot === true && cl.despres.tipus === 'informe', 'escriure el tipus a mà el fa automatitzable');
ok(cl.tornat === 'sense entregable declarat', 'i treure\'l el torna a deixar com estava: la classificació es pot desfer');
ok(cl.fals === 'sense entregable declarat', 'un tipus inventat no classifica res: la taxonomia segueix tancada');
ok(cl.inta.pot === false && cl.inta.motiu === 'intangible', 'i escriure un tipus a un intangible no obre cap porta');

console.log('\n16 · I la pantalla de classificar es pinta i desa');
const cp = await page.evaluate(async () => {
  const S = window.__SOS;
  const node = { id: 'ncl2', name: 'Ateneu', ledger: [], ventures: [], kanban: { cards: [] }, vna: {
    roles: [{ id: 'r1', name: 'Junta' }, { id: 'r2', name: 'Sòcies' }],
    exchanges: [{ id: 'x1', from: 'r1', to: 'r2', kind: 'tangible', label: 'el paperot de cada mes' }] } };
  const x = node.vna.exchanges[0];
  const bg = S.openTipusEntregable(node, x);
  const ops = [...bg.querySelectorAll('.te-op')].length;
  const maq = [...bg.querySelectorAll('.te-op:not(.te-pers):not(.te-cap)')].length;
  const pers = [...bg.querySelectorAll('.te-op.te-pers')].length;
  // Tria «comanda» i desa amb el botó de la pantalla.
  bg.querySelector('input[value="comanda"]').checked = true;
  [...bg.querySelectorAll('button')].find(b => /Desa la classificació/.test(b.textContent)).click();
  await new Promise(r => setTimeout(r, 60));
  return { ops, maq, pers, desat: x.entregable, pot: S.fluxAutomatitzable(x).pot };
});
ok(cp.ops === 9, `${cp.ops} opcions: els vuit tipus i «cap»`);
ok(cp.maq === 7 && cp.pers === 1, 'i es veu quins surten d\'una màquina i quin no');
ok(cp.desat === 'comanda' && cp.pot === true, 'triar i desar deixa el flux classificat i preparable');

console.log('\n17 · Les pantalles s\'obren amb botons que es poden prémer');
/* La prova que hauria calgut abans: obrir-les de debò i comptar què hi ha per
   clicar. Les altres criden les funcions directament i per això no van veure
   que `modal` es menjava la llista de botons. */
const bt = await page.evaluate(() => {
  const S = window.__SOS;
  const mk = () => ({ id: 'nb', name: 'A', ledger: [], ventures: [], kanban: { cards: [] }, vna: {
    roles: [{ id: 'r1', name: 'Junta' }, { id: 'r2', name: 'Sòcies' }],
    exchanges: [
      { id: 'x1', from: 'r1', to: 'r2', kind: 'tangible', label: 'acta de la reunió' },
      { id: 'x2', from: 'r2', to: 'r1', kind: 'tangible', label: 'el paperot' },
      { id: 'x3', from: 'r1', to: 'r2', kind: 'intangible', label: 'confiança' }] } });
  const txt = () => [...document.querySelectorAll('#modalRoot .modal .modal-actions button')]
    .map(b => b.textContent.trim());
  const out = {};
  let n = mk(); S.openPreparaEntregable(n, n.vna.exchanges[0]); out.prepara = txt();
  n = mk(); S.openPreparaEntregable(n, n.vna.exchanges[2]); out.intangible = txt();
  n = mk(); S.openTipusEntregable(n, n.vna.exchanges[1]); out.tipus = txt();
  n = mk(); n.vna.exchanges[0].entregables = [{ tipus: 'acta', editat: false, quan: Date.now(), text: 'x' }];
  S.openEntregableAcceptat(n, n.vna.exchanges[0], 0); out.llegir = txt();
  S.closeModal();
  return out;
});
ok(bt.prepara.some(t => /Prepara l'esborrany/.test(t)) && bt.prepara.some(t => /Tanca/.test(t)),
  'preparar un entregable: hi ha el botó que el prepara i el de tancar · ' + bt.prepara.join(' / '));
ok(bt.intangible.length === 1, 'l\'explicació d\'un intangible té la seva sortida');
ok(bt.tipus.some(t => /Desa la classificació/.test(t)), 'classificar un flux: hi ha el botó de desar');
ok(bt.llegir.length === 1, 'i llegir un entregable acceptat es pot tancar');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
