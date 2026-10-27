/* «Leemos tu web» · provat sense xarxa
   ─────────────────────────────────────────────────────────────────────────
   `netlify/functions/llegeix-web-background.mjs` amb una web falsa, un
   resolutor de noms fals i un registre en memòria. El que es prova:

   · Sense sessió o sense el sí, no es llegeix res; el sí queda desat amb la data.
   · Només aquell lloc i el que robots.txt deixa; mai una adreça interna (IP,
     nom local o un nom que resol a una xarxa privada), tampoc en una redirecció.
   · La foto surt en el format `sos-foto-web` v1: títol, descripció, H1, text,
     lloc al menú; sense correus ni telèfons.
   · Com a molt tres lectures al dia, i la pàgina la llegeix amb fitxa.mjs.
   · El pas 'pagines' de pule-mapa: a qui va cada pàgina, i el que no diu. */
import { llegeixWeb, segur, hostBo, privada, web, menuDe, foto, clau, MAX_PAGINES, handler } from '../../netlify/functions/llegeix-web-background.mjs';
import { client as fitxa } from '../../netlify/functions/fitxa.mjs';
import { pule, neteja, valida, text, ESQUEMA } from '../../netlify/functions/pule-mapa.mjs';
import { idDe } from '../../netlify/functions/proposta.mjs';
import { sessio } from '../../netlify/functions/identitat.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const ENV = { ANTHROPIC_API_KEY: 'sk-ant-api03-' + 'x'.repeat(40), IA_CIERRE_TOKEN: 't'.repeat(32) };
const memoria = () => { const m = new Map(); return { m, get: async k => (m.has(k) ? JSON.parse(m.get(k)) : null), set: async (k, v) => { m.set(k, JSON.stringify(v)); }, del: async k => { m.delete(k); } }; };
const MARIA = sessio({ via: 'correu', id: idDe('maria@exemple.cat'), nom: 'María', mail: 'maria@exemple.cat' }, ENV);

/* La web falsa d'una escola: portada amb menú, dues pàgines, una de tancada per robots i una que porta fora. */
const pag = (titol, cos) => '<!doctype html><html lang="es"><head><title>' + titol + '</title><meta name="description" content="Desc ' + titol + '"></head><body>'
  + '<nav><a href="/">Inicio</a><a href="/cursos/">Cursos</a><a href="/contacto">Contacto</a><a href="https://fora.example/x">Fuera</a></nav>' + cos + '</body></html>';
const WEB = {
  'https://escuela.example/robots.txt': { ct: 'text/plain', cos: 'User-agent: *\nDisallow: /privado\n' },
  'https://escuela.example/sitemap.xml': { status: 404, ct: 'text/html', cos: '' },
  'https://escuela.example/': { cos: pag('Escuela ELE', '<h1>Formamos profesores de español</h1><p>Escríbenos a info@escuela.example o al 612 345 678.</p><a href="/privado/notas">Notas</a><a href="/salta">Salta</a><img src="/foto.jpg" alt="Una clase">') },
  'https://escuela.example/cursos': { cos: pag('Cursos', '<h1>Cursos FELE 2027</h1><p>Intensivos y extensivos.</p>') },
  'https://escuela.example/contacto': { cos: pag('Contacto', '<h1>Contacto</h1><p>Ven a vernos.</p>') },
  'https://escuela.example/salta': { status: 301, loc: 'http://10.0.0.5/admin' },
  'https://escuela.example/privado/notas': { cos: pag('Notas', '<h1>No</h1>') }
};
const web0 = () => {
  const vistes = [];
  const f = async (url) => {
    vistes.push(url);
    const k = url.replace(/\/$/, '') === 'https://escuela.example' ? 'https://escuela.example/' : url.replace(/\/$/, ''), r = WEB[k] || WEB[url];
    if (!r) return { status: 404, url, headers: { get: () => 'text/html' }, text: async () => '' };
    return { status: r.status || 200, url, headers: { get: h => (/content-type/i.test(h) ? r.ct || 'text/html; charset=utf-8' : /location/i.test(h) ? r.loc || null : null) }, text: async () => r.cos || '' };
  };
  f.vistes = vistes; return f;
};
const DNS = { 'escuela.example': ['93.184.216.34'], 'fora.example': ['93.184.216.35'], 'interna.example': ['192.168.1.10'] };
const resol = async h => DNS[h] || [];
const RAPID = { espera: 0, dormir: async () => {} };

console.log("\n1 · On es pot anar");
ok(hostBo('escuela.example') && !hostBo('localhost') && !hostBo('10.0.0.5') && !hostBo('[::1]') && !hostBo('intranet') && !hostBo('nas.local') && !hostBo('x.internal'), 'cap IP, cap nom local, cap nom sense punt');
ok(privada('127.0.0.1') && privada('10.1.2.3') && privada('172.20.0.1') && privada('192.168.0.1') && privada('169.254.169.254') && privada('::1') && privada('fd00::1') && privada('100.64.0.1') && !privada('93.184.216.34'), 'les adreces privades, de bucle i de metadades, es reconeixen');
{
  const f = web0(), s = segur(f, resol);
  let e1 = null; try { await s('https://interna.example/'); } catch (e) { e1 = e.message; }
  let e2 = null; try { await s('http://10.0.0.5/admin'); } catch (e) { e2 = e.message; }
  let e3 = null; try { await s('https://escuela.example:8080/'); } catch (e) { e3 = e.message; }
  ok(e1 && e2 && e3 && !f.vistes.length, 'un nom que resol a una xarxa privada, una IP o un port estrany: no es demana');
}
ok(web('escuela.example').href === 'https://escuela.example/' && web('ftp://x.example') === null && web('localhost:3000') === null, "l'adreça que escriu, amb https si no el posa");
ok(menuDe(WEB['https://escuela.example/'].cos, 'https://escuela.example/').join() === '/,/cursos,/contacto', 'el menú, en ordre i sense el que porta fora');

console.log("\n2 · Amb la seva sessió i el seu sí");
{
  const reg = memoria(), f = web0();
  ok((await llegeixWeb({ web: 'escuela.example', si: true }, ENV, reg, f, new Date(), resol)).estat === 'identifica' && !f.vistes.length, 'sense sessió, res');
  ok((await llegeixWeb(Object.assign({ sessio: MARIA, web: 'escuela.example' }, RAPID), ENV, reg, f, new Date(), resol)).estat === 'error' && !f.vistes.length, 'sense el sí, res');
  ok((await llegeixWeb(Object.assign({ sessio: MARIA, web: 'localhost', si: true }, RAPID), ENV, reg, f, new Date(), resol)).estat === 'error' && !f.vistes.length, 'una adreça interna, ni la prova');
  const r = await llegeixWeb(Object.assign({ sessio: MARIA, web: 'https://escuela.example/', si: true }, RAPID), ENV, reg, f, new Date('2026-10-27T08:00:00Z'), resol);
  ok(r.estat === 'fet' && r.pagines === 3, 'llegeix les tres pàgines obertes del lloc');
  ok(!f.vistes.some(u => /privado|fora\.example|10\.0\.0\.5/.test(u)), 'ni la carpeta tancada per robots, ni el lloc de fora, ni la redirecció a una IP interna');
  ok(f.vistes[0] === 'https://escuela.example/robots.txt', 'el primer és robots.txt');
  const Lf = JSON.parse(reg.m.get(clau(idDe('maria@exemple.cat')))).foto.fora;
  ok(Array.isArray(Lf) && Lf.includes('/privado/notas') && Lf.includes('/salta') && !Lf.some(r => /fora\.example|10\.0\.0\.5|^\/cursos$/.test(r)), 'les adreces del lloc que no hem llegit, com a rutes (per al 301 del generador)');
  const L = JSON.parse(reg.m.get(clau(idDe('maria@exemple.cat'))));
  ok(L.si && L.si.data === '2026-10-27T08:00:00.000Z' && L.si.domini === 'escuela.example', 'el sí queda desat amb la data i el domini');
  const F = L.foto, p0 = F.pagines[0];
  ok(F.tipus === 'sos-foto-web' && F.v === 1 && F.origen === 'https://escuela.example' && F.data === '2026-10-27', 'la foto és sos-foto-web v1, amb l\'origen i la data');
  ok(p0.url === '/' && p0.titol === 'Escuela ELE' && p0.descripcio === 'Desc Escuela ELE' && p0.h1 === 'Formamos profesores de español' && p0.menu === 0, 'cada pàgina: adreça, títol, descripció, H1 i lloc al menú');
  ok(F.pagines.find(p => p.url === '/cursos').menu === 1 && F.pagines.find(p => p.url === '/contacto').menu === 2, 'el menú dona l\'estructura');
  ok(!/info@escuela|612 345 678/.test(JSON.stringify(F)), 'sense correus ni telèfons al text');
  ok(p0.imatges[0].src === 'https://escuela.example/foto.jpg' && p0.imatges[0].alt === 'Una clase', 'les imatges, com a referència (camp opcional)');
  const l = await fitxa({ sessio: MARIA, foto: true }, ENV, reg);
  ok(l.estat === 'foto' && l.lectura.estat === 'fet' && l.lectura.foto.pagines.length === 3, 'la pàgina la llegeix amb la seva sessió (fitxa.mjs)');
  const altra = sessio({ via: 'github', id: 'gh:9', nom: 'Otra' }, ENV);
  ok((await fitxa({ sessio: altra, foto: true }, ENV, reg)).estat === 'cap', 'una altra persona no la veu');
  await llegeixWeb(Object.assign({ sessio: MARIA, web: 'escuela.example', si: true }, RAPID), ENV, reg, web0(), new Date('2026-10-27T09:00:00Z'), resol);
  await llegeixWeb(Object.assign({ sessio: MARIA, web: 'escuela.example', si: true }, RAPID), ENV, reg, web0(), new Date('2026-10-27T10:00:00Z'), resol);
  const f4 = web0(), r4 = await llegeixWeb(Object.assign({ sessio: MARIA, web: 'escuela.example', si: true }, RAPID), ENV, reg, f4, new Date('2026-10-27T11:00:00Z'), resol);
  ok(r4.estat === 'error' && !f4.vistes.length, 'com a molt tres lectures al dia');
  const L4 = (await fitxa({ sessio: MARIA, foto: true }, ENV, reg)).lectura;
  ok(L4.rebuig && /mañana/i.test(L4.rebuig.motiu) && L4.estat === 'fet' && L4.foto.pagines.length === 3, 'el «no» queda desat perquè la pàgina el vegi, sense perdre la lectura d\'abans');
  ok((await fitxa({ sessio: MARIA, esborra: true }, ENV, reg)).estat === 'esborrada' && !reg.m.size, 'esborrar la seva fitxa esborra també la foto');
  ok(MAX_PAGINES === 12, 'un tope de pàgines');
}
{
  const reg = memoria();
  await reg.set(clau(idDe('maria@exemple.cat')), { estat: 'llegint', inici: '2026-10-27T08:00:00.000Z' });
  const f = web0(), r = await llegeixWeb(Object.assign({ sessio: MARIA, web: 'escuela.example', si: true }, RAPID), ENV, reg, f, new Date('2026-10-27T08:05:00Z'), resol);
  ok(r.estat === 'llegint' && !f.vistes.length, 'si ja la llegim, no se’n comença una altra');
  const h = await handler({ httpMethod: 'POST', headers: {}, body: JSON.stringify({ web: 'escuela.example', si: true, espera: 99999 }) });
  ok(h.statusCode === 202, 'per la xarxa, 202 de seguida (funció de fons)');
}

console.log("\n3 · A qui va cada pàgina (pule-mapa, pas 'pagines')");
{
  const d = neteja({ casa: 'Escuela', alrededor: [{ quien: 'Futuros profesores', meDa: 'matrículas', leDoy: 'el curso' }, { quien: 'Academias', meDa: 'ofertas de trabajo', leDoy: 'profesores' }],
    pagines: [{ url: '/', titol: 'Escuela ELE', h1: 'Formamos profesores', text: 'x'.repeat(900) }, { url: '/cursos', titol: 'Cursos', h1: 'Cursos FELE' }] });
  ok(d.pagines.length === 2 && d.pagines[0].text.length === 300, 'les pàgines arriben netes i curtes');
  ok(text(d).includes('Las páginas de su web de hoy') && text(d).includes('/cursos · Cursos · Cursos FELE'), 'dins de <dades>, amb el títol i el H1');
  const v = valida('pagines', { pagines: [{ url: '/', quien: 'futuros profesores', porque: 'Es la puerta' }, { url: '/inventada', quien: 'Academias', porque: '' }, { url: '/cursos', quien: 'Nadie', porque: 'Para todos' }, { url: '/', quien: 'Academias', porque: 'repetida' }],
    falta: [{ quien: 'Academias', falta: 'Que pueden contratar a los graduados' }, { quien: 'Otro', falta: 'x' }, { quien: 'Academias', falta: 'repetida' }] }, d);
  ok(v.pagines.length === 2 && v.pagines[0].quien === 'Futuros profesores' && v.pagines[1].quien === '', 'cada pàgina que existeix, una vegada, amb qui és com al dibuix (o ningú)');
  ok(v.falta.length === 1 && v.falta[0].quien === 'Academias', 'el que falta, només per a qui és al dibuix, una vegada');
  ok(ESQUEMA.pagines && ESQUEMA.pagines.properties.falta, 'amb el seu esquema');
  const ses = MARIA, reg = memoria();
  const r0 = await pule({ sessio: ses, pas: 'pagines', dades: { casa: 'Escuela', alrededor: d.alrededor } }, ENV, reg, async () => { throw new Error('no'); });
  ok(r0.estat === 'error' && /leemos tu web/i.test(r0.motiu), 'sense haver llegit la web, primer la llegim');
  let cos = null;
  const f = async (u, o) => { cos = JSON.parse(o.body); return { ok: true, status: 200, json: async () => ({ model: 'claude-opus-5-5', stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 300 },
    content: [{ type: 'text', text: JSON.stringify({ pagines: [{ url: '/', quien: 'Futuros profesores', porque: 'Es su puerta' }], falta: [{ quien: 'Academias', falta: 'Que pueden contratar' }] }) }] }) }; };
  const r = await pule({ sessio: ses, pas: 'pagines', dades: { casa: 'Escuela', alrededor: d.alrededor, pagines: d.pagines } }, ENV, reg, f);
  ok(r.estat === 'fet' && r.resultat.pagines[0].quien === 'Futuros profesores' && r.resultat.falta[0].quien === 'Academias', 'una volta: a qui va cada pàgina i el que falta');
  ok(cos.output_config.format.schema === undefined ? false : JSON.stringify(cos.output_config.format.schema).includes('falta'), 'amb l\'esquema del pas');
  ok(r.voltes === 1, 'dins del mateix tope per persona');
  const r2 = await pule({ sessio: ses, pas: 'mapa', dades: { casa: 'Escuela', alrededor: d.alrededor, pagines: d.pagines } }, ENV, reg, async (u, o) => { cos = JSON.parse(o.body); return { ok: false, status: 500, json: async () => ({}) }; });
  ok(!cos.messages[0].content.includes('Las páginas de su web'), 'als altres passos, les pàgines no hi van');
}

console.log('\n' + pass + ' bé, ' + fail + ' malament');
if (fail) process.exit(1);
