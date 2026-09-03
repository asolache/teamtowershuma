#!/usr/bin/env node
/* Molekulandia · les professions, generades de les taules i no escrites a mà
 * ─────────────────────────────────────────────────────────────────────────────
 * `SOS/molekulandia.html` diu una cosa que només és certa si es calcula: que
 * sumant els rols de **totes** les fonts del SOS surt el mapa del que una
 * persona pot aprendre a ser. Escrit a mà, divergiria a la primera dinàmica
 * nova i ningú se n'adonaria —una llista de professions no peta mai.
 *
 * Aquí es llegeixen les tres taules de `SOS/index.html` i se'n genera la
 * classificació. El que **no** es genera és la taxonomia: aquesta és la peça
 * intel·lectual i va declarada aquí sota, un nom per línia, perquè es pugui
 * discutir. El que la màquina fa és no deixar-ne cap fora.
 *
 * ── La troballa que va sortir de fer-ho ─────────────────────────────────────
 * Dels 116 noms de rol diferents, la gran majoria **no són professions**. Són
 * qui hi ha a l'altra banda —l'ajuntament, la clientela, el veïnat—, maneres de
 * ser-hi —sòcia, usuària, unitat de convivència— o peces del projecte mateix
 * —el punt de repartiment, el registre d'hores. Agrupar-los tots per nom hauria
 * donat una llista de sinònims amb aire de descobriment.
 *
 * Per això cada rol porta **natura** abans que família:
 *
 *   · `ofici` — una cosa que es pot aprendre a fer. Només aquests tenen professió.
 *   · `part`  — una manera de prendre-hi part. No s'aprèn: s'hi és.
 *   · `fora`  — qui hi ha a l'altra banda i no forma part del projecte.
 *   · `peça`  — una peça del projecte mateix: un lloc, una entitat, un registre.
 *
 * ── Ús ──────────────────────────────────────────────────────────────────────
 *   node SOS/tools/build-molekulandia.js            escriu el que toqui
 *   node SOS/tools/build-molekulandia.js --check    falla si està vell o incomplet
 */
const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const SOS = join(ARREL, 'SOS');
const CHECK = process.argv.includes('--check');

/* ══ LA TAXONOMIA ════════════════════════════════════════════════════════════
   Declarada, no deduïda. Un `groupBy` pel nom hauria posat «Coordinació» i
   «Coordinació pedagògica» a llocs diferents i «Pagesia» i «Pagesia local» al
   mateix sac que «Proveïdors locals». */

/* Les nou professions. L'ordre és el del camí que fa la gent: primer les que
   sostenen que existeixi res, després les que hi posen coneixement, i al final
   les que fan i reparen. */
const PROFESSIONS = [
  { id: 'impuls', nom: 'Impuls i governança', ic: '🌱',
    diu: 'Qui fa que una cosa comenci i qui la sosté quan ja no és nova. És el rol que més es crema i el que menys es reconeix.',
    demana: ['temps', 'contactes', 'ordre'],
    rols: ['Grup motor', 'Nucli promotor', 'Nucli gestor', 'Nucli operatiu', 'Equips promotors', 'Consell rector'] },
  { id: 'facilitacio', nom: 'Facilitació i coordinació', ic: '🧭',
    diu: 'Qui fa que un grup decideixi sense trencar-se, i qui recorda què s\'havia dit. No mana: fa que es pugui manar entre tots.',
    demana: ['ordre', 'cura', 'temps'],
    rols: ['Coordinació', 'Facilitador/a', 'Facilitador VNA', 'Referent territorial'] },
  { id: 'aprenentatge', nom: 'Aprenentatge i mentoria', ic: '🎓',
    diu: 'Qui ensenya el que sap i qui acompanya el que comença. La professió que multiplica totes les altres.',
    demana: ['veu', 'temps', 'cura'],
    rols: ['Formadors', 'Formadors/es', 'Mentors', 'Coordinació pedagògica'] },
  { id: 'cura', nom: 'Cura i acompanyament', ic: '💚',
    diu: 'Qui sosté la gent, no les tasques. És la feina que fa que un projecte duri i la que menys surt als comptes.',
    demana: ['cura', 'temps', 'contactes'],
    rols: ['Nucli de cura', 'Persones cuidadores', 'Monitoratge'] },
  { id: 'assessorament', nom: 'Assessorament tècnic i jurídic', ic: '⚖️',
    diu: 'Qui sap què es pot fer i com, i qui signa que es pot fer. Sense això, un projecte s\'encalla a la primera llicència.',
    demana: ['numeros', 'ordre', 'contactes'],
    rols: ['Assessoria', 'Assessoria tècnica', 'Assessoria tècnica-legal', 'Consultors/es'] },
  { id: 'dades', nom: 'Dades, eines i coneixement', ic: '🗂',
    diu: 'Qui compta el que passa i qui construeix l\'eina que ho compta. La professió més nova de totes i la que menys nom té.',
    demana: ['ordre', 'temps', 'numeros'],
    rols: ['Nucli tècnic', 'Equip producte', 'Equip de cens'] },
  { id: 'terra', nom: 'Producció i oficis de la terra', ic: '🌾',
    diu: 'Qui fa, cultiva i transforma. L\'ofici més antic del poble i el que el SOS connecta amb tota la resta.',
    demana: ['ofici', 'espai', 'temps'],
    rols: ['Pagesia', 'Pagesia local', 'Productors', 'Productors/es locals', 'Artesans/es'] },
  { id: 'circular', nom: 'Circularitat i reparació', ic: '♻️',
    diu: 'Qui allarga la vida de les coses. En un poble autosuficient no és un servei: és infraestructura.',
    demana: ['ofici', 'espai', 'temps'],
    rols: ['Servei de reparació', 'Recicladors'] },
  { id: 'relat', nom: 'Cultura i relat', ic: '🎭',
    diu: 'Qui explica el poble al poble. Sense això, tot el que hi passa és cert i no ho sap ningú.',
    demana: ['veu', 'contactes', 'ofici'],
    rols: ['Artistes', 'Guies locals'] }
];

/* La resta de rols, amb la seva natura. No són professions i dir que ho són
   seria la manera més fàcil d'inflar el número. */
const PART = [
  'Aprenents', 'Comunitat', 'Comunitat contributora', 'Comunitat de l\'atles',
  'Comunitat de pràctica', 'Comunitat del barri', 'Comunitat destinatària',
  'Comunitat i formació', 'Comunitat local', 'Comunitat veïnal', 'Consumidors',
  'Famílies', 'Gent gran', 'Grup de consum', 'Jovent', 'Nouvinguts', 'Participants',
  'Persones cuidades', 'Persones en cerca de feina', 'Persones oferents',
  'Persones sòcies', 'Persones usuàries', 'Sòcies consumidores', 'Sòcies demandants',
  'Sòcies oferents', 'Sòcies treballadores', 'Unitats de convivència',
  'Unitats familiars', 'Usuaris/es', 'Veïnat', 'Voluntariat'
];
const FORA = [
  'Actors del territori', 'Administració', 'Administració (cessió de sòl)', 'Ajuntament',
  'Ajuntament / finançament', 'Allotjaments', 'Associació de comerciants', 'Ateneu Cooperatiu',
  'CAP / serveis socials', 'Clientes', 'Clients', 'Clients institucionals', 'Clients privats',
  'Comerç col·laborador', 'Comerços', 'Comerços de proximitat', 'Cooperativa energètica',
  'Cooperatives madrines', 'Custòdia / entitat', 'Donants', 'Ecosistema aliat', 'Empreses locals',
  'Entitat amfitriona', 'Entitats', 'Entitats culturals', 'Entitats d\'acollida',
  'Entitats del territori', 'Entitats formatives', 'Escoles', 'Esplai / entitats',
  'Finançament', 'Finançament ètic', 'Grups ciclistes', 'Instal·ladora', 'Patrocini i inversió',
  'Propietaris', 'Proveïdor/a', 'Proveïdors locals', 'Restauració', 'Servei d\'ocupació',
  'Serveis socials/CAP', 'Transport públic', 'Xarxa d\'entitats', 'Xarxa de partners'
];
const PECA = [
  'Cooperativa', 'Espai formatiu', 'Font oberta / IA', 'Infraestructura', 'Obrador',
  'Punt de repartiment', 'Punt de venda', 'Registre d\'hores'
];

/* ══ EL POBLE ════════════════════════════════════════════════════════════════
   Cada dinàmica del catàleg és un edifici que a qualsevol poble ja existeix.
   Aquesta és la traducció, i és el que fa que la pregunta «i això què és?»
   tingui resposta: el bar és el banc de temps.

   `x` i `y` són la posició a la plaça, en tant per cent del quadre. La plaça és
   al mig i l'arcada la volta. */
const EDIFICIS = [
  { din: 'banc_temps', nom: 'El bar', ic: '🍺', x: 16, y: 20,
    es: 'On es paga amb el temps de cadascú i tothom sap qui deu una ronda.' },
  { din: 'biblioteca_coses', nom: 'La ferreteria', ic: '🔧', x: 38, y: 14,
    es: 'On es va a buscar el trepant que fas servir dos cops l\'any.' },
  { din: 'consum_agroecologic', nom: 'El mercat', ic: '🥬', x: 62, y: 14,
    es: 'On el que menges té nom de qui ho ha fet i el preu el pacten tots dos.' },
  { din: 'comunitat_energetica', nom: 'La central', ic: '⚡', x: 84, y: 20,
    es: 'La teulada del poble, que és de qui hi viu i no de qui la ven.' },
  { din: 'habitatge_cessio', nom: 'Les cases', ic: '🏘️', x: 88, y: 46,
    es: 'On es viu sense comprar ni llogar: la casa és de totes i l\'ús és teu.' },
  { din: 'coop_treball', nom: 'El taller', ic: '🛠️', x: 82, y: 72,
    es: 'On es treballa sense amo i el que es reparteix és el que s\'ha aportat.' },
  { din: 'suport_mutu', nom: 'El casal', ic: '🤝', x: 60, y: 82,
    es: 'On es porta la cura del carrer, que és la feina que no fa ningú i la fa tothom.' },
  { din: 'compra_collectiva', nom: 'El magatzem', ic: '🛒', x: 38, y: 82,
    es: 'On es compra junt el que sol comprar-se car i sol.' },
  { din: 'cens_entitats', nom: 'L\'arxiu', ic: '🗂️', x: 16, y: 72,
    es: 'On consta qui hi ha al poble, què fa i com se\'l troba.' },
  { din: 'matriu', nom: 'El viver', ic: '🌱', x: 10, y: 46,
    es: 'On una idea passa a projecte, i on es diu quan encara no ho és.' },
  { din: 'mapeig_vna', nom: 'La sala de plànols', ic: '🕸️', x: 50, y: 56,
    es: 'Al mig de la plaça: el mapa de qui dona què a qui. És el pas que va abans de tots.' }
];
/* La dinàmica genèrica no és cap edifici: és la plantilla en blanc per a un
   projecte que encara no té forma. Declarada, perquè una absència sense motiu
   escrit és un descuit. */
const SENSE_EDIFICI = { generic: 'És la plantilla en blanc, no un tipus de projecte: no hi ha cap edifici que sigui «una xarxa qualsevol».' };

/* Les eines que hi ha de debò darrere de cada edifici, avui. Prometre una porta
   que no s'obre és el pitjor que podria fer aquesta pàgina. */
const EINES = {
  banc_temps: ['index.html', 'A dins de l\'app'],
  biblioteca_coses: ['index.html', 'A dins de l\'app'],
  matriu: ['matriu.html', 'La MATRIU'],
  mapeig_vna: ['vna.html', 'Mapa de valor'],
  comunitat_energetica: ['energia.html', 'L\'Energia'],
  habitatge_cessio: ['habitatge.html', 'L\'Habitatge'],
  consum_agroecologic: ['compra.html', 'La Compra'],
  compra_collectiva: ['compra.html', 'La Compra'],
  cens_entitats: ['online.html', 'El directori']
};

/* ══ LLEGIR LES TAULES ═══════════════════════════════════════════════════════ */
const APP = readFileSync(join(SOS, 'index.html'), 'utf8');

function taula(nom) {
  const i = APP.indexOf('const ' + nom + '=[');
  if (i < 0) return [];
  const j = APP.indexOf('\n];', i);
  const cos = APP.slice(i, j < 0 ? APP.length : j);
  const caps = [];
  const re = /\{id:'((?:[^'\\]|\\.)*)',name:'((?:[^'\\]|\\.)*)'(?:,icon:'([^']*)')?/g;
  let m;
  while ((m = re.exec(cos))) caps.push({ id: net(m[1]), nom: net(m[2]), ic: m[3] || '', at: m.index });
  return caps.map((e, k) => {
    const tros = cos.slice(e.at, k + 1 < caps.length ? caps[k + 1].at : cos.length);
    const r = tros.match(/roles:\[([\s\S]*?)\]/);
    const one = tros.match(/one:'((?:[^'\\]|\\.)*)'/);
    return { id: e.id, nom: e.nom, ic: e.ic, one: one ? net(one[1]) : '',
      rols: r ? [...r[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(x => net(x[1])) : [] };
  });
}
function net(s) { return s.replace(/\\'/g, '\''); }

const FONTS = [
  { id: 'dinamiques', taula: 'DYNAMICS', lbl: 'Tipus de projecte', diu: 'Les dinàmiques del catàleg: el que es pot muntar.' },
  { id: 'activitats', taula: 'CRITICAL_ACTIVITIES', lbl: 'Activitats crítiques del territori', diu: 'El que qualsevol poble necessita tenir resolt.' },
  { id: 'prototips', taula: 'PROTOTYPE_MAPS', lbl: 'Formes de projecte', diu: 'Les formes genèriques que pren un projecte nou.' }
];

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

const dades = FONTS.map(f => Object.assign({}, f, { plantilles: taula(f.taula) }));
const plantilles = dades.flatMap(f => f.plantilles.map(p => Object.assign({ font: f.id }, p)));
const caselles = plantilles.reduce((a, p) => a + p.rols.length, 0);

/* ── Classificar cada rol ─────────────────────────────────────────────────── */
const DE_PROFESSIO = {};
PROFESSIONS.forEach(p => p.rols.forEach(r => { DE_PROFESSIO[r] = p.id; }));
const NATURA = {};
Object.keys(DE_PROFESSIO).forEach(r => { NATURA[r] = 'ofici'; });
PART.forEach(r => { NATURA[r] = 'part'; });
FORA.forEach(r => { NATURA[r] = 'fora'; });
PECA.forEach(r => { NATURA[r] = 'peça'; });

const unics = [...new Set(plantilles.flatMap(p => p.rols))].sort((a, b) => a.localeCompare(b, 'ca'));
const onSurt = {};
plantilles.forEach(p => p.rols.forEach(r => { (onSurt[r] = onSurt[r] || []).push(p.id); }));

const rols = unics.map(r => ({ nom: r, natura: NATURA[r] || null,
  professio: DE_PROFESSIO[r] || null, on: onSurt[r], cops: onSurt[r].length }));

const compta = n => rols.filter(r => r.natura === n).length;
const RESUM = { caselles, unics: unics.length, professions: PROFESSIONS.length,
  ofici: compta('ofici'), part: compta('part'), fora: compta('fora'), peca: compta('peça') };

/* ══ COMPROVACIONS QUE NO DEPENEN DEL FITXER GENERAT ═════════════════════════
   Aquestes valen tant si es genera com si es comprova: un rol nou al catàleg
   ha de forçar una decisió, no colar-se com a «altres». */
if (CHECK) console.log('\nGuarda de Molekulandia · les professions surten de les taules');

const orfes = rols.filter(r => !r.natura);
if (!orfes.length) ok(`els ${unics.length} noms de rol del catàleg estan classificats`);
else bad(`${pl(orfes.length, 'rol no té natura declarada', 'rols no tenen natura declarada')} a build-molekulandia.js: ` +
  orfes.slice(0, 6).map(r => `«${r.nom}»`).join(', ') + (orfes.length > 6 ? '…' : '') +
  ' — un rol nou ha de forçar una decisió, no colar-se com a «altres»');

const fantasmes = Object.keys(NATURA).filter(r => !unics.includes(r));
if (!fantasmes.length) ok('i cap classificació apunta a un rol que ja no existeix');
else bad(`${pl(fantasmes.length, 'rol classificat ja no és', 'rols classificats ja no són')} a cap taula: ` +
  fantasmes.map(r => `«${r}»`).join(', '));

const buides = PROFESSIONS.filter(p => !p.rols.filter(r => unics.includes(r)).length);
if (!buides.length) ok(`les ${PROFESSIONS.length} professions tenen rols de debò al darrere`);
else bad(`${pl(buides.length, 'professió es queda', 'professions es queden')} sense cap rol viu: ` +
  buides.map(p => p.nom).join(', '));

const APORTS = [...(readFileSync(join(SOS, 'vna.html'), 'utf8')
  .match(/const APORTS=\[[\s\S]*?\n\];/) || [''])[0].matchAll(/\{id:'([a-z]+)'/g)].map(m => m[1]);
const demanaMal = PROFESSIONS.filter(p => p.demana.some(d => !APORTS.includes(d)));
if (APORTS.length && !demanaMal.length) ok(`i el que demanen surt del vocabulari del perfil (${APORTS.length} capacitats)`);
else bad('alguna professió demana una capacitat que no és a APORTS: ' +
  (demanaMal.map(p => p.nom).join(', ') || 'no s\'ha pogut llegir APORTS de vna.html'));

const dinamiques = dades.find(f => f.id === 'dinamiques').plantilles;
const senseCasa = dinamiques.filter(d => !EDIFICIS.some(e => e.din === d.id) && !SENSE_EDIFICI[d.id]);
const casaFantasma = EDIFICIS.filter(e => !dinamiques.some(d => d.id === e.din));
if (!senseCasa.length && !casaFantasma.length)
  ok(`i les ${dinamiques.length} dinàmiques del catàleg tenen edifici o motiu escrit per no tenir-ne`);
else bad((senseCasa.length ? `sense edifici ni motiu: ${senseCasa.map(d => d.id).join(', ')}. ` : '') +
  (casaFantasma.length ? `edificis d'una dinàmica que no existeix: ${casaFantasma.map(e => e.din).join(', ')}` : ''));

/* ══ EL QUE ES GENERA ════════════════════════════════════════════════════════ */
const j = o => JSON.stringify(o);
const bloc = () => {
  const edificis = EDIFICIS.map(e => {
    const d = dinamiques.find(x => x.id === e.din);
    return { din: e.din, nom: e.nom, ic: e.ic, x: e.x, y: e.y, es: e.es,
      dinNom: d.nom, dinIc: d.ic, one: d.one, rols: d.rols,
      eina: EINES[e.din] || null };
  });
  return '<!--MOLEK-DADES-->\n<script id="molek-dades" type="application/json">\n' +
    j({ resum: RESUM,
      fonts: dades.map(f => ({ id: f.id, lbl: f.lbl, diu: f.diu,
        plantilles: f.plantilles.length, rols: f.plantilles.reduce((a, p) => a + p.rols.length, 0) })),
      professions: PROFESSIONS.map(p => Object.assign({}, p, {
        rols: p.rols.map(r => ({ nom: r, cops: (onSurt[r] || []).length, on: onSurt[r] || [] })) })),
      rols, edificis, senseEdifici: SENSE_EDIFICI,
      plantilles: plantilles.map(p => ({ id: p.id, nom: p.nom, ic: p.ic, font: p.font, rols: p.rols.length })) }) +
    '\n</script>\n<!--/MOLEK-DADES-->';
};

const md = () => {
  const L = [];
  L.push('# Les professions de Molekulandia');
  L.push('');
  L.push('> Generat per `SOS/tools/build-molekulandia.js` des de les taules de');
  L.push('> `SOS/index.html`. **No l\'editis a mà**: torna a córrer l\'eina.');
  L.push('');
  L.push(`Sumant les tres fonts del SOS hi ha **${RESUM.caselles} caselles de rol** amb`);
  L.push(`**${RESUM.unics} noms diferents**. La majoria no són professions: són qui hi ha a`);
  L.push('l\'altra banda, maneres de prendre-hi part o peces del projecte mateix.');
  L.push('');
  L.push('| Natura | Noms | Què vol dir |');
  L.push('|---|---|---|');
  L.push(`| **ofici** | ${RESUM.ofici} | Una cosa que es pot aprendre a fer. Només aquests tenen professió. |`);
  L.push(`| **part** | ${RESUM.part} | Una manera de prendre-hi part. No s'aprèn: s'hi és. |`);
  L.push(`| **fora** | ${RESUM.fora} | Qui hi ha a l'altra banda i no forma part del projecte. |`);
  L.push(`| **peça** | ${RESUM.peca} | Una peça del projecte: un lloc, una entitat, un registre. |`);
  L.push('');
  L.push(`Els ${RESUM.ofici} oficis es tanquen en **${RESUM.professions} professions**.`);
  L.push('');
  L.push('| Font | Plantilles | Caselles de rol |');
  L.push('|---|---|---|');
  dades.forEach(f => L.push(`| ${f.lbl} | ${f.plantilles.length} | ${f.plantilles.reduce((a, p) => a + p.rols.length, 0)} |`));
  L.push(`| **Total** | **${plantilles.length}** | **${RESUM.caselles}** |`);
  L.push('');
  PROFESSIONS.forEach(p => {
    const vius = p.rols.filter(r => unics.includes(r));
    L.push(`## ${p.ic} ${p.nom}`);
    L.push('');
    L.push(p.diu);
    L.push('');
    L.push(`**Demana**: ${p.demana.join(', ')}.`);
    L.push('');
    L.push('| Rol | Cops | On surt |');
    L.push('|---|---|---|');
    vius.forEach(r => L.push(`| ${r} | ${(onSurt[r] || []).length} | ${(onSurt[r] || []).join(', ')} |`));
    L.push('');
  });
  L.push('## El que no és professió');
  L.push('');
  ['part', 'fora', 'peça'].forEach(n => {
    const q = rols.filter(r => r.natura === n).map(r => r.nom);
    L.push(`**${n}** (${q.length}): ${q.join(' · ')}`);
    L.push('');
  });
  return L.join('\n');
};

/* ── Escriure o comprovar ─────────────────────────────────────────────────── */
const OBRE = '<!--MOLEK-DADES-->', TANCA = '<!--/MOLEK-DADES-->';
const fitxaPag = join(SOS, 'molekulandia.html');
const fitxaMd = join(SOS, 'knowledge', 'professions.md');

function posa(html) {
  const nou = bloc();
  const i = html.indexOf(OBRE), k = html.indexOf(TANCA);
  if (i >= 0 && k > i) return html.slice(0, i) + nou + html.slice(k + TANCA.length);
  return null;
}

let pagina = null;
try { pagina = readFileSync(fitxaPag, 'utf8'); } catch (e) { /* encara no existeix */ }

if (CHECK) {
  if (pagina == null) bad('SOS/molekulandia.html no existeix i la guarda no pot comprovar res');
  else {
    const vol = posa(pagina);
    if (vol == null) bad(`a molekulandia.html hi falten les marques ${OBRE} … ${TANCA}`);
    else if (vol === pagina) ok('el bloc de dades de la pàgina correspon a les taules d\'avui');
    else bad('el bloc de dades de la pàgina s\'ha quedat enrere. Arregla-ho amb:  node SOS/tools/build-molekulandia.js');
  }
  let vell = null;
  try { vell = readFileSync(fitxaMd, 'utf8'); } catch (e) { /* no hi és */ }
  if (vell === md()) ok('i knowledge/professions.md diu el mateix');
  else bad('knowledge/professions.md no correspon a les taules. Arregla-ho amb:  node SOS/tools/build-molekulandia.js');

  console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} a Molekulandia.`
    : `\n✅ ${RESUM.caselles} caselles, ${RESUM.unics} noms, ${RESUM.ofici} oficis i ${RESUM.professions} professions — tot quadrat.`);
  process.exit(fails ? 1 : 0);
}

if (fails) {
  console.log(`\n❌ ${pl(fails, 'problema', 'problemes')}: no es genera res fins que la taxonomia estigui completa.`);
  process.exit(1);
}
writeFileSync(fitxaMd, md());
if (pagina != null) {
  const nou = posa(pagina);
  if (nou == null) { console.log(`✗ a molekulandia.html hi falten les marques ${OBRE} … ${TANCA}`); process.exit(1); }
  if (nou !== pagina) writeFileSync(fitxaPag, nou);
  console.log(`✅ Molekulandia · ${RESUM.caselles} caselles de rol, ${RESUM.unics} noms, ` +
    `${RESUM.ofici} oficis en ${RESUM.professions} professions, ${EDIFICIS.length} edificis`);
} else {
  console.log(`✅ knowledge/professions.md escrit · ${RESUM.unics} noms, ${RESUM.ofici} oficis, ` +
    `${RESUM.professions} professions. (molekulandia.html encara no existeix)`);
}
