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

const CHECK = process.argv.includes('--check');
const FITXER = join(__dirname, '..', '..', 'mapa-web', 'index.html');

const SECCIO = [
  '<section id="contratar" class="alt" aria-labelledby="t-contratar">',
  '    <div class="container">',
  '        <div class="cabeza">',
  '            <p class="eyebrow">Cómo se contrata</p>',
  '            <h2 id="t-contratar">Siete pasos. En cada uno sabes quién hace qué y qué recibes.</h2>',
  '            <p class="lead">Es el mismo camino para todos los proyectos. Los tres primeros no cuestan nada, y desde el borrador ves en tu backoffice en qué paso está el tuyo.</p>',
  '        </div>',
  P.pinta({ llengua: 'es', sagnat: '        ' }),
  '        <div class="accions">',
  '            <div class="cta">',
  '                <a class="btn btn-primary js-mail" href="/qui-som" data-asunto="Empezar · Mapa y web" data-cuerpo="borrador">Empezar por el paso 1</a>',
  '                <p class="micro">Se abre tu correo.<span class="js-dir" hidden> O escribe a <a href="/qui-som">la dirección de contacto</a>.</span></p>',
  '            </div>',
  '            <a class="btn btn-ghost" href="/conecta/#modelo">Qué incluye la web viva</a>',
  '        </div>',
  '    </div>',
  '</section>'
].join('\n');

const entre = (s, a, b, nou) => {
  const i = s.indexOf(a), j = s.indexOf(b);
  if (i < 0 || j < i) throw new Error('falten les marques ' + a + ' … ' + b + ' a mapa-web/index.html');
  return s.slice(0, i + a.length) + '\n' + nou + '\n' + s.slice(j);
};

const abans = readFileSync(FITXER, 'utf8');
const ara = entre(entre(abans, '<!--TT-PROCES-->', '<!--/TT-PROCES-->', SECCIO), '/*TT-PROCES*/', '/*/TT-PROCES*/', P.CSS);

let fails = 0;
const ok = m => console.log('  ✓ ' + m), bad = m => { fails++; console.log('  ✗ ' + m); };
if (CHECK) {
  console.log('\nGuarda del procés del client · /mapa-web/ diu els passos de proces-web.js');
  if (ara === abans) ok('«Cómo se contrata» és el que surt de proces-web.js (' + P.PASSOS.length + ' passos)');
  else bad('mapa-web/index.html no és el que sortiria ara: node SOS/tools/build-proces.js');
  const txt = JSON.stringify(P.PASSOS);
  if (/\d[\d.,]*\s?€|€\s?\d/.test(txt)) bad('un pas porta un import en euros: el preu va per fluxos');
  else ok('cap pas porta un import en euros');
  process.exit(fails ? 1 : 0);
}
if (ara !== abans) { writeFileSync(FITXER, ara); console.log('mapa-web/index.html · «Cómo se contrata» escrit'); }
else console.log('mapa-web/index.html · ja estava al dia');
