/* Dues vistes d'un mateix flux · i el vocabulari que les fa servir
 * ─────────────────────────────────────────────────────────────────────────────
 * Hi havia dos dibuixos i no dues vistes. `build-mapavalor.js` dibuixava el
 * celler —set nodes, setze lliuraments— i `build-castells.js` dibuixava plantes
 * de castell de **casos declarats a mà** que no tenien res a veure amb aquell
 * celler. Es llegien com dues il·lustracions del mateix discurs, i ho eren.
 *
 * Això és el defecte que aquest fitxer vigila, i té una forma concreta:
 * **dos dibuixos maquíssims per separat que diuen coses diferents de la mateixa
 * casa**. No peta, no es veu, i qui el trobaria és un client en una visita
 * preguntant «i això d'on surt?».
 *
 * Per això la prova que compta no és que les dues vistes hi siguin —això es veu
 * mirant— sinó que **diguin els mateixos totals** i que **s'apaguin alhora**.
 * Si aturar el node encallat buida el graf i deixa la pinya sencera, la pinya
 * és decoració, i és exactament el que semblaria correcte.
 *
 * I la darrera, que és el producte: **el vocabulari ha de ser llegible per qui
 * no sap de castells.** Una posició que només digui què fa en un castell és
 * folklore; la que diu què és en una casa es pot fer servir dilluns.
 *
 * Ús:  node SOS/tests/test-dues-vistes.mjs
 */
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const ARREL = join(import.meta.dirname, '..', '..');
const PORTADA = pathToFileURL(join(ARREL, 'index.html')).href;
const VNA = pathToFileURL(join(ARREL, 'SOS', 'vna.html')).href;

let fail = 0;
const ok = (c, m) => { if (c) console.log('  ✓ ' + m); else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const nova = async (url = PORTADA) => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
  await p.goto(url);
  return { ctx, p };
};

/* ── 1 · Les dues vistes, i que el commutador canviï alguna cosa ─────────── */
console.log('\n1 · Dues vistes del mateix cas, i un botó que de debò canvia');
{
  const { ctx, p } = await nova();
  const hi = await p.evaluate(() => ({
    tabs: document.querySelectorAll('#dues-vistes .dv-t').length,
    mapa: !!document.getElementById('dv-mapa'),
    cast: !!document.getElementById('dv-castell'),
    graf: !!document.getElementById('mvCeller'),
    planta: !!document.getElementById('plCeller')
  }));
  ok(hi.tabs === 2 && hi.mapa && hi.cast, 'la secció porta les dues vistes i les dues pestanyes');
  ok(hi.graf && hi.planta, 'i els dos dibuixos: el graf i la planta de la mateixa casa');

  /* Que hi hagi dos botons no vol dir que facin res. Es mira el que es veu
     abans i després, que és el que veuria una persona. */
  const abans = await p.evaluate(() => ({
    m: !document.getElementById('dv-mapa').hidden,
    c: !document.getElementById('dv-castell').hidden
  }));
  await p.click('#dv-t-castell');
  const despres = await p.evaluate(() => ({
    m: !document.getElementById('dv-mapa').hidden,
    c: !document.getElementById('dv-castell').hidden,
    sel: document.getElementById('dv-t-castell').getAttribute('aria-selected')
  }));
  ok(abans.m && !abans.c, 'obrint la pàgina es veu la vista mapa, que és la que explica el mètode');
  ok(!despres.m && despres.c && despres.sel === 'true',
    'i el botó canvia de vista de debò: una pestanya que no amaga res no petaria mai');
  await ctx.close();
}

/* ── 2 · LA QUE IMPORTA · els mateixos totals a les dues vistes ──────────── */
console.log('\n2 · Els mateixos set nodes i els mateixos setze lliuraments');
{
  const { ctx, p } = await nova();
  const n = await p.evaluate(() => {
    /* Es compta **el que hi ha a la pantalla**, no el que diu el generador: si
       es llegissin les dues del mateix càlcul, la prova no provaria res. */
    const graf = document.getElementById('mvCeller');
    const pla = document.getElementById('plCeller');
    const taula = [...document.querySelectorAll('#dues-vistes .cv-t tbody tr')];
    return {
      nodesGraf: graf.querySelectorAll('.mv-n').length,
      fluxGraf: graf.querySelectorAll('.mv-f').length,
      nomsPlanta: new Set([...pla.querySelectorAll('.pl-nom')]
        .map(t => t.getAttribute('y'))).size,
      pilars: pla.querySelectorAll('.pl-baix').length,
      gentPlanta: pla.querySelectorAll('.pl-g').length,
      rengles: pla.querySelectorAll('.pl-l').length,
      files: taula.length,
      sumaTaula: taula.reduce((a, tr) => a + [...tr.querySelectorAll('td')].slice(1)
        .reduce((x, td) => x + (parseInt(td.textContent, 10) || 0), 0), 0)
    };
  });
  ok(n.nodesGraf === 7 && n.pilars === 7,
    `set nodes al graf i set pilars a la planta (${n.nodesGraf} i ${n.pilars})`);
  ok(n.fluxGraf === 16 && n.gentPlanta === 16,
    `setze lliuraments al graf i setze persones a la planta (${n.fluxGraf} i ${n.gentPlanta})`);
  /* La llei de sempre, ara sobre un cas: una pinya de N baixos obre 4N
     rengles. Set nodes, vint-i-vuit rengles. */
  ok(n.rengles === 28, `i una pinya de 7 pilars obre 4×7 rengles (${n.rengles})`);
  ok(n.files === 7 && n.sumaTaula === 16,
    `i la taula ho quadra: ${n.files} files que sumen ${n.sumaTaula} lliuraments`);
  await ctx.close();
}

/* ── 3 · I s'han d'apagar alhora ─────────────────────────────────────────── */
console.log('\n3 · Encallar un node apaga les dues vistes, no una');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(async () => {
    const b = document.querySelector('#dues-vistes .mv-enc');
    const graf = document.getElementById('mvCeller');
    const pla = document.getElementById('plCeller');
    const opac = el => [...el.querySelectorAll('[data-para]')]
      .filter(x => parseFloat(getComputedStyle(x).opacity) < .35).length;
    const abans = { g: opac(graf), p: opac(pla) };
    b.click();
    await new Promise(r => setTimeout(r, 700));
    return {
      abans,
      despres: { g: opac(graf), p: opac(pla) },
      marcats: {
        g: graf.querySelectorAll('[data-para]').length,
        p: pla.querySelectorAll('[data-para]').length
      }
    };
  });
  ok(r.marcats.p > 0, `la planta marca què s'atura amb aquell node (${r.marcats.p} elements)`);
  ok(r.despres.g > r.abans.g, `el graf s'apaga (${r.abans.g} → ${r.despres.g})`);
  /* La asserció que destapa el defecte. Si la planta no es mou, el botó
     funciona, el graf es buida i la segona vista es queda sencera: no peta, i
     mirant la pàgina sembla correcte perquè els dos dibuixos són maquíssims
     per separat. */
  ok(r.despres.p > r.abans.p,
    `i la planta també (${r.abans.p} → ${r.despres.p}) — si es quedés sencera, seria decoració`);
  await ctx.close();
}

/* ── 4 · LA PROVA NEGATIVA · que la font sigui una ───────────────────────── */
console.log('\n4 · Tocar el cas mou les dues vistes, o no són dues vistes');
{
  /* Es treu un parell de `CELLER` en memòria i es tornen a generar els dos
     blocs. Si la planta no canvia, està llegint una altra cosa — i és
     exactament el que passava abans: tres casos declarats a mà.

     Es fa sobre els generadors i no sobre el fitxer escrit perquè el fitxer no
     s'ha de tocar per provar-ho. */
  const { execFileSync } = await import('node:child_process');
  const prova = `
    const path = require('path');
    const dir = ${JSON.stringify(join(ARREL, 'SOS', 'tools'))};
    const mv = require(path.join(dir, 'build-mapavalor.js'));
    const abans = mv.CELLER.parells.length;
    const ct = require(path.join(dir, 'build-castells.js'));
    const a = ct.pinyaDeMapa(mv.CELLER);
    mv.CELLER.parells.pop();
    const b = ct.pinyaDeMapa(mv.CELLER);
    console.log(JSON.stringify({
      abans,
      fluxA: a.fl.length, fluxB: b.fl.length,
      renglesA: a.obertes, renglesB: b.obertes,
      ocupadesA: a.ocupades, ocupadesB: b.ocupades
    }));
  `;
  let d = null;
  try {
    const out = execFileSync(process.execPath, ['-e', prova], { encoding: 'utf8' });
    d = JSON.parse(out.trim().split('\n').pop());
  } catch (e) {
    ok(false, 'els generadors es poden requerir sense executar-se: ' + String(e.message).slice(0, 120));
  }
  if (d) {
    ok(d.abans === 8 && d.fluxA === 16, `el cas declara ${d.abans} parells i ${d.fluxA} lliuraments`);
    ok(d.fluxB === 14, `treure un parell en deixa ${d.fluxB}`);
    ok(d.ocupadesB !== d.ocupadesA,
      `i la pinya en nota la diferència (${d.ocupadesA} → ${d.ocupadesB} rengles amb algú)`);
  }
}

/* ── 5 · El vocabulari, i que serveixi a qui no sap de castells ──────────── */
console.log('\n5 · Els rols arquetípics: cada posició, amb la seva traducció');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const pos = [...document.querySelectorAll('#rols .rl-p')];
    return {
      quantes: pos.length,
      grups: document.querySelectorAll('#rols .rl-g').length,
      senseCasa: pos.filter(x => !x.querySelector('.rl-o')
        || x.querySelector('.rl-o').textContent.replace(/A una casa:/, '').trim().length < 40).length,
      senseCastell: pos.filter(x => !x.querySelector('.rl-c')
        || !x.querySelector('.rl-c').textContent.trim()).length,
      senseAport: pos.filter(x => !x.querySelector('.rl-a')).length,
      noms: pos.map(x => x.querySelector('.rl-n').textContent.trim()),
      text: document.getElementById('rols').innerText
    };
  });
  ok(r.quantes >= 10, `hi ha ${r.quantes} posicions declarades`);
  ok(r.grups >= 3, `agrupades per on són al castell (${r.grups} grups)`);
  /* La columna que és el producte. Sense ella, això és una llista de paraules
     d'una afició, i no hi ha manera de portar-la a una organització. */
  ok(!r.senseCasa, 'totes diuen què són en una casa, no només què fan en un castell');
  ok(!r.senseCastell && !r.senseAport, 'i totes diuen què fan al castell i amb quina aportació encaixen');
  /* Els noms que el client dirà el dilluns següent. */
  ['Baix', 'Segon', 'Vent', 'Lateral', 'Enxaneta'].forEach(nm =>
    ok(r.noms.includes(nm), `hi és «${nm}»`));
  ok(/dos|terç/i.test(r.text), 'i la secció diu de què serveix: posar nom al teu dos i al teu terç');
  await ctx.close();
}

/* ── 6 · I el mateix vocabulari a la pàgina del mètode ───────────────────── */
console.log('\n6 · El mateix vocabulari a /SOS/vna, generat del mateix lloc');
{
  const { ctx, p } = await nova(VNA);
  const r = await p.evaluate(() => {
    const pos = [...document.querySelectorAll('.rl-p')];
    return {
      quantes: pos.length,
      noms: pos.map(x => x.querySelector('.rl-n').textContent.trim()),
      /* Marcatge amb estil o sense: un bloc enganxat en una pàgina que no en
         té el CSS és el defecte que ja va passar amb els polsos. */
      pintat: pos.length ? getComputedStyle(pos[0]).display : ''
    };
  });
  ok(r.quantes >= 10, `la pàgina del mètode porta les mateixes ${r.quantes} posicions`);
  ok(r.noms.includes('Vent') && r.noms.includes('Baix'), 'amb els mateixos noms');
  ok(r.pintat === 'grid', `i amb el seu estil, no marcatge sense CSS (display: ${r.pintat})`);
  await ctx.close();
}

await b.close();
console.log(fail ? `\n❌ ${fail} fallen` : '\n✅ Les dues vistes són una, i el vocabulari serveix');
process.exit(fail ? 1 : 0);
