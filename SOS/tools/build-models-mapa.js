#!/usr/bin/env node
/* Els mapes tipus, fora de l'app · SOS/lib/models-mapa.js
 * ─────────────────────────────────────────────────────────────────────────
 * L'app (SOS/index.html) porta els models de referència: «El meu negoci»
 * (DYNAMICS) i els sis prototips que cobreixen el 80 % dels projectes
 * (PROTOTYPE_MAPS). L'Àlvar ho va demanar el 22/10/2026 per a /cliente/: que
 * qui fa el seu mapa pugui començar pels fluxos d'un model en lloc de la
 * pàgina en blanc. Copiar-los voldria dir que un dia divergissin; aquí es
 * llegeixen de l'app tal com hi són i s'escriuen a `SOS/lib/models-mapa.js`
 * amb el castellà i l'anglès d'aquesta taula.
 *
 * `--check` peta si el fitxer no és el que sortiria ara, o si l'app ha afegit
 * un model o un text que aquesta taula encara no tradueix.
 *
 * Ús:  node SOS/tools/build-models-mapa.js [--check]
 */
'use strict';
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..');
const SORTIDA = join(ARREL, 'lib', 'models-mapa.js');

/* català → [castellà, anglès] */
const T = {
  'El meu negoci': ['Mi negocio', 'My business'],
  'El mapa de valor del teu negoci: qui hi dona què, i què torna.': ['El mapa de valor de tu negocio: quién da qué y qué vuelve.', 'The value map of your business: who gives what, and what comes back.'],
  'El negoci': ['El negocio', 'The business'], 'Clients': ['Clientes', 'Customers'], 'Equip': ['Equipo', 'Team'],
  'Proveïdors': ['Proveedores', 'Suppliers'], 'Aliats': ['Aliados', 'Allies'],
  'producte o servei': ['producto o servicio', 'product or service'], 'pagament': ['pago', 'payment'],
  'opinió i recomanació': ['opinión y recomendación', 'feedback and referrals'], 'confiança': ['confianza', 'trust'],
  'hores de feina': ['horas de trabajo', 'working hours'], 'sou': ['sueldo', 'salary'],
  'matèria primera': ['materia prima', 'raw materials'], 'recomanació': ['recomendación', 'referral'], 'reconeixement': ['reconocimiento', 'recognition'],
  'Servei de proximitat': ['Servicio de proximidad', 'Local service'],
  'Servei que s\'ofereix directament a la comunitat local (educació, cures, reparacions, atenció).': ['Servicio que se ofrece directamente a la comunidad local (educación, cuidados, reparaciones, atención).', 'A service offered directly to the local community (education, care, repairs, support).'],
  'Persones oferents': ['Personas que ofrecen', 'Providers'], 'Persones usuàries': ['Personas usuarias', 'Users'],
  'Nucli gestor': ['Núcleo gestor', 'Core team'], 'Referent territorial': ['Referente territorial', 'Local authority'], 'Ecosistema aliat': ['Ecosistema aliado', 'Partner ecosystem'],
  'servei directe': ['servicio directo', 'direct service'], 'pagament o hores del banc de temps': ['pago u horas del banco de tiempo', 'payment or time-bank hours'],
  'disponibilitat i qualitat': ['disponibilidad y calidad', 'availability and quality'], 'coordinació, formació i cura': ['coordinación, formación y cuidado', 'coordination, training and care'],
  'reputació i vincle': ['reputación y vínculo', 'reputation and bond'], 'garantia i resolució d\'incidències': ['garantía y resolución de incidencias', 'guarantee and issue resolution'],
  'legitimitat i espai': ['legitimidad y espacio', 'legitimacy and space'], 'memòria i indicadors d\'ús': ['memoria e indicadores de uso', 'report and usage indicators'],
  'derivacions': ['derivaciones', 'referrals'], 'coneixement i confiança': ['conocimiento y confianza', 'knowledge and trust'],
  'informació del servei': ['información del servicio', 'service information'], 'necessitats detectades': ['necesidades detectadas', 'needs spotted'],
  'difusió pública': ['difusión pública', 'public promotion'], 'valoració del servei': ['valoración del servicio', 'service rating'],
  'pràctica reflexiva compartida': ['práctica reflexiva compartida', 'shared reflective practice'], 'criteris i bones pràctiques': ['criterios y buenas prácticas', 'criteria and good practice'],
  'Producte artesà / manufactura': ['Producto artesano / manufactura', 'Craft product / manufacturing'],
  'Producció física en petit format, taller propi o compartit.': ['Producción física en pequeño formato, taller propio o compartido.', 'Small-scale physical production, own or shared workshop.'],
  'Artesans/es': ['Artesanos/as', 'Makers'], 'Proveïdors locals': ['Proveedores locales', 'Local suppliers'], 'Punt de venda': ['Punto de venta', 'Shop'],
  'Clientes': ['Clientes', 'Customers'], 'Comunitat i formació': ['Comunidad y formación', 'Community and training'],
  'matèria primera km0': ['materia prima de proximidad', 'local raw materials'], 'comandes estables i pagament just': ['pedidos estables y pago justo', 'steady orders and fair pay'],
  'producte acabat': ['producto acabado', 'finished product'], 'liquidació de vendes': ['liquidación de ventas', 'sales settlement'],
  'venda i assessorament': ['venta y asesoramiento', 'sales and advice'], 'ingressos': ['ingresos', 'income'],
  'retorn i encàrrecs a mida': ['opinión y encargos a medida', 'feedback and custom orders'], 'història i traçabilitat de la peça': ['historia y trazabilidad de la pieza', 'the piece\'s story and traceability'],
  'ofici i tallers': ['oficio y talleres', 'craft and workshops'], 'aprenents i renovació': ['aprendices y relevo', 'apprentices and renewal'],
  'cultura del fet a mà': ['cultura de lo hecho a mano', 'handmade culture'], 'demanda que valora l\'ofici': ['demanda que valora el oficio', 'demand that values the craft'],
  'previsió de demanda': ['previsión de demanda', 'demand forecast'], 'estoc i terminis': ['stock y plazos', 'stock and lead times'],
  'coneixement del material': ['conocimiento del material', 'knowledge of materials'], 'restes i materials per practicar': ['restos y materiales para practicar', 'offcuts and practice materials'],
  'Consultoria / servei tècnic': ['Consultoría / servicio técnico', 'Consulting / technical service'],
  'Consultoria, disseny, IT, arquitectura, assessoria — projecte per projecte.': ['Consultoría, diseño, IT, arquitectura, asesoría — proyecto a proyecto.', 'Consulting, design, IT, architecture, advisory — project by project.'],
  'Consultors/es': ['Consultores/as', 'Consultants'], 'Clients institucionals': ['Clientes institucionales', 'Public-sector clients'], 'Clients privats': ['Clientes privados', 'Private clients'],
  'Xarxa de partners': ['Red de partners', 'Partner network'], 'Nucli operatiu': ['Núcleo operativo', 'Operations core'],
  'entregable especialitzat': ['entregable especializado', 'specialised deliverable'], 'honoraris': ['honorarios', 'fees'],
  'revisió entre iguals': ['revisión entre iguales', 'peer review'], 'sub-encàrrecs': ['subencargos', 'subcontracts'],
  'administració i comercial': ['administración y comercial', 'admin and sales'], '% de facturació': ['% de la facturación', '% of billing'],
  'licitacions i marc de contractació': ['licitaciones y marco de contratación', 'tenders and procurement framework'], 'documentació i justificació': ['documentación y justificación', 'documentation and reporting'],
  'capacitat extra quan cal': ['capacidad extra cuando hace falta', 'extra capacity when needed'], 'contractes marc': ['contratos marco', 'framework contracts'],
  'fiabilitat i compliment': ['fiabilidad y cumplimiento', 'reliability and delivery'], 'cas d\'ús públic replicable': ['caso de uso público replicable', 'replicable public use case'], 'validació de mercat': ['validación de mercado', 'market validation'],
  'Producte digital / SaaS': ['Producto digital / SaaS', 'Digital product / SaaS'],
  'App, plataforma, servei online — usuaris massius o de nínxol.': ['App, plataforma, servicio online — usuarios masivos o de nicho.', 'App, platform, online service — mass or niche users.'],
  'Equip producte': ['Equipo de producto', 'Product team'], 'Usuaris/es': ['Usuarios/as', 'Users'], 'Comunitat contributora': ['Comunidad que contribuye', 'Contributor community'],
  'Patrocini i inversió': ['Patrocinio e inversión', 'Sponsors and investors'], 'Infraestructura': ['Infraestructura', 'Infrastructure'],
  'funcionalitat': ['funcionalidad', 'features'], 'subscripció o donació': ['suscripción o donación', 'subscription or donation'],
  'retorn i casos d\'ús': ['opiniones y casos de uso', 'feedback and use cases'], 'suport entre iguals': ['apoyo entre iguales', 'peer support'],
  'PRs, traduccions i docs': ['mejoras, traducciones y documentación', 'contributions, translations and docs'], 'governança oberta i mèrit': ['gobernanza abierta y mérito', 'open governance and credit'],
  'capital': ['capital', 'capital'], 'tracció i mètriques': ['tracción y métricas', 'traction and metrics'],
  'servidors i dades': ['servidores y datos', 'servers and data'], 'pagament de l\'allotjament': ['pago del alojamiento', 'hosting payment'],
  'prova d\'ús real': ['prueba de uso real', 'proof of real use'], 'finançament que abarateix el servei': ['financiación que abarata el servicio', 'funding that makes the service cheaper'],
  'rèpliques i mirroring': ['réplicas y espejos', 'replicas and mirrors'], 'accés i quotes': ['acceso y cuotas', 'access and quotas'],
  'full de ruta obert': ['hoja de ruta abierta', 'open roadmap'], 'prioritats de la base': ['prioridades de la base', 'grassroots priorities'],
  'Cura i acompanyament social': ['Cuidados y acompañamiento social', 'Care and social support'],
  'Xarxa de cures, salut comunitària, acompanyament a persones vulnerables.': ['Red de cuidados, salud comunitaria, acompañamiento a personas vulnerables.', 'Care network, community health, support for vulnerable people.'],
  'Persones cuidadores': ['Personas cuidadoras', 'Carers'], 'Persones cuidades': ['Personas cuidadas', 'People cared for'], 'Famílies': ['Familias', 'Families'],
  'Serveis socials/CAP': ['Servicios sociales / centro de salud', 'Social services / health centre'], 'Voluntariat': ['Voluntariado', 'Volunteers'],
  'acompanyament i escolta': ['acompañamiento y escucha', 'company and listening'], 'vincle i sentit': ['vínculo y sentido', 'bond and meaning'],
  'confiança i suport econòmic': ['confianza y apoyo económico', 'trust and financial support'], 'descàrrega i informació': ['respiro e información', 'relief and information'],
  'derivacions i formació': ['derivaciones y formación', 'referrals and training'], 'dades i seguiment': ['datos y seguimiento', 'data and follow-up'],
  'hores gratuïtes': ['horas gratuitas', 'free hours'], 'formació i cura mútua': ['formación y cuidado mutuo', 'training and mutual care'],
  'companyia i gestions': ['compañía y gestiones', 'company and errands'], 'confiança i històries': ['confianza e historias', 'trust and stories'],
  'context i alertes': ['contexto y alertas', 'context and alerts'], 'recursos i prestacions': ['recursos y prestaciones', 'resources and benefits'],
  'consentiment i preferències': ['consentimiento y preferencias', 'consent and preferences'], 'atenció adaptada': ['atención adaptada', 'tailored care'],
  'acollida a casa': ['acogida en casa', 'welcome at home'], 'relleu i respir': ['relevo y respiro', 'cover and respite'],
  'Educació / formació': ['Educación / formación', 'Education / training'],
  'Formació reglada o lliure, mentoria, escola comunitària.': ['Formación reglada o libre, mentoría, escuela comunitaria.', 'Formal or open training, mentoring, community school.'],
  'Formadors/es': ['Formadores/as', 'Trainers'], 'Aprenents': ['Alumnos', 'Learners'], 'Coordinació pedagògica': ['Coordinación pedagógica', 'Academic coordination'],
  'Espai formatiu': ['Espacio de formación', 'Training venue'], 'Comunitat de pràctica': ['Comunidad de práctica', 'Community of practice'],
  'sessions i materials': ['sesiones y materiales', 'sessions and materials'], 'matrícula o hores del banc': ['matrícula u horas del banco de tiempo', 'tuition or time-bank hours'],
  'disseny curricular': ['diseño del programa', 'curriculum design'], 'avaluació i millora': ['evaluación y mejora', 'evaluation and improvement'],
  'aules i eines': ['aulas y herramientas', 'classrooms and tools'], 'ús i manteniment': ['uso y mantenimiento', 'use and upkeep'],
  'xarxa d\'exalumnes': ['red de antiguos alumnos', 'alumni network'], 'mentoria entre iguals': ['mentoría entre iguales', 'peer mentoring'],
  'recerca compartida': ['investigación compartida', 'shared research'], 'casos reals per ensenyar': ['casos reales para enseñar', 'real cases to teach with'],
  'itinerari i acreditació': ['itinerario y titulación', 'pathway and accreditation'], 'expectatives i necessitats': ['expectativas y necesidades', 'expectations and needs'],
  'lloc de trobada': ['lugar de encuentro', 'meeting place'], 'vida i ús de l\'equipament': ['vida y uso del espacio', 'life and use of the venue'],
  'què demana el sector': ['qué pide el sector', 'what the sector asks for'], 'formació que s\'hi ajusta': ['formación que se ajusta', 'training that fits']
};

function llegeixApp() {
  const h = readFileSync(join(ARREL, 'index.html'), 'utf8');
  const a = h.indexOf('const DYNAMICS=['), b = h.indexOf("\n {id:'", a + 20);
  const negoci = Function('return ' + h.slice(a + 'const DYNAMICS=['.length, b).trim().replace(/,$/, ''))();
  const c = h.indexOf('const PROTOTYPE_MAPS=['), d = h.indexOf('\n];', c);
  const proto = Function('return [' + h.slice(c + 'const PROTOTYPE_MAPS=['.length, d) + ']')();
  return [negoci].concat(proto);
}

function models() {
  const falten = new Set();
  const tr = (x, i) => { if (!T[x]) { falten.add(x); return x; } return T[x][i]; };
  const llengua = (m, i) => ({
    nom: i < 0 ? m.name : tr(m.name, i), diu: i < 0 ? m.one : tr(m.one, i),
    roles: m.roles.map(r => (i < 0 ? r : tr(r, i))),
    pairs: m.pairs.map(p => [0, 1, 2, 3, 4, 5].map(k => (k === 2 || k === 4 || i < 0 ? p[k] : tr(p[k], i))))
  });
  const out = llegeixApp().map(m => ({ id: m.id, icona: m.icon, ca: llengua(m, -1), es: llengua(m, 0), en: llengua(m, 1) }));
  return { out, falten: [...falten] };
}

/* El rol on passa més: el centre del mapa, el que a /cliente/ passa a ser «tu». */
function genera() {
  const { out, falten } = models();
  const cos = '/* GENERAT per SOS/tools/build-models-mapa.js des de SOS/index.html (DYNAMICS «negoci»\n'
    + '   i PROTOTYPE_MAPS) · no s\'edita a mà. Els mapes tipus del SOS en tres llengües. */\n'
    + '(function (arrel, fabrica) {\n'
    + '  if (typeof module === \'object\' && module.exports) module.exports = fabrica();\n'
    + '  else arrel.ModelsMapa = fabrica();\n'
    + '})(typeof self !== \'undefined\' ? self : this, function () {\n'
    + '  \'use strict\';\n'
    + '  var MODELS = ' + JSON.stringify(out, null, 1).replace(/\n/g, '\n  ') + ';\n'
    + '  /* El rol que més dona i rep: el que fa de «tu» quan algú comença per aquest model. */\n'
    + '  function centre(m) { var n = {}; m.pairs.forEach(function (p) { n[p[0]] = (n[p[0]] || 0) + 1; n[p[1]] = (n[p[1]] || 0) + 1; });\n'
    + '    return m.roles.slice().sort(function (a, b) { return (n[b] || 0) - (n[a] || 0); })[0]; }\n'
    + '  /* El model en una llengua, amb el centre canviat pel nom de qui el fa servir. */\n'
    + '  function mapa(id, llengua, casa) {\n'
    + '    var M = MODELS.filter(function (x) { return x.id === id; })[0]; if (!M) return null;\n'
    + '    var m = M[llengua] || M.ca, c = centre(m), r = function (x) { return casa && x === c ? casa : x; };\n'
    + '    return { abast: \'\', roles: m.roles.map(r), pairs: m.pairs.map(function (p) { return [r(p[0]), r(p[1]), p[2], p[3], p[4], p[5]]; }), centre: casa || c, nom: m.nom };\n'
    + '  }\n'
    + '  return { MODELS: MODELS, centre: centre, mapa: mapa };\n'
    + '});\n';
  return { cos, falten };
}

if (require.main === module) {
  const { cos, falten } = genera();
  if (falten.length) { console.error('✗ Textos de l\'app sense traduir a build-models-mapa.js:\n  ' + falten.join('\n  ')); process.exit(1); }
  if (process.argv.includes('--check')) {
    const ara = existsSync(SORTIDA) ? readFileSync(SORTIDA, 'utf8') : '';
    if (ara !== cos) { console.error('✗ SOS/lib/models-mapa.js no és el que sortiria ara: node SOS/tools/build-models-mapa.js'); process.exit(1); }
    console.log('✓ Els mapes tipus de l\'app, al dia i en tres llengües');
  } else { writeFileSync(SORTIDA, cos); console.log('Escrit ' + SORTIDA); }
}
module.exports = { genera, models };
