#!/usr/bin/env node
/* El mapa de valor · la notació, el procés i un cas treballat
 * ─────────────────────────────────────────────────────────────────────────────
 * La casa ven «mapa de valor» a la portada i al catàleg, i fins ara qui volia
 * saber **què és** un mapa de valor tenia una colla castellera. La colla és la
 * millor manera d'entendre'n la idea —tot passa alhora i es veu— i és una mala
 * manera d'entendre'n **la feina**: ningú compra un castell, i el que es compra
 * són rols, transaccions i uns entregables.
 *
 * Aquí es declara el que faltava, un sol cop, i s'escriu a les dues pantalles
 * que ho han de dir:
 *
 *   · `NOTACIO` — què és un node, què és una fletxa, què vol dir plena o
 *     discontínua, i què és un entregable. Sense això, un graf bonic no és
 *     llegible per ningú que no l'hagi dibuixat.
 *   · `PROCES`  — com es fa un mapa de debò, amb **les tres anàlisis de Verna
 *     Allee** pel seu nom: intercanvi, impacte i creació de valor. Els passos
 *     de la pàgina ja en feien dues sense dir-ho.
 *   · `ENTREGABLES` — què s'endú qui ho contracta. La durada i l'entregable
 *     **es llegeixen de `build-oferta.js`**, que és qui els ven: si el catàleg
 *     diu tres sessions i la pàgina en diu dues, la que menteix és la pàgina.
 *   · `CELLER` — un cas treballat d'organització, que és el que faltava per
 *     entendre la proposta sense ser d'un poble.
 *
 * ── El cas, i per què aquest ────────────────────────────────────────────────
 * Un celler del Penedès que es planteja servir turisme de luxe. Serveix perquè
 * ensenya la tesi sencera en un sol dibuix: **el marge no surt de apujar el
 * preu de l'ampolla, surt de cobrar els intangibles que la casa ja produeix i
 * que pel canal tradicional se'n van de franc.** El relat de qui poda, el
 * vessant, el veïnat, el paisatge: tot això ja existeix i no es factura.
 *
 * ── La regla que aquest fitxer no pot trencar ───────────────────────────────
 * **Cap xifra d'euros al cas.** No tenim els números d'aquell celler i
 * inventar-ne per il·lustrar un marge seria exactament el que la guia de marca
 * prohibeix. El que sí que es pot dir és el que el graf té: quants lliuraments
 * mou cada camí i quants en són intangibles. Això es compta, no es promet, i hi
 * ha una guarda que peta si algú hi posa un «€».
 *
 * ── Ús ──────────────────────────────────────────────────────────────────────
 *   node SOS/tools/build-mapavalor.js            escriu els blocs
 *   node SOS/tools/build-mapavalor.js --check    falla si estan vells
 */
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const SOS = join(ARREL, 'SOS');
const CHECK = process.argv.includes('--check');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

/* ══ LA NOTACIÓ ══════════════════════════════════════════════════════════════
   Quatre paraules i no més. Un mapa de valor amb quinze símbols no el llegeix
   ningú a una sala, i a la sala és on s'ha de llegir. */
const NOTACIO = [
  { k: 'node', nom: 'Node', sub: 'un rol, no una persona',
    d: 'El que algú fa, no com es diu al organigrama. Una persona pot ocupar dos nodes i un node el poden ocupar dues persones. Aquest canvi de mirada és tot el mètode.' },
  { k: 'trans', nom: 'Transacció', sub: 'una fletxa, d\'un node a un altre',
    d: 'Alguna cosa que un node lliura a un altre. Té direcció: A dona a B no és el mateix que B dona a A, i dibuixar-ho amb una ratlla sense punta amaga justament el que es vol veure.' },
  { k: 'tang', nom: 'Tangible', sub: 'línia plena',
    d: 'El que es podria facturar o consta en un contracte: producte, hores, diners, un local, un informe. És el que ja surt als comptes.' },
  { k: 'intang', nom: 'Intangible', sub: 'línia discontínua',
    d: 'El que no consta enlloc i sense el qual res funciona: confiança, coneixement que no és a cap manual, reputació, accés, que et tornin el favor. Va discontínua perquè és el que es trenca sense avisar.' },
  { k: 'entrega', nom: 'Entregable', sub: 'el que queda quan marxem',
    d: 'El mapa no és l\'entregable: el mapa és l\'eina. L\'entregable és el que se\'n decideix — què es pot cobrar, què s\'ha de repartir i quin vincle s\'ha de reparar abans que caigui.' }
];

/* ══ EL PROCÉS ═══════════════════════════════════════════════════════════════
   Les tres anàlisis són les de Verna Allee i van pel seu nom. La pàgina ja en
   feia dues —el pas 6 és l'anàlisi d'intercanvi i el 7 la de creació de valor—
   i no les anomenava, de manera que qui buscava el mètode no el reconeixia. */
const PROCES = [
  /* ══ L'ABAST, QUE ÉS EL PAS ZERO ═══════════════════════════════════════
     Hi faltava. El procés començava per «qui hi ha a la sala» i **no deia a
     quina escala es mapa**, i en una organització gran això no és un detall:
     un sol mapa de tota la casa surt amb quaranta nodes i no es llegeix a cap
     sala, que és on s'ha de llegir.

     La manera de fer-ho és la mateixa que l'eina ja fa servir: **zoom**. Es
     mapa un nivell, i el que hi ha a dins de cada node es mapa a part si cal.
     Precisat per l'Àlvar el 02/10/2026, i a IKEA és exactament el que es va
     fer: dos mapes, el de la direcció i el de l'àrea de serveis.

     I la conseqüència que ha de constar abans de signar res: **segons la
     criticitat de l'anàlisi, pot caldre més d'una sessió**. No és un extra
     que es descobreix a mitja feina; és el que decideix la mida de l'encàrrec,
     i per això va al pas 0 i a `perque` del paquet. */
  { n: 0, t: 'L\'abast: a quina escala es mapa', tip: 'preparació',
    d: 'Si la casa és gran, no es fa un sol mapa: es fa **amb zoom**. Un nivell primer —la direcció, el comitè, el consell— i el que hi ha dins de cada node es mapa a part si la decisió ho demana. Un mapa de quaranta nodes no es llegeix a una sala, i a la sala és on s\'ha de llegir. **Segons la criticitat de l\'anàlisi, això vol més d\'una sessió**, i es diu abans i no a mitges.' },
  { n: 1, t: 'Qui hi ha a la sala', tip: 'preparació',
    d: 'El mapa el dibuixa qui hi és, no el consultor. Si falta un rol a la sala, el seu tros de mapa serà el que algú altre creu que fa — i aquest és el tros que sempre surt malament.' },
  { n: 2, t: 'Els nodes: rols, no càrrecs', tip: 'dibuix',
    d: 'Es llisten les funcions que algú fa de debò. Surten sempre rols que no consten a cap lloc: qui desencalla, qui recorda com es feia, qui truca quan ningú vol trucar.' },
  { n: 3, t: 'Les transaccions tangibles', tip: 'dibuix',
    d: 'Qui lliura què a qui, del que es podria facturar. És la part fàcil i la que tothom ja sap, i encara no explica per què la casa funciona.' },
  { n: 4, t: 'Les transaccions intangibles', tip: 'dibuix',
    d: 'La mateixa pregunta per al que no consta. Aquí és on apareix la meitat del mapa que no havia vist mai ningú junta.' },
  { n: 5, t: 'Anàlisi d\'intercanvi', tip: 'anàlisi', allee: true,
    d: 'Es mira el patró sencer: qui dona i no rep, quins vincles van en un sol sentit, quins nodes estan carregats de més. Un rol amb totes les fletxes sortint no és generós: és el que es cremarà primer.' },
  { n: 6, t: 'Anàlisi d\'impacte', tip: 'anàlisi', allee: true,
    d: 'Node per node: què rep, què li costa rebre-ho i què hi guanya. És la que ensenya si a algú li surt a compte seguir-hi, i la que explica per què hi ha gent que se\'n va sense queixar-se.' },
  { n: 7, t: 'Anàlisi de creació de valor', tip: 'anàlisi', allee: true,
    d: 'Què aporta cada node i què costaria no tenir-lo. És la que troba el valor que ja es produeix i no es cobra — i la que troba la feina que es fa i no aprofita ningú.' },
  { n: 8, t: 'Els moviments', tip: 'decisió',
    d: 'Tres llistes curtes: què es pot començar a cobrar, què s\'ha de repartir perquè no depengui d\'una persona, i quin vincle s\'ha de reparar abans que caigui. Amb nom i data, o no és una decisió.' },
  { n: 9, t: 'El mapa queda viu', tip: 'decisió',
    d: 'Es carrega al SOS i és de la casa. Un mapa en un PDF caduca el primer dia que algú canvia de rol; un mapa que es pot editar es torna a mirar d\'aquí a sis mesos.' }
];

/* ══ EL CAS · UN CELLER DEL PENEDÈS ══════════════════════════════════════════
   Set nodes i vuit parells. Cada parell diu el que va en un sentit i el que
   torna, amb la seva mena: és el mateix format que fa servir `expandPairs` a
   l'aplicació, i per això aquest mapa es pot carregar al SOS tal com és.

   Les posicions són del dibuix (viewBox 640 × 430) i estan triades perquè el
   canal tradicional quedi a l'esquerra i el camí del visitant a la dreta: el
   contrast és l'argument, i si els dos camins es barregen no es veu. */
const CELLER = {
  titol: 'Un celler del Penedès que mira el turisme de luxe',
  /* El títol i la descripció del dibuix, que és el que llegeix qui no el veu.
     Vivien escrits dins del dibuixant, i el dia que hi va haver un segon mapa
     aquell deia que era un celler. */
  titolSvg: 'Mapa de valor d\'un celler del Penedès',
  descSvg: 'Set rols i setze lliuraments. A l\'esquerra el distribuïdor, amb qui tot el que es lliura és tangible. A la dreta l\'operador de luxe i el visitant, on la meitat del que es lliura és intangible.',
  /* El color diu de quin camí és cada node. El que no hi surt va d'indi. */
  colors: { canal: '#82828d', visitant: '#00e676' },
  una: 'El mateix vi, el mateix poble i la mateixa família. El que canvia és qui rep què — i sobretot, quins lliuraments es paguen.',
  nodes: [
    { id: 'vi', nom: 'Qui fa el vi', x: 320, y: 58, cami: 'tots',
      d: 'Vinya, verema i celler. Produeix el tangible que tothom veu i, de passada, tot el que després es podrà explicar.' },
    { id: 'acollida', nom: 'Qui rep i explica', x: 320, y: 200, cami: 'visitant',
      d: 'Obre la porta, ensenya la casa i posa nom a les coses. És el node que avui sovint no existeix com a rol, i el fa qui pot quan truquen.' },
    { id: 'operador', nom: 'L\'operador de luxe', x: 540, y: 128, cami: 'visitant',
      d: 'Conserge d\'hotel, agència especialitzada o qui tria el viatge d\'algú altre. No compra vi: compra no equivocar-se.' },
    { id: 'visitant', nom: 'El visitant', x: 540, y: 300, cami: 'visitant',
      d: 'Ve amb temps i amb ganes de quedar-se. Paga per haver-hi estat, i s\'endú ampolles perquè ha estat allà, no al revés.' },
    { id: 'poble', nom: 'El poble', x: 320, y: 372, cami: 'visitant',
      d: 'Restaurants, allotjament i oficis. No és decorat: és el que fa que la visita duri dos dies en comptes d\'una hora.' },
    { id: 'canal', nom: 'El distribuïdor', x: 96, y: 128, cami: 'canal',
      d: 'Arriba on el celler no arriba. És una relació sana i necessària, i té una particularitat que el mapa ensenya de seguida.' },
    { id: 'terra', nom: 'La vinya i el veïnat', x: 96, y: 300, cami: 'tots',
      d: 'El paisatge, el camí, la gent que hi viu. És el que fa que aquell vi sigui d\'allà i no de qualsevol lloc, i no cobra per això.' }
  ],
  /* [de, a, mena d'anada, què, mena de tornada, què] */
  parells: [
    ['vi', 'acollida', 'tangible', 'el vi, la verema i el celler obert', 'intangible', 'saber què pregunta i què paga qui ve'],
    ['acollida', 'visitant', 'intangible', 'el relat de la casa: qui poda, per què aquell vessant', 'tangible', 'el que paga per l\'experiència, no per l\'ampolla'],
    ['operador', 'acollida', 'intangible', 'la confiança del seu client, que és el que de debò ven', 'tangible', 'una experiència exclusiva i hores reservades'],
    ['visitant', 'operador', 'tangible', 'el que paga pel viatge sencer', 'intangible', 'que algú hagi triat per ell i no s\'hagi d\'equivocar'],
    ['poble', 'visitant', 'tangible', 'taula, llit i ofici obert', 'tangible', 'despesa que es queda al municipi'],
    ['vi', 'canal', 'tangible', 'volum a preu de canal', 'tangible', 'arribar on el celler no arriba'],
    ['terra', 'vi', 'intangible', 'el lloc que fa que aquell vi sigui d\'allà', 'tangible', 'vinya treballada i camins oberts'],
    ['acollida', 'poble', 'intangible', 'visitants amb temps i ganes de quedar-se', 'intangible', 'que el poble els tracti com la casa ha promès']
  ],
  /* El que el mapa ensenya, i que no és una opinió: surt de comptar les
     fletxes. Els números els posa el generador, no aquesta llista. */
  troballes: [
    { t: 'El canal no compra res que no es pugui facturar',
      d: 'Tots els lliuraments amb el distribuïdor són tangibles. No és un retret —és la seva feina—, però vol dir que <b>tot el que la casa produeix i no es pot facturar, per aquí se\'n va de franc</b>: el relat, el lloc, la família, el vessant.' },
    { t: 'El camí del visitant sí que els paga',
      d: 'Aquí els intangibles no són un extra: <b>són el producte</b>. L\'operador no ven vi, ven no equivocar-se; el visitant no paga l\'ampolla, paga haver-hi estat. I això la casa ja ho produeix cada dia sense cobrar-ho.' },
    { t: 'Hi ha un node que no existeix com a rol',
      d: '«Qui rep i explica» avui sol ser qui pot quan truquen. <b>És el node que sosté tot el camí de la dreta</b>, i mentre no sigui el rol d\'algú amb temps assignat, el marge que hi ha a la dreta no s\'hi arriba.' },
    { t: 'La vinya i el veïnat donen i no reben prou',
      d: 'Reben feina i camins; donen el que fa que allò sigui únic i irrepetible. <b>És el vincle que es trenca sense avisar</b> —un poble que es cansa dels visitants—, i és barat de cuidar mentre encara es pot.' }
  ],
  /* ══ L'ENCALLAMENT ════════════════════════════════════════════════════
     Un mapa de valor dibuixat és una radiografia: ensenya què hi ha. El que
     ven la consultoria sistèmica és el pas següent —**mirar-ho com un cos**—,
     i un cos no es diagnostica amb una foto sinó veient si allò circula.

     Per això el mapa es pot aturar per un node. No és una animació decorativa:
     és la pregunta que un metge fa davant d'una radiografia, «i si això no
     passa?», i és la que el client ha de poder fer sobre la seva casa.

     El node és `acollida` i no un altre perquè és la troballa 3 d'aquest mateix
     cas: avui no existeix com a rol, el fa qui pot quan truquen, i sosté tot
     el camí de la dreta. **Qui perd què ho compta el generador**, no aquesta
     llista: una xifra escrita a mà aquí seria una xifra que el dibuix podria
     desmentir sense que ningú se n'adonés. */
  encallament: {
    node: 'acollida',
    per: 'Avui no és el rol de ningú: el fa qui pot quan sona el telèfon.',
    diu: 'Un node que no és de ningú no s\'atura un dia dolent: s\'atura cada dia una estona, i no surt a cap informe.'
  },
  /* La frase que impedeix que això es llegeixi com una promesa de marge. */
  avis: 'Aquest mapa és un exemple treballat, no el d\'un celler concret, i no porta cap xifra: el marge el calcula la casa amb els seus números. El que el mapa aporta no és una previsió — és <b>on mirar</b>, i quins lliuraments avui se\'n van sense cobrar.'
};

/* ══ EL CAS, CAP A FORA ══════════════════════════════════════════════════════
   `build-castells.js` dibuixa **el mateix cas** mirat des de dalt, i per això
   ha de llegir aquesta declaració i no una còpia. Dues còpies del celler
   divergirien el primer dia que algú hi toqués un parell, i no petaria res: les
   dues vistes seguirien sent maques per separat i dirien coses diferents.

   El `return` és el mateix patró que `build-oferta.js`: qui requereix aquest
   fitxer se'n porta les dades i no n'executa ni les guardes ni l'escriptura. */
/* ══ EL SEGON CAS · LA XARXA DE TEAMTOWERS ═══════════════════════════════════
   El mètode no s'aplicava a la casa que el ven. «TeamTowers» sortia a la
   portada com a **reputació** —trenta-dos clients amb font escrita— i no com el
   que de debò és: **un mapa de valor entre els rols que fa l'Àlvar i els de les
   agències, les empreses i les institucions.**

   Això no és una il·lustració: és la prova que el mètode val per a qualsevol
   casa, feta sobre la que el ven. I com tot mapa d'aquest fitxer, **les
   troballes les compta el generador**, no les escriu ningú.

   Dues decisions que no són òbvies:

   · **Els nodes són rols, no persones ni clients.** Un nom d'empresa és una
     afirmació sobre un tercer i demana font escrita (`check-landing.js` regla
     10); un rol és una descripció de com funciona la casa. Els clients ja
     tenen la seva paret i la seva font, i no es barregen amb això.
   · **Quatre dels set rols els fa la mateixa persona**, i el mapa ho diu en
     comptes de dissimular-ho. És l'única manera que la lectura serveixi de res:
     el que la xarxa ha de resoldre és que cada rol el pugui fer algú altre.

   Les posicions són les mateixes del celler (viewBox 640 × 430) perquè el
   dibuixant és el mateix i la retícula ja estava pensada: la casa a l'esquerra
   i al centre, i qui contracta a la dreta. */
const XARXA = {
  titol: 'La xarxa de TeamTowers, mirada com un mapa de valor',
  titolEs: 'La red de TeamTowers, mirada como un mapa de valor',
  una: 'Set rols: els quatre que fa l\'Àlvar i els tres de l\'altra banda de la taula. El que es lliura en cada sentit, i el que es lliura i no es factura.',
  unaEs: 'Siete roles: los cuatro que hace Álvaro y los tres del otro lado de la mesa. Lo que se entrega en cada sentido, y lo que se entrega y no se factura.',
  titolSvg: 'Mapa de valor de la xarxa de TeamTowers',
  descSvg: 'Set rols i setze lliuraments. A l\'esquerra i al centre, els quatre oficis de la casa: qui mapa, qui forma, qui ho fa passar i qui construeix la peça. A la dreta, les agències, les empreses i les institucions.',
  colors: { casa: '#6366f1', fora: '#00e676', canal: '#82828d' },
  nodes: [
    { id: 'mapa', nom: 'Qui mapa el valor', x: 320, y: 58, cami: 'casa',
      d: 'Dibuixa qui dona què a qui, també el que no es factura. És el node del qual pengen tots els altres oficis de la casa.' },
    { id: 'forma', nom: 'Qui forma fent', x: 320, y: 200, cami: 'casa',
      d: 'Setze mòduls sobre el cas de qui els fa, no sobre un d\'inventat. És el que fa que el mapa no se\'n vagi amb nosaltres.' },
    { id: 'produeix', nom: 'Qui ho fa passar', x: 96, y: 128, cami: 'casa',
      d: 'Jornades, diades i logística, amb una sola persona responsable de tot el que pot sortir malament.' },
    { id: 'construeix', nom: 'Qui construeix la peça', x: 96, y: 300, cami: 'casa',
      d: 'Les eines: el SOS, els fluxos amb IA, les guardes que comproven a cada canvi que allò segueix dient la veritat.' },
    { id: 'agencies', nom: 'Agències i consultores', x: 320, y: 372, cami: 'canal',
      d: 'Tenen la relació i el volum; no tenen el mètode. És una relació sana i té la mateixa particularitat que el distribuïdor del celler.' },
    { id: 'empreses', nom: 'Empreses i cooperatives', x: 540, y: 128, cami: 'fora',
      d: 'Compren decidir millor i que l\'equip ho sostingui. Paguen amb pressupost propi i a termini curt.' },
    { id: 'institucions', nom: 'Institucions i administració', x: 540, y: 300, cami: 'fora',
      d: 'Ajuntaments, consells i centres educatius. Compren el mateix i ho paguen d\'una altra manera, amb els seus temps i els seus límits.' }
  ],
  parells: [
    ['mapa', 'empreses', 'tangible', 'el mapa dels intercanvis reals i on es perd valor',
      'intangible', 'accés al que de debò passa dins de la casa'],
    ['mapa', 'institucions', 'tangible', 'el mapa del teixit: qui sosté què i de qui penja tot',
      'intangible', 'la porta al territori i la legitimitat de l\'encàrrec públic'],
    ['forma', 'empreses', 'tangible', 'un equip format sobre el seu propi cas',
      'tangible', 'pressupost de formació, que és el que té partida'],
    ['forma', 'institucions', 'tangible', 'tècnics que poden replicar-ho sense nosaltres',
      'intangible', 'una comunitat de pràctica que dura més que el contracte'],
    ['produeix', 'institucions', 'tangible', 'la jornada muntada i una sola persona responsable',
      'intangible', 'vint anys de confiança al Penedès, que no es compra'],
    ['agencies', 'mapa', 'intangible', 'la confiança del seu client, que és el que de debò venen',
      'tangible', 'un mètode que no tenen i que les diferencia'],
    ['construeix', 'empreses', 'tangible', 'la peça funcionant, amb els fitxers seus i sense lligams',
      'tangible', 'el que es paga per la peça'],
    /* L'únic intercanvi **de dins cap a dins**: el mapa produeix el material
       que la formació fa servir, i la formació torna els casos que milloren el
       mapa. Que només n'hi hagi un és la troballa, i la compta el generador. */
    ['mapa', 'forma', 'tangible', 'el cas real sobre el qual s\'aprèn',
      'intangible', 'els casos que tornen i que fan millor el mètode']
  ],
  troballes: [
    { t: 'Quatre oficis i una sola persona',
      tEs: 'Cuatro oficios y una sola persona',
      d: 'Els quatre rols de l\'esquerra i del centre <b>els fa la mateixa persona</b>. El mapa no ho dissimula perquè és el que la xarxa ha de resoldre: <b>que cada rol el pugui fer algú altre</b>, amb el nivell i l\'evidència que el registre ja sap acreditar.',
      dEs: 'Los cuatro roles de la izquierda y del centro <b>los hace la misma persona</b>. El mapa no lo disimula porque es lo que la red tiene que resolver: <b>que cada rol lo pueda hacer otra persona</b>, con el nivel y la evidencia que el registro ya sabe acreditar.' },
    { t: 'Les agències compren el mètode i venen la relació',
      tEs: 'Las agencias compran el método y venden la relación',
      d: 'És l\'única banda on el que arriba és <b>intangible</b> —la confiança del seu client— i el que es dona és el mètode. Sana i necessària, i amb la mateixa particularitat que el distribuïdor del celler: <b>pel canal, el que no es pot facturar se\'n va de franc</b> si no es pacta.',
      dEs: 'Es el único lado donde lo que llega es <b>intangible</b> —la confianza de su cliente— y lo que se da es el método. Sana y necesaria, y con la misma particularidad que el distribuidor de la bodega: <b>por el canal, lo que no se puede facturar se va gratis</b> si no se pacta.' },
    { t: 'Les dues cases paguen amb diners diferents',
      tEs: 'Las dos casas pagan con dinero distinto',
      d: 'Empresa i administració compren el mateix i <b>no ho paguen igual</b>: una amb pressupost propi i a termini curt, l\'altra amb partides, contracte menor i els seus temps. És per això que el catàleg filtra per sector i cada paquet diu <b>amb quins diners es paga</b>.',
      dEs: 'Empresa y administración compran lo mismo y <b>no lo pagan igual</b>: una con presupuesto propio y a plazo corto, la otra con partidas, contrato menor y sus tiempos. Por eso el catálogo filtra por sector y cada paquete dice <b>con qué dinero se paga</b>.' }
  ],
  avis: 'Aquest mapa <b>no és una llista de clients</b>: els nodes són rols i el que es dibuixa és com funciona la casa. Els clients tenen la seva paret més amunt, amb la font escrita de cadascun.',
  avisEs: 'Este mapa <b>no es una lista de clientes</b>: los nodos son roles y lo que se dibuja es cómo funciona la casa. Los clientes tienen su pared más arriba, con la fuente escrita de cada uno.'
};

module.exports = { CELLER, XARXA };
if (require.main !== module) return;

/* ══ ELS ENTREGABLES ═════════════════════════════════════════════════════════
   La durada i el que s'endú qui ho contracta es llegeixen del catàleg, que és
   qui ho ven. Escriure'ls aquí seria una segona veritat sobre el mateix tracte. */
const { PAQUETS } = require('./build-oferta.js');
const PAQUET = PAQUETS.find(p => p.id === 'mapa-organitzacio');

const ENTREGABLES = [
  { t: 'El mapa dibuixat', d: 'Nodes, transaccions i les dues menes, amb els noms reals de la casa. En paper per a la sala i al SOS per continuar.' },
  { t: 'Les tres anàlisis', d: 'Intercanvi, impacte i creació de valor, escrites: què hi ha, no què n\'opinem.' },
  { t: 'Els tres moviments', d: 'Què es pot cobrar, què s\'ha de repartir i quin vincle s\'ha de reparar. Amb nom i data.' },
  { t: 'El mapa viu', d: 'Carregat al SOS, editable per la casa i sense dependre de nosaltres per tornar-lo a mirar.' }
];

/* ══ EL QUE ES COMPTA ════════════════════════════════════════════════════════ */
const flux = CELLER.parells.flatMap(p => [
  { de: p[0], a: p[1], mena: p[2], q: p[3] },
  { de: p[1], a: p[0], mena: p[4], q: p[5] }
]);
const nodeDe = id => CELLER.nodes.find(n => n.id === id);
const toca = (f, ids) => ids.includes(f.de) || ids.includes(f.a);
const CANAL = flux.filter(f => toca(f, ['canal']));
const VISITA = flux.filter(f => toca(f, ['operador', 'visitant']));
const compta = fs => ({ n: fs.length, i: fs.filter(f => f.mena === 'intangible').length });
const cCanal = compta(CANAL), cVisita = compta(VISITA), cTot = compta(flux);

/* ══ QUI FA CADA LLIURAMENT ══════════════════════════════════════════════════
   La regla que el SOS aplica al Kanban, dita aquí sobre un cas que es pot
   llegir: si el lliurament és **tangible i sabem quin entregable produeix**, el
   pot preparar una màquina; si és **intangible**, és de persona i la màquina no
   el toca mai.

   Les pistes són les mateixes que `ENTREGABLE_HINTS` de l'aplicació. No es
   requereix el fitxer —és HTML amb un `<script>` de 500 KB— i per això es
   declaren aquí les que fan falta per al cas, amb una guarda que comprova que
   totes existeixen a l'app. Dues llistes de pistes que divergissin farien que
   la portada prometés un repartiment diferent del que després fa l'eina. */
const PISTES = [
  [/comanda|compra|paga|liquidaci|preu|volum/i, 'comanda'],
  [/reserva|hores reservades|disponibilitat/i, 'inventari'],
  [/despesa|factura/i, 'comanda']
];
const entregableDe = f => {
  if (f.mena !== 'tangible') return null;
  const h = PISTES.find(p => p[0].test(f.q));
  return h ? h[1] : null;
};
const QUI = flux.map(f => {
  if (f.mena === 'intangible') return { f, qui: 'persona', tipus: null };
  const t = entregableDe(f);
  return t ? { f, qui: 'maquina', tipus: t } : { f, qui: 'sense', tipus: null };
});
const cQui = {
  maquina: QUI.filter(x => x.qui === 'maquina').length,
  persona: QUI.filter(x => x.qui === 'persona').length,
  sense: QUI.filter(x => x.qui === 'sense').length
};

/* ══ QUI PERD QUÈ SI AQUELL NODE S'ATURA ════════════════════════════════════
   Es compta, no s'opina: per a cada node, quants dels seus lliuraments —els
   que dona i els que rep— passen pel node que s'ha aturat. Un node que en
   perd la meitat o més és el que al dibuix es queda sense reg.

   Que això sigui un càlcul i no una llista escrita és el que fa que el dibuix
   no pugui mentir: el dia que algú afegeixi un lliurament nou, el nombre canvia
   sol i la frase de sota també. */
const ENC = CELLER.encallament;
const tocaEnc = f => f.de === ENC.node || f.a === ENC.node;
const PERDUA = CELLER.nodes.filter(n => n.id !== ENC.node).map(n => {
  const meus = flux.filter(f => f.de === n.id || f.a === n.id);
  const parats = meus.filter(tocaEnc);
  return { n, total: meus.length, perd: parats.length,
    pct: meus.length ? parats.length / meus.length : 0 };
}).sort((a, b) => b.pct - a.pct);
const SENSE_REG = PERDUA.filter(x => x.pct >= .5);
const FLUX_PARAT = flux.filter(tocaEnc).length;

/* ══ EL DIBUIX ═══════════════════════════════════════════════════════════════
   Generat de les posicions declarades. Es dibuixa amb les dues menes
   distingides per traç —plena i discontínua— i no per color sol: qui no
   distingeix el blau del magenta ha de poder llegir el mapa igualment. */
/* El dibuixant **de qualsevol mapa**, no només del celler. Era `svgCeller` i
   llegia `CELLER`, `flux`, `ENC` i `PERDUA` del voltant: perfecte mentre hi
   hagués un sol cas, i impossible de reutilitzar el dia que n'hi hagués dos.

   Ara pren el mapa i se'n deriva el que necessita. `svgCeller(id)` segueix
   existint i dibuixa exactament el mateix que abans —byte a byte—, que és com
   s'ha comprovat que aquest canvi no toca res del que ja hi havia. */
function svgMapa(mapa, id) {
  const fl = mapa.parells.flatMap(x => [
    { de: x[0], a: x[1], mena: x[2], q: x[3] },
    { de: x[1], a: x[0], mena: x[4], q: x[5] }
  ]);
  const node = i => mapa.nodes.find(n => n.id === i);
  const enc = mapa.encallament ? mapa.encallament.node : null;
  const toca = f => enc && (f.de === enc || f.a === enc);
  /* Qui perd la meitat del que rep quan el node encallat s'atura. Només té
     sentit si el mapa en declara un; un mapa sense encallament no marca res. */
  const perd = !enc ? [] : mapa.nodes.filter(n => n.id !== enc).map(n => {
    const rep = fl.filter(f => f.a === n.id);
    const p = rep.filter(toca).length;
    return { id: n.id, pct: rep.length ? p / rep.length : 0 };
  });
  const COL = Object.assign({}, mapa.colors);
  return svgDe(mapa, id, fl, node, enc, toca, perd, COL);
}

const svgCeller = id => svgMapa(CELLER, id);

function svgDe(mapa, id, flux, nodeDe, encN, tocaEnc, PERDUA, COL) {
  const R = 46, W = 640, H = 430;
  const p = [];
  p.push(`<svg id="${id}" class="mv-svg viu" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${id}T ${id}D">`);
  p.push(`<title id="${id}T">${esc(mapa.titolSvg)}</title>`);
  p.push(`<desc id="${id}D">${esc(mapa.descSvg)}</desc>`);
  p.push('<defs>' +
    '<marker id="mvT" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#00b0ff"/></marker>' +
    '<marker id="mvI" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#e040fb"/></marker>' +
    '</defs>');
  // Les fletxes primer, perquè els nodes hi quedin a sobre i el text es llegeixi.
  /* Els polsos van a part i a sota de tot: són el mateix camí dibuixat una
     segona vegada amb un traç curt que el recorre. Amb `pathLength="100"` tots
     els camins es normalitzen a la mateixa llargada, i llavors una sola regla
     de CSS els fa circular tots a la mateixa velocitat encara que un sigui el
     doble de llarg que l'altre. Sense això, el pols de la fletxa curta aniria
     disparat i el de la llarga semblaria aturat. */
  const camins = [];
  flux.forEach((f, i) => {
    const a = nodeDe(f.de), b = nodeDe(f.a);
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
    // Es retalla als marges del node perquè la punta no quedi amagada a sota.
    const ax = a.x + dx / d * R, ay = a.y + dy / d * R;
    const bx = b.x - dx / d * (R + 4), by = b.y - dy / d * (R + 4);
    /* Les dues menes es corben a bandes contràries: si se solapessin, el mapa
       semblaria tenir la meitat de lliuraments dels que té.

       La curvatura es calcula sobre el tram **lliure** —el que queda després de
       descomptar els dos cercles— i no sobre la distància entre centres. Amb la
       distància entre centres, dos nodes de costat com «qui rep i explica» i «el
       poble» donaven dos arcs que es tancaven en una el·lipse i es llegien com
       una fletxa que tornava sobre si mateixa. */
    const lliure = Math.max(18, d - 2 * R);
    const c = (f.mena === 'tangible' ? 1 : -1) * Math.min(34, lliure * .22);
    const mx = (ax + bx) / 2 - dy / d * c, my = (ay + by) / 2 + dx / d * c;
    const tang = f.mena === 'tangible';
    const cam = `M${ax.toFixed(1)} ${ay.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
    const para = tocaEnc(f) ? ' data-para="1"' : '';
    p.push(`<path class="mv-f" d="${cam}" fill="none" ` +
      `stroke="${tang ? '#00b0ff' : '#e040fb'}" stroke-width="${tang ? 2 : 1.6}" opacity="${tang ? .5 : .42}"` +
      `${tang ? '' : ' stroke-dasharray="6 7"'}${para} marker-end="url(#${tang ? 'mvT' : 'mvI'})"><title>${esc(nodeDe(f.de).nom)} → ${esc(nodeDe(f.a).nom)}: ${esc(f.q)} (${f.mena})</title></path>`);
    // El retard reparteix els polsos: tots alhora serien un pampallugueig.
    camins.push(`<path class="mv-p${tang ? '' : ' i'}" d="${cam}" pathLength="100"${para}` +
      ` style="animation-delay:${(i * .17).toFixed(2)}s"/>`);
  });
  p.push('<g class="mv-pols" aria-hidden="true">' + camins.join('') + '</g>');
  mapa.nodes.forEach(n => {
    const col = COL[n.cami] || '#6366f1';
    const perd = PERDUA.find(x => x.id === n.id);
    const marca = n.id === encN ? ' data-para="1"'
      : (perd && perd.pct >= .5 ? ' data-sec="1"' : '');
    p.push(`<g class="mv-n" data-id="${n.id}"${marca}>`);
    p.push(`<circle cx="${n.x}" cy="${n.y}" r="${R}" fill="#141420" stroke="${col}" stroke-width="1.6"/>`);
    // El nom es parteix en dues línies quan no hi cap: un node amb el text
    // sortint del cercle es llegeix com un error de dibuix.
    const mots = n.nom.split(' ');
    const linies = [];
    let l = '';
    mots.forEach(m => { if ((l + ' ' + m).trim().length > 13) { linies.push(l.trim()); l = m; } else l += ' ' + m; });
    if (l.trim()) linies.push(l.trim());
    const y0 = n.y - (linies.length - 1) * 6;
    linies.forEach((t, k) => p.push(`<text x="${n.x}" y="${y0 + k * 12.5}" text-anchor="middle" dominant-baseline="middle" font-size="10.5" fill="#f5f5f7">${esc(t)}</text>`));
    p.push('</g>');
  });
  p.push('</svg>');
  return p.join('');
}

/* ══ EL POLS ═════════════════════════════════════════════════════════════════
   Un mapa dibuixat és una radiografia: diu què hi ha. El que ven la consultoria
   sistèmica és el pas següent, mirar-ho com un cos —i un cos no es diagnostica
   amb una foto, sinó veient si allò circula i on deixa de fer-ho.

   Per això hi ha dos botons i no un: **fer-lo circular** i **aturar-li un
   node**. El segon és el que converteix el dibuix en una eina de decisió, i és
   literalment la pregunta que un metge fa davant d'una radiografia.

   Les xifres de la frase les compta el generador. Escrites a mà, el dia que
   s'afegís un lliurament el dibuix diria una cosa i la frase una altra, i la
   que es creuria el client seria la frase. */
function blocPols(svgId, tambe) {
  const n = nodeDe(ENC.node);
  /* `data-svg` pot nomenar **més d'un dibuix**, separats per un espai. El cas
     del celler es mira de dues maneres —el graf i la pinya des de dalt— i
     aturar-ne una i deixar l'altra sencera seria dir que la segona vista és
     decorativa. El JavaScript de la pàgina recorre la llista; amb un sol nom,
     es comporta com abans. La planta la genera `build-castells.js`, i una
     guarda d'allà comprova que porti aquest identificador. */
  const mana = [svgId].concat(tambe || []).join(' ');
  const perduts = SENSE_REG.map(x => `${esc(x.n.nom)} (${x.perd} de ${x.total})`).join(' i ');
  /* El bloc diu **a quin dibuix mana** amb `data-svg`, i el JavaScript de cada
     pàgina recorre els blocs que hi hagi. Amb els identificadors escrits a mà,
     el dia que la segona pàgina va rebre els polsos els botons van quedar
     apuntant al dibuix de la primera —i la pàgina es va publicar amb setze
     camins invisibles que no feien res. */
  return [`<div class="mv-pols-ui" data-svg="${mana}">`,
    '<div class="mv-pu-b">',
    `<button type="button" class="mv-b mv-pausa" aria-pressed="false" aria-controls="${svgId}">⏸ Atura el pols</button>`,
    `<button type="button" class="mv-b mv-enc" aria-pressed="false" aria-controls="${svgId}">🩺 I si «${esc(n.nom)}» s'encalla?</button>`,
    '</div>',
    `<p class="mv-pu-t" data-sa="Un mapa dibuixat és una radiografia: diu què hi ha. Amb el pols posat es veu l'altra cosa —<b>si allò circula</b>—, que és el que de debò decideix si una casa va bé." ` +
    `data-enc="${esc(ENC.per)} Amb aquest node aturat es paren <b>${FLUX_PARAT} dels ${cTot.n} lliuraments</b>, i ${perduts} perden la meitat del que els arriba. ${esc(ENC.diu)}">` +
    'Un mapa dibuixat és una radiografia: diu què hi ha. Amb el pols posat es veu l\'altra cosa —<b>si allò circula</b>—, que és el que de debò decideix si una casa va bé.</p>',
    '</div>'].join('');
}

/* ══ ELS BLOCS ═══════════════════════════════════════════════════════════════ */

// Portada · la versió curta: el dibuix, què s'hi veu i on és el marge.
function blocPortada() {
  const f = [];
  f.push('<div class="mv-grid fade-up">');
  f.push('  <div class="mv-viz">');
  f.push('    ' + svgCeller('mvCeller'));
  f.push('    <div class="mv-leg">' +
    '<span class="mv-lt">— tangible</span>' +
    '<span class="mv-li">- - intangible</span>' +
    `<span class="mv-lc">${cTot.n} lliuraments · ${cTot.i} intangibles</span>` +
    '</div>');
  f.push('    ' + blocPols('mvCeller', 'plCeller'));
  f.push('  </div>');
  f.push('  <div class="mv-txt">');
  f.push(`    <h3>${esc(CELLER.titol)}</h3>`);
  f.push(`    <p class="mv-lead">${esc(CELLER.una)}</p>`);
  f.push('    <div class="mv-cmp">');
  f.push(`      <div class="mv-c canal"><div class="mv-ck">Pel distribuïdor</div><div class="mv-cv">${cCanal.i} de ${cCanal.n}</div><div class="mv-cd">lliuraments intangibles. Tot el que no es pot facturar, per aquí se\'n va de franc.</div></div>`);
  f.push(`      <div class="mv-c visita"><div class="mv-ck">Pel visitant i l'operador</div><div class="mv-cv">${cVisita.i} de ${cVisita.n}</div><div class="mv-cd">lliuraments intangibles. Aquí no són un extra: són el producte que es paga.</div></div>`);
  f.push('    </div>');
  f.push('    <p class="mv-tesi"><b>El marge no surt d\'apujar el preu de l\'ampolla.</b> Surt de <b>cobrar els intangibles que la casa ja produeix</b> —el relat, el lloc, la família, el vessant— i que avui se\'n van amb el camió. El mapa no els inventa: ensenya que hi són i que no es cobren.</p>');
  /* I el que el mapa habilita després: saber què pot preparar una màquina.
     Va aquí i no en una secció a part perquè és la conseqüència del mapa, no
     un servei diferent — i perquè el número el dona el graf, no nosaltres. */
  f.push('    <div class="mv-qui">');
  f.push('      <div class="mv-qk">I després, qui fa cada lliurament</div>');
  f.push(`      <div class="mv-qr"><b class="mq">${cQui.maquina}</b><span>els pot preparar una màquina: tangibles amb un entregable conegut —comandes, reserves, liquidacions—</span></div>`);
  f.push(`      <div class="mv-qr"><b class="ms">${cQui.sense}</b><span>són tangibles però encara no sabem quin entregable produeixen</span></div>`);
  f.push(`      <div class="mv-qr"><b class="mp">${cQui.persona}</b><span>són de persona, sempre. <b>La màquina no toca cap intangible</b> — i no per criteri nostre: el sistema no en té manera</span></div>`);
  f.push('    </div>');
  f.push(`    <p class="mv-avis">${CELLER.avis}</p>`);
  f.push('    <div class="mv-ctas"><a class="mv-cta pri" href="/SOS/vna.html">Com es fa un mapa, pas a pas →</a>' +
    '<a class="mv-cta" href="#cataleg" data-sec="privat">El paquet i el preu →</a></div>');
  f.push('  </div>');
  f.push('</div>');
  return f.join('\n');
}

// VNA · la notació, el procés amb les tres anàlisis, i els entregables.
function blocProces() {
  const f = [];
  f.push('<section class="mv-sec">');
  f.push('<h2>Com es llegeix un mapa</h2>');
  f.push('<p class="mv-sub">Quatre paraules. Un mapa de valor amb quinze símbols no el llegeix ningú a una sala, i a la sala és on s\'ha de llegir.</p>');
  f.push('<div class="mv-not">');
  NOTACIO.forEach(n => {
    f.push(`<div class="mv-nt ${n.k}"><div class="mv-nt-h"><b>${esc(n.nom)}</b><span>${esc(n.sub)}</span></div><p>${esc(n.d)}</p></div>`);
  });
  f.push('</div>');
  f.push('</section>');

  f.push('<section class="mv-sec">');
  f.push('<h2>Com es fa</h2>');
  f.push(`<p class="mv-sub">${PROCES.length} passos en ${esc(PAQUET ? PAQUET.dura : '3 sessions')}. Els tres del mig marcats són <b>les tres anàlisis de Verna Allee</b>, que són el mètode i no una manera nostra de mirar-ho.</p>`);
  f.push('<ol class="mv-pas">');
  PROCES.forEach(p => {
    f.push(`<li class="${p.tip}${p.allee ? ' allee' : ''}"><span class="mv-pk">${p.tip}</span>` +
      `<b>${esc(p.t)}</b><p>${esc(p.d)}</p></li>`);
  });
  f.push('</ol>');
  f.push('</section>');

  f.push('<section class="mv-sec">');
  f.push('<h2>Què s\'endú la casa</h2>');
  f.push(`<p class="mv-sub">${esc(PAQUET ? PAQUET.endus : '')}</p>`);
  f.push('<div class="mv-ent">');
  ENTREGABLES.forEach(e => f.push(`<div class="mv-e"><b>${esc(e.t)}</b><p>${esc(e.d)}</p></div>`));
  f.push('</div>');
  f.push('<p class="mv-nota">El mapa no és l\'entregable: el mapa és l\'eina. L\'entregable és <b>el que se\'n decideix</b>. Un mapa preciós del qual no surt cap moviment és una feina ben feta que no ha servit de res.</p>');
  f.push('</section>');
  return f.join('\n');
}

// VNA · el mateix cas, sencer: el dibuix, els nodes i les troballes.
function blocExemple() {
  const f = [];
  f.push('<section class="mv-sec">');
  f.push(`<h2>${esc(CELLER.titol)}</h2>`);
  f.push(`<p class="mv-sub">${esc(CELLER.una)} El castell de dalt ensenya <b>què és</b> un mapa de valor; aquest ensenya <b>què s\'hi troba</b> quan es fa sobre una casa que ven alguna cosa.</p>`);
  f.push('<div class="mv-viz gran">');
  f.push(svgCeller('mvCellerVna'));
  f.push('<div class="mv-leg"><span class="mv-lt">— tangible</span><span class="mv-li">- - intangible</span>' +
    `<span class="mv-lc">${CELLER.nodes.length} nodes · ${cTot.n} transaccions · ${cTot.i} intangibles</span></div>`);
  /* El mateix pols que a la portada. Aquesta pàgina explica **com es fa** un
     mapa, i mirar si allò circula és part del com: una radiografia es llegeix
     quieta, un cos no. */
  f.push(blocPols('mvCellerVna'));
  f.push('</div>');

  f.push('<h3 class="mv-h3">Els nodes</h3>');
  f.push('<div class="mv-nodes">');
  CELLER.nodes.forEach(n => {
    const dins = flux.filter(x => x.a === n.id), fora = flux.filter(x => x.de === n.id);
    f.push(`<div class="mv-nd c-${n.cami}"><b>${esc(n.nom)}</b><p>${esc(n.d)}</p>` +
      `<span class="mv-nq">dona ${pl(fora.length, 'lliurament', 'lliuraments')} · rep ${dins.length}</span></div>`);
  });
  f.push('</div>');

  f.push('<h3 class="mv-h3">Les transaccions, una per una</h3>');
  f.push('<div class="mv-taula"><table><thead><tr><th>De</th><th>A</th><th>Mena</th><th>Què</th></tr></thead><tbody>');
  flux.forEach(x => {
    f.push(`<tr><td>${esc(nodeDe(x.de).nom)}</td><td>${esc(nodeDe(x.a).nom)}</td>` +
      `<td><span class="mv-k ${x.mena === 'tangible' ? 't' : 'i'}">${x.mena}</span></td><td>${esc(x.q)}</td></tr>`);
  });
  f.push('</tbody></table></div>');

  f.push('<h3 class="mv-h3">Què hi ensenya l\'anàlisi</h3>');
  f.push('<div class="mv-tro">');
  CELLER.troballes.forEach((t, k) => f.push(`<div class="mv-t"><span class="mv-tn">0${k + 1}</span><b>${esc(t.t)}</b><p>${t.d}</p></div>`));
  f.push('</div>');
  f.push(`<p class="mv-tesi"><b>El marge no surt d'apujar el preu de l'ampolla.</b> Surt de cobrar els intangibles que la casa ja produeix i que pel canal se'n van de franc. Pel distribuïdor hi ha ${cCanal.n} lliuraments i ${cCanal.i === 0 ? 'cap' : cCanal.i} intangible${cCanal.i === 1 ? '' : 's'}; pel camí del visitant n'hi ha ${cVisita.n} i ${cVisita.i} són intangibles.</p>`);
  f.push(`<p class="mv-avis">${CELLER.avis}</p>`);
  f.push('</section>');
  return f.join('\n');
}

/* ══ LES GUARDES ═════════════════════════════════════════════════════════════ */

// 1 · Cap transacció cap a un node que no existeix.
(() => {
  const ids = CELLER.nodes.map(n => n.id);
  const orfes = CELLER.parells.flatMap(p => [p[0], p[1]]).filter(x => !ids.includes(x));
  if (orfes.length) bad('transaccions cap a nodes que no existeixen: ' + [...new Set(orfes)].join(', '));
  else ok(`${CELLER.nodes.length} nodes i ${cTot.n} transaccions, totes entre nodes declarats`);
})();

// 2 · Cap node decoratiu. És la veda 152: un node sense cap fletxa no fa res i
//     es llegeix com un adorn, en un dibuix que existeix per dir qui sosté què.
(() => {
  const sols = CELLER.nodes.filter(n => !flux.some(f => f.de === n.id || f.a === n.id));
  if (sols.length) bad('nodes sense cap transacció: ' + sols.map(n => n.nom).join(', '));
  else ok('cap node dibuixat sense res que doni ni rebi');
})();

// 3 · Les dues menes hi han de ser, i l'intangible no pot ser testimonial: si
//     ho fos, el mapa estaria dient el contrari del que la casa defensa.
(() => {
  if (!cTot.i) bad('no hi ha cap transacció intangible: el mapa no demostra res');
  else if (cTot.i < cTot.n * .25) bad(`només ${cTot.i} de ${cTot.n} són intangibles: massa poc per sostenir la tesi`);
  else ok(`${cTot.i} de ${cTot.n} transaccions són intangibles`);
})();

// 4 · El contrast ha de ser cert. Tota la tesi del cas és que el canal
//     tradicional no compra intangibles i el camí del visitant sí.
(() => {
  if (cCanal.i > 0) bad(`el distribuïdor ja rep ${cCanal.i} intangible(s): el contrast del cas no es té dret a dir`);
  else if (!cVisita.i) bad('el camí del visitant tampoc no mou intangibles: no hi ha cap contrast');
  else ok(`contrast comprovat: canal ${cCanal.i}/${cCanal.n} intangibles, visitant ${cVisita.i}/${cVisita.n}`);
})();

// 5 · Cap xifra d'euros al cas. No tenim els números d'aquell celler, i
//     inventar-ne per il·lustrar un marge és el que la guia de marca prohibeix.
(() => {
  const text = [CELLER.una, CELLER.avis, ...CELLER.nodes.map(n => n.d),
    ...CELLER.troballes.flatMap(t => [t.t, t.d]), ...CELLER.parells.flatMap(p => [p[3], p[5]])].join(' ');
  if (/€|euros?\b|\d+\s*%/i.test(text)) bad('el cas porta una xifra de diners o un percentatge que no tenim d\'on treure');
  else ok('cap xifra inventada al cas: el marge el calcula la casa amb els seus números');
})();

// 6 · Les tres anàlisis de Verna Allee, pel seu nom. Sense això el procés és
//     una manera nostra de mirar-ho i no un mètode que es pugui comprovar.
(() => {
  const noms = PROCES.filter(p => p.allee).map(p => p.t.toLowerCase());
  const cal = ['intercanvi', 'impacte', 'creació de valor'];
  const falten = cal.filter(c => !noms.some(n => n.includes(c)));
  if (falten.length) bad('falten anàlisis de Verna Allee: ' + falten.join(', '));
  else ok('les tres anàlisis hi són pel seu nom: intercanvi, impacte i creació de valor');
})();

// 7 · La durada i l'entregable els diu el catàleg, que és qui ho ven.
(() => {
  if (!PAQUET) bad('no es troba el paquet «mapa-organitzacio» a build-oferta.js');
  else if (!PAQUET.dura || !PAQUET.endus) bad('el paquet no declara durada o entregable');
  else ok(`durada i entregable llegits del catàleg: ${PAQUET.dura}`);
})();

// 8 · La notació ha de dir les quatre coses que el dibuix fa servir.
(() => {
  const k = NOTACIO.map(n => n.k);
  const cal = ['node', 'trans', 'tang', 'intang', 'entrega'];
  const falten = cal.filter(c => !k.includes(c));
  if (falten.length) bad('la notació no explica: ' + falten.join(', '));
  else ok('la notació explica node, transacció, les dues menes i l\'entregable');
})();

/* 9 · Les pistes d'entregable han de ser les de l'aplicació. Si la portada
       classifica amb un vocabulari i el SOS amb un altre, el repartiment que es
       promet no és el que després surt al Kanban — i això no peta mai. */
(() => {
  const app = readFileSync(join(SOS, 'index.html'), 'utf8');
  const i = app.indexOf('const ENTREGABLE_HINTS=[');
  if (i < 0) { bad('no es troba `ENTREGABLE_HINTS` a l\'app: el repartiment d\'aquest cas no es pot comprovar'); return; }
  const cos = app.slice(i, app.indexOf('\n];', i));
  const tipusApp = [...new Set([...cos.matchAll(/,'([\w-]+)'\]/g)].map(m => m[1]))];
  const meus = [...new Set(PISTES.map(p => p[1]))];
  const orfes = meus.filter(t => !tipusApp.includes(t));
  if (orfes.length) bad('aquest cas classifica cap a tipus que l\'app no coneix: ' + orfes.join(', '));
  else ok(`el repartiment fa servir ${meus.length} tipus, tots declarats a l'app`);
  // I que el repartiment que es publica sigui el que surt del graf.
  if (cQui.maquina + cQui.persona + cQui.sense !== flux.length) bad('el repartiment no suma els lliuraments del graf');
  else if (cQui.persona !== cTot.i) bad('els de persona no coincideixen amb els intangibles: la regla no s\'està aplicant');
  else /* El node que s'atura ha d'existir i ha de moure alguna cosa. Un encallament
   sobre un node que no hi és no petaria: el botó senzillament no faria res. */
if (!nodeDe(ENC.node)) bad(`l'encallament apunta a «${ENC.node}», que no és cap node del mapa`);
else if (!FLUX_PARAT) bad(`el node «${ENC.node}» no mou res: aturar-lo no ensenyaria res`);
else if (!SENSE_REG.length) bad(`aturar «${ENC.node}» no deixa cap node sense la meitat del que rep: `
  + 'el dibuix no ensenyaria cap conseqüència i el botó seria decoració');
else ok(`aturar «${nodeDe(ENC.node).nom}» para ${FLUX_PARAT} dels ${cTot.n} lliuraments `
  + `i deixa ${SENSE_REG.length} node(s) sense la meitat del que reben`);

ok(`repartiment: ${cQui.maquina} de màquina · ${cQui.sense} sense tipus · ${cQui.persona} de persona (= els ${cTot.i} intangibles)`);
})();

/* ══ ESCRIURE ════════════════════════════════════════════════════════════════ */
/* ══ EL BLOC DE LA XARXA ═════════════════════════════════════════════════════
   El mateix dibuixant i la mateixa disciplina: les xifres les compta aquí el
   generador i no les escriu ningú. El que es diu de cada banda surt de comptar
   els lliuraments, i per això el dia que la xarxa canviï, la lectura canviarà
   amb ella. */
/* Les frases del bloc de la xarxa que no surten de `XARXA`. Vivien escrites
   dins de la funció, i per això la secció sencera es quedava en català quan
   algú triava castellà: la portada té dos diccionaris i aquest bloc hi va a
   dins. Les xifres no hi són —les compta el generador i no es tradueixen. */
const FR = {
  'xa.dins.k': { ca: 'Entre els oficis de la casa', es: 'Entre los oficios de la casa' },
  'xa.dins.d': { ca: 'oficis no es lliuren res a cap altre: els fa la mateixa persona i per això no els cal.',
    es: 'oficios no se entregan nada a ningún otro: los hace la misma persona y por eso no les hace falta.' },
  'xa.lliur': { ca: 'lliuraments.', es: 'entregas.' },
  'xa.fora.k': { ca: 'Cap a fora i cap a dins', es: 'Hacia fuera y hacia dentro' },
  'xa.fora.d': { ca: 'dels que creuen la taula són intangibles: accés, porta al territori, confiança i comunitat.',
    es: 'de los que cruzan la mesa son intangibles: acceso, puerta al territorio, confianza y comunidad.' },
  'xa.cta1': { ca: 'El catàleg sencer →', es: 'El catálogo completo →' },
  'xa.cta2': { ca: 'Els clients, amb la font de cada un →', es: 'Los clientes, con la fuente de cada uno →' }
};

/* El diccionari de la xarxa, per a les dues llengües de la portada. Mateix
   patró que `build-oferta.js`, `build-nav.js` i `build-castells.js`. */
function dicXarxa(l) {
  const q = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const tria = (o, c) => l === 'es' ? (o[c + 'Es'] || o[c]) : o[c];
  const f = [];
  f.push(`  'xa.titol':'${q(tria(XARXA, 'titol'))}',`);
  f.push(`  'xa.una':'${q(tria(XARXA, 'una'))}',`);
  f.push(`  'xa.avis':'${q(tria(XARXA, 'avis'))}',`);
  XARXA.troballes.forEach((t, i) => {
    f.push(`  'xa.t${i}.t':'${q(tria(t, 't'))}',`);
    f.push(`  'xa.t${i}.d':'${q(tria(t, 'd'))}',`);
  });
  Object.entries(FR).forEach(([k, v]) => f.push(`  '${k}':'${q(v[l])}',`));
  return f.join('\n');
}

function blocXarxa() {
  const fl = XARXA.parells.flatMap(x => [
    { de: x[0], a: x[1], mena: x[2] }, { de: x[1], a: x[0], mena: x[4] }
  ]);
  const nodeX = i => XARXA.nodes.find(n => n.id === i);
  const casa = XARXA.nodes.filter(n => n.cami === 'casa').map(n => n.id);
  const fora = XARXA.nodes.filter(n => n.cami !== 'casa').map(n => n.id);
  const dins = fl.filter(x => casa.includes(x.de) && casa.includes(x.a));
  const creuen = fl.filter(x => casa.includes(x.de) !== casa.includes(x.a));
  const intang = a => a.filter(x => x.mena === 'intangible').length;
  /* Els rols de la casa que no es lliuren res a cap altre rol de la casa. És la
     troballa 1 comptada, i la que diu què ha de resoldre la xarxa. */
  const aillats = casa.filter(id => !dins.some(x => x.de === id || x.a === id));
  const f = [];
  f.push('<div class="mv-grid fade-up">');
  f.push('  <div class="mv-viz">');
  f.push('    ' + svgMapa(XARXA, 'mvXarxa'));
  f.push('    <div class="mv-leg">' +
    '<span class="mv-lt">— tangible</span>' +
    '<span class="mv-li">- - intangible</span>' +
    `<span class="mv-lc">${fl.length} lliuraments · ${intang(fl)} intangibles</span>` +
    '</div>');
  f.push('  </div>');
  f.push('  <div class="mv-txt">');
  f.push(`    <h3 data-i18n="xa.titol">${esc(XARXA.titol)}</h3>`);
  f.push(`    <p class="mv-lead" data-i18n="xa.una">${esc(XARXA.una)}</p>`);
  f.push('    <div class="mv-cmp">');
  /* Les xifres no van al diccionari: les compta el generador i són les
     mateixes en les dues llengües. El que es tradueix és el que les envolta,
     i va en un element a part perquè la xifra no hi quedi a dins. */
  f.push(`      <div class="mv-c canal"><div class="mv-ck" data-i18n="xa.dins.k">`
    + `${esc(FR['xa.dins.k'].ca)}</div>`
    + `<div class="mv-cv">${dins.length} de ${fl.length}</div>`
    + `<div class="mv-cd"><span data-i18n="xa.lliur">lliuraments.</span> `
    + `${aillats.length}/${casa.length} <span data-i18n="xa.dins.d">${esc(FR['xa.dins.d'].ca)}</span></div></div>`);
  f.push(`      <div class="mv-c visita"><div class="mv-ck" data-i18n="xa.fora.k">`
    + `${esc(FR['xa.fora.k'].ca)}</div>`
    + `<div class="mv-cv">${creuen.length} de ${fl.length}</div>`
    + `<div class="mv-cd">${intang(creuen)} `
    + `<span data-i18n="xa.fora.d">${esc(FR['xa.fora.d'].ca)}</span></div></div>`);
  f.push('    </div>');
  f.push('    <div class="mv-ts">' + XARXA.troballes.map((t, i) =>
    `<div class="mv-t"><span class="mv-tn">0${i + 1}</span>`
    + `<b data-i18n="xa.t${i}.t">${esc(t.t)}</b>`
    + `<p data-i18n-html="xa.t${i}.d">${t.d}</p></div>`).join('') + '</div>');
  f.push(`    <p class="mv-avis" data-i18n-html="xa.avis">${XARXA.avis}</p>`);
  f.push('    <div class="mv-ctas">'
    + `<a class="mv-cta pri" href="#cataleg" data-i18n="xa.cta1">${esc(FR['xa.cta1'].ca)}</a>`
    + `<a class="mv-cta" href="#trajectoria" data-i18n="xa.cta2">${esc(FR['xa.cta2'].ca)}</a></div>`);
  f.push('  </div>');
  f.push('</div>');
  return f.join('\n');
}

const DESTINS = [
  { f: join(ARREL, 'index.html'), marca: 'TT-MAPAVALOR', fn: blocPortada },
  { f: join(ARREL, 'index.html'), marca: 'TT-XARXA', fn: blocXarxa },
  { f: join(SOS, 'vna.html'), marca: 'VNA-PROCES', fn: blocProces },
  { f: join(SOS, 'vna.html'), marca: 'VNA-EXEMPLE', fn: blocExemple }
];
let escrits = 0, vells = [];
const cache = {};
DESTINS.forEach(d => {
  if (!existsSync(d.f)) { bad('no existeix ' + d.f); return; }
  const txt = cache[d.f] !== undefined ? cache[d.f] : readFileSync(d.f, 'utf8');
  const obre = `<!--${d.marca}-->`, tanca = `<!--/${d.marca}-->`;
  const i = txt.indexOf(obre), j = txt.indexOf(tanca);
  if (i < 0 || j < 0) { bad(`falta la marca ${d.marca}`); cache[d.f] = txt; return; }
  const nou = obre + '\n' + d.fn() + '\n' + tanca;
  if (txt.slice(i, j + tanca.length) === nou) { cache[d.f] = txt; return; }
  vells.push(d.marca);
  cache[d.f] = txt.slice(0, i) + nou + txt.slice(j + tanca.length);
  escrits++;
});

/* ── CAP PÀGINA AMB POLSOS SENSE EL QUE ELS MOU ───────────────────────────
   Aquest generador escriu el mateix dibuix a dues pàgines, i l'estil que el fa
   circular és **de cada pàgina**. Quan els polsos hi van entrar, `vna.html` va
   rebre el marcatge i no l'estil: setze camins invisibles que no feien res, i
   uns botons que apuntaven al dibuix de l'altra pàgina.

   **No petava i no es veia**: la pàgina es llegia exactament igual que abans.
   Es va trobar perquè algú va preguntar, que és la manera més cara.

   Es comprova que tota pàgina amb `class="mv-p"` porti també l'animació que els
   mou, els botons que els aturen, i que els botons sàpiguen a quin dibuix
   manen. Si el dia de demà el dibuix va a una tercera pàgina, aquesta guarda
   serà la que ho digui. */
(() => {
  const falta = [];
  [...new Set(DESTINS.map(d => d.f))].forEach(f => {
    if (!existsSync(f)) return;
    const txt = cache[f] !== undefined ? cache[f] : readFileSync(f, 'utf8');
    const nom = f.replace(ARREL + '/', '');
    if (!/class="mv-p[\s"]/.test(txt)) return;      // aquesta pàgina no en porta
    const li = [];
    if (!/@keyframes mv-flueix/.test(txt)) li.push('l\'animació `mv-flueix`');
    if (!/\.mv-svg\.encallat/.test(txt)) li.push('l\'estat `encallat`');
    if (!/class="mv-pols-ui" data-svg=/.test(txt)) li.push('els botons que l\'aturen');
    if (!/querySelectorAll\('\.mv-pols-ui'\)/.test(txt)) li.push('el codi que els escolta');
    if (li.length) falta.push(`${nom}: hi falta ${li.join(', ')}`);
  });
  if (falta.length) bad('pàgines amb polsos que no es mouen: ' + falta.join(' · ')
    + ' — no peta i no es veu: la pàgina es llegeix igual que abans');
  else ok(`les ${[...new Set(DESTINS.map(d => d.f))].length} pàgines amb el dibuix porten el que el fa circular i el que l'atura`);
})();

/* El diccionari de la xarxa a la portada. Va a part dels blocs: una clau al
   marcatge sense entrada al diccionari deixa el text escrit a mà, que és
   exactament el que passava amb aquesta secció sencera. */
{
  const f = join(ARREL, 'index.html');
  if (!existsSync(f)) bad('no existeix index.html');
  else {
    let src = cache[f] !== undefined ? cache[f] : readFileSync(f, 'utf8');
    let tocat = false;
    [['CA', 'ca'], ['ES', 'es']].forEach(([M, l]) => {
      const a = `/*TT-XA-I18N-${M}*/`, b = `/*/TT-XA-I18N-${M}*/`;
      const x = src.indexOf(a), y = src.indexOf(b);
      if (x < 0 || y <= x) { bad(`falten les marques ${a} a index.html`); return; }
      const out = src.slice(0, x + a.length) + '\n' + dicXarxa(l) + '\n' + src.slice(y);
      if (out !== src) { src = out; tocat = true; }
    });
    if (tocat) {
      if (CHECK) vells.push('el diccionari de la xarxa');
      else { cache[f] = src; escrits++; }
    }
  }
}

if (CHECK) {
  if (vells.length) bad('blocs desactualitzats: ' + vells.join(', ') + ' — torna a executar build-mapavalor.js');
  else ok('els tres blocs són al dia');
} else if (escrits) {
  Object.entries(cache).forEach(([f, t]) => writeFileSync(f, t));
}

console.log(fails ? '\n❌ El mapa de valor no quadra.'
  : `\n✅ Mapa de valor · ${CELLER.nodes.length} nodes, ${cTot.n} transaccions (${cTot.i} intangibles), ` +
    `${PROCES.length} passos i ${ENTREGABLES.length} entregables` + (CHECK ? '.' : ` · ${escrits} bloc(s) escrits.`));
process.exit(fails ? 1 : 0);
