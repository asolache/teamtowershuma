/* Fase 2 · L'ikigai i les missions per proximitat i afinitat.
   La temptació era demanar els quatre cercles en un formulari de quatre camps,
   i seria un test de personalitat: quatre caselles que la persona omple
   imaginant-se. Tres dels quatre surten de l'evidència que ja hi és.

   El que es prova aquí, per damunt de tot, és la frontera:

   · **El que t'agrada només es pot declarar; els altres tres es demostren**, i
     no es poden pintar igual.
   · **Un quadrant buit és un fet, no un fracàs**: no s'omple amb ànims.
   · **El rang de proximitat no és una distància.** */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await b.newPage({ viewport: { width: 1280, height: 900 } });
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.ikigaiQuadrants);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const muni = S.newNode('Torrelles de Foix', 'municipi', null);
  S.state.nodes.push(muni); await S.persist(muni);
  const n = S.newNode('Banc de temps de Torrelles', 'projecte', muni.id);
  n.dynamicType = 'banc_temps'; S.seedFromDynamic(n, S.dynById('banc_temps'));
  const marta = S.newMember({ name: 'Marta Vidal' });
  const pau = S.newMember({ name: 'Pau Ferrer' });
  S.membersOf(n).push(marta, pau);
  /* La Marta ofereix cuina; en Pau busca cuina. Aquest és el creuament. */
  S.offersOf(n).push(S.newOffer({ kind: 'demanda', category: 'cuina', memberId: pau.id, title: 'Cuina per a la festa' }));
  S.offersOf(n).push(S.newOffer({ kind: 'demanda', category: 'transport', memberId: pau.id, title: 'Portar caixes' }));
  S.state.nodes.push(n); await S.persist(n);
  await S.setActivePersona('Marta Vidal');
  S.state.activeId = null; S.state.homeView = 'tauler'; S.render();
  return { muni: muni.id, node: n.id, marta: marta.id, pau: pau.id };
});

console.log('\n1 · Sense res declarat ni aportat, els quadrants ho diuen');
const buit = await page.evaluate(() => {
  const k = window.__SOS.ikigaiQuadrants('Marta Vidal');
  return k.quadrants.map(q => ({ id: q.id, buit: q.buit, ev: q.evidenciat, diu: q.buitDiu, n: q.items.length }));
});
const agrada = buit.find(q => q.id === 'agrada'), bo = buit.find(q => q.id === 'bo');
const falta = buit.find(q => q.id === 'falta');
ok(agrada.buit && bo.buit, 'ni ha declarat què li agrada ni té res verificat');
ok(/no es pot deduir de res/.test(agrada.diu),
  'i es diu per què: «' + agrada.diu + '»');
ok(/encara no consta/.test(bo.diu),
  'i el d\'evidència no diu que no sàpiga fer res, diu que no consta: «' + bo.diu + '»');
ok(falta.n === 2, 'però «fa falta» ja té les ' + falta.n + ' demandes d\'en Pau: surten dels altres, no d\'ella');

console.log('\n══ El que importa: declarat i demostrat no es poden confondre ══');

console.log('\n2 · Un quadrant declarat mai es marca com a evidenciat');
/* Aquí es declaren arquetips DE DEBÒ, i no una llista buida. La primera versió
   d'aquest test posava `declared: []` i per això no va veure que la línia que
   els llegeix petava: una prova que deixa un camp buit no passa mai per la
   branca que el llegeix. Veda 106. */
const frontera = await page.evaluate(async () => {
  const S = window.__SOS;
  /* La Marta declara que li agrada cuinar. Això no la fa cuinera verificada. */
  await S.saveDossier('Marta Vidal', { name: 'Marta Vidal', skillsFree: ['Cuinar', 'Fer pa'],
    declared: ['zeus', 'hestia'] });
  const k = S.ikigaiQuadrants('Marta Vidal');
  const a = k.quadrants.find(q => q.id === 'agrada'), b2 = k.quadrants.find(q => q.id === 'bo');
  return { agradaN: a.items.length, agradaEv: a.evidenciat, noms: a.items.map(x => x.t),
    boN: b2.items.length, boEv: b2.evidenciat };
});
ok(frontera.agradaN === 4 && !frontera.agradaEv,
  'declara 2 arquetips i 2 habilitats, i el quadrant segueix marcat com a NO evidenciat');
ok(frontera.noms[0] === 'Zeus' && frontera.noms[1] === 'Hèstia',
  'i els arquetips surten pel seu nom, no per la clau: ' + frontera.noms.join(' · '));
ok(frontera.boN === 0 && frontera.boEv,
  'i «se\'t dona bé» segueix buit: declarar no omple el que s\'ha de demostrar');

console.log('\n2b · I amb arquetips declarats, el taulell es pinta');
/* La regressió reportada: la taula d'arquetips és un OBJECTE indexat per clau,
   i es llegia com si fos una llista. Petava per a tothom qui n'hagués declarat
   cap —és a dir, exactament per a qui ha fet la feina de fer-se el perfil— i el
   tauler sencer queia amb la pantalla d'error de la veda 105. */
const pinta = await page.evaluate(() => {
  const S = window.__SOS;
  S.state.activeId = null; S.state.homeView = 'tauler'; S.render();
  const w = document.querySelector('#workspace');
  return { error: !!w.querySelector('.merge-warn-t'), iki: !!w.querySelector('#ikigai'),
    txt: (w.innerText || '').replace(/\s+/g, ' ') };
});
ok(pinta.iki && !pinta.error, 'el tauler es pinta sencer, sense la pantalla d\'error');
ok(/Zeus/.test(pinta.txt), 'i l\'arquetip declarat es veu a la pantalla');

console.log('\n2c · Un arquetip d\'un altre set simbòlic no desapareix');
/* Qui va declarar amb el panteó i mira l'app amb el set vèdic ha de seguir
   veient el que va triar; i el que no és de cap set es mostra tal com es va
   escriure, que és més cert que un buit. */
const sets = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.saveDossier('Marta Vidal', { name: 'Marta Vidal', skillsFree: [],
    declared: ['brigit', 'Vishnu', 'inventat_meu'] });
  const a = S.ikigaiQuadrants('Marta Vidal').quadrants.find(q => q.id === 'agrada');
  const noms = a.items.map(x => x.t);
  await S.saveDossier('Marta Vidal', { name: 'Marta Vidal', skillsFree: ['Cuinar', 'Fer pa'],
    declared: ['zeus', 'hestia'] });
  return { noms, byKey: !!S.archetypeByKey('zeus'), byName: !!S.archetypeByKey('Hèstia'),
    cap: S.archetypeByKey('inventat_meu'), nul: S.archetypeByKey(null) };
});
ok(sets.noms[0] === 'Brígit' && sets.noms[1] === 'Vishnu',
  'es resol per clau i per nom, en qualsevol set: ' + sets.noms.slice(0, 2).join(' · '));
ok(sets.noms[2] === 'inventat_meu',
  'i el que no és de cap set es mostra tal com es va escriure, no es perd');
ok(sets.byKey && sets.byName && sets.cap === null && sets.nul === null,
  'i el resolutor torna null quan no ho sap, en comptes de petar');

console.log('\n3 · Amb una aportació verificada, sí que s\'omple');
const evid = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.node);
  await S.pushLedger(n.ledger || (n.ledger = []), { id: 'e1', ts: new Date().toISOString(),
    type: 'temps', value: 3, memberId: s.marta, category: 'cuina', what: 'Cuina per a la colla' });
  await S.persist(n);
  const k = S.ikigaiQuadrants('Marta Vidal');
  const b2 = k.quadrants.find(q => q.id === 'bo');
  return { n: b2.items.length, buit: b2.buit, primer: b2.items[0] && b2.items[0].t, hores: k.hores };
}, seed);
ok(!evid.buit && evid.n >= 1, '«se\'t dona bé» s\'omple des del ledger: ' + evid.primer);
ok(evid.hores === 3, 'i les hores surten del temps donat de debò: ' + evid.hores);

console.log('\n4 · El centre és una intersecció, no una metàfora');
const centre = await page.evaluate(() => {
  const c = window.__SOS.ikigaiCenter('Marta Vidal');
  return { n: c.creua.length, diu: c.diu, total: c.total };
});
ok(centre.n === 1 && /fa falta a prop/.test(centre.diu),
  'cuina se li dona bé i cuina fa falta: ' + centre.n + ' creuament de ' + centre.total + ' demandes');

const sense = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.node);
  /* Es treuen les demandes: el centre no pot inventar-se un creuament. */
  const back = S.offersOf(n).slice();
  n.offers = []; await S.persist(n);
  const c = S.ikigaiCenter('Marta Vidal');
  n.offers = back; await S.persist(n);
  return { n: c.creua.length, diu: c.diu };
}, seed);
ok(sense.n === 0 && /Encara no hi ha demandes/.test(sense.diu),
  'i sense demandes es diu que no n\'hi ha: «' + sense.diu + '»');

console.log('\n5 · Les missions es poden ordenar per proximitat i per afinitat');
const modes = await page.evaluate(() => {
  const S = window.__SOS;
  const out = {};
  ['urgencia', 'prop', 'afinitat'].forEach(m => {
    const ms = S.missionsNear({ mode: m });
    out[m] = { n: ms.length, primer: ms[0] && ms[0].kind,
      teProx: ms.every(x => x.prox && typeof x.prox.rank === 'number'),
      teAfi: ms.every(x => typeof x.afinitat === 'number') };
  });
  return out;
});
ok(modes.urgencia.n > 0 && modes.urgencia.teProx && modes.urgencia.teAfi,
  'cada missió porta proximitat i afinitat: ' + modes.urgencia.n + ' missions');
ok(modes.prop.n === modes.urgencia.n && modes.afinitat.n === modes.urgencia.n,
  'canviar de lent reordena, no filtra: cap missió desapareix');

console.log('\n6 · El rang de proximitat NO és una distància');
/* Sense coordenades només se sap la jerarquia territorial. Dir «a 3 km» quan
   només saps que sou de la mateixa comarca seria inventar-se una precisió. */
const km = await page.evaluate((s) => {
  const S = window.__SOS;
  const p = S.proximity(S.byId(s.muni), S.byId(s.node));
  const ms = S.missionsNear({ mode: 'prop' });
  return { km: p.km, rank: p.rank, label: p.label,
    capKm: ms.every(m => m.prox.km === null || typeof m.prox.km === 'number') };
}, seed);
ok(km.km === null && typeof km.rank === 'number',
  'sense coordenades el km és null i queda el rang: «' + km.label + '»');
ok(km.capKm, 'i cap missió es treu un km de la màniga');

console.log('\n7 · La tira surt al taulell i distingeix les dues menes');
const ui = await page.evaluate(() => {
  const S = window.__SOS;
  S.state.activeId = null; S.state.homeView = 'tauler'; S.render();
  const box = document.querySelector('#workspace #ikigai');
  if (!box) return { hi: false };
  const qs = [...box.querySelectorAll('.iki-q')];
  return { hi: true, n: qs.length,
    ev: qs.filter(q => q.classList.contains('ev')).length,
    dec: qs.filter(q => q.classList.contains('dec')).length,
    fonts: [...box.querySelectorAll('.iki-src')].map(x => x.textContent),
    txt: box.textContent.replace(/\s+/g, ' ') };
});
ok(ui.hi && ui.n === 4, 'els quatre quadrants són al taulell');
ok(ui.ev === 3 && ui.dec === 1,
  '3 marcats com a evidència i 1 com a declarat, amb estils diferents');
ok(ui.fonts.filter(f => /ho dius tu/.test(f)).length === 1 &&
   ui.fonts.filter(f => /de l’evidència|de l'evidència/.test(f)).length === 3,
  'i cadascun diu d\'on surt sense haver-hi de passar el ratolí');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
