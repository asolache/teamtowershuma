#!/usr/bin/env node
/* Guarda del perfil · un sol vocabulari per a tots els mapes de valor
 * ─────────────────────────────────────────────────────────────────────────
 * Les pàgines amb mapa de valor —`SOS/vna.html` i `SOS/compra.html`— deixen que
 * qui les llegeix declari **què hi pot posar**, i li proposen el rol que li
 * demana allò. El perfil es desa amb la mateixa clau a totes: qui l'ha omplert
 * a la colla castellera ja el porta posat al grup de consum.
 *
 * Això només se sosté si el vocabulari és **el mateix**. Si una pàgina té deu
 * capacitats i l'altra nou, dues persones amb el mateix perfil reben propostes
 * diferents, i no peta res: la que té la llista curta simplement ignora una
 * casella marcada. És la veda 109 amb la cara més silenciosa que té.
 *
 * Es comprova:
 *
 *   1. El bloc del perfil —clau, `APORTS` i els pesos— és **caràcter a
 *      caràcter el mateix** a totes les pàgines amb mapa.
 *   2. Cada rol de cada mapa té entrada a `CAL`: un rol sense demanda declarada
 *      no es proposaria mai a ningú, i el mapa tindria un forat invisible.
 *   3. Les capacitats que demana cada rol existeixen a `APORTS`.
 *   4. **El `per` de cada rol és una cita literal del mateix mapa** —un
 *      lliurament que aquell rol fa, o la seva lectura de poble—. Sense això,
 *      «aquest rol demana ordre» és una opinió escrita amb lletra d'eina.
 *
 * Veda 120.
 *
 * Ús:  node SOS/tools/check-perfil.js
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const llegeix = f => readFileSync(join(ARREL, 'SOS', f), 'utf8');
const PAGINES = ['vna.html', 'compra.html'];

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;
const tros = (txt, des, fins) => {
  const i = txt.indexOf(des); if (i < 0) return '';
  const j = txt.indexOf(fins, i); return j < 0 ? '' : txt.slice(i, j + fins.length);
};

console.log('\nGuarda del perfil · un sol vocabulari a tots els mapes de valor');

/* ── 1 · El bloc compartit, idèntic ─────────────────────────────────────── */
const blocs = PAGINES.map(f => {
  const t = llegeix(f);
  return { f, txt: t, bloc: tros(t, "const PERFIL_CLAU=", 'function desaPerfil(') };
});
if (blocs.some(b => !b.bloc)) {
  bad('alguna pàgina no porta el bloc del perfil: ' +
    blocs.filter(b => !b.bloc).map(b => b.f).join(', '));
} else if (new Set(blocs.map(b => b.bloc)).size === 1) {
  const n = (blocs[0].bloc.match(/\{id:'/g) || []).length;
  ok(`les ${blocs.length} pàgines amb mapa declaren el mateix perfil, amb ${n} capacitats`);
} else {
  /* Es diu ON divergeix, no només que divergeix: amb setanta línies iguals,
     «no coincideixen» és una pista inútil. */
  const [a, b] = blocs;
  const la = a.bloc.split('\n'), lb = b.bloc.split('\n');
  const i = la.findIndex((l, k) => l !== lb[k]);
  bad(`el bloc del perfil difereix entre ${a.f} i ${b.f}, a la línia ${i + 1} del bloc:\n` +
    `      ${a.f}: ${(la[i] || '(no hi és)').trim().slice(0, 90)}\n` +
    `      ${b.f}: ${(lb[i] || '(no hi és)').trim().slice(0, 90)}`);
}
const aports = new Set([...(blocs[0].bloc || '').matchAll(/\{id:'(\w+)',/g)].map(m => m[1]));
if (!aports.size) { bad('no s\'ha pogut llegir cap capacitat: la guarda no pot comprovar res'); }

/* ── 2, 3 i 4 · Cada rol demana el que el mapa diu que lliura ───────────── */
const cadenes = s => [...s.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(m => m[1]);
const RE_CAL = /(?:'((?:[^'\\]|\\.)*)'|(\w+)):\{aports:\[([^\]]*)\],per:'((?:[^'\\]|\\.)*)'\}/g;
/* La clau és el mapa MÉS el rol, no el rol sol. Dues dinàmiques poden tenir un
   rol amb el mateix nom —«Coordinació» hi és a totes dues— i lliurar coses
   diferents; aplanant-ho, el motiu d'una es comprovava contra els lliuraments
   de l'altra i la guarda es queixava d'unes dades que estaven bé. */
const calDe = txt => {
  const b = tros(txt, 'const CAL={', '\n};');
  const caps = [...b.matchAll(/^\s{2}(\w+):\{$/gm)];
  const llegeixTros = (t, din) => [...t.matchAll(RE_CAL)].map(m => ({
    din, rol: m[1] || m[2], clau: (din ? din + '/' : '') + (m[1] || m[2]),
    aports: cadenes('[' + m[3] + ']'), per: m[4] }));
  if (!caps.length) return llegeixTros(b, '');
  return caps.flatMap((m, k) => {
    const i = m.index, j = k + 1 < caps.length ? caps[k + 1].index : b.length;
    return llegeixTros(b.slice(i, j), m[1]);
  });
};

/* Els rols de cada pàgina, i el text que legitima demanar-los alguna cosa. */
function rolsDe(f, txt) {
  if (f === 'vna.html') {
    return [...txt.matchAll(/\{id:'(\w+)',x:\d+,y:\d+,lab:'\w+',curt:'((?:[^'\\]|\\.)*)',[\s\S]*?poble:'((?:[^'\\]|\\.)*)'\}/g)]
      .map(m => ({ clau: m[1], id: m[1], cites: [m[3]] }));
  }
  /* A compra.html el que legitima és el que aquell rol lliura de debò. */
  const b = tros(txt, 'const MAPA={', '\n};');
  const out = [];
  [...b.matchAll(/^\s{2}(\w+):\{$/gm)].forEach(m => {
    const i = b.indexOf(`  ${m[1]}:{`), j = b.indexOf('\n  },', i);
    const din = b.slice(i, j < 0 ? b.length : j);
    const roles = cadenes((din.match(/roles:\[([^\]]*)\]/) || [])[1] || '');
    const pares = [...din.slice(din.indexOf('pairs:[')).matchAll(/\[((?:'(?:[^'\\]|\\.)*',?\s*){6})\]/g)]
      .map(x => cadenes(x[1]));
    roles.forEach(r => out.push({
      clau: m[1] + '/' + r, id: r,
      cites: pares.filter(p => p[0] === r).map(p => p[3])
        .concat(pares.filter(p => p[1] === r).map(p => p[5]))
    }));
  });
  return out;
}

blocs.forEach(({ f, txt }) => {
  const cal = calDe(txt), rols = rolsDe(f, txt);
  if (!cal.length || !rols.length) {
    bad(`${f}: no s'han pogut llegir els rols o el que demanen — la guarda s'ha quedat cega`);
    return;
  }
  const ids = new Set(cal.map(c => c.clau));
  const sensCal = rols.filter(r => !ids.has(r.clau)).map(r => r.id);
  if (!sensCal.length) ok(`${f}: els ${rols.length} rols del mapa diuen què demanen`);
  else bad(`${f}: ${pl(sensCal.length, 'rol no diu què demana', 'rols no diuen què demanen')} ` +
    `i no es proposaria mai a ningú: ${sensCal.join(', ')}`);

  const inventats = cal.filter(c => c.aports.some(a => !aports.has(a)));
  if (!inventats.length) ok(`${f}: i tot el que demanen són capacitats del perfil`);
  else bad(`${f}: ${pl(inventats.length, 'rol demana', 'rols demanen')} una capacitat que no ` +
    `existeix: ${inventats.slice(0, 3).map(c => c.rol + ' → ' + c.aports.join(',')).join(' · ')}`);

  const buits = cal.filter(c => !c.aports.length);
  if (buits.length) bad(`${f}: ${pl(buits.length, 'rol no demana res', 'rols no demanen res')}: ` +
    buits.map(c => c.rol).join(', ') + ' — encaixaria amb qualsevol i no vol dir res');

  const perMap = new Map(rols.map(r => [r.clau, r.cites]));
  const inventat = cal.filter(c => {
    const cites = perMap.get(c.clau);
    return !cites || !cites.some(x => x && x.indexOf(c.per) >= 0);
  });
  if (!inventat.length) ok(`${f}: i el motiu de cada demanda és una cita literal del mapa`);
  else bad(`${f}: ${pl(inventat.length, 'rol es justifica', 'rols es justifiquen')} amb una frase ` +
    `que el mapa no diu: ` + inventat.slice(0, 3).map(c => `${c.rol} → «${c.per}»`).join(' · ') +
    ' — demanar-li res a una persona amb una frase inventada és una opinió amb lletra d\'eina');
});

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')} al perfil.`
  : '\n✅ Un sol vocabulari, i cada rol demana el que el mapa diu que lliura.');
process.exit(fails ? 1 : 0);
