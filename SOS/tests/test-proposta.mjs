/* La proposta inicial automàtica · l'anàlisi de les fonts i l'esborrany de web
 * ────────────────────────────────────────────────────────
 * Una web de prova amb el que sol tenir la d'un negoci petit (una descripció,
 * un JSON-LD, un color, una lletra, un preu, un correu dins d'una frase) ha de
 * donar: els candidats a rol i a lliurament amb evidència, les preguntes del
 * que no diu, la marca que se'n desprèn, un esborrany de mapa que el
 * diagnòstic atura (la web no diu els intangibles) i una web d'esbós. Amb un
 * `mapa.json` que passa, la web va a `web/` amb la marca. El que una persona ja
 * ha fet seu no es trepitja.
 *
 *   node SOS/tests/test-proposta.mjs
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const DIR = dirname(fileURLToPath(import.meta.url)), TOOLS = join(DIR, '..', 'tools');
const req = createRequire(import.meta.url);
const A = req('../tools/analitza-contingut.js');
let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log(`  ${c ? '✓' : '✗'} ${m}`); };

const WEB = `<!DOCTYPE html><html lang="es"><head><title>Vinoteca Prova | Vinos de pequeñas bodegas</title>
<meta name="description" content="Elegimos vinos de pequeñas bodegas y los contamos. Catas, visitas y vino para restaurantes.">
<style>body{font-family:Georgia,serif;color:#222}.b{background:#7a1f3d}h1{color:#7a1f3d}a{color:#7a1f3d}</style>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Store","name":"Vinoteca Prova","telephone":"+34 931 000 000","address":{"@type":"PostalAddress","streetAddress":"Carrer Gran 3","addressLocality":"Barcelona"}}</script>
</head><body><nav>Inicio Tienda</nav><h1>Vinos con historia</h1>
<p>Seleccionamos vinos de bodegas pequeñas con identidad. Los restaurantes confían en nuestra selección para su carta de vinos.</p>
<p>Organizamos catas para grupos y empresas los jueves. Reserva tu cata por 25 € por persona escribiendo a hola@prova.example o al 600 111 222.</p>
<p>Los clientes pueden hacer su pedido en la tienda online y recibir el envío en casa.</p><img src="a.jpg"><img src="b.jpg" alt="Botellas"></body></html>`;
const LOGO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>';

console.log('\nL\'anàlisi de les fonts');
{
  const a = A.analitza([{ nom: 'index.html', cos: WEB }, { nom: 'logo.svg', cos: LOGO }]);
  ok(a.llengua === 'es' && a.nom === 'Vinoteca Prova', 'la llengua i el nom, del que diu la web (el JSON-LD)');
  const rols = a.rols.map(r => r.id);
  ok(['canal', 'empresas', 'clientes', 'proveedores'].every(x => rols.includes(x)) && !rols.includes('formacion'), 'els candidats a rol que hi surten, i cap que no hi surti');
  ok(a.rols.every(r => r.evidencia.length >= 1), 'cada candidat porta la frase on surt, com a evidència');
  const tot = JSON.stringify(a);
  ok(!/hola@prova|600 111 222|25 €/.test(tot.replace(/"preus":\d+/, '')) && /\[correo\]/.test(tot) && /\[precio\]/.test(tot), 'les frases d\'evidència no porten correus, telèfons ni imports');
  ok(a.coses.some(c => c.id === 'cata') && a.coses.some(c => c.id === 'pedido') && a.preus === 1, 'els candidats a lliurament i els preus que ja publica');
  ok(a.preguntes.some(q => /formulario/.test(q)) && a.preguntes.some(q => /una sola lengua/.test(q)) && a.preguntes.some(q => /publica 1 precio/.test(q)) && a.preguntes.some(q => /sin texto alternativo/.test(q))
    && !a.preguntes.some(q => /teléfono/.test(q)), 'les preguntes del que la web no diu (i no la del telèfon, que el JSON-LD sí que diu)');
  ok(a.marca.color === '#7a1f3d' && a.marca.lletra === 'serif' && a.marca.logo === 'logo.svg' && /^Elegimos vinos/.test(a.marca.presentacio)
    && a.marca.contacte.adreca === 'Carrer Gran 3, Barcelona' && a.marca.contacte.telefon === '+34 931 000 000', 'la marca: color, lletra, logo, presentació i on són');
  ok(a.esborrany.rols[0] === 'Quien lleva la casa' && a.esborrany.parells.length === a.esborrany.rols.length - 1 && !/Vinoteca/.test(a.esborrany.abast),
    'l\'esborrany del mapa: la casa i un vincle per candidat, sense el nom propi a la frontera');
  const ca = A.analitza([{ nom: 'cataleg.md', cos: '# El celler\n\nFem vins i els expliquem als visitants que vénen al poble. També tenim botiga per als clients.' }]);
  ok(ca.llengua === 'ca' && ca.rols.some(r => r.id === 'visitantes') && ca.rols.some(r => r.id === 'territorio') && /Qui porta la casa/.test(ca.esborrany.rols[0]), 'un catàleg en Markdown i en català també');
}

console.log('\nL\'ordre sencer: de les fonts a l\'esborrany de web');
{
  const dir = mkdtempSync(join(tmpdir(), 'proposta-'));
  const corre = (...x) => spawnSync(process.execPath, [join(TOOLS, 'proposta.js'), dir, ...x], { encoding: 'utf8' });
  ok(corre().status === 1, 'sense fonts, s\'atura i diu on posar-les');
  mkdirSync(join(dir, 'fuentes'));
  writeFileSync(join(dir, 'fuentes', 'index.html'), WEB);
  writeFileSync(join(dir, 'fuentes', 'logo.svg'), LOGO);
  const r1 = corre('--llengua', 'es');
  const f = r => (existsSync(join(dir, r)) ? readFileSync(join(dir, r), 'utf8') : '');
  ok(r1.status === 3 && f('web-esbozo/index.html') && !existsSync(join(dir, 'web')), 'sense mapa.json, la web surt a web-esbozo/ i no a web/ (surt amb 3)');
  ok(f('analisis.md') && f('mapa-esbozo.json') && /provisional/.test(f('estado.md')) && /Escribir `mapa.json`/.test(f('estado.md')), 'escriu l\'anàlisi, l\'esbós i el que falta');
  ok(/<img src="logo.svg"/.test(f('web-esbozo/index.html')) && /Carrer Gran 3/.test(f('web-esbozo/index.html')) && /--acc:#7a1f3d/.test(f('web-esbozo/estil.css')), 'l\'esbós ja porta la marca de la web del client');
  const ex = spawnSync(process.execPath, [join(TOOLS, 'revisa-mapa.js'), '--exemple'], { encoding: 'utf8' }).stdout;
  writeFileSync(join(dir, 'mapa.json'), ex);
  const m = JSON.parse(f('marca.json')); m.portes = { 'El visitant': { nom: 'Visitas', intro: 'Ven a probar.' } }; writeFileSync(join(dir, 'marca.json'), JSON.stringify(m));
  const r2 = corre('--llengua', 'es');
  ok(r2.status === 0 && f('web/index.html') && !existsSync(join(dir, 'web-esbozo')), 'amb un mapa.json que passa, la web va a web/ i l\'esbós s\'esborra');
  ok(/>Visitas<\/a>/.test(f('web/index.html')) && /<p>Ven a probar\.<\/p>/.test(f('web/el-visitant.html')) && f('web/cerebro/marca.json'), 'amb la marca que s\'ha retocat a mà: el nom curt i la introducció de la porta');
  ok(/Qui rep i explica/.test(f('README.md')) && /web\/index.html/.test(f('README.md')) && !/\d+\s?€/.test(f('README.md')), 'el README es refà amb el mapa nou, i sense imports');
  const bo = f('EMPIEZA-AQUI.html');
  const rutes = [...bo.matchAll(/href="([^"#]+)"/g)].map(m => m[1]).filter(h => !/^(https?:|mailto:)/.test(h));
  ok(/<html lang="es">/.test(bo) && /Tu web sigue siendo la tuya/.test(bo) && /<h2 id="t-preguntas">/.test(bo) && /La web publica 1 precio/.test(bo) && /Qui rep i explica/.test(bo),
    'EMPIEZA-AQUI.html: el backoffice del client, amb la proposta i les preguntes tal com són');
  ok(rutes.length >= 4 && rutes.every(h => existsSync(join(dir, h))) && rutes.includes('web/estil.css') && /teamtowershuma\.com\/SOS\/vna-suport\.html/.test(bo),
    'amb la marca de la web (el seu estil.css) i cap enllaç trencat: ' + rutes.join(', '));
  writeFileSync(join(dir, 'README.md'), '# El meu\n');
  corre('--llengua', 'es');
  ok(f('README.md') === '# El meu\n' && JSON.parse(f('marca.json')).portes, 'el que una persona ha fet seu (sense la marca de generat) no es trepitja');
  rmSync(dir, { recursive: true, force: true });
}

console.log('\nEl Markdown del backoffice');
{
  const { mdHtml } = req('../tools/proposta.js');
  const h = mdHtml('# T\n\nUn **fort** i `codi` <script>x</script> [enllaç](mapa.json)\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n1. u\n   segueix\n2. dos\n\n> cita', 'propuesta', 1);
  ok(/<h2>T<\/h2>/.test(h) && /<strong>fort<\/strong>/.test(h) && /<code>codi<\/code>/.test(h) && !/<script>/.test(h) && /&lt;script&gt;/.test(h), 'títols un nivell avall, negreta, codi, i l\'HTML escapat');
  ok(/<a href="propuesta\/mapa.json">enllaç<\/a>/.test(h) && /<th scope="col">a<\/th>/.test(h) && /<td>2<\/td>/.test(h) && /<li>u segueix<\/li>/.test(h) && /<blockquote>/.test(h), 'enllaços relatius a la carpeta, taules, llistes i cites');
  ok(!/<a /.test(mdHtml('[x](javascript:alert(1))')) && /<a href="https:\/\/x.example">/.test(mdHtml('[x](https://x.example)')), 'un enllaç javascript: no es converteix en enllaç; un https sí');
}

console.log('\n' + (fail ? `❌ ${fail} fallen de ${pass + fail}` : `✅ ${pass} assercions, totes verdes`));
process.exit(fail ? 1 : 0);
