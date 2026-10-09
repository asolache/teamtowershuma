/* `/vna` · el llenç, i les quatre coses que la pàgina ven
 *
 * Va a part de `test-vna.mjs`, que prova **la colla castellera** —els dotze
 * rols, les dues menes de lliurament, qui només dona i el cost de treure un
 * node— i segueix valent: aquella secció no ha desaparegut, ha baixat al final
 * de la pàgina. Això d'aquí prova el que és nou.
 * ─────────────────────────────────────────────────────────────────────────────
 * La pàgina del mapa de valor era **explicativa**: catorze seccions de text amb
 * el dibuix a la cinquena, 32 mides de lletra per sota de 0,8rem i dos
 * `data-i18n` a tot el fitxer —els del menú generat—, de manera que era l'única
 * pàgina del lloc que no es podia llegir en castellà. I el mètode hi era sencer
 * **en text**: el zoom de Verna Allee i la seqüència de la passa 4 s'explicaven
 * i no es podien fer.
 *
 * Ara és un llenç i vuit lectures, i les quatre coses que les fan servir
 * —commutar de vista, mirar-se un tros, entrar en un node i recórrer un
 * procés— acaben totes en **una classe de CSS**. Aquest és el problema:
 *
 *   **Cap d'elles peta si desapareix.** El dibuix es queda igual de maco, els
 *   botons deixen de fer res i la pàgina es publica. És el mateix defecte que
 *   els polsos invisibles d'ahir i les divuit claus mortes del pressupost, i
 *   el que el troba no és llegir el codi: és **comptar el que es veu a la
 *   pantalla** abans i després de prémer.
 *
 * Per això totes les comprovacions d'aquí es fan **sobre l'opacitat calculada
 * del navegador** i no sobre les classes: una regla de CSS que no arribi a la
 * pàgina deixaria les classes posades i no apagaria res.
 *
 * Ús:  node SOS/tests/test-vna-llenc.mjs
 */
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const ARREL = join(import.meta.dirname, '..', '..');
const VNA = pathToFileURL(join(ARREL, 'SOS', 'vna.html')).href;

let fail = 0;
const ok = (c, m) => { if (c) console.log('  ✓ ' + m); else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const nova = async (w = 1440, h = 1000) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(VNA);
  await p.waitForTimeout(400);
  p.__errs = errs;
  return p;
};
/* El que es veu, no el que està marcat. Les transicions duren 450 ms i mesurar
   abans donaria sempre el dibuix sencer, que és com aquesta prova va estar un
   moment dient que el focus funcionava quan encara no hi era. */
const veu = async p => { await p.waitForTimeout(600); return p.evaluate(() => {
  const svg = document.querySelector('.lz-full:not([hidden]) .mv-svg');
  const op = n => parseFloat(getComputedStyle(n).opacity);
  return { id: svg.id,
    f: [...svg.querySelectorAll('.mv-f')].filter(n => op(n) > .2).length,
    n: [...svg.querySelectorAll('.mv-n')].filter(n => op(n) > .2).length };
}); };

console.log('\n/vna · el llenç i les vuit lectures');

/* ══ 1 · EL TERRA TIPOGRÀFIC ═════════════════════════════════════════════════
   El que s'ha demanat, i el que més fàcil torna a caure: una regla nova amb
   `font-size:.72rem` no peta ni desquadra res.

   Per a un `<text>` dins d'un SVG la mida és **en unitats del `viewBox`**: la
   de debò és la unitat per l'escala del dibuix. Mesurar `font-size` i prou
   diria que les etiquetes del graf fan 14 px quan en fan 15,3 — o al revés. */
{
  const p = await nova();
  const petits = await p.evaluate(() => {
    const esc = n => { const s = n.ownerSVGElement; if (!s) return 1;
      const vb = s.viewBox.baseVal, r = s.getBoundingClientRect();
      return (vb && vb.width) ? r.width / vb.width : 1; };
    const out = [];
    document.querySelectorAll('body *').forEach(n => {
      if (!n.textContent || !n.textContent.trim() || n.children.length) return;
      /* El menú el genera `build-nav.js` i viu a vint-i-tres pàgines: pujar-li
         la lletra és un canvi d'allà. Hi ha entrada al backlog, i el motiu
         escrit és el que distingeix una excepció d'un oblit. */
      if (n.closest('.tt-nav')) return;
      if (!n.getBoundingClientRect().width) return;
      const fs = parseFloat(getComputedStyle(n).fontSize) * (n.ownerSVGElement ? esc(n) : 1);
      if (fs < 15) out.push([Math.round(fs * 10) / 10, n.textContent.trim().slice(0, 24)]);
    });
    return out;
  });
  ok(!petits.length, `cap text per sota de 15 px a la pàgina renderitzada`
    + (petits.length ? ` — ${petits.length}: ` + petits.slice(0, 4).map(x => x[0] + 'px «' + x[1] + '»').join(', ') : ''));
  ok(!p.__errs.length, 'cap error de JavaScript en obrir la pàgina' + (p.__errs[0] ? ': ' + p.__errs[0] : ''));
  await p.context().close();
}

/* ══ 2 · LES DUES VISTES ═════════════════════════════════════════════════════
   No que hi hagi dos botons: que el que es veu sigui diferent. Una pestanya
   que no canvia res no peta i no es veu. */
{
  const p = await nova();
  const estat = () => p.evaluate(() => ({
    mapa: !document.getElementById('lz-mapa').hidden,
    castell: !document.getElementById('lz-castell').hidden,
    plantes: document.querySelectorAll('#lz-castell .pl-svg').length
  }));
  const a = await estat();
  await p.click('[data-vista=castell]');
  const c = await estat();
  ok(a.mapa && !a.castell, 'es comença per la vista mapa');
  ok(!c.mapa && c.castell, 'i el commutador amaga de debò la que no toca');
  ok(c.plantes >= 1, 'la vista castell porta la planta de la pinya');
  await p.context().close();
}

/* ══ 3 · EL FOCUS, I EL CAMÍ DE TORNADA ══════════════════════════════════════
   «Ara posem el focus en una part del graf i al final es pot veure tot.» Un
   botó de focus que no apaga res no peta i no es veu; i un focus sense sortida
   és un cul-de-sac, que és la veda 62.

   I la regla que es va trobar mirant el dibuix: **un lliurament encès ha de
   tenir els dos extrems visibles.** «Només el camí del canal» ensenyava el
   distribuïdor amb dues fletxes que anaven a la foscor, i el dibuix deia que
   aquell rol lliura al no-res. */
{
  const p = await nova();
  const tot = await veu(p);
  await p.click('[data-foc=canal]');
  const foc = await veu(p);
  ok(foc.f < tot.f && foc.n < tot.n, `el focus apaga: ${tot.f}→${foc.f} fletxes, ${tot.n}→${foc.n} rols`);
  ok(foc.f >= 1 && foc.n >= 2, 'i el que queda encès té els dos extrems de cada fletxa');
  await p.click('[data-foc=""]');
  const torna = await veu(p);
  ok(torna.f === tot.f && torna.n === tot.n, '«veure-ho tot» torna el dibuix sencer');
  /* I per node, que és l'altra meitat del gest: tocar un rol del dibuix. */
  await p.click('.mv-n[data-id=poble]');
  const un = await veu(p);
  ok(un.f > 0 && un.f < tot.f && un.n > 1 && un.n < tot.n,
    `tocar un rol se'l mira a ell i els seus veïns: ${un.f} fletxes, ${un.n} rols`);
  await p.context().close();
}

/* ══ 4 · EL ZOOM · un node conté un mapa ═════════════════════════════════════
   El de la metodologia i no un gest de pinça: *«en una casa gran no es mapa tot
   en un sol dibuix: es fa amb zoom»*.

   Tres coses, i cap es veu mirant la pantalla: que el dibuix que es veu sigui
   **un altre**, que hi hagi camí de tornada, i que els comandaments del mapa
   sencer no manin sobre un nivell de dins —el pols d'aquell dibuix és un altre
   i «el camí del canal» no vol dir res allà. */
{
  const p = await nova();
  const fora = await veu(p);
  await p.click('[data-obre=acollida]');
  const dins = await veu(p);
  ok(dins.id !== fora.id, `entrar en un rol canvia el dibuix: ${fora.id} → ${dins.id}`);
  ok(dins.n >= 2 && dins.n <= 12, `el nivell de dins té ${dins.n} rols, i el sostre del mètode és 12`);
  const molla = await p.evaluate(() => ({
    niv: [...document.querySelectorAll('.lz-niv')].filter(n => !n.hidden).map(n => n.textContent.trim()),
    tornar: !document.querySelector('[data-tornar]').hidden,
    apagats: document.querySelector('[data-foc=canal]').disabled
  }));
  ok(molla.niv.length === 1 && molla.niv[0], 'la molla de pa diu on ets: «' + molla.niv[0] + '»');
  ok(molla.tornar, 'i hi ha camí de tornada');
  ok(molla.apagats, 'els comandaments del mapa sencer s\'apaguen a dins');
  await p.click('[data-tornar]');
  const altre = await veu(p);
  ok(altre.id === fora.id && altre.f === fora.f, 'tornar deixa el mapa sencer com estava');
  /* I amb teclat: un `g` amb `onclick` i sense `tabindex` és un botó que només
     existeix per a qui té ratolí, i no peta mai. */
  const tecla = await p.evaluate(() => {
    const g = document.querySelector('[data-dins]');
    return { tab: g.getAttribute('tabindex') === '0', rol: g.getAttribute('role') === 'button',
      diu: !!g.querySelector('.mv-dinsn') };
  });
  ok(tecla.tab && tecla.rol, 'els rols que s\'obren són botons de debò (tabindex i role)');
  ok(tecla.diu, 'i diuen quants rols hi trobaràs abans d\'entrar-hi');
  await p.context().close();
}

/* ══ 5 · LA SEQÜÈNCIA · la passa 4, feta amb el dibuix ═══════════════════════
   «Validar el mapa seqüenciant transaccions.» Fins avui era text: cap
   transacció sabia quan passa i el pols repartia els retards per ordre de
   declaració, que no és cap ordre.

   I el que no entra a la seqüència és l'argument que el cas regala: *els
   intangibles sovint passen «tot el temps»*, i per això no surten a cap
   diagrama de procés. Ha de sortir dit, i **no** dins del recorregut. */
{
  const p = await nova();
  const seq = await p.evaluate(() => ({
    processos: document.querySelectorAll('.sq').length,
    fletxes: document.querySelectorAll('#mvCellerVna .mv-f[data-seq]').length,
    sempre: document.querySelectorAll('#mvCellerVna .mv-f[data-seq=sempre]').length
  }));
  ok(seq.processos >= 2, `${seq.processos} processos declarats, i no un: el mètode ho diu en plural`);
  ok(seq.fletxes === 16, `les ${seq.fletxes} transaccions saben quan passen`);
  ok(seq.sempre >= 1, `${seq.sempre} que no entra a cap ordre, i es diu per què`);
  await p.click('[data-seq=visita]');
  await p.waitForTimeout(200);
  const u = await p.evaluate(() => {
    const svg = document.getElementById('mvCellerVna');
    return { enceses: svg.querySelectorAll('.mv-f.pas').length,
      passos: document.querySelectorAll('.sq.on .sq-l li').length,
      ara: (document.querySelector('.sq-l li.ara') || {}).dataset?.pas,
      capSempre: [...document.querySelectorAll('.sq-l li')].some(li => li.dataset.pas === 'sempre') };
  });
  ok(u.enceses === 1, 'el recorregut encén una fletxa per pas, no totes');
  ok(u.passos >= 2, `i la llista en té ${u.passos}`);
  ok(u.ara && /:1$/.test(u.ara), 'comença pel primer pas: ' + u.ara);
  ok(!u.capSempre, 'i el que passa «tot el temps» no hi surt com a pas');
  await p.waitForTimeout(1800);
  const dos = await p.evaluate(() => (document.querySelector('.sq-l li.ara') || { dataset: {} }).dataset.pas);
  ok(dos && dos !== u.ara, `i avança sol: ${u.ara} → ${dos}`);
  /* Prémer un pas de la llista, que és l'única manera de recórrer-ho per a qui
     ha demanat que les coses no es moguin. */
  await p.click('.sq.on .sq-l li:last-child');
  await p.waitForTimeout(200);
  const ma = await p.evaluate(() => (document.querySelector('.sq-l li.ara') || { dataset: {} }).dataset.pas);
  ok(ma && ma !== dos, 'i cada pas de la llista es pot prémer a mà');
  await p.context().close();
}

/* ══ 6 · LES DUES LLENGÜES ═══════════════════════════════════════════════════
   Es mira **la pantalla sencera** i no les claus: una clau sense entrada deixa
   el català escrit al marcatge, i això es llegeix com si la traducció hi fos.
   És la regla que al pressupost va trobar divuit claus mortes i vint-i-nou
   cadenes sense clau, i cap de les dues coses petava.

   La colla castellera del final queda fora amb el motiu escrit: els dotze rols
   són còpia literal de `COLLA_CA` de la portada i una guarda els compara
   paraula per paraula (veda 116). Traduir-los vol dir traduir-los als dos
   llocs alhora, i és la fase següent. */
{
  const p = await nova();
  await p.click('.lang-b[data-lang=es]');
  await p.waitForTimeout(400);
  const es = await p.evaluate(() => ({
    lang: document.documentElement.lang,
    h1: document.querySelector('h1').textContent,
    node: (document.querySelector('.mv-n[data-id=vi] .mv-es') || {}).textContent,
    rol: document.querySelector('.mv-nd b').textContent,
    molla: document.querySelector('.lz-molla').getAttribute('aria-label'),
    tornar: !!document.querySelector('[data-tornar]')
  }));
  ok(es.lang === 'es', 'el commutador posa `lang="es"` a la pàgina');
  ok(/Quién/.test(es.h1), 'el títol es tradueix: «' + es.h1.slice(0, 34) + '»');
  ok(/Quién/.test(es.node || ''), 'i les etiquetes de dins del dibuix també');
  ok(/Quién|vino/.test(es.rol), 'i les fitxes dels rols');
  ok(/Dónde/.test(es.molla || ''), 'i les etiquetes d\'accessibilitat');
  ok(es.tornar, 'i el botó de tornar segueix existint — una clau de text damunt '
    + 'd\'un element amb fills els substitueix tots, i així va perdre\'s una vegada');
  /* El text que queda en català, fora de la colla: ha de ser cap. Es mesura
     buscant paraules que el castellà no té. */
  const cat = await p.evaluate(() => {
    const RE = /\b(què|això|perquè|amb|però|aquest|aquesta|nosaltres|també|molt bé|lliurament|lliuraments|dibuix|xarxa|casa seva)\b/i;
    const out = [];
    document.querySelectorAll('.lz *, .mv-sec *').forEach(n => {
      if (n.children.length || !n.textContent.trim()) return;
      if (n.closest('#colla')) return;            // la colla, amb el motiu escrit
      /* Les etiquetes dels dibuixos s'escriuen **una per llengua** i el CSS
         n'amaga una: la catalana hi és al marcatge i no es veu, que és
         precisament el que ha de passar. */
      if (!n.getClientRects().length) return;
      if (RE.test(n.textContent)) out.push(n.textContent.trim().slice(0, 44));
    });
    return [...new Set(out)];
  });
  ok(!cat.length, 'cap fragment en català al llenç ni a les seccions de mètode'
    + (cat.length ? ` — ${cat.length}: ` + cat.slice(0, 3).join(' · ') : ''));
  await p.context().close();
}

/* ══ 7 · A TELÈFON ═══════════════════════════════════════════════════════════
   El dibuix demana 700 px per tenir la lletra a 15, i la pantalla en té 390: la
   resposta és que **el dibuix es desplaça dins de la seva caixa**, no que
   s'empetiteixi fins que no es llegeixi. El que no pot passar és que arrossegui
   la pàgina sencera, que és el que feia abans de posar `min-width:0` als tres
   elements de graella que el contenen. */
{
  const p = await nova(390, 844);
  const m = await p.evaluate(() => ({
    sobra: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    caixa: Math.round(document.querySelector('.lz-full').clientWidth),
    dins: Math.round(document.querySelector('.lz-full').scrollWidth)
  }));
  ok(m.sobra === 0, `el cos de la pàgina no sobresurt a 390 px (sobren ${m.sobra})`);
  ok(m.dins > m.caixa, `i el dibuix es desplaça dins de la seva caixa (${m.caixa} de ${m.dins})`);
  await p.context().close();
}

await b.close();
console.log(fail ? `\n❌ ${fail} problema(es) a /vna.` : '\n✅ /vna · el llenç, el focus, el zoom, la seqüència i les dues llengües.');
process.exit(fail ? 1 : 0);
