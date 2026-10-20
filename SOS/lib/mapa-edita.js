/* Connecta i mou · el mapa de valor fet a mà
 * ─────────────────────────────────────────────────────────────────────────────
 * Dibuixar un flux és enllaçar dos rols, i això es fa amb el dit, no amb dos
 * desplegables. Amb «✎ Connecta i mou» activat, damunt de l'SVG que ja ha
 * dibuixat l'app (cada rol porta `data-rol`, cada flux `data-ex`):
 *
 *   · arrossega d'un rol a un altre     → un flux nou de l'un a l'altre
 *   · toca un rol i després un altre    → el mateix, per a qui no arrossega
 *   · mantén premut un rol i arrossega  → el canvia de lloc
 *   · toca un espai buit                → un rol nou allà
 *   · toca un flux                      → canvia-li la mena o el nom, o treu-lo
 *
 * Amb el teclat: Tab fins al rol, Retorn per triar-lo, i Retorn a un altre.
 * Aquí només hi ha el gest; desar és de l'app (`op`), que té les eines.
 *
 *   MapaEdita.activa(svg, { flux(a, b), mou(id, x, y), rol(x, y), edita(exId), pista(txt) }) → { treu }
 *   MapaEdita.form(nomA, nomB, { mena, nom, torna }) → { html, llegeix(arrel) }
 */
(function () {
  var NS = 'http://www.w3.org/2000/svg', estil = false;
  function posaEstil() {
    if (estil) return; estil = true;
    var s = document.createElement('style');
    s.textContent =
      'svg.me-on{touch-action:none;cursor:crosshair;user-select:none;-webkit-user-select:none}' +
      'svg.me-on g[data-rol]{cursor:grab}svg.me-on g[data-rol].me-mou{cursor:grabbing}' +
      'svg.me-on g[data-rol] circle{stroke-dasharray:4 3}' +
      'svg.me-on g[data-rol].me-a circle{stroke-width:4;stroke-dasharray:none;filter:drop-shadow(0 0 6px currentColor)}' +
      'svg.me-on g[data-rol].me-b circle{stroke-width:4;stroke-dasharray:none}' +
      '.me-l{stroke:var(--text);stroke-width:2.2;stroke-dasharray:6 5;fill:none;pointer-events:none;marker-end:url(#arrT)}' +
      '.me-xips{display:flex;flex-wrap:wrap;gap:.4rem;margin:.4rem 0 .8rem}' +
      '.me-xip{min-height:40px;padding:.3rem .8rem;border-radius:999px;border:1px solid var(--border);background:var(--panel);color:var(--text);font:inherit;font-size:var(--t0);cursor:pointer}' +
      '.me-xip.sel{border-color:var(--indigo);background:var(--indigo-dim);font-weight:600}' +
      '.me-f label{display:block;margin:.5rem 0 .25rem;font-size:var(--t0);color:var(--muted)}.me-f input[type=text]{width:100%}' +
      '.me-t{display:flex;gap:.5rem;align-items:center;margin-top:.8rem}';
    document.head.appendChild(s);
  }

  function punt(svg, ev) {
    var m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 };
    var p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY;
    p = p.matrixTransform(m.inverse()); return { x: p.x, y: p.y };
  }
  function centre(g) { var c = g.querySelector('circle'); return { x: +c.getAttribute('cx'), y: +c.getAttribute('cy') }; }
  function rolSota(ev) {
    var e = document.elementFromPoint(ev.clientX, ev.clientY);
    return e && e.closest ? e.closest('g[data-rol]') : null;
  }

  function activa(svg, op) {
    posaEstil(); op = op || {};
    var pista = op.pista || function () {};
    svg.classList.add('me-on');
    var A = null, ges = null;
    svg.querySelectorAll('g[data-rol]').forEach(function (g) {
      g.setAttribute('tabindex', 0); g.setAttribute('role', 'button');
      g.setAttribute('aria-label', 'Rol ' + (g.querySelector('title') || {}).textContent + ': Retorn per connectar-lo');
    });
    function tria(g) {
      if (A && A !== g) { var a = A.getAttribute('data-rol'); desfes(); op.flux && op.flux(a, g.getAttribute('data-rol')); return; }
      if (A === g) { desfes(); pista('Toca un rol per començar un flux, o arrossega d\'un rol a un altre.'); return; }
      A = g; g.classList.add('me-a'); pista('Ara toca el rol que el rep.');
    }
    function desfes() { if (A) A.classList.remove('me-a'); A = null; }

    function baixa(ev) {
      if (ev.button > 0) return;
      var g = ev.target.closest('g[data-rol]'), ex = ev.target.closest('path[data-ex]');
      var p = punt(svg, ev);
      ges = { g: g, ex: ex, p0: p, c0: { x: ev.clientX, y: ev.clientY }, mode: null, id: ev.pointerId };
      if (g) {
        ges.c = centre(g);
        ges.llarg = setTimeout(function () {
          if (ges && !ges.mode) { ges.mode = 'mou'; g.classList.add('me-mou'); if (navigator.vibrate) navigator.vibrate(15); pista('Mou-lo on vulguis i deixa\'l anar.'); }
        }, 450);
      }
      try { svg.setPointerCapture(ev.pointerId); } catch (e) {}
    }
    function mou(ev) {
      if (!ges || ev.pointerId !== ges.id) return;
      var d = Math.hypot(ev.clientX - ges.c0.x, ev.clientY - ges.c0.y), p = punt(svg, ev);
      if (!ges.mode && d > 8 && ges.g) {
        clearTimeout(ges.llarg); ges.mode = 'uneix';
        ges.l = document.createElementNS(NS, 'line'); ges.l.setAttribute('class', 'me-l');
        ges.l.setAttribute('x1', ges.c.x); ges.l.setAttribute('y1', ges.c.y);
        svg.appendChild(ges.l); desfes(); ges.g.classList.add('me-a');
      }
      if (ges.mode === 'uneix') {
        ges.l.setAttribute('x2', p.x); ges.l.setAttribute('y2', p.y);
        var b = rolSota(ev);
        svg.querySelectorAll('g.me-b').forEach(function (x) { if (x !== b) x.classList.remove('me-b'); });
        if (b && b !== ges.g) b.classList.add('me-b');
      } else if (ges.mode === 'mou') {
        ges.g.setAttribute('transform', 'translate(' + (p.x - ges.p0.x) + ' ' + (p.y - ges.p0.y) + ')');
      }
    }
    function puja(ev) {
      if (!ges || ev.pointerId !== ges.id) return;
      var G = ges; ges = null; clearTimeout(G.llarg);
      try { svg.releasePointerCapture(ev.pointerId); } catch (e) {}
      var p = punt(svg, ev);
      if (G.mode === 'uneix') {
        G.l.remove(); G.g.classList.remove('me-a');
        var b = rolSota(ev); svg.querySelectorAll('g.me-b').forEach(function (x) { x.classList.remove('me-b'); });
        if (b && b !== G.g) op.flux && op.flux(G.g.getAttribute('data-rol'), b.getAttribute('data-rol'));
        else pista('Deixa anar la línia damunt d\'un altre rol per crear el flux.');
      } else if (G.mode === 'mou') {
        G.g.classList.remove('me-mou');
        op.mou && op.mou(G.g.getAttribute('data-rol'), Math.round(G.c.x + p.x - G.p0.x), Math.round(G.c.y + p.y - G.p0.y));
      } else if (G.g) tria(G.g);
      else if (G.ex) { desfes(); op.edita && op.edita(G.ex.getAttribute('data-ex')); }
      else if (A) { desfes(); pista('Toca un rol per començar un flux, o un espai buit per afegir-ne un.'); }
      else op.rol && op.rol(Math.round(p.x), Math.round(p.y));
    }
    function cancel() { if (!ges) return; clearTimeout(ges.llarg); if (ges.l) ges.l.remove(); if (ges.g) { ges.g.classList.remove('me-a', 'me-mou'); ges.g.removeAttribute('transform'); } ges = null; }
    /* En mode edició, cap clic no obre res: ni el seguiment d'un flux ni la
       pàgina d'origen d'un rol. El gest ja l'ha llegit el pointerup. */
    function para(ev) { ev.stopPropagation(); ev.preventDefault(); }
    function tecla(ev) {
      if (ev.key === 'Escape') { desfes(); return; }
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      var g = ev.target.closest && ev.target.closest('g[data-rol]'); if (!g) return;
      para(ev); tria(g);
    }
    svg.addEventListener('pointerdown', baixa);
    svg.addEventListener('pointermove', mou);
    svg.addEventListener('pointerup', puja);
    svg.addEventListener('pointercancel', cancel);
    svg.addEventListener('click', para, true);
    svg.addEventListener('keydown', tecla, true);
    pista('Arrossega d\'un rol a un altre per crear un flux, o toca\'ls un rere l\'altre. Mantén premut per moure\'l. Toca un espai buit per afegir un rol.');
    return {
      treu: function () {
        cancel(); desfes(); svg.classList.remove('me-on');
        svg.removeEventListener('pointerdown', baixa); svg.removeEventListener('pointermove', mou);
        svg.removeEventListener('pointerup', puja); svg.removeEventListener('pointercancel', cancel);
        svg.removeEventListener('click', para, true); svg.removeEventListener('keydown', tecla, true);
      }
    };
  }

  /* El pas ràpid després d'enllaçar: tangible o intangible, què hi flueix i,
     com que en una xarxa de valor gairebé tot torna, si torna alguna cosa. */
  var SUG = {
    tangible: ['Diners', 'Servei', 'Producte', 'Factura', 'Encàrrec', 'Informe'],
    intangible: ['Confiança', 'Saber', 'Recomanació', 'Opinió', 'Visibilitat', 'Contactes']
  };
  function e(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function form(nA, nB, v) {
    posaEstil(); v = v || {};
    var mena = v.mena === 'intangible' ? 'intangible' : 'tangible';
    var html = '<div class="me-f" data-mena="' + mena + '"><h2>' + e(nA) + ' → ' + e(nB) + '</h2>' +
      '<label>Què és?</label><div class="me-xips me-mena">' +
      '<button type="button" class="me-xip' + (mena === 'tangible' ? ' sel' : '') + '" data-m="tangible">📦 Tangible · es toca o es paga</button>' +
      '<button type="button" class="me-xip' + (mena === 'intangible' ? ' sel' : '') + '" data-m="intangible">✨ Intangible · confiança, saber</button></div>' +
      '<label for="meNom">Què flueix?</label><input type="text" id="meNom" maxlength="40" value="' + e(v.nom || '') + '" placeholder="p. ex. ' + SUG[mena][0] + '">' +
      '<div class="me-xips me-sug"></div>' +
      (v.torna == null ? '' : '<label class="me-t"><input type="checkbox" id="meTorna"' + (v.torna ? ' checked' : '') + '> I ' + e(nB) + ' li torna alguna cosa</label>' +
        '<input type="text" id="meTornaNom" maxlength="40" placeholder="Què li torna? (opcional)"' + (v.torna ? '' : ' hidden') + '>') + '</div>';
    return {
      html: html,
      llegeix: function (arrel) {
        var f = arrel.querySelector('.me-f'), m = f.getAttribute('data-mena'), t = arrel.querySelector('#meTorna');
        var tn = (arrel.querySelector('#meTornaNom') || {}).value || '';
        return { mena: m, nom: arrel.querySelector('#meNom').value.trim(), torna: !!(t && t.checked), tornaMena: m, tornaNom: tn.trim() };
      },
      lliga: function (arrel) {
        var f = arrel.querySelector('.me-f'), sug = arrel.querySelector('.me-sug'), nom = arrel.querySelector('#meNom');
        function xips() {
          var m = f.getAttribute('data-mena');
          sug.innerHTML = SUG[m].map(function (s) { return '<button type="button" class="me-xip" data-s="' + s + '">' + s + '</button>'; }).join('');
          nom.placeholder = 'p. ex. ' + SUG[m][0];
        }
        xips();
        arrel.querySelector('.me-mena').addEventListener('click', function (ev) {
          var b = ev.target.closest('[data-m]'); if (!b) return;
          f.setAttribute('data-mena', b.getAttribute('data-m'));
          arrel.querySelectorAll('.me-mena .me-xip').forEach(function (x) { x.classList.toggle('sel', x === b); });
          xips();
        });
        sug.addEventListener('click', function (ev) { var b = ev.target.closest('[data-s]'); if (b) { nom.value = b.getAttribute('data-s'); nom.focus(); } });
        var t = arrel.querySelector('#meTorna');
        if (t) t.addEventListener('change', function () { arrel.querySelector('#meTornaNom').hidden = !t.checked; });
        setTimeout(function () { nom.focus(); }, 30);
      }
    };
  }

  window.MapaEdita = { activa: activa, form: form };
})();
