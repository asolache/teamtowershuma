/* ══ ACOLLIDA · «Tu espacio», el de un client que ja treballa amb nosaltres ══
   Àlvaro (14/11/2026): «que lo próximo que le envíe a María le llegue por
   ahí, con todo lo que me ha enviado por correo dentro […] superar por diez la
   experiencia […] fácilmente replicable. Dry».

   Una sola vista per a tots els clients. Les dades les posa l'Àlvaro des del
   seu panell (netlify/lib/acollida.mjs) i arriben amb la fitxa del client
   (`S.acollida`); les tasques són les del kanban únic (`S.kanban`). Cinc
   pantalles en pestanyes, sense scroll llarg (regla del 13/11), cadascuna amb
   el seu enllaç (#espacio/hola, #espacio/contado…), i a baix un sol botó: el
   pas següent, que acaba en una persona (SOS/lib/recorrido.js).

   Sense jerga ni noms d'eines; sense preus. Només tokens de la pell. */
(function (g) {
  'use strict';
  var T = {
    es: {
      tit: 'Tu espacio', hola: 'Hola', contat: 'Lo que nos contaste', mapa: 'Tu mapa', toca: 'Lo que te toca', web: 'Tu web',
      sessio: 'Próxima sesión: {0}', decidit: 'Lo que ya has decidido', preg: 'Lo que aún te queremos preguntar',
      falta: '¿Falta algo o no es así? Dínoslo', mapaN: 'En tu mapa hay {0} con quien intercambias valor.', mapaV: 'Tu mapa aún está por dibujar.',
      mapaA: 'Abrir tu mapa', tocaN: '{0} por hacer · {1} hechas', tocaV: 'Ahora mismo no te toca nada. Descansa.', tocaA: 'Ver todas tus tareas',
      webA: 'Ver tu web', webV: 'Tu web está en camino: aquí la verás antes que nadie.', seg: 'Habla con Álvaro',
      buit: 'Si ya trabajas con nosotros, entra con el enlace que te mandamos y aquí verás tu espacio: lo que nos has contado, tu mapa, lo que te toca y tu web.',
      portal: 'Si tu espacio está en el portal, entra aquí', ant: '← Anterior', seg2: 'Siguiente →', link: 'Enlace a esta pantalla'
    },
    ca: {
      tit: 'El teu espai', hola: 'Hola', contat: 'El que ens vas explicar', mapa: 'El teu mapa', toca: 'El que et toca', web: 'La teva web',
      sessio: 'Propera sessió: {0}', decidit: 'El que ja has decidit', preg: 'El que encara et volem preguntar',
      falta: 'Hi falta alguna cosa o no és així? Digues-nos-ho', mapaN: 'Al teu mapa hi ha {0} amb qui intercanvies valor.', mapaV: 'El teu mapa encara està per dibuixar.',
      mapaA: 'Obre el teu mapa', tocaN: '{0} per fer · {1} fetes', tocaV: 'Ara mateix no et toca res. Descansa.', tocaA: 'Mira totes les teves tasques',
      webA: 'Mira la teva web', webV: 'La teva web és en camí: aquí la veuràs abans que ningú.', seg: 'Parla amb l\'Àlvar',
      buit: 'Si ja treballes amb nosaltres, entra amb l\'enllaç que et vam enviar i aquí veuràs el teu espai: el que ens has explicat, el teu mapa, el que et toca i la teva web.',
      portal: 'Si el teu espai és al portal, entra aquí', ant: '← Anterior', seg2: 'Següent →', link: 'Enllaç a aquesta pantalla'
    }
  };
  var PANTS = ['hola', 'contado', 'mapa', 'toca', 'web'];
  var CLAU = { hola: 'hola', contado: 'contat', mapa: 'mapa', toca: 'toca', web: 'web' };
  function f(s) { var a = arguments; return String(s).replace(/\{(\d)\}/g, function (_, i) { return a[+i + 1] == null ? '' : a[+i + 1]; }); }
  function el(tag, at, fills) {
    var n = document.createElement(tag);
    Object.keys(at || {}).forEach(function (k) { if (at[k] != null && at[k] !== false) n.setAttribute(k, at[k]); });
    [].concat(fills == null ? [] : fills).forEach(function (x) { if (x != null) n.appendChild(typeof x === 'string' ? document.createTextNode(x) : x); });
    return n;
  }
  var segur = function (h) { h = String(h || ''); return /^https:\/\/[^\s"'<>]+$/.test(h) || /^\/[^\s"'<>]*$/.test(h) ? h : ''; };

  var CSS = '.ac-tabs{display:flex;gap:.35rem;flex-wrap:wrap;margin:0 0 1rem;padding:0;list-style:none}'
    + '.ac-tabs a{display:inline-flex;align-items:center;min-height:44px;padding:0 .9rem;border:1px solid var(--border);border-radius:999px;color:var(--text);text-decoration:none;font-size:15px}'
    + '.ac-tabs a[aria-current]{background:var(--text);color:var(--bg);border-color:var(--text)}'
    + '.ac-p{display:grid;gap:.75rem;min-height:14rem;align-content:start}.ac-p[hidden]{display:none}'
    + '.ac-p ul{margin:0;padding-left:1.2rem;display:grid;gap:.4rem}.ac-p h3{margin:.5rem 0 0;font-size:1.05rem}'
    + '.ac-hola{font-size:1.2rem;line-height:1.45;margin:0}.ac-ses{color:var(--muted);margin:0}'
    + '.ac-peu{display:flex;gap:.5rem;justify-content:space-between;flex-wrap:wrap;margin-top:1rem;align-items:center}';

  function hashPant() { var m = /^#espacio(?:\/([a-z]+))?$/.exec(location.hash || ''); return m ? (PANTS.indexOf(m[1]) >= 0 ? m[1] : 'hola') : null; }

  /* `pinta(cont, { acollida, kanban, persones, llengua, nom })`. */
  function pinta(cont, o) {
    if (!cont) return;
    var t = T[o.llengua === 'ca' ? 'ca' : 'es'], a = o.acollida;
    if (!document.getElementById('ac-css')) { var st = el('style', { id: 'ac-css' }); st.textContent = CSS; document.head.appendChild(st); }
    cont.textContent = '';
    cont.appendChild(el('h2', {}, t.tit));
    if (!a) {
      cont.appendChild(el('p', {}, t.buit));
      cont.appendChild(el('p', {}, [el('a', { href: '/acceso' }, t.portal + ' →')]));
      return;
    }
    var actual = hashPant() || 'hola';
    var tabs = el('ul', { class: 'ac-tabs', role: 'list' }), panes = {};
    PANTS.forEach(function (p) { tabs.appendChild(el('li', {}, [el('a', { href: '#espacio/' + p, 'data-p': p }, t[CLAU[p]])])); });
    cont.appendChild(tabs);

    var ph = el('div', { class: 'ac-p', id: 'espacio-hola' });
    ph.appendChild(el('p', { class: 'ac-hola' }, a.hola || (t.hola + (o.nom ? ', ' + o.nom : '') + '.')));
    if (a.sessio) ph.appendChild(el('p', { class: 'ac-ses' }, f(t.sessio, a.sessio)));
    panes.hola = ph;

    var pc = el('div', { class: 'ac-p', id: 'espacio-contado' });
    var ll = function (xs) { var u = el('ul'); xs.forEach(function (x) { u.appendChild(el('li', {}, x)); }); return u; };
    if ((a.contat || []).length) pc.appendChild(ll(a.contat));
    if ((a.decidit || []).length) { pc.appendChild(el('h3', {}, t.decidit)); pc.appendChild(ll(a.decidit)); }
    if ((a.preguntes || []).length) { pc.appendChild(el('h3', {}, t.preg)); pc.appendChild(ll(a.preguntes)); }
    var fb = el('a', { href: '#', class: 'btn btn-ghost btn-sm js-ac-falta' }, t.falta);
    fb.addEventListener('click', function (e) { e.preventDefault(); if (g.Recorrido) g.Recorrido.contacta({ tema: t.contat }); });
    pc.appendChild(el('p', {}, [fb]));
    panes.contado = pc;

    var pm = el('div', { class: 'ac-p', id: 'espacio-mapa' });
    pm.appendChild(el('p', {}, o.persones ? f(t.mapaN, o.persones) : t.mapaV));
    pm.appendChild(el('p', {}, [el('a', { href: '#alrededor', class: 'btn btn-primary btn-sm' }, t.mapaA)]));
    panes.mapa = pm;

    var pt = el('div', { class: 'ac-p', id: 'espacio-toca' }), cs = ((o.kanban || {}).cards || []).filter(function (c) { return c.qui === 'cliente' || !c.qui; });
    var pend = cs.filter(function (c) { return c.col === 'todo' || c.col === 'doing'; });
    pt.appendChild(el('p', {}, pend.length ? f(t.tocaN, pend.length, cs.length - pend.length) : t.tocaV));
    if (pend.length) pt.appendChild(ll(pend.slice(0, 8).map(function (c) { return c.text; })));
    pt.appendChild(el('p', {}, [el('a', { href: '#tablero', class: 'btn btn-ghost btn-sm' }, t.tocaA)]));
    panes.toca = pt;

    var pw = el('div', { class: 'ac-p', id: 'espacio-web' }), w = segur(a.web);
    pw.appendChild(el('p', {}, w ? '' : t.webV));
    if (w) pw.appendChild(el('p', {}, [el('a', { href: w, class: 'btn btn-primary btn-sm', target: '_blank', rel: 'noopener' }, t.webA + ' ↗')]));
    panes.web = pw;

    PANTS.forEach(function (p) { cont.appendChild(panes[p]); });

    var peu = el('div', { class: 'ac-peu' }), nav = el('span');
    var ant = el('a', { href: '#', class: 'btn btn-ghost btn-sm' }, t.ant), seg = el('a', { href: '#', class: 'btn btn-ghost btn-sm' }, t.seg2);
    nav.appendChild(ant); nav.appendChild(document.createTextNode(' ')); nav.appendChild(seg);
    var s = a.seguent || {}, sh = segur(s.href);
    var cta = el('a', { href: sh || '#', class: 'btn btn-primary' }, s.text || t.seg);
    if (!sh) cta.addEventListener('click', function (e) { e.preventDefault(); if (g.Recorrido) g.Recorrido.contacta({ tema: s.text || '' }); });
    peu.appendChild(nav); peu.appendChild(cta);
    cont.appendChild(peu);

    function mostra(p) {
      actual = p;
      PANTS.forEach(function (q) { panes[q].hidden = q !== p; });
      [].forEach.call(tabs.querySelectorAll('a'), function (x) { if (x.dataset.p === p) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current'); });
      var i = PANTS.indexOf(p);
      ant.hidden = i === 0; seg.hidden = i === PANTS.length - 1;
    }
    var va = function (d) { return function (e) { e.preventDefault(); var i = PANTS.indexOf(actual) + d; if (i >= 0 && i < PANTS.length) location.hash = '#espacio/' + PANTS[i]; }; };
    ant.addEventListener('click', va(-1)); seg.addEventListener('click', va(1));
    mostra(actual);
    if (!pinta.escolta) { pinta.escolta = true; g.addEventListener('hashchange', function () { var p = hashPant(); if (p && pinta.mostra) pinta.mostra(p); }); }
    pinta.mostra = mostra;
  }

  g.AcollidaClient = { pinta: pinta, PANTALLES: PANTS, pantalla: hashPant };
})(typeof window !== 'undefined' ? window : globalThis);
