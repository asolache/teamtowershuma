/* Els taulers de la colla · la pinya per factors, de dalt i en 3D
 * ─────────────────────────────────────────────────────────────────────────────
 * L'Àlvaro (16/11/2026): «quiero ver al grupo en función del resultado del
 * 16PF: una vista desde arriba de una piña, 16 rengles, las filas de personas
 * por cada uno de los factores, y voy ubicando a cada persona con un
 * muñequito, como si fuese un Lego. De la superposición de las posiciones
 * teóricas que están en la base de la piña y el personajito que se va
 * ubicando, creas una estructura tridimensional donde puedes ver los huecos.»
 * La regla és la veda 184 del codex.
 *
 * El mètode, en una línia per pas:
 *   · Al mig, la font. Una rengla per factor del model, del centre cap enfora.
 *   · Cada rengla té un pilar (k = 0, el baix) i cinc cordons (k = 1…5, les
 *     cinc koshas, del propòsit al cos, com a «La font i la colla»).
 *   · La base teòrica: la plantilla demana els `cordons` primers llocs de cada
 *     rengla. És el castell que la colla vol poder fer.
 *   · Cada persona va a la rengla del factor on és més marcada (el decatipus
 *     més lluny del mig), i com més marcada, més a prop de la font. Si el lloc
 *     és ple, un cordó més enfora; si la rengla és plena, el seu segon factor.
 *   · Superposant les dues, surten els **forats**: llocs de la base sense
 *     ningú. Cada forat porta el rol, les skills i qui de la colla el podria
 *     cobrir, o bé una plaça d'aprenent (aprendre fent, veda 160).
 *
 *   CollaTaulers.calcula(model, persones, { cordons })  → { llocs, persones, forats, reserva, … }
 *   CollaTaulers.munta(caixa)                            → la vista, amb tot el que s'hi fa
 *
 * Cap dada surt del navegador: ni servidor ni localStorage (veda «Zero
 * localStorage»). El grup es desa i s'obre com a fitxer JSON.
 */
(function (arrel) {
  'use strict';
  var KMAX = 5;
  /* El castell que la pinya ha d'aguantar: set pisos, quatre de tronc i el pom
     de dalt (dosos, acotxador i enxaneta), com un castell de set. */
  var PISOS = 7;
  /* El nom curt d'un rol, per escriure'l a la punta de la seva rengla. */
  function curt(s) {
    s = String(s).split(' · ')[0].split(/ (?:i|y) /)[0];
    if (s.length <= 16) return s;
    var t = s.slice(0, 16), j = t.lastIndexOf(' ');
    return (j > 6 ? t.slice(0, j) : t) + '…';
  }

  /* ══ EL MODEL ════════════════════════════════════════════════════════════ */
  function intensitat(model, v) {
    var e = model.escala;
    if (v === null || v === undefined || v === '' || isNaN(+v)) return null;
    v = Math.max(e.min, Math.min(e.max, +v));
    return model.bipolar ? Math.abs(v - e.mig) / (e.max - e.mig) : (v - e.min) / (e.max - e.min);
  }
  /* Com més marcada, més a prop de la font. En decatipus: 1-2 i 9-10 al pilar,
     3 i 8 al primer cordó, 4 i 7 al segon, 5 i 6 al tercer. */
  var LLINDARS = [0.7, 0.5, 0.3, 0.1];
  function cordoDe(i) { for (var k = 0; k < LLINDARS.length; k++) if (i >= LLINDARS[k] - 1e-9) return k; return LLINDARS.length; }

  function perfil(model, p) {
    return model.factors.map(function (f, j) {
      var i = intensitat(model, p.v && p.v[f.id]);
      return { f: j, i: i, pol: i === null ? null : (!model.bipolar || +p.v[f.id] > model.escala.mig ? '+' : '-') };
    }).filter(function (x) { return x.i !== null; })
      .sort(function (a, b) { return b.i - a.i || a.f - b.f; });
  }

  function calcula(model, persones, op) {
    op = op || {};
    var n = model.factors.length, cordons = Math.max(1, Math.min(KMAX + 1, op.cordons || 2));
    var llocs = [], ix = {};
    for (var f = 0; f < n; f++) for (var k = 0; k <= KMAX; k++) {
      ix[f + ':' + k] = llocs.length;
      llocs.push({ f: f, k: k, req: k < cordons, p: null });
    }
    var ps = persones.map(function (p, j) {
      var pf = perfil(model, p);
      return { j: j, nom: p.nom, pf: pf, fix: p.fix, f: null, k: null, pol: null, i: pf.length ? pf[0].i : 0 };
    });
    function posa(q, f, k, pol) { var l = llocs[ix[f + ':' + k]]; l.p = q.j; q.f = f; q.k = k; q.pol = pol; }
    /* Primer els que s'han col·locat a mà; després, del més marcat al menys. */
    ps.filter(function (q) { return q.fix && ix[q.fix.f + ':' + q.fix.k] !== undefined; }).forEach(function (q) {
      var l = llocs[ix[q.fix.f + ':' + q.fix.k]];
      if (l.p !== null) return;
      var pr = q.pf.filter(function (x) { return x.f === q.fix.f; })[0];
      posa(q, q.fix.f, q.fix.k, pr ? pr.pol : null);
    });
    ps.filter(function (q) { return q.f === null; }).sort(function (a, b) { return b.i - a.i || a.j - b.j; }).forEach(function (q) {
      for (var t = 0; t < q.pf.length && q.f === null; t++) {
        var x = q.pf[t];
        for (var k = cordoDe(x.i); k <= KMAX; k++) if (llocs[ix[x.f + ':' + k]].p === null) { posa(q, x.f, k, x.pol); break; }
      }
    });
    var forats = llocs.filter(function (l) { return l.req && l.p === null; }).map(function (l) {
      /* Qui el podria cobrir: algú de la colla marcat en aquest factor que és
         en una altra rengla. Si no hi ha ningú, és una plaça d'aprenent. */
      var cand = ps.filter(function (q) { return q.f !== l.f; }).map(function (q) {
        var x = q.pf.filter(function (y) { return y.f === l.f; })[0];
        return x && x.i >= 0.33 ? { j: q.j, i: x.i, pol: x.pol } : null;
      }).filter(Boolean).sort(function (a, b) { return b.i - a.i; }).slice(0, 3);
      return { f: l.f, k: l.k, cand: cand };
    });
    var base = llocs.filter(function (l) { return l.req; }).length;
    var ocupats = llocs.filter(function (l) { return l.req && l.p !== null; }).length;
    return {
      n: n, cordons: cordons, llocs: llocs, persones: ps, forats: forats, base: base,
      ocupats: ocupats,
      /* Sense una bona pinya no hi ha castell: el castell (el projecte) puja
         tants pisos com la part de la base que la colla té coberta. */
      castell: { pisos: PISOS, aguanta: base ? Math.floor(ocupats / base * PISOS + 1e-9) : 0 },
      fora: llocs.filter(function (l) { return !l.req && l.p !== null; }).length,
      reserva: ps.filter(function (q) { return q.f === null; })
    };
  }

  /* Un perfil de text: «A=7 B=5 …» o setze xifres seguides. */
  function llegeixText(model, s) {
    var v = {}, ids = model.factors.map(function (f) { return f.id.toLowerCase(); });
    var parells = String(s).match(/([A-Za-z][A-Za-z0-9]*)\s*[=:]\s*(\d+(?:[.,]\d+)?)/g);
    if (parells) parells.forEach(function (t) {
      var m = t.match(/([A-Za-z][A-Za-z0-9]*)\s*[=:]\s*(\d+(?:[.,]\d+)?)/), j = ids.indexOf(m[1].toLowerCase());
      if (j >= 0) v[model.factors[j].id] = +m[2].replace(',', '.');
    });
    else {
      var xs = String(s).match(/\d+(?:[.,]\d+)?/g) || [];
      xs.slice(0, ids.length).forEach(function (x, j) { v[model.factors[j].id] = +x.replace(',', '.'); });
    }
    return v;
  }

  /* Una colla d'exemple, sempre la mateixa: noms inventats i decatipus fets
     amb una llavor, perquè la prova i la pantalla diguin el mateix. Cada
     persona té un factor que la marca, repartits per la pinya, i la resta al
     voltant del mig, com surt en un grup de debò. */
  var NOMS = ['Anna', 'Biel', 'Carla', 'Dani', 'Elna', 'Ferran', 'Gemma', 'Hug', 'Irene', 'Jan', 'Laia', 'Marc'];
  function exemple(model) {
    var s = 1971, n = model.factors.length;
    function r() { s = (s * 16807) % 2147483647; return s / 2147483647; }
    return NOMS.map(function (nom, j) {
      var v = {}, marca = Math.floor(j * n / NOMS.length + r() * 0.9) % n;
      model.factors.forEach(function (f, i) {
        v[f.id] = i === marca ? (r() < 0.5 ? 1 + Math.floor(r() * 3) : 8 + Math.floor(r() * 3))
          : Math.max(2, Math.min(9, Math.round(5.5 + (r() + r() - 1) * 3)));
      });
      return { nom: nom, v: v };
    });
  }

  /* ══ ELS TEXTOS ══════════════════════════════════════════════════════════ */
  var T = {
    ca: {
      model: 'Model', cordons: 'Cordons que demana la base', dalt: 'De dalt', d3: 'En 3D', gir: 'Gira',
      exemple: 'Colla d\'exemple', buida: 'Buida', desa: 'Desa el grup', obre: 'Obre un grup', imprimeix: 'Imprimeix el tauler',
      resum: function (r, m) {
        return r.persones.length + ' persones · ' + r.base + ' llocs a la base · ' + r.ocupats + ' ocupats · '
          + '<b>' + r.forats.length + ' forats</b>' + (r.fora ? ' · ' + r.fora + ' fora de la base' : '')
          + (r.reserva.length ? ' · ' + r.reserva.length + ' en reserva' : '');
      },
      castell: function (r) {
        var c = r.castell;
        return c.aguanta >= c.pisos ? 'La pinya aguanta el castell sencer: ' + c.pisos + ' pisos, fins a l\'enxaneta.'
          : 'La pinya aguanta <b>' + c.aguanta + ' de ' + c.pisos + ' pisos</b>. Sense una bona pinya no hi ha castell: cada forat que s\'omple és un pis més del projecte.';
      },
      kosha: ['pilar (baix)', '1r cordó · propòsit', '2n cordó · criteri', '3r cordó · ment', '4t cordó · energia', '5è cordó · cos'],
      afegeix: 'Afegeix una persona', nom: 'Nom o àlies', enganxa: 'O enganxa el perfil (A=7 B=5 … o les xifres en ordre)',
      posa: 'Posa-la a la colla', treu: 'Treu', mou: 'Mou', mouAra: 'Toca un lloc del tauler per posar-hi ', solta: 'Deixa-la on la posa el mètode',
      forats: 'Els forats', capForat: 'No hi ha cap forat a la base: la colla pot fer aquest castell.',
      cobreix: 'Hi pot donar un cop de mà: ', aprenent: 'Ningú de la colla hi és marcat: és una plaça d\'aprenent.',
      formacio: 'Aprèn fent →', persones: 'La colla', cap: 'Encara no hi ha ningú. Afegeix-hi persones o obre la colla d\'exemple.',
      rol: 'Rol', alt: 'Pol alt', baix: 'Pol baix', apren: 'S\'hi aprèn', buit: 'Lloc buit de la base', lliure: 'Lloc fora de la base',
      on: 'Rengla', ell: 'Ocupat per', reserva: 'En reserva (no hi ha lloc al seu factor)', toca: 'Toca un lloc o un ninot per veure\'n el rol i les skills.',
      alt3d: function (r, m) { return 'La pinya de ' + r.n + ' rengles, una per factor del model ' + m.nom.ca + ', amb ' + r.persones.length + ' persones i ' + r.forats.length + ' forats a la base.'; },
      font: 'La font', privat: 'Les dades no surten d\'aquest navegador. «Desa el grup» en fa un fitxer per a tu.',
      llicencia: 'Llicència', error: 'Aquest fitxer no és un grup de la colla.'
    },
    es: {
      model: 'Modelo', cordons: 'Cordones que pide la base', dalt: 'Desde arriba', d3: 'En 3D', gir: 'Gira',
      exemple: 'Colla de ejemplo', buida: 'Vacía', desa: 'Guarda el grupo', obre: 'Abre un grupo', imprimeix: 'Imprime el tablero',
      resum: function (r, m) {
        return r.persones.length + ' personas · ' + r.base + ' lugares en la base · ' + r.ocupats + ' ocupados · '
          + '<b>' + r.forats.length + ' huecos</b>' + (r.fora ? ' · ' + r.fora + ' fuera de la base' : '')
          + (r.reserva.length ? ' · ' + r.reserva.length + ' en reserva' : '');
      },
      castell: function (r) {
        var c = r.castell;
        return c.aguanta >= c.pisos ? 'La pinya aguanta el castell entero: ' + c.pisos + ' pisos, hasta la enxaneta.'
          : 'La pinya aguanta <b>' + c.aguanta + ' de ' + c.pisos + ' pisos</b>. Sin una buena pinya no hay castell: cada hueco que se llena es un piso más del proyecto.';
      },
      kosha: ['pilar (baix)', '1.er cordón · propósito', '2.º cordón · criterio', '3.er cordón · mente', '4.º cordón · energía', '5.º cordón · cuerpo'],
      afegeix: 'Añade una persona', nom: 'Nombre o alias', enganxa: 'O pega el perfil (A=7 B=5 … o las cifras en orden)',
      posa: 'Ponla en la colla', treu: 'Quita', mou: 'Mueve', mouAra: 'Toca un lugar del tablero para poner a ', solta: 'Déjala donde la pone el método',
      forats: 'Los huecos', capForat: 'No hay ningún hueco en la base: la colla puede hacer este castell.',
      cobreix: 'Puede echar una mano: ', aprenent: 'Nadie de la colla está marcado ahí: es una plaza de aprendiz.',
      formacio: 'Aprende haciendo →', persones: 'La colla', cap: 'Aún no hay nadie. Añade personas o abre la colla de ejemplo.',
      rol: 'Rol', alt: 'Polo alto', baix: 'Polo bajo', apren: 'Se aprende', buit: 'Lugar vacío de la base', lliure: 'Lugar fuera de la base',
      on: 'Rengla', ell: 'Ocupado por', reserva: 'En reserva (no hay sitio en su factor)', toca: 'Toca un lugar o un muñequito para ver su rol y sus skills.',
      alt3d: function (r, m) { return 'La pinya de ' + r.n + ' rengles, una por factor del modelo ' + m.nom.es + ', con ' + r.persones.length + ' personas y ' + r.forats.length + ' huecos en la base.'; },
      font: 'La fuente', privat: 'Los datos no salen de este navegador. «Guarda el grupo» hace un archivo para ti.',
      llicencia: 'Licencia', error: 'Este archivo no es un grupo de la colla.'
    }
  };

  /* ══ LA GEOMETRIA ═══════════════════════════════════════════════════════ */
  var R0 = 64, PAS = 30, RF = 38;
  function pos(n, f, k) {
    var a = -Math.PI / 2 + f * 2 * Math.PI / n, r = R0 + k * PAS;
    return { x: r * Math.cos(a), y: r * Math.sin(a), a: a };
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function f1(x) { return Math.round(x * 10) / 10; }

  /* El ninot, a peu dret a (X, Y) de pantalla. `tipus`: 'ple', 'teoric', 'forat'. */
  function ninot(X, Y, s, tipus, col, attrs) {
    var w = 11 * s, h = 24 * s, cap = 5.2 * s;
    var cls = 'ct-n ct-' + tipus;
    var st = tipus === 'ple' ? 'fill="' + col + '" stroke="var(--text)" stroke-width="' + f1(0.6 * s) + '"'
      : 'fill="none" stroke="' + col + '" stroke-width="' + f1(1.1 * s) + '" stroke-dasharray="' + f1(2.5 * s) + ' ' + f1(2 * s) + '"';
    return '<g class="' + cls + '" ' + (attrs || '') + '>'
      + '<ellipse cx="' + f1(X) + '" cy="' + f1(Y) + '" rx="' + f1(w * 0.75) + '" ry="' + f1(w * 0.32) + '" class="ct-ombra"/>'
      + '<rect x="' + f1(X - w / 2) + '" y="' + f1(Y - h * 0.45) + '" width="' + f1(w) + '" height="' + f1(h * 0.45) + '" rx="' + f1(s) + '" ' + st + '/>'
      + '<rect x="' + f1(X - w / 2 - s) + '" y="' + f1(Y - h * 0.86) + '" width="' + f1(w + 2 * s) + '" height="' + f1(h * 0.42) + '" rx="' + f1(1.6 * s) + '" ' + st + '/>'
      + '<circle cx="' + f1(X) + '" cy="' + f1(Y - h * 0.86 - cap * 0.9) + '" r="' + f1(cap) + '" ' + (tipus === 'ple' ? 'fill="var(--gold)" stroke="var(--text)" stroke-width="' + f1(0.6 * s) + '"' : st) + '/>'
      + '<rect x="' + f1(X - 1.8 * s) + '" y="' + f1(Y - h * 0.86 - cap * 2.2) + '" width="' + f1(3.6 * s) + '" height="' + f1(1.6 * s) + '" ' + (tipus === 'ple' ? 'fill="var(--gold)"' : st) + '/>'
      + '</g>';
  }

  function colorDe(m, q) {
    if (!q) return 'var(--muted)';
    if (!m.bipolar) return 'var(--indigo)';
    return q.pol === '+' ? 'var(--blue)' : 'var(--green)';
  }

  /* La planta de dalt: el tauler que s'imprimeix i on es juga. */
  function dalt(m, r, ps, op) {
    var n = r.n, L = R0 + KMAX * PAS + 62, o = [];
    var LX = L + 70;
    o.push('<svg class="ct-svg" viewBox="' + (-LX) + ' ' + (-L) + ' ' + 2 * LX + ' ' + 2 * L + '" role="img" aria-labelledby="ct-t"><title id="ct-t">' + esc(op.titol) + '</title>');
    for (var k = 0; k <= KMAX; k++) o.push('<circle r="' + (R0 + k * PAS) + '" class="ct-cordo' + (k < r.cordons ? ' ct-req' : '') + '"/>');
    for (var f = 0; f < n; f++) {
      var a = pos(n, f, 0), b = pos(n, f, KMAX), e = pos(n, f, KMAX + 1.1);
      o.push('<line x1="' + f1(RF * Math.cos(a.a)) + '" y1="' + f1(RF * Math.sin(a.a)) + '" x2="' + f1(b.x) + '" y2="' + f1(b.y) + '" class="ct-rengla"/>');
      /* Als costats, el nom s'escriu cap enfora perquè no trepitgi la pinya. */
      var ca = Math.cos(e.a), an = ca > 0.35 ? 'start' : ca < -0.35 ? 'end' : 'middle';
      o.push('<text x="' + f1(e.x) + '" y="' + f1(e.y - 5) + '" class="ct-lf" style="text-anchor:' + an + '">' + esc(m.factors[f].id)
        + '<tspan x="' + f1(e.x) + '" dy="12" class="ct-lr">' + esc(curt(op.txt(m.factors[f].rol))) + '</tspan></text>');
    }
    o.push(font(0, 0, 1));
    r.llocs.forEach(function (l, j) {
      var p = pos(n, l.f, l.k), q = l.p !== null ? r.persones[l.p] : null;
      var cls = 'ct-lloc' + (l.req ? ' ct-req' : '') + (l.req && !q ? ' ct-forat' : '') + (op.sel && op.sel.l === j ? ' ct-sel' : '');
      o.push('<g class="' + cls + '" data-l="' + j + '" tabindex="0" role="button" aria-label="' + esc(m.factors[l.f].id + ' · ' + op.t.kosha[l.k] + (q ? ' · ' + q.nom : '')) + '">'
        + '<circle cx="' + f1(p.x) + '" cy="' + f1(p.y) + '" r="11"/>'
        + (q && !op.buit ? '<circle cx="' + f1(p.x) + '" cy="' + f1(p.y) + '" r="7.5" fill="' + colorDe(m, q) + '" class="ct-cap"/>'
          + '<text x="' + f1(p.x) + '" y="' + f1(p.y + 16 + 4) + '" class="ct-nm">' + esc(q.nom.slice(0, 8)) + '</text>' : '')
        + '</g>');
    });
    o.push('</svg>');
    return o.join('');
  }

  function font(X, Y, s) {
    return '<g class="ct-font" aria-hidden="true"><ellipse cx="' + X + '" cy="' + Y + '" rx="' + RF * s + '" ry="' + RF * s * (s < 1 ? 1 : 1) + '"/>'
      + '<circle cx="' + X + '" cy="' + Y + '" r="' + 8 * s + '" class="ct-ona"/><circle cx="' + X + '" cy="' + Y + '" r="' + 8 * s + '" class="ct-ona ct-ona2"/></g>';
  }

  /* El 3D: la mateixa planta inclinada i girada, amb la base teòrica com a
     ninots de línia i la colla com a ninots plens. On hi ha línia i
     no hi ha ple, hi ha un forat. */
  function tresD(m, r, ps, op) {
    var n = r.n, th = (op.gir || 0) * Math.PI / 180, inc = 0.5, S = 1.25;
    var c = Math.cos(th), s = Math.sin(th);
    function pr(x, y, z) { var X = x * c - y * s, Y = x * s + y * c; return { X: X * S, Y: Y * inc * S - (z || 0), d: Y }; }
    var L = (R0 + KMAX * PAS + 40) * S, top = 70 + PISOS * 26, o = [];
    o.push('<svg class="ct-svg ct-3d" viewBox="' + (-L) + ' ' + (-L * inc - top) + ' ' + 2 * L + ' ' + (2 * L * inc + top + 20) + '" role="img" aria-labelledby="ct-t"><title id="ct-t">' + esc(op.titol) + '</title>');
    /* El terra: els cordons com a el·lipses i les rengles. */
    for (var k = KMAX; k >= 0; k--) {
      var rr = (R0 + k * PAS) * S;
      o.push('<ellipse rx="' + f1(rr) + '" ry="' + f1(rr * inc) + '" class="ct-cordo' + (k < r.cordons ? ' ct-req' : '') + '"/>');
    }
    for (var f = 0; f < n; f++) {
      var a = pos(n, f, 0), b = pos(n, f, KMAX), e = pos(n, f, KMAX + 1.05);
      var A = pr(RF * Math.cos(a.a), RF * Math.sin(a.a)), B = pr(b.x, b.y), E = pr(e.x, e.y);
      o.push('<line x1="' + f1(A.X) + '" y1="' + f1(A.Y) + '" x2="' + f1(B.X) + '" y2="' + f1(B.Y) + '" class="ct-rengla"/>');
      o.push('<text x="' + f1(E.X) + '" y="' + f1(E.Y + 4) + '" class="ct-lf">' + esc(m.factors[f].id) + '</text>');
    }
    o.push('<g class="ct-font" aria-hidden="true"><ellipse rx="' + f1(RF * S) + '" ry="' + f1(RF * S * inc) + '"/>'
      + '<path d="M-6,0 Q-10,-30 -2,-52 M6,0 Q10,-30 2,-52 M0,0 L0,-58" class="ct-raig"/></g>');
    var items = r.llocs.map(function (l, j) {
      var p = pos(n, l.f, l.k), P = pr(p.x, p.y), q = l.p !== null ? r.persones[l.p] : null;
      return { l: l, j: j, P: P, q: q };
    }).sort(function (a, b) { return a.P.d - b.P.d; });
    /* El castell, a sobre de la font: els pisos que la pinya aguanta, plens; la
       resta, en línia. Es pinta quan toca per profunditat, al centre. */
    var tronc = false;
    function castell() {
      var g = '<g class="ct-castell" aria-hidden="true">';
      for (var i = 0; i < PISOS; i++) {
        var z = 14 + i * 26, ple = i < r.castell.aguanta, pom = i >= PISOS - 3;
        g += ninot(0, -z, pom ? 0.8 - (i - (PISOS - 3)) * 0.1 : 1, ple ? 'ple' : 'teoric', ple ? (pom ? 'var(--gold)' : 'var(--indigo)') : 'var(--muted)');
      }
      return g + '</g>';
    }
    items.forEach(function (it) {
      if (!tronc && it.P.d > 0) { o.push(castell()); tronc = true; }
      var l = it.l, q = it.q, P = it.P, sel = op.sel && op.sel.l === it.j;
      var at = 'data-l="' + it.j + '" tabindex="0" role="button" aria-label="' + esc(m.factors[l.f].id + ' · ' + op.t.kosha[l.k] + (q ? ' · ' + q.nom : (l.req ? ' · ' + op.t.buit : ''))) + '"';
      var base = '<ellipse cx="' + f1(P.X) + '" cy="' + f1(P.Y) + '" rx="' + f1(10 * S) + '" ry="' + f1(10 * S * inc) + '" class="ct-rajola' + (l.req ? ' ct-req' : '') + (l.req && !q ? ' ct-forat' : '') + '"/>';
      if (q) o.push('<g class="ct-lloc' + (sel ? ' ct-sel' : '') + '" ' + at + '>' + base + ninot(P.X, P.Y, 1, 'ple', colorDe(m, q)) + '</g>');
      else if (l.req) o.push('<g class="ct-lloc ct-forat' + (sel ? ' ct-sel' : '') + '" ' + at + '>' + base + ninot(P.X, P.Y, 1, 'forat', 'var(--red)') + '</g>');
      else o.push('<g class="ct-lloc' + (sel ? ' ct-sel' : '') + '" ' + at + '>' + base + '</g>');
    });
    if (!tronc) o.push(castell());
    o.push('</svg>');
    return o.join('');
  }

  /* ══ LA PANTALLA ════════════════════════════════════════════════════════ */
  var CSS = '.ct{display:grid;gap:12px}'
    + '.ct-ctl{display:flex;flex-wrap:wrap;gap:8px;align-items:center}'
    + '.ct-ctl label{display:flex;gap:6px;align-items:center;font-size:var(--t0);color:var(--light)}'
    + '.ct-ctl select,.ct-ctl input[type=range]{min-height:44px;font:inherit}'
    + '.ct-seg{display:inline-flex;border:1px solid var(--border-strong);border-radius:10px;overflow:hidden}'
    + '.ct-seg button{min-height:44px;padding:0 14px;border:0;background:var(--card);color:var(--text);font:inherit;cursor:pointer}'
    + '.ct-seg button[aria-pressed=true]{background:var(--indigo);color:var(--on-accent)}'
    + '.ct-main{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:14px;align-items:start}'
    + '@media (max-width:820px){.ct-main{grid-template-columns:1fr}}'
    + '.ct-esc{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:8px;touch-action:pan-y}'
    + '.ct-svg{display:block;width:100%;height:auto;max-height:78vh}'
    + '.ct-cordo{fill:none;stroke:var(--border);stroke-width:1}.ct-cordo.ct-req{stroke:var(--border-strong);stroke-width:1.4}'
    + '.ct-rengla{stroke:var(--border-strong);stroke-width:1}'
    + '.ct-lf{font:600 12px var(--mono);fill:var(--light);text-anchor:middle;dominant-baseline:middle}'
    + '.ct-lr{font:500 10px var(--mono);fill:var(--muted)}'
    + '.ct-nm{font:10px var(--mono);fill:var(--text);text-anchor:middle}'
    + '.ct-font ellipse{fill:color-mix(in srgb,var(--blue) 22%,var(--card));stroke:var(--blue);stroke-width:1.2}'
    + '.ct-ona{fill:none;stroke:var(--blue);stroke-width:1.2;animation:ct-ona 3.2s ease-out infinite}.ct-ona2{animation-delay:1.6s}'
    + '.ct-raig{fill:none;stroke:var(--blue);stroke-width:2;stroke-linecap:round;opacity:.75}'
    + '@keyframes ct-ona{from{r:6;opacity:.9}to{r:34;opacity:0}}'
    + '@media (prefers-reduced-motion:reduce){.ct-ona{animation:none}}'
    + '.ct-lloc{cursor:pointer;outline:none}.ct-lloc *{pointer-events:all}.ct-lloc>circle:first-child{fill:var(--panel);stroke:var(--border);stroke-width:1}'
    + '.ct-lloc.ct-req>circle:first-child{fill:var(--card);stroke:var(--border-strong)}'
    + '.ct-lloc.ct-forat>circle:first-child{fill:color-mix(in srgb,var(--red) 10%,var(--card));stroke:var(--red);stroke-dasharray:3 2}'
    + '.ct-lloc:focus-visible>circle:first-child,.ct-lloc:focus-visible .ct-rajola,.ct-sel>circle:first-child,.ct-sel .ct-rajola{stroke:var(--indigo);stroke-width:3}'
    + '.ct-rajola{fill:var(--panel);stroke:var(--border);stroke-width:1}.ct-rajola.ct-req{fill:var(--card);stroke:var(--border-strong)}'
    + '.ct-rajola.ct-forat{fill:color-mix(in srgb,var(--red) 14%,var(--card));stroke:var(--red)}'
    + '.ct-ombra{fill:var(--text);opacity:.12}.ct-teoric .ct-ombra,.ct-forat .ct-ombra{opacity:0}'
    + '.ct-res{font-size:var(--t0);color:var(--light)}'
    + '.ct-pan{display:grid;gap:12px}'
    + '.ct-box{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px 14px}'
    + '.ct-box h3{font-size:var(--t1);margin:0 0 .4rem}'
    + '.ct-box p{margin:.2rem 0;font-size:var(--t0)}'
    + '.ct-box dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:2px 10px;font-size:var(--t0)}.ct-box dt{color:var(--muted)}.ct-box dd{margin:0}'
    + '.ct-ll{list-style:none;padding:0;margin:0;display:grid;gap:6px;font-size:var(--t0)}'
    + '.ct-ll li{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.ct-ll li b{flex:1 1 auto}'
    + '.ct-ll button{min-height:36px;padding:0 10px;border:1px solid var(--border-strong);border-radius:8px;background:var(--card);color:var(--text);font:inherit;font-size:.85rem;cursor:pointer}'
    + '.ct-pt{display:inline-block;width:12px;height:12px;border-radius:50%}'
    + '.ct-fs{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:6px;margin:.5rem 0}'
    + '.ct-fs label{display:grid;font:600 .8rem var(--mono);color:var(--light)}'
    + '.ct-fs input,.ct-box input[type=text]{min-height:40px;font:inherit;padding:4px 8px;border:1px solid var(--border-strong);border-radius:8px;background:var(--card);color:var(--text);width:100%}'
    + '.ct-av{font-size:var(--t0);color:var(--indigo);font-weight:600}'
    + '.ct-imp{display:none}'
    + '@media print{.tt-nav,.tt-peu,.ct-ctl,.ct-pan,.ct-res,.ct-noimp{display:none!important}.ct-main{display:block}.ct-esc{border:0}.ct-imp{display:block}'
    + '.ct-imp table{width:100%;border-collapse:collapse;font-size:10pt}.ct-imp td,.ct-imp th{border:1px solid #999;padding:3px 6px;text-align:left;vertical-align:top}'
    + '.ct-svg{max-height:none}.ct-ona{animation:none}}';

  function munta(caixa) {
    var M = arrel.TaulersModels, st = { model: '16pf', cordons: 2, vista: 'dalt', gir: 20, grups: {}, sel: null, mou: null, buit: false };
    var doc = caixa.ownerDocument;
    if (!doc.getElementById('ct-css')) { var c = doc.createElement('style'); c.id = 'ct-css'; c.textContent = CSS; doc.head.appendChild(c); }
    function ll() { var l = (doc.documentElement.lang || 'ca').slice(0, 2); return T[l] ? l : 'ca'; }
    function grup() { return st.grups[st.model] || (st.grups[st.model] = exemple(M.MODELS[st.model])); }
    function txt(o) { return o[ll()] || o.ca; }

    function pinta() {
      var t = T[ll()], m = M.MODELS[st.model], ps = grup(), r = calcula(m, ps, { cordons: st.cordons });
      var titol = t.alt3d(r, m);
      var op = { t: t, sel: st.sel, gir: st.gir, titol: titol, buit: st.buit, txt: txt };
      var h = [];
      h.push('<div class="ct-ctl">');
      h.push('<label>' + t.model + ' <select data-a="model">' + M.ORDRE.map(function (id) {
        return '<option value="' + id + '"' + (id === st.model ? ' selected' : '') + '>' + esc(txt(M.MODELS[id].nom)) + '</option>';
      }).join('') + '</select></label>');
      h.push('<label>' + t.cordons + ' <input type="range" min="1" max="6" value="' + st.cordons + '" data-a="cordons"> <b>' + st.cordons + '</b></label>');
      h.push('<span class="ct-seg" role="group"><button type="button" data-a="dalt" aria-pressed="' + (st.vista === 'dalt') + '">' + t.dalt + '</button>'
        + '<button type="button" data-a="d3" aria-pressed="' + (st.vista === '3d') + '">' + t.d3 + '</button></span>');
      if (st.vista === '3d') h.push('<label>' + t.gir + ' <input type="range" min="0" max="359" value="' + st.gir + '" data-a="gir"></label>');
      h.push('</div>');
      h.push('<p class="ct-res" aria-live="polite">' + t.resum(r, m) + '<br>' + t.castell(r) + '</p>');
      if (st.mou !== null) h.push('<p class="ct-av">' + t.mouAra + esc(ps[st.mou].nom) + '. <button type="button" class="btn btn-sm" data-a="solta">' + t.solta + '</button></p>');
      h.push('<div class="ct-main"><div class="ct-esc">' + (st.vista === '3d' ? tresD(m, r, ps, op) : dalt(m, r, ps, op)) + '</div>');
      h.push('<div class="ct-pan">' + detall(t, m, r, ps) + forats(t, m, r, ps) + colla(t, m, r, ps) + afegeix(t, m) + '</div></div>');
      h.push('<div class="ct-ctl ct-noimp"><button type="button" class="btn" data-a="exemple">' + t.exemple + '</button>'
        + '<button type="button" class="btn" data-a="buida">' + t.buida + '</button>'
        + '<button type="button" class="btn" data-a="desa">' + t.desa + '</button>'
        + '<label class="btn">' + t.obre + '<input type="file" accept="application/json,.json" data-a="obre" hidden></label>'
        + '<button type="button" class="btn-primary" data-a="imprimeix">' + t.imprimeix + '</button></div>');
      h.push('<p class="nota ct-noimp">' + t.privat + ' ' + t.llicencia + ': ' + esc(txt(m.llicencia)) + ' <a href="' + esc(m.font.url) + '" rel="noopener">' + esc(m.font.nom) + ' ↗</a></p>');
      h.push(imprimible(t, m));
      caixa.innerHTML = h.join('');
    }

    function nomRol(m, f) { return m.factors[f].id + ' · ' + txt(m.factors[f].nom); }
    function skills(t, m, f) {
      var x = m.factors[f];
      return '<dt>' + t.rol + '</dt><dd>' + esc(txt(x.rol)) + '</dd>'
        + '<dt>' + (m.bipolar ? t.alt : 'Skills') + '</dt><dd>' + esc(txt(x.alt)) + '</dd>'
        + '<dt>' + (m.bipolar ? t.baix : t.apren) + '</dt><dd>' + esc(txt(x.baix)) + '</dd>';
    }
    function detall(t, m, r, ps) {
      if (!st.sel) return '<div class="ct-box"><p>' + t.toca + '</p></div>';
      var l = r.llocs[st.sel.l], q = l.p !== null ? r.persones[l.p] : null;
      var o = '<div class="ct-box"><h3>' + esc(nomRol(m, l.f)) + '</h3><dl><dt>' + t.on + '</dt><dd>' + t.kosha[l.k] + '</dd>';
      o += '<dt>' + t.ell + '</dt><dd>' + (q ? esc(q.nom) + (m.bipolar ? ' (' + (q.pol === '+' ? t.alt : t.baix).toLowerCase() + ')' : '') : (l.req ? '<b>' + t.buit + '</b>' : t.lliure)) + '</dd>';
      return o + skills(t, m, l.f) + '</dl></div>';
    }
    function forats(t, m, r, ps) {
      var o = '<div class="ct-box"><h3>' + t.forats + ' · ' + r.forats.length + '</h3>';
      if (!r.forats.length) return o + '<p>' + t.capForat + '</p></div>';
      /* Un rengló per rengla: el rol, en quins cordons falta gent i qui hi pot
         donar un cop de mà. */
      var per = {};
      r.forats.forEach(function (x) { (per[x.f] = per[x.f] || []).push(x); });
      o += '<ul class="ct-ll">' + Object.keys(per).map(function (f) {
        var xs = per[f], cand = xs[0].cand;
        var c = cand.length ? t.cobreix + cand.map(function (y) { return esc(ps[y.j].nom); }).join(', ')
          : t.aprenent + ' <a href="/SOS/formacio.html">' + t.formacio + '</a>';
        return '<li><span><b>' + esc(nomRol(m, +f)) + '</b> · ' + esc(txt(m.factors[f].rol)) + ' · '
          + xs.map(function (x) { return t.kosha[x.k].split(' · ')[0]; }).join(', ') + '. ' + c + '</span></li>';
      }).join('') + '</ul></div>';
      return o;
    }
    function colla(t, m, r, ps) {
      var o = '<div class="ct-box"><h3>' + t.persones + ' · ' + ps.length + '</h3>';
      if (!ps.length) return o + '<p>' + t.cap + '</p></div>';
      return o + '<ul class="ct-ll">' + r.persones.map(function (q) {
        var on = q.f === null ? t.reserva : esc(nomRol(m, q.f)) + ' · ' + t.kosha[q.k];
        return '<li><span class="ct-pt" style="background:' + colorDe(m, q.f === null ? null : q) + '"></span><b>' + esc(q.nom) + '</b><span>' + on + '</span>'
          + '<button type="button" data-a="mou" data-p="' + q.j + '">' + t.mou + '</button><button type="button" data-a="treu" data-p="' + q.j + '">' + t.treu + '</button></li>';
      }).join('') + '</ul></div>';
    }
    function afegeix(t, m) {
      return '<form class="ct-box ct-noimp" data-a="afegeix"><h3>' + t.afegeix + '</h3>'
        + '<input type="text" name="nom" required maxlength="40" placeholder="' + t.nom + '" aria-label="' + t.nom + '">'
        + '<div class="ct-fs">' + m.factors.map(function (f) {
          return '<label title="' + esc(txt(f.nom)) + '">' + esc(f.id) + '<input type="number" inputmode="numeric" min="' + m.escala.min + '" max="' + m.escala.max + '" name="f_' + esc(f.id) + '" aria-label="' + esc(f.id + ' ' + txt(f.nom)) + '"></label>';
        }).join('') + '</div>'
        + '<input type="text" name="text" placeholder="' + t.enganxa + '" aria-label="' + t.enganxa + '">'
        + '<p><button type="submit" class="btn btn-sm">' + t.posa + '</button></p></form>';
    }
    /* El que surt en paper: el tauler buit i la llegenda de cada rengla. És el
       tauler físic del joc: s'hi posen ninots de debò. */
    function imprimible(t, m) {
      return '<div class="ct-imp"><h2>' + esc(txt(m.nom)) + '</h2><table><thead><tr><th></th><th>' + t.rol + '</th><th>' + (m.bipolar ? t.alt : 'Skills') + '</th><th>' + (m.bipolar ? t.baix : t.apren) + '</th></tr></thead><tbody>'
        + m.factors.map(function (f) { return '<tr><th>' + esc(f.id + ' · ' + txt(f.nom)) + '</th><td>' + esc(txt(f.rol)) + '</td><td>' + esc(txt(f.alt)) + '</td><td>' + esc(txt(f.baix)) + '</td></tr>'; }).join('')
        + '</tbody></table><p>' + esc(txt(m.llicencia)) + '</p></div>';
    }

    caixa.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a],[data-l]');
      if (!b || !caixa.contains(b)) return;
      var a = b.getAttribute('data-a'), ps = grup();
      if (b.hasAttribute('data-l')) return toca(+b.getAttribute('data-l'));
      if (a === 'dalt' || a === 'd3') { st.vista = a === 'd3' ? '3d' : 'dalt'; return pinta(); }
      if (a === 'exemple') { st.grups[st.model] = exemple(M.MODELS[st.model]); st.sel = null; st.mou = null; return pinta(); }
      if (a === 'buida') { st.grups[st.model] = []; st.sel = null; st.mou = null; return pinta(); }
      if (a === 'treu') { ps.splice(+b.getAttribute('data-p'), 1); st.sel = null; st.mou = null; return pinta(); }
      if (a === 'mou') { st.mou = +b.getAttribute('data-p'); return pinta(); }
      if (a === 'solta') { if (st.mou !== null) delete ps[st.mou].fix; st.mou = null; return pinta(); }
      if (a === 'desa') return desa();
      if (a === 'imprimeix') { st.vista = 'dalt'; st.buit = true; pinta(); setTimeout(function () { arrel.print(); st.buit = false; pinta(); }, 50); }
    });
    caixa.addEventListener('keydown', function (e) {
      var b = e.target.closest && e.target.closest('[data-l]');
      if (b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toca(+b.getAttribute('data-l')); }
    });
    caixa.addEventListener('input', function (e) {
      var a = e.target.getAttribute('data-a');
      if (a === 'cordons') { st.cordons = +e.target.value; pinta(); caixa.querySelector('[data-a=cordons]').focus(); }
      if (a === 'gir') { st.gir = +e.target.value; pinta(); caixa.querySelector('[data-a=gir]').focus(); }
    });
    caixa.addEventListener('change', function (e) {
      var a = e.target.getAttribute('data-a');
      if (a === 'model') { st.model = e.target.value; st.sel = null; st.mou = null; pinta(); }
      if (a === 'obre' && e.target.files[0]) obre(e.target.files[0]);
    });
    caixa.addEventListener('submit', function (e) {
      e.preventDefault();
      var fm = e.target, m = M.MODELS[st.model], v = {};
      m.factors.forEach(function (f) { var x = fm.elements['f_' + f.id].value; if (x !== '') v[f.id] = +x; });
      var tx = fm.elements.text.value.trim();
      if (tx) { var w = llegeixText(m, tx); Object.keys(w).forEach(function (k) { v[k] = w[k]; }); }
      grup().push({ nom: fm.elements.nom.value.trim().slice(0, 40), v: v });
      pinta();
    });
    /* Girar el 3D arrossegant, amb el dit o el ratolí. */
    var arr = null;
    caixa.addEventListener('pointerdown', function (e) { if (st.vista === '3d' && e.target.closest('.ct-3d') && !e.target.closest('[data-l]')) arr = { x: e.clientX, g: st.gir }; });
    caixa.addEventListener('pointermove', function (e) { if (!arr) return; st.gir = ((arr.g + (e.clientX - arr.x) * 0.6) % 360 + 360) % 360; pinta(); });
    doc.addEventListener('pointerup', function () { arr = null; });

    function toca(j) {
      var ps = grup(), m = M.MODELS[st.model];
      if (st.mou !== null) {
        var r = calcula(m, ps, { cordons: st.cordons }), l = r.llocs[j];
        if (l.p === null || l.p === st.mou) { ps[st.mou].fix = { f: l.f, k: l.k }; st.mou = null; }
      }
      st.sel = { l: j };
      pinta();
      var g = caixa.querySelector('[data-l="' + j + '"]'); if (g) g.focus();
    }
    function desa() {
      var d = { tipus: 'colla-taulers', versio: 1, model: st.model, cordons: st.cordons, persones: grup() };
      var u = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }));
      var a = doc.createElement('a'); a.href = u; a.download = 'colla-' + st.model + '.json'; doc.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(u); }, 1000);
    }
    function obre(fitxer) {
      fitxer.text().then(function (s) {
        var d = JSON.parse(s);
        if (!d || d.tipus !== 'colla-taulers' || !M.MODELS[d.model] || !Array.isArray(d.persones)) throw new Error();
        st.model = d.model; st.cordons = d.cordons || 2;
        st.grups[d.model] = d.persones.map(function (p) { return { nom: String(p.nom || '?').slice(0, 40), v: p.v || {}, fix: p.fix }; });
        st.sel = null; st.mou = null; pinta();
      }).catch(function () { caixa.querySelector('.ct-res').textContent = T[ll()].error; });
    }
    if (arrel.MutationObserver) new MutationObserver(pinta).observe(doc.documentElement, { attributes: true, attributeFilter: ['lang'] });
    pinta();
    return { pinta: pinta, estat: st };
  }

  var CollaTaulers = { KMAX: KMAX, PISOS: PISOS, curt: curt, T: T, intensitat: intensitat, cordoDe: cordoDe, perfil: perfil, calcula: calcula, llegeixText: llegeixText, exemple: exemple, munta: munta };
  if (typeof module === 'object' && module.exports) module.exports = CollaTaulers;
  else {
    arrel.CollaTaulers = CollaTaulers;
    var go = function () { Array.prototype.forEach.call(document.querySelectorAll('[data-colla]'), munta); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  }
})(this);
