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

/* ── 3b · Cap color que no existeixi ──────────────────────────────────────
   `var(--accent-red)` en una regla d'aquesta pàgina no peta ni avisa: el
   navegador descarta la declaració i la vora que havia de marcar el node
   aturat senzillament no es pinta. Es va trobar mirant una captura, que és la
   manera més caral de trobar-ho.

   Es comproven **les que es fan servir contra les que es declaren**. Les
   variables amb valor per defecte —`var(--x, red)`— no entren: aquelles ja
   diuen què fer si no hi són. */
{
  const declarades = new Set([...src.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));
  const usades = [...src.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)].map(m => m[1]);
  const orfes = [...new Set(usades.filter(v => !declarades.has(v)))];
  if (!orfes.length) ok(`${declarades.size} variables de color i mida, totes les que es fan servir existeixen`);
  else bad(`${pl(orfes.length, 'variable que no existeix', 'variables que no existeixen')} (${mostra(orfes)}) `
    + '— el navegador descarta la regla sense avisar i allò no es pinta');
}

/* ── 4 · El catàleg no pot vendre serveis a mitges ─────────────────────────
   Un servei explica què és; un paquet diu qui el compra, quant dura, què
   s'endú, quant costa i quantes vegades s'ha fet. Sense les cinc coses, un
   tècnic municipal no ho pot portar a una junta —que era exactament el
   problema dels tretze quadres que hi havia abans. Veda 137. */
/* `data-sector` és **una llista**: un paquet pot tenir dos compradors o tres.
   Llegit com un valor —`([a-z]+)`—, «admin tercer» es llegia com a «admin» i
   la meitat del que diu aquell paquet no arribava a cap comprovació. */
const paquets = [...cos.matchAll(/<article class="paquet" id="pk-([^"]+)" data-sector="([a-z ]+)">([\s\S]*?)<\/article>/g)]
  .map(m => ({ id: m[1], sector: m[2].split(' ').filter(Boolean), html: m[3] }));
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

  /* ── Cada sector declarat, una porta; cada porta, alguna cosa a dins ──
     La regla comptava quatre portes i dos sectors amb nom escrit. Amb tres
     sectors, comptar deixa de servir: el que ha de ser cert és que **cada
     sector que un paquet declara tingui botó**, i que **cada botó tingui
     paquets**. Les dues meitats fallen en silenci i de maneres oposades:

     · Un sector sense botó —un `sector: ['public']` que no s'ha mudat— deixa
       aquell paquet fora de qualsevol tria que no sigui «tot el catàleg».
     · Un botó sense paquets buida la pàgina quan es prem. Una porta que mena a
       una habitació buida és pitjor que cap porta.

     I el mínim de tres es queda escrit: el motiu de tot això és que «públic»
     ajuntava un ajuntament i una entitat. Amb dos sectors, hi hem tornat. */
  const sectors = new Set(paquets.flatMap(p => p.sector));
  const botons = new Set([...cos.matchAll(/class="pk-f[^"]*"\s+data-sec="([^"]+)"/g)]
    .map(m => m[1]).filter(x => x !== 'tot'));
  const senseBoto = [...sectors].filter(x => !botons.has(x));
  const sensePaquet = [...botons].filter(x => !sectors.has(x));
  if (sectors.size < 3)
    bad(`el catàleg només parla a ${pl(sectors.size, 'sector', 'sectors')} (${[...sectors].join(', ') || 'cap'}) — `
      + 'administració, tercer sector i empresa no compren igual, i ajuntar-ne dos amaga la meitat del que diu un paquet');
  else if (senseBoto.length)
    bad(`${pl(senseBoto.length, 'sector declarat sense botó de filtre', 'sectors declarats sense botó de filtre')}: `
      + `${senseBoto.join(', ')} — aquells paquets no surten amb cap tria que no sigui «tot el catàleg»`);
  else if (sensePaquet.length)
    bad(`${pl(sensePaquet.length, 'botó de filtre sense cap paquet', 'botons de filtre sense cap paquet')}: `
      + `${sensePaquet.join(', ')} — premut, buida la pàgina`);
  else {
    const compta = [...botons].map(x => `${x} ${paquets.filter(p => p.sector.includes(x)).length}`).join(' · ');
    ok(`${sectors.size} sectors, tots amb botó i amb paquets a dins (${compta})`);
  }
  /* I un paquet sense cap sector surt sempre i no el filtra res: la fitxa és
     correcta, es veu, i no hi ha manera d'adonar-se'n mirant la pàgina. */
  const mut = paquets.filter(p => !p.sector.length);
  if (mut.length) bad(`${pl(mut.length, 'paquet no diu a qui parla', 'paquets no diuen a qui parla')} `
    + `(${mostra(mut.map(p => p.id))}) — surt a totes les portes i a cap`);

  /* El sostre dels 5.000 €: per sobre, la proposta deixa de ser una decisió
     d'una regidoria i passa a ser un procediment. Només s'aplica als paquets
     dirigits a l'administració; els d'empresa i els de tercer sector no en
     tenen —una entitat no contracta per contracte menor, demana una subvenció.

     **Qui hi cau es llegeix del sector declarat i no del text de «per a qui».**
     Era un `match` damunt d'una frase lliure —«ajuntament|consell|escola|…»— i
     això vol dir que reescriure aquella frase treia un paquet del sostre sense
     que res ho digués: «Consells comarcals i mancomunitats» hi entrava i
     «Ens supramunicipals» no. El sector és una dada i la frase és prosa. */
  const SOSTRE = 5000;
  /* El que ha de quedar sota el sostre és **l'entrada** de la forquilla: si el
     mínim ja hi passa, aquell paquet no té cap manera d'entrar a una
     contractació menor. Que el màxim la superi és legítim —un festival de tres
     dies no és un contracte menor— sempre que la fitxa digui què l'hi porta,
     cosa que la regla de dalt ja exigeix (`pk-perque`). */
  const cars = paquets.filter(p => {
    if (!p.sector.includes('admin')) return false;
    /* Es miren totes les xifres del bloc del preu, no només les que porten el
       símbol al costat: a «De 3.500 a 6.000 €» l'euro només és al final, i
       mirar-hi el mínim per l'€ donava el màxim. */
    const bloc = (p.html.match(/class="pk-preu">([\s\S]*?)<p class="pk-perque"/) || [])[1] || '';
    const nums = [...bloc.matchAll(/\b(\d{1,3}(?:\.\d{3})+|\d{3,})\b/g)]
      .map(m => Number(m[1].replace(/\./g, ''))).filter(n => n >= 100);
    return nums.length ? Math.min(...nums) > SOSTRE : false;
  });
  if (!cars.length) ok(`els ${paquets.filter(p => p.sector.includes('admin')).length} paquets per a l'administració `
    + `hi entren per sota dels ${SOSTRE.toLocaleString('ca-ES')} €`);
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
  /* Els paquets es reparteixen entre dues pantalles i la regla no canvia: **cap
     paquet del README es pot quedar sense lloc on comprar-lo**. El que canvia
     és on es busca cadascun.

     Els tres del SOS es venen a `/sos/` i no a la portada, perquè es decideixen
     quan algú ja és a dins de l'eina i no quan compara consultories. Mirar-los
     només a la portada faria petar aquesta guarda per una decisió de negoci que
     es va prendre a posta; no mirar-los enlloc els deixaria desaparèixer sense
     que petés res, que és pitjor. Es miren als dos llocs. */
  const enHtml = [...src.matchAll(/'pk\.[a-z0-9-]+\.n':'((?:[^'\\]|\\.)*)'/g)]
    .map(m => m[1].replace(/\\'/g, "'"));
  const APP_SOS = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');
  const enSos = [...APP_SOS.matchAll(/<div class="pq-h"><b>([^<]+)<\/b>/g)].map(m => m[1].trim());
  /* El README és en castellà i `/sos/` és en català, que no passa pel
     diccionari. Es tradueix el nom amb la declaració del catàleg —que és qui
     sap les dues formes— en comptes de comparar dues llengües i concloure que
     falta un paquet que hi és. */
  const { SOS_PAQUETS } = require('./build-oferta.js');
  const caDeEs = new Map(SOS_PAQUETS.map(p => [p.nomEs, p.nom]));
  const esVen = n => enHtml.includes(n) || enSos.includes(n) || enSos.includes(caDeEs.get(n));
  const orfesMd = enMd.filter(n => !esVen(n));
  if (!orfesMd.length) ok(`els ${enMd.length} paquets del README es venen en algun lloc (${enHtml.length} a la portada, ${enSos.length} a /sos/)`);
  else bad(`${pl(orfesMd.length, 'paquet del README no es ven', 'paquets del README no es venen')} enlloc (${mostra(orfesMd)}) — un paquet sense pantalla és un catàleg a mitges`);
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

/* Tres vocabularis i no dos. El de «públic» en tenia dos a dins —el plec i
   l'acta de la junta no són la mateixa casa— i un text que parlés només
   d'entitats passava la regla com si parlés d'ajuntaments. */
const ADMIN  = /ajuntament|consell comarcal|mancomunitat|regidor|tècnic municipal|municipal|plec|mandat|ayuntamiento|consejo comarcal|concejal|municipal|pliego|mandato/i;
const TERCER = /entitat|associaci|fundaci|ateneu|afa |veïn|voluntari|junta|comunitari|entidad|asociaci|fundaci|ateneo|vecin|voluntari|comunitario/i;
const PRIVAT = /empresa|cooperativa|organigrama|direcció de persones|comitè de direcció|departament|dirección de personas|comité de dirección|departamento/i;
const SECTORS_TXT = [['administració', ADMIN], ['tercer sector', TERCER], ['empresa', PRIVAT]];

const repte = sensTags(bloc('<section class="enfoc" id="enfoc"', '</section>'));
if (!repte) bad('no es troba la secció del repte (`#enfoc`)');
else {
  const callen = SECTORS_TXT.filter(([, re]) => !re.test(repte)).map(([n]) => n);
  if (!callen.length) ok('el repte s\'explica per als tres sectors, no per a un');
  else bad(`el repte no parla ${callen.length === 1 ? 'de' : 'de'} ${callen.join(' ni de ')}: `
    + 'qui ve d\'aquella porta del hero hi arriba i conclou que això no va amb ell');
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
/* Comptava portes —«quatre, dues a cada lloc»— i amb tres sectors un número
   deixa de dir res: amb sis portes podrien ser dues d'un sector repetides i un
   sector sense cap. El que ha de ser cert és que **cada sector del filtre
   tingui porta al hero i porta al repte**, que són els dos llocs on algú
   decideix si això va amb ell. */
const heroP = new Set([...bloc('<div class="hero-eyebrow hero-portes', '</div>')
  .matchAll(/data-sec="([^"]+)"/g)].map(m => m[1]));
const repteP = new Set([...bloc('<div class="bandes-grid">', '</section>')
  .matchAll(/data-sec="([^"]+)"/g)].map(m => m[1]));
const senseHero = [...filtres].filter(x => x !== 'tot' && !heroP.has(x));
const senseRepte = [...filtres].filter(x => x !== 'tot' && !repteP.has(x));
const portesOrfes = [...new Set(portes)].filter(x => !filtres.has(x));
if (portesOrfes.length) bad(`hi ha portes que demanen un sector que el filtre no té: ${portesOrfes.join(', ')}`);
else if (senseHero.length) bad(`${pl(senseHero.length, 'sector sense porta al hero', 'sectors sense porta al hero')}: `
  + `${senseHero.join(', ')} — qui ve d'aquella casa no es troba a la primera pantalla`);
else if (senseRepte.length) bad(`${pl(senseRepte.length, 'sector sense banda al repte', 'sectors sense banda al repte')}: `
  + `${senseRepte.join(', ')} — el repte diu a qui li passa això, i aquell sector no hi surt`);
else ok(`els ${[...filtres].filter(x => x !== 'tot').length} sectors tenen porta al hero, `
  + 'banda al repte i filtre al catàleg');
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
  const cob = SECTORS_TXT.map(([n, re]) => [n, faqs.filter(f => re.test(f)).length]);
  const nul = cob.filter(([, c]) => !c).map(([n]) => n);
  if (!nul.length) ok(`les ${faqs.length} objeccions cobreixen els tres sectors (`
    + cob.map(([n, c]) => `${n} ${c}`).join(' · ') + ')');
  else bad(`cap objecció parla ${nul.join(' ni ')}: `
    + 'qui hi arriba des d\'aquella porta no en troba ni una que sigui la seva');
}

/* ── 7b · «Qui hi ha darrere» s'ha de poder comprovar ─────────────────────
   Aquesta secció és l'única de la pàgina que demana confiar en **una persona**,
   i durant mesos va demanar-ho sense donar cap manera de comprovar-ho: quatre
   paràgrafs de currículum i ni un enllaç a fora. Ni la seva pàgina
   professional, ni el seu perfil, ni l'article de premsa que ja teníem
   localitzat a `knowledge/negoci/trajectoria.md`.

   El defecte no peta i no es veu: la secció es llegeix bé i sembla completa.
   Per això té guarda. Dues coses, i les dues han de ser certes:
     · **almenys dos destins externs** on algú pugui anar a mirar-ho, i
     · **una sortida per contactar** des d'aquí mateix, que és on la confiança
       és més alta de tota la pàgina i on abans no hi havia res. */
const fac = (cos.match(/<section class="facilitador"[\s\S]*?<\/section>/) || [''])[0];
if (!fac) bad('no es troba la secció de qui hi ha darrere');
else {
  const fora = [...new Set([...fac.matchAll(/href="(https?:\/\/[^"]+)"/g)].map(m => m[1]))];
  if (fora.length >= 2) ok(`el perfil es pot comprovar a fora: ${fora.length} destins verificables`);
  else bad(`el perfil només porta ${fora.length} enllaç extern: demana confiar en una persona `
    + 'i no dona cap manera de comprovar-ho');
  /* El correu es munta amb JavaScript per no publicar-lo en clar, així que el
     que es comprova és que l'ham hi sigui, no el `mailto:`. */
  if (/class="js-mail"|id="facMail"/.test(fac)) ok('i des d\'aquí es pot escriure directament');
  else bad('el perfil no ofereix cap manera de contactar: és el punt de més confiança de la pàgina '
    + 'i acaba en un cul-de-sac');
  /* Un enllaç extern que s'obre en una pestanya nova sense `rel` exposa la
     pàgina a reverse tabnabbing. La guia de marca ja el llista com a error
     comès i corregit; aquí es queda tancat. */
  const nus = [...fac.matchAll(/<a\s[^>]*href="https?:[^"]*"[^>]*>/g)]
    .map(m => m[0]).filter(a => /target="_blank"/.test(a) && !/rel="[^"]*noopener/.test(a));
  if (!nus.length) ok('i tots els enllaços de fora porten rel="noopener"');
  else bad(`${pl(nus.length, 'enllaç extern', 'enllaços externs')} sense rel="noopener" al perfil`);
}

/* ── 7c · Cap nom de client sense font escrita ────────────────────────────
   Un nom d'empresa a `#trajectoria` és **una afirmació sobre un tercer**:
   IKEA, BBVA o Novartis no han signat res que digui que es poden fer servir de
   referència, i el dia que un d'ells ho pregunti la resposta no pot ser «ho
   vam posar perquè ens sonava».

   Per això tot nom que surti als logos ha de ser també a
   `knowledge/negoci/trajectoria.md`, on cada fila diu d'on surt i amb quina
   data. La guarda no comprova que sigui veritat —això no ho pot saber— sinó
   que **hi hagi algú que ho hagi dit i quan**, que és l'única cosa que un
   fitxer pot garantir. */
const TRAJ = join(__dirname, '..', 'knowledge', 'negoci', 'trajectoria.md');
if (!existsSync(TRAJ)) bad('no hi ha `knowledge/negoci/trajectoria.md`: els noms de client es queden sense font');
else {
  const font = readFileSync(TRAJ, 'utf8');
  const noms = [...new Set([...cos.matchAll(/<div class="cl-logos">([\s\S]*?)<\/div>/g)]
    .flatMap(m => [...m[1].matchAll(/<span(?: class="muted"[^>]*)?>([^<]+)<\/span>/g)]
      .map(x => x[1].trim())))]
    /* El «i +150 empreses…» no és un nom: és la xifra que els resumeix. */
    .filter(n => !/^i \+|^y \+/.test(n));
  const orfes = noms.filter(n => !font.includes(n));
  if (!noms.length) bad('no es troba cap nom de client a la portada: aquesta guarda no pot comprovar res');
  else if (!orfes.length) ok(`els ${noms.length} clients anomenats tenen font escrita a trajectoria.md`);
  else bad(`${pl(orfes.length, 'nom de client', 'noms de client')} a la portada sense font al coneixement: `
    + orfes.join(', ') + ' — un nom d\'empresa és una afirmació sobre un tercer i ha de dir qui ho ha dit i quan');
}

/* ── 7d · El pont cap al SOS no es pot perdre ──────────────────────────────
   El contingut del SOS ha marxat d'aquesta portada cap a `/sos/`, i era la
   decisió correcta: el que ajuda a **decidir una compra** es queda aquí i el
   que ajuda a **fer servir el model** viu allà.

   Però el SOS és la prova més forta que té la casa —el «100 % de l'eina és
   oberta» és una de les tres xifres del hero, i «s'aprèn fent amb projectes
   propis» és el que la distingeix d'una consultoria petita amb un mètode
   bonic—. Si un dia algú escurça la portada una mica més i s'emporta els dos
   ponts, el resultat serà una pàgina més curta **que ven pitjor**, i no petarà
   res: una secció que desapareix no deixa cap error.

   Per això es comprova el que ha de seguir sent cert: que hi hagi camí, i que
   sigui a la primera meitat. Un enllaç al peu no és un pont: és una nota. */
const camins = [...cos.matchAll(/href="\/SOS\/?"/g)].map(m => m.index);
if (!camins.length) bad("la portada no porta enlloc al SOS — és la prova més forta que té la casa i s'hi ha de poder anar");
else {
  const primer = Math.min(...camins);
  if (primer > cos.length / 2) bad("l'únic camí cap al SOS és a la segona meitat de la pàgina: un enllaç al peu és una nota, no un pont");
  else ok(`${pl(camins.length, 'camí', 'camins')} cap al SOS, el primer a la primera meitat`);
  /* I que els ponts segueixin dient què s'hi trobarà. Un botó que només diu
     «obre el SOS» no és un pont tampoc: no dona cap motiu per travessar-lo. */
  const diu = /encara que no ens contractis|sense contractar/i.test(cos)
    && /(projecte de veritat|casos inventats)/i.test(cos);
  if (diu) ok('i els ponts diuen per què val la pena travessar-los');
  else bad("els ponts cap al SOS no diuen què s'hi troba: un botó sense motiu no el clica ningú");
}

/* ── 7e · Les dues vistes han de ser dues vistes ───────────────────────────
   Hi havia dos dibuixos del mateix discurs —el graf del celler i plantes de
   castell de casos declarats a mà— i cap dels dos era una vista de l'altre.
   Ara surten del mateix cas, i el que això ha de seguir sent és comprovable
   amb el text de la pàgina:

   · els dos dibuixos hi són i es poden commutar,
   · el commutador mana sobre panells que existeixen —una pestanya que apunta
     a un `id` inexistent no peta i deixa la segona vista inabastable—,
   · i **els botons del pols manen sobre tots dos**: si només nomenessin el
     graf, encallar el node el buidaria i deixaria la pinya sencera. Això no
     peta i no es veu, perquè els dos dibuixos són maquíssims per separat.

   La guarda no mira si el dibuix és bonic: mira que les dues vistes no es
   puguin separar sense que algú ho sàpiga. */
{
  const sec = bloc('<section class="dues-vistes" id="dues-vistes"', '</section>');
  if (!sec) bad('no es troba la secció de les dues vistes (`#dues-vistes`)');
  else {
    const tabs = [...sec.matchAll(/class="dv-t[^"]*"[^>]*aria-controls="([^"]+)"/g)].map(m => m[1]);
    const orfes = tabs.filter(id => !sec.includes(`id="${id}"`));
    const dibuixos = ['mvCeller', 'plCeller'].filter(id => sec.includes(`id="${id}"`));
    if (tabs.length < 2) bad(`només ${pl(tabs.length, 'pestanya', 'pestanyes')} a les dues vistes: `
      + 'sense commutador és una vista i mitja');
    else if (orfes.length) bad('pestanyes que manen sobre un panell que no existeix: ' + mostra(orfes)
      + ' — no peta, i aquella vista no s\'hi pot arribar');
    else if (dibuixos.length < 2) bad(`hi ha ${dibuixos.length} dels dos dibuixos (${dibuixos.join(', ') || 'cap'}): `
      + 'el graf i la planta del mateix cas han d\'anar junts o no són dues vistes');
    else ok(`les dues vistes hi són (${dibuixos.join(' i ')}) amb ${tabs.length} pestanyes que manen sobre panells que existeixen`);

    /* El pols: `data-svg` ha de nomenar els dos dibuixos. */
    const mana = (sec.match(/class="mv-pols-ui" data-svg="([^"]+)"/) || [, ''])[1].split(' ').filter(Boolean);
    const fora = dibuixos.filter(id => !mana.includes(id));
    if (!mana.length) bad('la secció no porta els botons del pols');
    else if (fora.length) bad('els botons del pols no manen sobre ' + fora.join(', ')
      + " — encallar el node buidaria un dibuix i deixaria l'altre sencer, i la segona vista seria decoració");
    else ok(`i els botons del pols manen sobre tots ${mana.length} els dibuixos alhora`);
  }

  /* ── La xarxa ha de tenir les dues bandes ─────────────────────────────
     Un mapa de valor amb una sola banda no és un mapa: és un organigrama. La
     secció dibuixa els rols de la casa **i** els de qui contracta, i si un dia
     se'n va una de les dues meitats quedarà una pàgina que es llegeix bé i que
     ja no diu res —el mètode consisteix justament en els dos costats.

     I una regla de marca: aquí no hi va cap nom d'empresa. Els nodes són rols;
     els clients tenen la seva paret, amb la font escrita de cada un (regla 10).
     Barrejar-los faria passar per client qualsevol rol dibuixat. */
  const xarxa = bloc('<section class="xarxa" id="xarxa"', '</section>');
  if (!xarxa) bad('no es troba el mapa de la xarxa (`#xarxa`)');
  else {
    const txt = sensTags(xarxa.replace(/<!--[\s\S]*?-->/g, ''));
    const casa = /qui mapa|qui forma|qui ho fa passar|qui construeix/i.test(txt);
    const fora = /ag[èe]ncies|empreses|institucions|administraci/i.test(txt);
    const nodes = (xarxa.match(/class="mv-n"/g) || []).length;
    if (!casa || !fora) bad('el mapa de la xarxa només té una banda ('
      + (casa ? 'els oficis de la casa' : 'els de fora') + '): un mapa de valor amb un sol costat és un organigrama');
    else if (nodes < 6) bad(`el mapa de la xarxa dibuixa ${nodes} nodes: amb menys no hi ha xarxa`);
    else ok(`la xarxa té les dues bandes i ${nodes} rols dibuixats`);
    /* I la frase que impedeix llegir-ho com una llista de clients. */
    if (/no és una llista de clients|no es una lista de clientes/i.test(txt))
      ok('i diu que els nodes són rols i no clients');
    else bad("al mapa de la xarxa li falta dir que **no és una llista de clients**: "
      + "qui el llegeixi pensarà que cada node és un contracte");
  }

  /* El vocabulari: cada posició ha de dir què és en una casa. Es mira sobre el
     text visible perquè és el que llegeix qui no sap de castells. */
  const rols = bloc('<section class="rols" id="rols"', '</section>');
  if (!rols) bad('no es troba el vocabulari de rols (`#rols`)');
  else {
    const n = (rols.match(/class="rl-p"/g) || []).length;
    const casa = (rols.match(/class="rl-o"/g) || []).length;
    if (n < 8) bad(`només ${n} posicions al vocabulari: amb menys no s'hi pot llegir una organització`);
    else if (casa !== n) bad(`${n} posicions i ${casa} traduccions a una casa: `
      + 'una posició que només digui què fa en un castell és folklore');
    else ok(`${n} posicions al vocabulari, totes amb la seva traducció a una casa`);
  }
}

/* ── 7f · On viu la mesura de la cobertura ────────────────────────────────
   Aquí hi va haver una regla que comptava text visible sense clau, i es va
   treure el mateix dia: **comptava 61 falsos positius**. Un `<strong>` dins
   d'un `<p data-i18n-html>` no té clau pròpia i no li fa falta —el diccionari
   substitueix l'HTML del pare— i una expressió regular no sap on acaba un
   paràgraf llarg.

   La mesura de debò demana el DOM i la llengua canviada, i això és una prova
   de navegador: `SOS/tests/test-i18n-home.mjs`. Hi viu el sostre, i hi viu amb
   la xifra mesurada en comptes d'una d'inventada.

   Es deixa escrit perquè la pròxima persona que vulgui aquesta guarda sàpiga
   que ja es va intentar aquí i per què no hi va. */

// ── 8 · Informatiu ───────────────────────────────────────────────────────
const seccions = (cos.match(/<section/g) || []).length;
const detalls = (cos.match(/<details class="faq-item"/g) || []).length;
console.log(`  · ${seccions} seccions · ${paquets.length} paquets · ${detalls} objeccions · ${Math.round(Buffer.byteLength(src) / 1024)} KB en cru`);

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} a la portada.` : '\n✅ La portada quadra.');
process.exit(fails ? 1 : 0);
