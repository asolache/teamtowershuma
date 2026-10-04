#!/usr/bin/env node
/* El mòdul de suport al mapa de valor · LA DECLARACIÓ
 * ───────────────────────────────────────────────────
 * Aquí viu **el mètode convertit en codi**: les sis passes, les deu regles com
 * a funcions que es poden executar, les tres anàlisis i el text que se li dona
 * a una IA. D'aquí surten quatre coses, i cap d'elles es pot editar a mà:
 *
 *   · `SOS/vna-suport.html`            la consola, per a dins i per a clients
 *   · `.claude/skills/mapa-de-valor/`  el procés, per a una IA que hi treballa
 *   · `SOS/index.html`                 el `system` de l'intent `suggest_map`
 *   · `SOS/knowledge/for-ai/`          el contracte, que ja hi era
 *
 * **Per què una declaració i no quatre documents.** El contracte
 * (`for-ai/mapa-de-valor.md`) ja deia les deu regles en prosa, i una regla en
 * prosa no comprova res: el dia que una proposta en trenqui una, el text no
 * s'assabenta. Escrites aquí són `test(mapa) → {ok, diu}`, i llavors la consola
 * les pot córrer, la guarda les pot córrer i el prompt les pot citar **amb les
 * mateixes paraules**. Millorar el mètode passa a ser editar un fitxer.
 *
 * I el que fa que el mòdul millori i no només existeixi: `SOS/knowledge/vna/`.
 * Cada mapa real hi deixa un cas amb el que va ensenyar, i les troballes que es
 * repeteixen pugen a `patrons.md`. El prompt les hi porta. Sense això, un mòdul
 * de suport és una plantilla que no aprèn.
 *
 * Ús:  node SOS/tools/build-vna-suport.js [--check]
 */
'use strict';
const { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const SOS = join(ARREL, 'SOS');
const CHECK = process.argv.includes('--check');

/* ══ 1 · LES SIS PASSES ═══════════════════════════════════════════════════
   Són les de l'article de Verna Allee (2008), i l'ordre no és decoratiu: la
   passa 1 és la que evita la pregunta de mitja sessió —«i això també hi
   entra?»— i la 4 és la que distingeix un mapa d'un pòster.

   `fa` és el que ha de passar a la sala; `surt` és el que queda escrit. Una
   passa sense sortida escrita és una conversa, no una passa. */
const PASSES = [
  { id: 'abast', n: 1, t: 'Posar la frontera',
    fa: 'Dir de quina activitat parlem i on s\'acaba. En una frase que es pugui repetir.',
    surt: 'abast',
    perque: 'Sense frontera el mapa creix fins als quaranta nodes i ja no es llegeix a una sala.' },
  { id: 'rols', n: 2, t: 'Posar els rols',
    fa: 'Qui participa, dit pel que **fa** i no pel càrrec. Entre sis i dotze —els mateixos que compta la regla 2.',
    surt: 'roles',
    perque: 'Amb càrrecs surt un organigrama amb fletxes, que és el que ja es té i no explica res.' },
  { id: 'parells', n: 3, t: 'Posar el que es lliura, en parelles',
    fa: 'Per cada vincle, què va de A a B i què torna de B a A, i de quina mena és cada cosa.',
    surt: 'pairs',
    perque: 'Escriure el retorn obliga a pensar-lo. Un mapa on algú només dona és un mapa fals.' },
  { id: 'intangibles', n: 4, t: 'Fer sortir els intangibles',
    fa: 'Preguntar pel que s\'ofereix i no es factura: avisos, favors, coneixement, accés, confiança.',
    surt: 'pairs (mena intangible)',
    perque: 'És la meitat invisible, i és l\'única cosa que aquest mètode veu i un diagrama de procés no.' },
  { id: 'seq', n: 5, t: 'Seqüenciar les transaccions',
    fa: 'Dir en quin procés i en quin pas passa cada transacció. I marcar «sempre» el que passa tot el temps.',
    surt: 'processos, seq',
    perque: 'Validar el mapa seqüenciant-lo és el que destapa els passos que ningú fa i els que fa tothom.' },
  { id: 'analisi', n: 6, t: 'Fer les tres anàlisis',
    fa: 'Intercanvi, impacte i creació de valor. Tres preguntes diferents sobre el mateix dibuix.',
    surt: 'troballes',
    perque: 'Un mapa sense anàlisi és un dibuix. El producte és la conversió: quin intangible es pot negociar.' }
];

/* ══ 2 · LES DEU REGLES, EXECUTABLES ══════════════════════════════════════
   Cada una rep el mapa en forma canònica i torna `{ok, diu}`. `diu` és el que
   es veu a la pantalla, i per això està escrit per a qui no sap de VNA.

   Les cinc primeres són del mètode; de la sisena a la desena són d'aquesta
   casa. Les que porten un llindar el porten **mesurat** a
   `vision/auditoria-mapes.md`, i el fitxer ho diu: l'article de 2008 avisa que
   «la recerca encara no ha determinat quines són les proporcions ideals», i
   atribuir-li un número seria el mateix error que inventar una xifra d'euros.

   `dur: true` vol dir que una proposta que la trenqui **no s'ensenya com a
   mapa**: s'ensenya el que li falta. Les toves avisen i deixen passar. */
const REGLES = [
  { id: 'abast', n: 1, dur: true, de: 'mètode', t: 'Hi ha un abast escrit',
    test: m => ({ ok: !!(m.abast && m.abast.trim().length >= 12),
      diu: m.abast ? 'L\'abast hi és' : 'Falta dir de quina activitat parlem i on s\'acaba' }) },

  { id: 'rols', n: 2, dur: true, de: 'mètode', t: 'Entre 6 i 12 rols',
    test: m => { const n = (m.roles || []).length;
      return { ok: n >= 6 && n <= 12,
        diu: n < 6 ? `Només ${n} rols: amb menys de sis, el mapa no ensenya cap patró`
          : n > 12 ? `${n} rols: per sobre de dotze no es llegeix a una sala. Parteix-lo per nivells i digues quin dibuixes`
            : `${n} rols` }; } },

  { id: 'menes', n: 3, dur: true, de: 'mètode', t: 'Com a mínim un terç de transaccions intangibles',
    test: m => { const f = fluxos(m), i = f.filter(x => x.mena === 'intangible').length;
      const pct = f.length ? Math.round(i * 100 / f.length) : 0;
      return { ok: f.length > 0 && pct >= 33,
        diu: !f.length ? 'No hi ha cap transacció'
          : pct >= 33 ? `${i} de ${f.length} intangibles (${pct} %)`
            : `Només ${pct} % d'intangibles: això és un diagrama de processos, no un mapa de valor` }; } },

  { id: 'reciprocitat', n: 4, dur: true, de: 'mètode', t: 'Tot vincle és recíproc',
    test: m => { const mal = (m.pairs || []).filter(p => !p[2] || !p[3] || !p[4] || !p[5]);
      return { ok: !mal.length,
        diu: mal.length ? `${mal.length} vincle(s) a mitges: ${mal.slice(0, 3).map(p => p[0] + ' ↔ ' + p[1]).join(', ')}. Si de debò va en un sol sentit, digues-ho com a troballa`
          : `${(m.pairs || []).length} vincles, tots amb anada i tornada` }; } },

  { id: 'solts', n: 5, dur: true, de: 'mètode', t: 'Cap rol solt',
    test: m => { const t = tocats(m), s = (m.roles || []).filter(r => !t.has(r));
      return { ok: !s.length,
        diu: s.length ? `${s.length} rol(s) sense cap lliurament: ${s.join(', ')}. Un rol que no dona ni rep és una decoració`
          : 'Tots els rols donen i reben' }; } },

  { id: 'densitat', n: 6, dur: false, de: 'la casa', t: 'Densitat ≥ 40 %',
    test: m => { const n = (m.roles || []).length, max = n * (n - 1) / 2;
      const d = max ? Math.round((m.pairs || []).length * 100 / max) : 0;
      return { ok: d >= 40, diu: `${d} % dels vincles possibles` + (d < 40 ? ' — per sota del 40 %, el mapa encara té regions que no s\'han preguntat' : '') }; } },

  { id: 'concentracio', n: 7, dur: false, de: 'la casa', t: 'Cap rol concentra més del 40 %',
    test: m => { const f = fluxos(m), g = {};
      f.forEach(x => { g[x.de] = (g[x.de] || 0) + 1; g[x.a] = (g[x.a] || 0) + 1; });
      let qui = null, max = 0;
      Object.entries(g).forEach(([k, v]) => { if (v > max) { max = v; qui = k; } });
      const pct = f.length ? Math.round(max * 100 / (f.length * 2)) : 0;
      return { ok: pct <= 40,
        diu: qui ? `${qui}: ${pct} %` + (pct > 40 ? ' — una xarxa on tot passa pel nucli és fràgil encara que sigui recíproca' : '') : 'Sense transaccions' }; } },

  { id: 'xifres', n: 8, dur: true, de: 'la casa', t: 'Cap xifra que no es pugui refer',
    test: m => { const mal = textos(m).filter(t => /\d+\s*(€|euros?|%)/i.test(t) || /\b\d{3,}\b/.test(t));
      return { ok: !mal.length,
        diu: mal.length ? `${mal.length} xifra(es) al text: «${mal[0].slice(0, 44)}». El mapa diu on mirar; els números els posa la casa amb els seus`
          : 'Cap xifra inventada' }; } },

  { id: 'noms', n: 9, dur: true, de: 'la casa', t: 'Cap nom propi de persona ni d\'empresa',
    test: m => { const mal = [...(m.roles || []), ...textos(m)]
      .filter(t => /\b(S\.?L\.?|S\.?A\.?|SCCL|S\.?C\.?C\.?L)\b/.test(t) || /\b[A-ZÀ-Ú][a-zà-ú]+ [A-ZÀ-Ú][a-zà-ú]+\b/.test(t));
      return { ok: !mal.length,
        diu: mal.length ? `Sembla que hi ha un nom propi: «${mal[0].slice(0, 44)}». Els rols es diuen pel que fan`
          : 'Cap nom propi' }; } },

  { id: 'processos', n: 10, dur: false, de: 'la casa', t: 'Més d\'un procés, i el que passa «sempre» marcat',
    test: m => { const p = (m.processos || []).length;
      const s = Object.values(m.seq || {}).filter(v => v === 'sempre');
      const mal = Object.entries(m.seq || {}).filter(([k, v]) => v === 'sempre'
        && (fluxos(m).find(f => f.clau === k) || {}).mena === 'tangible');
      return { ok: p >= 2 && !mal.length,
        diu: p < 2 ? 'Un sol procés: el senyal que s\'ha fet l\'exercici equivocat. Optimitzar múltiples vies no és trobar-ne una d\'òptima'
          : mal.length ? `${mal.length} tangible(s) marcat(s) «sempre»: un tangible sense pas és un tangible que ningú ha seqüenciat`
            : `${p} processos i ${s.length} lliurament(s) que passen tot el temps` }; } }
];

/* ══ 3 · LES TRES ANÀLISIS ════════════════════════════════════════════════
   No són tres opinions: són tres preguntes diferents sobre el mateix dibuix, i
   cada una té la seva estructura a l'article. Les columnes són les seves; les
   preguntes estan escrites per a qui les ha de respondre a una sala. */
const ANALISIS = [
  { id: 'intercanvi', t: 'Anàlisi d\'intercanvi', sobre: 'el patró sencer',
    q: ['Hi ha lògica en com es mou el valor, o hi ha trossos que no s\'expliquen?',
      'Les dues menes són sanes, o en domina una?',
      'Hi ha vincles morts, dèbils, culs-de-sac o colls d\'ampolla?',
      'S\'optimitza el sistema sencer, o hi ha rols que hi guanyen a costa d\'altres?'] },
  { id: 'impacte', t: 'Anàlisi d\'impacte', sobre: 'cada transacció **rebuda**',
    cols: ['Què genera', 'Què costa (temps, diners, competència, relacions)',
      'Quin benefici dona (ingrés, capacitat actual, capacitat futura)', 'Com el valora qui el rep (−2…+2)'],
    q: ['La darrera columna és el gomet del full: blau si qui ho rep n\'està satisfet, groc si no.'] },
  { id: 'creacio', t: 'Anàlisi de creació de valor', sobre: 'cada transacció **donada**',
    cols: ['Quins actius s\'hi fan servir', 'Què costa', 'Quin risc té', 'Com hi afegim valor', 'Cost i risc contra benefici'],
    q: ['I la pregunta que les lliga, que és el producte: **quin intangible que la casa ja produeix i regala es pot convertir en una forma negociable?**'] }
];

/* ══ 4 · UTILITATS DE LECTURA DEL MAPA ════════════════════════════════════
   La forma canònica és la de `mapFlowsOf()` i la de `CELLER`. **Hi ha un sol
   expander a tot el sistema**: el dia que n'hi va haver quatre, les salut dels
   mapes anaven de 13 a 100. Aquest el repeteix a propòsit i la guarda el
   compara amb el de l'app. */
function fluxos(m) {
  return (m.pairs || []).flatMap(p => [
    { de: p[0], a: p[1], mena: p[2], q: p[3], clau: p[0] + '→' + p[1] },
    { de: p[1], a: p[0], mena: p[4], q: p[5], clau: p[1] + '→' + p[0] }
  ]).filter(f => f.mena && f.q);
}
function tocats(m) { const s = new Set(); fluxos(m).forEach(f => { s.add(f.de); s.add(f.a); }); return s; }
function textos(m) {
  return [m.abast || '', ...fluxos(m).map(f => f.q),
    ...(m.processos || []).map(p => (p.nom || '') + ' ' + (p.d || '')),
    ...(m.troballes || []).map(t => (t.t || '') + ' ' + (t.d || ''))].filter(Boolean);
}
/* El veredicte sencer. És el que crida la consola, la guarda i la prova, i per
   això torna sempre la mateixa forma: una llista i un booleà. */
function revisa(m) {
  const r = REGLES.map(g => Object.assign({ id: g.id, n: g.n, t: g.t, dur: g.dur, de: g.de }, g.test(m || {})));
  return { regles: r, passa: r.filter(x => x.dur).every(x => x.ok),
    dures: r.filter(x => x.dur && !x.ok).length, toves: r.filter(x => !x.dur && !x.ok).length };
}

/* ══ 5 · EL QUE SE LI DONA A UNA IA ═══════════════════════════════════════
   Es construeix **de les mateixes regles** que comproven la resposta. Si el
   prompt i la comprovació es declaressin a part, el dia que una canviï l'altra
   es quedaria i tindríem un model que compleix una llista que ja no és la
   llista. */
function systemPrompt() {
  return [
    'Ets qui acompanya una sessió de mapa de valor amb el mètode de Verna Allee',
    '(Value Network Analysis). Proposes un esborrany perquè una sala el validi:',
    'no decideixes res. Escrius en la llengua de qui t\'ho demana.',
    '',
    'UN MAPA DE VALOR ÉS UN GRAF DE ROLS QUE S\'INTERCANVIEN ENTREGABLES.',
    'Tres elements i no més:',
    '· Rol — el que algú FA. No un càrrec, no una persona, no un departament.',
    '· Transacció — va d\'un rol a un altre i té direcció.',
    '· Entregable — la cosa que viatja, dita amb NOM i no amb verb, i el criteri',
    '  és que es pugui comprovar si ha arribat.',
    '',
    'TANGIBLE O INTANGIBLE ES DECIDEIX PEL CONTRACTE, NO PER LA MATÈRIA.',
    'Tangible és el que avui algú pot reclamar: comanda, servei, factura, informe',
    'previst al contracte. Intangible és el que s\'espera i no s\'exigeix: un avís,',
    'un favor, coneixement de procés, accés, reputació, confiança, un consell.',
    'El mateix informe és tangible si el contracte el preveu i intangible si es',
    'dona de franc per mantenir la relació.',
    '',
    'LES REGLES QUE LA TEVA PROPOSTA HA DE COMPLIR:',
    ...REGLES.map(r => `${r.n}. ${r.t}.`),
    '',
    'I TRES COSES QUE NO SÓN NEGOCIABLES:',
    '· Si un rol necessari no existeix a la casa, AIXÒ ÉS LA TROBALLA: digues',
    '  «aquest node avui no és de ningú». No el dibuixis com si hi fos.',
    '· Si el que et demanen no cap en dotze rols, no ampliïs el mapa: proposa',
    '  partir-lo per nivells i digues quin nivell estàs dibuixant.',
    '· Cada rol i cada transacció s\'han de poder esborrar sense que la resta es',
    '  trenqui. És un esborrany per validar.'
  ].join('\n');
}

/* Fins aquí, la declaració: no toca cap fitxer. El skill diu de fer
   `require('./SOS/tools/build-vna-suport.js').revisa(mapa)`, i una lectura que
   reescrivís quatre fitxers de passada seria una sorpresa. A sota hi comencen
   els destins, que només corren quan s'executa el fitxer. */
module.exports = { PASSES, REGLES, ANALISIS, fluxos, tocats, textos, revisa, systemPrompt };
if (require.main !== module) return;

/* ══ 6 · ELS DESTINS ══════════════════════════════════════════════════════ */
const SKILL_DIR = join(ARREL, '.claude', 'skills', 'mapa-de-valor');
const KB = join(SOS, 'knowledge', 'vna');

/* El bloc del procés per al skill i per a la consola: el mateix text als dos
   llocs, perquè qui llegeixi la pantalla i qui llegeixi el skill no facin dues
   sessions diferents. */
function blocPasses(md) {
  return PASSES.map(p => md
    ? `### ${p.n} · ${p.t}\n\n**Què hi passa.** ${p.fa}\n\n**Què en queda escrit.** \`${p.surt}\`\n\n> ${p.perque}\n`
    : `<li class="pa" data-pas="${p.id}"><span class="pa-n">${p.n}</span>`
      + `<div><b>${esc(p.t)}</b><p>${esc(p.fa)}</p>`
      + `<p class="pa-p">${esc(p.perque)}</p>`
      + `<code>${esc(p.surt)}</code></div></li>`
  ).join(md ? '\n' : '\n');
}
function blocRegles(md) {
  return REGLES.map(r => md
    ? `| ${r.n} | ${r.t} | ${r.dur ? '**dura**' : 'tova'} | ${r.de} |`
    : `<li class="rg" data-regla="${r.id}"><span class="rg-n">${r.n}</span>`
      + `<b>${esc(r.t)}</b><span class="rg-k ${r.dur ? 'dur' : 'tou'}">${r.dur ? 'dura' : 'tova'}</span>`
      + `<span class="rg-d"></span></li>`
  ).join('\n');
}
function blocAnalisis(md) {
  return ANALISIS.map(a => md
    ? `### ${a.t}\n\nSobre ${a.sobre}.\n\n`
      + (a.cols ? a.cols.map(c => `- ${c}`).join('\n') + '\n\n' : '')
      + a.q.map(q => `- ${q}`).join('\n') + '\n'
    : `<section class="an"><h3>${esc(a.t)}</h3><p class="an-s">Sobre ${a.sobre.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}.</p>`
      + (a.cols ? '<ul class="an-c">' + a.cols.map(c => `<li>${esc(c)}</li>`).join('') + '</ul>' : '')
      + '<ul class="an-q">' + a.q.map(q => `<li>${q.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</li>`).join('') + '</ul></section>'
  ).join('\n');
}
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ══ 7 · ESCRIURE ═════════════════════════════════════════════════════════ */
let fails = 0, escrits = 0, vells = [];
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };

function posa(fitxer, marca, cos, com) {
  const f = join(ARREL, fitxer);
  if (!existsSync(f)) { bad(`no existeix ${fitxer}`); return; }
  const src = readFileSync(f, 'utf8');
  const o = com === 'js' ? `/*${marca}*/` : `<!--${marca}-->`;
  const t = com === 'js' ? `/*/${marca}*/` : `<!--/${marca}-->`;
  const a = src.indexOf(o), b = src.indexOf(t);
  if (a < 0 || b <= a) { bad(`falten les marques ${o} a ${fitxer}`); return; }
  const out = src.slice(0, a + o.length) + '\n' + cos + '\n' + src.slice(b);
  if (out === src) return;
  if (CHECK) vells.push(`${fitxer} → ${marca}`);
  else { writeFileSync(f, out); escrits++; }
}

console.log('\nEl mòdul de suport al mapa de valor');

/* ── La consola ──────────────────────────────────────────────────────────── */
posa('SOS/vna-suport.html', 'VS-PASSES', blocPasses(false), 'html');
posa('SOS/vna-suport.html', 'VS-REGLES', blocRegles(false), 'html');
posa('SOS/vna-suport.html', 'VS-ANALISIS', blocAnalisis(false), 'html');
/* I el motor: les regles han de córrer **a la pàgina**, no descriure's. El
   mateix codi que corre aquí, literalment, perquè la consola i la guarda no
   puguin dir coses diferents del mateix mapa. */
posa('SOS/vna-suport.html', 'VS-MOTOR', [
  '/* GENERAT per SOS/tools/build-vna-suport.js · no s\'edita a mà */',
  'const REGLES=[', REGLES.map(r =>
    `{id:${JSON.stringify(r.id)},n:${r.n},dur:${r.dur},de:${JSON.stringify(r.de)},t:${JSON.stringify(r.t)},test:${r.test.toString()}}`).join(',\n'),
  '];',
  'const fluxos=' + fluxos.toString() + ';',
  'const tocats=' + tocats.toString() + ';',
  'const textos=' + textos.toString() + ';',
  'const revisa=' + revisa.toString() + ';',
  'const SYSTEM_PROMPT=' + JSON.stringify(systemPrompt()) + ';'
].join('\n'), 'js');

/* ── El skill ────────────────────────────────────────────────────────────── */
if (!existsSync(SKILL_DIR)) mkdirSync(SKILL_DIR, { recursive: true });
posa('.claude/skills/mapa-de-valor/SKILL.md', 'VS-PASSES', blocPasses(true), 'html');
posa('.claude/skills/mapa-de-valor/SKILL.md', 'VS-REGLES',
  '| | La regla | | Ve de |\n|---|---|---|---|\n' + blocRegles(true), 'html');
posa('.claude/skills/mapa-de-valor/SKILL.md', 'VS-ANALISIS', blocAnalisis(true), 'html');
posa('.claude/skills/mapa-de-valor/SKILL.md', 'VS-PROMPT',
  '```\n' + systemPrompt() + '\n```', 'html');

/* ── L'app: el `system` de `suggest_map` ─────────────────────────────────
   És el forat que el backlog tenia obert des del 03/10/2026: «se li demana a
   un model que faci un VNA sense dir-li què és un VNA». El prompt que hi havia
   demanava «entre 5 i 8 rols i entre 6 i 12 intercanvis» i prou. */
{
  const f = join(SOS, 'index.html');
  const src = readFileSync(f, 'utf8');
  const marca = /(\n\s*system:')((?:[^'\\]|\\.)*)(',\n\s*tool:\{name:'proposar_mapa_valor')/;
  const m = src.match(marca);
  if (!m) bad('no es troba el `system` de l\'intent `suggest_map` a SOS/index.html');
  else {
    const cos = systemPrompt().replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
    const out = src.replace(marca, (_, a, __, c) => a + cos + c);
    if (out !== src) {
      if (CHECK) vells.push('SOS/index.html → suggest_map.system');
      else { writeFileSync(f, out); escrits++; }
    }
    ok('l\'intent `suggest_map` porta el mètode i no només la forma');
  }
}

/* ── La base de coneixement ──────────────────────────────────────────────
   No es genera: **creix**. El que sí que es comprova és que existeixi i que
   cada cas digui el que va ensenyar; un cas que només guarda el mapa és un
   fitxer, no coneixement. */
{
  if (!existsSync(KB)) bad('no existeix SOS/knowledge/vna/: el mòdul no té on aprendre');
  else {
    const casos = existsSync(join(KB, 'casos'))
      ? readdirSync(join(KB, 'casos')).filter(x => x.endsWith('.md')) : [];
    const muts = casos.filter(c => !/## Què ha ensenyat/.test(readFileSync(join(KB, 'casos', c), 'utf8')));
    if (muts.length) bad(`${muts.length} cas(os) sense «Què ha ensenyat»: ${muts.join(', ')} — un cas que només guarda el mapa és un fitxer, no coneixement`);
    else ok(`la base de coneixement: ${casos.length} cas(os), tots amb el que van ensenyar`);
  }
}

ok(`${PASSES.length} passes, ${REGLES.length} regles (${REGLES.filter(r => r.dur).length} dures) i ${ANALISIS.length} anàlisis, declarades un sol cop`);

if (CHECK) {
  if (vells.length) bad('desviats: ' + vells.join(', '));
  console.log(fails ? '\n❌ Arregla-ho amb:  node SOS/tools/build-vna-suport.js\n' : '\n✅ El mòdul de suport al mapa de valor, al dia.\n');
  process.exit(fails ? 1 : 0);
}
if (fails) { console.log('\n❌ No s\'ha escrit res.\n'); process.exit(1); }
console.log(`\n✅ El mòdul de suport · ${escrits} bloc(s) escrits\n`);
