/* La base única de mapes de valor · sense navegador
 * ──────────────────────────────────────────────────
 * `SOS/lib/base-vna.js` llegeix `SOS/knowledge/vna/base.json`: tria la peça que
 * s'assembla al que diu la persona, en dona el mapa amb la capa (kosha) de
 * cada intercanvi i diu què li falta al mapa de la persona. Aquí es prova que
 * fa això i que la base no porta preus.
 *
 *   node SOS/tests/test-base-vna.mjs
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));
const BV = createRequire(import.meta.url)(join(DIR, '..', 'lib', 'base-vna.js'));
const text = readFileSync(join(DIR, '..', 'knowledge', 'vna', 'base.json'), 'utf8'), B = JSON.parse(text);
let fails = 0, n = 0;
const ok = (c, m) => { n++; if (c) console.log('  ✓ ' + m); else { fails++; console.log('  ✗ ' + m); } };

console.log('Les capes');
ok(BV.CAPES.length === 5 && BV.CAPES.map(c => c.kosha).join() === 'annamaya,pranamaya,manomaya,vijnanamaya,anandamaya', 'cinc capes, de la més densa a la més subtil');
ok(BV.capa('pago de la compra', 'tangible') === 'energia', 'un pagament és energia');
ok(BV.capa('vino embotellado', 'tangible') === 'cos', 'un producte és cos');
ok(BV.capa('aviso de novedades', 'intangible') === 'ment', 'un avís és ment');
ok(BV.capa('confianza para volver', 'intangible') === 'discerniment', 'la confiança és discerniment, encara que porti a comprar');
ok(BV.capa('sentido de pertenencia', 'intangible') === 'proposit', 'la pertinença és propòsit');

console.log('Triar la peça');
ok((BV.tria(B, 'bodega familiar de cava', 1)[0] || {}).id === 'ofici_celler', '«bodega familiar de cava» → el celler');
ok((BV.tria(B, 'club de fútbol de barrio', 1)[0] || {}).id === 'dom_sports-team', '«club de fútbol» → l\'equip esportiu, no la botiga del barri');
ok(BV.tria(B, '', 3).length === 0, 'sense text, cap peça');

console.log('El que falta');
const f = BV.forats(B, 'ofici_celler', { roles: ['Bodega', 'Clientes'], pairs: [['Bodega', 'Clientes', 'tangible', 'vino', 'tangible', 'pago']] });
ok(f && f.rols.length > 0 && f.intangibles.length > 0, 'un mapa de dos rols i un parell: falten rols i intangibles');
ok(f && f.capesBuides.indexOf('proposit') >= 0 && f.capesBuides.indexOf('cos') < 0, 'i diu quines capes són buides (propòsit sí, cos no)');
const p = B.peces.find(x => x.id === 'ofici_celler');
ok(BV.forats(B, p, { roles: p.rols.map(r => r.nom), pairs: p.intercanvis }).rols.length === 0, 'el mapa de la mateixa peça no li falta cap rol');

console.log('La base');
ok(B.cataleg.classes === 651 && B.classes.length === 651, 'les 651 classes de la NACE 2.1');
ok(B.cobertura.exacta + B.cobertura.aproximada + B.cobertura.nomesSector + B.cobertura.res === 651, 'la cobertura suma el catàleg');
ok(B.pendents.every(c => B.classes.find(x => x.codi === c).nivell !== 'exacta'), 'cap pendent té ja ofici exacte');
ok(B.peces.every(x => (x.capes || []).length === (x.intercanvis || []).length), 'cada intercanvi porta la seva capa');
ok(!/fmv_usd|€|\bEUR\b|\$ ?\d/.test(text), 'cap preu a la base (surt a la web)');
console.log(fails ? '\n✗ ' + fails + ' de ' + n + ' proves fallen' : '\n✓ ' + n + ' proves');
process.exit(fails ? 1 : 0);
