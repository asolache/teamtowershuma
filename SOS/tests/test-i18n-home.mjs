/* Les dues llengües arriben a tota la portada
 * ─────────────────────────────────────────────────────────────────────────────
 * `check-landing.js` comprova que **les claus que hi ha** quadrin: cap
 * repetida, les dues llengües amb les mateixes, cap òrfena i cap morta. Tot
 * verd, i el 02/10/2026 **quatre seccions senceres es llegien en català amb el
 * castellà posat**: `#rols`, `#xarxa`, `#rengles` i `#dues-vistes`.
 *
 * El motiu és que eren blocs **generats**, i els generadors declaraven el text
 * només en català. Les claus que hi havia quadraven perfectament; el que
 * faltava era clau. Una guarda que compta el que hi ha mai no troba el que no
 * hi és.
 *
 * ── Per què això és una prova i no una guarda ───────────────────────────────
 * Es va intentar com a regla estàtica a `check-landing.js` i **comptava 61
 * falsos positius**: un `<strong>` dins d'un `<p data-i18n-html>` no té clau
 * pròpia i no li fa falta, perquè el diccionari substitueix l'HTML del pare, i
 * una expressió regular no sap on acaba un paràgraf llarg. La mesura de debò
 * demana el DOM i la llengua canviada, i això només ho pot fer un navegador.
 *
 * ── El sostre, i per què no és zero ─────────────────────────────────────────
 * El que queda fora són tres coses, i es diuen:
 *
 *   · **Els `<title>` dels dibuixos** — text de passar-hi el ratolí per sobre.
 *     Surten dels noms de node i de les etiquetes de cada lliurament del cas:
 *     són ~80 cadenes i es tradueixen quan el cas es declari en dues llengües.
 *   · **Les frases que el generador munta comptant** —«3 vents sobre una sola
 *     posició»—, que es fan amb trossos i una xifra. Traduir-les vol declarar
 *     cada tros, i és la pròxima tanda.
 *   · **Els noms de les dimensions** d'una variable (A, B, C… o «Temps
 *     constant»), que vénen del SOS i ja tenen el seu propi diccionari allà.
 *
 * El sostre és **la xifra mesurada**, no una d'inventada, i baixa quan es
 * tradueix alguna d'aquestes tres. Puja només amb el motiu escrit, com el del
 * pes: un sostre que es relaxa sol no és un sostre.
 *
 * Ús:  node SOS/tests/test-i18n-home.mjs
 */
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const PORTADA = pathToFileURL(join(import.meta.dirname, '..', '..', 'index.html')).href;

/* Les mesures d'avui. Cada secció té la seva perquè una regressió en una no
   s'ha de poder amagar darrere d'una millora en una altra. */
const SOSTRE = { rengles: 29, 'dues-vistes': 19, xarxa: 10, rols: 1 };
const TOTAL = Object.values(SOSTRE).reduce((a, b) => a + b, 0);

/* Paraules que només existeixen en català. No és un detector de llengua: és
   una xarxa prou espessa per caçar un paràgraf sencer sense traduir, que és el
   defecte que es busca. */
const CA = /\b(amb|aquest|aquesta|això|què|però|perquè|lliurament|lliuraments|rengla|rengles|cadascú|dues|surten|tenen|buides|seva|àrees)\b/i;

let fail = 0;
const ok = (c, m) => { if (c) console.log('  ✓ ' + m); else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
p.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await p.goto(PORTADA);

/* ── 1 · El commutador existeix i fa alguna cosa ─────────────────────────── */
console.log('\n1 · La pàgina es pot llegir en castellà');
{
  const abans = await p.evaluate(() => document.querySelector('.hero-desc').textContent.slice(0, 40));
  await p.click('.lang-btn[data-lang="es"]');
  await p.waitForTimeout(400);
  const despres = await p.evaluate(() => ({
    hero: document.querySelector('.hero-desc').textContent.slice(0, 40),
    lang: document.documentElement.lang,
    actiu: document.querySelector('.lang-btn.active').dataset.lang
  }));
  ok(despres.actiu === 'es', 'el botó es marca com a actiu');
  ok(despres.hero !== abans, 'i el hero canvia de debò: ' + despres.hero + '…');
  ok(despres.lang === 'es', `i l'atribut \`lang\` de la pàgina ho diu (${despres.lang}) — `
    + 'sense això un lector de pantalla llegeix castellà amb fonètica catalana');
}

/* ── 2 · LA QUE IMPORTA · què es queda en català ─────────────────────────── */
console.log('\n2 · I no es queda cap secció sencera en l\'altra llengua');
{
  const r = await p.evaluate(sCA => {
    const re = new RegExp(sCA, 'i');
    const out = {};
    document.querySelectorAll('section[id]').forEach(s => {
      const w = document.createTreeWalker(s, NodeFilter.SHOW_TEXT);
      let n, c = 0, mostra = [];
      while ((n = w.nextNode())) {
        const t = n.textContent.trim();
        if (t.length < 12) continue;
        if (!re.test(t)) continue;
        c++;
        if (mostra.length < 2) mostra.push(t.slice(0, 48));
      }
      if (c) out[s.id] = { c, mostra };
    });
    return out;
  }, CA.source);

  const tot = Object.values(r).reduce((a, x) => a + x.c, 0);
  /* Primer el total, que és el que diu si la pàgina ha millorat o empitjorat. */
  ok(tot <= TOTAL, `${tot} fragments en català amb el castellà posat (sostre ${TOTAL})`
    + (tot > TOTAL ? ' — ha empitjorat: hi ha text nou sense clau' : ''));

  /* I secció per secció, perquè una regressió en una no es pugui amagar
     darrere d'una millora en una altra. */
  Object.keys(SOSTRE).forEach(id => {
    const n = (r[id] || { c: 0 }).c;
    ok(n <= SOSTRE[id], `#${id}: ${n} de ${SOSTRE[id]}`
      + (n > SOSTRE[id] ? ' — ' + (r[id].mostra || []).join(' · ') : ''));
  });

  /* I cap secció **nova** amb text sense traduir. És el cas que el total sol
     deixaria passar: afegir una secció en català i treure fragments d'una
     altra donaria la mateixa xifra. */
  const noves = Object.keys(r).filter(id => !(id in SOSTRE));
  ok(!noves.length, 'i cap secció nova sense traduir'
    + (noves.length ? ': ' + noves.map(id => `#${id} (${r[id].c}) «${r[id].mostra[0]}»`).join(', ') : ''));
}

/* ── 3 · Les seccions que han d'estar senceres, ho estan ─────────────────── */
console.log('\n3 · El que es ven, en castellà de dalt a baix');
{
  /* Les quatre que decideixen una compra. Si una d'aquestes es llegeix en
     català, qui ve de l'altra llengua conclou que això no va amb ell. */
  const r = await p.evaluate(() => {
    const t = id => (document.getElementById(id) || { innerText: '' }).innerText;
    return {
      hero: document.querySelector('.hero').innerText,
      cataleg: t('cataleg'),
      enfoc: t('enfoc'),
      cost: t('cost')
    };
  });
  Object.entries(r).forEach(([k, v]) => {
    const n = v.split('\n').filter(x => x.trim().length > 12 && CA.test(x)).length;
    ok(n === 0, `${k}: cap línia en català` + (n ? ` — ${n} línies` : ''));
  });
}

/* ── 4 · I tornar al català no deixa res a mitges ────────────────────────── */
console.log('\n4 · I es pot tornar');
{
  await p.click('.lang-btn[data-lang="ca"]');
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => ({
    lang: document.documentElement.lang,
    es: [...document.querySelectorAll('[data-i18n]')]
      .filter(e => /\b(pero|porque|aqu[ií]|esto|tambi[eé]n|qu[eé] a qui[eé]n)\b/i.test(e.textContent)).length
  }));
  ok(r.lang === 'ca', 'l\'atribut `lang` torna a ca');
  ok(r.es === 0, `i no queda cap element amb el castellà posat (${r.es})`);
}

await ctx.close();
await b.close();
console.log(fail ? `\n❌ ${fail} fallen` : '\n✅ Les dues llengües arriben on han d\'arribar');
process.exit(fail ? 1 : 0);
