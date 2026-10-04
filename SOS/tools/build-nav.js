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

const CTA = ['index.html', 'Obre SOS'];
const MARCA = ['../index.html', 'TeamTowers', 'Humà'];

/* Les pàgines que porten el menú. La llista és explícita a posta: afegir una
   pàgina al SOS ha de ser una decisió que inclogui dir on va al menú. */
const PAGINES = ['banc-temps.html', 'biblioteca.html', 'blog.html', 'comando.html', 'compra.html', 'crm.html', 'diagnostic.html',
  'diagnostic-org.html', 'diagnostic-territori.html',
  'energia.html', 'escola.html', 'formacio.html', 'habitatge.html', 'ia.html', 'intro.html',
  'matriu.html', 'molekulandia.html', 'molekulon.html', 'online.html', 'pressupost.html',
  'uneix-te.html', 'vedes.html', 'vna.html'];

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

const OBRE = '<!--SOS-NAV-->', TANCA = '<!--/SOS-NAV-->';
/* L'aplicació no porta la barra —això segueix sent cert i és a EXCEPCIONS—,
   però sí que ha de portar **la mateixa llista de destins**. L'excepció era
   sobre la barra, no sobre el contingut: fins ara, de dins de l'app no hi havia
   manera d'arribar a cap de les eines de fora. Ni una. */
const APP = 'index.html';
const A_OBRE = '<!--SOS-EINES-->', A_TANCA = '<!--/SOS-EINES-->';
/* I la portada. No hi va la barra del SOS —té la seva pròpia i posar-n'hi dues
   seria dir dues vegades el mateix amb dos dissenys—, però sí **el mateix
   desplegable de destins**: qui arriba per la portada no tenia manera
   d'arribar a cap de les pàgines si no les sabia de memòria. */
/* Les tres pàgines d'arrel porten el mateix desplegable. Eren una —la
   portada— fins que l'endreça en va fer tres: amb una sola declarada aquí,
   `cataleg.html` i `qui-som.html` haurien nascut sense cap manera d'anar
   enlloc, i la guarda hauria passat en verd perquè mirava la portada. */
const PORTADES = ['index.html', 'cataleg.html', 'qui-som.html'];
const P_OBRE = '<!--TT-PAGINES-->', P_TANCA = '<!--/TT-PAGINES-->';

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
  const fix = {
    'nv.totes': { ca: 'Totes les pàgines', es: 'Todas las páginas' },
    'nv.g.eina': { ca: '🖥 L\'eina', es: '🖥 La herramienta' },
    'nv.t.sos': { ca: 'El SOS', es: 'El SOS' },
    'nv.d.sos': { ca: 'L\'aplicació sencera, al navegador', es: 'La aplicación entera, en el navegador' }
  };
  Object.entries(fix).forEach(([k, v]) => f.push(`  '${k}':'${esc2(v[l])}',`));
  return f.join('\n');
}
const esc2 = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

/* ══ El marcatge ═════════════════════════════════════════════════════════ */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function nav(pagina) {
  const aqui = h => h === pagina;
  const grup = g => {
    const dins = g.links.some(l => aqui(l[0]));
    /* El marcatge duu la clau **a totes** les pàgines del SOS i el text escrit
       en català. A les que no tenen diccionari no passa res: una clau sense
       entrada deixa el text tal com és, que és el correcte. A les que sí que
       en tenen —els quatre formularis— la barra canvia amb la pàgina.

       Abans la barra es quedava en català sobre un formulari traduït de dalt a
       baix, i era l'última costura que es veia mirant. */
    return `<details class="sn-g${dins ? ' sn-here' : ''}"><summary data-i18n="nv.g.${g.id}">${g.ic} ${esc(txt(g.lbl, 'ca'))}</summary>` +
      `<div class="sn-p">` + g.links.map(([h, t, d]) => {
        /* Des d'una pàgina del SOS, l'arrel és un nivell amunt. */
        const id = clauDe(g, h);
        return `<a href="${g.arrel ? '../' + h : h}"${!g.arrel && aqui(h) ? ' aria-current="page"' : ''}>`
          + `<b data-i18n="nv.t.${id}">${esc(txt(t, 'ca'))}</b>`
          + `<span data-i18n="nv.d.${id}">${esc(txt(d, 'ca'))}</span></a>`;
      }).join('') + `</div></details>`;
  };
  /* El CSS va DINS de les marques. A fora, el bloc de substitució el tornava a
     afegir a cada passada i el fitxer creixia amb una còpia més: el generador
     petava contra la seva pròpia sortida. */
  return OBRE + '\n' + CSS + '\n' +
    `<nav class="sos-nav" aria-label="Navegació del SOS">\n` +
    `  <a class="sn-brand" href="${MARCA[0]}">${esc(MARCA[1])} <span>${esc(MARCA[2])}</span></a>\n` +
    `  <div class="sn-gs">${GRUPS.map(grup).join('')}</div>\n` +
    `  <a class="sn-cta" href="${CTA[0]}"${aqui(CTA[0]) ? ' aria-current="page"' : ''}>${esc(CTA[1])} →</a>\n` +
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
.sos-nav{position:sticky;top:0;z-index:60;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;
  padding:.6rem 1rem;background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(12px);
  border-bottom:1px solid var(--border);font-size:var(--t0);
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif}
.sos-nav .sn-brand{font-weight:700;color:var(--text);text-decoration:none;margin-right:.4rem}
.sos-nav .sn-brand span{color:var(--green)}
.sos-nav .sn-gs{display:flex;gap:.15rem;flex-wrap:wrap;align-items:center}
.sos-nav .sn-g{position:relative}
.sos-nav .sn-g>summary{list-style:none;cursor:pointer;padding:.34rem .6rem;border-radius:8px;
  color:var(--light);white-space:nowrap;border:1px solid transparent}
.sos-nav .sn-g>summary::-webkit-details-marker{display:none}
.sos-nav .sn-g>summary:hover{color:var(--text);background:var(--panel)}
.sos-nav .sn-g[open]>summary{background:var(--panel);color:var(--text);border-color:var(--border)}
.sos-nav .sn-here>summary{color:var(--text);font-weight:600}
.sos-nav .sn-here>summary::after{content:'';display:block;height:2px;background:var(--indigo);border-radius:2px;margin-top:.16rem}
.sos-nav .sn-p{position:absolute;top:calc(100% + .3rem);left:0;min-width:260px;z-index:70;
  background:var(--card);border:1px solid var(--border);border-radius:12px;padding:.35rem;
  box-shadow:0 14px 40px rgba(21,19,15,.14);display:flex;flex-direction:column;gap:.1rem}
.sos-nav .sn-p a{display:block;padding:.42rem .55rem;border-radius:8px;text-decoration:none;color:var(--light)}
.sos-nav .sn-p a:hover{background:var(--panel);color:var(--text)}
.sos-nav .sn-p a[aria-current]{background:var(--panel);color:var(--text);box-shadow:inset 2px 0 0 var(--indigo)}
.sos-nav .sn-p b{display:block;font-size:var(--t0);font-weight:600;color:var(--text)}
.sos-nav .sn-p span{display:block;font-size:var(--t0);color:var(--muted);line-height:1.4}
.sos-nav .sn-cta{margin-left:auto;background:var(--indigo);color:#fff;font-weight:600;text-decoration:none;
  padding:.4rem .85rem;border-radius:9px;white-space:nowrap}
.sos-nav .sn-cta:hover{filter:brightness(1.12)}
@media(max-width:640px){
  .sos-nav{padding:.5rem .7rem;gap:.35rem}
  .sos-nav .sn-brand{font-size:var(--t0)}
  .sos-nav .sn-cta{margin-left:auto;padding:.34rem .65rem;font-size:var(--t0)}
  /* A mòbil el panell no flota: s'obre a sota i empeny. Un panell absolut en
     una barra que ja fa dues línies acaba fora de pantalla. */
  /* En columna, i no en fila que embolica: amb els grups com a germans d'una
     fila flexible, obrir-ne un el feia créixer i els altres se li posaven al
     costat, mig amagats. En columna, obrir empeny cap avall i prou. */
  .sos-nav .sn-gs{width:100%;order:3;flex-direction:column;align-items:stretch;gap:.1rem}
  .sos-nav .sn-g{position:static}
  .sos-nav .sn-g>summary{width:100%}
  /* La marca del grup on ets no ha de fer de línia divisòria: a mòbil, un
     subratllat de banda a banda sembla una separació i no una pista. */
  .sos-nav .sn-here>summary::after{max-width:4.5rem}
  .sos-nav .sn-p{position:static;min-width:0;margin:.2rem 0 .3rem .5rem;box-shadow:none;
    border-left:2px solid var(--indigo);border-radius:0 10px 10px 0}
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
  const i = html.indexOf(OBRE), j = html.indexOf(TANCA);
  if (i >= 0 && j > i) return html.slice(0, i) + bloc + html.slice(j + TANCA.length);
  /* Primer cop: es treu el menú vell i s'insereix just després de `<body>`. */
  let net = html
    .replace(/\n?<nav class="top">[\s\S]*?<\/nav>\n?/, '\n')
    .replace(/\n?<nav>\n<a href="\.\.\/index\.html">[\s\S]*?<\/nav>\n?/, '\n');
  const b = net.search(/<body[^>]*>/);
  if (b < 0) return null;
  const fi = net.indexOf('>', b) + 1;
  return net.slice(0, fi) + '\n' + bloc + '\n' + net.slice(fi);
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
/* El desplegable de la portada. `<details>` natiu, com el menú del SOS: és un
   component de disclosure accessible i amb teclat que el navegador ja porta, i
   injectar-hi un script seria una còpia més d'una cosa que ja funciona.

   Les rutes van amb `/SOS/` al davant perquè la portada viu a l'arrel. */
function blocPortada() {
  const grup = g => `      <div class="tp-g">
        <div class="tp-g-l" data-i18n="nv.g.${g.id}">${g.ic} ${esc(txt(g.lbl, 'ca'))}</div>
` + g.links.map(([h, t, d]) => {
    const id = clauDe(g, h);
    return `        <a href="/${g.arrel ? '' : 'SOS/'}${h}">`
      + `<b data-i18n="nv.t.${id}">${esc(txt(t, 'ca'))}</b>`
      + `<span data-i18n="nv.d.${id}">${esc(txt(d, 'ca'))}</span></a>`;
  }).join('\n') +
    `\n      </div>`;
  return P_OBRE + `
<details class="tt-pagines">
  <summary data-i18n="nv.totes">Totes les pàgines</summary>
  <div class="tp-p">
` + GRUPS.map(grup).join('\n') + `
      <div class="tp-g">
        <div class="tp-g-l" data-i18n="nv.g.eina">🖥 L'eina</div>
        <a href="/SOS/"><b data-i18n="nv.t.sos">El SOS</b><span data-i18n="nv.d.sos">L'aplicació sencera, al navegador</span></a>
      </div>
  </div>
</details>
` + P_TANCA;
}
function posaPortada(html) {
  const i = html.indexOf(P_OBRE), j = html.indexOf(P_TANCA);
  if (i < 0 || j <= i) return null;
  let out = html.slice(0, i) + blocPortada() + html.slice(j + P_TANCA.length);
  /* I les claus als dos diccionaris. El marcatge sol no tradueix res: una clau
     a l'HTML sense entrada al diccionari deixa el text escrit a mà, que és
     justament el que passava amb el menú sencer. */
  [['CA', 'ca'], ['ES', 'es']].forEach(([M, l]) => {
    const a = `/*TT-NAV-I18N-${M}*/`, b = `/*/TT-NAV-I18N-${M}*/`;
    const x = out.indexOf(a), y = out.indexOf(b);
    if (x < 0 || y <= x) { out = null; return; }
    out = out.slice(0, x + a.length) + '\n' + diccionari(l) + '\n' + out.slice(y);
  });
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
  'diagnostic-territori.html', 'pressupost.html'];

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

/* I les pàgines d'arrel, que tampoc porten la barra però sí el desplegable. */
{
  let totesBe = true;
  PORTADES.forEach(nom => {
    const f = join(ARREL, nom);
    if (!existsSync(f)) { bad(`no existeix ${nom}`); totesBe = false; return; }
    const html = readFileSync(f, 'utf8');
    const nou = posaPortada(html);
    if (nou === null) {
      bad(`${nom} no té les marques ${P_OBRE} … ${P_TANCA}: d'aquesta pàgina no hi hauria manera d'arribar a cap altra`);
      totesBe = false;
    } else if (CHECK) {
      if (nou !== html) { bad(`${nom} no porta el desplegable declarat, o l'ha canviat pel seu compte`); totesBe = false; }
    } else if (nou !== html) { writeFileSync(f, nou); tocades++; }
  });
  if (CHECK && totesBe) ok(`i les ${PORTADES.length} pàgines d'arrel porten el mateix desplegable de destins`);
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

if (CHECK) {
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
  const morts = GRUPS.flatMap(g => g.links.map(l => [g.arrel ? ARREL : SOS, l[0]]))
    .concat([[SOS, CTA[0]]])
    .filter(([base, h]) => !existsSync(join(base, h))).map(([, h]) => h);
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
