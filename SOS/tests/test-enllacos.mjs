/* Cap enllaç intern mort · el que diu el repo ha de ser veritat
 * ──────────────────────────────────────────────────────────────
 * Peça 10 del guardià (guardia.md): rastreja els `href` interns de totes les
 * pàgines HTML publicades (fora dels <script>, que porten plantilles) i
 * comprova que cada destí existeix, sigui com a fitxer, com a carpeta amb
 * index.html, com a pàgina sense `.html` (Netlify ho serveix) o com a regla
 * de `_redirects`. Sense navegador.
 *
 *   node SOS/tests/test-enllacos.mjs
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, posix } from 'node:path';

const ARREL = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

/* Les pàgines que esperen una tria de l'Álvaro (guardia.md, «Esperen l'Álvaro»).
 * Quan decideixi, es treuen d'aquí. */
const ESPEREN = new Set(['knowledge-base/stakeholders.html → styles.css']);

/* Les regles de _redirects: «/de /a 301». «/x/*» cobreix tot el que penja de /x/. */
const regles = readFileSync(join(ARREL, '_redirects'), 'utf8').split('\n')
  .map(l => l.trim()).filter(l => l && !l.startsWith('#')).map(l => l.split(/\s+/)[0]);
const redirigit = ruta => regles.some(r => r.endsWith('/*')
  ? (ruta + '/').startsWith(r.slice(0, -1)) : r === ruta || r === ruta.replace(/\/$/, ''));

const existeix = abs => {
  if (existsSync(abs)) return statSync(abs).isFile() || existsSync(join(abs, 'index.html'));
  return existsSync(abs + '.html');
};

const pagines = [];
(function camina(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = join(d, e.name);
    if (e.isDirectory()) camina(p); else if (e.name.endsWith('.html')) pagines.push(p);
  }
})(ARREL);

const morts = [];
for (const f of pagines) {
  const rel = relative(ARREL, f).split('\\').join('/');
  if (redirigit('/' + rel)) continue; // la pàgina mateixa ja no es publica
  const html = readFileSync(f, 'utf8').replace(/<script\b[\s\S]*?<\/script>/gi, '');
  for (const m of html.matchAll(/<(?:a|link)\b[^>]*?\shref="([^"]*)"/gi)) {
    const h = m[1].split(/[#?]/)[0];
    if (!h || /^([a-z]+:|\/\/)/i.test(h) || /[{}$'+]/.test(h)) continue;
    let ruta;
    try { ruta = decodeURIComponent(h.startsWith('/') ? h : posix.join('/', posix.dirname(rel), h)); }
    catch { ruta = h; }
    ruta = posix.normalize(ruta);
    if (existeix(join(ARREL, ruta)) || redirigit(ruta)) continue;
    const clau = rel + ' → ' + m[1];
    if (!ESPEREN.has(clau)) morts.push(clau);
  }
}

console.log('\n1 · Cada enllaç intern porta a una pàgina que existeix o que es redirigeix');
ok(pagines.length > 50, pagines.length + ' pàgines rastrejades');
ok(morts.length === 0, morts.length ? 'enllaços morts:\n      ' + [...new Set(morts)].join('\n      ') : 'cap enllaç mort');

console.log(fail ? `\n❌ ${fail} fallen de ${pass + fail}` : `\n✅ ${pass} assercions, totes verdes`);
process.exit(fail ? 1 : 0);
