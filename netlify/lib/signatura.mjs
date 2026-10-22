/* Signar i llegir el que el navegador ens torna · sense servidor de sessions
   ─────────────────────────────────────────────────────────────────────────
   La identitat de qui fa servir la IA de /cliente/ (identitat.mjs) i la
   comprovació de l'OAuth de GitHub viatgen al navegador signades amb HMAC:
   el navegador les guarda i les torna, però no les pot canviar.

   El secret és `IDENTITAT_SECRET` (Netlify › Environment variables). Si no hi
   és, en surt un de la clau d'Anthropic, que tampoc no surt mai del servidor:
   així funciona el primer dia, i canviar-lo tanca totes les sessions. */
import { createHash, createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

const net = v => (v == null ? '' : String(v)).trim();
const b64 = b => Buffer.from(b).toString('base64url');

export function secret(env) {
  const s = net(env.IDENTITAT_SECRET);
  if (s.length >= 32) return s;
  const k = net(env.ANTHROPIC_API_KEY);
  return k ? createHash('sha256').update('teamtowers-identitat|' + k).digest('hex') : '';
}

export const empremta = t => createHash('sha256').update(net(t).toLowerCase()).digest('hex').slice(0, 40);
export const nonce = () => randomBytes(16).toString('base64url');

export function signa(dades, clau) {
  if (!clau) throw new Error('sense secret');
  const cos = b64(JSON.stringify(dades));
  return cos + '.' + createHmac('sha256', clau).update(cos).digest('base64url');
}

/* L'objecte signat, o null si no és nostre, s'ha tocat o ha caducat (`exp`, ms). */
export function llegeix(testimoni, clau, ara = Date.now()) {
  const [cos, sig] = net(testimoni).split('.');
  if (!clau || !cos || !sig) return null;
  const bo = Buffer.from(createHmac('sha256', clau).update(cos).digest('base64url')), rebut = Buffer.from(sig);
  if (bo.length !== rebut.length || !timingSafeEqual(bo, rebut)) return null;
  try {
    const d = JSON.parse(Buffer.from(cos, 'base64url').toString('utf8'));
    return d && typeof d === 'object' && (!d.exp || d.exp > ara) ? d : null;
  } catch (e) { return null; }
}
