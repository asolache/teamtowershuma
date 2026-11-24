/* «Tu espacio» per a qui ja treballa amb nosaltres · provat sense xarxa
   ─────────────────────────────────────────────────────────────────────────
   netlify/lib/acollida.mjs, el panell (convidats.mjs), la fitxa del client
   (fitxa.mjs) i la targeta que deixa «Habla con una persona»
   (submission-created.mjs). El que es prova:

   · La forma neta: enllaços només https o del lloc, llistes tallades.
   · La IA s'hi crida amb el model petit i torna l'acollida i els deures.
   · El panell ho desa a la fitxa del client, i els deures entren a les seves
     tasques sense duplicar-se.
   · El que desa el navegador del client no esborra el seu espai.
   · Un missatge de «Habla con una persona» deixa una targeta a «Lo mío». */
import * as AC from '../../netlify/lib/acollida.mjs';
import { gestiona } from '../../netlify/functions/convidats.mjs';
import { client, clau as clauFitxa } from '../../netlify/functions/fitxa.mjs';
import { apuntaTarjeta, targetaContacte, proposaResposta } from '../../netlify/functions/submission-created.mjs';
import * as RS from '../../netlify/lib/resposta.mjs';
import { empremta } from '../../netlify/lib/signatura.mjs';
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const memoria = () => { const m = new Map(); return { m, get: async k => (m.has(k) ? JSON.parse(m.get(k)) : null), set: async (k, v) => { m.set(k, JSON.stringify(v)); }, del: async k => { m.delete(k); } }; };
const TOK = 't'.repeat(32), ENV = { ANTHROPIC_API_KEY: 'sk-ant-usr-' + 'x'.repeat(40), IA_CIERRE_TOKEN: TOK, URL: 'https://teamtowershuma.com' };
const B = 'Bearer ' + TOK;

console.log('\n1 · La forma neta');
{
  const a = AC.neteja({ hola: 'Hola amiga', web: 'javascript:alert(1)', seguent: { text: 'Elige día', href: 'javascript:x' }, contat: ['a', '', { text: 'b' }] });
  ok(a && a.hola === 'Hola amiga' && a.web === '' && a.seguent.href === '', 'cap enllaç que no sigui https o del lloc');
  ok(a.contat.length === 2, 'les llistes, sense buits');
  ok(AC.neteja({}) === null, 'res a desar, res');
  ok(AC.neteja({ web: 'https://deploy-preview-1--x.netlify.app/' }).web.startsWith('https://'), 'la vista prèvia, sí');
  const d1 = AC.deures(['Mandar las fotos']), d2 = AC.deures(['Mandar las fotos']);
  ok(d1[0].id === d2[0].id && d1[0].qui === 'cliente' && d1[0].col === 'todo', 'els deures: mateix text, mateixa targeta, i són seus');
}

console.log('\n2 · La IA ordena (model petit, sense desar el text)');
let crida = null;
const fals = async (url, o) => { crida = JSON.parse(o.body); return { ok: true, status: 200, json: async () => ({ model: AC.IA.model, stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 300 },
  content: [{ type: 'text', text: JSON.stringify({ hola: 'Hola amiga, ya lo tenemos ordenado.', contat: ['Quieres una web que se entienda en inglés'], decidit: ['Los cursos de 2027 van primero'], deures: ['Mandar las fotos del aula'], preguntes: ['¿Quién contesta los formularios?'] }) }] }) }; };
{
  ok(AC.IA.model.includes('haiku'), 'tria el model petit (extreu)');
  const r = await AC.ordena('correu de prova', ENV, fals);
  ok(r.estat === 'fet' && r.acollida.contat.length === 1 && r.deures.length === 1, 'torna l\'acollida i els deures');
  ok(crida.model === AC.IA.model && /Nunca nombres herramientas/.test(crida.system), 'amb les regles: sense eines ni jerga');
  ok(r.usd > 0 && r.usd < 0.01, 'i costa cèntims: ' + r.usd.toFixed(5) + ' $');
  ok((await AC.ordena('', ENV, fals)).estat === 'error', 'sense text, no crida');
}

console.log('\n3 · El panell ho desa a la fitxa del client');
{
  const R = { convidats: memoria(), ia: memoria(), fitxes: memoria(), comptes: memoria(), fetch: fals };
  await gestiona('PUT', {}, B, { mail: 'maria@example.org', nom: 'María' }, ENV, R);
  ok(await gestiona('POST', {}, '', { ordena: 'x' }, ENV, R) === null, 'sense testimoni, res');
  const o = await gestiona('POST', {}, B, { ordena: 'correus' }, ENV, R);
  ok(o.estat === 'fet' && o.acollida && o.deures.length === 1, 'ordena des del panell');
  ok(R.fitxes.m.size === 0, 'ordenar no desa res');
  const d = await gestiona('PUT', {}, B, { mail: 'maria@example.org', acollida: o.acollida, deures: o.deures }, ENV, R);
  const kf = clauFitxa('mail:' + empremta('maria@example.org')), f = await R.fitxes.get(kf);
  ok(d.estat === 'fet' && f.acollida.hola.startsWith('Hola amiga') && f.kanban.cards.length === 1, 'desada amb els seus deures com a tasques');
  await gestiona('PUT', {}, B, { mail: 'maria@example.org', acollida: o.acollida, deures: o.deures }, ENV, R);
  ok((await R.fitxes.get(kf)).kanban.cards.length === 1, 'tornar-ho a desar no duplica les tasques');
  const g = await gestiona('GET', {}, B, {}, ENV, R);
  ok(g.convidats[0].acollida && g.convidats[0].acollida.decidit.length === 1, 'el panell la torna a ensenyar');
  ok((await gestiona('PUT', {}, B, { mail: 'no@example.org', acollida: o.acollida }, ENV, R)).estat === 'error', 'a qui no és convidat, res');
}

console.log('\n4 · El navegador del client no esborra el seu espai');
{
  const src = readFileSync(new URL('../../netlify/functions/fitxa.mjs', import.meta.url), 'utf8');
  ok(/if \(abans && abans\.acollida\) f\.acollida = abans\.acollida;/.test(src), 'la fitxa que desa el client conserva l\'acollida');
  const cl = readFileSync(new URL('../../cliente/index.html', import.meta.url), 'utf8');
  ok(/<section id="espacio"[^>]* hidden>/.test(cl) && cl.includes('/SOS/lib/acollida.js'), '/cliente/ porta «Tu espacio»');
  const home = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  ok(/href="\/cliente\/\?perfil=cliente#espacio" data-perfil="cliente"/.test(home), 'i «Ya trabajo con vosotros» hi porta');
}

console.log('\n5 · «Habla con una persona» deixa una targeta a «Lo mío»');
{
  const reg = memoria();
  const cos = JSON.stringify({ payload: { form_name: 'contacto', data: { nom: 'Pau', tema: 'Jornada', perfil: 'empresa', pagina: '/conecta/' } } });
  ok(await apuntaTarjeta(cos, reg), 'apuntada');
  const k = await reg.get('kanban/alvaro');
  ok(k.cards.length === 1 && /^Contestar a Pau: Jornada/.test(k.cards[0].text) && k.cards[0].qui === 'equipo', 'diu a qui cal contestar, i és teva');
  ok(!(await apuntaTarjeta(JSON.stringify({ payload: { form_name: 'comanda', data: {} } }), reg)), 'els altres formularis no en deixen');
  ok(targetaContacte({}).text === 'Contestar a alguien', 'sense nom, no peta');
}

console.log('\n6 · El bot propone la respuesta y Álvaro la valida');
{
  const reg = memoria(), comptes = memoria();
  const cos = JSON.stringify({ payload: { form_name: 'contacto', data: { nom: 'Pau', mail: 'pau@example.org', tema: 'Jornada', missatge: 'Somos 40 y queremos un taller', perfil: 'empresa', llengua: 'es' } } });
  let env = null;
  const fb = async (u, o) => { env = JSON.parse(o.body); return { ok: true, status: 200, json: async () => ({ model: RS.IA.model, stop_reason: 'end_turn', usage: { input_tokens: 400, output_tokens: 150 }, content: [{ type: 'text', text: 'Hola Pau, gracias… Álvaro' }] }) }; };
  const c = await apuntaTarjeta(cos, reg);
  ok(await proposaResposta(cos, c, reg, ENV, fb, comptes) === 'fet', 'la IA escribe el borrador');
  ok(env.model === RS.IA.model && /Nunca des precios/.test(env.system) && /fecha aproximada, número de personas/.test(env.system), 'con las reglas y el paso del camino «empresa»');
  const doc = await reg.get(RS.DOC);
  ok(doc[c.id] && doc[c.id].esborrany.startsWith('Hola Pau') && doc[c.id].mail === 'pau@example.org', 'espera en el panel, junto a su tarjeta');
  ok((await comptes.get('mes/' + new Date().toISOString().slice(0, 7))).usd > 0, 'y su coste queda en el router');
  ok(await proposaResposta(cos, c, memoria(), {}, fb) === 'sense-clau', 'sin clave de IA, la fila está igual, sin borrador');
  const R = { convidats: memoria(), ia: memoria(), fitxes: reg };
  const g = await gestiona('GET', {}, B, {}, ENV, R);
  ok(g.respostes.length === 1 && g.respostes[0].id === c.id, 'el panel la enseña en «Por contestar»');
  await gestiona('PUT', {}, B, { resposta: { id: c.id, esborrany: 'Hola Pau, cambiado' } }, ENV, R);
  ok((await reg.get(RS.DOC))[c.id].esborrany === 'Hola Pau, cambiado', 'Álvaro la cambia');
  await gestiona('PUT', {}, B, { resposta: { id: c.id, fet: true } }, ENV, R);
  const k = await reg.get('kanban/alvaro');
  ok(!(await reg.get(RS.DOC))[c.id] && k.cards.find(x => x.id === c.id).col === 'done', '«Ya está enviada»: sale de la lista y la tarjeta pasa a Hecho');
}

console.log('\n7 · «Tu camino: paso N de M»: cada paso existe');
{
  const { existsSync } = await import('node:fs');
  const rc = readFileSync(new URL('../../SOS/lib/recorrido.js', import.meta.url), 'utf8');
  const passos = [...rc.matchAll(/\{ a: '([^']+)'/g)].map(m => m[1].split('#')[0]);
  const arrel = new URL('../../', import.meta.url).pathname;
  const fitxer = a => [a, a + '.html', a + 'index.html', a + '/index.html'].some(x => existsSync(arrel + x.replace(/^\//, '')));
  ok(passos.length >= 8 && passos.every(fitxer), `els ${passos.length} passos porten a una pàgina que hi és`);
  ok(['negocio', 'empresa', 'consultor', 'comunidad', 'cliente'].every(p => rc.includes(p + ': [')), 'i hi ha camí per als cinc perfils');
}

console.log(`\n${fail ? '❌' : '✅'} ${pass} correctes, ${fail} errors`);
process.exit(fail ? 1 : 0);
