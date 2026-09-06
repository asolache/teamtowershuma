#!/usr/bin/env node
/* Guarda de les dues dinàmiques fundacionals · que la part incòmoda no marxi
 * ─────────────────────────────────────────────────────────────────────────────
 * El banc de temps i la biblioteca de les coses són les dues dinàmiques que
 * qualsevol entén de seguida, i per això són les que més fàcilment acaben
 * explicades com un fullet: què és, que bonic, apunta't.
 *
 * El que fa útils aquestes dues pàgines no és la part bonica —aquella se
 * l'inventa qualsevol— sinó **la part que ningú escriu**:
 *
 *   · Al banc de temps, que **un saldo molt positiu és un avís i no una
 *     medalla**, i que l'hora la confirma qui la rep.
 *   · A la biblioteca, **què es fa el dia que una cosa es trenca o no torna**,
 *     i que el valor d'accés **no és una compra evitada**.
 *
 * Aquestes quatre coses són les primeres que cauen el dia que algú escurça la
 * pàgina, i les úniques que no es poden treure sense que la pàgina passi a
 * mentir per omissió. Per això tenen guarda.
 *
 * I una comprovació que no és de text: **les taules de la biblioteca han de
 * calcular el mateix que l'app**. Si divergissin, algú acordaria les normes
 * del seu barri amb una xifra i l'eina en registraria una altra.
 *
 * node SOS/tools/check-comuns.js */
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const SOS = join(ARREL, 'SOS');
const APP = readFileSync(join(SOS, 'index.html'), 'utf8');
const BDT = readFileSync(join(SOS, 'banc-temps.html'), 'utf8');
const BIB = readFileSync(join(SOS, 'biblioteca.html'), 'utf8');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;
const visible = t => t.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const VIS_BDT = visible(BDT), VIS_BIB = visible(BIB);

console.log('\nGuarda de les dues dinàmiques · banc de temps i biblioteca de les coses');

// ── 1 · La regla fonamental de cadascuna ─────────────────────────────────
/* Si això marxa, la pàgina pot seguir sent bonica i ja no explica la dinàmica:
   el que la fa ser el que és, és la regla. */
if (/una hora val una hora/i.test(VIS_BDT)) ok('el banc de temps diu la regla d\'or: una hora val una hora');
else bad('el banc de temps ja no diu que una hora val una hora — sense això no és un banc de temps');
if (/accés|acces/i.test(VIS_BIB) && /posseir|propietat/i.test(VIS_BIB))
  ok('i la biblioteca oposa l\'accés a la propietat, que és la seva');
else bad('la biblioteca ja no diu que l\'accés val més que posseir');

// ── 2 · La part incòmoda de cadascuna ────────────────────────────────────
/* Les quatre coses que es perden primer i que són l'única cosa que aquestes
   dues pàgines diuen i que no diu qualsevol fullet. */
const INCOMODES = [
  [VIS_BDT, /saldo molt positiu és un avís|no és una medalla/i,
    'el banc de temps: que un saldo molt positiu és un avís i no una medalla'],
  [VIS_BDT, /qui l'ha rebuda ho confirma|la persona que l'ha rebuda ho confirma/i,
    'el banc de temps: que l\'hora la confirma qui la rep'],
  [VIS_BIB, /es trenca|trencada/i,
    'la biblioteca: què es fa quan una cosa es trenca'],
  /* La pàgina ho diu dues vegades i de dues maneres —«no una compra evitada» al
     cos i «No és una compra evitada» a la fitxa que pinta el codi—, i el patró
     ha d'acceptar-les totes dues. Un patró més estret que el text acusa d'error
     una pàgina correcta, que és la manera més ràpida de fer que se silenciï
     una guarda (veda 115). */
  [VIS_BIB, /no (és )?una compra evitada/i,
    'la biblioteca: que el valor d\'accés no és una compra evitada']
];
const perdudes = INCOMODES.filter(([t, re]) => !re.test(t)).map(([, , q]) => q);
if (!perdudes.length) ok('les quatre coses incòmodes hi són, que és el que fa útils aquestes pàgines');
else bad(`${pl(perdudes.length, 'cosa incòmoda ha marxat', 'coses incòmodes han marxat')}: ` +
  perdudes.join(' · ') + ' — sense això la pàgina menteix per omissió');

// ── 3 · Les taules calculen el mateix que l'app ──────────────────────────
/* Es compara **el que surt**, no com està escrit: es refà el càlcul amb les
   taules de l'app i amb les de la pàgina sobre les mateixes entrades. Una
   diferència aquí vol dir que algú acordarà les normes del seu barri amb una
   xifra i l'eina en registrarà una altra. */
const taulaApp = re => {
  const m = APP.match(re); if (!m) return null;
  const o = {}; [...m[1].matchAll(/([a-z_]+):([\d.]+)/g)].forEach(x => { o[x[1]] = Number(x[2]); });
  return o;
};
const taulaPag = nom => {
  const m = BIB.match(new RegExp('const ' + nom + '=\\{([^}]*)\\}'));
  if (!m) return null;
  const o = {}; [...m[1].matchAll(/([a-z_]+):([\d.]+)/g)].forEach(x => { o[x[1]] = Number(x[2]); });
  return o;
};
const vApp = taulaApp(/const ORACLE_OBJECT_DEFAULTS=\{([^}]*)\}/);
const dApp = taulaApp(/const WEAR_RATES=\{([\s\S]*?)\}/);
const vPag = taulaPag('VALORS'), dPag = taulaPag('DESGAST');
if (!vApp || !dApp || !vPag || !dPag) bad('no es poden llegir les taules de valor i desgast');
else {
  /* L'app: valor base o el d'«altres», depreciat per anys amb terra al 30 %. */
  const appVal = (tip, anys) => {
    const base = vApp[tip] !== undefined ? vApp[tip] : vApp.altres;
    return Math.round(base * Math.max(0.3, 1 - 0.1 * anys));
  };
  const appTaxa = tip => dApp[tip] !== undefined ? dApp[tip] : dApp.altres;
  const pagVal = (tip, anys) => {
    const base = vPag[tip] !== undefined ? vPag[tip] : vPag.altres;
    return Math.round(base * Math.max(0.3, 1 - 0.1 * anys));
  };
  const pagTaxa = tip => dPag[tip] !== undefined ? dPag[tip] : dPag.altres;
  const tipus = [...new Set(Object.keys(vApp).concat(Object.keys(vPag), Object.keys(dApp), Object.keys(dPag)))];
  const difs = [];
  tipus.forEach(t => [0, 3, 7, 20].forEach(a => {
    if (appVal(t, a) !== pagVal(t, a)) difs.push(`${t}/${a} anys: app ${appVal(t, a)} €, pàgina ${pagVal(t, a)} €`);
    if (appTaxa(t) !== pagTaxa(t)) difs.push(`${t}: desgast app ${appTaxa(t)}, pàgina ${pagTaxa(t)}`);
  }));
  if (!difs.length) ok(`les ${tipus.length} tipologies calculen el mateix a la pàgina i a l'app`);
  else bad(`la pàgina i l'app no calculen igual: ${[...new Set(difs)].slice(0, 4).join(' · ')}`);
}

// ── 4 · Cap porta morta ──────────────────────────────────────────────────
[['banc-temps.html', BDT], ['biblioteca.html', BIB]].forEach(([nom, txt]) => {
  const dests = [...new Set([...txt.matchAll(/href="([^"]+)"/g)].map(m => m[1]))]
    .filter(h => !/^(https?:|mailto:|#)/.test(h));
  const morts = dests.filter(h => {
    const f = h.split('#')[0];
    const cami = f.startsWith('../') ? join(ARREL, f.slice(3)) : join(SOS, f);
    return !existsSync(cami);
  });
  if (!morts.length) ok(`els ${dests.length} destins de ${nom} existeixen`);
  else bad(`${pl(morts.length, 'enllaç mort', 'enllaços morts')} a ${nom}: ${morts.join(', ')}`);
});

// ── 5 · Cada pestanya té la seva pantalla ────────────────────────────────
/* Una pestanya que no obre res no peta: deixa la pàgina en blanc i qui la
   clica es pensa que s'ha trencat. */
[['banc-temps.html', BDT], ['biblioteca.html', BIB]].forEach(([nom, txt]) => {
  const tabs = [...txt.matchAll(/<button data-p="([a-z]+)"/g)].map(m => m[1]);
  const pans = [...txt.matchAll(/<div class="pan[^"]*" id="p([A-Za-z]+)"/g)].map(m => m[1].toLowerCase());
  const orfes = tabs.filter(t => !pans.includes(t));
  if (tabs.length && !orfes.length) ok(`les ${tabs.length} pestanyes de ${nom} obren una pantalla`);
  else bad(`a ${nom} hi ha ${orfes.length ? 'pestanyes que no obren res: ' + orfes.join(', ') : 'cap pestanya'}`);
});

// ── 6 · Les paraules que la guia de marca no deixa dir ───────────────────
const PROHIBIDES = [
  [/disruptiu|disruptiva/i, 'disruptiu'],
  [/solucions innovadores/i, 'solucions innovadores'],
  [/empoderament\b(?!\s+(de|per|dels|de les))/i, 'empoderament sense objecte']
];
const dites = [];
[['banc-temps.html', VIS_BDT], ['biblioteca.html', VIS_BIB]].forEach(([nom, v]) =>
  PROHIBIDES.forEach(([re, n]) => { if (re.test(v)) dites.push(`${nom}: ${n}`); }));
if (!dites.length) ok('cap paraula de la llista negra de la guia de marca');
else bad(`paraules prohibides: ${dites.join(', ')}`);

// ── 7 · Informatiu ───────────────────────────────────────────────────────
console.log(`  · ${Math.round(Buffer.byteLength(BDT) / 1024)} KB i ` +
  `${Math.round(Buffer.byteLength(BIB) / 1024)} KB`);

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} a les dues dinàmiques.`
  : '\n✅ Les dues dinàmiques diuen la seva regla, la part incòmoda hi és, i calculen com l\'app.');
process.exit(fails ? 1 : 0);
