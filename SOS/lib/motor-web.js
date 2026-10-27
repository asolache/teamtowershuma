/* El motor de la web del mapa, fora de l'editor (21/10/2026).
   La web d'un client surt dels blocs VS-* de `SOS/vna-suport.html`, que és on
   s'escriuen i on es proven. Qui la vol fer sense obrir l'editor —el
   `web-del-mapa.js` de Node i l'espai de client de /cliente/, que n'ensenya el
   prototip— els llegeix d'allà amb aquesta funció, i així la llista de blocs i
   el que se n'exporta es diuen un sol cop. Navegador: window.MotorWeb. Node:
   require(). */
(function (g) {
'use strict';
var BLOCS = ['VS-MOTOR', 'VS-DIAG', 'VS-MODEL', 'VS-WEB', 'VS-SITE', 'VS-TASQUES', 'VS-IMPORTA', 'VS-GENERA'];
var EXPORTA = ['revisa', 'fluxos', 'creaDiagnosi', 'creaModel', 'webDelMapa', 'webASite', 'ambPermaweb', 'generaWeb', 'codiRepositori', 'KIT_TXT', 'rastreja', 'orfesFoto'];

/* El text entre `/*NOM*\/` i `/*\/NOM*\/`, sense la marca de tancament. */
function bloc(html, nom) {
  var a = html.indexOf('/*' + nom + '*/'), b = html.indexOf('/*/' + nom + '*/');
  if (a < 0 || b <= a) throw new Error('Falta el bloc ' + nom + ' a vna-suport.html');
  return html.slice(a, b);
}

/* Del text de vna-suport.html, el motor: les funcions d'EXPORTA. */
function motor(html) {
  return new Function('\'use strict\';\n' + BLOCS.map(function (n) { return bloc(html, n); }).join('\n')
    + '\nreturn {' + EXPORTA.join(',') + '};')();
}

/* La web d'un mapa en una sola crida, com la vista prèvia de l'editor:
   [{ruta, cos}] de cada fitxer. `opts`: nom, correu, llengua, url, casa i
   vista ('basica': la capa informativa en una sola pàgina) i capes
   (['extranet', 'intranet']: el que es fa a més de la web pública) i marca
   (lema, presentacio i portes: els textos que /cliente/ escriu amb la IA) i
   foto i portesWeb (la web que el client ja té: es replica i les adreces
   velles hi porten amb un 301). */
function site(m, html, opts) {
  var o = opts || {}, M = motor(html), casa = o.casa || [];
  return M.webASite(M.webDelMapa(m, { casa: casa }), { nom: o.nom || '', correu: o.correu || '', llengua: o.llengua || 'es',
    url: o.url || '', casa: casa, vista: o.vista, capes: o.capes, acces: o.acces, marca: o.marca, foto: o.foto, portesWeb: o.portesWeb, mapa: m }).fitxers;
}

var MotorWeb = { BLOCS: BLOCS, bloc: bloc, motor: motor, site: site };
if (typeof module !== 'undefined' && module.exports) module.exports = MotorWeb; else g.MotorWeb = MotorWeb;
})(typeof globalThis !== 'undefined' ? globalThis : this);
