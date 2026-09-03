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
const GRUPS = [
  { id: 'comenca', lbl: 'Comença', ic: '🧭', links: [
    ['diagnostic.html', 'Diagnòstic', 'On ets i què et falta, en 3 minuts'],
    ['intro.html', 'La intro', 'De què va tot això'],
    ['uneix-te.html', 'Uneix-t\'hi', 'El que ja fas al barri, comptat']
  ] },
  { id: 'eines', lbl: 'Eines', ic: '🛠', links: [
    ['vna.html', 'Mapa de valor', 'Rols i intercanvis d\'un projecte'],
    ['matriu.html', 'La MATRIU', 'La incubadora: etapes, portes i propietat'],
    ['compra.html', 'La Compra', 'Grup de consum i compra col·lectiva'],
    ['energia.html', 'L\'Energia', 'Comunitat energètica i autoconsum compartit'],
    ['habitatge.html', 'L\'Habitatge', 'Cessió d\'ús: quota, entrada i sortida'],
    ['molekulandia.html', 'Molekulandia', 'El poble sencer i les nou professions'],
    ['joc.html', 'El joc', 'La plaça, a ritme']
  ] },
  { id: 'apren', lbl: 'Aprèn', ic: '🎓', links: [
    ['formacio.html', 'Formació', '16 mòduls, de N0 a N3'],
    ['escola.html', 'Escoles', 'El SOS a mida d\'aula'],
    ['vedes.html', 'Les vedes', 'Les regles, amb el motiu al costat'],
    ['blog.html', 'Blog', 'Cada capacitat, explicada']
  ] },
  { id: 'xarxa', lbl: 'Xarxa', ic: '🏘', links: [
    ['comando.html', 'El Comando', 'La tribu i el reclutament'],
    ['online.html', 'Directori', 'Qui hi ha, per territori']
  ] }
];
const CTA = ['index.html', 'Obre SOS'];
const MARCA = ['../index.html', 'TeamTowers', 'Humà'];

/* Les pàgines que porten el menú. La llista és explícita a posta: afegir una
   pàgina al SOS ha de ser una decisió que inclogui dir on va al menú. */
const PAGINES = ['blog.html', 'comando.html', 'compra.html', 'crm.html', 'diagnostic.html',
  'energia.html', 'escola.html', 'formacio.html', 'habitatge.html', 'intro.html', 'matriu.html',
  'molekulandia.html', 'online.html',
  'uneix-te.html', 'vedes.html', 'vna.html'];

/* I les que no, amb el motiu. Una excepció sense motiu escrit és un descuit
   que d'aquí a sis mesos ningú sabrà si era volgut. */
const EXCEPCIONS = {
  'index.html': 'És l\'aplicació i té la seva pròpia barra, amb cerca, accions i sessió.',
  'joc.html': 'És una pantalla de joc completa; un menú a sobre en trencaria el ritme.'
};

/* ══ QUINA EINA SERVEIX QUINA DINÀMICA ═══════════════════════════════════
   Set de les dotze dinàmiques del catàleg tenen una pàgina que fa la seva
   feina, i dues es fan dins de l'aplicació mateixa. Fins ara això només ho
   sabia Molekulandia, per pintar la porta de cada edifici; ara ho necessita
   també l'app —des d'un projecte de comunitat energètica s'ha de poder obrir
   L'Energia— i per això es declara aquí, on ja viu el mapa de pàgines.

   Dues còpies d'aquesta taula divergirien el dia que una dinàmica estrenés
   eina, i no petaria res: senzillament, un dels dos llocs no l'oferiria. */
const EINES = {
  banc_temps: ['index.html', 'A dins de l\'app'],
  biblioteca_coses: ['index.html', 'A dins de l\'app'],
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

/* ══ El marcatge ═════════════════════════════════════════════════════════ */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function nav(pagina) {
  const aqui = h => h === pagina;
  const grup = g => {
    const dins = g.links.some(l => aqui(l[0]));
    return `<details class="sn-g${dins ? ' sn-here' : ''}"><summary>${g.ic} ${esc(g.lbl)}</summary>` +
      `<div class="sn-p">` + g.links.map(([h, t, d]) =>
        `<a href="${h}"${aqui(h) ? ' aria-current="page"' : ''}><b>${esc(t)}</b><span>${esc(d)}</span></a>`
      ).join('') + `</div></details>`;
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
const CSS = `<style>
.sos-nav{position:sticky;top:0;z-index:60;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;
  padding:.55rem 1rem;background:rgba(11,11,18,.96);backdrop-filter:blur(12px);
  border-bottom:1px solid rgba(255,255,255,.09);font-size:.85rem;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif}
.sos-nav .sn-brand{font-weight:700;color:#f5f5f7;text-decoration:none;margin-right:.4rem}
.sos-nav .sn-brand span{color:#00e676}
.sos-nav .sn-gs{display:flex;gap:.15rem;flex-wrap:wrap;align-items:center}
.sos-nav .sn-g{position:relative}
.sos-nav .sn-g>summary{list-style:none;cursor:pointer;padding:.34rem .6rem;border-radius:8px;
  color:#c7c7d1;white-space:nowrap;border:1px solid transparent}
.sos-nav .sn-g>summary::-webkit-details-marker{display:none}
.sos-nav .sn-g>summary:hover{color:#f5f5f7;background:rgba(255,255,255,.06)}
.sos-nav .sn-g[open]>summary{background:rgba(255,255,255,.08);color:#f5f5f7;border-color:rgba(255,255,255,.12)}
.sos-nav .sn-here>summary{color:#f5f5f7}
.sos-nav .sn-here>summary::after{content:'';display:block;height:2px;background:#6366f1;border-radius:2px;margin-top:.16rem}
.sos-nav .sn-p{position:absolute;top:calc(100% + .3rem);left:0;min-width:250px;z-index:70;
  background:#141420;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:.35rem;
  box-shadow:0 14px 40px rgba(0,0,0,.5);display:flex;flex-direction:column;gap:.1rem}
.sos-nav .sn-p a{display:block;padding:.42rem .55rem;border-radius:8px;text-decoration:none;color:#c7c7d1}
.sos-nav .sn-p a:hover{background:rgba(99,102,241,.16);color:#f5f5f7}
.sos-nav .sn-p a[aria-current]{background:rgba(99,102,241,.22);color:#f5f5f7}
.sos-nav .sn-p b{display:block;font-size:.85rem;font-weight:600;color:#f5f5f7}
.sos-nav .sn-p span{display:block;font-size:.73rem;color:#82828d;line-height:1.35}
.sos-nav .sn-cta{margin-left:auto;background:#6366f1;color:#fff;font-weight:600;text-decoration:none;
  padding:.36rem .8rem;border-radius:9px;white-space:nowrap}
.sos-nav .sn-cta:hover{background:#4f46e5}
@media(max-width:640px){
  .sos-nav{padding:.5rem .7rem;gap:.35rem}
  .sos-nav .sn-brand{font-size:.82rem}
  .sos-nav .sn-cta{margin-left:auto;padding:.32rem .6rem;font-size:.8rem}
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
    border-left:2px solid rgba(99,102,241,.5);border-radius:0 10px 10px 0}
}
</style>`;

/* ══ Aplicar ═════════════════════════════════════════════════════════════ */
/* `build-vedes.js` genera `vedes.html` sencer des del codex, o sigui que
   escriuria per sobre del menú i les dues guardes es contradirien: la del menú
   diria que hi és i la dels vedes que la pàgina no correspon al codex. Per això
   el menú s'exporta i el generador dels vedes l'aplica ell mateix — una sola
   declaració, dos que la fan servir. */
module.exports = { posa, nav, PAGINES, EXCEPCIONS, GRUPS, CTA, EINES };
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
    grups: GRUPS.map(g => ({ lbl: g.lbl, ic: g.ic,
      links: g.links.filter(l => l[0] !== APP).map(([h, t, d]) => ({ h, t, d })) }))
      .filter(g => g.links.length),
    eines: EINES
  };
  return A_OBRE + '\n<script id="sos-eines" type="application/json">\n' +
    JSON.stringify(dades) + '\n</script>\n' + A_TANCA;
}
function posaApp(html) {
  const i = html.indexOf(A_OBRE), j = html.indexOf(A_TANCA);
  if (i < 0 || j <= i) return null;
  return html.slice(0, i) + blocApp() + html.slice(j + A_TANCA.length);
}

if (CHECK) console.log('\nGuarda del menú · una sola arquitectura a totes les pàgines');
let tocades = 0;

PAGINES.forEach(p => {
  const f = join(SOS, p);
  if (!existsSync(f)) { bad(`${p} és a la llista del menú i no existeix`); return; }
  const html = readFileSync(f, 'utf8');
  const nou = posa(html, p);
  if (nou === null) { bad(`${p} no té <body>: no s'hi pot posar el menú`); return; }
  if (CHECK) {
    if (nou === html) return;
    bad(`${p} no porta el menú declarat, o l'ha canviat pel seu compte`);
  } else if (nou !== html) { writeFileSync(f, nou); tocades++; }
});

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
  const morts = GRUPS.flatMap(g => g.links.map(l => l[0])).concat([CTA[0]])
    .filter(h => !existsSync(join(SOS, h)));
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
