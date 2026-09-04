#!/usr/bin/env node
/* Guarda dels formularis · el que els fa útils i el que els faria perillosos
 * ─────────────────────────────────────────────────────────────────────────
 * Hi ha dos formularis, el diagnòstic i el pressupost, i totes dues coses són
 * certes alhora: **comparteixen dos blocs** i **no envien res sols**. Aquesta
 * guarda vigila exactament aquestes dues coses, perquè totes dues es trenquen
 * en silenci.
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
const dx = readFileSync(join(SOS, 'diagnostic.html'), 'utf8');
const pr = readFileSync(join(SOS, 'pressupost.html'), 'utf8');
const { PAQUETS, SOS_PAQUETS, NIVELLS } = require('./build-oferta.js');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

console.log('\nGuarda dels formularis · diagnòstic ↔ pressupost');

/* ── 1 · Els blocs compartits diuen el mateix ─────────────────────────────
   Es comparen els blocs generats, no el fitxer sencer: la resta de cada
   formulari ha de ser diferent, que per això són dos. */
const entre = (src, obre, tanca) => {
  const i = src.indexOf(obre), j = src.indexOf(tanca);
  return i < 0 || j < i ? null : src.slice(i + obre.length, j).trim();
};
const BLOCS = [
  ['<!--FORM-QUI-->', '<!--/FORM-QUI-->', 'qui ets'],
  ['<!--FORM-ORG-->', '<!--/FORM-ORG-->', 'd\'on véns'],
  ['/*FORM-DADES*/', '/*/FORM-DADES*/', 'les dades compartides']
];
for (const [o, t, nom] of BLOCS) {
  const a = entre(dx, o, t), b = entre(pr, o, t);
  if (a === null || b === null) bad(`el bloc «${nom}» no hi és als dos formularis — sense marques no es pot compartir res`);
  else if (a !== b) bad(`el bloc «${nom}» diu coses diferents a cada formulari — qui ve d'un no es trobarà a l'altre`);
  else if (!a.length) bad(`el bloc «${nom}» és buit als dos: el generador no hi ha escrit`);
  else ok(`el bloc «${nom}» és idèntic als dos formularis`);
}

/* ── 2 · El pont existeix i és local ──────────────────────────────────────
   El que fa que no calgui tornar a escriure el nom. Si desapareix, el segon
   formulari torna a demanar-ho tot i ningú ho nota fins que algú abandona. */
for (const [nom, src] of [['diagnòstic', dx], ['pressupost', pr]]) {
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
for (const [nom, src] of [['diagnòstic', dx], ['pressupost', pr]]) {
  const trobades = FUITES.filter(([re]) => re.test(src)).map(([, n]) => n);
  if (!trobades.length) ok(`el ${nom} no envia res sol: cap sortida de dades`);
  else bad(`el ${nom} té ${pl(trobades.length, 'sortida de dades', 'sortides de dades')} (${trobades.join(', ')}) — la pàgina promet que no envia res fins que tu ho premis`);
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
