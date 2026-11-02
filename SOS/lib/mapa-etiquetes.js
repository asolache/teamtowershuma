/* El nom de cada entregable, damunt del mapa (02/11/2026). Àlvaro: «ara es
   veuen els rols i les transaccions però no el nom dels entregables; que es
   vegi alguna cosa, i si és molt llarg, en posar-hi el ratolí o el dit en una
   pantalla tàctil, que se'n vegi el detall».

   Una sola peça per a tots els mapes de valor que es dibuixen en SVG:
     · cada fletxa porta una etiqueta curta («Comanda», «Dades fiscals»);
     · les que no hi caben sense trepitjar-se s'amaguen, i surten quan la seva
       fletxa s'encén (en triar un rol, una prioritat o el lliurament que toca);
     · en passar-hi el ratolí, en tocar-la o en arribar-hi amb el teclat, una
       fitxa diu el lliurament sencer: qui el dona, qui el rep i de quina mena.

   No declara cap dada ni cap estat. El mapa encén les fletxes amb les classes
   que ja tenia (`on`, `fo`, `pas`) i aquí només se'n segueix el rastre.
     · MapaEtiquetes.posa(svg, items)  items: [{ p, text, de, a, mena, curt }]
     · MapaEtiquetes.llegeix(svg)      els treu dels <title> «A → B: text (mena)»
   S'engega sol sobre els svg `.mv-svg` i `[data-etiquetes]` quan es veuen. */
(function (g) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var MAX = 22;
  var MENA = { ca: { t: 'tangible', i: 'intangible' }, es: { t: 'tangible', i: 'intangible' } };
  var ART = /^(?:(?:els seus|les seves|el seu|la seva|els|les|el|la|los|las|lo|uns|unes|unos|unas|un|una|sus|su)\s+|l')/i;
  var BUIDA = /\s+(de|del|d'\S*|la|el|les|els|los|las|a|i|y|amb|con|cada|qui|quien|què|qué|per|pel|para|por|que)$/i;
  var LLIGA = /\s(amb|con|i|y|des de|desde|per a|para|en|al|que|on|donde|sense|sin|perquè|porque|a)\s/i;

  /* «la consulta de disponibilitat amb les seves opcions…» → «Consulta de
     disponibilitat»: fins a la primera coma o conjunció, sense l'article. */
  function curt(s) {
    var t = String(s || '').replace(/\s*\((tangible|intangible)\)\s*$/i, '').split(/[,:;]| — | – /)[0].trim();
    var m = t.match(LLIGA);
    if (m && m.index > 3) t = t.slice(0, m.index);
    for (var k = 0; k < 2; k++) if (!/^(el|lo)\s+que\s/i.test(t)) t = t.replace(ART, '');
    /* Massa llarg: primer es treu el complement («Pagament de l'esdeveniment»
       → «Pagament»); si no n'hi ha, es talla per paraula i es diu amb «…». */
    if (t.length > MAX) {
      var tall = -1, re = /\s(?:de|del)\s|\sd'/g, x;
      while ((x = re.exec(t)) && x.index <= MAX) tall = x.index;
      if (tall > 3) t = t.slice(0, tall);
      else { var w = t.slice(0, MAX + 1).split(' '); w.pop(); t = w.join(' ') || t.slice(0, MAX); while (BUIDA.test(t)) t = t.replace(BUIDA, ''); t += '…'; }
    }
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  function ll() { return document.documentElement.lang === 'es' ? 'es' : 'ca'; }
  function el(tag, at, txt) {
    var e = document.createElementNS(NS, tag);
    for (var k in at || {}) e.setAttribute(k, at[k]);
    if (txt != null) e.textContent = txt;
    return e;
  }

  var estil = false;
  function posaEstil() {
    if (estil) return; estil = true;
    var s = document.createElement('style');
    s.textContent =
      '.me-g,.me-l{pointer-events:none}.me-l{cursor:help;opacity:0;transition:opacity .3s}' +
      '.me-l.cap{opacity:.92;pointer-events:auto}.me-l.on{opacity:1;pointer-events:auto}' +
      '.me-dim .me-l.cap{opacity:0;pointer-events:none}.me-dim .me-l.on{opacity:1;pointer-events:auto}' +
      '.me-l rect{fill:var(--card,var(--pap,#fff));stroke-width:1.2}' +
      '.me-l.on rect{stroke-width:2.2}' +
      '.me-l text{font-family:var(--sans,system-ui,sans-serif);font-weight:600;fill:var(--text,var(--tin,#1d1d1f));text-anchor:middle;dominant-baseline:central}' +
      '.me-l:focus{outline:none}.me-l:focus-visible rect{stroke:var(--indigo,#3b3fb6);stroke-width:2.6}' +
      '.me-hit{fill:none;stroke:transparent;pointer-events:stroke;cursor:help}' +
      '.me-tip{position:fixed;z-index:60;max-width:min(20rem,calc(100vw - 2rem));padding:.55rem .7rem;border-radius:10px;' +
        'background:var(--card,var(--pap,#fff));color:var(--text,var(--tin,#1d1d1f));border:1px solid var(--border-strong,var(--vora2,#bbb));' +
        'border-left:4px solid var(--me-c,#888);box-shadow:0 8px 24px rgba(0,0,0,.16);font:500 .9rem/1.4 var(--sans,system-ui,sans-serif);pointer-events:none}' +
      '.me-tip small{display:block;font:500 .75rem/1.35 var(--mono,ui-monospace,monospace);color:var(--muted,var(--tin3,#666));margin-bottom:.25rem}' +
      '.me-tip[hidden]{display:none}' +
      '@media (prefers-reduced-motion:reduce){.me-l{transition:none}}';
    document.head.appendChild(s);
  }

  /* Una sola fitxa per pàgina: la del lliurament que es mira ara. */
  var tip = null, fixat = null;
  function fitxa() {
    if (tip) return tip;
    tip = document.createElement('div'); tip.className = 'me-tip'; tip.hidden = true; tip.setAttribute('role', 'tooltip');
    document.body.appendChild(tip);
    document.addEventListener('pointerdown', function (e) { if (fixat && !(e.target.closest && e.target.closest('.me-l,.me-hit'))) amaga(true); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') amaga(true); });
    g.addEventListener('scroll', function () { amaga(true); }, { passive: true });
    return tip;
  }
  function ensenya(it, ancora) {
    var t = fitxa(), L = ll();
    t.textContent = '';
    var cap = document.createElement('small');
    cap.textContent = [it.de && it.a ? it.de + ' → ' + it.a : '', it.mena ? MENA[L][it.mena] : ''].filter(Boolean).join(' · ');
    if (cap.textContent) t.appendChild(cap);
    t.appendChild(document.createTextNode(it.text.charAt(0).toUpperCase() + it.text.slice(1)));
    t.style.setProperty('--me-c', it.color || '#888');
    t.hidden = false;
    var r = ancora.getBoundingClientRect(), w = t.offsetWidth, h = t.offsetHeight;
    var x = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2));
    var y = r.top - h - 8; if (y < 8) y = r.bottom + 8;
    t.style.left = x + 'px'; t.style.top = y + 'px';
  }
  function amaga(tot) { if (!tip) return; if (fixat && !tot) return; fixat = null; tip.hidden = true; }

  function capsa(a, b) { return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h; }

  function posa(svg, items) {
    if (!svg || !items || !items.length || !svg.getBoundingClientRect) return null;
    posaEstil();
    if (svg._me) svg._me.treu();
    var vb = svg.viewBox && svg.viewBox.baseVal, W = vb && vb.width || 700;
    var gL = el('g', { class: 'me-g', 'aria-hidden': 'false' }), hits = [];
    svg.appendChild(gL);
    items.forEach(function (it) {
      it.curt = it.curt || curt(it.text);
      it.color = it.color || (getComputedStyle(it.p).stroke || '').replace(/^none$/, '') || '#888';
      var hit = el('path', { class: 'me-hit', d: it.p.getAttribute('d') });
      if (it.p.getAttribute('transform')) hit.setAttribute('transform', it.p.getAttribute('transform'));
      it.p.parentNode.insertBefore(hit, it.p.nextSibling); hits.push(hit); it.hit = hit;
      var lb = el('g', { class: 'me-l', tabindex: '0', role: 'img', 'aria-label': (it.de ? it.de + ' → ' + it.a + ': ' : '') + it.text });
      lb.appendChild(el('rect', { rx: 6, stroke: it.color }));
      lb.appendChild(el('text', {}, it.curt));
      gL.appendChild(lb); it.lb = lb;
      var entra = function (e) { if (e.pointerType !== 'touch' && !fixat) ensenya(it, lb); };
      var surt = function (e) { if (e.pointerType !== 'touch') amaga(); };
      var toca = function (e) { e.stopPropagation(); if (fixat === it) { amaga(true); return; } fixat = it; ensenya(it, lb); };
      [lb, hit].forEach(function (n) {
        n.addEventListener('pointerenter', entra); n.addEventListener('pointerleave', surt); n.addEventListener('click', toca);
      });
      lb.addEventListener('focus', function () { ensenya(it, lb); });
      lb.addEventListener('blur', function () { amaga(true); });
    });

    /* La mida es tria perquè a la pantalla faci uns 11 px: en un mòbil el
       mapa s'encongeix i l'etiqueta creix dins del dibuix, i en caben menys. */
    function disposa() {
      var px = svg.getBoundingClientRect().width;
      if (!px) return false;
      var fs = Math.max(9, Math.min(24, (px < 520 ? 10 : 11.5) * W / px)), pad = fs * 0.45;
      var ocupat = [].slice.call(svg.querySelectorAll('.mv-n,.ma-n,.n,.ma-b,text')).filter(function (n) { return !n.closest('.me-g'); }).map(function (n) {
        try { var b = n.getBBox(); return { x: b.x, y: b.y, w: b.width, h: b.height }; } catch (e) { return null; }
      }).filter(function (b) { return b && b.w; });
      items.forEach(function (it) {
        var tx = it.lb.lastChild, rc = it.lb.firstChild;
        tx.setAttribute('font-size', fs.toFixed(1));
        var w = (tx.getComputedTextLength ? tx.getComputedTextLength() : it.curt.length * fs * 0.55) + pad * 2, h = fs + pad * 1.4;
        it.hit.setAttribute('stroke-width', (fs * 1.3).toFixed(1));
        var len = 0; try { len = it.p.getTotalLength(); } catch (e) { /* sense geometria */ }
        var millor = null, cap = false;
        [0.5, 0.4, 0.6, 0.32, 0.68].some(function (t) {
          if (!len) return true;
          var q = it.p.getPointAtLength(len * t), b = { x: q.x - w / 2, y: q.y - h / 2, w: w, h: h };
          if (!millor) millor = b;
          if (vb && vb.width && (b.x < vb.x || b.y < vb.y || b.x + w > vb.x + vb.width || b.y + h > vb.y + vb.height)) return false;
          if (!ocupat.some(function (o) { return capsa(b, o); })) { millor = b; cap = true; return true; }
          return false;
        });
        if (!millor) return;
        if (cap) ocupat.push(millor);
        it.lb.classList.toggle('cap', cap);
        rc.setAttribute('x', millor.x.toFixed(1)); rc.setAttribute('y', millor.y.toFixed(1));
        rc.setAttribute('width', w.toFixed(1)); rc.setAttribute('height', h.toFixed(1));
        tx.setAttribute('x', (millor.x + w / 2).toFixed(1)); tx.setAttribute('y', (millor.y + h / 2).toFixed(1));
      });
      return true;
    }

    /* El rastre de l'estat: el mapa encén fletxes i enfosqueix el dibuix amb
       les seves classes; l'etiqueta fa el mateix que la seva fletxa. */
    function on(p) {
      var c = p.classList, s = svg.classList, m = p.getAttribute('data-mena');
      return c.contains('on') || c.contains('fo') || c.contains('pas') ||
        (s.contains('mena-t') && m === 't') || (s.contains('mena-i') && m === 'i');
    }
    function segueix() {
      var s = svg.classList, dim = s.contains('ma-tria') || s.contains('focus') || s.contains('seq') || s.contains('mena');
      gL.classList.toggle('me-dim', dim);
      items.forEach(function (it) { it.lb.classList.toggle('on', on(it.p)); });
    }
    var mo = new MutationObserver(segueix);
    mo.observe(svg, { attributes: true, attributeFilter: ['class'], subtree: true });
    var ro = null, fet = disposa();
    if (!fet || 'ResizeObserver' in g) {
      var ultim = 0;
      ro = 'ResizeObserver' in g ? new ResizeObserver(function () {
        var w = svg.getBoundingClientRect().width; if (w && Math.abs(w - ultim) > 24) { ultim = w; disposa(); }
      }) : null;
      if (ro) ro.observe(svg);
    }
    segueix();
    var ctl = {
      items: items, disposa: disposa,
      treu: function () { mo.disconnect(); if (ro) ro.disconnect(); gL.remove(); hits.forEach(function (h) { h.remove(); }); amaga(true); svg._me = null; }
    };
    svg._me = ctl;
    return ctl;
  }

  /* Els mapes que ja porten el lliurament al <title> de cada fletxa
     («Qui fa el vi → Qui rep i explica: el vi i la verema (tangible)»). */
  var TIT = /^\s*(.+?)\s*→\s*(.+?)\s*:\s*([\s\S]+?)\s*(?:\((tangible|intangible)\))?\s*$/i;
  function llegeix(svg) {
    return [].slice.call(svg.querySelectorAll('path.mv-f, path[data-lliurament]')).map(function (p) {
      var t = p.getAttribute('data-lliurament'), m = null;
      if (!t) { var ti = p.querySelector('title'); m = ti && ti.textContent.match(TIT); if (!m) return null; }
      var mena = p.getAttribute('data-mena') || (m && m[4] ? m[4].charAt(0).toLowerCase() : '');
      return { p: p, text: t || m[3], de: m ? m[1] : p.getAttribute('data-de'), a: m ? m[2] : p.getAttribute('data-a'),
        mena: mena === 't' || mena === 'tangible' ? 't' : mena ? 'i' : '', curt: p.getAttribute('data-curt') };
    }).filter(Boolean);
  }

  function engega() {
    var tots = [].slice.call(document.querySelectorAll('svg.mv-svg, svg[data-etiquetes]'));
    if (!tots.length) return;
    var pinta = function (s) { s._meFet = 1; posa(s, llegeix(s)); };
    var io = 'IntersectionObserver' in g ? new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && !e.target._meFet) pinta(e.target); });
    }, { rootMargin: '200px' }) : null;
    tots.forEach(function (s) { if (io) io.observe(s); else pinta(s); });
    /* La pàgina tradueix els <title> en canviar de llengua: es tornen a llegir. */
    new MutationObserver(function () { setTimeout(function () { tots.forEach(function (s) { if (s._meFet) pinta(s); }); }, 0); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  g.MapaEtiquetes = { posa: posa, llegeix: llegeix, curt: curt };
  if (typeof module !== 'undefined' && module.exports) module.exports = g.MapaEtiquetes;
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', engega); else engega(); }
})(typeof window !== 'undefined' ? window : globalThis);
