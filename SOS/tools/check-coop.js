#!/usr/bin/env node
/* Guarda de la cooperativa de treball · el Slicing Pie vist per qui hi treballa
 * ─────────────────────────────────────────────────────────────────────────────
 * L'equity que ja hi havia mira la tarta des de qui reparteix. La pestanya de
 * «la meva llesca» la mira des de qui hi treballa, i això canvia què pot fallar:
 *
 *   · **Que la pantalla escrigui.** Una llesca no es toca: surt d'apunts
 *     signats al ledger i prou. Una pantalla que pogués ajustar un percentatge
 *     —encara que fos «per corregir»— convertiria el repartiment en una opinió,
 *     i seria el més fàcil d'afegir sense adonar-se'n.
 *   · **Que la projecció es calculi i no s'ensenyi.** El sentit d'aquesta
 *     pantalla és dir **abans** què costa parar. Calculada i amagada, això torna
 *     a ser el gràfic de sempre.
 *   · **Que la forquilla salarial no es miri.** La governança d'aquesta dinàmica
 *     declara «forquilla acotada» i la tarifa es fixa **apunt a apunt**: és
 *     exactament on una regla acordada en assemblea es perd sense que salti res.
 *   · **Que un objectiu impossible torni un número.** Demanar el 100% ha de dir
 *     que no pot ser, no tornar una xifra enorme amb aspecte de resposta.
 *
 * Veda 134.
 *
 * Ús:  node SOS/tools/check-coop.js
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const APP = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;
const bloc = (des, fins) => {
  const i = APP.indexOf(des); if (i < 0) return '';
  const j = APP.indexOf(fins, i + des.length);
  return j < 0 ? '' : APP.slice(i, j + fins.length);
};

console.log('\nGuarda de la cooperativa · la llesca no es toca, i la forquilla es mira');

const render = bloc('function renderLlesca(', '\nfunction renderEquity');
if (!render) {
  bad('no es troba la pantalla de la llesca');
  console.log(`\n❌ ${pl(fails, 'problema', 'problemes')} a la cooperativa.`);
  process.exit(1);
}

/* ── 1 · La pantalla no escriu llesques ─────────────────────────────────── */
/* Els camps de formulari també tenen `.value`, i posar-hi un valor per defecte
   no és tocar cap repartiment. Es miren els receptors: els controls creats amb
   `el('input')` o `el('select')` queden fora, la resta no. */
const controls = new Set([...render.matchAll(/const\s+(\w+)\s*=\s*el\('(?:input|select|textarea)'/g)]
  .map(m => m[1]));
const escriu = [...render.matchAll(/(\w+)\.(slices|pct|rate|value)\s*=(?!=)/g)]
  .filter(m => !controls.has(m[1]))
  .map(m => m[0]);
if (!escriu.length) ok('la pantalla no assigna cap llesca, percentatge, tarifa ni import: només llegeix' +
  (controls.size ? ` (${controls.size} camps de formulari a part)` : ''));
else bad(`${pl(escriu.length, 'assignació escriu', 'assignacions escriuen')} sobre el repartiment ` +
  `(${escriu.join(', ')}): una llesca surt d'apunts signats, no d'una pantalla`);
/* Les aportacions han de passar pel camí de sempre, que és el que signa. */
if (/openContributionModal\(node\)/.test(render))
  ok('i registrar una aportació passa pel camí de sempre, que és el que signa');
else bad('la pantalla no porta al registre d\'aportacions existent: obrir-ne un segon camí ' +
  'faria que el repartiment depengués de per on has entrat');
/* L'única cosa d'estat que pot tocar és quina persona es mira. */
const estats = [...new Set([...render.matchAll(/state\.([A-Za-z]+)\s*=(?!=)/g)].map(m => m[1]))];
if (!estats.length || (estats.length === 1 && estats[0] === 'llescaId'))
  ok('i l\'únic que desa és qui s\'està mirant');
else bad(`la pantalla escriu a l'estat de l'app: ${estats.join(', ')}`);

/* ── 2 · La projecció existeix i s'ensenya ──────────────────────────────── */
const dil = bloc('function dilucio(', '\n}');
if (/costDeParar/.test(dil) && /parant/.test(dil) && /seguint/.test(dil))
  ok('la projecció dona les dues xifres i la diferència: seguir, parar, i què costa');
else bad('la projecció no compara seguir amb parar, que és tot el que aporta');
const usos = (APP.match(/dilucio\(/g) || []).length;
if (usos >= 3) ok(`i s'ensenya: es crida a ${usos} llocs`);
else bad(`la projecció es declara i gairebé no es fa servir (${usos} crides): calcular-la i no ` +
  'ensenyar-la és tornar al gràfic de sempre');
if (/costa parar/.test(render) && /una traïció|traïció/.test(render))
  ok('i la pantalla diu per què val la pena saber-ho abans');
else bad('la pantalla no explica què guanya qui ho sap abans');
/* La frase que és el nervi de tot això. */
if (/El teu percentatge no és teu/.test(render))
  ok('i diu la cosa que la gent no sap del Slicing Pie, amb totes les lletres');
else bad('la pantalla no diu que el percentatge és una raó i baixa quan altres aporten: ' +
  'sense això és un número més');

/* ── 3 · La forquilla salarial ──────────────────────────────────────────── */
const max = (APP.match(/const FORQUILLA_MAX=(\d+(?:\.\d+)?)/) || [])[1];
if (max && Number(max) > 1) ok(`la forquilla màxima va declarada: ${max}:1`);
else bad('no hi ha forquilla salarial declarada: la governança d\'aquesta dinàmica en demana una');
const forq = bloc('function forquilla(', '\n}');
/* S'ha de calcular de les tarifes de debò del registre, no del paràmetre del
   node: el paràmetre és el valor per defecte, i la forquilla es perd justament
   quan algú posa una tarifa a mà en un apunt. */
if (/e\.rate/.test(forq) && /node\.ledger/.test(forq))
  ok('i es calcula de les tarifes que hi ha als apunts, que és on es perd');
else bad('la forquilla no mira les tarifes dels apunts: mirar només el paràmetre del node ' +
  'no veuria mai el cas que la trenca');
if (/FORQUILLA_MAX/.test(render) && /forquilla\(node\)/.test(render))
  ok('i surt a la pantalla amb el seu número');
else bad('la forquilla no es pinta enlloc');

/* ── 4 · Un objectiu impossible no torna una xifra ──────────────────────── */
const hp = bloc('function horesPer(', '\n}');
if (/impossible:true/.test(hp) && /p>=1/.test(hp.replace(/\s+/g, '')))
  ok('demanar el 100% diu que no pot ser, en comptes de tornar un número enorme');
else bad('un objectiu del 100% torna una xifra: seria una divisió per zero amb aspecte de resposta');
if (/jaHiEts:true/.test(hp))
  ok('i si ja hi ets, ho diu en comptes de demanar-te hores negatives');
else bad('un objectiu ja assolit no es distingeix: sortirien hores negatives');

/* ── 5 · La pestanya s'ofereix on toca ──────────────────────────────────── */
/* No n'hi ha prou que la dinàmica tingui pestanyes: **aquesta** ha de ser-hi,
   i s'ha de pintar. Comprovar només que hi hagi un `tdefs.push` deixava passar
   que algú tragués la llesca i deixés la resta. */
const linia = (APP.match(/coop_treball'\)tdefs\.push\([^\n]*/) || [''])[0];
if (/'llesca'/.test(linia)) ok('la pestanya s\'ofereix als projectes de cooperativa de treball');
else bad('els projectes de cooperativa no ofereixen la pestanya de la llesca: la feina no arriba a ningú');
if (/state\.tab==='llesca'\)renderLlesca/.test(APP)) ok('i es pinta quan s\'hi entra');
else bad('la pestanya es declara i no es pinta: sortiria en blanc');
if (/^\s{2}llesca:\{ic:/m.test(APP)) ok('i té guia contextual, com totes');
else bad('la pestanya no té entrada a CONTEXT_GUIDES');

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} a la cooperativa.`
  : '\n✅ La llesca només es llegeix, la projecció s\'ensenya i la forquilla es mira.');
process.exit(fails ? 1 : 0);
