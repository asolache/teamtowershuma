/* El cervell · la vista de l'organització
 * ─────────────────────────────────────────────────────────────────────────────
 * L'Àlvar (02/11/2026): «les vedes no són un concepte intuïtiu, encara que sí
 * rellevant». Aquesta és la porta d'entrada al cervell, amb paraules que tothom
 * entén: al centre, **la cultura** (el codex: el que el projecte ha après i com
 * vol treballar) i, al voltant, **les dotze àrees** de qualsevol organització
 * (vendes, finances, persones…, les de `taxonomia-universal.json`) amb els seus
 * documents. Cada document diu quins aprenentatges cita, i cada aprenentatge
 * quins documents el fan servir. Les vistes de la cultura (3D, castellera…)
 * queden a un clic. L'estàndard de carpetes és a knowledge/cervell/estructura.md.
 *
 *   CervellOrg.munta(caixa, { uni, docs, nodos, repo, alVeda, alCultura })
 */
(function (raiz) {
  var CSS = '.org{--k-anna:#b45309;--k-prana:#15803d;--k-mano:#0e7490;--k-vijnana:#1d4ed8;--k-ananda:#7c3aed;--o-l:var(--border,#ddd7c8);--o-c:var(--card,#fff);--o-t:var(--text,#15130f);--o-m:var(--muted,#5e594d)}' +
    '.org-cult{background:var(--o-c);border:1px solid var(--o-l);border-left:5px solid var(--k-ananda);border-radius:14px;padding:16px 18px;margin:0 0 14px}' +
    '.org-cult h3{margin:0 0 6px;font-size:1.2rem}.org-cult p{margin:0 0 8px}.org-cult ol{margin:6px 0 10px;padding-left:1.3rem}.org-cult li{margin:.3rem 0}' +
    '.org-res{font-size:1rem;margin:0 0 12px}' +
    '.org-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,190px),1fr));gap:10px;margin:0 0 14px}' +
    '.org-g button{font:inherit;text-align:left;min-height:76px;padding:12px 14px;border-radius:12px;border:1px solid var(--o-l);border-top:5px solid var(--c);background:var(--o-c);color:var(--o-t);cursor:pointer}' +
    '.org-g button b{display:block;font-size:1.02rem;line-height:1.25}.org-g button span{font-size:.95rem;color:var(--o-m)}' +
    '.org-g button[data-buida]{border-style:dashed;border-top-style:solid;opacity:.75}' +
    '.org-g button[aria-pressed=true]{outline:3px solid var(--c);outline-offset:1px}' +
    '.org button:focus-visible{outline:2px solid #2563eb;outline-offset:2px}' +
    '.org-p{background:var(--o-c);border:1px solid var(--o-l);border-left:5px solid var(--c,var(--o-l));border-radius:14px;padding:16px 18px;margin:0 0 14px}' +
    '.org-p h3{margin:0 0 8px;font-size:1.15rem}.org-p ul{list-style:none;padding:0;margin:0}.org-p li{padding:10px 0;border-top:1px solid var(--o-l)}.org-p li:first-child{border-top:0}' +
    '.org-p a{font-weight:600}.org-m{font-size:.92rem;color:var(--o-m)}' +
    '.org .org-v{font:inherit;font-size:.92rem;min-height:36px;padding:4px 12px;margin:6px 6px 0 0;border-radius:999px;border:1px solid var(--o-l);background:var(--o-c);color:var(--o-t);cursor:pointer;text-align:left}' +
    '.org .org-b{font:600 .95rem inherit;font-family:inherit;min-height:44px;padding:8px 18px;border-radius:999px;border:1px solid var(--o-t);background:var(--o-t);color:var(--o-c);cursor:pointer}' +
    '.org code{font-size:.9em}';
  var T = {
    cult: 'La cultura del projecte',
    cultDiu: function (n) { return n + ' aprenentatges: el que el projecte ha après i com vol treballar. Al codex en diem «vedes»: cada una és un error que ja es va pagar, escrit perquè no es torni a pagar.'; },
    usats: 'Els que més fan servir els documents:', recents: 'Els més recents:',
    sense: 'Aquest projecte encara no té cultura pròpia escrita. És el primer que val la pena escriure: com volem treballar i què hem après fent-ho. Va a <code>saber/codex.md</code>, que ja porta la plantilla del cervell (<code>cervell.js --nou</code>): cada aprenentatge nou, amb qui el va dir, quan i l\'error que evita.',
    mira: 'Mira la cultura en 3D',
    res: function (amb, docs, citen, sols) {
      return amb + ' de 12 àrees tenen documents · ' + docs + (docs === 1 ? ' document' : ' documents') +
        (docs ? ', ' + citen + ' citen la cultura' : '') + (sols ? ' · ' + sols + ' aprenentatges que encara no fa servir cap document' : '') + '.';
    },
    cap: 'Aquest cervell encara no té documents per àrees. Es posen a <code>areas/&lt;àrea&gt;/</code>, amb la capçalera de l\'estàndard, i apareixen aquí sols.',
    docs: function (n) { return n ? n + (n === 1 ? ' document' : ' documents') : 'buida'; },
    buidaP: 'Encara no hi ha cap document d\'aquesta àrea.', projectes: 'Projectes', senseArea: 'Sense àrea',
    cita: 'Cita:', veda: 'Veda'
  };
  var slug = function (t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var css = false;

  function munta(caixa, op) {
    if (!css) { var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); css = true; }
    var ROL = ((op.uni && op.uni.facetes) || []).filter(function (f) { return f.id === 'role'; })[0];
    var rols = ROL ? ROL.valors : [];
    var rolDe = function (v) {
      var s = slug(v);
      var r = rols.filter(function (x) { return [x.id, x.ca, x.es, x.en].concat(x.alias || []).some(function (a) { return slug(a) === s; }); })[0];
      return r ? r.id : null;
    };
    var docs = (op.docs || []).map(function (d) {
      var ids = []; d.rols.forEach(function (r) { var id = rolDe(r); if (id && ids.indexOf(id) < 0) ids.push(id); });
      return Object.assign({}, d, { arees: ids });
    });
    var nodos = op.nodos || [], perN = {};
    nodos.forEach(function (n) { perN[n.n] = n; });
    var usos = {};
    docs.forEach(function (d) { d.vedes.forEach(function (v) { if (perN[v]) usos[v] = (usos[v] || 0) + 1; }); });
    var color = function (r) { return 'var(--k-' + (r.kosha || 'mano') + ')'; };
    var nom = function (r) { return r.ca ? r.ca.charAt(0).toUpperCase() + r.ca.slice(1) : r.id; };
    var enllac = function (d) { return 'https://github.com/' + op.repo + '/blob/HEAD/' + d.ruta.split('/').map(encodeURIComponent).join('/'); };
    var xip = function (v) { var n = perN[v]; return n ? '<button type="button" class="org-v" data-veda="' + esc(n.id) + '">' + T.veda + ' ' + v + ' · ' + esc(n.t) + '</button>' : ''; };
    var fila = function (d) {
      var m = [d.tipus, d.estat].filter(Boolean).map(esc).join(' · ');
      var vs = d.vedes.filter(function (v) { return perN[v]; });
      return '<li><a href="' + esc(enllac(d)) + '" rel="noopener">' + esc(d.titol) + '</a>' + (m ? ' <span class="org-m">' + m + '</span>' : '') +
        (vs.length ? '<div><span class="org-m">' + T.cita + '</span> ' + vs.map(xip).join('') + '</div>' : '') + '</li>';
    };

    /* La cultura: el centre. */
    var h = '<div class="org">';
    if (nodos.length) {
      var top = Object.keys(usos).length
        ? Object.keys(usos).sort(function (a, b) { return usos[b] - usos[a] || b - a; }).slice(0, 3).map(Number)
        : nodos.map(function (n) { return n.n; }).sort(function (a, b) { return b - a; }).slice(0, 3);
      h += '<section class="org-cult"><h3>' + T.cult + '</h3><p>' + esc(T.cultDiu(nodos.length)) + '</p>' +
        '<p class="org-m">' + (Object.keys(usos).length ? T.usats : T.recents) + '</p><ol>' +
        top.map(function (v) { return '<li>' + xip(v) + (usos[v] ? ' <span class="org-m">' + usos[v] + (usos[v] === 1 ? ' document' : ' documents') + '</span>' : '') + '</li>'; }).join('') +
        '</ol><button type="button" class="org-b" data-cultura>' + T.mira + '</button></section>';
    } else h += '<section class="org-cult"><h3>' + T.cult + '</h3><p>' + T.sense + '</p></section>';

    /* Les àrees. */
    var perArea = {}; rols.forEach(function (r) { perArea[r.id] = []; });
    var senseA = [], projectes = {};
    docs.forEach(function (d) {
      var p = /^(proyectos|projectes|projects)\/([^/]+)\//.exec(d.ruta);
      if (p) (projectes[p[2]] = projectes[p[2]] || []).push(d);
      if (d.arees.length) d.arees.forEach(function (a) { perArea[a].push(d); });
      else if (!p) senseA.push(d);
    });
    var amb = rols.filter(function (r) { return perArea[r.id].length; }).length;
    var citen = docs.filter(function (d) { return d.vedes.some(function (v) { return perN[v]; }); }).length;
    var sols = nodos.length && citen ? nodos.filter(function (n) { return !usos[n.n]; }).length : 0;
    h += '<p class="org-res">' + (docs.length ? esc(T.res(amb, docs.length, citen, sols)) : T.cap) + '</p>';
    h += '<div class="org-g" role="group" aria-label="Les àrees">' + rols.map(function (r) {
      var n = perArea[r.id].length;
      return '<button type="button" data-area="' + r.id + '" aria-pressed="false" style="--c:' + color(r) + '"' + (n ? '' : ' data-buida') + '><b>' + esc(nom(r)) + '</b><span>' + T.docs(n) + '</span></button>';
    }).join('') + '</div><div class="org-p" id="orgP" hidden aria-live="polite"></div>';
    Object.keys(projectes).sort().forEach(function (p, i) {
      if (!i) h += '<h3>' + T.projectes + '</h3>';
      h += '<div class="org-p" style="--c:var(--o-t)"><h3>' + esc(p.replace(/-/g, ' ')) + '</h3><ul>' + projectes[p].map(fila).join('') + '</ul></div>';
    });
    if (senseA.length) h += '<div class="org-p"><h3>' + T.senseArea + '</h3><ul>' + senseA.map(fila).join('') + '</ul></div>';
    h += '</div>';
    caixa.innerHTML = h;

    var panell = caixa.querySelector('#orgP');
    caixa.onclick = function (e) {
      var v = e.target.closest('[data-veda]'); if (v) { if (op.alVeda) op.alVeda(v.getAttribute('data-veda')); return; }
      if (e.target.closest('[data-cultura]')) { if (op.alCultura) op.alCultura(); return; }
      var b = e.target.closest('[data-area]'); if (!b) return;
      var obert = b.getAttribute('aria-pressed') === 'true';
      caixa.querySelectorAll('[data-area]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      if (obert) { panell.hidden = true; return; }
      b.setAttribute('aria-pressed', 'true');
      var r = rols.filter(function (x) { return x.id === b.getAttribute('data-area'); })[0], ds = perArea[r.id];
      panell.style.setProperty('--c', color(r));
      panell.innerHTML = '<h3>' + esc(nom(r)) + '</h3>' + (ds.length ? '<ul>' + ds.map(fila).join('') + '</ul>' : '<p class="org-m">' + T.buidaP + '</p>');
      panell.hidden = false;
    };
    return { treu: function () { caixa.innerHTML = ''; caixa.onclick = null; } };
  }

  /* Els mateixos documents per al 3D: un quadrat per document, del color de la
     capa de la seva àrea, amb l'id de les vedes que cita. */
  var KOSHA = { anna: '#b45309', prana: '#15803d', mano: '#0e7490', vijnana: '#1d4ed8', ananda: '#7c3aed' };
  function per3d(docs, uni, nodos, repo) {
    var ROL = ((uni && uni.facetes) || []).filter(function (f) { return f.id === 'role'; })[0], rols = ROL ? ROL.valors : [];
    var perN = {}; (nodos || []).forEach(function (n) { perN[n.n] = n.id; });
    return (docs || []).map(function (d) {
      var r = null;
      d.rols.some(function (v) { var s = slug(v); r = rols.filter(function (x) { return [x.id, x.ca, x.es, x.en].concat(x.alias || []).some(function (a) { return slug(a) === s; }); })[0] || null; return r; });
      return { id: 'doc:' + d.ruta, titol: d.titol, ruta: d.ruta, tipus: d.tipus, estat: d.estat,
        url: repo ? 'https://github.com/' + repo + '/blob/HEAD/' + d.ruta.split('/').map(encodeURIComponent).join('/') : null,
        area: r ? r.id : 'cap', nomArea: r ? r.ca : null, color: KOSHA[(r && r.kosha) || 'mano'] || '#5e594d',
        vedes: d.vedes.map(function (v) { return perN[v]; }).filter(Boolean) };
    });
  }

  raiz.CervellOrg = { munta: munta, per3d: per3d, slug: slug };
})(typeof window !== 'undefined' ? window : globalThis);
