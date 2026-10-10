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
/* Les declaracions marquen el que importa amb `**això**`, que és com s'escriu a
   tot el coneixement de la casa. Fins avui s'escapava i sortia literal: el pas 0
   del procés es publicava dient «es fa **amb zoom**» amb els asteriscs i tot.
   S'escapa primer i es converteix després, en aquest ordre: al contrari, un
   `<b>` escrit a mà dins d'una declaració passaria per text. */
const neg = s => esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

/* ══ LA NOTACIÓ ══════════════════════════════════════════════════════════════
   Quatre paraules i no més. Un mapa de valor amb quinze símbols no el llegeix
   ningú a una sala, i a la sala és on s'ha de llegir. */
const NOTACIO = [
  { k: 'node', nom: 'Node', nomEs: 'Nodo', sub: 'un rol, no una persona', subEs: 'un rol, no una persona',
    d: 'El que algú fa, no com es diu al organigrama. Una persona pot ocupar dos nodes i un node el poden ocupar dues persones. Aquest canvi de mirada és tot el mètode.',
    dEs: 'Lo que alguien hace, no cómo se llama en el organigrama. Una persona puede ocupar dos nodos y un nodo lo pueden ocupar dos personas. Este cambio de mirada es todo el método.' },
  { k: 'trans', nom: 'Transacció', nomEs: 'Transacción', sub: 'una fletxa, d\'un node a un altre', subEs: 'una flecha, de un nodo a otro',
    d: 'Alguna cosa que un node lliura a un altre. Té direcció: A dona a B no és el mateix que B dona a A, i dibuixar-ho amb una ratlla sense punta amaga justament el que es vol veure.',
    dEs: 'Algo que un nodo entrega a otro. Tiene dirección: A da a B no es lo mismo que B da a A, y dibujarlo con una raya sin punta esconde justamente lo que se quiere ver.' },
  { k: 'tang', nom: 'Tangible', nomEs: 'Tangible', sub: 'línia plena', subEs: 'línea continua',
    d: 'El que es podria facturar o consta en un contracte: producte, hores, diners, un local, un informe. És el que ja surt als comptes.',
    dEs: 'Lo que se podría facturar o consta en un contrato: producto, horas, dinero, un local, un informe. Es lo que ya sale en las cuentas.' },
  { k: 'intang', nom: 'Intangible', nomEs: 'Intangible', sub: 'línia discontínua', subEs: 'línea discontinua',
    d: 'El que no consta enlloc i sense el qual res funciona: confiança, coneixement que no és a cap manual, reputació, accés, que et tornin el favor. Va discontínua perquè és el que es trenca sense avisar.',
    dEs: 'Lo que no consta en ningún sitio y sin lo cual nada funciona: confianza, conocimiento que no está en ningún manual, reputación, acceso, que te devuelvan el favor. Va discontinua porque es lo que se rompe sin avisar.' },
  { k: 'entrega', nom: 'Entregable', nomEs: 'Entregable', sub: 'el que queda quan marxem', subEs: 'lo que queda cuando nos vamos',
    d: 'El mapa no és l\'entregable: el mapa és l\'eina. L\'entregable és el que se\'n decideix — què es pot cobrar, què s\'ha de repartir i quin vincle s\'ha de reparar abans que caigui.',
    dEs: 'El mapa no es el entregable: el mapa es la herramienta. El entregable es lo que se decide — qué se puede cobrar, qué hay que repartir y qué vínculo hay que reparar antes de que caiga.' }
];

/* ══ EL PROCÉS ═══════════════════════════════════════════════════════════════
   Les tres anàlisis són les de Verna Allee i van pel seu nom. La pàgina ja en
   feia dues —el pas 6 és l'anàlisi d'intercanvi i el 7 la de creació de valor—
   i no les anomenava, de manera que qui buscava el mètode no el reconeixia. */
/* ══ LES QUATRE FASES ════════════════════════════════════════════════════════
   Els deu passos de sota estaven **plans**, i una llista de deu coses no es
   recorda. El guió real d'una sessió amb un equip de direcció, i l'article
   d'on surt el mètode, els agrupen en **quatre passos grans**, i aquesta és la forma que es
   comunica: quatre per recordar, deu per executar.

   Surten de: Antonio Blanco-Gracia i Ingrid Astiz, «Value Network Analysis:
   ¿qué es? ¿para qué sirve? ¿cómo hacerlo?» (Pantheon.work, 30/11/2018), i del
   guió d'una sessió real, on consten **tal qual** com «Cuatro grandes
   pasos». Aportats per l'Àlvar el 02/10/2026. */
const FASES = [
  { id: 'abast', n: 1, t: 'Definir l\'abast i les fronteres', tEs: 'Definir el alcance y las fronteras',
    d: 'De quina activitat parlem i on s\'acaba. És el que decideix si surt un mapa que es llegeix o un de quaranta nodes que no es llegeix a cap sala.',
    dEs: 'De qué actividad hablamos y dónde se acaba. Es lo que decide si sale un mapa que se lee o uno de cuarenta nodos que no se lee en ninguna sala.' },
  { id: 'qui', n: 2, t: 'Decidir qui convidem', tEs: 'Decidir a quién invitamos',
    d: 'Un grup divers de la casa i del seu entorn, o com a mínim gent que conegui qui hi ha a fora. Amb trenta persones es fa en dos o tres grups en paral·lel.',
    dEs: 'Un grupo diverso de la casa y de su entorno, o como mínimo gente que conozca quién hay fuera. Con treinta personas se hace en dos o tres grupos en paralelo.' },
  { id: 'mapa', n: 3, t: 'Identificar els rols i les seves transaccions', tEs: 'Identificar los roles y sus transacciones',
    d: 'Els noms primer, els rols després, i llavors què s\'intercanvien. Entre 8 i 10 rols, i els que tenen més intercanvis van més al centre.',
    dEs: 'Los nombres primero, los roles después, y entonces qué se intercambian. Entre 8 y 10 roles, y los que tienen más intercambios van más al centro.' },
  { id: 'valida', n: 4, t: 'Validar el mapa seqüenciant transaccions', tEs: 'Validar el mapa secuenciando transacciones',
    d: 'En quin ordre passen les coses. No per reduir-ho a un procés lineal, sinó per comprovar que el mapa és complet i fer aflorar els fluxos principals.',
    dEs: 'En qué orden pasan las cosas. No para reducirlo a un proceso lineal, sino para comprobar que el mapa está completo y hacer aflorar los flujos principales.' }
];

const PROCES = [
  /* ══ L'ABAST, QUE ÉS EL PAS ZERO ═══════════════════════════════════════
     Hi faltava. El procés començava per «qui hi ha a la sala» i **no deia a
     quina escala es mapa**, i en una organització gran això no és un detall:
     un sol mapa de tota la casa surt amb quaranta nodes i no es llegeix a cap
     sala, que és on s'ha de llegir.

     La manera de fer-ho és la mateixa que l'eina ja fa servir: **zoom**. Es
     mapa un nivell, i el que hi ha a dins de cada node es mapa a part si cal.
     Precisat per l'Àlvar el 02/10/2026: en una casa gran, primer un nivell i
     després, si cal, el de dins d'un node.

     I la conseqüència que ha de constar abans de signar res: **segons la
     criticitat de l'anàlisi, pot caldre més d'una sessió**. No és un extra
     que es descobreix a mitja feina; és el que decideix la mida de l'encàrrec,
     i per això va al pas 0 i a `perque` del paquet. */
  { n: 0, fase: 'abast', t: 'L\'abast: a quina escala es mapa', tEs: 'El alcance: a qué escala se mapea', tip: 'preparació',
    d: 'Si la casa és gran, no es fa un sol mapa: es fa **amb zoom**. Un nivell primer —la direcció, el comitè, el consell— i el que hi ha dins de cada node es mapa a part si la decisió ho demana. Un mapa de quaranta nodes no es llegeix a una sala, i a la sala és on s\'ha de llegir. **Segons la criticitat de l\'anàlisi, això vol més d\'una sessió**, i es diu abans i no a mitges.',
    dEs: 'Si la casa es grande, no se hace un solo mapa: se hace **con zoom**. Un nivel primero —la dirección, el comité, el consejo— y lo que hay dentro de cada nodo se mapea aparte si la decisión lo pide. Un mapa de cuarenta nodos no se lee en una sala, y en la sala es donde hay que leerlo. **Según la criticidad del análisis, esto pide más de una sesión**, y se dice antes y no a medias.' },
  { n: 1, fase: 'qui', t: 'Qui hi ha a la sala', tEs: 'Quién hay en la sala', tip: 'preparació',
    d: 'El mapa el dibuixa qui hi és, no el consultor. Si falta un rol a la sala, el seu tros de mapa serà el que algú altre creu que fa — i aquest és el tros que sempre surt malament.',
    dEs: 'El mapa lo dibuja quien está, no el consultor. Si falta un rol en la sala, su trozo de mapa será lo que otra persona cree que hace — y ese es el trozo que siempre sale mal.' },
  { n: 2, fase: 'mapa', t: 'Els nodes: rols, no càrrecs', tEs: 'Los nodos: roles, no cargos', tip: 'dibuix',
    d: 'Es llisten les funcions que algú fa de debò. Surten sempre rols que no consten a cap lloc: qui desencalla, qui recorda com es feia, qui truca quan ningú vol trucar.',
    dEs: 'Se listan las funciones que alguien hace de verdad. Salen siempre roles que no constan en ningún sitio: quien desatasca, quien recuerda cómo se hacía, quien llama cuando nadie quiere llamar.' },
  { n: 3, fase: 'mapa', t: 'Les transaccions tangibles · els «must»', tEs: 'Las transacciones tangibles · los «must»', tip: 'dibuix',
    d: 'Qui lliura què a qui, del que es podria facturar. És la part fàcil i la que tothom ja sap, i encara no explica per què la casa funciona.',
    dEs: 'Quién entrega qué a quién, de lo que se podría facturar. Es la parte fácil y la que todo el mundo ya sabe, y todavía no explica por qué la casa funciona.' },
  { n: 4, fase: 'mapa', t: 'Les transaccions intangibles · els «extra»', tEs: 'Las transacciones intangibles · los «extra»', tip: 'dibuix',
    d: 'La mateixa pregunta per al que no consta. Aquí és on apareix la meitat del mapa que no havia vist mai ningú junta.',
    dEs: 'La misma pregunta para lo que no consta. Aquí es donde aparece la mitad del mapa que nadie había visto nunca junta.' },
  { n: 5, fase: 'valida', t: 'Anàlisi d\'intercanvi', tEs: 'Análisis de intercambio', tip: 'anàlisi', allee: true,
    d: 'Es mira el patró sencer: qui dona i no rep, quins vincles van en un sol sentit, quins nodes estan carregats de més. Un rol amb totes les fletxes sortint no és generós: és el que es cremarà primer.',
    dEs: 'Se mira el patrón entero: quién da y no recibe, qué vínculos van en un solo sentido, qué nodos están cargados de más. Un rol con todas las flechas saliendo no es generoso: es el que se quemará primero.' },
  { n: 6, fase: 'valida', t: 'Anàlisi d\'impacte', tEs: 'Análisis de impacto', tip: 'anàlisi', allee: true,
    d: 'Node per node: què rep, què li costa rebre-ho i què hi guanya. És la que ensenya si a algú li surt a compte seguir-hi, i la que explica per què hi ha gent que se\'n va sense queixar-se.',
    dEs: 'Nodo por nodo: qué recibe, qué le cuesta recibirlo y qué gana. Es la que enseña si a alguien le sale a cuenta seguir, y la que explica por qué hay gente que se va sin quejarse.' },
  { n: 7, fase: 'valida', t: 'Anàlisi de creació de valor', tEs: 'Análisis de creación de valor', tip: 'anàlisi', allee: true,
    d: 'Què aporta cada node i què costaria no tenir-lo. És la que troba el valor que ja es produeix i no es cobra — i la que troba la feina que es fa i no aprofita ningú.',
    dEs: 'Qué aporta cada nodo y qué costaría no tenerlo. Es la que encuentra el valor que ya se produce y no se cobra — y la que encuentra el trabajo que se hace y no aprovecha nadie.' },
  { n: 8, fase: 'valida', t: 'Els moviments', tEs: 'Los movimientos', tip: 'decisió',
    d: 'Tres llistes curtes: què es pot començar a cobrar, què s\'ha de repartir perquè no depengui d\'una persona, i quin vincle s\'ha de reparar abans que caigui. Amb nom i data, o no és una decisió.',
    dEs: 'Tres listas cortas: qué se puede empezar a cobrar, qué hay que repartir para que no dependa de una persona, y qué vínculo hay que reparar antes de que caiga. Con nombre y fecha, o no es una decisión.' },
  { n: 9, fase: 'valida', t: 'El mapa queda viu', tEs: 'El mapa queda vivo', tip: 'decisió',
    d: 'Es carrega al SOS i és de la casa. Un mapa en un PDF caduca el primer dia que algú canvia de rol; un mapa que es pot editar es torna a mirar d\'aquí a sis mesos.',
    dEs: 'Se carga en el SOS y es de la casa. Un mapa en un PDF caduca el primer día que alguien cambia de rol; un mapa que se puede editar se vuelve a mirar dentro de seis meses.' }
];
/* El tipus de pas, en castellà. És una etiqueta curta i repetida, i per això va
   a part i no com a `tipEs` quatre vegades repetit a cada entrada. */
const TIP_ES = { 'preparació': 'preparación', 'dibuix': 'dibujo', 'anàlisi': 'análisis', 'decisió': 'decisión' };

/* ══ EL CAS · UN CELLER DEL PENEDÈS ══════════════════════════════════════════
   Set nodes i vuit parells. Cada parell diu el que va en un sentit i el que
   torna, amb la seva mena: és el mateix format que fa servir `expandPairs` a
   l'aplicació, i per això aquest mapa es pot carregar al SOS tal com és.

   Les posicions són del dibuix (viewBox 640 × 430) i estan triades perquè el
   canal tradicional quedi a l'esquerra i el camí del visitant a la dreta: el
   contrast és l'argument, i si els dos camins es barregen no es veu. */
const CELLER = {
  titol: 'Un celler del Penedès que mira el turisme de luxe',
  titolEs: 'Una bodega del Penedès que mira al turismo de lujo',
  /* El títol i la descripció del dibuix, que és el que llegeix qui no el veu.
     Vivien escrits dins del dibuixant, i el dia que hi va haver un segon mapa
     aquell deia que era un celler. */
  titolSvg: 'Mapa de valor d\'un celler del Penedès',
  titolSvgEs: 'Mapa de valor de una bodega del Penedès',
  descSvg: 'Set rols i setze lliuraments. A l\'esquerra el distribuïdor, amb qui tot el que es lliura és tangible. A la dreta l\'operador de luxe i el visitant, on la meitat del que es lliura és intangible.',
  descSvgEs: 'Siete roles y dieciséis entregas. A la izquierda el distribuidor, con quien todo lo que se entrega es tangible. A la derecha el operador de lujo y el visitante, donde la mitad de lo que se entrega es intangible.',
  /* El color diu de quin camí és cada node. El que no hi surt va d'indi.
     Vénen de la paleta (`build-pell.js`) i no d'aquí: el traç d'un cercle és un
     objecte gràfic i necessita 3:1 contra el fons, i el verd viu d'abans
     —#00e676, 1,6:1 sobre paper— desapareixia a la pell clara. */
  colors: { canal: 'var(--muted)', visitant: 'var(--green)' },
  una: 'El mateix vi, el mateix poble i la mateixa família. El que canvia és qui rep què — i sobretot, quins lliuraments es paguen.',
  unaEs: 'El mismo vino, el mismo pueblo y la misma familia. Lo que cambia es quién recibe qué — y sobre todo, qué entregas se pagan.',
  /* ══ ELS PROCESSOS · la passa 4 del mètode, com a dada ════════════════════
     «Validar el mapa seqüenciant transaccions» era **només text** a la pàgina:
     la passa 4 de les quatre grans, explicada i no feta. Cap transacció sabia
     en quin ordre passa, i el pols del dibuix reparteix els retards per ordre
     de declaració —`i * 0,17 s`—, que no és cap ordre.

     Van en **plural** perquè el mètode ho diu en plural, i la cita és el que
     impedeix que això es torni un diagrama de processos: *«a l'enginyeria de
     processos l'objectiu és identificar un únic procés òptim i eliminar la
     variació. Amb l'anàlisi de la xarxa de valor l'objectiu és optimitzar
     múltiples vies […] permetent alhora les variacions necessàries»* — Verna
     Allee. Un sol procés seria exactament el que això no és. */
  processos: [
    { id: 'visita', nom: 'La visita reservada', nomEs: 'La visita reservada',
      d: 'Des que algú reserva el viatge fins que la casa sap què ha preguntat. Vuit passos, i tres no es poden facturar.',
      dEs: 'Desde que alguien reserva el viaje hasta que la casa sabe qué ha preguntado. Ocho pasos, y tres no se pueden facturar.' },
    { id: 'poble', nom: 'El dia al poble', nomEs: 'El día en el pueblo',
      d: 'El que fa que la visita duri dos dies i no una hora. Comença i acaba a la casa, i pel mig no hi passa.',
      dEs: 'Lo que hace que la visita dure dos días y no una hora. Empieza y acaba en la casa, y por el medio no pasa.' },
    { id: 'canal', nom: 'La venda pel canal', nomEs: 'La venta por el canal',
      d: 'De la vinya al camió. Tres passos, tots tangibles — i aquí hi ha la troballa del cas.',
      dEs: 'De la viña al camión. Tres pasos, todos tangibles — y aquí está el hallazgo del caso.' }
  ],
  /* ── I EL QUE NO ENTRA A CAP SEQÜÈNCIA ───────────────────────────────────
     Observació del guió de la sessió, i val or: **els intangibles sovint no
     entren a la seqüència** perquè passen «tot el temps» o «en qualsevol
     moment». No és un forat del mapa — és precisament el que els fa
     invisibles a qualsevol diagrama de procés, i és l'argument de venda que
     aquest cas regala. Es diu a la pàgina amb el dibuix al davant.

     La guarda exigeix que `sempre` només el porti un intangible: un tangible
     que «passa tot el temps» és un tangible que ningú ha seqüenciat. */
  sempreMotiu: 'No passa en cap pas: passa tot el temps. És el que fa que aquell vi sigui d\'allà, i per això no surt a cap diagrama de procés — ni a cap factura.',
  sempreMotiuEs: 'No pasa en ningún paso: pasa todo el tiempo. Es lo que hace que ese vino sea de allí, y por eso no sale en ningún diagrama de proceso — ni en ninguna factura.',
  /* El nom va al dibuix i és **text visible**, no només de passar-hi el ratolí:
     per això cada node porta el seu `nomEs`, i el dibuixant escriu les dues
     versions amb el seu salt de línia calculat. Una sola etiqueta traduïda al
     vol es partiria on no toca, perquè el castellà no fa les mateixes síl·labes. */
  nodes: [
    { id: 'vi', nom: 'Qui fa el vi', nomEs: 'Quién hace el vino', x: 320, y: 58, cami: 'tots',
      d: 'Vinya, verema i celler. Produeix el tangible que tothom veu i, de passada, tot el que després es podrà explicar.',
      dEs: 'Viña, vendimia y bodega. Produce el tangible que todo el mundo ve y, de paso, todo lo que después se podrá contar.' },
    { id: 'acollida', nom: 'Qui rep i explica', nomEs: 'Quién recibe y explica', x: 320, y: 200, cami: 'visitant',
      d: 'Obre la porta, ensenya la casa i posa nom a les coses. És el node que avui sovint no existeix com a rol, i el fa qui pot quan truquen.',
      dEs: 'Abre la puerta, enseña la casa y pone nombre a las cosas. Es el nodo que hoy a menudo no existe como rol, y lo hace quien puede cuando llaman.' },
    { id: 'operador', nom: 'L\'operador de luxe', nomEs: 'El operador de lujo', x: 540, y: 128, cami: 'visitant',
      d: 'Conserge d\'hotel, agència especialitzada o qui tria el viatge d\'algú altre. No compra vi: compra no equivocar-se.',
      dEs: 'Conserje de hotel, agencia especializada o quien elige el viaje de otra persona. No compra vino: compra no equivocarse.' },
    { id: 'visitant', nom: 'El visitant', nomEs: 'El visitante', x: 540, y: 300, cami: 'visitant',
      d: 'Ve amb temps i amb ganes de quedar-se. Paga per haver-hi estat, i s\'endú ampolles perquè ha estat allà, no al revés.',
      dEs: 'Viene con tiempo y con ganas de quedarse. Paga por haber estado, y se lleva botellas porque ha estado allí, no al revés.' },
    { id: 'poble', nom: 'El poble', nomEs: 'El pueblo', x: 320, y: 372, cami: 'visitant',
      d: 'Restaurants, allotjament i oficis. No és decorat: és el que fa que la visita duri dos dies en comptes d\'una hora.',
      dEs: 'Restaurantes, alojamiento y oficios. No es decorado: es lo que hace que la visita dure dos días en vez de una hora.' },
    { id: 'canal', nom: 'El distribuïdor', nomEs: 'El distribuidor', x: 96, y: 128, cami: 'canal',
      d: 'Arriba on el celler no arriba. És una relació sana i necessària, i té una particularitat que el mapa ensenya de seguida.',
      dEs: 'Llega donde la bodega no llega. Es una relación sana y necesaria, y tiene una particularidad que el mapa enseña enseguida.' },
    { id: 'terra', nom: 'La vinya i el veïnat', nomEs: 'La viña y el vecindario', x: 96, y: 300, cami: 'tots',
      d: 'El paisatge, el camí, la gent que hi viu. És el que fa que aquell vi sigui d\'allà i no de qualsevol lloc, i no cobra per això.',
      dEs: 'El paisaje, el camino, la gente que vive allí. Es lo que hace que ese vino sea de allí y no de cualquier sitio, y no cobra por ello.' }
  ],
  /* [de, a, mena d'anada, què, mena de tornada, què, **què en castellà**,
     **què de tornada en castellà**, **quan passa l'anada**, **quan passa la
     tornada**]. Els dos del castellà es van afegir el 03/10/2026: el que es
     llegeix passant el ratolí per sobre d'una fletxa és **setze frases**, i es
     quedaven totes en català amb el castellà posat.

     Els dos últims són la passa 4: `['procés', pas]` o `'sempre'`. Cada sentit
     va a **un sol** procés, i l'ordre dins del procés és el del número. */
  parells: [
    ['vi', 'acollida', 'tangible', 'el vi, la verema i el celler obert', 'intangible', 'saber què pregunta i què paga qui ve',
      'el vino, la vendimia y la bodega abierta', 'saber qué pregunta y qué paga quien viene',
      ['visita', 5], ['visita', 8]],
    ['acollida', 'visitant', 'intangible', 'el relat de la casa: qui poda, per què aquell vessant', 'tangible', 'el que paga per l\'experiència, no per l\'ampolla',
      'el relato de la casa: quién poda, por qué esa ladera', 'lo que paga por la experiencia, no por la botella',
      ['visita', 6], ['visita', 7]],
    ['operador', 'acollida', 'intangible', 'la confiança del seu client, que és el que de debò ven', 'tangible', 'una experiència exclusiva i hores reservades',
      'la confianza de su cliente, que es lo que de verdad vende', 'una experiencia exclusiva y horas reservadas',
      ['visita', 2], ['visita', 3]],
    ['visitant', 'operador', 'tangible', 'el que paga pel viatge sencer', 'intangible', 'que algú hagi triat per ell i no s\'hagi d\'equivocar',
      'lo que paga por el viaje entero', 'que alguien haya elegido por él y no se tenga que equivocar',
      ['visita', 1], ['visita', 4]],
    ['poble', 'visitant', 'tangible', 'taula, llit i ofici obert', 'tangible', 'despesa que es queda al municipi',
      'mesa, cama y oficio abierto', 'gasto que se queda en el municipio',
      ['poble', 2], ['poble', 3]],
    ['vi', 'canal', 'tangible', 'volum a preu de canal', 'tangible', 'arribar on el celler no arriba',
      'volumen a precio de canal', 'llegar donde la bodega no llega',
      ['canal', 2], ['canal', 3]],
    /* L'anada d'aquest parell és **l'únic `sempre`** del cas, i no és casual
       que sigui el lloc: el paisatge no es lliura un dimarts. */
    ['terra', 'vi', 'intangible', 'el lloc que fa que aquell vi sigui d\'allà', 'tangible', 'vinya treballada i camins oberts',
      'el lugar que hace que ese vino sea de allí', 'viña trabajada y caminos abiertos',
      'sempre', ['canal', 1]],
    ['acollida', 'poble', 'intangible', 'visitants amb temps i ganes de quedar-se', 'intangible', 'que el poble els tracti com la casa ha promès',
      'visitantes con tiempo y ganas de quedarse', 'que el pueblo los trate como la casa ha prometido',
      ['poble', 1], ['poble', 4]]
  ],
  /* El tipus del que l'etiqueta no diu, com qui el tria a mà al Kanban. Els
     diners hi són perquè l'app digui que no surten d'una màquina. La reserva
     no hi és: cap tipus de l'app és una reserva, i els tipus no s'inventen. */
  tipus: {
    'volum a preu de canal': 'comanda',
    'el que paga per l\'experiència, no per l\'ampolla': 'cobrament',
    'el que paga pel viatge sencer': 'cobrament',
    'despesa que es queda al municipi': 'cobrament'
  },
  /* El que el mapa ensenya, i que no és una opinió: surt de comptar les
     fletxes. Els números els posa el generador, no aquesta llista. */
  troballes: [
    { t: 'El canal no compra res que no es pugui facturar',
      tEs: 'El canal no compra nada que no se pueda facturar',
      d: 'Tots els lliuraments amb el distribuïdor són tangibles. No és un retret —és la seva feina—, però vol dir que <b>tot el que la casa produeix i no es pot facturar, per aquí se\'n va de franc</b>: el relat, el lloc, la família, el vessant.',
      dEs: 'Todas las entregas con el distribuidor son tangibles. No es un reproche —es su trabajo—, pero quiere decir que <b>todo lo que la casa produce y no se puede facturar, por aquí se va gratis</b>: el relato, el lugar, la familia, la ladera.' },
    { t: 'El camí del visitant sí que els paga',
      tEs: 'El camino del visitante sí que los paga',
      d: 'Aquí els intangibles no són un extra: <b>són el producte</b>. L\'operador no ven vi, ven no equivocar-se; el visitant no paga l\'ampolla, paga haver-hi estat. I això la casa ja ho produeix cada dia sense cobrar-ho.',
      dEs: 'Aquí los intangibles no son un extra: <b>son el producto</b>. El operador no vende vino, vende no equivocarse; el visitante no paga la botella, paga haber estado. Y eso la casa ya lo produce cada día sin cobrarlo.' },
    { t: 'Hi ha un node que no existeix com a rol',
      tEs: 'Hay un nodo que no existe como rol',
      d: '«Qui rep i explica» avui sol ser qui pot quan truquen. <b>És el node que sosté tot el camí de la dreta</b>, i mentre no sigui el rol d\'algú amb temps assignat, el marge que hi ha a la dreta no s\'hi arriba.',
      dEs: '«Quién recibe y explica» hoy suele ser quien puede cuando llaman. <b>Es el nodo que sostiene todo el camino de la derecha</b>, y mientras no sea el rol de alguien con tiempo asignado, al margen que hay a la derecha no se llega.' },
    { t: 'La vinya i el veïnat donen i no reben prou',
      tEs: 'La viña y el vecindario dan y no reciben bastante',
      d: 'Reben feina i camins; donen el que fa que allò sigui únic i irrepetible. <b>És el vincle que es trenca sense avisar</b> —un poble que es cansa dels visitants—, i és barat de cuidar mentre encara es pot.',
      dEs: 'Reciben trabajo y caminos; dan lo que hace que aquello sea único e irrepetible. <b>Es el vínculo que se rompe sin avisar</b> —un pueblo que se cansa de los visitantes—, y es barato de cuidar mientras todavía se puede.' }
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
    perEs: 'Hoy no es el rol de nadie: lo hace quien puede cuando suena el teléfono.',
    diu: 'Un node que no és de ningú no s\'atura un dia dolent: s\'atura cada dia una estona, i no surt a cap informe.',
    diuEs: 'Un nodo que no es de nadie no se para un día malo: se para cada día un rato, y no sale en ningún informe.'
  },
  /* La frase que impedeix que això es llegeixi com una promesa de marge. */
  avis: 'Aquest mapa és un exemple treballat, no el d\'un celler concret, i no porta cap xifra: el marge el calcula la casa amb els seus números. El que el mapa aporta no és una previsió — és <b>on mirar</b>, i quins lliuraments avui se\'n van sense cobrar.',
  avisEs: 'Este mapa es un ejemplo trabajado, no el de una bodega concreta, y no lleva ninguna cifra: el margen lo calcula la casa con sus números. Lo que el mapa aporta no es una previsión — es <b>dónde mirar</b>, y qué entregas hoy se van sin cobrar.'
};

/* ══ EL ZOOM · UN NODE CONTÉ UN MAPA ════════════════════════════════════════
   El zoom de Verna Allee, que no és un gest de pinça: *«en una organització
   gran no es mapa tota la casa en un sol dibuix: es fa amb zoom. Un nivell
   primer i el que hi ha dins de cada node es mapa a part si la decisió ho
   demana»*.

   Dos nodes del celler s'obren, i són els dos que la casa **és**:

   · `acollida`, perquè és la troballa 3 —avui no existeix com a rol i el fa
     qui pot quan truquen—, i obrir-lo ensenya **de què està feta** aquella
     feina que ningú té assignada. És el nivell que decideix l'encàrrec.
   · `vi`, perquè és el node que tothom dona per entès, i de dins en surten
     quatre rols que no es parlen com es creuen.

   **Les posicions no es declaren**: les reparteix el dibuixant en cercle. Un
   mapa de dins amb coordenades a mà seria un mapa que ningú voldria afegir, i
   el que ha de ser fàcil és obrir un node més.

   El sostre és el del mètode i hi ha una guarda: **cap nivell per sobre de 12
   rols**. Si un en passa, el que cal no és una pantalla més gran: és partir-lo.
   Aquesta és literalment la raó per la qual el zoom existeix. */
const DINS = {
  acollida: {
    titol: 'Qui rep i explica, per dins',
    titolEs: 'Quién recibe y explica, por dentro',
    titolSvg: 'El node «Qui rep i explica», obert',
    titolSvgEs: 'El nodo «Quién recibe y explica», abierto',
    descSvg: 'Cinc rols dins del node que avui no és de ningú: qui agafa el telèfon, qui porta l\'agenda, qui fa la visita, qui dona de menjar i qui ho explica a fora. Deu lliuraments, i la meitat no es factura.',
    descSvgEs: 'Cinco roles dentro del nodo que hoy no es de nadie: quien coge el teléfono, quien lleva la agenda, quien hace la visita, quien da de comer y quien lo cuenta fuera. Diez entregas, y la mitad no se factura.',
    una: 'El node que la casa no té assignat, obert. Són cinc feines, no una — i avui les fa qui pot.',
    unaEs: 'El nodo que la casa no tiene asignado, abierto. Son cinco trabajos, no uno — y hoy los hace quien puede.',
    colors: { nucli: 'var(--green)' },
    nodes: [
      { id: 'tel', nom: 'Qui agafa el telèfon', nomEs: 'Quién coge el teléfono', cami: 'nucli',
        d: 'La primera veu de la casa. Qui decideix, sense saber-ho, si aquella trucada acaba en visita.',
        dEs: 'La primera voz de la casa. Quien decide, sin saberlo, si esa llamada acaba en visita.' },
      { id: 'agenda', nom: 'Qui porta l\'agenda', nomEs: 'Quién lleva la agenda', cami: 'nucli',
        d: 'Qui sap quines hores queden lliures i qui ve demà. Si això viu en un cap i no en un full, la casa no pot créixer.',
        dEs: 'Quien sabe qué horas quedan libres y quién viene mañana. Si esto vive en una cabeza y no en una hoja, la casa no puede crecer.' },
      { id: 'visita', nom: 'Qui fa la visita', nomEs: 'Quién hace la visita', cami: 'nucli',
        d: 'Qui camina la vinya i posa nom a les coses. És l\'únic rol d\'aquí que el visitant recorda.',
        dEs: 'Quien camina la viña y pone nombre a las cosas. Es el único rol de aquí que el visitante recuerda.' },
      { id: 'taula', nom: 'Qui dona de menjar', nomEs: 'Quién da de comer', cami: 'nucli',
        d: 'El tast i la taula. És el que allarga la visita d\'una hora a tres, i sovint no consta com a part de res.',
        dEs: 'La cata y la mesa. Es lo que alarga la visita de una hora a tres, y a menudo no consta como parte de nada.' },
      { id: 'fora', nom: 'Qui ho explica a fora', nomEs: 'Quién lo cuenta fuera', cami: 'nucli',
        d: 'Les xarxes, les fotos, les respostes. Fa que arribi gent que ja sap què vol, i no se li atribueix cap venda.',
        dEs: 'Las redes, las fotos, las respuestas. Hace que llegue gente que ya sabe qué quiere, y no se le atribuye ninguna venta.' }
    ],
    parells: [
      ['tel', 'agenda', 'tangible', 'la reserva presa', 'tangible', 'les hores que encara queden lliures',
        'la reserva tomada', 'las horas que todavía quedan libres', ['dia', 1], ['dia', 2]],
      ['agenda', 'visita', 'tangible', 'el full del dia: qui ve i què ha demanat', 'intangible', 'com ha anat, per saber què es pot tornar a prometre',
        'la hoja del día: quién viene y qué ha pedido', 'cómo ha ido, para saber qué se puede volver a prometer',
        ['dia', 3], ['dia', 6]],
      ['visita', 'taula', 'intangible', 'quant triguen i a quina hora arribaran a taula', 'tangible', 'el tast i la taula a l\'hora',
        'cuánto tardan y a qué hora llegarán a la mesa', 'la cata y la mesa a su hora', ['dia', 4], ['dia', 5]],
      ['visita', 'fora', 'intangible', 'el que la gent pregunta i el que els fa gràcia', 'intangible', 'visitants que ja venen sabent què veuran',
        'lo que la gente pregunta y lo que les hace gracia', 'visitantes que ya vienen sabiendo qué verán',
        'sempre', 'sempre'],
      ['fora', 'tel', 'intangible', 'trucades de gent que ja sap què vol', 'intangible', 'les preguntes que es repeteixen cada setmana',
        'llamadas de gente que ya sabe qué quiere', 'las preguntas que se repiten cada semana',
        'sempre', 'sempre']
    ],
    processos: [
      { id: 'dia', nom: 'El dia d\'una visita', nomEs: 'El día de una visita',
        d: 'De la trucada al retorn. Sis passos dins d\'un node que al mapa de dalt és un sol cercle.',
        dEs: 'De la llamada al retorno. Seis pasos dentro de un nodo que en el mapa de arriba es un solo círculo.' }
    ],
    sempreMotiu: 'El que s\'explica a fora i el que se\'n torna no té pas: passa tot el temps, i per això no se li atribueix mai cap visita.',
    sempreMotiuEs: 'Lo que se cuenta fuera y lo que vuelve no tiene paso: pasa todo el tiempo, y por eso no se le atribuye nunca ninguna visita.'
  },
  vi: {
    titol: 'Qui fa el vi, per dins',
    titolEs: 'Quién hace el vino, por dentro',
    titolSvg: 'El node «Qui fa el vi», obert',
    titolSvgEs: 'El nodo «Quién hace el vino», abierto',
    descSvg: 'Quatre rols dins del node que tothom dona per entès: qui treballa la vinya, qui fa el vi al celler, qui decideix el tall i la criança, i qui porta els papers. Vuit lliuraments.',
    descSvgEs: 'Cuatro roles dentro del nodo que todo el mundo da por entendido: quien trabaja la viña, quien hace el vino en la bodega, quien decide el corte y la crianza, y quien lleva los papeles. Ocho entregas.',
    una: 'El node que ningú pregunta, obert. Quatre rols, i el que es diuen entre ells decideix l\'any que ve.',
    unaEs: 'El nodo que nadie pregunta, abierto. Cuatro roles, y lo que se dicen entre ellos decide el año que viene.',
    colors: { nucli: 'var(--indigo)' },
    nodes: [
      { id: 'vinya', nom: 'Qui treballa la vinya', nomEs: 'Quién trabaja la viña', cami: 'nucli',
        d: 'Poda, tracta i decideix el dia de verema de cada vessant. És qui sap coses que no s\'escriuen enlloc.',
        dEs: 'Poda, trata y decide el día de vendimia de cada ladera. Es quien sabe cosas que no se escriben en ningún sitio.' },
      { id: 'celler', nom: 'Qui fa el vi al celler', nomEs: 'Quién hace el vino en la bodega', cami: 'nucli',
        d: 'Premsa, dipòsits, trasvasaments. Rep el raïm el dia que arriba i no el dia que li convindria.',
        dEs: 'Prensa, depósitos, trasiegos. Recibe la uva el día que llega y no el día que le convendría.' },
      { id: 'enologia', nom: 'Qui decideix el tall', nomEs: 'Quién decide el corte', cami: 'nucli',
        d: 'El tall, la criança i quan s\'embotella. Decideix sobre el que ja ha passat a la vinya, i per això el retorn importa.',
        dEs: 'El corte, la crianza y cuándo se embotella. Decide sobre lo que ya ha pasado en la viña, y por eso el retorno importa.' },
      { id: 'papers', nom: 'Qui porta els papers', nomEs: 'Quién lleva los papeles', cami: 'nucli',
        d: 'Registres, denominació, declaracions. No apareix a cap relat de la casa i sense ell no es ven una ampolla.',
        dEs: 'Registros, denominación, declaraciones. No aparece en ningún relato de la casa y sin él no se vende una botella.' }
    ],
    parells: [
      ['vinya', 'celler', 'tangible', 'el raïm, el dia que toca', 'intangible', 'quin raïm necessita i de quin vessant',
        'la uva, el día que toca', 'qué uva necesita y de qué ladera', ['anyada', 3], ['anyada', 2]],
      ['celler', 'enologia', 'tangible', 'els dipòsits i les mostres', 'tangible', 'el tall, la criança i el moment d\'embotellar',
        'los depósitos y las muestras', 'el corte, la crianza y el momento de embotellar', ['anyada', 4], ['anyada', 5]],
      ['enologia', 'vinya', 'intangible', 'què s\'ha de canviar a la poda de l\'any que ve', 'intangible', 'com ha anat l\'any a cada vessant',
        'qué hay que cambiar en la poda del año que viene', 'cómo ha ido el año en cada ladera',
        ['anyada', 6], 'sempre'],
      ['papers', 'celler', 'tangible', 'els registres i els permisos al dia', 'tangible', 'els números de la collita',
        'los registros y los permisos al día', 'los números de la cosecha', ['anyada', 1], ['anyada', 7]]
    ],
    processos: [
      { id: 'anyada', nom: 'Una anyada', nomEs: 'Una añada',
        d: 'Dels permisos a l\'ampolla, i el retorn que decideix la poda següent. Set passos.',
        dEs: 'De los permisos a la botella, y el retorno que decide la poda siguiente. Siete pasos.' }
    ],
    sempreMotiu: 'El que la vinya sap de cada vessant no té pas: hi és tot l\'any, i per això no se li compta com a part de fer el vi.',
    sempreMotiuEs: 'Lo que la viña sabe de cada ladera no tiene paso: está todo el año, y por eso no se le cuenta como parte de hacer el vino.'
  }
};

/* ══ EL CAS, CAP A FORA ══════════════════════════════════════════════════════
   `build-castells.js` dibuixa **el mateix cas** mirat des de dalt, i per això
   ha de llegir aquesta declaració i no una còpia. Dues còpies del celler
   divergirien el primer dia que algú hi toqués un parell, i no petaria res: les
   dues vistes seguirien sent maques per separat i dirien coses diferents.

   El `return` és el mateix patró que `build-oferta.js`: qui requereix aquest
   fitxer se'n porta les dades i no n'executa ni les guardes ni l'escriptura. */
/* ══ EL QUE DECIDEIXES AMB EL MAPA ═══════════════════════════════════════════
   La portada explicava **el mètode** i gairebé no deia **què en treus**. Qui
   decideix una compra no és un metodòleg: és algú amb un problema i un
   pressupost, i llegia tres pantalles de com es dibuixa un graf abans de
   trobar cap frase que parlés de la seva feina.

   Això ho inverteix: primer la decisió que avui es pren a cegues, després el
   que el mapa hi posa. Cada parella és una situació que es reconeix sense
   saber res de xarxes de valor.

   ⚠ **Cap d'aquestes files promet un resultat**, i és una decisió: prometre
   «un 30 % menys de temps d'entrega» seria una xifra sense font, que és el que
   la casa no fa. El que es promet és **què podràs decidir**, que és comprovable
   el mateix dia de la sessió. */
const DECIDEIX = [
  { cegues: 'Qui és imprescindible de debò, i què passa si plega',
    cegaEs: 'Quién es imprescindible de verdad, y qué pasa si se va',
    amb: 'Es veu qui sosté què i quants fils passen per una sola persona. No és una intuïció: es compta al dibuix.',
    ambEs: 'Se ve quién sostiene qué y cuántos hilos pasan por una sola persona. No es una intuición: se cuenta en el dibujo.' },
  { cegues: 'Per què les decisions s\'encallen entre dues àrees',
    cegaEs: 'Por qué las decisiones se atascan entre dos áreas',
    amb: 'Surt qui toca les dues alhora — i si no hi ha ningú, surt el buit. Un buit es cobreix; una mala relació, no.',
    ambEs: 'Sale quien toca las dos a la vez — y si no hay nadie, sale el hueco. Un hueco se cubre; una mala relación, no.' },
  { cegues: 'Quina feina es fa i no l\'aprofita ningú',
    cegaEs: 'Qué trabajo se hace y no lo aprovecha nadie',
    amb: 'Cada entregable es puntua: qui el rep n\'està satisfet o no. El que ningú marca és feina que es podria deixar de fer.',
    ambEs: 'Cada entregable se puntúa: quien lo recibe está satisfecho o no. Lo que nadie marca es trabajo que se podría dejar de hacer.' },
  { cegues: 'Què esteu donant de franc sense haver-ho decidit',
    cegaEs: 'Qué estáis dando gratis sin haberlo decidido',
    amb: 'Els «extra» —el que es dona i ningú pot reclamar— surten al full amb nom. Llavors es decideix: es cobra, es pacta o es deixa de donar.',
    ambEs: 'Los «extra» —lo que se da y nadie puede reclamar— salen en la hoja con nombre. Entonces se decide: se cobra, se pacta o se deja de dar.' },
  { cegues: 'Per on començar, quan tot sembla urgent',
    cegaEs: 'Por dónde empezar, cuando todo parece urgente',
    amb: 'De dos a quatre punts marcats amb un cor: on cal mirar perquè d\'allà depèn que la resta flueixi.',
    ambEs: 'De dos a cuatro puntos marcados con un corazón: dónde hay que mirar porque de ahí depende que lo demás fluya.' },
  { cegues: 'Si el que heu muntat sobreviurà a qui el va muntar',
    cegaEs: 'Si lo que habéis montado sobrevivirá a quien lo montó',
    amb: 'El mapa queda a la casa i es pot tornar a mirar d\'aquí a sis mesos. Un PDF caduca el primer dia que algú canvia de rol.',
    ambEs: 'El mapa se queda en la casa y se puede volver a mirar dentro de seis meses. Un PDF caduca el primer día que alguien cambia de rol.' }
];

/* ══ PER QUÈ FUNCIONA, I QUÈ HO PROVA ════════════════════════════════════════
   Tres coses, i van en aquest ordre perquè és l'ordre en què les pregunta qui
   ha de decidir: què el fa funcionar, de qui és el mètode, i on s'ha fet.

   La tercera fila diu on s'ha practicat el mètode **sense anomenar cap cas de
   client**: els casos no es publiquen sense permís (decidit per l'Àlvar el
   09/10/2026). La de Verna Allee diu de qui és el mètode, no el que en fem
   nosaltres: la distinció és la diferència entre citar i apropiar-se. */
const PROVA = [
  { k: 'Per què funciona',
    kEs: 'Por qué funciona',
    t: 'Perquè el dibuixeu vosaltres',
    tEs: 'Porque lo dibujáis vosotros',
    d: 'El mapa no el porta el consultor acabat: el fa el grup, amb post-its, dient en veu alta qui dona què a qui. <b>Aquesta conversa és el producte.</b> Un informe es llegeix i s\'arxiva; el que s\'ha dit en veu alta davant de tothom ja no es desdiu, i l\'endemà l\'equip parla amb les mateixes paraules.',
    dEs: 'El mapa no lo trae el consultor acabado: lo hace el grupo, con post-its, diciendo en voz alta quién da qué a quién. <b>Esa conversación es el producto.</b> Un informe se lee y se archiva; lo que se ha dicho en voz alta delante de todos ya no se desdice, y al día siguiente el equipo habla con las mismas palabras.' },
  { k: 'De qui és el mètode',
    kEs: 'De quién es el método',
    t: 'De Verna Allee, i no nostre',
    tEs: 'De Verna Allee, y no nuestro',
    d: 'Value Network Analysis, de <i>The Future of Knowledge</i> (2003) i <i>Value Networks and the True Nature of Collaboration</i> (2011). <b>No ens l\'hem inventat i no el venem com a propietari</b>: el pots llegir, el pot facilitar un altre, i el que compres és que surti bé a la primera.',
    dEs: 'Value Network Analysis, de <i>The Future of Knowledge</i> (2003) y <i>Value Networks and the True Nature of Collaboration</i> (2011). <b>No nos lo hemos inventado y no lo vendemos como propietario</b>: lo puedes leer, lo puede facilitar otro, y lo que compras es que salga bien a la primera.' },
  { k: 'On s\'ha fet',
    kEs: 'Dónde se ha hecho',
    t: 'A Pantheon Work, des del 2019',
    tEs: 'En Pantheon Work, desde 2019',
    d: 'L\'Álvaro Solache hi dirigeix projectes de consultoria amb aquest mètode, i en va cocrear la pràctica: venda, planificació, producció i formació. <b>Les fases, el full i les preguntes d\'aquesta pàgina surten del guió d\'una sessió real amb un equip de direcció</b>, no d\'un manual.',
    dEs: 'Álvaro Solache dirige allí proyectos de consultoría con este método, y cocreó su práctica: venta, planificación, producción y formación. <b>Las fases, la hoja y las preguntas de esta página salen del guion de una sesión real con un equipo de dirección</b>, no de un manual.' }
];

/* ══ COM ÉS UNA SESSIÓ · el full, els post-its i els gomets ══════════════════
   La pàgina explicava el mètode i **no ensenyava com es fa**. Qui ha de decidir
   si contracta una sessió vol veure què passarà a la sala, i això no ho diu una
   llista de passos: ho diu el full.

   Aquest dibuix és el full de paper d'estrassa tal com queda, i tot el que hi
   surt és del guió d'una sessió real i de l'article d'on ve el mètode:

   · **L'abast escrit a dalt**, amb els noms i la data. És el pas 1 i es queda
     escrit al full perquè a mitja sessió algú sempre pregunta «i això també
     hi entra?».
   · **El rol central al mig** i la resta al voltant, més a prop els que tenen
     més transaccions.
   · **Els entregables en dos colors**: verd pels **«must»** —el que és
     contractual i exigible— i rosa pels **«extra»**, el que es dona per
     construir la relació i que ningú pot reclamar. Es diuen amb **noms, no amb
     verbs**, perquè un entregable és una cosa que es pot comprovar si ha
     arribat o no.
   · **Els gomets de satisfacció**: blau si qui ho rep n'està satisfet, groc si
     no. Això no és decoració — és la capa que converteix un dibuix en un
     diagnòstic.
   · **Els cors del pols**: de dos a quatre llocs on cal mirar què passa per
     saber si el flux de valor està sa. *I la pregunta que els acompanya: quin
     rol és més essencial per a la supervivència de la xarxa, i què passaria si
     aquella persona la substituís una altra.*

   Aportat per l'Àlvar el 02/10/2026 amb el guió d'una sessió real.
   `build-castells.js` no hi té res a veure: això és el full, no la pinya. */
const SESSIO = {
  abast: 'Àmbit: la xarxa de venda i devolucions',
  abastEs: 'Ámbito: la red de venta y devoluciones',
  peu: 'Noms dels participants · data',
  peuEs: 'Nombres de los participantes · fecha',
  titolSvg: 'Com queda el full d\'una sessió de mapa de valor',
  titolSvgEs: 'Cómo queda la hoja de una sesión de mapa de valor',
  descSvg: 'Un full gran amb l\'àmbit escrit a dalt, el rol central al mig i sis rols al voltant. Entre ells, etiquetes verdes pels entregables «must» i roses pels «extra», gomets blaus i grocs de satisfacció, i cors als llocs on cal mirar el pols del flux.',
  descSvgEs: 'Una hoja grande con el ámbito escrito arriba, el rol central en medio y seis roles alrededor. Entre ellos, etiquetas verdes para los entregables «must» y rosas para los «extra», gomets azules y amarillos de satisfacción, y corazones en los sitios donde hay que mirar el pulso del flujo.',
  /* Un exemple de full, no el d'un client. Els rols són genèrics a posta: el
     full que es publica no pot ser el d'una casa concreta. */
  centre: 'El nostre equip',
  centreEs: 'Nuestro equipo',
  /* ── LES ETIQUETES DEL FULL, EN LES DUES LLENGÜES ──────────────────────
     S'escriuen **un cop per llengua**, com els noms dels nodes del graf, i
     **l'amplada de cada caixa surt de la llengua més llarga de les dues**.
     Fet d'una altra manera, la caixa calculada amb el català hauria deixat el
     text castellà fora del paper — que és el defecte que aquest fitxer ja va
     tenir amb una amplada fixa, i que una guarda d'aquí comprova. */
  volta: [
    { t: 'Qui ven', tEs: 'Quién vende', must: 'la comanda', mustEs: 'el pedido',
      extra: 'què demana la gent', extraEs: 'qué pide la gente', gomet: 'blau', cor: true },
    { t: 'Qui entrega', tEs: 'Quién entrega', must: 'el lliurament', mustEs: 'la entrega',
      extra: 'avisar si falla', extraEs: 'avisar si falla', gomet: 'groc' },
    { t: 'Qui cobra', tEs: 'Quién cobra', must: 'la factura', mustEs: 'la factura', extra: '', extraEs: '' },
    { t: 'Qui atén', tEs: 'Quién atiende', must: 'la devolució', mustEs: 'la devolución',
      extra: 'el to en què es resol', extraEs: 'el tono en que se resuelve', gomet: 'blau', cor: true },
    { t: 'Qui compra', tEs: 'Quién compra', must: 'el que paga', mustEs: 'lo que paga',
      extra: 'que torni i ho digui', extraEs: 'que vuelva y lo diga' },
    { t: 'Qui proveeix', tEs: 'Quién provee', must: 'l\'estoc a temps', mustEs: 'el stock a tiempo',
      extra: 'avisar de la ruptura', extraEs: 'avisar de la rotura' }
  ],
  llegenda: [
    { k: 'must', t: '«Must» · verd', tEs: '«Must» · verde',
      d: 'Contractual i exigible: el que es dona per fet que arribarà.',
      dEs: 'Contractual y exigible: lo que se da por hecho que llegará.' },
    { k: 'extra', t: '«Extra» · rosa', tEs: '«Extra» · rosa',
      d: 'El que es dona per construir la relació i que ningú pot reclamar.',
      dEs: 'Lo que se da para construir la relación y que nadie puede reclamar.' },
    { k: 'blau', t: 'Gomet blau', tEs: 'Gomet azul',
      d: 'Qui ho rep n\'està satisfet.', dEs: 'Quien lo recibe está satisfecho.' },
    { k: 'groc', t: 'Gomet groc', tEs: 'Gomet amarillo',
      d: 'Qui ho rep no n\'està satisfet. Aquí és on hi ha feina.',
      dEs: 'Quien lo recibe no está satisfecho. Aquí es donde hay trabajo.' },
    { k: 'cor', t: 'Cor', tEs: 'Corazón',
      d: 'De dos a quatre llocs on cal mirar el pols del flux de valor.',
      dEs: 'De dos a cuatro sitios donde hay que mirar el pulso del flujo de valor.' }
  ]
};

/* ══ LES PREGUNTES DE L'ANÀLISI ══════════════════════════════════════════════
   Les del guió d'una sessió real, tal com es fan a la sala. Van a la pàgina perquè són el
   que converteix el dibuix en una conversa: **el mapa no diu res sol**, el que
   diu alguna cosa és qui respon aquestes vuit preguntes mirant-lo. */
const PREGUNTES = [
  ['Qui és més actiu a la xarxa? Per què?', '¿Quién es más activo en la red? ¿Por qué?'],
  ['Qui és menys actiu? Per què?', '¿Quién es menos activo? ¿Por qué?'],
  ['Qui hi hauria de sortir i no hi surt? Per què?', '¿Quién debería salir y no sale? ¿Por qué?'],
  ['Quines relacions caldria començar, enfortir o reprendre?', '¿Qué relaciones habría que empezar, fortalecer o reanudar?'],
  ['Tots els entregables aporten valor, o en generen un altre com a resposta?', '¿Todos los entregables aportan valor, o generan otro como respuesta?'],
  ['Hi ha algun intercanvi dèbil o en risc?', '¿Hay algún intercambio débil o en riesgo?'],
  ['La xarxa aporta valor a tots els rols?', '¿La red aporta valor a todos los roles?'],
  ['Algú rep molt més del que aporta, o aporta molt més del que rep?', '¿Alguien recibe mucho más de lo que aporta, o aporta mucho más de lo que recibe?']
];

function svgSessio(id, clau) {
  const W = 640, H = 430, cx = 320, cy = 232, R = 148;
  const p = [];
  const n = SESSIO.volta.length;
  const i18 = k => clau ? ` data-i18n="${clau}.${k}"` : '';
  /* Una etiqueta del full, en les dues llengües. Quan la pàgina no té
     diccionari (`clau` buida) només s'escriu la catalana, que és el que feia
     aquesta funció fins avui i el que ha de fer a la portada. Les ensenya el
     CSS segons l'atribut `lang`, igual que els noms dels nodes del graf. */
  /* Els atributs van **abans** de la classe: la guarda del full llegeix
     `<rect …/><text x="…"` per comprovar que cap etiqueta surt de la seva
     caixa, i una classe pel mig la deixaria cega sense dir-ho. */
  const dos = (ca, es, cls, atrs) => {
    const u = (t, l) => {
      const c = [cls, clau ? 'mv-' + l : ''].filter(Boolean).join(' ');
      return `<text${atrs}${c ? ` class="${c}"` : ''}>${esc(t)}</text>`;
    };
    return u(ca, 'ca') + (clau && es && es !== ca ? u(es, 'es') : '');
  };
  p.push(`<svg id="${id}" class="mv-svg se-svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${id}T ${id}D">`);
  p.push(`<title id="${id}T"${i18('tit')}>${esc(SESSIO.titolSvg)}</title>`);
  p.push(`<desc id="${id}D"${i18('desc')}>${esc(SESSIO.descSvg)}</desc>`);
  // El full
  p.push(`<rect class="se-full" x="8" y="8" width="${W - 16}" height="${H - 16}" rx="4"/>`);
  p.push(dos(SESSIO.abast, SESSIO.abastEs, 'se-abast', ' x="24" y="34"'));
  p.push(dos(SESSIO.peu, SESSIO.peuEs, 'se-peu', ' x="24" y="50"'));
  const pos = SESSIO.volta.map((r, i) => {
    const a = (-90 + i * 360 / n) * Math.PI / 180;
    return { ...r, x: cx + R * Math.cos(a) * 1.42, y: cy + R * Math.sin(a) * .82 };
  });
  // Les fletxes i les etiquetes, primer: els post-its hi queden a sobre
  pos.forEach(r => {
    const dx = r.x - cx, dy = r.y - cy, d = Math.hypot(dx, dy) || 1;
    const ux = dx / d, uy = dy / d;
    const x1 = cx + ux * 52, y1 = cy + uy * 24, x2 = r.x - ux * 46, y2 = r.y - uy * 20;
    p.push(`<line class="se-fl" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    /* El «must» i l'«extra» del mateix vincle, un a cada banda de la fletxa:
       és com queden al full, i és el que fa veure que **tot vincle en porta
       dos** i que sovint l'extra és el que no s'havia dit mai en veu alta.

       L'amplada surt de la llargada del text i no és fixa. Amb una amplada
       fixa, les etiquetes llargues **sortien de la seva caixa** —el text a
       sobre del paper i el color a mig camí—, i es va veure mirant el dibuix.
       El 5,3 és l'amplada d'un caràcter a 9,5px en monoespaiada, amb marge; va
       pujar de 5 el 03/10/2026 amb la lletra, i la guarda d'aquest fitxer fa
       servir **la mateixa xifra**: amb dues, la comprovació deixaria de dir el
       que el dibuix fa. */
    /* L'amplada surt de **la llengua més llarga de les dues**: calculada amb
       el català, la mateixa caixa hauria deixat el text castellà fora del
       paper. A la portada, on només s'escriu el català, el màxim no canvia res
       quan el castellà és més curt — i quan és més llarg, la caixa és un xic
       més ampla i les dues pàgines dibuixen el mateix full. */
    const ample = (ca, es) => Math.max(58, Math.max(String(ca).length, String(es || '').length) * 5.3 + 12);
    const am = ample(r.must, r.mustEs);
    p.push(`<g class="se-et must"><rect x="${(mx - am / 2).toFixed(1)}" y="${(my - 15).toFixed(1)}" width="${am.toFixed(1)}" height="13" rx="2"/>`
      + dos(r.must, r.mustEs, '', ` x="${mx.toFixed(1)}" y="${(my - 5.5).toFixed(1)}"`) + '</g>');
    let dreta = am / 2;
    if (r.extra) {
      const ae = ample(r.extra, r.extraEs);
      dreta = Math.max(dreta, ae / 2);
      p.push(`<g class="se-et extra"><rect x="${(mx - ae / 2).toFixed(1)}" y="${(my + 2).toFixed(1)}" width="${ae.toFixed(1)}" height="13" rx="2"/>`
        + dos(r.extra, r.extraEs, '', ` x="${mx.toFixed(1)}" y="${(my + 11.5).toFixed(1)}"`) + '</g>');
    }
    /* El gomet, **fora** de l'etiqueta i no a sobre: enganxat al paper al
       costat de l'entregable que puntua, com al full de debò. */
    if (r.gomet) p.push(`<circle class="se-go ${r.gomet}" cx="${(mx + dreta + 8).toFixed(1)}" cy="${(my - 8).toFixed(1)}" r="5"/>`);
  });
  // El rol central
  p.push(`<g class="se-po centre"><rect x="${cx - 52}" y="${cy - 22}" width="104" height="44" rx="3"/>`
    + dos(SESSIO.centre, SESSIO.centreEs, '', ` x="${cx}" y="${cy + 4}"`) + '</g>');
  // I els de la volta, amb el seu cor si en té
  pos.forEach(r => {
    p.push(`<g class="se-po"><rect x="${(r.x - 46).toFixed(1)}" y="${(r.y - 18).toFixed(1)}" width="92" height="36" rx="3"/>`
      + dos(r.t, r.tEs, '', ` x="${r.x.toFixed(1)}" y="${(r.y + 4).toFixed(1)}"`)
      + (r.cor ? `<text class="se-cor" x="${(r.x + 38).toFixed(1)}" y="${(r.y - 12).toFixed(1)}">♥</text>` : '')
      + '</g>');
  });
  p.push('</svg>');
  return p.join('');
}

/* Sense les marques: les posa el bucle d'escriptura (`obre + fn() + tanca`).
   Aquesta funció les escrivia **també**, i com que el bucle conserva el que hi
   ha després del primer tancament, cada execució n'hi afegia una còpia: el
   02/10/2026 `vna.html` tenia **dues obertures i tretze tancaments**, i cap
   marcatge trencat a la vista perquè un comentari HTML repetit no es veu. El
   que sí que es veia era `--check` en vermell sense dir-ne el motiu. */
function blocSessio() {
  const i18 = k => ` data-i18n="${k}"`;
  const i18h = k => ` data-i18n-html="${k}"`;
  const f = [];
  f.push('<!-- GENERAT per SOS/tools/build-mapavalor.js · no s\'edita a mà -->');
  f.push('<section class="mv-sec">');
  f.push(`<h2${i18('vn.ses.h2')}>${VN['vn.ses.h2'].ca}</h2>`);
  f.push(`<p class="mv-sub"${i18h('vn.ses.sub')}>${VN['vn.ses.sub'].ca}</p>`);
  f.push('<div class="mv-viz gran">');
  f.push(svgSessio('mvSessio', 'vs'));
  f.push('</div>');
  f.push('<div class="se-leg">' + SESSIO.llegenda.map(l =>
    `<span class="se-l"><i class="se-i ${l.k}"></i><b data-i18n="vn.lg.${l.k}.t">${esc(l.t)}</b> `
    + `<span data-i18n="vn.lg.${l.k}.d">${esc(l.d)}</span></span>`).join('') + '</div>');
  f.push(`<p class="mv-nota"${i18h('vn.ses.nota')}>${VN['vn.ses.nota'].ca}</p>`);
  f.push('</section>');

  f.push('<section class="mv-sec">');
  f.push(`<h2${i18('vn.fa.h2')}>${VN['vn.fa.h2'].ca}</h2>`);
  f.push(`<p class="mv-sub"${i18h('vn.fa.sub')}>${VN['vn.fa.sub'].ca}</p>`);
  f.push('<ol class="mv-fa">');
  FASES.forEach(x => {
    const dins = PROCES.filter(y => y.fase === x.id);
    /* El recompte de passos i la llista de títols es construeixen de les claus
       dels passos, que ja existeixen al diccionari: repetir-los aquí com a text
       voldria dir tenir dues vegades el mateix títol, i el dia que un canviés
       només canviaria en un dels dos llocs. */
    f.push(`<li><span class="mv-fn">${x.n}</span><b data-i18n="vn.f${x.n}.t">${esc(x.t)}</b>`
      + `<p data-i18n="vn.f${x.n}.d">${esc(x.d)}</p>`
      + `<span class="mv-fp">${dins.length} <span data-i18n="vn.fp.${dins.length === 1 ? 'un' : 'molts'}">`
      + `${dins.length === 1 ? 'pas' : 'passos'}</span>: `
      + dins.map(y => `<span data-i18n="vn.p${y.n}.t">${esc(y.t)}</span>`).join(' · ') + '</span></li>');
  });
  f.push('</ol>');
  f.push('</section>');

  /* ⚠ **Les vuit preguntes ja no van aquí.** Eren una secció d'aquest bloc i
     ara són la vuitena lectura del llenç (`blocLectures`), que és on toca:
     es responen **amb el dibuix al davant**, i fins avui es llegien tres
     pantalles més avall que el dibuix.

     Es diu i no s'esborra en silenci perquè el codi que hi havia es va quedar
     escrivint `esc(q)` damunt d'una entrada que havia passat a ser `[ca, es]`:
     cada pregunta sortia amb les dues llengües seguides i separades per una
     coma, a la pàgina, sense petar res. Ho va trobar la prova de navegador
     buscant text català amb el castellà posat. */
  return f.join('\n');
}

/* ══ EL BLOC DEL VALOR · per a qui decideix, no per a qui estudia ════════════
   Va a la portada i va **alt**: just després de veure què és un mapa de valor
   i abans d'explicar com es fa. L'ordre importa — qui decideix una compra vol
   saber què en treu abans de saber com es dibuixa, i fins ara era al revés.

   Les claus van als dos diccionaris de la portada des del primer dia. És la
   lliçó del 02/10/2026: un bloc generat que es declara en una sola llengua
   **passa totes les guardes** i deixa mitja secció en català per a qui llegeix
   en castellà. */
function blocValor() {
  const i18 = k => ` data-i18n="${k}"`;
  const i18h = k => ` data-i18n-html="${k}"`;
  const f = [];
  f.push('<div class="vd-wrap fade-up">');
  f.push('  <table class="vd-t"><thead><tr>'
    + `<th${i18('vd.cap1')}>El que avui es decideix a ulls clucs</th>`
    + `<th${i18('vd.cap2')}>El que decideixes amb el mapa al davant</th>`
    + '</tr></thead><tbody>');
  DECIDEIX.forEach((d, i) => {
    f.push(`    <tr><td class="vd-c"${i18(`vd.${i}.c`)}>${esc(d.cegues)}</td>`
      + `<td class="vd-a"${i18h(`vd.${i}.a`)}>${d.amb}</td></tr>`);
  });
  f.push('  </tbody></table>');
  f.push(`  <p class="vd-avis"${i18h('vd.avis')}>Cap d\'aquestes files promet un resultat amb una xifra. `
    + 'Prometre «un 30 % menys de temps d\'entrega» seria un número sense d\'on surt, i això aquí no es fa. '
    + '<b>El que es promet és què podràs decidir</b> — i es comprova el mateix dia de la sessió.</p>');
  f.push('  <div class="vd-prova">');
  PROVA.forEach((x, i) => {
    f.push(`    <div class="vd-p"><div class="vd-pk"${i18(`vd.p${i}.k`)}>${esc(x.k)}</div>`
      + `<b${i18(`vd.p${i}.t`)}>${esc(x.t)}</b>`
      + `<p${i18h(`vd.p${i}.d`)}>${x.d}</p></div>`);
  });
  f.push('  </div>');
  f.push('</div>');
  return f.join('\n');
}

/* El diccionari d'aquest bloc, per a les dues llengües. */
function dicValor(l) {
  const q = x => String(x).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const tria = (o, c, cEs) => l === 'es' ? (o[cEs] || o[c]) : o[c];
  const f = [];
  const FIX = {
    'vd.cap1': { ca: 'El que avui es decideix a ulls clucs', es: 'Lo que hoy se decide a ciegas' },
    'vd.cap2': { ca: 'El que decideixes amb el mapa al davant', es: 'Lo que decides con el mapa delante' },
    'vd.avis': {
      ca: 'Cap d\'aquestes files promet un resultat amb una xifra. Prometre «un 30 % menys de temps d\'entrega» seria un número sense d\'on surt, i això aquí no es fa. <b>El que es promet és què podràs decidir</b> — i es comprova el mateix dia de la sessió.',
      es: 'Ninguna de estas filas promete un resultado con una cifra. Prometer «un 30 % menos de tiempo de entrega» sería un número sin de dónde sale, y eso aquí no se hace. <b>Lo que se promete es qué podrás decidir</b> — y se comprueba el mismo día de la sesión.'
    }
  };
  Object.entries(FIX).forEach(([k, v]) => f.push(`  '${k}':'${q(v[l])}',`));
  DECIDEIX.forEach((d, i) => {
    f.push(`  'vd.${i}.c':'${q(tria(d, 'cegues', 'cegaEs'))}',`);
    f.push(`  'vd.${i}.a':'${q(tria(d, 'amb', 'ambEs'))}',`);
  });
  PROVA.forEach((x, i) => {
    f.push(`  'vd.p${i}.k':'${q(tria(x, 'k', 'kEs'))}',`);
    f.push(`  'vd.p${i}.t':'${q(tria(x, 't', 'tEs'))}',`);
    f.push(`  'vd.p${i}.d':'${q(tria(x, 'd', 'dEs'))}',`);
  });
  return f.join('\n');
}

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
  titolSvgEs: 'Mapa de valor de la red de TeamTowers',
  descSvg: 'Set rols i setze lliuraments. A l\'esquerra i al centre, els quatre oficis de la casa: qui mapa, qui forma, qui ho fa passar i qui construeix la peça. A la dreta, les agències, les empreses i les institucions.',
  descSvgEs: 'Siete roles y dieciséis entregas. A la izquierda y en el centro, los cuatro oficios de la casa: quién mapea, quién forma, quién lo hace pasar y quién construye la pieza. A la derecha, las agencias, las empresas y las instituciones.',
  colors: { casa: 'var(--indigo)', fora: 'var(--green)', canal: 'var(--muted)' },
  nodes: [
    { id: 'mapa', nom: 'Qui mapa el valor', nomEs: 'Quién mapea el valor', x: 320, y: 58, cami: 'casa',
      d: 'Dibuixa qui dona què a qui, també el que no es factura. És el node del qual pengen tots els altres oficis de la casa.',
      dEs: 'Dibuja quién da qué a quién, también lo que no se factura. Es el nodo del que cuelgan todos los demás oficios de la casa.' },
    { id: 'forma', nom: 'Qui forma fent', nomEs: 'Quién forma haciendo', x: 320, y: 200, cami: 'casa',
      d: 'Setze mòduls sobre el cas de qui els fa, no sobre un d\'inventat. És el que fa que el mapa no se\'n vagi amb nosaltres.',
      dEs: 'Dieciséis módulos sobre el caso de quien los hace, no sobre uno inventado. Es lo que hace que el mapa no se vaya con nosotros.' },
    { id: 'produeix', nom: 'Qui ho fa passar', nomEs: 'Quién lo hace pasar', x: 96, y: 128, cami: 'casa',
      d: 'Jornades, diades i logística, amb una sola persona responsable de tot el que pot sortir malament.',
      dEs: 'Jornadas, diadas y logística, con una sola persona responsable de todo lo que puede salir mal.' },
    { id: 'construeix', nom: 'Qui construeix la peça', nomEs: 'Quién construye la pieza', x: 96, y: 300, cami: 'casa',
      d: 'Les eines: el SOS, els fluxos amb IA, les guardes que comproven a cada canvi que allò segueix dient la veritat.',
      dEs: 'Las herramientas: el SOS, los flujos con IA, las guardas que comprueban en cada cambio que aquello sigue diciendo la verdad.' },
    { id: 'agencies', nom: 'Agències i consultores', nomEs: 'Agencias y consultoras', x: 320, y: 372, cami: 'canal',
      d: 'Tenen la relació i el volum; no tenen el mètode. És una relació sana i té la mateixa particularitat que el distribuïdor del celler.',
      dEs: 'Tienen la relación y el volumen; no tienen el método. Es una relación sana y tiene la misma particularidad que el distribuidor de la bodega.' },
    { id: 'empreses', nom: 'Empreses i cooperatives', nomEs: 'Empresas y cooperativas', x: 540, y: 128, cami: 'fora',
      d: 'Compren decidir millor i que l\'equip ho sostingui. Paguen amb pressupost propi i a termini curt.',
      dEs: 'Compran decidir mejor y que el equipo lo sostenga. Pagan con presupuesto propio y a plazo corto.' },
    { id: 'institucions', nom: 'Institucions i administració', nomEs: 'Instituciones y administración', x: 540, y: 300, cami: 'fora',
      d: 'Ajuntaments, consells i centres educatius. Compren el mateix i ho paguen d\'una altra manera, amb els seus temps i els seus límits.',
      dEs: 'Ayuntamientos, consejos y centros educativos. Compran lo mismo y lo pagan de otra manera, con sus tiempos y sus límites.' }
  ],
  /* Com a `CELLER`: els dos últims elements de cada parell són el que es
     llegeix passant el ratolí, en castellà. */
  parells: [
    ['mapa', 'empreses', 'tangible', 'el mapa dels intercanvis reals i on es perd valor',
      'intangible', 'accés al que de debò passa dins de la casa',
      'el mapa de los intercambios reales y dónde se pierde valor', 'acceso a lo que de verdad pasa dentro de la casa'],
    ['mapa', 'institucions', 'tangible', 'el mapa del teixit: qui sosté què i de qui penja tot',
      'intangible', 'la porta al territori i la legitimitat de l\'encàrrec públic',
      'el mapa del tejido: quién sostiene qué y de quién cuelga todo', 'la puerta al territorio y la legitimidad del encargo público'],
    ['forma', 'empreses', 'tangible', 'un equip format sobre el seu propi cas',
      'tangible', 'pressupost de formació, que és el que té partida',
      'un equipo formado sobre su propio caso', 'presupuesto de formación, que es el que tiene partida'],
    ['forma', 'institucions', 'tangible', 'tècnics que poden replicar-ho sense nosaltres',
      'intangible', 'una comunitat de pràctica que dura més que el contracte',
      'técnicos que pueden replicarlo sin nosotros', 'una comunidad de práctica que dura más que el contrato'],
    ['produeix', 'institucions', 'tangible', 'la jornada muntada i una sola persona responsable',
      'intangible', 'vint anys de confiança al Penedès, que no es compra',
      'la jornada montada y una sola persona responsable', 'veinte años de confianza en el Penedès, que no se compran'],
    ['agencies', 'mapa', 'intangible', 'la confiança del seu client, que és el que de debò venen',
      'tangible', 'un mètode que no tenen i que les diferencia',
      'la confianza de su cliente, que es lo que de verdad venden', 'un método que no tienen y que las diferencia'],
    ['construeix', 'empreses', 'tangible', 'la peça funcionant, amb els fitxers seus i sense lligams',
      'tangible', 'el que es paga per la peça',
      'la pieza funcionando, con sus ficheros y sin ataduras', 'lo que se paga por la pieza'],
    /* L'únic intercanvi **de dins cap a dins**: el mapa produeix el material
       que la formació fa servir, i la formació torna els casos que milloren el
       mapa. Que només n'hi hagi un és la troballa, i la compta el generador. */
    ['mapa', 'forma', 'tangible', 'el cas real sobre el qual s\'aprèn',
      'intangible', 'els casos que tornen i que fan millor el mètode',
      'el caso real sobre el que se aprende', 'los casos que vuelven y que hacen mejor el método']
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
  { t: 'El mapa dibuixat', tEs: 'El mapa dibujado',
    d: 'Nodes, transaccions i les dues menes, amb els noms reals de la casa. En paper per a la sala i al SOS per continuar.',
    dEs: 'Nodos, transacciones y las dos clases, con los nombres reales de la casa. En papel para la sala y en el SOS para continuar.' },
  { t: 'Les tres anàlisis', tEs: 'Los tres análisis',
    d: 'Intercanvi, impacte i creació de valor, escrites: què hi ha, no què n\'opinem.',
    dEs: 'Intercambio, impacto y creación de valor, escritos: qué hay, no qué opinamos.' },
  { t: 'Els tres moviments', tEs: 'Los tres movimientos',
    d: 'Què es pot cobrar, què s\'ha de repartir i quin vincle s\'ha de reparar. Amb nom i data.',
    dEs: 'Qué se puede cobrar, qué hay que repartir y qué vínculo hay que reparar. Con nombre y fecha.' },
  { t: 'El mapa viu', tEs: 'El mapa vivo',
    d: 'Carregat al SOS, editable per la casa i sense dependre de nosaltres per tornar-lo a mirar.',
    dEs: 'Cargado en el SOS, editable por la casa y sin depender de nosotros para volverlo a mirar.' }
];

/* ══ EL QUE ES COMPTA ════════════════════════════════════════════════════════ */
const flux = CELLER.parells.flatMap(p => [
  { de: p[0], a: p[1], mena: p[2], q: p[3], seq: p[8] || null },
  { de: p[1], a: p[0], mena: p[4], q: p[5], seq: p[9] || null }
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
   pot preparar una màquina; si és **intangible**, o el seu tipus no surt d'una
   màquina, és de persona.

   La regla **s'executa, no es copia**: es llegeixen de `SOS/index.html` els dos
   trossos que `build-vna-suport.js` posa al kit, més `repartimentMaquina`, i es
   criden tal com són. Fins al 10/10/2026 aquí hi havia una llista
   de pistes pròpia, i la guarda només mirava que els seus tipus existissin a
   l'app: la portada en comptava 5 de màquina quan l'app no en comptava cap
   (veda 164). El que l'etiqueta no diu, ho diu `CELLER.tipus`. */
let REGLA_ERR = '';
const REGLA = (() => {
  const app = readFileSync(join(SOS, 'index.html'), 'utf8');
  const tros = (inici, fi) => {
    const a = app.indexOf(inici), b = a < 0 ? -1 : app.indexOf(fi, a);
    return b < 0 ? '' : app.slice(a, b + fi.length);
  };
  const font = [
    tros('const normKind=', 'const isIntangible=k=>normKind(k)===\'intangible\';'),
    tros('const ENTREGABLES=[', '\n  return{pot:true,motiu:\'\',tipus:t};\n}'),
    tros('function repartimentMaquina(node){', '\n  return r;\n}')
  ];
  if (font.some(t => !t)) { REGLA_ERR = 'no es troba on comença o acaba'; return null; }
  try { return new Function(font.join('\n') + '\nreturn{ENTREGABLES,fluxAutomatitzable,repartimentMaquina};')(); }
  catch (e) { REGLA_ERR = e.message; return null; }
})();
// Com un flux del SOS: `entregable` és el tipus triat a mà, i l'app el mira abans que les pistes.
const comFlux = f => ({ kind: f.mena, label: f.q, entregable: CELLER.tipus[f.q] });
let QUI = [], REP = null;
if (REGLA) try {
  QUI = flux.map(f => {
    const a = REGLA.fluxAutomatitzable(comFlux(f));
    return { f, qui: a.pot ? 'maquina' : a.motiu === 'intangible' || a.tipus ? 'persona' : 'sense', tipus: a.tipus || null };
  });
  REP = REGLA.repartimentMaquina({ vna: { exchanges: flux.map(comFlux) } });
} catch (e) { REGLA_ERR = e.message; QUI = []; REP = null; }
const cQui = REP ? { maquina: REP.maquina, persona: REP.persona, sense: REP.senseTipus }
  : { maquina: 0, persona: 0, sense: 0 };
// Els tangibles que són de persona perquè el seu tipus no surt d'una màquina.
const cDiners = QUI.filter(x => x.qui === 'persona' && x.f.mena !== 'intangible').length;
/* El que diuen les frases de la portada. Si el repartiment canvia, la guarda 9
   peta i s'han de reescriure: el número canviaria sol i la frase no. */
const QUI_DIU = {
  maquina: ['volum a preu de canal'],
  persona: 'cobrament',
  diners: ['el que paga per l\'experiència, no per l\'ampolla', 'el que paga pel viatge sencer',
    'despesa que es queda al municipi']
};
const QUI_TXT = {
  maquina: {
    ca: 'el pot preparar una màquina: la comanda del distribuïdor, que és tangible i té un entregable conegut',
    es: 'lo puede preparar una máquina: el pedido del distribuidor, que es tangible y tiene un entregable conocido'
  },
  persona: {
    ca: `són de persona, sempre: els ${cTot.i} intangibles i els ${cDiners} pagaments. <b>La màquina no toca cap intangible</b> —el sistema no en té manera— i un pagament només el dona per fet qui el rep`,
    es: `son de persona, siempre: los ${cTot.i} intangibles y los ${cDiners} pagos. <b>La máquina no toca ningún intangible</b> —el sistema no tiene manera— y un pago solo lo da por hecho quien lo recibe`
  }
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
function svgMapa(mapa, id, clau, dins) {
  /* ── LES POSICIONS, SI NO ES DECLAREN ──────────────────────────────────
     Es reparteixen en cercle. Els mapes de dins (`DINS`) no en porten a
     posta: declarar coordenades a mà faria que obrir un node fos una feina de
     dibuixant, i el que ha de ser fàcil és obrir-ne un més. Amb `x` i `y`
     declarats —el celler i la xarxa— surt exactament el mateix que abans. */
  const calen = mapa.nodes.some(n => n.x == null || n.y == null);
  const M = !calen ? mapa : Object.assign({}, mapa, {
    nodes: mapa.nodes.map((n, i, a) => {
      const ang = -Math.PI / 2 + i * 2 * Math.PI / a.length;
      return Object.assign({}, n, {
        x: Math.round(320 + Math.cos(ang) * 196),
        y: Math.round(215 + Math.sin(ang) * 138) });
    })
  });
  const fl = M.parells.flatMap(x => [
    { de: x[0], a: x[1], mena: x[2], q: x[3], qEs: x[6] || x[3], seq: x[8] || null },
    { de: x[1], a: x[0], mena: x[4], q: x[5], qEs: x[7] || x[5], seq: x[9] || null }
  ]);
  const node = i => M.nodes.find(n => n.id === i);
  const enc = M.encallament ? M.encallament.node : null;
  const toca = f => enc && (f.de === enc || f.a === enc);
  /* Qui perd la meitat del que rep quan el node encallat s'atura. Només té
     sentit si el mapa en declara un; un mapa sense encallament no marca res. */
  const perd = !enc ? [] : M.nodes.filter(n => n.id !== enc).map(n => {
    const rep = fl.filter(f => f.a === n.id);
    const p = rep.filter(toca).length;
    return { id: n.id, pct: rep.length ? p / rep.length : 0 };
  });
  const COL = Object.assign({}, M.colors);
  return svgDe(M, id, fl, node, enc, toca, perd, COL, clau, dins);
}

/* ══ L'ORDRE EN QUÈ PASSEN LES COSES ═════════════════════════════════════════
   La posició de cada lliurament dins de la seqüència del mapa, com a índex
   global: primer procés declarat primer, i dins de cada un pel número del pas.
   El que no té pas —`sempre`— va al final, perquè no en té.

   Serveix dues coses alhora, i és la raó de calcular-ho un sol cop:

   · **El retard del pols.** Era `i * 0,17 s`, l'ordre en què algú va escriure
     els parells: el dibuix feia circular el valor en un ordre que no volia dir
     res. Ara el pols recorre els processos, que és la passa 4 del mètode feta
     amb el dibuix i no explicada al costat.
   · **El recorregut de la pàgina**, que encén una fletxa per pas.

   Un mapa sense `processos` cau a l'ordre de declaració, que és el que tenien
   tots fins avui: afegir la seqüència no canvia cap mapa que no la declari. */
function ordreSeq(mapa, flux) {
  const pr = (mapa.processos || []).map(p => p.id);
  if (!pr.length) return flux.map((f, i) => i);
  const clau = f => {
    if (!f.seq || f.seq === 'sempre') return 1e7;
    const p = pr.indexOf(f.seq[0]);
    return (p < 0 ? 1e6 : p) * 1000 + f.seq[1];
  };
  const pos = [];
  flux.map((f, i) => i)
    .sort((a, b) => clau(flux[a]) - clau(flux[b]) || a - b)
    .forEach((i, r) => { pos[i] = r; });
  return pos;
}

/* `clau` només la passa la portada: és l'única pàgina amb els dos
   diccionaris. A `vna.html` el mateix dibuix s'escriu sense claus i només
   amb el text català, que és el correcte mentre aquella pàgina sigui
   monolingüe — i evita que hi surtin les dues etiquetes una sobre l'altra. */
const svgCeller = (id, clau) => svgMapa(CELLER, id, clau);

/* `clau` és el prefix de les claus de diccionari del dibuix. Hi va perquè
   **el text del mapa és text**: els noms dels nodes es llegeixen a sobre del
   dibuix i les setze frases de les fletxes es llegeixen passant el ratolí, i
   totes es quedaven en català amb el castellà posat. Sense prefix no s'hi
   escriu cap clau, que és el que han de fer els dibuixos d'una pàgina sense
   diccionari. */
function svgDe(mapa, id, flux, nodeDe, encN, tocaEnc, PERDUA, COL, clau, dins) {
  const i18 = k => clau ? ` data-i18n="${clau}.${k}"` : '';
  const ORDRE = ordreSeq(mapa, flux);
  /* El radi va de 46 a 50 amb la lletra: a 14 unitats, «distribuïdor» —dotze
     lletres i una sola paraula, que no es pot partir— feia just els 92 px del
     cercle i tocava la vora. Les posicions declarades hi caben: el node més
     amunt és a y=58 i el més avall a y=372, dins d'un dibuix de 430. */
  const R = 50, W = 640, H = 430;
  const p = [];
  p.push(`<svg id="${id}" class="mv-svg viu" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${id}T ${id}D">`);
  p.push(`<title id="${id}T"${i18('tit')}>${esc(mapa.titolSvg)}</title>`);
  p.push(`<desc id="${id}D"${i18('desc')}>${esc(mapa.descSvg)}</desc>`);
  /* Les puntes de fletxa porten l'identificador del dibuix. Eren `mvT` i `mvI`
     fixes, i amb dos mapes a la mateixa pàgina ja hi havia dos elements amb el
     mateix `id` —invàlid, i funcionava de casualitat perquè els dos marcadors
     són idèntics. Amb tres dibuixos a `/vna` deixa de ser una casualitat que
     convingui mantenir. */
  const mT = `${id}-T`, mI = `${id}-I`;
  p.push('<defs>' +
    `<marker id="${mT}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="var(--blue)"/></marker>` +
    `<marker id="${mI}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="var(--purple)"/></marker>` +
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
    /* `data-mena` i `data-seq` són el que fa que la pàgina pugui **llegir** el
       dibuix: encendre només els «must», només els «extra», o recórrer un
       procés pas per pas. Sense atributs, cada lectura hauria de tornar a
       deduir de l'estil quina fletxa és quina — i el dia que el color canviés,
       les lectures deixarien de funcionar sense petar. */
    const atr = ` data-mena="${tang ? 't' : 'i'}"`
      + (f.seq ? ` data-seq="${f.seq === 'sempre' ? 'sempre' : f.seq[0] + ':' + f.seq[1]}"` : '');
    p.push(`<path class="mv-f" d="${cam}" fill="none" ` +
      /* L'opacitat era .5 i .42, que sobre la pell fosca d'abans encara es veia.
         Sobre paper feia 2,4:1 i 2,2:1, i una fletxa és un objecte gràfic: en
         necessita 3. Amb l'accent més fluix de la paleta el llindar és .66, i
         per sota d'això la fletxa hi és i no es veu. */
      `stroke="${tang ? 'var(--blue)' : 'var(--purple)'}" stroke-width="${tang ? 2 : 1.6}" opacity="${tang ? .72 : .7}"` +
      `${tang ? '' : ' stroke-dasharray="6 7"'}${para}${atr} marker-end="url(#${tang ? mT : mI})">` +
      `<title${i18('f' + i)}>${esc(nodeDe(f.de).nom)} → ${esc(nodeDe(f.a).nom)}: ${esc(f.q)} (${f.mena})</title></path>`);
    // El retard reparteix els polsos, i l'ordre és el de la seqüència (`ordreSeq`).
    camins.push(`<path class="mv-p${tang ? '' : ' i'}" d="${cam}" pathLength="100"${para}${atr}` +
      ` style="animation-delay:${(ORDRE[i] * .17).toFixed(2)}s"/>`);
  });
  p.push('<g class="mv-pols" aria-hidden="true">' + camins.join('') + '</g>');
  mapa.nodes.forEach(n => {
    const col = COL[n.cami] || 'var(--indigo)';
    const perd = PERDUA.find(x => x.id === n.id);
    const marca = n.id === encN ? ' data-para="1"'
      : (perd && perd.pct >= .5 ? ' data-sec="1"' : '');
    /* ── EL NODE QUE S'OBRE ──────────────────────────────────────────────
       Un node amb un mapa a dins és un botó, i per tant ha de ser un botó:
       `tabindex` i `role`, o és un clic que només existeix per a qui té
       ratolí —i això no peta mai. És la mateixa regla que `check-vna.js` ja
       exigeix al zoom de l'app.
       I **diu què hi trobaràs abans d'entrar-hi**: el nombre de rols de dins,
       escrit sota el cercle. Entrar en un lloc sense saber què hi ha és el que
       fa que la gent deixi de clicar. */
    const sub = dins && dins[n.id];
    const obre = sub
      ? ` data-dins="${n.id}" tabindex="0" role="button"`
        + ` aria-label="${esc(n.nom)} — obre el mapa de dins, ${sub.nodes.length} rols"`
      : '';
    /* `data-cami` i no el color del traç. La pàgina triava els rols d'un camí
       **comparant `stroke` amb un hex escrit al JavaScript**, i el dia que la
       paleta va canviar la comparació no va trobar res: el botó «només el camí
       del canal» deixava de fer res i no petava res. El camí és una dada del
       mapa i ha de viatjar com a dada, igual que `data-mena` i `data-seq`. */
    const cami = n.cami ? ` data-cami="${esc(n.cami)}"` : '';
    p.push(`<g class="mv-n${sub ? ' mv-obre' : ''}" data-id="${n.id}"${cami}${marca}${obre}>`);
    /* El farciment i el color del text **els posa el CSS de cada pàgina**, i no
       van escrits aquí. Eren `fill="#141420"` i `fill="#f5f5f7"`: el mateix
       dibuix va a la portada, que és fosca, i a `/vna`, que des d'avui és
       clara — amb els colors a dins del dibuix, una de les dues pàgines
       l'hauria ensenyat invertit. El traç sí que hi va: és de cada node. */
    p.push(`<circle class="mv-nc" cx="${n.x}" cy="${n.y}" r="${R}" stroke="${col}" stroke-width="1.6"/>`);
    if (sub) p.push(`<circle class="mv-anell" cx="${n.x}" cy="${n.y}" r="${R + 5}" fill="none" stroke="${col}"/>`
      + `<text class="mv-dinsn" x="${n.x}" y="${n.y + R + 15}" text-anchor="middle"`
      + `${i18('dins.' + n.id)}>+${sub.nodes.length} rols</text>`);
    /* El nom es parteix en dues línies quan no hi cap: un node amb el text
       sortint del cercle es llegeix com un error de dibuix.

       I s'escriu **un cop per llengua**, no un cop i traduït al vol: el salt de
       línia es calcula aquí, i «Institucions i administració» i «Instituciones
       y administración» no es parteixen pel mateix lloc. Amb una sola etiqueta
       i el text canviat pel diccionari, la versió castellana sortiria del
       cercle. Les ensenya el CSS segons l'atribut `lang` de la pàgina; en una
       pàgina sense diccionari només s'hi escriu la catalana. */
    /* ── LA MIDA DE LA LLETRA, QUE ERA EL PROBLEMA ──────────────────────
       Era **10,5 unitats**, i amb el dibuix de 640 d'ample renderitzat a
       700 px això són 11,5 px de debò: el text més petit de tot el lloc,
       justament dins de la peça que s'ha de poder llegir a una sala.

       Ara són **14**, que amb els 700 px mínims que `/vna` dona al llenç
       surten a 15,3. El llindar del salt de línia baixa de 13 a 11 caràcters,
       el pas entre línies puja de 12,5 a 16 i el radi del cercle, de 46 a 50.
       Les quatre xifres van juntes: canviar-ne una sense les altres treu el
       text del cercle, i això es veu mirant el dibuix i no executant res. */
    const parteix = nom => {
      const mots = nom.split(' ');
      const linies = [];
      let l = '';
      mots.forEach(m => { if ((l + ' ' + m).trim().length > 11) { linies.push(l.trim()); l = m; } else l += ' ' + m; });
      if (l.trim()) linies.push(l.trim());
      return linies;
    };
    const escriu = (nom, cls) => {
      const linies = parteix(nom);
      const y0 = n.y - (linies.length - 1) * 8;
      return linies.map((t, k) => `<text class="${cls}" x="${n.x}" y="${(y0 + k * 16).toFixed(1)}" `
        + `text-anchor="middle" dominant-baseline="middle" font-size="14">${esc(t)}</text>`).join('');
    };
    p.push(escriu(n.nom, 'mv-ca'));
    if (clau && n.nomEs && n.nomEs !== n.nom) p.push(escriu(n.nomEs, 'mv-es'));
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
  const perdutsEs = SENSE_REG.map(x => `${esc(x.n.nomEs || x.n.nom)} (${x.perd} de ${x.total})`).join(' y ');
  /* El bloc diu **a quin dibuix mana** amb `data-svg`, i el JavaScript de cada
     pàgina recorre els blocs que hi hagi. Amb els identificadors escrits a mà,
     el dia que la segona pàgina va rebre els polsos els botons van quedar
     apuntant al dibuix de la primera —i la pàgina es va publicar amb setze
     camins invisibles que no feien res. */
  /* Les dues llengües van **als atributs** i no al diccionari: el text d'aquests
     botons i d'aquest paràgraf canvia en prémer-los, i una clau de diccionari
     el tornaria a l'estat de repòs cada cop que algú canviés de llengua amb el
     pols aturat. El JavaScript de la pàgina tria l'atribut segons `lang`. */
  const SA = 'Un mapa dibuixat és una radiografia: diu què hi ha. Amb el pols posat es veu l\'altra cosa '
    + '—<b>si allò circula</b>—, que és el que de debò decideix si una casa va bé.';
  const SA_ES = 'Un mapa dibujado es una radiografía: dice qué hay. Con el pulso puesto se ve la otra cosa '
    + '—<b>si aquello circula</b>—, que es lo que de verdad decide si una casa va bien.';
  const ENC_CA = `${esc(ENC.per)} Amb aquest node aturat es paren <b>${FLUX_PARAT} dels ${cTot.n} lliuraments</b>, `
    + `i ${perduts} perden la meitat del que els arriba. ${esc(ENC.diu)}`;
  const ENC_ES = `${esc(ENC.perEs || ENC.per)} Con este nodo parado se paran <b>${FLUX_PARAT} de las ${cTot.n} entregas</b>, `
    + `y ${perdutsEs} pierden la mitad de lo que les llega. ${esc(ENC.diuEs || ENC.diu)}`;
  return [`<div class="mv-pols-ui" data-svg="${mana}">`,
    '<div class="mv-pu-b">',
    `<button type="button" class="mv-b mv-pausa" aria-pressed="false" aria-controls="${svgId}"`
    + ' data-ca="⏸ Atura el pols" data-ca-on="▶ Torna-li el pols"'
    + ' data-es="⏸ Para el pulso" data-es-on="▶ Devuélvele el pulso">⏸ Atura el pols</button>',
    `<button type="button" class="mv-b mv-enc" aria-pressed="false" aria-controls="${svgId}"`
    + ` data-ca="🩺 I si «${esc(n.nom)}» s'encalla?"`
    + ` data-es="🩺 ¿Y si «${esc(n.nomEs || n.nom)}» se atasca?">🩺 I si «${esc(n.nom)}» s'encalla?</button>`,
    '</div>',
    `<p class="mv-pu-t" data-sa="${SA}" data-sa-es="${SA_ES}" `
    + `data-enc="${ENC_CA}" data-enc-es="${ENC_ES}">${SA}</p>`,
    '</div>'].join('');
}

/* ══ ELS BLOCS ═══════════════════════════════════════════════════════════════ */

// Portada · la versió curta: el dibuix, què s'hi veu i on és el marge.
/* Totes les claus als dos diccionaris des del primer dia. Aquest bloc no en
   portava **cap**: el títol, el lead, les dues caselles de comparació, la tesi
   del marge, les tres files de qui fa cada lliurament, l'avís i els dos botons
   es llegien en català amb el castellà posat, i les guardes donaven verd
   perquè les claus que hi havia —zero— quadraven perfectament.

   Les xifres no són al diccionari: les compta el graf i s'escriuen a part del
   text, perquè una xifra dins d'una frase traduïda és una xifra que es pot
   quedar vella en una llengua i no en l'altra. */
function blocPortada() {
  const i18 = k => ` data-i18n="mv.${k}"`;
  const i18h = k => ` data-i18n-html="mv.${k}"`;
  const f = [];
  f.push('<div class="mv-grid fade-up">');
  f.push('  <div class="mv-viz">');
  f.push('    ' + svgCeller('mvCeller', 'mc'));
  f.push('    <div class="mv-leg">' +
    `<span class="mv-lt"${i18('lt')}>— tangible</span>` +
    `<span class="mv-li"${i18('li')}>- - intangible</span>` +
    `<span class="mv-lc"><b>${cTot.n}</b> <span${i18('lc1')}>lliuraments</span> · <b>${cTot.i}</b> <span${i18('lc2')}>intangibles</span></span>` +
    '</div>');
  f.push('    ' + blocPols('mvCeller', 'plCeller'));
  f.push('  </div>');
  f.push('  <div class="mv-txt">');
  f.push(`    <h3${i18('titol')}>${esc(CELLER.titol)}</h3>`);
  f.push(`    <p class="mv-lead"${i18('una')}>${esc(CELLER.una)}</p>`);
  f.push('    <div class="mv-cmp">');
  f.push(`      <div class="mv-c canal"><div class="mv-ck"${i18('canal.k')}>Pel distribuïdor</div>`
    + `<div class="mv-cv">${cCanal.i} <span${i18('de')}>de</span> ${cCanal.n}</div>`
    + `<div class="mv-cd"${i18('canal.d')}>lliuraments intangibles. Tot el que no es pot facturar, per aquí se'n va de franc.</div></div>`);
  f.push(`      <div class="mv-c visita"><div class="mv-ck"${i18('visita.k')}>Pel visitant i l'operador</div>`
    + `<div class="mv-cv">${cVisita.i} <span${i18('de')}>de</span> ${cVisita.n}</div>`
    + `<div class="mv-cd"${i18('visita.d')}>lliuraments intangibles. Aquí no són un extra: són el producte que es paga.</div></div>`);
  f.push('    </div>');
  f.push(`    <p class="mv-tesi"${i18h('tesi')}><b>El marge no surt d'apujar el preu de l'ampolla.</b> Surt de <b>cobrar els intangibles que la casa ja produeix</b> —el relat, el lloc, la família, el vessant— i que avui se'n van amb el camió. El mapa no els inventa: ensenya que hi són i que no es cobren.</p>`);
  /* I el que el mapa habilita després: saber què pot preparar una màquina.
     Va aquí i no en una secció a part perquè és la conseqüència del mapa, no
     un servei diferent — i perquè el número el dona el graf, no nosaltres. */
  f.push('    <div class="mv-qui">');
  f.push(`      <div class="mv-qk"${i18('qui.k')}>I després, qui fa cada lliurament</div>`);
  f.push(`      <div class="mv-qr"><b class="mq">${cQui.maquina}</b><span${i18('qui.maquina')}>${QUI_TXT.maquina.ca}</span></div>`);
  f.push(`      <div class="mv-qr"><b class="ms">${cQui.sense}</b><span${i18('qui.sense')}>són tangibles però encara no sabem quin entregable produeixen</span></div>`);
  f.push(`      <div class="mv-qr"><b class="mp">${cQui.persona}</b><span${i18h('qui.persona')}>${QUI_TXT.persona.ca}</span></div>`);
  f.push('    </div>');
  f.push(`    <p class="mv-avis"${i18h('avis')}>${CELLER.avis}</p>`);
  f.push(`    <div class="mv-ctas"><a class="mv-cta pri" href="/SOS/vna.html"${i18('cta1')}>Com es fa un mapa, pas a pas →</a>`
    /* Porta **al paquet** i no al catàleg filtrat per un sector. Duia
       `data-sec="privat"`, que era arbitrari: el mapa de valor es declara per
       als tres sectors, i filtrar-ne un amagava el paquet a qui venia dels
       altres dos. El que vol qui prem «el paquet i el preu» és aquell paquet. */
    /* L'adreça és absoluta perquè aquest bloc va a dues pàgines —la portada i
       `/vna`— i el paquet viu a una tercera, `cataleg.html`. Una àncora
       relativa buscaria la secció a la pàgina on cau i no la trobaria enlloc:
       el navegador es queda on és i qui hi clica es pensa que no li respon. */
    + `<a class="mv-cta" href="/cataleg#pk-fent-pinya-vna"${i18('cta2')}>El paquet i el preu →</a></div>`);
  f.push('  </div>');
  f.push('</div>');
  return f.join('\n');
}

/* El diccionari del mapa del celler: el que declara `CELLER` amb el seu germà
   castellà, i el que viu escrit dins d'aquest bloc. Les setze frases de les
   fletxes i els dos texts del dibuix hi van també, perquè el dibuix és text. */
function dicMapa(l) {
  const q = x => String(x).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const tria = (o, c) => l === 'es' ? (o[c + 'Es'] || o[c]) : o[c];
  const f = [];
  const FIX = {
    'mv.lt': { ca: '— tangible', es: '— tangible' },
    'mv.li': { ca: '- - intangible', es: '- - intangible' },
    'mv.lc1': { ca: 'lliuraments', es: 'entregas' },
    'mv.lc2': { ca: 'intangibles', es: 'intangibles' },
    'mv.de': { ca: 'de', es: 'de' },
    'mv.canal.k': { ca: 'Pel distribuïdor', es: 'Por el distribuidor' },
    'mv.canal.d': {
      ca: 'lliuraments intangibles. Tot el que no es pot facturar, per aquí se\'n va de franc.',
      es: 'entregas intangibles. Todo lo que no se puede facturar, por aquí se va gratis.'
    },
    'mv.visita.k': { ca: 'Pel visitant i l\'operador', es: 'Por el visitante y el operador' },
    'mv.visita.d': {
      ca: 'lliuraments intangibles. Aquí no són un extra: són el producte que es paga.',
      es: 'entregas intangibles. Aquí no son un extra: son el producto que se paga.'
    },
    'mv.tesi': {
      ca: '<b>El marge no surt d\'apujar el preu de l\'ampolla.</b> Surt de <b>cobrar els intangibles que la casa ja produeix</b> —el relat, el lloc, la família, el vessant— i que avui se\'n van amb el camió. El mapa no els inventa: ensenya que hi són i que no es cobren.',
      es: '<b>El margen no sale de subir el precio de la botella.</b> Sale de <b>cobrar los intangibles que la casa ya produce</b> —el relato, el lugar, la familia, la ladera— y que hoy se van con el camión. El mapa no los inventa: enseña que están y que no se cobran.'
    },
    'mv.qui.k': { ca: 'I després, qui fa cada lliurament', es: 'Y después, quién hace cada entrega' },
    'mv.qui.maquina': QUI_TXT.maquina,
    'mv.qui.sense': {
      ca: 'són tangibles però encara no sabem quin entregable produeixen',
      es: 'son tangibles pero todavía no sabemos qué entregable producen'
    },
    'mv.qui.persona': QUI_TXT.persona,
    'mv.cta1': { ca: 'Com es fa un mapa, pas a pas →', es: 'Cómo se hace un mapa, paso a paso →' },
    'mv.cta2': { ca: 'El paquet i el preu →', es: 'El paquete y el precio →' }
  };
  Object.entries(FIX).forEach(([k, v]) => f.push(`  '${k}':'${q(v[l])}',`));
  f.push(`  'mv.titol':'${q(tria(CELLER, 'titol'))}',`);
  f.push(`  'mv.una':'${q(tria(CELLER, 'una'))}',`);
  f.push(`  'mv.avis':'${q(tria(CELLER, 'avis'))}',`);
  /* I el dibuix. El títol i la descripció els llegeix qui no el veu; les setze
     frases, qui hi passa el ratolí per sobre. */
  f.push(`  'mc.tit':'${q(tria(CELLER, 'titolSvg'))}',`);
  f.push(`  'mc.desc':'${q(tria(CELLER, 'descSvg'))}',`);
  f.push(clausFletxes(CELLER, 'mc', l, q));
  return f.join('\n');
}

/* Les claus de les fletxes d'un mapa. El text és «qui → qui: què (mena)», i els
   dos noms també es tradueixen: una fletxa que digués «Quién recibe y explica →
   El poble» seria mitja frase en cada llengua. */
function clausFletxes(mapa, clau, l, q) {
  const nom = id => {
    const n = mapa.nodes.find(x => x.id === id);
    return l === 'es' ? (n.nomEs || n.nom) : n.nom;
  };
  const MENA = { tangible: { ca: 'tangible', es: 'tangible' }, intangible: { ca: 'intangible', es: 'intangible' } };
  const fl = mapa.parells.flatMap(x => [
    { de: x[0], a: x[1], mena: x[2], q: l === 'es' ? (x[6] || x[3]) : x[3] },
    { de: x[1], a: x[0], mena: x[4], q: l === 'es' ? (x[7] || x[5]) : x[5] }
  ]);
  return fl.map((f, i) =>
    `  '${clau}.f${i}':'${q(nom(f.de) + ' → ' + nom(f.a) + ': ' + f.q + ' (' + MENA[f.mena][l] + ')')}',`).join('\n');
}

/* ══ LES FRASES DE LA PÀGINA · les dues llengües ═════════════════════════════
   Tot el que `vna.html` diu i no surt de `CELLER`, `NOTACIO`, `PROCES`,
   `FASES`, `SESSIO` ni `PREGUNTES`. Viuen aquí i no dins de les funcions
   perquè fins avui hi vivien a dins, i per això la pàgina sencera es quedava
   en català: tenia **dos** `data-i18n` —els del menú generat— i cap
   commutador. No petava res perquè `check-i18n.js` només mira l'app. */
const VN = {
  /* ── El cap de la pàgina ───────────────────────────────────────────────── */
  'vn.eyebrow': { ca: 'Anàlisi de xarxes de valor · Verna Allee', es: 'Análisis de redes de valor · Verna Allee' },
  'vn.h1': {
    ca: 'Qui dona què a qui, <em>i en quin ordre</em>',
    es: 'Quién da qué a quién, <em>y en qué orden</em>'
  },
  'vn.sub': {
    ca: 'Un mapa de valor dibuixa <b>els rols d\'una casa i tot el que es lliuren</b> — també els favors, el relat i la confiança, que no surten a cap factura i sense els quals no funciona res. Aquí hi ha <b>un sol dibuix i vuit maneres de llegir-lo</b>, sobre un cas treballat. Dos dels rols s\'obren: a dins tenen el seu propi mapa.',
    es: 'Un mapa de valor dibuja <b>los roles de una casa y todo lo que se entregan</b> — también los favores, el relato y la confianza, que no salen en ninguna factura y sin los cuales no funciona nada. Aquí hay <b>un solo dibujo y ocho maneras de leerlo</b>, sobre un caso trabajado. Dos de los roles se abren: dentro tienen su propio mapa.'
  },
  'vn.v1': { ca: 'Vista mapa de valor', es: 'Vista mapa de valor' },
  'vn.v2': { ca: 'Vista castell', es: 'Vista castell' },
  'vn.rl.h2': { ca: 'I els noms dels rols, per si et sonen', es: 'Y los nombres de los roles, por si te suenan' },
  'vn.rl.sub': {
    ca: 'Les posicions d\'un castell, amb <b>què són a una organització</b> i exemples que es reconeixen sense saber res de castells. És el vocabulari que fa que un dilluns algú pugui dir «aquesta persona és el nostre vent» i tothom entengui què vol dir.',
    es: 'Las posiciones de un castell, con <b>qué son en una organización</b> y ejemplos que se reconocen sin saber nada de castells. Es el vocabulario que hace que un lunes alguien pueda decir «esta persona es nuestro vent» y todo el mundo entienda qué quiere decir.'
  },
  'vn.co.h2': { ca: 'D\'on surt tot això: una colla castellera', es: 'De dónde sale todo esto: una colla castellera' },
  'vn.co.sub': {
    ca: 'El graf d\'un poble s\'explica malament amb un diagrama i es explica bé amb <b>una colla</b>, perquè és exactament el mateix graf: uns rols, unes coses que es veuen i unes altres que no es veuen i sense les quals cau. Nou passos, i l\'últim és per posar-t\'hi tu.',
    es: 'El grafo de un pueblo se explica mal con un diagrama y se explica bien con <b>una colla</b>, porque es exactamente el mismo grafo: unos roles, unas cosas que se ven y otras que no se ven y sin las cuales cae. Nueve pasos, y el último es para ponerte tú.'
  },
  'vn.co.ca': { ca: 'Aquesta part encara és només en català.', es: 'Esta parte todavía está solo en catalán.' },
  'vn.peu1': {
    ca: '<strong>D\'on surt el mètode.</strong> És l\'anàlisi de xarxes de valor de <strong>Verna Allee</strong>: en comptes de dibuixar qui mana sobre qui, es dibuixa <strong>qui lliura què a qui</strong>, i es compta tant el que es factura com el que no. La pràctica en castellà i les «quatre passes grans» surten de l\'article d\'<strong>Antonio Blanco-Gracia i Ingrid Astiz</strong> a Pantheon.work (30/11/2018), i els cors del pols i les vuit preguntes, del guió d\'una sessió real amb un equip de direcció.',
    es: '<strong>De dónde sale el método.</strong> Es el análisis de redes de valor de <strong>Verna Allee</strong>: en vez de dibujar quién manda sobre quién, se dibuja <strong>quién entrega qué a quién</strong>, y se cuenta tanto lo que se factura como lo que no. La práctica en castellano y los «cuatro pasos grandes» salen del artículo de <strong>Antonio Blanco-Gracia e Ingrid Astiz</strong> en Pantheon.work (30/11/2018), y los corazones del pulso y las ocho preguntas, del guion de una sesión real con un equipo de dirección.'
  },
  'vn.peu2': {
    ca: 'El cas del celler és <strong>un exemple treballat, no el d\'un celler concret</strong>, i no porta cap xifra d\'euros: el marge el calcula la casa amb els seus números. El que el mapa aporta no és una previsió — és on mirar.',
    es: 'El caso de la bodega es <strong>un ejemplo trabajado, no el de una bodega concreta</strong>, y no lleva ninguna cifra de euros: el margen lo calcula la casa con sus números. Lo que el mapa aporta no es una previsión — es dónde mirar.'
  },
  'vn.cta1': { ca: 'Demana el mapa de la teva casa →', es: 'Pide el mapa de tu casa →' },
  'vn.cta2': { ca: 'Fes el diagnòstic · 3 min', es: 'Haz el diagnóstico · 3 min' },
  'vn.cta3': { ca: 'Obre el SOS', es: 'Abre el SOS' },
  'vn.cta4': { ca: 'La formació, de N0 a N3', es: 'La formación, de N0 a N3' },
  'vn.peu3': {
    ca: '<strong>I si el que busques és el curs:</strong> la ruta d\'aprenentatge viu a <a href="formacio.html">la formació</a>, amb setze mòduls de N0 a N3. Aquesta pàgina és el mètode i el cas; allà és on s\'aprèn a facilitar-lo.',
    es: '<strong>Y si lo que buscas es el curso:</strong> la ruta de aprendizaje vive en <a href="formacio.html">la formación</a>, con dieciséis módulos de N0 a N3. Esta página es el método y el caso; allí es donde se aprende a facilitarlo.'
  },
  'vn.not.h2': { ca: 'Com es llegeix un mapa', es: 'Cómo se lee un mapa' },
  'vn.not.sub': {
    ca: 'Quatre paraules. Un mapa de valor amb quinze símbols no el llegeix ningú a una sala, i a la sala és on s\'ha de llegir.',
    es: 'Cuatro palabras. Un mapa de valor con quince símbolos no lo lee nadie en una sala, y en la sala es donde hay que leerlo.'
  },
  'vn.pas.h2': { ca: 'Com es fa', es: 'Cómo se hace' },
  'vn.pas.sub': {
    ca: 'Els tres del mig marcats són <b>les tres anàlisis de Verna Allee</b>, que són el mètode i no una manera nostra de mirar-ho.',
    es: 'Los tres del medio marcados son <b>los tres análisis de Verna Allee</b>, que son el método y no una manera nuestra de mirarlo.'
  },
  'vn.pas.en': { ca: 'passos en', es: 'pasos en' },
  'vn.ent.h2': { ca: 'Què s\'endú la casa', es: 'Qué se lleva la casa' },
  'vn.ent.nota': {
    ca: 'El mapa no és l\'entregable: el mapa és l\'eina. L\'entregable és <b>el que se\'n decideix</b>. Un mapa preciós del qual no surt cap moviment és una feina ben feta que no ha servit de res.',
    es: 'El mapa no es el entregable: el mapa es la herramienta. El entregable es <b>lo que se decide</b>. Un mapa precioso del que no sale ningún movimiento es un trabajo bien hecho que no ha servido de nada.'
  },
  'vn.ses.h2': { ca: 'I com és, a la sala', es: 'Y cómo es, en la sala' },
  'vn.ses.sub': {
    ca: 'No es fa amb un programa: es fa amb <b>un full gran, post-its i gomets</b>, i el programa ve després per mantenir-ho viu. Això és com queda el full — i tot el que hi surt té un motiu que es pot explicar en una frase.',
    es: 'No se hace con un programa: se hace con <b>una hoja grande, post-its y gomets</b>, y el programa viene después para mantenerlo vivo. Así queda la hoja — y todo lo que sale en ella tiene un motivo que se puede explicar en una frase.'
  },
  'vn.ses.nota': {
    ca: '<b>Els entregables es diuen amb noms, no amb verbs.</b> «La comanda», no «comandar»; «avisar abans que falli» és una cosa que arriba o no arriba. El criteri és aquest: un entregable es diu entregable perquè <b>es pot comprovar si ha arribat</b>.',
    es: '<b>Los entregables se dicen con nombres, no con verbos.</b> «El pedido», no «pedir»; «avisar antes de que falle» es una cosa que llega o no llega. El criterio es este: un entregable se llama entregable porque <b>se puede comprobar si ha llegado</b>.'
  },
  'vn.fa.h2': { ca: 'Les quatre passes grans', es: 'Los cuatro pasos grandes' },
  'vn.fa.sub': {
    ca: '10 passos són per executar; <b>quatre són per recordar</b>. Aquesta és l\'agrupació del guió de sessió, i és la que es fa servir a la sala.',
    es: '10 pasos son para ejecutar; <b>cuatro son para recordar</b>. Esta es la agrupación del guion de sesión, y es la que se usa en la sala.'
  },
  /* ── El llenç ──────────────────────────────────────────────────────────── */
  'vn.lt': { ca: '— tangible', es: '— tangible' },
  'vn.li': { ca: '- - intangible', es: '- - intangible' },
  'vn.lc.nodes': { ca: 'rols', es: 'roles' },
  'vn.lc.trans': { ca: 'transaccions', es: 'transacciones' },
  'vn.lc.intang': { ca: 'intangibles', es: 'intangibles' },
  'vn.molla': { ca: 'On ets dins del mapa', es: 'Dónde estás dentro del mapa' },
  'vn.tornar': { ca: '← Torna al mapa sencer', es: '← Vuelve al mapa entero' },
  'vn.foc.lb': { ca: 'On miro', es: 'Dónde miro' },
  'vn.foc.tot': { ca: 'Veure-ho tot', es: 'Verlo todo' },
  'vn.foc.canal': { ca: 'Només el camí del canal', es: 'Solo el camino del canal' },
  'vn.foc.visitant': { ca: 'Només el camí del visitant', es: 'Solo el camino del visitante' },
  'vn.foc.ajuda': {
    /* I que el dibuix es desplaça. A telèfon el graf demana 700 px per tenir
       la lletra a 15 i la pantalla en té 390: s'arrossega de costat, i si no
       es diu, qui hi arriba creu que el mapa acaba on acaba la pantalla. */
    ca: 'Toca un rol del dibuix per mirar-te només el seu tros. Els que tenen anell s\'obren: a dins hi ha el seu mapa. Si no hi cap, arrossega el dibuix de costat.',
    es: 'Toca un rol del dibujo para mirarte solo su trozo. Los que tienen anillo se abren: dentro está su mapa. Si no cabe, arrastra el dibujo de lado.'
  },
  /* ── Les lectures ──────────────────────────────────────────────────────── */
  'vn.lec.k': { ca: 'Les lectures del mateix dibuix', es: 'Las lecturas del mismo dibujo' },
  'vn.lec.h2': { ca: 'Un sol dibuix, i vuit coses que hi pots mirar', es: 'Un solo dibujo, y ocho cosas que puedes mirar en él' },
  'vn.lec.sub': {
    ca: 'No són vuit dibuixos: és el mateix, llegit vuit vegades. Això és el que passa a la sala quan el full ja està ple — i és la part de la feina que no es veu en cap captura de pantalla.',
    es: 'No son ocho dibujos: es el mismo, leído ocho veces. Esto es lo que pasa en la sala cuando la hoja ya está llena — y es la parte del trabajo que no se ve en ninguna captura de pantalla.'
  },
  'vn.l.rols.t': { ca: 'Els rols', es: 'Los roles' },
  'vn.l.rols.d': {
    ca: 'Set rols, no set persones i no set departaments. Un d\'ells no existeix com a rol en cap organigrama d\'aquesta casa, i és el que sosté la meitat del mapa.',
    es: 'Siete roles, no siete personas y no siete departamentos. Uno de ellos no existe como rol en ningún organigrama de esta casa, y es el que sostiene la mitad del mapa.'
  },
  'vn.l.must.t': { ca: 'Els «must»', es: 'Los «must»' },
  'vn.l.must.d': {
    ca: 'El que és exigible entre rols: una comanda, un lliurament, una factura. És la part fàcil, la que tothom ja sap, i encara no explica per què la casa funciona.',
    es: 'Lo que es exigible entre roles: un pedido, una entrega, una factura. Es la parte fácil, la que todo el mundo ya sabe, y todavía no explica por qué la casa funciona.'
  },
  'vn.l.extra.t': { ca: 'Els «extra»', es: 'Los «extra»' },
  'vn.l.extra.d': {
    ca: 'El que es dona per mantenir la relació i <b>que ningú pot reclamar</b>: el relat, la confiança, l\'accés, el favor tornat. Aquí és on apareix la meitat del mapa que ningú havia vist mai junta.',
    es: 'Lo que se da para mantener la relación y <b>que nadie puede reclamar</b>: el relato, la confianza, el acceso, el favor devuelto. Aquí es donde aparece la mitad del mapa que nadie había visto nunca junta.'
  },
  'vn.l.seq.t': { ca: 'La seqüència', es: 'La secuencia' },
  'vn.l.seq.d': {
    ca: 'En quin ordre passen les coses. <b>No per reduir-ho a un procés lineal</b> —per això n\'hi ha tres i no un—, sinó per comprovar que el mapa és complet i fer aflorar els camins principals.',
    es: 'En qué orden pasan las cosas. <b>No para reducirlo a un proceso lineal</b> —por eso hay tres y no uno—, sino para comprobar que el mapa está completo y hacer aflorar los caminos principales.'
  },
  'vn.l.seq.cita': {
    ca: '«A l\'enginyeria de processos l\'objectiu és identificar un únic procés òptim i eliminar la variació. Amb l\'anàlisi de la xarxa de valor l\'objectiu és optimitzar múltiples vies i aconseguir un resultat consistent <b>permetent alhora les variacions necessàries</b> per a la innovació, la resiliència i l\'agilitat de la xarxa.»',
    es: '«En la ingeniería de procesos el objetivo es identificar un único proceso óptimo y eliminar la variación. Con el análisis de la red de valor el objetivo es optimizar múltiples vías y conseguir un resultado consistente <b>permitiendo a la vez las variaciones necesarias</b> para la innovación, la resiliencia y la agilidad de la red.»'
  },
  'vn.l.seq.sempre': { ca: 'I el que no entra a cap ordre', es: 'Y lo que no entra en ningún orden' },
  'vn.l.pols.t': { ca: 'El pols', es: 'El pulso' },
  'vn.l.pols.d': {
    ca: 'Un mapa dibuixat és una radiografia: diu què hi ha. El pols diu l\'altra cosa —<b>si allò circula</b>— i és el que decideix si una casa va bé. De dos a quatre llocs del full es marquen amb un cor, que és on cal mirar-ho.',
    es: 'Un mapa dibujado es una radiografía: dice qué hay. El pulso dice la otra cosa —<b>si aquello circula</b>— y es lo que decide si una casa va bien. De dos a cuatro sitios de la hoja se marcan con un corazón, que es donde hay que mirarlo.'
  },
  'vn.l.enc.t': { ca: 'I si un node s\'encalla', es: 'Y si un nodo se atasca' },
  'vn.l.enc.d': {
    ca: 'La pregunta que un metge fa davant d\'una radiografia: <b>i si això no passa?</b> Al full es fa amb el dibuix a la mà i dues preguntes: quin rol és més essencial per a la supervivència de la xarxa, i què passaria si aquella persona la substituís una altra.',
    es: 'La pregunta que un médico hace ante una radiografía: <b>¿y si esto no pasa?</b> En la hoja se hace con el dibujo en la mano y dos preguntas: qué rol es más esencial para la supervivencia de la red, y qué pasaría si a esa persona la sustituyera otra.'
  },
  'vn.l.zoom.t': { ca: 'El zoom', es: 'El zoom' },
  'vn.l.zoom.d': {
    ca: 'En una casa gran <b>no es mapa tot en un sol dibuix</b>: es fa amb zoom. Un nivell primer, i el que hi ha dins de cada node es mapa a part si la decisió ho demana.',
    es: 'En una casa grande <b>no se mapea todo en un solo dibujo</b>: se hace con zoom. Un nivel primero, y lo que hay dentro de cada nodo se mapea aparte si la decisión lo pide.'
  },
  'vn.l.zoom.per': {
    ca: 'Per sobre de dotze rols i cinquanta transaccions un mapa ja no es maneja a una sala — que és, dit d\'una altra manera, per què existeix el zoom.',
    es: 'Por encima de doce roles y cincuenta transacciones un mapa ya no se maneja en una sala — que es, dicho de otra manera, por qué existe el zoom.'
  },
  'vn.l.troba.t': { ca: 'Què hi ensenya l\'anàlisi', es: 'Qué enseña el análisis' },
  'vn.l.preg.t': { ca: 'I les vuit preguntes', es: 'Y las ocho preguntas' },
  'vn.l.preg.d': {
    ca: 'El mapa <b>no diu res sol</b>. El que diu alguna cosa és el grup responent-les amb el dibuix al davant, i per això la sessió no s\'acaba quan el full està ple.',
    es: 'El mapa <b>no dice nada solo</b>. Lo que dice algo es el grupo respondiéndolas con el dibujo delante, y por eso la sesión no se acaba cuando la hoja está llena.'
  },
  'vn.l.taula.t': { ca: 'Les transaccions, una per una', es: 'Las transacciones, una por una' },
  'vn.th.de': { ca: 'De', es: 'De' },
  'vn.th.a': { ca: 'A', es: 'A' },
  'vn.th.mena': { ca: 'Mena', es: 'Clase' },
  'vn.th.que': { ca: 'Què', es: 'Qué' },
  'vn.th.quan': { ca: 'Quan', es: 'Cuándo' },
  'vn.mena.t': { ca: 'tangible', es: 'tangible' },
  'vn.mena.i': { ca: 'intangible', es: 'intangible' },
  'vn.sempre': { ca: 'sempre', es: 'siempre' },
  'vn.dona': { ca: 'dona', es: 'da' },
  'vn.rep': { ca: 'rep', es: 'recibe' },
  'vn.obre': { ca: 'S\'obre: té mapa propi', es: 'Se abre: tiene mapa propio' },
  'vn.det': { ca: 'es poden facturar', es: 'se pueden facturar' },
  'vn.dei': { ca: 'no consten enlloc', es: 'no constan en ningún sitio' },
  'vn.tesi': {
    ca: '<b>El marge no surt d\'apujar el preu de l\'ampolla.</b> Surt de cobrar els intangibles que la casa ja produeix i que pel canal se\'n van de franc.',
    es: '<b>El margen no sale de subir el precio de la botella.</b> Sale de cobrar los intangibles que la casa ya produce y que por el canal se van gratis.'
  },
  'vn.xif.canal': { ca: 'lliuraments pel distribuïdor, i', es: 'entregas por el distribuidor, y' },
  'vn.xif.visita': { ca: 'pel camí del visitant, i', es: 'por el camino del visitante, y' },
  'vn.sempre.per': { ca: CELLER.sempreMotiu, es: CELLER.sempreMotiuEs }
};

// VNA · la notació, el procés amb les tres anàlisis, i els entregables.
function blocProces() {
  const i18 = k => ` data-i18n="${k}"`;
  const i18h = k => ` data-i18n-html="${k}"`;
  const f = [];
  f.push('<section class="mv-sec">');
  f.push(`<h2${i18('vn.not.h2')}>${VN['vn.not.h2'].ca}</h2>`);
  f.push(`<p class="mv-sub"${i18('vn.not.sub')}>${VN['vn.not.sub'].ca}</p>`);
  f.push('<div class="mv-not">');
  NOTACIO.forEach(n => {
    f.push(`<div class="mv-nt ${n.k}"><div class="mv-nt-h"><b data-i18n="vn.not.${n.k}.n">${esc(n.nom)}</b>`
      + `<span data-i18n="vn.not.${n.k}.s">${esc(n.sub)}</span></div>`
      + `<p data-i18n="vn.not.${n.k}.d">${esc(n.d)}</p></div>`);
  });
  f.push('</div>');
  f.push('</section>');

  f.push('<section class="mv-sec">');
  f.push(`<h2${i18('vn.pas.h2')}>${VN['vn.pas.h2'].ca}</h2>`);
  /* La xifra i la durada no van al diccionari: una xifra dins d'una frase
     traduïda és una xifra que es pot quedar vella en una llengua i no en
     l'altra. La durada la diu el catàleg, que és qui ho ven. */
  f.push(`<p class="mv-sub">${PROCES.length} <span${i18('vn.pas.en')}>${VN['vn.pas.en'].ca}</span> `
    + `${esc(PAQUET ? PAQUET.dura : '3 sessions')}. <span${i18h('vn.pas.sub')}>${VN['vn.pas.sub'].ca}</span></p>`);
  f.push('<ol class="mv-pas">');
  PROCES.forEach(p => {
    f.push(`<li class="${p.tip}${p.allee ? ' allee' : ''}"><span class="mv-pk" data-i18n="vn.tip.${p.tip}">${p.tip}</span>` +
      `<b data-i18n="vn.p${p.n}.t">${esc(p.t)}</b><p data-i18n-html="vn.p${p.n}.d">${neg(p.d)}</p></li>`);
  });
  f.push('</ol>');
  f.push('</section>');

  f.push('<section class="mv-sec">');
  f.push(`<h2${i18('vn.ent.h2')}>${VN['vn.ent.h2'].ca}</h2>`);
  f.push(`<p class="mv-sub" data-i18n="vn.ent.sub">${esc(PAQUET ? PAQUET.endus : '')}</p>`);
  f.push('<div class="mv-ent">');
  ENTREGABLES.forEach((e, i) => f.push(`<div class="mv-e"><b data-i18n="vn.e${i}.t">${esc(e.t)}</b>`
    + `<p data-i18n="vn.e${i}.d">${esc(e.d)}</p></div>`));
  f.push('</div>');
  f.push(`<p class="mv-nota"${i18h('vn.ent.nota')}>${VN['vn.ent.nota'].ca}</p>`);
  f.push('</section>');
  return f.join('\n');
}

/* ══ EL LLENÇ ════════════════════════════════════════════════════════════════
   El mapa és la pàgina. Abans d'avui el dibuix era una il·lustració dins d'un
   text —catorze seccions apilades, el dibuix a la cinquena— i el que s'hi podia
   fer era llegir. Això ho inverteix: **un sol dibuix, i la metodologia són
   lectures que s'hi apliquen a sobre.**

   Aquí hi va el dibuix i els seus comandaments; les lectures van a
   `blocLectures()`, al costat, i cada una actua sobre aquest llenç.

   Tres coses que el llenç porta i la pàgina d'ahir no tenia:

   · **El focus.** Mirar-se un tros del graf i tornar a veure-ho tot. Sense
     això, un mapa de set nodes ja es llegeix i un de dotze no.
   · **El zoom.** Dos nodes contenen un mapa (`DINS`), i entrar-hi és el gest
     de la metodologia: en una casa gran no n'hi ha prou amb un sol mapa.
   · **La seqüència.** Cada fletxa sap en quin ordre passa (`data-seq`), i això
     és la passa 4 feta amb el dibuix i no explicada al costat. */
function blocLlenc() {
  const i18 = k => ` data-i18n="${k}"`;
  const f = [];
  f.push('<div class="lz-viz" id="lzViz">');
  /* Quin cas és. El dibuix ensenyava set cercles i **enlloc no deia de què
     anava**: qui arriba veu «Qui fa el vi» i ha de deduir que això és un
     celler. El títol i la frase ja estaven declarats i no sortien a la
     pàgina. */
  f.push(`  <p class="lz-cas"><b data-i18n="vc.titol">${esc(CELLER.titol)}</b>`
    + `<span data-i18n="vc.una">${esc(CELLER.una)}</span></p>`);
  /* La molla de pa. Un zoom sense sortida és un cul-de-sac (veda 62), i el
     camí de tornada ha d'existir al marcatge i no només al JavaScript: una
     pàgina sense JavaScript ha d'ensenyar el mapa sencer i prou. */
  /* L'etiqueta va a l'atribut i no al text: amb `data-i18n` damunt d'un
     element amb fills, aplicar la llengua els substitueix tots pel text de la
     clau — i la molla de pa es va quedar sense el botó de tornar. */
  f.push(`  <nav class="lz-molla" data-i18n-al="vn.molla" aria-label="${esc(VN['vn.molla'].ca)}">`);
  f.push(`    <button type="button" class="lz-tornar" data-tornar hidden${i18('vn.tornar')}>${VN['vn.tornar'].ca}</button>`);
  Object.keys(DINS).forEach(id => {
    f.push(`    <span class="lz-niv" data-niv="${id}" hidden data-i18n="vz.${id}.titol">${esc(DINS[id].titol)}</span>`);
  });
  f.push('  </nav>');
  /* El mapa sencer, i els de dins. Tots al marcatge: generats al navegador
     caldria un segon dibuixant en JavaScript, i dues implementacions del
     mateix dibuix és el defecte que `auditoria-mapes.md` ja va pagar una
     vegada —quatre fonts, quatre expanders, salut de 13 a 100. */
  f.push('  <div class="lz-full" data-pan="">');
  f.push('    ' + svgMapa(CELLER, 'mvCellerVna', 'vc', DINS));
  f.push('  </div>');
  Object.entries(DINS).forEach(([id, m]) => {
    f.push(`  <div class="lz-full" data-pan="${id}" hidden>`);
    f.push('    ' + svgMapa(m, 'mvDins-' + id, 'vz.' + id));
    f.push('  </div>');
  });
  f.push('  <div class="mv-leg">'
    + `<span class="mv-lt"${i18('vn.lt')}>${VN['vn.lt'].ca}</span>`
    + `<span class="mv-li"${i18('vn.li')}>${VN['vn.li'].ca}</span>`
    + `<span class="mv-lc"><b>${CELLER.nodes.length}</b> <span${i18('vn.lc.nodes')}>${VN['vn.lc.nodes'].ca}</span>`
    + ` · <b>${cTot.n}</b> <span${i18('vn.lc.trans')}>${VN['vn.lc.trans'].ca}</span>`
    + ` · <b>${cTot.i}</b> <span${i18('vn.lc.intang')}>${VN['vn.lc.intang'].ca}</span></span>`
    + '</div>');
  /* El focus. Les dues bandes del cas i prou: **el contrast és l'argument**, i
     set botons —un per node— serien set maneres de no triar. Clicar un node del
     dibuix fa el focus d'aquell node, que és l'altra meitat del gest. */
  f.push('  <div class="lz-ctrl">');
  f.push(`    <div class="lz-foc" role="group" data-i18n-al="vn.foc.lb" aria-label="${esc(VN['vn.foc.lb'].ca)}">`);
  f.push(`      <button type="button" class="mv-b on" data-foc="" aria-pressed="true"${i18('vn.foc.tot')}>${VN['vn.foc.tot'].ca}</button>`);
  Object.keys(CELLER.colors).forEach(cami => {
    f.push(`      <button type="button" class="mv-b" data-foc="${cami}" aria-pressed="false"${i18('vn.foc.' + cami)}>`
      + `${esc(VN['vn.foc.' + cami].ca)}</button>`);
  });
  f.push('    </div>');
  f.push('    ' + blocPols('mvCellerVna'));
  f.push(`    <p class="lz-ajuda"${i18('vn.foc.ajuda')}>${VN['vn.foc.ajuda'].ca}</p>`);
  f.push('  </div>');
  f.push('</div>');
  return f.join('\n');
}

/* ══ LES LECTURES ════════════════════════════════════════════════════════════
   Vuit lectures del mateix dibuix, i cada una porta `data-lt` perquè el
   JavaScript de la pàgina sàpiga què ha de fer al llenç quan algú la mira.

   La raó per la qual això no és una llista de seccions: **a la sala el full es
   dibuixa un cop i es llegeix vuit vegades.** Una pàgina amb vuit dibuixos
   diria el contrari del que el mètode fa. */
function blocLectures() {
  const i18 = k => ` data-i18n="${k}"`;
  const i18h = k => ` data-i18n-html="${k}"`;
  const f = [];
  const cap = (id, k) => {
    f.push(`<section class="lt" data-lt="${id}">`);
    f.push(`  <h3 class="lt-t"${i18('vn.l.' + k + '.t')}>${esc(VN['vn.l.' + k + '.t'].ca)}</h3>`);
    f.push(`  <p class="lt-d"${i18h('vn.l.' + k + '.d')}>${VN['vn.l.' + k + '.d'].ca}</p>`);
  };

  /* 1 · Els rols. La fitxa de cada node, i quants lliuraments mou: el número
     el compta el graf i per això no es pot quedar vell. */
  cap('rols', 'rols');
  f.push('  <div class="mv-nodes">');
  CELLER.nodes.forEach(n => {
    const rep = flux.filter(x => x.a === n.id), dona = flux.filter(x => x.de === n.id);
    f.push(`    <div class="mv-nd c-${n.cami}" data-node="${n.id}">`
      + `<b data-i18n="vc.n.${n.id}">${esc(n.nom)}</b>`
      + `<p data-i18n="vc.d.${n.id}">${esc(n.d)}</p>`
      + `<span class="mv-nq"><span${i18('vn.dona')}>${VN['vn.dona'].ca}</span> ${dona.length} · `
      + `<span${i18('vn.rep')}>${VN['vn.rep'].ca}</span> ${rep.length}</span>`
      + (DINS[n.id] ? `<span class="mv-nz"${i18('vn.obre')}>${esc(VN['vn.obre'].ca)}</span>` : '')
      + '</div>');
  });
  f.push('  </div>');
  f.push('</section>');

  /* 2 i 3 · Les dues menes. La xifra surt del graf i la lectura encén només
     les fletxes d'aquella mena: és el moment de la sessió en què es dibuixen,
     primer les unes i després les altres. */
  [['must', 't'], ['extra', 'i']].forEach(([k, mena]) => {
    cap('mena-' + mena, k);
    const seus = flux.filter(x => (x.mena === 'tangible' ? 't' : 'i') === mena);
    f.push(`  <p class="lt-n"><b>${seus.length}</b> <span${i18('vn.lc.trans')}>${VN['vn.lc.trans'].ca}</span>`
      + ` <span${i18('vn.de' + mena)}>${esc(VN['vn.de' + mena].ca)}</span></p>`);
    f.push('</section>');
  });

  /* 4 · La seqüència. Un botó per procés i la llista de passos, que és el que
     el llenç recorre. I el que no té pas, dit amb el seu motiu: és l'argument
     que aquest cas regala i que cap diagrama de processos pot fer. */
  cap('seq', 'seq');
  f.push(`  <blockquote class="lt-cita"${i18h('vn.l.seq.cita')}>${VN['vn.l.seq.cita'].ca}`
    + '<cite>Verna Allee</cite></blockquote>');
  f.push('  <div class="lt-seq">');
  CELLER.processos.forEach(pr => {
    const passos = flux.filter(x => x.seq && x.seq !== 'sempre' && x.seq[0] === pr.id)
      .sort((a, b) => a.seq[1] - b.seq[1]);
    f.push(`    <div class="sq" data-proces="${pr.id}">`);
    f.push(`      <button type="button" class="mv-b sq-b" data-seq="${pr.id}" aria-pressed="false"`
      + ` data-i18n="vn.pr.${pr.id}.nom">${esc(pr.nom)}</button>`);
    f.push(`      <p class="sq-d" data-i18n="vn.pr.${pr.id}.d">${esc(pr.d)}</p>`);
    f.push('      <ol class="sq-l">' + passos.map(x =>
      `<li data-pas="${pr.id}:${x.seq[1]}"><span class="sq-k ${x.mena === 'tangible' ? 't' : 'i'}"></span>`
      + `<b data-i18n="vc.n.${x.de}">${esc(nodeDe(x.de).nom)}</b> → `
      + `<b data-i18n="vc.n.${x.a}">${esc(nodeDe(x.a).nom)}</b>`
      + `<span data-i18n="vc.q.${x.de}-${x.a}">${esc(x.q)}</span></li>`).join('') + '</ol>');
    f.push('    </div>');
  });
  f.push('  </div>');
  /* I les setze, una per una, **amb la columna que fins avui no existia**: en
     quin pas passa cadascuna. És la mateixa dada que mou el dibuix, llegida
     com a taula — i la columna «Quan» és el que converteix «el mapa està
     complet» d'una opinió en una cosa que es pot repassar fila a fila. */
  f.push(`  <h4 class="mv-h3" style="font-size:var(--t1);margin:1.4rem 0 .7rem"${i18('vn.l.taula.t')}>`
    + `${esc(VN['vn.l.taula.t'].ca)}</h4>`);
  f.push('  <div class="mv-taula"><table><thead><tr>'
    + `<th${i18('vn.th.de')}>${VN['vn.th.de'].ca}</th><th${i18('vn.th.a')}>${VN['vn.th.a'].ca}</th>`
    + `<th${i18('vn.th.mena')}>${VN['vn.th.mena'].ca}</th><th${i18('vn.th.que')}>${VN['vn.th.que'].ca}</th>`
    + `<th${i18('vn.th.quan')}>${VN['vn.th.quan'].ca}</th></tr></thead><tbody>`);
  flux.forEach(x => {
    const t = x.mena === 'tangible';
    const quan = x.seq === 'sempre'
      ? `<i${i18('vn.sempre')}>${VN['vn.sempre'].ca}</i>`
      : `<span data-i18n="vn.pr.${x.seq[0]}.nom">${esc((CELLER.processos.find(p => p.id === x.seq[0]) || {}).nom)}</span> ${x.seq[1]}`;
    f.push(`<tr><td data-i18n="vc.n.${x.de}">${esc(nodeDe(x.de).nom)}</td>`
      + `<td data-i18n="vc.n.${x.a}">${esc(nodeDe(x.a).nom)}</td>`
      + `<td><span class="mv-k ${t ? 't' : 'i'}" data-i18n="vn.mena.${t ? 't' : 'i'}">${esc(VN['vn.mena.' + (t ? 't' : 'i')].ca)}</span></td>`
      + `<td data-i18n="vc.q.${x.de}-${x.a}">${esc(x.q)}</td><td>${quan}</td></tr>`);
  });
  f.push('</tbody></table></div>');
  const sempre = flux.filter(x => x.seq === 'sempre');
  f.push(`  <div class="lt-sempre"><b${i18('vn.l.seq.sempre')}>${esc(VN['vn.l.seq.sempre'].ca)}</b>`
    + '<ul>' + sempre.map(x =>
      `<li><b data-i18n="vc.n.${x.de}">${esc(nodeDe(x.de).nom)}</b> → `
      + `<b data-i18n="vc.n.${x.a}">${esc(nodeDe(x.a).nom)}</b>`
      + `<span data-i18n="vc.q.${x.de}-${x.a}">${esc(x.q)}</span></li>`).join('') + '</ul>'
    + `<p data-i18n="vn.sempre.per">${esc(CELLER.sempreMotiu)}</p></div>`);
  f.push('</section>');

  /* 5 i 6 · El pols i l'encallament. Els botons són els de `blocPols()`, al
     llenç: aquí hi va **per què** s'hi són, que és el que converteix un botó
     en una pregunta de metge. */
  cap('pols', 'pols');
  f.push('</section>');
  cap('enc', 'enc');
  f.push(`  <h4 class="mv-h3" style="font-size:var(--t1);margin:1rem 0 .7rem"${i18('vn.l.troba.t')}>`
    + `${esc(VN['vn.l.troba.t'].ca)}</h4>`);
  f.push('  <div class="mv-tro">');
  CELLER.troballes.forEach((t, k) => f.push(`    <div class="mv-t"><span class="mv-tn">0${k + 1}</span>`
    + `<b data-i18n="vc.t${k}.t">${esc(t.t)}</b>`
    + `<p data-i18n-html="vc.t${k}.d">${t.d}</p></div>`));
  f.push('  </div>');
  f.push('</section>');

  /* 7 · El zoom, amb el sostre del mètode escrit. */
  cap('zoom', 'zoom');
  f.push(`  <p class="lt-per"${i18('vn.l.zoom.per')}>${esc(VN['vn.l.zoom.per'].ca)}</p>`);
  f.push('  <div class="lt-dins">');
  Object.entries(DINS).forEach(([id, m]) => {
    f.push(`    <button type="button" class="mv-b" data-obre="${id}">`
      + `<b data-i18n="vz.${id}.titol">${esc(m.titol)}</b>`
      + `<span data-i18n="vz.${id}.una">${esc(m.una)}</span></button>`);
  });
  f.push('  </div>');
  f.push('</section>');

  /* 8 · Les vuit preguntes. El dibuix es queda quiet: el mapa no diu res sol. */
  cap('preg', 'preg');
  f.push('  <ul class="mv-pre">' + PREGUNTES.map((p, i) =>
    `<li data-i18n="vn.q${i}">${esc(p[0])}</li>`).join('') + '</ul>');
  f.push('</section>');

  /* I la tesi, que és el que es ven. Les xifres surten del graf. */
  f.push(`<p class="mv-tesi"${i18h('vn.tesi')}>${VN['vn.tesi'].ca}</p>`);
  f.push(`<p class="mv-xif"><b>${cCanal.n}</b> <span${i18('vn.xif.canal')}>${esc(VN['vn.xif.canal'].ca)}</span>`
  + ` <b>${cCanal.i}</b> <span${i18('vn.lc.intang')}>${VN['vn.lc.intang'].ca}</span> · `
  + `<b>${cVisita.n}</b> <span${i18('vn.xif.visita')}>${esc(VN['vn.xif.visita'].ca)}</span>`
  + ` <b>${cVisita.i}</b> <span${i18('vn.lc.intang')}>${VN['vn.lc.intang'].ca}</span></p>`);
  f.push(`<p class="mv-avis"${i18h('vc.avis')}>${CELLER.avis}</p>`);
  return f.join('\n');
}

/* ══ EL DICCIONARI DE `/vna` ═════════════════════════════════════════════════
   La pàgina tenia **dos** `data-i18n` —els dos del menú generat— i cap
   commutador de llengua, i ningú ho sabia: `check-i18n.js` només mira l'app, i
   per tant la pàgina que explica el producte era l'única del lloc que no es
   podia llegir en castellà.

   Tot el que s'escriu al marcatge amb clau hi ha de tenir entrada. Les xifres
   **no hi són**: les compta el graf i van en un element a part, perquè una
   xifra dins d'una frase traduïda és una xifra que es pot quedar vella en una
   llengua i no en l'altra. */
function dicVna(l) {
  const q = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const t = (o, c) => (l === 'es' ? (o[c + 'Es'] || o[c]) : o[c]);
  const f = [];
  const put = (k, v) => f.push(`  '${k}':'${q(v)}',`);
  Object.entries(VN).forEach(([k, v]) => put(k, v[l]));
  /* La notació, el procés, les fases, els entregables, la llegenda del full i
     les preguntes: les declaracions, amb el seu germà castellà. */
  NOTACIO.forEach(n => {
    put(`vn.not.${n.k}.n`, t(n, 'nom')); put(`vn.not.${n.k}.s`, t(n, 'sub')); put(`vn.not.${n.k}.d`, t(n, 'd'));
  });
  Object.entries(TIP_ES).forEach(([ca, es]) => put(`vn.tip.${ca}`, l === 'es' ? es : ca));
  PROCES.forEach(p => { put(`vn.p${p.n}.t`, t(p, 't')); f.push(`  'vn.p${p.n}.d':'${q(neg(t(p, 'd')))}',`); });
  FASES.forEach(x => { put(`vn.f${x.n}.t`, t(x, 't')); put(`vn.f${x.n}.d`, t(x, 'd')); });
  put('vn.fp.un', l === 'es' ? 'paso' : 'pas');
  put('vn.fp.molts', l === 'es' ? 'pasos' : 'passos');
  ENTREGABLES.forEach((e, i) => { put(`vn.e${i}.t`, t(e, 't')); put(`vn.e${i}.d`, t(e, 'd')); });
  put('vn.ent.sub', l === 'es' ? (PAQUET ? PAQUET.endusEs || PAQUET.endus : '') : (PAQUET ? PAQUET.endus : ''));
  SESSIO.llegenda.forEach(g => { put(`vn.lg.${g.k}.t`, t(g, 't')); put(`vn.lg.${g.k}.d`, t(g, 'd')); });
  put('vs.tit', t(SESSIO, 'titolSvg')); put('vs.desc', t(SESSIO, 'descSvg'));
  PREGUNTES.forEach((p, i) => put(`vn.q${i}`, l === 'es' ? p[1] : p[0]));
  CELLER.processos.forEach(pr => { put(`vn.pr.${pr.id}.nom`, t(pr, 'nom')); put(`vn.pr.${pr.id}.d`, t(pr, 'd')); });
  /* ── El cas: el dibuix i les seves fitxes ──────────────────────────────── */
  put('vc.tit', t(CELLER, 'titolSvg')); put('vc.desc', t(CELLER, 'descSvg'));
  put('vc.titol', t(CELLER, 'titol')); put('vc.una', t(CELLER, 'una'));
  f.push(`  'vc.avis':'${q(t(CELLER, 'avis'))}',`);
  CELLER.nodes.forEach(n => { put(`vc.n.${n.id}`, t(n, 'nom')); put(`vc.d.${n.id}`, t(n, 'd')); });
  CELLER.troballes.forEach((x, i) => { put(`vc.t${i}.t`, t(x, 't')); f.push(`  'vc.t${i}.d':'${q(t(x, 'd'))}',`); });
  Object.keys(DINS).forEach(id => put(`vc.dins.${id}`, (l === 'es' ? '+%n roles' : '+%n rols')
    .replace('%n', DINS[id].nodes.length)));
  f.push(clausFletxes(CELLER, 'vc', l, q));
  /* El «què» de cada lliurament, indexat per on va i on arriba: la llista de
     la seqüència el torna a dir, i no es pot escriure dues vegades. */
  CELLER.parells.forEach(p => {
    put(`vc.q.${p[0]}-${p[1]}`, l === 'es' ? (p[6] || p[3]) : p[3]);
    put(`vc.q.${p[1]}-${p[0]}`, l === 'es' ? (p[7] || p[5]) : p[5]);
  });
  /* ── I els mapes de dins ───────────────────────────────────────────────── */
  Object.entries(DINS).forEach(([id, m]) => {
    const c = 'vz.' + id;
    put(`${c}.titol`, t(m, 'titol')); put(`${c}.una`, t(m, 'una'));
    put(`${c}.tit`, t(m, 'titolSvg')); put(`${c}.desc`, t(m, 'descSvg'));
    f.push(clausFletxes(m, c, l, q));
  });
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

/* 9 · El repartiment és el de l'app perquè el calcula el codi de l'app. Queda
       comprovar que s'ha pogut llegir, que els tipus triats a mà existeixen
       i que les frases de la portada diuen el que n'ha sortit. Abans es
       comparaven els noms dels tipus i no el resultat, i la portada en va
       prometre 5 de màquina on l'app no en feia cap (veda 164). */
(() => {
  if (!REP) { bad(`no es pot executar la regla de SOS/index.html (${REGLA_ERR}): el repartiment d'aquest cas no es pot calcular`); return; }
  const ids = REGLA.ENTREGABLES.map(e => e.id), etiquetes = flux.map(f => f.q);
  const li = [];
  Object.entries(CELLER.tipus).forEach(([q, t]) => {
    if (!etiquetes.includes(q)) li.push(`«${q}» no és cap lliurament del cas`);
    else if (!ids.includes(t)) li.push(`«${q}» diu que és «${t}», que l'app no coneix: l'app el deduiria de l'etiqueta`);
    else if (flux.find(f => f.q === q).mena !== 'tangible') li.push(`«${q}» és intangible: un tipus no el treu de les mans d'una persona`);
  });
  if (li.length) bad('CELLER.tipus: ' + li.join(' · '));
  const n = k => QUI.filter(x => x.qui === k).length;
  if (cQui.maquina + cQui.persona + cQui.sense !== flux.length) bad('el repartiment no suma els lliuraments del graf');
  else if (n('maquina') !== cQui.maquina || n('persona') !== cQui.persona) bad('fluxAutomatitzable i repartimentMaquina no hi estan d\'acord');
  else if (QUI.some(x => x.f.mena === 'intangible' && x.qui !== 'persona')) bad('un intangible no és de persona: la regla no s\'està aplicant');
  else ok(`repartiment de l'app: ${cQui.maquina} de màquina · ${cQui.sense} sense tipus · ${cQui.persona} de persona (els ${cTot.i} intangibles i ${cDiners} pagaments)`);
  // Les frases tenen nom i nombre: si el repartiment es mou, peten.
  const maq = QUI.filter(x => x.qui === 'maquina').map(x => x.f.q);
  if (JSON.stringify(maq) !== JSON.stringify(QUI_DIU.maquina))
    bad(`la portada diu que la màquina prepara «${QUI_DIU.maquina.join('», «')}» i l'app hi posa ${maq.length ? '«' + maq.join('», «') + '»' : 'cap lliurament'}: cal reescriure QUI_TXT.maquina`);
  else if (QUI.some(x => x.qui === 'persona' && x.f.mena !== 'intangible' && x.tipus !== QUI_DIU.persona))
    bad(`hi ha tangibles de persona que no són «${QUI_DIU.persona}» i la portada només parla de pagaments: cal reescriure QUI_TXT.persona`);
  else if (JSON.stringify(QUI.filter(x => x.qui === 'persona' && x.f.mena !== 'intangible').map(x => x.f.q)) !== JSON.stringify(QUI_DIU.diners))
    bad(`la portada parla de ${QUI_DIU.diners.length} pagaments i l'app n'hi posa ${cDiners}: cal reescriure QUI_TXT.persona`);
  else ok('les frases de qui fa cada lliurament diuen el que surt de la regla');
})();

/* 9b · El node que s'atura ha d'existir i ha de moure alguna cosa. Un
        encallament sobre un node que no hi és no petaria: el botó senzillament
        no faria res. */
if (!nodeDe(ENC.node)) bad(`l'encallament apunta a «${ENC.node}», que no és cap node del mapa`);
else if (!FLUX_PARAT) bad(`el node «${ENC.node}» no mou res: aturar-lo no ensenyaria res`);
else if (!SENSE_REG.length) bad(`aturar «${ENC.node}» no deixa cap node sense la meitat del que rep: `
  + 'el dibuix no ensenyaria cap conseqüència i el botó seria decoració');
else ok(`aturar «${nodeDe(ENC.node).nom}» para ${FLUX_PARAT} dels ${cTot.n} lliuraments `
  + `i deixa ${SENSE_REG.length} node(s) sense la meitat del que reben`);

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
  /* I el dibuix, que també és text: el títol, la descripció i les setze
     frases de les fletxes es quedaven en català. */
  f.push(`  'mx.tit':'${q(l === 'es' ? XARXA.titolSvgEs : XARXA.titolSvg)}',`);
  f.push(`  'mx.desc':'${q(l === 'es' ? XARXA.descSvgEs : XARXA.descSvg)}',`);
  f.push(clausFletxes(XARXA, 'mx', l, q));
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
  f.push('    ' + svgMapa(XARXA, 'mvXarxa', 'mx'));
  f.push('    <div class="mv-leg">' +
    '<span class="mv-lt" data-i18n="mv.lt">— tangible</span>' +
    '<span class="mv-li" data-i18n="mv.li">- - intangible</span>' +
    `<span class="mv-lc"><b>${fl.length}</b> <span data-i18n="mv.lc1">lliuraments</span> · `
    + `<b>${intang(fl)}</b> <span data-i18n="mv.lc2">intangibles</span></span>` +
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
    + `<div class="mv-cv">${dins.length} <span data-i18n="mv.de">de</span> ${fl.length}</div>`
    + `<div class="mv-cd"><span data-i18n="xa.lliur">lliuraments.</span> `
    + `${aillats.length}/${casa.length} <span data-i18n="xa.dins.d">${esc(FR['xa.dins.d'].ca)}</span></div></div>`);
  f.push(`      <div class="mv-c visita"><div class="mv-ck" data-i18n="xa.fora.k">`
    + `${esc(FR['xa.fora.k'].ca)}</div>`
    + `<div class="mv-cv">${creuen.length} <span data-i18n="mv.de">de</span> ${fl.length}</div>`
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

/* ⚠ **El mapa de la casa se'n va a `/vna`** (04/10/2026). És el mètode aplicat
   a qui el ven, que és l'única manera honesta d'ensenyar-lo, i per això va on
   viu el mètode i no al mig del recorregut de compra. */
const DESTINS = [
  { f: join(ARREL, 'index.html'), marca: 'TT-MAPAVALOR', fn: blocPortada },
  { f: join(SOS, 'vna.html'), marca: 'VNA-XARXA', fn: blocXarxa },
  { f: join(ARREL, 'index.html'), marca: 'TT-VALOR', fn: blocValor },
  { f: join(SOS, 'vna.html'), marca: 'VNA-LLENC', fn: blocLlenc },
  { f: join(SOS, 'vna.html'), marca: 'VNA-LECTURES', fn: blocLectures },
  { f: join(SOS, 'vna.html'), marca: 'VNA-PROCES', fn: blocProces },
  { f: join(SOS, 'vna.html'), marca: 'VNA-SESSIO', fn: blocSessio }
];
/* ── CADA MARCA, UN COP ───────────────────────────────────────────────────
   El bucle d'escriptura busca `indexOf(obre)` i `indexOf(tanca)`: **el primer**
   de cada un. Si al fitxer n'hi ha dos, escriu entre el primer parell i deixa
   la resta intactes, i el bloc generat queda tancat per una marca i seguit de
   còpies mortes de la mateixa marca.

   Va passar: `blocSessio()` escrivia les seves pròpies marques a més de les
   que hi posa el bucle, i cada execució n'afegia una. `vna.html` va arribar a
   dues obertures i tretze tancaments. **No es veia** —un comentari HTML
   repetit no surt a la pantalla— i el que es veia era `--check` en vermell
   dient «blocs desactualitzats», que és el pitjor missatge possible: el fitxer
   estava al dia, el que no quadrava era la seva pròpia escriptura.

   Es compta abans d'escriure, perquè un fitxer amb marques duplicades no es pot
   arreglar escrivint-hi a sobre. */
(() => {
  const dobles = [];
  [...new Set(DESTINS.map(d => d.f))].forEach(f => {
    if (!existsSync(f)) return;
    const txt = readFileSync(f, 'utf8');
    const nom = f.replace(ARREL + '/', '');
    DESTINS.filter(d => d.f === f).forEach(d => {
      const n = (txt.split(`<!--${d.marca}-->`).length - 1);
      const m = (txt.split(`<!--/${d.marca}-->`).length - 1);
      if (n !== 1 || m !== 1) dobles.push(`${nom} → ${d.marca}: ${n} obertures i ${m} tancaments`);
    });
  });
  if (dobles.length) {
    bad('marques repetides, i el generador escriu entre el primer parell:\n    '
      + dobles.join('\n    ') + '\n    S\'esborren a mà les còpies: deixar-ne una de cada.');
  }
})();

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
    /* `TT-XA-I18N` se'n va amb la xarxa: el bloc és a `/vna` i les claus també.
       Deixades aquí, serien dues-centes claus que no tradueixen res a la
       portada i el text del dibuix es quedaria en català a `/vna`. */
    [['TT-VD-I18N', dicValor], ['TT-MV-I18N', dicMapa]].forEach(([marca, fn]) => {
      [['CA', 'ca'], ['ES', 'es']].forEach(([M, l]) => {
        const a = `/*${marca}-${M}*/`, b = `/*/${marca}-${M}*/`;
        const x = src.indexOf(a), y = src.indexOf(b);
        if (x < 0 || y <= x) { bad(`falten les marques ${a} a index.html`); return; }
        const out = src.slice(0, x + a.length) + '\n' + fn(l) + '\n' + src.slice(y);
        if (out !== src) { src = out; tocat = true; }
      });
    });
    if (tocat) {
      if (CHECK) vells.push('el diccionari de la xarxa');
      else { cache[f] = src; escrits++; }
    }
  }
}

/* I el de `/vna`, que fins avui no existia. Mateix patró i mateixes marques. */
{
  const f = join(SOS, 'vna.html');
  if (!existsSync(f)) bad('no existeix SOS/vna.html');
  else {
    let src = cache[f] !== undefined ? cache[f] : readFileSync(f, 'utf8');
    let tocat = false;
    /* El diccionari de la xarxa, que ara hi viu. */
    [['CA', 'ca'], ['ES', 'es']].forEach(([M, l]) => {
      const a = `/*VNA-XA-I18N-${M}*/`, b = `/*/VNA-XA-I18N-${M}*/`;
      const x = src.indexOf(a), y = src.indexOf(b);
      if (x < 0 || y <= x) { bad(`falten les marques ${a} a SOS/vna.html`); return; }
      /* I les claus comunes del dibuix —la llegenda, els comptadors— que les
         escriu `dicMapa`. Sense elles, el «— tangible / - - intangible» del
         mapa de la casa es quedava en català damunt de la pàgina castellana. */
      /* Només les claus que el marcatge d'aquesta pàgina demana: `dicMapa`
         porta també les del mapa del celler de la portada, i escrites senceres
         serien trenta-dues claus que no tradueixen res aquí. */
      const vol = new Set([...src.matchAll(/data-i18n(?:-html)?="(mv\.[^"]+)"/g)].map(m => m[1]));
      const mv = dicMapa(l).split('\n').filter(li => [...vol].some(k => li.indexOf(`'${k}':`) >= 0)).join('\n');
      const out = src.slice(0, x + a.length) + '\n' + dicXarxa(l) + (mv ? '\n' + mv : '') + '\n' + src.slice(y);
      if (out !== src) { src = out; tocat = true; }
    });
    [['CA', 'ca'], ['ES', 'es']].forEach(([M, l]) => {
      const a = `/*VNA-I18N-${M}*/`, b = `/*/VNA-I18N-${M}*/`;
      const x = src.indexOf(a), y = src.indexOf(b);
      if (x < 0 || y <= x) { bad(`falten les marques ${a} a SOS/vna.html`); return; }
      const out = src.slice(0, x + a.length) + '\n' + dicVna(l) + '\n' + src.slice(y);
      if (out !== src) { src = out; tocat = true; }
    });
    if (tocat) {
      if (CHECK) vells.push('el diccionari de /vna');
      else { cache[f] = src; escrits++; }
    }
  }
}

/* ══ LA GUARDA DEL FULL ══════════════════════════════════════════════════════
   El dibuix de la sessió és el que ensenya **què passarà a la sala**, i té
   quatre coses que no són decoració. Cap peta si desapareix: el full seguiria
   sent maco i diria la meitat.

   · **Les dues menes d'entregable.** Si només hi hagués els «must», el dibuix
     diria que un mapa de valor és un diagrama de processos — que és
     exactament el que no és.
   · **Els gomets.** Són la capa que converteix un dibuix en un diagnòstic: un
     full sense gomets no diu on hi ha feina.
   · **Els cors.** De dos a quatre, que és el que diu el guió; un de sol no és
     un pols i vuit no es miren.
   · **L'abast escrit a dalt**, que és el pas 1 i el que evita la pregunta de
     mitja sessió: «i això també hi entra?».

   I una que és d'ofici: **cap etiqueta pot sortir de la seva caixa.** Amb una
   amplada fixa en sortien sis, i es va veure mirant el dibuix i no executant
   res. Es comprova amb el mateix càlcul que la dibuixa. */
{
  const svg = svgSessio('x');
  const li = [];
  const n = c => (svg.match(new RegExp('class="' + c + '"', 'g')) || []).length;
  if (!/se-et must/.test(svg) || !/se-et extra/.test(svg))
    li.push('falten les dues menes d\'entregable: sense els «extra» el full diu que això és un diagrama de processos');
  const gom = (svg.match(/class="se-go /g) || []).length;
  if (!gom) li.push('cap gomet de satisfacció: un full sense gomets no diu on hi ha feina');
  const cors = (svg.match(/class="se-cor"/g) || []).length;
  if (cors < 2 || cors > 4) li.push(`${cors} cors de pols i el guió en diu de dos a quatre`);
  if (!svg.includes(esc(SESSIO.abast))) li.push('l\'abast no surt escrit al full');
  /* Les etiquetes dins de la seva caixa. */
  const fora = [];
  [...svg.matchAll(/<rect x="([\d.-]+)"[^>]*width="([\d.]+)"[^>]*\/><text x="([\d.-]+)"[^>]*>([^<]*)</g)]
    .forEach(m => {
      const x = +m[1], w = +m[2], t = m[4];
      if (t.length * 5.3 + 12 > w + .5) fora.push(t);
    });
  if (fora.length) li.push(`${fora.length} etiquetes surten de la seva caixa: ${fora.slice(0, 3).join(', ')}`);
  if (li.length) bad('el full de la sessió: ' + li.join(' · '));
  else ok(`el full de la sessió: les dues menes d'entregable, ${gom} gomets, ${cors} cors i l'abast escrit`);
}

/* I les quatre fases han de cobrir tots els passos. Un pas sense fase no surt
   a l'agrupació i ningú el troba a faltar: la llista de deu segueix sencera i
   la de quatre en diu nou. */
{
  const orfes = PROCES.filter(x => !FASES.some(f => f.id === x.fase));
  const buides = FASES.filter(f => !PROCES.some(x => x.fase === f.id));
  if (orfes.length) bad(`${orfes.length} passos sense fase: ${orfes.map(x => x.t).join(', ')}`);
  else if (buides.length) bad(`${buides.length} fases sense cap pas: ${buides.map(f => f.t).join(', ')}`);
  else ok(`les ${FASES.length} fases cobreixen els ${PROCES.length} passos, i cap en queda fora`);
}

/* ── CAP TEXT DEL MAPA SENSE EL SEU GERMÀ CASTELLÀ ─────────────────────────
   Un mapa de valor **és text**: els noms dels nodes es llegeixen sobre el
   dibuix i les setze frases de cada mapa, passant-hi el ratolí. Si un node o un
   parell es declara sense la seva versió castellana, el generador cau al català
   i aquella etiqueta es queda en una llengua, enmig d'una pàgina que està en
   l'altra. **No peta**, i la prova de navegador tampoc el troba sempre: «el vi,
   la verema i el celler obert» no porta cap paraula que una expressió regular
   reconegui com a catalana.

   Per això es compta aquí, a la declaració, que és on es pot dir del cert. */
{
  const falten = [];
  /* I les declaracions de la pàgina, que fins avui no en tenien **cap**: la
     notació, els deu passos, les quatre fases, els entregables, el full de la
     sessió i les vuit preguntes. Es compta aquí i no a la pàgina perquè una
     clau sense entrada al diccionari deixa el català escrit al marcatge, i
     això es llegeix com si la traducció hi fos. */
  NOTACIO.forEach(n => ['nomEs', 'subEs', 'dEs'].forEach(c => { if (!n[c]) falten.push(`NOTACIO.${n.k}.${c}`); }));
  PROCES.forEach(p => ['tEs', 'dEs'].forEach(c => { if (!p[c]) falten.push(`PROCES[${p.n}].${c}`); }));
  FASES.forEach(x => ['tEs', 'dEs'].forEach(c => { if (!x[c]) falten.push(`FASES.${x.id}.${c}`); }));
  ENTREGABLES.forEach((e, i) => ['tEs', 'dEs'].forEach(c => { if (!e[c]) falten.push(`ENTREGABLES[${i}].${c}`); }));
  PROCES.forEach(p => { if (!TIP_ES[p.tip]) falten.push(`TIP_ES['${p.tip}']`); });
  SESSIO.volta.forEach((r, i) => ['tEs', 'mustEs'].forEach(c => { if (!r[c]) falten.push(`SESSIO.volta[${i}].${c}`); }));
  SESSIO.llegenda.forEach(g => ['tEs', 'dEs'].forEach(c => { if (!g[c]) falten.push(`SESSIO.llegenda.${g.k}.${c}`); }));
  ['abastEs', 'peuEs', 'centreEs', 'titolSvgEs', 'descSvgEs'].forEach(c => { if (!SESSIO[c]) falten.push('SESSIO.' + c); });
  PREGUNTES.forEach((p, i) => { if (!p[1]) falten.push(`PREGUNTES[${i}] sense castellà`); });
  [['CELLER', CELLER], ['XARXA', XARXA]].concat(Object.entries(DINS).map(([k, v]) => ['DINS.' + k, v]))
    .forEach(([nom, m]) => {
    if (!m.titolSvgEs) falten.push(nom + '.titolSvgEs');
    if (!m.descSvgEs) falten.push(nom + '.descSvgEs');
    (m.processos || []).forEach(p => ['nomEs', 'dEs'].forEach(c => { if (!p[c]) falten.push(`${nom}.processos.${p.id}.${c}`); }));
    if (m.sempreMotiu && !m.sempreMotiuEs) falten.push(nom + '.sempreMotiuEs');
    m.nodes.forEach(n => {
      if (!n.nomEs) falten.push(`${nom}.${n.id}.nomEs`);
      if (n.d && !n.dEs) falten.push(`${nom}.${n.id}.dEs`);
    });
    m.parells.forEach((p, i) => {
      if (!p[6]) falten.push(`${nom}.parell[${i}] sense el què en castellà`);
      if (!p[7]) falten.push(`${nom}.parell[${i}] sense el què de tornada en castellà`);
    });
  });
  if (falten.length) bad(`${falten.length} text(s) del mapa sense castellà: ${falten.slice(0, 6).join(', ')}`
    + (falten.length > 6 ? ` … (+${falten.length - 6})` : '')
    + ' — el dibuix es llegiria en una llengua enmig d\'una pàgina en l\'altra, sense petar');
  else ok(`els ${CELLER.nodes.length + XARXA.nodes.length} nodes i els `
    + `${(CELLER.parells.length + XARXA.parells.length) * 2} lliuraments dels dos mapes, en les dues llengües`);
}

/* ══ LA SEQÜÈNCIA · que el dibuix no ensenyi un ordre incomplet ══════════════
   «Validar el mapa seqüenciant transaccions» és la passa 4, i el que la fa
   comprovable és que **tot lliurament sàpiga quan passa**. Un mapa amb la
   meitat de les fletxes sense ordre dibuixa una seqüència que sembla sencera i
   en deixa fora el que més costaria de veure — i es llegeix igual de bé.

   Quatre regles, i cada una perquè ja es podia trencar en silenci:

   1. **O té `[procés, pas]`, o té `sempre`.** Sense cap de les dues, el
      lliurament cau al final del pols sense dir-ho.
   2. **`sempre` només per a un intangible.** Un tangible que «passa tot el
      temps» és un tangible que ningú ha seqüenciat; i la frase que es ven —que
      els intangibles no entren a cap diagrama de procés— deixaria de ser certa.
   3. **Cap procés amb un sol pas, i cap pas repetit.** Un procés d'un pas no és
      un procés, i dos lliuraments amb el mateix número es dibuixarien alhora.
   4. **Els passos van d'1 a N, sense forats.** Un salt del 3 al 5 fa que el
      recorregut s'aturi un temps sense res i sembli espatllat. */
[['CELLER', CELLER], ['XARXA', XARXA]].concat(Object.entries(DINS).map(([k, v]) => ['DINS.' + k, v]))
  .forEach(([nom, m]) => {
    const fl = m.parells.flatMap(p => [
      { de: p[0], a: p[1], mena: p[2], seq: p[8] || null },
      { de: p[1], a: p[0], mena: p[4], seq: p[9] || null }
    ]);
    const pr = (m.processos || []).map(p => p.id);
    if (!pr.length) {
      /* Un mapa sense processos declarats no té seqüència i això és legítim:
         el que no és legítim és declarar-ne a mitges. */
      if (fl.some(x => x.seq)) bad(`${nom}: hi ha lliuraments amb ordre i el mapa no declara cap procés`);
      else ok(`${nom}: sense seqüència declarada, i cap lliurament se l'inventa`);
      return;
    }
    const li = [];
    const sense = fl.filter(x => !x.seq);
    if (sense.length) li.push(`${pl(sense.length, 'lliurament', 'lliuraments')} sense dir quan passa `
      + `(${sense.slice(0, 3).map(x => x.de + '→' + x.a).join(', ')})`);
    const mal = fl.filter(x => x.seq === 'sempre' && x.mena !== 'intangible');
    if (mal.length) li.push(`${pl(mal.length, 'tangible', 'tangibles')} marcats «sempre»: `
      + mal.map(x => x.de + '→' + x.a).join(', ') + ' — un tangible que passa tot el temps és un tangible sense seqüenciar');
    if (fl.some(x => x.seq === 'sempre') && !m.sempreMotiu) li.push('hi ha lliuraments «sempre» i el mapa no diu per què');
    const orfes = fl.filter(x => Array.isArray(x.seq) && !pr.includes(x.seq[0]));
    if (orfes.length) li.push(`${pl(orfes.length, 'lliurament', 'lliuraments')} en un procés que no existeix: `
      + [...new Set(orfes.map(x => x.seq[0]))].join(', '));
    pr.forEach(id => {
      const seus = fl.filter(x => Array.isArray(x.seq) && x.seq[0] === id).map(x => x.seq[1]).sort((a, b) => a - b);
      if (seus.length < 2) { li.push(`el procés «${id}» té ${seus.length} pas: no és un procés`); return; }
      const rep = seus.filter((v, i) => seus.indexOf(v) !== i);
      if (rep.length) li.push(`el procés «${id}» repeteix el pas ${[...new Set(rep)].join(', ')}`);
      const esperat = seus.map((_, i) => i + 1).join(',');
      if (seus.join(',') !== esperat) li.push(`el procés «${id}» no va d'1 a ${seus.length}: ${seus.join(',')}`);
    });
    if (li.length) bad(`la seqüència de ${nom}: ` + li.join(' · '));
    else ok(`${nom}: ${pr.length} procés(os) i els ${fl.length} lliuraments saben quan passen `
      + `(${fl.filter(x => x.seq === 'sempre').length} «sempre», amb el motiu escrit)`);
  });

/* ══ EL ZOOM · el sostre és del mètode, no una preferència ═══════════════════
   *«Entre 8 i 10 rols per a un mapa. A mà, per sobre de 12 rols i 50
   transaccions ja no es maneja»* — i això val per a **cada nivell**, no per al
   total. Un nivell que en passi no es llegeix a una sala, i a la sala és on
   s'ha de llegir: el que cal no és una pantalla més gran, és partir-lo.

   I dues coses que no es veuen mirant la pantalla: que el node que s'obre
   existeixi, i que el mapa de dins no es pengi d'ell mateix. */
{
  const li = [];
  const SOSTRE = 12;
  [['el celler', CELLER]].concat(Object.entries(DINS).map(([k, v]) => ['el mapa de ' + k, v]))
    .forEach(([nom, m]) => {
      if (m.nodes.length > SOSTRE) li.push(`${nom} té ${m.nodes.length} rols i el sostre del mètode és ${SOSTRE}`);
      if (m.nodes.length < 2) li.push(`${nom} té ${m.nodes.length} rol: no és un mapa`);
    });
  Object.keys(DINS).forEach(id => {
    if (!nodeDe(id)) li.push(`s'obre «${id}», que no és cap node del celler`);
    const m = DINS[id];
    if (m.nodes.some(n => n.id === id)) li.push(`el mapa de «${id}» conté un node amb el seu propi nom: el zoom es penjaria d'ell mateix`);
    const ids = m.nodes.map(n => n.id);
    const fora = m.parells.flatMap(p => [p[0], p[1]]).filter(x => !ids.includes(x));
    if (fora.length) li.push(`el mapa de «${id}» lliura cap a ${[...new Set(fora)].join(', ')}, que no hi són`);
    const toca = new Set(m.parells.flatMap(p => [p[0], p[1]]));
    const sols = ids.filter(x => !toca.has(x));
    if (sols.length) li.push(`al mapa de «${id}» hi ha ${pl(sols.length, 'rol solt', 'rols solts')}: ${sols.join(', ')}`);
    if (!m.parells.some(p => p[2] === 'intangible' || p[4] === 'intangible'))
      li.push(`el mapa de «${id}» no té cap intangible: deixa de ser un VNA`);
  });
  if (li.length) bad('el zoom: ' + li.join(' · '));
  else ok(`el zoom: ${Object.keys(DINS).length} nodes s'obren, cap nivell per sobre de ${SOSTRE} rols `
    + 'i tots amb les dues menes');
}

if (CHECK) {
  if (vells.length) bad('blocs desactualitzats: ' + vells.join(', ') + ' — torna a executar build-mapavalor.js');
  else ok('els blocs i els diccionaris són al dia');
} else if (escrits) {
  Object.entries(cache).forEach(([f, t]) => writeFileSync(f, t));
}

console.log(fails ? '\n❌ El mapa de valor no quadra.'
  : `\n✅ Mapa de valor · ${CELLER.nodes.length} nodes, ${cTot.n} transaccions (${cTot.i} intangibles), ` +
    `${PROCES.length} passos i ${ENTREGABLES.length} entregables` + (CHECK ? '.' : ` · ${escrits} bloc(s) escrits.`));
process.exit(fails ? 1 : 0);
