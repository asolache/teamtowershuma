/* Els convidats de l'Àlvar · el seu enllaç, el seu tope · /cliente/panel/
   ─────────────────────────────────────────────────────────────────────────
   L'Àlvar (05/11/2026): «haz que se puedan añadir desde mi panel». Abans la
   llista era una variable de Netlify (IA_INVITATS) i cada canvi esperava un
   desplegament. Ara és un document a Netlify Blobs (`convidats`) que ell
   omple des del seu panell, i cada convidat té el seu enllaç signat:

   · L'enllaç diu qui és (el correu no es verifica; l'enllaç, sí): qui entra
     per l'enllaç entra amb aquell compte, sense escriure res, i el tope alt
     només val per a les sessions que han entrat així (via `convit`).
   · Treure'l o «enllaç nou» canvia la `v`: l'enllaç d'abans ja no obre res.
   · Els paràmetres del seu espai (org, web, pie…) van a l'enllaç com fins ara
     (/cliente/ els llegeix igual), i `inv` és el testimoni.

   Un sol lloc per a tot això (DRY): identitat.mjs hi entra, pule-mapa.mjs hi
   llegeix el tope i convidats.mjs (la funció del panell) l'edita. */
import { signa, llegeix, empremta, nonce } from './signatura.mjs';

const net = v => (v == null ? '' : String(v)).trim();
const t = (v, n) => net(v).slice(0, n);
export const MAGATZEM = 'convidats';
export const DOC = 'llista';
export const TOPE_MAX = 10;
/* La fase de cada client al tauler del panell (11/11/2026, «tablero de gestión
   de clientes que vaya en el iPhone»). La posa ell; si no, surt de les dades. */
export const FASES = ['invitado', 'mapa', 'propuesta', 'marcha', 'entregado'];
export const fase = (v, abans) => FASES.includes(net(v)) ? net(v) : (FASES.includes(net(abans)) ? net(abans) : '');
const CORREU = /^[^\s@<>"]{1,64}@[^\s@<>"]{1,190}\.[^\s@<>"]{2,24}$/;
export const clauDe = mail => empremta(net(mail).toLowerCase());

/* El tope, entre 0,5 i 10 $, amb dos decimals. */
export const tope = v => { const x = parseFloat(String(v).replace(',', '.')); return x > 0 ? Math.round(Math.min(Math.max(x, 0.5), TOPE_MAX) * 100) / 100 : 2; };

/* Els paràmetres del seu espai: els mateixos que /cliente/ ja entén. */
export function params(p) {
  const x = p && typeof p === 'object' ? p : {};
  return { org: t(x.org, 160), web: t(x.web, 300), pie: t(x.pie, 300), pieNom: t(x.pieNom, 80), para: t(x.para, 60), procesos: x.procesos === 'programas' || x.procesos === true ? 'programas' : '' };
}

/* Un convidat, net. `v` és la versió del seu enllaç. */
export function neteja(c, abans, ara = new Date()) {
  const mail = net(c && c.mail).toLowerCase();
  if (!CORREU.test(mail)) return null;
  const a = abans || {};
  return { mail, nom: t(c.nom, 80) || a.nom || '', tope: tope(c.tope != null ? c.tope : a.tope), nota: t(c.nota != null ? c.nota : a.nota, 300),
    params: params(c.params || a.params), v: c.nou === true || !a.v ? nonce().slice(0, 10) : a.v,
    fase: fase(c.fase, a.fase), creat: a.creat || ara.toISOString(), actualitzat: ara.toISOString(), entrat: a.entrat || '' };
}

export async function llista(reg) { const d = reg ? await reg.get(DOC) : null; return d && d.convidats && typeof d.convidats === 'object' ? d.convidats : {}; }
export async function desa(reg, convidats) { await reg.set(DOC, { convidats }); }

/* El testimoni de l'enllaç: qui és i quina versió. Sense data de caducitat:
   es revoca canviant la `v` o traient-lo. */
export const testimoni = (c, clau) => signa({ k: clauDe(c.mail), v: c.v }, clau);
export function enllac(c, clau, base = '') {
  const p = c.params || {}, q = new URLSearchParams();
  if (p.org) q.set('org', p.org);
  if (p.web) q.set('web', p.web.replace(/^https?:\/\//, ''));
  if (p.pie) q.set('pie', p.pie.replace(/^https?:\/\//, ''));
  if (p.pieNom) q.set('pieNom', p.pieNom);
  if (p.para) q.set('para', p.para);
  if (p.procesos) q.set('procesos', p.procesos);
  q.set('inv', testimoni(c, clau));
  return base.replace(/\/+$/, '') + '/cliente/?' + q.toString();
}

/* De l'enllaç al convidat: la signatura, que hi sigui i que la versió quadri. */
export async function deTestimoni(inv, clau, reg) {
  const d = llegeix(inv, clau);
  if (!d || !d.k || !d.v || !reg) return null;
  const c = (await llista(reg))[d.k];
  return c && c.v === d.v ? c : null;
}

/* El tope d'una sessió: el del convidat si ha entrat pel seu enllaç, i
   aquell enllaç encara val (la sessió porta la versió, `inv`). */
export async function topeConvit(qui, reg) {
  if (!qui || qui.via !== 'convit' || !qui.mail || !reg) return null;
  const c = (await llista(reg))[clauDe(qui.mail)];
  return c && c.v === qui.inv ? tope(c.tope) : null;
}

