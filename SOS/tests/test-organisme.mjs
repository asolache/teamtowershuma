/* La casa mirada com un cos · el pols del mapa i les rengles
 * ─────────────────────────────────────────────────────────────────────────────
 * Un mapa de valor dibuixat és una radiografia: diu què hi ha. El que ven la
 * consultoria sistèmica és el pas següent —veure si allò circula i on deixa de
 * fer-ho—, i això no es pot ensenyar amb una imatge quieta.
 *
 * El que es prova aquí és el que no es veuria mirant la pantalla:
 *
 * · **Que les xifres de la frase siguin les del dibuix.** La frase de
 *   l'encallament diu quants lliuraments es paren. Si algú afegeix un
 *   lliurament i la frase es queda enrere, el dibuix i el text diuen coses
 *   diferents —i la que es creuria el client és la frase.
 * · **Que l'animació no sigui l'única informació.** Qui ha demanat que les
 *   coses no es moguin ha de poder fer servir el diagnòstic igual.
 * · **Que una figura dibuixi les rengles que diu.** Un «4» amb tres columnes
 *   és una figura que no existeix i que es llegeix com si existís.
 * · **Que el contingut sigui a l'HTML i no l'injecti el JavaScript**, perquè
 *   si el JavaScript no arriba, el que es perd han de ser els botons i no el
 *   que diuen.
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const DIR = dirname(fileURLToPath(import.meta.url));
const APP = 'file://' + join(DIR, '..', '..', 'index.html');
const { FIGURES, VARIABLES } = createRequire(import.meta.url)('../tools/build-castells.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const nova = async opts => {
  const ctx = await b.newContext(Object.assign({ viewport: { width: 1280, height: 900 } }, opts || {}));
  const p = await ctx.newPage();
  p.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
  await p.goto(APP);
  return { ctx, p };
};

/* ── 1 · On és, i per què allà ───────────────────────────────────────────── */
console.log('\n1 · Les rengles van després de les dues vistes, no abans');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const ids = [...document.querySelectorAll('section[id]')].map(s => s.id);
    return { hi: ids.indexOf('rengles'), mapa: ids.indexOf('dues-vistes'),
             rols: ids.indexOf('rols'), enfoc: ids.indexOf('enfoc'),
             decideix: ids.indexOf('decideix') };
  });
  ok(r.hi >= 0, 'la secció hi és');
  /* `#mapaval` s'ha fusionat amb `#rengles` dins de `#dues-vistes`: el graf i
     la planta són dues pestanyes del **mateix cas**, i tenir-los en dues
     seccions era el que els feia semblar dos dibuixos sense relació.

     `#rengles` es queda com la part didàctica —les cinc construccions i les
     variables— i per això va després: ordena una cosa que qui llegeix acaba
     de veure sobre un cas de debò. */
  /* Es mesura **l'ordre i no l'adjacència**. Entre les dues vistes i les
     rengles hi ha entrat `#decideix` —per a què serveix això, abans d'explicar
     com es fa—, i una asserció d'adjacència hauria petat per un canvi
     correcte. El que ha de seguir sent cert és que les rengles van **després**
     del cas: ordenen una cosa que qui llegeix ja ha vist. */
  ok(r.mapa >= 0 && r.hi > r.mapa,
    'i va després de les dues vistes: ordena una cosa que acabes de veure');
  /* I el que va al mig: primer per a què serveix, després com es fa. Qui
     decideix una compra no és un metodòleg. */
  ok(r.decideix > r.mapa && r.decideix < r.hi,
    'amb «el que decideixes» entre mig: per a què serveix abans que com es fa');
  /* I el vocabulari, l'últim dels tres: els noms ordenen una pinya, i si
     sortissin primer anomenarien posicions que encara no s'han vist. */
  ok(r.rols === r.hi + 1, 'i els rols arquetípics, just darrere');
  await ctx.close();
}

/* ── 2 · El pols, i que no sigui l'única informació ──────────────────────── */
console.log('\n2 · El mapa circula, i es pot aturar');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const s = document.querySelector('#mvCeller');
    const u = document.querySelector('.mv-p');
    return { polsos: document.querySelectorAll('.mv-p').length,
      fletxes: document.querySelectorAll('.mv-f').length,
      anim: getComputedStyle(u).animationName, play: getComputedStyle(u).animationPlayState,
      norm: u.getAttribute('pathLength'), viu: s.classList.contains('viu') };
  });
  ok(r.polsos === r.fletxes && r.polsos > 0,
    `cada lliurament té el seu pols (${r.polsos} de ${r.fletxes})`);
  ok(r.anim !== 'none' && r.play === 'running', 'i circula sol en obrir la pàgina');
  /* Sense `pathLength` el pols de la fletxa curta aniria disparat i el de la
     llarga semblaria aturat: el mapa diria que unes coses circulen i d'altres
     no, que és el que només ha de dir quan és cert. */
  ok(r.norm === '100', 'tots a la mateixa velocitat, sigui quina sigui la llargada del camí');
  await p.click('.mv-pausa');
  const q = await p.evaluate(() => ({
    play: getComputedStyle(document.querySelector('.mv-p')).animationPlayState,
    premut: document.querySelector('.mv-pausa').getAttribute('aria-pressed'),
    lbl: document.querySelector('.mv-pausa').textContent }));
  ok(q.play === 'paused' && q.premut === 'true', 'el botó l\'atura · ' + q.lbl.trim());
  await ctx.close();
}

/* ── 3 · L'encallament, i que les xifres siguin les del dibuix ───────────── */
console.log('\n3 · I si un node s\'encalla');
{
  const { ctx, p } = await nova();
  const abans = await p.evaluate(() => document.querySelector('.mv-pu-t').textContent.trim());
  await p.click('.mv-enc');
  /* El canvi de color té mig segon de transició. Llegir-lo abans d'hora
     donava un resultat a mitges i una prova que fallava segons el dia. */
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => {
    const s = document.querySelector('#mvCeller');
    const grisos = [...s.querySelectorAll('.mv-f[data-para]')]
      .filter(x => getComputedStyle(x).stroke === 'rgb(74, 74, 85)').length;
    return { encallat: s.classList.contains('encallat'),
      parats: s.querySelectorAll('.mv-f[data-para]').length,
      total: s.querySelectorAll('.mv-f').length,
      grisos, apagats: s.querySelectorAll('.mv-n[data-sec]').length,
      marcat: s.querySelectorAll('.mv-n[data-para]').length,
      txt: document.querySelector('.mv-pu-t').textContent.trim(),
      premut: document.querySelector('.mv-enc').getAttribute('aria-pressed') };
  });
  ok(r.encallat && r.premut === 'true', 'el botó encalla el node');
  ok(r.grisos === r.parats && r.parats > 0,
    `i es paren els ${r.parats} lliuraments que hi passen, dels ${r.total}`);
  ok(r.marcat === 1, 'el node aturat queda marcat');
  ok(r.apagats > 0, `i els ${r.apagats} que en depenen baixen d'intensitat: la conseqüència es veu`);
  ok(r.txt !== abans, 'la frase canvia i diu què ha passat');
  /* LA QUE IMPORTA. La frase diu un número; el dibuix en té un altre. Si es
     separen, el client es creu la frase. */
  const diu = (r.txt.match(/(\d+)\s+dels\s+(\d+)\s+lliuraments/) || []);
  ok(diu.length === 3 && Number(diu[1]) === r.parats && Number(diu[2]) === r.total,
    `i les xifres són les del dibuix: ${diu[1] || '?'} de ${diu[2] || '?'} contra ${r.parats} de ${r.total}`);
  await ctx.close();
}

/* ── 4 · Qui no vol moviment, no en té — i segueix tenint el diagnòstic ──── */
console.log('\n4 · Sense moviment, la informació hi és igual');
{
  const { ctx, p } = await nova({ reducedMotion: 'reduce' });
  const r = await p.evaluate(() => ({
    anim: getComputedStyle(document.querySelector('.mv-p')).animationName,
    visible: getComputedStyle(document.querySelector('.mv-p')).opacity }));
  ok(r.anim === 'none', 'res no es mou');
  ok(Number(r.visible) > 0, 'però els camins segueixen dibuixats: s\'apaga el moviment, no la informació');
  await p.click('.mv-enc');
  const q = await p.evaluate(() => ({
    encallat: document.querySelector('#mvCeller').classList.contains('encallat'),
    txt: document.querySelector('.mv-pu-t').textContent.trim() }));
  ok(q.encallat && /lliuraments/.test(q.txt), 'i el diagnòstic segueix servint igual');
  await ctx.close();
}

/* ── 5 · Les plantes obren les direccions que els toca ───────────────────── */
console.log('\n5 · Una pinya de N baixos obre 4N rengles');
{
  const { ctx, p } = await nova();
  for (const f of FIGURES) {
    await p.click(`.ct-t[data-f="${f.id}"]`);
    const r = await p.evaluate(id => {
      const pan = document.querySelector('#ct-p-' + id);
      return { obert: !pan.hidden,
        primera: pan.querySelectorAll('.pl-primera').length,
        lateral: pan.querySelectorAll('.pl-lateral').length,
        vent: pan.querySelectorAll('.pl-vent').length,
        total: pan.querySelectorAll('.pl-l').length,
        planta: !!pan.querySelector('.pl-svg'), alcat: !!pan.querySelector('.al-svg'),
        sols: [...document.querySelectorAll('.ct-pan:not(.ct-pv)')].filter(x => !x.hidden).length };
    }, f.id);
    /* La composició importa tant com el total: N primeres mans, N vents i 2N
       laterals. Amb el repartiment canviat el total seguiria sent 4N i el
       dibuix diria una pinya que no existeix. */
    ok(r.obert && r.sols === 1 && r.primera === f.baixos && r.vent === f.baixos
      && r.lateral === 2 * f.baixos && r.total === 4 * f.baixos,
      `${f.nom}: ${r.primera} primeres mans + ${r.vent} vents + ${r.lateral} laterals = ${r.total}`);
    /* Les dues vistes han d'anar juntes: la planta no sap d'alçada i l'alçat
       no sap de direccions, i la lectura que es ven només surt creuant-les. */
    ok(r.planta && r.alcat, '  i hi són les dues vistes, de dalt i de costat');
  }
  await ctx.close();
}

/* ── 6 · La variable es pinta sobre la planta ────────────────────────────── */
console.log('\n6 · La mateixa planta, pintada per una altra cosa');
{
  const { ctx, p } = await nova();
  for (const v of VARIABLES) {
    await p.click(`.ct-t[data-v="${v.id}"]`);
    const r = await p.evaluate(id => {
      const pan = document.querySelector('#ct-v-' + id);
      return { obert: !pan.hidden, dims: pan.querySelectorAll('.ct-ll li').length,
        gent: pan.querySelectorAll('.pl-g').length,
        risc: (pan.querySelector('.ct-risc') || {}).textContent || '' };
    }, v.id);
    const total = v.dims.reduce((a, d) => a + d.n, 0);
    ok(r.obert && r.dims === v.dims.length && r.gent === total,
      `${v.nom}: ${r.dims} dimensions i ${r.gent} persones dibuixades`);
  }
  /* LA LECTURA QUE NOMÉS EXISTEIX CREUANT LES DUES COSES: gruix sobre una
     línia fluixa. Amb la planta sola no es veu —la fondària es llegeix igual
     a tot arreu— i amb l'alçat sol tampoc, perquè no sap de direccions. */
  const risc = await p.evaluate(() => ({
    setze: (document.querySelector('#ct-v-setze .ct-risc') || {}).textContent || '',
    ambits: (document.querySelector('#ct-v-ambits .ct-risc') || {}).textContent || '' }));
  ok(/vent/.test(risc.setze), 'als setze factors diu què ocupa els vents · ' + risc.setze.trim().slice(0, 56));
  /* La lectura que només es pot fer des de dalt: un vent buit és un parell
     d'àrees que no es toquen. Amb els àmbits sols a les primeres mans, els
     quatre vents queden buits — i això és el diagnòstic, no un buit de dibuix. */
  ok(/vents buits/.test(risc.ambits),
    'i als àmbits avisa dels vents buits: àrees que no es toquen · ' + risc.ambits.trim().slice(0, 56));
  await ctx.close();
}

/* ── 7 · El 16 no és una casualitat bonica ───────────────────────────────── */
console.log('\n7 · Per què un instrument de setze factors cap en un 4');
{
  const q = FIGURES.find(x => 4 * x.baixos === 16);
  const v = VARIABLES.find(x => x.dims.length === 16);
  ok(!!q && q.baixos === 4, 'un castell de 4 obre 16 rengles: 4 primeres mans, 4 vents i 8 laterals');
  ok(!!v && v.fig === q.id, 'i la variable de setze dimensions hi va a sobre, sense forçar res');
  const { ctx, p } = await nova();
  await p.click('.ct-t[data-v="setze"]');
  const r = await p.evaluate(() => ({
    dirs: document.querySelectorAll('#ct-v-setze .pl-l').length,
    buides: [...document.querySelectorAll('#ct-v-setze .pl-l')]
      .filter(x => Number(x.getAttribute('opacity')) < .2).length }));
  ok(r.dirs === 16 && r.buides === 0,
    `les setze rengles s'omplen i no en queda cap buida (${r.dirs}, ${r.buides} buides)`);
  await ctx.close();
}

/* ── 8 · El contingut és a l'HTML, no l'injecta ningú ───────────────────── */
console.log('\n8 · Si el JavaScript no arriba, el contingut hi és igual');
{
  const ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(APP);
  const r = await p.evaluate(() => ({
    pols: document.querySelectorAll('.mv-p').length,
    frase: (document.querySelector('.mv-pu-t') || {}).textContent || '',
    plantes: document.querySelectorAll('.pl-svg').length,
    alcats: document.querySelectorAll('.al-svg').length,
    llei: (document.querySelector('.ct-llei') || {}).textContent || '' }));
  ok(r.pols > 0, 'els polsos són SVG i CSS: circulen sense JavaScript');
  ok(/radiografia/.test(r.frase), 'la frase ja és escrita a la pàgina');
  ok(r.plantes >= FIGURES.length && r.alcats === FIGURES.length,
    `i les ${r.alcats} construccions són dibuixades, no generades al navegador`);
  ok(/alçada sense guanyar base/.test(r.llei), 'i la llei que lliga les dues vistes també hi és');
  await ctx.close();
}

/* ── 9 · La pàgina del mètode porta el mateix, i viu ────────────────────────
   El dibuix del celler el genera el mateix fitxer per a dues pàgines, i l'estil
   que el fa circular és de cada pàgina. Quan els polsos hi van entrar,
   `vna.html` va rebre el marcatge i no l'estil: setze camins invisibles que no
   feien res, i uns botons que apuntaven al dibuix de l'altra pàgina.

   **No petava i no es veia.** Això ho prova que circuli de debò allà, no que
   el marcatge hi sigui. */
console.log('\n9 · I la pàgina del mètode, també viva');
{
  const ctx = await b.newContext({ viewport: { width: 1100, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
  await p.goto('file://' + join(DIR, '..', 'vna.html'));
  const r = await p.evaluate(() => {
    const u = document.querySelector('.mv-pols-ui'), pol = document.querySelector('.mv-p');
    return { ui: !!u, svg: u && u.getAttribute('data-svg'),
      anim: pol && getComputedStyle(pol).animationName,
      play: pol && getComputedStyle(pol).animationPlayState,
      polsos: document.querySelectorAll('.mv-p').length,
      planta: document.querySelectorAll('.pl-svg').length,
      rengles: document.querySelectorAll('.pl-l').length,
      menes: document.querySelectorAll('.ct-anat li').length };
  });
  ok(r.polsos > 0 && r.anim !== 'none' && r.play === 'running',
    `els ${r.polsos} polsos circulen de debò, no són marcatge mort`);
  /* Els botons han de manar sobre el dibuix d'AQUESTA pàgina. Amb els
     identificadors escrits a mà apuntaven al de la portada, que aquí no hi és. */
  ok(r.ui && r.svg === 'mvCellerVna', 'i els botons manen sobre el dibuix d\'aquesta pàgina · ' + r.svg);
  await p.click('.mv-enc');
  const q = await p.evaluate(() => ({
    encallat: document.getElementById('mvCellerVna').classList.contains('encallat'),
    txt: (document.querySelector('.mv-pu-t') || {}).textContent || '' }));
  ok(q.encallat && /lliuraments/.test(q.txt), 'l\'encallament hi funciona igual');
  ok(r.planta === 1 && r.rengles === 16, `i hi ha la planta d'un 4 amb els seus ${r.rengles} rengles`);
  ok(r.menes === 3, 'amb les tres menes explicades, que és el que aquesta pàgina ha d\'ensenyar');
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
