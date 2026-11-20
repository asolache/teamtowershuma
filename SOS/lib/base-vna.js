/* La base única de mapes de valor · llegir-la (15/11/2026).
   L'Àlvar: «que no lo tenga que hacer, que realmente la clavemos con lo que le
   vayamos a enseñar y tenga que ir validando… le pones ya las piezas y él las
   mete en el tablero».

   Les dades són a SOS/knowledge/vna/base.json (les genera
   SOS/tools/build-base-vna.js de totes les fonts: models, sectors i oficis de
   models-mapa.js, els oficis generats, els dominis i sectors del SOS antic i
   els casos del banc). Aquí només hi ha com llegir-la, sense IA ni xarxa:
     · tria(base, text, n)    les peces que més s'assemblen al que diu la persona
     · peces(peça)            el mapa d'una peça, en parells del motor
                              (mapa-valor.js), cada un amb la seva capa
     · capa(que, tipus)       la capa (kosha) d'un intercanvi
     · forats(base, peça, m)  el que la peça sap i el mapa de la persona no té:
                              rols, intangibles i capes buides
   Les cinc capes són les del codex (codex-sintesi.md), de la més densa a la
   més subtil. Una sola llista: la fan servir la base, el generador i la web.
   Navegador: window.BaseVna. Node: require(). */
(function (g) {
'use strict';

var CAPES = [
  { id: 'cos', kosha: 'annamaya', nom: { ca: 'Cos', es: 'Cuerpo' }, diu: { ca: 'el que es lliura', es: 'lo que se entrega' }, pregunta: { ca: 'Què lliures tu, i què et lliuren?', es: '¿Qué entregas tú, y qué te entregan?' } },
  { id: 'energia', kosha: 'pranamaya', nom: { ca: 'Energia', es: 'Energía' }, diu: { ca: 'el que circula: diners, temps', es: 'lo que circula: dinero, tiempo' }, pregunta: { ca: 'Qui et paga, o et dona el seu temps, i a canvi de què?', es: '¿Quién te paga, o te da su tiempo, y a cambio de qué?' } },
  { id: 'ment', kosha: 'manomaya', nom: { ca: 'Ment', es: 'Mente' }, diu: { ca: 'el que se sap: informació, avís, saber fer', es: 'lo que se sabe: información, aviso, saber hacer' }, pregunta: { ca: 'Qui t\'avisa, t\'ensenya o t\'explica el que passa?', es: '¿Quién te avisa, te enseña o te cuenta lo que pasa?' } },
  { id: 'discerniment', kosha: 'vijnanamaya', nom: { ca: 'Discerniment', es: 'Discernimiento' }, diu: { ca: 'el que és de fiar: confiança, criteri, decisió', es: 'lo que es de fiar: confianza, criterio, decisión' }, pregunta: { ca: 'Qui es refia de tu, et recomana o t\'ajuda a decidir?', es: '¿Quién se fía de ti, te recomienda o te ayuda a decidir?' } },
  { id: 'proposit', kosha: 'anandamaya', nom: { ca: 'Propòsit', es: 'Propósito' }, diu: { ca: 'per a què: sentit, pertinença, identitat', es: 'para qué: sentido, pertenencia, identidad' }, pregunta: { ca: 'Qui comparteix amb tu el per a què, i què hi troba?', es: '¿Quién comparte contigo el para qué, y qué encuentra en ello?' } }
];

var norm = function (s) { return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); };
var BUIDES = ' de del la las los el els les un una uns unes y i o a al en per para por con amb sin sense que qui su sus seu seva tu teu the of and to for '.split(' ');
var paraules = function (s) { return norm(s).split(' ').filter(function (w) { return w.length > 2 && BUIDES.indexOf(w) < 0; }); };

/* Arrels (sense accents) per capa. Es miren de la més subtil a la més densa:
   «confiança per tornar a comprar» és discerniment, no energia. */
var ARRELS = {
  proposit: ['sentit', 'sentido', 'proposit', 'proposito', 'pertinen', 'identit', 'identid', 'orgull', 'orgullo', 'ilusi', 'il lusi', 'vocaci', 'valors', 'valores', 'missio', 'mision', 'relat', 'comunitat', 'comunidad', 'arrel', 'raices', 'cultura', 'memoria', 'inspiraci', 'motivaci', 'benestar', 'bienestar', 'cura', 'cuidado', 'acollida', 'acogida'],
  discerniment: ['confian', 'criteri', 'criterio', 'decisi', 'validaci', 'reputaci', 'garanti', 'consell', 'consejo', 'recomana', 'recomienda', 'recomendaci', 'aval', 'prestigi', 'acord', 'acuerdo', 'compromis', 'compromiso', 'fidelitat', 'fidelidad', 'lleialtat', 'lealtad', 'seguretat', 'seguridad', 'tranquil', 'credibil', 'legitim', 'opini', 'resena', 'ressenya', 'boca'],
  ment: ['informaci', 'dades', 'datos', 'coneixement', 'conocimiento', 'saber', 'formaci', 'avis', 'aviso', 'feedback', 'idea', 'informe', 'aprenentatge', 'aprendizaje', 'contacte', 'contacto', 'xarxa', 'red ', 'novetat', 'novedad', 'tendenc', 'context', 'pregunta', 'dubte', 'duda', 'experiencia', 'expertesa', 'tecnic', 'metode', 'metodo', 'visibilitat', 'visibilidad', 'difusi', 'comunicaci'],
  energia: ['pagament', 'pago', 'diners', 'dinero', 'quota', 'cuota', 'factura', 'preu', 'precio', 'cobra', 'ingres', 'subvenci', 'financ', 'patrocin', 'donaci', 'inversi', 'temps', 'tiempo', 'hores', 'horas', 'dedicaci', 'voluntari', 'comissi', 'comision', 'compra', 'venda', 'venta', 'reserva', 'senyal']
};

function capa(que, tipus) {
  var t = ' ' + norm(que) + ' ';
  var te = function (k) { return ARRELS[k].some(function (a) { return t.indexOf(a) >= 0; }); };
  if (te('proposit')) return 'proposit';
  if (te('discerniment')) return 'discerniment';
  if (tipus === 'tangible' && te('energia')) return 'energia';
  if (te('ment')) return 'ment';
  if (te('energia')) return 'energia';
  return tipus === 'intangible' ? 'ment' : 'cos';
}

/* Les peces que més s'assemblen: punts per paraula clau trobada al text, més
   per les del nom. Un ofici o un domini (específics) passen davant d'un sector
   quan empaten. */
var PES = { ofici: 1.2, domini: 1.15, model: 1, sector: 0.9, 'sector-antic': 0.8 };
/* Una paraula que diuen moltes peces («barri», «client») pesa menys que una
   que només en diu una («futbol»): el pes és 1 / nombre de peces que la porten. */
function df(base) {
  if (base._df) return base._df;
  var d = {};
  (base.peces || []).forEach(function (p) { var vist = {}; (p.paraules || []).forEach(function (k) { var kk = norm(k); if (!vist[kk]) { vist[kk] = 1; d[kk] = (d[kk] || 0) + 1; } }); });
  try { Object.defineProperty(base, '_df', { value: d, enumerable: false }); } catch (e) {}
  return d;
}
function tria(base, text, n) {
  var t = ' ' + norm(text) + ' ', w = paraules(text), d = df(base);
  if (!w.length) return [];
  var r = [];
  (base.peces || []).forEach(function (p) {
    var punts = 0, vist = {};
    (p.paraules || []).forEach(function (k) { var kk = norm(k); if (vist[kk] || kk.length < 3 || BUIDES.indexOf(kk) >= 0 || t.indexOf(' ' + kk) < 0) return; vist[kk] = 1; punts += (kk.indexOf(' ') > 0 ? 2 : 1) * Math.max(0.25, 1 / Math.sqrt(d[kk] || 1)); });
    paraules(p.nom).forEach(function (k) { if (w.indexOf(k) >= 0) punts += 0.5; });
    if (punts > 0) r.push({ id: p.id, tipus: p.tipus, nom: p.nom, punts: Math.round(punts * (PES[p.tipus] || 1) * 100) / 100 });
  });
  return r.sort(function (a, b) { return b.punts - a.punts; }).slice(0, n || 5);
}

var troba = function (base, id) { return (base.peces || []).filter(function (p) { return p.id === id; })[0] || null; };

/* El mapa d'una peça en parells [qui dona, qui rep, tipus, què, tipus, què torna]
   (el format de models-mapa.js i del motor), cada un amb la capa d'anada i de tornada. */
function peces(p) {
  if (!p) return null;
  return { id: p.id, nom: p.nom, centre: p.centre || null, rols: (p.rols || []).map(function (r) { return r.nom; }),
    parells: (p.intercanvis || []).map(function (x) { return { parell: x, capes: [capa(x[3], x[2]), capa(x[5], x[4])] }; }),
    intangibles: p.intangibles || [], preguntes: p.preguntes || [], sops: p.sops || [] };
}

/* Semblança entre dos noms: la part de paraules de l'un que són a l'altre. */
function sembla(a, b) {
  var x = paraules(a), y = paraules(b);
  if (!x.length || !y.length) return 0;
  var c = x.filter(function (k) { return y.some(function (q) { return q === k || (k.length > 4 && q.length > 4 && (q.indexOf(k.slice(0, 5)) === 0 || k.indexOf(q.slice(0, 5)) === 0)); }); }).length;
  return c / Math.min(x.length, y.length);
}

/* El que la peça sap i el mapa no té. `m` és el mapa de la persona:
   { roles: [nom…], pairs: [[da, rep, tipus, què, tipus, torna]…] }. */
function forats(base, idOPeça, m) {
  var p = typeof idOPeça === 'string' ? troba(base, idOPeça) : idOPeça;
  if (!p) return null;
  m = m || {};
  var rols = (m.roles || []).map(function (r) { return typeof r === 'string' ? r : r.nom || r.name || ''; });
  var pairs = m.pairs || [];
  var que = []; pairs.forEach(function (x) { que.push(x[3] || ''); que.push(x[5] || ''); });
  var falten = (p.rols || []).filter(function (r) { return !rols.some(function (q) { return sembla(r.nom, q) >= 0.5; }); }).map(function (r) { return r.nom; });
  var intang = (p.intangibles || []).filter(function (i) { return !que.some(function (q) { return sembla(i, q) >= 0.5; }); });
  var te = {}; pairs.forEach(function (x) { te[capa(x[3], x[2])] = 1; te[capa(x[5], x[4])] = 1; });
  var buides = CAPES.filter(function (c) { return !te[c.id]; }).map(function (c) { return c.id; });
  return { peça: p.id, rols: falten, intangibles: intang, capesBuides: buides, complet: !falten.length && !intang.length && !buides.length };
}

var BaseVna = { CAPES: CAPES, capa: capa, tria: tria, troba: troba, peces: peces, forats: forats, sembla: sembla, norm: norm };
if (typeof module !== 'undefined' && module.exports) module.exports = BaseVna; else g.BaseVna = BaseVna;
})(typeof window !== 'undefined' ? window : this);
