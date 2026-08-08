#!/usr/bin/env node
/* Guarda de KISS · el que impedeix que l'app només creixi.
   ────────────────────────────────────────────────────────
   El SOS ha crescut sempre per addició i no s'ha tret mai res. Cada tanda hi
   afegia una portada, una pestanya o una entrada de menú, i ningú ho mesurava.
   Aquest fitxer posa **sostres declarats**: no prohibeix créixer, però obliga
   que créixer sigui una decisió que algú pren i escriu, no un descuit.

   Corre a cada PR (`.github/workflows/ci.yml`), sense dependències i en menys
   d'un segon. Va aquí i no als tests de Playwright perquè aquells **no corren
   al CI**: el `npm test` no fa res perquè no hi ha `package.json`.

   Per pujar un sostre: canvia el número, i explica al commit per què. Aquesta
   fricció és tot el que fa el fitxer, i és tota la seva utilitat. */
const { readFileSync } = require('node:fs');
const { gzipSync } = require('node:zlib');
const { join } = require('node:path');

const APP = process.argv[2] || join(__dirname, '..', 'index.html');
const src = readFileSync(APP, 'utf8');

/* ── Els sostres. Cada número és una decisió presa, no un límit tècnic. ── */
const MAX_GZIP_KB = 400;   // el que es descarrega d'un cop, amb dades mòbils d'un poble
const MAX_HOME_VIEWS = 5;  // portades que competeixen entre elles
const MAX_MODAL_ROUTES = 20;
const MAX_MENU_ITEMS = 12;

let fails = 0, warns = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };

console.log('\nGuarda de KISS · ' + APP.replace(/^.*\//, ''));

// ── 1 · Pes ──────────────────────────────────────────────────────────────
const kb = Math.round(gzipSync(Buffer.from(src)).length / 1024);
const pct = Math.round(kb / MAX_GZIP_KB * 100);
if (kb <= MAX_GZIP_KB) ok(`pes ${kb} KB gzip · ${pct} % del sostre (${MAX_GZIP_KB} KB)`);
else bad(`pes ${kb} KB gzip · PASSA el sostre de ${MAX_GZIP_KB} KB. O s'aprima, o es puja el sostre a consciència.`);

// ── 2 · Cap context sense guia ───────────────────────────────────────────
/* La veda ho diu: «Un context sense entrada a CONTEXT_GUIDES és un context que
   la persona haurà d'endevinar». Es va incomplir en afegir la conversa, i com
   que no ho comprovava ningú, no ho va veure ningú. */
const tabIds = [...new Set([...src.matchAll(/tdefs\.push\(([^;]*?)\);/g)]
  .flatMap(m => [...m[1].matchAll(/\['([a-z_]+)'\s*,/g)].map(x => x[1])))];
const guides = [...new Set([...(src.match(/^const CONTEXT_GUIDES=\{[\s\S]*?\n\};/m) || [''])[0]
  .matchAll(/^\s{2}([a-z_]+):\{ic:/gm)].map(m => m[1]))];
const missing = tabIds.filter(t => !guides.includes(t));
if (!missing.length) ok(`${tabIds.length} pestanyes, totes amb guia contextual`);
else bad(`pestanyes sense guia a CONTEXT_GUIDES: ${missing.join(', ')} — qui hi entri ho haurà d'endevinar`);

// ── 3 · El hook de test no pot tenir duplicats ───────────────────────────
/* 700 exports amb 39 repetits vol dir que ningú mira aquesta llista. Un
   duplicat és inofensiu per a JS i és el senyal que la llista ha deixat de ser
   una decisió i s'hi va afegint el que calgui. */
const hook = (src.match(/window\.__SOS=\{([\s\S]*?)\};/) || [])[1] || '';
const names = hook.split(',').map(x => x.split(':')[0].trim()).filter(Boolean);
const seen = new Set(), dups = new Set();
names.forEach(n => { if (seen.has(n)) dups.add(n); seen.add(n); });
if (!dups.size) ok(`hook de test amb ${names.length} exports, cap duplicat`);
else bad(`${dups.size} exports duplicats al hook: ${[...dups].slice(0, 8).join(', ')}${dups.size > 8 ? '…' : ''}`);

// ── 4 · Superfícies de nivell superior ───────────────────────────────────
const homeViews = [...new Set([...src.matchAll(/state\.homeView===['"]([a-z]+)['"]/g)].map(m => m[1]))];
// «tauler» és la portada per defecte i no es compara mai amb ===, així que se suma.
const nHome = homeViews.length + 1;
if (nHome <= MAX_HOME_VIEWS) ok(`${nHome} portades (sostre ${MAX_HOME_VIEWS}): ${['tauler', ...homeViews].join(', ')}`);
else bad(`${nHome} portades competint entre elles, sostre ${MAX_HOME_VIEWS}. Cinc portades és cap portada.`);

const routes = ((src.match(/^const MODAL_ROUTES=\{[\s\S]*?\n\};/m) || [''])[0].match(/:\{open:/g) || []).length;
if (routes <= MAX_MODAL_ROUTES) ok(`${routes} rutes modals (sostre ${MAX_MODAL_ROUTES})`);
else bad(`${routes} rutes modals, sostre ${MAX_MODAL_ROUTES}`);

const menu = (src.match(/class="tb-mi"/g) || []).length;
if (menu <= MAX_MENU_ITEMS) ok(`${menu} entrades al menú (sostre ${MAX_MENU_ITEMS})`);
else bad(`${menu} entrades al menú, sostre ${MAX_MENU_ITEMS}`);

// ── 5 · Informatiu: el que creix i encara no té sostre ───────────────────
const modals = (src.match(/^(async )?function open[A-Z]/gm) || []).length;
const lines = src.split('\n').length;
console.log(`  · ${lines.toLocaleString('ca')} línies · ${modals} modals · sense sostre declarat, de moment`);

console.log(fails
  ? `\n❌ ${fails} sostre${fails > 1 ? 's' : ''} passat${fails > 1 ? 's' : ''}. Aprima, o puja el número al fitxer i digues per què.`
  : '\n✅ Dins de tots els sostres.');
process.exit(fails ? 1 : 0);
