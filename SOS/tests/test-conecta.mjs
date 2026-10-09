/* /conecta/ · la pila per rol, el catàleg i el cost real de l'IA
   ─────────────────────────────────────────────────────────────────────────
   El que es prova és el que fa la pàgina diferent d'un llistat de logos:

   · **Per rol.** Triar un rol deixa només els seus fluxos.
   · **La pila surt dels fluxos.** Afegir-ne un hi posa els seus serveis, sense
     repetir, i canviar una peça la canvia a la pila i al JSON.
   · **El JSON no porta claus**, i es pot descarregar.
   · **El cost de l'IA és refet.** Sostre = max_tokens × preu de sortida, i el
     total del mes és la suma de les files.
   · **Sense emmagatzematge també funciona** (finestra privada) i al mòbil no hi
     ha desplaçament horitzontal. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));
const PAG = 'file://' + join(DIR, '..', '..', 'conecta', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const nova = async (opts = {}) => {
  const ctx = await b.newContext(Object.assign({ viewport: { width: 1280, height: 900 }, acceptDownloads: true }, opts.ctx || {}));
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  if (opts.sensePersistencia) await p.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('bloquejat'); } });
  });
  await p.goto(PAG);
  await p.waitForSelector('#cx-flujos .flujo');
  return { ctx, p, errs };
};

console.log('\n1 · Per rol');
{
  const { ctx, p, errs } = await nova();
  const tots = await p.locator('#cx-flujos .flujo').count();
  const D = await p.evaluate(() => window.__CX.datos);
  ok(tots === D.flujos.length, `amb «Todos» surten els ${D.flujos.length} fluxos`);
  await p.click('#cx-roles [data-rol="finanzas"]');
  const ids = await p.$$eval('#cx-flujos .flujo', a => a.map(x => x.dataset.id));
  const esperats = D.flujos.filter(f => f.roles.includes('finanzas')).map(f => f.id);
  ok(JSON.stringify(ids) === JSON.stringify(esperats), 'Finanzas deixa només els seus fluxos: ' + ids.join(', '));
  ok(await p.getAttribute('#cx-roles [data-rol="finanzas"]', 'aria-pressed') === 'true', 'el botó del rol queda premut');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n2 · La pila surt dels fluxos');
{
  const { ctx, p } = await nova();
  ok(await p.isDisabled('#cx-descarga'), 'amb la pila buida no es pot descarregar');
  await p.click('[data-id="form-crm"] .btn');
  await p.click('[data-id="lead-ia"] .btn');
  let sv = await p.$$eval('#cx-servicios li', a => a.map(x => x.dataset.id));
  ok(JSON.stringify(sv) === JSON.stringify(['netlify', 'zoho', 'claude']), 'dos fluxos que comparteixen Netlify i el CRM fan tres serveis, sense repetir: ' + sv.join(', '));
  ok(/2 flujos · 3 servicios · 3 claves en el servidor · 0 libres/.test(await p.textContent('#cx-cifras')), 'les xifres de la pila: ' + await p.textContent('#cx-cifras'));
  await p.selectOption('#cx-lead-ia-2', 'odoo');
  await p.selectOption('#cx-lead-ia-1', 'ollama');
  sv = await p.$$eval('#cx-servicios li', a => a.map(x => x.dataset.id));
  ok(sv.includes('odoo') && sv.includes('ollama') && sv.includes('zoho'), 'canviar una peça la canvia a la pila (el CRM del primer flux es queda)');
  ok(/2 libres/.test(await p.textContent('#cx-cifras')), 'i compta les opcions lliures');
  ok(await p.getAttribute('[data-id="lead-ia"] .btn', 'aria-pressed') === 'true', 'el flux afegit diu que és a la pila');
  const mail = await p.getAttribute('#cx-pide', 'href');
  ok(mail.startsWith('mailto:') && decodeURIComponent(mail).includes('Odoo'), 'el correu porta la pila triada');

  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#cx-descarga')]);
  const txt = await (await import('node:fs')).promises.readFile(await dl.path(), 'utf8');
  const j = JSON.parse(txt);
  ok(dl.suggestedFilename() === 'mi-pila-teamtowers.json' && j.formato === 'tt-pila-1', 'es descarrega un JSON amb format');
  ok(j.flujos.length === 2 && j.flujos[1].piezas.join() === 'netlify,ollama,odoo', 'el JSON porta les peces triades');
  ok(!/sk-|api[_-]?key|password|contraseña"/i.test(txt), 'el JSON no porta cap clau');

  await p.reload(); await p.waitForSelector('#cx-servicios');
  ok(await p.locator('#cx-servicios li').count() === sv.length, 'la pila es recorda en tornar a obrir');
  await p.click('#cx-vacia');
  ok(await p.locator('#cx-servicios').count() === 0 && await p.isDisabled('#cx-descarga'), 'Vaciar la deixa buida');
  await ctx.close();
}

console.log('\n3 · El cost de l\'IA és refet');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const D = window.__CX.datos, M = D.precios.modelos;
    let h = 0, q = 0;
    D.tareas.forEach(t => { h += 10 * t.max * M[t.hoy].out / 1e6; q += 10 * t.max * M[t.propuesta].out / 1e6; });
    return { h, q, files: document.querySelectorAll('#cx-tareas tbody tr').length, n: D.tareas.length,
      txtH: document.querySelector('#cx-mes-hoy').textContent, txtQ: document.querySelector('#cx-mes-prop').textContent,
      ahorro: document.querySelector('#cx-ahorro').textContent,
      fila: document.querySelector('#cx-tareas tr[data-tarea="governance_check"]').textContent };
  });
  ok(r.files === r.n, `una fila per tasca (${r.n})`);
  const es = x => x.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $';
  ok(r.txtH === es(r.h) && r.txtQ === es(r.q), `el total del mes és la suma: ${r.txtH} → ${r.txtQ}`);
  ok(/^−\d+ %$/.test(r.ahorro), 'i diu quant s\'estalvia: ' + r.ahorro);
  ok(/Opus 4\.8.*2,00 \$.*Haiku 5\.5.*0,0400 \$/.test(r.fila), 'governance_check: 800 tokens × 25 $/M × 100 = 2,00 $, i amb Haiku 0,0400 $ (coma decimal: «$2.000» es llegiria dos mil)');
  await p.fill('#cx-tareas input[data-tarea="suggest_map"]', '0');
  await p.fill('#cx-tareas input[data-tarea="suggest_map"]', '110');
  const despres = await p.textContent('#cx-mes-hoy');
  ok(despres !== r.txtH, 'canviar els usos refà el total');
  ok(/platform\.claude\.com/.test(await p.getAttribute('#cx-fuente', 'href')) && /09\/10\/2026/.test(await p.textContent('#cx-fuente')), 'el preu enllaça la font oficial i diu la data');
  await ctx.close();
}

console.log('\n4 · Catàleg');
{
  const { ctx, p } = await nova();
  const D = await p.evaluate(() => window.__CX.datos);
  ok(await p.locator('#cx-catalogo .serv').count() === D.conectores.length, `els ${D.conectores.length} serveis, per categoria`);
  ok(await p.locator('#cx-catalogo [data-id="zoho"] .uso').count() === 1 && await p.locator('#cx-catalogo [data-id="netlify"] .uso').count() === 1, 'Netlify i Zoho CRM diuen que són en ús');
  await p.check('#cx-solo-libres');
  const lliures = await p.$$eval('#cx-catalogo .serv', a => a.map(x => x.dataset.id));
  ok(lliures.length === D.conectores.filter(c => c.libre).length && await p.locator('#cx-catalogo .cat').count() === D.categorias.length,
    'només les lliures, i n\'hi ha a cada categoria: ' + lliures.join(', '));
  await ctx.close();
}

console.log('\n5 · Sense emmagatzematge i al mòbil');
{
  const { ctx, p, errs } = await nova({ sensePersistencia: true, ctx: { viewport: { width: 375, height: 800 }, isMobile: true, hasTouch: true } });
  await p.click('[data-id="mapa-vivo"] .btn');
  ok(await p.locator('#cx-servicios li').count() === 3, 'sense localStorage la pila funciona igual');
  ok(!errs.length, 'cap error' + (errs.length ? ': ' + errs[0] : ''));
  const ample = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(ample <= 0, 'cap desplaçament horitzontal a 375 px' + (ample > 0 ? ` (sobren ${ample}px)` : ''));
  await ctx.close();
}

await b.close();
console.log(`\n${fail ? '❌' : '✅'} ${pass} correctes, ${fail} errors`);
process.exit(fail ? 1 : 0);
