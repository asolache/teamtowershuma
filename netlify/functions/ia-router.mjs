/* El router de models, vist des de fora · /.netlify/functions/ia-router
   ─────────────────────────────────────────────────────────────────────────
   · `GET …/ia-router`  la taula pública: quin model fa cada tasca i el seu
     preu (ia.html, el compromís de transparència). Sense claus ni despesa.
   · `GET …/ia-router?mes=AAAA-MM` amb `Authorization: Bearer IA_CIERRE_TOKEN`:
     el que ha gastat cada projecte i cada model aquell mes. Sense el testimoni,
     404, com si no hi fos (el mateix que el tancament de pule-mapa.mjs). */
import { magatzem as blobs } from '../lib/magatzem.mjs';
import { taula, resum } from '../lib/ia-router.mjs';

const json = (statusCode, o) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(o) });

export async function despesa(mes, autoritzacio, env, reg) {
  const tok = (env.IA_CIERRE_TOKEN || '').trim();
  if (tok.length < 24 || !reg || autoritzacio !== 'Bearer ' + tok) return null;
  return (await resum(reg, mes)) || { estat: 'error', motiu: 'mes=AAAA-MM' };
}

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, {});
  const q = event.queryStringParameters || {};
  if (!q.mes) return json(200, taula());
  const r = await despesa(q.mes, (event.headers || {}).authorization, process.env, blobs(event, 'ia-router')).catch(() => null);
  return r ? json(r.estat === 'error' ? 400 : 200, r) : json(404, {});
};
