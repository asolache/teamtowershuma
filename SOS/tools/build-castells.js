#!/usr/bin/env node
/* La pinya, de dalt i de costat · les línies de força d'una organització
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠ CORRECCIÓ. La primera versió d'aquest fitxer deia «rengla» a les columnes
 * del tronc. **És fals.** Una rengla no és vertical: és a la **pinya**, i és la
 * filera de gent que es posa **darrere de cada baix**, cap enfora, en línia
 * recta. Les rengles no es veuen mirant un castell de front — es veuen mirant
 * la pinya **des de dalt**. L'error no era de nom: era de dimensió, i es
 * carregava justament el que fa que això valgui per a una organització.
 *
 * ── L'ANATOMIA, I D'ON SURT ─────────────────────────────────────────────────
 * Al voltant del tronc, una pinya de N baixos obre **quatre menes de línia
 * radial**, de més forta a més fluixa:
 *
 *   · **rengla**   — darrere de cada baix. N de N. És la línia de força
 *                     principal: per aquí baixa el pes de debò.
 *   · **lateral**  — entre dues rengles. N més.
 *   · **vent**     — entre una rengla i un lateral. 2N més.
 *
 * D'aquí surt la regla que ho fa servir tot: **una pinya de N baixos obre 4N
 * direccions.** Un 2 n'obre 8, un 3 dotze, **un 4 setze** i un 5 vint.
 *
 * Que un 4 n'obri setze no és una casualitat bonica: és el que fa que un
 * instrument de setze factors —el 16PF— càpiga exactament en una planta de
 * castell de quatre, cada factor en una direcció.
 *
 * > **Pendent de validar amb l'Àlvar i amb en Fèlix Miret.** Aquesta anatomia
 * > està escrita de memòria i els noms canvien de colla a colla —el que aquí
 * > es diu «vent» en algun lloc es diu «mà» o «crossa de rengla». El que no
 * > canvia és **l'estructura**: rengles darrere dels baixos, laterals entre
 * > rengles, i omplert entre les unes i els altres. La visualització fa servir
 * > l'estructura, no els noms, així que una correcció de noms no la trenca.
 *
 * ── LES DUES DIMENSIONS, QUE ÉS EL QUE ES DEMANAVA ──────────────────────────
 * **Horitzontal · la planta.** Mirada des de dalt: quantes direccions té oberta
 * la casa i quanta fondària té cadascuna. És on es posa la variable —els setze
 * factors, les deu aportacions, els àmbits— i és el que fins ara no es podia
 * dibuixar.
 *
 * **Vertical · l'alçat.** El tronc: quants pisos s'intenta aguantar. És
 * l'ambició, i és la part que tothom mira.
 *
 * **I la llei que les lliga, que és el que es ven:** en castells no es guanya
 * alçada sense guanyar base. Un 4 de 8 demana folre; un de 9, folre i manilles.
 * La pinya creix més de pressa que el tronc. En una organització és igual:
 * **cada pis d'ambició que s'afegeix demana més direccions obertes, no més gent
 * a la mateixa direcció.** Qui creix el tronc i deixa la planta igual no cau
 * per dalt: cau perquè a baix no hi havia prou gent.
 *
 * ── I la lectura que només es pot fer amb les dues alhora ───────────────────
 * Una direcció amb molta càrrega **sobre un vent** és un risc: molta força per
 * una línia fluixa. Amb la planta sola no es veu, perquè la fondària es llegeix
 * igual a tot arreu; amb l'alçat sol tampoc, perquè l'alçat no sap de
 * direccions. Es veu creuant-les, i és la raó per la qual les dues vistes van
 * juntes i no en dues pantalles.
 *
 * ── La regla que no es pot trencar ──────────────────────────────────────────
 * **Això ordena i fa visible, no puntua.** Un castell no diu si una casa va bé;
 * diu on es concentra el pes i quines direccions té tancades. Cap figura hi
 * entra sense dir què vol dir en una organització, i cap xifra d'euros.
 *
 * ── Ús ──────────────────────────────────────────────────────────────────────
 *   node SOS/tools/build-castells.js            escriu el bloc
 *   node SOS/tools/build-castells.js --check    falla si està vell o incoherent
 */
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const HOME = join(ARREL, 'index.html');
const CHECK = process.argv.includes('--check');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

/* ══ LES MENES DE LÍNIA ══════════════════════════════════════════════════════
   `quantes(n)` diu quantes n'obre una pinya de n baixos, i `pes` és quanta
   càrrega aguanta aquella mena. El `pes` no és decoració: és el que permet dir
   que una direcció carregada sobre un vent és un risc. */
const MENES = [
  { id: 'rengla', nom: 'Rengla', quantes: n => n, pes: 3, gruix: 3.2, op: 1,
    diu: 'Darrere de cada baix. És per on baixa el pes de debò.' },
  { id: 'lateral', nom: 'Lateral', quantes: n => n, pes: 2, gruix: 2, op: .72,
    diu: 'Entre dues rengles. Aguanta, i no tant.' },
  { id: 'vent', nom: 'Vent', quantes: n => 2 * n, pes: 1, gruix: 1.2, op: .45,
    diu: 'Entre una rengla i un lateral. Omple i estabilitza; no és per carregar-hi.' }
];
const COL_MENA = { rengla: '#6366f1', lateral: '#00e676', vent: '#82828d' };

/* ══ LES CONSTRUCCIONS ═══════════════════════════════════════════════════════
   `baixos` és l'amplada del tronc i és el que mana: d'ell en surten les 4N
   direccions de la planta. `pisos` és l'alçada que s'intenta. */
const FIGURES = [
  {
    id: 'pilar', nom: 'El pilar', baixos: 1, pisos: 4, pinya: 9, pom: 2,
    quan: 'Tot passa per una sola direcció.',
    diu: 'Quatre direccions obertes i una sola que carrega. És la figura més alta per quanta gent té a sota i la que cau més de pressa: si falla una persona, no hi ha ningú al costat que reculli el pes. A una casa, és el projecte que s\'aguanta perquè hi ha algú que no plega mai.'
  },
  {
    id: 'torre', nom: 'La torre · el 2', baixos: 2, pisos: 5, pinya: 16, pom: 2,
    quan: 'Dues àrees que depenen l\'una de l\'altra i no tenen tercera.',
    diu: 'Vuit direccions i dues que manen. Guanya estabilitat i estrena una fragilitat nova: si una de les dues va tard, l\'altra no pot compensar-ho, només esperar. És el clàssic «comercial i producció» quan no hi ha ningú entremig.'
  },
  {
    id: 'tres', nom: 'El 3', baixos: 3, pisos: 5, pinya: 28, pom: 3,
    quan: 'Tres àmbits que es reparteixen la feina.',
    diu: 'Dotze direccions. Amb tres rengles el pes ja es reparteix de debò i una que vagi fluixa no tomba la figura: és la primera on pots perdre algú i seguir. La contrapartida és que calen tres caps que es parlin, i això no surt sol.'
  },
  {
    id: 'quatre', nom: 'El 4', baixos: 4, pisos: 5, pinya: 36, pom: 3,
    quan: 'Quatre àrees, que és on acaba la majoria de cases que creixen.',
    diu: 'Setze direccions, i per això és la planta on cap un instrument de setze factors sense forçar res. La més feta i per un motiu: reparteix prou i encara es pot coordinar. El problema d\'un 4 mai és l\'alçada — és que una de les quatre rengles vagi curta i ningú ho digui fins que es carrega el pis de dalt.'
  },
  {
    id: 'cinc', nom: 'El 5', baixos: 5, pisos: 5, pinya: 48, pom: 3,
    quan: 'Cinc àmbits o més, amb una planta que ha de créixer igual.',
    diu: 'Vint direccions i una pinya molt més gran. Aquí és on les cases s\'equivoquen: creixen el tronc —més àrees, més caps— i deixen la base igual. El castell no cau per dalt: cau perquè a baix no hi havia prou gent.'
  }
];

/* ══ LES VARIABLES ═══════════════════════════════════════════════════════════
   El que es posa a la planta. Cada dimensió ocupa una direcció i la seva
   `n` és la fondària: quanta gent hi ha en aquella línia.

   Això és el que es demanava del joc casteller: la mateixa figura, pintada per
   una altra cosa, i la distribució es veu d'un cop sense llegir cap taula.

   `fig` diu en quina construcció cap: una variable de setze dimensions demana
   una planta que n'obri setze, i una guarda ho comprova. */
const VARIABLES = [
  {
    id: 'ambits', nom: 'Els àmbits de la casa', fig: 'quatre',
    quees: 'Les àrees que ja tens: qui ven, qui produeix, qui entrega, qui administra.',
    llegeix: 'Amb els àmbits a les rengles es veu la distribució del pes real. El que es busca aquí no és simetria —cap casa n\'és— sinó <b>una direcció carregada que no tingui ningú al costat</b>.',
    dims: [
      { nom: 'Qui ven', n: 5 }, { nom: 'Qui produeix', n: 4 },
      { nom: 'Qui entrega', n: 1 }, { nom: 'Qui administra', n: 2 }
    ]
  },
  {
    id: 'aports', nom: 'El que cadascú hi posa', fig: 'tres',
    quees: 'Les deu aportacions que el SOS ja fa servir per encaixar persones i rols.',
    llegeix: 'Dotze direccions i deu aportacions: <b>les dues que sobren són la lectura</b>. Una planta amb direccions buides no és un error de dibuix — és una casa que no sap qui li posa allò, i normalment no ho sap perquè no ho ha demanat mai.',
    dims: [
      { nom: 'Temps constant', n: 6 }, { nom: 'Ordre i seguiment', n: 2 },
      { nom: 'Contactes al territori', n: 4 }, { nom: 'Un espai o un local', n: 1 },
      { nom: 'Vehicle i disponibilitat', n: 2 }, { nom: 'Un ofici o producció', n: 5 },
      { nom: 'Números i negociació', n: 1 }, { nom: 'Cura i acollida', n: 3 },
      { nom: 'Veu i difusió', n: 4 }, { nom: 'Posar-hi diners', n: 1 }
    ]
  },
  {
    id: 'setze', nom: 'Un instrument de setze factors', fig: 'quatre',
    quees: 'Setze dimensions de perfil, una per direcció. És el cas que va encendre això: posar el grup sobre la planta i veure la distribució de cop.',
    llegeix: 'Setze factors en una taula no diuen res a ningú. A la planta es veu en mig segon <b>cap on s\'inclina l\'equip i quines direccions no cobreix</b>. I una cosa que la taula no pot dir: <b>si el gruix cau sobre un vent</b> —molta força per una línia que no és per carregar-hi.',
    dims: [
      { nom: 'A', n: 5 }, { nom: 'B', n: 3 }, { nom: 'C', n: 4 }, { nom: 'E', n: 6 },
      { nom: 'F', n: 2 }, { nom: 'G', n: 5 }, { nom: 'H', n: 1 }, { nom: 'I', n: 3 },
      { nom: 'L', n: 2 }, { nom: 'M', n: 4 }, { nom: 'N', n: 1 }, { nom: 'O', n: 2 },
      { nom: 'Q1', n: 6 }, { nom: 'Q2', n: 1 }, { nom: 'Q3', n: 4 }, { nom: 'Q4', n: 2 }
    ]
  }
];

/* ══ LES DIRECCIONS D'UNA PLANTA ═════════════════════════════════════════════
   Rengles als angles principals, laterals a les bisectrius i vents entre una
   cosa i l'altra. Surten ordenades per angle, que és com es recorren mirant la
   planta: així la dimensió i-èsima d'una variable cau a la direcció i-èsima. */
function direccions(n) {
  const d = [];
  const pas = 360 / n;
  for (let k = 0; k < n; k++) {
    const a = -90 + k * pas;
    d.push({ a, mena: 'rengla' });
    d.push({ a: a + pas / 4, mena: 'vent' });
    d.push({ a: a + pas / 2, mena: 'lateral' });
    d.push({ a: a + pas * 3 / 4, mena: 'vent' });
  }
  return d.sort((x, y) => x.a - y.a);
}

/* ══ LA PLANTA · de dalt ═════════════════════════════════════════════════════ */
const P = 260, PC = P / 2, R0 = 30, PAS = 15;

function planta(f, variable) {
  const dirs = direccions(f.baixos);
  const dims = variable ? variable.dims : null;
  const p = [];

  // Els anells, per poder comptar la fondària d'un cop d'ull.
  for (let r = 1; r <= 6; r++) {
    p.push(`<circle class="pl-anell" cx="${PC}" cy="${PC}" r="${R0 + r * PAS}"/>`);
  }

  // Les direccions.
  dirs.forEach((d, i) => {
    const rad = d.a * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
    const m = MENES.find(x => x.id === d.mena);
    const fons = dims && dims[i] ? dims[i].n : 0;
    const llarg = R0 + (fons ? fons : 6) * PAS;
    p.push(`<line class="pl-l pl-${d.mena}" x1="${(PC + cos * R0).toFixed(1)}" y1="${(PC + sin * R0).toFixed(1)}" `
      + `x2="${(PC + cos * llarg).toFixed(1)}" y2="${(PC + sin * llarg).toFixed(1)}" `
      + `stroke="${COL_MENA[d.mena]}" stroke-width="${m.gruix}" opacity="${dims && !fons ? .18 : m.op}"/>`);
    // La gent d'aquella direcció, una rodona per persona.
    for (let k = 1; k <= fons; k++) {
      p.push(`<circle class="pl-g" cx="${(PC + cos * (R0 + k * PAS)).toFixed(1)}" `
        + `cy="${(PC + sin * (R0 + k * PAS)).toFixed(1)}" r="3.6" fill="${COL_MENA[d.mena]}"/>`);
    }
  });

  // El tronc vist de dalt: els baixos en rotllana al centre.
  for (let k = 0; k < f.baixos; k++) {
    const a = (-90 + k * 360 / f.baixos) * Math.PI / 180;
    const r = f.baixos === 1 ? 0 : 12;
    p.push(`<circle class="pl-baix" cx="${(PC + Math.cos(a) * r).toFixed(1)}" `
      + `cy="${(PC + Math.sin(a) * r).toFixed(1)}" r="7"/>`);
  }
  const q = variable ? ` ${variable.dims.length} dimensions de «${variable.nom}» repartides per les direccions.` : '';
  return `<svg class="pl-svg" viewBox="0 0 ${P} ${P}" role="img" aria-labelledby="plT-${f.id}${variable ? '-' + variable.id : ''}">`
    + `<title id="plT-${f.id}${variable ? '-' + variable.id : ''}">La pinya d'${esc(f.nom.toLowerCase())} vista des de dalt: `
    + `${f.baixos} ${f.baixos === 1 ? 'rengla' : 'rengles'}, ${f.baixos} laterals i ${2 * f.baixos} vents, `
    + `${4 * f.baixos} direccions en total.${esc(q)}</title>${p.join('')}</svg>`;
}

/* ══ L'ALÇAT · de costat ═════════════════════════════════════════════════════ */
const A = 200, AH = 230, BASE = 192;

function alcat(f) {
  const p = [];
  const amp = 19, x0 = A / 2 - (f.baixos - 1) * amp / 2;
  // La pinya, aquí, és la base ampla: de costat no se'n veuen les direccions.
  [[.5, 9], [.76, 13], [1, 18]].forEach(([r, n], fi) => {
    const y = BASE + fi * 12, ample = Math.min(A - 16, 50 + r * 140);
    for (let k = 0; k < n; k++) {
      const x = A / 2 - ample / 2 + (n === 1 ? ample / 2 : k * ample / (n - 1));
      p.push(`<circle class="al-pi" cx="${x.toFixed(1)}" cy="${y}" r="3.6"/>`);
    }
  });
  for (let b = 0; b < f.baixos; b++) {
    for (let pis = 0; pis < f.pisos; pis++) {
      p.push(`<rect class="al-p" x="${(x0 + b * amp - 7).toFixed(1)}" y="${BASE - 14 - pis * 23}" `
        + `width="14" height="19" rx="4" fill="${b % 2 ? '#00e676' : '#6366f1'}"/>`);
    }
  }
  const yTop = BASE - 14 - (f.pisos - 1) * 23;
  for (let k = 0; k < f.pom; k++) {
    p.push(`<circle class="al-pom" cx="${A / 2}" cy="${(yTop - 7 - k * 12).toFixed(1)}" r="5"/>`);
  }
  return `<svg class="al-svg" viewBox="0 0 ${A} ${AH}" role="img" aria-labelledby="alT-${f.id}">`
    + `<title id="alT-${f.id}">${esc(f.nom)} de costat: un tronc de ${f.baixos} `
    + `per ${f.pisos} pisos sobre una pinya de ${f.pinya} persones.</title>${p.join('')}</svg>`;
}

/* ══ EL BLOC ═════════════════════════════════════════════════════════════════ */
function bloc() {
  const f = [];
  f.push('<!--TT-CASTELLS-->');
  f.push('<!-- GENERAT per SOS/tools/build-castells.js · no s\'edita a mà -->');
  f.push('<div class="ct-wrap fade-up">');

  /* ── 1 · Les dues vistes, i la llei que les lliga ──────────────────────── */
  f.push('  <div class="ct-tria" role="tablist" aria-label="Construccions">');
  FIGURES.forEach((x, i) => f.push(`    <button type="button" class="ct-t${i === 3 ? ' on' : ''}" `
    + `role="tab" aria-selected="${i === 3}" aria-controls="ct-p-${x.id}" id="ct-t-${x.id}" `
    + `data-f="${x.id}">${esc(x.nom)} <span class="ct-tn">${4 * x.baixos}</span></button>`));
  f.push('  </div>');

  FIGURES.forEach((x, i) => {
    f.push(`  <div class="ct-pan" id="ct-p-${x.id}" role="tabpanel" aria-labelledby="ct-t-${x.id}"${i === 3 ? '' : ' hidden'}>`);
    f.push('    <figure class="ct-v"><div class="ct-viz">' + planta(x) + '</div>'
      + '<figcaption>De dalt · la planta de la pinya</figcaption></figure>');
    f.push('    <figure class="ct-v"><div class="ct-viz">' + alcat(x) + '</div>'
      + '<figcaption>De costat · el tronc</figcaption></figure>');
    f.push('    <div class="ct-txt">');
    f.push(`      <div class="ct-k">${4 * x.baixos} direccions · ${x.baixos} `
      + `${x.baixos === 1 ? 'rengla' : 'rengles'} · ${x.pinya} persones a la pinya</div>`);
    f.push(`      <p class="ct-quan">${esc(x.quan)}</p>`);
    f.push(`      <p class="ct-diu">${esc(x.diu)}</p>`);
    f.push('    </div>');
    f.push('  </div>');
  });

  // La llegenda de les tres menes, que és el que fa llegible tota la resta.
  f.push('  <div class="ct-men">' + MENES.map(m =>
    `<span class="ct-m"><i style="background:${COL_MENA[m.id]};height:${m.gruix}px"></i>`
    + `<b>${esc(m.nom)}</b> ${esc(m.diu)}</span>`).join('') + '</div>');

  f.push(`  <p class="ct-llei"><b>La llei que lliga les dues vistes:</b> en castells no es guanya `
    + 'alçada sense guanyar base — un 4 de 8 demana folre, i un de 9, folre i manilles. '
    + '<b>La pinya creix més de pressa que el tronc.</b> En una casa és igual: cada pis d\'ambició '
    + 'que s\'afegeix demana <b>més direccions obertes</b>, no més gent a la mateixa direcció.</p>');

  /* ── 2 · La variable · la mateixa planta, pintada per una altra cosa ───── */
  f.push('  <div class="ct-var">');
  f.push('    <div class="ct-k">I ara, què hi poses</div>');
  f.push('    <div class="ct-tria ct-tv" role="tablist" aria-label="Variables">');
  VARIABLES.forEach((v, i) => f.push(`      <button type="button" class="ct-t${i === 0 ? ' on' : ''}" `
    + `role="tab" aria-selected="${i === 0}" aria-controls="ct-v-${v.id}" id="ct-tv-${v.id}" `
    + `data-v="${v.id}">${esc(v.nom)} <span class="ct-tn">${v.dims.length}</span></button>`));
  f.push('    </div>');
  VARIABLES.forEach((v, i) => {
    const fig = FIGURES.find(x => x.id === v.fig);
    const buides = 4 * fig.baixos - v.dims.length;
    const carregades = v.dims.map((d, k) => ({ d, dir: direccions(fig.baixos)[k] }))
      .filter(x => x.dir.mena === 'vent' && x.d.n >= 4);
    f.push(`    <div class="ct-pan ct-pv" id="ct-v-${v.id}" role="tabpanel" aria-labelledby="ct-tv-${v.id}"${i ? ' hidden' : ''}>`);
    f.push('      <figure class="ct-v"><div class="ct-viz">' + planta(fig, v) + '</div>'
      + `<figcaption>${esc(v.dims.length)} dimensions sobre ${4 * fig.baixos} direccions</figcaption></figure>`);
    f.push('      <div class="ct-txt">');
    f.push(`        <p class="ct-quan">${esc(v.quees)}</p>`);
    f.push(`        <p class="ct-diu">${v.llegeix}</p>`);
    f.push('        <ul class="ct-ll">' + v.dims.map((d, k) => {
      const dir = direccions(fig.baixos)[k];
      return `<li><i style="background:${COL_MENA[dir.mena]}"></i>${esc(d.nom)} <b>${d.n}</b></li>`;
    }).join('') + '</ul>');
    const avis = [];
    if (buides > 0) avis.push(`<b>${buides} ${buides === 1 ? 'direcció queda buida' : 'direccions queden buides'}</b>`);
    if (carregades.length) avis.push(`<b>${pl(carregades.length, 'dimensió carregada', 'dimensions carregades')} `
      + `sobre un vent</b> (${carregades.map(x => esc(x.d.nom)).join(', ')}): molta força per una línia que no és per carregar-hi`);
    if (avis.length) f.push(`        <p class="ct-risc">${avis.join(' · ')}.</p>`);
    f.push('      </div>');
    f.push('    </div>');
  });
  f.push('  </div>');

  f.push('  <p class="ct-avis">Això ordena i fa visible; <b>no puntua</b>. Un castell no diu si una casa '
    + 'va bé: diu on es concentra el pes i quines direccions té tancades, que és una altra cosa i és '
    + 'la que serveix per decidir.</p>');
  f.push('</div>');
  f.push('<!--/TT-CASTELLS-->');
  return f.join('\n');
}

/* ══ LES GUARDES ═════════════════════════════════════════════════════════════ */

/* 1 · LA QUE IMPORTA · una pinya de N baixos obre 4N direccions, i la planta
      n'ha de dibuixar exactament aquestes. Una planta amb tres rengles per a un
      castell de quatre no peta: és una figura que no existeix, dibuixada com si
      existís, i la llegiria tothom sense adonar-se'n. */
(() => {
  const mal = FIGURES.filter(x => {
    const d = direccions(x.baixos);
    const n = m => d.filter(y => y.mena === m).length;
    return d.length !== 4 * x.baixos || n('rengla') !== x.baixos
      || n('lateral') !== x.baixos || n('vent') !== 2 * x.baixos;
  });
  if (mal.length) bad('plantes que no obren les direccions que els toca: ' + mal.map(x => x.nom).join(', '));
  else ok(`${FIGURES.length} construccions, totes amb 4N direccions: `
    + FIGURES.map(x => `${x.nom.replace(/^(El|La) /, '')} ${4 * x.baixos}`).join(' · '));
})();

// 2 · I el dibuix ha de tenir les línies que el càlcul diu.
(() => {
  const mal = FIGURES.filter(x => (planta(x).match(/class="pl-l /g) || []).length !== 4 * x.baixos);
  if (mal.length) bad('plantes dibuixades amb un nombre de línies diferent del calculat: '
    + mal.map(x => x.nom).join(', '));
  else ok('i el dibuix en té exactament aquestes, no les que quedaven bé');
})();

/* 3 · Cap variable que no càpiga a la seva planta. Una variable de setze
      dimensions sobre una planta de dotze perdria quatre factors **en silenci**:
      es dibuixarien les dotze primeres i el client llegiria el resultat com si
      fos sencer. */
(() => {
  const mal = VARIABLES.map(v => {
    const f = FIGURES.find(x => x.id === v.fig);
    return !f ? `${v.id} → figura «${v.fig}» inexistent`
      : (v.dims.length > 4 * f.baixos
        ? `${v.id}: ${v.dims.length} dimensions en una planta de ${4 * f.baixos}` : null);
  }).filter(Boolean);
  if (mal.length) bad('variables que no caben a la seva planta: ' + mal.join('; ')
    + ' — les que sobrin no es dibuixarien i ningú ho sabria');
  else ok(`${VARIABLES.length} variables, totes caben a la planta que demanen`);
})();

/* 4 · El 16 no és casualitat i s'ha de poder comprovar: ha d'existir una
      construcció que n'obri exactament setze, o la tesi que un instrument de
      setze factors hi cap es queda sense dibuix. */
(() => {
  const q = FIGURES.find(x => 4 * x.baixos === 16);
  const v = VARIABLES.find(x => x.dims.length === 16);
  if (!q) bad('cap construcció obre 16 direccions: la tesi del 16PF es queda sense planta');
  else if (!v) bad('cap variable de 16 dimensions: la planta de 16 es queda sense cas');
  else if (v.fig !== q.id) bad(`la variable de 16 dimensions no va sobre «${q.nom}»`);
  else ok(`«${q.nom}» obre 16 direccions i «${v.nom}» les omple: el 16 quadra`);
})();

// 5 · Cap figura sense dir què vol dir en una casa, o és decoració castellera.
(() => {
  const mudes = FIGURES.filter(x => !x.diu || x.diu.length < 80 || !x.quan);
  if (mudes.length) bad('figures sense la lectura per a una organització: ' + mudes.map(x => x.id).join(', '));
  else ok('i totes diuen què vol dir aquella planta en una casa, no només com es diu');
})();

/* 6 · Les dues vistes han de sortir totes dues. La planta sola no sap d'alçada
      i l'alçat sol no sap de direccions: la lectura que es ven només existeix
      creuant-les. */
(() => {
  const b = bloc();
  const np = (b.match(/class="pl-svg"/g) || []).length;
  const na = (b.match(/class="al-svg"/g) || []).length;
  if (na < FIGURES.length || np < FIGURES.length)
    bad(`${np} plantes i ${na} alçats per a ${FIGURES.length} figures: les dues vistes han d'anar juntes`);
  else if (!/no es guanya\s+alçada sense guanyar base/.test(b.replace(/\s+/g, ' ')))
    bad('falta la llei que lliga les dues vistes: sense ella són dos dibuixos i no un argument');
  else ok(`${np} plantes i ${na} alçats, i la llei que les lliga escrita`);
})();

// 7 · Cap xifra d'euros: això ordena i fa visible, no pressuposta.
(() => {
  if (/\d[\d.]*\s*€/.test(bloc())) bad('el bloc porta xifres d\'euros: aquesta secció no ven cap preu');
  else ok('cap preu al bloc: ordena i fa visible, no pressuposta');
})();

/* ══ ESCRIURE O COMPROVAR ════════════════════════════════════════════════════ */
if (!existsSync(HOME)) bad('no existeix index.html');
else if (!fails) {
  const src = readFileSync(HOME, 'utf8');
  const a = src.indexOf('<!--TT-CASTELLS-->'), b = src.indexOf('<!--/TT-CASTELLS-->');
  if (a < 0 || b < 0 || b < a) bad('falten les marques <!--TT-CASTELLS--> a index.html');
  else {
    const out = src.slice(0, a) + bloc() + src.slice(b + '<!--/TT-CASTELLS-->'.length);
    if (CHECK) {
      if (out !== src) bad('index.html no correspon a la declaració de build-castells.js');
      else ok('el bloc de la pinya està al dia');
    } else if (out !== src) writeFileSync(HOME, out);
  }
}

if (CHECK) {
  console.log(fails ? '\n❌ Arregla-ho amb:  node SOS/tools/build-castells.js' : '\n✅ La pinya quadra.');
  process.exit(fails ? 1 : 0);
}
if (fails) { console.log('\n❌ No s\'ha escrit res.'); process.exit(1); }
console.log(`\n✅ index.html · ${FIGURES.length} plantes de ${4 * FIGURES[0].baixos} a `
  + `${4 * FIGURES[FIGURES.length - 1].baixos} direccions, i ${VARIABLES.length} variables`);

module.exports = { FIGURES, VARIABLES, MENES, direccions };
