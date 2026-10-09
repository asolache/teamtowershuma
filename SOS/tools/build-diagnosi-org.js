#!/usr/bin/env node
/* El diagnòstic d'organització · què vols que passi
 * ─────────────────────────────────────────────────────────────────────────────
 * El diagnòstic del territori gira sobre **qui ets**: `PROFILES` està indexat
 * pel tipus d'organització, i d'allà en surten itinerari, durada i subvencions.
 * Per a una empresa això no discrimina res —una cooperativa de vint persones i
 * una multinacional poden voler exactament el mateix taller.
 *
 * **El que decideix la proposta és què vols que passi.** Per això aquí l'eix és
 * l'objectiu i el tipus d'organització només canvia les preguntes que s'obren.
 *
 * ── Per què es genera ───────────────────────────────────────────────────────
 * Perquè cada objectiu apunta a paquets del catàleg **pels seus ids**, i
 * escriure'ls a mà a l'HTML seria mantenir una segona llista del que es ven. El
 * dia que un paquet canviï d'id o desaparegui, l'objectiu deixaria de recomanar
 * res **i no petaria**: seguiria tornant una proposta, només que més curta. És
 * el mateix defecte silenciós que `check-formularis.js` ja caça al pressupost.
 *
 * Els ids surten de `build-oferta.js`, que és l'única font del que es ven.
 *
 * ── La regla que ordena el formulari ────────────────────────────────────────
 * **No es pregunta res que no canviï la resposta.** El diagnòstic del territori
 * recull població, termini, pressupost, rol i repte i no en fa servir cap per
 * calcular: viatgen al resum i prou. Aquí cada pregunta ha de moure alguna
 * cosa, i per això cada objectiu declara quin bloc de preguntes obre —`format`
 * o `dolor`— i cap no obre els dos.
 *
 * ── Ús ──────────────────────────────────────────────────────────────────────
 *   node SOS/tools/build-diagnosi-org.js            escriu els blocs
 *   node SOS/tools/build-diagnosi-org.js --check    falla si està vell o incoherent
 */
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const { PAQUETS, SOS_PAQUETS } = require('./build-oferta.js');

const SOS = join(__dirname, '..');
const CHECK = process.argv.includes('--check');
const PAG = join(SOS, 'diagnostic-org.html');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

const CATALEG = PAQUETS.concat(SOS_PAQUETS);
const perId = id => CATALEG.find(p => p.id === id) || null;

/* ══ ELS OBJECTIUS ═══════════════════════════════════════════════════════════
   L'ordre és el de l'embut (`build-embut.js`), no el de com es demanava abans:
   primer **el negoci operatiu**, que és el que ara ven la casa i la porta de
   client de `/sos/`, i després l'equip i les jornades, que segueixen al
   catàleg i hi segueixen tenint porta.

   Fins al 09/10/2026 eren sis i quatre parlaven d'actes i d'equip: qui venia
   per la web, pels fluxos amb IA o pels acords d'una cooperativa no trobava la
   seva casella i triava la que menys li mentia. Ara hi ha una casella per a
   cada peça de «El teu negoci operatiu» —mapa, web de xarxa, fluxos i
   registre d'acords— i les ganxos van als paquets del catàleg, sense preu.

   `grup` diu sota quin titular surt. `preguntes` diu quin bloc s'obre: `format`
   per al que és un acte amb data i aforament, `dolor` per al que és una manera
   de treballar que no se sosté.

   `diu` és com ho diria qui truca, no com ho diem nosaltres. Un director de
   persones no demana «una intervenció de desenvolupament organitzatiu»: demana
   que l'equip deixi de dependre de dues persones. I una botiga no demana «una
   web de xarxa»: diu que li demanen la fitxa per missatge cada setmana. */
const GRUPS = {
  operatiu: { t: 'El teu negoci operatiu', tEs: 'Tu negocio operativo' },
  equip: { t: 'L\'equip i les jornades', tEs: 'El equipo y las jornadas' }
};

const OBJECTIUS = [
  {
    id: 'operatiu', grup: 'operatiu', ic: '⚙️', c: 'indigo', preguntes: 'dolor',
    t: 'Que el negoci funcioni cada dia com l\'hem pensat',
    tEs: 'Que el negocio funcione cada día como lo hemos pensado',
    diu: 'Sabem com hauria de funcionar i no és com funciona. No volem un altre informe al calaix: volem veure qui lliura què, on s\'encalla i que ens avisi.',
    diuEs: 'Sabemos cómo debería funcionar y no es como funciona. No queremos otro informe en el cajón: queremos ver quién entrega qué, dónde se atasca y que nos avise.',
    /* El paquet sencer de la porta de client: el mapa real i l'ideal, els
       fluxos que es treuen de sobre i la web de xarxa. El preu es pressuposta
       per fluxos i no surt aquí. */
    paquets: ['mapa-organitzacio', 'fluxos-ia', 'web-ia'],
    llegim: 'És el que fem ara: el mapa real i l\'ideal de la vostra xarxa, un cervell per rol que es queda al vostre repositori, la web de xarxa i les eines de cada rol connectades. Comença amb un esborrany gratuït del mapa fet amb el que ja teniu, i es pressuposta per fluxos.',
    llegimEs: 'Es lo que hacemos ahora: el mapa real y el ideal de vuestra red, un cerebro por rol que se queda en vuestro repositorio, la web de red y las herramientas de cada rol conectadas. Empieza con un borrador gratuito del mapa hecho con lo que ya tenéis, y se presupuesta por flujos.',
    despres: ['ia-amb-frens']
  },
  {
    id: 'web', grup: 'operatiu', ic: '🌐', c: 'blue', preguntes: 'dolor',
    t: 'Una web per a tota la xarxa, no només per a qui compra',
    tEs: 'Una web para toda la red, no solo para quien compra',
    diu: 'Les botigues ens demanen la fitxa per missatge, qui ens recomana no té res per reenviar i els proveïdors no saben què busquem. La web només parla amb qui compra.',
    diuEs: 'Las tiendas nos piden la ficha por mensaje, quien nos recomienda no tiene nada que reenviar y los proveedores no saben qué buscamos. La web solo habla con quien compra.',
    paquets: ['web-ia', 'mapa-organitzacio'],
    llegim: 'Primer el mapa i després la web: cada rol del mapa hi té una porta, cada intercanvi tangible una acció i cada intangible el contingut que dona confiança. És HTML estàndard del W3C, al vostre GitHub i publicat a Netlify, i el repositori és la memòria de la casa. Sense quota i sense dependre de nosaltres.',
    llegimEs: 'Primero el mapa y después la web: cada rol del mapa tiene una puerta, cada intercambio tangible una acción y cada intangible el contenido que da confianza. Es HTML estándar del W3C, en vuestro GitHub y publicado en Netlify, y el repositorio es la memoria de la casa. Sin cuota y sin depender de nosotros.',
    despres: ['fluxos-ia']
  },
  {
    id: 'fluxos', grup: 'operatiu', ic: '🤖', c: 'green', preguntes: 'dolor',
    t: 'Treure\'ns de sobre la feina que es repeteix, sense perdre el criteri',
    tEs: 'Quitarnos de encima el trabajo que se repite, sin perder el criterio',
    diu: 'Cada setmana fem a mà la mateixa feina, i no sabem què podem posar en mans d\'una IA sense que s\'equivoqui en el que importa.',
    diuEs: 'Cada semana hacemos a mano el mismo trabajo, y no sabemos qué podemos poner en manos de una IA sin que se equivoque en lo que importa.',
    paquets: ['fluxos-ia', 'ia-amb-frens'],
    llegim: 'Es marca cada flux: el que es repeteix igual s\'automatitza, el que porta criteri es queda en mans de persones i l\'intangible s\'escriu. Cada flux porta el cost de la seva IA, amb el model que toca a cada tasca: el petit on n\'hi ha prou i el gran només on cal.',
    llegimEs: 'Se marca cada flujo: lo que se repite igual se automatiza, lo que lleva criterio se queda en manos de personas y lo intangible se escribe. Cada flujo lleva el coste de su IA, con el modelo que toca a cada tarea: el pequeño donde basta y el grande solo donde hace falta.',
    despres: ['web-ia']
  },
  {
    id: 'mapa', grup: 'operatiu', ic: '🕸️', c: 'indigo', preguntes: 'dolor',
    t: 'Entendre com flueix el valor i de qui depenem de debò',
    tEs: 'Entender cómo fluye el valor y de quién dependemos de verdad',
    diu: 'Sabem qui hi ha a l\'organigrama i no sabem qui sosté què. Quan marxa algú, ens n\'adonem del que feia.',
    diuEs: 'Sabemos quién hay en el organigrama y no sabemos quién sostiene qué. Cuando se va alguien, nos damos cuenta de lo que hacía.',
    /* `fent-pinya-vna` hi va i va primer: és el mateix mapa, entregat amb la
       jornada que fa que l'equip s'alineï dient en veu alta quina és la seva
       organització real. Qui ve per aquest objectiu i té equip per moure és
       justament qui el compra. */
    paquets: ['fent-pinya-vna', 'mapa-organitzacio', 'persones-cultura'],
    llegim: 'El mapa de valor ensenya els intercanvis que no són a cap procés —els favors, el criteri, la confiança— i on es concentren. És el primer pas del negoci operatiu i el que fa possible tota la resta.',
    llegimEs: 'El mapa de valor enseña los intercambios que no están en ningún proceso —los favores, el criterio, la confianza— y dónde se concentran. Es el primer paso del negocio operativo y lo que hace posible todo lo demás.',
    despres: ['fluxos-ia', 'web-ia']
  },
  {
    id: 'acords', grup: 'operatiu', ic: '🔗', c: 'purple', preguntes: 'dolor',
    t: 'Que el que aporta cadascú quedi registrat i sigui de tots',
    tEs: 'Que lo que aporta cada uno quede registrado y sea de todos',
    diu: 'Som una cooperativa, una xarxa o un projecte amb socis. El que aporta cadascú —hores, coneixement, contactes— no consta enlloc, o consta en una plataforma que no és nostra.',
    diuEs: 'Somos una cooperativa, una red o un proyecto con socios. Lo que aporta cada uno —horas, conocimiento, contactos— no consta en ningún sitio, o consta en una plataforma que no es nuestra.',
    /* La porta del web3. Es ven l'estudi i no l'eina: els contractes
       intel·ligents encara no estan construïts al SOS, i el paquet ho diu. */
    paquets: ['contractes', 'mapa-organitzacio'],
    llegim: 'El mapa diu què aporta cada rol, tangible i intangible; el registre ho apunta i les dades es queden a casa vostra, no en una plataforma. Si els acords s\'han d\'executar sols —contractes intel·ligents sobre Ethereum o xarxes semblants—, primer es fa l\'estudi de viabilitat: diem si val la pena abans de construir res.',
    llegimEs: 'El mapa dice qué aporta cada rol, tangible e intangible; el registro lo apunta y los datos se quedan en vuestra casa, no en una plataforma. Si los acuerdos tienen que ejecutarse solos —contratos inteligentes sobre Ethereum o redes similares—, primero se hace el estudio de viabilidad: decimos si vale la pena antes de construir nada.',
    despres: ['web-ia']
  },
  {
    id: 'sostenir', grup: 'equip', ic: '🧱', c: 'blue', preguntes: 'dolor',
    t: 'Que l\'equip sostingui el que hem muntat quan marxem',
    tEs: 'Que el equipo sostenga lo que hemos montado cuando nos vayamos',
    diu: 'Hem fet projectes que funcionaven mentre hi era qui els portava. Volem que el següent no depengui d\'una persona.',
    diuEs: 'Hemos hecho proyectos que funcionaban mientras estaba quien los llevaba. Queremos que el siguiente no dependa de una persona.',
    paquets: ['comunitats-practica', 'formacio-equips', 'equip-gestor'],
    llegim: 'Sostenir una manera de treballar és un ofici i s\'aprèn fent-ho sobre el vostre cas. El quart pas del mètode és que marxem, i això només és honest si abans s\'ha format qui es queda.',
    llegimEs: 'Sostener una manera de trabajar es un oficio y se aprende haciéndolo sobre vuestro caso. El cuarto paso del método es que nos vamos, y eso solo es honesto si antes se ha formado a quien se queda.',
    /* Formar formadors és el pas d'després d'aquest i no un objectiu propi:
       ningú truca demanant-ho sense haver sostingut abans alguna cosa. */
    despres: ['formar-formadors']
  },
  {
    id: 'direccio', grup: 'equip', ic: '🧭', c: 'purple', preguntes: 'dolor',
    t: 'Acompanyar la direcció en una decisió que costa',
    tEs: 'Acompañar a la dirección en una decisión que cuesta',
    diu: 'Hi ha una decisió sobre la taula —una reorganització, un relleu, una fusió— i falta una mirada de fora que no vingui a vendre res.',
    diuEs: 'Hay una decisión sobre la mesa —una reorganización, un relevo, una fusión— y falta una mirada de fuera que no venga a vender nada.',
    paquets: ['mentoria-directiva', 'persones-cultura'],
    llegim: 'Aquí no s\'entrega un taller: s\'entren sessions amb qui decideix, amb el mapa a la mà i sense públic.',
    llegimEs: 'Aquí no se entrega un taller: se entran sesiones con quien decide, con el mapa en la mano y sin público.'
  },
  {
    id: 'cohesio', grup: 'equip', ic: '🤝', c: 'green', preguntes: 'format',
    t: 'Cohesionar un equip que s\'ha trencat o que no s\'ha fet mai',
    tEs: 'Cohesionar un equipo que se ha roto o que no se ha hecho nunca',
    diu: 'L\'equip ha crescut de cop, o s\'ha fusionat amb un altre, o fa temps que es treballa sense veure\'s.',
    diuEs: 'El equipo ha crecido de golpe, o se ha fusionado con otro, o hace tiempo que se trabaja sin verse.',
    paquets: ['fent-pinya', 'fent-pinya-vna', 'formacio-equips'],
    llegim: 'Un castell és la prova més antiga que el pes o es reparteix o no s\'aguanta, i es viu amb el cos en dues hores. Després cal decidir si allò es queda en un bon dia o es converteix en una manera de treballar.',
    llegimEs: 'Un castell es la prueba más antigua de que el peso o se reparte o no se aguanta, y se vive con el cuerpo en dos horas. Después hay que decidir si aquello se queda en un buen día o se convierte en una manera de trabajar.'
  },
  {
    /* Abans eren dues caselles, «obrir una jornada» i «produir un esdeveniment
       sencer». Es pregunten igual —quanta gent, quan i on— i les dues porten
       a la mateixa família del catàleg, així que ara és una. L'id es queda
       `obrir` perquè és el que ja hi ha als leads del CRM. */
    id: 'obrir', grup: 'equip', ic: '🎪', c: 'orange', preguntes: 'format',
    t: 'Un acte que es recordi, o la jornada sencera',
    tEs: 'Un acto que se recuerde, o la jornada entera',
    diu: 'Tenim una convenció, un kick-off o una entrega de premis i volem que comenci amb alguna cosa que no sigui una presentació, o que algú ens porti la jornada de cap a peus.',
    diuEs: 'Tenemos una convención, un kick-off o una entrega de premios y queremos que empiece con algo que no sea una presentación, o que alguien nos lleve la jornada de principio a fin.',
    paquets: ['demos', 'fent-pinya', 'produccio'],
    llegim: 'Això és un acte amb data, aforament i espai. El que decideix la proposta no és el vostre equip: és quanta gent hi haurà, quan i on. Si la porteu sencera, vol dir guió, proveïdors i permisos, i es cotitza a mida.',
    llegimEs: 'Esto es un acto con fecha, aforo y espacio. Lo que decide la propuesta no es vuestro equipo: es cuánta gente habrá, cuándo y dónde. Si la llevamos entera, quiere decir guion, proveedores y permisos, y se cotiza a medida.',
    /* El transmèdia penja d'aquí perquè és el que passa quan una jornada vol
       deixar rastre: història, personatges i registre en comptes de fotos. */
    despres: ['transmedia']
  }
];

/* ══ QUÈ CANVIA EL TIPUS D'ORGANITZACIÓ ══════════════════════════════════════
   No canvia el que es recomana —això ho fa l'objectiu—: canvia **què cal
   preguntar abans de poder respondre**, i què s'ha de dir a la proposta.

   El cas que no existia és `agencia`: una agència o un DMC **no decideix, revèn**.
   El catàleg castellers del 2026 està escrit per a elles i el formulari d'avui
   no en tenia ni la casella, així que triaven «cooperativa o empresa» i el
   diagnòstic els parlava de relleu i de governança. */
const ORGS_NOTA = {
  agencia: {
    t: 'Com que ho compres per a un client teu, la proposta surt amb els idiomes, l\'aforament i l\'espai que necessites per passar-la-hi, i sense res que hagis de traduir.',
    es: 'Como lo compras para un cliente tuyo, la propuesta sale con los idiomas, el aforo y el espacio que necesitas para pasársela, y sin nada que tengas que traducir.'
  },
  gran: {
    t: 'Amb departament de formació, el que sol caldre és que això encaixi amb un pla anual i que es pugui mesurar. Es diu què s\'endú cada persona i què en queda escrit.',
    es: 'Con departamento de formación, lo que suele hacer falta es que esto encaje con un plan anual y que se pueda medir. Se dice qué se lleva cada persona y qué queda por escrito.'
  },
  pime: {
    t: 'Decideix qui dirigeix, i sol ser qui menys temps té. La proposta va al gra: què passa, quant dura i què canvia després.',
    es: 'Decide quien dirige, y suele ser quien menos tiempo tiene. La propuesta va al grano: qué pasa, cuánto dura y qué cambia después.'
  },
  cooperativa: {
    t: 'A una cooperativa el mapa de valor sol destapar el que ja se sospita: que la propietat i la feina no coincideixen. Es pot mirar, i no s\'ha de mirar el primer dia.',
    es: 'En una cooperativa el mapa de valor suele destapar lo que ya se sospecha: que la propiedad y el trabajo no coinciden. Se puede mirar, y no hay que mirarlo el primer día.'
  },
  escola: {
    t: 'Per a un programa o un claustre, això entra com a mòdul amb els seus objectius d\'aprenentatge i la seva avaluació.',
    es: 'Para un programa o un claustro, esto entra como módulo con sus objetivos de aprendizaje y su evaluación.'
  },
  fundacio: {
    t: 'Qui finança sol voler saber què en surt i com es mesura. La proposta inclou què queda per escrit i qui ho pot comprovar.',
    es: 'Quien financia suele querer saber qué sale de ello y cómo se mide. La propuesta incluye qué queda por escrito y quién lo puede comprobar.'
  }
};

/* ══ ELS BLOCS ═══════════════════════════════════════════════════════════════ */
function blocObjectius() {
  /* Sense `data-i18n`: els botons i els titulars els torna a escriure la
     pàgina des de `OBJECTIUS` i `GRUPS`, que ja porten les dues llengües. Una
     clau de diccionari aquí voldria dir el mateix títol declarat dues vegades
     —al botó i al resultat— i el dia que es canviés un, l'altre diria una
     altra cosa. */
  return Object.keys(GRUPS).map(g =>
    `<p class="opts-g" data-g="${g}">${esc(GRUPS[g].t)}</p>\n` +
    OBJECTIUS.filter(o => o.grup === g).map(o =>
      `<button type="button" class="opt" data-v="${o.id}" data-preg="${o.preguntes}" style="--c:var(--${o.c})">` +
      `<span class="o-t">${o.ic} ${esc(o.t)}</span>` +
      `<span class="o-d">${esc(o.diu)}</span></button>`
    ).join('\n')
  ).join('\n');
}

/* ── Les dues llengües, al costat ─────────────────────────────────────────
   Cada camp de text porta el seu germà `*Es`. Va així i no amb dos objectes
   `{ca:{…},es:{…}}` perquè el que la pàgina indexa és l'objectiu (`OBJECTIUS
   [st.obj]`), i partir-ho en dos voldria dir indexar dues vegades i poder
   quedar-se amb una estructura a mitges. El del catàleg surt dels camps `*Es`
   de `build-oferta.js`, que és qui declara què es ven i en quines llengües. */
function blocDades() {
  const q = s => String(s == null ? '' : s).replace(/'/g, "\\'");
  const objs = OBJECTIUS.map(o => `'${o.id}':{ic:'${o.ic}',t:'${q(o.t)}',tEs:'${q(o.tEs)}',preg:'${o.preguntes}',` +
    /* `diu` és com ho diria qui truca. Va al resultat sota el títol quan no
       ha escrit res al camp lliure: el diagnòstic ha de començar tornant-li
       el que ens ha dit, i no repetint el titular. */
    `diu:'${q(o.diu)}',diuEs:'${q(o.diuEs)}',` +
    `paq:[${o.paquets.map(p => `'${p}'`).join(',')}],` +
    (o.despres ? `despres:[${o.despres.map(p => `'${p}'`).join(',')}],` : '') +
    `llegim:'${q(o.llegim)}',llegimEs:'${q(o.llegimEs)}'}`).join(',\n  ');
  const paqs = CATALEG.filter(p => OBJECTIUS.some(o => (o.paquets.concat(o.despres || [])).includes(p.id)))
    .map(p => `'${p.id}':{nom:'${q(p.nom)}',nomEs:'${q(p.nomEs || p.nom)}',` +
      `dura:'${q(p.dura)}',duraEs:'${q(p.duraEs || p.dura)}',` +
      `endus:'${q(p.endus)}',endusEs:'${q(p.endusEs || p.endus)}'}`).join(',\n  ');
  const notes = Object.keys(ORGS_NOTA).map(k =>
    `'${k}':{t:'${q(ORGS_NOTA[k].t)}',tEs:'${q(ORGS_NOTA[k].es)}'}`).join(',\n  ');
  const grups = Object.keys(GRUPS).map(g => `'${g}':{t:'${q(GRUPS[g].t)}',tEs:'${q(GRUPS[g].tEs)}'}`).join(',');
  return `// Generat per SOS/tools/build-diagnosi-org.js — no ho editis a mà.
const GRUPS={${grups}};
const OBJECTIUS={
  ${objs}
};
/* Nom, durada i què t'endús de cada paquet, copiats del catàleg pel generador.
   Sense preu a posta: aquest diagnòstic no en diu cap i el preu es parla. */
const PAQ={
  ${paqs}
};
const ORG_NOTA={
  ${notes}
};`;
}

/* ══ ESCRIURE O COMPROVAR ════════════════════════════════════════════════════ */
const MARQUES = [
  ['<!--DX-OBJECTIUS-->', '<!--/DX-OBJECTIUS-->', blocObjectius],
  ['/*DX-DADES*/', '/*/DX-DADES*/', blocDades]
];

/* ── Les guardes ─────────────────────────────────────────────────────────── */

// 1 · LA QUE IMPORTA · cap objectiu que apunti a un paquet que no existeix.
(() => {
  const orfes = [];
  OBJECTIUS.forEach(o => (o.paquets.concat(o.despres || [])).forEach(id => {
    if (!perId(id)) orfes.push(o.id + ' → ' + id);
  }));
  if (orfes.length) bad('objectius que recomanen paquets inexistents: ' + orfes.join(', ')
    + ' — no peta, només deixa de recomanar en silenci');
  else ok(`${OBJECTIUS.length} objectius, tots cap a paquets del catàleg`);
})();

// 2 · Cap objectiu sense paquets: seria una porta cap a una paret.
(() => {
  const buits = OBJECTIUS.filter(o => !o.paquets.length);
  if (buits.length) bad('objectius sense cap paquet: ' + buits.map(o => o.id).join(', '));
  else ok('i cap objectiu es queda sense res a proposar');
})();

/* 3 · Cap paquet venible es queda sense porta. Si el venem a una organització,
       hi ha d'haver algun objectiu que hi porti; si no, és un paquet que només
       troba qui ja sap que existeix. */
(() => {
  const arriben = new Set(OBJECTIUS.flatMap(o => o.paquets.concat(o.despres || [])));
  /* `sector` és una llista des que el catàleg es va partir per a qui compra
     (`admin`, `tercer`, `empresa`). Aquesta guarda encara mirava `privat` i
     `tots`, que ja no existien, i per tant no comprovava res: passava verda
     amb qualsevol paquet sense porta. */
  const venibles = CATALEG.filter(p => [].concat(p.sector || []).includes('empresa'));
  const sols = venibles.filter(p => !arriben.has(p.id));
  if (sols.length) bad('paquets que es venen a organitzacions i cap objectiu no hi porta: '
    + sols.map(p => p.id).join(', '));
  else ok(`${pl(venibles.length, 'paquet venible', 'paquets venibles')} a organitzacions, tots amb una porta`);
})();

// 3b · Cada objectiu sota un titular que existeix, i cap titular buit.
(() => {
  const sense = OBJECTIUS.filter(o => !GRUPS[o.grup]).map(o => o.id);
  const buits = Object.keys(GRUPS).filter(g => !OBJECTIUS.some(o => o.grup === g));
  if (sense.length) bad('objectius sense titular: ' + sense.join(', '));
  else if (buits.length) bad('titulars sense cap objectiu: ' + buits.join(', '));
  else ok(`${Object.keys(GRUPS).length} titulars, el primer «${GRUPS[OBJECTIUS[0].grup].t}»`);
})();

/* 4 · Cada objectiu obre un bloc de preguntes i només un. Un formulari que ho
       pregunta tot no discrimina, i és exactament el defecte del diagnòstic del
       territori: recull cinc camps que després no fa servir per a res. */
(() => {
  const mal = OBJECTIUS.filter(o => ['format', 'dolor'].indexOf(o.preguntes) < 0);
  if (mal.length) bad('objectius amb un bloc de preguntes desconegut: ' + mal.map(o => o.id).join(', '));
  else {
    const f = OBJECTIUS.filter(o => o.preguntes === 'format').length;
    ok(`${f} objectius obren les preguntes de format i ${OBJECTIUS.length - f} les de dolor`);
  }
})();

/* 5 · Cada text, en les dues llengües. El diagnòstic era monolingüe i les
       claus `fo.*` dels blocs compartits hi eren sense cap diccionari que les
       llegís: el text es quedava en català i **no petava res**. Afegir un
       objectiu nou sense el seu `tEs` tornaria a fer exactament això —mitja
       pantalla en una llengua i mitja en l'altra— i tampoc petaria. */
(() => {
  const CAMPS = ['t', 'diu', 'llegim'];
  const falten = [];
  OBJECTIUS.forEach(o => CAMPS.forEach(c => {
    if (!o[c + 'Es']) falten.push(o.id + '.' + c + 'Es');
  }));
  Object.keys(ORGS_NOTA).forEach(k => { if (!ORGS_NOTA[k].es) falten.push('nota ' + k); });
  Object.keys(GRUPS).forEach(k => { if (!GRUPS[k].tEs) falten.push('titular ' + k); });
  if (falten.length) bad('text sense castellà: ' + falten.join(', ')
    + ' — el botó es llegiria en una llengua i el resultat en l\'altra, sense petar');
  else ok(`${OBJECTIUS.length} objectius i ${Object.keys(ORGS_NOTA).length} notes, en les dues llengües`);
})();

/* 6 · I els paquets que es recomanen, també. Els tradueix `build-oferta.js`,
       que és qui els declara; aquí només es comprova que els que arriben al
       diagnòstic els tinguin, perquè el que es pinta al resultat són aquests. */
(() => {
  const arriben = new Set(OBJECTIUS.flatMap(o => o.paquets.concat(o.despres || [])));
  const coixos = CATALEG.filter(p => arriben.has(p.id))
    .filter(p => !p.nomEs || (p.dura && !p.duraEs) || (p.endus && !p.endusEs))
    .map(p => p.id);
  if (coixos.length) bad('paquets recomanats sense castellà al catàleg: ' + coixos.join(', '));
  else ok(`i els ${arriben.size} paquets que es recomanen, amb el castellà del catàleg`);
})();

// 7 · Cap preu en aquest diagnòstic: el preu es parla, i el pont és el pressupost.
(() => {
  const cos = blocDades();
  if (/\d[\d.]*\s*€|preuM(in|ax)/.test(cos)) bad('el bloc generat porta xifres de preu: aquest diagnòstic no en diu cap');
  else ok('cap preu al bloc generat: la xifra es parla al pressupost');
})();

if (!existsSync(PAG)) {
  bad('no existeix ' + PAG.replace(SOS, 'SOS'));
} else if (!fails) {
  const src = readFileSync(PAG, 'utf8');
  let out = src;
  for (const [obre, tanca, fn] of MARQUES) {
    const i = out.indexOf(obre), j = out.indexOf(tanca);
    if (i < 0 || j < 0 || j < i) { bad('falta la marca ' + obre + ' a diagnostic-org.html'); continue; }
    out = out.slice(0, i + obre.length) + '\n' + fn() + '\n' + out.slice(j);
  }
  if (!fails) {
    if (CHECK) {
      if (out !== src) bad('diagnostic-org.html no correspon a la declaració de build-diagnosi-org.js');
      else ok('els blocs del diagnòstic d\'organització estan al dia');
    } else if (out !== src) writeFileSync(PAG, out);
  }
}

if (CHECK) {
  console.log(fails ? '\n❌ Arregla-ho amb:  node SOS/tools/build-diagnosi-org.js'
    : '\n✅ El diagnòstic d\'organització quadra.');
  process.exit(fails ? 1 : 0);
}
if (fails) { console.log('\n❌ No s\'ha escrit res.'); process.exit(1); }
console.log(`\n✅ diagnostic-org.html · ${OBJECTIUS.length} objectius i ${Object.keys(ORGS_NOTA).length} tipus d'organització`);

module.exports = { OBJECTIUS, GRUPS, ORGS_NOTA };
