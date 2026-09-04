/* La pàgina d'IA i els itineraris directius · que venguin el que hi ha
   ─────────────────────────────────────────────────────────────────────────
   Dues pàgines i una mateixa preocupació: **que el que prometen es pugui anar a
   mirar**. Una oferta d'IA és el lloc més fàcil del món per prometre de més, i
   un programa de mentoria és el lloc més fàcil per vendre un certificat com si
   fos una competència.

   · Els dos fluxos hi són tots dos, i l'ordre és el que la pàgina defensa:
     primer el mapa sencer, després la màquina.
   · Els frens són quatre i es poden anar a mirar al repositori.
   · Els itineraris directius parlen a qui contracta i no a un rol del SOS.
   · El programa de mentoria diu **què compra** i **on decau el compromís**. Una
     garantia sense la seva condició escrita no és una garantia: és una venda.

   Veda 143. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));
const f = n => 'file://' + join(DIR, '..', n);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const nova = async (pag) => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(f(pag));
  return { ctx, p, errs };
};

console.log('\n1 · Els dos fluxos, i en aquest ordre');
{
  const { ctx, p, errs } = await nova('ia.html');
  const r = await p.evaluate(() => {
    const t = document.querySelector('#tesi');
    return {
      tang: !!t.querySelector('.flux.tang'),
      intang: !!t.querySelector('.flux.intang'),
      avis: (t.querySelector('.avis') || {}).textContent || '',
      primerPas: (document.querySelector('#com .pas h4') || {}).textContent || ''
    };
  });
  ok(r.tang && r.intang, 'hi són els dos fluxos, tangible i intangible');
  ok(/primer.{0,30}mapa/i.test(r.avis), 'i es diu que primer es dibuixa el mapa sencer');
  ok(/mapa/i.test(r.primerPas), 'el primer pas del mètode és el mapa, no l\'eina');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n2 · Els frens, i la prova que es poden anar a mirar');
{
  const { ctx, p, errs } = await nova('ia.html');
  const r = await p.evaluate(() => ({
    frens: document.querySelectorAll('#frens .fre').length,
    txt: document.querySelector('#frens').textContent.replace(/\s+/g, ' '),
    proves: [...document.querySelectorAll('#fabrica .prova')].map(a => a.getAttribute('href')),
    /* El text que llegeix una persona, no el CSS: la barra del SOS porta el seu
       propi <style> dins del <body>, i `body.textContent` se l'emporta —hi ha
       un `width:100%` que faria saltar la comprovació de sota per res. */
    cos: [...document.querySelectorAll('main, header, footer')]
      .map(e => e.textContent).join(' ').replace(/\s+/g, ' ')
  }));
  ok(r.frens === 4, 'quatre frens declarats');
  ok(/persona confirma/i.test(r.txt), 'la màquina proposa i una persona confirma');
  ok(/d'on ho ha tret/i.test(r.txt), 'i sempre es diu d\'on ho ha tret');
  ok(r.proves.length >= 5, 'i la prova del mètode són peces del repositori, enumerades');
  ok(!/garantim|garantitzem|100 ?%/i.test(r.cos), 'sense garanties absolutes enlloc');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n3 · Els itineraris directius parlen a qui contracta');
{
  const { ctx, p, errs } = await nova('formacio.html');
  const r = await p.evaluate(() => {
    const it = document.querySelector('#itineraris');
    const taules = [...it.querySelectorAll('table.rt')];
    const ultima = taules[taules.length - 1];
    const files = [...ultima.querySelectorAll('tbody tr')];
    return {
      taules: taules.length,
      files: files.length,
      rols: files.map(t => t.querySelector('.rt-r').textContent.trim()),
      capcaleres: [...ultima.querySelectorAll('thead th')].map(t => t.textContent.trim()),
      cos: it.textContent.replace(/\s+/g, ' ')
    };
  });
  ok(r.taules === 3, 'hi ha tres taules d\'itineraris i no dues');
  ok(r.files === 6, 'i la nova en porta sis rols directius');
  const cal = [/direcci[óo] general|ger[èe]ncia/i, /persones|RRHH/i, /innovaci/i,
    /organitzaci/i, /p[úu]blica/i, /cooperativ/i];
  const falten = cal.filter(re => !r.rols.some(x => re.test(x)));
  ok(!falten.length, 'hi són els sis: direcció, persones, innovació, organització, pública i cooperativa');
  ok(r.capcaleres.some(c => /t'hi jugues|jugues/i.test(c)),
    'cada rol diu què s\'hi juga, que és el que el fa llegir');
  ok(!r.rols.some(x => /guardi[àa]|superheroi/i.test(x)),
    'i cap és un rol del SOS: qui contracta no es diu «guardià del territori»');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n4 · El programa de mentoria diu què compra i on decau el compromís');
{
  const { ctx, p, errs } = await nova('formacio.html');
  const r = await p.evaluate(() => {
    const s = document.querySelector('#mentoria-programa');
    return {
      hi: !!s,
      txt: s ? s.textContent.replace(/\s+/g, ' ') : '',
      cataleg: s ? [...s.querySelectorAll('a')].map(a => a.getAttribute('href')) : []
    };
  });
  ok(r.hi, 'la secció del programa hi és');
  ok(/evid[èe]ncia/i.test(r.txt), 'el que es compra són competències amb la seva evidència');
  ok(/no es tornen a facturar|no es torna a facturar/i.test(r.txt),
    'i hi ha un compromís amb cost al davant, no una promesa');
  ok(/no és una garantia de resultat/i.test(r.txt),
    'però es diu clarament que no és una garantia de resultat de negoci');
  ok(/decau|condici/i.test(r.txt),
    'i on decau el compromís: una garantia sense la seva condició és una venda');
  ok(r.cataleg.some(h => /#pk-mentoria-directiva/.test(h)),
    'i porta a la fitxa del catàleg amb el seu preu');
  ok(r.cataleg.some(h => /pressupost/.test(h)), 'i al formulari de pressupost');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
