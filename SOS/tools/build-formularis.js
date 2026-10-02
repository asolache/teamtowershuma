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
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const SOS = join(__dirname, '..');
const CHECK = process.argv.includes('--check');

/* ══ ELS TIPUS D'ORGANITZACIÓ ═════════════════════════════════════════════
   L'ordre no és alfabètic: va del que més ens contracta al que menys, perquè
   la primera opció d'una llista és la que més es tria i ha de ser la que més
   sovint és certa.

   `sector` diu a quina meitat del catàleg mira aquesta casa. `particular` és
   l'únic sense sector clar i per això mira les dues: qui ve a títol personal
   pot acabar comprant una formació per a ell o proposant-la a la seva feina.

   `fam` diu a quin diagnòstic surt cada tipus. Són dos i pregunten coses
   diferents: el del **territori** vol saber el municipi i a quanta gent
   arribeu, i el de l'**organització** vol saber quantes persones sou i com
   compreu. Dues llistes separades haurien divergit; una llista amb una
   etiqueta, no.

   Dos tipus són dels dos costats a posta —una cooperativa i una fundació
   poden trucar per qualsevol dels dos motius— i això és el que fa que
   `ORG_SECTOR` segueixi sent una sola taula. */
const ORGS = [
  { id: 'ajuntament',    ic: '🏛', c: 'indigo', sector: 'public', fam: ['territori'],
    t: 'Ajuntament',              d: 'Regidoria, àrea tècnica o servei municipal',
    tEs: 'Ayuntamiento', dEs: 'Concejalía, área técnica o servicio municipal' },
  { id: 'comarcal',      ic: '🗺', c: 'indigo', sector: 'public', fam: ['territori'],
    t: 'Consell comarcal',        d: 'O mancomunitat de municipis',
    tEs: 'Consejo comarcal', dEs: 'O mancomunidad de municipios' },
  { id: 'entitat',       ic: '🤝', c: 'green',  sector: 'public', fam: ['territori'],
    t: 'Entitat o associació',    d: 'AVV, ateneu, casal, banc de temps',
    tEs: 'Entidad o asociación', dEs: 'AAVV, ateneo, casal, banco de tiempo' },
  { id: 'cooperativa',   ic: '🚀', c: 'orange', sector: 'privat', fam: ['territori', 'organitzacio'],
    t: 'Cooperativa o empresa',   d: 'SCCL, SL, projecte econòmic',
    tEs: 'Cooperativa o empresa', dEs: 'SCCL, SL, proyecto económico' },
  { id: 'grup',          ic: '🌱', c: 'blue',   sector: 'public', fam: ['territori'],
    t: 'Grup promotor',           d: 'Encara sense forma jurídica',
    tEs: 'Grupo promotor', dEs: 'Todavía sin forma jurídica' },
  { id: 'acompanyament', ic: '🎓', c: 'purple', sector: 'privat', fam: ['territori'],
    t: 'Entitat d\'acompanyament', d: 'Ateneu Cooperatiu, consultoria ESS',
    tEs: 'Entidad de acompañamiento', dEs: 'Ateneu Cooperatiu, consultoría ESS' },
  { id: 'fundacio',      ic: '💛', c: '#fbbf24', sector: 'public', fam: ['territori', 'organitzacio'],
    t: 'Fundació o finançador',   d: 'Obra social, convocatòries',
    tEs: 'Fundación o financiador', dEs: 'Obra social, convocatorias' },
  { id: 'particular',    ic: '👤', c: 'muted',  sector: 'tots', fam: ['territori'],
    t: 'A títol personal',        d: 'Professional o persona interessada',
    tEs: 'A título personal', dEs: 'Profesional o persona interesada' },

  /* ── Els del costat de l'organització ──────────────────────────────────
     L'ordre torna a ser per com de sovint truquen, i el primer de la llista
     és el que no existia: **una agència o DMC no decideix, revèn.** El
     catàleg castellers del 2026 està escrit per a elles —format, aforament,
     espai i idiomes— i el formulari d'avui no en té ni la casella, així que
     acabaven triant «cooperativa o empresa» i el diagnòstic els parlava de
     relleu i de governança. */
  { id: 'agencia',       ic: '🎪', c: 'orange', sector: 'privat', fam: ['organitzacio'],
    t: 'Agència o DMC',           d: 'Ho compres per a un client teu',
    tEs: 'Agencia o DMC', dEs: 'Lo compras para un cliente tuyo' },
  { id: 'gran',          ic: '🏢', c: 'blue',   sector: 'privat', fam: ['organitzacio'],
    t: 'Empresa gran',            d: 'Amb departament de formació i pressupost anual',
    tEs: 'Empresa grande', dEs: 'Con departamento de formación y presupuesto anual' },
  { id: 'pime',          ic: '🔧', c: 'green',  sector: 'privat', fam: ['organitzacio'],
    t: 'Pime',                    d: 'La decisió la pren qui la dirigeix',
    tEs: 'Pyme', dEs: 'La decisión la toma quien la dirige' },
  { id: 'escola',        ic: '🎓', c: 'indigo', sector: 'privat', fam: ['organitzacio'],
    t: 'Escola de negoci o universitat', d: 'Programa, màster o claustre',
    tEs: 'Escuela de negocio o universidad', dEs: 'Programa, máster o claustro' }
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
  { id: 'direccio',   t: 'Direcció general o gerència', tEs: 'Dirección general o gerencia' },
  { id: 'persones',   t: 'Direcció de persones o RRHH', tEs: 'Dirección de personas o RRHH' },
  { id: 'innovacio',  t: 'Innovació, estratègia o projectes', tEs: 'Innovación, estrategia o proyectos' },
  { id: 'organitzacio', t: 'Organització, processos o qualitat', tEs: 'Organización, procesos o calidad' },
  { id: 'tecnic',     t: 'Tècnic/a de participació, promoció o serveis', tEs: 'Técnico/a de participación, promoción o servicios' },
  { id: 'politic',    t: 'Càrrec electe o de confiança', tEs: 'Cargo electo o de confianza' },
  { id: 'coordinacio', t: 'Coordinació d\'equip o de programa', tEs: 'Coordinación de equipo o de programa' },
  { id: 'altre',      t: 'Una altra cosa', tEs: 'Otra cosa' }
];

/* ══ Les pàgines que porten cada bloc ════════════════════════════════════
   `fam` decideix quins tipus d'organització i quins camps hi surten. El
   pressupost és de família `tots` perquè hi arriba gent dels dos costats. */
const PAGINES = [
  { fitxer: 'diagnostic-territori.html', fam: 'territori' },
  { fitxer: 'diagnostic-org.html', fam: 'organitzacio' },
  { fitxer: 'pressupost.html', fam: 'tots' }
];
const orgsDe = fam => ORGS.filter(o => fam === 'tots' || o.fam.indexOf(fam) >= 0);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const varCol = c => /^#/.test(c) ? c : 'var(--' + c + ')';

/* ── Bloc 1 · Qui ets ─────────────────────────────────────────────────────
   El rol passa de text lliure a llista amb sortida: la llista serveix per
   ordenar la proposta i el text lliure evita el problema de sempre, que és
   que qui no s'hi troba escriu qualsevol cosa o se'n va. */
function blocQui() {
  const ops = ROLS.map(r =>
    `<option value="${r.id}" data-i18n="fo.rol.${r.id}">${esc(r.t)}</option>`).join('');
  return `<div class="grid2">
<div class="f"><label for="nom" data-i18n="fo.l.nom">Nom i cognoms *</label><input type="text" id="nom" name="nom" required autocomplete="name"></div>
<div class="f"><label for="rol" data-i18n="fo.l.rol">El teu paper a la casa</label><select id="rol" name="rol">${ops}</select></div>
</div>
<div class="grid2">
<div class="f"><label for="mail" data-i18n="fo.l.mail">Correu electrònic *</label><input type="email" id="mail" name="mail" required autocomplete="email"></div>
<div class="f"><label for="tel" data-i18n="fo.l.tel">Telèfon (opcional)</label><input type="tel" id="tel" name="tel" autocomplete="tel"></div>
</div>
<div class="f"><label for="carrec" data-i18n="fo.l.carrec">Com se'n diu exactament</label><input type="text" id="carrec" name="carrec" data-i18n-ph="fo.ph.carrec" placeholder="p.ex. tècnica de participació" autocomplete="organization-title"><div class="hint" data-i18n="fo.h.carrec">Opcional. Serveix per adreçar-nos-hi com toca.</div></div>`;
}

/* ── Bloc 2 · D'on véns ─────────────────────────────────────────────────── */
function blocOrg(fam) {
  /* Les claus del diccionari hi van sempre. Al diagnòstic, que és monolingüe,
     un atribut que apunta a un diccionari que no existeix no fa res i deixa el
     text tal com és —que és el correcte—; al pressupost el tradueix. */
  const ops = orgsDe(fam).map(o =>
    `<button type="button" class="opt" data-v="${o.id}" data-sector="${o.sector}" style="--c:${varCol(o.c)}">` +
    `<span class="o-t" data-i18n="fo.org.${o.id}.t">${o.ic} ${esc(o.t)}</span>` +
    `<span class="o-d" data-i18n="fo.org.${o.id}.d">${esc(o.d)}</span></button>`
  ).join('\n');
  return `<div class="f">
<label data-i18n="fo.l.tipus">Tipus d'organització *</label>
<div class="opts" id="orgType">
${ops}
</div>
</div>
<div class="f"><label for="orgNom" data-i18n="fo.l.orgnom">Nom de l'organització</label><input type="text" id="orgNom" name="orgNom" data-i18n-ph="fo.ph.orgnom" placeholder="deixa-ho en blanc si véns a títol personal" autocomplete="organization"></div>
<div class="grid2">
<div class="f"><label for="web">El vostre web</label><input type="url" id="web" name="web" placeholder="p.ex. exemple.cat" autocomplete="url" inputmode="url"><div class="hint">Ens estalvia preguntar-vos qui sou. Opcional.</div></div>
<div class="f"><label for="dediqueu">A què us dediqueu</label><input type="text" id="dediqueu" name="dediqueu" placeholder="p.ex. distribució alimentària, 3 centres" maxlength="90"></div>
</div>
<div class="grid2">
<div class="f"><label for="municipi">Municipi *</label><input type="text" id="municipi" name="municipi" required placeholder="p.ex. Torrelles de Foix"></div>
<div class="f"><label for="comarca">Comarca</label><input type="text" id="comarca" name="comarca" placeholder="p.ex. Alt Penedès"></div>
</div>
${fam === 'organitzacio'
    ? `<div class="f"><label for="persones">Quantes persones sou</label><input type="number" id="persones" name="persones" min="0" step="1" placeholder="p.ex. 45"><div class="hint">De tota l'organització, no només de l'equip que hi entraria.</div></div>`
    : `<div class="f"><label for="poblacio">Població aproximada a què arribeu</label><input type="number" id="poblacio" name="poblacio" min="0" step="1" placeholder="p.ex. 2400"><div class="hint">Habitants del municipi, o persones a qui arriba el vostre projecte.</div></div>`}`;
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
/* ── El bloc de mida · cada pregunta diu de quin paquet és ───────────────
   Fins ara sortien totes tres sempre, i «alçada de la demostració» demanava
   de quants pisos el vols a qui havia marcat una formació d'equips. Una
   pregunta que no ve a tomb no és només soroll: fa dubtar de si has triat bé
   el que havies triat.

   Cada camp declara a quins paquets serveix, i el formulari només ensenya els
   que toquen. Els ids es comproven contra el catàleg, que si no, el dia que un
   paquet canviï de nom el camp deixaria de sortir mai i ningú ho notaria. */
const CAMPS_MIDA = [
  { id: 'participants', per: ['fent-pinya', 'demos', 'produccio', 'comu-diada'] },
  { id: 'alcada', per: ['demos'] },
  { id: 'lloc', per: ['fent-pinya', 'demos', 'produccio', 'comu-diada'] }
];
const midaPer = id => (CAMPS_MIDA.find(c => c.id === id) || { per: [] }).per.join(' ');

function blocMida() {
  return `<div class="grid2">
<div class="f" data-mida-per="${midaPer('participants')}"><label for="participants">Quantes persones hi participaran</label><input type="number" id="participants" name="participants" min="0" step="1" placeholder="p.ex. 60"><div class="hint">Marca la diferència més gran del pressupost.</div></div>
<div class="f" data-mida-per="${midaPer('alcada')}"><label for="alcada">Alçada de la demostració</label><select id="alcada" name="alcada">
<option value="">— tria —</option>
<option value="4">4 pisos</option>
<option value="5">5 pisos</option>
<option value="6">6 pisos</option>
</select><div class="hint">L'alçada és quanta colla cal moure, i és el que fixa el cost.</div></div>
</div>
<div class="f" data-mida-per="${midaPer('lloc')}"><label for="lloc">On es fa i a quina distància</label><input type="text" id="lloc" name="lloc" placeholder="p.ex. plaça de la Vila, a 40 min de Barcelona"><div class="hint">El desplaçament de l'equip entra al pressupost al seu preu, sense marge a sobre.</div></div>
<p class="hint" id="midaCap" hidden>Aquestes preguntes surten quan demanes una activitat amb gent, data i lloc. Amb el que has triat ara, no calen.</p>`;
}

/* La guarda va aquí i no a `check-formularis.js` perquè el que es comprova és
   la declaració, i la declaració viu en aquest fitxer. */
(() => {
  const ids = PAQUETS.concat(SOS_PAQUETS).map(x => x.id);
  const orfes = CAMPS_MIDA.flatMap(c => c.per.filter(x => ids.indexOf(x) < 0).map(x => c.id + ' → ' + x));
  if (orfes.length) {
    console.error('✗ camps de mida lligats a paquets que no existeixen: ' + orfes.join(', '));
    console.error('  No petaria: el camp senzillament no sortiria mai.');
    process.exit(1);
  }
})();

/* ══ EL DICCIONARI DEL PRESSUPOST ════════════════════════════════════════════
   `pressupost.html` era **només en català**: ni `data-i18n`, ni botó de
   llengua, `<html lang="ca">` i prou. I és la pantalla on algú demana un preu.

   Es declara aquí i no a la pàgina pel motiu de sempre: la meitat del
   formulari **la genera aquest fitxer** —els tipus d'organització, els rols,
   els paquets, els camps de mida— i tenir el diccionari en dos llocs voldria
   dir que un dia no coincidissin. El que la pàgina té escrit a mà també hi és,
   i així hi ha **un sol lloc** on es tradueix el formulari.

   Els noms i les forquilles dels paquets no hi són: ja els tradueix
   `build-oferta.js`, que és qui els declara, i el formulari els llegeix d'allà
   amb els seus camps `*Es`.

   ⚠ **El que encara no es tradueix**: el text de la proposta que el JavaScript
   munta en prémer el botó (`rLead`, `rMetode`, les línies del resum). Viu dins
   del script de la pàgina i és la pròxima tanda; el formulari, que és el que
   es llegeix mentre s'omple, sí. */
const PRESSU = {
  'pr.h1': { ca: 'Demana pressupost', es: 'Pide presupuesto' },
  'pr.intro': {
    ca: 'Tria el que t\'interessa i en surt una <strong>proposta esborrany</strong> amb el desglossament a la vista: la forquilla de cada paquet, les hores per nivell si el contractes per hores, i què falta per tancar-la. <strong>Te la pots endur encara que no ens l\'enviïs.</strong>',
    es: 'Elige lo que te interesa y sale una <strong>propuesta borrador</strong> con el desglose a la vista: la horquilla de cada paquete, las horas por nivel si lo contratas por horas, y qué falta para cerrarla. <strong>Te la puedes llevar aunque no nos la envíes.</strong>'
  },
  'pr.s1.h': { ca: '1 · Qui ets', es: '1 · Quién eres' },
  'pr.s1.sub': {
    ca: 'Per saber amb qui parlem i com adreçar-nos-hi. Si ja has fet el diagnòstic, això ja hauria de venir omplert.',
    es: 'Para saber con quién hablamos y cómo dirigirnos. Si ya has hecho el diagnóstico, esto ya debería venir rellenado.'
  },
  'pr.s1.err': { ca: 'Cal com a mínim el nom i un correu vàlid.', es: 'Hace falta como mínimo el nombre y un correo válido.' },
  'pr.s2.h': { ca: '2 · D\'on véns', es: '2 · De dónde vienes' },
  'pr.s2.err': { ca: 'Tria el tipus d\'organització i escriu el municipi.', es: 'Elige el tipo de organización y escribe el municipio.' },
  'pr.s3.h': { ca: '3 · Què vols', es: '3 · Qué quieres' },
  'pr.s3.err': { ca: 'Marca com a mínim un paquet.', es: 'Marca como mínimo un paquete.' },
  'pr.s4.h': { ca: '4 · Com i quan', es: '4 · Cómo y cuándo' },
  'pr.s4.sub': {
    ca: 'Les tres coses que acaben de determinar el pressupost, i que una pàgina no pot endevinar.',
    es: 'Las tres cosas que acaban de determinar el presupuesto, y que una página no puede adivinar.'
  },
  'pr.seg': { ca: 'Següent →', es: 'Siguiente →' },
  'pr.enrere': { ca: '← Enrere', es: '← Atrás' },
  'pr.veure': { ca: 'Veure la proposta →', es: 'Ver la propuesta →' },
  'pr.repte': { ca: 'Què voleu resoldre, en poques paraules', es: 'Qué queréis resolver, en pocas palabras' },
  'pr.repte.ph': {
    ca: 'p.ex. L\'equip directiu ha crescut de 6 a 14 persones en dos anys i les decisions s\'encallen. Volem entendre per què abans de reorganitzar res.',
    es: 'p.ej. El equipo directivo ha crecido de 6 a 14 personas en dos años y las decisiones se atascan. Queremos entender por qué antes de reorganizar nada.'
  },
  'pr.quan': { ca: 'Quan', es: 'Cuándo' },
  'pr.quan.explorant': { ca: 'Estem explorant, sense presses', es: 'Estamos explorando, sin prisas' },
  'pr.quan.curs': { ca: 'Aquest curs o semestre', es: 'Este curso o semestre' },
  'pr.quan.data': { ca: 'Tenim una data concreta', es: 'Tenemos una fecha concreta' },
  'pr.diners': { ca: 'D\'on sortirien els diners', es: 'De dónde saldría el dinero' },
  'pr.diners.propi': { ca: 'Pressupost propi', es: 'Presupuesto propio' },
  'pr.diners.partida': { ca: 'Partida ja assignada', es: 'Partida ya asignada' },
  'pr.diners.subvencio': { ca: 'D\'una subvenció que hem de demanar', es: 'De una subvención que tenemos que pedir' },
  'pr.diners.perveure': { ca: 'Encara per veure', es: 'Todavía por ver' },
  'pr.hores.h': { ca: 'Si ho contracteu per hores', es: 'Si lo contratáis por horas' },
  'pr.esc.niv': { ca: 'Nivell', es: 'Nivel' },
  'pr.esc.preu': { ca: 'Preu hora', es: 'Precio hora' },
  'pr.esc.hores': { ca: 'Hores', es: 'Horas' },
  'pr.esc.sub': { ca: 'Subtotal', es: 'Subtotal' },
  'pr.prop.h': { ca: 'Proposta esborrany', es: 'Propuesta borrador' },
  'pr.prop.total': { ca: 'Total orientatiu · sense IVA', es: 'Total orientativo · sin IVA' },
  'pr.prop.triat': { ca: 'El que has triat', es: 'Lo que has elegido' },
  'pr.prop.hores': { ca: 'Contractació per hores', es: 'Contratación por horas' },
  'pr.prop.metode': { ca: 'Com s\'ha calculat', es: 'Cómo se ha calculado' },
  'pr.prop.falta': { ca: 'Què falta per tancar-ho', es: 'Qué falta para cerrarlo' },
  'pr.prop.envia': { ca: '✉ Envia\'ns la petició', es: '✉ Envíanos la petición' },
  'pr.prop.copia': { ca: '📋 Copia-la', es: '📋 Cópiala' },
  'pr.prop.baixa': { ca: '⬇ Descarrega-la (JSON)', es: '⬇ Descárgala (JSON)' },
  'pr.prop.torna': { ca: '↺ Torna-hi', es: '↺ Vuelve' },
  'pr.priv': { ca: 'Aquest formulari no envia res sol.', es: 'Este formulario no envía nada solo.' },
  /* Les tres dels camps de mida (`blocMida`), que també els genera aquest
     fitxer i per tant es declaren aquí i no a mitja funció. */
  'pr.mida.part': { ca: 'Quantes persones hi participaran', es: 'Cuántas personas participarán' },
  'pr.mida.part.h': { ca: 'Marca la diferència més gran del pressupost.', es: 'Marca la diferencia más grande del presupuesto.' },
  'pr.mida.alc': { ca: 'Alçada de la demostració', es: 'Altura de la demostración' },
  'pr.mida.alc.h': { ca: 'L\'alçada és quanta colla cal moure, i és el que fixa el cost.', es: 'La altura es cuánta colla hay que mover, y es lo que fija el coste.' },
  'pr.mida.lloc': { ca: 'On es fa i a quina distància', es: 'Dónde se hace y a qué distancia' },
  'pr.mida.lloc.h': { ca: 'El desplaçament de l\'equip entra al pressupost al seu preu, sense marge a sobre.', es: 'El desplazamiento del equipo entra al presupuesto a su precio, sin margen encima.' },
  'pr.mida.cap': {
    ca: 'Aquestes preguntes surten quan demanes una activitat amb gent, data i lloc. Amb el que has triat ara, no calen.',
    es: 'Estas preguntas salen cuando pides una actividad con gente, fecha y lugar. Con lo que has elegido ahora, no hacen falta.'
  },
  'pr.filtre.tots': { ca: 'Tot', es: 'Todo' },
  'pr.filtre.privat': { ca: 'Empreses i cooperatives', es: 'Empresas y cooperativas' },
  'pr.filtre.public': { ca: 'Administració i entitats', es: 'Administración y entidades' },
  /* Les etiquetes dels blocs compartits amb el diagnòstic. Van a aquest
     diccionari perquè és el pressupost qui el porta; al diagnòstic l'atribut
     no troba diccionari i el text es queda escrit, que és el correcte mentre
     aquella pàgina sigui monolingüe. */
  'fo.l.nom': { ca: 'Nom i cognoms *', es: 'Nombre y apellidos *' },
  'fo.l.rol': { ca: 'El teu paper a la casa', es: 'Tu papel en la casa' },
  'fo.l.mail': { ca: 'Correu electrònic *', es: 'Correo electrónico *' },
  'fo.l.tel': { ca: 'Telèfon (opcional)', es: 'Teléfono (opcional)' },
  'fo.l.carrec': { ca: 'Com se\'n diu exactament', es: 'Cómo se llama exactamente' },
  'fo.ph.carrec': { ca: 'p.ex. tècnica de participació', es: 'p.ej. técnica de participación' },
  'fo.h.carrec': { ca: 'Opcional. Serveix per adreçar-nos-hi com toca.', es: 'Opcional. Sirve para dirigirnos como toca.' },
  'fo.l.tipus': { ca: 'Tipus d\'organització *', es: 'Tipo de organización *' },
  'fo.l.orgnom': { ca: 'Nom de l\'organització', es: 'Nombre de la organización' },
  'fo.ph.orgnom': { ca: 'deixa-ho en blanc si véns a títol personal', es: 'déjalo en blanco si vienes a título personal' }
};

/* El diccionari d'una llengua: el que es declara aquí a dalt, més el que surt
   de `ORGS` i `ROLS`, que els genera aquest mateix fitxer. */
function dicPressu(l) {
  const q = x => String(x).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const tria = (o, c) => l === 'es' ? (o[c + 'Es'] || o[c]) : o[c];
  const f = [];
  Object.entries(PRESSU).forEach(([k, v]) => f.push(`  '${k}':'${q(v[l])}',`));
  ORGS.forEach(o => {
    /* L'emoji va **dins** del valor. Sense ell, canviar de llengua el feia
       desaparèixer: el marcatge l'escriu al costat del text i el diccionari
       substitueix el `textContent` sencer. No peta, i la pantalla perd dotze
       icones a l'altra llengua. */
    f.push(`  'fo.org.${o.id}.t':'${q(o.ic + ' ' + tria(o, 't'))}',`);
    f.push(`  'fo.org.${o.id}.d':'${q(tria(o, 'd'))}',`);
  });
  ROLS.forEach(r => f.push(`  'fo.rol.${r.id}':'${q(tria(r, 't'))}',`));
  return f.join('\n');
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
  ['/*FORM-ESCALA*/', '/*/FORM-ESCALA*/', blocEscala],
  /* Els dos diccionaris. Van aquí i no a la pàgina perquè mitja pàgina la
     genera aquest fitxer: tenir-los en dos llocs voldria dir que un dia no
     coincidissin, i el que divergiria seria una llengua sencera. */
  ['/*PRESSU-I18N-CA*/', '/*/PRESSU-I18N-CA*/', () => dicPressu('ca')],
  ['/*PRESSU-I18N-ES*/', '/*/PRESSU-I18N-ES*/', () => dicPressu('es')]
];

let desviats = [], faltaven = [];
for (const { fitxer, fam } of PAGINES) {
  const cami = join(SOS, fitxer);
  if (!existsSync(cami)) { faltaven.push(fitxer + ' → la pàgina no existeix'); continue; }
  const src = readFileSync(cami, 'utf8');
  let out = src;
  const seves = MARQUES.concat(fitxer === 'pressupost.html' ? NOMES_PRESSU : []);
  for (const [obre, tanca, fn] of seves) {
    const i = out.indexOf(obre), j = out.indexOf(tanca);
    if (i < 0 || j < 0 || j < i) { faltaven.push(fitxer + ' → ' + obre); continue; }
    out = out.slice(0, i + obre.length) + '\n' + fn(fam) + '\n' + out.slice(j);
  }
  if (out !== src) { desviats.push(fitxer); if (!CHECK) writeFileSync(cami, out); }
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
