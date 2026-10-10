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
   `ORG_SECTOR` segueixi sent una sola taula.

   **El sector és el de qui signa**, el mateix criteri que al catàleg: una
   cooperativa signa com a empresa encara que faci feina comunitària, i un
   ateneu o una fundació, com a tercer sector encara que els pagui
   l'administració. «A títol personal» no és cap de les tres cases i per això
   val `'tot'`: una persona no té un calaix de paquets, els té tots. */
const ORGS = [
  { id: 'ajuntament',    ic: '🏛', c: 'indigo', sector: 'admin', fam: ['territori'],
    t: 'Ajuntament',              d: 'Regidoria, àrea tècnica o servei municipal',
    tEs: 'Ayuntamiento', dEs: 'Concejalía, área técnica o servicio municipal' },
  { id: 'comarcal',      ic: '🗺', c: 'indigo', sector: 'admin', fam: ['territori'],
    t: 'Consell comarcal',        d: 'O mancomunitat de municipis',
    tEs: 'Consejo comarcal', dEs: 'O mancomunidad de municipios' },
  { id: 'entitat',       ic: '🤝', c: 'green',  sector: 'tercer', fam: ['territori'],
    t: 'Entitat o associació',    d: 'AVV, ateneu, casal, banc de temps',
    tEs: 'Entidad o asociación', dEs: 'AAVV, ateneo, casal, banco de tiempo' },
  { id: 'cooperativa',   ic: '🚀', c: 'orange', sector: 'empresa', fam: ['territori', 'organitzacio'],
    t: 'Cooperativa o empresa',   d: 'SCCL, SL, projecte econòmic',
    tEs: 'Cooperativa o empresa', dEs: 'SCCL, SL, proyecto económico' },
  { id: 'grup',          ic: '🌱', c: 'blue',   sector: 'tercer', fam: ['territori'],
    t: 'Grup promotor',           d: 'Encara sense forma jurídica',
    tEs: 'Grupo promotor', dEs: 'Todavía sin forma jurídica' },
  { id: 'acompanyament', ic: '🎓', c: 'purple', sector: 'tercer', fam: ['territori'],
    t: 'Entitat d\'acompanyament', d: 'Ateneu Cooperatiu, consultoria ESS',
    tEs: 'Entidad de acompañamiento', dEs: 'Ateneu Cooperatiu, consultoría ESS' },
  { id: 'fundacio',      ic: '💛', c: '#fbbf24', sector: 'tercer', fam: ['territori', 'organitzacio'],
    t: 'Fundació o finançador',   d: 'Obra social, convocatòries',
    tEs: 'Fundación o financiador', dEs: 'Obra social, convocatorias' },
  { id: 'particular',    ic: '👤', c: 'muted',  sector: 'tot', fam: ['territori'],
    t: 'A títol personal',        d: 'Professional o persona interessada',
    tEs: 'A título personal', dEs: 'Profesional o persona interesada' },

  /* ── Els del costat de l'organització ──────────────────────────────────
     L'ordre torna a ser per com de sovint truquen, i el primer de la llista
     és el que no existia: **una agència o DMC no decideix, revèn.** El
     catàleg castellers del 2026 està escrit per a elles —format, aforament,
     espai i idiomes— i el formulari d'avui no en té ni la casella, així que
     acabaven triant «cooperativa o empresa» i el diagnòstic els parlava de
     relleu i de governança. */
  { id: 'agencia',       ic: '🎪', c: 'orange', sector: 'empresa', fam: ['organitzacio'],
    t: 'Agència o DMC',           d: 'Ho compres per a un client teu',
    tEs: 'Agencia o DMC', dEs: 'Lo compras para un cliente tuyo' },
  { id: 'gran',          ic: '🏢', c: 'blue',   sector: 'empresa', fam: ['organitzacio'],
    t: 'Empresa gran',            d: 'Amb departament de formació i pressupost anual',
    tEs: 'Empresa grande', dEs: 'Con departamento de formación y presupuesto anual' },
  { id: 'pime',          ic: '🔧', c: 'green',  sector: 'empresa', fam: ['organitzacio'],
    t: 'Pime',                    d: 'La decisió la pren qui la dirigeix',
    tEs: 'Pyme', dEs: 'La decisión la toma quien la dirige' },
  { id: 'escola',        ic: '🎓', c: 'indigo', sector: 'admin', fam: ['organitzacio'],
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
  /* Les claus del diccionari hi van sempre, i ara **a tots els camps**. Fins
     el 03/10/2026 sis camps d'aquest bloc no en tenien —el web, a què us
     dediqueu, el municipi, la comarca i el de mida— i això volia dir que al
     pressupost, amb el castellà posat, «El vostre web» i «Municipi *» es
     quedaven en català. No petava res: la prova mira els elements **amb
     clau** que es queden en català, i un element sense clau no hi surt. */
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
<div class="f"><label for="web" data-i18n="fo.l.web">El vostre web</label><input type="url" id="web" name="web" data-i18n-ph="fo.ph.web" placeholder="p.ex. exemple.cat" autocomplete="url" inputmode="url"><div class="hint" data-i18n="fo.h.web">Ens estalvia preguntar-vos qui sou. Opcional.</div></div>
<div class="f"><label for="dediqueu" data-i18n="fo.l.dediqueu">A què us dediqueu</label><input type="text" id="dediqueu" name="dediqueu" data-i18n-ph="fo.ph.dediqueu" placeholder="p.ex. distribució alimentària, 3 centres" maxlength="90"></div>
</div>
<div class="grid2">
<div class="f"><label for="municipi" data-i18n="fo.l.municipi">Municipi *</label><input type="text" id="municipi" name="municipi" required data-i18n-ph="fo.ph.municipi" placeholder="p.ex. Torrelles de Foix"></div>
<div class="f"><label for="comarca" data-i18n="fo.l.comarca">Comarca</label><input type="text" id="comarca" name="comarca" data-i18n-ph="fo.ph.comarca" placeholder="p.ex. Alt Penedès"></div>
</div>
${fam === 'organitzacio'
    ? `<div class="f"><label for="persones" data-i18n="fo.l.persones">Quantes persones sou</label><input type="number" id="persones" name="persones" min="0" step="1" data-i18n-ph="fo.ph.persones" placeholder="p.ex. 45"><div class="hint" data-i18n="fo.h.persones">De tota l'organització, no només de l'equip que hi entraria.</div></div>`
    : `<div class="f"><label for="poblacio" data-i18n="fo.l.poblacio">Població aproximada a què arribeu</label><input type="number" id="poblacio" name="poblacio" min="0" step="1" data-i18n-ph="fo.ph.poblacio" placeholder="p.ex. 2400"><div class="hint" data-i18n="fo.h.poblacio">Habitants del municipi, o persones a qui arriba el vostre projecte.</div></div>`}`;
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
const { FAMILIES, SECTORS, ORDRE_SECTORS, PAQUETS, SOS_PAQUETS, NIVELLS, PER_FLUXOS } = require('./build-oferta.js');

/* Els noms porten clau. El triador es llegia **sencer en català** amb el
   castellà posat —vint-i-quatre noms de paquet i quatre capçaleres de família—
   mentre la proposta que en sortia ja sortia traduïda: triaves en una llengua
   i et responien en una altra. El castellà el declara `build-oferta.js`, i les
   claus les escriu `dicPressu()` des d'allà mateix. */
/* ── El filtre de paquets ──────────────────────────────────────────────────
   Generat i no escrit a mà, i de **la mateixa declaració** que el del catàleg.
   Escrits a mà, els tres botons d'aquí deien «Empreses i cooperatives» i
   «Administració i entitats» quan el catàleg ja parlava de tres sectors: els
   dos botons no filtraven res perquè cap paquet declarava aquells valors, i la
   pàgina seguia sent correcta a la vista. Un filtre que no coneix un valor no
   falla: amaga. */
function blocPqFiltre() {
  const bt = (id, lbl, clau, on) =>
    `<button type="button" class="pq-f${on ? ' on' : ''}" data-sec="${id}" data-i18n="${clau}">${esc(lbl)}</button>`;
  return [bt('tot', 'Tot', 'pr.filtre.tots', true)]
    .concat(ORDRE_SECTORS.map(id => bt(id, SECTORS[id].lbl, 'pr.filtre.' + id, false)))
    .join('\n');
}

function blocPaquets() {
  const cap = f => `<h4 class="pq-fam" data-i18n="pr.fam.${f.id}">${f.ic} ${esc(f.nom)}</h4>`;
  /* `data-sector` és una llista i s'escriu **separada per espais**, com a la
     portada. Interpolant l'array sense dir-ho, en sortia «admin,tercer» per la
     conversió automàtica, i el filtre —que parteix per espais— llegia un sol
     valor inexistent: el paquet no sortia a cap tria. */
  /* Sense forquilles al catàleg (09/10/2026), la calculadora tampoc en suma:
     un paquet «per fluxos» va fora del total com un de mida, i el que sí que
     suma són les hores per nivell. */
  const fluxos = p => PER_FLUXOS && !p.mida;
  const fila = p => `<label class="pq" data-sector="${p.sector.join(' ')}">` +
    `<input type="checkbox" name="paquet" value="${p.id}"` +
    (p.mida ? ' data-mida="1"' : fluxos(p) ? ' data-mida="1" data-fluxos="1"' : ` data-min="${p.preuMin}" data-max="${p.preuMax}"`) + '>' +
    `<span class="pq-n" data-i18n="pr.paq.${p.id}">${esc(p.nom)}</span>` +
    `<span class="pq-p"${p.mida ? ' data-i18n="pr.r.amida"' : fluxos(p) ? ' data-i18n="pr.r.fluxos"' : ''}>${p.mida ? 'a mida' : fluxos(p) ? 'per fluxos' : (p.preuMin === p.preuMax
      ? p.preuMin.toLocaleString('ca-ES') + ' €'
      : p.preuMin.toLocaleString('ca-ES') + '–' + p.preuMax.toLocaleString('ca-ES') + ' €')}</span>` +
    `</label>`;
  const fams = FAMILIES.map(f =>
    cap(f) + '\n<div class="pq-g">\n' + PAQUETS.filter(p => p.fam === f.id).map(fila).join('\n') + '\n</div>'
  ).join('\n');
  return fams + '\n<h4 class="pq-fam" data-i18n="pr.fam.sos">🖥️ Al voltant del SOS</h4>\n<div class="pq-g">\n' +
    SOS_PAQUETS.map(fila).join('\n') + '\n</div>';
}

/* L'escala, per calcular al navegador la part contractada per hores.

   Els noms porten el germà castellà: la **proposta** que el navegador munta
   els escriu, i si només hi anés el català la pantalla es llegiria traduïda i
   el que en surt, no. El castellà el declara `build-oferta.js`, que és qui
   declara què es ven. */
function blocEscala() {
  const q = s => String(s == null ? '' : s).replace(/'/g, "\\'");
  const niv = NIVELLS.map(n =>
    `{id:'${n.id}',nom:'${q(n.nom)}',nomEs:'${q(n.nomEs || n.nom)}',hora:${n.hora}}`).join(',');
  const noms = PAQUETS.concat(SOS_PAQUETS)
    .map(p => `'${p.id}':{nom:'${q(p.nom)}',nomEs:'${q(p.nomEs || p.nom)}'}`).join(',');
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

/* Les claus hi van: `PRESSU` ja declarava `pr.mida.*` en les dues llengües i
   **aquest marcatge no en portava cap**, o sigui que el diccionari les tenia i
   no les llegia ningú. Tres preguntes i tres pistes que es quedaven en català
   al formulari traduït. */
function blocMida() {
  return `<div class="grid2">
<div class="f" data-mida-per="${midaPer('participants')}"><label for="participants" data-i18n="pr.mida.part">Quantes persones hi participaran</label><input type="number" id="participants" name="participants" min="0" step="1" placeholder="p.ex. 60"><div class="hint" data-i18n="pr.mida.part.h">Marca la diferència més gran del pressupost.</div></div>
<div class="f" data-mida-per="${midaPer('alcada')}"><label for="alcada" data-i18n="pr.mida.alc">Alçada de la demostració</label><select id="alcada" name="alcada">
<option value="" data-i18n="pr.tria">— tria —</option>
<option value="4" data-i18n="pr.pisos.4">4 pisos</option>
<option value="5" data-i18n="pr.pisos.5">5 pisos</option>
<option value="6" data-i18n="pr.pisos.6">6 pisos</option>
</select><div class="hint" data-i18n="pr.mida.alc.h">L'alçada és quanta colla cal moure, i és el que fixa el cost.</div></div>
</div>
<div class="f" data-mida-per="${midaPer('lloc')}"><label for="lloc" data-i18n="pr.mida.lloc">On es fa i a quina distància</label><input type="text" id="lloc" name="lloc" data-i18n-ph="pr.mida.lloc.ph" placeholder="p.ex. plaça de la Vila, a 40 min de Barcelona"><div class="hint" data-i18n="pr.mida.lloc.h">El desplaçament de l'equip entra al pressupost al seu preu, sense marge a sobre.</div></div>
<p class="hint" id="midaCap" hidden data-i18n="pr.mida.cap">Aquestes preguntes surten quan demanes una activitat amb gent, data i lloc. Amb el que has triat ara, no calen.</p>`;
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

   El text de la **proposta** —el que el JavaScript munta en prémer el botó—
   també hi és des del 03/10/2026. Hi viu i no al script de la pàgina pel
   mateix motiu: hi surten els noms dels paquets i els nivells de l'escala,
   que els escriu aquest fitxer des del catàleg.

   ⚠ **El que segueix en català a posta**: el resum en text pla que viatja per
   correu. No és una pantalla: és el que arriba a la nostra banda, amb els
   mateixos separadors que els diagnòstics. */

/* ── Les claus dels blocs compartits ──────────────────────────────────────
   Van a part de `PRESSU` perquè les porten **tres** pàgines i no una: el
   pressupost i els dos diagnòstics. Abans vivien dins de `PRESSU` amb una
   nota que deia que al diagnòstic l'atribut no trobaria diccionari «i el text
   es queda escrit, que és el correcte mentre aquella pàgina sigui
   monolingüe». Ja no ho és, i per tant les claus s'han de poder escriure als
   tres llocs sense arrossegar-hi les quaranta del pressupost. */
const FORM = {
  'fo.l.nom': { ca: 'Nom i cognoms *', es: 'Nombre y apellidos *' },
  'fo.l.rol': { ca: 'El teu paper a la casa', es: 'Tu papel en la casa' },
  'fo.l.mail': { ca: 'Correu electrònic *', es: 'Correo electrónico *' },
  'fo.l.tel': { ca: 'Telèfon (opcional)', es: 'Teléfono (opcional)' },
  'fo.l.carrec': { ca: 'Com se\'n diu exactament', es: 'Cómo se llama exactamente' },
  'fo.ph.carrec': { ca: 'p.ex. tècnica de participació', es: 'p.ej. técnica de participación' },
  'fo.h.carrec': { ca: 'Opcional. Serveix per adreçar-nos-hi com toca.', es: 'Opcional. Sirve para dirigirnos como toca.' },
  'fo.l.tipus': { ca: 'Tipus d\'organització *', es: 'Tipo de organización *' },
  'fo.l.orgnom': { ca: 'Nom de l\'organització', es: 'Nombre de la organización' },
  'fo.ph.orgnom': { ca: 'deixa-ho en blanc si véns a títol personal', es: 'déjalo en blanco si vienes a título personal' },
  /* Els sis camps que no tenien clau i es quedaven en català al pressupost. */
  'fo.l.web': { ca: 'El vostre web', es: 'Vuestra web' },
  'fo.ph.web': { ca: 'p.ex. exemple.cat', es: 'p.ej. ejemplo.com' },
  'fo.h.web': { ca: 'Ens estalvia preguntar-vos qui sou. Opcional.', es: 'Nos ahorra preguntaros quiénes sois. Opcional.' },
  'fo.l.dediqueu': { ca: 'A què us dediqueu', es: 'A qué os dedicáis' },
  'fo.ph.dediqueu': { ca: 'p.ex. distribució alimentària, 3 centres', es: 'p.ej. distribución alimentaria, 3 centros' },
  'fo.l.municipi': { ca: 'Municipi *', es: 'Municipio *' },
  'fo.ph.municipi': { ca: 'p.ex. Torrelles de Foix', es: 'p.ej. Torrelles de Foix' },
  'fo.l.comarca': { ca: 'Comarca', es: 'Comarca' },
  'fo.ph.comarca': { ca: 'p.ex. Alt Penedès', es: 'p.ej. Alt Penedès' },
  'fo.l.persones': { ca: 'Quantes persones sou', es: 'Cuántas personas sois' },
  'fo.ph.persones': { ca: 'p.ex. 45', es: 'p.ej. 45' },
  'fo.h.persones': {
    ca: 'De tota l\'organització, no només de l\'equip que hi entraria.',
    es: 'De toda la organización, no solo del equipo que entraría.'
  },
  'fo.l.poblacio': { ca: 'Població aproximada a què arribeu', es: 'Población aproximada a la que llegáis' },
  'fo.ph.poblacio': { ca: 'p.ex. 2400', es: 'p.ej. 2400' },
  'fo.h.poblacio': {
    ca: 'Habitants del municipi, o persones a qui arriba el vostre projecte.',
    es: 'Habitantes del municipio, o personas a las que llega vuestro proyecto.'
  }
};

const PRESSU = {
  'pr.h1': { ca: 'Preus i contractació', es: 'Precios y contratación' },
  'pr.intro': {
    ca: 'Comença pel que et cal ara: cada pas porta al següent i cap no t\'obliga a fer el de dalt. Els preus són <strong>sense IVA</strong>. Si el que vols no hi és, a sota tens el <a href="#amida">pressupost a mida, per fluxos</a>.',
    es: 'Empieza por lo que te hace falta ahora: cada paso lleva al siguiente y ninguno te obliga a hacer el de arriba. Los precios son <strong>sin IVA</strong>. Si lo que quieres no está, debajo tienes el <a href="#amida">presupuesto a medida, por flujos</a>.'
  },
  /* LA PÀGINA DE PREUS (09/10/2026). L'Àlvaro va demanar que el pressupost
     passés a ser «pricing i comprar». Els imports viuen a `PREUS`, a la
     pàgina, i un import buit es llegeix «a confirmar»: no se n'inventa cap. */
  'pv.eye': { ca: 'Preus · sense IVA', es: 'Precios · sin IVA' },
  'pv.h': { ca: 'Quatre maneres d\'entrar, de la més lleugera al sistema sencer', es: 'Cuatro maneras de entrar, de la más ligera al sistema entero' },
  'pv.t0.n': { ca: 'Esborrany del mapa', es: 'Borrador del mapa' },
  'pv.t0.q': { ca: 'Per a qualsevol que vulgui veure on és', es: 'Para cualquiera que quiera ver dónde está' },
  'pv.t0.d': { ca: 'El mapa de valor del teu negoci, dibuixat amb el que ens expliques. És teu i te l\'endús.', es: 'El mapa de valor de tu negocio, dibujado con lo que nos cuentas. Es tuyo y te lo llevas.' },
  'pv.t0.cta': { ca: 'Comença ara', es: 'Empieza ahora' },
  'pv.t1.n': { ca: 'Sessió individual', es: 'Sesión individual' },
  'pv.t1.q': { ca: 'Autònoms, fundadors i qui dirigeix sol', es: 'Autónomos, fundadores y quien dirige solo' },
  'pv.t1.d': { ca: 'Revisem el teu mapa junts, hi marquem on s\'encalla el valor i en surt el primer pas.', es: 'Revisamos tu mapa juntos, marcamos dónde se atasca el valor y sale el primer paso.' },
  'pv.t2.n': { ca: 'Taller d\'equip', es: 'Taller de equipo' },
  'pv.t2.q': { ca: 'Equips de 4 a 12 persones', es: 'Equipos de 4 a 12 personas' },
  'pv.t2.d': { ca: 'L\'equip veu el mateix flux de valor i es posa d\'acord en on ha de fluir millor. Mapa real i ideal.', es: 'El equipo ve el mismo flujo de valor y se pone de acuerdo en dónde tiene que fluir mejor. Mapa real e ideal.' },
  'pv.t3.n': { ca: 'El teu negoci operatiu', es: 'Tu negocio operativo' },
  'pv.t3.q': { ca: 'Pimes i projectes que volen el sistema sencer', es: 'Pymes y proyectos que quieren el sistema entero' },
  'pv.t3.d': { ca: 'La sala amb l\'equip, el mapa real i l\'ideal, el cervell per rol, la web de xarxa a nom vostre i 30 dies d\'acompanyament.', es: 'La sala con el equipo, el mapa real y el ideal, el cerebro por rol, la web de red a vuestro nombre y 30 días de acompañamiento.' },
  'pv.gratis': { ca: 'Gratis', es: 'Gratis' },
  'pv.confirmar': { ca: 'Preu a confirmar', es: 'Precio a confirmar' },
  'pv.confirmar.d': { ca: 'Te\'l diem amb la confirmació, abans de pagar res.', es: 'Te lo decimos con la confirmación, antes de pagar nada.' },
  'pv.viu.n': { ca: 'Després · Sistema viu, cada mes', es: 'Después · Sistema vivo, cada mes' },
  'pv.viu.d': { ca: 'Mantenim les connexions i les millorem amb el que mesura el SOS. La quota es decideix amb els pilots.', es: 'Mantenemos las conexiones y las mejoramos con lo que mide el SOS. La cuota se decide con los pilotos.' },
  'pv.viu.cta': { ca: 'Avisa\'m', es: 'Avísame' },
  'pv.cta': { ca: 'Contracta', es: 'Contrata' },
  'pv.iva': { ca: '+ IVA', es: '+ IVA' },
  'pv.flux': {
    ca: '<strong>A mida, per fluxos.</strong> Tot el que no és aquí es pressuposta per fluxos: les hores de cada nivell (35, 55 o 80 €/h) més el cost real de la IA, que et factura el proveïdor a nom teu. <a href="#amida">Fes-te el pressupost</a> · <a href="/conecta/">el cost de la IA, tasca per tasca</a>.',
    es: '<strong>A medida, por flujos.</strong> Todo lo que no está aquí se presupuesta por flujos: las horas de cada nivel (35, 55 u 80 €/h) más el coste real de la IA, que te factura el proveedor a tu nombre. <a href="#amida">Hazte el presupuesto</a> · <a href="/conecta/">el coste de la IA, tarea por tarea</a>.'
  },
  'pv.amida.h': { ca: 'A mida, per fluxos', es: 'A medida, por flujos' },
  'pv.amida.sub': {
    ca: 'Tria els paquets i en surt una proposta esborrany amb el desglossament a la vista. Te la pots endur encara que no ens l\'enviïs.',
    es: 'Elige los paquetes y sale una propuesta borrador con el desglose a la vista. Te la puedes llevar aunque no nos la envíes.'
  },
  /* La comanda. Encara no hi ha passarela de pagament: la comanda es desa i
     es confirma per correu amb la factura. Ho diu abans del botó. */
  'pv.m.h': { ca: 'Contracta', es: 'Contrata' },
  'pv.m.sub': {
    ca: 'Deixa\'ns on enviar-te la confirmació. Encara no cobrem en línia: en un dia laborable et confirmem la data i t\'enviem la factura amb l\'enllaç de pagament.',
    es: 'Déjanos dónde enviarte la confirmación. Aún no cobramos en línea: en un día laborable te confirmamos la fecha y te enviamos la factura con el enlace de pago.'
  },
  'pv.m.quan': { ca: 'Quan us aniria bé', es: 'Cuándo os iría bien' },
  'pv.m.quan.ph': { ca: 'p.ex. les tardes de la setmana que ve', es: 'p.ej. las tardes de la semana que viene' },
  'pv.m.notes': { ca: 'Res més que hàgim de saber', es: 'Algo más que debamos saber' },
  'pv.m.acc': {
    ca: 'Entenc que la comanda es confirma per correu i es paga per transferència o enllaç de pagament abans de començar.',
    es: 'Entiendo que el pedido se confirma por correo y se paga por transferencia o enlace de pago antes de empezar.'
  },
  'pv.m.err': { ca: 'Cal el nom, un correu vàlid i acceptar com es paga.', es: 'Hace falta el nombre, un correo válido y aceptar cómo se paga.' },
  'pv.m.envia': { ca: 'Confirma la comanda', es: 'Confirma el pedido' },
  'pv.m.avisa': { ca: 'Apunta-m\'hi', es: 'Apúntame' },
  'pv.m.tanca': { ca: 'Tanca', es: 'Cierra' },
  'pv.m.ok': {
    ca: 'Comanda rebuda. En un dia laborable et confirmem la data i t\'enviem la factura.',
    es: 'Pedido recibido. En un día laborable te confirmamos la fecha y te enviamos la factura.'
  },
  'pv.m.ko': { ca: 'No s\'ha pogut enviar. Envia-la per correu:', es: 'No se ha podido enviar. Envíala por correo:' },
  'pv.m.mail': { ca: 'Obre el correu', es: 'Abre el correo' },
  'pv.m.priv': {
    ca: 'S\'envia només quan prems el botó: el que has escrit aquí, al formulari del nostre allotjament (Netlify), des d\'on passa al nostre CRM. Res més.',
    es: 'Se envía solo cuando pulsas el botón: lo que has escrito aquí, al formulario de nuestro alojamiento (Netlify), desde donde pasa a nuestro CRM. Nada más.'
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
  'pr.s3.sub': {
    ca: 'Marca\'n els que t\'interessin. Es poden combinar, i sovint el que en surt és millor que un de sol: el mateix mètode —mirar qui sosté què amb el <a href="vna.html">mapa de valor</a>, i després fer-ho passar— serveix per a un equip d\'empresa, per a un poble o per a una xarxa d\'entitats. El que canvia és la forma, no el fons.',
    es: 'Marca los que te interesen. Se pueden combinar, y a menudo lo que sale es mejor que uno solo: el mismo método —mirar quién sostiene qué con el <a href="vna.html">mapa de valor</a>, y después hacerlo circular— sirve para un equipo de empresa, para un pueblo o para una red de entidades. Lo que cambia es la forma, no el fondo.'
  },
  'pr.s3.err': { ca: 'Marca com a mínim un paquet.', es: 'Marca como mínimo un paquete.' },
  'pr.hores.sub': {
    ca: 'Opcional, i pensat per a contractació pública de serveis professionals. Escriu les hores de cada nivell i el total es calcula sol. El que separa un nivell del següent és evidència registrada, no antiguitat — la <a href="../index.html#cost">portada ho explica sencer</a>.',
    es: 'Opcional, y pensado para contratación pública de servicios profesionales. Escribe las horas de cada nivel y el total se calcula solo. Lo que separa un nivel del siguiente es evidencia registrada, no antigüedad — la <a href="../index.html#cost">portada lo explica entero</a>.'
  },
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
  /* La promesa de privacitat, sencera. El valor era només la primera frase i
     el marcatge no portava clau: la clau existia, no la llegia ningú, i el
     paràgraf que diu que d'aquí no surt res es quedava en català. */
  'pr.priv': {
    ca: '🔒 <strong>Aquest formulari no envia res sol.</strong> Tot el que has escrit viu al teu navegador i no surt d\'aquí fins que tu premis «Envia\'ns la petició». No hi ha analítica ni seguiment en aquesta pàgina.',
    es: '🔒 <strong>Este formulario no envía nada solo.</strong> Todo lo que has escrito vive en tu navegador y no sale de aquí hasta que tú pulses «Envíanos la petición». No hay analítica ni seguimiento en esta página.'
  },
  /* Les tres dels camps de mida (`blocMida`), que també els genera aquest
     fitxer i per tant es declaren aquí i no a mitja funció. */
  'pr.mida.part': { ca: 'Quantes persones hi participaran', es: 'Cuántas personas participarán' },
  'pr.mida.part.h': { ca: 'Marca la diferència més gran del pressupost.', es: 'Marca la diferencia más grande del presupuesto.' },
  'pr.mida.alc': { ca: 'Alçada de la demostració', es: 'Altura de la demostración' },
  'pr.mida.alc.h': { ca: 'L\'alçada és quanta colla cal moure, i és el que fixa el cost.', es: 'La altura es cuánta colla hay que mover, y es lo que fija el coste.' },
  'pr.mida.lloc': { ca: 'On es fa i a quina distància', es: 'Dónde se hace y a qué distancia' },
  'pr.mida.lloc.ph': {
    ca: 'p.ex. plaça de la Vila, a 40 min de Barcelona',
    es: 'p.ej. plaza de la Vila, a 40 min de Barcelona'
  },
  'pr.tria': { ca: '— tria —', es: '— elige —' },
  'pr.pisos.4': { ca: '4 pisos', es: '4 pisos' },
  'pr.pisos.5': { ca: '5 pisos', es: '5 pisos' },
  'pr.pisos.6': { ca: '6 pisos', es: '6 pisos' },
  'pr.mida.lloc.h': { ca: 'El desplaçament de l\'equip entra al pressupost al seu preu, sense marge a sobre.', es: 'El desplazamiento del equipo entra al presupuesto a su precio, sin margen encima.' },
  'pr.mida.cap': {
    ca: 'Aquestes preguntes surten quan demanes una activitat amb gent, data i lloc. Amb el que has triat ara, no calen.',
    es: 'Estas preguntas salen cuando pides una actividad con gente, fecha y lugar. Con lo que has elegido ahora, no hacen falta.'
  },
  'pr.filtre.tots': { ca: 'Tot', es: 'Todo' },
  /* Els noms dels sectors surten de `build-oferta.js` i no es tornen a escriure
     aquí: el dia que un canviï de nom, el botó del pressupost i el del catàleg
     han de dir el mateix o la persona es pensa que són dues llistes. */
  ...Object.fromEntries(ORDRE_SECTORS.map(id =>
    ['pr.filtre.' + id, { ca: SECTORS[id].lbl, es: SECTORS[id].lblEs }])),

  /* ── El text de la proposta ─────────────────────────────────────────────
     El que el navegador munta en prémer el botó. Les que porten un forat
     —`{q}`, `{n}`, `{d}`, `{p}`— el reben del càlcul: el nom de qui la demana,
     quants paquets, la data, els paquets sense xifra publicada. El forat es
     declara aquí perquè la xifra i el nom no són text a traduir. */
  'pr.r.lead': {
    ca: 'Per a {q} · {n} · generada el {d}',
    es: 'Para {q} · {n} · generada el {d}'
  },
  'pr.r.teva': { ca: 'la teva organització', es: 'tu organización' },
  'pr.r.paquet': { ca: '{n} paquet', es: '{n} paquete' },
  'pr.r.paquets': { ca: '{n} paquets', es: '{n} paquetes' },
  'pr.r.de': { ca: 'De {a} a {b}', es: 'De {a} a {b}' },
  'pr.r.sense': {
    ca: 'Sense IVA. És una forquilla orientativa: la proposta final la tanca una conversa.',
    es: 'Sin IVA. Es una horquilla orientativa: la propuesta final la cierra una conversación.'
  },
  'pr.r.fora': {
    ca: 'No hi entren {p}: es pressuposten per fluxos amb el mapa de cost i el desglossament va a la proposta.',
    es: 'No entran {p}: se presupuestan por flujos con el mapa de coste y el desglose va a la propuesta.'
  },
  'pr.r.amida': { ca: 'a mida', es: 'a medida' },
  'pr.r.fluxos': { ca: 'per fluxos', es: 'por flujos' },
  'pr.r.total.fluxos': { ca: 'Per fluxos · el desglossament va a la proposta', es: 'Por flujos · el desglose va en la propuesta' },
  /* Com s'ha calculat. És la frase que sosté el preu i per això es diu sencera
     a les dues llengües: qui la llegeix ha de poder discutir-la. */
  'pr.r.metode': {
    ca: 'Les hores surten dels fluxos del mapa de valor, cada rol es cobra al preu del seu nivell, cada flux porta el cost de la seva IA amb el model que toca a cada tasca, i les despeses directes van al seu preu de factura, sense marge a sobre. El que separa un nivell del següent és evidència registrada i verificable, no antiguitat.',
    es: 'Las horas salen de los flujos del mapa de valor, cada rol se cobra al precio de su nivel, cada flujo lleva el coste de su IA con el modelo que toca en cada tarea, y los gastos directos van a su precio de factura, sin margen encima. Lo que separa un nivel del siguiente es evidencia registrada y verificable, no antigüedad.'
  },
  /* Què falta per tancar-ho. Cap és decoració: cada una surt d'una resposta. */
  'pr.r.f.dimensionar': {
    ca: 'Dimensionar {p} amb les dades que has donat, i tornar-t\'ho desglossat.',
    es: 'Dimensionar {p} con los datos que has dado, y devolvértelo desglosado.'
  },
  'pr.r.f.conversa': {
    ca: 'Una conversa de 45 minuts per ajustar l\'abast: sovint hi sobra alguna cosa.',
    es: 'Una conversación de 45 minutos para ajustar el alcance: a menudo sobra algo.'
  },
  'pr.r.f.convocatoria': {
    ca: 'Mirar el calendari de la convocatòria: la data de justificació canvia el calendari de la feina.',
    es: 'Mirar el calendario de la convocatoria: la fecha de justificación cambia el calendario del trabajo.'
  },
  'pr.r.f.partida': {
    ca: 'Trobar la partida o la convocatòria que ho pot pagar. Sovint ja existeix i no s\'hi havia mirat.',
    es: 'Encontrar la partida o la convocatoria que lo puede pagar. A menudo ya existe y no se había mirado.'
  },
  'pr.r.f.data': { ca: 'Confirmar la data i reservar equip.', es: 'Confirmar la fecha y reservar equipo.' },
  'pr.r.f.condicions': {
    ca: 'Condicions de reserva i cancel·lació per escrit abans de signar res.',
    es: 'Condiciones de reserva y cancelación por escrito antes de firmar nada.'
  },
  /* Els botons que canvien de text en prémer-los. */
  'pr.b.copiada': { ca: '✓ Copiada', es: '✓ Copiada' },
  'pr.b.nocopia': { ca: 'No s\'ha pogut copiar', es: 'No se ha podido copiar' }
};

/* El diccionari dels blocs compartits: `FORM`, més el que surt de `ORGS` i
   `ROLS`, que els genera aquest mateix fitxer. El porten les tres pàgines que
   munten aquests blocs, i per això es genera a part. */
function dicFo(l) {
  const q = x => String(x).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const tria = (o, c) => l === 'es' ? (o[c + 'Es'] || o[c]) : o[c];
  const f = [];
  Object.entries(FORM).forEach(([k, v]) => f.push(`  '${k}':'${q(v[l])}',`));
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

/* El del pressupost: el seu propi, els noms del catàleg, i a sobre el
   compartit. Els noms surten de `build-oferta.js` i no es declaren aquí: és
   l'única font del que es ven, i tenir-los en dos llocs voldria dir que un dia
   el triador oferís un nom i la proposta en digués un altre. */
function dicPressu(l) {
  const q = x => String(x).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const tria = (o, c) => l === 'es' ? (o[c + 'Es'] || o[c]) : o[c];
  const f = Object.entries(PRESSU).map(([k, v]) => `  '${k}':'${q(v[l])}',`);
  FAMILIES.forEach(x => f.push(`  'pr.fam.${x.id}':'${q(x.ic + ' ' + tria(x, 'nom'))}',`));
  f.push(`  'pr.fam.sos':'${q('🖥️ ' + (l === 'es' ? 'Alrededor del SOS' : 'Al voltant del SOS'))}',`);
  PAQUETS.concat(SOS_PAQUETS).forEach(p => f.push(`  'pr.paq.${p.id}':'${q(tria(p, 'nom'))}',`));
  return f.join('\n') + '\n' + dicFo(l);
}

const MARQUES = [
  ['<!--FORM-QUI-->', '<!--/FORM-QUI-->', blocQui],
  ['<!--FORM-ORG-->', '<!--/FORM-ORG-->', blocOrg],
  ['/*FORM-DADES*/', '/*/FORM-DADES*/', blocDades]
];
/* Els que només té el pressupost. Es declaren a part perquè demanar-los al
   diagnòstic el faria fallar per una marca que allà no té cap sentit. */
const NOMES_PRESSU = [
  ['<!--FORM-PQFILTRE-->', '<!--/FORM-PQFILTRE-->', blocPqFiltre],
  ['<!--FORM-PAQUETS-->', '<!--/FORM-PAQUETS-->', blocPaquets],
  ['<!--FORM-MIDA-->', '<!--/FORM-MIDA-->', blocMida],
  ['/*FORM-ESCALA*/', '/*/FORM-ESCALA*/', blocEscala],
  /* Els dos diccionaris. Van aquí i no a la pàgina perquè mitja pàgina la
     genera aquest fitxer: tenir-los en dos llocs voldria dir que un dia no
     coincidissin, i el que divergiria seria una llengua sencera. */
  ['/*PRESSU-I18N-CA*/', '/*/PRESSU-I18N-CA*/', () => dicPressu('ca')],
  ['/*PRESSU-I18N-ES*/', '/*/PRESSU-I18N-ES*/', () => dicPressu('es')]
];
/* I els dos diagnòstics, que porten els mateixos blocs i per tant les mateixes
   claus. La resta del seu text és seu i el declaren ells: aquí només hi va el
   que aquest fitxer genera, que és la regla que evita el diccionari duplicat. */
const NOMES_DIAG = [
  ['/*DIAG-I18N-CA*/', '/*/DIAG-I18N-CA*/', () => dicFo('ca')],
  ['/*DIAG-I18N-ES*/', '/*/DIAG-I18N-ES*/', () => dicFo('es')]
];

let desviats = [], faltaven = [];
for (const { fitxer, fam } of PAGINES) {
  const cami = join(SOS, fitxer);
  if (!existsSync(cami)) { faltaven.push(fitxer + ' → la pàgina no existeix'); continue; }
  const src = readFileSync(cami, 'utf8');
  let out = src;
  const seves = MARQUES.concat(fitxer === 'pressupost.html' ? NOMES_PRESSU : NOMES_DIAG);
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
