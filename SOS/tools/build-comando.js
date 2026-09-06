#!/usr/bin/env node
/* El Comando, declarat en un sol lloc
 * ─────────────────────────────────────────────────────────────────────────────
 * El Comando estava escampat: la història als còmics viu a `comando.html`, els
 * personatges a `CANONICAL_HEROES` dins de l'app, el relat de com va començar
 * al blog, el perfil de superheroi/na i el kit narratiu són dos modals de
 * l'aplicació, i el poble on tot això passa és `molekulandia.html`. Cadascuna
 * d'aquestes peces és bona i cap diu que les altres existeixen.
 *
 * El que faltava no era una peça més: era **dir què és tot plegat**. És un
 * projecte per fer la primera pel·lícula col·laborativa amb 150.000 persones,
 * i cada peça hi fa un paper. Aquesta pàgina és on es veu sencer.
 *
 * ── Per què generat i no escrit a mà ────────────────────────────────────────
 * Les fitxes d'heroi de la pàgina estaven escrites a mà **copiant** la llista
 * de l'app. `check-comando.js` existeix precisament perquè un dia van
 * divergir, i la seva regla 4 no fa altra cosa que comparar les dues còpies.
 * Una guarda que vigila una còpia és millor que res; no tenir la còpia és
 * millor que la guarda. Ara les fitxes surten de `CANONICAL_HEROES`.
 *
 * ── El que aquí es declara i no es dedueix ──────────────────────────────────
 *   · `EIXOS`   — què és aquest projecte: art, ficció, educació, inspiració,
 *                 empoderament de les comunitats i autonomia. Sis paraules que
 *                 no volen dir res si no diuen **on** passen: cada eix porta la
 *                 pantalla on això és una cosa que es fa.
 *   · `PASSOS`  — com una persona hi entra i què fa el SOS a cada pas. Cada pas
 *                 apunta a un modal de l'app per la seva ruta (`MODAL_ROUTES`),
 *                 i la guarda comprova que la ruta existeixi.
 *   · `VIDEOS`  — l'inventari del que hi ha filmat i **del que no**. Un vídeo
 *                 sense enllaç no es pinta com una porta: es pinta dient que
 *                 encara no hi és. Prometre una porta tancada és pitjor que no
 *                 tenir-la (veda 116).
 *   · `POSTS`   — les entrades del blog que expliquen el Comando, amb la seva
 *                 àncora. La guarda comprova que l'àncora existeixi a `blog.html`.
 *
 * ── Ús ──────────────────────────────────────────────────────────────────────
 *   node SOS/tools/build-comando.js            escriu el que toqui
 *   node SOS/tools/build-comando.js --check    falla si està vell o incomplet
 */
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const SOS = join(ARREL, 'SOS');
const CHECK = process.argv.includes('--check');

/* ══ LA TESI ═════════════════════════════════════════════════════════════════
   El número no s'escriu aquí dues vegades: surt de `COMANDO_TARGET`, que és
   d'on el llegeix l'app. Si algun dia són 200.000, es canvia allà i prou. */
const TESI = {
  titol: 'La primera pel·lícula que farem 150.000 persones',
  entrada: 'Projecte obert · art, ficció i comunitat',
  sub: 'El <strong>Comando Molekulon</strong> és un còmic, una banda i una pel·lícula que encara ' +
    'no existeix. Es farà amb <strong>150.000 superherois reals</strong>: gent que aporta hores, ' +
    'objectes i coneixement al seu barri i que ho registra al SOS. El teu personatge no és un avatar ' +
    'inventat — és el que ja fas, amb nom i amb superarma. I el poble on passa tot plegat ' +
    'és <a href="molekulandia.html">Molekulandia</a>.'
};

/* ══ ELS SIS EIXOS ═══════════════════════════════════════════════════════════
   Sis paraules grosses. Cadascuna porta obligatòriament una pantalla on això
   és una cosa que es fa, i no una intenció: sense el `on`, això seria el
   apartat de valors d'una web corporativa.

   «Empoderament» va amb el seu objecte a posta. La guia de marca el prohibeix
   sol (i `check-landing.js` l'acusa) perquè empoderar **algú** és una cosa que
   es pot comprovar i «empoderament» a seques no vol dir res. */
const EIXOS = [
  { id: 'art', ic: '🎨', nom: 'Art',
    que: 'El còmic, la música i el dibuix no il·lustren el projecte: en són la matèria. Cada personatge té la seva superarma, el seu vers i el seu tema.',
    on: ['La història', '#historia'] },
  { id: 'ficcio', ic: '📖', nom: 'Ficció',
    que: 'Una història inventada és el permís per dir en veu alta el que passa de debò a la teva feina i al teu barri. El Mundo Muerto no és una metàfora amable.',
    on: ['Els herois canònics', '#herois'] },
  { id: 'educacio', ic: '🎓', nom: 'Educació',
    que: 'El mateix relat és material d\'aula: la Fàbrica de Superherois de 6 a 13 anys, i setze mòduls de N0 a N3 per a qui hi vulgui treballar.',
    on: ['A l\'escola', 'escola.html'] },
  { id: 'inspiracio', ic: '✨', nom: 'Inspiració',
    que: 'Ningú es mou per un informe. Es mou perquè algú altre s\'ha mogut i ho ha explicat prou bé perquè es vegi que es podia.',
    on: ['El blog del Comando', '#blog'] },
  { id: 'poder', ic: '💪', nom: 'Empoderament de les comunitats',
    que: 'Poder concret i comprovable: qui té les claus, qui decideix i qui cobra el que aporta. Cada aportació va signada i el registre és públic.',
    on: ['El registre públic', 'index.html#/registre'] },
  { id: 'autonomia', ic: '🕊', nom: 'Autonomia',
    que: 'Sense compte, sense contrasenya i sense demanar permís. La clau te la fa el navegador i no surt del teu aparell; si te\'n vas, t\'ho endús tot.',
    on: ['El teu perfil és teu', '#perfil'] }
];

/* ══ COM ES FA UNA PEL·LÍCULA AMB 150.000 PERSONES ═══════════════════════════
   Els mòduls del SOS que fan el Comando, en l'ordre en què una persona els
   troba. `ruta` és la clau a `MODAL_ROUTES` de l'app: la guarda comprova que
   existeixi, perquè un enllaç a un modal que ja no es diu així obre l'app per
   la portada i sembla que no hagi passat res. */
const PASSOS = [
  { n: 1, ic: '🦸', t: 'Fes el teu personatge', ruta: 'alta',
    d: 'Nom, població, fins a <strong>cinc superpoders</strong> i les teves <strong>superarmes</strong> — el que saps fer i el que pots deixar. Es fa al navegador i no puja enlloc.',
    cta: 'Crea el meu perfil' },
  { n: 2, ic: '🎬', t: 'Escriu la teva història amb IA', ruta: 'kit',
    d: 'El kit narratiu en treu sinopsi de còmic, himne i escena performativa a partir del que has fet <strong>de debò</strong>. La clau de la IA la poses tu i cap dada de ningú hi entra sense confirmar-ho.',
    cta: 'Obre el kit narratiu' },
  { n: 3, ic: '🌌', t: 'Entra al multivers', ruta: 'multivers',
    d: 'Cada història desada s\'apila amb les altres. El multivers <strong>és el guió</strong>: no l\'escriu ningú a soles, es va omplint.',
    cta: 'Mira el multivers' },
  { n: 4, ic: '🎞', t: 'Els crèdits són el registre', ruta: 'comando',
    d: 'Cada aportació signada surt als crèdits amb el seu nom i la seva data. <strong>Aquí no hi ha figurants</strong>: qui hi surt és perquè ha fet alguna cosa i algú altre ho ha confirmat.',
    cta: 'Obre el Comando a l\'app' }
];

/* El poble on passa. No és un pas: és el decorat, i ja existeix. */
const DECORAT = { href: 'molekulandia.html', t: 'Molekulandia',
  d: 'El poble sencer: onze edificis on entrar i nou professions. El bar és el banc de temps i la ferreteria és la biblioteca de les coses.' };

/* ══ EL QUE HI HA FILMAT, I EL QUE NO ════════════════════════════════════════
   Aquesta llista és mig inventari i mig encàrrec. Un vídeo amb `url` es pinta
   com un enllaç; un sense, es pinta dient que **encara no hi és**, amb qui és
   i què s'hi veurà. Les dues coses són informació; una porta que no obre, no.

   `qui` ha de ser un nom del roster quan la mena és `personatge`: la guarda ho
   comprova contra `CANONICAL_HEROES`, que és la mateixa regla de la veda 109. */
/* `qui` és una **llista de noms**, no un nom: a «La Bomba Disco» hi surten dos
   personatges, i amb un sol camp un dels dos s'hauria perdut. Tot nom que hi
   entri ha de ser del roster, dels aliats o dels vilans —la mateixa regla de la
   veda 109, ara aplicada al catàleg de vídeos, que és per on entraria el
   proper nom mal escrit.

   `mena` diu què és la peça i no com de bona és:
     · `llista`     — la sèrie sencera. N'hi ha d'haver una i ha de tenir adreça.
     · `videoclip`  — un capítol o un clip amb personatge.
     · `tema`       — la cançó, sense imatge o amb imatge que no és el capítol.
     · `directe`    — enregistrament d'una actuació o d'una sessió.

   Els URL van sense el `?si=…` amb què els comparteix YouTube: és un
   identificador de qui ha compartit l'enllaç i no fa cap falta per veure el
   vídeo. */
const VIDEOS = [
  { id: 'capitols', mena: 'llista', qui: [], titol: 'Els capítols del Comando',
    d: 'La sèrie sencera. A cada capítol es presenta un superheroi i un supervilà del Mundo Muerto.',
    url: 'https://youtube.com/playlist?list=PLMB33ApQeOYWbPLQRbf9B5gMpgs0cL5NB' },

  /* ── Videoclips de personatge ─────────────────────────────────────────── */
  { id: 'horacio-clip', mena: 'videoclip', qui: ['Horacio Motomachi'],
    titol: 'Horacio Motomachi', d: 'El videoclip del tema que obre la intro.',
    url: 'https://youtu.be/3Kf36tpHk98' },
  { id: 'reciclator', mena: 'videoclip', qui: ['Reciclator'], titol: 'Reciclator',
    d: 'Construeix les superarmes de la banda amb el que els altres han llençat: d\'allà en surten la Bomba Amor i el Rayo Cagón.',
    url: 'https://youtu.be/Py44l1WsSO4' },
  { id: 'supergerminador', mena: 'videoclip', qui: ['Supergerminador'], titol: 'Supergerminador',
    d: 'Ensenya a germinar per menjar superaliments, i canta amb la seva rialla.',
    url: 'https://youtu.be/RyAkyIp6P10' },
  { id: 'medusa', mena: 'videoclip', qui: ['La Medusa Andaluza'], titol: 'La Medusa Andaluza',
    d: 'El node central que creua informació entre parts que no es parlaven.',
    url: 'https://youtu.be/5FAvOvi2P30' },
  { id: 'bomba-disco', mena: 'videoclip', qui: ['Guiri-Guay', 'Flying Frog'], titol: 'La Bomba Disco',
    d: 'El tema que trenca la cuirassa d\'Afrodito, per Guiri-Guay i Flying Frog.',
    url: 'https://youtu.be/JsEAeiQ-fc0' },
  { id: 'flying-frog', mena: 'videoclip', qui: ['Flying Frog'], titol: 'Flying Frog',
    d: 'La que posa el color al còmic del Comando.', url: 'https://youtu.be/WfpclzQod2g' },
  { id: 'formiga', mena: 'videoclip', qui: ['Formiga Atòmica'], titol: 'La Formiga Atòmica',
    d: 'Modista, amb la superarma Pistola Amor.', url: 'https://youtu.be/yjQ5WnGChh0' },
  { id: 'risitas-bekelar', mena: 'videoclip', qui: ['El Risitas', 'Príncep de Bekelar'],
    titol: 'El Risitas i el Príncep de Bekelar', d: 'El nòvio de la Formiga Atòmica, i el Príncep.',
    url: 'https://youtu.be/bg4N48q_dtI' },
  { id: 'mcgreggor', mena: 'videoclip', qui: ['Mr. McGragor'], titol: 'Mr. McGragor',
    d: 'El supervilà que ofereix en comptes d\'atacar. L\'autor el llegeix com a premonitori de l\'actualitat.',
    url: 'https://youtu.be/C6-7B2O5dDY' },

  /* ── Temes ────────────────────────────────────────────────────────────── */
  { id: 'horacio-tema', mena: 'tema', qui: ['Horacio Motomachi'], titol: 'El tema d\'Horacio Motomachi',
    d: 'La cançó sencera, allotjada aquí. Sona també a la intro.', url: 'media/comando-horacio.mp3' },
  { id: 'guiriguay-tema', mena: 'tema', qui: ['Guiri-Guay'], titol: 'El tema del Guiri-Guay',
    d: 'Curació neuro-rítmica: sana ferides i torna a moure el cervell del grup.',
    url: 'https://youtu.be/Q15My_6qb4A' },

  /* ── Directes ─────────────────────────────────────────────────────────── */
  { id: 'directe-floresta', mena: 'directe', qui: [], titol: 'La Bomba Disco, a la Floresta',
    d: 'La banda del Comando en directe. És la prova que això no és una marca: hi ha gent que hi puja.',
    url: 'https://youtu.be/PNFy7V8UbQs' },

  /* ── El que l'autor ha nomenat i encara no té adreça ──────────────────── */
  { id: 'pigmenton', mena: 'videoclip', qui: ['Pigmentón'], titol: 'Pigmentón',
    d: 'Qui dibuixa la xarxa i dona a cadascú el color que li toca perquè pugui operar.', url: null },
  { id: 'fraktalman', mena: 'tema', qui: ['Fraktalman'], titol: 'Fraktalman',
    d: 'La forma que es repeteix a totes les escales, convertida en cançó.', url: null },
  { id: 'tekno-kartoffeln', mena: 'tema', qui: [], titol: 'Tekno Kartoffeln',
    d: 'El tema que enceta la saga del tercer còmic: el punxi per rematar la fauna i trobar els que falten.',
    url: null },
  { id: 'directe-taller', mena: 'directe', qui: [], titol: 'Un taller, filmat',
    d: 'Una sessió de la Fàbrica de Superherois tal com passa, sense muntatge.', url: null }
];

/* ══ EL BLOG DEL COMANDO ═════════════════════════════════════════════════════
   Les entrades que expliquen d'on surt tot això. L'àncora es comprova contra
   `blog.html`: un enllaç a `#post-loquesigui` que ja no hi és no peta, només
   deixa el lector al capdamunt del blog sense saber què buscava. */
const POSTS = [
  { anc: 'post-origen', ic: '🎬', t: 'L\'origen',
    d: 'Mazinguer i Horacio Motomachi reben l\'encàrrec del Gran Molekulon i baixen a buscar els 150.000.' },
  { anc: 'post-molekulon', ic: '🧬', t: 'La síntesi, a peu de carrer',
    d: 'Amb l\'estructura i l\'energia alhora, què fa el Comando quan toca de peus a terra.' },
  { anc: 'post-seny', ic: '🏛', t: 'Seny',
    d: 'L\'estructura que sosté quan els reptes es tornen intensos. La pinya abans que els dosos.' },
  { anc: 'post-rauxa', ic: '🔥', t: 'Rauxa',
    d: 'L\'energia que encén una vegada la matriu ja està armada. Sense pinya, és soroll.' },
  { anc: 'post-2', ic: '🦸', t: 'El teu perfil és una xarxa neuronal creativa',
    d: 'Ja no cal triar de quina cosa ets: ets una persona amb una reputació que travessa totes les capes.' }
];

/* ══ LA INTRO DEL COMANDO · esborrany de guió ════════════════════════════════
   `SOS/intro.html` és una pel·lícula de setze plans que ja existeix i està bé,
   però **explica el SOS**: el problema dels projectes ciutadans, l'esquelet que
   els falta i l'eina que el posa. Servia de portada del Comando per manca d'una
   altra, i una intro que explica l'eina no presenta la història (veda 150).

   Això és el guió de la que sí que el presenta. Es declara aquí i no en un
   document a mà pel mateix motiu que la resta de la pàgina: anomena
   personatges i peces filmades, i els noms mal escrits entren per on s'escriu
   de pressa. La guarda comprova que tot nom sigui del relat i que tota peça
   citada existeixi a `VIDEOS`.

   Tres decisions que no són òbvies:

   · **Cada pla diu d'on surt la imatge.** `de` és l'id d'una peça de `VIDEOS`
     quan el material ja està filmat, i `null` quan s'ha de fer. Un guió que no
     distingeix les dues coses sembla més a prop d'estar fet del que està, i el
     document acaba servint per decidir un pressupost.
   · **El tall de 30 s no és un guió a part**, és una tria de plans d'aquest.
     Dos guions divergeixen la primera vegada que se'n canvia un.
   · **Acaba en dues portes i no en una**: fer-se el personatge (`#/alta`) per a
     qui vol entrar-hi ara, i `uneix-te.html` per a qui només vol dir què fa.
     Una sola crida deixa fora la meitat de qui ha arribat fins al final.

   El que aquesta intro **no** diu: com acaba. El final del Comando no és en
   aquest repositori i no hi ha d'entrar per un guió. */
const INTRO = {
  durada: 90,
  tall: 30,
  cta: {
    principal: { ruta: 'alta', t: 'Fes el teu personatge',
      d: 'Nom, població, cinc superpoders i les teves superarmes. Es queda al teu aparell.' },
    segona: { href: 'uneix-te.html', t: 'Apunta-t\'hi',
      d: 'Per a qui encara no vol crear res: dir què fa al barri i que consti.' }
  },
  plans: [
    { n: 1, s: 7, titol: 'El Mundo Muerto', de: null, qui: [], tall: true,
      img: 'Carrer gris a primera hora. Deu persones passant en direccions diferents; cap es mira. Trànsit, sense música.',
      veu: 'Al Mundo Muerto cadascú aguanta el seu tros. I quan un cau, cau sol.',
      retol: 'MUNDO MUERTO' },
    { n: 2, s: 6, titol: 'No és ciència-ficció', de: null, qui: [], tall: false,
      img: 'El mateix pla, aturat. A sobre hi apareix el nom del poble de qui mira.',
      veu: 'No és un futur. És dimarts, i és aquí.', retol: null },
    { n: 3, s: 8, titol: 'L\'encàrrec', de: null, qui: ['Mazinguer', 'Horacio Motomachi'], tall: false,
      diu: { objectiu: 150000 },
      img: 'Vinyeta del còmic 1: el Gran Molekulon dona l\'encàrrec, i dos baixen a buscar-los.',
      veu: 'Fa dos còmics, dos d\'aquests van rebre un encàrrec: baixar i trobar-ne cent cinquanta mil.',
      retol: null },
    { n: 4, s: 7, titol: 'La banda existeix', de: 'directe-floresta', qui: [], tall: true,
      img: 'La Bomba Disco en directe a la Floresta. Gent que salta, no figurants.',
      veu: 'El Comando no és una idea. Té banda, i toca.', retol: null },
    { n: 5, s: 8, titol: 'Les superarmes surten de les deixalles', de: 'reciclator', qui: ['Reciclator'], tall: false,
      img: 'El taller del Reciclator: el que ja existeix i ningú volia.',
      veu: 'Les superarmes no es compren. Es fan amb el que uns altres han llençat: d\'allà surten la Bomba Amor i el Rayo Cagón.',
      retol: null },
    { n: 6, s: 7, titol: 'I cadascú fa una cosa que fa falta', de: 'supergerminador',
      qui: ['Supergerminador', 'La Medusa Andaluza', 'Flying Frog'], tall: false,
      img: 'Muntatge curt: qui ensenya a germinar, qui creua la informació, qui hi posa el color.',
      veu: 'Un ensenya a germinar. Una altra connecta els qui no es parlaven. Una altra hi posa el color.',
      retol: null },
    { n: 7, s: 7, titol: 'El vilà no crida', de: 'mcgreggor', qui: ['Mr. McGragor'], tall: false,
      img: 'Mr. McGragor, amable, oferint. Pla llarg i quiet.',
      veu: 'I el vilà no ataca: ofereix. Per això costa tant de veure\'l.', retol: null },
    { n: 8, s: 8, titol: 'La teva superarma ja la tens', de: null, qui: [], tall: true,
      img: 'Tres mans, tres plans curts: una escala que passa a un veí, un tupper, una bici que es torna a moure.',
      veu: 'La teva superarma no te l\'has d\'inventar. És el que ja saps fer i el que ja deixes.',
      retol: null },
    { n: 9, s: 7, titol: 'Els que falten', de: null, qui: [], tall: false,
      diu: { herois: 14, objectiu: 150000 },
      img: 'Els catorze cromos dels herois canònics, i darrere seu el comptador que segueix.',
      veu: 'Els herois canònics són catorze. La pel·lícula en necessita cent cinquanta mil.',
      retol: null },
    { n: 10, s: 9, titol: 'Com hi entres', de: null, qui: [], tall: false,
      img: 'Pantalla d\'alta, filmada de debò: nom, població, superpoders, superarmes.',
      veu: 'Fas el teu personatge amb el que ja fas al barri. Es queda al teu aparell i no puja enlloc.',
      retol: null },
    { n: 11, s: 8, titol: 'Els crèdits són el registre', de: null, qui: [], tall: false,
      img: 'El registre públic passant, amb noms i dates de veritat.',
      veu: 'Cada cosa que fas i que algú altre confirma va als crèdits, amb el teu nom i la seva data. Aquí no hi ha figurants.',
      retol: null },
    { n: 12, s: 8, titol: 'Les dues portes', de: null, qui: [], tall: true, cta: true,
      img: 'Negre. El nom del Comando, i a sota les dues portes.',
      veu: 'Si el que has vist ja ho fas, ja hi ets. Només falta que consti.',
      retol: 'COMANDO MOLEKULON' }
  ]
};

/* ══ LECTURA DE LES FONTS ════════════════════════════════════════════════════ */
const APP = readFileSync(join(SOS, 'index.html'), 'utf8');

const blocHeroi = (APP.match(/^const CANONICAL_HEROES=\[[\s\S]*?\n\];/m) || [''])[0];
/* Cada fitxa sencera, per poder-ne treure tots els camps sense inventar-ne cap. */
const HEROIS = [...blocHeroi.matchAll(/\{name:'((?:[^'\\]|\\.)*)'[\s\S]*?\}(?=,\n  \{name:|\n\];)/g)]
  .map(m => {
    const txt = m[0];
    const camp = k => {
      const r = txt.match(new RegExp(k + ":'((?:[^'\\\\]|\\\\.)*)'"));
      return r ? r[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\') : '';
    };
    return { name: m[1].replace(/\\'/g, "'"), role: camp('role'), on: camp('on'),
      power: camp('power'), arma: camp('arma'), lletra: camp('lletra'), vna: camp('vna') };
  });

const OBJECTIU = Number((APP.match(/const COMANDO_TARGET=(\d+)/) || [, 0])[1]);
const RUTES = new Set([...(APP.match(/^const MODAL_ROUTES=\{[\s\S]*?\n\};/m) || [''])[0]
  .matchAll(/^\s{2}(\w+):\{open:/gm)].map(m => m[1]));

if (!HEROIS.length || !OBJECTIU) {
  console.log('✗ no es poden llegir CANONICAL_HEROES o COMANDO_TARGET de SOS/index.html');
  process.exit(1);
}

/* ══ COMPROVACIONS DEL QUE ES DECLARA ════════════════════════════════════════
   Van aquí i no a `check-comando.js` perquè són sobre les llistes d'aquest
   fitxer: si el generador escriu una porta morta, el més barat és no
   escriure-la. La guarda mira la pàgina; això mira la declaració. */
let fails = 0;
const bad = m => { fails++; console.log('  ✗ ' + m); };

/* Tots els noms que el relat reconeix: el nucli, els aliats i els vilans. El
   catàleg de vídeos només pot anomenar gent d'aquí — és la veda 109 aplicada al
   lloc per on entraria el proper nom mal escrit, perquè un vídeo nou s'afegeix
   amb pressa i copiant un títol de YouTube. */
const nom1 = re => [...(APP.match(re) || [''])[0].matchAll(/name:'((?:[^'\\]|\\.)*)'/g)]
  .map(m => m[1].replace(/\\'/g, "'"));
const ALIATS = nom1(/^const COMANDO_ALLIES=\[[\s\S]*?\n\];/m);
const VILANS = nom1(/^const COMANDO_VILLAINS=\[[\s\S]*?\n\];/m);
const noms = new Set(HEROIS.map(h => h.name).concat(ALIATS, VILANS));
if (!ALIATS.length || !VILANS.length) bad('no es poden llegir COMANDO_ALLIES o COMANDO_VILLAINS');
VIDEOS.forEach(v => {
  if (!Array.isArray(v.qui)) { bad(`el vídeo «${v.titol}» no declara \`qui\` com a llista`); return; }
  v.qui.filter(n => !noms.has(n)).forEach(n =>
    bad(`el vídeo «${v.titol}» anomena ${n}, que no és ni al roster, ni als aliats, ni als vilans`));
});
/* Cap id repetit: dos vídeos amb el mateix id es trepitgen a la pàgina i el
   segon no es veu, que és el defecte que no acusa mai ningú. */
const dupsId = VIDEOS.map(v => v.id).filter((x, i, a) => a.indexOf(x) !== i);
if (dupsId.length) bad(`ids de vídeo repetits: ${[...new Set(dupsId)].join(', ')}`);
VIDEOS.filter(v => v.url && !/^https?:/.test(v.url)).forEach(v => {
  if (!existsSync(join(SOS, v.url))) bad(`el vídeo «${v.titol}» apunta a ${v.url}, que no existeix`);
});
/* La llista de capítols és l'única peça que **ha** de tenir adreça: és la que
   sosté la secció mentre els capítols no en tinguin una d'un en un. Si algun
   dia es queda sense, la secció es converteix en vuit portes tancades i una
   nota, i això no és un inventari: és un cartell de «pròximament». */
const llistes = VIDEOS.filter(v => v.mena === 'llista');
if (llistes.length !== 1) bad(`hi ha ${llistes.length} llistes de capítols declarades i n'hi ha d'haver una`);
else if (!llistes[0].url) bad('la llista de capítols no té adreça: és l\'única peça que no pot quedar pendent');
PASSOS.forEach(p => { if (!RUTES.has(p.ruta)) bad(`el pas ${p.n} obre la ruta «${p.ruta}», que no és a MODAL_ROUTES`); });
const BLOG = readFileSync(join(SOS, 'blog.html'), 'utf8');
POSTS.forEach(p => { if (!BLOG.includes(`id="${p.anc}"`)) bad(`el blog no té cap entrada «${p.anc}»`); });
EIXOS.forEach(e => {
  const d = e.on[1];
  if (/^https?:/.test(d) || d.startsWith('#')) return;
  const f = d.split('#')[0];
  if (!existsSync(join(SOS, f))) bad(`l'eix «${e.nom}» apunta a ${f}, que no existeix`);
  const r = d.split('#/')[1];
  if (r && !RUTES.has(r)) bad(`l'eix «${e.nom}» obre la ruta «${r}», que no és a MODAL_ROUTES`);
});
/* ── El guió de la intro ────────────────────────────────────────────────────
   Les mateixes regles que la resta, més dues que només valen per a un guió:
   que els segons quadrin —un guió que diu que dura un minut i mig i en dura
   dos no serveix per encarregar-lo— i que la peça citada a `de` existeixi de
   debò, perquè «ja ho tenim filmat» és la frase que fa que després no es
   filmi. */
const idsVideo = new Set(VIDEOS.map(v => v.id));
INTRO.plans.forEach(p => {
  p.qui.filter(n => !noms.has(n)).forEach(n =>
    bad(`el pla ${p.n} de la intro anomena ${n}, que no és ni al roster, ni als aliats, ni als vilans`));
  if (p.de && !idsVideo.has(p.de)) bad(`el pla ${p.n} de la intro surt de «${p.de}», que no és cap peça de VIDEOS`);
  /* Una peça sense enllaç no pot fer de material existent: seria dir que un pla
     està resolt quan el que hi ha és el nom d'una cosa que encara no s'ha fet. */
  if (p.de) {
    const v = VIDEOS.find(x => x.id === p.de);
    if (v && !v.url) bad(`el pla ${p.n} surt de «${v.titol}», que encara no té enllaç: no pot fer de material existent`);
  }
  if (p.retol && /[!¡]/.test(p.retol)) bad(`el rètol del pla ${p.n} porta exclamació, i la guia de marca no en vol als titulars`);
  /* La veu en off diu xifres amb lletra —«catorze», «cent cinquanta mil»— i una
     xifra amb lletra no la troba cap cerca ni cap altra guarda. `diu` és la
     mateixa xifra en número perquè es pugui comparar amb la font: el dia que
     l'objectiu o el roster canviïn, això peta i el guió es corregeix. Sense
     això, el text seguiria dient el número vell amb tota la naturalitat. */
  if (p.diu && p.diu.herois !== undefined && p.diu.herois !== HEROIS.length)
    bad(`el pla ${p.n} diu ${p.diu.herois} herois canònics i n'hi ha ${HEROIS.length}`);
  if (p.diu && p.diu.objectiu !== undefined && p.diu.objectiu !== OBJECTIU)
    bad(`el pla ${p.n} diu un objectiu de ${p.diu.objectiu} i COMANDO_TARGET és ${OBJECTIU}`);
});
const segons = INTRO.plans.reduce((a, p) => a + p.s, 0);
if (segons !== INTRO.durada) bad(`la intro diu que dura ${INTRO.durada} s i els plans en sumen ${segons}`);
const segonsTall = INTRO.plans.filter(p => p.tall).reduce((a, p) => a + p.s, 0);
if (segonsTall !== INTRO.tall) bad(`el tall diu que dura ${INTRO.tall} s i els plans triats en sumen ${segonsTall}`);
const ctes = INTRO.plans.filter(p => p.cta);
if (ctes.length !== 1) bad(`la intro té ${ctes.length} plans de crida i n'ha de tenir un`);
else if (ctes[0] !== INTRO.plans[INTRO.plans.length - 1]) bad('el pla de crida de la intro no és l\'últim');
/* El tall ha d'acabar on acaba la intro: una versió curta que es queda sense
   la crida és un anunci que no diu què fer després. */
if (ctes.length === 1 && !ctes[0].tall) bad('el tall de 30 s es queda sense el pla de crida');
if (!RUTES.has(INTRO.cta.principal.ruta))
  bad(`la crida de la intro obre la ruta «${INTRO.cta.principal.ruta}», que no és a MODAL_ROUTES`);
if (!existsSync(join(SOS, INTRO.cta.segona.href)))
  bad(`la segona crida de la intro apunta a ${INTRO.cta.segona.href}, que no existeix`);

if (fails) { console.log(`\n❌ ${fails} ${fails === 1 ? 'problema' : 'problemes'} a la declaració del Comando.`); process.exit(1); }

/* ══ L'HTML ══════════════════════════════════════════════════════════════════ */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mil = n => n.toLocaleString('ca-ES').replace(/ /g, '.');

const htmlEixos = () =>
  `<div class="eixos">\n` + EIXOS.map(e =>
    `  <div class="eix"><div class="eix-ic">${e.ic}</div>` +
    `<div class="eix-n">${esc(e.nom)}</div>` +
    `<p class="eix-q">${esc(e.que)}</p>` +
    `<a class="eix-on" href="${e.on[1]}">${esc(e.on[0])} →</a></div>`).join('\n') + `\n</div>`;

const htmlPassos = () =>
  `<div class="passos">\n` + PASSOS.map(p =>
    `  <div class="pas"><div class="pas-n">${p.n}</div>` +
    `<div class="pas-t">${p.ic} ${esc(p.t)}</div>` +
    `<p class="pas-d">${p.d}</p>` +
    `<a class="pas-cta" href="index.html#/${p.ruta}">${esc(p.cta)} →</a></div>`).join('\n') +
  `\n</div>\n<a class="decorat" href="${DECORAT.href}"><span class="dec-ic">🏘</span>` +
  `<span><strong>I el poble on passa és ${esc(DECORAT.t)}.</strong> ${esc(DECORAT.d)}</span>` +
  `<span class="dec-fl">→</span></a>`;

const MENA_LBL = { llista: 'La sèrie', videoclip: 'Videoclip', tema: 'Tema', directe: 'Directe' };
const htmlVideos = () => {
  const fitxa = v => {
    const cap = `<div class="vid-mena">${MENA_LBL[v.mena] || esc(v.mena)}</div>` +
      `<div class="vid-t">${esc(v.titol)}</div><p class="vid-d">${esc(v.d)}</p>`;
    if (v.url) {
      const fora = /^https?:/.test(v.url);
      /* La llista es destaca perquè avui és la porta que porta més lluny: si
         es pinta igual que les altres, queda una targeta més entre vuit i qui
         busca els capítols no la troba. */
      const cls = v.mena === 'llista' ? 'vid vid-llista' : 'vid';
      return `  <a class="${cls}" href="${v.url}"${fora ? ' target="_blank" rel="noopener"' : ''}>${cap}` +
        `<span class="vid-go">▶ ${v.mena === 'llista' ? 'Mira la sèrie' : 'Mira-ho'}</span></a>`;
    }
    return `  <div class="vid vid-buit">${cap}<span class="vid-no">Encara no en tenim l'enllaç</span></div>`;
  };
  const falten = VIDEOS.filter(v => !v.url).length;
  return `<div class="vids">\n` + VIDEOS.map(fitxa).join('\n') + `\n</div>\n` +
    /* La nota diu «no tenen enllaç públic» i no «estan filmades»: si ho estan
       o no, ho sap l'autor i no aquest fitxer. Escriure-hi el que no se sap és
       la mateixa mentida amable que un «pròximament». */
    (falten ? `<p class="vids-nota">De les ${VIDEOS.length} peces que el projecte preveu, ` +
      `<strong>${falten} encara no tenen enllaç públic</strong>. Surten aquí perquè es vegi què hi ha i ` +
      `què falta — no com una promesa amb un enllaç que no obre: el dia que en tinguem l'adreça, ` +
      `aquesta mateixa targeta s'obre.</p>` : '');
};

const htmlPosts = () =>
  `<div class="posts">\n` + POSTS.map(p =>
    `  <a class="post" href="blog.html#${p.anc}"><span class="post-ic">${p.ic}</span>` +
    `<span><span class="post-t">${esc(p.t)}</span>` +
    `<span class="post-d">${esc(p.d)}</span></span></a>`).join('\n') + `\n</div>`;

/* Les fitxes d'heroi. El `hue` surt del nom perquè el mateix personatge tingui
   sempre el mateix color aquí i a l'app, que fa el mateix amb `_colorFromName`. */
const hue = nom => { let h = 0; for (const c of nom) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
const inicials = nom => nom.split(/[\s-]+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();

const htmlHerois = () => {
  /* La peça que s'ensenya a la fitxa d'un heroi: el seu videoclip si en té,
     i si no, el seu tema. Amb `find` a seques sortia la primera declarada,
     que no és la que la gent busca quan mira un personatge. */
  const vidDe = n => VIDEOS.find(v => v.url && v.mena === 'videoclip' && v.qui.includes(n))
    || VIDEOS.find(v => v.url && v.qui.includes(n));
  return `<div class="heroes" style="text-align:left">\n` + HEROIS.map(h => {
    const v = vidDe(h.name);
    return `<div class="hcard">\n` +
      `<div class="hcard-head"><div class="hcard-avatar" style="background:hsl(${hue(h.name)},62%,44%)">${esc(inicials(h.name))}</div>\n` +
      `<div><div class="hcard-nm">${esc(h.name)}</div><div class="hcard-role">${esc(h.role)}</div></div></div>\n` +
      `<div class="hcard-power">${esc(h.power)}</div>\n` +
      (h.arma ? `<div class="hcard-arma"><span>Superarma</span> ${esc(h.arma)}</div>\n` : '') +
      (h.lletra ? `<div class="hcard-lletra">${esc(h.lletra)}</div>\n` : '') +
      `<div class="hcard-vna"><span>A un equip</span> ${esc(h.vna)}</div>\n` +
      `<div><span class="hfont">${esc(h.on)}</span>` +
      (v ? ` <a class="hfont hfont-go" href="${v.url}">▶ ${esc(MENA_LBL[v.mena] || v.mena)}</a>` : '') +
      `</div>\n</div>`;
  }).join('\n') + `\n</div>`;
};

const htmlComptador = () =>
  `<div class="counter">\n` +
  `<div class="item"><div class="n">${mil(OBJECTIU)}</div><div class="l">coprotagonistes</div></div>\n` +
  `<div class="item"><div class="n">${HEROIS.length}</div><div class="l">herois canònics</div></div>\n` +
  `<div class="item"><div class="n">2</div><div class="l">còmics publicats</div></div>\n` +
  `</div>`;

/* ══ ESCRIPTURA ══════════════════════════════════════════════════════════════ */
const BLOCS = [
  ['<!--CM-COMPTADOR-->', '<!--/CM-COMPTADOR-->', htmlComptador],
  ['<!--CM-EIXOS-->', '<!--/CM-EIXOS-->', htmlEixos],
  ['<!--CM-PASSOS-->', '<!--/CM-PASSOS-->', htmlPassos],
  ['<!--CM-VIDEOS-->', '<!--/CM-VIDEOS-->', htmlVideos],
  ['<!--CM-HEROIS-->', '<!--/CM-HEROIS-->', htmlHerois],
  ['<!--CM-POSTS-->', '<!--/CM-POSTS-->', htmlPosts]
];

function posa(html) {
  for (const [obre, tanca, fn] of BLOCS) {
    const i = html.indexOf(obre), k = html.indexOf(tanca);
    if (i < 0 || k < i) return { err: `hi falten les marques ${obre} … ${tanca}` };
    html = html.slice(0, i) + obre + '\n' + fn() + '\n' + html.slice(k);
  }
  return { html };
}

/* El document del projecte. Serveix per a dues coses que la pàgina no fa: dir
   què falta per filmar en una llista que es pot passar a algú, i deixar
   escrita la tesi perquè no s'hagi de reconstruir llegint HTML. */
const md = () => `# Comando Molekulon · el projecte de pel·lícula

> Generat per \`SOS/tools/build-comando.js\`. No l'editis a mà: edita el generador.

## La tesi

**${TESI.titol}.** ${TESI.sub.replace(/<[^>]+>/g, '')}

## Els sis eixos

| Eix | Què vol dir | On es fa |
|---|---|---|
${EIXOS.map(e => `| ${e.ic} ${e.nom} | ${e.que} | ${e.on[0]} (\`${e.on[1]}\`) |`).join('\n')}

## Com hi entra una persona

${PASSOS.map(p => `${p.n}. **${p.t}** — ${p.d.replace(/<[^>]+>/g, '')} → \`index.html#/${p.ruta}\``).join('\n')}

I el decorat és **${DECORAT.t}** (\`${DECORAT.href}\`).

## Els ${HEROIS.length} herois canònics

${HEROIS.map(h => `- **${h.name}** · ${h.role} — ${h.vna} _(${h.on})_`).join('\n')}

## Mitjans · què hi ha i què falta

| Peça | Mena | Qui | Estat |
|---|---|---|---|
${VIDEOS.map(v => `| ${v.titol} | ${MENA_LBL[v.mena] || v.mena} | ${v.qui.join(', ') || '—'} | ${v.url ? '`' + v.url + '`' : '**falta l\'enllaç**'} |`).join('\n')}

${VIDEOS.filter(v => !v.url).length
    ? `**Pendent d'enllaç:** ${VIDEOS.filter(v => !v.url).map(v => v.titol).join(', ')}. ` +
      'Mentre no hi siguin, la pàgina els ensenya dient que encara no hi són — no com una porta tancada.'
    : 'Totes les peces tenen enllaç.'}

## El blog del Comando

${POSTS.map(p => `- [${p.t}](../blog.html#${p.anc}) — ${p.d}`).join('\n')}
`;

/* L'esborrany del guió. És un document i no una pàgina a posta: el que ha de
   passar ara és que l'autor el corregeixi, i un text que es llegeix sencer en
   dos minuts es corregeix; una pantalla amb el guió a dins, no.

   Els codis de temps no s'escriuen: es compten. Escrits a mà, el dia que un pla
   creixi dos segons quedaran onze codis dient una altra cosa i ningú ho veurà
   fins que algú intenti muntar-ho. */
const mmss = t => `${t / 60 | 0}:${String(t % 60).padStart(2, '0')}`;
const mdIntro = () => {
  let t = 0;
  const files = INTRO.plans.map(p => {
    const de = t; t += p.s;
    const font = p.de ? `[${(VIDEOS.find(v => v.id === p.de) || {}).titol}](${(VIDEOS.find(v => v.id === p.de) || {}).url})` : '**a filmar**';
    return `| ${p.n} | ${mmss(de)}–${mmss(t)} | ${p.titol} | ${p.img} | «${p.veu}» | ${p.retol || '—'} | ${font} |`;
  });
  const aFilmar = INTRO.plans.filter(p => !p.de);
  const teniu = INTRO.plans.filter(p => p.de);
  return `# Comando Molekulon · la intro · **esborrany de guió**

> Generat per \`SOS/tools/build-comando.js\`. No l'editis a mà: edita el generador.
>
> **Això és un esborrany.** La veu en off, els noms i l'ordre són una proposta
> per corregir, no un guió tancat. El que hi falta ho sap l'autor i no el codi.

## Per què una intro pròpia

\`SOS/intro.html\` és una pel·lícula de setze plans que ja existeix i està bé,
però **explica el SOS**: el problema dels projectes ciutadans i l'eina que hi
posa esquelet. Feia de portada del Comando per manca d'una altra. Una intro que
explica l'eina no presenta la història.

Aquesta presenta el Comando i acaba demanant una cosa concreta.

## El guió · ${INTRO.plans.length} plans, ${mmss(INTRO.durada)}

| # | Temps | Pla | Imatge | Veu en off | Rètol | D'on surt |
|---|---|---|---|---|---|---|
${files.join('\n')}

## Què hi ha filmat i què s'ha de filmar

- **${teniu.length} plans surten de material que ja existeix**: ${teniu.map(p => `pla ${p.n} (${(VIDEOS.find(v => v.id === p.de) || {}).titol})`).join(', ')}.
- **${aFilmar.length} plans s'han de fer**: ${aFilmar.map(p => `${p.n} · ${p.titol}`).join(' · ')}.

Dels que s'han de fer, els plans 10 i 11 són captura de pantalla de l'aplicació
—es poden gravar avui— i la resta són rodatge de carrer.

## El tall de ${INTRO.tall} s

No és un guió a part: és una tria de plans d'aquest —els ${INTRO.plans.filter(p => p.tall).map(p => p.n).join(', ')}—
i acaba igual, amb la crida. Una versió curta que es queda sense dir què fer
després és un anunci de res.

## Com acaba: les dues portes

| Porta | On va | Per a qui |
|---|---|---|
| **${INTRO.cta.principal.t}** | \`index.html#/${INTRO.cta.principal.ruta}\` | ${INTRO.cta.principal.d} |
| **${INTRO.cta.segona.t}** | \`${INTRO.cta.segona.href}\` | ${INTRO.cta.segona.d} |

Dues i no una: qui arriba al final d'una intro de minut i mig no hi arriba amb
les mateixes ganes, i una sola crida deixa fora la meitat.

## El que aquesta intro no diu

**Com acaba la història.** El final del Comando no és en aquest repositori i no
hi ha d'entrar per un guió.
`;
};

const fPag = join(SOS, 'comando.html');
const fMd = join(SOS, 'knowledge', 'vision', 'comando-peli.md');
const fIntro = join(SOS, 'knowledge', 'vision', 'comando-intro.md');

if (CHECK) {
  console.log('\nGuarda del Comando · la pàgina surt de les llistes declarades');
  let mal = 0;
  const pagina = readFileSync(fPag, 'utf8');
  const r = posa(pagina);
  if (r.err) { mal++; console.log(`  ✗ a comando.html ${r.err}`); }
  else if (r.html !== pagina) { mal++; console.log('  ✗ comando.html està vell: corre `node SOS/tools/build-comando.js`'); }
  else console.log(`  ✓ els ${BLOCS.length} blocs de comando.html quadren amb el generador`);
  if (!existsSync(fMd) || readFileSync(fMd, 'utf8') !== md()) {
    mal++; console.log('  ✗ knowledge/vision/comando-peli.md està vell: corre `node SOS/tools/build-comando.js`');
  } else console.log('  ✓ i el document del projecte també');
  if (!existsSync(fIntro) || readFileSync(fIntro, 'utf8') !== mdIntro()) {
    mal++; console.log('  ✗ knowledge/vision/comando-intro.md està vell: corre `node SOS/tools/build-comando.js`');
  } else console.log(`  ✓ i el guió de la intro (${INTRO.plans.length} plans, ${mmss(INTRO.durada)})`);
  console.log(mal ? `\n❌ ${mal} ${mal === 1 ? 'problema' : 'problemes'}.` : '\n✅ El Comando quadra.');
  process.exit(mal ? 1 : 0);
}

const pagina = readFileSync(fPag, 'utf8');
const r = posa(pagina);
if (r.err) { console.log(`✗ a comando.html ${r.err}`); process.exit(1); }
if (r.html !== pagina) writeFileSync(fPag, r.html);
writeFileSync(fMd, md());
writeFileSync(fIntro, mdIntro());
console.log(`✅ Comando escrit · ${BLOCS.length} blocs, ${HEROIS.length} herois, ${EIXOS.length} eixos, ` +
  `${PASSOS.length} passos, ${VIDEOS.length} peces (${VIDEOS.filter(v => !v.url).length} sense enllaç) i ${POSTS.length} entrades del blog`);
console.log(`   i el guió de la intro · ${INTRO.plans.length} plans, ${mmss(INTRO.durada)}, ` +
  `${INTRO.plans.filter(p => !p.de).length} per filmar`);

module.exports = { TESI, EIXOS, PASSOS, VIDEOS, POSTS, DECORAT, INTRO };
