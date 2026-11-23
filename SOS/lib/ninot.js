/* El ninot casteller · un sol dibuix per a tots els taulers
 * ─────────────────────────────────────────────────────────────────────────────
 * El muñequito que l'Àlvaro va demanar el 16/11/2026 per a la colla en la pinya
 * (`lib/colla-taulers.js`) i que ara també fa servir el castell de la portada
 * (`lib/castell-colla.js`). Es dibuixa aquí i enlloc més (veda 71).
 *
 *   Ninot(X, Y, s, tipus, col, attrs)  → '<g …>…</g>'   a peu dret a (X, Y)
 *   tipus: 'ple' (algú hi és), 'teoric' (el lloc que cal), 'forat' (hi falta algú)
 */
(function (arrel) {
  'use strict';
  function f1(x) { return Math.round(x * 10) / 10; }
  function Ninot(X, Y, s, tipus, col, attrs) {
    var w = 11 * s, h = 24 * s, cap = 5.2 * s;
    var st = tipus === 'ple' ? 'fill="' + col + '" stroke="var(--text)" stroke-width="' + f1(0.6 * s) + '"'
      : 'fill="none" stroke="' + col + '" stroke-width="' + f1(1.1 * s) + '" stroke-dasharray="' + f1(2.5 * s) + ' ' + f1(2 * s) + '"';
    return '<g class="ct-n ct-' + tipus + '" ' + (attrs || '') + '>'
      + '<ellipse cx="' + f1(X) + '" cy="' + f1(Y) + '" rx="' + f1(w * 0.75) + '" ry="' + f1(w * 0.32) + '" class="ct-ombra"/>'
      + '<rect x="' + f1(X - w / 2) + '" y="' + f1(Y - h * 0.45) + '" width="' + f1(w) + '" height="' + f1(h * 0.45) + '" rx="' + f1(s) + '" ' + st + '/>'
      + '<rect x="' + f1(X - w / 2 - s) + '" y="' + f1(Y - h * 0.86) + '" width="' + f1(w + 2 * s) + '" height="' + f1(h * 0.42) + '" rx="' + f1(1.6 * s) + '" ' + st + '/>'
      + '<circle cx="' + f1(X) + '" cy="' + f1(Y - h * 0.86 - cap * 0.9) + '" r="' + f1(cap) + '" ' + (tipus === 'ple' ? 'fill="var(--gold)" stroke="var(--text)" stroke-width="' + f1(0.6 * s) + '"' : st) + '/>'
      + '<rect x="' + f1(X - 1.8 * s) + '" y="' + f1(Y - h * 0.86 - cap * 2.2) + '" width="' + f1(3.6 * s) + '" height="' + f1(1.6 * s) + '" ' + (tipus === 'ple' ? 'fill="var(--gold)"' : st) + '/>'
      + '</g>';
  }
  if (typeof module === 'object' && module.exports) module.exports = Ninot;
  else arrel.Ninot = Ninot;
})(this);
