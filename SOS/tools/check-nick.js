#!/usr/bin/env node
/* Guarda del nick, del territori i del relé del directori
 * ─────────────────────────────────────────────────────────────────────────
 * Tres coses noves al directori, i les tres es poden tornar falses en silenci:
 *
 * · **El nick no és una identitat.** No hi ha ningú que reparteixi noms en
 *   aquesta xarxa, i per tant dos `@marta` són possibles. El que no pot passar
 *   és que la pàgina ho amagui: si algú es pensa que el nick l'identifica,
 *   confiarà en un nom que qualsevol pot copiar. Qui identifica és el `did`.
 * · **La geografia surt de l'app.** Si algú l'edita a mà al directori, tindrem
 *   dues llistes de municipis i la que es quedarà enrere serà la de la
 *   pàgina que ningú manté.
 * · **Pel relé no hi pot passar text en clar.** El xat promet xifrat d'extrem
 *   a extrem; el dia que algú enviï el text abans de xifrar-lo per depurar una
 *   cosa i s'oblidi de treure-ho, la promesa serà falsa i no petarà res.
 *
 * Ús:  node SOS/tools/check-nick.js
 */
'use strict';
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const SOS = join(__dirname, '..');
const src = readFileSync(join(SOS, 'online.html'), 'utf8');
const app = readFileSync(join(SOS, 'index.html'), 'utf8');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

console.log('\nGuarda del nick, el territori i el relé · online.html');

/* Text visible, sense estils, scripts ni comentaris: el que llegeix una
   persona. Els comentaris del codi hi poden dir el contrari sense mentir a
   ningú —de fet, aquesta guarda ho fa. */
const cos = src.replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<style[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '');
const js = (src.match(/<script[\s\S]*?<\/script>/g) || []).join('\n');

/* ── 1 · El nick es normalitza abans de firmar ────────────────────────────
   Si es normalitzés només en pintar-lo, «Marta_Vidal» i «marta-vidal» serien
   dues firmes del mateix nom i no hi hauria manera de saber que xoquen. */
if (/function normNick\(/.test(js)) ok('el nick té normalització pròpia');
else bad('no hi ha `normNick`: un nick sense forma canònica no es pot comparar');
if (/nick:normNick\(nick\)/.test(js)) ok('i `bastirFitxa` la fa servir abans de firmar');
else bad('`bastirFitxa` no normalitza el nick — dues escriptures del mateix nom firmarien diferent');
/* Sense espais als dos costats: la constant s'escriu compacta i comparar-la
   amb un patró que en porta no trobava res i ho deia com si fos un defecte. */
if (/constCAMPS=\[[^\]]*'nick'/.test(js.replace(/\s+/g, '')))
  ok('i `nick` és a la llista de camps que viatgen');
else bad('`nick` no és a `CAMPS`: es demanaria al formulari i no sortiria mai de casa');

/* ── 2 · La pàgina diu que el nick no identifica ──────────────────────────
   És l'única defensa contra la suplantació que aquesta xarxa pot oferir:
   dir-ho. Si la pàgina calla, algú confiarà en un nom copiable. */
if (/identifica de debò|identifica de debo/i.test(cos) && /firma/i.test(cos))
  ok('la pàgina diu que qui identifica és la firma, no el nick');
else bad('enlloc no es diu que el nick no identifica ningú — algú hi confiarà');
if (/ja el fa servir|ningú reparteix noms/i.test(js))
  ok('i avisa quan el nick ja el fa servir algú altre');
else bad('no hi ha avís de coincidència de nick');

/* ── 3 · La geografia és generada ─────────────────────────────────────────
   Es comprova contra l'app, que és qui la fa servir per construir l'arbre. */
const geo = (src.match(/\/\*GEO\*\/([\s\S]*?)\/\*\/GEO\*\//) || [])[1] || '';
if (!geo.trim()) bad('el bloc de geografia és buit: el generador no hi ha escrit');
else {
  /* Es compta dins de les dues llistes i no a tot el bloc: la capçalera del
     generador porta un `'Municipi|Comarca'` d'exemple, i comptar-lo donava un
     municipi de més i acusava el generador d'estar desfasat. */
  const dins = nom => {
    const i = geo.indexOf('const ' + nom + '=[');
    if (i < 0) return 0;
    return (geo.slice(i, geo.indexOf('\n];', i)).match(/'[^']*\|[^']*'/g) || []).length;
  };
  const nCat = dins('GEO_CAT') + dins('GEO_EUS');
  const munisApp = (() => {
    let n = 0;
    for (const t of ['CAT_GEO', 'EUS_GEO']) {
      const i = app.indexOf('const ' + t + '={');
      if (i < 0) continue;
      const bloc = app.slice(i, app.indexOf('\n};', i));
      const k = bloc.indexOf('\n  municipi:[');
      if (k < 0) continue;
      const fi = bloc.indexOf('\n  ]', k);
      n += (bloc.slice(k, fi < 0 ? bloc.length : fi).match(/\{n:/g) || []).length;
    }
    return n;
  })();
  if (!munisApp) bad('no es troben els municipis a l\'app: aquesta comprovació no pot mirar res');
  else if (nCat === munisApp) ok(`${nCat} municipis al directori, els mateixos que a l'app`);
  else bad(`el directori en porta ${nCat} i l'app ${munisApp} — corre build-geo.js`);
  if (/No ho editis a mà/.test(geo)) ok('i el bloc diu que és generat');
  else bad('el bloc generat no avisa que ho és: algú l\'editarà a mà');
}

/* ── 4 · La comarca es dedueix, no es demana ──────────────────────────────
   Demanar-la seria un camp més i dues persones del mateix poble n'escriurien
   dues de diferents. */
if (/function comarcaDe\(/.test(js)) ok('la comarca es dedueix del municipi');
else bad('no hi ha `comarcaDe`: la comarca s\'hauria de demanar, i divergiria');
if (!/id="fComarca"/.test(src)) ok('i no es demana al formulari');
else bad('el formulari demana la comarca: dues persones del mateix poble n\'escriuran dues');

/* ── 5 · Pel relé no hi passa text en clar ────────────────────────────────
   La comprovació que compta d'aquest fitxer. `relayEnvia` ha de rebre el blob
   xifrat i res més; si algú hi passés el text del camp, el xat seguiria
   funcionant i la promesa de la pàgina seria falsa. */
if (/function relayEnvia\(blob\)/.test(js)) ok('`relayEnvia` rep un blob, no un text');
else bad('`relayEnvia` no rep un blob: mira què hi entra abans de tocar res més');
const enviaXat = (js.match(/async function enviaXat\(\)\{[\s\S]*?\n  \}/) || [])[0] || '';
if (!enviaXat) bad('no es troba `enviaXat`: aquesta comprovació no pot mirar res');
else {
  if (/relayEnvia\(blob\)/.test(enviaXat)) ok('i el xat li dona el blob xifrat');
  else bad('el xat no envia el blob — mira si envia el text en clar');
  if (!/relayEnvia\(\s*t\s*\)/.test(enviaXat)) ok('i mai el text del camp');
  else bad('EL TEXT EN CLAR VA AL RELÉ — la pàgina promet xifrat d\'extrem a extrem');
  if (/const blob=await xifra\(/.test(enviaXat)) ok('el text es xifra abans de res');
  else bad('no es xifra abans d\'enviar');
}

/* I el desxifrat ha de ser fora del mòdul del relé: el transport no ha de
   saber què porta. */
const relBloc = (js.match(/function relayObre\([\s\S]*?\n\}/) || [])[0] || '';
if (relBloc && !/desxifra\(/.test(relBloc)) ok('el relé no desxifra res: només transporta');
else if (!relBloc) bad('no es troba `relayObre`');
else bad('el relé desxifra: el transport no ha de saber què porta a dins');

/* ── 6 · El relé no s'obre fins que obres una conversa ────────────────────
   Qui només ve a mirar qui hi ha no ha d'obrir cap connexió permanent. */
const init = (js.match(/async function init\(\)\{[\s\S]*?\n\}/) || [])[0] || '';
if (init && !/relayObre\(/.test(init)) ok('no es connecta en carregar la pàgina, només en obrir una conversa');
else if (!init) bad('no es troba `init`');
else bad('el relé es connecta en carregar: qui només mira no ha d\'obrir cap canal');

/* ── 7 · El camí des de l'app ─────────────────────────────────────────────
   Un enllaç i cap còpia de dades. Si l'app copiés el perfil per passar-lo,
   hi hauria una segona còpia que envelliria. */
if (/#alta-sos/.test(app)) ok('l\'app porta al directori amb el perfil ja portat');
else bad('l\'app no té camí cap al directori: el perfil es tornaria a escriure a mà');
if (/entradaPerHash/.test(js) && /alta-sos/.test(js)) ok('i el directori sap què fer quan hi arriba');
else bad('el directori no entén `#alta-sos`: l\'enllaç de l\'app no farà res');
/* I que no publiqui sol en arribar-hi, que és el que ho faria inacceptable. */
const entrada = (js.match(/async function entradaPerHash\(\)\{[\s\S]*?\n\}/) || [])[0] || '';
if (entrada && !/publica\(/.test(entrada)) ok('i arribar-hi no publica res: només omple i ensenya (veda 47)');
else if (!entrada) bad('no es troba `entradaPerHash`');
else bad('arribar del SOS publica sol — la previsualització ha de ser l\'última paraula');

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} al directori.` : '\n✅ El nick no identifica, la geografia surt de l\'app, i pel relé només hi passa xifrat.');
process.exit(fails ? 1 : 0);
