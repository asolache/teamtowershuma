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
 *        [--llengua ca|es] [--url https://…] [--casa "Rol 1" --casa "Rol 2"]
 *        [--marca marca.json]
 *
 * `mapa.json` és el que dona «Copia el JSON» a l'editor (o el web.json de la
 * pestanya Web: també s'accepta). Escriu a la carpeta la web i el que en fa un
 * repositori: `mapa.json`, `CLAUDE.md`, `netlify.toml`, `robots.txt` (i el
 * sitemap, amb --url) i `permaweb.json`, l'empremta SHA-256 de cada fitxer.
 *
 * `--marca` hi posa el disseny i els textos propis (color, lletra, forma, logo
 * SVG, lema, presentació, nom curt i introducció de cada porta, on sou): el
 * format és al bloc VS-SITE (`marcaNeta`). El logo es llegeix al costat de
 * `marca.json`. */
'use strict';
const { readFileSync, writeFileSync, mkdirSync } = require('node:fs');
const { join, dirname, resolve } = require('node:path');
const { createHash } = require('node:crypto');

const html = readFileSync(join(__dirname, '..', 'vna-suport.html'), 'utf8');
const bloc = nom => {
  const a = html.indexOf('/*' + nom + '*/'), b = html.indexOf('/*/' + nom + '*/');
  if (a < 0 || b <= a) throw new Error('Falta el bloc ' + nom + ' a vna-suport.html');
  return html.slice(a, b);
};
const motor = new Function('\'use strict\';\n' + ['VS-MOTOR', 'VS-DIAG', 'VS-MODEL', 'VS-WEB', 'VS-SITE'].map(bloc).join('\n')
  + '\nreturn { revisa, fluxos, creaDiagnosi, creaModel, webDelMapa, webASite, ambPermaweb };')();

/* De l'entrada, la web i el mapa net (el mateix que exporta l'editor, que és
   el que va a mapa.json). Un web.json no porta mapa: no se'n pot refer. */
function webDe(entrada, opts) {
  if (entrada && entrada.formato === 'tt-web-1') return { web: entrada, mapa: null };
  const D = motor.creaDiagnosi({ revisa: motor.revisa, fluxos: motor.fluxos });
  const M = motor.creaModel({ fluxos: motor.fluxos, revisa: motor.revisa, normNom: D.normNom });
  const arbre = M.importa(entrada).arbre;
  return { web: motor.webDelMapa(M.llegeixTextos(arbre.real.t), { casa: opts.casa || [] }), mapa: M.exporta(arbre) };
}
async function genera(entrada, opts) {
  const o = opts || {}, { web, mapa } = webDe(entrada, o);
  const site = motor.webASite(web, Object.assign({}, o, { mapa: mapa || undefined, codi: { reg: bloc('VS-REG'), api: bloc('VS-API'), mcp: bloc('VS-MCP') } }));
  return motor.ambPermaweb(site, async b => createHash('sha256').update(b).digest('hex'));
}
/* marca.json, amb el logo llegit del disc: el bloc VS-SITE només rep text. */
function llegeixMarca(fitxer) {
  const m = JSON.parse(readFileSync(fitxer, 'utf8'));
  if (typeof m.logo === 'string' && /\.svg$/i.test(m.logo) && !/^[a-z]+:/i.test(m.logo)) {
    try { m.logoSvg = readFileSync(resolve(dirname(fitxer), m.logo), 'utf8'); } catch (e) { console.error('⚠ No trobo el logo ' + m.logo); }
  }
  return m;
}
module.exports = { genera, webDe, llegeixMarca };

if (require.main === module) {
  const a = process.argv.slice(2), opts = { casa: [] }, pos = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--casa') opts.casa.push(a[++i]);
    else if (a[i] === '--marca') opts.marca = llegeixMarca(a[++i]);
    else if (/^--(nom|correu|llengua|url)$/.test(a[i])) opts[a[i].slice(2)] = a[++i];
    else pos.push(a[i]);
  }
  if (pos.length < 2) { console.error('Ús: node SOS/tools/web-del-mapa.js mapa.json carpeta/ [--nom …] [--correu …] [--llengua ca|es] [--url …] [--casa …] [--marca marca.json]'); process.exit(2); }
  genera(JSON.parse(readFileSync(pos[0], 'utf8')), opts).then(fitxers => {
    fitxers.forEach(f => { const r = join(pos[1], f.ruta); mkdirSync(dirname(r), { recursive: true }); writeFileSync(r, f.cos); });
    console.log('✅ ' + fitxers.length + ' fitxers a ' + pos[1]);
  }).catch(e => { console.error('❌ ' + e.message); process.exit(1); });
}
