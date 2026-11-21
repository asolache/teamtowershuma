/* ══ IMPACTE · el que s'estalvia un territori si el SOS hi arrela ══════════
   Una sola peça (regla DRY del 17/10) per a l'app (`openImpactSimulator`,
   ruta `#/fons/impacte`) i per a la pàgina de la visió (`visio.html`).
   Fins al 21/11/2026 vivia escrita dins de `SOS/index.html` i la visió
   n'hauria hagut de fer una còpia.

   21/11/2026 · Álvaro: «configura ya Cataluña con la población actual
   estimada y unos gráficos del potencial a nivel nacional». D'aquí surten:
   · `TERRITORIS` · Catalunya i Espanya amb la població oficial i la seva data.
   · `simula`     · el càlcul d'abans, mòdul a mòdul, i les persones que arriba.
   · `escala`     · la mateixa simulació a diverses penetracions.
   · `barres`     · un gràfic de barres en SVG, sense cap llibreria.

   La regla de sempre: cap xifra sense font i cap estimació dita com si fos
   comptabilitat. Els percentatges psicosocials que l'app ensenyava abans
   (-100 % de soledat al 50 % de penetració) no sortien de cap estudi i ja no
   es publiquen: ara es diu a quantes persones arriba la xarxa i l'evidència
   es llegeix a les fonts de `visio.html#fonts`. */
(function (root) {
  'use strict';

  /* Els supòsits per llar activa i any. Són els de l'app des del juliol i es
     poden canviar node per node: el simulador els passa com a `inp`. */
  var DEFAULTS = {
    hourlyValueAvg: 20,       // €/h, la tarifa de referència de l'oracle del banc de temps
    annualHoursPerActive: 40, // hores d'ajuda rebudes per llar activa i any
    objectsPerActive: 3,      // objectes que una llar deixa de comprar
    avgObjectValue: 100,      // € per objecte
    housingSavingPct: 0.15,   // estalvi sobre el lloguer, per a qui entra en cessió d'ús
    housingShare: 0.4,        // part de les llars actives que hi accedeix
    energySavingPct: 0.2,     // estalvi de l'autoconsum compartit sobre la factura
    avgRentAnnual: 9600,      // € de lloguer a l'any
    avgEnergyAnnual: 1200,    // € d'electricitat a l'any
    carePerActive: 200,       // € de cures i acompanyament per llar activa
    tCO2PerActive: 0.35,      // t de CO₂ evitades per llar activa
    personsPerHousehold: 2.5
  };

  /* La població oficial més recent. La de Catalunya és d'Idescat; les llars
     s'estimen amb la mida mitjana estatal (49.935.642 / 19.953.529 = 2,50). */
  var TERRITORIS = {
    catalunya: {
      nom: { ca: 'Catalunya', es: 'Cataluña' }, population: 8210710,
      households: Math.round(8210710 / 2.5),
      font: 'Idescat, estimacions de població a 1/1/2026 · llars estimades a 2,5 persones per llar (INE)',
      url: 'https://www.idescat.cat/novetats/?id=5551'
    },
    espanya: {
      nom: { ca: 'Espanya', es: 'España' }, population: 49935642, households: 19953529,
      font: 'INE, Estadística Contínua de Població a 1/10/2026 (provisional)',
      url: 'https://www.ine.es/dyngs/Prensa/ECP3T26.pdf'
    }
  };

  var MODULS = [
    { k: 'timeBank', ic: '⏱', ca: 'Banc de temps', es: 'Banco de tiempo' },
    { k: 'library', ic: '📚', ca: 'Biblioteca de les coses', es: 'Biblioteca de las cosas' },
    { k: 'housing', ic: '🏠', ca: 'Habitatge en cessió d\'ús', es: 'Vivienda en cesión de uso' },
    { k: 'energy', ic: '⚡', ca: 'Energia compartida', es: 'Energía compartida' },
    { k: 'care', ic: '🤝', ca: 'Cures i acompanyament', es: 'Cuidados y acompañamiento' }
  ];

  function simula(inp) {
    var d = Object.assign({}, DEFAULTS, inp || {});
    var pop = Math.max(0, Number(d.population) || 0);
    var households = Number(d.households) || Math.round(pop / d.personsPerHousehold);
    var pen = Math.max(0, Math.min(1, Number(d.penetration) || 0));
    var active = Math.round(households * pen);
    var timeBank = Math.round(active * d.annualHoursPerActive * d.hourlyValueAvg);
    var library = Math.round(active * d.objectsPerActive * d.avgObjectValue * 0.3); // 30 % circula cada any
    var housing = Math.round(active * (d.avgRentAnnual || 0) * d.housingSavingPct * d.housingShare);
    var energy = Math.round(active * (d.avgEnergyAnnual || 0) * d.energySavingPct);
    var care = Math.round(active * d.carePerActive);
    var total = timeBank + library + housing + energy + care;
    return {
      inputs: { population: pop, households: households, penetration: pen, active: active },
      economic: { timeBank: timeBank, library: library, housing: housing, energy: energy, care: care, total: total,
        perHousehold: active ? Math.round(total / active) : 0 },
      social: { persons: Math.round(active * d.personsPerHousehold) },
      environmental: { tCO2: Math.round(active * d.tCO2PerActive * 10) / 10 },
      sources: [
        { k: 'hora', v: d.hourlyValueAvg + ' €/h', src: 'oracle del banc de temps del SOS' },
        { k: 'lloguer/any', v: d.avgRentAnnual + ' €', src: 'Sindicat de Llogaters (mitjana)' },
        { k: 'electricitat/any', v: d.avgEnergyAnnual + ' €', src: 'CNMC / Som Energia' },
        { k: 'cures', v: d.carePerActive + ' €/llar', src: 'estimació a partir d\'Idescat' }
      ]
    };
  }

  /* La mateixa simulació a diverses penetracions: per al gràfic del potencial. */
  var PENETRACIONS = [0.01, 0.05, 0.1, 0.25];
  function escala(territori, pens, inp) {
    var t = TERRITORIS[territori] || territori;
    return (pens || PENETRACIONS).map(function (p) {
      return simula(Object.assign({}, inp || {}, { population: t.population, households: t.households, penetration: p }));
    });
  }

  /* Xifres llegibles: 1.234 €, 12,3 M€, 1,2 mil M€. */
  function eur(n, l) {
    var loc = l === 'es' ? 'es-ES' : 'ca-ES';
    if (n >= 1e9) return (n / 1e9).toLocaleString(loc, { maximumFractionDigits: 1 }) + (l === 'es' ? ' mil M€' : ' mil M€');
    if (n >= 1e6) return (n / 1e6).toLocaleString(loc, { maximumFractionDigits: 1 }) + ' M€';
    return Math.round(n).toLocaleString(loc) + ' €';
  }
  function num(n, l) { return Math.round(n).toLocaleString(l === 'es' ? 'es-ES' : 'ca-ES'); }

  /* Barres horitzontals en SVG. `items` = [{lbl, v, txt}]. Els colors són els
     tokens de la pell, així que segueixen el tema de la pàgina. */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function barres(items, op) {
    op = op || {};
    var W = 560, fila = 30, lblW = op.lblW || 190, h = items.length * fila + 6;
    var max = Math.max.apply(null, items.map(function (i) { return i.v; }).concat([1]));
    var color = op.color || 'var(--green)';
    var out = '<svg class="imp-barres" viewBox="0 0 ' + W + ' ' + h + '" width="100%" role="img" aria-label="' + esc(op.titol || '') + '">';
    items.forEach(function (it, i) {
      var y = i * fila + 4, w = Math.max(2, (W - lblW - 110) * it.v / max);
      out += '<text x="' + (lblW - 8) + '" y="' + (y + 17) + '" text-anchor="end" font-size="13" fill="var(--light)">' + esc(it.lbl) + '</text>' +
        '<rect x="' + lblW + '" y="' + (y + 3) + '" width="' + w.toFixed(1) + '" height="20" rx="4" fill="' + (it.color || color) + '"></rect>' +
        '<text x="' + (lblW + w + 6).toFixed(1) + '" y="' + (y + 17) + '" font-size="13" font-weight="600" fill="var(--text)">' + esc(it.txt) + '</text>';
    });
    return out + '</svg>';
  }

  root.Impacte = { DEFAULTS: DEFAULTS, TERRITORIS: TERRITORIS, MODULS: MODULS, PENETRACIONS: PENETRACIONS,
    simula: simula, escala: escala, barres: barres, eur: eur, num: num };
})(typeof window !== 'undefined' ? window : globalThis);
