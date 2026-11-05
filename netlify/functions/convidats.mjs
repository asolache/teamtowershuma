/* El panell de l'Àlvar · els seus convidats i com va la IA · /cliente/panel/
   ─────────────────────────────────────────────────────────────────────────
   L'Àlvar (05/11/2026): «haz que se puedan añadir desde mi panel y revisa y
   mejora el panel». Tot amb `Authorization: Bearer IA_CIERRE_TOKEN` (el
   testimoni de gestió, el mateix de proposta.mjs i fitxa.mjs). Sense, 404.

   · `GET    …/convidats`             l'estat de la IA, la despesa del dia i del
     mes, i cada convidat amb el seu enllaç, el que ha gastat i com va el seu espai.
   · `PUT    …/convidats` {mail, nom, tope, nota, params, nou}
                                        l'afegeix o el canvia (`nou`: enllaç nou,
                                        el d'abans deixa d'obrir).
   · `DELETE …/convidats?mail=…`      el treu; el seu enllaç ja no obre res.

   El que es guarda és el que ell escriu (lib/convidats.mjs). El que es llegeix
   de cada espai és un resum: mai el text del dibuix. */
import { timingSafeEqual } from 'node:crypto';
import { magatzem } from '../lib/magatzem.mjs';
import { secret, empremta } from '../lib/signatura.mjs';
import { MAGATZEM, llista, desa, neteja, enllac, clauDe } from '../lib/convidats.mjs';
import { config } from './pule-mapa.mjs';
import { clau as clauFitxa } from './fitxa.mjs';

const net = v => (v == null ? '' : String(v)).trim();
const json = (statusCode, o) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(o) });

export function esGestio(autoritzacio, env) {
  const tok = net(env.IA_CIERRE_TOKEN), a = Buffer.from(net(autoritzacio)), b = Buffer.from('Bearer ' + tok);
  return tok.length >= 24 && a.length === b.length && timingSafeEqual(a, b);
}

/* Com va el seu espai, en xifres: sense el que hi ha escrit. */
export function resum(f) {
  if (!f || typeof f !== 'object') return null;
  return { org: net(f.org).slice(0, 160), actualitzada: net(f.actualitzada).slice(0, 30),
    persones: (Array.isArray(f.alrededor) ? f.alrededor : []).filter(x => x && net(x.quien)).length,
    programes: (Array.isArray(f.programes) ? f.programes : []).length,
    formularis: Array.isArray(f.formularis) ? f.formularis.length : null,
    disseny: !!(f.disseny && f.disseny.data), benvinguda: !!(f.invitacio && f.invitacio.tancada) };
}

const usd = v => +(Number(v) || 0).toFixed(4);

export async function estat(env, regs, ara = new Date()) {
  const c = config(env), dia = regs.ia ? await regs.ia.get('dia/' + ara.toISOString().slice(0, 10)) : null, mes = regs.ia ? await regs.ia.get('mes/' + ara.toISOString().slice(0, 7)) : null;
  const tots = await llista(regs.convidats), base = net(env.URL);
  const convidats = await Promise.all(Object.values(tots).sort((a, b) => (b.creat || '').localeCompare(a.creat || '')).map(async x => {
    const id = 'mail:' + empremta(x.mail), p = regs.ia ? await regs.ia.get('persona/' + empremta(id)) : null, f = regs.fitxes ? await regs.fitxes.get(clauFitxa(id)) : null;
    return Object.assign({}, x, { enllac: enllac(x, secret(env), base), gastat: usd(p && p.gastat), voltes: (p && p.voltes) || 0, ultim: (p && p.ultim) || '', espai: resum(f) });
  }));
  return { ia: { actiu: !!(c.ok && regs.ia), motiu: c.ok ? (regs.ia ? '' : 'sense Netlify Blobs') : c.motiu, tope: c.ok ? c.tope : null, topeDia: c.ok ? c.topeDia : null },
    dia: { usd: usd(dia && dia.gastat) }, mes: { usd: usd(mes && mes.gastat), persones: mes && mes.persones ? Object.keys(mes.persones).length : 0 },
    convidats, variable: c.ok ? c.invitats : [] };
}

export async function gestiona(metode, q, autoritzacio, cos, env, regs, ara = new Date()) {
  if (!esGestio(autoritzacio, env) || !regs.convidats) return null;
  if (!secret(env)) return { estat: 'error', motiu: 'falta IDENTITAT_SECRET o ANTHROPIC_API_KEY' };
  if (metode === 'GET') return Object.assign({ estat: 'fet' }, await estat(env, regs, ara));
  const tots = await llista(regs.convidats);
  if (metode === 'PUT') {
    const k = clauDe(cos && cos.mail), c = neteja(cos, tots[k], ara);
    if (!c) return { estat: 'error', motiu: 'Falta un correo válido.' };
    if (!tots[k] && Object.keys(tots).length >= 200) return { estat: 'error', motiu: 'Ya hay 200 invitados.' };
    tots[k] = c; await desa(regs.convidats, tots);
    return { estat: 'fet', convidat: Object.assign({}, c, { enllac: enllac(c, secret(env), net(env.URL)) }) };
  }
  if (metode === 'DELETE') {
    const k = clauDe(q.mail);
    if (!tots[k]) return { estat: 'cap' };
    delete tots[k]; await desa(regs.convidats, tots);
    return { estat: 'tret' };
  }
  return { estat: 'error', motiu: 'metode' };
}

export const handler = async (event) => {
  const env = process.env, q = event.queryStringParameters || {};
  let cos = {}; try { cos = JSON.parse(event.body || '{}'); } catch (e) { /* cos buit */ }
  const regs = { convidats: magatzem(event, MAGATZEM), ia: magatzem(event, 'ia-cliente'), fitxes: magatzem(event, 'fitxes') };
  const r = await gestiona(event.httpMethod, q, (event.headers || {}).authorization, cos, env, regs).catch(() => ({ estat: 'error', motiu: 'blobs' }));
  console.log('[convidats]', JSON.stringify({ metode: event.httpMethod, estat: r ? r.estat : 'no' }));
  if (!r) return json(404, {});
  return json(r.estat === 'error' ? 400 : 200, r);
};
