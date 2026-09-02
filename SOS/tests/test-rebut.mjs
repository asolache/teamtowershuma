/* El rebut · la tercera anotació
   ──────────────────────────────
   La partida doble té dos llibres i, per tant, un problema: els dos poden no
   dir el mateix, i resoldre-ho són dues feines caríssimes —conciliar-los línia
   a línia i, si hi ha prou diners a sobre, pagar algú perquè reconstrueixi què
   va passar.

   La triple entrada afegeix una anotació que no és de cap dels dos: un rebut
   signat pels dos que tots dos guarden igual. Al SOS les tres anotacions hi
   eren **en potència** —l'apunt signat, el vistiplau signat i el registre
   públic— però el rebut no existia com a objecte, i el vistiplau entrava al
   llibre **sense la firma**. Un rebut que no es pot treure del dispositiu i
   comprovar a fora no és una tercera anotació: és una nota al marge del primer
   llibre.

   El que es prova aquí és exactament això:

   · **El vistiplau entra al llibre amb la seva firma**, i es verifica des del
     llibre mateix. Sense això, «confirmat per Bru» és una afirmació que no pot
     comprovar ningú — i el rànquing en repartia punts.
   · **El rebut porta l'apunt tal com es va signar**, no una còpia amb els camps
     que a algú li semblin importants: si en falta un, la firma deixa de
     verificar-se i el rebut només val dins de l'app que el va fer.
   · **El resum llegible no pot mentir sobre la firma.** És el frau més fàcil
     amb un rebut a la mà: que el text digui trenta hores i la signatura tres.
   · **Un vistiplau antic no es diu trencat.** No ho està: és d'un altre
     esquema. Però tampoc compta com a prova. Veda 64.
   · **La petjada del rebut és la mateixa que va al registre**, i per tant la
     prova d'inclusió no és una segona cosa a mantenir. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.buildRebut);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

/* Una aportació amb contrapart de debò: la fitxa de l'altra banda porta el
   `did` d'aquest navegador i una reclamació, que és l'única manera que el seu
   vistiplau valgui alguna cosa. */
await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Banc del rebut', 'projecte', null);
  n.ledger = []; S.state.nodes.push(n);
  const id = await S.getIdentity();
  const anna = S.newMember({ name: 'Anna' }), bru = S.newMember({ name: 'Bru' });
  bru.did = id.did; bru.claim = { did: bru.did };
  S.membersOf(n).push(anna, bru);
  await S.submitEntry(n, { id: 'r1', ts: '2026-05-01T09:00:00Z', type: 'temps', value: 3,
    what: 'Hort comunitari', memberId: anna.id, counterpartId: bru.id }, anna.id);
});

console.log('\n1 · Sense el vistiplau de l\'altra banda no hi ha apunt, i amb ell hi ha firma');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS, n = S.state.nodes.find(x => x.name === 'Banc del rebut');
    const abans = (n.ledger || []).length;
    const p = S.pendingOf(n)[0];
    await S.confirmPending(n, p, S.membersOf(n).find(m => m.name === 'Bru').id);
    const e = n.ledger[0];
    return { abans, despres: n.ledger.length,
      teSig: !!(e.confirmedBy[0] || {}).sig,
      verifica: await S.verifyRecord(e.confirmedBy[0]),
      camps: Object.keys(e.confirmedBy[0] || {}) };
  });
  ok(r.abans === 0 && r.despres === 1,
    'un apunt amb contrapart no entra al llibre fins que l\'altra banda hi diu la seva');
  ok(r.teSig, `el vistiplau entra al llibre sencer (${r.camps.join(', ')}): la firma no es queda fora`);
  ok(r.verifica.ok,
    'i es verifica des del llibre mateix — «confirmat per Bru» deixa de ser una afirmació de ningú');
}

console.log('\n2 · El rebut és portàtil: es comprova sense l\'app, el node ni nosaltres');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS, n = S.state.nodes.find(x => x.name === 'Banc del rebut');
    const rb = await S.buildRebut(n, n.ledger[0]);
    return { camps: Object.keys(rb), blanca: S.REBUT_CAMPS, v: await S.verifyRebut(rb),
      llegible: rb.fet, teApunt: !!(rb.apunt && rb.apunt.sig) };
  });
  ok(r.camps.join(',') === r.blanca.join(','),
    `porta exactament els camps declarats: ${r.camps.join(', ')}`);
  ok(r.teApunt, 'inclòs l\'apunt tal com es va signar, que és el que fa que la firma es pugui comprovar fora');
  ok(r.v.ok && r.v.dona && r.v.signat === 1,
    'i verifica sencer: la firma de qui l\'escriu i el vistiplau de l\'altra banda');
  ok(r.v.tresAnotacions,
    'les tres anotacions hi són — amb això no hi ha res a conciliar: dues còpies no poden discrepar');
  ok(r.llegible.que === 'Hort comunitari' && r.llegible.quant === 3,
    `i es pot llegir sense eines: «${r.llegible.que}», ${r.llegible.quant} h`);
}

console.log('\n3 · Tocar-lo es nota, i el resum no pot mentir sobre la firma');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS, n = S.state.nodes.find(x => x.name === 'Banc del rebut');
    const base = await S.buildRebut(n, n.ledger[0]);
    /* El CID es refà a cada manipulació. Sense això tot petaria al primer
       control i les comprovacions de després no s'executarien mai: una
       comprovació que no s'arriba a executar és decoració. Aquí es fa de compte
       que qui manipula sap el que fa. */
    const refes = async o => { const { cid, ...rest } = o;
      o.cid = 'sha256:' + await S.sha256(new TextEncoder().encode(S._canonAll(rest))); return o; };
    const clon = () => JSON.parse(JSON.stringify(base));
    const cru = clon(); cru.fet.quant = 30;
    const menteix = await refes(clon()); menteix.fet.quant = 30; await refes(menteix);
    const inflat = clon(); inflat.apunt.value = 30; inflat.fet.quant = 30; await refes(inflat);
    const colat = clon();
    colat.vistiplaus = colat.vistiplaus.concat([{ name: 'Ningú', did: 'did:sos:ed25519:FALS',
      ts: '2026-05-02T00:00:00Z', sig: 'x' }]);
    await refes(colat);
    return { cru: await S.verifyRebut(cru), menteix: await S.verifyRebut(menteix),
      inflat: await S.verifyRebut(inflat), colat: await S.verifyRebut(colat) };
  });
  ok(!r.cru.ok && /tocat/.test(r.cru.per),
    `canviar una xifra i prou el trenca de seguida: «${r.cru.per}»`);
  ok(!r.menteix.ok && /el que el rebut diu i el que porta signat/.test(r.menteix.per),
    'i refent el CID tampoc cola: el text diria 30 h i la firma en diu 3');
  ok(!r.inflat.ok && !r.inflat.dona,
    'inflar la xifra dins de l\'apunt trenca la firma de qui l\'escriu, que és on hauria d\'anar a parar');
  ok(r.colat.vistiplaus.some(v => !v.ok && /no és a l/.test(v.per || '')),
    'i un vistiplau afegit al rebut que no és a l\'apunt signat no compta com a prova');
}

console.log('\n4 · Un vistiplau antic no es diu trencat, però tampoc prova res');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS;
    /* Un apunt de l'esquema vell de debò: signat com sempre, però amb el
       vistiplau reduït a nom, did i data, que és com hi entraven abans. No es
       manipula un rebut ja fet —això trencaria la firma i provaria una altra
       cosa—: es fa néixer l'apunt tal com naixien llavors. */
    const n = S.newNode('Node de fa temps', 'projecte', null);
    n.ledger = []; S.state.nodes.push(n);
    const vell = S.newMember({ name: 'Antiga' }); S.membersOf(n).push(vell);
    await S.pushLedger(n.ledger, { id: 'v1', ts: '2020-01-01T00:00:00Z', type: 'temps', value: 2,
      what: 'Feina de fa temps', memberId: vell.id,
      confirmedBy: [{ name: 'Vell', did: 'did:sos:ed25519:VELL', ts: '2020-01-01T00:00:00Z' }] });
    return await S.verifyRebut(await S.buildRebut(n, n.ledger[0]));
  });
  ok(r.antics === 1 && r.vistiplaus[0].antic,
    'es marca com a antic i no com a invàlid: marcar de corrupte el que ningú ha tocat ' +
    'és la manera més ràpida que algú deixi de refiar-se del verificador');
  ok(r.dona, 'l\'apunt segueix sent vàlid: no és una cadena trencada, és un esquema anterior');
  ok(!r.tresAnotacions && /paraula d'una banda/.test(r.per || ''),
    `però no compta com a tercera anotació: «${r.per}»`);
}

console.log('\n5 · Un apunt sense firma no fa rebut, i es diu per què');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS;
    const n = S.newNode('Node cru', 'projecte', null); n.ledger = []; S.state.nodes.push(n);
    n.ledger.push({ id: 'cru', ts: '2026-01-01T00:00:00Z', type: 'temps', value: 1 });
    try { await S.buildRebut(n, n.ledger[0]); return { err: '' }; }
    catch (e) { return { err: e.msg || String(e) }; }
  });
  ok(/sense firma no fa rebut/.test(r.err), `«${r.err}»`);
}

console.log('\n6 · La petjada del rebut és la del registre: una sola cosa a mantenir');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS, n = S.state.nodes.find(x => x.name === 'Banc del rebut');
    const rb = await S.buildRebut(n, n.ledger[0]);
    const pack = await S.buildRegisterPack();
    return { hash: rb.fet.hash, esFulla: (pack.leaves || []).indexOf(rb.fet.hash) >= 0,
      reg: await S.rebutAlRegistre(rb) };
  });
  ok(!!r.hash && r.esFulla,
    'la petjada que porta el rebut és una fulla del registre: la prova d\'inclusió és la mateixa');
  ok(!r.reg.ok && !!r.reg.per,
    `i sense cap versió publicada es diu que encara no hi és, no que sí: «${r.reg.per}»`);
}

console.log('\n7 · A la pantalla');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS, n = S.state.nodes.find(x => x.name === 'Banc del rebut');
    S.openRebut(n, n.ledger[0]);
    await new Promise(res => setTimeout(res, 500));
    const m = document.querySelector('.modal');
    const txt = m ? m.textContent.replace(/\s+/g, ' ') : '';
    const botons = [...(m ? m.querySelectorAll('button') : [])].map(x => x.id).filter(Boolean);
    S.closeModal();
    return { txt, botons };
  });
  ok(/tercera anotació/.test(r.txt), 'la pantalla anomena la cosa pel seu nom');
  ok(/firma verificada|vistiplau signat i verificat/.test(r.txt),
    'ensenya les firmes comprovades aquí mateix, no un segell');
  ok(/No prova que el fet sigui cert/.test(r.txt),
    'i diu què NO prova: confondre-ho és el que fa que algú es pensi que això substitueix la confiança');
  ok(r.botons.indexOf('rbDl') >= 0 && r.botons.indexOf('rbCopy') >= 0,
    'i se\'l pot endur: baixar-lo i copiar-lo');
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
