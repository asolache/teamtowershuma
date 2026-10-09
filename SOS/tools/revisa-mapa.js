#!/usr/bin/env node
/* Revisar un mapa de valor · sense navegador
 * ─────────────────────────────────────────────────────────────────
 * Una IA que proposa un mapa sense que ningú el revisi torna un organigrama amb
 * fletxes, i com que la forma és correcta s'accepta (veda 116). Aquí el mapa
 * passa pel **mateix diagnòstic** que l'editor (`SOS/vna-suport.html`): en
 * llegeix els blocs VS-MOTOR, VS-DIAG i VS-MODEL tal com hi són, com fa
 * `web-del-mapa.js`. Així una sessió de Claude al projecte d'un client pot
 * esborrar un mapa, revisar-lo amb les regles de la casa i corregir-lo abans
 * que el vegi ningú, sense API ni navegador.
 *
 *   node SOS/tools/revisa-mapa.js mapa.json [--json]
 *   node SOS/tools/revisa-mapa.js --exemple       el format, amb el cas del celler
 *
 * Surt amb 1 si el diagnòstic és provisional (hi ha una regla dura oberta): un
 * mapa així no es lliura com a esborrany, es corregeix. */
'use strict';
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const html = readFileSync(join(__dirname, '..', 'vna-suport.html'), 'utf8');
const bloc = nom => {
  const a = html.indexOf('/*' + nom + '*/'), b = html.indexOf('/*/' + nom + '*/');
  if (a < 0 || b <= a) throw new Error('Falta el bloc ' + nom + ' a vna-suport.html');
  return html.slice(a, b);
};
const motor = new Function('\'use strict\';\n' + ['VS-MOTOR', 'VS-DIAG', 'VS-MODEL'].map(bloc).join('\n')
  + '\nreturn { revisa, fluxos, creaDiagnosi, creaModel };')();
const D = motor.creaDiagnosi({ revisa: motor.revisa, fluxos: motor.fluxos });
const M = motor.creaModel({ fluxos: motor.fluxos, revisa: motor.revisa, normNom: D.normNom });

/* El format és el de «Copia el JSON» de l'editor; el de línies (abast, rols,
   parells «A | B | t | lliura | i | torna», processos, seq) també s'accepta,
   que és el que escriu més fàcil un model. */
function model(entrada) {
  try { return M.llegeixTextos(M.importa(entrada).arbre.real.t); }
  catch (e) { return M.llegeixTextos(M.aTextos(entrada)); }
}
function diagnostica(entrada) { return D.diagnostica(model(entrada)); }
module.exports = { diagnostica };

if (require.main === module) {
  const a = process.argv.slice(2);
  if (a.includes('--exemple')) {
    const k0 = html.indexOf('const EXEMPLE = {'), k1 = html.indexOf('};', k0) + 2;
    console.log(JSON.stringify(new Function(html.slice(k0, k1).replace('const EXEMPLE =', 'return'))(), null, 2));
    process.exit(0);
  }
  if (!a[0]) { console.error('Ús: node SOS/tools/revisa-mapa.js mapa.json [--json]  ·  --exemple'); process.exit(2); }
  const r = diagnostica(JSON.parse(readFileSync(a[0], 'utf8')));
  if (a.includes('--json')) { console.log(JSON.stringify(r, null, 2)); process.exit(r.provisional ? 1 : 0); }
  const mm = r.nivells[0].metriques;
  console.log(`\n${r.provisional ? '✗ Provisional: hi ha una regla dura oberta' : '✓ Passa les regles dures'}`);
  console.log(`  densitat ${mm.densitat} % · concentració ${mm.concentracio} % · intangibles ${mm.pctI} % · hub ${mm.hub || '—'}`);
  const ordre = { alta: 0, mitjana: 1, baixa: 2, nota: 3 };
  r.troballes.slice().sort((x, y) => (ordre[x.gravetat] ?? 9) - (ordre[y.gravetat] ?? 9)).forEach(t => {
    console.log(`  [${t.gravetat}] ${t.codi}${t.nivell && t.nivell.rol ? ' · ' + t.nivell.rol : ''}${t.pregunta ? ' — ' + t.pregunta : ''}`);
  });
  console.log(`\n${r.troballes.length} troballes. Les tres per començar: ${r.resum.primeres.join(', ')}`);
  process.exit(r.provisional ? 1 : 0);
}
