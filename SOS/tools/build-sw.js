#!/usr/bin/env node
/* La memòria cau del SOS · que caduqui sola
 * ─────────────────────────────────────────────────────────────────────────────
 * `sw.js` guarda una còpia local de les pàgines i les serveix **primer la
 * còpia, i el refresc a sota**. Això estalvia baixar el SOS sencer a cada
 * visita, i té un preu escrit al mateix fitxer: la primera càrrega després d'un
 * canvi serveix la versió anterior.
 *
 * El preu era assumible. El que no ho era és que el nom de la còpia —`CAU`—
 * estigués escrit a mà i no s'hagués tocat mai. `activate` esborra tota còpia
 * que **no** es digui com la d'ara, i si el nom no canvia mai, no s'esborra mai
 * res: la còpia vella es queda de per vida i només se substitueix pàgina a
 * pàgina, quan el refresc de fons acaba bé. En un desplegament de prova, on la
 * mateixa adreça canvia de contingut diverses vegades al dia, això vol dir
 * obrir una pàgina arreglada i seguir veient la trencada.
 *
 * ── Què es genera, i per què així ───────────────────────────────────────────
 * `CAU` passa a portar **una empremta del contingut**: la suma de totes les
 * pàgines que el `sw.js` pot arribar a guardar. Canvia una pàgina, canvia el
 * nom de la còpia, i `activate` llença la vella sencera. No cal recordar-se de
 * pujar cap número, que és exactament la part que no va passar mai.
 *
 * L'empremta **no inclou `sw.js`**: s'hi escriu a dins i es mossegaria la cua.
 *
 * `PORTA` —les pàgines que es demanen d'entrada— també es genera, amb una
 * guarda que importa: `install` fa `Promise.allSettled`, o sigui que una
 * pàgina que no existeix **no peta i no avisa**, només deixa de guardar-se.
 *
 * ── Ús ──────────────────────────────────────────────────────────────────────
 *   node SOS/tools/build-sw.js            escriu el nom de la còpia i la llista
 *   node SOS/tools/build-sw.js --check    falla si el nom no correspon al que hi ha
 *
 * Es corre **després** de tots els altres generadors i **abans** de
 * `build-mapa.js`: qualsevol canvi a un HTML mou l'empremta.
 */
const { readFileSync, writeFileSync, existsSync, readdirSync } = require('node:fs');
const { join } = require('node:path');
const { createHash } = require('node:crypto');

const SOS = join(__dirname, '..');
const SW = join(SOS, 'sw.js');
const CHECK = process.argv.includes('--check');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };

/* ══ LES PÀGINES QUE ES GUARDEN D'ENTRADA ════════════════════════════════════
   No hi van totes: guardar-ho tot el primer dia seria baixar el SOS sencer
   abans que ningú demani res. Hi van les portes —el que algú obre primer— i,
   quan una porta en porta a una altra, la que hi porta.

   Els dos diagnòstics hi són perquè `diagnostic.html` ja no és un diagnòstic
   sinó una tria: guardar la tria i no guardar on porta seria guardar un passadís
   sense les portes. */
const PORTA = [
  './', './index.html', './vna.html', './matriu.html',
  './diagnostic.html', './diagnostic-org.html', './diagnostic-territori.html',
  './banc-temps.html', './biblioteca.html', './compra.html', './energia.html',
  './habitatge.html', './formacio.html', './intro.html', './molekulandia.html'
];

/* ── L'empremta ───────────────────────────────────────────────────────────── */
const HTML = readdirSync(SOS).filter(f => f.endsWith('.html')).sort();
function empremta() {
  const h = createHash('sha256');
  for (const f of HTML) { h.update(f); h.update(readFileSync(join(SOS, f))); }
  return h.digest('hex').slice(0, 10);
}

/* ── Les guardes ─────────────────────────────────────────────────────────── */

/* 1 · LA QUE IMPORTA · cap porta cap a una pàgina que no hi és. `install` fa
      `Promise.allSettled`, així que això no petaria mai: la pàgina senzillament
      no es guardaria i ningú ho sabria fins a trobar-se sense cobertura. */
(() => {
  const falten = PORTA.filter(u => {
    const f = u === './' ? 'index.html' : u.replace('./', '');
    return !existsSync(join(SOS, f));
  });
  if (falten.length) bad('la memòria cau demana pàgines que no existeixen: ' + falten.join(', ')
    + ' — no peta, només no es guarden');
  else ok(`${PORTA.length} portes, totes existeixen`);
})();

/* 2 · La tria del diagnòstic no es pot guardar sense les dues portes on porta:
      sense cobertura ensenyaria dos enllaços que no obren res. */
(() => {
  const te = u => PORTA.indexOf(u) >= 0;
  if (te('./diagnostic.html') && !(te('./diagnostic-org.html') && te('./diagnostic-territori.html')))
    bad('es guarda la tria de diagnòstic i no els dos diagnòstics: sense cobertura, dues portes tancades');
  else ok('i la tria de diagnòstic va acompanyada de les dues portes');
})();

/* ── Escriure o comprovar ─────────────────────────────────────────────────── */
if (!existsSync(SW)) bad('no existeix SOS/sw.js');
else if (!fails) {
  const src = readFileSync(SW, 'utf8');
  const nom = 'sos-' + empremta();
  let out = src.replace(/const CAU = '[^']*';/, `const CAU = '${nom}';`);
  if (out === src && !src.includes(`const CAU = '${nom}';`)) {
    bad('no s\'ha trobat la línia `const CAU = \'…\';` a sw.js');
  } else {
    const obre = '/*SW-PORTA*/', tanca = '/*/SW-PORTA*/';
    const i = out.indexOf(obre), j = out.indexOf(tanca);
    if (i < 0 || j < 0 || j < i) bad('falten les marques ' + obre + ' a sw.js');
    else {
      const llista = 'const PORTA = [\n' + PORTA.map(u => `  '${u}'`).join(',\n') + '\n];';
      out = out.slice(0, i + obre.length) + '\n' + llista + '\n' + out.slice(j);
    }
  }
  if (!fails) {
    if (CHECK) {
      if (out !== src) bad('sw.js no correspon al contingut d\'ara: la còpia vella no caducaria');
      else ok('el nom de la memòria cau correspon al contingut · ' + nom);
    } else if (out !== src) { writeFileSync(SW, out); ok('escrit · ' + nom); }
    else ok('ja hi era · ' + nom);
  }
}

if (CHECK) {
  console.log(fails ? '\n❌ Arregla-ho amb:  node SOS/tools/build-sw.js'
    : '\n✅ La memòria cau caduca sola.');
  process.exit(fails ? 1 : 0);
}
if (fails) { console.log('\n❌ No s\'ha escrit res.'); process.exit(1); }
console.log(`\n✅ SOS/sw.js · ${PORTA.length} portes · empremta de ${HTML.length} pàgines`);

module.exports = { PORTA };
