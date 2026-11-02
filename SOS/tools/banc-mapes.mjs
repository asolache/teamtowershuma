/* El banc de mapes · mesurar si la IA de /cliente/ fa bons mapes de valor
   ─────────────────────────────────────────────────────────────────────────
   L'Àlvar (02/11/2026): aprofitar el crèdit de l'API que caduca el 6/11 per
   millorar el cervell que fa mapes de valor i la UX de /cliente/. Pla:
   /mnt/project-files/sos/plan-credito-api-noviembre.md.

   Tres passos, i cada un deixa fitxers que es queden al repositori:
     casos   · genera casos de negoci (com els escriuria un client a /cliente/)
               amb el que un bon mapa hauria de tenir → SOS/knowledge/vna/banc-mapes/casos.json
     corre   · passa cada cas per la IA de /cliente/ (les mateixes peces de
               pule-mapa.mjs: text, sistema, PAS, ESQUEMA, valida) amb una variant
               del prompt i un model → <sortida>/respostes.json (amb la salut del motor)
     jutja   · un jutge (Opus 5.5) puntua a cegues cada resposta amb la rúbrica
               de banc-mapes/rubrica.md → <sortida>/notes.json i informe.md

   Ús:
     node SOS/tools/banc-mapes.mjs casos --n 40 --tope 6
     node SOS/tools/banc-mapes.mjs corre --variant actual [--model claude-sonnet-5-5] --tope 15 --sortida out/
     node SOS/tools/banc-mapes.mjs jutja --sortida out/ --tope 8
     --sec          · no crida res: diu quantes peticions i el cost màxim
     --sincron      · crida una a una en lloc de per lots (més car, per provar)

   Lots (Message Batches): la meitat de preu; respon en minuts o hores.
   El tope (`--tope` en USD) es comprova abans d'enviar amb el pitjor cas.
   Clau: ANTHROPIC_API_KEY de l'entorn (secret de GitHub; mai al repositori). */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { text, sistema, PAS, ESQUEMA, valida, neteja } from '../../netlify/functions/pule-mapa.mjs';
import { tria, capcaleres, cost, MODELS } from '../../netlify/lib/ia-router.mjs';
import MM from '../lib/models-mapa.js';

const ARREL = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const BANC = join(ARREL, 'SOS', 'knowledge', 'vna', 'banc-mapes');
const API = 'https://api.anthropic.com/v1/messages';
const llegeixJ = f => JSON.parse(readFileSync(f, 'utf8'));
const S = (props, req) => ({ type: 'object', properties: props, required: req || Object.keys(props), additionalProperties: false });
const STR = { type: 'string' }, LST = { type: 'array', items: STR }, MENA = { type: 'string', enum: ['tangible', 'intangible'] };

/* ─── Els casos ─── */
export const SECTORS = [
  'escuela de idiomas', 'formación de profesores', 'bodega familiar', 'restaurante de proximidad', 'organizadora de eventos',
  'cooperativa de consumo', 'consultora de personas', 'tienda de barrio', 'estudio de diseño', 'fisioterapeuta autónoma',
  'casa rural', 'asociación cultural', 'colla castellera', 'productora musical', 'huerto ecológico con cestas',
  'academia de baile', 'gestoría', 'taller de bicicletas', 'espacio de coworking', 'guía turística'];
const ESQ_CAS = S({ casos: { type: 'array', items: S({
  sector: STR, casa: STR, org: STR, inicial: STR,
  respuestas: S({ objetivo: STR, quien: STR, llegan: STR, aliados: STR, despues: STR, preguntan: STR, tiempo: STR, webHoy: STR }),
  alrededor: { type: 'array', items: S({ quien: STR, meDa: STR, meDaEs: MENA, leDoy: STR, leDoyEs: MENA }) },
  esperado: S({ roles: LST, intangibles: LST, noInventar: LST, dudas: LST })
}) } });
const SIS_CAS = [
  'Eres una experta en análisis de redes de valor (Verna Allee) que prepara casos de prueba realistas para medir una IA.',
  'Cada caso es una persona de España que entra en una web para dibujar el mapa de valor de su proyecto, y escribe como escribiría ella: frases cortas, a veces vagas, sin jerga.',
  'Varía el nivel: unas personas apenas escriben nada y no ponen a nadie a su alrededor; otras ponen tres a cinco filas con errores típicos (todo tangible, roles repetidos, personas en vez de roles, falta quien recomienda).',
  'En «esperado» escribe lo que un buen mapa de ese caso debería tener: «roles» (4 a 8 roles de la red, nombrados como roles, no personas), «intangibles» (3 a 6 intercambios que no se pagan y son propios de ese proyecto), «noInventar» (datos que la IA no debería inventar: precios, nombres, cifras), «dudas» (2 a 4 cosas que no quedan claras y habría que preguntar).',
  'No uses marcas reales ni personas reales.'].join('\n');
export function peticionsCasos(n, model) {
  const per = 5, l = [];
  for (let i = 0; i < Math.ceil(n / per); i++) {
    const sec = Array.from({ length: per }, (_, k) => SECTORS[(i * per + k) % SECTORS.length]);
    l.push({ custom_id: 'casos-' + i, params: { model, max_tokens: 9000, system: SIS_CAS, output_config: { effort: 'medium', format: { type: 'json_schema', schema: ESQ_CAS } },
      messages: [{ role: 'user', content: 'Prepara ' + per + ' casos, uno por sector, en este orden: ' + sec.join(' · ') + '. ' +
        (i % 2 ? 'En este grupo, la mayoría con filas a su alrededor.' : 'En este grupo, la mayoría sin filas o con una sola.') }] } });
  }
  return l;
}

/* ─── Les variants del prompt: banc-mapes/variants/<nom>.json ───
   { "nom": "...", "sistemaExtra": "línies que s'afegeixen al sistema", "pas": "substitueix PAS.mapa", "pasExtra": "s'afegeix a PAS.mapa" } */
export function variant(nom) {
  if (!nom || nom === 'actual') return { nom: 'actual' };
  return Object.assign({ nom }, llegeixJ(join(BANC, 'variants', nom + '.json')));
}
/* La fitxa que enviaria /cliente/, amb el model del sector si n'hi ha (com el navegador). */
export function dadesDe(cas, llengua = 'es') {
  const r = Object.entries(cas.respuestas || {}).filter(([, a]) => a).map(([id, a]) => ({ id, q: id, a }));
  const sug = MM.suggereix([cas.casa, cas.org, cas.inicial, ...r.map(x => x.a)].join(' '), llengua), mr = sug ? MM.mapa(sug.id, llengua, cas.casa) : null;
  return neteja({ casa: cas.casa, org: cas.org, inicial: cas.inicial, respuestas: r, alrededor: cas.alrededor || [], llengua,
    model: mr ? { nom: mr.nom, bona: mr.bona, pairs: mr.pairs, veda: mr.veda, passos: mr.passos } : null });
}
export function peticioMapa(cas, v, t) {
  const d = dadesDe(cas);
  const pas = (v.pas || PAS.mapa) + (v.pasExtra ? '\n' + v.pasExtra : '');
  const sys = sistema(d.llengua) + (v.sistemaExtra ? '\n' + v.sistemaExtra : '');
  const esq = v.esquema === 'opcions' ? ESQUEMA_OPCIONS : ESQUEMA.mapa;
  return { custom_id: cas.id, params: { model: t.model, max_tokens: 3000, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
    output_config: { effort: t.effort, format: { type: 'json_schema', schema: esq } },
    messages: [{ role: 'user', content: text(d) + '\n\n' + pas }] } };
}
/* B1 (UX com Claude): cada dubte torna com a pregunta amb opcions per triar, i «otra». */
export const ESQUEMA_OPCIONS = JSON.parse(JSON.stringify(ESQUEMA.mapa));
ESQUEMA_OPCIONS.properties.preguntas = { type: 'array', items: S({ pregunta: STR, opciones: LST, varias: { type: 'boolean' } }) };

/* ─── El jutge ─── */
const ESQ_NOTA = S({ roles: { type: 'integer' }, intangibles: { type: 'integer' }, fidelitat: { type: 'integer' }, preguntes: { type: 'integer' },
  claredat: { type: 'integer' }, global: { type: 'integer' }, falla: STR });
export function peticioJutge(cas, resposta, model) {
  const rub = readFileSync(join(BANC, 'rubrica.md'), 'utf8');
  return { custom_id: cas.id, params: { model, max_tokens: 1500, system: [{ type: 'text', text: rub, cache_control: { type: 'ephemeral' } }],
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: ESQ_NOTA } },
    messages: [{ role: 'user', content: '<caso>\n' + JSON.stringify({ casa: cas.casa, inicial: cas.inicial, respuestas: cas.respuestas, alrededor: cas.alrededor }) +
      '\n</caso>\n<esperado>\n' + JSON.stringify(cas.esperado) + '\n</esperado>\n<respuesta_de_la_ia>\n' + JSON.stringify(resposta) + '\n</respuesta_de_la_ia>\nPuntúa según la rúbrica.' }] } };
}

/* ─── El cost màxim abans d'enviar (pitjor cas, preu de lot = meitat) ─── */
export function pitjor(peticions, lot = true) {
  return peticions.reduce((s, p) => {
    const [pe, ps] = (MODELS[p.params.model] && MODELS[p.params.model].preu) || [5, 25];
    const chars = JSON.stringify(p.params.system).length + JSON.stringify(p.params.messages).length;
    return s + ((chars / 2.5) * pe + p.params.max_tokens * ps) / 1e6;
  }, 0) * (lot ? 0.5 : 1);
}

/* ─── Les crides ─── */
const espera = ms => new Promise(r => setTimeout(r, ms));
async function lot(peticions, clau, fetchFn = globalThis.fetch) {
  const h = capcaleres(clau, { fallbacks: false });
  const r = await fetchFn(API + '/batches', { method: 'POST', headers: h, body: JSON.stringify({ requests: peticions }) });
  const b = await r.json();
  if (!r.ok) throw new Error('lot: ' + ((b.error && b.error.message) || r.status));
  console.log('  lot ' + b.id + ' enviat (' + peticions.length + ')');
  let e = b;
  while (e.processing_status !== 'ended') {
    await espera(30000);
    e = await (await fetchFn(API + '/batches/' + b.id, { headers: h })).json();
    console.log('  … ' + JSON.stringify(e.request_counts || {}));
  }
  const txt = await (await fetchFn(e.results_url, { headers: h })).text();
  return txt.split('\n').filter(Boolean).map(l => JSON.parse(l)).map(x => ({ id: x.custom_id, r: x.result && x.result.message, error: x.result && x.result.type !== 'succeeded' ? x.result.type : null }));
}
async function sincron(peticions, clau, fetchFn = globalThis.fetch) {
  const h = capcaleres(clau, { fallbacks: false }), out = [];
  for (const p of peticions) {
    const r = await fetchFn(API, { method: 'POST', headers: h, body: JSON.stringify(p.params) }), j = await r.json();
    out.push({ id: p.custom_id, r: r.ok ? j : null, error: r.ok ? null : ((j.error && j.error.type) || r.status) });
  }
  return out;
}
const jsonDe = r => JSON.parse((r.content || []).filter(b => b.type === 'text').map(b => b.text).join(''));
/* El cost real: el del router, a meitat de preu si és per lots. */
const costReal = (rs, lotOn) => rs.reduce((s, x) => s + (x.r ? cost(x.r) : 0), 0) * (lotOn ? 0.5 : 1);

/* ─── L'informe ─── */
export function informe(notes, meta) {
  const camps = ['roles', 'intangibles', 'fidelitat', 'preguntes', 'claredat', 'global'];
  const mitja = k => { const v = notes.filter(n => n.nota).map(n => n.nota[k]); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(2) : '—'; };
  const sal = notes.filter(n => n.salut).map(n => n.salut.despres - n.salut.abans);
  const l = ['# Banc de mapes · ' + meta.variant + ' · ' + meta.model, '',
    'Casos: ' + notes.length + ' · cost de les respostes: ' + meta.cost.toFixed(2) + ' $ · del jutge: ' + (meta.costJutge || 0).toFixed(2) + ' $', '',
    '| ' + camps.join(' | ') + ' | salut +|', '|' + camps.map(() => '---').join('|') + '|---|',
    '| ' + camps.map(mitja).join(' | ') + ' | ' + (sal.length ? (sal.reduce((a, b) => a + b, 0) / sal.length).toFixed(1) : '—') + ' |', '',
    '## Els pitjors', ''];
  notes.filter(n => n.nota).sort((a, b) => a.nota.global - b.nota.global).slice(0, 8).forEach(n => l.push('- **' + n.id + '** (' + n.nota.global + '): ' + n.nota.falla));
  return l.join('\n') + '\n';
}

/* ─── La línia d'ordres ─── */
function args(v) {
  const o = { _: [] };
  for (let i = 0; i < v.length; i++) { if (v[i].startsWith('--')) { const k = v[i].slice(2); o[k] = v[i + 1] && !v[i + 1].startsWith('--') ? v[++i] : true; } else o._.push(v[i]); }
  return o;
}
async function main() {
  const a = args(process.argv.slice(2)), ordre = a._[0], clau = (process.env.ANTHROPIC_API_KEY || '').trim();
  const tope = Number(a.tope || 5), lotOn = !a.sincron, sortida = resolve(a.sortida || 'banc-mapes');
  const crida = async ps => {
    const max = pitjor(ps, lotOn);
    console.log(ordre + ': ' + ps.length + ' peticions · pitjor cas ' + max.toFixed(2) + ' $ · tope ' + tope + ' $');
    if (max > tope) throw new Error('el pitjor cas passa del tope');
    if (a.sec) return null;
    if (!clau) throw new Error('falta ANTHROPIC_API_KEY');
    /* Només el tipus de clau (fins al tercer guió), mai la clau. */
    if (!clau.startsWith('sk-ant-api')) console.log('  avís: la clau és del tipus «' + clau.split('-').slice(0, 3).join('-').slice(0, 12) + '», no «sk-ant-api…»; ho provem igualment');
    return lotOn ? lot(ps, clau) : sincron(ps, clau);
  };
  const OPUS = 'claude-opus-5-5';
  if (ordre === 'casos') {
    const ps = peticionsCasos(Number(a.n || 40), OPUS), rs = await crida(ps);
    if (!rs) return;
    const fitxer = join(BANC, 'casos.json'), vells = existsSync(fitxer) ? llegeixJ(fitxer).casos : [], nous = [];
    rs.filter(x => x.r).forEach(x => jsonDe(x.r).casos.forEach(c => nous.push(c)));
    const casos = vells.concat(nous.map((c, i) => Object.assign({ id: 'c' + String(vells.length + i + 1).padStart(3, '0') }, c)));
    writeFileSync(fitxer, JSON.stringify({ versio: 1, generat: new Date().toISOString().slice(0, 10), casos }, null, 1) + '\n');
    console.log('casos: ' + casos.length + ' · cost ' + costReal(rs, lotOn).toFixed(2) + ' $');
    return;
  }
  const casos = llegeixJ(join(BANC, 'casos.json')).casos.slice(0, Number(a.max || 999));
  mkdirSync(sortida, { recursive: true });
  if (ordre === 'corre') {
    const v = variant(a.variant), base = tria({ projecte: 'matriu', tasca: 'mapa' });
    const t = Object.assign({}, base, a.model ? { model: a.model } : {}, a.effort ? { effort: a.effort } : {});
    const ps = casos.map(c => peticioMapa(c, v, t)), rs = await crida(ps);
    if (!rs) return;
    const per = new Map(casos.map(c => [c.id, c]));
    const respostes = rs.map(x => {
      if (!x.r) return { id: x.id, error: x.error };
      try {
        const j = jsonDe(x.r), d = dadesDe(per.get(x.id));
        const preg = j.preguntas;
        const v2 = valida('mapa', Object.assign({}, j, { preguntas: (preg || []).map(p => typeof p === 'string' ? p : p.pregunta) }), d);
        return { id: x.id, resposta: Object.assign(v2, { opcions: Array.isArray(preg) && typeof preg[0] === 'object' ? preg : undefined }), usage: x.r.usage };
      } catch (e) { return { id: x.id, error: 'json' }; }
    });
    writeFileSync(join(sortida, 'respostes.json'), JSON.stringify({ variant: v.nom, model: t.model, effort: t.effort, cost: costReal(rs, lotOn), respostes }, null, 1));
    console.log('respostes: ' + respostes.filter(r => r.resposta).length + '/' + casos.length + ' · cost ' + costReal(rs, lotOn).toFixed(2) + ' $');
    return;
  }
  if (ordre === 'jutja') {
    const R = llegeixJ(join(sortida, 'respostes.json')), per = new Map(casos.map(c => [c.id, c]));
    const ok = R.respostes.filter(r => r.resposta && per.has(r.id));
    const ps = ok.map(r => peticioJutge(per.get(r.id), { resumen: r.resposta.resumen, sugerencias: r.resposta.sugerencias, preguntas: r.resposta.opcions || r.resposta.preguntas }, OPUS));
    const rs = await crida(ps);
    if (!rs) return;
    const nota = new Map(rs.filter(x => x.r).map(x => { try { return [x.id, jsonDe(x.r)]; } catch (e) { return [x.id, null]; } }));
    const notes = ok.map(r => ({ id: r.id, nota: nota.get(r.id) || null, salut: r.resposta.salut }));
    const meta = { variant: R.variant, model: R.model, cost: R.cost, costJutge: costReal(rs, lotOn) };
    writeFileSync(join(sortida, 'notes.json'), JSON.stringify({ meta, notes }, null, 1));
    writeFileSync(join(sortida, 'informe.md'), informe(notes, meta));
    console.log(informe(notes, meta));
    return;
  }
  console.log('ordres: casos | corre | jutja (vegeu la capçalera)');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(e => { console.error('✗ ' + e.message); process.exit(1); });
