#!/usr/bin/env node
/* El cervell d'un projecte · el mapa i el contracte, comprovats
 * ─────────────────────────────────────────────────────────────────────────
 * Un projecte que treballa amb IAs té un cervell: el que una IA ha de llegir
 * abans d'escriure-hi. Si aquest cervell diu coses que ja no són certes, la IA
 * no pregunta —llegeix, se'n fa una idea i escriu al lloc equivocat amb tota la
 * confiança del món. **Un mapa fals és pitjor que cap mapa.**
 *
 * Aquest fitxer és l'eina del cervell, i és **la mateixa per a qualsevol
 * projecte**: TeamTowers la fa servir per a aquest repositori i un client la
 * copia tal qual al seu. El que canvia d'un projecte a l'altre no és el codi,
 * és `cervell.json` a l'arrel del projecte (vegeu
 * `SOS/knowledge/cervell/README.md`).
 *
 * Fa dues coses:
 *
 * 1. **El mapa, generat.** Recorre l'arbre de debò, el creua amb les cares
 *    declarades a la taxonomia i escriu el mapa. `--check` peta si hi ha una
 *    carpeta sense cara, una cara sense carpeta o un mapa que no és el que
 *    sortiria ara.
 * 2. **El contracte, comprovat.** Tot fitxer o funció que els fitxers de
 *    lectura anomenen entre `cometes` ha d'existir, i el que diuen que no hi és
 *    no hi ha de ser. El contracte de la IA ja va ser un mapa fals una vegada
 *    (els 18 vedes quan n'hi havia 116); el que ho va arreglar va ser una
 *    revisió a mà, i una revisió a mà no corre al CI.
 *
 * Sense dependències i amb `require`, perquè ha de córrer igual en un
 * repositori que no té `package.json`.
 *
 * Ús:  node SOS/tools/cervell.js [--arrel <dir>] [--check]
 *      node SOS/tools/cervell.js --nou <dir> [--nom <nom>]   instal·la un cervell
 */
const { readFileSync, writeFileSync, readdirSync, statSync, existsSync, cpSync, copyFileSync, mkdirSync } = require('node:fs');
const { join, dirname, basename, resolve, relative } = require('node:path');

const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const opcio = nom => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] : null; };

/* ── Instal·lar un cervell en un projecte ────────────────────────────────────
   Copiar la plantilla a mà vol dir oblidar-se l'eina, i un cervell sense eina
   és un mapa escrit a mà: el primer dia diu la veritat i el segon ja no. Per
   això s'instal·la amb una ordre que copia les dues coses i escriu el primer
   mapa. No trepitja mai un cervell que ja hi és. */
if (opcio('--nou')) {
  const desti = resolve(opcio('--nou'));
  if (existsSync(join(desti, 'cervell.json'))) {
    console.log(`✗ ${desti} ja té cervell.json. No es trepitja un cervell que ja hi és.`);
    process.exit(1);
  }
  mkdirSync(desti, { recursive: true });
  cpSync(join(__dirname, '..', 'knowledge', 'cervell', 'plantilla'), desti, { recursive: true, force: false, errorOnExist: false });
  const conf = JSON.parse(readFileSync(join(desti, 'cervell.json'), 'utf8'));
  if (opcio('--nom')) conf.nom = opcio('--nom');
  writeFileSync(join(desti, 'cervell.json'), JSON.stringify(conf, null, 2) + '\n');
  mkdirSync(dirname(join(desti, conf.eina)), { recursive: true });
  copyFileSync(__filename, join(desti, conf.eina));
  console.log(`✅ Cervell instal·lat a ${desti}. Ara:  node ${conf.eina}  i després  node ${conf.eina} --check`);
  process.exit(0);
}

/* Sense `--arrel`, l'arrel és la primera carpeta amb `cervell.json` pujant des
   d'on viu l'eina: aquí és `SOS/tools/` i a un client `guardas/`, i la mateixa
   eina ha de trobar el seu projecte en tots dos llocs. */
const trobaArrel = () => {
  for (let d = __dirname; ; d = dirname(d)) {
    if (existsSync(join(d, 'cervell.json'))) return d;
    if (dirname(d) === d) return process.cwd();
  }
};
const ARREL = resolve(opcio('--arrel') || trobaArrel());
const CONF = join(ARREL, 'cervell.json');

let fails = 0;
const bad = m => { fails++; console.log('  ✗ ' + m); };
const ok = m => console.log('  ✓ ' + m);

if (!existsSync(CONF)) {
  console.log(`✗ No hi ha cervell.json a ${ARREL}. Sense declaració no hi ha cervell que comprovar.`);
  process.exit(1);
}
const C = JSON.parse(readFileSync(CONF, 'utf8'));
const rel = p => relative(ARREL, p) || '.';
const TAX = join(ARREL, C.taxonomia);
const MAPA = join(ARREL, C.mapa);
const FORA = new Set(['.git', 'node_modules', ...(C.fora || [])]);
const BAIXA = new Set(C.baixa || []);

/* ── Les cares ───────────────────────────────────────────────────────────────
   Cinc i no set: cada cara de més és una decisió que algú ha de prendre cada
   cop que crea un fitxer. Un projecte pot canviar-ne el text, no el nombre. */
/* El mapa el llegeix el client, i un client que treballa en castellà ha de
   llegir-lo en castellà. Les comprovacions, no: les llegeix qui manté l'eina. */
const T = {
  ca: {
    llei: 'Les regles que governen la resta. Si es trenquen, invaliden la feina feta.',
    obra: 'La cosa mateixa: el que fa servir la gent. Una sola font de veritat per cada cosa.',
    prova: 'El que comprova que l\'obra compleix la llei. Ha de petar quan toca, i només llavors.',
    saber: 'El que sabem i encara no és obra. Es cita, no es copia.',
    arxiu: 'El que va ser. Es conserva; **no es llegeix com a present**.',
    titol: 'Mapa del repositori', generat: 'Generat per', noEditis: 'No l\'editis a mà.',
    capcal: ['Les cares es declaren a', 'això és el que en', 'surt en creuar-les amb l\'arbre de debò. Si el mapa i l\'arbre divergeixen, el',
      'CI peta — un mapa desactualitzat és pitjor que cap mapa.'],
    comenca: 'Comença per aquí, després', idespres: ' i després ',
    taula: '| carpeta | què hi entra | fitxers |', arrel: 'arrel', alArrel: 'a l\'arrel del repositori',
    peu: 'carpetes declarades · generat des de l\'arbre, no escrit.'
  },
  es: {
    llei: 'Las reglas que gobiernan el resto. Si se rompen, invalidan el trabajo hecho.',
    obra: 'La cosa misma: lo que usa la gente. Una sola fuente de verdad por cosa.',
    prova: 'Lo que comprueba que la obra cumple la ley. Debe fallar cuando toca, y solo entonces.',
    saber: 'Lo que sabemos y aún no es obra. Se cita, no se copia.',
    arxiu: 'Lo que fue. Se conserva; **no se lee como presente**.',
    titol: 'Mapa del repositorio', generat: 'Generado por', noEditis: 'No lo edites a mano.',
    capcal: ['Las caras se declaran en', 'esto es lo que', 'sale al cruzarlas con el árbol real. Si el mapa y el árbol divergen, el',
      'CI falla — un mapa desactualizado es peor que ningún mapa.'],
    comenca: 'Empieza por aquí, después', idespres: ' y después ',
    taula: '| carpeta | qué entra | ficheros |', arrel: 'raíz', alArrel: 'en la raíz del repositorio',
    peu: 'carpetas declaradas · generado desde el árbol, no escrito.'
  }
};
const L = T[C.idioma || 'ca'];
if (!L) { console.log(`✗ Idioma «${C.idioma}» sense textos. N'hi ha: ${Object.keys(T).join(', ')}.`); process.exit(1); }
const CARA_DIU = { llei: L.llei, obra: L.obra, prova: L.prova, saber: L.saber, arxiu: L.arxiu, ...(C.cares || {}) };
const CARES = Object.keys(CARA_DIU);

if (!existsSync(TAX)) { console.log(`✗ Falta la taxonomia ${C.taxonomia}.`); process.exit(1); }
const decl = new Map();
[...readFileSync(TAX, 'utf8').matchAll(/^- `([^`]+)` · (\w+) · (.+)$/gm)].forEach(m => {
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
    const r = prefix ? prefix + '/' + nom : nom;
    if (FORA.has(r) || FORA.has(nom)) continue;
    out.push(r);
    /* Només es baixa on el projecte ho diu (`baixa`): la cara és de la carpeta,
       i declarar cada subcarpeta de cada versió arxivada seria demanar que
       ningú ho mantingui. */
    if (BAIXA.has(r)) out.push(...dirs(abs, r));
  }
  return out;
}

function compta(dir) {
  let n = 0, bytes = 0;
  const anar = d => {
    for (const nom of readdirSync(d)) {
      if (nom === '.git' || nom === 'node_modules') continue;
      /* El mapa no es compta a si mateix: comptant-lo, escriure'l canviava la
         xifra que hi anava a dins i `--check` petava contra la seva sortida. */
      if (join(d, nom) === MAPA) continue;
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
const enllac = f => `[\`${basename(f) === 'README.md' ? basename(dirname(f)) + '/README.md' : basename(f)}\`](${relative(dirname(MAPA), join(ARREL, f))})`;
const lectura = (C.lectura || []).filter(l => join(ARREL, l.path) !== MAPA);

let md = `# ${L.titol}

> **${L.generat} \`${C.eina}\`. ${L.noEditis}**
> ${L.capcal[0]} [\`${basename(TAX)}\`](${relative(dirname(MAPA), TAX)}); ${L.capcal[1]}
> ${L.capcal[2]}
> ${L.capcal[3]}

`;
if (lectura.length) {
  md += L.comenca + ' ' + lectura.map(l => `${enllac(l.path)} (${l.diu})`).join(L.idespres) + '.\n\n';
}

CARES.forEach(cara => {
  const meves = arbre.filter(d => decl.get(d) && decl.get(d).cara === cara);
  if (!meves.length) return;
  md += `## ${cara}\n\n${CARA_DIU[cara]}\n\n${L.taula}\n|---|---|---|\n`;
  meves.forEach(d => {
    const c = compta(join(ARREL, d));
    md += `| \`${d}/\` | ${decl.get(d).diu} | ${c.n} · ${c.kb} KB |\n`;
  });
  md += '\n';
});

/* Els fitxers solts de l'arrel no tenen carpeta on declarar-se. Si el projecte
   en té (`solts`), es compten com a bloc i es diu què són. */
if (C.solts) {
  const solts = readdirSync(ARREL).filter(f => {
    if (f.startsWith('.')) return false;
    try { return statSync(join(ARREL, f)).isFile() && f.endsWith(C.solts.ext); } catch (e) { return false; }
  });
  md += `## ${L.arrel} · ${C.solts.titol}\n\n`;
  md += `${solts.length} ${C.solts.titol} ${L.alArrel} (\`${solts.slice(0, 4).join('`, `')}\`…).\n`;
  md += C.solts.diu.join('\n') + '\n\n';
}
md += `---\n\n*${arbre.length} ${L.peu}*\n`;

if (!CHECK) {
  writeFileSync(MAPA, md);
  console.log(`✅ ${rel(MAPA)} · ${arbre.length} carpetes · ${Math.round(md.length / 1024)} KB`);
  process.exit(0);
}

/* ── 1 · El mapa ─────────────────────────────────────────────────────────── */
console.log(`\nCervell de ${C.nom} · el mapa diu el que hi ha`);
const carsMal = [...decl.entries()].filter(([, v]) => CARES.indexOf(v.cara) < 0);
if (!carsMal.length) ok(`les ${decl.size} cares declarades són de les ${CARES.length} que hi ha`);
else bad(`cares inventades: ${carsMal.map(([k, v]) => k + ' → ' + v.cara).join(', ')}`);

const sense = arbre.filter(d => !decl.has(d));
if (!sense.length) ok(`les ${arbre.length} carpetes de l'arbre tenen cara declarada`);
else bad(`${sense.length} carpetes sense cara a ${basename(TAX)}: ${sense.join(', ')} — ` +
  'crear una carpeta sense dir què és deixa la pregunta «on va això?» sense resposta');

const fantasma = [...decl.keys()].filter(d => !existsSync(join(ARREL, d)));
if (!fantasma.length) ok('i cap cara declarada apunta a una carpeta que ja no hi és');
else bad(`${fantasma.length} cares declarades sense carpeta: ${fantasma.join(', ')}`);

const vell = existsSync(MAPA) ? readFileSync(MAPA, 'utf8') : '';
if (vell === md) ok('el mapa és el que sortiria ara');
else bad(`el mapa no correspon a l'arbre. Arregla-ho amb:  node ${C.eina}`);

/* ── 2 · Les peces del cervell ───────────────────────────────────────────── */
console.log('\nLes peces: lectura, backlog i comunicació');
const peces = [...(C.lectura || []).map(l => l.path), C.backlog, C.comunicacio].filter(Boolean);
const falten = peces.filter(p => !existsSync(join(ARREL, p)));
if (!falten.length) ok(`les ${peces.length} peces declarades hi són`);
else bad(`falten peces del cervell: ${falten.join(', ')}`);

/* ── 3 · El contracte no menteix ─────────────────────────────────────────────
   El que un fitxer de lectura cita entre `cometes` amb cara de fitxer ha
   d'existir. Es busca com a ruta relativa al fitxer, com a ruta des de l'arrel
   o des de les `bases` del projecte (on el codex escriu `tools/` per
   `SOS/tools/`), i com a últim recurs pel nom a qualsevol lloc de l'arbre: «`run.mjs`» és
   cert si n'hi ha un. Una funció citada amb parèntesis («`pushLedger()`») ha
   d'aparèixer definida o cridada en algun fitxer de codi. I el que el contracte
   diu que **no** hi és (`noHiEs`) tampoc hi pot ser: una afirmació negativa
   també caduca. */
console.log('\nEl contracte: el que s\'hi cita existeix');
const TOT = [], CODI = [];
(function anar(d) {
  for (const nom of readdirSync(d)) {
    if (FORA.has(nom) || nom === '.git' || nom === 'node_modules') continue;
    const abs = join(d, nom);
    let st; try { st = statSync(abs); } catch (e) { continue; }
    if (st.isDirectory()) { TOT.push(abs + '/'); anar(abs); }
    else { TOT.push(abs); if (/\.(m?js|html|gs)$/.test(nom)) CODI.push(abs); }
  }
})(ARREL);
const perNom = new Set(TOT.map(p => basename(p.replace(/\/$/, '')) + (p.endsWith('/') ? '/' : '')));
const RUTA = /^[\w.\-/]+(\.(md|m?js|json|html|ya?ml|gs|css|toml|txt)|\/)$/;
const FUNCIO = /^([A-Za-z_$][\w$]*)\(\)$/;
const noHiEs = new Set(C.noHiEs || []);
/* El que git ignora (`datos/` amb els contactes d'un client) existeix a la
   màquina de qui treballa i no al CI. Citar-ho és correcte; no es comprova. */
const ignorat = new Set((existsSync(join(ARREL, '.gitignore')) ? readFileSync(join(ARREL, '.gitignore'), 'utf8') : '')
  .split('\n').map(l => l.trim().replace(/^\//, '').replace(/\/$/, '')).filter(l => l && !l.startsWith('#') && !/[*!]/.test(l)));
let codiText = null;
const existeixFuncio = nom => {
  if (codiText === null) codiText = CODI.map(f => readFileSync(f, 'utf8')).join('\n');
  return new RegExp('\\b' + nom.replace(/\$/g, '\\$') + '\\s*[(=:]').test(codiText);
};
let citats = 0;
/* El mapa no es revisa: el genera aquesta mateixa eina a partir de l'arbre. */
(C.lectura || []).map(l => l.path).filter(p => existsSync(join(ARREL, p)) && p.endsWith('.md') && join(ARREL, p) !== MAPA).forEach(p => {
  const abs = join(ARREL, p);
  const text = readFileSync(abs, 'utf8').replace(/```[\s\S]*?```/g, '');
  for (const [, t] of text.matchAll(/`([^`\n]+)`/g)) {
    if (t.includes('*') || t.includes(' ') || /^https?:/.test(t)) continue;
    const f = t.match(FUNCIO);
    if (f) {
      citats++;
      if (!existeixFuncio(f[1])) bad(`${p} cita \`${t}\` i cap fitxer de codi la defineix ni la crida`);
      continue;
    }
    if (!RUTA.test(t)) continue;
    citats++;
    const ruta = t.replace(/\/$/, '');
    if (ignorat.has(ruta) || ignorat.has(ruta.split('/')[0])) continue;
    const hiEs = existsSync(resolve(dirname(abs), ruta)) || existsSync(join(ARREL, ruta))
      || (C.bases || []).some(b => existsSync(join(ARREL, b, ruta)))
      || (!ruta.includes('/') && perNom.has(basename(t) + (t.endsWith('/') ? '/' : '')));
    if (noHiEs.has(t)) { if (hiEs) bad(`${p} diu que \`${t}\` no hi és, i hi és`); continue; }
    if (!hiEs) bad(`${p} cita \`${t}\` i no existeix`);
  }
});
ok(`${citats} referències revisades als fitxers de lectura`);

console.log(fails ? `\n❌ ${fails} problema${fails === 1 ? '' : 's'} al cervell.`
  : '\n✅ El cervell diu el que hi ha, i tot el que hi ha té cara.');
process.exit(fails ? 1 : 0);
