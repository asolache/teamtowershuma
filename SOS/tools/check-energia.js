#!/usr/bin/env node
/* Guarda de L'Energia · una estimació que aguanti davant d'una instal·ladora
 * ─────────────────────────────────────────────────────────────────────────
 * `SOS/energia.html` dona xifres que un grup farà servir per decidir si es
 * gasta desenes de milers d'euros, i per parlar amb un ajuntament i amb una
 * instal·ladora. Una afirmació que la pàgina fa i les dades no sostenen no és
 * un error de format: és un grup que es planta a una reunió amb un número
 * inventat.
 *
 * Es comprova:
 *
 *   1. El mapa de valor és el de `comunitat_energetica` a `DYNAMICS`, **paraula
 *      per paraula**: missió, visió, objectius, governança, rols, passos i cada
 *      intercanvi. I els rols que la pàgina diu omplir i els lliuraments que diu
 *      produir existeixen al mapa.
 *   2. **Tots els preus porten data i font.** El de la llum canvia cada dia; una
 *      taula sense data menteix en silenci molt més de pressa que una de
 *      queviures.
 *   3. **L'ajut porta sostre.** És l'error de pressupost més car d'aquesta
 *      pàgina: comptar el 40% sense el màxim de 3.000 € deixa un forat de cinc
 *      xifres.
 *   4. **La coincidència horària existeix, és visible i és conservadora.** És el
 *      factor que infla tots els pressupostos de fotovoltaica; suposar el 100%
 *      regala un 25% d'estalvi que no hi és.
 *   5. **El cost d'operació es descompta**, i la pàgina diu què NO inclou.
 *      Prometre una amortització bruta és prometre-la curta.
 *   6. **El marc legal porta la seva norma i el seu any**, i el radi vigent és
 *      el de la norma més recent declarada.
 *   7. **Aquí no es contracta res**: cap camp demana dades bancàries ni de
 *      subministrament, i enlloc es diu que s'hagi contractat o donat d'alta res.
 *
 * Ús:  node SOS/tools/check-energia.js
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const APP = readFileSync(join(ARREL, 'SOS', 'index.html'), 'utf8');
const PAG = readFileSync(join(ARREL, 'SOS', 'energia.html'), 'utf8');

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

console.log('\nGuarda de L\'Energia · el que la pàgina promet i el que sostenen les dades');

/* ── 1 · El mapa de valor, paraula per paraula ──────────────────────────── */
const seu = (() => {
  const i = APP.indexOf("{id:'comunitat_energetica',name:");
  if (i < 0) return '';
  const j = APP.indexOf("\n {id:'", i + 10);
  return APP.slice(i, j < 0 ? i + 6000 : j);
})();
const meu = bloc(PAG, 'const MAPA={', '\n};');

if (!seu || !meu) {
  bad('no es troba el mapa a un dels dos fitxers: la guarda de L\'Energia s\'ha quedat cega');
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

  /* Els intercanvis: sis cadenes per línia i cap peta si en canvia una. */
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

  /* I el que la pàgina diu que omple i que produeix ha d'existir al mapa. */
  const rols = new Set(llista(meu, 'roles') || []);
  const lliur = new Set(meves.flatMap(p => { const c = p.split(' | '); return [c[3], c[5]]; }));
  const ompleKeys = [...bloc(PAG, 'const OMPLE={', '};').matchAll(/'((?:[^'\\]|\\.)*)':'/g)].map(m => m[1]);
  const faKeys = [...bloc(PAG, 'const FA={', '\n};').matchAll(/^\s{2}'((?:[^'\\]|\\.)*)':/gm)].map(m => m[1]);
  const rolsFantasma = ompleKeys.filter(r => !rols.has(r));
  const fluxFantasma = faKeys.filter(f => !lliur.has(f));
  if (ompleKeys.length && !rolsFantasma.length) ok(`el rol que la pàgina omple existeix al mapa: ${ompleKeys.join(', ')}`);
  else bad(`rols que la pàgina diu omplir i no són al mapa: ${rolsFantasma.join(', ') || '—'}`);
  if (faKeys.length && !fluxFantasma.length) ok(`i els ${faKeys.length} lliuraments que anomena són lliuraments del mapa`);
  else bad(`lliuraments que la pàgina anomena i no existeixen: ${fluxFantasma.join(', ') || '—'}`);
}

/* ── 2 · Cap preu sense data ni font ────────────────────────────────────── */
const preus = bloc(PAG, 'const PREUS={', '\n};');
const camps = ['revisio', 'factura', 'facturaFont', 'excedent', 'excedentFont', 'rendiment',
  'rendimentFont', 'cost', 'costFont', 'ajut', 'ajutMax', 'ajutFont', 'vida', 'operacio', 'operacioFont'];
const falten = camps.filter(c => !new RegExp('\\b' + c + ':').test(preus));
if (!falten.length) ok(`els ${camps.length} camps de preus i referències hi són, fonts incloses`);
else bad(`a la taula de preus li falten ${falten.join(', ')} — una xifra de diners sense font ` +
  'no es pot discutir amb ningú');
const data = (preus.match(/revisio:'([^']+)'/) || [])[1];
if (data && (PAG.match(/PREUS\.revisio/g) || []).length >= 1 && PAG.includes('sense data menteix'))
  ok(`i la data de revisió («${data}») es pinta a la pàgina, no es queda al codi`);
else bad('la data de revisió no surt a la pantalla: qui llegeixi les xifres no sabrà de quan són');

/* ── 3 · L'ajut porta sostre, i s'aplica ────────────────────────────────── */
const neta = bloc(PAG, 'const ajutRebut=', ';');
if (/Math\.min\([^)]*ajutMax\)/.test(neta) || /ajutMax/.test(neta))
  ok('l\'ajut es calcula amb el seu sostre: el percentatge sol deixaria un forat de cinc xifres');
else bad('l\'ajut s\'aplica com a percentatge sense sostre — amb 40 kWp, comptar el 40% dona ' +
  '16.800 € quan el màxim per projecte és 3.000');
const max = (preus.match(/ajutMax:(\d+)/) || [])[1];
if (max === '3000') ok(`i el sostre és el de la convocatòria: ${max} € per projecte`);
else bad(`el sostre de l'ajut diu ${max || '?'} i el del Programa 4 de l'ICAEN és 3.000 € per projecte`);

/* ── 4 · La coincidència horària ────────────────────────────────────────── */
const coin = (PAG.match(/const COINCIDENCIA=(\d+)/) || [])[1];
if (!coin) bad('no es declara la coincidència horària: sense aquest número, l\'estalvi que dona ' +
  'la pàgina no és comparable amb cap altre');
else if (Number(coin) > 0 && Number(coin) < 100) {
  ok(`la coincidència horària es declara i és conservadora: ${coin}%`);
  if (/id="inCoin"/.test(PAG) && /mCoin/.test(PAG))
    ok('i surt a la pantalla i es pot canviar: no és una hipòtesi amagada');
  else bad('la coincidència horària no és visible ni editable a la pàgina');
} else bad(`la coincidència horària és ${coin}%: suposar-la del 100% regala un 25% d'estalvi que no existeix`);

/* ── 5 · El cost d'operació i el que no s'inclou ────────────────────────── */
if (/operacio=inversio\(\)\*PREUS\.operacio/.test(PAG))
  ok('el cost d\'operació es descompta de l\'estalvi de cada llar');
else bad('el cost d\'operació no es descompta: prometre l\'estalvi brut és prometre una ' +
  'amortització més curta de la que serà');
if (/NO inclou/.test(PAG) && /inversor/.test(PAG))
  ok('i la pàgina diu què NO inclou l\'estimació, el canvi d\'inversor inclòs');
else bad('la pàgina no diu què queda fora de l\'estimació — qui et dona una xifra sense dir-te ' +
  'què hi ha exclòs, no te l\'està dient');

/* ── 6 · El marc legal amb la seva data ─────────────────────────────────── */
const llei = [...bloc(PAG, 'const LLEI=[', '\n];')
  .matchAll(/\{norma:'([^']+)',quan:'([^']+)',km:([\d.]+)/g)]
  .map(m => ({ norma: m[1], quan: m[2], km: +m[3] }));
if (llei.length >= 3) {
  const sensAny = llei.filter(l => !/\d{4}/.test(l.quan));
  const creix = llei.every((l, i) => i === 0 || l.km > llei[i - 1].km);
  if (!sensAny.length) ok(`les ${llei.length} normes del marc legal porten el seu any`);
  else bad(`${sensAny.map(l => l.norma).join(', ')} no porta any: una distància sense any no vol dir res`);
  if (creix) ok(`i van en ordre, del radi més petit al vigent: ${llei[0].km * 1000} m → ${llei[llei.length - 1].km} km`);
  else bad('les normes no van en ordre de radi creixent: la taula no explica el que diu que explica');
} else bad('el marc legal té menys de tres normes: l\'autoconsum compartit ha canviat quatre vegades ' +
  'en set anys i la taula ha de deixar-ho veure');

/* ── 7 · Aquí no es contracta res ───────────────────────────────────────── */
const inputs = PAG.match(/<input[^>]*>/g) || [];
const perillosos = inputs.filter(c => /iban|targeta|tarjeta|\bcups\b|titular|dni|cvv/i.test(c));
if (!perillosos.length) ok('cap camp demana dades bancàries, el CUPS ni res que identifiqui un subministrament');
else bad(`${pl(perillosos.length, 'camp demana', 'camps demanen')} dades sensibles: ${perillosos[0]}`);
if (!/(s'ha (contractat|donat d'alta)|contracte confirmat|alta confirmada|instal·lació contractada)/i.test(PAG))
  ok('i enlloc es diu que s\'hagi contractat o donat d\'alta res: aquí es planifica i s\'estima');
else bad('la pàgina diu que s\'ha contractat o donat d\'alta alguna cosa, i no pot saber-ho');

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} a L'Energia.`
  : '\n✅ El mapa és el del catàleg, els preus porten data i l\'estimació diu què no inclou.');
process.exit(fails ? 1 : 0);
