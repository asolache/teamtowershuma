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
const paquets = [...cos.matchAll(/<article class="paquet" id="pk-([^"]+)" data-sector="([a-z]+)">([\s\S]*?)<\/article>/g)]
  .map(m => ({ id: m[1], sector: m[2], html: m[3] }));
const visible0 = cos.replace(/<!--[\s\S]*?-->/g, '');
if (!paquets.length) bad('no hi ha cap paquet a la portada: aquesta guarda no pot comprovar res');
else {
  const camp = (h, re) => re.test(h);
  /* Set coses, i les dues últimes són les que fan que un preu es pugui
     defensar: **què t'aporta** (`pk-valor`) i **què el mou dins de la
     forquilla** (`pk-perque`). Una forquilla sense el que la mou és un rang,
     no un preu, i qui la llegeix no pot saber on cau. Veda 139. */
  const migFets = paquets.filter(p =>
    !camp(p.html, /class="pk-endus"/) ||
    !camp(p.html, /class="pk-punt /) ||
    !camp(p.html, /class="pk-valor"/) ||
    !camp(p.html, /class="pk-perque"/) ||
    !camp(p.html, /class="pk-font"/) ||
    !camp(p.html, /(<strong>[^<]*[\d.]+ €|class="pk-mida")/) ||
    (p.html.match(/<dt /g) || []).length !== 3);
  if (!migFets.length) ok(`${paquets.length} paquets, tots amb entregable, aportació de valor, per a qui, durada, diners, preu amb la seva font i el que el mou`);
  else bad(`${pl(migFets.length, 'paquet a mitges', 'paquets a mitges')} (${mostra(migFets.map(p => p.id))}) — un preu sense el que l'aporta i el que el mou no es pot defensar`);

  /* Un paquet sense xifra publicada ha de dir **com es calcula** i portar-hi.
     Sense això, «a mida» és el «consulta'ns» de sempre: obliga a trucar per
     saber si t'ho pots ni plantejar, que és exactament el que aquest catàleg
     ve a evitar. Veda 140. */
  const mides = paquets.filter(p => camp(p.html, /class="pk-mida"/));
  const mudes = mides.filter(p => !/class="pk-mida"[^>]*>\s*<a href="#cost"/.test(p.html));
  if (!mides.length) ok('cap paquet amaga el preu');
  else if (!mudes.length) ok(`${pl(mides.length, 'paquet sense xifra publicada', 'paquets sense xifra publicada')}, i porten al mapa de cost`);
  else bad(`${pl(mudes.length, 'paquet diu «a mida» i no', 'paquets diuen «a mida» i no')} porten enlloc (${mostra(mudes.map(p => p.id))}) — «a mida» sense el mètode és «consulta\'ns»`);

  /* I la secció on porten ha d'existir de debò, amb els seus passos i la seva
     escala. Un enllaç a `#cost` que no troba res no dona cap error: baixa la
     pàgina fins al final i qui hi clica es pensa que s'ha equivocat. */
  const teCost = /id="cost"/.test(cos) && (cos.match(/class="cm-pas"/g) || []).length >= 3
    && (cos.match(/class="cm-niv"/g) || []).length >= 3;
  if (teCost) ok('el mapa de cost hi és, amb els seus passos i tres nivells d\'escala');
  else bad('el mapa de cost no hi és o li falten passos o nivells — els enllaços «a mida» no van enlloc');

  /* Cada paquet declara a quin sector parla, i n'hi ha dels dos. Si tots
     diguessin el mateix, el filtre seria un botó que no filtra i la pàgina
     tornaria a parlar a una sola casa —que és d'on venim. */
  const sectors = new Set(paquets.map(p => p.sector));
  const filtre = (cos.match(/class="pk-f[ "]/g) || []).length;
  if (sectors.has('privat') && sectors.has('public') && filtre >= 3)
    ok(`${sectors.size} sectors declarats i ${filtre} botons de filtre`);
  else bad(`el catàleg no parla als dos sectors (${[...sectors].join(', ') || 'cap'}) o no té filtre (${filtre} botons) — la pàgina torna a vendre a una sola casa`);

  /* El sostre dels 5.000 €: per sobre, la proposta deixa de ser una decisió
     d'una regidoria i passa a ser un procediment. Només s'aplica als paquets
     dirigits a administració o entitats; els d'empresa no en tenen. */
  const SOSTRE = 5000;
  /* El que ha de quedar sota el sostre és **l'entrada** de la forquilla: si el
     mínim ja hi passa, aquell paquet no té cap manera d'entrar a una
     contractació menor. Que el màxim la superi és legítim —un festival de tres
     dies no és un contracte menor— sempre que la fitxa digui què l'hi porta,
     cosa que la regla de dalt ja exigeix (`pk-perque`). */
  const cars = paquets.filter(p => {
    const qui = (p.html.match(/class="pk-dades">[\s\S]*?<dd[^>]*>([^<]*)</) || [])[1] || '';
    if (!/ajuntament|consell|escola|afa|entitat|administracion|ateneu/i.test(qui)) return false;
    /* Es miren totes les xifres del bloc del preu, no només les que porten el
       símbol al costat: a «De 3.500 a 6.000 €» l'euro només és al final, i
       mirar-hi el mínim per l'€ donava el màxim. */
    const bloc = (p.html.match(/class="pk-preu">([\s\S]*?)<p class="pk-perque"/) || [])[1] || '';
    const nums = [...bloc.matchAll(/\b(\d{1,3}(?:\.\d{3})+|\d{3,})\b/g)]
      .map(m => Number(m[1].replace(/\./g, ''))).filter(n => n >= 100);
    return nums.length ? Math.min(...nums) > SOSTRE : false;
  });
  if (!cars.length) ok(`tot paquet per a administració o entitats hi entra per sota dels ${SOSTRE.toLocaleString('ca-ES')} €`);
  else bad(`${pl(cars.length, 'paquet no té entrada', 'paquets no tenen entrada')} sota el sostre de ${SOSTRE} € (${mostra(cars.map(p => p.id))}) — no hi ha manera de contractar-los com a contracte menor`);

  /* Una porta cap a un fitxer que no hi és. Mateixa regla que a Molekulandia. */
  const dests = [...cos.matchAll(/<article class="paquet"[\s\S]*?<h4><a href="([^"]+)"/g)].map(m => m[1]);
  const falsos = dests.filter(d => !existsSync(join(__dirname, '..', '..', d.replace(/^\//, '').replace(/\/$/, '/index.html'))));
  if (!falsos.length) ok(`${dests.length} enllaços de paquet, tots a una pàgina que existeix`);
  else bad(`${pl(falsos.length, 'enllaç', 'enllaços')} a un fitxer que no hi és (${mostra(falsos)})`);

  /* Un catàleg de preus que no diu si porten IVA obliga a trucar per saber què
     costa una cosa, que és exactament el que aquest catàleg ve a evitar. */
  if (/sense IVA|sin IVA|IVA incl/i.test(visible0)) ok('el catàleg diu si els preus porten IVA');
  else bad('el catàleg no diu si els preus porten IVA: qui compra ha de trucar per saber què costa');

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
/* Només el bloc del catàleg. El README té més taules generades —l'escala de
   nivells del mapa de cost n'és una— i llegir-les totes feia que la guarda
   busqués un paquet anomenat «N1 · Practicante» a la portada. */
const iMd = README.indexOf('<!--TT-OFERTA-MD-->'), fMd = README.indexOf('<!--/TT-OFERTA-MD-->');
const blocMd = iMd >= 0 && fMd > iMd ? README.slice(iMd, fMd) : '';
if (!blocMd) bad('no es troba el bloc del catàleg al README: aquesta comprovació no pot mirar res');
const enMd = [...blocMd.matchAll(/^\| \*\*([^*]+)\*\* \|/gm)].map(m => m[1].trim());
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

/* ── 7 · La pàgina obre dues portes: totes dues s'han de poder travessar ───
   El hero convida empreses i administració, i el catàleg filtra per sector.
   El repte, en canvi, es va escriure quan aquesta pàgina només venia al món
   comunitari, i seguia dient «voluntariat» i «hort comunitari»: qui venia del
   costat privat hi arribava i concloïa que allò no anava amb ell —just després
   que el hero li hagués dit que sí.

   Això no peta mai i no ho veu ningú de dins, perquè qui l'ha escrita ja sap
   que el mètode val per als dos. Es comprova sobre **el text visible**, que és
   el que llegeix una persona, i no sobre les intencions del codi. */
const bloc = (des, fins) => {
  const i = visible.indexOf(des); if (i < 0) return '';
  const j = visible.indexOf(fins, i + des.length);
  return visible.slice(i, j < 0 ? visible.length : j);
};
const sensTags = t => t.replace(/<[^>]+>/g, ' ');

const PUBLIC = /ajuntament|consell comarcal|entitat|veïn|comunitari|voluntari|municipal|público|vecin|comunitario|voluntari/i;
const PRIVAT = /empresa|cooperativa|organigrama|direcció de persones|comitè de direcció|departament|dirección de personas|comité de dirección|departamento/i;

const repte = sensTags(bloc('<section class="enfoc" id="enfoc"', '</section>'));
if (!repte) bad('no es troba la secció del repte (`#enfoc`)');
else {
  const teP = PUBLIC.test(repte), teE = PRIVAT.test(repte);
  if (teP && teE) ok('el repte s\'explica per als dos sectors, no per a un');
  else bad(`el repte només parla ${teP ? 'del sector públic i comunitari' : 'de l\'empresa'}: `
    + 'qui ve de l\'altra porta del hero hi arriba i conclou que això no va amb ell');
  /* La frase que uneix les dues bandes. Sense ella, dues columnes de costat
     són dos negocis; amb ella, són un mètode amb dos productes. */
  const pont = /mateix objectiu|mismo objetivo/i.test(repte)
    && /(psicosocial)/i.test(repte) && /(econòmica|económica)/i.test(repte)
    && /(fluxos de valor|flujos de valor)/i.test(repte);
  if (pont) ok('i diu l\'objectiu que comparteixen, i com es mesura');
  else bad('falta la frase que uneix les dues bandes: mateix objectiu —millor psicosocialment i '
    + 'econòmicament— i una sola manera de mesurar-ho, els fluxos de valor');
}

/* Les portes han de filtrar de debò. El primer parell vivia dins de
   `.hero-portes` i el codi les enganxava per aquell contenidor: una porta nova
   en un altre lloc de la pàgina hauria baixat al catàleg **sense filtrar**, i
   no ho hauria vist ningú perquè l'àncora sí que funciona. */
const portes = [...src.matchAll(/<a[^>]*\sdata-sec="([^"]+)"/g)].map(m => m[1]);
const filtres = new Set([...src.matchAll(/class="pk-f[^"]*"\s+data-sec="([^"]+)"/g)].map(m => m[1]));
if (portes.length < 4) bad(`només hi ha ${portes.length} portes de sector a la pàgina: el hero i el repte n'han de portar dues cadascun`);
else {
  const orfes = [...new Set(portes)].filter(s => !filtres.has(s));
  if (!orfes.length) ok(`les ${portes.length} portes de sector porten a un filtre que existeix`);
  else bad(`hi ha portes que demanen un sector que el filtre no té: ${orfes.join(', ')}`);
}
if (/document\.querySelectorAll\('a\[data-sec\]'\)/.test(src))
  ok('i el filtre les escolta totes, no les d\'un contenidor concret');
else bad('el filtre s\'enganxa a les portes d\'un contenidor concret: una porta nova en un altre '
  + 'lloc baixaria al catàleg sense filtrar i ningú se n\'adonaria');

/* Les objeccions. Sis de sis eren municipals —pressupost municipal, tècnic de
   participació, dades del veïnat, contractació menor— i una direcció de
   persones no en trobava cap que fos la seva. */
const faqs = [...visible.matchAll(/<details class="faq-item">([\s\S]*?)<\/details>/g)].map(m => sensTags(m[1]));
if (!faqs.length) bad('no es troba cap objecció');
else {
  const pub = faqs.filter(f => PUBLIC.test(f)).length;
  const pri = faqs.filter(f => PRIVAT.test(f)).length;
  if (pub && pri) ok(`les ${faqs.length} objeccions cobreixen els dos sectors (${pub} i ${pri})`);
  else bad(`cap objecció parla ${pub ? 'a una empresa' : 'al sector públic'}: `
    + 'qui hi arriba des d\'aquella porta no en troba ni una que sigui la seva');
}

// ── 8 · Informatiu ───────────────────────────────────────────────────────
const seccions = (cos.match(/<section/g) || []).length;
const detalls = (cos.match(/<details class="faq-item"/g) || []).length;
console.log(`  · ${seccions} seccions · ${paquets.length} paquets · ${detalls} objeccions · ${Math.round(Buffer.byteLength(src) / 1024)} KB en cru`);

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} a la portada.` : '\n✅ La portada quadra.');
process.exit(fails ? 1 : 0);
