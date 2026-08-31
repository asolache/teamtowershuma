#!/usr/bin/env node
/* Genera SOS/vedes.html a partir de SOS/knowledge/codex.md.
 *
 * Per què un generador i no una pàgina escrita a mà: el codex ja és la font. Una
 * segona còpia del mateix text en HTML es desincronitzaria el primer dia i cap
 * de les dues sabria quina mana —que és exactament la veda 71 («tres còpies
 * d'una regla són tres llocs on afluixar-la»). Aquí n'hi ha una de sola, i
 * l'HTML n'és una projecció.
 *
 * Per què el fitxer generat es guarda al repositori i no es construeix al
 * desplegament: el lloc és estàtic i sense passos de construcció, i tot el SOS
 * es pot obrir amb `file://`. Una pàgina que necessités un build per existir
 * trencaria les dues coses.
 *
 * El preu d'això és que l'HTML es pot quedar enrere respecte del codex. Per
 * això hi ha `--check`, que corre a cada PR: si el que hi ha al repositori no
 * és el que sortiria ara, falla i diu com arreglar-ho.
 *
 *   node SOS/tools/build-vedes.js            escriu SOS/vedes.html
 *   node SOS/tools/build-vedes.js --check    falla si està desactualitzat
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'knowledge', 'codex.md');
const OUT = path.join(ROOT, 'vedes.html');
const FONT = 'https://github.com/asolache/teamtowershuma/blob/main/SOS/knowledge/codex.md';

/* ── Markdown, només el que el codex fa servir de debò ──────────────────────
   No és un intèrpret de Markdown: és el subconjunt exacte que hi ha al fitxer
   (paràgrafs, llistes amb i sense número, cites, negreta, cursiva i codi). Si
   algun dia el codex estrena taules o blocs de codi, `assertKnown()` ho atura
   en comptes de deixar-ho passar mal pintat —que és el que fa mal de debò. */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(«])\*([^*]+)\*/g, '$1<em>$2</em>');
}

function assertKnown(lines) {
  lines.forEach((l, i) => {
    if (/^```/.test(l)) throw new Error('línia ' + (i + 1) + ': bloc de codi al codex, i el generador no en sap pintar');
  });
}

/* Taules. El codex no en tenia cap i el generador s'aturava en trobar-ne una,
   que és el que toca fer davant d'una cosa que no saps pintar. Ara la llista
   canònica dels catorze herois n'és una —nom, on està documentat, poder i què
   vol dir en un equip són quatre columnes i no una frase—, així que se n'hi
   ensenya en comptes de desfer la taula. Només la forma que el codex fa servir:
   capçalera, separador i files, sense alineacions. */
const esFilaTaula = l => /^\s*\|.*\|\s*$/.test(l);
const esSeparador = l => /^\s*\|(\s*:?-+:?\s*\|)+\s*$/.test(l);
const cellules = l => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());

/* Les llistes del codex tenen continuacions indentades: la línia següent, si va
   sagnada, pertany al mateix punt. Fondre-les abans de pintar és el que evita
   que una frase partida surti com a paràgraf solt enmig d'una llista. */
function foldContinuations(lines) {
  const out = [];
  lines.forEach(l => {
    const cont = /^\s{2,}\S/.test(l) && out.length && /^\s*(?:[-*]|\d+\.)\s/.test(out[out.length - 1]);
    if (cont) out[out.length - 1] += ' ' + l.trim();
    else out.push(l);
  });
  return out;
}

function mdToHtml(md) {
  const lines = foldContinuations(md.split('\n'));
  const out = [];
  let list = null, para = [], quote = [], taula = null;
  const flushPara = () => { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; } };
  const flushQuote = () => { if (quote.length) { out.push('<blockquote><p>' + inline(quote.join(' ')) + '</p></blockquote>'); quote = []; } };
  const flushList = () => { if (list) { out.push('</' + list + '>'); list = null; } };
  /* La taula va dins d'un embolcall que fa scroll horitzontal ell sol: en un
     mòbil, quatre columnes no hi caben i el que no pot passar és que la pàgina
     sencera es mogui de costat. */
  const flushTaula = () => {
    if (!taula) return;
    const [cap, ...files] = taula;
    out.push('<div class="taula"><table><thead><tr>' +
      cap.map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>' +
      files.map(f => '<tr>' + f.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') +
      '</tbody></table></div>');
    taula = null;
  };
  const flushAll = () => { flushPara(); flushQuote(); flushList(); flushTaula(); };

  lines.forEach(raw => {
    const l = raw.replace(/\s+$/, '');
    if (!l.trim()) { flushAll(); return; }
    if (esFilaTaula(l)) {
      if (esSeparador(l)) return;            // el guionet de sota la capçalera no es pinta
      if (!taula) { flushPara(); flushQuote(); flushList(); taula = []; }
      taula.push(cellules(l));
      return;
    }
    flushTaula();
    const h = l.match(/^(#{3,6})\s+(.*)$/);
    if (h) { flushAll(); const n = Math.min(6, h[1].length + 1); out.push('<h' + n + '>' + inline(h[2]) + '</h' + n + '>'); return; }
    const q = l.match(/^>\s?(.*)$/);
    if (q) { flushPara(); flushList(); quote.push(q[1]); return; }
    const ul = l.match(/^\s*[-*]\s+(.*)$/);
    const ol = l.match(/^\s*(\d+)\.\s+(.*)$/);
    if (ul || ol) {
      flushPara(); flushQuote();
      const want = ul ? 'ul' : 'ol';
      if (list !== want) { flushList(); out.push('<' + want + '>'); list = want; }
      out.push('<li>' + inline(ul ? ul[1] : ol[2]) + '</li>');
      return;
    }
    flushQuote(); flushList();
    para.push(l.trim());
  });
  flushAll();
  return out.join('\n');
}

/* ── Trossejar el codex en seccions ───────────────────────────────────────── */
/* Dues formes de titular conviuen al fitxer, i totes dues són vedes: les
   primeres es van escriure «V22 · Veda comptable» i a partir de la 35 «Veda 35
   — títol». Reconèixer-ne només una hauria deixat mitja meitat del codex fora
   de l'índex sense que es notés. */
const RE_V = /^V(\d+)\s*·\s*(.+)$/;
const RE_VEDA = /^Veda\s+(\d+)\s*[—–-]\s*(.+)$/;

function parse(md) {
  const lines = md.split('\n');
  assertKnown(lines);
  const secs = [];
  let cur = null, intro = [];
  lines.forEach(l => {
    const h = l.match(/^(#{2,3})\s+(.*)$/);
    /* Els V11–V15 són h3 sota «Nous vedes»; la resta són h2. Qualsevol altre h3
       és una subsecció dins d'una veda i s'ha de quedar al cos. */
    const isVeda = h && (RE_V.test(h[2].trim()) || RE_VEDA.test(h[2].trim()));
    if (h && (h[1].length === 2 || isVeda)) {
      cur = { title: h[2].trim(), body: [] };
      secs.push(cur);
      return;
    }
    (cur ? cur.body : intro).push(l);
  });
  const vedes = [], context = [];
  secs.forEach(s => {
    const a = s.title.match(RE_V), b = s.title.match(RE_VEDA);
    if (a || b) vedes.push({ n: Number((a || b)[1]), title: (a || b)[2].trim(), body: s.body.join('\n') });
    else context.push({ title: s.title, body: s.body.join('\n') });
  });
  vedes.sort((x, y) => x.n - y.n);
  return { intro: intro.join('\n'), vedes, context };
}

/* ── La pàgina ────────────────────────────────────────────────────────────── */
const CSS = `
:root{--bg:#0b0b12;--panel:#141420;--card:#1a1a28;--text:#f5f5f7;--muted:#9a9aa6;--light:#c7c7d1;--border:#2a2a35;--indigo:#818cf8;--green:#00e676;--purple:#e040fb}
*{box-sizing:border-box}
/* Sense scroll suau a posta: la pàgina fa 73 vedes, i obrir /vedes#veda-83
   volia dir més d'un segon d'animació travessant-les totes. Un enllaç permanent
   ha d'arribar, no fer un viatge. */
body{margin:0;background:var(--bg);color:var(--text);line-height:1.65;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
  font-size:1.02rem;-webkit-text-size-adjust:100%}
.wrap{max-width:46rem;margin:0 auto;padding:0 1.2rem}
a{color:var(--indigo)}
a:focus-visible,button:focus-visible,input:focus-visible,summary:focus-visible{outline:3px solid var(--green);outline-offset:2px;border-radius:4px}
.skip{position:absolute;left:-9999px}
.skip:focus{left:1rem;top:1rem;position:fixed;z-index:9;background:var(--green);color:#08120c;padding:.6rem 1rem;border-radius:8px;font-weight:700}
header.top{padding:3rem 0 1.6rem;border-bottom:1px solid var(--border)}
.kicker{font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-family:'SF Mono',Monaco,monospace;margin:0}
h1{font-size:clamp(1.8rem,5.5vw,2.6rem);line-height:1.15;margin:.6rem 0 .8rem}
.lead{color:var(--light);margin:0 0 1rem;font-size:1.05rem}
.meta{color:var(--muted);font-size:.85rem;margin:0}
.tools{position:sticky;top:0;z-index:5;background:rgba(11,11,18,.94);backdrop-filter:blur(8px);
  border-bottom:1px solid var(--border);padding:.7rem 0;margin-bottom:1.4rem}
.tools .wrap{display:flex;gap:.6rem;align-items:center;flex-wrap:wrap}
#q{flex:1 1 14rem;min-width:0;background:var(--card);border:1px solid var(--border);color:var(--text);
  border-radius:10px;padding:.62rem .8rem;font-size:1rem;font-family:inherit}
#q::placeholder{color:var(--muted)}
#count{color:var(--muted);font-size:.85rem;font-family:'SF Mono',Monaco,monospace;white-space:nowrap}
.pre{color:var(--light);margin:1.6rem 0 2rem;padding:1rem 1.2rem;background:var(--card);border:1px solid var(--border);border-radius:12px}
.pre p{margin:.5rem 0}
nav.idx{margin:0 0 2.2rem}
nav.idx h2{font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 .7rem;font-weight:600}
nav.idx ol{list-style:none;padding:0;margin:0;columns:2;column-gap:1.6rem}
nav.idx li{break-inside:avoid;margin:0 0 .18rem}
nav.idx a{display:flex;gap:.5rem;align-items:baseline;text-decoration:none;color:var(--light);
  font-size:.92rem;line-height:1.4;padding:.12rem .3rem;border-radius:6px}
nav.idx a:hover{background:var(--card);color:#fff}
nav.idx .n{font-family:'SF Mono',Monaco,monospace;font-size:.8rem;color:var(--green);flex:0 0 1.6rem;text-align:right}
@media(max-width:640px){nav.idx ol{columns:1}}
article.veda{border-top:1px solid var(--border);padding:2rem 0 .6rem;scroll-margin-top:5rem}
article.veda:first-of-type{border-top:0}
.vh{display:flex;gap:.7rem;align-items:baseline}
.vn{font-family:'SF Mono',Monaco,monospace;font-size:.85rem;color:var(--green);
  border:1px solid var(--border);border-radius:7px;padding:.1rem .45rem;flex:0 0 auto}
article.veda h2{font-size:clamp(1.15rem,3.2vw,1.5rem);line-height:1.3;margin:0}
.perma{text-decoration:none;color:var(--muted);font-size:.9rem;opacity:0;flex:0 0 auto}
article.veda:hover .perma,.perma:focus{opacity:1}
article.veda p{margin:.9rem 0}
article.veda ul,article.veda ol{padding-left:1.3rem;margin:.9rem 0}
article.veda li{margin:.45rem 0}
article.veda h3,article.veda h4{font-size:1rem;margin:1.4rem 0 .3rem;color:var(--light)}
blockquote{margin:1rem 0;padding:.2rem 0 .2rem 1rem;border-left:3px solid var(--purple);color:var(--light);font-style:italic}
code{font-family:'SF Mono',Monaco,monospace;font-size:.88em;background:rgba(127,127,127,.16);padding:.1em .35em;border-radius:5px}
strong{color:#fff}
/* La taula fa scroll dins del seu embolcall i no arrossega la pàgina. */
.taula{overflow-x:auto;margin:1rem 0;-webkit-overflow-scrolling:touch}
.taula table{border-collapse:collapse;width:100%;min-width:520px;font-size:.9rem}
.taula th,.taula td{text-align:left;vertical-align:top;padding:.5rem .7rem;border-bottom:1px solid var(--border)}
.taula th{color:var(--light);font-weight:600;font-size:.78rem;letter-spacing:.04em;text-transform:uppercase;
  border-bottom:1px solid var(--purple);white-space:nowrap}
.ctx{border-top:1px solid var(--border);margin-top:3rem;padding-top:2rem}
.ctx>h2{font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 1rem;font-weight:600}
details.ctx-i{border:1px solid var(--border);border-radius:10px;padding:.6rem .9rem;margin:.5rem 0;background:var(--card)}
details.ctx-i summary{cursor:pointer;font-weight:600}
.hidden{display:none}
.empty{color:var(--muted);padding:2rem 0}
footer{border-top:1px solid var(--border);margin-top:3rem;padding:1.6rem 0 3rem;color:var(--muted);font-size:.88rem}
footer a{color:var(--light)}
@media print{.tools,nav.idx,.skip{display:none}article.veda{page-break-inside:avoid}body{background:#fff;color:#000}}
`;

const JS = `
(function(){
  var q=document.getElementById('q'),cnt=document.getElementById('count');
  var arts=[].slice.call(document.querySelectorAll('article.veda'));
  var chips=[].slice.call(document.querySelectorAll('nav.idx li'));
  var empty=document.getElementById('empty');
  var norm=function(s){return s.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'');};
  arts.forEach(function(a){a.dataset.hay=norm(a.textContent);});
  function run(){
    var t=norm(q.value.trim()),n=0;
    arts.forEach(function(a,i){
      var hit=!t||a.dataset.hay.indexOf(t)>=0;
      a.classList.toggle('hidden',!hit);
      if(chips[i])chips[i].classList.toggle('hidden',!hit);
      if(hit)n++;
    });
    empty.classList.toggle('hidden',n>0);
    cnt.textContent=n+' de '+arts.length;
  }
  q.addEventListener('input',run);
  /* El filtre viu a l'URL: així una cerca es pot enviar tal com es veu. */
  var m=location.search.match(/[?&]q=([^&]*)/);
  if(m){q.value=decodeURIComponent(m[1].replace(/\\+/g,' '));}
  run();
})();
`;

function build() {
  const md = fs.readFileSync(SRC, 'utf8');
  const { intro, vedes, context } = parse(md);
  const slug = v => 'veda-' + v.n;
  /* El preàmbul del codex diu que els vedes originals del kernel segueixen
     intactes i que això n'és una ampliació. Deixar-lo fora hauria fet semblar
     que aquestes 73 són totes les que hi ha. */
  const pre = mdToHtml(intro.replace(/^#\s+.*$/m, ''));

  /* L'índex porta el títol sencer, no només el número. Un mur de 73 números és
     compacte i no diu res: el títol de cada veda ja és la regla en una línia, i
     poder-les llegir totes seguides és mig valor de la pàgina. */
  const idx = vedes.map(v =>
    '<li><a href="#' + slug(v) + '"><span class="n">' + v.n + '</span>' +
    '<span class="t">' + inline(v.title) + '</span></a></li>').join('');

  const arts = vedes.map(v =>
    '<article class="veda" id="' + slug(v) + '">\n' +
    '<div class="vh"><span class="vn">' + v.n + '</span>' +
    '<h2>' + inline(v.title) + '</h2>' +
    '<a class="perma" href="#' + slug(v) + '" aria-label="Enllaç permanent a la veda ' + v.n + '">#</a></div>\n' +
    mdToHtml(v.body) + '\n</article>').join('\n');

  const ctx = context.map(c =>
    '<details class="ctx-i"><summary>' + inline(c.title) + '</summary>\n' +
    mdToHtml(c.body) + '\n</details>').join('\n');

  return `<!DOCTYPE html>
<html lang="ca">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Els vedes del SOS · les regles que aguanten el sistema</title>
<meta name="description" content="${vedes.length} vedes: les regles que el SOS s'ha imposat, amb el motiu escrit al costat. Cadascuna surt d'un error real i es pot enllaçar de forma permanent.">
<meta property="og:title" content="Els vedes del SOS">
<meta property="og:description" content="${vedes.length} regles amb el motiu escrit al costat. Cap surt d'una bona intenció: totes surten d'un error concret.">
<meta name="robots" content="index,follow">
<!-- GENERAT per SOS/tools/build-vedes.js des de SOS/knowledge/codex.md.
     No editis aquest fitxer: edita el codex i torna a generar-lo.
     La guarda del CI comprova que els dos no divergeixin. -->
<style>${CSS}</style>
</head>
<body>
<a class="skip" href="#vedes">Salta a les vedes</a>
<header class="top"><div class="wrap">
  <p class="kicker">SOS · Sistema Operatiu Social</p>
  <h1>Els vedes</h1>
  <p class="lead">Les regles que aquest sistema s'ha imposat, amb <strong>el motiu escrit al costat</strong>. Cap no surt d'una bona intenció: cadascuna surt d'un error concret que ja s'havia comès, i explica què es va trencar.</p>
  <p class="meta">${vedes.length} vedes · generades des del <a href="${FONT}">codex</a>, que és l'original. Cada veda té enllaç permanent: <code>/vedes#veda-83</code>.</p>
</div></header>

<div class="tools"><div class="wrap">
  <label class="skip" for="q">Filtra les vedes</label>
  <input id="q" type="search" placeholder="Filtra per número, títol o contingut…" autocomplete="off">
  <span id="count" aria-live="polite"></span>
</div></div>

<main class="wrap" id="vedes">
  <div class="pre">${pre}</div>
  <nav class="idx" aria-label="Índex de vedes"><h2>Totes les regles, en una llista</h2><ol>${idx}</ol></nav>
  ${arts}
  <p class="empty hidden" id="empty">Cap veda amb aquest text. Prova amb una paraula més curta.</p>

  <section class="ctx">
    <h2>Context: el que no és una veda però la sosté</h2>
    ${ctx}
  </section>
</main>

<footer><div class="wrap">
  <p>Aquesta pàgina es genera des de <a href="${FONT}"><code>SOS/knowledge/codex.md</code></a>. Si hi ha diferència entre les dues, mana el codex —i la guarda del CI no deixa que passi.</p>
  <p><a href="/SOS/">Obre el SOS</a> · <a href="/SOS/uneix-te.html">Què és i com s'hi entra</a> · <a href="/">TeamTowers</a></p>
</div></footer>
<script>${JS}</script>
</body>
</html>
`;
}

const html = build();
if (process.argv.includes('--check')) {
  const have = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (have !== html) {
    console.error('\n❌ SOS/vedes.html no correspon a SOS/knowledge/codex.md.');
    console.error('   El codex ha canviat i la pàgina no s\'ha tornat a generar.');
    console.error('   Arregla-ho amb:  node SOS/tools/build-vedes.js\n');
    process.exit(1);
  }
  const { vedes } = parse(fs.readFileSync(SRC, 'utf8'));
  console.log('✅ SOS/vedes.html al dia · ' + vedes.length + ' vedes');
} else {
  fs.writeFileSync(OUT, html);
  const { vedes, context } = parse(fs.readFileSync(SRC, 'utf8'));
  console.log('✅ SOS/vedes.html · ' + vedes.length + ' vedes i ' + context.length +
    ' seccions de context · ' + Math.round(html.length / 1024) + ' KB');
}
