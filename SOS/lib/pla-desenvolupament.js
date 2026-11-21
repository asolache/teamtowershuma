/* El pla de desenvolupament, una sola peça per a tota la casa (21/11/2026).
   Àlvaro: «cuando tú eres mentor de alguien, tienes que conocer su ikigai, sus
   roles […] su skill para […] tener realmente el plan de desarrollo
   profesional […] cuáles serían las actividades para poder ir certificándose
   […] y poderle ya gestionar un plan de trabajo con […] pomodoro […] con el
   Kanban y luego la contabilidad de valor».

   El camí és sempre el mateix, i cada peça ja existia; aquí només s'ajunten:

     ikigai + rols + nivell  →  el nivell següent  →  les pràctiques que hi
     porten, en l'ordre que més encaixa amb la persona  →  targetes del kanban
     únic (lib/kanban.js), amb pomodoro (lib/pomodoro.js) i comptabilitat de
     valor (només compta el que està validat)

   · **Les pràctiques no són aquí.** Surten de SOS/knowledge/formacio/moduls.json,
     que genera build-certificacio.js des de la guia de certificació. Aquí hi ha
     només la regla per triar-les i ordenar-les.
   · **El nivell següent demana el que diu la guia** (certificacio.html#cami):
     N1, les pràctiques N1 del teu rol; N2, totes les de les àrees A i B fins a
     N2; N3, a més, la docència, enllaçar el node amb un altre i el simulacre de
     caiguda. L'itinerari d'organització (àrea C) té el seu propi certificat.
   · **L'ikigai ordena, no tria.** El que t'agrada i el que fa falta a prop passen
     davant; el que demana el nivell hi és igual. Cada pas diu per què hi és.
   · **Res de dades d'altres persones**: entra el que la persona diu de si
     mateixa i el seu nivell; en surt un pla. Sense xarxa, sense IA.

   Sense dependències. Node (tests) i navegador (window.PlaDesenvolupament). */
(function (g) {
  'use strict';
  var NIVELLS = ['N0', 'N1', 'N2', 'N3'];
  var POMO = 25;
  var T = {
    ca: {
      niv: { N0: 'Exploració', N1: 'Participant certificat/da', N2: 'Gestor/a de node', N3: 'Mentor/a de la xarxa', C: 'Transformació digital de l\'organització' },
      motiu: { agrada: 'Encaixa amb el que t\'agrada: {0}', bo: 'Aprofita el que ja se\'t dona bé: {0}', falta: 'Fa falta a prop: {0}', rol: 'És del teu rol', niv: 'Ho demana el nivell' },
      pas: '{0} · {1} · pràctica', extra: {
        'x-enllac': ['Enllaçar el teu node amb un altre', 'L\'acord d\'intercooperació signat pels dos nodes i la primera sincronització entre tots dos.'],
        'x-simulacre': ['Simulacre de caiguda', 'Un dia sense serveis centrals amb els intercanvis registrats, i la prova que les dues còpies quadren.']
      }
    },
    es: {
      niv: { N0: 'Exploración', N1: 'Participante certificado/a', N2: 'Gestor/a de nodo', N3: 'Mentor/a de la red', C: 'Transformación digital de la organización' },
      motiu: { agrada: 'Encaja con lo que te gusta: {0}', bo: 'Aprovecha lo que ya se te da bien: {0}', falta: 'Hace falta cerca: {0}', rol: 'Es de tu rol', niv: 'Lo pide el nivel' },
      pas: '{0} · {1} · práctica', extra: {
        'x-enllac': ['Enlazar tu nodo con otro', 'El acuerdo de intercooperación firmado por los dos nodos y la primera sincronización entre ambos.'],
        'x-simulacre': ['Simulacro de caída', 'Un día sin servicios centrales con los intercambios registrados, y la prueba de que las dos copias cuadran.']
      }
    }
  };
  function f(s) { var a = arguments; return String(s).replace(/\{(\d)\}/g, function (_, i) { return a[+i + 1] != null ? a[+i + 1] : ''; }); }
  /* Paraules per creuar l'ikigai amb els mòduls: minúscules, sense accents, de
     cinc lletres o més (les curtes ho casen tot). */
  /* I sense les paraules que surten a tot arreu i no diuen res de l'àrea. */
  var BUIDES = {};
  ('persona persones personas comunitat comunidad comunitats comunidades organitzacio organizacion projecte projectes proyecto proyectos ' +
   'entre sobre quien quienes altres otras otros tambe tambien treball trabajo gente').split(' ').forEach(function (w) { BUIDES[w] = 1; });
  function paraules(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .split(/[^a-z0-9]+/).filter(function (w) { return w.length >= 5 && !BUIDES[w]; });
  }
  function seguent(n) { var i = NIVELLS.indexOf(n); return NIVELLS[Math.min(3, Math.max(0, i) + 1)]; }
  function nivellIdx(n) { var i = NIVELLS.indexOf(n); return i < 0 ? 0 : i; }

  /* Què demana el nivell objectiu, segons la guia. */
  function demana(moduls, objectiu, via, rols) {
    var oi = nivellIdx(objectiu);
    if (via === 'organitzacio') return moduls.filter(function (m) { return m.bloc === 'C'; });
    var com = moduls.filter(function (m) { return m.bloc === 'A' || m.bloc === 'B'; });
    if (objectiu === 'N1') {
      var meus = com.filter(function (m) { return nivellIdx(m.nivell) <= 1 && m.rols.some(function (r) { return rols.indexOf(r) >= 0; }); });
      return meus.length ? meus : com.filter(function (m) { return nivellIdx(m.nivell) <= 1; });
    }
    return com.filter(function (m) { return nivellIdx(m.nivell) <= oi; });
  }

  /* El pla. `p`: { nivell, rols:[], fets:[ids], ikigai:{agrada:[],bo:[],falta:[]},
     via:'comunitat'|'organitzacio', horesSetmana, llengua }. `dades`: moduls.json. */
  function pla(p, dades) {
    p = p || {}; var L = p.llengua === 'es' ? 'es' : 'ca', t = T[L];
    var moduls = (dades && dades.moduls) || [], rols = (p.rols || []).slice(), fets = {};
    (p.fets || []).forEach(function (id) { fets[id] = 1; });
    var via = p.via === 'organitzacio' ? 'organitzacio' : 'comunitat';
    var objectiu = via === 'organitzacio' ? 'C' : seguent(p.nivell || 'N0');
    var ik = p.ikigai || {}, claus = {};
    ['agrada', 'bo', 'falta'].forEach(function (q) {
      (ik[q] || []).forEach(function (x) { paraules(x).forEach(function (w) { (claus[w] = claus[w] || []).push({ q: q, x: x }); }); });
    });
    var passos = demana(moduls, objectiu === 'C' ? 'N3' : objectiu, via, rols).filter(function (m) { return !fets[m.id]; }).map(function (m) {
      var text = [m.t.ca, m.t.es, m.rol.ca, m.rol.es, m.practica.ca.p, m.practica.es.p].join(' ');
      var vist = {}, motius = [], punts = 0;
      paraules(text).forEach(function (w) {
        (claus[w] || []).forEach(function (h) {
          if (vist[h.q + h.x]) return; vist[h.q + h.x] = 1;
          punts += h.q === 'falta' ? 3 : 2; motius.push(f(t.motiu[h.q], h.x));
        });
      });
      var delRol = m.rols.some(function (r) { return rols.indexOf(r) >= 0; });
      if (delRol) { punts += 1; motius.push(t.motiu.rol); }
      if (!motius.length) motius.push(t.motiu.niv);
      return { id: m.id, n: m.n, bloc: m.bloc, nivell: m.nivell, titol: m.t[L], rol: m.rol[L], hores: m.hores, horesText: m.horesText,
        pomodoros: Math.ceil(m.hores * 60 / POMO), practica: m.practica[L].p, evidencia: m.practica[L].e, ia: m.practica[L].ia,
        motius: motius.slice(0, 3), punts: punts, delRol: delRol };
    });
    passos.sort(function (a, b) { return (b.punts - a.punts) || (nivellIdx(a.nivell) - nivellIdx(b.nivell)) || (a.n - b.n); });
    if (objectiu === 'N3') ['x-enllac', 'x-simulacre'].forEach(function (id) {
      if (fets[id]) return;
      var e = t.extra[id];
      passos.push({ id: id, n: 0, bloc: '', nivell: 'N3', titol: e[0], rol: '', hores: 4, horesText: '4 h', pomodoros: Math.ceil(240 / POMO),
        practica: e[0], evidencia: e[1], ia: '', motius: [t.motiu.niv], punts: 0, delRol: false });
    });
    var hores = passos.reduce(function (s, x) { return s + x.hores; }, 0);
    var hs = +p.horesSetmana > 0 ? +p.horesSetmana : 3;
    return { objectiu: objectiu, objectiuNom: t.niv[objectiu], via: via, passos: passos, hores: Math.round(hores * 10) / 10,
      pomodoros: passos.reduce(function (s, x) { return s + x.pomodoros; }, 0), setmanes: Math.ceil(hores / hs), horesSetmana: hs };
  }

  /* Del pla al kanban únic: una targeta per pràctica, de tipus formació, amb
     l'evidència com a entregable (és la prova que demana «Fet»). L'id és estable
     (pd-m3) perquè tornar a fer el pla no dupliqui res. */
  function targetes(pl, o) {
    o = o || {}; var L = o.llengua === 'es' ? 'es' : 'ca', avui = new Date().toISOString().slice(0, 10);
    return (pl && pl.passos || []).map(function (x) {
      return { id: 'pd-' + x.id, col: 'todo', tipus: 'formacion', qui: o.qui || '', creat: avui,
        text: x.n ? f(T[L].pas, x.n, x.titol) : x.titol, entregable: x.evidencia,
        origen: { tipus: 'modul', id: x.id, nom: x.titol } };
    });
  }
  /* Afegeix al tauler les que no hi són (ni s'han tret): el que ja està en marxa
     no es toca. */
  function afegeix(kanban, cards) {
    var k = { cards: (kanban && kanban.cards || []).slice(), fora: (kanban && kanban.fora || []).slice() }, hi = {};
    k.cards.forEach(function (c) { hi[c.id] = 1; }); k.fora.forEach(function (x) { hi[x] = 1; });
    (cards || []).forEach(function (c) { if (!hi[c.id]) { k.cards.push(c); hi[c.id] = 1; } });
    return k;
  }

  /* ── Importar skills (tipus LinkedIn) ─────────────────────────────────────
     Àlvaro, 21/11: «un parser de los skills de LinkedIn a partir de su
     currículum o de su lista de skills que estén validadas por personas de su
     red». Sense entrar a LinkedIn ni demanar-hi contrasenyes: la persona hi
     descarrega les seves dades (Configuració → Privadesa de dades → Obtén una
     còpia de les teves dades) i ens dona el fitxer, o enganxa el text.
     · `Skills.csv` → una skill per fila (columna Name).
     · `Endorsement_Received_Info.csv` → quantes persones de la seva xarxa han
       validat cada skill. **Dels qui validen només es compta quants són**: els
       noms són dades d'altres persones i no es guarden.
     · Text enganxat de l'apartat Aptituds / Skills del perfil o del CV, amb les
       línies «12 validaciones», «12 endorsements», «Validado por X y 11 más».
     Torna { font, skills: [{ label, validacions }] }, de més validada a menys.
     Res s'afegeix sol: qui ho crida ho proposa i la persona accepta. */
  function csvFiles(text) {
    var rows = [], row = [], cel = '', q = false, sep = /;/.test(String(text).split(/\r?\n/)[0]) && !/,/.test(String(text).split(/\r?\n/)[0]) ? ';' : ',';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { cel += '"'; i++; } else q = false; } else cel += ch; continue; }
      if (ch === '"') q = true; else if (ch === sep) { row.push(cel); cel = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cel); rows.push(row); row = []; cel = ''; }
      else cel += ch;
    }
    if (cel || row.length) { row.push(cel); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return c.trim(); }); });
  }
  var SOROLL = /^(mostra|mostrar|show|ver |veure|see |validad[oa] por|validat per|endorsed by|aval|recomana|\d+\s|aptitudes$|skills$|habilitats$|competencias$|compet[eè]ncies$|top skills|aptitudes principales|·|•|-+$)/i;
  var VALID = /(\d+)\s*(?:\+\s*)?(endorsements?|validaciones|validacions|validaci[oó]n|validaci[oó]|avals?|recomendaciones|aptitud validada)/i;
  var VALID_PER = /(?:endorsed by|validad[oa] por|validat per)\s+.+?\s+(?:and|y|i)\s+(\d+)\s+/i;
  function importaSkills(text) {
    text = String(text || '').replace(/^﻿/, '');
    var per = {}, ordre = [];
    function posa(label, n) {
      label = String(label || '').replace(/\s+/g, ' ').trim().slice(0, 80);
      if (label.length < 2) return;
      var k = label.toLowerCase();
      if (!per[k]) { per[k] = { label: label, validacions: 0 }; ordre.push(k); }
      per[k].validacions += n || 0;
    }
    var font = 'text', linies = text.split(/\r?\n/), cap = (linies[0] || '').toLowerCase();
    if (/skill name/.test(cap) && /endorse/.test(cap)) {
      font = 'validacions-csv';
      var rs = csvFiles(text), h = rs[0].map(function (c) { return c.trim().toLowerCase(); });
      var iS = h.indexOf('skill name'), iE = h.indexOf('endorsement status');
      rs.slice(1).forEach(function (r) { if (iE >= 0 && r[iE] && !/accept|visible/i.test(r[iE])) return; posa(r[iS], 1); });
    } else if (/^"?name"?\s*$/.test(cap.trim()) || /^"?(name|skill|skills)"?[,;]/.test(cap.trim())) {
      font = 'skills-csv';
      csvFiles(text).slice(1).forEach(function (r) { posa(r[0], 0); });
    } else {
      var ant = null;
      linies.forEach(function (l) {
        var t = l.trim(); if (!t) return;
        var m = VALID.exec(t) || VALID_PER.exec(t);
        if (m && ant) { per[ant].validacions = Math.max(per[ant].validacions, +m[1] + (VALID_PER.test(t) ? 1 : 0)); return; }
        if (t.length > 60 || /[.:!?]$/.test(t) || SOROLL.test(t) || /^\d+$/.test(t)) { ant = null; return; }
        t.split(/\s*[·•|,]\s*/).forEach(function (x) { if (x && x.length <= 60) { posa(x, 0); ant = x.replace(/\s+/g, ' ').trim().toLowerCase(); } });
      });
      if (!/(aptitud|skills|habilitat|competenc|endorse|validaci)/i.test(text)) font = 'llista';
    }
    var skills = ordre.map(function (k) { return per[k]; }).filter(function (x) { return !SOROLL.test(x.label); });
    skills.sort(function (a, b) { return b.validacions - a.validacions; });
    return { font: font, skills: skills.slice(0, 80) };
  }

  var API = { NIVELLS: NIVELLS, POMO: POMO, T: T, paraules: paraules, seguent: seguent, pla: pla, targetes: targetes, afegeix: afegeix, importaSkills: importaSkills };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else g.PlaDesenvolupament = API;
})(typeof window !== 'undefined' ? window : this);
