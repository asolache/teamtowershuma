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
            : !i ? 'Cap intangible: això és un diagrama de processos, no un mapa de valor'
            : `Només ${pct} % d'intangibles: per sota d'un terç (llindar de la casa) el mapa s'acosta a un diagrama de processos` }; } },

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

/* ══ 5b · EL PONT AMB L'APP ═══════════════════════════════════════════════
   L'app guarda el mapa per id (`node.vna`: rols {id,name} i intercanvis
   {from,to,kind,label}) perquè hi penja la vida: qui porta cada rol, els fets,
   els avisos. L'editor, els cervells dels clients i les xarxes germanes el
   guarden en la forma canònica (`pairs` per nom). Aquests dos traductors fan
   que les deu regles siguin **les mateixes** a tot arreu: l'app no té fórmula
   de salut pròpia, tradueix i crida `revisa()`.

   `deApp` aparella cada A→B amb un B→A; el que no troba parella queda amb el
   retorn buit, i és la regla 4 qui ho diu. Un intercanvi sense nom en porta un
   de provisional perquè `fluxos()` no el descarti: existeix, i compta. */
function deApp(vna, op) {
  const o = op || {}, rols = (vna && vna.roles) || [], ex = (vna && vna.exchanges) || [];
  const mena = o.mena || (k => k === 'intangible' ? 'intangible' : 'tangible');
  const nom = {}; rols.forEach(r => { nom[r.id] = String(r.name || r.id); });
  const grups = {}, ordre = [];
  ex.forEach(e => {
    if (!nom[e.from] || !nom[e.to] || e.from === e.to) return;
    const k = [e.from, e.to].sort().join('|');
    if (!grups[k]) { grups[k] = { a: e.from, b: e.to, ab: [], ba: [] }; ordre.push(k); }
    const g = grups[k], m = mena(e.kind), q = String(e.label || '').trim() || '(sense nom)';
    (e.from === g.a ? g.ab : g.ba).push([m, q]);
  });
  const pairs = [];
  ordre.forEach(k => {
    const g = grups[k], n = Math.max(g.ab.length, g.ba.length);
    for (let i = 0; i < n; i++) {
      const x = g.ab[i] || ['', ''], y = g.ba[i] || ['', ''];
      pairs.push(g.ab[i] ? [nom[g.a], nom[g.b], x[0], x[1], y[0], y[1]] : [nom[g.b], nom[g.a], y[0], y[1], '', '']);
    }
  });
  return { abast: String(o.abast || ''), roles: rols.map(r => nom[r.id]), pairs, processos: o.processos || [], seq: o.seq || {}, troballes: o.troballes || [] };
}
/* I a l'inrevés: un mapa canònic (de l'editor, d'un cervell, d'una xarxa
   germana) entra a l'app com a rols i intercanvis nous. `id` el posa qui
   crida, perquè cada lloc té el seu generador. */
function aApp(m, id) {
  const r = fusiona({}, m, id).vna;
  return { roles: r.roles, exchanges: r.exchanges };
}
/* Obrir un mapa de fora dins d'un mapa de l'app que ja té coses: el de
   l'editor («Copia el JSON»), el `cerebro/mapa-real.json` d'un client o el
   d'una xarxa germana. Suma i no esborra: un rol que ja hi és (pel nom, sense
   accents ni majúscules) no es duplica, i un lliurament tampoc. El que l'app
   encara no dibuixa (processos, seqüència, troballes, ideal, nivells, externs,
   qui ocupa cada rol) es guarda a `resta` tal com ve, perquè «Copia el mapa»
   el torni sencer. No muta el que rep. */
function fusiona(vna, m, id) {
  if (!m || typeof m !== 'object' || (!Array.isArray(m.pairs) && !Array.isArray(m.roles)))
    throw new Error('Això no és un mapa de valor: hi falten els rols i els parells');
  const nou = id || (() => Math.random().toString(36).slice(2, 10));
  const nn = x => String(x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
  const roles = ((vna && vna.roles) || []).map(r => Object.assign({}, r)), exchanges = ((vna && vna.exchanges) || []).map(e => Object.assign({}, e));
  const perNom = {}; roles.forEach(r => { perNom[nn(r.name)] = r.id; });
  let nr = 0, nf = 0;
  const rol = n => { const k = nn(n); if (!perNom[k]) { perNom[k] = nou(); roles.push({ id: perNom[k], name: String(n).trim() }); nr++; } return perNom[k]; };
  (m.roles || []).forEach(n => { if (typeof n === 'string' && n.trim()) rol(n); });
  const hi = new Set(exchanges.map(e => e.from + '|' + e.to + '|' + nn(e.label)));
  fluxos(m).forEach(f => {
    const de = rol(f.de), a = rol(f.a), k = de + '|' + a + '|' + nn(f.q);
    if (hi.has(k)) return; hi.add(k);
    exchanges.push({ id: nou(), from: de, to: a, kind: f.mena, label: f.q }); nf++;
  });
  /* Les organitzacions: una que ja hi és (pel nom) suma els rols nous i
     conserva el que ja tenia; el que porta el mapa omple el que hi faltava. */
  const orgs = ((vna && vna.orgs) || []).map(o => Object.assign({}, o, { roles: (o.roles || []).slice() }));
  const perOrg = {}; orgs.forEach(o => { perOrg[nn(o.name)] = o; });
  let no = 0;
  orgsDe(m).forEach(x => {
    let o = perOrg[nn(x.nom)];
    if (!o) { o = perOrg[nn(x.nom)] = { id: nou(), name: String(x.nom).trim(), roles: [] }; orgs.push(o); no++; }
    x.rols.forEach(r => { const id = rol(r); if (!o.roles.includes(id)) o.roles.push(id); });
    ['posicionament', 'oferta', 'web', 'cervell', 'mapa'].forEach(k => { if (x[k] !== undefined && (o[k] === undefined || o[k] === '')) o[k] = x[k]; });
  });
  const resta = {}; Object.keys(m).forEach(k => { if (!['abast', 'roles', 'pairs', 'flows', 'orgs'].includes(k)) resta[k] = m[k]; });
  return { vna: Object.assign({}, vna, { roles, exchanges, orgs }), abast: String(m.abast || ''), resta, rols: nr, fluxos: nf, orgs: no };
}
/* I el camí de tornada: el mapa de l'app en la forma de l'editor, amb el que
   `fusiona` havia guardat a `resta`. És el que s'enganxa a l'editor o es desa
   a `cerebro/mapa-real.json`. */
function exporta(vna, op) {
  const o = op || {}, r = o.resta || {}, nom = {};
  ((vna && vna.roles) || []).forEach(x => { nom[x.id] = String(x.name || x.id); });
  const out = Object.assign({}, r, deApp(vna, { abast: o.abast, mena: o.mena, processos: r.processos, seq: r.seq, troballes: r.troballes }));
  const orgs = ((vna && vna.orgs) || []).map(x => {
    const y = { nom: x.name, rols: (x.roles || []).filter(id => nom[id]).map(id => nom[id]) };
    ['posicionament', 'oferta', 'web', 'cervell', 'mapa'].forEach(k => { if (x[k] !== undefined && x[k] !== '') y[k] = x[k]; });
    return y; });
  if (orgs.length) out.orgs = orgs;
  return out;
}
/* ══ 5c · QUI OCUPA ELS ROLS: ORGANITZACIONS, I L'ESCALA DE CADA UNA ══════
   Un rol no és una organització. Un celler pot fer el vi, acollir i dinamitzar
   la visita: una organització, tres rols. I un rol el poden ocupar diverses
   organitzacions, i llavors el que les distingeix és el seu posicionament.
   La forma canònica ho diu amb `orgs`:
     [{ nom, rols: [noms de rol], posicionament?, oferta?, web?, cervell?, mapa? }]
   `mapa` és el mapa propi de l'organització (forma canònica); si no en té,
   es fa servir el `dins` d'algun dels seus rols. Un mapa antic amb `ocupa`
   ({Rol: {nodo}}) en surt agrupant pel node. */
function orgsDe(m) {
  if (Array.isArray(m && m.orgs)) return m.orgs.filter(o => o && o.nom).map(o => Object.assign({}, o, { rols: (o.rols || []).slice() }));
  const per = {};
  Object.entries((m && m.ocupa) || {}).forEach(([rol, v]) => {
    const k = v && typeof v === 'object' ? v.nodo : null; if (!k) return;
    (per[k] = per[k] || { nom: k, rols: [] }).rols.push(rol);
  });
  return Object.values(per);
}
/* El que es llegeix de les organitzacions sobre el mapa, en tres llistes:
   qui fa diversos rols (si plega, se'n van tots), els rols que no ocupa ningú
   (la troballa de la passa 2) i els rols compartits, on cada organització
   necessita un posicionament propi per no ser intercanviable. */
function lecturaOrgs(m) {
  const os = orgsDe(m), rols = (m.roles || []).slice(), qui = {};
  os.forEach(o => o.rols.forEach(r => { (qui[r] = qui[r] || []).push(o.nom); }));
  return {
    multi: os.filter(o => o.rols.length >= 2).map(o => ({ nom: o.nom, rols: o.rols.slice() })),
    senseOrg: rols.filter(r => !qui[r]),
    compartits: Object.keys(qui).filter(r => qui[r].length >= 2).map(r => ({ rol: r, orgs: qui[r],
      senseLloc: os.filter(o => qui[r].includes(o.nom) && !String(o.posicionament || '').trim()).map(o => o.nom) }))
  };
}
/* El mapa propi d'una organització: el seu, o el de dins dels seus rols. És
   el que fa la seva pàgina i la seva web (web-del-mapa.js --org). */
function mapaOrg(m, nom) {
  const o = orgsDe(m).find(x => x.nom === nom); if (!o) return null;
  const dins = (m && m.dins) || {}, base = o.mapa || o.rols.map(r => dins[r]).find(Boolean) || null;
  if (!base) return null;
  return Object.assign({}, base, { abast: base.abast || o.posicionament || '' });
}
/* El seu lloc a la xarxa: el rol, el que lliura fora dels seus rols, el que
   en rep i a qui. La pàgina del partner i la seva web propia diuen el mateix,
   perquè surt d'aquí. */
function llocOrg(m, nom) {
  const o = orgsDe(m).find(x => x.nom === nom); if (!o) return null;
  const f = fluxos(m), meu = r => o.rols.includes(r), un = l => [...new Set(l)];
  const surt = f.filter(x => meu(x.de) && !meu(x.a)), entra = f.filter(x => meu(x.a) && !meu(x.de));
  return { rol: o.rols.join(', '), aporta: un(surt.map(x => x.q)), recibe: un(entra.map(x => x.q)), para: un(surt.map(x => x.a)) };
}
/* L'escala d'un partner, amb les portes de la MATRIU: cada esglaó es guanya
   amb el que es pot comprovar al mapa, i el que falta es diu amb paraules. */
const ESCALA = [
  { id: 'fitxa', t: 'Fitxa', porta: (m, o) => [
    !o.rols.length && 'dir quin rol ocupa al mapa',
    !String(o.posicionament || '').trim() && 'el seu posicionament, en una frase pròpia'] },
  { id: 'pagina', t: 'Pàgina', porta: (m, o) => [
    !String(o.oferta || '').trim() && 'la seva oferta, dita per ella',
    !o.rols.some(r => fluxos(m).some(f => f.de === r)) && 'que algun dels seus rols lliuri alguna cosa al mapa'] },
  { id: 'web', t: 'Web pròpia', porta: (m, o) => { const p = mapaOrg(m, o.nom);
    return [!p && 'el seu mapa propi (a dins d\'un dels seus rols)', p && !revisa(p).passa && 'que el seu mapa passi les regles dures']; } },
  { id: 'node', t: 'Node', porta: (m, o) => [
    !String(o.web || '').trim() && 'l\'adreça de la seva web',
    !String(o.cervell || '').trim() && 'el seu cervell (on viu el seu codex)'] }
];
function escalaOrg(m, nom) {
  const o = orgsDe(m).find(x => x.nom === nom); if (!o) return null;
  let fet = null;
  for (const e of ESCALA) {
    const falta = e.porta(m, o).filter(Boolean);
    if (falta.length) return { esglao: fet, seguent: e.id, t: e.t, falta };
    fet = e.id;
  }
  return { esglao: fet, seguent: null, t: null, falta: [] };
}

/* Un sol número per comparar mapes en una taula: surt de les deu regles, i
   una dura pesa el doble que una tova. No n'hi ha cap altre al sistema. Sense
   cap lliurament és 0: les regles que diuen «cap X» passen soles en un buit. */
function salut(m, op) {
  /* `treu`: les regles que qui crida no pot complir perquè no en guarda les
     dades (l'app encara no seqüencia processos). No compten, i ho diu `fora`. */
  const treu = (op && op.treu) || [], r = revisa(m), fora = r.regles.filter(x => treu.includes(x.id));
  r.regles = r.regles.filter(x => !treu.includes(x.id)); r.fora = fora;
  const d = r.regles.filter(x => x.dur), t = r.regles.filter(x => !x.dur);
  const ok = l => l.filter(x => x.ok).length;
  return Object.assign(r, { punts: fluxos(m || {}).length ? Math.round(100 * (2 * ok(d) + ok(t)) / (2 * d.length + t.length)) : 0 });
}

/* Fins aquí, la declaració: no toca cap fitxer. El skill diu de fer
   `require('./SOS/tools/build-vna-suport.js').revisa(mapa)`, i una lectura que
   reescrivís quatre fitxers de passada seria una sorpresa. A sota hi comencen
   els destins, que només corren quan s'executa el fitxer. */
module.exports = { PASSES, REGLES, ANALISIS, fluxos, tocats, textos, revisa, systemPrompt, deApp, aApp, salut, fusiona, exporta, orgsDe, lecturaOrgs, mapaOrg, llocOrg, ESCALA, escalaOrg };
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
const MOTOR = [
  '/* GENERAT per SOS/tools/build-vna-suport.js · no s\'edita a mà */',
  'const REGLES=[', REGLES.map(r =>
    `{id:${JSON.stringify(r.id)},n:${r.n},dur:${r.dur},de:${JSON.stringify(r.de)},t:${JSON.stringify(r.t)},test:${r.test.toString()}}`).join(',\n'),
  '];',
  'const fluxos=' + fluxos.toString() + ';',
  'const tocats=' + tocats.toString() + ';',
  'const textos=' + textos.toString() + ';',
  'const revisa=' + revisa.toString() + ';',
  'const SYSTEM_PROMPT=' + JSON.stringify(systemPrompt()) + ';'
].join('\n');
posa('SOS/vna-suport.html', 'VS-MOTOR', MOTOR, 'js');

/* ── El nucli compartit: SOS/lib/mapa-valor.js ────────────────────────────
   El mateix motor, sencer, en un fitxer que carrega qualsevol pàgina (l'app,
   abans del seu mòdul) i qualsevol eina de Node (`require`). Hi van també el
   pont amb l'app i la nota única. Tot surt d'aquesta declaració: cap lloc té
   la seva pròpia llista de regles ni la seva pròpia fórmula de salut. */
{
  const f = join(SOS, 'lib', 'mapa-valor.js');
  const cos = ['/* El nucli del mapa de valor · GENERAT per SOS/tools/build-vna-suport.js',
    '   No s\'edita a mà: les regles, el text per a la IA i el pont amb l\'app es',
    '   declaren allà un sol cop. Navegador: window.MapaValor. Node: require(). */',
    '(function (g) {', '\'use strict\';', MOTOR,
    'const deApp=' + deApp.toString() + ';', 'const aApp=' + aApp.toString() + ';', 'const salut=' + salut.toString() + ';',
    'const fusiona=' + fusiona.toString() + ';', 'const exporta=' + exporta.toString() + ';',
    'const orgsDe=' + orgsDe.toString() + ';', 'const lecturaOrgs=' + lecturaOrgs.toString() + ';', 'const mapaOrg=' + mapaOrg.toString() + ';', 'const llocOrg=' + llocOrg.toString() + ';',
    'const ESCALA=[' + ESCALA.map(e => `{id:${JSON.stringify(e.id)},t:${JSON.stringify(e.t)},porta:${e.porta.toString()}}`).join(',\n') + '];',
    'const escalaOrg=' + escalaOrg.toString() + ';',
    'const MapaValor={REGLES,fluxos,tocats,textos,revisa,salut,deApp,aApp,fusiona,exporta,orgsDe,lecturaOrgs,mapaOrg,llocOrg,ESCALA,escalaOrg,SYSTEM_PROMPT};',
    'if (typeof module !== \'undefined\' && module.exports) module.exports = MapaValor; else g.MapaValor = MapaValor;',
    '})(typeof globalThis !== \'undefined\' ? globalThis : this);', ''].join('\n');
  const ara = existsSync(f) ? readFileSync(f, 'utf8') : '';
  if (ara !== cos) { if (CHECK) vells.push('SOS/lib/mapa-valor.js'); else { writeFileSync(f, cos); escrits++; } }
  ok('el nucli SOS/lib/mapa-valor.js surt de la mateixa declaració');
  /* I l'app no en té cap altra: la fórmula de pesos que hi havia (reciprocitat
     per 0,4 o 0,45, densitat per 0,25) donava tres notes al mateix mapa. */
  const APP = readFileSync(join(SOS, 'index.html'), 'utf8');
  if (/recPct\s*\*\s*0\.\d/.test(APP)) bad('SOS/index.html torna a tenir una fórmula de salut pròpia: la nota surt de MapaValor.salut()');
  else ok('l\'app no té cap fórmula de salut pròpia');
  if (!APP.includes('<script src="lib/mapa-valor.js"></script>')) bad('SOS/index.html no carrega lib/mapa-valor.js');
}

/* ── Qui fa cada lliurament: la màquina o una persona ─────────────────────
   La regla de la casa (`SOS/knowledge/negoci/mapa-kanban-ia.md`) viu a l'app:
   la taxonomia tancada `ENTREGABLES` i `fluxAutomatitzable`, que mira
   l'intangible abans que res. El repositori del client en treu
   `cerebro/tasques-ia.md`, i ha de dir el mateix que l'app: per això el codi
   es copia tal com hi és, i la guarda falla si algú el toca només en un lloc. */
{
  const APP = readFileSync(join(SOS, 'index.html'), 'utf8');
  const tros = (inici, fi) => {
    const a = APP.indexOf(inici);
    if (a < 0) { bad('no es troba `' + inici + '` a SOS/index.html'); return ''; }
    const b = APP.indexOf(fi, a);
    if (b < 0) { bad('no es troba el final de `' + inici + '` a SOS/index.html'); return ''; }
    return APP.slice(a, b + fi.length);
  };
  const kind = tros('const normKind=', 'const isIntangible=k=>normKind(k)===\'intangible\';');
  const regla = tros('const ENTREGABLES=[', '\n  return{pot:true,motiu:\'\',tipus:t};\n}');
  if (kind && regla) {
    posa('SOS/vna-suport.html', 'VS-TASQUES', [
      '/* GENERAT per SOS/tools/build-vna-suport.js des de SOS/index.html · no s\'edita a mà.',
      '   La regla de qui fa cada lliurament, tal com és a l\'app: un intangible no',
      '   el fa mai la màquina, i un tangible només si el seu tipus en pot sortir. */',
      kind, regla].join('\n'), 'js');
    ok('la regla de qui fa cada lliurament és la de l\'app, copiada tal com hi és');
  }
}

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
