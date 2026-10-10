#!/usr/bin/env node
/* La plantilla del botó «Deploy to Netlify» · el camí B de l'alta
 * ─────────────────────────────────────────────────────────────────
 * Escriu `SOS/plantilla-web/`, la carpeta que Netlify clona al GitHub del
 * client quan prem el botó (paràmetre `create_from_path`): tot queda a nom
 * seu des del primer minut, i no hem de guardar cap permís seu.
 *
 * A cada publicació, Netlify executa `node eines/genera.mjs`, que fa la web
 * del mapa amb **el mateix codi que l'editor**: `eines/motor.mjs` són els blocs
 * de `SOS/vna-suport.html` tal com hi són. El mapa surt, per aquest ordre, de
 * `cerebro/mapa-real.json` del repositori, de la variable `TT_MAPA` (el posa el
 * botó de l'editor, comprimit) o, si no n'hi ha, de l'exemple del celler.
 *
 *   node SOS/tools/build-plantilla.js           escriu la plantilla
 *   node SOS/tools/build-plantilla.js --check   falla si no és la que sortiria ara
 */
'use strict';
const { readFileSync, writeFileSync, mkdirSync, existsSync } = require('node:fs');
const { join, dirname } = require('node:path');
const { genera } = require('./web-del-mapa.js');

const ARREL = join(__dirname, '..');
const DESTI = join(ARREL, 'plantilla-web');
const CHECK = process.argv.includes('--check');
const html = readFileSync(join(ARREL, 'vna-suport.html'), 'utf8');
const BLOCS = ['VS-MOTOR', 'VS-DIAG', 'VS-MODEL', 'VS-WEB', 'VS-SITE', 'VS-REG', 'VS-API', 'VS-MCP', 'VS-GENERA'];
const bloc = nom => {
  const a = html.indexOf('/*' + nom + '*/'), b = html.indexOf('/*/' + nom + '*/');
  if (a < 0 || b <= a) throw new Error('Falta el bloc ' + nom + ' a vna-suport.html');
  return html.slice(a, b + nom.length + 5);
};
const k0 = html.indexOf('const EXEMPLE = {'), k1 = html.indexOf('};', k0) + 2;
const EXEMPLE = new Function(html.slice(k0, k1).replace('const EXEMPLE =', 'return'))();
const CAP = '// Generat per SOS/tools/build-plantilla.js des de SOS/vna-suport.html (repositori asolache/teamtowershuma). No s\'edita a mà.\n';

const motor = CAP + 'import { readFileSync } from \'node:fs\';\nimport { createHash } from \'node:crypto\';\n'
  + html.slice(k0, k1) + '\n' + BLOCS.map(bloc).join('\n') + '\n'
  + '/* El codi que va a eines/ i netlify/ del client: els blocs d\'aquest mateix fitxer, tal com hi són. */\n'
  + 'const font = readFileSync(new URL(import.meta.url), \'utf8\');\n'
  + 'const tros = nom => font.slice(font.indexOf(\'/*\' + nom + \'*/\'), font.indexOf(\'/*/\' + nom + \'*/\'));\n'
  + 'export { EXEMPLE };\n'
  + 'export function genera(entrada, opts) {\n'
  + '  return generaWeb(entrada, opts, { sha: async b => createHash(\'sha256\').update(b).digest(\'hex\'), codi: { reg: tros(\'VS-REG\'), api: tros(\'VS-API\'), mcp: tros(\'VS-MCP\') } });\n}\n';

const generaMjs = '#!/usr/bin/env node\n' + CAP
  + '// Netlify l\'executa a cada publicació: fa la web del mapa i la deixa a l\'arrel.\n'
  + 'import { readFileSync, writeFileSync, mkdirSync, existsSync } from \'node:fs\';\nimport { inflateRawSync } from \'node:zlib\';\n'
  + 'import { genera, EXEMPLE } from \'./motor.mjs\';\n'
  + 'const arrel = new URL(\'../\', import.meta.url), e = process.env;\n'
  + 'const llegeix = r => { const u = new URL(r, arrel); return existsSync(u) ? JSON.parse(readFileSync(u, \'utf8\')) : null; };\n'
  + 'let mapa = llegeix(\'cerebro/mapa-real.json\'), font = \'cerebro/mapa-real.json\';\n'
  + 'if (!mapa && e.TT_MAPA) { mapa = JSON.parse(inflateRawSync(Buffer.from(e.TT_MAPA, \'base64url\')).toString(\'utf8\')); font = \'TT_MAPA\'; }\n'
  + 'if (!mapa) { mapa = EXEMPLE; font = \'l\\\'exemple del celler\'; }\n'
  + 'const ideal = llegeix(\'cerebro/mapa-ideal.json\');\n'
  + 'if (ideal) mapa = Object.assign({}, mapa, { ideal });\n'
  + 'const fitxers = await genera(mapa, { nom: e.TT_NOM, correu: e.TT_CORREU, llengua: e.TT_LLENGUA, url: e.TT_URL || e.URL });\n'
  + '/* El que és del repositori no es trepitja: la configuració, el mapa i les decisions escrites a mà. */\n'
  + 'const propis = [\'netlify.toml\', \'cerebro/mapa-real.json\', \'cerebro/mapa-ideal.json\', \'cerebro/decisiones.md\'];\n'
  + 'let n = 0;\n'
  + 'for (const f of fitxers) {\n'
  + '  const u = new URL(f.ruta, arrel);\n'
  + '  if (propis.includes(f.ruta) && existsSync(u)) continue;\n'
  + '  mkdirSync(new URL(\'.\', u), { recursive: true });\n  writeFileSync(u, f.cos);\n  n++;\n}\n'
  + 'console.log(\'✅ \' + n + \' fitxers, des de \' + font);\n';

const llegeixMd = ['# La teva web, des del mapa de valor', '',
  'Aquest repositori és teu: el va crear el botó «Deploy to Netlify». A cada publicació, Netlify fa la web a partir del mapa (`node eines/genera.mjs`).', '',
  '**El mapa és la font.** Desa el que dona l\'editor del mapa de valor («Copia el JSON») a `cerebro/mapa-real.json` i fes-ne una PR. Netlify en publica una vista prèvia; quan l\'acceptes, és la web. Mentre no hi sigui, la web surt de la variable `TT_MAPA` (la posa el botó) o de l\'exemple.', '',
  '**Es configura a Netlify** (Site configuration › Environment variables): `TT_NOM`, `TT_CORREU`, `TT_LLENGUA` (`ca` o `es`) i, per als avisos, `TT_WEBHOOKS` i `TT_WEBHOOK_SECRET`. Cap clau al repositori.', '',
  'En cada publicació es generen les regles (`CLAUDE.md`), l\'API (`API.md`) i el cervell (`cerebro/`). `cerebro/decisiones.md`, si el poses al repositori, es conserva.', '',
  '---', '', '# Tu web, desde el mapa de valor', '',
  'Este repositorio es tuyo: lo creó el botón «Deploy to Netlify». En cada publicación, Netlify hace la web a partir del mapa (`node eines/genera.mjs`).', '',
  '**El mapa es la fuente.** Guarda lo que da el editor del mapa de valor («Copia el JSON») en `cerebro/mapa-real.json` y haz una PR. Netlify publica una vista previa; cuando la aceptas, es la web. Mientras no esté, la web sale de la variable `TT_MAPA` (la pone el botón) o del ejemplo.', '',
  '**Se configura en Netlify** (Site configuration › Environment variables): `TT_NOM`, `TT_CORREU`, `TT_LLENGUA` (`ca` o `es`) y, para los avisos, `TT_WEBHOOKS` y `TT_WEBHOOK_SECRET`. Ninguna clave en el repositorio.', '',
  'En cada publicación se generan las reglas (`CLAUDE.md`), la API (`API.md`) y el cerebro (`cerebro/`). `cerebro/decisiones.md`, si lo pones en el repositorio, se conserva.', ''].join('\n');

(async () => {
  const toml = (await genera(EXEMPLE, {})).find(f => f.ruta === 'netlify.toml').cos;
  if (!toml.includes('[build]\n  publish = "."')) throw new Error('netlify.toml sense [build]');
  const plantillaToml = toml.replace('[build]\n  publish = "."', '[build]\n  command = "node eines/genera.mjs"\n  publish = "."')
    + '\n# El que demana el botó «Deploy to Netlify». El mapa (TT_MAPA) el posa el botó de l\'editor.\n[template.environment]\n'
    + '  TT_NOM = "El nom de la web"\n  TT_CORREU = "El correu on arriben els formularis"\n  TT_LLENGUA = "ca o es"\n  TT_MAPA = "El mapa, el posa el botó de l\'editor (opcional)"\n';
  const fitxers = { 'netlify.toml': plantillaToml, 'eines/motor.mjs': motor, 'eines/genera.mjs': generaMjs, 'README.md': llegeixMd };
  const mal = Object.keys(fitxers).filter(r => !existsSync(join(DESTI, r)) || readFileSync(join(DESTI, r), 'utf8') !== fitxers[r]);
  if (CHECK) {
    console.log('\nGuarda de la plantilla de Netlify · surt de l\'editor tal com és');
    if (mal.length) { console.log('  ✗ no és la que sortiria ara: ' + mal.join(', ') + '\n\n❌ Torna a generar-la: node SOS/tools/build-plantilla.js'); process.exit(1); }
    console.log('  ✓ ' + Object.keys(fitxers).length + ' fitxers, iguals que els que sortirien ara\n\n✅ La plantilla fa servir el codi de l\'editor.');
    return;
  }
  Object.keys(fitxers).forEach(r => { mkdirSync(dirname(join(DESTI, r)), { recursive: true }); writeFileSync(join(DESTI, r), fitxers[r]); });
  console.log('✅ ' + Object.keys(fitxers).length + ' fitxers a SOS/plantilla-web/' + (mal.length ? ' (canviats: ' + mal.join(', ') + ')' : ''));
})().catch(e => { console.error('❌ ' + e.message); process.exit(1); });
