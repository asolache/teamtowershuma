#!/usr/bin/env node
/* Els beneficis del SOS, amb les xifres tretes del propi SOS
 * ─────────────────────────────────────────────────────────────────────────────
 * La portada de l'app deia **què és** el SOS —cohesió, diagnòstic,
 * sostenibilitat— i no deia mai **què s'hi guanya**. Qui hi arribava havia de
 * deduir per què val la pena muntar això a la seva comunitat, i la resposta
 * honesta d'una eina que compta valor és una xifra, no un adjectiu.
 *
 * ── Per què es genera ───────────────────────────────────────────────────────
 * Perquè les xifres ja existeixen dins de l'aplicació i **escriure-les a mà a
 * la portada seria publicar-les dues vegades**. El dia que l'oracle canviï una
 * tarifa, la portada seguiria dient la vella i no petaria res: una xifra de
 * màrqueting no la comprova mai ningú.
 *
 * Aquí es llegeixen de `SOS/index.html`:
 *
 *   · `ORACLE_FMV_DEFAULTS`   — què val una hora, per ofici
 *   · `ORACLE_OBJECT_DEFAULTS`— què val un objecte, per tipologia
 *   · `WEAR_RATES`            — quant en desgasta cada préstec
 *   · `FUND_UNCERTAINTY`      — la forquilla amb què es publica el fons
 *   · `FORMACIO_MODULES`      — quants mòduls té la formació
 *
 * i de `build-molekulandia.js`, quantes professions surten dels rols.
 *
 * ── La regla que no es pot relaxar ──────────────────────────────────────────
 * **Cap xifra sense la seva font a la vista, i cap estimació dita com si fos
 * comptabilitat.** És la mateixa regla que el codi de l'oracle ja porta escrita
 * al seu comentari —«un número inventat que sembli comptabilitat és pitjor que
 * no tenir-lo»— i aquí es vigila a la pantalla, que és on la llegeix la gent.
 *
 * ── Ús ──────────────────────────────────────────────────────────────────────
 *   node SOS/tools/build-beneficis.js            escriu el bloc a la portada
 *   node SOS/tools/build-beneficis.js --check    falla si està vell o incoherent
 */
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const SOS = join(ARREL, 'SOS');
const CHECK = process.argv.includes('--check');
const APP_F = join(SOS, 'index.html');
const APP = readFileSync(APP_F, 'utf8');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const eur = n => String(Math.round(n * 100) / 100).replace('.', ',');

/* ══ LLEGIR LES TAULES DE L'APP ══════════════════════════════════════════════ */
function taulaNum(nom) {
  const i = APP.indexOf('const ' + nom + '={');
  if (i < 0) return null;
  const j = APP.indexOf('}', i);
  const cos = APP.slice(i, j);
  const t = {};
  for (const m of cos.matchAll(/(\w+):([\d.]+)/g)) t[m[1]] = Number(m[2]);
  return Object.keys(t).length ? t : null;
}
const FMV = taulaNum('ORACLE_FMV_DEFAULTS');
const OBJ = taulaNum('ORACLE_OBJECT_DEFAULTS');
const WEAR = (() => {
  const i = APP.indexOf('const WEAR_RATES={');
  if (i < 0) return null;
  const cos = APP.slice(i, APP.indexOf('}', i));
  const t = {};
  for (const m of cos.matchAll(/(\w+):(\.?[\d.]+)/g)) t[m[1]] = Number(m[2]);
  return t;
})();
const INCERT = (() => { const m = APP.match(/const FUND_UNCERTAINTY=([\d.]+)/); return m ? Number(m[1]) : null; })();
const MODULS = (() => {
  const i = APP.indexOf('const FORMACIO_MODULES=[');
  if (i < 0) return 0;
  return (APP.slice(i, APP.indexOf('\n];', i)).match(/\{id:/g) || []).length;
})();
/* Les professions viuen a la taxonomia de `build-molekulandia.js`, que és qui
   la declara. Se'n llegeix el text i no se'n fa `require`, perquè requerir-lo
   n'executaria la generació sencera. */
const PROFESSIONS = (readFileSync(join(__dirname, 'build-molekulandia.js'), 'utf8')
  .match(/\{ id: '[\w-]+', nom: '[^']+', ic: '[^']*',\n\s+diu:/g) || []).length;

/* ══ EL QUE SE'N DEDUEIX ═════════════════════════════════════════════════════
   Res d'això és una xifra nova: són les mateixes taules, llegides. L'exemple
   del préstec es calcula com el calcula `loanValue()` —valor × desgast—, i es
   tria la tipologia amb més diferència entre comprar i agafar prestat, que és
   la que explica millor per què una biblioteca de les coses estalvia. */
const hMin = Math.min(...Object.values(FMV || {}));
const hMax = Math.max(...Object.values(FMV || {}));
const hBase = (FMV || {}).altres;
const wMin = Math.min(...Object.values(WEAR || {}));
const wMax = Math.max(...Object.values(WEAR || {}));

const exemple = (() => {
  if (!OBJ || !WEAR) return null;
  let millor = null;
  Object.entries(OBJ).forEach(([tip, base]) => {
    if (tip === 'altres') return;
    const rate = WEAR[tip];
    if (!rate) return;
    const cost = base * rate;
    if (!millor || base - cost > millor.base - millor.cost) millor = { tip, base, rate, cost };
  });
  return millor;
})();
const TIPUS_NOM = { bricolatge: 'bricolatge', cuina: 'cuina', jardineria: 'jardineria', neteja: 'neteja',
  electronica: 'electrònica', festes: 'festes', esport: 'esport', infancia: 'infància',
  costura: 'costura', salut: 'salut', altres: 'altres' };

/* ══ EL BLOC ═════════════════════════════════════════════════════════════════
   Tres beneficis i no cinc: el fons que la comunitat ja té i no comptava, el
   que cada persona n'aprèn, i el que cada persona s'estalvia. Són les tres
   coses per les quals algú diu que sí a muntar això, i les tres porten xifra.

   La quarta caixa no és un benefici: és la traducció a una organització, i va
   a part perquè el focus segueix sent comunitari i barrejar-ho ho difuminaria. */
function bloc() {
  const f = [];
  f.push('<div class="ob-benef">');
  f.push('  <div class="obb-cap">Què hi guanya qui s\'hi posa</div>');
  f.push('  <div class="obb-grid">');

  // 1 · El fons. El valor acumulat de la comunitat, publicat com un fons.
  f.push('    <div class="obb b1">');
  f.push('      <div class="obb-k">Un fons que ja teniu</div>');
  f.push('      <p class="obb-d">Les hores, els objectes, el talent i els diners que ja es mouen, <b>comptats com un sol fons</b>: cada línia amb la seva quantitat, la seva tarifa i d\'on surt. És el patrimoni que la comunitat té i no sortia a cap paper.</p>');
  f.push(`      <div class="obb-n"><b>${eur(hBase)} €/h</b><span>de referència, i cada node pot canviar-la</span></div>`);
  f.push(`      <div class="obb-n"><b>± ${Math.round(INCERT * 100)} %</b><span>de forquilla: es publica com una estimació, no com una factura</span></div>`);
  f.push('    </div>');

  // 2 · El desenvolupament. El que se n'endú la persona, i que és seu.
  f.push('    <div class="obb b2">');
  f.push('      <div class="obb-k">El que aprèn cada persona</div>');
  f.push('      <p class="obb-d">Sostenir una dinàmica és un ofici, i aquí es pot aprendre i <b>acreditar</b>. El certificat el signa qui ha vist la feina i <b>és de la persona</b>: se l\'endú encara que plegui del projecte.</p>');
  f.push(`      <div class="obb-n"><b>${PROFESSIONS} professions</b><span>sortides dels rols reals de les dinàmiques</span></div>`);
  f.push(`      <div class="obb-n"><b>${MODULS} mòduls</b><span>de N0 a N3, i el que fas queda al teu registre</span></div>`);
  f.push('    </div>');

  // 3 · L'estalvi. El que es nota a la butxaca de cadascú.
  f.push('    <div class="obb b3">');
  f.push('      <div class="obb-k">El que s\'estalvia cada persona</div>');
  f.push('      <p class="obb-d">Una hora rebuda és una hora que no es paga al mercat. I una eina que s\'agafa prestada <b>costa el desgast, no el preu</b>: es paga l\'ús, no la compra.</p>');
  f.push(`      <div class="obb-n"><b>${eur(hMin)}–${eur(hMax)} €/h</b><span>segons l\'ofici, de l\'oracle del banc de temps</span></div>`);
  if (exemple) f.push(`      <div class="obb-n"><b>${eur(exemple.cost)} €</b><span>costa un préstec d\'una eina de ${esc(TIPUS_NOM[exemple.tip] || exemple.tip)} de ${eur(exemple.base)} €, que és el ${eur(exemple.rate * 100)} % de desgast</span></div>`);
  f.push('    </div>');

  f.push('  </div>');
  f.push('  <p class="obb-rsc"><b>En una organització és el mateix esquelet amb un altre nom.</b> Una empresa, una cooperativa o una federació d\'entitats hi pot muntar un programa de <b>responsabilitat social amb les seves persones</b> —banc de temps intern, biblioteca d\'eines, voluntariat comptat, mentoria entre companys— i mesurar-lo amb les mateixes xifres. Amb una diferència que no és petita: <b>el que aporta cada persona queda al seu registre</b>, no al de l\'empresa, i se\'n va amb ella.</p>');
  f.push('  <p class="obb-font">Les xifres són <b>els valors de referència que porta el SOS</b> i es poden canviar node per node. Es publiquen com el que són —estimacions amb forquilla— perquè un número inventat que sembli comptabilitat és pitjor que no tenir-lo.</p>');
  f.push('</div>');
  return f.join('\n');
}

/* ══ LES GUARDES ═════════════════════════════════════════════════════════════ */

// 1 · Les cinc taules hi són. Si l'app en reanomena una, aquí peta abans que la
//     portada es quedi amb la xifra vella sense que ho vegi ningú.
(() => {
  const falten = [['ORACLE_FMV_DEFAULTS', FMV], ['ORACLE_OBJECT_DEFAULTS', OBJ],
    ['WEAR_RATES', WEAR], ['FUND_UNCERTAINTY', INCERT], ['FORMACIO_MODULES', MODULS]]
    .filter(([, v]) => !v).map(([n]) => n);
  if (falten.length) bad('no es troben a l\'app: ' + falten.join(', '));
  else ok('les cinc fonts de l\'app es llegeixen');
})();

// 2 · Les professions surten de la taxonomia, no d'una constant escrita aquí.
if (!PROFESSIONS) bad('no es compten les professions de build-molekulandia.js');
else ok(`${PROFESSIONS} professions i ${MODULS} mòduls, comptats de la seva declaració`);

// 3 · L'exemple del préstec ha de ser un estalvi de debò. Si un dia el desgast
//     pugés tant que agafar prestat costés com comprar, la frase seria falsa.
(() => {
  if (!exemple) { bad('no es pot construir l\'exemple de préstec'); return; }
  if (exemple.cost >= exemple.base * .5) bad(`el préstec ja no estalvia: ${eur(exemple.cost)} € sobre ${eur(exemple.base)} €`);
  else ok(`l'exemple estalvia de debò: ${eur(exemple.cost)} € per préstec contra ${eur(exemple.base)} € de compra`);
})();

// 4 · La forquilla de l'hora ha de ser una forquilla. Amb un sol preu per a
//     tots els oficis, dir «segons l'ofici» seria mentida.
if (hMin >= hMax) bad('totes les hores valen igual: la forquilla no diu res');
else ok(`l'hora va de ${eur(hMin)} a ${eur(hMax)} € segons l'ofici`);

// 5 · Cap xifra sense font ni sense forquilla a la vista. És la regla de
//     l'oracle, comprovada a la pantalla i no al comentari del codi.
(() => {
  const b = bloc();
  const teFont = /valors de referència que porta el SOS/.test(b);
  const teForquilla = /estimacions amb forquilla/.test(b) && /±/.test(b);
  if (teFont && teForquilla) ok('el bloc diu d\'on surten les xifres i que són estimacions');
  else bad('falta dir la font de les xifres o que són estimacions amb forquilla');
})();

// 6 · La traducció a una organització hi ha de ser, i ha de dir la condició que
//     la fa acceptable: el registre és de la persona. Sense aquesta frase, un
//     programa de RSC és una manera que l'empresa es quedi el que aportes.
(() => {
  const b = bloc();
  if (!/responsabilitat social/i.test(b)) { bad('no es diu que serveix per a un programa de RSC en una organització'); return; }
  if (!/queda al seu registre/.test(b)) bad('es proposa RSC sense dir que el registre és de la persona, que és la condició que ho fa acceptable');
  else ok('la lectura d\'organització hi és, i amb la condició escrita');
})();

/* ══ ESCRIURE ════════════════════════════════════════════════════════════════ */
const OBRE = '<!--SOS-BENEFICIS-->', TANCA = '<!--/SOS-BENEFICIS-->';
const i = APP.indexOf(OBRE), j = APP.indexOf(TANCA);
if (i < 0 || j < 0) {
  bad('falten les marques ' + OBRE + ' … ' + TANCA + ' a SOS/index.html');
} else {
  const nou = OBRE + '\n' + bloc() + '\n' + TANCA;
  const actual = APP.slice(i, j + TANCA.length);
  if (actual === nou) ok('el bloc de la portada és al dia');
  else if (CHECK) bad('el bloc de la portada està desactualitzat — torna a executar build-beneficis.js');
  else { writeFileSync(APP_F, APP.slice(0, i) + nou + APP.slice(j + TANCA.length)); ok('bloc escrit a SOS/index.html'); }
}

console.log(fails ? '\n❌ Els beneficis no quadren amb el que diu l\'app.'
  : `\n✅ Beneficis al dia · hora ${eur(hMin)}–${eur(hMax)} €, fons ± ${Math.round(INCERT * 100)} %, ` +
    `${PROFESSIONS} professions, ${MODULS} mòduls.`);
process.exit(fails ? 1 : 0);
