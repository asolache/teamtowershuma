/* L'avís de Stripe quan un pagament de l'alta es completa
   ─────────────────────────────────────────────────────────────────────────
   Stripe crida aquí (webhook) amb l'esdeveniment `checkout.session.completed`.
   **Abans de fer res, es comprova la signatura**: la capçalera
   `Stripe-Signature` porta el moment (`t`) i l'HMAC-SHA256 de `t.cos` amb el
   secret de l'avís (`v1`). Si no quadra, o té més de cinc minuts, es rebutja.

   Ara només ho anota. Quan hi hagi els tokens de servei del camí A, aquí és
   on es crearà el repositori i el lloc de Netlify del client.

   Al registre, mai el correu ni el nom de qui paga: només què ha passat.

   Variables d'entorn: STRIPE_WEBHOOK_SECRET (whsec_…, de Stripe › Webhooks). */
import { createHmac, timingSafeEqual } from 'node:crypto';

const net = v => (v == null ? '' : String(v)).trim();

export function verificaSignatura(cos, capcalera, secret, araS = Math.floor(Date.now() / 1000), toleranciaS = 300) {
  if (!net(secret)) return { ok: false, motiu: 'falta STRIPE_WEBHOOK_SECRET' };
  const parts = net(capcalera).split(',').map(x => x.split('=')).filter(x => x.length === 2);
  const t = Number((parts.find(x => x[0] === 't') || [])[1]), v1 = parts.filter(x => x[0] === 'v1').map(x => x[1]);
  if (!Number.isInteger(t) || !v1.length) return { ok: false, motiu: 'capçalera sense t o v1' };
  if (Math.abs(araS - t) > toleranciaS) return { ok: false, motiu: 'fora de temps' };
  const esperat = Buffer.from(createHmac('sha256', secret).update(t + '.' + cos, 'utf8').digest('hex'));
  const bo = v1.some(s => { const b = Buffer.from(s); return b.length === esperat.length && timingSafeEqual(b, esperat); });
  return bo ? { ok: true } : { ok: false, motiu: 'signatura que no quadra' };
}

export function processa(cos, capcalera, env, araS) {
  const v = verificaSignatura(cos, capcalera, env.STRIPE_WEBHOOK_SECRET, araS);
  if (!v.ok) return { estat: 'rebutjat', motiu: v.motiu };
  let ev;
  try { ev = JSON.parse(cos); } catch (e) { return { estat: 'rebutjat', motiu: 'cos que no és JSON' }; }
  if (ev.type !== 'checkout.session.completed') return { estat: 'ignorat', tipus: ev.type };
  const s = (ev.data && ev.data.object) || {};
  return { estat: 'pagat', sessio: s.id, pagat: s.payment_status === 'paid', prova: ev.livemode === false, import: s.amount_total, moneda: s.currency };
}

export const handler = async (event) => {
  const cos = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : (event.body || '');
  const cap = (event.headers || {})['stripe-signature'] || (event.headers || {})['Stripe-Signature'];
  const r = processa(cos, cap, process.env);
  console.log('[checkout-completat]', JSON.stringify(r));
  return { statusCode: r.estat === 'rebutjat' ? 400 : 200, body: JSON.stringify({ estat: r.estat }) };
};
