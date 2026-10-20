/* El nucli del mapa de valor · sense navegador
 * ─────────────────────────────────────────────
 * `SOS/lib/mapa-valor.js` és el que carreguen l'app i l'editor: les deu
 * regles i el pont entre el mapa de l'app (per id) i la forma canònica (per
 * nom). Aquí es prova que el pont no perd res i que la nota de l'app és la de
 * l'editor.
 *
 *   node SOS/tests/test-mapa-valor.mjs
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));
const MV = createRequire(import.meta.url)(join(DIR, '..', 'lib', 'mapa-valor.js'));
let fails = 0, n = 0;
const ok = (c, m) => { n++; if (c) console.log('  ✓ ' + m); else { fails++; console.log('  ✗ ' + m); } };

/* L'exemple de l'editor, tal com hi és. */
const html = readFileSync(join(DIR, '..', 'vna-suport.html'), 'utf8');
const k0 = html.indexOf('const EXEMPLE = {'), k1 = html.indexOf('};', k0) + 2;
const TEXT = new Function(html.slice(k0, k1).replace('const EXEMPLE =', 'return'))();
/* L'exemple és en text (els sis camps): el model de l'editor el llegeix. */
const bloc = nom => html.slice(html.indexOf('/*' + nom + '*/'), html.indexOf('/*/' + nom + '*/'));
const { creaDiagnosi, creaModel } = new Function('\'use strict\';\n' + bloc('VS-MOTOR') + '\n' + bloc('VS-DIAG') + '\n'
  + bloc('VS-MODEL') + '\nreturn { creaDiagnosi, creaModel };')();
const D = creaDiagnosi(MV), M = creaModel({ fluxos: MV.fluxos, revisa: MV.revisa, normNom: D.normNom });
const EXEMPLE = M.llegeixTextos(M.importa(TEXT).arbre.real.t);

console.log('\nEl nucli del mapa de valor');

console.log('\nT1 · Una sola llista de regles');
ok(MV.REGLES.length === 10 && MV.REGLES.filter(r => r.dur).length === 7, '10 regles, 7 dures');
const a0 = html.indexOf('/*VS-MOTOR*/'), b0 = html.indexOf('/*/VS-MOTOR*/');
const lib = readFileSync(join(DIR, '..', 'lib', 'mapa-valor.js'), 'utf8');
ok(lib.includes(html.slice(a0 + 12, b0).trim()), 'el motor de l\'editor és dins del nucli, lletra per lletra');

console.log('\nT2 · Canònic → app → canònic no perd res');
let i = 0; const id = () => 'x' + (++i);
const app = MV.aApp(EXEMPLE, id);
const torna = MV.deApp(app, { abast: EXEMPLE.abast });
const clau = m => MV.fluxos(m).map(f => f.clau + '|' + f.mena + '|' + f.q).sort().join('\n');
ok(clau(torna) === clau(EXEMPLE), `${MV.fluxos(EXEMPLE).length} lliuraments iguals en anar i tornar`);
ok(torna.roles.length === new Set([...EXEMPLE.roles, ...MV.fluxos(EXEMPLE).flatMap(f => [f.de, f.a])]).size, 'els mateixos rols');
const base = Object.assign({}, EXEMPLE, { processos: [], seq: {}, troballes: [] });
const rb = MV.revisa(base).regles.map(r => r.ok).join(), rt = MV.revisa(torna).regles.map(r => r.ok).join();
ok(rb === rt, 'les deu regles diuen el mateix del mapa abans i després del pont');

console.log('\nT3 · El que només va en un sentit, ho diu la regla 4');
const v = { roles: [{ id: 'a', name: 'Qui demana' }, { id: 'b', name: 'Qui fa' }, { id: 'c', name: 'Qui mira' }],
  exchanges: [{ from: 'a', to: 'b', kind: 'tangible', label: 'la comanda' }, { from: 'b', to: 'a', kind: 'intangible', label: 'l\'avís' },
    { from: 'b', to: 'c', kind: 'tangible', label: '' }] };
const c = MV.deApp(v);
ok(c.pairs.length === 2 && c.pairs[0][5] === 'l\'avís', 'A→B i B→A fan una parella');
ok(c.pairs[1][4] === '' && c.pairs[1][3] === '(sense nom)', 'el que no torna queda amb el retorn buit, i sense nom no es perd');
const r4 = MV.revisa(c).regles.find(r => r.id === 'reciprocitat');
ok(!r4.ok && /a mitges/.test(r4.diu), 'regla 4: «' + r4.diu.slice(0, 40) + '…»');

console.log('\nT4 · Una sola nota');
const s = MV.salut(EXEMPLE), buit = MV.salut({});
ok(s.punts >= 0 && s.punts <= 100 && s.regles.length === 10, `l'exemple de l'editor: ${s.punts}/100`);
const sp = MV.salut(EXEMPLE, { treu: ['processos'] });
ok(sp.regles.length === 9 && sp.fora.length === 1 && sp.fora[0].id === 'processos', 'qui no guarda processos en treu la regla 10, i queda dit a `fora`');
ok(buit.punts === 0 && !buit.passa, 'un mapa sense lliuraments és 0 i no passa');

console.log('\nT5 · Un rol no és una organització');
{ const R = ['Qui fa el vi', 'Qui acull', 'Qui dinamitza', 'Qui encarrega', 'Qui serveix', 'Qui cobra'];
  const m = { abast: 'Des que una empresa pensa una jornada fins que està cobrada', roles: R,
    pairs: [[R[0], R[3], 'tangible', 'el vi', 'intangible', 'el que en pensa'], [R[1], R[3], 'tangible', 'la sala', 'tangible', 'la reserva']],
    orgs: [{ nom: 'Celler A', rols: [R[0], R[1], R[2]], posicionament: 'Vi de vinya alta', oferta: 'visites' }, { nom: 'Celler B', rols: [R[0]] }],
    dins: { 'Qui acull': { abast: 'Des que arriba el grup fins que marxa', roles: R, pairs: [] } } };
  const L = MV.lecturaOrgs(m);
  ok(L.multi.length === 1 && L.multi[0].rols.length === 3, 'Celler A fa tres rols');
  ok(L.compartits.length === 1 && L.compartits[0].senseLloc[0] === 'Celler B', 'el rol compartit diu a qui li falta posicionament');
  ok(L.senseOrg.join() === [R[3], R[4], R[5]].join(), 'i quins rols no ocupa ningú');
  const eA = MV.escalaOrg(m, 'Celler A'), eB = MV.escalaOrg(m, 'Celler B');
  ok(eB.esglao === null && eB.seguent === 'fitxa' && /posicionament/.test(eB.falta[0]), 'B encara no té fitxa: li falta el posicionament');
  ok(eA.esglao === 'pagina' && eA.seguent === 'web' && /regles dures/.test(eA.falta[0]), 'A té pàgina; per a la web, el seu mapa ha de passar les regles');
  ok(MV.mapaOrg(m, 'Celler A').abast === 'Des que arriba el grup fins que marxa', 'el seu mapa és el de dins del seu rol');
  const r = MV.fusiona({}, m, (() => { let k = 0; return () => 'o' + (++k); })()), t = MV.exporta(r.vna, { abast: m.abast, resta: r.resta });
  ok(r.orgs === 2 && JSON.stringify(t.orgs) === JSON.stringify(m.orgs), 'les organitzacions van i tornen de l\'app sense perdre res');
  ok(JSON.stringify(MV.orgsDe({ ocupa: { A: { nodo: 'x' }, B: { nodo: 'x' }, C: { datos: 'y' } } })) === '[{"nom":"x","rols":["A","B"]}]',
    'un mapa amb `ocupa` en surt agrupant pel node');
}

console.log(fails ? `\n❌ ${fails} de ${n} fallen\n` : `\n✅ ${n} comprovacions · el nucli del mapa és un de sol\n`);
process.exit(fails ? 1 : 0);
