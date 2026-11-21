/* Les referències dels clients · la funció de /referencias/ i del panell
   ─────────────────────────────────────────────────────────────────────────
   La lògica és a ../lib/referencies.mjs. Aquí, qui pot fer què:

   Amb `Authorization: Bearer IA_CIERRE_TOKEN` (el panell de l'Àlvaro, el
   mateix testimoni de convidats.mjs). Sense, 404:
   · `GET    …/referencies`               totes, amb els seus enllaços.
   · `PUT    …/referencies` {nom, org, relacio, llengua, id?, nou?}
                                           en demana una (o la canvia; `nou`:
                                           enllaços nous, els d'abans ja no obren).
   · `PUT    …/referencies` {dossierNou}   enllaç nou del dossier.
   · `DELETE …/referencies?id=…`           l'esborra, amb la resposta.

   Amb l'enllaç signat, sense compte:
   · `GET  ?r=…`   el que cal per escriure-la (i el que ja s'hi havia escrit).
   · `POST {r, resposta}` la desa · `POST {r, retira: true}` la retira.
   · `GET  ?ver=…` una referència, o el dossier, només si es pot compartir. */
import { magatzem } from '../lib/magatzem.mjs';
import { secret } from '../lib/signatura.mjs';
import * as R from '../lib/referencies.mjs';
import { esGestio } from './convidats.mjs';

const net = v => (v == null ? '' : String(v)).trim();
const json = (statusCode, o) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }, body: JSON.stringify(o) });

function ambEnllacos(p, clau, base) {
  return Object.assign({}, p, { escriu: R.enllac('escriu', p, clau, base), ver: R.esPotCompartir(p) ? R.enllac('ver', p, clau, base) : '' });
}

export async function gestiona(metode, q, autoritzacio, cos, env, reg, ara = new Date()) {
  if (!reg) return { estat: 'error', motiu: 'sense Netlify Blobs' };
  const clau = secret(env), base = net(env.URL);
  if (!clau) return { estat: 'error', motiu: 'falta IDENTITAT_SECRET o ANTHROPIC_API_KEY' };
  const d = await R.llista(reg);

  if (esGestio(autoritzacio, env)) {
    if (!d.vd) await R.desa(reg, d);
    if (metode === 'GET') {
      const refs = Object.values(d.refs).sort((a, b) => (b.creat || '').localeCompare(a.creat || '')).map(p => ambEnllacos(p, clau, base));
      return { estat: 'fet', refs, dossier: refs.some(p => p.ver) ? R.enllac('dossier', d.vd, clau, base) : '' };
    }
    if (metode === 'PUT' && cos && cos.dossierNou) { d.vd = ''; await R.desa(reg, d); return { estat: 'fet' }; }
    if (metode === 'PUT') {
      const abans = d.refs[net(cos && cos.id)], p = R.peticio(cos || {}, abans, ara);
      if (!p) return { estat: 'error', motiu: 'Falta el nombre de quien la escribe.' };
      if (!abans && Object.keys(d.refs).length >= R.MAX) return { estat: 'error', motiu: 'Ya hay ' + R.MAX + ' referencias.' };
      d.refs[p.id] = p; await R.desa(reg, d);
      return { estat: 'fet', ref: ambEnllacos(p, clau, base) };
    }
    if (metode === 'DELETE') {
      if (!d.refs[net(q.id)]) return { estat: 'cap' };
      delete d.refs[net(q.id)]; await R.desa(reg, d);
      return { estat: 'tret' };
    }
  }

  /* Sense testimoni de gestió: només amb un enllaç signat. */
  if (metode === 'GET' && q.ver) {
    const x = R.deTestimoni(q.ver, clau, d, ['ver', 'dossier']);
    if (!x) return { estat: 'cap' };
    const refs = x.dossier ? Object.values(d.refs).filter(R.esPotCompartir).sort((a, b) => (b.resposta.escrita || '').localeCompare(a.resposta.escrita || '')) : (R.esPotCompartir(x.p) ? [x.p] : []);
    return refs.length ? { estat: 'fet', refs: refs.map(R.vista) } : { estat: 'cap' };
  }
  const tok = metode === 'GET' ? q.r : cos && cos.r, x = tok ? R.deTestimoni(tok, clau, d, ['escriu']) : null;
  if (!x) return null;
  const p = x.p;
  if (metode === 'GET') return { estat: 'fet', nom: p.nom, org: p.org, relacio: p.relacio, llengua: p.llengua, resposta: p.resposta };
  if (metode === 'POST' && cos.retira === true) {
    p.resposta = null; p.actualitzat = ara.toISOString(); await R.desa(reg, d);
    return { estat: 'retirada' };
  }
  if (metode === 'POST') {
    const r = R.resposta(cos.resposta, ara);
    if (r.error) return { estat: 'error', motiu: r.error };
    p.resposta = r; p.actualitzat = ara.toISOString(); await R.desa(reg, d);
    return { estat: 'fet', resposta: r };
  }
  return { estat: 'error', motiu: 'metode' };
}

export const handler = async (event) => {
  const env = process.env, q = event.queryStringParameters || {};
  let cos = {}; try { cos = JSON.parse(event.body || '{}'); } catch (e) { /* cos buit */ }
  const r = await gestiona(event.httpMethod, q, (event.headers || {}).authorization, cos, env, magatzem(event, R.MAGATZEM)).catch(() => ({ estat: 'error', motiu: 'blobs' }));
  console.log('[referencies]', JSON.stringify({ metode: event.httpMethod, estat: r ? r.estat : 'no' }));
  if (!r || r.estat === 'cap') return json(404, {});
  return json(r.estat === 'error' ? 400 : 200, r);
};
