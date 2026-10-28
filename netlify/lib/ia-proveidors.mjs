/* Els proveïdors del banc de proves · Claude, GPT, Gemini i DeepSeek
   ─────────────────────────────────────────────────────────────────────────
   L'Àlvar (28/10/2026): vol provar la qualitat d'altres models (Gemini, GPT i
   DeepSeek) al costat de Claude. Això és **per mesurar**, no per a producció:
   les crides de producció passen pel router (ia-router.mjs) i van a Claude.
   Ho fa servir el banc de proves (SOS/tools/banc-ia.mjs).

   `crida(proveidor, { model, system, prompt, max_tokens }, clau, fetch)` →
   { text, entrada, sortida, ms, model, error }. A pèl, sense paquets.

   Les claus: ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY i
   DEEPSEEK_API_KEY. Cap no surt mai a cap informe ni registre. */
import { tria, peticio, capcaleres } from './ia-router.mjs';

const net = v => (v == null ? '' : String(v)).trim();

/* Els models per defecte de cada proveïdor; es canvien amb BANC_MODEL_<P>.
   Els noms dels altres proveïdors canvien sovint: si un ja no hi és, el banc
   ho diu a l'informe i prou. */
export const PROVEIDORS = {
  claude: { nom: 'Claude', clau: 'ANTHROPIC_API_KEY', models: ['claude-haiku-5-5', 'claude-sonnet-5-5', 'claude-opus-5-5'] },
  openai: { nom: 'GPT', clau: 'OPENAI_API_KEY', models: ['gpt-5'] },
  gemini: { nom: 'Gemini', clau: 'GEMINI_API_KEY', models: ['gemini-2.5-pro'] },
  deepseek: { nom: 'DeepSeek', clau: 'DEEPSEEK_API_KEY', models: ['deepseek-chat'] }
};

export function candidats(env) {
  const out = [];
  for (const [p, d] of Object.entries(PROVEIDORS)) {
    const clau = net(env[d.clau]);
    if (!clau) continue;
    const models = net(env['BANC_MODEL_' + p.toUpperCase()]).split(/[\s,]+/).filter(Boolean);
    for (const model of models.length ? models : d.models) out.push({ proveidor: p, model, clau });
  }
  return out;
}

/* Claude: el mateix cos que a producció (router), amb l'esforç de la tasca. */
function claude({ model, system, prompt, max_tokens, tasca }, clau) {
  const t = Object.assign(tria({ tasca }), { model });
  return { url: 'https://api.anthropic.com/v1/messages', headers: capcaleres(clau, t),
    body: peticio(t, { max_tokens, system, messages: [{ role: 'user', content: prompt }] }),
    llegeix: r => ({ text: (r.content || []).filter(b => b.type === 'text').map(b => b.text).join(''),
      entrada: (r.usage && r.usage.input_tokens) || 0, sortida: (r.usage && r.usage.output_tokens) || 0, model: r.model, usage: r.usage, motiu: r.stop_reason }) };
}

/* GPT i DeepSeek parlen la mateixa forma (chat completions). */
function xat(url, camp) {
  return ({ model, system, prompt, max_tokens }, clau) => ({ url, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + clau },
    body: { model, [camp]: max_tokens, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] },
    llegeix: r => { const c = (r.choices || [])[0] || {};
      return { text: net(c.message && c.message.content), entrada: (r.usage && r.usage.prompt_tokens) || 0, sortida: (r.usage && r.usage.completion_tokens) || 0, model: r.model || model, motiu: c.finish_reason }; } });
}

function gemini({ model, system, prompt, max_tokens }, clau) {
  return { url: 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': clau },
    body: { systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: max_tokens } },
    llegeix: r => { const c = (r.candidates || [])[0] || {}, u = r.usageMetadata || {};
      return { text: ((c.content && c.content.parts) || []).map(p => p.text || '').join(''), entrada: u.promptTokenCount || 0, sortida: (u.candidatesTokenCount || 0) + (u.thoughtsTokenCount || 0), model, motiu: c.finishReason }; } };
}

const FORMES = { claude, openai: xat('https://api.openai.com/v1/chat/completions', 'max_completion_tokens'), deepseek: xat('https://api.deepseek.com/chat/completions', 'max_tokens'), gemini };

export async function crida(proveidor, peticioBanc, clau, fetchFn = globalThis.fetch, rellotge = () => Date.now()) {
  const forma = FORMES[proveidor];
  if (!forma) return { error: 'proveïdor desconegut' };
  const f = forma(peticioBanc, clau), t0 = rellotge();
  try {
    const resp = await fetchFn(f.url, { method: 'POST', headers: f.headers, body: JSON.stringify(f.body) });
    const r = await resp.json().catch(() => ({}));
    const ms = rellotge() - t0;
    /* L'error, curt i sense res de la petició (ni la clau). */
    if (!resp.ok) return { error: proveidor + ' ' + resp.status + ': ' + net((r.error && (r.error.message || r.error.type)) || '').slice(0, 160), ms };
    const o = f.llegeix(r);
    return Object.assign(o, { ms }, o.text ? {} : { error: 'resposta buida' + (o.motiu ? ' (' + o.motiu + ')' : '') });
  } catch (e) { return { error: proveidor + ': no s\'hi arriba', ms: rellotge() - t0 }; }
}
