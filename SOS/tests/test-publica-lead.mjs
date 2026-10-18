/* Publicar la pàgina d'un lead · al repositori privat, i esborrar-la després
 * ─────────────────────────────────────────────────────────────────────────
 * `publica-lead.js` copia `lead.html` a `public/<ref>/index.html` del
 * repositori privat només si és la pàgina revisada del mateix `lead.json` i
 * torna a passar les comprovacions. Una referència és d'un sol negoci, també
 * després d'esborrar-ne la pàgina (`refs.json`). La base del lloc porta les capçaleres que
 * no deixen indexar, ni enviar referer, ni executar res.
 *
 *   node SOS/tests/test-publica-lead.mjs
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const DIR = dirname(fileURLToPath(import.meta.url)), TOOLS = join(DIR, '..', 'tools');
const P = createRequire(import.meta.url)('../tools/publica-lead.js');
let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log(`  ${c ? '✓' : '✗'} ${m}`); };
const node = (...x) => spawnSync(process.execPath, x, { encoding: 'utf8' });

const WEB = `<!DOCTYPE html><html lang="ca"><head><title>Celler de Prova</title></head><body><h1>Celler de Prova</h1>
<p>Al celler rebem visitants cada dissabte i els expliquem com treballem la vinya vella del costat del riu.</p></body></html>`;
const ex = node(join(TOOLS, 'revisa-mapa.js'), '--exemple').stdout;
const lead = mkdtempSync(join(tmpdir(), 'tt-pub-lead-')), repo = mkdtempSync(join(tmpdir(), 'tt-pub-repo-'));
mkdirSync(join(lead, 'fuentes'));
writeFileSync(join(lead, 'fuentes', 'index.html'), WEB);
writeFileSync(join(lead, 'mapa.json'), ex);
const proposta = (...x) => node(join(TOOLS, 'proposta.js'), lead, '--llengua', 'ca', '--nom', 'Celler de Prova', ...x);
const publica = (...x) => node(join(TOOLS, 'publica-lead.js'), ...x);

console.log('\nLa base del repositori privat');
{
  const r0 = publica(lead, repo);
  ok(r0.status === 4 && /--inicia/.test(r0.stderr), 'sense --inicia, no es publica: la carpeta no és el repositori de les pàgines');
  const r = publica('--inicia', repo);
  const cap = existsSync(join(repo, 'public', '_headers')) ? readFileSync(join(repo, 'public', '_headers'), 'utf8') : '';
  ok(r.status === 0 && /X-Robots-Tag: noindex/.test(cap) && /Referrer-Policy: no-referrer/.test(cap) && /default-src 'none'/.test(cap) && !/script-src/.test(cap),
    'les capçaleres: noindex, sense referer i una CSP que no deixa executar ni carregar res');
  ok(/publish = "public"/.test(readFileSync(join(repo, 'netlify.toml'), 'utf8')) && existsSync(join(repo, 'public', 'index.html')) && existsSync(join(repo, 'public', '404.html'))
    && !existsSync(join(repo, 'public', 'robots.txt')), 'Netlify publica només public/, amb una portada buida i el 404; sense robots.txt, perquè es vegi el noindex');
  ok(/privado y debe seguir siéndolo/.test(readFileSync(join(repo, 'README.md'), 'utf8')), 'el README diu que és privat i com es fa servir');
  ok(['index.html', '404.html'].every(x => /<meta name="viewport" content="width=device-width/.test(readFileSync(join(repo, 'public', x), 'utf8'))), 'la portada i el 404 es llegeixen al mòbil (viewport)');
  ok(publica('--inicia', resolve(DIR, '..', '..', 'tt-pub-dins')).status === 4 && !existsSync(resolve(DIR, '..', '..', 'tt-pub-dins')), 'el repositori privat no pot ser dins del públic');
}

console.log('\nPublicar');
{
  proposta('--lead');
  const r0 = publica(lead, repo);
  ok(r0.status === 4 && /no s'ha revisat/.test(r0.stderr), 'l\'esborrany intern no es publica');
  const rv = proposta('--lead', '--revisat');
  const ref = JSON.parse(readFileSync(join(lead, 'lead.json'), 'utf8')).ref;
  const r = publica(lead, repo), f = join(repo, 'public', ref, 'index.html');
  ok(rv.status === 0 && r.status === 0 && existsSync(f) && readFileSync(f, 'utf8') === readFileSync(join(lead, 'lead.html'), 'utf8'),
    'la revisada va a public/<ref>/index.html, tal com és');
  ok(!existsSync(join(repo, 'public', ref, 'lead.json')) && !existsSync(join(repo, 'public', ref, 'mapa.json')) && !existsSync(join(repo, 'fuentes')),
    'al repositori privat només hi va la pàgina: ni lead.json, ni el mapa, ni les fonts');
  const html = readFileSync(join(lead, 'lead.html'), 'utf8');
  writeFileSync(join(lead, 'lead.html'), html.replace('</main>', '<p>truca al 600 111 222</p></main>'));
  ok(publica(lead, repo).status === 4, 'una pàgina tocada a mà que ja no passa les comprovacions no es publica');
  writeFileSync(join(lead, 'lead.html'), html.replace('</main>', '<p>rebem visitants cada dissabte i els expliquem com treballem</p></main>'));
  ok(/cita la web/.test(publica(lead, repo).stderr), 'i es tornen a mirar les cites amb les fonts de la carpeta');
  writeFileSync(join(lead, 'lead.html'), html.split(ref).join('AAAAAAAAAAAAAAAA'));
  ok(/no porta la referència/.test(publica(lead, repo).stderr), 'una pàgina amb una altra referència que la de lead.json no es publica');
  writeFileSync(join(lead, 'lead.html'), html);
  const altre = join(tmpdir(), 'tt-pub-altre-' + process.pid);
  spawnSync('cp', ['-r', lead, altre]);
  node(join(TOOLS, 'proposta.js'), altre, '--llengua', 'ca', '--nom', 'Cooperativa Beta', '--lead');
  const ja = JSON.parse(readFileSync(join(lead, 'lead.json'), 'utf8'));
  writeFileSync(join(altre, 'lead.json'), JSON.stringify({ ref: ja.ref, nom: 'Cooperativa Beta' }));
  node(join(TOOLS, 'proposta.js'), altre, '--llengua', 'ca', '--nom', 'Cooperativa Beta', '--lead', '--revisat');
  const rc = publica(altre, repo);
  ok(JSON.parse(readFileSync(join(altre, 'lead.json'), 'utf8')).ref === ref && rc.status === 4 && /ja és d'un altre negoci \(«Celler de Prova»\)/.test(rc.stderr)
    && /Celler de Prova/.test(readFileSync(f, 'utf8')), 'dues carpetes amb la mateixa referència: la segona no trepitja la pàgina que el primer lead ja té');
  ok(publica(lead, repo).status === 0, 'tornar a publicar la del mateix negoci, sí');
  const reg = readFileSync(join(repo, 'refs.json'), 'utf8');
  ok(/^[0-9a-f]{64}$/.test(JSON.parse(reg)[ref]) && !/Celler/i.test(reg) && !existsSync(join(repo, 'public', 'refs.json')),
    'refs.json guarda de qui és cada referència amb l\'empremta del nom, no el nom, i fora de public/');

  console.log('\nEsborrar després de la visita');
  ok(publica('--esborra', '../../etc', repo).status === 4 && publica('--esborra', 'x', repo).status === 4, 'una referència que no ho és no esborra res');
  const re = publica('--esborra', ref, repo);
  ok(re.status === 0 && !existsSync(join(repo, 'public', ref)) && existsSync(join(repo, 'public', 'index.html')), 'esborra només la carpeta de la referència');
  ok(publica('--esborra', ref, repo).status === 4, 'esborrar-la dues vegades diu que ja no hi és');
  const rd = publica(altre, repo);
  ok(rd.status === 4 && /ja és d'un altre negoci/.test(rd.stderr) && !existsSync(join(repo, 'public', ref)),
    'esborrada la pàgina, l\'enllaç que ja es va enviar no passa a ser d\'un altre negoci');
  ok(!/--esborra/.test(rd.stderr), 'i, si la pàgina ja no hi és, no diu que l\'esborris');
  ok(publica(lead, repo).status === 0 && existsSync(join(repo, 'public', ref, 'index.html')), 'el mateix negoci sí que la pot tornar a publicar');
  rmSync(altre, { recursive: true, force: true });
  writeFileSync(join(repo, 'refs.json'), '{ trencat');
  const rt = publica(lead, repo);
  writeFileSync(join(repo, 'refs.json'), 'null');
  const rn = publica(lead, repo);
  ok(rt.status === 4 && /no és un JSON vàlid/.test(rt.stderr) && rn.status === 4 && /ha de ser un objecte/.test(rn.stderr),
    'si refs.json no es pot llegir, no es publica a cegues, i diu què li passa');
}

console.log('\nL\'ordre');
ok(publica().status === 2 && publica('--inicia').status === 2 && publica('--x', lead, repo).status === 2, 'mal escrit, surt amb 2');

rmSync(lead, { recursive: true, force: true });
rmSync(repo, { recursive: true, force: true });
console.log(`\n${fail ? '❌' : '✅'} ${pass + fail} assercions, ${fail} vermelles`);
process.exit(fail ? 1 : 0);
