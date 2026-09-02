/* Les còpies · per defecte, i sense mentir sobre elles
   ────────────────────────────────────────────────────
   Tot el SOS viu al navegador d'un dispositiu. Sense còpia, un mòbil perdut se
   l'emporta — i la identitat és l'única part que **no es pot refer**: sense la
   clau, el que vas signar segueix valent però ja no el pots continuar tu.

   El que un navegador **no** pot fer és desar un fitxer sol. Per tant «per
   defecte» aquí no vol dir automàtic, i el pitjor que podria fer aquesta
   pantalla és dir-te que ja tens còpia quan no en tens. El que es prova:

   · **Es demana sol**, amb un llindar declarat i encès per defecte.
   · **L'estat es desa quan s'ha baixat un fitxer**, no quan algú obre la
     pantalla.
   · **No es diu «estàs protegit»**: es diu l'últim cop que en vas fer una, i
     que si el fitxer encara existeix això no ho sap ningú des d'aquí.
   · **La identitat es compta a part**, perquè una còpia de tot sense identitat
     no protegeix la clau. */
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
await page.waitForFunction(() => window.__SOS && window.__SOS.copiaEstat);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

console.log('\n1 · Un SOS acabat d\'estrenar no demana res, i no diu que tingui còpia');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS;
    return { e: await S.copiaEstat(), dies: S.COPIA_DIES, apunts: S.COPIA_APUNTS };
  });
  ok(r.e.mai && !r.e.cal,
    'sense cap apunt no hi ha res a perdre i no es molesta ningú');
  ok(r.e.recorda === true, 'però el recordatori ve encès per defecte, no s\'ha d\'anar a buscar');
  ok(r.e.identitat === false,
    'i la identitat consta com a NO copiada, que és la veritat el primer dia');
  ok(r.dies > 0 && r.apunts > 0,
    `el llindar està declarat i és mirable: cada ${r.dies} dies o ${r.apunts} apunts nous`);
}

console.log('\n2 · Amb feina registrada i cap còpia, es demana — i es diu per què');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS;
    const n = S.newNode('Banc de la còpia', 'projecte', null);
    n.ledger = []; S.state.nodes.push(n);
    const m = S.newMember({ name: 'Anna' }); S.membersOf(n).push(m);
    for (let i = 0; i < 3; i++)
      await S.pushLedger(n.ledger, { id: 'c' + i, ts: '2026-05-0' + (i + 1) + 'T09:00:00Z',
        type: 'temps', value: 2, what: 'Feina ' + i, memberId: m.id });
    await S.persist(n);
    S.updatePendingBadge();
    await new Promise(r2 => setTimeout(r2, 300));
    return { e: await S.copiaEstat(), pastilla: !!document.getElementById('copiaBadge'),
      etiqueta: (document.getElementById('copiaBadge') || {}).ariaLabel || '' };
  });
  ok(r.e.cal && r.e.apunts === 3, `amb ${r.e.apunts} apunts i cap còpia, es demana`);
  ok(/encara no has fet cap còpia/.test(r.e.per), `i es diu el motiu: «${r.e.per}»`);
  ok(r.pastilla, 'la pastilla surt a la barra de dalt');
  ok(/Fes una còpia/.test(r.etiqueta), `amb una etiqueta que diu què és: «${r.etiqueta}»`);
}

console.log('\n3 · L\'estat es desa quan hi ha fitxer, no quan s\'obre la pantalla');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS;
    S.openCopiaAvis();
    await new Promise(r2 => setTimeout(r2, 300));
    const txt = document.querySelector('.modal').textContent.replace(/\s+/g, ' ');
    S.closeModal();
    const nomesMirar = await S.copiaEstat();
    /* Ara sí: una còpia de debò, com la que fa el botó de descarregar. */
    const pack = await S.exportBackup('', { withIdentity: true });
    await S.copiaMarca({ identitat: true, total: pack.count });
    const despres = await S.copiaEstat();
    return { txt, nomesMirar, despres };
  });
  ok(r.nomesMirar.mai,
    'obrir la pantalla i tancar-la no compta com a còpia: el que es desa és que hi ha hagut un fitxer');
  ok(!r.despres.mai && r.despres.dies === 0 && !r.despres.cal,
    'després de baixar-ne una de debò, la pastilla se\'n va sola');
  ok(r.despres.identitat, 'i la identitat consta copiada perquè hi anava a dins');
  ok(/no pot desar un fitxer sol/.test(r.txt),
    'la pantalla diu que això és un recordatori i no una còpia automàtica');
  ok(/no ho pot saber ningú des d'aquí|no que el fitxer encara existeixi/.test(r.txt),
    'i que saber si el fitxer encara existeix no ho pot saber ningú des d\'aquí');
}

console.log('\n4 · Torna a demanar-ho quan hi ha prou feina nova');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS;
    const n = S.state.nodes.find(x => x.name === 'Banc de la còpia');
    const m = S.membersOf(n)[0];
    const abans = await S.copiaEstat();
    for (let i = 0; i < S.COPIA_APUNTS; i++)
      await S.pushLedger(n.ledger, { id: 'n' + i, ts: '2026-06-01T09:00:00Z', type: 'temps',
        value: 1, what: 'Més feina ' + i, memberId: m.id });
    const despres = await S.copiaEstat();
    return { abans, despres, llindar: S.COPIA_APUNTS };
  });
  ok(!r.abans.cal, 'just després de copiar no molesta');
  ok(r.despres.cal && r.despres.nous >= r.llindar,
    `i amb ${r.despres.nous} apunts nous torna a demanar-ho`);
  ok(/has registrat \d+ apunts des de l'última còpia/.test(r.despres.per),
    `dient exactament què ha canviat: «${r.despres.per}»`);
}

console.log('\n5 · Es pot apagar, i llavors calla de debò');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS;
    await S.copiaRecorda(false);
    const apagat = await S.copiaEstat();
    S.updateCopiaBadge();
    await new Promise(r2 => setTimeout(r2, 250));
    const pastilla = !!document.getElementById('copiaBadge');
    await S.copiaRecorda(true);
    const ences = await S.copiaEstat();
    return { apagat, pastilla, ences };
  });
  ok(!r.apagat.cal && !r.pastilla, 'apagat, no es demana i la pastilla se\'n va');
  ok(r.apagat.nous > 0,
    'però l\'estat segueix sent el de debò: apagar l\'avís no fa veure que hi hagi còpia');
  ok(r.ences.cal, 'i tornant-lo a encendre, hi torna a ser');
}

console.log('\n6 · La identitat es compta a part de tot el altre');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS;
    /* Una còpia SENSE identitat: protegeix les dades i no la clau, i el que es
       diu de la identitat no pot canviar per això. */
    const pack = await S.exportBackup('', { withIdentity: false });
    await S.copiaMarca({ identitat: false, total: pack.count });
    const e = await S.copiaEstat();
    return { e, teIdentitat: pack.hasIdentity };
  });
  ok(!r.teIdentitat, 'una còpia sense identitat no en porta: el fitxer diu la veritat sobre si mateix');
  ok(r.e.identitat,
    'i la data de la còpia d\'identitat es guarda a part, o sigui que una còpia sense identitat ' +
    'no esborra que abans sí que se n\'havia fet una');
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
