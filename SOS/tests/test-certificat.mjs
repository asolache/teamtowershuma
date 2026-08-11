/* V79 · El certificat del rol.
   La landing promet «un certificat del rol que hagis exercit». El risc d'un
   certificat no és que no es generi: és que es generi bé i digui una cosa que
   no és certa. Per això aquí gairebé tot són intents de fer-lo mentir —canviar
   el rol a mà, esborrar l'evidència, enganxar una confirmació falsa— i
   comprovar que en cada intent ho diu. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.buildCertificate);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Banc de Temps de Sitges', 'projecte', null);
  n.dynamicType = 'banc_temps'; n.ledger = [];
  S.seedFromDynamic(n, S.dynById('banc_temps'));
  const marta = S.newMember({ name: 'Marta Vidal' });
  S.membersOf(n).push(marta);
  S.state.nodes.push(n); await S.persist(n);
  await S.setActivePersona('Marta Vidal');
  return { id: n.id, marta: marta.id };
});

console.log('\n1 · Sense feina no hi ha certificat, i es diu per què');
const buit = await page.evaluate(async () => {
  const S = window.__SOS;
  const ev = S.certEvidence('Marta Vidal');
  S.openCromoModal && S.closeModal();
  S.openCertificate('Marta Vidal');
  const txt = document.querySelector('.modal').textContent.replace(/\s+/g, ' ');
  const teEmet = !!document.querySelector('#ceJson');
  const prim = document.querySelectorAll('.modal .modal-actions .btn-primary').length;
  S.closeModal();
  return { signades: ev.signades, txt, teEmet, prim };
});
ok(buit.signades === 0 && !buit.teEmet, 'amb el registre buit no hi ha res per emetre');
ok(/Encara no hi ha res a certificar/i.test(buit.txt), 'i es diu què cal fer, no un zero');
ok(buit.prim === 1, 'una sola acció primària (' + buit.prim + ')');

console.log('\n2 · Amb feina registrada, el rol es dedueix i no es tria');
const fet = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  const dies = ['2026-05-04', '2026-05-11', '2026-05-18', '2026-05-25'];
  for (let i = 0; i < dies.length; i++)
    await S.pushLedger(n.ledger, { id: 'c' + i, ts: dies[i] + 'T09:00:00Z', type: 'temps',
      value: 3, memberId: s.marta, category: i % 2 ? 'cures' : 'cuina',
      what: 'he acompanyat la Maria Puig al metge' });
  await S.persist(n);
  const cert = await S.buildCertificate('Marta Vidal', { programa: 'Programa Pioneres' });
  const v = await S.verifyCertificate(cert);
  return { rol: cert.rol, ev: cert.evidencia, periode: cert.periode, v, nota: cert.nota,
    teSig: !!cert.sig, did: (cert.signer || {}).did || '' };
}, seed);
ok(fet.rol.id === 'superheroi', 'el rol surt de l\'evidència: ' + fet.rol.id);
ok(/4 aportacions signades/.test(fet.rol.why), 'i porta el perquè: «' + fet.rol.why + '»');
ok(fet.v.ok && fet.v.firma && fet.v.rolOk, 'verifica: firma correcta i rol recalculat igual');
ok(fet.teSig && /^did:/.test(fet.did), 'el signa la persona, no cap emissor: ' + fet.did.slice(0, 22) + '…');
ok(fet.periode.dies === 22, 'el període surt del registre: ' + fet.periode.dies + ' dies');

console.log('\n══ El que importa: que no es pugui fer mentir ══');

console.log('\n3 · Canviar-se el rol a mà trenca la firma');
const trampa = await page.evaluate(async () => {
  const S = window.__SOS;
  const c = await S.buildCertificate('Marta Vidal');
  c.rol.id = 'guardian'; c.rol.label = 'Guardian del territori';
  const v = await S.verifyCertificate(c);
  return { ok: v.ok, firma: v.firma, rolOk: v.rolOk, decl: v.rolDeclarat, calc: v.rolRecalculat, reason: v.reason };
});
ok(!trampa.ok, 'un certificat retocat no verifica');
ok(!trampa.rolOk && trampa.decl === 'guardian' && trampa.calc === 'superheroi',
  'i es diu exactament què no quadra: hi posa «' + trampa.decl + '» i de l\'evidència en surt «' + trampa.calc + '»');

/* La trampa de debò no és canviar el rol: és canviar el rol I l'evidència, i
   tornar a signar amb la teva pròpia clau. La firma serà impecable. El que
   ho atura és que el rol es recalcula des de l'evidència del propi paquet. */
console.log('\n4 · La trampa bona: reescriure-ho tot i tornar a signar');
const trampa2 = await page.evaluate(async () => {
  const S = window.__SOS;
  const c = await S.buildCertificate('Marta Vidal');
  c.rol = { id: 'mentor', label: 'Mentor/a d\'iniciatives', why: 'Acompanya 9 iniciatives' };
  /* Tornat a firmar com cal, que és el que faria qui conegui el format. */
  await S.signCertificate(c);
  const v = await S.verifyCertificate(c);
  return { ok: v.ok, firma: v.firma, rolOk: v.rolOk, calc: v.rolRecalculat };
});
ok(trampa2.firma === true, 'la firma torna a ser vàlida —és la seva clau, i ho ha de ser');
ok(!trampa2.ok && !trampa2.rolOk,
  'i tot i així el certificat no val: el rol no surt de l\'evidència que porta ell mateix');

console.log('\n5 · Inflar l\'evidència tampoc cola sense haver-la registrat');
const inflat = await page.evaluate(async () => {
  const S = window.__SOS;
  const c = await S.buildCertificate('Marta Vidal');
  const abans = c.evidencia.signades;
  c.evidencia.signades = 500; c.evidencia.hores = 900;
  await S.signCertificate(c);
  const v = await S.verifyCertificate(c);
  /* El rol segueix quadrant (500 signades també és superheroi), i és per això
     que els hashes hi són: amb el registre a la mà, es compten. */
  return { abans, ok: v.ok, hashes: c.evidencia.hashes.length, diu: c.evidencia.signades };
});
ok(inflat.hashes === inflat.abans && inflat.diu === 500,
  'el número es pot inflar (' + inflat.diu + ') però els hashes segueixen sent ' + inflat.hashes);
ok(inflat.hashes > 0, 'i per això hi van: qui tingui el registre pot comptar-los un a un');

console.log('\n6 · La confirmació de qui acompanya no és la font del rol');
const conf = await page.evaluate(async () => {
  const S = window.__SOS;
  const c = await S.buildCertificate('Marta Vidal');
  const sense = await S.verifyCertificate(c);
  await S.confirmCertificate(c, 'He acompanyat aquestes tres setmanes');
  const amb = await S.verifyCertificate(c);
  /* Una confirmació inventada: text signat per ningú. */
  c.confirmacions.push({ sobre: 'x', text: 'jo dic que sí', ts: new Date().toISOString() });
  const falsa = await S.verifyCertificate(c);
  return { sense: sense.ok, amb: amb.ok, n: amb.confirmacions.length,
    confOk: amb.confirmacions[0].ok, falsaOk: falsa.confirmacions[1].ok, packOk: falsa.ok };
});
ok(conf.sense === true, 'un certificat sense cap confirmació ja és vàlid');
ok(conf.amb === true && conf.n === 1 && conf.confOk, 'i amb la del mentor, segueix vàlid i ella també verifica');
ok(conf.falsaOk === false, 'una confirmació sense firma es marca com a no vàlida');
ok(conf.packOk === true,
  'i no tomba el certificat: qui menteix és el testimoni, no la persona');

console.log('\n7 · El text lliure del registre no hi entra');
const fuita = await page.evaluate(async () => {
  const S = window.__SOS;
  const c = await S.buildCertificate('Marta Vidal');
  const json = JSON.stringify(c);
  const v = S.verifyNoLeak(c, { allow: ['Marta Vidal'] });
  return { teFrase: /Maria Puig|acompanyat la Maria/.test(json), ok: v.ok, leaks: v.leaks };
});
ok(!fuita.teFrase, 'la frase de l\'apunt («…la Maria Puig al metge») no viatja al certificat');
ok(fuita.ok, 'i el sedàs de sortida no hi troba res que no hi hagi de ser');

console.log('\n8 · Qui el rep el comprova pel verificador de sempre');
const rebut = await page.evaluate(async () => {
  const S = window.__SOS;
  const c = await S.buildCertificate('Marta Vidal', { programa: 'Programa Pioneres' });
  /* Tal com arribaria: text pel canal que sigui, i de tornada a objecte. */
  const v = await S.verifyPack(JSON.parse(JSON.stringify(c)));
  const dolent = await S.verifyPack(JSON.parse(JSON.stringify(c).replace(/"superheroi"/, '"guardian"')));
  return { kind: v.kind, ok: v.ok, note: v.note, dolentOk: dolent.ok, dolentReason: dolent.reason };
});
ok(rebut.ok && rebut.kind === 'sos-certificat-rol',
  'entra pel verificador genèric, sense porta pròpia');
ok(/sense confirmacions de tercers, i segueix sent vàlid/.test(rebut.note || ''),
  'i el veredicte ho diu tot: «' + String(rebut.note).slice(0, 78) + '…»');
ok(!rebut.dolentOk, 'un de manipulat pel camí el verificador el rebutja (' + rebut.dolentReason + ')');

console.log('\n9 · El que promet la landing, dit al paquet');
const promesa = await page.evaluate(async () => {
  const S = window.__SOS;
  const c = await S.buildCertificate('Marta Vidal', { programa: 'Programa Pioneres' });
  return { txt: S.certificateText(c), noEs: c.noEs.join(' ') };
});
ok(/No és un diploma d'assistència/.test(promesa.noEs) && /No té reconeixement oficial/.test(promesa.noEs),
  'el paquet porta a dins què NO és, perquè viatja sol');
ok(/No l'atorga ningú/.test(promesa.noEs), 'i que no l\'atorga ningú');
ok(/Comprova'l/.test(promesa.txt) && /Signat per: did:/.test(promesa.txt),
  'i la versió en text diu com comprovar-lo i qui el signa');
/* El català no perdona: «1 comunitats» al certificat d'algú és el detall que fa
   que sembli generat per una màquina que no el llegia. */
ok(!/\b1 (comunitats|dies|hores registrades|aportacions)/.test(promesa.txt),
  'i cap singular escrit en plural');

console.log('\n10 · Un període més curt que el programa es diu, no s\'amaga');
const curt = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  n.ledger = [];
  await S.pushLedger(n.ledger, { id: 'x1', ts: '2026-06-01T09:00:00Z', type: 'temps', value: 2,
    memberId: s.marta, category: 'cuina' });
  await S.pushLedger(n.ledger, { id: 'x2', ts: '2026-06-04T09:00:00Z', type: 'temps', value: 2,
    memberId: s.marta, category: 'cuina' });
  await S.persist(n);
  const c = await S.buildCertificate('Marta Vidal', { programa: 'Programa Pioneres' });
  const v = await S.verifyCertificate(c);
  return { dies: c.periode.dies, nota: c.nota, ok: v.ok };
}, seed);
ok(curt.dies === 4 && /4 dies, menys de les tres setmanes/.test(curt.nota),
  'ho diu a dins: «' + curt.nota + '»');
ok(curt.ok, 'i s\'emet igualment: el període és un fet, no un examen');

console.log('\n11 · El rol certificat és el mateix que l\'app dedueix');
const coherent = await page.evaluate(async (s) => {
  const S = window.__SOS;
  const app = S.rolesOfPersonIn(S.byId(s.id), 'Marta Vidal').map(r => r.role);
  const cert = S.certRole(S.certEvidence('Marta Vidal')).id;
  return { app, cert };
}, seed);
ok(coherent.app.indexOf(coherent.cert) >= 0,
  'el certificat diu «' + coherent.cert + '» i l\'app en dedueix [' + coherent.app.join(', ') + ']');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
