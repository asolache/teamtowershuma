#!/usr/bin/env node
/* Guarda de Molekulandia · que sigui un lloc on entrar i no un pòster
 * ─────────────────────────────────────────────────────────────────────────────
 * `build-molekulandia.js` ja vigila que els números i la taxonomia surtin de les
 * taules. El que vigila aquesta guarda és l'altra meitat, la que no es genera:
 * **què promet la pàgina**.
 *
 * El risc d'aquesta pàgina no és equivocar-se de xifra: és quedar-se en un
 * dibuix bonic. El criteri escrit al backlog abans de començar era aquest —«si
 * des de la pàgina no s'hi pot entrar a fer alguna cosa, no és Molekulandia, és
 * una il·lustració»— i això no peta mai sol.
 *
 * Es comprova:
 *
 *   1. **De cada edifici s'hi entra.** Hi ha fitxa, i la fitxa porta o bé una
 *      porta a una eina que existeix de debò, o bé la frase que diu que encara
 *      no n'hi ha cap. Mai les dues, mai cap de les dues.
 *   2. **Cap porta apunta a un fitxer que no hi és.** Prometre una eina que no
 *      s'obre és pitjor que no prometre res.
 *   3. **Les dades vénen del bloc generat**, no d'una còpia escrita al costat.
 *      Una segona llista de professions dins de la pàgina seria exactament el
 *      que el generador existeix per evitar.
 *   4. **El perfil és el vocabulari compartit del SOS**, no un de propi.
 *   5. **Les quatre natures es diuen i s'expliquen**: el valor de la pàgina és
 *      que 116 noms no són 116 professions, i si això desapareix del text queda
 *      una llista com qualsevol altra.
 *   6. **No es fabrica cap dada de ningú**: el que hi ha encès al poble ho marca
 *      qui llegeix, i la pàgina diu que no ho pot saber sola.
 *
 * Veda 131.
 *
 * Ús:  node SOS/tools/check-molekulandia.js
 */
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const SOS = join(ARREL, 'SOS');
const PAG = readFileSync(join(SOS, 'molekulandia.html'), 'utf8');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

console.log('\nGuarda de Molekulandia · un lloc on entrar, no una il·lustració');

/* ── Les dades generades ────────────────────────────────────────────────── */
const cru = (PAG.match(/<script id="molek-dades" type="application\/json">\s*([\s\S]*?)\s*<\/script>/) || [])[1];
let D = null;
try { D = JSON.parse(cru); } catch (e) { /* avall es diu */ }
if (!D) {
  bad('no es troba el bloc de dades generat: sense això la guarda no pot comprovar res. ' +
    'Corre  node SOS/tools/build-molekulandia.js');
  console.log(`\n❌ ${pl(fails, 'problema', 'problemes')} a Molekulandia.`);
  process.exit(1);
}
ok(`el bloc de dades hi és: ${D.edificis.length} edificis, ${D.professions.length} professions, ` +
  `${D.resum.unics} noms de rol`);

/* ── 1 · De cada edifici s'hi entra ─────────────────────────────────────── */
const ambEina = D.edificis.filter(e => e.eina);
const senseEina = D.edificis.filter(e => !e.eina);
if (ambEina.length && senseEina.length)
  ok(`${ambEina.length} edificis porten a una eina i ${senseEina.length} diuen que encara no en tenen`);
else if (!senseEina.length)
  ok(`els ${ambEina.length} edificis porten a una eina`);
else bad('cap edifici porta enlloc: això és un pòster');
/* La fitxa i les dues sortides han d'existir al codi de la pàgina. */
if (/function pintaFitxa\(/.test(PAG) && /class="porta"/.test(PAG))
  ok('i cada edifici obre una fitxa amb el que és, els seus rols i la seva porta');
else bad('no hi ha fitxa d\'edifici: des de la pàgina no s\'hi pot entrar a res');
if (/encara no té eina pròpia/.test(PAG))
  ok('i els que no en tenen ho diuen amb totes les lletres, en comptes de dibuixar-hi una porta falsa');
else bad('la pàgina no té la frase que diu que un edifici encara no té eina — o totes en tenen ' +
  '(comprova-ho) o s\'està prometent una porta que no s\'obre');

/* ── 2 · Cap porta apunta a un fitxer que no hi és ──────────────────────── */
const trencades = ambEina.filter(e => !existsSync(join(SOS, e.eina[0])));
if (!trencades.length) ok(`i les ${ambEina.length} portes van a un fitxer que existeix`);
else bad(`${pl(trencades.length, 'porta apunta', 'portes apunten')} a un fitxer que no hi és: ` +
  trencades.map(e => `${e.nom} → ${e.eina[0]}`).join(', '));
/* I els enllaços escrits a mà al text, també. */
const enllacos = [...PAG.matchAll(/href="([a-z0-9-]+\.html)"/g)].map(m => m[1]);
const mortsText = [...new Set(enllacos)].filter(h => !existsSync(join(SOS, h)));
if (!mortsText.length) ok(`i els ${new Set(enllacos).size} enllaços del text també`);
else bad(`enllaços a pàgines que no existeixen: ${mortsText.join(', ')}`);

/* ── 3 · Una sola llista, la generada ───────────────────────────────────── */
/* Una segona declaració de professions dins del script seria la còpia que el
   generador existeix per evitar: divergiria i no petaria res. */
const script = (PAG.match(/<script type="module">([\s\S]*)<\/script>/) || ['', ''])[1];
if (!/const\s+PROFESSIONS\s*=/.test(script) && /JSON\.parse\(document\.getElementById\('molek-dades'\)/.test(script))
  ok('les professions surten del bloc generat i no hi ha cap segona llista escrita al costat');
else bad('hi ha una llista de professions escrita dins de la pàgina: divergiria del catàleg i no ' +
  'petaria res, que és justament el que el generador ve a evitar');
if (/build-molekulandia/.test(PAG))
  ok('i la pàgina diu d\'on surten els seus números');
else bad('la pàgina no diu que les seves xifres es generen: qui les llegeixi no sabrà si són d\'avui');

/* ── 4 · El perfil compartit ────────────────────────────────────────────── */
const clau = (PAG.match(/const PERFIL_CLAU='([^']+)'/) || [])[1];
const seva = (readFileSync(join(SOS, 'vna.html'), 'utf8').match(/const PERFIL_CLAU='([^']+)'/) || [])[1];
if (clau && clau === seva) ok(`el perfil es desa amb la clau compartida (${clau}): qui l'ha omplert al ` +
  'mapa de valor el porta posat aquí');
else bad(`la clau del perfil és «${clau || '—'}» i a vna.html és «${seva || '—'}»: dues persones amb el ` +
  'mateix perfil rebrien propostes diferents');
const demanaFora = D.professions.filter(p => p.demana.some(d =>
  !new RegExp(`\\{id:'${d}'`).test(PAG)));
if (!demanaFora.length) ok('i cada professió demana capacitats del mateix vocabulari');
else bad(`professions que demanen una capacitat que no és a APORTS: ${demanaFora.map(p => p.nom).join(', ')}`);

/* ── 5 · Les quatre natures, dites ──────────────────────────────────────── */
const natures = ['ofici', 'part', 'fora', 'peça'];
const falten = natures.filter(n => !D.rols.some(r => r.natura === n));
if (!falten.length) ok(`els ${D.resum.unics} noms es reparteixen en les quatre natures ` +
  `(${D.resum.ofici} oficis, ${D.resum.part} maneres de ser-hi, ${D.resum.fora} de fora, ${D.resum.peca} peces)`);
else bad(`natures sense cap rol: ${falten.join(', ')}`);
/* El text es llegeix com el llegeix una persona, i no com està escrit al
   fitxer. Dues coses hi feien perdre frases que hi eren:
   · dins del script van en cadenes de JavaScript i porten `\'` on la pantalla
     ensenya un apòstrof;
   · i al marcatge hi ha etiquetes al mig — «no són <strong>professions</strong>»
     és una frase seguida per a qui llegeix i tres trossos per a un `indexOf`. */
const TEXT = PAG.replace(/\\'/g, '\'').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ');
if (/no són professions/i.test(TEXT) && /no s'aprèn: s'hi és/i.test(TEXT))
  ok('i la pàgina explica per què la majoria de noms no són professions, que és tot el valor que té');
else bad('la pàgina no explica que la majoria de rols no són professions: sense això és una llista ' +
  'de sinònims amb aire de descobriment');
/* El número gros no es pot presentar com si fossin professions. La negació sí:
   el títol de la pàgina és «Molekulandia no té 165 professions», i una guarda
   que no sabés distingir-ho estaria prohibint precisament la frase honesta. */
const infla = [D.resum.caselles, D.resum.unics].flatMap(n =>
  [...TEXT.matchAll(new RegExp(`(.{0,12})${n}\\.?\\s+professions`, 'gi'))]
    .filter(m => !/\bno (té|són|hi ha)\s*$/i.test(m[1]))
    .map(m => m[0].trim()));
if (!infla.length)
  ok(`i enlloc es presenten ${D.resum.caselles} ni ${D.resum.unics} com si fossin professions: n'hi ha ${D.resum.professions}`);
else bad(`la pàgina presenta ${D.resum.caselles} o ${D.resum.unics} com a professions («${infla[0]}»), ` +
  'i això seria inflar el número amb rols que no s\'aprenen');

/* ── 6 · No es fabrica cap dada de ningú ────────────────────────────────── */
if (/ho marca qui llegeix|Ho marca qui llegeix/.test(PAG) && /La pàgina no ho pot saber/.test(PAG))
  ok('el que hi ha encès al poble ho marca qui llegeix, i la pàgina diu que no ho pot saber sola');
else bad('la pàgina no diu qui decideix què hi ha encès: fer veure que ho sap seria el mateix error ' +
  'que dibuixar onze edificis oberts a un territori que en té dos');
const inputs = PAG.match(/<input[^>]*>/g) || [];
if (!inputs.length) ok('i no demana cap dada: aquí no hi ha cap camp on escriure res de ningú');
else bad(`${pl(inputs.length, 'camp demana', 'camps demanen')} dades i aquesta pàgina no n'hauria de ` +
  `demanar cap: ${inputs[0]}`);

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} a Molekulandia.`
  : '\n✅ De cada edifici s\'hi entra, cap porta és falsa i les professions surten del catàleg.');
process.exit(fails ? 1 : 0);
