#!/usr/bin/env node
/* «Cómo se contrata» a /mapa-web/ · els passos del client, d'una sola font
 * ─────────────────────────────────────────────────────────────────
 * Els passos viuen a `proces-web.js` i surten també al backoffice de cada
 * client (`EMPIEZA-AQUI.html`). Escrits a mà a la pàgina de producte serien una
 * segona còpia que divergiria al primer pas que canviés: el client llegiria
 * una cosa a la web i una altra al seu backoffice. Aquí s'escriuen entre
 * `<!--TT-PROCES-->` (la secció) i `/*TT-PROCES*\/` (els estils), i `--check`
 * peta si la pàgina no és la que sortiria ara o si s'hi ha colat un import.
 *
 * Ús:  node SOS/tools/build-proces.js [--check]
 */
'use strict';
const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const P = require('./proces-web.js');
const V = require('./web-viva.js');
const VP = V.pinta('        ');

const CHECK = process.argv.includes('--check');
const FITXER = join(__dirname, '..', '..', 'mapa-web', 'index.html');
/* L'espai de client (/cliente/) porta els mateixos passos («Lo que viene
   después») i els nivells com a tria, de les mateixes dues fonts. */
const CLIENT = join(__dirname, '..', '..', 'cliente', 'index.html');

const SECCIO = [
  '<section id="contratar" aria-labelledby="t-contratar">',
  '    <div class="container">',
  '        <div class="cabeza">',
  '            <p class="eyebrow">Cómo se contrata</p>',
  '            <h2 id="t-contratar">Siete pasos. En cada uno sabes quién hace qué y qué recibes.</h2>',
  '            <p class="lead">Los tres primeros no cuestan nada. Desde tu espacio ves siempre en qué paso estás.</p>',
  '        </div>',
  P.pinta({ llengua: 'es', sagnat: '        ' }),
  '        <div class="accions">',
  '            <div class="cta">',
  '                <a class="btn btn-primary" href="/cliente/#alrededor">Haz tu mapa gratis</a>',
  '                <p class="micro">Es el paso 1, y lo haces en tu espacio.</p>',
  '            </div>',
  '            <a class="btn btn-ghost" href="#viva">Qué web quieres</a>',
  '        </div>',
  '    </div>',
  '</section>',
  '',
  '<section id="viva" class="alt" aria-labelledby="t-viva">',
  '    <div class="container">',
  '        <div class="cabeza">',
  '            <p class="eyebrow">Qué web quieres · hasta dónde</p>',
  '            <h2 id="t-viva">Empieza por lo mínimo que te sirve. Crece cuando lo necesites.</h2>',
  '            <p class="lead">Los tres primeros niveles son tuyos, sin cuota. El cuarto mantiene viva tu web: lo que se repite deja de depender de ti.</p>',
  '        </div>',
  VP.nivells,
  VP.garantia,
  /* El detall dels processos, plegat (04/11/2026, «menos texto»): hi és per
     a qui el vulgui, i no allarga la pàgina a qui només tria nivell. */
  '        <details class="procesos-vivos">',
  '        <summary><h3 class="sub" id="procesos">Los procesos que se quedan vivos: crear, sostener y transformar</h3></summary>',
  VP.trinitat,
  '        </details>',
  '    </div>',
  '</section>'
].join('\n');

const entre = (s, a, b, nou) => {
  const i = s.indexOf(a), j = s.indexOf(b);
  if (i < 0 || j < i) throw new Error('falten les marques ' + a + ' … ' + b + ' a mapa-web/index.html');
  return s.slice(0, i + a.length) + '\n' + nou + '\n' + s.slice(j);
};

const abans = readFileSync(FITXER, 'utf8');
const ara = entre(entre(abans, '<!--TT-PROCES-->', '<!--/TT-PROCES-->', SECCIO), '/*TT-PROCES*/', '/*/TT-PROCES*/', P.CSS + V.CSS);
/* /cliente/ és en castellà i es llegeix també en català (22/10/2026): la
   pàgina tradueix el que diu amb una taula castellà → català. La part dels
   passos i dels nivells surt d'aquí, de les dues versions de les mateixes
   fonts, text a text: si un dia no coincideixen, peta. */
const textos = h => [...h.matchAll(/>([^<]+)</g)].map(m => m[1].trim()).filter(Boolean);
function taulaCa() {
  const es = textos(P.pinta({ llengua: 'es' }) + V.pintaTria('', 'es')), ca = textos(P.pinta({ llengua: 'ca' }) + V.pintaTria('', 'ca'));
  if (es.length !== ca.length) throw new Error('els passos o els nivells no tenen els mateixos textos en castellà i en català');
  const t = new Map(es.map((x, i) => [x, ca[i]]));
  t.set(P.TXT.es.titol, P.TXT.ca.titol); t.set('· ' + P.TXT.es.ara, '· ' + P.TXT.ca.ara);
  return [...t].filter(([a, b]) => a !== b).map(([a, b]) => '        ' + JSON.stringify(a) + ': ' + JSON.stringify(b) + ',').join('\n');
}
const abansC = readFileSync(CLIENT, 'utf8');
const araC = entre(entre(entre(entre(abansC, '<!--TT-PROCES-->', '<!--/TT-PROCES-->', P.pinta({ llengua: 'es', sagnat: '        ' })),
  '<!--TT-NIVELLS-->', '<!--/TT-NIVELLS-->', V.pintaTria('            ')), '/*TT-PROCES*/', '/*/TT-PROCES*/', P.CSS),
  '/*TT-PROCES-CA*/', '/*/TT-PROCES-CA*/', taulaCa());

let fails = 0;
const ok = m => console.log('  ✓ ' + m), bad = m => { fails++; console.log('  ✗ ' + m); };
if (CHECK) {
  console.log('\nGuarda del procés del client · /mapa-web/ diu els passos de proces-web.js');
  if (ara === abans) ok('«Cómo se contrata» és el que surt de proces-web.js (' + P.PASSOS.length + ' passos)');
  else bad('mapa-web/index.html no és el que sortiria ara: node SOS/tools/build-proces.js');
  if (araC === abansC) ok('/cliente/ porta els mateixos passos i els ' + V.NIVELLS.length + ' nivells');
  else bad('cliente/index.html no és el que sortiria ara: node SOS/tools/build-proces.js');
  const errV = V.revisa();
  if (errV.length) errV.forEach(bad); else ok('web viva: ' + V.NIVELLS.length + ' nivells i ' + V.TRINITAT.reduce((a, t) => a + t.processos.length, 0) + ' processos, i els d\'avui diuen amb què');
  const txt = JSON.stringify([P.PASSOS, V.NIVELLS, V.GARANTIA, V.TRINITAT]);
  if (/\d[\d.,]*\s?€|€\s?\d/.test(txt)) bad('un pas porta un import en euros: el preu va per fluxos');
  else ok('cap pas porta un import en euros');
  process.exit(fails ? 1 : 0);
}
if (ara !== abans) { writeFileSync(FITXER, ara); console.log('mapa-web/index.html · «Cómo se contrata» escrit'); }
else console.log('mapa-web/index.html · ja estava al dia');
if (araC !== abansC) { writeFileSync(CLIENT, araC); console.log('cliente/index.html · passos i nivells escrits'); }
else console.log('cliente/index.html · ja estava al dia');
