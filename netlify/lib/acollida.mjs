/* L'acollida · el que veu un client que ja treballa amb nosaltres
   ─────────────────────────────────────────────────────────────────────────
   Àlvaro (14/11/2026): «que lo próximo que le envíe a María le llegue por
   ahí, con todo lo que me ha enviado por correo dentro […] superar por diez la
   experiencia, a buen coste, y que sea muy fácilmente replicable. Dry».

   Una sola peça per a tots els clients, cap feta a mida. L'Àlvaro enganxa al
   seu panell el que el client li ha enviat (correus, notes) i la IA petita
   (`tria({ tasca: 'extreu' })`, Haiku) ho ordena en quatre parts que ell
   revisa abans de desar: el que ens ha explicat, el que ja ha decidit, el que
   li toca fer (que va al kanban únic com a tasques) i el que encara cal
   preguntar. Es desa a la fitxa del client (`fitxa.acollida`) i /cliente/ ho
   ensenya a «Tu espacio» (SOS/lib/acollida.js).

   **El text enganxat no es desa enlloc**: passa per la IA i en surt ordenat.
   Res d'aquí arriba al client sense que l'Àlvaro ho hagi desat.
   Pla: /mnt/project-files/producto/recorrido-perfil/puerta-cliente-maria.md */
import { tria, peticio, capcaleres, cost } from './ia-router.mjs';

const net = v => (v == null ? '' : String(v)).trim();
const t = (v, n) => net(v).replace(/\s+/g, ' ').slice(0, n);
const llista = (x, max, n) => (Array.isArray(x) ? x : []).map(v => t(typeof v === 'object' && v ? v.text : v, n)).filter(Boolean).slice(0, max);
/* Només https o una adreça del mateix lloc: mai `javascript:` ni res estrany. */
const enllac = v => { const s = net(v); return /^https:\/\/[^\s"'<>]+$/.test(s) || /^\/[^\s"'<>]*$/.test(s) ? s.slice(0, 300) : ''; };

export const IA = tria({ projecte: 'matriu', tasca: 'extreu' });
export const MAX_TEXT = 40000;

/* La forma neta, la mateixa a l'entrada (el panell) i a la sortida (la IA). */
export function neteja(x, ara = new Date()) {
  if (!x || typeof x !== 'object') return null;
  const o = {
    hola: t(x.hola, 400),
    sessio: t(x.sessio, 160),
    contat: llista(x.contat, 20, 300),
    decidit: llista(x.decidit, 20, 300),
    preguntes: llista(x.preguntes, 12, 300),
    web: enllac(x.web),
    seguent: x.seguent && typeof x.seguent === 'object'
      ? { text: t(x.seguent.text, 160), href: enllac(x.seguent.href) } : { text: '', href: '' },
    actualitzada: ara.toISOString()
  };
  const buit = !o.hola && !o.contat.length && !o.decidit.length && !o.preguntes.length && !o.web && !o.seguent.text;
  return buit ? null : o;
}

/* Els deures que la IA troba, com a targetes del kanban únic (SOS/lib/kanban.js).
   L'id surt del text: tornar a ordenar els mateixos correus no les duplica. */
export function deures(x, ara = new Date()) {
  return llista(x, 15, 200).map(text => ({
    id: 'ac-' + hash(text), text, col: 'todo', qui: 'cliente', tipus: 'gestion',
    origen: { tipus: 'acollida', id: 'correus', nom: 'Lo que nos has mandado' },
    creat: ara.toISOString().slice(0, 10), act: ara.toISOString()
  }));
}
function hash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(36); }

const ESQUEMA = {
  type: 'object', additionalProperties: false,
  required: ['hola', 'contat', 'decidit', 'deures', 'preguntes'],
  properties: {
    hola: { type: 'string', description: 'Una o dos frases para el cliente: dónde estamos ahora. Cálidas, sin jerga.' },
    contat: { type: 'array', items: { type: 'string' }, description: 'Lo que el cliente nos ha contado: qué quiere, sus públicos, sus programas, sus ideas. Una frase cada cosa, en sus palabras.' },
    decidit: { type: 'array', items: { type: 'string' }, description: 'Lo que el cliente ya ha decidido o confirmado.' },
    deures: { type: 'array', items: { type: 'string' }, description: 'Lo que le toca hacer al cliente (mandar algo, revisar algo, decidir algo). Empieza cada una con un verbo.' },
    preguntes: { type: 'array', items: { type: 'string' }, description: 'Lo que aún no sabemos y hay que preguntarle.' }
  }
};
const SISTEMA = 'Ordenas lo que un cliente le ha escrito a su consultor para enseñárselo de vuelta en su espacio privado. '
  + 'Escribe en castellano, en segunda persona («nos contaste», «te toca»), frases cortas y cálidas, en las palabras del cliente. '
  + 'Nunca nombres herramientas, programas ni jerga técnica. No incluyas precios, importes, correos, teléfonos ni datos de otras personas. '
  + 'No inventes nada que no esté en el texto: si algo no aparece, déjalo fuera.';

/* Una crida a la IA. `fetchFn` s'injecta per als tests. */
export async function ordena(text, env, fetchFn = globalThis.fetch, ara = new Date()) {
  const clau = net(env.ANTHROPIC_API_KEY);
  const tx = net(text).slice(0, MAX_TEXT);
  if (!tx) return { estat: 'error', motiu: 'Pega primero lo que te ha mandado.' };
  if (!clau) return { estat: 'error', motiu: 'falta ANTHROPIC_API_KEY' };
  const resp = await fetchFn('https://api.anthropic.com/v1/messages', { method: 'POST', headers: capcaleres(clau, IA),
    body: JSON.stringify(peticio(IA, { max_tokens: 2500, system: SISTEMA,
      format: { type: 'json_schema', schema: ESQUEMA },
      messages: [{ role: 'user', content: 'Esto es lo que me ha mandado el cliente:\n\n' + tx }] })) });
  const r = await resp.json().catch(() => ({}));
  if (!resp.ok) return { estat: 'error', motiu: 'claude: ' + ((r.error && r.error.type) || resp.status) };
  const usd = cost(r);
  if (r.stop_reason === 'refusal' || r.stop_reason === 'max_tokens') return { estat: 'error', motiu: 'La IA no ha podido con este texto. Prueba con menos.', usd };
  let j; try { j = JSON.parse((r.content || []).filter(b => b.type === 'text').map(b => b.text).join('')); } catch (e) { return { estat: 'error', motiu: 'La respuesta no se ha podido leer.', usd }; }
  return { estat: 'fet', acollida: neteja(j, ara), deures: deures(j.deures, ara), usd, ia: { model: r.model || IA.model, usage: r.usage } };
}
