#!/usr/bin/env node
/* Guarda de la portada · el que cap test veurà mai.
   ─────────────────────────────────────────────────
   `index.html` de l'arrel és la pàgina per on entra tothom, i fins ara no la
   comprovava res: el CI només mira `SOS/`. El disseny de la pàgina té una
   trampa que ho fa perillós —**el diccionari mana sobre l'HTML**. `applyLang()`
   corre en carregar i reescriu tot element amb `data-i18n`, així que el text
   escrit a mà dins de l'etiqueta només es veu si JavaScript no ha arribat.

   D'aquí en surten tres avaries que no fan sorolls:

   · Una clau que existeix en català i no en castellà. La pàgina no peta: el
     visitant castellanoparlant es queda amb aquella frase en català i ningú
     ho sap. La guia d'estil ho diu clar: «tota cadena nova neix amb les dues
     claus; mig traduir és pitjor que no traduir».
   · Una clau escrita dues vegades al mateix diccionari. En JavaScript la
     segona guanya i la primera no s'aplica mai. N'hi havia dues, i una posava
     text castellà dins del diccionari català.
   · Una clau que ja no apunta a cap element. No tradueix res i fa creure que
     aquell text està cobert.

   Corre en menys d'un segon i sense dependències, com les altres.
   node SOS/tools/check-landing.js */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const APP = process.argv[2] || join(__dirname, '..', '..', 'index.html');
const src = readFileSync(APP, 'utf8');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const mostra = a => a.slice(0, 6).join(', ') + (a.length > 6 ? ` … (+${a.length - 6})` : '');
/* «1 claus repetides» i «5 problemas» són dues maneres de fer veure que ningú
   ha llegit la sortida de la guarda. Si demana que se la llegeixin, s'escriu bé. */
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

console.log('\nGuarda de la portada · ' + APP.replace(/^.*\//, ''));

// ── Els diccionaris ──────────────────────────────────────────────────────
const iCa = src.indexOf('\nca: {'), iEs = src.indexOf('\nes: {');
const iFi = iEs < 0 ? -1 : src.indexOf('\n};', iEs);
if (iCa < 0 || iEs < 0 || iFi < 0) {
  /* Si no es troben, no s'aprova en silenci: es diu que no s'ha pogut mirar.
     Una guarda que no troba el que mesura ha de cridar, no callar. */
  bad('no es troben els diccionaris `ca:` i `es:`: aquesta guarda no pot comprovar res');
  console.log('\n❌ 1 problema.');
  process.exit(1);
}
const KV = /'([A-Za-z0-9_.]+)':'(?:[^'\\]|\\.)*'/g;
const claus = txt => [...txt.matchAll(KV)].map(m => m[1]);
const ca = claus(src.slice(iCa, iEs));
const es = claus(src.slice(iEs, iFi));

// ── 1 · Cap clau repetida dins d'un diccionari ───────────────────────────
for (const [nom, llista] of [['català', ca], ['castellà', es]]) {
  const vistes = new Set(), dups = new Set();
  llista.forEach(k => { if (vistes.has(k)) dups.add(k); vistes.add(k); });
  if (!dups.size) ok(`diccionari ${nom}: ${llista.length} claus, cap repetida`);
  else bad(`diccionari ${nom}: ${pl(dups.size, 'clau repetida', 'claus repetides')} (${mostra([...dups])}) — la segona guanya i la primera no s'aplica mai`);
}

// ── 2 · Les dues llengües diuen les mateixes coses ───────────────────────
const sCa = new Set(ca), sEs = new Set(es);
const nomesCa = [...sCa].filter(k => !sEs.has(k));
const nomesEs = [...sEs].filter(k => !sCa.has(k));
if (!nomesCa.length && !nomesEs.length) ok(`les dues llengües cobreixen les mateixes ${sCa.size} claus`);
else {
  if (nomesCa.length) bad(`${pl(nomesCa.length, 'clau', 'claus')} sense castellà (${mostra(nomesCa)}) — qui llegeixi en castellà es trobarà aquestes frases en català`);
  if (nomesEs.length) bad(`${pl(nomesEs.length, 'clau', 'claus')} sense català (${mostra(nomesEs)})`);
}

// ── 3 · Cap clau que no apunti enlloc, cap element sense clau ────────────
/* Es miren només els atributs del cos, no els que apareixen dins del propi
   diccionari (n'hi ha que porten HTML amb `data-i18n` a dins). */
const cos = src.slice(0, iCa);
const atributs = [...new Set([...cos.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)].map(m => m[1]))];
const orfes = atributs.filter(k => !sCa.has(k));
const mortes = [...sCa].filter(k => !atributs.includes(k));
if (!orfes.length) ok(`${atributs.length} elements traduïbles, tots amb entrada al diccionari`);
else bad(`${pl(orfes.length, 'element traduïble', 'elements traduïbles')} sense clau al diccionari (${mostra(orfes)}) — es quedarà amb el text escrit a mà`);
if (!mortes.length) ok('cap clau del diccionari apunta a un element que ja no hi és');
else bad(`${pl(mortes.length, 'clau que no tradueix', 'claus que no tradueixen')} res (${mostra(mortes)}) — fan creure que aquell text està cobert`);

// ── 4 · Informatiu ───────────────────────────────────────────────────────
const seccions = (cos.match(/<section/g) || []).length;
const detalls = (cos.match(/<details class="faq-item"/g) || []).length;
console.log(`  · ${seccions} seccions · ${detalls} objeccions · ${Math.round(Buffer.byteLength(src) / 1024)} KB en cru`);

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} a la portada.` : '\n✅ La portada quadra.');
process.exit(fails ? 1 : 0);
