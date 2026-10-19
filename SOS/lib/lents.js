/* Les lents del mapa de valor
 * ─────────────────────────────────────────────────────────────────────────────
 * El mateix mapa, mirat amb una altra pregunta. No hi ha una pantalla per
 * metodologia: hi ha una xarxa, i cada lent la torna a pintar.
 *
 *   · Valor     qui dona què a qui (el mapa de sempre, sense res a sobre)
 *   · Torre     la pinya: cada rol és un pilar amb quatre rengles (`lib/pinya.js`)
 *   · Equip     qui porta cada rol, i on es concentra la càrrega i la cura
 *   · Repartiment quina part del que ha circulat surt de cada rol (llesques i hores)
 *   · Saber     si l'equip sap fer el que cada rol demana, i el cervell del SOS
 *
 * L'app compta (té les eines: el registre, les cures, els perfils) i aquí només
 * es pinta damunt l'SVG que ja ha dibuixat: cada rol porta `data-rol` i cada
 * flux `data-ex`. La vista del cervell és la de `SOS/cervell/pla.js`, que es
 * carrega quan es tria «Saber»: la mateixa de la pàgina del cervell, no una còpia.
 *
 *   Lents.aplica(svg, lent, D, peu, caixa)
 *     D = { rols: [{id, nom, qui, porta, orfes, ll, h, cal, falta}], fluxos: [{id, de, a, mena}], equip }
 */
(function () {
  var NS = 'http://www.w3.org/2000/svg', estil = false;
  function posaEstil() {
    if (estil) return; estil = true;
    var s = document.createElement('style');
    s.textContent =
      '.ln-b{font:600 10px "JetBrains Mono",monospace;pointer-events:none;paint-order:stroke;stroke:var(--bg-panel,#f3f0e8);stroke-width:3px;stroke-linejoin:round}' +
      '.ln-h{pointer-events:none;fill:var(--gold);fill-opacity:.22}' +
      '.ln-ok{stroke:var(--green)!important}.ln-mal{stroke:var(--orange)!important}.ln-res{stroke:var(--muted)!important;stroke-dasharray:3 3}' +
      '.ln-tb-ok{fill:var(--green)}.ln-tb-mal{fill:var(--orange)}.ln-tb-res{fill:var(--muted)}' +
      'svg.ln-on path[data-ex]{stroke-opacity:.35}' +
      'svg.ln-torre path.ln-vent{stroke:var(--purple)!important;stroke-width:3!important;stroke-opacity:.9;stroke-dasharray:none}' +
      'svg.ln-torre path.ln-primera{stroke:var(--green)!important;stroke-opacity:.8}' +
      'svg.ln-torre path.ln-lateral{stroke:var(--muted)!important;stroke-opacity:.6}' +
      'svg.ln-on .fv-pols{display:none}' +
      '.ln-cv{margin-top:.8rem}.ln-cv[hidden]{display:none}';
    document.head.appendChild(s);
  }

  function mk(t, at, p) { var e = document.createElementNS(NS, t); for (var k in at) e.setAttribute(k, at[k]); if (p) p.appendChild(e); return e; }
  function pct(x) { return Math.round(x) + ' %'; }
  function i(n, u, p) { return n + ' ' + (n === 1 ? u : p); }

  /* Cada lent diu, per a cada rol, com està (ok, mal o res), què s'hi escriu a
     sota i, si cal, una aurèola; i una sola frase que es llegeix sota el mapa. */
  var LENTS = {
    torre: function (D, svg) {
      var Pi = window.Pinya;
      var fl = D.fluxos.map(function (f) { return { id: f.id, de: f.de, a: f.a, mena: f.mena }; });
      var lec = Pi.llegeix(D.rols, fl);
      fl.forEach(function (f) { var p = svg.querySelector('path[data-ex="' + f.id + '"]'); if (p) p.classList.add('ln-' + f.linia); });
      var carregat = {};
      lec.carregats.forEach(function (c) { carregat[c.pilar.node.id] = 1; });
      var per = {};
      lec.pilars.forEach(function (p) {
        var n = Pi.MENES.reduce(function (a, m) { return a + Math.min(p.per[m].length, p.te[m]); }, 0);
        per[p.node.id] = { e: !p.rebuts.length ? 'res' : (!p.per.vent.length || carregat[p.node.id]) ? 'mal' : 'ok', b: n + '/4' };
      });
      var sols = lec.sols.filter(function (p) { return p.rebuts.length; }).map(function (p) { return p.node.nom; });
      return { per: per, frase: 'La pinya té ' + i(D.rols.length, 'pilar', 'pilars') + ' i ' + lec.obertes + ' rengles, i ' +
        lec.ocupades + ' tenen algú. ' + (sols.length ? 'Sense cap vent, que vol dir que no lliguen amb cap altra àrea: ' + sols.join(', ') + '.'
        : 'Cada pilar que rep té almenys un vent: les àrees es lliguen entre elles.') +
        ' En lila, els vents: el que va i torna en menes diferents.' };
    },
    equip: function (D) {
      var per = {}, sense = [], carregats = [];
      D.rols.forEach(function (r) {
        if (!r.qui) { sense.push(r.nom); per[r.id] = { e: 'res', b: 'ningú' }; return; }
        var mal = r.porta > 1 || r.orfes > 0;
        if (mal && carregats.indexOf(r.qui) < 0) carregats.push(r.qui);
        per[r.id] = { e: mal ? 'mal' : 'ok', b: r.qui.length > 11 ? r.qui.slice(0, 10) + '…' : r.qui };
      });
      return { per: per, frase: (sense.length ? i(sense.length, 'rol no té', 'rols no tenen') + ' ningú que el porti. ' : 'Tots els rols tenen algú. ') +
        (carregats.length ? 'Porta massa, o deixaria algú sense cura si plegués: ' + carregats.join(', ') + '.' : 'Ningú no porta més d\'un rol.') };
    },
    repart: function (D) {
      /* Amb llesques, el que val cada aportació; sense, les vegades que ha
         circulat cada flux (els apunts i els fets de la xarxa real). */
      var ll = D.rols.some(function (r) { return r.ll; }), q = function (r) { return ll ? r.ll : r.n; };
      var tot = D.rols.reduce(function (a, r) { return a + q(r); }, 0), per = {};
      if (!tot) {
        D.rols.forEach(function (r) { per[r.id] = { e: 'res', b: '—' }; });
        return { per: per, frase: 'Encara no ha circulat res. Quan registris el que has fet triant el flux, aquí es veurà què aporta cada rol.' };
      }
      var top = D.rols.slice().sort(function (a, b) { return q(b) - q(a); })[0];
      D.rols.forEach(function (r) {
        var s = q(r) / tot * 100;
        per[r.id] = { e: s ? 'ok' : 'res', b: pct(s), h: s ? 4 + Math.sqrt(s) * 3.2 : 0 };
      });
      return { per: per, frase: ll
        ? top.nom + ' aporta el ' + pct(q(top) / tot * 100) + ' de les llesques' + (top.h ? ', amb ' + Math.round(top.h) + ' h al Banc de Temps' : '') + '. Surten dels mateixos apunts del registre.'
        : top.nom + ' fa circular el ' + pct(q(top) / tot * 100) + ' del que s\'ha mogut (' + i(q(top), 'cop', 'cops') + '). Quan hi hagi apunts al registre, es repartirà en llesques.' };
    },
    saber: function (D) {
      var per = {}, falta = [], sense = 0;
      D.rols.forEach(function (r) {
        if (!r.cal) { sense++; per[r.id] = { e: 'res', b: '?' }; return; }
        if (r.falta.length) { falta.push(r.nom + ' (' + r.falta.join(', ') + ')'); per[r.id] = { e: 'mal', b: 'falta ' + r.falta.length }; }
        else per[r.id] = { e: 'ok', b: '✓ ho sap' };
      });
      return { per: per, frase: (falta.length ? 'L\'equip encara no sap fer tot el que demanen: ' + falta.join('; ') + '. '
        : D.rols.length > sense ? 'L\'equip sap fer el que demana cada rol. ' : '') +
        (sense ? i(sense, 'rol no diu', 'rols no diuen') + ' què demana: obre\'l i marca-ho.' : '') };
    }
  };

  /* El cervell del SOS sota el mapa: el saber que hereta cada projecte. */
  var cervell = null;
  function script(src) {
    return new Promise(function (ok, ko) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
  }
  function carregaCervell() {
    return cervell || (cervell = (window.CerebroFuerzas ? Promise.resolve() : script('cervell/forces.js'))
      .then(function () { return window.CervellPla ? 0 : script('cervell/pla.js'); })
      .then(function () { return fetch('cervell/teamtowers.json'); })
      .then(function (r) { return r.json(); })
      .catch(function (e) { cervell = null; throw e; }));
  }
  function munta(caixa) {
    if (!caixa) return;
    caixa.hidden = false;
    if (caixa.firstChild) return;
    carregaCervell().then(function (J) {
      var D = window.CervellPla.dades(J);
      var h = document.createElement('p'); h.className = 'm-sub';
      h.textContent = 'El cervell del SOS: les ' + D.nodos.length + ' vedes que hereta aquest projecte, del propòsit al centre a l\'obra a fora.';
      caixa.appendChild(h);
      var c = document.createElement('div'), ara = document.createElement('p'), ctl = document.createElement('div');
      ara.className = 'm-sub'; ara.textContent = 'Toca una veda per llegir-la.';
      caixa.appendChild(c); caixa.appendChild(ara); caixa.appendChild(ctl);
      window.CervellPla.munta(c, D, { vista: 'mapa', mou: false, ara: ara, control: ctl, etiqueta: 'El cervell del SOS en anells, com un mapa de valor.' });
      var a = document.createElement('a'); a.href = 'cervell.html'; a.target = '_blank'; a.rel = 'noopener';
      a.className = 'btn btn-ghost btn-sm'; a.textContent = 'Obre el cervell sencer';
      caixa.appendChild(a);
    }).catch(function () { caixa.hidden = true; });
  }

  function aplica(svg, lent, D, peu, caixa) {
    posaEstil();
    if (caixa) caixa.hidden = lent !== 'saber';
    var f = LENTS[lent];
    if (!f || !D.rols.length) { if (peu) peu.hidden = true; return; }
    svg.classList.add('ln-on', 'ln-' + lent);
    var L = f(D, svg);
    svg.querySelectorAll('g[data-rol]').forEach(function (g) {
      var x = L.per[g.getAttribute('data-rol')], c = g.querySelector('circle');
      if (!x || !c) return;
      c.classList.add('ln-' + x.e);
      var cx = +c.getAttribute('cx'), cy = +c.getAttribute('cy'), r = +c.getAttribute('r');
      if (x.h) g.insertBefore(mk('circle', { cx: cx, cy: cy, r: r + x.h, class: 'ln-h' }), c);
      var t = mk('text', { x: cx, y: cy + r + 13, 'text-anchor': 'middle', class: 'ln-b ln-tb-' + x.e }, g);
      t.textContent = x.b;
    });
    if (peu) { peu.textContent = L.frase; peu.hidden = false; }
    if (lent === 'saber') munta(caixa);
  }

  window.Lents = { aplica: aplica, LENTS: Object.keys(LENTS) };
})();
