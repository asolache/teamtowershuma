/* ══ AIGUA · el que gasta una llar, el que s'estalvia i el que perd la xarxa ══
   21/11/2026 · Álvaro: «cuando estuvimos hablando de lo del agua, no se hizo
   ninguna página». El SOS tenia l'energia, la compra i el banc de temps, i
   l'aigua només sortia a la visió com a «pròximament».

   **Una sola peça** (regla DRY del 17/10, veda 71) per a:
   · `SOS/aigua.html`, la pantalla de la comunitat de l'aigua;
   · el simulador de la visió (`lib/impacte.js`, `visio.html#estalvi`), que en
     pot llegir `perLlar()` en lloc d'escriure una altra xifra;
   · Boreal Light i qualsevol projecte fill, que l'hereten amb
     `node ../teamtowershuma/SOS/tools/cervell.js --actualitza .`
     (`knowledge/cervell/heretat.json` → `herramientas/lib/aigua.js`). No es copia.

   La regla de sempre (veda 61): **cap xifra sense font i cap estimació dita com
   si fos comptabilitat.** Per això aquí hi ha poques xifres:
   · el consum mitjà de les llars i les pèrdues de la xarxa, de l'INE;
   · el sostre d'estalvi d'equips eficients, de la prova de l'OCU, que és un
     escenari de prova i es diu així, no un estalvi garantit.
   L'estalvi d'un grup **es mesura** amb dues lectures del comptador, abans i
   després; no s'estima. I els euros només surten si qui ho fa servir hi posa
   el preu del m³ de la seva factura: aquesta peça no publica cap preu. */
(function (root) {
  'use strict';

  var FONTS = {
    ine2024: {
      nom: 'INE, Estadística sobre el Suministro y Saneamiento del Agua. Año 2024 (nota de premsa del 2/7/2026)',
      url: 'https://ine.es/dyngs/Prensa/ESSA2024.htm'
    },
    ocu2024: {
      nom: 'OCU, «Reductores de caudal y economizadores de agua» (2/2/2024), escenari de prova',
      url: 'https://www.ocu.org/vivienda-y-energia/equipamiento-hogar/consejos/reductores-de-caudal-para-ahorrar-agua'
    },
    trla: {
      nom: 'Text refós de la Llei d\'Aigües (RDL 1/2001), art. 81: comunitats d\'usuaris',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2001-14276'
    },
    rd3_2023: {
      nom: 'Reial decret 3/2023, criteris tècnico-sanitaris de l\'aigua de consum',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2023-628'
    }
  };

  /* El consum mitjà de les llars, en litres per habitant i dia (INE, 2024). */
  var REFERENCIES = {
    catalunya: { ca: 'Catalunya', es: 'Cataluña', lpd: 100, any: 2024, font: 'ine2024' },
    espanya: { ca: 'Espanya', es: 'España', lpd: 128, any: 2024, font: 'ine2024' }
  };

  /* Les pèrdues reals de les xarxes de distribució: 624 hm³, el 14,6 % de
     l'aigua subministrada (INE, 2024). És la mitjana estatal: la de cada xarxa
     es mesura comparant el que entra amb el que marquen els comptadors. */
  var PERDUES_XARXA = { pct: 0.146, any: 2024, font: 'ine2024' };

  /* El sostre d'estalvi amb equips eficients a aixetes, dutxa i cisterna de
     doble descàrrega: un 51 % a l'escenari de prova de l'OCU, sobre els usos
     que aquests equips toquen. No és una promesa: l'estalvi real es mesura. */
  var SOSTRE_EQUIPS = { pct: 0.51, font: 'ocu2024' };

  function n(x) { x = Number(x); return isFinite(x) && x > 0 ? x : 0; }

  /* Litres per persona i dia a partir de la factura: m³ i dies del període. */
  function lpdDeFactura(m3, dies, persones) {
    var p = n(persones), d = n(dies);
    if (!p || !d) return 0;
    return Math.round(n(m3) * 1000 / d / p);
  }

  /* El consum d'una llar a l'any, en m³, amb el seu consum o la referència. */
  function anualLlar(persones, lpd) {
    return Math.round(n(persones) * n(lpd) * 365 / 1000 * 10) / 10;
  }

  /* L'estalvi mesurat: dues lectures del comptador, abans i després, en
     períodes de la mateixa durada. Si s'hi posa el preu del m³ de la factura,
     torna també els euros; si no, `eur` és null. */
  function mesurat(abans, despres, preuM3) {
    var a = n(abans), d = n(despres);
    var m3 = Math.round((a - d) * 10) / 10;
    var pct = a ? Math.round((a - d) / a * 1000) / 10 : 0;
    var p = n(preuM3);
    return { m3: m3, pct: pct, eur: p ? Math.round(m3 * p * 100) / 100 : null };
  }

  /* La suma del grup: cada llar amb {abans, despres}. */
  function grup(llars, preuM3) {
    var a = 0, d = 0, amb = 0;
    (llars || []).forEach(function (l) {
      if (n(l.abans) && n(l.despres)) { a += n(l.abans); d += n(l.despres); amb++; }
    });
    var r = mesurat(a, d, preuM3);
    r.llars = amb;
    return r;
  }

  /* Les pèrdues d'una xarxa comunitària: el que entra menys el que marquen
     els comptadors de les llars. */
  function perdues(entrada, comptadors) {
    var e = n(entrada), c = n(comptadors);
    if (!e) return { m3: 0, pct: 0 };
    return { m3: Math.round((e - c) * 10) / 10, pct: Math.round((e - c) / e * 1000) / 10 };
  }

  /* Per al simulador de la visió: m³ per llar i any al sostre d'equips i al
     percentatge que el grup hagi mesurat. Volum, no euros. */
  function perLlar(op) {
    op = op || {};
    var ref = REFERENCIES[op.territori || 'catalunya'] || REFERENCIES.catalunya;
    var base = anualLlar(op.persones || 2.5, op.lpd || ref.lpd);
    var pct = op.pct != null ? Math.max(0, Math.min(1, Number(op.pct))) : SOSTRE_EQUIPS.pct;
    return { m3Any: base, estalviM3: Math.round(base * pct * 10) / 10, pct: pct,
      font: FONTS[ref.font], nota: op.pct != null ? 'mesurat pel grup' : 'sostre de la prova de l\'OCU' };
  }

  root.Aigua = { FONTS: FONTS, REFERENCIES: REFERENCIES, PERDUES_XARXA: PERDUES_XARXA, SOSTRE_EQUIPS: SOSTRE_EQUIPS,
    lpdDeFactura: lpdDeFactura, anualLlar: anualLlar, mesurat: mesurat, grup: grup, perdues: perdues, perLlar: perLlar };
})(typeof window !== 'undefined' ? window : globalThis);
