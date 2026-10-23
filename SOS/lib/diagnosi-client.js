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
    ej: 'Llenar los cursos de 2027, que me encuentren desde fuera, dejar de contestar lo mismo…',
    ca: { q: 'Què ha d\'aconseguir la teva web nova?', ej: 'Omplir els cursos del 2027, que et trobin des de fora, deixar de contestar el mateix…' } },
  { id: 'quien', passa: 2, per: 'rols',
    q: '¿Quién te compra, se apunta o te contrata? ¿De dónde viene y en qué momento está?',
    ej: 'Gente que cambia de profesión, recién graduados, empresas…',
    ca: { q: 'Qui et compra, s\'hi apunta o et contracta? D\'on ve i en quin moment està?', ej: 'Gent que canvia de professió, gent acabada de graduar, empreses…' } },
  { id: 'llegan', passa: 2, per: 'rols',
    q: '¿Cómo te encuentran hoy?',
    ej: 'Google, Instagram, YouTube, antiguos clientes que te recomiendan, socios…',
    ca: { q: 'Com et troben avui?', ej: 'Google, Instagram, YouTube, antics clients que et recomanen, socis…' } },
  { id: 'aliados', passa: 2, per: 'rols',
    q: '¿Con quién trabajas para darlo? Tu equipo, socios, quien te avala o te certifica.',
    ej: 'Formadores, una asociación, otra escuela, proveedores…',
    ca: { q: 'Amb qui treballes per donar-ho? El teu equip, socis, qui t\'avala o et certifica.', ej: 'Formadors, una associació, una altra escola, proveïdors…' } },
  { id: 'despues', passa: 4, per: 'intangibles',
    q: '¿Qué pasa con tus clientes después? ¿Vuelven, te recomiendan, encuentran trabajo?',
    ej: 'Me mandan amigos, me graban un vídeo, trabajan con quien me conoce…',
    ca: { q: 'Què passa amb els teus clients després? Tornen, et recomanen, troben feina?', ej: 'M\'envien amics, em graven un vídeo, treballen amb qui em coneix…' } },
  { id: 'preguntan', passa: 6, per: 'web',
    q: '¿Qué te preguntan siempre antes de decidirse?',
    ej: 'Fechas, precio, si sirve fuera de España, alojamiento…',
    ca: { q: 'Què et pregunten sempre abans de decidir-se?', ej: 'Dates, preu, si serveix fora d\'Espanya, allotjament…' } },
  { id: 'tiempo', passa: 5, per: 'procesos',
    q: '¿Qué te quita más tiempo cada semana?',
    ej: 'Contestar correos, apuntar inscripciones, cobrar, publicar en redes…',
    ca: { q: 'Què et pren més temps cada setmana?', ej: 'Contestar correus, apuntar inscripcions, cobrar, publicar a les xarxes…' } },
  { id: 'webHoy', passa: 6, per: 'web',
    q: '¿Qué te gusta de tu web de ahora y qué cambiarías?',
    ej: 'Las fotos de las clases sí; el menú y los textos largos, no.',
    ca: { q: 'Què t\'agrada de la teva web d\'ara i què hi canviaries?', ej: 'Les fotos de les classes sí; el menú i els textos llargs, no.' } }
];

/* Quantes persones o grups calen per a un primer mapa que ensenyi alguna
   cosa: les regles 2 i 3 de mapa-valor.js (de 6 a 12, un terç que no es paga). */
var MIN_ALTRES = 5, MAX_ALTRES = 11;

var net = function (v) { return v == null ? '' : String(v).replace(/\s+/g, ' ').trim(); };

/* La pregunta en la llengua de la pàgina (21/10 només en castellà; el català
   des del 22/10/2026, demanat per l'Àlvar). El castellà és la font i el que
   arriba a la casa (`resum`). */
function pregunta(p, ll) { return ll === 'ca' && p.ca ? p.ca : { q: p.q, ej: p.ej }; }

/* El text per a la IA del client, en la llengua de la pàgina. Demana el JSON
   exacte que `llegeix` sap llegir: les claus no es tradueixen. */
var PROMPT = {
  es: { hola: 'Ayúdame a preparar la web nueva de mi organización. Te cuento quién soy y lo que quiero, y te pido que contestes unas preguntas y que me digas quién está a mi alrededor.',
    org: 'Mi organización: ', web: 'Mi web de ahora: ', webN: ' (léela si puedes; si no, dímelo)', vol: 'Lo que quiero, con mis palabras: ', buit: '(todavía no lo he escrito)',
    p1: '1. Contesta estas preguntas con lo que sepas de mí. Si no lo sabes, escribe «?» y no lo inventes:',
    p2: function (a, b) { return '2. Dime entre ' + a + ' y ' + b + ' personas o grupos que están a mi alrededor (quien me compra, quien me recomienda, quien me ayuda, quien me avala…). Llámalos por lo que hacen, sin nombres propios ni de empresas. Para cada uno: qué me da y qué le doy yo, en pocas palabras. Marca «gratis» si eso no se paga (confianza, ideas, recomendaciones, reputación) y «se paga» si es dinero, un producto o un servicio. Sin cifras.'; },
    p3: '3. Devuélvemelo solo así, en un bloque JSON, para que lo pegue en mi formulario:' },
  ca: { hola: "Ajuda'm a preparar la web nova de la meva organització. T'explico qui soc i què vull, i et demano que contestis unes preguntes i que em diguis qui hi ha al meu voltant.",
    org: 'La meva organització: ', web: "La meva web d'ara: ", webN: " (llegeix-la si pots; si no, digues-m'ho)", vol: 'El que vull, amb les meves paraules: ', buit: "(encara no ho he escrit)",
    p1: "1. Contesta aquestes preguntes amb el que sàpigues de mi. Si no ho saps, escriu «?» i no t'ho inventis:",
    p2: function (a, b) { return "2. Digues-me entre " + a + " i " + b + " persones o grups que hi ha al meu voltant (qui em compra, qui em recomana, qui m'ajuda, qui m'avala…). Anomena'ls pel que fan, sense noms propis ni d'empreses. Per a cadascun: què em dona i què li dono jo, en poques paraules. Marca «gratis» si això no es paga (confiança, idees, recomanacions, reputació) i «se paga» si són diners, un producte o un servei. Sense xifres. Contesta en català."; },
    p3: "3. Torna-m'ho només així, en un bloc JSON, perquè l'enganxi al meu formulari:" }
};
function prompt(c, llengua) {
  var o = c || {}, l = [], T = PROMPT[llengua] || PROMPT.es, ll = PROMPT[llengua] ? llengua : 'es';
  l.push(T.hola);
  l.push('');
  if (net(o.org)) l.push(T.org + net(o.org));
  if (net(o.web)) l.push(T.web + net(o.web) + T.webN);
  l.push(T.vol + (net(o.inicial) || T.buit));
  l.push('');
  l.push(T.p1);
  PREGUNTES.forEach(function (p, i) { l.push('   ' + (i + 1) + '. ' + pregunta(p, ll).q); });
  l.push('');
  l.push(T.p2(MIN_ALTRES, MAX_ALTRES));
  l.push('');
  l.push(T.p3);
  l.push('{"respuestas": {' + PREGUNTES.map(function (p) { return '"' + p.id + '": "…"'; }).join(', ') + '},');
  l.push(' "alrededor": [{"quien": "…", "me_da": "…", "me_da_es": "se paga|gratis", "le_doy": "…", "le_doy_es": "se paga|gratis"}]}');
  return l.join('\n');
}

var MENA = function (v) { return /gratis|no se paga|no es paga|intangible/i.test(String(v || '')) ? 'intangible' : 'tangible'; };

/* El primer objecte JSON del text que enganxa el client (amb o sense ```). */
var ERR = {
  es: ['No encuentro el bloque entre llaves { }. Copia la respuesta entera de tu IA.', 'El bloque no se puede leer. Pídele a tu IA que lo devuelva solo en JSON, sin nada más.'],
  ca: ["No trobo el bloc entre claus { }. Copia la resposta sencera de la teva IA.", "El bloc no es pot llegir. Demana a la teva IA que el torni només en JSON, sense res més."]
};
function llegeix(text, llengua) {
  var t = String(text || ''), a = t.indexOf('{'), b = t.lastIndexOf('}'), E = ERR[llengua] || ERR.es;
  if (a < 0 || b <= a) throw new Error(E[0]);
  var j;
  try { j = JSON.parse(t.slice(a, b + 1)); } catch (e) { throw new Error(E[1]); }
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
var DIU_CA = {
  abast: ['Sabem què vols aconseguir', "Falta dir què ha d'aconseguir la web (la primera pregunta)"],
  rols: ['Hi ha prou gent al voltant per veure un dibuix', 'En calen entre ' + (MIN_ALTRES + 1) + ' i ' + (MAX_ALTRES + 1) + ' comptant-te a tu'],
  menes: ['Hi ha també el que no es paga', 'Falta el que no es paga: confiança, recomanacions, idees. Almenys un terç del que va i ve'],
  reciprocitat: ['Amb cadascun, alguna cosa va i alguna cosa torna', "Hi ha algú amb qui només va alguna cosa en un sentit: digues també què torna"],
  solts: ['Ningú es queda sense donar ni rebre', "Hi ha algú que ni dona ni rep res: digues-li què"],
  xifres: ['Sense xifres', 'Treu les xifres: les posarem junts amb les teves'],
  noms: ['Cadascú es diu pel que fa', 'Sembla que hi ha un nom propi: anomena-ho pel que fa']
};
function revisa(m, MV, llengua) {
  var Q = llengua === 'ca' ? DIU_CA : DIU;
  var V = MV || g.MapaValor;
  var r = V.revisa(m);
  var punts = r.regles.filter(function (x) { return DIU[x.id]; }).map(function (x) {
    return { id: x.id, ok: x.ok, diu: Q[x.id][x.ok ? 0 : 1] };
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

var DiagnosiClient = { PREGUNTES: PREGUNTES, pregunta: pregunta, MIN_ALTRES: MIN_ALTRES, MAX_ALTRES: MAX_ALTRES, prompt: prompt, llegeix: llegeix, mapa: mapa, desDe: desDe, revisa: revisa, resum: resum };
if (typeof module !== 'undefined' && module.exports) module.exports = DiagnosiClient; else g.DiagnosiClient = DiagnosiClient;
})(typeof globalThis !== 'undefined' ? globalThis : this);
