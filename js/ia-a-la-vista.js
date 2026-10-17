/* La IA a la vista · veda 167
 * ─────────────────────────────────────────────────────────────────────────────
 * Un sol giny per a tots els projectes de la casa: compta els commits que porten
 * la firma de Claude llegint l'historial públic del repositori, cada cop que
 * s'obre la pàgina. Res no s'escriu a mà (veda 102): el número surt de GitHub.
 *
 *   <div data-ia-a-la-vista="propietari/repositori" lang="ca">…text de recanvi…</div>
 *   <script src="https://teamtowershuma.com/js/ia-a-la-vista.js" defer></script>
 *
 * El contingut del div és el recanvi: si GitHub no respon, es queda el que hi
 * havia, que ha de dir on és l'historial (veda 105: el silenci menteix).
 * Idiomes: `ca` i `es`, segons l'atribut `lang` del div o de la pàgina.
 */
(function () {
  var T = {
    ca: { de: ' de ', firma: function (n) { return 'commits dels últims ' + n + ' porten la firma de Claude. Els vuit més recents:'; }, amb: 'amb Claude', sense: 'sense IA' },
    es: { de: ' de ', firma: function (n) { return 'commits de los últimos ' + n + ' llevan la firma de Claude. Los ocho más recientes:'; }, amb: 'con Claude', sense: 'sin IA' }
  };
  var FIRMA = /co-authored-by:\s*claude/i;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pinta(box) {
    var repo = box.getAttribute('data-ia-a-la-vista');
    var l = (box.closest('[lang]') || document.documentElement).getAttribute('lang') || 'es';
    var t = T[l.slice(0, 2)] || T.es;
    fetch('https://api.github.com/repos/' + repo + '/commits?per_page=100')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (cs) {
        var n = cs.filter(function (c) { return FIRMA.test(c.commit.message); }).length;
        box.innerHTML = '<p class="iav-cifra">' + n + t.de + cs.length + '</p><p class="iav-nota">' + t.firma(cs.length) + '</p><ul class="iav-llista">' +
          cs.slice(0, 8).map(function (c) {
            var ia = FIRMA.test(c.commit.message);
            var f = c.commit.author.date.slice(0, 10).split('-').reverse().join('/');
            return '<li><span class="iav-tag' + (ia ? ' iav-ia">' + t.amb : '">' + t.sense) + '</span><a href="' + esc(c.html_url) + '">' +
              esc(c.commit.message.split('\n')[0]) + '</a><span class="iav-tag">' + f + '</span></li>';
          }).join('') + '</ul>';
      })
      .catch(function () { /* es queda el recanvi */ });
  }
  function totes() { Array.prototype.forEach.call(document.querySelectorAll('[data-ia-a-la-vista]'), pinta); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', totes); else totes();
})();
