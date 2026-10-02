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
 * ── D'on surten els noms, ara ───────────────────────────────────────────────
 * La primera versió d'aquest fitxer els va treure del catàleg comercial. La
 * font de debò és **`clients.html` d'aquest mateix repositori**, que és la
 * pàgina de clients de TeamTowers —la mateixa llista que hi ha a
 * `teamtowers.eu/#clientes`— i que porta, a més, **a què es dedica cadascun**.
 * Aquella línia és la que fa que la paret de noms deixi de ser un mur de logos
 * i passi a dir alguna cosa: qui la llegeix veu de quins móns venen.
 *
 * D'allà surten set noms que no hi eren —Zurich, Orange, UPS i **les sis
 * agències i partners**— i la separació entre universitat i escola de negocis.
 * Les agències són el cas que més importa: és exactament el segment `agencia`
 * del diagnòstic d'organització (una agència **no decideix, revèn**), i teníem
 * la pantalla feta per a elles i cap prova que ja ens han contractat.
 *
 * Els que **no** són a `clients.html` i sí al catàleg del 2026 —John Deere,
 * Softonic, la UOC, la UPC, la Universidad de León i els tres del sector
 * públic— s'hi queden, amb la seva font escrita al costat.
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
 *   node SOS/tools/build-clients.js            escriu els blocs i el diccionari
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
const js = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ══ LA DECLARACIÓ ═══════════════════════════════════════════════════════════
   `sec` és a què es dedica, en les dues llengües, i no és decoració: sense ella
   la paret és un mur de logos i amb ella es llegeix de quins móns venim.

   `destacat` marca els que surten grans a la paret. Són pocs a posta: si tot
   destaca no destaca res, i una jerarquia plana fa que els trenta-dos noms es
   llegeixin com una llista de la compra.

   FONT_WEB és la pàgina de clients de TeamTowers d'aquest repositori, que és la
   mateixa llista que hi ha publicada a teamtowers.eu. */
const FONT_WEB = 'TeamTowers · clients.html (la llista publicada)';
const FONT_CAT = 'TeamTowers · catàleg 2026';

const GRUPS = [
  {
    id: 'empreses', color: 'indigo',
    nom: { ca: 'Empreses', es: 'Empresas' },
    clients: [
      { n: 'IKEA', destacat: true, font: FONT_WEB, sec: { ca: 'Retail i sostenibilitat', es: 'Retail y sostenibilidad' }, nota: 'dos mapes de valor: la direcció i l\'àrea de serveis' },
      { n: 'Telefónica', destacat: true, font: FONT_WEB, sec: { ca: 'Comunicacions', es: 'Comunicaciones' } },
      { n: 'BBVA', destacat: true, font: FONT_WEB, sec: { ca: 'Banca digital', es: 'Banca digital' } },
      { n: 'Novartis', destacat: true, font: FONT_WEB, sec: { ca: 'Farmacèutica', es: 'Farmacéutica' } },
      { n: 'Porsche', destacat: true, font: FONT_WEB, sec: { ca: 'Automoció de luxe', es: 'Automoción de lujo' } },
      { n: 'la Caixa', font: FONT_WEB, sec: { ca: 'Banca i finances', es: 'Banca y finanzas' } },
      { n: 'Vodafone', font: FONT_WEB, sec: { ca: 'Telecomunicacions', es: 'Telecomunicaciones' } },
      { n: 'Orange', font: FONT_WEB, sec: { ca: 'Telecomunicacions', es: 'Telecomunicaciones' } },
      { n: 'Mercedes', font: FONT_WEB, sec: { ca: 'Automoció premium', es: 'Automoción premium' } },
      { n: 'Zurich', font: FONT_WEB, sec: { ca: 'Assegurances', es: 'Seguros' } },
      { n: 'UPS', font: FONT_WEB, sec: { ca: 'Logística', es: 'Logística' } },
      { n: 'InfoJobs', font: FONT_WEB, sec: { ca: 'Tecnologia i ocupació', es: 'Tecnología y empleo' } },
      { n: 'John Deere', font: FONT_CAT, sec: { ca: 'Maquinària agrícola', es: 'Maquinaria agrícola' } },
      { n: 'Softonic', font: FONT_CAT, sec: { ca: 'Programari i internet', es: 'Software e internet' } }
    ]
  },
  {
    id: 'universitats', color: 'green',
    nom: { ca: 'Universitats', es: 'Universidades' },
    clients: [
      { n: 'UB', font: FONT_WEB, sec: { ca: 'Universitat de Barcelona', es: 'Universidad de Barcelona' } },
      { n: 'UAB', font: FONT_WEB, sec: { ca: 'Universitat Autònoma de Barcelona', es: 'Universidad Autónoma de Barcelona' } },
      /* La Salle surt dues vegades a la pàgina d'origen —com a universitat i
         com a escola de negocis— i és la mateixa casa. Es compta un cop i es
         diu que és totes dues coses: comptar-la dues vegades inflaria la
         llista, i és exactament el que la guarda 2 no deixa passar. */
      { n: 'La Salle', font: FONT_WEB, sec: { ca: 'Universitat Ramon Llull · també escola de negocis', es: 'Universidad Ramon Llull · también escuela de negocios' } },
      { n: 'UOC', font: FONT_CAT, sec: { ca: 'Universitat Oberta de Catalunya', es: 'Universitat Oberta de Catalunya' } },
      { n: 'UPC', font: FONT_CAT, sec: { ca: 'Universitat Politècnica de Catalunya', es: 'Universidad Politécnica de Cataluña' } },
      { n: 'Universidad de León', font: FONT_CAT, sec: { ca: 'Castella i Lleó', es: 'Castilla y León' } }
    ]
  },
  {
    id: 'escoles', color: 'purple',
    nom: { ca: 'Escoles de negoci', es: 'Escuelas de negocio' },
    clients: [
      { n: 'ESADE', destacat: true, font: FONT_WEB, sec: { ca: 'Escola de negocis', es: 'Escuela de negocios' } },
      { n: 'IESE', font: FONT_WEB, sec: { ca: 'Escola de negocis', es: 'Escuela de negocios' } },
      { n: 'EADA', font: FONT_WEB, sec: { ca: 'Escola de negocis', es: 'Escuela de negocios' } }
    ]
  },
  {
    /* EL GRUP QUE FALTAVA. Una agència o un DMC no decideix: revèn a un client
       seu. És el segment `agencia` del diagnòstic d'organització, i teníem la
       pantalla feta per a elles i cap prova que ja ens han contractat. */
    id: 'agencies', color: 'orange',
    nom: { ca: 'Agències i partners', es: 'Agencias y partners' },
    clients: [
      { n: 'Laeski', font: FONT_WEB, sec: { ca: 'Producció integral', es: 'Producción integral' } },
      { n: 'We Barcelona', font: FONT_WEB, sec: { ca: 'Esdeveniments internacionals', es: 'Eventos internacionales' } },
      { n: 'Kivicom', font: FONT_WEB, sec: { ca: 'Gimcanes interactives', es: 'Gincanas interactivas' } },
      { n: 'Box de Ideas', font: FONT_WEB, sec: { ca: 'Innovació corporativa', es: 'Innovación corporativa' } },
      { n: 'Voxel', font: FONT_WEB, sec: { ca: 'Tecnologia 3D', es: 'Tecnología 3D' } },
      { n: 'Unit Elements', font: FONT_WEB, sec: { ca: 'Disseny industrial', es: 'Diseño industrial' } }
    ]
  },
  {
    id: 'public', color: 'blue',
    nom: { ca: 'Sector públic', es: 'Sector público' },
    clients: [
      { n: 'Diputació de Barcelona', font: FONT_CAT, sec: { ca: 'Administració supramunicipal', es: 'Administración supramunicipal' } },
      { n: 'Ajuntament de Vilafranca', font: FONT_CAT, sec: { ca: 'Administració local', es: 'Administración local' } },
      { n: 'Junta de Castilla y León', font: FONT_CAT, sec: { ca: 'Administració autonòmica', es: 'Administración autonómica' } }
    ]
  }
];

/* La nota de procedència, un cop i en les dues llengües. Surt als dos blocs
   perquè cap dels dos es pugui llegir sol i dir més del que hem dit. */
const NOTA = {
  ca: 'Del recorregut de <a href="https://teamtowers.eu" target="_blank" rel="noopener">TeamTowers</a>: formació en valors d\'equip i cohesió. <strong>A IKEA, a més, dos mapes de valor: el de la direcció i el de l\'àrea de serveis.</strong>',
  es: 'Del recorrido de <a href="https://teamtowers.eu" target="_blank" rel="noopener">TeamTowers</a>: formación en valores de equipo y cohesión. <strong>En IKEA, además, dos mapas de valor: el de la dirección y el del área de servicios.</strong>'
};
const CAP = {
  lbl: { ca: 'Han estat clients de TeamTowers', es: 'Han sido clientes de TeamTowers' },
  h2: { ca: 'Multinacionals, universitats i agències, <em>i el mateix mètode</em>',
    es: 'Multinacionales, universidades y agencias, <em>y el mismo método</em>' }
};

const TOTS = GRUPS.flatMap(g => g.clients);
const DESTACATS = TOTS.filter(c => c.destacat);
const clau = c => 'cl.s.' + slug(c.n);

/* ══ ELS BLOCS ═══════════════════════════════════════════════════════════════ */

/* ── 1 · LA PARET, just sota del hero ────────────────────────────────────────
   Era una línia de noms separats per espais. Una línia de text no és una prova:
   es llegeix com una frase i se salta com una frase. Ara és una graella de
   fitxes amb el nom i a què es dediquen, agrupades i amb el color del grup, que
   és el que fa que es vegi d'un cop que això toca móns molt diferents. */
function mur() {
  const grups = GRUPS.map(g => [
    '    <div class="clm-g" data-g="' + g.id + '">',
    '      <p class="clm-gl" data-i18n="cl.g.' + g.id + '">' + esc(g.nom.ca) + '</p>',
    '      <div class="clm-grid">',
    g.clients.map(c =>
      '        <div class="clm-c' + (c.destacat ? ' dest' : '') + '">' +
      '<span class="clm-n">' + esc(c.n) + '</span>' +
      '<span class="clm-s" data-i18n="' + clau(c) + '">' + esc(c.sec.ca) + '</span></div>').join('\n'),
    '      </div>',
    '    </div>'
  ].join('\n')).join('\n');
  return [
    '<!--TT-CLIENTS-MUR-->',
    '<!-- GENERAT per SOS/tools/build-clients.js · no s\'edita a mà -->',
    '<section class="cl-mur" id="clients" aria-label="Clients">',
    '  <div class="container">',
    '    <p class="clm-lbl" data-i18n="clm.lbl">' + esc(CAP.lbl.ca) + '</p>',
    '    <h2 class="clm-h2" data-i18n-html="clm.h2">' + CAP.h2.ca + '</h2>',
    grups,
    '    <p class="clm-nota" data-i18n-html="clm.nota">' + NOTA.ca + '</p>',
    '  </div>',
    '</section>',
    '<!--/TT-CLIENTS-MUR-->'
  ].join('\n');
}

/* ── 2 · La llista compacta de `#trajectoria` ─────────────────────────────── */
function graella() {
  const g = GRUPS.map(gr => [
    '            <div>',
    '                <div class="cl-group-lbl" data-i18n="cl.g.' + gr.id + '">' + esc(gr.nom.ca) + '</div>',
    '                <div class="cl-logos">' + gr.clients.map(c => '<span>' + esc(c.n) + '</span>').join('') +
      (gr.id === 'empreses' ? '<span class="muted" data-i18n="cl.emp">i +150 empreses en formació i cohesió d\'equips</span>' : '') + '</div>',
    gr.id === 'empreses'
      ? '                <p class="cl-font" data-i18n-html="cl.font">' + NOTA.ca + '</p>'
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

/* ── 3 · El diccionari ───────────────────────────────────────────────────────
   Les dues llengües surten de la mateixa declaració. Escrites a mà, el dia que
   s'afegís un client la portada en castellà el deixaria en català i la guarda
   de `check-landing.js` no ho perdonaria —i amb raó. */
function dicc(ll) {
  const L = [];
  L.push("  'clm.lbl':'" + js(CAP.lbl[ll]) + "','clm.h2':'" + js(CAP.h2[ll]) + "',");
  L.push("  'clm.nota':'" + js(NOTA[ll]) + "',");
  L.push("  'cl.font':'" + js(NOTA[ll]) + "',");
  L.push("  'cl.emp':'" + js(ll === 'ca'
    ? 'i +150 empreses en formació i cohesió d\'equips'
    : 'y +150 empresas en formación y cohesión de equipos') + "',");
  L.push('  ' + GRUPS.map(g => "'cl.g." + g.id + "':'" + js(g.nom[ll]) + "'").join(',') + ',');
  /* Les línies de sector, una per client. Es reparteixen en línies de tres
     perquè el diff es pugui llegir el dia que se'n canviï una. */
  const s = TOTS.map(c => "'" + clau(c) + "':'" + js(c.sec[ll]) + "'");
  for (let i = 0; i < s.length; i += 3) L.push('  ' + s.slice(i, i + 3).join(',') + ',');
  return L.join('\n');
}

/* ══ ESCRIURE O COMPROVAR ════════════════════════════════════════════════════ */
function posa(txt, marca, cos) {
  const a = txt.indexOf('<!--' + marca + '-->');
  const b = txt.indexOf('<!--/' + marca + '-->');
  if (a < 0 || b < 0) return null;
  return txt.slice(0, a) + cos + txt.slice(b + ('<!--/' + marca + '-->').length);
}
function posaJs(txt, marca, cos) {
  const o = '/*' + marca + '*/', t = '/*/' + marca + '*/';
  const a = txt.indexOf(o), b = txt.indexOf(t);
  if (a < 0 || b < 0) return null;
  return txt.slice(0, a + o.length) + '\n' + cos + '\n' + txt.slice(b);
}

const HOME = readFileSync(HOME_F, 'utf8');
let out = HOME;
const PASSES = [
  ['TT-CLIENTS-MUR', () => posa(out, 'TT-CLIENTS-MUR', mur())],
  ['TT-CLIENTS', () => posa(out, 'TT-CLIENTS', graella())],
  ['TT-CL-I18N-CA', () => posaJs(out, 'TT-CL-I18N-CA', dicc('ca'))],
  ['TT-CL-I18N-ES', () => posaJs(out, 'TT-CL-I18N-ES', dicc('es'))]
];
for (const [nom, fn] of PASSES) {
  const r = fn();
  if (r === null) bad('no es troba el marcador ' + nom + ' a index.html');
  else out = r;
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

  /* 3 · Cap nom sense dir a què es dedica, i en les dues llengües. Sense
         aquesta línia la paret torna a ser un mur de logos, que és el que era
         quan els noms anaven seguits en una sola fila. */
  const muts = TOTS.filter(c => !c.sec || !c.sec.ca || !c.sec.es);
  if (muts.length) bad('clients sense dir a què es dediquen: ' + muts.map(c => c.n).join(', '));
  else ok('i tots diuen a què es dediquen, en català i en castellà');

  /* 4 · Jerarquia: entre tres i vuit noms grans. Si tot destaca no destaca res
         i els trenta-dos es llegeixen com una llista de la compra. */
  if (DESTACATS.length < 3 || DESTACATS.length > 8)
    bad(`${DESTACATS.length} noms destacats: n'han de ser entre 3 i 8`);
  else ok(`${DESTACATS.length} noms destacats de ${TOTS.length}`);

  /* 5 · IKEA hi és. No és un caprici: és l'únic client de la llista amb VNA
         aplicat, que és exactament el que ven aquesta casa. */
  const ikea = TOTS.find(c => c.n === 'IKEA');
  if (!ikea) bad('IKEA no és a la llista: és el client que prova el que es ven');
  else if (!ikea.destacat) bad('IKEA no surt destacada');
  /* I no «VNA» en general: **quins dos mapes**. És l'única entrega de VNA amb
     client anomenat que tenim, i dir-ne només la sigla deixa la prova a mitges
     —qualsevol pot dir que ha aplicat un mètode; dir quines dues àrees es van
     mapar és el que la fa comprovable per qui hi era. */
  else if (!/direcci|serveis/i.test(ikea.nota || ''))
    bad('IKEA no diu **quins** dos mapes van ser: sense les dues àrees, la prova es queda a mitges');
  else ok('IKEA surt destacada, i es diu quins dos mapes de valor s\'hi van fer');

  /* 6 · El grup d'agències no es pot buidar. El diagnòstic d'organització té
         un segment sencer per a elles —«ho compres per a un client teu»— i una
         pantalla feta per a un públic del qual no ensenyem cap client és una
         pantalla que demana confiança sense donar-ne. */
  const ag = GRUPS.find(g => g.id === 'agencies');
  if (!ag || !ag.clients.length) bad('el grup d\'agències i partners és buit: el diagnòstic té un segment per a elles');
  else ok(`${ag.clients.length} agències i partners, que és el segment «agencia» del diagnòstic`);

  // 7 · La nota de d'on vénen els noms, als dos blocs.
  const cos = mur() + graella();
  if ((cos.match(/recorregut de/g) || []).length < 2) bad('la procedència dels noms no surt als dos blocs');
  else ok('i als dos llocs es diu de quin recorregut vénen');

  /* 8 · Les dues llengües, les mateixes claus. `check-landing.js` ja ho vigila
         per a tota la portada; aquí es caça abans d'escriure-ho. */
  const cl = k => [...dicc(k).matchAll(/'([\w.-]+)':/g)].map(m => m[1]).sort().join(',');
  if (cl('ca') !== cl('es')) bad('el diccionari generat no porta les mateixes claus en català i en castellà');
  else ok('les dues llengües porten les mateixes claus');
}

if (CHECK) {
  if (!fails && out !== HOME) bad('index.html no correspon a la declaració de build-clients.js');
  else if (!fails) ok('els blocs de clients estan al dia');
  console.log(fails ? '\n❌ Arregla-ho amb:  node SOS/tools/build-clients.js' : '\n✅ Els clients quadren.');
  process.exit(fails ? 1 : 0);
}

if (fails) { console.log('\n❌ No s\'ha escrit res.'); process.exit(1); }
writeFileSync(HOME_F, out);
console.log(`\n✅ index.html · paret amb ${TOTS.length} clients en ${GRUPS.length} grups`);

module.exports = { GRUPS, TOTS };
