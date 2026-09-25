/* La portada del SOS diu què s'hi guanya, i ho diu amb xifres.
 *
 * `build-beneficis.js` ja vigila que el bloc surti de les taules de l'app
 * llegint el fitxer. El que es comprova aquí és l'altra meitat, i és la que
 * importa: que el que hi ha **escrit a la pantalla** coincideixi amb el que
 * l'aplicació **calcula de debò** un cop carregada.
 *
 * Són dues coses diferents. El generador pot llegir bé una taula i la pàgina
 * seguir dient una altra cosa si algú edita el bloc a mà; i una xifra de
 * portada que no quadra amb el que l'eina fa després és pitjor que no tenir-la,
 * perquè es descobreix quan ja s'hi ha entrat gent.
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
await page.waitForFunction(() => window.__SOS && window.__SOS.ORACLE_FMV_DEFAULTS);

console.log('\n1 · El bloc hi és, i és el primer que es llegeix després del dolor');
const on = await page.evaluate(() => {
  const bl = document.querySelector('.ob-benef');
  if (!bl) return null;
  const ordre = [...document.querySelectorAll('#onboarding .ob-pains, #onboarding .ob-benef, #onboarding .ob-paths')]
    .map(e => e.className.split(' ')[0]);
  return { n: bl.querySelectorAll('.obb').length, ordre, xifres: bl.querySelectorAll('.obb-n').length };
});
ok(!!on, 'la portada porta el bloc de beneficis');
ok(on && on.n === 3, 'amb tres beneficis: el fons, el que s\'aprèn i el que s\'estalvia');
ok(on && on.xifres >= 5, `i ${on ? on.xifres : 0} xifres, no adjectius`);
ok(on && on.ordre.join(',') === 'ob-pains,ob-benef,ob-paths',
  'i va entre el dolor i les portes: primer per què, després per on s\'entra');

console.log('\n2 · Les xifres de la pantalla són les que l\'app calcula');
const x = await page.evaluate(() => {
  const S = window.__SOS;
  const t = document.querySelector('.ob-benef').innerText;
  const fmv = Object.values(S.ORACLE_FMV_DEFAULTS);
  return {
    text: t,
    hMin: Math.min(...fmv), hMax: Math.max(...fmv), hBase: S.ORACLE_FMV_DEFAULTS.altres,
    incert: Math.round(S.FUND_UNCERTAINTY * 100),
    moduls: S.FORMACIO_MODULES.length,
    /* El préstec que el bloc posa d'exemple s'ha de poder recalcular amb les
       funcions de l'app, no amb una multiplicació escrita aquí. */
    presta: (() => {
      const node = S.newNode('Prova beneficis', 'barri', null);
      const o = { typology: 'electronica', years: 0 };
      const base = S.oracleObjectValue(node, o);
      return { base, eur: S.loanValue(node, o).eur, pct: S.loanValue(node, o).pct };
    })()
  };
});
const diu = s => x.text.includes(s);
ok(diu(x.hMin + '–' + x.hMax + ' €/h'), `la forquilla de l'hora és la de l'oracle: ${x.hMin}–${x.hMax} €/h`);
ok(diu(x.hBase + ' €/h'), `i la tarifa de referència també: ${x.hBase} €/h`);
ok(diu('± ' + x.incert + ' %'), `la forquilla del fons és la de FUND_UNCERTAINTY: ± ${x.incert} %`);
ok(diu(x.moduls + ' mòduls'), `els mòduls són els que hi ha: ${x.moduls}`);
ok(diu(String(x.presta.base) + ' €'), `el valor de l'objecte de l'exemple el dona oracleObjectValue: ${x.presta.base} €`);
ok(diu(String(x.presta.eur).replace('.', ',') + ' €'), `i el cost del préstec el dona loanValue: ${x.presta.eur} €`);
ok(x.presta.eur < x.presta.base / 2, 'i agafar prestat segueix estalviant de debò');

console.log('\n3 · Cap xifra sense dir d\'on surt ni que és una estimació');
const f = await page.evaluate(() => {
  const t = document.querySelector('.ob-benef').innerText;
  return {
    font: /valors de referència que porta el SOS/.test(t),
    canviable: /node per node|cada node pot canviar/.test(t),
    estimacio: /estimaci/i.test(t),
    noFactura: /no com una factura/.test(t)
  };
});
ok(f.font, 'diu que són els valors de referència del SOS');
ok(f.canviable, 'i que cada node els pot canviar, que és el que les fa seves');
ok(f.estimacio && f.noFactura, 'i que es publiquen com a estimació, no com a comptabilitat tancada');

console.log('\n4 · La lectura d\'organització, amb la condició que la fa acceptable');
const r = await page.evaluate(() => {
  const t = document.querySelector('.ob-benef').innerText;
  return {
    rsc: /responsabilitat social/i.test(t),
    qui: /empresa/i.test(t) && /cooperativa/i.test(t) && /federació/i.test(t),
    /* Sense aquesta frase, un programa de RSC és una manera que l'empresa es
       quedi el que hi aporta la gent. És la condició, no un afegit. */
    registre: /queda al seu registre/.test(t) && /no al de l'empresa/.test(t)
  };
});
ok(r.rsc, 'es diu que serveix per a un programa de RSC amb les pròpies persones');
ok(r.qui, 'i a qui: empresa, cooperativa i federació d\'entitats');
ok(r.registre, 'i que el que aporta cada persona queda al seu registre, no al de l\'empresa');

console.log('\n5 · I el focus segueix sent comunitari');
const c = await page.evaluate(() => {
  const ob = document.getElementById('onboarding').innerText;
  return { veinal: /veïnal/i.test(ob), barri: /barri/i.test(ob),
    obre: /organització|xarxa d'entitats/i.test(ob) };
});
ok(c.veinal && c.barri, 'la portada segueix parlant del barri i del veïnat');
ok(c.obre, 'i obre l\'esquelet a una organització o una xarxa sense deixar-ho');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
