// Proves del bloc VS-IMPORTA (SOS/vna-suport.html) i de l'eina eines/importa.mjs, tal com surt al
// repositori del client. node SOS/tests/test-importa.mjs
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import http from 'node:http';

import { createRequire } from 'node:module';
const aqui = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(aqui, '..', 'vna-suport.html'), 'utf8'), b0 = html.indexOf('/*VS-IMPORTA*/'), b1 = html.indexOf('/*/VS-IMPORTA*/');
const bloc = html.slice(b0, b1 + '/*/VS-IMPORTA*/'.length) + '\n';
/* L'eina i el nucli, com surten al repositori del client (el mateix codi que l'editor). */
const WM = createRequire(import.meta.url)('../tools/web-del-mapa.js');
const repoClient = await WM.genera(new Function(WM.exemple.replace('const EXEMPLE =', 'return'))(), {});
const cli = repoClient.find(f => f.ruta === 'eines/importa.mjs').cos, nucli = repoClient.find(f => f.ruta === 'eines/nucli.mjs').cos;
/* webSlug, tal com és a VS-WEB. */
const WEBSLUG = "const webSlug = s => String(s).toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')\n  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'pagina';";
const EXPORTS = ['IMP_PERSONAL', 'amagaPersonal', 'htmlAText', 'sitemapUrls', 'robotsPermet', 'robotsSitemaps', 'llegeixCsv', 'csvAMd', 'fontMd', 'importaFonts', 'rastreja'];
const I = new Function(WEBSLUG + '\n' + bloc + '\nreturn { ' + EXPORTS.concat('columnaPersonal', 'IMP_TXT', 'robotsEspera').join(', ') + ' };')();
const { amagaPersonal, htmlAText, sitemapUrls, robotsPermet, robotsSitemaps, llegeixCsv, csvAMd, fontMd, importaFonts, rastreja, columnaPersonal, IMP_TXT, robotsEspera } = I;

let bons = 0, dolents = 0, grup = '';
const ok = (c, nom) => { if (c) bons++; else { dolents++; console.log('  ✗ [' + grup + '] ' + nom); } };
const G = nom => { grup = nom; };
const J = JSON.stringify;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/;

G('bloc');
{
  ok(bloc.startsWith('/*VS-IMPORTA*/\n') && bloc.trimEnd().endsWith('/*/VS-IMPORTA*/'), 'comença i acaba amb les marques');
  ok(bloc.split('/*VS-IMPORTA*/').length === 2 && bloc.split('/*/VS-IMPORTA*/').length === 2, 'una sola marca de cada');
  ok(!/<\/script|<!--/i.test(bloc), 'no trenca el <script> de l\'editor');
  ok(!/\?\.|\?\?|replaceAll|matchAll|\(\?<[=!]?[a-zA-Z]|\\p\{|\bimport\b|require\(|\bdocument\.|\bwindow\.|\bprocess\.|#[a-z]+\s*[=(;]/.test(bloc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/'(?:\\.|[^'\\])*'/g, "''")), 'ES2019, sense DOM, sense imports ni process');
  ok(!/[^.\w]fetch\(/.test(bloc), 'fetch només injectat');
  ok((bloc.match(/new Date\(/g) || []).length === 1 && /o\.ara \|\| new Date\(/.test(bloc), 'Date només si no hi ha ara');
  const sense = new Function(bloc + '\nreturn importaFonts;')();
  ok(sense([{ tipus: 'doc', font: 'Àrea Nova.md', nom: 'Àrea Nova.md', cos: 'Hola' }], { ara: '2026-10-10' }).fitxers[0].ruta === 'cerebro/fonts/docs/area-nova.md', 'sense webSlug (nucli.mjs) fa el mateix slug');
  const lin = bloc.split('\n').length;
  console.log('  bloc: ' + lin + ' línies');
}

G('columnes personals');
{
  ['Email', 'E-mail', 'Correu electrònic', 'correo', 'Telèfon', 'Teléfono', 'Mòbil', 'Tel.', 'Phone', 'Nom', 'Nombre', 'Name', 'Nom i cognoms', 'Nombre y apellidos', 'Cognoms', 'Apellidos',
    'First name', 'Last Name', 'Surname', 'DNI', 'NIF', 'NIE', 'Passaport', 'Adreça', 'Dirección', 'Address', 'IBAN', 'Compte', 'Cuenta bancaria', 'Data de naixement', 'Fecha de nacimiento',
    'Birth date', 'IP', 'Nom del client', 'Nombre del cliente', 'Cliente', 'Contacte'].forEach(c => ok(columnaPersonal(c), 'personal: ' + c));
  ['Nom del producte', 'Nombre del producto', 'Product name', 'Preu', 'Precio', 'Data', 'Tipus de client', 'Hotel', 'Quantitat', 'Descripció', 'Categoria', 'Nom de l\'empresa', 'Smartphone']
    .forEach(c => ok(!columnaPersonal(c), 'no personal: ' + c));
  ok(Array.isArray(I.IMP_PERSONAL) && I.IMP_PERSONAL.every(r => r instanceof RegExp), 'IMP_PERSONAL és una llista de regex');
}

G('amagaPersonal');
{
  const t = s => amagaPersonal(s).text;
  ok(t('Truca al +34 600 123 456 ara') === 'Truca al [telèfon] ara', '+34 600 123 456');
  ok(t('Tel. 938 12 34 56.') === 'Tel. [telèfon].', '938 12 34 56');
  ok(t('600123456') === '[telèfon]' && t('93 812 34 56') === '[telèfon]' && t('938-123-456') === '[telèfon]' && t('0034 938 123 456') === '[telèfon]', 'altres formats');
  ok(t('+44 20 7946 0958') === '[telèfon]', 'internacional');
  ok(t('Escriu a a@b.cat!') === 'Escriu a [correu]!' && t('info.vendes+x@empresa.com.es') === '[correu]', 'correus');
  ok(t('IBAN ES91 2100 0418 4502 0005 1332.') === 'IBAN [dada personal].' && t('ES9121000418450200051332') === '[dada personal]', 'IBAN');
  ok(t('DNI 12345678Z') === 'DNI [dada personal]' && t('NIE X1234567L') === 'NIE [dada personal]', 'DNI i NIE');
  const no = 'L\'any 2026 costa 25,50 € a 08720 Vilafranca; 1.250 €, 10:30 h, 12/10/2026, 2026-10-10, 3 de 5, C/ Major 12, 100 places, 900.000.000 €, ref. 12345';
  ok(t(no) === no, 'no es menja anys, preus, codis postals ni números curts');
  const r = amagaPersonal('a@b.cat, c@d.es, +34 600 123 456, 12345678Z');
  ok(r.correus === 2 && r.telefons === 1 && r.altres === 1, 'compta');
  ok(J(amagaPersonal(null)) === J({ text: '', correus: 0, telefons: 0, altres: 0 }), 'null');
}

G('htmlAText');
{
  const html = `<!doctype html><html lang="ca-ES"><head><title>Can Pere &middot; Forn</title>
    <meta name="description" content="Pa &amp; coques des de 1920"><style>body{color:red}</style><script>var x = "<p>no</p>";</script></head>
    <body><header class="site"><a href="/"><img src="/logo.png" alt="Logo"></a><nav><a href="/serveis">Serveis</a><a href="/contacte#form">Contacte</a></nav></header>
    <!-- comentari -->
    <main><article><header><h1>Benvinguts al forn</h1></header>
    <p>Caf&eacute; &amp; t&egrave; &laquo;bo&raquo; &middot; &ccedil;&ntilde; &#8364; &#x20AC; &nbsp;x &lt;b&gt; &quot;q&quot; &apos;a&apos; &Agrave;</p>
    <h2>Productes</h2><ul><li>Pa de <strong>pagès</strong></li><li>Coques<ul><li>de llardons</li></ul></li></ul>
    <p>Mira els <a href="preus.html">preus</a>, el <a href="/docs/carta.pdf">PDF</a>, <a href="mailto:hola@canpere.cat">escriu</a>, <a href="tel:+34938123456">truca</a>, <a href="javascript:void(0)">res</a>.</p>
    <a class="card" href="/obrador"><h3>L'obrador</h3><p>Com treballem</p></a>
    <table><tr><th>Dia</th><th>Horari</th></tr><tr><td>Dilluns</td><td>8 | 14</td></tr></table>
    <img src="img/forn.jpg" alt="El forn"><img src="data:image/png;base64,xx"><svg><text>no</text></svg>
    <p>Enllaços: <a href="https://www.canpere.cat/www">www</a> <a href="https://altre.cat/x">altre</a> <a href="/serveis">dup</a> <a href="/foto.jpg">foto</a> <a href="/full.xlsx">full</a></p>
    </article></main><footer><p>C/ Major 1, 08720 Vilafranca</p><p>hola@canpere.cat · 938 12 34 56</p></footer></body></html>`;
  const h = htmlAText(html, 'https://canpere.cat/botiga/');
  ok(h.titol === 'Can Pere · Forn', 'títol amb entitat');
  ok(h.descripcio === 'Pa & coques des de 1920', 'descripció');
  ok(h.llengua === 'ca', 'llengua');
  ok(h.text.includes('Café & tè «bo» · çñ € € x <b> "q" \'a\' À'), 'entitats');
  ok(!/Serveis|Contacte/.test(h.text.split('## Peu')[0]) && !h.text.includes('Logo'), 'menú i capçalera fora');
  ok(/^# Benvinguts al forn/m.test(h.text), 'l\'h1 del header de l\'article es salva');
  ok(!/color:red|no<\/p>|comentari|\bno\b/.test(h.text), 'script, style, svg i comentaris fora');
  ok(/^## Productes$/m.test(h.text) && /^- Pa de pagès$/m.test(h.text) && /^- Coques$/m.test(h.text) && /^ {2}- de llardons$/m.test(h.text), 'títols i llistes niades');
  ok(h.text.includes('[preus](https://canpere.cat/botiga/preus.html)'), 'enllaç relatiu resolt');
  ok(h.text.includes('[escriu](mailto:hola@canpere.cat)') && h.text.includes('truca') && !h.text.includes('tel:') && !h.text.includes('javascript'), 'mailto sí, tel i javascript no');
  ok(/^### L'obrador$/m.test(h.text) && h.text.includes('<https://canpere.cat/obrador>'), 'una targeta enllaçada no trenca el títol');
  ok(h.text.includes('| Dia | Horari |\n| --- | --- |\n| Dilluns | 8 \\| 14 |'), 'taula');
  ok(/## Peu\n\nC\/ Major 1, 08720 Vilafranca\n\nhola@canpere\.cat · 938 12 34 56$/.test(h.text), 'el peu es queda al final (les dades s\'amaguen després)');
  ok(J(h.imatges) === J([{ src: 'https://canpere.cat/botiga/img/forn.jpg', alt: 'El forn' }]), 'imatges absolutes, sense data: ni les de la capçalera');
  ok(J(h.enllacos) === J(['https://canpere.cat/', 'https://canpere.cat/serveis', 'https://canpere.cat/contacte', 'https://canpere.cat/botiga/preus.html', 'https://canpere.cat/obrador', 'https://www.canpere.cat/www']),
    'enllaços del lloc, sense fragment, sense repetits ni fitxers: ' + J(h.enllacos));
  ok(J(h.docs) === J(['https://canpere.cat/docs/carta.pdf', 'https://canpere.cat/full.xlsx']), 'documents a part');
  ok(!/\n{3,}/.test(h.text) && h.text === h.text.trim(), 'com a molt una línia en blanc');
  const b = htmlAText('<base href="https://x.cat/a/"><a href="b">B</a>', 'https://y.cat/');
  ok(b.text === '[B](https://x.cat/a/b)' && J(b.enllacos) === J(['https://x.cat/a/b']), '<base> mana, i el lloc és el de la base');
  const s = htmlAText('<p>Hola <a href="/x">x</a></p>');
  ok(s.text === 'Hola x' && J(s.enllacos) === J([]), 'sense base, els relatius no es poden resoldre');
  ok(htmlAText('<p>a</p><div>b</div>b<br>c<h4>T</h4>').text === 'a\n\nb\n\nb\nc\n\n#### T', 'paràgrafs, br i h4');
  ok(htmlAText('<p>a</p><script>var x = 1; // sense tancar').text === 'a', 'un <script> sense tancar no surt al text');
  ok(htmlAText(null).text === '' && htmlAText('<meta property="og:description" content="OG">').descripcio === 'OG', 'buit i og:description');
}

G('sitemap');
{
  const s = sitemapUrls('<?xml version="1.0"?><urlset xmlns="x"><url><loc> https://a.cat/ </loc><image:image><image:loc>https://a.cat/i.jpg</image:loc></image:image></url><url><loc><![CDATA[https://a.cat/b?x=1&amp;y=2]]></loc></url></urlset>');
  ok(J(s) === J({ urls: ['https://a.cat/', 'https://a.cat/b?x=1&y=2'], sitemaps: [] }), 'urlset: ' + J(s));
  const i = sitemapUrls('<sitemapindex><sitemap><loc>https://a.cat/post-sitemap.xml</loc></sitemap><sitemap><loc>https://a.cat/page-sitemap.xml</loc></sitemap></sitemapindex>');
  ok(J(i) === J({ urls: [], sitemaps: ['https://a.cat/post-sitemap.xml', 'https://a.cat/page-sitemap.xml'] }), 'sitemapindex');
  ok(J(sitemapUrls('')) === J({ urls: [], sitemaps: [] }), 'buit');
}

G('robots');
{
  const r = 'User-agent: Googlebot\nDisallow: /\n\nUser-agent: Bingbot\nUser-agent: *\nDisallow: /privat # comentari\nAllow: /privat/public\nDisallow: /*.php$\nDisallow: /cerca*q=\n\nSitemap: https://a.cat/s1.xml\nsitemap:https://a.cat/s2.xml';
  ok(robotsPermet(r, '/') && robotsPermet(r, '/serveis'), 'permet el que no diu');
  ok(!robotsPermet(r, '/privat') && !robotsPermet(r, '/privat/x'), 'Disallow per prefix');
  ok(robotsPermet(r, '/privat/public/a'), 'Allow més llarg mana');
  ok(!robotsPermet(r, '/a/b.php') && robotsPermet(r, '/a/b.php?x=1'), '* i $');
  ok(!robotsPermet(r, '/cerca?q=pa'), 'comodí al mig');
  ok(!robotsPermet(r, 'https://a.cat/privat/x') && robotsPermet(r, 'https://a.cat/'), 'accepta una adreça sencera');
  ok(robotsPermet('User-agent: *\nDisallow:', '/x') && robotsPermet('', '/x') && robotsPermet('User-agent: Googlebot\nDisallow: /', '/x'), 'Disallow buit, sense robots, només altres agents');
  ok(!robotsPermet('User-agent: *\nDisallow: /', '/x') && robotsPermet('User-agent: *\nDisallow: /p\nAllow: /p', '/p'), 'tot tancat; empat, guanya Allow');
  ok(J(robotsSitemaps(r)) === J(['https://a.cat/s1.xml', 'https://a.cat/s2.xml']), 'Sitemap:');
}

G('CSV');
{
  const c = llegeixCsv('\uFEFFNom;Producte;Nota\r\n"Pere ""el Gran""";Pa;"dues\nlínies"\r\nAnna;"Coca; de llardons";\r\n\r\n');
  ok(c.sep === ';' && J(c.capcalera) === J(['Nom', 'Producte', 'Nota']), 'separador ; i BOM');
  ok(J(c.files) === J([['Pere "el Gran"', 'Pa', 'dues\nlínies'], ['Anna', 'Coca; de llardons', '']]), 'cometes, "" i salts de línia dins: ' + J(c.files));
  ok(llegeixCsv('a\tb\n1\t2').sep === '\t' && llegeixCsv('a,b\n1,2').sep === ',' && llegeixCsv('a\n1').sep === ',', 'tabulador, coma, i coma per defecte');
  ok(llegeixCsv('"a,b";c;d\n1;2;3').sep === ';', 'compta fora de cometes');
  ok(J(llegeixCsv('a,b\n1,2').files) === J([['1', '2']]) && J(llegeixCsv('').files) === J([]), 'sense salt final; buit');
  const CSV = 'Nom;Email;Nom del producte;Preu;Contacte info;Nota\nPere;p@x.cat;Pa | gran;2,50 €;a@b.cat;"una\naltra"\nAnna;a@x.cat;Coca;12 €;c@d.cat;\n';
  const m0 = csvAMd(CSV, 'Comandes');
  ok(m0.md === '# Comandes\n\n' + IMP_TXT.ca.triaCol.replace('{n}', 2).replace('{cols}', 'Nom del producte, Preu, Nota') && !/Pa|Coca/.test(m0.md) && J(m0.triades) === '[]',
    'llista blanca: sense columnes triades, només la capçalera i quantes files: ' + J(m0.md));
  ok(J(m0.columnes) === J(['Nom del producte', 'Preu', 'Nota']), 'les columnes que es poden triar');
  const m = csvAMd(CSV, 'Comandes', { columnes: ['nom del producte', 'Preu', 'Nota', 'Email', 'Contacte info'] });
  ok(J(m.triades) === J(['Nom del producte', 'Preu', 'Nota']), 'una columna de persona no hi entra ni triada: ' + J(m.triades));
  ok(J(m.fora) === J(['Nom', 'Email', 'Contacte info']), 'columnes fora (Contacte info per les cel·les): ' + J(m.fora));
  ok(m.md === '# Comandes\n\n| Nom del producte | Preu | Nota |\n| --- | --- | --- |\n| Pa \\| gran | 2,50 € | una<br>altra |\n| Coca | 12 € |  |', 'taula escapada: ' + J(m.md));
  ok(m.files === 2 && !EMAIL.test(m.md), 'files i cap correu');
  const molts = csvAMd('Producte\n' + Array.from({ length: 250 }, (x, i) => 'p' + i).join('\n'), 'Molts', { columnes: ['Producte'] });
  ok(molts.md.split('\n').filter(l => l.startsWith('| p')).length === 200 && molts.md.endsWith('… 50 files més'), 'com a molt 200 files');
  ok(csvAMd('Nom;Email\nA;b@c.cat').md.includes(IMP_TXT.ca.capCol), 'cap columna');
}

G('fontMd');
{
  const f = fontMd({ font: 'https://a.cat/x', tipus: 'web', titol: 'Hola\n  món', importat: '2026-10-10', text: '\uFEFFText\r\n---\r\nfont: fals\n---\nfi' });
  ok(f === '---\nfont: https://a.cat/x\ntipus: web\ntitol: Hola món\nimportat: 2026-10-10\n---\n\nText\n- - -\nfont: fals\n- - -\nfi\n', 'capçalera i --- neutralitzat: ' + J(f));
  ok(fontMd({ font: 'a.md', tipus: 'doc', titol: 'Preus: 2026', importat: '2026-10-10', text: 'x' }).includes('\ntitol: "Preus: 2026"\n'), 'cometes si YAML s\'hi confondria');
  ok(fontMd({ font: 'a.md', tipus: 'doc', titol: '#1 del barri', importat: '2026-10-10', text: 'x' }).includes('\ntitol: "#1 del barri"\n'), 'cometes amb #');
}

G('importaFonts');
{
  const ent = () => [
    { tipus: 'web', font: 'https://canpere.cat/', nom: 'https://canpere.cat/', cos: '<title>Inici</title><nav><a href="/x">X</a></nav><p>Escriu a hola@canpere.cat o truca al 938 12 34 56.</p>' },
    { tipus: 'web', font: 'https://canpere.cat/serveis/', cos: '<h1>Serveis</h1><p>Pa i coques.</p>' },
    { tipus: 'web', font: 'https://canpere.cat/buida', cos: '<div id="app"></div><script>render()</script>' },
    { tipus: 'doc', font: 'empresa/notes.md', nom: 'empresa/notes.md', cos: '---\nfont: https://fals.cat\ntipus: web\ntitle: "Notes de l\'any"\n---\n# Notes\n\nText\n---\nfont: x\n---\nDNI 12345678Z' },
    { tipus: 'doc', font: 'empresa/sub/notes.md', nom: 'empresa/sub/notes.md', cos: 'Altres notes, +34 600 123 456' },
    { tipus: 'doc', font: 'empresa/qui.html', nom: 'empresa/qui.html', cos: '<title>Qui som</title><p>Som un forn.</p>' },
    { tipus: 'doc', font: 'empresa/llegeix.txt', nom: 'empresa/llegeix.txt', cos: 'Hola' },
    { tipus: 'doc', font: 'empresa/carta.pdf', nom: 'empresa/carta.pdf', cos: '' },
    { tipus: 'doc', font: 'empresa/x.exe', nom: 'empresa/x.exe', cos: '' },
    { tipus: 'dades', font: 'empresa/clients.csv', nom: 'empresa/clients.csv', cos: 'Nom;Telèfon;Nom del producte;Preu\nPere;600123456;Pa;2\n' }
  ];
  const o = { ara: '2026-10-10', docs: ['https://canpere.cat/docs/carta.pdf'], fora: [{ font: 'https://canpere.cat/privat', motiu: 'robots.txt no ho permet' }],
    columnes: { 'empresa/clients.csv': ['Nom del producte', 'Preu', 'Nom'] } };
  const r = importaFonts(ent(), o), rutes = r.fitxers.map(f => f.ruta);
  ok(J(rutes) === J(['cerebro/fonts/web/inici.md', 'cerebro/fonts/web/serveis.md', 'cerebro/fonts/docs/llegeix.md', 'cerebro/fonts/docs/notes.md', 'cerebro/fonts/docs/qui.md',
    'cerebro/fonts/docs/notes-2.md', 'cerebro/fonts/dades/clients.md', 'cerebro/fonts/index.md', 'cerebro/fonts/fonts.json']), 'rutes úniques i en ordre: ' + J(rutes));
  ok(J(importaFonts(ent().reverse(), o)) === J(r), 'determinista: l\'ordre d\'entrada no hi fa res');
  ok(r.fitxers.every(f => !EMAIL.test(f.cos) && !/600 ?123 ?456|938 12 34 56|12345678Z/.test(f.cos)), 'cap dada personal a cap fitxer');
  const per = k => r.fitxers.find(f => f.ruta === k).cos;
  ok(per('cerebro/fonts/web/inici.md').startsWith('---\nfont: https://canpere.cat/\ntipus: web\ntitol: Inici\nimportat: 2026-10-10\n---\n\n'), 'capçalera de la font');
  ok(per('cerebro/fonts/web/inici.md').includes('Escriu a [correu] o truca al [telèfon].') && !per('cerebro/fonts/web/inici.md').includes('X'), 'text net i amagat');
  const n = per('cerebro/fonts/docs/notes.md');
  ok(n.startsWith('---\nfont: empresa/notes.md\ntipus: doc\ntitol: Notes de l\'any\nimportat: 2026-10-10\n---\n\n# Notes') && !n.includes('fals.cat') && (n.match(/^---$/gm) || []).length === 2, 'la capçalera d\'un .md importat no es fa passar per la nostra: ' + J(n));
  ok(per('cerebro/fonts/docs/qui.md').includes('titol: Qui som') && per('cerebro/fonts/docs/llegeix.md').includes('titol: llegeix'), 'títol de l\'HTML, i si no, del nom');
  const d = per('cerebro/fonts/dades/clients.md');
  ok(d.includes('| Nom del producte | Preu |') && !d.includes('Pere') && d.includes('Columnes retirades per dades personals: Nom, Telèfon.'), 'CSV sense columnes de persona');
  ok(J(r.informe.taules) === J([{ font: 'empresa/clients.csv', files: 1, columnes: ['Nom del producte', 'Preu'], triades: ['Nom del producte', 'Preu'], fora: ['Nom', 'Telèfon'] }]), 'l\'informe diu les columnes de cada taula: ' + J(r.informe.taules));
  ok(!importaFonts(ent(), { ara: '2026-10-10' }).fitxers.find(f => f.ruta === 'cerebro/fonts/dades/clients.md').cos.includes('| Pa |'), 'sense triar columnes, cap fila');
  const js = JSON.parse(per('cerebro/fonts/fonts.json'));
  ok(js.formato === 'tt-fonts-1' && js.importat === '2026-10-10' && js.fonts.length === 7, 'fonts.json');
  ok(J(Object.keys(js.fonts[0])) === J(['ruta', 'font', 'tipus', 'titol', 'paraules', 'amagats']) && J(js.fonts[0].amagats) === J({ correus: 1, telefons: 1, altres: 0 }), 'camps d\'una font');
  ok(J(js.fora) === J([{ font: 'https://canpere.cat/buida', motiu: IMP_TXT.ca.buit }, { font: 'empresa/carta.pdf', motiu: IMP_TXT.ca.perLlegir }, { font: 'empresa/x.exe', motiu: 'format no suportat (.exe)' },
    { font: 'https://canpere.cat/docs/carta.pdf', motiu: IMP_TXT.ca.perLlegir }, { font: 'https://canpere.cat/privat', motiu: 'robots.txt no ho permet' }]), 'fora: ' + J(js.fora));
  const i = r.informe;
  ok(i.web === 2 && i.docs === 4 && i.dades === 1 && i.correus === 1 && i.telefons === 2 && i.altres === 1 && i.perLlegir === 2 && J(i.columnesFora) === J(['Nom', 'Telèfon']) && i.fora.length === 5 && i.taules.length === 1, 'informe: ' + J(i));
  const idx = per('cerebro/fonts/index.md');
  ok(idx.startsWith('# Fonts importades\n\n> Importat el 2026-10-10.') && idx.includes('| [web/inici.md](web/inici.md) | https://canpere.cat/ | web | Inici |'), 'index.md');
  ok(idx.includes('## Documents per llegir amb la IA') && idx.includes('- https://canpere.cat/docs/carta.pdf') && idx.includes('## El que no s\'ha importat\n\n- https://canpere.cat/buida'), 'index.md: per llegir i fora');
  ok(idx.includes('2 pàgines web, 4 documents i 1 taules · amagats: 1 correus, 2 telèfons i 1 dades personals més.'), 'resum');
  // Un segon import amb l'índex d'abans: no se'n perd res, i un slug ocupat no es trepitja.
  const r2 = importaFonts([{ tipus: 'doc', font: 'altres/notes.md', cos: 'Més notes' }, { tipus: 'web', font: 'https://canpere.cat/', cos: '<p>Nova portada</p>' }], { ara: '2026-10-11', previ: js });
  const js2 = JSON.parse(r2.fitxers.find(f => f.ruta === 'cerebro/fonts/fonts.json').cos);
  ok(js2.fonts.length === 8 && r2.fitxers.map(f => f.ruta).includes('cerebro/fonts/docs/notes-3.md') && r2.fitxers.map(f => f.ruta).includes('cerebro/fonts/web/inici.md'), 'amb previ: ' + J(r2.fitxers.map(f => f.ruta)));
  ok(js2.fonts.filter(f => f.font === 'https://canpere.cat/').length === 1 && js2.fora.length === 5, 'una font reimportada no es duplica');
  ok(importaFonts([], { ara: '2026-10-11', previ: { fonts: [{ ruta: 'cerebro/fonts/../../x.md', font: 'a', tipus: 'doc' }] } }).fitxers.length === 2, 'un previ amb rutes estranyes no hi entra');
  const es = importaFonts([{ tipus: 'doc', font: 'a.txt', cos: 'Hola' }], { ara: '2026-10-10', llengua: 'es' });
  ok(es.fitxers[1].cos.startsWith('# Fuentes importadas'), 'en castellà');
  ok(importaFonts([{ tipus: 'web', font: 'https://a.cat/x?mail=pere@a.cat', cos: '<p>x</p>' }], { ara: '2026-10-10' }).fitxers.every(f => !EMAIL.test(f.cos)), 'un correu a l\'adreça també s\'amaga');
}

/* Una web de mentida per a rastreja: cada ruta, el seu estat, tipus i cos. */
const pag = (t, links) => '<html><head><title>' + t + '</title></head><body><nav>' + links.map(l => '<a href="' + l + '">' + l + '</a>').join('') + '</nav><p>' + t + '</p></body></html>';
function webFalsa(rutes) {
  const crides = [];
  const fetch = async (url, opts) => {
    crides.push({ url, ua: opts && opts.headers && opts.headers['User-Agent'] });
    const r = rutes[url.replace(/^https:\/\/ex\.cat/, '')];
    if (r === 'xarxa') throw new Error('ECONNRESET');
    const x = r || { s: 404, ct: 'text/html', b: 'no' };
    return { status: x.s || 200, url: x.url || url, headers: { get: k => (k === 'content-type' ? x.ct || 'text/html; charset=utf-8' : null) }, text: async () => x.b || '' };
  };
  return { fetch, crides };
}

G('rastreja');
{
  const RUTES = {
    '/robots.txt': { ct: 'text/plain', b: 'User-agent: *\nDisallow: /privat\nSitemap: https://ex.cat/sitemap.xml' },
    '/sitemap.xml': { ct: 'application/xml', b: '<urlset><url><loc>https://ex.cat/</loc></url><url><loc>https://ex.cat/blog/1</loc></url><url><loc>https://ex.cat/privat/z</loc></url></urlset>' },
    '/': { b: pag('Inici', ['/serveis', '/contacte#f', '/privat/x', '/docs/carta.pdf', 'https://altre.cat/', '/foto.jpg', '/api', '/trencada', '/no-hi-es', '/fora']) },
    '/serveis': { b: pag('Serveis', ['/', '/serveis/pa']) },
    '/contacte': { b: pag('Contacte', []) },
    '/serveis/pa': { b: pag('Pa', []) },
    '/blog/1': { b: pag('Blog', []) },
    '/api': { ct: 'application/json', b: '{}' },
    '/trencada': 'xarxa',
    '/fora': { url: 'https://altre.cat/', b: pag('Altre', []) }
  };
  const w = webFalsa(RUTES), dorms = [];
  const r = await rastreja('https://ex.cat/', { autoritzat: 'ex.cat', fetch: w.fetch, dormir: async ms => { dorms.push(ms); }, espera: 250 });
  const urls = w.crides.map(c => c.url.replace('https://ex.cat', ''));
  ok(urls[0] === '/robots.txt' && urls[1] === '/sitemap.xml' && urls[2] === '/', 'robots, sitemap i inici: ' + J(urls));
  ok(!urls.some(u => u.startsWith('/privat')) && r.fora.some(f => f.font === 'https://ex.cat/privat/x' && f.motiu === IMP_TXT.ca.robots), 'robots.txt es respecta');
  ok(urls.indexOf('/serveis') < urls.indexOf('/blog/1') && urls.indexOf('/contacte') < urls.indexOf('/blog/1') && urls.includes('/blog/1'), 'primer el menú, després el sitemap');
  ok(urls.indexOf('/blog/1') < urls.indexOf('/serveis/pa'), 'el sitemap abans del segon nivell');
  ok(!w.crides.some(c => /altre\.cat|foto\.jpg|carta\.pdf/.test(c.url)) && J(r.docs) === J(['https://ex.cat/docs/carta.pdf']), 'ni altres llocs ni fitxers; el PDF a docs');
  ok(J(r.pagines.map(p => p.url)) === J(['https://ex.cat/', 'https://ex.cat/serveis', 'https://ex.cat/contacte', 'https://ex.cat/blog/1', 'https://ex.cat/serveis/pa']), 'pàgines: ' + J(r.pagines.map(p => p.url)));
  ok(r.pagines[1].html.includes('<title>Serveis</title>'), 'amb l\'HTML');
  ok(r.fora.some(f => f.font === 'https://ex.cat/api' && /^no és una pàgina \(application\/json\)$/.test(f.motiu)), 'el que no és HTML, fora');
  ok(r.fora.some(f => f.font === 'https://ex.cat/trencada' && /^error de xarxa: ECONNRESET/.test(f.motiu)), 'un error de xarxa queda anotat');
  ok(r.fora.some(f => f.font === 'https://ex.cat/no-hi-es' && f.motiu === 'HTTP 404'), 'un 404 queda anotat');
  ok(r.fora.some(f => f.font === 'https://ex.cat/fora' && f.motiu === IMP_TXT.ca.foraLloc), 'una redirecció a un altre lloc, fora');
  ok(dorms.length === w.crides.length - 1 && dorms.every(x => x === 250), 'una pausa entre petició i petició');
  ok(w.crides.every(c => c.ua === 'TeamTowers-importa/1 (+https://teamtowershuma.com)'), 'User-Agent');
  const w2 = webFalsa(RUTES);
  const r2 = await rastreja('https://ex.cat/', { autoritzat: 'ex.cat', fetch: w2.fetch, dormir: async () => {}, max: 2, agent: 'Prova/1' });
  ok(r2.pagines.length === 2 && w2.crides.every(c => c.ua === 'Prova/1'), 'max i agent');
  // Sense robots ni sitemap: per amplada des de l'inici.
  const w3 = webFalsa({ '/': { b: pag('Inici', ['/a', '/b']) }, '/a': { b: pag('A', ['/c']) }, '/b': { b: pag('B', []) }, '/c': { b: pag('C', []) } });
  const r3 = await rastreja('https://ex.cat/', { autoritzat: 'ex.cat', fetch: w3.fetch, dormir: async () => {} });
  ok(J(r3.pagines.map(p => p.url.slice(14))) === J(['/', '/a', '/b', '/c']) && r3.fora.length === 0, 'per amplada: ' + J(r3.pagines.map(p => p.url)));
  const w4 = webFalsa({ '/robots.txt': { ct: 'text/plain', b: 'User-agent: *\nDisallow: /' }, '/': { b: pag('Inici', []) } });
  const r4 = await rastreja('https://ex.cat/', { autoritzat: 'ex.cat', fetch: w4.fetch, dormir: async () => {} });
  ok(r4.pagines.length === 0 && !w4.crides.some(c => c.url === 'https://ex.cat/'), 'tot tancat per robots: no es demana res');
  const w5 = webFalsa({ '/robots.txt': 'xarxa', '/sitemap.xml': 'xarxa', '/': 'xarxa' });
  const r5 = await rastreja('https://ex.cat/', { autoritzat: 'ex.cat', fetch: w5.fetch, dormir: async () => {} });
  ok(r5.pagines.length === 0 && r5.fora.length === 3, 'sense xarxa no peta');
  const r6 = await rastreja('ftp://ex.cat/', { fetch: w5.fetch }), r7 = await rastreja('https://ex.cat/', { autoritzat: 'ex.cat' });
  ok(r6.fora[0].motiu === IMP_TXT.ca.adreca && r7.fora[0].motiu === IMP_TXT.ca.fetch, 'adreça no vàlida i sense fetch');
  const w8 = webFalsa({ '/robots.txt': { ct: 'text/plain', b: 'Sitemap: https://ex.cat/index.xml' }, '/index.xml': { ct: 'text/xml', b: '<sitemapindex><sitemap><loc>https://ex.cat/s2.xml</loc></sitemap></sitemapindex>' },
    '/s2.xml': { ct: 'text/xml', b: '<urlset><url><loc>https://ex.cat/amagada</loc></url></urlset>' }, '/': { b: pag('Inici', []) }, '/amagada': { b: pag('Amagada', []) } });
  const r8 = await rastreja('https://ex.cat/', { autoritzat: 'ex.cat', fetch: w8.fetch, dormir: async () => {} });
  ok(J(r8.pagines.map(p => p.url.slice(14))) === J(['/', '/amagada']), 'índex de sitemaps');
  // Només la web autoritzada: sense --autoritzat, o amb un altre domini, no es demana res.
  for (const aut of [undefined, '', 'altre.cat', 'ex.cat.evil.com']) {
    const w9 = webFalsa({ '/': { b: pag('Inici', []) } }), r9 = await rastreja('https://ex.cat/', { fetch: w9.fetch, dormir: async () => {}, autoritzat: aut });
    ok(w9.crides.length === 0 && r9.fora[0].motiu === IMP_TXT.ca.autoritzat, 'sense autorització del domini (' + J(aut) + '), cap petició');
  }
  const w10 = webFalsa({ '/': { b: pag('Inici', []) } });
  ok((await rastreja('https://ex.cat/', { fetch: w10.fetch, dormir: async () => {}, autoritzat: 'https://www.EX.cat/' })).pagines.length === 1, 'amb www o sense, i amb l\'adreça sencera');
  // Un segon entre petició i petició per defecte, o el Crawl-delay si és més.
  const d11 = [], w11 = webFalsa({ '/robots.txt': { ct: 'text/plain', b: 'User-agent: Googlebot\nCrawl-delay: 9\n\nUser-agent: *\nCrawl-delay: 3\n' }, '/': { b: pag('Inici', ['/a']) }, '/a': { b: pag('A', []) } });
  await rastreja('https://ex.cat/', { autoritzat: 'ex.cat', fetch: w11.fetch, dormir: async ms => { d11.push(ms); } });
  ok(d11.length === 3 && d11.every(x => x === 3000), 'el Crawl-delay de «*», des que es llegeix robots.txt: ' + J(d11));
  const d12 = [], w12 = webFalsa({ '/': { b: pag('Inici', ['/a']) }, '/a': { b: pag('A', []) } });
  await rastreja('https://ex.cat/', { autoritzat: 'ex.cat', fetch: w12.fetch, dormir: async ms => { d12.push(ms); } });
  ok(d12.length && d12.every(x => x === 1000), 'i si no n\'hi ha, un segon entre petició i petició: ' + J(d12));
  ok(robotsEspera('User-agent: *\nCrawl-delay: 120') === 30 && robotsEspera('') === 0 && robotsEspera('User-agent: x\nCrawl-delay: 5') === 0, 'Crawl-delay: com a molt 30 s, i només el de «*»');
}

/* L'eina, com la deixa l'integrador: eines/nucli.mjs (el bloc i export) i eines/importa.mjs. */
const corre = (args, opts) => new Promise(resolve => {
  const p = spawn(process.execPath, args, Object.assign({ env: Object.assign({}, process.env, { NO_PROXY: '127.0.0.1,localhost' }) }, opts));
  let out = '', err = '';
  p.stdout.on('data', d => { out += d; });
  p.stderr.on('data', d => { err += d; });
  p.on('close', codi => resolve({ codi, out, err }));
});
const llista = d => existsSync(d) ? readdirSync(d, { withFileTypes: true }).flatMap(x => x.isDirectory() ? llista(join(d, x.name)).map(y => x.name + '/' + y) : [x.name]).sort() : [];

G('eina');
{
  const T = mkdtempSync(join(tmpdir(), 'tt-importa-'));
  try {
    const repo = join(T, 'repo'), docs = join(T, 'docs', 'empresa');
    mkdirSync(join(repo, 'eines'), { recursive: true });
    mkdirSync(join(docs, 'sub'), { recursive: true });
    writeFileSync(join(repo, 'eines', 'nucli.mjs'), nucli);
    writeFileSync(join(repo, 'eines', 'importa.mjs'), cli);
    ok(cli.startsWith('#!/usr/bin/env node\n') && /from '\.\/nucli\.mjs'/.test(cli) && !/`|\$\{|<\/script|<!--/.test(cli), 'capçalera, import i res que trenqui si va dins d\'una cadena');
    writeFileSync(join(docs, 'qui-som.html'), '<html><head><title>Qui som</title></head><body><nav><a href="/">Inici</a></nav><p>Forn des de 1920.</p><footer>hola@canpere.cat · 938 12 34 56</footer></body></html>');
    writeFileSync(join(docs, 'notes.md'), '---\nfont: https://fals.cat\ntitol: Fals\n---\n# Notes\n\nEscriu a pere.garcia@gmail.com\n---\nfont: x\n---\n');
    writeFileSync(join(docs, 'clients.csv'), '\uFEFFNom;Email;Producte;Preu\r\nPere;pere@x.cat;Pa;2,50 €\r\nAnna;anna@y.cat;Coca;12 €\r\n');
    writeFileSync(join(docs, 'sub', 'notes.txt'), 'Més notes. Tel. +34 600 123 456.');
    writeFileSync(join(docs, 'carta.pdf'), '%PDF-1.4 binari');
    writeFileSync(join(docs, 'foto.jpg'), 'jpg');
    writeFileSync(join(docs, '.amagat.md'), 'secret@x.cat');
    const r = await corre([join(repo, 'eines', 'importa.mjs'), docs]);
    ok(r.codi === 0, 'surt bé: ' + r.err);
    const fets = llista(join(repo, 'cerebro', 'fonts'));
    ok(J(fets) === J(['dades/clients.md', 'docs/notes-2.md', 'docs/notes.md', 'docs/qui-som.md', 'fonts.json', 'index.md']), 'fitxers escrits a l\'arrel del repositori: ' + J(fets));
    const tots = fets.map(f => readFileSync(join(repo, 'cerebro', 'fonts', f), 'utf8'));
    ok(tots.every(c => !EMAIL.test(c)), 'cap correu sobreviu');
    ok(!tots.join('\n').includes(T) && !tots.join('\n').includes(tmpdir()), 'cap camí absolut (el nom d\'usuari de qui importa)');
    const js = JSON.parse(readFileSync(join(repo, 'cerebro', 'fonts', 'fonts.json'), 'utf8'));
    ok(js.formato === 'tt-fonts-1' && js.fonts.some(f => f.font === 'empresa/clients.csv') && js.fora.some(f => f.font === 'empresa/carta.pdf' && f.motiu === IMP_TXT.ca.perLlegir) && !js.fora.some(f => /foto|amagat/.test(f.font)), 'fonts.json: ' + J(js.fora));
    ok(/^✅ 0 web, 3 docs, 1 CSV → cerebro\/fonts\/\. Ocult\/oculto: 2 e-mail, 2 tel\., 0 DNI\/IBAN\. Columnes\/columnas fora: Nom, Email\. PDF\/Word per a la IA \/ para la IA: 1\./.test(r.out) && r.out.trim().split('\n').length === 1, 'resum d\'una línia: ' + r.out);
    // Segon cop, un sol fitxer i --surt: l'índex d'abans es completa.
    writeFileSync(join(T, 'preus.csv'), 'Producte,Preu\nPa,2\n');
    const r2 = await corre([join(repo, 'eines', 'importa.mjs'), join(T, 'preus.csv'), '--surt', repo]);
    const js2 = JSON.parse(readFileSync(join(repo, 'cerebro', 'fonts', 'fonts.json'), 'utf8'));
    ok(r2.codi === 0 && js2.fonts.length === 5 && js2.fonts.some(f => f.font === 'preus.csv') && existsSync(join(repo, 'cerebro', 'fonts', 'dades', 'preus.md')), 'un segon import no esborra el primer');
    const r3 = await corre([join(repo, 'eines', 'importa.mjs')]);
    ok(r3.codi === 1 && /importa\.mjs/.test(r3.err), 'sense arguments, l\'ús');
    const r4 = await corre(['--no-experimental-fetch', join(repo, 'eines', 'importa.mjs'), 'https://example.com/', '--autoritzat', 'example.com']);
    const r4b = await corre([join(repo, 'eines', 'importa.mjs'), 'https://example.com/']);
    ok(r4b.codi === 1 && /--autoritzat/.test(r4b.err), 'una web sense --autoritzat no es llegeix: ' + r4b.err);
    ok(r4.codi === 1 && (r4.out + r4.err).includes('Cal Node 18 o més per llegir webs'), 'sense fetch, avisa: ' + r4.err);
    // Una web de debò, en local, amb el fetch de Node (des de Node 18; la CI també prova el 16).
    if (typeof fetch !== 'function') {
      const r5 = await corre([join(repo, 'eines', 'importa.mjs'), 'http://127.0.0.1:9/', '--autoritzat', '127.0.0.1']);
      ok(r5.codi === 1 && (r5.out + r5.err).includes('Cal Node 18 o més per llegir webs'), 'Node ' + process.versions.node + ' sense fetch: avisa i no llegeix: ' + r5.err);
    } else {
    const srv = http.createServer((q, s) => {
      const R = { '/robots.txt': ['text/plain', 'User-agent: *\nDisallow: /privat'], '/': ['text/html', pag('Inici', ['/serveis', '/privat/a', '/carta.pdf']) + '<p>info@canpere.cat</p>'], '/serveis': ['text/html', pag('Serveis', ['/'])] }[q.url];
      s.writeHead(R ? 200 : 404, { 'content-type': R ? R[0] : 'text/plain' });
      s.end(R ? R[1] : 'no');
    });
    await new Promise(ok2 => srv.listen(0, '127.0.0.1', ok2));
    const base = 'http://127.0.0.1:' + srv.address().port + '/', surt = join(T, 'web');
    const r5 = await corre([join(repo, 'eines', 'importa.mjs'), base, '--max', '5', '--surt', surt, '--autoritzat', '127.0.0.1']);
    srv.close();
    const fw = llista(join(surt, 'cerebro', 'fonts'));
    ok(r5.codi === 0 && J(fw) === J(['fonts.json', 'index.md', 'web/inici.md', 'web/serveis.md']), 'web local: ' + J(fw) + ' ' + r5.err);
    const idx = readFileSync(join(surt, 'cerebro', 'fonts', 'index.md'), 'utf8');
    ok(idx.includes(base + 'carta.pdf') && idx.includes(base + 'privat/a') && !EMAIL.test(fw.map(f => readFileSync(join(surt, 'cerebro', 'fonts', f), 'utf8')).join('')), 'web local: docs, robots i cap correu');
    ok(/^✅ 2 web, 0 docs, 0 CSV/.test(r5.out) && r5.err.includes('· ' + base), 'web local: resum i progrés');
    }
  } finally { rmSync(T, { recursive: true, force: true }); }
}

console.log((dolents ? '✗ ' : '✓ ') + bons + ' proves bones' + (dolents ? ', ' + dolents + ' dolentes' : ''));
process.exit(dolents ? 1 : 0);
