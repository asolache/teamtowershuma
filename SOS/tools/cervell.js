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
 *      node SOS/tools/cervell.js --actualitza <dir>           li porta l'herència nova
 */
const { readFileSync, writeFileSync, readdirSync, statSync, existsSync, cpSync, copyFileSync, mkdirSync } = require('node:fs');
const { join, dirname, basename, resolve, relative } = require('node:path');

const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const opcio = nom => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] : null; };

/* ── L'herència: el que un projecte rep de TeamTowers ───────────────────────────
   Un cervell nou amb tres vedes és un cervell que ha d'aprendre de zero el que
   aquí ja vam pagar. Per això el projecte hereta les vedes que valen per a
   qualsevol projecte, el mètode del mapa de valor i les IA que el fan servir
   (la skill i el contracte). Es declaren a `knowledge/cervell/heretat.json` i
   **no es copien a mà**: es treuen del codex i dels fitxers de debò cada cop que
   s'instal·la o s'actualitza un cervell, perquè una còpia a mà divergeix en
   silenci (veda 71). Les rutes de SOS es reescriuen: a la còpia si s'hereta, a
   l'origen públic si no. I tot passa pel sedàs abans de sortir (veda 159). */
const HERETAT = join(__dirname, '..', 'knowledge', 'cervell', 'heretat.json');
function herencia(conf) {
  const H = JSON.parse(readFileSync(HERETAT, 'utf8'));
  const TT = join(__dirname, '..', '..');
  const errors = [], out = new Map();
  const es = (conf.idioma || 'ca') === 'es';
  const desti = conf.heretat || 'saber/vedas-heredadas.md';
  const reescriu = text => text.replace(/(^|[^\w/.-])((?:SOS|\.claude)\/[\w./<>-]*[\w>])/g, (m, a, ruta) => {
    const dest = Object.keys(H.fitxers).find(d => H.fitxers[d] === ruta);
    /* Des de l'arrel, com cita SOS: una skill es llegeix des de l'arrel del
       projecte, no des de la seva carpeta. Un patró (`*.md`, `<ram>`) no és
       un fitxer: s'enllaça la carpeta de l'origen. */
    if (dest) return a + dest;
    const patro = ruta.search(/[*<]/);
    return a + (patro < 0 ? H.font + ruta : H.font.replace('/blob/', '/tree/') + ruta.slice(0, ruta.lastIndexOf('/', patro) + 1));
  });
  const codex = readFileSync(join(TT, 'SOS', 'knowledge', 'codex.md'), 'utf8');
  const caps = [...codex.matchAll(/^## Veda (\d+) — .+$/gm)].map(m => ({ n: +m[1], at: m.index }));
  const tall = at => { const r = codex.indexOf('\n## ', at + 3); return r < 0 ? codex.length : r; };
  let md = es
    ? `# Vedas heredadas de TeamTowers\n\n> **No lo edites:** sale del codex de TeamTowers (${H.font}SOS/knowledge/codex.md)\n> y se actualiza con \`cervell.js --actualitza\`. Las vedas propias de este\n> proyecto van en \`codex.md\`. Están en catalán, la lengua en que se escribieron.\n`
    : `# Vedes heretades de TeamTowers\n\n> **No l'editis:** surt del codex de TeamTowers (${H.font}SOS/knowledge/codex.md)\n> i s'actualitza amb \`cervell.js --actualitza\`. Les vedes pròpies d'aquest\n> projecte van a \`codex.md\`.\n`;
  let n = 0;
  for (const [tema, nums] of Object.entries(H.vedes)) {
    md += `\n## ${tema}\n`;
    for (const num of nums) {
      const c = caps.find(x => x.n === num);
      if (!c) { errors.push(`la veda ${num} de heretat.json no és al codex`); continue; }
      n++;
      md += '\n' + codex.slice(c.at, tall(c.at)).trim().replace(/^(#{2,5}) /gm, '#$1 ') + '\n';
    }
  }
  out.set(desti, reescriu(md));
  for (const [dest, font] of Object.entries(H.fitxers)) {
    if (!existsSync(join(TT, font))) { errors.push(`heretat.json hereta ${font} i no existeix`); continue; }
    let t = readFileSync(join(TT, font), 'utf8');
    const cap = es
      ? `<!-- Heredado de TeamTowers: ${H.font}${font} · no lo edites; se actualiza con cervell.js --actualitza -->\n`
      : `<!-- Heretat de TeamTowers: ${H.font}${font} · no l'editis; s'actualitza amb cervell.js --actualitza -->\n`;
    /* La capçalera YAML d'una skill ha de quedar la primera línia. */
    /* El codi i les pàgines es copien tal qual: reescriure-hi rutes canviaria
       el que fan. Només el text (`.md`) porta capçalera i rutes noves. */
    if (!dest.endsWith('.md')) { out.set(dest, t); continue; }
    t = t.startsWith('---\n') ? t.replace(/^(---\n[\s\S]*?\n---\n)/, '$1' + cap) : cap + t;
    out.set(dest, reescriu(t));
  }
  for (const [dest, t] of out) H.sedas.forEach(re => {
    const m = t.match(new RegExp(re));
    if (m) errors.push(`el sedàs atura ${dest}: «${m[0]}» (patró ${re})`);
  });
  return { out, errors, vedes: n };
}
function hereta(desti, conf) {
  const { out, errors, vedes } = herencia(conf);
  if (errors.length) { errors.forEach(e => console.log('✗ ' + e)); console.log('✗ No s\'hereta res fins que el sedàs i les referències passin.'); process.exit(1); }
  for (const [f, t] of out) { mkdirSync(dirname(join(desti, f)), { recursive: true }); writeFileSync(join(desti, f), t); }
  console.log(`✅ ${vedes} vedes i ${out.size - 1} fitxers de saber i IA heretats de TeamTowers`);
}

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
  hereta(desti, conf);
  console.log(`✅ Cervell instal·lat a ${desti}. Ara:  node ${conf.eina}  i després  node ${conf.eina} --check`);
  process.exit(0);
}
/* El seguiment: un cervell que ja hi és rep l'eina i l'herència d'avui, i no
   es toca res més —ni les vedes pròpies, ni la taxonomia, ni el backlog. */
if (opcio('--actualitza')) {
  const desti = resolve(opcio('--actualitza'));
  if (!existsSync(join(desti, 'cervell.json'))) { console.log(`✗ ${desti} no té cervell.json: instal·la'l amb --nou.`); process.exit(1); }
  const conf = JSON.parse(readFileSync(join(desti, 'cervell.json'), 'utf8'));
  mkdirSync(dirname(join(desti, conf.eina)), { recursive: true });
  copyFileSync(__filename, join(desti, conf.eina));
  hereta(desti, conf);
  console.log(`✅ Cervell actualitzat a ${desti}. Ara:  node ${conf.eina}  per refer el mapa i la pàgina`);
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
const PAGINA = C.pagina ? join(ARREL, C.pagina) : null;
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
    peu: 'carpetes declarades · generat des de l\'arbre, no escrit.',
    pTitol: 'El cervell de', pLead: 'El que una IA llegeix abans d\'escriure en aquest projecte. Es genera del repositori i el CI comprova que diu la veritat: si deixa de ser certa, peta.',
    pPeces: 'Les peces', pLectura: 'L\'ordre de lectura', pCares: 'On va cada cosa', pVedes: 'Les vedes', pVedesDiu: 'Cada veda és un error que ja es va cometre, escrit perquè ningú l\'hagi de tornar a aprendre.',
    pBacklog: 'El que queda per fer', pBacklogDiu: 'blocs al backlog', pGuarda: 'Com se sap que és cert',
    pGuardaDiu: 'Cada canvi passa per la guarda: cap carpeta sense cara, cap mapa vell, cap cita a un fitxer o una funció que no existeix.',
    pFalta: 'falta', pHiEs: 'hi és', pCap: 'Encara cap.',
    pHeretades: 'heretades', pHeretadesDiu: 'Les heretades de TeamTowers, per tema. No s\'editen aquí: arriben amb cada actualització.',
    pPecaNom: { heretat: 'L\'herència de TeamTowers', comunicacio: 'La comunicació', taxonomia: 'La taxonomia', mapa: 'El mapa', codex: 'El codex', backlog: 'El backlog', contracte: 'El contracte de la IA' }
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
    peu: 'carpetas declaradas · generado desde el árbol, no escrito.',
    pTitol: 'El cerebro de', pLead: 'Lo que una IA lee antes de escribir en este proyecto. Se genera del repositorio y el CI comprueba que dice la verdad: si deja de ser cierto, falla.',
    pPeces: 'Las piezas', pLectura: 'El orden de lectura', pCares: 'Dónde va cada cosa', pVedes: 'Las vedas', pVedesDiu: 'Cada veda es un error que ya se cometió, escrito para que nadie tenga que volver a aprenderlo.',
    pBacklog: 'Lo que queda por hacer', pBacklogDiu: 'bloques en el backlog', pGuarda: 'Cómo se sabe que es cierto',
    pGuardaDiu: 'Cada cambio pasa por la guarda: ninguna carpeta sin cara, ningún mapa viejo, ninguna cita a un fichero o una función que no existe.',
    pFalta: 'falta', pHiEs: 'está', pCap: 'Todavía ninguno.',
    pHeretades: 'heredadas', pHeretadesDiu: 'Las heredadas de TeamTowers, por tema. No se editan aquí: llegan con cada actualización.',
    pPecaNom: { heretat: 'La herencia de TeamTowers', comunicacio: 'La comunicación', taxonomia: 'La taxonomía', mapa: 'El mapa', codex: 'El codex', backlog: 'El backlog', contracte: 'El contrato de la IA' }
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
         xifra que hi anava a dins i `--check` petava contra la seva sortida.
         La pàgina del cervell, igual. */
      if (join(d, nom) === MAPA || join(d, nom) === PAGINA) continue;
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

/* ── La pàgina del cervell ───────────────────────────────────────────────────
   El mapa el llegeix una IA; la pàgina, el client. Qui ha encarregat el
   projecte no obre GitHub, i si no veu el cervell no sap que el té. Per això,
   si el projecte la declara (`pagina`), surt una pàgina sola, sense
   dependències, que s'obre amb doble clic i diu el mateix que el mapa: es
   genera del mateix arbre i `--check` peta si ha quedat vella. */
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/* El codex i el backlog s'escriuen en Markdown: el codi es manté codi i la
   negreta es treu, que en un títol de llista només fa soroll. */
const md2 = t => esc(t.replace(/\*\*/g, '')).replace(/`([^`]+)`/g, '<code>$1</code>');
const enl = f => esc(relative(dirname(PAGINA || MAPA), join(ARREL, f)).split('\\').join('/'));
function pagina() {
  const llegeix = f => (f && existsSync(join(ARREL, f))) ? readFileSync(join(ARREL, f), 'utf8') : '';
  const vedes = [...llegeix(C.codex).matchAll(/^##\s+Veda\s+(\d+)\s*[—–-]\s*(.+)$/gm)].map(m => ({ n: m[1], t: m[2].trim() }));
  const blocs = [...llegeix(C.backlog).matchAll(/^###\s+(.+)$/gm)].map(m => m[1].trim());
  const contracte = (C.lectura || []).map(l => l.path).find(p => p !== C.mapa && p !== C.taxonomia && p !== C.codex);
  const peces = [['comunicacio', C.comunicacio], ['heretat', C.heretat], ['taxonomia', C.taxonomia], ['mapa', C.mapa], ['codex', C.codex],
    ['contracte', contracte], ['backlog', C.backlog]].filter(([, f]) => f);
  const li = (a, b) => `<li>${a}${b ? ` <span>${b}</span>` : ''}</li>`;
  let h = `<!doctype html>
<html lang="${C.idioma || 'ca'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(L.pTitol + ' ' + C.nom)}</title>
<style>
:root{--bg:#fbfaf7;--fg:#1d1d1b;--muted:#5f5e5a;--line:#e3e0d8;--ok:#2f7d4f;--ko:#b3261e;--accent:#8a4b16}
@media (prefers-color-scheme:dark){:root{--bg:#161614;--fg:#ecebe6;--muted:#a8a69e;--line:#33322e;--ok:#6cc08e;--ko:#f2a097;--accent:#e2a36b}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:46rem;margin:0 auto;padding:2.5rem 1rem 4rem}
h1{font-size:clamp(1.5rem,5vw,2.1rem);line-height:1.2;margin:0 0 .6rem}
h2{font-size:1.1rem;margin:2.2rem 0 .6rem;padding-top:1.2rem;border-top:1px solid var(--line)}
p,li{color:var(--fg)}.lead{color:var(--muted);font-size:1.05rem;margin:0}
ul,ol{padding-left:1.2rem}li{margin:.3rem 0}li span{color:var(--muted);font-size:.9rem}
a{color:var(--accent)}code{font-size:.88em}
.ok{color:var(--ok)}.ko{color:var(--ko);font-weight:600}
table{width:100%;border-collapse:collapse;font-size:.92rem}td,th{text-align:left;padding:.45rem .4rem;border-bottom:1px solid var(--line);vertical-align:top}
th{color:var(--muted);font-weight:500}.cara{font-weight:600;white-space:nowrap}
details{border-bottom:1px solid var(--line);padding:.45rem 0}summary{cursor:pointer;font-weight:500}
</style>
</head>
<body>
<main>
<h1>${esc(L.pTitol + ' ' + C.nom)}</h1>
<p class="lead">${esc(L.pLead)}</p>

<h2>${esc(L.pPeces)}</h2>
<ul>
`;
  peces.forEach(([k, f]) => {
    const hi = existsSync(join(ARREL, f));
    h += li(`<strong>${esc(L.pPecaNom[k])}</strong> · <a href="${enl(f)}"><code>${esc(f)}</code></a>`,
      hi ? `<b class="ok">${esc(L.pHiEs)}</b>` : `<b class="ko">${esc(L.pFalta)}</b>`) + '\n';
  });
  h += `</ul>\n\n<h2>${esc(L.pLectura)}</h2>\n<ol>\n`;
  (C.lectura || []).forEach(l => { h += li(`<a href="${enl(l.path)}"><code>${esc(l.path)}</code></a>`, esc(l.diu)) + '\n'; });
  h += `</ol>\n\n<h2>${esc(L.pCares)}</h2>\n<table>\n<tr><th></th><th>${esc(L.taula.split('|')[1].trim())}</th><th>${esc(L.taula.split('|')[2].trim())}</th></tr>\n`;
  CARES.forEach(cara => arbre.filter(d => decl.get(d) && decl.get(d).cara === cara).forEach(d => {
    h += `<tr><td class="cara">${esc(cara)}</td><td><code>${esc(d)}/</code></td><td>${esc(decl.get(d).diu)}</td></tr>\n`;
  }));
  /* Les heretades es compten a part i per tema: el client ha de veure què
     és seu i què li ve de casa, i seixanta títols en fila no es llegeixen. */
  const her = llegeix(C.heretat);
  const temes = [];
  her.split(/^## /m).slice(1).forEach(b => {
    const nom = b.split('\n')[0].trim();
    const vs = [...b.matchAll(/^###\s+Veda\s+(\d+)\s*[—–-]\s*(.+)$/gm)].map(m => ({ n: m[1], t: m[2].trim() }));
    if (vs.length) temes.push({ nom, vs });
  });
  const nHer = temes.reduce((a, t) => a + t.vs.length, 0);
  h += `</table>\n\n<h2>${esc(L.pVedes)} · ${vedes.length}${nHer ? ` + ${nHer} ${esc(L.pHeretades)}` : ''}</h2>\n<p class="lead">${esc(L.pVedesDiu)}</p>\n`;
  h += vedes.length ? '<ol>\n' + vedes.map(v => `<li value="${esc(v.n)}">${md2(v.t)}</li>`).join('\n') + '\n</ol>\n' : `<p>${esc(L.pCap)}</p>\n`;
  if (nHer) {
    h += `<p>${esc(L.pHeretadesDiu)} <a href="${enl(C.heretat)}"><code>${esc(C.heretat)}</code></a></p>\n`;
    temes.forEach(t => {
      h += `<details><summary>${esc(t.nom)} · ${t.vs.length}</summary>\n<ul>\n` +
        t.vs.map(v => li(`${esc(v.n)} · ${md2(v.t)}`)).join('\n') + '\n</ul>\n</details>\n';
    });
  }
  h += `\n<h2>${esc(L.pBacklog)} · ${blocs.length} ${esc(L.pBacklogDiu)}</h2>\n`;
  h += blocs.length ? '<ul>\n' + blocs.map(b => li(md2(b))).join('\n') + '\n</ul>\n' : `<p>${esc(L.pCap)}</p>\n`;
  h += `\n<h2>${esc(L.pGuarda)}</h2>\n<p>${esc(L.pGuardaDiu)} <code>node ${esc(C.eina)} --check</code></p>\n</main>\n</body>\n</html>\n`;
  return h;
}

if (!CHECK) {
  writeFileSync(MAPA, md);
  /* Després del mapa: la pàgina diu si el mapa hi és. */
  if (PAGINA) { writeFileSync(PAGINA, pagina()); console.log(`✅ ${rel(PAGINA)}`); }
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
if (PAGINA) {
  const velleta = existsSync(PAGINA) ? readFileSync(PAGINA, 'utf8') : '';
  if (velleta === pagina()) ok('la pàgina del cervell és la que sortiria ara');
  else bad(`la pàgina del cervell (${C.pagina}) és vella. Arregla-ho amb:  node ${C.eina}`);
}

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

/* ── 4 · L'herència que donem ───────────────────────────────────────────────
   Només on viu `heretat.json` (a TeamTowers): si una veda heretada es
   renumera o un fitxer heretat es mou, ho ha de saber aquest CI i no el del
   client el dia que s'actualitzi. */
if (existsSync(HERETAT) && resolve(join(__dirname, '..', '..')) === ARREL) {
  console.log('\nL\'herència que reben els projectes');
  const { errors, vedes, out } = herencia({ idioma: 'es' });
  errors.forEach(bad);
  if (!errors.length) ok(`${vedes} vedes i ${out.size - 1} fitxers heretables, i cap passa del sedàs`);
}

console.log(fails ? `\n❌ ${fails} problema${fails === 1 ? '' : 's'} al cervell.`
  : '\n✅ El cervell diu el que hi ha, i tot el que hi ha té cara.');
process.exit(fails ? 1 : 0);
