#!/usr/bin/env node
/* El x % automatitzable d'un mapa de valor
 * ────────────────────────────────────────
 * Cada lliurament del mapa (el que un rol dona i el que l'altre torna) cau en
 * una de tres: el prepara la màquina, el fa una persona, o es decideix a la
 * visita perquè encara no sabem quin entregable demana.
 *
 * **La regla no és d'aquí.** Qui ho fa ho diu `fluxAutomatitzable`, la regla
 * del Kanban de l'app, llegida de `SOS/index.html` (o del kit
 * `vna-suport.html`, que la porta igual) i executada tal com és, com fa la
 * landing. Així el x % del lead, el de la landing i el de l'app són el mateix
 * número (veda 164). Un intangible i els diners són sempre de persona perquè
 * l'app ho diu, no perquè ho repeteixi aquest fitxer.
 *
 * Els productes de `SOS/knowledge/cervell/automatitzable.json` només posen nom
 * al que la màquina ja prepara: no pugen ni baixen cap veredicte.
 *
 * El tipus que l'etiqueta no diu es posa a mà a `mapa.tipus`
 * ({ "etiqueta": "comanda" }), com al Kanban. Amb l'esbós, la xifra és una
 * estimació (veda 156).
 *
 * El mapa es dibuixa amb el dibuixant de la landing (`dibuix`): cada fletxa
 * porta qui fa aquell lliurament, i la pàgina del lead marca les de la màquina.
 *
 *   node SOS/tools/automatitza.js mapa.json [--esbos] [--json] [--svg]
 */
'use strict';
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const { model } = require('./revisa-mapa.js');

const CATALEG = join(__dirname, '..', 'knowledge', 'cervell', 'automatitzable.json');
const pla = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/* Els mateixos trossos que llegeix `build-mapavalor.js`. A la matriu, de l'app;
   a un fill, del kit que hereta. */
const REGLA = (() => {
  const font = [join(__dirname, '..', 'index.html'), join(__dirname, '..', 'vna-suport.html')].find(existsSync);
  if (!font) throw new Error('No es troba la regla de l\'app (index.html o vna-suport.html)');
  const app = readFileSync(font, 'utf8');
  const tros = (inici, fi) => {
    const a = app.indexOf(inici), b = a < 0 ? -1 : app.indexOf(fi, a);
    if (b < 0) throw new Error('La regla de l\'app no es troba a ' + font + ': ' + inici);
    return app.slice(a, b + fi.length);
  };
  return new Function([
    tros('const normKind=', 'const isIntangible=k=>normKind(k)===\'intangible\';'),
    tros('const ENTREGABLES=[', '\n  return{pot:true,motiu:\'\',tipus:t};\n}')
  ].join('\n') + '\nreturn{ENTREGABLES,fluxAutomatitzable};')();
})();

/* A l'inici de paraula: «ruta» no ha de caure dins de «fruta». */
const res = patrons => patrons.map(x => new RegExp('(^|[^a-z0-9])' + pla(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
function productes(fitxer) {
  return JSON.parse(readFileSync(fitxer || CATALEG, 'utf8')).productes.map(p => Object.assign({}, p, { re: res(p.patrons) }));
}

/* Com `build-mapavalor.js`: màquina si l'app diu que pot; persona si és
   intangible o el seu tipus no surt d'una màquina; si no, a la visita. */
function qui(lliura, mena, tipus, prods) {
  const a = REGLA.fluxAutomatitzable({ kind: mena, label: lliura, entregable: tipus });
  const r = { qui: a.pot ? 'maquina' : a.motiu === 'intangible' || a.tipus ? 'persona' : 'visita', tipus: a.tipus || null, motiu: a.motiu };
  if (r.qui === 'maquina') {
    const t = pla(lliura), p = prods.find(p => p.re.some(re => re.test(t)));
    if (p) Object.assign(r, { producte: p.nom, origen: p.origen });
  }
  return r;
}

function mesura(entrada, opts) {
  const o = opts || {}, prods = productes(o.cataleg), m = model(entrada), tipus = (entrada && entrada.tipus) || {};
  const lliuraments = [];
  (m.pairs || []).forEach(p => {
    if (p[3]) lliuraments.push(Object.assign({ de: p[0], a: p[1], mena: p[2], que: p[3] }, qui(p[3], p[2], tipus[p[3]], prods)));
    if (p[5]) lliuraments.push(Object.assign({ de: p[1], a: p[0], mena: p[4], que: p[5] }, qui(p[5], p[4], tipus[p[5]], prods)));
  });
  const n = (l, q) => l.filter(x => x.qui === q).length;
  const pct = (l, q) => l.length ? Math.round(100 * n(l, q) / l.length) : 0;
  const perRol = {};
  lliuraments.forEach(l => { (perRol[l.de] = perRol[l.de] || []).push(l); });
  return {
    estimacio: !!o.esbos,
    total: lliuraments.length,
    maquina: n(lliuraments, 'maquina'), persona: n(lliuraments, 'persona'), visita: n(lliuraments, 'visita'),
    pct: pct(lliuraments, 'maquina'),
    rols: Object.keys(perRol).map(r => ({ rol: r, total: perRol[r].length, maquina: n(perRol[r], 'maquina'), persona: n(perRol[r], 'persona'), visita: n(perRol[r], 'visita') })),
    productes: [...new Set(lliuraments.filter(l => l.producte).map(l => l.producte))],
    lliuraments
  };
}

const TXT = {
  es: { tit: 'Lo que puede preparar la máquina', est: 'Estimación: sale del esbozo del mapa, no de un mapa revisado.',
    res: 'De las {t} entregas de tu red, la máquina puede preparar **{m}** ({p} %). **{h}** las hace una persona, y **{v}** las decidimos en la visita, porque todavía no sabemos qué entregable piden.',
    rol: 'Por rol', prod: 'Con qué', lli: 'Entrega a entrega', cap: 'Todavía ninguno.',
    q: { maquina: 'la prepara la máquina', persona: 'la hace una persona', visita: 'se decide en la visita' },
    m: { intangible: 'es un intangible', tipus: 'su tipo no sale de una máquina', visita: 'no sabemos qué entregable pide' },
    dib: 'El mapa de valor de tu red', dibD: '{r} roles y {t} entregas. Las que puede preparar la máquina ({m}) van marcadas.' },
  ca: { tit: 'El que pot preparar la màquina', est: "Estimació: surt de l'esbós del mapa, no d'un mapa revisat.",
    res: 'Dels {t} lliuraments de la teva xarxa, la màquina en pot preparar **{m}** ({p} %). **{h}** els fa una persona, i **{v}** els decidim a la visita, perquè encara no sabem quin entregable demanen.',
    rol: 'Per rol', prod: 'Amb què', lli: 'Lliurament a lliurament', cap: 'Encara cap.',
    q: { maquina: 'el prepara la màquina', persona: 'el fa una persona', visita: 'es decideix a la visita' },
    m: { intangible: 'és un intangible', tipus: 'el seu tipus no surt d\'una màquina', visita: 'no sabem quin entregable demana' },
    dib: 'El mapa de valor de la teva xarxa', dibD: '{r} rols i {t} lliuraments. Els que pot preparar la màquina ({m}) van marcats.' }
};

function aMarkdown(r, llengua) {
  const T = TXT[llengua] || TXT.ca;
  const per = l => l.qui === 'persona' ? (l.motiu === 'intangible' ? T.m.intangible : T.m.tipus + ' (' + l.tipus + ')')
    : l.qui === 'visita' ? T.m.visita : (l.tipus + (l.producte ? ', ' + l.producte : ''));
  return ['# ' + T.tit, ''].concat(r.estimacio ? ['> ' + T.est, ''] : [],
    [T.res.replace('{t}', r.total).replace('{m}', r.maquina).replace('{p}', r.pct).replace('{h}', r.persona).replace('{v}', r.visita), '', '## ' + T.rol, ''],
    r.rols.map(x => `- **${x.rol}**: ${x.maquina} · ${x.persona} · ${x.visita} (${T.q.maquina} · ${T.q.persona} · ${T.q.visita})`),
    ['', '## ' + T.prod, ''], r.productes.length ? r.productes.map(p => '- ' + p) : [T.cap],
    ['', '## ' + T.lli, ''], r.lliuraments.map(l => `- ${l.de} → ${l.a}: «${l.que}» · **${T.q[l.qui]}** · ${per(l)}`)).join('\n') + '\n';
}

/* El mapa en el format del dibuixant de la landing (`svgMapa`): un node per
   rol, repartits en cercle, i a cada parell qui fa cada lliurament (posicions
   10 i 11), tret de la mateixa `mesura` que dona el x %. Dibuixar-lo a part
   faria dues veritats sobre el mateix mapa. */
function xarxa(entrada, opts) {
  const o = opts || {}, T = TXT[o.llengua] || TXT.ca, m = model(entrada);
  const r = o.mesura || mesura(entrada, o);
  const rols = [...new Set((m.roles || []).concat(...(m.pairs || []).map(p => [p[0], p[1]])))];
  const id = nom => 'r' + rols.indexOf(nom);
  const qui = (de, a, que) => que ? ((r.lliuraments.find(l => l.de === de && l.a === a && l.que === que) || {}).qui || null) : null;
  return {
    nodes: rols.map(nom => ({ id: id(nom), nom })),
    parells: (m.pairs || []).map(p => [id(p[0]), id(p[1]), p[2], p[3], p[4], p[5], null, null, null, null, qui(p[0], p[1], p[3]), qui(p[1], p[0], p[5])]),
    titolSvg: m.abast ? T.dib + ': ' + m.abast : T.dib,
    descSvg: T.dibD.replace('{r}', rols.length).replace('{t}', r.total).replace('{m}', r.maquina),
    quiTxt: T.q
  };
}
function dibuix(entrada, opts) {
  const o = opts || {};
  return require('./build-mapavalor.js').svgMapa(xarxa(entrada, o), o.id || 'mvLead');
}

module.exports = { mesura, aMarkdown, productes, xarxa, dibuix, TXT, ENTREGABLES: REGLA.ENTREGABLES };

if (require.main === module) {
  const a = process.argv.slice(2);
  if (!a[0]) { console.error('Ús: node SOS/tools/automatitza.js mapa.json [--esbos] [--json] [--svg]'); process.exit(2); }
  const e = JSON.parse(readFileSync(a[0], 'utf8'));
  if (a.includes('--svg')) { console.log(dibuix(e)); process.exit(0); }
  const r = mesura(e, { esbos: a.includes('--esbos') });
  console.log(a.includes('--json') ? JSON.stringify(r, null, 2) : aMarkdown(r, 'ca'));
}
