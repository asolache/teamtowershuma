/* La MATRIU explicada, el diagnòstic que porta a algun lloc, i un sol menú
   ─────────────────────────────────────────────────────────────────────────
   Tres coses que no fallen mai i que per això no mirava ningú:

   · **Una pàgina que explica un mètode envelleix sense petar.** La de la
     MATRIU promet a la primera pantalla que cada criteri és una comprovació
     que l'app fa de debò. Això ho vigila `tools/check-matriu.js` contra el
     codi; aquí es prova que la pàgina ho digui i que es pugui llegir.
   · **El diagnòstic acabava en un correu.** Deia què et falta i et deixava
     allà, amb les eines que responen a això a dues pantalles de distància.
   · **Sis pàgines tenien sis menús.** Ningú pot aprendre on són les coses si
     es mouen a cada pantalla. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const F = p => 'file://' + join(DIR, p);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const obre = async (p, w = 1100, h = 900) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(F(p)); await page.waitForTimeout(300);
  return { ctx, page, errs };
};

console.log('\n1 · La MATRIU: el model, i que no promet res que l\'app no faci');
{
  const { ctx, page, errs } = await obre('matriu.html');
  const r = await page.evaluate(() => {
    const M = window.__MATRIU;
    const txt = document.body.textContent.replace(/\s+/g, ' ');
    return { etapes: M.ETAPES.map(e => e.id), portes: M.PORTES.map(p => p.criteris.length),
      vies: M.VIES.length, tipus: M.TIPUS.length,
      cobertes: M.COBERTURA.filter(c => c[2]).length, cobTot: M.COBERTURA.length,
      pans: document.querySelectorAll('.pan').length,
      tabs: document.querySelectorAll('#tabs button').length,
      cicle: document.querySelectorAll('#cicle .et').length,
      portesUI: document.querySelectorAll('#cicle .porta').length,
      txt };
  });
  ok(r.etapes.join('|') === 'idea|prototip|validacio|graduacio',
    `les quatre etapes en ordre: ${r.etapes.join(' → ')}`);
  ok(r.cicle === 4 && r.portesUI === 3,
    'i el diagrama les pinta totes quatre amb les tres portes entremig');
  ok(r.portes.join(',') === '3,4,6',
    `les portes porten ${r.portes.join(', ')} criteris — la tercera en té sis perquè la sisena ` +
    'només val als tipus amb ànim de lucre');
  ok(r.tabs === r.pans && r.tabs === 6, `${r.tabs} pantalles, ${r.tabs} pestanyes`);
  ok(/no incuba idees/.test(r.txt) && /no és una cartera d'inversió/i.test(r.txt),
    'diu què és i, sobretot, què no és');
  ok(/enviar-la a trencar-se/.test(r.txt),
    'i explica el criteri que costa més d\'acceptar —el 70% d\'equity— pel seu motiu, no com a norma');
  ok(r.cobertes === r.cobTot && r.cobTot >= 10,
    `la taula de cobertura declara ${r.cobTot} peces del model amb la funció que les fa`);
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n2 · El diagnòstic porta a algun lloc, i diu per què hi porta');
{
  const { ctx, page, errs } = await obre('diagnostic.html', 900, 1000);
  const r = await page.evaluate(async () => {
    const $ = s => document.querySelector(s);
    $('#nom').value = 'Anna Prova'; $('#mail').value = 'a@b.cat';
    document.querySelector('[data-go="2"]').click();
    await new Promise(r2 => setTimeout(r2, 120));
    document.querySelector('#orgType .opt[data-v="ajuntament"]').click();
    $('#municipi').value = 'Vilafranca';
    document.querySelector('[data-go="3"]').click();
    await new Promise(r2 => setTimeout(r2, 120));
    ['relleu', 'equity', 'diagnostic'].forEach(v => {
      const c = document.querySelector('[data-v="' + v + '"]'); if (c) c.click();
    });
    document.querySelector('[data-go="4"]').click();
    await new Promise(r2 => setTimeout(r2, 120));
    const b2 = [...document.querySelectorAll('button')].find(x => /diagn/i.test(x.textContent));
    if (b2) b2.click();
    await new Promise(r2 => setTimeout(r2, 500));
    const portes = [...document.querySelectorAll('#rPortes .porta-c')].map(a => ({
      url: a.getAttribute('href'),
      t: (a.querySelector('.pt') || {}).textContent || '',
      per: (a.querySelector('.pq') || {}).textContent || '' }));
    return { portes, mods: document.querySelectorAll('#rMods .mod').length,
      priv: /no envia res sol/.test(document.body.textContent) };
  });
  ok(r.portes.length >= 2 && r.portes.length <= 3,
    `el resultat proposa ${r.portes.length} portes i no totes: sis recomanacions no són una recomanació`);
  ok(r.portes.every(p => p.per.trim().length > 10),
    'i cadascuna diu per què és aquesta i no una altra: ' +
    r.portes.map(p => '«' + p.per.slice(0, 42) + '…»').join(' '));
  ok(r.portes.some(p => /matriu\.html/.test(p.url)),
    'amb «heu de repartir propietat» marcat, una de les portes és la MATRIU');
  ok(r.portes.every(p => /\.html$/.test(p.url)),
    'i totes porten a una pàgina del SOS, no a un correu');
  ok(r.mods > 0, `l'itinerari formatiu segueix sortint (${r.mods} mòduls)`);
  ok(r.priv, 'i la pàgina segueix dient que no envia res sola');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n3 · Un sol menú, i el mateix a totes les pàgines');
{
  const mira = async p => {
    const { ctx, page, errs } = await obre(p, 1100, 700);
    const r = await page.evaluate(() => {
      const n = document.querySelector('.sos-nav');
      if (!n) return null;
      return { grups: [...n.querySelectorAll('.sn-g>summary')].map(s => s.textContent.trim()),
        destins: [...n.querySelectorAll('.sn-p a')].map(a => a.getAttribute('href')),
        cta: (n.querySelector('.sn-cta') || {}).textContent || '',
        aqui: [...n.querySelectorAll('[aria-current]')].map(a => a.getAttribute('href')),
        marca: !!n.querySelector('.sn-brand') };
    });
    await ctx.close();
    return { r, errs };
  };
  const a = await mira('matriu.html'), b2 = await mira('compra.html'), c = await mira('vedes.html');
  ok(a.r && b2.r && c.r, 'les tres pàgines mirades porten el menú');
  ok(a.r.grups.join('|') === b2.r.grups.join('|') && b2.r.grups.join('|') === c.r.grups.join('|'),
    `i els mateixos grups a totes: ${a.r.grups.join(' · ')}`);
  ok(a.r.destins.join('|') === b2.r.destins.join('|'),
    `amb els mateixos ${a.r.destins.length} destins i en el mateix ordre`);
  ok(/Obre SOS/.test(a.r.cta) && /Obre SOS/.test(c.r.cta),
    'i la mateixa acció principal, sempre al mateix lloc');
  ok(a.r.aqui.indexOf('matriu.html') >= 0 && b2.r.aqui.indexOf('compra.html') >= 0,
    'cada pàgina es marca a si mateixa: se sap on ets sense haver de llegir el títol');
  ok(a.r.marca, 'i la marca porta a la portada des de qualsevol lloc');
  ok(!a.errs.length && !b2.errs.length && !c.errs.length, 'sense errors de pàgina');
}

console.log('\n4 · El menú funciona sense JavaScript i a mòbil');
{
  const { ctx, page, errs } = await obre('matriu.html', 390, 800);
  const r = await page.evaluate(async () => {
    const g = document.querySelector('.sos-nav .sn-g');
    /* `open` i no l'alçada: `<details>` amaga el contingut amb un mecanisme
       intern del navegador i mesurar-lo depèn de com el pinti cadascun. El que
       importa és l'estat, que és el que el navegador exposa. */
    const tancat = g.open;
    g.querySelector('summary').click();
    await new Promise(r2 => setTimeout(r2, 150));
    const obert = g.open;
    const alt = g.querySelector('.sn-p').getBoundingClientRect().height;
    return { tancat, obert, alt, tag: g.tagName,
      desborda: document.documentElement.scrollWidth > window.innerWidth + 1 };
  });
  ok(r.tag === 'DETAILS',
    'els desplegables són <details>: el navegador ja en fa un component accessible, i no cal script');
  ok(r.tancat === false && r.obert === true && r.alt > 0,
    'arrenca tancat, un clic l\'obre i llavors el panell ocupa lloc');
  ok(!r.desborda, 'i a 390px la pàgina no desborda de costat');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
