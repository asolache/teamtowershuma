/* Qui ha entrat al portal · el pas 2 de totes les marques
   ─────────────────────────────────────────────────────────────────────────
   El portal de producció (acceso.teamtowershuma.com, el mateix lloc que
   eventspenedes.com/acceso, decisió de l'Álvaro del 22/10/2026) té els seus
   comptes a Supabase. Quan un client de TeamTowers hi entra, el seu espai
   carrega les peces d'aquí (SOS/lib/espai-client.js) i les funcions d'aquí li
   han de saber qui és sense un segon inici de sessió.

   Es pregunta a Supabase amb el testimoni del navegador (`/auth/v1/user`): si
   el testimoni és bo, Supabase torna la persona. No es desa res ni es confia en
   res que digui el navegador. En surten les mateixes identitats que fa servir
   identitat.mjs: `mail:<empremta>` si el correu està confirmat i `gh:<id>` si
   ha entrat amb GitHub.

   Variables: PORTAL_SUPABASE_URL (per defecte la del portal) i
   PORTAL_SUPABASE_KEY, la clau publicable, que ja és pública a la pàgina del
   portal. Sense clau, ningú no entra per aquí. */
import { empremta } from './signatura.mjs';

const net = v => (v == null ? '' : String(v)).trim();
export const URL_PORTAL = 'https://kigjhtnwfhbujsotrqiu.supabase.co';

/* Les webs des d'on s'obre el portal, i les seves previews. */
const ORIGENS = [
  'https://acceso.teamtowershuma.com', 'https://eventspenedes.com', 'https://www.eventspenedes.com',
  /^https:\/\/deploy-preview-\d+--eventspenedes\.netlify\.app$/
];
export const origenPortal = o => typeof o === 'string' && ORIGENS.some(x => (typeof x === 'string' ? x === o : x.test(o)));

export function capsPortal(origen, metodes = 'POST, OPTIONS') {
  return origenPortal(origen)
    ? { 'Access-Control-Allow-Origin': origen, 'Access-Control-Allow-Methods': metodes, 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' }
    : {};
}

/* La persona d'un usuari de Supabase, en identitats nostres. */
export function identitats(u) {
  if (!u || typeof u !== 'object') return [];
  const ids = [];
  const mail = net(u.email).toLowerCase();
  if (mail && u.email_confirmed_at) ids.push('mail:' + empremta(mail));
  for (const i of Array.isArray(u.identities) ? u.identities : []) {
    const id = net(i && (i.provider_id || (i.identity_data && i.identity_data.provider_id)));
    if (i && i.provider === 'github' && /^\d{1,12}$/.test(id)) ids.push('gh:' + id);
  }
  return [...new Set(ids)];
}

/* Les identitats de qui porta aquest testimoni del portal, o [] si no és bo. */
export async function quiDelPortal(testimoni, env, fetchFn = globalThis.fetch) {
  const t = net(testimoni), clau = net(env.PORTAL_SUPABASE_KEY);
  if (!clau || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(t)) return [];
  const base = net(env.PORTAL_SUPABASE_URL) || URL_PORTAL;
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(base)) return [];
  try {
    const r = await fetchFn(base + '/auth/v1/user', { headers: { apikey: clau, Authorization: 'Bearer ' + t } });
    return r && r.ok ? identitats(await r.json()) : [];
  } catch (e) { return []; }
}
