#!/usr/bin/env node
/* Guarda del registre públic · el número dels 150.000
 * ─────────────────────────────────────────────────────────────────────────
 * El registre és l'única cosa d'aquesta app que **es publica i no es pot
 * desdir**. Un cop una versió és a fora, ja no es pot treure el que hi hagi
 * dins ni tornar a numerar ningú. Per això aquí es vigila més que enlloc, i es
 * vigila sobre el fitxer i no sobre les proves: el que peta al navegador es
 * veu; el que s'hi cola en silenci, no.
 *
 * Es comprova:
 *
 *   1. **El compromís d'alta no porta cap dada de persona.** L'única cosa que
 *      hi entra és `did | hash`, i totes dues passen per una funció de resum.
 *      Si algun dia hi entrés un nom o un municipi, el registre públic passaria
 *      a ser una llista de gent.
 *   2. **El número no es guarda enlloc: es dedueix.** No pot existir cap camp
 *      `numero` desat al dossier ni a l'estat — un número desat és un número que
 *      no es pot comprovar i que un dia divergirà del registre.
 *   3. **Les altes són un delta amb la seva posició de sortida.** `altesAbans`,
 *      `altesTotal` i `altesRoot` han d'existir i entrar al paquet abans de
 *      signar-lo, i la verificació ha de comprovar l'arrel, el format i que no
 *      n'hi hagi cap de repetida.
 *   4. **Una alta necessita signatura i encadenat.** Si `primeresAltes` deixés
 *      de mirar-ho, el número es podria guanyar escrivint un nom.
 *   5. **Els 150.000 són un sol número declarat**, i el fitxer del registre i
 *      els prompts no en poden dir un altre.
 *   6. **El preu porta data i font.** Una xifra de diners sense data menteix en
 *      silenci al cap d'un any — la mateixa regla que la taula de La Compra.
 *   7. **Els prompts de la IA prohibeixen inventar el número.** És la mentida
 *      més fàcil i la més cara: es descobreix el dia que dues persones es
 *      comparen els cromos.
 *
 * Ús:  node SOS/tools/check-registre.js
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const APP = readFileSync(join(ARREL, 'SOS', 'index.html'), 'utf8');
const CHAR = readFileSync(join(ARREL, 'SOS', 'prompts', 'character_dossier.md'), 'utf8');
const KIT = readFileSync(join(ARREL, 'SOS', 'prompts', 'narrative_kit.md'), 'utf8');
const IDX = readFileSync(join(ARREL, 'SOS', 'registre', 'index.json'), 'utf8');
const README = readFileSync(join(ARREL, 'SOS', 'registre', 'README.md'), 'utf8');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;
/* El cos d'una funció, de la capçalera fins a la clau que la tanca a columna 0.
   És prou per a aquest fitxer, on totes les funcions estan al primer nivell. */
const cos = nom => {
  const i = APP.indexOf(nom);
  if (i < 0) return '';
  const j = APP.indexOf('\n}\n', i);
  return j < 0 ? '' : APP.slice(i, j + 2);
};

console.log('\nGuarda del registre públic · el número dels 150.000');

/* ── 1 · El compromís no porta cap dada de persona ───────────────────────── */
const commit = cos('async function altaCommitment(');
const primeres = cos('function primeresAltes(');
if (!commit || !primeres) {
  bad('no es troben altaCommitment o primeresAltes: la guarda del registre s\'ha quedat cega');
} else {
  const IDENTITAT = /\b(name|nom|who|alias|email|correu|phone|telefon|municipi|place|birth|dni)\b/;
  const entra = (commit.match(/ALTA_V\+'\|'\+([^)]*)\)/) || [])[1] || '';
  if (entra && !IDENTITAT.test(entra))
    ok(`al compromís d'alta hi entra només «${entra.replace(/\s+/g, '')}»: cap dada de persona`);
  else bad(`al compromís d'alta hi entra «${entra || '?'}» — el registre públic passaria a ser ` +
    'una llista de gent, i publicat no es pot desdir');

  /* Que el `did` i el hash hi entrin sencers i surtin resumits és el que fa que
     publicar-ho no reveli res: es pot comprovar, no es pot llegir. */
  if (/sha256\(/.test(commit) && /\.slice\(0,ALTA_LLARG\)/.test(commit))
    ok('i surt resumit i retallat: es pot comprovar, no es pot llegir');
  else bad('el compromís no passa per sha256 retallat: el que es publica seria reversible');
}

/* ── 2 · El número es dedueix, no es desa ────────────────────────────────── */
const desa = [
  [/saveDossier\([^)]*numero/i, 'es desaria al dossier'],
  [/character\s*=\s*Object\.assign\([^)]*numero/i, 'es desaria al personatge'],
  [/\bm\.numero\s*=/, 'es desaria a la fitxa de membre'],
  [/state\.numero\s*=/, 'es desaria a l\'estat']
].filter(([re]) => re.test(APP));
if (!desa.length) ok('el número no es desa enlloc: es dedueix del registre cada cop que es mira');
else bad(`el número ${desa.map(d => d[1]).join(' i ')} — un número desat és un número que ` +
  'no es pot comprovar i que un dia divergirà del registre');

/* ── 3 · El delta i la seva posició de sortida ───────────────────────────── */
const build = cos('async function buildRegisterPack(');
const verify = cos('async function verifyRegisterPack(');
const camps = ['altes', 'altesAbans', 'altesTotal', 'altesRoot'];
/* `altes` entra al literal per abreviatura (`altes,`) i els altres amb dos
   punts. Buscant només `nom:`, la guarda no el trobava i es queixava d'una cosa
   que hi era — que és la manera més ràpida de gastar-se la confiança que
   necessitarà el dia que en trobi una que no hi és. */
const falten = camps.filter(c => !new RegExp('\\b' + c + '\\s*[:,]').test(build));
if (!falten.length) ok(`cada versió porta ${camps.join(', ')}: la posició queda fixada el dia que es publica`);
else bad(`al paquet li falten ${falten.join(', ')} — sense la posició de sortida, el número ` +
  'd\'una alta canviaria segons qui munti la versió');

/* Els camps han d'entrar ABANS de `signRecord`, com el `parent`: afegir-los
   després invalida alhora la firma i el CID i el paquet deixa de verificar-se
   sense dir per què. */
const iAltes = build.indexOf('altesRoot'), iSig = build.indexOf('signRecord(');
if (iAltes >= 0 && iSig >= 0 && iAltes < iSig)
  ok('i hi entren abans de signar, com el `parent`');
else bad('les altes s\'afegeixen després de signar: la firma i el CID quedarien invalidats');

const comprova = [
  [/altes_root_mismatch/, 'l\'arrel de les altes'],
  [/alta_mal_formada/, 'el format de cada alta'],
  [/alta_repetida/, 'que no n\'hi hagi cap de repetida']
].filter(([re]) => !re.test(verify));
if (!comprova.length) ok('i la verificació comprova l\'arrel, el format i les repetides');
else bad(`la verificació no comprova ${comprova.map(c => c[1]).join(', ')}`);

/* ── 4 · Una alta es guanya, no es declara ───────────────────────────────── */
/* La condició és una porta negativa (`if(!signed||!chained||…)return;`), no una
   conjunció: es comprova que els quatre camps hi surtin, no com s'escriuen. */
const exigeix = ['signed', 'chained', 'signer', 'hash']
  .every(k => new RegExp('r\\.' + k + '\\b').test(primeres));
if (exigeix)
  ok('una alta necessita signatura i encadenat: el número no es guanya escrivint un nom');
else bad('primeresAltes no exigeix signatura i encadenat — qualsevol alta donaria número, ' +
  'que és la mètrica de vanitat que la V79 va treure de la portada');

/* ── 5 · Els 150.000 són un sol número ───────────────────────────────────── */
const target = (APP.match(/const COMANDO_TARGET=(\d+);/) || [])[1];
const xifra = target ? Number(target) : 0;
const bonic = xifra.toLocaleString('ca-ES');
const fonts = [['character_dossier.md', CHAR], ['narrative_kit.md', KIT], ['registre/README.md', README]];
/* Només les xifres de sis dígits o més: són les úniques que en aquests fitxers
   només poden voler dir el total. Amb el llindar més avall, la guarda tombava
   l'exemple «qui té el 12 no ha fet més que qui té el 40.000», que és
   precisament la frase que explica que això no és un rànquing. */
const NUM_GROS = /\b\d{1,3}[.\u00a0\u202f ]\d{3}\b|\b\d{6,}\b/g;
const altres = fonts.filter(([, t]) => {
  const nums = [...t.matchAll(NUM_GROS)]
    .map(m => m[0].replace(/[.\u00a0\u202f ]/g, '')).filter(n => Number(n) >= 100000);
  return nums.some(n => n !== String(xifra));
});
if (xifra && !altres.length) ok(`els ${bonic} es declaren un sol cop (COMANDO_TARGET) i tot ho diu igual`);
else if (!xifra) bad('no es troba COMANDO_TARGET');
else bad(`${pl(altres.length, 'fitxer diu', 'fitxers diuen')} una xifra que no és ${bonic}: ` +
  altres.map(f => f[0]).join(', '));

/* ── 6 · El preu porta data i font ───────────────────────────────────────── */
const arw = (APP.match(/const ARWEAVE=\{[\s\S]*?\n\};/) || [''])[0];
const preu = (arw.match(/preu:([\d.]+)/) || [])[1];
const data = (arw.match(/data:'([^']+)'/) || [])[1];
const font = (arw.match(/font:'([^']+)'/) || [])[1];
const gratis = (arw.match(/gratis:(\d+)/) || [])[1];
if (preu && data && font && gratis)
  ok(`el preu de referència porta data i font: ${preu} $/GiB · ${data}`);
else bad('el preu d\'Arweave no porta data o font — una xifra de diners sense data menteix ' +
  'en silenci al cap d\'un any, com la taula de preus de La Compra');
if (gratis && Number(gratis) === 102400)
  ok(`i el llindar de pujada gratuïta és el de debò: ${gratis} bytes (100 KiB)`);
else bad(`el llindar gratuït diu ${gratis || '?'} i el de Turbo/ArDrive és 102400 (100 KiB)`);

/* ── 7 · La IA no es pot inventar el número ──────────────────────────────── */
const intent = APP.slice(APP.indexOf('character_dossier:{'), APP.indexOf('valuation:{'));
const regles = [
  [/Cap número, data ni fet que no et donin/, 'character_dossier prohibeix inventar-ne cap'],
  [/NO te\\'n pots inventar cap/, 'i li diu explícitament que no en té quan no en té'],
  [/no és un rànquing|NO és un rànquing/i, 'i que el número no és un rànquing']
].filter(([re]) => !re.test(intent));
if (!regles.length) ok('el prompt del personatge prohibeix inventar el número i el situa: no és un rànquing');
else bad(`al prompt del personatge li falta: ${regles.map(r => r[1]).join('; ')}`);

const kit = APP.slice(APP.indexOf('narrative_kit:{'), APP.indexOf('character_dossier:{'));
if (/NOMÉS els números i les dates que et donin/.test(kit))
  ok('i el del kit narratiu, també: la sinopsi continua el reclutament amb números reals');
else bad('el prompt del kit narratiu no prohibeix inventar números');

[['character_dossier.md', CHAR], ['narrative_kit.md', KIT]].forEach(([nom, txt]) => {
  if (/no és un rànquing/i.test(txt)) ok(`${nom} ho deixa escrit: el número no és un rànquing`);
  else bad(`${nom} no diu que el número no és un rànquing — és l'error que una IA de guió comet sola`);
});

/* ── 8 · La tercera anotació és una anotació, no una nota al marge ────────
   El vistiplau es signa i durant molt de temps entrava al llibre com
   `{name,did,ts}`: la firma es quedava fora i el llibre deia «confirmat per
   Bru» sense que ningú ho pogués comprovar des del llibre. Això no és un detall
   d'implementació —és tota la diferència entre triple entrada i partida doble
   amb una nota al costat— i per tant es vigila aquí. */
const conf = cos('async function confirmPending(');
const rebut = cos('async function buildRebut(');
const verRebut = cos('async function verifyRebut(');

if (!conf) bad('no es troba confirmPending: la guarda de la tercera anotació s\'ha quedat cega');
else if (/confirmedBy:p\.got\.map\(g=>\(\{[^)]*\}\)\)/.test(conf))
  bad('el vistiplau entra al llibre retallat a mà: la firma es queda fora i el llibre ' +
    'diu «confirmat per algú» sense que ningú ho pugui comprovar');
else if (/confirmedBy:p\.got\.map\(g=>Object\.assign\(\{\},g\)\)/.test(conf))
  ok('el vistiplau entra al llibre sencer, amb la seva firma: es pot comprovar des del llibre');
else bad('no es pot llegir com entra el vistiplau al llibre — si es retalla, la firma es perd');

if (!rebut || !verRebut) {
  bad('no es troben buildRebut/verifyRebut: el rebut no existeix com a objecte i la tercera ' +
    'anotació torna a ser una nota dins del primer llibre');
} else {
  /* El rebut ha de portar l'apunt tal com es va signar. Amb una còpia amb els
     camps que semblin importants, la firma deixa de verificar-se i el rebut
     només val dins de l'app que el va fer — que és el contrari de portàtil. */
  if (/apunt:Object\.assign\(\{\},entry\)/.test(rebut))
    ok('el rebut porta l\'apunt tal com es va signar, no una còpia amb els camps triats');
  else bad('el rebut no porta l\'apunt sencer: la firma no es podrà verificar fora de l\'app');

  if (/const quadra=/.test(verRebut) && /el que el rebut diu i el que porta signat/.test(verRebut))
    ok('i el resum llegible es compara amb el que hi ha signat: no poden dir coses diferents');
  else bad('el resum llegible del rebut no es compara amb la firma — un rebut on el text digués ' +
    'trenta hores i la firma tres verificaria igual');

  if (/aquest vistiplau no és a l/.test(verRebut))
    ok('i un vistiplau que no sigui a l\'apunt signat no compta: no se\'n poden afegir al rebut');
  else bad('es pot afegir un vistiplau al rebut que no és a l\'apunt signat');

  if (/antic:true/.test(verRebut))
    ok('els vistiplaus d\'abans de la firma no es diuen trencats, però tampoc compten com a prova');
  else bad('no es distingeix un vistiplau antic d\'un d\'invàlid — marcar de corrupte el que ' +
    'ningú ha tocat és la manera més ràpida de fer que algú deixi de refiar-se del verificador');
}

/* I la promesa que la formació fa sobre això, que és la que més fàcil s'infla. */
const FORM = readFileSync(join(ARREL, 'SOS', 'formacio.html'), 'utf8');
if (!/triple entrada/i.test(FORM))
  bad('la formació no anomena mai la comptabilitat de triple entrada, que és el concepte ' +
    'que sosté tota l\'arquitectura del registre');
else if (/L'auditoria no desapareix/.test(FORM) && /No prova que el fet sigui cert|NO fa: dir que el fet sigui cert/i.test(FORM))
  ok('la formació explica la triple entrada dient què elimina (la conciliació) i què no ' +
    '(l\'auditoria, i la veritat del fet)');
else bad('la formació parla de triple entrada sense dir què NO elimina — la versió ' +
  'grandiloqüent («s\'acaben les auditories») és falsa i es descobreix a la primera');

/* ── 9 · L'índex comença buit i és llegible ──────────────────────────────── */
try {
  const j = JSON.parse(IDX);
  if (Array.isArray(j.versions)) ok(`l'índex del registre és llegible i té ${j.versions.length} versions`);
  else bad('l\'índex del registre no té llista de versions');
} catch (e) { bad('l\'índex del registre no és JSON vàlid: ' + e.message); }

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} al registre.`
  : '\n✅ El número es dedueix, es guanya, i publicar-lo no revela ningú.');
process.exit(fails ? 1 : 0);
