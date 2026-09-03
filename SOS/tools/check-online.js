#!/usr/bin/env node
/* Guarda del directori · SOS/online.html
 * ─────────────────────────────────────────────────────────────────────────────
 * Aquesta pàgina és l'única del projecte que **publica un nom i un municipi a
 * un servidor**. Tot el que la fa acceptable és que la persona ho hagi escrit
 * ella i ho hagi firmat, i que qui llegeix ho pugui comprovar. No hi havia cap
 * guarda: es va escriure sencera confiant que ningú tocaria les tres o quatre
 * línies de les quals depèn tot.
 *
 * Es va veure què costa aquesta confiança. `_didFromJwk` derivava el `did` amb
 * `JSON.stringify(jwk)`, que escriu les claus en l'ordre que li arriben. El
 * navegador les exporta alfabèticament i Postgres les torna ordenades per
 * longitud: la mateixa clau donava dos identificadors, i el sedàs descartava
 * **totes** les fitxes acusant un intrús que no existia. Ningú se n'hauria
 * adonat llegint el codi; la línia era perfectament raonable.
 *
 * El que vigila aquesta guarda, doncs, és el que no es veu llegint:
 *
 *   1 · Que la derivació del did passi per `_canon` i no per `JSON.stringify`,
 *       a les dues pàgines, i que les dues línies siguin la mateixa.
 *   2 · Que les categories del directori no divergeixin de les del banc de
 *       temps. Si divergissin, una oferta d'aquí deixaria de creuar-se amb una
 *       de l'app sense que res petés.
 *   3 · Que no hi hagi mai un camp de correu ni de telèfon. És la regla 3 de la
 *       capçalera del fitxer, escrita i sense vigilar.
 *   4 · Que només surti el que hi ha a `CAMPS`.
 *   5 · Que la clau privada no vagi a parar a cap petició de xarxa.
 *   6 · Que l'avís de fitxes descartades no acusi ningú incondicionalment.
 *
 * Vedes 135 i 136.
 *
 * Ús:  node SOS/tools/check-online.js
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const WEB = readFileSync(join(ARREL, 'SOS', 'online.html'), 'utf8');
const APP = readFileSync(join(ARREL, 'SOS', 'index.html'), 'utf8');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;
/* Els comentaris parlen del que la guarda vigila («aquí hi havia
   JSON.stringify…»), i una guarda que llegís els comentaris s'acusaria a ella
   mateixa. Es mira el codi. */
const senseComentaris = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const CODI = senseComentaris(WEB);
const CODI_APP = senseComentaris(APP);
/* Les frases de pantalla es parteixen en trossos concatenats per no fer línies
   quilomètriques. Buscar-hi una frase sencera sense desfer les unions és buscar
   una cosa que el fitxer no conté encara que la pantalla la digui. */
const unides = s => s.replace(/'\s*\+\s*\n?\s*'/g, '');
const FRASES = unides(CODI);

console.log('\nGuarda del directori · el did, les categories i el que no surt mai de casa');

/* ── 1 · La derivació del did ────────────────────────────────────────────── */
const linia = src => {
  const m = src.match(/async function _didFromJwk\([^)]*\)\{[^\n]*\}/);
  return m ? m[0] : '';
};
const lw = linia(CODI), la = linia(CODI_APP);
if (!lw || !la) bad('no es troba `_didFromJwk` a alguna de les dues pàgines');
else {
  if (/JSON\.stringify/.test(lw) || /JSON\.stringify/.test(la))
    bad('`_didFromJwk` deriva el did amb `JSON.stringify`: l\'ordre de les claus del JWK entra al hash i el mateix parell de claus dona dos dids (veda 135)');
  else ok('el did no surt de `JSON.stringify`');
  if (/_canon\(jwk\)/.test(lw) && /_canon\(jwk\)/.test(la))
    ok('surt de `_canon(jwk)`, que ordena les claus i no depèn de qui hagi escrit el JSON');
  else bad('`_didFromJwk` no passa el JWK per `_canon`');
  if (lw === la) ok('i la línia és idèntica a les dues pàgines: un sol did per persona');
  else bad('`_didFromJwk` difereix entre online.html i index.html: la mateixa clau donaria dues persones');
}
/* El hash del certificat és el mateix defecte, i es va arreglar alhora. */
if (/sha256\(_te\.encode\(JSON\.stringify\(certBody/.test(CODI_APP))
  bad('`confirmCertificate` encara fa el hash amb `JSON.stringify`: dues confirmacions del mateix certificat parlarien de «sobres» diferents');
else ok('el «sobre» del certificat també va per la forma canònica');

/* ── 2 · Les categories no poden divergir ───────────────────────────────── */
const taula = (src, nom) => {
  const i = src.indexOf('const ' + nom + '=[');
  if (i < 0) return null;
  const j = src.indexOf('\n];', i);
  if (j < 0) return null;
  const cru = src.slice(i, j);
  return (cru.match(/\['[^\]]*?\]/g) || []).map(x =>
    x.replace(/\\'/g, '').replace(/[\[\]']/g, '').split(',').map(s => s.trim().replace(//g, "'")).join('|'));
};
const cw = taula(CODI, 'CATS'), ca = taula(CODI_APP, 'TIMEBANK_CATS');
if (!cw || !ca) bad('no s\'han pogut llegir `CATS` i `TIMEBANK_CATS`: aquesta guarda no pot comprovar res');
else if (cw.join('\n') === ca.join('\n'))
  ok(`les ${cw.length} categories del directori són, una per una, les del banc de temps`);
else {
  const nomes = (a, b) => a.filter(x => !b.includes(x));
  bad('`CATS` i `TIMEBANK_CATS` han divergit — una oferta del directori deixaria de creuar-se amb una de l\'app i no petaria res. '
    + 'Només al directori: ' + (nomes(cw, ca).join(', ') || '—')
    + ' · Només a l\'app: ' + (nomes(ca, cw).join(', ') || '—'));
}

/* ── 3 · Ni correu ni telèfon, mai ──────────────────────────────────────── */
const contacte = [
  [/type\s*=\s*["']email["']/i, 'un camp de correu'],
  [/type\s*=\s*["']tel["']/i, 'un camp de telèfon'],
  [/autocomplete\s*=\s*["'](email|tel)["']/i, 'un camp que el navegador omplirà amb el correu o el telèfon']
].filter(([re]) => re.test(WEB));
if (!contacte.length) ok('cap camp de correu ni de telèfon: el contacte va per la sala xifrada');
else contacte.forEach(([, q]) => bad('hi ha ' + q + ': la pàgina promet que no en demana mai'));

/* ── 4 · Només surt el que hi ha a CAMPS ────────────────────────────────── */
if (/CAMPS\.forEach\(k=>\{if\(f\[k\]!==undefined\)fora\[k\]=f\[k\];\}\)/.test(CODI.replace(/\s+/g, '')
  .replace(/CAMPS\.forEach/, 'CAMPS.forEach')) || /CAMPS\.forEach/.test(CODI))
  ok('`bastirFitxa` filtra per `CAMPS` abans de retornar la fitxa');
else bad('`bastirFitxa` ja no filtra per `CAMPS`: un camp afegit al formulari sortiria de casa sense que ningú ho decidís');
const put = (CODI.match(/async function supaPut[\s\S]*?\n\}/) || [''])[0];
if (!put) bad('no es troba `supaPut`');
else if (/body:JSON\.stringify\(\{did:fitxa\.did,fitxa\}\)/.test(put.replace(/\s+/g, '')))
  ok('i `supaPut` no envia res més que el `did` i la fitxa');
else bad('`supaPut` envia alguna cosa més que `{did,fitxa}`');

/* ── 5 · La clau privada no surt del navegador ─────────────────────────── */
const fetches = CODI.match(/fetch\([\s\S]{0,400}?\)/g) || [];
if (fetches.some(f => /privJwk|privKey/.test(f)))
  bad('hi ha una crida a `fetch` que porta la clau privada: la clau no surt mai del navegador');
else ok('cap `fetch` porta la clau privada');
const escriuIdent = (CODI.match(/dbPut\(\{id:'__identity'/g) || []).length;
if (escriuIdent <= 2) ok('la identitat només s\'escriu al registre `__identity` del navegador');
else bad('la identitat s\'escriu a més llocs dels que hi hauria d\'haver');

/* ── 6 · L'avís no pot acusar sense saber de qui és la culpa ───────────── */
const acusa = /algú ha escrit al directori sense la clau de qui deia ser/;
if (!acusa.test(FRASES)) ok('l\'avís de descartades no acusa ningú');
else {
  /* Si la frase hi és, ha d'anar dins de la branca que sap que la fitxa NO és
     teva. Es mira que el bloc que la conté distingeixi les fitxes pròpies. */
  const i = FRASES.search(acusa);
  const tros = FRASES.slice(Math.max(0, i - 1400), i);
  if (/meves\.length|d\.meu|\.meu\b/.test(tros))
    ok('l\'avís només acusa quan sap que la fitxa descartada no és teva');
  else bad('l\'avís acusa un tercer sense mirar si la fitxa descartada és la teva (veda 136)');
}
if (/S\.descartades\.filter\(d=>d\.meu\)/.test(CODI))
  ok('i les fitxes descartades pròpies es diuen a part');
else bad('el cartell no distingeix les fitxes descartades que són teves');

/* ── 7 · El pont amb l'app existeix de debò ─────────────────────────────── */
const perfil = (CODI.match(/async function perfilDelSOS[\s\S]*?\n\}/) || [''])[0].replace(/\s+/g, '');
if (perfil && /\.did===jo\.did/.test(perfil))
  ok('«porta el meu perfil» identifica la persona pel `did`, com fa `joinNode` a l\'app');
else if (!perfil) bad('no es troba `perfilDelSOS`');
else bad('`perfilDelSOS` no busca la persona pel `did`: pel nom, dos veïns que es diuen igual serien un');
if (/id:'btnPerfil'|id="btnPerfil"/.test(WEB)) ok('i té botó al formulari d\'alta');
else bad('`perfilDelSOS` no arriba a cap botó: la feina no la fa servir ningú');
const porta = (CODI.match(/async function portaPerfil[\s\S]*?\n\}/) || [''])[0];
if (porta && !/supaPut|publica\(/.test(porta))
  ok('i portar el perfil omple el formulari sense publicar res (veda 47)');
else bad('portar el perfil publica: el que surt de casa s\'ha d\'ensenyar sencer abans de sortir');
if (/iterations:210000/.test(CODI) && /iterations:210000/.test(CODI_APP))
  ok('entrar amb la identitat fa servir els mateixos paràmetres que l\'app (PBKDF2 210 000)');
else bad('els paràmetres de la còpia d\'identitat difereixen: un fitxer fet a l\'app no s\'obriria aquí');

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} al directori.`
  : '\n✅ Un sol did, unes soles categories, i res que surti de casa sense dir-ho.');
process.exit(fails ? 1 : 0);
