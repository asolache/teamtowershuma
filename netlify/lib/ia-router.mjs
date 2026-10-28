/* El router de models · quin Claude fa cada feina, i quant costa
   ─────────────────────────────────────────────────────────────────────────
   L'Àlvar (27/10/2026): una peça que controli quin model és més eficient per a
   cada projecte seu. Viu a la matriu i la fan servir totes les funcions que
   criden Claude: cap funció tria el model per la seva banda (DRY).

   El compromís de ia.html: «lo más inteligente posible al menor coste
   energético». Per això la regla és **el model més petit que fa bé la feina**:
   · Haiku 5.5   classificar, resumir, extreure, etiquetar.
   · Sonnet 5.5  escriure, traduir, atendre (clients, xat).
   · Opus 5.5    raonar, estratègia, el mapa de valor.
   Pujar de model es fa aquí, per tasca o per projecte, i mai a la funció.

   · `tria({ projecte, tasca })` → { model, effort, fallbacks, preu, pitjor }.
   · `peticio(t, { system, messages, max_tokens, format })` → el cos per a
     /v1/messages, i `capcaleres(clau, t)`.
   · `cost(r)` el cost real (en $) d'una resposta, a partir de `usage`.
   · `registra(reg, …)` i `resum(reg, mes)`: el que gasta cada projecte i cada
     model al mes, sense cap dada personal (magatzem `ia-router`).

   Una sola clau: ANTHROPIC_API_KEY a Netlify. Preus en $ per milió de tokens
   (entrada, sortida), de la taula d'Anthropic del 06/10/2026. */

export const MODELS = {
  'claude-haiku-5-5': { nom: 'Haiku 5.5', preu: [0.1, 0.5], fallbacks: false },
  'claude-sonnet-5-5': { nom: 'Sonnet 5.5', preu: [2, 10], fallbacks: true },
  'claude-opus-5-5': { nom: 'Opus 5.5', preu: [4, 20], fallbacks: true },
  /* Només per comptar: els que poden respondre amb `fallbacks: "default"`. */
  'claude-opus-5': { nom: 'Opus 5', preu: [5, 25] },
  'claude-opus-4-8': { nom: 'Opus 4.8', preu: [5, 25] }
};
/* El més car que pot respondre una crida amb `fallbacks`: és el que es reserva. */
export const PITJOR = [5, 25];

export const TASQUES = {
  classifica: { model: 'claude-haiku-5-5', effort: 'low' },
  resumeix: { model: 'claude-haiku-5-5', effort: 'low' },
  extreu: { model: 'claude-haiku-5-5', effort: 'low' },
  escriu: { model: 'claude-sonnet-5-5', effort: 'medium' },
  tradueix: { model: 'claude-sonnet-5-5', effort: 'low' },
  aten: { model: 'claude-sonnet-5-5', effort: 'low' },
  raona: { model: 'claude-opus-5-5', effort: 'medium' },
  estrategia: { model: 'claude-opus-5-5', effort: 'high' },
  /* pule-mapa.mjs: el mapa del client, amb esquema i esforç baix. */
  mapa: { model: 'claude-opus-5-5', effort: 'low' }
};

/* Els projectes de l'Àlvar. `tasques` canvia una tasca només en aquell projecte. */
export const PROJECTES = {
  matriu: { nom: 'TeamTowers Humà · SOS' },
  teamtowers: { nom: 'TeamTowers · Fent Pinya' },
  eventspenedes: { nom: 'Events Penedès' },
  alvarosolache: { nom: 'Álvaro Solache' },
  molekulon: { nom: 'Molekulon' }
};

const net = v => (v == null ? '' : String(v)).trim();

export function tria({ projecte, tasca } = {}) {
  const p = PROJECTES[projecte] ? projecte : 'matriu', k = TASQUES[tasca] ? tasca : 'escriu';
  const t = Object.assign({}, TASQUES[k], (PROJECTES[p].tasques || {})[k]);
  const m = MODELS[t.model];
  return { projecte: p, tasca: k, model: t.model, effort: t.effort, fallbacks: !!m.fallbacks, preu: m.preu, pitjor: m.fallbacks ? PITJOR : m.preu };
}

export function capcaleres(clau, t) {
  const h = { 'Content-Type': 'application/json', 'x-api-key': clau, 'anthropic-version': '2026-10-21' };
  if (t.fallbacks) h['anthropic-beta'] = 'server-side-fallback-2026-07-01';
  return h;
}

export function peticio(t, { system, messages, max_tokens, format }) {
  const cos = { model: t.model, max_tokens, system, output_config: { effort: t.effort }, messages };
  if (format) cos.output_config.format = format;
  if (t.fallbacks) cos.fallbacks = 'default';
  return cos;
}

const preu = m => (MODELS[m] && MODELS[m].preu) || PITJOR;
/* Amb fallbacks, `usage.iterations` diu quin model ha fet cada tros. */
export function cost(r) {
  const parts = Array.isArray(r.usage && r.usage.iterations) && r.usage.iterations.length ? r.usage.iterations : [Object.assign({ model: r.model }, r.usage)];
  return parts.reduce((s, u) => {
    const [pe, ps] = preu(u.model || r.model);
    const ent = (u.input_tokens || 0) + 1.25 * (u.cache_creation_input_tokens || 0) + 0.1 * (u.cache_read_input_tokens || 0);
    return s + (ent * pe + (u.output_tokens || 0) * ps) / 1e6;
  }, 0);
}

/* El pitjor cas abans de cridar: entrada estimada (2,5 caràcters per token)
   + el sistema + tota la sortida, al preu més car que pot respondre. */
export const reserva = (t, caracters, maxTokens, sistema = 1500) => ((Math.ceil(caracters / 2.5) + sistema) * t.pitjor[0] + maxTokens * t.pitjor[1]) / 1e6;

/* ─── El registre: un document per mes, per projecte i per model ─── */
export async function registra(reg, { projecte, tasca, model, usd, usage }, ara = new Date()) {
  if (!reg || !(usd > 0)) return;
  const k = 'mes/' + ara.toISOString().slice(0, 7), m = (await reg.get(k)) || { usd: 0, projectes: {} };
  const p = m.projectes[projecte] || (m.projectes[projecte] = { usd: 0, crides: 0, models: {}, tasques: {} });
  const u = usage || {}, tokens = (u.input_tokens || 0) + (u.output_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
  m.usd += usd; p.usd += usd; p.crides += 1;
  const mm = p.models[model] || (p.models[model] = { usd: 0, crides: 0, tokens: 0 });
  mm.usd += usd; mm.crides += 1; mm.tokens += tokens;
  p.tasques[tasca] = (p.tasques[tasca] || 0) + 1;
  await reg.set(k, m);
}

export async function resum(reg, mes) {
  if (!/^\d{4}-\d{2}$/.test(net(mes))) return null;
  const m = (reg && (await reg.get('mes/' + mes))) || { usd: 0, projectes: {} }, r4 = x => +x.toFixed(4);
  const projectes = {};
  for (const [k, p] of Object.entries(m.projectes)) {
    projectes[k] = { nom: (PROJECTES[k] || {}).nom || k, usd: r4(p.usd), crides: p.crides, tasques: p.tasques,
      models: Object.fromEntries(Object.entries(p.models).map(([id, x]) => [id, { usd: r4(x.usd), crides: x.crides, tokens: x.tokens }])) };
  }
  return { mes, usd: r4(m.usd), projectes };
}

/* La taula pública (ia.html): què fa cada model i quant costa. Sense claus. */
export const taula = () => ({
  regla: 'El model més petit que fa bé la feina.',
  models: Object.fromEntries(Object.entries(MODELS).filter(([, m]) => 'fallbacks' in m).map(([id, m]) => [id, { nom: m.nom, preu: m.preu }])),
  tasques: Object.fromEntries(Object.keys(TASQUES).map(k => [k, { model: TASQUES[k].model, effort: TASQUES[k].effort }])),
  projectes: Object.fromEntries(Object.entries(PROJECTES).map(([k, p]) => [k, { nom: p.nom, tasques: p.tasques || {} }]))
});
