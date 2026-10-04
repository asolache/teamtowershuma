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
 * El 03/10/2026 el que quedava es va tancar: els **mapes de valor** —els dos
 * dibuixos, els noms dels nodes, les 32 frases de les fletxes, els títols de les
 * plantes i les lectures que es munten comptant— ja es llegeixen en castellà.
 * Era el que l'Àlvar va veure: *«hay partes de la home que no se traducen al
 * castellano, concretamente los mapas de valor del celler de luxe»*.
 *
 * **El que queda són falsos positius, i per això el sostre no és zero.** Aquesta
 * xarxa caça paraules catalanes, i el castellà de la casa en manté unes quantes
 * a posta: `rengla`, `rengles`, `pinya` i `vent` són **noms de posició**, i el
 * diccionari de `#rols` ja els deixa igual en castellà —com «Baix», «Crossa» o
 * «Enxaneta»—. Una frase traduïda que digui «4 rengles · 1 primera mano» hi cau
 * i no és un defecte.
 *
 * La mesura que sí que ha de ser zero i que es comprova a part és
 * **cap fragment sense clau** (secció 5): un text que no té `data-i18n` no el
 * pot traduir ningú, i és el defecte que les altres regles no veuen.
 *
 * El sostre és **la xifra mesurada**, no una d'inventada. Puja només amb el
 * motiu escrit, com el del pes: un sostre que es relaxa sol no és un sostre.
 *
 * Ús:  node SOS/tests/test-i18n-home.mjs
 */
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const PORTADA = pathToFileURL(join(import.meta.dirname, '..', '..', 'index.html')).href;

/* Les mesures d'avui. Cada secció té la seva perquè una regressió en una no
   s'ha de poder amagar darrere d'una millora en una altra. */
const SOSTRE = { rengles: 27, 'dues-vistes': 3, xarxa: 3, rols: 1 };
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
  await p.click('.lang-b[data-lang="es"]');
  await p.waitForTimeout(400);
  const despres = await p.evaluate(() => ({
    hero: document.querySelector('.hero-desc').textContent.slice(0, 40),
    lang: document.documentElement.lang,
    actiu: document.querySelector('.lang-b.on').dataset.lang
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
  await p.click('.lang-b[data-lang="ca"]');
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => ({
    lang: document.documentElement.lang,
    es: [...document.querySelectorAll('[data-i18n]')]
      .filter(e => /\b(pero|porque|aqu[ií]|esto|tambi[eé]n|qu[eé] a qui[eé]n)\b/i.test(e.textContent)).length
  }));
  ok(r.lang === 'ca', 'l\'atribut `lang` torna a ca');
  ok(r.es === 0, `i no queda cap element amb el castellà posat (${r.es})`);
}

/* ── 5 · LA QUE HA DE SER ZERO · el que no té clau ────────────────────────
   Les regles de dalt compten **fragments en català**, i amb el vocabulari
   casteller mantingut a posta mai arribaran a zero. La que sí que hi ha
   d'arribar és aquesta: **un text sense `data-i18n` no el pot traduir ningú**.

   És el defecte que va deixar els dos mapes de valor sencers en català —el
   bloc del celler no en portava ni una, i les guardes donaven verd perquè les
   claus que hi havia, zero, quadraven perfectament. */
console.log('\n5 · I cap text de les seccions sense clau');
{
  await p.click('.lang-b[data-lang="es"]');
  await p.waitForTimeout(400);
  const sense = await p.evaluate(sCA => {
    const re = new RegExp(sCA, 'i');
    const out = [];
    document.querySelectorAll('section[id]').forEach(s => {
      const w = document.createTreeWalker(s, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        const t = n.textContent.trim();
        if (t.length < 12 || !re.test(t)) continue;
        let e = n.parentElement, k = null;
        while (e && !k) {
          k = e.getAttribute && (e.getAttribute('data-i18n') || e.getAttribute('data-i18n-html'));
          e = e.parentElement;
        }
        if (!k) out.push('#' + s.id + ' · ' + t.slice(0, 56));
      }
    });
    return out;
  }, CA.source);
  ok(!sense.length, `cap fragment sense clau (${sense.length})`
    + (sense.length ? ':\n      ' + sense.slice(0, 6).join('\n      ') : ''));
}

/* ── 6 · LA MÉS FORTA · tot el text dels blocs generats, cobert ───────────
   Les regles de dalt busquen **paraules catalanes**, i això té un límit que es
   va veure el 03/10/2026: la taula de la vista castell deia «Qui fa el vi»,
   «El poble», «El distribuïdor» amb el castellà posat, i **cap regla ho
   trobava** — cap d'aquells noms porta una paraula que una expressió regular
   reconegui com a catalana.

   Aquesta no mira la llengua: mira si **algú pot traduir aquell text**. Dins
   dels blocs generats, tot text ha d'estar cobert d'una d'aquestes tres
   maneres, i no n'hi ha cap altra:

   · una clau de diccionari (`data-i18n`),
   · una etiqueta per llengua al dibuix (`.mv-ca` / `.mv-es`), que es fa així
     perquè el salt de línia es calcula al generador,
   · els atributs del bloc del pols (`data-ca` / `data-es` / `data-sa-es`), que
     va així perquè el seu text canvia en prémer el botó.

   `#fentpinya` en queda fora a posta: el seu dibuix és **escrit a mà** i el que
   hi ha són els noms de les posicions —POM, PINYA, CROSSES—, que el castellà
   de la casa manté igual, com fa el diccionari de `#rols` amb «Baix» o
   «Enxaneta». */
console.log('\n6 · I tot el text dels blocs generats es pot traduir');
{
  const sense = await p.evaluate(() => {
    const out = [];
    ['dues-vistes', 'xarxa', 'rengles', 'rols'].forEach(id => {
      const s = document.getElementById(id);
      if (!s) return;
      const w = document.createTreeWalker(s, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        const t = n.textContent.trim();
        if (t.length < 3) continue;
        /* Xifres i separadors: no són text a traduir. Res més: el «de» d'una
           comparació sí que porta clau, encara que es digui igual, perquè una
           excepció aquí és el lloc per on entraria el pròxim tros sense
           traduir. */
        if (/^[\d\s·,.%–—:|()\/+-]+$/.test(t)) continue;
        let e = n.parentElement, k = null, altre = false;
        while (e && !k) {
          if (e.classList && (e.classList.contains('mv-ca') || e.classList.contains('mv-es')
            || e.classList.contains('mv-pols-ui'))) altre = true;
          k = e.getAttribute && (e.getAttribute('data-i18n') || e.getAttribute('data-i18n-html'));
          e = e.parentElement;
        }
        if (!k && !altre) out.push('#' + id + ' · ' + t.slice(0, 54));
      }
    });
    return [...new Set(out)];
  });
  ok(!sense.length, `tot el text dels quatre blocs generats es pot traduir (${sense.length} fora)`
    + (sense.length ? ':\n      ' + sense.slice(0, 8).join('\n      ') : ''));
}

await ctx.close();
await b.close();
console.log(fail ? `\n❌ ${fail} fallen` : '\n✅ Les dues llengües arriben on han d\'arribar');
process.exit(fail ? 1 : 0);
