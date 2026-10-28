/* El router de models · provat sense xarxa
   ─────────────────────────────────────────────────────────────────────────
   `netlify/lib/ia-router.mjs` tria el model de cada crida a Claude (l'Àlvar,
   27/10/2026). El que es prova:

   · Cada tasca va al model més petit que la fa bé; el que no es coneix, a Sonnet.
   · Haiku no porta `fallbacks` (no en té); Sonnet i Opus sí, amb la seva capçalera.
   · La reserva és el pitjor cas al preu més car que pot respondre.
   · El cost surt de `usage`, i de cada intent si hi ha hagut fallback.
   · El registre suma per projecte i per model, sense cap dada personal.
   · La taula pública no porta claus; la despesa només amb el testimoni. */
import { tria, peticio, capcaleres, cost, reserva, registra, resum, taula, MODELS, TASQUES, PROJECTES } from '../../netlify/lib/ia-router.mjs';
import { despesa, handler } from '../../netlify/functions/ia-router.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const memoria = () => { const m = new Map(); return { m, get: async k => (m.has(k) ? JSON.parse(m.get(k)) : null), set: async (k, v) => { m.set(k, JSON.stringify(v)); } }; };

console.log('\n— Quin model fa cada tasca');
ok(tria({ projecte: 'eventspenedes', tasca: 'classifica' }).model === 'claude-haiku-5-5', 'classificar → Haiku 5.5');
ok(tria({ projecte: 'teamtowers', tasca: 'escriu' }).model === 'claude-sonnet-5-5', 'escriure → Sonnet 5.5');
ok(tria({ projecte: 'matriu', tasca: 'estrategia' }).model === 'claude-opus-5-5', 'estratègia → Opus 5.5');
const m = tria({ projecte: 'matriu', tasca: 'mapa' });
ok(m.model === 'claude-opus-5-5' && m.effort === 'low', 'el mapa del client: Opus 5.5 amb esforç baix (com abans del router)');
const d = tria({ projecte: 'no-existeix', tasca: 'inventada' });
ok(d.projecte === 'matriu' && d.tasca === 'escriu' && d.model === 'claude-sonnet-5-5', 'projecte o tasca desconeguts: la matriu i Sonnet, mai Opus per defecte');
ok(Object.values(TASQUES).every(t => MODELS[t.model] && 'fallbacks' in MODELS[t.model]), 'cada tasca apunta a un model de la carta');
ok(Object.values(TASQUES).every(t => ['low', 'medium', 'high', 'xhigh', 'max'].includes(t.effort)), 'cada tasca té un esforç vàlid');

console.log('\n— La petició');
const h = tria({ tasca: 'resumeix' }), ph = peticio(h, { max_tokens: 500, system: 's', messages: [{ role: 'user', content: 'x' }] });
ok(!('fallbacks' in ph) && !capcaleres('k', h)['anthropic-beta'], 'Haiku: sense fallbacks ni la seva capçalera');
ok(ph.output_config.effort === 'low' && !ph.output_config.format && !('thinking' in ph), 'esforç a output_config, sense format si no en cal, i sense tocar el thinking');
const po = peticio(m, { max_tokens: 3000, system: 's', messages: [], format: { type: 'json_schema', schema: {} } });
ok(po.fallbacks === 'default' && capcaleres('k', m)['anthropic-beta'] === 'server-side-fallback-2026-07-01', 'Opus: fallbacks "default" amb la capçalera beta');
ok(po.output_config.format.type === 'json_schema' && capcaleres('k', m)['anthropic-version'] === '2026-10-21', 'amb esquema quan es demana, i la versió de l\'API');

console.log('\n— Reserva i cost');
ok(Math.abs(reserva(h, 2500, 1000) - ((1000 + 1500) * 0.1 + 1000 * 0.5) / 1e6) < 1e-12, 'Haiku reserva al seu preu (no té a qui caure)');
ok(Math.abs(reserva(m, 2500, 1000) - ((1000 + 1500) * 5 + 1000 * 25) / 1e6) < 1e-12, 'Opus reserva al preu més car que pot respondre');
ok(Math.abs(cost({ model: 'claude-haiku-5-5', usage: { input_tokens: 1e6, output_tokens: 1e6 } }) - 0.6) < 1e-9, 'el cost surt de usage i del preu del model');
const fb = cost({ model: 'claude-opus-4-8', usage: { iterations: [{ model: 'claude-opus-5-5', input_tokens: 1e6, output_tokens: 0 }, { model: 'claude-opus-4-8', input_tokens: 0, output_tokens: 1e6 }] } });
ok(Math.abs(fb - (4 + 25)) < 1e-9, 'amb fallback, cada intent al seu preu');
ok(Math.abs(cost({ model: 'claude-sonnet-5-5', usage: { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 1e6 } }) - 0.2) < 1e-9, 'la memòria cau compta a una desena part');

console.log('\n— El registre');
const reg = memoria(), ara = new Date('2026-10-27T20:00:00Z');
await registra(reg, { projecte: 'matriu', tasca: 'mapa', model: 'claude-opus-5-5', usd: 0.02, usage: { input_tokens: 1000, output_tokens: 500 }, correu: 'algu@exemple.cat' }, ara);
await registra(reg, { projecte: 'matriu', tasca: 'mapa', model: 'claude-opus-5-5', usd: 0.03, usage: { input_tokens: 10, output_tokens: 5 } }, ara);
await registra(reg, { projecte: 'eventspenedes', tasca: 'classifica', model: 'claude-haiku-5-5', usd: 0.001 }, ara);
await registra(reg, { projecte: 'eventspenedes', tasca: 'classifica', model: 'claude-haiku-5-5', usd: 0 }, ara);
const r = await resum(reg, '2026-10');
ok(r.usd === 0.051 && r.projectes.matriu.usd === 0.05 && r.projectes.matriu.crides === 2, 'suma per projecte, i el total del mes');
ok(r.projectes.matriu.models['claude-opus-5-5'].tokens === 1515 && r.projectes.eventspenedes.tasques.classifica === 1, 'per model (tokens) i per tasca; les crides de cost zero no compten');
ok(!JSON.stringify([...reg.m.values()]).includes('@'), 'cap correu ni dada personal al registre');
ok((await resum(reg, 'octubre')) === null && (await resum(null, '2026-09')).usd === 0, 'mes mal escrit: res; mes sense res: zero');

console.log('\n— Des de fora');
const t = taula();
ok(t.tasques.classifica.model === 'claude-haiku-5-5' && t.models['claude-opus-5-5'].preu[0] === 4 && !t.models['claude-opus-4-8'], 'la taula pública: tasques, models de la carta i preus');
ok(Object.keys(t.projectes).length === Object.keys(PROJECTES).length && !/sk-ant|usd/.test(JSON.stringify(t)), 'sense claus ni despesa');
const pub = await handler({ httpMethod: 'GET', queryStringParameters: {} });
ok(pub.statusCode === 200 && JSON.parse(pub.body).regla, 'GET sense res: la taula');
const TOK = 'x'.repeat(30), ENV = { IA_CIERRE_TOKEN: TOK };
ok((await despesa('2026-10', 'Bearer ' + TOK, ENV, reg)).usd === 0.051, 'la despesa del mes, amb el testimoni');
ok((await despesa('2026-10', 'Bearer dolent', ENV, reg)) === null && (await despesa('2026-10', 'Bearer curt', { IA_CIERRE_TOKEN: 'curt' }, reg)) === null, 'sense testimoni bo (o curt): res');
const sense = await handler({ httpMethod: 'GET', queryStringParameters: { mes: '2026-10' }, headers: {} });
ok(sense.statusCode === 404, 'per fora, la despesa sense testimoni és un 404');

console.log('\n' + pass + ' bé, ' + fail + ' malament');
process.exit(fail ? 1 : 0);
