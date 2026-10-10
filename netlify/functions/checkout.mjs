/* El pagament de l'alta · Stripe Checkout, amb Apple Pay i Google Pay
   ─────────────────────────────────────────────────────────────────────────
   Pas 4 de l'ordre de `SOS/knowledge/dev/alta-en-un-toc.md`. L'editor del
   mapa hi crida abans del botó «Publica-la a nom teu»:

   · `POST /.netlify/functions/checkout` crea la sessió de pagament i torna la
     seva adreça. Checkout és la pàgina de pagament de Stripe: ja porta Apple
     Pay i Google Pay, i aquí no toquem cap dada de targeta.
   · `GET  /.netlify/functions/checkout?session_id=cs_…` diu si s'ha pagat.
     L'editor hi pregunta quan Stripe hi torna.
   · `GET  /.netlify/functions/checkout` sol diu si aquesta web cobra (200) o
     no (503), perquè l'editor posi «Paga i publica-la» o el botó de sempre.

   El que no es negocia:

   · **Cap clau al client ni al repositori.** Van a les variables d'entorn de
     Netlify. Sense elles, la funció respon 503 i l'editor publica sense pagar,
     com fins ara.
   · **Primer, mode de prova.** Una clau `sk_live_` no s'accepta si no hi ha
     `STRIPE_LIVE=1`, que és una decisió de l'Àlvar, no del codi.
   · **Cap import aquí.** El preu és el `STRIPE_PRICE_ID` que es crea a Stripe;
     els preus en validació no van en aquest repositori, que és públic.
   · **El mapa no passa per aquí.** Es queda al navegador de qui paga.

   Variables d'entorn (Netlify › Site configuration › Environment variables):
     STRIPE_SECRET_KEY  · sk_test_… (o sk_live_… amb STRIPE_LIVE=1)
     STRIPE_PRICE_ID    · price_… del producte de l'alta
     STRIPE_LIVE        · «1» només quan l'Àlvar ho decideixi */

const net = v => (v == null ? '' : String(v)).trim();
const API = 'https://api.stripe.com/v1/checkout/sessions';

export function config(env) {
  const clau = net(env.STRIPE_SECRET_KEY), preu = net(env.STRIPE_PRICE_ID);
  if (!clau || !preu) return { ok: false, motiu: 'falten ' + [!clau && 'STRIPE_SECRET_KEY', !preu && 'STRIPE_PRICE_ID'].filter(Boolean).join(', ') };
  if (!/^sk_(test|live)_[A-Za-z0-9]+$/.test(clau)) return { ok: false, motiu: 'STRIPE_SECRET_KEY no és una clau secreta de Stripe' };
  if (/^sk_live_/.test(clau) && net(env.STRIPE_LIVE) !== '1') return { ok: false, motiu: 'clau de producció sense STRIPE_LIVE=1' };
  if (!/^price_[A-Za-z0-9]+$/.test(preu)) return { ok: false, motiu: 'STRIPE_PRICE_ID no és un preu de Stripe' };
  return { ok: true, clau, preu, prova: /^sk_test_/.test(clau) };
}

/* L'adreça de la web on torna Stripe: la de Netlify, mai la que digui qui crida. */
export function tornades(env) {
  const base = net(env.URL).replace(/\/+$/, '');
  if (!/^https:\/\/[^\s"<>]+$/.test(base)) return null;
  return {
    success_url: base + '/SOS/vna-suport.html?alta={CHECKOUT_SESSION_ID}#editor',
    cancel_url: base + '/SOS/vna-suport.html?alta=cancel#editor'
  };
}

export async function creaSessio(env, fetchFn = globalThis.fetch) {
  const c = config(env), t = tornades(env);
  if (!c.ok) return { estat: 'sense-config', motiu: c.motiu };
  if (!t) return { estat: 'sense-config', motiu: 'falta URL' };
  const cos = new URLSearchParams({
    mode: 'payment', 'line_items[0][price]': c.preu, 'line_items[0][quantity]': '1',
    success_url: t.success_url, cancel_url: t.cancel_url, 'metadata[origen]': 'editor-mapa-valor'
  });
  const r = await fetchFn(API, { method: 'POST', headers: { Authorization: 'Bearer ' + c.clau, 'Content-Type': 'application/x-www-form-urlencoded' }, body: cos.toString() });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !/^https:\/\/checkout\.stripe\.com\//.test(j.url || '')) return { estat: 'error', motiu: 'stripe: ' + ((j.error && j.error.code) || r.status) };
  return { estat: 'creat', url: j.url, prova: c.prova };
}

export async function estatSessio(id, env, fetchFn = globalThis.fetch) {
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(net(id))) return { estat: 'error', motiu: 'session_id no vàlid' };
  const c = config(env);
  if (!c.ok) return { estat: 'sense-config', motiu: c.motiu };
  const r = await fetchFn(API + '/' + encodeURIComponent(id), { headers: { Authorization: 'Bearer ' + c.clau } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return { estat: 'error', motiu: 'stripe: ' + ((j.error && j.error.code) || r.status) };
  return { estat: 'llegit', pagat: j.payment_status === 'paid', prova: j.livemode === false };
}

const json = (statusCode, o) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(o) });

export function cobra(env) {
  const c = config(env), t = tornades(env);
  return c.ok && t ? { estat: 'cobra', prova: c.prova } : { estat: 'sense-config', motiu: c.ok ? 'falta URL' : c.motiu };
}

export const handler = async (event) => {
  const id = (event.queryStringParameters || {}).session_id;
  const r = event.httpMethod === 'POST' ? await creaSessio(process.env)
    : event.httpMethod === 'GET' ? (id ? await estatSessio(id, process.env) : cobra(process.env))
    : { estat: 'error', motiu: 'mètode' };
  console.log('[checkout]', JSON.stringify({ metode: event.httpMethod, estat: r.estat, motiu: r.motiu, pagat: r.pagat }));
  if (r.estat === 'sense-config') return json(503, { estat: r.estat });
  if (r.estat === 'error') return json(502, { estat: r.estat });
  return json(200, r.estat === 'creat' ? { url: r.url, prova: r.prova } : r.estat === 'cobra' ? { cobra: true, prova: r.prova } : { pagat: r.pagat, prova: r.prova });
};
