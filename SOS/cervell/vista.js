/* El cervell · la vista de cadascú
 * ─────────────────────────────────────────────────────────────────────────────
 * Una sola vista per al cervell de qualsevol persona o projecte: les cinc
 * koshas en 3D, el panell de la veda triada i les forces (gravetat, potencial,
 * enllaços quàntics i optimització). La fan servir `SOS/cervell.html` i el
 * fitxer sense connexió que se'n descarrega per al LMS: el mateix codi, no una
 * còpia. Els càlculs són a `forces.js` i el dibuix a `3d.js`.
 *
 *   CervellVista.munta(caixa, { nodos, aristas, capas }, { lang: 'ca' | 'es' })
 */
(function (raiz) {
  var T = {
    ca: {
      tria: 'Toca una veda per llegir-la i veure amb quines connecta.', cita: 'Cita', citen: 'La citen', ent: 'Entrellaçades',
      massa: 'Massa', pot: 'potencial', enc: function (v, c) { return 'encén ' + v + ' vedes en ' + c + (c === 1 ? ' kosha' : ' koshas'); },
      dispara: 'Dispara', tret: function (n, v, c, q) { return 'Tret des de la veda ' + n + ': encén ' + v + ' vedes en ' + c + ' koshas, ' + q + ' per enllaç quàntic.'; },
      ley: 'Cada esfera és una kosha: el cos a fora i el propòsit al centre. La mida d\'una veda és la seva massa. Les línies grises són cites; les puntejades verdes, enllaços quàntics. Arrossega per girar; acosta amb els botons o amb Ctrl i la roda.',
      grav: 'Gravetat', gravP: 'Les vedes amb més massa: les que més citen o més les citen. Sostenen la resta.', cites: ' cites',
      potT: 'Potencial', potP: 'Les que més cervell encenen quan es disparen.',
      qT: 'Enllaços quàntics', qP: function (n) { return n + ' parelles de koshas diferents que no es citen i s\'activen juntes. Les més fortes:'; },
      opt: 'Optimització', falten: 'Cites que falten.', faltenP: 'Aquestes parelles es recolzen en les mateixes vedes i encara no es citen.',
      soltes: function (s, t, g) { return '<b>Vedes soltes.</b> ' + s + ' de ' + t + ' no citen ni les citen. ' + g + ' ja tenen un enllaç quàntic que diu amb quina connectar-les.'; },
      cast: function (p, t, d, ok) { return '<b>La castellera.</b> Pinya ' + p + ' · tronc ' + t + ' · pom de dalt ' + d + '. ' + (ok ? 'Aguanta: la pinya és més ampla que el tronc.' : 'No aguanta: el tronc ha crescut més que la pinya.'); },
      comp: 'comparteixen saber', mateixa: 'citen la mateixa veda', mateixes: function (n) { return 'citen les mateixes ' + n; },
      mes: 'Acosta', menys: 'Allunya', tot: 'Tot', buit: 'Aquest codex encara no té vedes.'
    },
    es: {
      tria: 'Toca una veda para leerla y ver con cuáles conecta.', cita: 'Cita a', citen: 'La citan', ent: 'Entrelazadas',
      massa: 'Masa', pot: 'potencial', enc: function (v, c) { return 'enciende ' + v + ' vedas en ' + c + (c === 1 ? ' kosha' : ' koshas'); },
      dispara: 'Disparar', tret: function (n, v, c, q) { return 'Disparo desde la veda ' + n + ': enciende ' + v + ' vedas en ' + c + ' koshas, ' + q + ' por enlace cuántico.'; },
      ley: 'Cada esfera es una kosha: el cuerpo fuera y el propósito en el centro. El tamaño de una veda es su masa. Las líneas grises son citas; las punteadas verdes, enlaces cuánticos. Arrastra para girar; acerca con los botones o con Ctrl y la rueda.',
      grav: 'Gravedad', gravP: 'Las vedas con más masa: las que más citan o más las citan. Sostienen el resto.', cites: ' citas',
      potT: 'Potencial', potP: 'Las que más cerebro encienden al dispararse.',
      qT: 'Enlaces cuánticos', qP: function (n) { return n + ' pares de koshas distintas que no se citan y se activan juntas. Los más fuertes:'; },
      opt: 'Optimización', falten: 'Citas que faltan.', faltenP: 'Estas parejas se apoyan en las mismas vedas y aún no se citan.',
      soltes: function (s, t, g) { return '<b>Vedas sueltas.</b> ' + s + ' de ' + t + ' no citan ni las citan. ' + g + ' ya tienen un enlace cuántico que dice con cuál conectarlas.'; },
      cast: function (p, t, d, ok) { return '<b>La castellera.</b> Pinya ' + p + ' · tronc ' + t + ' · pom de dalt ' + d + '. ' + (ok ? 'Aguanta: la pinya es más ancha que el tronco.' : 'No aguanta: el tronco ha crecido más que la pinya.'); },
      comp: 'comparten saber', mateixa: 'citan la misma veda', mateixes: function (n) { return 'citan las mismas ' + n; },
      mes: 'Acercar', menys: 'Alejar', tot: 'Todo', buit: 'Este codex aún no tiene vedas.'
    }
  };
  var CSS = '.cv{--k-anna:#b45309;--k-prana:#15803d;--k-mano:#0e7490;--k-vijnana:#1d4ed8;--k-ananda:#7c3aed;--cv-l:var(--border,#ddd7c8);--cv-c:var(--card,#fff);--cv-t:var(--text,#15130f);--cv-m:var(--muted,#5e594d)}' +
    '.cv-3d{position:relative;background:var(--cv-c);border:1px solid var(--cv-l);border-radius:14px}' +
    '.cv-3d canvas{display:block;width:100%;height:min(70vh,580px);min-height:320px;cursor:grab;touch-action:pan-y}' +
    '.cv-3d canvas:focus-visible{outline:2px solid #2563eb;outline-offset:2px}' +
    '.cv-k{position:absolute;left:12px;bottom:10px;display:flex;flex-wrap:wrap;gap:4px 12px;font:500 .75rem ui-monospace,monospace;color:var(--cv-m);pointer-events:none}' +
    '.cv-k i{display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--c);margin-right:5px}' +
    '.cv-z{position:absolute;right:10px;top:10px;display:flex;gap:4px}' +
    '.cv button{font:600 .9rem inherit;font-family:inherit;min-height:40px;padding:6px 14px;border-radius:999px;border:1px solid var(--cv-l);background:var(--cv-c);color:var(--cv-t);cursor:pointer}' +
    '.cv button:focus-visible{outline:2px solid #2563eb;outline-offset:2px}' +
    '.cv .cv-go{min-height:32px;font-weight:500;font-size:.85rem;padding:3px 11px;margin:4px 4px 0 0;text-align:left}' +
    '.cv .cv-dis{background:var(--cv-t);color:var(--cv-c);border-color:var(--cv-t);margin-top:10px}' +
    '.cv-ley{font-size:.9rem;color:var(--cv-m);margin:10px 0}.cv-now{min-height:1.5em;font-weight:600;margin:6px 0}' +
    '.cv-p{background:var(--cv-c);border:1px solid var(--cv-l);border-left:4px solid var(--c,var(--cv-l));border-radius:14px;padding:16px 18px;margin:12px 0 22px}' +
    '.cv-p h3{margin:.3rem 0 .5rem;font-size:1.15rem}.cv-m{font:500 .8rem ui-monospace,monospace;color:var(--cv-m)}' +
    '.cv-f{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,290px),1fr));gap:14px}' +
    '.cv-f article{background:var(--cv-c);border:1px solid var(--cv-l);border-top:4px solid var(--c);border-radius:10px;padding:14px 16px;min-width:0}' +
    '.cv-f h3{font-size:1.05rem;margin-bottom:4px}.cv-f p{font-size:.92rem;color:var(--cv-m);margin:0 0 6px}.cv-f ol{padding-left:1.2rem;margin:0;font-size:.9rem}.cv-f li{margin:.35rem 0}';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function munta(caixa, D, op) {
    op = op || {};
    var t = T[(op.lang || 'ca').slice(0, 2)] || T.ca, F = raiz.CerebroFuerzas;
    if (!document.getElementById('cv-css')) { var st = document.createElement('style'); st.id = 'cv-css'; st.textContent = CSS; document.head.appendChild(st); }
    caixa.classList.add('cv');
    if (!D.nodos.length) { caixa.innerHTML = '<p class="cv-now">' + t.buit + '</p>'; return null; }
    D.nodos.forEach(function (n, i) { n.i = i; n.saberes = n.saberes || []; });
    var byId = {}; D.nodos.forEach(function (n) { byId[n.id] = n; });
    var capaDe = {}; D.capas.forEach(function (c) { capaDe[c.id] = c; });
    var AN = F.analiza(D), col = function (k) { return 'var(--k-' + k + ')'; };
    caixa.innerHTML =
      '<div class="cv-3d"><canvas tabindex="0" role="img" aria-label="' + esc(t.ley) + '"></canvas>' +
      '<div class="cv-z"><button type="button" data-z="mes" aria-label="' + t.mes + '">+</button><button type="button" data-z="menys" aria-label="' + t.menys + '">−</button><button type="button" data-z="tot">' + t.tot + '</button></div>' +
      '<div class="cv-k" aria-hidden="true">' + D.capas.map(function (c) { return '<span style="--c:' + col(c.id) + '"><i></i>' + esc(c.s) + '</span>'; }).join('') + '</div></div>' +
      '<p class="cv-now" aria-live="polite"></p><p class="cv-ley">' + esc(t.ley) + '</p>' +
      '<div class="cv-p" aria-live="polite"><p>' + t.tria + '</p></div><div class="cv-f"></div>';
    var panel = caixa.querySelector('.cv-p'), now = caixa.querySelector('.cv-now');
    var C3 = raiz.Cerebro3D(caixa.querySelector('canvas'), { alElegir: function (id) { if (id) tria(id); else { C3.selecciona(null); panel.innerHTML = '<p>' + t.tria + '</p>'; panel.style.removeProperty('--c'); } } });
    C3.monta(D, AN); C3.activa(true);

    function chip(id, extra) { var n = byId[id]; return '<button type="button" class="cv-go" data-id="' + esc(id) + '">' + n.n + ' · ' + esc(n.t) + (extra ? ' <small>· ' + esc(extra) + '</small>' : '') + '</button>'; }
    function chips(ids, txt) { return ids.length ? '<p class="cv-m" style="margin-top:10px">' + txt + '</p>' + ids.map(function (k) { return chip(k); }).join('') : ''; }
    function porque(e) {
      var s = e.saberes.length ? t.comp : '', v = e.vecinos.length;
      return s + (s && v ? '; ' : '') + (v ? (v === 1 ? t.mateixa : t.mateixes(v)) : '');
    }
    function tria(id) {
      var n = byId[id]; C3.selecciona(id);
      var cita = D.aristas.filter(function (a) { return a[0] === id; }).map(function (a) { return a[1]; });
      var citen = D.aristas.filter(function (a) { return a[1] === id; }).map(function (a) { return a[0]; });
      var ent = AN.cuanticos.filter(function (e) { return e.a === id || e.b === id; }).map(function (e) { return e.a === id ? e.b : e.a; });
      var a = AN.alcance[id];
      panel.style.setProperty('--c', col(n.capa));
      panel.innerHTML = '<p class="cv-m">Veda ' + n.n + ' · ' + esc(capaDe[n.capa].s) + (n.fecha ? ' · ' + esc(n.fecha) : '') + '</p><h3>' + esc(n.t) + '</h3>' +
        (n.aprende ? '<p><b>' + esc(n.aprende) + '</b></p>' : '') + '<p>' + esc(n.txt) + '</p>' +
        chips(cita, t.cita) + chips(citen, t.citen) + chips(ent, t.ent) +
        '<p class="cv-m" style="margin-top:10px">' + t.massa + ' ' + AN.masa[id] + ' · ' + t.pot + ' ' + AN.potencial[id] + ' · ' + t.enc(a.vedas, a.capas) + '</p>' +
        '<button type="button" class="cv-dis" data-dispara="' + esc(id) + '">' + t.dispara + '</button>';
    }
    function dispara(id) {
      var luz = C3.dispara(id); if (!luz) return;
      var ks = Object.keys(luz).filter(function (k) { return k !== id; }), c = {};
      ks.forEach(function (k) { c[byId[k].capa] = 1; });
      now.textContent = t.tret(byId[id].n, ks.length, Object.keys(c).length, ks.filter(function (k) { return luz[k].via === 'cuantico'; }).length);
    }
    var conQ = {}; AN.cuanticos.forEach(function (e) { conQ[e.a] = conQ[e.b] = 1; });
    var cs = AN.castellera;
    caixa.querySelector('.cv-f').innerHTML =
      '<article style="--c:#2563eb"><h3>' + t.grav + '</h3><p>' + t.gravP + '</p><ol>' + AN.gravedad.map(function (n) { return '<li>' + chip(n.id, AN.masa[n.id] + t.cites) + '</li>'; }).join('') + '</ol></article>' +
      '<article style="--c:#eab308"><h3>' + t.potT + '</h3><p>' + t.potP + '</p><ol>' + AN.potentes.map(function (n) { var a = AN.alcance[n.id]; return '<li>' + chip(n.id, t.enc(a.vedas, a.capas)) + '</li>'; }).join('') + '</ol></article>' +
      '<article style="--c:#16a34a"><h3>' + t.qT + '</h3><p>' + t.qP(AN.cuanticos.length) + '</p><ol>' + AN.cuanticos.slice(0, 6).map(function (e) { return '<li>' + chip(e.a) + ' ↔ ' + chip(e.b, porque(e)) + '</li>'; }).join('') + '</ol></article>' +
      '<article style="--c:var(--cv-t)"><h3>' + t.opt + '</h3><p><b>' + t.falten + '</b> ' + t.faltenP + '</p><ol>' + AN.faltan.slice(0, 5).map(function (e) { return '<li>' + chip(e.a) + ' ↔ ' + chip(e.b) + '</li>'; }).join('') + '</ol>' +
        '<p style="margin-top:10px">' + t.soltes(AN.sueltas.length, D.nodos.length, AN.sueltas.filter(function (n) { return conQ[n.id]; }).length) + '</p>' +
        '<p>' + t.cast(cs[2].vedas, cs[1].vedas, cs[0].vedas, AN.aguanta) + '</p></article>';

    caixa.addEventListener('click', function (e) {
      var z = e.target.closest('[data-z]'); if (z) { var k = z.getAttribute('data-z'); return k === 'tot' ? C3.centra() : C3.zoom(k === 'mes' ? 1 / 1.25 : 1.25); }
      var d = e.target.closest('[data-dispara]'); if (d) return dispara(d.getAttribute('data-dispara'));
      var b = e.target.closest('[data-id]'); if (!b) return;
      tria(b.getAttribute('data-id')); caixa.querySelector('.cv-3d').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return { analisi: AN, tria: tria, dispara: dispara, atura: function () { C3.activa(false); }, activa: function (b) { C3.activa(b); } };
  }
  raiz.CervellVista = { munta: munta };
})(window);
