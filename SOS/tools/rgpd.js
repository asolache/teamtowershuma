#!/usr/bin/env node
/* Protecció de dades · el registre, els encàrrecs i la guarda, d'una sola font
 * ─────────────────────────────────────────────────────────────────────────
 * L'Àlvar ho va demanar el 22/10/2026: «Automatiza los 4 pasos legales». Els
 * quatre són els contractes d'encàrrec dels proveïdors, el registre
 * d'activitats, la casella de privacitat de /cliente/ i el contracte
 * d'encàrrec amb cada client. Tot surt de `SOS/knowledge/legal/tratamientos.json`:
 *
 *   node SOS/tools/rgpd.js
 *        escriu `SOS/knowledge/legal/registro-actividades.md`: el registre que
 *        demana l'art. 30 RGPD (el que fa Facilita RGPD de l'AEPD), amb els
 *        contractes dels proveïdors i el que falta per fer.
 *
 *   node SOS/tools/rgpd.js --check
 *        peta si el registre no és el que sortiria ara; si un formulari del
 *        web (o de la funció que l'envia al CRM) no és a cap tractament; si un
 *        proveïdor no surt a l'avís legal en totes les llengües; o si
 *        /cliente/ ha perdut la casella. Un formulari nou sense registre és
 *        exactament el que es trenca en silenci.
 *
 *   node SOS/tools/rgpd.js --encargo <fitxa.json> [--sortida f.md]
 *        el contracte d'encàrrec amb un client, de la plantilla
 *        `encargo-cliente.md` i de la seva fitxa (la que es descarrega a
 *        /cliente/, amb `titular`, `nif` i `lugar` si ja els sabem). El que
 *        falta queda «[pendiente: …]» i l'eina ho diu. Les dades del client no
 *        van mai a aquest repositori: la sortida va a la seva carpeta privada.
 */
'use strict';
const { readFileSync, writeFileSync, readdirSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const LEGAL = join(ARREL, 'SOS', 'knowledge', 'legal');
const T = JSON.parse(readFileSync(join(LEGAL, 'tratamientos.json'), 'utf8'));
const RAT = join(LEGAL, 'registro-actividades.md');
const ESTAT = { incorporado: 'Incorporado en sus términos', firmar: 'Pendiente: hay que firmarlo', revisar: 'Pendiente: comprobar' };
const ENC = Object.fromEntries(T.encargados.map(e => [e.id, e]));

function registre() {
  const r = T.responsable, L = [];
  L.push('# Registro de actividades de tratamiento', '');
  L.push('*Art. 30 RGPD. Generado por `node SOS/tools/rgpd.js` desde `tratamientos.json`: no se edita a mano.*', '');
  L.push('## Responsable', '');
  L.push(`- **${r.nombre}**, ${r.forma}. Marcas: ${r.marcas.join(', ')}.`, `- Contacto: ${r.contacto}.`, `- ${r.dpd}`, '');
  L.push('## Tratamientos', '');
  for (const t of T.tratamientos) {
    L.push(`### ${t.nombre}`, '');
    L.push(`- **Para qué:** ${t.fines}`, `- **Base legal:** ${t.base}`, `- **De quién:** ${t.interesados}`, `- **Qué datos:** ${t.datos}`);
    if (t.formularios.length) L.push(`- **Por dónde llegan:** los formularios ${t.formularios.map(f => '`' + f + '`').join(', ')}.`);
    L.push(`- **Quién los trata por encargo:** ${t.encargados.map(e => ENC[e].nombre).join(', ')}.`);
    L.push(`- **Cuánto tiempo:** ${t.plazo}`, `- **Fuera de la UE:** ${t.transferencias}`, '');
  }
  L.push('## Encargados y sus contratos (DPA)', '');
  L.push('| Proveedor | Para qué | Dónde | Contrato | Estado |', '|---|---|---|---|---|');
  for (const e of T.encargados) L.push(`| ${e.nombre} | ${e.para} | ${e.pais} | [DPA](${e.dpa}) | ${ESTAT[e.estado]} |`);
  for (const p of T.propios) L.push(`| ${p.nombre} | ${p.para} | | | ${p.nota} |`);
  L.push('', '## Medidas de seguridad', '');
  for (const s of T.seguridad) L.push('- ' + s);
  const falta = T.encargados.filter(e => e.estado !== 'incorporado');
  L.push('', '## Lo que falta por hacer', '');
  if (!falta.length) L.push('Nada: todos los contratos están en orden.');
  for (const e of falta) L.push(`- [ ] **${e.nombre}.** ${e.como}`);
  L.push('- [ ] Revisar este registro una vez al año, o cuando entre un proveedor o un formulario nuevo (la CI avisa).');
  L.push('', '*No es asesoría legal: confírmalo con la gestoría.*', '');
  return L.join('\n');
}

/* Els formularis que el web dona d'alta a Netlify, de les pàgines. L'editor
   del mapa (vna-suport.html) en genera per a la web de cada client, i aquells
   són del client: van al seu contracte d'encàrrec, no a aquest registre. */
function formularisDelWeb() {
  const fitxers = ['index.html', 'cliente/index.html', 'visita/index.html']
    .concat(readdirSync(join(ARREL, 'SOS')).filter(f => f.endsWith('.html') && f !== 'vna-suport.html').map(f => 'SOS/' + f))
    .concat(readdirSync(ARREL).filter(f => f.endsWith('.html')));
  const noms = new Set();
  for (const f of new Set(fitxers)) {
    if (!existsSync(join(ARREL, f))) continue;
    for (const m of readFileSync(join(ARREL, f), 'utf8').matchAll(/<form\b[^>]*\bname="([\w-]+)"[^>]*\bdata-netlify\b/g)) noms.add(m[1] + ' (' + f + ')');
  }
  return [...noms];
}

function check() {
  let fails = 0;
  const ok = m => console.log('  ✓ ' + m), bad = m => { fails++; console.log('  ✗ ' + m); };
  console.log('\n══ Protecció de dades ══');
  const ara = existsSync(RAT) ? readFileSync(RAT, 'utf8') : '';
  ara === registre() ? ok('el registro de actividades está al día') : bad('el registro no es el que saldría ahora: node SOS/tools/rgpd.js');

  const declarats = new Set(T.tratamientos.flatMap(t => t.formularios));
  const web = formularisDelWeb();
  const sense = web.filter(f => !declarats.has(f.split(' ')[0]));
  sense.length ? bad('formularios sin tratamiento en tratamientos.json: ' + sense.join(', ')) : ok(web.length + ' formularios del web, todos en el registro');
  const fn = readFileSync(join(ARREL, 'netlify', 'functions', 'submission-created.mjs'), 'utf8');
  const crm = [...fn.slice(fn.indexOf('FORMULARIS = {'), fn.indexOf('};', fn.indexOf('FORMULARIS = {'))).matchAll(/'([\w-]+)':/g)].map(m => m[1]);
  const crmSense = crm.filter(f => !declarats.has(f));
  crmSense.length ? bad('formularios que llegan al CRM sin tratamiento: ' + crmSense.join(', ')) : ok(crm.length + ' formularios que llegan al CRM, todos en el registro');

  for (const t of T.tratamientos) for (const e of t.encargados) if (!ENC[e]) bad(`«${t.nombre}» usa un encargado que no existe: ${e}`);
  const malEstat = T.encargados.filter(e => !ESTAT[e.estado] || !/^https:\/\//.test(e.dpa) || !e.como);
  malEstat.length ? bad('encargados sin DPA, estado o instrucciones: ' + malEstat.map(e => e.id).join(', ')) : ok(T.encargados.length + ' encargados con su DPA y su estado');

  const al = readFileSync(join(ARREL, 'avis-legal.html'), 'utf8');
  const qui = [...al.matchAll(/'al\.qui\.1':'((?:[^'\\]|\\.)*)'/g)].map(m => m[1]);
  const falten = qui.flatMap((txt, i) => T.encargados.filter(e => !txt.includes(e.nombre)).map(e => e.nombre + ' (llengua ' + (i + 1) + ')'));
  qui.length >= 2 && !falten.length ? ok('el aviso legal nombra a todos los encargados, en ' + qui.length + ' lenguas') : bad('el aviso legal no nombra: ' + (falten.join(', ') || 'falta al.qui.1'));

  const cl = readFileSync(join(ARREL, 'cliente', 'index.html'), 'utf8');
  /<input[^>]*id="cl-priv"[^>]*type="checkbox"|<input[^>]*type="checkbox"[^>]*id="cl-priv"/.test(cl) && /name="privacidad"/.test(cl)
    ? ok('/cliente/ tiene la casilla de privacidad y la envía') : bad('/cliente/ ha perdido la casilla de privacidad (#cl-priv) o el campo «privacidad»');
  const pl = readFileSync(join(LEGAL, 'encargo-cliente.md'), 'utf8');
  const claus = [...pl.matchAll(/\{\{([\w.]+)\}\}/g)].map(m => m[1]);
  const sabudes = Object.keys(campsEncarrec({}));
  const noves = claus.filter(c => !sabudes.includes(c));
  noves.length ? bad('la plantilla del encargo usa campos que la herramienta no rellena: ' + noves.join(', ')) : ok('la plantilla del encargo y la herramienta usan los mismos ' + new Set(claus).size + ' campos');
  console.log(`\n${fails ? '✗ ' + fails + ' problema(s)' : '✓ todo en orden'}`);
  return fails;
}

/* Les dades que passen per la web del client, segons el nivell que tria a
   /cliente/ (els noms són els de web-viva.js). Cada nivell inclou l'anterior. */
const DADES_NIVELL = [
  ['Una página', 'el formulario de contacto: nombre, correo y el mensaje que escriben'],
  ['La web de tu mapa', 'los formularios de cada puerta (inscripciones, consultas o reservas): nombre, correo, teléfono si lo dan y lo que preguntan'],
  ['La web conectada', 'lo que la web pasa a su CRM, sus reservas o sus matrículas, y lo que la web manda a su IA para contestar o clasificar'],
  ['La web viva', 'las cifras del mes (visitas y envíos, sin nombres) para el informe mensual']
];
const PEND = q => '[pendiente: ' + q + ']';

function campsEncarrec(f) {
  const i = DADES_NIVELL.findIndex(([n]) => n === f.nivel);
  const fins = i < 0 ? 1 : i + 1;
  const sub = ['anthropic', 'netlify'].map(id => ENC[id])
    .map(e => `   - **${e.nombre}**: ${e.id === 'anthropic' ? 'la IA con la que preparamos y mantenemos la web' : 'el alojamiento mientras la web no esté en la cuenta del responsable'} (${e.pais}).`).join('\n');
  const c = {
    'lugar': f.lugar || PEND('ciudad'),
    'fecha': f.fecha || new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    'cliente.titular': f.titular || PEND('nombre legal del titular'),
    'cliente.nif': f.nif || PEND('NIF'),
    'cliente.org': f.org || PEND('nombre de la actividad'),
    'cliente.web': f.web || PEND('dirección de la web'),
    'encargado.nombre': T.responsable.nombre,
    'encargado.forma': T.responsable.forma,
    'encargado.nif': f.nifEncargado || PEND('NIF de Alvaro'),
    'nivel': f.nivel ? '«' + f.nivel + '»' : PEND('nivel de web'),
    'datos': DADES_NIVELL.slice(0, fins).map(([, d]) => '- ' + d[0].toUpperCase() + d.slice(1) + '.').join('\n'),
    'interesados': 'las personas que escriben, se inscriben o reservan desde la web' + (f.alrededor && f.alrededor.length ? ' (según su mapa: ' + f.alrededor.map(a => a.quien).filter(Boolean).join(', ').toLowerCase() + ')' : ''),
    'subencargados': sub
  };
  return c;
}

function encarrec(fitxa) {
  const f = JSON.parse(readFileSync(fitxa, 'utf8'));
  const c = campsEncarrec(f);
  const txt = readFileSync(join(LEGAL, 'encargo-cliente.md'), 'utf8').replace(/\{\{([\w.]+)\}\}/g, (_, k) => c[k]);
  return { txt, pendents: [...new Set(txt.match(/\[pendiente: [^\]]+\]/g) || [])] };
}

if (require.main === module) {
  const a = process.argv.slice(2);
  if (a.includes('--check')) process.exit(check() ? 1 : 0);
  const e = a.indexOf('--encargo');
  if (e >= 0) {
    if (!a[e + 1]) { console.error('Ús: node SOS/tools/rgpd.js --encargo <fitxa.json> [--sortida f.md]'); process.exit(2); }
    const { txt, pendents } = encarrec(a[e + 1]);
    const s = a.indexOf('--sortida');
    if (s >= 0 && a[s + 1]) { writeFileSync(a[s + 1], txt); console.log('Escrit ' + a[s + 1]); } else process.stdout.write(txt);
    if (pendents.length) console.error('Falta: ' + pendents.join(', '));
    process.exit(0);
  }
  writeFileSync(RAT, registre());
  console.log('Escrit ' + RAT);
}

module.exports = { registre, encarrec, campsEncarrec, formularisDelWeb, check };
