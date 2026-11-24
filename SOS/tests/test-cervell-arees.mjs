/* El cervell per àrees · sense navegador
 * ─────────────────────────────────────────
 * L'Álvaro (24/11/2026): cada una de les dotze àrees té la seva zona a l'espai
 * 3D, i cada veda es col·loca per gravetat al punt d'equilibri entre les àrees
 * que l'estiren. Aquí es prova la lectura (codex-parse.js) i la llei (forces.js).
 *
 *   node SOS/tests/test-cervell-arees.mjs
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const ARREL = fileURLToPath(new URL('../../', import.meta.url));
const CP = require('../cervell/codex-parse.js'), F = require('../cervell/forces.js'), MV = require('../lib/mapa-valor.js');
let n = 0, fails = 0;
const ok = (c, t) => { n++; if (c) console.log('  ✓ ' + t); else { fails++; console.log('  ✗ ' + t); } };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const ids = MV.AREES.map(a => a.id);

/* Les zones: dotze, a la mateixa distància del centre, ben separades, direcció a dalt. */
const Z = F.zones(ids);
ok(Object.keys(Z).length === 12 && ids.every(k => Math.abs(Math.hypot(...Z[k]) - 1) < 1e-9), 'dotze zones, totes a distància 1 del centre');
let min = 9; ids.forEach((a, i) => ids.forEach((b, j) => { if (i < j) min = Math.min(min, dist(Z[a], Z[b])); }));
ok(min > 1, 'cap zona no trepitja una altra (vèrtexs d\'un icosàedre)');
ok(Z.strategy[1] > 0.99, 'direcció i estratègia, a dalt de tot');
ids.forEach(k => ok(!!F.COLOR_AREA[k], 'color per a ' + k));

/* La lectura: «**Àrees:**» al cos mana; si no, les paraules. */
const codex = [
  '## Veda 1 — Un preu es pregunta', 'El preu, el pagament i la factura del client. **Àrees:** finances, vendes', '',
  '## Veda 2 — La guarda del codi', 'Una guarda al CI comprova el codi HTML i el JSON de cada pàgina.', '',
  '## Veda 3 — El que no diu res', 'Una frase sense cap paraula de cap àrea.', ''
].join('\n');
const L = CP.lee(codex, { nom: 'x', arees: MV.AREES });
const [v1, v2, v3] = L.nodos;
ok(v1.areesFixades && v1.arees.finance === 0.5 && v1.arees.sales === 0.5, 'una veda que diu les seves àrees mana, a parts iguals');
ok(F.areaMajor(v2) === 'systems', 'les paraules de l\'obra la porten a sistemes i dades');
ok(!Object.keys(v3.arees).length, 'una veda sense cap àrea no s\'inventa cap');
ok(L.nodos.every(v => Math.abs(Object.values(v.arees).reduce((s, x) => s + x, 0) - (Object.keys(v.arees).length ? 1 : 0)) < 0.02), 'els pesos de cada veda sumen 1');

/* La llei: una àrea sola, a la seva zona; dues, entre elles; cap, al centre. */
const D = { nodos: [
  { id: 'a', n: 1, capa: 'anna', saberes: [], arees: { finance: 1 } },
  { id: 'b', n: 2, capa: 'anna', saberes: [], arees: { finance: 0.5, people: 0.5 } },
  { id: 'c', n: 3, capa: 'anna', saberes: [], arees: {} },
  { id: 'd', n: 4, capa: 'anna', saberes: [], arees: { finance: 0.8, people: 0.2 } }
], aristas: [] };
const R = F.colocaArees(D, F.analiza(D), ids);
ok(dist(R.P.a, Z.finance) < 0.2, 'la veda d\'una sola àrea cau a la seva zona');
ok(Math.abs(dist(R.P.b, Z.finance) - dist(R.P.b, Z.people)) < 0.15, 'la de dues àrees iguals queda a mig camí');
ok(dist(R.P.d, Z.finance) < dist(R.P.d, Z.people), 'la que pesa més estira més');
ok(Math.hypot(...R.P.c) < 0.2, 'la que no té àrea cau al centre, a la cultura');

/* El codex de debò: cada veda té lloc, i el càlcul és prou ràpid per al mòbil. */
const real = CP.lee(readFileSync(ARREL + 'SOS/knowledge/codex.md', 'utf8'), { nom: 'tt', arees: MV.AREES });
const DR = { nodos: real.nodos, aristas: CP.limpia(real.nodos, real.aristas) };
DR.nodos.forEach((v, i) => { v.i = i; v.saberes = v.saberes || []; });
const t0 = Date.now(), RR = F.colocaArees(DR, F.analiza(DR), ids), ms = Date.now() - t0;
ok(DR.nodos.every(v => RR.P[v.id].every(Number.isFinite)), 'les ' + DR.nodos.length + ' vedes del codex tenen posició');
ok(DR.nodos.filter(v => Object.keys(v.arees).length).length >= DR.nodos.length * 0.9, 'gairebé totes les vedes del codex tenen àrea');
ok(ms < 1500, 'la llei s\'equilibra en ' + ms + ' ms');

console.log(fails ? `\n❌ ${fails} de ${n} fallen\n` : `\n✅ ${n} comprovacions · cada veda al seu punt d'equilibri\n`);
process.exit(fails ? 1 : 0);
