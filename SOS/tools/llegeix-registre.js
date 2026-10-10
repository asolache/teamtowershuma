#!/usr/bin/env node
/* El registre viu, llegit · el mapa real que surt de l'ús
 * ─────────────────────────────────────────────────────────
 * Fase 2 del pla. Llegeix el CSV que exporta Netlify Forms del formulari
 * `registre` de la web del client (o un JSON amb les mateixes columnes) i el
 * compara amb el mapa dibuixat. Fa servir **el mateix codi** que l'editor: el
 * bloc VS-REG de `SOS/vna-suport.html`, llegit tal com hi és.
 *
 *   node SOS/tools/llegeix-registre.js mapa-real.json registre.csv carpeta/ [--llengua ca|es]
 *
 * Escriu a la carpeta:
 *   informe.md          la lectura: fluxos vius, adormits, nous i rols sense reciprocitat
 *   mapa-observat.json  el mapa que surt del registre, amb el dibuixat com a ideal;
 *                       a l'editor, la vista «Desviació» ensenya on s'atura el valor
 *   avisos.json         el que la fase 3 enviarà per webhook, amb els noms del pla
 *
 * Del CSV només es queden rols, lliurament, tipus, data, evidència i valor:
 * qualsevol altra columna (noms, correus, IP) no arriba enlloc. */
'use strict';
const { readFileSync, writeFileSync, mkdirSync } = require('node:fs');
const { join } = require('node:path');

const html = readFileSync(join(__dirname, '..', 'vna-suport.html'), 'utf8');
const a = html.indexOf('/*VS-REG*/'), b = html.indexOf('/*/VS-REG*/');
if (a < 0 || b <= a) throw new Error('Falta el bloc VS-REG a vna-suport.html');
const { llegeixRegistre, observaRegistre } = new Function('\'use strict\';\n' + html.slice(a, b) + '\nreturn { llegeixRegistre, observaRegistre };')();

function llegeix(mapa, text, opts) {
  const r = llegeixRegistre(text);
  return Object.assign({ ignorades: r.ignorades, files: r.files.length }, observaRegistre(mapa, r.files, opts || {}));
}
module.exports = { llegeix, llegeixRegistre, observaRegistre };

if (require.main === module) {
  const arg = process.argv.slice(2), pos = [], opts = {};
  for (let i = 0; i < arg.length; i++) { if (arg[i] === '--llengua') opts.llengua = arg[++i]; else pos.push(arg[i]); }
  if (pos.length < 3) { console.error('Ús: node SOS/tools/llegeix-registre.js mapa-real.json registre.csv carpeta/ [--llengua ca|es]'); process.exit(2); }
  const r = llegeix(JSON.parse(readFileSync(pos[0], 'utf8')), readFileSync(pos[1], 'utf8'), opts);
  mkdirSync(pos[2], { recursive: true });
  writeFileSync(join(pos[2], 'informe.md'), r.informe);
  writeFileSync(join(pos[2], 'mapa-observat.json'), JSON.stringify(r.mapaObservat, null, 2) + '\n');
  writeFileSync(join(pos[2], 'avisos.json'), JSON.stringify(r.avisos, null, 2) + '\n');
  console.log('✅ ' + r.files + ' transaccions llegides' + (r.ignorades ? ', ' + r.ignorades + ' descartades' : '') + ': ' + r.vius.length + ' fluxos vius, '
    + r.morts.length + ' sense ús, ' + r.nous.length + ' nous, ' + r.avisos.length + ' avisos');
}
