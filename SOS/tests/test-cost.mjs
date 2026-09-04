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

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const nova = async (js = true) => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: js });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(APP);
  if (js) await p.waitForSelector('.pk-filtre');
  return { ctx, p, errs };
};

console.log('\n1 · El hero nomena les dues cases i obre dues portes');
{
  const { ctx, p, errs } = await nova();
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
  ok(/ajuntament|administraci/i.test(r.eyebrow), 'i també l\'administració');
  ok(!/veïnal|vecinal/i.test(r.h1), 'el titular ja no és només comunitari');
  ok(r.portes.includes('privat') && r.portes.includes('public'),
    'hi ha una porta per sector');
  ok(r.dest.every(h => h === '#cataleg'),
    'i totes dues porten al catàleg encara que el JavaScript no corri');
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
    document.querySelector('.pk-f[data-sec="privat"]').click();
    const privat = vis();
    const famsBuides = [...document.querySelectorAll('.pk-fam')]
      .filter(f => !f.hidden && !f.querySelector('.paquet:not([hidden])')).length;
    document.querySelector('.pk-f[data-sec="public"]').click();
    const publica = vis();
    document.querySelector('.pk-f[data-sec="tot"]').click();
    return { total, abans, privat, publica, tornen: vis(), famsBuides,
      marcat: document.querySelector('.pk-f.on').dataset.sec };
  });
  ok(r.abans === r.total, 'en obrir la pàgina hi són tots els ' + r.total + ' paquets');
  ok(r.privat > 0 && r.privat < r.total, 'el filtre d\'empresa en deixa menys, i en deixa');
  ok(r.publica > 0 && r.publica < r.total, 'i el d\'administració també');
  ok(r.famsBuides === 0, 'cap família es queda amb el títol i la graella buida a sota');
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
