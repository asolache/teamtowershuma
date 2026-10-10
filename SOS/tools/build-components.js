#!/usr/bin/env node
/* Els components · un botó és el mateix botó a totes les pàgines
 * ─────────────────────────────────────────────────────────────────────────────
 * La pell va fer que la paleta fos una, i la barra que el menú ho fos. Entre la
 * barra i el peu, però, cada pàgina seguia tenint **la seva còpia** dels
 * mateixos components. El 10/10/2026 n'hi havia, només de botons:
 *
 *   · `.btn-primary` a la portada amb les cantonades tallades i 2 rem de
 *     costat, a la premsa amb radi de 10 px i 1,4 rem, als diagnòstics amb un
 *     degradat cap a un lila que la pell no té (#7c7ef5), al CRM igual, a
 *     l'escola amb un altre nom (`.btn-pri`), a l'editor amb un altre (`.pri`)
 *     i al mètode amb un altre (`.cta.pri`).
 *   · `.btn` amb quatre fons diferents (--bg, --card, --panel, transparent) i
 *     cinc paddings.
 *
 * Cap d'aquestes diferències la va decidir ningú. Qui passa de la portada al
 * diagnòstic i d'allà als preus veu tres botons diferents per a la mateixa
 * acció, que és exactament la costura C3 del pla de disseny
 * (`knowledge/dev/pla-disseny.md`).
 *
 * Aquest fitxer declara els components **un sol cop** i els escriu entre les
 * marques `/*TT-COMPONENTS*\/` de totes les pàgines que porten la pell. La
 * guarda peta si una pàgina en torna a declarar un pel seu compte.
 *
 * ── Què es pot fer a la pàgina, i què no ────────────────────────────────────
 * Una pàgina **pot** col·locar un component on li toca: `.hero .btn-primary
 * {width:100%}` o `#result .btn {justify-content:center}` són maquetació i no
 * canvien què és un botó. El que **no** pot és declarar-lo de nou: una regla
 * que comenci pel nom del component (`.btn {…}`, `.btn.pri {…}`,
 * `.section-header h2 {…}`) fora del bloc fa petar la guarda. La diferència es
 * llegeix al selector: el context va davant, el component no.
 *
 * ── Els noms ────────────────────────────────────────────────────────────────
 * Són els que ja feien servir més pàgines (`.btn`, `.btn-primary`,
 * `.btn-ghost`, `.section-header`), i `.targeta` per a la de «Tres serveis» de
 * la portada, que és el model. `.btn-primary` i `.btn-ghost` funcionen sols o
 * amb `.btn` al davant: la portada els feia servir sols i el SOS amb `.btn`, i
 * obligar a una de les dues formes seria tocar marcatge que el JS genera.
 *
 * Ús:  node SOS/tools/build-components.js           escriu el bloc a totes
 *      node SOS/tools/build-components.js --check   falla si alguna ha derivat
 */
'use strict';
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const CHECK = process.argv.includes('--check');
const { PAGINES } = require('./build-pell.js');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

/* ══ ELS COMPONENTS ══════════════════════════════════════════════════════════
   Només tokens de la pell (`build-pell.js`). Cap font: hereten la de la
   pàgina, perquè el SOS i l'arrel encara en tenen dues i un botó que en
   portés una tercera seria la costura que aquest fitxer tanca. */
const CSS = `/* GENERAT per SOS/tools/build-components.js · no s'edita a mà: hi ha guarda. */
/* Botons · guia de marca §6: un primari per pantalla, la resta amb vora, i
   44 px d'alçada sempre. */
.btn,.btn-primary,.btn-ghost{display:inline-flex;align-items:center;justify-content:center;gap:.45rem;
  min-height:44px;padding:.7rem 1.35rem;border:1px solid var(--border-strong);border-radius:10px;
  background:var(--card);color:var(--text);font:inherit;font-size:var(--t0);font-weight:600;line-height:1.25;
  text-align:center;text-decoration:none;cursor:pointer;touch-action:manipulation;
  transition:background-color .15s,border-color .15s,color .15s}
.btn:hover,.btn-ghost:hover{border-color:var(--indigo);color:var(--indigo)}
.btn-ghost{background:transparent}
.btn-primary{background:var(--indigo);border-color:var(--indigo);color:var(--on-accent)}
.btn-primary:hover{background:var(--blue);border-color:var(--blue);color:var(--on-accent)}
.btn-sm{padding:.45rem .85rem}
.btn:focus-visible,.btn-primary:focus-visible,.btn-ghost:focus-visible{outline:2px solid var(--indigo);outline-offset:2px}
.btn:disabled,.btn-primary:disabled,.btn-ghost:disabled,.btn[aria-disabled="true"]{opacity:.45;cursor:not-allowed}
/* \`display:inline-flex\` guanya al \`[hidden]\` del navegador: sense això, un
   botó amagat amb l'atribut es veuria. */
.btn[hidden],.btn-primary[hidden],.btn-ghost[hidden]{display:none}
/* La capçalera d'una secció: etiqueta, títol i entradeta. */
.section-header{text-align:center;max-width:720px;margin:0 auto 5rem}
.section-eyebrow{font-family:var(--mono);font-size:var(--t0);letter-spacing:.06em;color:var(--indigo);
  text-transform:uppercase;margin-bottom:1.25rem}
.section-header h2{font-size:clamp(2.1rem,4vw,3.2rem);font-weight:700;line-height:1.15;margin-bottom:1.25rem}
.section-header h2 em{font-style:normal;color:var(--blue)}
.section-header p{font-size:var(--t1);color:var(--light);line-height:1.8}
/* La targeta: la de «Tres serveis» de la portada n'és el model. Guia §6:
   radi de 10 a 14 px i la vora de la pell. */
.targeta{display:flex;flex-direction:column;gap:.6rem;padding:1.6rem 1.5rem;
  background:var(--card);border:1px solid var(--border);border-radius:14px}
.targeta-k{font-family:var(--mono);font-size:var(--t0);letter-spacing:.06em;color:var(--indigo);font-weight:600}
.targeta-t{font-size:var(--t2);font-weight:650;color:var(--text);line-height:1.3;margin:0}
.targeta-d{font-size:var(--t0);color:var(--light);line-height:1.6;margin:0}`;

/* Els noms que només aquest bloc pot declarar. Surten del CSS i no d'una llista
   escrita a part: el dia que s'hi afegeixi un component, la guarda el vigila
   sense que ningú se'n recordi. */
const NOMS = [...new Set([...CSS.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/\.([a-z][\w-]*)/g)].map(m => m[1]))]
  .filter(n => !/^(?:hover|focus-visible|disabled)$/.test(n));

function bloc() { return OBRE + '\n' + CSS + '\n' + TANCA; }
const OBRE = '/*TT-COMPONENTS*/', TANCA = '/*/TT-COMPONENTS*/';

/* La primera vegada, el bloc va just després del `:root{…}` de la pell: abans
   de qualsevol regla de la pàgina, de manera que el context que la pàgina hi
   posi (`.hero .btn-primary`) guanya per especificitat i no per ordre. */
function posa(html) {
  const i = html.indexOf(OBRE), j = html.indexOf(TANCA);
  if (i >= 0 && j > i) return html.slice(0, i) + bloc() + html.slice(j + TANCA.length);
  const p = html.indexOf('/*/TT-PELL*/');
  if (p < 0) return null;
  let k = p + '/*/TT-PELL*/'.length;
  /* El primer `}` fora de comentaris tanca el `:root`. */
  while (k < html.length) {
    if (html.startsWith('/*', k)) { k = html.indexOf('*/', k + 2) + 2; continue; }
    if (html[k] === '}') break;
    k++;
  }
  if (k >= html.length) return null;
  return html.slice(0, k + 1) + '\n' + bloc() + html.slice(k + 1);
}
module.exports = { CSS, NOMS, posa, bloc };
if (require.main !== module) return;

console.log('\nEls components · un sol joc a ' + PAGINES.length + ' pàgines');
let escrites = 0;
const velles = [], sense = [];
PAGINES.forEach(rel => {
  const f = join(ARREL, rel);
  if (!existsSync(f)) { bad('no existeix ' + rel); return; }
  const html = readFileSync(f, 'utf8');
  const nou = posa(html);
  if (nou === null) { sense.push(rel); return; }
  if (nou === html) return;
  velles.push(rel);
  if (!CHECK) { writeFileSync(f, nou); escrites++; }
});
if (sense.length) bad(`${pl(sense.length, 'pàgina', 'pàgines')} sense la pell on posar-hi el bloc: ${sense.join(', ')}`);

/* ══ LA GUARDA ═══════════════════════════════════════════════════════════════
   Fora del bloc, cap regla pot **començar** pel nom d'un component. Es llegeix
   el CSS dels `<style>` i no el dels `<script>`: l'editor porta dins del seu JS
   el full d'estil de la web del client que exporta, i allò és un altre
   document amb els seus botons. */
{
  const re = new RegExp('^\\.(?:' + NOMS.map(n => n.replace(/-/g, '\\-')).join('|') + ')(?![\\w-])');
  const dobles = [];
  PAGINES.forEach(rel => {
    const f = join(ARREL, rel);
    if (!existsSync(f)) return;
    let txt = readFileSync(f, 'utf8');
    const i = txt.indexOf(OBRE), j = txt.indexOf(TANCA);
    if (i >= 0 && j > i) txt = txt.slice(0, i) + txt.slice(j + TANCA.length);
    txt = txt.replace(/<script[\s\S]*?<\/script>/g, '');
    const seus = [];
    for (const st of txt.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
      const css = st[1].replace(/\/\*[\s\S]*?\*\//g, '');
      for (const r of css.matchAll(/([^{}]+)\{[^{}]*\}/g)) {
        r[1].split(',').map(s => s.trim().replace(/\s+/g, ' '))
          .filter(s => re.test(s)).forEach(s => seus.push(s));
      }
    }
    if (seus.length) dobles.push(`${rel} → ${[...new Set(seus)].slice(0, 5).join(', ')}${seus.length > 5 ? ' …' : ''}`);
  });
  if (dobles.length) {
    bad(`${pl(dobles.length, 'pàgina declara', 'pàgines declaren')} components pel seu compte:`);
    dobles.forEach(d => console.log('      ' + d));
    console.log('    El context va davant (`.hero .btn-primary`) i es pot; el component sol no.');
  } else ok(`cap pàgina redeclara ${NOMS.map(n => '.' + n).slice(0, 6).join(', ')} … (${NOMS.length} noms)`);
}

if (CHECK) {
  if (velles.length) bad(`${pl(velles.length, 'pàgina té', 'pàgines tenen')} el bloc vell o no el té: `
    + velles.slice(0, 6).join(', ') + (velles.length > 6 ? ` … (+${velles.length - 6})` : '') + ' — torna a executar build-components.js');
  else if (!sense.length) ok('el bloc és el mateix a totes');
} else if (escrites) ok(`bloc escrit a ${pl(escrites, 'pàgina', 'pàgines')}`);
else ok('el bloc ja hi era a totes');

console.log(fails ? '\n❌ Els components no quadren.' : `\n✅ Els components · ${NOMS.length} noms a ${PAGINES.length} pàgines.`);
process.exit(fails ? 1 : 0);
