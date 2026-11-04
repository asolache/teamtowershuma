/* El cervell · el mapa mental del repositori
 * ─────────────────────────────────────────────────────────────────────────────
 * L'Àlvar (04/11/2026): «la vista de mapa mental del repositori públic de cada
 * projecte, navegable, amb vista d'àguila i zoom a les carpetes». La carpeta on
 * ets va al centre i les seves carpetes i fitxers, al voltant, com les branques
 * d'un mapa mental; de cada carpeta en surten els seus fills, més petits. Tocar
 * una carpeta hi entra (zoom); la vista d'àguila de la cantonada és tot el
 * repositori en anells, amb on ets marcat, i també s'hi pot tocar. Sota, la
 * mateixa carpeta en llista, per llegir-la, amb l'enllaç a GitHub de cada cosa.
 * Els documents del cervell porten el color de la seva àrea.
 *
 *   CervellArbre.munta(caixa, { fitxers: [ruta…], repo, ruta, docs: { ruta: color }, alCanvi(ruta) })
 *   → { treu, ves(ruta) }
 */
(function (raiz) {
  /* Les mides es calculen per a cada pantalla (`mides`): en un mòbil el dibuix és
     més alt que ample i la lletra, més grossa en unitats del dibuix. */
  var NS = 'http://www.w3.org/2000/svg', W = 1000, H = 720, CX = W / 2, CY = H / 2, R1 = 210, R2 = 320, FS = 15, ESTRET = false, SOLTS = 8, MAX2 = 10;
  var COLORS = ['#0e7490', '#b45309', '#15803d', '#1d4ed8', '#7c3aed', '#be185d', '#4d7c0f', '#c2410c'];
  var CSS = '.ar{--a-l:var(--border,#ddd7c8);--a-c:var(--card,#fff);--a-t:var(--text,#15130f);--a-m:var(--muted,#5e594d)}' +
    '.ar-cami{display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin:0 0 8px;font-size:.98rem}' +
    '.ar-cami button{font:inherit;min-height:36px;padding:4px 10px;border-radius:999px;border:1px solid var(--a-l);background:var(--a-c);color:var(--a-t);cursor:pointer}' +
    '.ar-cami button[aria-current]{font-weight:700;border-color:var(--a-t)}.ar-cami span{color:var(--a-m)}' +
    '.ar-g{position:relative;background:var(--a-c);border:1px solid var(--a-l);border-radius:14px;overflow:hidden;touch-action:none}' +
    '.ar-g>svg{display:block;width:100%;height:min(72vh,640px);cursor:grab;user-select:none;-webkit-user-select:none}.ar-g>svg.mou{cursor:grabbing}' +
    '.ar-z{position:absolute;top:8px;right:8px;display:flex;gap:6px}' +
    '.ar-z button,.ar-ag button{font:600 .95rem inherit;font-family:inherit;min-width:44px;min-height:44px;border-radius:999px;border:1px solid var(--a-l);background:var(--a-c);color:var(--a-t);cursor:pointer}' +
    '.ar-ag{position:absolute;left:8px;bottom:8px;background:var(--a-c);border:1px solid var(--a-l);border-radius:12px;padding:4px;text-align:center}' +
    '.ar-ag svg{display:block;width:clamp(84px,20vw,150px);height:clamp(84px,20vw,150px)}.ar-ag button{min-height:34px;font-size:.8rem;padding:2px 10px}.ar-ag small{display:block;font-size:.75rem;color:var(--a-m)}' +
    '.ar-ag path{cursor:pointer;stroke:var(--a-c);stroke-width:.6}.ar-ag path.on{stroke:var(--a-t);stroke-width:2}' +
    '.ar svg .br{fill:none;stroke-linecap:round}.ar svg text{font:500 1em system-ui,sans-serif;fill:var(--a-t);paint-order:stroke;stroke:var(--a-c);stroke-width:4px;stroke-linejoin:round}' +
    '.ar svg .f text{font-size:.85em;fill:var(--a-m)}.ar svg .n2 text{font-size:.8em;fill:var(--a-m)}' +
    '.ar svg .c0 text{font:700 1.25em system-ui,sans-serif}.ar svg [data-r]{cursor:pointer}.ar svg [data-r]:hover circle,.ar svg [data-r]:focus circle{stroke:var(--a-t);stroke-width:2.5}' +
    '.ar svg [data-r]:focus{outline:none}.ar svg .ent{animation:ar-e .32s ease-out}' +
    '@keyframes ar-e{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}' +
    '@media (prefers-reduced-motion:reduce){.ar svg .ent{animation:none}}' +
    '.ar-res{font-size:.98rem;margin:10px 0 6px}.ar-l{list-style:none;padding:0;margin:0;columns:16rem auto;column-gap:1.5rem}' +
    '.ar-l li{break-inside:avoid;padding:4px 0}.ar-l button{font:inherit;padding:0;border:0;background:none;color:var(--blue,#1d4ed8);text-decoration:underline;cursor:pointer;text-align:left}' +
    '.ar-l i{display:inline-block;width:9px;height:9px;border-radius:2px;background:var(--c);margin-right:6px}.ar-m{color:var(--a-m);font-size:.9rem}';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var css = false;

  /* L'arbre: cada carpeta sap els seus fills, els seus fitxers i quants en porta a dins. */
  function arbre(fitxers) {
    var arrel = { nom: '', ruta: '', fills: {}, fitxers: [], n: 0 };
    fitxers.forEach(function (f) {
      var t = f.split('/'), c = arrel; c.n++;
      for (var i = 0; i < t.length - 1; i++) {
        var r = t.slice(0, i + 1).join('/');
        c = c.fills[t[i]] || (c.fills[t[i]] = { nom: t[i], ruta: r, fills: {}, fitxers: [], n: 0, pare: c });
        c.n++;
      }
      c.fitxers.push(f);
    });
    return arrel;
  }
  function fills(c) { return Object.keys(c.fills).map(function (k) { return c.fills[k]; }).sort(function (a, b) { return b.n - a.n || (a.nom < b.nom ? -1 : 1); }); }
  function el(t, at, p) { var e = document.createElementNS(NS, t); for (var k in at) e.setAttribute(k, at[k]); if (p) p.appendChild(e); return e; }
  function pol(r, a) { return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; }
  function curt(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  function munta(caixa, op) {
    if (!css) { var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); css = true; }
    var A = arbre(op.fitxers || []), repo = op.repo, docs = op.docs || {}, nodeDe = { '': A }, color = {};
    (function idx(c) { fills(c).forEach(function (f) { nodeDe[f.ruta] = f; idx(f); }); })(A);
    fills(A).forEach(function (f, i) { color[f.nom] = COLORS[i % COLORS.length]; });
    var colDe = function (ruta) { return color[ruta.split('/')[0]] || '#5e594d'; };
    var gh = function (ruta, carpeta) { return 'https://github.com/' + repo + (ruta ? '/' + (carpeta ? 'tree' : 'blob') + '/HEAD/' + ruta.split('/').map(encodeURIComponent).join('/') : ''); };

    caixa.classList.add('ar');
    caixa.innerHTML = '<nav class="ar-cami" aria-label="On ets del repositori"></nav>' +
      '<div class="ar-g"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Mapa mental del repositori: la carpeta on ets al centre i el que porta al voltant. Toca una carpeta per entrar-hi; arrossega per moure\'t i fes zoom amb els botons, amb dos dits o amb Ctrl i la roda."></svg>' +
      '<div class="ar-z"><button type="button" data-z="mes" aria-label="Apropa">+</button><button type="button" data-z="menys" aria-label="Allunya">−</button><button type="button" data-z="tot">Tot</button></div>' +
      '<div class="ar-ag"><svg viewBox="-100 -100 200 200" role="img" aria-label="Vista d\'àguila: tot el repositori en anells. Toca una carpeta per anar-hi."></svg><button type="button" data-z="aguila">Vista d\'àguila</button></div></div>' +
      '<p class="ar-res" aria-live="polite"></p><ul class="ar-l"></ul>';
    var cami = caixa.querySelector('.ar-cami'), svg = caixa.querySelector('.ar-g>svg'), ag = caixa.querySelector('.ar-ag svg'),
      res = caixa.querySelector('.ar-res'), llista = caixa.querySelector('.ar-l'), ara = A, vb = [0, 0, W, H];

    /* Zoom i moure: el viewBox, amb botons, Ctrl+roda, arrossegar i dos dits. */
    function posa() { svg.setAttribute('viewBox', vb.join(' ')); }
    function zoom(f, px, py) {
      var w = Math.max(W / 6, Math.min(W * 1.6, vb[2] / f)), h = w * H / W;
      if (px == null) { px = vb[0] + vb[2] / 2; py = vb[1] + vb[3] / 2; }
      vb = [px - (px - vb[0]) * w / vb[2], py - (py - vb[1]) * h / vb[3], w, h]; posa();
    }
    function aSvg(e) { var r = svg.getBoundingClientRect(); return [vb[0] + (e.clientX - r.left) / r.width * vb[2], vb[1] + (e.clientY - r.top) / r.height * vb[3]]; }
    svg.addEventListener('wheel', function (e) { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); var p = aSvg(e); zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, p[0], p[1]); }, { passive: false });
    var dits = {}, ini = null, mogut = false;
    svg.addEventListener('pointerdown', function (e) {
      dits[e.pointerId] = [e.clientX, e.clientY]; mogut = false;
      ini = { vb: vb.slice(), x: e.clientX, y: e.clientY, d: dist(), id: e.pointerId };
    });
    function dist() { var k = Object.keys(dits); if (k.length < 2) return 0; var a = dits[k[0]], b = dits[k[1]]; return Math.hypot(a[0] - b[0], a[1] - b[1]); }
    svg.addEventListener('pointermove', function (e) {
      if (!ini || !dits[e.pointerId]) return;
      dits[e.pointerId] = [e.clientX, e.clientY];
      var r = svg.getBoundingClientRect(), d = dist();
      if (d && ini.d) { vb = ini.vb.slice(); zoom(d / ini.d); mogut = true; return; }
      var dx = e.clientX - ini.x, dy = e.clientY - ini.y;
      /* La captura només quan ja arrossega: abans, desviaria el clic d'un node. */
      if (!mogut && Math.abs(dx) + Math.abs(dy) > 6) { mogut = true; svg.classList.add('mou'); if (svg.setPointerCapture) try { svg.setPointerCapture(e.pointerId); } catch (x) {} }
      if (mogut) { vb = [ini.vb[0] - dx / r.width * vb[2], ini.vb[1] - dy / r.height * vb[3], vb[2], vb[3]]; posa(); }
    });
    function solta(e) { delete dits[e.pointerId]; svg.classList.remove('mou'); if (!Object.keys(dits).length) ini = null; else ini = { vb: vb.slice(), x: e.clientX, y: e.clientY, d: dist() }; }
    svg.addEventListener('pointerup', solta); svg.addEventListener('pointercancel', solta);

    /* Un node: un cercle (carpeta) o un punt (fitxer), amb el nom al costat que mira enfora. */
    function node(g, x, y, a, r, txt, cl, ruta, carpeta, col) {
      var n = el('g', { 'class': cl }, g);
      if (ruta != null) { n.setAttribute('data-r', ruta); n.setAttribute('data-c', carpeta ? '1' : '0'); n.setAttribute('tabindex', '0'); n.setAttribute('role', carpeta ? 'button' : 'link'); n.setAttribute('aria-label', (carpeta ? 'Carpeta ' : 'Fitxer ') + txt); }
      if (carpeta) el('circle', { cx: x, cy: y, r: r, fill: col, 'fill-opacity': cl.indexOf('c0') >= 0 ? 1 : .88 }, n);
      else el('rect', { x: x - r, y: y - r, width: 2 * r, height: 2 * r, rx: 1.5, fill: col }, n);
      if (txt) {
        var dre = Math.cos(a) >= -0.01, c0 = cl.indexOf('c0') >= 0;
        var t = el('text', { x: c0 ? x : x + (dre ? r + FS * .4 : -r - FS * .4), y: c0 ? y + r + FS * 1.5 : y + FS / 3, 'text-anchor': c0 ? 'middle' : dre ? 'start' : 'end' }, n);
        t.textContent = txt;
      }
      return n;
    }
    function branca(g, x0, y0, x1, y1, col, w) {
      var mx = (x0 + x1) / 2, my = (y0 + y1) / 2, k = .18;
      el('path', { 'class': 'br', d: 'M' + x0 + ' ' + y0 + ' Q' + (mx - (y1 - y0) * k) + ' ' + (my + (x1 - x0) * k) + ' ' + x1 + ' ' + y1, stroke: col, 'stroke-width': w, 'stroke-opacity': .55 }, g);
    }
    var rCarp = function (n) { return (7 + 3.2 * Math.log2(n + 1)) * FS / 15; };
    /* Les mides del dibuix segons la mida de la caixa a la pantalla. */
    function mides() {
      var r = svg.getBoundingClientRect(), cw = r.width || 900, ch = r.height || 640;
      ESTRET = cw < 600;
      W = ESTRET ? 640 : 1000; H = Math.round(W * ch / cw);
      CX = W / 2; CY = H / 2;
      var m = Math.min(W, H);
      R1 = m * (ESTRET ? .26 : .28); R2 = m * (ESTRET ? .4 : .42);
      FS = (ESTRET ? 13 : 14) * W / cw;
    }

    function pinta(entra) {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      mides();
      var g = el('g', { 'class': entra ? 'ent' : '', style: 'font-size:' + FS.toFixed(1) + 'px;transform-origin:' + CX + 'px ' + CY + 'px' }, svg);
      /* Els fitxers d'aquesta carpeta: sols si són pocs; si no, un sol node que
         porta a la llista de sota, perquè no tapin les carpetes. */
      var cs = fills(ara), fs = ara.fitxers.slice().sort();
      var items = cs.map(function (c) { return { c: c, w: 1 + .35 * Math.log2(c.n + 1) }; });
      if (fs.length <= SOLTS) items = items.concat(fs.map(function (f) { return { f: f, w: 1 }; }));
      else items.push({ mes: fs.length, w: 1.4 });
      var tot = items.reduce(function (s, i) { return s + i.w; }, 0) || 1, a = -Math.PI / 2;
      var colC = ara.ruta ? colDe(ara.ruta) : '#15130f', escala = items.length > 26 ? .85 : 1;
      items.forEach(function (it) {
        var span = it.w / tot * 2 * Math.PI, am = a + span / 2, p = pol(R1, am);
        if (it.c) {
          var col = colDe(it.c.ruta), r = rCarp(it.c.n);
          branca(g, CX, CY, p[0], p[1], col, Math.max(2, Math.min(10, Math.sqrt(it.c.n))));
          /* Els fills de la carpeta, més petits, dins del seu tros d'arc. */
          var sub = fills(it.c).slice(0, MAX2), sf = it.c.fitxers.length, ns = sub.length + (sf ? 1 : 0);
          sub.forEach(function (s, k) {
            var a2 = a + span * (k + .5) / Math.max(ns, 1), q = pol(R2, a2), r2 = Math.min((4 + 2 * Math.log2(s.n + 1)) * FS / 15, R2 * span / Math.max(ns, 1) * .42);
            branca(g, p[0], p[1], q[0], q[1], col, 1.6);
            node(g, q[0], q[1], a2, r2, !ESTRET && span / Math.max(ns, 1) > .07 ? curt(s.nom, 18) : '', 'n2', s.ruta, true, col);
          });
          if (sf) { var a3 = a + span * (ns - .5) / ns, q3 = pol(R2, a3); branca(g, p[0], p[1], q3[0], q3[1], col, 1); node(g, q3[0], q3[1], a3, 3.5 * FS / 15, !ESTRET && span / ns > .07 ? sf + ' fitx.' : '', 'n2', null, false, col); }
          node(g, p[0], p[1], am, r, (span > (ESTRET ? .16 : .06) || r > 14) ? curt(it.c.nom, ESTRET ? 12 : 22) + ' · ' + it.c.n : '', 'c1', it.c.ruta, true, col);
        } else if (it.f) {
          var d = docs[it.f], q4 = pol(R1 * .8, am);
          branca(g, CX, CY, q4[0], q4[1], d || colC, 1.2);
          node(g, q4[0], q4[1], am, (d ? 6 : 4.5) * FS / 15, curt(it.f.split('/').pop(), 24), 'f', it.f, false, d || '#8a8474');
        } else {
          var q5 = pol(R1 * .8, am); branca(g, CX, CY, q5[0], q5[1], colC, 1.5);
          node(g, q5[0], q5[1], am, 7 * FS / 15, it.mes + ' fitxers (llista a sota)', 'f', 'llista:', false, '#8a8474');
        }
        a += span;
      });
      var cen = node(g, CX, CY, Math.PI / 2, 26 * escala * FS / 15, (ara.nom || repo.split('/')[1]) + ' · ' + ara.n, 'c0', ara.ruta ? (ara.pare.ruta || '') : null, true, colC);
      if (ara.pare) cen.setAttribute('aria-label', 'Torna a ' + (ara.pare.nom || repo));
      vb = [0, 0, W, H]; posa();
      pintaCami(); pintaAguila(); pintaLlista(cs, ara.fitxers.slice().sort());
    }

    function pintaCami() {
      var t = [], c = ara; while (c) { t.unshift(c); c = c.pare; }
      cami.innerHTML = t.map(function (c, i) {
        return (i ? '<span aria-hidden="true">›</span>' : '') + '<button type="button" data-r="' + esc(c.ruta) + '"' + (c === ara ? ' aria-current="page"' : '') + '>' + esc(i ? c.nom : repo) + '</button>';
      }).join('');
    }
    /* La vista d'àguila: tot el repositori en anells (un sunburst), tres nivells. */
    function pintaAguila() {
      while (ag.firstChild) ag.removeChild(ag.firstChild);
      var ANELLS = [[18, 46], [48, 72], [74, 96]];
      function arc(r0, r1, a0, a1) {
        var gran = a1 - a0 > Math.PI ? 1 : 0, p = function (r, a) { return (r * Math.cos(a)).toFixed(2) + ' ' + (r * Math.sin(a)).toFixed(2); };
        if (a1 - a0 >= 2 * Math.PI - 1e-6) a1 = a0 + 2 * Math.PI - 1e-3;
        return 'M' + p(r1, a0) + ' A' + r1 + ' ' + r1 + ' 0 ' + gran + ' 1 ' + p(r1, a1) + ' L' + p(r0, a1) + ' A' + r0 + ' ' + r0 + ' 0 ' + gran + ' 0 ' + p(r0, a0) + 'Z';
      }
      el('circle', { r: 16, fill: ara === A ? '#15130f' : '#8a8474', 'data-r': '', style: 'cursor:pointer' }, ag);
      (function anell(c, nv, a0, a1) {
        if (nv >= ANELLS.length) return;
        var a = a0; fills(c).forEach(function (f) {
          var s = f.n / Math.max(A.n, 1) * 2 * Math.PI; if (s < .004) { a += (a1 - a0) * f.n / c.n; return; }
          var b = a + (a1 - a0) * f.n / c.n, on = ara === f || (ara.ruta.indexOf(f.ruta + '/') === 0);
          var p = el('path', { d: arc(ANELLS[nv][0], ANELLS[nv][1], a, b), fill: colDe(f.ruta), 'fill-opacity': on ? 1 : .45 - nv * .08, 'data-r': f.ruta, 'class': ara === f ? 'on' : '' }, ag);
          el('title', {}, p).textContent = f.ruta + ' · ' + f.n;
          anell(f, nv + 1, a, b); a = b;
        });
      })(A, 0, -Math.PI / 2, 3 * Math.PI / 2);
    }
    function pintaLlista(cs, fs) {
      res.innerHTML = '<b>' + esc(ara.ruta || repo) + '</b> · ' + cs.length + (cs.length === 1 ? ' carpeta' : ' carpetes') + ' · ' + fs.length + (fs.length === 1 ? ' fitxer' : ' fitxers') +
        (ara !== A ? ' · ' + ara.n + ' en total' : '') + ' · <a href="' + esc(gh(ara.ruta, true)) + '" target="_blank" rel="noopener">obre-la a GitHub</a>';
      llista.innerHTML = cs.map(function (c) { return '<li style="--c:' + colDe(c.ruta) + '"><i></i><button type="button" data-r="' + esc(c.ruta) + '">' + esc(c.nom) + '/</button> <span class="ar-m">' + c.n + '</span></li>'; }).join('') +
        fs.map(function (f) { var d = docs[f]; return '<li style="--c:' + (d || 'transparent') + '"><i></i><a href="' + esc(gh(f)) + '" target="_blank" rel="noopener">' + esc(f.split('/').pop()) + '</a>' + (d ? ' <span class="ar-m">· document del cervell</span>' : '') + '</li>'; }).join('');
    }

    function ves(ruta, quiet) {
      ruta = String(ruta || '').replace(/\/$/, '');
      var n = nodeDe[ruta]; if (!n) n = A;
      var entra = n !== ara; ara = n; pinta(entra);
      if (!quiet && op.alCanvi) op.alCanvi(ara.ruta);
    }
    function obre(r, carpeta) {
      if (r === 'llista:') llista.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (carpeta) ves(r);
      else window.open(gh(r), '_blank', 'noopener');
    }
    function tria(e) {
      var z = e.target.closest('[data-z]');
      if (z) { var k = z.getAttribute('data-z'); if (k === 'mes') zoom(1.3); else if (k === 'menys') zoom(1 / 1.3); else if (k === 'tot') { vb = [0, 0, W, H]; posa(); } else ves(''); return; }
      var t = e.target.closest('[data-r]'); if (!t || mogut) return;
      var r = t.getAttribute('data-r');
      if (t.closest('.ar-l') || t.closest('.ar-cami') || t.closest('.ar-ag')) return ves(r);
      obre(r, t.getAttribute('data-c') === '1');
    }
    caixa.addEventListener('click', tria);
    svg.addEventListener('keydown', function (e) {
      var t = e.target.closest && e.target.closest('[data-r]');
      if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); obre(t.getAttribute('data-r'), t.getAttribute('data-c') === '1'); }
      else if (e.key === 'Backspace' && ara.pare) { e.preventDefault(); ves(ara.pare.ruta); }
    });
    ves(op.ruta || '', true);
    return { ves: ves, treu: function () { caixa.removeEventListener('click', tria); caixa.innerHTML = ''; caixa.classList.remove('ar'); } };
  }

  var api = { munta: munta, arbre: arbre };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.CervellArbre = api;
})(typeof self !== 'undefined' ? self : this);
