/* V81 · La Bomba Disco.
   El SOS ja sabia dir que un grup s'havia aturat i el que n'oferia era tornar a
   ensenyar el problema. Això és fer de termòmetre. Aquí es prova el contrari:
   que de cada silenci en surtin **jugades concretes**, que cadascuna obri on es
   fa, i —sobretot— que quan no n'hi ha cap **no se n'inventi**. Un tauler que
   sempre té alguna cosa a dir acaba dient qualsevol cosa. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.bombaDisco);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const fa = d => new Date(Date.now() - d * 86400000).toISOString();
  const n = S.newNode('Banc de Temps de Valls', 'projecte', null);
  n.dynamicType = 'banc_temps'; n.ledger = []; n.createdAt = fa(200);
  S.seedFromDynamic(n, S.dynById('banc_temps'));
  const anna = S.newMember({ name: 'Anna Roca' });
  const pere = S.newMember({ name: 'Pere Sala' });
  const gina = S.newMember({ name: 'Gina Mas' });
  S.membersOf(n).push(anna, pere, gina);
  /* L'Anna aportava i fa mesos que no. En Pere segueix. */
  await S.pushLedger(n.ledger, { id: 'a1', ts: fa(120), type: 'temps', value: 2, memberId: anna.id, category: 'cuina' });
  await S.pushLedger(n.ledger, { id: 'a2', ts: fa(110), type: 'temps', value: 2, memberId: anna.id, category: 'cuina' });
  await S.pushLedger(n.ledger, { id: 'p1', ts: fa(70), type: 'temps', value: 1, memberId: pere.id, category: 'cures' });
  /* Una coincidència que casa i on no ha passat mai res. */
  S.offersOf(n).push(S.newOffer({ kind: 'oferta', category: 'jardineria', memberId: pere.id, title: 'Podar' }));
  S.offersOf(n).push(S.newOffer({ kind: 'demanda', category: 'jardineria', memberId: gina.id, title: 'Cal podar' }));
  S.state.nodes.push(n); await S.persist(n);
  await S.setActivePersona('Anna Roca');
  return { id: n.id, anna: anna.id, pere: pere.id, gina: gina.id };
});

console.log('\n1 · El silenci del node sencer, no només de les seves ventures');
const sil = await page.evaluate((id) => window.__SOS.nodeSilence(window.__SOS.byId(id)), seed.id);
ok(sil.days >= 60 && sil.level === 'greu',
  'un banc de temps sense ventures també s\'apaga, i ara es diu (' + sil.days + ' dies)');

console.log('\n2 · Les tres jugades surten del que ja hi ha');
const b1 = await page.evaluate((id) => {
  const S = window.__SOS;
  const r = S.bombaDisco(S.byId(id));
  return { tipus: r.jugades.map(j => j.tipus), t: r.jugades.map(j => j.t),
    actes: r.jugades.map(j => j.acte), totsActuen: r.jugades.every(j => typeof j.act === 'function'),
    motiu: r.motiu };
}, seed.id);
ok(b1.tipus.indexOf('torna') >= 0, 'qui hi era i ja no hi és: «' + (b1.t[b1.tipus.indexOf('torna')] || '') + '»');
ok(b1.tipus.indexOf('coincidencia') >= 0,
  'la coincidència que ningú ha fet servir: «' + (b1.t[b1.tipus.indexOf('coincidencia')] || '') + '»');
ok(b1.totsActuen && b1.actes.every(a => a && a.length > 3),
  'i cada jugada porta acció, no consell: ' + b1.actes.join(' · '));
ok(!b1.motiu, 'amb jugades no hi ha frase de consol');

console.log('\n3 · Qui ja no hi és es tria per persona, no pel node');
const faded = await page.evaluate((s) => {
  const S = window.__SOS;
  const f = S.fadedPeople(S.byId(s.id));
  return { noms: f.map(x => x.name), dies: f.map(x => x.dies) };
}, seed);
ok(faded.noms.indexOf('Anna Roca') >= 0, 'l\'Anna, que aportava i fa 120 dies que no, hi surt');
ok(faded.noms.indexOf('Gina Mas') < 0,
  'i la Gina no: no s\'ha despenjat de res, encara no havia aportat mai');

console.log('\n══ El que importa: que no s\'inventi res i no exposi ningú ══');

console.log('\n4 · Una coincidència que ja ha acabat en intercanvi deixa de ser jugada');
const gastada = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  const abans = S.unusedMatches(n).length;
  /* L'intercanvi de debò entre els dos: la coincidència ja s'ha fet servir. */
  await S.pushLedger(n.ledger, { id: 'x1', ts: new Date().toISOString(), type: 'temps', value: 1,
    memberId: s.pere, counterpartId: s.gina, category: 'jardineria' });
  await S.persist(n);
  return { abans, despres: S.unusedMatches(n).length };
}, seed);
ok(gastada.abans > 0 && gastada.despres === 0,
  'de ' + gastada.abans + ' a ' + gastada.despres + ': el que ja s\'ha fet no es torna a proposar');

console.log('\n5 · Sense res a proposar, no s\'inventa cap jugada');
const buit = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Node Acabat de Néixer', 'projecte', null);
  n.dynamicType = 'banc_temps'; n.ledger = [];
  S.state.nodes.push(n); await S.persist(n);
  const r = S.bombaDisco(n);
  return { n: r.jugades.length, motiu: r.motiu };
});
ok(buit.n === 0, 'cap jugada inventada');
ok(/convidar algú/.test(buit.motiu), 'i es diu el motiu real: «' + buit.motiu + '»');

const sense = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Node amb Gent i Prou', 'projecte', null);
  n.dynamicType = 'banc_temps'; n.ledger = [];
  S.membersOf(n).push(S.newMember({ name: 'Sol Ibern' }));
  S.state.nodes.push(n); await S.persist(n);
  return S.bombaDisco(n).motiu;
});
ok(/no hi ha què creuar/.test(sense), 'i amb gent però res ofert, un altre motiu: «' + sense + '»');

console.log('\n6 · Qui ha deixat d\'aparèixer no ho veu qualsevol');
const privadesa = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  const meu = S.bombaDisco(n);
  /* El node passa a tenir amo, i jo no soc ni owner ni steward. */
  S.govOf(n).owner = 'did:sos:ed25519:UNALTREQUENOSOCJO000000000000000';
  const alie = S.bombaDisco(n);
  const pot = S.canWrite(n).ok;
  S.govOf(n).owner = null;
  return { meuTorna: meu.jugades.some(j => j.tipus === 'torna'),
    alieTorna: alie.jugades.some(j => j.tipus === 'torna'),
    alieAltres: alie.jugades.length, pot, potVeure: alie.potVeurePersones };
}, seed);
ok(privadesa.meuTorna, 'si el node és meu, veig qui s\'ha despenjat');
ok(!privadesa.pot && !privadesa.alieTorna && !privadesa.potVeure,
  'si no ho és, no: una llista de qui ha deixat d\'aparèixer és informació sobre persones');

console.log('\n7 · El tauler ja no torna a ensenyar el problema, obre les jugades');
/* Un node en silenci fet a mida: el de dalt ha deixat d'estar-hi callat perquè
   el pas 4 hi ha registrat un intercanvi de debò. */
const tauler = await page.evaluate(async () => {
  const S = window.__SOS;
  const fa = d => new Date(Date.now() - d * 86400000).toISOString();
  const n = S.newNode('Biblioteca Adormida', 'projecte', null);
  n.dynamicType = 'biblioteca_coses'; n.ledger = []; n.createdAt = fa(300);
  const jo = S.newMember({ name: 'Anna Roca' });
  S.membersOf(n).push(jo);
  await S.pushLedger(n.ledger, { id: 'z1', ts: fa(140), type: 'temps', value: 1,
    memberId: jo.id, category: 'bricolatge' });
  S.state.nodes.push(n); await S.persist(n);
  const at = S.dashboardAttention();
  const bomba = at.filter(a => a.ic === '💣' || /jugades concretes/.test(a.d || ''));
  return { total: at.length, bomba: bomba.length, t: (bomba[0] || {}).t || '',
    teAct: bomba.length ? typeof bomba[0].act === 'function' : false };
});
ok(tauler.bomba > 0 && tauler.teAct,
  'al tauler hi surt amb acció: «' + tauler.t + '»');

console.log('\n8 · A la pantalla, cada jugada té el seu botó');
const ui = await page.evaluate((id) => {
  const S = window.__SOS;
  S.openBombaDisco(S.byId(id));
  const m = document.querySelector('.modal');
  const cards = m.querySelectorAll('#bdList .ent-card').length;
  const botons = m.querySelectorAll('#bdList .btn').length;
  const txt = m.textContent.replace(/\s+/g, ' ');
  S.closeModal();
  return { cards, botons, txt };
}, seed.id);
ok(ui.cards > 0 && ui.cards === ui.botons,
  ui.cards + ' jugades i ' + ui.botons + ' botons: cap jugada sense on fer-la');
ok(/Cap consell: cada una obre on es fa/.test(ui.txt), 'i es diu què és aquesta pantalla');

console.log('\n9 · El Comando hi és com a capa, i s\'apaga');
const lent = await page.evaluate(async (id) => {
  const S = window.__SOS;
  S.openBombaDisco(S.byId(id));
  const amb = document.querySelector('.modal').textContent;
  S.closeModal();
  await S.setComandoLens(false);
  S.openBombaDisco(S.byId(id));
  const sense = document.querySelector('.modal').textContent;
  const cards = document.querySelectorAll('#bdList .ent-card').length;
  S.closeModal();
  await S.setComandoLens(true);
  return { amb: /la peña baila/.test(amb), sense: /la peña baila/.test(sense), cards };
}, seed.id);
ok(lent.amb && !lent.sense, 'la cita hi és amb la lent encesa i no amb l\'apagada');
ok(lent.cards > 0, 'i sense el Comando les jugades hi són igual: el relat no les sosté');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
