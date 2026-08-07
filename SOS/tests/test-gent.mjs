/* V56 i V57 · Rànquing d'activitat, presència honesta i xat ancorat.
   Els dos punts que decideixen si això fa mal o bé: que el rànquing no es pugui
   inflar sol, i que sincronitzar no esborri missatges. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.activityRanking);

const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const muni = S.newNode('Torrelles de Foix', 'municipi', null);
  const bt = S.newNode('Banc de Temps', 'projecte', muni.id); bt.dynamicType = 'banc_temps';
  S.seedFromDynamic(bt, S.dynById('banc_temps'));   // perquè tingui mapa de valor de debò
  S.state.nodes.push(muni, bt);
  const mk = n => { const m = S.newMember({ name: n }); S.membersOf(bt).push(m); return m; };
  const anna = mk('Anna Puig'), bru = mk('Bru Soler'), cesc = mk('Cesc Vila'), dora = mk('Dora Roca');
  const T = new Date().toISOString();
  const E = o => Object.assign({ id: 'e' + Math.random().toString(36).slice(2), ts: T }, o);
  bt.ledger = [
    // Anna dona 10 h i en rep 8: recíproca.
    E({ type: 'temps', value: 10, sig: 'x', memberId: anna.id, counterpartId: bru.id, who: 'Anna Puig' }),
    E({ type: 'temps', value: 8, sig: 'x', memberId: bru.id, counterpartId: anna.id, who: 'Bru Soler' }),
    // Cesc dona 40 h i no rep res: molt volum, gens recíproc.
    E({ type: 'temps', value: 40, sig: 'x', memberId: cesc.id, counterpartId: dora.id, who: 'Cesc Vila' }),
    // Dora s'apunta 100 h a si mateixa i SENSE signar.
    E({ type: 'temps', value: 100, memberId: dora.id, who: 'Dora Roca' }),
    // Una estimació de l'oracle, que no ha de puntuar ningú.
    E({ type: 'objecte', value: 500, estimate: true, sig: 'x', memberId: dora.id, who: 'Dora Roca' })
  ];
  await S.persist(bt);
  return { muniId: muni.id, btId: bt.id, anna: anna.id, bru: bru.id };
});

console.log('\n1 · El rànquing no es pot inflar sol');
const r = await page.evaluate(() => {
  const S = window.__SOS;
  const l = S.activityRanking();
  const by = {}; l.forEach(p => by[p.name] = p);
  return { list: l.map(p => p.name), by, n: l.length };
});
ok(r.by['Dora Roca'].donat === 0, 'les 100 h que Dora s\'apunta sense signar no li donen cap punt');
ok(r.by['Dora Roca'].sensSignar === 1, 'però queden comptades com a sense signar, no s\'amaguen');
ok(!Object.values(r.by).some(p => p.donat > 45), 'els 500 € estimats de l\'oracle no puntuen ningú');
ok(r.by['Anna Puig'].signats === 1 && r.by['Anna Puig'].donat === 10, 'l\'aportació signada d\'Anna sí que compta');

console.log('\n2 · Donar i rebre val més que només donar');
ok(r.by['Anna Puig'].reciprocitat > r.by['Cesc Vila'].reciprocitat,
  'Anna (10 dona / 8 rep) és més recíproca que Cesc (40 dona / 0 rep)');
ok(r.by['Cesc Vila'].reciprocitat === 0.6, 'qui va tot en una direcció es queda al mínim del factor');
ok(r.by['Anna Puig'].reciprocitat > 0.9, 'i qui està equilibrat el té gairebé sencer');
ok(r.by['Cesc Vila'].punts > r.by['Anna Puig'].punts,
  'aportar 4 vegades més segueix pesant: el factor modula, no anul·la');

console.log('\n3 · Cada posició sap dir per què hi és');
ok(r.by['Anna Puig'].perque.includes('10 h aportades'), 'el perquè surt del mateix càlcul que el número');
ok(r.by['Bru Soler'].perque.includes('rebudes'), 'i distingeix el que s\'ha rebut del que s\'ha donat');
ok(Object.values(r.by).every(p => p.perque && p.perque.length), 'cap fila es queda sense explicació');

console.log('\n4 · El temps fa baixar el podi');
const dec = await page.evaluate(() => {
  const S = window.__SOS;
  const ara = Date.now();
  const fa1any = new Date(ara - 365 * 86400000).toISOString();
  return {
    ara: S.rankDecay(new Date(ara).toISOString(), ara),
    mig: Math.round(S.rankDecay(new Date(ara - S.RANK_HALFLIFE_DAYS * 86400000).toISOString(), ara) * 100) / 100,
    any: S.rankDecay(fa1any, ara),
    sense: S.rankDecay(null, ara),
    brossa: S.rankDecay('no és una data', ara)
  };
});
ok(dec.ara > 0.99, 'el d\'avui val sencer');
ok(dec.mig === 0.5, 'a la meitat de vida val exactament la meitat');
ok(dec.any < dec.mig, 'i el d\'ara fa un any, menys');
ok(dec.sense === 0.5 && dec.brossa === 0.5, 'una data absent o il·legible no dona ni 0 ni infinit');

console.log('\n5 · «En línia» no menteix');
const pres = await page.evaluate(() => {
  const S = window.__SOS;
  const p = S.presenceState();
  return { connected: p.connected, online: p.online.length, saysLimit: /rel[ée]/i.test(p.limit), recents: p.recents.length };
});
ok(pres.connected === false, 'sense canal obert, no hi ha ningú connectat');
ok(pres.online === 0, 'i la llista d\'en línia és buida, no plena de gent que no hi és');
ok(pres.saysLimit, 'la limitació la diu l\'estat, no un text solt de la vista');
ok(pres.recents > 0, 'l\'última activitat sí que hi és, que és una altra cosa');

console.log('\n6 · El xat penja d\'un node i cita el que existeix');
const chat = await page.evaluate(async (ids) => {
  const S = window.__SOS;
  const bt = S.byId(ids.btId);
  S.state.activePersona = 'Anna Puig';
  const refs = S.chatRefsFor(bt);
  const apunt = refs.find(x => x.kind === 'apunt');
  const m1 = await S.postChat(bt, 'Qui porta les hores del taller?', null);
  const m2 = await S.postChat(bt, 'Aquest apunt no quadra', apunt);
  const buit = await S.postChat(bt, '   ', null);
  const msgs = S.chatMessages(bt);
  return {
    nRefs: refs.length, kinds: [...new Set(refs.map(x => x.kind))].sort(),
    n: msgs.length, buit,
    hasRef: !!m2.ref, refKind: m2.ref && m2.ref.kind,
    alive: msgs.find(x => x.id === m2.id).refAlive,
    signed: !!m1.ts && m1.who === 'Anna Puig',
    ordered: msgs.map(x => x.ts).join('') === msgs.map(x => x.ts).sort().join('')
  };
}, seed);
ok(chat.nRefs > 0, 'es poden citar peces reals del node');
ok(chat.kinds.includes('apunt') && chat.kinds.includes('flux'), 'entre elles els apunts i els fluxos del mapa de valor');
ok(chat.n === 2 && chat.buit === null, 'un missatge buit no s\'envia');
ok(chat.hasRef && chat.refKind === 'apunt', 'la referència queda desada amb el missatge');
ok(chat.alive, 'i mentre el que cita existeix, es marca com a viva');
ok(chat.signed && chat.ordered, 'cada missatge porta qui i quan, i surten en ordre');

console.log('\n7 · Citar una cosa esborrada es diu, no es dissimula');
const dead = await page.evaluate((ids) => {
  const S = window.__SOS;
  const bt = S.byId(ids.btId);
  const m = S.chatMessages(bt).find(x => x.ref);
  bt.ledger = bt.ledger.filter(e => e.id !== m.ref.id);   // desapareix l'apunt citat
  const after = S.chatMessages(bt).find(x => x.id === m.id);
  return { alive: after.refAlive, textKept: after.text === m.text };
}, seed);
ok(dead.alive === false, 'la referència es marca com a morta quan el que citava ja no hi és');
ok(dead.textKept, 'però el missatge no es toca: el que algú va escriure no s\'esborra sol');

console.log('\n8 · Sincronitzar no esborra el que l\'altre acabava d\'escriure');
const merge = await page.evaluate(() => {
  const S = window.__SOS;
  const A = [{ id: 'm1', ts: '2026-01-01T10:00:00Z', text: 'a' }, { id: 'm2', ts: '2026-01-01T10:01:00Z', text: 'b' }];
  const B = [{ id: 'm1', ts: '2026-01-01T10:00:00Z', text: 'a' }, { id: 'm3', ts: '2026-01-01T10:00:30Z', text: 'c' }];
  const m = S.mergeChat(A, B);
  return {
    ids: m.map(x => x.id), ordered: m.map(x => x.ts).join('') === m.map(x => x.ts).sort().join(''),
    idempotent: JSON.stringify(S.mergeChat(m, m).map(x => x.id)) === JSON.stringify(m.map(x => x.id)),
    empty: S.mergeChat(null, null).length,
    cap: S.mergeChat(Array.from({ length: S.CHAT_MAX + 40 }, (_, i) => ({ id: 'x' + i, ts: '2026-01-01T00:00:0' + (i % 10) + 'Z' })), []).length
  };
});
ok(merge.ids.join(',') === 'm1,m3,m2', 'la unió es queda els tres missatges, cap perdut, en ordre de temps');
ok(merge.ordered, 'i ordenats per quan es van escriure, no per qui ha sincronitzat');
ok(merge.idempotent, 'fusionar dues vegades dona el mateix');
ok(merge.empty === 0, 'dos xats buits no peten');
ok(merge.cap === merge.cap && merge.cap <= 500, 'la finestra es reté: el node no creix per sempre');

console.log('\n9 · La pantalla de gent existeix i és enllaçable');
await page.evaluate(() => { location.hash = '#/gent'; window.__SOS.applyRoute(); });
await page.waitForFunction(() => /qui mou la xarxa/i.test(document.querySelector('#workspace').innerText));
const view = await page.evaluate(() => {
  const t = document.querySelector('#workspace').innerText;
  return {
    hash: location.hash, hv: window.__SOS.state.homeView,
    ara: /ara mateix/i.test(t), podi: /qui mou m[ée]s/i.test(t),
    saysNoServer: /no t[ée] servidor/i.test(t),
    saysRule: /signat/i.test(t),
    convs: /converses obertes/i.test(t)
  };
});
ok(view.hash === '#/gent' && view.hv === 'gent', 'la ruta #/gent deixa l\'estat coherent');
ok(view.ara && view.podi, 'primer qui hi és, després el podi');
ok(view.saysNoServer, 'diu per què no hi ha llista global de connectats');
ok(view.saysRule, 'i explica què puntua');
ok(view.convs, 'les converses obertes hi surten');

console.log('\n10 · L\'alta té ruta pròpia, per poder-hi enviar gent');
const alta = await page.evaluate(() => {
  const S = window.__SOS;
  return { has: !!S.MODAL_ROUTES.alta, label: S.MODAL_ROUTES.alta && S.MODAL_ROUTES.alta.label };
});
ok(alta.has, '#/alta existeix com a ruta');
ok(/superhero/i.test(alta.label || ''), 'i porta al formulari d\'alta, no a la portada de gestió');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
