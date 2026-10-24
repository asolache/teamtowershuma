/* El mapa de valor en moviment (24/10/2026). Àlvaro: «el mapa de valor amb
   l'animació del flux de valor, de manera que es vegin els entregables que
   flueixen, i les prioritats del mapa: on treballar-lo per millorar el flux».
   I a la part de la web: «com, en definir el flux de valor, es poden
   automatitzar processos des del tauler».

   Dues peces, una sola font: el cas que ja genera build-cas-automatitzat.js
   (real, sense noms ni xifres) i les regles de MapaValor (la concentració, la
   mateixa que fa servir l'app). Aquí no es declara cap dada:
     · MapaAnima.mapa(el, cas)   — els rols, els lliuraments circulant (de
       pressa el que va sol, a poc a poc el que fa una persona, quiet el que
       falta muntar) i les tres prioritats marcades sobre el dibuix.
     · MapaAnima.tauler(el, cas) — un lliurament real passant pel tauler:
       sense definir → definit → va sol.
   S'engega sol sobre [data-anima="mapa"] i [data-anima="tauler"] quan es
   veuen, i es torna a pintar quan canvia la llengua de la pàgina. */
(function (g) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var T = {
    ca: { tots: 'lliuraments', sol: 'ja van sols', punt: 'a punt d\'anar sols', muntar: 'per muntar', persona: 'de persona a persona',
      tang: 'tangible: es pot reclamar', intang: 'intangible: confiança, idees, reputació',
      pri: 'On treballar-hi per millorar el flux', p1: 'Automatitza el que ja està definit', p2: 'Munta el que falta',
      p3: 'Reparteix el pes', p1d: '{0} intercanvis ja definits, sobretot a {1}: amb {2}.', p2d: '{0}.',
      p3d: '{0} % del que circula passa per {1}. Si aquest rol falla, tot s\'atura: és un castell amb poca pinya.',
      p4: 'Cuida el que no es factura', p4d: '{0} lliuraments de confiança, com {1}. No s\'automatitzen: es registren, i el mapa avisa si s\'aturen.',
      pinya: 'La xarxa de valor és la pinya del castell de dalt de tot: si aguanta, l\'enxaneta —el projecte— arriba a dalt. Cada lliurament que circula és algú més empenyent.',
      valor: 'Una persona i la seva xarxa porten el que abans demanava una oficina.', i: 'i',
      t1: 'Dibuixes el flux', t2: 'El defineixes', t3: 'El tauler l\'automatitza',
      c1: 'Sense definir', c2: 'Definit', c3: 'Va sol', fa: 'Ho fa una persona',
      qui: 'Qui el dona → qui el rep', quan: 'Quan passa i què porta',
      honest: 'Funciona avui al tauler d\'una productora d\'esdeveniments. A la teva web arrenca amb els pilots.',
      a11y: 'Mapa de valor animat: {0} rols i {1} lliuraments' },
    es: { tots: 'entregables', sol: 'ya van solos', punt: 'listos para ir solos', muntar: 'por montar', persona: 'de persona a persona',
      tang: 'tangible: se puede reclamar', intang: 'intangible: confianza, ideas, reputación',
      pri: 'Dónde trabajar para mejorar el flujo', p1: 'Automatiza lo que ya está definido', p2: 'Monta lo que falta',
      p3: 'Reparte el peso', p1d: '{0} intercambios ya definidos, sobre todo en {1}: con {2}.', p2d: '{0}.',
      p3d: 'El {0} % de lo que circula pasa por {1}. Si ese rol falla, todo se para: es un castell con poca pinya.',
      p4: 'Cuida lo que no se factura', p4d: '{0} entregables de confianza, como {1}. No se automatizan: se registran, y el mapa avisa si se paran.',
      pinya: 'La red de valor es la pinya del castell de arriba: si aguanta, la enxaneta —el proyecto— llega arriba. Cada entregable que circula es alguien más empujando.',
      valor: 'Una persona y su red llevan lo que antes pedía una oficina.', i: 'y',
      t1: 'Dibujas el flujo', t2: 'Lo defines', t3: 'El tablero lo automatiza',
      c1: 'Sin definir', c2: 'Definido', c3: 'Va solo', fa: 'Lo hace una persona',
      qui: 'Quién lo da → quién lo recibe', quan: 'Cuándo pasa y qué lleva',
      honest: 'Funciona hoy en el tablero de una productora de eventos. En tu web arranca con los pilotos.',
      a11y: 'Mapa de valor animado: {0} roles y {1} entregables' }
  };
  var ICONA = [[/encarg/, '🏢'], [/reven/, '🤝'], [/produ/, '🎯'], [/acoge|acull/, '🏡'], [/vin|vi$/, '🍷'],
    [/sirve|serveix/, '🍽️'], [/dinami/, '🎪'], [/asist|assist/, '👥'], [/factur/, '🧾']];
  var VEL = { solo: 1.6, ia: 2.4, maquina: 2.4, persona: 5.5 };

  function ll() { return document.documentElement.lang === 'es' ? 'es' : 'ca'; }
  function f(s) { var a = arguments; return s.replace(/\{(\d)\}/g, function (_, i) { return a[+i + 1]; }); }
  function el(tag, at, txt) {
    var e = /^(svg|g|path|circle|text|tspan|title|animateMotion|mpath)$/.test(tag) ? document.createElementNS(NS, tag) : document.createElement(tag);
    for (var k in at || {}) e.setAttribute(k, at[k]);
    if (txt != null) e.textContent = txt;
    return e;
  }
  function icona(nom) { var n = nom.toLowerCase(); for (var i = 0; i < ICONA.length; i++) if (ICONA[i][0].test(n)) return ICONA[i][1]; return '●'; }
  /* «Quien elabora el vino» → «Quien elabora»; «Qui hi assisteix» es queda sencer. */
  function curt(nom) { var w = nom.split(' '); return w.slice(0, /^(lo|el|la|hi|ho|les|los|l'.*)$/.test(w[1]) ? 3 : 2).join(' '); }
  function llista(xs, L) { return xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' ' + T[L].i + ' ' + xs[xs.length - 1]; }
  function menor(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  /* L'estat d'un lliurament al tauler: el que ja va sol, el definit, el que
     falta muntar i el que és de persona (cara a cara o sense escaló). */
  function estat(x) { return x.escalo === 'automatizado' ? 'sol' : x.escalo === 'definido' ? 'punt' : x.escalo === 'por_montar' ? 'muntar' : 'persona'; }
  var COLOR = { sol: 'var(--green)', punt: 'var(--orange)', muntar: 'var(--muted)', persona: 'var(--blue)' };

  var estil = false;
  function posaEstil() {
    if (estil) return; estil = true;
    var s = document.createElement('style');
    s.textContent =
      '.ma-svg{width:100%;height:auto;display:block;overflow:visible}' +
      '.ma-f{fill:none;stroke-width:1.6;opacity:.5;transition:opacity .3s,stroke-width .3s}' +
      '.ma-svg.ma-tria .ma-f{opacity:.12}.ma-svg .ma-f.on{opacity:1;stroke-width:3.2}' +
      '.ma-svg.ma-tria .ma-d{opacity:.15}.ma-svg .ma-d.on{opacity:1}' +
      '.ma-n circle{fill:var(--card);stroke:var(--border-strong);stroke-width:1.5}.ma-n{cursor:pointer}' +
      '.ma-n.on circle{stroke:var(--text);stroke-width:2.5}' +
      '.ma-n text{font-family:var(--sans);font-size:14px;fill:var(--text);text-anchor:middle;font-weight:600;paint-order:stroke;stroke:var(--bg);stroke-width:4px}' +
      '.ma-n .ma-ic{font-size:24px;stroke:none}' +
      '.ma-b circle{stroke:var(--bg);stroke-width:2}.ma-b text{font:700 11px var(--sans);fill:#fff;text-anchor:middle}' +
      '.ma-peu{display:flex;flex-wrap:wrap;gap:.4rem 1.2rem;margin:.6rem 0 0;font-size:var(--t0,.85rem);color:var(--light)}' +
      '.ma-peu b{font-size:1.6em;color:var(--text);margin-right:.25rem;font-family:var(--sans)}.ma-peu i{display:inline-block;width:.7em;height:.7em;border-radius:50%;margin-right:.35rem}' +
      '.ma-ara{min-height:3.2em;margin:.8rem 0 0;padding:.6rem .9rem;border-left:3px solid var(--green);background:var(--panel);border-radius:0 8px 8px 0;font-size:.95rem;transition:border-color .3s}' +
      '.ma-ara small{display:block;color:var(--muted);font-family:var(--mono);font-size:.75rem}' +
      '.ma-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:2rem;align-items:start}' +
      '.ma-valor{font-family:var(--sans);font-size:1.25rem;font-weight:700;line-height:1.3;margin:0 0 .6rem}' +
      '.ma-pinya{margin:0 0 1.2rem;padding-left:.8rem;border-left:3px solid var(--green);color:var(--light);font-size:.95rem;line-height:1.5}' +
      '.ma-pri h3{font-size:.8rem;font-family:var(--mono);text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:0 0 .6rem}' +
      '.ma-pri button{all:unset;box-sizing:border-box;display:grid;grid-template-columns:1.8rem 1fr;gap:.6rem;width:100%;padding:.7rem;margin:0 0 .5rem;border:1px solid var(--border);border-radius:10px;background:var(--card);cursor:pointer}' +
      '.ma-pri button[aria-pressed="true"]{border-color:var(--text);box-shadow:0 0 0 1px var(--text)}' +
      '.ma-pri button:focus-visible{outline:2px solid var(--indigo);outline-offset:2px}' +
      '.ma-pri .ma-num{width:1.8rem;height:1.8rem;border-radius:50%;color:#fff;display:grid;place-items:center;font-weight:700}' +
      '.ma-pri b{display:block}.ma-pri span{font-size:.88rem;color:var(--light);line-height:1.4}' +
      '.ma-pri a{display:inline-block;margin-top:.4rem}' +
      '.ma-t{position:relative;margin:0 0 2rem}.ma-pas{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem;margin:0 0 .5rem;font-family:var(--sans);font-weight:700;font-size:.9rem}' +
      '.ma-pas span{opacity:.35;transition:opacity .3s}.ma-pas span.on{opacity:1}' +
      '.ma-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem}' +
      '.ma-col{min-height:9.5rem;border:1px dashed var(--border-strong);border-radius:12px;padding:.6rem;background:var(--panel)}' +
      '.ma-col h4{margin:0 0 .5rem;font-size:.75rem;font-family:var(--mono);text-transform:uppercase;letter-spacing:.05em;color:var(--muted);display:flex;justify-content:space-between}' +
      '.ma-col h4 b{color:var(--text)}.ma-pts{display:flex;flex-wrap:wrap;gap:3px;position:absolute;left:.6rem;right:.6rem;bottom:.6rem}.ma-pts i{width:9px;height:9px;border-radius:50%}.ma-col{position:relative}' +
      '.ma-card{position:absolute;top:0;left:0;padding:.55rem .65rem;border-radius:10px;background:var(--card);border:1px solid var(--border);border-left:4px solid var(--muted);box-shadow:0 6px 18px rgba(0,0,0,.08);font-size:.82rem;line-height:1.35;transition:transform .9s cubic-bezier(.5,0,.2,1),border-color .4s}' +
      '.ma-card b{display:block;font-size:.9rem}.ma-card small{display:block;color:var(--muted);margin-top:.3rem;max-height:0;overflow:hidden;transition:max-height .5s}' +
      '.ma-card.def small{max-height:4em}.ma-card .ma-lv{display:none;margin-top:.35rem;font-weight:700;color:var(--green)}.ma-card.sol .ma-lv{display:block}' +
      '.ma-hon{font-size:.8rem;color:var(--muted);margin:.5rem 0 0}' +
      '@media (max-width:800px){.ma-grid{grid-template-columns:1fr}.ma-n text{font-size:18px}.ma-svg{margin:0 -1rem;width:calc(100% + 2rem)}.ma-cols{grid-template-columns:1fr}.ma-col{min-height:7.5rem}.ma-pas{font-size:.78rem}}' +
      '@media (prefers-reduced-motion:reduce){.ma-card,.ma-f{transition:none}}';
    document.head.appendChild(s);
  }
  var quiet = function () { return g.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; };

  /* ── El mapa ──────────────────────────────────────────────────────────── */
  function mapa(cont, C) {
    posaEstil();
    var L = ll(), t = T[L], R = C.roles[L], fx = C.fluxos;
    /* El rol que més toca va al centre; la resta, en rotllana, en l'ordre que
       creua menys línies: cada rol al costat d'aquell amb qui més es dona. */
    var grau = R.map(function (r) { return fx.filter(function (x) { return x.de[L] === r || x.a[L] === r; }).length; });
    var mig = grau.indexOf(Math.max.apply(null, grau)), resta = R.filter(function (_, i) { return i !== mig; });
    var veu = function (a, b) { return fx.filter(function (x) { return (x.de[L] === a && x.a[L] === b) || (x.de[L] === b && x.a[L] === a); }).length; };
    var ordre = [resta.shift()];
    while (resta.length) {
      var u = ordre[ordre.length - 1];
      resta.sort(function (a, b) { return veu(u, b) - veu(u, a); });
      ordre.push(resta.shift());
    }
    var W = 700, H = 540, cx = W / 2, cy = H / 2 - 8, pos = {};
    pos[R[mig]] = [cx, cy];
    ordre.forEach(function (r, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / ordre.length; pos[r] = [cx + 285 * Math.cos(a), cy + 205 * Math.sin(a)]; });

    /* Les prioritats surten del mateix mapa: el que és definit, el que falta
       muntar i la concentració de la regla 7 de MapaValor. */
    var defs = fx.filter(function (x) { return x.escalo === 'definido'; });
    var munt = fx.filter(function (x) { return x.escalo === 'por_montar'; });
    var perP = {}; defs.forEach(function (x) { perP[x.proces] = (perP[x.proces] || 0) + 1; });
    var pTop = Object.keys(perP).sort(function (a, b) { return perP[b] - perP[a]; })[0];
    var pNom = ((C.processos.filter(function (p) { return p.id === pTop; })[0] || {}).nom || {})[L] || '';
    var amb = []; defs.forEach(function (x) { var o = x.de[L] === R[mig] ? x.a[L] : x.de[L]; if (amb.indexOf(o) < 0) amb.push(o); });
    var parells = {};
    fx.forEach(function (x) {
      var a = x.de[L], b = x.a[L], k = a < b ? a + '|' + b : b + '|' + a, p = parells[k] || (parells[k] = [a < b ? a : b, a < b ? b : a, '', '', '', '']);
      if (a === p[0]) { p[2] = x.mena; p[3] = x.que[L]; } else { p[4] = x.mena; p[5] = x.que[L]; }
    });
    var conc = g.MapaValor ? g.MapaValor.revisa({ roles: R, pairs: Object.keys(parells).map(function (k) { return parells[k]; }) }).regles.filter(function (r) { return r.id === 'concentracio'; })[0] : null;
    var pct = conc && (conc.diu.match(/(\d+) %/) || [])[1];
    var PRI = [
      { n: 1, c: COLOR.punt, t: t.p1, d: f(t.p1d, defs.length, menor(pNom), llista(amb.map(menor), L)), fl: defs },
      { n: 2, c: COLOR.muntar, t: t.p2, d: f(t.p2d, llista(munt.map(function (x) { return x.que[L]; }), L).replace(/^./, function (c) { return c.toUpperCase(); })), fl: munt }
    ];
    /* La tercera: si un rol concentra massa (regla 7), repartir el pes; si no,
       cuidar el que no es factura i ara ningú mira. */
    var humans = fx.filter(function (x) { return x.mena === 'intangible' && estat(x) === 'persona'; });
    if (conc && !conc.ok) PRI.push({ n: 3, c: 'var(--indigo)', t: t.p3, d: f(t.p3d, pct, menor(R[mig])), rol: R[mig], fl: fx.filter(function (x) { return x.de[L] === R[mig] || x.a[L] === R[mig]; }) });
    else if (humans.length) PRI.push({ n: 3, c: COLOR.persona, t: t.p4, d: f(t.p4d, humans.length, llista(humans.slice(0, 3).map(function (x) { return x.que[L]; }), L)), fl: humans });

    cont.textContent = '';
    var grid = el('div', { class: 'ma-grid' }), esq = el('div'), dre = el('div', { class: 'ma-pri' });
    var svg = el('svg', { class: 'ma-svg', viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': f(t.a11y, R.length, fx.length) });
    var gF = el('g'), gD = el('g'), gN = el('g'), gB = el('g'), quiets = quiet();
    var vies = fx.map(function (x, i) {
      var A = pos[x.de[L]], B = pos[x.a[L]], dx = B[0] - A[0], dy = B[1] - A[1], d = Math.sqrt(dx * dx + dy * dy) || 1;
      var k = 26, Q = [(A[0] + B[0]) / 2 - dy / d * k, (A[1] + B[1]) / 2 + dx / d * k], e = estat(x);
      var p = el('path', { id: 'ma-p' + i, class: 'ma-f', d: 'M' + A.join(' ') + 'Q' + Q.join(' ') + ' ' + B.join(' '), stroke: COLOR[e] });
      if (x.mena === 'intangible') p.setAttribute('stroke-dasharray', '5 5');
      p.appendChild(el('title', {}, x.de[L] + ' → ' + x.a[L] + ': ' + x.que[L]));
      gF.appendChild(p);
      var dot = el('circle', { class: 'ma-d', r: e === 'sol' ? 4.5 : 4, fill: COLOR[e] });
      if (e === 'muntar' || quiets) { var m = [0.25 * A[0] + 0.5 * Q[0] + 0.25 * B[0], 0.25 * A[1] + 0.5 * Q[1] + 0.25 * B[1]]; dot.setAttribute('cx', m[0]); dot.setAttribute('cy', m[1]); if (e === 'muntar') dot.setAttribute('fill-opacity', '.45'); }
      else {
        var v = VEL[x.qui] || 4, am = el('animateMotion', { dur: v + 's', repeatCount: 'indefinite', begin: (-(i * 0.37) % v).toFixed(2) + 's', rotate: 'auto' });
        var mp = el('mpath'); mp.setAttribute('href', '#ma-p' + i); am.appendChild(mp); dot.appendChild(am);
      }
      gD.appendChild(dot);
      return { x: x, p: p, dot: dot, mig: [0.25 * A[0] + 0.5 * Q[0] + 0.25 * B[0], 0.25 * A[1] + 0.5 * Q[1] + 0.25 * B[1]] };
    });
    var nodes = {};
    R.forEach(function (r) {
      var P = pos[r], n = el('g', { class: 'ma-n', tabindex: '0', role: 'button', 'aria-label': r });
      n.appendChild(el('title', {}, r));
      n.appendChild(el('circle', { cx: P[0], cy: P[1], r: r === R[mig] ? 38 : 30 }));
      n.appendChild(el('text', { x: P[0], y: P[1] + 9, class: 'ma-ic' }, icona(C.roles.es[R.indexOf(r)])));
      n.appendChild(el('text', { x: P[0], y: P[1] + (r === R[mig] ? 58 : 50) }, curt(r)));
      n.addEventListener('mouseenter', function () { tria(fx.filter(function (x) { return x.de[L] === r || x.a[L] === r; }), r); });
      n.addEventListener('focus', function () { tria(fx.filter(function (x) { return x.de[L] === r || x.a[L] === r; }), r); });
      n.addEventListener('mouseleave', function () { tria(null); });
      n.addEventListener('blur', function () { tria(null); });
      gN.appendChild(n); nodes[r] = n;
    });
    /* Les insígnies numerades: on toca cada prioritat. */
    PRI.forEach(function (pr) {
      if (pr.c === COLOR.persona) return; // deu insígnies taparien el dibuix: es veuen en triar-la
      var punts = pr.rol ? [[pos[pr.rol][0] + 30, pos[pr.rol][1] - 30]] : vies.filter(function (v) { return pr.fl.indexOf(v.x) >= 0; }).map(function (v) { return v.mig; });
      punts.forEach(function (m) {
        var b = el('g', { class: 'ma-b' });
        b.appendChild(el('circle', { cx: m[0], cy: m[1], r: 9, fill: pr.c }));
        b.appendChild(el('text', { x: m[0], y: m[1] + 4 }, pr.n));
        gB.appendChild(b);
      });
    });
    [gF, gD, gN, gB].forEach(function (x) { svg.appendChild(x); });
    esq.appendChild(svg);

    var compte = { sol: 0, punt: 0, muntar: 0, persona: 0 };
    fx.forEach(function (x) { compte[estat(x)]++; });
    var peu = el('p', { class: 'ma-peu' });
    var s0 = el('span'); s0.appendChild(el('b', {}, fx.length)); s0.appendChild(document.createTextNode(t.tots)); peu.appendChild(s0);
    ['sol', 'punt', 'muntar', 'persona'].forEach(function (k) {
      var s = el('span'), i = el('i'); i.style.background = COLOR[k];
      s.appendChild(i); s.appendChild(el('b', {}, compte[k])); s.appendChild(document.createTextNode(t[k])); peu.appendChild(s);
    });
    esq.appendChild(peu);
    var ll2 = el('p', { class: 'ma-peu' }); ll2.appendChild(el('span', {}, '── ' + t.tang)); ll2.appendChild(el('span', {}, '- - ' + t.intang)); esq.appendChild(ll2);
    var ara = el('p', { class: 'ma-ara', 'aria-live': 'polite' }); esq.appendChild(ara);

    dre.appendChild(el('p', { class: 'ma-valor' }, t.valor));
    dre.appendChild(el('p', { class: 'ma-pinya' }, t.pinya));
    dre.appendChild(el('h3', {}, t.pri));
    var botons = PRI.map(function (pr) {
      var b = el('button', { type: 'button', 'aria-pressed': 'false' }), n = el('span', { class: 'ma-num' }, pr.n), tx = el('span');
      n.style.background = pr.c; tx.appendChild(el('b', {}, pr.t)); tx.appendChild(document.createTextNode(pr.d));
      b.appendChild(n); b.appendChild(tx);
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') !== 'true';
        botons.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', String(on)); fix = on ? pr : null; tria(on ? pr.fl : null, pr.rol);
      });
      dre.appendChild(b); return b;
    });
    var cta = cont.getAttribute('data-cta');
    if (cta) dre.appendChild(el('a', { class: 'btn-primary', href: cta }, cont.getAttribute('data-cta-' + L) || cta));
    grid.appendChild(esq); grid.appendChild(dre); cont.appendChild(grid);

    var fix = null;
    function tria(fl, rol) {
      if (!fl && fix) { fl = fix.fl; rol = fix.rol; }
      svg.classList.toggle('ma-tria', !!fl);
      vies.forEach(function (v) { var on = !!fl && fl.indexOf(v.x) >= 0; v.p.classList.toggle('on', on); v.dot.classList.toggle('on', on); });
      Object.keys(nodes).forEach(function (r) { nodes[r].classList.toggle('on', r === rol); });
      pausa = !!fl;
    }
    /* El fil: un lliurament cada pocs segons, primer els que ja van sols. */
    var rank = { sol: 0, punt: 1, persona: 2, muntar: 3 }, cua = vies.slice().sort(function (a, b) { return rank[estat(a.x)] - rank[estat(b.x)]; });
    var i = 0, pausa = false;
    function mostra(v) {
      cua.forEach(function (w) { w.p.classList.remove('on'); });
      v.p.classList.add('on');
      var e = estat(v.x); ara.style.borderLeftColor = COLOR[e];
      ara.textContent = '';
      ara.appendChild(el('small', {}, icona(v.x.de.es) + ' ' + v.x.de[L] + '  →  ' + icona(v.x.a.es) + ' ' + v.x.a[L] + ' · ' + t[e]));
      ara.appendChild(document.createTextNode(v.x.que[L].replace(/^./, function (c) { return c.toUpperCase(); })));
    }
    mostra(cua[0]);
    if (!quiets) cont._ma = setInterval(function () { if (pausa || document.hidden) return; i = (i + 1) % cua.length; mostra(cua[i]); }, 2800);
  }

  /* ── El tauler ────────────────────────────────────────────────────────── */
  function tauler(cont, C) {
    posaEstil();
    var L = ll(), t = T[L], fx = C.fluxos;
    var sols = fx.filter(function (x) { return x.escalo === 'automatizado'; });
    var nDef = fx.filter(function (x) { return x.escalo === 'definido'; }).length;
    var nSense = fx.filter(function (x) { return !x.escalo || x.escalo === 'sin_definir' || x.escalo === 'por_montar'; }).length;
    cont.textContent = '';
    var w = el('div', { class: 'ma-t' }), pas = el('div', { class: 'ma-pas', 'aria-hidden': 'true' });
    var ps = [t.t1, t.t2, t.t3].map(function (x, i) { var s = el('span', {}, (i + 1) + ' · ' + x); pas.appendChild(s); return s; });
    var cols = el('div', { class: 'ma-cols' }), cs = [[t.c1, nSense, COLOR.muntar], [t.c2, nDef, COLOR.punt], [t.c3, sols.length, COLOR.sol]].map(function (c) {
      var d = el('div', { class: 'ma-col' }), h = el('h4'); h.appendChild(el('span', {}, c[0])); var b = el('b', {}, c[1]); h.appendChild(b);
      d.appendChild(h); cols.appendChild(d);
      var pts = el('div', { class: 'ma-pts', 'aria-hidden': 'true' });
      for (var k = 0; k < c[1]; k++) { var p = el('i'); p.style.background = c[2]; pts.appendChild(p); }
      d.appendChild(pts); return d;
    });
    var card = el('div', { class: 'ma-card', 'aria-live': 'polite' });
    w.appendChild(pas); w.appendChild(cols); w.appendChild(card);
    w.appendChild(el('p', { class: 'ma-hon' }, t.honest));
    cont.appendChild(w);
    var i = 0, fase = 0;
    function posa(c) {
      var col = cs[c]; card.style.width = (col.offsetWidth - 16) + 'px';
      card.style.transform = 'translate(' + (col.offsetLeft + 8) + 'px,' + (col.offsetTop + 34) + 'px)';
    }
    function omple(x) {
      card.textContent = ''; card.className = 'ma-card';
      card.appendChild(el('b', {}, x.que[L].replace(/^./, function (c) { return c.toUpperCase(); }).replace(/ y, al .*| i, en .*/, '')));
      card.appendChild(el('small', {}, x.de[L] + ' → ' + x.a[L]));
      var nv = C.nivells[x.qui] || {}; card.appendChild(el('span', { class: 'ma-lv' }, (nv.icona || '⚡') + ' ' + (nv[L] || t.c3)));
    }
    function pas1() {
      var x = sols[i % sols.length];
      if (fase === 0) { omple(x); posa(0); card.style.borderLeftColor = 'var(--muted)'; }
      if (fase === 1) { card.classList.add('def'); posa(1); card.style.borderLeftColor = 'var(--orange)'; }
      if (fase === 2) { card.classList.add('sol'); posa(2); card.style.borderLeftColor = 'var(--green)'; }
      ps.forEach(function (s, k) { s.classList.toggle('on', k <= fase); });
      fase = (fase + 1) % 3; if (!fase) i++;
    }
    if (quiet()) { fase = 2; omple(sols[0]); card.classList.add('def', 'sol'); posa(2); ps.forEach(function (s) { s.classList.add('on'); }); return; }
    fase = 0; pas1();
    cont._ma = setInterval(function () { if (!document.hidden) pas1(); }, 2200);
    g.addEventListener('resize', function () { posa((fase + 2) % 3); });
  }

  function engega() {
    var C = g.CasAutomatitzat; if (!C) return;
    var tots = [].slice.call(document.querySelectorAll('[data-anima]'));
    var pinta = function (n) { clearInterval(n._ma); (n.getAttribute('data-anima') === 'tauler' ? tauler : mapa)(n, C); n._fet = 1; };
    var io = 'IntersectionObserver' in g ? new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && !e.target._fet) pinta(e.target); });
    }, { rootMargin: '200px' }) : null;
    tots.forEach(function (n) { if (io) io.observe(n); else pinta(n); });
    new MutationObserver(function () { tots.forEach(function (n) { if (n._fet) pinta(n); }); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
  g.MapaAnima = { mapa: mapa, tauler: tauler, T: T };
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', engega); else engega(); }
})(typeof window !== 'undefined' ? window : this);
