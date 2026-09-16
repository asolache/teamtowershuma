#!/usr/bin/env node
/* Molekulon · l'estat líquid, generat del model i no escrit a mà
 * ─────────────────────────────────────────────────────────────────────────────
 * `SOS/molekulon.html` és la porta d'entrada d'un cas d'ús: **Molekulandia com
 * a estat líquid**. La pàgina ensenya set federacions, onze cases, tres mapes
 * de valor i una comparació d'esquelets — i cap d'aquestes quatre coses
 * s'escriu a la pàgina.
 *
 * ── Per què es genera, i no s'escriu ────────────────────────────────────────
 * Perquè les quatre coses ja existeixen a `SOS/index.html`, dins de
 * `MOLEKULANDIA_MODEL`. Una pàgina que les torni a escriure seria una segona
 * còpia: el dia que una federació canviï de nom, la còpia seguiria dient el
 * nom vell i **no petaria res**. És exactament el que `build-molekulandia.js`
 * ja resol per a les professions, i es resol igual.
 *
 * ── El fork: de model, no de codi ───────────────────────────────────────────
 * L'encàrrec era «Molekulon com a fork del SOS». Un fork de codi voldria dir
 * una segona còpia de 1,6 MB de `SOS/index.html` que divergiria la primera
 * setmana. El SOS ja té el mecanisme de fork que fa falta —`BUILTIN_MODELS` i
 * `forkModel`—, i per això Molekulandia **és un model de país més**: mateixa
 * app, mateix registre, mateixes vedes, i un món diferent a dins.
 *
 * ── La tesi que la pàgina defensa, i que aquí es calcula ────────────────────
 * Un estat sòlid neix ple d'estructura buida: Catalunya arriba amb tots els
 * seus territoris creats abans que hi hagi ningú. Un estat líquid neix
 * gairebé buit i s'omple del que la gent sosté. La diferència no és una
 * metàfora — és el nombre de nodes de l'esquelet, i es compta aquí.
 *
 * ── Ús ──────────────────────────────────────────────────────────────────────
 *   node SOS/tools/build-molekulon.js            escriu els blocs a la pàgina
 *   node SOS/tools/build-molekulon.js --check    falla si està vell o incoherent
 */
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const SOS = join(ARREL, 'SOS');
const CHECK = process.argv.includes('--check');
const APP = readFileSync(join(SOS, 'index.html'), 'utf8');
const PAG_F = join(SOS, 'molekulon.html');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const net = s => s.replace(/\\'/g, '\'').replace(/\\\\/g, '\\');

/* ══ LLEGIR EL MODEL DE L'APP ════════════════════════════════════════════════
   Regex i no `eval`: el fitxer que es llegeix és l'aplicació sencera, i
   executar-la per llegir-ne tres constants seria carregar 1,6 MB de codi de
   navegador en un procés de node per treure'n una llista de noms. */

// Talla `const NOM={ … };` al primer `\n};` de columna zero.
function bloc(nom) {
  const i = APP.indexOf('const ' + nom + '=');
  if (i < 0) return '';
  const j = APP.indexOf('\n};', i);
  return APP.slice(i, j < 0 ? APP.length : j);
}

// Els `{n:'…',p:'…'}` d'un nivell del catàleg geogràfic.
function geo(cos, nivell) {
  const k = cos.indexOf(nivell + ':[');
  if (k < 0) return [];
  let d = 0, fi = cos.length;
  for (let p = k + nivell.length + 1; p < cos.length; p++) {
    if (cos[p] === '[') d++;
    else if (cos[p] === ']' && !--d) { fi = p; break; }
  }
  return [...cos.slice(k, fi).matchAll(/\{n:'((?:[^'\\]|\\.)*)'(?:,p:'((?:[^'\\]|\\.)*)')?\}/g)]
    .map(m => ({ n: net(m[1]), p: m[2] ? net(m[2]) : null }));
}

const MOL = bloc('MOL_GEO');
const GEO = { pais: geo(MOL, 'pais'), provincia: geo(MOL, 'provincia'), comarca: geo(MOL, 'comarca') };

/* Els tres mapes de valor. Un `pairs` és `[A,B,tipus,què,tipus,què]`: el que va
   de A a B i el que torna de B a A. És el format que `expandPairs` desplega a
   l'app, i es llegeix igual aquí perquè la pàgina no inventi un tercer. */
function mapa(nivell) {
  const cos = bloc('MOL_MAPS');
  const k = cos.indexOf('\n  ' + nivell + ':{');
  if (k < 0) return null;
  const fi = cos.indexOf('\n  },', k) < 0 ? cos.length : cos.indexOf('\n  },', k);
  const tros = cos.slice(k, fi);
  const r = tros.match(/roles:\[([\s\S]*?)\]/);
  const roles = r ? [...r[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(x => net(x[1])) : [];
  const pairs = [...tros.matchAll(/\[('(?:[^'\\]|\\.)*',){5}'(?:[^'\\]|\\.)*'\]/g)]
    .map(m => [...m[0].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(x => net(x[1])));
  return { roles, pairs };
}
const MAPES = { pais: mapa('pais'), provincia: mapa('provincia'), comarca: mapa('comarca') };

// Els nivells reetiquetats i la frase del model.
const MODEL = (() => {
  const cos = bloc('MOLEKULANDIA_MODEL');
  const lv = [...cos.matchAll(/\{id:'(\w+)',label:'((?:[^'\\]|\\.)*)'\}/g)].map(m => ({ id: m[1], label: net(m[2]) }));
  const one = cos.match(/one:'((?:[^'\\]|\\.)*)'/);
  const name = cos.match(/name:'((?:[^'\\]|\\.)*)'/);
  const flag = cos.match(/flag:'([^']*)'/);
  return { levels: lv, one: one ? net(one[1]) : '', name: name ? net(name[1]) : '', flag: flag ? flag[1] : '' };
})();

/* ══ ELS ALTRES MÓNS, PER PODER COMPARAR ═════════════════════════════════════
   `skeletonSize()` de l'app és arrel + nivell 1 + nivell 2. Es calcula aquí
   igual, per als tres models, perquè la xifra que la pàgina diu no sigui una
   xifra escrita: sigui la que hi ha. */
const esquelet = nom => {
  const c = bloc(nom);
  return 1 + geo(c, 'provincia').length + geo(c, 'comarca').length;
};
const MONS = [
  { id: 'catalunya', nom: 'Catalunya', flag: '🏴', estat: 'Sòlid', n: esquelet('CAT_GEO'),
    mig: 'Comarca', diu: 'El nivell del mig és un tros de terra. Hi és tant si hi viu algú que s\'hi vulgui posar com si no.' },
  { id: 'euskadi', nom: 'Euskadi', flag: '🏴', estat: 'Sòlid', n: esquelet('EUS_GEO'),
    mig: 'Eskualdea', diu: 'Mateixa forma, uns altres noms. Un model sòlid es tradueix; no canvia de naturalesa.' },
  { id: 'molekulandia', nom: MODEL.name || 'Molekulandia', flag: MODEL.flag || '🌀', estat: 'Líquid', n: esquelet('MOL_GEO'),
    mig: 'Federació', diu: 'El nivell del mig és un tema. Existeix perquè algú el sosté, i el dia que ningú el sostingui, es buida.' }
];

/* ══ LES PORTES DE CADA CASA ═════════════════════════════════════════════════
   Quina eina del SOS obre cada edifici. La taula viu a `build-nav.js` i els
   noms dels edificis a `build-molekulandia.js`: aquí no se'n declara cap de
   nou, es llegeixen tots dos. Un `require` de `build-molekulandia.js`
   executaria la seva generació sencera, i per això se'n llegeix el text. */
const { EINES } = require('./build-nav.js');
const EDIFICIS = [...readFileSync(join(__dirname, 'build-molekulandia.js'), 'utf8')
  .matchAll(/\{ din: '(\w+)', nom: '((?:[^'\\]|\\.)*)', ic: '([^']*)'[\s\S]*?es: '((?:[^'\\]|\\.)*)'/g)]
  .map(m => ({ din: m[1], nom: net(m[2]), ic: m[3], es: net(m[4]) }));

const casaDe = nom => EDIFICIS.find(e => e.nom === nom) || null;

/* ══ ELS BLOCS ═══════════════════════════════════════════════════════════════ */

function blocEsquelet() {
  const liq = MONS.find(m => m.estat === 'Líquid');
  const sol = MONS.filter(m => m.estat === 'Sòlid').sort((a, b) => b.n - a.n)[0];
  const f = [];
  f.push('<div class="taula"><table><thead><tr><th>Món</th><th>Estat</th><th>El nivell del mig</th>' +
    '<th class="n">Nodes en néixer</th><th>Què vol dir</th></tr></thead><tbody>');
  MONS.forEach(m => {
    f.push(`<tr${m.estat === 'Líquid' ? ' class="liq"' : ''}><td><b>${m.flag} ${esc(m.nom)}</b></td>` +
      `<td><span class="est ${m.estat === 'Líquid' ? 'l' : 's'}">${m.estat}</span></td>` +
      `<td>${esc(m.mig)}</td><td class="n">${m.n}</td><td class="d">${esc(m.diu)}</td></tr>`);
  });
  f.push('</tbody></table></div>');
  f.push(`<p class="nota bo"><b>${sol.n} contra ${liq.n}.</b> Obrir ${esc(sol.nom)} al SOS crea ` +
    `${sol.n} nodes abans que hi hagi ni una persona: ${sol.n - 1} territoris que existeixen perquè ` +
    `existeixen. Obrir ${esc(liq.nom)} en crea ${liq.n}, i cap d\'ells és un tros de terra — són ` +
    `${GEO.provincia.length} temes i ${GEO.comarca.length} cases. La resta del món <b>no existeix ` +
    'fins que algú s\'hi posa</b>.</p>');
  return f.join('\n');
}

function blocNivells() {
  const BASE = { pais: 'País', provincia: 'Província', comarca: 'Comarca', municipi: 'Municipi', barri: 'Barri' };
  const f = ['<div class="taula"><table><thead><tr><th>Nivell del SOS</th><th>A un estat sòlid</th>' +
    '<th>A Molekulandia</th><th>Què hi ha, de debò</th></tr></thead><tbody>'];
  const QUE = {
    pais: 'El món sencer. Un de sol.',
    provincia: 'Un tema que algú sosté: les cures, l\'aliment, l\'energia. No té fronteres.',
    comarca: 'Un edifici del poble. És on passa la cosa.',
    municipi: 'La gent que manté una casa oberta. Es fa i es desfà.',
    barri: 'Una taula concreta: un projecte, una compra, una setmana.'
  };
  MODEL.levels.forEach(l => {
    f.push(`<tr><td class="mono mut">${l.id}</td><td class="mut">${BASE[l.id] || l.id}</td>` +
      `<td><b>${esc(l.label)}</b></td><td class="d">${esc(QUE[l.id] || '')}</td></tr>`);
  });
  f.push('</tbody></table></div>');
  f.push('<p class="nota">Els <b>identificadors no canvien</b> —segueixen sent <span class="mono">pais</span>, ' +
    '<span class="mono">provincia</span>, <span class="mono">comarca</span>—, només canvia com es diuen a la ' +
    'pantalla. És el que fa que un apunt d\'hores de Molekulandia i un de Terrassa siguin <b>el mateix tipus ' +
    'd\'apunt</b>, i que el registre no s\'hagi de partir en dos.</p>');
  return f.join('\n');
}

function blocFederacions() {
  const f = ['<div class="feds">'];
  GEO.provincia.forEach(p => {
    const cases = GEO.comarca.filter(c => c.p === p.n);
    f.push('<div class="fed">');
    f.push(`<h4>${esc(p.n)}</h4>`);
    f.push(`<div class="k">${cases.length === 1 ? '1 casa' : cases.length + ' cases'}</div>`);
    f.push('<ul>' + cases.map(c => {
      const e = casaDe(c.n);
      return `<li>${e ? e.ic + ' ' : ''}${esc(c.n)}</li>`;
    }).join('') + '</ul>');
    f.push('</div>');
  });
  f.push('</div>');
  return f.join('\n');
}

function blocCases() {
  const f = ['<div class="cases">'];
  GEO.comarca.forEach(c => {
    const e = casaDe(c.n);
    const eina = e && EINES[e.din];
    f.push('<div class="casa">');
    f.push(`<div class="ct"><span class="ic">${e ? e.ic : '🏠'}</span><b>${esc(c.n)}</b>` +
      `<span class="tema">${esc(c.p || '')}</span></div>`);
    if (e) f.push(`<p class="d">${esc(e.es)}</p>`);
    if (eina) f.push(`<a class="porta" href="${eina[0]}">${esc(eina[1])} →</a>`);
    else f.push('<span class="sense">Encara no hi ha cap eina pròpia: es fa des de dins de l\'app.</span>');
    f.push('</div>');
  });
  f.push('</div>');
  return f.join('\n');
}

function blocMapes() {
  const LBL = { pais: 'Món', provincia: 'Federació', comarca: 'Casa' };
  const f = [];
  ['pais', 'provincia', 'comarca'].forEach(lv => {
    const m = MAPES[lv];
    if (!m) return;
    f.push('<section class="box">');
    f.push(`<h3>${esc((MODEL.levels.find(x => x.id === lv) || {}).label || LBL[lv])} ` +
      `<span class="mut mono">${lv}</span></h3>`);
    f.push(`<p class="lead">${m.roles.length} rols i ${m.pairs.length} intercanvis. ` +
      'Cap rol és un càrrec: són <b>funcions que algú fa mentre les fa</b>.</p>');
    f.push('<div class="rols">' + m.roles.map(r => `<span>${esc(r)}</span>`).join('') + '</div>');
    f.push('<div class="taula"><table><thead><tr><th>De</th><th>Dona</th><th>A</th><th>I en rep</th></tr></thead><tbody>');
    m.pairs.forEach(p => {
      f.push(`<tr><td><b>${esc(p[0])}</b></td><td class="d"><span class="kd ${p[2] === 'tangible' ? 'tg' : 'in'}">` +
        `${p[2] === 'tangible' ? 'tangible' : 'intangible'}</span> ${esc(p[3])}</td>` +
        `<td><b>${esc(p[1])}</b></td><td class="d"><span class="kd ${p[4] === 'tangible' ? 'tg' : 'in'}">` +
        `${p[4] === 'tangible' ? 'tangible' : 'intangible'}</span> ${esc(p[5])}</td></tr>`);
    });
    f.push('</tbody></table></div>');
    f.push('</section>');
  });
  return f.join('\n');
}

const BLOCS = {
  'MK-ESQUELET': blocEsquelet,
  'MK-NIVELLS': blocNivells,
  'MK-FEDERACIONS': blocFederacions,
  'MK-CASES': blocCases,
  'MK-MAPES': blocMapes
};

/* ══ LES GUARDES ═════════════════════════════════════════════════════════════
   Cadascuna vigila una manera concreta que això es podria podrir sense que
   petés res. */

// 1 · Cada casa penja d'una federació que existeix.
(() => {
  const orfes = GEO.comarca.filter(c => !GEO.provincia.some(p => p.n === c.p));
  if (orfes.length) bad('cases sense federació: ' + orfes.map(c => c.n).join(', '));
  else ok(`${GEO.comarca.length} cases, totes sota una de les ${GEO.provincia.length} federacions`);
})();

// 2 · Cap federació buida. Un tema sense cap casa és un titular, no un nivell.
(() => {
  const buides = GEO.provincia.filter(p => !GEO.comarca.some(c => c.p === p.n));
  if (buides.length) bad('federacions sense cap casa: ' + buides.map(p => p.n).join(', '));
  else ok('cap federació buida');
})();

// 3 · Tot rol d'un intercanvi surt de la llista de rols del seu nivell.
(() => {
  let mal = 0;
  Object.entries(MAPES).forEach(([lv, m]) => {
    if (!m) { bad('falta el mapa de valor de ' + lv); mal++; return; }
    m.pairs.forEach(p => [p[0], p[1]].forEach(r => {
      if (!m.roles.includes(r)) { bad(`${lv}: l'intercanvi cita «${r}», que no és un rol declarat`); mal++; }
    }));
  });
  if (!mal) ok('tots els intercanvis dels tres mapes citen rols declarats');
})();

// 4 · Cap rol declarat i no fet servir: un rol sense cap fletxa no fa res.
(() => {
  let mal = 0;
  Object.entries(MAPES).forEach(([lv, m]) => {
    if (!m) return;
    m.roles.forEach(r => {
      if (!m.pairs.some(p => p[0] === r || p[1] === r)) { bad(`${lv}: el rol «${r}» no dona ni rep res`); mal++; }
    });
  });
  if (!mal) ok('cap rol dibuixat sense cap intercanvi');
})();

// 5 · Els cinc nivells del SOS, en ordre. Un model que se n'inventi un de nou
//     trencaria la consolidació entre nivells i no petaria fins molt més tard.
(() => {
  const base = ['pais', 'provincia', 'comarca', 'municipi', 'barri'];
  const ids = MODEL.levels.map(l => l.id);
  if (ids.join(',') !== base.join(',')) bad('els nivells no són els del SOS: ' + ids.join(','));
  else if (MODEL.levels.some(l => !l.label)) bad('hi ha un nivell sense etiqueta pròpia');
  else ok('cinc nivells del SOS, reetiquetats: ' + MODEL.levels.map(l => l.label).join(' › '));
})();

// 6 · La tesi de la pàgina ha de ser certa. Si un dia Molekulandia creix més
//     que un estat sòlid, la pàgina estaria dient una cosa falsa amb números.
(() => {
  const liq = MONS.find(m => m.estat === 'Líquid');
  const sol = MONS.filter(m => m.estat === 'Sòlid');
  if (sol.some(m => m.n <= liq.n)) bad(`l'esquelet líquid (${liq.n}) ja no és el més petit`);
  else ok(`esquelets: ${MONS.map(m => m.nom + ' ' + m.n).join(' · ')}`);
})();

// 7 · Cap porta a un fitxer que no hi és.
(() => {
  const portes = [...new Set(GEO.comarca.map(c => casaDe(c.n)).filter(Boolean)
    .map(e => EINES[e.din]).filter(Boolean).map(e => e[0]))];
  const mortes = portes.filter(p => !existsSync(join(SOS, p)));
  if (mortes.length) bad('portes a pàgines inexistents: ' + mortes.join(', '));
  else ok(`${portes.length} portes, totes obren un fitxer que hi és`);
})();

// 8 · Les cases de la pàgina són les del poble. Si `build-molekulandia.js`
//     rebateja un edifici, aquí ha de petar i no quedar-se sense icona.
(() => {
  const sense = GEO.comarca.filter(c => !casaDe(c.n));
  if (sense.length) bad('cases que no surten al poble de molekulandia.html: ' + sense.map(c => c.n).join(', '));
  else ok('les ' + GEO.comarca.length + ' cases són edificis declarats del poble');
})();

/* ══ ESCRIURE ════════════════════════════════════════════════════════════════ */
if (!existsSync(PAG_F)) {
  console.log(fails ? '\n❌ El model de Molekulandia no quadra.' : '\n✅ Model coherent. (molekulon.html encara no existeix)');
  process.exit(fails ? 1 : 0);
}

let pag = readFileSync(PAG_F, 'utf8');
let canvis = 0, vells = [];
Object.entries(BLOCS).forEach(([marca, fn]) => {
  const obre = `<!--${marca}-->`, tanca = `<!--/${marca}-->`;
  const i = pag.indexOf(obre), j = pag.indexOf(tanca);
  if (i < 0 || j < 0) { bad(`falta la marca ${marca} a molekulon.html`); return; }
  const nou = obre + '\n' + fn() + '\n' + tanca;
  const actual = pag.slice(i, j + tanca.length);
  if (actual !== nou) { canvis++; vells.push(marca); pag = pag.slice(0, i) + nou + pag.slice(j + tanca.length); }
});

if (CHECK) {
  if (canvis) bad('blocs desactualitzats: ' + vells.join(', ') + ' — torna a executar build-molekulon.js');
  else ok('els ' + Object.keys(BLOCS).length + ' blocs de molekulon.html són al dia');
  console.log(fails ? '\n❌ Molekulon no quadra.' : '\n✅ Molekulon al dia.');
  process.exit(fails ? 1 : 0);
}

if (canvis) writeFileSync(PAG_F, pag);
console.log(fails ? '\n❌ Molekulon no quadra.'
  : `\n✅ molekulon.html · ${canvis} bloc(s) escrits · ${GEO.provincia.length} federacions, ` +
    `${GEO.comarca.length} cases, esquelet de ${MONS.find(m => m.estat === 'Líquid').n} nodes.`);
process.exit(fails ? 1 : 0);
