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
 *        [--continguts cerebro/continguts/]
 *
 * `mapa.json` és el que dona «Copia el JSON» a l'editor (o el web.json de la
 * pestanya Web: també s'accepta). Escriu a la carpeta la web i el que en fa un
 * repositori: `mapa.json`, `CLAUDE.md`, `netlify.toml`, `robots.txt` (i el
 * sitemap, amb --url) i `permaweb.json`, l'empremta SHA-256 de cada fitxer. */
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
const motor = new Function('\'use strict\';\n' + ['VS-MOTOR', 'VS-DIAG', 'VS-MODEL', 'VS-WEB', 'VS-SITE', 'VS-TASQUES', 'VS-IMPORTA', 'VS-GENERA'].map(bloc).join('\n')
  + '\nreturn { revisa, fluxos, creaDiagnosi, creaModel, webDelMapa, webASite, ambPermaweb, generaWeb, codiRepositori, KIT_TXT };')();
const sencer = nom => bloc(nom) + '/*/' + nom + '*/';
const k = html.indexOf('const EXEMPLE = {'), exemple = html.slice(k, html.indexOf('};', k) + 2);

/* El mateix codi que l'editor (bloc VS-GENERA), amb l'empremta de Node. */
function genera(entrada, opts) {
  return motor.generaWeb(entrada, opts, { sha: async b => createHash('sha256').update(b).digest('hex'),
    codi: { reg: bloc('VS-REG'), api: bloc('VS-API'), mcp: bloc('VS-MCP'), imp: bloc('VS-IMPORTA'), repo: codiRepositori() } });
}
/* El motor i el genera.mjs que porta el repositori del client (i la plantilla de Netlify). */
const codiRepositori = () => motor.codiRepositori(sencer, exemple);
module.exports = { genera, codiRepositori, exemple, KIT_TXT: motor.KIT_TXT };

if (require.main === module) {
  const a = process.argv.slice(2), opts = { casa: [] }, pos = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--casa') opts.casa.push(a[++i]);
    else if (a[i] === '--continguts') {
      /* Els textos de les pàgines (cerebro/continguts/<id>.md), com els llegeix genera.mjs. */
      const d = a[++i];
      opts.continguts = require('node:fs').readdirSync(d).filter(f => /\.md$/.test(f)).sort().map(f => ({ id: f.slice(0, -3), text: readFileSync(join(d, f), 'utf8') }));
    }
    else if (/^--(nom|correu|llengua|url)$/.test(a[i])) opts[a[i].slice(2)] = a[++i];
    else pos.push(a[i]);
  }
  if (pos.length < 2) { console.error('Ús: node SOS/tools/web-del-mapa.js mapa.json carpeta/ [--nom …] [--correu …] [--llengua ca|es] [--url …] [--casa …] [--continguts cerebro/continguts/]'); process.exit(2); }
  opts.avisa = m => console.warn('⚠️  ' + m);
  genera(JSON.parse(readFileSync(pos[0], 'utf8')), opts).then(fitxers => {
    fitxers.forEach(f => { const r = join(pos[1], f.ruta); mkdirSync(dirname(r), { recursive: true }); writeFileSync(r, f.cos); });
    console.log('✅ ' + fitxers.length + ' fitxers a ' + pos[1]);
  }).catch(e => { console.error('❌ ' + e.message); process.exit(1); });
}
