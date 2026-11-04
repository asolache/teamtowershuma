/* El tauler del client (04/11/2026). Àlvaro: «falta el tablero del cliente
   donde automatizamos la paquetización […] tableros kanban para el cliente tal
   como mostramos en La feina que es repeteix, que es faci sola».

   La portada ho ensenya amb el cas anònim (mapa-anima.js · tauler): sense
   definir → definit → va sol. Aquí és el mateix camí, però amb el mapa del
   client: cada cosa que es repeteix al seu dibuix és una targeta, i
   «empaquetar-la» és dir-ne tres coses en paraules seves:
     · quan passa (el que la dispara),
     · què necessita (amb què es prepara),
     · qui la revisa (una persona del mapa, sempre).
   Amb el paquet fet, la targeta passa a «Definido»; i si la regla del tauler
   (ModelsMapa.automatitza → fluxAutomatitzable) diu que la pot preparar una
   màquina, el client la pot demanar a «Que vaya solo». Ho muntem nosaltres:
   el client no l'encén amb un clic, i el tauler no ho fa veure.
   El que no es paga i els diners no entren mai al tauler: van a la franja «Lo
   lleva una persona», amb el motiu.

   Una sola font de dades: les fletxes del mapa (pairs de DiagnosiClient.mapa).
   L'estat del tauler viu dins de la fitxa del mapa (S.tauler) i viatja amb
   ella: es desa, canvia amb «Mis mapas» i arriba amb l'encàrrec.
   Sense dependències; es pot fer servir des del node (tests) i des de l'app. */
(function (g) {
  'use strict';
  var T = {
    es: {
      c1: 'Por definir', c1d: 'Se repite, pero aún no está dicho cómo.',
      c2: 'Definido', c2d: 'Ya sabemos cuándo pasa, qué necesita y quién lo revisa.',
      c3: 'Que vaya solo', c3d: 'Lo montamos contigo. Una persona lo revisa siempre.',
      per: 'Lo lleva una persona', perd: 'Lo que no se paga (confianza, ideas, recomendaciones) y el dinero no se automatizan: se apuntan, y el mapa avisa si se paran.',
      buit: 'Cuando escribas en tu mapa qué das y qué recibes, cada cosa que se repite aparecerá aquí como una tarjeta.',
      defineix: 'Definir', edita: 'Cambiar', guarda: 'Guardar y pasar a «Definido»', cancel: 'Cancelar',
      solo: 'Que vaya solo →', torna: '← Volver a «Definido»', enrere: '← Volver a «Por definir»',
      quan: 'Cuándo pasa', quanO: ['Cada vez que alguien lo pide', 'Cada semana', 'Cada mes', 'Al acabar cada trabajo'], altre: 'Otro momento…',
      porta: 'Qué necesita para prepararse', portaP: 'Por ejemplo: los datos de la petición, las fechas, la lista de precios',
      revisa: 'Quién lo revisa antes de que salga', tu: 'Tú',
      falta: 'Falta decir cuándo pasa y quién lo revisa.',
      maq: '⚙ Lo puede preparar una máquina', ses: '◌ Lo vemos juntos en la sesión', ja: 'Ya lo hacemos así: {0}.',
      demanat: 'Pedido: lo dejamos funcionando y te avisamos.',
      comptes: '{0} por definir · {1} definidos · {2} que irán solos',
      enllac: 'Enlace a esta tarjeta',
      motiu: { intangible: 'no se paga', diners: 'es dinero o una decisión' },
      resum: 'Tablero: {0}', paquet: '{0} ({1} → {2}): cuándo «{3}», necesita «{4}», lo revisa {5}{6}',
      vaSol: ' · que vaya solo'
    },
    ca: {
      c1: 'Per definir', c1d: 'Es repeteix, però encara no està dit com.',
      c2: 'Definit', c2d: 'Ja sabem quan passa, què necessita i qui ho revisa.',
      c3: 'Que vagi sol', c3d: 'Ho muntem amb tu. Una persona ho revisa sempre.',
      per: 'Ho porta una persona', perd: 'El que no es paga (confiança, idees, recomanacions) i els diners no s\'automatitzen: s\'apunten, i el mapa avisa si s\'aturen.',
      buit: 'Quan escriguis al teu mapa què dones i què reps, cada cosa que es repeteix apareixerà aquí com una targeta.',
      defineix: 'Definir', edita: 'Canviar', guarda: 'Desa i passa a «Definit»', cancel: 'Cancel·la',
      solo: 'Que vagi sol →', torna: '← Torna a «Definit»', enrere: '← Torna a «Per definir»',
      quan: 'Quan passa', quanO: ['Cada cop que algú ho demana', 'Cada setmana', 'Cada mes', 'En acabar cada feina'], altre: 'Un altre moment…',
      porta: 'Què necessita per preparar-se', portaP: 'Per exemple: les dades de la petició, les dates, la llista de preus',
      revisa: 'Qui ho revisa abans que surti', tu: 'Tu',
      falta: 'Falta dir quan passa i qui ho revisa.',
      maq: '⚙ Ho pot preparar una màquina', ses: '◌ Ho mirem junts a la sessió', ja: 'Ja ho fem així: {0}.',
      demanat: 'Demanat: ho deixem funcionant i t\'avisem.',
      comptes: '{0} per definir · {1} definits · {2} que aniran sols',
      enllac: 'Enllaç a aquesta targeta',
      motiu: { intangible: 'no es paga', diners: 'són diners o una decisió' },
      resum: 'Tauler: {0}', paquet: '{0} ({1} → {2}): quan «{3}», necessita «{4}», ho revisa {5}{6}',
      vaSol: ' · que vagi sol'
    }
  };
  function f(s) { var a = arguments; return String(s).replace(/\{(\d)\}/g, function (_, i) { return a[+i + 1] == null ? '' : a[+i + 1]; }); }
  function pla(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  /* La clau d'una targeta: qui la dona, qui la rep i què és. Estable mentre no
     es reescriu la fletxa; si es reescriu, és una altra cosa i torna a «Por
     definir». */
  function clau(de, a, que) { return (pla(de) + '-' + pla(a) + '-' + pla(que)).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80); }

  /* Les targetes, de les fletxes del mapa: [a, b, menaAB, queAB, menaBA, queBA].
     auto(que, mena) és la regla del tauler (ModelsMapa.automatitza). */
  function cartes(pairs, auto) {
    var l = [], vist = {};
    (pairs || []).forEach(function (p) {
      [[p[0], p[1], p[2], p[3]], [p[1], p[0], p[4], p[5]]].forEach(function (x) {
        if (!x[3] || !String(x[3]).trim()) return;
        var k = clau(x[0], x[1], x[3]); if (vist[k]) return; vist[k] = 1;
        var r = auto ? auto(x[3], x[2]) : { qui: 'visita' };
        l.push({ id: k, de: x[0], a: x[1], que: String(x[3]).trim(), mena: x[2], qui: r.qui, tipus: r.tipus || null, diu: r.diu || '' });
      });
    });
    return l;
  }
  /* El paquet és complet amb el «quan» i el «qui revisa»; el «què necessita»
     ajuda però no bloqueja. */
  function complet(e) { return !!(e && String(e.quan || '').trim() && String(e.revisa || '').trim()); }
  /* On va cada targeta. Mai a «Que vaya solo» si la regla no ho permet, encara
     que l'estat desat ho digui (un mapa reescrit pot haver canviat la mena). */
  function columna(c, e) {
    if (c.qui === 'persona') return 'persona';
    if (!complet(e) || e.col === 'c1') return 'c1';
    return e.col === 'c3' && c.qui === 'maquina' ? 'c3' : 'c2';
  }
  function compte(cs, estat) {
    var n = { c1: 0, c2: 0, c3: 0, persona: 0 };
    cs.forEach(function (c) { n[columna(c, (estat || {})[c.id])]++; });
    return n;
  }
  /* El que arriba amb l'encàrrec: una línia per paquet definit. */
  function resum(cs, estat, L) {
    var t = T[L === 'ca' ? 'ca' : 'es'], n = compte(cs, estat);
    if (!cs.length) return '';
    var l = [f(t.resum, f(t.comptes, n.c1, n.c2, n.c3))];
    cs.forEach(function (c) {
      var e = (estat || {})[c.id], col = columna(c, e); if (col !== 'c2' && col !== 'c3') return;
      l.push('· ' + f(t.paquet, c.que, c.de, c.a, e.quan, e.porta || '—', e.revisa, col === 'c3' ? t.vaSol : ''));
    });
    return l.join('\n');
  }

  /* ── La vista ─────────────────────────────────────────────────────────── */
  var estil = false;
  function posaEstil() {
    if (estil || typeof document === 'undefined') return; estil = true;
    var s = document.createElement('style');
    s.textContent =
      '.tc-n{margin:0 0 .8rem;font-family:var(--mono);font-size:.8rem;color:var(--muted)}' +
      '.tc-cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem;align-items:start}' +
      '.tc-col{min-height:8rem;border:1px dashed var(--border-strong);border-radius:12px;padding:.6rem;background:var(--panel);transition:background .2s}' +
      '.tc-col.tc-sobre{background:var(--card);border-style:solid}' +
      '.tc-col h3{margin:0;font-size:.8rem;font-family:var(--mono);text-transform:uppercase;letter-spacing:.05em;color:var(--text);display:flex;justify-content:space-between;gap:.5rem}' +
      '.tc-col>p{margin:.2rem 0 .6rem;font-size:.82rem;color:var(--muted);line-height:1.35}' +
      '.tc-c{margin:0 0 .5rem;padding:.55rem .65rem;border-radius:10px;background:var(--card);border:1px solid var(--border);border-left:4px solid var(--border-strong);font-size:.88rem;line-height:1.35}' +
      '.tc-c[draggable="true"]{cursor:grab}.tc-c:target,.tc-c.tc-on{box-shadow:0 0 0 2px var(--indigo)}' +
      '.tc-c[data-col="c2"]{border-left-color:var(--orange)}.tc-c[data-col="c3"]{border-left-color:var(--green)}' +
      '.tc-c>a{display:block;font-weight:700;color:var(--text);text-decoration:none}.tc-c>a:hover{text-decoration:underline}' +
      '.tc-c small{display:block;color:var(--muted);margin-top:.2rem}' +
      '.tc-c .tc-q{display:block;margin-top:.3rem;font-size:.8rem;color:var(--light)}' +
      '.tc-c ul{margin:.35rem 0 0;padding-left:1rem;font-size:.82rem;color:var(--light)}' +
      '.tc-acc{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.45rem}' +
      '.tc-acc button,.tc-f button{min-height:36px;padding:.35rem .7rem;border:1px solid var(--border-strong);border-radius:8px;background:var(--card);color:var(--text);font:inherit;font-size:.82rem;font-weight:600;cursor:pointer}' +
      '.tc-acc button.tc-p,.tc-f button.tc-p{background:var(--text);color:var(--bg);border-color:var(--text)}' +
      '.tc-acc button:focus-visible,.tc-f button:focus-visible,.tc-c>a:focus-visible{outline:2px solid var(--indigo);outline-offset:2px}' +
      '.tc-f{margin-top:.5rem;display:grid;gap:.45rem}.tc-f label,.tc-f legend{font-size:.8rem;font-weight:600}' +
      '.tc-f fieldset{border:0;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:.3rem}.tc-f fieldset legend{width:100%;margin-bottom:.2rem}' +
      '.tc-f fieldset button[aria-pressed="true"]{border-color:var(--indigo);box-shadow:0 0 0 1px var(--indigo)}' +
      '.tc-f input,.tc-f textarea,.tc-f select{width:100%;box-sizing:border-box;padding:.45rem .55rem;border:1px solid var(--border-strong);border-radius:8px;background:var(--bg);color:var(--text);font:inherit;font-size:.88rem}' +
      '.tc-f textarea{min-height:3.5em;resize:vertical}.tc-f .tc-err{color:var(--red);font-size:.8rem;margin:0}' +
      '.tc-per{margin-top:.9rem;padding:.7rem .8rem;border-left:3px solid var(--blue);background:var(--panel);border-radius:0 10px 10px 0}' +
      '.tc-per h3{margin:0 0 .2rem;font-size:.8rem;font-family:var(--mono);text-transform:uppercase;letter-spacing:.05em}' +
      '.tc-per p{margin:0 0 .4rem;font-size:.85rem;color:var(--light)}.tc-per ul{margin:0;padding-left:1.1rem;font-size:.85rem}' +
      '.tc-buit{padding:1rem;border:1px dashed var(--border-strong);border-radius:12px;color:var(--muted)}' +
      '@media (max-width:760px){.tc-cols{grid-template-columns:1fr}.tc-col{min-height:0}}';
    document.head.appendChild(s);
  }
  function el(tag, at, txt) {
    var e = document.createElement(tag);
    for (var k in at || {}) if (at[k] != null) e.setAttribute(k, at[k]);
    if (txt != null) e.textContent = txt;
    return e;
  }
  function majus(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* o: { pairs, auto, estat, roles, centre, llengua, prefix, onCanvi(estat) } */
  function pinta(cont, o) {
    posaEstil();
    var L = o.llengua === 'ca' ? 'ca' : 'es', t = T[L], pre = o.prefix || 'tablero-';
    var estat = o.estat || {}, cs = cartes(o.pairs, o.auto), obert = cont._obert || null;
    var roles = (o.roles || []).filter(Boolean);
    cont.textContent = '';
    if (!cs.length) { cont.appendChild(el('p', { class: 'tc-buit' }, t.buit)); return { cartes: cs, compte: compte(cs, estat) }; }
    var n = compte(cs, estat);
    cont.appendChild(el('p', { class: 'tc-n', 'aria-live': 'polite' }, f(t.comptes, n.c1, n.c2, n.c3)));
    function desa(id, e) { estat[id] = e; if (o.onCanvi) o.onCanvi(estat); cont._obert = null; pinta(cont, o); var c = document.getElementById(pre + id); if (c) { var a = c.querySelector('a'); if (a) a.focus(); } }
    function mou(c, col) {
      var e = Object.assign({}, estat[c.id] || {});
      if (col === 'c1') { e.col = 'c1'; desa(c.id, e); return; }
      if (!complet(e)) { cont._obert = c.id; pinta(cont, o); return; }
      if (col === 'c3' && c.qui !== 'maquina') return;
      e.col = col; desa(c.id, e);
    }
    var cols = el('div', { class: 'tc-cols' }), byCol = {};
    [['c1', t.c1, t.c1d], ['c2', t.c2, t.c2d], ['c3', t.c3, t.c3d]].forEach(function (k) {
      var d = el('section', { class: 'tc-col', 'data-col': k[0], 'aria-label': k[1] }), h = el('h3');
      h.appendChild(el('span', {}, k[1])); h.appendChild(el('b', {}, String(n[k[0]])));
      d.appendChild(h); d.appendChild(el('p', {}, k[2]));
      /* Arrossegar, a l'escriptori; els botons fan el mateix i són els que
         funcionen amb el dit i amb el teclat. */
      d.addEventListener('dragover', function (ev) { ev.preventDefault(); d.classList.add('tc-sobre'); });
      d.addEventListener('dragleave', function () { d.classList.remove('tc-sobre'); });
      d.addEventListener('drop', function (ev) {
        ev.preventDefault(); d.classList.remove('tc-sobre');
        var id = ev.dataTransfer.getData('text/plain'), c = cs.filter(function (x) { return x.id === id; })[0];
        if (c) mou(c, k[0]);
      });
      byCol[k[0]] = d; cols.appendChild(d);
    });
    var pers = [];
    cs.forEach(function (c) {
      var e = estat[c.id] || {}, col = columna(c, e);
      if (col === 'persona') { pers.push(c); return; }
      var card = el('article', { class: 'tc-c' + (obert === c.id ? ' tc-on' : ''), id: pre + c.id, 'data-col': col, draggable: 'true' });
      card.addEventListener('dragstart', function (ev) { ev.dataTransfer.setData('text/plain', c.id); });
      card.appendChild(el('a', { href: '#' + pre + c.id, title: t.enllac }, majus(c.que)));
      card.appendChild(el('small', {}, c.de + ' → ' + c.a));
      card.appendChild(el('span', { class: 'tc-q' }, c.qui === 'maquina' ? t.maq : t.ses));
      if (c.diu) card.appendChild(el('span', { class: 'tc-q' }, f(t.ja, c.diu)));
      if (col !== 'c1') {
        var u = el('ul');
        u.appendChild(el('li', {}, t.quan + ': ' + e.quan));
        if (e.porta) u.appendChild(el('li', {}, t.porta + ': ' + e.porta));
        u.appendChild(el('li', {}, t.revisa + ': ' + e.revisa));
        card.appendChild(u);
      }
      if (col === 'c3') card.appendChild(el('span', { class: 'tc-q' }, t.demanat));
      if (obert === c.id) card.appendChild(form(c, e));
      else {
        var acc = el('div', { class: 'tc-acc' }), b = function (txt, fn, p) { var x = el('button', { type: 'button', class: p ? 'tc-p' : null }, txt); x.addEventListener('click', fn); acc.appendChild(x); };
        if (col === 'c1') b(t.defineix, function () { cont._obert = c.id; pinta(cont, o); }, true);
        if (col === 'c2') { if (c.qui === 'maquina') b(t.solo, function () { mou(c, 'c3'); }, true); b(t.edita, function () { cont._obert = c.id; pinta(cont, o); }); b(t.enrere, function () { mou(c, 'c1'); }); }
        if (col === 'c3') b(t.torna, function () { mou(c, 'c2'); });
        card.appendChild(acc);
      }
      byCol[col].appendChild(card);
    });
    cont.appendChild(cols);
    if (pers.length) {
      var p = el('div', { class: 'tc-per' });
      p.appendChild(el('h3', {}, t.per + ' · ' + pers.length)); p.appendChild(el('p', {}, t.perd));
      var ul = el('ul'); pers.forEach(function (c) { ul.appendChild(el('li', { id: pre + c.id }, majus(c.que) + ' (' + c.de + ' → ' + c.a + ')')); });
      p.appendChild(ul); cont.appendChild(p);
    }

    /* El paquet: quan passa, què necessita i qui ho revisa. */
    function form(c, e) {
      var fm = el('form', { class: 'tc-f' }), quan = e.quan || '', idq = pre + c.id + '-';
      var fs = el('fieldset'); fs.appendChild(el('legend', {}, t.quan));
      var altre = el('input', { type: 'text', id: idq + 'q', 'aria-label': t.altre, placeholder: t.altre });
      var bs = t.quanO.map(function (q) {
        var x = el('button', { type: 'button', 'aria-pressed': String(q === quan) }, q);
        x.addEventListener('click', function () { quan = q; altre.value = ''; bs.forEach(function (y) { y.setAttribute('aria-pressed', String(y === x)); }); });
        fs.appendChild(x); return x;
      });
      if (quan && t.quanO.indexOf(quan) < 0) altre.value = quan;
      altre.addEventListener('input', function () { quan = altre.value; bs.forEach(function (y) { y.setAttribute('aria-pressed', 'false'); }); });
      fm.appendChild(fs); fm.appendChild(altre);
      fm.appendChild(el('label', { for: idq + 'p' }, t.porta));
      var porta = el('textarea', { id: idq + 'p', placeholder: t.portaP }); porta.value = e.porta || ''; fm.appendChild(porta);
      fm.appendChild(el('label', { for: idq + 'r' }, t.revisa));
      var rev = el('select', { id: idq + 'r' }), ops = [];
      [c.de === o.centre ? c.de : null, o.centre].concat(roles).forEach(function (r) { if (r && ops.indexOf(r) < 0) ops.push(r); });
      ops.forEach(function (r) { var op = el('option', { value: r }, r === o.centre ? t.tu + ' (' + r + ')' : r); rev.appendChild(op); });
      rev.value = e.revisa && ops.indexOf(e.revisa) >= 0 ? e.revisa : (ops.indexOf(c.de) >= 0 ? c.de : ops[0]);
      fm.appendChild(rev);
      var err = el('p', { class: 'tc-err', role: 'alert' }); fm.appendChild(err);
      var acc = el('div', { class: 'tc-acc' });
      var ok = el('button', { type: 'submit', class: 'tc-p' }, t.guarda), no = el('button', { type: 'button' }, t.cancel);
      no.addEventListener('click', function () { cont._obert = null; pinta(cont, o); });
      acc.appendChild(ok); acc.appendChild(no); fm.appendChild(acc);
      fm.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var nou = { col: e.col === 'c3' && c.qui === 'maquina' ? 'c3' : 'c2', quan: String(quan || '').trim(), porta: porta.value.trim(), revisa: rev.value };
        if (!complet(nou)) { err.textContent = t.falta; return; }
        desa(c.id, nou);
      });
      setTimeout(function () { (bs[0] || altre).focus(); }, 0);
      return fm;
    }
    return { cartes: cs, compte: n };
  }

  var API = { T: T, clau: clau, cartes: cartes, complet: complet, columna: columna, compte: compte, resum: resum, pinta: pinta };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else g.TaulerClient = API;
})(typeof window !== 'undefined' ? window : this);
