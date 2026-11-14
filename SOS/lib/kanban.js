/* El kanban, un sol motor per a tota la casa (13/11/2026).
   Àlvaro: «tener solo un modelo de Kanban en todo […] un buen motor básico,
   robusto desde el inicio. Yo quiero siempre tener un backlog de todo: con el
   cliente tiene que haber un backlog mío, con mi vista, con mis tareas, y en el
   suyo […] todas las tareas que yo he hecho y todas las que hace ella».

   L'auditoria (producto/kanban-unico) va trobar sis taulers amb sis motors. Les
   peces bones estaven repartides: el registre signat al tauler de cada node del
   SOS («€ Comptabilitza»), el pomodoro a «Què et toca», l'entregable als
   sprints de la MATRIU, el tipus d'hora i la prova a les accions formatives.
   Aquest motor les ajunta en una sola targeta i un sol flux:

     Per fer (backlog) → Fent → Fet → Validat (comptabilitzat)

   · **Començar un pomodoro la passa a «Fent».** El temps es compta mentre passa
     (lib/pomodoro.js) i en acabar s'apunta a la targeta: és el registre.
   · **«Fet» només amb la prova** del que s'ha entregat (text o enllaç): és el
     principi dels nivells del SOS, evidència i no examen.
   · **«Validat» només amb temps apuntat i algú que ho valida.** Només el que
     està validat compta a la comptabilitat de valor (hores per tipus i per
     qui). És el mateix que «comptabilitzat» al SOS.
   · **Els euros no viuen aquí** («todo sin precios»): només amb una tarifa que
     arriba amb cada tauler, privada.

   La forma és la del SOS (`node.kanban.cards`, amb `text` i `col`), perquè els
   taulers del SOS hi passin sense perdre res: todo/doing/done hi són, i una
   targeta del SOS ja comptabilitzada (`accounted`) es llegeix com a validada.

   Sense dependències. Node (tests i funcions de Netlify) i navegador
   (window.Kanban). La vista, `pinta`, és opcional: el motor no la necessita. */
(function (g) {
  'use strict';
  var COLS = ['todo', 'doing', 'done', 'valid'];
  var TIPUS = ['formacion', 'consultoria', 'desarrollo', 'gestion'];
  var T = {
    es: {
      col: { todo: 'Por hacer', doing: 'Haciendo', done: 'Hecho', valid: 'Validado' },
      colD: { todo: 'La lista de todo lo que hay que hacer.', doing: 'En marcha: cada pomodoro queda apuntado.', done: 'Entregado, con su prueba.', valid: 'Revisado por alguien: ya cuenta como valor.' },
      tip: { formacion: 'Formación', consultoria: 'Consultoría', desarrollo: 'Desarrollo', gestion: 'Gestión' },
      tipL: 'Tipo de trabajo', quiL: 'Quién lo hace', titol: 'Qué hay que hacer', titolP: 'Por ejemplo: revisar los textos de la página de cursos',
      ent: 'Qué queda hecho al acabar (el entregable)', entP: 'Por ejemplo: la página de cursos con las fechas de 2027',
      nova: '+ Nueva tarea', guarda: 'Guardar', cancel: 'Cancelar', edita: 'Cambiar', esborra: 'Quitar',
      pomo: '⏱ {0} min', pomoT: 'Empieza un pomodoro de {0} minutos con esta tarea',
      apunta: '+ Apuntar tiempo', min: 'Minutos', nota: 'Qué has avanzado (opcional)', notaP: 'Por ejemplo: textos revisados hasta el FELE Intensivo',
      fet: 'Hecho →', prova: 'La prueba: qué se ha entregado', provaP: 'Un enlace o una frase: «la página de cursos publicada en la vista previa»',
      valida: 'Validar →', validaL: 'Quién lo valida', torna: '←', tornaT: 'Volver a «{0}»',
      falta: { titol: 'Falta decir qué hay que hacer.', prova: 'Falta la prueba de lo que se ha entregado.', temps: 'Para validar hace falta tiempo apuntado.', valida: 'Falta quién lo valida.', min: 'Pon los minutos.' },
      reg: '{0} · {1} min · {2}', regs: 'Registro ({0})', temps: '{0} apuntado', h: '{0} h', m: '{0} min',
      totes: 'Todas', buit: 'Sin tareas todavía. Empieza por la lista: todo lo que hay que hacer, aunque sea pequeño.',
      valor: 'Validado: {0}', perTipus: 'Por tipo: {0}', perQui: 'Por quién: {0}', pendent: 'Hecho y por validar: {0}', enCurs: 'En marcha: {0}', eur: ' · {0} €',
      comptes: '{0} por hacer · {1} haciendo · {2} hechas · {3} validadas',
      pomoAra: 'Pomodoro con «{0}»', pomoFet: 'Tiempo cumplido. Apúntalo ahora que aún te acuerdas.', pomoN: '{0} min · lo que dedicas se apunta en la tarea, no se pierde',
      pomoReg: 'Apuntar {0} min', pomoAbans: 'Ya está', pomoDeixa: 'Dejarlo', pomoAltre: 'Hay un pomodoro en marcha con otra tarea: «{0}».',
      enllac: 'Enlace a esta tarea', de: 'Viene de: {0}', projecte: 'Proyecto',
      resum: 'Tareas: {0}', linia: '· {0} [{1}] · {2} · {3} · {4}{5}'
    },
    ca: {
      col: { todo: 'Per fer', doing: 'Fent', done: 'Fet', valid: 'Validat' },
      colD: { todo: 'La llista de tot el que cal fer.', doing: 'En marxa: cada pomodoro queda apuntat.', done: 'Entregat, amb la seva prova.', valid: 'Revisat per algú: ja compta com a valor.' },
      tip: { formacion: 'Formació', consultoria: 'Consultoria', desarrollo: 'Desenvolupament', gestion: 'Gestió' },
      tipL: 'Tipus de feina', quiL: 'Qui ho fa', titol: 'Què cal fer', titolP: 'Per exemple: revisar els textos de la pàgina de cursos',
      ent: 'Què queda fet en acabar (l\'entregable)', entP: 'Per exemple: la pàgina de cursos amb les dates del 2027',
      nova: '+ Nova tasca', guarda: 'Desa', cancel: 'Cancel·la', edita: 'Canvia', esborra: 'Treu',
      pomo: '⏱ {0} min', pomoT: 'Comença un pomodoro de {0} minuts amb aquesta tasca',
      apunta: '+ Apunta temps', min: 'Minuts', nota: 'Què has avançat (opcional)', notaP: 'Per exemple: textos revisats fins al FELE Intensiu',
      fet: 'Fet →', prova: 'La prova: què s\'ha entregat', provaP: 'Un enllaç o una frase: «la pàgina de cursos publicada a la vista prèvia»',
      valida: 'Valida →', validaL: 'Qui ho valida', torna: '←', tornaT: 'Torna a «{0}»',
      falta: { titol: 'Falta dir què cal fer.', prova: 'Falta la prova del que s\'ha entregat.', temps: 'Per validar cal temps apuntat.', valida: 'Falta qui ho valida.', min: 'Posa els minuts.' },
      reg: '{0} · {1} min · {2}', regs: 'Registre ({0})', temps: '{0} apuntat', h: '{0} h', m: '{0} min',
      totes: 'Totes', buit: 'Encara no hi ha tasques. Comença per la llista: tot el que cal fer, encara que sigui petit.',
      valor: 'Validat: {0}', perTipus: 'Per tipus: {0}', perQui: 'Per qui: {0}', pendent: 'Fet i per validar: {0}', enCurs: 'En marxa: {0}', eur: ' · {0} €',
      comptes: '{0} per fer · {1} fent · {2} fetes · {3} validades',
      pomoAra: 'Pomodoro amb «{0}»', pomoFet: 'Temps complert. Apunta\'l ara que encara te\'n recordes.', pomoN: '{0} min · el que dediques s\'apunta a la tasca, no es perd',
      pomoReg: 'Apunta {0} min', pomoAbans: 'Ja està', pomoDeixa: 'Deixa-ho', pomoAltre: 'Hi ha un pomodoro en marxa amb una altra tasca: «{0}».',
      enllac: 'Enllaç a aquesta tasca', de: 'Ve de: {0}', projecte: 'Projecte',
      resum: 'Tasques: {0}', linia: '· {0} [{1}] · {2} · {3} · {4}{5}'
    }
  };
  function f(s) { var a = arguments; return String(s).replace(/\{(\d)\}/g, function (_, i) { return a[+i + 1] == null ? '' : a[+i + 1]; }); }
  function txt(v, n) { return (v == null ? '' : String(v)).trim().slice(0, n); }
  function nouId() { return 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function avui() { return new Date().toISOString().slice(0, 10); }

  /* ── Les dades ────────────────────────────────────────────────────────── */
  /* La targeta neta: el que arriba d'un navegador, d'un servidor o d'un tauler
     antic del SOS passa per aquí i en surt amb la mateixa forma. */
  function neta(c) {
    if (!c || typeof c !== 'object') return null;
    var text = txt(c.text != null ? c.text : c.titol, 200);
    if (!text) return null;
    var col = COLS.indexOf(c.col) >= 0 ? c.col : 'todo';
    if (col === 'done' && c.accounted) col = 'valid';
    var o = { id: /^[\w-]{1,40}$/.test(String(c.id || '')) ? String(c.id) : nouId(), text: text, col: col,
      entregable: txt(c.entregable, 300), qui: txt(c.qui, 60), tipus: TIPUS.indexOf(c.tipus) >= 0 ? c.tipus : '',
      reg: (Array.isArray(c.reg) ? c.reg : []).slice(-60).map(function (r) {
        var m = Math.round(+(r && r.min) || 0);
        return m > 0 ? { min: Math.min(m, 600), qui: txt(r.qui, 60), data: txt(r.data, 10), nota: txt(r.nota, 300), via: r.via === 'pomodoro' ? 'pomodoro' : 'ma' } : null;
      }).filter(Boolean),
      prova: txt(c.prova, 500) };
    if (c.valida && typeof c.valida === 'object' && txt(c.valida.qui, 60)) o.valida = { qui: txt(c.valida.qui, 60), data: txt(c.valida.data, 10) };
    if (c.origen && typeof c.origen === 'object') o.origen = { tipus: txt(c.origen.tipus, 20), id: txt(c.origen.id, 80), nom: txt(c.origen.nom, 120) };
    if (c.accounted) o.accounted = txt(c.accounted, 80);
    if (c.creat) o.creat = txt(c.creat, 10);
    if (c.act) o.act = txt(c.act, 30);
    return o;
  }
  /* Un tauler net: { cards: [...], fora: [ids] }, com `node.kanban` del SOS.
     `fora` són les targetes tretes: sense recordar-les, la còpia de l'altre
     aparell les tornaria a portar. */
  function neteja(k, max) {
    var fora = (k && Array.isArray(k.fora) ? k.fora : []).filter(function (x) { return /^[\w-]{1,40}$/.test(String(x)); }).slice(-200), nf = {};
    fora.forEach(function (x) { nf[x] = 1; });
    var cs = (k && Array.isArray(k.cards) ? k.cards : []).slice(0, max || 120).map(neta).filter(Boolean), vist = {};
    return { cards: cs.filter(function (c) { if (vist[c.id] || nf[c.id]) return false; vist[c.id] = 1; return true; }), fora: fora };
  }
  /* Dos aparells, el mateix tauler (la María al seu, l'Àlvaro al panell): es
     fusionen targeta a targeta i guanya la que s'ha tocat més tard (`act`). El
     que algú ha tret, es queda tret. Mai es perd una targeta per una còpia vella. */
  function fusiona(a, b) {
    var A = neteja(a), B = neteja(b), fora = {}, per = {}, ordre = [];
    A.fora.concat(B.fora).forEach(function (x) { fora[x] = 1; });
    A.cards.concat(B.cards).forEach(function (c) {
      if (fora[c.id]) return;
      if (!per[c.id]) { ordre.push(c.id); per[c.id] = c; return; }
      if (String(c.act || '') > String(per[c.id].act || '')) per[c.id] = c;
    });
    return { cards: ordre.map(function (id) { return per[id]; }), fora: Object.keys(fora).slice(-200) };
  }
  function minuts(c) { return (c && c.reg || []).reduce(function (s, r) { return s + (+r.min || 0); }, 0); }

  /* On pot anar una targeta, i què li falta. Les portes es comproven sempre:
     un estat desat que diu «valid» sense prova torna a la columna que li toca. */
  function falta(c, col) {
    if (c.accounted && col !== 'todo' && col !== 'doing') return '';
    if (col === 'done' || col === 'valid') { if (!c.prova) return 'prova'; }
    if (col === 'valid') { if (!(minuts(c) > 0) && !c.accounted) return 'temps'; if (!(c.valida && c.valida.qui) && !c.accounted) return 'valida'; }
    return '';
  }
  function columna(c) {
    var i = COLS.indexOf(c.col); if (i < 0) return 'todo';
    while (i > 1 && falta(c, COLS[i])) i--;
    if (i === 0 && minuts(c) > 0) return 'doing';
    return COLS[i];
  }
  /* Moure: torna la targeta nova o { falta } si no hi pot anar. */
  function mou(c, col, extra) {
    var n = Object.assign({}, c, extra || {}); n.col = col;
    if (col === 'valid' && extra && extra.valida && !extra.valida.data) n.valida = { qui: extra.valida.qui, data: avui() };
    if (COLS.indexOf(col) < 2) { delete n.valida; }
    var fa = falta(n, col); if (fa) return { falta: fa };
    return n;
  }
  /* El registre: una línia per pomodoro o per temps apuntat a mà. Apuntar temps
     a una targeta de la llista la posa en marxa. */
  function apunta(c, r) {
    var m = Math.round(+(r && r.min) || 0); if (!(m > 0)) return { falta: 'min' };
    var n = Object.assign({}, c, { reg: (c.reg || []).concat([{ min: Math.min(m, 600), qui: txt(r.qui, 60) || c.qui || '', data: r.data || avui(), nota: txt(r.nota, 300), via: r.via === 'pomodoro' ? 'pomodoro' : 'ma' }]) });
    if (n.col === 'todo') n.col = 'doing';
    return n;
  }
  function compte(cs) {
    var n = { todo: 0, doing: 0, done: 0, valid: 0 };
    (cs || []).forEach(function (c) { n[columna(c)]++; });
    return n;
  }
  /* La comptabilitat de valor. Només compta el que està validat; la resta es
     diu a part (fet i per validar, en marxa) perquè es vegi, però no suma. El
     temps de cada línia del registre és de qui el va fer, no de la targeta. */
  function valor(cs) {
    var v = { min: 0, tipus: {}, qui: {}, pendent: 0, enCurs: 0 };
    (cs || []).forEach(function (c) {
      var col = columna(c), m = minuts(c);
      if (col === 'valid') {
        v.min += m; if (c.tipus) v.tipus[c.tipus] = (v.tipus[c.tipus] || 0) + m;
        (c.reg || []).forEach(function (r) { var q = r.qui || c.qui || '?'; v.qui[q] = (v.qui[q] || 0) + r.min; });
      } else if (col === 'done') v.pendent += m;
      else v.enCurs += m;
    });
    return v;
  }
  function hores(min, L) { var t = T[L === 'ca' ? 'ca' : 'es']; return min < 60 ? f(t.m, min) : f(t.h, (Math.round(min / 6) / 10).toLocaleString(L === 'ca' ? 'ca-ES' : 'es-ES')); }
  /* El que viatja amb l'encàrrec i amb el cervell del projecte: una línia per
     tasca, amb la prova i qui la va validar. */
  function resum(k, L, noms) {
    var t = T[L === 'ca' ? 'ca' : 'es'], cs = (k && k.cards) || [];
    if (!cs.length) return '';
    var n = compte(cs), nom = function (q) { return (noms && noms[q]) || q || '—'; };
    var l = [f(t.resum, f(t.comptes, n.todo, n.doing, n.done, n.valid))];
    cs.forEach(function (c) {
      var col = columna(c);
      l.push(f(t.linia, c.text, t.col[col], nom(c.qui), c.tipus ? t.tip[c.tipus] : '—', hores(minuts(c), L),
        (c.prova ? ' · ' + c.prova : '') + (col === 'valid' && c.valida ? ' · ✓ ' + nom(c.valida.qui) : '')));
    });
    return l.join('\n');
  }
  /* El backlog de tot, fractal. Àlvaro: «con una lógica fractal debería poderme
     conectar y ver mi Kanban filtrado siempre; mi dashboard es mi realidad».
     Un tauler és un node, com els del graf del SOS: { id, projecte, kanban,
     fills:[taulers] }. Ajuntar-los torna totes les targetes de la branca, a
     qualsevol fondària, cada una amb el seu camí (Teamtowers › ELE Barcelona ›
     Web). La mateixa funció fa la vista de la María (la seva branca) i la de
     l'Àlvaro (tot el que penja d'ell). */
  function ajunta(taulers, cami) {
    var out = [];
    (taulers || []).forEach(function (x) {
      if (!x) return;
      var cm = (cami || []).concat(x.projecte ? [x.projecte] : []);
      ((x.kanban && x.kanban.cards) || []).forEach(function (c) { out.push(Object.assign({}, c, { _projecte: cm.join(' › '), _font: x.id || '' })); });
      if (Array.isArray(x.fills)) out = out.concat(ajunta(x.fills, cm));
    });
    return out;
  }

  /* ── La vista ─────────────────────────────────────────────────────────── */
  var estil = false;
  function posaEstil() {
    if (estil || typeof document === 'undefined') return; estil = true;
    var s = document.createElement('style'); s.id = 'kb-css';
    s.textContent =
      '.kb-n{margin:0 0 .6rem;font-family:var(--mono,monospace);font-size:.8rem;color:var(--muted)}.kb-n a{color:inherit}' +
      '.kb-val{margin:0 0 .8rem;padding:.6rem .75rem;border-left:3px solid var(--green,#2a7);background:var(--panel);border-radius:0 10px 10px 0;font-size:.85rem;line-height:1.45}.kb-val p{margin:0}' +
      '.kb-fil{display:flex;flex-wrap:wrap;gap:.35rem;margin:0 0 .7rem}' +
      '.kb-cols{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.6rem;align-items:start}' +
      '.kb-col{min-height:7rem;border:1px dashed var(--border-strong);border-radius:12px;padding:.55rem;background:var(--panel);scroll-margin-top:10rem}' +
      '.kb-col.kb-sobre{background:var(--card);border-style:solid}' +
      '.kb-col h4{margin:0;font-size:.8rem;font-family:var(--mono,monospace);text-transform:uppercase;letter-spacing:.05em;display:flex;justify-content:space-between;gap:.5rem}' +
      '.kb-col>p{margin:.2rem 0 .55rem;font-size:.8rem;color:var(--muted);line-height:1.35}' +
      '.kb-c{margin:0 0 .5rem;padding:.55rem .65rem;border-radius:10px;background:var(--card);border:1px solid var(--border);border-left:4px solid var(--border-strong);font-size:.88rem;line-height:1.35;scroll-margin:10rem 0 6rem}' +
      '.kb-c[draggable="true"]{cursor:grab}.kb-c:target,.kb-c.kb-on{box-shadow:0 0 0 2px var(--indigo)}' +
      '.kb-c[data-col="doing"]{border-left-color:var(--orange)}.kb-c[data-col="done"]{border-left-color:var(--blue)}.kb-c[data-col="valid"]{border-left-color:var(--green)}' +
      '.kb-c>a{display:block;font-weight:700;color:var(--text);text-decoration:none}.kb-c>a:hover{text-decoration:underline}' +
      '.kb-c small,.kb-c .kb-q{display:block;margin-top:.25rem;font-size:.8rem;color:var(--light)}' +
      '.kb-et{display:flex;flex-wrap:wrap;gap:.25rem;margin-top:.35rem}.kb-et span{font-size:.72rem;font-family:var(--mono,monospace);padding:.1rem .4rem;border-radius:6px;border:1px solid var(--border-strong);color:var(--light)}' +
      '.kb-c details{margin-top:.3rem;font-size:.8rem;color:var(--light)}.kb-c details ul{margin:.2rem 0 0;padding-left:1rem}' +
      '.kb-acc{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.45rem}' +
      '.kb-acc button,.kb-f button,.kb-fil button{min-height:36px;padding:.35rem .7rem;border:1px solid var(--border-strong);border-radius:8px;background:var(--card);color:var(--text);font:inherit;font-size:.82rem;font-weight:600;cursor:pointer}' +
      '.kb-acc button.kb-p,.kb-f button.kb-p,.kb-fil button[aria-pressed="true"]{background:var(--text);color:var(--bg);border-color:var(--text)}' +
      '.kb-acc button:focus-visible,.kb-f button:focus-visible,.kb-c>a:focus-visible{outline:2px solid var(--indigo);outline-offset:2px}' +
      '.kb-f{margin-top:.5rem;display:grid;gap:.45rem}.kb-f label,.kb-f legend{font-size:.8rem;font-weight:600}' +
      '.kb-f fieldset{border:0;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:.3rem}.kb-f fieldset legend{width:100%;margin-bottom:.2rem}' +
      '.kb-f fieldset button[aria-pressed="true"]{border-color:var(--indigo);box-shadow:0 0 0 1px var(--indigo)}' +
      '.kb-f input,.kb-f textarea,.kb-f select{width:100%;box-sizing:border-box;padding:.45rem .55rem;border:1px solid var(--border-strong);border-radius:8px;background:var(--bg);color:var(--text);font:inherit;font-size:.88rem}' +
      '.kb-f textarea{min-height:3.2em;resize:vertical}.kb-err{color:var(--red);font-size:.8rem;margin:0}' +
      '.kb-pomo{margin:0 0 .8rem;padding:.7rem .8rem;border:2px solid var(--orange);border-radius:12px;background:var(--card)}.kb-pomo.kb-pfet{border-color:var(--green)}' +
      '.kb-pomo b.kb-rel{font-family:var(--mono,monospace);font-size:1.6rem;float:right;line-height:1}.kb-pomo p{margin:.2rem 0;font-size:.85rem}' +
      '@media (max-width:900px){.kb-cols{grid-template-columns:1fr}.kb-col{min-height:0}.kb-f input,.kb-f textarea,.kb-f select{font-size:16px}.kb-acc button,.kb-f button,.kb-fil button{min-height:44px}}';
    document.head.appendChild(s);
  }
  function el(tag, at, t2) {
    var e = document.createElement(tag);
    for (var k in at || {}) if (at[k] != null) e.setAttribute(k, at[k]);
    if (t2 != null) e.textContent = t2;
    return e;
  }

  /* o: { kanban, persones:[{id,nom}], jo, valida:[{id,nom}], llengua, prefix,
          pomoClau, tarifa, onCanvi(kanban), projecte(c) }
     `persones` són qui pot fer feina al tauler (la clienta, l'Àlvaro, la
     màquina); `jo`, qui mira (per al filtre «les meves» i per al pomodoro);
     `valida`, qui pot validar (per defecte, totes les persones menys la màquina). */
  function pinta(cont, o) {
    posaEstil();
    var L = o.llengua === 'ca' ? 'ca' : 'es', t = T[L], pre = o.prefix || 'tarea-';
    var k = neteja(o.kanban), cs = k.cards, PM = g.Pomodoro, clauP = o.pomoClau || 'tt.kanban.pomo';
    var pers = (o.persones || []).filter(function (p) { return p && p.id; }), nom = {};
    pers.forEach(function (p) { nom[p.id] = p.nom; });
    var vals = (o.valida || pers.filter(function (p) { return p.id !== 'maquina'; }));
    var st = cont._kb || (cont._kb = { obert: null, mode: null, fil: '' });
    cont.textContent = '';
    function desa(nou, focus) {
      k.cards = nou; o.kanban = k; if (o.onCanvi) o.onCanvi(k);
      st.obert = null; st.mode = null; pinta(cont, o);
      var c = focus && document.getElementById(pre + focus); if (c) { var a = c.querySelector('a'); if (a) a.focus({ preventScroll: true }); c.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    }
    function posa(c) { c = Object.assign({}, c, { act: new Date().toISOString() }); desa(cs.map(function (x) { return x.id === c.id ? c : x; }), c.id); }
    function obre(id, mode) { st.obert = id; st.mode = mode; pinta(cont, o); }

    /* El pomodoro d'aquest tauler, si n'hi ha un en marxa. */
    var p = PM ? PM.llegeix(clauP) : null;
    if (p && !cs.some(function (c) { return c.id === p.id; })) p = null;
    if (p) cont.appendChild(caixaPomo(p));

    /* La comptabilitat de valor, a dalt: és el que dona sentit al tauler. */
    var v = valor(cs), tar = +o.tarifa > 0 ? +o.tarifa : 0, eu = function (m) { return tar ? f(t.eur, (Math.round(m / 60 * tar * 100) / 100).toLocaleString('es-ES')) : ''; };
    var vb = el('div', { class: 'kb-val', 'aria-live': 'polite' });
    vb.appendChild(el('p', {}, f(t.valor, hores(v.min, L)) + eu(v.min)));
    var pt = TIPUS.filter(function (x) { return v.tipus[x]; }).map(function (x) { return t.tip[x] + ' ' + hores(v.tipus[x], L); });
    if (pt.length) vb.appendChild(el('p', {}, f(t.perTipus, pt.join(' · '))));
    var pq = Object.keys(v.qui).map(function (q) { return (nom[q] || q) + ' ' + hores(v.qui[q], L); });
    if (pq.length) vb.appendChild(el('p', {}, f(t.perQui, pq.join(' · '))));
    var ap = [];
    if (v.pendent) ap.push(f(t.pendent, hores(v.pendent, L)));
    if (v.enCurs) ap.push(f(t.enCurs, hores(v.enCurs, L)));
    if (ap.length) vb.appendChild(el('p', {}, ap.join(' · ')));
    cont.appendChild(vb);

    /* Filtre per qui: «les meves» i les de cadascú. */
    if (pers.length > 1) {
      var fl = el('div', { class: 'kb-fil', role: 'group' });
      [{ id: '', nom: t.totes }].concat(pers).forEach(function (q) {
        var n = q.id ? cs.filter(function (c) { return c.qui === q.id; }).length : cs.length;
        if (q.id && !n) return;
        var b = el('button', { type: 'button', 'aria-pressed': String(st.fil === q.id) }, q.nom + ' · ' + n);
        b.addEventListener('click', function () { st.fil = q.id; pinta(cont, o); });
        fl.appendChild(b);
      });
      cont.appendChild(fl);
    }
    var vis = st.fil ? cs.filter(function (c) { return c.qui === st.fil; }) : cs;
    var n = compte(vis), nn = el('p', { class: 'kb-n' });
    f(t.comptes, n.todo, n.doing, n.done, n.valid).split(' · ').forEach(function (x, i) {
      if (i) nn.appendChild(document.createTextNode(' · '));
      nn.appendChild(el('a', { href: '#' + pre + 'col-' + COLS[i] }, x));
    });
    cont.appendChild(nn);

    var cols = el('div', { class: 'kb-cols' }), by = {};
    COLS.forEach(function (c) {
      var d = el('section', { class: 'kb-col', id: pre + 'col-' + c, 'data-col': c, 'aria-label': t.col[c] }), h = el('h4');
      h.appendChild(el('span', {}, t.col[c])); h.appendChild(el('b', {}, String(n[c])));
      d.appendChild(h); d.appendChild(el('p', {}, t.colD[c]));
      d.addEventListener('dragover', function (ev) { ev.preventDefault(); d.classList.add('kb-sobre'); });
      d.addEventListener('dragleave', function () { d.classList.remove('kb-sobre'); });
      d.addEventListener('drop', function (ev) {
        ev.preventDefault(); d.classList.remove('kb-sobre');
        var id = ev.dataTransfer.getData('text/plain'), x = cs.filter(function (y) { return y.id === id; })[0];
        if (x) vesA(x, c);
      });
      by[c] = d; cols.appendChild(d);
    });
    /* Anar a una columna: si li falta alguna cosa, s'obre la fitxa que la demana. */
    function vesA(c, col) {
      if (col === 'done' && !c.prova) return obre(c.id, 'prova');
      if (col === 'valid') { if (!c.prova) return obre(c.id, 'prova'); if (!(minuts(c) > 0)) return obre(c.id, 'temps'); return obre(c.id, 'valida'); }
      var r = mou(c, col); if (!r.falta) posa(r);
    }
    vis.forEach(function (c) {
      var col = columna(c), i = COLS.indexOf(col);
      var card = el('article', { class: 'kb-c' + (st.obert === c.id ? ' kb-on' : ''), id: pre + c.id, 'data-col': col, draggable: 'true' });
      card.addEventListener('dragstart', function (ev) { ev.dataTransfer.setData('text/plain', c.id); });
      card.appendChild(el('a', { href: '#' + pre + c.id, title: t.enllac }, c.text));
      if (c.entregable) card.appendChild(el('small', {}, '⬢ ' + c.entregable));
      var et = el('div', { class: 'kb-et' });
      if (o.projecte && o.projecte(c)) et.appendChild(el('span', {}, o.projecte(c)));
      if (c.qui) et.appendChild(el('span', {}, nom[c.qui] || c.qui));
      if (c.tipus) et.appendChild(el('span', {}, t.tip[c.tipus]));
      var m = minuts(c); if (m) et.appendChild(el('span', {}, f(t.temps, hores(m, L))));
      card.appendChild(et);
      if (c.origen && c.origen.nom) card.appendChild(el('span', { class: 'kb-q' }, f(t.de, c.origen.nom)));
      if (c.prova && i >= 2) card.appendChild(el('span', { class: 'kb-q' }, '✓ ' + c.prova));
      if (col === 'valid' && c.valida) card.appendChild(el('span', { class: 'kb-q' }, '✓ ' + (nom[c.valida.qui] || c.valida.qui) + (c.valida.data ? ' · ' + c.valida.data : '')));
      if ((c.reg || []).length) {
        var dt = el('details'); dt.appendChild(el('summary', {}, f(t.regs, c.reg.length)));
        var ul = el('ul'); c.reg.forEach(function (r) { ul.appendChild(el('li', {}, f(t.reg, r.data, r.min, nom[r.qui] || r.qui || '—') + (r.via === 'pomodoro' ? ' ⏱' : '') + (r.nota ? ' · ' + r.nota : ''))); });
        dt.appendChild(ul); card.appendChild(dt);
      }
      if (st.obert === c.id) card.appendChild(fitxa(c, st.mode));
      else {
        var acc = el('div', { class: 'kb-acc' }), b = function (tx, fn, pp, tit) { var x = el('button', { type: 'button', class: pp ? 'kb-p' : null, title: tit || null }, tx); x.addEventListener('click', fn); acc.appendChild(x); };
        if (PM && i < 2 && !(p && p.id === c.id)) b(f(t.pomo, PM.MIN), function () { comenca(c); }, i === 1, f(t.pomoT, PM.MIN));
        if (i < 2) b(t.apunta, function () { obre(c.id, 'temps'); });
        if (i === 1) b(t.fet, function () { vesA(c, 'done'); }, false);
        if (i === 0) b(t.edita, function () { obre(c.id, 'edita'); });
        if (i === 2) b(t.valida, function () { vesA(c, 'valid'); }, true);
        if (i > 0) { var bt = el('button', { type: 'button', title: f(t.tornaT, t.col[COLS[i - 1]]), 'aria-label': f(t.tornaT, t.col[COLS[i - 1]]) }, t.torna); bt.addEventListener('click', function () { var r = mou(c, COLS[i - 1]); if (!r.falta) posa(r); }); acc.appendChild(bt); }
        card.appendChild(acc);
      }
      by[col].appendChild(card);
    });
    cont.appendChild(cols);
    if (!cs.length) cont.insertBefore(el('p', { class: 'kb-n' }, t.buit), cols);
    if (st.obert === '_nova') cont.appendChild(fitxa({ id: nouId(), text: '', col: 'todo', qui: o.jo || (pers[0] || {}).id || '', tipus: '', reg: [], nova: true }, 'edita'));
    else { var ad = el('div', { class: 'kb-acc' }), bn = el('button', { type: 'button' }, t.nova); bn.addEventListener('click', function () { obre('_nova', 'edita'); }); ad.appendChild(bn); cont.appendChild(ad); }

    function comenca(c) {
      PM.comenca(clauP, { id: c.id, titol: c.text, qui: o.jo || c.qui || '' });
      if (c.col === 'todo') { posa(Object.assign({}, c, { col: 'doing' })); } else pinta(cont, o);
      arrencaTic();
    }
    function arrencaTic() {
      if (cont._tic) clearInterval(cont._tic);
      cont._tic = setInterval(function () {
        var q = PM.llegeix(clauP), r = cont.querySelector('.kb-rel');
        if (!q || !r) { clearInterval(cont._tic); cont._tic = null; return; }
        var s = PM.resta(q); r.textContent = PM.rellotge(s);
        /* En arribar a zero no es tanca sol: tancar-lo seria decidir per tu
           que aquell temps no compta. Es redibuixa la caixa i espera. */
        if (s <= 0) { clearInterval(cont._tic); cont._tic = null; pinta(cont, o); }
      }, 1000);
    }
    function caixaPomo(q) {
      var c = cs.filter(function (x) { return x.id === q.id; })[0], s = PM.resta(q), fet = s <= 0;
      var bx = el('div', { class: 'kb-pomo' + (fet ? ' kb-pfet' : ''), role: 'status' });
      bx.appendChild(el('b', { class: 'kb-rel' }, PM.rellotge(s)));
      bx.appendChild(el('p', {}, f(t.pomoAra, q.titol || c.text)));
      bx.appendChild(el('p', { class: 'kb-n' }, fet ? t.pomoFet : f(t.pomoN, q.min)));
      var acc = el('div', { class: 'kb-acc' }), mins = PM.fets(q);
      var reg = function () { PM.desa(clauP, null); var r = apunta(c, { min: mins, qui: q.qui, via: 'pomodoro' }); if (!r.falta) { st.notaDe = c.id; posa(r); obre(c.id, 'nota'); } };
      var b1 = el('button', { type: 'button', class: 'kb-p' }, fet ? f(t.pomoReg, mins) : t.pomoAbans); b1.addEventListener('click', reg); acc.appendChild(b1);
      var b2 = el('button', { type: 'button' }, t.pomoDeixa); b2.addEventListener('click', function () { PM.desa(clauP, null); pinta(cont, o); }); acc.appendChild(b2);
      bx.appendChild(acc);
      if (!fet && !cont._tic) setTimeout(arrencaTic, 0);
      return bx;
    }

    function tria(leg, ops, val, on) {
      var fs = el('fieldset'); fs.appendChild(el('legend', {}, leg));
      var bs = ops.map(function (q) {
        var x = el('button', { type: 'button', 'aria-pressed': String(q.id === val) }, q.nom);
        x.addEventListener('click', function () { on(q.id); bs.forEach(function (y) { y.setAttribute('aria-pressed', String(y === x)); }); });
        fs.appendChild(x); return x;
      });
      return fs;
    }
    /* Una sola fitxa per a tot: crear/canviar, apuntar temps, la prova, validar
       i la nota del pomodoro. Cada mode demana només el que li toca. */
    function fitxa(c, mode) {
      var fm = el('form', { class: 'kb-f' }), id = pre + c.id + '-', w = Object.assign({}, c), camps = {};
      var area = function (key, lbl, ph, val, input) {
        fm.appendChild(el('label', { for: id + key }, lbl));
        var x = el(input ? 'input' : 'textarea', input ? { id: id + key, type: input, placeholder: ph || null, min: input === 'number' ? '1' : null, inputmode: input === 'number' ? 'numeric' : null } : { id: id + key, placeholder: ph || null });
        x.value = val == null ? '' : val; fm.appendChild(x); camps[key] = x; return x;
      };
      if (mode === 'edita') {
        area('t', t.titol, t.titolP, c.text, 'text');
        area('e', t.ent, t.entP, c.entregable);
        if (pers.length) fm.appendChild(tria(t.quiL, pers, w.qui, function (q) { w.qui = q; }));
        fm.appendChild(tria(t.tipL, TIPUS.map(function (x) { return { id: x, nom: t.tip[x] }; }), w.tipus, function (q) { w.tipus = q; }));
      }
      if (mode === 'temps') { area('m', t.min, '', 25, 'number'); if (pers.length) { w._qui = o.jo || c.qui; fm.appendChild(tria(t.quiL, pers, w._qui, function (q) { w._qui = q; })); } area('n', t.nota, t.notaP, ''); }
      if (mode === 'nota') area('n', t.nota, t.notaP, '');
      if (mode === 'prova') area('p', t.prova, t.provaP, c.prova);
      if (mode === 'valida') { w._val = o.jo && vals.some(function (q) { return q.id === o.jo; }) ? o.jo : (vals[0] || {}).id; fm.appendChild(tria(t.validaL, vals, w._val, function (q) { w._val = q; })); }
      var err = el('p', { class: 'kb-err', role: 'alert' }); fm.appendChild(err);
      var acc = el('div', { class: 'kb-acc' }), ok = el('button', { type: 'submit', class: 'kb-p' }, t.guarda), no = el('button', { type: 'button' }, t.cancel);
      no.addEventListener('click', function () { st.obert = null; pinta(cont, o); });
      acc.appendChild(ok); acc.appendChild(no);
      if (mode === 'edita' && !c.nova) { var es = el('button', { type: 'button' }, t.esborra); es.addEventListener('click', function () { k.fora = (k.fora || []).concat([c.id]); desa(cs.filter(function (x) { return x.id !== c.id; })); }); acc.appendChild(es); }
      fm.appendChild(acc);
      fm.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var r;
        if (mode === 'edita') {
          w.text = camps.t.value.trim(); w.entregable = camps.e.value.trim();
          if (!w.text) { err.textContent = t.falta.titol; return; }
          var nova = !!w.nova; delete w.nova; if (nova) w.creat = avui();
          r = neta(w); if (nova) { r.act = new Date().toISOString(); return desa(cs.concat([r]), r.id); } return posa(r);
        }
        if (mode === 'temps') { r = apunta(c, { min: camps.m.value, qui: w._qui, nota: camps.n.value, via: 'ma' }); }
        if (mode === 'nota') { var rg = (c.reg || []).slice(), u = rg[rg.length - 1]; if (u && camps.n.value.trim()) rg[rg.length - 1] = Object.assign({}, u, { nota: camps.n.value.trim().slice(0, 300) }); r = Object.assign({}, c, { reg: rg }); }
        if (mode === 'prova') { var pv = camps.p.value.trim(); if (!pv) { err.textContent = t.falta.prova; return; } r = mou(c, 'done', { prova: pv }); }
        if (mode === 'valida') { if (!w._val) { err.textContent = t.falta.valida; return; } r = mou(c, 'valid', { valida: { qui: w._val } }); }
        if (r && r.falta) { err.textContent = t.falta[r.falta]; return; }
        posa(r);
      });
      setTimeout(function () { var x = fm.querySelector('input,textarea,button'); if (x) x.focus(); }, 0);
      return fm;
    }
    return { compte: compte(cs), valor: v };
  }

  var API = { COLS: COLS, TIPUS: TIPUS, T: T, neta: neta, neteja: neteja, minuts: minuts, falta: falta, columna: columna, mou: mou, apunta: apunta,
    compte: compte, valor: valor, fusiona: fusiona, hores: hores, resum: resum, ajunta: ajunta, pinta: pinta };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else g.Kanban = API;
})(typeof window !== 'undefined' ? window : this);
