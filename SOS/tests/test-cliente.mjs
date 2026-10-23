/* L'espai de client · /cliente/
   ─────────────────────────────────────────────────────────────────────────
   · **El compte** demana nom i correu i es queda al navegador.
   · **La resposta de la seva IA** omple les preguntes i qui hi ha al voltant,
     i el diagnòstic diu en paraules seves si el dibuix ja es pot fer.
   · **El dibuix s'obre dins de la pàgina** amb l'editor del mapa, i el que
     s'hi canvia torna a la fitxa (`desDe`).
   · **El boceto** surt del mateix motor que l'editor (motor-web.js), en
     castellà: la vista bàsica (una pàgina, una secció per rol principal) i la
     completa (una porta per a cadascú).
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
  await fr.waitForFunction(() => document.documentElement.lang === 'es', null, { timeout: 10000 });
  await fr.waitForTimeout(300);
  const vist = await fr.evaluate(() => {
    const ed = document.getElementById('editor'), fora = ['header.cap', '#pre', '#escrit', '.tt-peu'].filter(q => (document.querySelector(q) || {}).offsetParent);
    return { fora: fora.length, nav: !!(document.querySelector('body > nav') || {}).offsetParent, txt: ed.innerText };
  });
  ok(!vist.fora && !vist.nav, 'solo el mapa: sin la web ni el texto que explica el método');
  const ca = vist.txt.match(/\b(rols|lliurament|lliuraments|Afegeix|Seleccionat|Clica|Desfés|Pantalla completa|tornades|Res triat|Llista)\b/);
  ok(!ca, 'el editor sale en castellano' + (ca ? ': queda «' + ca[0] + '»' : ''));
  ok((await fr.evaluate(() => window.__VS_ED.exporta().roles.length)) === 7, 'el editor tiene el dibujo de la ficha (el centro y seis más)');
  await fr.evaluate(() => window.__VS_ED.flux('Quien me recomienda', 'Quien quiere ser profesor', 'intangible', 'confianza'));
  await p.click('#cl-ed-desa');
  const fitxa = await p.evaluate(() => JSON.parse(localStorage.getItem('tt.cliente.v1')));
  ok(fitxa.alrededor.length === 6 && fitxa.extra.pairs.some(x => x[0] === 'Quien me recomienda' && x[3] === 'confianza'), 'lo que cambia en el editor vuelve a la ficha, también lo que pasa entre los demás');
  ok(await p.locator('#cl-files .fila').count() === 6, 'y las filas siguen ahí');
  await p.click('#cl-ed-avz');
  await p.waitForFunction(() => { const f = document.getElementById('cl-ed-marc'); return !/incrustat/.test(f.contentWindow.location.search) && f.contentWindow.document.readyState === 'complete' && f.contentWindow.__VS_ED && f.contentWindow.__VS_ED.exporta().roles.length > 1; }, null, { timeout: 20000 });
  const fr2 = p.frames().find(f => /vna-suport/.test(f.url()));
  ok(await fr2.evaluate(() => window.__VS_ED.exporta().pairs.some(x => x[3] === 'confianza' || x[5] === 'confianza')) && await fr2.evaluate(() => !!document.querySelector('header.cap').offsetParent && !!document.querySelector('#pre').offsetParent),
    'la vista avanzada abre el editor entero con el mismo dibujo');
  await p.click('#cl-ed-tanca');
  ok(!(await p.isVisible('#cl-ed')), 'el editor se cierra y sigues donde estabas');

  await p.fill('#cl-casa', '');
  p.once('dialog', d => d.accept());
  await p.click('#cl-models button:has-text("Educación")');
  ok(await p.inputValue('#cl-casa') === 'Formadores/as' && await p.locator('#cl-files .fila').count() === 4,
    'un modelo del SOS (Educación) rellena el centro y quién está alrededor, en castellano');
  ok(await p.getAttribute('#cl-models button:has-text("Educación")', 'aria-pressed') === 'true', 'y queda marcado el modelo elegido');
  await p.fill('#cl-casa', 'Equipo de formación');
  await p.fill('#cl-retorn', RESPOSTA); await p.click('#cl-omple');

  await p.check('#cl-n-conectada', { force: true });
  await p.click('#cl-boceto');
  await p.waitForFunction(() => !document.getElementById('cl-marc-caixa').hidden, null, { timeout: 15000 });
  await p.waitForTimeout(300);
  const bas = await p.getAttribute('#cl-marc', 'srcdoc');
  ok(await p.locator('#cl-pags button').count() === 2 && (bas.match(/<section id=/g) || []).length === 7 && /Para quien quiere ser profesor/.test(bas) && /<h2[^>]*>La matrícula/.test(bas) === false && /Lo que encuentras aquí/.test(bas),
    'de entrada, la web pública: una landing con una sección para cada uno de los principales, dicha para quien llega');
  ok(!/<form /.test(bas) && !/maria@example\.test/.test(bas) && /href="&#109;&#97;&#105;&#108;/.test(bas) && /href="index.html#quien-quiere-ser-profesor"/.test(bas),
    'sin formularios: el contacto es el correo, oculto a los robots, y el menú lleva a cada sección');
  ok(await p.locator('#cl-pags button:has-text("Aviso legal")').count() === 1, 'y con su aviso legal');
  await p.check('#cl-capes [data-capa="extranet"]', { force: true });
  await p.check('#cl-capes [data-capa="intranet"]', { force: true });
  await p.waitForFunction(() => document.querySelectorAll('#cl-pags button').length > 3, null, { timeout: 15000 });
  ok(await p.locator('#cl-pags button:has-text("Intranet")').count() === 1, 'con la extranet y la intranet: una puerta para cada uno y la intranet');
  await p.waitForTimeout(300);
  const portes = await p.locator('#cl-pags button').count();
  const txt = await p.frameLocator('#cl-marc').locator('body').textContent();
  ok(portes >= 8, 'el boceto tiene inicio y una puerta para cada uno (' + portes + ' páginas)');
  ok(/Quien quiere ser profesor/.test(txt) && /Una puerta para cada uno/.test(txt), 'el boceto sale en castellano, del mismo motor que el editor');

  const ample = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  ok(ample[0] <= ample[1], 'sin desplazamiento horizontal (' + ample[0] + ' ≤ ' + ample[1] + ')');

  await p.click('#cl-envia');
  ok(enviat === null && /privacidad/.test(await p.textContent('#cl-envia-r')), 'sin la casilla de privacidad no se envía nada');
  await p.check('#cl-priv');
  await p.click('#cl-envia');
  await p.waitForFunction(() => /Enviado/.test(document.getElementById('cl-envia-r').textContent), null, { timeout: 5000 });
  const q = new URLSearchParams(enviat || '');
  ok(q.get('form-name') === 'cliente-web' && q.get('mail') === 'maria@example.test' && /Mapa \(JSON\)/.test(q.get('resum')) && q.get('nivel') === 'La web conectada' && q.get('capas') === 'web pública, extranet, intranet' && /^Aceptada el \d{4}-/.test(q.get('privacidad')), 'un solo POST al formulario cliente-web, con el mapa, el nivel y la fecha de la casilla de privacidad');
  ok(await p.getAttribute('#pas-leemos', 'aria-current') === 'step', 'después de enviar, el paso 2 queda marcado');
  await p.reload();
  ok(await p.inputValue('#cl-p-objetivo') === j.respuestas.objetivo && await p.getAttribute('#pas-leemos', 'aria-current') === 'step', 'al volver, todo sigue ahí');
  ok(!errs.length, 'sin errores de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

/* La IA que ponemos nosotros: las funciones (pule-mapa, identitat) se prueban
   en test-pule-mapa.mjs; aquí, la experiencia, con respuestas simuladas. */
console.log('\n══ /cliente/ · la IA ══');
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const pets = []; let enviat = null;
  const SES = Buffer.from(JSON.stringify({ via: 'correu', id: 'mail:x', nom: 'María Prueba', exp: Date.now() + 1e9 })).toString('base64url') + '.firma';
  await p.route('**/.netlify/functions/identitat', r => {
    if (r.request().method() === 'POST') { pets.push(['id', JSON.parse(r.request().postData())]); return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ estat: 'fet', sessio: SES, nom: 'María Prueba', via: 'correu' }) }); }
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ vies: ['correu', 'github'] }) });
  });
  let volta = 0;
  await p.route('**/.netlify/functions/pule-mapa', async r => {
    if (r.request().method() === 'GET') return r.fulfill({ status: 200, contentType: 'application/json', body: '{"actiu":true}' });
    const c = JSON.parse(r.request().postData()); pets.push(['ia', c]); volta++;
    await new Promise(x => setTimeout(x, 400));
    const res = c.pas === 'web'
      ? { lema: 'Formamos a los profesores que las escuelas buscan', presentacion: 'Cursos intensivos en Barcelona.', secciones: [{ quien: 'Quien quiere ser profesor', nombre: 'Futuros profes', intro: 'Aquí empieza tu camino como profesor de español.' }] }
      : { resumen: 'Tu red se apoya en la confianza de quien ya ha pasado por aquí.', pregunta: '¿Quién te recomienda más?',
          sugerencias: [{ tipo: 'nuevo', fila: -1, quien: 'Antiguos alumnos', meDa: 'recomendaciones', meDaEs: 'intangible', leDoy: 'comunidad', leDoyEs: 'intangible', porque: 'Suelen traer a otros.' },
            { tipo: 'cambia', fila: 0, quien: 'Quien quiere ser profesor', meDa: 'la matrícula del curso', meDaEs: 'tangible', leDoy: 'el curso FELE', leDoyEs: 'tangible', porque: 'Más concreto.' },
            { tipo: 'quita', fila: 5, quien: '', meDa: '', meDaEs: 'tangible', leDoy: '', leDoyEs: 'tangible', porque: 'Es parte de tu equipo.' }] };
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ estat: 'fet', pas: c.pas, resultat: res, voltes: volta, queda: 100 - 8 * volta, usd: 0.04 * volta }) });
  });
  let prop = 'cap';
  await p.route('**/.netlify/functions/proposta', r => { pets.push(['prop', JSON.parse(r.request().postData())]);
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(prop === 'cap' ? { estat: 'cap' } : { estat: 'fet', proposta: { titol: 'Mapa de valor + web', linies: [{ que: 'Sesión de mapa', nivell: 3, hores: 1.5, import: 120 }], total: 950, iva: false, nota: '', valida: '', actualitzada: '2026-10-22' } }) }); });
  await p.route('**/', r => { if (r.request().method() === 'POST') { enviat = r.request().postData(); r.fulfill({ status: 200, body: 'ok' }); } else r.continue(); });
  await p.goto(URL_);
  await p.waitForSelector('#cl-ia:not([hidden])', { timeout: 5000 });
  ok(await p.locator('#cl-ia a:has-text("Con GitHub")').getAttribute('href') === '/.netlify/functions/identitat?via=github' && await p.locator('#cl-ia button:has-text("Con mi correo")').count() === 1,
    'antes de usar la IA, eliges cómo identificarte: GitHub o tu correo');
  ok(!(await p.isVisible('#cl-ia-pule')), 'sin identificarte, no hay botón de IA');
  await p.click('#cl-ia button:has-text("Con mi correo")');
  ok(!pets.length, 'sin la casilla de privacidad no se identifica');
  await p.check('#cl-ia [data-ia="priv"]');
  await p.click('#cl-ia button:has-text("Con mi correo")');
  ok(!pets.length && /cuenta/.test(await p.evaluate(() => location.hash)), 'con el correo, primero la cuenta del paso 1');
  await p.fill('#cl-nom', 'María Prueba'); await p.fill('#cl-mail', 'maria@example.test'); await p.click('#cl-crea');
  await p.fill('#cl-retorn', RESPOSTA); await p.click('#cl-omple'); await p.fill('#cl-casa', 'Equipo de formación');
  await p.check('#cl-ia [data-ia="priv"]');
  await p.click('#cl-ia button:has-text("Con mi correo")');
  await p.waitForSelector('#cl-ia-pule:not([hidden])', { timeout: 5000 });
  ok(pets[0][1].mail === 'maria@example.test' && pets[0][1].privacitat === true, 'se identifica con el correo de su cuenta y la casilla');
  ok(/Hola, María Prueba · con tu correo/.test(await p.textContent('#cl-ia [data-ia="sessio"]')) && /Hola, María Prueba/.test(await p.textContent('#cl-ia-web [data-ia="sessio"]')), 'saluda, y la sesión vale también para los textos de la web');

  await p.click('#cl-ia-pule');
  ok(await p.locator('#cl-ia .ia-esq').count() === 3 && /Leyendo|Buscando|Pensando|Poniéndolo/.test(await p.textContent('#cl-ia .ia-pensant p')), 'mientras piensa: tarjetas que brillan y lo que está haciendo');
  await p.waitForSelector('#cl-ia .ia-prop', { timeout: 5000 });
  const c1 = pets[1][1];
  ok(c1.pas === 'mapa' && c1.sessio === SES && c1.dades.alrededor.length === 6 && c1.dades.casa === 'Equipo de formación', 'manda su dibujo con la sesión');
  ok(await p.locator('#cl-ia .ia-prop').count() === 3 && /confianza/.test(await p.textContent('#cl-ia .ia-resum')), 'tres propuestas y lo que ve de su red');
  ok(await p.locator('#cl-ia .ia-prop[data-tipo="cambia"] del').count() > 0 && await p.locator('#cl-ia .ia-prop[data-tipo="cambia"] ins').count() > 0, 'cada cambio, con el antes tachado y el después');
  ok(/Te quedan unas 11 vueltas/.test(await p.textContent('#cl-ia [data-ia="sessio"]')), 'la energía que le queda, en vueltas');
  await p.click('#cl-ia .ia-prop[data-tipo="nuevo"] button:has-text("Aplicar")');
  ok(await p.locator('#cl-files .fila').count() === 7 && await p.locator('#cl-files .fila.nou').count() === 1, 'aplicar «alguien nuevo» añade la fila, que se ilumina');
  await p.click('#cl-ia .ia-prop[data-tipo="quita"] button:has-text("Descartar")');
  ok(await p.locator('#cl-files .fila').count() === 7 && /Descartado/.test(await p.textContent('#cl-ia .ia-prop[data-tipo="quita"]')), 'descartar no toca nada');
  await p.click('#cl-ia .ia-prop[data-tipo="cambia"] button:has-text("Aplicar")');
  const f1 = await p.evaluate(() => JSON.parse(localStorage.getItem('tt.cliente.v1')).alrededor);
  ok(f1[0].meDa === 'la matrícula del curso' && f1[0].leDoy === 'el curso FELE' && f1.some(x => x.quien === 'Antiguos alumnos'), 'los cambios aplicados quedan en la ficha');
  await p.fill('#cl-ia-nota', 'Sobre todo antiguos alumnos');
  await p.click('#cl-ia button:has-text("Otra vuelta")');
  await p.waitForFunction(() => document.querySelectorAll('#cl-ia .ia-prop').length === 3 && !document.querySelector('#cl-ia .ia-prop.fet'), null, { timeout: 5000 });
  ok(pets[2][1].dades.nota === 'Sobre todo antiguos alumnos' && pets[2][1].dades.alrededor.length === 7, 'otra vuelta lleva su respuesta y el dibujo ya cambiado');

  await p.click('#cl-ia-escriu');
  await p.waitForSelector('#cl-ia-web .ia-textos', { timeout: 5000 });
  ok(pets[3][1].pas === 'web', 'los textos de la web, con la misma sesión');
  await p.fill('#cl-ia-web .ia-textos .fila:nth-child(2) textarea', 'Aquí empieza tu camino, a tu ritmo.');
  await p.click('#cl-ia-web button:has-text("Verlo en el boceto")');
  await p.waitForFunction(() => !document.getElementById('cl-marc-caixa').hidden && /Formamos a los profesores/.test(document.getElementById('cl-marc').getAttribute('srcdoc') || ''), null, { timeout: 15000 });
  const bo = await p.getAttribute('#cl-marc', 'srcdoc');
  ok(/Formamos a los profesores que las escuelas buscan/.test(bo) && /Cursos intensivos en Barcelona/.test(bo) && /Aquí empieza tu camino, a tu ritmo\./.test(bo) && /Para futuros profes/.test(bo), 'el boceto lleva la frase, la presentación y lo que ella ha retocado para cada uno');
  await p.check('#cl-priv'); await p.click('#cl-envia');
  await p.waitForFunction(() => /Enviado/.test(document.getElementById('cl-envia-r').textContent), null, { timeout: 5000 });
  const iaL = new URLSearchParams(enviat).get("ia"); ok(/^3 vueltas · 0\.120 USD · correu$/.test(iaL), 'el lead lleva cuánto ha usado la IA (para la cuenta de valor, no para ella)');

  /* Tu propuesta: los niveles sin cifras para todos; el precio, solo con su sesión (proposta.mjs). */
  ok(!/\d\s*€|€\s*\d|€\/h/.test(await p.textContent('#propuesta')), 'la sección de niveles no lleva precios');
  ok(!(await p.isVisible('#cl-prop [data-ia="qui"]')) && await p.isVisible('#cl-prop-veu'), 'con la sesión, «Ver mi propuesta» sin volver a identificarse');
  await p.click('#cl-prop-veu');
  await p.waitForSelector('#cl-prop-res .nota', { timeout: 5000 });
  const pp = pets.filter(x => x[0] === 'prop');
  ok(pp.length === 1 && pp[0][1].sessio === SES && /Todavía no tienes propuesta/.test(await p.textContent('#cl-prop-res')), 'sin propuesta, se lo dice; la pide con su sesión');
  prop = 'fet'; await p.click('#cl-prop-veu');
  await p.waitForSelector('#cl-prop-res .prop-t', { timeout: 5000 });
  const tx = await p.textContent('#cl-prop-res');
  ok(/Mapa de valor \+ web/.test(tx) && /Nivel 3/.test(tx) && /1,5 h/.test(tx) && /950,00 €/.test(tx) && /sin IVA/.test(tx) && /Solo la ves tú/.test(tx), 'con propuesta: lo que incluye, el nivel, las horas y su precio');
  const ample = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  ok(ample[0] <= ample[1], 'sin desplazamiento horizontal');
  ok(!errs.length, 'sin errores de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}
await b.close(); srv.close();
console.log(`\n${pass} ✓  ${fail} ✗`);
process.exit(fail ? 1 : 0);
