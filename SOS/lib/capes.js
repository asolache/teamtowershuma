/* Les cinc capes · el nom de cada una, en un sol lloc (veda 188, 24/11/2026).
   L'Álvaro: «en todas las páginas donde salen las 5 capas pongamos siempre la
   palabra comprensible… y que se pueda ver la multidimensionalidad de forma
   comprensible para todo el mundo».

   Cada capa es diu amb una paraula de tothom (Cos, Energia, Ment, Criteri,
   Propòsit). El nom sànscrit (`s`) és l'origen i només surt on s'explica
   d'on vénen les capes (cervell.html, «D'on surten les capes»). Les vistes,
   els panells i els mapes en llegeixen la paraula d'aquí: pla.js, vista.js,
   franja.js, explora.js, exporta.js i base-vna.js. «Criteri» i no
   «Discerniment», més planer (22/10/2026).
   Navegador: window.Capes. Node: require(). */
(function (g) {
'use strict';
var CAPES = [
  { id: 'anna', s: 'Annamaya', nom: { ca: 'Cos', es: 'Cuerpo' } },
  { id: 'prana', s: 'Pranamaya', nom: { ca: 'Energia', es: 'Energía' } },
  { id: 'mano', s: 'Manomaya', nom: { ca: 'Ment', es: 'Mente' } },
  { id: 'vijnana', s: 'Vijnanamaya', nom: { ca: 'Criteri', es: 'Criterio' } },
  { id: 'ananda', s: 'Anandamaya', nom: { ca: 'Propòsit', es: 'Propósito' } }
];
var LLENGUES = ['ca', 'es'];
var llengua = function (ll) { ll = String(ll || 'ca').slice(0, 2); return LLENGUES.indexOf(ll) >= 0 ? ll : 'es'; };
/* La capa per id curt (anna) o pel nom de la kosha (annamaya). */
var de = function (k) { k = String(k || '').toLowerCase(); return CAPES.filter(function (c) { return c.id === k || c.s.toLowerCase() === k; })[0] || null; };
/* La paraula de tothom d'una capa, en la llengua de la pàgina. */
var nom = function (k, ll) { var c = de(k); return c ? c.nom[llengua(ll)] : ''; };
/* { anna: 'Cos', prana: 'Energia', … } */
var paraules = function (ll) { var o = {}; CAPES.forEach(function (c) { o[c.id] = c.nom[llengua(ll)]; }); return o; };
var Capes = { CAPES: CAPES, LLENGUES: LLENGUES, de: de, nom: nom, paraules: paraules };
if (typeof module !== 'undefined' && module.exports) module.exports = Capes; else g.Capes = Capes;
})(typeof window !== 'undefined' ? window : this);
