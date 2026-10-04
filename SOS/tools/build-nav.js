#!/usr/bin/env node
/* L'arquitectura de menús · declarada un cop, escrita a totes les pàgines
 * ─────────────────────────────────────────────────────────────────────────
 * Sis pàgines del SOS tenien sis menús diferents. `comando.html` en portava
 * nou enllaços, `compra.html` sis, `vna.html` cinc, `crm.html` tres — i cap
 * dels sis coincidia amb cap altre. No hi havia arquitectura: hi havia sis
 * decisions preses en sis moments, cadascuna raonable per si sola.
 *
 * Això no peta mai, i és exactament el problema. Ningú pot **aprendre** on són
 * les coses si es mouen a cada pantalla: cada pàgina torna a ser la primera, i
 * el que a una app comercial és memòria muscular, aquí és tornar a llegir.
 *
 * La sortida és la de sempre en aquest repositori: **es declara un cop i es
 * genera.** L'arquitectura viu aquí a sota, el generador l'escriu a totes les
 * pàgines entre marques, i `--check` peta al CI si alguna se n'ha desviat.
 *
 * Dues decisions d'implementació que no són òbvies:
 *
 * · **Sense JavaScript.** Els desplegables són `<details>`/`<summary>`, que ja
 *   és un component de disclosure accessible i amb teclat. Injectar un script
 *   a catorze fitxers autocontinguts seria catorze còpies d'una cosa que el
 *   navegador ja fa —i el dia que calgués tocar-la, catorze llocs.
 * · **Les excepcions es declaren.** `index.html` té la seva pròpia barra
 *   d'aplicació i `joc.html` és una pantalla de joc a pantalla completa: posar
 *   -los-hi el menú seria pitjor. Però una excepció no dita és un descuit, i
 *   per això surten a `EXCEPCIONS` amb el motiu escrit.
 *
 * Ús:  node SOS/tools/build-nav.js [--check]
 */
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const SOS = join(ARREL, 'SOS');
const CHECK = process.argv.includes('--check');

/* ══ L'ARQUITECTURA ══════════════════════════════════════════════════════
   Quatre grups i una acció. Quatre i no set: un menú amb set grups es torna a
   llegir cada vegada, que és el que això ve a arreglar. L'ordre no és
   alfabètic — és el camí que fa la gent: primer saber on ets, després les
   eines, després aprendre'n, i al final la xarxa. */
/* ══ L'ARQUITECTURA ══════════════════════════════════════════════════════
   Quatre grups i una acció. Quatre i no set: un menú amb set grups es torna a
   llegir cada vegada, que és el que això ve a arreglar. L'ordre no és
   alfabètic — és el camí que fa la gent: primer saber on ets, després les
   eines, després aprendre'n, i al final la xarxa.

   ── I EN DUES LLENGÜES (02/10/2026) ──────────────────────────────────────
   El menú es declarava **només en català** i s'escrivia a vint-i-quatre
   pàgines i al desplegable de la portada. La portada té dos diccionaris amb
   paritat vigilada, i aquest bloc hi anava **a dins**: qui triava castellà
   llegia el hero en castellà i el menú sencer en català, i no petava res.

   Cada etiqueta porta ara les dues, i és el mateix patró que `build-oferta.js`:
   el marcatge duu `data-i18n` i el generador escriu les claus **als dos
   diccionaris** de la portada. A les pàgines del SOS, que són monolingües, s'hi
   escriu el català i prou.

   El format de cada enllaç és `[fitxer, títol, descripció]`, on el títol i la
   descripció són `{ca, es}` o una cadena quan no hi ha res a traduir (un nom
   propi com «Molekulandia» o «Blog»). */
const T = (ca, es) => ({ ca, es });
const GRUPS = [
  { id: 'comenca', lbl: T('Comença', 'Empieza'), ic: '🧭', links: [
    /* Un sol enllaç al menú i no tres: al menú hi va la porta, i la porta ja
       pregunta si ets una organització o un territori. Posar-hi els dos
       diagnòstics obligaria a triar abans de saber què els distingeix. */
    ['diagnostic.html', T('Diagnòstic', 'Diagnóstico'),
      T('On ets i què et falta, en 3 minuts', 'Dónde estás y qué te falta, en 3 minutos')],
    ['pressupost.html', T('Demana pressupost', 'Pide presupuesto'),
      T('Tria què vols i en surt la proposta', 'Elige qué quieres y sale la propuesta')],
    ['intro.html', T('La intro', 'La intro'),
      T('De què va tot això', 'De qué va todo esto')],
    ['uneix-te.html', T('Uneix-t\'hi', 'Únete'),
      T('El que ja fas al barri, comptat', 'Lo que ya haces en el barrio, contado')]
  ] },
  { id: 'eines', lbl: T('Eines', 'Herramientas'), ic: '🛠', links: [
    ['vna.html', T('Mapa de valor', 'Mapa de valor'),
      T('Rols i intercanvis d\'un projecte', 'Roles e intercambios de un proyecto')],
    /* L'eina i la pàgina que l'explica són dues coses i van juntes: `/vna` diu
       què és un mapa de valor i `vna-suport` el fa. Separades al menú, qui
       acaba de llegir el mètode no troba on aplicar-lo. */
    ['vna-suport.html', T('Fer un mapa de valor', 'Hacer un mapa de valor'),
      T('Les sis passes, i deu regles que el revisen', 'Los seis pasos, y diez reglas que lo revisan')],
    ['matriu.html', T('La MATRIU', 'La MATRIU'),
      T('La incubadora: etapes, portes i propietat', 'La incubadora: etapas, puertas y propiedad')],
    ['compra.html', T('La Compra', 'La Compra'),
      T('Grup de consum i compra col·lectiva', 'Grupo de consumo y compra colectiva')],
    ['energia.html', T('L\'Energia', 'La Energía'),
      T('Comunitat energètica i autoconsum compartit', 'Comunidad energética y autoconsumo compartido')],
    ['habitatge.html', T('L\'Habitatge', 'La Vivienda'),
      T('Cessió d\'ús: quota, entrada i sortida', 'Cesión de uso: cuota, entrada y salida')],
    ['banc-temps.html', T('El Banc de Temps', 'El Banco de Tiempo'),
      T('Una hora val una hora, i el saldo que ho diu', 'Una hora vale una hora, y el saldo que lo dice')],
    ['biblioteca.html', T('La Biblioteca de les Coses', 'La Biblioteca de las Cosas'),
      T('Donar o deixar, i què val cada préstec', 'Dar o dejar, y qué vale cada préstamo')],
    ['molekulandia.html', 'Molekulandia',
      T('El poble sencer i les nou professions', 'El pueblo entero y las nueve profesiones')],
    ['joc.html', T('El joc', 'El juego'),
      T('La plaça, a ritme', 'La plaza, a ritmo')]
  ] },
  { id: 'apren', lbl: T('Aprèn', 'Aprende'), ic: '🎓', links: [
    ['formacio.html', T('Formació', 'Formación'),
      T('16 mòduls, de N0 a N3', '16 módulos, de N0 a N3')],
    ['ia.html', T('Fluxos amb IA', 'Flujos con IA'),
      T('Automatitzar el tangible, valorar l\'intangible', 'Automatizar lo tangible, valorar lo intangible')],
    ['escola.html', T('Escoles', 'Escuelas'),
      T('El SOS a mida d\'aula', 'El SOS a medida de aula')],
    ['vedes.html', T('Les vedes', 'Las vedas'),
      T('Les regles, amb el motiu al costat', 'Las reglas, con el motivo al lado')],
    ['blog.html', 'Blog',
      T('Cada capacitat, explicada', 'Cada capacidad, explicada')]
  ] },
  /* ══ EL GRUP DE L'ARREL ══════════════════════════════════════════════
     `arrel: true` vol dir que aquests destins **no viuen a `/SOS/`** sinó a la
     raíz del lloc. Fins avui el menú només sabia nomenar pàgines del SOS, i el
     resultat és que **cap de les pàgines de l'arrel es podia trobar des de cap
     lloc**: ni des de la portada, ni des del README, ni des del menú. Pàgines
     senceres i publicades a les quals només hi arribava qui en sabia l'adreça.

     La resta de l'arrel segueix fora, i ara **amb el motiu escrit**
     (`FORA_DEL_MENU_ARREL`): una pàgina publicada i no enllaçada ha de ser una
     decisió, no un oblit. */
  /* ⚠ `curs_vna.html` —«El laboratori de VNA»— se'n va el 03/10/2026. Era una
     **segona pàgina sobre el mateix mètode**: la seva pròpia ruta
     d'aprenentatge, els seus conceptes i enllaços a dues aplicacions de la
     generació retirada. Dues pàgines sobre el mateix és el pecat que
     `_redirects` ja documenta d'aquella generació —*un lloc que diu dues
     coses no en diu cap*— i la pàgina del mètode és `/vna`, que és al grup
     d'eines i ara el porta sencer. L'adreça té un 301 cap allà. */
  { id: 'casa', lbl: T('La casa', 'La casa'), ic: '🏛', arrel: true, links: [
    /* ⚠ Les dues pàgines noves de l'endreça (04/10/2026). Eren seccions de la
       portada —el catàleg sencer i les tres de «qui hi ha darrere»— i ara són
       pàgines. Si no entressin aquí, serien exactament el que aquest registre
       existeix per impedir: pàgines publicades a les quals només hi arriba qui
       en sap l'adreça. */
    ['cataleg.html', T('El catàleg', 'El catálogo'),
      T('Paquets tancats, amb el preu escrit', 'Paquetes cerrados, con el precio escrito')],
    ['qui-som.html', T('Qui som', 'Quiénes somos'),
      T('Vint anys, els clients i d\'on ve el mètode', 'Veinte años, los clientes y de dónde viene el método')],
    ['premsa.html', T('Premsa', 'Prensa'),
      T('El que se n\'ha dit a fora', 'Lo que se ha dicho fuera')]
  ] },
  { id: 'xarxa', lbl: T('Xarxa', 'Red'), ic: '🏘', links: [
    ['comando.html', T('El Comando', 'El Comando'),
      T('La pel·lícula que farem 150.000', 'La película que haremos 150.000')],
    ['molekulon.html', 'Molekulon',
      T('Molekulandia, un estat líquid', 'Molekulandia, un estado líquido')],
    ['online.html', T('Directori', 'Directorio'),
      T('Qui hi ha, per territori', 'Quién hay, por territorio')]
  ] }
];
/* Llegir una etiqueta en una llengua. Una cadena simple val per a totes dues:
   és el cas dels noms propis, que no es tradueixen. */
const txt = (v, l) => (typeof v === 'string' ? v : v[l]);

/* ══ LA MARCA I L'ACCIÓ ══════════════════════════════════════════════════
   Absolutes a posta. Fins avui la barra del SOS deia `../index.html` i el
   desplegable de la portada `/SOS/x.html`: **dos modes de ruta** per a la
   mateixa llista, i per això eren dos blocs de codi. Amb rutes absolutes el
   mateix marcatge val a l'arrel i a `/SOS/`, i la barra pot ser una. */
const CTA = ['/SOS/', T('Obre el SOS', 'Abre el SOS')];
const MARCA = ['/', 'Team', 'Towers', 'Humà'];

/* Les pàgines que porten el menú. La llista és explícita a posta: afegir una
   pàgina al SOS ha de ser una decisió que inclogui dir on va al menú. */
const PAGINES = ['banc-temps.html', 'biblioteca.html', 'blog.html', 'comando.html', 'compra.html', 'crm.html', 'diagnostic.html',
  'diagnostic-org.html', 'diagnostic-territori.html',
  'energia.html', 'escola.html', 'formacio.html', 'habitatge.html', 'ia.html', 'intro.html',
  'matriu.html', 'molekulandia.html', 'molekulon.html', 'online.html', 'pressupost.html',
  'uneix-te.html', 'vedes.html', 'vna.html', 'vna-suport.html'];

/* I les que no, amb el motiu. Una excepció sense motiu escrit és un descuit
   que d'aquí a sis mesos ningú sabrà si era volgut. */
const EXCEPCIONS = {
  'index.html': 'És l\'aplicació i té la seva pròpia barra, amb cerca, accions i sessió.',
  'joc.html': 'És una pantalla de joc completa; un menú a sobre en trencaria el ritme.'
};

/* I les que porten el menú però **no surten a cap grup**, que és una altra
   cosa. Una pàgina publicada i no enllaçada des d'enlloc és un dels errors que
   la guia de marca documenta, així que si n'hi ha una ha de ser a posta i amb
   el motiu escrit. */
const FORA_DEL_MENU = {
  'crm.html': 'És el CRM privat: hi ha contactes i converses de gent real, i no és una pàgina per passejar-hi. Qui l\'ha de fer servir hi va per l\'adreça.',
  /* Les dues branques del diagnòstic no són pàgines soltes: hi arriba tothom
     per `diagnostic.html`, que és la que pregunta quina et toca. Posar-les al
     menú obligaria a triar abans de llegir què les distingeix —i qui triés
     malament acabaria dient el nombre d'habitants del seu municipi per
     demanar un taller d'equip. */
  'diagnostic-org.html': 'Branca del diagnòstic. S\'hi entra per la tria de `diagnostic.html`, que és qui explica quina et toca.',
  'diagnostic-territori.html': 'Branca del diagnòstic. S\'hi entra per la tria de `diagnostic.html`, que és qui explica quina et toca.'
};

/* ══ L'ARREL, I EL QUE NO SURT AL MENÚ ═══════════════════════════════════
   A l'arrel del lloc hi ha vint-i-cinc fitxers HTML publicats i, fins avui,
   **vint-i-quatre no s'enllaçaven des de cap lloc**: ni des de la portada, ni
   des del README, ni des del menú. S'hi arribava sabent-ne l'adreça.

   Això no petava perquè no hi havia cap registre que ho comptés: el SOS tenia
   `FORA_DEL_MENU` des del dia que es va fer el menú, i l'arrel no en tenia cap.
   Ara en té, i la regla és la mateixa: **una pàgina publicada i no enllaçada ha
   de ser una decisió amb el motiu escrit, no un oblit.**

   ⚠ La majoria d'aquestes pàgines són **una generació anterior del lloc**
   —consultoria de RRHH, «Sistema Integral», tokenomics— i estan publicades,
   indexables i signades «TeamTowers Humà» parlant de món corporatiu, que és
   justament el que la guia de marca separa. Decidir què se'n fa (actualitzar-les,
   posar-los `noindex` o retirar-les) **no és una decisió de codi** i per això
   aquí només queda anotat, amb el motiu de cada una. */
const FORA_DEL_MENU_ARREL = {
  'index.html': 'És la portada: té la seva pròpia barra i el desplegable sencer.',
  'home-nova.html': 'Esborrany de redisseny de portada, amb `noindex`. El genera `build-vitrina.js`.',
  /* ── Eines internes ─────────────────────────────────────────────────── */
  'finances.html': 'Eina interna de comptes. No és una pàgina per passejar-hi.',
  'ia.html': 'Prova d\'assistent. La pàgina pública dels fluxos amb IA és `/SOS/ia.html`.'
};

/* ⚠ **La generació anterior se n'ha anat (01/10/2026).** Aquí hi havia catorze
   motius escrits per a catorze pàgines publicades i indexables —consultoria de
   RRHH, «Sistema Integral», tokenomics, dues apps de VNA— que no s'enllaçaven
   des de cap lloc i deien una altra cosa sobre el mateix que diu la portada.

   Un registre d'orfes no és una solució: és una llista d'un problema, i
   escriure-hi el motiu només el feia visible. Les pàgines s'han retirat i cada
   adreça té la seva redirecció 301 a `_redirects`, cap a **on viu ara allò** i
   no a la portada per defecte. L'historial de git les guarda senceres.

   El registre es queda, i és el que impedeix que això torni a passar. */


/* ══ QUINA EINA SERVEIX QUINA DINÀMICA ═══════════════════════════════════
   Set de les dotze dinàmiques del catàleg tenen una pàgina que fa la seva
   feina, i dues es fan dins de l'aplicació mateixa. Fins ara això només ho
   sabia Molekulandia, per pintar la porta de cada edifici; ara ho necessita
   també l'app —des d'un projecte de comunitat energètica s'ha de poder obrir
   L'Energia— i per això es declara aquí, on ja viu el mapa de pàgines.

   Dues còpies d'aquesta taula divergirien el dia que una dinàmica estrenés
   eina, i no petaria res: senzillament, un dels dos llocs no l'oferiria. */
const EINES = {
  banc_temps: ['banc-temps.html', 'El Banc de Temps'],
  biblioteca_coses: ['biblioteca.html', 'La Biblioteca de les Coses'],
  suport_mutu: ['index.html', 'A dins de l\'app'],
  matriu: ['matriu.html', 'La MATRIU'],
  mapeig_vna: ['vna.html', 'Mapa de valor'],
  comunitat_energetica: ['energia.html', 'L\'Energia'],
  habitatge_cessio: ['habitatge.html', 'L\'Habitatge'],
  consum_agroecologic: ['compra.html', 'La Compra'],
  compra_collectiva: ['compra.html', 'La Compra'],
  cens_entitats: ['online.html', 'El directori']
};

/* ══ UNA SOLA BARRA, VINT-I-SET PÀGINES (04/10/2026) ════════════════════════
   Hi havia **tres** barres dient la mateixa cosa de tres maneres:

   · `index.html`, `cataleg.html`, `qui-som.html` · un `<nav>` **escrit a mà als
     tres fitxers** amb cinc enllaços plans, i **cap guarda**. Era la tercera
     còpia de la llista de destins, i la única que no vigilava res.
   · Les mateixes tres · `<!--TT-PAGINES-->`, el desplegable de tots els destins.
   · Les 24 de `SOS/` · `<!--SOS-NAV-->`, cinc grups i una altra acció.

   Això no peta mai i és exactament el problema, el mateix que el 30/09/2026 va
   fer unificar els sis menús del SOS: **ningú pot aprendre on són les coses si
   es mouen a cada pantalla.** Qui llegia el mapa de valor a `/SOS/vna.html` i
   tornava a la portada trobava una barra diferent, amb destins diferents, amb
   una mecànica diferent.

   Ara n'hi ha una, i guanya la de l'arrel perquè és la cara pública: porta la
   marca i el selector de llengua. Tres coses que el canvi arrossega, i cap és
   decorativa:

   · **Només tokens de la pell.** La barra d'arrel feia servir `var(--white)`,
     `var(--accent-indigo)` i `var(--bg-panel)`, que són **àlies declarats
     només a les tres pàgines d'arrel**. Escrits a una pàgina del SOS no peten:
     deixen el text sense color. Hi ha guarda.
   · **Sense JavaScript.** La barra d'arrel obria el menú de mòbil amb un
     `#navBurger` i cinquanta línies de script. Amb `<details>` natiu —que ja és
     un disclosure accessible i amb teclat— no cal, i una barra autocontinguda a
     27 fitxers no pot portar un script repetit 27 vegades.
   · **`sticky`, no `fixed`.** Una barra fixa obliga cada pàgina a compensar-la
     amb un buit a dalt (`.hero{padding:7rem …}`), i aquell número s'ha de
     recordar a cada pàgina nova. Sticky ocupa el seu lloc i no s'ha de
     compensar enlloc. */
const OBRE = '<!--TT-NAV-->', TANCA = '<!--/TT-NAV-->';
/* Les marques velles, per reconèixer-les el primer cop. Les tres barres es
   substitueixen per una, i el nom `SOS-NAV` ja no diu la veritat: no és la
   barra del SOS, és la del lloc. */
const VELLES = [['<!--SOS-NAV-->', '<!--/SOS-NAV-->'], ['<!--TT-PAGINES-->', '<!--/TT-PAGINES-->']];
/* L'aplicació no porta la barra —això segueix sent cert i és a EXCEPCIONS—,
   però sí que ha de portar **la mateixa llista de destins**. L'excepció era
   sobre la barra, no sobre el contingut: fins ara, de dins de l'app no hi havia
   manera d'arribar a cap de les eines de fora. Ni una. */
const APP = 'index.html';
const A_OBRE = '<!--SOS-EINES-->', A_TANCA = '<!--/SOS-EINES-->';
/* Les tres pàgines d'arrel. Eren una —la portada— fins que l'endreça en va fer
   tres: amb una sola declarada aquí, `cataleg.html` i `qui-som.html` haurien
   nascut sense cap manera d'anar enlloc, i la guarda hauria passat en verd
   perquè mirava la portada.

   Des del 04/10/2026 porten **la barra sencera** i no un desplegable a part:
   tenir-ne una de pròpia era dir dues vegades el mateix amb dos dissenys, i la
   seva no la vigilava ningú. */
const PORTADES = ['index.html', 'cataleg.html', 'qui-som.html'];

/* ══ LES CLAUS DEL DICCIONARI ════════════════════════════════════════════
   La clau surt del nom del fitxer, que és l'únic identificador que un destí ja
   té: `banc-temps.html` → `nv.t.banc-temps`. Inventar-ne un altre voldria dir
   mantenir-ne dos i que un dia no coincidissin.

   El SOS i l'arrel poden tenir un fitxer amb el mateix nom —`ia.html` existeix
   als dos llocs— i per això els de l'arrel porten prefix. Sense ell, les dues
   entrades compartirien clau i la segona guanyaria en silenci. */
const clauDe = (g, h) => (g.arrel ? 'arrel-' : '') + h.replace(/\.html$/, '');

/* El bloc del diccionari d'una llengua, per enganxar entre les marques de la
   portada. Mateix patró que `build-oferta.js`: es declara un cop aquí i
   s'escriu a les dues llengües, i `--check` peta si s'han desviat. */
function diccionari(l) {
  const f = [];
  GRUPS.forEach(g => {
    f.push(`  'nv.g.${g.id}':'${esc2(g.ic + ' ' + txt(g.lbl, l))}',`);
    g.links.forEach(([h, t, d]) => {
      const id = clauDe(g, h);
      f.push(`  'nv.t.${id}':'${esc2(txt(t, l))}',`);
      f.push(`  'nv.d.${id}':'${esc2(txt(d, l))}',`);
    });
  });
  /* Les tres que no surten de `GRUPS`: el resum del desplegable i l'entrada de
     l'aplicació, que es declara al marcatge perquè no és una pàgina del menú. */
  /* L'única que no surt de `GRUPS`: l'acció. Les quatre d'abans
     —`nv.totes`, `nv.g.eina`, `nv.t.sos`, `nv.d.sos`— eren del desplegable
     «Totes les pàgines», que la barra única substitueix. Deixar-les seria
     exactament el que `check-landing.js` compta: claus que no tradueixen res i
     fan creure que aquell text està cobert. */
  const fix = { 'nv.cta': { ca: txt(CTA[1], 'ca'), es: txt(CTA[1], 'es') } };
  Object.entries(fix).forEach(([k, v]) => f.push(`  '${k}':'${esc2(v[l])}',`));
  return f.join('\n');
}
const esc2 = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

/* ══ El marcatge ═════════════════════════════════════════════════════════ */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* L'adreça absoluta d'una pàgina. `index.html` existeix als dos llocs i per
   tant el nom del fitxer sol no identifica res: comparar-los donava la portada
   i l'aplicació per la mateixa pàgina. */
const hrefDe = (h, arrel) => (arrel ? '/' + h : '/SOS/' + h);
const ARREL_PAGS = ['index.html', 'cataleg.html', 'qui-som.html', 'premsa.html'];

/* El selector de llengua surt **només on hi ha diccionari**. A les vint
   pàgines monolingües seria un botó que no fa res, que és pitjor que no
   tenir-lo: ensenya que el lloc té dues llengües i que aquella pàgina no.

   Les classes són les dels quatre formularis del SOS (`.lang-b` / `.on`) i no
   les de la portada (`.lang-btn` / `.active`): hi havia dues implementacions
   del mateix commutador i la dels formularis ja la llegeix el seu JS. Una
   sola, i la portada s'hi adapta. */
const AMB_LLENGUA = ['index.html', 'cataleg.html', 'qui-som.html',
  'diagnostic.html', 'diagnostic-org.html', 'diagnostic-territori.html', 'pressupost.html',
  /* `/vna` és bilingüe des del 03/10/2026 —264 claus— i la barra no ho era: qui
     la posava en castellà llegia el menú sencer en català, i la pàgina seguia
     sent correcta a la vista. Era l'última costura que es veia mirant. */
  'vna.html'];

function nav(pagina) {
  const arrel = ARREL_PAGS.indexOf(pagina) >= 0;
  const jo = hrefDe(pagina, arrel);
  const aqui = (h, gArrel) => hrefDe(h, gArrel) === jo;
  const grup = g => {
    const dins = g.links.some(l => aqui(l[0], g.arrel));
    /* El marcatge duu la clau **a totes** les pàgines del SOS i el text escrit
       en català. A les que no tenen diccionari no passa res: una clau sense
       entrada deixa el text tal com és, que és el correcte. A les que sí que
       en tenen —els quatre formularis— la barra canvia amb la pàgina.

       Abans la barra es quedava en català sobre un formulari traduït de dalt a
       baix, i era l'última costura que es veia mirant. */
    return `<details class="tn-g${dins ? ' tn-here' : ''}"><summary data-i18n="nv.g.${g.id}">${g.ic} ${esc(txt(g.lbl, 'ca'))}</summary>` +
      `<div class="tn-p">` + g.links.map(([h, t, d]) => {
        const id = clauDe(g, h);
        return `<a href="${hrefDe(h, g.arrel)}"${aqui(h, g.arrel) ? ' aria-current="page"' : ''}>`
          + `<b data-i18n="nv.t.${id}">${esc(txt(t, 'ca'))}</b>`
          + `<span data-i18n="nv.d.${id}">${esc(txt(d, 'ca'))}</span></a>`;
      }).join('') + `</div></details>`;
  };
  const llengua = AMB_LLENGUA.indexOf(pagina) < 0 ? '' :
    `  <div class="tn-lang">` +
    `<button type="button" class="lang-b on" data-lang="ca">CA</button>` +
    `<button type="button" class="lang-b" data-lang="es">ES</button></div>\n`;
  /* El CSS va DINS de les marques. A fora, el bloc de substitució el tornava a
     afegir a cada passada i el fitxer creixia amb una còpia més: el generador
     petava contra la seva pròpia sortida. */
  return OBRE + '\n' + CSS + '\n' +
    `<nav class="tt-nav" aria-label="Navegació del lloc">\n` +
    `  <a class="tn-brand" href="${MARCA[0]}">${esc(MARCA[1])}<span>${esc(MARCA[2])}</span> ${esc(MARCA[3])}</a>\n` +
    `  <div class="tn-gs">${GRUPS.map(grup).join('')}</div>\n` +
    llengua +
    `  <a class="tn-cta" href="${CTA[0]}"${jo === CTA[0] ? ' aria-current="page"' : ''}>`
    + `<span data-i18n="nv.cta">${esc(txt(CTA[1], 'ca'))}</span> →</a>\n` +
    `</nav>\n` + TANCA;
}

/* El CSS va amb el menú i dins de les marques: si visqués al `<style>` de cada
   pàgina, tornaríem a tenir catorze còpies que divergeixen. */
/* ── LA BARRA, BLANCA (03/10/2026) ────────────────────────────────────────
   Era fosca —`rgba(11,11,18,.96)` amb el text a #c7c7d1— perquè totes les
   pàgines ho eren. Ara el lloc públic és de paper i una barra negra a sobre
   seria l'única cosa fosca de la pantalla.

   **Res de color escrit a mà**: tot ve de la pell (`build-pell.js`), que és
   qui declara la paleta un sol cop per a les vint-i-quatre pàgines. Els
   colors literals que hi havia aquí —#f5f5f7, #c7c7d1, #141420, #6366f1—
   són exactament els que feien impossible canviar la pell sense tocar
   fitxer per fitxer.

   I les mides pugen al terra del lloc: anaven a .85rem, .73rem i .8rem, que
   renderitzades són 13,6, 11,7 i 12,8 px. `--t0` són 15. */
const CSS = `<style>
/* GENERAT per SOS/tools/build-nav.js · no s'edita a mà, i cap pàgina en declara
   una còpia: hi ha guarda. Només tokens de la pell (build-pell.js), perquè els
   àlies de les pàgines d'arrel —--white, --accent-indigo, --bg-panel— no
   existeixen a les 24 del SOS i allà no peten: deixen el text sense color. */
.tt-nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;gap:.55rem;flex-wrap:wrap;
  padding:.7rem 1.1rem;background:color-mix(in srgb,var(--bg) 94%,transparent);backdrop-filter:blur(12px);
  border-bottom:1px solid var(--border);font-size:var(--t0);
  font-family:'Space Grotesk',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif}
.tt-nav .tn-brand{font-weight:700;font-size:var(--t1);letter-spacing:-.02em;color:var(--text);
  text-decoration:none;margin-right:.5rem;white-space:nowrap}
.tt-nav .tn-brand span{color:var(--indigo)}
.tt-nav .tn-gs{display:flex;gap:.15rem;flex-wrap:wrap;align-items:center}
.tt-nav .tn-g{position:relative}
.tt-nav .tn-g>summary{list-style:none;cursor:pointer;padding:.36rem .62rem;border-radius:8px;
  color:var(--light);white-space:nowrap;border:1px solid transparent}
.tt-nav .tn-g>summary::-webkit-details-marker{display:none}
.tt-nav .tn-g>summary::after{content:' ▾';font-size:.78em;opacity:.65}
.tt-nav .tn-g>summary:hover{color:var(--text);background:var(--panel)}
.tt-nav .tn-g>summary:focus-visible{outline:2px solid var(--indigo);outline-offset:2px}
.tt-nav .tn-g[open]>summary{background:var(--panel);color:var(--text);border-color:var(--border)}
.tt-nav .tn-here>summary{color:var(--text);font-weight:600;box-shadow:inset 0 -2px 0 var(--indigo)}
.tt-nav .tn-p{position:absolute;top:calc(100% + .35rem);left:0;min-width:272px;z-index:110;
  background:var(--card);border:1px solid var(--border);border-radius:12px;padding:.35rem;
  box-shadow:0 14px 40px rgba(21,19,15,.14);display:flex;flex-direction:column;gap:.1rem}
.tt-nav .tn-p a{display:block;padding:.44rem .58rem;border-radius:8px;text-decoration:none;color:var(--light)}
.tt-nav .tn-p a:hover{background:var(--panel);color:var(--text)}
.tt-nav .tn-p a[aria-current]{background:var(--panel);color:var(--text);box-shadow:inset 2px 0 0 var(--indigo)}
.tt-nav .tn-p b{display:block;font-size:var(--t0);font-weight:600;color:var(--text)}
.tt-nav .tn-p span{display:block;font-size:var(--t0);color:var(--muted);line-height:1.4}
.tt-nav .tn-lang{display:flex;align-items:center;gap:2px;margin-left:auto;
  background:var(--panel);border:1px solid var(--border);border-radius:7px;padding:2px}
.tt-nav .tn-lang .lang-b{background:transparent;border:none;color:var(--muted);cursor:pointer;
  font:inherit;font-size:var(--t0);padding:.16rem .5rem;border-radius:5px}
.tt-nav .tn-lang .lang-b.on{background:var(--indigo);color:var(--on-accent);font-weight:700}
.tt-nav .tn-lang .lang-b:not(.on):hover{color:var(--text)}
/* Sense commutador de llengua, l'acció és qui empeny cap a la dreta. */
.tt-nav .tn-lang~.tn-cta{margin-left:.55rem}
.tt-nav .tn-cta{margin-left:auto;background:var(--indigo);color:var(--on-accent);font-weight:600;
  text-decoration:none;padding:.42rem .9rem;border-radius:9px;white-space:nowrap}
.tt-nav .tn-cta:hover{filter:brightness(1.12)}
@media(max-width:860px){
  .tt-nav{padding:.42rem .6rem;gap:.25rem}
  /* La marca baixa al terra —no per sota— perquè la marca, el commutador i
     l'acció càpiguen en **una** fila de 390 px. Amb la marca a --t1 la fila es
     partia i la barra passava de dues files a tres. */
  .tt-nav .tn-brand{font-size:var(--t0);margin-right:.2rem}
  /* ── PER QUÈ UNA FILA QUE EMBOLCALLA, I NO UNA COLUMNA ──────────────────
     El primer intent posava els cinc grups **en columna** a mòbil, oberts
     sempre. La barra passava a fer dos-cents píxels d'alçada i a 390 px treia
     el dibuix i el botó del hero de la primera pantalla: test-portada.mjs va
     dir «acaba a 1033 de 844». Una barra no pot costar un quart de pantalla.

     En fila que embolcalla fa dues línies i prou, i el panell va **absolut i
     d'amplada sencera** sota la barra: obrir-ne un no mou res del que hi ha
     a sota, que és el que una columna sí que feia. */
  /* Una sola fila que llisca, i no dues o tres que embolcallen: cinc
     etiquetes de 15 px no caben en 390 px i embolcallant feien 177 px de
     barra —tres files—, que és el mateix defecte amb un altre nombre. */
  .tt-nav .tn-gs{width:100%;order:4;flex-wrap:nowrap;gap:.15rem;overflow-x:auto;
    scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .tt-nav .tn-gs::-webkit-scrollbar{display:none}
  .tt-nav .tn-g{position:static}
  .tt-nav .tn-g>summary{padding:.3rem .5rem}
  .tt-nav .tn-here>summary{box-shadow:inset 0 -2px 0 var(--indigo)}
  .tt-nav .tn-p{position:absolute;left:.5rem;right:.5rem;min-width:0;
    top:calc(100% + .2rem);max-height:70vh;overflow-y:auto}
  .tt-nav .tn-lang{margin-left:auto;order:2}
  .tt-nav .tn-cta{margin-left:.4rem;order:3;padding:.34rem .65rem}
}
</style>`;

/* ══ Aplicar ═════════════════════════════════════════════════════════════ */
/* `build-vedes.js` genera `vedes.html` sencer des del codex, o sigui que
   escriuria per sobre del menú i les dues guardes es contradirien: la del menú
   diria que hi és i la dels vedes que la pàgina no correspon al codex. Per això
   el menú s'exporta i el generador dels vedes l'aplica ell mateix — una sola
   declaració, dos que la fan servir. */
module.exports = { posa, nav, PAGINES, EXCEPCIONS, FORA_DEL_MENU, GRUPS, CTA, EINES };
if (require.main !== module) return;

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };

/* Un menú nou substitueix el que hi havia. Els `<nav class="top">` i els menús
   de capçalera antics es treuen: deixar-los seria tenir-ne dos. */
function posa(html, pagina) {
  const bloc = nav(pagina);
  /* Les marques d'avui, i les velles el primer cop. `TT-PAGINES` era el
     desplegable que vivia **dins** del `<nav>` escrit a mà de les pàgines
     d'arrel: substituir-lo sol deixaria la barra vella al voltant i en
     tindríem dues. Per això, quan es troba, s'enduu el `<nav>` que l'envolta. */
  for (const [a, b] of [[OBRE, TANCA], ...VELLES]) {
    const i = html.indexOf(a), j = html.indexOf(b);
    if (i < 0 || j <= i) continue;
    let de = i, a_ = j + b.length;
    if (a === '<!--TT-PAGINES-->') {
      const n0 = html.lastIndexOf('<nav', de);
      const n1 = html.indexOf('</nav>', a_);
      if (n0 < 0 || n1 < 0) return null;
      de = n0; a_ = n1 + '</nav>'.length;
      /* I el comentari `<!-- NAV -->` que la precedia, si hi és: deixar-lo
         seria un retol apuntant a una cosa que ja no hi és. */
      const c = html.lastIndexOf('<!-- NAV -->', de);
      if (c >= 0 && de - c < 20) de = c;
    }
    return html.slice(0, de) + bloc + html.slice(a_);
  }
  /* Primer cop sense cap marca: s'insereix just després de `<body>`. */
  const bo = html.search(/<body[^>]*>/);
  if (bo < 0) return null;
  const fi = html.indexOf('>', bo) + 1;
  return html.slice(0, fi) + '\n' + bloc + '\n' + html.slice(fi);
}

/* ══ El bloc de dades de l'aplicació ═════════════════════════════════════
   L'app no pinta aquest menú: el llegeix. Per això no és marcatge sinó dades
   —els mateixos grups i els mateixos destins—, i l'app decideix com
   ensenyar-los amb la seva barra. Així el dia que s'afegeixi una pàgina, surt
   als setze llocs i a dins de l'app, i no cal recordar-se'n. */
function blocApp() {
  const dades = {
    /* Només els grups del SOS. Aquesta llista és **les eines de l'aplicació**,
       i les pàgines de l'arrel —els clients, els esdeveniments, el laboratori—
       no ho són: oferir-les aquí seria vendre marketing com a eina i deixaria
       qui hi clica fora de l'app sense avisar. A la barra de les pàgines del
       SOS i al desplegable de la portada sí que hi van, perquè allà la feina
       de la llista és dir **on és tot**. */
    grups: GRUPS.filter(g => !g.arrel).map(g => ({ lbl: g.lbl, ic: g.ic,
      links: g.links.filter(l => l[0] !== APP).map(([h, t, d]) => ({ h, t, d })) }))
      .filter(g => g.links.length),
    eines: EINES
  };
  return A_OBRE + '\n<script id="sos-eines" type="application/json">\n' +
    JSON.stringify(dades) + '\n</script>\n' + A_TANCA;
}
/* Les claus del menú als dos diccionaris d'una pàgina d'arrel. El marcatge sol
   no tradueix res: una clau a l'HTML sense entrada al diccionari deixa el text
   escrit a mà, que és justament el que passava amb el menú sencer. */
function posaDicArrel(html) {
  let out = html;
  for (const [M, l] of [['CA', 'ca'], ['ES', 'es']]) {
    const a = `/*TT-NAV-I18N-${M}*/`, b = `/*/TT-NAV-I18N-${M}*/`;
    const x = out.indexOf(a), y = out.indexOf(b);
    if (x < 0 || y <= x) return null;
    out = out.slice(0, x + a.length) + '\n' + diccionari(l) + '\n' + out.slice(y);
  }
  return out;
}
function posaApp(html) {
  const i = html.indexOf(A_OBRE), j = html.indexOf(A_TANCA);
  if (i < 0 || j <= i) return null;
  return html.slice(0, i) + blocApp() + html.slice(j + A_TANCA.length);
}

/* ══ LA GUARDA DE L'ARREL ════════════════════════════════════════════════
   Tota pàgina de l'arrel o surt al menú o té el motiu escrit. I al revés: un
   motiu escrit per a una pàgina que ja no existeix és un registre que menteix,
   i el dia que calgui decidir alguna cosa es decidirà amb una llista vella. */
{
  const { readdirSync } = require('node:fs');
  const arrel = readdirSync(ARREL).filter(f => /\.html$/.test(f)).sort();
  const alMenu = GRUPS.filter(g => g.arrel).flatMap(g => g.links.map(l => l[0]));
  const orfes = arrel.filter(f => !alMenu.includes(f) && !FORA_DEL_MENU_ARREL[f]);
  const fantasmes = Object.keys(FORA_DEL_MENU_ARREL).filter(f => !arrel.includes(f));
  if (orfes.length) bad(`${orfes.length} pàgines de l'arrel sense menú ni motiu: ${orfes.join(', ')}`
    + ' — publicades i no enllaçades des de cap lloc, que és un dels errors que la guia de marca documenta');
  else ok(`les ${arrel.length} pàgines de l'arrel: ${alMenu.length} al menú i `
    + `${Object.keys(FORA_DEL_MENU_ARREL).length} fora amb el motiu escrit`);
  if (fantasmes.length) bad(`motius escrits per a pàgines que no existeixen: ${fantasmes.join(', ')}`);
  /* I que els destins del menú existeixin de debò. Un enllaç a una pàgina que
     no hi és no peta: dona un 404 a qui el clica. */
  const morts = alMenu.filter(f => !existsSync(join(ARREL, f)));
  if (morts.length) bad(`destins del menú a l'arrel que no existeixen: ${morts.join(', ')}`);
}

if (CHECK) console.log('\nGuarda del menú · una sola arquitectura a totes les pàgines');
let tocades = 0;

/* Les pàgines del SOS que **sí que tenen diccionari**: els quatre formularis.
   Allà, a més del menú, s'hi escriuen les claus del menú als dos diccionaris;
   a la resta el marcatge porta la clau i el text en català, i no passa res.
   La llista és explícita perquè una pàgina amb marques i sense diccionari seria
   un error de muntatge, i val més que ho digui aquí que no pas que es trobi
   mirant. */
const AMB_DICCIONARI = ['diagnostic.html', 'diagnostic-org.html',
  'diagnostic-territori.html', 'pressupost.html', 'vna.html'];

/* Les claus del menú als dos diccionaris d'una pàgina del SOS. Mateixa feina
   que `posaPortada`, amb unes marques que són d'aquestes pàgines. */
function posaDicSos(html, p) {
  if (AMB_DICCIONARI.indexOf(p) < 0) return html;
  let out = html;
  for (const [M, l] of [['CA', 'ca'], ['ES', 'es']]) {
    const a = `/*NAV-I18N-${M}*/`, b = `/*/NAV-I18N-${M}*/`;
    const x = out.indexOf(a), y = out.indexOf(b);
    if (x < 0 || y <= x) { bad(`${p} hauria de portar les marques ${a} … ${b}`); return out; }
    out = out.slice(0, x + a.length) + '\n' + diccionari(l) + '\n' + out.slice(y);
  }
  return out;
}

PAGINES.forEach(p => {
  const f = join(SOS, p);
  if (!existsSync(f)) { bad(`${p} és a la llista del menú i no existeix`); return; }
  const html = readFileSync(f, 'utf8');
  let nou = posa(html, p);
  if (nou !== null) nou = posaDicSos(nou, p);
  if (nou === null) { bad(`${p} no té <body>: no s'hi pot posar el menú`); return; }
  if (CHECK) {
    if (nou === html) return;
    bad(`${p} no porta el menú declarat, o l'ha canviat pel seu compte`);
  } else if (nou !== html) { writeFileSync(f, nou); tocades++; }
});

/* I les tres pàgines d'arrel, que ara porten **la mateixa barra** i no una
   pròpia. Fins al 04/10/2026 el seu `<nav>` era escrit a mà als tres fitxers i
   no el vigilava res: era la tercera còpia de la llista de destins. */
{
  let totesBe = true;
  PORTADES.forEach(nom => {
    const f = join(ARREL, nom);
    if (!existsSync(f)) { bad(`no existeix ${nom}`); totesBe = false; return; }
    const html = readFileSync(f, 'utf8');
    let nou = posa(html, nom);
    if (nou !== null) nou = posaDicArrel(nou);
    if (nou === null) {
      bad(`${nom} no es pot muntar: li falta el <body> o les marques /*TT-NAV-I18N-CA*/ … `
        + 'i sense diccionari la barra es quedaria en català sobre una pàgina traduïda');
      totesBe = false;
    } else if (CHECK) {
      if (nou !== html) { bad(`${nom} no porta la barra declarada, o l'ha canviada pel seu compte`); totesBe = false; }
    } else if (nou !== html) { writeFileSync(f, nou); tocades++; }
  });
  if (CHECK && totesBe) ok(`i les ${PORTADES.length} pàgines d'arrel porten la mateixa barra`);
}

/* ── Cap pàgina publicada i no enllaçada des d'enlloc ──────────────────────
   És un dels errors que la guia de marca documenta, i el més fàcil de cometre:
   la pàgina existeix, es va fer amb ganes, i no hi arriba ningú. Aquí es compta
   què hi ha a `SOS/*.html` i es compara amb el que surt a algun grup; el que no
   hi surt ha de tenir el motiu escrit a `FORA_DEL_MENU`. */
if (CHECK) {
  const { readdirSync } = require('node:fs');
  const totesLesPagines = readdirSync(SOS).filter(f => f.endsWith('.html'));
  const alMenu = new Set(GRUPS.flatMap(g => g.links.map(l => l[0])).concat([APP]));
  const orfes = totesLesPagines.filter(f => !alMenu.has(f) && !FORA_DEL_MENU[f]);
  if (!orfes.length)
    ok(`les ${totesLesPagines.length} pàgines de SOS/ surten al menú, o diuen per què no`);
  else bad(`${orfes.length} pàgina${orfes.length === 1 ? '' : 's'} que existeix${orfes.length === 1 ? '' : 'en'} ` +
    `i no surt${orfes.length === 1 ? '' : 'en'} de cap menú (${orfes.join(', ')}) — ` +
    'existeixen i no hi arriba ningú. Posa-les a un grup o escriu el motiu a FORA_DEL_MENU');
  Object.keys(FORA_DEL_MENU).forEach(f => {
    if (!existsSync(join(SOS, f)))
      bad(`${f} té motiu escrit a FORA_DEL_MENU i ja no existeix: sobra`);
  });
}

/* I l'aplicació, que no porta la barra però sí la llista. */
{
  const f = join(SOS, APP);
  const html = readFileSync(f, 'utf8');
  const nou = posaApp(html);
  if (nou === null) bad(`${APP} no té les marques ${A_OBRE} … ${A_TANCA}: de dins de l'app no ` +
    'hi hauria manera d\'arribar a cap eina de fora');
  else if (CHECK) {
    if (nou !== html) bad(`${APP} no porta la llista d'eines declarada, o l'ha canviada pel seu compte`);
    else ok(`i l'aplicació porta la mateixa llista de destins que les pàgines`);
  } else if (nou !== html) { writeFileSync(f, nou); tocades++; }
}

/* ══ LES QUATRE GUARDES DE LA BARRA ÚNICA (04/10/2026) ═══════════════════
   Cada una és un defecte que avui es podia cometre en silenci, i tres d'elles
   són el que va passar de debò mentre es feia aquesta unificació. */
if (CHECK) {
  const TOTES = PORTADES.map(p => [join(ARREL, p), p]).concat(PAGINES.map(p => [join(SOS, p), p]));

  /* 1 · Cap pàgina declara la seva barra. És la regla que fa que «un únic
     menú» segueixi sent veritat d'aquí a sis mesos: sense ella, qualsevol
     pàgina pot tornar-se a fer la seva i el CI passaria en verd —que és
     exactament com les tres pàgines d'arrel van arribar a tenir un `<nav>`
     escrit a mà que no vigilava res. */
  {
    const propies = [];
    TOTES.forEach(([f, nom]) => {
      if (!existsSync(f)) return;
      const src = readFileSync(f, 'utf8');
      const i = src.indexOf(OBRE), j = src.indexOf(TANCA);
      const fora = i < 0 ? src : src.slice(0, i) + src.slice(j + TANCA.length);
      /* No es prohibeix qualsevol `<nav>`: un índex de pàgina, una molla de
         pa i una fila d'enllaços del peu són `<nav>` i han de ser-ho. El que
         es prohibeix és **una segona barra del lloc**, i una barra del lloc es
         reconeix per dues coses: les classes de les tres que s'han substituït,
         o un `<nav>` amb més d'un desplegable a dins —que és la forma d'això i
         de res més. */
      const q = [];
      ['nav-links', 'tt-pagines', 'sos-nav', 'nav-burger', 'tt-nav', 'tn-gs'].forEach(c => {
        if (fora.includes(c)) q.push('.' + c);
      });
      [...fora.matchAll(/<nav[\s\S]*?<\/nav>/g)].forEach(m => {
        const n = (m[0].match(/<summary/g) || []).length;
        if (n > 1) q.push(`un <nav> amb ${n} desplegables`);
      });
      if (q.length) propies.push(`${nom} (${q.join(', ')})`);
    });
    if (!propies.length) ok(`cap de les ${TOTES.length} pàgines declara una barra pròpia`);
    else bad(`${propies.length} pàgina(es) amb barra pròpia fora del bloc generat: ${propies.join(', ')}`
      + ' — dues barres a la mateixa pàgina són dues llistes de destins, i només una la vigila res');
  }

  /* 2 · Cap destí a dues portes. Un fitxer a dos grups és la barreja tornant:
     qui el busca no sap a quin calaix és i qui el mou en deixa una còpia. */
  {
    const vist = new Map();
    GRUPS.forEach(g => g.links.forEach(l => {
      const k = hrefDe(l[0], g.arrel);
      vist.set(k, (vist.get(k) || []).concat(g.id));
    }));
    const dobles = [...vist].filter(([, gs]) => gs.length > 1);
    if (!dobles.length) ok(`els ${vist.size} destins tenen una sola porta`);
    else bad(`destins a més d'una porta: ${dobles.map(([k, gs]) => `${k} (${gs.join(' i ')})`).join(', ')}`);
  }

  /* 3 · La barra només fa servir tokens de la pell. La barra d'arrel feia
     servir `var(--white)`, `var(--accent-indigo)` i `var(--bg-panel)`, que són
     **àlies declarats només a les tres pàgines d'arrel**. Escrits a una pàgina
     del SOS no peten: deixen el text sense color, i això només ho veu qui obri
     aquella pàgina. */
  {
    const { PELL } = require('./build-pell.js');
    const declarats = new Set((PELL || []).map(t => t[0]));
    const usats = [...new Set([...CSS.matchAll(/var\((--[a-z0-9-]+)/g)].map(m => m[1]))];
    const forasters = usats.filter(t => !declarats.has(t));
    if (!declarats.size) bad('no es poden llegir els tokens de la pell: la guarda 3 no mira res');
    else if (!forasters.length) ok(`els ${usats.length} tokens de la barra són tots de la pell`);
    else bad(`la barra fa servir tokens que la pell no declara: ${forasters.join(', ')}`
      + ' — a les pàgines que no els declaren no peta: deixa el text sense color');
  }

  /* 4 · Res de la barra per sota del terra. Les mides de la barra d'arrel eren
     .78rem, .65rem, .62rem i .7rem —12,5, 10,4, 9,9 i 11,2 px— i el terra del
     lloc són 15. Una mida escrita en `rem` a la barra se salta l'escala. */
  {
    const literals = [...CSS.matchAll(/font-size:\s*(\.[0-9]+rem|[0-9.]+rem)/g)].map(m => m[1]);
    if (!literals.length) ok('cap mida de la barra escrita a mà: totes surten de l\'escala');
    else bad(`la barra porta ${literals.length} mida(es) fora de l'escala: ${literals.join(', ')}`
      + ' — el terra del lloc és var(--t0), 15 px, i un rem literal se\'l salta');
  }

  const totes = PAGINES.length;
  if (!fails) ok(`les ${totes} pàgines porten exactament el mateix menú`);
  const exc = Object.keys(EXCEPCIONS);
  const solapa = exc.filter(e => PAGINES.indexOf(e) >= 0);
  if (!solapa.length) ok(`i les ${exc.length} excepcions estan declarades amb el motiu: ${exc.join(', ')}`);
  else bad(`${solapa.join(', ')} és alhora excepció i pàgina amb menú`);
  /* Cap enllaç del menú pot apuntar a una pàgina que no existeix: un menú amb
     un forat és pitjor que un menú curt. */
  /* Cada grup diu on viuen els seus destins: els de `arrel: true` a la raíz
     del lloc i la resta a `SOS/`. Comprovar-los tots contra `SOS/` donava per
     morts els quatre de l'arrel, que existeixen. */
  /* Els destins són **absoluts** des del 04/10/2026 (`/SOS/x.html`), perquè el
     mateix marcatge val a l'arrel i a `/SOS/`. Es resolen contra la raíz del
     lloc, i una adreça que acaba en `/` és l'`index.html` d'aquella carpeta:
     `/SOS/` és un destí viu i comprovar-lo com a fitxer el donava per mort. */
  const fitxerDe = u => join(ARREL, u.replace(/^\//, '').replace(/\/$/, '/index.html'));
  const morts = GRUPS.flatMap(g => g.links.map(l => hrefDe(l[0], g.arrel)))
    .concat([CTA[0]])
    .filter(u => !existsSync(fitxerDe(u)));
  if (!morts.length) ok(`i els ${GRUPS.reduce((a, g) => a + g.links.length, 0) + 1} destins existeixen tots`);
  else bad(`el menú porta a pàgines que no hi són: ${morts.join(', ')}`);

  /* ── La taula d'eines per dinàmica ────────────────────────────────────
     Tres maneres de trencar-la, i cap peta sola. */
  const app = readFileSync(join(SOS, APP), 'utf8');
  const einesMortes = [...new Set(Object.values(EINES).map(e => e[0]))]
    .filter(h => !existsSync(join(SOS, h)));
  if (!einesMortes.length) ok(`i les ${Object.keys(EINES).length} eines per dinàmica van a un fitxer que existeix`);
  else bad(`eines que apunten a una pàgina que no hi és: ${einesMortes.join(', ')}`);
  /* Una clau que no és cap dinàmica no peta: senzillament, no s'ofereix mai. */
  const fantasma = Object.keys(EINES).filter(k => !new RegExp(`\\{id:'${k}',name:`).test(app));
  if (!fantasma.length) ok('i cada clau de la taula és una dinàmica del catàleg');
  else bad(`${fantasma.join(', ')} no és cap dinàmica de DYNAMICS: aquella eina no s'oferiria mai ` +
    'i ningú se n\'adonaria');
  /* I la que de debò importa: que l'aplicació la faci servir. El bloc pot estar
     al dia i la vista de projecte no llegir-lo — llavors l'app torna a ser el
     cul-de-sac que això ve a arreglar, amb les dades correctes a dins. */
  const llegeix = /getElementById\('sos-eines'\)/.test(app);
  const usa = (app.match(/einaDe\(/g) || []).length >= 2;
  const menu = /id="btnEines"/.test(app) && /openEines\(\)/.test(app);
  if (llegeix && usa && menu)
    ok('i l\'app la fa servir de debò: la llegeix, l\'ofereix a la vista de projecte i té entrada al menú');
  else bad('l\'app no fa servir la llista d\'eines' +
    (!llegeix ? ' (no llegeix el bloc sos-eines)' : '') +
    (!usa ? ' (la vista de projecte no crida einaDe)' : '') +
    (!menu ? ' (no hi ha entrada de menú que obri les eines)' : '') +
    ': el bloc pot ser correcte i l\'app seguir sent un cul-de-sac');

  console.log(fails ? `\n❌ ${fails} problema${fails === 1 ? '' : 's'} al menú. Arregla-ho amb:  node SOS/tools/build-nav.js`
    : '\n✅ Una sola arquitectura de menús, i tots els camins existeixen.');
  process.exit(fails ? 1 : 0);
}
console.log(`✅ Menú escrit a ${tocades} pàgina${tocades === 1 ? '' : 's'} de ${PAGINES.length}` +
  ` · ${GRUPS.length} grups, ${GRUPS.reduce((a, g) => a + g.links.length, 0)} destins i una acció`);
