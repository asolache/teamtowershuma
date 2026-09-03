#!/usr/bin/env node
/* Guarda de «Les meves tasques» · una safata, i que segueixi sent una
 * ─────────────────────────────────────────────────────────────────────────
 * El SOS sabia què calia fer i ho sabia **en vuit llocs diferents**: missions,
 * safata de vistiplaus, tauler d'atenció, riscos, blocatges, alertes de cures,
 * taulers de projecte i forats de la xarxa. Cap deia «això és el que et toca a
 * tu». Vuit safates és cap safata.
 *
 * El defecte que això arregla no peta mai, i per això va durar tant: cada
 * safata, per si sola, era correcta. El perill ara és el simètric i tampoc
 * petaria — **que una font es despengi**. El dia que algú afegeixi una alerta
 * nova i la pinti a la seva pestanya sense passar-la per aquí, tornem a tenir
 * nou safates i ningú se n'assabenta.
 *
 * I dues coses més que no es poden perdre:
 *
 *   · **Les columnes són les del tauler que ja existeix** (`KCOLS`), no unes
 *     de noves. Dues maneres de dir en quin punt està una feina és el mateix
 *     defecte, un pis més amunt.
 *   · **Només el que té estat desat es pot moure.** La majoria d'aquestes
 *     tasques es calculen a cada pintada; deixar arrossegar-les a «fent»
 *     escriuria un estat que després es perd, i el següent render el desmentiria.
 *
 * Veda 138.
 *
 * Ús:  node SOS/tools/check-tasques.js
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const APP = readFileSync(join(ARREL, 'SOS', 'index.html'), 'utf8');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;
/* Els comentaris expliquen el que la guarda vigila i s'acusarien tots sols. */
const CODI = APP.replace(/\/\*[\s\S]*?\*\//g, '');
const bloc = (des, fins) => {
  const i = CODI.indexOf(des); if (i < 0) return '';
  const j = CODI.indexOf(fins, i + des.length);
  return j < 0 ? '' : CODI.slice(i, j);
};

console.log('\nGuarda de les tasques · una safata i no vuit');

/* ── 1 · Les vuit fonts arriben totes a la mateixa llista ─────────────────── */
const fn = bloc('function missions(){', '\nfunction ');
if (!fn) bad('no es troba `missions()`: aquesta guarda no pot comprovar res');
else {
  const FONTS = [
    ['pendentInbox', /pendingInbox\(\)/, 'la safata de vistiplaus'],
    ['objectes', /o\.status!=='prestat'/, 'els objectes que has de tornar'],
    ['atencio', /dashboardAttention\(\)/, 'el que el tauler detecta com a encallat'],
    ['coincidencies', /supplyMatches\(/, 'les parelles possibles'],
    ['cami', /journeyProgress\(/, 'el següent pas del teu recorregut'],
    ['cures', /sobrecarregades\(nd\)/, 'les cures sobrecarregades'],
    ['fragils', /fragilsCures\(nd\)/, 'qui té una sola cuidadora'],
    ['blocatges', /blocksOf\(v\)/, 'els blocatges oberts'],
    ['riscos', /risksOf\(v\)/, 'els riscos alts oberts'],
    ['tauler', /nd\.kanban&&nd\.kanban\.cards/, 'les targetes del tauler'],
    ['xarxa', /networkMissions\(\)/, 'els forats de la xarxa']
  ];
  const perdudes = FONTS.filter(([, re]) => !re.test(fn));
  if (!perdudes.length) ok(`les ${FONTS.length} fonts arriben a la mateixa llista`);
  else bad(`${pl(perdudes.length, 'font s\'ha despenjat', 'fonts s\'han despenjat')} de la safata única: `
    + perdudes.map(([, , q]) => q).join(', ') + ' — tornen a ser dues safates');
}

/* ── 2 · Les columnes són les del tauler, no unes de noves ────────────────── */
if (/const KCOLS=\[\['todo'/.test(CODI)) ok('el tauler declara les seves columnes a `KCOLS`');
else bad('no es troba `KCOLS`: les columnes del tauler han canviat de lloc');
const render = bloc('function renderMissions(w){', 'const FUND_UNCERTAINTY');
if (!render) bad('no es troba `renderMissions`');
else {
  /* No n'hi ha prou de veure `KCOLS` a dins: el botó de moure també el fa
     servir, i amb això sol la regla passava encara que les columnes del tauler
     fossin unes altres. El que s'ha de trobar és **el bucle que pinta les
     columnes**, i cap llista de columnes escrita a mà en tot el bloc. */
  const bucle = /KCOLS\.forEach\(\(\[col,lbl\]\)=>\{/.test(render);
  const propies = /\[\s*\[\s*'(todo|per fer|fent|fet|doing|done)'/i.test(render);
  if (bucle && !propies) ok('i la pantalla de tasques pinta les columnes amb `KCOLS`');
  else bad('la pantalla de tasques es fa unes columnes pròpies: dues maneres de dir en quin punt està una feina');
  /* El botó de moure només pot existir on hi ha estat desat. */
  const mou = render.match(/if\(m\.card\)\{[\s\S]{0,400}?\}/);
  if (mou && /m\.card\.col=/.test(mou[0]) && /persist\(/.test(mou[0]))
    ok('només es pot moure el que té estat desat, i en moure\'l es desa');
  else bad('el botó de moure no està limitat a les targetes amb estat desat, o no persisteix');
}

/* ── 3 · Els dos eixos, i les dues direccions ─────────────────────────────── */
const filtre = bloc('function lesMevesTasques(', 'function fluxDeTasca');
if (!filtre) bad('no es troba `lesMevesTasques`');
else {
  if (/subtreeIds\(ambit\)/.test(filtre)) ok('cap endins llegeix el subarbre (`subtreeIds`)');
  else bad('cap endins no fa servir `subtreeIds`: seria un àmbit que no baixa');
  if (/ancestors\(ambit\)/.test(filtre)) ok('cap enfora llegeix els ascendents (`ancestors`)');
  else bad('cap enfora no fa servir `ancestors`: seria un àmbit que no puja');
  /* Si l'àmbit s'inclogués a si mateix cap enfora, les dues direccions
     donarien gairebé el mateix i el botó no serviria de res. */
  if (/filter\(id=>id!==ambit\)/.test(filtre))
    ok('i cap enfora exclou l\'àmbit mateix: mirar amunt és veure el que no és teu');
  else bad('cap enfora inclou l\'àmbit mateix: les dues direccions dirien gairebé el mateix');
  if (/if\(!m\._node\)return true/.test(filtre))
    ok('una tasca sense node surt sempre: no és de cap territori, és de tothom');
  else bad('les tasques sense node es filtren fora — s\'amagaria la feina que ningú ha reclamat');
  if (/tema&&!m\._temes\.includes\(tema\)/.test(filtre)) ok('i el tema filtra pel tema del node');
  else bad('el filtre de tema no mira els temes del node');
}

/* ── 4 · La pantalla és a dins de l'app, no una miniapp més ───────────────── */
if (/HOME_VIEWS=\['tauler','mapa','missions'/.test(CODI))
  ok('viu com una portada de l\'app i no com una pàgina a part');
else bad('«les meves tasques» ha sortit de `HOME_VIEWS`: una safata fora de l\'app seria la novena');

/* ── 5 · Els noms de les cures no surten sense permís ─────────────────────── */
/* Mateix gate que `renderCures`: qui no sosté el node veu els números i cap
   persona concreta. Portar les alertes a una pantalla comuna era la manera més
   fàcil de saltar-se'l sense adonar-se'n. */
const cures = (fn.match(/if\(nd\.dynamicType!=='suport_mutu'\)return;[\s\S]{0,900}?\}\);/) || [''])[0];
if (!cures) bad('no es troba el bloc de cures dins de `missions()`');
else if (/canWrite\(nd\)/.test(cures) && /meu\?/.test(cures))
  ok('les alertes de cures diuen el nom només a qui pot escriure al node');
else bad('les alertes de cures porten noms sense comprovar el permís: la pantalla comuna s\'ha saltat el gate de `renderCures`');

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} a les tasques.`
  : '\n✅ Una safata, les columnes del tauler, i els dos eixos amb les dues direccions.');
process.exit(fails ? 1 : 0);
