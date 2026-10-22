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
 * La vista «mapa» posa les mateixes vedes en anells, com un mapa de valor: el
 * propòsit al centre i l'obra a fora (`CerebroFuerzas.RADIO`), cada veda un
 * node i cada cita un lliurament.
 *
 * La vista «pinya» mira el castell des de dalt, amb la regla de la planta de
 * `SOS/tools/build-castells.js` (`pinyaDeMapa`): cada kosha és un pilar i obre
 * quatre rengles, una primera mà, un vent i dos laterals. Una veda que cita o
 * és citada per una altra kosha és un vent (lliga dues àrees); la que només
 * parla amb la seva, una primera mà; la que no en cita cap, un lateral. La
 * fondària de cada rengla és quanta gent hi ha, i un pilar sense vents és un
 * silo. Ordena i fa visible, no puntua (`op.lectura` rep el recompte).
 *
 * Totes tenen el mode temporal: el cervell creix veda a veda, en bucle o amb
 * el control (`op.control`).
 *
 *   CervellPla.munta(caixa, { nodos, aristas, capas }, { vista: 'castellera' | 'capes' | 'mapa' | 'pinya', mou: true, ara: <element>, control: <element>, lectura: <element> })
 *     op.nom(n) diu com es diu un node (per defecte «Veda n · títol») i op.noms
 *     n'escriu el nom al costat: així el SOS hi posa els rols d'un mapa de valor.
 *   CervellPla.dades(json)   el JSON compacte de build-cervell-dades.js → { nodos, aristas, capas }
 *   CervellPla.franges / geometria / corba   les peces, per a qui hi posa la seva interacció
 */
(function (raiz) {
  var NS = 'http://www.w3.org/2000/svg';
  var CSS = '.cp,.cp-lp{--cp-lliga:#be185d;--k-anna:#b45309;--k-prana:#15803d;--k-mano:#0e7490;--k-vijnana:#1d4ed8;--k-ananda:#7c3aed}' +
    '.cp svg{display:block;width:100%;height:auto}' +
    '.cp .cp-b{opacity:.08}.cp .cp-l{font:600 15px system-ui,sans-serif;fill:var(--text,#15130f)}' +
    '.cp .cp-s{font:500 11px ui-monospace,monospace;fill:var(--muted,#5e594d);letter-spacing:.06em}' +
    '.cp .cp-e{fill:none;stroke:var(--muted,#5e594d);stroke-opacity:.3;stroke-width:1.2;transition:opacity .4s}' +
    '.cp .cp-n{transition:opacity .4s,transform .4s;transform-box:fill-box;transform-origin:center}' +
    '.cp .cp-h{opacity:0;transform:scale(.2)}.cp .cp-x{opacity:0}' +
    '.cp .cp-u{stroke:var(--text,#15130f);stroke-width:2.5}' +
    '.cp .cp-nt{font:600 12px system-ui,sans-serif;fill:var(--text,#15130f);paint-order:stroke;stroke:var(--bg-panel,#fff);stroke-width:3px;pointer-events:none;transition:opacity .4s}' +
    '.cp .cp-n{cursor:pointer}.cp .cp-d{opacity:.15}.cp .cp-on{stroke:var(--text,#15130f);stroke-opacity:.9;stroke-width:1.8}' +
    '.cp .cp-a{fill:none;stroke:currentColor;stroke-opacity:.12}.cp .cp-r{stroke-width:2;stroke-linecap:round;stroke-opacity:.35}' +
    '.cp svg.cp-mapa{max-width:640px;margin:0 auto}.cp svg.cp-pinya{max-width:820px}' +
    '.cp-t{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:8px 0}' +
    '.cp-t button{font:600 .9rem inherit;font-family:inherit;min-height:40px;padding:6px 16px;border-radius:999px;border:1px solid var(--border,#ddd7c8);background:var(--card,#fff);color:var(--text,#15130f);cursor:pointer}' +
    '.cp-t input{flex:1;min-width:160px}.cp-t output{font:500 .85rem ui-monospace,monospace;color:var(--muted,#5e594d);min-width:9ch}' +
    /* La lectura de la pinya com a dibuix: una barra per àrea, tres colors i una frase. */
    '.cp-lp{font-size:1rem;margin:12px 0 0}.cp-lp-ll{display:flex;flex-wrap:wrap;gap:6px 16px;margin:0 0 10px;padding:0;list-style:none;color:var(--muted,#5e594d)}' +
    '.cp-lp-ll i,.cp-lp-b i{display:inline-block}.cp-lp-ll i{width:14px;height:14px;border-radius:4px;margin-right:6px;vertical-align:-2px}' +
    '.cp-lp-f{display:grid;grid-template-columns:minmax(7.5em,auto) 1fr;gap:8px 12px;align-items:center;margin:0 0 6px}' +
    '.cp-lp-f b{line-height:1.15}.cp-lp-f b small{display:block;font:500 .95rem ui-monospace,monospace;color:var(--muted,#5e594d)}' +
    '.cp-lp-b{display:flex;height:30px;border-radius:6px;overflow:hidden;background:var(--border,#ddd7c8)}' +
    '.cp-lp-b i{height:100%;min-width:0;color:#fff;font:600 1rem system-ui,sans-serif;font-style:normal;display:flex;align-items:center;justify-content:center;overflow:hidden}' +
    '.cp-lp-b .cp-lp-v{background:var(--cp-lliga)}.cp-lp-b .cp-lp-s{color:var(--text,#15130f);background:repeating-linear-gradient(135deg,transparent 0 5px,rgba(0,0,0,.12) 5px 7px)}' +
    '.cp-lp p{margin:10px 0 0}';

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

  /* El mapa: un anell per kosha, el propòsit al centre i l'obra a fora; dins
     de cada anell, les vedes en l'ordre en què es van escriure. */
  function anells(D, W, H, gira) {
    var R = Math.min(W, H) / 2 - 18, cx = W / 2, cy = H / 2, pos = {}, per = {}, vist = {};
    var RADI = (raiz.CerebroFuerzas && raiz.CerebroFuerzas.RADIO) || { ananda: .22, vijnana: .44, mano: .63, prana: .81, anna: 1 };
    D.nodos.forEach(function (n) { per[n.capa] = (per[n.capa] || 0) + 1; });
    D.nodos.forEach(function (n) {
      var j = vist[n.capa] = (vist[n.capa] || 0) + 1, a = -Math.PI / 2 + 2 * Math.PI * (j - .5) / per[n.capa] + RADI[n.capa] + (gira ? 2.4 * D.capas.findIndex(function (c) { return c.id === n.capa; }) : 0);
      var r = R * RADI[n.capa] * (1 + ((n.n * 37) % 5 - 2) * .015);
      pos[n.id] = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), pis: D.capas.findIndex(function (c) { return c.id === n.capa; }) };
    });
    return { pos: pos, cx: cx, cy: cy, R: R, RADI: RADI };
  }

  /* La pinya des de dalt: cada kosha, un pilar amb les seves quatre rengles,
     i cada veda a la rengla que li toca segons amb qui parla. */
  /* Les paraules universals de les cinc capes, per a qui no coneix les koshas.
     Un sol lloc per a tothom que les ensenya (la portada, la pàgina del cervell,
     les webs filles): «Criteri» i no «Discerniment», més planer (22/10/2026). */
  var PARAULES = {
    ca: { anna: 'Cos', prana: 'Energia', mano: 'Ment', vijnana: 'Criteri', ananda: 'Propòsit' },
    es: { anna: 'Cuerpo', prana: 'Energía', mano: 'Mente', vijnana: 'Criterio', ananda: 'Propósito' }
  };
  function pinya(D, W, H) {
    var R = Math.min(W, H) / 2 - 40, cx = W / 2, cy = H / 2, R0 = R * .16, pos = {}, capa = {}, cites = {};
    D.nodos.forEach(function (n) { capa[n.id] = n.capa; cites[n.id] = { dins: 0, fora: 0 }; });
    D.aristas.forEach(function (a) {
      var k = capa[a[0]] === capa[a[1]] ? 'dins' : 'fora';
      if (cites[a[0]]) cites[a[0]][k]++; if (cites[a[1]]) cites[a[1]][k]++;
    });
    var pas = 2 * Math.PI / D.capas.length, fila = {}, max = 1, menaDe = {};
    var pilars = D.capas.map(function (c, k) {
      var a = -Math.PI / 2 + k * pas;
      return { capa: c, a: a, rengles: { primera: [a], lateral: [a + pas / 4, a + pas * 3 / 4], vent: [a + pas / 2] }, n: { primera: 0, vent: 0, lateral: 0 } };
    });
    var pilarDe = {}; pilars.forEach(function (p, k) { pilarDe[p.capa.id] = k; });
    D.nodos.forEach(function (n) {
      var c = cites[n.id], m = c.fora ? 'vent' : c.dins ? 'primera' : 'lateral', p = pilars[pilarDe[n.capa]];
      var j = p.n[m]++, r = m === 'lateral' ? j % 2 : 0, cl = n.capa + m + r, f = fila[cl] = (fila[cl] || 0) + 1;
      if (f > max) max = f; menaDe[n.id] = m;
      pos[n.id] = { a: p.rengles[m][r], f: f, pis: pilarDe[n.capa] };
    });
    var d = (R - R0) / max;
    D.nodos.forEach(function (n) { var q = pos[n.id], r = R0 + d * (q.f - .5); q.x = cx + r * Math.cos(q.a); q.y = cy + r * Math.sin(q.a); });
    return { pos: pos, cx: cx, cy: cy, R: R, R0: R0, pilars: pilars, menaDe: menaDe };
  }

  function munta(caixa, D, op) {
    op = op || {};
    var nom = op.nom || function (n) { return 'Veda ' + n.n + ' · ' + n.t; };
    if (!document.getElementById('cp-css')) { var st = document.createElement('style'); st.id = 'cp-css'; st.textContent = CSS; document.head.appendChild(st); }
    caixa.classList.add('cp');
    /* En una pantalla estreta, mitja amplada: els punts i els noms dels pisos
       es dibuixen el doble de grans, i les koshas de cada pis no hi caben. */
    var pin = op.vista === 'pinya', mapa = op.vista === 'mapa' || pin, estret = caixa.clientWidth < 600, W = pin ? 820 : mapa ? 640 : estret ? 500 : 1000;
    var H = mapa ? 640 : (op.alt || 300) * (estret ? .8 : 1), dalt = 10, x0 = estret ? 120 : 170, x1 = W - 16, bs = franges(D, mapa ? 'capes' : op.vista || 'castellera'), alt = (H - dalt - 10) / bs.length;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': op.etiqueta || '' }); if (mapa) svg.setAttribute('class', pin ? 'cp-mapa cp-pinya' : 'cp-mapa');
    caixa.innerHTML = ''; caixa.appendChild(svg);
    var gB = el('g', {}, svg), gE = el('g', {}, svg), gN = el('g', {}, svg);
    var byId = {}, pos = {}, grau = {};
    D.nodos.forEach(function (n, i) { n.i = i; byId[n.id] = n; grau[n.id] = 0; });
    D.aristas.forEach(function (a) { grau[a[0]]++; grau[a[1]]++; });
    var compte = bs.map(function () { return 0; }), etiq = [];
    if (pin) {
      var A = pinya(D, W, H); pos = A.pos;
      bs = D.capas.map(function (c) { return { n: c.n, s: c.s, capas: [c.id] }; }); compte = bs.map(function () { return 0; });
      el('circle', { cx: A.cx, cy: A.cy, r: A.R0 * .8, 'class': 'cp-a' }, gB);
      el('text', { x: A.cx, y: A.cy + 4, 'text-anchor': 'middle', 'class': 'cp-s' }, gB).textContent = 'TRONC';
      A.pilars.forEach(function (p) {
        Object.keys(p.rengles).forEach(function (m) {
          p.rengles[m].forEach(function (a) {
            var l = el('line', { x1: A.cx + A.R0 * Math.cos(a), y1: A.cy + A.R0 * Math.sin(a), x2: A.cx + A.R * Math.cos(a), y2: A.cy + A.R * Math.sin(a), stroke: m === 'vent' ? 'var(--cp-lliga)' : col(p.capa.id), 'class': 'cp-r' }, gB);
            if (m === 'lateral') l.setAttribute('stroke-dasharray', '2 5');
          });
        });
        var lx = A.cx + (A.R0 * .55) * Math.cos(p.a), ly = A.cy + (A.R0 * .55) * Math.sin(p.a);
        var t = el('text', { x: A.cx + (A.R + 8) * Math.cos(p.a), y: A.cy + (A.R + 8) * Math.sin(p.a) + (Math.sin(p.a) < -.9 ? -2 : 12), 'text-anchor': Math.cos(p.a) > .3 ? 'start' : Math.cos(p.a) < -.3 ? 'end' : 'middle', 'class': 'cp-s', fill: col(p.capa.id) }, gB);
        t.textContent = p.capa.s.toUpperCase(); etiq.push(t);
        el('circle', { cx: lx, cy: ly, r: 5, fill: col(p.capa.id) }, gB);
      });
    } else if (mapa) {
      A = anells(D, W, H, op.noms); pos = A.pos;
      bs = D.capas.map(function (c) { return { n: c.n, s: c.s, capas: [c.id] }; }); compte = bs.map(function () { return 0; });
      D.capas.forEach(function (c) {
        el('circle', { cx: A.cx, cy: A.cy, r: A.R * A.RADI[c.id], 'class': 'cp-a' }, gB);
        var t = el('text', { x: A.cx, y: A.cy - A.R * A.RADI[c.id] + 14, 'text-anchor': 'middle', 'class': 'cp-s', fill: col(c.id) }, gB);
        t.textContent = c.s.toUpperCase(); etiq.push(t);
      });
    } else bs.forEach(function (b, i) {
      var sub = alt / b.capas.length;
      b.capas.forEach(function (k, j) { el('rect', { x: 0, y: dalt + alt * i + sub * j, width: W, height: sub, fill: col(k), 'class': 'cp-b' }, gB); });
      if (b.pis && i) el('line', { x1: 0, x2: W, y1: dalt + alt * i, y2: dalt + alt * i, stroke: 'currentColor', 'stroke-opacity': .15 }, gB);
      var t = el('text', { x: 12, y: dalt + alt * i + alt / 2 - 3, 'class': 'cp-l' }, gB); t.textContent = b.n;
      etiq.push(t);
      if (b.s && !estret) { var s = el('text', { x: 12, y: dalt + alt * i + alt / 2 + 14, 'class': 'cp-s' }, gB); s.textContent = b.s.toUpperCase(); }
    });
    if (!mapa) pos = geometria(D, bs, { dalt: dalt, alt: alt, x0: x0, x1: x1 });
    /* Al mapa, una cita passa a prop del centre: com més lluny, més s'hi acosta. */
    var arc = mapa ? function (p, q) { var mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2; return 'M' + p.x + ',' + p.y + ' Q' + (mx + (A.cx - mx) * .6) + ',' + (my + (A.cy - my) * .6) + ' ' + q.x + ',' + q.y; } : corba;
    var eEls = D.aristas.map(function (a) { return { a: a, el: el('path', { d: arc(pos[a[0]], pos[a[1]]), 'class': 'cp-e' }, gE) }; });
    var nEls = D.nodos.map(function (n) {
      var c = el('circle', { cx: pos[n.id].x, cy: pos[n.id].y, r: pin ? 3 + Math.min(grau[n.id], 4) * .6 : 3.5 + Math.min(grau[n.id], 6), fill: col(n.capa), 'class': 'cp-n' }, gN);
      el('title', {}, c).textContent = (op.nom ? nom(n) : 'Veda ' + n.n + (n.fuente ? ' · ' + n.fuente : '') + ' · ' + n.t) + (pin ? ' · ' + { primera: 'primera mà', vent: 'vent', lateral: 'lateral' }[A.menaDe[n.id]] : '');
      c.addEventListener('click', function () { tria(n.id); });
      if (op.noms) { var dr = pos[n.id].x > W - 140, dx = 8 + Math.min(grau[n.id], 6); c.t = el('text', { x: pos[n.id].x + (dr ? -dx : dx), y: pos[n.id].y + 4, 'text-anchor': dr ? 'end' : 'start', 'class': 'cp-nt' }, gN); c.t.textContent = n.t.length > 18 ? n.t.slice(0, 17) + '…' : n.t; }
      return c;
    });
    var vei = {}; D.aristas.forEach(function (a) { (vei[a[0]] = vei[a[0]] || {})[a[1]] = 1; (vei[a[1]] = vei[a[1]] || {})[a[0]] = 1; });
    /* Triar una veda: ella i les que cita o la citen, i la resta es difumina. */
    function tria(id) {
      D.nodos.forEach(function (n, i) { nEls[i].classList.toggle('cp-d', !!id && n.id !== id && !(vei[id] || {})[n.id]); });
      eEls.forEach(function (e) { e.el.classList.toggle('cp-on', !!id && (e.a[0] === id || e.a[1] === id)); });
      if (id && op.ara) op.ara.textContent = nom(byId[id]);
      if (op.alTriar) op.alTriar(id);
    }

    /* Fins a la veda k: el castell, pis a pis, amb el recompte de cada pis. */
    function fins(k) {
      compte = bs.map(function () { return 0; });
      D.nodos.forEach(function (n, i) {
        var vis = i < k; nEls[i].classList.toggle('cp-h', !vis); nEls[i].classList.toggle('cp-u', i === k - 1); if (nEls[i].t) nEls[i].t.classList.toggle('cp-x', !vis);
        if (vis) compte[pos[n.id].pis]++;
      });
      eEls.forEach(function (e) { e.el.classList.toggle('cp-x', byId[e.a[0]].i >= k || byId[e.a[1]].i >= k); });
      etiq.forEach(function (t, i) { t.textContent = (mapa ? bs[i].s.toUpperCase() : bs[i].n) + ' · ' + compte[i]; });
      if (pin && op.lectura) lectura(k);
      var u = D.nodos[k - 1]; if (op.ara && u) op.ara.textContent = nom(u);
      if (rang) { rang.value = k; sort.textContent = k + ' / ' + D.nodos.length; }
    }

    /* La lectura de la pinya fins a la veda k, per a qui no sap què és una
       kosha ni una pinya: una barra per àrea, amb tres colors que diuen el
       mateix que les rengles (veda que sosté la seva àrea, que lliga amb una
       altra, que va sola), i una frase amb el que se'n treu. */
    var DIA = PARAULES.ca;
    var DIU_MENA = { primera: 'sosté la seva àrea', vent: 'lliga amb una altra àrea', lateral: 'va sola' };
    function lectura(k) {
      var per = A.pilars.map(function () { return { primera: 0, vent: 0, lateral: 0 }; });
      D.nodos.forEach(function (n, i) { if (i < k) per[pos[n.id].pis][A.menaDe[n.id]]++; });
      var tot = per.map(function (x) { return x.primera + x.vent + x.lateral; }), max = Math.max.apply(null, tot.concat(1));
      var nomDe = function (p) { return DIA[p.capa.id] || p.capa.n; };
      var seg = function (x, m, i) {
        if (!x[m]) return '';
        var w = 100 * x[m] / max, cl = m === 'vent' ? 'cp-lp-v' : m === 'lateral' ? 'cp-lp-s' : '';
        return '<i class="' + cl + '" style="width:' + w + '%' + (m === 'primera' ? ';background:' + col(A.pilars[i].capa.id) : '') + '" title="' + x[m] + ' ' + DIU_MENA[m] + '">' + (w > 7 ? x[m] : '') + '</i>';
      };
      var llista = A.pilars.map(function (p, i) {
        return '<div class="cp-lp-f"><b>' + nomDe(p) + '<small>' + p.capa.s + '</small></b><div class="cp-lp-b" role="img" aria-label="' + nomDe(p) + ': ' +
          per[i].primera + ' ' + DIU_MENA.primera + ', ' + per[i].vent + ' ' + DIU_MENA.vent + ', ' + per[i].lateral + ' ' + DIU_MENA.lateral + '">' +
          seg(per[i], 'primera', i) + seg(per[i], 'vent', i) + seg(per[i], 'lateral', i) + '</div></div>';
      }).join('');
      /* La frase: l'àrea que més lliga, la que més va sola, i les que no lliguen amb cap. */
      var quota = function (m) { var b = -1, bi = -1; per.forEach(function (x, i) { var q = tot[i] ? x[m] / tot[i] : -1; if (q > b) { b = q; bi = i; } }); return bi; };
      var sols = A.pilars.filter(function (p, i) { return tot[i] && !per[i].vent; }).map(nomDe);
      var lliga = quota('vent'), sola = quota('lateral');
      var frase = sols.length ? 'No lliga amb cap altra àrea: <b>' + sols.join(', ') + '</b>. És un silo: el que s\'hi aprèn no arriba a la resta.'
        : 'Totes les àrees lliguen amb alguna altra: cap no queda aïllada.';
      if (lliga >= 0 && tot[lliga]) frase += ' La que més lliga és <b>' + nomDe(A.pilars[lliga]) + '</b>' + (sola >= 0 && sola !== lliga && per[sola].lateral ? '; la que més va sola, <b>' + nomDe(A.pilars[sola]) + '</b>.' : '.');
      op.lectura.innerHTML = '<div class="cp-lp"><ul class="cp-lp-ll"><li><i style="background:linear-gradient(90deg,' + A.pilars.map(function (p) { return col(p.capa.id); }).join(',') + ')"></i>' + DIU_MENA.primera + ' (el color de l\'àrea)</li><li><i class="cp-lp-v" style="background:var(--cp-lliga)"></i>' + DIU_MENA.vent +
        '</li><li><i style="background:repeating-linear-gradient(135deg,transparent 0 3px,rgba(0,0,0,.25) 3px 5px);border:1px solid var(--border,#ddd7c8)"></i>' + DIU_MENA.lateral + '</li></ul>' + llista + '<p>' + frase + '</p></div>';
    }

    /* En moviment, en bucle, i només quan es veu: fora de pantalla o amb la
       pestanya amagada no gasta res. Qui demana menys moviment el veu sencer. */
    /* El mode temporal a mà: reproduir o aturar, i una barra fins a la veda que vulguis. */
    var rang = null, sort = null, boto = null;
    if (op.control) {
      op.control.innerHTML = '<div class="cp-t"><button type="button">▶ En el temps</button><input type="range" min="1" max="' + D.nodos.length + '" aria-label="Fins a la veda"><output></output></div>';
      boto = op.control.querySelector('button'); rang = op.control.querySelector('input'); sort = op.control.querySelector('output');
      boto.addEventListener('click', function () { if (timer) { parat = true; atura(); } else { parat = false; if (k >= D.nodos.length) k = 0; engega(); } });
      rang.addEventListener('input', function () { parat = true; atura(); k = +rang.value; fins(k); });
    }
    var quiet = raiz.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, k = op.des || 0, timer = null, veig = true, mort = false, parat = false;
    function pas() { k = k >= D.nodos.length + 40 ? 1 : k + 1; fins(Math.min(k, D.nodos.length)); }
    function engega() { if (!mort && !parat && !timer && veig && !document.hidden) timer = setInterval(pas, op.pas || 90); if (boto) boto.textContent = timer ? '❚❚ Atura' : '▶ En el temps'; }
    function atura() { clearInterval(timer); timer = null; if (boto) boto.textContent = '▶ En el temps'; }
    if (quiet || op.mou === false) { k = D.nodos.length; fins(k); parat = true; }
    else {
      fins(k); engega();
      if (raiz.IntersectionObserver) new IntersectionObserver(function (es) { veig = es[0].isIntersecting; veig ? engega() : atura(); }).observe(caixa);
      document.addEventListener('visibilitychange', function () { document.hidden ? atura() : engega(); });
    }
    return { fins: fins, tria: tria, atura: atura, engega: engega, treu: function () { mort = true; atura(); }, pisos: function () { return bs.map(function (b, i) { return { n: b.n, vedes: compte[i] }; }); } };
  }

  /* El JSON compacte que escriu `SOS/tools/build-cervell-dades.js`. */
  function dades(J) {
    var nodos = J.vedes.map(function (v) { return { id: 'tt:' + v[0], n: v[0], capa: v[1], t: v[2] }; });
    return { nodos: nodos, aristas: J.cites.map(function (c) { return ['tt:' + c[0], 'tt:' + c[1]]; }), capas: J.capes };
  }

  raiz.CervellPla = { munta: munta, dades: dades, franges: franges, geometria: geometria, corba: corba, PARAULES: PARAULES };
})(window);
