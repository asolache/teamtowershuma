/* La pinya d'un mapa de valor
 * ─────────────────────────────────────────────────────────────────────────────
 * Cada node del mapa és un pilar de la pinya i obre quatre rengles: una primera
 * mà, un vent i dos laterals. Un lliurament és un **vent** quan l'altre li torna
 * en una mena diferent (una mà a cada pilar, aguantant coses diferents); la
 * resta, si és tangible, **primera mà**, i si no, **lateral**. Un pilar sense
 * cap vent és un silo, i el que en rep més dels que caben, un pilar carregat.
 *
 * La regla és una de sola. La fan servir `SOS/tools/build-castells.js` (les
 * pàgines del castell) i la lent «Torre» del mapa de l'app (`lib/lents.js`).
 *
 *   Pinya.linia(f, fl)        'vent' | 'primera' | 'lateral'   f = {de, a, mena, torna?}
 *   Pinya.llegeix(nodes, fl)  { pilars, obertes, ocupades, sols, carregats }
 *
 * `torna` és la mena amb què respon l'altre quan ja se sap (un parell del cas);
 * si no hi és, es busca a `fl` qualsevol lliurament en sentit contrari.
 */
(function (arrel) {
  var MENES = ['primera', 'vent', 'lateral'];
  /* Les posicions que obre un sol pilar. És el denominador de tota la lectura. */
  var TE = { primera: 1, vent: 1, lateral: 2 };

  function linia(f, fl) {
    var torna = f.torna !== undefined ? [f.torna]
      : (fl || []).filter(function (g) { return g.de === f.a && g.a === f.de; }).map(function (g) { return g.mena; });
    if (torna.some(function (m) { return m !== f.mena; })) return 'vent';
    return f.mena === 'tangible' ? 'primera' : 'lateral';
  }

  function llegeix(nodes, fl) {
    fl.forEach(function (f) { f.linia = linia(f, fl); });
    var pilars = nodes.map(function (node) {
      var rep = fl.filter(function (f) { return f.a === node.id; }), per = {};
      MENES.forEach(function (m) { per[m] = rep.filter(function (f) { return f.linia === m; }); });
      return { node: node, rebuts: rep, per: per, te: TE };
    });
    var carregats = [];
    pilars.forEach(function (p) {
      MENES.forEach(function (m) { if (p.per[m].length > TE[m]) carregats.push({ pilar: p, mena: m, quants: p.per[m].length }); });
    });
    return {
      pilars: pilars,
      obertes: 4 * nodes.length,
      ocupades: pilars.reduce(function (a, p) {
        return a + MENES.reduce(function (b, m) { return b + Math.min(p.per[m].length, TE[m]); }, 0);
      }, 0),
      /* Els pilars que no tenen cap vent: àrees que no toquen cap altra àrea. */
      sols: pilars.filter(function (p) { return !p.per.vent.length; }),
      carregats: carregats
    };
  }

  var Pinya = { MENES: MENES, TE: TE, linia: linia, llegeix: llegeix };
  if (typeof module === 'object' && module.exports) module.exports = Pinya;
  else arrel.Pinya = Pinya;
})(this);
