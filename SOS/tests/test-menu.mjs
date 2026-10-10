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
const { GRUPS, LLOC, SOS_GRUPS, PAGINES, EXCEPCIONS } = req('../tools/build-nav.js');

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
/* I la barra del SOS, des del 10/10/2026 la segona: les eines a dins del SOS. */
const M = await llegeix('SOS/matriu.html');
{
  ok(A.d && V.d && C.d, 'les tres porten una barra `nav.tt-nav`');
  const forma = x => JSON.stringify(x.d.portes);
  ok(forma(A) === forma(V) && forma(A) === forma(C),
    `els mateixos ${A.d.portes.length} grups i els mateixos destins, en el mateix ordre`);
  ok(A.d.portes.length === LLOC.length && LLOC.length === 4,
    `i són quatre portes: tres ofertes i qui som · ${A.d.portes.map(p => p.lbl).join(' · ')}`);
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
  ok(A.d.colorMarca === M.d.colorMarca, 'i també a la barra del SOS');
}

/* ── 2b · TOT EL SOS A DINS DEL SOS (10/10/2026) ──────────────────────────
   La cara pública parla de tres ofertes, i les eines del SOS una per una
   només surten a la seva barra. */
console.log('\n2b · Dues barres: el lloc i el SOS');
{
  const lloc = A.d.portes.flatMap(g => g.destins);
  ['/SOS/matriu.html', '/SOS/banc-temps.html', '/SOS/habitatge.html', '/SOS/molekulandia.html']
    .forEach(h => ok(!lloc.includes(h), `la barra del lloc no porta ${h}`));
  ['/SOS/diagnostic.html', '/mapa-web/', '/SOS/', '/SOS/formacio.html']
    .forEach(h => ok(lloc.includes(h), `i sí ${h}`));
  ok(M.d.portes.length === SOS_GRUPS.length, `a /SOS/matriu: ${M.d.portes.map(p => p.lbl).join(' · ')}`);
  ok(M.d.cta === '/SOS/', `l'acció del SOS és obrir-lo (${M.d.cta})`);
  const casa = await M.pg.evaluate(() => (document.querySelector('.tt-nav .tn-casa') || {}).getAttribute?.('href'));
  ok(casa === '/', 'i hi ha camí de tornada a la portada');
}

/* ── 3 · Les portes s'obren, i a mòbil també ────────────────────────────── */
console.log('\n3 · Prémer, sense que la prova faci l\'scroll per tu');
/* ── PER QUÈ AIXÒ ES MESURA AIXÍ ──────────────────────────────────────────
   La primera versió feia `pg.click('.tn-g:nth-of-type(N) > summary')`, i
   **Playwright fa l'scroll fins a l'element abans de prémer-lo**. Passava en
   verd mentre a 360 px només es veien **dues portes de cinc**: les altres tres
   eren fora de pantalla, dins d'una fila que lliscava sense cap senyal. La
   prova arribava a una porta que una persona no pot trobar.

   Ara no es fa servir cap selector amb scroll automàtic: només es prem el que
   **ja es veu**, comprovant amb `elementFromPoint` que no hi hagi res aliè al
   damunt. Si una porta no s'assoleix sense lliscar res, això peta. */
for (const [nom, p, w] of [['sobretaula', 'SOS/vna.html', 1280],
  ['mòbil estret', 'index.html', 360], ['mòbil', 'index.html', 390],
  ['mòbil ample', 'SOS/vna.html', 414], ['tauleta', 'SOS/formacio.html', 768],
  ['mòbil estret, barra del SOS', 'SOS/matriu.html', 360]]) {
  const { pg, d } = await llegeix(p, w);
  /* L'alçada **tancada**, abans d'obrir res: amb el menú obert la barra creix
     a posta, i mesurar-la al final deia 280 px d'una barra que en fa 94. */
  const altTancada = await pg.evaluate(() =>
    Math.round(document.querySelector('.tt-nav').getBoundingClientRect().height));

  const r = await pg.evaluate(() => {
    /* Visible de debò i sense res aliè al damunt. `elementFromPoint` pot
       tornar un avantpassat —el `<nav>` hi pinta la seva pròpia capa— i això
       no és «tapat»: el que es busca és que no hi hagi res **d'una altra
       branca** a sobre. */
    const vist = e => {
      const c = e.getBoundingClientRect();
      if (!(c.height > 4 && c.top >= 0 && c.bottom <= innerHeight)) return 'fora de pantalla';
      const dalt = document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2);
      if (!dalt) return 'res al punt';
      return (dalt === e || e.contains(dalt) || dalt.contains(e)) ? null
        : 'tapat per ' + dalt.tagName;
    };
    const nav = document.querySelector('.tt-nav');
    const ms = nav.querySelector('.tn-ms');
    const ambBoto = ms && getComputedStyle(ms).display !== 'none';
    /* A mòbil hi ha un pas abans: «Menú». Ha de veure's d'entrada. */
    let errBoto = null;
    if (ambBoto) { errBoto = vist(ms); if (!errBoto) ms.click(); }
    const portes = [...document.querySelectorAll('.tn-g > summary')].map(sm => {
      const t = sm.textContent.trim().slice(0, 14);
      let per = vist(sm);
      if (per) return { t, ok: false, per };
      sm.click();
      const g = sm.parentElement, a = g.querySelector('.tn-p a');
      per = g.open ? (a ? vist(a) : 'cap enllaç al panell') : 'no s\'obre';
      sm.click();
      return { t, ok: !per, per };
    });
    return { ambBoto, errBoto, portes,
      desborda: document.documentElement.scrollWidth > innerWidth + 1 };
  });

  if (r.ambBoto) ok(!r.errBoto, `${nom} (${w}px): «Menú» es veu i es pot prémer${r.errBoto ? ' — ' + r.errBoto : ''}`);
  else ok(true, `${nom} (${w}px): les portes surten en línia, sense desplegable`);
  const bones = r.portes.filter(x => x.ok);
  ok(bones.length === r.portes.length,
    `${nom} (${w}px): les ${r.portes.length} portes s'assoleixen sense lliscar res i el seu panell es pot clicar`
    + (bones.length === r.portes.length ? '' : ` — ${r.portes.filter(x => !x.ok).map(x => x.t + ': ' + x.per).join(' · ')}`));
  /* I que la barra tancada no es mengi la pantalla: era de 177 px amb les
     portes en columna sempre obertes, i treia el hero de la primera pantalla. */
  ok(altTancada <= 100, `${nom} (${w}px): la barra tancada fa ${altTancada} px`);
  ok(!r.desborda, `${nom} (${w}px): i no desborda de costat`);
  await pg.close();
}

/* ── 4 · Des del mapa de valor s'arriba a les pàgines de la casa en un gest
   Abans, des d'una pàgina del SOS calien dues passes: el menú no portava a
   `cataleg` ni a `qui-som` perquè el grup de l'arrel era l'únic amb rutes
   relatives i la portada tenia una barra diferent. */
console.log('\n4 · Des de /vna, la casa és a un clic');
{
  const dins = V.d.portes.flatMap(g => g.destins);
  ['/cataleg.html', '/qui-som.html', '/SOS/vna-suport.html', '/SOS/'].forEach(h =>
    ok(dins.includes(h), `/vna porta a ${h} des de la barra`));
}

/* ── 4b · ELS DOS NEGOCIS, SEPARATS ───────────────────────────────────────
   És la frase que demanava aquest canvi: «estem barrejant coses». Abans el
   calaix d'eines portava la MATRIU **i** Molekulandia, el d'aprenentatge
   portava la Fàbrica de Superherois i el de xarxa el Comando. Es mesura sobre
   la pantalla i no sobre la declaració: quina porta ensenya cada cosa. */
console.log('\n4b · Molekulandia no és al calaix d\'eines');
{
  const porta = h => (M.d.portes.find(g => g.destins.includes(h)) || {}).lbl;
  const sos = M.d.portes.find(g => /eines/.test(g.lbl));
  const mon = M.d.portes.find(g => /Molekulon/.test(g.lbl));
  ok(!!sos && !!mon, `hi ha una porta «Les eines» i una «Molekulon» · ${M.d.portes.map(p => p.lbl).join(' | ')}`);
  ['/SOS/molekulandia.html', '/SOS/molekulon.html', '/SOS/escola.html', '/SOS/joc.html', '/SOS/uneix-te.html']
    .forEach(h => ok(porta(h) === mon.lbl, `${h} és a «${mon.lbl}» i no a cap altra · surt a «${porta(h)}»`));
  ['/SOS/matriu.html', '/SOS/banc-temps.html', '/SOS/online.html']
    .forEach(h => ok(porta(h) === sos.lbl, `${h} és a «${sos.lbl}» · surt a «${porta(h)}»`));
  /* I el Comando no hi és: la seva adreça fa 301 cap a l'altra casa. */
  ok(!M.d.portes.flatMap(g => g.destins).some(h => /comando/.test(h)),
    'i cap destí de la barra porta a comando.html: la seva adreça fa 301 cap a molekulon.org');
}

/* ── 4c · LA FRONTERA, A LA PANTALLA ──────────────────────────────────────
   Els sis destins de l'altra casa han de sortir **marcats com a tals**: qui
   els prem canvia de domini i ho ha de poder veure abans de prémer, no
   després. I han de ser exactament els sis que la frontera declara. */
console.log('\n4c · Els destins de l\'altra casa es veuen que ho són');
{
  const { readFileSync } = await import('node:fs');
  const doc = readFileSync(join(ARREL, 'SOS', 'knowledge', 'negoci', 'frontera-molekulon.md'), 'utf8');
  const declarades = ((doc.match(/MOLEKULON-PAGINES\n([\s\S]*?)```/) || [])[1] || '')
    .split('\n').map(x => x.trim()).filter(x => x.startsWith('/'));
  const fora = M.d.portes.flatMap(g => g.destins).filter(h => /^https?:/.test(h));
  ok(fora.length === declarades.length && fora.length === 6,
    `${fora.length} destins cap a molekulon.org, els ${declarades.length} que declara la frontera`);
  const marcats = await M.pg.evaluate(() =>
    [...document.querySelectorAll('nav.tt-nav .tn-p a')]
      .filter(a => /^https?:/.test(a.getAttribute('href')))
      .map(a => ({ h: a.getAttribute('href'), rel: a.rel, avis: !!a.querySelector('.tn-f') })));
  ok(marcats.length === 6 && marcats.every(x => x.avis),
    'i tots sis diuen «molekulon.org ↗» abans de prémer-los');
  ok(marcats.every(x => /noopener/.test(x.rel)), 'i tots sis porten rel="noopener"');
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
  /* El menú de mòbil **sí** que porta script des del 05/10/2026, i és a posta:
     cinc portes no caben en una barra curta a 360 px, i les tres maneres de
     fer-ho sense JavaScript es van mesurar i cap aguantava —la columna sempre
     oberta treia el hero de la primera pantalla, la fila que lliscava amagava
     dues portes de cinc, i el `<details>` que les embolcallava es pintava i no
     es podia clicar a sobretaula. El que es vigila, doncs, no és que no hi
     hagi script: és que **n'hi hagi un de sol, dins del bloc generat**, i cap
     rastre del burger que hi havia abans.

     `premsa.html` hi entra: des del #190 porta la pell i la barra com la
     resta, i una pàgina amb barra que la prova no mira és una barra sense
     vigilància. */
  const dolentes = [];
  for (const p of [...PAGINES, 'index.html', 'cataleg.html', 'qui-som.html', 'premsa.html']) {
    const f = join(ARREL, PAGINES.includes(p) ? 'SOS' : '', p);
    const src = readFileSync(f, 'utf8');
    if (/navBurger|nav-open/.test(src)) dolentes.push(p + ' (rastre del burger)');
    const i = src.indexOf('<!--TT-NAV-->'), j = src.indexOf('<!--/TT-NAV-->');
    const bloc = i >= 0 && j > i ? src.slice(i, j) : '';
    const fora = (i < 0 ? src : src.slice(0, i) + src.slice(j));
    const n = (bloc.match(/<script>/g) || []).length;
    if (n !== 1) dolentes.push(`${p} (${n} scripts al bloc)`);
    if (/\.tn-ms|dataset\.menu/.test(fora)) dolentes.push(p + ' (toca el menú des de fora del bloc)');
  }
  ok(!dolentes.length, 'un sol script del menú per pàgina, dins del bloc generat, i cap rastre del burger'
    + (dolentes.length ? ': ' + dolentes.slice(0, 3).join(', ') : ''));
}

/* ── 8 · Sense errors a cap pàgina amb barra ─────────────────────────────── */
console.log('\n8 · El fre');
{
  const { readFileSync } = await import('node:fs');
  const totes = PAGINES.map(p => 'SOS/' + p)
    .concat(['index.html', 'cataleg.html', 'qui-som.html', 'premsa.html']);
  const dolentes = [];
  for (const p of totes) {
    const { pg, d, errs } = await llegeix(p);
    if (errs.length) dolentes.push(`${p}: ${errs[0].slice(0, 60)}`);
    if (!d || d.barres !== 1) dolentes.push(`${p}: ${d ? d.barres : 0} barres`);
    await pg.close();
  }
  ok(!dolentes.length, `les ${totes.length} pàgines amb barra: una barra i cap error de JS`
    + (dolentes.length ? ' — ' + dolentes.slice(0, 3).join(' · ') : ''));
  /* Les excepcions no es compten: es comprova que **cap d'elles porti barra** i
     que totes tinguin el motiu escrit. Comptar-les feia que afegir-ne una de
     legítima petés amb «3 no és 2», que no diu res del defecte que importa.
     `comando.html` n'és la tercera des del 05/10/2026: ja no se serveix. */
  const ambBarra = Object.keys(EXCEPCIONS).filter(p => {
    const f = join(ARREL, 'SOS', p);
    return readFileSync(f, 'utf8').includes('<nav class="tt-nav"');
  });
  ok(!ambBarra.length && Object.keys(EXCEPCIONS).every(p => EXCEPCIONS[p].length > 30),
    `i les ${Object.keys(EXCEPCIONS).length} excepcions no porten barra i diuen per què`
    + (ambBarra.length ? ' — en porten: ' + ambBarra.join(', ') : ''));
}

await A.pg.close(); await V.pg.close(); await C.pg.close(); await M.pg.close();
await b.close();
console.log('\n' + (fail ? `❌ ${fail} fallen de ${pass + fail}` : `✅ ${pass} assercions, totes verdes`));
process.exit(fail ? 1 : 0);
