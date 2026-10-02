#!/usr/bin/env node
/* Les pàgines de l'arrel · el que s'hi pot afirmar, i d'on surt
 * ─────────────────────────────────────────────────────────────────────────────
 * `check-landing.js` vigila `index.html` i **no arriba a les pàgines de
 * l'arrel**, que són d'una maqueta anterior i no han passat per cap regla.
 * El resultat era això, trobat l'01/10/2026 mirant-les una per una:
 *
 *   · `clients.html` portava **tres testimonis amb cita atribuïda a càrrecs de
 *     Telefónica, Novartis i BBVA**. Els noms d'empresa sí que tenen font
 *     —`trajectoria.md` diu que van ser clients de TeamTowers— però **les cites
 *     no en tenien cap**. Posar paraules a la boca d'un càrrec d'un banc és una
 *     afirmació molt més forta que dir que va ser client, i aquella pàgina les
 *     publicava amb la seva foto i el seu càrrec.
 *   · I «100+ organitzacions transformades», «25+ països», «94 % de
 *     satisfacció». Quatre xifres rodones sense procedència.
 *   · `premsa.html`, el mateix: «50+ aparicions», «5M+ d'abast».
 *
 * Res d'això petava, i és el motiu d'aquest fitxer: **una pàgina que no té
 * guarda no és una pàgina que estigui bé, és una pàgina que ningú ha mirat.**
 *
 * ── Les tres regles, i per què aquestes ─────────────────────────────────────
 * **1 · Cap cita.** No «cap cita sense font» sinó **cap cita**: al coneixement
 * de la casa no hi ha ni una sola declaració de client recollida, o sigui que
 * qualsevol cita que aparegui en aquestes pàgines l'ha escrit algú de dins. El
 * dia que n'hi hagi una de debò, es posa la fila a `trajectoria.md` i es
 * relaxa aquesta regla **a posta**, que és diferent de no tenir-la.
 *
 * **2 · Cap xifra agregada sense font.** Un nombre gran i rodó és el que més
 * fàcil es repeteix i el que menys es pot defensar. Les que es permeten són les
 * que `trajectoria.md` pot sostenir, i es declaren aquí sota amb el motiu.
 *
 * **3 · Cap enllaç intern que no vagi enlloc.** Mitja generació del lloc s'ha
 * retirat i aquestes pàgines l'enllaçaven: val tant un fitxer que existeix com
 * una redirecció declarada a `_redirects`, i res més.
 *
 * Ús:  node SOS/tools/check-arrel.js
 */
'use strict';
const { readFileSync, existsSync, readdirSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;
const mostra = a => a.slice(0, 6).join(', ') + (a.length > 6 ? ` … (+${a.length - 6})` : '');

/* Les pàgines públiques de l'arrel. `index.html` té la seva guarda pròpia i
   `home-nova.html` és un esborrany amb `noindex`; la resta de l'arrel no és
   contingut i surt a `FORA_DEL_MENU_ARREL` de `build-nav.js`, amb el motiu. */
const EXCLOU = ['index.html', 'home-nova.html', 'finances.html', 'ia.html'];
const PAGINES = readdirSync(ARREL).filter(f => /\.html$/.test(f) && !EXCLOU.includes(f)).sort();

/* ══ LES XIFRES QUE ES PODEN DIR ═══════════════════════════════════════════
   Cada una amb la fila de `trajectoria.md` que la sosté. Afegir-ne una vol dir
   afegir-hi la font primer, que és tot el sentit d'aquesta taula. */
const XIFRES = {
  '32': 'els clients anomenats a trajectoria.md',
  '20': 'els anys de recorregut de TeamTowers',
  '2': 'les dues aplicacions de VNA a IKEA',
  '2007': 'l\'any de l\'article d\'El Periódico'
};

const cosDe = src => {
  const i = src.lastIndexOf('</style>');
  return (i < 0 ? src : src.slice(i)).replace(/<script[\s\S]*?<\/script>/g, '');
};

/* ── 1 · Cap cita de client ─────────────────────────────────────────────── */
{
  const amb = PAGINES.filter(f => {
    const cos = cosDe(readFileSync(join(ARREL, f), 'utf8'));
    return /class="testimonial-(card|content|author)"/.test(cos);
  });
  if (!amb.length) ok(`cap cita de client a les ${PAGINES.length} pàgines de l'arrel`);
  else bad(`${pl(amb.length, 'pàgina publica cites', 'pàgines publiquen cites')} de client `
    + `(${mostra(amb)}) — al coneixement de la casa no hi ha cap declaració recollida, `
    + 'o sigui que les ha escrit algú de dins i van atribuïdes a un tercer');
}

/* ── 2 · Cap xifra agregada sense font ──────────────────────────────────── */
{
  const dolentes = [];
  PAGINES.forEach(f => {
    const cos = cosDe(readFileSync(join(ARREL, f), 'utf8'));
    [...cos.matchAll(/class="stat-number"[^>]*>\s*([^<]+?)\s*</g)].forEach(m => {
      const n = m[1].trim();
      if (!XIFRES[n]) dolentes.push(`${f} → «${n}»`);
    });
  });
  if (!dolentes.length) ok(`${Object.keys(XIFRES).length} xifres declarades amb la seva font, i cap de més`);
  else bad(`${pl(dolentes.length, 'xifra', 'xifres')} sense font a l'arrel (${mostra(dolentes)}) `
    + '— una xifra sense procedència no la pot discutir qui la llegeix ni defensar qui la diu. '
    + 'O es declara a XIFRES amb la fila de trajectoria.md que la sosté, o se\'n va');
}

/* ── 3 · Cap enllaç intern cap a enlloc ─────────────────────────────────── */
{
  /* Les redireccions declarades. Val la regla sencera i val el comodí: una
     regla `/events/*` cobreix `/events/qualsevol-cosa`. */
  const red = existsSync(join(ARREL, '_redirects'))
    ? readFileSync(join(ARREL, '_redirects'), 'utf8').split('\n')
      .filter(l => l.trim() && !l.trim().startsWith('#'))
      .map(l => l.trim().split(/\s+/)[0])
    : [];
  const cobert = u => {
    if (red.includes(u)) return true;
    return red.some(r => r.endsWith('/*') && u.startsWith(r.slice(0, -1)));
  };
  const morts = [];
  PAGINES.forEach(f => {
    const src = readFileSync(join(ARREL, f), 'utf8');
    [...src.matchAll(/href="(?:https:\/\/teamtowershuma\.com)?(\/[^"#?]*)/g)].forEach(m => {
      const u = m[1];
      if (u === '/' || /\.(png|jpg|svg|webp|ico|css|js|pdf)$/i.test(u)) return;
      const fitxer = u.replace(/^\//, '');
      if (!fitxer || existsSync(join(ARREL, fitxer))) return;
      if (existsSync(join(ARREL, fitxer, 'index.html'))) return;
      if (cobert(u)) return;
      morts.push(`${f} → ${u}`);
    });
  });
  const unics = [...new Set(morts)];
  if (!unics.length) ok(`i tots els enllaços interns van a un fitxer o a una redirecció declarada`);
  else bad(`${pl(unics.length, 'enllaç', 'enllaços')} cap a enlloc (${mostra(unics)}) `
    + '— mitja generació del lloc s\'ha retirat i això dona un 404 a qui el clica');
}

/* ── 4 · Qui signa ──────────────────────────────────────────────────────────
   «TeamTowers és qui signa; TeamTowers Humà és què fa al territori. Mai es fan
   servir com a sinònims dins d'una mateixa frase.» La guarda no sap jutjar una
   frase, però sí la cosa que es va trobar i que és comprovable: el `<title>` i
   l'autor d'una pàgina de món corporatiu signats «Humà». Es mira només que la
   pàgina **declari** un autor, perquè una pàgina sense autor no es pot revisar. */
{
  const sense = PAGINES.filter(f => !/<meta name="author"/.test(readFileSync(join(ARREL, f), 'utf8')));
  if (!sense.length) ok(`i les ${PAGINES.length} diuen qui les signa`);
  else bad(`${pl(sense.length, 'pàgina sense autor', 'pàgines sense autor')} declarat: ${mostra(sense)}`);
}

console.log(`  · ${PAGINES.length} pàgines de contingut a l'arrel: ${PAGINES.join(', ')}`);
console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} a les pàgines de l'arrel.`
  : '\n✅ Les pàgines de l\'arrel només afirmen el que poden sostenir.');
process.exit(fails ? 1 : 0);
