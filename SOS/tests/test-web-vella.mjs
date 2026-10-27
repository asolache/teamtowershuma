/* La web que el client ja té · replicar abans de millorar
 * ────────────────────────────────────────────────────────
 * Punts 13 i 15 del backlog (23/10/2026): quan el client ja té web, el
 * generador en replica les pàgines (títol, descripció, H1, text i lloc al
 * menú) a partir de la «foto d'abans» (`sos-foto-web` v1), porta cada adreça
 * vella a la nova amb un 301 i no deixa publicar si alguna es queda sense
 * destí. Sense navegador: el motor tal com és a vna-suport.html, i el
 * `eines/genera.mjs` de la plantilla, executat de debò.
 *
 *   node SOS/tests/test-web-vella.mjs
 */
import { readFileSync, mkdtempSync, cpSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const DIR = dirname(fileURLToPath(import.meta.url)), SOS = join(DIR, '..');
const MotorWeb = createRequire(import.meta.url)(join(SOS, 'lib', 'motor-web.js'));
const M = MotorWeb.motor(readFileSync(join(SOS, 'vna-suport.html'), 'utf8'));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const mapa = { abast: 'Una escola de castellà', roles: ['Escola', 'Alumnes', 'Professors'],
  pairs: [['Escola', 'Alumnes', 'tangible', 'Cursos de castellà', 'intangible', 'Opinions'],
    ['Escola', 'Professors', 'tangible', 'Formació de professors', 'tangible', 'Inscripcions']] };
const foto = { tipus: 'sos-foto-web', v: 1, origen: 'https://www.escola.example/', data: '2026-05-01', llengua: 'es-ES', fora: 0,
  pagines: [
    { url: 'https://escola.example/', titol: 'Escola · Cursos de español en Barcelona', descripcio: 'Cursos de español para extranjeros.', h1: 'Aprende español en Barcelona', text: 'Somos una escuela pequeña.\n\nEscríbenos a hola@escola.example.', menu: 0 },
    { url: '/cursos-intensivos.html', titol: 'Cursos intensivos de español', descripcio: 'Intensivos de 20 horas.', h1: 'Cursos intensivos', text: 'Veinte horas a la semana.', menu: 1 },
    { url: '/formacion/profesores/', titol: 'Formación de profesores ELE', descripcio: 'Formación inicial y continua.', h1: 'Formación de profesores', text: 'Para profesores de español.', menu: 2 },
    { url: '/aviso-legal', titol: 'Aviso legal', descripcio: '', h1: 'Aviso legal', text: 'Titular de la web.', menu: null }] };
const portesWeb = { origen: foto.origen, pagines: [{ url: '/formacion/profesores/', quien: 'Professors', porque: 'Hi parla als professors' }] };
const avisos = [];
const site = M.webASite(M.webDelMapa(mapa, { casa: ['Escola'] }), { nom: 'Escola', casa: ['Escola'], foto, portesWeb, avisa: m => avisos.push(m) });
const f = r => (site.fitxers.find(x => x.ruta === r) || {}).cos || '';

console.log('\n1 · Es replica el que ja hi ha: títol, descripció, H1 i text');
const ini = f('index.html');
ok(site.llengua === 'es', 'sense llengua triada, la de la web vella (' + site.llengua + ')');
ok(ini.includes('<title>Escola · Cursos de español en Barcelona</title>'), 'la portada manté el títol vell');
ok(ini.includes('content="Cursos de español para extranjeros."'), 'i la descripció');
ok(ini.includes('<h1>Aprende español en Barcelona</h1>'), 'i l\'H1');
ok(ini.includes('<p>Somos una escuela pequeña.</p>'), 'i el text, per paràgrafs');
ok(!ini.includes('hola@escola.example'), 'el correu que la lectura no hagi amagat s\'amaga aquí');
const int = f('cursos-intensivos.html');
ok(int.includes('<title>Cursos intensivos de español</title>') && int.includes('<h1>Cursos intensivos</h1>') && int.includes('Veinte horas'), 'una pàgina que el mapa no té surt igual, amb el seu nom');
ok(f('aviso-legal.html').includes('<h1>Aviso legal</h1>'), 'i també la que no era al menú');
const prof = site.fitxers.find(x => /^professors\.html$/.test(x.ruta));
ok(prof && prof.cos.includes('<title>Formación de profesores ELE</title>') && prof.cos.includes('Para profesores de español.'), 'la pàgina que portesWeb dona a un rol és la porta d\'aquest rol, amb el títol vell');

console.log('\n2 · El menú, en el mateix ordre');
const nav = ini.slice(ini.indexOf('<nav'), ini.indexOf('</nav>'));
const ordre = [...nav.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
ok(ordre.indexOf('cursos-intensivos.html') === 1 && ordre.indexOf('professors.html') === 2, 'inici, intensius, professors, i després la resta: ' + ordre.join(' '));
ok(!ordre.includes('aviso-legal.html'), 'la que no era al menú tampoc hi és');

console.log('\n3 · Cada adreça vella té destí (301)');
const red = f('_redirects');
ok(/^\/cursos-intensivos\.html \/cursos-intensivos\.html/m.test(red) === false, 'la que no canvia d\'adreça no porta redirecció');
ok(/^\/formacion\/profesores \/professors\.html 301!$/m.test(red), 'la que va a la porta d\'un rol: ' + (red.match(/^\/formacion.*$/m) || [''])[0]);
ok(/^\/aviso-legal \/aviso-legal\.html 301!$/m.test(red) === false, 'la que Netlify ja serveix sense .html no en porta');
ok(!/^\/ /m.test(red), 'la portada no es redirigeix');
ok(site.orfes.length === 0 && M.orfesFoto(foto, site.fitxers).length === 0, 'cap adreça vella sense destí');
ok(f('sitemap.xml') === '' || f('sitemap.xml').includes('cursos-intensivos.html'), 'les pàgines replicades són públiques');
ok(f('cerebro/foto-web.json').includes('sos-foto-web'), 'la foto viatja amb el repositori');

console.log('\n4 · La guarda: si alguna es queda sense destí, no es publica');
const dolenta = JSON.parse(JSON.stringify(foto));
dolenta.pagines.push({ url: 'https://altre.example/blog', titol: 'Blog', h1: 'Blog', text: '', menu: null });
dolenta.fora = ['https://www.escola.example/promo-2024'];
const s2 = M.webASite(M.webDelMapa(mapa, { casa: ['Escola'] }), { nom: 'Escola', casa: ['Escola'], foto: dolenta, avisa: () => {} });
ok(s2.orfes.length === 1 && s2.orfes[0] === 'https://altre.example/blog', 'una adreça d\'un altre lloc no té destí: ' + s2.orfes.join(' '));
ok(/^\/promo-2024 \/ 301!$/m.test((s2.fitxers.find(x => x.ruta === '_redirects') || {}).cos || ''), 'les que no es van poder llegir van a l\'inici');
const s3 = M.webASite(M.webDelMapa(mapa, { casa: ['Escola'] }), { nom: 'Escola', casa: ['Escola'] });
ok(!s3.fitxers.some(x => x.ruta === '_redirects') && s3.orfes.length === 0, 'sense foto, res canvia');

console.log('\n5 · eines/genera.mjs, de debò: publica amb la foto bona i s\'atura amb la dolenta');
const tmp = mkdtempSync(join(tmpdir(), 'web-vella-'));
try {
  cpSync(join(SOS, 'plantilla-web'), tmp, { recursive: true });
  mkdirSync(join(tmp, 'cerebro'), { recursive: true });
  writeFileSync(join(tmp, 'cerebro', 'mapa-real.json'), JSON.stringify(mapa));
  writeFileSync(join(tmp, 'cerebro', 'foto-web.json'), JSON.stringify(foto));
  let r = spawnSync(process.execPath, [join(tmp, 'eines', 'genera.mjs')], { encoding: 'utf8', env: Object.assign({}, process.env, { NETLIFY: '' }) });
  ok(r.status === 0 && existsSync(join(tmp, '_redirects')) && existsSync(join(tmp, 'cursos-intensivos.html')), 'amb totes les adreces amb destí, publica (' + r.status + ')' + (r.status ? ': ' + r.stderr.slice(0, 200) : ''));
  writeFileSync(join(tmp, 'cerebro', 'foto-web.json'), JSON.stringify(dolenta));
  r = spawnSync(process.execPath, [join(tmp, 'eines', 'genera.mjs')], { encoding: 'utf8' });
  ok(r.status === 1 && /sense destí/.test(r.stderr) && r.stderr.includes('altre.example/blog'), 'amb una adreça vella sense destí, s\'atura i diu quina (' + r.status + ')');
} finally { rmSync(tmp, { recursive: true, force: true }); }

console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
