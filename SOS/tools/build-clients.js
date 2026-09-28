#!/usr/bin/env node
/* Els clients, declarats un sol cop
 * ─────────────────────────────────────────────────────────────────────────────
 * Els noms sortien escrits a mà dins de `#trajectoria`, a la novena pantalla de
 * la portada. Dos problemes, i el segon és el que fa que això sigui un
 * generador i no una mudança:
 *
 * 1. **Arribaven massa tard.** Qui obre la pàgina decideix en la primera
 *    pantalla si val la pena seguir, i la prova més forta que hi ha —que IKEA
 *    ha estat client, i amb dues aplicacions de VNA— quedava vuit pantalles per
 *    sota del titular.
 * 2. **Posar-los als dos llocs a mà seria escriure'ls dues vegades.** El dia
 *    que se n'afegeixi un, o que se'n retiri un altre perquè ja no toca, la
 *    llista de dalt i la de baix dirien coses diferents i no petaria res.
 *
 * ── La regla que aquest fitxer vigila ───────────────────────────────────────
 * **Un nom de client és una afirmació sobre un tercer.** No es pot inventar, no
 * es pot arrodonir i ha de poder-se respondre el dia que algú pregunti d'on
 * surt. Per això cada entrada porta `font` —d'on ve aquell nom— i la guarda no
 * deixa passar-ne cap sense ella. La font documental és
 * `knowledge/negoci/trajectoria.md`.
 *
 * I una que se'n deriva: **el que és d'un altre recorregut es diu.** Els noms
 * grans vénen de TeamTowers (formació en valors d'equip i cohesió), no de la
 * carrera de RRHH anterior ni del servei comunitari d'avui. Sense aquella
 * línia, una llista de multinacionals sota el nom d'un consultor es llegeix com
 * el lector vulgui —i el que es llegeixi sempre serà més del que hem dit.
 *
 * ── Ús ──────────────────────────────────────────────────────────────────────
 *   node SOS/tools/build-clients.js            escriu els dos blocs
 *   node SOS/tools/build-clients.js --check    falla si estan vells o incoherents
 */
const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const CHECK = process.argv.includes('--check');
const HOME_F = join(ARREL, 'index.html');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ══ LA DECLARACIÓ ═══════════════════════════════════════════════════════════
   `destacat` marca els que surten a la banda de la primera pantalla. Són pocs
   a posta: una banda amb vint noms no la llegeix ningú i deixa de ser una
   prova per passar a ser un mur. */
const GRUPS = [
  {
    id: 'empreses', clau: 'cl.g3', nom: 'Empreses',
    clients: [
      { n: 'IKEA', destacat: true, nota: 'dues aplicacions de Value Network Analysis', font: 'TeamTowers · catàleg 2026' },
      { n: 'Telefónica', destacat: true, font: 'TeamTowers · catàleg 2026' },
      { n: 'Vodafone', font: 'TeamTowers · catàleg 2026' },
      { n: 'BBVA', destacat: true, font: 'TeamTowers · catàleg 2026' },
      { n: 'Novartis', destacat: true, font: 'TeamTowers · catàleg 2026' },
      { n: 'Porsche', destacat: true, font: 'TeamTowers · catàleg 2026' },
      { n: 'Mercedes', font: 'TeamTowers · catàleg 2026' },
      { n: 'John Deere', font: 'TeamTowers · catàleg 2026' },
      { n: 'La Caixa', font: 'TeamTowers · catàleg 2026' },
      { n: 'InfoJobs', font: 'TeamTowers · catàleg 2026' },
      { n: 'Softonic', font: 'TeamTowers · catàleg 2026' }
    ]
  },
  {
    id: 'universitats', clau: 'cl.g1', nom: 'Universitats i escoles de negoci',
    clients: [
      { n: 'UB', font: 'TeamTowers · catàleg 2026' },
      { n: 'UOC', font: 'TeamTowers · catàleg 2026' },
      { n: 'UAB', font: 'TeamTowers · catàleg 2026' },
      { n: 'UPC', font: 'TeamTowers · catàleg 2026' },
      { n: 'ESADE', destacat: true, font: 'TeamTowers · catàleg 2026' },
      { n: 'IESE', font: 'TeamTowers · catàleg 2026' },
      { n: 'EADA', font: 'TeamTowers · catàleg 2026' },
      { n: 'La Salle', font: 'TeamTowers · catàleg 2026' },
      { n: 'Universidad de León', font: 'TeamTowers · catàleg 2026' }
    ]
  },
  {
    id: 'public', clau: 'cl.g2', nom: 'Sector públic',
    clients: [
      { n: 'Diputació de Barcelona', font: 'TeamTowers · catàleg 2026' },
      { n: 'Ajuntament de Vilafranca', font: 'TeamTowers · catàleg 2026' },
      { n: 'Junta de Castilla y León', font: 'TeamTowers · catàleg 2026' }
    ]
  }
];

const TOTS = GRUPS.flatMap(g => g.clients);
const DESTACATS = TOTS.filter(c => c.destacat);

/* ══ ELS DOS BLOCS ═══════════════════════════════════════════════════════════ */
function banda() {
  const noms = DESTACATS.map(c => '<span>' + esc(c.n) + '</span>').join('');
  return [
    '<!--TT-CLIENTS-BANDA-->',
    '<!-- GENERAT per SOS/tools/build-clients.js · no s\'edita a mà -->',
    '<section class="cl-banda" aria-label="Clients">',
    '  <div class="container">',
    '    <div class="clb-in">',
    '      <p class="clb-lbl" data-i18n="clb.lbl">Han estat clients</p>',
    '      <div class="clb-noms">' + noms + '<a href="#trajectoria" class="clb-mes" data-i18n="clb.mes">i ' +
      (TOTS.length - DESTACATS.length) + ' més →</a></div>',
    '      <p class="clb-nota" data-i18n-html="clb.nota">Del recorregut de <a href="https://teamtowers.eu" target="_blank" rel="noopener">TeamTowers</a>: formació en valors d\'equip i cohesió. <strong>A IKEA, a més, dues aplicacions de Value Network Analysis.</strong></p>',
    '    </div>',
    '  </div>',
    '</section>',
    '<!--/TT-CLIENTS-BANDA-->'
  ].join('\n');
}

function graella() {
  const g = GRUPS.map(gr => [
    '            <div>',
    '                <div class="cl-group-lbl" data-i18n="' + gr.clau + '">' + esc(gr.nom) + '</div>',
    '                <div class="cl-logos">' + gr.clients.map(c => '<span>' + esc(c.n) + '</span>').join('') +
      (gr.id === 'empreses' ? '<span class="muted" data-i18n="cl.emp">i +150 empreses en formació i cohesió d\'equips</span>' : '') + '</div>',
    gr.id === 'empreses'
      ? '                <p class="cl-font" data-i18n-html="cl.font">Del recorregut de <a href="https://teamtowers.eu" target="_blank" rel="noopener">TeamTowers</a>: formació en valors d\'equip i cohesió. <strong>A IKEA, a més, dues aplicacions de Value Network Analysis.</strong></p>'
      : null,
    '            </div>'
  ].filter(Boolean).join('\n')).join('\n');
  return [
    '<!--TT-CLIENTS-->',
    '        <!-- GENERAT per SOS/tools/build-clients.js · no s\'edita a mà -->',
    '        <div class="cl-groups fade-up">',
    g,
    '        </div>',
    '<!--/TT-CLIENTS-->'
  ].join('\n');
}

/* ══ ESCRIURE O COMPROVAR ════════════════════════════════════════════════════ */
function posa(txt, marca, cos) {
  const a = txt.indexOf('<!--' + marca + '-->');
  const b = txt.indexOf('<!--/' + marca + '-->');
  if (a < 0 || b < 0) return null;
  return txt.slice(0, a) + cos + txt.slice(b + ('<!--/' + marca + '-->').length);
}

const HOME = readFileSync(HOME_F, 'utf8');
let out = posa(HOME, 'TT-CLIENTS-BANDA', banda());
if (out === null) { bad('no es troba el marcador TT-CLIENTS-BANDA a index.html'); }
else {
  const out2 = posa(out, 'TT-CLIENTS', graella());
  if (out2 === null) bad('no es troba el marcador TT-CLIENTS a index.html');
  else out = out2;
}

if (!fails) {
  /* ── Les guardes ─────────────────────────────────────────────────────────── */

  // 1 · Cap nom sense font. És la regla de la casa i va primer.
  const sense = TOTS.filter(c => !c.font || String(c.font).trim().length < 4);
  if (sense.length) bad('clients sense font documentada: ' + sense.map(c => c.n).join(', '));
  else ok(`${TOTS.length} clients, tots amb la seva font`);

  // 2 · Cap nom repetit entre grups: un client dues vegades infla la llista.
  const vist = new Set(), rep = [];
  TOTS.forEach(c => { const k = c.n.toLowerCase(); if (vist.has(k)) rep.push(c.n); vist.add(k); });
  if (rep.length) bad('clients repetits: ' + rep.join(', '));
  else ok('cap client comptat dues vegades');

  /* 3 · La banda és una banda i no un mur. Entre tres i vuit noms: amb menys
         no és prova i amb més ningú els llegeix, i deixa de ser una banda per
         passar a ser la llista sencera mal col·locada. */
  if (DESTACATS.length < 3 || DESTACATS.length > 8)
    bad(`${DESTACATS.length} destacats a la banda: n'han de ser entre 3 i 8`);
  else ok(`${DESTACATS.length} noms a la banda de la primera pantalla`);

  /* 4 · IKEA hi és. No és un caprici: és l'únic client de la llista amb VNA
         aplicat, que és exactament el que ven aquesta casa, i per això la nota
         que ho diu ha d'anar al costat del nom als dos blocs. */
  const ikea = TOTS.find(c => c.n === 'IKEA');
  if (!ikea) bad('IKEA no és a la llista: és el client que prova el que es ven');
  else if (!ikea.destacat) bad('IKEA no surt a la banda de la primera pantalla');
  else if (!/Value Network Analysis/i.test(ikea.nota || '')) bad('IKEA no diu què s\'hi va fer');
  else ok('IKEA surt a la primera pantalla, i diu què s\'hi va aplicar');

  // 5 · La nota de d'on vénen els noms, als dos blocs.
  const cos = banda() + graella();
  const n = (cos.match(/recorregut de/g) || []).length;
  if (n < 2) bad('la procedència dels noms no surt als dos blocs');
  else ok('i als dos llocs es diu de quin recorregut vénen');
}

if (CHECK) {
  if (out !== null && out !== HOME) bad('index.html no correspon a la declaració de build-clients.js');
  else if (!fails) ok('els blocs de clients estan al dia');
  console.log(fails ? '\n❌ Arregla-ho amb:  node SOS/tools/build-clients.js' : '\n✅ Els clients quadren.');
  process.exit(fails ? 1 : 0);
}

if (fails) { console.log('\n❌ No s\'ha escrit res.'); process.exit(1); }
writeFileSync(HOME_F, out);
console.log(`\n✅ index.html · banda amb ${DESTACATS.length} noms i graella amb ${TOTS.length} clients`);
