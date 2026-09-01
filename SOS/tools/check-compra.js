#!/usr/bin/env node
/* Guarda de La Compra · una taula de preus que no menteixi
 * ─────────────────────────────────────────────────────────────────────────
 * `SOS/compra.html` és l'eina de dues dinàmiques del catàleg del SOS
 * —`consum_agroecologic` i `compra_collectiva`— i n'anomena els noms. Com
 * sempre que hi ha dues còpies deliberades, poden divergir en silenci: si a
 * l'app se'n canvia el nom, la pàgina segueix dient l'antic i **sona igual de
 * certa**. Veda 109.
 *
 * I hi ha una segona cosa que aquí és pitjor que a les altres pàgines: això
 * dona xifres de diners que algú farà servir per parlar amb un pagès. Una
 * afirmació que la pàgina fa i les dades no sostenen no és un error de format,
 * és fer quedar malament un grup.
 *
 * Es comprova:
 *
 *   1. Les dues dinàmiques surten literalment a `DYNAMICS` de `SOS/index.html`.
 *   2. Cada producte: `botiga > grup` (un estalvi que no ho és no és un
 *      estalvi), format positiu, unitat i causa de la llista tancada, i un
 *      productor que existeix.
 *   3. **La cistella per defecte arriba al 80%** — el càlcul el refà la guarda
 *      amb les dades del fitxer. La frase de la pàgina no pot allunyar-se de la
 *      taula sense que peti el CI.
 *   4. Cada productor té mínim, quilòmetres i ritme vàlid, i el fa servir
 *      almenys un producte: un productor que ningú compra és decoració.
 *   5. Els preus porten data de revisió i es pinta a la pàgina.
 *   6. No hi ha cap camp que demani targeta, número o IBAN, ni cap text que
 *      digui que s'ha cobrat res. Vedes 96 i 97.
 *
 * Veda 119.
 *
 * Ús:  node SOS/tools/check-compra.js
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const APP = readFileSync(join(ARREL, 'SOS', 'index.html'), 'utf8');
const PAG = readFileSync(join(ARREL, 'SOS', 'compra.html'), 'utf8');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

console.log('\nGuarda de La Compra · preus, formats i la regla del 80%');

/* ── 1 · Les dues dinàmiques del catàleg ────────────────────────────────── */
const blocDin = (PAG.match(/const DINAMIQUES=\[[\s\S]*?\n\];/) || [''])[0];
const dins = [...blocDin.matchAll(/\{id:'([a-z_]+)',nom:'((?:[^'\\]|\\.)*)',ic:'([^']*)'\}/g)]
  .map(m => ({ id: m[1], nom: m[2], ic: m[3] }));
if (!dins.length) {
  bad('no es troba DINAMIQUES a compra.html: aquesta guarda no pot comprovar res');
  console.log('\n❌ 1 problema a La Compra.');
  process.exit(1);
}
const fora = dins.filter(d => !APP.includes(`{id:'${d.id}',name:'${d.nom}',icon:'${d.ic}'`));
if (!fora.length) ok(`les ${dins.length} dinàmiques que anomena surten a DYNAMICS amb el mateix nom i icona`);
else bad(`${pl(fora.length, 'dinàmica no coincideix', 'dinàmiques no coincideixen')} amb DYNAMICS: ` +
  fora.map(d => `${d.id} («${d.nom}» ${d.ic})`).join(', ') +
  ' — la pàgina anomena una cosa que a l\'app ja no es diu així');

/* ── 2 · Els productes ──────────────────────────────────────────────────── */
const RE = /\{id:'([a-z]+)',nom:'((?:[^'\\]|\\.)*)',ic:'([^']*)',cat:'((?:[^'\\]|\\.)*)',unit:'(\w+)',prox:([01]),basic:([01]),sa:([01]),botiga:([\d.]+),grup:([\d.]+),format:([\d.]+),prod:'(\w+)',font:'(\w+)',base:([\d.]+)\}/g;
const prods = [...PAG.matchAll(RE)].map(m => ({
  id: m[1], nom: m[2], unit: m[5], prox: +m[6], basic: +m[7], sa: +m[8],
  botiga: +m[9], grup: +m[10], format: +m[11], prod: m[12], font: m[13], base: +m[14] }));
/* El compte de control es fa dins del bloc i amb l'àncora més curta possible:
   amb `nom:'[^']*'` es perdien els noms amb apòstrof escapat —«Oli d'oliva»— i
   la guarda es queixava d'ella mateixa. */
const blocProd = (PAG.match(/const PRODUCTES=\[[\s\S]*?\n\];/) || [''])[0];
const declarats = (blocProd.match(/\{id:'/g) || []).length;

if (!prods.length) {
  bad('no es troba cap producte: el format de la taula ha canviat i la guarda s\'ha quedat cega');
} else if (prods.length !== declarats) {
  bad(`el lector n'ha entès ${prods.length} de ${declarats}: el format ha canviat i la guarda s'ha quedat cega`);
} else ok(`${prods.length} productes llegits`);

const llista = (re, def) => (((PAG.match(re) || [])[1] || def || '')
  .match(/'(\w+)'/g) || []).map(s => s.replace(/'/g, ''));
const unitats = llista(/const UNITATS=\[([^\]]*)\]/);
const fonts = [...(PAG.match(/const FONTS=\{[\s\S]*?\n\};/) || [''])[0]
  .matchAll(/^\s{2}(\w+):\s*\{lbl:/gm)].map(m => m[1]);

const RE_PROD = /^\s*(\w+):\s*\{nom:'((?:[^'\\]|\\.)*)',ic:'([^']*)',km:(\d+),\s*minim:(\d+),cada:'(\w+)',\s*fresc:([01]),/gm;
const productors = [...PAG.matchAll(RE_PROD)].map(m => ({
  id: m[1], nom: m[2], km: +m[4], minim: +m[5], cada: m[6], fresc: +m[7] }));
const idsProd = new Set(productors.map(p => p.id));
const ritmes = Object.keys({ setmana: 1, quinzena: 1, mes: 1 });

if (prods.length) {
  const barat = prods.filter(p => !(p.botiga > p.grup));
  if (!barat.length) ok('tots els productes són més barats de grup que a la botiga');
  else bad(`${pl(barat.length, 'producte no estalvia res', 'productes no estalvien res')}: ` +
    barat.map(p => `${p.id} (botiga ${p.botiga} · grup ${p.grup})`).join(', ') +
    ' — un «estalvi» que no ho és és el motiu més ràpid de perdre la confiança del grup');

  const mal = prods.filter(p => !(p.format > 0) || !unitats.includes(p.unit) ||
    !fonts.includes(p.font) || !idsProd.has(p.prod));
  if (!mal.length) ok('i tots tenen format, unitat, causa d\'estalvi i productor vàlids');
  else bad(`${pl(mal.length, 'producte mal declarat', 'productes mal declarats')}: ` +
    mal.slice(0, 4).map(p => p.id).join(', '));

  /* ── 3 · La regla del 80%, refeta amb les dades ────────────────────────
     Es refà el càlcul en comptes de llegir la frase: si algú afegeix un
     producte que la trenca, ho ha de dir el CI i no la pàgina d'un grup. */
  let tot = 0, bo = 0;
  prods.forEach(p => { const e = p.base * p.grup; tot += e; if (p.prox && p.basic && p.sa) bo += e; });
  const pct = tot ? bo * 100 / tot : 0;
  if (pct >= 80) ok(`la cistella per defecte és ${Math.round(pct * 10) / 10}% de proximitat, bàsic i sa`);
  else bad(`la cistella per defecte només arriba al ${Math.round(pct * 10) / 10}% ` +
    '— la pàgina promet un 80% i les dades no el sostenen');
}

/* ── 4 · Els productors ─────────────────────────────────────────────────── */
if (!productors.length) bad('no es troba cap productor: la comanda no es pot repartir entre ningú');
else {
  const malp = productors.filter(p => !p.minim || !p.km || !ritmes.includes(p.cada));
  if (!malp.length) ok(`els ${productors.length} productors tenen mínim, distància i ritme`);
  else bad(`${pl(malp.length, 'productor incomplet', 'productors incomplets')}: ` +
    malp.map(p => p.id).join(', '));

  const usats = new Set(prods.map(p => p.prod));
  const sols = productors.filter(p => !usats.has(p.id));
  if (!sols.length) ok('i cap es queda sense cap producte');
  else bad(`${pl(sols.length, 'productor no ven res', 'productors no venen res')}: ` +
    sols.map(p => p.id).join(', ') + ' — un productor que ningú compra és decoració');
}

/* ── 5 · La data dels preus ─────────────────────────────────────────────── */
const data = (PAG.match(/const PREUS_REVISIO='([^']+)'/) || [])[1];
const pintada = (PAG.match(/PREUS_REVISIO/g) || []).length > 1;
if (data && pintada) ok(`els preus porten data de revisió i es pinta: «${data}»`);
else bad('els preus no porten data visible: una taula de preus sense data menteix ' +
  'en silenci al cap d\'un any i no ho nota ningú');

/* ── 6 · Aquí no es cobra ───────────────────────────────────────────────── */
const camps = PAG.match(/<input[^>]*>/g) || [];
const perillosos = camps.filter(c => /targeta|tarjeta|\biban\b|\bcvv\b|caducitat|swift/i.test(c));
if (!perillosos.length) ok('cap camp demana targeta, IBAN ni res que s\'hi assembli');
else bad(`${pl(perillosos.length, 'camp demana', 'camps demanen')} dades de pagament: ` +
  perillosos.slice(0, 2).join(' '));

if (!/(s'ha (cobrat|pagat)|pagament confirmat|cobrament confirmat|pagat correctament)/i.test(PAG))
  ok('i enlloc es diu que s\'hagi cobrat o pagat res: aquí es planifica i s\'estima');
else bad('la pàgina diu que s\'ha cobrat o pagat alguna cosa — el SOS no confirma mai un cobrament');

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} a La Compra.`
  : '\n✅ Els preus quadren, la cistella arriba al 80% i aquí no es cobra res.');
process.exit(fails ? 1 : 0);
