/* Les referències dels clients · provat sense xarxa
   ─────────────────────────────────────────────────────────────────────────
   `netlify/lib/referencies.mjs` i `netlify/functions/referencies.mjs`, amb un
   registre en memòria. El que es prova:

   · Sense el testimoni de gestió no es pot demanar ni llistar res.
   · L'enllaç per escriure-la obre la petició; un de tocat o d'abans no.
   · Sense consentiment triat ni casella de privacitat, no es desa.
   · `privada` no es pot veure per cap enllaç; `compartir`, sí, i amb la
     firma que qui l'ha escrita ha triat.
   · L'enllaç per escriure-la no serveix per llegir-la, ni al revés.
   · Retirar-la la treu també del dossier i de l'enllaç per compartir. */
import { gestiona, handler } from '../../netlify/functions/referencies.mjs';
import { firma } from '../../netlify/lib/referencies.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const TOK = 't'.repeat(32), ENV = { ANTHROPIC_API_KEY: 'sk-ant-usr-' + 'x'.repeat(40), IA_CIERRE_TOKEN: TOK, URL: 'https://teamtowershuma.com' };
const memoria = () => { const m = new Map(); return { m, get: async k => (m.has(k) ? JSON.parse(m.get(k)) : null), set: async (k, v) => { m.set(k, JSON.stringify(v)); }, del: async k => { m.delete(k); } }; };
const B = 'Bearer ' + TOK;
const par = (u, k) => new URL(u).searchParams.get(k);
const RESP = { antes: 'Estábamos en pleno cambio.', cambio: 'Ahora el equipo decide.', como: 'Escucha y ordena.', recomienda: 'A quien empieza algo nuevo.', frase: 'Me ayudó a ver.', firmaNom: 'Ana Pérez Gil', firmaCarrec: 'Directora', firmaOrg: 'Entidad', mostra: 'nombre', nivell: 'compartir', privacitat: true };

const reg = memoria();
console.log('\nPedir una referencia, solo con el testimonio de gestión');
{
  ok(await gestiona('GET', {}, '', {}, ENV, reg) === null, 'sin testimonio, nada');
  ok(await gestiona('PUT', {}, 'Bearer ' + 'x'.repeat(32), { nom: 'Ana' }, ENV, reg) === null, 'con un testimonio que no es, no se pide nada');
  const h = await handler({ httpMethod: 'GET', headers: {}, queryStringParameters: {} });
  ok(h.statusCode === 404 || h.statusCode === 400, 'la función, sin nada, no enseña nada');
  const e = await gestiona('PUT', {}, B, { org: 'X' }, ENV, reg);
  ok(e.estat === 'error', 'sin nombre no se pide');
}
const p = (await gestiona('PUT', {}, B, { nom: 'Ana', org: 'Entidad', relacio: 'tres años acompañando la gestión' }, ENV, reg)).ref;
ok(p && p.escriu.startsWith('https://teamtowershuma.com/referencias/?r=') && !p.ver, 'devuelve el enlace para escribirla, y aún ninguno para enseñarla');
const r = par(p.escriu, 'r');

console.log('\nQuien la escribe');
{
  const g = await gestiona('GET', { r }, '', {}, ENV, reg);
  ok(g.estat === 'fet' && g.nom === 'Ana' && g.relacio && !g.resposta, 'el enlace abre su petición');
  ok(await gestiona('GET', { r: r.slice(0, -2) + 'xx' }, '', {}, ENV, reg) === null, 'un enlace tocado no abre nada');
  ok((await gestiona('POST', {}, '', { r, resposta: Object.assign({}, RESP, { privacitat: false }) }, ENV, reg)).estat === 'error', 'sin la casilla de privacidad no se guarda');
  ok((await gestiona('POST', {}, '', { r, resposta: Object.assign({}, RESP, { nivell: '' }) }, ENV, reg)).estat === 'error', 'sin elegir quién la ve no se guarda');
  ok((await gestiona('POST', {}, '', { r, resposta: Object.assign({}, RESP, { antes: '', cambio: '', como: '' }) }, ENV, reg)).estat === 'error', 'vacía no se guarda');
  const s = await gestiona('POST', {}, '', { r, resposta: RESP }, ENV, reg);
  ok(s.estat === 'fet' && s.resposta.consentiment.nivell === 'compartir' && s.resposta.consentiment.data, 'se guarda con el consentimiento y su fecha');
}

console.log('\nEnseñarla');
const L = await gestiona('GET', {}, B, {}, ENV, reg);
const ver = par(L.refs[0].ver, 'ver'), dossier = par(L.dossier, 'ver');
{
  ok(ver && dossier, 'con «compartir», el panel da el enlace para enseñarla y el del dossier');
  const v = await gestiona('GET', { ver }, '', {}, ENV, reg);
  ok(v.estat === 'fet' && v.refs[0].firma.qui === 'Ana Pérez Gil' && v.refs[0].cambio, 'el enlace enseña la referencia con su firma');
  ok(!('relacio' in v.refs[0]) && !('consentiment' in v.refs[0]), 'y nada más que lo que escribió');
  ok((await gestiona('GET', { ver: r }, '', {}, ENV, reg)).estat === 'cap', 'el enlace para escribirla no sirve para leerla');
  ok(await gestiona('POST', {}, '', { r: ver, resposta: RESP }, ENV, reg) === null, 'ni el de leerla para escribirla');
  ok((await gestiona('GET', { ver: dossier }, '', {}, ENV, reg)).refs.length === 1, 'el dossier la lleva');
  ok(firma({ firma: { nom: 'ana pérez', carrec: 'Directora', org: 'Entidad' }, mostra: 'iniciales' }).qui === 'A. P.', 'con iniciales, solo las iniciales');
  ok(firma({ firma: { nom: 'Ana', carrec: 'Directora', org: 'Entidad' }, mostra: 'anonimo' }).qui.indexOf('Ana') === -1, 'sin nombre, sin nombre');
}

console.log('\nCambiar de opinión');
{
  await gestiona('POST', {}, '', { r, resposta: Object.assign({}, RESP, { nivell: 'privada' }) }, ENV, reg);
  ok((await gestiona('GET', { ver }, '', {}, ENV, reg)).estat === 'cap', 'si pasa a «solo Álvaro», el enlace para enseñarla deja de abrir');
  ok((await gestiona('GET', { ver: dossier }, '', {}, ENV, reg)).estat === 'cap', 'y sale del dossier');
  await gestiona('POST', {}, '', { r, resposta: RESP }, ENV, reg);
  ok((await gestiona('GET', { ver }, '', {}, ENV, reg)).estat === 'fet', 'vuelve a «compartir» y vuelve a abrir');
  ok((await gestiona('POST', {}, '', { r, retira: true }, ENV, reg)).estat === 'retirada', 'la puede retirar');
  ok((await gestiona('GET', { ver }, '', {}, ENV, reg)).estat === 'cap', 'retirada, no se ve');
  await gestiona('POST', {}, '', { r, resposta: RESP }, ENV, reg);
  await gestiona('PUT', {}, B, { id: p.id, nou: true }, ENV, reg);
  ok(await gestiona('GET', { r }, '', {}, ENV, reg) === null && (await gestiona('GET', { ver }, '', {}, ENV, reg)).estat === 'cap', 'con «enlaces nuevos», los de antes no abren');
  await gestiona('PUT', {}, B, { dossierNou: true }, ENV, reg);
  ok((await gestiona('GET', { ver: dossier }, '', {}, ENV, reg)).estat === 'cap', 'con dossier nuevo, el de antes no abre');
  ok((await gestiona('DELETE', { id: p.id }, B, {}, ENV, reg)).estat === 'tret' && !(await gestiona('GET', {}, B, {}, ENV, reg)).refs.length, 'Álvaro la puede borrar');
}

console.log(`\n${pass} bé, ${fail} malament`);
process.exit(fail ? 1 : 0);
