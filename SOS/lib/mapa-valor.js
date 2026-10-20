/* El nucli del mapa de valor · GENERAT per SOS/tools/build-vna-suport.js
   No s'edita a mà: les regles, el text per a la IA i el pont amb l'app es
   declaren allà un sol cop. Navegador: window.MapaValor. Node: require(). */
(function (g) {
'use strict';
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
const deApp=function deApp(vna, op) {
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
};
const aApp=function aApp(m, id) {
  const nou = id || (() => Math.random().toString(36).slice(2, 10)), per = {};
  const roles = [...new Set([...(m.roles || []), ...fluxos(m).flatMap(f => [f.de, f.a])])]
    .map(n => { per[n] = nou(); return { id: per[n], name: n }; });
  return { roles, exchanges: fluxos(m).map(f => ({ id: nou(), from: per[f.de], to: per[f.a], kind: f.mena, label: f.q })) };
};
const salut=function salut(m, op) {
  /* `treu`: les regles que qui crida no pot complir perquè no en guarda les
     dades (l'app encara no seqüencia processos). No compten, i ho diu `fora`. */
  const treu = (op && op.treu) || [], r = revisa(m), fora = r.regles.filter(x => treu.includes(x.id));
  r.regles = r.regles.filter(x => !treu.includes(x.id)); r.fora = fora;
  const d = r.regles.filter(x => x.dur), t = r.regles.filter(x => !x.dur);
  const ok = l => l.filter(x => x.ok).length;
  return Object.assign(r, { punts: fluxos(m || {}).length ? Math.round(100 * (2 * ok(d) + ok(t)) / (2 * d.length + t.length)) : 0 });
};
const MapaValor={REGLES,fluxos,tocats,textos,revisa,salut,deApp,aApp,SYSTEM_PROMPT};
if (typeof module !== 'undefined' && module.exports) module.exports = MapaValor; else g.MapaValor = MapaValor;
})(typeof globalThis !== 'undefined' ? globalThis : this);
