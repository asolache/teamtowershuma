/* La pàgina per al lead · el x % del seu mapa abans de la visita
 * ─────────────────────────────────────────────────────────────
 * `proposta.js --lead` escriu `lead.html` amb la xifra d'`automatitza.js` i el
 * dibuix de la landing. Sense `--revisat` és un esborrany intern sense botó; amb
 * `--revisat`, només d'un `mapa.json` que passa. La pàgina no porta JavaScript
 * ni res de fora, i si porta un correu, un telèfon, un import o vuit paraules
 * seguides de la web, no s'escriu. La carpeta del lead va fora del repositori.
 *
 *   node SOS/tests/test-pagina-lead.mjs
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, symlinkSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const DIR = dirname(fileURLToPath(import.meta.url)), TOOLS = join(DIR, '..', 'tools');
const req = createRequire(import.meta.url);
const L = req('../tools/pagina-lead.js'), X = req('../tools/automatitza.js');
let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log(`  ${c ? '✓' : '✗'} ${m}`); };

const WEB = `<!DOCTYPE html><html lang="ca"><head><title>Celler de Prova</title>
<meta name="description" content="Fem vins de vinyes velles i els expliquem a qui ve al poble a tastar-los.">
<style>body{font-family:Georgia,serif}h1{color:#7a1f3d}</style></head><body><h1>Celler de Prova</h1>
<p>Al celler rebem visitants cada dissabte i els expliquem com treballem la vinya vella del costat del riu.</p>
<p>Els distribuïdors fan la comanda per correu i el visitant compra a la botiga del poble.</p></body></html>`;
const ex = spawnSync(process.execPath, [join(TOOLS, 'revisa-mapa.js'), '--exemple'], { encoding: 'utf8' }).stdout;

const dir = mkdtempSync(join(tmpdir(), 'tt-lead-'));
mkdirSync(join(dir, 'fuentes'));
writeFileSync(join(dir, 'fuentes', 'index.html'), WEB);
const proposta = (...x) => spawnSync(process.execPath, [join(TOOLS, 'proposta.js'), ...x], { encoding: 'utf8' });
const corre = (...x) => proposta(dir, '--llengua', 'ca', '--nom', 'Celler de Prova', ...x);
const f = r => (existsSync(join(dir, r)) ? readFileSync(join(dir, r), 'utf8') : '');

console.log('\nL\'esborrany intern');
{
  const r = corre('--lead', '--revisat');
  ok(r.status === 4 && /mapa\.json/.test(r.stderr) && !f('lead.html'), 'amb --revisat i només l\'esbós, no s\'escriu: l\'esbós no s\'envia');
  const r2 = corre('--lead');
  const h = f('lead.html');
  ok(r2.status === 3 && /ESBORRANY INTERN/.test(h) && !h.includes(L.VISITA), 'sense --revisat: diu ESBORRANY INTERN i no porta botó');
  ok(/Estimació · esborrany/.test(h) && /un esbós del mapa, sense cap model d'IA/.test(h), 'de l\'esbós: el segell d\'estimació, i «com s\'ha fet» diu que no hi ha cap model');
}

console.log('\nLa pàgina revisada');
writeFileSync(join(dir, 'mapa.json'), ex);
{
  const r = corre('--lead', '--revisat');
  const h = f('lead.html'), aut = X.mesura(JSON.parse(ex));
  ok(r.status === 0 && h && !/ESBORRANY INTERN/.test(h), 'amb mapa.json que passa i --revisat: la pàgina, sense l\'avís intern');
  ok(h.includes(`Dels ${aut.total} lliuraments de la teva xarxa, el sistema en pot preparar ${aut.maquina}; ${aut.visita} els decidim a la visita.`),
    `la xifra és la d'automatitza.js: ${aut.maquina} de ${aut.total}, ${aut.visita} a la visita`);
  const ref = JSON.parse(f('lead.json')).ref;
  ok(/^[A-Za-z0-9_-]{16}$/.test(ref) && h.includes(L.VISITA + '?r=' + ref + '&amp;l=ca&amp;m=si') && h.includes('&amp;m=no'), 'els dos botons van a /visita/ amb la referència aleatòria de la pàgina');
  corre('--lead', '--revisat');
  ok(JSON.parse(f('lead.json')).ref === ref, 'regenerar-la no canvia l\'enllaç');
  ok((h.match(/<path class="mv-f"[^>]*data-qui="maquina"/g) || []).length === aut.maquina && /\.mv-f\[data-qui=maquina\]\{stroke-width/.test(h), 'el mapa dibuixat, amb les fletxes de la màquina marcades');
  ok(['t-sistema', 't-teu', 't-visita', 't-com'].every(id => h.includes(`id="${id}"`)) && /Factura o cobrament|Comanda o repartiment/.test(h), 'les seccions: el que prepara el sistema (amb el tipus), el que és teu, la visita i com s\'ha fet');
  ok(/<h3>Tres preguntes per a la visita<\/h3>\n<ol>(<li>[^<]+<\/li>){3}<\/ol>/.test(h), 'les tres preguntes més greus del diagnòstic');
  ok(/Amb això es va escriure el mapa/.test(h) && /el va revisar abans d'enviar-te'l/.test(h) && /no crida cap model d'IA i no compta visites ni clics/.test(h)
    && h.includes('https://teamtowershuma.com/SOS/ia.html') && h.includes('avis-legal.html#navegador'), '«com s\'ha fet»: el que ha fet la IA, que la pàgina no crida cap model ni compta res, i els enllaços');
  ok(/<details>\n<summary>Continua amb el teu Claude<\/summary>/.test(h) && h.includes('&quot;abast&quot;'), 'el bloc per continuar amb el seu Claude, amb el mapa');
  ok(L.comprova(h, { revisat: true, fonts: [{ nom: 'index.html', cos: WEB }] }).length === 0, 'la pàgina que surt passa les seves pròpies comprovacions');
  ok(/Vam partir d'1 font:/.test(h) && !/robots\.txt/.test(h), 'sense constància de la lectura, diu de quantes fonts surt (apostrofat) i no promet robots.txt');
  const lec = x => { writeFileSync(join(dir, 'fuentes', '.lectura.json'), typeof x === 'string' ? x : JSON.stringify(x)); corre('--lead', '--revisat'); return f('lead.html'); };
  const bona = { data: '2026-10-01', domini: 'celler.example', pagines: 1, fitxers: ['index.html'], fora: 0 };
  const h2 = lec(bona);
  ok(/Vam llegir 1 pàgina de la teva web pública l'1\/10\/2026, amb el teu permís, respectant el robots\.txt/.test(h2) && /Llegit d'1 pàgina/.test(h2),
    'amb fuentes/.lectura.json (la deixa la baixada), diu quantes pàgines es van llegir i quan');
  const dolentes = { 'zero pàgines': { ...bona, pagines: 0, fitxers: [] }, 'sense data': { ...bona, data: undefined }, 'JSON trencat': '{ "pagines": 1,',
    'un fitxer que ja no hi és': { ...bona, fitxers: ['antiga.html'] }, 'més pàgines que fitxers': { ...bona, pagines: 7 }, 'sense la llista de fitxers': { ...bona, fitxers: undefined } };
  ok(Object.entries(dolentes).every(([, x]) => { const hx = lec(x); return /Vam partir d'1 font:/.test(hx) && !/robots\.txt/.test(hx); }),
    'una lectura que no lliga amb les fonts (' + Object.keys(dolentes).join(', ') + ') no es creu');
  rmSync(join(dir, 'fuentes', '.lectura.json'));
}

console.log('\nEl que fa que no s\'escrigui');
{
  const h = f('lead.html'), fonts = [{ nom: 'index.html', cos: WEB }];
  const amb = x => h.replace('</main>', '<p>' + x + '</p></main>');
  ok(L.comprova(h.replace('</body>', '<script>x()</script></body>'), { revisat: true }).some(x => /script/.test(x)), 'un <script>');
  ok(L.comprova(h.replace('<body>', '<body><img src="https://pixel.example/x.gif">'), { revisat: true }).some(x => /carrega/.test(x)), 'una imatge de fora (un píxel)');
  ok(L.comprova(h.replace('</style>', 'b{background:url(https://x.example/a.png)}</style>'), { revisat: true }).some(x => /url\(\)/.test(x)), 'un url() de fora al CSS');
  ok(L.comprova(amb('escriu a hola@celler.example'), { revisat: true }).some(x => /correu/.test(x)), 'un correu');
  ok(L.comprova(amb('truca al 600 111 222'), { revisat: true }).some(x => /telèfon/.test(x)), 'un telèfon');
  ok(L.comprova(amb('la visita val 25 €'), { revisat: true }).some(x => /import/.test(x)), 'un import');
  ok(L.comprova(amb('rebem visitants cada dissabte i els expliquem com treballem'), { revisat: true, fonts }).some(x => /cita la web/.test(x)), 'vuit paraules seguides de la web');
  ok(L.comprova(amb('Fem vins de vinyes velles i els expliquem a qui ve'), { revisat: true, fonts }).some(x => /cita la web/.test(x)), 'vuit paraules de la meta description de la web');
  const alt = [{ nom: 'a.html', cos: '<img alt="La verema la fem a mà amb tota la colla del poble">' }];
  ok(L.comprova(amb('La verema la fem a mà amb tota la colla'), { revisat: true, fonts: alt }).some(x => /cita la web/.test(x)), 'vuit paraules de l\'alt d\'una imatge');
  const ent = [{ nom: 'b.html', cos: '<p>Obrim el celler cada s&aacute;bado i l&#8217;ermita del costat tamb&eacute; es visita</p>' }];
  ok(L.comprova(amb('Obrim el celler cada sábado i l’ermita del costat també'), { revisat: true, fonts: ent }).some(x => /cita la web/.test(x)), 'una font amb entitats (s&aacute;bado, &#8217;) no amaga la cita');
  const cita = (frase, cos) => L.comprova(amb(frase), { revisat: true, fonts: [{ nom: 'c.html', cos }] }).some(x => /cita la web/.test(x));
  ok(cita('Somos una bodega familiar. ¿Quieres probar nuestros vinos este sábado?', '<p>Somos una bodega familiar. &iquest;Quieres probar nuestros vinos este s&aacute;bado?</p>')
    && cita('Al carrer Major nº 5 rebem visitants cada dissabte al matí', '<p>Al carrer Major n&ordm; 5 rebem visitants cada dissabte al mat&iacute;</p>')
    && cita('Obrim el celler cada dissabte i ho expliquem tot amb calma', '<p>Obrim el celler cada dissabte i ho &xyzzy;expliquem tot amb calma</p>'),
    'les entitats que no hi eren (&iquest;, &ordm;) i les desconegudes no amaguen la cita');
  ok(cita('Cada dissabte obrim el celler i expliquem com treballem la vinya', '<h2><span>C</span><span>a</span><span>d</span><span>a</span> <span>d</span><span>i</span><span>s</span><span>s</span><span>a</span><span>b</span><span>t</span><span>e</span> obrim el celler i expliquem com treballem la vinya</h2>')
    && cita('Cada dissabte obrim el celler i expliquem com treballem la vinya', '<p>Cada dissabte obrim el celler i explique\u00admos com treballem la vinya</p>'.replace('explique\u00admos', 'expli\u00adquem')),
    'un títol amb cada lletra en un <span>, o un guionet opcional, no amaguen la cita');
  ok(L.comprova(h.replace('</pre>', '\\nrebem visitants cada dissabte\\ni els expliquem com treballem\\nla vinya</pre>'), { revisat: true, fonts }).some(x => /cita la web/.test(x)),
    'al bloc del mapa, una cita partida en línies curtes (\\n) es veu');
  ok(['truca al (93) 892 12 34', 'truca al 938\u00a0921\u00a0234', 'truca al 93/892 12 34'].every(x => L.comprova(amb(x), { revisat: true }).some(y => /telèfon/.test(y))),
    'un telèfon amb parèntesis, amb espais durs o amb barra');
  ok(['la visita val 35euros', 'la caixa surt a 120EUR', 'la caixa surt a 120  €'].every(x => L.comprova(amb(x), { revisat: true }).some(y => /import/.test(y))),
    'un import enganxat a «euros» o «EUR», o amb dos espais');
  ok(L.comprova(amb('reserves a hola@cellerdelpenedès.cat'), { revisat: true }).some(x => /correu/.test(x)), 'un correu amb accents al domini');
  ok(L.comprova(h, { revisat: true }).length === 0, 'i la pàgina de debò, amb dates, xifres i el mapa, no en salta cap');
  ok(L.comprova(amb('el curs 2026-2027</p><p>7 rols'), { revisat: true }).length === 0 && L.comprova(amb('fins al 31/12/2026</p><p>12 rols'), { revisat: true }).length === 0,
    'unes xifres de dos elements (un any i el nombre de rols) no fan un telèfon');
  ok(L.comprova(h.replace('<meta name="robots" content="noindex, nofollow">', ''), { revisat: true }).some(x => /noindex/.test(x)), 'sense noindex');
  writeFileSync(join(dir, 'marca.json'), JSON.stringify({ lema: 'x' }));
  const m = JSON.parse(ex); m.parells[0] = m.parells[0].replace('el vi, la verema i el celler obert', 'escriu a vi@celler.example');
  writeFileSync(join(dir, 'mapa.json'), JSON.stringify(m));
  const r = corre('--lead', '--revisat');
  ok(r.status === 4 && /correu/.test(r.stderr) && !existsSync(join(dir, 'lead.html')), 'si no passa, no s\'escriu i la d\'abans s\'esborra');
  writeFileSync(join(dir, 'mapa.json'), ex);
}

console.log('\nEn castellà');
{
  const corre2 = (...x) => proposta(dir, '--llengua', 'es', '--nom', 'Celler de Prova', ...x);
  const r = corre2('--lead', '--revisat');
  ok(r.status === 4 && /preguntas-visita\.md/.test(r.stderr), 'revisada en castellà, demana preguntas-visita.md: les del diagnòstic surten en català');
  writeFileSync(join(dir, 'preguntas-visita.md'), '# Preguntas\n\n1. ¿Quién confirma las visitas?\n2. ¿Qué pide el distribuidor cada mes?\n3. ¿Qué cuenta el pueblo de vosotros?\n4. Sobra\n');
  const r2 = corre2('--lead', '--revisat'), h = f('lead.html');
  ok(r2.status === 0 && /<html lang="es">/.test(h) && /el sistema puede preparar/.test(h) && /Pedido o reparto/.test(h) && /Reservemos la visita/.test(h), 'la pàgina en castellà, amb els tipus en castellà');
  ok(/<li>¿Quién confirma las visitas\?<\/li>/.test(h) && !/Sobra/.test(h), 'les preguntes de qui revisa, tres com a màxim');
  ok(X.ENTREGABLES.every(t => L.TIPUS_ES[t.id]), 'cada tipus d\'entregable de l\'app té nom en castellà');
  writeFileSync(join(dir, 'preguntas-visita.md'), '# Preguntas\r\n\r\n- ¿Quién abre el celler los domingos?\r\n* ¿Quién lleva la tienda?\r\n3) ¿Quién habla con el ayuntamiento?\r\n');
  const r3 = corre2('--lead', '--revisat'), h3 = f('lead.html');
  ok(r3.status === 0 && /<ol><li>¿Quién abre el celler los domingos\?<\/li><li>¿Quién lleva la tienda\?<\/li><li>¿Quién habla con el ayuntamiento\?<\/li><\/ol>/.test(h3),
    'preguntas-visita.md amb guions, asteriscs i finals de línia de Windows');
  writeFileSync(join(dir, 'preguntas-visita.md'), '1. ¿Quién abre el celler?\n   - nota interna: preguntar al enólogo\n* * *\n2. ¿Quién lleva la tienda?\n3. ¿Quién habla con el ayuntamiento?\n');
  const r5 = corre2('--lead', '--revisat'), h5 = f('lead.html');
  ok(r5.status === 0 && /<ol><li>¿Quién abre el celler\?<\/li><li>¿Quién lleva la tienda\?<\/li><li>¿Quién habla con el ayuntamiento\?<\/li><\/ol>/.test(h5) && !/nota interna/.test(h5),
    'un guió sagnat és una nota de qui revisa i no surt, ni una ratlla «* * *»');
  writeFileSync(join(dir, 'preguntas-visita.md'), '1.- ¿Quién confirma las visitas de grupo?\n - ¿Qué os pide el distribuidor cada mes?\n');
  const r6 = corre2('--lead', '--revisat'), h6 = f('lead.html');
  ok(r6.status === 0 && /<h3>Dos preguntas para la visita<\/h3>\n<ol><li>¿Quién confirma las visitas de grupo\?<\/li><li>¿Qué os pide el distribuidor cada mes\?<\/li><\/ol>/.test(h6),
    '«1.-» i un guió amb un sol espai davant compten, i el títol diu quantes preguntes hi ha');
  for (const [buit, com] of [['# Preguntas\n\nYa las pondré.\n', 'sense preguntes'], ['# Preguntas\n\n1.  \n2. \u00a0\n-  \n', 'amb números sols']]) {
    writeFileSync(join(dir, 'preguntas-visita.md'), buit);
    const r4 = corre2('--lead', '--revisat');
    ok(r4.status === 4 && /no té cap pregunta/.test(r4.stderr) && !existsSync(join(dir, 'lead.html')), 'un preguntas-visita.md ' + com + ' atura --revisat');
  }
  rmSync(join(dir, 'preguntas-visita.md'));
}

console.log('\nLa carpeta i la referència');
{
  corre('--lead');
  const abans = f('lead.json'), html = f('lead.html'), ana = f('analisis.json');
  const r0 = corre('--lead', '--nom', 'Un altre celler');
  ok(r0.status === 4 && /és de «Celler de Prova»/.test(r0.stderr) && f('lead.json') === abans && f('lead.html') === html && f('analisis.json') === ana,
    'la carpeta d\'un altre negoci: surt amb 4 i no toca res, ni la referència ni la pàgina de l\'altre');
  writeFileSync(join(dir, 'lead.json'), JSON.stringify({ ref: JSON.parse(abans).ref, nom: 'Una altra casa', revisat: true }));
  const r1 = proposta(dir, '--llengua', 'ca', '--lead');
  ok(r1.status === 4 && /és de «Una altra casa»/.test(r1.stderr) && f('lead.html') === html && f('analisis.json') === ana, 'sense --nom, en una carpeta lligada a un altre negoci, tampoc no es toca res');
  const rb = proposta(dir, '--llengua', 'ca', '--nom', 'Bodega Otra', '--baixa', 'https://bodega-otra.example/', '--autoritzat', 'bodega-otra.example');
  ok(rb.status === 4 && /és de «Una altra casa»/.test(rb.stderr) && f('analisis.json') === ana, 'a la carpeta d\'un lead amb la pàgina revisada no s\'hi baixa la web d\'un altre: surt amb 4 abans de demanar res');
  writeFileSync(join(dir, 'lead.json'), abans.replace(/\}\s*$/, ',}'));
  const rj = corre('--lead', '--revisat');
  ok(rj.status === 4 && /lead\.json no es pot llegir/.test(rj.stderr) && f('lead.html') === html, 'un lead.json trencat no fa una referència nova: surt amb 4 i diu què arreglar');
  writeFileSync(join(dir, 'lead.json'), abans);
  ok(corre('--lead', '--revisat', '--nom', 'celler  de PROVA').status === 0 && JSON.parse(f('lead.json')).ref === JSON.parse(abans).ref, 'el mateix nom amb altres majúscules o espais és el mateix negoci');
  const d2 = mkdtempSync(join(tmpdir(), 'tt-lead2-'));
  mkdirSync(join(d2, 'fuentes'));
  writeFileSync(join(d2, 'fuentes', 'index.html'), WEB);
  writeFileSync(join(d2, 'mapa.json'), ex);
  const r2a = proposta(d2, '--llengua', 'ca', '--nom', 'Escriu a vi@celler.example', '--lead');
  ok(r2a.status === 4 && !existsSync(join(d2, 'lead.json')), 'si la pàgina no passa, lead.json no s\'escriu: el nom no queda fixat');
  proposta(d2, '--llengua', 'ca', '--nom', 'Celler de Porva', '--lead');
  const j1 = JSON.parse(readFileSync(join(d2, 'lead.json'), 'utf8'));
  const r2b = proposta(d2, '--llengua', 'ca', '--nom', 'Celler de Prova', '--lead', '--revisat');
  const j2 = JSON.parse(readFileSync(join(d2, 'lead.json'), 'utf8'));
  ok(!j1.revisat && r2b.status === 0 && j2.ref === j1.ref && j2.nom === 'Celler de Prova' && j2.revisat === true,
    'mentre només hi ha l\'esborrany intern, el nom es pot corregir i la referència es manté');
  const r2c = proposta(d2, '--llengua', 'ca', '--nom', 'Un altre celler', '--lead');
  ok(r2c.status === 4 && /corregeix «nom» a lead\.json/.test(r2c.stderr) && JSON.parse(readFileSync(join(d2, 'lead.json'), 'utf8')).nom === 'Celler de Prova',
    'després de la pàgina revisada, un altre nom no hi fa res, i la consola diu com canviar-lo si és el mateix negoci');
  rmSync(d2, { recursive: true, force: true });
  const ARREL = resolve(DIR, '..', '..');
  const dins = join(ARREL, 'tt-lead-prova-' + process.pid);
  const r = proposta(dins, '--llengua', 'ca', '--lead');
  ok(r.status === 4 && /dins del repositori/.test(r.stderr) && !existsSync(dins), 'una carpeta dins del repositori, que es publica: surt amb 4 i no escriu res');
  const enllac = join(tmpdir(), 'tt-enllac-' + process.pid), copia = mkdtempSync(join(tmpdir(), 'tt-copia-'));
  symlinkSync(ARREL, enllac);
  mkdirSync(join(copia, 'SOS', 'tools'), { recursive: true });
  writeFileSync(join(copia, 'SOS', 'tools', 'pagina-lead.js'), '');
  ok(L.dinsDelRepo(ARREL) && L.dinsDelRepo(join(ARREL, '..x')) && L.dinsDelRepo(join(enllac, 'leads', 'x')) && L.dinsDelRepo(join(copia, 'leads', 'x')) && !L.dinsDelRepo(dir),
    'dinsDelRepo: el repositori, el que hi ha a dins, un enllaç simbòlic que hi porta i una altra còpia del repositori; una carpeta de fora, no');
  unlinkSync(enllac);
  rmSync(copia, { recursive: true, force: true });
}

console.log('\nEl que diu la xifra');
{
  const aut = X.mesura(JSON.parse(ex)), visita = aut.lliuraments.filter(l => l.qui === 'visita').map(l => l.que);
  const amb = n => { const m = JSON.parse(ex); m.tipus = {}; visita.slice(0, n).forEach(q => { m.tipus[q] = 'comanda'; }); writeFileSync(join(dir, 'mapa.json'), JSON.stringify(m)); corre('--lead', '--revisat'); return f('lead.html'); };
  const h1 = amb(visita.length - 1), h0 = amb(visita.length);
  const mP = JSON.parse(ex); mP.tipus = {}; aut.lliuraments.filter(l => l.qui !== 'persona').forEach(l => { mP.tipus[l.que] = 'cobrament'; });
  writeFileSync(join(dir, 'mapa.json'), JSON.stringify(mP)); corre('--lead', '--revisat');
  const hP = f('lead.html');
  ok(/preparar 0\.<\/h1>/.test(hP) && /Cap en aquest mapa: el que hi ha són intangibles, cobraments i acords/.test(hP) && !/a la visita mirem quins ho poden ser/.test(hP),
    'amb res per al sistema i res per decidir, la secció del sistema no promet res per a la visita');
  ok(/el sistema en pot preparar \d+; 1 el decidim a la visita\./.test(h1), 'amb un sol lliurament per decidir: «1 el decidim»');
  ok(/el sistema en pot preparar \d+\.<\/h1>/.test(h0) && /Tots els lliuraments tenen un tipus conegut/.test(h0) && !/Encara no sabem quin entregable/.test(h0),
    'amb cap per decidir, la xifra no parla de la visita i la secció no diu que en falta cap');
  writeFileSync(join(dir, 'mapa.json'), ex);
}

console.log('\nL\'ordre ben escrit');
{
  ok(proposta(dir, '--lengua', 'es', '--lead').status === 2, 'una opció que no existeix (--lengua) surt amb 2');
  ok(proposta(dir, '--llengua').status === 2 && proposta(dir, '--nom', '--lead').status === 2, 'una opció sense valor surt amb 2');
  ok(proposta(dir, dir, '--lead').status === 2 && proposta(dir, '--llengua', 'en').status === 2, 'una carpeta de més o una llengua que no hi és surten amb 2');
  ok(proposta(dir, '--llengua', 'ca', '--lead', '--revisat').status === 2, '--revisat sense --nom surt amb 2: la pàgina porta el nom que es dona');
}

rmSync(dir, { recursive: true, force: true });
console.log(`\n${fail ? '❌' : '✅'} ${pass + fail} assercions, ${fail} vermelles`);
process.exit(fail ? 1 : 0);
