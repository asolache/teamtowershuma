/* El Comando com a projecte · la pel·lícula que farem 150.000
   ─────────────────────────────────────────────────────────────────────────
   El Comando existia sis vegades i cap peça deia que les altres hi fossin: la
   història als còmics, els catorze personatges dins de l'app, el perfil de
   superheroi/na en un modal, el kit narratiu en un altre, el multivers en un
   tercer i Molekulandia en una pàgina a part.

   El risc d'ajuntar-ho no és que peti: és que quedi un índex bonic que no
   porta enlloc. Per això aquí no es comprova que els enllaços **hi siguin**
   —això ja ho fa la guarda— sinó **que obrin el que diuen**: es va a la ruta i
   es mira que el modal que surt sigui el que la targeta prometia.

   I la part incòmoda: de sis peces de vídeo i so, cinc encara no tenen
   enllaç. Es prova que surtin dient-ho i que no siguin clicables — perquè la
   temptació, el dia que es toqui aquesta pàgina amb pressa, serà enganxar-hi
   el canal de YouTube «mentrestant». Veda 146. */
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
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(F('comando.html'));
await page.waitForTimeout(200);

console.log('\n1 · La primera pantalla diu què és el projecte, no només qui hi entra');
{
  const r = await page.evaluate(() => {
    const h1 = document.querySelector('.hero h1');
    const cta = document.querySelector('.hero .cta-primary');
    return {
      titol: h1 ? h1.textContent.trim() : '',
      cta: cta ? { txt: cta.textContent.trim(), href: cta.getAttribute('href'), y: cta.getBoundingClientRect().bottom } : null
    };
  });
  ok(/pel·lícula/i.test(r.titol), 'el titular diu que això és una pel·lícula: «' + r.titol + '»');
  ok(r.cta && r.cta.y <= 800,
    'i la crida principal cau dins de la primera pantalla (' + Math.round(r.cta.y) + 'px de 800)');
  ok(r.cta && r.cta.href === 'index.html#/alta',
    'que porta a fer-se el personatge, no a una portada genèrica');
}

console.log('\n2 · Els quatre mòduls del SOS obren el que prometen');
{
  /* Aquesta és la prova que compta. Un enllaç a `index.html#/kit` que existeix
     però no obre res deixa qui el clica a la portada de l'app, i sembla que no
     hagi passat res: és el defecte que aquesta pàgina venia a arreglar, tornat
     a entrar per la porta del darrere. */
  const passos = await page.$$eval('.pas .pas-cta', as => as.map(a => a.getAttribute('href')));
  ok(passos.length === 4, 'la pàgina declara els quatre passos');
  const ESPERAT = {
    'index.html#/alta': /superheroi/i,
    'index.html#/kit': /kit narratiu/i,
    'index.html#/multivers': /multivers/i,
    'index.html#/comando': /comando/i
  };
  for (const href of passos) {
    const app = await ctx.newPage();
    await app.goto(F(href.replace('index.html', 'index.html')));
    await app.waitForFunction(() => window.__SOS && window.__SOS.applyRoute).catch(() => {});
    /* Sense l'onboarding fet, l'app obre la seva pròpia benvinguda i tapa la
       ruta. Es marca com a fet i es torna a aplicar. */
    await app.evaluate(async () => { await window.__SOS.markOnboardingDone(); });
    await app.reload();
    await app.waitForFunction(() => document.querySelector('.modal h2'), null, { timeout: 8000 }).catch(() => {});
    const tit = await app.evaluate(() => {
      const h = document.querySelector('.modal-bg .modal h2, .modal h2');
      return h ? h.textContent.trim() : '';
    });
    const re = ESPERAT[href];
    ok(re && re.test(tit), href + ' obre «' + (tit || '—') + '»');
    await app.close();
  }
}

console.log('\n3 · El que encara no està filmat es diu, i no es pot clicar');
{
  const r = await page.evaluate(() => {
    const tot = [...document.querySelectorAll('.vid')];
    return {
      n: tot.length,
      buides: tot.filter(v => v.classList.contains('vid-buit')).map(v => ({
        tag: v.tagName, href: v.getAttribute('href'),
        diu: (v.querySelector('.vid-no') || {}).textContent || ''
      })),
      plenes: tot.filter(v => !v.classList.contains('vid-buit')).map(v => v.getAttribute('href'))
    };
  });
  ok(r.n >= 6, 'la pàgina declara les ' + r.n + ' peces, hi siguin o no');
  ok(r.buides.length > 0 && r.buides.every(v => v.tag !== 'A' && !v.href),
    'les ' + r.buides.length + ' que encara no tenen enllaç no són cap porta');
  ok(r.buides.every(v => /encara no/i.test(v.diu)),
    'i cadascuna diu que encara no en tenim l\'enllaç');
  ok(r.plenes.length > 0 && r.plenes.every(Boolean),
    'i la que sí que hi és, s\'obre: ' + r.plenes.join(', '));
}

console.log('\n4 · Els herois de la pàgina són els de l\'app, un per un');
{
  /* Ja no és una còpia a mà: `build-comando.js` els genera. La prova mira el
     resultat igualment, perquè el dia que algú torni a escriure una fitxa a mà
     dins del bloc, la guarda ho dirà però la pàgina publicada l'ensenyaria
     igual fins que algú miri el CI. */
  const APP = readFileSync(join(DIR, 'index.html'), 'utf8');
  const bloc = (APP.match(/^const CANONICAL_HEROES=\[[\s\S]*?\n\];/m) || [''])[0];
  const roster = [...bloc.matchAll(/name:'((?:[^'\\]|\\.)*)'/g)].map(m => m[1].replace(/\\'/g, "'"));
  const aPag = await page.$$eval('.hcard-nm', ns => ns.map(n => n.textContent.trim()));
  ok(roster.length > 0 && aPag.join('|') === roster.join('|'),
    'els ' + aPag.length + ' herois surten en el mateix ordre que a CANONICAL_HEROES');
  const senseVna = await page.$$eval('.hcard', cs => cs.filter(c => !c.querySelector('.hcard-vna')).length);
  ok(senseVna === 0, 'i cap fitxa es queda sense dir què vol dir aquell personatge a un equip');
}

console.log('\n5 · Les entrades del blog existeixen de debò');
{
  const ancores = await page.$$eval('.post', as => as.map(a => a.getAttribute('href')));
  ok(ancores.length >= 5, 'la pàgina enllaça les ' + ancores.length + ' entrades del Comando');
  const blog = await ctx.newPage();
  let totes = true;
  for (const h of ancores) {
    await blog.goto(F(h));
    const id = h.split('#')[1];
    const hi = await blog.evaluate(a => !!document.getElementById(a), id);
    if (!hi) { totes = false; console.log('    · falta ' + h); }
  }
  ok(totes, 'i totes cauen sobre un article que hi és');
  await blog.close();
}

console.log('\n6 · Cada eix porta a una pantalla on allò es fa');
{
  const eixos = await page.$$eval('.eix', es => es.map(e => ({
    nom: (e.querySelector('.eix-n') || {}).textContent || '',
    on: (e.querySelector('.eix-on') || {}).getAttribute('href')
  })));
  ok(eixos.length === 6, 'els sis eixos hi són');
  ok(eixos.every(e => e.on), 'i cadascun porta en algun lloc, que és el que els fa certs');
  /* «Empoderament» sense objecte és fum i la guia de marca el prohibeix. Aquí
     es comprova el text tal com el llegeix una persona, no el codi font. */
  const text = await page.evaluate(() => document.body.innerText);
  ok(!/empoderament(?!\s+(de|per|dels|de les))/i.test(text),
    'i cap paraula gran sense el seu objecte');
}

console.log('\n7 · Cap error de pàgina');
ok(errs.length === 0, errs.length ? 'errors: ' + errs.join(' · ') : 'la pàgina no llança res');

await b.close();
console.log(`\n${fail ? '❌' : '✅'} ${pass} bé, ${fail} malament`);
process.exit(fail ? 1 : 0);
