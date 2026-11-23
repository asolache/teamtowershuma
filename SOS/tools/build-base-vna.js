#!/usr/bin/env node
/* La base única de mapes de valor · SOS/knowledge/vna/base.json (15/11/2026)
 * ─────────────────────────────────────────────────────────────────────────
 * L'Àlvar: «tenemos que ser un skill con una base de datos… todos los mapas de
 * valor en función del tipo de sector, de actividad, de rol», i «de los 14
 * oficios, ¿cuántos oficios hay?». El 02/11 el banc de mapes ja va mesurar que
 * amb qualsevol prompt i qualsevol model el mapa es queda prop de 3 sobre 5: el
 * sostre és que la IA no parteix del que ja sabem.
 *
 * Aquí es junta, sense copiar, tot el que sabem en una sola base:
 *   · peces    · els models, sectors i oficis de SOS/lib/models-mapa.js, els
 *                oficis generats (base/oficis-generats.json), els dominis i
 *                sectors del SOS antic (base/fonts/sos-antic.json) i els casos
 *                del banc (banc-mapes/casos.json), en un sol format.
 *   · cataleg  · les 651 classes d'activitat de la NACE 2.1 (la base de la
 *                CNAE-2025), cadascuna amb les peces que la cobreixen.
 *   · cobertura· quantes classes tenen una peça específica, quantes només el
 *                sector i quantes res. És el comptador del «pasar de nivel».
 *   · pendents · les classes sense peça específica, en l'ordre en què el
 *                generador (banc-mapes.mjs oficis --lot) les farà.
 * Cada intercanvi porta la seva capa (kosha), de BaseVna.capa.
 *
 * La cobertura per paraules és aproximada i es diu així: una classe està
 * «coberta» quan el nom de la classe crida una peça per les seves paraules, o
 * quan un ofici generat en porta el codi. Només el codi és exacte.
 *
 * `--check` peta si base.json no és el que sortiria ara.
 * Ús:  node SOS/tools/build-base-vna.js [--check]
 */
'use strict';
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const MM = require('../lib/models-mapa.js');
const BV = require('../lib/base-vna.js');

const VNA = join(__dirname, '..', 'knowledge', 'vna');
const SORTIDA = join(VNA, 'base.json');
const llegeix = f => JSON.parse(readFileSync(f, 'utf8'));
const opt = f => (existsSync(f) ? llegeix(f) : null);
const llista = s => (Array.isArray(s) ? s : String(s || '').split(/[,·]/)).map(x => String(x).trim()).filter(Boolean);

/* L'ordre en què val la pena omplir el catàleg: primer on hi ha pimes i
   autònoms que arriben a /cliente/ (hostaleria, comerç, serveis a persones,
   educació, salut, cultura, professionals), l'administració i la indústria pesada al final. */
const PRIORITAT = ['I', 'G', 'T', 'Q', 'S', 'R', 'N', 'O', 'F', 'A', 'C', 'J', 'K', 'M', 'H', 'L', 'E', 'D', 'B', 'P', 'U', 'V'];
/* Divisions de la indústria que són ofici de petit taller: van abans que la resta de la C. */
const C_PETITA = ['10', '11', '13', '14', '15', '16', '18', '23', '25', '31', '32', '33'];

/* El codi exacte dels oficis que ja hi eren (revisat a mà el 15/11/2026 contra la NACE 2.1). */
const OFICI_CNAE = { ofici_escola_idiomes: ['85.59'], ofici_formacio_professionals: ['85.59'], ofici_celler: ['11.02'], ofici_restaurant: ['56.11', '56.30'],
  ofici_esdeveniments: ['82.30'], ofici_botiga: ['47.11'], ofici_estudi_creatiu: ['74.12'], ofici_salut_autonoma: ['86.93', '86.95', '86.96'],
  ofici_allotjament_rural: ['55.20'], ofici_serveis_professionals: ['70.20'], ofici_taller: ['95.29', '95.31'], ofici_coworking: ['68.20'],
  ofici_experiencies_turistiques: ['79.90'], ofici_productora_cultural: ['90.20', '90.39', '59.20'] };

function deModels() {
  const out = [];
  [['MODELS', 'model'], ['SECTORS', 'sector'], ['OFICIS', 'ofici']].forEach(([k, tipus]) => (MM[k] || []).forEach(M => {
    const m = M.es || M.ca, v = M.veda || {};
    out.push({ id: M.id, tipus, font: 'models-mapa.js', cnae: OFICI_CNAE[M.id] || [], nom: m.nom, diu: m.diu || '', paraules: String(M.paraules || '').indexOf(',') >= 0 ? llista(M.paraules) : String(M.paraules || '').split(/\s+/).filter(Boolean),
      centre: m.centre || null, rols: (m.roles || []).map(r => ({ nom: r })), intercanvis: m.pairs || [],
      intangibles: (m.pairs || []).reduce((a, p) => a.concat(p[2] === 'intangible' ? [p[3]] : [], p[4] === 'intangible' ? [p[5]] : []), []),
      preguntes: v.preguntes || [], senyals: v.senyals || [], falta: v.falta || [] });
  }));
  return out;
}

function deGenerats() {
  const g = opt(join(VNA, 'base', 'oficis-generats.json'));
  return ((g && g.oficis) || []).map(o => ({ id: 'gen_' + o.id, tipus: 'ofici', font: 'oficis-generats.json', estat: o.estat || 'esborrany', cnae: o.cnae ? [o.cnae] : [],
    nom: o.es.nom, diu: o.es.diu, paraules: llista(o.paraules), centre: o.es.centre, rols: o.es.roles.map(r => ({ nom: r })), intercanvis: o.es.pairs,
    intangibles: o.es.pairs.reduce((a, p) => a.concat(p[2] === 'intangible' ? [p[3]] : [], p[4] === 'intangible' ? [p[5]] : []), []),
    preguntes: (o.veda && o.veda.preguntes) || [], senyals: (o.veda && o.veda.senyals) || [], falta: (o.veda && o.veda.falta) || [], salut: o.salut == null ? null : o.salut, nota: o.nota || null }));
}

function deAntic() {
  const a = opt(join(VNA, 'base', 'fonts', 'sos-antic.json'));
  if (!a) return [];
  const dominis = a.dominis.map(d => {
    const nom = {}; d.rols.forEach(r => { nom[r.id] = r.nom; });
    return { id: 'dom_' + d.id, tipus: 'domini', font: 'sos-antic.json', nom: d.nom, paraules: d.paraules, sectors2009: d.sectors2009,
      rols: d.rols.map(r => ({ nom: r.nom, castell: r.castell })), intercanvis: [],
      fluxos: d.transaccions.filter(t => t && t.de).map(t => ({ de: nom[t.de] || t.de, a: nom[t.a] || t.a, tipus: t.tipus || null, que: t.que })),
      intangibles: d.intangibles, patrons: d.patrons, entregables: d.entregables };
  });
  const sectors = a.sectors.map(s => ({ id: 'sec2009_' + s.lletra2009, tipus: 'sector-antic', font: 'sos-antic.json', nom: s.nom, paraules: s.paraules, divisions: s.divisions,
    rols: s.rols.map(r => ({ nom: r.nom, castell: r.castell })), intercanvis: [], sops: s.sops.map(x => ({ id: x.id, nom: x.nom, diu: x.diu })),
    subtipus: s.subtipus.map(x => x.nom), intangibles: [] }));
  return dominis.concat(sectors);
}

const dins = (div, rang) => { if (!rang) return false; const [a, b] = String(rang).split('-'); return +div >= +a && +div <= +(b || a); };

function construeix() {
  const cat = llegeix(join(VNA, 'base', 'fonts', 'nace-2-1.json'));
  const peces = deModels().concat(deGenerats(), deAntic());
  const base = { peces };
  /* Les capes de cada intercanvi, ja calculades: la web no ha de pensar. */
  peces.forEach(p => {
    p.capes = (p.intercanvis || []).map(x => [BV.capa(x[3], x[2]), BV.capa(x[5], x[4])]);
    if (p.fluxos) p.fluxos.forEach(f => { f.capa = BV.capa(f.que, f.tipus); });
  });
  /* Els casos del banc i del SOS antic, a la peça que més s'hi assembla. */
  const casos = ((opt(join(VNA, 'banc-mapes', 'casos.json')) || {}).casos || []).map(c => ({ id: c.id, text: c.sector + ' · ' + c.inicial }))
    .concat(((opt(join(VNA, 'base', 'fonts', 'sos-antic.json')) || {}).casos || []).map(c => ({ id: c.id, text: c.diu })));
  const perId = new Map(peces.map(p => [p.id, p]));
  casos.forEach(c => { const t = BV.tria(base, c.text, 1)[0]; if (t) { const p = perId.get(t.id); (p.casos = p.casos || []).push(c.id); } });

  /* El catàleg i la cobertura. */
  /* Específica vol dir un ofici o un domini: un sector sencer («comerç») no diu prou d'una botiga de roba. */
  const especifiques = { peces: peces.filter(p => p.tipus === 'ofici' || p.tipus === 'domini') };
  const perCodi = {}; peces.forEach(p => (p.cnae || []).forEach(c => { (perCodi[c] = perCodi[c] || []).push(p.id); }));
  const classes = cat.classes.map(c => {
    const exactes = perCodi[c.codi] || [];
    const aprox = BV.tria(especifiques, c.es, 3).filter(t => t.punts >= 1 && exactes.indexOf(t.id) < 0).map(t => t.id);
    const sector = peces.filter(p => p.tipus === 'sector-antic' && dins(c.codi.slice(0, 2), p.divisions)).map(p => p.id);
    const nivell = exactes.length ? 'exacta' : aprox.length ? 'aproximada' : sector.length ? 'sector' : 'res';
    return { codi: c.codi, seccio: c.seccio, es: c.es, nivell, peces: exactes.concat(aprox), sector };
  });
  const compta = k => classes.filter(c => c.nivell === k).length;
  const perSeccio = {}; classes.forEach(c => { const s = perSeccio[c.seccio] = perSeccio[c.seccio] || { total: 0, especifica: 0 }; s.total++; if (c.nivell === 'exacta' || c.nivell === 'aproximada') s.especifica++; });
  const rang = c => { const i = PRIORITAT.indexOf(c.seccio); return (i < 0 ? 99 : i) * 2 + (c.seccio === 'C' && C_PETITA.indexOf(c.codi.slice(0, 2)) < 0 ? 1 : 0); };
  const pendents = classes.filter(c => c.nivell !== 'exacta').sort((a, b) => rang(a) - rang(b) || a.codi.localeCompare(b.codi)).map(c => c.codi);
  const tipus = {}; peces.forEach(p => { tipus[p.tipus] = (tipus[p.tipus] || 0) + 1; });

  return { nota: 'GENERAT per SOS/tools/build-base-vna.js. No s\'edita a mà: les fonts són models-mapa.js, base/oficis-generats.json, base/fonts/ i banc-mapes/casos.json. La cobertura «aproximada» surt de paraules; només «exacta» porta el codi.',
    versio: 1, cataleg: { font: cat.font, classes: classes.length },
    cobertura: { exacta: compta('exacta'), aproximada: compta('aproximada'), nomesSector: compta('sector'), res: compta('res'), perSeccio },
    tipus, capes: BV.CAPES, peces, classes, pendents };
}

const text = JSON.stringify(construeix(), null, 0).replace(/\},\{"id"/g, '},\n{"id"').replace(/\},\{"codi"/g, '},\n{"codi"') + '\n';
if (process.argv.includes('--check')) {
  const ara = existsSync(SORTIDA) ? readFileSync(SORTIDA, 'utf8') : '';
  if (ara !== text) { console.error('✗ SOS/knowledge/vna/base.json no està al dia. Refés-lo amb: node SOS/tools/build-base-vna.js'); process.exit(1); }
  console.log('✓ base.json al dia');
} else {
  writeFileSync(SORTIDA, text);
  const b = JSON.parse(text), c = b.cobertura;
  console.log('base.json: ' + b.peces.length + ' peces ' + JSON.stringify(b.tipus) + ' · ' + b.cataleg.classes + ' classes: ' + c.exacta + ' exactes, ' + c.aproximada + ' aproximades, ' + c.nomesSector + ' només sector, ' + c.res + ' res · ' + (text.length / 1024).toFixed(0) + ' KB');
  /* Qui decideix (MapaValor.decideix): les peces amb intercanvis que no ho diuen, per a la cua D del guardià. */
  { const MV = require('../lib/mapa-valor.js'), amb = b.peces.filter(p => (p.intercanvis || []).length);
    const no = amb.filter(p => !MV.decideix({ roles: p.rols.map(r => r.nom), pairs: p.intercanvis, centre: p.centre }).ok);
    console.log('qui decideix: ' + no.length + ' de ' + amb.length + ' peces amb intercanvis no ho diuen (' + no.filter(p => p.tipus === 'ofici').length + ' oficis)'); }
}
