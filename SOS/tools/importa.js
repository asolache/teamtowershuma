#!/usr/bin/env node
/* El que el client ja té, al cervell · la sessió 0 de l'alta
 * ─────────────────────────────────────────────────────────────
 * Porta a `cerebro/fonts/` la web d'ara, documents (.html .md .txt) i taules
 * (.csv), en Markdown i amb les dades personals amagades, perquè la IA n'escrigui
 * el dossier i els continguts amb la font al costat. És **la mateixa eina** que
 * porta el repositori del client (`eines/importa.mjs` i el bloc VS-IMPORTA de
 * `SOS/vna-suport.html`): aquí es fa servir abans que el repositori existeixi.
 *
 *   node SOS/tools/importa.js <url|carpeta|fitxer>… --surt carpeta/ [--autoritzat <domini>]
 *        [--columnes "a,b"] [--max 30]
 *
 * Una web, només amb `--autoritzat` i el seu domini: la de qui ens ho demana, amb
 * la seva autorització escrita, que va al CRM i no a cap repositori. D'una taula
 * només entra la capçalera i quantes files té, si no es trien les columnes. */
'use strict';
const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = require('node:fs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');
const { spawnSync } = require('node:child_process');
const { genera, exemple } = require('./web-del-mapa.js');

(async () => {
  const a = process.argv.slice(2), i = a.indexOf('--surt');
  if (i < 0 || !a[i + 1]) { console.error('Ús: node SOS/tools/importa.js <url|carpeta|fitxer>… --surt carpeta/ [--autoritzat <domini>] [--columnes "a,b"] [--max 30]'); process.exit(2); }
  const fitxers = await genera(new Function(exemple.replace('const EXEMPLE =', 'return'))(), {});
  const d = mkdtempSync(join(tmpdir(), 'tt-importa-'));
  try {
    mkdirSync(join(d, 'eines'));
    ['eines/nucli.mjs', 'eines/importa.mjs'].forEach(r => writeFileSync(join(d, r), fitxers.find(f => f.ruta === r).cos));
    const r = spawnSync(process.execPath, [join(d, 'eines', 'importa.mjs')].concat(a), { stdio: 'inherit' });
    process.exitCode = r.status == null ? 1 : r.status;
  } finally { rmSync(d, { recursive: true, force: true }); }
})().catch(e => { console.error('❌ ' + e.message); process.exit(1); });
