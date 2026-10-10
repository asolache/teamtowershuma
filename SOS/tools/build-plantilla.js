#!/usr/bin/env node
/* La plantilla del botó «Deploy to Netlify» · el camí B de l'alta
 * ─────────────────────────────────────────────────────────────────
 * Escriu `SOS/plantilla-web/`, la carpeta que Netlify clona al GitHub del
 * client quan prem el botó (paràmetre `create_from_path`): tot queda a nom
 * seu des del primer minut, i no hem de guardar cap permís seu.
 *
 * A cada publicació, Netlify executa `node eines/genera.mjs`, que fa la web
 * del mapa amb **el mateix codi que l'editor**: `eines/motor.mjs` són els blocs
 * de `SOS/vna-suport.html` tal com hi són. El mapa surt, per aquest ordre, de
 * `cerebro/mapa-real.json` del repositori, de la variable `TT_MAPA` (el posa el
 * botó de l'editor, comprimit) o, si no n'hi ha, de l'exemple del celler.
 *
 *   node SOS/tools/build-plantilla.js           escriu la plantilla
 *   node SOS/tools/build-plantilla.js --check   falla si no és la que sortiria ara
 */
'use strict';
const { readFileSync, writeFileSync, mkdirSync, existsSync } = require('node:fs');
const { join, dirname } = require('node:path');
const { genera, codiRepositori, KIT_TXT } = require('./web-del-mapa.js');

const ARREL = join(__dirname, '..');
const DESTI = join(ARREL, 'plantilla-web');
const CHECK = process.argv.includes('--check');
const html = readFileSync(join(ARREL, 'vna-suport.html'), 'utf8');
const k0 = html.indexOf('const EXEMPLE = {'), k1 = html.indexOf('};', k0) + 2;
const EXEMPLE = new Function(html.slice(k0, k1).replace('const EXEMPLE =', 'return'))();
/* El motor i el genera.mjs són els que porta qualsevol repositori de client
   (bloc VS-GENERA, `codiRepositori`): un sol codi per al zip, la plantilla i el
   motor quan es refà. */
const { motor, genera: generaMjs } = codiRepositori();

const llegeixMd = ['# La teva web, des del mapa de valor', '',
  'Aquest repositori és teu: el va crear el botó «Deploy to Netlify». A cada publicació, Netlify fa la web a partir del mapa (`node eines/genera.mjs`).', '',
  '**El mapa és la font.** Desa el que dona l\'editor del mapa de valor («Copia el JSON») a `cerebro/mapa-real.json` i fes-ne una PR. Netlify en publica una vista prèvia; quan l\'acceptes, és la web. Mentre no hi sigui, la web surt de la variable `TT_MAPA` (la posa el botó) o de l\'exemple.', '',
  '**Es configura a Netlify** (Site configuration › Environment variables): `TT_NOM`, `TT_CORREU`, `TT_LLENGUA` (`ca` o `es`) i, per als avisos, `TT_WEBHOOKS` i `TT_WEBHOOK_SECRET`. Cap clau al repositori.', '',
  '**Fes-lo privat.** El cervell parla del negoci: GitHub › Settings › General › Danger Zone › Change visibility › Private.', '',
  'En cada publicació es generen les regles (`CLAUDE.md`), l\'API (`API.md`) i el cervell (`cerebro/`). `cerebro/decisiones.md`, si el poses al repositori, es conserva.', '',
  '---', '', '# Tu web, desde el mapa de valor', '',
  'Este repositorio es tuyo: lo creó el botón «Deploy to Netlify». En cada publicación, Netlify hace la web a partir del mapa (`node eines/genera.mjs`).', '',
  '**El mapa es la fuente.** Guarda lo que da el editor del mapa de valor («Copia el JSON») en `cerebro/mapa-real.json` y haz una PR. Netlify publica una vista previa; cuando la aceptas, es la web. Mientras no esté, la web sale de la variable `TT_MAPA` (la pone el botón) o del ejemplo.', '',
  '**Se configura en Netlify** (Site configuration › Environment variables): `TT_NOM`, `TT_CORREU`, `TT_LLENGUA` (`ca` o `es`) y, para los avisos, `TT_WEBHOOKS` y `TT_WEBHOOK_SECRET`. Ninguna clave en el repositorio.', '',
  '**Hazlo privado.** El cerebro habla del negocio: GitHub › Settings › General › Danger Zone › Change visibility › Private.', '',
  'En cada publicación se generan las reglas (`CLAUDE.md`), la API (`API.md`) y el cerebro (`cerebro/`). `cerebro/decisiones.md`, si lo pones en el repositorio, se conserva.', ''].join('\n');

(async () => {
  const toml = (await genera(EXEMPLE, {})).find(f => f.ruta === 'netlify.toml').cos;
  if (!toml.includes('[build]\n  publish = "."')) throw new Error('netlify.toml sense [build]');
  const plantillaToml = toml.replace('[build]\n  publish = "."', '[build]\n  command = "node eines/genera.mjs"\n  publish = "."')
    + '\n# El que demana el botó «Deploy to Netlify». El mapa (TT_MAPA) el posa el botó de l\'editor.\n[template.environment]\n'
    + '  TT_NOM = "El nom de la web"\n  TT_CORREU = "El correu on arriben els formularis"\n  TT_LLENGUA = "ca o es"\n  TT_MAPA = "El mapa, el posa el botó de l\'editor (opcional)"\n';
  /* Abans de la primera generació, el repositori ja porta unes regles curtes
     (CLAUDE.md) i les tres skills: Netlify genera la web a cada publicació però
     no la desa al repositori, i el camí gratuït (claude.ai) les llegeix d'aquí.
     Les skills van en català; genera.mjs, en local, les refà en la llengua de la web. */
  const kit = { 'CLAUDE.md': KIT_TXT.ca.stub.join('\n') + '\n' };
  Object.keys(KIT_TXT.ca.skills).forEach(n => { kit['.claude/skills/' + n + '/SKILL.md'] = KIT_TXT.ca.skills[n].join('\n') + '\n'; });
  const fitxers = Object.assign({ 'netlify.toml': plantillaToml, 'eines/motor.mjs': motor, 'eines/genera.mjs': generaMjs, 'README.md': llegeixMd }, kit);
  const mal = Object.keys(fitxers).filter(r => !existsSync(join(DESTI, r)) || readFileSync(join(DESTI, r), 'utf8') !== fitxers[r]);
  if (CHECK) {
    console.log('\nGuarda de la plantilla de Netlify · surt de l\'editor tal com és');
    if (mal.length) { console.log('  ✗ no és la que sortiria ara: ' + mal.join(', ') + '\n\n❌ Torna a generar-la: node SOS/tools/build-plantilla.js'); process.exit(1); }
    console.log('  ✓ ' + Object.keys(fitxers).length + ' fitxers, iguals que els que sortirien ara\n\n✅ La plantilla fa servir el codi de l\'editor.');
    return;
  }
  Object.keys(fitxers).forEach(r => { mkdirSync(dirname(join(DESTI, r)), { recursive: true }); writeFileSync(join(DESTI, r), fitxers[r]); });
  console.log('✅ ' + Object.keys(fitxers).length + ' fitxers a SOS/plantilla-web/' + (mal.length ? ' (canviats: ' + mal.join(', ') + ')' : ''));
})().catch(e => { console.error('❌ ' + e.message); process.exit(1); });
