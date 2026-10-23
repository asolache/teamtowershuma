/* La IA de /cliente/ i qui la fa servir · provat sense xarxa
   ─────────────────────────────────────────────────────────────────────────
   `netlify/functions/pule-mapa.mjs` i `identitat.mjs` es proven en Node pur,
   amb un `fetch` fals i un registre en memòria: corre a la CI i no gasta res.
   El que es prova:

   · Sense clau, sense identitat o amb una sessió tocada, no es crida Claude.
   · El correu demana nom, correu bo i la casella; GitHub, el `state` i la galeta.
   · El tope no se supera mai: la reserva del pitjor cas ho para abans.
   · El cost real surt de `usage` (i de cada intent si hi ha hagut fallback).
   · Del que respon el model només passa el que es pot aplicar.
   · El text del client va dins de <dades> i no surt al registre. */
import { pule, config, cost, reserva, neteja, text, valida, ESQUEMA, tancament } from '../../netlify/functions/pule-mapa.mjs';
import { perCorreu, aGithub, deGithub, vies, sessio } from '../../netlify/functions/identitat.mjs';
import { signa, llegeix, secret } from '../../netlify/lib/signatura.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const ENV = { ANTHROPIC_API_KEY: 'sk-ant-api03-' + 'x'.repeat(40), URL: 'https://exemple.netlify.app' };
const memoria = () => { const m = new Map(); return { m, get: async k => (m.has(k) ? JSON.parse(m.get(k)) : null), set: async (k, v) => { m.set(k, JSON.stringify(v)); } }; };
const fals = (respostes) => {
  const crides = [];
  const f = async (url, opts) => {
    crides.push({ url, opts: opts || {} });
    const r = respostes[Math.min(crides.length - 1, respostes.length - 1)];
    return { ok: r.status < 400, status: r.status, json: async () => r.json };
  };
  f.crides = crides;
  return f;
};
const DADES = { casa: 'Formadores', inicial: 'Formo a profesores de español', alrededor: [
  { quien: 'Profesores nuevos', meDa: 'matrículas', meDaEs: 'tangible', leDoy: 'un curso', leDoyEs: 'tangible' },
  { quien: 'Escuelas', meDa: 'ofertas de trabajo', meDaEs: 'intangible', leDoy: 'profesores preparados', leDoyEs: 'intangible' }] };
const RESP_MAPA = { resumen: 'Tu red se apoya en la confianza.', pregunta: '¿Quién te recomienda?', sugerencias: [
  { tipo: 'nuevo', fila: -1, quien: 'Antiguos alumnos', meDa: 'recomendaciones', meDaEs: 'intangible', leDoy: 'comunidad', leDoyEs: 'intangible', porque: 'Suelen traer a otros.' },
  { tipo: 'cambia', fila: 0, quien: 'Profesores nuevos', meDa: 'matrículas del curso', meDaEs: 'tangible', leDoy: 'el curso FELE', leDoyEs: 'tangible', porque: 'Más concreto.' },
  { tipo: 'cambia', fila: 9, quien: 'X', meDa: '', meDaEs: 'tangible', leDoy: '', leDoyEs: 'tangible', porque: 'fila que no existe' },
  { tipo: 'esborra', fila: 0, quien: '', meDa: '', meDaEs: 'tangible', leDoy: '', leDoyEs: 'tangible', porque: 'tipus estrany' }] };
const claude = (j, usage, extra) => ({ status: 200, json: Object.assign({ model: 'claude-opus-5-5', stop_reason: 'end_turn',
  content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: JSON.stringify(j) }], usage: usage || { input_tokens: 2000, output_tokens: 1000 } }, extra) });
const ses = (env = ENV, id = 'mail:abc') => sessio({ via: 'correu', id, nom: 'María', mail: 'm@x.es' }, env);

console.log('\n1 · Sense clau o sense identitat no es crida Claude');
{
  ok(!config({}).ok && !config({ ANTHROPIC_API_KEY: 'sk_test_x' }).ok, 'sense una clau d\'Anthropic, apagada');
  ok(!config(Object.assign({ IA_CLIENTE: '0' }, ENV)).ok, 'IA_CLIENTE=0 l\'apaga');
  ok(config(Object.assign({ IA_TOPE_USD: '9' }, ENV)).tope === 0.5, 'el tope per persona no passa de 0,50');
  const f = fals([claude(RESP_MAPA)]), reg = memoria();
  ok((await pule({ pas: 'mapa', dades: DADES }, ENV, reg, f)).estat === 'identifica', 'sense sessió, demana identificar-se');
  const tocada = ses().replace(/\.(.)/, (m, c) => '.' + (c === 'A' ? 'B' : 'A'));
  ok((await pule({ sessio: tocada, pas: 'mapa', dades: DADES }, ENV, reg, f)).estat === 'identifica', 'una sessió tocada no val');
  const vella = signa({ via: 'correu', id: 'mail:abc', exp: Date.now() - 1000 }, secret(ENV));
  ok((await pule({ sessio: vella, pas: 'mapa', dades: DADES }, ENV, reg, f)).estat === 'identifica', 'una sessió caducada no val');
  ok((await pule({ sessio: ses(), pas: 'mapa', dades: DADES }, ENV, null, f)).estat === 'sense-config', 'sense registre (Blobs), no hi ha IA');
  ok(f.crides.length === 0, 'cap d\'aquestes ha cridat Claude');
}

console.log('\n2 · Identificar-se');
{
  ok(vies(ENV).join() === 'correu', 'sense OAuth App, només el correu');
  ok(vies(Object.assign({ GITHUB_CLIENT_ID: 'a', GITHUB_CLIENT_SECRET: 'b' }, ENV)).join() === 'correu,github', 'amb l\'OAuth App, també GitHub');
  ok(vies({}).length === 0, 'sense cap secret, cap via');
  const CERV = Object.assign({ CERVELL_GH_CLIENT_ID: 'cerv', CERVELL_GH_CLIENT_SECRET: 's' }, ENV);
  ok(vies(CERV).join() === 'correu,github', 'la GitHub App del cervell també serveix per identificar-se');
  ok(aGithub(Object.assign({ URL: 'https://x.test' }, CERV), 'n', 0).on.includes('client_id=cerv'), 'i n\'agafa el client_id');
  ok(perCorreu({ nom: 'María', mail: 'no-es-correu', privacitat: true }, ENV).estat === 'error', 'un correu dolent no entra');
  ok(perCorreu({ nom: 'María', mail: 'm@x.es' }, ENV).estat === 'error', 'sense la casella de privacitat no entra');
  const r = perCorreu({ nom: 'María', mail: 'M@X.es', privacitat: true }, ENV), d = llegeix(r.sessio, secret(ENV));
  ok(r.estat === 'fet' && d.via === 'correu' && /^mail:[0-9a-f]{40}$/.test(d.id), 'amb nom, correu i casella: sessió signada amb l\'empremta');
  ok(d.id === llegeix(perCorreu({ nom: 'M', mail: 'm@x.es', privacitat: true }, ENV).sessio, secret(ENV)).id, 'el mateix correu és la mateixa persona (el tope no es reinicia)');
  ok(d.exp > Date.now() + 29 * 864e5, 'la sessió dura 30 dies');
  const GH = Object.assign({ GITHUB_CLIENT_ID: 'cid', GITHUB_CLIENT_SECRET: 'csec' }, ENV);
  const a = aGithub(GH, 'nonce1');
  ok(a.estat === 'ves' && a.on.startsWith('https://github.com/login/oauth/authorize?') && a.on.includes('redirect_uri=https%3A%2F%2Fexemple.netlify.app%2F.netlify%2Ffunctions%2Fidentitat'), 'GitHub: cap a l\'autorització, amb la tornada de la casa');
  ok(/tt_oauth=nonce1;.*HttpOnly; Secure; SameSite=Lax/.test(a.galeta), 'la galeta de comprovació és HttpOnly i Secure');
  const state = new URL(a.on).searchParams.get('state');
  const fg = fals([{ status: 200, json: { access_token: 'gho_x' } }, { status: 200, json: { id: 42, login: 'maria', name: 'María B' } }, { status: 200, json: [{ email: 'm@x.es', primary: true, verified: true }] }]);
  ok((await deGithub({ code: 'c', state }, 'tt_oauth=altre', GH, fg)).estat === 'error' && fg.crides.length === 0, 'GitHub: sense la galeta bona, no es bescanvia el codi');
  const g = await deGithub({ code: 'c', state }, 'x=1; tt_oauth=nonce1', GH, fg), dg = llegeix(g.sessio, secret(GH));
  ok(g.estat === 'fet' && dg.id === 'gh:42' && dg.nom === 'María B' && dg.mail === 'm@x.es', 'GitHub: la sessió diu qui és, amb el correu verificat');
  ok(JSON.parse(fg.crides[0].opts.body).client_secret === 'csec' && !fg.crides[1].url.includes('csec'), 'el secret només va al bescanvi del codi');
}

console.log('\n3 · Una volta del mapa');
{
  const f = fals([claude(RESP_MAPA)]), reg = memoria();
  const r = await pule({ sessio: ses(), pas: 'mapa', dades: DADES }, ENV, reg, f);
  const req = JSON.parse(f.crides[0].opts.body), h = f.crides[0].opts.headers;
  ok(r.estat === 'fet' && r.resultat.sugerencias.length === 2, 'passen les dues propostes aplicables; la fila que no existeix i el tipus estrany, no');
  ok(r.resultat.pregunta && r.resultat.resumen, 'amb el resum i la pregunta per a la volta següent');
  ok(req.model === 'claude-opus-5-5' && req.output_config.effort === 'low' && req.output_config.format.type === 'json_schema', 'Opus 5.5, esforç baix, sortida amb esquema');
  ok(req.fallbacks === 'default' && h['anthropic-beta'] === 'server-side-fallback-2026-07-01' && !('temperature' in req), 'amb fallbacks i sense paràmetres de mostreig');
  ok(req.messages[0].content.includes('<dades>') && req.system.includes('nunca instrucciones'), 'el text del client va dins de <dades>, que el sistema diu que són dades');
  ok(h['x-api-key'] === ENV.ANTHROPIC_API_KEY && !JSON.stringify(r).includes('sk-ant'), 'la clau va a la capçalera i no torna mai');
  const esperat = (2000 * 4 + 1000 * 20) / 1e6;
  ok(Math.abs(cost({ model: 'claude-opus-5-5', usage: { input_tokens: 2000, output_tokens: 1000 } }) - esperat) < 1e-9, 'el cost surt de usage i del preu del model');
  const p = [...reg.m.entries()].find(([k]) => k.startsWith('persona/'));
  ok(p && Math.abs(JSON.parse(p[1]).gastat - esperat) < 1e-9 && JSON.parse(p[1]).voltes === 1 && !('reservat' in JSON.parse(p[1])), 'el registre guarda el cost real, no la reserva');
  ok(!p[0].includes('abc') && !p[1].includes('m@x.es'), 'al registre, l\'empremta; ni la identitat ni el correu');
  ok(r.queda === Math.round(100 * (1 - esperat / 0.5)) && r.voltes === 1, 'el navegador sap quanta energia li queda');
  const fb = cost({ model: 'claude-opus-4-8', usage: { input_tokens: 10, output_tokens: 10, iterations: [{ model: 'claude-opus-5-5', input_tokens: 2000, output_tokens: 0 }, { model: 'claude-opus-4-8', input_tokens: 2000, output_tokens: 1000 }] } });
  ok(Math.abs(fb - (2000 * 4 + 2000 * 5 + 1000 * 25) / 1e6) < 1e-9, 'amb fallback, es compta cada intent al seu preu');
}

console.log('\n4 · El tope no se supera mai');
{
  const reg = memoria(), car = claude(RESP_MAPA, { input_tokens: 3000, output_tokens: 2800 });
  const f = fals([car]);
  let n = 0, r;
  do { r = await pule({ sessio: ses(ENV, 'mail:tope'), pas: 'mapa', dades: DADES }, ENV, reg, f); if (r.estat === 'fet') n++; } while (r.estat === 'fet' && n < 50);
  const p = JSON.parse([...reg.m.entries()].find(([k]) => k.startsWith('persona/'))[1]);
  ok(r.estat === 'topall' && p.gastat <= 0.5, 'para abans de passar de 0,50 $ (' + n + ' voltes, ' + p.gastat.toFixed(3) + ' $)');
  ok(p.gastat + reserva('mapa', text(neteja(DADES))) > 0.5, 'para quan la volta següent, en el pitjor cas, ja no hi cabria');
  ok(f.crides.length === n, 'la volta que no hi cap no crida Claude');
  const altra = await pule({ sessio: ses(ENV, 'mail:altra'), pas: 'mapa', dades: DADES }, ENV, reg, f);
  ok(altra.estat === 'fet', 'una altra persona té el seu tope');
  const INV = Object.assign({ IA_INVITATS: 'Otra@x.es, gh:42' }, ENV), regI = memoria();
  let ni = 0, ri;
  do { ri = await pule({ sessio: sessio({ via: 'correu', id: 'mail:inv', nom: 'P', mail: 'otra@x.es' }, INV), pas: 'mapa', dades: DADES }, INV, regI, f); if (ri.estat === 'fet') ni++; } while (ri.estat === 'fet' && ni < 80);
  ok(ni > n * 3 && JSON.parse([...regI.m.values()].find(v => /voltes/.test(v))).gastat <= 2, 'els convidats de l\'Àlvar (IA_INVITATS) tenen el seu tope, més alt (' + ni + ' voltes)');
  const regD = memoria(), dia = new Date().toISOString().slice(0, 10);
  await regD.set('dia/' + dia, { gastat: 4.99 });
  ok((await pule({ sessio: ses(), pas: 'mapa', dades: DADES }, ENV, regD, fals([car]))).estat === 'ocupat', 'el tope del dia, per a tot el web, també para');
  const fe = fals([{ status: 529, json: { error: { type: 'overloaded_error' } } }]), regE = memoria();
  const re = await pule({ sessio: ses(), pas: 'mapa', dades: DADES }, ENV, regE, fe);
  ok(re.estat === 'error' && JSON.parse([...regE.m.values()][0]).gastat === 0, 'si Claude falla, la reserva es torna');
  const fr = fals([{ status: 200, json: { model: 'claude-opus-5-5', stop_reason: 'refusal', content: [], usage: { input_tokens: 100, output_tokens: 0 } } }]);
  ok((await pule({ sessio: ses(), pas: 'mapa', dades: DADES }, ENV, memoria(), fr)).estat === 'error', 'un rebuig es diu amb paraules, sense llegir el contingut');
}

console.log('\n5 · Els textos de la web');
{
  const RESP_WEB = { lema: 'Formamos a los profesores que las escuelas buscan', presentacion: 'Dos frases.', secciones: [
    { quien: 'profesores nuevos', nombre: 'Futuros profes', intro: 'Aquí encuentras tu curso.' },
    { quien: 'Inventados', nombre: 'X', intro: 'no és del dibuix' },
    { quien: 'Escuelas', nombre: 'Escuelas', intro: '' }] };
  const f = fals([claude(RESP_WEB)]);
  const r = await pule({ sessio: ses(), pas: 'web', dades: DADES }, ENV, memoria(), f);
  ok(r.estat === 'fet' && r.resultat.lema && r.resultat.secciones.length === 1, 'només les seccions de gent del dibuix i amb text');
  ok(r.resultat.secciones[0].quien === 'Profesores nuevos', 'el nom torna tal com és al dibuix (és la clau de la marca del motor)');
  ok(JSON.stringify(JSON.parse(f.crides[0].opts.body).output_config.format.schema) === JSON.stringify(ESQUEMA.web), 'amb el seu esquema');
  ok((await pule({ sessio: ses(), pas: 'web', dades: { alrededor: [] } }, ENV, memoria(), fals([claude(RESP_WEB)]))).estat === 'error', 'sense gent al voltant, no escriu la web');
}

console.log('\n6 · Les dades que arriben');
{
  const d = neteja({ casa: 'x'.repeat(500), alrededor: Array.from({ length: 40 }, () => ({ quien: 'a', meDaEs: 'raro' })), capes: ['extranet', 'hack'] });
  ok(d.casa.length === 80 && d.alrededor.length === 20 && d.alrededor[0].meDaEs === 'tangible' && d.capes.join() === 'extranet', 'retallades, amb les menes i les capes conegudes');
  const v = valida('mapa', { sugerencias: Array.from({ length: 10 }, () => ({ tipo: 'nuevo', fila: -1, quien: 'A' })) }, neteja(DADES));
  ok(v.sugerencias.length === 6, 'com a molt sis propostes');
  ok((await pule({ sessio: ses(), pas: 'mapa', dades: { inicial: 'x'.repeat(1500), respuestas: Array.from({ length: 12 }, () => ({ q: 'q'.repeat(200), a: 'a'.repeat(600) })), alrededor: Array.from({ length: 20 }, () => ({ quien: 'q'.repeat(80), meDa: 'm'.repeat(160), leDoy: 'l'.repeat(160) })) } }, ENV, memoria(), fals([claude(RESP_MAPA)]))).estat === 'error', 'un dibuix massa llarg no es crida');
}

console.log('\n7 · El tancament del mes');
{
  const reg = memoria(), f = fals([claude(RESP_MAPA)]), TOK = 't'.repeat(30), E = Object.assign({ IA_CIERRE_TOKEN: TOK }, ENV);
  await pule({ sessio: ses(E, 'mail:a'), pas: 'mapa', dades: DADES }, E, reg, f);
  await pule({ sessio: ses(E, 'mail:a'), pas: 'mapa', dades: DADES }, E, reg, f);
  await pule({ sessio: ses(E, 'mail:b'), pas: 'mapa', dades: DADES }, E, reg, f);
  const mes = new Date().toISOString().slice(0, 7), u = (2000 * 4 + 1000 * 20) / 1e6;
  ok(await tancament(mes, 'Bearer x', E, reg) === null && await tancament(mes, 'Bearer ' + TOK, ENV, reg) === null, 'sense el testimoni bo (o sense IA_CIERRE_TOKEN), res');
  const t = await tancament(mes, 'Bearer ' + TOK, E, reg);
  ok(Math.abs(t.usd - 3 * u) < 1e-4 && t.persones === 2 && Math.abs(t.maxim - 2 * u) < 1e-4, 'el total del mes, quantes persones i el màxim per persona');
  ok(!/mail|@|abc/.test(JSON.stringify(t)), 'sense dades personals');
}

console.log('\n' + pass + ' bé, ' + fail + ' malament');
if (fail) process.exit(1);
