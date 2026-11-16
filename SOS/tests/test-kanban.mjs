/* Un sol kanban · SOS/lib/kanban.js + SOS/lib/pomodoro.js (13/11/2026)
   ─────────────────────────────────────────────────────────────────────────
   Àlvaro: «solo un modelo de Kanban en todo», amb el pomodoro del SOS i la
   comptabilitat de valor. El que es prova:
   · El flux: Per fer → Fent → Fet (amb prova) → Validat (amb temps i qui valida).
   · Només el validat compta com a valor, per tipus i per qui va fer cada estona.
   · Les targetes del SOS (todo/doing/done + accounted) s'hi llegeixen sense perdre res.
   · Dos aparells: es fusionen targeta a targeta i el que s'ha tret no torna.
   · Fractal: el backlog de tot junta els taulers a qualsevol fondària.
   · La fitxa del client guarda tasques i tauler (abans es perdien).
   · /cliente/: crear, pomodoro, apuntar, fet, validar, al mòbil i a l'escriptori.
   · /cliente/#panel: el backlog de l'Àlvaro amb els clients, i cada canvi torna
     al tauler d'on va sortir. */
import { chromium, devices } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { serve } from './serve.mjs';
import { neteja as netejaFitxa, client } from '../../netlify/functions/fitxa.mjs';
import { sessio } from '../../netlify/functions/identitat.mjs';
import { idDe } from '../../netlify/functions/proposta.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const req = createRequire(import.meta.url);
const K = req('../lib/kanban.js'), PM = req('../lib/pomodoro.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

console.log('\n══ el motor ══');
let c = K.neta({ text: 'Revisar los textos de cursos', entregable: 'la página de cursos', qui: 'equipo', tipus: 'desarrollo' });
ok(K.columna(c) === 'todo', 'una tarea nueva empieza en «Por hacer»');
c = K.apunta(c, { min: 25, via: 'pomodoro' });
ok(c.col === 'doing' && K.minuts(c) === 25 && c.reg[0].qui === 'equipo', 'apuntar tiempo la pone en marcha, y la línea es de quien la hace');
ok(K.mou(c, 'done').falta === 'prova', 'sin la prueba no pasa a «Hecho»');
ok(K.mou(c, 'valid').falta === 'prova', 'ni a «Validado»');
c = K.mou(c, 'done', { prova: 'la página publicada en la vista previa' });
ok(c.col === 'done', 'con la prueba, «Hecho»');
ok(K.mou(c, 'valid').falta === 'valida', 'validar pide quién valida');
const sense = K.mou(K.neta({ text: 'x', prova: 'y' }), 'valid', { valida: { qui: 'cliente' } });
ok(sense.falta === 'temps', 'y sin tiempo apuntado no se valida: no hay nada que contar');
c = K.mou(c, 'valid', { valida: { qui: 'cliente' } });
ok(c.col === 'valid' && c.valida.qui === 'cliente' && /^\d{4}-\d\d-\d\d$/.test(c.valida.data), 'validada por la clienta, con fecha');
ok(K.columna(Object.assign({}, c, { prova: '' })) === 'doing', 'un estado guardado sin prueba no se queda en «Validado»');
const c2 = K.apunta(K.apunta(K.neta({ text: 'Formar a María en su web', qui: 'cliente', tipus: 'formacion' }), { min: 50, qui: 'equipo' }), { min: 30, qui: 'cliente' });
const c3 = K.apunta(K.neta({ text: 'A medias', tipus: 'gestion' }), { min: 15 });
const v = K.valor([c, K.mou(K.mou(c2, 'done', { prova: 'publicó un cambio' }), 'valid', { valida: { qui: 'equipo' } }), c3]);
ok(v.min === 105 && v.tipus.desarrollo === 25 && v.tipus.formacion === 80 && !v.tipus.gestion, 'solo lo validado cuenta, por tipo: ' + JSON.stringify(v.tipus));
ok(v.qui.equipo === 75 && v.qui.cliente === 30 && v.enCurs === 15, 'por quién hizo cada rato, y lo que está en marcha aparte');
ok(/Validado.*✓ María/.test(K.resum({ cards: [c] }, 'es', { cliente: 'María', equipo: 'Álvaro' })), 'el resumen dice quién validó');
ok(K.neta({ text: 'Del SOS', col: 'done', accounted: 'led1' }).col === 'valid' && K.columna(K.neta({ text: 'Del SOS', col: 'done', accounted: 'led1' })) === 'valid', 'una tarea del SOS ya comptabilitzada se lee como validada');
ok(K.neta({ text: 'Del SOS', col: 'doing' }).col === 'doing' && K.neta({ text: '' }) === null, 'las columnas del SOS son las mismas; sin texto no hay tarjeta');

console.log('\n══ dos aparatos y el árbol ══');
const A = { cards: [Object.assign({}, c, { act: '2026-11-13T10:00:00Z' }), K.neta({ id: 'kb', text: 'Solo en A', act: '2026-11-13T09:00:00Z' })] };
const B = { cards: [Object.assign({}, c, { text: 'Cambiada después', act: '2026-11-13T11:00:00Z' }), K.neta({ id: 'kc', text: 'Solo en B' })], fora: ['kb'] };
const F = K.fusiona(A, B);
ok(F.cards.length === 2 && F.cards[0].text === 'Cambiada después', 'gana la tarjeta tocada más tarde');
ok(!F.cards.some(x => x.id === 'kb') && F.fora.includes('kb'), 'lo que alguien quitó no vuelve con la copia vieja');
const arbre = { projecte: 'Lo mío', kanban: { cards: [K.neta({ text: 'Mía' })] }, fills: [{ id: 'maria', projecte: 'ELE Barcelona', kanban: { cards: [K.neta({ text: 'De María' })] }, fills: [{ id: 'web', projecte: 'Web', kanban: { cards: [K.neta({ text: 'Del subproyecto' })] } }] }] };
const tot = K.ajunta([arbre]);
ok(tot.length === 3 && tot[2]._projecte === 'Lo mío › ELE Barcelona › Web' && tot[1]._font === 'maria', 'fractal: junta los tableros a cualquier profundidad, cada tarjeta con su camino');

console.log('\n══ el pomodoro compartido ══');
const p0 = PM.comenca('x', { id: 'k1' }, 25, 1000);
ok(p0.fi === 1000 + 25 * 60000 && p0.id === 'k1', 'guarda la hora de acabar');
ok(PM.fets(p0, 1000 + 10 * 60000) === 10 && PM.fets(p0, 1000 + 90 * 60000) === 25, 'apunta lo hecho: si acabas antes, lo que ha pasado; si lo dejas esperando, no más de lo que tocaba');
ok(PM.rellotge(-5) === '00:00' && PM.rellotge(65) === '01:05', 'el reloj no enseña negativos');

console.log('\n══ la ficha guarda tareas y tablero ══');
const fx = netejaFitxa({ nom: 'María', kanban: { cards: [c, { text: '' }, { id: 'malo<script>', text: 'x'.repeat(500) }] }, tauler: { 'a-b-c': { col: 'c3', quan: 'Cada mes', revisa: 'Escuela', mal: 1 }, '<x>': {}, _formacio: { accions: [{ id: 'f1', titol: 'Tu mapa', hores: 3, modalitat: 'online', col: 'prog' }], tarifa: 80 } } });
ok(fx.kanban.cards.length === 2 && fx.kanban.cards[1].text.length === 200 && fx.kanban.cards[1].id !== 'malo<script>', 'las tareas, limpias y cortadas');
ok(fx.tauler['a-b-c'].col === 'c3' && !fx.tauler['a-b-c'].mal && !fx.tauler['<x>'] && fx.tauler._formacio.accions[0].modalitat === 'online' && fx.tauler._formacio.tarifa === 80, 'el tablero del mapa y las acciones formativas ya se guardan');
const ENV = { ANTHROPIC_API_KEY: 'sk-ant-api03-' + 'x'.repeat(40), IA_CIERRE_TOKEN: 't'.repeat(32) };
const m = new Map(), reg = { get: async k => (m.has(k) ? JSON.parse(m.get(k)) : null), set: async (k, v2) => { m.set(k, JSON.stringify(v2)); }, del: async k => { m.delete(k); } };
const ses = sessio({ via: 'correu', id: idDe('maria@exemple.cat'), nom: 'María', mail: 'maria@exemple.cat' }, ENV);
await client({ sessio: ses, fitxa: { nom: 'María', kanban: { cards: [K.neta({ id: 'de-alvaro', text: 'Puesta por Álvaro', act: '2026-11-13T12:00:00Z' })] } } }, ENV, reg);
const r2 = await client({ sessio: ses, fitxa: { nom: 'María', kanban: { cards: [K.neta({ id: 'de-maria', text: 'Suya' })] } } }, ENV, reg);
ok(r2.kanban.cards.length === 2, 'al guardar desde su navegador no se pierde lo que puso Álvaro desde el panel');

console.log('\n══ /cliente/ ══');
const srv = await serve(join(DIR, '..', '..'), 0), BASE = 'http://127.0.0.1:' + srv.address().port + '/cliente/index.html';
const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] }, process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
for (const [nom, opc] of [['iPhone', Object.assign({}, devices['iPhone 13'], { deviceScaleFactor: 1 })], ['escritorio', { viewport: { width: 1280, height: 900 } }]]) {
  console.log('  · ' + nom);
  const ctx = await b.newContext(opc), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + '#tareas');
  await p.evaluate(() => localStorage.setItem('tt.cliente.v1', JSON.stringify({ nom: 'María Blanco', casa: 'Escuela', org: 'ELE Barcelona', alcance: 'global', respuestas: {}, alrededor: [] })));
  await p.reload();
  const T = '#cl-tareas';
  ok(/Sin tareas todavía/.test(await p.textContent(T)), 'sin tareas, explica por dónde empezar');
  await p.click(T + ' >> text=+ Nueva tarea');
  if (nom === 'iPhone') ok(await p.$$eval(T + ' form input, ' + T + ' form textarea', es => es.every(e => parseFloat(getComputedStyle(e).fontSize) >= 16)), 'los campos tienen 16 px: Safari no amplía la página');
  await p.fill(T + ' form input[type=text]', 'Cambiar las fechas del FELE');
  await p.fill(T + ' form textarea', 'la página del FELE con las fechas de 2027');
  await p.click(T + ' form >> text=Formación');
  await p.click(T + ' form >> text=Guardar');
  const card = p.locator(T + ' article', { hasText: 'Cambiar las fechas del FELE' });
  ok(await card.getAttribute('data-col') === 'todo' && /María/.test(await card.textContent()), 'la tarea entra en «Por hacer», de María');
  await card.getByRole('button', { name: /⏱ 25 min/ }).click();
  ok(await card.getAttribute('data-col') === 'doing' && await p.isVisible(T + ' .kb-pomo'), 'empezar el pomodoro la pasa a «Haciendo» y sale el reloj');
  ok(await p.evaluate(() => { const x = JSON.parse(localStorage.getItem('tt.cliente.pomo')); return !!(x && x.fi && !x.resta); }), 'el pomodoro guarda la hora de acabar en su navegador');
  await p.click(T + ' .kb-pomo >> text=Ya está');
  await p.fill(T + ' form textarea', 'fechas cambiadas en el borrador');
  await p.click(T + ' form >> text=Guardar');
  ok(/1 min.*fechas cambiadas|fechas cambiadas/.test(await card.textContent()) && !(await p.isVisible(T + ' .kb-pomo')), 'al acabar, el tiempo queda apuntado en la tarea con lo que avanzó');
  await card.getByRole('button', { name: '+ Apuntar tiempo' }).click();
  await p.fill(T + ' form input[type=number]', '40');
  await p.click(T + ' form >> text=Álvaro');
  await p.click(T + ' form >> text=Guardar');
  await card.getByRole('button', { name: 'Hecho →' }).click();
  await p.click(T + ' form >> text=Guardar');
  ok(/Falta la prueba/.test(await p.textContent(T + ' form')), '«Hecho» pide la prueba');
  await p.fill(T + ' form textarea', 'la página del FELE en la vista previa');
  await p.click(T + ' form >> text=Guardar');
  ok(await card.getAttribute('data-col') === 'done', 'con la prueba, «Hecho»');
  await card.getByRole('button', { name: 'Validar →' }).click();
  await p.click(T + ' form >> text=Guardar');
  ok(await card.getAttribute('data-col') === 'valid', 'y validada');
  const val = await p.textContent(T + ' .kb-val');
  ok(/Validado: 41 min/.test(val) && /Formación 41 min/.test(val) && /Álvaro 40 min/.test(val), 'la cuenta de valor: ' + val.replace(/\s+/g, ' ').slice(0, 120));
  const S = await p.evaluate(() => JSON.parse(localStorage.getItem('tt.cliente.v1')));
  ok(S.kanban && S.kanban.cards[0].col === 'valid' && S.kanban.cards[0].reg.length === 2, 'se guarda con su mapa (S.kanban)');
  await p.goto(BASE + '#tarea-' + S.kanban.cards[0].id); await p.waitForTimeout(300);
  ok(await p.$eval('#tarea-' + S.kanban.cards[0].id, e => e.classList.contains('kb-on')), 'cada tarea tiene su enlace');
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'la página no se mueve de lado');
  ok(!errs.length, 'sin errores' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }), p = await ctx.newPage();
  await p.goto(BASE.replace('index.html', 'index.html?lang=ca') + '#tareas');
  ok(/Les teves tasques/.test(await p.textContent('#tareas')) && /Per fer/.test(await p.textContent('#cl-tareas')), 'en catalán, también');
  await ctx.close();
}

console.log('\n══ /cliente/#panel · tu backlog de todo ══');
{
  const ctx = await b.newContext(Object.assign({}, devices['iPhone 13'], { deviceScaleFactor: 1 })), p = await ctx.newPage(), errs = [], puts = [];
  p.on('pageerror', e => errs.push(e.message));
  const kM = { cards: [K.neta({ id: 'km1', text: 'Revisar su mapa', qui: 'equipo', tipus: 'consultoria' })] };
  const D = { estat: 'fet', ia: { actiu: true }, dia: { usd: 0 }, mes: { usd: 0, persones: 0 }, variable: [], meu: { cards: [K.neta({ id: 'ka1', text: 'Post del blog', qui: 'equipo', tipus: 'gestion' })] },
    convidats: [{ mail: 'maria@ele.es', nom: 'María', tope: 2, params: { org: 'ELE Barcelona' }, enllac: 'https://x', espai: { persones: 4 }, kanban: kM },
      { mail: 'sara@bodega.es', nom: 'Sara', tope: 2, params: { org: 'La Bodega' }, enllac: 'https://x', espai: null, kanban: null }] };
  await p.route('**/.netlify/functions/convidats**', r => {
    if (r.request().method() === 'PUT') { const j = JSON.parse(r.request().postData()); puts.push(j); return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ estat: 'fet', kanban: j.kanban }) }); }
    return r.fulfill({ contentType: 'application/json', body: JSON.stringify(D) });
  });
  await p.goto(BASE + '#panel');
  await p.fill('#pn-clau', 't'.repeat(32)); await p.click('text=Entrar');
  await p.waitForSelector('#pn-tasques');
  const tx = await p.textContent('#pn-tasques');
  ok(/Post del blog/.test(tx) && /Revisar su mapa/.test(tx) && /ELE Barcelona/.test(tx), 'junta lo suyo y lo de cada cliente, con el proyecto en cada tarjeta');
  ok(/1 cliente aún no tiene/.test(tx), 'y dice qué cliente aún no tiene tablero');
  await p.locator('#pn-tasques article', { hasText: 'Revisar su mapa' }).getByRole('button', { name: '+ Apuntar tiempo' }).click();
  await p.fill('#pn-tasques form input[type=number]', '30');
  await p.click('#pn-tasques form >> text=Guardar');
  await p.waitForTimeout(200);
  ok(puts.length === 1 && puts[0].mail === 'maria@ele.es' && puts[0].kanban.cards[0].reg[0].min === 30, 'el tiempo vuelve al tablero de María, no al suyo');
  await p.click('#pn-tasques >> text=+ Nueva tarea');
  await p.fill('#pn-tasques form input[type=text]', 'Preparar la sesión');
  await p.click('#pn-tasques form >> text=Guardar');
  await p.waitForTimeout(200);
  ok(puts.some(x => x.mail === undefined && x.kanban.cards.some(y => y.text === 'Preparar la sesión')) && !puts.some(x => x.mail && x.kanban.cards.some(y => y.text === 'Preparar la sesión')), 'lo nuevo en «Todo» es suyo');
  await p.locator('.pn-k', { hasText: 'María' }).getByRole('button', { name: 'Tareas' }).click();
  ok(await p.$eval('#pn-proj', e => e.value) === 'maria@ele.es' && !/Post del blog/.test(await p.textContent('#pn-tasques .kb-cols')), '«Tareas» en la tarjeta del cliente filtra su tablero');
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'la página no se mueve de lado');
  ok(!errs.length, 'sin errores' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}
await b.close(); srv.close();
console.log('\n' + pass + ' ✓ · ' + fail + ' ✗');
process.exit(fail ? 1 : 0);
