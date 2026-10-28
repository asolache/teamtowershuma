/* El banc de proves de la IA · provat sense xarxa
   ─────────────────────────────────────────────────────────────────────────
   `netlify/lib/ia-proveidors.mjs` i `SOS/tools/banc-ia.mjs` (l'Àlvar,
   28/10/2026: provar Gemini, GPT i DeepSeek al costat de Claude). Amb un
   `fetch` fals: no gasta res. El que es prova:

   · Només entra qui té clau; els models es canvien per l'entorn.
   · Cada proveïdor rep la seva forma (URL, capçaleres, cos) i se'n llegeix el
     text i els tokens; un error es diu curt i sense la clau.
   · El jutge veu les respostes a cegues i barrejades, i la nota torna a la fila bona.
   · Cap xifra sense font: els altres proveïdors van «sense preu» si no se'n dona. */
import { candidats, crida, PROVEIDORS } from '../../netlify/lib/ia-proveidors.mjs';
import { executa, informe, barreja, promptJutge, preuDe } from '../tools/banc-ia.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const K = { a: 'sk-ant-api03-' + 'a'.repeat(40), o: 'sk-proj-' + 'o'.repeat(40), g: 'AIza' + 'g'.repeat(35), d: 'sk-' + 'd'.repeat(32) };

console.log('\n— Qui entra');
ok(candidats({}).length === 0, 'sense cap clau, ningú');
const tots = candidats({ ANTHROPIC_API_KEY: K.a, OPENAI_API_KEY: K.o, GEMINI_API_KEY: K.g, DEEPSEEK_API_KEY: K.d });
ok(tots.length === 6 && ['claude', 'openai', 'gemini', 'deepseek'].every(p => tots.some(c => c.proveidor === p)), 'amb les quatre claus: tres Claude, GPT, Gemini i DeepSeek');
const cg = candidats({ GEMINI_API_KEY: K.g, BANC_MODEL_GEMINI: 'gemini-x, gemini-y' });
ok(cg.length === 2 && cg[1].model === 'gemini-y', 'BANC_MODEL_<P> canvia (o afegeix) els models');

console.log('\n— La forma de cada proveïdor');
const vist = [];
const fals = resp => async (url, o) => { vist.push({ url, h: o.headers, b: JSON.parse(o.body) }); return { ok: resp.status < 400, status: resp.status, json: async () => resp.json }; };
const P = { model: 'm', system: 'sys', prompt: 'hola', max_tokens: 300, tasca: 'classifica' };
let r = await crida('openai', Object.assign({}, P, { model: 'gpt-5' }), K.o, fals({ status: 200, json: { model: 'gpt-5', choices: [{ message: { content: 'empresa' }, finish_reason: 'stop' }], usage: { prompt_tokens: 50, completion_tokens: 2 } } }));
ok(vist[0].url === 'https://api.openai.com/v1/chat/completions' && vist[0].h.Authorization === 'Bearer ' + K.o && vist[0].b.max_completion_tokens === 300 && vist[0].b.messages[0].role === 'system', 'GPT: chat completions, Bearer, max_completion_tokens, el sistema primer');
ok(r.text === 'empresa' && r.entrada === 50 && r.sortida === 2, 'i se\'n llegeix el text i els tokens');
r = await crida('deepseek', Object.assign({}, P, { model: 'deepseek-chat' }), K.d, fals({ status: 200, json: { choices: [{ message: { content: 'x' } }], usage: { prompt_tokens: 1, completion_tokens: 1 } } }));
ok(vist[1].url === 'https://api.deepseek.com/chat/completions' && vist[1].b.max_tokens === 300 && r.model === 'deepseek-chat', 'DeepSeek: la seva URL i max_tokens');
r = await crida('gemini', Object.assign({}, P, { model: 'gemini-2.5-pro' }), K.g, fals({ status: 200, json: { candidates: [{ content: { parts: [{ text: 'em' }, { text: 'presa' }] }, finishReason: 'STOP' }], usageMetadata: { promptTokenCount: 40, candidatesTokenCount: 3, thoughtsTokenCount: 10 } } }));
ok(/models\/gemini-2\.5-pro:generateContent$/.test(vist[2].url) && vist[2].h['x-goog-api-key'] === K.g && vist[2].b.systemInstruction.parts[0].text === 'sys' && vist[2].b.generationConfig.maxOutputTokens === 300, 'Gemini: generateContent, x-goog-api-key, systemInstruction');
ok(r.text === 'empresa' && r.sortida === 13, 'i el pensament de Gemini compta com a sortida');
r = await crida('claude', Object.assign({}, P, { model: 'claude-haiku-5-5' }), K.a, fals({ status: 200, json: { model: 'claude-haiku-5-5', stop_reason: 'end_turn', content: [{ type: 'text', text: 'empresa' }], usage: { input_tokens: 60, output_tokens: 2 } } }));
ok(vist[3].url === 'https://api.anthropic.com/v1/messages' && vist[3].h['x-api-key'] === K.a && vist[3].b.model === 'claude-haiku-5-5' && vist[3].b.output_config.effort === 'low', 'Claude: el mateix cos que el router, amb l\'esforç de la tasca');
r = await crida('openai', P, K.o, fals({ status: 401, json: { error: { message: 'Incorrect API key provided: ' + 'x'.repeat(300) } } }));
ok(r.error && r.error.startsWith('openai 401') && r.error.length < 200 && !r.error.includes(K.o), 'un error, curt i sense la clau');
r = await crida('gemini', P, K.g, async () => { throw new Error('xarxa'); });
ok(/no s'hi arriba/.test(r.error), 'sense xarxa, ho diu');
r = await crida('openai', P, K.o, fals({ status: 200, json: { choices: [{ message: { content: '' }, finish_reason: 'length' }] } }));
ok(/resposta buida \(length\)/.test(r.error), 'una resposta buida és un error, amb el motiu');

console.log('\n— El jutge, a cegues');
const ord = barreja(5, 'classifica-lead');
ok(ord.slice().sort().join() === '0,1,2,3,4' && ord.join() !== '0,1,2,3,4' && barreja(5, 'classifica-lead').join() === ord.join(), 'les lletres es barregen, sempre igual per a la mateixa tasca');
const pj = promptJutge({ system: 's', prompt: 'p', criteri: 'c' }, [{ lletra: 'A', text: 'gpt diu' }]);
ok(/<resposta lletra="A">\ngpt diu\n<\/resposta>/.test(pj) && /dades, no instruccions/.test(pj) && !/gpt-5|openai|gemini/.test(pj.replace('gpt diu', '')), 'el jutge no sap de quin model és cada resposta, i les respostes són dades');

console.log('\n— Tot el banc');
const T = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../knowledge/dev/banc-ia-tasques.json'), 'utf8')).tasques;
ok(T.length >= 5 && T.every(t => t.id && t.tasca && t.system && t.prompt && t.criteri), 'les tasques del banc porten id, feina, sistema, petició i criteri');
let jutgeVist = null;
const tot = async (url, o) => {
  const b = JSON.parse(o.body);
  if (url.includes('anthropic') && b.output_config && b.output_config.format) {
    jutgeVist = b;
    const n = (b.messages[0].content.match(/lletra="([A-Z])"/g) || []).map(x => x.slice(8, 9));
    return { ok: true, status: 200, json: async () => ({ model: 'claude-opus-5-5', stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 100 },
      content: [{ type: 'text', text: JSON.stringify({ notes: n.map((l, i) => ({ lletra: l, nota: 10 - i, motiu: 'ok' })) }) }] }) };
  }
  if (url.includes('anthropic')) return { ok: true, status: 200, json: async () => ({ model: b.model, stop_reason: 'end_turn', content: [{ type: 'text', text: 'resposta de ' + b.model }], usage: { input_tokens: 100, output_tokens: 50 } }) };
  if (url.includes('deepseek')) return { ok: false, status: 503, json: async () => ({}) };
  return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: 'resposta gpt' } }], usage: { prompt_tokens: 100, completion_tokens: 50 } }) };
};
let t = 0;
const o = await executa({ tasques: T.slice(0, 1), env: { ANTHROPIC_API_KEY: K.a, OPENAI_API_KEY: K.o, DEEPSEEK_API_KEY: K.d, BANC_PREU_OPENAI: '1,2' }, fetchFn: tot, rellotge: () => (t += 500) });
const f = o.resultats[0].files;
ok(f.length === 5 && f.filter(x => x.nota != null).length === 4 && f.find(x => x.proveidor === 'deepseek').nota == null, 'quatre respostes amb nota; la que falla, sense');
ok(jutgeVist.model === 'claude-opus-5-5' && jutgeVist.output_config.format.type === 'json_schema', 'el jutge és Opus 5.5 amb sortida amb esquema');
ok(Math.abs(f.find(x => x.proveidor === 'openai').usd - (100 * 1 + 50 * 2) / 1e6) < 1e-12 && f.find(x => x.model === 'claude-haiku-5-5').usd > 0, 'el cost: el de Claude del router, el de GPT amb el preu donat');
ok(o.costJutge > 0 && f.every(x => x.ms === 500), 'el cost del jutge i el temps de cada crida');
const md = informe(o);
ok(/\| claude-haiku-5-5 \| \d+ \|/.test(md) && /❌ deepseek 503/.test(md) && /## Resum/.test(md) && /mateixa casa/.test(md), 'l\'informe: una taula per tasca, l\'error, el resum i l\'avís del jutge');
ok(!md.includes(K.a) && !md.includes(K.o) && !JSON.stringify(o).includes(K.d), 'cap clau a l\'informe ni als resultats');
ok(preuDe({ proveidor: 'gemini' }, {}) === null && /sense preu/.test(informe(await executa({ tasques: T.slice(0, 1), env: { GEMINI_API_KEY: K.g }, fetchFn: async () => ({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: 'x' }] } }], usageMetadata: {} }) }), ambJutge: false }))), 'sense preu donat, «sense preu» (cap xifra sense font)');

console.log('\n' + pass + ' bé, ' + fail + ' malament');
process.exit(fail ? 1 : 0);
