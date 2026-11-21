/* Les referències dels clients sobre l'Àlvaro · /referencias/
   ─────────────────────────────────────────────────────────────────────────
   L'Àlvaro (21/11/2026): «me gustaría tener una herramienta para que pueda
   tener referencias de clientes, para poderle pasar a Salvador Rusell
   referencias sobre mí». La primera, d'algú que fa tres anys que acompanya.

   El recorregut, en tres enllaços signats (signatura.mjs, el mateix secret de
   /cliente/):

   · `escriu` · l'Àlvaro demana una referència des del seu panell i n'obté
     l'enllaç; l'envia ell, a mà. Qui el rep hi respon cinc preguntes guiades
     i tria **qui la pot veure**. Amb el mateix enllaç la pot canviar o
     retirar quan vulgui (RGPD: retirar el consentiment és tan fàcil com donar-lo).
   · `ver` · l'enllaç per compartir una referència, només si qui l'ha escrita
     ho ha permès (`compartir` o `publica`). És una pàgina neta que s'imprimeix
     com a PDF.
   · `dossier` · totes les que es poden compartir, en una sola pàgina: el que
     es passa a un contacte com «referencias sobre Álvaro».

   Canviar la `v` (o la `vd` del dossier) tanca l'enllaç d'abans. `publica`
   **no publica res sol**: vol dir que l'Àlvaro la pot posar a la web, i
   aquell pas el fa ell (amb la seva fila a trajectoria.md, check-arrel.js).
   Les dades es desen a Netlify Blobs (magatzem `referencies`). */
import { signa, llegeix, nonce } from './signatura.mjs';

const net = v => (v == null ? '' : String(v)).trim();
const t = (v, n) => net(v).slice(0, n);
export const MAGATZEM = 'referencies';
export const DOC = 'llista';
export const MAX = 100;
export const NIVELLS = ['privada', 'compartir', 'publica'];
export const MOSTRA = ['nombre', 'iniciales', 'anonimo'];
/* Les preguntes guiades, en l'ordre de la pàgina: abans, què ha canviat,
   com treballa, a qui el recomanaries, i una frase. */
export const PREGUNTES = ['antes', 'cambio', 'como', 'recomienda', 'frase'];
const LLARG = { antes: 1500, cambio: 1500, como: 1500, recomienda: 800, frase: 280 };
/* La versió del text de consentiment que ha vist qui escriu. Si el text de la
   pàgina canvia, es puja. */
export const TEXT_CONSENTIMENT = '2026-11-21';

export async function llista(reg) { const d = reg ? await reg.get(DOC) : null; return d && typeof d === 'object' ? { refs: d.refs && typeof d.refs === 'object' ? d.refs : {}, vd: d.vd || '' } : { refs: {}, vd: '' }; }
export async function desa(reg, d) { d.vd = d.vd || nonce().slice(0, 10); await reg.set(DOC, { refs: d.refs, vd: d.vd }); }

/* La petició: el que l'Àlvaro escriu al panell. */
export function peticio(c, abans, ara = new Date()) {
  const a = abans || {}, nom = t(c && c.nom, 80) || a.nom || '';
  if (!nom) return null;
  return { id: a.id || nonce().slice(0, 12), v: c.nou === true || !a.v ? nonce().slice(0, 10) : a.v, nom,
    org: t(c.org != null ? c.org : a.org, 120), relacio: t(c.relacio != null ? c.relacio : a.relacio, 300),
    llengua: net(c.llengua || a.llengua) === 'ca' ? 'ca' : 'es', creat: a.creat || ara.toISOString(), actualitzat: ara.toISOString(),
    resposta: a.resposta || null };
}

/* La resposta: el que escriu qui dona la referència, net. Sense consentiment
   triat ni la casella de privacitat, no es desa. */
export function resposta(r, ara = new Date()) {
  const x = r && typeof r === 'object' ? r : {}, o = {};
  PREGUNTES.forEach(k => { o[k] = t(x[k], LLARG[k]); });
  if (!o.antes && !o.cambio && !o.como) return { error: 'Escribe al menos una de las tres primeras respuestas.' };
  const nivell = net(x.nivell), mostra = net(x.mostra);
  if (!NIVELLS.includes(nivell)) return { error: 'Elige quién puede verla.' };
  if (x.privacitat !== true) return { error: 'Falta aceptar la casilla de privacidad.' };
  o.firma = { nom: t(x.firmaNom, 80), carrec: t(x.firmaCarrec, 120), org: t(x.firmaOrg, 120) };
  if (!o.firma.nom) return { error: 'Falta tu nombre.' };
  o.mostra = MOSTRA.includes(mostra) ? mostra : 'nombre';
  o.consentiment = { nivell, data: ara.toISOString(), text: TEXT_CONSENTIMENT };
  o.escrita = ara.toISOString();
  return o;
}

/* Els tres enllaços. */
export const testimoni = (tipus, p, clau) => signa(tipus === 'dossier' ? { t: 'dossier', v: p } : { t: tipus, id: p.id, v: p.v }, clau);
export const enllac = (tipus, p, clau, base = '') => base.replace(/\/+$/, '') + '/referencias/?' + (tipus === 'escriu' ? 'r=' : 'ver=') + testimoni(tipus, p, clau) + (tipus === 'escriu' && p.llengua === 'ca' ? '&l=ca' : '');
export const esPotCompartir = p => !!(p && p.resposta && p.resposta.consentiment && ['compartir', 'publica'].includes(p.resposta.consentiment.nivell));

/* De l'enllaç a la petició (o al dossier): signatura, tipus i versió. */
export function deTestimoni(tok, clau, d, tipus) {
  const x = llegeix(tok, clau);
  if (!x || !x.t || !tipus.includes(x.t)) return null;
  if (x.t === 'dossier') return x.v && x.v === d.vd ? { dossier: true } : null;
  const p = d.refs[x.id];
  return p && p.v === x.v ? { t: x.t, p } : null;
}

/* La firma tal com qui l'ha escrita ha dit que surti. */
export function firma(r) {
  const f = (r && r.firma) || {}, rol = [f.carrec, f.org].filter(Boolean).join(', ');
  if (r.mostra === 'anonimo') return { qui: rol ? 'Una persona: ' + rol : 'Una persona que ha trabajado con Álvaro', rol: '' };
  if (r.mostra === 'iniciales') return { qui: f.nom.split(/\s+/).filter(Boolean).map(w => w[0].toUpperCase() + '.').join(' '), rol };
  return { qui: f.nom, rol };
}

/* El que veu qui rep l'enllaç per compartir: les respostes i la firma triada,
   res més (ni el que l'Àlvaro va escriure de la relació, ni dates internes). */
export function vista(p) {
  const r = p.resposta, o = { firma: firma(r), data: net(r.escrita).slice(0, 10) };
  PREGUNTES.forEach(k => { if (r[k]) o[k] = r[k]; });
  return o;
}
