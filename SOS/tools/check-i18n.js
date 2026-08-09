#!/usr/bin/env node
/* La guarda de la segona llengua.
   Un deute que no es veu és el que creix. `SOS/index.html` porta text català
   incrustat a milers de llocs, i cada tanda de feina n'hi afegeix més sense que
   ningú se n'adoni fins que algú intenta obrir el SOS a Euskadi.

   Això no falla mai per tenir poca cobertura —seria mentir sobre l'estat real i
   bloquejar feina honesta. El que fa és **posar la xifra davant**, i fallar
   només si s'ha trencat alguna cosa que sí que és un error: una traducció
   buida, o una entrada al diccionari que ja no existeix enlloc del codi. Una
   traducció que apunta a una cadena que ja no hi és no tradueix res, i queda
   allà fent bonic mentre la de debò surt en català.

   node SOS/tools/check-i18n.js */
const fs = require('fs');
const path = require('path');

const APP = path.join(__dirname, '..', 'index.html');
const src = fs.readFileSync(APP, 'utf8');

// Les cadenes que semblen text per a persones: prou llargues i amb accent,
// dígraf o signe que només surt en llengua escrita, no en codi.
const CATALAN = /(['"])((?:[^'"\\\n]|\\.){6,}?)\1/g;
const LOOKS_HUMAN = s =>
  /[àèéíòóúïüçÀÈÉÍÒÓÚÇ·]|\b(el|la|els|les|que|amb|per|una|dels|això|què)\b/i.test(s) &&
  /\s/.test(s) &&
  !/^[a-z-]+\/[a-z-]+$/.test(s) &&
  !/^(https?:|data:|ws:)/.test(s);

let human = 0;
const seen = new Set();
let m;
while ((m = CATALAN.exec(src))) {
  const v = m[2];
  if (!LOOKS_HUMAN(v)) continue;
  human++;
  seen.add(v);
}

// El diccionari, tal com és al codi.
const dictBlock = src.slice(src.indexOf('const I18N={es:{'), src.indexOf('}};', src.indexOf('const I18N={es:{')));
const entries = [...dictBlock.matchAll(/'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)'/g)]
  .map(x => [x[1], x[2]]);

const buides = entries.filter(([, v]) => !v.trim());
const wrapped = [...src.matchAll(/\bt\(\s*'((?:[^'\\]|\\.)*)'/g)].map(x => x[1]);

console.log('\nGuarda de la segona llengua · index.html\n');
console.log('  · ' + human.toLocaleString('ca') + ' cadenes de text per a persones al codi');
console.log('  · ' + entries.length + ' traduccions al castellà');
console.log('  · ' + wrapped.length + ' crides a t() al codi');
const pct = human ? Math.round(entries.length / human * 1000) / 10 : 0;
console.log('  · cobertura declarada: ' + pct + ' %');
console.log('\n  El que no està traduït surt en català, mai una clau crua.');
console.log('  Aquesta guarda no falla per cobertura baixa: la fa visible.\n');

let bad = 0;
if (buides.length) {
  console.log('  ✗ ' + buides.length + ' traducció(ns) buides: ' + buides.map(([k]) => k).join(', '));
  bad++;
} else console.log('  ✓ cap traducció buida');

// Una entrada que tradueix a si mateixa no fa res —`t()` ja cau al català— i és
// on s'amaguen els errors de copiar i enganxar. Millor que no hi sigui.
const iguals = entries.filter(([k, v]) => k === v);
if (iguals.length) {
  console.log('  ✗ ' + iguals.length + ' entrada(es) que tradueixen a si mateixes: ' + iguals.map(([k]) => k).join(', '));
  bad++;
} else console.log('  ✓ cap entrada que tradueixi a si mateixa');

// Una traducció d'una cadena que ja no existeix al codi no tradueix res.
const orfes = entries.filter(([k]) => !seen.has(k) && !src.includes("'" + k + "'"));
if (orfes.length) {
  console.log('  ✗ ' + orfes.length + ' traducció(ns) que ja no apunten a cap cadena del codi:');
  orfes.slice(0, 8).forEach(([k]) => console.log('      · ' + k));
  bad++;
} else console.log('  ✓ totes les traduccions apunten a text que existeix');

console.log(bad ? '\n❌ Cal arreglar-ho.\n' : '\n✅ El diccionari quadra amb el codi.\n');
process.exit(bad ? 1 : 0);
