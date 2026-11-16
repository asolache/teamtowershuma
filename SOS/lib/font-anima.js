/* La font i la colla · totes les vistes en una sola pel·lícula (16/11/2026)
 * ─────────────────────────────────────────────────────────────────────────────
 * L'Àlvar: «TeamTowers, equips de torres; l'aigua, la font al mig del castell
 * que dona la vida; el castell és un arbre […] i la vista de mapa mental també
 * és un arbre. Una animació amb totes les vistes que ja tenim perquè, només
 * veient-la, s'entengui el valor que aportem en fer el mapa de valor.»
 * I tot seguit: «una rengla és una filera de persones del centre cap enfora,
 * una línia de força per àrea […] veig el mapa i entenc els forats, el que em
 * falta i, per tant, el que s'ha d'ocupar. Això genera oportunitats […] qui
 * vulgui aprendre-ho, ho aprèn fent».
 *
 * Les mateixes persones (una rodona cadascuna) passen per totes les vistes sense
 * desaparèixer: la pinya des de dalt, el castell de costat, l'arbre, el mapa
 * mental amb les cinc capes del cervell, el mapa de valor i els forats. Els
 * forats (rodona de traç) també hi són a totes, perquè el que falta es vegi
 * sempre. El vocabulari és el de `tools/build-castells.js` (rengla, cordó,
 * pilar); les capes, les de `cervell/` (koshas, amb els mateixos colors); el
 * cas, `lib/font-dades.js`, que surt d'un mapa de la matriu.
 *
 * Regla de lectura, la mateixa que `mapa-anima.js` («cada lliurament que
 * circula és algú més empenyent»): la rengla d'una àrea té cinc llocs, un per
 * cordó; n'hi ha tants d'ocupats com lliuraments dona l'àrea al mapa. El pilar
 * (qui en respon) és buit quan una troballa diu que l'àrea «no és de ningú».
 *
 *   FontAnima.munta(caixa, dades?)   dades per defecte: window.FontDades
 *   S'engega sol sobre [data-font] quan es veu. Sense CDN, sense dependències.
 */
(function (g) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var W = 800, H = 600, CX = 400, CY = 300, R_PIL = 46, PAS = 29, R_ET = 214, CORDONS = 5, MOB = false;
  /* En una pantalla estreta el dibuix es fa més petit dins del mateix marc i la
     lletra, més grossa: els noms de les àrees han de llegir-se a 360 px. */
  function mides(ample) {
    MOB = ample < 560;
    R_PIL = MOB ? 40 : 46; PAS = MOB ? 24 : 29; R_ET = MOB ? 176 : 214;
  }
  var KC = { anna: '#b45309', prana: '#15803d', mano: '#0e7490', vijnana: '#1d4ed8', ananda: '#7c3aed' };
  var DUR = [5200, 8600, 7000, 6400, 8200, 9600, 8400, 8800, 9000];

  var T = {
    ca: {
      k: 'La font i la colla', a11y: 'Pel·lícula en nou escenes: de la font a la pinya, el castell, l\'arbre, el mapa mental, el mapa de valor i la teva colla',
      pausa: 'Atura', segueix: 'Continua', ant: 'Escena anterior', seg: 'Escena següent',
      kosha: { anna: 'Cos', prana: 'Energia', mano: 'Ment', vijnana: 'Criteri', ananda: 'Propòsit' },
      e: [
        ['La font', 'Al mig de tot, una font. On hi ha aigua bona, neix tot.'],
        ['La pinya', 'Cada rengla és una àrea: una filera de persones del centre cap enfora, una línia de força. Cada cordó, un cercle de gent al voltant de la font.'],
        ['El castell', 'De costat, la mateixa gent aixeca el castell. L\'aigua puja pel mig.'],
        ['L\'arbre', 'El castell és un arbre: arrela a terra, el tronc puja i cada àrea és una branca, amb la seva gent.'],
        ['El mapa mental', 'Des de dalt, l\'arbre és un mapa mental. I és el teu cervell: cinc capes, del propòsit al mig fins al cos a fora.'],
        ['El mapa de valor', 'Quan dibuixem què es donen, el mapa mental es torna mapa de valor.'],
        ['On no arriba', 'El mapa ensenya on no arriba l\'aigua.'],
        ['Els forats', '{0} llocs per ocupar. Cada forat és una oportunitat: qui ho vulgui aprendre, ho aprèn fent.'],
        ['La teva colla', 'Això aporta un mapa de valor: veure la colla sencera i fer que l\'aigua arribi a tothom.']
      ],
      rengla: 'Rengla «{0}»: {1} de {2} llocs ocupats',
      ningu: 'ningú no en respon',
      forat: 'Hi falta algú a baix. Sense aquest lloc, el de dalt no puja.',
      saba: 'L\'aigua és la saba: la mateixa a totes les branques.',
      cordo: '{0}r cordó · {1}', cordoN: '{0}è cordó · {1}',
      vedes: '{0} vedes del codex hi viuen',
      falta: 'Per ocupar: {0} · {1}', pilar: 'qui en respon',
      tang: 'tangible', intang: 'intangible', aturat: 'no circula',
      ple: 'ocupat', buit: 'per ocupar', tu: 'Tu',
      cta: 'Fes la teva colla →', cervell: 'El teu cervell', castell: 'El castell de la casa', apren: 'Aprèn fent',
      cas: 'Cas: la xarxa de l\'aigua solar de la matriu, sense noms ni xifres.'
    },
    es: {
      k: 'La fuente y la colla', a11y: 'Película en nueve escenas: de la fuente a la pinya, el castell, el árbol, el mapa mental, el mapa de valor y tu colla',
      pausa: 'Pausa', segueix: 'Sigue', ant: 'Escena anterior', seg: 'Escena siguiente',
      kosha: { anna: 'Cuerpo', prana: 'Energía', mano: 'Mente', vijnana: 'Criterio', ananda: 'Propósito' },
      e: [
        ['La fuente', 'En el centro de todo, una fuente. Donde hay agua buena, nace todo.'],
        ['La pinya', 'Cada rengla es un área: una hilera de personas del centro hacia fuera, una línea de fuerza. Cada cordón, un círculo de gente alrededor de la fuente.'],
        ['El castell', 'De lado, la misma gente levanta el castell. El agua sube por el centro.'],
        ['El árbol', 'El castell es un árbol: arraiga en la tierra, el tronco sube y cada área es una rama, con su gente.'],
        ['El mapa mental', 'Desde arriba, el árbol es un mapa mental. Y es tu cerebro: cinco capas, del propósito en el centro al cuerpo fuera.'],
        ['El mapa de valor', 'Cuando dibujamos lo que se dan, el mapa mental se vuelve mapa de valor.'],
        ['Dónde no llega', 'El mapa enseña dónde no llega el agua.'],
        ['Los huecos', '{0} sitios por ocupar. Cada hueco es una oportunidad: quien lo quiera aprender, lo aprende haciendo.'],
        ['Tu colla', 'Esto aporta un mapa de valor: ver la colla entera y que el agua llegue a todos.']
      ],
      rengla: 'Rengla «{0}»: {1} de {2} sitios ocupados',
      ningu: 'nadie responde de ella',
      forat: 'Falta alguien abajo. Sin ese sitio, el de arriba no sube.',
      saba: 'El agua es la savia: la misma en todas las ramas.',
      cordo: '{0}.º cordón · {1}', cordoN: '{0}.º cordón · {1}',
      vedes: '{0} vedas del codex viven aquí',
      falta: 'Por ocupar: {0} · {1}', pilar: 'quien responde',
      tang: 'tangible', intang: 'intangible', aturat: 'no circula',
      ple: 'ocupado', buit: 'por ocupar', tu: 'Tú',
      cta: 'Haz tu colla →', cervell: 'Tu cerebro', castell: 'El castell de la casa', apren: 'Aprende haciendo',
      cas: 'Caso: la red del agua solar de la matriz, sin nombres ni cifras.'
    }
  };

  function ll() { var l = (document.documentElement.lang || 'ca').slice(0, 2); return T[l] ? l : 'ca'; }
  function f(s) { var a = arguments; return String(s).replace(/\{(\d)\}/g, function (_, i) { return a[+i + 1]; }); }
  function el(tag, at, txt, ns) {
    var e = ns === false ? document.createElement(tag) : document.createElementNS(NS, tag);
    for (var k in (at || {})) e.setAttribute(k, at[k]);
    if (txt != null) e.textContent = txt;
    return e;
  }
  function h(tag, at, txt) { return el(tag, at, txt, false); }
  var quiet = function () { return g.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var rad = function (d) { return d * Math.PI / 180; };
  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  /* ── El model: àrees, llocs i forats, tot comptat del mapa ─────────────── */
  function model(D) {
    var R = D.rols, n = R.length;
    var dona = R.map(function (r) { return D.fluxos.filter(function (x) { return x.de === r; }).length; });
    var senseAmo = {}, aturats = {};
    D.troballes.forEach(function (t) {
      if (!t.ningu) return;
      t.rols.forEach(function (r) { senseAmo[r] = 1; });
      t.fluxos.forEach(function (i) { aturats[i] = 1; });
    });
    var llocs = [];
    R.forEach(function (r, i) {
      llocs.push({ rol: i, k: 0, ple: !senseAmo[r] });
      for (var k = 1; k <= CORDONS; k++) llocs.push({ rol: i, k: k, ple: k <= dona[i] });
    });
    return { R: R, n: n, dona: dona, llocs: llocs, aturats: aturats, forats: llocs.filter(function (x) { return !x.ple; }) };
  }

  /* ── On és cada lloc a cada vista ──────────────────────────────────────── */
  /* El cordó 1, el del costat de la font, és el propòsit; el de fora, el cos.
     Com al cervell 3D (el cos a fora, el propòsit al centre) i com el castell
     vist de dalt: el pom al mig, la pinya a fora. */
  function parteix(s, max) {
    var li = [], l = '';
    s.split(' ').forEach(function (m) { if ((l + ' ' + m).trim().length > max && l) { li.push(l); l = m; } else l = (l + ' ' + m).trim(); });
    if (l) li.push(l);
    return li;
  }
  function kosK(D, k) { return D.capes[D.capes.length - k]; }
  function angle(i, n) { return -90 + i * 360 / n; }
  function pinya(l, n) {
    var a = rad(angle(l.rol, n)), r = R_PIL + l.k * PAS;
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  }
  /* El castell: un tres de sis. Hi pugen primer els pilars i després el
     primer cordó; la resta fa la pinya de baix, vista de costat. */
  var TORRE = [[374, 470], [400, 470], [426, 470], [374, 432], [400, 432], [426, 432], [374, 394], [400, 394], [426, 394], [387, 356], [413, 356], [400, 322], [400, 292]];
  function castell(M) {
    var ordre = M.llocs.slice().sort(function (a, b) { return a.k - b.k || a.rol - b.rol; }), out = new Map();
    var resta = ordre.slice(TORRE.length);
    ordre.slice(0, TORRE.length).forEach(function (l, i) { out.set(l, TORRE[i]); });
    var files = [10, 11, 12, 99], fila = 0, dins = 0;
    resta.forEach(function (l) {
      if (dins >= files[fila]) { fila++; dins = 0; }
      var cap = Math.min(files[fila], resta.length - resta.indexOf(l) + dins);
      var ample = (cap - 1) * 25 + fila * 14;
      var x = CX - ample / 2 + (cap === 1 ? ample / 2 : dins * ample / (cap - 1));
      if (Math.abs(x - CX) < 50 && fila === 0) x += x < CX ? -40 : 40;
      out.set(l, [x, 494 + fila * 15]);
      dins++;
    });
    return out;
  }
  /* L'arbre: la pinya aixecada sobre un tronc. Cada àrea, una branca. */
  var FORCA = [CX, 342];
  function brancaAng(i, n) { return 180 + (i + .5) * 180 / n; }
  function arbre(l, n) {
    var a = rad(brancaAng(l.rol, n)), r = 34 + l.k * 30;
    return [FORCA[0] + r * Math.cos(a), FORCA[1] + r * Math.sin(a) * .86];
  }

  function estil() {
    if (document.getElementById('fo-estil')) return;
    var s = h('style', { id: 'fo-estil' });
    s.textContent =
      '.fo{--fo-aigua:#0e7490;--fo-l:var(--border,#ddd7c8);--fo-t:var(--text,#15130f);--fo-m:var(--muted,#5e594d);--fo-c:var(--card,#fff);display:flex;flex-direction:column;gap:.4rem}' +
      '.fo-k{margin:0;font-family:var(--mono,monospace);font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;color:var(--fo-m);text-align:center}' +
      '.fo-st{position:relative;display:grid;place-items:center}' +
      '.fo-svg{width:min(100%,calc(64vh * 1.333));width:min(100%,calc(64svh * 1.333));height:auto;aspect-ratio:4/3;display:block;overflow:visible}' +
      '.fo-svg text{font-family:inherit;fill:var(--fo-t)}' +
      '.fo-capa{transition:opacity .9s}' +
      '.fo-ll{transition:fill .6s,stroke .6s,r .4s}' +
      '.fo-ll.ple{stroke:var(--fo-c);stroke-width:1.5}' +
      '.fo-ll.buit{fill:var(--fo-c);fill-opacity:.85;stroke:var(--fo-m);stroke-width:1.6;stroke-dasharray:3 2.6}' +
      '.fo-ll.pil.ple{fill:var(--fo-t)}' +
      '[data-e="8"] .fo-ll.buit,[data-e="7"] .fo-ll.pil.buit{stroke:var(--orange,#9c4408);stroke-width:2.4;animation:fo-bat 1.3s ease-in-out infinite}' +
      '@keyframes fo-bat{50%{stroke-opacity:.35}}' +
      '.fo-ll.tu{fill:var(--green,#0c6640)!important;stroke:var(--fo-c);stroke-dasharray:none;animation:none!important}' +
      '.fo-tria .fo-ll:not(.on),.fo-tria .fo-et:not(.on){opacity:.25}.fo-tria .fo-fx:not(.on){opacity:.08}' +
      '.fo-et{font-size:12.5px;font-weight:600;paint-order:stroke;stroke:var(--bg,#fbfaf7);stroke-width:4px;stroke-linejoin:round;transition:opacity .6s}' +
      '.fo-et.ningu{fill:var(--orange,#9c4408)}' +
      '.fo-kl{font-size:10.5px;letter-spacing:.04em;fill:var(--fo-m)!important}' +
      '.fo-fx{fill:none;stroke-width:1.8;transition:opacity .5s,stroke-width .3s}.fo-tria .fo-fx.on{stroke-width:3.2}.fo-fx.tangible{stroke:var(--blue,#005795)}.fo-fx.intangible{stroke:var(--purple,#a3187f);stroke-dasharray:5 4}' +
      '.fo-fx.aturat{stroke:var(--red,#c0392b);stroke-dasharray:2 5;stroke-width:2.4}.fo-reviu .fo-fx.aturat{stroke:var(--blue,#005795);stroke-dasharray:none}' +
      '.fo-ley{display:flex;flex-wrap:wrap;justify-content:center;gap:.2rem .9rem;margin:0;font-size:.78rem;color:var(--fo-m)}.fo-ley span{display:inline-flex;align-items:center;gap:.3rem}.fo-ley svg{overflow:visible}' +
      '.fo-ley-fx{opacity:.2;transition:opacity .6s}.fo[data-e="6"] .fo-ley-fx,.fo[data-e="7"] .fo-ley-fx,.fo[data-e="8"] .fo-ley-fx,.fo[data-e="9"] .fo-ley-fx{opacity:1}' +
      '.fo-tria .fo-dot:not(.on){opacity:.1}' +
      '.fo-tu{font-weight:800;font-size:16px;fill:var(--green,#0c6640);paint-order:stroke;stroke:var(--bg,#fbfaf7);stroke-width:4px;text-anchor:middle;letter-spacing:.06em;text-transform:uppercase;transition:opacity .6s}' +
      '.fo-mob .fo-et{font-size:23px;stroke-width:6px}.fo-mob .fo-kl{font-size:19px}.fo-mob .fo-tu{font-size:26px}.fo-mob .fo-ll{stroke-width:2.4}' +
      '.fo-dot{transition:opacity .4s}.fo-dot.tangible{fill:var(--blue,#005795)}.fo-dot.intangible{fill:var(--purple,#a3187f)}' +
      '.fo-ona{fill:none;stroke:var(--fo-aigua);transform-box:fill-box;transform-origin:center;animation:fo-ona 3.2s ease-out infinite;opacity:0}' +
      '.fo-ona:nth-child(2){animation-delay:1.05s}.fo-ona:nth-child(3){animation-delay:2.1s}' +
      '@keyframes fo-ona{0%{transform:scale(.6);opacity:.7}100%{transform:scale(3.6);opacity:0}}' +
      '.fo-gota{fill:var(--fo-aigua)}' +
      '.fo-sap{fill:none;stroke:var(--fo-aigua);stroke-linecap:round;stroke-dasharray:6 10;animation:fo-sap 1.2s linear infinite}' +
      '@keyframes fo-sap{to{stroke-dashoffset:-32}}' +
      '.fo-cap{min-height:4.4em;margin:.2rem auto 0;max-width:42rem;text-align:center;font-weight:700;font-size:clamp(1.05rem,2.4vw,1.45rem);line-height:1.28}' +
      '.fo-sub{display:block;margin-top:.35rem;font-weight:400;font-size:.95rem;color:var(--light,#4a463e);line-height:1.4}' +
      '.fo-fi{display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem;opacity:0;pointer-events:none;transition:opacity .6s}.fo[data-e="9"] .fo-fi{opacity:1;pointer-events:auto}' +
      '.fo-bar{display:flex;gap:.4rem;align-items:stretch}' +
      '.fo-bar>button{all:unset;flex:none;width:2.6rem;min-height:44px;border:1px solid var(--fo-l);border-radius:8px;text-align:center;cursor:pointer;font-size:.85rem;color:var(--fo-t)}' +
      '.fo-ch{flex:1;display:flex;gap:.3rem;list-style:none;margin:0;padding:0}.fo-ch li{flex:1;min-width:0;transition:flex .4s}' +
      '.fo-ch button{all:unset;box-sizing:border-box;position:relative;display:block;width:100%;min-height:44px;padding:.45rem .35rem .6rem;border-radius:8px;cursor:pointer;font-size:.74rem;line-height:1.2;color:var(--fo-m);background:var(--panel,#f4f1ea);overflow:hidden;text-overflow:ellipsis}' +
      '.fo-ch button.on{color:var(--fo-t);font-weight:700}.fo-ch i{position:absolute;left:0;bottom:0;height:3px;width:0;background:var(--fo-aigua)}' +
      '.fo-bar button:focus-visible{outline:2px solid var(--indigo,#4f46e5);outline-offset:2px}' +
      '.fo-cas{margin:0;text-align:center;font-size:.75rem;color:var(--fo-m)}' +
      '@media (max-width:760px){.fo-ch li.on{flex:3.5}.fo-ch li:not(.on) span{display:none}.fo-ch button{text-align:center;white-space:nowrap;padding:.45rem .1rem .6rem}.fo-cap{min-height:5.6em}}' +
      '@media (max-width:560px){.fo-bar>button.fo-sal{display:none}.fo-ch{gap:.2rem}.fo-ch li.on{flex:2.6}.fo-ch li.on button{text-align:left;padding-left:.4rem}.fo-svg{width:100%}}';
    document.head.appendChild(s);
  }

  function munta(cont, D) {
    D = D || g.FontDades;
    if (!D) return;
    estil();
    if (cont._fo) cont._fo();
    cont.textContent = '';
    var L = ll(), t = T[L], M = model(D), n = M.n, quiets = quiet();
    mides(cont.clientWidth || W);
    var esc = h('div', { class: 'fo' + (MOB ? ' fo-mob' : ''), 'data-e': '1' });
    var svg = el('svg', { class: 'fo-svg', viewBox: MOB ? '30 40 740 540' : '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': t.a11y });
    var capa = function (escenes) { var c = el('g', { class: 'fo-capa' }); c._e = escenes; svg.appendChild(c); return c; };

    /* Les cinc capes del cervell, com a anells al voltant de la font. */
    var gK = capa([5]);
    D.capes.forEach(function (_, i) {
      var r = R_PIL + (i + 1) * PAS, c = kosK(D, i + 1);
      gK.appendChild(el('circle', { cx: CX, cy: CY, r: r, fill: 'none', stroke: KC[c.id], 'stroke-width': PAS - 3, 'stroke-opacity': .13 }));
    });
    /* Els cordons: cercles de gent al voltant del centre. */
    var gC = capa([2, 7, 8, 9]);
    for (var k = 1; k <= CORDONS; k++) gC.appendChild(el('circle', { cx: CX, cy: CY, r: R_PIL + k * PAS, fill: 'none', stroke: 'var(--fo-l)', 'stroke-width': 1 }));
    /* Les etiquetes dels cordons i de les capes, a la mateixa diagonal. */
    var gKL = capa([2, 5]), aK = rad(angle(0, n) + 180 / n);
    D.capes.forEach(function (c, i) {
      var r = R_PIL + (i + 1) * PAS, x = CX + r * Math.cos(aK) + 6, y = CY + r * Math.sin(aK);
      var tx = el('text', { class: 'fo-kl', x: x.toFixed(1), y: y.toFixed(1), 'dominant-baseline': 'middle' });
      tx._k = i; gKL.appendChild(tx);
    });
    function etiquetesCapes(e) {
      [].forEach.call(gKL.childNodes, function (tx) {
        var c = kosK(D, tx._k + 1), nom = t.kosha[c.id];
        tx.textContent = e === 5 ? nom : (tx._k + 1) + '';
        tx.style.fill = e === 5 ? KC[c.id] : '';
      });
    }
    /* Les rengles: una línia de força per àrea. */
    var gR = capa([2, 6, 7, 8, 9]);
    M.R.forEach(function (_, i) {
      var a = rad(angle(i, n)), r0 = R_PIL, r1 = R_PIL + CORDONS * PAS + 8;
      gR.appendChild(el('line', { x1: CX + r0 * Math.cos(a), y1: CY + r0 * Math.sin(a), x2: CX + r1 * Math.cos(a), y2: CY + r1 * Math.sin(a), stroke: 'var(--indigo,#4f46e5)', 'stroke-width': 2.2, 'stroke-opacity': .35, 'stroke-linecap': 'round' }));
    });
    /* El mapa mental: branques corbes que surten de la font. */
    var gM = capa([5]);
    M.R.forEach(function (_, i) {
      var a = rad(angle(i, n)), b = rad(angle(i, n) + 14), r1 = R_PIL + CORDONS * PAS + 6;
      var d = 'M' + CX + ' ' + CY + ' Q' + (CX + 120 * Math.cos(b)).toFixed(1) + ' ' + (CY + 120 * Math.sin(b)).toFixed(1) + ' ' + (CX + r1 * Math.cos(a)).toFixed(1) + ' ' + (CY + r1 * Math.sin(a)).toFixed(1);
      gM.appendChild(el('path', { d: d, fill: 'none', stroke: 'var(--green,#0c6640)', 'stroke-width': 5, 'stroke-opacity': .45, 'stroke-linecap': 'round' }));
    });
    /* L'arbre: arrels, tronc i branques, i la saba que hi puja. */
    var gA = capa([4]);
    var tronc = 'M' + (CX - 20) + ' 540 C' + (CX - 12) + ' 470 ' + (CX - 10) + ' 400 ' + (CX - 4) + ' ' + FORCA[1] + ' L' + (CX + 4) + ' ' + FORCA[1] + ' C' + (CX + 10) + ' 400 ' + (CX + 12) + ' 470 ' + (CX + 20) + ' 540 Z';
    gA.appendChild(el('path', { d: tronc, fill: 'var(--gold,#8a6000)', 'fill-opacity': .5 }));
    [-150, -90, -40, 40, 90, 150].forEach(function (dx, i) {
      gA.appendChild(el('path', { d: 'M' + CX + ' 540 Q' + (CX + dx * .4) + ' ' + (560 + i % 2 * 10) + ' ' + (CX + dx) + ' ' + (582 - Math.abs(dx) / 20), fill: 'none', stroke: 'var(--gold,#8a6000)', 'stroke-opacity': .45, 'stroke-width': 4, 'stroke-linecap': 'round' }));
    });
    gA.appendChild(el('line', { x1: 40, y1: 540, x2: 760, y2: 540, stroke: 'var(--fo-l)', 'stroke-width': 1.5 }));
    var sabes = [];
    M.R.forEach(function (_, i) {
      var a = rad(brancaAng(i, n)), r1 = 34 + CORDONS * 30 + 6;
      var x = FORCA[0] + r1 * Math.cos(a), y = FORCA[1] + r1 * Math.sin(a) * .86;
      gA.appendChild(el('path', { d: 'M' + FORCA[0] + ' ' + FORCA[1] + ' Q' + (FORCA[0] + 40 * Math.cos(a)).toFixed(1) + ' ' + (FORCA[1] - 30) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1), fill: 'none', stroke: 'var(--gold,#8a6000)', 'stroke-opacity': .4, 'stroke-width': 5, 'stroke-linecap': 'round' }));
      sabes.push('M' + FORCA[0] + ' ' + FORCA[1] + ' Q' + (FORCA[0] + 40 * Math.cos(a)).toFixed(1) + ' ' + (FORCA[1] - 30) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1));
    });
    var gS = capa([4]);
    gS.appendChild(el('path', { class: 'fo-sap', d: 'M' + CX + ' 560 L' + CX + ' ' + FORCA[1], 'stroke-width': 4 }));
    sabes.forEach(function (d) { gS.appendChild(el('path', { class: 'fo-sap', d: d, 'stroke-width': 2.4 })); });
    /* El castell: el terra, i la columna d'aigua que puja pel mig. */
    var gT = capa([3]);
    gT.appendChild(el('line', { x1: 140, y1: 548, x2: 660, y2: 548, stroke: 'var(--fo-l)', 'stroke-width': 1.5 }));
    gT.appendChild(el('path', { class: 'fo-sap', d: 'M' + CX + ' 548 L' + CX + ' 276', 'stroke-width': 5 }));

    /* El mapa de valor: els lliuraments entre les puntes de les rengles. */
    var gF = capa([6, 7, 8, 9]), vies = [];
    var punta = function (i) { var a = rad(angle(i, n)), r = R_PIL + CORDONS * PAS + 9; return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; };
    D.fluxos.forEach(function (x, j) {
      var i = M.R.indexOf(x.de), o = M.R.indexOf(x.a), p = punta(i), q = punta(o);
      var mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy) || 1;
      var cx = CX + (mx - CX) * .35 + (-dy / len) * 22, cy = CY + (my - CY) * .35 + (dx / len) * 22;
      var at = M.aturats[j] ? ' aturat' : '';
      var p0 = el('path', { class: 'fo-fx ' + x.mena + at, d: 'M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + q[0].toFixed(1) + ' ' + q[1].toFixed(1) });
      p0.appendChild(el('title', {}, x.de + ' → ' + x.a + ': ' + x.que));
      var dot = el('circle', { class: 'fo-dot ' + x.mena, r: 4.2, cx: p[0], cy: p[1] });
      gF.appendChild(p0); gF.appendChild(dot);
      vies.push({ x: x, j: j, p: p0, dot: dot, fase: (j * .37) % 1, aturat: !!M.aturats[j], de: i, a: o });
    });

    /* La font: la gota i les ones. Es mou: al mig, o a terra sota el castell i l'arbre. */
    var font = el('g', { class: 'fo-font' });
    var gota = el('path', { class: 'fo-gota', d: 'M0 -27 C9 -14 18 -4 18 7 A18 18 0 0 1 -18 7 C-18 -4 -9 -14 0 -27Z' });
    var ones = el('g');
    for (var o = 0; o < 3; o++) ones.appendChild(el('circle', { class: 'fo-ona', r: 18, cx: 0, cy: 0, 'stroke-width': 2 }));
    font.appendChild(ones); font.appendChild(gota);
    font.appendChild(el('path', { d: 'M-9 6 a9 9 0 0 0 6 8', fill: 'none', stroke: '#fff', 'stroke-opacity': .75, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
    svg.appendChild(font);

    /* Les persones: una rodona per lloc, que passa per totes les vistes. */
    var gP = el('g'); svg.appendChild(gP);
    var posCastell = castell(M);
    M.llocs.forEach(function (l, i) {
      var c = M.R[l.rol], kos = l.k ? kosK(D, l.k).id : null;
      var e = el('circle', { class: 'fo-ll ' + (l.ple ? 'ple' : 'buit') + (l.k ? '' : ' pil'), r: l.k ? 6.6 : 9.5, cx: CX, cy: CY });
      if (l.ple && kos) e.setAttribute('fill', KC[kos]);
      e.appendChild(el('title', {}, l.k ? f(l.ple ? '{0} · {1}' : t.falta, c, t.kosha[kos]) : (l.ple ? c + ' · ' + t.pilar : f(t.falta, c, t.pilar))));
      gP.appendChild(e);
      l.e = e; l.x = CX; l.y = CY; l.o = 0; l.i = i;
      l.at = [
        [CX, CY, 0], pinya(l, n).concat(1), posCastell.get(l).concat(1), arbre(l, n).concat(1),
        pinya(l, n).concat(1), pinya(l, n).concat(.55), pinya(l, n).concat(.55), pinya(l, n).concat(1), pinya(l, n).concat(1)
      ];
    });
    /* El nom de cada àrea, a la punta de la seva rengla o de la seva branca. */
    var gE = el('g'); svg.appendChild(gE);
    var noms = M.R.map(function (r, i) {
      var tx = el('text', { class: 'fo-et' + (M.llocs[i * (CORDONS + 1)].ple ? '' : ' ningu'), x: CX, y: CY, 'dominant-baseline': 'middle' });
      parteix(r, MOB ? 13 : 99).forEach(function (li, k, tot) {
        tx.appendChild(el('tspan', { x: CX, dy: k ? '1.05em' : (-(tot.length - 1) * .52) + 'em' }, li));
      });
      tx.setAttribute('tabindex', '0'); tx.setAttribute('role', 'button');
      gE.appendChild(tx);
      /* A l'arbre, les branques del mig són a tocar: una sí i l'altra no, l'etiqueta puja. */
      var a = rad(angle(i, n)), b = rad(brancaAng(i, n)), rt = 34 + CORDONS * 30 + 16 + (i % 2 === (i < n / 2 ? 1 : 0) && Math.abs(Math.cos(b)) < .6 ? (MOB ? 44 : 26) : 0);
      var pin = [CX + R_ET * Math.cos(a), CY + R_ET * Math.sin(a)], arb = [FORCA[0] + rt * Math.cos(b), FORCA[1] + rt * Math.sin(b) * .86 - 6];
      var anc = function (c, l) { return c > l ? 'start' : c < -l ? 'end' : 'middle'; };
      return { e: tx, i: i, x: CX, y: CY, o: 0, ancP: anc(Math.cos(a), .3), ancA: anc(Math.cos(b), .02),
        at: [[CX, CY, 0], pin.concat(1), [CX, 560, 0], arb.concat(1), pin.concat(1), pin.concat(1), pin.concat(1), pin.concat(1), pin.concat(1)] };
    });
    var tu = el('text', { class: 'fo-tu', opacity: 0 }, t.tu);
    svg.appendChild(tu);
    var capes = [].slice.call(svg.querySelectorAll('.fo-capa'));

    /* ── El text, els botons i la barra ─────────────────────────────────── */
    var st = h('div', { class: 'fo-st' }); st.appendChild(svg);
    /* La llegenda: el que és ple i el que és per ocupar, sempre a la vista; les
       menes de lliurament, des del mapa de valor. */
    var ley = h('p', { class: 'fo-ley' });
    var mostra = function (cls, dib, txt) {
      var sp = h('span', { class: cls }), ic = el('svg', { viewBox: '0 0 26 14', width: 26, height: 14, 'aria-hidden': 'true' });
      ic.appendChild(dib); sp.appendChild(ic); sp.appendChild(document.createTextNode(txt)); ley.appendChild(sp);
    };
    mostra('', el('circle', { cx: 13, cy: 7, r: 5.5, fill: KC.mano }), t.ple);
    mostra('', el('circle', { class: 'fo-ll buit', cx: 13, cy: 7, r: 5.5 }), t.buit);
    mostra('fo-ley-fx', el('line', { x1: 1, y1: 7, x2: 25, y2: 7, class: 'fo-fx tangible' }), t.tang);
    mostra('fo-ley-fx', el('line', { x1: 1, y1: 7, x2: 25, y2: 7, class: 'fo-fx intangible' }), t.intang);
    mostra('fo-ley-fx', el('line', { x1: 1, y1: 7, x2: 25, y2: 7, class: 'fo-fx aturat' }), t.aturat);
    var cap = h('p', { class: 'fo-cap', 'aria-live': 'polite' }), sub = h('small', { class: 'fo-sub' });
    var fi = h('p', { class: 'fo-fi' });
    [['btn-primary', cont.getAttribute('data-cta') || '/cliente/', t.cta], ['btn-ghost', '/SOS/cervell.html', t.cervell],
      ['btn-ghost', '/#dues-vistes', t.castell], ['btn-ghost', '/SOS/formacio.html', t.apren]].forEach(function (b) {
      fi.appendChild(h('a', { class: b[0], href: b[1] }, b[2]));
    });
    var bar = h('div', { class: 'fo-bar' });
    var bAnt = h('button', { type: 'button', class: 'fo-sal', 'aria-label': t.ant }, '‹');
    var pausa = h('button', { type: 'button', 'aria-label': t.pausa }, '❚❚');
    var ch = h('ol', { class: 'fo-ch' });
    var bts = t.e.map(function (e, i) {
      var li = h('li'), b = h('button', { type: 'button', 'aria-label': (i + 1) + ' · ' + e[0] });
      b.appendChild(h('b', {}, String(i + 1))); b.appendChild(h('span', {}, ' · ' + e[0])); b.appendChild(h('i', { 'aria-hidden': 'true' }));
      b.addEventListener('click', function () { va(i); });
      li.appendChild(b); ch.appendChild(li); b._li = li; return b;
    });
    var bSeg = h('button', { type: 'button', class: 'fo-sal', 'aria-label': t.seg }, '›');
    bar.appendChild(bAnt); bar.appendChild(pausa); bar.appendChild(ch); bar.appendChild(bSeg);
    esc.appendChild(h('p', { class: 'fo-k' }, t.k));
    esc.appendChild(st); esc.appendChild(ley); esc.appendChild(cap); esc.appendChild(fi); esc.appendChild(bar);
    esc.appendChild(h('p', { class: 'fo-cas' }, t.cas));
    cont.appendChild(esc);

    /* ── El moviment ─────────────────────────────────────────────────────── */
    var ara = 0, temps = 0, sub0 = -1, parat = quiets, vist = true, tw0 = 0, viu = true;
    var dels = M.llocs.concat(noms);
    var fontAt = [[CX, CY, 1.6], [CX, CY, 1], [CX, 556, .7], [CX, 556, .7], [CX, CY, 1], [CX, CY, .9], [CX, CY, .9], [CX, CY, .9], [CX, CY, 1.2]];
    var fo = { x: CX, y: CY - 220, s: 1.6, at: fontAt };
    function frase(txt, peu) { cap.textContent = txt; if (peu) { sub.textContent = peu; cap.appendChild(sub); } }
    function tria(rol) {
      svg.classList.toggle('fo-tria', rol != null);
      M.llocs.forEach(function (l) { l.e.classList.toggle('on', l.rol === rol); });
      noms.forEach(function (nm) { nm.e.classList.toggle('on', nm.i === rol); });
      vies.forEach(function (v) { v.p.classList.toggle('on', v.de === rol || v.a === rol); v.dot.classList.toggle('on', v.de === rol || v.a === rol); });
    }
    function va(i) {
      ara = i; temps = 0; sub0 = -1; tw0 = performance.now();
      esc.setAttribute('data-e', i + 1);
      bts.forEach(function (b, k) { b.classList.toggle('on', k === i); b._li.classList.toggle('on', k === i); b.setAttribute('aria-current', k === i ? 'step' : 'false'); b.lastChild.style.width = k < i ? '100%' : '0'; });
      capes.forEach(function (c) { c.style.opacity = c._e.indexOf(i + 1) >= 0 ? 1 : 0; });
      etiquetesCapes(i + 1);
      dels.forEach(function (d) { d.de0 = [d.x, d.y, d.o]; });
      fo.de0 = [fo.x, fo.y, fo.s];
      noms.forEach(function (nm) { nm.e.setAttribute('text-anchor', i === 3 ? nm.ancA : nm.ancP); });
      tria(null);
      svg.classList.toggle('fo-reviu', i === 8);
      var forat = M.forats.filter(function (l) { return !l.k; })[0] || M.forats[0];
      M.llocs.forEach(function (l) { l.e.classList.toggle('tu', i === 8 && l === forat); });
      tu.setAttribute('opacity', 0);
      var txt = t.e[i][1];
      if (i === 7) txt = f(txt, M.forats.length);
      frase(txt);
      if (i === 2) {
        var buitDalt = M.llocs.some(function (l) { return !l.ple && TORRE.some(function (p) { var q = posCastell.get(l); return q && q[0] === p[0] && q[1] === p[1]; }); });
        if (buitDalt) frase(txt, t.forat);
      }
      if (i === 3) frase(txt, t.saba);
      if (i === 8 && forat) {
        var p = pinya(forat, n); tu.setAttribute('x', p[0]); tu.setAttribute('y', p[1] - 16);
        frase(txt, M.R[forat.rol] + ' · ' + (forat.k ? t.kosha[kosK(D, forat.k).id] : t.pilar));
      }
      if (quiets) pinta(1);
    }
    function pas(ms) {
      var k;
      if (ara === 1) {
        k = Math.floor(Math.max(0, ms - 1400) / ((DUR[1] - 1400) / n));
        if (k !== sub0 && ms > 1400 && k < n) {
          sub0 = k; tria(k);
          var ocup = M.llocs.filter(function (l) { return l.rol === k && l.ple; }).length;
          var pil = M.llocs[k * (CORDONS + 1)];
          frase(t.e[1][1], f(t.rengla, M.R[k], ocup, CORDONS + 1) + (pil.ple ? '' : ' · ' + t.ningu));
        }
      }
      if (ara === 4) {
        k = Math.min(4, Math.floor(ms / (DUR[4] / 5)));
        if (k !== sub0) { sub0 = k; var c = kosK(D, k + 1); frase(t.e[4][1], f(k ? t.cordoN : t.cordo, k + 1, t.kosha[c.id]) + ' · ' + f(t.vedes, c.vedes)); }
      }
      if (ara === 5) {
        k = Math.floor(Math.max(0, ms - 1600) / 1300);
        var mostra = vies.filter(function (v) { return !v.aturat; }), v = mostra[k % mostra.length];
        if (k !== sub0 && ms > 1600) {
          sub0 = k; svg.classList.add('fo-tria');
          vies.forEach(function (w) { w.p.classList.toggle('on', w === v); w.dot.classList.toggle('on', w === v); });
          M.llocs.forEach(function (l) { l.e.classList.toggle('on', l.rol === v.de || l.rol === v.a); });
          noms.forEach(function (nm) { nm.e.classList.toggle('on', nm.i === v.de || nm.i === v.a); });
          frase(t.e[5][1], v.x.de + ' → ' + v.x.a + ': ' + v.x.que + (v.x.mena === 'intangible' ? ' ✦' : ''));
        }
      }
      if (ara === 6) {
        var tr = D.troballes;
        k = Math.min(tr.length - 1, Math.floor(ms / (DUR[6] / tr.length)));
        if (k !== sub0) {
          sub0 = k; var x = tr[k];
          var rols = x.rols.map(function (r) { return M.R.indexOf(r); });
          var fl = x.fluxos;
          var algun = rols.length || fl.length;
          svg.classList.toggle('fo-tria', !!algun);
          M.llocs.forEach(function (l) { l.e.classList.toggle('on', rols.indexOf(l.rol) >= 0); });
          noms.forEach(function (nm) { nm.e.classList.toggle('on', rols.indexOf(nm.i) >= 0 || fl.some(function (j) { return vies[j].de === nm.i || vies[j].a === nm.i; })); });
          vies.forEach(function (w) { var on = fl.indexOf(w.j) >= 0 || rols.indexOf(w.de) >= 0 && rols.indexOf(w.a) >= 0; w.p.classList.toggle('on', on); w.dot.classList.toggle('on', on); });
          frase(t.e[6][1], (k + 1) + ' · ' + x.t);
        }
      }
      if (ara === 7) {
        var fs = M.forats;
        k = Math.floor(Math.max(0, ms - 1800) / 900) % fs.length;
        if (k !== sub0 && ms > 1800) {
          sub0 = k; var l = fs[k];
          frase(f(t.e[7][1], fs.length), f(t.falta, M.R[l.rol], l.k ? t.kosha[kosK(D, l.k).id] : t.pilar));
        }
      }
      if (ara === 8 && ms > 1500 && tu.getAttribute('opacity') === '0') tu.setAttribute('opacity', 1);
    }
    function pinta(fet) {
      var k = ara;
      dels.forEach(function (d, j) {
        var dl = Math.min(.45, (j % 48) * .009);
        var u = fet == null ? Math.max(0, Math.min(1, (fet0() - dl) / (1 - .45))) : 1;
        var e2 = ease(u), a = d.de0 || d.at[k], b = d.at[k];
        d.x = a[0] + (b[0] - a[0]) * e2; d.y = a[1] + (b[1] - a[1]) * e2; d.o = a[2] + (b[2] - a[2]) * e2;
        if (d.e.tagName === 'circle') { d.e.setAttribute('cx', d.x.toFixed(1)); d.e.setAttribute('cy', d.y.toFixed(1)); }
        else {
          d.e.setAttribute('x', d.x.toFixed(1)); d.e.setAttribute('y', d.y.toFixed(1));
          for (var c = d.e.firstChild; c; c = c.nextSibling) if (c.setAttribute) c.setAttribute('x', d.x.toFixed(1));
        }
        d.e.setAttribute('opacity', d.o.toFixed(2));
      });
      var u2 = fet == null ? ease(Math.min(1, fet0())) : 1, a2 = fo.de0 || fo.at[k], b2 = fo.at[k];
      fo.x = a2[0] + (b2[0] - a2[0]) * u2; fo.y = a2[1] + (b2[1] - a2[1]) * u2; fo.s = a2[2] + (b2[2] - a2[2]) * u2;
      font.setAttribute('transform', 'translate(' + fo.x.toFixed(1) + ' ' + fo.y.toFixed(1) + ') scale(' + fo.s.toFixed(2) + ')');
    }
    function fet0() { return (performance.now() - tw0) / 1700; }
    /* Els lliuraments circulen: de pressa el tangible, a poc a poc l'intangible. */
    function circula(now) {
      vies.forEach(function (v) {
        var mou = !v.aturat || ara === 8;
        if (!v.len) { try { v.len = v.p.getTotalLength(); } catch (e) { v.len = 0; } }
        if (!v.len || !mou || ara < 5) { v.dot.style.opacity = 0; return; }
        var vel = v.x.mena === 'tangible' ? 1 / 3200 : 1 / 5200;
        var q = v.p.getPointAtLength(((now * vel + v.fase) % 1) * v.len);
        v.dot.setAttribute('cx', q.x.toFixed(1)); v.dot.setAttribute('cy', q.y.toFixed(1)); v.dot.style.opacity = '';
      });
    }
    var last = performance.now();
    function bucle(now) {
      if (!viu) return;
      var dt = Math.min(200, now - last); last = now;
      if (!parat && vist && !document.hidden) {
        temps += dt; pas(temps);
        bts[ara].lastChild.style.width = Math.min(100, temps / DUR[ara] * 100) + '%';
        if (temps >= DUR[ara]) va((ara + 1) % DUR.length);
      }
      if (fet0() < 1.5) pinta();
      if (!quiets) circula(now);
      requestAnimationFrame(bucle);
    }
    function commuta() {
      parat = !parat; esc.classList.toggle('fo-parat', parat);
      pausa.textContent = parat ? '▶' : '❚❚'; pausa.setAttribute('aria-label', parat ? t.segueix : t.pausa);
    }
    pausa.addEventListener('click', commuta);
    bAnt.addEventListener('click', function () { va((ara + DUR.length - 1) % DUR.length); });
    bSeg.addEventListener('click', function () { va((ara + 1) % DUR.length); });
    esc.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { va((ara + 1) % DUR.length); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { va((ara + DUR.length - 1) % DUR.length); e.preventDefault(); }
    });
    /* Tocar una àrea n'encén la rengla i els lliuraments, a qualsevol escena. */
    noms.forEach(function (nm) {
      var on = function () { tria(nm.i); }, off = function () { tria(null); };
      nm.e.addEventListener('mouseenter', on); nm.e.addEventListener('focus', on);
      nm.e.addEventListener('mouseleave', off); nm.e.addEventListener('blur', off);
    });
    var io = 'IntersectionObserver' in g ? new IntersectionObserver(function (es) { vist = es[0].isIntersecting; }) : null;
    if (io) io.observe(cont);
    cont._fo = function () { viu = false; if (io) io.disconnect(); };
    if (quiets) { pausa.textContent = '▶'; pausa.setAttribute('aria-label', t.segueix); esc.classList.add('fo-parat'); }
    va(quiets ? 1 : 0);
    if (quiets) { pinta(1); circula(0); }
    requestAnimationFrame(bucle);
    return { va: va, model: M };
  }

  function engega() {
    var tots = [].slice.call(document.querySelectorAll('[data-font]'));
    if (!tots.length || !g.FontDades) return;
    var pinta = function (n) { try { munta(n); } catch (e) { n.textContent = ''; } n._fet = 1; };
    var io = 'IntersectionObserver' in g ? new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && !e.target._fet) pinta(e.target); });
    }, { rootMargin: '200px' }) : null;
    tots.forEach(function (n) { if (io) io.observe(n); else pinta(n); });
    new MutationObserver(function () { tots.forEach(function (n) { if (n._fet) pinta(n); }); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
  g.FontAnima = { munta: munta, model: model, T: T };
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', engega); else engega(); }
})(typeof window !== 'undefined' ? window : this);
