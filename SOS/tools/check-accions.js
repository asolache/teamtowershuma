#!/usr/bin/env node
/* Les accions, i quan serveixen
 * ─────────────────────────────────────────────────────────────────────────────
 * El llançador tenia trenta-sis accions i sortien les trenta-sis sempre: al
 * node acabat de néixer i al que fa un any que roda. Qui entrava no sabia
 * quina de les trenta-sis era la seva, i mirar-ne trenta-sis per trobar-ne una
 * no és un menú, és un directori.
 *
 * Ara cada acció declara `quan(c)` —si ara serveix— i `pes` —quant mou—, i la
 * portada n'ensenya **una**. Això obre una manera de fallar que abans no
 * existia i que **no petaria mai**:
 *
 * · Una acció sense `quan` no surt mai al 80/20 i no avisa ningú: segueix al
 *   menú sencer i sembla que tot està bé.
 * · Un `quan` que sempre és cert no filtra res, i la portada menteix dient
 *   «això és el que ara serveix» mentre ensenya el de sempre.
 * · Un `quan` massa estricte deixa la primera pantalla **buida** justament a
 *   qui acaba d'entrar —l'únic estat que ningú prova a mà i el primer que veu
 *   tothom.
 *
 * Les quatre regles d'aquí sota són aquestes tres més la que les fa
 * acceptables: **la llista sencera sempre s'ha de poder veure.** Amagar sense
 * donar-ne la clau no és progressiu, és un calaix, i un calaix fa que qui
 * busca una cosa que hi era deixi de fiar-se del menú.
 *
 *   node SOS/tools/check-accions.js
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const APP = join(__dirname, '..', 'index.html');
const src = readFileSync(APP, 'utf8');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };

console.log('\nGuarda de les accions · index.html\n');

const bloc = (src.match(/^const ACCIONS=\[[\s\S]*?\n\];/m) || [''])[0];
if (!bloc) {
  bad('no es troba `const ACCIONS=[…]`: sense la declaració aquí no es pot comprovar res');
  console.log('\n❌ 1 problema.');
  process.exit(1);
}

/* Cada entrada en una línia, que és com estan escrites. Es parteix per `{g:'`
   perquè és l'ancoratge que `check-kiss.js` també fa servir per comptar-les. */
const files = bloc.split('\n').filter(l => /^\s*\{g:'/.test(l));

// ── 1 · Cap acció sense declarar quan serveix ni quant mou ────────────────
{
  const sense = files.filter(l => !/quan:/.test(l) || !/pes:/.test(l));
  if (sense.length) bad(`${sense.length} accions sense \`quan\` o sense \`pes\`: no sortirien mai a la portada i `
    + 'no petaria res — ' + sense.map(l => (l.match(/t:'([^']{0,40})/) || [, '?'])[1]).join(', '));
  else ok(`${files.length} accions, totes diuen quan serveixen i quant mouen`);
}

// ── 2 · Els pesos són del vocabulari declarat ─────────────────────────────
{
  const ordre = (src.match(/const PES_ORDRE=\{([^}]*)\}/) || [, ''])[1];
  const noms = new Set([...ordre.matchAll(/(\w+):/g)].map(m => m[1]));
  if (!noms.size) { bad('no es troba `PES_ORDRE`: els pesos no tenen vocabulari'); }
  else {
    const dolents = [];
    files.forEach(l => {
      [...l.matchAll(/pes:(?:[^,]*?\?)?'(\w+)'(?::'(\w+)')?/g)].forEach(m => {
        [m[1], m[2]].filter(Boolean).forEach(v => { if (!noms.has(v)) dolents.push(v); });
      });
    });
    if (dolents.length) bad('pesos que no són a `PES_ORDRE`: ' + [...new Set(dolents)].join(', ')
      + ' — un pes desconegut val zero i l\'acció desapareix de la portada en silenci');
    else ok(`${noms.size} pesos declarats (${[...noms].join(', ')}), i cap acció n'inventa un altre`);
  }
}

/* ── 3 · LA QUE IMPORTA · amb l'estat buit, ni cap ni totes ────────────────
   Es compta sobre el text: quantes accions tenen un `quan` que **no depèn de
   res** —`()=>true`— i per tant surten sempre. Si fossin totes, el filtre és
   decoratiu; si no en fos cap, la primera pantalla de qui acaba d'entrar
   dependria sencera d'un estat que encara no té. */
{
  const sempre = files.filter(l => /quan:\(\)=>true/.test(l)).length;
  const MIN = 3, MAX = Math.floor(files.length * 0.6);
  if (sempre < MIN) bad(`només ${sempre} accions serveixen sense cap condició (mínim ${MIN}): `
    + 'qui acaba d\'entrar es trobaria la primera pantalla buida');
  else if (sempre > MAX) bad(`${sempre} de ${files.length} accions no depenen de res (màxim ${MAX}): `
    + 'si gairebé totes surten sempre, la portada diu «això és el que ara serveix» i ensenya el de sempre');
  else ok(`${sempre} accions serveixen sempre i ${files.length - sempre} demanen alguna cosa: el filtre decideix`);
}

/* ── 4 · La llista sencera sempre s'ha de poder veure ──────────────────────
   Veda 62/63: ningú pot quedar tancat en una pantalla. Amagar accions només és
   acceptable mentre la clau per veure-les totes sigui a la mateixa pantalla. */
{
  const lch = (src.match(/^function openLauncher\(totes\)\{[\s\S]*?\n\}/m) || [''])[0];
  if (!lch) bad('no es troba `openLauncher(totes)`: la sortida cap a la llista sencera no es pot comprovar');
  else if (/id="lchAll"/.test(lch) && /openLauncher\(true\)/.test(lch))
    ok('i des del menú filtrat s\'arriba a les 36 amb un clic');
  else bad('el menú filtrat no porta a la llista sencera: amagar sense donar la clau és un calaix');
}

/* ── 5 · La portada n'ensenya una de principal, no cinc ────────────────────
   Cinc botons del mateix pes són una barra d'eines, i una barra d'eines torna
   a deixar la tria a qui acaba d'entrar: exactament el problema que això venia
   a resoldre. */
{
  const mis = (src.match(/const ara=accionsAra\((\d+),/) || [])[1];
  if (!mis) bad('la portada no crida `accionsAra`: el 80/20 no arriba a cap pantalla');
  else if (Number(mis) > 2) bad(`la portada demana ${mis} accions: tres botons del mateix pes ja són `
    + 'una barra d\'eines, i una barra d\'eines torna a deixar la tria a qui acaba d\'entrar');
  else ok(`la portada n'ensenya ${mis}, i la resta darrere del menú`);
}

console.log(fails ? '\n❌ ' + fails + ' problema(es) a les accions.' : '\n✅ Les accions diuen quan serveixen.');
process.exit(fails ? 1 : 0);
