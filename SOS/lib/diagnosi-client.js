/* El primer diagnòstic d'un client web · de la seva primera frase al mapa
   ─────────────────────────────────────────────────────────────────────────
   Demanat per l'Àlvar (21/10/2026), amb la María d'ELE Barcelona: que el
   client entri a /cliente/, es faci el seu compte, escrigui què vol (el seu
   «prompt» inicial) i el diagnòstic li tregui les respostes que necessitem per
   validar els fluxos del primer mapa de valor i prototipar la web mínima.

   Aquí es declaren un sol cop:
     · PREGUNTES  les preguntes, en paraules del client. Cada una diu a quina
                  passa del mètode alimenta (`passa`) i què en fem (`per`).
     · prompt()   el text que el client enganxa a la seva IA (Claude, ChatGPT…)
                  amb la seva frase i la seva web, perquè li contesti les
                  preguntes i li proposi qui hi ha al voltant, en un JSON fix.
     · llegeix()  el JSON de tornada, net, o un error que s'entén.
     · mapa()     el mapa canònic ({abast, roles, pairs}) de les respostes:
                  el mateix format de SOS/lib/mapa-valor.js i de l'editor.
     · desDe()    el camí de tornada: el mapa que surt de l'editor, a la fitxa.
     · revisa()   les regles dures del mapa, dites com les diria el client.
     · resum()    el text que arriba a la casa amb el formulari.

   Cap paraula de dins al que llegeix el client: ni Zoho, ni rols, ni fluxos,
   ni repositori. Cap import en euros. Navegador: window.DiagnosiClient.
   Node: require(). */
(function (g) {
'use strict';

var PREGUNTES = [
  { id: 'objetivo', passa: 1, per: 'abast',
    q: '¿Qué tiene que conseguir tu web nueva?',
    ej: 'Llenar los cursos de 2027, que me encuentren desde fuera, dejar de contestar lo mismo…' },
  { id: 'quien', passa: 2, per: 'rols',
    q: '¿Quién te compra, se apunta o te contrata? ¿De dónde viene y en qué momento está?',
    ej: 'Gente que cambia de profesión, recién graduados, empresas…' },
  { id: 'llegan', passa: 2, per: 'rols',
    q: '¿Cómo te encuentran hoy?',
    ej: 'Google, Instagram, YouTube, antiguos clientes que te recomiendan, socios…' },
  { id: 'aliados', passa: 2, per: 'rols',
    q: '¿Con quién trabajas para darlo? Tu equipo, socios, quien te avala o te certifica.',
    ej: 'Formadores, una asociación, otra escuela, proveedores…' },
  { id: 'despues', passa: 4, per: 'intangibles',
    q: '¿Qué pasa con tus clientes después? ¿Vuelven, te recomiendan, encuentran trabajo?',
    ej: 'Me mandan amigos, me graban un vídeo, trabajan con quien me conoce…' },
  { id: 'preguntan', passa: 6, per: 'web',
    q: '¿Qué te preguntan siempre antes de decidirse?',
    ej: 'Fechas, precio, si sirve fuera de España, alojamiento…' },
  { id: 'tiempo', passa: 5, per: 'procesos',
    q: '¿Qué te quita más tiempo cada semana?',
    ej: 'Contestar correos, apuntar inscripciones, cobrar, publicar en redes…' },
  { id: 'webHoy', passa: 6, per: 'web',
    q: '¿Qué te gusta de tu web de ahora y qué cambiarías?',
    ej: 'Las fotos de las clases sí; el menú y los textos largos, no.' }
];

/* Quantes persones o grups calen per a un primer mapa que ensenyi alguna
   cosa: les regles 2 i 3 de mapa-valor.js (de 6 a 12, un terç que no es paga). */
var MIN_ALTRES = 5, MAX_ALTRES = 11;

var net = function (v) { return v == null ? '' : String(v).replace(/\s+/g, ' ').trim(); };

/* El text per a la IA del client. Va en castellà, com la pàgina, i demana el
   JSON exacte que `llegeix` sap llegir. */
function prompt(c) {
  var o = c || {}, l = [];
  l.push('Ayúdame a preparar la web nueva de mi organización. Te cuento quién soy y lo que quiero, y te pido que contestes unas preguntas y que me digas quién está a mi alrededor.');
  l.push('');
  if (net(o.org)) l.push('Mi organización: ' + net(o.org));
  if (net(o.web)) l.push('Mi web de ahora: ' + net(o.web) + ' (léela si puedes; si no, dímelo)');
  l.push('Lo que quiero, con mis palabras: ' + (net(o.inicial) || '(todavía no lo he escrito)'));
  l.push('');
  l.push('1. Contesta estas preguntas con lo que sepas de mí. Si no lo sabes, escribe «?» y no lo inventes:');
  PREGUNTES.forEach(function (p, i) { l.push('   ' + (i + 1) + '. ' + p.q); });
  l.push('');
  l.push('2. Dime entre ' + MIN_ALTRES + ' y ' + MAX_ALTRES + ' personas o grupos que están a mi alrededor (quien me compra, quien me recomienda, quien me ayuda, quien me avala…). Llámalos por lo que hacen, sin nombres propios ni de empresas. Para cada uno: qué me da y qué le doy yo, en pocas palabras. Marca «gratis» si eso no se paga (confianza, ideas, recomendaciones, reputación) y «se paga» si es dinero, un producto o un servicio. Sin cifras.');
  l.push('');
  l.push('3. Devuélvemelo solo así, en un bloque JSON, para que lo pegue en mi formulario:');
  l.push('{"respuestas": {' + PREGUNTES.map(function (p) { return '"' + p.id + '": "…"'; }).join(', ') + '},');
  l.push(' "alrededor": [{"quien": "…", "me_da": "…", "me_da_es": "se paga|gratis", "le_doy": "…", "le_doy_es": "se paga|gratis"}]}');
  return l.join('\n');
}

var MENA = function (v) { return /gratis|no se paga|intangible/i.test(String(v || '')) ? 'intangible' : 'tangible'; };

/* El primer objecte JSON del text que enganxa el client (amb o sense ```). */
function llegeix(text) {
  var t = String(text || ''), a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b <= a) throw new Error('No encuentro el bloque entre llaves { }. Copia la respuesta entera de tu IA.');
  var j;
  try { j = JSON.parse(t.slice(a, b + 1)); } catch (e) { throw new Error('El bloque no se puede leer. Pídele a tu IA que lo devuelva solo en JSON, sin nada más.'); }
  var r = {}, src = j.respuestas || j.respostes || {};
  PREGUNTES.forEach(function (p) { var v = net(src[p.id]); if (v && v !== '?') r[p.id] = v; });
  var al = (Array.isArray(j.alrededor) ? j.alrededor : []).map(function (x) {
    return { quien: net(x && x.quien), meDa: net(x && x.me_da), meDaEs: MENA(x && x.me_da_es),
      leDoy: net(x && x.le_doy), leDoyEs: MENA(x && x.le_doy_es) };
  }).filter(function (x) { return x.quien; });
  return { respuestas: r, alrededor: al };
}

/* El mapa canònic: el client al centre (`casa`), cada persona o grup del seu
   voltant amb un parell d'anada i tornada. Un esborrany en estrella: la
   sessió hi afegeix el que passa entre els altres. */
function mapa(c) {
  var o = c || {}, casa = net(o.casa) || 'Tu equipo', vist = {};
  var al = (o.alrededor || []).filter(function (x) {
    var k = net(x.quien).toLowerCase();
    if (!k || k === casa.toLowerCase() || vist[k]) return false;
    vist[k] = 1; return true;
  });
  var ex = o.extra || {}, roles = [casa].concat(al.map(function (x) { return net(x.quien); }));
  (ex.roles || []).forEach(function (r) { if (roles.indexOf(r) < 0) roles.push(r); });
  return {
    abast: net((o.respuestas || {}).objetivo) || net(o.inicial),
    roles: roles,
    pairs: al.map(function (x) {
      return [net(x.quien), casa, x.meDa ? (x.meDaEs || 'tangible') : '', net(x.meDa), x.leDoy ? (x.leDoyEs || 'tangible') : '', net(x.leDoy)];
    }).concat((ex.pairs || []).filter(function (p) { return roles.indexOf(p[0]) >= 0 && roles.indexOf(p[1]) >= 0; }))
  };
}

/* A la inversa: el que torna de l'editor del mapa (MODEL.exporta) cap a la
   fitxa. El que toca el centre torna a ser una fila de «qui hi ha al voltant»;
   la resta (el que passa entre els altres, els rols que encara no hi
   intercanvien) es guarda a `extra` perquè `mapa()` no ho perdi. */
function desDe(m, casa) {
  var c = net(casa) || 'Tu equipo', files = {}, ordre = [], extra = { roles: [], pairs: [] };
  var fila = function (q) { if (!files[q]) { files[q] = { quien: q, meDa: '', meDaEs: 'tangible', leDoy: '', leDoyEs: 'tangible' }; ordre.push(q); } return files[q]; };
  (m && m.pairs || []).forEach(function (p) {
    if (p[1] === c && p[0] !== c) { var f = fila(p[0]); if (!f.meDa) { f.meDa = p[3] || ''; f.meDaEs = p[2] || 'tangible'; f.leDoy = p[5] || ''; f.leDoyEs = p[4] || 'tangible'; } }
    else if (p[0] === c && p[1] !== c) { var g = fila(p[1]); if (!g.leDoy) { g.leDoy = p[3] || ''; g.leDoyEs = p[2] || 'tangible'; g.meDa = p[5] || ''; g.meDaEs = p[4] || 'tangible'; } }
    else extra.pairs.push(p.slice());
  });
  (m && m.roles || []).forEach(function (r) { if (r !== c && !files[r]) extra.roles.push(r); });
  return { alrededor: ordre.map(function (q) { return files[q]; }), extra: extra };
}

/* Les regles dures de mapa-valor.js, amb les paraules del client. `MV` és
   window.MapaValor al navegador o el require a Node. */
var DIU = {
  abast: ['Sabemos qué quieres conseguir', 'Falta decir qué tiene que conseguir la web (la primera pregunta)'],
  rols: ['Hay gente suficiente alrededor para ver un dibujo', 'Hacen falta entre ' + (MIN_ALTRES + 1) + ' y ' + (MAX_ALTRES + 1) + ' contando contigo'],
  menes: ['Está también lo que no se paga', 'Falta lo que no se paga: confianza, recomendaciones, ideas. Al menos un tercio de lo que va y viene'],
  reciprocitat: ['Con cada uno, algo va y algo vuelve', 'Hay alguien con quien solo va algo en un sentido: di también qué vuelve'],
  solts: ['Nadie se queda sin dar ni recibir', 'Hay alguien que ni da ni recibe nada: dile qué'],
  xifres: ['Sin cifras', 'Quita las cifras: las pondremos juntos con las tuyas'],
  noms: ['Cada uno se llama por lo que hace', 'Parece que hay un nombre propio: llámalo por lo que hace']
};
function revisa(m, MV) {
  var V = MV || g.MapaValor;
  var r = V.revisa(m);
  var punts = r.regles.filter(function (x) { return DIU[x.id]; }).map(function (x) {
    return { id: x.id, ok: x.ok, diu: DIU[x.id][x.ok ? 0 : 1] };
  });
  return { punts: punts, llest: punts.every(function (x) { return x.ok; }) };
}

/* El que arriba a la casa: compte, frase inicial, respostes, nivell i mapa. */
function resum(c) {
  var o = c || {}, l = [];
  if (net(o.inicial)) l.push('Lo que quiere: ' + net(o.inicial));
  PREGUNTES.forEach(function (p) { var v = net((o.respuestas || {})[p.id]); if (v) l.push('· ' + p.q + ' ' + v); });
  if (net(o.nivel)) l.push('Nivel de web: ' + net(o.nivel));
  l.push('Mapa (JSON): ' + JSON.stringify(mapa(o)));
  return l.join('\n');
}

var DiagnosiClient = { PREGUNTES: PREGUNTES, MIN_ALTRES: MIN_ALTRES, MAX_ALTRES: MAX_ALTRES, prompt: prompt, llegeix: llegeix, mapa: mapa, desDe: desDe, revisa: revisa, resum: resum };
if (typeof module !== 'undefined' && module.exports) module.exports = DiagnosiClient; else g.DiagnosiClient = DiagnosiClient;
})(typeof globalThis !== 'undefined' ? globalThis : this);
