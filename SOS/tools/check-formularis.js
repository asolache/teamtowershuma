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

/* ── 2 · El pont existeix i és de la pestanya ─────────────────────────────
   El que fa que no calgui tornar a escriure el nom. Si desapareix, el segon
   formulari torna a demanar-ho tot i ningú ho nota fins que algú abandona.
   Viu a `sessionStorage` i no a `localStorage` (avís legal, 10/10/2026): el
   nom, el correu i el telèfon no es queden desats per a la visita següent. */
for (const [nom, src] of FORMS) {
  const desa = /sessionStorage\.setItem\(\s*PONT/.test(src);
  const llegeix = /sessionStorage\.getItem\(\s*PONT/.test(src);
  if (/localStorage\.setItem\(\s*PONT/.test(src))
    bad(`el ${nom} torna a desar el pont a localStorage — les dades de contacte s'hi quedarien per sempre`);
  if (desa && llegeix) ok(`el ${nom} desa i llegeix el pont entre formularis`);
  else bad(`al ${nom} li falta ${!desa ? 'desar' : 'llegir'} el pont — es tornarà a demanar el que ja se sap`);
  /* I ha d'anar dins d'un try: als navegadors amb dades bloquejades, llegir
     localStorage llança i s'emporta tota la pàgina. */
  if (/try\s*\{[^}]*sessionStorage/.test(src)) ok(`el ${nom} el toca dins d'un try — a finestra privada no peta`);
  else bad(`el ${nom} toca sessionStorage sense try — en finestra privada això llança i tomba la pàgina`);
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
for (const [nom, src] of [['territori', dx], ['la tria', TRIA]]) {
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
/* El pressupost s'hi afegeix el 09/10/2026: és la pàgina de preus i té el botó
   «Confirma la comanda». La mateixa regla, sense relaxar-la: una crida, dins
   d'un clic, dient què s'envia i a on, i recollint l'error. */
for (const [nom, src] of [['el diagnòstic d\'organització', org], ['el pressupost', pr]]) {
  const altres = FUITES.filter(([re, n]) => n !== 'fetch()' && re.test(src)).map(([, n]) => n);
  if (altres.length) bad(`${nom} té sortides que no toca (${altres.join(', ')})`);
  else ok(`${nom} no té cap sortida de dades fora del botó`);

  const crides = (src.match(/\bfetch\s*\(/g) || []).length;
  if (crides !== 1) bad(`${nom} té ${crides} crides de xarxa: n'ha de tenir exactament una, la del botó`);
  else {
    const i = src.search(/\bfetch\s*\(/);
    const abans = src.slice(Math.max(0, i - 1200), i);
    if (!/onclick\s*=\s*async\s*\(\s*\)\s*=>/.test(abans))
      bad(`la crida de xarxa de ${nom} no penja d'un clic: la pàgina enviaria sense que ningú ho premi`);
    else ok(`la seva única crida de xarxa viu dins del botó d'enviar (${nom})`);
  }

  if (!/S'envia/.test(src) || !/Netlify/.test(src))
    bad(`${nom} no diu què s'envia ni a on — un enviament que no es diu és pitjor que no tenir-lo`);
  else ok(`i diu què s'envia i a on, al costat del botó (${nom})`);

  // El que s'ha fet s'ha de poder tenir encara que l'enviament falli.
  if (!/catch\s*\(/.test(src.slice(src.search(/\bfetch\s*\(/))))
    bad(`si l'enviament de ${nom} falla no ho recull ningú: la persona es quedaria sense saber-ho`);
  else ok(`i si falla es diu (${nom})`);
}

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

/* ── 7 · Les quatre pantalles es llegeixen en dues llengües ───────────────
   Els dos diagnòstics **ja portaven les claus** `data-i18n` dels blocs
   compartits —les escriu `build-formularis.js`— i **no tenien cap diccionari
   que les llegís**. Les claus hi eren, el text es quedava en català i no
   petava res. Aquesta regla mira les tres coses que ho fan possible: que hi
   hagi commutador, que hi hagi els dos diccionaris, i que **cada clau que el
   marcatge fa servir existeixi a tots dos**.

   La tercera és la que importa. Una clau que només és al diccionari català no
   peta: deixa aquell text sense traduir i prou, que és exactament el defecte
   que es busca. */
{
  const PANTALLES = [['tria', TRIA], ['territori', dx], ['organització', org], ['pressupost', pr]];
  /* Les claus d'un dels dos blocs del diccionari. L'estructura és la mateixa a
     les quatre pàgines: `var X_I18N = {`, després `ca: {` i després `es: {`. */
  const clausDe = (src, quin) => {
    const i = src.search(/var \w+_I18N\s*=\s*\{/);
    if (i < 0) return null;
    const ca = src.indexOf('\nca: {', i), es = src.indexOf('\nes: {', i);
    if (ca < 0 || es < 0 || es < ca) return null;
    const tros = quin === 'ca' ? src.slice(ca, es) : src.slice(es, src.indexOf('\n};', es));
    return new Set([...tros.matchAll(/^\s*'([^']+)'\s*:/gm)].map(m => m[1]));
  };
  const problemes = [];
  PANTALLES.forEach(([nom, src]) => {
    if (!/class="lang-b[^"]*"[^>]*data-lang="ca"/.test(src) || !/data-lang="es"/.test(src))
      problemes.push(nom + ' → no té commutador de llengua');
    /* I la tria ha de venir de la portada. La portada la desa a `tt_lang` i
       aquestes pàgines a `sos.lang`: si només es llegeix la seva, qui tria
       castellà a `teamtowershuma.com` i clica cap a un formulari se'l troba en
       català. No peta; només perd la tria en passar d'una banda a l'altra. */
    if (!/getItem\('tt_lang'\)/.test(src) || !/setItem\('tt_lang'/.test(src))
      problemes.push(nom + ' → no comparteix la tria de llengua amb la portada (`tt_lang`)');
    const ca = clausDe(src, 'ca'), es = clausDe(src, 'es');
    if (!ca || !es) { problemes.push(nom + ' → no s\'hi troben els dos diccionaris'); return; }
    /* Les claus que el marcatge fa servir. S'hi afegeixen les que només crida
       el JavaScript? No: aquelles les cobreix la paritat dels dos blocs. */
    const usades = new Set([...src.matchAll(/data-i18n(?:-html|-ph)?="([^"]+)"/g)].map(m => m[1]));
    const soles = [...usades].filter(k => !ca.has(k) || !es.has(k));
    if (soles.length) problemes.push(nom + ' → claus al marcatge sense valor a les dues llengües: '
      + soles.slice(0, 5).join(', '));
    const nomesCa = [...ca].filter(k => !es.has(k));
    const nomesEs = [...es].filter(k => !ca.has(k));
    if (nomesCa.length) problemes.push(nom + ' → només en català: ' + nomesCa.slice(0, 5).join(', '));
    if (nomesEs.length) problemes.push(nom + ' → només en castellà: ' + nomesEs.slice(0, 5).join(', '));

    /* I al revés: **cap clau que no la llegeixi ningú**. `pr.priv` existia als
       dos diccionaris amb la promesa de privacitat i el marcatge no en portava
       cap: la clau hi era, el paràgraf es quedava en català i les dues regles
       de dalt donaven verd —les claus quadraven perfectament.

       Una clau pot venir del marcatge o del JavaScript (`T('pr.r.metode')`), i
       per això no es busca l'atribut sinó **el nom en qualsevol altre lloc del
       fitxer**: si només apareix als dos diccionaris, no la demana ningú. */
    /* `fo.*` i `nv.*` en queden fora: són els blocs compartits, i el generador
       els escriu **sencers a totes** les pàgines. El diagnòstic del territori
       porta `fo.l.persones` sense fer-la servir perquè aquell camp és de
       l'altra branca, i això no és una clau morta sinó un diccionari compartit.
       Les que es miren són les de la pàgina. */
    const orfes = [...ca].filter(k => {
      if (/^(fo|nv)\./.test(k)) return false;
      const n = src.split("'" + k + "'").length - 1;
      return n <= 2 && !usades.has(k);
    });
    if (orfes.length) problemes.push(nom + ' → claus que no llegeix ningú: '
      + orfes.slice(0, 5).join(', ') + (orfes.length > 5 ? ` (+${orfes.length - 5})` : ''));
  });
  if (!problemes.length) ok('les quatre pantalles tenen commutador i els dos diccionaris amb les mateixes claus');
  else bad('la traducció dels formularis té forats:\n    ' + problemes.join('\n    ')
    + '\n    — una clau que només és en una llengua deixa aquell text sense traduir i no peta');
}

/* ── 8 · Cap text de catàleg sense el seu germà castellà ──────────────────
   El text del **resultat** del diagnòstic no surt del diccionari: surt dels
   catàlegs —mòduls, serveis, perfils, objectius, paquets—, i allà el castellà
   va al costat del català (`t`/`tEs`). Afegir-hi una entrada sense el germà no
   peta: aquella línia es llegeix en català amb el castellà posat.

   Es compta, i prou. Si hi ha vuit perfils amb `lead:` n'hi ha d'haver vuit
   amb `leadEs:`. Una regla que mirés quina falta hauria de saber-se
   l'estructura de cada catàleg; comptar no, i troba el mateix defecte. */
{
  const PARELLES = ['t', 'd', 'seg', 'title', 'fita', 'lead', 'dur', 'fund', 'nom', 'diu', 'llegim', 'endus'];
  const compta = (src, k) =>
    (src.match(new RegExp('\\b' + k + ':[\'\\[]', 'g')) || []).length;
  const coixos = [];
  [['territori', dx], ['organització', org]].forEach(([nom, src]) => {
    PARELLES.forEach(k => {
      const a = compta(src, k), b = compta(src, k + 'Es');
      if (a && a !== b) coixos.push(`${nom} → ${a} × \`${k}\` i ${b} × \`${k}Es\``);
    });
  });
  if (!coixos.length) ok('i els catàlegs del resultat porten el castellà al costat de cada text');
  else bad('text de catàleg sense traducció:\n    ' + coixos.join('\n    ')
    + '\n    — el formulari es llegiria traduït i el diagnòstic que en surt, no');
}

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} als formularis.` : '\n✅ Els formularis quadren.');
process.exit(fails ? 1 : 0);
