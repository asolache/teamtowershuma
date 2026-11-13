/* ══ PANTALLA · una pàgina = unes quantes pantalles, no un rotlle ══════════
   Decisió de l'Álvaro (13/11/2026): només la portada fa scroll llarg. La
   resta de pàgines es comporten com una aplicació: la barra a dalt, les
   pantalles en pestanyes, «anterior · següent» a baix, i scroll només quan
   el que es mira és de debò una llista que no hi cap.

   **Una sola peça per a totes les pàgines** (regla DRY del 17/10): una pàgina
   s'hi apunta amb dues coses i res més —
       <body data-pantalla>   …   <script src="/SOS/lib/pantalla.js" defer></script>
   No cal tocar-ne l'HTML. Les pantalles surten de les `<section id>` que ja
   hi ha (les de primer nivell, no les que van dins d'una altra secció), i
   el que hi ha abans de la primera —el hero— fa de pantalla «Inici» si té
   prou cos; si no (un avís de dues línies), va amb la primera.

   El nom de cada pestanya: `data-pantalla-nom` a la secció si n'hi ha; si
   no, el text de l'enllaç que la pàgina ja hi tenia al seu índex propi; si
   no, el començament del seu h2. L'índex propi de la pàgina queda amagat:
   les pestanyes en fan la feina, i dos índexs serien dos llocs per al mateix.

   **Cada pantalla té el seu enllaç** (regla «la màxima de tot és un link»,
   24/10): les pestanyes són `<a href="#id">`, i obrir la pàgina amb
   `#id` —o amb l'id de qualsevol cosa de dins— obre la pantalla on viu.
   Enrere del navegador torna a la pantalla d'abans.

   Sense JavaScript, o si alguna cosa peta, la pàgina és la de sempre: tot el
   CSS penja de `html.tt-pant-on`, que només posa aquest fitxer. I en imprimir
   surt sencera. Només tokens de la pell (build-pell.js), cap color a mà. */
(function () {
  'use strict';
  var body = document.body;
  if (!body || !body.hasAttribute('data-pantalla') || document.documentElement.classList.contains('tt-pant-on')) return;

  var TX = {
    ca: { inici: 'Inici', ant: 'Anterior', seg: 'Següent', pant: 'Pantalles d\'aquesta pàgina' },
    es: { inici: 'Inicio', ant: 'Anterior', seg: 'Siguiente', pant: 'Pantallas de esta página' },
    en: { inici: 'Start', ant: 'Previous', seg: 'Next', pant: 'Screens on this page' }
  };
  var lang, T;
  function idioma() {
    lang = (document.documentElement.lang || 'ca').slice(0, 2);
    T = TX[lang] || { inici: 'Inici', ant: 'Anterior', seg: 'Següent', pant: 'Pantalles' };
  }
  idioma();

  var main = document.querySelector('main') || body;
  var seccions = [].filter.call(main.querySelectorAll('section[id]'), function (s) {
    return !s.parentElement.closest('section');
  });
  if (seccions.length < 2) return;

  /* ── 1 · Repartir la pàgina en pantalles ──────────────────────────────
     Es recorre el document des del body: una secció-pantalla és la seva
     pantalla; un bloc que en conté alguna s'obre i es mira per dins; la
     resta de blocs van amb la pantalla on cauen (abans de la primera, a
     l'inici; després, a la darrera vista). La barra, els scripts, el que és
     fix (avisos, modals) i el salt d'accessibilitat no són de cap. */
  var NO = /^(SCRIPT|STYLE|TEMPLATE|LINK|META|NOSCRIPT)$/;
  var pre = [], grups = seccions.map(function () { return []; }), cur = -1;
  function salta(e) {
    if (NO.test(e.tagName) || e.classList.contains('tt-nav') || e.classList.contains('salta')) return true;
    if (e.hasAttribute('data-pantalla-fix')) return true;
    var p = getComputedStyle(e).position;
    return p === 'fixed';
  }
  (function recorre(pare) {
    [].forEach.call(pare.children, function (e) {
      if (salta(e)) return;
      var i = seccions.indexOf(e);
      if (i >= 0) { cur = i; grups[i].push(e); return; }
      if (seccions.some(function (s) { return e.contains(s); })) { recorre(e); return; }
      (cur < 0 ? pre : grups[cur]).push(e);
    });
  })(body);

  /* L'índex propi de la pàgina (un <nav> que només enllaça pantalles) se'n
     va, i es queda el que cada enllaç deia com a nom de la pestanya. */
  var nomIndex = {};
  [].forEach.call(document.querySelectorAll('nav:not(.tt-nav)'), function (n) {
    var as = [].slice.call(n.querySelectorAll('a[href^="#"]'));
    if (!as.length || n.closest('section')) return;
    var totes = as.every(function (a) { return seccions.some(function (s) { return '#' + s.id === a.getAttribute('href'); }); });
    if (!totes) return;
    as.forEach(function (a) { nomIndex[a.getAttribute('href').slice(1)] = a.textContent.trim(); });
    var amaga = n, h = n.closest('header');
    if (h && h.textContent.trim() === n.textContent.trim()) amaga = h;
    amaga.classList.add('tt-pant-index');
    pre = pre.filter(function (e) { return e !== amaga; });
    grups.forEach(function (g, k) { grups[k] = g.filter(function (e) { return e !== amaga; }); });
  });

  /* Pàgines bilingües: `data-pantalla-nom-ca`, `data-pantalla-nom-es`… guanyen
     a `data-pantalla-nom`, i en canviar `<html lang>` els noms es refan. */
  function nomDe(s) {
    if (s.getAttribute('data-pantalla-nom-' + lang)) return s.getAttribute('data-pantalla-nom-' + lang);
    if (s.getAttribute('data-pantalla-nom')) return s.getAttribute('data-pantalla-nom');
    if (nomIndex[s.id]) return nomIndex[s.id];
    var h = s.querySelector('h2,h1,h3');
    var t = (h ? h.textContent : s.id).replace(/\s+/g, ' ').trim();
    t = t.split(/[·.:,;—]/)[0].trim();
    if (t.length > 30) t = t.slice(0, 28).replace(/\s+\S*$/, '') + '…';
    return t || s.id;
  }

  var pantalles = seccions.map(function (s, i) { return { id: s.id, nom: nomDe(s), nodes: grups[i], sec: s }; });
  var cosPre = pre.reduce(function (n, e) { return n + (e.textContent || '').trim().length; }, 0);
  var heroPre = pre.some(function (e) { return e.matches('h1') || !!e.querySelector('h1'); });
  if (pre.length && (heroPre || cosPre > 240)) {
    var idInici = body.getAttribute('data-pantalla-inici') || 'inici';
    if (document.getElementById(idInici)) idInici = 'pantalla-inici';
    pantalles.unshift({ id: idInici, nom: T.inici, nodes: pre, virtual: true });
  } else if (pre.length) {
    pantalles[0].nodes = pre.concat(pantalles[0].nodes);
  }
  pantalles.forEach(function (p, i) { p.nodes.forEach(function (e) { e.setAttribute('data-pant', i); }); });

  /* ── 2 · Les pestanyes i el peu de navegació ─────────────────────────── */
  var css = document.createElement('style');
  css.textContent = [
    'html.tt-pant-on .tt-pant-fora,html.tt-pant-on .tt-pant-index{display:none!important}',
    'html.tt-pant-on{scroll-padding-top:calc(var(--tt-pant-dalt,0px) + 3.2rem)}',
    '.tt-pant-tabs{position:sticky;top:var(--tt-pant-dalt,0px);z-index:90;display:flex;gap:.3rem;overflow-x:auto;',
    '  scrollbar-width:none;padding:.45rem max(.75rem,calc((100% - 1180px)/2));margin:0;',
    '  background:color-mix(in srgb,var(--bg) 94%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);',
    '  font-family:\'Space Grotesk\',-apple-system,BlinkMacSystemFont,\'Segoe UI\',Helvetica,Arial,sans-serif;font-size:var(--t0)}',
    '.tt-pant-tabs::-webkit-scrollbar{display:none}',
    '.tt-pant-tabs a{flex:none;white-space:nowrap;text-decoration:none;color:var(--light);padding:.32rem .7rem;',
    '  border-radius:999px;border:1px solid var(--border);background:var(--card);line-height:1.3}',
    '.tt-pant-tabs a:hover{color:var(--text);background:var(--panel)}',
    '.tt-pant-tabs a[aria-current]{background:var(--indigo);border-color:var(--indigo);color:var(--on-accent);font-weight:600}',
    '.tt-pant-tabs a:focus-visible,.tt-pant-pag a:focus-visible{outline:2px solid var(--indigo);outline-offset:2px}',
    '.tt-pant-pag{position:sticky;bottom:0;z-index:90;display:flex;align-items:center;gap:.5rem;',
    '  padding:.45rem max(.75rem,calc((100% - 1180px)/2)) calc(.45rem + env(safe-area-inset-bottom,0px));',
    '  background:color-mix(in srgb,var(--bg) 94%,transparent);backdrop-filter:blur(12px);border-top:1px solid var(--border);',
    '  font-family:\'Space Grotesk\',-apple-system,BlinkMacSystemFont,\'Segoe UI\',Helvetica,Arial,sans-serif;font-size:var(--t0)}',
    '.tt-pant-pag a{display:inline-flex;align-items:center;min-height:2.4rem;max-width:42%;padding:.2rem .75rem;border-radius:9px;',
    '  text-decoration:none;color:var(--text);border:1px solid var(--border);background:var(--card);',
    '  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.tt-pant-pag a:hover{background:var(--panel)}',
    '.tt-pant-pag .tt-pant-seg{margin-left:auto;background:var(--indigo);border-color:var(--indigo);color:var(--on-accent);font-weight:600}',
    '.tt-pant-pag .tt-pant-n{color:var(--muted);white-space:nowrap}',
    '.tt-pant-pag [hidden]{display:none}',
    '@media (pointer:coarse){.tt-pant-tabs a{min-height:40px;display:inline-flex;align-items:center}.tt-pant-pag a{min-height:44px}}',
    '@media print{html.tt-pant-on .tt-pant-fora{display:revert!important}.tt-pant-tabs,.tt-pant-pag{display:none!important}}'
  ].join('\n');
  document.head.appendChild(css);

  var tabs = document.createElement('nav');
  tabs.className = 'tt-pant-tabs';
  tabs.setAttribute('aria-label', T.pant);
  pantalles.forEach(function (p) {
    var a = document.createElement('a');
    a.href = '#' + p.id; a.textContent = p.nom;
    p.tab = a; tabs.appendChild(a);
  });
  var primer = pantalles[0].nodes[0];
  primer.parentNode.insertBefore(tabs, primer);

  var pag = document.createElement('nav');
  pag.className = 'tt-pant-pag';
  pag.setAttribute('aria-label', T.pant);
  var aAnt = document.createElement('a'), nPos = document.createElement('span'), aSeg = document.createElement('a');
  nPos.className = 'tt-pant-n'; aSeg.className = 'tt-pant-seg';
  pag.appendChild(aAnt); pag.appendChild(nPos); pag.appendChild(aSeg);
  body.appendChild(pag);

  /* La barra del lloc és sticky i la seva alçada canvia (menú obert, mòbil):
     les pestanyes s'hi enganxen a sota. */
  var nav = document.querySelector('.tt-nav');
  function dalt() { document.documentElement.style.setProperty('--tt-pant-dalt', (nav ? nav.offsetHeight : 0) + 'px'); }
  dalt();
  if (nav && window.ResizeObserver) new ResizeObserver(dalt).observe(nav);

  /* ── 3 · Mostrar una pantalla ──────────────────────────────────────────── */
  var actual = -1;
  function peu(i) {
    var a = pantalles[i - 1], s = pantalles[i + 1];
    aAnt.hidden = !a; aSeg.hidden = !s;
    if (a) { aAnt.href = '#' + a.id; aAnt.textContent = '← ' + a.nom; aAnt.title = T.ant; }
    if (s) { aSeg.href = '#' + s.id; aSeg.textContent = s.nom + ' →'; aSeg.title = T.seg; }
    nPos.textContent = (i + 1) + ' / ' + pantalles.length;
  }
  function mostra(i, desti) {
    if (i !== actual) {
      actual = i;
      pantalles.forEach(function (p, k) {
        p.nodes.forEach(function (e) { e.classList.toggle('tt-pant-fora', k !== i); });
        if (k === i) p.tab.setAttribute('aria-current', 'page'); else p.tab.removeAttribute('aria-current');
      });
      peu(i);
      try { pantalles[i].tab.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) {}
      /* Gràfics i canvas que es mesuren en carregar: ara tenen mida. */
      try { window.dispatchEvent(new Event('resize')); } catch (e) {}
    }
    if (desti && !pantalles.some(function (p) { return p.id === desti.id; })) {
      requestAnimationFrame(function () { vesA(desti); });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }
  function onViu(e) {
    for (var n = e; n && n !== body; n = n.parentElement) {
      if (n.hasAttribute && n.hasAttribute('data-pant')) return +n.getAttribute('data-pant');
    }
    return -1;
  }
  function deHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!id) return mostra(actual < 0 ? 0 : actual);
    var k = pantalles.findIndex ? pantalles.findIndex(function (p) { return p.id === id; }) : -1;
    if (k >= 0) return mostra(k);
    var e = document.getElementById(id);
    var i = e ? onViu(e) : -1;
    if (i >= 0) mostra(i, e); else if (actual < 0) mostra(0);
  }

  /* El codi de les pàgines fa `x.scrollIntoView()` a coses que ara poden ser
     en una pantalla amagada: primer s'obre la seva pantalla. */
  var orig = Element.prototype.scrollIntoView;
  function vesA(e) { orig.call(e, { block: 'start' }); }
  Element.prototype.scrollIntoView = function () {
    var i = onViu(this);
    if (i >= 0 && i !== actual) mostra(i);
    return orig.apply(this, arguments);
  };

  /* El selector d'idioma de la pàgina canvia `<html lang>`: pestanyes,
     «anterior · següent» i etiquetes en el nou idioma, sense moure's. */
  if (window.MutationObserver) new MutationObserver(function () {
    var abans = lang; idioma(); if (lang === abans) return;
    pantalles.forEach(function (p) { p.nom = p.virtual ? T.inici : nomDe(p.sec); p.tab.textContent = p.nom; });
    tabs.setAttribute('aria-label', T.pant); pag.setAttribute('aria-label', T.pant);
    window.TTPantalla.pantalles = pantalles.map(function (p) { return { id: p.id, nom: p.nom }; });
    if (actual >= 0) peu(actual);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  document.documentElement.classList.add('tt-pant-on');
  window.addEventListener('hashchange', deHash);
  deHash();

  window.TTPantalla = { pantalles: pantalles.map(function (p) { return { id: p.id, nom: p.nom }; }), mostra: function (i) { mostra(i); }, actual: function () { return actual; } };
})();
