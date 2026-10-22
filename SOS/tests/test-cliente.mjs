/* L'espai de client · /cliente/
   ─────────────────────────────────────────────────────────────────────────
   · **El compte** demana nom i correu i es queda al navegador.
   · **La resposta de la seva IA** omple les preguntes i qui hi ha al voltant,
     i el diagnòstic diu en paraules seves si el dibuix ja es pot fer.
   · **El dibuix s'obre dins de la pàgina** amb l'editor del mapa, i el que
     s'hi canvia torna a la fitxa (`desDe`).
   · **El boceto** surt del mateix motor que l'editor (motor-web.js), en
     castellà i amb una porta per a cadascú.
   · **L'enviament** és un sol POST al formulari `cliente-web`, i després el
     pas 2 queda marcat.
   · **Al mòbil** la pàgina no es desplaça de costat. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { serve } from './serve.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const ARREL = join(DIR, '..', '..');
const req = createRequire(import.meta.url);
const D = req('../lib/diagnosi-client.js'), MV = req('../lib/mapa-valor.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

console.log('\n══ diagnosi-client.js ══');
const pr = D.prompt({ org: 'La escuela', web: 'https://x.test', inicial: 'Quiero llenar los cursos' });
ok(D.PREGUNTES.every(p => pr.includes(p.q)), 'el texto para la IA lleva las ' + D.PREGUNTES.length + ' preguntas');
ok(!/zoho|crm|repositor|rol\b|flujo/i.test(pr + D.PREGUNTES.map(p => p.q + p.ej).join(' ')), 'sin palabras de dentro (Zoho, CRM, repositorio, rol, flujo)');
let err = ''; try { D.llegeix('hola'); } catch (e) { err = e.message; }
ok(/llaves/.test(err), 'una respuesta sin JSON da un error que se entiende');

const RESPOSTA = 'Aquí lo tienes:\n```json\n' + JSON.stringify({
  respuestas: { objetivo: 'Llenar los cursos intensivos del año que viene', quien: 'Gente que quiere enseñar español', llegan: 'Google y antiguos alumnos', aliados: 'Formadores y una asociación', despues: 'Encuentran trabajo y nos recomiendan', preguntan: 'Fechas y si el título sirve fuera', tiempo: 'Contestar correos', webHoy: '?' },
  alrededor: [
    { quien: 'Quien quiere ser profesor', me_da: 'la matrícula', me_da_es: 'se paga', le_doy: 'el curso y el título', le_doy_es: 'se paga' },
    { quien: 'Quien aprende español', me_da: 'práctica real para los futuros profesores', me_da_es: 'gratis', le_doy: 'clases a buen precio', le_doy_es: 'se paga' },
    { quien: 'Quien contrata profesores', me_da: 'ofertas de trabajo', me_da_es: 'gratis', le_doy: 'profesores bien formados', le_doy_es: 'gratis' },
    { quien: 'Quien avala el título', me_da: 'el reconocimiento', me_da_es: 'gratis', le_doy: 'la cuota de socio', le_doy_es: 'se paga' },
    { quien: 'Quien me recomienda', me_da: 'alumnos nuevos', me_da_es: 'gratis', le_doy: 'una comunidad de antiguos alumnos', le_doy_es: 'gratis' },
    { quien: 'Formadores', me_da: 'las clases', me_da_es: 'se paga', le_doy: 'el sueldo', le_doy_es: 'se paga' }
  ] }) + '\n```';
const j = D.llegeix(RESPOSTA);
ok(Object.keys(j.respuestas).length === 7 && j.alrededor.length === 6, 'la respuesta de la IA da 7 respuestas (el «?» no cuenta) y 6 personas');
const m = D.mapa(Object.assign({ casa: 'Equipo de formación' }, j));
ok(m.roles.length === 7 && m.pairs.length === 6 && m.roles[0] === 'Equipo de formación', 'el mapa: el centro y seis más, con anada i tornada');
ok(D.revisa(m, MV).llest, 'ese mapa pasa las reglas duras: ' + D.revisa(m, MV).punts.filter(x => !x.ok).map(x => x.diu).join(' · '));

const srv = await serve(ARREL, 0), URL_ = 'http://127.0.0.1:' + srv.address().port + '/cliente/index.html';
const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

for (const [nom, vp] of [['mòbil', { width: 375, height: 800 }], ['escriptori', { width: 1280, height: 900 }]]) {
  console.log('\n══ /cliente/ · ' + nom + ' ══');
  const ctx = await b.newContext({ viewport: vp });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  let enviat = null;
  await p.route('**/', r => { if (r.request().method() === 'POST') { enviat = r.request().postData(); r.fulfill({ status: 200, body: 'ok' }); } else r.continue(); });
  await p.goto(URL_);
  ok(await p.locator('#cl-preguntes textarea').count() === D.PREGUNTES.length, 'las ' + D.PREGUNTES.length + ' preguntas');
  ok(await p.locator('#cl-nivells input[type=radio]').count() === 4, 'los cuatro niveles de web, para elegir');
  ok(await p.locator('#enviar .pr-p').count() === 7, 'los siete pasos de lo que viene después');

  await p.click('#cl-envia');
  ok(enviat === null && /cuenta/.test(await p.textContent('#cl-envia-r')), 'sin cuenta no se envía nada');
  await p.fill('#cl-nom', 'María Prueba'); await p.fill('#cl-mail', 'maria@example.test'); await p.fill('#cl-org', 'Escuela de prueba');
  await p.click('#cl-crea');
  ok(/Hola, María/.test(await p.textContent('#cl-compte')), 'la cuenta saluda por el nombre');
  await p.fill('#cl-inicial', 'Formo profesores de español y quiero llenar los cursos');
  ok((await p.textContent('#cl-prompt')).includes('Formo profesores'), 'el texto para la IA lleva lo que ha escrito');
  await p.fill('#cl-retorn', RESPOSTA); await p.click('#cl-omple');
  ok(await p.inputValue('#cl-p-objetivo') === j.respuestas.objetivo, 'la respuesta de su IA rellena las preguntas');
  ok(await p.locator('#cl-files .fila').count() === 6, 'y las seis personas de alrededor');
  await p.fill('#cl-casa', 'Equipo de formación');
  ok(await p.locator('#cl-salut li:not(.ok)').count() === 0, 'el diagnóstico dice que ya se puede dibujar');

  await p.click('#alrededor .js-dibuix');
  await p.waitForFunction(() => { const w = document.getElementById('cl-ed-marc').contentWindow; return w && w.__VS_ED && w.__VS_ED.exporta().roles.length > 1; }, null, { timeout: 20000 });
  const fr = p.frames().find(f => /vna-suport/.test(f.url()));
  ok(p.url().split('#')[0] === URL_ && await p.isVisible('#cl-ed'), 'el dibujo se abre dentro de la página, sin salir de ella');
  ok((await fr.evaluate(() => window.__VS_ED.exporta().roles.length)) === 7, 'el editor tiene el dibujo de la ficha (el centro y seis más)');
  await fr.evaluate(() => window.__VS_ED.flux('Quien me recomienda', 'Quien quiere ser profesor', 'intangible', 'confianza'));
  await p.click('#cl-ed-desa');
  const fitxa = await p.evaluate(() => JSON.parse(localStorage.getItem('tt.cliente.v1')));
  ok(fitxa.alrededor.length === 6 && fitxa.extra.pairs.some(x => x[0] === 'Quien me recomienda' && x[3] === 'confianza'), 'lo que cambia en el editor vuelve a la ficha, también lo que pasa entre los demás');
  ok(await p.locator('#cl-files .fila').count() === 6, 'y las filas siguen ahí');
  await p.click('#cl-ed-tanca');
  ok(!(await p.isVisible('#cl-ed')), 'el editor se cierra y sigues donde estabas');

  await p.check('#cl-n-conectada', { force: true });
  await p.click('#cl-boceto');
  await p.waitForFunction(() => !document.getElementById('cl-marc-caixa').hidden, null, { timeout: 15000 });
  await p.waitForTimeout(300);
  const portes = await p.locator('#cl-pags button').count();
  const txt = await p.frameLocator('#cl-marc').locator('body').textContent();
  ok(portes >= 7, 'el boceto tiene inicio y una puerta para cada uno (' + portes + ' páginas)');
  ok(/Quien quiere ser profesor/.test(txt) && /Una puerta para cada uno/.test(txt), 'el boceto sale en castellano, del mismo motor que el editor');

  const ample = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  ok(ample[0] <= ample[1], 'sin desplazamiento horizontal (' + ample[0] + ' ≤ ' + ample[1] + ')');

  await p.click('#cl-envia');
  await p.waitForFunction(() => /Enviado/.test(document.getElementById('cl-envia-r').textContent), null, { timeout: 5000 });
  const q = new URLSearchParams(enviat || '');
  ok(q.get('form-name') === 'cliente-web' && q.get('mail') === 'maria@example.test' && /Mapa \(JSON\)/.test(q.get('resum')) && q.get('nivel') === 'La web conectada', 'un solo POST al formulario cliente-web, con el mapa y el nivel');
  ok(await p.getAttribute('#pas-leemos', 'aria-current') === 'step', 'después de enviar, el paso 2 queda marcado');
  await p.reload();
  ok(await p.inputValue('#cl-p-objetivo') === j.respuestas.objetivo && await p.getAttribute('#pas-leemos', 'aria-current') === 'step', 'al volver, todo sigue ahí');
  ok(!errs.length, 'sin errores de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}
await b.close(); srv.close();
console.log(`\n${pass} ✓  ${fail} ✗`);
process.exit(fail ? 1 : 0);
