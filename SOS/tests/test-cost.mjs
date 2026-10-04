/* La portada obert als dos sectors, i d'on surt un preu
   ─────────────────────────────────────────────────────────────────────────
   Tres coses que es van decidir alhora i que es trenquen per separat:

   · **El hero parla a les dues cases.** La pàgina deia «per a ajuntaments,
     consells comarcals i entitats» a la primera línia, i la meitat de l'oferta
     —la que té vint anys de quilòmetres— quedava fora del que la pàgina deia que
     venia. Ara les nomena totes dues i hi ha dues portes.
   · **El filtre no amaga res per defecte.** Sense JavaScript hi han de ser tots.
     Un filtre que amaga d'entrada és una pàgina que oculta oferta a qui no pot
     executar scripts, i ningú se n'assabenta mai.
   · **El que no té preu diu com es calcula.** El taller i les demostracions no
     porten xifra; si tampoc portessin el mètode, «a mida» seria el «consulta'ns»
     de sempre — que és exactament el que aquest catàleg ve a evitar.

   Vedes 140 i 142. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/* ⚠ **Dues pàgines des de l'endreça** (04/10/2026). El hero i les tres portes
   són a la portada; el catàleg, el filtre i el mapa de cost han passat a
   `cataleg.html`. Cada bloc d'aquest fitxer diu quina mira: deixats tots a la
   portada, la meitat passarien en verd per absència —que és exactament el que
   el pla de l'endreça deia que podia passar en silenci. */
const ARREL = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const APP = 'file://' + join(ARREL, 'index.html');
const CAT = 'file://' + join(ARREL, 'cataleg.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const nova = async (js = true, url = CAT) => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: js });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url);
  if (js && url === CAT) await p.waitForSelector('.pk-filtre');
  return { ctx, p, errs };
};

console.log('\n1 · El hero nomena les tres cases i obre tres portes');
{
  const { ctx, p, errs } = await nova(true, APP);
  const r = await p.evaluate(() => {
    const h = document.querySelector('.hero');
    return {
      eyebrow: h.querySelector('.hero-eyebrow').textContent,
      h1: h.querySelector('h1').textContent,
      portes: [...h.querySelectorAll('.hero-portes a')].map(a => a.dataset.sec),
      dest: [...h.querySelectorAll('.hero-portes a')].map(a => a.getAttribute('href')),
      cta: [...h.querySelectorAll('.hero-actions a')].map(a => a.getAttribute('href'))
    };
  });
  ok(/empres|cooperativ/i.test(r.eyebrow), 'la primera línia nomena l\'empresa');
  ok(/administraci/i.test(r.eyebrow), 'i també l\'administració');
  ok(/tercer sector/i.test(r.eyebrow), 'i el tercer sector, que abans vivia dins de «públic»');
  ok(!/veïnal|vecinal/i.test(r.h1), 'el titular ja no és només comunitari');
  ok(['admin', 'tercer', 'empresa'].every(x => r.portes.includes(x)),
    `hi ha una porta per sector: ${r.portes.join(', ')}`);
  /* El catàleg és una pàgina des del 04/10/2026, i per tant les portes són un
     enllaç de debò i no una àncora. Sense JavaScript porten igualment a la
     pàgina sencera —i amb el sector a l'adreça, perquè qui ve d'una porta no
     aterri davant dels vint-i-un paquets. Sense JavaScript surten tots, que és
     el comportament correcte: el filtre és una millora, no un requisit. */
  ok(r.dest.every(h => /^\/cataleg(\?s=[a-z]+)?$/.test(h)),
    'i totes tres porten al catàleg encara que el JavaScript no corri · ' + [...new Set(r.dest)].join(', '));
  ok(r.cta.some(h => /pressupost/.test(h)),
    'i des del hero es pot demanar pressupost sense buscar-lo');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n2 · El filtre filtra, i no amaga res d\'entrada');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const vis = () => [...document.querySelectorAll('.paquet')].filter(a => !a.hidden).length;
    const total = document.querySelectorAll('.paquet').length;
    const abans = vis();
    const per = {};
    let famsBuides = 0;
    ['admin', 'tercer', 'empresa'].forEach(sec => {
      document.querySelector('.pk-f[data-sec="' + sec + '"]').click();
      per[sec] = vis();
      famsBuides += [...document.querySelectorAll('.pk-fam')]
        .filter(f => !f.hidden && !f.querySelector('.paquet:not([hidden])')).length;
    });
    document.querySelector('.pk-f[data-sec="tot"]').click();
    return { total, abans, per, tornen: vis(), famsBuides,
      marcat: document.querySelector('.pk-f.on').dataset.sec };
  });
  ok(r.abans === r.total, 'en obrir la pàgina hi són tots els ' + r.total + ' paquets');
  Object.entries(r.per).forEach(([sec, n]) =>
    ok(n > 0 && n < r.total, `el filtre «${sec}» en deixa ${n} de ${r.total}: menys, i en deixa`));
  ok(new Set(Object.values(r.per)).size > 1,
    'i els tres no donen el mateix número, que seria no filtrar');
  ok(r.famsBuides === 0, 'cap família es queda amb el títol i la graella buida a sota, amb cap dels tres');
  ok(r.tornen === r.total && r.marcat === 'tot', 'i «tot el catàleg» els torna');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n3 · Sense JavaScript, el catàleg sencer és a la pàgina');
{
  const { ctx, p } = await nova(false);
  const r = await p.evaluate(() => ({
    paquets: document.querySelectorAll('.paquet').length,
    amagats: [...document.querySelectorAll('.paquet')].filter(a => a.hasAttribute('hidden')).length,
    cost: !!document.querySelector('#cost'),
    passos: document.querySelectorAll('.cm-pas').length,
    nivells: document.querySelectorAll('.cm-niv').length
  }));
  ok(r.paquets > 15, 'els paquets hi són escrits a l\'HTML, no pintats per JavaScript');
  ok(r.amagats === 0, 'i cap surt amagat: el filtre és una millora, no un requisit');
  ok(r.cost && r.passos >= 4 && r.nivells === 3,
    'i el mapa de cost hi és sencer: quatre passos i tres nivells');
  await ctx.close();
}

console.log('\n4 · El taller i les demos no publiquen preu, i diuen com es calcula');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const mira = id => {
      const a = document.querySelector('#pk-' + id);
      if (!a) return null;
      const preu = a.querySelector('.pk-preu');
      return {
        txt: preu.textContent.replace(/\s+/g, ' '),
        xifra: /\d[\d.]*\s*€/.test(preu.textContent),
        cap: (preu.querySelector('.pk-mida a') || {}).getAttribute?.('href') || ''
      };
    };
    return { pinya: mira('fent-pinya'), demos: mira('demos'),
      cost: document.querySelector('#cost').textContent.replace(/\s+/g, ' ') };
  });
  ok(r.pinya && r.demos, 'les dues fitxes hi són');
  ok(!r.pinya.xifra && !r.demos.xifra, 'i cap de les dues porta una xifra en euros');
  ok(r.pinya.cap === '#cost' && r.demos.cap === '#cost',
    'totes dues porten al mapa de cost: «a mida» sense el mètode és «consulta\'ns»');
  ok(/sense IVA/i.test(r.cost), 'el mapa de cost diu que els preus són sense IVA');
  ok(/evid[èe]ncia/i.test(r.cost),
    'i que el que separa un nivell del següent és evidència, no antiguitat');
  ok(!/antiguitat.{0,20}separa/i.test(r.cost), 'no es promet preu per antiguitat');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n5 · L\'escala hi és amb els seus tres preus hora, i en castellà també');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const hores = () => [...document.querySelectorAll('.cm-taula .cm-h')].map(t => t.textContent.trim());
    const ca = hores();
    const acred = [...document.querySelectorAll('.cm-taula tbody td')].map(t => t.textContent.trim());
    const bes = document.querySelector('.lang-btn[data-lang="es"]') ||
      [...document.querySelectorAll('.lang-btn')].find(b => /es/i.test(b.textContent));
    if (bes) bes.click();
    await new Promise(r2 => setTimeout(r2, 60));
    return { ca, es: hores(), acred, capcalera: document.querySelector('#cost h2').textContent };
  });
  ok(r.ca.length === 3 && r.ca.every(h => /\d+ €\/h/.test(h)),
    'tres nivells, tots amb el seu preu hora');
  ok(new Set(r.ca).size === 3, 'i els tres són diferents: una escala amb dos preus iguals no és una escala');
  ok(r.acred.some(t => /registr|evid[èe]nci/i.test(t)),
    'l\'acreditació de cada nivell es diu, i és evidència registrada');
  ok(r.es.join() === r.ca.join(), 'el preu hora no canvia amb l\'idioma');
  ok(!/D'on surt/.test(r.capcalera), 'i la capçalera sí que es tradueix');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
