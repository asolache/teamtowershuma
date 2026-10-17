/* El cervell · la vista plana, la castellera en moviment
 * ─────────────────────────────────────────────────────────────────────────────
 * El grafe pla del cervell en SVG: les vedes en l'ordre en què es van escriure,
 * d'esquerra a dreta, i en franges per kosha. En vista castellera les franges
 * són els tres pisos del castell (pom de dalt, tronc i pinya, `CerebroFuerzas.
 * CASTELLERA`), i el cervell es construeix veda a veda, amb les seves cites.
 * És la vista «Castellera» i «En moviment» de la pàgina del cervell d'Álvaro,
 * portada aquí perquè la facin servir la portada i les webs filles en lloc de
 * copiar-la. Els pisos i el recompte són a `forces.js`; aquí només el dibuix.
 *
 *   CervellPla.munta(caixa, { nodos, aristas, capas }, { vista: 'castellera' | 'capes', mou: true, ara: <element> })
 *   CervellPla.dades(json)   el JSON compacte de build-cervell-dades.js → { nodos, aristas, capas }
 *   CervellPla.franges / geometria / corba   les peces, per a qui hi posa la seva interacció
 */
(function (raiz) {
  var NS = 'http://www.w3.org/2000/svg';
  var CSS = '.cp{--k-anna:#b45309;--k-prana:#15803d;--k-mano:#0e7490;--k-vijnana:#1d4ed8;--k-ananda:#7c3aed}' +
    '.cp svg{display:block;width:100%;height:auto}' +
    '.cp .cp-b{opacity:.08}.cp .cp-l{font:600 15px system-ui,sans-serif;fill:var(--text,#15130f)}' +
    '.cp .cp-s{font:500 11px ui-monospace,monospace;fill:var(--muted,#5e594d);letter-spacing:.06em}' +
    '.cp .cp-e{fill:none;stroke:var(--muted,#5e594d);stroke-opacity:.3;stroke-width:1.2;transition:opacity .4s}' +
    '.cp .cp-n{transition:opacity .4s,transform .4s;transform-box:fill-box;transform-origin:center}' +
    '.cp .cp-h{opacity:0;transform:scale(.2)}.cp .cp-x{opacity:0}' +
    '.cp .cp-u{stroke:var(--text,#15130f);stroke-width:2.5}';

  function el(t, at, p) { var e = document.createElementNS(NS, t); for (var k in at) e.setAttribute(k, at[k]); if (p) p.appendChild(e); return e; }
  function col(id) { return 'var(--k-' + id + ')'; }

  /* Les franges: els tres pisos del castell, cadascun amb les seves koshas, o
     les cinc koshas soles. El propòsit dalt i l'obra a baix. */
  function franges(D, vista) {
    var capaDe = {}; D.capas.forEach(function (c) { capaDe[c.id] = c; });
    if (vista === 'castellera' && raiz.CerebroFuerzas) {
      return raiz.CerebroFuerzas.CASTELLERA.map(function (p) {
        return { n: p.n, s: p.capas.map(function (k) { return capaDe[k].s; }).join(' · '), capas: p.capas, pis: true };
      });
    }
    return D.capas.slice().reverse().map(function (c) { return { n: c.n, s: c.s, capas: [c.id] }; });
  }

  /* On va cada veda: x per l'ordre en què es va escriure, y per la franja (i,
     dins d'un pis, per la kosha), amb un petit vaivé perquè no es tapin. La
     fan servir aquesta vista i el grafe interactiu de la pàgina del cervell. */
  function geometria(D, bs, g) {
    var pos = {};
    D.nodos.forEach(function (n, i) {
      var li = bs.findIndex(function (b) { return b.capas.indexOf(n.capa) >= 0; }), b = bs[li];
      var sub = g.alt / b.capas.length, si = b.capas.indexOf(n.capa), jit = ((n.n * 37) % 5 - 2) * (sub / 7);
      pos[n.id] = { x: g.x0 + (g.x1 - g.x0) * i / Math.max(1, D.nodos.length - 1), y: g.dalt + g.alt * li + sub * si + sub / 2 + jit, pis: li };
    });
    return pos;
  }
  /* Una cita: un arc que s'enfila més com més lluny són les dues vedes. */
  function corba(p, q) {
    var mx = (p.x + q.x) / 2, my = Math.min(p.y, q.y) - Math.abs(p.x - q.x) / 6;
    return 'M' + p.x + ',' + p.y + ' Q' + mx + ',' + my + ' ' + q.x + ',' + q.y;
  }

  function munta(caixa, D, op) {
    op = op || {};
    if (!document.getElementById('cp-css')) { var st = document.createElement('style'); st.id = 'cp-css'; st.textContent = CSS; document.head.appendChild(st); }
    caixa.classList.add('cp');
    /* En una pantalla estreta, mitja amplada: els punts i els noms dels pisos
       es dibuixen el doble de grans, i les koshas de cada pis no hi caben. */
    var estret = caixa.clientWidth < 600, W = estret ? 500 : 1000;
    var H = (op.alt || 300) * (estret ? .8 : 1), dalt = 10, x0 = estret ? 120 : 170, x1 = W - 16, bs = franges(D, op.vista || 'castellera'), alt = (H - dalt - 10) / bs.length;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': op.etiqueta || '' });
    caixa.innerHTML = ''; caixa.appendChild(svg);
    var gB = el('g', {}, svg), gE = el('g', {}, svg), gN = el('g', {}, svg);
    var byId = {}, pos = {}, grau = {};
    D.nodos.forEach(function (n, i) { n.i = i; byId[n.id] = n; grau[n.id] = 0; });
    D.aristas.forEach(function (a) { grau[a[0]]++; grau[a[1]]++; });
    var compte = bs.map(function () { return 0; }), etiq = [];
    bs.forEach(function (b, i) {
      var sub = alt / b.capas.length;
      b.capas.forEach(function (k, j) { el('rect', { x: 0, y: dalt + alt * i + sub * j, width: W, height: sub, fill: col(k), 'class': 'cp-b' }, gB); });
      if (b.pis && i) el('line', { x1: 0, x2: W, y1: dalt + alt * i, y2: dalt + alt * i, stroke: 'currentColor', 'stroke-opacity': .15 }, gB);
      var t = el('text', { x: 12, y: dalt + alt * i + alt / 2 - 3, 'class': 'cp-l' }, gB); t.textContent = b.n;
      etiq.push(t);
      if (b.s && !estret) { var s = el('text', { x: 12, y: dalt + alt * i + alt / 2 + 14, 'class': 'cp-s' }, gB); s.textContent = b.s.toUpperCase(); }
    });
    pos = geometria(D, bs, { dalt: dalt, alt: alt, x0: x0, x1: x1 });
    var eEls = D.aristas.map(function (a) { return { a: a, el: el('path', { d: corba(pos[a[0]], pos[a[1]]), 'class': 'cp-e' }, gE) }; });
    var nEls = D.nodos.map(function (n) {
      var c = el('circle', { cx: pos[n.id].x, cy: pos[n.id].y, r: 3.5 + Math.min(grau[n.id], 6), fill: col(n.capa), 'class': 'cp-n' }, gN);
      el('title', {}, c).textContent = 'Veda ' + n.n + (n.fuente ? ' · ' + n.fuente : '') + ' · ' + n.t;
      return c;
    });

    /* Fins a la veda k: el castell, pis a pis, amb el recompte de cada pis. */
    function fins(k) {
      compte = bs.map(function () { return 0; });
      D.nodos.forEach(function (n, i) {
        var vis = i < k; nEls[i].classList.toggle('cp-h', !vis); nEls[i].classList.toggle('cp-u', i === k - 1);
        if (vis) compte[pos[n.id].pis]++;
      });
      eEls.forEach(function (e) { e.el.classList.toggle('cp-x', byId[e.a[0]].i >= k || byId[e.a[1]].i >= k); });
      etiq.forEach(function (t, i) { t.textContent = bs[i].n + ' · ' + compte[i]; });
      var u = D.nodos[k - 1]; if (op.ara && u) op.ara.textContent = 'Veda ' + u.n + ' · ' + u.t;
    }

    /* En moviment, en bucle, i només quan es veu: fora de pantalla o amb la
       pestanya amagada no gasta res. Qui demana menys moviment el veu sencer. */
    var quiet = raiz.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, k = op.des || 0, timer = null, veig = true, mort = false;
    function pas() { k = k >= D.nodos.length + 40 ? 1 : k + 1; fins(Math.min(k, D.nodos.length)); }
    function engega() { if (!mort && !timer && veig && !document.hidden) timer = setInterval(pas, op.pas || 90); }
    function atura() { clearInterval(timer); timer = null; }
    if (quiet || op.mou === false) fins(D.nodos.length);
    else {
      fins(k); engega();
      if (raiz.IntersectionObserver) new IntersectionObserver(function (es) { veig = es[0].isIntersecting; veig ? engega() : atura(); }).observe(caixa);
      document.addEventListener('visibilitychange', function () { document.hidden ? atura() : engega(); });
    }
    return { fins: fins, atura: atura, engega: engega, treu: function () { mort = true; atura(); }, pisos: function () { return bs.map(function (b, i) { return { n: b.n, vedes: compte[i] }; }); } };
  }

  /* El JSON compacte que escriu `SOS/tools/build-cervell-dades.js`. */
  function dades(J) {
    var nodos = J.vedes.map(function (v) { return { id: 'tt:' + v[0], n: v[0], capa: v[1], t: v[2] }; });
    return { nodos: nodos, aristas: J.cites.map(function (c) { return ['tt:' + c[0], 'tt:' + c[1]]; }), capas: J.capes };
  }

  raiz.CervellPla = { munta: munta, dades: dades, franges: franges, geometria: geometria, corba: corba };
})(window);
