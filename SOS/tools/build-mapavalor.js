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
  /* La frase que impedeix que això es llegeixi com una promesa de marge. */
  avis: 'Aquest mapa és un exemple treballat, no el d\'un celler concret, i no porta cap xifra: el marge el calcula la casa amb els seus números. El que el mapa aporta no és una previsió — és <b>on mirar</b>, i quins lliuraments avui se\'n van sense cobrar.'
};

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

/* ══ EL DIBUIX ═══════════════════════════════════════════════════════════════
   Generat de les posicions declarades. Es dibuixa amb les dues menes
   distingides per traç —plena i discontínua— i no per color sol: qui no
   distingeix el blau del magenta ha de poder llegir el mapa igualment. */
function svgCeller(id) {
  const R = 46, W = 640, H = 430;
  const p = [];
  p.push(`<svg id="${id}" class="mv-svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${id}T ${id}D">`);
  p.push(`<title id="${id}T">Mapa de valor d'un celler del Penedès</title>`);
  p.push(`<desc id="${id}D">Set rols i setze lliuraments. A l'esquerra el distribuïdor, amb qui tot el que es lliura és tangible. A la dreta l'operador de luxe i el visitant, on la meitat del que es lliura és intangible.</desc>`);
  p.push('<defs>' +
    '<marker id="mvT" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#00b0ff"/></marker>' +
    '<marker id="mvI" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#e040fb"/></marker>' +
    '</defs>');
  // Les fletxes primer, perquè els nodes hi quedin a sobre i el text es llegeixi.
  flux.forEach(f => {
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
    p.push(`<path d="M${ax.toFixed(1)} ${ay.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}" fill="none" ` +
      `stroke="${tang ? '#00b0ff' : '#e040fb'}" stroke-width="${tang ? 2 : 1.6}" opacity="${tang ? .5 : .42}"` +
      `${tang ? '' : ' stroke-dasharray="6 7"'} marker-end="url(#${tang ? 'mvT' : 'mvI'})"><title>${esc(nodeDe(f.de).nom)} → ${esc(nodeDe(f.a).nom)}: ${esc(f.q)} (${f.mena})</title></path>`);
  });
  CELLER.nodes.forEach(n => {
    const col = n.cami === 'canal' ? '#82828d' : (n.cami === 'visitant' ? '#00e676' : '#6366f1');
    p.push(`<g class="mv-n" data-id="${n.id}">`);
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
  f.push('  </div>');
  f.push('  <div class="mv-txt">');
  f.push(`    <h3>${esc(CELLER.titol)}</h3>`);
  f.push(`    <p class="mv-lead">${esc(CELLER.una)}</p>`);
  f.push('    <div class="mv-cmp">');
  f.push(`      <div class="mv-c canal"><div class="mv-ck">Pel distribuïdor</div><div class="mv-cv">${cCanal.i} de ${cCanal.n}</div><div class="mv-cd">lliuraments intangibles. Tot el que no es pot facturar, per aquí se\'n va de franc.</div></div>`);
  f.push(`      <div class="mv-c visita"><div class="mv-ck">Pel visitant i l'operador</div><div class="mv-cv">${cVisita.i} de ${cVisita.n}</div><div class="mv-cd">lliuraments intangibles. Aquí no són un extra: són el producte que es paga.</div></div>`);
  f.push('    </div>');
  f.push('    <p class="mv-tesi"><b>El marge no surt d\'apujar el preu de l\'ampolla.</b> Surt de <b>cobrar els intangibles que la casa ja produeix</b> —el relat, el lloc, la família, el vessant— i que avui se\'n van amb el camió. El mapa no els inventa: ensenya que hi són i que no es cobren.</p>');
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
  f.push(`<p class="mv-sub">Nou passos en ${esc(PAQUET ? PAQUET.dura : '3 sessions')}. Els tres del mig marcats són <b>les tres anàlisis de Verna Allee</b>, que són el mètode i no una manera nostra de mirar-ho.</p>`);
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

/* ══ ESCRIURE ════════════════════════════════════════════════════════════════ */
const DESTINS = [
  { f: join(ARREL, 'index.html'), marca: 'TT-MAPAVALOR', fn: blocPortada },
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
