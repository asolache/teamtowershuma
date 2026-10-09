#!/usr/bin/env node
/* Guarda de /conecta/ · els serveis connectables i el cost real de l'IA
 * ─────────────────────────────────────────────────────────────────────────
 * La pàgina és un prototip per als pilots (Àlvar, 09/10/2026) i en diu tres
 * coses que es poden tornar falses sense que peti res:
 *
 *   1. Quant costa l'IA de cada tasca del SOS. La taula és una còpia de
 *      `AI_INTENTS` (nom, model, `max_tokens`): si algú canvia un model o
 *      afegeix una tasca al SOS i no aquí, la pàgina ensenya un cost que ja
 *      no és el de debò. I el preu ha de dur la font oficial i la data.
 *   2. Que a cada categoria hi ha una opció lliure. És la regla que fa creïble
 *      que una comissió de proveïdor no decideix la recomanació.
 *   3. Que no hi ha cap preu en euros (el catàleg ja no en publica, #197) ni
 *      res que sembli una clau.
 *
 * I la coherència interna: cada peça d'un flux existeix, cada servei surt en
 * algun flux, cada rol té fluxos, i l'etiqueta de clau i de cost existeixen.
 *
 * Ús:  node SOS/tools/check-conecta.js
 */
'use strict';
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const SOS = join(__dirname, '..');
const ARREL = join(SOS, '..');
const src = readFileSync(join(ARREL, 'conecta', 'index.html'), 'utf8');
const sos = readFileSync(join(SOS, 'index.html'), 'utf8');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };

console.log('\nGuarda de /conecta/ · serveis connectables i cost de l\'IA');

const m = src.match(/<script type="application\/json" id="cx-datos">([\s\S]*?)<\/script>/);
if (!m) { console.log('  ✗ no trobo el bloc de dades #cx-datos'); process.exit(1); }
let D;
try { D = JSON.parse(m[1]); ok('el bloc de dades és JSON vàlid'); }
catch (e) { console.log('  ✗ el bloc de dades no és JSON: ' + e.message); process.exit(1); }

/* 1 · Les tasques, contra les del SOS. */
const a = sos.indexOf('const AI_INTENTS={');
const seg = sos.slice(a, sos.indexOf('\nconst AI={', a));
const intents = {};
const re = /\n {2}([a-z_]+):\{\n {4}model:'([^']+)',max_tokens:(\d+)/g;
let x;
while ((x = re.exec(seg))) intents[x[1]] = { model: x[2], max: +x[3] };
const nI = Object.keys(intents).length;
if (!nI) bad('no he sabut llegir AI_INTENTS de SOS/index.html');
const tareas = {};
D.tareas.forEach(t => { tareas[t.id] = t; });
Object.keys(intents).forEach(id => {
  const t = tareas[id], i = intents[id];
  if (!t) return bad(`la tasca «${id}» del SOS no surt a la taula de cost`);
  if (t.hoy !== i.model) bad(`«${id}»: la taula diu ${t.hoy} i el SOS fa servir ${i.model}`);
  if (t.max !== i.max) bad(`«${id}»: la taula diu ${t.max} tokens i el SOS en té ${i.max}`);
});
D.tareas.forEach(t => { if (!intents[t.id]) bad(`la taula té «${t.id}», que ja no és una tasca del SOS`); });
if (nI && D.tareas.length === nI) ok(`les ${nI} tasques coincideixen amb AI_INTENTS (model i sostre)`);

const P = D.precios || {};
if (!/^https:\/\//.test(P.fuente || '')) bad('el preu no diu d\'on surt (precios.fuente)');
if (!/^\d{4}-\d{2}-\d{2}$/.test(P.consultado || '')) bad('el preu no diu quan es va consultar (precios.consultado)');
const models = P.modelos || {};
D.tareas.forEach(t => {
  [t.hoy, t.propuesta].forEach(k => { if (!models[k]) bad(`«${t.id}»: el model ${k} no té preu`); });
});
Object.entries(models).forEach(([k, v]) => {
  if (!(v.in > 0 && v.out > 0)) bad(`el model ${k} no té preu d'entrada i de sortida`);
});
if (P.fuente && P.consultado) ok(`cada model té preu, amb font i data (${P.consultado})`);

/* 2 · Coherència dels fluxos, els serveis i els rols. */
const CON = {}, CAT = new Set(D.categorias.map(c => c.id)), ROL = new Set(D.roles.map(r => r.id));
D.conectores.forEach(c => {
  if (CON[c.id]) bad(`el servei «${c.id}» és dues vegades`);
  CON[c.id] = c;
  if (!CAT.has(c.cat)) bad(`«${c.id}»: la categoria «${c.cat}» no existeix`);
  if (!D.claves[c.clave]) bad(`«${c.id}»: no hi ha text per a la clau «${c.clave}»`);
  if (!D.costes[c.coste]) bad(`«${c.id}»: no hi ha text per al cost «${c.coste}»`);
  if (!c.para || !c.via) bad(`«${c.id}»: li falta què fa o com s'endolla`);
});
const usats = new Set(), rolsAmbFlux = new Set();
D.flujos.forEach(f => {
  f.roles.forEach(r => { if (!ROL.has(r)) bad(`«${f.id}»: el rol «${r}» no existeix`); rolsAmbFlux.add(r); });
  if (!D.niveles[f.nivel]) bad(`«${f.id}»: el nivell ${f.nivel} no existeix`);
  if (f.ia && !models[f.ia]) bad(`«${f.id}»: el model ${f.ia} no té preu`);
  f.piezas.forEach((alt, i) => {
    const cats = new Set();
    alt.forEach(c => { if (!CON[c]) bad(`«${f.id}»: la peça «${c}» no és un servei`); else { usats.add(c); cats.add(CON[c].cat); } });
    if (cats.size > 1) bad(`«${f.id}»: el forat ${i + 1} barreja categories (${[...cats].join(', ')})`);
  });
});
D.conectores.forEach(c => { if (!usats.has(c.id)) bad(`«${c.id}» no surt a cap flux: ningú el veuria triant per rol`); });
D.roles.forEach(r => { if (!rolsAmbFlux.has(r.id)) bad(`el rol «${r.nombre}» no té cap flux`); });
ok(`${D.flujos.length} fluxos, ${D.conectores.length} serveis i ${D.roles.length} rols, tots enllaçats`);

D.categorias.forEach(cat => {
  const lliures = D.conectores.filter(c => c.cat === cat.id && c.libre);
  if (!lliures.length) bad(`la categoria «${cat.nombre}» no té cap opció lliure`);
});
ok('cada categoria té almenys una opció lliure');

/* 3 · Ni euros ni claus. */
const visible = src.replace(/<!--[\s\S]*?-->/g, '');
const euros = visible.match(/\d[\d.,]*\s*€|€\s*\d/g);
if (euros) bad('hi ha preus en euros: ' + euros.slice(0, 3).join(' · '));
else ok('cap preu en euros');
const clau = src.match(/sk-[A-Za-z0-9_-]{16,}|AKIA[0-9A-Z]{16}|eyJ[A-Za-z0-9_-]{20,}\.|api[_-]?key\s*[:=]\s*['"][^'"]{8,}/i);
if (clau) bad('hi ha una cosa que sembla una clau: ' + clau[0].slice(0, 12) + '…');
else ok('cap clau al codi');

/* 4 · S'hi arriba des del menú. */
const nav = readFileSync(join(__dirname, 'build-nav.js'), 'utf8');
if (!nav.includes("'/conecta/'")) bad('la pàgina no és al menú (build-nav.js)');
else ok('és al menú del lloc');

console.log(fails ? `\n✗ ${fails} problema${fails === 1 ? '' : 'es'}\n` : '\n✓ /conecta/ diu la veritat\n');
process.exit(fails ? 1 : 0);
