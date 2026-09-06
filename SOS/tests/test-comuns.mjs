/* El banc de temps i la biblioteca de les coses · les dues d'entrada fàcil
   ─────────────────────────────────────────────────────────────────────────
   Sis de les dotze dinàmiques tenien pàgina i les dues per on comença tothom,
   no. La temptació d'aquestes dues és que són fàcils d'explicar bonic, i una
   pàgina bonica d'un banc de temps no ajuda ningú a muntar-ne un.

   El que es prova aquí és **l'aritmètica que decideix**, que és l'única part
   que pot mentir sense que es noti:

   · Al banc de temps, que la mitjana amb signe **no mesura res** —surt zero
     sempre que els números lliguin— i que la que compta és la distància
     mitjana al zero. Un grup pot tenir mitjana zero i estar trencat, i aquest
     és exactament el cas que la pàgina ensenya.
   · A la biblioteca, que el valor d'un préstec és el mateix que calcularia
     l'eina: valor base depreciat per anys, amb terra al 30 %, per la taxa de
     desgast de la tipologia. Si divergissin, algú acordaria les normes del seu
     barri amb una xifra i el SOS en registraria una altra. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const F = p => 'file://' + join(DIR, p);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const nova = async (f, w = 1100, h = 1000) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(F(f));
  return { ctx, p, errs };
};

console.log('\n1 · El saldo: la mitjana amb signe no mesura res');
{
  const { ctx, p, errs } = await nova('banc-temps.html');
  await p.waitForFunction(() => window.__BDT);
  const r = await p.evaluate(() => {
    const B = window.__BDT;
    /* Un grup trencat que **sembla** perfecte: dues persones sostenen el banc i
       dues no han tornat res. La mitjana amb signe és zero exacte. */
    B.estat().length = 0;
    B.afegeix('Dona', 20, 0); B.afegeix('Dona2', 20, 0);
    B.afegeix('Rep', 0, 20); B.afegeix('Rep2', 0, 20);
    const trencat = B.salut(B.estat());
    /* I un de sa: tothom prop del zero. */
    B.estat().length = 0;
    B.afegeix('A', 5, 4); B.afegeix('B', 4, 5); B.afegeix('C', 6, 6);
    const sa = B.salut(B.estat());
    return { trencat: { signe: trencat.ambSigne, abs: trencat.absMitja, quadra: trencat.quadra },
      sa: { signe: sa.ambSigne, abs: sa.absMitja, quadra: sa.quadra } };
  });
  ok(r.trencat.signe === 0 && r.sa.signe === 0,
    'les dues situacions tenen la mateixa mitjana amb signe: zero');
  ok(r.trencat.abs === 20 && r.sa.abs < 1,
    `i la distància al zero les separa: ${r.trencat.abs} h contra ${r.sa.abs.toFixed(1)} h`);
  ok(r.trencat.quadra && r.sa.quadra, 'i totes dues quadren: cada hora donada és una hora rebuda');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n2 · Uns números que no lliguen es diuen, no es calculen igual');
{
  const { ctx, p, errs } = await nova('banc-temps.html');
  await p.waitForFunction(() => window.__BDT);
  const r = await p.evaluate(() => {
    const B = window.__BDT;
    B.estat().length = 0;
    B.afegeix('Ningú', 40, 0);
    B.pinta();
    const s = B.salut(B.estat());
    return { quadra: s.quadra, total: s.total, rec: s.totalRec,
      diu: document.querySelector('#diu').textContent };
  });
  ok(!r.quadra, 'quaranta hores donades i cap de rebuda: no quadra');
  ok(/no quadren/i.test(r.diu), 'i la pàgina ho diu abans que ningú en tregui res');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n3 · L\'exemple de la pàgina és el cas que ha d\'ensenyar');
{
  const { ctx, p } = await nova('banc-temps.html');
  await p.waitForFunction(() => window.__BDT);
  const r = await p.evaluate(() => {
    const B = window.__BDT; B.exemple();
    const s = B.salut(B.estat());
    return { quadra: s.quadra, signe: s.ambSigne, abs: s.absMitja, nomesReben: s.nomesReben.length };
  });
  ok(r.quadra && r.signe === 0, 'quadra, i la mitjana amb signe és zero');
  ok(r.abs > 3, `i tot i així està trencat: ${r.abs.toFixed(1)} h de distància mitjana al zero`);
  ok(r.nomesReben > 0, 'amb gent que rep i no ha donat mai res');
  await ctx.close();
}

console.log('\n4 · El valor d\'un préstec és el que calcularia l\'eina');
{
  const { ctx, p, errs } = await nova('biblioteca.html');
  await p.waitForFunction(() => window.__BIB);
  /* Les taules de l'app, llegides del seu codi font. La prova no confia en el
     generador: refà el càlcul pel seu compte i el compara amb el de la pàgina. */
  const APP = readFileSync(join(DIR, 'index.html'), 'utf8');
  const taula = re => {
    const m = APP.match(re); if (!m) return null;
    const o = {}; [...m[1].matchAll(/([a-z_]+):([\d.]+)/g)].forEach(x => { o[x[1]] = Number(x[2]); });
    return o;
  };
  const vApp = taula(/const ORACLE_OBJECT_DEFAULTS=\{([^}]*)\}/);
  const dApp = taula(/const WEAR_RATES=\{([\s\S]*?)\}/);
  const casos = [['bricolatge', 0], ['bricolatge', 3], ['electronica', 7], ['jocs', 2],
    ['salut', 20], ['altres', 0], ['festes', 12]];
  const esperat = casos.map(([t, a]) => {
    const base = Math.round((vApp[t] !== undefined ? vApp[t] : vApp.altres) * Math.max(0.3, 1 - 0.1 * a));
    const rate = dApp[t] !== undefined ? dApp[t] : dApp.altres;
    return Math.round(base * rate * 100) / 100;
  });
  const surt = await p.evaluate(cs => cs.map(([t, a]) => window.__BIB.valorPrestec(t, a).eur), casos);
  const difs = casos.map((c, i) => [c, esperat[i], surt[i]]).filter(x => x[1] !== x[2]);
  ok(!difs.length, `els ${casos.length} casos donen el mateix que l'app`
    + (difs.length ? ': ' + difs.map(d => `${d[0].join('/')} → app ${d[1]}, pàgina ${d[2]}`).join('; ') : ''));
  /* El terra del 30 %: un objecte vell no val zero. Sense terra, a partir de
     deu anys el valor seria negatiu i el préstec valdria menys que res. */
  const vell = await p.evaluate(() => [window.__BIB.valorObjecte('bricolatge', 20),
    window.__BIB.valorObjecte('bricolatge', 100), window.__BIB.valorObjecte('bricolatge', 0)]);
  ok(vell[0] > 0 && vell[0] === vell[1], `un objecte de vint anys val ${vell[0]} € i no baixa més`);
  ok(vell[0] === Math.round(vell[2] * 0.3), 'que és el 30 % del valor de nou, tal com fa l\'app');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n5 · El valor d\'accés es diu com el que és');
{
  const { ctx, p } = await nova('biblioteca.html');
  await p.waitForFunction(() => window.__BIB);
  const r = await p.evaluate(() => {
    const v = window.__BIB.valorAcces(150, 70, 4);
    return { v, txt: document.querySelector('#pValor').innerText };
  });
  ok(r.v.patrimoni === 10500 && r.v.usos === 600, 'el patrimoni i els usos surten de la multiplicació');
  ok(r.v.acces < r.v.patrimoni * r.v.usos,
    'i el valor d\'accés és conservador: una desena part del valor per ús');
  ok(/no una compra evitada|no és una compra evitada/i.test(r.txt),
    'i la pàgina diu que això no demostra cap compra evitada');
  await ctx.close();
}

console.log('\n6 · Les dues pàgines s\'obren i cap pestanya deixa la pantalla en blanc');
{
  for (const f of ['banc-temps.html', 'biblioteca.html']) {
    const { ctx, p, errs } = await nova(f, 390, 844);
    const r = await p.evaluate(async () => {
      const tabs = [...document.querySelectorAll('#tabs button')];
      const buides = [];
      for (const t of tabs) {
        t.click();
        await new Promise(x => setTimeout(x, 20));
        const on = document.querySelector('.pan.on');
        if (!on || on.innerText.trim().length < 40) buides.push(t.textContent.trim());
      }
      return { n: tabs.length, buides,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth };
    });
    ok(r.n >= 6 && !r.buides.length,
      `${f}: les ${r.n} pestanyes obren contingut` + (r.buides.length ? ' — buides: ' + r.buides.join(', ') : ''));
    ok(!r.overflow, `i a 390 px no se'n va d'ample`);
    ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
    await ctx.close();
  }
}

await b.close();
console.log(`\n${fail ? '❌' : '✅'} ${pass} bé, ${fail} malament`);
process.exit(fail ? 1 : 0);
