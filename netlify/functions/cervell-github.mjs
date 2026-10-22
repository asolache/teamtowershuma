/* El cervell · entrada amb GitHub, només de lectura · /SOS/cervell.html
   ─────────────────────────────────────────────────────────────────────────
   L'Àlvar (22/10/2026): entrar amb GitHub a la pàgina del cervell i triar el
   repo. No amb l'scope `repo` d'una OAuth App, que dona escriptura a tots els
   teus repos i quedaria a la pestanya, exposat a qualsevol XSS. Es fa amb una
   **GitHub App** que només té **Contents: read** (i Metadata: read):

   · Cadascú la instal·la als repos que tria, i només aquests es poden llegir.
   · El testimoni que en surt és d'usuari de l'App: té els permisos de l'App
     (lectura) creuats amb els teus, i caduca en 8 hores. Va a la pestanya
     (sessionStorage), mai a la URL ni al registre. Aquí no es guarda res.

   · `GET …/cervell-github`          { repos: bool, installa: url | null }
   · `GET …/cervell-github?entra`    cap a GitHub a demanar permís
   · `GET …/cervell-github?code&state`  torna de GitHub i dona el testimoni a la pàgina

   Netlify › Environment variables (de la GitHub App, mai al repositori):
     CERVELL_GH_CLIENT_ID, CERVELL_GH_CLIENT_SECRET, CERVELL_GH_APP (el nom curt
     de l'App, el de github.com/apps/<nom>). «Callback URL» de l'App:
     https://teamtowershuma.com/.netlify/functions/cervell-github */
import { randomUUID } from 'node:crypto';

const net = v => (v == null ? '' : String(v)).trim();
const PAGINA = '/SOS/cervell.html';
const GALETA = 'cv_gh';
const esborra = `${GALETA}=; Path=/.netlify/functions/cervell-github; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;

export const llest = env => !!(net(env.CERVELL_GH_CLIENT_ID) && net(env.CERVELL_GH_CLIENT_SECRET));
export const installa = env => (net(env.CERVELL_GH_APP) ? 'https://github.com/apps/' + encodeURIComponent(net(env.CERVELL_GH_APP)) + '/installations/new' : null);
const tornada = env => net(env.URL).replace(/\/+$/, '') + '/.netlify/functions/cervell-github';

const html = (cos, extra) => ({ statusCode: 200, headers: Object.assign({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'Set-Cookie': esborra }, extra),
  body: '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>El cervell</title>' + cos });
const error = txt => html('<p style="font-family:system-ui;padding:24px">' + txt + ' <a href="' + PAGINA + '">Torna al cervell</a></p>');

/* Pas 1: a GitHub, amb un `state` que també va en una galeta (que no ens colin el testimoni d'un altre). */
export function aGithub(env, n = randomUUID()) {
  const q = new URLSearchParams({ client_id: net(env.CERVELL_GH_CLIENT_ID), redirect_uri: tornada(env), state: n });
  return { statusCode: 302, headers: { Location: 'https://github.com/login/oauth/authorize?' + q, 'Cache-Control': 'no-store',
    'Set-Cookie': `${GALETA}=${n}; Path=/.netlify/functions/cervell-github; Max-Age=600; HttpOnly; Secure; SameSite=Lax` }, body: '' };
}

/* Pas 2: el codi per un testimoni d'usuari de l'App, i cap a la pestanya. */
export async function deGithub(q, galetes, env, fetchFn = globalThis.fetch) {
  const n = (new RegExp('(?:^|;\\s*)' + GALETA + '=([^;]+)').exec(galetes || '') || [])[1];
  if (!net(q.code) || !net(q.state) || !n || n !== net(q.state)) return error('No s\'ha pogut comprovar l\'entrada. Torna-ho a provar.');
  const r = await fetchFn('https://github.com/login/oauth/access_token', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: net(env.CERVELL_GH_CLIENT_ID), client_secret: net(env.CERVELL_GH_CLIENT_SECRET), code: net(q.code), redirect_uri: tornada(env) }) });
  const t = await r.json().catch(() => ({}));
  if (!t.access_token) return error('GitHub no ha donat accés.');
  return html('<script>try{sessionStorage.setItem("gh_token",' + JSON.stringify(t.access_token).replace(/</g, '\\u003c') + ')}catch(e){}location.replace("' + PAGINA + '")</script>');
}

export const handler = async (event) => {
  const env = process.env, q = event.queryStringParameters || {};
  if (!llest(env)) return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ repos: false, installa: null }) };
  if ('entra' in q) return aGithub(env);
  if (q.code || q.state) {
    const r = await deGithub(q, (event.headers || {}).cookie, env);
    console.log('[cervell-github]', JSON.stringify({ estat: /sessionStorage/.test(r.body) ? 'fet' : 'error' }));
    return r;
  }
  return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ repos: true, installa: installa(env) }) };
};
