/* La resposta proposada · «Habla con una persona» → l'Àlvaro la valida
   ─────────────────────────────────────────────────────────────────────────
   Àlvaro (14/11/2026), del backlog del recorregut: «que el bot proponga la
   respuesta a cada "Habla con una persona" y tú la valides». Quan algú escriu
   des de la web, la IA (router `tria({ tasca: 'aten' })`) n'escriu un
   esborrany de resposta. L'esborrany espera al seu panell, al costat de la
   targeta «Contestar a …»: l'Àlvaro el llegeix, el canvia si cal i l'envia
   ell des del seu correu. **Mai surt res sol.**

   Es desa a Netlify Blobs (magatzem `fitxes`, document `respostes`), les 50
   últimes. Les dades són les que la persona ha escrit al formulari. */
import { tria, peticio, capcaleres, cost } from './ia-router.mjs';

const net = v => (v == null ? '' : String(v)).trim();
const t = (v, n) => net(v).slice(0, n);
export const IA = tria({ projecte: 'matriu', tasca: 'aten' });
export const DOC = 'respostes';
const MAX = 50;

/* El pas següent de cada camí (auditoria-y-flujo.md): la resposta el proposa. */
export const CAMINS = {
  negocio: 'Proponle empezar por su mapa de valor, gratis, en https://teamtowershuma.com/cliente/#alrededor, y una llamada corta cuando lo tenga.',
  empresa: 'Si habla de su equipo o de un taller, pídele fecha aproximada, número de personas y lugar, y proponle una llamada de quince minutos.',
  consultor: 'Cuéntale que hay un itinerario para consultores y formadores en https://teamtowershuma.com/SOS/formacio.html#itineraris y pregúntale qué quiere aprender a hacer por sí mismo.',
  comunidad: 'Pregúntale por su comunidad o entidad (dónde, cuánta gente, qué quieren poner en marcha) y proponle una llamada.',
  cliente: 'Es alguien que ya trabaja con nosotros: contéstale a lo que pregunta y recuérdale que su espacio está en https://teamtowershuma.com/cliente/#espacio.'
};

export function sistema(d) {
  const ca = net(d.llengua) === 'ca';
  return 'Eres Álvaro Solache, consultor de TeamTowers Humà. Escribe el borrador de respuesta a alguien que te ha escrito desde la web. '
    + (ca ? 'Escribe en catalán. ' : 'Escribe en castellano. ')
    + 'Tono cercano y profesional, frases cortas, como mucho 120 palabras. Empieza saludando por su nombre. '
    + 'Contesta a lo que pregunta sin inventar nada. Nunca des precios ni importes. No nombres herramientas ni uses jerga técnica. '
    + 'Termina con un solo siguiente paso claro y firma «Álvaro». '
    + (CAMINS[net(d.perfil)] || 'Si no está claro qué necesita, pregúntaselo en una frase y proponle una llamada corta.');
}

export async function esborrany(d, env, fetchFn = globalThis.fetch) {
  const clau = net(env.ANTHROPIC_API_KEY);
  if (!clau) return { estat: 'sense-clau' };
  const entrada = ['Nombre: ' + t(d.nom, 120), d.tema && 'Tema: ' + t(d.tema, 160), 'Mensaje: ' + (t(d.missatge, 2000) || '(sin mensaje)'), d.pagina && 'Escribe desde: ' + t(d.pagina, 120)].filter(Boolean).join('\n');
  const resp = await fetchFn('https://api.anthropic.com/v1/messages', { method: 'POST', headers: capcaleres(clau, IA),
    body: JSON.stringify(peticio(IA, { max_tokens: 700, system: sistema(d), messages: [{ role: 'user', content: entrada }] })) });
  const r = await resp.json().catch(() => ({}));
  if (!resp.ok) return { estat: 'error', motiu: 'claude: ' + ((r.error && r.error.type) || resp.status) };
  const text = (r.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
  if (!text || r.stop_reason === 'refusal') return { estat: 'error', motiu: 'sin borrador', usd: cost(r) };
  return { estat: 'fet', text: text.slice(0, 3000), usd: cost(r), ia: { model: r.model || IA.model, usage: r.usage } };
}

/* El document de respostes: {id: {...}}, les MAX més noves. */
export function afegeix(doc, id, d, text, ara = new Date()) {
  const o = Object.assign({}, doc || {});
  o[id] = { id, nom: t(d.nom, 120), mail: t(d.mail, 100), tema: t(d.tema, 160), missatge: t(d.missatge, 2000), perfil: t(d.perfil, 20),
    marca: t(d.marca, 40), pagina: t(d.pagina, 120), esborrany: t(text, 3000), creat: ara.toISOString() };
  const ids = Object.keys(o).sort((a, b) => (o[b].creat || '').localeCompare(o[a].creat || ''));
  ids.slice(MAX).forEach(k => delete o[k]);
  return o;
}
