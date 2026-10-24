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
 *        [--org nom] [--marca marca.json] [--continguts cerebro/continguts/]
 *        [--vista basica]   la capa informativa en una sola pàgina, una secció per rol principal
 *        [--capes extranet,intranet]   el que es fa a més de la web pública
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

const MW = require('../lib/motor-web.js');
const html = readFileSync(join(__dirname, '..', 'vna-suport.html'), 'utf8');
const bloc = nom => MW.bloc(html, nom);
const motor = MW.motor(html);
const sencer = nom => bloc(nom) + '/*/' + nom + '*/';
const k = html.indexOf('const EXEMPLE = {'), exemple = html.slice(k, html.indexOf('};', k) + 2);

/* El mateix codi que l'editor (bloc VS-GENERA), amb l'empremta de Node. */
function genera(entrada, opts) {
  return motor.generaWeb(entrada, opts, { sha: async b => createHash('sha256').update(b).digest('hex'),
    codi: { reg: bloc('VS-REG'), api: bloc('VS-API'), mcp: bloc('VS-MCP'), imp: bloc('VS-IMPORTA'), repo: codiRepositori() } });
}
/* El motor i el genera.mjs que porta el repositori del client (i la plantilla de Netlify). */
const codiRepositori = () => motor.codiRepositori(sencer, exemple);
/* marca.json, amb el logo llegit del disc: el bloc VS-SITE només rep text. */
function llegeixMarca(fitxer) {
  const m = JSON.parse(readFileSync(fitxer, 'utf8'));
  if (typeof m.logo === 'string' && /\.svg$/i.test(m.logo) && !/^[a-z]+:/i.test(m.logo)) {
    try { m.logoSvg = readFileSync(resolve(dirname(fitxer), m.logo), 'utf8'); } catch (e) { console.error('⚠ No trobo el logo ' + m.logo); }
  }
  return m;
}
/* El rastrejador de l'importador (VS-IMPORTA), el mateix que porta el client:
   `analitza-contingut.js` el fa servir per llegir la web d'un lead. */
module.exports = { genera, llegeixMarca, codiRepositori, exemple, KIT_TXT: motor.KIT_TXT, rastreja: motor.rastreja };

if (require.main === module) {
  const a = process.argv.slice(2), opts = { casa: [] }, pos = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--casa') opts.casa.push(a[++i]);
    else if (a[i] === '--marca') opts.marca = llegeixMarca(a[++i]);
    else if (a[i] === '--continguts') {
      /* Els textos de les pàgines (cerebro/continguts/<id>.md), com els llegeix genera.mjs. */
      const d = a[++i];
      opts.continguts = require('node:fs').readdirSync(d).filter(f => /\.md$/.test(f)).sort().map(f => ({ id: f.slice(0, -3), text: readFileSync(join(d, f), 'utf8') }));
    }
    else if (/^--(nom|correu|llengua|url|vista|acces)$/.test(a[i])) opts[a[i].slice(2)] = a[++i];
    /* La pàgina o la web d'un partner: surt del seu mapa propi (lib/mapa-valor.js, `mapaOrg`). */
    else if (a[i] === '--org') opts.org = a[++i];
    else if (a[i] === '--capes') opts.capes = String(a[++i] || '').split(',').map(x => x.trim()).filter(Boolean);
    else pos.push(a[i]);
  }
  if (pos.length < 2) { console.error('Ús: node SOS/tools/web-del-mapa.js mapa.json carpeta/ [--nom …] [--correu …] [--llengua ca|es] [--url …] [--casa …] [--org nom] [--marca marca.json] [--continguts cerebro/continguts/] [--vista basica] [--acces https://…]'); process.exit(2); }
  opts.avisa = m => console.warn('⚠️  ' + m);
  let entrada = JSON.parse(readFileSync(pos[0], 'utf8'));
  if (opts.org) {
    entrada = require('../lib/mapa-valor.js').mapaOrg(entrada, opts.org);
    if (!entrada) { console.error('❌ «' + opts.org + '» no té mapa propi: posa-li un `mapa`, o un `dins` a un dels seus rols'); process.exit(1); }
    opts.nom = opts.nom || opts.org; delete opts.org;
  }
  genera(entrada, opts).then(fitxers => {
    fitxers.forEach(f => { const r = join(pos[1], f.ruta); mkdirSync(dirname(r), { recursive: true }); writeFileSync(r, f.cos); });
    console.log('✅ ' + fitxers.length + ' fitxers a ' + pos[1]);
  }).catch(e => { console.error('❌ ' + e.message); process.exit(1); });
}
