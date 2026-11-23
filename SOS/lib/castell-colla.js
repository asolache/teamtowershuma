/* La teva colla, dibuixada · l'organització és el castell, cada flux un pilar
 * ─────────────────────────────────────────────────────────────────────────────
 * L'Àlvaro (23/11/2026), amb 21 anys de Fent Pinya: «cada organització és un
 * castell, però cada flux de valor també és un castell, o potser un dels
 * pilars del castell». I la regla de l'ofici: de dalt a baix, enxaneta,
 * aixecador, dosos, i els pisos del tronc fins als baixos; a sota, la pinya.
 * Al pilar no hi ha ni dosos ni aixecador: només l'enxaneta.
 *
 * El model, en tres línies:
 *   · Un flux de valor sol és un **pilar**: una columna, una persona per pis,
 *     i a dalt l'enxaneta, que és el lliurament que veu el client.
 *   · Una organització amb N fluxos és un castell de N: la **torre** (2), el
 *     **tres**, el **quatre**… Cada columna del tronc és un flux.
 *   · Les cases grans són castells **compostos**: el cinc és un tres i una
 *     torre, el set és un quatre i un tres, el nou són tres tresos. Cada part
 *     és una unitat de negoci, i cadascuna corona.
 *
 *   CastellColla.FIGURES                 les construccions
 *   CastellColla.posicions(id)           { tronc:[…], pom:[…] } de dalt a baix
 *   CastellColla.munta(caixa)            la vista, a [data-castell-colla]
 *
 * Les posicions són les de l'ofici; el que vol dir cada una en una casa és la
 * lectura de `build-castells.js` (POSICIONS), dita aquí des del flux de valor.
 * Res surt del navegador.
 */
(function (arrel) {
  'use strict';
  var Ninot = typeof module === 'object' && module.exports ? require('./ninot.js') : arrel.Ninot;

  /* Les construccions. `parts` són les columnes de cada castell que corona
     per si sol: el cinc és [3, 2]. `pisos` és l'alçada del tronc, sense pom. */
  var FIGURES = [
    { id: 'pilar', parts: [1], pisos: 4, ca: 'Pilar', es: 'Pilar' },
    { id: 'torre', parts: [2], pisos: 5, ca: 'Torre', es: 'Torre' },
    { id: 'tres', parts: [3], pisos: 4, ca: 'Tres', es: 'Tres' },
    { id: 'quatre', parts: [4], pisos: 4, ca: 'Quatre', es: 'Cuatro' },
    { id: 'cinc', parts: [3, 2], pisos: 4, ca: 'Cinc', es: 'Cinco' },
    { id: 'set', parts: [4, 3], pisos: 4, ca: 'Set', es: 'Siete' },
    { id: 'nou', parts: [3, 3, 3], pisos: 3, ca: 'Nou', es: 'Nueve' }
  ];
  var PIS = ['baix', 'segon', 'terc', 'quart', 'cinque', 'sise', 'sete'];

  /* El text de cada posició: el nom de l'ofici, què fa al castell i què és en
     un flux de valor. */
  var P = {
    enxaneta: { ca: ['Enxaneta', 'Corona i fa l\'aleta.', 'El lliurament que veu el client. Quan el flux arriba a terme, corona.'],
      es: ['Enxaneta', 'Corona y hace la aleta.', 'La entrega que ve el cliente. Cuando el flujo llega a término, corona.'] },
    aixecador: { ca: ['Aixecador', 'S\'ajup perquè l\'enxaneta passi.', 'Qui deixa a punt l\'últim pas perquè un altre coroni: la revisió, el traspàs, qui forma el relleu.'],
      es: ['Aixecador', 'Se agacha para que la enxaneta pase.', 'Quien deja a punto el último paso para que otro corone: la revisión, el traspaso, quien forma el relevo.'] },
    dosos: { ca: ['Dosos', 'Els dos de dalt, sobre el tronc.', 'La parella que tanca: qui acorda l\'entrega final amb el client, un a cada banda.'],
      es: ['Dosos', 'Los dos de arriba, sobre el tronco.', 'La pareja que cierra: quien acuerda la entrega final con el cliente, uno a cada lado.'] },
    sete: { ca: ['Setens', 'Setè pis del tronc.', 'Cada pis afegeix una capa de valor a la de sota.'], es: ['Setens', 'Séptimo piso del tronco.', 'Cada piso añade una capa de valor a la de abajo.'] },
    sise: { ca: ['Sisens', 'Sisè pis del tronc.', 'Cada pis afegeix una capa de valor a la de sota.'], es: ['Sisens', 'Sexto piso del tronco.', 'Cada piso añade una capa de valor a la de abajo.'] },
    cinque: { ca: ['Cinquens', 'Cinquè pis del tronc.', 'L\'especialista del flux, ja a prop del client.'], es: ['Cinquens', 'Quinto piso del tronco.', 'La especialista del flujo, ya cerca del cliente.'] },
    quart: { ca: ['Quarts', 'Quart pis del tronc.', 'Qui afina el que el pis del mig li passa.'], es: ['Quarts', 'Cuarto piso del tronco.', 'Quien afina lo que el piso de en medio le pasa.'] },
    terc: { ca: ['Terços', 'El pis on el castell es decideix.', 'El pis del mig: rep pressió de dalt i de baix.'], es: ['Terços', 'El piso donde el castell se decide.', 'El piso de en medio: recibe presión de arriba y de abajo.'] },
    segon: { ca: ['Segons', 'Primer pis sobre els baixos.', 'Qui converteix la decisió en feina repartida.'], es: ['Segons', 'Primer piso sobre los baixos.', 'Quien convierte la decisión en trabajo repartido.'] },
    baix: { ca: ['Baixos', 'A terra, aguanten tot el tronc.', 'Qui porta el pes del flux. Si cedeix, cau la columna sencera.'], es: ['Baixos', 'En el suelo, aguantan todo el tronco.', 'Quien lleva el peso del flujo. Si cede, cae la columna entera.'] },
    crossa: { ca: ['Crosses', 'Sota les aixelles del baix.', 'Qui li treu pes a qui porta el flux: l\'administració, el suport.'], es: ['Crosses', 'Bajo las axilas del baix.', 'Quien le quita peso a quien lleva el flujo: la administración, el soporte.'] },
    contrafort: { ca: ['Contrafort', 'Darrere el baix, per l\'esquena.', 'Qui vigila que el flux no es desviï i ho diu a temps.'], es: ['Contrafort', 'Detrás del baix, por la espalda.', 'Quien vigila que el flujo no se desvíe y lo dice a tiempo.'] },
    agulla: { ca: ['Agulla', 'Sota el segon, empenyent amunt.', 'Qui fa que el primer pis aguanti: l\'eina, les dades, el proveïdor clau.'], es: ['Agulla', 'Bajo el segon, empujando hacia arriba.', 'Quien hace que el primer piso aguante: la herramienta, los datos, el proveedor clave.'] },
    primera: { ca: ['Primeres mans', 'Subjecten el segon per darrere.', 'Qui entrega directament el que el flux promet.'], es: ['Primeras manos', 'Sujetan al segon por detrás.', 'Quien entrega directamente lo que el flujo promete.'] },
    vent: { ca: ['Vents', 'Entre dos pilars, una mà a cada un.', 'Qui lliga dos fluxos. Sense vents, la casa són silos.'], es: ['Vents', 'Entre dos pilares, una mano en cada uno.', 'Quien ata dos flujos. Sin vents, la casa son silos.'] },
    lateral: { ca: ['Laterals', 'Pels costats, braços estirats.', 'El reforç d\'una altra àrea que sempre hi és.'], es: ['Laterales', 'Por los lados, brazos estirados.', 'El refuerzo de otra área que siempre está.'] },
    cordo: { ca: ['Cordons', 'Segon, tercer cordó… cada cop més enfora.', 'La xarxa: col·laboradors, clients i comunitat, que empenyen sense sortir a l\'organigrama.'],
      es: ['Cordones', 'Segundo, tercer cordón… cada vez más afuera.', 'La red: colaboradores, clientes y comunidad, que empujan sin salir en el organigrama.'] }
  };
  var PINYA = [['crossa', 'contrafort', 'agulla'], ['primera', 'vent', 'lateral'], ['cordo']];

  /* Uns fluxos de mostra, amb paraules de qualsevol casa. */
  var FLUX = {
    ca: ['Captar clients', 'Fer el servei', 'Cobrar i fidelitzar', 'Equip', 'Proveïdors', 'Comunicació', 'Formació', 'Xarxa', 'Coneixement'],
    es: ['Captar clientes', 'Hacer el servicio', 'Cobrar y fidelizar', 'Equipo', 'Proveedores', 'Comunicación', 'Formación', 'Red', 'Conocimiento']
  };
  var T = {
    ca: { tria: 'Tria el castell', toca: 'Toca un casteller per veure què fa al castell i què és a la teva casa.', castell: 'Al castell', casa: 'Al teu flux',
      quan: { pilar: 'Un sol flux de valor: un pilar. A dalt, només l\'enxaneta.', torre: 'Dos fluxos que s\'aguanten l\'un a l\'altre.',
        tres: 'Tres fluxos: la casa que ja té una manera de fer.', quatre: 'Quatre fluxos amb una base ampla.',
        cinc: 'Un tres i una torre: dues unitats que s\'aixequen juntes.', set: 'Un quatre i un tres: la casa amb dues àrees grans.',
        nou: 'Tres tresos: una xarxa de cases.' },
      pinya: 'La pinya', tit: 'El castell d\'una organització' },
    es: { tria: 'Elige el castell', toca: 'Toca un casteller para ver qué hace en el castell y qué es en tu casa.', castell: 'En el castell', casa: 'En tu flujo',
      quan: { pilar: 'Un solo flujo de valor: un pilar. Arriba, solo la enxaneta.', torre: 'Dos flujos que se aguantan el uno al otro.',
        tres: 'Tres flujos: la casa que ya tiene una manera de hacer.', quatre: 'Cuatro flujos con una base ancha.',
        cinc: 'Un tres y una torre: dos unidades que se levantan juntas.', set: 'Un cuatro y un tres: la casa con dos áreas grandes.',
        nou: 'Tres tres: una red de casas.' },
      pinya: 'La piña', tit: 'El castell de una organización' }
  };

  function figura(id) { return FIGURES.filter(function (f) { return f.id === id; })[0] || FIGURES[0]; }
  /* De dalt a baix. Al pilar, només enxaneta; a la torre no hi ha dosos (són
     dos, i dos ja són el tronc); a partir del tres, enxaneta, aixecador i dosos. */
  function pom(n) { return n === 1 ? ['enxaneta'] : n === 2 ? ['enxaneta', 'aixecador'] : ['enxaneta', 'aixecador', 'dosos']; }
  function posicions(id) {
    var f = figura(id);
    return { tronc: PIS.slice(0, f.pisos).reverse(), pom: f.parts.map(pom) };
  }

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* El dibuix, de costat: el tronc a sobre de la línia de terra i la pinya a
     sota, anell per anell, com si l'aixequéssim per veure-la. */
  function dibuixa(id, L) {
    var f = figura(id), DX = 26, DY = 27, GAP = 18, s = 0.95;
    var n = f.parts.reduce(function (a, b) { return a + b; }, 0);
    var ample = n * DX + (f.parts.length - 1) * GAP, W = Math.max(ample + 120, 300);
    var dalt = 3 * DY + 30, G = dalt + f.pisos * DY, H = G + 3 * 26 + 34, o = [], x0 = (W - ample) / 2 + DX / 2, col = 0;
    function nan(X, Y, p, sc, c) {
      return Ninot(X, Y, sc, 'ple', c, 'data-p="' + p + '" tabindex="0" role="button" aria-label="' + esc(P[p][L][0]) + '"');
    }
    o.push('<line x1="10" x2="' + (W - 10) + '" y1="' + (G + 4) + '" y2="' + (G + 4) + '" class="cc-terra"/>');
    f.parts.forEach(function (k, pi) {
      var xs = [];
      for (var c = 0; c < k; c++) xs.push(x0 + (col + c) * DX + pi * GAP);
      xs.forEach(function (X, c) {
        PIS.slice(0, f.pisos).forEach(function (p, i) { o.push(nan(X, G - i * DY, p, s, 'var(--indigo)')); });
        o.push('<text x="' + X + '" y="' + (G + 16) + '" class="cc-flux">' + (col + c + 1) + '</text>');
      });
      var mig = (xs[0] + xs[xs.length - 1]) / 2, top = G - f.pisos * DY, P0 = pom(k);
      if (P0.indexOf('dosos') >= 0) { o.push(nan(mig - 8, top, 'dosos', 0.8, 'var(--gold)')); o.push(nan(mig + 8, top, 'dosos', 0.8, 'var(--gold)')); top -= DY * 0.8; }
      if (P0.indexOf('aixecador') >= 0) { o.push(nan(mig, top, 'aixecador', 0.72, 'var(--gold)')); top -= DY * 0.72; }
      o.push(nan(mig, top, 'enxaneta', 0.64, 'var(--orange)'));
      col += k;
    });
    PINYA.forEach(function (fila, r) {
      var Y = G + 40 + r * 26, quants = Math.round((ample + 40 + r * 60) / 18), X0 = W / 2 - (quants - 1) * 9;
      for (var i = 0; i < quants; i++) {
        var p = fila[i % fila.length];
        o.push(nan(X0 + i * 18, Y, p, 0.62, r === 2 ? 'var(--muted)' : 'var(--green)'));
      }
    });
    o.push('<text x="' + (W - 12) + '" y="' + (G + 36) + '" class="cc-pin" text-anchor="end">' + esc(T[L].pinya) + '</text>');
    return '<svg class="cc-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(T[L].tit + ' · ' + f[L]) + '">' + o.join('') + '</svg>';
  }

  var CSS = '.cc{margin:1.5rem 0 0}.cc-tria{display:flex;flex-wrap:wrap;gap:.35rem;margin:0 0 .6rem}'
    + '.cc-tria button{font:inherit;font-weight:600;padding:.3rem .8rem;min-height:2.4rem;border-radius:999px;border:1px solid var(--border);background:var(--card);color:var(--text);cursor:pointer}'
    + '.cc-tria [aria-pressed=true]{background:var(--text);color:var(--card);border-color:var(--text)}'
    + '.cc-q{margin:0 0 .4rem;color:var(--light)}.cc-svg{display:block;width:100%;max-height:26rem}'
    + '.cc-svg [data-p]{cursor:pointer;outline:none}.cc-svg [data-p]:is(:hover,:focus-visible,.on) rect{fill:var(--red)}'
    + '.cc-terra{stroke:var(--border-strong);stroke-width:1.5}.cc-flux{font:600 9px var(--sans,system-ui);fill:var(--muted);text-anchor:middle}'
    + '.cc-pin{font:600 10px var(--sans,system-ui);fill:var(--muted)}.ct-ombra{fill:var(--border);opacity:.6}'
    + '.cc-fitxa{min-height:5.5rem;margin:.6rem 0 0;padding:.7rem 1rem;border:1px solid var(--border);border-radius:12px;background:var(--card)}'
    + '.cc-fitxa b{display:block}.cc-fitxa p{margin:.2rem 0 0;color:var(--light)}.cc-ll{margin:.4rem 0 0;padding-left:1.2rem;color:var(--light)}';

  function munta(caixa) {
    var doc = caixa.ownerDocument, st = { f: caixa.getAttribute('data-castell-colla') || 'tres', p: '' };
    if (!doc.getElementById('cc-css')) { var e = doc.createElement('style'); e.id = 'cc-css'; e.textContent = CSS; doc.head.appendChild(e); }
    function ll() { return doc.documentElement.lang === 'es' ? 'es' : 'ca'; }
    function pinta() {
      var L = ll(), t = T[L], f = figura(st.f), x = P[st.p];
      var fl = FLUX[L].slice(0, f.parts.reduce(function (a, b) { return a + b; }, 0));
      caixa.className = 'cc';
      caixa.innerHTML = '<div class="cc-tria" role="group" aria-label="' + esc(t.tria) + '">'
        + FIGURES.map(function (g) { return '<button type="button" data-f="' + g.id + '" aria-pressed="' + (g.id === st.f) + '">' + esc(g[L]) + '</button>'; }).join('')
        + '</div><p class="cc-q">' + esc(t.quan[f.id]) + '</p>' + dibuixa(f.id, L)
        + '<ol class="cc-ll">' + fl.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ol>'
        + '<div class="cc-fitxa" aria-live="polite">' + (x ? '<b>' + esc(x[L][0]) + '</b><p>' + esc(t.castell) + ': ' + esc(x[L][1]) + '</p><p>' + esc(t.casa) + ': ' + esc(x[L][2]) + '</p>' : '<p>' + esc(t.toca) + '</p>') + '</div>';
      if (st.p) [].forEach.call(caixa.querySelectorAll('[data-p="' + st.p + '"]'), function (g) { g.classList.add('on'); });
    }
    function tria(ev) {
      var b = ev.target.closest && ev.target.closest('[data-f]');
      if (b) { st.f = b.getAttribute('data-f'); pinta(); return; }
      var g = ev.target.closest && ev.target.closest('[data-p]');
      if (g) { st.p = g.getAttribute('data-p'); pinta(); var q = caixa.querySelector('[data-p="' + st.p + '"]'); if (q && ev.type === 'keydown') q.focus(); }
    }
    caixa.addEventListener('click', tria);
    caixa.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); tria(ev); } });
    if (arrel.MutationObserver) new MutationObserver(pinta).observe(doc.documentElement, { attributes: true, attributeFilter: ['lang'] });
    pinta();
  }

  var CastellColla = { FIGURES: FIGURES, P: P, PINYA: PINYA, T: T, posicions: posicions, dibuixa: dibuixa, munta: munta };
  if (typeof module === 'object' && module.exports) module.exports = CastellColla;
  else {
    arrel.CastellColla = CastellColla;
    var go = function () { [].forEach.call(document.querySelectorAll('[data-castell-colla]'), munta); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  }
})(this);
