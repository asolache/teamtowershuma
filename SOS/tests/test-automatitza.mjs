/* El x % automatitzable d'un mapa de valor
 * ────────────────────────────────────────
 * Cada lliurament queda automàtic, assistit o humà amb el seu motiu, i la xifra
 * surt d'ells: un intangible és sempre humà, el que no encaixa amb cap producte
 * també, un patró només casa a l'inici de paraula, i l'esbós dona estimació.
 * Els productes del catàleg porten nom i no porten preu.
 *
 *   node SOS/tests/test-automatitza.mjs
 */
import { createRequire } from 'node:module';
const req = createRequire(import.meta.url);
const X = req('../tools/automatitza.js');
let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log(`  ${c ? '✓' : '✗'} ${m}`); };

const MAPA = { abast: 'Una casa d\'esdeveniments', rols: ['Casa', 'Client', 'Proveïdor'], parells: [
  'Casa | Client | t | pressupost de l\'esdeveniment | i | confiança',
  'Proveïdor | Casa | t | fitxa i disponibilitat | i | visibilitat',
  'Client | Casa | t | pagament de la reserva | t | factura',
  'Casa | Client | t | fruita de temporada | i | record'
], processos: [], seq: [] };

console.log('\nEl x % es mesura lliurament a lliurament');
{
  const r = X.mesura(MAPA);
  ok(r.total === 8, 'els vuit lliuraments: el que es dona i el que es torna');
  const de = q => r.lliuraments.find(l => l.que === q);
  ok(de('confiança').mode === 'huma' && de('visibilitat').mode === 'huma', 'un intangible és humà, encara que el nom sembli d\'un producte');
  ok(de('pressupost de l\'esdeveniment').mode === 'assistit' && de('pressupost de l\'esdeveniment').producte === 'Del formulario a la propuesta', 'el pressupost és assistit, i diu amb quin producte');
  ok(de('fitxa i disponibilitat').mode === 'automatic' && de('pagament de la reserva').mode === 'automatic', 'la fitxa del partner i el cobrament són automàtics');
  ok(de('fruita de temporada').mode === 'huma' && de('fruita de temporada').motiu.ca.includes('cap producte'), 'el que cap producte fa és humà, i ho diu («ruta» no casa dins de «fruita»)');
  ok(r.automatic === 38 && r.assistit === 13 && r.huma === 49, `les xifres surten dels lliuraments (${r.automatic} / ${r.assistit} / ${r.huma})`);
  ok(r.rols.find(x => x.rol === 'Proveïdor').automatic === 100, 'i per rol que lliura');
  ok(!r.estimacio && X.mesura(MAPA, { esbos: true }).estimacio, 'amb l\'esbós, la xifra és una estimació');
}

console.log('\nEl que veu el lead');
{
  const md = X.aMarkdown(X.mesura(MAPA, { esbos: true }), 'es');
  ok(/\*\*38 %\*\*/.test(md) && /Estimación/.test(md) && /lo estratégico y lo táctico/.test(md), 'en castellà, amb la xifra, l\'avís d\'estimació i on queda la persona');
  ok(md.includes('lo da una persona') && !md.includes('el dona una persona'), 'els motius, en la llengua del lead');
  ok(!/\d\s?€/.test(md), 'sense preus');
  const prods = X.productes();
  ok(prods.length >= 6 && prods.every(p => p.nom && p.diu && p.diu_es && ['automatic', 'assistit'].includes(p.mode)), 'cada producte té nom, motiu en les dues llengües i un mode vàlid');
}

console.log(`\n${fail ? '❌' : '✅'} ${pass + fail} assercions, ${fail} vermelles`);
process.exit(fail ? 1 : 0);
