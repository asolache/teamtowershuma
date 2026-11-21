/* La sèrie del SOS, declarada un sol cop
 * ─────────────────────────────────────────────────────────────────────────────
 * La llegeixen `build-comando.js` (la cara de ficció, a comando.html) i
 * `build-molekulandia.js` (la cara oficial, a molekulandia.html). És un mòdul
 * sense efectes: no escriu res, només declara i llegeix formacio.html.
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

/* ══ LA SÈRIE DEL SOS · capítol → mòdul de formació ═════════════════════════
   Encàrrec de l'Álvaro (21/11/2026): qui miri la sèrie ha d'aprendre a operar
   amb el model. Per això cada capítol porta **un mòdul** del pla de formació
   (`formacio.html#mN`), i no al revés: la sèrie no és un anunci de la formació,
   és la formació en forma de relat. I cada capítol és alhora material de la
   pel·lícula: el que s'hi filma amb gent de debò és pla de la pel·lícula.

   Quatre decisions que no són òbvies:

   · **Un capítol, un mòdul.** 22 mòduls, 22 capítols, en tres temporades que
     són els tres blocs. Si un capítol en volgués ensenyar dos, no n'ensenyaria
     cap: el que mira se'n recorda d'un gest per capítol.
   · **El nom del mòdul no s'escriu aquí: es llegeix de `formacio.html`.** Els
     noms estan canviant cap als oficials (PR #408, `noms-oficials.md`) i una
     còpia aquí es quedaria amb els vells. Quan canviïn, es torna a córrer aquest
     generador i la pàgina els agafa sola.
   · **Dues cares, una declaració.** La sèrie del SOS és oficial: el capítol el
     fa una professió de Molekulandia (`professio`) en un servei de la plaça
     (`servei`: l'id de la dinàmica, `negoci` per a la botiga de cadascú o
     `null` per a tota la plaça). El Comando hi posa la ficció (`heroi`, `vila`).
     `molekulandia.html` pinta la primera; `comando.html`, la segona.
   · **Personatges i vilans només del relat.** `heroi` ha de ser a
     `CANONICAL_HEROES` i `vila` a `COMANDO_VILLAINS` (o res): els 14 surten
     almenys un cop, i el vilà és el problema que el mòdul resol, no un
     decorat.
   · **Tot capítol acaba amb una prova que es fa de debò** (`prova`): la mateixa
     evidència del mòdul, prou petita per fer-la en deu minuts. Sense prova, qui
     mira ha vist un capítol; amb la prova, ha començat el mòdul. */
const TEMPORADES = [
  { n: 1, t: 'Com s\'arma la colla', bloc: 'Bloc A · Fonaments', moduls: 'm1–m8' },
  { n: 2, t: 'L\'ofici de sostenir', bloc: 'Bloc B · L\'ofici comunitari', moduls: 'm9–m16' },
  { n: 3, t: 'La web viva', bloc: 'Bloc C · La teva web viva', moduls: 'm17–m22' }
];
const SERIE = [
  { c: 1, t: 1, m: 'm1', professio: 'dades', servei: null,
    heroi: 'Horacio Motomachi', vila: 'Max Miedox',
    apren: 'Què és un sistema digital que és teu: on viuen les dades i qui en té la clau.',
    prova: 'Obrir el SOS i fer-se el perfil sense compte ni contrasenya.' },
  { c: 2, t: 1, m: 'm2', professio: 'dades', servei: null,
    heroi: 'El Aviador', vila: 'Mala Yerbax',
    apren: 'Signar el que aportes i comprovar qui ha signat el que llegeixes.',
    prova: 'Signar una primera aportació i verificar-ne la signatura.' },
  { c: 3, t: 1, m: 'm3', professio: 'facilitacio', servei: 'mapeig_vna',
    heroi: 'Pigmentón', vila: null,
    apren: 'Dibuixar una xarxa de valor: rols, i què dona i què rep cadascú.',
    prova: 'Un mapa de valor amb cinc rols i els seus intercanvis.' },
  { c: 4, t: 1, m: 'm4', professio: 'circular', servei: 'banc_temps',
    heroi: 'Reciclator', vila: 'Mr. McGragor',
    apren: 'Posar en comú hores i objectes perquè no calgui comprar-ho de nou.',
    prova: 'Oferir una hora o un objecte al banc de temps del barri.' },
  { c: 5, t: 1, m: 'm5', professio: 'impuls', servei: null,
    heroi: 'Mazinguer', vila: 'Mala Yerbax',
    apren: 'Decidir en grup amb regles clares que tothom pot llegir.',
    prova: 'Una decisió presa amb proposta, termini i resultat registrats.' },
  { c: 6, t: 1, m: 'm6', professio: 'impuls', servei: 'coop_treball',
    heroi: 'Electroplasman', vila: 'Mr. McGragor',
    apren: 'Repartir de manera justa el que aporta cadascú en un projecte col·lectiu.',
    prova: 'El repartiment d\'un projecte petit, amb les aportacions de cada persona.' },
  { c: 7, t: 1, m: 'm7', professio: 'relat', servei: 'suport_mutu',
    heroi: 'Afrodita', vila: 'Max Miedox',
    apren: 'Fer visible i reconeguda una aportació que ningú veia.',
    prova: 'Una aportació registrada i confirmada per una altra persona.' },
  { c: 8, t: 1, m: 'm8', professio: 'dades', servei: 'cens_entitats',
    heroi: 'La Medusa Andaluza', vila: 'Mala Yerbax',
    apren: 'Publicar dades obertes i fer servir la IA amb criteri, sense que s\'inventi res.',
    prova: 'Una dada del grup publicada al registre públic.' },
  { c: 9, t: 2, m: 'm9', professio: 'facilitacio', servei: 'suport_mutu',
    heroi: 'El Anguila', vila: 'Max Miedox',
    apren: 'Dinamitzar una trobada perquè tothom parli i surti una acció.',
    prova: 'Una sessió de grup amb ordre del dia, ritme i acord final.' },
  { c: 10, t: 2, m: 'm10', professio: 'relat', servei: null,
    heroi: 'Mazinguer', vila: 'Max Miedox',
    apren: 'Explicar el projecte perquè s\'hi sumi gent nova.',
    prova: 'Un missatge de crida i les tres primeres persones que hi responen.' },
  { c: 11, t: 2, m: 'm11', professio: 'cura', servei: 'suport_mutu',
    heroi: 'Guiri-Guay', vila: 'Mala Yerbax',
    apren: 'Tenir cura de l\'equip i desfer un conflicte abans que es podreixi.',
    prova: 'Una conversa de cura feta i el relleu d\'una tasca acordat.' },
  { c: 12, t: 2, m: 'm12', professio: 'assessorament', servei: 'matriu',
    heroi: 'Electroplasman', vila: 'Mr. McGragor',
    apren: 'Trobar el finançament que encaixa i preparar-ne la sol·licitud.',
    prova: 'Una convocatòria triada i el seu calendari apuntat.' },
  { c: 13, t: 2, m: 'm13', professio: 'assessorament', servei: 'matriu',
    heroi: 'Barbamuda', vila: 'Max Miedox',
    apren: 'Triar la forma jurídica que sosté el grup i fer-ne els tràmits.',
    prova: 'La forma jurídica triada, amb la llista de tràmits.' },
  { c: 14, t: 2, m: 'm14', professio: 'dades', servei: null,
    heroi: 'Fraktalman', vila: 'Mr. McGragor',
    apren: 'Mesurar l\'impacte i justificar-lo amb el que ja està registrat.',
    prova: 'Tres indicadors d\'impacte llegits del registre del grup.' },
  { c: 15, t: 2, m: 'm15', professio: 'assessorament', servei: 'cens_entitats',
    heroi: 'Purpleman', vila: 'Mr. McGragor',
    apren: 'Protegir les dades de les persones i complir el RGPD.',
    prova: 'El registre de quines dades es guarden, per què i fins quan.' },
  { c: 16, t: 2, m: 'm16', professio: 'aprenentatge', servei: null,
    heroi: 'Supergerminador', vila: 'Max Miedox',
    apren: 'Ensenyar el mètode a algú altre perquè es repliqui sol.',
    prova: 'Una persona nova acompanyada fins a la seva primera evidència.' },
  { c: 17, t: 3, m: 'm17', professio: 'facilitacio', servei: 'negoci',
    heroi: 'Pigmentón', vila: null,
    apren: 'Fer el mapa de valor de la teva organització.',
    prova: 'Un mapa que passa les deu regles, desat a «Els meus mapes».' },
  { c: 18, t: 3, m: 'm18', professio: 'dades', servei: 'negoci',
    heroi: 'Horacio Motomachi', vila: 'Mala Yerbax',
    apren: 'Donar a la IA el coneixement de l\'organització perquè no s\'inventi res.',
    prova: 'La mateixa pregunta a la IA, amb el cervell i sense, comparada.' },
  { c: 19, t: 3, m: 'm19', professio: 'dades', servei: 'negoci',
    heroi: 'La Medusa Andaluza', vila: 'Mr. McGragor',
    apren: 'Fer la web corporativa a partir del mapa de valor.',
    prova: 'Una web en previsualització que surt del mapa.' },
  { c: 20, t: 3, m: 'm20', professio: 'dades', servei: 'negoci',
    heroi: 'El Aviador', vila: 'Max Miedox',
    apren: 'Editar i publicar continguts web sense trencar res.',
    prova: 'Un canvi a la web revisat a la previsualització i publicat.' },
  { c: 21, t: 3, m: 'm21', professio: 'dades', servei: 'negoci',
    heroi: 'El Anguila', vila: null,
    apren: 'Automatitzar un formulari o un procés perquè vagi sol.',
    prova: 'Un formulari que arriba sol on ha d\'arribar.' },
  { c: 22, t: 3, m: 'm22', professio: 'aprenentatge', servei: 'negoci',
    heroi: 'Supergerminador', vila: 'Mr. McGragor',
    apren: 'Treballar amb un assistent d\'IA sense dependre de ningú.',
    prova: 'Una tasca real feta amb l\'assistent i revisada per tu.' }
];
/* L'estructura de tot capítol, en l'ordre en què passa. És la mateixa a tots
   perquè qui mira aprengui on és la part que ha de fer ell. */
const FORMAT = [
  { t: 'El problema', d: 'Un barri o una organització de debò, encallats en una cosa concreta.',
    ficcio: 'El Mundo Muerto', ficcioD: 'El vilà, o el problema, aturant un barri o una organització de debò.' },
  { t: 'El gest', d: 'La persona que fa aquest ofici ensenya l\'única cosa que el capítol vol que aprenguis.',
    ficcio: 'El gest', ficcioD: 'El personatge ensenya l\'única cosa que el capítol vol que aprenguis.' },
  { t: 'Fes-ho tu', d: 'El mateix gest, a la pantalla real del SOS o del mapa, pas a pas.',
    ficcio: 'Fes-ho tu', ficcioD: 'El mateix gest, a la pantalla real del SOS o del mapa, pas a pas.' },
  { t: 'La prova', d: 'Una evidència petita que pots fer avui. És l\'evidència del mòdul.',
    ficcio: 'La prova', ficcioD: 'Una evidència petita que pots fer avui. És l\'evidència del mòdul.' },
  { t: 'Els crèdits', d: 'Qui hi ha sortit, amb el que ha aportat de debò, signat al registre.',
    ficcio: 'Els crèdits', ficcioD: 'Qui hi ha sortit, amb el que ha aportat de debò. Són plans de la pel·lícula.' }
];

/* Nom i hores de cada mòdul, llegits de `formacio.html`, que és on viuen. */
function moduls() {
  const html = readFileSync(join(__dirname, '..', 'formacio.html'), 'utf8');
  return Object.fromEntries([...html.matchAll(
    /<section class="module[^"]*" id="(m\d+)">\s*<div class="num">([^<]*)<\/div>\s*<h2>([^<]*)<\/h2>/g)]
    .map(m => [m[1], { t: m[3].trim(), h: ((m[2].match(/(\d[\d\-–,]*\s*h)\b/) || [])[1] || '').replace(/\s+/g, ' ') }]));
}

/* Les comprovacions que no depenen de cap de les dues cares. Retorna la llista
   de problemes; cada generador decideix com els diu. */
function comprova(M = moduls()) {
  const mal = [];
  SERIE.forEach(c => {
    if (!M[c.m]) mal.push(`el capítol ${c.c} porta el mòdul ${c.m}, que no és a formacio.html`);
    if (!TEMPORADES.some(t => t.n === c.t)) mal.push(`el capítol ${c.c} és d'una temporada ${c.t} que no existeix`);
    if (!c.apren || !c.prova) mal.push(`el capítol ${c.c} no diu què s'aprèn o quina prova deixa`);
  });
  Object.keys(M).filter(m => SERIE.filter(c => c.m === m).length !== 1).forEach(m =>
    mal.push(`el mòdul ${m} surt a ${SERIE.filter(c => c.m === m).length} capítols i n'ha de sortir a un`));
  return mal;
}

module.exports = { TEMPORADES, SERIE, FORMAT, moduls, comprova };
