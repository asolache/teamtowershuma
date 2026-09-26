#!/usr/bin/env node
/* La taxonomia d'entregables, i el fre que la fa acceptable
 * ─────────────────────────────────────────────────────────────────────────────
 * La regla de la casa, escrita a `knowledge/negoci/mapa-kanban-ia.md`:
 *
 *   Cada flux del mapa es converteix en una carta del Kanban. Si el flux és
 *   **tangible** i el seu entregable és **d'un tipus declarat**, la carta és
 *   candidata a la màquina. Si és **intangible**, va a la persona que porta el
 *   rol — i la màquina no la toca mai.
 *
 * El valor d'aquesta regla depèn sencer d'una condició: **que la segona meitat
 * sigui certa**. Si un dia algú posa l'intangible al final de les comprovacions
 * de `fluxAutomatitzable`, o hi afegeix una excepció «només per a aquest cas»,
 * el que es trenca no és una funció — és la promesa que ven la casa, i no ho
 * veurà ningú perquè el resultat seguirà semblant raonable.
 *
 * Per això la guarda no comprova que el resultat estigui bé: comprova **l'ordre
 * del codi**. L'intangible ha de sortir abans que res, i la funció ha de tornar
 * `pot:false` sense mirar res més.
 *
 * La resta és higiene de la taula: ids únics, tots els camps, i cap pista que
 * apunti a un tipus que no existeix —una pista òrfena no peta, simplement deixa
 * de classificar fluxos i ningú se n'adona.
 *
 * Ús:  node SOS/tools/check-entregables.js
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const APP = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');
let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

/* ── Llegir la taula ────────────────────────────────────────────────────── */
const bloc = (() => {
  const i = APP.indexOf('const ENTREGABLES=[');
  if (i < 0) return '';
  const j = APP.indexOf('\n];', i);
  return j < 0 ? '' : APP.slice(i, j);
})();
if (!bloc) { bad('no es troba `ENTREGABLES` a SOS/index.html'); }

const TIPUS = [...bloc.matchAll(/\{id:'([\w-]+)',nom:'((?:[^'\\]|\\.)*)',ic:'([^']*)',maquina:(true|false),/g)]
  .map(m => ({ id: m[1], nom: m[2].replace(/\\'/g, "'"), ic: m[3], maquina: m[4] === 'true' }));

// 1 · La taula hi és i té gruix. Una taxonomia d'un sol tipus no classifica res.
if (TIPUS.length < 4) bad(`només ${TIPUS.length} tipus d'entregable: massa pocs per repartir un mapa`);
else ok(`${TIPUS.length} tipus d'entregable declarats`);

// 2 · Ids únics. Dos tipus amb el mateix id fan que el segon no existeixi i no peta.
(() => {
  const vist = new Set(), rep = [];
  TIPUS.forEach(t => { if (vist.has(t.id)) rep.push(t.id); vist.add(t.id); });
  if (rep.length) bad('ids repetits: ' + rep.join(', '));
  else ok('cap id repetit');
})();

// 3 · Cap tipus a mitges. Sense `que`, `cal` i `surt` no es pot ni explicar a una
//     persona ni demanar a una màquina: és un nom i prou.
(() => {
  const coixos = [];
  TIPUS.forEach(t => {
    const i = bloc.indexOf(`{id:'${t.id}'`);
    const tros = bloc.slice(i, bloc.indexOf('\n  {', i + 1) < 0 ? bloc.length : bloc.indexOf('\n  {', i + 1));
    if (!/que:'/.test(tros) || !/cal:\[/.test(tros) || !/surt:'/.test(tros)) coixos.push(t.id);
  });
  if (coixos.length) bad('tipus sense què és, què cal o què en surt: ' + coixos.join(', '));
  else ok('tots diuen què són, què necessiten i quina forma té la sortida');
})();

/* 4 · Almenys un tipus que **no** surt d'una màquina, i amb el motiu escrit.
       Sense això la taula diria que tot és automatitzable i que els que falten
       és que encara no els hem fet. Que n'hi hagi un de declarat com a no
       automatitzable és el que fa que la resta sigui una decisió i no un
       descuit. */
(() => {
  const noMaq = TIPUS.filter(t => !t.maquina);
  if (!noMaq.length) bad('tots els tipus surten d\'una màquina: falta dir quin no, i per què');
  else {
    const sensMotiu = noMaq.filter(t => {
      const i = bloc.indexOf(`{id:'${t.id}'`);
      const tros = bloc.slice(i, i + 900);
      /* Al codi l'apòstrof va escapat (`d\'una`), així que la pista es busca
         tolerant els dos escrits. Buscar-la literal feia petar la guarda per
         una barra invertida, que és el pitjor tipus de fals positiu: el que fa
         desconfiar de la guarda en comptes del codi. */
      return !/No surt d\\?'una màquina/.test(tros);
    });
    if (sensMotiu.length) bad('tipus no automatitzables sense el motiu escrit: ' + sensMotiu.map(t => t.id).join(', '));
    else ok(`${pl(noMaq.length, 'tipus no surt', 'tipus no surten')} d'una màquina, i es diu per què`);
  }
})();

// 5 · Cap pista òrfena. Una pista cap a un tipus inexistent no peta: deixa de
//     classificar fluxos en silenci, que és pitjor.
(() => {
  const i = APP.indexOf('const ENTREGABLE_HINTS=[');
  if (i < 0) { bad('no es troba `ENTREGABLE_HINTS`'); return; }
  const cos = APP.slice(i, APP.indexOf('\n];', i));
  const apunten = [...cos.matchAll(/,'([\w-]+)'\]/g)].map(m => m[1]);
  const ids = TIPUS.map(t => t.id);
  const orfes = [...new Set(apunten.filter(x => !ids.includes(x)))];
  if (orfes.length) bad('pistes cap a tipus que no existeixen: ' + orfes.join(', '));
  else ok(`${apunten.length} pistes, totes cap a un tipus declarat`);
  // I a l'inrevés: un tipus sense cap pista no el trobarà mai cap flux sol.
  const sensePista = ids.filter(x => !apunten.includes(x));
  if (sensePista.length) bad('tipus que cap pista no pot trobar: ' + sensePista.join(', '));
  else ok('i cap tipus es queda sense manera de ser reconegut');
})();

/* 6 · LA GUARDA QUE IMPORTA · l'intangible surt primer.
       Es comprova l'ordre del codi i no el resultat, perquè el resultat es pot
       arreglar per casualitat i l'ordre no. La condició de l'intangible ha
       d'anar abans que la del tipus d'entregable: si va després, qualsevol
       excepció futura que s'afegeixi entremig el pot convertir en candidat. */
(() => {
  const i = APP.indexOf('function fluxAutomatitzable(');
  if (i < 0) { bad('no es troba `fluxAutomatitzable`'); return; }
  const cos = APP.slice(i, APP.indexOf('\n}', i));
  const pIntang = cos.indexOf('isIntangible');
  const pTipus = cos.indexOf('entregableDe');
  if (pIntang < 0) { bad('`fluxAutomatitzable` no mira si el flux és intangible: la regla de la casa no s\'aplica'); return; }
  if (pTipus >= 0 && pIntang > pTipus) {
    bad('la comprovació d\'intangible va DESPRÉS de la del tipus: una excepció entremig faria automatitzable un intangible');
    return;
  }
  if (!/isIntangible\(x\.kind\)\)return\{pot:false/.test(cos.replace(/\s+/g, '')
    .replace(/if\(isIntangible\(x\.kind\)\)return\{pot:false/, 'isIntangible(x.kind))return{pot:false'))) {
    // Comprovació tolerant a l'espaiat: el que importa és que retorni fals de seguida.
    const net = cos.replace(/\s+/g, '');
    if (!/isIntangible\(x\.kind\)\)return\{pot:false/.test(net)) {
      bad('la comprovació d\'intangible no retorna `pot:false` immediatament');
      return;
    }
  }
  ok('la regla es compleix al codi: si el flux és intangible, surt fals abans de mirar res més');
})();

/* 7 · I que ningú pugui declarar el contrari des de les dades. `entregableDe`
       accepta un tipus escrit a mà a l'intercanvi, i això és bo —el mapa el fa
       la casa—, però no pot ser una porta del darrere: passi el que passi,
       `fluxAutomatitzable` mira l'intangible abans de cridar-lo. Es comprova
       que l'ordre entre les dues funcions sigui aquest i no l'invers. */
(() => {
  const i = APP.indexOf('function fluxAutomatitzable(');
  const cos = APP.slice(i, APP.indexOf('\n}', i));
  const linies = cos.split('\n').map(l => l.trim());
  const nIntang = linies.findIndex(l => l.includes('isIntangible'));
  const nEntrega = linies.findIndex(l => l.includes('entregableDe'));
  if (nIntang >= 0 && (nEntrega < 0 || nIntang < nEntrega)) ok('i el tipus escrit a mà a l\'intercanvi no pot saltar-se-la');
  else bad('el tipus declarat a l\'intercanvi es llegeix abans de descartar l\'intangible');
})();

/* 8 · Els intents que preparen un entregable. Dos, no vuit — i el que importa
       no és quants n'hi ha: és què tenen escrit a les instruccions.

       Un model que no sap una dada l'omple amb una de versemblant si ningú li
       diu el contrari, i una xifra versemblant dins d'un informe de justificació
       no la detecta ningú fins que la detecta qui no toca. Per això es comprova
       que les instruccions ho prohibeixin explícitament i que l'esquema tingui
       on posar el que falta. */
(() => {
  const i = APP.indexOf('const INTENT_ENTREGABLE=');
  if (i < 0) { bad('no es troba `INTENT_ENTREGABLE`'); return; }
  const mapa = APP.slice(i, APP.indexOf(';', i));
  const intents = [...mapa.matchAll(/(\w+):'(\w+)'/g)].map(m => ({ tipus: m[1], intent: m[2] }));
  if (!intents.length) { bad('cap tipus té eina que el prepari'); return; }

  // El tipus ha d'existir a la taxonomia i ha de ser dels que surten d'una màquina.
  const ids = TIPUS.filter(t => t.maquina).map(t => t.id);
  const mal = intents.filter(x => !ids.includes(x.tipus));
  if (mal.length) bad('hi ha eina per a tipus que no són automatitzables: ' + mal.map(x => x.tipus).join(', '));
  else ok(`${intents.length} tipus tenen eina, i tots són dels que surten d'una màquina`);

  intents.forEach(({ intent }) => {
    const j = APP.indexOf('  ' + intent + ':{');
    if (j < 0) { bad(`l'intent \`${intent}\` no està declarat a AI_INTENTS`); return; }
    const cos = APP.slice(j, APP.indexOf('\n  },', j));
    const sys = (cos.match(/system:'((?:[^'\\]|\\.)*)'/) || [])[1] || '';
    if (!/MAI te.{0,3}la inventis|no arrodoneixis|cap m\\?és/i.test(sys))
      bad(`\`${intent}\`: les instruccions no prohibeixen inventar-se el que falta`);
    else if (!/\[a completar\]/.test(sys))
      bad(`\`${intent}\`: no diu com marcar el que falta, i llavors la prohibició no té sortida`);
    /* La prohibició es pot escriure de més d'una manera i una de les set és
       més estricta que la fórmula original («no escriguis MAI cap nom de
       persona»). La guarda accepta les dues formes i cap absència: el que
       comprova és que la prohibició hi sigui, no que estigui copiada. */
    else if (!/no escriguis( mai)?( cap)? noms? de persona|noms de persona: rols/i.test(sys))
      bad(`\`${intent}\`: no prohibeix escriure noms de persona`);
    else if (!/required:\[[^\]]*'buits'/.test(cos))
      bad(`\`${intent}\`: l'esquema no obliga a retornar els buits, i llavors marcar-los és opcional`);
    else ok(`\`${intent}\`: no pot inventar, ha de marcar els buits i no escriu noms`);
  });
})();

/* 9 · LA SEGONA GUARDA QUE IMPORTA · res no existeix fins que algú ho accepta.
       És el que fa defensable un entregable davant d'una junta, i és exactament
       el que es perdria sense adonar-se'n el dia que algú «simplifiqui» la
       pantalla desant el resultat de seguida. Es comprova que dins de
       `openPreparaEntregable` **no hi hagi cap escriptura abans del botó
       d'acceptar**. */
(() => {
  const i = APP.indexOf('function openPreparaEntregable(');
  if (i < 0) { bad('no es troba `openPreparaEntregable`'); return; }
  const cos = APP.slice(i, APP.indexOf('\n}\n', i));
  const pAccepta = cos.indexOf('Accepto aquest esborrany');
  if (pAccepta < 0) { bad('la pantalla no demana acceptar res: l\'esborrany es donaria per bo'); return; }
  const abans = cos.slice(0, pAccepta);
  const escriu = [['persist(', 'desa el node'], ['pushLedger', 'escriu al ledger'],
    ['submitEntry', 'envia un apunt'], ['recordPublication', 'publica']]
    .filter(([f]) => abans.includes(f)).map(([, q]) => q);
  if (escriu.length) bad('la pantalla ' + escriu.join(' i ') + ' ABANS que ningú accepti l\'esborrany');
  else ok('res no es desa abans que una persona accepti l\'esborrany');
  // I que el que s'accepti quedi marcat com a preparat per una màquina.
  if (!/maquina:true/.test(cos)) bad('l\'entregable acceptat no queda marcat com a preparat per una màquina');
  else if (!/per:myDid/.test(cos)) bad('no queda escrit qui l\'ha acceptat');
  else ok('i el que s\'accepta diu que l\'ha preparat una màquina i qui l\'ha acceptat');
  // El cost, abans i no després.
  if (!/max_tokens/.test(cos)) bad('no es diu què costarà la crida abans de fer-la');
  else ok('i el cost es diu abans de cridar, no després');
})();

/* 10 · Que s'hi pugui arribar. Una funció escrita i no connectada a cap botó
        és el defecte més silenciós de tots: el codi és correcte, les proves
        passen perquè la criden directament, i a la pantalla no hi ha res. Va
        passar exactament això amb `openPreparaEntregable` —escrita, provada i
        inabastable— i només es va veure quan algú va preguntar on es feia
        servir. Aquesta guarda és perquè no calgui que ho pregunti ningú. */
(() => {
  const arriba = (fn) => {
    const crides = [...APP.matchAll(new RegExp('\\b' + fn + '\\(', 'g'))].map(m => m.index);
    const def = APP.indexOf('function ' + fn + '(');
    const hook = APP.indexOf('window.__SOS=');
    // Es descarta la seva pròpia definició i el hook de proves: cap de les dues
    // és una manera que hi arribi una persona.
    /* Després de descartar la seva pròpia definició i el hook de proves, n'hi
       ha d'haver **almenys una**. La primera versió demanava més d'una i
       acusava el codi correcte: un error de comptatge en una guarda és pitjor
       que no tenir-la, perquè ensenya a desconfiar-ne. */
    return crides.filter(i => i !== def + 'function '.length && (hook < 0 || i < hook)).length >= 1;
  };
  const pantalles = ['openPreparaEntregable', 'openDesviacioMapa', 'openEntregableAcceptat', 'openTipusEntregable'];
  const soles = pantalles.filter(f => !arriba(f));
  if (soles.length) bad('pantalles escrites i sense cap botó que hi porti: ' + soles.join(', ')
    + ' — el codi és correcte, les proves passen i a la pantalla no hi ha res');
  else ok(`${pantalles.length} pantalles, totes amb un botó que hi porta`);
})();

/* 11 · LA TERCERA GUARDA QUE IMPORTA · que «acceptat» vulgui dir alguna cosa.
        La promesa escrita al PR era afegir els intents **un per un, mesurant
        quants s'accepten sense tocar**. Mentre l'esborrany no es podia tocar,
        aquell número no mesurava res: acceptar volia dir «no m'hi barallo».
        Aquesta guarda comprova les tres peces que el fan real —es pot corregir,
        es desa si s'ha corregit, i es guarda també l'original— perquè és
        exactament el tipus de cosa que una simplificació futura s'enduria
        sencera sense que el resultat semblés pitjor. */
(() => {
  const i = APP.indexOf('function openPreparaEntregable(');
  const cos = APP.slice(i, APP.indexOf('\n}\n', i));
  const falta = [];
  if (!/id="ebEdit"/.test(cos)) falta.push('no es pot corregir l\'esborrany abans d\'acceptar-lo');
  if (!/editat[:,]/.test(cos)) falta.push('no es desa si s\'ha corregit o no');
  if (!/original[:,]/.test(cos)) falta.push('no es desa el que havia escrit la màquina');
  if (falta.length) bad('«acceptat» no mesura res: ' + falta.join(' · '));
  else ok('l\'esborrany es pot corregir, i queda desat el text acceptat, l\'original i si es va tocar');

  // I que la mesura existeixi i arribi a una pantalla: un número que no es mira
  // no corregeix res, i era tot el sentit de fer-los un per un.
  /* Es busca la crida DINS de `buildFlowLedger` i es descarta la definició,
     que és el mateix parany on ja va caure la guarda 10: `function foo(` també
     conté `foo(`, i una guarda que es compta a si mateixa no comprova res.
     Aquesta hi va tornar a caure, i es va veure trencant el codi a posta. */
  const bi = APP.indexOf('function buildFlowLedger(');
  const bc = bi < 0 ? '' : APP.slice(bi, APP.indexOf('\n}\n', bi));
  if (APP.indexOf('function acceptacioEntregables(') < 0) bad('no hi ha la mesura `acceptacioEntregables`');
  else if (!/(?<!function )acceptacioEntregables\(/.test(bc))
    bad('la mesura existeix i no es pinta enlloc');
  else ok('i el percentatge d\'acceptació sense tocar es veu a la llista de fluxos');

  // L'ordre honest: només es compten els acceptats, perquè un esborrany
  // descartat no es desa —comptar-lo obligaria a escriure abans d'acceptar.
  const mi = APP.indexOf('function acceptacioEntregables(');
  if (mi > 0) {
    const mc = APP.slice(mi, APP.indexOf('\n}', mi));
    if (/persist\(|pushLedger/.test(mc)) bad('la mesura escriu: comptar no pot desar res');
    else ok('i la mesura no escriu res: només llegeix el que ja consta');
  }
})();

/* 12 · El context arriba de debò. Un intent pot declarar a les seves
        instruccions que llegirà el registre i rebre sempre una llista buida:
        no peta, no avisa, i torna un document genèric i versemblant. Va passar
        exactament això —`xifres:[]` escrit literalment a la crida mentre
        `entregable_informe` deia «les xifres són les que et donin»— i va
        sobreviure tres commits perquè el resultat seguia semblant raonable. */
(() => {
  const i = APP.indexOf('function openPreparaEntregable(');
  const cos = APP.slice(i, APP.indexOf('\n}\n', i));
  if (/xifres:\s*\[\s*\]/.test(cos)) {
    bad('la pantalla passa `xifres: []` literal: l\'intent diu que llegeix el registre i no li arriba res');
  } else if (!/contextEntregable\(/.test(cos)) {
    bad('la pantalla no construeix cap context: l\'esborrany sortirà genèric');
  } else ok('el context surt del node i del registre, no d\'una llista buida');

  const ci = APP.indexOf('function contextEntregable(');
  if (ci < 0) { bad('no es troba `contextEntregable`'); return; }
  const cc = APP.slice(ci, APP.indexOf('\n}', ci));
  /* I que les xifres viatgin etiquetades. Al SOS són estimacions amb forquilla;
     un número que arriba a un document sense l'etiqueta la perd per sempre. */
  /* No n'hi ha prou amb una menció: es comprova **cada** xifra estimada per
     separat. Una sola comprovació de «surt la paraula ESTIMACIÓ enlloc» deixa
     passar que se li tregui a dues de tres, que és com es perden aquestes
     etiquetes a la pràctica —d'una en una. */
  const estimades = ['t.hores', 't.euros', 't.objectes'];
  const sense = estimades.filter(camp => {
    const l = cc.split('\n').find(x => x.includes('xifres.push') && x.includes(camp));
    return !l || !/ESTIMACI/.test(l);
  });
  if (!/FUND_UNCERTAINTY/.test(cc)) bad('les xifres estimades viatgen sense la forquilla');
  else if (sense.length) bad('xifres estimades que no diuen que ho són: ' + sense.join(', '));
  else ok(`les ${estimades.length} xifres estimades diuen que ho són, amb la forquilla al costat`);
})();

/* 13 · LA LÍNIA COMPTABLE · una estimació no entra mai en una taula de despesa.
        La justificació de subvenció és l'entregable que més estalvia i el que
        més mal fa si falla: un import inventat no el detecta ningú fins que el
        detecta qui revisa l'expedient, i llavors no és una correcció sinó un
        reintegrament. Per això aquest intent té una regla que els altres no
        tenen, i per això té guarda pròpia: és la que una simplificació futura
        («ja que tenim les xifres, omple-la») s'enduria sencera. */
(() => {
  const j = APP.indexOf('  entregable_justificacio:{');
  if (j < 0) { ok('no hi ha intent de justificació, res a comprovar'); return; }
  const cos = APP.slice(j, APP.indexOf('\n  },', j));
  const sys = (cos.match(/system:'((?:[^'\\]|\\.)*)'/) || [])[1] || '';
  if (!/TAULA DE DESPESA NO HI CABEN MAI|taula de despesa.{0,40}no/i.test(sys))
    bad('`entregable_justificacio`: no prohibeix posar estimacions a la taula de despesa');
  else if (!/ESTIMACIONS|estimacions/.test(sys))
    bad('`entregable_justificacio`: no diu que les xifres del SOS són estimacions');
  else if (!/factur/i.test(sys))
    bad('`entregable_justificacio`: no diu amb què es contrasta una despesa');
  else ok('`entregable_justificacio`: la taula de despesa no admet cap estimació, i es diu per què');
  /* I que un import buit no passi per zero: el `coerce` l'ha de forçar a
     marcar. Es mira **la línia de l'import** i no el bloc sencer: buscant-ho a
     tot el bloc, `ctx.periode||'[a completar]'` del `build` ja el feia passar
     encara que la taula de despesa hagués quedat sense xarxa. Es va veure
     trencant la línia a posta i comprovant que la guarda seguia verda. */
  const lin = cos.split('\n').find(l => /import:\(d\.import/.test(l)) || '';
  if (!/\|\|'\[a completar\]'/.test(lin))
    bad('un import buit no es força a «[a completar]», i dins d\'una taula de despesa es llegeix com un zero');
  else ok('i un import que torni buit queda marcat, no en blanc');
})();

/* 14 · Cap sortida cap a una porta pintada. `entregableDe` llegeix
        `x.entregable` des del primer dia i durant mesos **res no l'escrivia**:
        la deducció per etiqueta funcionava, i quan no encertava la pantalla
        deia «posa-li una etiqueta que ho digui» —una cosa que no es podia fer,
        perquè l'etiqueta d'un intercanvi només s'escriu en crear-lo.

        Es va veure quan algú va preguntar «com i on ho faig?». La guarda és
        perquè no calgui que ho pregunti ningú: si un camp es llegeix per
        decidir alguna cosa, ha d'haver-hi una pantalla que l'escrigui. */
(() => {
  const llegit = /entregableDe\s*=\s*x\s*=>/.test(APP) || APP.includes('x.entregable&&entregableMeta');
  if (!llegit) { ok('`x.entregable` no es llegeix enlloc, res a comprovar'); return; }
  // Escriptures reals, descartant la lectura dins de `entregableDe`.
  const escriu = [...APP.matchAll(/\b\w+\.entregable\s*=(?!=)/g)].length
    + [...APP.matchAll(/delete\s+\w+\.entregable\b/g)].length;
  if (!escriu) bad('`x.entregable` es llegeix per decidir si un flux és automatitzable i cap pantalla l\'escriu: la sortida que la pantalla proposa no existeix');
  else ok(`\`x.entregable\` es llegeix, i ${pl(escriu, 'escriptura el fixa', 'escriptures el fixen')} des d'una pantalla`);

  // I que la classificació no visqui dins de la pantalla de l'esborrany: són
  // decisions diferents, i barrejar-les faria saltar la guarda 9 amb raó.
  const i = APP.indexOf('function openPreparaEntregable(');
  const cos = APP.slice(i, APP.indexOf('\n}\n', i));
  if (/\.entregable\s*=(?!=)/.test(cos))
    bad('la pantalla de l\'esborrany escriu la classificació: desar-hi abans d\'acceptar és el que la guarda 9 prohibeix');
  else ok('i classificar un flux viu a part d\'acceptar un esborrany');
})();

/* 15 · Que els botons hi siguin de debò. `modal(html, botons)` va néixer
        ignorant el segon argument: sis pantalles es van escriure passant-li
        una llista de botons i **cap n'ha pintat mai cap**. Tot el contingut hi
        era, ben maquetat, i no hi havia manera de prémer res.
        No peta, no avisa i es veu bé. Per això aquesta guarda mira les dues
        puntes: que `modal` pinti el que li donen, i que cada pantalla d'aquesta
        línia li doni alguna cosa. */
(() => {
  const i = APP.indexOf('function modal(');
  if (i < 0) { bad('no es troba `modal`'); return; }
  const cos = APP.slice(i, APP.indexOf('\n}', i));
  if (!/function modal\(html\s*,\s*\w+\)/.test(APP.slice(i, i + 60)))
    bad('`modal` no accepta botons, i sis pantalles n\'hi passen');
  else if (!/modal-actions/.test(cos) || !/appendChild\(acts\)/.test(cos))
    bad('`modal` accepta botons i no els pinta: la pantalla s\'obre sense res per prémer');
  else ok('`modal` pinta els botons que li donen');

  const pantalles = ['openPreparaEntregable', 'openEntregableAcceptat',
    'openTipusEntregable', 'openDesviacioMapa'];
  const mudes = pantalles.filter(fn => {
    const j = APP.indexOf('function ' + fn + '(');
    if (j < 0) return true;
    const c = APP.slice(j, APP.indexOf('\n}\n', j));
    return !/\[\s*\{\s*txt:/.test(c) && !/modal-actions/.test(c);
  });
  if (mudes.length) bad('pantalles que s\'obren sense cap botó: ' + mudes.join(', '));
  else ok(`${pantalles.length} pantalles, totes amb botons per prémer`);
})();

/* 16 · LA LÍNIA DEL MODEL QUE NO SUMA. Un model que suma una llista de la
        compra encerta gairebé sempre, i ningú repassa un total. «Gairebé
        sempre» en una comanda vol dir que una vegada algú paga el que no toca.
        Per això les sumes es fan al codi, i per això té guarda: la
        simplificació temptadora («ja que el model té les línies, que en tregui
        el total») s'enduria aquesta decisió sencera sense que res semblés
        pitjor. I les dues vedes de diners de la casa hi valen igual: això no és
        un cobrament ni demana cap targeta. */
(() => {
  const j = APP.indexOf('  entregable_comanda:{');
  if (j < 0) { ok('no hi ha intent de comanda, res a comprovar'); return; }
  const cos = APP.slice(j, APP.indexOf('\n  },', j));
  const sys = (cos.match(/system:'((?:[^'\\]|\\.)*)'/) || [])[1] || '';
  if (!/NO SUMIS RES|no sumis/i.test(sys)) bad('`entregable_comanda`: no prohibeix al model sumar');
  else if (/total/i.test(JSON.stringify((cos.match(/input_schema:\{[\s\S]*?\}\}\},/) || [''])[0])))
    bad('`entregable_comanda`: l\'esquema demana un total al model, i llavors la prohibició no serveix');
  else ok('`entregable_comanda`: el model no suma, i l\'esquema no li demana cap total');
  if (!/no.{0,30}cobrament|NO és un cobrament/i.test(sys) || !/targeta|manera de pagar/i.test(sys))
    bad('`entregable_comanda`: no diu que això no és un cobrament ni una manera de pagar');
  else ok('i diu que no és un cobrament: les vedes de diners de la casa hi valen');

  // I que l'aritmètica existeixi al codi, i no s'empassi les línies sense preu.
  const ti = APP.indexOf('function totalsComanda(');
  if (ti < 0) { bad('no hi ha `totalsComanda`: algú ha de sumar'); return; }
  const tc = APP.slice(ti, APP.indexOf('\n}', ti));
  /* Es comprova l'ORDRE i no que hi surti la paraula: la primera versió
     d'aquesta regla buscava «incompletes» al cos de la funció, i trencar la
     línia que les recull la deixava verda perquè el mot seguia sortint al
     `return`. Mirar que una paraula existeixi no comprova cap comportament.
     El que ha de ser cert és que la validesa es miri ABANS d'acumular: una
     línia sense preu no pot arribar mai al `total +=`. */
  const pVal = tc.search(/Number\.isFinite/), pSum = tc.indexOf('total+=');
  if (pVal < 0) bad('`totalsComanda` no comprova que el preu i la quantitat siguin números');
  else if (pSum >= 0 && pVal > pSum)
    bad('`totalsComanda` acumula ABANS de comprovar la línia: un preu que no és un número entraria al total');
  else if (!/return;/.test(tc.slice(pVal, pSum < 0 ? undefined : pSum)))
    bad('`totalsComanda` no descarta la línia invàlida: se l\'empassaria i el total seria una mentida arrodonida');
  else if (!/parcial:/.test(tc))
    bad('`totalsComanda` no diu que el total és parcial quan hi ha línies fora');
  else ok('i una línia sense preu es descarta abans de sumar, i el total es declara parcial');
})();

/* 17 · EL SEDÀS DE LA FITXA. És l'únic dels set entregables que llegirà un
        desconegut, i el que es publica no es pot desfer. Passa pel mateix
        `verifyNoLeak` que una publicació, i una dada d'una persona **treu el
        botó d'acceptar**: no és un avís, perquè un avís es clica amb pressa. */
(() => {
  const si = APP.indexOf('function sedasFitxa(');
  if (si < 0) { bad('no hi ha `sedasFitxa`: la fitxa es publicaria sense passar cap sedàs'); return; }
  const sc = APP.slice(si, APP.indexOf('\n}', si));
  if (!/verifyNoLeak\(/.test(sc))
    bad('`sedasFitxa` no fa servir `verifyNoLeak`: tindria un sedàs propi i divergiria del de publicar');
  else if (!/bloqueja/.test(sc))
    bad('`sedasFitxa` no distingeix el que bloqueja del que només avisa');
  else ok('`sedasFitxa` passa pel mateix sedàs que una publicació');

  const i = APP.indexOf('function openPreparaEntregable(');
  const cos = APP.slice(i, APP.indexOf('\n}\n', i));
  const pS = cos.indexOf('sedasFitxa('), pA = cos.indexOf('Accepto aquest esborrany');
  if (pS < 0) bad('la pantalla no passa la fitxa pel sedàs');
  else if (pA >= 0 && pS > pA)
    bad('el sedàs es passa DESPRÉS de pintar el botó d\'acceptar: es podria acceptar una fitxa amb dades d\'una persona');
  else if (!/if\(sd\.bloqueja\)\{[\s\S]{0,600}?return;/.test(cos))
    bad('una fuita d\'una persona no atura la pantalla: un avís es clica amb pressa');
  else ok('i una dada d\'una persona treu el botó d\'acceptar, no només avisa');
})();

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} a la taxonomia d'entregables.`
  : '\n✅ La taxonomia quadra i la màquina no pot tocar cap intangible.');
process.exit(fails ? 1 : 0);
