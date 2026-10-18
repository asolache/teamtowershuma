/* El mapa viu · el que circula i el que no (18/10/2026).
   Cada flux té un ritme (el declarat, o el que surt dels seus apunts) i una
   data de l'últim cop que va circular. Amb tots dos el mapa el pinta viu,
   apagant-se, aturat o mai no circulat. I la xarxa real (leads, correus,
   apunts) entra com un paquet privat que no surt mai del navegador.
   Una sola còpia: la carreguen l'app i l'editor del mapa amb carregaLib. */
var FluxViu = (function () {
  var DIA = 864e5;
  var RITMES = { setmana: 7, quinzena: 14, mes: 30, trimestre: 91, any: 365 };
  var NOMS = { viu: 'viu', apagant: 'apagant-se', aturat: 'aturat', mai: 'mai no ha circulat' };

  function temps(tss) {
    return (tss || []).map(function (x) { return +new Date(x); }).filter(isFinite).sort(function (a, b) { return a - b; });
  }

  /* El ritme en dies: el declarat, o la mediana entre apunts quan n'hi ha
     tres o més. Sense cap dels dos, 0: no se sap què esperar. */
  function ritmeDies(flux, tss) {
    if (flux && RITMES[flux.ritme]) return RITMES[flux.ritme];
    var t = temps(tss);
    if (t.length < 3) return 0;
    var d = [];
    for (var i = 1; i < t.length; i++) d.push(t[i] - t[i - 1]);
    d.sort(function (a, b) { return a - b; });
    return Math.max(1, Math.round(d[d.length >> 1] / DIA));
  }

  /* Sense ritme es compta com un flux mensual: és el que es demana a un
     negoci que tot just comença a apuntar. */
  function estat(flux, tss, ara) {
    ara = ara || Date.now();
    var t = temps(tss);
    if (!t.length) return { estat: 'mai', ritme: ritmeDies(flux, t), n90: 0, darrer: null };
    var r = ritmeDies(flux, t), darrer = t[t.length - 1], fa = (ara - darrer) / DIA, base = r || 30;
    var n90 = t.filter(function (x) { return ara - x < 90 * DIA; }).length;
    return { estat: fa <= base ? 'viu' : fa <= 2 * base ? 'apagant' : 'aturat', ritme: r, n90: n90, darrer: darrer, dies: Math.floor(fa) };
  }

  var estil = false;
  function posaEstil() {
    if (estil) return; estil = true;
    var s = document.createElement('style');
    s.textContent =
      '.fv-pols{fill:none;stroke-linecap:round;stroke-width:3;stroke-opacity:.95;stroke-dasharray:1.5 11;animation:fvp var(--fv,3s) linear infinite;pointer-events:none}' +
      '@keyframes fvp{to{stroke-dashoffset:-50}}' +
      '.fv-apagant{stroke-opacity:.28}' +
      '.fv-aturat{stroke:#ff9100;stroke-opacity:.85}' +
      '.fv-mai{stroke:#82828d;stroke-opacity:.35;stroke-width:1}' +
      '.fv-marca{font:700 10px "JetBrains Mono",monospace;fill:#ff9100;pointer-events:none}' +
      '[data-url]{cursor:pointer}' +
      '@media (prefers-reduced-motion:reduce){.fv-pols{animation:none;stroke-dasharray:none;stroke-width:2.4;stroke-opacity:.6}}';
    document.head.appendChild(s);
  }

  function fa(dies) { return dies === 0 ? 'avui' : dies === 1 ? 'ahir' : 'fa ' + dies + ' dies'; }

  /* Pinta damunt l'SVG que ja ha dibuixat l'app: cada camí porta data-ex, i
     cada rol o flux amb origen porta data-url. `fluxos` és {id: {flux, ts}}.
     Si cap flux no ha circulat mai, el mapa és encara un disseny i no es toca. */
  function pinta(svg, fluxos, ara) {
    posaEstil();
    var ns = 'http://www.w3.org/2000/svg';
    var algun = Object.keys(fluxos).some(function (k) { return (fluxos[k].ts || []).length; });
    if (algun) svg.querySelectorAll('path[data-ex]').forEach(function (p) {
      var f = fluxos[p.getAttribute('data-ex')]; if (!f) return;
      var e = estat(f.flux, f.ts, ara);
      p.classList.add('fv-' + e.estat);
      var tt = p.querySelector('title');
      if (tt) tt.textContent += ' · ' + NOMS[e.estat] + (e.darrer ? ' (' + fa(e.dies) + (e.ritme ? ', cada ' + e.ritme + ' dies' : '') + ')' : '');
      if (e.estat === 'viu') {
        var q = document.createElementNS(ns, 'path');
        q.setAttribute('d', p.getAttribute('d'));
        q.setAttribute('class', 'fv-pols');
        q.setAttribute('stroke', p.getAttribute('stroke'));
        q.style.setProperty('--fv', Math.max(.8, 4 - Math.min(e.n90, 30) / 10) + 's');
        p.parentNode.insertBefore(q, p.nextSibling);
      } else if (e.estat === 'aturat' && p.getAttribute('data-m')) {
        var m = p.getAttribute('data-m').split(',');
        var t = document.createElementNS(ns, 'text');
        t.setAttribute('x', m[0]); t.setAttribute('y', +m[1] + 4);
        t.setAttribute('text-anchor', 'middle'); t.setAttribute('class', 'fv-marca');
        t.textContent = '⏸';
        p.parentNode.appendChild(t);
      }
    });
    svg.querySelectorAll('[data-url]').forEach(function (el) {
      var u = el.getAttribute('data-url');
      var obre = function () { window.open(u, '_blank', 'noopener'); };
      el.addEventListener('click', obre);
      el.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') obre(); });
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', 0);
    });
  }

  /* ── La xarxa real ─────────────────────────────────────────────────────
     Un paquet {type:'sos-xarxa-real', v:1, nodes:[], fluxos:[]} que prepara
     Claude amb els connectors (Zoho, Gmail, el registre) i que la persona
     arrossega al seu SOS. Cada peça porta el seu `orig` (p. ex. zoho:123,
     gmail:abc): tornar-lo a carregar actualitza, no duplica. Les dades són
     personals i només viuen al navegador de qui el carrega. */
  var TIPUS = 'sos-xarxa-real';
  function text(x, n) { return String(x == null ? '' : x).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n); }
  function url(x) { x = String(x || ''); return /^https:\/\/[^\s"'<>]+$/.test(x) ? x.slice(0, 500) : ''; }

  function importa(node, pak, uid) {
    if (!pak || pak.type !== TIPUS || !Array.isArray(pak.nodes)) throw new Error('Aquest fitxer no és un paquet de xarxa real');
    var vna = node.vna, roles = vna.roles, ex = vna.exchanges, compte = { rols: 0, fluxos: 0, fets: 0 };
    var perOrig = {};
    roles.forEach(function (r) { if (r.orig) perOrig[r.orig] = r; });
    pak.nodes.forEach(function (n) {
      var o = text(n.id, 120); if (!o) return;
      var r = perOrig[o];
      if (!r) { r = { id: uid(), orig: o }; roles.push(r); perOrig[o] = r; compte.rols++; }
      r.name = text(n.name, 80) || r.name || o;
      if (n.kind) r.realKind = text(n.kind, 20);
      var u = url(n.url); if (u) r.url = u;
    });
    (pak.fluxos || []).forEach(function (f) {
      var a = perOrig[text(f.from, 120)], b = perOrig[text(f.to, 120)], o = text(f.id, 160);
      if (!a || !b || !o) return;
      var x = ex.find(function (y) { return y.orig === o; });
      if (!x) { x = { id: uid(), orig: o, from: a.id, to: b.id, kind: f.kind === 'tangible' ? 'tangible' : 'intangible', events: [] }; ex.push(x); compte.fluxos++; }
      x.label = text(f.label, 60) || x.label || '';
      if (RITMES[f.ritme]) x.ritme = f.ritme;
      var u = url(f.url); if (u) x.url = u;
      x.events = x.events || [];
      (f.fets || []).forEach(function (ev) {
        var eo = text(ev.id, 160), ts = new Date(ev.ts);
        if (!eo || !isFinite(ts) || x.events.some(function (y) { return y.orig === eo; })) return;
        x.events.push({ orig: eo, ts: ts.toISOString(), what: text(ev.what, 120), url: url(ev.url) || undefined });
        compte.fets++;
      });
    });
    return compte;
  }

  return { RITMES: RITMES, TIPUS: TIPUS, ritmeDies: ritmeDies, estat: estat, pinta: pinta, importa: importa };
})();
