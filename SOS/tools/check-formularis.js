#!/usr/bin/env node
/* Guarda dels formularis · el que els fa útils i el que els faria perillosos
 * ─────────────────────────────────────────────────────────────────────────
 * Hi ha tres formularis —el diagnòstic del territori, el de l'organització i
 * el pressupost— i dues coses són certes alhora: **comparteixen blocs** i **no
 * envien res sense que algú ho premi**. Aquesta guarda vigila exactament
 * aquestes dues coses, perquè totes dues es trenquen en silenci.
 *
 * · Un bloc compartit que divergeix no peta res. Simplement, un formulari
 *   coneix un tipus d'organització que l'altre no, i qui ve del primer no
 *   s'hi troba al segon. La guarda els compara camp a camp.
 * · Un formulari que envia sol tampoc peta res: funciona millor que abans. El
 *   problema és que la pàgina promet, escrit i en negreta, que **no envia res
 *   fins que tu ho premis**, i el dia que algú hi afegeixi un `fetch` de bona
 *   fe la promesa serà falsa sense que ningú se n'adoni.
 *
 * I una tercera: el pressupost **no pot publicar un preu que la portada
 * amaga**. El catàleg deixa dos paquets sense xifra a posta; si el formulari
 * els posés un número, el que s'ha decidit una vegada quedaria desfet des d'una
 * altra pantalla.
 *
 * Ús:  node SOS/tools/check-formularis.js
 */
'use strict';
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const SOS = join(__dirname, '..');
const llegeix = f => readFileSync(join(SOS, f), 'utf8');
const dx = llegeix('diagnostic-territori.html');
const org = llegeix('diagnostic-org.html');
const pr = llegeix('pressupost.html');
const TRIA = llegeix('diagnostic.html');
const FORMS = [['territori', dx], ['organització', org], ['pressupost', pr]];
const { PAQUETS, SOS_PAQUETS, NIVELLS } = require('./build-oferta.js');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

console.log('\nGuarda dels formularis · territori ↔ organització ↔ pressupost');

/* ── 1 · Els blocs compartits diuen el mateix ─────────────────────────────
   Es comparen els blocs generats, no el fitxer sencer: la resta de cada
   formulari ha de ser diferent, que per això són dos. */
const entre = (src, obre, tanca) => {
  const i = src.indexOf(obre), j = src.indexOf(tanca);
  return i < 0 || j < i ? null : src.slice(i + obre.length, j).trim();
};
/* Dos són idèntics als tres formularis. El d'organització NO ho és a posta:
   cada família pregunta el que necessita —el territori vol el municipi i la
   població, l'organització vol quantes persones sou— i obligar-los a ser
   iguals hauria fet que una empresa hagués de dir els habitants del seu
   municipi. El que sí que ha de ser cert és el que fa funcionar el pont. */
const BLOCS = [
  ['<!--FORM-QUI-->', '<!--/FORM-QUI-->', 'qui ets'],
  ['/*FORM-DADES*/', '/*/FORM-DADES*/', 'les dades compartides']
];
for (const [o, t, nom] of BLOCS) {
  const trossos = FORMS.map(([n, src]) => [n, entre(src, o, t)]);
  const falten = trossos.filter(([, v]) => v === null || !v.length).map(([n]) => n);
  if (falten.length) bad(`el bloc «${nom}» no hi és o és buit a: ${falten.join(', ')} — sense marques no es pot compartir res`);
  else if (new Set(trossos.map(([, v]) => v)).size > 1)
    bad(`el bloc «${nom}» diu coses diferents a cada formulari — qui ve d'un no es trobarà a l'altre`);
  else ok(`el bloc «${nom}» és idèntic als ${trossos.length} formularis`);
}

/* El bloc d'organització pot dir coses diferents, però els camps que el pont
   es passa han de ser als tres: si un no hi és, qui ve d'un altre formulari es
   troba un camp buit i el torna a escriure sense saber per què. */
(() => {
  const PONT_CAMPS = ['id="orgNom"', 'id="municipi"', 'id="comarca"', 'id="orgType"'];
  const mal = [];
  FORMS.forEach(([n, src]) => {
    const b = entre(src, '<!--FORM-ORG-->', '<!--/FORM-ORG-->');
    if (b === null) { mal.push(n + ' (no hi és)'); return; }
    PONT_CAMPS.forEach(c => { if (b.indexOf(c) < 0) mal.push(n + ' → ' + c); });
  });
  if (mal.length) bad('camps del pont que falten al bloc d\'organització: ' + mal.join(', '));
  else ok(`els ${PONT_CAMPS.length} camps que viatgen pel pont hi són als tres`);

  /* I cada formulari només ofereix els tipus de la seva família: si el de
     l'organització oferís «ajuntament», el diagnòstic li parlaria de
     subvencions municipals a una empresa. */
  const tipus = src => [...(entre(src, '<!--FORM-ORG-->', '<!--/FORM-ORG-->') || '')
    .matchAll(/data-v="([\w-]+)"/g)].map(m => m[1]);
  const tTerr = tipus(dx), tOrg = tipus(org);
  const colats = tOrg.filter(x => ['ajuntament', 'comarcal', 'grup', 'acompanyament'].includes(x));
  if (colats.length) bad('el diagnòstic d\'organització ofereix tipus del territori: ' + colats.join(', '));
  else ok(`${tTerr.length} tipus al territori i ${tOrg.length} a l'organització, sense barrejar-se`);
})();

/* ── 2 · El pont existeix i és local ──────────────────────────────────────
   El que fa que no calgui tornar a escriure el nom. Si desapareix, el segon
   formulari torna a demanar-ho tot i ningú ho nota fins que algú abandona. */
for (const [nom, src] of FORMS) {
  const desa = /localStorage\.setItem\(\s*PONT/.test(src);
  const llegeix = /localStorage\.getItem\(\s*PONT/.test(src);
  if (desa && llegeix) ok(`el ${nom} desa i llegeix el pont entre formularis`);
  else bad(`al ${nom} li falta ${!desa ? 'desar' : 'llegir'} el pont — es tornarà a demanar el que ja se sap`);
  /* I ha d'anar dins d'un try: als navegadors amb dades bloquejades, llegir
     localStorage llança i s'emporta tota la pàgina. */
  if (/try\s*\{[^}]*localStorage/.test(src)) ok(`el ${nom} el toca dins d'un try — a finestra privada no peta`);
  else bad(`el ${nom} toca localStorage sense try — en finestra privada això llança i tomba la pàgina`);
}

/* ── 3 · Cap dels dos envia res sol ───────────────────────────────────────
   La pàgina ho promet en negreta. Es miren les maneres reals de treure dades
   d'un navegador; `mailto:` no hi és perquè obre el client de correu de la
   persona i no envia res per si sol. */
const FUITES = [
  [/\bfetch\s*\(/, 'fetch()'],
  [/XMLHttpRequest/, 'XMLHttpRequest'],
  [/navigator\.sendBeacon/, 'sendBeacon'],
  [/new\s+WebSocket/, 'WebSocket'],
  [/<form[^>]+action=/i, 'un <form> amb action'],
  [/googletagmanager|google-analytics|gtag\(/i, 'analítica']
];
for (const [nom, src] of [['territori', dx], ['pressupost', pr], ['la tria', TRIA]]) {
  const trobades = FUITES.filter(([re]) => re.test(src)).map(([, n]) => n);
  if (!trobades.length) ok(`el ${nom} no envia res sol: cap sortida de dades`);
  else bad(`el ${nom} té ${pl(trobades.length, 'sortida de dades', 'sortides de dades')} (${trobades.join(', ')}) — la pàgina promet que no envia res fins que tu ho premis`);
}

/* ── 3b · El diagnòstic d'organització SÍ que pot enviar, i només així ────
   És l'únic que té un botó d'enviar-nos-ho, i la regla no es relaxa: s'estreny.
   La promesa segueix sent la mateixa —«te l'endús, l'enviïs o no»— i el que la
   fa certa és que el diagnòstic es calculi i es vegi **sense cap crida**, i que
   enviar-lo sigui un acte a part que la persona prem.

   Tres coses, i les tres han de ser certes alhora:
     · exactament UNA crida de xarxa a tota la pàgina;
     · que visqui dins d'un `onclick`, no a l'arrencada ni dins del càlcul;
     · i que al costat hi hagi escrit què s'envia i a on. Un enviament que no
       es diu és pitjor que no tenir-lo. */
(() => {
  const altres = FUITES.filter(([re, n]) => n !== 'fetch()' && re.test(org)).map(([, n]) => n);
  if (altres.length) bad(`el diagnòstic d'organització té sortides que no toca (${altres.join(', ')})`);
  else ok('el diagnòstic d\'organització no té cap sortida de dades fora del botó');

  const crides = (org.match(/\bfetch\s*\(/g) || []).length;
  if (crides !== 1) bad(`el diagnòstic d'organització té ${crides} crides de xarxa: n'ha de tenir exactament una, la del botó`);
  else {
    const i = org.search(/\bfetch\s*\(/);
    const abans = org.slice(Math.max(0, i - 800), i);
    if (!/onclick\s*=\s*async\s*\(\s*\)\s*=>/.test(abans))
      bad('la crida de xarxa no penja d\'un clic: la pàgina enviaria sense que ningú ho premi');
    else ok('la seva única crida de xarxa viu dins del botó d\'enviar');
  }

  if (!/S'envia/.test(org) || !/Netlify/.test(org))
    bad('la pàgina no diu què s\'envia ni a on — un enviament que no es diu és pitjor que no tenir-lo');
  else ok('i diu què s\'envia i a on, al costat del botó');

  // El diagnòstic s'ha de poder veure encara que l'enviament falli.
  if (!/catch\s*\(/.test(org.slice(org.search(/\bfetch\s*\(/))))
    bad('si l\'enviament falla no ho recull ningú: la persona es quedaria sense saber-ho');
  else ok('i si falla es diu, i el diagnòstic es té igualment');
})();

/* ── 3c · El que es tria s'ha de VEURE que s'ha triat ─────────────────────
   Un formulari on prems una casella i no passa res visible no sembla trencat:
   sembla que no funciona. I és pitjor que trencat, perquè la tria sí que es
   desa —la persona no ho sap i torna a prémer, o se'n va.

   Va passar al diagnòstic d'organització: marcava amb `.on` i el CSS d'aquesta
   casa pinta `.opt.sel` i `.chip.sel`. Cap prova ho veia, perquè totes miren
   l'estat i no el color.

   La guarda mira les dues puntes: quina classe posa el JavaScript en clicar, i
   si aquella classe existeix al CSS de la mateixa pàgina. */
for (const [nom, src] of FORMS) {
  /* Es mira LA MATEIXA LÍNIA i no un tros de context: `on` també marca la
     barra de progrés i els missatges d'error, i amb una finestra de dos-cents
     caràcters aquelles crides es colaven i la guarda acusava codi correcte.
     Una guarda que acusa el que està bé ensenya a desconfiar-ne. */
  const marca = new Set();
  src.split('\n').forEach(linia => {
    if (!/\.(opt|chip)\b|#(orgType|objTipus|have|serveis|need)/.test(linia)) return;
    for (const m of linia.matchAll(/classList\.(?:add|toggle)\('([\w-]+)'/g)) marca.add(m[1]);
  });
  const sensePintar = [...marca].filter(c =>
    !new RegExp('\\.(opt|chip)\\.' + c + '\\b').test(src));
  if (!marca.size) bad(`al ${nom} no es veu quina classe marca el que es tria`);
  else if (sensePintar.length)
    bad(`al ${nom} es marca amb «${sensePintar.join(', ')}» i el CSS no la pinta — la tria es desa i no es veu, que sembla que no funcioni`);
  else ok(`al ${nom} el que es tria es marca amb «${[...marca].join(', ')}» i el CSS ho pinta`);
}

/* ── 4 · El pressupost no publica el que la portada amaga ─────────────────
   Els paquets sense xifra al catàleg no poden tenir-ne una al formulari: el que
   es decideix una vegada no es pot desfer des d'una altra pantalla. Veda 140. */
const mides = PAQUETS.concat(SOS_PAQUETS).filter(p => p.mida);
if (!mides.length) bad('cap paquet a mida al catàleg: aquesta comprovació no pot mirar res');
else {
  const filtrats = mides.filter(p => {
    const re = new RegExp('value="' + p.id + '"[^>]*>');
    const m = pr.match(new RegExp('<label class="pq"[^>]*>\\s*<input[^>]*value="' + p.id + '"[^>]*>(.*?)</label>'));
    return !re.test(pr) || !m || !/a mida/.test(m[1]) || /\d[\d.]*\s*€/.test(m[1]);
  });
  if (!filtrats.length) ok(`els ${mides.length} paquets sense xifra publicada tampoc en porten al formulari`);
  else bad(`${pl(filtrats.length, 'paquet publica preu', 'paquets publiquen preu')} al formulari i no a la portada (${filtrats.map(p => p.id).join(', ')})`);
}

/* ── 5 · El catàleg del formulari és el catàleg ───────────────────────────
   Un paquet que es ven a la portada i no es pot demanar al formulari és una
   venda que es perd sense que ho digui ningú. */
const tots = PAQUETS.concat(SOS_PAQUETS);
const absents = tots.filter(p => !pr.includes('value="' + p.id + '"'));
if (!absents.length) ok(`els ${tots.length} paquets del catàleg es poden demanar al formulari`);
else bad(`${pl(absents.length, 'paquet no es pot demanar', 'paquets no es poden demanar')} (${absents.map(p => p.id).join(', ')}) — es venen i no es poden comprar`);

/* ── 6 · L'escala és la mateixa que la de la portada ──────────────────────
   Dos preus hora en dues pantalles és un preu hora fals. */
const dolents = NIVELLS.filter(n => !new RegExp("hora:" + n.hora + "\\b").test(pr));
if (!dolents.length) ok(`els ${NIVELLS.length} nivells de l'escala hi són amb el seu preu hora`);
else bad(`l'escala del formulari no quadra amb la del catàleg (${dolents.map(n => n.id).join(', ')})`);

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} als formularis.` : '\n✅ Els formularis quadren.');
process.exit(fails ? 1 : 0);
