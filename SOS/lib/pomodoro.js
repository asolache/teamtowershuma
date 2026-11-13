/* El pomodoro, una sola vegada per a tota la casa (13/11/2026).
   Àlvaro: «retomar dentro de las metodologías la integración del pomodoro que
   ya hemos integrado en SOS». Vivia dins de SOS/index.html (Veda 145); ara el
   fan servir l'app del SOS i el tauler de tasques de /cliente/ des d'aquí.

   Les tres decisions de sempre, que són el que el fa d'aquesta casa:
   · **Un de sol a la vegada.** Dos comptadors alhora són dues mentides.
   · **Viu al navegador i no al registre.** Un pomodoro a mitges no és cap fet:
     el que es desa al registre és el temps fet, quan la persona ho confirma.
   · **Es desa l'hora d'acabar (`fi`), no els minuts que falten.** Si el mòbil
     s'adorm, el temporitzador s'atura però l'hora d'acabar segueix sent certa.

   I la que el separa d'un giny qualsevol: **en acabar, s'ofereix apuntar el
   temps**, no una felicitació. Això ho fa qui el fa servir (renderPomo al SOS,
   tauler-tasques.js a /cliente/); aquí només hi ha el rellotge i la memòria.

   Sense dependències; es pot fer servir des del node (tests) i des del navegador. */
(function (g) {
  'use strict';
  var MIN = 25;
  function ls() { try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (e) { return null; } }
  /* Cada app té la seva clau (el SOS, 'tt.pomo'; /cliente/, 'tt.cliente.pomo'). */
  function llegeix(clau) {
    var s = ls(); if (!s) return null;
    try { var d = JSON.parse(s.getItem(clau) || 'null'); return d && d.fi ? d : null; } catch (e) { return null; }
  }
  function desa(clau, p) {
    var s = ls(); if (!s) return;
    try { if (p) s.setItem(clau, JSON.stringify(p)); else s.removeItem(clau); } catch (e) { /* sense memòria */ }
  }
  /* Segons que falten. Negatiu vol dir que ja s'ha acabat i encara no s'ha
     tancat, que és un estat legítim: has estat fora i el trobes esperant. */
  function resta(p, ara) { return p ? Math.round((p.fi - (ara || Date.now())) / 1000) : 0; }
  function rellotge(s) {
    var v = Math.max(0, Math.round(s) || 0);
    return String(Math.floor(v / 60)).padStart(2, '0') + ':' + String(v % 60).padStart(2, '0');
  }
  /* Un de nou substitueix el que hi havia. `dades` és el que l'app vulgui
     recordar (quina tasca, quin node…). */
  function comenca(clau, dades, mins, ara) {
    var m = +mins > 0 ? +mins : MIN, t = ara || Date.now();
    var p = Object.assign({}, dades || {}, { min: m, ini: t, fi: t + m * 60000 });
    desa(clau, p);
    return p;
  }
  /* Els minuts fets de debò: si l'acabes abans, els que han passat; si l'has
     deixat esperant, els que tocaven i prou (el temps de fora no és feina). */
  function fets(p, ara) {
    if (!p) return 0;
    var t = ara || Date.now(), ini = p.ini || (p.fi - p.min * 60000);
    return Math.max(1, Math.min(p.min, Math.round((t - ini) / 60000)));
  }
  var API = { MIN: MIN, llegeix: llegeix, desa: desa, resta: resta, rellotge: rellotge, comenca: comenca, fets: fets };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else g.Pomodoro = API;
})(typeof window !== 'undefined' ? window : this);
