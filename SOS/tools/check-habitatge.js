#!/usr/bin/env node
/* Guarda de L'Habitatge · una viabilitat que aguanti davant d'una entitat i d'una assemblea
 * ─────────────────────────────────────────────────────────────────────────────
 * `SOS/habitatge.html` dona xifres que un grup farà servir per decidir si es
 * compromet vint-i-cinc anys, per parlar amb un ajuntament i per demanar diners
 * a la seva gent. Una afirmació que la pàgina fa i el model no sosté no és un
 * error de format: és un grup que promet una quota que després no serà.
 *
 * Es comprova:
 *
 *   1. El mapa de valor és el de `habitatge_cessio` a `DYNAMICS`, **paraula per
 *      paraula**. I els rols que la pàgina diu omplir i els lliuraments que diu
 *      produir existeixen al mapa.
 *   2. **Totes les xifres porten data i font.** Un preu d'obra o una aportació
 *      sense data no és una xifra: és una xifra amb aspecte de precisa.
 *   3. **La porta del finançament existeix i s'aplica.** Cap entitat de finances
 *      ètiques finança el 100%: planificar un projecte amb un 12% de recursos no
 *      bancaris és l'error més car que es pot cometre aquí, perquè no es
 *      descobreix fins que ja s'ha gastat un any.
 *   4. **El retorn de l'aportació és nominal.** Si algun dia es calcula un
 *      retorn revaloritzat, la cessió d'ús deixa de ser cessió d'ús —l'habitatge
 *      torna a ser un actiu— i cap altra guarda se n'adonaria. I la pàgina ha de
 *      dir la pèrdua de poder adquisitiu, que és el preu d'aquesta virtut.
 *   5. **Es diu qui torna l'aportació.** La cooperativa no la té: és a
 *      l'edifici. Sense fons de retorn, la torna qui entra.
 *   6. **El llindar d'esforç va declarat**, no amagat dins d'una condició: una
 *      xifra que decideix qui està en sobrecàrrega s'ha de poder discutir.
 *   7. **Aquí no es compra res i no hi ha noms de persona**: cap camp demana
 *      dades bancàries ni identificatives, les files són llars, i enlloc es diu
 *      que s'hagi comprat, adjudicat o reservat cap habitatge.
 *
 * Ús:  node SOS/tools/check-habitatge.js
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const APP = readFileSync(join(ARREL, 'SOS', 'index.html'), 'utf8');
const PAG = readFileSync(join(ARREL, 'SOS', 'habitatge.html'), 'utf8');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;
const bloc = (txt, obre, tanca) => {
  const i = txt.indexOf(obre); if (i < 0) return '';
  const j = txt.indexOf(tanca, i + obre.length);
  return j < 0 ? '' : txt.slice(i, j + tanca.length);
};
const cadenes = s => [...s.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(m => m[1]);

console.log('\nGuarda de L\'Habitatge · el que la pàgina promet i el que sosté el model');

/* ── 1 · El mapa de valor, paraula per paraula ──────────────────────────── */
const seu = (() => {
  const i = APP.indexOf("{id:'habitatge_cessio',name:");
  if (i < 0) return '';
  const j = APP.indexOf("\n {id:'", i + 10);
  return APP.slice(i, j < 0 ? i + 6000 : j);
})();
const meu = bloc(PAG, 'const MAPA={', '\n};');

if (!seu || !meu) {
  bad('no es troba el mapa a un dels dos fitxers: la guarda de L\'Habitatge s\'ha quedat cega');
} else {
  const camp = (b, k) => { const m = b.match(new RegExp(k + ":'((?:[^'\\\\]|\\\\.)*)'")); return m ? m[1] : null; };
  const mal = ['mission', 'vision', 'objectives', 'gov'].filter(k => {
    const v = camp(meu, k);
    return !v || !seu.includes(`${k}:'${v}'`);
  });
  if (!mal.length) ok('missió, visió, objectius i governança són els del catàleg');
  else bad(`${mal.join(', ')} no coincideix amb DYNAMICS — la pàgina diu una cosa que a l'app ja no hi és`);

  const llista = (b, k) => { const m = b.match(new RegExp(k + ':\\[([\\s\\S]*?)\\],?\\s*(?:\\n|$)')); return m ? cadenes(m[1]) : null; };
  [['roles', 'rols'], ['kanban', 'passos']].forEach(([k, lbl]) => {
    const a = llista(meu, k), b = llista(seu, k);
    if (a && b && a.join('|') === b.join('|')) ok(`els ${a.length} ${lbl} són els mateixos, i en el mateix ordre`);
    else bad(`els ${lbl} no coincideixen amb DYNAMICS` + (a && b ? ` (aquí ${a.length}, a l'app ${b.length})` : ' (no s\'han pogut llegir)'));
  });

  const pairs = b => { const i = b.indexOf('pairs:['); if (i < 0) return [];
    const j = b.indexOf(']],', i);
    return [...b.slice(i, j < 0 ? b.length : j + 3).matchAll(/\[((?:'(?:[^'\\]|\\.)*',?\s*){6})\]/g)]
      .map(m => cadenes(m[1]).join(' | ')); };
  const meves = pairs(meu), seves = pairs(seu);
  const perdudes = meves.filter(p => !seves.includes(p));
  if (meves.length && meves.length === seves.length && !perdudes.length)
    ok(`i els ${meves.length} intercanvis són literalment els del catàleg`);
  else bad(`els intercanvis no quadren — aquí ${meves.length}, a l'app ${seves.length}` +
    (perdudes.length ? `, i ${pl(perdudes.length, 'no hi és', 'no hi són')}: «${perdudes[0].split(' | ').slice(0, 2).join('→')}»` : ''));

  /* Les cadenes es llegeixen del codi font, o sigui que porten l'apòstrof
     escapat (`quota d\'ús`). Es desescapen a totes dues bandes abans de
     comparar-les: fer-ho només a una donava fantasmes que no ho eren. */
  const net = s => s.replace(/\\'/g, "'");
  const rols = new Set((llista(meu, 'roles') || []).map(net));
  const lliur = new Set(meves.flatMap(p => { const c = p.split(' | '); return [net(c[3]), net(c[5])]; }));
  const ompleKeys = [...bloc(PAG, 'const OMPLE={', '};').matchAll(/'((?:[^'\\]|\\.)*)':'/g)].map(m => m[1]);
  const faKeys = [...bloc(PAG, 'const FA={', '\n};').matchAll(/^\s{2}'((?:[^'\\]|\\.)*)':/gm)].map(m => m[1]);
  const rolsFantasma = ompleKeys.filter(r => !rols.has(net(r)));
  const fluxFantasma = faKeys.filter(f => !lliur.has(net(f)));
  if (ompleKeys.length && !rolsFantasma.length) ok(`el rol que la pàgina omple existeix al mapa: ${ompleKeys.map(net).join(', ')}`);
  else bad(`rols que la pàgina diu omplir i no són al mapa: ${rolsFantasma.join(', ') || '—'}`);
  if (faKeys.length && !fluxFantasma.length) ok(`i els ${faKeys.length} lliuraments que anomena són lliuraments del mapa`);
  else bad(`lliuraments que la pàgina anomena i no existeixen: ${fluxFantasma.join(', ') || '—'}`);
}

/* ── 2 · Cap xifra sense data ni font ───────────────────────────────────── */
const dades = bloc(PAG, 'const DADES={', '\n};');
const camps = ['revisio', 'aportacio', 'aportacioFont', 'quotaRef', 'quotaRefFont', 'obra', 'obraFont',
  'comuns', 'comunsFont', 'tecnics', 'tecnicsFont', 'iva', 'ivaFont', 'interes', 'interesFont',
  'anys', 'anysFont', 'propisMin', 'propisFont', 'titolsInteres', 'titolsAnys', 'titolsFont',
  'operacio', 'operacioFont', 'canon', 'canonFont', 'cessio', 'cessioProrroga', 'cessioFont',
  'ipc', 'ipcFont', 'lloguer', 'lloguerFont'];
const falten = camps.filter(c => !new RegExp('\\b' + c + ':').test(dades));
if (!falten.length) ok(`els ${camps.length} camps de xifres i referències hi són, fonts incloses`);
else bad(`a la taula de dades li falten ${falten.join(', ')} — una xifra de diners sense font no es pot ` +
  'discutir amb ningú');
const data = (dades.match(/revisio:'([^']+)'/) || [])[1];
if (data && /DADES\.revisio/.test(PAG) && /sense data menteix/.test(PAG))
  ok(`i la data de revisió («${data}») es pinta a la pàgina, no es queda al codi`);
else bad('la data de revisió no surt a la pantalla: qui llegeixi les xifres no sabrà de quan són');
/* Les hipòtesis van dites com a hipòtesis: l'IPC i el lloguer no són dades, són
   suposicions, i vendre-les com a dades és el més fàcil d'aquesta pàgina. */
if (/hipòtesi editable/.test(dades)) ok('i les hipòtesis (IPC, lloguer de referència) van dites com a hipòtesis');
else bad('l\'IPC i el lloguer de referència es presenten com si fossin dades i són suposicions');

/* ── 3 · La porta del finançament ───────────────────────────────────────── */
const propis = (dades.match(/propisMin:(\d+)/) || [])[1];
if (propis === '20') ok(`la porta del finançament és la real: mínim ${propis}% de recursos no bancaris`);
else bad(`el mínim de recursos propis diu ${propis || '?'}% i el sostre de finançament habitual és el 80%, ` +
  'o sigui un 20%');
/* La porta s'ha de calcular des de `propisMin` i s'ha de fer servir per pintar.
   Un mínim declarat que ningú comprova no és un mínim; i un `passaPorta` que
   existeix i no arriba a la pantalla tampoc. */
const teFalta = /const falta=[^\n]*DADES\.propisMin/.test(PAG);
const tePorta = /const passaPorta=[^\n]*falta\(/.test(PAG);
/* Dues crides com a mínim: la pantalla del finançament i el recorregut de
   l'aportació. La declaració no compta —s'escriu `const passaPorta=(a)=>`. */
if (teFalta && tePorta && (PAG.match(/passaPorta\(/g) || []).length >= 2)
  ok('i s\'aplica: la pàgina diu si el projecte passa o no passa, no només quant hi ha');
else bad('la porta es declara i no s\'aplica enlloc: un mínim que no es comprova no és un mínim');
/* El forat s'ha de dir en euros. Un percentatge no es pot anar a buscar. */
if (/const falta=/.test(PAG) && /Falten/.test(PAG))
  ok('i el que falta per passar-la es diu en euros, que és l\'única forma que es pot anar a buscar');
else bad('el forat per arribar al mínim no es diu en euros: un percentatge no es pot anar a demanar a ningú');

/* ── 4 · El retorn és nominal ───────────────────────────────────────────── */
const sortida = bloc(PAG, 'function sortida(', '\n}');
if (/retorn:posat/.test(sortida.replace(/\s+/g, '')))
  ok('qui marxa cobra el nominal: es torna el que es va posar, sense revaloració');
else bad('el retorn de l\'aportació no és el nominal — si es revalorés, l\'habitatge tornaria a ser un ' +
  'actiu i la cessió d\'ús no serviria per a res');
if (/pctPerdut/.test(PAG) && /poder adquisitiu/.test(PAG))
  ok('i la pàgina diu què val aquell nominal anys després: la pèrdua de poder adquisitiu, amb número');
else bad('la pàgina no diu la pèrdua de poder adquisitiu de qui marxa: dita el primer dia és un acord, ' +
  'callada és una sorpresa');
if (/no és un defecte del model, és el model/i.test(PAG))
  ok('i explica per què és així, en comptes de demanar-ne perdó');
else bad('la pàgina no explica que el retorn nominal és el que impedeix l\'especulació');

/* ── 5 · Qui torna l'aportació ──────────────────────────────────────────── */
if (/const fonsRetorn=/.test(PAG) || /function fonsRetorn\(/.test(PAG))
  ok('el fons de retorn es modela: es pot saber quantes sortides cobreix');
else bad('no hi ha fons de retorn al model, i llavors la pregunta «qui em torna l\'aportació» no té resposta');
if (/la torna qui entra|l'aportació la torna <strong>qui/i.test(PAG))
  ok('i quan el fons no cobreix, la pàgina ho diu pel seu nom: la torna qui entra');
else bad('la pàgina no diu qui torna l\'aportació si no hi ha fons: és la pregunta que no surt als fullets');

/* ── 6 · El llindar d'esforç, declarat ──────────────────────────────────── */
const esforc = (PAG.match(/const ESFORC_MAX=(\d+)/) || [])[1];
if (esforc && Number(esforc) > 0 && Number(esforc) <= 40) {
  ok(`el llindar d'esforç va declarat i es pot discutir: ${esforc}%`);
  if (/mEsforc/.test(PAG)) ok('i surt a la pantalla, no es queda dins d\'una condició');
  else bad('el llindar d\'esforç no es pinta enlloc');
} else bad(`el llindar d'esforç diu ${esforc || '?'}: la xifra amb què es mesura la sobrecàrrega ` +
  'ha d\'estar declarada i ser defensable');

/* ── 7 · Aquí no es compra res, i no hi ha noms de persona ──────────────── */
const inputs = PAG.match(/<input[^>]*>/g) || [];
const perillosos = inputs.filter(c => /iban|targeta|tarjeta|titular|\bdni\b|\bnie\b|cvv|compte banc/i.test(c));
if (!perillosos.length) ok('cap camp demana dades bancàries ni identificatives');
else bad(`${pl(perillosos.length, 'camp demana', 'camps demanen')} dades sensibles: ${perillosos[0]}`);
/* Les files són llars, com a La Compra. Un registre dels ingressos de persones
   concretes al navegador d'algú és una altra cosa, i no és aquesta. */
const nomCamp = inputs.filter(c => /id="inNom"/.test(c))[0] || '';
if (/Nom de la llar/.test(nomCamp)) ok('i el que es dona d\'alta és una llar, no una persona');
else bad('el camp de nom no demana una llar: els ingressos de persones amb nom són una altra cosa');
if (!/(s'ha (comprat|adjudicat|reservat)|habitatge adjudicat|compra confirmada|pis reservat)/i.test(PAG))
  ok('i enlloc es diu que s\'hagi comprat, adjudicat o reservat cap habitatge: aquí es planifica i s\'estima');
else bad('la pàgina diu que s\'ha comprat o adjudicat alguna cosa, i no pot saber-ho');

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} a L'Habitatge.`
  : '\n✅ El mapa és el del catàleg, la porta del 20% s\'aplica i el retorn és nominal i dit.');
process.exit(fails ? 1 : 0);
