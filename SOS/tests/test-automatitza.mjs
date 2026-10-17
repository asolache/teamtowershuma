/* El x % automatitzable d'un mapa de valor
 * ────────────────────────────────────────
 * El veredicte de cada lliurament (el prepara la màquina, el fa una persona o
 * es decideix a la visita) és el de la regla de l'app, i per això el celler de
 * la landing dona aquí el mateix que a la landing: 1 de màquina, 5 a la visita
 * i 10 de persona (veda 164). Els productes només posen nom al que la màquina
 * ja prepara; no canvien cap veredicte.
 *
 *   node SOS/tests/test-automatitza.mjs
 */
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
const req = createRequire(import.meta.url);
const X = req('../tools/automatitza.js');
const { CELLER } = req('../tools/build-mapavalor.js');
let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log(`  ${c ? '✓' : '✗'} ${m}`); };

const celler = { abast: 'celler', rols: CELLER.nodes.map(n => n.id), processos: [], seq: [], tipus: CELLER.tipus,
  parells: CELLER.parells.map(p => p.slice(0, 6).join(' | ')) };

console.log('\nEl mateix número que la landing i l\'app');
{
  const r = X.mesura(celler);
  ok(r.total === 16 && r.maquina === 1 && r.visita === 5 && r.persona === 10, `el celler: ${r.maquina} de màquina, ${r.visita} a la visita, ${r.persona} de persona (la landing: 1 / 5 / 10)`);
  const ex = JSON.parse(execFileSync('node', [new URL('../tools/revisa-mapa.js', import.meta.url).pathname, '--exemple'], { encoding: 'utf8' }));
  const e = X.mesura(ex);
  ok(e.total === 14 && e.maquina === 1, `l'exemple del kit: ${e.maquina} de ${e.total}, com l'app`);
  const de = q => r.lliuraments.find(l => l.que === q);
  ok(de('volum a preu de canal').qui === 'maquina' && de('volum a preu de canal').tipus === 'comanda', 'el tipus posat a mà mana, com al Kanban');
  ok(r.lliuraments.filter(l => l.tipus === 'cobrament').every(l => l.qui === 'persona'), 'els diners són de persona perquè l\'app ho diu');
  ok(r.lliuraments.filter(l => l.mena === 'intangible').every(l => l.qui === 'persona'), 'cap intangible és de la màquina');
}

console.log('\nEls productes només posen nom');
{
  const m = { abast: 'x', rols: ['Casa', 'Client'], processos: [], seq: [],
    parells: ['Casa | Client | tangible | comanda de material per ruta | intangible | confiança', 'Casa | Client | tangible | fruita de temporada | intangible | record'] };
  const r = X.mesura(m), de = q => r.lliuraments.find(l => l.que === q);
  ok(de('comanda de material per ruta').qui === 'maquina' && de('comanda de material per ruta').producte === 'Tu red en el mapa', 'el que la màquina ja prepara porta el nom del producte');
  ok(de('fruita de temporada').qui === 'visita' && !de('fruita de temporada').producte, 'un producte no converteix en màquina el que l\'app deixa per a la visita');
  const md = X.aMarkdown(X.mesura(celler, { esbos: true }), 'es');
  ok(/la máquina puede preparar \*\*1\*\*/.test(md) && /Estimación/.test(md) && /en la visita/.test(md), 'el lead ho llegeix en castellà, amb les tres caselles i l\'avís d\'estimació');
  ok(!/sistema solo/.test(md) && !/\d\s?€/.test(md), 'sense «lo puede hacer el sistema solo» i sense preus');
}

console.log(`\n${fail ? '❌' : '✅'} ${pass + fail} assercions, ${fail} vermelles`);
process.exit(fail ? 1 : 0);
