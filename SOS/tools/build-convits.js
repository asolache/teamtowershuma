#!/usr/bin/env node
/* Els nicks reservats del Comando · una invitació que no publica res per tu
 * ─────────────────────────────────────────────────────────────────────────────
 * L'encàrrec era «crea els usuaris al directori de tots els fundadors del
 * Comando». Fet literalment, seria publicar dotze fitxes a nom de dotze
 * persones reals que no ho han demanat, i firmades per una clau que no és la
 * seva. Això trenca la sola cosa que fa que aquest directori valgui res: **cada
 * fitxa la signa qui la fa**, i el servidor que la guarda no hi pot escriure.
 *
 * Així que el que hi ha aquí és l'altra manera, que fa el mateix sense mentir:
 *
 *   1 · **La reserva.** Una llista pública que diu quin `@nick` es guarda per a
 *       quin fundador. No hi ha cap fitxa publicada: només la reserva.
 *   2 · **La invitació.** Un codi que l'autor dona a la persona. Obre el
 *       directori amb el seu nick ja posat i amb el cartell que explica què és.
 *   3 · **L'alta.** La persona es fa la clau al seu navegador i publica **la
 *       seva** fitxa, signada per ella. Fins aquí no existeix res al seu nom.
 *
 * ── El que això NO és, i s'ha de dir a la cara ──────────────────────────────
 * Una reserva **no bloqueja el nick a ningú**. No pot: no hi ha registre de
 * noms i no n'hi pot haver, perquè qui reparteix noms mana i aquesta xarxa no
 * té ningú que mani —és la regla que ja governa `avisNick()`. La reserva és
 * una **declaració pública de l'autor de l'obra**, comprovable perquè és al
 * repositori; no és un cadenat. Vendre-la com un cadenat seria prometre una
 * cosa que el primer que provés de saltar-se-la desmentiria.
 *
 * ── Els codis ───────────────────────────────────────────────────────────────
 * Al repositori **només hi ha el hash** de cada codi. El codi el guarda l'autor
 * i el dona a mà. Si el codi hi fos, seria públic i no identificaria ningú.
 *
 *   node SOS/tools/build-convits.js --nou mazinguer
 *       encunya un codi per a aquell nick, l'ensenya **un sol cop** amb
 *       l'enllaç fet, i escriu la línia que s'ha d'enganxar a RESERVES.
 *
 * ── Ús ──────────────────────────────────────────────────────────────────────
 *   node SOS/tools/build-convits.js            escriu el bloc a online.html
 *   node SOS/tools/build-convits.js --check    falla si està vell o incoherent
 */
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { createHash, randomBytes } = require('node:crypto');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const SOS = join(ARREL, 'SOS');
const CHECK = process.argv.includes('--check');
const NOU = process.argv.indexOf('--nou');

const sha = s => createHash('sha256').update(String(s), 'utf8').digest('hex');

/* ══ LES RESERVES ════════════════════════════════════════════════════════════
   Un nick per fundador. El fundador ha de ser de `COMANDO_FOUNDERS` —la llista
   que ja mana a l'app— i el nick es declara aquí perquè triar com es diu algú
   és una decisió, no una cosa que es dedueixi d'un nom propi.

   `hash` és el sha256 del codi d'invitació. Buit vol dir **encara no
   encunyat**: la reserva existeix i el codi no, i la pàgina ho pot dir sense
   fingir. S'omple amb `--nou <nick>`. */
const RESERVES = [
  { heroi: 'Mazinguer',          nick: 'mazinguer',   hash: '' },
  { heroi: 'Horacio Motomachi',  nick: 'horacio',     hash: '' },
  { heroi: 'Guiri-Guay',         nick: 'guiriguay',   hash: '' },
  { heroi: 'Purpleman',          nick: 'purpleman',   hash: '' },
  { heroi: 'La Medusa Andaluza', nick: 'medusa',      hash: '' },
  { heroi: 'Barbamuda',          nick: 'barbamuda',   hash: '' },
  { heroi: 'El Aviador',         nick: 'aviador',     hash: '' },
  { heroi: 'Afrodito',           nick: 'afrodito',    hash: '' },
  { heroi: 'Electroplasman',     nick: 'electroplasman', hash: '' },
  { heroi: 'Pigmentón',          nick: 'pigmenton',   hash: '' },
  { heroi: 'Reciclator',         nick: 'reciclator',  hash: '' },
  { heroi: 'Supergerminador',    nick: 'supergerminador', hash: '' }
];

/* La normalització ha de ser **la mateixa** que la del directori, i aquí està
   copiada. Una còpia és exactament el que aquest repositori evita, i per això
   més avall hi ha la comprovació que la caça: es llegeix `normNick` de
   `online.html`, se n'esborren els espais i es compara amb aquesta.

   Si divergissin no petaria res. Passaria això: la invitació obriria el
   formulari amb un nick **que no és el reservat** —un guió de més, un tall a
   20 en comptes de 24— i tothom veuria un nom que hi és, només que un altre.
   La reserva quedaria sense efecte i ningú se n'adonaria. */
const NORM_COS = "String(s||'').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')"
  + ".replace(/[^a-z0-9-]+/g,'-').replace(/-+/g,'-').replace(/^-+|-+$/g,'').slice(0,20)";
const normNick = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').slice(0, 20);

/* ══ LECTURA DE LA FONT ══════════════════════════════════════════════════════ */
const APP = readFileSync(join(SOS, 'index.html'), 'utf8');
const FUNDADORS = [...(APP.match(/^const COMANDO_FOUNDERS=\[[\s\S]*?\n\];/m) || [''])[0]
  .matchAll(/hero:'((?:[^'\\]|\\.)*)'/g)].map(m => m[1].replace(/\\'/g, "'"));

let fails = 0;
const bad = m => { fails++; console.log('  ✗ ' + m); };

if (!FUNDADORS.length) { console.log('✗ no es pot llegir COMANDO_FOUNDERS de SOS/index.html'); process.exit(1); }

/* ══ ENCUNYAR UN CODI ════════════════════════════════════════════════════════ */
if (NOU >= 0) {
  const quin = normNick(process.argv[NOU + 1] || '');
  const r = RESERVES.find(x => x.nick === quin);
  if (!r) { console.log(`✗ no hi ha cap reserva per a @${quin || '(res)'}`); process.exit(1); }
  /* 16 bytes en base32-ish: prou llarg per no endevinar-lo i prou curt per
     dictar-lo per telèfon sense odiar-te. */
  const codi = randomBytes(10).toString('hex');
  console.log(`\nCodi per a @${r.nick} · ${r.heroi}\n`);
  console.log(`  Enllaç:  https://teamtowershuma.com/SOS/online.html#convit=${codi}`);
  console.log(`  Codi:    ${codi}`);
  console.log(`\nEnganxa aquesta línia a RESERVES, dins de SOS/tools/build-convits.js:\n`);
  console.log(`  { heroi: '${r.heroi.replace(/'/g, "\\'")}', nick: '${r.nick}', hash: '${sha(codi)}' },`);
  console.log(`\nEl codi no torna a sortir. Al repositori hi va el hash i prou.\n`);
  process.exit(0);
}

/* ══ COMPROVACIONS DE LA DECLARACIÓ ══════════════════════════════════════════ */
RESERVES.forEach(r => {
  if (!FUNDADORS.includes(r.heroi))
    bad(`la reserva @${r.nick} és per a ${r.heroi}, que no és a COMANDO_FOUNDERS`);
  if (r.nick !== normNick(r.nick))
    bad(`el nick @${r.nick} no està normalitzat: al directori quedaria @${normNick(r.nick)}`);
  if (r.hash && !/^[0-9a-f]{64}$/.test(r.hash))
    bad(`el hash de @${r.nick} no és un sha256 hexadecimal`);
  /* Un codi en clar al repositori seria un codi públic, i llavors no
     identificaria ningú: qualsevol que llegís el fitxer podria fer-lo servir. */
  if (r.codi) bad(`la reserva @${r.nick} porta el codi en clar: al repositori hi va el hash i prou`);
});
/* La comprovació que fa que la còpia de dalt sigui segura. Es podria comparar
   el text de les dues funcions, i seria un error: el directori escriu el rang
   d'accents amb els caràcters literals i aquí van escapats: mateixa cosa, dues
   grafies. Una guarda que acusa una diferència que no en és s'acaba silenciant,
   i llavors ja no vigila res.

   Es compara **el que fan**, no com estan escrites: es construeix la funció del
   directori del seu propi codi font i totes dues passen les mateixes proves. El
   dia que algú canviï el tall de 20 caràcters o afegeixi un caràcter permès
   allà, això peta aquí —abans que una invitació obri el formulari amb un nick
   que no és el reservat. */
const DIR = readFileSync(join(SOS, 'online.html'), 'utf8');
const cosDir = (DIR.match(/function normNick\(s\)\{\s*return([\s\S]*?);\s*\}/) || [, ''])[1];
if (!cosDir) bad('no es troba `normNick` a online.html');
else {
  let normDir = null;
  try { normDir = new Function('s', 'return ' + cosDir + ';'); }
  catch (e) { bad('el `normNick` d\'online.html no es pot llegir: ' + e.message); }
  if (normDir) {
    const PROVES = ['Mazinguer', '@horacio', 'Guiri-Guay', 'La Medusa Andaluza', 'Pigmentón',
      'MARTA  vidal', '--x--', 'àèíòú', 'Súper Germinador de Vilafranca del Penedès',
      'a_b.c d', '', '   ', 'AFRODITO'];
    const difs = PROVES.filter(p => normDir(p) !== normNick(p));
    if (!difs.length) console.log(`  · la normalització del nick fa el mateix que la del directori (${PROVES.length} proves)`);
    else bad('la normalització del nick d\'aquest generador ja no fa el mateix que la del directori: '
      + difs.map(p => `«${p}» → directori «${normDir(p)}», aquí «${normNick(p)}»`).join('; '));
  }
}

const nicks = RESERVES.map(r => r.nick);
const dups = nicks.filter((x, i) => nicks.indexOf(x) !== i);
if (dups.length) bad(`nick reservat dues vegades: ${[...new Set(dups)].join(', ')}`);
const herois = RESERVES.map(r => r.heroi);
const dupsH = herois.filter((x, i) => herois.indexOf(x) !== i);
if (dupsH.length) bad(`fundador amb dues reserves: ${[...new Set(dupsH)].join(', ')}`);
if (fails) { console.log(`\n❌ ${fails} problema${fails === 1 ? '' : 's'} a les reserves.`); process.exit(1); }

/* ══ EL BLOC QUE VA AL DIRECTORI ═════════════════════════════════════════════ */
const bloc = () =>
  '/* Els nicks que el Comando es guarda per als seus fundadors. Generat per\n' +
  '   SOS/tools/build-convits.js · no s\'edita a mà.\n' +
  '   `h` és el sha256 del codi d\'invitació; el codi no és aquí i no hi pot ser.\n' +
  '   `h` buit vol dir que la reserva existeix i el codi encara no s\'ha encunyat.\n' +
  '   Reservar **no bloqueja el nick a ningú**: no hi ha registre de noms. És una\n' +
  '   declaració pública de l\'autor de l\'obra, i es pot comprovar perquè és al\n' +
  '   repositori. */\n' +
  'const CONVITS=[\n' +
  RESERVES.map(r => `  {nick:'${r.nick}',heroi:'${r.heroi.replace(/'/g, "\\'")}',h:'${r.hash}'}`).join(',\n') +
  '\n];';

const OBRE = '/*CONVITS*/', TANCA = '/*/CONVITS*/';
function posa(html) {
  const i = html.indexOf(OBRE), k = html.indexOf(TANCA);
  if (i < 0 || k < i) return null;
  return html.slice(0, i) + OBRE + '\n' + bloc() + '\n' + html.slice(k);
}

const md = () => `# Els nicks reservats del Comando

> Generat per \`SOS/tools/build-convits.js\`. No l'editis a mà: edita el generador.

Una **reserva** diu que un \`@nick\` del directori es guarda per a un fundador del
Comando. **No hi ha cap fitxa publicada al seu nom**: al directori cada fitxa la
signa qui la fa, i signar-ne una per algú altre seria trencar l'única cosa que fa
que aquest directori valgui res.

Reservar **no bloqueja el nick a ningú**. No hi ha registre de noms i no n'hi pot
haver —qui reparteix noms mana, i aquesta xarxa no té ningú que mani. La reserva
és una declaració pública de l'autor, comprovable perquè és aquí.

## Com va

1. L'autor encunya el codi: \`node SOS/tools/build-convits.js --nou <nick>\`. El
   codi surt **un sol cop**; al repositori hi va el seu sha256.
2. La persona obre l'enllaç \`online.html#convit=<codi>\`. El directori
   comprova el hash, li obre el formulari amb el nick posat i li diu què és això.
3. La persona es fa la clau al seu navegador i publica **la seva** fitxa,
   signada per ella. Fins aquí no existia res al seu nom.

## Les reserves

| Nick | Fundador | Codi encunyat |
|---|---|---|
${RESERVES.map(r => `| \`@${r.nick}\` | ${r.heroi} | ${r.hash ? 'sí' : '**encara no**'} |`).join('\n')}

${RESERVES.filter(r => !r.hash).length
    ? `**${RESERVES.filter(r => !r.hash).length} reserves encara no tenen codi.** Existeixen i la pàgina ho diu; ` +
      'per encunyar-los cal l\'autor, perquè el codi no pot passar pel repositori.'
    : 'Totes les reserves tenen el codi encunyat.'}
`;

const fPag = join(SOS, 'online.html');
const fMd = join(SOS, 'knowledge', 'vision', 'comando-convits.md');

if (CHECK) {
  console.log('\nGuarda dels convits · les reserves surten d\'un sol lloc');
  let mal = 0;
  const pagina = readFileSync(fPag, 'utf8');
  const nou = posa(pagina);
  if (nou == null) { mal++; console.log(`  ✗ a online.html hi falten les marques ${OBRE} … ${TANCA}`); }
  else if (nou !== pagina) { mal++; console.log('  ✗ online.html està vell: corre `node SOS/tools/build-convits.js`'); }
  else console.log(`  ✓ les ${RESERVES.length} reserves de online.html quadren amb el generador`);
  if (!existsSync(fMd) || readFileSync(fMd, 'utf8') !== md()) {
    mal++; console.log('  ✗ knowledge/vision/comando-convits.md està vell');
  } else console.log('  ✓ i el document de les reserves també');
  console.log(mal ? `\n❌ ${mal} problema${mal === 1 ? '' : 's'}.` : '\n✅ Els convits quadren.');
  process.exit(mal ? 1 : 0);
}

const pagina = readFileSync(fPag, 'utf8');
const nou = posa(pagina);
if (nou == null) { console.log(`✗ a online.html hi falten les marques ${OBRE} … ${TANCA}`); process.exit(1); }
if (nou !== pagina) writeFileSync(fPag, nou);
writeFileSync(fMd, md());
console.log(`✅ Convits escrits · ${RESERVES.length} reserves, ` +
  `${RESERVES.filter(r => r.hash).length} amb codi encunyat`);

module.exports = { RESERVES, normNick };
