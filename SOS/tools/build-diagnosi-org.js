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
   Sis, i l'ordre és el de com sovint es demana. `preguntes` diu quin bloc
   s'obre: `format` per al que és un acte amb data i aforament, `dolor` per al
   que és una manera de treballar que no se sosté.

   `diu` és com ho diria qui truca, no com ho diem nosaltres. Un director de
   persones no demana «una intervenció de desenvolupament organitzatiu»: demana
   que l'equip deixi de dependre de dues persones. */
const OBJECTIUS = [
  {
    id: 'obrir', ic: '🎬', c: 'orange', preguntes: 'format',
    t: 'Obrir una jornada amb alguna cosa que es recordi',
    tEs: 'Abrir una jornada con algo que se recuerde',
    diu: 'Tenim una convenció, un kick-off o una entrega de premis i volem que comenci amb alguna cosa que no sigui una presentació.',
    diuEs: 'Tenemos una convención, un kick-off o una entrega de premios y queremos que empiece con algo que no sea una presentación.',
    paquets: ['demos', 'fent-pinya'],
    llegim: 'Això és un acte amb data, aforament i espai. El que decideix la proposta no és el vostre equip: és quanta gent hi haurà, quan i on.',
    llegimEs: 'Esto es un acto con fecha, aforo y espacio. Lo que decide la propuesta no es vuestro equipo: es cuánta gente habrá, cuándo y dónde.'
  },
  {
    id: 'cohesio', ic: '🤝', c: 'green', preguntes: 'format',
    t: 'Cohesionar un equip que s\'ha trencat o que no s\'ha fet mai',
    tEs: 'Cohesionar un equipo que se ha roto o que no se ha hecho nunca',
    diu: 'L\'equip ha crescut de cop, o s\'ha fusionat amb un altre, o fa temps que es treballa sense veure\'s.',
    diuEs: 'El equipo ha crecido de golpe, o se ha fusionado con otro, o hace tiempo que se trabaja sin verse.',
    paquets: ['fent-pinya', 'fent-pinya-vna', 'formacio-equips'],
    llegim: 'Un castell és la prova més antiga que el pes o es reparteix o no s\'aguanta, i es viu amb el cos en dues hores. Després cal decidir si allò es queda en un bon dia o es converteix en una manera de treballar.',
    llegimEs: 'Un castell es la prueba más antigua de que el peso o se reparte o no se aguanta, y se vive con el cuerpo en dos horas. Después hay que decidir si aquello se queda en un buen día o se convierte en una manera de trabajar.'
  },
  {
    id: 'mapa', ic: '🕸️', c: 'indigo', preguntes: 'dolor',
    t: 'Entendre com flueix el valor i de qui depenem de debò',
    tEs: 'Entender cómo fluye el valor y de quién dependemos de verdad',
    diu: 'Sabem qui hi ha a l\'organigrama i no sabem qui sosté què. Quan marxa algú, ens n\'adonem del que feia.',
    diuEs: 'Sabemos quién hay en el organigrama y no sabemos quién sostiene qué. Cuando se va alguien, nos damos cuenta de lo que hacía.',
    /* `fent-pinya-vna` hi va i va primer: és el mateix mapa, entregat amb la
       jornada que fa que l'equip s'alineï dient en veu alta quina és la seva
       organització real. Qui ve per aquest objectiu i té equip per moure és
       justament qui el compra. */
    paquets: ['fent-pinya-vna', 'mapa-organitzacio', 'persones-cultura'],
    llegim: 'El mapa de valor ensenya els intercanvis que no són a cap procés —els favors, el criteri, la confiança— i on es concentren. És el que es ven aquí i el que fa possible tota la resta.',
    llegimEs: 'El mapa de valor enseña los intercambios que no están en ningún proceso —los favores, el criterio, la confianza— y dónde se concentran. Es lo que se vende aquí y lo que hace posible todo lo demás.',
    despres: ['fluxos-ia', 'web-ia']
  },
  {
    id: 'sostenir', ic: '🧱', c: 'blue', preguntes: 'dolor',
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
    id: 'direccio', ic: '🧭', c: 'purple', preguntes: 'dolor',
    t: 'Acompanyar la direcció en una decisió que costa',
    tEs: 'Acompañar a la dirección en una decisión que cuesta',
    diu: 'Hi ha una decisió sobre la taula —una reorganització, un relleu, una fusió— i falta una mirada de fora que no vingui a vendre res.',
    diuEs: 'Hay una decisión sobre la mesa —una reorganización, un relevo, una fusión— y falta una mirada de fuera que no venga a vender nada.',
    paquets: ['mentoria-directiva', 'persones-cultura'],
    llegim: 'Aquí no s\'entrega un taller: s\'entren sessions amb qui decideix, amb el mapa a la mà i sense públic.',
    llegimEs: 'Aquí no se entrega un taller: se entran sesiones con quien decide, con el mapa en la mano y sin público.'
  },
  {
    id: 'produir', ic: '🎪', c: 'orange', preguntes: 'format',
    t: 'Produir un esdeveniment sencer',
    tEs: 'Producir un evento entero',
    diu: 'No volem una activitat dins d\'un programa: volem que algú ens porti la jornada de cap a peus.',
    diuEs: 'No queremos una actividad dentro de un programa: queremos que alguien nos lleve la jornada de principio a fin.',
    paquets: ['produccio', 'demos'],
    llegim: 'Producció vol dir guió, proveïdors, permisos i gent a peu de carrer. Es cotitza a mida perquè no hi ha dues jornades iguals.',
    llegimEs: 'Producción quiere decir guion, proveedores, permisos y gente a pie de calle. Se cotiza a medida porque no hay dos jornadas iguales.',
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
  /* Sense `data-i18n`: els sis botons els torna a escriure la pàgina des de
     `OBJECTIUS`, que ja porta les dues llengües. Una clau de diccionari aquí
     voldria dir el mateix títol declarat dues vegades —al botó i al resultat—
     i el dia que es canviés un, l'altre diria una altra cosa. */
  return OBJECTIUS.map(o =>
    `<button type="button" class="opt" data-v="${o.id}" data-preg="${o.preguntes}" style="--c:var(--${o.c})">` +
    `<span class="o-t">${o.ic} ${esc(o.t)}</span>` +
    `<span class="o-d">${esc(o.diu)}</span></button>`
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
  return `// Generat per SOS/tools/build-diagnosi-org.js — no ho editis a mà.
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
  const venibles = PAQUETS.filter(p => p.sector === 'privat' || p.sector === 'tots');
  const sols = venibles.filter(p => !arriben.has(p.id));
  if (sols.length) bad('paquets que es venen a organitzacions i cap objectiu no hi porta: '
    + sols.map(p => p.id).join(', '));
  else ok(`${pl(venibles.length, 'paquet venible', 'paquets venibles')} a organitzacions, tots amb una porta`);
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

module.exports = { OBJECTIUS, ORGS_NOTA };
