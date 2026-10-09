#!/usr/bin/env node
/* La web d'un client, des del seu mapa de valor · sense navegador
 * ─────────────────────────────────────────────────────────────────
 * Fa el mateix que el botó «Descarrega la web» de l'editor del mapa
 * (`SOS/vna-suport.html`, pestanya Web), amb **el mateix codi**: en llegeix els
 * blocs VS-MOTOR, VS-DIAG, VS-MODEL, VS-WEB i VS-SITE tal com hi són. Així una
 * sessió de Claude Code al projecte del client pot regenerar la web cada cop
 * que canvia el mapa, i ningú no edita els HTML a mà.
 *
 *   node SOS/tools/web-del-mapa.js mapa.json carpeta/ [--nom "Nom"] [--correu x@y.z]
 *        [--llengua ca|es] [--casa "Rol 1" --casa "Rol 2"]
 *
 * `mapa.json` és el que dona «Copia el JSON» a l'editor (o el web.json de la
 * pestanya Web: també s'accepta). Escriu la web a la carpeta, amb
 * `permaweb.json` (l'empremta SHA-256 de cada fitxer). */
'use strict';
const { readFileSync, writeFileSync, mkdirSync } = require('node:fs');
const { join, dirname } = require('node:path');
const { createHash } = require('node:crypto');

const html = readFileSync(join(__dirname, '..', 'vna-suport.html'), 'utf8');
const bloc = nom => {
  const a = html.indexOf('/*' + nom + '*/'), b = html.indexOf('/*/' + nom + '*/');
  if (a < 0 || b <= a) throw new Error('Falta el bloc ' + nom + ' a vna-suport.html');
  return html.slice(a, b);
};
const motor = new Function('\'use strict\';\n' + ['VS-MOTOR', 'VS-DIAG', 'VS-MODEL', 'VS-WEB', 'VS-SITE'].map(bloc).join('\n')
  + '\nreturn { revisa, fluxos, creaDiagnosi, creaModel, webDelMapa, webASite, ambPermaweb };')();

function webDe(entrada, opts) {
  if (entrada && entrada.formato === 'tt-web-1') return entrada;
  const D = motor.creaDiagnosi({ revisa: motor.revisa, fluxos: motor.fluxos });
  const M = motor.creaModel({ fluxos: motor.fluxos, revisa: motor.revisa, normNom: D.normNom });
  const m = M.llegeixTextos(M.importa(entrada).arbre.real.t);
  return motor.webDelMapa(m, { casa: opts.casa || [] });
}
async function genera(entrada, opts) {
  const site = motor.webASite(webDe(entrada, opts || {}), opts || {});
  return motor.ambPermaweb(site, async b => createHash('sha256').update(b).digest('hex'));
}
module.exports = { genera, webDe };

if (require.main === module) {
  const a = process.argv.slice(2), opts = { casa: [] }, pos = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--casa') opts.casa.push(a[++i]);
    else if (/^--(nom|correu|llengua)$/.test(a[i])) opts[a[i].slice(2)] = a[++i];
    else pos.push(a[i]);
  }
  if (pos.length < 2) { console.error('Ús: node SOS/tools/web-del-mapa.js mapa.json carpeta/ [--nom …] [--correu …] [--llengua ca|es] [--casa …]'); process.exit(2); }
  genera(JSON.parse(readFileSync(pos[0], 'utf8')), opts).then(fitxers => {
    fitxers.forEach(f => { const r = join(pos[1], f.ruta); mkdirSync(dirname(r), { recursive: true }); writeFileSync(r, f.cos); });
    console.log('✅ ' + fitxers.length + ' fitxers a ' + pos[1]);
  }).catch(e => { console.error('❌ ' + e.message); process.exit(1); });
}
