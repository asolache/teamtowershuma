#!/usr/bin/env node
/* El mapa del repositori · generat, no escrit
 * ─────────────────────────────────────────────────────────────────────────
 * Un mapa desactualitzat és pitjor que cap mapa: sense mapa mires, i amb un
 * mapa fals vas. I aquí la diferència importa més del normal, perquè qui llegeix
 * això sovint és una IA — i **una persona pregunta, una IA no**: llegeix el nom
 * de la carpeta, se'n fa una idea i escriu. Si el nom enganya, escriu al lloc
 * equivocat amb tota la confiança del món.
 *
 * Per això `MAPA.md` no s'escriu a mà. Es recorre l'arbre de debò, es creua amb
 * les cares declarades a `SOS/knowledge/taxonomia.md`, i el que en surt no pot
 * divergir de la realitat perquè la realitat és l'entrada.
 *
 * `--check` peta si el mapa no és el que sortiria ara, si hi ha una carpeta
 * sense cara declarada, o si hi ha una cara declarada per a una carpeta que ja
 * no existeix. O sigui: **crear una carpeta sense dir què és trenca el CI.**
 * No és burocràcia. És l'única manera que la resposta a «on va això?» segueixi
 * existint d'aquí a dos anys.
 *
 * Ús:  node SOS/tools/build-mapa.js [--check]
 */
const { readFileSync, writeFileSync, readdirSync, statSync, existsSync } = require('node:fs');
const { join, relative } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const TAX = join(ARREL, 'SOS', 'knowledge', 'taxonomia.md');
const MAPA = join(ARREL, 'SOS', 'knowledge', 'MAPA.md');
const CHECK = process.argv.includes('--check');

/* El que no és del projecte i no s'ha de declarar. `node_modules` no hi hauria
   de ser mai (aquest repositori no en té: les proves l'instal·len i l'esborren)
   però si algú el deixa, que no ompli el mapa de soroll. */
const FORA = new Set(['.git', 'node_modules', '.github/workflows']);

let fails = 0;
const bad = m => { fails++; console.log('  ✗ ' + m); };
const ok = m => console.log('  ✓ ' + m);

/* ── Les cares declarades ────────────────────────────────────────────────── */
const CARES = ['llei', 'obra', 'prova', 'saber', 'arxiu'];
const tax = readFileSync(TAX, 'utf8');
const decl = new Map();
[...tax.matchAll(/^- `([^`]+)` · (\w+) · (.+)$/gm)].forEach(m => {
  decl.set(m[1], { cara: m[2], diu: m[3].trim() });
});

/* ── L'arbre de debò ─────────────────────────────────────────────────────── */
function dirs(base, prefix = '') {
  const out = [];
  for (const nom of readdirSync(base)) {
    if (nom.startsWith('.') && nom !== '.github') continue;
    const abs = join(base, nom);
    let st; try { st = statSync(abs); } catch (e) { continue; }
    if (!st.isDirectory()) continue;
    const rel = prefix ? prefix + '/' + nom : nom;
    if (FORA.has(rel) || FORA.has(nom)) continue;
    out.push(rel);
    /* Només es baixa un nivell dins de `SOS`: la cara és de la carpeta, i
       declarar cada subcarpeta de cada versió arxivada seria demanar que ningú
       ho mantingui. */
    if (rel === 'SOS' || rel === 'SOS/knowledge') out.push(...dirs(abs, rel));
  }
  return out;
}

function compta(dir) {
  let n = 0, bytes = 0;
  const anar = d => {
    for (const nom of readdirSync(d)) {
      if (nom === '.git' || nom === 'node_modules') continue;
      /* El mapa no es compta a si mateix. Comptant-lo, escriure'l canviava la
         xifra que hi anava a dins i `--check` no quadrava mai: el generador
         petava contra la seva pròpia sortida. */
      if (nom === 'MAPA.md') continue;
      const abs = join(d, nom);
      let st; try { st = statSync(abs); } catch (e) { continue; }
      if (st.isDirectory()) anar(abs); else { n++; bytes += st.size; }
    }
  };
  try { anar(dir); } catch (e) {}
  return { n, kb: Math.round(bytes / 1024) };
}

const arbre = dirs(ARREL).sort();

/* ── El mapa ─────────────────────────────────────────────────────────────── */
const CARA_DIU = {
  llei: 'Les regles que governen la resta. Si es trenquen, invaliden la feina feta.',
  obra: 'La cosa mateixa: el que fa servir la gent. Una sola font de veritat per cada cosa.',
  prova: 'El que comprova que l\'obra compleix la llei. Ha de petar quan toca, i només llavors.',
  saber: 'El que sabem i encara no és obra. Es cita, no es copia.',
  arxiu: 'El que va ser. Es conserva; **no es llegeix com a present**.'
};

let md = `# Mapa del repositori

> **Generat per \`SOS/tools/build-mapa.js\`. No l'editis a mà.**
> Les cares es declaren a [\`taxonomia.md\`](taxonomia.md); això és el que en
> surt en creuar-les amb l'arbre de debò. Si el mapa i l'arbre divergeixen, el
> CI peta — un mapa desactualitzat és pitjor que cap mapa.

Comença per aquí, després [\`codex.md\`](codex.md) (la llei) i després
[\`for-ai/README.md\`](for-ai/README.md) (el contracte de treball).

`;

CARES.forEach(cara => {
  const meves = arbre.filter(d => decl.get(d) && decl.get(d).cara === cara);
  if (!meves.length) return;
  md += `## ${cara}\n\n${CARA_DIU[cara]}\n\n| carpeta | què hi entra | fitxers |\n|---|---|---|\n`;
  meves.forEach(d => {
    const c = compta(join(ARREL, d));
    md += `| \`${d}/\` | ${decl.get(d).diu} | ${c.n} · ${c.kb} KB |\n`;
  });
  md += '\n';
});

/* Els fitxers solts de l'arrel són el gruix del llegat i no tenen carpeta on
   declarar-se. Es compten com a bloc i es diu què són, que és el que a algú que
   arriba li fa falta saber: que no són el projecte. */
const solts = readdirSync(ARREL).filter(f => {
  if (f.startsWith('.')) return false;
  try { return statSync(join(ARREL, f)).isFile() && f.endsWith('.html'); } catch (e) { return false; }
});
md += `## arrel · pàgines soltes\n\n`;
md += `${solts.length} pàgines HTML a l'arrel del repositori (\`${solts.slice(0, 4).join('`, `')}\`…).\n`;
md += `Són **arxiu**: el web anterior a \`SOS/\`, encara servit per \`_redirects\`.\n`;
md += `No són referència de com es fan les coses ara.\n\n`;
md += `---\n\n*${arbre.length} carpetes declarades · generat des de l'arbre, no escrit.*\n`;

/* ── Comprovacions ───────────────────────────────────────────────────────── */
if (CHECK) {
  console.log('\nGuarda del mapa · cap carpeta sense cara');
  const carsMal = [...decl.entries()].filter(([, v]) => CARES.indexOf(v.cara) < 0);
  if (!carsMal.length) ok(`les ${decl.size} cares declarades són de les ${CARES.length} que hi ha`);
  else bad(`cares inventades: ${carsMal.map(([k, v]) => k + ' → ' + v.cara).join(', ')}`);

  const sense = arbre.filter(d => !decl.has(d));
  if (!sense.length) ok(`les ${arbre.length} carpetes de l'arbre tenen cara declarada`);
  else bad(`${sense.length} carpetes sense cara a taxonomia.md: ${sense.join(', ')} — ` +
    'crear una carpeta sense dir què és deixa la pregunta «on va això?» sense resposta');

  const fantasma = [...decl.keys()].filter(d => !existsSync(join(ARREL, d)));
  if (!fantasma.length) ok('i cap cara declarada apunta a una carpeta que ja no hi és');
  else bad(`${fantasma.length} cares declarades sense carpeta: ${fantasma.join(', ')}`);

  const vell = existsSync(MAPA) ? readFileSync(MAPA, 'utf8') : '';
  if (vell === md) ok('el mapa és el que sortiria ara');
  else bad('el mapa no correspon a l\'arbre. Arregla-ho amb:  node SOS/tools/build-mapa.js');

  console.log(fails ? `\n❌ ${fails} problema${fails === 1 ? '' : 's'} al mapa.`
    : '\n✅ El mapa diu el que hi ha, i tot el que hi ha té cara.');
  process.exit(fails ? 1 : 0);
}

writeFileSync(MAPA, md);
console.log(`✅ SOS/knowledge/MAPA.md · ${arbre.length} carpetes · ${Math.round(md.length / 1024)} KB`);
