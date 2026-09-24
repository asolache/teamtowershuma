#!/usr/bin/env node
/* La portada del SOS · una porta que diu on porta
 * ─────────────────────────────────────────────────────────────────────────────
 * `/sos/` feia 6,3 KB davant d'1,1 MB de pàgines, i **no n'anomenava ni una**.
 * Qui hi arribava tenia tres portes i una tira d'enllaços, i l'única manera de
 * saber que existeix La Compra, L'Habitatge o la Fàbrica de Superherois era
 * obrir el desplegable del menú. Una porta que no diu on porta no és una porta:
 * és una paret amb un pany.
 *
 * Mentrestant la portada de teamtowershuma.com carregava quatre seccions de
 * desenvolupament comunitari que no venen res —els beneficis de les dinàmiques,
 * els projectes propis, el SOS com a projecte lliure, mitja llista de
 * paraules—. Cadascuna era al lloc de l'altra.
 *
 * La regla que ho assigna, escrita a `knowledge/negoci/arquitectura-portades.md`:
 *
 *   **La portada respon «us hauria de contractar?».
 *     El SOS respon «com ho faig funcionar?».**
 *
 * ── Què es genera, i d'on surt ──────────────────────────────────────────────
 * Res d'això és una llista nova. Els destins ja estan declarats a
 * `build-nav.js` —que és qui sap el mapa de pàgines del SOS— i els paquets a
 * `build-oferta.js`. Aquí es declara **el que cada pàgina aporta a qui s'hi
 * posa**, que és l'única cosa que faltava, i la resta es llegeix.
 *
 * Per això hi ha una guarda que sembla exagerada i no ho és: **cap pàgina del
 * menú es pot quedar fora d'aquesta portada sense un motiu escrit.** Afegir una
 * pàgina al SOS i oblidar-se de posar-la a la porta no peta mai, i el resultat
 * és el que hi havia: vint-i-una pàgines i una porta que no en deia cap.
 *
 * ── Ús ──────────────────────────────────────────────────────────────────────
 *   node SOS/tools/build-portal.js            escriu els blocs
 *   node SOS/tools/build-portal.js --check    falla si estan vells o incomplets
 */
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const SOS = join(ARREL, 'SOS');
const CHECK = process.argv.includes('--check');
const APP_F = join(SOS, 'index.html');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const { GRUPS } = require('./build-nav.js');
const { SOS_PAQUETS } = require('./build-oferta.js');
const nav = f => {
  for (const g of GRUPS) { const l = g.links.find(x => x[0] === f); if (l) return { nom: l[1], que: l[2] }; }
  return null;
};

/* ══ QUÈ HI POTS MUNTAR ══════════════════════════════════════════════════════
   Les set dinàmiques que es poden posar en marxa. El nom i el «què és» surten
   del menú; el que s'hi declara aquí és **què s'hi guanya**, que és el que la
   portada de teamtowershuma.com deia a la secció de beneficis i que aquí és on
   serveix: al costat del botó que l'obre. */
const MUNTAR = [
  { p: 'banc-temps.html', ic: '⏳',
    guanya: 'Accés a serveis sense diners: cada hora rebuda és una hora que no es paga al mercat. I el saldo de tothom a la vista, que és el que evita que les de sempre es cremin.' },
  { p: 'biblioteca.html', ic: '🔧',
    guanya: 'Compartir el que es fa servir dos cops l\'any estalvia centenars d\'euros per llar i treu residus. Cada préstec val el desgast, no el preu.' },
  { p: 'compra.html', ic: '🛒',
    guanya: 'Agregar la demanda abarateix el que sol comprar-se car i sol, i deixa el marge al poble en comptes de al camió.' },
  { p: 'energia.html', ic: '⚡',
    guanya: 'La teulada és de qui hi viu. Es reparteix l\'excedent, es veu qui hi ha posat què i la factura deixa de decidir-la un altre.' },
  { p: 'habitatge.html', ic: '🏘',
    guanya: 'Quota d\'ús per sota del mercat i sense especulació: accés estable i llarg, amb l\'entrada i la sortida escrites abans de necessitar-les.' },
  { p: 'matriu.html', ic: '🌱',
    guanya: 'Una idea sap en quina etapa és i què li falta per passar a la següent, en comptes d\'anar fent fins que s\'encalla.' },
  { p: 'vna.html', ic: '🕸',
    guanya: 'El mapa de qui sosté què, amb els favors i la confiança que no compta ningú. És el pas que va abans de tots els altres.' }
];

/* Els beneficis que no són d'una dinàmica sinó del conjunt. Venien de la
   portada i són qualitatius a posta: es diuen com el que són. */
const PSICO = [
  ['Menys soledat', 'El suport mutu i la trobada regular protegeixen la salut mental, sobretot de la gent gran.'],
  ['Més pertinença', 'Les xarxes denses de reciprocitat generen seguretat i identitat compartida.'],
  ['Relleu', 'Rols clars i governança fan que entri gent nova i que allò no depengui de dues o tres persones.'],
  ['Resiliència', 'Les comunitats cohesionades aguanten millor les crisis i ho noten als seus indicadors de benestar.']
];

/* ══ COM S'APRÈN ═════════════════════════════════════════════════════════════ */
const APREN = [
  { p: 'formacio.html', ic: '🎓', guanya: 'De N0 a N3. El que fas queda al teu registre i el certificat és teu, no del projecte.' },
  { p: 'escola.html', ic: '🏫', guanya: 'El mateix a l\'aula, amb una regla que no es toca: cap nom real de cap criatura, enlloc.' },
  { p: 'ia.html', ic: '🤖', guanya: 'Automatitzar el tangible i valorar l\'intangible, amb IA que proposa i mai decideix.' },
  { p: 'vedes.html', ic: '⛔', guanya: 'Cada regla amb el motiu escrit al costat. És el que evita repetir un error que ja va sortir car.' },
  { p: 'blog.html', ic: '📝', guanya: 'Cada capacitat explicada a part, per si vols entendre-la abans de fer-la servir.' }
];

/* Les tres paraules que es van quedar a mitges a la portada. VNA, Intangible i
   Fent Pinya són el mètode que es ven i es queden allà; aquestes tres són
   l'eina i el seu lloc és aquí. */
const PARAULES = [
  ['SOS', 'Social Operating System', 'Qui hi és, qui fa què, qui ha aportat quantes hores i què s\'ha decidit. S\'obre com una pàgina web, sense compte, i les dades es queden al teu aparell.'],
  ['MATRIU', 'El camí d\'una idea fins que se sosté sola', 'Vuit etapes, de «se\'ns ha acudit això» fins a un projecte amb comptes, rols i relleu. Serveix per saber en quina ets.'],
  ['Slicing Pie', 'Repartir segons el que hi ha posat cadascú', 'En comptes de pactar percentatges el primer dia —quan ningú sap qui aguantarà—, s\'anota el que aporta cadascú i el repartiment surt d\'allà.']
];

/* ══ EL MÓN ══════════════════════════════════════════════════════════════════
   Els projectes propis. Aquí hi arriba «s'aprèn fent» de la portada: no són
   exemples inventats, són els nostres i s'hi pot entrar ara mateix. */
const MON = [
  { p: 'comando.html', ic: '🎬', guanya: 'Catorze personatges canònics i el teu és el que ja fas al barri. Els crèdits surten del registre signat.' },
  { p: 'molekulandia.html', ic: '🏘', guanya: 'El poble sencer en una pantalla: cada edifici és un tipus de projecte i de cadascun s\'entra a l\'eina que el porta.' },
  { p: 'molekulon.html', ic: '🌀', guanya: 'El mateix SOS amb un món diferent a dins: un estat líquid on el nivell del mig és un tema i no un tros de terra.' },
  { p: 'joc.html', ic: '🎮', guanya: 'La plaça a ritme. La manera més curta d\'entendre per què un castell no l\'aguanta qui hi puja.' },
  { p: 'online.html', ic: '🌐', guanya: 'Qui hi ha al territori, què ofereix i què busca. Cadascú signa la seva fitxa: ningú publica en nom d\'un altre.' }
];

/* Les pàgines del menú que **no** surten a la portada, amb el motiu. Una
   absència sense motiu escrit és un descuit, i aquesta és justament la llista
   que evita que la porta torni a callar-se les pàgines. */
const FORA = {
  'diagnostic.html': 'ja és una de les tres portes de dalt',
  'pressupost.html': 'va al bloc del que es pot contractar',
  'intro.html': 'és la tira d\'enllaços secundaris, abans d\'entrar',
  'uneix-te.html': 'és una de les tres portes de dalt, per a qui ve d\'una invitació'
};

/* ══ ELS BLOCS ═══════════════════════════════════════════════════════════════ */
const fitxa = (x, cls) => {
  const n = nav(x.p);
  return `<a class="pg ${cls}" href="${x.p}"><span class="pg-ic">${x.ic}</span>` +
    `<span class="pg-n">${esc(n.nom)}</span>` +
    `<span class="pg-q">${esc(n.que)}</span>` +
    `<span class="pg-g">${esc(x.guanya)}</span></a>`;
};

function blocMuntar() {
  const f = ['<section class="ob-sec">'];
  f.push('<h2>Què hi pots muntar</h2>');
  f.push('<p class="ob-sub2">Set dinàmiques, cadascuna amb la seva pàgina i el seu full de ruta. ' +
    'No cal fer-les totes ni fer-les en ordre: la majoria de pobles en comencen una i les altres arriben soles.</p>');
  f.push('<div class="pg-grid">' + MUNTAR.map(x => fitxa(x, 'm')).join('') + '</div>');
  f.push('<div class="ob-psico"><div class="ob-psico-k">I el que no surt a cap factura</div><ul>' +
    PSICO.map(([t, d]) => `<li><b>${esc(t)}.</b> ${esc(d)}</li>`).join('') + '</ul>' +
    '<p class="ob-psico-n">Evidència qualitativa de la literatura d\'acció comunitària i d\'experiències pròpies. ' +
    'Es diu com el que és: no hi ha cap xifra tancada darrere.</p></div>');
  f.push('</section>');
  return f.join('\n');
}

function blocApren() {
  const f = ['<section class="ob-sec">'];
  f.push('<h2>Com s\'aprèn</h2>');
  f.push('<p class="ob-sub2">No hi ha cursos sobre casos inventats: s\'aprèn portant un projecte de veritat. ' +
    'Tot això és obert i es pot mirar per dins abans de contractar res.</p>');
  f.push('<div class="pg-grid">' + APREN.map(x => fitxa(x, 'a')).join('') + '</div>');
  f.push('<div class="ob-mots"><div class="ob-mots-k">Tres paraules que farem servir</div>' +
    PARAULES.map(([t, s, d]) => `<div class="ob-mot"><b>${esc(t)}</b><span>${esc(s)}</span><p>${esc(d)}</p></div>`).join('') +
    '</div>');
  f.push('</section>');
  return f.join('\n');
}

function blocMon() {
  const f = ['<section class="ob-sec">'];
  f.push('<h2>El món</h2>');
  f.push('<p class="ob-sub2">El SOS no és només una eina de gestió: porta un món al darrere, i el món és el que fa ' +
    'que la gent hi torni. Tot obert i tot visitable ara mateix.</p>');
  f.push('<div class="pg-grid">' + MON.map(x => fitxa(x, 'w')).join('') + '</div>');
  f.push('</section>');
  return f.join('\n');
}

function blocPaquets() {
  const f = ['<section class="ob-sec">'];
  f.push('<h2>I si voleu que us hi acompanyem</h2>');
  f.push('<p class="ob-sub2">L\'eina és lliure i funciona sense nosaltres: això no és una versió de prova. ' +
    'El que es paga és <b>no haver de descobrir sol com es munta</b>. Tres coses, amb el preu escrit.</p>');
  f.push('<div class="ob-pq">');
  SOS_PAQUETS.forEach(p => {
    const preu = p.publica === false ? 'Preu a mida'
      : (p.preuMin === p.preuMax ? `${p.preuMin} €` : `De ${p.preuMin} a ${p.preuMax} €`);
    f.push(`<div class="pq"><div class="pq-h"><b>${esc(p.nom)}</b><span class="pq-d">${esc(p.dura)}</span></div>` +
      `<p class="pq-e">${esc(p.endus)}</p>` +
      `<div class="pq-p">${esc(preu)}<span>${esc(p.qui)}</span></div></div>`);
  });
  f.push('</div>');
  f.push('<p class="ob-pq-n">El catàleg sencer —consultoria, formació, producció i dinamització— és a ' +
    '<a href="../index.html#cataleg">teamtowershuma.com</a>, amb la forquilla de cada paquet i d\'on surt el número. ' +
    'Aquí hi ha només el que es contracta <b>al voltant de l\'eina</b>.</p>');
  f.push('</section>');
  return f.join('\n');
}

const BLOCS = {
  'SOS-MUNTAR': blocMuntar,
  'SOS-APREN': blocApren,
  'SOS-MON': blocMon,
  'SOS-PAQUETS': blocPaquets
};

/* ══ LES GUARDES ═════════════════════════════════════════════════════════════ */
const TOTES = MUNTAR.concat(APREN, MON);

// 1 · Cap porta cap a un fitxer que no hi és.
(() => {
  const mortes = TOTES.filter(x => !existsSync(join(SOS, x.p))).map(x => x.p);
  if (mortes.length) bad('portes a pàgines que no existeixen: ' + mortes.join(', '));
  else ok(`${TOTES.length} portes, totes obren un fitxer que hi és`);
})();

// 2 · Tota pàgina citada és al menú. Si no hi és, o el menú o la porta menteix
//     sobre el mapa del SOS, i les dues coses són el mateix problema.
(() => {
  const fora = TOTES.filter(x => !nav(x.p)).map(x => x.p);
  if (fora.length) bad('pàgines que no són al menú de build-nav.js: ' + fora.join(', '));
  else ok('totes surten del menú declarat, amb el seu nom i el seu «què és»');
})();

/* 3 · **La guarda que importa.** Cap pàgina del menú es pot quedar fora sense
       un motiu escrit. Afegir una pàgina al SOS i no posar-la a la porta no
       peta mai, i el resultat és el que hi havia: vint-i-una pàgines i una
       porta que no en deia cap. */
(() => {
  const alMenu = GRUPS.flatMap(g => g.links.map(l => l[0]));
  const posades = TOTES.map(x => x.p);
  const oblidades = alMenu.filter(p => !posades.includes(p) && !FORA[p]);
  if (oblidades.length) {
    bad('pàgines del menú que no surten a la porta ni tenen motiu escrit a FORA: ' + oblidades.join(', '));
  } else ok(`les ${alMenu.length} pàgines del menú hi són o tenen el motiu escrit (${Object.keys(FORA).length} a part)`);
  // I a l'inrevés: un motiu escrit per a una pàgina que ja no existeix és brossa.
  const sobren = Object.keys(FORA).filter(p => !alMenu.includes(p));
  if (sobren.length) bad('motius escrits per a pàgines que ja no són al menú: ' + sobren.join(', '));
})();

// 4 · Cap fitxa sense dir què s'hi guanya. Una llista de pàgines amb el seu
//     nom és el desplegable del menú, que ja existeix i no calia repetir.
(() => {
  const buides = TOTES.filter(x => !x.guanya || x.guanya.length < 40).map(x => x.p);
  if (buides.length) bad('fitxes sense dir què s\'hi guanya: ' + buides.join(', '));
  else ok('les ' + TOTES.length + ' fitxes diuen què és i què s\'hi guanya');
})();

// 5 · Els tres paquets porten preu, durada i per a qui, llegits del catàleg.
(() => {
  if (!SOS_PAQUETS.length) { bad('no hi ha paquets del SOS a build-oferta.js'); return; }
  const coixos = SOS_PAQUETS.filter(p => !p.dura || !p.qui || !p.endus ||
    (p.publica !== false && (p.preuMin == null || p.preuMax == null))).map(p => p.id);
  if (coixos.length) bad('paquets sense preu, durada, públic o entregable: ' + coixos.join(', '));
  else ok(`${SOS_PAQUETS.length} paquets del SOS, tots amb preu, durada i per a qui`);
})();

// 6 · El pont cap al catàleg sencer. Aquesta portada no ven consultoria i no ha
//     de fer-ho, però qui hi arriba i en vol ha de saber on és.
(() => {
  if (!/index\.html#cataleg/.test(blocPaquets())) bad('no hi ha camí cap al catàleg sencer de la portada');
  else ok('i el camí cap al catàleg sencer hi és');
})();

/* ══ ESCRIURE ════════════════════════════════════════════════════════════════ */
let app = readFileSync(APP_F, 'utf8');
let canvis = 0, vells = [];
Object.entries(BLOCS).forEach(([marca, fn]) => {
  const obre = `<!--${marca}-->`, tanca = `<!--/${marca}-->`;
  const i = app.indexOf(obre), j = app.indexOf(tanca);
  if (i < 0 || j < 0) { bad(`falta la marca ${marca} a SOS/index.html`); return; }
  const nou = obre + '\n' + fn() + '\n' + tanca;
  if (app.slice(i, j + tanca.length) === nou) return;
  canvis++; vells.push(marca);
  app = app.slice(0, i) + nou + app.slice(j + tanca.length);
});

if (CHECK) {
  if (canvis) bad('blocs desactualitzats: ' + vells.join(', ') + ' — torna a executar build-portal.js');
  else ok('els quatre blocs de la porta són al dia');
} else if (canvis) writeFileSync(APP_F, app);

console.log(fails ? '\n❌ La porta del SOS no quadra.'
  : `\n✅ Porta del SOS · ${MUNTAR.length} dinàmiques, ${APREN.length} d'aprenentatge, ` +
    `${MON.length} del món i ${SOS_PAQUETS.length} paquets` + (CHECK ? '.' : ` · ${canvis} bloc(s) escrits.`));
process.exit(fails ? 1 : 0);
