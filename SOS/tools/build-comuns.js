#!/usr/bin/env node
/* Les dues dinàmiques fundacionals, generades de les taules de l'app
 * ─────────────────────────────────────────────────────────────────────────────
 * De les dotze dinàmiques del catàleg, sis ja tenien pàgina —La Compra,
 * L'Energia, L'Habitatge, la MATRIU, el mapa de valor i Molekulandia— i les
 * **dues per on comença tothom**, no: el banc de temps i la biblioteca de les
 * coses. És l'error girat del revés: hi havia pàgina per a les dinàmiques
 * d'entrada difícil i no per a les dues que qualsevol entén de seguida.
 *
 * ── Què es genera i per què ─────────────────────────────────────────────────
 * Les dues pàgines diuen coses que l'app **ja sap**: la fita de la dinàmica,
 * els cinc passos del tauler que deixa fet, el mapa de valor amb els seus
 * parells, com es governa, els dos modes d'un objecte, i les dues taules que
 * decideixen què val un préstec. Escrites a mà serien sis còpies més, i la
 * pàgina i l'eina divergirien sense que petés res: la persona llegiria una
 * xifra aquí i en registraria una altra allà, i se n'assabentaria el dia que
 * hagués acordat les normes del seu barri amb la xifra equivocada.
 *
 * ── Una troballa que ha sortit de fer-ho ────────────────────────────────────
 * `LIBRARY_TYPES` declara dotze tipologies i `ORACLE_OBJECT_DEFAULTS` només en
 * té onze: **`jocs` no té valor base** i cau a «altres». No és un error de
 * càlcul —l'app fa exactament això— però sí una taula incompleta que ningú
 * havia mirat. El generador ho diu cada vegada que corre, i la pàgina escriu
 * el valor efectiu perquè el que ensenya sigui el que l'eina farà.
 *
 * ── Ús ──────────────────────────────────────────────────────────────────────
 *   node SOS/tools/build-comuns.js            escriu els blocs a les dues pàgines
 *   node SOS/tools/build-comuns.js --check    falla si estan velles
 */
const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const SOS = join(ARREL, 'SOS');
const CHECK = process.argv.includes('--check');
const APP = readFileSync(join(SOS, 'index.html'), 'utf8');

let fails = 0;
const bad = m => { fails++; console.log('  ✗ ' + m); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const jsq = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";

/* ══ LECTURA DE LES TAULES DE L'APP ══════════════════════════════════════════
   Tot surt de `SOS/index.html`. Res es declara aquí: aquest fitxer no és la
   font de res, és el pont. */

/* Una entrada de `DYNAMICS`. Es talla pel principi de la següent perquè les
   fitxes hi van seguides, i llegir-la sencera fa que `objectives`, `kanban` i
   `pairs` surtin de la mateixa fitxa i no de dues. */
function dinamica(id) {
  const i = APP.indexOf(`{id:'${id}',name:`);
  if (i < 0) return null;
  const j = APP.indexOf('\n {id:', i + 10);
  return APP.slice(i, j < 0 ? i + 6000 : j);
}
const camp = (txt, k) => {
  const m = txt.match(new RegExp(k + ":'((?:[^'\\\\]|\\\\.)*)'"));
  return m ? m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\') : '';
};
const llista = (txt, k) => {
  const m = txt.match(new RegExp(k + ':\\[([\\s\\S]*?)\\]'));
  if (!m) return [];
  return [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(x => x[1].replace(/\\'/g, "'"));
};
/* Els parells del mapa de valor: sis cadenes per fila. Es llegeixen en blocs de
   sis a posta —de qui, a qui, mena, què, mena, què— perquè una fila incompleta
   canviaria l'alineació de totes les de sota i el mapa diria coses falses sense
   petar. Si no en són múltiple de sis, això s'acusa. */
function parells(txt) {
  const m = txt.match(/pairs:\[([\s\S]*?)\],\s*\n\s*kanban:/);
  if (!m) return [];
  const files = [...m[1].matchAll(/\[([^\]]*)\]/g)].map(f =>
    [...f[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(x => x[1].replace(/\\'/g, "'")));
  return files;
}

const DIN = {};
['banc_temps', 'biblioteca_coses'].forEach(id => {
  const t = dinamica(id);
  if (!t) { bad(`no es troba la dinàmica «${id}» a DYNAMICS`); return; }
  const ps = parells(t);
  const mal = ps.filter(p => p.length !== 6).length;
  if (mal) bad(`la dinàmica «${id}» té ${mal} parells que no porten sis camps`);
  DIN[id] = {
    nom: camp(t, 'name'), ic: camp(t, 'icon'), one: camp(t, 'one'),
    mission: camp(t, 'mission'), vision: camp(t, 'vision'),
    objectives: camp(t, 'objectives'), gov: camp(t, 'gov'),
    roles: llista(t, 'roles'), kanban: llista(t, 'kanban'),
    pairs: ps.filter(p => p.length === 6),
    res: [...(t.match(/res:\[([\s\S]*?)\]\}/) || [, ''])[1]
      .matchAll(/\['((?:[^'\\]|\\.)*)','([^']*)'\]/g)].map(m2 => [m2[1].replace(/\\'/g, "'"), m2[2]])
  };
});

const taula = re => {
  const m = APP.match(re);
  if (!m) return null;
  const o = {};
  [...m[1].matchAll(/([a-z_]+):([\d.]+)/g)].forEach(x => { o[x[1]] = Number(x[2]); });
  return o;
};
const VALORS_APP = taula(/const ORACLE_OBJECT_DEFAULTS=\{([^}]*)\}/);
const DESGAST_APP = taula(/const WEAR_RATES=\{([\s\S]*?)\}/);
const TIPUS = [...(APP.match(/const LIBRARY_TYPES=\[([\s\S]*?)\n\];/) || [, ''])[1]
  .matchAll(/\['([^']+)','((?:[^'\\]|\\.)*)','([^']*)'\]/g)]
  .map(m => ({ id: m[1], label: m[2].replace(/\\'/g, "'"), ic: m[3] }));
const MODES = [...(APP.match(/const OBJECT_MODES=\[([\s\S]*?)\n\];/) || [, ''])[1]
  .matchAll(/\{id:'([^']+)',label:'((?:[^'\\]|\\.)*)',ic:'([^']*)',one:'((?:[^'\\]|\\.)*)'\}/g)]
  .map(m => ({ id: m[1], label: m[2].replace(/\\'/g, "'"), ic: m[3], one: m[4].replace(/\\'/g, "'") }));

if (!VALORS_APP || !DESGAST_APP || !TIPUS.length || MODES.length !== 2) {
  console.log('✗ no es poden llegir ORACLE_OBJECT_DEFAULTS, WEAR_RATES, LIBRARY_TYPES o OBJECT_MODES');
  process.exit(1);
}

/* El valor efectiu de cada tipologia: el de la taula, o el d'«altres» si no hi
   és — que és el que fa l'app. Escriure el valor efectiu i no el forat és el
   que fa que la pàgina ensenyi el que passarà de debò. */
const sensValor = TIPUS.filter(t => VALORS_APP[t.id] === undefined).map(t => t.id);
const sensDesgast = TIPUS.filter(t => DESGAST_APP[t.id] === undefined).map(t => t.id);
const VALORS = {}, DESGAST = {};
TIPUS.forEach(t => {
  VALORS[t.id] = VALORS_APP[t.id] !== undefined ? VALORS_APP[t.id] : VALORS_APP.altres;
  DESGAST[t.id] = DESGAST_APP[t.id] !== undefined ? DESGAST_APP[t.id] : DESGAST_APP.altres;
});

if (fails) { console.log(`\n❌ ${fails} problema${fails === 1 ? '' : 's'} llegint les taules.`); process.exit(1); }

/* ══ ELS BLOCS ═══════════════════════════════════════════════════════════════ */
const objectius = d => {
  /* La fita ve com una frase amb « · » entremig. Es parteix perquè cada tros
     sigui una fita que es pugui mirar per separat: una frase llarga amb tres
     números a dins no la comprova ningú. */
  const fites = d.objectives.split('·').map(s => s.trim()).filter(Boolean);
  return `<p class="lead">${esc(d.mission)}</p>\n` +
    `<div class="capes">\n` + fites.map((f, i) =>
      `  <div class="capa"><div class="k">Fita ${i + 1}</div><div class="v" style="font-size:1rem">${esc(f)}</div></div>`
    ).join('\n') + `\n</div>\n` +
    `<p class="nota bo"><strong>On va això:</strong> ${esc(d.vision)}</p>`;
};

const kanban = d => `<div class="passos">\n` + d.kanban.map(k =>
  `  <div class="pas"><b>${esc(k)}</b></div>`).join('\n') + `\n</div>`;

const mapa = d => {
  const files = d.pairs.map(([de, a, m1, q1, m2, q2]) =>
    `  <tr><td>${esc(de)} → ${esc(a)}</td><td>${esc(m1)}</td><td>${esc(q1)}</td>` +
    `<td>${esc(m2)}</td><td>${esc(q2)}</td></tr>`).join('\n');
  const nInt = d.pairs.filter(p => p[2] === 'intangible' || p[4] === 'intangible').length;
  return `<p class="mut">${d.roles.length} rols · ${d.pairs.length} intercanvis, ` +
    `<strong>${nInt} amb alguna cosa intangible</strong>.</p>\n` +
    `<div class="taula"><table class="parells">\n` +
    `<thead><tr><th>De qui, a qui</th><th>Mena</th><th>Què li dona</th><th>Mena</th><th>Què li torna</th></tr></thead>\n` +
    `<tbody>\n${files}\n</tbody></table></div>`;
};

const gov = d => `<p class="lead">${esc(d.gov)}</p>\n` +
  (d.res.length
    ? `<p class="mut">On mirar-ne de fetes: ` + d.res.map(([n, u]) =>
        `<a href="${u}" target="_blank" rel="noopener">${esc(n)}</a>`).join(' · ') + `</p>`
    : '');

const modes = () => `<div class="modes">\n` + MODES.map(m =>
  `  <div class="mode ${m.id}"><div class="ic">${m.ic}</div><h4>${esc(m.label)}</h4>` +
  `<p class="one">${esc(m.one)}</p><dl>` +
  (m.id === 'donacio'
    ? `<dt>De qui és</dt><dd>De la comunitat, des del primer dia.</dd>` +
      `<dt>Què val</dt><dd>El bé cedit, <strong>una vegada</strong>.</dd>` +
      `<dt>Qui l'arregla</dt><dd>La biblioteca, amb el seu fons de manteniment.</dd>`
    : `<dt>De qui és</dt><dd>Segueix sent teu. El pots reclamar quan vulguis.</dd>` +
      `<dt>Què val</dt><dd>El desgast i el risc, <strong>a cada préstec</strong>.</dd>` +
      `<dt>Qui l'arregla</dt><dd>S'acorda abans, i per això aquesta pàgina té la pestanya 4.</dd>`) +
  `</dl></div>`).join('\n') + `\n</div>`;

const taules = () => {
  const lin = o => '{' + TIPUS.map(t => `${t.id}:${o[t.id]}`).join(',') + '}';
  return `/* Les dues taules que decideixen què val un préstec, i els noms de les\n` +
    `   tipologies. Surten de SOS/index.html —\`ORACLE_OBJECT_DEFAULTS\`,\n` +
    `   \`WEAR_RATES\` i \`LIBRARY_TYPES\`— i les escriu SOS/tools/build-comuns.js.\n` +
    `   No s'editen aquí: si al teu barri les coses valen una altra cosa, es\n` +
    `   canvien al teu node des de l'eina, que és on la xifra té efecte.\n` +
    (sensValor.length
      ? `   Nota: ${sensValor.join(', ')} no ${sensValor.length === 1 ? 'té' : 'tenen'} valor propi a la taula de l'app i\n` +
        `   cau${sensValor.length === 1 ? '' : 'en'} al d'«altres»; aquí hi va el valor efectiu.\n` : '') +
    `*/\n` +
    `const VALORS=${lin(VALORS)};\n` +
    `const DESGAST=${lin(DESGAST)};\n` +
    `const TIP_NOM={` + TIPUS.map(t => `${t.id}:${jsq(t.ic + ' ' + t.label)}`).join(',') + `};`;
};

const BLOCS = {
  'banc-temps.html': [
    ['<!--BDT-OBJ-->', '<!--/BDT-OBJ-->', () => objectius(DIN.banc_temps)],
    ['<!--BDT-KANBAN-->', '<!--/BDT-KANBAN-->', () => kanban(DIN.banc_temps)],
    ['<!--BDT-MAPA-->', '<!--/BDT-MAPA-->', () => mapa(DIN.banc_temps)],
    ['<!--BDT-GOV-->', '<!--/BDT-GOV-->', () => gov(DIN.banc_temps)]
  ],
  'biblioteca.html': [
    ['<!--BIB-OBJ-->', '<!--/BIB-OBJ-->', () => objectius(DIN.biblioteca_coses)],
    ['<!--BIB-MODES-->', '<!--/BIB-MODES-->', modes],
    ['<!--BIB-KANBAN-->', '<!--/BIB-KANBAN-->', () => kanban(DIN.biblioteca_coses)],
    ['<!--BIB-MAPA-->', '<!--/BIB-MAPA-->', () => mapa(DIN.biblioteca_coses)],
    ['<!--BIB-GOV-->', '<!--/BIB-GOV-->', () => gov(DIN.biblioteca_coses)],
    ['/*BIB-TAULES*/', '/*/BIB-TAULES*/', taules]
  ]
};

function posa(html, blocs) {
  for (const [obre, tanca, fn] of blocs) {
    const i = html.indexOf(obre), k = html.indexOf(tanca);
    if (i < 0 || k < i) return { err: `hi falten les marques ${obre} … ${tanca}` };
    html = html.slice(0, i) + obre + '\n' + fn() + '\n' + html.slice(k);
  }
  return { html };
}

if (CHECK) {
  console.log('\nGuarda de les dues dinàmiques · les pàgines surten de les taules de l\'app');
  let mal = 0;
  for (const [f, blocs] of Object.entries(BLOCS)) {
    const pagina = readFileSync(join(SOS, f), 'utf8');
    const r = posa(pagina, blocs);
    if (r.err) { mal++; console.log(`  ✗ a ${f} ${r.err}`); }
    else if (r.html !== pagina) { mal++; console.log(`  ✗ ${f} està vella: corre \`node SOS/tools/build-comuns.js\``); }
    else console.log(`  ✓ els ${blocs.length} blocs de ${f} quadren amb les taules de l'app`);
  }
  if (sensValor.length) console.log(`  · ${sensValor.join(', ')} sense valor propi a ORACLE_OBJECT_DEFAULTS: cau a «altres» (${VALORS_APP.altres} €)`);
  if (sensDesgast.length) console.log(`  · ${sensDesgast.join(', ')} sense desgast propi a WEAR_RATES`);
  console.log(mal ? `\n❌ ${mal} problema${mal === 1 ? '' : 's'}.` : '\n✅ Les dues dinàmiques quadren.');
  process.exit(mal ? 1 : 0);
}

let tocades = 0;
for (const [f, blocs] of Object.entries(BLOCS)) {
  const cami = join(SOS, f);
  const pagina = readFileSync(cami, 'utf8');
  const r = posa(pagina, blocs);
  if (r.err) { console.log(`✗ a ${f} ${r.err}`); process.exit(1); }
  if (r.html !== pagina) { writeFileSync(cami, r.html); tocades++; }
}
console.log(`✅ Les dues dinàmiques · ${tocades} pàgines escrites · ` +
  `${DIN.banc_temps.pairs.length} i ${DIN.biblioteca_coses.pairs.length} intercanvis, ` +
  `${TIPUS.length} tipologies d'objecte`);
if (sensValor.length) console.log(`   · ${sensValor.join(', ')} sense valor propi a l'app: cau a «altres» (${VALORS_APP.altres} €)`);

module.exports = { DIN, VALORS, DESGAST, TIPUS, MODES };
