/* El teu flux de valor en un minut · el diagnòstic que fa la màgia
   ─────────────────────────────────────────────────────────────────────────
   17/11/2026. Àlvaro: «un rethinking profund del diagnòstic: fer la màgia,
   som a la fase del valor, saber qui ets i quin és el teu flux de valor. Fer
   un diagnòstic amb el mínim que em diguis, i que em demanis el que vols que
   et doni o t'ajudi a aconseguir després de visualitzar-ho amb els meus
   sistemes de pensament visual. Per a un mercat massiu.»

   Quatre pantalles, una pregunta per pantalla i cap formulari:
     1 · A què et dediques?   Un toc (o una frase). Sense IA: models-mapa.js
                              tria el model i en treu el mapa de partida.
     2 · El teu mapa          La mateixa pel·lícula de la portada (mapa-anima.js),
                              ara amb el SEU mapa: tu, el que cobres, el que et
                              sosté sense factura i on se t'escapa el valor.
     3 · Què vols aconseguir? Un toc.
     4 · El teu primer pas    Quatre xifres del seu mapa i una frase que lliga
                              el que vol amb el que el mapa diu. Segueix gratis
                              a /cliente/ amb el mapa ja posat, o demana ajuda.

   Res no surt del navegador fins que ell ho demana. Cap preu.
   Ús: <div data-flux-minut></div> + aquest script. Llengua: <html lang>. */
(function (g) {
'use strict';
var D = document, LIB = '/SOS/lib/';
var OFICIS = [
  ['ofici_restaurant', '🍽️', 'Restaurant o bar', 'Restaurante o bar', 'Restaurant or bar'],
  ['ofici_botiga', '🏪', 'Botiga', 'Tienda', 'Shop'],
  ['formacio', '📚', 'Classes o formació', 'Clases o formación', 'Classes or training'],
  ['ofici_salut_autonoma', '🩺', 'Salut i teràpies', 'Salud y terapias', 'Health and therapy'],
  ['ofici_serveis_professionals', '💼', 'Consultoria', 'Consultoría', 'Consulting'],
  ['ofici_estudi_creatiu', '🎨', 'Disseny i creativitat', 'Diseño y creatividad', 'Design and creative'],
  ['ofici_esdeveniments', '🎪', 'Esdeveniments', 'Eventos', 'Events'],
  ['ofici_allotjament_rural', '🏡', 'Allotjament', 'Alojamiento', 'Lodging'],
  ['ofici_experiencies_turistiques', '🧭', 'Experiències i turisme', 'Experiencias y turismo', 'Experiences and tourism'],
  ['producte_artesa', '🧶', 'Producte propi', 'Producto propio', 'Own product'],
  ['ofici_taller', '🔧', 'Taller o ofici', 'Taller u oficio', 'Trade or workshop'],
  ['servei_proximitat', '🛎', 'Servei a domicili', 'Servicio a domicilio', 'Home service'],
  ['producte_digital', '📱', 'App o producte digital', 'App o producto digital', 'App or digital product'],
  ['cura_social', '💗', 'Cures', 'Cuidados', 'Care']
];
var FITES = ['clients', 'temps', 'cobrar', 'equip', 'web', 'pes'];
var T = {
  ca: { pas: 'Pas {0} de 4', enrere: '← Enrere',
    q1: 'A què et dediques?', q1d: 'Un toc. Et dibuixem el teu negoci.', altre: 'Una altra cosa? Escriu-la', veure: 'Veure el meu mapa →',
    noTrobo: 'No ho reconec prou: comencem pel model general i l\'afines després.', complet: 'Una organització gran o un territori? El diagnòstic complet ↓',
    k2: 'El teu negoci, vist des de dalt', cas: 'Punt de partida: {0}. L\'afines després.', segueix: 'Segueix →',
    q3: 'Què vols aconseguir?', q3d: 'Tria el que més t\'importa ara.',
    f: { clients: ['🎯', 'Més clients'], temps: ['⏳', 'Guanyar temps'], cobrar: ['💶', 'Cobrar el que val'], equip: ['🤝', 'Un equip alineat'], web: ['🌐', 'Una web que treballi per mi'], pes: ['🏗️', 'Que no tot depengui de mi'] },
    q4: 'El teu primer pas', x: ['persones al teu voltant', 'coses que cobres o pagues', 'que et sostenen sense factura', 'podrien anar soles'],
    p: { clients: 'La teva relació clau és «{clau}». Primer: que la teva web expliqui el que rep de tu, amb les seves paraules, i que demanar-t\'ho sigui un clic.',
      temps: '{auto} lliuraments podrien anar sols, com «{exA}». Primer: definir-ne un i que un programa el prepari. Tu només valides.',
      cobrar: 'Dones {int} coses que ningú no et paga, com «{exI}». Primer: posar-les a la vista i decidir quines formen part del que vens.',
      equip: 'Posa aquest mapa davant del teu equip: que cadascú s\'hi trobi i digui què dona i què rep. En una hora, tots veieu el mateix.',
      web: 'La teva web surt d\'aquest mapa: una part per a cada persona que t\'importa, amb el que ve a buscar. Comença per «{clau}».',
      pes: 'El {pct} % del que circula passa per tu: si tu pares, tot para. Primer: passar una part a «{clau}».',
      pesOk: 'El pes està repartit: bona pinya. Primer: cuidar el que et sosté sense factura, com «{exI}».' },
    cta: 'Segueix amb el teu mapa, gratis →', ajuda: 'Vull que m\'ajudeu', torna: 'Torna a començar',
    lema: 'Ningú no arriba a dalt sol.', tema: 'Diagnòstic d\'un minut · {0} · vull: {1}' },
  es: { pas: 'Paso {0} de 4', enrere: '← Atrás',
    q1: '¿A qué te dedicas?', q1d: 'Un toque. Te dibujamos tu negocio.', altre: '¿Otra cosa? Escríbela', veure: 'Ver mi mapa →',
    noTrobo: 'No lo reconozco bien: empezamos por el modelo general y lo afinas después.', complet: '¿Una organización grande o un territorio? El diagnóstico completo ↓',
    k2: 'Tu negocio, visto desde arriba', cas: 'Punto de partida: {0}. Lo afinas después.', segueix: 'Sigue →',
    q3: '¿Qué quieres conseguir?', q3d: 'Elige lo que más te importa ahora.',
    f: { clients: ['🎯', 'Más clientes'], temps: ['⏳', 'Ganar tiempo'], cobrar: ['💶', 'Cobrar lo que vale'], equip: ['🤝', 'Un equipo alineado'], web: ['🌐', 'Una web que trabaje por mí'], pes: ['🏗️', 'Que no todo dependa de mí'] },
    q4: 'Tu primer paso', x: ['personas a tu alrededor', 'cosas que cobras o pagas', 'que te sostienen sin factura', 'podrían ir solas'],
    p: { clients: 'Tu relación clave es «{clau}». Lo primero: que tu web cuente lo que recibe de ti, con sus palabras, y que pedírtelo sea un clic.',
      temps: '{auto} entregas podrían ir solas, como «{exA}». Lo primero: definir una y que un programa la prepare. Tú solo validas.',
      cobrar: 'Das {int} cosas que nadie te paga, como «{exI}». Lo primero: ponerlas a la vista y decidir cuáles forman parte de lo que vendes.',
      equip: 'Pon este mapa delante de tu equipo: que cada uno se encuentre y diga qué da y qué recibe. En una hora, todos veis lo mismo.',
      web: 'Tu web sale de este mapa: una parte para cada persona que te importa, con lo que viene a buscar. Empieza por «{clau}».',
      pes: 'El {pct} % de lo que circula pasa por ti: si tú paras, todo se para. Lo primero: pasar una parte a «{clau}».',
      pesOk: 'El peso está repartido: buena pinya. Lo primero: cuidar lo que te sostiene sin factura, como «{exI}».' },
    cta: 'Sigue con tu mapa, gratis →', ajuda: 'Quiero que me ayudéis', torna: 'Empezar de nuevo',
    lema: 'Nadie llega arriba solo.', tema: 'Diagnóstico de un minuto · {0} · quiero: {1}' },
  en: { pas: 'Step {0} of 4', enrere: '← Back',
    q1: 'What do you do?', q1d: 'One tap. We draw your business.', altre: 'Something else? Type it', veure: 'See my map →',
    noTrobo: 'Not sure yet: we start from the general model and you refine it later.', complet: 'A large organisation or a territory? The full diagnostic ↓',
    k2: 'Your business, seen from above', cas: 'Starting point: {0}. Refine it later.', segueix: 'Next →',
    q3: 'What do you want to achieve?', q3d: 'Pick what matters most right now.',
    f: { clients: ['🎯', 'More clients'], temps: ['⏳', 'Save time'], cobrar: ['💶', 'Get paid what it is worth'], equip: ['🤝', 'An aligned team'], web: ['🌐', 'A website that works for me'], pes: ['🏗️', 'Not everything on me'] },
    q4: 'Your first step', x: ['people around you', 'things you charge or pay', 'that hold you up unbilled', 'could run on their own'],
    p: { clients: 'Your key relationship is «{clau}». First: your website tells what they get from you, in their words, and asking you is one click.',
      temps: '{auto} deliverables could run on their own, like «{exA}». First: define one and let a program prepare it. You just approve.',
      cobrar: 'You give {int} things nobody pays for, like «{exI}». First: make them visible and decide which are part of what you sell.',
      equip: 'Put this map in front of your team: everyone finds themselves and says what they give and get. In one hour you all see the same thing.',
      web: 'Your website comes from this map: one part for each person who matters, with what they come for. Start with «{clau}».',
      pes: '{pct}% of what flows goes through you: if you stop, everything stops. First: hand part of it to «{clau}».',
      pesOk: 'The load is shared: a strong base. First: look after what holds you up unbilled, like «{exI}».' },
    cta: 'Continue with your map, free →', ajuda: 'I want your help', torna: 'Start again',
    lema: 'No one gets to the top alone.', tema: 'One-minute diagnostic · {0} · I want: {1}' }
};
/* El que és paper, cita o cobrament: el que un programa pot preparar i una
   persona valida. models-mapa.js (automatitza) és prudent i el deixa en
   «visita» quan no el coneix; aquí n'hi ha prou amb saber que podria anar sol. */
var PAPER = /pedid|comanda|reserva|cita|factur|pago|pagament|cuota|quota|presupuest|pressupost|propuest|proposta|informe|matr[ií]cul|inscrip|suscrip|subscrip|horari|cuentas|comptes|reposici|permis|order|booking|invoice|payment|fee|report|schedule/i;
/* Icones dels rols dels models, per paraula. */
var IC = [[/client|alumn|student|pacient|patient|usuari|user|hoste|guest|visitant|visit|compra/i, '🙂'], [/equip|team|treball|trabaj|staff/i, '👥'],
  [/prove|supplier|productor|producci/i, '📦'], [/recomana|recomienda|recommend|prescri/i, '📣'], [/comunitat|comunidad|community|veïn|vecin|barri|barrio/i, '🏘️'],
  [/administra|ajuntament|ayuntamiento|council|govern|gobierno/i, '🏛️'], [/soci|aliat|aliad|partner|col·labora|colabora|freelance/i, '🤝'],
  [/famíl|famil/i, '👪'], [/inversor|financ|banc/i, '💶'], [/gestor|asesor|assessor|advisor|accountant/i, '🧾'], [/mitjans|medios|media|xarxes|redes/i, '📰']];

function ll() { var l = D.documentElement.lang; return T[l] ? l : 'es'; }
function f(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k] != null ? o[k] : ''; }); }
function el(tag, at, txt) { var e = D.createElement(tag); for (var k in at || {}) e.setAttribute(k, at[k]); if (txt != null) e.textContent = txt; return e; }
function carrega(src) { return new Promise(function (ok, ko) { var s = el('script', { src: LIB + src }); s.onload = ok; s.onerror = ko; D.head.appendChild(s); }); }
function cal() {
  var p = [];
  if (!g.ModelsMapa) p.push(carrega('models-mapa.js'));
  if (!g.MapaValor) p.push(carrega('mapa-valor.js'));
  if (!g.MapaAnima) p.push(carrega('mapa-anima.js'));
  return Promise.all(p);
}

/* El mapa canònic ({roles, pairs}) com a «cas» de la pel·lícula: cada parell,
   dos lliuraments; el que models-mapa.js diu que una màquina pot preparar
   queda «definit» (podria anar sol), la resta és de persona a persona. */
function casDe(m, L, nom) {
  var MM = g.ModelsMapa, fx = [], R = m.roles;
  m.pairs.forEach(function (p) {
    [[p[0], p[1], p[2], p[3]], [p[1], p[0], p[4], p[5]]].forEach(function (x) {
      if (!x[3]) return;
      var mena = /^i/i.test(x[2] || '') ? 'intangible' : 'tangible';
      var a = MM && MM.automatitza ? MM.automatitza(x[3], mena, L) : { qui: 'persona' };
      var pot = mena === 'tangible' && (a.qui === 'maquina' || !!a.tipus || PAPER.test(x[3]));
      var o = function (v) { var r = {}; r[L] = v; r.es = v; r.ca = v; return r; };
      fx.push({ de: o(x[0]), a: o(x[1]), que: o(x[3].charAt(0).toLowerCase() + x[3].slice(1)), mena: mena, qui: pot ? 'maquina' : 'persona', escalo: pot ? 'definido' : 'presencial', proces: '' });
    });
  });
  var roles = {}; roles[L] = R; roles.es = R; roles.ca = R;
  var noms = {}; noms[L] = nom; noms.es = nom; noms.ca = nom;
  var t = T[L], tx = {}; tx[L] = { p1: { ca: 'Això podria anar sol', es: 'Esto podría ir solo', en: 'This could run on its own' }[L],
    pl: { k: t.k2, cas: t.cas, e: g.MapaAnima.T[L] && g.MapaAnima.T[L].pl ? g.MapaAnima.T[L].pl.e : g.MapaAnima.T.es.pl.e } };
  return { nom: noms, roles: roles, fluxos: fx, processos: [], nivells: {}, textos: tx,
    icones: R.map(function (r) { if (r === m.centre) return '⭐'; for (var i = 0; i < IC.length; i++) if (IC[i][0].test(r)) return IC[i][1]; return '●'; }) };
}

/* Les xifres i la frase del primer pas, del mateix mapa. */
function lectura(m, C) {
  var fx = C.fluxos, L = Object.keys(C.textos)[0], c = m.centre, tang = 0, intg = 0, auto = 0, exA = '', exI = '', amb = {};
  fx.forEach(function (x) {
    if (x.mena === 'intangible') { intg++; if (!exI && (x.de[L] === c)) exI = x.que[L]; } else tang++;
    if (x.escalo === 'definido') { auto++; if (!exA) exA = x.que[L]; }
    var o = x.de[L] === c ? x.a[L] : x.a[L] === c ? x.de[L] : null; if (o) amb[o] = (amb[o] || 0) + 1;
  });
  if (!exI) fx.some(function (x) { if (x.mena === 'intangible') { exI = x.que[L]; return true; } });
  var clau = Object.keys(amb).sort(function (a, b) { return amb[b] - amb[a]; })[0] || m.roles[1] || '';
  var pct = null;
  if (g.MapaValor) { try { var r = g.MapaValor.revisa({ roles: m.roles, pairs: m.pairs }).regles.filter(function (x) { return x.id === 'concentracio'; })[0]; if (r && !r.ok) pct = (r.diu.match(/(\d+) %/) || [])[1] || null; } catch (e) { /* sense lectura de concentració */ } }
  return { rols: m.roles.length - 1, tang: tang, int: intg, auto: auto, exA: exA, exI: exI, clau: clau.charAt(0).toLowerCase() + clau.slice(1), pct: pct };
}

function munta(arrel) {
  var L = ll(), t = T[L], estat = { pas: 1, id: null, nom: '', m: null, C: null, fita: null };
  try { var desat = JSON.parse(sessionStorage.getItem('tt.fluxMinut') || 'null'); if (desat && desat.id) { estat.id = desat.id; estat.fita = desat.fita || null; } } catch (e) { /* sense memòria */ }
  function desa() { try { sessionStorage.setItem('tt.fluxMinut', JSON.stringify({ id: estat.id, fita: estat.fita })); } catch (e) { /* sense memòria */ } }

  function cap(n) {
    var h = el('div', { class: 'fm-cap' });
    var b = el('button', { type: 'button', class: 'fm-enr' }, t.enrere);
    if (n === 1) b.style.visibility = 'hidden';
    b.addEventListener('click', function () { va(n - 1); });
    h.appendChild(b);
    var pp = el('div', { class: 'fm-pts', role: 'img', 'aria-label': f(t.pas, { 0: n }) });
    for (var i = 1; i <= 4; i++) pp.appendChild(el('i', { class: i <= n ? 'on' : '' }));
    h.appendChild(pp);
    return h;
  }
  function pantalla(n) { arrel.textContent = ''; var s = el('section', { class: 'fm-p', 'data-pas': n }); s.appendChild(cap(n)); arrel.appendChild(s); return s; }

  function p1() {
    var s = pantalla(1);
    s.appendChild(el('h1', { class: 'fm-q' }, t.q1));
    s.appendChild(el('p', { class: 'fm-d' }, t.q1d));
    var gr = el('div', { class: 'fm-chips' });
    OFICIS.forEach(function (o) {
      var b = el('button', { type: 'button', class: 'fm-chip' });
      b.appendChild(el('span', { 'aria-hidden': 'true' }, o[1])); b.appendChild(el('b', {}, o[{ ca: 2, es: 3, en: 4 }[L]]));
      b.addEventListener('click', function () { tria(o[0]); });
      gr.appendChild(b);
    });
    s.appendChild(gr);
    var fo = el('form', { class: 'fm-altre' }), inp = el('input', { type: 'text', placeholder: t.altre, 'aria-label': t.altre, maxlength: '140' });
    fo.appendChild(inp); fo.appendChild(el('button', { type: 'submit', class: 'btn-primary' }, '→'));
    var avis = el('p', { class: 'fm-avis', 'aria-live': 'polite' });
    fo.addEventListener('submit', function (ev) {
      ev.preventDefault(); var v = inp.value.trim(); if (!v) { inp.focus(); return; }
      var x = g.ModelsMapa && g.ModelsMapa.suggereix(v, L);
      if (!x) { avis.textContent = t.noTrobo; setTimeout(function () { tria('negoci'); }, 1400); } else tria(x.id);
    });
    s.appendChild(fo); s.appendChild(avis);
    var c = D.getElementById('complet');
    if (c) { var a = el('a', { class: 'fm-complet', href: '#complet' }, t.complet); a.addEventListener('click', function () { c.hidden = false; }); s.appendChild(a); }
  }
  function tria(id) { estat.id = id; estat.fita = null; desa(); va(2); }

  function prepara() {
    var MM = g.ModelsMapa, m = MM.mapa(estat.id, L) || MM.mapa('negoci', L);
    var tots = MM.MODELS.concat(MM.SECTORS, MM.OFICIS), M = tots.filter(function (x) { return x.id === estat.id; })[0] || {};
    var o = OFICIS.filter(function (x) { return x[0] === estat.id; })[0];
    estat.nom = o ? o[{ ca: 2, es: 3, en: 4 }[L]] : ((M[L] || M.es || {}).nom || m.nom);
    estat.m = m; estat.C = casDe(m, L, estat.nom.charAt(0).toLowerCase() + estat.nom.slice(1));
  }

  function p2() {
    prepara();
    var s = pantalla(2), v = el('div', { class: 'fm-peli' }), nx = el('button', { type: 'button', class: 'btn-primary fm-seg' }, t.segueix);
    s.appendChild(v);
    nx.addEventListener('click', function () { va(3); });
    s.appendChild(nx);
    var C = estat.C; C.escenes = [0, 1, 2]; C.unCop = true; C.alFinal = function () { nx.classList.add('fm-ja'); };
    g.MapaAnima.pelicula(v, C);
  }

  function p3() {
    var s = pantalla(3);
    s.appendChild(el('h1', { class: 'fm-q' }, t.q3));
    s.appendChild(el('p', { class: 'fm-d' }, t.q3d));
    var gr = el('div', { class: 'fm-chips fm-fites' });
    FITES.forEach(function (k) {
      var b = el('button', { type: 'button', class: 'fm-chip' });
      b.appendChild(el('span', { 'aria-hidden': 'true' }, t.f[k][0])); b.appendChild(el('b', {}, t.f[k][1]));
      b.addEventListener('click', function () { estat.fita = k; desa(); va(4); });
      gr.appendChild(b);
    });
    s.appendChild(gr);
  }

  function p4() {
    if (!estat.m) prepara();
    var s = pantalla(4), r = lectura(estat.m, estat.C), k = estat.fita || 'temps';
    s.appendChild(el('p', { class: 'fm-k' }, estat.nom));
    s.appendChild(el('h1', { class: 'fm-q' }, t.q4));
    var xs = el('dl', { class: 'fm-xs' });
    [r.rols, r.tang, r.int, r.auto].forEach(function (n, i) {
      var d = el('div', { class: 'fm-x fm-x' + i }); d.appendChild(el('dt', {}, n)); d.appendChild(el('dd', {}, t.x[i])); xs.appendChild(d);
    });
    s.appendChild(xs);
    var pf = el('p', { class: 'fm-pas' });
    pf.appendChild(el('span', { class: 'fm-fita' }, t.f[k][0] + ' ' + t.f[k][1]));
    pf.appendChild(el('span', {}, f(k === 'pes' && !r.pct ? t.p.pesOk : t.p[k], r)));
    s.appendChild(pf);
    s.appendChild(el('p', { class: 'fm-lema' }, t.lema));
    var acc = el('div', { class: 'fm-acc' });
    acc.appendChild(el('a', { class: 'btn-primary', href: '/cliente/?modelo=' + encodeURIComponent(estat.id) + '&lang=' + L + '#alrededor' }, t.cta));
    var aj = el('a', { class: 'btn-ghost', href: '#habla' }, t.ajuda);
    aj.addEventListener('click', function (ev) {
      if (g.Recorrido && g.Recorrido.contacta && g.Recorrido.contacta({ tema: f(t.tema, { 0: estat.nom, 1: t.f[k][1] }) })) ev.preventDefault();
    });
    acc.appendChild(aj);
    s.appendChild(acc);
    var tr = el('button', { type: 'button', class: 'fm-torna' }, t.torna);
    tr.addEventListener('click', function () { estat.id = null; estat.fita = null; estat.m = null; desa(); va(1); });
    s.appendChild(tr);
  }

  function va(n) {
    if (n < 1) n = 1;
    if (n > 1 && !estat.id) n = 1;
    if (n > 3 && !estat.fita) n = 3;
    estat.pas = n;
    var pv = arrel.querySelector('.fm-peli'); if (pv) { clearInterval(pv._pl); if (pv._tl) clearInterval(pv._tl._ma); }
    [p1, p2, p3, p4][n - 1]();
    if (location.hash !== '#pas-' + n) history.replaceState(null, '', location.pathname + location.search + '#pas-' + n);
    var h = arrel.querySelector('h1,.fm-peli'); if (h && n > 1) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    g.scrollTo(0, 0);
  }
  var m0 = /^#pas-(\d)$/.exec(location.hash);
  va(m0 ? +m0[1] : 1);
  new MutationObserver(function () { if (ll() !== L) { L = ll(); t = T[L]; estat.m = null; va(estat.pas); } })
    .observe(D.documentElement, { attributes: true, attributeFilter: ['lang'] });
}

function estil() {
  var s = el('style');
  s.textContent =
    '[data-flux-minut]{max-width:34rem;margin:0 auto;padding:0 1rem}' +
    '.fm-p{display:flex;flex-direction:column;min-height:calc(100svh - 7rem);padding:.6rem 0 1.2rem}' +
    '.fm-cap{display:flex;align-items:center;justify-content:space-between;margin-bottom:.8rem}' +
    '.fm-enr,.fm-torna{all:unset;cursor:pointer;color:var(--muted);font-size:var(--t0);padding:.5rem 0;min-height:44px;box-sizing:border-box}' +
    '.fm-enr:focus-visible,.fm-torna:focus-visible,.fm-chip:focus-visible{outline:2px solid var(--indigo);outline-offset:2px}' +
    '.fm-pts{display:flex;gap:.35rem}.fm-pts i{width:1.6rem;height:4px;border-radius:2px;background:var(--border)}.fm-pts i.on{background:var(--indigo)}' +
    '.fm-q{font-size:clamp(1.8rem,8vw,2.6rem);font-weight:800;letter-spacing:-.02em;line-height:1.1;margin:.2rem 0 .3rem;color:var(--text);background:none;-webkit-text-fill-color:currentColor}' +
    '.fm-q:focus{outline:none}.fm-d{margin:0 0 1rem;color:var(--light);font-size:var(--t1)}' +
    '.fm-k{margin:0;font-family:var(--mono);font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}' +
    '.fm-chips{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}' +
    '.fm-chip{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:.5rem;min-height:52px;padding:.55rem .7rem;border:1px solid var(--border);border-radius:12px;background:var(--card);cursor:pointer;line-height:1.2;font-size:var(--t0)}' +
    '.fm-chip span{font-size:1.3rem}.fm-chip b{font-weight:600;color:var(--text)}.fm-chip:hover{border-color:var(--indigo)}.fm-chip:active{transform:scale(.98)}' +
    '.fm-fites{grid-template-columns:1fr}.fm-fites .fm-chip{min-height:60px;font-size:var(--t1)}' +
    '.fm-altre{display:flex;gap:.5rem;margin-top:.8rem}.fm-altre input{flex:1;min-width:0;min-height:48px;padding:0 .9rem;border:1px solid var(--border-strong);border-radius:12px;font:inherit;font-size:16px;background:var(--card);color:var(--text)}' +
    '.fm-altre .btn-primary{min-width:52px}.fm-avis{min-height:1.2em;margin:.4rem 0 0;color:var(--orange);font-size:var(--t0)}' +
    '.fm-complet{margin-top:auto;padding-top:1rem;font-size:var(--t0);color:var(--muted);text-align:center}' +
    '.fm-peli{flex:1;display:flex;flex-direction:column;min-height:30rem}.fm-peli .pl-fi{display:none}' +
    '.fm-seg{align-self:stretch;margin-top:.6rem;opacity:.55;transition:opacity .4s}.fm-seg.fm-ja{opacity:1}' +
    '.fm-xs{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin:.6rem 0 1rem}.fm-x{padding:.6rem .7rem;border-radius:12px;background:var(--panel)}' +
    '.fm-x dt{font-size:2rem;font-weight:800;line-height:1}.fm-x dd{margin:.2rem 0 0;font-size:.85rem;color:var(--light);line-height:1.25}' +
    '.fm-x0 dt{color:var(--text)}.fm-x1 dt{color:var(--blue)}.fm-x2 dt{color:var(--purple)}.fm-x3 dt{color:var(--green)}' +
    '.fm-pas{margin:0;padding:.9rem 1rem;border-left:4px solid var(--indigo);background:var(--card);border-radius:0 12px 12px 0;font-size:var(--t1);line-height:1.45}' +
    '.fm-fita{display:block;font-weight:700;margin-bottom:.25rem}' +
    '.fm-lema{margin:1rem 0 .8rem;text-align:center;font-weight:800;font-size:clamp(1.25rem,5.4vw,1.6rem);color:var(--indigo);letter-spacing:-.01em}' +
    '.fm-acc{display:flex;flex-direction:column;gap:.5rem}.fm-torna{align-self:center;margin-top:.4rem}';
  D.head.appendChild(s);
}

function engega() {
  var n = D.querySelector('[data-flux-minut]'); if (!n) return;
  estil();
  cal().then(function () { munta(n); }, function () { n.hidden = true; var c = D.getElementById('complet'); if (c) c.hidden = false; });
}
g.FluxMinut = { casDe: casDe, lectura: lectura };
if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', engega); else engega();
})(window);
