/* Una sola barra · el que cap guarda de marcatge pot veure
 * ─────────────────────────────────────────────────────────────────────────
 * `build-nav.js --check` pot dir que les vint-i-set pàgines porten el mateix
 * bloc i que cap en declara una de pròpia, i la frase «un únic menú» seguir
 * sent falsa: el bloc és el mateix i es **renderitza** diferent, perquè els
 * tokens d'una pàgina no són els de l'altra o perquè el CSS de la pàgina el
 * tapa. I pot ser idèntic a les dues i **no obrir-se**, que és el defecte que
 * aquesta casa ja ha pagat tres vegades: el marcatge hi és, els botons es
 * premen i no passa res.
 *
 * Per això això es mesura **de la pantalla**: els destins que es veuen, el
 * color que surt, i què passa en prémer.
 *
 *   node SOS/tests/test-menu.mjs
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const DIR = dirname(fileURLToPath(import.meta.url));
const ARREL = join(DIR, '..', '..');
const req = createRequire(import.meta.url);
const { GRUPS, PAGINES, EXCEPCIONS } = req('../tools/build-nav.js');

const url = p => 'file://' + join(ARREL, p);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

/* El que es llegeix d'una pàgina: la barra tal com surt. */
const llegeix = async (p, w = 1280) => {
  const pg = await b.newPage({ viewport: { width: w, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(url(p));
  await pg.waitForTimeout(140);
  const d = await pg.evaluate(() => {
    const n = document.querySelector('nav.tt-nav');
    if (!n) return null;
    const cs = getComputedStyle(n);
    const portes = [...n.querySelectorAll('.tn-g')].map(g => ({
      lbl: g.querySelector('summary').textContent.trim(),
      destins: [...g.querySelectorAll('.tn-p a')].map(a => a.getAttribute('href'))
    }));
    /* La mida real de cada text de la barra, en píxels. */
    const mides = [...n.querySelectorAll('summary,b,span,a,button')]
      .filter(e => e.textContent.trim())
      .map(e => Math.round(parseFloat(getComputedStyle(e).fontSize) * 10) / 10);
    return {
      barres: document.querySelectorAll('nav.tt-nav').length,
      marca: n.querySelector('.tn-brand') && n.querySelector('.tn-brand').textContent.trim(),
      cta: n.querySelector('.tn-cta') && n.querySelector('.tn-cta').getAttribute('href'),
      llengua: !!n.querySelector('.tn-lang'),
      posicio: cs.position, mides,
      /* Cap color per resoldre: un token que la pàgina no declari surt buit. */
      colorMarca: getComputedStyle(n.querySelector('.tn-brand span')).color,
      portes
    };
  });
  return { pg, d, errs };
};

console.log('\nUna sola barra, vint-i-set pàgines');

/* ── 1 · La mateixa barra a l'arrel i al SOS ────────────────────────────────
   És l'única asserció que mesura la frase que demanava aquest canvi. Es
   comparen **els destins que es veuen**, no el marcatge: dos blocs idèntics
   amb un CSS de pàgina diferent donen dues barres. */
console.log('\n1 · La mateixa a /, a /cataleg i a /SOS/vna.html');
const A = await llegeix('index.html');
const V = await llegeix('SOS/vna.html');
const C = await llegeix('cataleg.html');
{
  ok(A.d && V.d && C.d, 'les tres porten una barra `nav.tt-nav`');
  const forma = x => JSON.stringify(x.d.portes);
  ok(forma(A) === forma(V) && forma(A) === forma(C),
    `els mateixos ${A.d.portes.length} grups i els mateixos destins, en el mateix ordre`);
  ok(A.d.marca === V.d.marca && A.d.cta === V.d.cta,
    `la mateixa marca («${A.d.marca}») i la mateixa acció (${A.d.cta})`);
  ok(A.d.barres === 1 && V.d.barres === 1 && C.d.barres === 1,
    'i una de sola a cada pàgina: cap pàgina en porta dues');
}

/* ── 2 · El color surt de debò a les dues bandes ─────────────────────────
   El defecte concret que la barra d'arrel tenia: el seu CSS feia servir
   `var(--accent-indigo)`, un àlies que **només** declaren les tres pàgines
   d'arrel. Escrit a una pàgina del SOS no peta: deixa el text sense color. */
console.log('\n2 · El color no depèn de la pàgina');
{
  const bu = c => !c || c === 'rgba(0, 0, 0, 0)' || c === 'rgb(0, 0, 0)';
  ok(!bu(A.d.colorMarca) && !bu(V.d.colorMarca),
    `la marca té color a les dues (${V.d.colorMarca})`);
  ok(A.d.colorMarca === V.d.colorMarca, 'i és el mateix color: un sol joc de tokens');
}

/* ── 3 · Les portes s'obren, i a mòbil també ────────────────────────────── */
console.log('\n3 · Prémer');
for (const [nom, p, w] of [['sobretaula', 'SOS/vna.html', 1280], ['mòbil', 'SOS/vna.html', 390]]) {
  const { pg, d } = await llegeix(p, w);
  const obertes = [];
  for (let i = 0; i < d.portes.length; i++) {
    await pg.click(`.tn-g:nth-of-type(${i + 1}) > summary`);
    await pg.waitForTimeout(90);
    const r = await pg.evaluate(i => {
      const g = document.querySelectorAll('.tn-g')[i];
      const a = g.querySelector('.tn-p a');
      if (!a) return { ok: false };
      const b = a.getBoundingClientRect();
      /* Visible i clicable: amplada i alçada reals, i dins de la finestra. */
      return { ok: b.width > 20 && b.height > 8 && b.left >= 0 && b.right <= innerWidth + 1 };
    }, i);
    if (r.ok) obertes.push(i);
    await pg.click(`.tn-g:nth-of-type(${i + 1}) > summary`);
  }
  ok(obertes.length === d.portes.length,
    `${nom} (${w}px): les ${d.portes.length} portes s'obren i els enllaços es poden prémer (${obertes.length}/${d.portes.length})`);
  await pg.close();
}

/* ── 4 · Des del mapa de valor s'arriba a les pàgines de la casa en un gest
   Abans, des d'una pàgina del SOS calien dues passes: el menú no portava a
   `cataleg` ni a `qui-som` perquè el grup de l'arrel era l'únic amb rutes
   relatives i la portada tenia una barra diferent. */
console.log('\n4 · Des de /vna, la casa és a un clic');
{
  const dins = V.d.portes.flatMap(g => g.destins);
  ['/cataleg.html', '/qui-som.html', '/SOS/vna-suport.html'].forEach(h =>
    ok(dins.includes(h), `/vna porta a ${h} des de la barra`));
}

/* ── 5 · El commutador de llengua, només on hi ha diccionari ─────────────
   A les pàgines monolingües seria un botó que no fa res, que és pitjor que no
   tenir-lo: ensenya que el lloc té dues llengües i que aquella pàgina no. */
console.log('\n5 · Les dues llengües');
{
  ok(A.d.llengua, 'la portada el porta');
  ok(V.d.llengua, 'i /vna també, que és bilingüe des del 03/10/2026');
  const { pg, d } = await llegeix('SOS/matriu.html');
  ok(!d.llengua, 'i la MATRIU, que és monolingüe, no el porta');
  await pg.close();
  /* I que canviï la barra sencera, no només els botons. */
  await V.pg.click('.tn-lang .lang-b[data-lang="es"]');
  await V.pg.waitForTimeout(160);
  const es = await V.pg.evaluate(() =>
    [...document.querySelectorAll('nav.tt-nav .tn-g > summary')].map(s => s.textContent.trim()).join(' | '));
  const ca = V.d.portes.map(p => p.lbl).join(' | ');
  ok(es !== ca, `en castellà la barra canvia sencera · «${es}»`);
}

/* ── 6 · Res per sota del terra ──────────────────────────────────────────
   Les mides de la barra d'arrel eren 12,5 · 10,4 · 9,9 i 11,2 px. El terra
   del lloc són 15, i la barra era d'on sortia l'excepció. */
console.log('\n6 · El terra de 15 px');
{
  const totes = [].concat(A.d.mides, V.d.mides, C.d.mides);
  const sota = [...new Set(totes.filter(x => x < 15))];
  ok(!sota.length, `cap dels ${totes.length} textos de la barra per sota de 15 px`
    + (sota.length ? ` — n'hi ha a ${sota.join(', ')} px` : ''));
}

/* ── 7 · Sticky, i sense script ──────────────────────────────────────────
   La barra d'arrel era `fixed` i obligava cada pàgina a compensar-la amb un
   buit a dalt; i obria el menú de mòbil amb cinquanta línies de JavaScript
   repetides a cada fitxer. */
console.log('\n7 · Com està feta');
{
  ok(A.d.posicio === 'sticky' && V.d.posicio === 'sticky',
    'sticky a les dues: cap pàgina ha de compensar-la amb un buit a dalt');
  const { readFileSync } = await import('node:fs');
  const ambScript = [...PAGINES, 'index.html', 'cataleg.html', 'qui-som.html'].filter(p => {
    const f = join(ARREL, PAGINES.includes(p) ? 'SOS' : '', p);
    const s = readFileSync(f, 'utf8');
    return /navBurger|nav-open|querySelector\('nav'\)/.test(s);
  });
  ok(!ambScript.length, 'i cap pàgina porta el script del menú de mòbil'
    + (ambScript.length ? ': ' + ambScript.join(', ') : ''));
}

/* ── 8 · Sense errors a cap pàgina amb barra ─────────────────────────────── */
console.log('\n8 · El fre');
{
  const totes = PAGINES.map(p => 'SOS/' + p).concat(['index.html', 'cataleg.html', 'qui-som.html']);
  const dolentes = [];
  for (const p of totes) {
    const { pg, d, errs } = await llegeix(p);
    if (errs.length) dolentes.push(`${p}: ${errs[0].slice(0, 60)}`);
    if (!d || d.barres !== 1) dolentes.push(`${p}: ${d ? d.barres : 0} barres`);
    await pg.close();
  }
  ok(!dolentes.length, `les ${totes.length} pàgines amb barra: una barra i cap error de JS`
    + (dolentes.length ? ' — ' + dolentes.slice(0, 3).join(' · ') : ''));
  ok(Object.keys(EXCEPCIONS).length === 2,
    `i les ${Object.keys(EXCEPCIONS).length} excepcions declarades segueixen sense barra, amb el motiu escrit`);
}

await A.pg.close(); await V.pg.close(); await C.pg.close();
await b.close();
console.log('\n' + (fail ? `❌ ${fail} fallen de ${pass + fail}` : `✅ ${pass} assercions, totes verdes`));
process.exit(fail ? 1 : 0);
