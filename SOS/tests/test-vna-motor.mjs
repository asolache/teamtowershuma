/* El motor de l'editor del mapa de valor · sense navegador
 * ────────────────────────────────────────────────────────
 * El diagnòstic i el model de l'editor visual són funcions pures escrites a
 * `SOS/vna-suport.html`, entre les marques VS-DIAG i VS-MODEL. Aquí s'extreuen
 * de la pàgina **tal com hi són** —amb el motor de regles generat, VS-MOTOR— i
 * es proven sense DOM ni dependències. És l'única guarda de l'editor que corre
 * al CI, perquè els tests de Playwright no hi corren.
 *
 * No fa `require` de build-vna-suport.js: carregar-lo reescriuria fitxers.
 *
 *   node SOS/tests/test-vna-motor.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(DIR, '..', 'vna-suport.html'), 'utf8');
const bloc = nom => {
  const o = '/*' + nom + '*/', t = '/*/' + nom + '*/', a = html.indexOf(o), b = html.indexOf(t);
  if (a < 0 || b <= a) throw new Error('Falta el bloc ' + nom + ' a vna-suport.html');
  return html.slice(a, b);
};
const k0 = html.indexOf('const EXEMPLE = {'), k1 = html.indexOf('};', k0) + 2;
const EXEMPLE = new Function(html.slice(k0, k1).replace('const EXEMPLE =', 'return'))();
const { revisa, fluxos, creaDiagnosi, creaModel } = new Function('\'use strict\';\n' + bloc('VS-MOTOR') + '\n' + bloc('VS-DIAG') + '\n'
  + bloc('VS-MODEL') + '\nreturn { revisa, fluxos, tocats, creaDiagnosi, creaModel };')();
const motor = { revisa, fluxos };
const D = creaDiagnosi(motor);
const M = creaModel({ fluxos, revisa, normNom: D.normNom });

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const troba = (r, codi, f) => r.troballes.filter(t => t.codi === codi && (!f || f(t)));
const te = (r, codi, f) => troba(r, codi, f).length > 0;
const clona = o => JSON.parse(JSON.stringify(o));
const congela = o => { Object.freeze(o); Object.values(o).forEach(v => { if (v && typeof v === 'object') congela(v); }); return o; };
const J = JSON.stringify;
const deLinies = o => M.llegeixTextos(M.aTextos(o));
const celler = () => deLinies(EXEMPLE);

/* La lectura i l'escriptura d'abans, per comparar-hi (M1). */
const menaRef = x => /^i/i.test((x || '').trim()) ? 'intangible' : 'tangible';
function deLiniesRef(o) {
  const sp = l => l.split('|').map(x => x.trim());
  const m = { abast: o.abast || '', roles: (o.rols || []).slice() };
  m.pairs = (o.parells || []).map(l => { const c = sp(l); return [c[0] || '', c[1] || '', c[2] ? menaRef(c[2]) : '', c[3] || '', c[4] ? menaRef(c[4]) : '', c[5] || '']; });
  m.processos = (o.processos || []).map(l => { const c = sp(l); return { id: c[0] || '', nom: c[1] || '', d: c[2] || '' }; });
  m.seq = {};
  (o.seq || []).forEach(l => { const c = sp(l); if (!c[0]) return; m.seq[c[0]] = (c[1] || '').toLowerCase() === 'sempre' ? 'sempre' : [c[1] || '', Number(c[2] || 1)]; });
  m.troballes = (o.troballes || []).map(l => { const c = sp(l); return { t: c[0] || '', d: c[1] || '' }; });
  return m;
}
function carregaRef(o) {
  const menaCurta = x => /^i/i.test(x || '') ? 'i' : x ? 't' : '';
  const linia = x => Array.isArray(x) ? x.join(' | ') : String(x);
  const roles = o.roles || o.rols || [], pairs = o.pairs || o.parells || [], seq = o.seq || {};
  return { abast: o.abast || '', rols: roles.join('\n'),
    parells: pairs.map(p => typeof p === 'string' ? p : [p[0], p[1], menaCurta(p[2]), p[3], menaCurta(p[4]), p[5]].map(x => x || '').join(' | ')).join('\n'),
    processos: (o.processos || []).map(p => typeof p === 'string' ? p : [p.id, p.nom, p.d].map(x => x || '').join(' | ')).join('\n'),
    seq: (Array.isArray(seq) ? seq : Object.entries(seq).map(([k, v]) => v === 'sempre' ? k + ' | sempre' : k + ' | ' + linia(v))).join('\n'),
    troballes: (o.troballes || []).map(x => typeof x === 'string' ? x : [x.t, x.d].map(y => y || '').join(' | ')).join('\n') };
}
const nv = t => Object.assign(M.nivellBuit(), { t: Object.assign(M.nivellBuit().t, t) });

console.log('\nEl motor de l\'editor del mapa de valor');

/* ══ T · El motor de diagnòstic (els casos del prototip, tal qual) ═══════ */
console.log('\nT0 · El celler de la consola');
{ const r = D.diagnostica(celler()), Mm = r.nivells[0].metriques;
  ok(!r.provisional, 'passa les dures: el diagnòstic no és provisional');
  ok(Mm.densitat === 33 && Mm.concentracio === 29 && Mm.pctI === 50 && Mm.hub === 'Qui rep i explica', `mètriques ${Mm.densitat}/${Mm.concentracio}/${Mm.pctI}/${Mm.hub}`);
  ok(te(r, 'regla-densitat', t => t.gravetat === 'baixa' && t.font.llindar.de === 'casa'), 'regla 6 com a troballa baixa, llindar de la casa');
  ok(J(troba(r, 'regla-densitat')[0].resalta.regions) === J([['Qui rep i explica', 'El distribuïdor'], ['Qui rep i explica', 'La vinya i el veïnat'], ['Qui fa el vi', 'El poble']]), 'regions no preguntades: 3 parells entre els més actius');
  ok(J(Mm.estructura.articulacions) === '["Qui fa el vi","Qui rep i explica"]', 'colls estructurals: Qui fa el vi i Qui rep i explica');
  ok(te(r, 'coll-proces', t => t.nivell.rol === 'Qui rep i explica' && t.evidencia.proces === 'visita'), 'coll del procés «La visita»: Qui rep i explica (4/4 passos)');
  ok(te(r, 'punt-unic', t => t.nivell.rol === 'Qui fa el vi'), 'punt únic: Qui fa el vi és a tots tres processos');
  ok(te(r, 'sense-reconeixement', t => t.nivell.rol === 'El poble' && t.gravetat === 'mitjana'), 'El poble dona 2 intangibles i no en rep cap');
  ok(te(r, 'invisible', t => t.nivell.rol === 'El poble'), 'res del que dona El poble té pas');
  ok(troba(r, 'conversio').length === 1 && te(r, 'conversio', t => t.evidencia.fluxos[0] === 'El poble→Qui rep i explica' && t.conversio.punts === 3), 'conversió: «el lloc» (3 punts) i només aquest');
  ok(troba(r, 'espera').length === 2, 'dues esperes: visita pas 3 i poble pas 2');
  ok(te(r, 'sense-seq', t => t.evidencia.fluxos.includes('Qui rep i explica→El poble') && t.evidencia.fluxos.includes('El poble→El visitant')), 'dos lliuraments sense lloc a la seqüència');
  ok(te(r, 'sense-retorn', t => t.gravetat === 'nota' && t.evidencia.rols[0] === 'Qui fa el vi'), 'La visita: el retorn a qui comença és «sempre» → nota');
  ok(te(r, 'cul-de-sac', t => t.evidencia.rols.length === 3), 'tres culs-de-sac en una sola troballa');
  ok(!te(r, 'nomes-contracte') && !troba(r, 'regla-reciprocitat').length, 'cap vincle només de contracte, cap mitja parella');
  ok(r.troballes.length === 14, `${r.troballes.length} troballes (14)`);
  ok(r.resum.primeres[0] === 'coll-ampolla@real:#qui rep i explica', 'la primera de la sala: ' + r.resum.primeres[0]);
  ok(new Set(r.resum.primeres.map(id => id.split('@')[0])).size === 3, 'les tres per començar són de tres codis diferents');
  ok(!te(r, 'coll-ampolla', t => t.nivell.rol === 'Qui fa el vi'), 'Qui fa el vi només té culs-de-sac penjant: no es compta dos cops');
  ok(te(r, 'coll-proces', t => t.gravetat === 'baixa' && /fa la feina o la rep/.test(t.pregunta)) && te(r, 'punt-unic', t => t.gravetat === 'baixa'), 'sense rols externs marcats, el coll i el punt únic són pregunta (baixa)');
}

console.log('\nT1 · Una mitja parella');
{ const o = clona(EXEMPLE); o.parells[5] = 'El distribuïdor | Qui fa el vi | t | la comanda i el pagament |  | ';
  const r = D.diagnostica(deLinies(o)), t = troba(r, 'regla-reciprocitat')[0];
  ok(r.provisional, 'regla dura oberta → provisional');
  ok(t && t.gravetat === 'alta' && J(t.evidencia.parells) === '[["El distribuïdor","Qui fa el vi"]]', 'regla 4 alta, amb la parella com a evidència');
  ok(t && t.resalta.anima === 'atura' && t.resalta.fantasma === 'tornada' && t.resalta.arestes.includes('Qui fa el vi→El distribuïdor'), 'ressalta: aresta aturada i tornada fantasma');
  ok(r.troballes[0].codi === 'regla-reciprocitat', 'és la primera troballa');
}

console.log('\nT2 · Estrella');
{ const C = 'Qui coordina', X = ['Qui ven', 'Qui compra', 'Qui entrega', 'Qui factura', 'Qui dona suport'];
  const m = { abast: 'La venda d\'un producte des de la comanda fins al cobrament', roles: [C].concat(X),
    pairs: X.map((x, i) => i % 2 ? [C, x, 'tangible', 'la tasca del dia', 'intangible', 'com ha anat'] : [x, C, 'tangible', 'la feina feta', 'intangible', 'el que li cal saber']),
    processos: [{ id: 'a', nom: 'A' }, { id: 'b', nom: 'B' }], seq: {}, troballes: [] };
  const r = D.diagnostica(m), Mm = r.nivells[0].metriques;
  ok(Mm.concentracio === 50 && te(r, 'regla-concentracio', t => t.gravetat === 'mitjana' && t.evidencia.rols[0] === C), 'concentració 50 % → mitjana, al centre');
  ok(!te(r, 'coll-ampolla'), 'el centre no és també coll d\'ampolla: tot el que hi penja ja són culs-de-sac');
  ok(te(r, 'cul-de-sac', t => t.evidencia.rols.length === 5), 'cinc culs-de-sac');
  ok(Mm.estructura.intermediacio[C] === 1, 'intermediació del centre = 1');
  ok(te(r, 'sense-seq', t => t.gravetat === 'baixa'), 'cap transacció seqüenciada');
}

console.log('\nT3 · Cadena');
{ const R = ['Qui sembra', 'Qui cull', 'Qui transporta', 'Qui elabora', 'Qui ven', 'Qui consumeix'];
  const m = { abast: 'Del camp a la taula, en una cadena curta', roles: R,
    pairs: R.slice(0, -1).map((r, i) => [r, R[i + 1], 'tangible', 'el producte', 'intangible', 'el que se n\'ha après']), processos: [], seq: {}, troballes: [] };
  const Mm = D.metriques(m);
  ok(J(Mm.estructura.articulacions) === J(['Qui cull', 'Qui elabora', 'Qui transporta', 'Qui ven']), 'articulacions: els quatre del mig');
  ok(J(Mm.estructura.fulles) === J(['Qui consumeix', 'Qui sembra']), 'fulles: els dos extrems');
  ok(Mm.estructura.intermediacio['Qui transporta'] === Mm.estructura.intermediacio['Qui elabora'] && Mm.estructura.intermediacio['Qui transporta'] === 0.6, 'intermediació simètrica al mig (0,6)');
  const r = D.diagnostica(m);
  ok(te(r, 'pont', t => t.nivell.rol === 'Qui cull'), '«el producte» passa igual de mà en mà → pont');
}

console.log('\nT4 · Només contracte');
{ const o = clona(EXEMPLE); o.parells[5] = 'El distribuïdor | Qui fa el vi | t | la comanda i el pagament | t | el vi a preu de canal';
  const r = D.diagnostica(deLinies(o));
  ok(te(r, 'nomes-contracte', t => t.tipus === 'conscient' && t.gravetat === 'baixa'), 'Distribuïdor ↔ Qui fa el vi: tot és contracte');
  ok(te(r, 'nomes-tangible', t => t.nivell.rol === 'El distribuïdor'), 'i amb el distribuïdor tot és tangible');
}

console.log('\nT5 · Un procés amb forat, salt i reentrada');
{ const R = ['Qui demana', 'Qui pren nota', 'Qui prepara', 'Qui porta', 'Qui cobra', 'Qui revisa'];
  const m = { abast: 'Un servei de menjar, de la comanda al cobrament', roles: R,
    pairs: [[R[0], R[1], 'tangible', 'la comanda', 'intangible', 'el que es recomana'], [R[1], R[2], 'tangible', 'el tiquet', 'intangible', 'el que s\'acaba'],
      [R[2], R[3], 'tangible', 'el plat', 'intangible', 'el temps que falta'], [R[3], R[0], 'tangible', 'el plat servit', 'intangible', 'si li ha agradat'],
      [R[0], R[4], 'tangible', 'el pagament', 'tangible', 'el rebut'], [R[4], R[5], 'tangible', 'la caixa', 'intangible', 'el que no quadra']],
    processos: [{ id: 'p', nom: 'El servei' }, { id: 'q', nom: 'El tancament' }],
    seq: { 'Qui demana→Qui pren nota': ['p', 1], 'Qui pren nota→Qui prepara': ['p', 2], 'Qui porta→Qui demana': ['p', 4], 'Qui demana→Qui cobra': ['p', 5], 'Qui cobra→Qui revisa': ['q', 1] }, troballes: [] };
  const r = D.diagnostica(m), P = r.nivells[0].metriques._pr.llista.find(p => p.id === 'p');
  ok(J(P.forats) === '[3]' && te(r, 'forat-pas', t => /pas 3/.test(t.que)), 'forat al pas 3');
  ok(P.salts.length === 1 && P.salts[0].de === 'Qui porta' && te(r, 'espera'), 'salt al pas 4: Qui porta no ha rebut res al pas 2');
  ok(J(P.reentrades) === '["Qui demana"]' && te(r, 'reentrada', t => t.gravetat === 'nota'), 'Qui demana lliura al pas 1 i al 5, i no és als passos del mig → reentrada (nota)');
  ok(!te(r, 'sense-retorn', t => t.evidencia.proces === 'p'), 'qui comença rep al final: hi ha bucle');
}

console.log('\nT6 · Real ↔ ideal');
const IDEAL = {
  abast: 'El que passa des que algú es planteja venir al celler fins que marxa i ho explica',
  roles: ['qui fa el vi', 'Qui rep i explica', 'Visitant', 'El poble', 'La vinya i el veïnat', 'L’operador de luxe', 'Qui porta l\'agenda'],
  pairs: [
    ['qui fa el vi', 'Qui rep i explica', 'tangible', 'el vi, la verema i el celler obert', 'intangible', 'saber què pregunta i què paga qui ve'],
    ['Qui rep i explica', 'Visitant', 'tangible', 'la visita, el tast i el relat de la casa', 'intangible', 'la confiança de qui ha estat aquí'],
    ['Visitant', 'El poble', 'tangible', 'el que es gasta al bar i a la botiga', 'intangible', 'parlar-ne quan torna a casa'],
    ['El poble', 'Qui rep i explica', 'tangible', 'la quota de paisatge de cada visita', 'tangible', 'que el camí i la plaça estiguin cuidats'],
    ['La vinya i el veïnat', 'qui fa el vi', 'tangible', 'la vinya treballada i els camins oberts', 'intangible', 'saber què aguanta cada vessant'],
    ['L’operador de luxe', 'Qui rep i explica', 'intangible', 'què demana un client que paga més', 'tangible', 'una experiència exclusiva i hores reservades'],
    ['Qui rep i explica', 'Qui porta l\'agenda', 'tangible', 'les reserves del dia', 'intangible', 'com ha anat cada grup'],
    ['El poble', 'La vinya i el veïnat', 'intangible', 'qui coneix cada camí', 'intangible', 'els camins oberts per a tothom']],
  processos: [{ id: 'visita', nom: 'La visita' }, { id: 'poble', nom: 'El dia al poble' }, { id: 'agenda', nom: 'L\'agenda' }],
  seq: { 'qui fa el vi→Qui rep i explica': ['visita', 1], 'Qui rep i explica→Visitant': ['visita', 2], 'Qui rep i explica→qui fa el vi': ['visita', 3],
    'Visitant→El poble': ['poble', 1], 'El poble→Qui rep i explica': ['poble', 2], 'Qui rep i explica→Qui porta l\'agenda': ['agenda', 1] },
  treu: ['El distribuïdor→Qui fa el vi'], troballes: [] };
{ const m = celler(); m.ideal = IDEAL;
  const r = D.diagnostica(m), d = r.desviacio[0];
  ok(J(d.rols.falten) === '["Qui porta l\'agenda"]', 'falta: Qui porta l\'agenda (els noms amb article, minúscules i apòstrof tipogràfic casen)');
  ok(J(d.rols.propis) === '["El distribuïdor"]' && te(r, 'rol-propi', t => t.gravetat === 'nota'), 'propi: El distribuïdor, com a nota i no com a error');
  ok(d.fluxos.falten.length === 4 && d.fluxos.falten.filter(x => x.perRol).length === 2, '4 fluxos falten, 2 per culpa del rol que falta');
  ok(te(r, 'rol-falta', t => /amb ell 2/.test(t.que) && t.gravetat === 'mitjana'), 'el rol que falta s\'emporta els seus dos fluxos (no cascada)');
  ok(te(r, 'flux-falta', t => t.tipus === 'conscient' && t.evidencia.fluxosIdeal.length === 2), 'falta el vincle intangible El poble ↔ La vinya → conscient');
  ok(J(d.fluxos.sobren.map(x => x.clau)) === '["El distribuïdor→Qui fa el vi"]' && d.fluxos.propies.length === 1, 'sobra (perquè l\'ideal el treu) i 1 propi');
  ok(d.fluxos.canviMena.length === 1 && d.fluxos.canviMena[0].sentit === 'conversio' && te(r, 'canvi-mena', t => t.mirada === 'creacio'), 'El poble → Qui rep i explica: conversió prevista');
  ok(d.fluxos.invertits.length === 1 && d.fluxos.invertits[0].per === 'entregable' && !d.fluxos.canviMena.some(x => /operador/i.test(x.clau)), 'Operador ↔ Rep invertit, i no es compta també com a canvi de mena');
  ok(te(r, 'seq-sempre-a-pas', t => t.evidencia.fluxos.length === 2), 'dos «sempre» als quals l\'ideal dona un pas');
  ok(te(r, 'mes-traspassos', t => t.evidencia.proces === 'visita' && /«La visita» fa 3 traspassos tangibles/.test(t.que) && t.gravetat === 'mitjana'), 'La visita: 3 traspassos tangibles contra 2');
  ok(!te(r, 'reentrada', t => t.capa === 'ideal'), 'rebre al final del procés és retorn, no reentrada');
  ok(te(r, 'proces-falta') && J(d.processosPropis) === '["canal"]', 'procés agenda falta; canal és propi');
  ok(J(d.collsNous) === '["Qui fa el vi"]' && te(r, 'coll-nou'), 'Qui fa el vi és coll al real i a l\'ideal no');
  ok(d.cobertura.rols === 86 && d.cobertura.fluxos === 75, `cobertura ${d.cobertura.rols} / ${d.cobertura.fluxos}`);
  ok(d.metriques.densitat.real === 33 && d.metriques.densitat.ideal === 38 && d.metriques.densitat.delta === -5, 'densitat 33 contra 38');
  ok(r.ideal && te(r, 'nomes-contracte', t => t.capa === 'ideal'), 'l\'ideal també es diagnostica (capa ideal)');
  ok(r.troballes.filter(t => t.capa === 'desviacio').every(t => !/incompliment|error/i.test(t.que + t.perque + t.pregunta)), 'cap «incompliment» ni «error» a la desviació');
}

console.log('\nT7 · Normalitzar noms');
{ const n = D.normNom;
  ok(n('Els veïns') === 'veins' && n('Laboratori') === 'laboratori' && n('Unitat de cures') === 'unitat de cures' && n('Elena') === 'elena', 'l\'article només es treu si és una paraula');
  ok(n('L’operador de luxe') === n('l\'operador de luxe') && n('L’operador de luxe') === 'operador de luxe', 'apòstrof tipogràfic = recte');
  ok(n('  Qui  FA el Vi ') === 'qui fa el vi' && n('Col·laboradora') === 'col laboradora', 'espais, majúscules i ela geminada');
  ok(n('Los vecinos') === 'vecinos', 'també en castellà');
}

console.log('\nT8 · Zoom: el node obert');
const DINS_REP = {
  roles: ['Qui agafa el telèfon', 'Qui porta l\'agenda', 'Qui fa la visita', 'Qui dona de menjar', 'Qui ho explica a fora'],
  pairs: [['Qui agafa el telèfon', 'Qui porta l\'agenda', 'tangible', 'la reserva presa', 'tangible', 'les hores que encara queden lliures'],
    ['Qui porta l\'agenda', 'Qui fa la visita', 'tangible', 'el full del dia', 'intangible', 'com ha anat'],
    ['Qui fa la visita', 'Qui dona de menjar', 'intangible', 'a quina hora arribaran a taula', 'tangible', 'el tast i la taula a l\'hora'],
    ['Qui fa la visita', 'Qui ho explica a fora', 'intangible', 'el que la gent pregunta', 'intangible', 'visitants que ja venen sabent què veuran'],
    ['Qui ho explica a fora', 'Qui agafa el telèfon', 'intangible', 'trucades de gent que ja sap què vol', 'intangible', 'les preguntes que es repeteixen']],
  processos: [{ id: 'dia', nom: 'El dia d\'una visita' }],
  seq: { 'Qui agafa el telèfon→Qui porta l\'agenda': ['dia', 1], 'Qui porta l\'agenda→Qui agafa el telèfon': ['dia', 2], 'Qui porta l\'agenda→Qui fa la visita': ['dia', 3],
    'Qui fa la visita→Qui dona de menjar': ['dia', 4], 'Qui dona de menjar→Qui fa la visita': ['dia', 5], 'Qui fa la visita→Qui porta l\'agenda': ['dia', 6],
    'Qui fa la visita→Qui ho explica a fora': 'sempre', 'Qui ho explica a fora→Qui fa la visita': 'sempre', 'Qui ho explica a fora→Qui agafa el telèfon': 'sempre', 'Qui agafa el telèfon→Qui ho explica a fora': 'sempre' },
  portes: { 'El visitant→Qui rep i explica': 'Qui fa la visita', 'Qui rep i explica→El visitant': 'Qui fa la visita' } };
{ const m = celler();
  m.dins = { 'Qui rep i explica': clona(DINS_REP) };
  const r = D.diagnostica(m), dins = r.troballes.filter(t => t.nivell.cami[0] === 'Qui rep i explica');
  ok(r.nivells.length === 2 && r.nivells[1].cami[0] === 'Qui rep i explica', 'dos nivells');
  ok(!dins.some(t => t.codi === 'regla-rols'), 'a dins, cinc rols no són cap problema');
  ok(dins.some(t => t.codi === 'regla-processos' && t.gravetat === 'nota'), 'a dins, un sol procés és una nota');
  ok(dins.some(t => t.codi === 'sense-porta' && /6 de 8/.test(t.que) && t.resalta.arestesPare.length === 6), '6 de 8 lliuraments de fora sense porta');
  ok(r.nivells[1].revisio.regles.find(g => g.id === 'abast').ok, 'l\'abast s\'hereta del nivell de dalt');
  ok(dins.every(t => t.resalta.cami[0] === 'Qui rep i explica'), 'el ressaltat sap a quin nivell fer zoom');
}

console.log('\nT9 · Gomets');
{ const m = celler(); m.gomets = { 'Qui rep i explica→El visitant': [-1, 2], 'El distribuïdor→Qui fa el vi': -2 };
  const r = D.diagnostica(m);
  ok(te(r, 'percepcio-dividida', t => t.evidencia.fluxos[0] === 'Qui rep i explica→El visitant'), 'gomet blau i groc alhora → percepció dividida');
  ok(te(r, 'gomet-baix', t => t.tipus === 'eficient' && t.gravetat === 'mitjana'), 'tangible valorat −2 → eficient (defecte), mitjana');
  ok(!te(r, 'sense-gomets'), 'ja no avisa que falten gomets');
}

console.log('\nT10 · Pont i duplicat');
{ const R = ['Qui produeix', 'Qui revisa', 'Qui decideix', 'Qui compra', 'Qui paga', 'Qui assessora'];
  const m = { abast: 'El circuit d\'un informe i d\'una compra a una cooperativa', roles: R,
    pairs: [['Qui produeix', 'Qui revisa', 'tangible', 'l\'informe mensual', 'intangible', 'el que no quadra'],
      ['Qui revisa', 'Qui decideix', 'tangible', 'l\'informe mensual', 'intangible', 'què cal mirar el mes que ve'],
      ['Qui compra', 'Qui paga', 'tangible', 'la factura', 'intangible', 'avís de quan es paga'],
      ['Qui assessora', 'Qui paga', 'tangible', 'La factura', 'intangible', 'confiança'],
      ['Qui decideix', 'Qui compra', 'tangible', 'la comanda', 'tangible', 'el material'],
      ['Qui produeix', 'Qui assessora', 'intangible', 'dubtes de mètode', 'intangible', 'consell']],
    processos: [], seq: {}, troballes: [] };
  const r = D.diagnostica(m);
  ok(te(r, 'pont', t => t.nivell.rol === 'Qui revisa'), 'Qui revisa passa l\'informe igual → pont');
  ok(te(r, 'duplicat', t => t.evidencia.fluxos.length === 2 && /Qui paga/.test(t.que)), 'Qui paga rep «la factura» de dos llocs');
  ok(te(r, 'nomes-contracte'), 'Qui decideix ↔ Qui compra: només contracte');
  ok(te(r, 'conversio', t => t.evidencia.fluxos[0] === 'Qui produeix→Qui assessora' || t.evidencia.fluxos[0] === 'Qui assessora→Qui produeix'), 'el vincle i↔i és candidat a conversió');
}

console.log('\nT11 · Buit: provisional');
{ const r = D.diagnostica({ abast: '', roles: [], pairs: [], processos: [], seq: {}, troballes: [] });
  ok(r.provisional && r.troballes.filter(t => t.gravetat === 'alta').map(t => t.codi).join() === 'regla-abast,regla-menes,regla-rols', 'tres altes: abast, menes, rols');
  ok(!te(r, 'sense-gomets'), 'no demana gomets a un mapa que encara no és un mapa');
}

console.log('\nT12 · Pur i determinista');
{ const m = celler(); m.ideal = clona(IDEAL); congela(m);
  let e = null, a, b; try { a = J(D.diagnostica(m)); b = J(D.diagnostica(m)); } catch (x) { e = x; }
  ok(!e, 'no toca l\'entrada (congelada) ' + (e ? e.message : ''));
  ok(a === b, 'mateixa entrada, mateixa sortida');
  const ids = JSON.parse(a).troballes.map(t => t.id); ok(new Set(ids).size === ids.length, 'ids únics (' + ids.length + ')');
}

console.log('\nT13 · Fonts honestes');
{ const m = celler(); m.ideal = IDEAL; const o = clona(EXEMPLE); o.rols = o.rols.slice(0, 4);
  const tots = D.diagnostica(m).troballes.concat(D.diagnostica(deLinies(o)).troballes);
  ok(tots.every(t => !t.font.llindar || t.font.llindar.de !== 'allee'), 'cap llindar atribuït a Allee');
  ok(tots.every(t => t.font && t.font.de && t.font.ref), 'totes porten font');
  ok(tots.every(t => ['metode', 'casa', 'agil', 'eficient', 'conscient'].includes(t.tipus)), 'tots els tipus són dels cinc');
  ok(tots.every(t => !/incompliment/i.test(J(t))), 'enlloc «incompliment»');
  ok(tots.every(t => t.que && t.perque && t.pregunta), 'cada troballa diu què, per què i quina pregunta');
}

console.log('\nT14 · Les mètriques diuen el mateix que revisa()');
{ for (const m of [celler(), deLinies(Object.assign(clona(EXEMPLE), { rols: EXEMPLE.rols.slice(0, 5) }))]) {
    const rv = motor.revisa(m), Mm = D.metriques(m), num = id => Number((rv.regles.find(g => g.id === id).diu.match(/(\d+) %/) || [])[1]);
    ok(num('densitat') === Mm.densitat && num('concentracio') === Mm.concentracio, `densitat ${Mm.densitat} i concentració ${Mm.concentracio} = revisa()`);
  } }

console.log('\nT15 · Àlies');
{ const m = celler(); m.ideal = clona(IDEAL); m.ideal.roles[1] = 'Qui atén els grups';
  m.ideal.pairs = m.ideal.pairs.map(p => p.map(x => x === 'Qui rep i explica' ? 'Qui atén els grups' : x));
  m.ideal.seq = Object.fromEntries(Object.entries(m.ideal.seq).map(([k, v]) => [k.replace('Qui rep i explica', 'Qui atén els grups'), v]));
  const sense = D.diagnostica(m).desviacio[0];
  m.ideal.alies = { 'Qui atén els grups': 'Qui rep i explica' };
  const amb = D.diagnostica(m).desviacio[0];
  ok(sense.rols.falten.includes('Qui atén els grups') && sense.rols.propis.includes('Qui rep i explica'), 'sense àlies: un que falta i un de propi');
  ok(!amb.rols.falten.includes('Qui atén els grups') && J(amb.rols.falten) === J(D.diagnostica(Object.assign(celler(), { ideal: IDEAL })).desviacio[0].rols.falten), 'amb àlies: el mateix resultat que amb el nom bo');
}

/* ══ M · El model de l'editor ═════════════════════════════════════════════ */
console.log('\nT16 · El que és propi no es compta com a desviació (revisió del mètode)');
{ // Un rol propi que penja d'«El visitant», amb un tangible inserit com a pas 2 de «La visita»
  const ideal = celler(), m = celler(), P = 'Qui porta els comptes';
  m.roles.push(P); m.pairs.push(['El visitant', P, 'tangible', 'la caixa de la visita', 'intangible', 'el que no quadra']);
  Object.keys(m.seq).forEach(k => { const v = m.seq[k]; if (Array.isArray(v) && v[0] === 'visita' && v[1] >= 2) m.seq[k] = ['visita', v[1] + 1]; });
  m.seq['El visitant→' + P] = ['visita', 2];
  m.ideal = ideal;
  const r = D.diagnostica(m), d = r.desviacio[0];
  ok(J(d.rols.propis) === J([P]) && te(r, 'rol-propi', t => t.gravetat === 'nota' && t.tipus === 'casa'), 'el rol propi és una nota de la casa');
  ok(!te(r, 'coll-nou') && !d.collsNous.length, 'penjar un rol propi no fa cap «coll nou»');
  ok(te(r, 'mes-traspassos', t => t.gravetat === 'nota' && /que és propi/.test(t.que) && /la caixa de la visita/.test(t.que)), 'el traspàs de més ve del propi: nota, i ho diu');
  ok(!te(r, 'seq-pas'), 'inserir un pas propi no canvia l\'ordre relatiu dels comuns: cap «seq-pas»');
  ok(!r.troballes.some(t => t.capa === 'desviacio' && t.gravetat !== 'nota' && t.evidencia.rols && t.evidencia.rols.includes(P)), 'cap troballa de desviació més greu que una nota culpa el propi');
}
{ // Dos parells en el mateix vincle: el segon és propi, no un nom diferent ni un sentit invertit
  const m = celler(); m.ideal = celler();
  m.pairs.push(['Qui fa el vi', 'Qui rep i explica', 'tangible', 'les ampolles del dia', 'tangible', 'les caixes buides']);
  const d = D.desviacio(m, m.ideal);
  ok(!d.fluxos.nomsDiferents.length && !d.fluxos.invertits.length && !d.fluxos.canviMena.length, 'cap nom diferent, cap invertit ni canvi de mena');
  ok(J(d.fluxos.propies.map(x => x.q).sort()) === J(['les ampolles del dia', 'les caixes buides']), 'els dos lliuraments de més són propis');
  const e = M.escena(M.importa(Object.assign({}, EXEMPLE, { parells: EXEMPLE.parells.concat(['Qui fa el vi | Qui rep i explica | t | les ampolles del dia | t | les caixes buides']), ideal: EXEMPLE })).arbre,
    { vista: 'desviacio', cami: [] }, { diag: D });
  ok(e.arestes.filter(x => x.estat === 'propi').length === 2 && e.arestes.filter(x => x.de === 'Qui fa el vi' && x.a === 'Qui rep i explica' && x.estat === 'igual').length === 1, 'a l\'escena, la fletxa original és igual i les dues noves, pròpies');
}
{ // Empat al centre i un nom canviat amb àlies: el mateix centre
  const ideal = { abast: 'La venda i el transport d\'un producte de la casa', roles: ['Qui produeix', 'Qui ven', 'Qui compra', 'Qui transporta'],
    pairs: [['Qui produeix', 'Qui ven', 'tangible', 'el producte', 'intangible', 'el que es demana'], ['Qui produeix', 'Qui transporta', 'tangible', 'la càrrega', 'intangible', 'quan passa'],
      ['Qui ven', 'Qui compra', 'tangible', 'la venda', 'tangible', 'el pagament']], processos: [], seq: {}, troballes: [] };
  const real = JSON.parse(JSON.stringify(ideal).replace(/Qui ven/g, 'Qui fa la venda'));
  real.ideal = Object.assign(clona(ideal), { alies: { 'Qui ven': 'Qui fa la venda' } });
  const r = D.diagnostica(real);
  ok(!te(r, 'centre-diferent'), 'empat 4–4 i el mateix rol amb un altre nom: no hi ha centre diferent');
  const real2 = clona(real); real2.ideal.alies = {};
  ok(!te(D.diagnostica(real2), 'centre-diferent'), 'i sense àlies, l\'empat comparteix «Qui produeix»: tampoc');
}

console.log('\nT17 · El lean, només per als tangibles');
{ const R = ['Qui coordina', 'Qui participa', 'Qui fa de voluntari', 'Qui acull', 'Qui arriba'];
  const m = { abast: 'L\'acollida de voluntaris en una entitat del barri', roles: R,
    pairs: [['Qui participa', 'Qui fa de voluntari', 'intangible', 'reconeixement', 'tangible', 'les hores de la tarda'],
      ['Qui coordina', 'Qui fa de voluntari', 'intangible', 'reconeixement', 'tangible', 'el full d\'hores'],
      ['Qui arriba', 'Qui acull', 'intangible', 'confiança', 'tangible', 'la fitxa d\'acollida'],
      ['Qui acull', 'Qui coordina', 'intangible', 'confiança', 'tangible', 'el pla de la setmana'],
      ['Qui coordina', 'Qui participa', 'tangible', 'l\'horari', 'intangible', 'com ha anat']],
    processos: [{ id: 'a', nom: 'L\'acollida' }], seq: { 'Qui arriba→Qui acull': ['a', 1], 'Qui acull→Qui arriba': ['a', 2], 'Qui acull→Qui coordina': ['a', 3] }, troballes: [] };
  const r = D.diagnostica(m);
  ok(!te(r, 'duplicat'), 'rebre «reconeixement» de dos rols no és sobreprocés');
  ok(te(r, 'redundant', t => t.gravetat === 'nota' && t.tipus === 'conscient' && /redundància que cuida o soroll/.test(t.pregunta)), 'és una nota conscient: redundància que cuida o soroll?');
  ok(!te(r, 'pont'), 'passar «confiança» endavant no és transport');
  ok(D.processos(m).llista[0].traspassos === 1, 'a l\'acollida només compta 1 traspàs: els intangibles no hi compten');
  const real = celler(); real.ideal = celler(); real.seq['El visitant→Qui rep i explica'] = ['visita', 5];
  ok(!te(D.diagnostica(real), 'mes-traspassos'), 'seqüenciar un intangible al real no fa «més traspassos»');
}

console.log('\nT18 · Rols externs: el client no és un coll');
const BOTIGA = () => ({ abast: 'La compra a la botiga del barri, de l\'entrada a la sortida',
  roles: ['Qui compra', 'Qui atén', 'Qui cobra', 'Qui reposa', 'Qui porta la botiga', 'Qui proveeix'],
  pairs: [['Qui compra', 'Qui atén', 'intangible', 'el que busca', 'tangible', 'el producte triat'],
    ['Qui compra', 'Qui cobra', 'tangible', 'el pagament', 'tangible', 'el tiquet'],
    ['Qui atén', 'Qui reposa', 'intangible', 'el que falta al prestatge', 'tangible', 'el prestatge ple'],
    ['Qui reposa', 'Qui proveeix', 'tangible', 'la comanda', 'tangible', 'la mercaderia'],
    ['Qui cobra', 'Qui porta la botiga', 'tangible', 'la caixa del dia', 'intangible', 'el que es ven i el que no'],
    ['Qui compra', 'Qui porta la botiga', 'intangible', 'confiança', 'intangible', 'un tracte de barri'],
    ['Qui atén', 'Qui cobra', 'tangible', 'el producte per cobrar', 'tangible', 'el producte cobrat']],
  processos: [{ id: 'compra', nom: 'La compra' }, { id: 'tracte', nom: 'El tracte' }],
  seq: { 'Qui compra→Qui atén': ['compra', 1], 'Qui atén→Qui compra': ['compra', 2], 'Qui compra→Qui cobra': ['compra', 3], 'Qui cobra→Qui compra': ['compra', 4],
    'Qui porta la botiga→Qui compra': ['tracte', 1], 'Qui compra→Qui porta la botiga': 'sempre' }, troballes: [] });
{ const r = D.diagnostica(BOTIGA());
  ok(te(r, 'coll-proces', t => t.nivell.rol === 'Qui compra' && t.gravetat === 'baixa' && /fa la feina o la rep/.test(t.pregunta) && !/cua/.test(t.perque)), 'sense marca: «Qui compra» és una pregunta (baixa), sense afirmar cap cua');
  ok(te(r, 'punt-unic', t => t.nivell.rol === 'Qui compra' && t.gravetat === 'baixa' && /de la casa o rep el servei/.test(t.pregunta)), 'el punt únic també és pregunta');
  ok(te(r, 'conversio', t => t.conversio.de === 'Qui compra' && /«Qui compra» ja produeix i avui no té forma negociable/.test(t.perque) && !/regala/.test(t.perque)), 'la conversió parla del rol, no de «la casa que regala»');
  const m = BOTIGA(); m.externs = ['Qui compra'];
  const r2 = D.diagnostica(m), sobre = t => t.nivell.rol === 'Qui compra' || (t.conversio && t.conversio.de === 'Qui compra');
  ok(!te(r2, 'coll-proces', sobre) && !te(r2, 'punt-unic', sobre) && !te(r2, 'conversio', sobre), 'marcat com a extern: ni coll, ni punt únic, ni conversió');
  const c = D.conversions(celler(), D.metriques(celler())).find(x => x.de === 'El poble');
  ok(J(c.despres) === J(['El visitant']) && new Set(c.despres).size === c.despres.length, 'la llista de «després» no repeteix rols');
}
{ const o = Object.assign(M.exporta(M.importa(BOTIGA()).arbre), { externs: ['Qui compra', 'Ningú'] });
  const A = M.importa(o).arbre;
  ok(J(A.real.externs) === J(['Qui compra']) && J(M.exporta(A).externs) === J(['Qui compra']), 'externs: s\'importa i s\'exporta, i el que no és un rol es descarta');
  const r1 = M.opReanomenaRol(A.real, 'Qui compra', 'Qui ve a comprar');
  ok(J(r1.n.externs) === J(['Qui ve a comprar']), 'reanomenar el rol el manté extern');
  ok(J(M.opEsborraRol(r1.n, 'Qui ve a comprar').n.externs) === '[]', 'esborrar-lo el treu de la llista');
  const r2 = M.opExtern(A.real, 'Qui atén'), r3 = M.opExtern(r2.n, 'Qui atén');
  ok(J(r2.n.externs) === J(['Qui compra', 'Qui atén']) && J(r3.n.externs) === J(['Qui compra']) && M.opExtern(A.real, 'Ningú').error, 'opExtern alterna, i no accepta un rol que no hi és');
  const r = D.diagnostica(M.exporta(Object.assign({}, A, { real: r2.n })));
  ok(!te(r, 'coll-proces', t => t.nivell.rol === 'Qui atén' || t.nivell.rol === 'Qui compra'), 'el diagnòstic llegeix els externs del model exportat');
}

console.log('\nT19 · Textos i fonts revisats');
{ const r = D.diagnostica(celler());
  ok(te(r, 'coll-ampolla', t => t.font.de === 'practica' && /colls d'ampolla/.test(t.font.ref)), 'coll d\'ampolla: la pregunta és de la pràctica; d\'Allee, només el concepte');
  ok(te(r, 'cul-de-sac', t => !/l'article anomena/.test(t.perque) && /és de la casa/.test(t.font.ref)), 'cul-de-sac: llegir-ho com a rol d\'un sol vincle és de la casa');
  ok(te(r, 'sense-retorn', t => /passa «sempre», fora del procés/.test(t.que) && !/ningú sap/.test(t.que)), '«sempre» no es presenta com un defecte');
  const m = celler(); m.roles = m.roles.concat(['Cap d\'obra', 'Regidoria de cultura']);
  const rc = D.diagnostica(m);
  ok(te(rc, 'sembla-carrec', t => t.nivell.rol === 'Cap d\'obra') && te(rc, 'sembla-carrec', t => t.nivell.rol === 'Regidoria de cultura'), '«Cap d\'obra» i «Regidoria» semblen càrrecs');
  const m2 = clona(celler()); m2.seq = {};
  ok(!te(D.diagnostica(m2), 'invisible'), 'sense cap pas escrit, «invisible» no es multiplica per rol: ja ho diu «sense-seq»');
  const rr = D.diagnostica(Object.assign(celler(), { roles: celler().roles.slice(0, 5) }));
  ok(te(rr, 'regla-rols', t => t.font.de === 'practica' && t.font.llindar.de === 'mixt'), 'regla 2: de la pràctica, i el 6 de la casa');
  ok(/Scrum Guide/.test(D.FONT.agil), 'la mirada àgil cita la font');
  const v = M.vuitPreguntes(celler(), D.metriques(celler()));
  ok(/El poble \(dona 2 intangibles i en rep 0\)/.test(v[7].dada) && !/Tots els rols donen tant com reben/.test(v[7].dada), 'pregunta 8: el balanç d\'intangibles, no el total que sempre quadra');
  ok(/Començant pels més actius/.test(v[3].dada), 'pregunta 4: diu que comença pels més actius');
}

console.log('\nM1 · Llegir i escriure com abans');
{ ok(J(celler()) === J(deLiniesRef(EXEMPLE)), 'llegeixTextos(aTextos(EXEMPLE)) = la lectura de sempre');
  const can = deLiniesRef(EXEMPLE);
  ok(J(M.aTextos(can)) === J(carregaRef(can)), 'aTextos d\'un canònic = el text que escrivia carrega()');
  const rar = { rols: ['A', 'B'], parells: [['A', 'B', 'intangible', 'x', '', '']], processos: ['p | P'], seq: ['A→B | p | 2'], troballes: [{ t: 'a' }] };
  ok(J(M.aTextos(rar)) === J(carregaRef(rar)), 'i també amb formes barrejades (rols, parells, seq en llista, troballa sense d)');
  ok(M.aTextos({ abast: 'una\nlínia', rols: ['A\r\nB'] }).abast === 'unalínia' && M.aTextos({ rols: ['A\r\nB'] }).rols === 'A\nB', 'el que el navegador faria: l\'abast sense salts i els salts com a \\n');
}

console.log('\nM2 · El canvi mínim');
{ const P = 'Qui fa el vi | \n\n  A | B | t | x | i | y  \n   \nC | D | t | p |  | ';
  const n = nv({ rols: 'A\nB\nC\nD\nQui fa el vi', parells: P });
  ok(J(M.liniesText(P).map(x => [x.i, x.raw])) === '[[0,0],[1,2],[2,4]]', 'liniesText: i entre les no buides i raw al camp');
  const iguals = (a, b, menys) => { const x = a.split('\n'), y = b.split('\n'); return x.length === y.length && x.every((l, i) => menys.includes(i) || l === y[i]); };
  const r1 = M.opFlux(n, 'D', 'C', 'i', 'q');
  ok(r1.n.t.parells.split('\n')[4] === 'C | D | t | p | i | q' && iguals(P, r1.n.t.parells, [4]), 'opFlux omple la tornada i deixa les altres línies byte a byte');
  const r2 = M.opEditaFlux(n, 'A→B', { q: 'x2' });
  ok(r2.n.t.parells.split('\n')[2] === 'A | B | t | x2 | i | y' && iguals(P, r2.n.t.parells, [2]), 'opEditaFlux reescriu només la seva línia');
  const r3 = M.opEsborraFlux(n, 'C→D'), L3 = r3.n.t.parells.split('\n');
  ok(L3.length === 4 && J(L3) === J(P.split('\n').slice(0, 4)), 'opEsborraFlux treu la línia buidada i no toca res més (ni la línia a mig escriure)');
}

console.log('\nM3 · Parells');
{ const n0 = nv({ rols: 'A\nB' });
  const r1 = M.opFlux(n0, 'A', 'B', 't', 'la comanda');
  ok(r1.n.t.parells === 'A | B | t | la comanda |  | ', 'un parell nou: «A | B | t | q |  | »');
  const r2 = M.opFlux(r1.n, 'B', 'A', 'i', 'l\'avís');
  ok(r2.n.t.parells === 'A | B | t | la comanda | i | l\'avís', 'sobre B→A omple les columnes 4 i 5');
  const r3 = M.opFlux(r2.n, 'A', 'B', 't', 'una altra cosa');
  ok(r3.conflicte && r3.conflicte.tipus === 'ocupat' && r3.conflicte.q === 'la comanda' && r3.n === r2.n, 'sentit ocupat: conflicte, i no canvia res');
  const r4 = M.opFlux(nv({ rols: 'A' }), 'A', 'C', 'i', 'saber-ho');
  ok(r4.n.t.rols === 'A\nC' && r4.camps.includes('rols') && /«C»/.test(r4.avis), 'declara els rols que no hi eren, i ho diu');
}

console.log('\nM4 · Reanomenar');
{ const dins = Object.assign(nv({ rols: 'X\nY' }), { portes: { 'Z→A': 'X' } });
  const fill = Object.assign(nv({ rols: 'X' }), { portes: { 'A→B': 'X', 'B→A': 'X' } });
  const n = Object.assign(nv({ rols: 'A\nB', parells: 'A | B | t | q | i | r', seq: 'A→B | p | 1\nB→A | sempre' }),
    { pos: { A: [1, 2], B: [3, 4] }, gomets: { 'A→B': 1 }, dins: { A: fill, B: dins } });
  const arbre = { real: n, ideal: clona(n) };
  const r = M.opReanomenaRol(n, 'A', 'Qui ven'), a2 = M.substitueix(arbre, { vista: 'real', cami: [] }, r.n);
  ok(r.n.t.rols === 'Qui ven\nB' && r.n.t.parells === 'Qui ven | B | t | q | i | r', 'rols i columnes 0 i 1');
  ok(r.n.t.seq === 'Qui ven→B | p | 1\nB→Qui ven | sempre' && J(Object.keys(r.n.gomets)) === '["Qui ven→B"]', 'claus de seq i de gomets');
  ok(J(r.n.pos['Qui ven']) === '[1,2]' && !r.n.pos.A && r.n.dins['Qui ven'] === undefined === false && !r.n.dins.A, 'pos i dins segueixen el nom');
  ok(J(Object.keys(r.n.dins['Qui ven'].portes)) === '["Qui ven→B","B→Qui ven"]' && J(Object.keys(r.n.dins.B.portes)) === '["Z→Qui ven"]', 'i les claus de portes dels fills');
  ok(a2.ideal === arbre.ideal && arbre.ideal.t.rols === 'A\nB', 'l\'ideal no es toca');
  ok(M.opReanomenaRol(n, 'A', 'b').error === 'Ja hi ha un rol que es diu així', 'un nom repetit és un error');
  const r2 = M.opReanomenaRol(Object.assign(nv({ rols: 'X\nY' }), { portes: { 'A→R': 'X' } }), 'X', 'Qui rep');
  ok(r2.n.portes['A→R'] === 'Qui rep', 'a dins, els valors de portes (rols propis) també');
}

console.log('\nM5 · Esborrar un rol');
{ const a = M.importa(Object.assign(deLiniesRef(EXEMPLE), { dins: { 'Qui rep i explica': clona(DINS_REP) }, pos: { 'Qui rep i explica': [0, 0] } })).arbre;
  const r = M.opEsborraRol(a.real, 'Qui rep i explica'), m = M.llegeixTextos(r.n.t);
  ok(!m.roles.includes('Qui rep i explica') && m.pairs.length === 3 && !Object.keys(m.seq).some(k => /Qui rep i explica/.test(k)), 'treu la línia, els seus parells i la seva seqüència');
  ok(!r.n.dins['Qui rep i explica'] && !r.n.pos['Qui rep i explica'], 'i la seva posició i la seva xarxa de dins');
  ok(r.avis === 'S\'ha esborrat «Qui rep i explica», 8 lliuraments i la seva xarxa de dins (5 rols)', r.avis);
}

console.log('\nM6 · Invertir');
{ const n = nv({ rols: 'A\nB', parells: 'A | B | t | q |  | ', seq: 'A→B | p | 1' });
  const r = M.opInverteix(n, 'A→B');
  ok(r.n.t.parells === 'B | A | t | q |  | ' && r.n.t.seq === 'B→A | p | 1', 'amb l\'altre sentit buit, el contingut canvia de sentit i la clau de seq el segueix');
  const n2 = nv({ rols: 'A\nB', parells: 'A | B | t | q | i | r', seq: 'A→B | p | 1\nB→A | sempre' });
  const r2 = M.opInverteix(n2, 'A→B');
  ok(r2.n.t.parells === 'A | B | i | r | t | q' && r2.n.t.seq === 'B→A | p | 1\nA→B | sempre' && r2.avis === 'S\'han intercanviat els dos sentits', 'amb l\'altre ocupat, s\'intercanvien, i ho diu');
}

console.log('\nM7 · La mena i «sempre»');
{ const n = M.importa(EXEMPLE).arbre.real;
  const r = M.opEditaFlux(n, 'El poble→Qui rep i explica', { mena: 't' }), m = M.llegeixTextos(r.n.t);
  ok(m.seq['El poble→Qui rep i explica'] === 'sempre' && m.pairs[3][2] === 'tangible', 'canviar la mena no esborra la marca «sempre»');
  const g = revisa(m).regles.find(x => x.id === 'processos');
  ok(!g.ok && /tangible/.test(g.diu), 'i la regla 10 ho veu: ' + g.diu.slice(0, 50));
  const e = M.opSempre(n, 'Qui fa el vi→Qui rep i explica', true);
  ok(e.error && /^Un tangible no pot ser «sempre»/.test(e.error) && e.n === n, '«sempre» sobre un tangible és un error');
}

console.log('\nM8 · Passos');
{ let n = nv({ rols: 'A\nB\nC\nD\nE', parells: 'A | B | t | 1 | i | 1r\nB | C | t | 2 | i | 2r\nC | D | t | 3 | i | 3r\nD | E | t | 4 | i | 4r', processos: 'p | P' });
  const pas = (clau, k, mode) => { n = M.opPas(n, clau, 'p', k, mode).n; return M.llegeixTextos(n.t).seq; };
  pas('A→B', 0, 'final'); pas('B→C', 0, 'final'); let s = pas('C→D', 0, 'final');
  ok(s['A→B'][1] === 1 && s['B→C'][1] === 2 && s['C→D'][1] === 3, 'final: 1, 2, 3');
  s = pas('D→E', 2, 'insereix');
  ok(s['D→E'][1] === 2 && s['B→C'][1] === 3 && s['C→D'][1] === 4, 'insereix al 2: els de després baixen');
  s = pas('B→A', 2, 'alhora');
  ok(s['B→A'][1] === 2 && s['D→E'][1] === 2 && s['C→D'][1] === 4, 'alhora: el mateix número');
  const n2 = Object.assign({}, n, { t: Object.assign({}, n.t, { seq: 'A→B | p | 2\nB→C | p | 2\nC→D | p | 7' }) });
  const r = M.opPas(n2, 'D→E', 'p', 0, 'final'), s2 = M.llegeixTextos(r.n.t).seq;
  ok(s2['A→B'][1] === 1 && s2['B→C'][1] === 1 && s2['C→D'][1] === 2 && s2['D→E'][1] === 3 && r.avis === 'Passos de «P» renumerats 1…3', 'compacta a 1…n i el que passa alhora segueix alhora · ' + r.avis);
  ok(M.idProces('La visita', ['visita']) === 'visita-2' && M.idProces('El dia al poble', []) === 'dia-al-poble', 'idProces: sense article i sense repetir');
}

console.log('\nM9 · Noms que es poden escriure');
{ const a = M.netejaNom('Qui ven | compra');
  ok(a.nom === 'Qui ven / compra' && /«\/»/.test(a.avis), '«|» passa a «/», amb avís');
  ok(!!M.netejaNom('A→B').error && !!M.netejaNom('A\nB').error && !!M.netejaNom('  ').error, '«→», un salt de línia o res són error');
}

console.log('\nM10 · Exportar i importar');
{ const can = deLiniesRef(EXEMPLE);
  ok(J(M.exporta(M.importa(can).arbre)) === J(can), 'el celler sense extres surt idèntic al canònic');
  const fill2 = { abast: '', roles: ['P', 'Q'], pairs: [['P', 'Q', 'tangible', 'x', 'intangible', 'y']], processos: [], seq: {}, troballes: [], pos: { P: [1, 2] }, portes: { 'X→Qui fa la visita': 'P' } };
  const ric = Object.assign(clona(can), { pos: { 'Qui fa el vi': [320, 58] }, gomets: { 'Qui rep i explica→El visitant': [-1, 2], 'El distribuïdor→Qui fa el vi': -2 },
    dins: { 'Qui rep i explica': Object.assign(deLinies({ rols: DINS_REP.roles, parells: [] }), { pairs: DINS_REP.pairs, portes: DINS_REP.portes, dins: { 'Qui fa la visita': fill2 } }) },
    ideal: Object.assign(clona(IDEAL), { pos: { 'Visitant': [5, 5] }, alies: { 'Qui atén els grups': 'Qui rep i explica' } }) });
  const ex = M.exporta(M.importa(ric).arbre);
  ok(J(M.exporta(M.importa(ex).arbre)) === J(ex), 'amb pos, gomets, dins de dos nivells, portes i ideal amb àlies i treu: anada i tornada igual');
  ok(ex.dins['Qui rep i explica'].dins['Qui fa la visita'].portes['X→Qui fa la visita'] === 'P' && J(ex.ideal.treu) === J(IDEAL.treu) && ex.ideal.alies['Qui atén els grups'], 'no es perd res pel camí');
  ok(J(Object.keys(ex)) === J(['abast', 'roles', 'pairs', 'processos', 'seq', 'troballes', 'pos', 'gomets', 'dins', 'ideal']), 'l\'ordre de les claus: les sis i després els extres');
  const r = M.importa(Object.assign(clona(can), { pos: { 'Ningú': [1, 1], 'Qui fa el vi': [2, 2] }, dins: { 'El poble': 'no és un objecte' } }));
  ok(r.ignorats.pos === 1 && r.ignorats.dins === 1, `una pos de ningú i un dins que no és objecte es compten (${J(r.ignorats)})`);
  const r2 = M.importa(Object.assign(clona(can), { dins: { 'El poble': { roles: ['A'], port: { 'X→El poble': 'A' } } } }));
  ok(r2.arbre.real.dins['El poble'].portes['X→El poble'] === 'A', '«port» es llegeix com «portes»');
  let fons = { roles: ['R'] }; const arrel = { roles: ['R'], dins: { R: fons } };
  for (let i = 0; i < 7; i++) { const x = { roles: ['R'] }; fons.dins = { R: x }; fons = x; }
  const r3 = M.importa(arrel); let prof = 0, nn = r3.arbre.real;
  while (nn.dins.R) { nn = nn.dins.R; prof++; }
  ok(prof === 6 && r3.ignorats.profunditat === 1, `per sota del sisè nivell es descarta (${prof} nivells, ${r3.ignorats.profunditat} descartat)`);
}

console.log('\nM11 · Xarxes orfes');
{ const a = M.importa(Object.assign(deLiniesRef(EXEMPLE), { dins: { 'El poble': { roles: ['A', 'B'], pairs: [['A', 'B', 'tangible', 'x', 'intangible', 'y']] } } })).arbre;
  const n = a.real, rols = n.t.rols.split('\n').filter(x => x !== 'El poble').join('\n');
  const par = n.t.parells.split('\n').filter(l => !/El poble/.test(l)).join('\n');
  const a2 = M.substitueix(a, { vista: 'real', cami: [] }, Object.assign({}, n, { t: Object.assign({}, n.t, { rols, parells: par }) }));
  ok(!!a2.real.dins['El poble'] && J(M.orfes(a2.real)) === '["El poble"]', 'treure el rol del text deixa la xarxa a l\'arbre, com a orfa');
  const ex = M.exporta(a2);
  ok(!ex.dins && D.diagnostica(ex).nivells.length === 1, 'i ni l\'exportació ni el diagnòstic la veuen');
}

console.log('\nM12 · Reanomenar escrivint');
{ ok(J(M.detectaReanomenat('A\nB\nC', 'A\nBB\nC')) === '{"de":"B","a":"BB"}', 'una sola línia canviada és un canvi de nom');
  ok(M.detectaReanomenat('A\nB', 'A\nB\nC') === null && M.detectaReanomenat('A\nB', 'X\nY') === null, 'si canvia el nombre de línies, o més d\'una, no');
  const n = Object.assign(nv({ rols: 'A\nB' }), { pos: { A: [1, 1] }, dins: { A: nv({}) }, gomets: { 'A→B': 1 } });
  const t = M.traslladaExtres(n, 'A', 'AA');
  ok(J(t.pos) === '{"AA":[1,1]}' && t.dins.AA && J(Object.keys(t.gomets)) === '["AA→B"]', 'i la posició, la xarxa de dins i els gomets segueixen el nom');
}

console.log('\nM13 · L\'escena del celler');
{ const esc = o => M.escena(M.importa(o).arbre, { vista: 'real', cami: [] });
  const e = esc(EXEMPLE);
  ok(e.nodes.length === 7 && e.arestes.filter(a => a.estat === 'ple').length === 14 && !e.arestes.some(a => a.estat === 'tornada') && e.pendents === 0, `7 rols, 14 fletxes plenes i cap tornada pendent`);
  const o = clona(EXEMPLE); o.parells[5] = 'El distribuïdor | Qui fa el vi | t | la comanda i el pagament |  | ';
  const e1 = esc(o);
  ok(e1.arestes.filter(a => a.estat === 'tornada').length === 1 && e1.pendents === 1, 'amb el distribuïdor a mitges: 1 tornada fantasma');
  const o2 = clona(EXEMPLE); o2.parells.push('Qui fa el vi | ');
  ok(esc(o2).noDibuixable.some(x => x.camp === 'parells' && x.i === 7 && x.motiu === 'falta «a»'), 'un parell sense «a» va a la safata «No es pot dibuixar»');
  const o3 = clona(EXEMPLE); o3.parells[0] = o3.parells[0].replace('Qui fa el vi', 'Qui fa el vii');
  ok(esc(o3).nodes.some(x => x.nom === 'Qui fa el vii' && x.tipus === 'nodeclarat'), 'un rol mal escrit en un parell surt com a rol sense declarar');
  ok(e.arestes.find(a => a.clau === 'El poble→Qui rep i explica').seq === 'sempre' && e.arestes.find(a => a.clau === 'Qui fa el vi→Qui rep i explica').seq.pas === 1, 'cada fletxa porta la seva seqüència');
  ok(e.resum.nivells === 1 && e.resum.rolsTotal === 7 && e.resum.lliuramentsTotal === 14, 'i el resum per a la vista de falcó');
}

console.log('\nM14 · L\'escena de dins');
{ const a = M.importa(Object.assign(deLiniesRef(EXEMPLE), { dins: { 'Qui rep i explica': clona(DINS_REP) } })).arbre;
  const e = M.escena(a, { vista: 'real', cami: ['Qui rep i explica'] });
  const fora = e.arestes.filter(x => x.estat === 'fora');
  ok(e.nodes.filter(x => x.tipus === 'fora').length === 4 && fora.length === 8 && fora.filter(x => x.porta).length === 2, `4 rols de fora, 8 lliuraments de fora i 2 amb porta`);
  ok(e.profunditat === 1 && e.nodes.filter(x => x.tipus === 'rol').length === 5, 'i els 5 rols de dins');
  const dalt = M.escena(a, { vista: 'real', cami: [] });
  ok(dalt.nodes.find(x => x.nom === 'Qui rep i explica').dins.rols === 5 && dalt.resum.nivells === 2, 'des de dalt, el rol diu que té 5 rols a dins');
}

console.log('\nM15 · L\'escena de la desviació');
{ const a = M.importa(Object.assign(deLiniesRef(EXEMPLE), { ideal: IDEAL })).arbre;
  const e = M.escena(a, { vista: 'desviacio', cami: [] }, { diag: D });
  const nd = nom => e.nodes.find(x => x.nom === nom) || {};
  ok(nd('Qui porta l\'agenda').estat === 'falta' && nd('El distribuïdor').estat === 'propi' && nd('El poble').estat === 'igual', 'falta, propi i igual als nodes');
  ok(e.arestes.filter(x => x.estat === 'sobra').length === 1, 'una fletxa que sobra (l\'ideal la treu)');
  ok(e.arestes.some(x => x.estat === 'canvia' && x.canvi === 'mena') && e.arestes.some(x => x.estat === 'canvia' && x.canvi === 'sentit'), 'i fletxes que canvien de mena i de sentit');
  ok(e.arestes.filter(x => x.estat === 'falta').length === 4, 'i les 4 que falten');
}

console.log('\nM16 · Geometria');
{ const n = M.importa(EXEMPLE).arbre.real, rols = M.rolsDelNivell(n).tots, fl = fluxos(M.llegeixTextos(n.t));
  const p1 = M.colocaConcentric(rols, fl), p2 = M.colocaConcentric(rols, fl), v = Object.values(p1);
  let min = Infinity; v.forEach((a, i) => v.slice(i + 1).forEach(b => { min = Math.min(min, Math.hypot(a[0] - b[0], a[1] - b[1])); }));
  ok(J(p1) === J(p2) && J(p1['Qui rep i explica']) === '[0,0]' && min >= 2.6 * 32, `determinista, «Qui rep i explica» al centre i ${Math.round(min)} ≥ 2,6·R entre rols`);
  const pos = { a: [0, 0], b: [50, 0], c: [0, 60] }, f = M.forat(pos, [10, 10]);
  ok(Object.values(pos).every(q => Math.hypot(q[0] - f[0], q[1] - f[1]) >= 2.6 * 32), 'forat no trepitja ningú');
  const c = { x0: -100, y0: -50, x1: 300, y1: 150 }, k = M.encaixa(c, 800, 600), sx = x => k.k * x + k.tx, sy = y => k.k * y + k.ty;
  ok(sx(c.x0) >= 47.9 && sx(c.x1) <= 752.1 && sy(c.y0) >= 47.9 && sy(c.y1) <= 552.1, 'encaixa: la caixa hi cap amb el seu marge');
}

console.log('\nM16b · La geometria que es llegeix');
{ const tres = M.colocaConcentric(['A', 'B', 'C'], [{ de: 'A', a: 'B' }, { de: 'B', a: 'C' }, { de: 'A', a: 'C' }]), v3 = Object.values(tres);
  ok(v3.every(p => Math.abs(Math.hypot(p[0], p[1]) - 130) < 1), 'amb tres rols, un triangle sense ningú al mig: cap fletxa travessa un rol');
  const rols = ['C', 'A', 'B', 'D', 'E', 'F', 'G'], fl = [{ de: 'C', a: 'A' }, { de: 'C', a: 'B' }, { de: 'C', a: 'D' }, { de: 'C', a: 'E' }, { de: 'C', a: 'F' }, { de: 'C', a: 'G' }, { de: 'A', a: 'B' }, { de: 'D', a: 'E' }, { de: 'F', a: 'G' }];
  const P = M.colocaConcentric(rols, fl), ang = r => Math.atan2(P[r][1], P[r][0]), dif = (a, b) => { const d = Math.abs(ang(a) - ang(b)) % (2 * Math.PI); return Math.min(d, 2 * Math.PI - d); };
  ok(J(P.C) === '[0,0]' && [['A', 'B'], ['D', 'E'], ['F', 'G']].every(([a, b]) => dif(a, b) < Math.PI / 2), 'a l\'anell, els parells amb vincle queden de costat, no a banda i banda del centre');
  const a = M.importa(deLiniesRef(EXEMPLE)).arbre, e = M.escena(Object.assign({}, a, { real: Object.assign({}, a.real, { dins: { 'Qui rep i explica': M.nivellBuit() } }) }), { vista: 'real', cami: ['Qui rep i explica'] });
  const fo = e.nodes.filter(n => n.tipus === 'fora');
  let min = Infinity; fo.forEach((p, i) => fo.slice(i + 1).forEach(q => { min = Math.min(min, Math.hypot(p.x - q.x, p.y - q.y)); }));
  ok(fo.length >= 4 && min >= 2.6 * 32, `a dins d'un rol buit, els ${fo.length} rols de fora no es trepitgen (${Math.round(min)} ≥ 2,6·R)`);
}

console.log('\nM16c · Reanomenar amb un ideal');
{ const a0 = M.importa(Object.assign(deLiniesRef(EXEMPLE), { ideal: Object.assign(deLiniesRef(EXEMPLE), { alies: { 'Qui atén': 'Qui fa el vi' }, treu: ['El distribuïdor→Qui fa el vi'] }) })).arbre;
  const a1 = M.segueixNom(a0, { vista: 'real', cami: [] }, 'Qui fa el vi', 'Qui elabora el vi');
  ok(a1.ideal.alies['Qui atén'] === 'Qui elabora el vi' && J(a1.ideal.treu) === J(['El distribuïdor→Qui elabora el vi']), 'l\'àlies i el «treu» de l\'ideal segueixen el nom nou del real');
  ok(M.rolIdeal(a0, [], 'El poble') === 'El poble' && M.rolIdeal(a1, [], 'Qui fa el vi') === 'Qui fa el vi', 'rolIdeal troba el rol de l\'ideal que es llegeix com el del real');
  const r = M.reanomenaIdeal(a0, [], 'El poble', 'Qui viu al poble');
  ok(!r.error && M.rolsDelNivell(r.arbre.ideal).tots.includes('Qui viu al poble') && !M.rolsDelNivell(r.arbre.ideal).tots.includes('El poble') && M.rolsDelNivell(r.arbre.real).tots.includes('El poble'),
    'reanomenaIdeal canvia el nom només a l\'ideal');
}

console.log('\nM17 · I si s\'encalla?');
{ const e = M.encalla(celler(), 'Qui rep i explica');
  ok(e.para.length === 8 && e.total === 14, `es paren ${e.para.length} dels ${e.total}`);
  ok(J(e.perden) === J([{ rol: 'L\'operador de luxe', k: 1, de: 1 }, { rol: 'El visitant', k: 1, de: 2 }, { rol: 'El poble', k: 1, de: 2 }]), 'perden la meitat o més: l\'operador (1 d\'1), el visitant (1 de 2) i el poble (1 de 2)');
  ok(/es paren 8 dels 14/.test(e.text), e.text);
  const m = celler(); m.troballes = m.troballes.concat([e.troballa]);
  const rv = revisa(m).regles;
  ok(rv.find(g => g.id === 'xifres').ok && rv.find(g => g.id === 'noms').ok, 'la troballa que en surt passa les regles 8 i 9');
}

console.log('\nM18 · El pols');
{ const p = M.planPols(celler()), n = t => p.frames.filter(f => f.tipus === t).length;
  ok(n('titol') === 3 && n('pas') === 8 && n('final') === 1 && p.sempre.length === 4 && p.sensePas.length === 2, `3 processos, 8 passos, 4 «sempre» i 2 sense pas`);
  const q = M.planPols(celler(), { encallat: 'Qui rep i explica' }), visita = q.frames.filter(f => f.tipus === 'pas' && f.proces === 'visita');
  ok(visita[0].atura && visita.slice(1).every(f => f.noArriba) && visita.length === 4, '«La visita» s\'atura al pas 1 i els passos 2 a 4 no arriben');
  ok(q.frames.filter(f => f.tipus === 'pas' && f.proces !== 'visita').every(f => !f.atura && !f.noArriba), 'i els altres dos processos segueixen');
}

console.log('\nM19 · Les vuit preguntes');
{ const v = M.vuitPreguntes(celler(), D.metriques(celler()));
  ok(v.length === 8 && /Qui rep i explica/.test(v[0].dada) && /8 de 14/.test(v[0].dada), 'vuit, i la primera: ' + v[0].dada);
  ok(v.every(x => x.pregunta && x.dada) && !/incompliment/i.test(J(v)), 'cada una amb la seva dada, i sense «incompliment»');
  ok(/El poble/.test(v[6].dada) && /sala/.test(v[2].dada), 'qui no rep cap intangible, i el que el mapa sol no pot saber');
}

console.log('\nM20 · Desfer');
{ const h = M.creaHistoria(100);
  h.desa('s0', 'a', 'g', 0); h.desa('s1', 'b', 'g', 500);
  ok(h.mida() === 1, 'el mateix grup en menys d\'1 s és un sol pas');
  h.desa('s2', 'c', 'g', 1700);
  ok(h.mida() === 2, 'i passat més d\'1 s, no');
  const h2 = M.creaHistoria(100);
  for (let i = 0; i < 150; i++) h2.desa('s' + i, 'x', null, i);
  ok(h2.mida() === 100, 'com a molt 100 passos');
  const h3 = M.creaHistoria();
  h3.desa('A', 'a'); h3.desa('B', 'b');
  const d1 = h3.desfes('C'), d2 = h3.desfes('B'), r1 = h3.refes('A'), r2 = h3.refes('B');
  ok(d1 === 'B' && d2 === 'A' && r1 === 'B' && r2 === 'C' && h3.desfes('X') === 'B', 'desfer i refer tornen les instantànies exactes');
}

console.log('\nM21 · Sense efectes');
{ const base = M.importa(Object.assign(deLiniesRef(EXEMPLE), { pos: { 'Qui fa el vi': [1, 1] }, gomets: { 'Qui fa el vi→Qui rep i explica': 1 },
    dins: { 'Qui rep i explica': clona(DINS_REP) }, ideal: IDEAL })).arbre;
  const abans = J(base); congela(base);
  const n = base.real, c = 'Qui fa el vi→Qui rep i explica';
  let e = null;
  try {
    [M.opAbast(n, 'x'), M.opRol(n, 'Qui n\'és nou', [1, 2]), M.opReanomenaRol(n, 'Qui fa el vi', 'Qui elabora'), M.opEsborraRol(n, 'Qui rep i explica'),
      M.opMouRol(n, 'El poble', [9, 9]), M.opOrdreRol(n, 'El poble', -1), M.opOrdreParell(n, 0, 1), M.opFlux(n, 'El poble', 'Nou', 'i', 'x'),
      M.opEditaFlux(n, c, { q: 'y', mena: 'i' }), M.opInverteix(n, c), M.opEsborraFlux(n, c), M.opCanviaExtrems(n, c, 'El poble', 'El visitant'),
      M.opProces(n, 'Nou'), M.opEditaProces(n, 'visita', { nom: 'V' }), M.opOrdreProces(n, 'canal', -1), M.opEsborraProces(n, 'visita'),
      M.opPas(n, 'Qui rep i explica→El poble', 'visita', 2, 'insereix'), M.opTreuPas(n, c), M.opSempre(n, 'El poble→El visitant', true),
      M.opTroballa(n, 'a', 'b'), M.opGomet(n, c, -2), M.opPorta(n.dins['Qui rep i explica'], 'X→Y', 'Qui fa la visita'), M.opCreaDins(n, 'El poble'), M.opEndreca(n)];
    M.copiaIdeal(base); M.idealBlanc(base); M.posaAlies(base, 'Visitant', 'El visitant');
    M.portaAlReal(base, { cami: [] }, { tipus: 'rol', nom: 'Qui porta l\'agenda' }); M.portaAIdeal(base, { cami: [] }, { tipus: 'rol', nom: 'El distribuïdor' });
    M.escena(base, { vista: 'desviacio', cami: [] }, { diag: D }); M.escena(base, { vista: 'real', cami: ['Qui rep i explica'] });
    M.exporta(base); M.completaPos(n, n);
  } catch (x) { e = x; }
  ok(!e, 'cap operació toca l\'entrada congelada' + (e ? ': ' + e.message : ''));
  ok(J(base) === abans, 'i l\'arbre segueix idèntic');
}

console.log('\nM22 · La web que surt del mapa (VS-WEB)');
{ const webDelMapa = new Function('\'use strict\';\n' + bloc('VS-WEB') + '\nreturn webDelMapa;')();
  const m = congela(celler()), abans = J(m);
  const w = webDelMapa(m);
  ok(w.formato === 'tt-web-1' && w.titol === EXEMPLE.abast, 'el format i el títol surten del mapa');
  ok(J(w.casa) === J(['Qui rep i explica']), 'per defecte, la casa és el rol amb més lliuraments');
  ok(w.portes.length === EXEMPLE.rols.length - 1 && w.portes.every(p => p.rol !== 'Qui rep i explica'), 'una porta per a cada rol que no és de casa');
  const ids = w.menu.map(x => x.id);
  ok(new Set(ids).size === ids.length, 'cap pàgina del menú repeteix l\'adreça');
  ok(ids[0] === 'inici' && ids[ids.length - 1] === 'equip' && ids.includes('serveis'), 'el menú comença a Inici i acaba a «Per a l\'equip»');
  ok(w.serveis.map(s => s.nom).join('|') === 'La visita|El dia al poble|La venda pel canal', 'els serveis són els processos, en ordre');
  ok(w.serveis[0].passos.map(p => p.n).join() === '1,2,3,4' && w.serveis[0].passos[0].de === 'Qui fa el vi', 'i cada servei porta els passos en ordre');
  const porta = r => w.portes.find(p => p.rol === r);
  ok(porta('El visitant').compte && porta('L\'operador de luxe').compte, 'compte quan hi ha anada i tornada amb casa');
  ok(!porta('El distribuïdor').compte && porta('El distribuïdor').buida, 'sense compte ni contingut quan no hi ha res amb casa');
  ok(J(w.alta) === J(w.portes.filter(p => p.compte).map(p => p.rol)), 'l\'alta és la llista dels que tenen compte');
  const v = porta('El visitant');
  ok(v.rep[0].q === 'la visita, el tast i el relat de la casa' && v.dona[0].q === 'la confiança de qui ha estat aquí', 'la porta diu què et donem i què ens dones, amb les paraules del mapa');
  ok(v.benvinguda.map(b => b.pas).join() === 'coneix,compte,connecta,primer,demanem', 'la benvinguda: coneix, compte, connecta, primer, demanem');
  ok(porta('El distribuïdor').benvinguda.map(b => b.pas).join() === 'coneix,sense-compte', 'qui no té relació amb casa no ha de donar-se d\'alta');
  ok(porta('L\'operador de luxe').connexions.some(c => c.cat === 'crm' && c.per === 'client'), 'les connexions es proposen i diuen per quina paraula');
  ok(w.sempre.length === 4 && w.sempre.every(s => m.seq[s.de + '→' + s.a] === 'sempre'), 'el que passa sempre surt a part');
  const w2 = webDelMapa(m, { casa: ['Qui rep i explica', 'Qui fa el vi', 'Qui no hi és'] });
  ok(J(w2.casa) === J(['Qui rep i explica', 'Qui fa el vi']), 'la casa la pot triar qui dibuixa; un nom que no és al mapa no hi entra');
  ok(w2.portes.find(p => p.rol === 'El distribuïdor').compte && w2.equip.intern.length === 2, 'amb dos rols de casa, el canal té compte i el que es donen va a l\'equip');
  ok(J(m) === abans, 'no toca el mapa');
  const buit = webDelMapa({ roles: [], pairs: [], processos: [], seq: {} });
  ok(buit.portes.length === 0 && J(buit.menu.map(x => x.id)) === J(['inici', 'equip']), 'un mapa buit dona una web buida que no peta');
  const xoc = webDelMapa({ roles: ['Casa', 'Inici', 'Serveis', 'Serveis!'], pairs: [['Casa', 'Inici', 't', 'a', 'i', 'b'], ['Casa', 'Serveis', 't', 'c', '', ''], ['Casa', 'Serveis!', 't', 'd', '', '']], processos: [], seq: {} });
  const xi = xoc.menu.map(x => x.id);
  ok(new Set(xi).size === xi.length && xi.filter(x => x === 'inici').length === 1, 'un rol que es diu com una pàgina fixa no la trepitja');
}

console.log('\nM23 · Els patrons del flux');
{ const P = D.patrons(celler()), v = P.llista.find(x => x.id === 'visita'), c = P.llista.find(x => x.id === 'canal');
  ok(P.llista.length === 3 && v.passos === 4 && v.traspassos === 3 && v.relleus === 2, 'la visita: 4 passos, 3 canvis de mans, 2 relleus');
  ok(v.fil.rols[0] === 'Qui fa el vi' && J(v.fil.talls) === '[3]' && J(v.salts) === '[3]', 'el fil comença on comença, i es talla on el valor salta');
  ok(J(v.coll) === '["Qui rep i explica"]' && !v.cicle, 'el coll d\'ampolla és qui rep i explica, i no tanca el cercle');
  ok(c.cicle && c.fil.talls.length === 0, 'el canal sí que torna a qui l\'ha obert, sense talls');
  ok(P.llista.every(x => x.ideal === null), 'sense ideal no hi ha comparació');
  const Q = D.patrons(celler(), deLinies(IDEAL)), vi = Q.llista.find(x => x.id === 'visita').ideal;
  ok(vi && vi.passos === 3 && vi.traspassos === 2, 'amb l\'ideal, la visita optimitzada: 3 passos, 2 canvis de mans');
  ok(J(vi.estalvia) === '["L\'operador de luxe"]' && vi.afegeix.length === 0, 'i s\'estalvia l\'operador (els noms casen encara que l\'ideal els escrigui diferent)');
  ok(Q.llista.find(x => x.id === 'canal').ideal === null, 'el procés que l\'ideal no té, sense comparació');
  const m = celler(); const abans = J(m); D.patrons(m, deLinies(IDEAL));
  ok(J(m) === abans, 'no toca el mapa');
}

console.log('\n' + (fail ? `❌ ${fail} fallen de ${pass + fail}` : `✅ ${pass} assercions, totes verdes`));
process.exit(fail ? 1 : 0);
