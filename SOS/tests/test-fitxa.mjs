/* El dibuix de cada client, guardat amb el seu compte · provat sense xarxa
   ─────────────────────────────────────────────────────────────────────────
   `netlify/functions/fitxa.mjs` amb un registre en memòria. El que es prova:

   · Sense sessió signada no es llegeix ni es desa res; amb sessió, només la seva.
   · L'empremta és la mateixa que la del registre de la IA (pule-mapa.mjs) i la
     clau no porta el correu.
   · Del que arriba només passa el que la pàgina fa servir, i tallat.
   · Esborrar-la és un clic seu; deixar-la preparada demana el testimoni de
     gestió, i sense, 404. */
import { client, gestiona, neteja, clau, handler } from '../../netlify/functions/fitxa.mjs';
import { idDe } from '../../netlify/functions/proposta.mjs';
import { sessio } from '../../netlify/functions/identitat.mjs';
import { empremta } from '../../netlify/lib/signatura.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const ENV = { ANTHROPIC_API_KEY: 'sk-ant-api03-' + 'x'.repeat(40), IA_CIERRE_TOKEN: 't'.repeat(32) };
const memoria = () => { const m = new Map(); return { m, get: async k => (m.has(k) ? JSON.parse(m.get(k)) : null), set: async (k, v) => { m.set(k, JSON.stringify(v)); }, del: async k => { m.delete(k); } }; };
const BE = 'Bearer ' + ENV.IA_CIERRE_TOKEN;
const MARIA = sessio({ via: 'correu', id: idDe('maria@exemple.cat'), nom: 'María', mail: 'maria@exemple.cat' }, ENV);
const ALTRA = sessio({ via: 'github', id: 'gh:7', nom: 'Otra' }, ENV);
const F = { nom: 'María', mail: 'maria@exemple.cat', casa: 'Escuela', inicial: 'Formo a profesores', respuestas: { objetivo: 'Que me encuentren', 'mal clau': 'x' },
  alrededor: [{ quien: 'Futuros profesores', meDa: 'matrículas', meDaEs: 'tangible', leDoy: 'el curso', leDoyEs: 'raro' }],
  extra: { roles: ['Academias'], pairs: [['Academias', 'Futuros profesores', 'tangible', 'trabajo', 'intangible', 'buen nombre'], ['', 'x']] },
  marca: { lema: 'Profes que enseñan', portes: { 'Futuros profesores': { nom: 'Quiero ser profe', intro: 'Aquí empiezas' } } },
  capes: ['extranet', 'otra'], cuenta: true, script: '<script>', __proto__x: 1 };

console.log('\n1 · Qui és i on es guarda');
ok(clau(idDe('maria@exemple.cat')) === 'fitxa/' + empremta(idDe('maria@exemple.cat')), "la mateixa empremta que el registre de la IA ('persona/' + empremta)");
ok(!/maria|@/.test(clau(idDe('maria@exemple.cat'))), 'la clau no porta el correu');

console.log('\n2 · Del que arriba, només el que la pàgina fa servir');
{
  const n = neteja(F, new Date('2026-10-26T08:00:00Z'));
  ok(n.casa === 'Escuela' && n.alrededor[0].leDoyEs === 'tangible' && n.respuestas.objetivo && !('mal clau' in n.respuestas), 'les files i les respostes, netes');
  ok(n.extra.pairs.length === 1 && n.extra.roles[0] === 'Academias', 'el que passa entre els altres, sense parells a mitges');
  ok(n.marca.portes['Futuros profesores'].nom === 'Quiero ser profe' && n.capes.join() === 'extranet', 'els textos de la web i les capes que hi ha');
  ok(!('script' in n) && !('__proto__x' in n) && n.actualitzada === '2026-10-26T08:00:00.000Z', 'cap camp de més, i diu quan es va desar');
  ok(neteja(null) === null && neteja('x') === null, 'una cosa que no és una fitxa, no');
  const gran = neteja({ alrededor: Array.from({ length: 24 }, () => ({ quien: 'q'.repeat(120), meDa: 'm'.repeat(240), leDoy: 'l'.repeat(240) })), inicial: 'i'.repeat(9000),
    extra: { pairs: Array.from({ length: 40 }, () => ['a'.repeat(120), 'b'.repeat(120), 'tangible', 'c'.repeat(240), 'intangible', 'd'.repeat(240)]) } });
  ok(gran && gran.inicial.length === 3000 && gran.alrededor.length === 24, 'el que és massa llarg es talla');
}

console.log('\n3 · Cadascú, la seva');
{
  const reg = memoria();
  ok((await client({ fitxa: F }, ENV, reg)).estat === 'identifica' && !reg.m.size, 'sense sessió no es desa res');
  ok((await client({ sessio: MARIA + 'x', fitxa: F }, ENV, reg)).estat === 'identifica', 'amb una sessió tocada, tampoc');
  ok((await client({ sessio: MARIA }, ENV, null)).estat === 'sense-config', 'sense Blobs, ho diu');
  ok((await client({ sessio: MARIA }, ENV, reg)).estat === 'cap', 'la primera vegada no hi ha res');
  const d = await client({ sessio: MARIA, fitxa: F }, ENV, reg);
  ok(d.estat === 'desada' && d.actualitzada, 'la desa i diu quan');
  const l = await client({ sessio: MARIA }, ENV, reg);
  ok(l.estat === 'fet' && l.fitxa.casa === 'Escuela' && l.fitxa.alrededor.length === 1, 'la torna a llegir, des de qualsevol aparell');
  ok((await client({ sessio: ALTRA }, ENV, reg)).estat === 'cap', 'una altra persona no la veu');
  ok(![...reg.m.keys()].some(k => k.includes('maria')), 'al magatzem, la clau és una empremta');
  ok((await client({ sessio: MARIA, esborra: true }, ENV, reg)).estat === 'esborrada' && (await client({ sessio: MARIA }, ENV, reg)).estat === 'cap', "l'esborra d'un clic");
}

console.log("\n4 · L'Àlvar la deixa preparada");
{
  const reg = memoria();
  ok(await gestiona('PUT', 'maria@exemple.cat', 'Bearer curt', F, ENV, reg) === null, 'sense el testimoni bo, res');
  ok(await gestiona('PUT', 'maria@exemple.cat', BE, F, { IA_CIERRE_TOKEN: 'curt' }, reg) === null, 'amb un testimoni massa curt a Netlify, res');
  ok((await gestiona('PUT', 'ningú', BE, F, ENV, reg)).estat === 'error', 'sense dir per a qui, error');
  ok((await gestiona('PUT', 'Maria@Exemple.cat', BE, F, ENV, reg)).estat === 'desada', 'la carrega per al seu correu');
  ok((await client({ sessio: MARIA }, ENV, reg)).fitxa.casa === 'Escuela', 'i ella la troba quan entra');
  ok((await gestiona('GET', 'maria@exemple.cat', BE, {}, ENV, reg)).fitxa.casa === 'Escuela', 'la pot llegir abans de la sessió');
  ok((await gestiona('DELETE', 'maria@exemple.cat', BE, {}, ENV, reg)).estat === 'esborrada' && !reg.m.size, 'i esborrar-la');
}

console.log('\n5 · Per la xarxa');
{
  const r = await handler({ httpMethod: 'GET', headers: {}, queryStringParameters: { per: 'maria@exemple.cat' } });
  ok(r.statusCode === 404, 'GET sense testimoni: 404, com si no hi fos');
  const p = await handler({ httpMethod: 'POST', headers: {}, body: '{}' });
  ok(p.statusCode === 401 && p.headers['Cache-Control'] === 'no-store', 'POST sense sessió: 401, i res a la memòria cau');
}

console.log('\n' + pass + ' bé, ' + fail + ' malament');
if (fail) process.exit(1);
