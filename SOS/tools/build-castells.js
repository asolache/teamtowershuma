#!/usr/bin/env node
/* La pinya, de dalt i de costat · les línies de força d'una organització
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠ CORRECCIÓ. La primera versió d'aquest fitxer deia «rengla» a les columnes
 * del tronc. **És fals.** Una rengla no és vertical: és a la **pinya**, i és la
 * filera de gent que es posa **darrere de cada baix**, cap enfora, en línia
 * recta. Les rengles no es veuen mirant un castell de front — es veuen mirant
 * la pinya **des de dalt**. L'error no era de nom: era de dimensió, i es
 * carregava justament el que fa que això valgui per a una organització.
 *
 * ── L'ANATOMIA, I D'ON SURT ─────────────────────────────────────────────────
 * **Rengla** és el nom genèric de cada filera radial de la pinya. N'hi ha de
 * tres menes, i es diuen pel nom de la mà que les encapçala:
 *
 *   · **Primeres mans** — darrere el contrafort. Subjecten el segon per
 *                          darrere, apuntalant-lo per les natges. N de N.
 *   · **Laterals**      — darrere les crosses. Amb els braços estirats,
 *                          subjecten les cuixes dels segons pels costats. 2N.
 *   · **Vents**         — entre crossa i crossa, és a dir **entre dos pilars**:
 *                          amb una mà agafen un pilar i amb l'altra, l'altre. N.
 *
 * D'aquí surt la regla que ho fa servir tot: **una pinya de N baixos obre 4N
 * rengles.** Un dos n'obre 8 (2 primeres mans, 2 vents, 4 laterals); un tres,
 * dotze (3, 3, 6); **un quatre, setze** (4, 4, 8); un cinc, vint.
 *
 * Que un quatre n'obri setze no és una casualitat bonica: és el que fa que un
 * instrument de setze factors càpiga exactament en una planta de castell de
 * quatre, un factor per rengla.
 *
 * ── EL VENT, QUE ÉS EL QUE CANVIA LA LECTURA ────────────────────────────────
 * La primera versió d'aquest fitxer tractava el vent com a farciment: «omple i
 * estabilitza, no és per carregar-hi». **És al revés del que importa.** El vent
 * és l'únic que agafa **dues columnes alhora** —una mà a cadascuna— i per això
 * és l'únic que impedeix que se separin.
 *
 * Traduït a una casa: la primera mà sosté una àrea per darrere, el lateral la
 * reforça pel costat, i **el vent és l'única persona que toca dues àrees a la
 * vegada**. Una planta amb els vents buits no és una planta fluixa: és una casa
 * amb àrees que no es toquen —que és com es diu «silos» sense dir-ho—, i es veu
 * de cop mirant-la des de dalt.
 *
 * ── D'on surt aquesta anatomia ──────────────────────────────────────────────
 * Del glossari de termes castellers i de la descripció d'estructures de
 * `castellscat.cat` i la Viquipèdia, consultats l'01/10/2026, i **corregida per
 * l'Àlvar**, que va ser qui va dir que el vent va entre dues rengles i agafa
 * una mà de cadascun dels segons — que és exactament el que diu la font i el
 * contrari del que aquest fitxer deia.
 *
 * ── LES DUES DIMENSIONS, QUE ÉS EL QUE ES DEMANAVA ──────────────────────────
 * **Horitzontal · la planta.** Mirada des de dalt: quantes direccions té oberta
 * la casa i quanta fondària té cadascuna. És on es posa la variable —els setze
 * factors, les deu aportacions, els àmbits— i és el que fins ara no es podia
 * dibuixar.
 *
 * **Vertical · l'alçat.** El tronc: quants pisos s'intenta aguantar. És
 * l'ambició, i és la part que tothom mira.
 *
 * **I la llei que les lliga, que és el que es ven:** en castells no es guanya
 * alçada sense guanyar base. Un 4 de 8 demana folre; un de 9, folre i manilles.
 * La pinya creix més de pressa que el tronc. En una organització és igual:
 * **cada pis d'ambició que s'afegeix demana més direccions obertes, no més gent
 * a la mateixa direcció.** Qui creix el tronc i deixa la planta igual no cau
 * per dalt: cau perquè a baix no hi havia prou gent.
 *
 * ── I la lectura que només es pot fer amb les dues alhora ───────────────────
 * Una direcció amb molta càrrega **sobre un vent** és un risc: molta força per
 * una línia fluixa. Amb la planta sola no es veu, perquè la fondària es llegeix
 * igual a tot arreu; amb l'alçat sol tampoc, perquè l'alçat no sap de
 * direccions. Es veu creuant-les, i és la raó per la qual les dues vistes van
 * juntes i no en dues pantalles.
 *
 * ── La regla que no es pot trencar ──────────────────────────────────────────
 * **Això ordena i fa visible, no puntua.** Un castell no diu si una casa va bé;
 * diu on es concentra el pes i quines direccions té tancades. Cap figura hi
 * entra sense dir què vol dir en una organització, i cap xifra d'euros.
 *
 * ── Ús ──────────────────────────────────────────────────────────────────────
 *   node SOS/tools/build-castells.js            escriu el bloc
 *   node SOS/tools/build-castells.js --check    falla si està vell o incoherent
 */
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const HOME = join(ARREL, 'index.html');
const CHECK = process.argv.includes('--check');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

/* ══ LES MENES DE LÍNIA ══════════════════════════════════════════════════════
   `quantes(n)` diu quantes n'obre una pinya de n baixos, i `pes` és quanta
   càrrega aguanta aquella mena. El `pes` no és decoració: és el que permet dir
   que una direcció carregada sobre un vent és un risc. */
const MENES = [
  { id: 'primera', nom: 'Primeres mans', nomEs: 'Primeras manos', quantes: n => n, toca: 1, gruix: 3.2, op: 1,
    diu: 'Darrere el contrafort. Subjecten el segon per darrere: és el suport directe d\'una àrea.',
    diuEs: 'Detrás del contrafort. Sujetan al segon por detrás: es el soporte directo de un área.' },
  { id: 'lateral', nom: 'Laterals', nomEs: 'Laterales', quantes: n => 2 * n, toca: 1, gruix: 2, op: .75,
    diu: 'Darrere les crosses, amb els braços estirats, subjecten les cuixes pels costats. Reforcen una àrea de costat.',
    diuEs: 'Detrás de las crosses, con los brazos estirados, sujetan los muslos por los lados. Refuerzan un área de lado.' },
  { id: 'vent', nom: 'Vents', nomEs: 'Vents', quantes: n => n, toca: 2, gruix: 2.4, op: .9,
    diu: 'Entre crossa i crossa: una mà a cada pilar. Són els únics que toquen dues àrees alhora i eviten que se separin.',
    diuEs: 'Entre crossa y crossa: una mano en cada pilar. Son los únicos que tocan dos áreas a la vez y evitan que se separen.' }
];
/* El vent va de taronja i no de gris: no és farciment, és l'única línia que
   lliga dues columnes, i el color ho ha de dir abans que el text.
   Els colors vénen de la paleta (`build-pell.js`) i no d'aquí: un traç és un
   objecte gràfic i necessita 3:1 contra el fons, i els accents vius d'abans
   —el verd #00e676 feia 1,6:1 sobre paper— no es veien a la pell clara.
   Declarats un sol cop, el dia que la paleta canviï els dibuixos van amb ella. */
const COL_MENA = { primera: 'var(--indigo)', lateral: 'var(--green)', vent: 'var(--orange)' };

/* ══ LES CONSTRUCCIONS ═══════════════════════════════════════════════════════
   `baixos` és l'amplada del tronc i és el que mana: d'ell en surten les 4N
   direccions de la planta. `pisos` és l'alçada que s'intenta. */
const FIGURES = [
  {
    id: 'pilar', nom: 'El pilar', nomEs: 'El pilar', baixos: 1, pisos: 4, pinya: 9, pom: 2,
    quan: 'Tot passa per una sola àrea.',
    quanEs: 'Todo pasa por una sola área.',
    diu: 'Quatre rengles i una sola primera mà. És la figura més alta per quanta gent té a sota i la que cau més de pressa: si falla una persona, no hi ha ningú al costat que reculli el pes. A una casa, és el projecte que s\'aguanta perquè hi ha algú que no plega mai.',
    diuEs: 'Cuatro rengles y una sola primera mano. Es la figura más alta para la gente que tiene debajo y la que cae más rápido: si falla una persona, no hay nadie al lado que recoja el peso. En una casa, es el proyecto que se aguanta porque hay alguien que no falla nunca.'
  },
  {
    id: 'torre', nom: 'La torre · el 2', nomEs: 'La torre · el 2', baixos: 2, pisos: 5, pinya: 16, pom: 2,
    quan: 'Dues àrees que depenen l\'una de l\'altra i no tenen tercera.',
    quanEs: 'Dos áreas que dependen una de la otra y no tienen tercera.',
    diu: 'Vuit rengles, dues primeres mans i dos vents que les lliguen. Guanya estabilitat i estrena una fragilitat nova: si una de les dues va tard, l\'altra no pot compensar-ho, només esperar. És el clàssic «comercial i producció» quan no hi ha ningú entremig.',
    diuEs: 'Ocho rengles, dos primeras manos y dos vents que las unen. Gana estabilidad y estrena una fragilidad nueva: si una de las dos va tarde, la otra no puede compensarlo, solo esperar. Es el clásico «comercial y producción» cuando no hay nadie en medio.'
  },
  {
    id: 'tres', nom: 'El 3', nomEs: 'El 3', baixos: 3, pisos: 5, pinya: 28, pom: 3,
    quan: 'Tres àmbits que es reparteixen la feina.',
    quanEs: 'Tres ámbitos que se reparten el trabajo.',
    diu: 'Dotze rengles: tres primeres mans, tres vents i sis laterals. Amb tres àrees el pes ja es reparteix de debò i una que vagi fluixa no tomba la figura: és la primera on pots perdre algú i seguir. La contrapartida és que calen tres caps que es parlin, i això no surt sol.',
    diuEs: 'Doce rengles: tres primeras manos, tres vents y seis laterales. Con tres áreas el peso ya se reparte de verdad y una que vaya flojo no tumba la figura: es la primera donde puedes perder a alguien y seguir. La contrapartida es que hacen falta tres cabezas que se hablen, y eso no sale solo.'
  },
  {
    id: 'quatre', nom: 'El 4', nomEs: 'El 4', baixos: 4, pisos: 5, pinya: 36, pom: 3,
    quan: 'Quatre àrees, que és on acaba la majoria de cases que creixen.',
    quanEs: 'Cuatro áreas, que es donde acaba la mayoría de casas que crecen.',
    diu: 'Setze rengles —quatre primeres mans, quatre vents i vuit laterals—, i per això és la planta on cap un instrument de setze factors sense forçar res. La més feta i per un motiu: reparteix prou i encara es pot coordinar. El problema d\'un 4 mai és l\'alçada — és que una de les quatre rengles vagi curta i ningú ho digui fins que es carrega el pis de dalt.',
    diuEs: 'Dieciséis rengles —cuatro primeras manos, cuatro vents y ocho laterales—, y por eso es la planta donde cabe un instrumento de dieciséis factores sin forzar nada. La más hecha y por un motivo: reparte bastante y todavía se puede coordinar. El problema de un 4 nunca es la altura — es que una de las cuatro rengles vaya corta y nadie lo diga hasta que se carga el piso de arriba.'
  },
  {
    id: 'cinc', nom: 'El 5', nomEs: 'El 5', baixos: 5, pisos: 5, pinya: 48, pom: 3,
    quan: 'Cinc àmbits o més, amb una planta que ha de créixer igual.',
    quanEs: 'Cinco ámbitos o más, con una planta que tiene que crecer igual.',
    diu: 'Vint rengles i una pinya molt més gran. Aquí és on les cases s\'equivoquen: creixen el tronc —més àrees, més caps— i deixen la base igual. El castell no cau per dalt: cau perquè a baix no hi havia prou gent.',
    diuEs: 'Veinte rengles y una pinya mucho más grande. Aquí es donde las casas se equivocan: crecen el tronco —más áreas, más cabezas— y dejan la base igual. El castell no cae por arriba: cae porque abajo no había bastante gente.'
  }
];

/* ══ LES VARIABLES ═══════════════════════════════════════════════════════════
   El que es posa a la planta. Cada dimensió ocupa una direcció i la seva
   `n` és la fondària: quanta gent hi ha en aquella línia.

   Això és el que es demanava del joc casteller: la mateixa figura, pintada per
   una altra cosa, i la distribució es veu d'un cop sense llegir cap taula.

   `fig` diu en quina construcció cap: una variable de setze dimensions demana
   una planta que n'obri setze, i una guarda ho comprova. */
const VARIABLES = [
  {
    id: 'ambits', nom: 'Els àmbits de la casa', nomEs: 'Los ámbitos de la casa', fig: 'quatre', sobre: 'primera',
    quees: 'Les àrees que ja tens: qui ven, qui produeix, qui entrega, qui administra.',
    queesEs: 'Las áreas que ya tienes: quién vende, quién produce, quién entrega, quién administra.',
    llegeix: 'Els quatre àmbits van a les <b>primeres mans</b>, que és el seu lloc: el suport directe de cada àrea. I llavors es veu el que una llista d\'àrees no pot dir — <b>tot el que hi ha entre elles és buit</b>: ni laterals que les reforcin pel costat ni vents que les lliguin entre si. És una casa amb departaments i res més.',
    llegeixEs: 'Los cuatro ámbitos van a las <b>primeras manos</b>, que es su sitio: el soporte directo de cada área. Y entonces se ve lo que una lista de áreas no puede decir — <b>todo lo que hay entre ellas está vacío</b>: ni laterales que las refuercen por el lado ni vents que las aten entre sí. Es una casa con departamentos y nada más.',
    dims: [
      { nom: 'Qui ven', nomEs: 'Quién vende', n: 5 }, { nom: 'Qui produeix', nomEs: 'Quién produce', n: 4 },
      { nom: 'Qui entrega', nomEs: 'Quién entrega', n: 1 }, { nom: 'Qui administra', nomEs: 'Quién administra', n: 2 }
    ]
  },
  {
    id: 'aports', nom: 'El que cadascú hi posa', nomEs: 'Lo que cada uno pone', fig: 'tres', sobre: 'totes',
    quees: 'Les deu aportacions que el SOS ja fa servir per encaixar persones i rols.',
    queesEs: 'Las diez aportaciones que el SOS ya usa para encajar personas y roles.',
    llegeix: 'Dotze rengles i deu aportacions: <b>les dues que sobren són la lectura</b>. Una rengla buida no és un error de dibuix — és una casa que no sap qui li posa allò, i normalment no ho sap perquè no ho ha demanat mai.',
    llegeixEs: 'Doce rengles y diez aportaciones: <b>las dos que sobran son la lectura</b>. Una rengla vacía no es un error de dibujo — es una casa que no sabe quién le pone aquello, y normalmente no lo sabe porque no lo ha pedido nunca.',
    dims: [
      { nom: 'Temps constant', nomEs: 'Tiempo constante', n: 6 },
      { nom: 'Ordre i seguiment', nomEs: 'Orden y seguimiento', n: 2 },
      { nom: 'Contactes al territori', nomEs: 'Contactos en el territorio', n: 4 },
      { nom: 'Un espai o un local', nomEs: 'Un espacio o un local', n: 1 },
      { nom: 'Vehicle i disponibilitat', nomEs: 'Vehículo y disponibilidad', n: 2 },
      { nom: 'Un ofici o producció', nomEs: 'Un oficio o producción', n: 5 },
      { nom: 'Números i negociació', nomEs: 'Números y negociación', n: 1 },
      { nom: 'Cura i acollida', nomEs: 'Cuidado y acogida', n: 3 },
      { nom: 'Veu i difusió', nomEs: 'Voz y difusión', n: 4 },
      { nom: 'Posar-hi diners', nomEs: 'Poner dinero', n: 1 }
    ]
  },
  {
    id: 'setze', nom: 'Un instrument de setze factors', nomEs: 'Un instrumento de dieciséis factores', fig: 'quatre', sobre: 'totes',
    quees: 'Setze dimensions de perfil, una per direcció. És el cas que va encendre això: posar el grup sobre la planta i veure la distribució de cop.',
    queesEs: 'Dieciséis dimensiones de perfil, una por dirección. Es el caso que encendió esto: poner al grupo sobre la planta y ver la distribución de golpe.',
    llegeix: 'Setze factors en una taula no diuen res a ningú. A la planta es veu en mig segon <b>cap on s\'inclina l\'equip i quines rengles no cobreix</b>. I una cosa que la taula no pot dir: <b>què cau sobre els vents</b> —les quatre úniques posicions que toquen dues àrees alhora, i per tant els factors que decideixen si les àrees es parlen o no.',
    llegeixEs: 'Dieciséis factores en una tabla no dicen nada a nadie. En la planta se ve en medio segundo <b>hacia dónde se inclina el equipo y qué rengles no cubre</b>. Y una cosa que la tabla no puede decir: <b>qué cae sobre los vents</b> —las cuatro únicas posiciones que tocan dos áreas a la vez, y por tanto los factores que deciden si las áreas se hablan o no.',
    dims: [
      { nom: 'A', n: 5 }, { nom: 'B', n: 3 }, { nom: 'C', n: 4 }, { nom: 'E', n: 6 },
      { nom: 'F', n: 2 }, { nom: 'G', n: 5 }, { nom: 'H', n: 1 }, { nom: 'I', n: 3 },
      { nom: 'L', n: 2 }, { nom: 'M', n: 4 }, { nom: 'N', n: 1 }, { nom: 'O', n: 2 },
      { nom: 'Q1', n: 6 }, { nom: 'Q2', n: 1 }, { nom: 'Q3', n: 4 }, { nom: 'Q4', n: 2 }
    ]
  }
];

/* ══ LES DIRECCIONS D'UNA PLANTA ═════════════════════════════════════════════
   Rengles als angles principals, laterals a les bisectrius i vents entre una
   cosa i l'altra. Surten ordenades per angle, que és com es recorren mirant la
   planta: així la dimensió i-èsima d'una variable cau a la direcció i-èsima. */
function direccions(n) {
  const d = [];
  const pas = 360 / n;
  for (let k = 0; k < n; k++) {
    const a = -90 + k * pas;
    d.push({ a, mena: 'primera' });                 // darrere el baix
    d.push({ a: a + pas / 4, mena: 'lateral' });    // darrere la crossa
    d.push({ a: a + pas / 2, mena: 'vent' });       // entre crossa i crossa
    d.push({ a: a + pas * 3 / 4, mena: 'lateral' }); // l'altra crossa
  }
  return d.sort((x, y) => x.a - y.a);
}

/* ══ ON CAU CADA DIMENSIÓ ════════════════════════════════════════════════════
   `sobre:'primera'` posa les dimensions només a les primeres mans —és el que
   toca quan les dimensions són àrees de la casa, perquè una àrea es sosté per
   darrere— i deixa la resta de rengles buides a posta: aquell buit és la
   lectura. `sobre:'totes'` les reparteix per totes les rengles en ordre
   d'angle, que és com es recorre una planta mirant-la. */
function repartiment(f, v) {
  const dirs = direccions(f.baixos);
  const quines = v.sobre === 'primera' ? dirs.filter(d => d.mena === 'primera') : dirs;
  const mapa = new Map();
  v.dims.forEach((d, k) => { if (quines[k]) mapa.set(dirs.indexOf(quines[k]), d); });
  return { dirs, mapa, caben: quines.length };
}

/* ══ ELS ROLS ARQUETÍPICS ════════════════════════════════════════════════════
   Qui ha fet el taller surt sabent posar nom als rols de casa seva —«el meu
   dos», «el meu terç lateral»— i això era **el producte que no es podia
   comprar**, perquè el vocabulari no existia escrit enlloc. Vivia escampat:
   tres noms a `MENES`, tres més escrits a mà dins del dibuix de la colla, i la
   resta a cap lloc.

   Cada posició diu quatre coses, i la que importa és la segona: **què és això
   en una casa**. Una posició que només digui què fa en un castell és folklore,
   i una guarda ho peta.

   `fn` és el pont cap al SOS: vuit de les posicions ocupen les vuit funcions
   que l'aplicació ja fa servir a `ARCHETYPE_SETS` (`metaskill`, `design`,
   `coord`, `audit`, `exec`, `facil`, `lms`, `fund`), i per això un joc
   d'arquetips castellers hi entra sense tocar res més. Les que no en porten no
   són menys importants: són posicions d'estructura que no es corresponen amb
   una funció d'organització, i inventar-los-hi una seria pitjor que deixar-les
   sense.

   `aport` és l'altra banda del pont: quina de les deu aportacions que el SOS ja
   demana (`APORTS`) encaixa amb aquella posició. Es declara amb el nom tal com
   el diu el SOS, i una guarda comprova que existeixi. */
/* ══ EL PANTEÓ DE 12, PER FONAMENTAR LA TRADUCCIÓ ═══════════════════════════
   La columna «a una casa» era una frase per posició, i una frase no és un nom.
   El que fa útil el taller és que algú surti dient **«tu ets el meu dos, tu el
   meu terç lateral»**, i per dir-ho el rol de l'organització ha de **tenir
   nom**. Ara cada posició en porta un, amb exemples concrets perquè una casa
   s'hi reconegui sense haver de traduir res.

   I no estan triats a ull. Cada posició s'ancora a un dels **dotze arquetips de
   Pantheon.work** (`SOS/knowledge/references/pantheon-12.md`, CC BY), que són
   dotze preguntes que qualsevol organització ha de saber respondre. L'arquetip
   diu **de quina pregunta és resposta aquella posició**, i és el que fa que el
   nom encaixi amb el cas de qui el llegeix i no amb el nostre.

   **Dionís no hi surt**, i és una troballa i no un oblit: la celebració no té
   posició al castell perquè no la fa ningú en concret —la fa la colla sencera
   quan el castell és descarregat—. A una organització passa igual, i és
   justament el que ningú té assignat. */
const PANTEO = {
  zeus: { ic: '⚡', nom: 'Zeus', q: 'Com prenem les decisions i com repartim el valor',
    qEs: 'Cómo tomamos las decisiones y cómo repartimos el valor' },
  hera: { ic: '👑', nom: 'Hera', q: 'Com generem confiança i compromís',
    qEs: 'Cómo generamos confianza y compromiso' },
  posido: { ic: '🌊', nom: 'Posidó', q: 'Com sostenim la tensió del canvi',
    qEs: 'Cómo sostenemos la tensión del cambio' },
  demeter: { ic: '🌾', nom: 'Demèter', q: 'Com generem valor i en tenim cura',
    qEs: 'Cómo generamos valor y lo cuidamos' },
  atenea: { ic: '🦉', nom: 'Atenea', q: 'Com protegim el nostre flux de valor',
    qEs: 'Cómo protegemos nuestro flujo de valor' },
  apollo: { ic: '📚', nom: 'Apol·lo', q: 'Com estructurem el que sabem',
    qEs: 'Cómo estructuramos lo que sabemos' },
  hebe: { ic: '🍶', nom: 'Hebe', q: 'Com resolem la intendència',
    qEs: 'Cómo resolvemos la intendencia' },
  dionis: { ic: '🍇', nom: 'Dionís', q: 'Com celebrem el que surt bé',
    qEs: 'Cómo celebramos lo que sale bien' },
  afrodita: { ic: '💗', nom: 'Afrodita', q: 'Com es veu el valor que aportem',
    qEs: 'Cómo se ve el valor que aportamos' },
  hefest: { ic: '🔨', nom: 'Hefest', q: 'Amb quin ofici i quines eines produïm',
    qEs: 'Con qué oficio y qué herramientas producimos' },
  hermes: { ic: '🪽', nom: 'Hermes', q: 'Com connectem les persones',
    qEs: 'Cómo conectamos a las personas' },
  hestia: { ic: '🔥', nom: 'Hèstia', q: 'Com acollim i sostenim els espais',
    qEs: 'Cómo acogemos y sostenemos los espacios' }
};

const POSICIONS = [
  { id: 'baix', nom: 'Baix', nomEs: 'Baix', on: 'tronc', pis: 1, fn: 'coord', aport: 'Temps constant',
    org: 'El que aguanta l\'àrea', orgEs: 'El que aguanta el área',
    ex: 'cap d\'operacions · responsable de producció · qui porta la cuina', exEs: 'jefe de operaciones · responsable de producción · quien lleva la cocina', arq: 'hefest',
    castell: 'A terra, sota el tronc, amb el pes de tot el castell a les espatlles. No es mou i no mira amunt.',
    castellEs: 'En el suelo, bajo el tronco, con el peso de todo el castell a los hombros. No se mueve y no mira arriba.',
    casa: 'Qui aguanta una àrea sencera i hi és sempre. Si plega, no cau el que fa ell: cau el que hi ha a sobre.',
    casaEs: 'Quien aguanta un área entera y está siempre. Si se va, no cae lo que hacía él: cae lo que hay encima.' },
  { id: 'crossa', nom: 'Crossa', nomEs: 'Crossa', on: 'pinya', fn: 'facil', aport: 'Cura i acollida',
    org: 'El suport que descarrega', orgEs: 'El apoyo que descarga',
    ex: 'administració que treu feina · el segon de cuina · qui cobreix les guàrdies', exEs: 'administración que quita trabajo · el segundo de cocina · quien cubre las guardias', arq: 'hebe',
    castell: 'Apuntala l\'espatlla del baix des del costat i li treu pes de sobre abans que es dobli.',
    castellEs: 'Apuntala el hombro del baix desde el lado y le quita peso antes de que se doble.',
    casa: 'Qui descarrega el que sosté una àrea just quan comença a anar-hi just. No fa la feina: fa que es pugui fer.',
    casaEs: 'Quien descarga a quien sostiene un área justo cuando empieza a ir apurado. No hace el trabajo: hace que se pueda hacer.' },
  { id: 'contrafort', nom: 'Contrafort', nomEs: 'Contrafort', on: 'pinya', fn: 'audit', aport: 'Ordre i seguiment',
    org: 'Qui mira que no es desviï', orgEs: 'Quien vigila que no se desvíe',
    ex: 'qualitat · control de gestió · qui porta el seguiment d\'un projecte', exEs: 'calidad · control de gestión · quien lleva el seguimiento de un proyecto', arq: 'atenea',
    castell: 'Darrere el baix, aguantant-lo per l\'esquena perquè no se li vagi enrere.',
    castellEs: 'Detrás del baix, aguantándolo por la espalda para que no se le vaya atrás.',
    casa: 'Qui mira que allò no es desviï i ho diu a temps. És la posició que ningú troba imprescindible fins que falta.',
    casaEs: 'Quien vigila que aquello no se desvíe y lo dice a tiempo. Es la posición que nadie encuentra imprescindible hasta que falta.' },
  { id: 'primera', nom: 'Primera mà', nomEs: 'Primera mano', on: 'pinya', mena: 'primera', fn: 'exec', aport: 'Un ofici o producció',
    org: 'Qui entrega', orgEs: 'Quien entrega',
    ex: 'el comercial que tanca · el tècnic que instal·la · qui fa la peça', exEs: 'el comercial que cierra · el técnico que instala · quien hace la pieza', arq: 'demeter',
    castell: 'Encapçala la rengla, darrere el contrafort, i subjecta el segon per darrere.',
    castellEs: 'Encabeza la rengla, detrás del contrafort, y sujeta al segon por detrás.',
    casa: 'El suport directe d\'una àrea: la persona que entrega el que aquella àrea ha promès.',
    casaEs: 'El soporte directo de un área: la persona que entrega lo que esa área ha prometido.' },
  { id: 'lateral', nom: 'Lateral', nomEs: 'Lateral', on: 'pinya', mena: 'lateral', aport: 'Temps constant',
    org: 'El reforç de costat', orgEs: 'El refuerzo de lado',
    ex: 'qui d\'una altra àrea sempre ajuda · l\'exsoci que encara agafa el telèfon · qui fa de pont amb un proveïdor', exEs: 'quien de otra área siempre ayuda · el exsocio que todavía coge el teléfono · quien hace de puente con un proveedor', arq: 'hestia',
    castell: 'Darrere les crosses, amb els braços estirats, subjecta les cuixes dels segons pels costats.',
    castellEs: 'Detrás de las crosses, con los brazos estirados, sujeta los muslos de los segons por los lados.',
    casa: 'Qui reforça una àrea de costat sense formar-ne part. No surt a cap factura i es nota el dia que no hi és.',
    casaEs: 'Quien refuerza un área de lado sin formar parte de ella. No sale en ninguna factura y se nota el día que no está.' },
  { id: 'vent', nom: 'Vent', nomEs: 'Vent', on: 'pinya', mena: 'vent', fn: 'metaskill', aport: 'Contactes al territori',
    org: 'Qui lliga dues àrees', orgEs: 'Quien ata dos áreas',
    ex: 'el cap de projecte entre producció i comercial · la tècnica que parla amb l\'ajuntament i amb les entitats', exEs: 'el jefe de proyecto entre producción y comercial · la técnica que habla con el ayuntamiento y con las entidades', arq: 'hermes',
    castell: 'Entre crossa i crossa: amb una mà agafa un pilar i amb l\'altra, l\'altre.',
    castellEs: 'Entre crossa y crossa: con una mano agarra un pilar y con la otra, el otro.',
    casa: 'L\'única posició que toca dues àrees alhora. Qui falta quan dues àrees «no es parlen», i la primera que ningú pressuposta.',
    casaEs: 'La única posición que toca dos áreas a la vez. Quien falta cuando dos áreas «no se hablan», y la primera que nadie presupuesta.' },
  { id: 'segon', nom: 'Segon', nomEs: 'Segon', on: 'tronc', pis: 2, fn: 'design', aport: 'Un ofici o producció',
    org: 'Qui converteix la decisió en feina', orgEs: 'Quien convierte la decisión en trabajo',
    ex: 'cap de projecte · coordinació d\'equip · qui fa el pla a partir del comitè', exEs: 'jefe de proyecto · coordinación de equipo · quien hace el plan a partir del comité', arq: 'apollo',
    castell: 'Primer pis sobre el baix. Ha de ser ferm i lleuger alhora: transmet avall tot el que rep de dalt.',
    castellEs: 'Primer piso sobre el baix. Tiene que ser firme y ligero a la vez: transmite abajo todo lo que recibe de arriba.',
    casa: 'Qui converteix una decisió en una cosa que es pot fer, i la torna a baix en forma de feina repartida.',
    casaEs: 'Quien convierte una decisión en algo que se puede hacer, y la devuelve abajo en forma de trabajo repartido.' },
  { id: 'terc', nom: 'Terç', nomEs: 'Tercio', on: 'tronc', pis: 3, aport: 'Vehicle i disponibilitat',
    org: 'El pis del mig', orgEs: 'El piso de en medio',
    ex: 'comandament intermedi · responsable d\'equip sense pressupost · encarregat de torn', exEs: 'mando intermedio · responsable de equipo sin presupuesto · encargado de turno', arq: 'posido',
    castell: 'Tercer pis. On el castell es decideix: ja és alt i encara ha de pujar gent per sobre.',
    castellEs: 'Tercer piso. Donde el castell se decide: ya es alto y todavía tiene que subir gente por encima.',
    casa: 'El pis del mig d\'una organització. Rep pressió de dalt i de baix i no té cap de les dues autoritats.',
    casaEs: 'El piso de en medio de una organización. Recibe presión de arriba y de abajo y no tiene ninguna de las dos autoridades.' },
  { id: 'aixecador', nom: 'Aixecador', nomEs: 'Aixecador', on: 'pom', fn: 'lms', aport: 'Cura i acollida',
    org: 'Qui fa pujar algú altre', orgEs: 'Quien hace subir a otro',
    ex: 'qui forma el relleu · la mentora · qui prepara qui el substituirà', exEs: 'quien forma el relevo · la mentora · quien prepara a quien le sustituirá', arq: 'hera',
    castell: 'Fa de frontissa del pom de dalt: s\'ajup perquè els altres passin i aixeca quan toca.',
    castellEs: 'Hace de bisagra del pom de arriba: se agacha para que los demás pasen y levanta cuando toca.',
    casa: 'Qui fa pujar algú altre. No és la seva figura la que es veu, i sense ell no hi ha pom.',
    casaEs: 'Quien hace subir a otro. No es su figura la que se ve, y sin él no hay pom.' },
  { id: 'enxaneta', nom: 'Enxaneta', nomEs: 'Enxaneta', on: 'pom', aport: 'Veu i difusió',
    org: 'La cara visible', orgEs: 'La cara visible',
    ex: 'qui presenta · qui recull el premi · la portaveu', exEs: 'quien presenta · quien recoge el premio · la portavoz', arq: 'afrodita',
    castell: 'Corona, fa l\'aleta i baixa. És a dalt tres segons i és la foto.',
    castellEs: 'Corona, hace la aleta y baja. Está arriba tres segundos y es la foto.',
    casa: 'Qui es veu. Dura poc a dalt, no aguanta res i és el que tothom recorda — i per això es confon amb el que ha fet el castell.',
    casaEs: 'Quien se ve. Dura poco arriba, no aguanta nada y es lo que todo el mundo recuerda — y por eso se confunde con quien ha hecho el castell.' },
  { id: 'cap', nom: 'Cap de colla', nomEs: 'Cap de colla', on: 'fora', fn: 'fund', aport: 'Números i negociació',
    org: 'Qui decideix què s\'intenta', orgEs: 'Quien decide qué se intenta',
    ex: 'direcció general · la propietat · el comitè que aprova', exEs: 'dirección general · la propiedad · el comité que aprueba', arq: 'zeus',
    castell: 'No és a l\'estructura: decideix quina figura es prova, en quin ordre i quan es desmunta.',
    castellEs: 'No está en la estructura: decide qué figura se intenta, en qué orden y cuándo se desmonta.',
    casa: 'Qui tria què s\'intenta amb la gent que hi ha. La decisió que no es pot delegar a l\'estructura que l\'ha d\'aguantar.',
    casaEs: 'Quien elige qué se intenta con la gente que hay. La decisión que no se puede delegar a la estructura que la tiene que aguantar.' }
];

/* ══ EL MATEIX CAS, MIRAT DES DE DALT ════════════════════════════════════════
   Aquí hi havia el forat. `build-mapavalor.js` dibuixava el celler i aquest
   fitxer dibuixava plantes de `VARIABLES`, **casos declarats a mà que no tenien
   res a veure amb el celler**: dos dibuixos bonics del mateix discurs, i cap
   dels dos era una vista de l'altre.

   Ara la planta **es deriva del mapa**, i la regla és aquesta:

   · **Els baixos són els nodes.** Un mapa de N nodes obre 4N rengles, que és la
     mateixa llei de sempre. El celler, amb set nodes, n'obre vint-i-vuit.
   · **Un parell és un vent quan va i torna en menes diferents** —tangible cap
     a un costat, intangible cap a l'altre. És literalment el que fa un vent:
     una mà a cada pilar, i cada mà aguantant una cosa diferent. Si una de les
     dues bandes plega, les dues àrees perden.
   · **La resta de lliuraments tangibles són primeres mans** (el suport directe
     d'una àrea: el que es factura) i **els intangibles, laterals** (reforcen
     pel costat i no surten a cap factura).

   I llavors es compara amb el que la pinya **té**: cada pilar obre una primera
   mà, un vent i dos laterals. Tres vents sobre una sola posició de vent no és
   un error de dibuix: és un node que lliga tres àrees i només té lloc per a
   una. Les xifres no s'escriuen enlloc —es compten—, i el que surt és la
   lectura. */
const { CELLER, XARXA } = require('./build-mapavalor.js');

/* `queEs` surt dels dos últims elements del parell, que els declara
   `build-mapavalor.js`: el que es llegeix a sobre de cada rengla és el mateix
   lliurament que el graf, i ha de dir el mateix a les dues vistes. */
const fluxosDe = mapa => mapa.parells.flatMap(p => [
  { de: p[0], a: p[1], mena: p[2], que: p[3], queEs: p[6] || p[3], parell: p },
  { de: p[1], a: p[0], mena: p[4], que: p[5], queEs: p[7] || p[5], parell: p }
]);

/* Les quatre rengles que obre cada pilar, sense perdre de qui són. `direccions`
   les torna ordenades per angle i això és el que vol la planta d'una variable;
   aquí cal saber **quin node obre quina**, i una guarda comprova que les dues
   maneres de dir-ho donen els mateixos angles i les mateixes menes. */
function rengles(n) {
  const pas = 360 / n, out = [];
  for (let k = 0; k < n; k++) {
    const a = -90 + k * pas;
    out.push({
      k, eix: a, rengles: [
        { a, mena: 'primera' },
        { a: a + pas / 4, mena: 'lateral' },
        { a: a + pas / 2, mena: 'vent' },
        { a: a + pas * 3 / 4, mena: 'lateral' }
      ]
    });
  }
  return out;
}

function pinyaDeMapa(mapa) {
  const fl = fluxosDe(mapa);
  const mixt = p => p[2] !== p[4];
  fl.forEach(f => {
    f.linia = mixt(f.parell) ? 'vent' : (f.mena === 'tangible' ? 'primera' : 'lateral');
  });
  const pilars = rengles(mapa.nodes.length).map(p => {
    const node = mapa.nodes[p.k];
    const rep = fl.filter(f => f.a === node.id);
    const per = {};
    MENES.forEach(m => { per[m.id] = rep.filter(f => f.linia === m.id); });
    /* Quantes posicions d'aquella mena obre un sol pilar: 1 primera, 1 vent i
       2 laterals. És el denominador de tota la lectura. */
    const te = { primera: 1, vent: 1, lateral: 2 };
    return { ...p, node, rebuts: rep, per, te };
  });
  const enc = mapa.encallament && mapa.encallament.node;
  const tocaEnc = f => f.de === enc || f.a === enc;
  return {
    mapa, fl, pilars, enc, tocaEnc,
    obertes: 4 * mapa.nodes.length,
    ocupades: pilars.reduce((a, p) => a + MENES.reduce((b, m) =>
      b + Math.min(p.per[m.id].length, p.te[m.id]), 0), 0),
    /* Els pilars que no tenen cap vent: àrees que no toquen cap altra àrea.
       És la definició de silo, dita amb el dibuix i no amb l'adjectiu. */
    sols: pilars.filter(p => !p.per.vent.length),
    /* I els que en tenen més dels que caben: massa relacions per a les
       posicions que la pinya els dona. */
    carregats: pilars.flatMap(p => MENES.filter(m => p.per[m.id].length > p.te[m.id])
      .map(m => ({ pilar: p, mena: m, quants: p.per[m.id].length })))
  };
}

/* ══ LA PLANTA · de dalt ═════════════════════════════════════════════════════ */
const P = 260, PC = P / 2, R0 = 30, PAS = 15;

/* ══ ELS TÍTOLS DELS DIBUIXOS, EN LES DUES LLENGÜES ═════════════════════════
   El `title` d'un dibuix és el que llegeix qui no el veu i el que surt en
   passar-hi el ratolí per sobre. Es munten comptant —«1 primera mà, 1 vents i
   2 laterals»— i per això no es poden escriure a un diccionari a mà: la xifra
   la posa el graf. Es generen aquí, un cop per llengua, i el marcatge hi apunta
   amb una clau.

   El vocabulari segueix el de la resta de la casa: «rengla», «Vent», «Baix» i
   «pinya» es queden com són també en castellà —són els noms de les posicions, i
   són el producte—; el que es tradueix és la frase que els envolta. */
const FR_PL = (f, variable, l) => {
  const q = variable ? (l === 'es'
    ? ` ${variable.dims.length} dimensiones de «${variable.nomEs || variable.nom}» repartidas por las rengles.`
    : ` ${variable.dims.length} dimensions de «${variable.nom}» repartides per les rengles.`) : '';
  const nom = (l === 'es' ? (f.nomEs || f.nom) : f.nom).toLowerCase();
  return l === 'es'
    ? `La pinya de ${nom} vista desde arriba: ${f.baixos} ${f.baixos === 1 ? 'primera mano' : 'primeras manos'}, `
      + `${f.baixos} ${f.baixos === 1 ? 'vent' : 'vents'} y ${2 * f.baixos} laterales, `
      + `${4 * f.baixos} rengles en total.${q}`
    : `La pinya d'${nom} vista des de dalt: ${f.baixos} ${f.baixos === 1 ? 'primera mà' : 'primeres mans'}, `
      + `${f.baixos} vents i ${2 * f.baixos} laterals, ${4 * f.baixos} rengles en total.${q}`;
};
const FR_AL = (f, l) => l === 'es'
  ? `${f.nomEs || f.nom} de lado: un tronc de ${f.baixos} por ${f.pisos} pisos sobre una pinya de ${f.pinya} personas.`
  : `${f.nom} de costat: un tronc de ${f.baixos} per ${f.pisos} pisos sobre una pinya de ${f.pinya} persones.`;
const FR_PLM = (n, ocupades, l) => l === 'es'
  ? `La misma casa vista desde arriba: ${n} pilares —uno por nodo del mapa— y ${4 * n} rengles abiertas, `
    + `de las cuales ${ocupades} tienen a alguien. Cada rengla es una entrega del mapa: las primeras manos, `
    + `lo que se factura; los laterales, lo que no; y los vents, lo que liga dos áreas a la vez.`
  : `La mateixa casa vista des de dalt: ${n} pilars —un per node del mapa— i ${4 * n} rengles obertes, `
    + `de les quals ${ocupades} tenen algú. Cada rengla és un lliurament del mapa: les primeres mans, `
    + `el que es factura; els laterals, el que no; i els vents, el que lliga dues àrees alhora.`;
/* La línia de comptes que hi ha sota cada planta, i el peu de la planta d'una
   variable. També es munten comptant, i també es quedaven en català. */
const FR_K = (x, l) => l === 'es'
  ? `${4 * x.baixos} rengles · ${x.baixos} ${x.baixos === 1 ? 'primera mano' : 'primeras manos'} · `
    + `${x.baixos} ${x.baixos === 1 ? 'vent' : 'vents'} · ${2 * x.baixos} laterales`
  : `${4 * x.baixos} rengles · ${x.baixos} ${x.baixos === 1 ? 'primera mà' : 'primeres mans'} · `
    + `${x.baixos} ${x.baixos === 1 ? 'vent' : 'vents'} · ${2 * x.baixos} laterals`;
const FR_CAP = (v, n, l) => l === 'es'
  ? `${v.dims.length} dimensiones sobre ${n} rengles`
  : `${v.dims.length} dimensions sobre ${n} rengles`;
const kPl = (f, variable) => `ct.pl.${f.id}${variable ? '-' + variable.id : ''}`;

function planta(f, variable) {
  const rep = variable ? repartiment(f, variable) : null;
  const dirs = rep ? rep.dirs : direccions(f.baixos);
  const p = [];

  // Els anells, per poder comptar la fondària d'un cop d'ull.
  for (let r = 1; r <= 6; r++) {
    p.push(`<circle class="pl-anell" cx="${PC}" cy="${PC}" r="${R0 + r * PAS}"/>`);
  }

  // Les direccions.
  dirs.forEach((d, i) => {
    const rad = d.a * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
    const m = MENES.find(x => x.id === d.mena);
    const dim = rep ? rep.mapa.get(i) : null;
    const fons = dim ? dim.n : 0;
    const llarg = R0 + (fons ? fons : 6) * PAS;
    p.push(`<line class="pl-l pl-${d.mena}" x1="${(PC + cos * R0).toFixed(1)}" y1="${(PC + sin * R0).toFixed(1)}" `
      + `x2="${(PC + cos * llarg).toFixed(1)}" y2="${(PC + sin * llarg).toFixed(1)}" `
      + `stroke="${COL_MENA[d.mena]}" stroke-width="${m.gruix}" opacity="${rep && !fons ? .15 : m.op}"/>`);
    // La gent d'aquella direcció, una rodona per persona.
    for (let k = 1; k <= fons; k++) {
      p.push(`<circle class="pl-g" cx="${(PC + cos * (R0 + k * PAS)).toFixed(1)}" `
        + `cy="${(PC + sin * (R0 + k * PAS)).toFixed(1)}" r="3.6" fill="${COL_MENA[d.mena]}"/>`);
    }
  });

  // El tronc vist de dalt: els baixos en rotllana al centre.
  for (let k = 0; k < f.baixos; k++) {
    const a = (-90 + k * 360 / f.baixos) * Math.PI / 180;
    const r = f.baixos === 1 ? 0 : 12;
    p.push(`<circle class="pl-baix" cx="${(PC + Math.cos(a) * r).toFixed(1)}" `
      + `cy="${(PC + Math.sin(a) * r).toFixed(1)}" r="7"/>`);
  }
  const tid = `plT-${f.id}${variable ? '-' + variable.id : ''}`;
  return `<svg class="pl-svg" viewBox="0 0 ${P} ${P}" role="img" aria-labelledby="${tid}">`
    + `<title id="${tid}" data-i18n="${kPl(f, variable)}">${esc(FR_PL(f, variable, 'ca'))}</title>`
    + `${p.join('')}</svg>`;
}

/* ══ LA PLANTA D'UN MAPA · amb els noms ══════════════════════════════════════
   La planta de `VARIABLES` no porta noms perquè no en té: les dimensions són
   una llista al costat. Aquesta sí, i és la pregunta que es va fer en veu alta
   —«on puc veure els noms»—: cada pilar porta escrit **el node que és**, i cada
   rengla, el lliurament que hi cau, al `title`.

   `data-para` marca el que s'atura quan s'encalla el node del cas. És el mateix
   atribut que fa servir el graf, i per això els dos dibuixos s'apaguen alhora:
   si el castell es quedés sencer mentre el graf es buida, la planta seria
   decoració. */
const PM = 400, PMC = PM / 2, PMR = 34, PM0 = 52, PMPAS = 22, PMET = 142;
const ID_PLANTA = 'plCeller';

const talla = (s, n) => {
  const mots = String(s).split(' '), li = []; let l = '';
  mots.forEach(m => {
    if ((l + ' ' + m).trim().length > n && l) { li.push(l); l = m; }
    else l = (l + ' ' + m).trim();
  });
  if (l) li.push(l);
  return li.slice(0, 2);
};

/* El que diu cada rengla en passar-hi el ratolí: la posició, el node i els
   lliuraments que hi cauen. Es munta amb dades del mapa i per això la frase es
   genera aquí i el marcatge hi apunta amb una clau. `RENGLES` recull les que
   s'han dibuixat perquè `dicCastells` les pugui escriure a les dues llengües
   sense tornar a derivar la pinya. */
/* Es deriven, no s'acumulen. La primera versió les recollia mentre es
   dibuixaven, i el diccionari s'escriu **abans** que els blocs: el mapa de la
   xarxa encara no s'havia dibuixat i les seves vint-i-vuit frases es quedaven
   sense clau al diccionari, amb la clau escrita al marcatge. Es veia obrint la
   pàgina en castellà, i cap guarda hi arribava. */
function renglesDe(pinya, id) {
  const out = [];
  let n = 0;
  pinya.pilars.forEach(pil => pil.rengles.forEach(rg => {
    /* Les rengles de la mateixa mena es reparteixen els lliuraments d'aquella
       mena: la primera en té un, i els laterals, un cada un. */
    const iguals = pil.rengles.filter(x => x.mena === rg.mena);
    const ordre = iguals.indexOf(rg);
    const quins = pil.per[rg.mena].filter((_, k) => k % iguals.length === ordre);
    out.push({ clau: `ct.r.${id}.${n++}`, rg, pil, quins, node: pil.node, pos: POSICIONS.find(x => x.mena === rg.mena) });
  }));
  return out;
}
const FR_RG = (r, l) => {
  const nom = o => (l === 'es' ? (o.nomEs || o.nom) : o.nom);
  const que = f => (l === 'es' ? (f.queEs || f.que) : f.que);
  return esc(nom(r.pos)) + ' de ' + esc(nom(r.node)) + ': '
    + (r.quins.length ? r.quins.map(f => esc(que(f))).join(' · ') : (l === 'es' ? 'nadie' : 'ningú'));
};

/* ══ LES LECTURES QUE ES MUNTEN COMPTANT ════════════════════════════════════
   «3 vents sobre una sola posició», «El poble i El distribuïdor no tenen cap
   vent»: frases fetes amb trossos i una xifra que dona el graf. Eren el motiu
   escrit al sostre de `test-i18n-home.mjs` per no traduir-les —«traduir-les vol
   declarar cada tros»—, i és exactament el que es fa aquí: cada tros declarat,
   i la xifra fora del text. */
const LECT = {
  carregat: (nom, quants, mena, posicions, l) => l === 'es'
    ? `<b>${nom} tiene ${quants} ${mena} sobre ${posicions === 1 ? 'una sola posición' : posicions + ' posiciones'}.</b> `
      + 'La pinya no le da sitio para tantas, y eso no se ve en el grafo: en el grafo son flechas, y las '
      + 'flechas no tienen base.'
    : `<b>${nom} té ${quants} ${mena} sobre ${posicions === 1 ? 'una sola posició' : posicions + ' posicions'}.</b> `
      + 'La pinya no li dona lloc per a tantes, i això no es veu al graf: al graf són fletxes, i les '
      + 'fletxes no tenen base.',
  sols: (noms, l) => l === 'es'
    ? `<b>${noms.length === 1 ? noms[0] + ' no tiene ningún vent' : noms.join(' y ') + ' no tienen ningún vent'}.</b> `
      + 'No comparte ninguna relación de doble moneda con nadie: da y recibe siempre en la misma, y por '
      + 'tanto no hay ninguna posición que lo ligue a otra área. Es un silo, dicho con el dibujo.'
    : `<b>${noms.length === 1 ? noms[0] + ' no té cap vent' : noms.join(' i ') + ' no tenen cap vent'}.</b> `
      + 'No comparteix cap relació de doble moneda amb ningú: dona i rep sempre en la mateixa, i per '
      + 'tant no hi ha cap posició que el lligui a una altra àrea. És un silo, dit amb el dibuix.',
  laterals: (ocupats, total, l) => l === 'es'
    ? `<b>${ocupats} laterales ocupados de ${total}.</b> Casi no llega refuerzo que no se facture — `
      + 'que es la misma cosa que dice el grafo cuando se cuentan los intangibles, hallada por otro camino.'
    : `<b>${ocupats} laterals ocupats de ${total}.</b> Gairebé no arriba reforç que no es facturi — `
      + 'que és la mateixa cosa que diu el graf quan es compten els intangibles, trobada per un altre camí.',
  solsX: (noms, l) => l === 'es'
    ? `<b>${noms.length === 1 ? noms[0] + ' no tiene ningún vent' : noms.join(', ') + ' no tienen ningún vent'}.</b> `
      + 'Ninguna posición los liga a otra área: o se relacionan en una sola moneda, o no se '
      + 'relacionan. Es un silo, dicho con el dibujo.'
    : `<b>${noms.length === 1 ? noms[0] + ' no té cap vent' : noms.join(', ') + ' no tenen cap vent'}.</b> `
      + 'Cap posició els lliga a una altra àrea: o es relacionen en una sola moneda, o no es '
      + 'relacionen. És un silo, dit amb el dibuix.',
  carregatX: (nom, quants, mena, l) => l === 'es'
    ? `<b>${nom} tiene ${quants} ${mena}.</b> `
      + 'Es el rol del que cuelgan los demás, y la pinya no le da sitio para tantos.'
    : `<b>${nom} té ${quants} ${mena}.</b> `
      + 'És el rol del qual pengen els altres, i la pinya no li dona lloc per a tants.'
};
/* L'avís de risc de cada variable: també es munta comptant. «4 vents buits: hi
   ha 4 parells d'àrees sense ningú que les toqui totes dues». */
function FR_RISC(v, ventsBuits, alsVents, buides, l) {
  const a = [];
  const es = l === 'es';
  if (ventsBuits) a.push(`<b>${ventsBuits} ${ventsBuits === 1 ? (es ? 'vent vacío' : 'vent buit') : (es ? 'vents vacíos' : 'vents buits')}</b>: `
    + (es
      ? (ventsBuits === 1 ? 'hay un par de áreas' : 'hay ' + ventsBuits + ' pares de áreas') + ' sin nadie que las toque a las dos'
      : (ventsBuits === 1 ? 'hi ha un parell d\'àrees' : 'hi ha ' + ventsBuits + ' parells d\'àrees') + ' sense ningú que les toqui totes dues'));
  else if (alsVents.length) a.push(es
    ? `<b>los ${alsVents.length} vents tienen quien los ocupe</b> (${alsVents.map(x => esc(x.dim.nomEs || x.dim.nom)).join(', ')}): son las posiciones que ligan dos áreas a la vez`
    : `<b>els ${alsVents.length} vents tenen qui els ocupi</b> (${alsVents.map(x => esc(x.dim.nom)).join(', ')}): són les posicions que lliguen dues àrees alhora`);
  const resta = buides - ventsBuits;
  if (resta > 0) a.push(es
    ? `y ${resta} ${resta === 1 ? 'rengla más queda vacía' : 'rengles más quedan vacías'}`
    : `i ${resta} ${resta === 1 ? 'rengla més queda buida' : 'rengles més queden buides'}`);
  return a.length ? a.join(' · ') + '.' : '';
}

/* Les dues lectures de la pinya de la xarxa, en una llengua. */
function lecturesXarxa(pin, l) {
  const sols = pin.sols.map(p => nomL(p.node, l));
  const car = pin.carregats.slice().sort((a, b) => b.quants - a.quants);
  const out = [];
  if (car.length) {
    const c = car[0];
    out.push(LECT.carregatX(esc(nomL(c.pilar.node, l)), c.quants, esc(nomL(c.mena, l).toLowerCase()), l));
  }
  if (sols.length) out.push(LECT.solsX(sols, l));
  return out;
}

/* Les tres lectures de la vista castell del celler, en una llengua. */
function lecturesVista(pin, l) {
  const sols = pin.sols.map(p => nomL(p.node, l));
  const car = pin.carregats.slice().sort((a, b) => b.quants - a.quants);
  const out = [];
  if (car.length) {
    const c = car[0];
    out.push(LECT.carregat(esc(nomL(c.pilar.node, l)), c.quants,
      esc(nomL(c.mena, l).toLowerCase()), c.pilar.te[c.mena.id], l));
  }
  if (sols.length) out.push(LECT.sols(sols, l));
  const lat = pin.pilars.reduce((a, p) => a + Math.min(p.per.lateral.length, p.te.lateral), 0);
  const latT = pin.pilars.reduce((a, p) => a + p.te.lateral, 0);
  out.push(LECT.laterals(lat, latT, l));
  return out;
}

/* El nom d'un node i el d'una mena, en la llengua que toca. */
const nomL = (o, l) => (l === 'es' ? (o.nomEs || o.nom) : o.nom);

function plantaMapa(pinya, id) {
  const p = [], n = pinya.pilars.length;
  for (let r = 1; r <= 3; r++) {
    p.push(`<circle class="pl-anell" cx="${PMC}" cy="${PMC}" r="${PM0 + r * PMPAS}"/>`);
  }

  /* El que no hi cap no desapareix —s'apila a la primera posició— i això és
     justament el que la lectura de la rengla ha de dir. */
  renglesDe(pinya, id).forEach(r => {
      const rg = r.rg, quins = r.quins;
      const m = MENES.find(x => x.id === rg.mena);
      const fons = quins.length;
      const rad = rg.a * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
      const llarg = PM0 + (fons || 1) * PMPAS;
      const para = quins.some(pinya.tocaEnc) ? ' data-para="1"' : '';
      /* El nom en singular el diu `POSICIONS`, no una regla de plural: treure
         la essa de «Primeres mans» dona «Primeres man». La biblioteca de rols
         existeix justament per no haver d'endevinar com es diu una posició. */
      p.push(`<line class="pl-l pl-${rg.mena}" x1="${(PMC + cos * PM0).toFixed(1)}" y1="${(PMC + sin * PM0).toFixed(1)}" `
        + `x2="${(PMC + cos * llarg).toFixed(1)}" y2="${(PMC + sin * llarg).toFixed(1)}" `
        + `stroke="${COL_MENA[rg.mena]}" stroke-width="${m.gruix}" opacity="${fons ? m.op : .13}"${para}>`
        + `<title data-i18n="${r.clau}">${FR_RG(r, 'ca')}</title></line>`);
      for (let k = 1; k <= fons; k++) {
        p.push(`<circle class="pl-g" cx="${(PMC + cos * (PM0 + k * PMPAS)).toFixed(1)}" `
          + `cy="${(PMC + sin * (PM0 + k * PMPAS)).toFixed(1)}" r="4" fill="${COL_MENA[rg.mena]}"${para}/>`);
      }
  });

  // Els pilars, i el nom de cada node a fora de la seva rengla principal.
  pinya.pilars.forEach(pil => {
    const rad = pil.eix * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
    const r = n === 1 ? 0 : PMR;
    const encara = pinya.enc === pil.node.id ? ' data-para="1"' : '';
    p.push(`<circle class="pl-baix" cx="${(PMC + cos * r).toFixed(1)}" `
      + `cy="${(PMC + sin * r).toFixed(1)}" r="8"${encara}/>`);
    const x = PMC + cos * PMET, y = PMC + sin * PMET;
    const anc = cos > .25 ? 'start' : cos < -.25 ? 'end' : 'middle';
    /* Una etiqueta per llengua, com al graf: el salt de línia es calcula aquí
       i el castellà no es parteix pel mateix lloc. El CSS n'ensenya una. */
    const etiqueta = (nom, cls) => {
      const li = talla(nom, 15);
      li.forEach((t, k) => {
        p.push(`<text class="pl-nom ${cls}" x="${x.toFixed(1)}" y="${(y + (k - (li.length - 1) / 2) * 11).toFixed(1)}" `
          + `text-anchor="${anc}" dominant-baseline="middle"${encara}>${esc(t)}</text>`);
      });
    };
    etiqueta(pil.node.nom, 'mv-ca');
    if (pil.node.nomEs && pil.node.nomEs !== pil.node.nom) etiqueta(pil.node.nomEs, 'mv-es');
  });

  const t = `plmT-${id}`;
  return `<svg id="${id}" class="pl-svg pl-mapa" viewBox="0 0 ${PM} ${PM}" role="img" aria-labelledby="${t}">`
    + `<title id="${t}" data-i18n="ct.plm.${id}">${esc(FR_PLM(n, pinya.ocupades, 'ca'))}</title>`
    + p.join('') + '</svg>';
}

/* ══ L'ALÇAT · de costat ═════════════════════════════════════════════════════ */
const A = 200, AH = 230, BASE = 192;

function alcat(f) {
  const p = [];
  const amp = 19, x0 = A / 2 - (f.baixos - 1) * amp / 2;
  // La pinya, aquí, és la base ampla: de costat no se'n veuen les direccions.
  [[.5, 9], [.76, 13], [1, 18]].forEach(([r, n], fi) => {
    const y = BASE + fi * 12, ample = Math.min(A - 16, 50 + r * 140);
    for (let k = 0; k < n; k++) {
      const x = A / 2 - ample / 2 + (n === 1 ? ample / 2 : k * ample / (n - 1));
      p.push(`<circle class="al-pi" cx="${x.toFixed(1)}" cy="${y}" r="3.6"/>`);
    }
  });
  for (let b = 0; b < f.baixos; b++) {
    for (let pis = 0; pis < f.pisos; pis++) {
      p.push(`<rect class="al-p" x="${(x0 + b * amp - 7).toFixed(1)}" y="${BASE - 14 - pis * 23}" `
        + `width="14" height="19" rx="4" fill="${b % 2 ? 'var(--green)' : 'var(--indigo)'}"/>`);
    }
  }
  const yTop = BASE - 14 - (f.pisos - 1) * 23;
  for (let k = 0; k < f.pom; k++) {
    p.push(`<circle class="al-pom" cx="${A / 2}" cy="${(yTop - 7 - k * 12).toFixed(1)}" r="5"/>`);
  }
  return `<svg class="al-svg" viewBox="0 0 ${A} ${AH}" role="img" aria-labelledby="alT-${f.id}">`
    + `<title id="alT-${f.id}" data-i18n="ct.al.${f.id}">${esc(FR_AL(f, 'ca'))}</title>`
    + `${p.join('')}</svg>`;
}

/* ══ EL BLOC ═════════════════════════════════════════════════════════════════ */
function bloc(marca) {
  const f = [];
  f.push(`<!--${marca || 'TT-CASTELLS'}-->`);
  f.push('<!-- GENERAT per SOS/tools/build-castells.js · no s\'edita a mà -->');
  f.push('<div class="ct-wrap fade-up">');

  /* ── 1 · Les dues vistes, i la llei que les lliga ──────────────────────── */
  f.push('  <div class="ct-tria" role="tablist" aria-label="Construccions">');
  FIGURES.forEach((x, i) => f.push(`    <button type="button" class="ct-t${i === 3 ? ' on' : ''}" `
    + `role="tab" aria-selected="${i === 3}" aria-controls="ct-p-${x.id}" id="ct-t-${x.id}" `
    + `data-f="${x.id}"><span data-i18n="ct.f.${x.id}.n">${esc(x.nom)}</span> `
    + `<span class="ct-tn">${4 * x.baixos}</span></button>`));
  f.push('  </div>');

  FIGURES.forEach((x, i) => {
    f.push(`  <div class="ct-pan" id="ct-p-${x.id}" role="tabpanel" aria-labelledby="ct-t-${x.id}"${i === 3 ? '' : ' hidden'}>`);
    f.push('    <figure class="ct-v"><div class="ct-viz">' + planta(x) + '</div>'
      + `<figcaption data-i18n="ct.cap1">${FRASES['ct.cap1'].ca}</figcaption></figure>`);
    f.push('    <figure class="ct-v"><div class="ct-viz">' + alcat(x) + '</div>'
      + `<figcaption data-i18n="ct.cap2">${FRASES['ct.cap2'].ca}</figcaption></figure>`);
    f.push('    <div class="ct-txt">');
    f.push(`      <div class="ct-k" data-i18n="ct.k.${x.id}">${FR_K(x, 'ca')}</div>`);
    f.push(`      <p class="ct-quan" data-i18n="ct.f.${x.id}.q">${esc(x.quan)}</p>`);
    f.push(`      <p class="ct-diu" data-i18n="ct.f.${x.id}.d">${esc(x.diu)}</p>`);
    f.push('    </div>');
    f.push('  </div>');
  });

  // La llegenda de les tres menes, que és el que fa llegible tota la resta.
  f.push('  <div class="ct-men">' + MENES.map(m =>
    `<span class="ct-m"><i style="background:${COL_MENA[m.id]};height:${m.gruix}px"></i>`
    + `<b data-i18n="${kMena(m.id, 'n')}">${esc(m.nom)}</b> `
    + `<span data-i18n="${kMena(m.id, 'd')}">${esc(m.diu)}</span></span>`).join('') + '</div>');

  f.push(`  <p class="ct-llei" data-i18n-html="ct.llei">${FRASES['ct.llei'].ca}</p>`);

  /* ── 2 · La variable · la mateixa planta, pintada per una altra cosa ───── */
  f.push('  <div class="ct-var">');
  f.push(`    <div class="ct-k" data-i18n="ct.quehiposes">${FRASES['ct.quehiposes'].ca}</div>`);
  f.push('    <div class="ct-tria ct-tv" role="tablist" aria-label="Variables">');
  VARIABLES.forEach((v, i) => f.push(`      <button type="button" class="ct-t${i === 0 ? ' on' : ''}" `
    + `role="tab" aria-selected="${i === 0}" aria-controls="ct-v-${v.id}" id="ct-tv-${v.id}" `
    + `data-v="${v.id}"><span data-i18n="ct.v.${v.id}.n">${esc(v.nom)}</span> `
    + `<span class="ct-tn">${v.dims.length}</span></button>`));
  f.push('    </div>');
  VARIABLES.forEach((v, i) => {
    const fig = FIGURES.find(x => x.id === v.fig);
    const { dirs, mapa } = repartiment(fig, v);
    const buides = dirs.length - mapa.size;
    /* Els vents sense ningú són la lectura que només es pot fer des de dalt:
       cada vent buit és un parell d'àrees que no es toquen. */
    const ventsBuits = dirs.filter((d, k) => d.mena === 'vent' && !mapa.get(k)).length;
    const alsVents = dirs.map((d, k) => ({ d, dim: mapa.get(k) }))
      .filter(x => x.d.mena === 'vent' && x.dim);
    f.push(`    <div class="ct-pan ct-pv" id="ct-v-${v.id}" role="tabpanel" aria-labelledby="ct-tv-${v.id}"${i ? ' hidden' : ''}>`);
    f.push('      <figure class="ct-v"><div class="ct-viz">' + planta(fig, v) + '</div>'
      + `<figcaption data-i18n="ct.v.${v.id}.cap">${FR_CAP(v, dirs.length, 'ca')}</figcaption></figure>`);
    f.push('      <div class="ct-txt">');
    f.push(`        <p class="ct-quan" data-i18n="ct.v.${v.id}.q">${esc(v.quees)}</p>`);
    f.push(`        <p class="ct-diu" data-i18n-html="ct.v.${v.id}.l">${v.llegeix}</p>`);
    f.push('        <ul class="ct-ll">' + v.dims.map((d, k) => {
      const idx = [...mapa.keys()].find(x => mapa.get(x) === d);
      const mena = idx == null ? 'primera' : dirs[idx].mena;
      return `<li><i style="background:${COL_MENA[mena]}"></i>`
        + `<span data-i18n="ct.d.${v.id}.${k}">${esc(d.nom)}</span> <b>${d.n}</b></li>`;
    }).join('') + '</ul>');
    const avis = FR_RISC(v, ventsBuits, alsVents, buides, 'ca');
    if (avis) f.push(`        <p class="ct-risc" data-i18n-html="ct.risc.${v.id}">${avis}</p>`);
    f.push('      </div>');
    f.push('    </div>');
  });
  f.push('  </div>');

  f.push(`  <p class="ct-avis" data-i18n-html="ct.avis">${FRASES['ct.avis'].ca}</p>`);
  f.push('</div>');
  f.push(`<!--/${marca || 'TT-CASTELLS'}-->`);
  return f.join('\n');
}

/* ══ EL BLOC DE LA VISTA CASTELL DEL CAS ═════════════════════════════════════
   La mateixa casa del graf, mirada des de dalt. No és una figura d'exemple: són
   els set nodes i els setze lliuraments del celler, comptats. */
function blocVista() {
  const pin = pinyaDeMapa(CELLER);
  const f = [];
  f.push('<!--TT-VISTA-CASTELL-->');
  f.push('<!-- GENERAT per SOS/tools/build-castells.js · no s\'edita a mà -->');
  f.push('<div class="cv-grid">');
  f.push('  <div class="cv-viz">');
  f.push('    ' + plantaMapa(pin, ID_PLANTA));
  f.push('    <div class="ct-men cv-men">' + MENES.map(m => {
    const pos = POSICIONS.find(x => x.mena === m.id);
    return `<span class="ct-m"><i style="background:${COL_MENA[m.id]};height:${m.gruix}px"></i>`
      + `<b data-i18n="${kPos(pos.id, 'n')}">${esc(pos.nom)}</b> `
      + `<span data-i18n="${kPos(pos.id, 'o')}">${esc(pos.casa)}</span></span>`;
  }).join('') + '</div>');
  f.push('  </div>');
  f.push('  <div class="cv-txt">');
  f.push(`    <h3 data-i18n="cv.h3">${FRASES['cv.h3'].ca}</h3>`);
  f.push(`    <p class="mv-lead" data-i18n-html="cv.lead">${FRASES['cv.lead'].ca}</p>`);
  f.push(`    <div class="cv-k"><b>${pin.obertes} <span data-i18n="cv.obertes">rengles obertes</span></b> · `
    + `${pin.ocupades} <span data-i18n="cv.ambalgu">amb algú</span> · `
    + `${pin.obertes - pin.ocupades} <span data-i18n="cv.buides">buides</span></div>`);

  // Qui rep què, pilar per pilar. És la taula que fa comprovable el dibuix.
  /* La capçalera i la primera columna també porten clau: la taula diu qui és
     cada node, i es llegia sencera en català amb la resta de la secció en
     castellà. El nom del node surt del mapa, que ja el declara a les dues
     llengües; el de cada mena, de `MENES`. */
  f.push('    <table class="cv-t"><thead><tr><th data-i18n="cv.elnode">El node</th>'
    + MENES.map(m => `<th data-i18n="${kMena(m.id, 'n')}">${esc(m.nom)}</th>`).join('') + '</tr></thead><tbody>');
  pin.pilars.forEach(p => {
    f.push(`      <tr><td data-i18n="ct.n.${p.node.id}">` + esc(p.node.nom) + '</td>' + MENES.map(m => {
      const q = p.per[m.id].length, cap = p.te[m.id];
      const cls = !q ? ' class="cv-0"' : (q > cap ? ' class="cv-x"' : '');
      /* «de 2» quan hi cauen més lliuraments dels que la pinya aguanta. El
         «de» porta clau com la resta: es diu igual a les dues llengües, però
         si no en tingués, la regla que comprova que tot el text es pot traduir
         hauria de fer-hi una excepció, i una excepció és el lloc per on entra
         el pròxim tros sense traduir. */
      return `<td${cls}>${q}${q > cap ? ` <span class="cv-sob"><span data-i18n="cv.de">de</span> ${cap}</span>` : ''}</td>`;
    }).join('') + '</tr>');
  });
  f.push('    </tbody></table>');

  /* Les lectures es munten comptant i per això es generen, amb una clau per
     lectura: el text és el mateix a les dues llengües tret de la xifra, que la
     posa el graf. */
  const lect = lecturesVista(pin, 'ca');
  f.push('    <ul class="cv-ll">' + lect.map((x, i) =>
    `<li data-i18n-html="cv.l${i}">${x}</li>`).join('') + '</ul>');
  f.push(`    <p class="mv-avis" data-i18n-html="cv.avis">${FRASES['cv.avis'].ca}</p>`);
  f.push('  </div>');
  f.push('</div>');
  f.push('<!--/TT-VISTA-CASTELL-->');
  return f.join('\n');
}

/* ══ LA VISTA CASTELL DE LA XARXA ════════════════════════════════════════════
   El mateix `pinyaDeMapa()` sobre el segon cas, i és aquí on es veu si la
   derivació és general o estava afinada per al celler. No porta pols: la xarxa
   no declara cap encallament, i inventar-n'hi un per tenir el botó seria
   exactament el que aquest fitxer no fa.

   El text el compta el generador. Si un dia la xarxa canvia un lliurament, la
   lectura canviarà amb ella o el CI petarà. */
function blocXarxaPinya(marca) {
  const pin = pinyaDeMapa(XARXA);
  const f = [];
  f.push(`<!--${marca || 'TT-XARXA-PINYA'}-->`);
  f.push('<!-- GENERAT per SOS/tools/build-castells.js · no s\'edita a mà -->');
  f.push('<div class="cv-grid xp-grid fade-up">');
  f.push('  <div class="cv-viz">');
  f.push('    ' + plantaMapa(pin, 'plXarxa'));
  f.push('    <div class="ct-men cv-men">' + MENES.map(m => {
    const pos = POSICIONS.find(x => x.mena === m.id);
    return `<span class="ct-m"><i style="background:${COL_MENA[m.id]};height:${m.gruix}px"></i>`
      + `<b data-i18n="${kPos(pos.id, 'n')}">${esc(pos.nom)}</b> `
      + `<span data-i18n="${kPos(pos.id, 'o')}">${esc(pos.casa)}</span></span>`;
  }).join('') + '</div>');
  f.push('  </div>');
  f.push('  <div class="cv-txt">');
  f.push(`    <h3 data-i18n="xp.h3">${FRASES['xp.h3'].ca}</h3>`);
  f.push(`    <p class="mv-lead" data-i18n-html="xp.lead">${FRASES['xp.lead'].ca}</p>`);
  f.push(`    <div class="cv-k"><b>${pin.obertes} <span data-i18n="cv.obertes">rengles obertes</span></b> · `
    + `${pin.ocupades} <span data-i18n="cv.ambalgu">amb algú</span> · `
    + `${pin.obertes - pin.ocupades} <span data-i18n="cv.buides">buides</span></div>`);
  const li = lecturesXarxa(pin, 'ca').map((x, i) => `<li data-i18n-html="xp.l${i}">${x}</li>`);
  li.push(`<li><span data-i18n-html="xp.resol">${FRASES['xp.resol'].ca}</span></li>`);
  f.push('    <ul class="cv-ll">' + li.join('') + '</ul>');
  f.push('  </div>');
  f.push('</div>');
  f.push(`<!--/${marca || 'TT-XARXA-PINYA'}-->`);
  return f.join('\n');
}

/* ══ EL BLOC DELS ROLS ARQUETÍPICS ═══════════════════════════════════════════
   El vocabulari, escrit. Agrupat per on és la posició —la pinya, el tronc, el
   pom i fora— perquè llegit en aquest ordre explica un castell sol: el que
   aguanta, el que puja, el que corona i el que decideix.

   La columna que importa és la segona. Qui no sap de castells ha de poder
   llegir-la i dir «això és en Joan»; si no hi arriba, el vocabulari no serveix
   per a un cas real. */
const ON = [
  { id: 'pinya', nom: 'A la pinya', nomEs: 'En la pinya',
    diu: 'A terra. El que aguanta i no es veu a la foto.',
    diuEs: 'En el suelo. Lo que aguanta y no se ve en la foto.' },
  { id: 'tronc', nom: 'Al tronc', nomEs: 'En el tronco',
    diu: 'Els pisos. El que es puja i transmet el pes avall.',
    diuEs: 'Los pisos. Lo que se sube y transmite el peso hacia abajo.' },
  { id: 'pom', nom: 'Al pom de dalt', nomEs: 'En el pom de arriba',
    diu: 'Els de la canalla. Pesen poc i decideixen si el castell és carregat o descarregat.',
    diuEs: 'Los de la chiquillería. Pesan poco y deciden si el castell es carregat o descarregat.' },
  { id: 'fora', nom: 'Fora de l\'estructura', nomEs: 'Fuera de la estructura',
    diu: 'Qui no aguanta res i tria què s\'intenta.',
    diuEs: 'Quien no aguanta nada y elige qué se intenta.' }
];

/* Les frases del bloc que no surten de cap declaració. Vivien escrites dins de
   la funció i per això el bloc sencer es quedava en català quan algú triava
   castellà: la portada té dos diccionaris i aquest bloc hi anava a dins.
   Declarades aquí, el generador les escriu a les dues. */
const FRASES = {
  /* Les del bloc de la vista castell d'un cas i de la xarxa. */
  'cv.h3': { ca: 'Els mateixos set nodes, mirats des de dalt',
    es: 'Los mismos siete nodos, mirados desde arriba' },
  'cv.lead': {
    ca: 'El graf diu <b>qui dona què a qui</b>. La pinya diu una altra cosa que el graf no pot dir: <b>on es concentra el pes</b>. Cada pilar és un node, i cada rengla, un lliurament del mapa — no n\'hi ha cap de més ni cap de menys.',
    es: 'El grafo dice <b>quién da qué a quién</b>. La pinya dice otra cosa que el grafo no puede decir: <b>dónde se concentra el peso</b>. Cada pilar es un nodo, y cada rengla, una entrega del mapa — no hay ninguna de más ni ninguna de menos.' },
  'cv.obertes': { ca: 'rengles obertes', es: 'rengles abiertas' },
  'cv.ambalgu': { ca: 'amb algú', es: 'con alguien' },
  'cv.buides': { ca: 'buides', es: 'vacías' },
  'cv.avis': {
    ca: 'Les xifres d\'aquesta vista <b>no s\'escriuen enlloc</b>: surten de comptar el mateix mapa de l\'altra pestanya. El dia que el cas canviï un lliurament, les dues vistes canviaran alhora o el CI petarà.',
    es: 'Las cifras de esta vista <b>no se escriben en ningún sitio</b>: salen de contar el mismo mapa de la otra pestaña. El día que el caso cambie una entrega, las dos vistas cambiarán a la vez o el CI fallará.' },
  'xp.h3': { ca: 'I la mateixa xarxa, des de dalt', es: 'Y la misma red, desde arriba' },
  'xp.lead': {
    ca: 'La prova que la traducció no està feta a mida d\'un cas: <b>el mateix càlcul, sobre una altra casa</b>. Cada pilar és un rol de la xarxa i cada rengla, un lliurament.',
    es: 'La prueba de que la traducción no está hecha a medida de un caso: <b>el mismo cálculo, sobre otra casa</b>. Cada pilar es un rol de la red y cada rengla, una entrega.' },
  'xp.resol': {
    ca: '<b>Això és el que la xarxa ha de resoldre</b>, i no amagar: que cada rol el pugui fer algú altre, amb el nivell i l\'evidència que el registre ja sap acreditar.',
    es: '<b>Esto es lo que la red tiene que resolver</b>, y no esconder: que cada rol lo pueda hacer otra persona, con el nivel y la evidencia que el registro ya sabe acreditar.' },
  'ct.cap1': { ca: 'De dalt · la planta de la pinya', es: 'Desde arriba · la planta de la pinya' },
  'ct.cap2': { ca: 'De costat · el tronc', es: 'De lado · el tronco' },
  'ct.llei': {
    ca: '<b>La llei que lliga les dues vistes:</b> en castells no es guanya alçada sense guanyar base — un 4 de 8 demana folre, i un de 9, folre i manilles. <b>La pinya creix més de pressa que el tronc.</b> En una casa és igual: cada pis d\'ambició que s\'afegeix demana <b>més direccions obertes</b>, no més gent a la mateixa direcció.',
    es: '<b>La ley que une las dos vistas:</b> en castells no se gana altura sin ganar base — un 4 de 8 pide folre, y uno de 9, folre y manilles. <b>La pinya crece más rápido que el tronco.</b> En una casa es igual: cada piso de ambición que se añade pide <b>más direcciones abiertas</b>, no más gente en la misma dirección.' },
  'ct.avis': {
    ca: 'Això ordena i fa visible; <b>no puntua</b>. Un castell no diu si una casa va bé: diu on es concentra el pes i quines direccions té tancades, que és una altra cosa i és la que serveix per decidir.',
    es: 'Esto ordena y hace visible; <b>no puntúa</b>. Un castell no dice si una casa va bien: dice dónde se concentra el peso y qué direcciones tiene cerradas, que es otra cosa y es la que sirve para decidir.' },
  'ct.quehiposes': { ca: 'I ara, què hi poses', es: 'Y ahora, qué le pones' },
  /* Les tres capçaleres de columna. «A una casa:» era a cada fila —onze cops—
     i ara és aquí, un cop, perquè el lloc de la fila el guanyi el nom del rol. */
  'rl.col1': { ca: 'La posició', es: 'La posición' },
  'rl.col2': { ca: 'Al castell', es: 'En el castell' },
  'rl.col3': { ca: 'A una organització', es: 'En una organización' },
  'rl.encaixa': { ca: 'Encaixa amb qui porta', es: 'Encaja con quien aporta' },
  'rl.avis': {
    ca: 'Els noms varien de colla a colla i aquests són els d\'ús més estès. El que no varia és per què hi és cada posició, que és l\'única cosa que es pot traslladar a una organització. <b>Això posa nom, no puntua ningú.</b>',
    es: 'Los nombres varían de colla a colla y estos son los de uso más extendido. Lo que no varía es por qué está cada posición, que es lo único que se puede trasladar a una organización. <b>Esto pone nombre, no puntúa a nadie.</b>'
  }
};
/* Les claus d'una posició i d'un grup. Surten de l'`id`, que ja és l'únic
   identificador que tenen: inventar-ne un altre voldria mantenir-ne dos. */
const kPos = (id, c) => `rl.p.${id}.${c}`;
const kOn = (id, c) => `rl.g.${id}.${c}`;
/* El nom d'una aportació en la llengua que toca. Les deu aportacions són les
   mateixes que les dimensions de la variable `aports`, que ja les declara amb
   el seu castellà: buscar-les-hi evita una segona llista que un dia diria una
   altra cosa. «Encaixa amb qui porta cura i acollida» es llegia en català amb
   el castellà posat. */
const APORTS_DIMS = (VARIABLES.find(v => v.id === 'aports') || { dims: [] }).dims;
const aportL = (nom, l) => {
  if (l !== 'es') return nom;
  const d = APORTS_DIMS.find(x => x.nom.toLowerCase() === String(nom).toLowerCase());
  return d && d.nomEs ? d.nomEs : nom;
};

const kMena = (id, c) => `ct.m.${id}.${c}`;

/* El `data-i18n` només s'escriu a la portada: les pàgines del SOS no tenen
   diccionari i allà el text va escrit, en català. Un atribut que apunta a un
   diccionari que no existeix deixa el text tal com és, que és correcte, però
   dir-ho a posta val més que confiar-hi. */
function blocRols(marca) {
  /* ⚠ Les claus s'escriuen **a les dues pàgines** des del 03/10/2026. Abans
     només a la portada, perquè `/vna` no tenia diccionari: la taula dels rols
     —onze posicions, el que fan al castell, el que són a una organització i
     els exemples— es quedava sencera en català a la pàgina que explica el
     mètode. El castellà de cada camp ja estava declarat i no sortia enlloc.

     Ara `/vna` té diccionari i el bloc d'aquí hi deixa les seves claus: les
     recull el bucle del final d'aquest fitxer, que llegeix el que s'acaba
     d'escriure i només hi aboca les que es fan servir. */
  const i18 = k => ` data-i18n="${k}"`;
  const i18h = k => ` data-i18n-html="${k}"`;
  const f = [];
  f.push(`<!--${marca || 'TT-ROLS'}-->`);
  f.push('<!-- GENERAT per SOS/tools/build-castells.js · no s\'edita a mà -->');
  f.push('<div class="rl-wrap">');
  /* La capçalera, un cop. Abans cada fila repetia «A una casa:» —onze vegades—
     i el nom del rol no hi era: hi havia una frase. Ara el títol de la columna
     ho diu un cop, i el lloc de la fila el guanya **el nom**, que és el que
     algú s'ha d'endur per poder dir «tu ets el meu dos». */
  f.push('  <div class="rl-head">'
    + `<div${i18('rl.col1')}>La posició</div>`
    + `<div${i18('rl.col2')}>Al castell</div>`
    + `<div${i18('rl.col3')}>A una organització</div></div>`);
  ON.forEach(g => {
    const pos = POSICIONS.filter(p => p.on === g.id);
    if (!pos.length) return;
    f.push(`  <div class="rl-g">`);
    /* El separador va al marcatge i no dins del text: els dos trossos són dues
       claus i sense ell es llegien enganxats —«A la pinya A terra. El que
       aguanta…»—. */
    f.push(`    <div class="rl-gk"><span${i18(kOn(g.id, 'n'))}>${esc(g.nom)}</span>`
      + `<span class="rl-gs"> · </span>`
      + `<span${i18(kOn(g.id, 'd'))}>${esc(g.diu)}</span></div>`);
    pos.forEach(p => {
      f.push('    <div class="rl-p"' + (p.mena ? ` data-mena="${p.mena}"` : '') + '>');
      f.push(`      <div class="rl-n"${p.mena ? ` style="border-color:${COL_MENA[p.mena]}"` : ''}`
        + `${i18(kPos(p.id, 'n'))}>${esc(p.nom)}</div>`);
      f.push(`      <div class="rl-c"${i18(kPos(p.id, 'c'))}>${esc(p.castell)}</div>`);
      /* El nom del rol primer i destacat; la frase i els exemples, a sota. El
         nom és el que s'ha de poder repetir en veu alta a la sala. */
      f.push(`      <div class="rl-o"><b class="rl-on"${i18(kPos(p.id, 'org'))}>${esc(p.org)}</b>`
        + `<span class="rl-od"${i18(kPos(p.id, 'o'))}>${esc(p.casa)}</span>`
        + `<span class="rl-ex"${i18(kPos(p.id, 'ex'))}>${esc(p.ex)}</span></div>`);
      f.push(`      <div class="rl-a"><span${i18('rl.encaixa')}>Encaixa amb qui porta</span> `
        + `<b${i18(kPos(p.id, 'a'))}>${esc(p.aport.toLowerCase())}</b>`
        /* I de quina de les dotze preguntes del panteó és resposta. És el que
           fa que el nom encaixi amb el cas de qui el llegeix. */
        + `<span class="rl-q">${PANTEO[p.arq].ic} <span${i18(kPos(p.id, 'q'))}>`
        + `${esc(PANTEO[p.arq].q)}</span></span></div>`);
      f.push('    </div>');
    });
    f.push('  </div>');
  });
  f.push('</div>');
  f.push(`<p class="rl-avis"${i18h('rl.avis')}>${FRASES['rl.avis'].ca}</p>`);
  f.push(`<!--/${marca || 'TT-ROLS'}-->`);
  return f.join('\n');
}

/* ══ EL DICCIONARI D'AQUESTS BLOCS ═══════════════════════════════════════════
   Mateix patró que `build-oferta.js` i `build-nav.js`: es declara un cop i
   s'escriu a les dues llengües de la portada, i `--check` peta si s'han
   desviat. L'aportació no es tradueix aquí: les deu són del SOS i ja les
   tradueix el seu propi diccionari, o sigui que s'hi escriu igual a les dues
   —i es nota, i per això la guarda 15 ho deixa dit. */
function dicCastells(l) {
  const q = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const f = [];
  const tria = (o, c) => l === 'es' ? (o[c + 'Es'] || o[c]) : o[c];
  /* Els títols dels dibuixos i les línies que compten. Es munten amb una xifra
     que dona el graf, i per això es generen aquí i no s'escriuen a mà. Eren
     **tretze frases** que es quedaven en català amb el castellà posat, i no
     petaven perquè el marcatge no en portava clau. */
  FIGURES.forEach(x => {
    f.push(`  '${kPl(x, null)}':'${q(FR_PL(x, null, l))}',`);
    f.push(`  'ct.al.${x.id}':'${q(FR_AL(x, l))}',`);
    f.push(`  'ct.k.${x.id}':'${q(FR_K(x, l))}',`);
  });
  VARIABLES.forEach(v => {
    const fig = FIGURES.find(x => x.id === v.fig);
    const { dirs } = repartiment(fig, v);
    f.push(`  '${kPl(fig, v)}':'${q(FR_PL(fig, v, l))}',`);
    f.push(`  'ct.v.${v.id}.cap':'${q(FR_CAP(v, dirs.length, l))}',`);
  });
  [['plCeller', pinyaDeMapa(CELLER)], ['plXarxa', pinyaDeMapa(XARXA)]].forEach(([id, pin]) => {
    f.push(`  'ct.plm.${id}':'${q(FR_PLM(pin.mapa.nodes.length, pin.ocupades, l))}',`);
  });
  /* I el que diu cada rengla: són 56 frases entre els dos dibuixos, i es
     llegeixen passant el ratolí per sobre. `RENGLES` les recull quan es
     dibuixen, o sigui que aquesta llista és exactament la que hi ha. */
  [['plCeller', pinyaDeMapa(CELLER)], ['plXarxa', pinyaDeMapa(XARXA)]].forEach(([id, pin]) => {
    renglesDe(pin, id).forEach(r => f.push(`  '${r.clau}':'${q(FR_RG(r, l))}',`));
  });
  /* I les lectures que es munten comptant, a les dues vistes. */
  lecturesVista(pinyaDeMapa(CELLER), l).forEach((x, i) => f.push(`  'cv.l${i}':'${q(x)}',`));
  /* El nom de cada node, per a la taula de la vista castell. Ve del mapa, que
     és qui el declara: escriure'l aquí seria una segona veritat. */
  f.push(`  'cv.elnode':'${q(l === 'es' ? 'El nodo' : 'El node')}',`);
  f.push(`  'cv.de':'de',`);
  /* Només els del celler: la taula és de la vista castell del cas, i la pinya
     de la xarxa no en porta. Escriure també els de la xarxa deixaria set claus
     que no tradueixen res —i `check-landing.js` ho peta, amb raó: una clau que
     no apunta a cap text fa creure que aquell text està cobert. */
  CELLER.nodes.forEach(n =>
    f.push(`  'ct.n.${n.id}':'${q(l === 'es' ? (n.nomEs || n.nom) : n.nom)}',`));
  lecturesXarxa(pinyaDeMapa(XARXA), l).forEach((x, i) => f.push(`  'xp.l${i}':'${q(x)}',`));
  VARIABLES.forEach(v => v.dims.forEach((d, k) =>
    f.push(`  'ct.d.${v.id}.${k}':'${q(l === 'es' ? (d.nomEs || d.nom) : d.nom)}',`)));
  VARIABLES.forEach(v => {
    const fig = FIGURES.find(x => x.id === v.fig);
    const { dirs, mapa } = repartiment(fig, v);
    const buides = dirs.length - mapa.size;
    const ventsBuits = dirs.filter((d, k) => d.mena === 'vent' && !mapa.get(k)).length;
    const alsVents = dirs.map((d, k) => ({ d, dim: mapa.get(k) })).filter(x => x.d.mena === 'vent' && x.dim);
    const t = FR_RISC(v, ventsBuits, alsVents, buides, l);
    if (t) f.push(`  'ct.risc.${v.id}':'${q(t)}',`);
  });
  ON.forEach(g => {
    f.push(`  '${kOn(g.id, 'n')}':'${q(tria(g, 'nom'))}',`);
    f.push(`  '${kOn(g.id, 'd')}':'${q(tria(g, 'diu'))}',`);
  });
  POSICIONS.forEach(p => {
    f.push(`  '${kPos(p.id, 'n')}':'${q(tria(p, 'nom'))}',`);
    f.push(`  '${kPos(p.id, 'c')}':'${q(tria(p, 'castell'))}',`);
    f.push(`  '${kPos(p.id, 'o')}':'${q(tria(p, 'casa'))}',`);
    f.push(`  '${kPos(p.id, 'org')}':'${q(tria(p, 'org'))}',`);
    f.push(`  '${kPos(p.id, 'ex')}':'${q(tria(p, 'ex'))}',`);
    f.push(`  '${kPos(p.id, 'q')}':'${q(l === 'es' ? PANTEO[p.arq].qEs : PANTEO[p.arq].q)}',`);
    f.push(`  '${kPos(p.id, 'a')}':'${q(aportL(p.aport, l).toLowerCase())}',`);
  });
  MENES.forEach(m => {
    f.push(`  '${kMena(m.id, 'n')}':'${q(tria(m, 'nom'))}',`);
    f.push(`  '${kMena(m.id, 'd')}':'${q(tria(m, 'diu'))}',`);
  });
  FIGURES.forEach(x => {
    f.push(`  'ct.f.${x.id}.n':'${q(tria(x, 'nom'))}',`);
    f.push(`  'ct.f.${x.id}.q':'${q(tria(x, 'quan'))}',`);
    f.push(`  'ct.f.${x.id}.d':'${q(tria(x, 'diu'))}',`);
  });
  VARIABLES.forEach(v => {
    f.push(`  'ct.v.${v.id}.n':'${q(tria(v, 'nom'))}',`);
    f.push(`  'ct.v.${v.id}.q':'${q(tria(v, 'quees'))}',`);
    f.push(`  'ct.v.${v.id}.l':'${q(tria(v, 'llegeix'))}',`);
  });
  Object.entries(FRASES).forEach(([k, v]) => f.push(`  '${k}':'${q(v[l])}',`));
  return f.join('\n');
}

/* ══ EL BLOC DE LA PÀGINA DEL MÈTODE ═════════════════════════════════════════
   La portada ven i aquesta pàgina ensenya, i per això no és el mateix bloc: no
   hi van les cinc construccions ni el tria-variables, sinó **l'anatomia** i la
   regla que en surt. Qui és aquí ja ha decidit que li interessa; el que li
   falta és saber llegir-ho.

   Es genera de la mateixa declaració, que és tot el motiu de generar-ho: el dia
   que els noms canviïn —i canviaran, perquè varien de colla a colla—, les dues
   pàgines diran el mateix o no en dirà cap. */
function blocVna() {
  const q = FIGURES.find(x => x.baixos === 4);
  const f = [];
  f.push('<!--VNA-PINYA-->');
  f.push('<!-- GENERAT per SOS/tools/build-castells.js · no s\'edita a mà -->');
  f.push('<section class="mv-sec">');
  f.push('<h2>I la mateixa casa, mirada des de dalt</h2>');
  f.push('<p class="mv-sub">El graf de sobre diu <b>qui dona què a qui</b>. El que no diu és '
    + '<b>on es concentra el pes</b>, perquè un graf no té base. Això ho diu la pinya, i només '
    + 'es veu mirant-la des de dalt.</p>');
  f.push('<div class="ct-wrap">');
  f.push('  <div class="ct-pan ct-pv">');
  f.push('    <figure class="ct-v"><div class="ct-viz">' + planta(q) + '</div>'
    + `<figcaption>La planta d'un ${esc(q.nom.replace(/^El /, ''))} · ${4 * q.baixos} rengles</figcaption></figure>`);
  f.push('    <div class="ct-txt">');
  f.push('      <p class="ct-quan">Una <b>rengla</b> és cada filera de gent que surt del tronc cap '
    + 'enfora. N\'hi ha de tres menes, i es diuen pel nom de la mà que les encapçala.</p>');
  f.push('      <ul class="ct-ll ct-anat">' + MENES.map(m =>
    `<li><i style="background:${COL_MENA[m.id]}"></i><b>${esc(m.nom)}</b> `
    + `<span class="ct-n">${m.quantes(q.baixos)}</span> ${esc(m.diu)}</li>`).join('') + '</ul>');
  f.push(`      <p class="ct-diu"><b>Una pinya de N baixos obre 4N rengles.</b> Un dos n'obre `
    + `${4 * 2}, un tres ${4 * 3}, un quatre ${4 * 4} i un cinc ${4 * 5}. I per això un instrument `
    + 'de setze factors cap en la planta d\'un quatre sense forçar res: un factor per rengla.</p>');
  f.push('      <p class="ct-diu">De les tres menes, <b>el vent és l\'única que toca dues àrees '
    + 'alhora</b> —una mà a cada pilar—, i per tant l\'única que impedeix que se separin. Una planta '
    + 'amb els vents buits és una casa amb àrees que no es toquen.</p>');
  f.push('      <p class="ct-avis">Això ordena i fa visible; <b>no puntua</b>. Un castell no diu si '
    + 'una casa va bé: diu on es concentra el pes i quines rengles té buides.</p>');
  f.push('    </div>');
  f.push('  </div>');
  f.push(`  <p class="ct-llei"><b>I la llei que lliga les dues mirades:</b> en castells no es guanya `
    + 'alçada sense guanyar base. <b>La pinya creix més de pressa que el tronc</b>, i en una casa és '
    + 'igual: cada pis d\'ambició demana més rengles obertes, no més gent a la mateixa.</p>');
  f.push('</div>');
  f.push('</section>');
  f.push('<!--/VNA-PINYA-->');
  return f.join('\n');
}

/* ══ EL QUE SE'N PORTA QUI HO REQUEREIX ══════════════════════════════════════
   Les proves necessiten `pinyaDeMapa` per comprovar la cosa que de debò importa
   —que treure un parell del cas mogui les dues vistes— i requerir aquest fitxer
   no ha d'executar ni les guardes ni l'escriptura: una prova que escriu a
   `index.html` deixa de ser una prova.

   Mateix patró que `build-oferta.js` i `build-mapavalor.js`. */
module.exports = { FIGURES, VARIABLES, MENES, POSICIONS, direccions, rengles, pinyaDeMapa };
if (require.main !== module) return;

/* ══ LES GUARDES ═════════════════════════════════════════════════════════════ */

/* 1 · LA QUE IMPORTA · una pinya de N baixos obre 4N direccions, i la planta
      n'ha de dibuixar exactament aquestes. Una planta amb tres rengles per a un
      castell de quatre no peta: és una figura que no existeix, dibuixada com si
      existís, i la llegiria tothom sense adonar-se'n. */
(() => {
  const mal = FIGURES.filter(x => {
    const d = direccions(x.baixos);
    const n = m => d.filter(y => y.mena === m).length;
    return d.length !== 4 * x.baixos
      || MENES.some(m => n(m.id) !== m.quantes(x.baixos));
  });
  if (mal.length) bad('plantes amb una composició de rengles diferent de la declarada: '
    + mal.map(x => x.nom).join(', ') + ' — el dibuix diria una pinya que no existeix');
  else ok(`${FIGURES.length} construccions, totes amb N primeres mans + N vents + 2N laterals: `
    + FIGURES.map(x => `${x.nom.replace(/^(El|La) /, '')} ${4 * x.baixos}`).join(' · '));
})();

// 2 · I el dibuix ha de tenir les línies que el càlcul diu.
(() => {
  const mal = FIGURES.filter(x => (planta(x).match(/class="pl-l /g) || []).length !== 4 * x.baixos);
  if (mal.length) bad('plantes dibuixades amb un nombre de línies diferent del calculat: '
    + mal.map(x => x.nom).join(', '));
  else ok('i el dibuix en té exactament aquestes, no les que quedaven bé');
})();

/* 3 · Cap variable que no càpiga a la seva planta. Una variable de setze
      dimensions sobre una planta de dotze perdria quatre factors **en silenci**:
      es dibuixarien les dotze primeres i el client llegiria el resultat com si
      fos sencer. */
(() => {
  const mal = VARIABLES.map(v => {
    const f = FIGURES.find(x => x.id === v.fig);
    if (!f) return `${v.id} → figura «${v.fig}» inexistent`;
    if (['primera', 'lateral', 'vent', 'totes'].indexOf(v.sobre) < 0)
      return `${v.id} → «${v.sobre}» no és cap mena de rengla`;
    const r = repartiment(f, v);
    return v.dims.length > r.caben
      ? `${v.id}: ${v.dims.length} dimensions i només ${r.caben} ${v.sobre === 'totes' ? 'rengles' : v.sobre} `
      : (r.mapa.size !== v.dims.length ? `${v.id}: se'n dibuixen ${r.mapa.size} de ${v.dims.length}` : null);
  }).filter(Boolean);
  if (mal.length) bad('variables que no caben on van: ' + mal.join('; ')
    + ' — les que sobrin no es dibuixarien i ningú ho sabria');
  else ok(`${VARIABLES.length} variables, totes dibuixades senceres allà on van`);
})();

/* 4 · El 16 no és casualitat i s'ha de poder comprovar: ha d'existir una
      construcció que n'obri exactament setze, o la tesi que un instrument de
      setze factors hi cap es queda sense dibuix. */
(() => {
  const q = FIGURES.find(x => 4 * x.baixos === 16);
  const v = VARIABLES.find(x => x.dims.length === 16);
  if (!q) bad('cap construcció obre 16 rengles: la tesi del 16PF es queda sense planta');
  else if (!v) bad('cap variable de 16 dimensions: la planta de 16 es queda sense cas');
  else if (v.fig !== q.id) bad(`la variable de 16 dimensions no va sobre «${q.nom}»`);
  else ok(`«${q.nom}» obre 16 rengles (4 + 4 + 8) i «${v.nom}» els omple: el 16 quadra`);
})();

// 5 · Cap figura sense dir què vol dir en una casa, o és decoració castellera.
(() => {
  const mudes = FIGURES.filter(x => !x.diu || x.diu.length < 80 || !x.quan);
  if (mudes.length) bad('figures sense la lectura per a una organització: ' + mudes.map(x => x.id).join(', '));
  else ok('i totes diuen què vol dir aquella planta en una casa, no només com es diu');
})();

/* 6 · Les dues vistes han de sortir totes dues. La planta sola no sap d'alçada
      i l'alçat sol no sap de direccions: la lectura que es ven només existeix
      creuant-les. */
(() => {
  const b = bloc();
  const np = (b.match(/class="pl-svg"/g) || []).length;
  const na = (b.match(/class="al-svg"/g) || []).length;
  if (na < FIGURES.length || np < FIGURES.length)
    bad(`${np} plantes i ${na} alçats per a ${FIGURES.length} figures: les dues vistes han d'anar juntes`);
  else if (!/no es guanya\s+alçada sense guanyar base/.test(b.replace(/\s+/g, ' ')))
    bad('falta la llei que lliga les dues vistes: sense ella són dos dibuixos i no un argument');
  else ok(`${np} plantes i ${na} alçats, i la llei que les lliga escrita`);
})();

// 7 · Cap xifra d'euros: això ordena i fa visible, no pressuposta.
(() => {
  if (/\d[\d.]*\s*€/.test(bloc() + blocVista() + blocRols()))
    bad('el bloc porta xifres d\'euros: aquesta secció no ven cap preu');
  else ok('cap preu als blocs: ordenen i fan visible, no pressuposten');
})();

/* 8 · UNA SOLA ANATOMIA. `direccions(n)` i `rengles(n)` han de dir el mateix:
      els mateixos angles i les mateixes menes. Són dues maneres de recórrer la
      pinya —per angle i per pilar— i el dia que una divergís, la planta d'una
      variable i la planta d'un mapa dibuixarien dues pinyes diferents amb el
      mateix nom i cap de les dues petaria. */
(() => {
  const mal = [1, 2, 3, 4, 5, 7].filter(n => {
    const a = direccions(n).map(d => `${d.a.toFixed(4)}/${d.mena}`).sort();
    const b = rengles(n).flatMap(p => p.rengles).map(d => `${d.a.toFixed(4)}/${d.mena}`).sort();
    return a.join('|') !== b.join('|');
  });
  if (mal.length) bad('`rengles()` i `direccions()` descriuen pinyes diferents per a n = '
    + mal.join(', ') + ' — dues anatomies amb el mateix nom');
  else ok('`rengles()` per pilar i `direccions()` per angle descriuen la mateixa pinya');
})();

/* 9 · LA QUE FA QUE SIGUIN DUES VISTES I NO DOS DIBUIXOS. Tot lliurament del
      mapa ha de caure a una rengla i a una sola. Si la traducció en perd un, el
      castell dibuixa una casa que no és la del graf —i es veuria bonic
      igualment, que és el que fa aquest defecte car de trobar. */
(() => {
  const pin = pinyaDeMapa(CELLER);
  const total = CELLER.parells.length * 2;
  const posats = pin.pilars.reduce((a, p) => a + p.rebuts.length, 0);
  const cops = new Map();
  pin.pilars.forEach(p => p.rebuts.forEach(f => cops.set(f, (cops.get(f) || 0) + 1)));
  const dos = [...cops.values()].filter(x => x > 1).length;
  if (posats !== total) bad(`el mapa té ${total} lliuraments i la pinya en col·loca ${posats}`
    + ' — els que falten no es dibuixarien i la planta diria una casa més simple del que és');
  else if (dos) bad(`${dos} lliuraments cauen a més d'una rengla: es comptarien dues vegades`);
  else if (pin.fl.some(f => !MENES.some(m => m.id === f.linia)))
    bad('hi ha lliuraments amb una mena de rengla que no existeix');
  else ok(`els ${total} lliuraments del mapa cauen a una rengla i a una sola`);
})();

/* 10 · I el dibuix ha de portar-los. Les rengles dibuixades han de ser les 4N
       que obre la pinya, i les rodones, un lliurament cada una. */
(() => {
  const pin = pinyaDeMapa(CELLER);
  const svg = plantaMapa(pin, ID_PLANTA);
  const nl = (svg.match(/class="pl-l /g) || []).length;
  const ng = (svg.match(/class="pl-g"/g) || []).length;
  /* Es compten **les catalanes**: des que cada node porta una etiqueta per
     llengua, comptar totes les `pl-nom` donaria el doble i la guarda deixaria
     de dir res el dia que en faltés una. */
  const noms = (svg.match(/class="pl-nom mv-ca"/g) || []).length;
  if (nl !== pin.obertes) bad(`la planta del mapa dibuixa ${nl} rengles i la pinya n'obre ${pin.obertes}`);
  else if (ng !== CELLER.parells.length * 2)
    bad(`la planta dibuixa ${ng} persones i el mapa té ${CELLER.parells.length * 2} lliuraments`);
  else if (noms < CELLER.nodes.length)
    bad(`${noms} noms escrits per a ${CELLER.nodes.length} nodes: la vista castell ha de portar els noms`);
  else ok(`i el dibuix en té ${ng} sobre ${nl} rengles, amb els ${CELLER.nodes.length} noms escrits`);
})();

/* 11 · El pols ha de poder apagar les dues vistes alhora. El graf marca amb
       `data-para` el que s'atura quan s'encalla el node del cas; si la planta no
       en marca res, aturar el graf la deixaria sencera i la planta seria
       decoració. És el defecte que mirant la pàgina no es veu, perquè les dues
       imatges són maques per separat. */
(() => {
  const pin = pinyaDeMapa(CELLER);
  const svg = plantaMapa(pin, ID_PLANTA);
  const n = (svg.match(/data-para="1"/g) || []).length;
  const esperats = pin.fl.filter(pin.tocaEnc).length;
  if (!CELLER.encallament) bad('el cas no declara cap encallament i la vista castell no pot apagar-se');
  else if (!n) bad('la planta del mapa no marca res amb `data-para`: s\'encallaria el graf i el castell '
    + 'es quedaria sencer');
  else if (!svg.includes(`id="${ID_PLANTA}"`)) bad(`la planta no porta l'id ${ID_PLANTA}, que és el que els botons busquen`);
  else ok(`la planta marca el que s'atura amb el node encallat (${esperats} lliuraments) i els botons la troben`);
})();

/* 12 · Cap posició sense la traducció a una casa. Una posició que només digui
       què fa en un castell és folklore: el producte és la segona columna. */
(() => {
  const mal = POSICIONS.filter(p => !p.casa || p.casa.length < 60 || !p.castell || !p.nom);
  const foraOn = POSICIONS.filter(p => !ON.some(g => g.id === p.on));
  const menaMala = POSICIONS.filter(p => p.mena && !MENES.some(m => m.id === p.mena));
  const aports = (VARIABLES.find(v => v.id === 'aports') || { dims: [] }).dims.map(d => d.nom);
  const aportMal = POSICIONS.filter(p => !aports.includes(p.aport));
  if (mal.length) bad('posicions sense dir què són en una casa: ' + mal.map(p => p.id).join(', ')
    + ' — això és folklore, no un vocabulari que es pugui fer servir');
  else if (foraOn.length) bad('posicions en un lloc que no existeix: ' + foraOn.map(p => p.id).join(', '));
  else if (menaMala.length) bad('posicions amb una mena de rengla inexistent: ' + menaMala.map(p => p.id).join(', '));
  else if (aportMal.length) bad('posicions amb una aportació que el SOS no demana: '
    + aportMal.map(p => `${p.id} → «${p.aport}»`).join(', '));
  else ok(`${POSICIONS.length} posicions, totes amb què fan al castell, què són a una casa i amb quina aportació encaixen`);
})();

/* 12b · I cap posició sense **nom de rol**, sense exemples i sense arquetip.
       La traducció era una frase, i una frase no es pot repetir en veu alta: el
       que ha de sortir de la taula és «tu ets el meu dos», i per dir-ho cal un
       nom. Els exemples són el que fa que una casa s'hi reconegui sense haver
       de traduir res, i l'arquetip és el que lliga el nom a una de les dotze
       preguntes del panteó —si no hi fos, el nom seria un invent nostre.

       Una posició sense `org` no peta: la columna es queda amb la frase d'abans
       i sembla que hi és tot. */
(() => {
  const falten = [];
  POSICIONS.forEach(p => {
    if (!p.org) falten.push(`${p.id}.org`);
    if (!p.orgEs) falten.push(`${p.id}.orgEs`);
    if (!p.ex || p.ex.split('·').length < 2) falten.push(`${p.id}.ex (menys de dos exemples)`);
    if (!p.exEs) falten.push(`${p.id}.exEs`);
    if (!p.arq) falten.push(`${p.id}.arq`);
    else if (!PANTEO[p.arq]) falten.push(`${p.id}.arq → «${p.arq}» no és del panteó`);
  });
  /* I que els arquetips no es repeteixin: dues posicions responent la mateixa
     pregunta vol dir que una de les dues no s'ha pensat. */
  const usats = POSICIONS.map(p => p.arq);
  const rep = usats.filter((x, i) => usats.indexOf(x) !== i);
  if (falten.length) bad('posicions sense nom de rol, exemples o arquetip: ' + falten.slice(0, 6).join(', ')
    + (falten.length > 6 ? ` … (+${falten.length - 6})` : '')
    + ' — sense nom no es pot dir «tu ets el meu dos», que és el que fa útil la taula');
  else if (rep.length) bad('arquetips repetits: ' + [...new Set(rep)].join(', ')
    + ' — dues posicions responent la mateixa pregunta vol dir que una no s\'ha pensat');
  else ok(`${POSICIONS.length} rols amb nom, exemples i la pregunta del panteó de què són resposta`
    + ` · ${Object.keys(PANTEO).length - POSICIONS.length} arquetip sense posició: `
    + Object.keys(PANTEO).filter(k => !usats.includes(k)).map(k => PANTEO[k].nom).join(', ')
    + ' (la celebració no la fa ningú en concret)');
})();

/* 13 · Les tres menes de rengla han de tenir posició, i les vuit funcions del
       SOS han d'estar cobertes exactament un cop. Un joc d'arquetips amb set
       entrades no peta: qui el triï es queda sense una funció i ningú ho veu. */
const FN_SOS = ['metaskill', 'design', 'coord', 'audit', 'exec', 'facil', 'lms', 'fund'];
(() => {
  const senseMena = MENES.filter(m => !POSICIONS.some(p => p.mena === m.id));
  const fns = POSICIONS.filter(p => p.fn).map(p => p.fn);
  const falten = FN_SOS.filter(x => !fns.includes(x));
  const sobren = fns.filter(x => !FN_SOS.includes(x));
  const rep = fns.filter((x, i) => fns.indexOf(x) !== i);
  if (senseMena.length) bad('menes de rengla sense posició declarada: ' + senseMena.map(m => m.id).join(', ')
    + ' — el dibuix les pintaria i la llegenda no les sabria anomenar');
  else if (falten.length) bad('funcions del SOS sense posició castellera: ' + falten.join(', ')
    + ' — un joc d\'arquetips incomplet deixa qui el triï sense aquella funció i no peta');
  else if (sobren.length) bad('posicions amb una funció que el SOS no té: ' + sobren.join(', '));
  else if (rep.length) bad('funcions repartides dues vegades: ' + [...new Set(rep)].join(', '));
  else ok(`les 3 menes tenen nom i les ${FN_SOS.length} funcions del SOS tenen posició, una cada una`);
})();

/* 14 · EL JOC D'ARQUETIPS DEL SOS HA DE DIR EL MATEIX QUE AQUÍ. L'app té un
       joc `casteller` a `ARCHETYPE_SETS` i les posicions viuen aquí. Dues
       llistes de noms castellers divergirien el dia que una es corregís —i els
       noms **canvien de colla a colla**, o sigui que es corregiran— i no
       petaria res: l'app oferiria un vocabulari i la web un altre, i ningú
       compararia les dues pantalles.

       Es comprova pel nom visible i per la funció: tota entrada del joc ha de
       ser una posició declarada, i tota posició amb `fn` ha de sortir al joc. */
(() => {
  const APP = join(ARREL, 'SOS', 'index.html');
  if (!existsSync(APP)) { bad('no existeix SOS/index.html'); return; }
  const app = readFileSync(APP, 'utf8');
  const i = app.indexOf("  casteller:{label:'Casteller',archetypes:{");
  if (i < 0) { bad("l'app no porta el joc d'arquetips `casteller`: el pont cap al SOS no existeix"); return; }
  const fi = app.indexOf('  }},', i);
  const bloc = app.slice(i, fi < 0 ? i + 4000 : fi);
  const joc = [...bloc.matchAll(/\{name:'((?:[^'\\]|\\.)*)',ic:'[^']*',role:'(?:[^'\\]|\\.)*',fn:'([a-z]+)'\}/g)]
    .map(m => ({ nom: m[1].replace(/\\'/g, "'"), fn: m[2] }));
  const ambFn = POSICIONS.filter(p => p.fn);
  const forans = joc.filter(j => !POSICIONS.some(p => p.nom === j.nom));
  const absents = ambFn.filter(p => !joc.some(j => j.nom === p.nom));
  const malFn = joc.filter(j => {
    const p = POSICIONS.find(x => x.nom === j.nom);
    return p && p.fn !== j.fn;
  });
  if (joc.length !== FN_SOS.length)
    bad(`el joc casteller de l'app té ${joc.length} entrades i les funcions del SOS són ${FN_SOS.length}`);
  else if (forans.length) bad("el joc de l'app porta noms que no són posicions declarades: "
    + forans.map(j => j.nom).join(', '));
  else if (absents.length) bad('posicions amb funció que no surten al joc de l\'app: '
    + absents.map(p => p.nom).join(', '));
  else if (malFn.length) bad('posicions amb una funció diferent a l\'app i aquí: '
    + malFn.map(j => `${j.nom} (${j.fn})`).join(', '));
  else ok(`i el joc casteller de l'app diu les mateixes ${joc.length} posicions amb les mateixes funcions`);
})();

/* ══ ESCRIURE O COMPROVAR ════════════════════════════════════════════════════ */
/* ⚠ **Les construccions se'n van a `/vna`** (04/10/2026). Eren la secció més
   llarga de la portada —60 KB de 575— i parlen del mètode: quines
   construccions hi ha, quantes rengles obre cada pinya i què vol dir el vent.
   La portada ven el mapa de valor i hi porta; el mètode viu a `/vna`.

   `TT-VISTA-CASTELL` es queda: és **la segona vista del mateix dibuix** a
   `#dues-vistes`, que és el producte, i sense ella la portada ensenyaria mig
   argument. I `blocRols` deixa d'escriure's a la portada —hi era dues vegades,
   aquí i a `/vna`, i dues còpies divergeixen. */
const VNA = join(ARREL, 'SOS', 'vna.html');
const DESTINS = [
  { f: HOME, marca: 'TT-VISTA-CASTELL', fn: blocVista, nom: 'index.html' },
  { f: VNA, marca: 'VNA-CONSTRUCCIONS', fn: bloc, nom: 'SOS/vna.html' },
  { f: VNA, marca: 'VNA-XARXA-PINYA', fn: blocXarxaPinya, nom: 'SOS/vna.html' },
  { f: VNA, marca: 'VNA-PINYA', fn: blocVna, nom: 'SOS/vna.html' },
  { f: VNA, marca: 'VNA-ROLS', fn: blocRols, nom: 'SOS/vna.html' }
];
/* Els diccionaris de la portada. Van abans dels blocs i a part: una clau al
   marcatge sense entrada al diccionari deixa el text escrit a mà —que és
   exactament el que passava amb aquests blocs sencers. */
if (!fails) {
  const f = HOME;
  if (!existsSync(f)) bad('no existeix index.html');
  else {
    let src = readFileSync(f, 'utf8'), tocat = false;
    /* **Només les claus que la portada demana.** Amb les construccions mudades
       a `/vna` (04/10/2026), escriure el diccionari sencer aquí deixava
       dues-centes quatre claus que no tradueixen res —i una clau morta fa
       creure que aquell text està cobert. El que queda a la portada és el
       dibuix del hero i la segona vista de `#dues-vistes`. */
    const vol = new Set([...src.matchAll(/data-i18n(?:-html)?="((?:ct|rl|cv|xp)\.[^"]+)"/g)].map(m => m[1]));
    [['CA', 'ca'], ['ES', 'es']].forEach(([M, l]) => {
      const a = `/*TT-CT-I18N-${M}*/`, b = `/*/TT-CT-I18N-${M}*/`;
      const x = src.indexOf(a), y = src.indexOf(b);
      if (x < 0 || y <= x) { bad(`falten les marques ${a} a index.html`); return; }
      const cos = dicCastells(l).split('\n')
        .filter(li => { const k = (li.match(/'([\w.-]+)':/) || [])[1]; return !k || vol.has(k); }).join('\n');
      const out = src.slice(0, x + a.length) + '\n' + cos + '\n' + src.slice(y);
      if (out !== src) { src = out; tocat = true; }
    });
    if (CHECK) { if (tocat) bad('el diccionari dels castells no correspon a la declaració'); }
    else if (tocat) writeFileSync(f, src);
  }
}

if (!fails) DESTINS.forEach(d => {
  if (!existsSync(d.f)) { bad('no existeix ' + d.nom); return; }
  const src = readFileSync(d.f, 'utf8');
  const a = src.indexOf(`<!--${d.marca}-->`), b = src.indexOf(`<!--/${d.marca}-->`);
  if (a < 0 || b < 0 || b < a) { bad(`falten les marques <!--${d.marca}--> a ${d.nom}`); return; }
  const out = src.slice(0, a) + d.fn(d.marca) + src.slice(b + `<!--/${d.marca}-->`.length);
  if (CHECK) {
    if (out !== src) bad(`${d.nom} no correspon a la declaració de build-castells.js`);
  } else if (out !== src) writeFileSync(d.f, out);
});
if (CHECK && !fails) ok('els blocs de la pinya estan al dia a les dues pàgines');

/* ══ I LES CLAUS QUE AQUEST FITXER DEIXA A `/vna` ════════════════════════════
   `/vna` té diccionari propi des del 03/10/2026, i l'escriu
   `build-mapavalor.js`. Però els blocs d'aquí —la planta i els rols— també hi
   deixen claus, i aquell generador no les coneix: la del títol de la planta
   es quedava al marcatge sense entrada, i qui llegeix la pàgina en castellà
   amb un lector de pantalla sentia el dibuix en català.

   No s'hi aboca el diccionari sencer de la portada: serien dues-centes claus
   que ningú demana, i la guarda de `/vna` les comptaria com a mortes —amb raó.
   S'hi escriuen **només les que els blocs d'aquesta pàgina fan servir**, i es
   troben llegint el que s'acaba d'escriure. Així, el dia que un bloc d'aquí hi
   deixi una clau nova, vindrà sola. */
if (!fails) {
  const f = join(ARREL, 'SOS', 'vna.html');
  if (!existsSync(f)) bad('no existeix SOS/vna.html');
  else {
    let src = readFileSync(f, 'utf8'), tocat = false;
    const meus = new Set();
    /* Els blocs que viuen a `/vna`. Des de l'endreça (04/10/2026) també hi
       són les construccions i la planta de la xarxa: amb la llista vella,
       cent seixanta-quatre claus del marcatge es quedaven sense entrada i el
       text sortia en català damunt de la pàgina castellana. */
    ['VNA-PINYA', 'VNA-ROLS', 'VNA-CONSTRUCCIONS', 'VNA-XARXA-PINYA'].forEach(m => {
      const a = src.indexOf(`<!--${m}-->`), b = src.indexOf(`<!--/${m}-->`);
      if (a < 0 || b <= a) return;
      [...src.slice(a, b).matchAll(/data-i18n(?:-html)?="((?:ct|rl|cv|xp)\.[^"]+)"/g)].forEach(x => meus.add(x[1]));
    });
    [['CA', 'ca'], ['ES', 'es']].forEach(([M, l]) => {
      const a = `/*VNA-CT-I18N-${M}*/`, b = `/*/VNA-CT-I18N-${M}*/`;
      const x = src.indexOf(a), y = src.indexOf(b);
      if (x < 0 || y <= x) { bad(`falten les marques ${a} a SOS/vna.html`); return; }
      const cos = dicCastells(l).split('\n')
        .filter(li => [...meus].some(k => li.indexOf(`'${k}':`) >= 0)).join('\n');
      const out = src.slice(0, x + a.length) + '\n' + cos + '\n' + src.slice(y);
      if (out !== src) { src = out; tocat = true; }
    });
    if (CHECK) { if (tocat) bad('les claus de la pinya a /vna no corresponen a la declaració'); }
    else if (tocat) writeFileSync(f, src);
    if (!CHECK || !tocat) ok(`${meus.size} clau(s) dels blocs de la pinya, escrites al diccionari de /vna`);
  }
}

if (CHECK) {
  console.log(fails ? '\n❌ Arregla-ho amb:  node SOS/tools/build-castells.js' : '\n✅ La pinya quadra.');
  process.exit(fails ? 1 : 0);
}
if (fails) { console.log('\n❌ No s\'ha escrit res.'); process.exit(1); }
console.log(`\n✅ index.html · ${FIGURES.length} plantes de ${4 * FIGURES[0].baixos} a `
  + `${4 * FIGURES[FIGURES.length - 1].baixos} direccions, i ${VARIABLES.length} variables`);

