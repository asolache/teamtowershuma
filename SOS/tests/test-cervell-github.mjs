/* L'entrada amb GitHub del cervell · provada sense xarxa
   ─────────────────────────────────────────────────────────────────────────
   `netlify/functions/cervell-github.mjs` amb un `fetch` fals. El que es prova:

   · Sense les variables de l'App, diu que no hi ha repos i no envia ningú a GitHub.
   · L'entrada no demana cap scope: els permisos són els de la GitHub App (lectura).
   · Sense el mateix `state` a la galeta, no es canvia el codi per cap testimoni.
   · El testimoni va a la pestanya, escapat, mai a la URL. */
import { handler, aGithub, deGithub, installa } from '../../netlify/functions/cervell-github.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const ENV = { CERVELL_GH_CLIENT_ID: 'Iv1.abc', CERVELL_GH_CLIENT_SECRET: 's', CERVELL_GH_APP: 'cervell-tt', URL: 'https://teamtowershuma.com' };

console.log('\n1 · Sense configurar');
for (const k of Object.keys(ENV)) delete process.env[k];
let r = await handler({ queryStringParameters: { entra: '' } });
ok(r.statusCode === 200 && JSON.parse(r.body).repos === false, 'sense variables: repos false, no redirigeix');

console.log('\n2 · Cap a GitHub');
const a = aGithub(ENV, 'n1');
const u = new URL(a.headers.Location);
ok(u.origin === 'https://github.com' && u.searchParams.get('client_id') === 'Iv1.abc', 'va a GitHub amb el client de l\'App');
ok(!u.searchParams.has('scope'), 'no demana cap scope');
ok(u.searchParams.get('redirect_uri') === 'https://teamtowershuma.com/.netlify/functions/cervell-github', 'torna a la funció');
ok(/cv_gh=n1;.*HttpOnly/.test(a.headers['Set-Cookie']), 'el state també va en una galeta HttpOnly');
ok(installa(ENV) === 'https://github.com/apps/cervell-tt/installations/new', 'l\'enllaç per triar repos');

console.log('\n3 · De tornada');
let crides = 0;
const f = async () => { crides++; return { json: async () => ({ access_token: 'ghu_x</script>' }) }; };
r = await deGithub({ code: 'c', state: 'n1' }, 'cv_gh=altre', ENV, f);
ok(crides === 0 && !/sessionStorage/.test(r.body), 'amb un altre state no es demana testimoni');
r = await deGithub({ code: 'c', state: 'n1' }, '', ENV, f);
ok(crides === 0 && !/sessionStorage/.test(r.body), 'sense galeta tampoc');
r = await deGithub({ code: 'c', state: 'n1' }, 'x=1; cv_gh=n1', ENV, f);
ok(crides === 1 && /sessionStorage\.setItem\("gh_token"/.test(r.body), 'amb el mateix state, el testimoni va a la pestanya');
ok(!/<\/script>"/.test(r.body) && /\\u003c\/script>/.test(r.body), 'el testimoni va escapat');
ok(/Max-Age=0/.test(r.headers['Set-Cookie']) && r.headers['Cache-Control'] === 'no-store', 'esborra la galeta i no es desa a la memòria cau');
const no = async () => ({ json: async () => ({ error: 'bad_verification_code' }) });
r = await deGithub({ code: 'c', state: 'n1' }, 'cv_gh=n1', ENV, no);
ok(!/sessionStorage/.test(r.body), 'si GitHub no dona accés, cap testimoni');

console.log(`\n${pass} ✓  ${fail} ✗`);
process.exit(fail ? 1 : 0);
