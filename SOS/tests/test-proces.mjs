/* El procés del client · /mapa-web/#contratar i el backoffice
   ─────────────────────────────────────────────────────────────────────────
   · **Els set passos hi són**, en ordre i amb qui els fa i què reps, com diu
     `SOS/tools/proces-web.js`.
   · **Al mòbil es llegeixen en columna** i la pàgina no es desplaça de costat;
     a l'escriptori van en fila.
   · **El backoffice marca on és el projecte**: els d'abans fets, l'actual amb
     aria-current="step". */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const DIR = dirname(fileURLToPath(import.meta.url));
const PAG = 'file://' + join(DIR, '..', '..', 'mapa-web', 'index.html');
const P = createRequire(import.meta.url)('../tools/proces-web.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

console.log('\n══ /mapa-web/ · Cómo se contrata ══');
for (const [nom, vp] of [['mòbil', { width: 375, height: 800 }], ['escriptori', { width: 1280, height: 900 }]]) {
  const ctx = await b.newContext({ viewport: vp });
  const p = await ctx.newPage();
  await p.goto(PAG + '#contratar');
  const d = await p.evaluate(() => {
    const li = [...document.querySelectorAll('#contratar .pr-p')];
    return {
      noms: li.map(l => l.querySelector('h3').textContent.trim()),
      qui: li.every(l => l.querySelectorAll('.pr-q span:not(.sr)').length >= 1),
      reps: li.every(l => /Recibes/.test(l.querySelector('.pr-reps').textContent)),
      tops: li.map(l => Math.round(l.getBoundingClientRect().top)),
      ample: document.documentElement.scrollWidth, vw: innerWidth
    };
  });
  ok(d.noms.join('|') === P.PASSOS.map(x => x.es[0]).join('|'), nom + ': els set passos, en ordre');
  ok(d.qui && d.reps, nom + ': cada pas diu qui el fa i què reps');
  ok(d.ample <= d.vw, nom + ': sense desplaçament horitzontal (' + d.ample + ' ≤ ' + d.vw + ')');
  const enFila = new Set(d.tops).size === 1;
  ok(nom === 'mòbil' ? !enFila : enFila, nom + (nom === 'mòbil' ? ': en columna' : ': en fila'));
  await ctx.close();
}

console.log('\n══ El backoffice · on som ══');
{
  const ctx = await b.newContext({ viewport: { width: 375, height: 800 } });
  const p = await ctx.newPage();
  await p.setContent('<!DOCTYPE html><html lang="es"><head><style>' + P.CSS + '</style></head><body>' + P.pinta({ llengua: 'es', ara: P.pasDe({ pas: 'sesion' }) }) + '</body></html>');
  const d = await p.evaluate(() => ({
    fets: [...document.querySelectorAll('.pr-p.fet')].map(l => l.id),
    ara: document.querySelector('[aria-current="step"]')?.id
  }));
  ok(d.ara === 'pas-sesion', 'el pas actual porta aria-current="step"');
  ok(d.fets.join() === 'pas-escribes,pas-leemos,pas-borrador,pas-presupuesto', 'els passos d\'abans surten fets');
  ok(P.pasDe(null) === 'borrador', 'sense proces.json, el pas és l\'esborrany');
  let peta = false; try { P.pasDe({ pas: 'inventat' }); } catch (e) { peta = true; }
  ok(peta, 'un pas que no existeix peta en comptes de no marcar res');
  await ctx.close();
}

await b.close();
console.log(`\n${pass} ✓ · ${fail} ✗`);
process.exit(fail ? 1 : 0);
