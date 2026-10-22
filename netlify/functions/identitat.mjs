/* Qui ets, abans de fer servir la IA · /cliente/
   ─────────────────────────────────────────────────────────────────────────
   L'Àlvar (22/10/2026): la IA que posem nosaltres es fa servir identificat, i
   cadascú tria com s'identifica. El tope de despesa (pule-mapa.mjs) es compta
   per persona identificada, no per navegador.

   · `GET  …/identitat`               les maneres que hi ha ara: {vies: […]}.
   · `POST …/identitat` {via:'correu', nom, mail, privacitat:true}
                                        torna la sessió signada (30 dies).
   · `GET  …/identitat?via=github`    porta a GitHub (OAuth) i, en tornar
     (`?code&state`), redirigeix a /cliente/#sessio=… amb la sessió signada.

   El correu no es verifica encara (cal un enviador); GitHub sí que diu qui és.
   Google, quan hi hagi el client OAuth, va igual que GitHub.

   El que no es negocia:
   · **Cap clau al client ni al repositori.** Netlify › Environment variables:
       GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET · l'OAuth App de GitHub, amb
         «Authorization callback URL» = https://<web>/.netlify/functions/identitat
       IDENTITAT_SECRET · opcional (signatura.mjs)
   · **No guardem res aquí.** La sessió és del navegador; el que es compta
     (pule-mapa.mjs) va a Netlify Blobs amb l'empremta, no amb el correu. */
import { secret, signa, llegeix, empremta, nonce } from '../lib/signatura.mjs';

const net = v => (v == null ? '' : String(v)).trim();
const DIES30 = 30 * 24 * 3600 * 1000;
const json = (statusCode, o, extra) => ({ statusCode, headers: Object.assign({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, extra), body: JSON.stringify(o) });
const ves = (on, galeta) => ({ statusCode: 302, headers: Object.assign({ Location: on, 'Cache-Control': 'no-store' }, galeta ? { 'Set-Cookie': galeta } : {}), body: '' });
const CORREU = /^[^\s@<>"]{1,64}@[^\s@<>"]{1,190}\.[^\s@<>"]{2,24}$/;

export function vies(env) {
  if (!secret(env)) return [];
  return ['correu'].concat(net(env.GITHUB_CLIENT_ID) && net(env.GITHUB_CLIENT_SECRET) ? ['github'] : []);
}
const base = env => net(env.URL).replace(/\/+$/, '');
const tornada = env => base(env) + '/.netlify/functions/identitat';

export function sessio(d, env, ara = Date.now()) {
  return signa({ via: d.via, id: d.id, nom: net(d.nom).slice(0, 80), mail: net(d.mail).slice(0, 200), exp: ara + DIES30 }, secret(env));
}

/* Amb el correu: nom, correu i la casella de privacitat de /cliente/. */
export function perCorreu(b, env) {
  if (!vies(env).includes('correu')) return { estat: 'sense-config' };
  const nom = net(b && b.nom), mail = net(b && b.mail).toLowerCase();
  if (!nom || !CORREU.test(mail)) return { estat: 'error', motiu: 'Falta tu nombre o un correo válido.' };
  if (!(b && b.privacitat === true)) return { estat: 'error', motiu: 'Falta aceptar cómo tratamos tus datos.' };
  return { estat: 'fet', sessio: sessio({ via: 'correu', id: 'mail:' + empremta(mail), nom, mail }, env), via: 'correu', nom, mail };
}

/* GitHub, pas 1: cap a la pàgina d'autorització, amb un `state` signat i la
   mateixa xifra en una galeta (que no ens puguin colar la sessió d'un altre). */
export function aGithub(env, n = nonce(), ara = Date.now()) {
  if (!vies(env).includes('github') || !base(env)) return { estat: 'sense-config' };
  const state = signa({ n, exp: ara + 10 * 60 * 1000 }, secret(env));
  const q = new URLSearchParams({ client_id: net(env.GITHUB_CLIENT_ID), redirect_uri: tornada(env), scope: 'read:user user:email', state, allow_signup: 'true' });
  return { estat: 'ves', on: 'https://github.com/login/oauth/authorize?' + q, galeta: 'tt_oauth=' + n + '; Path=/.netlify/functions/identitat; Max-Age=600; HttpOnly; Secure; SameSite=Lax' };
}

/* GitHub, pas 2: el codi per un testimoni, i del testimoni qui és. */
export async function deGithub(q, galetes, env, fetchFn = globalThis.fetch) {
  if (!vies(env).includes('github')) return { estat: 'sense-config' };
  const st = llegeix(q.state, secret(env)), n = (/(?:^|;\s*)tt_oauth=([^;]+)/.exec(galetes || '') || [])[1];
  if (!st || !n || st.n !== n) return { estat: 'error', motiu: 'state' };
  const r = await fetchFn('https://github.com/login/oauth/access_token', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: net(env.GITHUB_CLIENT_ID), client_secret: net(env.GITHUB_CLIENT_SECRET), code: net(q.code), redirect_uri: tornada(env) }) });
  const t = await r.json().catch(() => ({}));
  if (!t.access_token) return { estat: 'error', motiu: 'github: ' + (t.error || r.status) };
  const cap = { Authorization: 'Bearer ' + t.access_token, Accept: 'application/vnd.github+json', 'User-Agent': 'teamtowershuma-cliente' };
  const u = await (await fetchFn('https://api.github.com/user', { headers: cap })).json().catch(() => ({}));
  if (!u.id) return { estat: 'error', motiu: 'github: usuari' };
  const ms = await (await fetchFn('https://api.github.com/user/emails', { headers: cap })).json().catch(() => []);
  const m = (Array.isArray(ms) ? ms : []).find(x => x.primary && x.verified) || {};
  const nom = net(u.name) || net(u.login);
  return { estat: 'fet', sessio: sessio({ via: 'github', id: 'gh:' + u.id, nom, mail: net(m.email || u.email) }, env) };
}

export const handler = async (event) => {
  const env = process.env, q = event.queryStringParameters || {};
  let r;
  if (event.httpMethod === 'POST') {
    let b = {}; try { b = JSON.parse(event.body || '{}'); } catch (e) { /* cos buit */ }
    r = b.via === 'correu' ? perCorreu(b, env) : { estat: 'error', motiu: 'via' };
  } else if (q.via === 'github') r = aGithub(env);
  else if (q.code || q.state) r = await deGithub(q, (event.headers || {}).cookie, env);
  else r = { estat: 'vies', vies: vies(env) };
  console.log('[identitat]', JSON.stringify({ metode: event.httpMethod, estat: r.estat, via: r.via || q.via || (q.code ? 'github' : ''), motiu: r.motiu }));
  if (r.estat === 'ves') return ves(r.on, r.galeta);
  const esborra = 'tt_oauth=; Path=/.netlify/functions/identitat; Max-Age=0; HttpOnly; Secure; SameSite=Lax';
  if (q.code || q.state) return ves('/cliente/#' + (r.estat === 'fet' ? 'sessio=' + r.sessio : 'sessio-error'), esborra);
  if (r.estat === 'sense-config') return json(503, { estat: r.estat, vies: vies(env) });
  if (r.estat === 'error') return json(400, { estat: r.estat, motiu: r.motiu });
  return json(200, r);
};
