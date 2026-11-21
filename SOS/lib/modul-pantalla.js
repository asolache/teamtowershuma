/* ══ MÒDUL ↔ PANTALLA · cada pantalla del SOS sap on s'aprèn ════════════════
   Encàrrec de l'Álvaro (21/11/2026): «que cada una de las pantallas y la
   explicación de la formación acción muestre ya también el enlace directo o la
   vista a cada una de las pantallas». Les dues direccions, d'una sola font:

     SOS/knowledge/formacio/certificacio.json  → `pantalles` de cada pràctica
        └ build-certificacio.js → formacio.html (enllaç + vista), certificacio.html
                                 i moduls.json, que és el que llegeix aquesta peça

   Aquí no s'hi declara cap pantalla ni cap nom de mòdul (veda 187): tot surt
   de moduls.json. Fa dues feines i prou:

   1. **La tornada.** A qualsevol pantalla que surti en algun mòdul, una pastilla
      discreta a baix: «🎓 S'aprèn al mòdul 4 · Gestió de recursos compartits»,
      que obre formacio.html#m4. Si la pantalla és de més d'un mòdul, els diu
      tots. A l'app (index.html) la clau és la ruta (`#/identitat`), i canvia
      amb `hashchange`.
   2. **La vista.** A formacio.html, els `<details class="vista-pant">` no
      carreguen res fins que s'obren: llavors l'iframe rep l'adreça. Vint-i-dues
      pantalles carregades de cop serien baixar el SOS sencer per llegir un
      temari.

   Dins d'una vista (un iframe) la pastilla no surt: qui mira la pantalla des
   del mòdul ja sap de quin mòdul ve.

   Una pàgina s'hi apunta amb una línia:
       <script src="/SOS/lib/modul-pantalla.js" defer></script>
   Sense JavaScript no passa res: la pàgina és la de sempre. Només tokens de la
   pell (build-pell.js), cap color a mà.

   Node (tests): module.exports = { clau, index, mòdulsDe }. */
(function (g) {
  'use strict';
  var DADES = '/SOS/knowledge/formacio/moduls.json';

  /* La clau d'una adreça: el fitxer, o la ruta de l'app fins a dos trossos
     (`#/fons/impacte`), o la carpeta del client. Les dues bandes —el que diu
     moduls.json i el que el navegador té obert— passen per aquí. */
  function clau(path, hash) {
    path = String(path || '/');
    var f = path.replace(/^.*\/SOS\//, '').replace(/^\//, '');
    if (/^cliente\/?/.test(f) || /\/cliente\/?$/.test(path)) return 'cliente/' + (/panel/.test(hash || '') ? '#panel' : '');
    if (!/\/SOS\//.test(path)) return '';
    if (f === '' || f === 'index.html') {
      var r = String(hash || '').replace(/^#\/?/, '').split('/').filter(Boolean);
      if (!r.length) return '';
      if (r[0] === 'n' || r[0] === 't' || r[0] === 'sync') return '';
      return '#/' + r.slice(0, r[0] === 'fons' && r[1] ? 2 : 1).join('/');
    }
    return f.split('?')[0];
  }
  function clauDeU(u) {
    var m = String(u).match(/^([^#]*)(#.*)?$/);
    return clau(m[1], m[2] || '');
  }
  /* clau → [{id, n, t:{ca,es}}] */
  function index(dades) {
    var ix = {};
    ((dades && dades.moduls) || []).forEach(function (m) {
      (m.pantalles || []).forEach(function (p) {
        var k = clauDeU(p.u);
        if (!k) return;
        (ix[k] = ix[k] || []);
        if (!ix[k].some(function (x) { return x.id === m.id; })) ix[k].push({ id: m.id, n: m.n, t: m.t });
      });
    });
    return ix;
  }
  function modulsDe(ix, path, hash) { return ix[clau(path, hash)] || []; }

  if (typeof module === 'object' && module.exports) module.exports = { clau: clau, index: index, modulsDe: modulsDe };
  if (typeof document === 'undefined') return;

  var TX = {
    ca: { un: 'S\'aprèn al mòdul', molts: 'S\'aprèn als mòduls', tanca: 'Amaga' },
    es: { un: 'Se aprende en el módulo', molts: 'Se aprende en los módulos', tanca: 'Ocultar' }
  };
  function lang() { return (document.documentElement.lang || 'ca').slice(0, 2) === 'es' ? 'es' : 'ca'; }

  /* ── 2. La vista, que només es carrega en obrir-la ── */
  function vistes() {
    var ds = document.querySelectorAll('details.vista-pant');
    Array.prototype.forEach.call(ds, function (d) {
      d.addEventListener('toggle', function () {
        var f = d.querySelector('iframe[data-src]');
        if (d.open && f && !f.getAttribute('src')) f.setAttribute('src', f.getAttribute('data-src'));
      });
    });
  }

  /* ── 1. La tornada ── */
  var dinsVista = false;
  try { dinsVista = g.self !== g.top; } catch (e) { dinsVista = true; }
  var IX = null, tancada = false;
  function css() {
    if (document.getElementById('tt-mp-css')) return;
    var s = document.createElement('style');
    s.id = 'tt-mp-css';
    s.textContent = [
      '.tt-mp{position:fixed;left:.6rem;bottom:.6rem;z-index:80;max-width:min(92vw,26rem);display:flex;gap:.3rem;align-items:center;',
      '  background:var(--card,#fff);color:var(--text,#222);border:1px solid var(--border,#ddd);border-left:3px solid var(--green,#2a7);',
      '  border-radius:10px;padding:.35rem .55rem;font:500 var(--t0,15px)/1.3 \'Space Grotesk\',-apple-system,BlinkMacSystemFont,\'Segoe UI\',Helvetica,Arial,sans-serif;',
      '  box-shadow:0 2px 10px rgba(0,0,0,.08)}',
      '.tt-mp a{color:var(--text,#222);text-decoration:none}.tt-mp a:hover,.tt-mp a:focus-visible{text-decoration:underline}',
      '.tt-mp .tt-mp-x{flex:none;border:0;background:none;color:var(--muted,#777);cursor:pointer;font-size:1rem;line-height:1;padding:0 .15rem}',
      '@media print{.tt-mp{display:none}}'
    ].join('\n');
    document.head.appendChild(s);
  }
  function pinta() {
    var vell = document.getElementById('tt-mp');
    if (vell) vell.remove();
    if (!IX || tancada || dinsVista) return;
    var ms = modulsDe(IX, location.pathname, location.hash);
    if (!ms.length) return;
    var L = lang(), T = TX[L];
    css();
    var b = document.createElement('div');
    b.id = 'tt-mp'; b.className = 'tt-mp'; b.setAttribute('role', 'note');
    var txt = '<span aria-hidden="true">🎓</span><span>' + (ms.length === 1 ? T.un : T.molts) + ' ';
    txt += ms.map(function (m) {
      var t = (m.t && (m.t[L] || m.t.ca)) || m.id;
      return '<a href="/SOS/formacio.html#' + m.id + '">' + m.n + (ms.length === 1 ? ' · ' + esc(t) : '') + '</a>';
    }).join(' · ');
    txt += '</span><button type="button" class="tt-mp-x" aria-label="' + T.tanca + '" title="' + T.tanca + '">×</button>';
    b.innerHTML = txt;
    if (ms.length > 1) b.title = ms.map(function (m) { return m.n + ' · ' + ((m.t && (m.t[L] || m.t.ca)) || ''); }).join('\n');
    b.querySelector('.tt-mp-x').onclick = function () { tancada = true; b.remove(); };
    document.body.appendChild(b);
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function arrenca() {
    vistes();
    if (dinsVista || typeof fetch !== 'function') return;
    fetch(DADES).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d) return;
      IX = index(d);
      pinta();
      g.addEventListener('hashchange', function () { tancada = false; pinta(); });
    }).catch(function () { /* sense dades, sense pastilla */ });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrenca);
  else arrenca();
  g.ModulPantalla = { clau: clau, index: index, modulsDe: modulsDe };
})(typeof window !== 'undefined' ? window : globalThis);
