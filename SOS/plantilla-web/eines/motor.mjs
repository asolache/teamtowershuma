// Generat des de SOS/vna-suport.html (repositori asolache/teamtowershuma). No s'edita a mà: es refà amb node eines/genera.mjs.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const EXEMPLE = {
  abast: 'El que passa des que algú es planteja venir al celler fins que marxa i ho explica',
  rols: ['Qui fa el vi', 'Qui rep i explica', 'El visitant', 'El poble', 'La vinya i el veïnat',
    'El distribuïdor', 'L\'operador de luxe'],
  parells: [
    'Qui fa el vi | Qui rep i explica | t | el vi, la verema i el celler obert | i | saber què pregunta i què paga qui ve',
    'Qui rep i explica | El visitant | t | la visita, el tast i el relat de la casa | i | la confiança de qui ha estat aquí',
    'El visitant | El poble | t | el que es gasta al bar i a la botiga | i | parlar-ne quan torna a casa',
    'El poble | Qui rep i explica | i | el lloc que fa que aquell vi sigui d\'allà | t | que el camí i la plaça estiguin cuidats',
    'La vinya i el veïnat | Qui fa el vi | t | la vinya treballada i els camins oberts | i | saber què aguanta cada vessant',
    'El distribuïdor | Qui fa el vi | t | la comanda i el pagament | i | què es mou i què no al seu canal',
    'L\'operador de luxe | Qui rep i explica | t | el grup i el pagament per persona | i | què demana un client que paga més'
  ],
  processos: ['visita | La visita | Del primer contacte fins que marxa',
    'poble | El dia al poble | El que passa fora del celler',
    'canal | La venda pel canal | De la comanda al cobrament'],
  seq: ['Qui fa el vi→Qui rep i explica | visita | 1',
    'Qui rep i explica→El visitant | visita | 2',
    'El visitant→El poble | poble | 1',
    'El poble→Qui rep i explica | sempre',
    'Qui fa el vi→La vinya i el veïnat | sempre',
    'La vinya i el veïnat→Qui fa el vi | poble | 2',
    'El distribuïdor→Qui fa el vi | canal | 1',
    'Qui fa el vi→El distribuïdor | canal | 2',
    'L\'operador de luxe→Qui rep i explica | visita | 3',
    'Qui rep i explica→L\'operador de luxe | visita | 4',
    'El visitant→Qui rep i explica | sempre',
    'Qui rep i explica→Qui fa el vi | sempre'],
  troballes: [
    'Hi ha un node que no és de ningú | Qui rep i explica no està assignat a ningú, i si plega s\'atura la meitat del que es cobra',
    'El poble dona i no rep | El que fa que aquell vi sigui d\'allà no el paga ningú, i es pot convertir en una forma negociable'
  ]
};
/*VS-MOTOR*/
/* GENERAT per SOS/tools/build-vna-suport.js · no s'edita a mà */
const REGLES=[
{id:"abast",n:1,dur:true,de:"mètode",t:"Hi ha un abast escrit",test:m => ({ ok: !!(m.abast && m.abast.trim().length >= 12),
      diu: m.abast ? 'L\'abast hi és' : 'Falta dir de quina activitat parlem i on s\'acaba' })},
{id:"rols",n:2,dur:true,de:"mètode",t:"Entre 6 i 12 rols",test:m => { const n = (m.roles || []).length;
      return { ok: n >= 6 && n <= 12,
        diu: n < 6 ? `Només ${n} rols: amb menys de sis, el mapa no ensenya cap patró`
          : n > 12 ? `${n} rols: per sobre de dotze no es llegeix a una sala. Parteix-lo per nivells i digues quin dibuixes`
            : `${n} rols` }; }},
{id:"menes",n:3,dur:true,de:"mètode",t:"Com a mínim un terç de transaccions intangibles",test:m => { const f = fluxos(m), i = f.filter(x => x.mena === 'intangible').length;
      const pct = f.length ? Math.round(i * 100 / f.length) : 0;
      return { ok: f.length > 0 && pct >= 33,
        diu: !f.length ? 'No hi ha cap transacció'
          : pct >= 33 ? `${i} de ${f.length} intangibles (${pct} %)`
            : !i ? 'Cap intangible: això és un diagrama de processos, no un mapa de valor'
            : `Només ${pct} % d'intangibles: per sota d'un terç (llindar de la casa) el mapa s'acosta a un diagrama de processos` }; }},
{id:"reciprocitat",n:4,dur:true,de:"mètode",t:"Tot vincle és recíproc",test:m => { const mal = (m.pairs || []).filter(p => !p[2] || !p[3] || !p[4] || !p[5]);
      return { ok: !mal.length,
        diu: mal.length ? `${mal.length} vincle(s) a mitges: ${mal.slice(0, 3).map(p => p[0] + ' ↔ ' + p[1]).join(', ')}. Si de debò va en un sol sentit, digues-ho com a troballa`
          : `${(m.pairs || []).length} vincles, tots amb anada i tornada` }; }},
{id:"solts",n:5,dur:true,de:"mètode",t:"Cap rol solt",test:m => { const t = tocats(m), s = (m.roles || []).filter(r => !t.has(r));
      return { ok: !s.length,
        diu: s.length ? `${s.length} rol(s) sense cap lliurament: ${s.join(', ')}. Un rol que no dona ni rep és una decoració`
          : 'Tots els rols donen i reben' }; }},
{id:"densitat",n:6,dur:false,de:"la casa",t:"Densitat ≥ 40 %",test:m => { const n = (m.roles || []).length, max = n * (n - 1) / 2;
      const d = max ? Math.round((m.pairs || []).length * 100 / max) : 0;
      return { ok: d >= 40, diu: `${d} % dels vincles possibles` + (d < 40 ? ' — per sota del 40 %, el mapa encara té regions que no s\'han preguntat' : '') }; }},
{id:"concentracio",n:7,dur:false,de:"la casa",t:"Cap rol concentra més del 40 %",test:m => { const f = fluxos(m), g = {};
      f.forEach(x => { g[x.de] = (g[x.de] || 0) + 1; g[x.a] = (g[x.a] || 0) + 1; });
      let qui = null, max = 0;
      Object.entries(g).forEach(([k, v]) => { if (v > max) { max = v; qui = k; } });
      const pct = f.length ? Math.round(max * 100 / (f.length * 2)) : 0;
      return { ok: pct <= 40,
        diu: qui ? `${qui}: ${pct} %` + (pct > 40 ? ' — una xarxa on tot passa pel nucli és fràgil encara que sigui recíproca' : '') : 'Sense transaccions' }; }},
{id:"xifres",n:8,dur:true,de:"la casa",t:"Cap xifra que no es pugui refer",test:m => { const mal = textos(m).filter(t => /\d+\s*(€|euros?|%)/i.test(t) || /\b\d{3,}\b/.test(t));
      return { ok: !mal.length,
        diu: mal.length ? `${mal.length} xifra(es) al text: «${mal[0].slice(0, 44)}». El mapa diu on mirar; els números els posa la casa amb els seus`
          : 'Cap xifra inventada' }; }},
{id:"noms",n:9,dur:true,de:"la casa",t:"Cap nom propi de persona ni d'empresa",test:m => { const mal = [...(m.roles || []), ...textos(m)]
      .filter(t => /\b(S\.?L\.?|S\.?A\.?|SCCL|S\.?C\.?C\.?L)\b/.test(t) || /\b[A-ZÀ-Ú][a-zà-ú]+ [A-ZÀ-Ú][a-zà-ú]+\b/.test(t));
      return { ok: !mal.length,
        diu: mal.length ? `Sembla que hi ha un nom propi: «${mal[0].slice(0, 44)}». Els rols es diuen pel que fan`
          : 'Cap nom propi' }; }},
{id:"processos",n:10,dur:false,de:"la casa",t:"Més d'un procés, i el que passa «sempre» marcat",test:m => { const p = (m.processos || []).length;
      const s = Object.values(m.seq || {}).filter(v => v === 'sempre');
      const mal = Object.entries(m.seq || {}).filter(([k, v]) => v === 'sempre'
        && (fluxos(m).find(f => f.clau === k) || {}).mena === 'tangible');
      return { ok: p >= 2 && !mal.length,
        diu: p < 2 ? 'Un sol procés: el senyal que s\'ha fet l\'exercici equivocat. Optimitzar múltiples vies no és trobar-ne una d\'òptima'
          : mal.length ? `${mal.length} tangible(s) marcat(s) «sempre»: un tangible sense pas és un tangible que ningú ha seqüenciat`
            : `${p} processos i ${s.length} lliurament(s) que passen tot el temps` }; }}
];
const fluxos=function fluxos(m) {
  return (m.pairs || []).flatMap(p => [
    { de: p[0], a: p[1], mena: p[2], q: p[3], clau: p[0] + '→' + p[1] },
    { de: p[1], a: p[0], mena: p[4], q: p[5], clau: p[1] + '→' + p[0] }
  ]).filter(f => f.mena && f.q);
};
const tocats=function tocats(m) { const s = new Set(); fluxos(m).forEach(f => { s.add(f.de); s.add(f.a); }); return s; };
const textos=function textos(m) {
  return [m.abast || '', ...fluxos(m).map(f => f.q),
    ...(m.processos || []).map(p => (p.nom || '') + ' ' + (p.d || '')),
    ...(m.troballes || []).map(t => (t.t || '') + ' ' + (t.d || ''))].filter(Boolean);
};
const revisa=function revisa(m) {
  const r = REGLES.map(g => Object.assign({ id: g.id, n: g.n, t: g.t, dur: g.dur, de: g.de }, g.test(m || {})));
  return { regles: r, passa: r.filter(x => x.dur).every(x => x.ok),
    dures: r.filter(x => x.dur && !x.ok).length, toves: r.filter(x => !x.dur && !x.ok).length };
};
const SYSTEM_PROMPT="Ets qui acompanya una sessió de mapa de valor amb el mètode de Verna Allee\n(Value Network Analysis). Proposes un esborrany perquè una sala el validi:\nno decideixes res. Escrius en la llengua de qui t'ho demana.\n\nUN MAPA DE VALOR ÉS UN GRAF DE ROLS QUE S'INTERCANVIEN ENTREGABLES.\nTres elements i no més:\n· Rol — el que algú FA. No un càrrec, no una persona, no un departament.\n· Transacció — va d'un rol a un altre i té direcció.\n· Entregable — la cosa que viatja, dita amb NOM i no amb verb, i el criteri\n  és que es pugui comprovar si ha arribat.\n\nTANGIBLE O INTANGIBLE ES DECIDEIX PEL CONTRACTE, NO PER LA MATÈRIA.\nTangible és el que avui algú pot reclamar: comanda, servei, factura, informe\nprevist al contracte. Intangible és el que s'espera i no s'exigeix: un avís,\nun favor, coneixement de procés, accés, reputació, confiança, un consell.\nEl mateix informe és tangible si el contracte el preveu i intangible si es\ndona de franc per mantenir la relació.\n\nLES REGLES QUE LA TEVA PROPOSTA HA DE COMPLIR:\n1. Hi ha un abast escrit.\n2. Entre 6 i 12 rols.\n3. Com a mínim un terç de transaccions intangibles.\n4. Tot vincle és recíproc.\n5. Cap rol solt.\n6. Densitat ≥ 40 %.\n7. Cap rol concentra més del 40 %.\n8. Cap xifra que no es pugui refer.\n9. Cap nom propi de persona ni d'empresa.\n10. Més d'un procés, i el que passa «sempre» marcat.\n\nI TRES COSES QUE NO SÓN NEGOCIABLES:\n· Si un rol necessari no existeix a la casa, AIXÒ ÉS LA TROBALLA: digues\n  «aquest node avui no és de ningú». No el dibuixis com si hi fos.\n· Si el que et demanen no cap en dotze rols, no ampliïs el mapa: proposa\n  partir-lo per nivells i digues quin nivell estàs dibuixant.\n· Cada rol i cada transacció s'han de poder esborrar sense que la resta es\n  trenqui. És un esborrany per validar.";
/*/VS-MOTOR*/
/*VS-DIAG*/
/* ── El motor de diagnòstic ────────────────────────────────────────────────
 * Escrit a mà (no el genera cap build) i provat a SOS/tests/test-vna-motor.mjs.
 * Funcions pures sobre la forma canònica del mapa i la seva extensió:
 *   { abast, roles, pairs, processos, seq, troballes,
 *     pos?, gomets?, dins?: {Rol: mapa & {portes?}}, ideal?: mapa & {alies?, treu?, dins?} }
 * Depèn només de revisa() i fluxos() de la pàgina (el bloc generat de les regles).
 * Cap DOM, cap data, cap atzar, no muta l'entrada. */
function creaDiagnosi(dep) {
  const { revisa, fluxos } = dep;

  /* ── 0 · Noms ───────────────────────────────────────────────────────────── */
  const normNom = s => String(s == null ? '' : s).toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[’`´]/g, "'").trim()
    .replace(/^(?:(?:els|les|uns|unes|una|un|el|la|los|las|lo)\s+|(?:l|d)'\s*)/, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();
  const clauN = k => { const [a, b] = String(k).split('→'); return normNom(a) + '→' + normNom(b); };
  const uniq = a => [...new Set(a)];
  const per = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o || {}, k);

  /* ── 1 · Mètriques d'un nivell ─────────────────────────────────────────── */
  function rolsDe(m) { // declarats + els que surten als parells sense declarar
    const f = fluxos(m), dec = (m.roles || []).slice();
    const no = uniq(f.flatMap(x => [x.de, x.a])).filter(r => r && !dec.includes(r));
    return { declarats: dec, noDeclarats: no, tots: dec.concat(no) };
  }

  function estructura(rols, f) { // graf no dirigit de vincles · punts d'articulació i intermediació
    const adj = {}; rols.forEach(r => { adj[r] = new Set(); });
    f.forEach(x => { if (x.de === x.a) return; (adj[x.de] = adj[x.de] || new Set()).add(x.a); (adj[x.a] = adj[x.a] || new Set()).add(x.de); });
    const nodes = Object.keys(adj).sort(per);
    // Hopcroft–Tarjan (1973), iteratiu no cal: ≤ 12 nodes per nivell
    let t = 0; const disc = {}, low = {}, art = new Set();
    const dfs = (u, pare) => {
      disc[u] = low[u] = ++t; let fills = 0;
      [...adj[u]].sort(per).forEach(v => {
        if (!disc[v]) { fills++; dfs(v, u); low[u] = Math.min(low[u], low[v]);
          if (pare !== null && low[v] >= disc[u]) art.add(u); }
        else if (v !== pare) low[u] = Math.min(low[u], disc[v]);
      });
      if (pare === null && fills > 1) art.add(u);
    };
    let components = 0;
    nodes.forEach(u => { if (!disc[u]) { components++; dfs(u, null); } });
    // Brandes (2001) sobre graf no dirigit, normalitzat 0..1
    const cb = {}; nodes.forEach(v => { cb[v] = 0; });
    nodes.forEach(s => {
      const S = [], P = {}, sg = {}, d = {}; nodes.forEach(w => { P[w] = []; sg[w] = 0; d[w] = -1; });
      sg[s] = 1; d[s] = 0; const Q = [s];
      while (Q.length) { const v = Q.shift(); S.push(v);
        [...adj[v]].sort(per).forEach(w => { if (d[w] < 0) { Q.push(w); d[w] = d[v] + 1; }
          if (d[w] === d[v] + 1) { sg[w] += sg[v]; P[w].push(v); } }); }
      const de = {}; nodes.forEach(w => { de[w] = 0; });
      while (S.length) { const w = S.pop(); P[w].forEach(v => { de[v] += (sg[v] / sg[w]) * (1 + de[w]); });
        if (w !== s) cb[w] += de[w]; }
    });
    const n = nodes.length, norm = n > 2 ? (n - 1) * (n - 2) : 1;
    nodes.forEach(v => { cb[v] = Math.round((cb[v] / norm) * 100) / 100; }); // /2 per no dirigit ·2 per normalitzar = /norm
    const fulles = nodes.filter(v => adj[v].size === 1);
    return { articulacions: [...art].sort(per), components, intermediacio: cb, fulles,
      veins: Object.fromEntries(nodes.map(v => [v, [...adj[v]].sort(per)])) };
  }

  function processos(m) {
    const f = fluxos(m), seq = m.seq || {};
    const perClau = {}; f.forEach(x => { perClau[x.clau] = x; });
    const P = {}, ordre = [];
    (m.processos || []).forEach(p => { if (!p.id || P[p.id]) return; P[p.id] = { id: p.id, nom: p.nom || p.id, declarat: true, items: [] }; ordre.push(p.id); });
    const orfenes = [], sempre = [], senseSeq = [];
    Object.keys(seq).forEach(k => {
      const v = seq[k], x = perClau[k];
      if (!x) { orfenes.push({ clau: k, motiu: 'flux' }); return; }
      if (v === 'sempre') { sempre.push(x); return; }
      const pid = Array.isArray(v) ? v[0] : '', pas = Array.isArray(v) ? Number(v[1]) || 1 : 1;
      if (!P[pid]) { P[pid] = { id: pid, nom: pid, declarat: false, items: [] }; ordre.push(pid);
        orfenes.push({ clau: k, motiu: 'proces', proces: pid }); }
      P[pid].items.push(Object.assign({ pas }, x));
    });
    f.forEach(x => { if (!hasOwn(seq, x.clau)) senseSeq.push(x); });
    const llista = ordre.map(id => {
      const p = P[id], pasos = uniq(p.items.map(i => i.pas)).sort((a, b) => a - b);
      const passos = pasos.map(s => ({ pas: s, fluxos: p.items.filter(i => i.pas === s).sort((a, b) => per(a.clau, b.clau)) }));
      const rols = uniq(p.items.flatMap(i => [i.de, i.a])).sort(per);
      const obligats = passos.map(st => st.fluxos.map(x => [x.de, x.a])
        .reduce((acc, par) => acc.filter(r => par.includes(r)), uniq(st.fluxos.flatMap(x => [x.de, x.a]))));
      const coll = passos.length ? rols.filter(r => obligats.every(o => o.includes(r))) : [];
      const pesCami = Object.fromEntries(rols.map(r => [r, passos.length ? obligats.filter(o => o.includes(r)).length / passos.length : 0]));
      const max = pasos.length ? pasos[pasos.length - 1] : 0, forats = [];
      for (let s = 1; s <= max; s++) if (!pasos.includes(s)) forats.push(s);
      const salts = [];
      for (let k = 1; k < passos.length; k++) {
        const ant = passos[k - 1].fluxos, tenen = new Set(ant.flatMap(x => [x.de, x.a]));
        passos[k].fluxos.forEach(x => { if (!tenen.has(x.de)) salts.push({ pas: passos[k].pas, clau: x.clau, de: x.de, venia: uniq(ant.map(y => y.a)) }); });
      }
      // Reentrada: el rol DONA en dos passos i entremig hi ha un pas on no hi és (rebre al final és retorn, no retreball)
      const reentrades = rols.filter(r => { const dona = passos.map(st => st.fluxos.some(x => x.de === r)), hi = passos.map(st => st.fluxos.some(x => x.de === r || x.a === r));
        const i = dona.indexOf(true), j = dona.lastIndexOf(true); return i >= 0 && j > i && hi.slice(i, j + 1).includes(false); });
      const inici = passos.length ? uniq(passos[0].fluxos.map(x => x.de)) : [];
      const retorn = inici.filter(r => p.items.some(i => i.a === r));
      const retornSempre = inici.filter(r => !retorn.includes(r) && sempre.some(x => x.a === r && rols.includes(x.de)));
      return { id: p.id, nom: p.nom, declarat: p.declarat, passos, rols, traspassos: p.items.filter(i => i.mena === 'tangible').length, // un intangible no és un traspàs de feina
        obligats, coll, pesCami, forats, salts, reentrades, inici, retorn, retornSempre };
    });
    return { llista, sempre, senseSeq, orfenes };
  }

  function metriques(m) {
    const f = fluxos(m), R = rolsDe(m), pr = processos(m), est = estructura(R.tots, f);
    const nF = f.length, nI = f.filter(x => x.mena === 'intangible').length;
    const n = (m.roles || []).length, maxV = n * (n - 1) / 2;
    const parells = (m.pairs || []).length;
    const vincles = uniq(f.map(x => [x.de, x.a].sort(per).join('|'))).length;
    const rols = {};
    R.tots.forEach(r => {
      const sort = f.filter(x => x.de === r), ent = f.filter(x => x.a === r);
      const contra = uniq(sort.map(x => x.a).concat(ent.map(x => x.de))).sort(per);
      const rec = contra.filter(c => sort.some(x => x.a === c) && ent.some(x => x.de === c)).length;
      const procs = pr.llista.filter(p => p.rols.includes(r)).map(p => p.id);
      const oblig = pr.llista.filter(p => p.obligats.some(o => o.includes(r))).map(p => p.id);
      rols[r] = { rol: r, declarat: R.declarats.includes(r),
        sortT: sort.filter(x => x.mena === 'tangible').length, sortI: sort.filter(x => x.mena === 'intangible').length,
        entT: ent.filter(x => x.mena === 'tangible').length, entI: ent.filter(x => x.mena === 'intangible').length,
        grau: sort.length + ent.length, contraparts: contra,
        reciprocitat: contra.length ? Math.round(rec * 100 / contra.length) : 0,
        concentracio: nF ? Math.round((sort.length + ent.length) * 100 / (nF * 2)) : 0,
        intermediacio: est.intermediacio[r] || 0, articulacio: est.articulacions.includes(r),
        sempreSort: pr.sempre.filter(x => x.de === r).length, sempreEnt: pr.sempre.filter(x => x.a === r).length,
        seqSort: sort.filter(x => pr.llista.some(p => p.rols.includes(r) && p.passos.some(st => st.fluxos.some(y => y.clau === x.clau)))).length,
        processos: procs, camiCritic: oblig,
        coll: pr.llista.filter(p => p.coll.includes(r)).map(p => p.id),
        pesCami: Object.fromEntries(pr.llista.filter(p => p.rols.includes(r)).map(p => [p.id, Math.round(p.pesCami[r] * 100) / 100])),
        siEncalla: { processos: oblig, fluxos: sort.length + ent.length } };
      rols[r].balancI = rols[r].sortI - rols[r].entI;
    });
    let hub = null, hubV = -1;
    Object.values(rols).sort((a, b) => per(a.rol, b.rol)).forEach(x => { if (x.grau > hubV) { hubV = x.grau; hub = x.rol; } });
    return { nRols: n, nFluxos: nF, nT: nF - nI, nI, pctI: nF ? Math.round(nI * 100 / nF) : 0,
      parells, vincles, densitat: maxV ? Math.round(parells * 100 / maxV) : 0,
      hub: nF ? hub : null, concentracio: nF ? Math.round(hubV * 100 / (nF * 2)) : 0,
      reciprocitat: vincles ? Math.round(uniq(f.map(x => [x.de, x.a].sort(per).join('|')))
        .filter(k => { const [a, b] = k.split('|'); return f.some(x => x.de === a && x.a === b) && f.some(x => x.de === b && x.a === a); }).length * 100 / vincles) : 0,
      sempre: pr.sempre.length, senseSeq: pr.senseSeq.length,
      processos: pr.llista.map(p => ({ id: p.id, passos: p.passos.length, traspassos: p.traspassos, rols: p.rols.length,
        coll: p.coll, forats: p.forats.length, salts: p.salts.length, reentrades: p.reentrades.length })),
      estructura: est, rols, noDeclarats: R.noDeclarats, _pr: pr };
  }

  /* ── 2 · Conversió de valor ────────────────────────────────────────────── */
  function conversions(m, M) {
    const f = fluxos(m), seq = m.seq || {};
    return f.filter(x => x.mena === 'intangible').map(x => {
      const torn = f.find(y => y.de === x.a && y.a === x.de);
      const c = {
        noCobra: !torn || torn.mena !== 'tangible',
        repetit: f.filter(y => y.de === x.de && y.mena === 'intangible').length >= 2,
        rolNoCobra: M.rols[x.de].entT === 0,
        esCobraDespres: f.some(y => y.de === x.a && y.a !== x.de && y.mena === 'tangible'),
        sempre: seq[x.clau] === 'sempre'
      };
      const punts = 2 * c.noCobra + c.repetit + c.rolNoCobra + c.esCobraDespres + c.sempre;
      return { clau: x.clau, de: x.de, a: x.a, q: x.q, torna: torn ? { mena: torn.mena, q: torn.q } : null,
        despres: uniq(f.filter(y => y.de === x.a && y.a !== x.de && y.mena === 'tangible').map(y => y.a)), criteris: c, punts };
    }).sort((a, b) => b.punts - a.punts || per(a.clau, b.clau));
  }

  /* ── 3 · Desviació real ↔ ideal ────────────────────────────────────────── */
  /* Les comparacions estructurals (colls, centre, traspassos, ordre) es fan
     sobre el que tots dos mapes tenen: el que és propi del real no hi compta
     com a desviació, i quan una diferència ve d'aquí, es diu. */
  function desviacio(real, ideal, opts) {
    const o = opts || {};
    const alies = {}; Object.entries(o.alies || ideal.alies || {}).forEach(([k, v]) => { alies[normNom(k)] = normNom(v); });
    const nI = s => { const n = normNom(s); return alies[n] || n; };      // nom de l'ideal → espai comú
    const nR = s => normNom(s);
    const fR = fluxos(real), fI = fluxos(ideal);
    const rR = rolsDe(real).tots, rI = rolsDe(ideal).tots;
    const setR = new Set(rR.map(nR)), setI = new Set(rI.map(nI));
    const rols = { falten: rI.filter(r => !setR.has(nI(r))), propis: rR.filter(r => !setI.has(nR(r))),
      comuns: rR.filter(r => setI.has(nR(r))) };
    const kR = x => nR(x.de) + '→' + nR(x.a), kI = x => nI(x.de) + '→' + nI(x.a), nq = x => normNom(x.q);
    const idF = x => x.clau + '|' + nq(x);
    // Per sentit, una llista: un vincle escrit en dos parells porta dos lliuraments en el mateix sentit.
    const lR = {}, lI = {};
    fR.forEach(x => { (lR[kR(x)] = lR[kR(x)] || []).push(x); });
    fI.forEach(x => { (lI[kI(x)] = lI[kI(x)] || []).push(x); });
    const treu = new Set((ideal.treu || []).map(k => { const [a, b] = String(k).split('→'); return nI(a) + '→' + nI(b); }));
    const pk = k => k.split('→').sort(per).join('|');
    const usatR = new Set(), usatI = new Set(), pares = [], invertits = [], canviMena = [], nomsDiferents = [];
    const lliures = (l, usat) => (l || []).filter(x => !usat.has(x));
    const curta = x => ({ clau: x.clau, mena: x.mena, q: x.q });
    const aparella = (xr, xi) => {
      usatR.add(xr); usatI.add(xi); pares.push({ real: curta(xr), ideal: curta(xi) });
      if (xi.mena !== xr.mena) canviMena.push({ clau: xr.clau, de: xr.de, a: xr.a, real: { mena: xr.mena, q: xr.q }, ideal: { mena: xi.mena, q: xi.q },
        sentit: xr.mena === 'intangible' ? 'conversio' : 'descontractualitza' });
      else if (nq(xi) !== nq(xr)) nomsDiferents.push({ clau: xr.clau, real: xr.q, ideal: xi.q });
    };
    uniq(Object.keys(lR).concat(Object.keys(lI)).map(pk)).sort(per).forEach(p => {
      const [a, b] = p.split('|'), dirs = a === b ? [a + '→' + b] : [a + '→' + b, b + '→' + a];
      // 1 · mateix sentit i mateix entregable
      dirs.forEach(k => lliures(lI[k], usatI).forEach(xi => {
        const xr = lliures(lR[k], usatR).find(y => nq(y) && nq(y) === nq(xi)); if (xr) aparella(xr, xi); }));
      if (dirs.length === 2) {
        // 2 · el mateix entregable, a l'altra banda: va al revés
        let inv = null;
        dirs.forEach((k, j) => lliures(lI[k], usatI).forEach(xi => {
          const xr = lliures(lR[dirs[1 - j]], usatR).find(y => nq(y) && nq(y) === nq(xi)); if (!xr) return;
          usatR.add(xr); usatI.add(xi);
          if (inv) { inv.reals.push(curta(xr)); return; }
          inv = { parella: [xi.de, xi.a], ideal: curta(xi), real: curta(xr), reals: [curta(xr)], per: 'entregable' }; invertits.push(inv); }));
        // la resta de la relació girada: el que l'ideal dona en un sentit i el real, de la mateixa mena, en l'altre
        if (inv) dirs.forEach((k, j) => lliures(lI[k], usatI).forEach(xi => {
          const op = dirs[1 - j], xr = lliures(lR[op], usatR).find(y => y.mena === xi.mena);
          if (!xr || lliures(lR[k], usatR).length || lliures(lI[op], usatI).length) return;
          usatR.add(xr); usatI.add(xi); inv.reals.push(curta(xr)); }));
        // 3 · qui dona el tangible s'ha girat (un lliurament per banda, a tots dos mapes)
        const [k, op] = dirs, iK = lliures(lI[k], usatI), iO = lliures(lI[op], usatI), rK = lliures(lR[k], usatR), rO = lliures(lR[op], usatR);
        if (!inv && iK.length === 1 && iO.length === 1 && rK.length === 1 && rO.length === 1 && iK[0].mena !== iO[0].mena
          && rK[0].mena === iO[0].mena && rO[0].mena === iK[0].mena) {
          const xi = iK[0].mena === 'tangible' ? iK[0] : iO[0], xr = xi === iK[0] ? rO[0] : rK[0];
          [iK[0], iO[0]].forEach(x => usatI.add(x)); [rK[0], rO[0]].forEach(x => usatR.add(x));
          invertits.push({ parella: [xi.de, xi.a], ideal: curta(xi), real: curta(xr), reals: [curta(rK[0]), curta(rO[0])], per: 'mena' });
        }
      }
      // 4 · el que queda en el mateix sentit: primer la mateixa mena (nom diferent), després la que canvia
      dirs.forEach(k => [true, false].forEach(mateixa => lliures(lI[k], usatI).forEach(xi => {
        const xr = lliures(lR[k], usatR).find(y => !mateixa || y.mena === xi.mena); if (xr) aparella(xr, xi); })));
    });
    const ambRols = k => { const [a, b] = k.split('→'); return setR.has(a) && setR.has(b); };
    const ordF = k => (x, y) => per(k(x), k(y)) || per(nq(x), nq(y));
    const falten = fI.filter(x => !usatI.has(x)).sort(ordF(kI)).map(x => ({ clau: x.clau, de: x.de, a: x.a, mena: x.mena, q: x.q, perRol: !ambRols(kI(x)) }));
    const sobren = [], propies = [];
    fR.filter(x => !usatR.has(x)).sort(ordF(kR)).forEach(x => {
      (treu.has(kR(x)) ? sobren : propies).push({ clau: x.clau, de: x.de, a: x.a, mena: x.mena, q: x.q }); });
    const comunR = new Set(pares.map(p => idF(p.real)).concat(invertits.flatMap(x => x.reals.map(idF)))); // el que l'ideal també té (encara que vagi al revés)
    // Seqüència: el procés, i dins del procés l'ordre relatiu entre els lliuraments que tots dos tenen
    const sR = real.seq || {}, sI = ideal.seq || {};
    const procIaR = {}; // id ideal → id real
    (ideal.processos || []).forEach(pi => { const r = (real.processos || []).find(pr => normNom(pr.id) === normNom(pi.id) || (normNom(pr.nom) && normNom(pr.nom) === normNom(pi.nom))); if (r) procIaR[pi.id] = r.id; });
    const ds = v => v === 'sempre' ? 'sempre' : Array.isArray(v) ? 'pas' : 'cap';
    const rang = (S, k, ks) => { const u = uniq(ks.map(x => Number(S[x][1]) || 1)).sort((x, y) => x - y); return u.indexOf(Number(S[k][1]) || 1); };
    const seq = [], vistos = new Set();
    pares.slice().sort((x, y) => per(x.real.clau, y.real.clau)).forEach(({ real: xr, ideal: xi }) => {
      if (vistos.has(xr.clau)) return; vistos.add(xr.clau);
      const vi = sI[xi.clau], vr = sR[xr.clau];
      let tipus = null;
      if (ds(vi) === 'cap') return;                                   // l'ideal no hi diu res
      if (ds(vr) !== ds(vi)) tipus = ds(vr) + '→' + ds(vi);           // p. ex. 'sempre→pas', 'cap→pas'
      else if (ds(vi) === 'pas') {
        if (procIaR[vi[0]] !== vr[0]) tipus = 'proces';
        else {
          const cm = pares.filter(q => Array.isArray(sR[q.real.clau]) && sR[q.real.clau][0] === vr[0] && Array.isArray(sI[q.ideal.clau]) && sI[q.ideal.clau][0] === vi[0]);
          if (rang(sR, xr.clau, cm.map(q => q.real.clau)) !== rang(sI, xi.clau, cm.map(q => q.ideal.clau))) tipus = 'pas';
        }
      }
      if (tipus) seq.push({ clau: xr.clau, tipus, real: vr || null, ideal: vi });
    });
    const MR = metriques(real), MI = metriques(ideal);
    // Traspassos (només tangibles): els del real, i els que l'ideal també té
    const procs = (ideal.processos || []).map(pi => {
      const ii = MI.processos.find(x => x.id === pi.id), rid = procIaR[pi.id], rr = rid ? MR.processos.find(x => x.id === rid) : null;
      const pR = rid ? MR._pr.llista.find(x => x.id === rid) : null;
      const itR = pR ? pR.passos.flatMap(st => st.fluxos).filter(x => x.mena === 'tangible') : [];
      return { ideal: pi.id, real: rid || null, passos: { real: rr ? rr.passos : 0, ideal: ii ? ii.passos : 0 },
        traspassos: { real: rr ? rr.traspassos : 0, ideal: ii ? ii.traspassos : 0, comuns: itR.filter(x => comunR.has(idF(x))).length,
          propis: itR.filter(x => !comunR.has(idF(x))).map(x => ({ clau: x.clau, de: x.de, a: x.a, q: x.q })) } };
    });
    const procsPropis = (real.processos || []).filter(pr => !Object.values(procIaR).includes(pr.id)).map(p => p.id);
    const dm = k => ({ real: MR[k], ideal: MI[k], delta: (MR[k] || 0) - (MI[k] || 0) });
    // El centre: tots els rols empatats al grau màxim, a cada banda
    const maxims = gr => { const mx = Math.max(0, ...Object.values(gr)); return mx ? Object.keys(gr).filter(r => gr[r] === mx).sort(per) : []; };
    const grau = M => Object.fromEntries(Object.values(M.rols).map(x => [x.rol, x.grau]));
    const gC = {}; pares.forEach(({ real: x }) => { const [de, a] = x.clau.split('→'); gC[de] = (gC[de] || 0) + 1; gC[a] = (gC[a] || 0) + 1; });
    const hR = maxims(grau(MR)), hI = maxims(grau(MI)), hC = maxims(gC);
    const creua = h => h.some(r => hI.some(i => nR(r) === nI(i)));
    const metr = { nRols: dm('nRols'), nFluxos: dm('nFluxos'), pctI: dm('pctI'), densitat: dm('densitat'),
      concentracio: dm('concentracio'), reciprocitat: dm('reciprocitat'), sempre: dm('sempre'),
      hub: { real: MR.hub, ideal: MI.hub, reals: hR, ideals: hI, mateix: !hR.length || !hI.length || creua(hR), perPropi: !creua(hR) && creua(hC) } };
    const perRol = {};
    rols.comuns.forEach(r => { const ri = rI.find(x => nI(x) === nR(r)), a = MR.rols[r], b = MI.rols[ri];
      perRol[r] = {}; ['grau', 'sortT', 'sortI', 'entT', 'entI', 'balancI', 'concentracio', 'intermediacio'].forEach(k => {
        perRol[r][k] = { real: a[k], ideal: b[k], delta: Math.round((a[k] - b[k]) * 100) / 100 }; }); });
    // Colls nous: articulacions del real entre els rols comuns, i només si a l'ideal els mateixos trossos queden lligats sense el rol
    const comuSet = new Set(rols.comuns);
    const estC = estructura(rols.comuns, fR.filter(x => comuSet.has(x.de) && comuSet.has(x.a)));
    const adjI = {}; fI.forEach(x => { const a = nI(x.de), b = nI(x.a); if (a === b) return;
      (adjI[a] = adjI[a] || new Set()).add(b); (adjI[b] = adjI[b] || new Set()).add(a); });
    const collsNous = estC.articulacions.filter(r => {
      const trossos = [], vist0 = new Set([r]);
      estC.veins[r].forEach(v => { if (vist0.has(v)) return; const c = [v], cua = [v]; vist0.add(v);
        while (cua.length) { const u = cua.shift(); estC.veins[u].forEach(w => { if (!vist0.has(w)) { vist0.add(w); c.push(w); cua.push(w); } }); }
        trossos.push(c.map(nR)); });
      if (trossos.length < 2) return false;
      const inici = trossos[0][0], vist = new Set([nR(r), inici]), cua = [inici];
      while (cua.length) { const u = cua.shift(); (adjI[u] || new Set()).forEach(w => { if (!vist.has(w)) { vist.add(w); cua.push(w); } }); }
      return trossos.every(t => t.some(x => vist.has(x)));
    });
    const cobR = rI.length ? Math.round((rI.length - rols.falten.length) * 100 / rI.length) : 0;
    const cobF = fI.length ? Math.round((fI.length - falten.length) * 100 / fI.length) : 0;
    return { rols, fluxos: { falten, propies, sobren, canviMena, invertits, nomsDiferents }, pares, seq, processos: procs, processosPropis: procsPropis,
      metriques: metr, perRol, collsNous, cobertura: { rols: cobR, fluxos: cobF },
      _n: { nR, nI } };
  }

  /* ── 4 · Nivells (zoom) ─────────────────────────────────────────────────── */
  function nivells(model, maxProf) {
    const out = [], lim = maxProf == null ? 6 : maxProf;
    const camina = (m, cami, pare) => {
      out.push({ cami, mapa: m, pare });
      if (cami.length >= lim) return;
      Object.keys(m.dins || {}).sort(per).forEach(r => {
        if (cami.map(normNom).includes(normNom(r))) return;            // cap cicle
        camina(m.dins[r], cami.concat([r]), m);
      });
    };
    camina(model, [], null);
    return out;
  }

  /* ── 5 · El diagnòstic ─────────────────────────────────────────────────── */
  const FONT = {
    allee: 'Verna Allee, «Value Network Analysis and value conversion of tangible and intangible assets», JIC 9(1), 2008',
    practica: 'Pràctica del mètode: Pantheon.work (Blanco-Gracia i Astiz, 2018) i el guió d\'una sessió real amb un equip de direcció',
    casa: 'Regla o criteri d\'aquesta casa (SOS/tools/build-vna-suport.js, mapa-kanban-ia.md)',
    toc: 'Teoria de les restriccions (Goldratt, «The Goal», 1984)',
    lean: 'Lean: els set malbarataments (Ohno, 1978) i la seva lectura per a feina de coneixement (Poppendieck, 2003)',
    xarxes: 'Anàlisi de xarxes: punts d\'articulació (Hopcroft i Tarjan, 1973)',
    bus: 'Gestió de risc: punt únic de fallada («factor bus»)',
    agil: 'Àgil: bucle d\'inspecció i adaptació (Schwaber i Sutherland, «The Scrum Guide», 2020) i el cicle PDCA (Deming)',
    conscient: 'Lectura conscient d\'aquesta casa sobre l\'anàlisi d\'impacte d\'Allee (cost intangible de donar i de rebre)'
  };
  const GR = { alta: 3, mitjana: 2, baixa: 1, nota: 0 };
  const TIPUS_ORDRE = { casa: 0, metode: 1, agil: 2, eficient: 3, conscient: 4 };
  const CAPA_ORDRE = { real: 0, desviacio: 1, ideal: 2 };

  function diagnostica(model, opts) {
    const o = Object.assign({ maxConversio: 3, capaIdeal: true }, opts || {});
    const T = [];
    const posa = (x) => { T.push(x); };
    const mk = (codi, capa, cami, subj, camps) => Object.assign({
      id: codi + '@' + capa + ':' + cami.map(normNom).join('/') + '#' + subj, codi, capa, nivell: { cami: cami.slice(), rol: null } }, camps);
    const fl = (x) => '«' + x.de + '» → «' + x.a + '»';

    const nivellsReal = nivells(model).map(nv => diagNivell(nv, 'real'));
    let nivellsIdeal = [], desv = [];
    if (model.ideal && (model.ideal.roles || []).length) {
      if (o.capaIdeal) nivellsIdeal = nivells(model.ideal).map(nv => diagNivell(nv, 'ideal'));
      desv = diagDesviacio(model, model.ideal, []);
    }

    function diagNivell(nv, capa) {
      const m0 = nv.mapa, cami = nv.cami, prof = cami.length;
      // Un mapa de dins hereta l'abast de qui el conté
      const m = prof && !(m0.abast || '').trim()
        ? Object.assign({}, m0, { abast: 'Per dins de «' + cami[cami.length - 1] + '»: ' + ((nv.pare && nv.pare.abast) || '') }) : m0;
      const rv = revisa(m), M = metriques(m), pr = M._pr, f = fluxos(m), conv = conversions(m, M);
      const S = (codi, subj, camps) => posa(mk(codi, capa, cami, subj, camps));
      // Rols externs (client, proveïdor, entorn): si n'hi ha de marcats, les lectures de restricció no s'hi apliquen
      const EXT = new Set((m0.externs || []).map(normNom)), marcats = EXT.size > 0, ext = r => EXT.has(normNom(r));

      /* 5.1 · Les deu regles: el veredicte és el de revisa(); aquí només s'hi posa l'evidència */
      rv.regles.filter(g => !g.ok).forEach(g => {
        if (prof && g.id === 'rols' && (m.roles || []).length < 6) return;            // a dins, menys de sis és normal
        let grav = g.dur ? 'alta' : g.id === 'concentracio' ? 'mitjana' : 'baixa';
        if (prof && g.id === 'processos' && (m.processos || []).length < 2 && !/tangible/.test(g.diu)) grav = 'nota';
        const ev = { rols: [], fluxos: [] };
        if (g.id === 'reciprocitat') ev.parells = (m.pairs || []).filter(p => !p[2] || !p[3] || !p[4] || !p[5]).map(p => [p[0], p[1]]);
        if (g.id === 'solts') ev.rols = (m.roles || []).filter(r => !f.some(x => x.de === r || x.a === r));
        if (g.id === 'concentracio' && M.hub) ev.rols = [M.hub];
        if (g.id === 'densitat') { // fins a 3 parells sense vincle entre els rols més actius: «les regions que no s'han preguntat»
          const act = Object.values(M.rols).filter(x => x.declarat).sort((a, b) => b.grau - a.grau || per(a.rol, b.rol)).map(x => x.rol), reg = [];
          act.forEach((a, i) => act.slice(i + 1).forEach(b => { if (reg.length < 3 && !M.estructura.veins[a].includes(b)) reg.push([a, b]); }));
          ev.regions = reg; }
        if (g.id === 'processos') ev.fluxos = Object.keys(m.seq || {}).filter(k => m.seq[k] === 'sempre' && (f.find(x => x.clau === k) || {}).mena === 'tangible');
        const LL = { rols: 'Entre 6 i 12: el 6 és de la casa; 8–10 a la sala i més de 12 que no es maneja són de la pràctica', menes: 'Un terç (de la casa: l\'article diu que la recerca encara no ha determinat les proporcions ideals)',
          reciprocitat: '100 % dels vincles escrits amb tornada (de la casa)', densitat: '40 % (de la casa)', concentracio: '40 % (de la casa)' };
        S('regla-' + g.id, g.id, { tipus: g.de === 'mètode' ? 'metode' : 'casa', gravetat: grav,
          que: 'Regla ' + g.n + ' · ' + g.t + ': ' + g.diu + '.',
          perque: g.dur ? 'És una regla dura: mentre estigui oberta, el diagnòstic és provisional i el mapa encara no s\'ensenya com a mapa.' : 'És un avís: deixa passar, però diu on el mapa encara no s\'ha preguntat prou.',
          pregunta: PREG_REGLA[g.id] || 'Què falta escriure perquè aquesta regla quedi tancada?',
          font: { de: g.id === 'rols' ? 'practica' : g.de === 'mètode' ? 'allee' : 'casa',
            ref: g.id === 'rols' ? FONT.practica + ' · llindar: ' + FONT.casa : g.de === 'mètode' ? FONT.allee + ' · llindar: ' + FONT.casa : FONT.casa,
            llindar: LL[g.id] ? { text: LL[g.id], de: g.id === 'rols' ? 'mixt' : 'casa' } : null },
          evidencia: ev, regla: g.id });
      });

      /* 5.2 · Coherència del que s'ha escrit (la casa) */
      if (M.noDeclarats.length) S('rol-no-declarat', M.noDeclarats.map(normNom).join('+'), { tipus: 'casa', gravetat: 'baixa',
        que: 'Els parells parlen de ' + M.noDeclarats.map(r => '«' + r + '»').join(', ') + ', que no és a la llista de rols.',
        perque: 'Un nom escrit de dues maneres parteix un rol en dos, i les regles el compten malament.',
        pregunta: 'És un rol nou o el mateix amb un altre nom?', font: { de: 'casa', ref: FONT.casa }, evidencia: { rols: M.noDeclarats } });
      const ps = (m.pairs || []).map(p => [p[0], p[1]].sort(per).join('|')), rep = uniq(ps.filter((k, i) => ps.indexOf(k) !== i));
      if (rep.length) S('parell-repetit', rep.join('+'), { tipus: 'casa', gravetat: 'baixa', que: 'El vincle ' + rep.map(k => k.replace('|', ' ↔ ')).join(', ') + ' està escrit més d\'un cop.',
        perque: 'Dues línies per al mateix vincle dupliquen el recompte de densitat i de concentració.', pregunta: 'Són dos intercanvis diferents que es poden ajuntar en un, o un de repetit?',
        font: { de: 'casa', ref: FONT.casa }, evidencia: { parells: rep.map(k => k.split('|')) } });
      if (pr.orfenes.length) S('seq-orfena', 'seq', { tipus: 'casa', gravetat: 'baixa',
        que: pr.orfenes.length + ' línia/es de la seqüència no lliguen: ' + pr.orfenes.slice(0, 3).map(x => x.motiu === 'flux' ? '«' + x.clau + '» no és al mapa' : '«' + x.proces + '» no és un procés declarat').join('; ') + '.',
        perque: 'La seqüència parla d\'un lliurament o d\'un procés que el mapa no té: o s\'ha canviat un nom o falta una línia.',
        pregunta: 'Quin nom és el bo?', font: { de: 'casa', ref: FONT.casa }, evidencia: { fluxos: pr.orfenes.map(x => x.clau) } });
      const sT = pr.senseSeq.filter(x => x.mena === 'tangible'), sI = pr.senseSeq.filter(x => x.mena === 'intangible');
      if (pr.senseSeq.length) S('sense-seq', 'seq', { tipus: 'casa', gravetat: sT.length ? 'baixa' : 'nota',
        que: (sT.length ? sT.length + ' tangible/s sense pas (' + sT.slice(0, 3).map(fl).join(', ') + ')' : '') + (sT.length && sI.length ? ' i ' : '') + (sI.length ? sI.length + ' intangible/s sense pas ni «sempre» (' + sI.slice(0, 3).map(fl).join(', ') + ')' : '') + '.',
        perque: 'Seqüenciar és com es valida que el mapa és complet. Un tangible sense pas és un tangible que ningú ha seqüenciat; un intangible sense res no se sap si passa.',
        pregunta: 'En quin procés i en quin pas passa? I si passa tot el temps, marqueu-lo «sempre».',
        font: { de: 'practica', ref: FONT.practica + ' (passa 4: validar seqüenciant) · la guarda de «sempre» és de la casa' }, evidencia: { fluxos: pr.senseSeq.map(x => x.clau) } });

      /* 5.3 · Mètode VNA */
      const cs = M.estructura.fulles.filter(r => (m.roles || []).includes(r));
      if (cs.length) S('cul-de-sac', cs.map(normNom).join('+'), { tipus: 'metode', gravetat: 'baixa',
        que: cs.map(r => '«' + r + '»').join(', ') + (cs.length > 1 ? ' pengen' : ' penja') + ' d\'un sol vincle.',
        perque: 'Si aquell vincle s\'afluixa, el rol queda fora de la xarxa.',
        pregunta: 'Amb qui més es relaciona de debò? Hi ha algú altre que li doni o en rebi alguna cosa?',
        font: { de: 'allee', ref: FONT.allee + ' (l\'anàlisi d\'intercanvi pregunta per «vincles morts, dèbils, culs-de-sac o colls d\'ampolla»; llegir-ho com a rol d\'un sol vincle és de la casa)' }, evidencia: { rols: cs } });
      M.estructura.articulacions.filter(r => (m.roles || []).includes(r)).forEach(r => {
        // el component més petit és el que queda fora
        const comps = []; const vist0 = new Set([r]);
        M.estructura.veins[r].forEach(v => { if (vist0.has(v)) return; const c = [v], cua = [v]; vist0.add(v);
          while (cua.length) { const u = cua.shift(); M.estructura.veins[u].forEach(w => { if (!vist0.has(w)) { vist0.add(w); c.push(w); cua.push(w); } }); } comps.push(c.sort(per)); });
        comps.sort((a, b) => a.length - b.length || per(a[0], b[0]));
        const gran = comps[comps.length - 1], unic = comps.length < 2 || comps[comps.length - 2].length < gran.length;
        const queden = (unic ? comps.slice(0, -1) : comps).flat();   // si no hi ha un tros clarament més gran, tots queden partits
        if (queden.length && queden.every(x => cs.includes(x))) return;   // només hi pengen culs-de-sac: ja s'han dit, no es compten dos cops
        S('coll-ampolla', normNom(r), { tipus: 'metode', gravetat: (pr.llista.some(p => p.passos.length >= 3 && p.coll.includes(r)) || (pr.llista.length > 1 && M.rols[r].camiCritic.length === pr.llista.length)) ? 'mitjana' : 'baixa',
          nivellRol: r, que: unic ? 'Tot el que lliga ' + queden.map(x => '«' + x + '»').join(', ') + ' amb la resta de la xarxa passa per «' + r + '».' : 'Sense «' + r + '», la xarxa es parteix en ' + comps.length + ' trossos.',
          perque: 'Si «' + r + '» s\'encalla, aquesta part queda desconnectada. És un coll d\'ampolla estructural: no depèn de cap llindar.',
          pregunta: 'Què passaria si qui fa de «' + r + '» el substituís una altra persona? Hi ha cap altre camí?',
          font: { de: 'practica', ref: FONT.practica + ' (la pregunta i el pols) · ' + FONT.allee + ' (el concepte: «colls d\'ampolla») · ' + FONT.xarxes + ' (com es detecta)' },
          evidencia: { rols: [r], queden, trossos: comps.length } });
      });
      Object.values(M.rols).filter(x => x.declarat && x.grau > 0).forEach(x => {
        const nom = x.rol;
        if (x.sortI + x.entI === 0) S('nomes-tangible', normNom(nom), { tipus: 'metode', gravetat: 'baixa', nivellRol: nom,
          que: 'Amb «' + nom + '» tot el que es mou és tangible: cap avís, cap coneixement, cap confiança.',
          perque: 'Una relació que només és contracte s\'aguanta mentre el contracte s\'aguanta. L\'article pregunta si les dues menes són sanes o en domina una.',
          pregunta: 'Què sap «' + nom + '» que ningú li demana? Què li falta saber que ningú li diu?',
          font: { de: 'allee', ref: FONT.allee }, evidencia: { rols: [nom] } });
        if (x.sortT + x.entT === 0) S('nomes-intangible', normNom(nom), { tipus: 'metode', gravetat: 'baixa', nivellRol: nom,
          que: 'Amb «' + nom + '» no hi ha res exigible: tot el que es mou és intangible.',
          perque: 'Un rol que ningú pot reclamar depèn de la bona voluntat. Sovint és on hi ha valor que es regala.',
          pregunta: 'Si «' + nom + '» deixés de fer-ho demà, qui ho notaria i què deixaria de passar?',
          font: { de: 'allee', ref: FONT.allee }, evidencia: { rols: [nom] } });
      });
      const CARREC = /\b(director|directora|gerent|gerencia|cap de|cap d|departament|responsable de|ceo|cfo|secretari|secretaria|president|presidenta|coordinador|coordinadora|tecnic de|tecnica de|regidor|regidora|regidoria|alcalde|alcaldessa)\b/; // normNom ja ha tret l'apòstrof
      (m.roles || []).filter(r => CARREC.test(normNom(r))).forEach(r => S('sembla-carrec', normNom(r), { tipus: 'metode', gravetat: 'baixa', nivellRol: r,
        que: '«' + r + '» sembla un càrrec, no un rol.', perque: 'El mètode dibuixa el que algú fa, no com es diu a l\'organigrama: amb càrrecs surt un organigrama amb fletxes.',
        pregunta: 'Què fa, a l\'activitat de l\'abast? Digueu-ho amb un verb: «qui decideix…», «qui porta…».',
        font: { de: 'allee', ref: FONT.allee + ' · ' + FONT.practica + ' · detecció per llista de paraules (de la casa)' }, evidencia: { rols: [r] } }));
      const NO_VERB = new Set(['paper', 'taller', 'lloguer', 'sopar', 'dinar', 'esmorzar', 'poder', 'deure', 'parer', 'plaer', 'carrer', 'saber fer', 'mar', 'lloc', 'sabre']);
      const verbals = f.filter(x => { const w = normNom(x.q).split(' ')[0] || ''; return /^[a-z]{2,}(ar|er|ir|re)(ne|hi|lo|la|los|les|nos|vos|se|me|te)?$/.test(w) && !NO_VERB.has(w) && /-|\s/.test(x.q.slice(w.length, w.length + 1) || ' '); });
      if (verbals.length) S('entregable-verb', 'q', { tipus: 'metode', gravetat: 'nota',
        que: verbals.length + ' entregable/s comencen amb un verb: ' + verbals.slice(0, 3).map(x => '«' + x.q + '»').join(', ') + '.',
        perque: 'Un entregable es diu amb un nom perquè es pugui comprovar si ha arribat. La detecció és per la forma de la paraula i s\'equivoca: decideix la sala.',
        pregunta: 'Com sabria qui el rep que li ha arribat? Quin nom té, la cosa?',
        font: { de: 'practica', ref: FONT.practica }, evidencia: { fluxos: verbals.map(x => x.clau) } });
      // Valor percebut (gomets), si n'hi ha
      const G = m.gomets || {};
      Object.keys(G).sort(per).forEach(k => {
        const x = f.find(y => y.clau === k); if (!x) return;
        const v = [].concat(G[k]).map(Number).filter(n => !Number.isNaN(n));
        if (!v.length) return;
        const mn = Math.min(...v), mx = Math.max(...v);
        if (mn <= -1 && mx >= 1) S('percepcio-dividida', k, { tipus: 'conscient', gravetat: 'baixa',
          que: fl(x) + ': «' + x.q + '» té gomets de les dues menes (' + v.join(', ') + ').',
          perque: 'Els participants poden percebre una mateixa transacció de maneres força diferents, i és on surten les idees.',
          pregunta: 'Qui l\'ha marcat blau i qui groc? Què veu cadascú que l\'altre no?', font: { de: 'allee', ref: FONT.allee + ' (valor percebut per qui ho rep, −2…+2)' }, evidencia: { fluxos: [k] } });
        else if (mx <= -1) S('gomet-baix', k, { tipus: x.mena === 'tangible' ? 'eficient' : 'conscient', gravetat: mn <= -2 ? 'mitjana' : 'baixa',
          que: '«' + x.a + '» valora ' + mn + ' el que rep de «' + x.de + '»: «' + x.q + '».',
          perque: x.mena === 'tangible' ? 'Un lliurament exigible que qui el rep no valora és feina que probablement es refà: és un defecte, en llenguatge lean.' : 'Un intangible que no arriba com s\'esperava erosiona la relació sense que consti enlloc.',
          pregunta: 'Què hauria de tenir perquè «' + x.a + '» el marqués blau?',
          font: { de: 'allee', ref: FONT.allee + ' (anàlisi d\'impacte) · ' + (x.mena === 'tangible' ? FONT.lean : FONT.conscient) }, evidencia: { fluxos: [k] } });
      });
      if (!prof && capa === 'real' && rv.passa && !Object.keys(G).length) S('sense-gomets', 'g', { tipus: 'metode', gravetat: 'nota',
        que: 'Encara no hi ha cap gomet de satisfacció.', perque: 'Un mapa sense gomets diu què hi ha i no diu on hi ha feina.',
        pregunta: 'Sobre els entregables més importants: qui el rep, n\'està satisfet (blau) o no (groc)?', font: { de: 'practica', ref: FONT.practica }, evidencia: {} });

      // Conversió de valor
      const cand = conv.filter(c => c.punts >= 3 && !ext(c.de));
      cand.slice(0, o.maxConversio).forEach(c => S('conversio', c.clau, { tipus: 'metode', gravetat: 'mitjana', mirada: 'creacio', nivellRol: c.de,
        que: '«' + c.de + '» dona «' + c.q + '» a «' + c.a + '»' + (c.criteris.noCobra ? (c.torna ? ' i el que li torna és intangible («' + c.torna.q + '»)' : ' i no li torna res') : '') +
          (c.criteris.esCobraDespres ? '; «' + c.a + '» després lliura tangibles a ' + c.despres.map(r => '«' + r + '»').join(', ') : '') + (c.criteris.sempre ? '; i passa «sempre», fora de tots els processos' : '') + '.',
        perque: 'És valor que «' + c.de + '» ja produeix i avui no té forma negociable. La pregunta del mètode és si se li pot donar, i una oferta no és una conversió fins que un altre rol l\'accepta.',
        pregunta: 'Quin rol pagaria per «' + c.q + '» si l\'hi oferíssim empaquetat? Què li hauríem d\'afegir?',
        font: { de: 'allee', ref: FONT.allee + ' (conversió de valor) · l\'ordre de candidats és de la casa' }, evidencia: { fluxos: [c.clau], rols: [c.de] }, conversio: c }));
      if (cand.length > o.maxConversio) S('conversio-mes', 'c', { tipus: 'metode', gravetat: 'nota',
        que: 'I ' + (cand.length - o.maxConversio) + ' candidat/s més a la taula de conversió.', perque: 'S\'ensenyen els tres primers perquè la sala no se\'n perdi.',
        pregunta: 'N\'hi ha algun altre que ja sabeu que es podria cobrar?', font: { de: 'allee', ref: FONT.allee }, evidencia: { fluxos: cand.slice(o.maxConversio).map(c => c.clau) } });

      /* 5.4 · Àgil i eficient: el flux, a partir de la seqüència */
      pr.llista.forEach(p => {
        if (p.passos.length >= 3) p.coll.filter(r => !ext(r)).forEach(r => S('coll-proces', p.id + ':' + normNom(r), { tipus: 'agil', gravetat: marcats ? 'mitjana' : 'baixa', nivellRol: r,
          que: 'Els ' + p.passos.length + ' passos de «' + p.nom + '» passen tots per «' + r + '».',
          perque: marcats ? 'Un procés va al ritme del seu coll d\'ampolla: si «' + r + '» s\'atura, s\'atura el procés sencer.'
            : 'Si «' + r + '» és qui fa la feina, pot ser la restricció: el procés va al seu ritme. Si és qui la rep (el client, l\'usuari), és el centre del recorregut i no un coll. Marqueu els rols externs i el diagnòstic ho tindrà en compte.',
          pregunta: marcats ? 'Quins d\'aquests passos podria fer algú altre, o es podrien fer sense passar per «' + r + '»?' : '«' + r + '» fa la feina o la rep? Si la fa, quins passos podria fer algú altre?',
          font: { de: 'toc', ref: FONT.toc + ' · la condició (≥ 3 passos, tots per un rol) és de la casa' }, evidencia: { rols: [r], proces: p.id, passos: p.passos.map(s => s.pas) } }));
        if (p.salts.length) S('espera', p.id, { tipus: 'eficient', gravetat: 'baixa',
          que: 'A «' + p.nom + '», ' + p.salts.map(s => 'el pas ' + s.pas + ' el comença «' + s.de + '», que no ha rebut res al pas anterior').join('; ') + '.',
          perque: 'Quan qui fa el pas següent no és qui acaba de rebre, algú ha d\'avisar-lo: aquí s\'hi espera, o hi ha un lliurament que no s\'ha escrit.',
          pregunta: 'Com sap «' + p.salts[0].de + '» que li toca? Hi falta una fletxa?',
          font: { de: 'lean', ref: FONT.lean + ' (esperes) · ' + FONT.practica + ' (seqüenciar destapa el que falta)' }, evidencia: { proces: p.id, fluxos: p.salts.map(s => s.clau), passos: p.salts.map(s => s.pas) } });
        if (p.forats.length) S('forat-pas', p.id, { tipus: 'casa', gravetat: 'baixa',
          que: 'A «' + p.nom + '» no hi ha cap lliurament al pas ' + p.forats.join(', ') + '.', perque: 'Un pas buit és un pas que algú fa i ningú ha escrit, o una numeració que ha quedat vella.',
          pregunta: 'Què passa en aquell pas, i qui ho lliura a qui?', font: { de: 'practica', ref: FONT.practica }, evidencia: { proces: p.id, passos: p.forats } });
        if (p.reentrades.length) S('reentrada', p.id, { tipus: 'eficient', gravetat: 'nota',
          que: 'A «' + p.nom + '» ' + p.reentrades.map(r => '«' + r + '»').join(', ') + ' torna a lliurar després que la feina hagi passat per altres rols.',
          perque: 'Una tornada enrere és un traspàs més, i sovint és retreball: es revisa el que ja s\'havia fet.',
          pregunta: 'És una feina nova o la mateixa que es refà? Si es refà, es podria resoldre la primera vegada?', font: { de: 'lean', ref: FONT.lean + ' (traspassos i retreball)' }, evidencia: { proces: p.id, rols: p.reentrades } });
        if (p.passos.length >= 3 && p.inici.length && !p.retorn.length) S('sense-retorn', p.id, { tipus: 'agil', gravetat: p.retornSempre.length ? 'nota' : 'baixa',
          que: '«' + p.inici.join('», «') + '» comença «' + p.nom + '» i no en rep res dins del procés' + (p.retornSempre.length ? ' (el retorn hi és però passa «sempre», fora del procés: arriba a temps perquè «' + p.inici[0] + '» ajusti la propera vegada?)' : '') + '.',
          perque: 'Sense retorn no hi ha bucle: qui comença no sap com ha acabat, i no pot ajustar el que fa la propera vegada.',
          pregunta: 'En quin moment sap «' + p.inici[0] + '» com ha anat? Es podria posar un pas per a això?',
          font: { de: 'agil', ref: FONT.agil }, evidencia: { proces: p.id, rols: p.inici } });
      });
      if (pr.llista.length >= 2) Object.values(M.rols).filter(x => x.camiCritic.length === pr.llista.length && !ext(x.rol)).forEach(x => S('punt-unic', normNom(x.rol), { tipus: 'agil', gravetat: marcats ? 'mitjana' : 'baixa', nivellRol: x.rol,
        que: 'Els ' + pr.llista.length + ' processos necessiten «' + x.rol + '» en algun pas.',
        perque: marcats ? 'És un punt únic de fallada: si «' + x.rol + '» s\'encalla, no s\'atura un procés, s\'aturen tots.'
          : 'Si «' + x.rol + '» és de la casa, és un punt únic de fallada: si s\'encalla, s\'aturen tots els processos. Si és qui rep el servei (el client, l\'usuari), és natural que hi sigui.',
        pregunta: marcats ? 'Qui més sap fer el que fa «' + x.rol + '»? Què passaria si la persona que ho fa la substituís una altra?' : '«' + x.rol + '» és de la casa o rep el servei? Si és de la casa, qui més sap fer el que fa?',
        font: { de: 'bus', ref: FONT.bus + ' · ' + FONT.practica + ' (el pols: «quin rol és més essencial per a la supervivència de la xarxa?»)' }, evidencia: { rols: [x.rol], processos: x.camiCritic } }));
      // Duplicats i ponts (eficient), per entregable normalitzat: només tangibles. Un intangible que arriba per dues bandes no és sobreprocés.
      const perA = {}, perAI = {}; f.forEach(x => { const k = normNom(x.a) + '|' + normNom(x.q), o2 = x.mena === 'tangible' ? perA : perAI; (o2[k] = o2[k] || []).push(x); });
      Object.keys(perA).sort(per).filter(k => perA[k].length > 1).forEach(k => S('duplicat', k, { tipus: 'eficient', gravetat: 'baixa',
        que: '«' + perA[k][0].a + '» rep «' + perA[k][0].q + '» de ' + perA[k].map(x => '«' + x.de + '»').join(' i de ') + '.',
        perque: 'El mateix entregable fet dues vegades és sobreprocés, o dues versions que no coincidiran.',
        pregunta: 'Són de debò la mateixa cosa? Si ho són, qui l\'hauria de fer?', font: { de: 'lean', ref: FONT.lean + ' (sobreprocés)' }, evidencia: { fluxos: perA[k].map(x => x.clau) } }));
      Object.keys(perAI).sort(per).filter(k => perAI[k].length > 1).forEach(k => S('redundant', k, { tipus: 'conscient', gravetat: 'nota', nivellRol: perAI[k][0].a,
        que: '«' + perAI[k][0].a + '» rep «' + perAI[k][0].q + '» de ' + perAI[k].map(x => '«' + x.de + '»').join(' i de ') + '.',
        perque: 'Rebre confiança, reconeixement o coneixement per més d\'una banda sol ser riquesa de la xarxa, no sobreprocés.',
        pregunta: 'La xarxa li dona «' + perAI[k][0].q + '» per dues bandes: és redundància que cuida o soroll?',
        font: { de: 'conscient', ref: FONT.conscient + ' · no comptar-ho com a sobreprocés és de la casa' }, evidencia: { fluxos: perAI[k].map(x => x.clau), rols: [perAI[k][0].a] } }));
      f.filter(x => x.mena === 'tangible').forEach(x => f.filter(y => y.mena === 'tangible' && y.de === x.a && y.a !== x.de && normNom(y.q) && normNom(y.q) === normNom(x.q)).forEach(y => S('pont', x.clau + '+' + y.clau, { tipus: 'eficient', gravetat: 'baixa', nivellRol: x.a,
        que: '«' + x.a + '» rep «' + x.q + '» de «' + x.de + '» i el passa igual a «' + y.a + '».',
        perque: 'Un traspàs que no transforma és transport. L\'anàlisi de creació de valor pregunta com hi afegim valor; si no n\'hi afegim, és una espera més.',
        pregunta: 'Què hi afegeix «' + x.a + '»? Si no hi afegeix res, podria anar directament de «' + x.de + '» a «' + y.a + '»?',
        font: { de: 'lean', ref: FONT.lean + ' (transport) · ' + FONT.allee + ' (anàlisi de creació de valor)' }, evidencia: { fluxos: [x.clau, y.clau], rols: [x.a] } })));

      /* 5.5 · Conscient: les persones i les relacions */
      Object.values(M.rols).filter(x => x.declarat && x.sortI >= 1 && x.entI === 0).forEach(x => S('sense-reconeixement', normNom(x.rol), { tipus: 'conscient', gravetat: 'mitjana', nivellRol: x.rol,
        que: '«' + x.rol + '» dona ' + x.sortI + ' intangible/s i no en rep cap.',
        perque: 'Qui dona coneixement, cura o confiança i només rep el que és exigible acaba sostenint sense que ningú li ho reconegui. És com plega la gent sense queixar-se.',
        pregunta: 'Què rep «' + x.rol + '» que no sigui un pagament o una obligació? Qui li diu que el que fa serveix?',
        font: { de: 'conscient', ref: FONT.conscient + ' · ' + FONT.allee + ' (anàlisi d\'impacte)' }, evidencia: { rols: [x.rol] } }));
      const maxI = Math.max(0, ...Object.values(M.rols).map(x => x.sortI));
      if (maxI >= 2) Object.values(M.rols).filter(x => x.sortI === maxI && x.sortI > x.entT + x.entI).forEach(x => S('sosteniment', normNom(x.rol), { tipus: 'conscient', gravetat: 'mitjana', nivellRol: x.rol,
        que: '«' + x.rol + '» és qui dona més intangibles (' + x.sortI + ') i rep menys del que dona (' + (x.entT + x.entI) + ').',
        perque: 'La xarxa s\'aguanta en part sobre un esforç que no consta: si aquest rol es cansa, es nota a tot arreu i ningú sabrà per què.',
        pregunta: 'Quant temps pot aguantar així «' + x.rol + '»? Què li hauria de tornar la xarxa?',
        font: { de: 'conscient', ref: FONT.conscient }, evidencia: { rols: [x.rol] } }));
      // Si encara no hi ha cap pas, o res del rol no és «sempre», ja ho diu «sense-seq»: no es multiplica per rol
      const ambPassos = pr.llista.some(p => p.passos.length);
      Object.values(M.rols).filter(x => ambPassos && x.declarat && x.sortI >= 1 && f.filter(y => y.de === x.rol).every(y => (m.seq || {})[y.clau] === 'sempre' || !hasOwn(m.seq, y.clau))
        && f.some(y => y.de === x.rol && (m.seq || {})[y.clau] === 'sempre'))
        .forEach(x => S('invisible', normNom(x.rol), { tipus: 'conscient', gravetat: 'baixa', nivellRol: x.rol,
          que: 'Res del que dona «' + x.rol + '» té un pas en cap procés: o passa «sempre» o no té lloc a la seqüència.',
          perque: 'El que no surt a cap procés no surt a cap pla, a cap carta del tauler ni a cap reconeixement. Els intangibles que passen «tot el temps» són justament els que cap diagrama de procés veu.',
          pregunta: 'Si «' + x.rol + '» ho deixés de fer, en quin moment es notaria?',
          font: { de: 'practica', ref: FONT.practica + ' · ' + FONT.conscient }, evidencia: { rols: [x.rol], fluxos: f.filter(y => y.de === x.rol).map(y => y.clau) } }));
      (m.pairs || []).forEach(p => { if (p[2] === 'tangible' && p[4] === 'tangible' && p[3] && p[5]) S('nomes-contracte', [p[0], p[1]].map(normNom).sort(per).join('|'), { tipus: 'conscient', gravetat: 'baixa',
        que: 'Entre «' + p[0] + '» i «' + p[1] + '» tot és contracte: «' + p[3] + '» i «' + p[5] + '».',
        perque: 'Una relació sense cap intangible no té res que la cuidi: s\'aguanta mentre surti a compte.',
        pregunta: 'Què es diuen, o què es podrien dir, que no consti al contracte?', font: { de: 'allee', ref: FONT.allee + ' (les dues menes) · ' + FONT.conscient }, evidencia: { parells: [[p[0], p[1]]] } }); });

      /* 5.6 · El zoom: el mapa de dins i les portes amb el de fora */
      if (prof && nv.pare) {
        const R = cami[cami.length - 1], fora = fluxos(nv.pare).filter(x => x.de === R || x.a === R), portes = m0.portes || {};
        const noms = new Set((m0.roles || []).map(normNom));
        const sense = fora.filter(x => { const k = Object.keys(portes).find(pk => clauN(pk) === clauN(x.clau)); return !k || !noms.has(normNom(portes[k])); });
        if (fora.length && sense.length) S('sense-porta', 'portes', { tipus: 'casa', gravetat: Object.keys(portes).length ? 'baixa' : 'nota',
          que: sense.length + ' de ' + fora.length + ' lliuraments de fora de «' + R + '» no diuen qui els rep o els dona a dins.',
          perque: 'El zoom serveix si es veu per quin rol de dins entra i surt cada cosa: si no, el mapa de dins és un altre mapa i no aquest node obert.',
          pregunta: 'Qui de dins rep «' + sense[0].q + '»?', font: { de: 'casa', ref: FONT.practica + ' (el zoom per nivells) · lligar-ho amb portes és de la casa' }, evidencia: { fluxosPare: sense.map(x => x.clau) } });
      }
      return { cami, capa, revisio: rv, metriques: M, conversions: conv };
    }

    function diagDesviacio(real, ideal, cami) {
      const D = desviacio(real, ideal), out = [{ cami, ...D }];
      const S = (codi, subj, camps) => posa(mk(codi, 'desviacio', cami, subj, camps));
      const trob = (real.troballes || []).map(t => normNom((t.t || '') + ' ' + (t.d || '')));
      D.rols.falten.forEach(r => { const dita = trob.some(t => t.includes(normNom(r)));
        const amb = D.fluxos.falten.filter(x => x.de === r || x.a === r).length;
        S('rol-falta', normNom(r), { tipus: 'metode', gravetat: dita ? 'baixa' : 'mitjana', nivellRol: r,
          que: 'L\'ideal preveu «' + r + '» i al real no hi és' + (amb ? ', i amb ell ' + amb + ' lliurament/s' : '') + '.' + (dita ? ' Ja és a les troballes.' : ''),
          perque: 'Un rol que falta és feina que o no es fa o la fa algú sense que consti. No es dibuixa com si hi fos: es diu.',
          pregunta: 'Qui fa avui el que l\'ideal posa a «' + r + '»? Si no ho fa ningú, és la troballa: «aquest node avui no és de ningú».',
          font: { de: 'practica', ref: FONT.practica + ' (pregunta 3: «qui hi hauria de sortir i no hi surt?») · la comparació amb l\'ideal és de la casa' }, evidencia: { rols: [r] } }); });
      D.rols.propis.forEach(r => S('rol-propi', normNom(r), { tipus: 'casa', gravetat: 'nota', nivellRol: r,
        que: '«' + r + '» és propi: l\'ideal no el preveu.', perque: 'No és una desviació a corregir: és el vostre cas. Pot ser una particularitat que funciona, i llavors és l\'ideal qui l\'hauria d\'incorporar.',
        pregunta: 'És una manera vostra que funciona, o una feina que es podria fer des d\'un altre rol?', font: { de: 'casa', ref: FONT.casa + ' (Baula 1: «el que el real té i l\'ideal no és propi»)' }, evidencia: { rols: [r] } }));
      const fv = D.fluxos.falten.filter(x => !x.perRol);
      const parF = {}; fv.forEach(x => { const k = [x.de, x.a].sort(per).join('|'); (parF[k] = parF[k] || []).push(x); });
      Object.keys(parF).sort(per).forEach(k => S('flux-falta', k, { tipus: parF[k].some(x => x.mena === 'intangible') ? 'conscient' : 'casa', gravetat: 'mitjana',
        que: 'L\'ideal preveu ' + parF[k].map(x => fl(x) + ' «' + x.q + '» (' + x.mena + ')').join(' i ') + ', i al real no hi és.',
        perque: parF[k].some(x => x.mena === 'intangible') ? 'El que falta és sobretot el que no es factura: la part de la relació que el mapa existeix per fer sortir.' : 'El que falta és exigible: algú l\'espera i avui no li arriba per aquest camí.',
        pregunta: 'Passa d\'una altra manera, o no passa?', font: { de: 'casa', ref: FONT.casa + ' (desviació: diferència entre dos grafs)' }, evidencia: { fluxosIdeal: parF[k].map(x => x.clau) } }));
      D.fluxos.sobren.forEach(x => S('flux-sobra', x.clau, { tipus: 'eficient', gravetat: 'mitjana',
        que: fl(x) + ' «' + x.q + '» encara hi és, i l\'ideal vol que deixi de passar.', perque: 'És el que el model ideal ha decidit treure: un traspàs, una revisió o una espera.',
        pregunta: 'Què caldria perquè deixés de caldre?', font: { de: 'casa', ref: FONT.casa + ' (llista «treu» de l\'ideal)' }, evidencia: { fluxos: [x.clau] } }));
      if (D.fluxos.propies.length) S('fluxos-propis', 'f', { tipus: 'casa', gravetat: 'nota',
        que: D.fluxos.propies.length + ' lliurament/s propis que l\'ideal no preveu: ' + D.fluxos.propies.slice(0, 3).map(x => fl(x)).join(', ') + '.',
        perque: 'Propi no vol dir sobrer: és el que el vostre cas té i el model no.', pregunta: 'N\'hi ha algun que l\'ideal hauria d\'incorporar?',
        font: { de: 'casa', ref: FONT.casa }, evidencia: { fluxos: D.fluxos.propies.map(x => x.clau) } });
      D.fluxos.canviMena.forEach(x => S('canvi-mena', x.clau, { tipus: x.sentit === 'conversio' ? 'metode' : 'conscient', gravetat: x.sentit === 'conversio' ? 'mitjana' : 'baixa', mirada: x.sentit === 'conversio' ? 'creacio' : null,
        que: x.sentit === 'conversio' ? fl(x) + ': avui «' + x.real.q + '» es dona (intangible) i l\'ideal el converteix en «' + x.ideal.q + '» (tangible).' : fl(x) + ': avui «' + x.real.q + '» és exigible (tangible) i l\'ideal el deixa com a relació (intangible).',
        perque: x.sentit === 'conversio' ? 'És la conversió de valor prevista: un intangible que passa a una forma negociable. Fins que un altre rol l\'accepta, és una oferta.' : 'Treure una cosa del contracte la fa dependre de la confiança: pot alleugerir o pot fer-la desaparèixer.',
        pregunta: x.sentit === 'conversio' ? 'Qui l\'acceptaria, i en quina forma?' : 'Què la sostindrà quan ningú la pugui reclamar?',
        font: { de: 'allee', ref: FONT.allee + (x.sentit === 'conversio' ? ' (conversió de valor)' : ' (tangible o intangible el decideix el contracte)') }, evidencia: { fluxos: [x.clau] }, canvi: x }));
      D.fluxos.invertits.forEach(x => S('sentit-invertit', x.parella.map(normNom).sort(per).join('|'), { tipus: 'metode', gravetat: 'mitjana',
        que: x.per === 'entregable' ? '«' + x.ideal.q + '» va al revés: l\'ideal el fa anar de «' + x.ideal.clau.split('→')[0] + '» a «' + x.ideal.clau.split('→')[1] + '» i al real va de «' + x.real.clau.split('→')[0] + '» a «' + x.real.clau.split('→')[1] + '».' : 'Entre «' + x.parella[0] + '» i «' + x.parella[1] + '» s\'ha invertit qui dona el tangible.',
        perque: 'Qui dona i qui rep decideix qui pot reclamar què. Un sentit invertit sol ser una relació on la iniciativa és de l\'altra banda.',
        pregunta: 'Qui ho demana avui, i qui ho hauria de donar sense que li ho demanin?', font: { de: 'allee', ref: FONT.allee + ' (la transacció té direcció)' }, evidencia: { fluxos: uniq((x.reals || [x.real]).map(y => y.clau)), fluxosIdeal: [x.ideal.clau] } }));
      const sq = {}; D.seq.forEach(s => { (sq[s.tipus] = sq[s.tipus] || []).push(s); });
      Object.keys(sq).sort(per).forEach(t => S('seq-' + t.replace('→', '-a-'), t, { tipus: /sempre/.test(t) ? 'conscient' : 'agil', gravetat: 'baixa',
        que: sq[t].length + ' lliurament/s passen en un altre moment que a l\'ideal (' + ({ 'sempre→pas': 'avui «sempre», l\'ideal li dona un pas', 'pas→sempre': 'avui en un pas, l\'ideal el vol continu', 'cap→pas': 'avui sense pas, l\'ideal n\'hi dona un', 'cap→sempre': 'avui sense lloc, l\'ideal el vol continu', proces: 'en un altre procés', pas: 'en un altre pas' }[t] || t) + '): ' + sq[t].slice(0, 3).map(s => s.clau).join(', ') + '.',
        perque: t === 'sempre→pas' ? 'Donar-li un moment el fa visible i planificable.' : t === 'pas→sempre' ? 'Hi ha relacions que no s\'haurien d\'esperar a un pas.' : 'L\'ordre decideix qui espera qui.',
        pregunta: 'L\'ordre del real respon a una raó, o a com ha anat sortint?', font: { de: 'practica', ref: FONT.practica + ' (la seqüència)' }, evidencia: { fluxos: sq[t].map(s => s.clau) } }));
      const nomR = id => ((real.processos || []).find(x => x.id === id) || {}).nom || id;
      const propiTxt = l => 've de ' + l.slice(0, 3).join(', ') + (l.length === 1 ? ', que és propi' : ', que són propis');
      D.processos.filter(p => p.real && p.traspassos.real > p.traspassos.ideal).forEach(p => {
        const tp = p.traspassos, perPropi = tp.comuns <= tp.ideal && tp.propis.length > 0;
        S('mes-traspassos', p.real, { tipus: 'eficient', gravetat: perPropi ? 'nota' : 'mitjana',
          que: '«' + nomR(p.real) + '» fa ' + tp.real + ' traspassos tangibles en ' + p.passos.real + ' passos; l\'ideal, ' + tp.ideal + ' en ' + p.passos.ideal + '.'
            + (perPropi ? ' La diferència ' + propiTxt(tp.propis.map(x => '«' + x.q + '» (' + fl(x) + ')')) + '.' : ''),
          perque: perPropi ? 'El que és propi és el vostre cas, no una desviació a corregir. Només val la pena mirar si aquell traspàs hi afegeix alguna cosa.'
            : 'Cada traspàs d\'un tangible és una cua i una ocasió de perdre informació. No és un temps: és el nombre de mans per on passa. Els intangibles no hi compten.',
          pregunta: perPropi ? 'Aquest traspàs propi hi afegeix valor, o l\'ideal l\'hauria de tenir també?' : 'Quins traspassos de més es podrien estalviar?',
          font: { de: 'lean', ref: FONT.lean + ' (traspassos) · comptar-los sobre el que tots dos mapes tenen és de la casa' }, evidencia: { proces: p.real, fluxos: perPropi ? tp.propis.map(x => x.clau) : [] } });
      });
      D.processos.filter(p => !p.real).forEach(p => S('proces-falta', p.ideal, { tipus: 'casa', gravetat: 'baixa',
        que: 'L\'ideal té el procés «' + (((ideal.processos || []).find(x => x.id === p.ideal) || {}).nom || p.ideal) + '» i el real no.',
        perque: 'L\'ideal hi preveu una via més. Pot ser que passi i no s\'hagi seqüenciat, o que avui no passi.', pregunta: 'Passa, i no l\'heu seqüenciat, o no passa?',
        font: { de: 'casa', ref: FONT.casa + ' (comparació amb l\'ideal)' }, evidencia: {} }));
      const H = D.metriques.hub;
      if (!H.mateix) {
        const llista = a => a.map(r => '«' + r + '»').join(' i '), propisHub = D.fluxos.propies.filter(x => H.reals.includes(x.de) || H.reals.includes(x.a));
        S('centre-diferent', 'hub', { tipus: 'casa', gravetat: H.perPropi ? 'nota' : 'mitjana',
          que: 'Al real, la xarxa gravita sobre ' + llista(H.reals) + '; a l\'ideal, sobre ' + llista(H.ideals) + '.'
            + (H.perPropi && propisHub.length ? ' La diferència ' + propiTxt(propisHub.map(x => '«' + x.q + '» (' + fl(x) + ')')) + '.' : ''),
          perque: H.perPropi ? 'Sense el que és propi, el centre és el mateix: és el vostre cas, no una desviació a corregir.'
            : 'On gravita la xarxa decideix qui té la informació i qui fa d\'embut.',
          pregunta: 'Per què avui gravita sobre ' + llista(H.reals) + ' i l\'ideal sobre ' + llista(H.ideals) + '?',
          font: { de: 'casa', ref: FONT.casa + ' (comparació amb l\'ideal) · ' + FONT.allee + ' (anàlisi d\'intercanvi)' }, evidencia: { rols: H.reals } });
      }
      D.collsNous.forEach(r => S('coll-nou', normNom(r), { tipus: 'agil', gravetat: 'mitjana', nivellRol: r,
        que: '«' + r + '» és un coll d\'ampolla al real i a l\'ideal no.', perque: 'Sense «' + r + '», a l\'ideal els mateixos rols queden lligats per un altre camí; al real, no.',
        pregunta: 'Quin vincle de l\'ideal falta perquè no tot hagi de passar per «' + r + '»?', font: { de: 'xarxes', ref: FONT.xarxes + ' · la comparació amb l\'ideal és de la casa' }, evidencia: { rols: [r] } }));
      // Zoom: recursió als nivells que tots dos tenen
      const dR = real.dins || {}, dI = ideal.dins || {}, nI = D._n.nI;
      Object.keys(dI).sort(per).forEach(ri => {
        const rr = Object.keys(dR).find(k => normNom(k) === nI(ri));
        if (!rr) { S('zoom-falta', normNom(ri), { tipus: 'metode', gravetat: 'nota', nivellRol: ri,
          que: 'L\'ideal obre «' + ri + '» per dins i el real encara no.', perque: 'El que l\'ideal veu a dins, el real encara no ho ha preguntat.',
          pregunta: 'Val la pena obrir aquest node a la propera sessió?', font: { de: 'practica', ref: FONT.practica + ' (zoom)' }, evidencia: { rols: [ri] } }); return; }
        if (cami.length < 6) out.push(...diagDesviacio(dR[rr], Object.assign({ alies: ideal.alies }, dI[ri]), cami.concat([rr])));
      });
      return out;
    }

    // Ordre: gravetat, capa, tipus, nivell, id. Determinista.
    T.sort((a, b) => GR[b.gravetat] - GR[a.gravetat] || CAPA_ORDRE[a.capa] - CAPA_ORDRE[b.capa]
      || TIPUS_ORDRE[a.tipus] - TIPUS_ORDRE[b.tipus] || a.nivell.cami.length - b.nivell.cami.length || per(a.id, b.id));
    T.forEach(t => { if (t.nivellRol) { t.nivell.rol = t.nivellRol; delete t.nivellRol; } t.resalta = resalta(t); if (!t.mirada) t.mirada = MIRADA[t.codi] || null; });
    const real0 = nivellsReal[0];
    const comp = k => { const r = {}; T.forEach(t => { r[t[k]] = (r[t[k]] || 0) + 1; }); return r; };
    return { versio: 1, provisional: !real0.revisio.passa,
      nivells: nivellsReal, ideal: nivellsIdeal.length ? nivellsIdeal : null, desviacio: desv.length ? desv : null,
      troballes: T, resum: { total: T.length, perGravetat: comp('gravetat'), perTipus: comp('tipus'), perCapa: comp('capa'),
        primeres: primeres(T) } };
  }

  /* Les tres per començar: les més greus, però cadascuna d'un codi diferent */
  function primeres(T) {
    const out = [], vist = new Set();
    T.filter(t => t.capa !== 'ideal').forEach(t => { if (out.length < 3 && !vist.has(t.codi)) { vist.add(t.codi); out.push(t.id); } });
    return out;
  }
  const MIRADA = { 'cul-de-sac': 'intercanvi', 'coll-ampolla': 'intercanvi', 'nomes-tangible': 'intercanvi', 'nomes-intangible': 'intercanvi',
    'gomet-baix': 'impacte', 'percepcio-dividida': 'impacte', 'sense-reconeixement': 'impacte', sosteniment: 'impacte', conversio: 'creacio', pont: 'creacio', 'sense-gomets': 'impacte', redundant: 'impacte' };
  const PREG_REGLA = {
    abast: 'De quina activitat parlem, i on s\'acaba?', rols: 'Qui hi participa, dit pel que fa? Si no hi cap, quin nivell estem dibuixant?',
    menes: 'Què s\'ofereix que no es factura: avisos, favors, coneixement, accés, confiança?', reciprocitat: 'Què torna? Si de debò no torna res, digueu-ho com a troballa.',
    solts: 'Què dona i què rep aquest rol? Si no res, és un rol o una decoració?', densitat: 'Quines relacions caldria començar, enfortir o reprendre?',
    concentracio: 'S\'optimitza el sistema sencer, o tot passa per un sol rol?', xifres: 'D\'on surt aquest número, i el pot refer la casa amb els seus?',
    noms: 'Què fa aquesta persona o empresa a l\'activitat? Aquest és el rol.', processos: 'Quins altres camins habituals hi ha? I què passa tot el temps?' };

  /* ── 5b · Els patrons de la seqüència ─────────────────────────────────
     El que es repeteix en l'ordre dels lliuraments, i el flux concret que en
     surt. No és cap regla: és una lectura que ajuda a veure el recorregut.
     · El fil: començant pel pas 1, el lliurament que continua qui acaba de
       rebre. És el recorregut de debò que fa el valor, i el que es mostra.
     · Relleus: lliuraments que fa qui acaba de rebre, sobre tots els que no
       són del primer pas. Un relleu baix vol dir que el valor salta de mans.
     · Compartits: dos lliuraments seguits (A→B i B→C) que es repeteixen en
       més d'un procés. És la peça que es pot dissenyar una vegada.
     · Amb ideal, el mateix procés de l'ideal al costat: passos, traspassos
       tangibles i els rols del fil que l'ideal s'estalvia o afegeix.
     Funció pura: no muta el que rep. */
  function filDe(p) {
    if (!p.passos.length) return { claus: [], rols: [], trencs: [], talls: [] };
    const claus = [], rols = [], trencs = [], talls = [];
    let ara = p.passos[0].fluxos.slice(0, 1);
    ara.forEach(x => { claus.push(x.clau); rols.push(x.de, x.a); });
    for (let k = 1; k < p.passos.length; k++) {
      const reben = new Set(ara.map(x => x.a)), seg = p.passos[k].fluxos.filter(x => reben.has(x.de));
      /* Si ningú continua el que acaba de rebre, el fil no s'acaba: salta de
         mans, i aquell pas queda marcat com a trenc */
      const x = (seg.length ? seg : p.passos[k].fluxos)[0];
      if (!seg.length) { trencs.push(p.passos[k].pas); talls.push(rols.length); rols.push(x.de); }
      ara = [x];
      claus.push(x.clau); rols.push(x.a);
    }
    return { claus, rols, trencs, talls };
  }
  function patrons(m, mIdeal) {
    const P = processos(m).llista.filter(p => p.passos.length), PI = mIdeal ? processos(mIdeal).llista : [];
    const bigrames = {};
    const llista = P.map(p => {
      let relleus = 0, total = 0;
      for (let k = 1; k < p.passos.length; k++) {
        const reben = new Set(p.passos[k - 1].fluxos.map(x => x.a));
        p.passos[k].fluxos.forEach(x => {
          total++;
          if (reben.has(x.de)) relleus++;
          p.passos[k - 1].fluxos.filter(y => y.a === x.de).forEach(y => {
            const c = [y.de, y.a, x.a].map(normNom).join('→');
            const b = bigrames[c] = bigrames[c] || { rols: [y.de, y.a, x.a], processos: [], claus: [] };
            if (!b.processos.includes(p.id)) b.processos.push(p.id);
            b.claus = uniq(b.claus.concat([y.clau, x.clau]));
          });
        });
      }
      const fil = filDe(p), tang = p.passos.flatMap(st => st.fluxos).filter(x => x.mena === 'tangible').length;
      let ideal = null;
      const qi = PI.find(x => normNom(x.id) === normNom(p.id) && x.passos.length);
      if (qi) {
        const fi = filDe(qi), nr = new Set(fil.rols.map(normNom)), ni = new Set(fi.rols.map(normNom));
        ideal = { passos: qi.passos.length, traspassos: qi.passos.flatMap(st => st.fluxos).filter(x => x.mena === 'tangible').length, fil: fi,
          estalvia: uniq(fil.rols.filter(r => !ni.has(normNom(r)))), afegeix: uniq(fi.rols.filter(r => !nr.has(normNom(r)))) };
      }
      return { id: p.id, nom: p.nom, passos: p.passos.length, traspassos: tang, relleus, total, fil,
        cicle: p.retorn.length > 0, coll: p.coll.slice(), forats: p.forats.slice(), salts: p.salts.map(x => x.pas), reentrades: p.reentrades.slice(), ideal };
    });
    const compartits = Object.values(bigrames).filter(b => b.processos.length > 1)
      .sort((a, b) => b.processos.length - a.processos.length || per(a.rols.join('→'), b.rols.join('→')));
    return { llista, compartits };
  }

  /* ── 6 · Què ressalta cada troballa al llenç ───────────────────────────── */
  const RECEPTA = {
    'regla-reciprocitat': { anima: 'atura', fantasma: 'tornada' }, 'regla-solts': { anima: null, nodeEstil: 'solt' },
    'regla-concentracio': { anima: 'batec' }, 'regla-densitat': { anima: null, fantasma: 'regions' },
    'regla-menes': { anima: 'filtra-intangible' }, 'regla-processos': { anima: 'atura' },
    'cul-de-sac': { anima: 'batec' }, 'coll-ampolla': { anima: 'encalla' }, 'coll-proces': { anima: 'recorre' },
    'punt-unic': { anima: 'encalla' }, espera: { anima: 'recorre', pausa: true }, 'forat-pas': { anima: 'recorre', pausa: true },
    reentrada: { anima: 'recorre' }, 'sense-retorn': { anima: 'recorre', fantasma: 'retorn' }, duplicat: { anima: 'batec' }, redundant: { anima: 'batec' }, pont: { anima: 'recorre' },
    'sense-reconeixement': { anima: 'batec' }, sosteniment: { anima: 'batec' }, invisible: { anima: 'sempre' }, 'nomes-contracte': { anima: null },
    'nomes-tangible': { anima: null }, 'nomes-intangible': { anima: null }, conversio: { anima: 'conversio' }, 'gomet-baix': { anima: 'atura' },
    'percepcio-dividida': { anima: null }, 'sense-seq': { anima: 'atura' }, 'seq-orfena': { anima: null }, 'rol-no-declarat': { anima: null },
    'rol-falta': { fantasma: 'node' }, 'rol-propi': { insignia: 'propi' }, 'flux-falta': { fantasma: 'aresta' }, 'flux-sobra': { anima: 'atura' },
    'canvi-mena': { fantasma: 'mena' }, 'sentit-invertit': { fantasma: 'sentit' }, 'mes-traspassos': { anima: 'recorre' },
    'coll-nou': { anima: 'encalla' }, 'centre-diferent': { anima: 'batec' }, 'zoom-falta': { insignia: 'zoom' }, 'sense-porta': { fantasma: 'porta' },
    fil: { anima: 'recorre' }, 'patro-compartit': { anima: 'batec' }
  };
  function resalta(t) {
    const e = t.evidencia || {}, r = RECEPTA[t.codi] || RECEPTA[t.codi.replace(/^seq-.*/, 'sense-seq')] || {};
    const arestes = (e.fluxos || []).concat((e.parells || []).flatMap(p => [p[0] + '→' + p[1], p[1] + '→' + p[0]]));
    return { vista: t.capa === 'desviacio' ? 'desviacio' : t.capa, cami: t.nivell.cami, focus: true,
      nodes: uniq((e.rols || []).concat(e.queden || [])), arestes: uniq(arestes), arestesIdeal: e.fluxosIdeal || [], arestesPare: e.fluxosPare || [],
      proces: e.proces || null, passos: e.passos || null, estil: 'dg-' + t.gravetat, glif: { alta: '!!', mitjana: '!', baixa: '?', nota: 'i' }[t.gravetat],
      anima: r.anima || null, fantasma: r.fantasma || null, insignia: r.insignia || null, pausa: !!r.pausa,
      queden: e.queden || [], regions: e.regions || [], tipus: 'dg-t-' + t.tipus };
  }

  return { normNom, metriques, processos, patrons, estructura, conversions, desviacio, nivells, diagnostica, resalta, FONT };
}
/*/VS-DIAG*/
/*VS-MODEL*/
/* ── El model de l'editor ──────────────────────────────────────────────────
 * El text, l'arbre de nivells, les operacions, la geometria i l'escena.
 * Escrit a mà i provat a SOS/tests/test-vna-motor.mjs.
 *
 * El que dibuixa i el que s'escriu són el mateix model: cada nivell guarda els
 * seus sis textos tal com s'han escrit, i una operació del dibuix torna un
 * nivell nou on **només canvia la línia que toca**. Les altres línies queden
 * igual, amb els seus espais i les seves línies a mig escriure: un forat
 * visible es corregeix, i una línia reescrita per sorpresa no la troba ningú.
 *
 * Funcions pures: cap DOM, cap data, cap atzar, i no muta el que rep. */
function creaModel(dep) {
  const { fluxos, normNom } = dep;
  const CAMPS = ['abast', 'rols', 'parells', 'processos', 'seq', 'troballes'];
  const MAX_PROF = 6, R = 32, DMIN = 2.6 * R;
  const per = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  const uniq = a => [...new Set(a)];
  const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o || {}, k);
  const esObj = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const clona = x => JSON.parse(JSON.stringify(x));
  const curt = (s, n) => { const x = String(s == null ? '' : s), m = n || 24; return x.length > m ? x.slice(0, m - 1).trimEnd() + '…' : x; };
  const unio = a => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' i ' + a[a.length - 1]);
  const deN = k => (k === 1 || k === 11 ? 'd\'' : 'de ') + k;
  const pl = (n, s, p) => n + ' ' + (n === 1 ? s : p);
  const clauN = k => { const p = String(k).split('→'); return p.length === 2 ? normNom(p[0]) + '→' + normNom(p[1]) : String(k); };
  const partClau = k => { const p = String(k == null ? '' : k).split('→'); return p.length === 2 ? p : [null, null]; };

  /* ══ 1 · TEXT ══════════════════════════════════════════════════════════════
     Una línia no buida és un element. `i` és la posició entre les no buides
     (la mateixa que fa servir la lectura) i `raw`, la línia real del camp. */
  function liniesText(text) {
    const out = []; let i = 0;
    String(text == null ? '' : text).split('\n').forEach((l, raw) => { const txt = l.trim(); if (txt) out.push({ i: i++, raw, txt }); });
    return out;
  }
  const linies = t => liniesText(t).map(x => x.txt);
  const campsLinia = txt => String(txt == null ? '' : txt).split('|').map(x => x.trim());
  const menaDe = x => /^i/i.test(String(x == null ? '' : x).trim()) ? 'intangible' : 'tangible';
  const menaCurta = x => /^i/i.test(x || '') ? 'i' : x ? 't' : '';

  /* La lectura dels sis camps: el cos de `llegeix()` de sempre, sense el DOM. */
  function llegeixTextos(t) {
    const x = t || {};
    const m = { abast: String(x.abast == null ? '' : x.abast).trim(), roles: linies(x.rols) };
    m.pairs = linies(x.parells).map(l => {
      const c = campsLinia(l);
      return [c[0] || '', c[1] || '', c[2] ? menaDe(c[2]) : '', c[3] || '', c[4] ? menaDe(c[4]) : '', c[5] || ''];
    });
    m.processos = linies(x.processos).map(l => { const c = campsLinia(l); return { id: c[0] || '', nom: c[1] || '', d: c[2] || '' }; });
    m.seq = {};
    linies(x.seq).forEach(l => {
      const c = campsLinia(l);
      if (!c[0]) return;
      m.seq[c[0]] = (c[1] || '').toLowerCase() === 'sempre' ? 'sempre' : [c[1] || '', Number(c[2] || 1)];
    });
    m.troballes = linies(x.troballes).map(l => { const c = campsLinia(l); return { t: c[0] || '', d: c[1] || '' }; });
    return m;
  }

  /* El que `carrega()` escrivia als camps, amb els mateixos formats. Accepta
     `roles` o `rols`, `pairs` o `parells`, la seqüència com a objecte o com a
     llista, i processos i troballes com a text o com a objecte. */
  function aTextos(o) {
    const roles = o.roles || o.rols || [];
    const pairs = o.pairs || o.parells || [];
    const seq = o.seq || {};
    const linia = x => Array.isArray(x) ? x.join(' | ') : String(x);
    const t = {
      abast: o.abast || '',
      rols: roles.join('\n'),
      parells: pairs.map(p => typeof p === 'string' ? p
        : [p[0], p[1], menaCurta(p[2]), p[3], menaCurta(p[4]), p[5]].map(x => x || '').join(' | ')).join('\n'),
      processos: (o.processos || []).map(p => typeof p === 'string' ? p
        : [p.id, p.nom, p.d].map(x => x || '').join(' | ')).join('\n'),
      seq: (Array.isArray(seq) ? seq : Object.entries(seq).map(([k, v]) =>
        v === 'sempre' ? k + ' | sempre' : k + ' | ' + linia(v))).join('\n'),
      troballes: (o.troballes || []).map(x => typeof x === 'string' ? x
        : [x.t, x.d].map(y => y || '').join(' | ')).join('\n')
    };
    /* El que el navegador faria igualment en assignar-ho a un camp: un <input>
       no guarda salts de línia, i un <textarea> els torna sempre com a \n. */
    CAMPS.forEach(k => { t[k] = String(t[k]).replace(/\r\n?/g, '\n'); });
    t.abast = t.abast.replace(/\n/g, '');
    return t;
  }

  function posaLinia(text, i, nova) {
    const s = String(text == null ? '' : text), L = s.split('\n'), ls = liniesText(s);
    if (i < ls.length) { L[ls[i].raw] = nova; return L.join('\n'); }
    if (!ls.length) return nova;
    L.splice(ls[ls.length - 1].raw + 1, 0, nova);
    return L.join('\n');
  }
  function treuLinia(text, i) {
    const s = String(text == null ? '' : text), L = s.split('\n'), ls = liniesText(s);
    if (i < 0 || i >= ls.length) return s;
    L.splice(ls[i].raw, 1);
    return L.join('\n');
  }
  function mouLinia(text, i, delta) {
    const s = String(text == null ? '' : text), L = s.split('\n'), ls = liniesText(s), j = i + delta;
    if (i < 0 || i >= ls.length || j < 0 || j >= ls.length || i === j) return s;
    const x = L[ls[i].raw]; L[ls[i].raw] = L[ls[j].raw]; L[ls[j].raw] = x;
    return L.join('\n');
  }

  /* Un nom que es dibuixa s'ha de poder escriure: la barra separa camps i la
     fletxa separa els dos rols d'una clau. `fletxa` i `buit` afluixen la regla
     per al que no és un nom de rol (un entregable, una troballa). */
  function netejaNom(s, opc) {
    const o = opc || {}, x = String(s == null ? '' : s);
    if (/[\r\n]/.test(x)) return { nom: '', error: 'Va en una sola línia: el salt de línia separa elements al text' };
    if (!o.fletxa && x.includes('→')) return { nom: '', error: 'La fletxa «→» separa els dos rols a la seqüència: no pot anar dins d\'un nom' };
    let nom = x.trim(), avis;
    if (nom.includes('|')) { nom = nom.replace(/\|/g, '/').trim(); avis = 'La barra vertical separa camps al text; l\'he canviat per «/»'; }
    if (!nom && !o.buit) return { nom: '', error: 'Falta el nom' };
    return avis ? { nom, avis } : { nom };
  }
  function idProces(nom, existents) {
    const ex = new Set((existents || []).map(String));
    const base = normNom(nom).replace(/\s+/g, '-') || 'proces';
    if (!ex.has(base)) return base;
    for (let k = 2; ; k++) if (!ex.has(base + '-' + k)) return base + '-' + k;
  }

  /* ══ 2 · L'ARBRE ═══════════════════════════════════════════════════════════
     Nivell = {t: els sis textos, pos, gomets, dins: {Rol: Nivell}, portes,
     externs?, alies?, treu?}. Arbre = {real, ideal|null}. Lloc = {vista, cami}.
     `externs` diu quins rols no són de la casa (client, proveïdor, entorn). */
  function nivellBuit() {
    return { t: { abast: '', rols: '', parells: '', processos: '', seq: '', troballes: '' }, pos: {}, gomets: {}, dins: {}, portes: {} };
  }
  const ambText = (n, camp, text) => Object.assign({}, n, { t: Object.assign({}, n.t, { [camp]: text }) });

  function rolsDelNivell(n) {
    const lin = linies(n.t.rols), declarats = [], repetits = [];
    lin.forEach((nom, i) => { if (declarats.includes(nom)) repetits.push({ nom, i }); else declarats.push(nom); });
    const noDeclarats = [];
    linies(n.t.parells).forEach(l => {
      const c = campsLinia(l);
      [c[0], c[1]].forEach(r => { if (r && !declarats.includes(r) && !noDeclarats.includes(r)) noDeclarats.push(r); });
    });
    return { declarats, noDeclarats, tots: declarats.concat(noDeclarats), repetits };
  }

  function fluxosAmbLinia(n) {
    const out = [];
    liniesText(n.t.parells).forEach(({ i, raw, txt }) => {
      const c = campsLinia(txt), de = c[0] || '', a = c[1] || '';
      [[de, a, c[2], c[3], 0], [a, de, c[4], c[5], 1]].forEach(([x, y, mm, q, costat]) => {
        const mena = mm ? menaDe(mm) : '', qq = q || '';
        out.push({ clau: x + '→' + y, de: x, a: y, mena, q: qq, li: i, raw, costat,
          estat: mena && qq ? 'ple' : mena ? 'sensenom' : qq ? 'sensemena' : 'buit' });
      });
    });
    return out;
  }

  function orfes(n) {
    const tots = new Set(rolsDelNivell(n).tots);
    return uniq(Object.keys(n.dins || {}).concat(Object.keys(n.pos || {}))).filter(r => !tots.has(r));
  }

  function detectaReanomenat(abans, ara) {
    const A = Array.isArray(abans) ? abans : linies(abans), B = Array.isArray(ara) ? ara : linies(ara);
    if (A.length !== B.length) return null;
    const d = []; A.forEach((x, i) => { if (x !== B[i]) d.push(i); });
    if (d.length !== 1) return null;
    const de = A[d[0]], a = B[d[0]];
    if (A.includes(a) || B.includes(de)) return null;
    return { de, a };
  }

  function reanomenaClau(k, de, a) {
    const p = String(k).split('→');
    if (p.length !== 2) return k;
    return (p[0] === de ? a : p[0]) + '→' + (p[1] === de ? a : p[1]);
  }
  function reanomenaClaus(obj, de, a) {
    const o = {}; let canvi = false;
    Object.keys(obj || {}).forEach(k => { const k2 = reanomenaClau(k, de, a); if (k2 !== k) canvi = true; o[k2] = obj[k]; });
    return canvi ? o : (obj || {});
  }
  function mouClau(obj, de, a) {
    if (!hasOwn(obj, de) || hasOwn(obj, a)) return obj || {};
    const o = {}; Object.keys(obj).forEach(k => { o[k === de ? a : k] = obj[k]; });
    return o;
  }
  const reanomenaExterns = (ex, de, a) => (ex && ex.includes(de) && !ex.includes(a) ? ex.map(r => (r === de ? a : r)) : ex);
  function traslladaExtres(n, de, a) {
    const o = Object.assign({}, n, { pos: mouClau(n.pos, de, a), dins: mouClau(n.dins, de, a), gomets: reanomenaClaus(n.gomets, de, a) });
    if (n.externs) o.externs = reanomenaExterns(n.externs, de, a);
    return o;
  }

  /* Importar és tolerant: el que no es pot llegir es descarta i es compta. */
  function importa(o) {
    const ign = { pos: 0, dins: 0, profunditat: 0 };
    const gometBo = g => typeof g === 'number' && Number.isFinite(g) && g >= -2 && g <= 2;
    const nivellDe = (x, prof, tipus) => {
      const n = nivellBuit(); n.t = aTextos(x);
      const tots = rolsDelNivell(n).tots;
      if (x.pos !== undefined) {
        if (!esObj(x.pos)) ign.pos++;
        else Object.keys(x.pos).forEach(k => {
          const v = x.pos[k];
          if (tots.includes(k) && Array.isArray(v) && v.length >= 2 && Number.isFinite(+v[0]) && Number.isFinite(+v[1])) n.pos[k] = [+v[0], +v[1]];
          else ign.pos++;
        });
      }
      if (esObj(x.gomets)) Object.keys(x.gomets).forEach(k => {
        const v = x.gomets[k];
        if (gometBo(v)) n.gomets[k] = v;
        else if (Array.isArray(v) && v.length && v.every(gometBo)) n.gomets[k] = v.slice();
      });
      if (x.dins !== undefined) {
        if (!esObj(x.dins)) ign.dins++;
        else Object.keys(x.dins).forEach(k => {
          const v = x.dins[k];
          if (!esObj(v)) { ign.dins++; return; }
          if (prof + 1 > MAX_PROF) { ign.profunditat++; return; }
          try { n.dins[k] = nivellDe(v, prof + 1, 'dins'); } catch (e) { ign.dins++; }
        });
      }
      if (Array.isArray(x.externs)) { const ex = uniq(x.externs.filter(r => typeof r === 'string' && tots.includes(r))); if (ex.length) n.externs = ex; }
      if (tipus === 'dins') {
        const p = esObj(x.portes) ? x.portes : esObj(x.port) ? x.port : null;
        if (p) Object.keys(p).forEach(k => { if (typeof p[k] === 'string' && p[k]) n.portes[k] = p[k]; });
      }
      if (tipus === 'ideal') {
        n.alies = {}; n.treu = [];
        if (esObj(x.alies)) Object.keys(x.alies).forEach(k => { if (typeof x.alies[k] === 'string' && x.alies[k]) n.alies[k] = x.alies[k]; });
        if (Array.isArray(x.treu)) n.treu = uniq(x.treu.filter(k => typeof k === 'string' && k.split('→').length === 2));
      }
      return n;
    };
    const arbre = { real: nivellDe(o, 0, 'real'), ideal: null };
    if (esObj(o.ideal)) { try { arbre.ideal = nivellDe(o.ideal, 0, 'ideal'); } catch (e) { arbre.ideal = null; } }
    return { arbre, ignorats: ign };
  }

  const esMapaBuit = x => !x.abast && !x.roles.length && !x.pairs.length && !x.processos.length
    && !Object.keys(x.seq).length && !x.troballes.length && Object.keys(x).length === 6;

  /* Exportar és net: només surten els extres dels rols que hi són. Una xarxa
     de dins orfa es queda a l'arbre (desfer-ho la recupera) però no surt. */
  function exportaNivell(n) {
    const o = llegeixTextos(n.t), R = rolsDelNivell(n).tots;
    const pos = {}; R.forEach(r => { if (hasOwn(n.pos, r)) pos[r] = n.pos[r].slice(); });
    if (Object.keys(pos).length) o.pos = pos;
    const g = {};
    Object.keys(n.gomets || {}).forEach(k => {
      const p = partClau(k);
      if (p[0] !== null && R.includes(p[0]) && R.includes(p[1])) g[k] = Array.isArray(n.gomets[k]) ? n.gomets[k].slice() : n.gomets[k];
    });
    if (Object.keys(g).length) o.gomets = g;
    const d = {};
    R.forEach(r => { if (hasOwn(n.dins, r)) { const x = exportaNivell(n.dins[r]); if (!esMapaBuit(x)) d[r] = x; } });
    if (Object.keys(d).length) o.dins = d;
    const ex = (n.externs || []).filter(r => R.includes(r));
    if (ex.length) o.externs = ex;
    if (Object.keys(n.portes || {}).length) o.portes = Object.assign({}, n.portes);
    if (Object.keys(n.alies || {}).length) o.alies = Object.assign({}, n.alies);
    if ((n.treu || []).length) o.treu = n.treu.slice();
    return o;
  }
  function exporta(arbre) {
    const o = exportaNivell(arbre.real);
    if (arbre.ideal) o.ideal = exportaNivell(arbre.ideal);
    return o;
  }

  /* Els noms d'un camí es comparen normalitzats, amb els àlies de l'ideal: així
     un mateix camí serveix per al real i per a l'ideal. */
  function aliesN(arbre) {
    const al = {};
    Object.entries((arbre && arbre.ideal && arbre.ideal.alies) || {}).forEach(([k, v]) => { al[normNom(k)] = normNom(v); });
    return al;
  }
  function baixa(arrel, cami, arbre) {
    const al = aliesN(arbre), comu = s => { const x = normNom(s); return al[x] || x; };
    let n = arrel, pare = null; const keys = [];
    for (const nom of cami || []) {
      const d = n.dins || {};
      const k = hasOwn(d, nom) ? nom : Object.keys(d).find(x => comu(x) === comu(nom));
      if (k === undefined) break;
      pare = n; n = d[k]; keys.push(k);
    }
    return { n, pare, keys };
  }
  function resol(arbre, lloc) {
    const l = lloc || {}, vista = l.vista || 'real', cami = l.cami || [];
    const usaIdeal = vista === 'ideal' && !!arbre.ideal;
    const b = baixa(usaIdeal ? arbre.ideal : arbre.real, cami, arbre);
    const camiReal = usaIdeal ? baixa(arbre.real, cami, arbre).keys : b.keys;
    return { nivell: b.n, pare: b.pare, cami: b.keys, vista, existeix: b.keys.length === cami.length && (vista !== 'ideal' || usaIdeal), camiReal };
  }
  function substitueix(arbre, lloc, nou) {
    const vista = lloc && lloc.vista === 'ideal' && arbre.ideal ? 'ideal' : 'real';
    const keys = baixa(arbre[vista], (lloc && lloc.cami) || [], arbre).keys;
    const rec = (n, i) => i === keys.length ? nou
      : Object.assign({}, n, { dins: Object.assign({}, n.dins, { [keys[i]]: rec(n.dins[keys[i]], i + 1) }) });
    return Object.assign({}, arbre, { [vista]: rec(arbre[vista], 0) });
  }

  /* ══ 3 · LES OPERACIONS ════════════════════════════════════════════════════
     op(n, …) → {n, camps, linia?, nom, grup?, avis?, error?, conflicte?}.
     Amb error o conflicte, `n` és el nivell d'entrada sense cap canvi. */
  const RES = (n, camps, nom, x) => Object.assign({ n, camps, nom }, x || {});
  const ERR = (n, error) => ({ n, camps: [], nom: '', error });
  const ple6 = c => { const x = c.slice(); while (x.length < 6) x.push(''); return x; };
  const fesParell = c => ple6(c).join(' | ');
  const COLS = costat => (costat ? [4, 5] : [2, 3]);
  const linParells = n => liniesText(n.t.parells).map(x => Object.assign(x, { c: campsLinia(x.txt) }));
  function trobaCostat(n, clau) {
    const [de, a] = partClau(clau);
    if (de === null) return null;
    for (const l of linParells(n)) {
      if (l.c[0] === de && l.c[1] === a) return { l, costat: 0, de, a };
      if (l.c[0] === a && l.c[1] === de) return { l, costat: 1, de, a };
    }
    return null;
  }
  const fesSeq = (clau, v) => v === 'sempre' ? clau + ' | sempre' : clau + ' | ' + v[0] + ' | ' + v[1];
  const linSeq = text => liniesText(text).map(x => Object.assign(x, { c: campsLinia(x.txt) }));
  /* Escriu (o treu, amb v null) la seqüència d'un lliurament. Mana l'última
     línia amb aquella clau, que és la que llegeix la lectura. */
  function posaSeq(text, clau, v) {
    const ls = linSeq(text).filter(x => x.c[0] === clau);
    if (v == null) { let t = text; ls.slice().reverse().forEach(x => { t = treuLinia(t, x.i); }); return t; }
    if (ls.length) return posaLinia(text, ls[ls.length - 1].i, fesSeq(clau, v));
    return posaLinia(text, liniesText(text).length, fesSeq(clau, v));
  }
  function canviaClausSeq(text, f) {
    let t = text;
    linSeq(text).forEach(x => { const k2 = f(x.c[0]); if (k2 !== x.c[0]) { const c = x.c.slice(); c[0] = k2; t = posaLinia(t, x.i, c.join(' | ')); } });
    return t;
  }
  /* Els passos d'un procés tornen a ser 1…n, i el que passa alhora segueix alhora. */
  function compactaProces(text, id) {
    const s = llegeixTextos({ seq: text }).seq, num = {};
    Object.keys(s).forEach(k => { if (Array.isArray(s[k]) && s[k][0] === id) num[k] = s[k][1]; });
    const vals = uniq(Object.values(num)).sort((a, b) => a - b), map = {};
    vals.forEach((v, i) => { map[v] = i + 1; });
    let t = text, canvi = false;
    Object.keys(num).forEach(k => { if (map[num[k]] !== num[k]) { t = posaSeq(t, k, [id, map[num[k]]]); canvi = true; } });
    return { text: t, canvi, n: vals.length };
  }

  function opAbast(n, text) {
    const t = String(text == null ? '' : text).replace(/[\r\n]+/g, ' ');
    if (t === n.t.abast) return RES(n, [], 'escriure l\'abast');
    return RES(ambText(n, 'abast', t), ['abast'], 'escriure l\'abast', { linia: { camp: 'abast', i: 0 } });
  }

  function opRol(n, nom, pos) {
    const k = netejaNom(nom);
    if (k.error) return ERR(n, k.error);
    if (rolsDelNivell(n).declarats.some(r => normNom(r) === normNom(k.nom))) return ERR(n, 'Ja hi ha un rol que es diu així');
    const i = liniesText(n.t.rols).length;
    let nou = ambText(n, 'rols', posaLinia(n.t.rols, i, k.nom));
    if (Array.isArray(pos) && Number.isFinite(+pos[0]) && Number.isFinite(+pos[1]))
      nou = Object.assign({}, nou, { pos: Object.assign({}, n.pos, { [k.nom]: [Math.round(+pos[0]), Math.round(+pos[1])] }) });
    return RES(nou, ['rols'], 'crear el rol «' + curt(k.nom) + '»', { linia: { camp: 'rols', i }, avis: k.avis, rol: k.nom });
  }

  function opReanomenaRol(n, vell, nouNom) {
    const k = netejaNom(nouNom);
    if (k.error) return ERR(n, k.error);
    const nou = k.nom, R = rolsDelNivell(n);
    if (!R.tots.includes(vell)) return ERR(n, 'No hi ha cap rol «' + vell + '» en aquest nivell');
    if (nou === vell) return RES(n, [], 'reanomenar');
    if (R.tots.some(r => r !== vell && normNom(r) === normNom(nou))) return ERR(n, 'Ja hi ha un rol que es diu així');
    const t = Object.assign({}, n.t), camps = [];
    let rt = t.rols;
    liniesText(t.rols).forEach(x => { if (x.txt === vell) rt = posaLinia(rt, x.i, nou); });
    if (rt !== t.rols) { t.rols = rt; camps.push('rols'); }
    let pt = t.parells;
    linParells(n).forEach(l => {
      if (l.c[0] !== vell && l.c[1] !== vell) return;
      const c = l.c.slice(); if (c[0] === vell) c[0] = nou; if (c[1] === vell) c[1] = nou;
      pt = posaLinia(pt, l.i, fesParell(c));
    });
    if (pt !== t.parells) { t.parells = pt; camps.push('parells'); }
    const st = canviaClausSeq(t.seq, x => reanomenaClau(x, vell, nou));
    if (st !== t.seq) { t.seq = st; camps.push('seq'); }
    const dins = {};
    Object.keys(n.dins || {}).forEach(r => {
      const d = n.dins[r], p2 = reanomenaClaus(d.portes, vell, nou);
      dins[r === vell && !hasOwn(n.dins, nou) ? nou : r] = p2 === d.portes ? d : Object.assign({}, d, { portes: p2 });
    });
    const portes = {}; Object.keys(n.portes || {}).forEach(x => { portes[x] = n.portes[x] === vell ? nou : n.portes[x]; });
    const out = Object.assign({}, n, { t, pos: mouClau(n.pos, vell, nou), gomets: reanomenaClaus(n.gomets, vell, nou), dins, portes });
    if (n.externs) out.externs = reanomenaExterns(n.externs, vell, nou);
    return RES(out, camps, 'reanomenar «' + curt(vell) + '» com a «' + curt(nou) + '»', { avis: k.avis, rol: nou });
  }

  function opEsborraRol(n, nom) {
    const R = rolsDelNivell(n);
    if (!R.tots.includes(nom) && !hasOwn(n.dins, nom) && !hasOwn(n.pos, nom)) return ERR(n, 'No hi ha cap rol «' + nom + '» en aquest nivell');
    const t = Object.assign({}, n.t), camps = [];
    let rt = t.rols;
    liniesText(rt).filter(x => x.txt === nom).reverse().forEach(x => { rt = treuLinia(rt, x.i); });
    if (rt !== t.rols) { t.rols = rt; camps.push('rols'); }
    let pt = t.parells, nL = 0;
    linParells(n).filter(l => l.c[0] === nom || l.c[1] === nom).reverse().forEach(l => {
      nL += [[2, 3], [4, 5]].filter(([a, b]) => l.c[a] || l.c[b]).length;
      pt = treuLinia(pt, l.i);
    });
    if (pt !== t.parells) { t.parells = pt; camps.push('parells'); }
    let st = t.seq;
    linSeq(st).filter(x => { const p = partClau(x.c[0]); return p[0] === nom || p[1] === nom; }).reverse().forEach(x => { st = treuLinia(st, x.i); });
    if (st !== t.seq) { t.seq = st; camps.push('seq'); }
    const gomets = {}; Object.keys(n.gomets || {}).forEach(k => { const p = partClau(k); if (p[0] !== nom && p[1] !== nom) gomets[k] = n.gomets[k]; });
    const pos = Object.assign({}, n.pos); delete pos[nom];
    const dins = Object.assign({}, n.dins); const nD = hasOwn(n.dins, nom) ? rolsDelNivell(n.dins[nom]).tots.length : -1; delete dins[nom];
    let avis = 'S\'ha esborrat «' + nom + '»';
    const parts = [];
    if (nL) parts.push(pl(nL, 'lliurament', 'lliuraments'));
    if (nD >= 0) parts.push('la seva xarxa de dins (' + pl(nD, 'rol', 'rols') + ')');
    if (parts.length === 2) avis += ', ' + parts[0] + ' i ' + parts[1]; else if (parts.length) avis += ' i ' + parts[0];
    const out = Object.assign({}, n, { t, gomets, pos, dins });
    if (n.externs) out.externs = n.externs.filter(r => r !== nom);
    return RES(out, camps, 'esborrar «' + curt(nom) + '»', { avis });
  }

  function opMouRol(n, nom, xy) {
    if (!rolsDelNivell(n).tots.includes(nom)) return ERR(n, 'No hi ha cap rol «' + nom + '» en aquest nivell');
    if (!Array.isArray(xy) || !Number.isFinite(+xy[0]) || !Number.isFinite(+xy[1])) return ERR(n, 'Falta on va');
    const p = [Math.round(+xy[0]), Math.round(+xy[1])];
    if (hasOwn(n.pos, nom) && n.pos[nom][0] === p[0] && n.pos[nom][1] === p[1]) return RES(n, [], 'moure «' + curt(nom) + '»');
    return RES(Object.assign({}, n, { pos: Object.assign({}, n.pos, { [nom]: p }) }), [], 'moure «' + curt(nom) + '»', { grup: 'mou:' + nom });
  }

  function opOrdreRol(n, nom, d) {
    const x = liniesText(n.t.rols).find(l => l.txt === nom);
    if (!x) return ERR(n, 'No hi ha cap rol «' + nom + '» a la llista');
    const t = mouLinia(n.t.rols, x.i, d);
    if (t === n.t.rols) return RES(n, [], 'reordenar els rols');
    return RES(ambText(n, 'rols', t), ['rols'], 'reordenar els rols', { linia: { camp: 'rols', i: x.i + d } });
  }
  function opOrdreParell(n, li, d) {
    const t = mouLinia(n.t.parells, li, d);
    if (t === n.t.parells) return RES(n, [], 'reordenar els parells');
    return RES(ambText(n, 'parells', t), ['parells'], 'reordenar els parells', { linia: { camp: 'parells', i: li + d } });
  }

  function opFlux(n, deIn, aIn, m, q) {
    const kd = netejaNom(deIn), ka = netejaNom(aIn);
    if (kd.error) return ERR(n, kd.error);
    if (ka.error) return ERR(n, ka.error);
    const de = kd.nom, a = ka.nom;
    if (de === a) return ERR(n, 'Un lliurament va d\'un rol a un altre');
    const kq = netejaNom(q, { fletxa: true, buit: true });
    if (kq.error) return ERR(n, kq.error);
    const mc = menaCurta(m) || 't', clau = de + '→' + a, tr = trobaCostat(n, clau);
    let pt = n.t.parells, li;
    if (tr) {
      const [cm, cq] = COLS(tr.costat), c = ple6(tr.l.c);
      if (c[cq] && c[cq] !== kq.nom) return { n, camps: [], nom: '', conflicte: { tipus: 'ocupat', q: c[cq], clau, de, a } };
      c[cm] = mc; c[cq] = kq.nom; li = tr.l.i;
      pt = posaLinia(pt, li, fesParell(c));
    } else {
      li = liniesText(pt).length;
      pt = posaLinia(pt, li, fesParell([de, a, mc, kq.nom, '', '']));
    }
    const dec = rolsDelNivell(n).declarats, nous = [de, a].filter(r => !dec.includes(r));
    let rt = n.t.rols;
    nous.forEach(r => { rt = posaLinia(rt, liniesText(rt).length, r); });
    const nou = Object.assign({}, n, { t: Object.assign({}, n.t, { parells: pt, rols: rt }) });
    const avisos = [kd.avis || ka.avis || kq.avis, nous.length ? 'He afegit ' + nous.map(r => '«' + r + '»').join(' i ') + ' a la llista de rols' : ''].filter(Boolean);
    return RES(nou, nous.length ? ['parells', 'rols'] : ['parells'], 'crear «' + curt(kq.nom || '?') + '»',
      { linia: { camp: 'parells', i: li }, avis: avisos.length ? avisos.join('. ') : undefined, clau });
  }

  function opEditaFlux(n, clau, canvis) {
    const tr = trobaCostat(n, clau), o = canvis || {};
    if (!tr) return ERR(n, 'No hi ha cap lliurament «' + clau + '»');
    const [cm, cq] = COLS(tr.costat), c = ple6(tr.l.c);
    let avis;
    if (o.q !== undefined) { const k = netejaNom(o.q, { fletxa: true, buit: true }); if (k.error) return ERR(n, k.error); c[cq] = k.nom; avis = k.avis; }
    if (o.mena !== undefined) c[cm] = menaCurta(o.mena);
    const pt = posaLinia(n.t.parells, tr.l.i, fesParell(c));
    if (pt === n.t.parells) return RES(n, [], 'editar «' + curt(c[cq] || clau) + '»');
    return RES(ambText(n, 'parells', pt), ['parells'], 'editar «' + curt(c[cq] || clau) + '»', { linia: { camp: 'parells', i: tr.l.i }, avis });
  }

  function opInverteix(n, clau) {
    const tr = trobaCostat(n, clau);
    if (!tr) return ERR(n, 'No hi ha cap lliurament «' + clau + '»');
    const c = ple6(tr.l.c), [cm, cq] = COLS(tr.costat), [om, oq] = COLS(1 - tr.costat), inv = tr.a + '→' + tr.de;
    if (!c[cm] && !c[cq]) return ERR(n, 'En aquest sentit no hi va res');
    let nc, avis;
    if (!c[om] && !c[oq]) nc = [tr.a, tr.de, c[cm], c[cq], '', ''].concat(c.slice(6));
    else {
      nc = c.slice(); nc[cm] = c[om]; nc[cq] = c[oq]; nc[om] = c[cm]; nc[oq] = c[cq];
      avis = 'S\'han intercanviat els dos sentits';
    }
    const t = Object.assign({}, n.t, { parells: posaLinia(n.t.parells, tr.l.i, fesParell(nc)) });
    const camps = ['parells'];
    const st = canviaClausSeq(t.seq, k => (k === clau ? inv : k === inv ? clau : k));
    if (st !== t.seq) { t.seq = st; camps.push('seq'); }
    const g = {}; Object.keys(n.gomets || {}).forEach(k => { g[k === clau ? inv : k === inv ? clau : k] = n.gomets[k]; });
    return RES(Object.assign({}, n, { t, gomets: g }), camps, 'invertir «' + curt(c[cq]) + '»', { linia: { camp: 'parells', i: tr.l.i }, avis, clau: inv });
  }

  function opEsborraFlux(n, clau) {
    const tr = trobaCostat(n, clau);
    if (!tr) return ERR(n, 'No hi ha cap lliurament «' + clau + '»');
    const c = ple6(tr.l.c), [cm, cq] = COLS(tr.costat), [om, oq] = COLS(1 - tr.costat), q = c[cq];
    c[cm] = ''; c[cq] = '';
    const t = Object.assign({}, n.t);
    t.parells = !c[om] && !c[oq] ? treuLinia(t.parells, tr.l.i) : posaLinia(t.parells, tr.l.i, fesParell(c));
    const camps = ['parells'], st = posaSeq(t.seq, clau, null);
    if (st !== t.seq) { t.seq = st; camps.push('seq'); }
    const gomets = Object.assign({}, n.gomets); delete gomets[clau];
    return RES(Object.assign({}, n, { t, gomets }), camps, 'esborrar «' + curt(q || clau) + '»', { avis: 'S\'ha esborrat «' + (q || clau) + '»' });
  }

  function opCanviaExtrems(n, clau, de2, a2) {
    const tr = trobaCostat(n, clau);
    if (!tr) return ERR(n, 'No hi ha cap lliurament «' + clau + '»');
    const c = ple6(tr.l.c), [cm, cq] = COLS(tr.costat);
    const sv = llegeixTextos(n.t).seq[clau], g = hasOwn(n.gomets, clau) ? n.gomets[clau] : undefined;
    const r1 = opEsborraFlux(n, clau), r2 = opFlux(r1.n, de2, a2, c[cm] || 't', c[cq]);
    if (r2.error || r2.conflicte) return Object.assign({}, r2, { n });
    let nou = r2.n;
    if (sv !== undefined) nou = ambText(nou, 'seq', posaSeq(nou.t.seq, r2.clau, sv));
    if (g !== undefined) nou = Object.assign({}, nou, { gomets: Object.assign({}, nou.gomets, { [r2.clau]: g }) });
    return RES(nou, uniq(r1.camps.concat(r2.camps, sv !== undefined ? ['seq'] : [])), 'canviar els extrems de «' + curt(c[cq] || clau) + '»',
      { linia: r2.linia, avis: r2.avis, clau: r2.clau });
  }

  function opProces(n, nom, d) {
    const k = netejaNom(nom, { fletxa: true });
    if (k.error) return ERR(n, k.error);
    const kd = netejaNom(d, { fletxa: true, buit: true });
    if (kd.error) return ERR(n, kd.error);
    const id = idProces(k.nom, llegeixTextos(n.t).processos.map(p => p.id));
    const i = liniesText(n.t.processos).length;
    const linia = kd.nom ? [id, k.nom, kd.nom].join(' | ') : id + ' | ' + k.nom;
    return RES(ambText(n, 'processos', posaLinia(n.t.processos, i, linia)), ['processos'], 'crear el procés «' + curt(k.nom) + '»',
      { linia: { camp: 'processos', i }, id, avis: k.avis || kd.avis });
  }
  function trobaProces(n, id) { return liniesText(n.t.processos).map(x => Object.assign(x, { c: campsLinia(x.txt) })).find(x => x.c[0] === id); }
  function opEditaProces(n, id, canvis) {
    const x = trobaProces(n, id), o = canvis || {};
    if (!x) return ERR(n, 'No hi ha cap procés «' + id + '»');
    const c = x.c.slice();
    if (o.nom !== undefined) { const k = netejaNom(o.nom, { fletxa: true }); if (k.error) return ERR(n, k.error); c[1] = k.nom; }
    if (o.d !== undefined) { const k = netejaNom(o.d, { fletxa: true, buit: true }); if (k.error) return ERR(n, k.error); c[2] = k.nom; }
    while (c.length > 2 && !c[c.length - 1]) c.pop();
    const pt = posaLinia(n.t.processos, x.i, c.map(v => v || '').join(' | '));
    if (pt === n.t.processos) return RES(n, [], 'editar el procés');
    return RES(ambText(n, 'processos', pt), ['processos'], 'editar el procés «' + curt(c[1] || id) + '»', { linia: { camp: 'processos', i: x.i } });
  }
  function opOrdreProces(n, id, d) {
    const x = trobaProces(n, id);
    if (!x) return ERR(n, 'No hi ha cap procés «' + id + '»');
    const t = mouLinia(n.t.processos, x.i, d);
    if (t === n.t.processos) return RES(n, [], 'reordenar els processos');
    return RES(ambText(n, 'processos', t), ['processos'], 'reordenar els processos', { linia: { camp: 'processos', i: x.i + d } });
  }
  function opEsborraProces(n, id) {
    const x = trobaProces(n, id);
    if (!x) return ERR(n, 'No hi ha cap procés «' + id + '»');
    const t = Object.assign({}, n.t), nom = x.c[1] || id;
    liniesText(t.processos).map(y => Object.assign(y, { c: campsLinia(y.txt) })).filter(y => y.c[0] === id).reverse()
      .forEach(y => { t.processos = treuLinia(t.processos, y.i); });
    const s = llegeixTextos(n.t).seq, claus = Object.keys(s).filter(k => Array.isArray(s[k]) && s[k][0] === id);
    claus.forEach(k => { t.seq = posaSeq(t.seq, k, null); });
    const camps = ['processos'].concat(t.seq !== n.t.seq ? ['seq'] : []);
    const avis = 'S\'ha esborrat «' + nom + '»' + (claus.length ? '; ' + (claus.length === 1 ? '1 lliurament torna' : claus.length + ' lliuraments tornen') + ' a «Sense pas»' : '');
    return RES(Object.assign({}, n, { t }), camps, 'esborrar el procés «' + curt(nom) + '»', { avis });
  }

  function opPas(n, clau, id, pas, mode) {
    const md = mode || 'final';
    const fx = fluxosAmbLinia(n).find(f => f.clau === clau && f.estat !== 'buit');
    if (!fx) return ERR(n, 'No hi ha cap lliurament «' + clau + '»');
    const m = llegeixTextos(n.t), proc = m.processos.find(p => p.id === id);
    if (!proc) return ERR(n, 'No hi ha cap procés «' + id + '»');
    const abans = hasOwn(m.seq, clau) ? m.seq[clau] : undefined, num = {};
    Object.keys(m.seq).forEach(k => { const v = m.seq[k]; if (Array.isArray(v) && v[0] === id && k !== clau) num[k] = v[1]; });
    let p = Math.max(1, Math.round(Number(pas) || 1));
    if (md === 'final') p = Math.max(0, ...Object.values(num)) + 1;
    else if (md === 'insereix') Object.keys(num).forEach(k => { if (num[k] >= p) num[k]++; });
    num[clau] = p;
    const vals = uniq(Object.values(num)).sort((a, b) => a - b), map = {};
    vals.forEach((v, i) => { map[v] = i + 1; });
    let st = n.t.seq, renum = false;
    Object.keys(num).forEach(k => {
      const v = m.seq[k], nou = map[num[k]];
      if (Array.isArray(v) && v[0] === id && v[1] === nou) return;
      st = posaSeq(st, k, [id, nou]);
      if (k !== clau) renum = true;
    });
    if (Array.isArray(abans) && abans[0] !== id) st = compactaProces(st, abans[0]).text;
    const nomP = proc.nom || id;
    return RES(ambText(n, 'seq', st), st !== n.t.seq ? ['seq'] : [], 'posar «' + curt(fx.q || clau) + '» al pas ' + map[p] + ' de «' + curt(nomP) + '»',
      { avis: renum ? 'Passos de «' + nomP + '» renumerats 1…' + vals.length : undefined, linia: { camp: 'seq', i: Math.max(0, linSeq(st).map(x => x.c[0]).lastIndexOf(clau)) } });
  }
  function opTreuPas(n, clau) {
    const v = llegeixTextos(n.t).seq[clau];
    if (v === undefined) return RES(n, [], 'treure el pas');
    let st = posaSeq(n.t.seq, clau, null);
    if (Array.isArray(v)) st = compactaProces(st, v[0]).text;
    return RES(ambText(n, 'seq', st), ['seq'], 'treure el pas de «' + curt(clau) + '»');
  }
  function opSempre(n, clau, on) {
    if (on === false) return opTreuPas(n, clau);
    const fx = fluxosAmbLinia(n).find(f => f.clau === clau && f.estat !== 'buit');
    if (!fx) return ERR(n, 'No hi ha cap lliurament «' + clau + '»');
    if (fx.mena === 'tangible') return ERR(n, 'Un tangible no pot ser «sempre»: un tangible sense pas és un tangible que ningú ha seqüenciat');
    const v = llegeixTextos(n.t).seq[clau];
    if (v === 'sempre') return RES(n, [], 'marcar «sempre»');
    let st = posaSeq(n.t.seq, clau, 'sempre');
    if (Array.isArray(v)) st = compactaProces(st, v[0]).text;
    return RES(ambText(n, 'seq', st), ['seq'], 'marcar «' + curt(fx.q || clau) + '» com a «sempre»',
      { linia: { camp: 'seq', i: linSeq(st).map(x => x.c[0]).lastIndexOf(clau) } });
  }

  function opTroballa(n, tt, d) {
    const k = netejaNom(tt, { fletxa: true }), kd = netejaNom(d, { fletxa: true, buit: true });
    if (k.error) return ERR(n, k.error);
    if (kd.error) return ERR(n, kd.error);
    const i = liniesText(n.t.troballes).length;
    return RES(ambText(n, 'troballes', posaLinia(n.t.troballes, i, kd.nom ? k.nom + ' | ' + kd.nom : k.nom)), ['troballes'],
      'escriure la troballa «' + curt(k.nom) + '»', { linia: { camp: 'troballes', i }, avis: k.avis || kd.avis });
  }

  function opGomet(n, clau, v) {
    if (v === null || v === undefined) {
      if (!hasOwn(n.gomets, clau)) return RES(n, [], 'treure el gomet');
      const g = Object.assign({}, n.gomets); delete g[clau];
      return RES(Object.assign({}, n, { gomets: g }), [], 'treure el gomet de «' + curt(clau) + '»');
    }
    const x = Number(v);
    if (!Number.isInteger(x) || x < -2 || x > 2) return ERR(n, 'El gomet va de −2 a +2');
    if (!fluxosAmbLinia(n).some(f => f.clau === clau && f.estat !== 'buit')) return ERR(n, 'No hi ha cap lliurament «' + clau + '»');
    return RES(Object.assign({}, n, { gomets: Object.assign({}, n.gomets, { [clau]: x }) }), [], 'posar un gomet a «' + curt(clau) + '»');
  }
  function opPorta(n, clauPare, rolDins) {
    const p = Object.assign({}, n.portes);
    if (rolDins === null || rolDins === undefined || rolDins === '') delete p[clauPare];
    else p[clauPare] = String(rolDins);
    return RES(Object.assign({}, n, { portes: p }), [], 'dir qui ho rep a dins');
  }
  function opExtern(n, rol, on) {
    if (!rolsDelNivell(n).tots.includes(rol)) return ERR(n, 'No hi ha cap rol «' + rol + '» en aquest nivell');
    const ex = n.externs || [], ja = ex.includes(rol), vol = on === undefined ? !ja : !!on;
    if (vol === ja) return RES(n, [], vol ? 'marcar «' + curt(rol) + '» com a extern' : 'tornar «' + curt(rol) + '» a la casa');
    return RES(Object.assign({}, n, { externs: vol ? ex.concat([rol]) : ex.filter(r => r !== rol) }), [],
      vol ? 'marcar «' + curt(rol) + '» com a extern' : 'tornar «' + curt(rol) + '» a la casa', { rol });
  }
  function opCreaDins(n, rol) {
    if (!rolsDelNivell(n).tots.includes(rol)) return ERR(n, 'No hi ha cap rol «' + rol + '» en aquest nivell');
    if (hasOwn(n.dins, rol)) return RES(n, [], 'obrir «' + curt(rol) + '»');
    return RES(Object.assign({}, n, { dins: Object.assign({}, n.dins, { [rol]: nivellBuit() }) }), [], 'crear la xarxa de dins de «' + curt(rol) + '»');
  }
  function opEndreca(n) {
    const tots = rolsDelNivell(n).tots;
    return RES(Object.assign({}, n, { pos: colocaConcentric(tots, fluxosGeo(n)) }), [], 'endreçar el dibuix', { grup: 'endreca' });
  }

  /* ── Operacions que canvien més d'un nivell, o l'arbre sencer ──────────── */
  function copiaIdeal(arbre) {
    const ideal = clona(arbre.real); ideal.alies = {}; ideal.treu = [];
    return { arbre: Object.assign({}, arbre, { ideal }), nom: 'copiar el real a l\'ideal',
      avis: 'L\'ideal parteix d\'una còpia del real: canvia-hi el que voldríeu tenir' };
  }
  function idealBlanc(arbre) {
    const ideal = Object.assign(nivellBuit(), { alies: {}, treu: [] });
    return { arbre: Object.assign({}, arbre, { ideal }), nom: 'començar l\'ideal en blanc' };
  }
  function posaAlies(arbre, nomIdeal, nomReal) {
    if (!arbre.ideal) return { error: 'Encara no hi ha mapa ideal' };
    const alies = Object.assign({}, arbre.ideal.alies);
    if (nomReal) alies[nomIdeal] = nomReal; else delete alies[nomIdeal];
    return { arbre: Object.assign({}, arbre, { ideal: Object.assign({}, arbre.ideal, { alies }) }),
      nom: nomReal ? 'dir que «' + curt(nomIdeal) + '» és «' + curt(nomReal) + '»' : 'treure l\'àlies de «' + curt(nomIdeal) + '»' };
  }
  /* Quan un rol canvia de nom, l'àlies i la llista «treu» de l'ideal el
     segueixen: el que ja s'havia dit que era el mateix rol ho continua sent. */
  function segueixNom(arbre, lloc, vell, nou) {
    if (!arbre.ideal || !vell || !nou || vell === nou) return arbre;
    const al = Object.assign({}, arbre.ideal.alies || {}), aIdeal = lloc && lloc.vista === 'ideal';
    let canvi = false;
    if (aIdeal) { if (hasOwn(al, vell) && !hasOwn(al, nou)) { al[nou] = al[vell]; delete al[vell]; canvi = true; } }
    else Object.keys(al).forEach(k => { if (al[k] === vell) { al[k] = nou; canvi = true; } });
    let a = canvi ? Object.assign({}, arbre, { ideal: Object.assign({}, arbre.ideal, { alies: al }) }) : arbre;
    if (!aIdeal) {
      const L = { vista: 'ideal', cami: (lloc && lloc.cami) || [] }, rI = resol(a, L), tr = rI.existeix ? rI.nivell.treu || [] : [];
      const t2 = tr.map(k => reanomenaClau(k, vell, nou));
      if (t2.some((k, i) => k !== tr[i])) a = substitueix(a, L, Object.assign({}, rI.nivell, { treu: t2 }));
    }
    return a;
  }
  /* El rol de l'ideal que es llegeix com `nomReal` (pel nom o per l'àlies). */
  function rolIdeal(arbre, cami, nomReal) {
    if (!arbre.ideal) return null;
    const rI = resol(arbre, { vista: 'ideal', cami: cami || [] });
    if (!rI.existeix) return null;
    const al = aliesN(arbre), comu = s => { const x = normNom(s); return al[x] || x; }, k = normNom(nomReal);
    return rolsDelNivell(rI.nivell).tots.find(r => comu(r) === k) || null;
  }
  function reanomenaIdeal(arbre, cami, nomIdeal, nou) {
    if (!arbre.ideal) return { error: 'Encara no hi ha mapa ideal' };
    const L = { vista: 'ideal', cami: cami || [] }, rI = resol(arbre, L);
    if (!rI.existeix) return { error: 'A l\'ideal, aquest nivell no hi és' };
    const r = opReanomenaRol(rI.nivell, nomIdeal, nou);
    if (r.error) return { error: 'A l\'ideal: ' + r.error };
    const a = segueixNom(substitueix(arbre, L, r.n), L, nomIdeal, r.rol || nou);
    return { arbre: a, nom: 'reanomenar «' + curt(nomIdeal) + '» com a «' + curt(r.rol || nou) + '» a l\'ideal' };
  }
  /* Porta un rol o un lliurament d'un costat a l'altre, al mateix nivell. */
  function porta(arbre, lloc, el, cap) {
    if (!arbre.ideal) return { error: 'Encara no hi ha mapa ideal' };
    const cami = (lloc && lloc.cami) || [], de = cap === 'real' ? 'ideal' : 'real';
    const rO = resol(arbre, { vista: de, cami }), rD = resol(arbre, { vista: cap, cami });
    const al = aliesN(arbre), comuI = s => { const x = normNom(s); return al[x] || x; };
    const comuO = de === 'ideal' ? comuI : normNom, comuD = cap === 'ideal' ? comuI : normNom;
    const nomD = s => rolsDelNivell(rD.nivell).tots.find(r => comuD(r) === comuO(s)) || s;
    let r, nom;
    if (el.tipus === 'rol') {
      if (!rolsDelNivell(rO.nivell).tots.includes(el.nom)) return { error: 'No hi ha cap rol «' + el.nom + '»' };
      r = opRol(rD.nivell, nomD(el.nom), hasOwn(rO.nivell.pos, el.nom) ? rO.nivell.pos[el.nom] : undefined);
      nom = 'portar «' + curt(el.nom) + '» ' + (cap === 'real' ? 'al real' : 'a l\'ideal');
    } else {
      const f = fluxosAmbLinia(rO.nivell).find(x => x.clau === el.clau && x.estat === 'ple');
      if (!f) return { error: 'No hi ha cap lliurament «' + el.clau + '»' };
      r = opFlux(rD.nivell, nomD(f.de), nomD(f.a), f.mena, f.q);
      if (r.conflicte) return { error: (cap === 'real' ? 'Al real' : 'A l\'ideal') + ' ja hi va «' + r.conflicte.q + '» de «' + r.conflicte.de + '» a «' + r.conflicte.a + '»' };
      nom = 'portar «' + curt(f.q) + '» ' + (cap === 'real' ? 'al real' : 'a l\'ideal');
    }
    if (r.error) return { error: r.error };
    return { arbre: substitueix(arbre, { vista: cap, cami: rD.cami }, r.n), nom, avis: r.avis };
  }
  const portaAlReal = (arbre, lloc, el) => porta(arbre, lloc, el, 'real');
  const portaAIdeal = (arbre, lloc, el) => porta(arbre, lloc, el, 'ideal');

  /* ══ 4 · GEOMETRIA (unitats de món; un rol fa R = 32 a zoom 1) ══════════ */
  function fluxosGeo(n) { return fluxosAmbLinia(n).filter(f => f.estat !== 'buit' && f.de && f.a); }
  /* El de més lliuraments al centre (la guia: «els que tenen més interaccions
     van més al centre») i la resta en un anell, cada un al costat del que hi
     té més vincles, perquè es creuin menys fletxes. */
  function colocaConcentric(rols, fl) {
    const L = uniq(rols || []);
    if (!L.length) return {};
    const grau = {}, vin = {};
    L.forEach(r => { grau[r] = 0; });
    (fl || []).forEach(f => {
      if (hasOwn(grau, f.de)) grau[f.de]++;
      if (hasOwn(grau, f.a)) grau[f.a]++;
      const k = [f.de, f.a].sort(per).join('|'); vin[k] = (vin[k] || 0) + 1;
    });
    const lligams = (a, b) => vin[[a, b].sort(per).join('|')] || 0;
    const ord = L.slice().sort((a, b) => grau[b] - grau[a] || per(a, b));
    /* Amb tres rols o menys, un polígon sense centre: cap fletxa en travessa cap */
    if (L.length <= 3) {
      if (L.length === 1) return { [L[0]]: [0, 0] };
      if (L.length === 2) return { [ord[0]]: [-100, 0], [ord[1]]: [100, 0] };
      const p3 = {};
      ord.forEach((r, i) => { const ang = -Math.PI / 2 + 2 * Math.PI * i / 3; p3[r] = [Math.round(130 * Math.cos(ang)) || 0, Math.round(130 * Math.sin(ang)) || 0]; });
      return p3;
    }
    const centre = ord[0];
    const pos = { [centre]: [0, 0] }, pend = L.filter(r => r !== centre), anell = [];
    let ultim = centre;
    while (pend.length) {
      pend.sort((a, b) => lligams(ultim, b) - lligams(ultim, a) || per(a, b));
      ultim = pend.shift(); anell.push(ultim);
    }
    const k = anell.length, rad = Math.max(180, 30 * k);
    /* Els parells amb vincle, a prop a l'anell: si queden a banda i banda, la
       fletxa travessa el centre. Intercanvis de dos en dos mentre millori. */
    const dist = (i, j) => { const d = Math.abs(i - j) % k; return Math.min(d, k - d); };
    const cost = o => { let c = 0; for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) { const l = lligams(o[i], o[j]); if (l) c += l * dist(i, j) * dist(i, j); } return c; };
    let cAra = cost(anell);
    for (let pas = 0, millora = true; millora && pas < 40; pas++) {
      millora = false;
      for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) {
        [anell[i], anell[j]] = [anell[j], anell[i]];
        const c = cost(anell);
        if (c < cAra) { cAra = c; millora = true; } else [anell[i], anell[j]] = [anell[j], anell[i]];
      }
    }
    anell.forEach((r, i) => {
      const ang = -Math.PI / 2 + 2 * Math.PI * i / k;
      pos[r] = [Math.round(rad * Math.cos(ang)) || 0, Math.round(rad * Math.sin(ang)) || 0];
    });
    return pos;
  }
  function forat(pos, prop) {
    const pts = Array.isArray(pos) ? pos : Object.values(pos || {});
    const lliure = p => pts.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) >= DMIN);
    const p0 = [Math.round(prop[0]) || 0, Math.round(prop[1]) || 0];
    if (lliure(p0)) return p0;
    for (let k = 1; k < 5000; k++) {
      const ang = k * 2.399963229728653, r = 0.9 * R * Math.sqrt(k);
      const p = [Math.round(p0[0] + r * Math.cos(ang)) || 0, Math.round(p0[1] + r * Math.sin(ang)) || 0];
      if (lliure(p)) return p;
    }
    return p0;
  }
  const centroide = pos => {
    const v = Object.values(pos);
    return v.length ? [v.reduce((s, p) => s + p[0], 0) / v.length, v.reduce((s, p) => s + p[1], 0) / v.length] : [0, 0];
  };
  /* On va cada rol: la seva `pos`, o col·locat sol. Si cap rol en té, tot el
     nivell en concèntric; si no, els nous en un forat al voltant del centre. */
  function posicionsNivell(n) {
    const tots = rolsDelNivell(n).tots, fix = tots.filter(r => hasOwn(n.pos, r));
    if (!fix.length) return { pos: colocaConcentric(tots, fluxosGeo(n)), noves: tots.slice() };
    const pos = {}; fix.forEach(r => { pos[r] = n.pos[r].slice(); });
    const noves = tots.filter(r => !hasOwn(pos, r));
    noves.forEach(r => { pos[r] = forat(pos, centroide(pos)); });
    return { pos, noves };
  }
  /* Quan una operació fixa la posició d'algun rol, els altres es fixen on
     eren abans, perquè no saltin. Si cap rol té posició, no se'n desa cap. */
  function completaPos(abans, nou) {
    const tots = rolsDelNivell(nou).tots;
    if (!tots.some(r => hasOwn(nou.pos, r))) return nou;
    const calc = posicionsNivell(abans).pos, pos = Object.assign({}, nou.pos);
    let canvi = false;
    tots.forEach(r => {
      if (hasOwn(pos, r)) return;
      const altres = Object.keys(pos).filter(k => tots.includes(k)).map(k => pos[k]);
      const c = calc[r];
      pos[r] = c && altres.every(q => Math.hypot(q[0] - c[0], q[1] - c[1]) >= DMIN) ? c.slice() : forat(altres, c || centroide(pos));
      canvi = true;
    });
    return canvi ? Object.assign({}, nou, { pos }) : nou;
  }
  function caixa(esc) {
    const ns = Array.isArray(esc) ? esc : (esc && esc.nodes) || [];
    if (!ns.length) return { x0: -R, y0: -R, x1: R, y1: R };
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    ns.forEach(p => { x0 = Math.min(x0, p.x - R); y0 = Math.min(y0, p.y - R); x1 = Math.max(x1, p.x + R); y1 = Math.max(y1, p.y + R); });
    return { x0, y0, x1, y1 };
  }
  function encaixa(c, w, h, marge) {
    const m = marge == null ? 48 : marge, cw = Math.max(1, c.x1 - c.x0), ch = Math.max(1, c.y1 - c.y0);
    let k = Math.min((w - 2 * m) / cw, (h - 2 * m) / ch);
    if (!Number.isFinite(k) || k <= 0) k = 1;
    k = Math.max(0.25, Math.min(4, k));
    return { k, tx: w / 2 - k * (c.x0 + c.x1) / 2, ty: h / 2 - k * (c.y0 + c.y1) / 2 };
  }

  /* ══ 5 · L'ESCENA ══════════════════════════════════════════════════════════
     El que el llenç ha de dibuixar, amb l'estat de cada cosa. El render només
     ho tradueix a SVG: tot el que és difícil es prova aquí, sense navegador. */
  function miniDins(d) {
    if (!d) return null;
    const P = posicionsNivell(d).pos, noms = rolsDelNivell(d).tots;
    const pts = noms.slice(0, 12).map(r => P[r]);
    if (!pts.length) return { rols: 0, punts: [] };
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    const ext = Math.max(1, ...pts.map(p => Math.max(Math.abs(p[0] - cx), Math.abs(p[1] - cy))));
    return { rols: noms.length, punts: pts.map(p => [Math.round((p[0] - cx) / ext * 100) / 100, Math.round((p[1] - cy) / ext * 100) / 100]) };
  }
  function portaDe(n, f) {
    for (const r of [f.a, f.de]) {
      const d = n.dins && n.dins[r];
      if (!d || !d.portes) continue;
      const k = Object.keys(d.portes).find(x => x === f.clau || clauN(x) === clauN(f.clau));
      if (k !== undefined) return d.portes[k];
    }
    return null;
  }
  function seqDe(m, clau) {
    if (!hasOwn(m.seq, clau)) return null;
    const v = m.seq[clau];
    if (v === 'sempre') return 'sempre';
    const p = m.processos.find(x => x.id === v[0]);
    return { proces: v[0], nom: (p && p.nom) || v[0], pas: v[1] };
  }
  function noDibuixables(n, out) {
    const m = llegeixTextos(n.t), F = fluxosAmbLinia(n), ids = new Set(m.processos.map(p => p.id));
    liniesText(n.t.parells).forEach(({ i, raw, txt }) => {
      const c = campsLinia(txt);
      if (!c[0] || !c[1]) out.push({ camp: 'parells', i, raw, motiu: !c[0] ? 'falta «de»' : 'falta «a»' });
      else if (!c[2] && !c[3] && !c[4] && !c[5]) out.push({ camp: 'parells', i, raw, motiu: 'no hi va res en cap sentit' });
    });
    linSeq(n.t.seq).forEach(x => {
      if (!x.c[0]) return;
      if (!F.some(f => f.clau === x.c[0] && f.estat !== 'buit')) out.push({ camp: 'seq', i: x.i, raw: x.raw, motiu: '«' + x.c[0] + '» no és cap lliurament' });
      else if ((x.c[1] || '').toLowerCase() !== 'sempre' && !ids.has(x.c[1] || '')) out.push({ camp: 'seq', i: x.i, raw: x.raw, motiu: 'el procés «' + (x.c[1] || '') + '» no hi és' });
    });
  }
  function nodesDe(n, out, estatDe) {
    const Rr = rolsDelNivell(n), P = posicionsNivell(n).pos, lr = linies(n.t.rols), dona = {}, rep = {};
    fluxosAmbLinia(n).filter(f => f.estat === 'ple').forEach(f => { dona[f.de] = (dona[f.de] || 0) + 1; rep[f.a] = (rep[f.a] || 0) + 1; });
    Rr.tots.forEach(nom => {
      const p = P[nom], dec = Rr.declarats.includes(nom);
      out.nodes.push({ nom, x: p[0], y: p[1], tipus: dec ? 'rol' : 'nodeclarat', estat: estatDe ? estatDe(nom) : null,
        i: dec ? lr.indexOf(nom) : null, dona: dona[nom] || 0, rep: rep[nom] || 0, dins: miniDins(n.dins && n.dins[nom]), extern: (n.externs || []).includes(nom) });
    });
  }
  function arestaDe(n, m, f, extra) {
    return Object.assign({ id: f.clau + '#' + f.li, clau: f.clau, de: f.de, a: f.a, mena: f.mena ? f.mena[0] : '', q: f.q, li: f.li,
      costat: f.costat, corba: 1, paral: 0, estat: f.estat, canvi: null, ideal: null, seq: seqDe(m, f.clau),
      gomet: hasOwn(n.gomets, f.clau) ? n.gomets[f.clau] : null, porta: portaDe(n, f) }, extra || {});
  }
  function escenaNivell(n, out) {
    const m = llegeixTextos(n.t), F = fluxosAmbLinia(n), parLin = {};
    nodesDe(n, out, null);
    for (let k = 0; k < F.length; k += 2) {
      const s0 = F[k], s1 = F[k + 1];
      if (!s0.de || !s0.a) continue;
      if (s0.estat === 'buit' && s1.estat === 'buit') continue;
      const pk = [s0.de, s0.a].sort(per).join('|');
      parLin[pk] = parLin[pk] === undefined ? 0 : parLin[pk] + 1;
      [s0, s1].forEach(s => {
        let estat = s.estat;
        if (estat === 'buit') { estat = 'tornada'; out.pendents++; }
        out.arestes.push(arestaDe(n, m, s, { estat, paral: parLin[pk] }));
      });
    }
  }
  function afegeixFora(out, pare, Rnom, n) {
    const fp = fluxos(llegeixTextos(pare.t)).filter(f => (f.de === Rnom || f.a === Rnom) && f.de !== f.a);
    if (!fp.length) return;
    /* Els de fora, en un anell al voltant dels de dins i prou separats entre
       ells perquè els noms es llegeixin, també quan a dins encara no hi ha res */
    const socis = uniq(fp.map(f => (f.de === Rnom ? f.a : f.de))).sort(per), ins = out.nodes.slice();
    const c = caixa(ins), cx = ins.length ? (c.x0 + c.x1) / 2 : 0, cy = ins.length ? (c.y0 + c.y1) / 2 : 0;
    const ext = ins.reduce((m, p) => Math.max(m, Math.hypot(p.x - cx, p.y - cy)), 0), k = socis.length;
    const rad = Math.max(ext + 3.5 * R, k > 1 ? 1.2 * DMIN / (2 * Math.sin(Math.PI / k)) : 0, 4.5 * R);
    socis.forEach((nom, i) => {
      const ang = Math.PI + 2 * Math.PI * i / k;
      out.nodes.push({ nom, x: Math.round(cx + rad * Math.cos(ang)) || 0, y: Math.round(cy + rad * Math.sin(ang)) || 0, tipus: 'fora', estat: null, i: null,
        dona: fp.filter(f => f.de === nom).length, rep: fp.filter(f => f.a === nom).length, dins: null });
    });
    const portes = n.portes || {}, interns = new Set(rolsDelNivell(n).tots);
    fp.forEach(f => {
      const pk = Object.keys(portes).find(k => k === f.clau || clauN(k) === clauN(f.clau));
      const pr = pk !== undefined && interns.has(portes[pk]) ? portes[pk] : null, surt = f.de === Rnom;
      out.arestes.push({ id: 'fora:' + f.clau, clau: f.clau, de: surt ? pr : f.de, a: surt ? f.a : pr, mena: f.mena[0], q: f.q,
        li: null, costat: null, corba: 1, paral: 0, estat: 'fora', canvi: null, ideal: null, seq: null, gomet: null, porta: pr });
    });
  }
  /* La desviació d'un nivell, tal com la calcula el motor de diagnòstic. */
  function desviacioNivell(arbre, cami, diag) {
    if (!arbre.ideal || !diag) return null;
    const rR = resol(arbre, { vista: 'real', cami }), rI = resol(arbre, { vista: 'ideal', cami });
    const mI = Object.assign(llegeixTextos(rI.nivell.t), { alies: arbre.ideal.alies || {}, treu: rI.nivell.treu || [] });
    return diag.desviacio(llegeixTextos(rR.nivell.t), mI);
  }
  function firma(n) {
    const net = o => { const x = Object.assign({}, o); delete x.pos; if (x.dins) { const d = {}; Object.keys(x.dins).forEach(k => { d[k] = net(x.dins[k]); }); x.dins = d; } return x; };
    return JSON.stringify(net(exportaNivell(n)));
  }
  function escenaDesviacio(arbre, lloc, diag, out) {
    const rR = resol(arbre, { vista: 'real', cami: lloc.cami || [] }), nR = rR.nivell;
    const D = desviacioNivell(arbre, lloc.cami || [], diag);
    if (!D) { escenaNivell(nR, out); return; }
    const nI = resol(arbre, { vista: 'ideal', cami: lloc.cami || [] }).nivell;
    const mR = llegeixTextos(nR.t), nRn = D._n.nR, nIn = D._n.nI;
    const tI = rolsDelNivell(nI).tots, setI = new Set(tI.map(nIn)), tR = rolsDelNivell(nR).tots, setR = new Set(tR.map(nRn));
    const dinsI = r => { const k = Object.keys(nI.dins || {}).find(x => nIn(x) === nRn(r)); return k === undefined ? null : nI.dins[k]; };
    nodesDe(nR, out, nom => {
      if (!setI.has(nRn(nom))) return 'propi';
      const a = nR.dins && nR.dins[nom], b = dinsI(nom);
      return a && b && firma(a) !== firma(b) ? 'canvia-dins' : 'igual';
    });
    const PI = posicionsNivell(nI).pos;
    tI.filter(r => !setR.has(nIn(r))).forEach(nom => {
      const ocupats = out.nodes.map(x => [x.x, x.y]), p = PI[nom];
      const q = ocupats.every(o => Math.hypot(o[0] - p[0], o[1] - p[1]) >= DMIN) ? p : forat(ocupats, p);
      out.nodes.push({ nom, x: q[0], y: q[1], tipus: 'rol', estat: 'falta', i: null, dona: 0, rep: 0, dins: miniDins(nI.dins && nI.dins[nom]) });
    });
    const nomNode = s => tR.find(r => nRn(r) === nIn(s)) || s;
    // Cada lliurament per sentit i entregable: un vincle escrit en dos parells té dues fletxes en el mateix sentit
    const kq = (clau, q) => clau + '|' + normNom(q);
    const mapa = (arr, k) => new Map(arr.map(x => [k(x), x]));
    const inv = new Map(); D.fluxos.invertits.forEach(x => (x.reals || [x.real]).forEach(y => inv.set(kq(y.clau, y.q), x)));
    const cm = mapa(D.fluxos.canviMena, x => kq(x.clau, x.real.q)), nd = mapa(D.fluxos.nomsDiferents, x => kq(x.clau, x.real));
    const sq = mapa(D.seq, x => x.clau), sobra = new Set(D.fluxos.sobren.map(x => kq(x.clau, x.q))), propia = new Set(D.fluxos.propies.map(x => kq(x.clau, x.q)));
    const parI = new Map((D.pares || []).map(p => [kq(p.real.clau, p.real.q), p.ideal]));
    const curtaI = x => (x ? { mena: x.mena[0], q: x.q } : null);
    fluxosAmbLinia(nR).filter(f => f.estat === 'ple').forEach(f => {
      const k = kq(f.clau, f.q);
      let estat = 'igual', canvi = null, ideal = curtaI(parI.get(k));
      if (inv.has(k)) { estat = 'canvia'; canvi = 'sentit'; ideal = { mena: inv.get(k).ideal.mena[0], q: inv.get(k).ideal.q }; }
      else if (cm.has(k)) { estat = 'canvia'; canvi = 'mena'; }
      else if (sobra.has(k)) estat = 'sobra';
      else if (propia.has(k)) estat = 'propi';
      else if (nd.has(k)) { estat = 'canvia'; canvi = 'nom'; }
      else if (sq.has(f.clau)) { estat = 'canvia'; canvi = 'pas'; }
      out.arestes.push(arestaDe(nR, mR, f, { estat, canvi, ideal }));
    });
    D.fluxos.falten.forEach(x => {
      out.arestes.push({ id: 'falta:' + x.clau, clau: x.clau, de: nomNode(x.de), a: nomNode(x.a), mena: x.mena[0], q: x.q, li: null, costat: null,
        corba: 1, paral: 0, estat: 'falta', canvi: null, ideal: { mena: x.mena[0], q: x.q }, seq: null, gomet: null, porta: null });
    });
  }
  function resumArbre(arrel) {
    let nivells = 0, rolsTotal = 0, lliuramentsTotal = 0;
    const rec = x => { nivells++; rolsTotal += x.roles.length; lliuramentsTotal += fluxos(x).length; Object.values(x.dins || {}).forEach(rec); };
    rec(exportaNivell(arrel));
    return { nivells, rolsTotal, lliuramentsTotal };
  }
  function escena(arbre, lloc, opc) {
    const o = opc || {}, l = lloc || { vista: 'real', cami: [] }, vista = l.vista || 'real';
    const rs = resol(arbre, l), n = rs.nivell, Rr = rolsDelNivell(n);
    const out = { vista, cami: rs.cami.slice(), profunditat: rs.cami.length, buit: false, nodes: [], arestes: [], pendents: 0,
      noDibuixable: [], orfes: orfes(n), repetits: Rr.repetits, resum: null };
    if (vista === 'desviacio') escenaDesviacio(arbre, l, o.diag, out);
    else escenaNivell(n, out);
    if (vista !== 'desviacio' && rs.cami.length && rs.pare) afegeixFora(out, rs.pare, rs.cami[rs.cami.length - 1], n);
    noDibuixables(n, out.noDibuixable);
    out.buit = !out.nodes.some(x => x.tipus !== 'fora');
    const arrel = vista === 'ideal' && arbre.ideal ? arbre.ideal : arbre.real;
    out.resum = Object.assign({ rols: out.nodes.filter(x => x.tipus !== 'fora').length, lliuraments: fluxos(llegeixTextos(n.t)).length }, resumArbre(arrel));
    return out;
  }

  /* ══ 6 · EL DIAGNÒSTIC D'ÚS ═══════════════════════════════════════════════
     Les preguntes del pols i de la sala, amb les dades i sense conclusions. */
  function encalla(m, rol) {
    const f = fluxos(m), para = f.filter(x => x.de === rol || x.a === rol).map(x => x.clau);
    const altres = uniq((m.roles || []).concat(f.flatMap(x => [x.de, x.a]))).filter(r => r && r !== rol);
    const perden = [];
    altres.forEach((r, idx) => {
      const ent = f.filter(x => x.a === r), k = ent.filter(x => x.de === rol).length;
      if (ent.length && k * 2 >= ent.length) perden.push({ rol: r, k, de: ent.length, idx });
    });
    perden.sort((a, b) => b.k / b.de - a.k / a.de || a.idx - b.idx);
    perden.forEach(p => { delete p.idx; });
    const text = 'Amb aquest node aturat es paren ' + para.length + ' dels ' + f.length + ' lliuraments'
      + (perden.length ? ', i ' + unio(perden.map(p => p.rol + ' (' + p.k + ' ' + deN(p.de) + ')'))
        + (perden.length === 1 ? ' perd la meitat o més del que li arriba' : ' perden la meitat o més del que els arriba') : '') + '.';
    const troballa = { t: 'Si «' + rol + '» s\'encalla',
      d: 'es paren ' + para.length + ' dels ' + f.length + ' lliuraments'
        + (perden.length ? '; ' + unio(perden.map(p => p.rol)) + (perden.length === 1 ? ' perd la meitat o més del que li arriba' : ' perden la meitat o més del que els arriba') : '') };
    return { para, total: f.length, perden, text, troballa };
  }

  function planPols(m, opc) {
    const o = opc || {}, f = fluxos(m), seq = m.seq || {}, perClau = {};
    f.forEach(x => { perClau[x.clau] = x; });
    const ordre = [];
    (m.processos || []).forEach(p => { if (p.id && !ordre.some(q => q.id === p.id)) ordre.push({ id: p.id, nom: p.nom || p.id }); });
    Object.keys(seq).forEach(k => { const v = seq[k]; if (Array.isArray(v) && perClau[k] && v[0] && !ordre.some(q => q.id === v[0])) ordre.push({ id: v[0], nom: v[0] }); });
    const tria = o.proces && o.proces !== 'tots' ? ordre.filter(p => p.id === o.proces) : ordre;
    const frames = [];
    let nPas = 0, nAturats = 0;
    tria.forEach((p, ip) => {
      const items = Object.keys(seq).filter(k => perClau[k] && Array.isArray(seq[k]) && seq[k][0] === p.id).map(k => ({ clau: k, pas: Number(seq[k][1]) || 1 }));
      const passos = uniq(items.map(x => x.pas)).sort((a, b) => a - b);
      frames.push({ tipus: 'titol', proces: p.id, nom: p.nom, n: ip + 1, de: tria.length, passos: passos.length });
      let aturat = false;
      passos.forEach((pas, idx) => {
        const fl = items.filter(x => x.pas === pas).map(x => x.clau).sort(per);
        const fr = { tipus: 'pas', proces: p.id, pas, idx: idx + 1, total: passos.length, fluxos: fl };
        if (o.encallat) {
          if (aturat) { fr.noArriba = true; nAturats++; }
          else if (fl.some(k => perClau[k].de === o.encallat || perClau[k].a === o.encallat)) { fr.atura = true; aturat = true; nAturats++; }
        }
        frames.push(fr); nPas++;
      });
    });
    const sempre = f.filter(x => seq[x.clau] === 'sempre').map(x => x.clau);
    const sensePas = f.filter(x => !hasOwn(seq, x.clau)).map(x => x.clau);
    const text = o.encallat
      ? 'Amb «' + o.encallat + '» encallat, ' + nAturats + ' dels ' + nPas + ' passos no es poden fer.'
      : 'Fi del pols: ' + pl(tria.length, 'procés', 'processos') + ' i ' + pl(nPas, 'pas', 'passos') + '.'
        + (sempre.length ? ' ' + (sempre.length === 1 ? '1 lliurament passa' : sempre.length + ' lliuraments passen') + ' «sempre».' : '')
        + (sensePas.length ? ' ' + (sensePas.length === 1 ? '1 lliurament no té' : sensePas.length + ' lliuraments no tenen') + ' pas.' : '');
    frames.push({ tipus: 'final', text });
    return { frames, sempre, sensePas };
  }

  /* Les vuit preguntes de l'anàlisi, cadascuna amb la dada del mapa. El mapa
     dona la dada; la conclusió la treu la sala. */
  function vuitPreguntes(m, M, desv) {
    const f = fluxos(m), nF = f.length, dec = (m.roles || []).slice();
    const tots = uniq(dec.concat(f.flatMap(x => [x.de, x.a])));
    const g = {}, sT = {}, sI = {}, eT = {}, eI = {}, veins = {};
    tots.forEach(r => { g[r] = sT[r] = sI[r] = eT[r] = eI[r] = 0; veins[r] = new Set(); });
    f.forEach(x => {
      g[x.de]++; g[x.a]++;
      (x.mena === 'intangible' ? sI : sT)[x.de]++; (x.mena === 'intangible' ? eI : eT)[x.a]++;
      if (x.de !== x.a) { veins[x.de].add(x.a); veins[x.a].add(x.de); }
    });
    if (M && M.rols) tots.forEach(r => { if (M.rols[r]) g[r] = M.rols[r].grau; });
    const P = [];
    const maxG = Math.max(0, ...tots.map(r => g[r])), mes = tots.filter(r => g[r] === maxG);
    P.push({ n: 1, pregunta: 'Qui és més actiu a la xarxa? Per què?',
      dada: nF ? unio(mes) + ', ' + maxG + ' de ' + nF + ' lliuraments' + (mes.length > 1 ? ' cadascun' : '') : 'Encara no hi ha cap lliurament' });
    const cand = dec.length ? dec : tots, minG = cand.length ? Math.min(...cand.map(r => g[r] || 0)) : 0, menys = cand.filter(r => (g[r] || 0) === minG);
    P.push({ n: 2, pregunta: 'Qui és menys actiu? Per què?',
      dada: cand.length ? unio(menys) + ', ' + minG + ' de ' + nF + ' lliuraments' + (menys.length > 1 ? ' cadascun' : '') : 'Encara no hi ha cap rol' });
    P.push({ n: 3, pregunta: 'Qui hi hauria de sortir i no hi surt? Per què?',
      dada: desv ? (desv.rols.falten.length ? 'L\'ideal preveu ' + unio(desv.rols.falten.map(r => '«' + r + '»')) + ', i al real no hi ' + (desv.rols.falten.length === 1 ? 'és' : 'són') : 'Respecte a l\'ideal, no en falta cap')
        : 'El mapa sol no ho pot saber: és per a la sala' });
    const act = dec.slice().sort((a, b) => (g[b] || 0) - (g[a] || 0) || per(a, b)), reg = [];
    act.forEach((a, i) => act.slice(i + 1).forEach(b => { if (reg.length < 3 && !(veins[a] && veins[a].has(b))) reg.push([a, b]); }));
    P.push({ n: 4, pregunta: 'Quines relacions caldria començar, enfortir o reprendre?',
      dada: reg.length ? 'Començant pels més actius, no hi ha cap vincle entre ' + reg.map(([a, b]) => a + ' i ' + b).join('; entre ') : 'Entre els rols més actius ja hi ha vincle' });
    const pairs = (m.pairs || []).filter(p => p[0] && p[1]), sencer = p => p[2] && p[3] && p[4] && p[5];
    const mitges = pairs.filter(p => !sencer(p) && ((p[2] && p[3]) || (p[4] && p[5])));
    P.push({ n: 5, pregunta: 'Tots els entregables aporten valor, o en generen un altre com a resposta?',
      dada: pairs.length ? pairs.filter(sencer).length + ' de ' + pairs.length + ' vincles tenen anada i tornada'
        + (mitges.length ? '; a mitges: ' + mitges.slice(0, 3).map(p => p[0] + ' ↔ ' + p[1]).join(', ') : '') : 'Encara no hi ha cap vincle' });
    const G = m.gomets || {}, grocs = Object.keys(G).filter(k => [].concat(G[k]).some(v => Number(v) <= -1) && f.some(x => x.clau === k));
    const contracte = pairs.filter(p => p[2] === 'tangible' && p[4] === 'tangible' && p[3] && p[5]);
    const debils = [];
    if (mitges.length) debils.push('a mitges: ' + mitges.slice(0, 3).map(p => p[0] + ' ↔ ' + p[1]).join(', '));
    if (grocs.length) debils.push('gomet groc: ' + grocs.slice(0, 3).join(', '));
    if (contracte.length) debils.push('només contracte: ' + contracte.slice(0, 3).map(p => p[0] + ' ↔ ' + p[1]).join(', '));
    P.push({ n: 6, pregunta: 'Hi ha algun intercanvi dèbil o en risc?',
      dada: debils.length ? debils.join(' · ') : 'Cap vincle a mitges, cap gomet groc i cap parell només de contracte' });
    // 7 · Valor de les dues menes: el tangible també és valor
    const majus = t => t.replace(/^./, c => c.toUpperCase());
    const res7 = dec.filter(r => !eT[r] && !eI[r]), senseT = dec.filter(r => !eT[r] && eI[r]), senseI = dec.filter(r => eT[r] && !eI[r]), p7 = [];
    if (res7.length) p7.push('no reben res: ' + unio(res7));
    if (senseT.length) p7.push('no reben cap tangible: ' + unio(senseT));
    if (senseI.length) p7.push('no reben cap intangible: ' + unio(senseI));
    P.push({ n: 7, pregunta: 'La xarxa aporta valor a tots els rols?',
      dada: !nF ? 'Encara no hi ha cap lliurament' : p7.length ? majus(p7.join('; ')) : 'Tots els rols reben alguna cosa de cada mena' });
    // 8 · Amb una línia per parell, tothom dona tants lliuraments com en rep: el que diu alguna cosa és el balanç per mena i els gomets
    const balI = r => sI[r] - eI[r], bs = tots.map(balI), maxB = Math.max(0, ...bs), minB = Math.min(0, ...bs), parts = [];
    const fitxa = r => r + ' (dona ' + pl(sI[r], 'intangible', 'intangibles') + ' i en rep ' + eI[r] + ')';
    if (maxB > 0) parts.push('dona més intangibles dels que rep: ' + unio(tots.filter(r => balI(r) === maxB).map(fitxa)));
    if (minB < 0) parts.push('rep més intangibles dels que dona: ' + unio(tots.filter(r => balI(r) === minB).map(fitxa)));
    const gm = {}; Object.keys(G).forEach(k => { const x = f.find(y => y.clau === k); if (!x) return;
      const v = [].concat(G[k]).map(Number).filter(n => Number.isFinite(n)); if (v.length) (gm[x.a] = gm[x.a] || []).push(...v); });
    const mitja = r => Math.round(gm[r].reduce((a2, b2) => a2 + b2, 0) / gm[r].length * 10) / 10, ambG = Object.keys(gm).sort(per);
    if (ambG.length) { const mn = Math.min(...ambG.map(mitja)); if (mn < 0) parts.push('el que rep ' + unio(ambG.filter(r => mitja(r) === mn)) + ' té els gomets més baixos (mitjana ' + String(mn).replace('.', ',') + ')'); }
    P.push({ n: 8, pregunta: 'Algú rep molt més del que aporta, o aporta molt més del que rep?',
      dada: !nF ? 'Encara no hi ha cap lliurament' : parts.length ? majus(parts.join('; ')) : 'Tots els rols donen tants intangibles com en reben' });
    return P;
  }

  /* ── La història per desfer ──────────────────────────────────────────────
     Cada pas guarda l'estat d'abans. Dues accions del mateix grup en menys
     d'un segon són un sol pas (el rellotge el passa qui crida). */
  function creaHistoria(max) {
    const lim = max || 100;
    let pila = [], refer = [];
    const atura = () => { if (pila.length) pila[pila.length - 1].t = null; };
    return {
      desa(s, nom, grup, ara) {
        const top = pila[pila.length - 1];
        refer = [];
        if (grup && top && top.grup === grup && ara != null && top.t != null && ara - top.t < 1000) { top.t = ara; return false; }
        pila.push({ s, nom: nom || '', grup: grup || null, t: ara == null ? null : ara });
        if (pila.length > lim) pila.shift();
        return true;
      },
      desfes(actual) { const x = pila.pop(); if (!x) return null; refer.push({ s: actual, nom: x.nom }); atura(); return x.s; },
      refes(actual) { const x = refer.pop(); if (!x) return null; pila.push({ s: actual, nom: x.nom, grup: null, t: null }); return x.s; },
      potDesfer: () => pila.length > 0,
      potRefer: () => refer.length > 0,
      nomDesfer: () => (pila.length ? pila[pila.length - 1].nom : ''),
      nomRefer: () => (refer.length ? refer[refer.length - 1].nom : ''),
      mida: () => pila.length
    };
  }

  return {
    CAMPS, MAX_PROF, R,
    liniesText, campsLinia, menaDe, menaCurta, llegeixTextos, aTextos, posaLinia, treuLinia, mouLinia, netejaNom, idProces,
    nivellBuit, importa, exporta, exportaNivell, esMapaBuit, resol, substitueix, rolsDelNivell, fluxosAmbLinia, orfes,
    detectaReanomenat, traslladaExtres,
    opAbast, opRol, opReanomenaRol, opEsborraRol, opMouRol, opOrdreRol, opOrdreParell, opFlux, opEditaFlux, opInverteix,
    opEsborraFlux, opCanviaExtrems, opProces, opEditaProces, opOrdreProces, opEsborraProces, opPas, opTreuPas, opSempre,
    opTroballa, opGomet, opPorta, opExtern, opCreaDins, opEndreca,
    copiaIdeal, idealBlanc, portaAlReal, portaAIdeal, posaAlies, segueixNom, rolIdeal, reanomenaIdeal,
    colocaConcentric, forat, caixa, encaixa, posicionsNivell, completaPos,
    escena, desviacioNivell, encalla, planPols, vuitPreguntes, creaHistoria
  };
}
/*/VS-MODEL*/
/*VS-WEB*/
/* ── La web que surt del mapa ──────────────────────────────────────────────
 * Demanat per l'Àlvar (09/10/2026): que mentre es dibuixa el mapa es vegi la
 * web que en surt, amb el menú, les pàgines, el contingut i els serveis, i que
 * ja hi siguin l'alta, la integració i la benvinguda de cada rol.
 *
 * És una funció pura del mapa —no llegeix el DOM—, i per això la prova el
 * motor a la CI. Les regles, escrites aquí perquè són decisions:
 *
 *  · **Una porta per rol que no és de casa.** «De casa» són els rols que fan
 *    la web: per defecte, el que més lliuraments té. Els altres de casa van a
 *    «Per a l'equip».
 *  · **El contingut d'una porta és el mapa, no un text de farciment.** «Què et
 *    donem» són els lliuraments de casa cap a aquell rol, i «Què ens dones», els
 *    seus cap a casa. Si no n'hi ha, la pàgina ho diu: és una troballa.
 *  · **La benvinguda surt de la seqüència.** El primer que rebrà és el primer
 *    lliurament de casa en l'ordre dels processos.
 *  · **El compte només quan hi ha relació d'anada i tornada.** Qui només
 *    llegeix no ha de donar-se d'alta.
 *  · **Els serveis són els processos**, amb els passos en ordre.
 *  · **Les connexions es proposen per paraules del mapa,** i se'n diu la
 *    paraula: és una pista, no una dada. */
const WEB_CONNEXIONS = [
  { cat: 'crm',     nom: 'CRM',               re: /client|contact|consult|pressupost|presupuest|lead|comercial|venda|venta/i },
  { cat: 'cobros',  nom: 'Cobraments',        re: /cobr|pag|factur|diner|dinero|preu|precio|quota|cuota/i },
  { cat: 'venta',   nom: 'Botiga',            re: /comand|pedid|botig|tiend|compra|producte|producto|catàleg|catálogo/i },
  { cat: 'oficina', nom: 'Agenda',            re: /cita|reserv|visit|agenda|calendari|calendario|grup|grupo/i },
  { cat: 'comunica',nom: 'Missatges',         re: /avís|aviso|avisar|butllet|bolet|notícia|noticia|difus|relat|explica|parlar|hablar/i },
  { cat: 'web',     nom: 'Dades pròpies',     re: /estoc|stock|inventari|magatzem|almac|registre|registro|dades|datos/i }
];
/* Un nom fet adreça: sense accents ni signes. El fan servir la web i el cervell. */
const webSlug = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'pagina';
function webDelMapa(m, opts) {
  const o = opts || {};
  const roles = (m.roles || []).filter(Boolean);
  const fl = [];
  (m.pairs || []).forEach(p => {
    if (!p[0] || !p[1]) return;
    if (p[3]) fl.push({ de: p[0], a: p[1], mena: p[2] || '', q: p[3] });
    if (p[5]) fl.push({ de: p[1], a: p[0], mena: p[4] || '', q: p[5] });
  });
  const seq = m.seq || {}, procs = (m.processos || []).filter(p => p && (p.id || p.nom));
  const ordreProc = {}; procs.forEach((p, i) => { ordreProc[p.id] = i; });
  /* L'ordre en què passen les coses: primer el que té pas dins d'un procés,
     pel procés i el pas; després el que passa «sempre»; al final, la resta. */
  const pes = f => {
    const s = seq[f.de + '→' + f.a];
    if (Array.isArray(s) && s[0] in ordreProc) return ordreProc[s[0]] * 1000 + (Number(s[1]) || 0);
    return s === 'sempre' ? 900000 : 990000;
  };
  const enOrdre = a => a.map((f, i) => [f, i]).sort((x, y) => pes(x[0]) - pes(y[0]) || x[1] - y[1]).map(x => x[0]);
  const compta = r => fl.filter(f => f.de === r || f.a === r).length;
  let casa = (o.casa || []).filter(r => roles.includes(r));
  if (!casa.length && roles.length) casa = [roles.reduce((a, r) => (compta(r) > compta(a) ? r : a), roles[0])];
  const esCasa = r => casa.includes(r);
  const slug = webSlug;
  const usats = {};
  const id = s => { let b = slug(s), k = b, n = 2; while (usats[k]) k = b + '-' + n++; usats[k] = 1; return k; };
  id('inici'); id('serveis'); id('equip');
  const connexions = text => WEB_CONNEXIONS.map(c => { const x = text.match(c.re); return x ? { cat: c.cat, nom: c.nom, per: x[0].toLowerCase() } : null; }).filter(Boolean);

  const portes = roles.filter(r => !esCasa(r)).map(r => {
    const rep = enOrdre(fl.filter(f => f.a === r && esCasa(f.de)));
    const dona = enOrdre(fl.filter(f => f.de === r && esCasa(f.a)));
    const xarxa = enOrdre(fl.filter(f => (f.de === r || f.a === r) && !esCasa(f.de) && !esCasa(f.a)));
    const compte = rep.length > 0 && dona.length > 0;
    const con = connexions([r].concat(rep.map(f => f.q), dona.map(f => f.q)).join(' · '));
    const benvinguda = [{ pas: 'coneix', t: 'Coneix-nos', d: 'La porta «' + r + '»: què et donem i què et demanem.' }];
    benvinguda.push(compte
      ? { pas: 'compte', t: 'Crea el teu compte', d: 'Hi ha anada i tornada: amb un compte veus el que és teu i en dius la teva.' }
      : { pas: 'sense-compte', t: 'Sense compte', d: 'La relació va en un sol sentit: llegir i escriure\'ns n\'hi ha prou.' });
    if (con.length) benvinguda.push({ pas: 'connecta', t: 'Connecta el que ja fas servir', d: con.map(c => c.nom).join(', ') + '.' });
    if (rep[0]) benvinguda.push({ pas: 'primer', t: 'El primer que rebràs', d: rep[0].q });
    if (dona[0]) benvinguda.push({ pas: 'demanem', t: 'El primer que et demanarem', d: dona[0].q });
    return { id: id(r), rol: r, rep, dona, xarxa, compte, connexions: con, benvinguda,
      buida: !rep.length && !dona.length };
  });
  const serveis = procs.map(p => {
    const passos = Object.keys(seq).filter(k => Array.isArray(seq[k]) && seq[k][0] === p.id)
      .map(k => { const [de, a] = k.split('→'); const f = fl.find(x => x.de === de && x.a === a); return { de, a, q: f ? f.q : '', n: Number(seq[k][1]) || 0 }; })
      .sort((x, y) => x.n - y.n);
    return { id: id(p.nom || p.id), proc: p.id, nom: p.nom || p.id, d: p.d || '', passos };
  });
  const sempre = Object.keys(seq).filter(k => seq[k] === 'sempre').map(k => { const [de, a] = k.split('→'); const f = fl.find(x => x.de === de && x.a === a); return { de, a, q: f ? f.q : '' }; });
  const menu = [{ id: 'inici', t: 'Inici' }].concat(portes.map(p => ({ id: p.id, t: p.rol, rol: p.rol })));
  if (serveis.length) menu.push({ id: 'serveis', t: 'Serveis' });
  menu.push({ id: 'equip', t: 'Per a l\'equip' });
  return {
    formato: 'tt-web-1',
    titol: m.abast || '',
    casa, menu, portes, serveis, sempre,
    equip: { rols: casa, intern: enOrdre(fl.filter(f => esCasa(f.de) && esCasa(f.a))) },
    alta: portes.filter(p => p.compte).map(p => p.rol)
  };
}
/*/VS-WEB*/
/*VS-SITE*/
/* ── De web.json a la web de debò ──────────────────────────────────────────
 * Demanat per l'Àlvar (09/10/2026): que des del mapa es pugui fer la web del
 * client, amb bones pràctiques W3C, integrable per API, fent servir els correus
 * i la mateixa web com a base de dades, DRY radical i al mínim cost, i que
 * tendeixi a la permaweb.
 *
 * Com ho complim, i per què:
 *
 *  · **Una sola font.** La web surt de `web.json`, i `web.json` surt del mapa.
 *    Cap HTML es toca a mà: es canvia el mapa i es torna a generar. El mateix
 *    codi el fan servir l'editor (el botó) i Node (`SOS/tools/web-del-mapa.js`).
 *  · **La web és la base de dades.** Cada pàgina porta les seves dades en
 *    JSON-LD (schema.org): qualsevol màquina —un cercador, una IA, una altra
 *    web— les llegeix sense API. I `web.json` va al costat, enllaçat.
 *  · **El correu és la safata d'entrada.** Els formularis són de Netlify Forms:
 *    cada enviament arriba per correu i, si hi ha CRM, al CRM (nivell 2). Sense
 *    Netlify, l'adreça de correu de la pàgina fa la mateixa feina.
 *  · **Cost zero de servidor.** HTML i CSS estàtics, sense JavaScript, sense
 *    dependències i sense res que s'hagi de mantenir.
 *  · **Permaweb.** Els enllaços són relatius i el zip és determinista (sempre
 *    els mateixos bytes per al mateix mapa). `permaweb.json` en dona l'empremta
 *    SHA-256 de cada fitxer: el que es puja a IPFS o Arweave es pot comprovar.
 *  · **W3C.** `lang`, `charset`, `viewport`, enllaç per saltar al contingut,
 *    `header`/`nav`/`main`/`footer`, `aria-current`, etiquetes als camps,
 *    focus visible, mode fosc i objectius de 44 px. */
/* El kit de Claude del repositori del client: les regles (CLAUDE.md), la guia
   per treballar-hi (gratis, amb Claude Code o amb TeamTowers), les tres skills
   i les etiquetes de cerebro/tasques-ia.md. Tot en català i en castellà.
   «La màquina proposa, una persona accepta»: cap text promet que la IA faci
   la feina sola. Els plans de Claude canvien: es diu la data i s'enllaça
   https://claude.com/pricing, mai un preu. '{nom}' és el nom de la web i pot
   sortir més d'un cop: cal substituir-lo tot (split/join), no amb un replace. */
const KIT_TXT = {
  ca: {
    claude: ['# {nom} · regles per a qui hi treballa, persona o IA', '',
      'Aquesta web surt del mapa de valor i d\'uns quants textos. **L\'HTML no s\'edita a mà:** es canvia la font i es torna a generar.', '',
      '## Les fonts', '',
      '- **`cerebro/mapa-real.json`** (i `cerebro/mapa-ideal.json`, si n\'hi ha): el mapa. Mana sobre les pàgines, els rols i els serveis. Es canvia a l\'editor del mapa de valor, i s\'hi desa el que dona «Copia el JSON».',
      '- **`cerebro/continguts/<id>.md`**: el text de les pàgines. `<id>` és `inici`, `serveis`, la porta d\'un rol (el nom del seu `.html`) o una pàgina nova.',
      '- **`cerebro/fonts/`**: el que ja hi havia (la web d\'abans, documents, un CSV), importat en Markdown. L\'índex és `cerebro/fonts/index.md`.',
      '- **`cerebro/dossier.md`**: què és el negoci, què ofereix i a qui. Cada afirmació porta l\'enllaç a la seva font.',
      '- **`cerebro/decisiones.md`**: el que s\'acorda i per què, amb la data.',
      '- **`cerebro/marca.json`**, si n\'hi ha: el color, la lletra, la forma, el logo (SVG), els textos propis i on sou (adreça, telèfon de la casa, horari). El telèfon de la web va aquí, no als continguts.',
      '- **`cerebro/configuracio.json`**: el que es va triar a l\'editor (nom, llengua, rols de casa, correu dels formularis, adreça). `eines/genera.mjs` el llegeix; una variable `TT_*` hi passa per sobre.',
      '- **`CEREBRO.md`**: l\'índex de tot el cervell, per tema i per capa.', '',
      '## Regenerar', '',
      '- `node eines/genera.mjs` (Node 18 o més nou) torna a fer la web i el cervell. Fes-ho després de canviar una font, i posa\'n el resultat a la mateixa PR.',
      '- **Si no hi ha `cerebro/mapa-real.json`, para.** Demana a la persona que hi enganxi el JSON de l\'editor del mapa de valor («Copia el JSON»). Sense mapa surt la web d\'exemple.',
      '- Tot el que es genera es sobreescriu, **excepte**: `netlify.toml`, `cerebro/mapa-real.json`, `cerebro/mapa-ideal.json`, `cerebro/decisiones.md`, `cerebro/dossier.md` i tot el que hi ha a `cerebro/fonts/`, `cerebro/continguts/` i `cerebro/esborranys/`. Això no es genera mai: s\'escriu.', '',
      '## Les tres skills (`.claude/skills/`)', '',
      '- **`/importa <url o carpeta>`**: porta al cervell el que ja hi ha i escriu el dossier. El primer dia, o quan arriba material nou.',
      '- **`/continguts [pàgina]`**: escriu o actualitza el text de les pàgines des del dossier, les fonts i el mapa.',
      '- **`/tasca <lliurament o id>`**: prepara l\'esborrany d\'una tasca de rutina de `cerebro/tasques-ia.md`.', '',
      '## La feina de rutina: la màquina proposa, una persona accepta', '',
      '`cerebro/tasques-ia.md` surt del mapa i diu quins lliuraments pot esborranyar la IA i quins no.', '',
      '- **Cap lliurament intangible es fa amb IA.** Mai. El fa una persona del rol.',
      '- **La IA només fa esborranys**, a `cerebro/esborranys/`. No envia, no publica, no paga ni signa res.',
      '- **L\'accepta una persona del rol que el produeix.** Fins llavors, l\'esborrany no existeix.',
      '- **El que no saps, `[a completar]`.** No t\'inventis cap dada, xifra ni cita.',
      '- **Rols, mai noms de persona.**', '',
      '## Privadesa i seguretat', '',
      '- **Dades personals, preus pactats i contractes van al CRM.** Mai al repositori: el llegeixen màquines i pot acabar sent públic.',
      '- **Cap clau al repositori.** Les del CRM, la IA o els pagaments van a les variables d\'entorn de Netlify.',
      '- **HTML i CSS estàtics, sense JavaScript.** Cada pàgina porta les seves dades en JSON-LD (schema.org), i `web.json` les té totes.',
      '- **Els formularis són de Netlify Forms** i arriben per correu.', '',
      '## Com es treballa', '',
      '- **Cada canvi, en una PR.** Netlify en publica una vista prèvia, i qui decideix la mira abans d\'acceptar-la.',
      '- **L\'API i els avisos són a `API.md`.** `.mcp.json` connecta `eines/mcp.mjs`, un servidor MCP que només llegeix el que surt a l\'índex del cervell.',
      '- **El registre viu.** Cada lliurament entre rols s\'anota a `registre.html`. El CSV de Netlify va a `cerebro/registro/registre.csv`, i `node eines/registre.mjs` en treu l\'informe i la desviació.',
      '- **Com treballar amb Claude**, gratis o amb Claude Code: `TREBALLAR-AMB-CLAUDE.md`.'],
    stub: ['# Abans de generar la web · Antes de generar la web', '',
      '**ca.** Aquí encara falta gairebé tot: les pàgines, `cerebro/` i les skills apareixen en executar `node eines/genera.mjs` (Node 18 o més nou). Netlify ho fa a cada publicació, però no ho desa al repositori.', '',
      '1. Primer ha d\'existir `cerebro/mapa-real.json`: desa-hi el que dona l\'editor del mapa de valor («Copia el JSON»). Sense mapa surt la web d\'exemple.',
      '2. Després, `node eines/genera.mjs`.',
      '3. En acabar, el `CLAUDE.md` complet substitueix aquest, i les skills `/importa`, `/continguts` i `/tasca` apareixen a `.claude/skills/`.', '',
      'Cap clau ni dada personal al repositori. Cada canvi, en una PR.', '',
      '---', '',
      '**es.** Aquí todavía falta casi todo: las páginas, `cerebro/` y las skills aparecen al ejecutar `node eines/genera.mjs` (Node 18 o más nuevo). Netlify lo hace en cada publicación, pero no lo guarda en el repositorio.', '',
      '1. Primero tiene que existir `cerebro/mapa-real.json`: guarda en él lo que da el editor del mapa de valor («Copia el JSON»). Sin mapa sale la web de ejemplo.',
      '2. Después, `node eines/genera.mjs`.',
      '3. Al terminar, el `CLAUDE.md` completo sustituye a este, y las skills `/importa`, `/continguts` y `/tasca` aparecen en `.claude/skills/`.', '',
      'Ninguna clave ni dato personal en el repositorio. Cada cambio, en una PR.'],
    guia: ['# Treballar amb Claude a la web de {nom}', '',
      'Hi ha tres maneres. Totes fan servir les mateixes regles (`CLAUDE.md`) i el mateix cervell (`cerebro/`). I en totes, **la màquina proposa i una persona accepta**: res es publica sense una PR que algú ha mirat.', '',
      'Els plans de Claude canvien. Això és com era a l\'octubre de 2026. Els plans i els preus de cada moment: https://claude.com/pricing.', '',
      '**El repositori, privat.** El cervell parla del negoci: a GitHub, Settings › General › Danger Zone › Change visibility › Private. Netlify i Claude hi treballen igual.', '',
      '## 1 · Gratis, amb claude.ai (pla Free)', '',
      '**Claude Code no és al pla gratuït (Free).** El pla Free sí que deixa treballar amb el cervell de la web, llegint-lo:', '',
      '1. A claude.ai, crea un projecte: «Web de {nom}».',
      '2. Copia el text de `CLAUDE.md` a les instruccions del projecte.',
      '3. Afegeix el repositori al coneixement del projecte amb la integració de GitHub. Tria `CLAUDE.md`, `CEREBRO.md` i la carpeta `cerebro/`.',
      '4. Després de cada canvi al repositori, prem **Sync** perquè Claude vegi la versió nova.',
      '5. Puja les skills. A GitHub, Code › Download ZIP. Dins hi ha `.claude/skills/` (és una carpeta oculta): fes un zip de cada carpeta (`importa`, `continguts`, `tasca`) i puja\'ls a l\'apartat de skills de la configuració de Claude. Cal tenir activat «Code execution and file creation».', '',
      '**Què pot fer:** llegir el mapa, les fonts i el dossier, i escriure el dossier, el text de les pàgines, els esborranys de les tasques o una proposta de mapa.', '',
      '**Què no pot fer:** escriure al repositori. La integració de GitHub només llegeix. Claude et dona els fitxers, i tu:', '',
      '- Els puges a GitHub: entra a la carpeta (per exemple `cerebro/continguts/`), **Add file › Upload files**, i tria «Create a new branch… and start a pull request». Netlify en publica la vista prèvia.',
      '- O els envies a TeamTowers i els hi pugem nosaltres.', '',
      '**Els límits:**', '',
      '- Menys ús que als plans de pagament. Quan s\'acaba, cal esperar.',
      '- Fins a 5 projectes.',
      '- No hi ha ordres amb barra (`/importa`). Demana-ho amb paraules («importa aquesta web») i Claude tria la skill.',
      '- Tot el que poses al projecte ha de cabre en el context de la conversa. Si el cervell és gran, tria només el que cal.',
      '- No executa les eines del repositori sobre la teva web. Per importar, li enganxes o puges el text de les pàgines i els documents.', '',
      '## 2 · Amb Claude Code (pla de pagament o clau d\'API)', '',
      'Claude Code ve amb els plans de pagament (Pro o superior) o amb una clau d\'API de la Claude Console, que es paga per ús. Els comptes nous de la Console de vegades porten una mica de crèdit de prova.', '',
      '- **Al navegador:** claude.ai/code, amb el repositori de GitHub.',
      '- **A l\'ordinador:** l\'aplicació d\'escriptori, o l\'ordre `claude` dins la carpeta del repositori.', '',
      '`CLAUDE.md`, les skills de `.claude/skills/` i `.mcp.json` es carreguen sols. El servidor MCP (`eines/mcp.mjs`) demana permís abans de funcionar. Claude executa les eines i obre la PR; qui decideix l\'accepta o no.', '',
      'Una sessió típica:', '',
      '1. `/importa https://la-web-actual`: porta la web d\'ara a `cerebro/fonts/` i escriu `cerebro/dossier.md`.',
      '2. Llegeixes el dossier i la llista «Per confirmar».',
      '3. `/continguts`: escriu el text de les pàgines a `cerebro/continguts/`.',
      '4. `node eines/genera.mjs`: torna a fer la web (Node 18 o més nou).',
      '5. Una PR. Mires la vista prèvia de Netlify i l\'acceptes o no.', '',
      'Per a la rutina, `/tasca <lliurament>` prepara un esborrany i l\'accepta una persona del rol que el produeix.', '',
      '## 3 · Amb TeamTowers', '',
      '- A la primera sessió fem la importació i els primers continguts, amb tu.',
      '- Després podem mantenir en marxa les tasques de rutina («Sistema viu»): la IA prepara els esborranys i una persona del rol els accepta. Sempre.',
      '- El repositori i la web te\'ls pots endur quan vulguis.', '',
      '## Què va on', '',
      '| Què | On |', '| --- | --- |',
      '| El mapa, real i ideal | `cerebro/mapa-real.json` i `cerebro/mapa-ideal.json`. Es canvia a l\'editor del mapa de valor |',
      '| El text de les pàgines | `cerebro/continguts/` |',
      '| El que ja tenies: web, documents, CSV | `cerebro/fonts/` |',
      '| Què és el negoci, amb les fonts | `cerebro/dossier.md` |',
      '| El que s\'acorda i per què | `cerebro/decisiones.md` |',
      '| Els esborranys de la rutina | `cerebro/esborranys/` |',
      '| Dades personals, preus pactats, contractes | Al CRM. Mai al repositori |'],
    skills: {
      importa: ['---', 'name: importa',
        'description: Porta al cervell el que ja hi ha (la web d\'ara, documents, un CSV) i escriu el dossier amb la font de cada afirmació. Fes-la servir el primer dia o quan arriba material nou.',
        'argument-hint: "<url o carpeta>"', '---', '',
        '# Importar el que ja hi ha', '',
        'Que tot el que se sap del negoci sigui a `cerebro/fonts/`, i que `cerebro/dossier.md` ho resumeixi dient d\'on surt cada cosa.', '',
        '## Passos', '',
        '1. **Importa.** Executa `node eines/importa.mjs $ARGUMENTS` (Node 18 o més nou; `--max 30` limita les pàgines). Escriu `cerebro/fonts/web/`, `cerebro/fonts/docs/`, `cerebro/fonts/dades/`, `cerebro/fonts/index.md` i `cerebro/fonts/fonts.json`.',
        '   - **Una web, només la de qui t\'ho demana i amb el seu permís:** afegeix `--autoritzat <domini>` (el mateix domini que llegeixes). Si no és la seva web, para.',
        '   - **D\'una taula (.csv) només entra la capçalera** i quantes files té. Pregunta quines columnes calen i torna-la a importar amb `--columnes "a,b"`. Les de persona no hi entren mai.',
        '   - Si no pots executar ordres (per exemple, a claude.ai), demana a la persona que t\'enganxi o pugi el text de les pàgines i dels documents. Escriu tu els fitxers, amb el mateix format: un `.md` per font a `web/`, `docs/` o `dades/`, que comença així, i afegeix cada font a `cerebro/fonts/index.md`:',
        '', '   ```markdown', '   ---', '   font: https://la-web-actual/serveis (o el nom del fitxer)', '   tipus: web', '   titol: Serveis', '   importat: AAAA-MM-DD', '   ---', '   ```', '', '   `tipus` és `web`, `doc` o `dades`.',
        '2. **Llegeix `cerebro/fonts/index.md`**, i després les fonts que hi surten.',
        '3. **El que no s\'ha pogut llegir.** A `cerebro/fonts/fonts.json`, la llista `fora` diu què ha quedat fora (els PDF i els Word, per exemple). Fes-ne la llista i demana-ho a la persona, enganxat com a text o pujat.',
        '4. **Escriu o actualitza `cerebro/dossier.md`:** què és el negoci, què ofereix, a qui i com hi treballa. **Cada afirmació porta l\'enllaç a la seva font**, per exemple `([font](fonts/web/serveis.md))`. Sense font, no s\'escriu: va a la llista «Per confirmar», al final. Si el dossier ja existeix, conserva el que hi ha i afegeix-hi.',
        '5. **Cap dada personal.** L\'importador amaga correus i telèfons: no els tornis a posar. No copiïs noms de persones, ni de clients ni de l\'equip: parla de rols. Els preus pactats i els contractes van al CRM.',
        '6. **Si encara no hi ha mapa** (`cerebro/mapa-real.json`), proposa\'n un esborrany a `cerebro/proposta-mapa.json`, amb el format de l\'editor del mapa de valor:',
        '   `{"abast": "…", "roles": ["…"], "pairs": [["A", "B", "tangible", "el que va d\'A a B", "intangible", "el que torna de B a A"]], "processos": [{"id": "…", "nom": "…", "d": "…"}], "seq": {"A→B": ["id del procés", 1]}, "troballes": [{"t": "…", "d": "…"}], "dubtes": []}`',
        '   - A `seq`, cada flux porta `[procés, pas]` o `"sempre"`.',
        '   - De 6 a 12 rols. Un rol és el que algú fa, no una persona ni un càrrec.',
        '   - Com a mínim un terç dels lliuraments, intangibles.',
        '   - Tot vincle és recíproc: cada parell porta un lliurament en cada sentit.',
        '   - Cap nom propi de persona ni d\'empresa.',
        '   - És una proposta. La persona la carrega a l\'editor i es valida a la sessió. No la copiïs a `mapa-real.json`.',
        '7. **Acaba amb un resum:** què s\'ha importat (quantes fonts de cada tipus i quantes dades amagades), què falta i la llista «Per confirmar».'],
      continguts: ['---', 'name: continguts',
        'description: Escriu o actualitza el text de les pàgines de la web (cerebro/continguts) a partir del dossier, les fonts i el mapa. Fes-la servir després d\'importar o quan cal canviar el text d\'una pàgina.',
        'argument-hint: "[pàgina]"', '---', '',
        '# Escriure el text de la web', '',
        'Les pàgines surten del mapa. El text de dins surt d\'aquí: un fitxer per pàgina a `cerebro/continguts/<id>.md`. El generador el fa HTML i no el sobreescriu mai.', '',
        '## Quines pàgines', '',
        '- `inici`: la portada.',
        '- `serveis`: la pàgina de serveis.',
        '- La porta de cada rol: el nom del seu fitxer a la web generada, sense `.html` (si hi ha `qui-compra.html`, l\'id és `qui-compra`).',
        '- Pàgines noves, amb un id curt en minúscules i guions (`qui-som`, `preguntes-frequents`) i `menu: si` perquè surtin al menú.',
        '- Aquests id no es poden fer servir: `equip`, `registre`, `gracies`, `404`, `estil`, `web`, `index`.', '',
        'Si et diuen una pàgina (`$ARGUMENTS`), treballa només en aquella. Si no, proposa la llista i comença per `inici`.', '',
        '## El format', '',
        '```markdown', '---', 'titol: Qui som', 'menu: si', 'font: cerebro/fonts/web/qui-som.md, cerebro/dossier.md', 'fet: esborrany fet amb IA (Claude), AAAA-MM-DD', '---', '',
        '## Un títol de secció', '', 'Un paràgraf.', '```', '',
        'Només aquest Markdown: `##` i `###`, paràgrafs, llistes, **negreta**, *cursiva*, enllaços `http(s)`, `mailto:` o relatius, i imatges només relatives, dins `imatges/`. La resta surt com a text: res d\'HTML.', '',
        '## Passos', '',
        '1. Llegeix `cerebro/dossier.md`, `cerebro/fonts/index.md`, el mapa (`cerebro/mapa-real.json`) i el contingut que ja té la pàgina, si en té.',
        '2. Escriu només el que diuen les fonts, i posa-les a `font:`. Res inventat: ni xifres, ni clients, ni cites, ni promeses.',
        '3. On falta alguna cosa, `[a completar]`. Digues-ho al resum.',
        '4. Cap dada personal (noms de persona, correus, telèfons) ni cap preu pactat. Això va al CRM.',
        '5. Escriu en la llengua de qui visita la web i amb el to que ja fa servir la casa a les fonts. Frases curtes, paraules planes.',
        '6. Executa `node eines/genera.mjs` i mira la pàgina generada (`<id>.html`, o `index.html` per a `inici`): que es llegeixi bé i que els enllaços vagin.',
        '7. Obre una PR amb el canvi, mai directament a la branca principal: la persona mira la vista prèvia de Netlify i decideix. **Acceptar la PR és acceptar el text**, i queda dit qui ho ha fet. Si no pots obrir-la, dona-li els fitxers perquè els pugi.'],
      tasca: ['---', 'name: tasca',
        'description: Prepara l\'esborrany d\'una tasca de rutina de cerebro/tasques-ia.md perquè l\'accepti una persona del rol que la produeix. Fes-la servir quan toca un lliurament tangible que la IA pot esborranyar.',
        'argument-hint: "<lliurament o id>"', '---', '',
        '# Preparar l\'esborrany d\'una tasca', '',
        'La màquina proposa, una persona accepta. Aquesta skill només fa esborranys: no envia, no publica, no paga ni signa res.', '',
        '## Passos', '',
        '1. Llegeix `cerebro/tasques-ia.json` i busca la tasca (`$ARGUMENTS`) pel seu `id` o pel lliurament (`q`). Si n\'hi encaixa més d\'una, pregunta quina. Si no n\'hi ha cap, digues-ho i para.',
        '2. **Si no té `pot: true`, explica per què i para:**',
        '   - Intangible: el fa una persona del rol, mai la IA. Cap esborrany, ni «només per ajudar».',
        '   - Tangible sense tipus declarat, o sense mena: cal decidir-ne el tipus a la sessió i anotar-lo al mapa.',
        '   - El tipus no surt d\'una màquina (un acord, una factura): el fa i en respon una persona.',
        '3. Mira què demana `cal` i pregunta a la persona el que falti. Si alguna dada porta noms de persona, demana-la per rols.',
        '4. Escriu l\'esborrany a `cerebro/esborranys/AAAA-MM-DD-<id>.md` (la data d\'avui), amb la forma que diu `surt`. Comença amb aquesta capçalera, perquè digui qui l\'ha fet:',
        '', '   ```markdown', '   ---', '   tasca: <id>', '   tipus: <tipus>', '   de: <rol que el produeix>', '   a: <rol que el rep>',
        '   fet: esborrany fet amb IA (Claude), AAAA-MM-DD', '   accepta: <rol>', '   estat: esborrany', '   ---', '   ```', '',
        '5. Cada dada que no tens, `[a completar]`. No t\'inventis cap xifra, data, acord ni nom. Cap nom de persona: només rols. Ni preus pactats ni dades personals.',
        '6. Digues qui l\'ha d\'acceptar: una persona del rol de `accepta`, que és qui produeix el lliurament.',
        '7. Obre una PR amb l\'esborrany, o dona el fitxer si no pots. Quan aquella persona l\'accepta, a la mateixa PR passa a `estat: acceptat AAAA-MM-DD`.',
        '8. **Fins que l\'accepta, l\'esborrany no existeix:** no es fa servir, no s\'envia i no es publica.'] },
    tasques: { titol: 'Tasques per a la IA · {nom}',
      generat: 'Generat del mapa de valor. No s\'edita a mà: es regenera amb la web.',
      regla: 'La regla és una: **la màquina proposa, una persona accepta.** Un lliurament intangible (confiança, un consell, un avís, un favor) no el fa mai la IA: el fa una persona del rol. Un lliurament tangible, amb un tipus declarat que pot sortir d\'una màquina, pot tenir un esborrany fet amb IA, i només si el lliura un rol de casa. Tres frens: la IA només fa esborranys i no envia, no publica ni signa res; cap intangible es fa amb IA, mai; i cada esborrany diu que l\'ha fet una IA, quin dia i quin rol l\'ha d\'acceptar. Fins que l\'accepta una persona del rol que el produeix, l\'esborrany no existeix.',
      recompte: '{m} de {t} lliuraments: la IA en pot preparar l\'esborrany',
      maquina: 'La IA en pot preparar l\'esborrany',
      persona: ['Els fa una persona', 'Són intangibles, o el seu tipus no surt d\'una màquina: la IA no hi entra.'],
      senseTipus: ['Per decidir', 'Són tangibles però encara no tenen tipus declarat: decidiu-ne el tipus a la sala.'],
      deFora: ['Arriben de fora', 'Els prepara qui els envia. El que en feu vosaltres (respondre, servir-ho) és un altre lliurament del mapa.'],
      perConfirmar: 'Els tipus surten del nom de cada lliurament (la paraula entre cometes): confirmeu-los a la sala abans de fer-los servir.',
      cols: { q: 'Lliurament', deA: 'De → a', tipus: 'Tipus', cal: 'Què cal', surt: 'Què en surt', accepta: 'Qui l\'accepta' },
      motius: { intangible: 'És intangible: el fa una persona del rol, mai la IA.',
        'mena desconeguda': 'El mapa no diu si és tangible o intangible: decidiu-ho a la sala.',
        'sense entregable declarat': 'Encara no té tipus declarat: decidiu-ne el tipus a la sala.',
        'el tipus no surt d\'una màquina': 'El seu tipus no surt d\'una màquina (un acord, una factura): el fa i en respon una persona.',
        'de fora': 'Arriba d\'un rol de fora: el prepara qui l\'envia.' } }
  },
  es: {
    claude: ['# {nom} · reglas para quien trabaja en ella, persona o IA', '',
      'Esta web sale del mapa de valor y de unos cuantos textos. **El HTML no se edita a mano:** se cambia la fuente y se vuelve a generar.', '',
      '## Las fuentes', '',
      '- **`cerebro/mapa-real.json`** (y `cerebro/mapa-ideal.json`, si lo hay): el mapa. Manda sobre las páginas, los roles y los servicios. Se cambia en el editor del mapa de valor, y se guarda en él lo que da «Copia el JSON».',
      '- **`cerebro/continguts/<id>.md`**: el texto de las páginas. `<id>` es `inici`, `serveis`, la puerta de un rol (el nombre de su `.html`) o una página nueva.',
      '- **`cerebro/fonts/`**: lo que ya había (la web de antes, documentos, un CSV), importado en Markdown. El índice es `cerebro/fonts/index.md`.',
      '- **`cerebro/dossier.md`**: qué es el negocio, qué ofrece y a quién. Cada afirmación lleva el enlace a su fuente.',
      '- **`cerebro/decisiones.md`**: lo que se acuerda y por qué, con la fecha.',
      '- **`cerebro/marca.json`**, si lo hay: el color, la letra, la forma, el logo (SVG), los textos propios y dónde estáis (dirección, teléfono de la casa, horario). El teléfono de la web va aquí, no en los contenidos.',
      '- **`cerebro/configuracio.json`**: lo que se eligió en el editor (nombre, idioma, roles de casa, correo de los formularios, dirección). `eines/genera.mjs` lo lee; una variable `TT_*` pasa por encima.',
      '- **`CEREBRO.md`**: el índice de todo el cerebro, por tema y por capa.', '',
      '## Regenerar', '',
      '- `node eines/genera.mjs` (Node 18 o más nuevo) vuelve a hacer la web y el cerebro. Hazlo después de cambiar una fuente, y pon el resultado en la misma PR.',
      '- **Si no hay `cerebro/mapa-real.json`, para.** Pide a la persona que pegue en él el JSON del editor del mapa de valor («Copia el JSON»). Sin mapa sale la web de ejemplo.',
      '- Todo lo que se genera se sobrescribe, **excepto**: `netlify.toml`, `cerebro/mapa-real.json`, `cerebro/mapa-ideal.json`, `cerebro/decisiones.md`, `cerebro/dossier.md` y todo lo que hay en `cerebro/fonts/`, `cerebro/continguts/` y `cerebro/esborranys/`. Eso no se genera nunca: se escribe.', '',
      '## Las tres skills (`.claude/skills/`)', '',
      '- **`/importa <url o carpeta>`**: trae al cerebro lo que ya hay y escribe el dossier. El primer día, o cuando llega material nuevo.',
      '- **`/continguts [página]`**: escribe o actualiza el texto de las páginas desde el dossier, las fuentes y el mapa.',
      '- **`/tasca <entregable o id>`**: prepara el borrador de una tarea de rutina de `cerebro/tasques-ia.md`.', '',
      '## El trabajo de rutina: la máquina propone, una persona acepta', '',
      '`cerebro/tasques-ia.md` sale del mapa y dice qué entregables puede preparar en borrador la IA y cuáles no.', '',
      '- **Ningún entregable intangible se hace con IA.** Nunca. Lo hace una persona del rol.',
      '- **La IA solo hace borradores**, en `cerebro/esborranys/`. No envía, no publica, no paga ni firma nada.',
      '- **Lo acepta una persona del rol que lo produce.** Hasta entonces, el borrador no existe.',
      '- **Lo que no sabes, `[a completar]`.** No te inventes ningún dato, cifra ni cita.',
      '- **Roles, nunca nombres de persona.**', '',
      '## Privacidad y seguridad', '',
      '- **Datos personales, precios pactados y contratos van al CRM.** Nunca al repositorio: lo leen máquinas y puede acabar siendo público.',
      '- **Ninguna clave en el repositorio.** Las del CRM, la IA o los pagos van en las variables de entorno de Netlify.',
      '- **HTML y CSS estáticos, sin JavaScript.** Cada página lleva sus datos en JSON-LD (schema.org), y `web.json` los tiene todos.',
      '- **Los formularios son de Netlify Forms** y llegan por correo.', '',
      '## Cómo se trabaja', '',
      '- **Cada cambio, en una PR.** Netlify publica una vista previa, y quien decide la mira antes de aceptarla.',
      '- **La API y los avisos están en `API.md`.** `.mcp.json` conecta `eines/mcp.mjs`, un servidor MCP que solo lee lo que sale en el índice del cerebro.',
      '- **El registro vivo.** Cada entregable entre roles se anota en `registre.html`. El CSV de Netlify va a `cerebro/registro/registre.csv`, y `node eines/registre.mjs` saca el informe y la desviación.',
      '- **Cómo trabajar con Claude**, gratis o con Claude Code: `TRABAJAR-CON-CLAUDE.md`.'],
    stub: ['# Abans de generar la web · Antes de generar la web', '',
      '**ca.** Aquí encara falta gairebé tot: les pàgines, `cerebro/` i les skills apareixen en executar `node eines/genera.mjs` (Node 18 o més nou). Netlify ho fa a cada publicació, però no ho desa al repositori.', '',
      '1. Primer ha d\'existir `cerebro/mapa-real.json`: desa-hi el que dona l\'editor del mapa de valor («Copia el JSON»). Sense mapa surt la web d\'exemple.',
      '2. Després, `node eines/genera.mjs`.',
      '3. En acabar, el `CLAUDE.md` complet substitueix aquest, i les skills `/importa`, `/continguts` i `/tasca` apareixen a `.claude/skills/`.', '',
      'Cap clau ni dada personal al repositori. Cada canvi, en una PR.', '',
      '---', '',
      '**es.** Aquí todavía falta casi todo: las páginas, `cerebro/` y las skills aparecen al ejecutar `node eines/genera.mjs` (Node 18 o más nuevo). Netlify lo hace en cada publicación, pero no lo guarda en el repositorio.', '',
      '1. Primero tiene que existir `cerebro/mapa-real.json`: guarda en él lo que da el editor del mapa de valor («Copia el JSON»). Sin mapa sale la web de ejemplo.',
      '2. Después, `node eines/genera.mjs`.',
      '3. Al terminar, el `CLAUDE.md` completo sustituye a este, y las skills `/importa`, `/continguts` y `/tasca` aparecen en `.claude/skills/`.', '',
      'Ninguna clave ni dato personal en el repositorio. Cada cambio, en una PR.'],
    guia: ['# Trabajar con Claude en la web de {nom}', '',
      'Hay tres maneras. Todas usan las mismas reglas (`CLAUDE.md`) y el mismo cerebro (`cerebro/`). Y en todas, **la máquina propone y una persona acepta**: nada se publica sin una PR que alguien ha mirado.', '',
      'Los planes de Claude cambian. Esto es como era a octubre de 2026. Los planes y los precios de cada momento: https://claude.com/pricing.', '',
      '**El repositorio, privado.** El cerebro habla del negocio: en GitHub, Settings › General › Danger Zone › Change visibility › Private. Netlify y Claude trabajan igual.', '',
      '## 1 · Gratis, con claude.ai (plan Free)', '',
      '**Claude Code no está en el plan gratuito (Free).** El plan Free sí deja trabajar con el cerebro de la web, leyéndolo:', '',
      '1. En claude.ai, crea un proyecto: «Web de {nom}».',
      '2. Copia el texto de `CLAUDE.md` en las instrucciones del proyecto.',
      '3. Añade el repositorio al conocimiento del proyecto con la integración de GitHub. Elige `CLAUDE.md`, `CEREBRO.md` y la carpeta `cerebro/`.',
      '4. Después de cada cambio en el repositorio, pulsa **Sync** para que Claude vea la versión nueva.',
      '5. Sube las skills. En GitHub, Code › Download ZIP. Dentro está `.claude/skills/` (es una carpeta oculta): haz un zip de cada carpeta (`importa`, `continguts`, `tasca`) y súbelos al apartado de skills de la configuración de Claude. Hay que tener activado «Code execution and file creation».', '',
      '**Qué puede hacer:** leer el mapa, las fuentes y el dossier, y escribir el dossier, el texto de las páginas, los borradores de las tareas o una propuesta de mapa.', '',
      '**Qué no puede hacer:** escribir en el repositorio. La integración de GitHub solo lee. Claude te da los ficheros, y tú:', '',
      '- Los subes a GitHub: entra en la carpeta (por ejemplo `cerebro/continguts/`), **Add file › Upload files**, y elige «Create a new branch… and start a pull request». Netlify publica la vista previa.',
      '- O se los envías a TeamTowers y los subimos nosotros.', '',
      '**Los límites:**', '',
      '- Menos uso que en los planes de pago. Cuando se acaba, hay que esperar.',
      '- Hasta 5 proyectos.',
      '- No hay órdenes con barra (`/importa`). Pídelo con palabras («importa esta web») y Claude elige la skill.',
      '- Todo lo que pones en el proyecto tiene que caber en el contexto de la conversación. Si el cerebro es grande, elige solo lo que hace falta.',
      '- No ejecuta las herramientas del repositorio sobre tu web. Para importar, le pegas o subes el texto de las páginas y los documentos.', '',
      '## 2 · Con Claude Code (plan de pago o clave de API)', '',
      'Claude Code viene con los planes de pago (Pro o superior) o con una clave de API de la Claude Console, que se paga por uso. Las cuentas nuevas de la Console a veces traen un poco de crédito de prueba.', '',
      '- **En el navegador:** claude.ai/code, con el repositorio de GitHub.',
      '- **En el ordenador:** la aplicación de escritorio, o la orden `claude` dentro de la carpeta del repositorio.', '',
      '`CLAUDE.md`, las skills de `.claude/skills/` y `.mcp.json` se cargan solos. El servidor MCP (`eines/mcp.mjs`) pide permiso antes de funcionar. Claude ejecuta las herramientas y abre la PR; quien decide la acepta o no.', '',
      'Una sesión típica:', '',
      '1. `/importa https://la-web-actual`: trae la web de ahora a `cerebro/fonts/` y escribe `cerebro/dossier.md`.',
      '2. Lees el dossier y la lista «Por confirmar».',
      '3. `/continguts`: escribe el texto de las páginas en `cerebro/continguts/`.',
      '4. `node eines/genera.mjs`: vuelve a hacer la web (Node 18 o más nuevo).',
      '5. Una PR. Miras la vista previa de Netlify y la aceptas o no.', '',
      'Para la rutina, `/tasca <entregable>` prepara un borrador y lo acepta una persona del rol que lo produce.', '',
      '## 3 · Con TeamTowers', '',
      '- En la primera sesión hacemos la importación y los primeros contenidos, contigo.',
      '- Después podemos mantener en marcha las tareas de rutina («Sistema viu»): la IA prepara los borradores y una persona del rol los acepta. Siempre.',
      '- El repositorio y la web te los puedes llevar cuando quieras.', '',
      '## Qué va dónde', '',
      '| Qué | Dónde |', '| --- | --- |',
      '| El mapa, real e ideal | `cerebro/mapa-real.json` y `cerebro/mapa-ideal.json`. Se cambia en el editor del mapa de valor |',
      '| El texto de las páginas | `cerebro/continguts/` |',
      '| Lo que ya tenías: web, documentos, CSV | `cerebro/fonts/` |',
      '| Qué es el negocio, con las fuentes | `cerebro/dossier.md` |',
      '| Lo que se acuerda y por qué | `cerebro/decisiones.md` |',
      '| Los borradores de la rutina | `cerebro/esborranys/` |',
      '| Datos personales, precios pactados, contratos | En el CRM. Nunca en el repositorio |'],
    skills: {
      importa: ['---', 'name: importa',
        'description: Trae al cerebro lo que ya hay (la web de ahora, documentos, un CSV) y escribe el dossier con la fuente de cada afirmación. Úsala el primer día o cuando llega material nuevo.',
        'argument-hint: "<url o carpeta>"', '---', '',
        '# Importar lo que ya hay', '',
        'Que todo lo que se sabe del negocio esté en `cerebro/fonts/`, y que `cerebro/dossier.md` lo resuma diciendo de dónde sale cada cosa.', '',
        '## Pasos', '',
        '1. **Importa.** Ejecuta `node eines/importa.mjs $ARGUMENTS` (Node 18 o más nuevo; `--max 30` limita las páginas). Escribe `cerebro/fonts/web/`, `cerebro/fonts/docs/`, `cerebro/fonts/dades/`, `cerebro/fonts/index.md` y `cerebro/fonts/fonts.json`.',
        '   - **Una web, solo la de quien te lo pide y con su permiso:** añade `--autoritzat <dominio>` (el mismo dominio que lees). Si no es su web, para.',
        '   - **De una tabla (.csv) solo entra la cabecera** y cuántas filas tiene. Pregunta qué columnas hacen falta y vuelve a importarla con `--columnes "a,b"`. Las de persona no entran nunca.',
        '   - Si no puedes ejecutar órdenes (por ejemplo, en claude.ai), pide a la persona que te pegue o suba el texto de las páginas y de los documentos. Escribe tú los ficheros, con el mismo formato: un `.md` por fuente en `web/`, `docs/` o `dades/`, que empieza así, y añade cada fuente a `cerebro/fonts/index.md`:',
        '', '   ```markdown', '   ---', '   font: https://la-web-actual/servicios (o el nombre del fichero)', '   tipus: web', '   titol: Servicios', '   importat: AAAA-MM-DD', '   ---', '   ```', '', '   `tipus` es `web`, `doc` o `dades`.',
        '2. **Lee `cerebro/fonts/index.md`**, y después las fuentes que salen en él.',
        '3. **Lo que no se ha podido leer.** En `cerebro/fonts/fonts.json`, la lista `fora` dice qué ha quedado fuera (los PDF y los Word, por ejemplo). Haz la lista y pídeselo a la persona, pegado como texto o subido.',
        '4. **Escribe o actualiza `cerebro/dossier.md`:** qué es el negocio, qué ofrece, a quién y cómo trabaja. **Cada afirmación lleva el enlace a su fuente**, por ejemplo `([fuente](fonts/web/serveis.md))`. Sin fuente, no se escribe: va a la lista «Por confirmar», al final. Si el dossier ya existe, conserva lo que hay y añade.',
        '5. **Ningún dato personal.** El importador oculta correos y teléfonos: no los vuelvas a poner. No copies nombres de personas, ni de clientes ni del equipo: habla de roles. Los precios pactados y los contratos van al CRM.',
        '6. **Si todavía no hay mapa** (`cerebro/mapa-real.json`), propón un borrador en `cerebro/proposta-mapa.json`, con el formato del editor del mapa de valor:',
        '   `{"abast": "…", "roles": ["…"], "pairs": [["A", "B", "tangible", "lo que va de A a B", "intangible", "lo que vuelve de B a A"]], "processos": [{"id": "…", "nom": "…", "d": "…"}], "seq": {"A→B": ["id del proceso", 1]}, "troballes": [{"t": "…", "d": "…"}], "dubtes": []}`',
        '   - En `seq`, cada flujo lleva `[proceso, paso]` o `"sempre"`.',
        '   - De 6 a 12 roles. Un rol es lo que alguien hace, no una persona ni un cargo.',
        '   - Como mínimo un tercio de los entregables, intangibles.',
        '   - Todo vínculo es recíproco: cada par lleva un entregable en cada sentido.',
        '   - Ningún nombre propio de persona ni de empresa.',
        '   - Es una propuesta. La persona la carga en el editor y se valida en la sesión. No la copies a `mapa-real.json`.',
        '7. **Acaba con un resumen:** qué se ha importado (cuántas fuentes de cada tipo y cuántos datos ocultos), qué falta y la lista «Por confirmar».'],
      continguts: ['---', 'name: continguts',
        'description: Escribe o actualiza el texto de las páginas de la web (cerebro/continguts) a partir del dossier, las fuentes y el mapa. Úsala después de importar o cuando hay que cambiar el texto de una página.',
        'argument-hint: "[página]"', '---', '',
        '# Escribir el texto de la web', '',
        'Las páginas salen del mapa. El texto de dentro sale de aquí: un fichero por página en `cerebro/continguts/<id>.md`. El generador lo convierte en HTML y no lo sobrescribe nunca.', '',
        '## Qué páginas', '',
        '- `inici`: la portada.',
        '- `serveis`: la página de servicios.',
        '- La puerta de cada rol: el nombre de su fichero en la web generada, sin `.html` (si hay `quien-compra.html`, el id es `quien-compra`).',
        '- Páginas nuevas, con un id corto en minúsculas y guiones (`quienes-somos`, `preguntas-frecuentes`) y `menu: si` para que salgan en el menú.',
        '- Estos id no se pueden usar: `equip`, `registre`, `gracies`, `404`, `estil`, `web`, `index`.', '',
        'Si te dicen una página (`$ARGUMENTS`), trabaja solo en esa. Si no, propón la lista y empieza por `inici`.', '',
        '## El formato', '',
        '```markdown', '---', 'titol: Quiénes somos', 'menu: si', 'font: cerebro/fonts/web/quienes-somos.md, cerebro/dossier.md', 'fet: esborrany fet amb IA (Claude), AAAA-MM-DD', '---', '',
        '## Un título de sección', '', 'Un párrafo.', '```', '',
        'Solo este Markdown: `##` y `###`, párrafos, listas, **negrita**, *cursiva*, enlaces `http(s)`, `mailto:` o relativos, e imágenes solo relativas, dentro de `imatges/`. El resto sale como texto: nada de HTML.', '',
        '## Pasos', '',
        '1. Lee `cerebro/dossier.md`, `cerebro/fonts/index.md`, el mapa (`cerebro/mapa-real.json`) y el contenido que ya tiene la página, si lo tiene.',
        '2. Escribe solo lo que dicen las fuentes, y ponlas en `font:`. Nada inventado: ni cifras, ni clientes, ni citas, ni promesas.',
        '3. Donde falte algo, `[a completar]`. Dilo en el resumen.',
        '4. Ningún dato personal (nombres de persona, correos, teléfonos) ni ningún precio pactado. Eso va al CRM.',
        '5. Escribe en la lengua de quien visita la web y con el tono que ya usa la casa en las fuentes. Frases cortas, palabras llanas.',
        '6. Ejecuta `node eines/genera.mjs` y mira la página generada (`<id>.html`, o `index.html` para `inici`): que se lea bien y que los enlaces funcionen.',
        '7. Abre una PR con el cambio, nunca directamente en la rama principal: la persona mira la vista previa de Netlify y decide. **Aceptar la PR es aceptar el texto**, y queda dicho quién lo ha hecho. Si no puedes abrirla, dale los ficheros para que los suba.'],
      tasca: ['---', 'name: tasca',
        'description: Prepara el borrador de una tarea de rutina de cerebro/tasques-ia.md para que lo acepte una persona del rol que la produce. Úsala cuando toca un entregable tangible que la IA puede preparar en borrador.',
        'argument-hint: "<entregable o id>"', '---', '',
        '# Preparar el borrador de una tarea', '',
        'La máquina propone, una persona acepta. Esta skill solo hace borradores: no envía, no publica, no paga ni firma nada.', '',
        '## Pasos', '',
        '1. Lee `cerebro/tasques-ia.json` y busca la tarea (`$ARGUMENTS`) por su `id` o por el entregable (`q`). Si encaja más de una, pregunta cuál. Si no hay ninguna, dilo y para.',
        '2. **Si no tiene `pot: true`, explica por qué y para:**',
        '   - Intangible: lo hace una persona del rol, nunca la IA. Ningún borrador, ni «solo para ayudar».',
        '   - Tangible sin tipo declarado, o sin mena: hay que decidir su tipo en la sesión y anotarlo en el mapa.',
        '   - El tipo no sale de una máquina (un acuerdo, una factura): lo hace y responde de él una persona.',
        '3. Mira qué pide `cal` y pregunta a la persona lo que falte. Si algún dato lleva nombres de persona, pídelo por roles.',
        '4. Escribe el borrador en `cerebro/esborranys/AAAA-MM-DD-<id>.md` (la fecha de hoy), con la forma que dice `surt`. Empieza con esta cabecera, para que diga quién lo ha hecho:',
        '', '   ```markdown', '   ---', '   tasca: <id>', '   tipus: <tipo>', '   de: <rol que lo produce>', '   a: <rol que lo recibe>',
        '   fet: borrador hecho con IA (Claude), AAAA-MM-DD', '   accepta: <rol>', '   estat: esborrany', '   ---', '   ```', '',
        '5. Cada dato que no tienes, `[a completar]`. No te inventes ninguna cifra, fecha, acuerdo ni nombre. Ningún nombre de persona: solo roles. Ni precios pactados ni datos personales.',
        '6. Di quién tiene que aceptarlo: una persona del rol de `accepta`, que es quien produce el entregable.',
        '7. Abre una PR con el borrador, o da el fichero si no puedes. Cuando esa persona lo acepta, en la misma PR pasa a `estat: acceptat AAAA-MM-DD`.',
        '8. **Hasta que lo acepta, el borrador no existe:** no se usa, no se envía y no se publica.'] },
    tasques: { titol: 'Tareas para la IA · {nom}',
      generat: 'Generado del mapa de valor. No se edita a mano: se regenera con la web.',
      regla: 'La regla es una: **la máquina propone, una persona acepta.** Un entregable intangible (confianza, un consejo, un aviso, un favor) no lo hace nunca la IA: lo hace una persona del rol. Un entregable tangible, con un tipo declarado que puede salir de una máquina, puede tener un borrador hecho con IA, y solo si lo entrega un rol de casa. Tres frenos: la IA solo hace borradores y no envía, no publica ni firma nada; ningún intangible se hace con IA, nunca; y cada borrador dice que lo ha hecho una IA, qué día y qué rol tiene que aceptarlo. Hasta que lo acepta una persona del rol que lo produce, el borrador no existe.',
      recompte: '{m} de {t} entregables: la IA puede preparar el borrador',
      maquina: 'La IA puede preparar el borrador',
      persona: ['Los hace una persona', 'Son intangibles, o su tipo no sale de una máquina: la IA no entra.'],
      senseTipus: ['Por decidir', 'Son tangibles pero todavía no tienen tipo declarado: decidid su tipo en la sala.'],
      deFora: ['Llegan de fuera', 'Los prepara quien los envía. Lo que hacéis vosotros con ellos (responder, servirlo) es otro entregable del mapa.'],
      perConfirmar: 'Los tipos salen del nombre de cada entregable (la palabra entre comillas): confirmadlos en la sala antes de usarlos.',
      cols: { q: 'Entregable', deA: 'De → a', tipus: 'Tipo', cal: 'Qué hace falta', surt: 'Qué sale', accepta: 'Quién lo acepta' },
      motius: { intangible: 'Es intangible: lo hace una persona del rol, nunca la IA.',
        'mena desconeguda': 'El mapa no dice si es tangible o intangible: decididlo en la sala.',
        'sense entregable declarat': 'Todavía no tiene tipo declarado: decidid su tipo en la sala.',
        'el tipus no surt d\'una màquina': 'Su tipo no sale de una máquina (un acuerdo, una factura): lo hace y responde de él una persona.',
        'de fora': 'Llega de un rol de fuera: lo prepara quien lo envía.' } }
  }
};
const SITE_TXT = {
  ca: { inici: 'Inici', serveis: 'Serveis', equip: 'Per a l\'equip', salta: 'Salta al contingut', menu: 'Menú',
    contPersonal: 'cerebro/continguts/{id}.md té un correu, un telèfon, un DNI o un IBAN: la pàgina no surt. Les dades personals van al CRM, i el contacte de la web és el formulari.',
    contReservat: 'cerebro/continguts/{id}.md: aquest nom no es pot fer servir (minúscules, xifres i guions; ni equip, registre, gracies, 404, estil, web o index).',
    donem: 'Què et donem', dones: 'Què ens dones', xarxa: 'Amb la resta de la xarxa', benvinguda: 'La benvinguda',
    connecta: 'Es connecta amb', perCadascu: 'Una porta per a cadascú', sempre: 'Tot el temps', dins: 'El que passa a dins',
    escriu: 'Escriu-nos', nom: 'Nom', correu: 'Correu electrònic', missatge: 'Missatge', envia: 'Envia', alta: 'Demana el teu compte',
    tambe: 'També ens pots escriure a', gracies: 'Gràcies', rebut: 'Ho hem rebut. Et respondrem per correu.', torna: 'Torna a l\'inici',
    peu: 'Feta a partir del mapa de valor.', dades: 'Les dades d\'aquesta web', buida: 'Encara no hi ha res entre nosaltres i aquest rol.',
    noHi: 'Aquesta pàgina no hi és', noHiD: 'Potser ha canviat de nom quan ha canviat el mapa.',
    reg: { titol: 'Registra un lliurament', perque: 'Cada lliurament que s\'anota fa que el mapa real surti de l\'ús i no de la memòria.', de: 'De qui surt', a: 'Qui el rep',
      q: 'Què s\'ha lliurat', mena: 'Tipus', t: 'Tangible', i: 'Intangible', valor: 'Quant valor hi veu qui el rep (1 a 5)', data: 'Quan', ev: 'Evidència (un enllaç, si n\'hi ha)',
      privat: 'Només rols i lliuraments: cap nom de persona ni dada personal.', envia: 'Registra-ho' },
    cb: { fitxa: 'Fitxa del cervell del projecte. Surt del mapa de valor: es regenera quan canvia el mapa.', dona: 'Què dona', rep: 'Què rep',
      procs: 'Processos on hi és', pas: 'pas', sempre: 'tot el temps', hab: 'Habilitats que demana',
      habD: 'Per omplir a la sala. L\'encaix de cada persona amb el rol és dada personal: va al CRM, no aquí.',
      qui: 'Qui el produeix', perA: 'Qui el rep', tipus: 'Tipus', flux: 'Al flux', tangible: 'tangible', intangible: 'intangible',
      dec: 'Decisions', decD: 'El que s\'acorda i per què. Una entrada per decisió, amb la data. És l\'únic fitxer que s\'escriu a mà: en regenerar la web, conserva el que ja tens i afegeix-hi només les troballes noves.',
      trob: 'Troballes del mapa, per decidir', senseP: 'Encara sense passos.',
      ia: 'Qui el prepara', iaSi: 'La IA en prepara l\'esborrany ({tipus}) i l\'accepta una persona del rol {rol}.', iaNo: '{motiu}' },
    idx: { titol: 'Cervell · {nom}', generat: 'Índex generat del mapa de valor. No s\'edita a mà: es regenera amb la web.',
      intro: 'Tots els documents del projecte, per tema. **Pública**: la web que troba qualsevol. **Per enllaç**: pàgines que no s\'indexen i es donen a qui toca. **Equip**: el que només viu al repositori.',
      doc: 'Document', capa: 'Capa', real: 'Mapa de valor real', ideal: 'Mapa de valor ideal', dades: 'Les dades de la web', marca: 'La marca: el disseny i els textos propis', config: 'El que es va triar a l\'editor: nom, llengua, rols de casa, correu i adreça',
      temes: { web: 'La web', mapa: 'El mapa', rols: 'Rols', lliuraments: 'Lliuraments', processos: 'Processos', decisions: 'Decisions', tasques: 'Tasques per a la IA', continguts: 'Continguts', fonts: 'El que ja hi havia', regles: 'Regles', eines: 'Eines i API' },
      capes: { publica: 'pública', enllac: 'per enllaç', equip: 'equip' } },
    api: { cap: 'Generat del mapa de valor amb la web. No s\'edita a mà: es regenera.', web: 'https://la-teva-web/',
      doc: ['# {nom} · l\'API i els avisos', '',
        'La web és l\'API. No hi ha cap servidor propi: fitxers estàtics, els formularis de Netlify i dues funcions que envien avisos.', '',
        '## Llegir', '', '| Què | On |', '| --- | --- |',
        '| Totes les dades de la web | `GET {url}web.json` |', '| Les dades de cada pàgina | El JSON-LD (schema.org) de la mateixa pàgina |',
        '| La prova que la web és la que va sortir del mapa | `GET {url}permaweb.json` |', '',
        'El cervell (`cerebro/`), les eines i aquests documents són de l\'equip: viuen al repositori i la web no els serveix.', '',
        '## Escriure: el registre viu', '',
        'Un `POST` a `{url}` amb `Content-Type: application/x-www-form-urlencoded` i els camps de `registre.html`: `form-name=registre`, `de`, `a`, `entregable`, `mena` (`tangible` o `intangible`), `valor` (de 1 a 5), `data` (AAAA-MM-DD) i `evidencia` (un enllaç https). És el que fa el formulari: Netlify ho desa i ho envia per correu. Cap camp per a dades personals.', '',
        '## Els avisos', '', 'Cada avís és un `POST` JSON a les adreces de `TT_WEBHOOKS`:', '', '```json',
        '{ "formato": "tt-avis-1", "tipus": "transaccion.creada", "web": "{url}", "creat": "2026-10-10T09:00:00.000Z", "dades": { "de": "…", "a": "…", "q": "…" } }', '```', '',
        '| Avís | Quan | Qui l\'envia |', '| --- | --- | --- |',
        '| `transaccion.creada` | Cada anotació al registre | La funció `submission-created`, sola |',
        '| `desviacion.detectada` | L\'anotació no és cap flux del mapa (`flux-nou`), o un flux del mapa no passa (`flux-sense-us`) | La funció, el primer; `node eines/registre.mjs --envia`, el segon |',
        '| `rol.sin_reciprocidad` | Un rol dona i no rep res registrat | `node eines/registre.mjs --envia` |',
        '| `cerebro.actualizado` | Cada publicació de la web a producció | La funció `deploy-succeeded`, sola |', '',
        '**La signatura.** La capçalera `X-TT-Signatura` porta `sha256=` i l\'HMAC-SHA256 del cos amb el secret. Comprova-la abans de fer res:', '', '```js',
        'import { verificaAvis } from \'./eines/nucli.mjs\';', 'const bo = await verificaAvis(cos, capcaleres[\'x-tt-signatura\'], process.env.TT_WEBHOOK_SECRET);', '```', '',
        '## Configurar-ho', '', 'A Netlify › Site configuration › Environment variables:', '',
        '- `TT_WEBHOOKS`: les adreces https que escolten, separades per comes.', '- `TT_WEBHOOK_SECRET`: un secret de 16 caràcters o més. Sense secret no s\'envia res.', '',
        'Les funcions demanen que la web es publiqui des del repositori: Netlify Drop no les desplega.', '',
        '## Per a Claude Code', '',
        '`.mcp.json` hi connecta `eines/mcp.mjs`, un servidor MCP sense dependències amb tres eines: `cervell_index`, `cervell_llegeix` i `registre_informe`. Només llegeix el que surt a l\'índex del cervell.'] },

    llegeix: ['# {nom}', '', 'Web feta a partir del mapa de valor.', '', '## Publicar-la', '',
      '- **Ara mateix:** arrossega la carpeta a https://app.netlify.com/drop.',
      '- **Amb historial:** puja-la a un repositori de GitHub i connecta\'l a Netlify (Add new site › Import an existing project). El `netlify.toml` ja hi és.',
      '- **A la permaweb:** puja la carpeta a IPFS o Arweave i comprova-la amb `permaweb.json`.', '',
      '## Els formularis', '', 'Netlify els detecta sols en publicar. Perquè t\'arribin per correu: Netlify › Site configuration › Notifications › Form submission notifications.', '',
      '## Canviar-la', '', 'Canvia el mapa i torna a generar la web: ho explica `CLAUDE.md`.'],
    pas: { coneix: ['Coneix-nos', 'Què et donem i què et demanem.'], compte: ['Crea el teu compte', 'Amb un compte veus el que és teu i en dius la teva.'],
      'sense-compte': ['Sense compte', 'Llegir i escriure\'ns n\'hi ha prou.'], connecta: ['Connecta el que ja fas servir', ''],
      primer: ['El primer que rebràs', ''], demanem: ['El primer que et demanarem', ''] },
    cat: { crm: 'CRM', cobros: 'Cobraments', venta: 'Botiga', oficina: 'Agenda', comunica: 'Missatges', web: 'Dades pròpies' },
    contacte: 'On som', adreca: 'Adreça', telefon: 'Telèfon', horari: 'Horari' },
  es: { inici: 'Inicio', serveis: 'Servicios', equip: 'Para el equipo', salta: 'Saltar al contenido', menu: 'Menú',
    contPersonal: 'cerebro/continguts/{id}.md tiene un correo, un teléfono, un DNI o un IBAN: la página no sale. Los datos personales van al CRM, y el contacto de la web es el formulario.',
    contReservat: 'cerebro/continguts/{id}.md: este nombre no se puede usar (minúsculas, cifras y guiones; ni equip, registre, gracies, 404, estil, web o index).',
    donem: 'Qué te damos', dones: 'Qué nos das', xarxa: 'Con el resto de la red', benvinguda: 'La bienvenida',
    connecta: 'Se conecta con', perCadascu: 'Una puerta para cada uno', sempre: 'Todo el tiempo', dins: 'Lo que pasa dentro',
    escriu: 'Escríbenos', nom: 'Nombre', correu: 'Correo electrónico', missatge: 'Mensaje', envia: 'Enviar', alta: 'Pide tu cuenta',
    tambe: 'También puedes escribirnos a', gracies: 'Gracias', rebut: 'Lo hemos recibido. Te responderemos por correo.', torna: 'Volver al inicio',
    peu: 'Hecha a partir del mapa de valor.', dades: 'Los datos de esta web', buida: 'Todavía no hay nada entre nosotros y este rol.',
    noHi: 'Esta página no existe', noHiD: 'Quizá cambió de nombre cuando cambió el mapa.',
    reg: { titol: 'Registra un entregable', perque: 'Cada entregable que se anota hace que el mapa real salga del uso y no de la memoria.', de: 'De quién sale', a: 'Quién lo recibe',
      q: 'Qué se ha entregado', mena: 'Tipo', t: 'Tangible', i: 'Intangible', valor: 'Cuánto valor ve quien lo recibe (1 a 5)', data: 'Cuándo', ev: 'Evidencia (un enlace, si lo hay)',
      privat: 'Solo roles y entregables: ningún nombre de persona ni dato personal.', envia: 'Regístralo' },
    cb: { fitxa: 'Ficha del cerebro del proyecto. Sale del mapa de valor: se regenera cuando cambia el mapa.', dona: 'Qué da', rep: 'Qué recibe',
      procs: 'Procesos en los que está', pas: 'paso', sempre: 'todo el tiempo', hab: 'Habilidades que pide',
      habD: 'Por rellenar en la sala. El encaje de cada persona con el rol es dato personal: va al CRM, no aquí.',
      qui: 'Quién lo produce', perA: 'Quién lo recibe', tipus: 'Tipo', flux: 'En el flujo', tangible: 'tangible', intangible: 'intangible',
      dec: 'Decisiones', decD: 'Lo que se acuerda y por qué. Una entrada por decisión, con la fecha. Es el único fichero que se escribe a mano: al regenerar la web, conserva el que ya tienes y añade solo los hallazgos nuevos.',
      trob: 'Hallazgos del mapa, por decidir', senseP: 'Todavía sin pasos.',
      ia: 'Quién lo prepara', iaSi: 'La IA prepara el borrador ({tipus}) y lo acepta una persona del rol {rol}.', iaNo: '{motiu}' },
    idx: { titol: 'Cerebro · {nom}', generat: 'Índice generado del mapa de valor. No se edita a mano: se regenera con la web.',
      intro: 'Todos los documentos del proyecto, por tema. **Pública**: la web que encuentra cualquiera. **Por enlace**: páginas que no se indexan y se dan a quien toca. **Equipo**: lo que solo vive en el repositorio.',
      doc: 'Documento', capa: 'Capa', real: 'Mapa de valor real', ideal: 'Mapa de valor ideal', dades: 'Los datos de la web', marca: 'La marca: el diseño y los textos propios', config: 'Lo que se eligió en el editor: nombre, idioma, roles de casa, correo y dirección',
      temes: { web: 'La web', mapa: 'El mapa', rols: 'Roles', lliuraments: 'Entregables', processos: 'Procesos', decisions: 'Decisiones', tasques: 'Tareas para la IA', continguts: 'Contenidos', fonts: 'Lo que ya había', regles: 'Reglas', eines: 'Herramientas y API' },
      capes: { publica: 'pública', enllac: 'por enlace', equip: 'equipo' } },
    api: { cap: 'Generado del mapa de valor con la web. No se edita a mano: se regenera.', web: 'https://tu-web/',
      doc: ['# {nom} · la API y los avisos', '',
        'La web es la API. No hay ningún servidor propio: ficheros estáticos, los formularios de Netlify y dos funciones que envían avisos.', '',
        '## Leer', '', '| Qué | Dónde |', '| --- | --- |',
        '| Todos los datos de la web | `GET {url}web.json` |', '| Los datos de cada página | El JSON-LD (schema.org) de la misma página |',
        '| La prueba de que la web es la que salió del mapa | `GET {url}permaweb.json` |', '',
        'El cerebro (`cerebro/`), las herramientas y estos documentos son del equipo: viven en el repositorio y la web no los sirve.', '',
        '## Escribir: el registro vivo', '',
        'Un `POST` a `{url}` con `Content-Type: application/x-www-form-urlencoded` y los campos de `registre.html`: `form-name=registre`, `de`, `a`, `entregable`, `mena` (`tangible` o `intangible`), `valor` (de 1 a 5), `data` (AAAA-MM-DD) y `evidencia` (un enlace https). Es lo que hace el formulario: Netlify lo guarda y lo envía por correo. Ningún campo para datos personales.', '',
        '## Los avisos', '', 'Cada aviso es un `POST` JSON a las direcciones de `TT_WEBHOOKS`:', '', '```json',
        '{ "formato": "tt-avis-1", "tipus": "transaccion.creada", "web": "{url}", "creat": "2026-10-10T09:00:00.000Z", "dades": { "de": "…", "a": "…", "q": "…" } }', '```', '',
        '| Aviso | Cuándo | Quién lo envía |', '| --- | --- | --- |',
        '| `transaccion.creada` | Cada anotación en el registro | La función `submission-created`, sola |',
        '| `desviacion.detectada` | La anotación no es ningún flujo del mapa (`flux-nou`), o un flujo del mapa no pasa (`flux-sense-us`) | La función, el primero; `node eines/registre.mjs --envia`, el segundo |',
        '| `rol.sin_reciprocidad` | Un rol da y no recibe nada registrado | `node eines/registre.mjs --envia` |',
        '| `cerebro.actualizado` | Cada publicación de la web en producción | La función `deploy-succeeded`, sola |', '',
        '**La firma.** La cabecera `X-TT-Signatura` lleva `sha256=` y el HMAC-SHA256 del cuerpo con el secreto. Compruébala antes de hacer nada:', '', '```js',
        'import { verificaAvis } from \'./eines/nucli.mjs\';', 'const bueno = await verificaAvis(cuerpo, cabeceras[\'x-tt-signatura\'], process.env.TT_WEBHOOK_SECRET);', '```', '',
        '## Configurarlo', '', 'En Netlify › Site configuration › Environment variables:', '',
        '- `TT_WEBHOOKS`: las direcciones https que escuchan, separadas por comas.', '- `TT_WEBHOOK_SECRET`: un secreto de 16 caracteres o más. Sin secreto no se envía nada.', '',
        'Las funciones piden que la web se publique desde el repositorio: Netlify Drop no las despliega.', '',
        '## Para Claude Code', '',
        '`.mcp.json` conecta `eines/mcp.mjs`, un servidor MCP sin dependencias con tres herramientas: `cervell_index`, `cervell_llegeix` y `registre_informe`. Solo lee lo que sale en el índice del cerebro.'] },

    llegeix: ['# {nom}', '', 'Web hecha a partir del mapa de valor.', '', '## Publicarla', '',
      '- **Ahora mismo:** arrastra la carpeta a https://app.netlify.com/drop.',
      '- **Con historial:** súbela a un repositorio de GitHub y conéctalo a Netlify (Add new site › Import an existing project). El `netlify.toml` ya está.',
      '- **En la permaweb:** sube la carpeta a IPFS o Arweave y compruébala con `permaweb.json`.', '',
      '## Los formularios', '', 'Netlify los detecta solos al publicar. Para que te lleguen por correo: Netlify › Site configuration › Notifications › Form submission notifications.', '',
      '## Cambiarla', '', 'Cambia el mapa y vuelve a generar la web: lo explica `CLAUDE.md`.'],
    pas: { coneix: ['Conócenos', 'Qué te damos y qué te pedimos.'], compte: ['Crea tu cuenta', 'Con una cuenta ves lo tuyo y das tu opinión.'],
      'sense-compte': ['Sin cuenta', 'Basta con leer y escribirnos.'], connecta: ['Conecta lo que ya usas', ''],
      primer: ['Lo primero que recibirás', ''], demanem: ['Lo primero que te pediremos', ''] },
    cat: { crm: 'CRM', cobros: 'Cobros', venta: 'Tienda', oficina: 'Agenda', comunica: 'Mensajes', web: 'Datos propios' },
    contacte: 'Dónde estamos', adreca: 'Dirección', telefon: 'Teléfono', horari: 'Horario' }
};
const SITE_CSS = [
  ':root{color-scheme:light dark;--bg:#fbfaf7;--fg:#1d1b18;--mut:#5d584f;--lin:#d9d4ca;--acc:#4338ca}',
  '@media (prefers-color-scheme:dark){:root{--bg:#161512;--fg:#f1eee8;--mut:#b4ada1;--lin:#3a362f;--acc:#a5b4fc}}',
  '*{box-sizing:border-box}',
  'body{margin:0;background:var(--bg);color:var(--fg);font:1rem/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}',
  'a{color:var(--acc)}',
  ':focus-visible{outline:3px solid var(--acc);outline-offset:2px}',
  '.salta{position:absolute;left:-999px}.salta:focus{left:1rem;top:1rem;background:var(--bg);padding:.5rem}',
  'header,main,footer{max-width:46rem;margin:0 auto;padding:1rem}',
  'header{border-bottom:1px solid var(--lin)}',
  '.marca{margin:0 0 .5rem;font-weight:700}.marca a{color:inherit;text-decoration:none}',
  'nav ul{display:flex;flex-wrap:wrap;gap:.35rem;list-style:none;margin:0;padding:0}',
  'nav a{display:inline-flex;align-items:center;min-height:44px;min-width:44px;padding:0 .8rem;border:1px solid var(--lin);border-radius:999px;text-decoration:none;color:var(--fg)}',
  'nav a[aria-current=page]{background:var(--fg);color:var(--bg);border-color:var(--fg)}',
  'h1{font-size:1.7rem;line-height:1.2;margin:.5rem 0 1rem}h2{font-size:1.15rem;margin:1.6rem 0 .5rem}',
  'li{margin:.25rem 0}small{color:var(--mut)}',
  'form{display:grid;gap:.75rem;margin-top:.5rem}',
  'label{display:grid;gap:.25rem;font-weight:600}',
  'fieldset{display:flex;flex-wrap:wrap;gap:.25rem 1rem;border:1px solid var(--lin);border-radius:8px;margin:0;padding:.4rem .8rem .6rem}',
  'legend{font-weight:600;padding:0 .3rem}',
  'fieldset label{display:inline-flex;align-items:center;gap:.4rem;font-weight:400;min-height:44px}',
  'fieldset input{min-height:auto}',
  'input,select,textarea,button{font:inherit;min-height:44px;padding:.5rem .7rem;border:1px solid var(--lin);border-radius:8px;background:var(--bg);color:var(--fg)}',
  'button{background:var(--fg);color:var(--bg);border-color:var(--fg);font-weight:600;cursor:pointer;justify-self:start}',
  '.ocult{display:none}',
  'footer{border-top:1px solid var(--lin);color:var(--mut);font-size:.9rem}'
].join('\n') + '\n';

/* La marca: el disseny i els textos propis del client, sense tocar l'HTML.
 * Demanat per l'Àlvar (10/10/2026): que el disseny i els continguts de la web
 * es puguin personalitzar i automatitzar al màxim. El mapa segueix donant
 * l'estructura (portes, serveis, benvinguda); `marca.json` hi posa la cara:
 *
 *   { "color": "#7a1f3d", "lletra": "serif|sans|rodona|mono", "forma": "rodona|recta",
 *     "logo": "logo.svg", "lema": "…", "presentacio": "…",
 *     "portes": { "Rol del mapa": { "nom": "Nom curt al menú", "intro": "…" } },
 *     "contacte": { "adreca": "…", "telefon": "…", "horari": "…" } }
 *
 *  · **El color no pot trencar el contrast.** Si no arriba a 4,5:1 (WCAG AA)
 *    sobre el fons, s'enfosqueix (o s'aclareix, al mode fosc) fins que hi
 *    arriba. La marca no pot fer una web que no es llegeix.
 *  · **Lletres del sistema i prou.** Cap font externa: la CSP no ho deixaria i
 *    la permaweb no ho vol.
 *  · **El logo, en SVG i net.** Sense scripts ni gestors d'esdeveniments; si en
 *    porta, no s'hi posa.
 *  · **Sense marca, la web és byte a byte la de sempre.** */
const MARCA_LLETRES = {
  sans: 'system-ui,-apple-system,"Segoe UI",sans-serif',
  serif: '"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif',
  rodona: 'ui-rounded,"SF Pro Rounded","Segoe UI",system-ui,sans-serif',
  mono: 'ui-monospace,"SF Mono",Menlo,Consolas,monospace'
};
function marcaHex(x) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(x || '').trim());
  if (!m) return '';
  const h = m[1].length === 3 ? m[1].replace(/./g, c => c + c) : m[1];
  return '#' + h.toLowerCase();
}
function marcaLlum(hex) {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function marcaContrast(a, b) { const x = marcaLlum(a), y = marcaLlum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
/* Barreja el color cap al negre (o el blanc) a passos petits fins que fa 4,5:1
   amb el fons. Determinista: el mateix color dona sempre el mateix resultat. */
function marcaAjusta(hex, fons, cap) {
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)), dest = cap === 'blanc' ? 255 : 0;
  for (let k = 0; k <= 20; k++) {
    const c = '#' + rgb.map(v => Math.round(v + (dest - v) * k / 20).toString(16).padStart(2, '0')).join('');
    if (marcaContrast(c, fons) >= 4.5) return c;
  }
  return cap === 'blanc' ? '#ffffff' : '#000000';
}
function marcaSvg(svg) {
  const s = String(svg || '').trim();
  if (!/^(<\?xml[^>]*>\s*)?<svg[\s>]/i.test(s) || !/<\/svg>\s*$/i.test(s)) return '';
  if (/<script|<foreignObject|\son[a-z]+\s*=|javascript:|<!ENTITY|xlink:href\s*=\s*["']?(?!#)|\shref\s*=\s*["']?(?!#)/i.test(s)) return '';
  return s.length <= 100000 ? s + '\n' : '';
}
function marcaNeta(m) {
  const x = m && typeof m === 'object' ? m : {}, t = v => (typeof v === 'string' ? v.trim().slice(0, 600) : '');
  const out = {};
  if (marcaHex(x.color)) out.color = marcaHex(x.color);
  if (MARCA_LLETRES[x.lletra]) out.lletra = x.lletra;
  if (x.forma === 'recta' || x.forma === 'rodona') out.forma = x.forma;
  if (t(x.lema)) out.lema = t(x.lema);
  if (t(x.presentacio)) out.presentacio = t(x.presentacio);
  const svg = marcaSvg(x.logoSvg);
  if (svg) out.logoSvg = svg;
  const portes = {};
  Object.keys(x.portes && typeof x.portes === 'object' ? x.portes : {}).forEach(r => {
    const p = x.portes[r] || {}, q = {};
    if (t(p.nom)) q.nom = t(p.nom).slice(0, 40);
    if (t(p.intro)) q.intro = t(p.intro);
    if (q.nom || q.intro) portes[r] = q;
  });
  if (Object.keys(portes).length) out.portes = portes;
  const c = x.contacte && typeof x.contacte === 'object' ? x.contacte : {}, cc = {};
  ['adreca', 'telefon', 'horari'].forEach(k => { if (t(c[k])) cc[k] = t(c[k]).slice(0, 200); });
  if (Object.keys(cc).length) out.contacte = cc;
  return out;
}
function siteCss(m) {
  if (!m.color && !m.lletra && !m.forma) return SITE_CSS;
  let css = SITE_CSS;
  if (m.color) {
    const clar = marcaAjusta(m.color, '#fbfaf7', 'negre'), fosc = marcaAjusta(m.color, '#161512', 'blanc');
    css = css.replace('--acc:#4338ca}', '--acc:' + clar + '}').replace('--acc:#a5b4fc}', '--acc:' + fosc + '}')
      + 'header{border-bottom:3px solid var(--acc)}\n'
      + 'nav a[aria-current=page],button{background:var(--acc);border-color:var(--acc);color:var(--bg)}\n';
  }
  if (m.lletra) css = css.replace('font:1rem/1.55 system-ui,-apple-system,"Segoe UI",sans-serif', 'font:1rem/1.55 ' + MARCA_LLETRES[m.lletra]);
  if (m.forma === 'recta') css = css.replace('border-radius:999px', 'border-radius:3px').replace(/border-radius:8px/g, 'border-radius:2px');
  return css + '.marca img{height:2.5rem;width:auto;vertical-align:middle;margin-right:.5rem}\n.lema{margin:-.25rem 0 .75rem;color:var(--mut)}\n';
}

/* El cervell del projecte, com el preveu el pla (cerebro/ al repositori del
   client): el mapa real i l'ideal, i una fitxa per rol, per lliurament i per
   procés, més decisiones.md. Surt del mapa exportat per l'editor, que té la
   mateixa forma que el que llegeix el model. Tot és publicable: el que és
   confidencial va al CRM. */
function cervell(mapa, T, TQ, nom, casa) {
  const real = Object.assign({}, mapa); delete real.ideal;
  const out = [{ ruta: 'cerebro/mapa-real.json', tipus: 'application/json', cos: JSON.stringify(real, null, 2) + '\n' }];
  if (mapa.ideal) out.push({ ruta: 'cerebro/mapa-ideal.json', tipus: 'application/json', cos: JSON.stringify(mapa.ideal, null, 2) + '\n' });
  const fl = [];
  (real.pairs || []).forEach(p => {
    if (p[0] && p[1] && p[3]) fl.push({ de: p[0], a: p[1], mena: p[2], q: p[3] });
    if (p[0] && p[1] && p[5]) fl.push({ de: p[1], a: p[0], mena: p[4], q: p[5] });
  });
  const seq = real.seq || {}, procs = (real.processos || []).filter(p => p && (p.id || p.nom));
  const nomProc = id => { const p = procs.find(x => x.id === id); return p ? p.nom || p.id : id; };
  const on = f => { const x = seq[f.de + '→' + f.a]; return Array.isArray(x) ? nomProc(x[0]) + ' · ' + T.pas + ' ' + x[1] : x === 'sempre' ? T.sempre : ''; };
  const mena = x => (x === 'intangible' ? T.intangible : T.tangible);
  const usats = {}, id = s => { let b = webSlug(s).slice(0, 60).replace(/-$/, ''), k = b, n = 2; while (usats[k]) k = b + '-' + n++; usats[k] = 1; return k; };
  const md = (r, linies) => out.push({ ruta: r, tipus: 'text/markdown', cos: linies.join('\n') + '\n' });
  fl.forEach(f => { f.id = id(f.q); });
  (real.roles || []).forEach(r => {
    const dona = fl.filter(f => f.de === r), rep = fl.filter(f => f.a === r);
    const ps = procs.map(p => [p, Object.keys(seq).filter(k => Array.isArray(seq[k]) && seq[k][0] === p.id && k.split('→').includes(r)).map(k => seq[k][1])])
      .filter(x => x[1].length);
    md('cerebro/roles/' + id('rol-' + r).replace(/^rol-/, '') + '.md', ['# ' + r, '', '> ' + T.fitxa, '',
      '## ' + T.dona, ''].concat(dona.length ? dona.map(f => '- **' + f.q + '** → ' + f.a + ' · ' + mena(f.mena) + (on(f) ? ' · ' + on(f) : '')) : ['—'],
      ['', '## ' + T.rep, ''], rep.length ? rep.map(f => '- **' + f.q + '** ← ' + f.de + ' · ' + mena(f.mena) + (on(f) ? ' · ' + on(f) : '')) : ['—'],
      ps.length ? ['', '## ' + T.procs, ''].concat(ps.map(x => '- ' + (x[0].nom || x[0].id) + ': ' + T.pas + ' ' + x[1].sort((a, b) => a - b).join(', '))) : [],
      ['', '## ' + T.hab, '', T.habD]));
  });
  /* Qui fa cada lliurament, amb la regla de l'app (VS-TASQUES): la IA en
     prepara l'esborrany o el fa una persona. */
  /* Només compta el que lliura un rol de casa, i l'accepta una persona d'aquest
     rol. El que arriba de fora (una comanda, un pagament) el prepara qui l'envia. */
  const deCasa = casa || [];
  fl.forEach(f => {
    f.ia = deCasa.includes(f.de) ? fluxAutomatitzable({ kind: f.mena, label: f.q }) : { pot: false, motiu: 'de fora', tipus: null };
    f.accepta = f.de;
  });
  const iaDe = f => (f.ia.pot ? T.iaSi.replace('{tipus}', entregableMeta(f.ia.tipus).nom).replace('{rol}', f.accepta) : T.iaNo.replace('{motiu}', TQ.motius[f.ia.motiu] || f.ia.motiu));
  fl.forEach(f => md('cerebro/entregables/' + f.id + '.md', ['# ' + f.q, '', '> ' + T.fitxa, '',
    '- **' + T.qui + ':** ' + f.de, '- **' + T.perA + ':** ' + f.a, '- **' + T.tipus + ':** ' + mena(f.mena)].concat(on(f) ? ['- **' + T.flux + ':** ' + on(f)] : [], ['- **' + T.ia + ':** ' + iaDe(f)])));
  procs.forEach(p => {
    const passos = Object.keys(seq).filter(k => Array.isArray(seq[k]) && seq[k][0] === p.id).sort((a, b) => seq[a][1] - seq[b][1])
      .map(k => { const [de, a] = k.split('→'), f = fl.find(x => x.de === de && x.a === a); return '1. **' + (f ? f.q : '?') + '** · ' + de + ' → ' + a; });
    md('cerebro/procesos/' + webSlug(p.id || p.nom) + '.md', ['# ' + (p.nom || p.id), '', '> ' + T.fitxa, ''].concat(p.d ? [p.d, ''] : [], passos.length ? passos : [T.senseP]));
  });
  tasquesIa(fl, TQ, nom).forEach(f => out.push(f));
  md('cerebro/decisiones.md', ['# ' + T.dec, '', T.decD].concat((real.troballes || []).length
    ? ['', '## ' + T.trob, ''].concat(real.troballes.map(t => '- **' + t.t + '**' + (t.d ? ': ' + t.d : ''))) : []));
  return out;
}
/* La feina rutinària del mapa: què en pot preparar la IA i què fa una persona.
   És el número que diu si el mapa està prou ben fet per treure feina de sobre
   (X de N), i la llista que fa servir /tasca al repositori del client. */
function tasquesIa(fl, T, nom) {
  const cel = s => String(s).replace(/\|/g, '\\|');
  const tasques = fl.map(f => {
    const m = f.ia.tipus ? entregableMeta(f.ia.tipus) : null;
    /* El tipus surt del nom del lliurament: es diu quina paraula l'ha donat,
       perquè es confirmi a la sala i no passi per una dada. */
    const h = f.ia.tipus && ENTREGABLE_HINTS.find(e => e[1] === f.ia.tipus && e[0].test(f.q));
    return { id: f.id, q: f.q, de: f.de, a: f.a, mena: isIntangible(f.mena) ? 'intangible' : menaExplicita(f.mena) ? 'tangible' : '', tipus: f.ia.tipus || null,
      perParaula: h ? h[0].exec(f.q)[0].toLowerCase() : null, pot: f.ia.pot, motiu: f.ia.motiu || '', accepta: f.ia.pot ? f.accepta : null,
      cal: f.ia.pot ? m.cal.slice() : [], surt: f.ia.pot ? m.surt : '' };
  });
  const persona = ['intangible', 'el tipus no surt d\'una màquina'];
  const maq = tasques.filter(x => x.pot), per = tasques.filter(x => persona.includes(x.motiu)), fora = tasques.filter(x => x.motiu === 'de fora'),
    sense = tasques.filter(x => !x.pot && !persona.includes(x.motiu) && x.motiu !== 'de fora');
  const fila = x => '| ' + cel(x.q) + ' | ' + cel(x.de + ' → ' + x.a) + ' |';
  const md = ['# ' + T.titol.split('{nom}').join(nom), '', '> ' + T.generat, '', T.regla, '',
    '**' + T.recompte.replace('{m}', maq.length).replace('{t}', tasques.length) + '**', ''];
  if (maq.length) md.push('## ' + T.maquina, '', '| ' + [T.cols.q, T.cols.deA, T.cols.tipus, T.cols.cal, T.cols.surt, T.cols.accepta].join(' | ') + ' |', '| --- | --- | --- | --- | --- | --- |',
    ...maq.map(x => '| ' + [x.q, x.de + ' → ' + x.a, entregableMeta(x.tipus).nom + (x.perParaula ? ' («' + x.perParaula + '»)' : ''), x.cal.join(', '), x.surt, x.accepta].map(cel).join(' | ') + ' |'),
    '', T.perConfirmar, '');
  if (per.length) md.push('## ' + T.persona[0], '', T.persona[1], '', '| ' + T.cols.q + ' | ' + T.cols.deA + ' |', '| --- | --- |', ...per.map(fila), '');
  if (sense.length) md.push('## ' + T.senseTipus[0], '', T.senseTipus[1], '', '| ' + T.cols.q + ' | ' + T.cols.deA + ' |', '| --- | --- |', ...sense.map(fila), '');
  if (fora.length) md.push('## ' + T.deFora[0], '', T.deFora[1], '', '| ' + T.cols.q + ' | ' + T.cols.deA + ' |', '| --- | --- |', ...fora.map(fila), '');
  const json = { formato: 'tt-tasques-1', total: tasques.length, maquina: maq.length, persona: per.length, senseTipus: sense.length, deFora: fora.length, tasques };
  return [{ ruta: 'cerebro/tasques-ia.md', tipus: 'text/markdown', cos: md.join('\n') }, { ruta: 'cerebro/tasques-ia.json', tipus: 'application/json', cos: JSON.stringify(json, null, 2) + '\n' }];
}
/* L'eina que importa el que el client ja té (eines/importa.mjs). El que fa és
   del bloc VS-IMPORTA (a eines/nucli.mjs); aquí només hi ha com es crida. */
const IMP_CLI = String.raw`// Porta el que el projecte ja té a cerebro/fonts/: una web, documents (.html .md .txt) i taules (.csv).
// node eines/importa.mjs <url|carpeta|fitxer>… [--autoritzat <domini>] [--columnes "a,b"] [--max 30] [--surt <arrel del repositori>]
// Una web, només amb --autoritzat i el seu domini: la de qui us ho demana, amb la seva autorització escrita (va al CRM).
// D'una taula (.csv) només entra la capçalera i quantes files té, si no es trien les columnes amb --columnes.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, basename, relative, resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { importaFonts, rastreja } from './nucli.mjs';
const a = process.argv.slice(2), o = { max: 30, surt: fileURLToPath(new URL('../', import.meta.url)), urls: [], camins: [], autoritzat: '', columnes: [] };
for (let i = 0; i < a.length; i++) {
  if (a[i] === '--max') o.max = parseInt(a[++i], 10) || 30;
  else if (a[i] === '--surt') o.surt = resolve(a[++i] || '.');
  else if (a[i] === '--autoritzat') o.autoritzat = a[++i] || '';
  else if (a[i] === '--columnes') o.columnes = String(a[++i] || '').split(',').map(x => x.trim()).filter(Boolean);
  else if (/^https?:\/\//i.test(a[i])) o.urls.push(a[i]);
  else o.camins.push(a[i]);
}
if (!o.urls.length && !o.camins.length) { console.error('node eines/importa.mjs <url|carpeta|fitxer>… [--autoritzat <domini>] [--columnes "a,b"] [--max 30] [--surt <carpeta>]'); process.exit(1); }
if (o.urls.length && !o.autoritzat) { console.error('Per llegir una web cal --autoritzat <domini> / Para leer una web hace falta --autoritzat <dominio>'); process.exit(1); }
if (o.urls.length && typeof fetch !== 'function') { console.error('Cal Node 18 o més per llegir webs'); process.exit(1); }
// De les carpetes es llegeixen els textos i les taules; PDF, Word i fulls de càlcul només es llisten, per llegir-los amb la IA.
// El nom que queda és relatiu a la carpeta donada: un camí absolut porta el nom d'usuari de qui importa.
const TEXT = /\.(html?|md|markdown|txt|csv|tsv)$/i, LLEGIR = /\.(pdf|docx?|xlsx?|odt|ods|odp|pptx?|rtf)$/i, MAX = 5 * 1024 * 1024;
const fonts = resolve(o.surt, 'cerebro', 'fonts'), entrades = [], docs = [], fora = [];
const llegeix = (fitxer, nom, explicit) => {
  if (resolve(fitxer).startsWith(fonts + sep)) return;   // el que ja és a cerebro/fonts/ no es torna a importar
  if (!TEXT.test(fitxer)) { if (explicit || LLEGIR.test(fitxer)) entrades.push({ tipus: 'doc', font: nom, nom, cos: '' }); return; }
  if (statSync(fitxer).size > MAX) { fora.push({ font: nom, motiu: '> 5 MB' }); return; }
  entrades.push({ tipus: /\.(csv|tsv)$/i.test(fitxer) ? 'dades' : 'doc', font: nom, nom, cos: readFileSync(fitxer, 'utf8') });
};
const recorre = (dir, arrel) => readdirSync(dir, { withFileTypes: true }).sort((x, y) => (x.name < y.name ? -1 : 1)).forEach(d => {
  const p = join(dir, d.name);
  if (d.name[0] === '.' || d.name === 'node_modules') return;
  if (d.isDirectory()) recorre(p, arrel); else if (d.isFile()) llegeix(p, relative(arrel, p).split(sep).join('/'), false);
});
for (const c of o.camins) {
  let st = null;
  try { st = statSync(c); } catch (e) { console.error('⚠️ ' + c + ' ?'); continue; }
  if (st.isDirectory()) recorre(resolve(c), dirname(resolve(c))); else llegeix(c, basename(c), true);
}
for (const u of o.urls) {
  const r = await rastreja(u, { fetch, max: o.max, autoritzat: o.autoritzat, avis: x => console.error('· ' + x) });
  r.pagines.forEach(p => entrades.push({ tipus: 'web', font: p.url, nom: p.url, cos: p.html }));
  docs.push(...r.docs);
  fora.push(...r.fora);
}
// L'índex d'abans es completa, no es perd: importar la web avui i un CSV demà.
let previ = null;
try { previ = JSON.parse(readFileSync(join(fonts, 'fonts.json'), 'utf8')); } catch (e) { previ = null; }
const r = importaFonts(entrades, { ara: new Date().toISOString().slice(0, 10), previ, docs, fora, columnes: o.columnes }), i = r.informe;
for (const f of r.fitxers) {
  if (!/^cerebro\/fonts\/([a-z]+\/)?[a-z0-9-]+\.(md|json)$/.test(f.ruta)) continue;   // res fora de cerebro/fonts/
  mkdirSync(dirname(join(o.surt, f.ruta)), { recursive: true });
  writeFileSync(join(o.surt, f.ruta), f.cos);
}
const altres = i.fora.length - i.perLlegir;
console.log('✅ ' + i.web + ' web, ' + i.docs + ' docs, ' + i.dades + ' CSV → cerebro/fonts/. Ocult/oculto: ' + i.correus + ' e-mail, ' + i.telefons + ' tel., ' + i.altres + ' DNI/IBAN.'
  + (i.columnesFora.length ? ' Columnes/columnas fora: ' + i.columnesFora.join(', ') + '.' : '')
  + (i.perLlegir ? ' PDF/Word per a la IA / para la IA: ' + i.perLlegir + '.' : '')
  + (altres ? ' No importat/importado: ' + altres + '.' : '') + ' Detall/detalle: cerebro/fonts/index.md');
process.exit(i.web + i.docs + i.dades + i.perLlegir ? 0 : 1);
`;
/* L'API i els avisos (fase 3 del pla): el codi que corre fora del navegador.
   Surt dels blocs VS-REG, VS-API i VS-MCP de l'editor tal com hi són, perquè
   hi hagi un sol codi; aquí només s'hi afegeix com es crida. */
function einesDelSite(o, L, nom, url) {
  const c = o.codi, cap = '// ' + nom.replace(/\s+/g, ' ') + ' · ' + L.api.cap + '\n', web = url || '';
  const env = 'urls: process.env.TT_WEBHOOKS, secret: process.env.TT_WEBHOOK_SECRET, web: process.env.URL || ' + JSON.stringify(web);
  const mapa = { pairs: (o.mapa.pairs || []).map(p => p.slice(0, 6)) };
  return [
    { ruta: 'eines/nucli.mjs', cos: cap + c.reg + '\n' + c.api + (c.imp ? '\n' + c.imp : '')
      + '\nexport { REG_TXT, llegeixRegistre, observaRegistre, fluxosDelMapa, avisosDelFormulari, signaAvis, verificaAvis, enviaAvisos, TT_AVISOS'
      + (c.imp ? ', IMP_PERSONAL, amagaPersonal, htmlAText, sitemapUrls, robotsPermet, robotsEspera, robotsSitemaps, llegeixCsv, csvAMd, fontMd, importaFonts, rastreja' : '') + ' };\n' },
    ...(c.imp ? [{ ruta: 'eines/importa.mjs', cos: '#!/usr/bin/env node\n' + cap + IMP_CLI }] : []),
    { ruta: 'eines/registre.mjs', cos: '#!/usr/bin/env node\n' + cap
      + '// node eines/registre.mjs [cerebro/registro/registre.csv] [--llengua ca|es] [--envia]\n'
      + 'import { readFileSync, writeFileSync, mkdirSync } from \'node:fs\';\nimport { llegeixRegistre, observaRegistre, enviaAvisos } from \'./nucli.mjs\';\n'
      + 'const arrel = new URL(\'../\', import.meta.url), a = process.argv.slice(2), o = { csv: new URL(\'cerebro/registro/registre.csv\', arrel), llengua: ' + JSON.stringify(o.llengua === 'es' ? 'es' : 'ca') + ', envia: false };\n'
      + 'for (let i = 0; i < a.length; i++) { if (a[i] === \'--envia\') o.envia = true; else if (a[i] === \'--llengua\') o.llengua = a[++i]; else o.csv = a[i]; }\n'
      + 'const l = llegeixRegistre(readFileSync(o.csv, \'utf8\'));\n'
      + 'const r = observaRegistre(JSON.parse(readFileSync(new URL(\'cerebro/mapa-real.json\', arrel), \'utf8\')), l.files, { llengua: o.llengua });\n'
      + 'const surt = new URL(\'cerebro/registro/\', arrel);\nmkdirSync(surt, { recursive: true });\n'
      + 'writeFileSync(new URL(\'informe.md\', surt), r.informe);\n'
      + 'writeFileSync(new URL(\'mapa-observat.json\', surt), JSON.stringify(r.mapaObservat, null, 2) + \'\\n\');\n'
      + 'writeFileSync(new URL(\'avisos.json\', surt), JSON.stringify(r.avisos, null, 2) + \'\\n\');\n'
      + 'console.log(\'✅ \' + l.files.length + \' · \' + r.vius.length + \' / \' + r.morts.length + \' / \' + r.nous.length + \' · \' + r.avisos.length + \' → cerebro/registro/\');\n'
      + 'if (o.envia) {\n  const e = await enviaAvisos(r.avisos, { ' + env + ' });\n'
      + '  console.log(e.motiu ? \'⚠️ \' + e.motiu : \'📨 \' + e.enviats);\n  e.errors.forEach(x => console.error(x));\n}\n' },
    { ruta: 'eines/mcp.mjs', cos: '#!/usr/bin/env node\n' + cap
      + 'import { readFileSync } from \'node:fs\';\nimport { llegeixRegistre, observaRegistre } from \'./nucli.mjs\';\n' + c.mcp
      + '\nconst arrel = new URL(\'../\', import.meta.url);\n'
      + 'const respon = creaMcp({ llegeix: r => { try { return readFileSync(new URL(r, arrel), \'utf8\'); } catch (e) { return null; } } });\n'
      + 'const surt = m => process.stdout.write(JSON.stringify(m) + \'\\n\');\nlet buf = \'\';\nprocess.stdin.setEncoding(\'utf8\');\n'
      + 'process.stdin.on(\'data\', d => {\n  buf += d;\n  for (let i = buf.indexOf(\'\\n\'); i >= 0; i = buf.indexOf(\'\\n\')) {\n'
      + '    const l = buf.slice(0, i).trim();\n    buf = buf.slice(i + 1);\n    if (!l) continue;\n'
      + '    let m;\n    try { m = JSON.parse(l); } catch (e) { surt({ jsonrpc: \'2.0\', id: null, error: { code: -32700, message: \'JSON\' } }); continue; }\n'
      + '    const r = respon(m);\n    if (r) surt(r);\n  }\n});\n' },
    { ruta: 'netlify/functions/submission-created.mjs', cos: cap
      + 'import { fluxosDelMapa, avisosDelFormulari, enviaAvisos } from \'../../eines/nucli.mjs\';\n'
      + 'const FLUXOS = fluxosDelMapa(' + JSON.stringify(mapa) + ');\n'
      + 'export async function handler(event) {\n  let payload = null;\n'
      + '  try { payload = JSON.parse(event.body || \'{}\').payload; } catch (e) { return { statusCode: 400, body: \'\' }; }\n'
      + '  const avisos = avisosDelFormulari(payload, FLUXOS);\n  const r = await enviaAvisos(avisos, { ' + env + ' });\n'
      + '  if (r.errors.length) console.error(r.errors.join(\'\\n\'));\n'
      + '  return { statusCode: 200, body: JSON.stringify({ avisos: avisos.map(x => x.tipus), enviats: r.enviats, motiu: r.motiu }) };\n}\n' },
    { ruta: 'netlify/functions/deploy-succeeded.mjs', cos: cap
      + 'import { enviaAvisos } from \'../../eines/nucli.mjs\';\n'
      + 'export async function handler(event) {\n  let p = {};\n  try { p = JSON.parse(event.body || \'{}\').payload || {}; } catch (e) { p = {}; }\n'
      + '  if (p.context && p.context !== \'production\') return { statusCode: 200, body: \'\' };\n'
      + '  const dades = { url: p.ssl_url || p.url || process.env.URL || \'\', commit: p.commit_ref || \'\', branca: p.branch || \'\' };\n'
      + '  const r = await enviaAvisos([{ tipus: \'cerebro.actualizado\', dades }], { ' + env + ' });\n'
      + '  if (r.errors.length) console.error(r.errors.join(\'\\n\'));\n'
      + '  return { statusCode: 200, body: JSON.stringify({ enviats: r.enviats, motiu: r.motiu }) };\n}\n' },
    /* El repositori es refà sol: el mateix motor que l'editor i el genera.mjs de Netlify. */
    ...(c.repo ? [{ ruta: 'eines/motor.mjs', cos: c.repo.motor }, { ruta: 'eines/genera.mjs', cos: c.repo.genera }] : []),
    { ruta: '.mcp.json', tipus: 'application/json', cos: JSON.stringify({ mcpServers: { cervell: { type: 'stdio', command: 'node', args: ['eines/mcp.mjs'] } } }, null, 2) + '\n' },
    { ruta: 'API.md', tipus: 'text/markdown', cos: L.api.doc.join('\n').replace(/\{nom\}/g, nom).replace(/\{url\}/g, url || L.api.web) + '\n' }
  ].map(f => Object.assign({ tipus: 'text/javascript' }, f));
}
/* Els continguts de la web: cerebro/continguts/<id>.md. El text de les
   pàgines el pot escriure una persona o una IA a partir del que s'ha importat,
   i aquí es fa HTML. Un subconjunt petit de Markdown i res més: la web no té
   JavaScript i la CSP només deixa imatges pròpies, així que tot el que no és
   d'aquest subconjunt —HTML cru, enllaços estranys, imatges de fora— surt com
   a text. Un contingut no pot trencar la web ni colar-hi res. */
function llegeixContingut(text) {
  const t = String(text == null ? '' : text).replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const meta = {}, m = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(t);
  if (!m) return { meta, cos: t };
  m[1].split('\n').forEach(l => {
    const k = /^\s*([a-zA-Zà-ú]+)\s*:\s*(.*?)\s*$/.exec(l);
    if (!k) return;
    const c = k[1].toLowerCase(), v = k[2].replace(/^(['"])(.*)\1$/, '$2');
    if (c === 'menu') meta.menu = /^(si|sí|yes|true|1)$/i.test(v) ? true : /^(no|false|0)$/i.test(v) ? false : undefined;
    else if (c === 'titol' || c === 'títol' || c === 'titulo' || c === 'título') meta.titol = v;
    else if (c === 'font') meta.font = v;
  });
  return { meta, cos: t.slice(m[0].length) };
}
function mdAHtml(md) {
  const e = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  /* Un enllaç només si és web, correu o una ruta de la mateixa web. Es mira
     el text cru, sense descodificar entitats ni treure espais: el que no
     comença net per un d'aquests tres no és enllaç, és text. */
  const bo = h => /^(https?:\/\/[^\s"'<>]+|mailto:[^\s"'<>:]+@[^\s"'<>]+|(?![a-z][a-z0-9+.-]*:)(?!\/\/)[^\s"'<>:]*)$/i.test(h) && h !== '';
  const propia = h => bo(h) && !/^(https?|mailto):/i.test(h);
  const enLinia = s => {
    const parts = [];
    const guarda = h => '\u0000' + (parts.push(h) - 1) + '\u0000';
    let x = String(s).replace(/`([^`]+)`/g, (_, c) => guarda('<code>' + e(c) + '</code>'));
    x = x.replace(/!\[([^\]]*)\]\(([^)\s]*)\)/g, (_, alt, src) => guarda(propia(src) ? '<img src="' + e(src) + '" alt="' + e(alt) + '" loading="lazy">' : e(alt)));
    x = x.replace(/\[([^\]]+)\]\(([^)\s]*)\)/g, (_, t, h) => guarda(bo(h)
      ? '<a href="' + e(h) + '"' + (/^https?:/i.test(h) ? ' rel="noopener"' : '') + '>' + estil(e(t)) + '</a>' : estil(e(t))));
    return estil(e(x)).replace(/\u0000(\d+)\u0000/g, (_, i) => parts[+i]);
  };
  const estil = s => s.replace(/\*\*(?=\S)([^*]+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^\w*])[*_](?=\S)([^*_]+?)[*_](?![\w*])/g, '$1<em>$2</em>');
  const linies = String(md == null ? '' : md).replace(/\u0000/g, '').replace(/\r\n?/g, '\n').split('\n'), out = [];
  let par = [], llista = null;
  const tancaPar = () => { if (par.length) out.push('<p>' + enLinia(par.join(' ')) + '</p>'); par = []; };
  const tancaLl = () => { if (llista) out.push('<' + llista.t + '>' + llista.items.map(i => '<li>' + enLinia(i) + '</li>').join('') + '</' + llista.t + '>'); llista = null; };
  linies.forEach(l => {
    const t = l.trim();
    let m;
    if (!t) { tancaPar(); tancaLl(); return; }
    if ((m = /^(#{1,4})\s+(.+?)\s*#*$/.exec(t))) { tancaPar(); tancaLl(); const n = Math.max(2, m[1].length); out.push('<h' + n + '>' + enLinia(m[2]) + '</h' + n + '>'); return; }
    if (/^(-{3,}|\*{3,})$/.test(t)) { tancaPar(); tancaLl(); out.push('<hr>'); return; }
    if ((m = /^>\s?(.*)$/.exec(t))) { tancaPar(); tancaLl(); if (m[1]) out.push('<blockquote><p>' + enLinia(m[1]) + '</p></blockquote>'); return; }
    if ((m = /^([-*]|\d{1,3}[.)])\s+(.+)$/.exec(t))) {
      const tag = /^\d/.test(m[1]) ? 'ol' : 'ul';
      tancaPar();
      if (llista && llista.t !== tag) tancaLl();
      if (!llista) llista = { t: tag, items: [] };
      llista.items.push(m[2]);
      return;
    }
    if (llista && /^\s{2,}/.test(l)) { llista.items[llista.items.length - 1] += ' ' + t; return; }
    tancaLl();
    par.push(t);
  });
  tancaPar(); tancaLl();
  return out.join('\n');
}
function webASite(web, opts) {
  const o = opts || {}, L = SITE_TXT[o.llengua] || SITE_TXT.ca, llengua = SITE_TXT[o.llengua] ? o.llengua : 'ca';
  const e = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const correu = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(o.correu || '') ? o.correu : '';
  const nom = String(o.nom || (web.casa || [])[0] || web.titol || 'La web').trim();
  const MC = marcaNeta(o.marca), MP = MC.portes || {}, CT = MC.contacte || {};
  const porta = id => (web.portes || []).find(p => p.id === id);
  const etiqueta = p => (MP[p.rol] && MP[p.rol].nom) || p.rol;
  const descripcio = MC.presentacio ? MC.presentacio.slice(0, 160) : web.titol || nom;
  const ruta = id => (id === 'inici' ? 'index.html' : id + '.html');
  /* Amb l'adreça definitiva, cada pàgina diu quina és la seva (canonical i
     Open Graph) i surt el sitemap. Sense, tot segueix sent relatiu. */
  const url = /^https:\/\/[^\s"<>]+$/.test(o.url || '') ? o.url.replace(/\/*$/, '/') : '';
  const abs = r => url + (r === 'index.html' ? '' : r);
  const ld = x => '<script type="application/ld+json">' + JSON.stringify(Object.assign({ '@context': 'https://schema.org' }, x)).replace(/</g, '\\u003c') + '<\/script>';
  const llista = (a, f) => (a.length ? '<ul>' + a.map(f).join('') + '</ul>' : '');
  const lli = (x, cap) => '<li>' + e(x.q) + (cap ? ' <small>' + e(cap) + '</small>' : '') + '</li>';
  /* Els continguts (cerebro/continguts/<id>.md): el text que la casa vol dir,
     importat o escrit, dins de les pàgines que surten del mapa o en pàgines
     noves. El mapa en dona l'estructura i els continguts, les paraules. */
  const RESERVATS = ['equip', 'registre', 'gracies', '404', 'estil', 'web', 'index'], cont = {}, avisa = typeof o.avisa === 'function' ? o.avisa : () => {};
  /* Un sol sedàs per a les dades personals, el de l'importador (VS-IMPORTA):
     un contingut amb un correu o un telèfon (que no siguin els de la web), un DNI
     o un IBAN no surt. Bloqueja, no avisa només; i sense sedàs no surt cap. */
  if ((o.continguts || []).length && typeof amagaPersonal !== 'function') throw new Error('Falta el bloc VS-IMPORTA: sense amagaPersonal, els continguts no surten.');
  (o.continguts || []).forEach(c => {
    const id = String(c.id || '').toLowerCase(), t = String(c.text == null ? '' : c.text);
    if (!/^[a-z0-9][a-z0-9-]{0,59}$/.test(id) || RESERVATS.includes(id)) return avisa(L.contReservat.replace('{id}', id || '?'));
    const p = amagaPersonal([correu, CT.telefon].filter(Boolean).reduce((x, d) => x.split(d).join(''), t));
    if (p.correus + p.telefons + p.altres) return avisa(L.contPersonal.replace('{id}', id));
    cont[id] = llegeixContingut(t);
  });
  const deMapa = ['inici'].concat((web.portes || []).map(p => p.id), (web.serveis || []).length ? ['serveis'] : []);
  const noves = Object.keys(cont).sort().filter(id => !deMapa.includes(id));
  const titolNova = id => cont[id].meta.titol || (id === 'serveis' ? L.serveis : id.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase()));
  const text = id => (cont[id] && deMapa.includes(id) ? mdAHtml(cont[id].cos) + '\n' : '');
  const menu = (web.menu || []).filter(x => x.id !== 'equip').concat(noves.filter(id => cont[id].meta.menu !== false).map(id => ({ id, t: titolNova(id) })));
  const pagina = (id, titol, cos, dades, extra) => '<!DOCTYPE html>\n<html lang="' + llengua + '">\n<head>\n<meta charset="utf-8">\n'
    + '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + '<title>' + e(id === 'inici' ? nom : titol + ' · ' + nom) + '</title>\n'
    + '<meta name="description" content="' + e(descripcio) + '">\n' + (extra || '')
    + (url ? '<link rel="canonical" href="' + e(abs(ruta(id))) + '">\n<meta property="og:type" content="website">\n<meta property="og:title" content="' + e(titol) + '">\n'
      + '<meta property="og:description" content="' + e(descripcio) + '">\n<meta property="og:url" content="' + e(abs(ruta(id))) + '">\n' : '')
    + '<link rel="stylesheet" href="estil.css">\n<link rel="alternate" type="application/json" href="web.json" title="' + e(L.dades) + '">\n'
    + ld(dades) + '\n</head>\n<body>\n<a class="salta" href="#contingut">' + e(L.salta) + '</a>\n'
    + '<header>\n<p class="marca"><a href="index.html">' + (MC.logoSvg ? '<img src="logo.svg" alt="">' : '') + e(nom) + '</a></p>\n'
    + (MC.lema ? '<p class="lema">' + e(MC.lema) + '</p>\n' : '') + '<nav aria-label="' + e(L.menu) + '"><ul>'
    + menu.map(x => '<li><a href="' + ruta(x.id) + '"' + (x.id === id ? ' aria-current="page"' : '') + '>' + e(x.id === 'inici' ? L.inici : x.id === 'serveis' ? L.serveis : porta(x.id) ? etiqueta(porta(x.id)) : x.t) + '</a></li>').join('')
    + '</ul></nav>\n</header>\n<main id="contingut">\n<h1>' + e(titol) + '</h1>\n' + cos + '\n</main>\n'
    + '<footer>\n<p>' + e(L.peu) + ' <a href="web.json">' + e(L.dades) + '</a>' + (correu ? ' · <a href="mailto:' + e(correu) + '">' + e(correu) + '</a>' : '') + '</p>\n</footer>\n</body>\n</html>\n';
  const formulari = p => {
    const f = 'porta-' + p.id, demana = p.dona[0] ? p.dona[0].q : '';
    return '<h2 id="escriu">' + e(L.escriu) + '</h2>\n<form name="' + f + '" method="post" action="gracies.html" data-netlify="true" data-netlify-honeypot="bot-field">\n'
      + '<input type="hidden" name="form-name" value="' + f + '">\n<input type="hidden" name="rol" value="' + e(p.rol) + '">\n'
      + '<p class="ocult"><label>No omplis això <input type="text" name="bot-field" tabindex="-1" autocomplete="off"></label></p>\n'
      + '<label for="' + f + '-nom">' + e(L.nom) + '</label><input id="' + f + '-nom" name="nom" type="text" autocomplete="name" required>\n'
      + '<label for="' + f + '-correu">' + e(L.correu) + '</label><input id="' + f + '-correu" name="correu" type="email" autocomplete="email" required>\n'
      + '<label for="' + f + '-msg">' + e(L.missatge) + (demana ? ' <small>' + e(demana) + '</small>' : '') + '</label><textarea id="' + f + '-msg" name="missatge" rows="4"></textarea>\n'
      + '<button type="submit">' + e(p.compte ? L.alta : L.envia) + '</button>\n</form>'
      + (correu ? '\n<p>' + e(L.tambe) + ' <a href="mailto:' + e(correu) + '">' + e(correu) + '</a>.</p>' : '');
  };
  const fitxers = [];
  const posa = (r, cos, tipus) => fitxers.push({ ruta: r, tipus: tipus || 'text/html', cos });
  const servei = sv => ({ '@type': 'Service', name: sv.nom, description: sv.d || undefined, provider: { '@type': 'Organization', name: nom } });

  posa('index.html', pagina('inici', nom,
    (MC.presentacio ? '<p>' + e(MC.presentacio) + '</p>\n' : web.titol ? '<p>' + e(web.titol) + '</p>\n' : '') + text('inici') + '<h2>' + e(L.perCadascu) + '</h2>\n'
      + llista(web.portes || [], p => '<li><a href="' + ruta(p.id) + '">' + e(etiqueta(p)) + '</a>' + (p.rep[0] ? ' <small>' + e(p.rep[0].q) + '</small>' : '') + '</li>')
      + (CT.adreca || CT.telefon || CT.horari ? '\n<h2>' + e(L.contacte) + '</h2>\n<ul>'
        + (CT.adreca ? '<li>' + e(L.adreca) + ': ' + e(CT.adreca) + '</li>' : '')
        + (CT.telefon ? '<li>' + e(L.telefon) + ': <a href="tel:' + e(CT.telefon.replace(/[^\d+]/g, '')) + '">' + e(CT.telefon) + '</a></li>' : '')
        + (CT.horari ? '<li>' + e(L.horari) + ': ' + e(CT.horari) + '</li>' : '') + '</ul>' : ''),
    { '@type': 'Organization', name: nom, description: MC.presentacio || web.titol || undefined, slogan: MC.lema || undefined,
      logo: MC.logoSvg && url ? url + 'logo.svg' : undefined, telephone: CT.telefon || undefined,
      address: CT.adreca ? { '@type': 'PostalAddress', streetAddress: CT.adreca } : undefined,
      makesOffer: (web.serveis || []).map(sv => ({ '@type': 'Offer', itemOffered: servei(sv) })) }));
  (web.portes || []).forEach(p => {
    const con = p.connexions.map(c => L.cat[c.cat] || c.nom);
    const passos = p.benvinguda.map(b => {
      const t = L.pas[b.pas] || [b.t, b.d], d = b.pas === 'connecta' ? con.join(', ') + '.' : t[1] || b.d;
      return '<li><strong>' + e(t[0]) + '.</strong> ' + e(d) + '</li>';
    });
    posa(ruta(p.id), pagina(p.id, etiqueta(p),
      (MP[p.rol] && MP[p.rol].intro ? '<p>' + e(MP[p.rol].intro) + '</p>\n' : '')
        + text(p.id) + (p.buida ? '<p>' + e(L.buida) + '</p>\n' : '')
        + (p.rep.length ? '<h2>' + e(L.donem) + '</h2>\n' + llista(p.rep, f => lli(f)) + '\n' : '')
        + (p.dona.length ? '<h2>' + e(L.dones) + '</h2>\n' + llista(p.dona, f => lli(f)) + '\n' : '')
        + (p.xarxa.length ? '<h2>' + e(L.xarxa) + '</h2>\n' + llista(p.xarxa, f => lli(f, f.de + ' → ' + f.a)) + '\n' : '')
        + '<h2>' + e(L.benvinguda) + '</h2>\n<ol>' + passos.join('') + '</ol>\n'
        + (con.length ? '<h2>' + e(L.connecta) + '</h2>\n' + llista(con, c => '<li>' + e(c) + '</li>') + '\n' : '')
        + (p.buida ? '' : formulari(p)),
      { '@type': 'WebPage', name: p.rol, audience: { '@type': 'Audience', audienceType: p.rol },
        mainEntity: { '@type': 'ItemList', itemListElement: p.rep.map((f, i) => ({ '@type': 'ListItem', position: i + 1, name: f.q })) } }));
  });
  if ((web.serveis || []).length) {
    posa('serveis.html', pagina('serveis', L.serveis,
      text('serveis') + web.serveis.map(sv => '<h2>' + e(sv.nom) + '</h2>\n' + (sv.d ? '<p>' + e(sv.d) + '</p>\n' : '')
        + (sv.passos.length ? '<ol>' + sv.passos.map(x => lli(x, x.de + ' → ' + x.a)).join('') + '</ol>' : '')).join('\n')
        + ((web.sempre || []).length ? '\n<h2>' + e(L.sempre) + '</h2>\n' + llista(web.sempre, x => lli(x, x.de + ' → ' + x.a)) : ''),
      { '@type': 'ItemList', name: L.serveis, itemListElement: web.serveis.map((sv, i) => ({ '@type': 'ListItem', position: i + 1, item: servei(sv) })) }));
  }
  noves.forEach(id => posa(ruta(id), pagina(id, titolNova(id), mdAHtml(cont[id].cos), { '@type': 'WebPage', name: titolNova(id) })));
  /* L'equip no és per al públic: hi és perquè la web sencera surti del mapa,
     però els cercadors no la indexen i el menú no la mostra. */
  posa('equip.html', pagina('equip', L.equip,
    '<p>' + e((web.equip.rols || []).join(', ')) + '</p>\n<p><a href="registre.html">' + e(L.reg.titol) + '</a>. ' + e(L.reg.perque) + '</p>\n'
      + (web.equip.intern.length ? '<h2>' + e(L.dins) + '</h2>\n' + llista(web.equip.intern, x => lli(x, x.de + ' → ' + x.a)) : ''),
    { '@type': 'WebPage', name: L.equip }, '<meta name="robots" content="noindex">\n'));
  /* El registre viu (fase 2): un formulari per anotar cada lliurament entre
     rols. Fora del menú i dels cercadors: és per a qui fa la xarxa. */
  const totsRols = (web.casa || []).concat((web.portes || []).map(p => p.rol));
  const qs = [];
  (web.portes || []).forEach(p => p.rep.concat(p.dona, p.xarxa).forEach(f => { if (!qs.includes(f.q)) qs.push(f.q); }));
  ((web.equip || {}).intern || []).forEach(f => { if (!qs.includes(f.q)) qs.push(f.q); });
  const R = L.reg, opc = totsRols.map(r => '<option>' + e(r) + '</option>').join('');
  posa('registre.html', pagina('registre', R.titol, '<p>' + e(R.perque) + '</p>\n'
    + '<form name="registre" method="post" action="gracies.html" data-netlify="true" data-netlify-honeypot="bot-field">\n'
    + '<input type="hidden" name="form-name" value="registre">\n<p class="ocult"><label>No omplis això <input type="text" name="bot-field" tabindex="-1" autocomplete="off"></label></p>\n'
    + '<label for="reg-de">' + e(R.de) + '</label><select id="reg-de" name="de" required><option value=""></option>' + opc + '</select>\n'
    + '<label for="reg-a">' + e(R.a) + '</label><select id="reg-a" name="a" required><option value=""></option>' + opc + '</select>\n'
    + '<label for="reg-q">' + e(R.q) + '</label><input id="reg-q" name="entregable" type="text" list="reg-qs" required>\n'
    + '<datalist id="reg-qs">' + qs.map(q => '<option value="' + e(q) + '"></option>').join('') + '</datalist>\n'
    + '<fieldset><legend>' + e(R.mena) + '</legend><label><input type="radio" name="mena" value="tangible" checked> ' + e(R.t) + '</label><label><input type="radio" name="mena" value="intangible"> ' + e(R.i) + '</label></fieldset>\n'
    + '<fieldset><legend>' + e(R.valor) + '</legend>' + [1, 2, 3, 4, 5].map(v => '<label><input type="radio" name="valor" value="' + v + '"> ' + v + '</label>').join('') + '</fieldset>\n'
    + '<label for="reg-data">' + e(R.data) + '</label><input id="reg-data" name="data" type="date">\n'
    + '<label for="reg-ev">' + e(R.ev) + '</label><input id="reg-ev" name="evidencia" type="url" placeholder="https://">\n'
    + '<p><small>' + e(R.privat) + '</small></p>\n<button type="submit">' + e(R.envia) + '</button>\n</form>',
    { '@type': 'WebPage', name: R.titol }, '<meta name="robots" content="noindex">\n'));
  posa('gracies.html', pagina('gracies', L.gracies, '<p>' + e(L.rebut) + '</p>\n<p><a href="index.html">' + e(L.torna) + '</a></p>',
    { '@type': 'WebPage', name: L.gracies }, '<meta name="robots" content="noindex">\n'));
  posa('estil.css', siteCss(MC), 'text/css');
  if (MC.logoSvg) posa('logo.svg', MC.logoSvg, 'image/svg+xml');
  posa('web.json', JSON.stringify(web, null, 2) + '\n', 'application/json');
  /* El que fa del zip un repositori: la font, les regles, com publicar-lo i
     la configuració de Netlify. */
  posa('404.html', pagina('404', L.noHi, '<p>' + e(L.noHiD) + '</p>\n<p><a href="index.html">' + e(L.torna) + '</a></p>',
    { '@type': 'WebPage', name: L.noHi }, '<meta name="robots" content="noindex">\n'));
  const publiques = ['index.html'].concat((web.portes || []).map(p => ruta(p.id)), (web.serveis || []).length ? ['serveis.html'] : [], noves.map(ruta));
  posa('robots.txt', 'User-agent: *\nAllow: /\nDisallow: /equip.html\nDisallow: /registre.html\n' + (url ? 'Sitemap: ' + url + 'sitemap.xml\n' : ''), 'text/plain');
  if (url) posa('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + publiques.map(r => '<url><loc>' + e(abs(r)) + '</loc></url>\n').join('') + '</urlset>\n', 'application/xml');
  posa('netlify.toml', [
    '# La web surt del mapa de valor: no s\'edita a mà (vegeu CLAUDE.md).',
    '[build]', '  publish = "."', '',
    '[[headers]]', '  for = "/*"', '  [headers.values]',
    '    Content-Security-Policy = "default-src \'none\'; style-src \'self\'; img-src \'self\' data:; form-action \'self\'; base-uri \'none\'; frame-ancestors \'none\'"',
    '    X-Content-Type-Options = "nosniff"', '    Referrer-Policy = "strict-origin-when-cross-origin"',
    '    Permissions-Policy = "camera=(), microphone=(), geolocation=()"', '',
    '[functions]', '  directory = "netlify/functions"', '',
    '# El cervell, les eines i les regles són de l\'equip: viuen al repositori i la web no els serveix.']
    .concat(['/cerebro/*', '/eines/*', '/netlify/*', '/.claude/*', '/.mcp.json', '/CLAUDE.md', '/CEREBRO.md', '/API.md', '/LLEGEIX.md', '/LEEME.md', '/TREBALLAR-AMB-CLAUDE.md', '/TRABAJAR-CON-CLAUDE.md']
      .map(r => '[[redirects]]\n  from = "' + r + '"\n  to = "/404.html"\n  status = 404\n  force = true\n')).join('\n'), 'text/plain');
  const K = KIT_TXT[llengua];
  if (o.mapa) cervell(o.mapa, L.cb, K.tasques, nom, web.casa).forEach(f => posa(f.ruta, f.cos, f.tipus));
  /* La marca viatja amb el repositori, com el mapa: és l'altra font. */
  if (Object.keys(MC).length) {
    const desa = Object.assign({}, MC); delete desa.logoSvg; if (MC.logoSvg) desa.logo = '../logo.svg';
    posa('cerebro/marca.json', JSON.stringify(desa, null, 2) + '\n', 'application/json');
  }
  /* I el que es va triar a l'editor, perquè `eines/genera.mjs` no ho perdi en
     refer la web: abans tornava al català, al rol que més lliura i sense correu.
     Només el que es va dir; el que es dedueix es torna a deduir. */
  if (o.mapa) {
    const conf = {}, casa = (Array.isArray(o.casa) ? o.casa : []).filter(x => typeof x === 'string' && x.trim());
    if (String(o.nom || '').trim()) conf.nom = nom;
    if (SITE_TXT[o.llengua]) conf.llengua = llengua;
    if (casa.length) conf.casa = casa;
    if (correu) conf.correu = correu;
    if (url) conf.url = url;
    if (Object.keys(conf).length) posa('cerebro/configuracio.json', JSON.stringify(conf, null, 2) + '\n', 'application/json');
  }
  const md = a => a.join('\n').split('{nom}').join(nom) + '\n';
  /* El kit de Claude: les regles, la guia (gratis, amb Claude Code o amb
     TeamTowers) i les tres skills que fan la feina de rutina. */
  posa('CLAUDE.md', md(K.claude), 'text/markdown');
  posa(llengua === 'es' ? 'TRABAJAR-CON-CLAUDE.md' : 'TREBALLAR-AMB-CLAUDE.md', md(K.guia), 'text/markdown');
  Object.keys(K.skills).forEach(n => posa('.claude/skills/' + n + '/SKILL.md', md(K.skills[n]), 'text/markdown'));
  posa(llengua === 'es' ? 'LEEME.md' : 'LLEGEIX.md', md(L.llegeix), 'text/markdown');
  if (o.mapa && o.codi) einesDelSite(o, L, nom, url).forEach(f => posa(f.ruta, f.cos, f.tipus));
  /* El que ja és al repositori (fonts, continguts, dossier, esborranys) no es
     torna a escriure, però surt a l'índex: el servidor MCP només llegeix el
     que hi surt. */
  /* El que s'ha importat a l'editor (cerebro/fonts/) va al zip; al repositori ja hi és. */
  (o.fonts || []).filter(f => /^cerebro\/fonts\/[a-z0-9._/-]+$/.test(f.ruta) && f.ruta.indexOf('..') < 0)
    .forEach(f => posa(f.ruta, f.cos, /\.json$/.test(f.ruta) ? 'application/json' : 'text/markdown'));
  const repo = (o.repo || []).filter(f => !fitxers.some(x => x.ruta === f.ruta));
  if (o.mapa) indexCervell(fitxers.concat(repo), nom, L.idx).forEach(f => posa(f.ruta, f.cos, f.tipus));
  return { nom, llengua, fitxers };
}

/* L'índex del cervell: cada document del repositori amb el seu tema i la seva
   capa. Pública és la web que s'indexa; per enllaç, les pàgines noindex que es
   donen a qui toca; equip, el que només viu al repositori. Surt dels fitxers
   que ja hi ha, així que no pot dir res que no hi sigui. És el mateix model que
   el cervell d'Events Penedès (cerebro/indice.json + CEREBRO.md). */
const IDX_TEMES = ['web', 'mapa', 'rols', 'lliuraments', 'processos', 'decisions', 'tasques', 'continguts', 'fonts', 'regles', 'eines'];
const IDX_CAPES = ['publica', 'enllac', 'equip'];
function indexCervell(fitxers, nom, T) {
  const ent = [];
  const titol = f => {
    if (/^cerebro\/mapa-real\.json$/.test(f.ruta)) return T.real;
    if (/^cerebro\/mapa-ideal\.json$/.test(f.ruta)) return T.ideal;
    if (f.ruta === 'web.json') return T.dades;
    if (f.ruta === 'cerebro/marca.json') return T.marca;
    if (f.ruta === 'cerebro/configuracio.json') return T.config;
    const m = /^# (.+)$/m.exec(f.cos) || /<h1>([^<]*)<\/h1>/.exec(f.cos);
    return m ? m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"') : f.ruta;
  };
  const classifica = r => r === '404.html' ? null
    : /\.html$/.test(r) || r === 'web.json' ? ['web', null]
    : /^cerebro\/mapa-(real|ideal)\.json$/.test(r) ? ['mapa', 'equip']
    : /^cerebro\/roles\//.test(r) ? ['rols', 'equip']
    : /^cerebro\/entregables\//.test(r) ? ['lliuraments', 'equip']
    : /^cerebro\/procesos\//.test(r) ? ['processos', 'equip']
    : r === 'cerebro/decisiones.md' ? ['decisions', 'equip']
    : r === 'cerebro/marca.json' || r === 'cerebro/configuracio.json' ? ['web', 'equip']
    : /^cerebro\/(tasques-ia\.(md|json)|esborranys\/.+\.md)$/.test(r) ? ['tasques', 'equip']
    : /^cerebro\/continguts\/[^/]+\.md$/.test(r) ? ['continguts', 'equip']
    : /^cerebro\/(fonts\/.+\.(md|json)|dossier\.md)$/.test(r) ? ['fonts', 'equip']
    : /^(CLAUDE|LLEGEIX|LEEME|TREBALLAR-AMB-CLAUDE|TRABAJAR-CON-CLAUDE)\.md$|^\.claude\/skills\/[^/]+\/SKILL\.md$/.test(r) ? ['regles', 'equip']
    : /^(eines|netlify)\/|^\.mcp\.json$|^API\.md$/.test(r) ? ['eines', 'equip'] : null;
  fitxers.forEach(f => {
    const c = classifica(f.ruta);
    if (!c) return;
    const capa = c[1] || (/<meta name="robots" content="noindex">/.test(f.cos) ? 'enllac' : 'publica');
    ent.push({ ruta: f.ruta, titol: titol(f), tema: c[0], capa });
  });
  const json = { proyecto: nom, temas: IDX_TEMES.map(id => ({ id, nombre: T.temes[id] })), capas: IDX_CAPES.map(id => ({ id, nombre: T.capes[id] })), entradas: ent };
  const cel = s => String(s).replace(/\|/g, '\\|');
  const md = ['# ' + T.titol.replace('{nom}', nom), '', '> ' + T.generat, '', T.intro, ''];
  IDX_TEMES.forEach(t => {
    const seves = ent.filter(x => x.tema === t);
    if (!seves.length) return;
    md.push('## ' + T.temes[t], '', '| ' + T.doc + ' | ' + T.capa + ' |', '| --- | --- |');
    IDX_CAPES.forEach(c => seves.filter(x => x.capa === c).forEach(x => md.push('| [' + cel(x.titol) + '](' + x.ruta + ') | ' + T.capes[c] + ' |')));
    md.push('');
  });
  return [
    { ruta: 'cerebro/indice.json', tipus: 'application/json', cos: JSON.stringify(json, null, 2) + '\n' },
    { ruta: 'CEREBRO.md', tipus: 'text/markdown', cos: md.join('\n') }
  ];
}

/* Un zip sense compressió (STORE): prou per a una web petita, sense cap
   dependència, i determinista —data fixa— perquè el mateix mapa doni sempre
   els mateixos bytes. */
const CRC_T = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(b) { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC_T[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function zipFitxers(fitxers) {
  const enc = new TextEncoder(), parts = [], cent = [];
  let off = 0;
  const cap = (n, cb) => { const a = new Uint8Array(n), v = new DataView(a.buffer); cb(v); return a; };
  fitxers.forEach(f => {
    const nom = enc.encode(f.ruta), dades = typeof f.cos === 'string' ? enc.encode(f.cos) : f.cos, crc = crc32(dades);
    const loc = cap(30, v => { v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x0800, true); v.setUint16(8, 0, true);
      v.setUint16(10, 0, true); v.setUint16(12, 0x21, true); v.setUint32(14, crc, true); v.setUint32(18, dades.length, true); v.setUint32(22, dades.length, true);
      v.setUint16(26, nom.length, true); v.setUint16(28, 0, true); });
    cent.push(cap(46, v => { v.setUint32(0, 0x02014b50, true); v.setUint16(4, 20, true); v.setUint16(6, 20, true); v.setUint16(8, 0x0800, true);
      v.setUint16(10, 0, true); v.setUint16(12, 0, true); v.setUint16(14, 0x21, true); v.setUint32(16, crc, true); v.setUint32(20, dades.length, true);
      v.setUint32(24, dades.length, true); v.setUint16(28, nom.length, true); v.setUint32(42, off, true); }), nom);
    parts.push(loc, nom, dades);
    off += 30 + nom.length + dades.length;
  });
  const midaC = cent.reduce((s, a) => s + a.length, 0);
  const fi = cap(22, v => { v.setUint32(0, 0x06054b50, true); v.setUint16(8, fitxers.length, true); v.setUint16(10, fitxers.length, true);
    v.setUint32(12, midaC, true); v.setUint32(16, off, true); });
  const tot = parts.concat(cent, [fi]), out = new Uint8Array(tot.reduce((s, a) => s + a.length, 0));
  let p = 0; tot.forEach(a => { out.set(a, p); p += a.length; });
  return out;
}
/* L'empremta de cada fitxer, per a la permaweb. `digest(bytes) → Promise<hex>`
   s'injecta: al navegador és crypto.subtle i a Node, node:crypto. */
async function ambPermaweb(site, digest) {
  const enc = new TextEncoder();
  const fitxers = [];
  for (const f of site.fitxers) { const b = enc.encode(f.cos); fitxers.push({ ruta: f.ruta, bytes: b.length, sha256: await digest(b) }); }
  const manifest = { formato: 'tt-permaweb-1', nom: site.nom, fitxers,
    nota: 'Empremta SHA-256 de cada fitxer. El que es publica a IPFS, Arweave o qualsevol altre lloc es pot comprovar amb aquesta llista.' };
  return site.fitxers.concat([{ ruta: 'permaweb.json', tipus: 'application/json', cos: JSON.stringify(manifest, null, 2) + '\n' }]);
}
/*/VS-SITE*/
/*VS-TASQUES*/
/* GENERAT per SOS/tools/build-vna-suport.js des de SOS/index.html · no s'edita a mà.
   La regla de qui fa cada lliurament, tal com és a l'app: un intangible no
   el fa mai la màquina, i un tangible només si el seu tipus en pot sortir. */
const normKind=k=>{const m=String(k==null?'':k).trim().toLowerCase();
  return(m==='i'||m==='intangible')?'intangible':'tangible';};
const menaExplicita=k=>{const m=String(k==null?'':k).trim().toLowerCase();
  return m==='t'||m==='tangible'||m==='i'||m==='intangible';};
const isIntangible=k=>normKind(k)==='intangible';
const ENTREGABLES=[
  {id:'acta',nom:'Acta de reunió',ic:'📋',maquina:true,
   que:'El que s\'ha decidit, qui hi era i què queda pendent, amb data.',
   cal:['assistents','punts tractats','acords'],
   surt:'Data, assistents, acords numerats i pendents amb responsable i termini.'},
  {id:'informe',nom:'Informe periòdic',ic:'📊',maquina:true,
   que:'El que s\'ha mogut en un període, amb les xifres que ja hi ha al registre.',
   cal:['període','apunts del ledger','rols actius'],
   surt:'Resum, taula d\'activitat, comparació amb el període anterior i avisos.'},
  {id:'justificacio',nom:'Justificació de subvenció',ic:'🧾',maquina:true,
   que:'El que demana la convocatòria, omplert amb el que consta al registre.',
   cal:['convocatòria','despeses','activitat realitzada'],
   surt:'Memòria d\'activitat i taula de despesa, en el format que demani la plantilla.'},
  {id:'inventari',nom:'Inventari',ic:'📦',maquina:true,
   que:'Què hi ha, de qui és, en quin estat i on para.',
   cal:['objectes','estat','ubicació'],
   surt:'Taula amb valor estimat, desgast acumulat i qui n\'és responsable.'},
  {id:'convocatoria',nom:'Convocatòria',ic:'📣',maquina:true,
   que:'Cridar la gent a una cosa concreta, amb tot el que cal saber per venir.',
   cal:['què','quan','on','qui hi ha d\'anar'],
   surt:'Text curt per als canals, amb data, lloc, ordre del dia i com confirmar.'},
  {id:'comanda',nom:'Comanda o repartiment',ic:'🛒',maquina:true,
   que:'Qui ha demanat què, quant costa i com es reparteix.',
   cal:['peticions','preus','punt de repartiment'],
   surt:'Full de comanda per llar, total per proveïdor i full de repartiment.'},
  {id:'fitxa',nom:'Fitxa pública',ic:'🪪',maquina:true,
   que:'Com s\'explica a fora el que fa un node o una dinàmica.',
   cal:['què ofereix','a qui','com s\'hi arriba'],
   surt:'Fitxa breu per al directori, sense cap dada personal.'},
  /* Els de negoci (veda 163): sense eina a l'app encara; al kit, /tasca. */
  {id:'pressupost',nom:'Pressupost',ic:'🧮',maquina:true,
   que:'Què es lliurarà i en quina quantitat, perquè qui el rep ho valori abans de dir que sí.',
   cal:['què demana qui el rep','conceptes i quantitats','tarifa publicada, si n\'hi ha'],
   surt:'Línies amb concepte, quantitat, unitat i preu de la tarifa publicada o [a completar], què no hi entra i fins quan val. Sense total: la màquina no suma.'},
  {id:'proposta',nom:'Proposta',ic:'📝',maquina:true,
   que:'El que s\'ofereix a qui ho ha de decidir: per a què, com, per quins rols i en quins terminis.',
   cal:['què necessita qui la rep','què s\'ofereix','fases i terminis'],
   surt:'Necessitat, el que s\'ofereix, fases amb terminis, quin rol fa què i què queda fora. Sense imports: van al pressupost.'},
  {id:'resposta',nom:'Resposta a una consulta',ic:'💬',maquina:true,
   que:'La resposta escrita a una pregunta concreta, feta amb el que la casa ja té dit.',
   cal:['la consulta, sense dades de qui la fa','el que ja consta (web, fitxa, condicions)'],
   surt:'Text curt que respon punt per punt, marca amb [a completar] el que no se sap i diu com seguir. No promet res que no consti.'},
  /* Els que no poden sortir d'una màquina, i el motiu escrit. Sense aquestes
     entrades, la taxonomia semblaria dir que tot és automatitzable i que els
     que falten és que encara no els hem fet. */
  {id:'acord',nom:'Acord o decisió',ic:'⚖️',maquina:false,
   que:'El que un grup ha decidit i per què. No és el document: és la decisió.',
   cal:['debat','vots','qui ho sosté'],
   surt:'No surt d\'una màquina. El redacta qui ha estat a la sala; la màquina, com a molt, en pren acta després.'},
  /* Els diners (veda 163): redactar-los seria fer veure que s'ha cobrat. */
  {id:'cobrament',nom:'Factura o cobrament',ic:'💶',maquina:false,
   que:'Diners que es cobren o es paguen, i el document que en dona fe. No és el que es demana: és el que es cobra.',
   cal:['import','document fiscal','qui ho cobra'],
   surt:'No surt d\'una màquina. La factura la numera el programa de facturació o qui porta els comptes, i un cobrament només el dona per fet qui el rep.'}
];
const entregableMeta=id=>ENTREGABLES.find(e=>e.id===id)||null;

/* Quin entregable demana un flux, deduït de com està escrit. Mateix patró que
   `RETURN_HINTS`: no s'inventa res, es proposa i es pot corregir a mà posant
   `entregable` a l'intercanvi. Un flux sense tipus reconegut **no és
   automatitzable**, i és la resposta correcta: vol dir que encara no sabem què
   s'ha de produir.

   Guanya la primera. Les de negoci, estretes i amb PISTA_MAI (veda 163). Res
   de lookbehind: Safari <16.4 no el compila. */
const PISTA_MAI='factur|pagament|cobrament|\\bpag(o|os)\\b|\\bcobros?\\b|rebut|recibo|acord|acuerdo|decisi|decidi|vot|aprova|aprob|accept|acept|signa|firma|resoluci|reclamaci|queix|queja|demanda|den[uú]nci|recurs|requeri|legaci|sanci|multa|inspecci|jur[ií]dic|legal|advoca|abogad|laboral|assetja|acoso|p[uú]blic|ciutad|ciudad|municip|ajuntament|ayuntamiento|govern|gobierno|diputaci|generalitat|ministeri|hisenda|hacienda|tribut|fiscal|participati|m[eèé]dic|metge|pacient|salu[td]|sanit|cl[ií]nic|diagn|terap|tractament|tratamiento|psic|veterin';
const pistaNegoci=(cap,mes)=>new RegExp('^((el|la|els|les|un|una|uns|unes|los|las|nou|nova|nous|noves|nuevo|nueva|nuevos|nuevas) )*'+cap+'(?!.*('+PISTA_MAI+(mes?'|'+mes:'')+'))','i');
const ENTREGABLE_HINTS=[
  [/^((el|la|els|les|un|una|uns|unes|los|las) |l')*(factur|pagament|cobrament|pagos?\b|cobros?\b)/i,'cobrament'],
  [/\bacta|reuni|assemblea/i,'acta'],
  [/informe|memòria|memoria|indicador|seguiment|retiment/i,'informe'],
  [/justific|subvenc|convocatòria de subvenc|fons/i,'justificacio'],
  [pistaNegoci('(pressupost|presupuest)(?!o?s? [iy] )(os?)?','compte|cuenta|propi|partida|anual|general|despes|gastos|ingress|ingreso|tresorer|tesorer|\\bestat\\b|\\bestado\\b|consell|consejo'),'pressupost'],
  [pistaNegoci('(respost(a|es)|respuestas?) (al|als|a l\'|a) ?((la|les|una|unes|un|uns|el|los|las) )?(consult|pregunt|dubt|dud|client|interessa|interesa)'),'resposta'],
  [/inventari|estoc|material|objecte|\beina|préstec|prestec/i,'inventari'],
  [/convoc|difusió|difusio|crida|comunicat|butlletí|butlleti/i,'convocatoria'],
  [/comanda|comandes|compra|cistell|repartiment|liquidació|liquidacio/i,'comanda'],
  [/factur|pagament|cobrament|\bpagos?\b|\bcobros?\b/i,'cobrament'],
  [/fitxa|directori|alta pública|alta publica|publicació|publicacio/i,'fitxa'],
  [/acord|acuerdo|decisió|decisio|vot|aprovació|aprovacio|aprobaci|resoluci/i,'acord'],
  [pistaNegoci('(propost(a|es)|propuestas?)','econ|de valor|preu|precio|tarif|honorari|salari|\\bsou\\b|sueldo|retribuci|quota|cuota|pressupost|presupuest|licitaci'),'proposta']
];
const entregableDe=x=>{
  if(x&&x.entregable&&entregableMeta(x.entregable))return x.entregable;
  const h=ENTREGABLE_HINTS.find(e=>e[0].test((x&&x.label)||''));
  return h?h[1]:null;
};

/* Qui ha de fer una carta: la màquina o una persona.
   L'ordre de les comprovacions **és la regla**, i per això l'intangible va
   primer: cap etiqueta, cap tipus i cap configuració el pot convertir en
   candidat. Si algun dia aquesta condició es mou de lloc, el que es trencarà
   no és una funció — és la promesa de la casa. */
function fluxAutomatitzable(x){
  if(!x)return{pot:false,motiu:'sense flux'};
  /* Doble pany, i els dos abans de mirar cap tipus. El primer és la regla: un
     intangible no s'automatitza mai. El segon és el que la fa sòlida: no n'hi
     ha prou de descartar el que sabem que és intangible, cal **exigir que sigui
     explícitament tangible**. Una mena desconeguda o mal escrita cau del costat
     segur, que és el de la persona, i ho diu amb el seu nom en comptes de
     fer-la passar per intangible. */
  if(isIntangible(x.kind))return{pot:false,motiu:'intangible',tipus:null};
  if(!menaExplicita(x.kind))return{pot:false,motiu:'mena desconeguda',tipus:null};
  const t=entregableDe(x);
  if(!t)return{pot:false,motiu:'sense entregable declarat',tipus:null};
  const m=entregableMeta(t);
  if(!m.maquina)return{pot:false,motiu:'el tipus no surt d\'una màquina',tipus:t};
  return{pot:true,motiu:'',tipus:t};
}
/*/VS-TASQUES*/
/*VS-REG*/
/* ── El registre viu: el mapa real surt de l'ús ─────────────────────────────
 * Fase 2 del pla (el detall és al repositori privat d'estratègia): cada
 * lliurament que passa d'un rol a un altre s'anota, i el mapa real es
 * recalcula des d'aquí, no des de la memòria del taller.
 *
 *  · **On s'anota:** al formulari `registre.html` de la web del client
 *    (Netlify Forms). Arriba per correu i Netlify en dona el CSV. Res de
 *    servidor ni de base de dades: el correu i la web són la base de dades.
 *  · **Què es guarda:** de quin rol a quin, quin lliurament, tangible o
 *    intangible, la data, l'evidència (un enllaç) i el valor percebut per qui
 *    el rep, de 1 a 5. **Només aquests camps:** qualsevol altra columna del
 *    CSV (noms, correus, IP) es descarta en llegir-lo.
 *  · **Què en surt:** el mapa observat (amb el dibuixat com a ideal, perquè
 *    l'editor ensenyi la desviació), una lectura en Markdown i els avisos que
 *    la fase 3 enviarà per webhook, amb els noms del pla. */
const REG_CAMPS = { data: ['data', 'fecha', 'date', 'created_at'], de: ['de', 'from'], a: ['a', 'to', 'para', 'per_a'],
  q: ['entregable', 'lliurament', 'q'], mena: ['mena', 'tipus', 'tipo'], valor: ['valor', 'value'], evidencia: ['evidencia', 'evidència', 'evidence'] };
function llegeixRegistre(text) {
  const t = String(text || '').replace(/^﻿/, '').trim();
  let files = [];
  if (/^\[/.test(t)) { try { files = JSON.parse(t); } catch (e) { files = []; } }
  else if (t) {
    /* CSV com el que exporta Netlify: capçalera, comes i cometes dobles. */
    const reg = [], fila = [];
    let camp = '', dins = false;
    for (let i = 0; i <= t.length; i++) {
      const c = t[i];
      if (dins) { if (c === '"' && t[i + 1] === '"') { camp += '"'; i++; } else if (c === '"') dins = false; else camp += c; continue; }
      if (c === '"') dins = true;
      else if (c === ',' ) { fila.push(camp); camp = ''; }
      else if (c === '\n' || c === '\r' || c === undefined) { if (c === '\r' && t[i + 1] === '\n') i++; fila.push(camp); camp = ''; reg.push(fila.splice(0)); }
      else camp += c;
    }
    const cap = (reg.shift() || []).map(x => x.trim().toLowerCase());
    files = reg.filter(r => r.some(x => x.trim())).map(r => { const o = {}; cap.forEach((k, i) => { o[k] = r[i]; }); return o; });
  }
  const pren = (o, k) => { const n = REG_CAMPS[k].find(x => o[x] != null && String(o[x]).trim() !== ''); return n ? String(o[n]).trim() : ''; };
  const bones = [];
  let ignorades = 0;
  (Array.isArray(files) ? files : []).forEach(o => {
    if (!o || typeof o !== 'object') { ignorades++; return; }
    const x = { data: pren(o, 'data').slice(0, 10), de: pren(o, 'de'), a: pren(o, 'a'), q: pren(o, 'q') };
    if (!x.de || !x.a || !x.q || x.de === x.a) { ignorades++; return; }
    x.mena = /^i/i.test(pren(o, 'mena')) ? 'intangible' : 'tangible';
    const v = parseInt(pren(o, 'valor'), 10); x.valor = v >= 1 && v <= 5 ? v : null;
    const ev = pren(o, 'evidencia'); x.evidencia = /^https?:\/\/\S+$/.test(ev) ? ev : '';
    bones.push(x);
  });
  return { files: bones, ignorades };
}
const REG_TXT = {
  ca: { titol: 'El registre, llegit', de: 'transaccions', del: 'del', al: 'al', font: 'Surt del registre; es regenera cada cop.', vius: 'Fluxos vius',
    cap: '| Lliurament | De → A | Vegades | Valor percebut | Darrera |', morts: 'Fluxos del mapa que no han passat', nous: 'El que passa i no és al mapa',
    nousD: 'Proposta: afegir-ho al mapa, si una persona ho accepta.', rols: 'Rols', noRep: 'dona i no rep res registrat.', rolNou: 'no és al mapa.', cap0: 'Encara no hi ha cap transacció registrada.',
    trobNou: 'Hi ha intercanvis que no són al mapa', trobMort: 'Hi ha fluxos del mapa que no passen', trobRec: 'dona i no rep' },
  es: { titol: 'El registro, leído', de: 'transacciones', del: 'del', al: 'al', font: 'Sale del registro; se regenera cada vez.', vius: 'Flujos vivos',
    cap: '| Entregable | De → A | Veces | Valor percibido | Última |', morts: 'Flujos del mapa que no han pasado', nous: 'Lo que pasa y no está en el mapa',
    nousD: 'Propuesta: añadirlo al mapa, si una persona lo acepta.', rols: 'Roles', noRep: 'da y no recibe nada registrado.', rolNou: 'no está en el mapa.', cap0: 'Todavía no hay ninguna transacción registrada.',
    trobNou: 'Hay intercambios que no están en el mapa', trobMort: 'Hay flujos del mapa que no pasan', trobRec: 'da y no recibe' }
};
const regNorm = s => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
function observaRegistre(mapa, files, opts) {
  const o = opts || {}, T = REG_TXT[o.llengua] || REG_TXT.ca, n = regNorm;
  const roles = (mapa.roles || []).slice(), perNom = {}; roles.forEach(r => { perNom[n(r)] = r; });
  const fl = [];
  (mapa.pairs || []).forEach(p => {
    if (p[0] && p[1] && p[3]) fl.push({ de: p[0], a: p[1], mena: p[2] || 'tangible', q: p[3], tx: [] });
    if (p[0] && p[1] && p[5]) fl.push({ de: p[1], a: p[0], mena: p[4] || 'tangible', q: p[5], tx: [] });
  });
  const nous = {}, rolsNous = [];
  const rol = x => { const k = n(x); if (!perNom[k]) { perNom[k] = x; rolsNous.push(x); } return perNom[k]; };
  files.forEach(t => {
    const de = rol(t.de), a = rol(t.a);
    const mateix = fl.filter(f => f.de === de && f.a === a);
    const f = mateix.find(x => n(x.q) === n(t.q));
    if (f) f.tx.push(t);
    else { const k = de + '→' + a + '→' + n(t.q); (nous[k] = nous[k] || { de, a, q: t.q, mena: t.mena, tx: [] }).tx.push(t); }
  });
  const stat = tx => { const v = tx.filter(t => t.valor).map(t => t.valor); const d = tx.map(t => t.data).filter(Boolean).sort();
    return { vegades: tx.length, valor: v.length ? Math.round(v.reduce((s, x) => s + x, 0) / v.length * 10) / 10 : null, darrera: d[d.length - 1] || '' }; };
  const vius = fl.filter(f => f.tx.length).map(f => Object.assign({ de: f.de, a: f.a, q: f.q, mena: f.mena }, stat(f.tx)));
  const morts = fl.filter(f => !f.tx.length).map(f => ({ de: f.de, a: f.a, q: f.q, mena: f.mena }));
  const nousL = Object.values(nous).map(x => Object.assign({ de: x.de, a: x.a, q: x.q, mena: x.mena }, stat(x.tx))).sort((x, y) => y.vegades - x.vegades);
  const obs = vius.concat(nousL);
  const totsRols = roles.concat(rolsNous);
  const senseRec = totsRols.filter(r => obs.some(f => f.de === r) && !obs.some(f => f.a === r));
  /* El mapa observat, en el format de l'editor: per a cada parell i sentit, el
     lliurament més freqüent. El dibuixat hi va d'ideal. */
  const parells = {};
  obs.slice().sort((x, y) => y.vegades - x.vegades).forEach(f => {
    const [A, B] = totsRols.indexOf(f.de) <= totsRols.indexOf(f.a) ? [f.de, f.a] : [f.a, f.de];
    const p = parells[A + '→' + B] = parells[A + '→' + B] || [A, B, '', '', '', ''];
    if (f.de === A && !p[3]) { p[2] = f.mena; p[3] = f.q; } else if (f.de === B && !p[5]) { p[4] = f.mena; p[5] = f.q; }
  });
  const pairs = Object.values(parells);
  const seq = {}; Object.keys(mapa.seq || {}).forEach(k => { const [de, a] = k.split('→'); if (obs.some(f => f.de === de && f.a === a)) seq[k] = mapa.seq[k]; });
  const troballes = [];
  if (nousL.length) troballes.push({ t: T.trobNou, d: nousL.map(f => f.q + ' (' + f.de + ' → ' + f.a + ')').join('; ') });
  if (morts.length) troballes.push({ t: T.trobMort, d: morts.map(f => f.q + ' (' + f.de + ' → ' + f.a + ')').join('; ') });
  senseRec.forEach(r => troballes.push({ t: r + ' ' + T.trobRec, d: '' }));
  const ideal = Object.assign({}, mapa); delete ideal.ideal;
  const usats = totsRols.filter(r => pairs.some(p => p[0] === r || p[1] === r));
  const mapaObservat = { abast: mapa.abast || '', roles: usats, pairs, processos: (mapa.processos || []).slice(), seq, troballes, ideal };
  const avisos = senseRec.map(r => ({ tipus: 'rol.sin_reciprocidad', rol: r }))
    .concat(morts.map(f => ({ tipus: 'desviacion.detectada', motiu: 'flux-sense-us', de: f.de, a: f.a, q: f.q })),
      nousL.map(f => ({ tipus: 'desviacion.detectada', motiu: 'flux-nou', de: f.de, a: f.a, q: f.q })));
  const dates = files.map(t => t.data).filter(Boolean).sort();
  const md = ['# ' + T.titol, ''];
  if (!files.length) md.push(T.cap0);
  else {
    md.push('> ' + files.length + ' ' + T.de + (dates.length ? ' ' + T.del + ' ' + dates[0] + ' ' + T.al + ' ' + dates[dates.length - 1] : '') + '. ' + T.font);
    const cel = s => String(s).replace(/\|/g, '\\|');
    if (vius.length) md.push('', '## ' + T.vius, '', T.cap, '| --- | --- | ---: | ---: | --- |',
      ...vius.sort((x, y) => y.vegades - x.vegades).map(f => '| ' + cel(f.q) + ' | ' + cel(f.de + ' → ' + f.a) + ' | ' + f.vegades + ' | ' + (f.valor == null ? '—' : f.valor) + ' | ' + (f.darrera || '—') + ' |'));
    if (morts.length) md.push('', '## ' + T.morts, '', ...morts.map(f => '- **' + f.q + '** · ' + f.de + ' → ' + f.a));
    if (nousL.length) md.push('', '## ' + T.nous, '', T.nousD, '', ...nousL.map(f => '- **' + f.q + '** · ' + f.de + ' → ' + f.a + ' · ' + f.vegades));
    if (senseRec.length || rolsNous.length) md.push('', '## ' + T.rols, '', ...senseRec.map(r => '- **' + r + '** ' + T.noRep), ...rolsNous.map(r => '- **' + r + '** ' + T.rolNou));
  }
  return { vius, morts, nous: nousL, rolsNous, senseReciprocitat: senseRec, mapaObservat, avisos, informe: md.join('\n') + '\n' };
}
/*/VS-REG*/
/*VS-API*/
/* ── L'API i els avisos: fase 3 del pla ─────────────────────────────────────
 * La web ja és l'API de lectura: `web.json` i el JSON-LD de cada pàgina. Per
 * escriure, el formulari del registre (un POST de Netlify Forms). Aquí hi ha
 * el que hi falta: **els avisos**, que la web envia a qui els vulgui escoltar
 * (un CRM, un Slack, un agent) amb els noms que fixa el pla.
 *
 *  · Cada avís és un POST JSON (`tt-avis-1`) signat amb HMAC-SHA256 a la
 *    capçalera `X-TT-Signatura`. Qui el rep el comprova amb el mateix secret.
 *  · Les adreces i el secret van a les variables d'entorn de Netlify
 *    (`TT_WEBHOOKS`, `TT_WEBHOOK_SECRET`), mai al repositori. Sense secret no
 *    s'envia res, i només a adreces https.
 *  · Les dades són les del registre: rols, lliurament, tipus, data, evidència
 *    i valor. Cap dada personal.
 *
 * Aquest bloc no corre a l'editor: és el codi que el zip posa a
 * `eines/nucli.mjs`, i que fan servir les funcions de Netlify, l'eina del
 * registre i el servidor MCP. Fa servir `fetch` i Web Crypto, que són igual al
 * navegador i a Node; les proves els injecten. */
const TT_AVISOS = ['transaccion.creada', 'rol.sin_reciprocidad', 'desviacion.detectada', 'cerebro.actualizado'];
function fluxosDelMapa(mapa) {
  const fl = [];
  ((mapa || {}).pairs || []).forEach(p => {
    if (p[0] && p[1] && p[3]) fl.push({ de: p[0], a: p[1], q: p[3] });
    if (p[0] && p[1] && p[5]) fl.push({ de: p[1], a: p[0], q: p[5] });
  });
  return fl;
}
/* Una anotació del formulari `registre`, tal com la passa Netlify a la
   funció `submission-created`: només en surten els camps del registre. */
function avisosDelFormulari(payload, fluxos) {
  if (!payload || payload.form_name !== 'registre') return [];
  const d = Object.assign({}, payload.data || {});
  if (!d.data && payload.created_at) d.data = payload.created_at;
  const t = llegeixRegistre(JSON.stringify([d])).files[0];
  if (!t) return [];
  const av = [{ tipus: 'transaccion.creada', dades: t }];
  if (!(fluxos || []).some(f => regNorm(f.de) === regNorm(t.de) && regNorm(f.a) === regNorm(t.a) && regNorm(f.q) === regNorm(t.q)))
    av.push({ tipus: 'desviacion.detectada', dades: { motiu: 'flux-nou', de: t.de, a: t.a, q: t.q } });
  return av;
}
async function signaAvis(cos, secret, subtle) {
  const s = subtle || globalThis.crypto.subtle, te = new TextEncoder();
  const k = await s.importKey('raw', te.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return 'sha256=' + [...new Uint8Array(await s.sign('HMAC', k, te.encode(cos)))].map(x => x.toString(16).padStart(2, '0')).join('');
}
async function verificaAvis(cos, signatura, secret, subtle) {
  const s = await signaAvis(cos, secret, subtle), t = String(signatura || '');
  let d = s.length ^ t.length;
  for (let i = 0; i < s.length; i++) d |= s.charCodeAt(i) ^ t.charCodeAt(i);
  return d === 0;
}
async function enviaAvisos(avisos, opts) {
  const o = opts || {};
  const urls = (Array.isArray(o.urls) ? o.urls : String(o.urls || '').split(/[\s,]+/)).filter(u => /^https:\/\/\S+$/.test(u));
  if (!urls.length) return { enviats: 0, motiu: 'sense-adreces', errors: [] };
  if (String(o.secret || '').length < 16) return { enviats: 0, motiu: 'sense-secret', errors: [] };
  const f = o.fetch || globalThis.fetch, errors = [];
  let enviats = 0;
  for (const a of avisos || []) {
    if (!TT_AVISOS.includes(a.tipus)) continue;
    const dades = a.dades || Object.keys(a).filter(k => k !== 'tipus').reduce((x, k) => Object.assign(x, { [k]: a[k] }), {});
    const cos = JSON.stringify({ formato: 'tt-avis-1', tipus: a.tipus, web: o.web || '', creat: o.ara || new Date().toISOString(), dades });
    const signatura = await signaAvis(cos, o.secret, o.subtle);
    for (const u of urls) {
      try {
        const r = await f(u, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-TT-Avis': a.tipus, 'X-TT-Signatura': signatura }, body: cos });
        if (r && r.ok) enviats++; else errors.push(u + ' → ' + (r ? r.status : '?'));
      } catch (e) { errors.push(u + ' → ' + e.message); }
    }
  }
  return { enviats, motiu: '', errors };
}
/*/VS-API*/
/*VS-MCP*/
/* ── El cervell, per a Claude Code: un servidor MCP sense dependències ──────
 * El zip el posa a `eines/mcp.mjs`, i `.mcp.json` el declara: qui obre el
 * repositori del client amb Claude Code té el cervell a mà, amb tres eines.
 * Només llegeix, i només el que surt a l'índex (`cerebro/indice.json`). Aquí
 * hi ha la part que respon; la que llegeix fitxers i parla per stdin/stdout
 * és al fitxer generat, perquè les proves la puguin cridar sense disc. */
function creaMcp(opts) {
  const o = opts || {}, llegeix = o.llegeix || (() => null);
  const eines = [
    { name: 'cervell_index', description: 'Els documents del cervell del projecte: ruta, títol, tema (web, mapa, rols, lliuraments, processos, decisions, regles, eines) i capa (publica, enllac, equip).',
      inputSchema: { type: 'object', properties: { tema: { type: 'string', description: 'Només els d\'aquest tema' } } } },
    { name: 'cervell_llegeix', description: 'Llegeix un document del cervell per la seva ruta. Només els que surten a l\'índex.',
      inputSchema: { type: 'object', properties: { ruta: { type: 'string' } }, required: ['ruta'] } },
    { name: 'registre_informe', description: 'Llegeix el registre viu (cerebro/registro/registre.csv) i el compara amb el mapa real: fluxos vius, sense ús, nous, qui dona sense rebre i els avisos.',
      inputSchema: { type: 'object', properties: { llengua: { type: 'string', enum: ['ca', 'es'] } } } }
  ];
  const text = (s, error) => Object.assign({ content: [{ type: 'text', text: s }] }, error ? { isError: true } : {});
  const index = () => { const t = llegeix('cerebro/indice.json'); return t ? JSON.parse(t) : { entradas: [] }; };
  const crida = (nom, a) => {
    if (nom === 'cervell_index') return text(JSON.stringify(index().entradas.filter(x => !a.tema || x.tema === a.tema), null, 2));
    if (nom === 'cervell_llegeix') {
      const e = index().entradas.find(x => x.ruta === a.ruta), t = e ? llegeix(e.ruta) : null;
      return t == null ? text('No és a l\'índex del cervell: ' + a.ruta, true) : text(t);
    }
    if (nom === 'registre_informe') {
      const m = llegeix('cerebro/mapa-real.json');
      if (!m) return text('Falta cerebro/mapa-real.json', true);
      const r = observaRegistre(JSON.parse(m), llegeixRegistre(llegeix('cerebro/registro/registre.csv') || '').files, { llengua: a.llengua });
      return text(r.informe + '\n```json\n' + JSON.stringify(r.avisos, null, 2) + '\n```\n');
    }
    return null;
  };
  return function respon(msg) {
    if (!msg || msg.jsonrpc !== '2.0' || msg.id === undefined || msg.id === null) return null;
    const ok = result => ({ jsonrpc: '2.0', id: msg.id, result }), err = (code, message) => ({ jsonrpc: '2.0', id: msg.id, error: { code, message } });
    const p = msg.params || {};
    if (msg.method === 'initialize') return ok({ protocolVersion: p.protocolVersion || '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'cervell', version: '1.0.0' },
      instructions: 'El cervell del projecte surt del mapa de valor. Comença per cervell_index; el mapa és la font i no s\'edita a mà.' });
    if (msg.method === 'ping') return ok({});
    if (msg.method === 'tools/list') return ok({ tools: eines });
    if (msg.method === 'tools/call') {
      try { const r = crida(p.name, p.arguments || {}); return r ? ok(r) : err(-32602, 'Eina desconeguda: ' + p.name); }
      catch (e) { return ok(text('Error: ' + e.message, true)); }
    }
    return err(-32601, 'Mètode desconegut: ' + msg.method);
  };
}
/*/VS-MCP*/
/*VS-IMPORTA*/
/* ── Importar el que el client ja té ───────────────────────────────────────
 * La web d'ara, documents i CSV, en text a `cerebro/fonts/` (el generador no
 * hi toca), perquè la IA n'escrigui el dossier i els continguts citant la font.
 *  · **Només text.** Un fitxer per font, amb una capçalera que diu d'on surt i
 *    quan. PDF i Word no es llegeixen aquí: es llisten per a la IA.
 *  · **Cap dada personal.** Correus, telèfons, IBAN i DNI s'amaguen, i les
 *    columnes de persona d'un CSV no hi entren: el repositori pot ser públic.
 *  · **Educat amb la web d'origen.** robots.txt, una petició cada cop amb pausa.
 *  · **Sense DOM ni imports**: el `fetch` i la pausa els posa qui crida. */
/* Noms de columna de persona, sense accents ni signes. «Nom del producte» no
   és ningú: nom/name/nombre, i client, contacte, soci…, només compten sols o
   amb un qualificatiu de persona («nom complet», «nom del client»); cognom o
   first/last name, sempre. Una columna plena de correus o telèfons cau igual. */
const IMP_PERSONAL = [
  /\b(e ?mail|correu|correo|mail)\b/, /\b(telefons?|telefonos?|phone|mobil|movil|tel|celular|whatsapp)\b/,
  /^(nom|name|nombre)( (complet|completo|i cognoms?|y apellidos?|de pila))?( (de |del |de la )?(client|cliente|contacte|contacto|persona|usuari|usuario|alumne|alumno|soci|socio|responsable))?$/,
  /^(client|cliente|customer|contacte|contacto|contact|persona|usuari|usuario|user|alumne|alumno|soci|socio|autor|author)$/,
  /\b(cognoms?|apellidos?|surname|(first|last|full|given|family|contact|customer|user) ?name)\b/, /\b(dni|nif|nie|passaport|pasaporte|passport)\b/,
  /\b(adreca|direccion|address|domicili|domicilio)\b/, /\b(iban|compte|cuenta bancaria|numero de cuenta|bank account)\b/,
  /\b(naixement|nacimiento|birth|birthday|birthdate|aniversari|cumpleanos)\b/, /\bip\b/
];
const impNorm = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const columnaPersonal = nom => IMP_PERSONAL.some(re => re.test(impNorm(nom)));
/* Correus i IBAN primer, que porten xifres que semblarien telèfons. Un telèfon
   són 9 xifres que comencen per 6-9, en grups 3-3-3, 3-2-2-2 o 2-3-2-2, o de 9
   a 15 amb prefix (+34, 0034): així no hi cauen anys, preus ni codis postals. */
function amagaPersonal(text) {
  const r = { text: String(text == null ? '' : text), correus: 0, telefons: 0, altres: 0 };
  const posa = (re, k, per, bo) => { r.text = r.text.replace(re, m => { if (bo && !bo(m.replace(/\D/g, ''))) return m; r[k]++; return per; }); };
  posa(/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, 'correus', '[correu]');
  posa(/\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){3,7}(?: ?[A-Z0-9]{1,3})?\b/g, 'altres', '[dada personal]');
  posa(/\b(?:[XYZ][ -]?\d{7}|\d{8})[ -]?[TRWAGMYFPDXBNJZSQVHLCKE]\b/g, 'altres', '[dada personal]');
  posa(/\(?(?:\+|\b00)\d{1,3}\)?(?:[ .-]?\(?\d+\)?){1,6}/g, 'telefons', '[telèfon]', d => { const n = d.replace(/^00/, '').length; return n >= 9 && n <= 15; });
  posa(/\b[6789]\d(?:\d(?:[ .-]?\d{3}){2}|\d(?:[ .-]?\d{2}){3}|[ .-]?\d{3}(?:[ .-]?\d{2}){2})\b/g, 'telefons', '[telèfon]', d => !/0{6}$/.test(d));
  return r;
}
/* Les vocals amb accent (&eacute; &Agrave; &iuml;…) es componen, no s'escriuen una a una. */
const IMP_ENT = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'', laquo: '«', raquo: '»', middot: '·', hellip: '…', mdash: '—', ndash: '–', lsquo: '‘',
  rsquo: '’', ldquo: '“', rdquo: '”', euro: '€', copy: '©', reg: '®', deg: '°', iexcl: '¡', iquest: '¿', bull: '•', ordf: 'ª', ordm: 'º', shy: '', ccedil: 'ç', Ccedil: 'Ç',
  ntilde: 'ñ', Ntilde: 'Ñ', ...Object.fromEntries([].concat(...'aeiouAEIOU'.split('').map(v => ['acute\u0301', 'grave\u0300', 'uml\u0308', 'circ\u0302']
    .map(x => [v + x.slice(0, -1), (v + x.slice(-1)).normalize('NFC')])))) };
const impEnt = s => String(s == null ? '' : s).replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (m, e) => { const n = e[0] !== '#' ? -1 : /x/i.test(e[1]) ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
  return n < 0 ? (Object.prototype.hasOwnProperty.call(IMP_ENT, e) ? IMP_ENT[e] : m) : n > 0 && n < 0x110000 && !(n >= 0xd800 && n < 0xe000) ? String.fromCodePoint(n) : ''; });
const impUrl = (h, base) => { try { const u = new URL(String(h).trim(), base || undefined); return /^(https?|mailto):$/.test(u.protocol) ? u : null; } catch (e) { return null; } };
const impWeb = u => !!u && /^https?:$/.test(u.protocol), impHost = u => u.hostname.replace(/^www\./, '');   // amb www o sense, és el mateix lloc
const IMP_DOC = /\.(pdf|docx?|xlsx?|odt|ods|odp|pptx?|rtf)$/i, IMP_ACTIU = /\.(jpe?g|png|gif|svg|webp|avif|ico|bmp|zip|rar|gz|mp3|mp4|m4a|mov|webm|ogg|wav|css|m?js|json|xml|rss|woff2?|ttf|eot)$/i;
const impAttr = (a, nom) => { const m = new RegExp('(?:^|\\s)' + nom + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i').exec(a || '');
  return m ? impEnt(m[1] != null ? m[1] : m[2] != null ? m[2] : m[3]) : null; };
/* webSlug és de VS-WEB, que no va a eines/nucli.mjs: allà es fa el mateix aquí. */
const impSlug = s => (typeof webSlug === 'function' ? webSlug(s) : impNorm(s).replace(/ /g, '-') || 'pagina');
/* Treu elements sencers de dins cap a fora (un <header> dins d'un altre no deixa anar text); `deixa(dins)` en salva un tros. */
function impTreu(html, tags, deixa) {
  for (let t = null, re = new RegExp('<(' + tags + ')\\b[^>]*>((?:(?!<\\1\\b)[\\s\\S])*?)</\\1\\s*>', 'gi'); t !== html;) { t = html; html = html.replace(re, (x, tag, d) => (deixa ? deixa(d) : '')); }
  return html;
}
const IMP_BLOC = /^(p|div|section|article|main|aside|blockquote|figure|figcaption|address|form|fieldset|dl|dt|dd|hr|pre|center|details|summary)$/;
/* L'HTML ja net, a Markdown, amb una màquina d'estats petita: dins d'un títol,
   d'un element de llista o d'una cel·la tot va en una línia. */
function impMd(html, base, imatges) {
  const out = [], enl = [], taules = [], re = /<(\/?)([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>|([^<]+)|</g;
  let ll = 0, li = 0, tit = 0, fila = null, cel = -1, m;
  const linia = () => tit || li || cel >= 0;
  const tancaCel = () => { if (cel >= 0) { fila.push(out.splice(cel).join('').replace(/\s+/g, ' ').trim().replace(/\|/g, '\\|')); cel = -1; } };
  const fiFila = () => { tancaCel(); if (fila && fila.length) { out.push('\n| ' + fila.join(' | ') + ' |'); if (taules.length && taules[taules.length - 1]++ === 0) out.push('\n|' + ' --- |'.repeat(fila.length)); } fila = null; };
  while ((m = re.exec(html))) {
    if (m[2] == null) { out.push((m[4] != null ? impEnt(m[4]) : '<').replace(/\s+/g, ' ')); continue; }
    const tanca = m[1] === '/', tag = m[2].toLowerCase(), at = m[3];
    if (/^h[1-6]$/.test(tag)) { out.push(tanca ? '\n\n' : '\n\n' + '#'.repeat(+tag[1]) + ' '); tit = tanca ? 0 : 1; }
    else if (tag === 'br') out.push(linia() ? ' ' : '\n');
    else if (tag === 'ul' || tag === 'ol') { ll = Math.max(0, ll + (tanca ? -1 : 1)); li = Math.min(li, ll); out.push('\n'); }
    else if (tag === 'li') { li = tanca ? Math.max(0, ll - 1) : Math.max(ll, 1); if (!tanca) out.push('\n' + '  '.repeat(Math.max(0, ll - 1)) + '- '); }
    else if (tag === 'a' && !tanca) { const h = impAttr(at, 'href'); enl.push({ u: h && h.trim()[0] !== '#' ? impUrl(h, base) : null, i: out.length }); }
    else if (tag === 'a' && enl.length) {
      /* Una targeta enllaçada (títol i text) no cap en [text](url): queda el bloc i l'adreça al darrere. */
      const e = enl.pop(), cru = out.splice(e.i).join(''), t = cru.replace(/\s+/g, ' ').trim(), h = e.u ? e.u.href.replace(/\)/g, '%29') : '';
      out.push(!t || !h ? cru : /\n/.test(cru) ? cru + '\n\n<' + h + '>\n\n' : '[' + t.replace(/[[\]]/g, '\\$&') + '](' + h + ')');
    }
    else if (tag === 'img') { const u = impUrl(impAttr(at, 'data-src') || impAttr(at, 'src') || '', base);
      if (impWeb(u) && !imatges.some(x => x.src === u.href)) imatges.push({ src: u.href, alt: (impAttr(at, 'alt') || '').replace(/\s+/g, ' ').trim() }); }
    else if (tag === 'table') { fiFila(); if (tanca) taules.pop(); else taules.push(0); out.push('\n\n'); }
    else if (tag === 'tr') { fiFila(); if (!tanca) fila = []; }
    else if (tag === 'td' || tag === 'th') { tancaCel(); if (!tanca) { fila = fila || []; cel = out.length; } }
    else if (IMP_BLOC.test(tag)) out.push(linia() ? ' ' : '\n\n');
  }
  fiFila();
  /* El sagnat de les llistes niades va abans del guió: es conserva a cada línia. */
  return out.join('').split('\n').map(l => (/^(?: {2})+(?=- )/.exec(l) || [''])[0] + l.replace(/[ \t\u00a0]+/g, ' ').trim())
    .filter(l => !/^(#{1,6}|-)$/.test(l.trim())).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
/* Els enllaços es cullen de tota la pàgina (el menú és on n'hi ha més); el text,
   sense menú ni capçalera, però amb l'h1 del <header> (el d'un article sol ser-hi)
   i el peu al final: hi solen ser l'adreça i l'horari (el personal s'amaga després). */
function htmlAText(html, base) {
  const s = String(html == null ? '' : html).replace(/<!-{2}[\s\S]*?-{2}>/g, '').replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '').replace(/<[!?][^>]*>/g, '');
  const pren = re => { const m = re.exec(s); return m ? m[1] : ''; }, net = x => String(x || '').replace(/\s+/g, ' ').trim();
  const metes = s.match(/<meta\b(?:"[^"]*"|'[^']*'|[^'">])*>/gi) || [], meta = k => metes.find(x => (impAttr(x, 'name') || impAttr(x, 'property') || '').toLowerCase() === k);
  const md = meta('description') || meta('og:description'), bt = impAttr(pren(/<base\b([^>]*)>/i), 'href');
  let b = impUrl(base || '', null);
  if (bt) b = impUrl(bt, b ? b.href : null) || b;
  const bh = impWeb(b) ? b.href : null, codi = impTreu(s, 'script|style|noscript|template|svg').replace(/<(script|style)\b[\s\S]*$/i, ''), enllacos = [], docs = [], vist = {}, peus = [], imatges = [];
  for (let m, re = /<a\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi; bh && (m = re.exec(codi));) {
    const h = impAttr(m[1], 'href'), u = h && h.trim()[0] !== '#' ? impUrl(h, bh) : null;
    if (!impWeb(u) || impHost(u) !== impHost(b)) continue;
    u.hash = '';
    if (!vist[u.href]) { vist[u.href] = 1; if (IMP_DOC.test(u.pathname)) docs.push(u.href); else if (!IMP_ACTIU.test(u.pathname)) enllacos.push(u.href); }
  }
  const cos = impTreu(impTreu(impTreu(codi, 'head|nav|iframe|select|textarea|object|canvas|dialog'), 'header', d => (d.match(/<h1\b[\s\S]*?<\/h1\s*>/gi) || []).join('')),
    'footer', d => { peus.push(d); return ''; }).replace(/<title\b[^>]*>[\s\S]*?<\/title\s*>/gi, '');
  const text = impMd(cos, bh, imatges), peu = impMd(peus.join('<p>'), bh, imatges);
  return { titol: net(impEnt(pren(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i))), descripcio: md ? net(impAttr(md, 'content')) : '',
    llengua: pren(/<html\b[^>]*\blang\s*=\s*["']?([A-Za-z]+)/i).toLowerCase(), text: (text + (peu ? '\n\n## Peu\n\n' + peu : '')).trim(), enllacos, docs, imatges };
}
/* Un sitemap dona pàgines; un índex de sitemaps, altres sitemaps. */
function sitemapUrls(xml) {
  const r = { urls: [], sitemaps: [] }, re = /<(url|sitemap)\b[^>]*>[\s\S]*?<loc\b[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/loc\s*>/gi;
  for (let m, u; (m = re.exec(String(xml || '')));) if ((u = impEnt(m[2]).trim())) r[/^url$/i.test(m[1]) ? 'urls' : 'sitemaps'].push(u);
  return r;
}
/* Només el grup «*». La regla més llarga que encaixa mana i, a igualtat,
   guanya Allow (com fa Google). Admet * i $ final. Sense regles, tot permès. */
function robotsPermet(txt, path) {
  const u = /^https?:/i.test(path) && impUrl(path, null), p = u ? u.pathname + u.search : String(path || '/'), grups = [];
  let g = null, ua = false, millor = null;
  String(txt || '').split(/\r?\n/).forEach(l => {
    const x = /^\s*([a-z-]+)\s*:\s*(.*?)\s*$/i.exec(l.replace(/#.*/, '')), k = x ? x[1].toLowerCase() : '';
    if (k === 'user-agent') { if (!ua) grups.push(g = { ua: [], regles: [] }); g.ua.push(x[2].toLowerCase()); ua = true; return; }
    if (x) ua = false;   // una altra línia tanca la llista d'agents del grup
    if ((k === 'allow' || k === 'disallow') && g && x[2]) g.regles.push({ si: k === 'allow', r: x[2] });
  });
  grups.filter(x => x.ua.indexOf('*') >= 0).forEach(x => x.regles.forEach(rg => {
    const fi = /\$$/.test(rg.r), cos = (fi ? rg.r.slice(0, -1) : rg.r).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*');
    if (new RegExp('^' + cos + (fi ? '$' : '')).test(p) && (!millor || rg.r.length > millor.r.length || (rg.r.length === millor.r.length && rg.si))) millor = rg;
  }));
  return !millor || millor.si;
}
/* El Crawl-delay del grup «*», en segons (com a molt 30). */
function robotsEspera(txt) {
  let dins = false, ua = false, s = 0;
  String(txt || '').split(/\r?\n/).forEach(l => {
    const x = /^\s*([a-z-]+)\s*:\s*(.*?)\s*(?:#.*)?$/i.exec(l), k = x && x[1].toLowerCase();
    if (k === 'user-agent') { if (!ua) dins = false; ua = true; if (x[2] === '*') dins = true; return; }
    if (x) ua = false;
    if (k === 'crawl-delay' && dins && Number(x[2]) > 0) s = Math.min(30, Number(x[2]));
  });
  return s;
}
const robotsSitemaps = txt => String(txt || '').split(/\r?\n/).map(l => /^\s*sitemap\s*:\s*(\S+)/i.exec(l)).filter(Boolean).map(x => x[1]);
/* El separador, el més comptat fora de cometes a la primera línia; a igualtat, ';' (l'Excel d'aquí) i el tabulador. */
function llegeixCsv(text) {
  const t = String(text || '').replace(/^\uFEFF/, ''), n = { ';': 0, '\t': 0, ',': 0 }, files = [];
  let dins = false, fila = [], camp = '';
  for (let i = 0; i < t.length && (dins || !/[\r\n]/.test(t[i])); i++) { if (t[i] === '"') dins = !dins; else if (!dins && t[i] in n) n[t[i]]++; }
  const tria = [';', '\t', ','].reduce((a, c) => (n[c] > n[a] ? c : a), ';'), sep = n[tria] ? tria : ',';
  dins = false;
  for (let i = 0, c; i <= t.length; i++) {
    c = t[i];
    if (dins && c !== undefined) { if (c !== '"') camp += c; else if (t[i + 1] === '"') { camp += '"'; i++; } else dins = false; }
    else if (c === '"' && !camp) dins = true;
    else if (c === sep) { fila.push(camp); camp = ''; }
    else if (c === '\n' || c === '\r' || c === undefined) { if (c === '\r' && t[i + 1] === '\n') i++; fila.push(camp); files.push(fila); fila = []; camp = ''; }
    else camp += c;
  }
  const bones = files.filter(f => f.some(x => x.trim()));
  return { sep, capcalera: (bones.shift() || []).map(x => x.trim()), files: bones };
}
/* Una taula entra per llista blanca: sense columnes triades, només la capçalera i
   quantes files té. Una columna «Observacions» pot portar salut o notes d'un client,
   i cap llista negra no ho veu. Les de persona (pel nom o per les cel·les) no hi
   entren ni triades. */
function csvAMd(text, nom, opts) {
  const o = opts || {}, T = IMP_TXT[o.llengua] || IMP_TXT.ca, c = llegeixCsv(text), cap = c.capcalera.map((h, i) => h || 'columna ' + (i + 1)), fora = [], queden = [], lliures = [];
  const triades = (o.columnes || []).map(impNorm);
  cap.forEach((h, i) => {
    const plenes = c.files.map(f => String(f[i] || '').trim()).filter(Boolean);
    const amb = plenes.filter(x => { const a = amagaPersonal(x); return a.correus + a.telefons + a.altres > 0; }).length;
    if (columnaPersonal(h) || amb * 2 > plenes.length) fora.push(i);
    else { lliures.push(i); if (triades.indexOf(impNorm(h)) >= 0) queden.push(i); }
  });
  const esc = s => String(s == null ? '' : s).trim().replace(/\|/g, '\\|').replace(/\r\n|\r|\n/g, '<br>'), fila = f => '| ' + queden.map(i => esc(f[i])).join(' | ') + ' |';
  const md = (nom ? ['# ' + String(nom).replace(/\s+/g, ' ').trim(), ''] : []).concat(queden.length ? [fila(cap), '|' + ' --- |'.repeat(queden.length)].concat(c.files.slice(0, 200).map(fila))
    : lliures.length ? [T.triaCol.replace('{n}', c.files.length).replace('{cols}', lliures.map(i => esc(cap[i])).join(', '))] : [T.capCol]);
  if (queden.length && c.files.length > 200) md.push('', '… ' + (c.files.length - 200) + ' ' + T.mes);
  return { md: md.join('\n'), fora: fora.map(i => cap[i]), files: c.files.length, columnes: lliures.map(i => cap[i]), triades: queden.map(i => cap[i]) };
}
/* La capçalera és nostra: valors d'una línia (entre cometes si YAML s'hi confondria) i cap «---»
   al cos, perquè un text importat no la pugui tancar ni imitar. «- - -» és la mateixa ratlla. */
function fontMd(f) {
  const v = x => { const s = String(x == null ? '' : x).replace(/\s+/g, ' ').trim(); return /^["'`#&*!|>%@,?:[\]{}-]|: | #/.test(s) ? JSON.stringify(s) : s; };
  return '---\nfont: ' + v(f.font) + '\ntipus: ' + v(f.tipus) + '\ntitol: ' + v(f.titol) + '\nimportat: ' + v(f.importat) + '\n---\n\n'
    + String(f.text == null ? '' : f.text).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').replace(/^[ \t]*-{3,}[ \t]*$/gm, '- - -').trim() + '\n';
}
const IMP_TXT = {
  ca: { titol: 'Fonts importades', importat: 'Importat el', intro: 'El que el projecte ja tenia, en text perquè la IA ho llegeixi, amb les dades personals amagades. Reimportar una font sobreescriu el seu fitxer. El dossier (cerebro/dossier.md) diu d\'on surt cada cosa.',
    resum: '{web} pàgines web, {docs} documents i {dades} taules · amagats: {correus} correus, {telefons} telèfons i {altres} dades personals més.', cap: '| Fitxer | D\'on surt | Tipus | Títol | Paraules | Amagat |',
    columnes: 'Columnes retirades per dades personals', llegirT: 'Documents per llegir amb la IA', llegirD: 'Aquí no es llegeixen PDF ni Word: dona\'ls a la IA i que en deixi el text a cerebro/fonts/docs/.',
    fora: 'El que no s\'ha importat', perLlegir: 'document per llegir amb la IA', format: 'format no suportat', buit: 'sense text (potser la web es pinta amb JavaScript)', mes: 'files més', capCol: 'Cap columna sense dades personals.',
    triaCol: '{n} files. Columnes: {cols}. Per importar-ne les files, tria les columnes que calen (a l\'editor, o amb --columnes "a,b"): una taula entra per llista blanca.',
    autoritzat: 'cal --autoritzat amb el domini: només la web de qui us ho demana, amb la seva autorització escrita',
    robots: 'robots.txt no ho permet', xarxa: 'error de xarxa', noHtml: 'no és una pàgina', foraLloc: 'porta fora del lloc', adreca: 'adreça no vàlida', fetch: 'cal Node 18 o més per llegir webs' },
  es: { titol: 'Fuentes importadas', importat: 'Importado el', intro: 'Lo que el proyecto ya tenía, en texto para que la IA lo lea, con los datos personales ocultos. Reimportar una fuente sobrescribe su fichero. El dosier (cerebro/dossier.md) dice de dónde sale cada cosa.',
    resum: '{web} páginas web, {docs} documentos y {dades} tablas · ocultos: {correus} correos, {telefons} teléfonos y {altres} datos personales más.', cap: '| Fichero | De dónde sale | Tipo | Título | Palabras | Oculto |',
    columnes: 'Columnas retiradas por datos personales', llegirT: 'Documentos para leer con la IA', llegirD: 'Aquí no se leen PDF ni Word: dáselos a la IA y que deje el texto en cerebro/fonts/docs/.',
    fora: 'Lo que no se ha importado', perLlegir: 'documento para leer con la IA', format: 'formato no soportado', buit: 'sin texto (quizá la web se pinta con JavaScript)', mes: 'filas más', capCol: 'Ninguna columna sin datos personales.',
    triaCol: '{n} filas. Columnas: {cols}. Para importar sus filas, elige las columnas que hacen falta (en el editor, o con --columnes "a,b"): una tabla entra por lista blanca.',
    autoritzat: 'hace falta --autoritzat con el dominio: solo la web de quien os lo pide, con su autorización escrita',
    robots: 'robots.txt no lo permite', xarxa: 'error de red', noHtml: 'no es una página', foraLloc: 'lleva fuera del sitio', adreca: 'dirección no válida', fetch: 'hace falta Node 18 o más para leer webs' }
};
/* La sortida no depèn de l'ordre d'arribada: es trien per tipus i per font. Amb `previ`
   (el fonts.json d'abans) l'índex conserva el que avui no es reimporta: la web avui i un
   CSV demà. La font també passa per amagaPersonal: una adreça pot portar un correu. */
function importaFonts(entrades, opts) {
  const o = opts || {}, T = IMP_TXT[o.llengua] || IMP_TXT.ca, ara = o.ara || new Date().toISOString().slice(0, 10);
  const ORDRE = { web: 0, doc: 1, dades: 2 }, CARP = { web: 'web', doc: 'docs', dades: 'dades' }, cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  const llista = (entrades || []).filter(e => e && ORDRE[e.tipus] != null).map(e => Object.assign({}, e, { font: amagaPersonal(e.font || e.nom || '').text }))
    .sort((a, b) => ORDRE[a.tipus] - ORDRE[b.tipus] || cmp(a.font, b.font));
  const previ = o.previ && Array.isArray(o.previ.fonts) ? o.previ : { fonts: [], fora: [] }, araF = {}, usats = {}, vist = {};
  llista.forEach(e => { araF[e.font] = 1; });
  const queden = previ.fonts.filter(f => f && /^cerebro\/fonts\/(web|docs|dades)\/[a-z0-9-]+\.md$/.test(f.ruta) && ORDRE[f.tipus] != null && !araF[f.font]);
  queden.forEach(f => { usats[f.ruta] = 1; });
  const ruta = (tipus, base) => { const b = 'cerebro/fonts/' + CARP[tipus] + '/' + impSlug(base).slice(0, 60).replace(/-$/, '');
    let k = b + '.md';
    for (let n = 2; usats[k]; n++) k = b + '-' + n + '.md';
    return (usats[k] = 1) && k; };
  const fitxers = [], fonts = [], fora = [], inf = { web: 0, docs: 0, dades: 0, correus: 0, telefons: 0, altres: 0, columnesFora: [], taules: [], fora, perLlegir: 0 };
  const col = e => (Array.isArray(o.columnes) ? o.columnes : (o.columnes || {})[e.nom || e.font] || []);
  const treu = (font, motiu) => { if (!fora.some(f => f.font === font && f.motiu === motiu)) fora.push({ font, motiu }); };
  llista.forEach(e => {
    const font = e.font, fitx = String(e.nom || font).split(/[?#]/)[0].split(/[\\/]/).pop(), ext = ((/\.([a-z0-9]+)$/i.exec(fitx) || [])[1] || '').toLowerCase();
    if (vist[font]) return;
    vist[font] = 1;
    let titol = '', text = '', base = fitx.replace(/\.[a-z0-9]+$/i, '') || 'font';
    if (e.tipus === 'web') {
      const h = htmlAText(e.cos, font), u = impUrl(font, null);
      titol = h.titol; text = (h.descripcio ? '> ' + h.descripcio + '\n\n' : '') + h.text;
      if (impWeb(u)) base = (u.pathname.replace(/\.(html?|php|aspx?)$/i, '').replace(/^\/+|\/+$/g, '') || 'inici') + u.search;
    } else if (e.tipus === 'dades') {
      const c = csvAMd(e.cos, base, { llengua: o.llengua, columnes: col(e) });
      inf.taules.push({ font, files: c.files, columnes: c.columnes, triades: c.triades, fora: c.fora });
      text = c.md + (c.fora.length ? '\n\n' + T.columnes + ': ' + c.fora.join(', ') + '.' : '');
      c.fora.forEach(x => { if (inf.columnesFora.indexOf(x) < 0) inf.columnesFora.push(x); });
    } else if (/^html?$/.test(ext)) { const h = htmlAText(e.cos, /^https?:/i.test(font) ? font : null); titol = h.titol; text = h.text; }
    else if (/^(md|markdown|txt|text)$/.test(ext)) {
      /* La capçalera d'un .md importat no és nostra: se'n salva el títol i prou. */
      const t = String(e.cos || '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n'), fm = /^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(t);
      text = fm ? t.slice(fm[0].length) : t;
      titol = fm ? (/^(?:title|t[ií]tol|t[ií]tulo)[ \t]*:[ \t]*["']?(.*?)["']?[ \t]*$/im.exec(fm[1]) || [])[1] || '' : '';
    } else { treu(font, IMP_DOC.test('.' + ext) ? T.perLlegir : T.format + (ext ? ' (.' + ext + ')' : '')); return; }
    if (!titol) titol = ((/^#{1,6}[ \t]+(.+)$/m.exec(text) || [])[1] || base).replace(/[#*_`[\]]/g, '');
    const a = amagaPersonal(text), at = amagaPersonal(String(titol).replace(/\s+/g, ' ').trim());
    if (!/\S/.test(a.text)) { treu(font, T.buit); return; }
    const r = ruta(e.tipus, base), am = { correus: a.correus + at.correus, telefons: a.telefons + at.telefons, altres: a.altres + at.altres };
    fitxers.push({ ruta: r, cos: fontMd({ font, tipus: e.tipus, titol: at.text, importat: ara, text: a.text }) });
    fonts.push({ ruta: r, font, tipus: e.tipus, titol: at.text, paraules: (a.text.match(/\S+/g) || []).length, amagats: am });
    inf[CARP[e.tipus]]++;
    Object.keys(am).forEach(k => { inf[k] += am[k]; });
  });
  (o.docs || []).forEach(u => treu(amagaPersonal(u).text, T.perLlegir));
  (o.fora || []).forEach(f => treu(amagaPersonal(f.font).text, String(f.motiu)));
  inf.perLlegir = fora.filter(f => f.motiu === T.perLlegir).length;
  const totes = queden.concat(fonts).sort((x, y) => ORDRE[x.tipus] - ORDRE[y.tipus] || cmp(x.ruta, y.ruta));
  const foraT = (previ.fora || []).filter(f => f && f.font && !araF[f.font] && !fora.some(x => x.font === f.font)).map(f => ({ font: String(f.font), motiu: String(f.motiu) })).concat(fora);
  const cel = s => String(s).replace(/\|/g, '\\|'), quants = { web: 0, docs: 0, dades: 0 }, suma = k => totes.reduce((s, f) => s + (Number((f.amagats || {})[k]) || 0), 0);
  totes.forEach(f => { quants[CARP[f.tipus]]++; });
  const md = ['# ' + T.titol, '', '> ' + T.importat + ' ' + ara + '. ' + T.intro, '', T.resum.replace(/\{(\w+)\}/g, (x, k) => (k in quants ? quants[k] : suma(k))), '', T.cap, '| --- | --- | --- | --- | ---: | ---: |']
    .concat(totes.map(f => { const rel = f.ruta.slice(14), am = f.amagats || {};
      return '| [' + rel + '](' + rel + ') | ' + cel(f.font) + ' | ' + f.tipus + ' | ' + cel(f.titol) + ' | ' + f.paraules + ' | ' + ((am.correus || 0) + (am.telefons || 0) + (am.altres || 0)) + ' |'; }));
  const llegir = foraT.filter(f => f.motiu === T.perLlegir), altres = foraT.filter(f => f.motiu !== T.perLlegir);
  if (inf.columnesFora.length) md.push('', '## ' + T.columnes, '', inf.columnesFora.map(cel).join(', '));
  if (llegir.length) md.push('', '## ' + T.llegirT, '', T.llegirD, '', ...llegir.map(f => '- ' + f.font));
  if (altres.length) md.push('', '## ' + T.fora, '', ...altres.map(f => '- ' + f.font + ' · ' + f.motiu));
  fitxers.push({ ruta: 'cerebro/fonts/index.md', cos: md.join('\n') + '\n' },
    { ruta: 'cerebro/fonts/fonts.json', cos: JSON.stringify({ formato: 'tt-fonts-1', importat: ara, fonts: totes, fora: foraT }, null, 2) + '\n' });
  return { fitxers, informe: inf };
}
/* Una petició cada cop, amb `dormir(espera)` entre totes (un segon, o el Crawl-delay si és més). L'ordre: l'inici, els seus
   enllaços (el menú porta a les pàgines que compten), el sitemap (que sovint comença
   pel blog) i la resta per amplada. Un error de xarxa va a «fora» i segueix. */
async function rastreja(inici, opts) {
  const o = opts || {}, T = IMP_TXT[o.llengua] || IMP_TXT.ca, max = Number(o.max) > 0 ? Math.floor(Number(o.max)) : 30;
  let espera = o.espera == null ? 1000 : Number(o.espera) || 0;
  const dormir = o.dormir || (ms => new Promise(r => setTimeout(r, ms)));
  const agent = o.agent || 'TeamTowers-importa/1 (+https://teamtowershuma.com)', res = { pagines: [], docs: [], fora: [] };
  const fora = (font, motiu) => { res.fora.push({ font, motiu }); }, u0 = impUrl(inici, null);
  if (!impWeb(u0) || typeof o.fetch !== 'function') { fora(String(inici), impWeb(u0) ? T.fetch : T.adreca); return res; }
  /* Només la web de qui ens ho demana: el domini autoritzat ha de ser el que es llegeix. */
  if (String(o.autoritzat || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/[/:].*$/, '').replace(/^www\./, '') !== impHost(u0)) { fora(String(inici), T.autoritzat); return res; }
  let n = 0, sembrat = false;
  const demana = async url => {
    if (n++) await dormir(espera);
    try {
      const temps = typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? { signal: AbortSignal.timeout(o.temps || 20000) } : {};   // un servidor encallat no ens encalla
      const r = await o.fetch(url, Object.assign({ headers: { 'User-Agent': agent, Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5' } }, temps));
      const ct = String((r.headers && r.headers.get && r.headers.get('content-type')) || ''), ok = r.status >= 200 && r.status < 300, llegeix = ok && (!ct || /html|xml|text\//i.test(ct));
      if (!llegeix && r.body && r.body.cancel) r.body.cancel().catch(() => {});   // els binaris no es baixen
      return { ok, status: r.status, ct, url: r.url || url, text: llegeix ? await r.text() : '' };
    } catch (e) { fora(url, T.xarxa + ': ' + String((e && e.message) || e).slice(0, 120)); return null; }
  };
  const rb = await demana(u0.origin + '/robots.txt'), robots = rb && rb.ok && !/html/i.test(rb.ct) ? rb.text : '';
  espera = Math.max(espera, robotsEspera(robots) * 1000);
  const sm = robotsSitemaps(robots), llavor = [], vist = {}, fetes = {}, cua = [];
  if (!sm.length) sm.push(u0.origin + '/sitemap.xml');
  for (let i = 0, fets = 0; i < sm.length && fets < 5; i++) {   // un índex en pot portar molts: amb 5 n'hi ha prou
    const u = impUrl(sm[i], u0.href), r = impWeb(u) && impHost(u) === impHost(u0) && !/\.gz$/i.test(u.pathname) && ++fets && await demana(u.href);
    const x = r && r.ok ? sitemapUrls(r.text) : { urls: [], sitemaps: [] };
    x.urls.forEach(s => { if (llavor.length < max * 5) llavor.push(s); });
    x.sitemaps.forEach(s => { if (sm.indexOf(s) < 0) sm.push(s); });
  }
  /* A la cua només hi entra una pàgina nova del lloc que robots.txt deixa demanar. */
  const posa = l => l.forEach(s => {
    const u = impUrl(s, u0.href);
    if (!impWeb(u) || impHost(u) !== impHost(u0) || vist[u.href.split('#')[0]]) return;
    u.hash = '';
    vist[u.href] = 1;
    if (IMP_DOC.test(u.pathname)) res.docs.push(u.href);
    else if (!IMP_ACTIU.test(u.pathname)) { if (robotsPermet(robots, u.pathname + u.search)) cua.push(u.href); else fora(u.href, T.robots); }
  });
  const sembra = () => { if (!sembrat) { sembrat = true; posa(llavor); } };
  posa([u0.href]);
  for (let intents = 0; res.pagines.length < max && intents < max * 3 + 10; intents++) {
    if (!cua.length) { if (sembrat) break; sembra(); continue; }
    const url = cua.shift(), r = await demana(url), fi = r && (impUrl(r.url, null) || impUrl(url, null));
    if (!r) continue;
    if (!r.ok) { fora(url, 'HTTP ' + r.status); continue; }
    if (!impWeb(fi) || impHost(fi) !== impHost(u0)) { fora(url, T.foraLloc); continue; }
    if (/pdf|msword|officedocument|opendocument/i.test(r.ct)) { res.docs.push(url); continue; }
    if (!/text\/html|xhtml/i.test(r.ct) && (r.ct || !/^\s*</.test(r.text))) { fora(url, T.noHtml + ' (' + (r.ct.split(';')[0] || '?') + ')'); continue; }
    fi.hash = '';
    if (fetes[fi.href]) continue;   // dues adreces que porten a la mateixa pàgina
    fetes[fi.href] = vist[fi.href] = 1;
    res.pagines.push({ url: fi.href, html: r.text });
    if (o.avis) o.avis(fi.href);
    const h = htmlAText(r.text, fi.href);
    posa(h.docs.concat(h.enllacos)); sembra();
  }
  return res;
}
/*/VS-IMPORTA*/
/*VS-GENERA*/
/* ── La web d'un client des del seu mapa, sense navegador ───────────────────
 * El que fan `SOS/tools/web-del-mapa.js` i la plantilla del botó de Netlify
 * (`SOS/plantilla-web/`): del mapa (o d'un web.json) a tots els fitxers del
 * repositori del client, amb l'empremta de cada un. Les eines (`sha`, i el
 * `codi` que va a eines/ i netlify/) les posa qui el crida. */
async function generaWeb(entrada, opts, eines) {
  const o = opts || {}, e = eines || {};
  if (entrada && entrada.formato === 'tt-web-1') return ambPermaweb(webASite(entrada, o), e.sha);
  const D = creaDiagnosi({ revisa, fluxos }), M = creaModel({ fluxos, revisa, normNom: D.normNom });
  const arbre = M.importa(entrada).arbre;
  const web = webDelMapa(M.llegeixTextos(arbre.real.t), { casa: o.casa || [] });
  return ambPermaweb(webASite(web, Object.assign({}, o, { mapa: M.exporta(arbre), codi: e.codi })), e.sha);
}
/* El codi que fa que el repositori d'un client es refaci sol: `eines/motor.mjs`
   (els blocs d'aquest fitxer, tal com hi són, i l'exemple) i `eines/genera.mjs`,
   que Netlify executa a cada publicació i qualsevol pot executar en local. El
   fan servir la plantilla de Netlify (`build-plantilla.js`), el zip de l'editor
   i el mateix motor quan es refà, i per això ha de donar sempre els mateixos
   bytes: un motor que es copia a si mateix i canvia ja no és el de l'editor.
   `tros(nom)` dona un bloc amb les dues marques; `exemple`, el text de l'exemple. */
const REPO_BLOCS = ['VS-MOTOR', 'VS-DIAG', 'VS-MODEL', 'VS-WEB', 'VS-SITE', 'VS-TASQUES', 'VS-REG', 'VS-API', 'VS-MCP', 'VS-IMPORTA', 'VS-GENERA'];
function codiRepositori(tros, exemple) {
  const cap = '// Generat des de SOS/vna-suport.html (repositori asolache/teamtowershuma). No s\'edita a mà: es refà amb node eines/genera.mjs.\n';
  const motor = cap + 'import { readFileSync } from \'node:fs\';\nimport { createHash } from \'node:crypto\';\n'
    + exemple + '\n' + REPO_BLOCS.map(tros).join('\n') + '\n'
    + '/* El codi que va a eines/ i netlify/ del client: els blocs d\'aquest mateix fitxer, tal com hi són. */\n'
    + 'const font = readFileSync(new URL(import.meta.url), \'utf8\');\n'
    + 'const tros = nom => font.slice(font.indexOf(\'/*\' + nom + \'*/\'), font.indexOf(\'/*/\' + nom + \'*/\'));\n'
    + 'const sencer = nom => font.slice(font.indexOf(\'/*\' + nom + \'*/\'), font.indexOf(\'/*/\' + nom + \'*/\') + nom.length + 5);\n'
    + 'const exemple = font.slice(font.indexOf(\'const EXEMPLE = {\'), font.indexOf(\'};\', font.indexOf(\'const EXEMPLE = {\')) + 2);\n'
    + 'export { EXEMPLE };\n'
    + 'export function genera(entrada, opts) {\n'
    + '  return generaWeb(entrada, opts, { sha: async b => createHash(\'sha256\').update(b).digest(\'hex\'),\n'
    + '    codi: { reg: tros(\'VS-REG\'), api: tros(\'VS-API\'), mcp: tros(\'VS-MCP\'), imp: tros(\'VS-IMPORTA\'), repo: codiRepositori(sencer, exemple) } });\n}\n';
  const genera = '#!/usr/bin/env node\n' + cap
    + '// Fa la web del mapa i la deixa a l\'arrel. Netlify l\'executa a cada publicació; en local, amb Node 18 o més.\n'
    + 'import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from \'node:fs\';\nimport { inflateRawSync } from \'node:zlib\';\n'
    + 'import { genera, EXEMPLE } from \'./motor.mjs\';\n'
    + 'const arrel = new URL(\'../\', import.meta.url), e = process.env, hi = r => existsSync(new URL(r, arrel));\n'
    + 'const llegeix = r => (hi(r) ? JSON.parse(readFileSync(new URL(r, arrel), \'utf8\')) : null);\n'
    + '/* El que és del repositori i la web no genera: els continguts, el que s\'ha importat, el dossier i els esborranys. */\n'
    + 'const sota = d => (hi(d) ? readdirSync(new URL(d, arrel), { withFileTypes: true }).map(x => (x.isDirectory() ? sota(d + x.name + \'/\') : /\\.(md|json)$/.test(x.name) ? [d + x.name] : [])).reduce((a, b) => a.concat(b), []).sort() : []);\n'
    + 'const repo = [\'cerebro/continguts/\', \'cerebro/fonts/\', \'cerebro/esborranys/\'].map(sota).reduce((a, b) => a.concat(b), [])\n'
    + '  .concat(hi(\'cerebro/dossier.md\') ? [\'cerebro/dossier.md\'] : []).map(ruta => ({ ruta, cos: readFileSync(new URL(ruta, arrel), \'utf8\') }));\n'
    + 'const continguts = repo.filter(f => /^cerebro\\/continguts\\/[^/]+\\.md$/.test(f.ruta)).map(f => ({ id: f.ruta.slice(19, -3), text: f.cos }));\n'
    + 'let mapa = llegeix(\'cerebro/mapa-real.json\'), font = \'cerebro/mapa-real.json\', exemple = false;\n'
    + 'if (!mapa && e.TT_MAPA) { mapa = JSON.parse(inflateRawSync(Buffer.from(e.TT_MAPA, \'base64url\')).toString(\'utf8\')); font = \'TT_MAPA\'; }\n'
    + 'if (!mapa) {\n  mapa = EXEMPLE; font = \'l\\\'exemple del celler\'; exemple = true;\n'
    + '  if (!e.NETLIFY) console.warn(\'⚠️  Falta cerebro/mapa-real.json: surt la web de l\\\'exemple. Desa-hi el JSON de l\\\'editor del mapa («Copia el JSON»).\');\n}\n'
    + 'const ideal = llegeix(\'cerebro/mapa-ideal.json\');\n'
    + 'if (ideal) mapa = Object.assign({}, mapa, { ideal });\n'
    + '/* El que es va triar a l\'editor i la marca viatgen amb el repositori: sense llegir-los, refer la web la tornava al català, al rol que més lliura i sense marca. Les variables TT_* hi passen per sobre. */\n'
    + 'const prova = r => { try { return llegeix(r); } catch (x) { console.warn(\'⚠️  \' + r + \' no és JSON vàlid: no es fa servir.\'); return null; } };\n'
    + 'const conf = prova(\'cerebro/configuracio.json\') || {}, marca = prova(\'cerebro/marca.json\');\n'
    + 'if (marca && marca.logo === \'../logo.svg\' && hi(\'logo.svg\')) marca.logoSvg = readFileSync(new URL(\'logo.svg\', arrel), \'utf8\');\n'
    + 'let casa;\ntry { casa = e.TT_CASA ? JSON.parse(e.TT_CASA) : conf.casa; } catch (x) { casa = conf.casa; }\n'
    + 'const fitxers = await genera(mapa, { nom: e.TT_NOM || conf.nom, correu: e.TT_CORREU || conf.correu, llengua: e.TT_LLENGUA || conf.llengua, url: e.TT_URL || conf.url || e.URL, casa: Array.isArray(casa) ? casa : undefined, marca: marca || undefined, continguts, repo, avisa: m => console.warn(\'⚠️  \' + m) });\n'
    + '/* El que és del repositori no es trepitja: la configuració, el mapa, les decisions i el que s\'escriu (dossier, fonts, continguts, esborranys). */\n'
    + 'const propis = [\'netlify.toml\', \'cerebro/mapa-real.json\', \'cerebro/mapa-ideal.json\', \'cerebro/decisiones.md\', \'cerebro/dossier.md\'];\n'
    + 'const escrit = r => /^cerebro\\/(fonts|continguts|esborranys)\\//.test(r);\n'
    + 'let n = 0;\n'
    + 'for (const f of fitxers) {\n'
    + '  const u = new URL(f.ruta, arrel);\n'
    + '  if ((propis.includes(f.ruta) || escrit(f.ruta)) && existsSync(u)) continue;\n'
    + '  if (exemple && /^cerebro\\/mapa-(real|ideal)\\.json$/.test(f.ruta)) continue; // l\'exemple no es desa com a mapa del client\n'
    + '  mkdirSync(new URL(\'.\', u), { recursive: true });\n  writeFileSync(u, f.cos);\n  n++;\n}\n'
    + 'console.log(\'✅ \' + n + \' fitxers, des de \' + font + (continguts.length ? \', amb \' + continguts.length + \' continguts\' : \'\'));\n';
  return { motor, genera };
}
/*/VS-GENERA*/
/* El codi que va a eines/ i netlify/ del client: els blocs d'aquest mateix fitxer, tal com hi són. */
const font = readFileSync(new URL(import.meta.url), 'utf8');
const tros = nom => font.slice(font.indexOf('/*' + nom + '*/'), font.indexOf('/*/' + nom + '*/'));
const sencer = nom => font.slice(font.indexOf('/*' + nom + '*/'), font.indexOf('/*/' + nom + '*/') + nom.length + 5);
const exemple = font.slice(font.indexOf('const EXEMPLE = {'), font.indexOf('};', font.indexOf('const EXEMPLE = {')) + 2);
export { EXEMPLE };
export function genera(entrada, opts) {
  return generaWeb(entrada, opts, { sha: async b => createHash('sha256').update(b).digest('hex'),
    codi: { reg: tros('VS-REG'), api: tros('VS-API'), mcp: tros('VS-MCP'), imp: tros('VS-IMPORTA'), repo: codiRepositori(sencer, exemple) } });
}
