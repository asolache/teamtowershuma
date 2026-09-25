#!/usr/bin/env node
/* La taxonomia d'entregables, i el fre que la fa acceptable
 * ─────────────────────────────────────────────────────────────────────────────
 * La regla de la casa, escrita a `knowledge/negoci/mapa-kanban-ia.md`:
 *
 *   Cada flux del mapa es converteix en una carta del Kanban. Si el flux és
 *   **tangible** i el seu entregable és **d'un tipus declarat**, la carta és
 *   candidata a la màquina. Si és **intangible**, va a la persona que porta el
 *   rol — i la màquina no la toca mai.
 *
 * El valor d'aquesta regla depèn sencer d'una condició: **que la segona meitat
 * sigui certa**. Si un dia algú posa l'intangible al final de les comprovacions
 * de `fluxAutomatitzable`, o hi afegeix una excepció «només per a aquest cas»,
 * el que es trenca no és una funció — és la promesa que ven la casa, i no ho
 * veurà ningú perquè el resultat seguirà semblant raonable.
 *
 * Per això la guarda no comprova que el resultat estigui bé: comprova **l'ordre
 * del codi**. L'intangible ha de sortir abans que res, i la funció ha de tornar
 * `pot:false` sense mirar res més.
 *
 * La resta és higiene de la taula: ids únics, tots els camps, i cap pista que
 * apunti a un tipus que no existeix —una pista òrfena no peta, simplement deixa
 * de classificar fluxos i ningú se n'adona.
 *
 * Ús:  node SOS/tools/check-entregables.js
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const APP = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');
let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

/* ── Llegir la taula ────────────────────────────────────────────────────── */
const bloc = (() => {
  const i = APP.indexOf('const ENTREGABLES=[');
  if (i < 0) return '';
  const j = APP.indexOf('\n];', i);
  return j < 0 ? '' : APP.slice(i, j);
})();
if (!bloc) { bad('no es troba `ENTREGABLES` a SOS/index.html'); }

const TIPUS = [...bloc.matchAll(/\{id:'([\w-]+)',nom:'((?:[^'\\]|\\.)*)',ic:'([^']*)',maquina:(true|false),/g)]
  .map(m => ({ id: m[1], nom: m[2].replace(/\\'/g, "'"), ic: m[3], maquina: m[4] === 'true' }));

// 1 · La taula hi és i té gruix. Una taxonomia d'un sol tipus no classifica res.
if (TIPUS.length < 4) bad(`només ${TIPUS.length} tipus d'entregable: massa pocs per repartir un mapa`);
else ok(`${TIPUS.length} tipus d'entregable declarats`);

// 2 · Ids únics. Dos tipus amb el mateix id fan que el segon no existeixi i no peta.
(() => {
  const vist = new Set(), rep = [];
  TIPUS.forEach(t => { if (vist.has(t.id)) rep.push(t.id); vist.add(t.id); });
  if (rep.length) bad('ids repetits: ' + rep.join(', '));
  else ok('cap id repetit');
})();

// 3 · Cap tipus a mitges. Sense `que`, `cal` i `surt` no es pot ni explicar a una
//     persona ni demanar a una màquina: és un nom i prou.
(() => {
  const coixos = [];
  TIPUS.forEach(t => {
    const i = bloc.indexOf(`{id:'${t.id}'`);
    const tros = bloc.slice(i, bloc.indexOf('\n  {', i + 1) < 0 ? bloc.length : bloc.indexOf('\n  {', i + 1));
    if (!/que:'/.test(tros) || !/cal:\[/.test(tros) || !/surt:'/.test(tros)) coixos.push(t.id);
  });
  if (coixos.length) bad('tipus sense què és, què cal o què en surt: ' + coixos.join(', '));
  else ok('tots diuen què són, què necessiten i quina forma té la sortida');
})();

/* 4 · Almenys un tipus que **no** surt d'una màquina, i amb el motiu escrit.
       Sense això la taula diria que tot és automatitzable i que els que falten
       és que encara no els hem fet. Que n'hi hagi un de declarat com a no
       automatitzable és el que fa que la resta sigui una decisió i no un
       descuit. */
(() => {
  const noMaq = TIPUS.filter(t => !t.maquina);
  if (!noMaq.length) bad('tots els tipus surten d\'una màquina: falta dir quin no, i per què');
  else {
    const sensMotiu = noMaq.filter(t => {
      const i = bloc.indexOf(`{id:'${t.id}'`);
      const tros = bloc.slice(i, i + 900);
      /* Al codi l'apòstrof va escapat (`d\'una`), així que la pista es busca
         tolerant els dos escrits. Buscar-la literal feia petar la guarda per
         una barra invertida, que és el pitjor tipus de fals positiu: el que fa
         desconfiar de la guarda en comptes del codi. */
      return !/No surt d\\?'una màquina/.test(tros);
    });
    if (sensMotiu.length) bad('tipus no automatitzables sense el motiu escrit: ' + sensMotiu.map(t => t.id).join(', '));
    else ok(`${pl(noMaq.length, 'tipus no surt', 'tipus no surten')} d'una màquina, i es diu per què`);
  }
})();

// 5 · Cap pista òrfena. Una pista cap a un tipus inexistent no peta: deixa de
//     classificar fluxos en silenci, que és pitjor.
(() => {
  const i = APP.indexOf('const ENTREGABLE_HINTS=[');
  if (i < 0) { bad('no es troba `ENTREGABLE_HINTS`'); return; }
  const cos = APP.slice(i, APP.indexOf('\n];', i));
  const apunten = [...cos.matchAll(/,'([\w-]+)'\]/g)].map(m => m[1]);
  const ids = TIPUS.map(t => t.id);
  const orfes = [...new Set(apunten.filter(x => !ids.includes(x)))];
  if (orfes.length) bad('pistes cap a tipus que no existeixen: ' + orfes.join(', '));
  else ok(`${apunten.length} pistes, totes cap a un tipus declarat`);
  // I a l'inrevés: un tipus sense cap pista no el trobarà mai cap flux sol.
  const sensePista = ids.filter(x => !apunten.includes(x));
  if (sensePista.length) bad('tipus que cap pista no pot trobar: ' + sensePista.join(', '));
  else ok('i cap tipus es queda sense manera de ser reconegut');
})();

/* 6 · LA GUARDA QUE IMPORTA · l'intangible surt primer.
       Es comprova l'ordre del codi i no el resultat, perquè el resultat es pot
       arreglar per casualitat i l'ordre no. La condició de l'intangible ha
       d'anar abans que la del tipus d'entregable: si va després, qualsevol
       excepció futura que s'afegeixi entremig el pot convertir en candidat. */
(() => {
  const i = APP.indexOf('function fluxAutomatitzable(');
  if (i < 0) { bad('no es troba `fluxAutomatitzable`'); return; }
  const cos = APP.slice(i, APP.indexOf('\n}', i));
  const pIntang = cos.indexOf('isIntangible');
  const pTipus = cos.indexOf('entregableDe');
  if (pIntang < 0) { bad('`fluxAutomatitzable` no mira si el flux és intangible: la regla de la casa no s\'aplica'); return; }
  if (pTipus >= 0 && pIntang > pTipus) {
    bad('la comprovació d\'intangible va DESPRÉS de la del tipus: una excepció entremig faria automatitzable un intangible');
    return;
  }
  if (!/isIntangible\(x\.kind\)\)return\{pot:false/.test(cos.replace(/\s+/g, '')
    .replace(/if\(isIntangible\(x\.kind\)\)return\{pot:false/, 'isIntangible(x.kind))return{pot:false'))) {
    // Comprovació tolerant a l'espaiat: el que importa és que retorni fals de seguida.
    const net = cos.replace(/\s+/g, '');
    if (!/isIntangible\(x\.kind\)\)return\{pot:false/.test(net)) {
      bad('la comprovació d\'intangible no retorna `pot:false` immediatament');
      return;
    }
  }
  ok('la regla es compleix al codi: si el flux és intangible, surt fals abans de mirar res més');
})();

/* 7 · I que ningú pugui declarar el contrari des de les dades. `entregableDe`
       accepta un tipus escrit a mà a l'intercanvi, i això és bo —el mapa el fa
       la casa—, però no pot ser una porta del darrere: passi el que passi,
       `fluxAutomatitzable` mira l'intangible abans de cridar-lo. Es comprova
       que l'ordre entre les dues funcions sigui aquest i no l'invers. */
(() => {
  const i = APP.indexOf('function fluxAutomatitzable(');
  const cos = APP.slice(i, APP.indexOf('\n}', i));
  const linies = cos.split('\n').map(l => l.trim());
  const nIntang = linies.findIndex(l => l.includes('isIntangible'));
  const nEntrega = linies.findIndex(l => l.includes('entregableDe'));
  if (nIntang >= 0 && (nEntrega < 0 || nIntang < nEntrega)) ok('i el tipus escrit a mà a l\'intercanvi no pot saltar-se-la');
  else bad('el tipus declarat a l\'intercanvi es llegeix abans de descartar l\'intangible');
})();

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} a la taxonomia d'entregables.`
  : '\n✅ La taxonomia quadra i la màquina no pot tocar cap intangible.');
process.exit(fails ? 1 : 0);
