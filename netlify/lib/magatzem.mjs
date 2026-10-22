/* Netlify Blobs sense dependències · un magatzem per funció
   ─────────────────────────────────────────────────────────────────────────
   Netlify passa a cada funció `event.blobs` (base64 de {url, token}) i la
   capçalera `x-nf-site-id`. Amb això parlem amb l'API de Blobs a pèl, sense
   paquets (el repositori no en té). `nom` és el magatzem: `ia-cliente` per a
   la despesa de la IA (pule-mapa.mjs), `propostes` per als preus de cada
   client (proposta.mjs). Sense context de Blobs torna null. */
export function magatzem(event, nom) {
  let ctx = null;
  try { ctx = event.blobs ? JSON.parse(Buffer.from(event.blobs, 'base64').toString('utf8')) : null; } catch (e) { ctx = null; }
  const site = (event.headers || {})['x-nf-site-id'];
  if (!ctx || !ctx.url || !ctx.token || !site) return null;
  const url = k => ctx.url.replace(/\/+$/, '') + '/' + site + '/site:' + nom + '/' + k;
  const cap = { authorization: 'Bearer ' + ctx.token };
  return {
    get: async k => { const r = await fetch(url(k), { headers: cap }); if (r.status === 404) return null; if (!r.ok) throw new Error('blobs ' + r.status); return r.json(); },
    set: async (k, v) => { const r = await fetch(url(k), { method: 'PUT', headers: Object.assign({ 'content-type': 'application/json' }, cap), body: JSON.stringify(v) }); if (!r.ok) throw new Error('blobs ' + r.status); },
    del: async k => { const r = await fetch(url(k), { method: 'DELETE', headers: cap }); if (!r.ok && r.status !== 404) throw new Error('blobs ' + r.status); }
  };
}
