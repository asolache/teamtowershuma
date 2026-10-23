#!/usr/bin/env node
/* =============================================================================
   El cas anònim d'un mapa que ja treballa sol (23/10/2026)

   Álvaro va triar ensenyar a /cliente/ el mapa d'una productora d'esdeveniments
   real, sense nom ni projectes interns, amb el que ja fa la IA o un programa i
   el que valida una persona. La font és una de sola: el mapa de valor privat
   de la xarxa i el seu catàleg d'operacions (repositori eventspenedes-tarifas,
   data/valor/mapas/ i data/operaciones.json), amb la mateixa regla que pinta el
   tauler de l'administrador (automatizacion() a tools/lib/valor.mjs). Aquí no
   es copia res a mà: s'agafa el que hi ha, es treu el que no pot sortir i es
   tradueix.

   Què no surt mai: el nom de la xarxa ni de cap partner (no hi són: només rols),
   els rols de projectes interns (ROLS_FORA), cap frase que en parli (FORA) i el
   que no passa el sedàs de la taxonomia universal (imports, noms vetats).

   Ús:
     node SOS/tools/build-cas-automatitzat.js          escriu SOS/lib/cas-automatitzat.js
     node SOS/tools/build-cas-automatitzat.js --check  amb el repositori de la xarxa
       al costat (o EP_REPO=), comprova que el fitxer és el que sortiria; sense,
       només que el que s'hi publica passa el sedàs. Així el CI d'aquí no depèn
       d'un repositori privat.
   ========================================================================== */
'use strict';
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const { pathToFileURL } = require('node:url');

const ARREL = join(__dirname, '..');
const SORTIDA = join(ARREL, 'lib', 'cas-automatitzat.js');
const EP = process.env.EP_REPO || join(ARREL, '..', '..', 'eventspenedes-tarifas');
const MAPA = 'eventspenedes';

/* Rols que són projectes interns: no surten, ni els seus fluxos. */
const ROLS_FORA = ['Quien cuida el paisaje'];
/* Trossos que es treuen d'una frase (el model de comissions és intern). */
const TREU = [/ y la comisión por referencia/];
/* Si una frase encara en parla, el flux no surt. */
const FORA = [/comisi/i, /paisaje/i, /pages/i, /pagès/i, /mecen/i, /wwoof/i, /\bSOS\b/, /eventspenedes|events pened/i];

const CAS = {
  nom: { es: 'Una productora de eventos de empresa', ca: 'Una productora d\'esdeveniments d\'empresa' },
  diu: { es: 'Una persona y su red de proveedores locales organizan jornadas de equipo con espacio, comida, vino y actividad. La IA y los programas preparan; la persona decide y valida. Así lleva lo que antes pedía una oficina. El mapa es real; los nombres no están.',
    ca: 'Una persona i la seva xarxa de proveïdors locals organitzen jornades d\'equip amb espai, menjar, vi i activitat. La IA i els programes preparen; la persona decideix i valida. Així porta el que abans demanava una oficina. El mapa és real; els noms no hi són.' },
};
/* Qui ho fa: la regla és la del tauler (AUTOMATIZA a tools/lib/valor.mjs); aquí només la traducció. */
const NIVELLS = {
  solo: { icona: '⚡', es: 'Va solo, sin esperar a nadie', ca: 'Va sol, sense esperar ningú' },
  ia: { icona: '✦', es: 'La IA lo prepara y una persona lo valida', ca: 'La IA ho prepara i una persona ho valida' },
  maquina: { icona: '⚙', es: 'Un programa lo prepara con los datos y una persona lo valida', ca: 'Un programa ho prepara amb les dades i una persona ho valida' },
  persona: { icona: '·', es: 'Lo hace una persona', ca: 'Ho fa una persona' },
};
/* La escalera hacia automatizar: los escalones son los del tablero (ESCALONES a tools/lib/valor.mjs). */
const ESCALONS = {
  automatizado: { es: 'automatizado', ca: 'automatitzat' },
  definido: { es: 'definido: listo para automatizar', ca: 'definit: a punt per automatitzar' },
  presencial: { es: 'cara a cara: no se automatiza', ca: 'cara a cara: no s\'automatitza' },
  por_montar: { es: 'por montar', ca: 'per muntar' },
  sin_definir: { es: 'sin definir', ca: 'sense definir' },
};
const CA = {
  'La venta': 'La venda', 'La producción': 'La producció', 'El cobro': 'El cobrament', 'La red': 'La xarxa', 'Siempre': 'Sempre',
  'Quien encarga el evento': 'Qui encarrega l\'esdeveniment',
  'Quien lo revende': 'Qui el revèn',
  'Quien produce y coordina': 'Qui produeix i coordina',
  'Quien acoge': 'Qui acull',
  'Quien elabora el vino': 'Qui elabora el vi',
  'Quien sirve en el evento': 'Qui serveix a l\'esdeveniment',
  'Quien dinamiza la actividad': 'Qui dinamitza l\'activitat',
  'Quien asiste': 'Qui hi assisteix',
  'Quien factura y cobra': 'Qui factura i cobra',
  'el pedido con fecha, personas, actividad y zona': 'la comanda amb data, persones, activitat i zona',
  'la respuesta en el día y la propuesta con opciones cerradas y complementos': 'la resposta el mateix dia i la proposta amb opcions tancades i complements',
  'el encargo en marca blanca': 'l\'encàrrec en marca blanca',
  'la tarifa de agencia y la producción en destino': 'la tarifa d\'agència i la producció a destinació',
  'el pago del evento a la agencia': 'el pagament de l\'esdeveniment a l\'agència',
  'el evento con la marca de la agencia': 'l\'esdeveniment amb la marca de l\'agència',
  'la consulta de disponibilidad con sus opciones del catálogo ya montadas y, al elegir, la reserva': 'la consulta de disponibilitat amb les seves opcions del catàleg ja muntades i, en triar, la reserva',
  'la disponibilidad y las propuestas cerradas para el grupo, desde su ficha y sus paquetes': 'la disponibilitat i les propostes tancades per al grup, des de la seva fitxa i els seus paquets',
  'la consulta con sus menús del catálogo ya montados para el grupo y, al elegir, el encargo': 'la consulta amb els seus menús del catàleg ja muntats per al grup i, en triar, l\'encàrrec',
  'las propuestas cerradas con precio por persona': 'les propostes tancades amb preu per persona',
  'el encargo del taller': 'l\'encàrrec del taller',
  'el taller con monitores y material': 'el taller amb monitors i material',
  'la atención al detalle durante el día': 'l\'atenció al detall durant el dia',
  'la valoración y las fotos que comparte': 'la valoració i les fotos que comparteix',
  'el lugar y su historia': 'el lloc i la seva història',
  'la visita que vuelve y lo recomienda': 'la visita que torna i el recomana',
  'el relato de quien elabora el producto': 'el relat de qui elabora el producte',
  'la compra y la recomendación posterior': 'la compra i la recomanació posterior',
  'la vivencia de construir algo juntos': 'la vivència de construir alguna cosa junts',
  'el testimonio del grupo': 'el testimoni del grup',
  'la proforma de la reserva no reembolsable al confirmar y, al terminar, la factura del resto': 'la proforma de la reserva no reemborsable en confirmar i, en acabar, la factura de la resta',
  'sus datos fiscales, el pago de la reserva y el del resto': 'les seves dades fiscals, el pagament de la reserva i el de la resta',
  'la proforma neta de la reserva no reembolsable al confirmar y, al terminar, la factura del resto': 'la proforma neta de la reserva no reemborsable en confirmar i, en acabar, la factura de la resta',
  'las líneas de venta de cada evento': 'les línies de venda de cada esdeveniment',
  'saber qué deja cada evento': 'saber què deixa cada esdeveniment',
  'la metáfora del equipo que se lleva a la oficina': 'la metàfora de l\'equip que s\'emporta a l\'oficina',
  'un caso de empresa que se puede contar': 'un cas d\'empresa que es pot explicar',
  'la convocatoria a la jornada': 'la convocatòria a la jornada',
  'un equipo más unido': 'un equip més unit',
  'la consulta con sus experiencias del catálogo ya montadas y, al elegir, el encargo de la visita o la cata': 'la consulta amb les seves experiències del catàleg ja muntades i, en triar, l\'encàrrec de la visita o el tast',
  'la disponibilidad y las propuestas cerradas, desde la ficha de la bodega': 'la disponibilitat i les propostes tancades, des de la fitxa del celler',
  'la cata y el vino que se lleva': 'el tast i el vi que s\'emporta',
  'la recomendación de la bodega a otros': 'la recomanació del celler a altres',
  'la historia de la casa que da sentido al lugar': 'la història de la casa que dona sentit al lloc',
  'visitantes que conocen y vuelven a la bodega': 'visitants que coneixen el celler i hi tornen',
};

/* El sedàs és el de la taxonomia universal: una sola llista del que no surt. */
const SEDAS = JSON.parse(readFileSync(join(ARREL, 'knowledge', 'cervell', 'taxonomia-universal.json'), 'utf8')).sedas.map(s => new RegExp(s));
function sedas(cos) {
  const mal = [];
  [...SEDAS, ...FORA].forEach(r => { if (r.test(cos)) mal.push(String(r)); });
  ROLS_FORA.forEach(r => { if (cos.includes(r)) mal.push(r); });
  return mal;
}

async function genera() {
  const V = await import(pathToFileURL(join(EP, 'tools', 'lib', 'valor.mjs')).href);
  const d = V.cargar(), m = d.mapas[MAPA], inst = Object.values(d.operaciones.instancias).find(i => i.mapa === MAPA);
  const auto = V.automatizacion(inst, d.operaciones.catalogo);
  const E = V.escalones(m, inst, d.operaciones.catalogo), escDe = Object.fromEntries(E.flujos.map(f => [f.clave, f]));
  const neta = t => TREU.reduce((x, r) => x.replace(r, ''), t || '');
  const falten = new Set(), ca = t => { if (!CA[t]) falten.add(t); return CA[t] || t; };
  const roles = m.roles.filter(r => !ROLS_FORA.includes(r));
  const fluxos = [];
  m.pairs.forEach(p => [[p[0], p[1], p[2], p[3]], [p[1], p[0], p[4], p[5]]].forEach(([de, a, mena, que]) => {
    que = neta(que);
    if (!que || ROLS_FORA.includes(de) || ROLS_FORA.includes(a) || FORA.some(r => r.test(que))) return;
    const x = auto[de + '→' + a], qui = x && NIVELLS[x.nivel] ? x.nivel : 'persona';
    const e = escDe[de + '→' + a];
    fluxos.push({ de: { es: de, ca: ca(de) }, a: { es: a, ca: ca(a) }, mena: mena === 'intangible' ? 'intangible' : 'tangible', que: { es: que, ca: ca(que) }, qui,
      escalo: e && ESCALONS[e.escalon] ? e.escalon : null, proces: e ? e.proceso : null });
  }));
  if (falten.size) { console.error('✗ Frases del mapa sense traduir a build-cas-automatitzat.js (CA):\n  ' + [...falten].join('\n  ')); process.exit(1); }
  /* Per procés, comptat sobre el que es publica (no sobre el mapa privat sencer). */
  const processos = E.procesos.map(p => {
    const xs = fluxos.filter(f => f.escalo && f.proces === p.id);
    return { id: p.id, nom: { es: p.nom, ca: ca(p.nom) }, compte: Object.fromEntries(Object.keys(ESCALONS).map(k => [k, xs.filter(f => f.escalo === k).length])) };
  }).filter(p => Object.values(p.compte).some(Boolean));
  const C = { nom: CAS.nom, diu: CAS.diu, nivells: NIVELLS, escalons: ESCALONS, roles: { es: roles, ca: roles.map(ca) }, processos, fluxos };
  return '/* GENERAT per SOS/tools/build-cas-automatitzat.js des del mapa de valor privat de la xarxa i el seu\n'
    + '   catàleg d\'operacions, sense noms ni projectes interns. No s\'edita a mà. */\n'
    + '(function (g) {\n  var C = ' + JSON.stringify(C, null, 1).replace(/\n/g, '\n  ') + ';\n'
    + '  if (typeof module !== \'undefined\' && module.exports) module.exports = C; else g.CasAutomatitzat = C;\n})(this);\n';
}

(async () => {
  const check = process.argv.includes('--check'), hiEs = existsSync(join(EP, 'data', 'operaciones.json'));
  if (!hiEs) {
    if (!check) { console.error('✗ No trobo el repositori de la xarxa a ' + EP + ' (posa EP_REPO=)'); process.exit(1); }
    if (!existsSync(SORTIDA)) { console.error('✗ Falta SOS/lib/cas-automatitzat.js'); process.exit(1); }
  }
  const cos = hiEs ? await genera() : readFileSync(SORTIDA, 'utf8');
  const mal = sedas(cos.slice(cos.indexOf('*/') + 2)); /* la capçalera nomena aquesta eina, no el cas */
  if (mal.length) { console.error('✗ El cas públic porta el que no pot sortir: ' + mal.join(', ')); process.exit(1); }
  const C = require('node:vm').runInNewContext(cos + ';CasAutomatitzat', {});
  const n = k => C.fluxos.filter(f => f.qui === k).length;
  if (!C.fluxos.length || !n('ia')) { console.error('✗ El cas no té fluxos amb la IA: no ensenya res'); process.exit(1); }
  if (!check) { writeFileSync(SORTIDA, cos); console.log('Escrit ' + SORTIDA); }
  else if (hiEs && readFileSync(SORTIDA, 'utf8') !== cos) { console.error('✗ SOS/lib/cas-automatitzat.js no és el que sortiria ara: node SOS/tools/build-cas-automatitzat.js'); process.exit(1); }
  console.log(`✓ Cas anònim: ${C.roles.es.length} rols, ${C.fluxos.length} fluxos (${n('solo')} van sols, ${n('ia')} IA + persona, ${n('maquina')} programa + persona)${hiEs ? '' : ' · sense el repositori de la xarxa al costat, només el sedàs'}`);
})();
