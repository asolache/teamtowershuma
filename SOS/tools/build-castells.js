#!/usr/bin/env node
/* Les rengles · agrupar els rols d'un mapa per línies de força
 * ─────────────────────────────────────────────────────────────────────────────
 * Un mapa de valor amb quinze rols és una bola de fletxes. Es llegeix bé a la
 * sala, amb algú explicant-lo, i es llegeix malament sol —que és com el mira
 * qui ha de decidir si ho compra.
 *
 * Un castell resol el mateix problema des de fa dos-cents anys: **els rengles**.
 * Una rengla és una línia vertical de persones que es passen el pes des de la
 * pinya fins a dalt. No és una jerarquia: és un **camí de càrrega**. Tothom hi
 * veu de seguida quantes n'hi ha, quina és la curta i on s'aguanta tot.
 *
 * Aquí es declara aquesta traducció, i es declara un cop:
 *
 *   mapa de valor                  castell
 *   ───────────────────────────    ─────────────────────────────────
 *   un àmbit o àrea                una rengla
 *   els rols d'aquell àmbit        les persones d'aquella rengla
 *   qui sosté sense sortir-hi      la pinya
 *   quants àmbits té la casa       quina construcció és
 *
 * ── Per què es genera ───────────────────────────────────────────────────────
 * Perquè el dibuix i el que se'n diu **no poden divergir**. Un «4» dibuixat amb
 * tres rengles és una figura que no existeix, i la llegiria tothom sense
 * adonar-se'n: és un dibuix bonic i un error de fons. Les posicions les calcula
 * aquest fitxer a partir del nombre de rengles i de pisos declarats, i una
 * guarda compta el que ha sortit contra el que s'havia dit.
 *
 * ── La regla que no es pot trencar ──────────────────────────────────────────
 * **Cap figura sense dir què vol dir per a una organització.** Una galeria de
 * castells és decoració castellera; el que es ven és la lectura —què vol dir
 * tenir una sola línia de força, o tenir-ne cinc i la pinya curta. Si una
 * figura no té aquesta frase, no entra.
 *
 * I la que se'n deriva: **no es promet cap mesura.** Això ordena i fa visible,
 * no puntua. Un castell no diu si l'organització va bé; diu on es concentra el
 * pes, que és una altra cosa i és la que serveix per decidir.
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

/* ══ LES CONSTRUCCIONS ═══════════════════════════════════════════════════════
   `rengles` és el nombre de línies de força i és el que les distingeix: un
   pilar en té una, una torre dues, i el 4 —la més comuna— en té quatre.

   `pisos` compta els del tronc, sense la pinya ni el pom de dalt. `pinya` és
   quanta gent sosté a baix: és el número que més sorprèn qui no és casteller,
   perquè sempre és molt més gran que el tronc, i aquesta sorpresa és
   exactament el que es vol provocar.

   `diu` és la lectura per a una organització, i cap figura hi pot entrar sense
   ella. `quan` és quan et toca aquesta figura, dit en una línia. */
const FIGURES = [
  {
    id: 'pilar', nom: 'El pilar', rengles: 1, pisos: 4, pinya: 9, pom: 2,
    quan: 'Tot passa per una sola àrea, o per una sola persona.',
    diu: 'Una sola línia de força. És la figura més alta per quanta gent hi ha a sota, i també la que cau més de pressa: si una persona falla, no hi ha ningú al costat que reculli el pes. A una casa, això és el projecte que aguanta perquè hi ha algú que no plega mai.'
  },
  {
    id: 'torre', nom: 'La torre · el 2', rengles: 2, pisos: 5, pinya: 16, pom: 2,
    quan: 'Dues àrees que depenen l\'una de l\'altra i no tenen tercera.',
    diu: 'Dues línies que s\'han de moure alhora. Guanya estabilitat i estrena una fragilitat nova: si una de les dues va tard, l\'altra no pot compensar-ho, només esperar. És el clàssic «comercial i producció» quan no hi ha ningú entremig.'
  },
  {
    id: 'tres', nom: 'El 3', rengles: 3, pisos: 5, pinya: 28, pom: 3,
    quan: 'Tres àmbits que es reparteixen la feina.',
    diu: 'Amb tres, el pes ja es reparteix de debò i una rengla fluixa no tomba la figura. És la primera construcció on pots perdre algú i seguir. La contrapartida és que calen tres caps que es parlin, i això no surt sol.'
  },
  {
    id: 'quatre', nom: 'El 4', rengles: 4, pisos: 5, pinya: 36, pom: 3,
    quan: 'Quatre àrees, que és on acaba la majoria de cases que creixen.',
    diu: 'La construcció més feta, i per un motiu: reparteix prou i encara es pot coordinar. El problema d\'un 4 mai és l\'alçada, és que una de les quatre rengles vagi curta de gent i ningú ho digui fins que es carrega el pis de dalt.'
  },
  {
    id: 'cinc', nom: 'El 5', rengles: 5, pisos: 5, pinya: 48, pom: 3,
    quan: 'Cinc àmbits o més, amb una pinya que ha de créixer igual.',
    diu: 'Cinc línies demanen una pinya molt més gran, i aquí és on les cases s\'equivoquen: creixen el tronc —més àrees, més caps— i deixen la base igual. El castell no cau per dalt, cau perquè a baix no hi havia prou gent.'
  }
];

/* ══ EL CAS TREBALLAT ════════════════════════════════════════════════════════
   Dotze rols en quatre àmbits. Els números no són inventats per il·lustrar: són
   els que fan la lectura que es ven —una rengla de cinc i una d'un. El que es
   diu d'ells es compta aquí sota, no s'escriu a mà. */
const CAS = {
  figura: 'quatre',
  titol: 'Dotze rols, quatre àmbits',
  rengles: [
    { nom: 'Qui ven', n: 5 },
    { nom: 'Qui produeix', n: 4 },
    { nom: 'Qui entrega', n: 1 },
    { nom: 'Qui administra', n: 2 }
  ]
};

/* ══ EL DIBUIX ═══════════════════════════════════════════════════════════════
   Un castell de front: la pinya com una base ampla de rodones petites, el tronc
   com N columnes de rodones més grosses, i el pom de dalt a sobre.

   No és un dibuix tècnic i no ho pretén: el que ha de quedar clar en mig segon
   és **quantes columnes hi ha i quanta gent hi ha a sota**, perquè és el que la
   figura ha de dir d'una organització. */
const W = 300, H = 250, BASE = 206;

function dibuix(f, rengles) {
  const p = [];
  const amp = 23;                                   // amplada d'una rengla
  const x0 = W / 2 - (f.rengles - 1) * amp / 2;     // tronc centrat
  const COL = ['#6366f1', '#00e676', '#ff9100', '#00b0ff', '#e040fb'];

  /* La pinya. Files que s'eixamplen cap avall, perquè és el que es veu de
     debò: com més a baix, més gent. Les rodones es reparteixen per files
     proporcionals i la darrera recull el que queda. */
  const files = [[.46, 11], [.72, 15], [1, 22]];
  let posats = 0;
  files.forEach(([r, max], fi) => {
    const queden = f.pinya - posats;
    const n = fi === files.length - 1 ? queden : Math.min(max, Math.round(f.pinya * (fi === 0 ? .22 : .3)));
    const y = BASE + fi * 13;
    const ample = Math.min(W - 24, 60 + r * 210);
    for (let k = 0; k < n && posats < f.pinya; k++, posats++) {
      const x = W / 2 - ample / 2 + (n === 1 ? ample / 2 : k * ample / (n - 1));
      p.push(`<circle class="ct-pi" cx="${x.toFixed(1)}" cy="${y}" r="4.2"/>`);
    }
  });

  /* El tronc. Cada rengla és una columna i porta el seu color: el que ha de
     saltar a la vista és **quantes n'hi ha**, no com de bonic queda. */
  for (let r = 0; r < f.rengles; r++) {
    const x = x0 + r * amp;
    const nom = rengles && rengles[r] ? rengles[r] : null;
    for (let pis = 0; pis < f.pisos; pis++) {
      const y = BASE - 16 - pis * 26;
      /* Al cas treballat, una rengla amb menys gent de la que caldria es
         dibuixa buida als pisos que li falten: és la lectura sencera en una
         imatge, i és el que es ven. */
      const falta = nom && pis >= nom.n;
      p.push(`<rect class="ct-p${falta ? ' buit' : ''}" x="${(x - 8).toFixed(1)}" y="${y}" `
        + `width="16" height="21" rx="5" fill="${falta ? 'none' : COL[r % COL.length]}"`
        + `${falta ? ` stroke="${COL[r % COL.length]}" stroke-dasharray="3 3" stroke-width="1.2" opacity=".55"` : ''}/>`);
    }
  }

  /* El pom de dalt: dosos, aixecador i enxaneta. Va a sobre del pis més alt i
     no a sobre d'on hi hauria el pis següent: amb `pisos * 26` quedava un forat
     de trenta píxels i el pom surava separat del castell. */
  const yTop = BASE - 16 - (f.pisos - 1) * 26;
  for (let k = 0; k < f.pom; k++) {
    p.push(`<circle class="ct-pom" cx="${(W / 2).toFixed(1)}" cy="${(yTop - 7 - k * 13).toFixed(1)}" r="5.5"/>`);
  }
  return p.join('');
}

function svgFigura(f, rengles) {
  const q = rengles ? ` Al cas: ${rengles.map(r => r.nom + ', ' + r.n).join('; ')}.` : '';
  return `<svg class="ct-svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="ctT-${f.id}">`
    + `<title id="ctT-${f.id}">${esc(f.nom)}: ${f.rengles} ${f.rengles === 1 ? 'rengla' : 'rengles'}, `
    + `${f.pisos} pisos de tronc i ${f.pinya} persones a la pinya.${esc(q)}</title>`
    + dibuix(f, rengles) + '</svg>';
}

/* ══ EL BLOC ═════════════════════════════════════════════════════════════════ */
function bloc() {
  const cas = FIGURES.find(f => f.id === CAS.figura);
  const total = CAS.rengles.reduce((a, r) => a + r.n, 0);
  const curta = CAS.rengles.slice().sort((a, b) => a.n - b.n)[0];
  const llarga = CAS.rengles.slice().sort((a, b) => b.n - a.n)[0];
  const f = [];
  f.push('<!--TT-CASTELLS-->');
  f.push('<!-- GENERAT per SOS/tools/build-castells.js · no s\'edita a mà -->');
  f.push('<div class="ct-wrap fade-up">');

  // El tria-figures.
  f.push('  <div class="ct-tria" role="tablist" aria-label="Construccions">');
  FIGURES.forEach((x, i) => f.push(`    <button type="button" class="ct-t${i === 0 ? ' on' : ''}" `
    + `role="tab" aria-selected="${i === 0}" aria-controls="ct-p-${x.id}" id="ct-t-${x.id}" `
    + `data-f="${x.id}">${esc(x.nom)} <span class="ct-tn">${x.rengles}</span></button>`));
  f.push('  </div>');

  FIGURES.forEach((x, i) => {
    f.push(`  <div class="ct-pan" id="ct-p-${x.id}" role="tabpanel" aria-labelledby="ct-t-${x.id}"${i ? ' hidden' : ''}>`);
    f.push('    <div class="ct-viz">' + svgFigura(x) + '</div>');
    f.push('    <div class="ct-txt">');
    f.push(`      <div class="ct-k">${x.rengles} ${x.rengles === 1 ? 'línia de força' : 'línies de força'} `
      + `· ${x.pinya} persones a la pinya</div>`);
    f.push(`      <p class="ct-quan">${esc(x.quan)}</p>`);
    f.push(`      <p class="ct-diu">${esc(x.diu)}</p>`);
    f.push('    </div>');
    f.push('  </div>');
  });

  // El cas treballat: el mateix dibuix, amb els números d'una casa de debò.
  f.push('  <div class="ct-cas">');
  f.push(`    <div class="ct-viz">${svgFigura(cas, CAS.rengles)}</div>`);
  f.push('    <div class="ct-txt">');
  f.push(`      <div class="ct-k">${esc(CAS.titol)}</div>`);
  f.push('      <ul class="ct-ll">' + CAS.rengles.map((r, i) =>
    `<li><i style="background:${['#6366f1', '#00e676', '#ff9100', '#00b0ff', '#e040fb'][i % 5]}"></i>`
    + `${esc(r.nom)} <b>${r.n}</b></li>`).join('') + '</ul>');
  f.push(`      <p class="ct-diu">Els mateixos ${total} rols en una llista no diuen res. Posats en rengles `
    + `es veu en mig segon el que costa una tarda de reunions: <b>«${esc(llarga.nom)}» en té ${llarga.n} i `
    + `«${esc(curta.nom)}» en té ${curta.n}</b>. No vol dir que estigui malament — vol dir que `
    + `<b>tot el que es ven passa per ${curta.n === 1 ? 'una sola persona' : curta.n + ' persones'}</b>, i que `
    + 'el dia que plegui no hi ha ningú al costat que reculli el pes.</p>');
  f.push('      <p class="ct-avis">Això ordena i fa visible; no puntua. Un castell no diu si una casa va bé: '
    + 'diu <b>on es concentra el pes</b>, que és una altra cosa i és la que serveix per decidir.</p>');
  f.push('    </div>');
  f.push('  </div>');
  f.push('</div>');
  f.push('<!--/TT-CASTELLS-->');
  return f.join('\n');
}

/* ══ LES GUARDES ═════════════════════════════════════════════════════════════ */

/* 1 · LA QUE IMPORTA · el dibuix ha de tenir les rengles que diu que té.
      Un «4» dibuixat amb tres columnes no peta: és una figura que no existeix i
      que es llegeix com si existís. */
(() => {
  const mal = FIGURES.filter(x => {
    const cols = new Set([...dibuix(x).matchAll(/class="ct-p[^"]*" x="([\d.]+)"/g)].map(m => m[1]));
    return cols.size !== x.rengles;
  });
  if (mal.length) bad('figures dibuixades amb un nombre de rengles diferent del que diuen: '
    + mal.map(x => x.nom).join(', ') + ' — una figura que no existeix, dibuixada com si existís');
  else ok(`${FIGURES.length} construccions, cadascuna dibuixada amb les rengles que diu que té`);
})();

// 2 · I amb la gent que diu: la pinya és el número que fa la lectura.
(() => {
  const mal = FIGURES.filter(x => (dibuix(x).match(/class="ct-pi"/g) || []).length !== x.pinya);
  if (mal.length) bad('figures amb una pinya dibuixada diferent de la declarada: '
    + mal.map(x => x.nom).join(', '));
  else ok(`i amb la pinya sencera: de ${FIGURES[0].pinya} a ${FIGURES[FIGURES.length - 1].pinya} persones`);
})();

/* 3 · Cap figura sense dir què vol dir per a una organització. Sense aquesta
      frase això és una galeria de castells, que no ven res. */
(() => {
  const mudes = FIGURES.filter(x => !x.diu || x.diu.length < 80 || !x.quan);
  if (mudes.length) bad('figures sense la lectura per a una organització: ' + mudes.map(x => x.id).join(', ')
    + ' — sense això és decoració castellera');
  else ok('i totes diuen què vol dir aquella forma en una casa, no només com es diu');
})();

// 4 · Les rengles han de ser totes diferents: dues figures amb el mateix nombre
//     de línies de força serien la mateixa figura amb dos noms.
(() => {
  const n = new Set(FIGURES.map(x => x.rengles));
  if (n.size !== FIGURES.length) bad('hi ha figures amb el mateix nombre de rengles: '
    + 'dues construccions amb les mateixes línies de força són la mateixa figura amb dos noms');
  else ok(`${n.size} nombres de rengles diferents, d'1 a ${Math.max(...n)}`);
})();

/* 5 · El cas treballat ha d'encaixar amb la seva figura i ha de ser desigual:
      un cas amb totes les rengles iguals no ensenya el que es vol ensenyar. */
(() => {
  const f = FIGURES.find(x => x.id === CAS.figura);
  if (!f) bad(`el cas apunta a la figura «${CAS.figura}», que no existeix`);
  else if (CAS.rengles.length !== f.rengles) bad(`el cas té ${CAS.rengles.length} rengles i `
    + `«${f.nom}» en demana ${f.rengles}`);
  else if (new Set(CAS.rengles.map(r => r.n)).size === 1) bad('el cas té totes les rengles iguals: '
    + 'no ensenyaria la desigualtat, que és tot el que el cas ha de fer veure');
  else ok(`el cas quadra amb «${f.nom}»: ${CAS.rengles.map(r => r.n).join(' · ')}`);
})();

// 6 · Cap xifra d'euros: això ordena i fa visible, no pressuposta.
(() => {
  if (/\d[\d.]*\s*€/.test(bloc())) bad('el bloc porta xifres d\'euros: aquesta secció no ven cap preu');
  else ok('cap preu al bloc: aquesta secció ordena i fa visible, no pressuposta');
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
      else ok('el bloc de les rengles està al dia');
    } else if (out !== src) writeFileSync(HOME, out);
  }
}

if (CHECK) {
  console.log(fails ? '\n❌ Arregla-ho amb:  node SOS/tools/build-castells.js'
    : '\n✅ Les rengles quadren.');
  process.exit(fails ? 1 : 0);
}
if (fails) { console.log('\n❌ No s\'ha escrit res.'); process.exit(1); }
console.log(`\n✅ index.html · ${pl(FIGURES.length, 'construcció', 'construccions')} `
  + `d'1 a ${Math.max(...FIGURES.map(f => f.rengles))} rengles, i un cas de ${CAS.rengles.length}`);

module.exports = { FIGURES, CAS };
