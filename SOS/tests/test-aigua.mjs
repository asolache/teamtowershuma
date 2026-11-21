/* L'Aigua · la peça compartida i la pantalla · sense navegador
 * ─────────────────────────────────────────────────────────────
 * `SOS/lib/aigua.js` la fan servir `aigua.html`, la visió i Boreal Light (per
 * herència). Es prova que els càlculs donen el que diuen, que cada xifra porta
 * la seva font i que la pàgina no publica cap preu de l'aigua (veda 61 i
 * «todo sin precios», 21/11/2026).
 *
 *   node SOS/tests/test-aigua.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));
await import(join(DIR, '..', 'lib', 'aigua.js'));
const A = globalThis.Aigua;
let fails = 0;
const ok = (c, m) => { if (c) console.log('  ✓ ' + m); else { fails++; console.log('  ✗ ' + m); } };

console.log('\nEls càlculs');
ok(A.lpdDeFactura(12, 60, 2) === 100, '12 m³ en 60 dies per a 2 persones són 100 l per persona i dia');
ok(A.lpdDeFactura(12, 0, 2) === 0 && A.lpdDeFactura(12, 60, 0) === 0, 'sense dies o sense persones no s\'inventa res');
ok(A.anualLlar(2, 100) === 73, '2 persones a 100 l/dia són 73 m³ l\'any');
const m = A.mesurat(20, 15);
ok(m.m3 === 5 && m.pct === 25 && m.eur === null, 'abans 20, després 15: 5 m³, un 25 %, i cap euro sense preu');
ok(A.mesurat(20, 15, 2).eur === 10, 'amb el preu de la factura, els euros');
const g = A.grup([{ abans: 10, despres: 8 }, { abans: 10, despres: 7 }, { abans: 10 }]);
ok(g.llars === 2 && g.m3 === 5, 'el grup suma només les llars amb les dues lectures');
ok(A.perdues(100, 85.4).pct === 14.6, 'pèrdues: el que entra menys el que marquen els comptadors');
const pl = A.perLlar({ persones: 2.5 });
ok(pl.m3Any > 0 && pl.estalviM3 < pl.m3Any && /OCU/.test(pl.nota), 'per al simulador: volum per llar i el sostre dit com a sostre');

console.log('\nLes fonts');
const fonts = Object.values(A.FONTS);
ok(fonts.every(f => /^https:\/\//.test(f.url) && f.nom.length > 10), 'cada font té nom i adreça');
ok([A.REFERENCIES.catalunya, A.REFERENCIES.espanya, A.PERDUES_XARXA, A.SOSTRE_EQUIPS].every(r => A.FONTS[r.font]),
  'cada xifra apunta a una font que existeix');

console.log('\nLa pàgina');
const P = readFileSync(join(DIR, '..', 'aigua.html'), 'utf8');
ok(/<body data-pantalla>/.test(P) && /lib\/pantalla\.js/.test(P), 'és de pantalles, no un rotlle');
ok(/lib\/aigua\.js/.test(P), 'fa servir la peça compartida');
const text = P.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
ok(!/\d[\d.,]*\s*€/.test(text), 'cap import en euros escrit a la pàgina');
ok(/formacio\.html#m4/.test(P) && /\/boreal-light\//.test(P), 'enllaça el mòdul de formació i Boreal Light');
const ids = [...P.matchAll(/<section id="([^"]+)"/g)].map(x => x[1]);
ok(ids.length >= 5, ids.length + ' pantalles amb enllaç propi: ' + ids.join(', '));

console.log(fails ? `\n❌ ${fails} prova(es) de l'aigua fallen.` : '\n✅ L\'Aigua · la peça i la pantalla quadren.');
process.exit(fails ? 1 : 0);
