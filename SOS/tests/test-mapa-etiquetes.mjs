/* El nom de cada entregable damunt del mapa · sense navegador
 * ─────────────────────────────────────────────────────────────
 * `SOS/lib/mapa-etiquetes.js` posa una etiqueta curta a cada fletxa dels
 * mapes de valor (portada, «Què és un mapa de valor»). Aquí es prova la part
 * que no necessita pantalla: que l'etiqueta curta de cada lliurament real del
 * cas surt, és curta, no comença amb un article i no acaba penjada.
 *
 *   node SOS/tests/test-mapa-etiquetes.mjs
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));
const req = createRequire(import.meta.url);
const ME = req(join(DIR, '..', 'lib', 'mapa-etiquetes.js'));
const C = req(join(DIR, '..', 'lib', 'cas-automatitzat.js'));
let fails = 0;
const ok = (c, m) => { if (c) console.log('  ✓ ' + m); else { fails++; console.log('  ✗ ' + m); } };

const vna = readFileSync(join(DIR, '..', 'vna.html'), 'utf8');
const titols = [...vna.matchAll(/<path class="mv-f"[^>]*><title[^>]*>([^<]*)/g)].map(m => m[1].replace(/^[^:]*:\s*/, ''));
const textos = C.fluxos.flatMap(x => [x.que.ca, x.que.es]).concat(titols);
ok(textos.length > 60, textos.length + ' lliuraments per provar (cas de la portada i mapes de la pàgina)');
const mal = textos.map(t => [t, ME.curt(t)]).filter(([, c]) =>
  !c || c.length > 23 || (/^(el|la|els|les|los|las|un|una|l')\s/i.test(c) && !/^(el|lo) que\s/i.test(c)) || /\s(de|del|i|y|a|amb|con|per|que)…?$/i.test(c) || /^[a-zà-ú]/.test(c));
ok(!mal.length, mal.length ? 'etiquetes mal tallades: ' + mal.slice(0, 5).map(x => `«${x[0]}» → «${x[1]}»`).join('; ') : 'totes les etiquetes curtes surten netes');
ok(ME.curt("el pagament de l'esdeveniment a l'agència") === 'Pagament', 'es treu el complement quan és massa llarg');
ok(ME.curt('las propuestas cerradas con precio por persona') === 'Propuestas cerradas', 'l\'article «las» no es menja la primera lletra');
ok(ME.curt("el que paga per l'experiència, no per l'ampolla") === 'El que paga…', '«el que» es queda i el tall no acaba en preposició');
ok(/mapa-etiquetes\.js/.test(readFileSync(join(DIR, '..', '..', 'index.html'), 'utf8')), 'la portada carrega les etiquetes');
ok(/lib\/mapa-etiquetes\.js/.test(vna), '«Què és un mapa de valor» carrega les etiquetes');
ok(/MapaEtiquetes\.posa/.test(readFileSync(join(DIR, '..', 'lib', 'mapa-anima.js'), 'utf8')), 'el mapa animat de la portada les fa servir');

console.log(fails ? `\n✗ ${fails} fallades` : '\n✅ Les etiquetes dels entregables surten bé');
process.exit(fails ? 1 : 0);
