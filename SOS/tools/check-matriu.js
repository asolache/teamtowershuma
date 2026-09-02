#!/usr/bin/env node
/* Guarda de la pàgina de la MATRIU
 * ─────────────────────────────────────────────────────────────────────────
 * `SOS/matriu.html` explica el mètode: quatre etapes, tres portes amb els seus
 * criteris, tres vies de creació i els multiplicadors d'equity. Tot això
 * **existeix a `SOS/index.html`** i decideix de debò què passa amb una venture.
 *
 * Una pàgina que explica un mètode **envelleix sense petar mai**. Si a l'app es
 * canvia un criteri de graduació, aquí queda l'antic sonant igual de cert, i qui
 * el llegeixi prepararà la seva venture per a una porta que ja no existeix. La
 * pàgina, a més, ho promet a la primera pantalla —«cada criteri d'aquesta pàgina
 * és una comprovació que el SOS fa de debò»—, i una promesa que no vigila ningú
 * és una promesa fins al primer canvi.
 *
 * Es comprova:
 *
 *   1. Les quatre etapes són `VENTURE_STAGES` i es diuen com a `STAGE_LABELS`.
 *   2. Cada porta té **exactament** els criteris que compta `stageGate` i
 *      `ventureReadiness`, i cadascun amb el seu text literal.
 *   3. Els tipus de projecte i els seus multiplicadors són `PROJECT_TYPES`, i
 *      el multiplicador del diner és sempre superior al del temps — que és la
 *      regla de Slicing Pie que la pàgina explica.
 *   4. Les vies diuen el nombre de plantilles que hi ha de debò.
 *   5. **Cada peça que la pàgina diu que el SOS fa, existeix**: la taula de
 *      cobertura anomena funcions, i totes han de ser al fitxer. Presumir d'una
 *      funció que no hi és és el pitjor que pot fer aquesta pàgina.
 *   6. Les revisions post-graduació són les de `REVIEW_MONTHS`.
 *
 * Ús:  node SOS/tools/check-matriu.js
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const APP = readFileSync(join(ARREL, 'SOS', 'index.html'), 'utf8');
const PAG = readFileSync(join(ARREL, 'SOS', 'matriu.html'), 'utf8');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;
const bloc = (txt, obre, tanca) => {
  const i = txt.indexOf(obre); if (i < 0) return '';
  const j = txt.indexOf(tanca, i + obre.length);
  return j < 0 ? '' : txt.slice(i, j + tanca.length);
};

console.log('\nGuarda de la MATRIU · la pàgina diu el que l\'app fa');

/* ── 1 · Les etapes ─────────────────────────────────────────────────────── */
const stages = ((APP.match(/const VENTURE_STAGES=\[([^\]]*)\]/) || [])[1] || '')
  .split(',').map(x => x.trim().replace(/'/g, '')).filter(Boolean);
const labels = {};
[...(bloc(APP, 'const STAGE_LABELS={', '};')).matchAll(/(\w+):'([^']*)'/g)].forEach(m => { labels[m[1]] = m[2]; });
const meves = [...(bloc(PAG, 'const ETAPES=[', '\n];')).matchAll(/\{id:'(\w+)',label:'([^']*)'/g)]
  .map(m => ({ id: m[1], label: m[2] }));

if (!stages.length || !meves.length) {
  bad('no es troben les etapes a un dels dos fitxers: la guarda de la MATRIU s\'ha quedat cega');
} else if (meves.map(x => x.id).join('|') !== stages.join('|')) {
  bad(`les etapes no són les mateixes: pàgina [${meves.map(x => x.id).join(', ')}] · ` +
    `app [${stages.join(', ')}]`);
} else {
  const malNom = meves.filter(x => labels[x.id] !== x.label);
  if (!malNom.length) ok(`les ${meves.length} etapes són les de l'app i es diuen igual`);
  else bad(`${pl(malNom.length, 'etapa es diu', 'etapes es diuen')} diferent: ` +
    malNom.map(x => `${x.id} («${x.label}» aquí, «${labels[x.id]}» a l'app)`).join(', '));
}

/* ── 2 · Les portes i els seus criteris ─────────────────────────────────── */
/* Els criteris de l'app surten de dos llocs: `stageGate` per a les dues
   primeres portes i `ventureReadiness` per a la tercera. Es llegeixen els
   `label:` de cada bloc, que és el text que veu qui hi és. */
const gate = bloc(APP, 'function stageGate(', '\n}');
const ready = bloc(APP, 'function ventureReadiness(', '\n}');
/* `label:` precedit de coma o accolada, i no només d'accolada: a `stageGate`
   els objectes comencen pel label i a `ventureReadiness` per una clau `k`.
   Buscant l'accolada, la porta 3 no es llegia i la guarda es queixava d'ella
   mateixa — que és la manera més ràpida de gastar-se la confiança que
   necessitarà el dia que trobi una divergència de debò. */
const etiquetes = txt => [...txt.matchAll(/[{,]\s*label:'((?:[^'\\]|\\.)*)'/g)].map(m => m[1].replace(/\\'/g, "'"));
const idea = etiquetes(bloc(gate, "if(v.stage==='idea')checks=[", '];'));
const proto = etiquetes(bloc(gate, "else if(v.stage==='prototip')checks=[", '];'));
/* Els `soft` no compten com a criteris de porta: es marquen a mà i no bloquegen
   ningú. Incloure'ls faria que la guarda exigís a la pàgina que expliqui una
   porta que no existeix. */
const grad = etiquetes(ready.indexOf('const soft=') >= 0 ? ready.slice(0, ready.indexOf('const soft=')) : ready);

const portes = [...(bloc(PAG, 'const PORTES=[', '\n];')).matchAll(/\{de:'(\w+)',a:'(\w+)',n:(\d+),criteris:\[([\s\S]*?)\]\}/g)]
  .map(m => ({ de: m[1], a: m[2], n: +m[3],
    criteris: [...m[4].matchAll(/\['((?:[^'\\]|\\.)*)'/g)].map(x => x[1].replace(/\\'/g, "'")) }));

const seus = { idea, prototip: proto, validacio: grad };
if (portes.length !== 3) bad(`la pàgina hauria de tenir tres portes i en té ${portes.length}`);
portes.forEach(p => {
  const app = seus[p.de] || [];
  if (!app.length) { bad(`no es poden llegir els criteris de l'app per a la porta ${p.n}`); return; }
  const falten = app.filter(c => !p.criteris.some(x => aprox(x) === aprox(c)));
  const sobren = p.criteris.filter(c => !app.some(x => aprox(x) === aprox(c)));
  if (!falten.length && !sobren.length && p.criteris.length === app.length)
    ok(`porta ${p.n} (${p.de} → ${p.a}): els ${app.length} criteris són els que compta l'app`);
  else bad(`porta ${p.n}: els criteris no quadren — ` +
    (falten.length ? `l'app en demana ${falten.length} que la pàgina no diu («${falten[0]}») ` : '') +
    (sobren.length ? `i la pàgina en promet ${sobren.length} que l'app no comprova («${sobren[0]}»)` : ''));
});
/* El text es compara **normalitzat**: la pàgina diu «al llibre» on l'app diu
   «al ledger», i això és una decisió de llengua i no una divergència. La resta
   —les xifres, els percentatges, què es demana— ha de ser igual. */
function aprox(s) {
  return String(s).toLowerCase()
    .replace(/ledger|llibre/g, 'X')
    .replace(/de l'equity|equity/g, 'equity')
    .replace(/[·.,]/g, '').replace(/\s+/g, ' ').trim();
}

/* ── 3 · Els tipus de projecte i l'equity ───────────────────────────────── */
const seusTipus = [...(bloc(APP, 'const PROJECT_TYPES=[', '\n];'))
  .matchAll(/\{id:'(\w+)',name:'((?:[^'\\]|\\.)*)'[^}]*?equity:\{fmv:(\d+),nonCash:(\d+),cash:(\d+)\}/g)]
  .map(m => ({ id: m[1], fmv: +m[3], nonCash: +m[4], cash: +m[5] }));
const meusTipus = [...(bloc(PAG, 'const TIPUS=[', '\n];'))
  .matchAll(/\{id:'(\w+)',ic:'[^']*',nom:'((?:[^'\\]|\\.)*)',fmv:(\d+),nonCash:(\d+),cash:(\d+)/g)]
  .map(m => ({ id: m[1], fmv: +m[3], nonCash: +m[4], cash: +m[5] }));

if (!seusTipus.length || !meusTipus.length) {
  bad('no es poden llegir els tipus de projecte: la pàgina dona multiplicadors d\'equity sense contrastar');
} else {
  const mal = meusTipus.filter(t => {
    const s = seusTipus.find(x => x.id === t.id);
    return !s || s.fmv !== t.fmv || s.nonCash !== t.nonCash || s.cash !== t.cash;
  });
  if (!mal.length && meusTipus.length === seusTipus.length)
    ok(`els ${meusTipus.length} tipus de projecte porten el preu base i els multiplicadors de l'app`);
  else bad(`${pl(mal.length, 'tipus no quadra', 'tipus no quadren')} amb PROJECT_TYPES: ` +
    (mal.map(t => t.id).join(', ') || `${meusTipus.length} aquí i ${seusTipus.length} a l'app`) +
    ' — algú planificaria el repartiment amb números que no són els que fa servir el càlcul');

  /* La regla que la pàgina explica: el diner val més que el temps, i no per
     favor sinó per risc. Si algun dia deixés de ser certa a les dades, el
     paràgraf de la pàgina passaria a ser fals sense que ho digués ningú. */
  const iguals = seusTipus.filter(t => !(t.cash > t.nonCash));
  if (!iguals.length) ok('i a tots el multiplicador del diner és superior al del temps, com diu la pàgina');
  else bad(`${pl(iguals.length, 'tipus té', 'tipus tenen')} el multiplicador del diner igual o inferior ` +
    `al del temps (${iguals.map(t => t.id).join(', ')}): la pàgina explica el contrari`);
}

/* ── 4 · Les vies ───────────────────────────────────────────────────────── */
const compta = (nom, obre) => (bloc(APP, obre, '\n];').match(/\{id:'/g) || []).length;
const nAct = compta('CRITICAL_ACTIVITIES', 'const CRITICAL_ACTIVITIES=[');
const nProt = compta('PROTOTYPE_MAPS', 'const PROTOTYPE_MAPS=[');
const vies = [...(bloc(PAG, 'const VIES=[', '\n];')).matchAll(/taula:'(\w+)',n:(\d+)/g)]
  .map(m => ({ taula: m[1], n: +m[2] }));
const espera = { CRITICAL_ACTIVITIES: nAct, PROTOTYPE_MAPS: nProt, aiPlanValueFlows: 0 };
const viesMal = vies.filter(v => espera[v.taula] !== v.n);
if (vies.length === 3 && !viesMal.length)
  ok(`les tres vies diuen les plantilles que hi ha: ${nAct} activitats i ${nProt} prototips`);
else bad(`les vies no quadren: ` + (viesMal.map(v => `${v.taula} diu ${v.n} i n'hi ha ${espera[v.taula]}`).join('; ')
  || `n'hi ha ${vies.length} i haurien de ser 3`));

/* ── 5 · Cap peça promesa que no existeixi ──────────────────────────────── */
const cob = bloc(PAG, 'const COBERTURA=[', '\n];');
const funcs = [...cob.matchAll(/'([A-Za-z_][A-Za-z0-9_ ·]*)'\s*,\s*1\]/g)]
  .flatMap(m => m[1].split('·').map(x => x.trim()))
  .filter(x => /^[A-Za-z_][A-Za-z0-9_]*$/.test(x));
const fantasma = funcs.filter(f => !new RegExp('(function |const |let )' + f + '\\b').test(APP));
if (funcs.length && !fantasma.length)
  ok(`les ${funcs.length} peces que la pàgina diu que el SOS fa existeixen totes al fitxer`);
else bad(`${pl(fantasma.length, 'peça promesa no existeix', 'peces promeses no existeixen')}: ` +
  (fantasma.join(', ') || 'no se n\'ha pogut llegir cap') +
  ' — presumir d\'una funció que no hi és és el pitjor que pot fer aquesta pàgina');

/* ── 6 · Les revisions post-graduació ───────────────────────────────────── */
const mesos = ((APP.match(/const REVIEW_MONTHS=\[([^\]]*)\]/) || [])[1] || '')
  .split(',').map(x => x.trim()).filter(Boolean);
if (mesos.length && mesos.every(m => PAG.includes(m)) && new RegExp(mesos.join('[^0-9]{1,6}')).test(PAG))
  ok(`i les revisions que anomena són les de l'app: ${mesos.join(', ')} mesos`);
else bad(`la pàgina no diu les revisions de REVIEW_MONTHS (${mesos.join(', ')})`);

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} a la pàgina de la MATRIU.`
  : '\n✅ La pàgina explica el mètode que l\'app aplica de debò.');
process.exit(fails ? 1 : 0);
