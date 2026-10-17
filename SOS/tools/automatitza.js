#!/usr/bin/env node
/* El x % automatitzable d'un mapa de valor
 * ────────────────────────────────────────
 * Cada lliurament del mapa (el tangible que un rol dona i el que l'altre torna)
 * queda marcat com a automàtic (el fa el SOS o un producte del catàleg),
 * assistit (la màquina el prepara i una persona el decideix) o humà, amb el
 * motiu al costat. El x % és la part automàtica sobre el total, i també per rol
 * que lliura.
 *
 * Es mesura, no es promet (veda 156): el que no encaixa amb cap producte és
 * humà, i un intangible sempre ho és, perquè la confiança no la dona una
 * màquina. Un pagament o una factura també: només el dona per fet qui el rep,
 * com diuen l'app i la landing (PR #226). Si el mapa és un esbós, la xifra surt com a estimació.
 *
 * Els productes i els seus patrons són a `SOS/knowledge/cervell/automatitzable.json`.
 * Un producte nou adoptat al catàleg hi entra, i el x % de tots els mapes puja.
 *
 *   node SOS/tools/automatitza.js mapa.json [--esbos] [--json]
 */
'use strict';
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { model } = require('./revisa-mapa.js');

const CATALEG = join(__dirname, '..', 'knowledge', 'cervell', 'automatitzable.json');
const pla = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/* A l'inici de paraula: «ruta» no ha de caure dins de «fruta». */
const res = patrons => patrons.map(x => new RegExp('(^|[^a-z0-9])' + pla(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

function cataleg(fitxer) {
  const c = JSON.parse(readFileSync(fitxer || CATALEG, 'utf8'));
  return {
    persona: Object.assign({}, c.de_persona, { re: res(c.de_persona.patrons) }),
    productes: c.productes.map(p => Object.assign({}, p, { re: res(p.patrons) }))
  };
}
const productes = fitxer => cataleg(fitxer).productes;

const MOTIU = {
  intangible: { ca: 'és un intangible: el dona una persona', es: 'es un intangible: lo da una persona' },
  cap: { ca: 'cap producte del catàleg el fa encara', es: 'ningún producto del catálogo lo hace todavía' }
};

function classifica(lliura, tipus, cat) {
  if (/^i/.test(tipus || '')) return { mode: 'huma', motiu: MOTIU.intangible };
  const t = pla(lliura);
  /* Els diners són de persona, sempre: igual que a l'app i a la landing. */
  if (cat.persona.re.some(re => re.test(t))) return { mode: 'huma', motiu: { ca: cat.persona.diu, es: cat.persona.diu_es } };
  const p = cat.productes.find(p => p.re.some(re => re.test(t)));
  if (!p) return { mode: 'huma', motiu: MOTIU.cap };
  return { mode: p.mode, producte: p.nom, origen: p.origen, motiu: { ca: p.diu, es: p.diu_es || p.diu } };
}

function mesura(entrada, opts) {
  const o = opts || {}, cat = cataleg(o.cataleg), m = model(entrada);
  const lliuraments = [];
  (m.pairs || []).forEach(p => {
    if (p[3]) lliuraments.push(Object.assign({ de: p[0], a: p[1], tipus: p[2], que: p[3] }, classifica(p[3], p[2], cat)));
    if (p[5]) lliuraments.push(Object.assign({ de: p[1], a: p[0], tipus: p[4], que: p[5] }, classifica(p[5], p[4], cat)));
  });
  const pct = (l, mode) => l.length ? Math.round(100 * l.filter(x => x.mode === mode).length / l.length) : 0;
  const perRol = {};
  lliuraments.forEach(l => { (perRol[l.de] = perRol[l.de] || []).push(l); });
  return {
    estimacio: !!o.esbos,
    total: lliuraments.length,
    automatic: pct(lliuraments, 'automatic'),
    assistit: pct(lliuraments, 'assistit'),
    huma: lliuraments.length ? 100 - pct(lliuraments, 'automatic') - pct(lliuraments, 'assistit') : 0,
    rols: Object.keys(perRol).map(r => ({ rol: r, total: perRol[r].length, automatic: pct(perRol[r], 'automatic'), assistit: pct(perRol[r], 'assistit') })),
    productes: [...new Set(lliuraments.filter(l => l.producte).map(l => l.producte))],
    lliuraments
  };
}

const TXT = {
  es: { tit: 'Lo que se puede automatizar', est: 'Estimación: sale del esbozo del mapa, no de un mapa revisado.',
    res: '**{a} %** de lo que se entrega en tu red lo puede hacer el sistema solo, y **{s} %** más lo prepara para que tú lo decidas. El resto ({h} %) es trabajo de personas: ahí está lo estratégico y lo táctico.',
    rol: 'Por rol', prod: 'Con qué', lli: 'Entrega a entrega', aut: 'automático', ass: 'asistido', hum: 'humano', cap: 'Todavía ninguno.' },
  ca: { tit: 'El que es pot automatitzar', est: "Estimació: surt de l'esbós del mapa, no d'un mapa revisat.",
    res: "**{a} %** del que es lliura a la teva xarxa ho pot fer el sistema sol, i **{s} %** més ho prepara perquè tu ho decideixis. La resta ({h} %) és feina de persones: és on hi ha l'estratègic i el tàctic.",
    rol: 'Per rol', prod: 'Amb què', lli: 'Lliurament a lliurament', aut: 'automàtic', ass: 'assistit', hum: 'humà', cap: 'Encara cap.' }
};

function aMarkdown(r, llengua) {
  llengua = TXT[llengua] ? llengua : 'ca';
  const T = TXT[llengua], nom = { automatic: T.aut, assistit: T.ass, huma: T.hum };
  return ['# ' + T.tit, ''].concat(r.estimacio ? ['> ' + T.est, ''] : [],
    [T.res.replace('{a}', r.automatic).replace('{s}', r.assistit).replace('{h}', r.huma), '', '## ' + T.rol, ''],
    r.rols.map(x => `- **${x.rol}**: ${x.automatic} % ${T.aut}, ${x.assistit} % ${T.ass} (${x.total})`),
    ['', '## ' + T.prod, ''], r.productes.length ? r.productes.map(p => '- ' + p) : [T.cap],
    ['', '## ' + T.lli, ''], r.lliuraments.map(l => `- ${l.de} → ${l.a}: «${l.que}» · **${nom[l.mode]}**${l.producte ? ' (' + l.producte + ')' : ''} · ${l.motiu[llengua] || l.motiu.ca}`)).join('\n') + '\n';
}

module.exports = { mesura, aMarkdown, productes };

if (require.main === module) {
  const a = process.argv.slice(2);
  if (!a[0]) { console.error('Ús: node SOS/tools/automatitza.js mapa.json [--esbos] [--json]'); process.exit(2); }
  const r = mesura(JSON.parse(readFileSync(a[0], 'utf8')), { esbos: a.includes('--esbos') });
  console.log(a.includes('--json') ? JSON.stringify(r, null, 2) : aMarkdown(r, 'ca'));
}
