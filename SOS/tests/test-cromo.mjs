/* V78 · El cromo és teu i és de veritat.
   Sprint 2 del multivers. La mecànica ve d'una cançó («tengo cromos repes… que
   te lo cambio») però el que aquí es prova no és el relat: és que el cromo no es
   pugui aconseguir de cap manera que no sigui aportar, i que el bescanvi no mogui
   cap cromo. Si algun dia això falla, el registre deixa de voler dir res. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.cromoCollection);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Banc de Temps de Gràcia', 'projecte', null);
  n.dynamicType = 'banc_temps'; n.ledger = [];
  S.seedFromDynamic(n, S.dynById('banc_temps'));
  const marta = S.newMember({ name: 'Marta Vidal' });
  const jordi = S.newMember({ name: 'Jordi Puig' });
  const nuria = S.newMember({ name: 'Núria Bosc' });
  S.membersOf(n).push(marta, jordi, nuria);
  S.state.nodes.push(n); await S.persist(n);
  await S.setActivePersona('Marta Vidal');
  return { id: n.id, marta: marta.id, jordi: jordi.id, nuria: nuria.id };
});

console.log('\n1 · Sense aportacions verificades no hi ha cap cromo');
const buit = await page.evaluate(() => {
  const c = window.__SOS.cromoCollection('Marta Vidal');
  return { tens: c.tens.length, deck: c.deck, ver: c.verificades, faltes: c.faltes.length };
});
ok(buit.tens === 0 && buit.ver === 0, 'la col·lecció neix buida');
ok(buit.deck >= 10 && buit.faltes === buit.deck, 'i tot el deck (' + buit.deck + ') consta com a falta');

console.log('\n2 · El llistó: una aportació sense verificar NO dóna cromo');
const sense = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  /* A pèl al ledger, sense passar per pushLedger: ni signatura ni encadenat.
     És exactament el forat pel qual s'hi colaria qualsevol. */
  n.ledger.push({ id: 'x1', ts: '2026-06-01T09:00:00Z', type: 'temps', value: 3,
    memberId: s.marta, category: 'cuina' });
  await S.persist(n);
  const c = S.cromoCollection('Marta Vidal');
  return { tens: c.tens.length, pend: c.sensVerificar,
    forat: (c.faltes.find(f => f.cat === 'cuina') || {}).pendents };
}, seed);
ok(sense.tens === 0, 'apuntar-s\'ho un mateix no dóna cromo');
ok(sense.pend === 1 && sense.forat === 1,
  'però no s\'amaga: consta com a pendent de verificar al forat de «cuina»');

console.log('\n3 · Amb l\'aportació signada, el cromo apareix');
const amb = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  n.ledger = [];
  await S.pushLedger(n.ledger, { id: 'c1', ts: '2026-06-02T09:00:00Z', type: 'temps',
    value: 2, memberId: s.marta, category: 'cuina' });
  await S.persist(n);
  const c = S.cromoCollection('Marta Vidal');
  return { tens: c.tens.length, cat: (c.tens[0] || {}).cat, repes: c.repes.length, ver: c.verificades };
}, seed);
ok(amb.tens === 1 && amb.cat === 'cuina' && amb.ver === 1, 'un cromo de «cuina», i un de sol');
ok(amb.repes === 0, 'i encara no és repetit');

console.log('\n4 · El segon de la mateixa categoria és el repetit');
const repe = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  await S.pushLedger(n.ledger, { id: 'c2', ts: '2026-06-03T09:00:00Z', type: 'temps',
    value: 2, memberId: s.marta, category: 'cuina' });
  await S.persist(n);
  const c = S.cromoCollection('Marta Vidal');
  return { tens: c.tens.length, repes: c.repes.length, sobra: (c.repes[0] || {}).repes };
}, seed);
ok(repe.tens === 1 && repe.repes === 1 && repe.sobra === 1,
  'segueix sent un cromo de la col·lecció, amb 1 de repetit');

console.log('\n══ El que importa: el repetit no serveix sol, i no es transfereix ══');

console.log('\n5 · El repetit troba qui té el que et falta');
const swaps = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  /* Jordi té dos de «reparacions» (li'n sobra un) i cap de «cuina». */
  await S.pushLedger(n.ledger, { id: 'j1', ts: '2026-06-04T09:00:00Z', type: 'temps',
    value: 1, memberId: s.jordi, category: 'reparacions' });
  await S.pushLedger(n.ledger, { id: 'j2', ts: '2026-06-05T09:00:00Z', type: 'temps',
    value: 1, memberId: s.jordi, category: 'reparacions' });
  /* Núria té un de «jardineria»: no li'n sobra cap, així que no és recíproca. */
  await S.pushLedger(n.ledger, { id: 'u1', ts: '2026-06-06T09:00:00Z', type: 'temps',
    value: 1, memberId: s.nuria, category: 'jardineria' });
  await S.persist(n);
  const all = S.cromoSwaps('Marta Vidal');
  const jordi = all.find(x => /Jordi/.test(x.name)) || {};
  return { n: all.length, primer: (all[0] || {}).name, recip: (all[0] || {}).reciproc,
    etDona: jordi.etDona, liDones: jordi.liDones,
    nuria: (all.find(x => /Núria/.test(x.name)) || {}).reciproc };
}, seed);
ok(swaps.etDona && swaps.etDona.indexOf('reparacions') >= 0,
  'en Jordi et pot ensenyar el que li sobra: ' + JSON.stringify(swaps.etDona));
ok(swaps.liDones && swaps.liDones.indexOf('cuina') >= 0,
  'i tu li pots ensenyar el teu repetit: ' + JSON.stringify(swaps.liDones));
/* La regla del sprint: reciprocitat, no rànquing. Una llista encapçalada per gent
   a qui només pots demanar coses és un rànquing amb un altre nom. */
ok(swaps.recip === true && /Jordi/.test(swaps.primer || ''),
  'i el recíproc va primer, per davant de qui només et pot donar');
ok(swaps.nuria === false, 'la Núria hi surt marcada com a no recíproca, no amagada');

console.log('\n6 · Bescanviar no mou cap cromo: només et diu amb qui parlar');
const noMou = await page.evaluate(() => {
  const S = window.__SOS;
  const abans = S.cromoCollection('Marta Vidal').tens.length;
  const sw = S.cromoSwaps('Marta Vidal');
  S.openCromoModal('Marta Vidal');
  const btn = document.querySelector('[data-sw]');
  const teBoto = !!btn;
  if (btn) btn.click();
  const despres = S.cromoCollection('Marta Vidal').tens.length;
  const obert = !!document.querySelector('.modal');
  S.closeModal();
  return { abans, despres, teBoto, obert, api: typeof S.cromoTransfer };
});
ok(noMou.teBoto && noMou.abans === noMou.despres,
  'clicar el bescanvi no afegeix cap cromo (' + noMou.abans + ' → ' + noMou.despres + ')');
ok(noMou.api === 'undefined', 'i no hi ha cap funció per transferir-ne: no existeix a propòsit');

console.log('\n7 · La imatge diu el tier real i no filtra res');
const img = await page.evaluate(() => {
  const S = window.__SOS;
  const d = S.cromoCardData('Marta Vidal');
  const camps = Object.keys(d);
  /* El teu nom hi va a posta. El sedàs s'excusa nom a nom, i sense l'excusa ha
     de seguir cridant: si no ho fes, hauríem apagat el sedàs, no afinat-lo. */
  const v = S.verifyNoLeak(d, { allow: ['Marta Vidal'] });
  const armat = S.verifyNoLeak(d);
  /* I el d'algú altre no s'excusa mai, encara que passis el teu. */
  const altri = S.verifyNoLeak({ nom: 'Marta Vidal', nota: 'Jordi Puig' }, { allow: ['Marta Vidal'] });
  const url = S.cromoImage('Marta Vidal').toDataURL('image/png');
  const alies = S.cromoCardData('Marta Vidal', { alies: true });
  return { d, camps, leaks: v.leaks, ok: v.ok, armat: armat.ok, altri: altri.ok, len: url.length,
    png: url.slice(0, 22), tierReal: S.cromoTier(S.reputationOf('Marta Vidal').reputationScore).label,
    alies: alies.nom };
});
const BLANCA = ['nom', 'tier', 'aportacions', 'comunitats', 'hores', 'superpoders', 'cromos', 'deck'];
ok(img.camps.every(k => BLANCA.indexOf(k) >= 0),
  'cap camp fora de la llista blanca: ' + img.camps.join(', '));
ok(img.ok && (!img.leaks || !img.leaks.length),
  'el sedàs de sortida no hi troba res que no hi hagi de ser');
ok(img.armat === false, 'i sense l\'excusa el sedàs segueix cridant pel nom: no s\'ha apagat');
ok(img.altri === false, 'el nom d\'una altra persona no s\'excusa mai');
ok(img.d.tier === img.tierReal, 'el tier del cartell és el real (' + img.d.tier + '), no un d\'inventat');
ok(img.png === 'data:image/png;base64,', 'i surt un PNG de debò');
ok(img.len > 3000, 'amb contingut (' + Math.round(img.len / 1024) + ' KB en base64)');
ok(img.alies !== img.d.nom, 'es pot compartir sense el nom real: «' + img.alies + '»');

console.log('\n8 · El cartell porta escrit què no és');
const honest = await page.evaluate(() => {
  const S = window.__SOS;
  S.openCromoModal('Marta Vidal');
  const txt = document.querySelector('.modal').textContent.replace(/\s+/g, ' ');
  const prim = document.querySelectorAll('.modal .modal-actions .btn-primary').length;
  S.closeModal();
  return { txt, prim };
});
ok(/el que es bescanvia és l'hora/i.test(honest.txt),
  'es diu que el que es bescanvia és l\'hora, no el cromo');
ok(/no es pot aconseguir de cap altra manera/i.test(honest.txt),
  'i que no hi ha cap altra manera d\'aconseguir-lo');
ok(honest.prim === 1, 'una sola acció primària (' + honest.prim + ')');

console.log('\n9 · Funciona sense saber res del Comando, i s\'apaga');
const lent = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.setComandoLens(false);
  S.openCromoModal('Marta Vidal');
  const sense = document.querySelector('.modal').textContent.replace(/\s+/g, ' ');
  S.closeModal();
  await S.setComandoLens(true);
  S.openCromoModal('Marta Vidal');
  const amb = document.querySelector('.modal').textContent.replace(/\s+/g, ' ');
  S.closeModal();
  return { sense, amb };
});
ok(/cromos repes/i.test(lent.amb) && !/cromos repes/i.test(lent.sense),
  'la cita del Comando surt amb la lent encesa i no amb l\'apagada');
ok(/La col·lecció/.test(lent.sense) && /bescanviar/i.test(lent.sense),
  'i sense el Comando la col·lecció i el bescanvi hi són igual: el relat no els sosté');

console.log('\n10 · L\'estat buit no és un carreró');
const cul = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.setActivePersona('Ningú Encara');
  S.openCromoModal('Ningú Encara');
  const txt = document.querySelector('.modal').textContent.replace(/\s+/g, ' ');
  const prim = document.querySelectorAll('.modal .modal-actions .btn-primary').length;
  const teBaixa = !!document.querySelector('#crDown');
  S.closeModal();
  await S.setActivePersona('Marta Vidal');
  return { txt, prim, teBaixa };
});
ok(/apareix quan registres una aportació/i.test(cul.txt),
  'qui no en té llegeix què ha de fer, no un zero');
ok(!cul.teBaixa, 'i no hi ha res per baixar quan no hi ha res: no s\'ofereix un cartell buit');
ok(cul.prim === 1, 'també aquí una sola acció primària');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
