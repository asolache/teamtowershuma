#!/usr/bin/env node
/* Guarda de les Cures · dades de gent que rep cura al seu barri
 * ─────────────────────────────────────────────────────────────────────────────
 * La pestanya de cures és l'única del SOS on el que s'apunta és **qui necessita
 * ajuda i qui l'hi dona**. La governança d'aquesta dinàmica ho diu amb una
 * paraula —«confidencialitat»— i una paraula no vigila res.
 *
 * Dos errors farien mal de debò i cap dels dos peta:
 *
 *   · **Que hi entri informació de salut.** Una casella de text lliure amb el
 *     nom de «situació» o «estat» acaba tenint diagnòstics escrits pel veïnat,
 *     desats al navegador d'algú i sincronitzats a qui tingui la clau del node.
 *     Per això els tipus d'acompanyament són una **llista tancada** que diu què
 *     es fa, no què li passa a ningú.
 *   · **Que els noms els vegi qualsevol.** Qui no sosté el node ha de veure els
 *     números —que és el que fa falta per decidir— i cap persona concreta.
 *
 * I una tercera cosa, que no és de privacitat sinó de sentit: **la projecció
 * s'ha de fer servir**. Es pot calcular perfectament qui es quedaria sense
 * ningú i no ensenyar-ho enlloc; llavors això torna a ser una eina que compta
 * hores després, que és exactament el que ja hi havia.
 *
 * Veda 133.
 *
 * Ús:  node SOS/tools/check-cures.js
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const APP = readFileSync(join(ARREL, 'SOS', 'index.html'), 'utf8');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;
const bloc = (des, fins) => {
  const i = APP.indexOf(des); if (i < 0) return '';
  const j = APP.indexOf(fins, i + des.length);
  return j < 0 ? '' : APP.slice(i, j + fins.length);
};

console.log('\nGuarda de les Cures · confidencialitat, i que la projecció serveixi d\'alguna cosa');

/* ── 1 · Cap dada de salut ──────────────────────────────────────────────── */
const que = bloc('const CURES_QUE=[', '\n];');
const cats = [...que.matchAll(/\['([a-z]+)','([^']+)'/g)].map(m => ({ id: m[1], lbl: m[2] }));
if (cats.length >= 5) ok(`els tipus d'acompanyament són una llista tancada de ${cats.length}`);
else bad('no es troba la llista tancada de tipus d\'acompanyament: sense això, el que s\'hi escrigui ' +
  'serà text lliure sobre persones');
/* Cap etiqueta pot descriure una condició. «Acompanyament a visites» és una
   feina; «diabetis» o «demència» és una dada de salut. */
const CLINIC = /diagn|malalt|malaltia|patolog|demèn|demenc|alzheimer|diabet|depress|discapacit|dependènc|dependenc|medicaci|medicament|teràpi|terapi|símptom|simptom|pronòstic/i;
const clinic = cats.filter(c => CLINIC.test(c.lbl) || CLINIC.test(c.id));
if (!clinic.length) ok('i cap diu res d\'una condició: diuen què es fa, no què li passa a ningú');
else bad(`${pl(clinic.length, 'tipus descriu', 'tipus descriuen')} una condició de salut: ` +
  clinic.map(c => `«${c.lbl}»`).join(', '));

/* Els camps del formulari. Cap pot convidar a escriure-hi una situació. */
const form = bloc('function openCuraForm(', '\n}');
const labels = [...form.matchAll(/<label>([^<]+)<\/label>/g)].map(m => m[1]);
const perillosos = labels.filter(l => CLINIC.test(l) || /situaci|estat de|condici|observacions mèdi/i.test(l));
if (labels.length && !perillosos.length)
  ok(`i els ${labels.length} camps del formulari tampoc: ${labels.join(' · ')}`);
else bad(`el formulari té ${pl(perillosos.length, 'camp que convida', 'camps que conviden')} a escriure-hi ` +
  `una situació personal: ${perillosos.join(', ') || 'no s\'han pogut llegir els camps'}`);
/* I ho ha de dir a la cara de qui l'omple: una regla que no es llegeix no la
   segueix ningú. */
if (/Res de salut/.test(form) && /no què li\\?'?passa a ningú|no què li passa a ningú/.test(APP))
  ok('i el formulari ho diu a qui l\'omple, en comptes de confiar-hi');
else bad('el formulari no adverteix que aquí no s\'hi escriuen dades de salut');

/* ── 2 · Els noms, només qui sosté el node ──────────────────────────────── */
const render = bloc('function renderCures(', '\nfunction openCuraForm');
if (/canWrite\(node\)/.test(render) && /const nom=m=>meu\?/.test(render))
  ok('els noms passen per una funció que mira si qui mira sosté el node');
else bad('la pantalla de cures ensenya els noms sense comprovar qui mira: aquí hi ha qui rep cura ' +
  'al seu barri');
/* Cap nom pintat fora d'aquella funció, tret dels que ja van dins d'un `meu?`.
   Es treu abans la línia que **defineix** la porta —`const nom=m=>meu?esc(m.name)`—:
   comptar-la com a fuita feia que la guarda acusés justament el que protegeix. */
const cos = render.replace(/const nom=m=>[^\n]*\n/, '');
const fuites = [...cos.matchAll(/.{0,60}esc\([A-Za-z_$][\w.$]*\.name\)/g)]
  .map(m => m[0]).filter(s => !/meu\s*\?/.test(s));
if (!fuites.length) ok('i tot nom que es pinta va o per la funció o dins d\'una comprovació de qui mira');
else bad(`${pl(fuites.length, 'nom es pinta', 'noms es pinten')} sense comprovar qui mira: ` +
  `…${fuites[0].slice(-52)}`);
if (/només els veu qui sosté el node/.test(render))
  ok('i a qui no els veu, la pantalla li diu per què');
else bad('la pantalla no explica per què no es veuen els noms: semblarà un error');

/* ── 3 · La projecció existeix i s'ensenya ──────────────────────────────── */
const plega = bloc('function siPlega(', '\n}');
if (/coberturaCures\(node,id\)\.n===1/.test(plega.replace(/\s+/g, '')))
  ok('la projecció es calcula: qui es quedaria sense ningú si aquesta persona plega');
else bad('no hi ha projecció de baixa, i llavors això només compta hores després, que és el que ja hi havia');
const usos = (APP.match(/siPlega\(/g) || []).length;
if (usos >= 3) ok(`i s'ensenya: es crida a ${usos} llocs, no es queda al model`);
else bad(`la projecció es declara i gairebé no es fa servir (${usos} crides): calcular-la i no ` +
  'ensenyar-la és no haver-la feta');
if (/es queda sense ningú|es queden sense ningú/.test(render))
  ok('i es diu amb la frase que s\'entén, no amb un percentatge');
else bad('la pantalla no diu qui es quedaria sense ningú');

/* ── 4 · El llindar va declarat i visible ───────────────────────────────── */
const llindar = (APP.match(/const CURES_LLINDAR=\{hores:(\d+),persones:(\d+)\}/) || []);
if (llindar[1] && Number(llindar[1]) > 0 && Number(llindar[2]) > 0) {
  ok(`el llindar de sobrecàrrega va declarat: ${llindar[1]} h/setmana o ${llindar[2]} persones`);
  if (/CURES_LLINDAR\.hores/.test(render) && /CURES_LLINDAR\.persones/.test(render))
    ok('i surt a la pantalla: una xifra que decideix qui es crema s\'ha de poder discutir');
  else bad('el llindar no es pinta enlloc: queda amagat dins d\'una condició');
} else bad('el llindar de sobrecàrrega no està declarat com a constant');

/* ── 5 · Les hores fetes van al ledger de sempre ────────────────────────── */
if (/exchangeHours\(node,\{fromId:c\.cuidaId/.test(render.replace(/\s+/g, '')))
  ok('les hores fetes es registren al ledger signat de sempre, no a un segon registre al costat');
else bad('la pantalla no porta al registre d\'hores existent: dos registres d\'hores acabarien ' +
  'dient coses diferents');
if (!/node\.curesHores|curesLedger|node\.horesCura/.test(APP))
  ok('i no hi ha cap magatzem d\'hores paral·lel');
else bad('hi ha un segon magatzem d\'hores de cura: el ledger ja fa això, i signat');

/* ── 6 · La pestanya s'ofereix on toca ──────────────────────────────────── */
if (/dynamicType==='suport_mutu'\)tdefs\.push/.test(APP.replace(/\s+/g, ' ').replace(/ \)/g, ')')) ||
    /suport_mutu'\)tdefs/.test(APP))
  ok('la pestanya s\'ofereix als projectes de suport mutu');
else bad('cap projecte de suport mutu ofereix la pestanya de cures: la feina no arriba a ningú');
if (/^\s{2}cures:\{ic:/m.test(APP))
  ok('i té guia contextual, com totes');
else bad('la pestanya no té entrada a CONTEXT_GUIDES');

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} a les Cures.`
  : '\n✅ Cap dada de salut, els noms protegits, i la projecció s\'ensenya.');
process.exit(fails ? 1 : 0);
