/* Els convidats de l'Àlvar i el seu panell · provat sense xarxa
   ─────────────────────────────────────────────────────────────────────────
   `netlify/lib/convidats.mjs`, `netlify/functions/convidats.mjs` (el panell) i
   l'entrada amb l'enllaç a `identitat.mjs`, amb registres en memòria.
   El que es prova:

   · Sense el testimoni de gestió, el panell no diu ni fa res (404).
   · Afegir un convidat torna el seu enllaç, amb els paràmetres de /cliente/.
   · L'enllaç el fa entrar sense escriure res, amb el seu compte i via `convit`.
   · Un enllaç tocat, d'un convidat tret o d'abans d'«enllaç nou», no obre res.
   · El tope alt només val per a qui ha entrat pel seu enllaç, i mai passa de 10 $.
   · El panell ensenya la despesa i com va l'espai, mai el text del dibuix. */
import { handler as panell, gestiona, resum } from '../../netlify/functions/convidats.mjs';
import { perConvit, perCorreu, sessio, handler as identitat } from '../../netlify/functions/identitat.mjs';
import { pule } from '../../netlify/functions/pule-mapa.mjs';
import { topeConvit, tope, deTestimoni, clauDe } from '../../netlify/lib/convidats.mjs';
import { secret, llegeix, empremta } from '../../netlify/lib/signatura.mjs';
import { clau as clauFitxa } from '../../netlify/functions/fitxa.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const TOK = 't'.repeat(32), ENV = { ANTHROPIC_API_KEY: 'sk-ant-usr-' + 'x'.repeat(40), IA_CIERRE_TOKEN: TOK, URL: 'https://teamtowershuma.com' };
const memoria = () => { const m = new Map(); return { m, get: async k => (m.has(k) ? JSON.parse(m.get(k)) : null), set: async (k, v) => { m.set(k, JSON.stringify(v)); }, del: async k => { m.delete(k); } }; };
const regs = () => ({ convidats: memoria(), ia: memoria(), fitxes: memoria() });
const B = 'Bearer ' + TOK;
const MARIA = { mail: 'Maria@EleBarcelona.com', nom: 'María', tope: 2, params: { org: 'ELE Barcelona', web: 'elebarcelona.com', pie: 'languages4life.com', pieNom: 'Languages4life', para: 'María', procesos: 'programas' } };
const inv = u => new URL(u).searchParams.get('inv');

console.log('\nEl panell, només amb el testimoni de gestió');
{
  const R = regs();
  ok(await gestiona('GET', {}, '', {}, ENV, R) === null, 'sense testimoni, res');
  ok(await gestiona('GET', {}, 'Bearer ' + 'x'.repeat(32), {}, ENV, R) === null, 'amb un testimoni que no és, res');
  ok(await gestiona('GET', {}, 'Bearer curt', {}, Object.assign({}, ENV, { IA_CIERRE_TOKEN: 'curt' }), R) === null, 'amb un testimoni de gestió massa curt, tampoc');
  const h = await panell({ httpMethod: 'GET', headers: {} });
  ok(h.statusCode === 404 && h.body === '{}', 'la funció, sense testimoni, fa veure que no hi és (404)');
}

console.log('\nAfegir un convidat i el seu enllaç');
const R = regs();
let M;
{
  const r = await gestiona('PUT', {}, B, MARIA, ENV, R);
  M = r.convidat;
  ok(r.estat === 'fet' && M.mail === 'maria@elebarcelona.com' && M.tope === 2, 'el desa amb el correu en minúscules i el seu tope');
  const u = new URL(M.enllac);
  ok(u.origin + u.pathname === 'https://teamtowershuma.com/cliente/', "l'enllaç va al seu espai, al web de debò");
  ok(u.searchParams.get('org') === 'ELE Barcelona' && u.searchParams.get('web') === 'elebarcelona.com' && u.searchParams.get('pie') === 'languages4life.com'
    && u.searchParams.get('pieNom') === 'Languages4life' && u.searchParams.get('para') === 'María' && u.searchParams.get('procesos') === 'programas', 'amb els paràmetres que /cliente/ ja entén');
  ok(!/maria%40|maria@/i.test(inv(M.enllac)) && !atob(inv(M.enllac).split('.')[0].replace(/-/g, '+').replace(/_/g, '/')).includes('@'), "el testimoni de l'enllaç no porta el correu");
  ok((await gestiona('PUT', {}, B, { mail: 'no-es-correu' }, ENV, R)).estat === 'error', 'sense correu bo, no');
  ok(tope(50) === 10 && tope(0.1) === 0.5 && tope('3,5') === 3.5 && tope('') === 2, 'el tope, sempre entre 0,50 i 10 $');
  const r2 = await gestiona('PUT', {}, B, { mail: 'maria@elebarcelona.com', tope: 5 }, ENV, R);
  ok(r2.convidat.tope === 5 && r2.convidat.nom === 'María' && r2.convidat.params.org === 'ELE Barcelona' && r2.convidat.enllac === M.enllac, "canviar-li el tope no li canvia l'enllaç ni el que ja tenia");
  M = r2.convidat;
}

console.log("\nEntrar amb l'enllaç");
{
  const pre = await perConvit({ inv: inv(M.enllac) }, ENV, R.convidats);
  ok(pre.estat === 'convit' && pre.nom === 'María' && pre.mail === 'maria@elebarcelona.com' && !pre.sessio, "sense la casella, només diu a qui és l'enllaç");
  const r = await perConvit({ inv: inv(M.enllac), privacitat: true }, ENV, R.convidats);
  const s = llegeix(r.sessio, secret(ENV));
  ok(r.estat === 'fet' && s.via === 'convit' && s.id === 'mail:' + empremta('maria@elebarcelona.com') && s.mail === 'maria@elebarcelona.com', 'amb la casella, entra amb el seu compte (el mateix que amb el correu) i via convit');
  const c = perCorreu({ nom: 'María', mail: 'maria@elebarcelona.com', privacitat: true }, ENV), sc = llegeix(c.sessio, secret(ENV));
  ok(sc.id === s.id, 'és el mateix compte que si escriu el correu: la mateixa fitxa');
  ok((await R.convidats.get('llista')).convidats[clauDe('maria@elebarcelona.com')].entrat, 'el panell sap quan ha entrat');
  const tocat = inv(M.enllac).slice(0, -2) + 'xx';
  ok((await perConvit({ inv: tocat, privacitat: true }, ENV, R.convidats)).estat === 'error', 'un enllaç tocat no obre res');
  ok(await topeConvit(s, R.convidats) === 5, 'qui ha entrat pel seu enllaç té el seu tope');
  ok(await topeConvit(sc, R.convidats) === null, 'qui escriu el seu correu, no: el correu no es comprova');

  /* La IA, de debò: amb el seu tope, no amb el de 0,50. */
  const resp = { status: 200, json: { model: 'claude-opus-5-5', stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({ resumen: 'Bien.', preguntas: [], sugerencias: [] }) }], usage: { input_tokens: 3000, output_tokens: 2800 } } };
  const f = async () => ({ ok: true, status: 200, json: async () => resp.json });
  const D = { casa: 'Formadores', alrededor: [{ quien: 'Profesores', meDa: 'matrículas', meDaEs: 'tangible', leDoy: 'curso', leDoyEs: 'tangible' }, { quien: 'Escuelas', meDa: 'ofertas', meDaEs: 'intangible', leDoy: 'profesores', leDoyEs: 'intangible' }] };
  const comptaVoltes = async (ses, ia, conv) => { let n = 0, x; do { x = await pule({ sessio: ses, pas: 'mapa', dades: D }, ENV, ia, f, new Date(), conv); if (x.estat === 'fet') n++; } while (x.estat === 'fet' && n < 200); return { n, x }; };
  const amb = await comptaVoltes(r.sessio, memoria(), R.convidats), sense = await comptaVoltes(c.sessio, memoria(), R.convidats);
  ok(amb.x.estat === 'topall' && sense.x.estat === 'topall' && amb.n > sense.n * 5, 'la IA li dona el seu tope per l\'enllaç (' + amb.n + ' voltes) i 0,50 $ pel correu sol (' + sense.n + ')');

  /* Enllaç nou: el d'abans ja no obre res, i la sessió feta amb el d'abans perd el tope alt. */
  const r3 = await gestiona('PUT', {}, B, { mail: 'maria@elebarcelona.com', nou: true }, ENV, R);
  ok(r3.convidat.enllac !== M.enllac, '«Enlace nuevo» en fa un altre');
  ok((await perConvit({ inv: inv(M.enllac), privacitat: true }, ENV, R.convidats)).estat === 'error', "l'enllaç d'abans ja no obre res");
  ok(await topeConvit(s, R.convidats) === null, "i qui va entrar amb l'enllaç d'abans torna al tope de tothom");
  ok((await perConvit({ inv: inv(r3.convidat.enllac), privacitat: true }, ENV, R.convidats)).estat === 'fet', "el nou, sí");
  M = r3.convidat;
}

console.log('\nEl que ensenya el panell');
{
  const id = 'mail:' + empremta('maria@elebarcelona.com');
  await R.ia.set('persona/' + empremta(id), { gastat: 0.4321, voltes: 3, ultim: '2026-11-05T12:00:00.000Z' });
  await R.ia.set('dia/' + new Date().toISOString().slice(0, 10), { gastat: 1.25 });
  await R.fitxes.set(clauFitxa(id), { org: 'ELE Barcelona', actualitzada: '2026-11-05T12:01:00.000Z', inicial: 'Mi texto privado', alrededor: [{ quien: 'Profesores', meDa: 'secreto' }, { quien: '' }], programes: [{ nom: 'FELE' }, { nom: 'ELE+' }], formularis: [{}, {}], invitacio: { tancada: true } });
  const g = await gestiona('GET', {}, B, {}, ENV, R), x = g.convidats[0];
  ok(g.estat === 'fet' && g.ia.actiu === true && g.dia.usd === 1.25, "l'estat de la IA i el que s'ha gastat avui");
  ok(x.gastat === 0.4321 && x.voltes === 3 && x.ultim, 'el que ha gastat cada convidat');
  ok(x.espai.org === 'ELE Barcelona' && x.espai.persones === 1 && x.espai.programes === 2 && x.espai.formularis === 2 && x.espai.benvinguda === true, 'com va el seu espai, en xifres');
  ok(!JSON.stringify(g).includes('Mi texto privado') && !JSON.stringify(g).includes('secreto'), 'mai el text del dibuix');
  ok(x.enllac === M.enllac, 'i el seu enllaç, per copiar-lo');
  ok(resum(null) === null, 'sense espai encara, cap resum');
  const VAR = Object.assign({}, ENV, { IA_INVITATS: 'antic@x.es' });
  ok((await gestiona('GET', {}, B, {}, VAR, R)).variable.includes('antic@x.es'), 'els de la variable de Netlify, també, perquè no se n\'oblidi cap');
  const sense = Object.assign({}, ENV, { ANTHROPIC_API_KEY: 'sk-ant-oat01-' + 'x'.repeat(40) });
  const gs = await gestiona('GET', {}, B, {}, sense, R);
  ok(gs.ia.actiu === false && /no és una clau/.test(gs.ia.motiu), 'si la IA no va, diu per què');
}

console.log('\nEl tauler de clients: la fase');
{
  const r = await gestiona('PUT', {}, B, { mail: 'maria@elebarcelona.com', fase: 'propuesta' }, ENV, R), x = r.convidat;
  ok(x.fase === 'propuesta' && x.nom === 'María' && x.params.org === 'ELE Barcelona' && x.enllac === M.enllac, 'moure-la de fase no canvia res més, ni el seu enllaç');
  ok((await gestiona('PUT', {}, B, { mail: 'maria@elebarcelona.com', fase: 'qualsevol' }, ENV, R)).convidat.fase === 'propuesta', 'una fase que no existeix no esborra la que tenia');
  ok((await gestiona('PUT', {}, B, { mail: 'maria@elebarcelona.com', nom: 'María' }, ENV, R)).convidat.fase === 'propuesta', 'canviar-li el nom la deixa a la seva fase');
}

console.log('\nTreure un convidat');
{
  ok((await gestiona('DELETE', { mail: 'MARIA@elebarcelona.com' }, B, {}, ENV, R)).estat === 'tret', 'el treu');
  ok((await perConvit({ inv: inv(M.enllac), privacitat: true }, ENV, R.convidats)).estat === 'error', 'i el seu enllaç ja no obre res');
  ok((await gestiona('DELETE', { mail: 'MARIA@elebarcelona.com' }, B, {}, ENV, R)).estat === 'cap', 'treure el que no hi és no fa res');
}

console.log("\nLa funció d'identitat, amb l'enllaç");
{
  const r = await gestiona('PUT', {}, B, MARIA, ENV, R);
  const ev = (m, extra) => Object.assign({ httpMethod: m, headers: {} }, extra);
  const h = await identitat(ev('GET', { queryStringParameters: { inv: inv(r.convidat.enllac) } }));
  ok(h.statusCode === 503 || h.statusCode === 400, 'sense Blobs ni secret a la funció, no diu res de ningú');
}

console.log(`\n${pass} bé, ${fail} malament`);
process.exit(fail ? 1 : 0);
