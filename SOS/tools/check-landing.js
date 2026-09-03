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
const { readFileSync, existsSync } = require('node:fs');
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
/* El guionet hi és perquè les claus del catàleg porten l'id del paquet
   (`pk.diagnostic-teixit.n`), i sense ell la guarda no les veia i acusava de
   no estar traduït el que sí que ho estava. */
const KV = /'([A-Za-z0-9_.-]+)':'(?:[^'\\]|\\.)*'/g;
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

/* ── 4 · El catàleg no pot vendre serveis a mitges ─────────────────────────
   Un servei explica què és; un paquet diu qui el compra, quant dura, què
   s'endú, quant costa i quantes vegades s'ha fet. Sense les cinc coses, un
   tècnic municipal no ho pot portar a una junta —que era exactament el
   problema dels tretze quadres que hi havia abans. Veda 137. */
const paquets = [...cos.matchAll(/<article class="paquet" id="pk-([^"]+)">([\s\S]*?)<\/article>/g)]
  .map(m => ({ id: m[1], html: m[2] }));
if (!paquets.length) bad('no hi ha cap paquet a la portada: aquesta guarda no pot comprovar res');
else {
  const camp = (h, re) => re.test(h);
  const migFets = paquets.filter(p =>
    !camp(p.html, /class="pk-endus"/) ||
    !camp(p.html, /class="pk-punt /) ||
    !camp(p.html, /class="pk-preu"><strong>[\d.]+ €/) ||
    (p.html.match(/<dt /g) || []).length !== 3);
  if (!migFets.length) ok(`${paquets.length} paquets, tots amb entregable, per a qui, durada, diners, preu i punt`);
  else bad(`${pl(migFets.length, 'paquet a mitges', 'paquets a mitges')} (${mostra(migFets.map(p => p.id))}) — un servei sense preu ni durada no es pot portar a una junta`);

  /* El sostre dels 5.000 €: per sobre, la proposta deixa de ser una decisió
     d'una regidoria i passa a ser un procediment. Només s'aplica als paquets
     dirigits a administració o entitats; els d'empresa no en tenen. */
  const SOSTRE = 5000;
  const cars = paquets.filter(p => {
    const qui = (p.html.match(/class="pk-dades">[\s\S]*?<dd[^>]*>([^<]*)</) || [])[1] || '';
    if (!/ajuntament|consell|escola|afa|entitat|administracion|ateneu/i.test(qui)) return false;
    const preu = Number(((p.html.match(/class="pk-preu"><strong>([\d.]+)/) || [])[1] || '0').replace(/\./g, ''));
    return preu > SOSTRE;
  });
  if (!cars.length) ok(`cap paquet per a administració o entitats passa dels ${SOSTRE.toLocaleString('ca-ES')} €`);
  else bad(`${pl(cars.length, 'paquet passa', 'paquets passen')} del sostre de ${SOSTRE} € (${mostra(cars.map(p => p.id))}) — deixen de ser contractació menor`);

  /* Una porta cap a un fitxer que no hi és. Mateixa regla que a Molekulandia. */
  const dests = [...cos.matchAll(/<article class="paquet"[\s\S]*?<h4><a href="([^"]+)"/g)].map(m => m[1]);
  const falsos = dests.filter(d => !existsSync(join(__dirname, '..', '..', d.replace(/^\//, '').replace(/\/$/, '/index.html'))));
  if (!falsos.length) ok(`${dests.length} enllaços de paquet, tots a una pàgina que existeix`);
  else bad(`${pl(falsos.length, 'enllaç', 'enllaços')} a un fitxer que no hi és (${mostra(falsos)})`);

  /* Tot punt d'adaptació igual seria no dir res: la columna existeix
     precisament per distingir el que té casos del que encara no en té. */
  const punts = new Set(paquets.map(p => (p.html.match(/class="pk-punt (pk-[a-z]+)"/) || [])[1]));
  if (punts.size >= 2) ok(`i es distingeixen ${punts.size} punts d'adaptació, no tots el mateix`);
  else bad('tots els paquets diuen el mateix punt d\'adaptació: la columna no informa de res');
}

/* ── 5 · Cap servei del README s'ha quedat pel camí ────────────────────────
   Els sis serveis del README són productes existents amb anys d'entrega. La
   portada els ignorava, i eren dos catàlegs venent dues empreses diferents. */
const README = readFileSync(join(__dirname, '..', '..', 'README.md'), 'utf8');
const enMd = [...README.matchAll(/^\| \*\*([^*]+)\*\* \|/gm)].map(m => m[1].trim());
if (!enMd.length) bad('el README no porta cap paquet: el catàleg no s\'hi ha generat');
else {
  const enHtml = [...src.matchAll(/'pk\.[a-z0-9-]+\.n':'((?:[^'\\]|\\.)*)'/g)]
    .map(m => m[1].replace(/\\'/g, "'"));
  const orfesMd = enMd.filter(n => !enHtml.includes(n));
  if (!orfesMd.length) ok(`els ${enMd.length} paquets del README són tots a la portada`);
  else bad(`${pl(orfesMd.length, 'paquet del README no surt', 'paquets del README no surten')} a la portada (${mostra(orfesMd)}) — dos catàlegs són dues empreses`);
}

/* ── 6 · Les paraules que la guia de marca prohibeix ───────────────────────
   «No diuen res i sonen a fullet», diu SOS/knowledge/marketing/guia-estil-marca.md.
   Es miren només al text visible: als comentaris del codi s'hi val a anomenar
   el que s'evita, i de fet aquesta guarda ho fa. */
const visible = cos.replace(/<!--[\s\S]*?-->/g, '').replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<script[\s\S]*?<\/script>/g, '');
const PROHIBIDES = [
  [/disruptiu|disruptiva|disruptivo/i, 'disruptiu'],
  [/solucions innovadores|soluciones innovadoras/i, 'solucions innovadores'],
  [/ecosistema disruptiu/i, 'ecosistema disruptiu'],
  [/empoderament\b(?!\s+(de|per|dels|de les))/i, 'empoderament sense objecte']
];
const dites = PROHIBIDES.filter(([re]) => re.test(visible)).map(([, n]) => n);
if (!dites.length) ok('cap paraula de fullet al text visible');
else bad(`${pl(dites.length, 'paraula prohibida', 'paraules prohibides')} per la guia de marca: ${dites.join(', ')}`);

// ── 7 · Informatiu ───────────────────────────────────────────────────────
const seccions = (cos.match(/<section/g) || []).length;
const detalls = (cos.match(/<details class="faq-item"/g) || []).length;
console.log(`  · ${seccions} seccions · ${paquets.length} paquets · ${detalls} objeccions · ${Math.round(Buffer.byteLength(src) / 1024)} KB en cru`);

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} a la portada.` : '\n✅ La portada quadra.');
process.exit(fails ? 1 : 0);
