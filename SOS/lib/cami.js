/* El meu camí · el SOS com a canal per formar
 * ─────────────────────────────────────────────────────────────────────────────
 * L'Àlvaro, 22/10/2026: «el SOS ha de ser el nostre canal per formar, i fer el
 * món una mica millor a través del meu ikigai». Les peces ja hi eren, però
 * soltes: l'ikigai al taulell, el nivell al costat, la guia del rol en un modal
 * i els setze mòduls en una pàgina a part que l'app gairebé no citava.
 *
 * Aquí es lliguen en un sol camí que es llegeix de dalt a baix:
 *
 *   1 · per a què   → el teu ikigai: què t'agrada, què se't dona bé, què
 *                     necessita la xarxa i per què et paguen, arrelat al
 *                     compromís amb les teves arrels (l'Àlvaro, 22/10)
 *   2 · on ets      → el nivell, demostrat amb evidència (no amb un examen),
 *                     i què et falta, amb el número
 *   3 · què toca    → els mòduls del teu rol, ordenats pel teu nivell: els que
 *                     ja demostres, els d'ara i els de després
 *   4 · un sol pas  → fer, que és com s'aprèn i com es certifica
 *
 * La docència no es copia: cada mòdul obre `formacio.html#mN`, que és la font
 * única. Les dades i les accions les passa l'app (`d` i `op`); aquí només hi
 * ha la lectura.
 *
 *   Cami.obre(d, op)
 *     d  = { nom, iki: ikigaiQuadrants(), centre: ikigaiCenter(), pas: nextLevelGap() }
 *     op = { rol, rolNom, moduls, nivells, modal, tanca,
 *            registra(), guia(), mentoria(), perfil() }
 */
(function () {
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m];
    });
  };
  var estil = false;
  function posaEstil() {
    if (estil) return; estil = true;
    var s = document.createElement('style');
    s.textContent =
      '.cm-per{font-size:1rem;line-height:1.5;margin:.2rem 0 .9rem}' +
      '.cm-k{font:600 .75rem var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--indigo);margin:1rem 0 .4rem}' +
      '.cm-m{display:flex;gap:.6rem;align-items:flex-start;padding:.55rem 0;border-top:1px solid color-mix(in srgb,var(--text) 10%,transparent)}' +
      '.cm-m b{display:block}.cm-m .cm-e{font-size:.9rem;opacity:.8}' +
      '.cm-m .cm-n{flex:none;min-width:2.4rem;font:600 .8rem var(--mono);padding:.15rem .35rem;border-radius:6px;text-align:center;background:color-mix(in srgb,var(--text) 7%,transparent)}' +
      '.cm-m.ara .cm-n{background:var(--indigo);color:#fff}.cm-m.fet .cm-n{background:color-mix(in srgb,var(--green) 25%,transparent)}' +
      '.cm-m a{margin-left:auto;flex:none;white-space:nowrap}';
    document.head.appendChild(s);
  }
  var ORDRE = { N0: 0, N1: 1, N2: 2, N3: 3 };

  /* Els mòduls del rol, de tres menes segons el nivell que ja demostres. */
  function moduls(op, nivell) {
    var n = ORDRE[nivell] || 0;
    return op.moduls.filter(function (m) { return m.roles.indexOf(op.rol) >= 0; })
      .map(function (m) {
        var mn = ORDRE[m.level] || 0;
        return { m: m, estat: mn < n ? 'fet' : mn <= n + 1 ? 'ara' : 'despres' };
      })
      .sort(function (a, b) { return (ORDRE[a.m.level] - ORDRE[b.m.level]) || (a.m.n - b.m.n); });
  }

  function ikigai(d) {
    if (!d.iki) return '';
    var q = d.iki.quadrants.map(function (x) {
      return '<div class="iki-q' + (x.evidenciat ? ' ev' : ' dec') + (x.buit ? ' buit' : '') + '">' +
        '<div class="iki-h">' + esc(x.lbl) + '</div>' +
        (x.buit ? '<div class="iki-buit">' + esc(x.buitDiu) + '</div>'
          : '<div class="iki-items">' + x.items.slice(0, 3).map(function (i) {
            return '<span class="iki-i">' + i.ic + ' ' + esc(i.t) + '</span>';
          }).join('') + '</div>') + '</div>';
    }).join('');
    return '<div class="iki-grid">' + q + '</div>' +
      '<p class="m-sub">' + esc(d.centre ? d.centre.diu : '') + '</p>';
  }

  function obre(d, op) {
    posaEstil();
    var pas = d.pas, nivell = pas ? pas.nivell : 'N0';
    var meta = op.nivells.filter(function (l) { return l.id === nivell; })[0] || op.nivells[0];
    var llista = moduls(op, nivell);
    var html =
      '<h2>🎓 El meu camí</h2>' +
      '<p class="cm-per">S\'aprèn fent, i el que fas aquí <strong>és alhora la teva formació i el teu certificat</strong>. ' +
      'El camí surt del teu ikigai: el que t\'agrada, el que se\'t dona bé, el que la xarxa necessita i el que et paguen. ' +
      'I arrela on ets: <strong>el compromís amb les teves arrels</strong>, la gent i la terra d\'on vens, és el que dona sentit als quatre. ' +
      'Quan es creuen, la teva feina fa el món una mica millor.</p>' +
      (d.nom ? '' : '<div class="ent-card"><div class="ent-desc">Encara no tens perfil. Amb el perfil, el camí es fa a la teva mida.</div></div>') +
      '<div class="cm-k">1 · Per a què · el teu ikigai</div>' +
      (d.nom ? ikigai(d) : '<p class="m-sub">Quan tinguis perfil, aquí hi veuràs el que t\'agrada i el que la xarxa necessita.</p>') +
      '<div class="cm-k">2 · On ets</div>' +
      '<div class="ent-card"><div class="ent-nm">' + esc(meta.id + ' · ' + meta.label) + '</div>' +
      '<div class="ent-desc">' + esc(meta.one) + '</div>' +
      (pas ? '<div class="ent-desc"><strong>' + esc(pas.diu) + '</strong></div>' : '') + '</div>' +
      '<div class="cm-k">3 · Què toca · ' + esc(op.rolNom) + '</div>' +
      '<div id="cmMods">' + llista.map(function (x) {
        var m = x.m;
        return '<div class="cm-m ' + x.estat + '"><span class="cm-n">' + esc(m.level) + '</span>' +
          '<span><b>M' + m.n + ' · ' + esc(m.title) + '</b><span class="cm-e">' +
          (x.estat === 'fet' ? 'El teu nivell ja ho demostra' : x.estat === 'ara' ? 'Ara · ' + m.hours + ' h fent-ho al teu projecte' : 'Després · ' + m.hours + ' h') +
          '</span></span><a class="btn btn-ghost btn-sm" href="formacio.html#' + esc(m.id) + '" target="_blank" rel="noopener">Obre</a></div>';
      }).join('') + '</div>' +
      '<p class="m-sub" id="cmEines">On es practica: ' + [['banc-temps.html', 'el Banc de Temps'], ['biblioteca.html', 'la Biblioteca de les Coses'],
        ['compra.html', 'la Compra'], ['energia.html', 'l\'Energia i la minigrid'], ['habitatge.html', 'l\'Habitatge']].map(function (e) {
        return '<a href="' + e[0] + '" target="_blank" rel="noopener">' + e[1] + '</a>';
      }).join(' · ') + '. Cada eina és una dinàmica real, i el que hi fas compta com a evidència.</p>' +
      '<p class="m-sub">Per a un equip que vol aprendre IA construint el seu cervell: ' +
      '<a href="cervell.html" target="_blank" rel="noopener">Crea el teu cervell</a> (M1 · M3 · M8 · M14).</p>' +
      '<div class="cm-k">4 · El pas d\'avui</div>';
    var bg = op.modal(html, [
      d.nom ? { txt: '⏱ Registra el que has fet', cls: 'btn btn-primary', fn: function () { op.tanca(); op.registra(); } }
        : { txt: '🦸 Crea el teu perfil', cls: 'btn btn-primary', fn: function () { op.tanca(); op.perfil(); } },
      { txt: '🧭 La guia del rol', cls: 'btn btn-ghost', fn: function () { op.tanca(); op.guia(); } },
      d.nom ? { txt: '🤝 Prepara una mentoria', cls: 'btn btn-ghost', fn: function () { op.tanca(); op.mentoria(); } } : null,
      { txt: 'Tanca', cls: 'btn btn-ghost', fn: op.tanca }
    ]);
    bg.querySelector('.modal').id = 'cami';
    return bg;
  }

  window.Cami = { obre: obre, moduls: moduls };
})();
