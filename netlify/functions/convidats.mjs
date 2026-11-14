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
   · `PUT    …/convidats` {kanban, mail?}  les tasques (SOS/lib/kanban.js): amb
                                        `mail`, les del projecte d'aquell client,
                                        fusionades amb les que té (13/11/2026);
                                        sense, les de l'Àlvaro mateix.
   El GET porta també les tasques de cada client i les seves (`meu`): és el
   seu backlog de tot, el que veu al panell.
   · `POST   …/convidats` {ordena}      «Carga lo que me ha mandado» (14/11/2026):
                                        la IA petita ordena el text enganxat
                                        (lib/acollida.mjs). No desa res.
   · `PUT    …/convidats` {resposta: {id, esborrany?, fet?}}  la resposta
                                        proposada a un «Habla con una persona»
                                        (lib/resposta.mjs): canviar-la, o
                                        «ya está enviada» (la targeta passa a Fet).
   · `PUT    …/convidats` {acollida, deures?, mail}  ho desa a la fitxa del
                                        client («Tu espacio» a /cliente/), i els
                                        deures entren a les seves tasques.

   El que es guarda és el que ell escriu (lib/convidats.mjs). El que es llegeix
   de cada espai és un resum: mai el text del dibuix. */
import { timingSafeEqual } from 'node:crypto';
import { magatzem } from '../lib/magatzem.mjs';
import { secret, empremta } from '../lib/signatura.mjs';
import { MAGATZEM, llista, desa, neteja, enllac, clauDe } from '../lib/convidats.mjs';
import { config } from './pule-mapa.mjs';
import { clau as clauFitxa } from './fitxa.mjs';
import K from '../../SOS/lib/kanban.js';
import * as AC from '../lib/acollida.mjs';
import { DOC as RESP } from '../lib/resposta.mjs';
import { registra } from '../lib/ia-router.mjs';

const MEU = 'kanban/alvaro';

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
    return Object.assign({}, x, { enllac: enllac(x, secret(env), base), gastat: usd(p && p.gastat), voltes: (p && p.voltes) || 0, ultim: (p && p.ultim) || '', espai: resum(f), kanban: f && f.kanban ? K.neteja(f.kanban) : null, acollida: (f && f.acollida) || null });
  }));
  return { ia: { actiu: !!(c.ok && regs.ia), motiu: c.ok ? (regs.ia ? '' : 'sense Netlify Blobs') : c.motiu, tope: c.ok ? c.tope : null, topeDia: c.ok ? c.topeDia : null },
    dia: { usd: usd(dia && dia.gastat) }, mes: { usd: usd(mes && mes.gastat), persones: mes && mes.persones ? Object.keys(mes.persones).length : 0 },
    convidats, variable: c.ok ? c.invitats : [], meu: K.neteja(regs.fitxes ? await regs.fitxes.get(MEU) : null),
    respostes: Object.values((regs.fitxes && await regs.fitxes.get(RESP)) || {}).sort((a, b) => (b.creat || '').localeCompare(a.creat || '')) };
}

export async function gestiona(metode, q, autoritzacio, cos, env, regs, ara = new Date()) {
  if (!esGestio(autoritzacio, env) || !regs.convidats) return null;
  if (!secret(env)) return { estat: 'error', motiu: 'falta IDENTITAT_SECRET o ANTHROPIC_API_KEY' };
  if (metode === 'GET') return Object.assign({ estat: 'fet' }, await estat(env, regs, ara));
  const tots = await llista(regs.convidats);
  if (metode === 'POST' && cos && cos.ordena !== undefined) {
    const r = await AC.ordena(cos.ordena, env, regs.fetch || globalThis.fetch, ara);
    if (r.usd) await registra(regs.comptes, { projecte: AC.IA.projecte, tasca: AC.IA.tasca, model: (r.ia || {}).model || AC.IA.model, usd: r.usd, usage: (r.ia || {}).usage }, ara).catch(() => {});
    return r.estat === 'fet' ? { estat: 'fet', acollida: r.acollida, deures: r.deures } : { estat: 'error', motiu: r.motiu };
  }
  if (metode === 'PUT' && cos && cos.resposta && typeof cos.resposta === 'object') {
    if (!regs.fitxes) return { estat: 'error', motiu: 'sense Netlify Blobs' };
    const doc = (await regs.fitxes.get(RESP)) || {}, id = net(cos.resposta.id), x = doc[id];
    if (!x) return { estat: 'error', motiu: 'Esa respuesta ya no está.' };
    if (cos.resposta.fet) {
      delete doc[id];
      const k = K.neteja(await regs.fitxes.get(MEU)), c = k.cards.find(y => y.id === id);
      if (c) { c.col = 'done'; c.prova = 'Respuesta enviada por correo (' + ara.toISOString().slice(0, 10) + ')'; c.act = ara.toISOString(); await regs.fitxes.set(MEU, k); }
    } else x.esborrany = net(cos.resposta.esborrany).slice(0, 3000);
    await regs.fitxes.set(RESP, doc);
    return { estat: 'fet' };
  }
  if (metode === 'PUT' && cos && cos.acollida !== undefined) {
    if (!regs.fitxes) return { estat: 'error', motiu: 'sense Netlify Blobs' };
    const x = tots[clauDe(cos.mail)];
    if (!x) return { estat: 'error', motiu: 'No es un invitado.' };
    const a = AC.neteja(cos.acollida, ara);
    if (!a) return { estat: 'error', motiu: 'No hay nada que guardar.' };
    const kf = clauFitxa('mail:' + empremta(x.mail)), f = (await regs.fitxes.get(kf)) || {};
    /* Lo que ya tenía se queda; su espacio se marca como nuevo para que su
       navegador lo recoja la próxima vez que entre. */
    f.acollida = a;
    if (Array.isArray(cos.deures) && cos.deures.length) f.kanban = K.fusiona(f.kanban, { cards: cos.deures });
    f.actualitzada = ara.toISOString();
    await regs.fitxes.set(kf, f);
    return { estat: 'fet', acollida: a, kanban: f.kanban ? K.neteja(f.kanban) : null };
  }
  if (metode === 'PUT' && cos && cos.kanban !== undefined) {
    if (!regs.fitxes) return { estat: 'error', motiu: 'sense Netlify Blobs' };
    if (!net(cos.mail)) { const k = K.fusiona(await regs.fitxes.get(MEU), cos.kanban); await regs.fitxes.set(MEU, k); return { estat: 'fet', kanban: k }; }
    const x = tots[clauDe(cos.mail)];
    if (!x) return { estat: 'error', motiu: 'No es un invitado.' };
    const kf = clauFitxa('mail:' + empremta(x.mail)), f = (await regs.fitxes.get(kf)) || null;
    if (!f) return { estat: 'error', motiu: 'Su espacio aún no está guardado con su cuenta.' };
    f.kanban = K.fusiona(f.kanban, cos.kanban); f.actualitzada = ara.toISOString();
    await regs.fitxes.set(kf, f);
    return { estat: 'fet', kanban: f.kanban };
  }
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
  const regs = { convidats: magatzem(event, MAGATZEM), ia: magatzem(event, 'ia-cliente'), fitxes: magatzem(event, 'fitxes'), comptes: magatzem(event, 'ia-router') };
  const r = await gestiona(event.httpMethod, q, (event.headers || {}).authorization, cos, env, regs).catch(() => ({ estat: 'error', motiu: 'blobs' }));
  console.log('[convidats]', JSON.stringify({ metode: event.httpMethod, estat: r ? r.estat : 'no' }));
  if (!r) return json(404, {});
  return json(r.estat === 'error' ? 400 : 200, r);
};
