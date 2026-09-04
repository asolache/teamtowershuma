#!/usr/bin/env node
/* La geografia · declarada a l'app, escrita al directori
 * ─────────────────────────────────────────────────────────────────────────
 * `SOS/index.html` ja porta la divisió administrativa de Catalunya i
 * d'Euskadi: comarques i municipis amb el seu pare, que és el que fa possible
 * que un node sàpiga on és. El directori (`SOS/online.html`) demanava el
 * municipi com a **text lliure**, i això té tres avaries que no fan soroll:
 *
 * · «Torrelles de Foix», «torrelles de foix» i «Torrelles» són tres municipis
 *   diferents per a qualsevol cerca. Ningú es troba.
 * · Ningú sap a quina comarca cau un poble que no és el seu, així que la
 *   fitxa no es pot agrupar per territori encara que hi hagi el nom escrit.
 * · I qui no és d'aquí no té cap manera de dir d'on és.
 *
 * La sortida és la de sempre: **es declara un cop i es genera.** Les taules
 * viuen a l'app, aquest generador les hi llegeix i les escriu al directori
 * entre marques, i `--check` peta al CI si s'han desviat.
 *
 * ── Per què es llegeix l'app i no un fitxer de dades ─────────────────────
 * Perquè l'app és qui les fa servir de debò per construir l'arbre de
 * territoris. Si les tragués a un JSON a part, hi hauria dues llistes i la que
 * es quedaria enrere seria la que ningú mira —i el dia que Catalunya en
 * canviï una, l'arbre i el directori dirien coses diferents.
 *
 * ── I la resta del món ───────────────────────────────────────────────────
 * Fora de Catalunya i d'Euskadi no tenim municipis, i inventar-los seria
 * pitjor que no tenir-los. El que hi ha és **la llista de països**, i el
 * municipi hi torna a ser text lliure amb el país al costat: així una fitxa de
 * Berlín es pot agrupar per país encara que no la puguem agrupar per districte.
 *
 * Ús:  node SOS/tools/build-geo.js [--check]
 */
'use strict';
const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const SOS = join(__dirname, '..');
const APP = join(SOS, 'index.html');
const DIR = join(SOS, 'online.html');
const CHECK = process.argv.includes('--check');

/* ══ Llegir les taules de l'app ═══════════════════════════════════════════
   Es llegeix el bloc de la constant i prou. Buscar `{n:'…'}` per tot el fitxer
   atraparia qualsevol altra cosa que s'hi assembli, i el dia que passés
   escriuríem al directori una llista de municipis amb coses que no ho són. */
const app = readFileSync(APP, 'utf8');

function taula(nom) {
  const i = app.indexOf('const ' + nom + '={');
  if (i < 0) return null;
  const j = app.indexOf('\n};', i);
  if (j < 0) return null;
  const bloc = app.slice(i, j);
  const nivell = niv => {
    const k = bloc.indexOf('\n  ' + niv + ':[');
    if (k < 0) return [];
    /* Fins al tancament d'aquest nivell, no del primer `]` que aparegui: un
       nom amb un claudàtor a dins ho trencaria en silenci. */
    const fi = bloc.indexOf('\n  ]', k) >= 0 ? bloc.indexOf('\n  ]', k) : bloc.indexOf('],\n', k);
    const t = bloc.slice(k, fi < 0 ? bloc.length : fi);
    return [...t.matchAll(/\{n:'((?:[^'\\]|\\.)*)'(?:,p:'((?:[^'\\]|\\.)*)')?/g)]
      .map(m => ({ n: m[1].replace(/\\'/g, "'"), p: (m[2] || '').replace(/\\'/g, "'") }));
  };
  return { comarques: nivell('comarca'), municipis: nivell('municipi') };
}

const CAT = taula('CAT_GEO');
const EUS = taula('EUS_GEO');
if (!CAT || !EUS) {
  console.error('✗ No es troben CAT_GEO o EUS_GEO a SOS/index.html.');
  console.error('  Una guarda que no troba el que mesura ha de cridar, no callar.');
  process.exit(1);
}

/* ══ ELS PAÏSOS ═══════════════════════════════════════════════════════════
   Codi ISO-3166 alfa-2 i nom en català. Primer els que tenim a prop —no per
   patriotisme sinó perquè és d'on vindrà el 99 % de les fitxes— i la resta
   alfabètic. Que la llista sigui aquí i no en una crida a cap servei és
   deliberat: el directori s'ha de poder obrir sense xarxa.

   Notació: qui posi un país sense municipi de la llista escriu el poble a mà i
   el país al costat. És menys que una divisió administrativa, i és honest. */
const PAISOS = [
  ['ES', 'Espanya'], ['FR', 'França'], ['AD', 'Andorra'], ['PT', 'Portugal'],
  ['IT', 'Itàlia'], ['DE', 'Alemanya'], ['GB', 'Regne Unit'], ['BE', 'Bèlgica'],
  ['NL', 'Països Baixos'], ['CH', 'Suïssa'], ['AT', 'Àustria'], ['IE', 'Irlanda'],
  ['DK', 'Dinamarca'], ['SE', 'Suècia'], ['NO', 'Noruega'], ['FI', 'Finlàndia'],
  ['PL', 'Polònia'], ['CZ', 'Txèquia'], ['SK', 'Eslovàquia'], ['HU', 'Hongria'],
  ['RO', 'Romania'], ['BG', 'Bulgària'], ['GR', 'Grècia'], ['HR', 'Croàcia'],
  ['SI', 'Eslovènia'], ['RS', 'Sèrbia'], ['UA', 'Ucraïna'], ['MA', 'Marroc'],
  ['DZ', 'Algèria'], ['TN', 'Tunísia'], ['SN', 'Senegal'], ['ML', 'Mali'],
  ['GM', 'Gàmbia'], ['GH', 'Ghana'], ['NG', 'Nigèria'], ['CM', 'Camerun'],
  ['ZA', 'Sud-àfrica'], ['EG', 'Egipte'], ['US', 'Estats Units'], ['CA', 'Canadà'],
  ['MX', 'Mèxic'], ['GT', 'Guatemala'], ['HN', 'Hondures'], ['SV', 'El Salvador'],
  ['NI', 'Nicaragua'], ['CR', 'Costa Rica'], ['PA', 'Panamà'], ['CU', 'Cuba'],
  ['DO', 'República Dominicana'], ['CO', 'Colòmbia'], ['VE', 'Veneçuela'],
  ['EC', 'Equador'], ['PE', 'Perú'], ['BO', 'Bolívia'], ['BR', 'Brasil'],
  ['PY', 'Paraguai'], ['UY', 'Uruguai'], ['AR', 'Argentina'], ['CL', 'Xile'],
  ['CN', 'Xina'], ['JP', 'Japó'], ['KR', 'Corea del Sud'], ['IN', 'Índia'],
  ['PK', 'Pakistan'], ['BD', 'Bangladesh'], ['PH', 'Filipines'], ['ID', 'Indonèsia'],
  ['TH', 'Tailàndia'], ['VN', 'Vietnam'], ['TR', 'Turquia'], ['RU', 'Rússia'],
  ['IL', 'Israel'], ['PS', 'Palestina'], ['LB', 'Líban'], ['SY', 'Síria'],
  ['AU', 'Austràlia'], ['NZ', 'Nova Zelanda'], ['XX', 'Un altre lloc']
];

/* ══ Generar ══════════════════════════════════════════════════════════════
   Format compacte a posta: el directori és un fitxer que es baixa sencer, i
   313 municipis amb el seu pare escrits com un objecte per municipi serien
   uns quants KB de claus repetides. Una llista de `'Poble|Comarca'` es parteix
   en carregar i ocupa la meitat. */
const q = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
const linia = (llista, ample) => {
  const files = [];
  for (let i = 0; i < llista.length; i += ample)
    files.push('  ' + llista.slice(i, i + ample).map(q).join(','));
  return files.join(',\n');
};

function blocGeo() {
  const munis = t => t.municipis.map(m => m.n + '|' + (m.p || ''));
  return `/* Generat per SOS/tools/build-geo.js des de CAT_GEO i EUS_GEO de l'app.
   No ho editis a mà: canvia les taules de SOS/index.html i torna a generar.
   Format 'Municipi|Comarca' per no repetir claus ${CAT.municipis.length + EUS.municipis.length} vegades. */
const GEO_CAT=[
${linia(munis(CAT), 4)}
];
const GEO_EUS=[
${linia(munis(EUS), 4)}
];
const PAISOS=[
${PAISOS.map(([c, n]) => `  ['${c}',${q(n)}]`).join(',\n')}
];`;
}

const MARQUES = [['/*GEO*/', '/*/GEO*/', blocGeo]];

const src = readFileSync(DIR, 'utf8');
let out = src, faltaven = [];
for (const [obre, tanca, fn] of MARQUES) {
  const i = out.indexOf(obre), j = out.indexOf(tanca);
  if (i < 0 || j < 0 || j < i) { faltaven.push(obre); continue; }
  out = out.slice(0, i + obre.length) + '\n' + fn() + '\n' + out.slice(j);
}

if (faltaven.length) {
  console.error('✗ Falten marques a online.html: ' + faltaven.join(', '));
  console.error('  Sense elles el generador no sap on escriure i no s\'inventa el lloc.');
  process.exit(1);
}

const resum = `${CAT.municipis.length} municipis de Catalunya · ${EUS.municipis.length} d'Euskadi · ${PAISOS.length} països`;

if (CHECK) {
  if (out === src) { console.log(`✅ La geografia al dia · ${resum}`); process.exit(0); }
  console.error('❌ La geografia del directori no correspon a les taules de l\'app.');
  console.error('   Arregla-ho amb:  node SOS/tools/build-geo.js');
  process.exit(1);
}

writeFileSync(DIR, out);
console.log(`✅ SOS/online.html · ${resum}`);
