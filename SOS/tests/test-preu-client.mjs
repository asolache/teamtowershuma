/* El preu de cada client, només per a ell · provat sense xarxa
   ─────────────────────────────────────────────────────────────────────────
   `netlify/functions/proposta.mjs` amb un registre en memòria. El que es prova:

   · Sense sessió signada no es veu cap proposta; amb sessió, només la seva.
   · Carregar o esborrar demana el testimoni de gestió; sense, 404.
   · Del que es carrega només passa el que es pot ensenyar, i la clau és una
     empremta: ni el correu ni el preu surten a la clau.
   · Des del portal (netlify/lib/portal.mjs), amb el testimoni de Supabase: només
     el correu confirmat o el GitHub de qui és, i només des de les webs del
     portal. L'espai del client (SOS/lib/espai-client.js) diu l'esglaó del pla. */
import { veure, gestiona, neteja, idDe, clau, handler } from '../../netlify/functions/proposta.mjs';
import { sessio } from '../../netlify/functions/identitat.mjs';
import { empremta } from '../../netlify/lib/signatura.mjs';
import { identitats, quiDelPortal, origenPortal, capsPortal } from '../../netlify/lib/portal.mjs';
import { createRequire } from 'node:module';
const req = createRequire(import.meta.url);

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const ENV = { ANTHROPIC_API_KEY: 'sk-ant-api03-' + 'x'.repeat(40), IA_CIERRE_TOKEN: 't'.repeat(32) };
const memoria = () => { const m = new Map(); return { m, get: async k => (m.has(k) ? JSON.parse(m.get(k)) : null), set: async (k, v) => { m.set(k, JSON.stringify(v)); }, del: async k => { m.delete(k); } }; };
const BE = 'Bearer ' + ENV.IA_CIERRE_TOKEN;
const P = { titol: 'Mapa de valor + web', linies: [{ que: 'Sesión de mapa', nivell: 3, hores: 1, import: 80 }, { que: 'Textos', nivell: 2, hores: 1.5, import: 82.5 }, { que: '', import: 9 }], nota: 'Hola', valida: '2026-11-30' };

console.log('\n1 · Qui és');
ok(idDe('Maria@Exemple.cat') === 'mail:' + empremta('maria@exemple.cat'), 'el correu, com a identitat.mjs');
ok(idDe('gh:123') === 'gh:123' && idDe('gh:abc') === null && idDe('ningú') === null, 'GitHub per id; la resta no');
ok(!/maria|@/.test(clau(idDe('maria@exemple.cat'))), 'la clau no porta el correu');

console.log('\n2 · Carregar');
{
  const reg = memoria();
  ok(await gestiona('PUT', 'maria@exemple.cat', 'Bearer dolent', P, ENV, reg) === null, 'amb un testimoni dolent, res');
  ok(await gestiona('PUT', 'maria@exemple.cat', BE, P, { IA_CIERRE_TOKEN: 'curt' }, reg) === null, 'amb un testimoni curt, res');
  const r = await gestiona('PUT', 'maria@exemple.cat', BE, P, ENV, reg, new Date('2026-10-22T10:00:00Z'));
  ok(r.estat === 'desada' && r.proposta.linies.length === 2, 'desada, sense la línia buida');
  ok(r.proposta.total === 162.5, 'sense total, la suma de les línies');
  ok(r.proposta.actualitzada === '2026-10-22' && r.proposta.valida === '2026-11-30', 'les dates');
  ok((await gestiona('PUT', 'x', BE, P, ENV, reg)).estat === 'error', 'sense qui, error');
  ok((await gestiona('PUT', 'gh:9', BE, { linies: [] }, ENV, reg)).estat === 'error', 'sense línies ni total, error');
  ok(neteja({ linies: [{ que: 'a', nivell: 7, hores: -1, import: 'x' }], total: 5 }).linies[0].nivell === null, 'el que no és bo es buida');

  console.log('\n3 · Veure');
  ok((await veure({}, ENV, reg)).estat === 'identifica', 'sense sessió, identifica\'t');
  ok((await veure({ sessio: 'a.b' }, ENV, reg)).estat === 'identifica', 'amb una sessió tocada, tampoc');
  const sm = sessio({ via: 'correu', id: idDe('maria@exemple.cat'), nom: 'María', mail: 'maria@exemple.cat' }, ENV);
  const v = await veure({ sessio: sm }, ENV, reg);
  ok(v.estat === 'fet' && v.proposta.titol === 'Mapa de valor + web', 'la María veu la seva');
  const so = sessio({ via: 'github', id: 'gh:9', nom: 'Altra' }, ENV);
  ok((await veure({ sessio: so }, ENV, reg)).estat === 'cap', 'una altra persona no veu la de la María');
  ok((await veure({ sessio: sm }, ENV, null)).estat === 'sense-config', 'sense Blobs, ho diu');
  ok((await gestiona('DELETE', 'maria@exemple.cat', BE, {}, ENV, reg)).estat === 'esborrada', 'esborrar');
  ok((await veure({ sessio: sm }, ENV, reg)).estat === 'cap', 'i ja no hi és');
}

console.log('\n4 · La funció');
{
  process.env.IA_CIERRE_TOKEN = ENV.IA_CIERRE_TOKEN;
  const r = await handler({ httpMethod: 'PUT', queryStringParameters: { per: 'gh:1' }, headers: {}, body: '{}' });
  ok(r.statusCode === 404, 'sense testimoni, 404');
  ok((await handler({ httpMethod: 'GET', headers: {} })).statusCode === 405, 'GET no');
  ok((await handler({ httpMethod: 'POST', headers: {}, body: '{}' })).statusCode === 401, 'sense sessió, 401');
}

console.log('\n5 · Des del portal');
{
  const PENV = { ...ENV, PORTAL_SUPABASE_KEY: 'sb_publishable_x' };
  const TOK = 'aaa.bbb.ccc';
  const USUARI = { email: 'Maria@Exemple.cat', email_confirmed_at: '2026-10-23T10:00:00Z', identities: [{ provider: 'github', provider_id: '77' }, { provider: 'email', provider_id: 'x' }] };
  let vist = null;
  const fals = (u, ok = true) => async (url, o) => { vist = { url, o }; return { ok, json: async () => u }; };
  ok(JSON.stringify(identitats(USUARI)) === JSON.stringify(['mail:' + empremta('maria@exemple.cat'), 'gh:77']), 'el correu confirmat i el GitHub, com a identitat.mjs');
  ok(identitats({ ...USUARI, email_confirmed_at: null, identities: [] }).length === 0, 'un correu sense confirmar no obre res');
  ok((await quiDelPortal(TOK, ENV, fals(USUARI))).length === 0, 'sense la clau del portal, ningú');
  ok((await quiDelPortal('no-es-un-jwt', PENV, fals(USUARI))).length === 0, 'un testimoni que no ho sembla, ni es pregunta');
  ok((await quiDelPortal(TOK, { ...PENV, PORTAL_SUPABASE_URL: 'https://dolent.example' }, fals(USUARI))).length === 0, 'només es pregunta a Supabase');
  ok((await quiDelPortal(TOK, PENV, fals(USUARI, false))).length === 0, 'si Supabase diu que no, ningú');
  const ids = await quiDelPortal(TOK, PENV, fals(USUARI));
  ok(ids.length === 2 && /\/auth\/v1\/user$/.test(vist.url) && vist.o.headers.Authorization === 'Bearer ' + TOK, 'es pregunta a Supabase amb el testimoni');
  const reg = memoria();
  await gestiona('PUT', 'gh:77', BE, P, ENV, reg);
  ok((await veure({ portal: TOK }, PENV, reg, Date.now(), fals(USUARI))).estat === 'fet', 'la proposta, amb la sessió del portal');
  ok((await veure({ portal: TOK }, PENV, reg, Date.now(), fals({ email: 'altra@exemple.cat', email_confirmed_at: 'x' }))).estat === 'cap', 'una altra persona del portal no la veu');
  ok((await veure({ portal: TOK }, PENV, reg, Date.now(), fals(null, false))).estat === 'identifica', 'amb un testimoni dolent, identifica\'t');
  ok(origenPortal('https://acceso.teamtowershuma.com') && origenPortal('https://deploy-preview-85--eventspenedes.netlify.app') && !origenPortal('https://dolent.example'), 'les webs del portal i prou');
  ok(capsPortal('https://acceso.teamtowershuma.com')['Access-Control-Allow-Origin'] === 'https://acceso.teamtowershuma.com' && !capsPortal('https://dolent.example')['Access-Control-Allow-Origin'], 'el CORS, només per a elles');
  const r = await handler({ httpMethod: 'OPTIONS', headers: { origin: 'https://acceso.teamtowershuma.com' } });
  ok(r.statusCode === 204 && r.headers['Access-Control-Allow-Origin'] === 'https://acceso.teamtowershuma.com', 'la pregunta prèvia del navegador');
}

console.log('\n6 · L\'espai del client');
{
  const E = req('../lib/espai-client.js'), H = req('../knowledge/cervell/heretat.json');
  const passos = H.camiClient.passos;
  ok(E.pas(passos, 'pagina').ara.id === 'pagina' && E.pas(passos, 'pagina').despres.id === 'web', 'el pla «pagina» és el pas 2 i el següent, la web pròpia');
  ok(E.pas(passos, null).ara.id === 'valor' && E.pas(passos, 'inventat').ara.id === 'valor', 'sense pla, el primer pas');
  ok(E.veu(passos[0], 'es').nom === passos[0].tu.es.nom, 'en la veu del client');
  ok(!/€|\d+ ?eur/i.test(JSON.stringify(H.camiClient)), 'el camí no porta cap import');
}

console.log('\n' + pass + ' bé, ' + fail + ' malament');
if (fail) process.exit(1);
