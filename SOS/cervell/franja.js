/* El cervell · la franja de la portada
 * ─────────────────────────────────────────────────────────────────────────────
 * El cervell del SOS construint-se com un castell (`pla.js`), amb un botó per
 * cada projecte públic de la xarxa: en triar-ne un, el seu codex es llegeix de
 * GitHub (`codex-parse.js`, que només es carrega llavors) i les seves vedes
 * pugen damunt de les del SOS, que és d'on les hereta. Un fill privat no es
 * llegeix mai. Cap dada viu aquí: el SOS surt de `teamtowers.json`.
 *
 *   <div id="cvTop" data-alt="170"></div>  (alçada opcional) i, si n'hi ha, <button data-repo="propietari/repo">  i  <a id="cvTop3d">
 */
(function () {
  var c = document.getElementById('cvTop'), DIR = document.currentScript.src.replace(/[^/]*$/, '');
  if (!c || !window.CervellPla || !window.fetch) return;
  var base = null, vista = null, a3 = document.getElementById('cvTop3d');
  /* `data-universal`: les capes amb paraules de tothom i no amb el nom de la
     kosha (portada, 22/10/2026). La llengua és la de la pàgina en pintar. */
  var UNI = { ca: { anna: 'Cos', prana: 'Energia', mano: 'Ment', vijnana: 'Criteri', ananda: 'Propòsit' },
    es: { anna: 'Cuerpo', prana: 'Energía', mano: 'Mente', vijnana: 'Criterio', ananda: 'Propósito' } };
  if (c.hasAttribute('data-universal') && window.MutationObserver)
    new MutationObserver(function () { if (darrer) pinta(darrer[0], darrer[1]); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  function universals() {
    if (!c.hasAttribute('data-universal')) return null;
    return UNI[(document.documentElement.lang || 'ca').slice(0, 2)] || UNI.es;
  }
  var darrer = null;
  function pinta(D, des) {
    darrer = [D, des];
    if (vista) vista.treu();
    vista = CervellPla.munta(c, D, { vista: 'castellera', alt: +c.getAttribute('data-alt') || 170, des: des, paraules: universals(),
      etiqueta: D.nodos.length + ' vedes, de la primera a l\'última, en tres pisos: pinya, tronc i pom de dalt.' });
  }
  function lector() {
    return window.CodexParse ? Promise.resolve(window.CodexParse) : new Promise(function (ok, ko) {
      var s = document.createElement('script'); s.src = DIR + 'codex-parse.js';
      s.onload = function () { ok(window.CodexParse); }; s.onerror = ko; document.head.appendChild(s);
    });
  }
  function tria(b) {
    var repo = b.getAttribute('data-repo');
    document.querySelectorAll('[data-repo]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    if (a3) a3.href = '/SOS/cervell.html' + (repo ? '?repo=' + encodeURIComponent(repo) : '');
    if (!repo) return pinta(base);
    var CP;
    lector().then(function (x) { CP = x; return CP.deRepo(repo); }).then(function (f) {
      if (!f || b.getAttribute('aria-pressed') !== 'true') return;
      var L = CP.lee(f.codex, { nom: f.nom || repo.split('/')[1], matriz: 'tt', plantilla: f.plantilla, herencia: f.herencia });
      pinta({ nodos: base.nodos.concat(L.nodos), aristas: base.aristas.concat(CP.limpia(L.nodos, L.aristas, base.nodos.map(function (n) { return n.id; }))), capas: base.capas }, base.nodos.length);
    }).catch(function () { b.disabled = true; });
  }
  fetch(DIR + 'teamtowers.json').then(function (r) { return r.json(); }).then(function (J) {
    base = CervellPla.dades(J); pinta(base);
    document.addEventListener('click', function (e) { var b = e.target.closest('[data-repo]'); if (b && base) tria(b); });
  }).catch(function () { c.hidden = true; });
})();
