#!/usr/bin/env node
/* Els formularis · els blocs compartits, declarats un cop
 * ─────────────────────────────────────────────────────────────────────────
 * Hi ha dos formularis que fan preguntes diferents i comencen igual: el
 * **diagnòstic** («què teniu i què us falta») i el **pressupost** («què voleu
 * i què costa»). Tots dos han de saber primer **qui ets** i **d'on véns**, i
 * aquestes dues preguntes són exactament les mateixes: nom, càrrec, correu,
 * telèfon; tipus d'organització, nom, municipi, comarca, població.
 *
 * Escrites dues vegades, divergeixen. I divergeixen d'una manera que no fa
 * soroll: el dia que el diagnòstic afegeix «cooperativa» a la llista de tipus
 * d'organització i el pressupost no, una cooperativa que ve del diagnòstic
 * arriba al pressupost i no s'hi troba. No peta res; simplement, ningú entén
 * per què aquella persona abandona el formulari.
 *
 * Per això els dos blocs es declaren aquí i s'escriuen als dos llocs. Mateix
 * patró que `build-nav.js`, `build-mapa.js` i `build-oferta.js`.
 *
 * ── L'arquitectura, que és el que demanava això ──────────────────────────
 * Un formulari és una **seqüència de blocs**, i els blocs es comparteixen:
 *
 *     Diagnòstic:  qui · organització · què teniu · què us falta   → informe
 *     Pressupost:  qui · organització · què voleu · quan i amb què → proposta
 *
 * Els dos primers són el mateix codi. Els dos últims són el que distingeix
 * cada eina. I com que els dos primers són idèntics, el que un formulari
 * recull el pot **reaprofitar** l'altre: el diagnòstic desa la seva resposta a
 * `localStorage` i el pressupost la llegeix, de manera que qui ja ha fet el
 * diagnòstic no torna a escriure el seu nom ni el seu municipi.
 *
 * ── El tipus d'organització porta sector ─────────────────────────────────
 * Cada tipus declara si és `privat` o `public`, i això no és un adorn: el
 * pressupost ho fa servir per ordenar el catàleg segons qui pregunta, i el
 * diagnòstic per saber d'on poden sortir els diners. Un camp que ja hi era i
 * que no deia res, ara diu una cosa que decideix.
 *
 * Ús:  node SOS/tools/build-formularis.js [--check]
 */
'use strict';
const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const SOS = join(__dirname, '..');
const CHECK = process.argv.includes('--check');

/* ══ ELS TIPUS D'ORGANITZACIÓ ═════════════════════════════════════════════
   L'ordre no és alfabètic: va del que més ens contracta al que menys, perquè
   la primera opció d'una llista és la que més es tria i ha de ser la que més
   sovint és certa.

   `sector` diu a quina meitat del catàleg mira aquesta casa. `particular` és
   l'únic sense sector clar i per això mira les dues: qui ve a títol personal
   pot acabar comprant una formació per a ell o proposant-la a la seva feina. */
const ORGS = [
  { id: 'ajuntament',    ic: '🏛', c: 'indigo', sector: 'public',
    t: 'Ajuntament',              d: 'Regidoria, àrea tècnica o servei municipal' },
  { id: 'comarcal',      ic: '🗺', c: 'indigo', sector: 'public',
    t: 'Consell comarcal',        d: 'O mancomunitat de municipis' },
  { id: 'entitat',       ic: '🤝', c: 'green',  sector: 'public',
    t: 'Entitat o associació',    d: 'AVV, ateneu, casal, banc de temps' },
  { id: 'cooperativa',   ic: '🚀', c: 'orange', sector: 'privat',
    t: 'Cooperativa o empresa',   d: 'SCCL, SL, projecte econòmic' },
  { id: 'grup',          ic: '🌱', c: 'blue',   sector: 'public',
    t: 'Grup promotor',           d: 'Encara sense forma jurídica' },
  { id: 'acompanyament', ic: '🎓', c: 'purple', sector: 'privat',
    t: 'Entitat d\'acompanyament', d: 'Ateneu Cooperatiu, consultoria ESS' },
  { id: 'fundacio',      ic: '💛', c: '#fbbf24', sector: 'public',
    t: 'Fundació o finançador',   d: 'Obra social, convocatòries' },
  { id: 'particular',    ic: '👤', c: 'muted',  sector: 'tots',
    t: 'A títol personal',        d: 'Professional o persona interessada' }
];

/* ══ ELS ROLS ═════════════════════════════════════════════════════════════
   Qui pregunta, dins de la seva casa. Fins ara el camp era un text lliure
   («càrrec o paper») i el que en sortia no es podia fer servir per a res: dues
   persones amb la mateixa feina l'escrivien de dues maneres.

   Aquesta llista és la mateixa que ordena els itineraris formatius, i per això
   són **rols directius i no rols del SOS**: qui demana un pressupost és una
   direcció, no un guardià de territori. El text lliure segueix existint per a
   qui no s'hi trobi, que és el que sempre passa amb una llista tancada. */
const ROLS = [
  { id: 'direccio',   t: 'Direcció general o gerència' },
  { id: 'persones',   t: 'Direcció de persones o RRHH' },
  { id: 'innovacio',  t: 'Innovació, estratègia o projectes' },
  { id: 'organitzacio', t: 'Organització, processos o qualitat' },
  { id: 'tecnic',     t: 'Tècnic/a de participació, promoció o serveis' },
  { id: 'politic',    t: 'Càrrec electe o de confiança' },
  { id: 'coordinacio', t: 'Coordinació d\'equip o de programa' },
  { id: 'altre',      t: 'Una altra cosa' }
];

/* ══ Les pàgines que porten cada bloc ════════════════════════════════════ */
const PAGINES = ['diagnostic.html', 'pressupost.html'];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const varCol = c => /^#/.test(c) ? c : 'var(--' + c + ')';

/* ── Bloc 1 · Qui ets ─────────────────────────────────────────────────────
   El rol passa de text lliure a llista amb sortida: la llista serveix per
   ordenar la proposta i el text lliure evita el problema de sempre, que és
   que qui no s'hi troba escriu qualsevol cosa o se'n va. */
function blocQui() {
  const ops = ROLS.map(r => `<option value="${r.id}">${esc(r.t)}</option>`).join('');
  return `<div class="grid2">
<div class="f"><label for="nom">Nom i cognoms *</label><input type="text" id="nom" name="nom" required autocomplete="name"></div>
<div class="f"><label for="rol">El teu paper a la casa</label><select id="rol" name="rol">${ops}</select></div>
</div>
<div class="grid2">
<div class="f"><label for="mail">Correu electrònic *</label><input type="email" id="mail" name="mail" required autocomplete="email"></div>
<div class="f"><label for="tel">Telèfon (opcional)</label><input type="tel" id="tel" name="tel" autocomplete="tel"></div>
</div>
<div class="f"><label for="carrec">Com se'n diu exactament</label><input type="text" id="carrec" name="carrec" placeholder="p.ex. tècnica de participació" autocomplete="organization-title"><div class="hint">Opcional. Serveix per adreçar-nos-hi com toca.</div></div>`;
}

/* ── Bloc 2 · D'on véns ─────────────────────────────────────────────────── */
function blocOrg() {
  const ops = ORGS.map(o =>
    `<button type="button" class="opt" data-v="${o.id}" data-sector="${o.sector}" style="--c:${varCol(o.c)}">` +
    `<span class="o-t">${o.ic} ${esc(o.t)}</span><span class="o-d">${esc(o.d)}</span></button>`
  ).join('\n');
  return `<div class="f">
<label>Tipus d'organització *</label>
<div class="opts" id="orgType">
${ops}
</div>
</div>
<div class="f"><label for="orgNom">Nom de l'organització</label><input type="text" id="orgNom" name="orgNom" placeholder="deixa-ho en blanc si véns a títol personal" autocomplete="organization"></div>
<div class="grid2">
<div class="f"><label for="municipi">Municipi *</label><input type="text" id="municipi" name="municipi" required placeholder="p.ex. Torrelles de Foix"></div>
<div class="f"><label for="comarca">Comarca</label><input type="text" id="comarca" name="comarca" placeholder="p.ex. Alt Penedès"></div>
</div>
<div class="f"><label for="poblacio">Població aproximada a què arribeu</label><input type="number" id="poblacio" name="poblacio" min="0" step="1" placeholder="p.ex. 2400"><div class="hint">Habitants del municipi, o persones a qui arriba el vostre projecte.</div></div>`;
}

/* ── El sector de cada tipus, per al JavaScript de les dues pàgines ─────── */
function blocDades() {
  const orgs = ORGS.map(o => `'${o.id}':'${o.sector}'`).join(',');
  const rols = ROLS.map(r => `'${r.id}':'${r.t.replace(/'/g, "\\'")}'`).join(',');
  return `// Generat per SOS/tools/build-formularis.js — no ho editis a mà.
const ORG_SECTOR={${orgs}};
const ROL_NOM={${rols}};`;
}

/* ── El triador de paquets · només al pressupost ──────────────────────────
   Surt del catàleg i no d'una còpia: `build-oferta.js` és la font única de què
   es ven, i si aquesta llista s'escrivís a part, el dia que s'afegís un paquet
   hi hauria una pàgina que el ven i una altra que no el sap demanar.

   Cada casella porta el sector i la forquilla a l'atribut, perquè el càlcul del
   navegador no hagi de tornar a saber-se el catàleg de memòria. */
const { FAMILIES, PAQUETS, SOS_PAQUETS, NIVELLS } = require('./build-oferta.js');

function blocPaquets() {
  const cap = f => `<h4 class="pq-fam">${f.ic} ${esc(f.nom)}</h4>`;
  const fila = p => `<label class="pq" data-sector="${p.sector}">` +
    `<input type="checkbox" name="paquet" value="${p.id}"` +
    (p.mida ? ' data-mida="1"' : ` data-min="${p.preuMin}" data-max="${p.preuMax}"`) + '>' +
    `<span class="pq-n">${esc(p.nom)}</span>` +
    `<span class="pq-p">${p.mida ? 'a mida' : (p.preuMin === p.preuMax
      ? p.preuMin.toLocaleString('ca-ES') + ' €'
      : p.preuMin.toLocaleString('ca-ES') + '–' + p.preuMax.toLocaleString('ca-ES') + ' €')}</span>` +
    `</label>`;
  const fams = FAMILIES.map(f =>
    cap(f) + '\n<div class="pq-g">\n' + PAQUETS.filter(p => p.fam === f.id).map(fila).join('\n') + '\n</div>'
  ).join('\n');
  return fams + '\n<h4 class="pq-fam">🖥️ Al voltant del SOS</h4>\n<div class="pq-g">\n' +
    SOS_PAQUETS.map(fila).join('\n') + '\n</div>';
}

/* L'escala, per calcular al navegador la part contractada per hores. */
function blocEscala() {
  const niv = NIVELLS.map(n => `{id:'${n.id}',nom:'${n.nom.replace(/'/g, "\\'")}',hora:${n.hora}}`).join(',');
  const noms = PAQUETS.concat(SOS_PAQUETS)
    .map(p => `'${p.id}':'${p.nom.replace(/'/g, "\\'")}'`).join(',');
  return `// Generat per SOS/tools/build-formularis.js des del catàleg — no ho editis a mà.
const NIVELLS=[${niv}];
const PAQ_NOM={${noms}};`;
}

/* Els camps que determinen el preu dels dos paquets sense xifra publicada.
   Es pregunten, no s'endevinen: són exactament les tres coses que el mapa de
   cost necessita i que una pàgina no pot saber. */
function blocMida() {
  return `<div class="grid2">
<div class="f"><label for="participants">Quantes persones hi participaran</label><input type="number" id="participants" name="participants" min="0" step="1" placeholder="p.ex. 60"><div class="hint">Per al taller «Fent Pinya». Marca la diferència més gran del pressupost.</div></div>
<div class="f"><label for="alcada">Alçada de la demostració</label><select id="alcada" name="alcada">
<option value="">— No en demano —</option>
<option value="4">4 pisos</option>
<option value="5">5 pisos</option>
<option value="6">6 pisos</option>
</select><div class="hint">L'alçada és quanta colla cal moure, i és el que fixa el cost.</div></div>
</div>
<div class="f"><label for="lloc">On es fa i a quina distància</label><input type="text" id="lloc" name="lloc" placeholder="p.ex. plaça de la Vila, a 40 min de Barcelona"><div class="hint">El desplaçament de l'equip entra al pressupost al seu preu, sense marge a sobre.</div></div>`;
}

const MARQUES = [
  ['<!--FORM-QUI-->', '<!--/FORM-QUI-->', blocQui],
  ['<!--FORM-ORG-->', '<!--/FORM-ORG-->', blocOrg],
  ['/*FORM-DADES*/', '/*/FORM-DADES*/', blocDades]
];
/* Els que només té el pressupost. Es declaren a part perquè demanar-los al
   diagnòstic el faria fallar per una marca que allà no té cap sentit. */
const NOMES_PRESSU = [
  ['<!--FORM-PAQUETS-->', '<!--/FORM-PAQUETS-->', blocPaquets],
  ['<!--FORM-MIDA-->', '<!--/FORM-MIDA-->', blocMida],
  ['/*FORM-ESCALA*/', '/*/FORM-ESCALA*/', blocEscala]
];

let desviats = [], faltaven = [];
for (const pag of PAGINES) {
  const cami = join(SOS, pag);
  const src = readFileSync(cami, 'utf8');
  let out = src;
  const seves = MARQUES.concat(pag === 'pressupost.html' ? NOMES_PRESSU : []);
  for (const [obre, tanca, fn] of seves) {
    const i = out.indexOf(obre), j = out.indexOf(tanca);
    if (i < 0 || j < 0 || j < i) { faltaven.push(pag + ' → ' + obre); continue; }
    out = out.slice(0, i + obre.length) + '\n' + fn() + '\n' + out.slice(j);
  }
  if (out !== src) { desviats.push(pag); if (!CHECK) writeFileSync(cami, out); }
}

if (faltaven.length) {
  console.error('✗ Falten marques:\n  ' + faltaven.join('\n  '));
  console.error('  Sense elles el generador no sap on escriure i no s\'inventa el lloc.');
  process.exit(1);
}

const resum = `${PAGINES.length} formularis · ${ORGS.length} tipus d'organització · ${ROLS.length} rols`;
if (CHECK) {
  if (!desviats.length) { console.log(`✅ Els formularis al dia · ${resum}`); process.exit(0); }
  console.error('❌ Els blocs compartits no corresponen al que hi ha declarat: ' + desviats.join(', '));
  console.error('   Arregla-ho amb:  node SOS/tools/build-formularis.js');
  process.exit(1);
}
console.log(`✅ ${resum}` + (desviats.length ? ' · escrits: ' + desviats.join(', ') : ' · ja hi eren'));
