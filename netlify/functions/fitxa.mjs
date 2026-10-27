/* El teu dibuix, guardat amb el teu compte · /cliente/
   ─────────────────────────────────────────────────────────────────────────
   Backlog del 23/10/2026, punt 10: el mapa es desa al servidor sota la
   identitat (identitat.mjs, correu o GitHub) i el client hi torna des de
   qualsevol aparell, sense contrasenya. És la mateixa empremta que el registre
   de pule-mapa.mjs, en un magatzem propi de Netlify Blobs (`fitxes`). Al pas 2
   passa al portal i aquí s'esborra: mai dos llocs alhora.

   · `POST …/fitxa` {sessio}              la fitxa de qui ha entrat, o cap.
   · `POST …/fitxa` {sessio, fitxa}       la desa (l'última guanya).
   · `POST …/fitxa` {sessio, esborra:true} l'esborra (el seu dret, d'un clic).
   · `POST …/fitxa` {sessio, foto:true}   la «foto» de la seva web que ha deixat
     llegir (llegeix-web-background.mjs): si encara es llegeix, o el resultat.
   · Amb `Authorization: Bearer IA_CIERRE_TOKEN` i `?per=<correu|gh:id>`, com a
     proposta.mjs: `GET` la llegeix (amb `&foto=1`, la foto de la web), `PUT`
     la deixa preparada abans de la sessió i `DELETE` l'esborra, amb la foto.
     Sense el testimoni, 404.

   Només el que la pàgina fa servir, net i tallat. Al registre (console), només
   l'estat: mai el dibuix ni qui és. */
import { secret, llegeix, empremta } from '../lib/signatura.mjs';
import { magatzem } from '../lib/magatzem.mjs';
import { idDe } from './proposta.mjs';
import { clau as clauFoto } from './llegeix-web-background.mjs';

const net = v => (v == null ? '' : String(v)).trim();
const t = (v, n) => net(v).slice(0, n);
const json = (statusCode, o) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(o) });
const mena = v => (v === 'intangible' ? 'intangible' : 'tangible');
export const clau = id => 'fitxa/' + empremta(id);
const MAX = 60000;

/* La fitxa de /cliente/ (`tt.cliente.v1`): els camps que hi ha, cap altre. */
export function neteja(f, ara = new Date()) {
  if (!f || typeof f !== 'object') return null;
  const obj = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
  const r = {}, resp = obj(f.respuestas);
  Object.keys(resp).slice(0, 16).forEach(k => { if (/^[\w-]{1,24}$/.test(k)) r[k] = t(resp[k], 1500); });
  const fila = x => ({ quien: t(x && x.quien, 120), meDa: t(x && x.meDa, 240), meDaEs: mena(x && x.meDaEs), leDoy: t(x && x.leDoy, 240), leDoyEs: mena(x && x.leDoyEs) });
  const ex = obj(f.extra), marca = obj(f.marca), portes = obj(marca.portes), p = {};
  Object.keys(portes).slice(0, 12).forEach(k => { p[t(k, 120)] = { nom: t(portes[k] && portes[k].nom, 80), intro: t(portes[k] && portes[k].intro, 600) }; });
  const o = {
    nom: t(f.nom, 120), mail: t(f.mail, 160), org: t(f.org, 160), web: t(f.web, 300), inicial: t(f.inicial, 3000), casa: t(f.casa, 120),
    nivel: t(f.nivel, 80), modelo: t(f.modelo, 60), cuenta: f.cuenta === true, enviat: f.enviat === true,
    capes: (Array.isArray(f.capes) ? f.capes : []).filter(c => c === 'extranet' || c === 'intranet'),
    respuestas: r,
    alrededor: (Array.isArray(f.alrededor) ? f.alrededor : []).slice(0, 24).map(fila),
    extra: { roles: (Array.isArray(ex.roles) ? ex.roles : []).slice(0, 16).map(x => t(x, 120)).filter(Boolean),
      pairs: (Array.isArray(ex.pairs) ? ex.pairs : []).slice(0, 40).filter(Array.isArray).map(q => [t(q[0], 120), t(q[1], 120), q[2] ? mena(q[2]) : '', t(q[3], 240), q[4] ? mena(q[4]) : '', t(q[5], 240)]).filter(q => q[0] && q[1]) },
    marca: { lema: t(marca.lema, 200), presentacio: t(marca.presentacio, 800), portes: p },
    /* A qui va cada pàgina de la seva web d'ara, i el que encara no diu a cadascú (pule-mapa, pas 'pagines'). */
    portesWeb: portesWeb(f.portesWeb),
    /* El document de disseny: no el document (surt sempre del motor), sinó quan l'ha revisat i el que hi canviaria. */
    disseny: dissenyRevisat(f.disseny),
    actualitzada: ara.toISOString()
  };
  return JSON.stringify(o).length > MAX ? null : o;
}

function dissenyRevisat(x) {
  if (!x || typeof x !== 'object' || !/^\d{4}-\d\d-\d\dT/.test(String(x.data || ''))) return null;
  const n = v => Math.max(0, Math.min(999, Math.floor(Number(v) || 0)));
  return { data: t(x.data, 30), nota: t(x.nota, 1500), pagines: n(x.pagines), redireccions: n(x.redireccions),
    llengues: (Array.isArray(x.llengues) ? x.llengues : []).slice(0, 6).map(l => t(l, 5)).filter(l => /^[a-z]{2}$/.test(l)) };
}

function portesWeb(x) {
  if (!x || typeof x !== 'object') return null;
  const ps = (Array.isArray(x.pagines) ? x.pagines : []).slice(0, 30).map(q => ({ url: t(q && q.url, 300), quien: t(q && q.quien, 120), porque: t(q && q.porque, 300) })).filter(q => q.url);
  const fa = (Array.isArray(x.falta) ? x.falta : []).slice(0, 12).map(q => ({ quien: t(q && q.quien, 120), falta: t(q && q.falta, 400) })).filter(q => q.quien && q.falta);
  return ps.length || fa.length ? { pagines: ps, falta: fa, origen: t(x.origen, 300) } : null;
}

export async function client(cos, env, reg, ara = new Date()) {
  const qui = llegeix(cos && cos.sessio, secret(env), ara.getTime());
  if (!qui || !qui.id) return { estat: 'identifica' };
  if (!reg) return { estat: 'sense-config' };
  const k = clau(qui.id);
  if (cos.esborra === true) { await reg.del(k); await reg.del(clauFoto(qui.id)); return { estat: 'esborrada' }; }
  if (cos.foto === true) { const f = await reg.get(clauFoto(qui.id)); return f ? { estat: 'foto', lectura: f } : { estat: 'cap' }; }
  if (cos.fitxa !== undefined) {
    const f = neteja(cos.fitxa, ara);
    if (!f) return { estat: 'error', motiu: 'Tu ficha es demasiado grande para guardarla.' };
    await reg.set(k, f);
    return { estat: 'desada', actualitzada: f.actualitzada };
  }
  const f = await reg.get(k);
  return f ? { estat: 'fet', fitxa: f } : { estat: 'cap' };
}

/* L'Àlvar la deixa preparada abans de la sessió («lo dejamos preparado»). */
export async function gestiona(metode, per, autoritzacio, cos, env, reg, ara = new Date(), ambFoto = false) {
  const tok = net(env.IA_CIERRE_TOKEN);
  if (tok.length < 24 || !reg || autoritzacio !== 'Bearer ' + tok) return null;
  const id = idDe(per);
  if (!id) return { estat: 'error', motiu: 'per=<correu|gh:id>' };
  if (metode === 'DELETE') { await reg.del(clau(id)); await reg.del(clauFoto(id)); return { estat: 'esborrada' }; }
  if (metode === 'GET') { const f = await reg.get(ambFoto ? clauFoto(id) : clau(id)); return f ? (ambFoto ? { estat: 'foto', lectura: f } : { estat: 'fet', fitxa: f }) : { estat: 'cap' }; }
  const f = neteja(cos, ara);
  if (!f) return { estat: 'error', motiu: 'Fitxa buida o massa gran.' };
  await reg.set(clau(id), f);
  return { estat: 'desada', actualitzada: f.actualitzada };
}

export const handler = async (event) => {
  const env = process.env, q = event.queryStringParameters || {}, reg = magatzem(event, 'fitxes');
  let cos = {}; try { cos = JSON.parse(event.body || '{}'); } catch (e) { /* cos buit */ }
  let r;
  if (event.httpMethod !== 'POST') {
    r = await gestiona(event.httpMethod, q.per, (event.headers || {}).authorization, cos, env, reg, new Date(), q.foto === '1').catch(() => ({ estat: 'error', motiu: 'blobs' }));
    console.log('[fitxa]', JSON.stringify({ metode: event.httpMethod, estat: r ? r.estat : 'no' }));
    return r ? json(r.estat === 'error' ? 400 : 200, r) : json(404, {});
  }
  r = await client(cos, env, reg).catch(() => ({ estat: 'error', motiu: 'blobs' }));
  console.log('[fitxa]', JSON.stringify({ metode: 'POST', estat: r.estat }));
  return json({ identifica: 401, 'sense-config': 503, error: 400 }[r.estat] || 200, r);
};
