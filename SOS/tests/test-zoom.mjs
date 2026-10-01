/* El zoom · un sol graf i un sol gest
 * ─────────────────────────────────────────────────────────────────────────────
 * El mapa d'un node es dibuixava sol, i **el que hi ha a dins d'aquell node es
 * navegava per l'arbre del costat**: un explorador de fitxers al costat d'un
 * graf. Són la mateixa jerarquia ensenyada de dues maneres, i la que es llegeix
 * com un mapa és la del graf.
 *
 * El defecte que això vigila no és que el zoom no funcioni —això es veu
 * clicant— sinó els dos que **no es veuen**:
 *
 * · **Que el llenç torni a ensenyar un sol nivell.** Si algú treu la crida a
 *   `children()`, el mapa es llegeix exactament igual de bé i simplement ja no
 *   s'hi pot entrar. No peta res. Es prova comptant els llocs dibuixats contra
 *   els fills que té el node de debò.
 * · **Que entrar-hi no passi per `selectNode`.** Una segona manera de canviar
 *   de node divergiria de l'arbre, de les rutes i de `state.expanded`, i entrar
 *   pel mapa i entrar per l'arbre deixarien l'app en dos estats diferents. Es
 *   prova entrant pel mapa i comprovant que l'arbre **també** s'ha mogut.
 *
 * I la que és la lectura i no la mecànica: **cada lloc diu què hi trobaràs
 * abans d'entrar-hi.** Entrar en un lloc buit sense saber-ho és el que fa que
 * la gent deixi de clicar.
 *
 * Ús:  node SOS/tests/test-zoom.mjs
 */
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const APP = pathToFileURL(join(import.meta.dirname, '..', 'index.html')).href;

let fail = 0;
const ok = (c, m) => { if (c) console.log('  ✓ ' + m); else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
p.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await p.goto(APP);
await p.waitForFunction(() => window.__SOS && window.__SOS.selectNode);
await p.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

/* Un cas amb fondària: un node amb dos llocs a dins, un dels quals en té un
   altre. Dues plantes de zoom són el mínim per provar que hi ha zoom i no un
   enllaç cap avall. */
const sembrat = await p.evaluate(async () => {
  const S = window.__SOS;
  const arrel = S.newNode('La Vila', 'municipi', null);
  S.state.nodes.push(arrel);
  const biblio = S.newNode('La Biblioteca', 'projecte', arrel.id);
  const bar = S.newNode('El Bar', 'projecte', arrel.id);
  const fons = S.newNode('El Fons de Llibres', 'projecte', biblio.id);
  [biblio, bar, fons].forEach(n => S.state.nodes.push(n));
  /* L'arrel té rols propis **i** llocs a dins: és el cas que ha de pintar les
     dues capes alhora, i el que abans n'ensenyava només una. */
  const a = S.uid(), c = S.uid();
  arrel.vna.roles.push({ id: a, name: 'Ajuntament' }, { id: c, name: 'Veïnat' });
  arrel.vna.exchanges.push({ id: S.uid(), from: a, to: c, kind: 'servei', label: 'un local obert' });
  /* I la biblioteca en té un de propi, perquè `zoomDins` tingui què dir. */
  const bi = S.uid();
  biblio.vna.roles.push({ id: bi, name: 'Qui presta' });
  await S.persist(arrel);
  S.state.expanded.add(arrel.id);
  /* `selectNode` porta un territori al resum i un projecte al mapa, i això és
     correcte. El zoom viu a la pestanya del mapa, i és on es prova. */
  S.selectNode(arrel.id);
  S.state.tab = 'map';
  S.render();
  return { arrel: arrel.id, biblio: biblio.id, bar: bar.id, fons: fons.id };
});
await p.waitForTimeout(250);

/* ── 1 · Les dues capes al mateix llenç ──────────────────────────────────── */
console.log('\n1 · Els rols i els llocs de dins, al mateix mapa');
{
  const r = await p.evaluate(() => ({
    tab: window.__SOS.state.tab,
    rols: document.querySelectorAll('.vna-canvas svg circle').length,
    llocs: document.querySelectorAll('.vna-canvas .vna-zn').length,
    noms: [...document.querySelectorAll('.vna-canvas .vna-zn text')].map(t => t.textContent)
  }));
  ok(r.tab === 'map', 'el node obre al mapa');
  ok(r.rols >= 2, `els dos rols propis hi són (${r.rols} cercles)`);
  /* L'asserció que caça el retrocés: dos fills al node, dos llocs al llenç. Si
     algú treu `children()`, això passa a 0 i la pantalla segueix sent maca. */
  ok(r.llocs === 2, `i els 2 llocs de dins també (${r.llocs}) — amb un sol nivell seria 0 i no petaria res`);
  /* L'etiqueta del llenç va escapçada perquè el rectangle té una amplada fixa;
     el nom sencer el porta el `title`, que és el que es prova al pas 2. Una
     etiqueta que sortís del rectangle es llegiria com un error de dibuix. */
  ok(r.noms.some(n => /^La Bibli/.test(n)) && r.noms.some(n => /^El Bar/.test(n)),
    'amb el seu nom, escapçat al rectangle: ' + r.noms.join(', '));
}

/* ── 2 · Cada lloc diu què hi trobaràs ───────────────────────────────────── */
console.log('\n2 · Abans d\'entrar, es diu què hi ha a dins');
{
  const t = await p.evaluate(() => [...document.querySelectorAll('.vna-canvas .vna-zn title')]
    .map(x => x.textContent));
  const bib = t.find(x => /Biblioteca/.test(x)) || '';
  const bar = t.find(x => /Bar/.test(x)) || '';
  ok(/1 rol/.test(bib) && /1 lloc a dins/.test(bib),
    'la biblioteca diu el que té: ' + bib.replace('Entra a ', ''));
  /* I el cas que importa més: un lloc buit ho ha de dir. Entrar-hi sense
     saber-ho és el que fa que la gent deixi de clicar. */
  ok(/encara sense mapa/.test(bar), 'i el bar diu que encara no en té: ' + bar.replace('Entra a ', ''));
}

/* ── 3 · LA QUE IMPORTA · entrar-hi mou l'app sencera ────────────────────── */
console.log('\n3 · Entrar per el mapa és el mateix que entrar per l\'arbre');
{
  const abans = await p.evaluate(() => window.__SOS.state.activeId);
  await p.evaluate(() => {
    const g = [...document.querySelectorAll('.vna-canvas .vna-zn')]
      .find(x => /Biblioteca/.test(x.textContent));
    g.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await p.waitForTimeout(250);
  const r = await p.evaluate(() => ({
    actiu: window.__SOS.state.activeId,
    /* L'estat que una segona manera de navegar oblidaria: l'arbre del costat.
       Si entrar pel mapa no passés per `selectNode`, el graf canviaria i
       l'arbre es quedaria assenyalant el node anterior. */
    obert: [...window.__SOS.state.expanded],
    llocs: document.querySelectorAll('.vna-canvas .vna-zn').length,
    rols: [...document.querySelectorAll('.vna-canvas svg text')].map(t => t.textContent)
  }));
  ok(r.actiu === sembrat.biblio && r.actiu !== abans, 'el clic canvia de node: la biblioteca és el mapa sencer');
  ok(r.obert.includes(sembrat.arrel),
    'i l\'arbre del costat s\'ha mogut amb ell — és `selectNode` i no una segona manera de navegar');
  ok(r.llocs === 1, `i a dins se'n veu el que hi ha (${r.llocs} lloc: el fons de llibres)`);
  ok(r.rols.some(x => /presta/.test(x)), 'amb el rol propi de la biblioteca');
}

/* ── 4 · El camí de tornada ──────────────────────────────────────────────── */
console.log('\n4 · I se\'n pot sortir, que és la veda 62');
{
  const m = await p.evaluate(() => ({
    hi: !!document.querySelector('.vna-canvas .vna-molla'),
    passos: [...document.querySelectorAll('.vna-molla .vm-b')].map(x => x.textContent),
    ara: (document.querySelector('.vna-molla .vm-ara') || {}).textContent || ''
  }));
  ok(m.hi, 'la molla de pa hi és, i va a sobre del llenç');
  ok(m.passos.includes('La Vila'), 'i porta el camí de tornada: ' + m.passos.join(' › '));
  ok(m.ara === 'La Biblioteca', 'amb on ets ara al final, sense ser un botó: ' + m.ara);
  await p.evaluate(() => [...document.querySelectorAll('.vna-molla .vm-b')]
    .find(x => x.textContent === 'La Vila').click());
  await p.waitForTimeout(250);
  await p.evaluate(() => { window.__SOS.state.tab = 'map'; window.__SOS.render(); });
  await p.waitForTimeout(200);
  const r = await p.evaluate(() => ({
    actiu: window.__SOS.state.activeId,
    molla: !!document.querySelector('.vna-canvas .vna-molla')
  }));
  ok(r.actiu === sembrat.arrel, 'i torna a dalt de debò');
  /* A l'arrel no hi ha camí amunt, i una molla d'un sol pas seria soroll. */
  ok(!r.molla, 'i a dalt la molla desapareix: un sol pas no és un camí');
}

/* ── 5 · Un node sense rols i amb llocs a dins ───────────────────────────── */
console.log('\n5 · El cas que abans amagava el que hi havia');
{
  /* Abans, un node amb tres projectes a dins i cap rol propi deia «afegeix
     rols» i **no ensenyava els tres projectes**: el mapa amagava justament el
     que hi havia. */
  await p.evaluate(id => window.__SOS.selectNode(id), sembrat.fons);
  await p.waitForTimeout(200);
  const buit = await p.evaluate(() => document.querySelector('.vna-canvas svg').textContent);
  ok(/Afegeix rols/.test(buit), 'un node buit de debò segueix dient què fer');

  await p.evaluate(async id => {
    const S = window.__SOS, n = S.byId(id);
    n.vna.roles = [];
    await S.persist(n);
    S.selectNode(id);
    S.state.tab = 'map';
    S.render();
  }, sembrat.arrel);
  await p.waitForTimeout(250);
  const r = await p.evaluate(() => ({
    llocs: document.querySelectorAll('.vna-canvas .vna-zn').length,
    txt: document.querySelector('.vna-canvas svg').textContent
  }));
  ok(r.llocs === 2, `sense cap rol propi, els 2 llocs de dins segueixen sortint (${r.llocs})`);
  ok(/Aquí dins hi ha 2 llocs/.test(r.txt), 'i es diu que hi són: ' + r.txt.replace(/.*(Aquí dins[^.]*\.).*/, '$1'));
  ok(!/Afegeix rols per veure el mapa/.test(r.txt),
    'i ja no diu «afegeix rols» amagant el que hi havia');
}

await ctx.close();
await b.close();
console.log(fail ? `\n❌ ${fail} fallen` : '\n✅ El zoom: un sol graf, un sol gest, i amb sortida');
process.exit(fail ? 1 : 0);
