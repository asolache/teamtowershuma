/* El mòdul de suport al mapa de valor · el que cap guarda de marcatge veurà
 * ────────────────────────────────────────────────────────────────────────
 * Una consola que ensenya deu regles i no les corre és un pòster, i és
 * exactament el defecte que aquesta casa ja ha pagat tres vegades: el marcatge
 * hi és, els botons es premen i no passa res. Cap guarda de text ho veu.
 *
 * Per això això es mesura **sobre el veredicte que surt a la pantalla**, i no
 * sobre les classes: es trenca un mapa correcte d'una manera concreta i s'espera
 * que **la regla que toca** —i no una altra— ho digui.
 *
 *   node SOS/tests/test-vna-suport.mjs
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const DIR = dirname(fileURLToPath(import.meta.url));
const PAG = 'file://' + join(DIR, '..', 'vna-suport.html');
const V = createRequire(import.meta.url)('../tools/build-vna-suport.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const errs = [];
const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
p.on('pageerror', e => errs.push(e.message));
await p.goto(PAG);
await p.waitForTimeout(300);

console.log('\nEl mòdul de suport al mapa de valor');

/* ── 1 · La pàgina buida diu què falta, i no es calla ───────────────────── */
console.log('\n1 · Buida');
{
  const r = await p.evaluate(() => window.__VS.revisio);
  ok(!r.passa && r.dures > 0, `una pàgina buida no passa: ${r.dures} regles dures obertes`);
  const abast = r.regles.find(x => x.id === 'abast');
  ok(abast && !abast.ok && /abast|activitat/i.test(abast.diu),
    'i la primera cosa que demana és l\'abast · ' + (abast ? abast.diu : '—'));
}

/* ── 2 · El cas d'exemple passa les dures ───────────────────────────────── */
console.log('\n2 · El cas del celler');
await p.click('#btExemple');
await p.waitForTimeout(200);
{
  const r = await p.evaluate(() => ({
    v: window.__VS.revisio, fluxos: window.__VS_API.fluxos(window.__VS.mapa).length,
    files: document.querySelectorAll('.tp tbody tr').length,
    passes: document.querySelectorAll('.pa.fet').length,
    vered: document.getElementById('vered').className
  }));
  ok(r.v.passa, `cap regla dura trencada (${r.v.toves} avís/os tous)`);
  ok(r.fluxos === 14, `set parells en fan ${r.fluxos} transaccions: l'expander és el mateix del SOS`);
  ok(r.files === r.fluxos, `i les ${r.files} surten a la taula, no només al comptador`);
  ok(r.passes === 6, `les sis passes es marquen soles (${r.passes}/6)`);
  ok(/\bbe\b/.test(r.vered), 'i el veredicte és verd');
}

/* ── 3 · Cada trencament el diu la regla que toca ────────────────────────
   Això és el cor de la prova. Una regla que salta amb qualsevol cosa és soroll;
   una que no salta mai és decoració. Es trenca una cosa i s'espera **aquella**. */
console.log('\n3 · Trencar-lo d\'una manera i que ho digui la regla que toca');
const trenca = async (camp, valor, regla, titol) => {
  await p.click('#btExemple');
  await p.waitForTimeout(100);
  await p.fill('#' + camp, valor);
  await p.waitForTimeout(150);
  const r = await p.evaluate(() => window.__VS.revisio);
  const x = r.regles.find(g => g.id === regla);
  const altres = r.regles.filter(g => !g.ok && g.id !== regla && g.dur).map(g => g.id);
  ok(x && !x.ok, `${titol} → ho diu «${regla}»` + (x ? ' · ' + x.diu.slice(0, 68) : ''));
  return altres;
};
await trenca('abast', '', 'abast', 'treure l\'abast');
await trenca('rols', 'A\nB\nC', 'rols', 'deixar-hi tres rols');
await trenca('parells',
  'Qui fa el vi | Qui rep i explica | t | el vi | t | el full de comanda\n'
  + 'Qui rep i explica | El visitant | t | la visita | t | el pagament\n'
  + 'El visitant | El poble | t | el que es gasta | t | el tiquet\n'
  + 'El poble | Qui fa el vi | t | el camí cuidat | t | la quota\n'
  + 'La vinya i el veïnat | Qui fa el vi | t | la vinya | t | el jornal\n'
  + 'El distribuïdor | Qui fa el vi | t | la comanda | t | la caixa\n'
  + 'L\'operador de luxe | Qui rep i explica | t | el grup | t | la factura',
  'menes', 'deixar-hi només tangibles');
await trenca('parells',
  'Qui fa el vi | Qui rep i explica | t | el vi | |\n'
  + 'Qui rep i explica | El visitant | t | la visita | i | la confiança\n'
  + 'El visitant | El poble | t | el que es gasta | i | parlar-ne\n'
  + 'El poble | La vinya i el veïnat | i | el lloc | t | el camí\n'
  + 'La vinya i el veïnat | Qui fa el vi | t | la vinya | i | què aguanta\n'
  + 'El distribuïdor | Qui fa el vi | t | la comanda | i | què es mou\n'
  + 'L\'operador de luxe | Qui rep i explica | t | el grup | i | què demana',
  'reciprocitat', 'deixar un vincle a mitges');
await trenca('troballes', 'Al poble hi ha 4.000 € que ningú compta | i es perden cada any',
  'xifres', 'posar-hi una xifra');
await trenca('troballes', 'La Maria Puig no té rol assignat | i si plega s\'atura tot',
  'noms', 'posar-hi un nom propi');
await trenca('processos', 'visita | La visita | Del primer contacte al comiat',
  'processos', 'deixar-hi un sol procés');

/* Un rol solt: es declara i no se li dona res. */
await p.click('#btExemple');
await p.waitForTimeout(100);
await p.evaluate(() => {
  const t = document.getElementById('rols');
  t.value = t.value + '\nQui porta els comptes';
  t.dispatchEvent(new Event('input'));
});
await p.waitForTimeout(150);
{
  const r = await p.evaluate(() => window.__VS.revisio);
  const x = r.regles.find(g => g.id === 'solts');
  ok(x && !x.ok && /comptes/.test(x.diu), 'afegir un rol a qui ningú dona res → ho diu «solts» · ' + (x ? x.diu.slice(0, 56) : '—'));
}

/* ── 4 · El text per a la IA porta el mètode i el que falta ─────────────── */
console.log('\n4 · El que se li dona a una IA');
await p.click('#btExemple');
await p.waitForTimeout(150);
{
  const txt = await p.evaluate(() => window.__VS_API.promptDeTreball());
  ok(/Value Network Analysis/.test(txt), 'porta el mètode, i no només la forma de la resposta');
  ok(/es decideix pel contracte/i.test(txt), 'i el criteri de tangible/intangible, que és el que més s\'erra');
  ok(V.REGLES.every(r => txt.includes(r.t)), `i les ${V.REGLES.length} regles, amb les mateixes paraules que les comproven`);
  ok(/EL QUE JA HI HA AL MAPA|proposa CANVIS/.test(txt),
    'i el mapa que ja hi ha: per proposar canvis i no un de nou que esborra el que la casa sabia');
  ok(/"pairs"/.test(txt) && /"abast"/.test(txt), 'i la forma canònica, amb `abast` primer');
  ok(!/\bMaria\b|\bSL\b|€/.test(txt), 'i cap nom ni cap xifra que no sigui del mapa');
}

/* ── 5 · El motor de la pàgina i el de Node diuen el mateix ─────────────
   Són el mateix codi: `build-vna-suport.js` escriu les regles a la pàgina amb
   `toString()`. Si algú les edita a la pàgina, aquí es veu — i aquesta és
   l'única manera que una consola i una guarda no puguin divergir. */
console.log('\n5 · La pàgina i Node revisen igual');
{
  const mapa = await p.evaluate(() => window.__VS.mapa);
  const nav = await p.evaluate(() => window.__VS.revisio);
  const node = V.revisa(mapa);
  ok(node.passa === nav.passa && node.dures === nav.dures && node.toves === nav.toves,
    `mateix veredicte als dos costats (passa ${node.passa}, ${node.dures} dures, ${node.toves} toves)`);
  const difs = node.regles.filter((r, i) => r.ok !== nav.regles[i].ok || r.diu !== nav.regles[i].diu);
  ok(!difs.length, 'i les deu regles diuen literalment el mateix'
    + (difs.length ? ' — difereixen: ' + difs.map(d => d.id).join(', ') : ''));
}

/* ── 5b · L'esborrany des del material ──────────────────────────────────
   El que importa és la tornada: una resposta embolicada com la torna un model
   ha d'acabar als sis camps i passar per les mateixes regles, i una resposta
   que no es llegeix no ha de tocar res. */
console.log('\n5b · L\'esborrany des del material');
{
  const abans = await p.evaluate(() => window.__VS.mapa);
  const enc = await p.evaluate(() => window.__VS_API.encarrecMaterial());
  ok(enc.includes('"dubtes"') && /forat/.test(enc), 'l\'encàrrec demana dubtes en comptes d\'invencions');
  await p.click('#btBuida');
  await p.fill('#resposta', 'Aquí el tens:\n```json\n' + JSON.stringify(Object.assign({}, abans,
    { dubtes: ['Qui obre el celler en festius?'] })) + '\n```\nEspero que serveixi.');
  await p.click('#btCarrega');
  await p.waitForTimeout(150);
  const r = await p.evaluate(() => ({ m: window.__VS.mapa, v: window.__VS.revisio,
    d: document.querySelectorAll('#dubtes li').length, est: document.getElementById('preEstat').textContent }));
  ok(JSON.stringify(r.m) === JSON.stringify(abans), 'la resposta embolicada torna exactament el mateix mapa');
  ok(r.v.passa && r.d === 1, `i passa per les regles, amb la pregunta a la vista · ${r.est}`);
  await p.fill('#resposta', 'no hi ha cap JSON aquí');
  await p.click('#btCarrega');
  const r2 = await p.evaluate(() => ({ m: window.__VS.mapa, est: document.getElementById('preEstat').textContent }));
  ok(JSON.stringify(r2.m) === JSON.stringify(abans) && /No s'ha pogut/.test(r2.est), 'una resposta que no es llegeix no toca res');
  const web = await p.evaluate(() => window.__VS_API.encarrecWeb());
  ok(web.includes('"pairs"') && /CRM/.test(web) && /CLAUDE\.md/.test(web),
    'l\'encàrrec de la web porta el mapa, el CLAUDE.md i la regla del CRM');
}

/* ── 7A · L'editor, per ganxos ───────────────────────────────────────────
   El dibuix encara no hi és, però tot el que farà ja passa per `__VS_ED`: si
   els ganxos, el text dels sis camps i l'arbre no diuen el mateix, cap llenç
   ho arreglarà. Es mesura sobre el que llegeix la pàgina (`llegeix`, `revisa`,
   `#vered`), no sobre l'estat intern. */
console.log('\n7A · L\'editor, per ganxos');
const camps6 = () => p.evaluate(() => ['abast', 'rols', 'parells', 'processos', 'seq', 'troballes']
  .map(id => document.getElementById(id).value));

console.log('\n7A.1 · Construir el celler sense escriure el formulari');
{
  await p.click('#btBuida');
  const r = await p.evaluate(() => {
    const E = window.__VS_ED, A = window.__VS_API, X = A.EXEMPLE, sp = l => l.split('|').map(s => s.trim());
    let clics = 0, lliures = 0;
    const tecla = s => { clics += s.length; return s; }, text = s => { lliures += s.length; return s; };
    const fets = [];
    fets.push(E.abast(text(X.abast)));
    X.rols.forEach(n => fets.push(E.rol(tecla(n))));
    X.parells.forEach(l => {
      const c = sp(l);
      fets.push(E.flux(c[0], c[1], c[2], tecla(c[3])));
      fets.push(E.tornada(c[0], c[1], c[4], tecla(c[5])));
    });
    const ids = {};
    X.processos.forEach(l => { const c = sp(l); ids[c[0]] = E.proces(tecla(c[1]), text(c[2])); });
    let passos = 0, sempres = 0;
    X.seq.forEach(l => {
      const c = sp(l);
      if (c[1] === 'sempre') { fets.push(E.sempre(c[0])); sempres++; }
      else { fets.push(E.pas(c[0], ids[c[1]], Number(c[2]))); passos++; }
    });
    X.troballes.forEach(l => { const c = sp(l); fets.push(E.troballa(text(c[0]), text(c[1]))); });
    const fet = A.llegeix(), rev = window.__VS.revisio;
    const escrit = ['abast', 'rols', 'parells', 'processos', 'seq', 'troballes']
      .map(k => (Array.isArray(X[k]) ? X[k].join('\n') : X[k]).length).reduce((a, b) => a + b, 0);
    A.omple();
    return { fet, rev, ref: A.llegeix(), refRev: window.__VS.revisio, clics, lliures, escrit, passos, sempres,
      errors: fets.filter(x => !x.ok).map(x => x.error || x.conflicte), ids };
  });
  const S = a => JSON.stringify(a.map(x => JSON.stringify(x)).sort());
  const nomDe = m => Object.fromEntries(m.processos.map(x => [x.id, x.nom]));
  const seqPerNom = m => { const n = nomDe(m);
    return Object.keys(m.seq).map(k => [k, m.seq[k] === 'sempre' ? 'sempre' : [n[m.seq[k][0]], m.seq[k][1]]]); };
  ok(!r.errors.length && r.passos === 8 && r.sempres === 4,
    '7 rols, 7+7 lliuraments, 3 processos, 8 passos, 4 «sempre» i 2 troballes, sense cap error'
    + (r.errors.length ? ' — ' + JSON.stringify(r.errors[0]) : ''));
  ok(r.fet.abast === r.ref.abast && JSON.stringify(r.fet.roles) === JSON.stringify(r.ref.roles)
    && S(r.fet.pairs) === S(r.ref.pairs), 'mateix abast, mateixos rols en el mateix ordre i mateixos parells que «omple»');
  ok(S(r.fet.processos.map(x => [x.nom, x.d])) === S(r.ref.processos.map(x => [x.nom, x.d]))
    && S(seqPerNom(r.fet)) === S(seqPerNom(r.ref)) && JSON.stringify(r.fet.troballes) === JSON.stringify(r.ref.troballes),
    'i els mateixos processos, passos i troballes (els id dels processos surten del nom: ' + Object.values(r.ids).join(', ') + ')');
  const difs = r.rev.regles.filter((x, i) => x.ok !== r.refRev.regles[i].ok || x.diu !== r.refRev.regles[i].diu);
  ok(r.rev.passa === r.refRev.passa && r.rev.dures === r.refRev.dures && r.rev.toves === r.refRev.toves && !difs.length,
    'i les deu regles diuen literalment el mateix' + (difs.length ? ' — difereixen: ' + difs.map(d => d.id).join(', ') : ''));
  ok(r.clics <= 700, `noms de rol, lliuraments i processos: ${r.clics} caràcters tecleats (≤ 700), cap nom de rol repetit`);
  ok(r.clics + r.lliures < 0.6 * r.escrit,
    `tot el que es tecleja, abast, descripcions i troballes incloses: ${r.clics + r.lliures} de ${r.escrit} del formulari escrit`);
}

console.log('\n7A.2 · Del text a l\'arbre');
{
  await p.click('#btBuida');
  await p.evaluate(() => { window.__VS_ED.rol('Qui fa el vi', 120, 80); window.__VS_ED.rol('El visitant', 320, 80); });
  await p.fill('#rols', 'Qui fa el vi\nEl visitant\nEl poble');
  const a = await p.evaluate(() => window.__VS_ED.arbre().real);
  ok(a.t.rols === 'Qui fa el vi\nEl visitant\nEl poble', 'el que s\'escriu a «Els rols» és a l\'arbre a l\'instant');
  await p.fill('#rols', 'Qui elabora el vi\nEl visitant\nEl poble');
  const b2 = await p.evaluate(() => window.__VS_ED.arbre().real);
  ok(JSON.stringify(b2.pos['Qui elabora el vi']) === JSON.stringify(a.pos['Qui fa el vi']) && !b2.pos['Qui fa el vi'],
    'i reanomenar una línia s\'emporta la posició del rol: ' + JSON.stringify(b2.pos['Qui elabora el vi']));
}

console.log('\n7A.3 · Només es reescriu la línia que toca');
{
  await p.click('#btBuida');
  await p.fill('#rols', 'Qui fa el vi\nQui rep i explica\nEl visitant');
  await p.fill('#parells', 'Qui fa el vi | \n\nQui rep i explica | El visitant | t | la visita');
  const r = await p.evaluate(() => {
    const x = window.__VS_ED.tornada('Qui rep i explica', 'El visitant', 'i', 'la confiança');
    return { x, v: document.getElementById('parells').value };
  });
  const ls = r.v.split('\n');
  ok(r.x.ok && ls[0] === 'Qui fa el vi | ' && ls[1] === '' && ls.length === 3,
    'la línia a mig escriure i la línia en blanc queden intactes');
  ok(ls[2] === 'Qui rep i explica | El visitant | t | la visita | i | la confiança', 'i la tornada s\'escriu a la seva línia: ' + ls[2]);
}

console.log('\n7A.4 · Invertir, esborrar, desfer i refer');
{
  await p.click('#btBuida');
  const r = await p.evaluate(() => {
    const E = window.__VS_ED, v = id => document.getElementById(id).value;
    E.rol('A'); E.rol('B'); E.flux('A', 'B', 't', 'el vi');
    const id = E.proces('La visita'); E.pas('A→B', id, 1);
    E.inverteix('A→B');
    const inv = { parells: v('parells'), seq: v('seq') };
    E.esborra('B→A');
    return { id, inv, esb: { parells: v('parells'), seq: v('seq') } };
  });
  ok(/^B \| A \| t \| el vi/.test(r.inv.parells) && r.inv.seq === 'B→A | ' + r.id + ' | 1',
    'invertir reescriu la línia del parell i la clau del pas: ' + r.inv.seq);
  ok(r.esb.parells === '' && r.esb.seq === '', 'i esborrar-lo treu la línia i el pas');
  await p.click('#btBuida');
  const h = await p.evaluate(() => {
    const E = window.__VS_ED, foto = () => JSON.stringify(E.arbre()) + JSON.stringify(window.__VS_API.llegeix());
    const buit = foto(), fets = [];
    ['A', 'B', 'C', 'D', 'E'].forEach(x => fets.push(E.rol(x)));
    [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'A']].forEach(([x, y]) => fets.push(E.flux(x, y, 't', 'de ' + x + ' a ' + y)));
    [['A', 'B'], ['B', 'C'], ['C', 'D']].forEach(([x, y]) => fets.push(E.tornada(x, y, 'i', 'de ' + y + ' a ' + x)));
    const p1 = E.proces('La visita'), p2 = E.proces('El canal');
    fets.push({ ok: !!p1 }, { ok: !!p2 });
    fets.push(E.pas('A→B', p1, 1), E.pas('B→C', p1, 2), E.sempre('B→A'), E.troballa('Una troballa', 'amb la seva dada'));
    fets.push(E.inverteix('E→A'));
    const ple = foto();
    let d = 0, f = 0;
    for (let i = 0; i < 20; i++) d += E.desfes() ? 1 : 0;
    const tornat = foto();
    for (let i = 0; i < 20; i++) f += E.refes() ? 1 : 0;
    return { n: fets.length, mal: fets.filter(x => !x.ok).length, d, f, buit: tornat === buit, ple: foto() === ple };
  });
  ok(h.n === 20 && !h.mal && h.d === 20 && h.buit, `20 operacions des de buit i 20 «desfés» tornen al buit exacte`);
  ok(h.f === 20 && h.ple, 'i 20 «refés» les recuperen totes');
}

console.log('\n7A.5 · Nivells: entrar a dins d\'un rol');
{
  await p.click('#btExemple');
  const arrel = await camps6();
  const r = await p.evaluate(() => {
    const E = window.__VS_ED, e = E.entra('Qui rep i explica', { crea: true });
    const camps = ['abast', 'rols', 'parells', 'processos', 'seq', 'troballes'].map(id => document.getElementById(id).value);
    return { e, camps, roles: window.__VS.mapa.roles, lloc: E.lloc() };
  });
  ok(r.e.ok && r.camps.every(x => x === '') && r.roles.length === 0 && r.lloc.cami.join() === 'Qui rep i explica',
    'entrar-hi per primer cop deixa els sis camps buits i el mapa sense rols');
  const d = await p.evaluate(() => {
    const E = window.__VS_ED;
    E.rol('Qui acull'); E.rol('Qui guia'); E.flux('Qui acull', 'Qui guia', 't', 'el grup a punt');
    const rv = window.__VS.revisio, rols = rv.regles.find(x => x.id === 'rols');
    const li = document.querySelector('.rg[data-regla="rols"]'), txt = document.getElementById('vered').textContent;
    return { rols, estat: li && li.dataset.estat, diu: li && li.querySelector('.rg-d').textContent,
      dures: rv.dures, vered: (txt.match(/(\d+) regla/) || [])[1], passaVered: /Cap regla dura/.test(txt), abast: rv.regles.find(x => x.id === 'abast') };
  });
  ok(!d.rols.ok && d.rols.dur && d.estat === 'nota', 'a dins, dos rols són una nota i no una regla dura trencada · ' + d.diu);
  ok(d.passaVered ? d.dures === 1 : Number(d.vered) === d.dures - 1,
    `i el veredicte no la compta: ${d.passaVered ? 'cap dura' : d.vered + ' dures'} de les ${d.dures} que diu el motor`);
  ok(d.abast.ok, 'l\'abast buit de dins hereta el de dalt');
  const up = await p.evaluate(() => window.__VS_ED.puja());
  ok(up.ok && JSON.stringify(await camps6()) === JSON.stringify(arrel), 'pujar torna els sis camps de l\'arrel idèntics');
  const x = await p.evaluate(() => {
    const E = window.__VS_ED, o = E.exporta();
    window.__VS_API.carrega(o);
    return { o, dins: o.dins && o.dins['Qui rep i explica'] && o.dins['Qui rep i explica'].roles.length, torna: E.exporta() };
  });
  ok(x.dins === 2, '«Copia el JSON» porta la xarxa de dins amb els seus 2 rols');
  ok(JSON.stringify(x.torna) === JSON.stringify(x.o), 'i carregar-lo torna exactament el mateix');
}

console.log('\n7A.6 · Real, ideal i desviació');
{
  const r = await p.evaluate(() => {
    const E = window.__VS_ED, pas = [];
    pas.push(E.ideal('copia'), E.vista('ideal'), E.esborra('El distribuïdor'),
      E.flux('El poble', 'Qui fa el vi', 'i', 'el nom del poble a l\'etiqueta'), E.vista('desviacio'));
    const d = E.desviacio(), cos = document.body.innerText;
    E.vista('real');
    return { mal: pas.filter(x => !x.ok).map(x => x.error), d, incompliment: /incompliment/i.test(cos) };
  });
  ok(!r.mal.length && r.d, 'copiar el real a l\'ideal, treure-hi un rol, afegir-hi un lliurament i mirar la desviació'
    + (r.mal.length ? ' — ' + r.mal[0] : ''));
  ok(r.d && JSON.stringify(r.d.rols.falten) === '[]' && JSON.stringify(r.d.rols.propis) === JSON.stringify(['El distribuïdor']),
    'al real no hi falta cap rol, i «El distribuïdor» és propi del real');
  ok(r.d && r.d.fluxos.falten.length === 1, `al real li falta ${r.d ? r.d.fluxos.falten.length : '?'} lliurament: el que l'ideal hi ha afegit`);
  ok(!r.incompliment, 'i enlloc de la pàgina hi diu «incompliment»: és una desviació');
}

console.log('\n7A.7 · El diagnòstic');
{
  await p.click('#btExemple');
  const r = await p.evaluate(() => ({ api: window.__VS_API.diag.diagnostica(window.__VS.mapa).troballes.length,
    ed: window.__VS_ED.diagnosi().troballes.length }));
  ok(r.api === 14 && r.ed === 14, `el celler dona ${r.api} troballes al motor i ${r.ed} a l'editor`);
}

console.log('\n7A.8 · I si s\'encalla?');
{
  const r = await p.evaluate(() => {
    const E = window.__VS_ED, e = E.encalla('Qui rep i explica'), abans = window.__VS.revisio.regles.find(x => x.id === 'xifres').ok;
    const t = E.troballa(e.troballa.t, e.troballa.d);
    const rv = window.__VS.revisio.regles, tb = window.__VS_API.llegeix().troballes;
    return { text: e.text, abans, t, xifra: /\d/.test(e.troballa.t + e.troballa.d), hi: tb.some(x => x.t === e.troballa.t),
      despres: rv.find(x => x.id === 'xifres').ok, noms: rv.find(x => x.id === 'noms').ok };
  });
  ok(/es paren 8 dels 14/.test(r.text), r.text);
  ok(r.abans && r.t.ok && r.hi && r.xifra && r.despres && r.noms,
    'la troballa que en surt va al mapa amb xifres que es poden refer: les regles 8 i 9 la deixen passar');
}

console.log('\n7A.9 · «Copia el JSON»');
{
  await p.click('#btExemple');
  await p.click('#btJson');
  const r = await p.evaluate(() => ({ s: document.getElementById('sortida').textContent,
    l: JSON.stringify(window.__VS_API.llegeix(), null, 2) }));
  ok(r.s === r.l, 'sense cap extra, és el mateix text que abans (el de «llegeix»)');
}

console.log('\n7A.10 · Es recupera en recarregar');
{
  const abans = await p.evaluate(() => {
    const E = window.__VS_ED;
    E.entra('Qui rep i explica', { crea: true }); E.rol('Qui acull', 200, 140); E.rol('Qui guia'); E.puja();
    E.ideal('copia');
    return E.exporta();
  });
  await p.reload();
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => ({ o: window.__VS_ED.exporta(), avis: window.__VS_ED.avis(),
    est: (document.getElementById('edEstat') || {}).textContent || '' }));
  ok(JSON.stringify(r.o) === JSON.stringify(abans) && !!r.o.ideal && !!r.o.dins,
    'recarregar la pàgina torna el mapa sencer: real, ideal i xarxa de dins');
  ok(/S'ha recuperat/.test(r.est || r.avis), 'i ho diu: ' + (r.est || r.avis));
  await p.evaluate(() => { window.__VS_ED.comencaDeNou(); try { localStorage.clear(); } catch (e) { /* res */ } });
  const net = await p.evaluate(() => { try { return localStorage.length; } catch (e) { return 0; } });
  ok(net === 0, 'i «Comença de nou» ho deixa net per a la propera');
}

/* ── 7B · L'editor, amb les mans ──────────────────────────────────────────
 * Aquí no es criden ganxos per fer res: es clica el llenç, s'arrossega,
 * s'escriu i es prem el teclat com ho faria una persona. Els ganxos només es
 * fan servir per preparar un punt de partida i per llegir el resultat. */
console.log('\n7B · L\'editor, amb les mans');
const LL = '#edLlenc';
const veuLlenc = () => p.evaluate(() => { document.querySelector('#edLlenc').scrollIntoView({ block: 'center' }); });
const rect = sel => p.evaluate(s => { if (s.startsWith('#edSvg') || s === '#edLlenc') document.querySelector('#edLlenc').scrollIntoView({ block: 'center' }); const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2 }; }, sel);
const rolXY = nom => p.evaluate(n => {
  document.querySelector('#edLlenc').scrollIntoView({ block: 'center' });
  const g = [...document.querySelectorAll('#edSvg g.ed-n')].find(x => x.getAttribute('data-rol') === n && !x.hasAttribute('data-fora'));
  if (!g) return null;
  const r = g.querySelector('.mv-nc').getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2, r: r.width / 2 };
}, nom);
const arestaXY = clau => p.evaluate(c => {
  document.querySelector('#edLlenc').scrollIntoView({ block: 'center' });
  const g = [...document.querySelectorAll('#edSvg g.ed-f')].find(x => x.getAttribute('data-clau') === c && !x.classList.contains('tornada'));
  if (!g) return null;
  const pa = g.querySelector('.ed-hit'), L = pa.getTotalLength(), q = pa.getPointAtLength(L * 0.42), b = document.querySelector('#edSvg').getBoundingClientRect();
  return { x: b.x + q.x, y: b.y + q.y };
}, clau);
const clicLlenc = async (fx, fy) => { const r = await rect(LL); await p.mouse.click(r.x + r.w * fx, r.y + r.h * fy); };
async function arrossega(a, b) {
  await p.mouse.move(a.x, a.y); await p.mouse.down();
  for (let i = 1; i <= 10; i++) await p.mouse.move(a.x + (b.x - a.x) * i / 10, a.y + (b.y - a.y) * i / 10);
  await p.mouse.up();
}
const parells = () => p.evaluate(() => document.querySelector('#parells').value);
const visible = sel => p.evaluate(s => { const e = document.querySelector(s); return !!e && !e.hidden && e.offsetParent !== null; }, sel);
const pausa = ms => p.waitForTimeout(ms);

console.log('\n7B.1 · Dos rols i un lliurament amb la seva tornada, clicant');
{
  await p.evaluate(() => { window.__VS_ED.comencaDeNou(); try { localStorage.clear(); } catch (e) { /* res */ } });
  await veuLlenc();
  const t0 = Date.now();
  await p.click('.ed-eina[data-eina=r]');
  await clicLlenc(0.32, 0.5);
  ok(await visible('#edNomCaixa'), 'l\'eina Rol i un clic al buit obren el nom just on has clicat');
  await p.keyboard.type('Qui fa el vi'); await p.keyboard.press('Enter');
  await p.keyboard.type('Qui rep i explica'); await p.keyboard.press('Enter');
  await p.keyboard.press('Escape');
  await p.click('.ed-eina[data-eina=v]');
  const A = await rolXY('Qui fa el vi'), B = await rolXY('Qui rep i explica');
  ok(A && B, 'Retorn encadena el rol següent al costat: tots dos són al dibuix');
  await p.mouse.click(A.x, A.y);
  const asa = await rect('#edSvg .ed-asa');
  ok(!!asa, 'triar un rol ensenya l\'asa per estirar-ne un lliurament');
  await arrossega({ x: asa.cx, y: asa.cy }, B);
  ok(await visible('#edPop'), 'deixar anar l\'asa sobre l\'altre rol obre el lliurament');
  await p.keyboard.type('el vi'); await p.keyboard.press('Enter');
  const tornada = await p.evaluate(() => ({ obert: !document.querySelector('#edPop').hidden, m: (document.querySelector('input[name=edPopM]:checked') || {}).value, t: document.querySelector('#edPopTit').textContent }));
  ok(tornada.obert && tornada.m === 'i' && /torna/.test(tornada.t), 'i tot seguit pregunta què torna, ja posat com a intangible: ' + tornada.t);
  await p.keyboard.type('saber què pregunta'); await p.keyboard.press('Enter');
  const s = Date.now() - t0;
  const r = await p.evaluate(() => ({ n: document.querySelectorAll('#edSvg g.mv-n').length, f: document.querySelectorAll('#edSvg g.ed-f:not(.tornada)').length, rols: document.querySelector('#rols').value }));
  ok((await parells()) === 'Qui fa el vi | Qui rep i explica | t | el vi | i | saber què pregunta',
    'el parell queda escrit al camp com si s\'hagués teclejat: ' + (await parells()));
  ok(r.n === 2 && r.f === 2 && r.rols.split('\n').length === 2, `al dibuix hi ha ${r.n} rols i ${r.f} lliuraments, i els rols són a la llista (${Math.round(s / 100) / 10} s)`);
}

console.log('\n7B.2 · Del text al llenç: el rol sense declarar i la safata');
{
  await p.click('#parells');
  await p.keyboard.press('Control+End');
  await p.keyboard.type('\nQui rep i explica | El visitant | t | la visita\nuna línia sense barres');
  await pausa(250);
  const r = await p.evaluate(() => ({
    nd: !!document.querySelector('#edSvg g.mv-n.nodeclarat[data-rol="El visitant"]'),
    torn: document.querySelectorAll('#edSvg .ed-mes').length,
    saf: [...document.querySelectorAll('#edSafataL li')].map(x => x.textContent).join(' / '),
    safN: (document.querySelector('#edSafataT') || {}).textContent || ''
  }));
  ok(r.nd, 'el que s\'escriu als parells surt al dibuix, i «El visitant», que no és a la llista, hi surt com a «sense declarar»');
  ok(r.torn === 1, 'la tornada que encara no s\'ha escrit hi és com un «+»');
  ok(/línia 3/.test(r.saf), 'i la línia que no es pot dibuixar va a la safata, amb el número de línia: ' + r.saf.slice(0, 90));
  await veuLlenc();
  const V = await rolXY('El visitant');
  await p.mouse.click(V.x, V.y);
  await p.click('#edSelBar [data-acc=declara]');
  const rols = await p.evaluate(() => document.querySelector('#rols').value.split('\n'));
  ok(rols.includes('El visitant') && !(await p.$('#edSvg g.mv-n.nodeclarat[data-rol="El visitant"]')), '«Declara\'l» l\'afegeix a la llista de rols');
  await p.click('#parells');
  await p.keyboard.press('Control+End');
  await p.keyboard.press('Shift+Home'); await p.keyboard.press('Backspace'); await p.keyboard.press('Backspace');
  await pausa(200);
  ok(!(await p.$$eval('#edSafataL li', x => x.length)), 'esborrada la línia, la safata queda buida');
}

console.log('\n7B.3 · El «+» de la tornada');
{
  await veuLlenc();
  const m = await rect('#edSvg .ed-mes');
  await p.mouse.click(m.cx, m.cy);
  const r = await p.evaluate(() => ({ obert: !document.querySelector('#edPop').hidden, m: (document.querySelector('input[name=edPopM]:checked') || {}).value }));
  ok(r.obert && r.m === 'i', 'clicar el «+» pregunta què torna, i proposa la mena contrària a l\'anada');
  await p.keyboard.type('la confiança'); await p.keyboard.press('Enter');
  const ps = (await parells()).split('\n');
  ok(ps[1] === 'Qui rep i explica | El visitant | t | la visita | i | la confiança' && !(await p.$('#edSvg .ed-mes')),
    'la tornada completa la mateixa línia i el «+» desapareix: ' + ps[1]);
}

console.log('\n7B.4 · Només amb el teclat');
{
  await p.focus(LL);
  await p.keyboard.press('Escape');
  await p.keyboard.press('r');
  ok(await p.evaluate(() => document.activeElement && document.activeElement.id === 'edNom'), 'R obre el nom del rol nou');
  await p.keyboard.type('Qui porta l\'agenda'); await p.keyboard.press('Enter');
  const foc = await p.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-rol'));
  ok(foc === 'Qui porta l\'agenda', 'el rol nou queda amb el focus: ' + foc);
  await p.keyboard.press('t');
  const tria = await p.evaluate(() => document.querySelectorAll('#edSvg .ed-num').length);
  ok(tria >= 2, `T sobre el rol numera els candidats (${tria}) per triar a qui va`);
  await p.keyboard.press('1');
  ok(await visible('#edPop'), 'i un número obre el lliurament');
  await p.keyboard.type('les reserves'); await p.keyboard.press('Enter');
  await p.keyboard.type('com ha anat cada grup'); await p.keyboard.press('Enter');
  const l = (await parells()).split('\n').find(x => x.startsWith('Qui porta l\'agenda | '));
  ok(!!l && / \| t \| les reserves \| i \| com ha anat cada grup$/.test(l), 'el lliurament i la tornada, escrits: ' + l);
  await p.keyboard.press('ArrowLeft');
  const f2 = await p.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-rol'));
  ok(!!f2 && f2 !== 'Qui porta l\'agenda', 'les fletxes passen el focus al rol veí: ' + f2);
  await p.keyboard.press('Escape');
  await p.keyboard.press('Delete');
  const esb = await p.evaluate(n => !document.querySelector('#rols').value.split('\n').includes(n), f2);
  ok(esb, 'Supr esborra el rol enfocat');
  await p.keyboard.press('Control+z');
  const tor = await p.evaluate(n => document.querySelector('#rols').value.split('\n').includes(n), f2);
  ok(tor, 'i Ctrl+Z el torna, amb els seus lliuraments');
  await p.keyboard.press('Control+Shift+z');
  await p.keyboard.press('Control+z');
  ok(await p.evaluate(n => document.querySelector('#rols').value.split('\n').includes(n), f2), 'Ctrl+Maj+Z refà i Ctrl+Z desfà un altre cop');
}

console.log('\n7B.5 · L\'ordre del flux, clicant en ordre');
{
  await p.evaluate(() => document.querySelector('#edFlux').scrollIntoView({ block: 'center' }));
  await p.click('#edNouProc');
  await p.keyboard.type('La visita'); await p.keyboard.press('Enter');
  const id = await p.evaluate(() => (window.__VS_ED.exporta().processos || [])[0] || null);
  ok(!!id && id.nom === 'La visita', '«+ Procés» el crea amb el nom que dius: ' + (id && id.id));
  await veuLlenc();
  await p.click('.ed-eina[data-eina=q]');
  const cl = ['Qui fa el vi→Qui rep i explica', 'Qui rep i explica→El visitant', 'El visitant→Qui rep i explica'];
  for (const c of cl) { const q = await arestaXY(c); await p.mouse.click(q.x, q.y); await pausa(60); }
  const q4 = await arestaXY('Qui rep i explica→Qui fa el vi');
  await p.keyboard.down('Shift'); await p.mouse.click(q4.x, q4.y); await p.keyboard.up('Shift');
  const seq = await p.evaluate(() => window.__VS_ED.exporta().seq);
  const pas = c => (seq[c] || [])[1];
  ok(cl.every((c, i) => seq[c] && seq[c][0] === id.id && pas(c) === i + 1), 'tres clics en ordre són els passos 1, 2 i 3 del procés: ' + cl.map(pas).join(', '));
  ok(pas('Qui rep i explica→Qui fa el vi') === 3, 'i amb Maj, el quart va alhora que el tercer (pas ' + pas('Qui rep i explica→Qui fa el vi') + ')');
  await pausa(250);
  const fit = await p.evaluate(() => document.querySelectorAll('#edFluxCos .ed-carril .ed-pas').length);
  ok(fit >= 3, `la tira del flux ho ensenya per passos (${fit} columnes)`);
  await p.click('.ed-eina[data-eina=v]');
}

console.log('\n7B.5b · Ordenar el flux arrossegant, amb ratolí i amb el dit');
{
  const CL = ['Qui fa el vi→Qui rep i explica', 'Qui rep i explica→El visitant', 'El visitant→Qui rep i explica', 'Qui rep i explica→Qui fa el vi'];
  const seq = () => p.evaluate(() => window.__VS_ED.exporta().seq || {});
  const pas = (s, c) => (s[c] || [])[1];
  const fitxa = c => p.evaluate(k => { const b = [...document.querySelectorAll('#edFluxCos .ed-fitxa')].find(x => x.getAttribute('data-clau') === k); b.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, c);
  const columna = (c, f) => p.evaluate(([k, f]) => { const b = [...document.querySelectorAll('#edFluxCos .ed-fitxa')].find(x => x.getAttribute('data-clau') === k); const r = b.closest('.ed-pas').getBoundingClientRect(); return { x: r.left + r.width * f, y: r.top + r.height / 2 }; }, [c, f]);
  const arrossega = async (de, a) => { await p.mouse.move(de.x, de.y); await p.mouse.down(); for (let i = 1; i <= 8; i++) await p.mouse.move(de.x + (a.x - de.x) * i / 8, de.y + (a.y - de.y) * i / 8); await p.mouse.up(); await pausa(60); };
  await p.evaluate(() => document.querySelector('#edFlux').scrollIntoView({ block: 'center' }));
  let s0 = await seq();
  ok(pas(s0, CL[2]) === 3 && pas(s0, CL[0]) === 1, 'de partida: ' + CL.map(c => pas(s0, c)).join(', '));
  /* Ratolí: a la vora esquerra del pas 1 = abans */
  await arrossega(await fitxa(CL[2]), await columna(CL[0], 0.08));
  let s1 = await seq();
  ok(pas(s1, CL[2]) === 1 && pas(s1, CL[0]) === 2 && pas(s1, CL[1]) === 3 && pas(s1, CL[3]) === 4, 'amb el ratolí, deixar-la a la vora d\'un pas la posa abans i renumera: ' + CL.map(c => pas(s1, c)).join(', '));
  ok(await p.evaluate(() => !document.querySelector('.ed-fitxa.fantasma') && !document.querySelector('#edFluxCos .diana,#edFluxCos [class*=diana-]') && !document.body.classList.contains('ed-arr')), 'i no queda ni la fantasma ni la marca');
  ok(await p.evaluate(k => document.activeElement && document.activeElement.getAttribute('data-clau') === k, CL[2]), 'el focus segueix la fitxa que has mogut');
  /* Al mig d'un pas = alhora */
  await arrossega(await fitxa(CL[3]), await columna(CL[2], 0.5));
  let s2 = await seq();
  ok(pas(s2, CL[3]) === 1 && pas(s2, CL[2]) === 1, 'al mig d\'un pas, va «alhora»: ' + CL.map(c => pas(s2, c)).join(', '));
  /* Esc desfà l'arrossegament */
  { const de = await fitxa(CL[1]), a = await columna(CL[0], 0.5); await p.mouse.move(de.x, de.y); await p.mouse.down(); await p.mouse.move(de.x + 30, de.y); await p.mouse.move(a.x, a.y);
    await p.keyboard.press('Escape'); await p.mouse.up(); await pausa(60); }
  ok(JSON.stringify(await seq()) === JSON.stringify(s2) && await p.evaluate(() => !document.querySelector('.ed-fitxa.fantasma')), 'Esc a mig camí la deixa on era');
  /* Un clic sense moure encara tria la fitxa */
  { const q = await fitxa(CL[1]); await p.mouse.click(q.x, q.y); }
  ok(await p.evaluate(k => [...document.querySelectorAll('#edSvg .ed-f.sel')].some(x => x.getAttribute('data-clau') === k), CL[1]), 'un clic quiet continua triant el lliurament');
  /* A «Sense pas» */
  { const de = await fitxa(CL[1]), a = await p.evaluate(() => { const r = document.querySelector('#edFluxCos [data-safata=sense]').getBoundingClientRect(); return { x: r.left + 20, y: r.top + 12 }; }); await arrossega(de, a); }
  ok(!Object.prototype.hasOwnProperty.call(await seq(), CL[1]), 'deixada a «Sense pas», es queda sense pas');
  await p.click('#edDesfes');
  ok(pas(await seq(), CL[1]) !== undefined, 'i Desfés la torna');
  /* El dit: lliscar desplaça; mantenir i moure arrossega */
  const cdp = await p.context().newCDPSession(p);
  const toc = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  const s3 = await seq();
  { const de = await fitxa(CL[1]), a = await columna(CL[0], 0.08);
    await toc('touchStart', de.x, de.y); for (let i = 1; i <= 6; i++) await toc('touchMove', de.x + (a.x - de.x) * i / 6, de.y + (a.y - de.y) * i / 6); await toc('touchEnd'); await pausa(700); }   // que s'aturi el desplaçament que ha fet el dit
  ok(JSON.stringify(await seq()) === JSON.stringify(s3) && await p.evaluate(() => !document.querySelector('.ed-fitxa.fantasma')), 'amb el dit, lliscar de seguida no mou res (és desplaçar)');
  /* Lliscar ha fet córrer la pàgina: es torna a posar el flux al mig abans d'agafar */
  await p.evaluate(() => document.querySelector('#edFlux').scrollIntoView({ block: 'center' })); await pausa(250);
  { const de = await fitxa(CL[1]), a = await columna(CL[2], 0.08);
    await toc('touchStart', de.x, de.y); await pausa(450);
    const fant = await p.evaluate(() => !!document.querySelector('.ed-fitxa.fantasma'));
    for (let i = 1; i <= 6; i++) await toc('touchMove', de.x + (a.x - de.x) * i / 6, de.y + (a.y - de.y) * i / 6);
    await toc('touchEnd'); await pausa(80);
    ok(fant, 'mantenir el dit un moment l\'agafa');
  }
  const s4 = await seq();
  ok(pas(s4, CL[1]) === 1 && pas(s4, CL[2]) === 2, 'i en deixar-la, la posa abans del pas: ' + CL.map(c => pas(s4, c)).join(', '));
  await cdp.detach();
  /* El teclat continua: Alt+→. Primer, que la tira s'acabi de refer (els
     panells es pinten 150 ms després de cada canvi): enfocar una fitxa que
     després se substitueix deixaria la tecla en un botó que ja no hi és. */
  await pausa(250);
  await p.focus('#edFluxCos .ed-fitxa[data-clau="' + CL[1] + '"]');
  await p.keyboard.press('Alt+ArrowRight');
  ok(pas(await seq(), CL[1]) === 2, 'i amb el teclat, Alt+→ la passa després');
}

console.log('\n7B.6 · Entrar a dins d\'un rol i tornar a pujar');
{
  await veuLlenc();
  const veins = await p.evaluate(() => { const s = new Set(); document.querySelector('#parells').value.split('\n').forEach(l => { const c = l.split('|').map(x => x.trim()); if (c[0] === 'Qui rep i explica') s.add(c[1]); if (c[1] === 'Qui rep i explica') s.add(c[0]); }); return s.size; });
  const Q = await rolXY('Qui rep i explica');
  await p.mouse.dblclick(Q.x, Q.y);
  await pausa(100);
  const b = await p.$('#edSelBar [data-acc=entra]');
  ok(!!b && /Crea'n la xarxa de dins/.test(await b.textContent()), 'el doble clic sobre un rol sense xarxa ofereix «Crea\'n la xarxa de dins»');
  await b.click();
  const r = await p.evaluate(() => ({
    mig: document.querySelector('#edMigues').textContent.replace(/\s+/g, ' ').trim(),
    fora: document.querySelectorAll('#edSvg g.mv-n.fora').length,
    puja: !document.querySelector('#edPuja').hidden
  }));
  ok(r.mig === 'Mapa sencer›Qui rep i explica' || r.mig === 'Mapa sencer › Qui rep i explica', 'les molles diuen on ets: ' + r.mig);
  ok(r.fora === veins && r.fora > 0, `els ${r.fora} rols amb qui tracta hi són com a «de fora», només de lectura`);
  ok(r.puja, 'i hi ha «↑ Puja»');
  await p.focus(LL);
  await p.keyboard.press('Alt+ArrowUp');
  const dalt = await p.evaluate(() => ({ cami: window.__VS_ED.lloc().cami.length, puja: document.querySelector('#edPuja').hidden }));
  ok(dalt.cami === 0 && dalt.puja, 'Alt+↑ torna al mapa sencer');
  const Q2 = await rolXY('Qui rep i explica');
  await p.mouse.dblclick(Q2.x, Q2.y);
  const vol = await p.evaluate(() => ({ cami: window.__VS_ED.lloc().cami.join('/'), clon: document.querySelectorAll('#edLlenc svg.ed-vol').length,
    ids: document.querySelectorAll('#edLlenc svg.ed-vol [id],#edLlenc svg.ed-vol [tabindex]').length, anim: document.querySelector('#edSvg').getAnimations().length }));
  ok(vol.cami === 'Qui rep i explica', 'ara que ja té xarxa, el doble clic hi entra directament, i el camí canvia a l\'instant');
  ok(vol.clon === 1 && vol.anim > 0, 'amb vol de falcó: el mapa de fora s\'acosta al rol i el de dins creix des d\'ell');
  ok(vol.ids === 0, 'i la còpia que vola no duplica ids ni entra al tabulador');
  await pausa(600);
  ok(await p.evaluate(() => !document.querySelector('#edLlenc svg.ed-vol') && !document.querySelector('#edSvg').getAnimations().length), 'el vol acaba sol i no deixa res al llenç');
  await p.click('#edPuja');
  const vp = await p.evaluate(() => ({ cami: window.__VS_ED.lloc().cami.length, clon: document.querySelectorAll('#edLlenc svg.ed-vol').length }));
  ok(vp.cami === 0 && vp.clon === 1, 'i «↑ Puja» en surt fent el vol al revés');
  await pausa(600);
  await p.emulateMedia({ reducedMotion: 'reduce' });
  const Q3 = await rolXY('Qui rep i explica');
  await p.mouse.dblclick(Q3.x, Q3.y);
  ok(await p.evaluate(() => window.__VS_ED.lloc().cami.length === 1 && !document.querySelector('#edLlenc svg.ed-vol')), 'amb «menys moviment», s\'hi entra sense vol');
  await p.click('#edPuja');
  await p.emulateMedia({ reducedMotion: 'no-preference' });
  const fl = await p.evaluate(() => ({ c: window.__VS_ED.lloc().cami.length, sel: window.__VS_ED.exporta() && 1 }));
  ok(fl.c === 0, 'i tornar a pujar també');
}

console.log('\n7B.7 · El diagnòstic al dibuix');
{
  await p.evaluate(() => { window.__VS_ED.comencaDeNou(); });
  await p.click('#btExemple');
  await veuLlenc();
  await p.click('#edTabDia');
  const n = await p.evaluate(() => document.querySelectorAll('#edDiagLlista li').length);
  ok(n === 14, `la pestanya Diagnòstic llista les ${n} troballes del celler`);
  const t = await p.evaluate(() => window.__VS_ED.diagnosi().troballes.find(x => x.id === document.querySelector('#edDiagLlista li [data-acc=mostra]').getAttribute('data-id')));
  await p.click('#edDiagLlista li [data-acc=mostra]');
  const r = await p.evaluate(() => ({ focus: document.querySelector('#edSvg').classList.contains('focus'), fo: document.querySelectorAll('#edSvg .fo').length,
    tarja: !document.querySelector('#edTarja').hidden ? document.querySelector('#edTarja').textContent : '' }));
  ok(r.focus && r.fo > 0, `«Mostra-ho» enfosqueix la resta i ressalta ${r.fo} elements`);
  ok(r.tarja.includes(t.perque) && r.tarja.includes(t.pregunta), 'i la targeta diu per què i la pregunta per a la sala');
  await p.keyboard.press('Escape');
  await p.click('#edTarja [data-acc=tanca-tarja]').catch(() => {});
}

console.log('\n7B.8 · El pols i «i si s\'encalla?»');
{
  await p.evaluate(() => document.querySelector('#edPols').scrollIntoView({ block: 'center' }));
  await p.click('#edPlay');
  const i1 = await p.textContent('#edPolsInd');
  ok(/La visita · pas 1 de 4/.test(i1), 'Reprodueix comença pel primer pas: ' + i1);
  await p.click('#edSeg');
  const i2 = await p.textContent('#edPolsInd');
  ok(/La visita · pas 2 de 4/.test(i2), 'i el botó de pas següent hi avança: ' + i2);
  const un = await p.evaluate(() => document.querySelectorAll('#edSvg .mv-p.ed-un').length);
  ok(un >= 1, `el lliurament del pas es mou pel dibuix (${un})`);
  await p.selectOption('#edEncalla', 'Qui rep i explica');
  const e = await p.evaluate(() => ({ cls: document.querySelector('#edSvg').classList.contains('encallat'), txt: document.querySelector('#edPolsEnc').textContent,
    sec: document.querySelectorAll('#edSvg [data-sec]').length, para: document.querySelectorAll('#edSvg g.ed-f[data-para]').length }));
  ok(e.cls && /es paren 8 dels 14/.test(e.txt), 'encallar «Qui rep i explica» ho diu amb les xifres del mapa: ' + e.txt.slice(0, 80));
  ok(e.sec === 3 && e.para === 8, `${e.para} lliuraments s'aturen i ${e.sec} rols en surten perdent`);
  await p.click('#edStop');
  await p.selectOption('#edEncalla', '');
}

console.log('\n7B.9 · Real, ideal i desviació');
{
  const IDEAL = { abast: 'El que passa des que algú es planteja venir al celler fins que marxa i ho explica',
    roles: ['qui fa el vi', 'Qui rep i explica', 'Visitant', 'El poble', 'La vinya i el veïnat', 'L’operador de luxe', 'Qui porta l\'agenda'],
    pairs: [['qui fa el vi', 'Qui rep i explica', 'tangible', 'el vi, la verema i el celler obert', 'intangible', 'saber què pregunta i què paga qui ve'],
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
  await p.evaluate(I => { const o = window.__VS_ED.exporta(); o.ideal = I; window.__VS_API.carrega(o); }, IDEAL);
  await veuLlenc();
  await p.click('#edVistes input[value=desviacio] + span');
  const r = await p.evaluate(() => {
    const pr = document.querySelector('#edSvg g.mv-n.propi .mv-nc'), red = getComputedStyle(document.querySelector('#editor')).getPropertyValue('--red').trim();
    const tmp = document.createElement('i'); tmp.style.color = red; document.body.appendChild(tmp); const redRGB = getComputedStyle(tmp).color; tmp.remove();
    return {
      falta: [...document.querySelectorAll('#edSvg g.mv-n.falta')].map(x => x.getAttribute('data-rol')),
      propi: [...document.querySelectorAll('#edSvg g.mv-n.propi')].map(x => x.getAttribute('data-rol')),
      stroke: pr ? getComputedStyle(pr).stroke : '', redRGB,
      eines: [...document.querySelectorAll('#edEines .ed-eina[data-eina]')].filter(b => b.disabled).map(b => b.getAttribute('data-eina')).sort().join(''),
      text: document.querySelector('#editor').innerText
    };
  });
  ok(r.falta.includes('Qui porta l\'agenda'), 'a la desviació, «Qui porta l\'agenda» hi és com el que falta al real');
  ok(r.propi.includes('El distribuïdor'), 'i «El distribuïdor» com a propi del real');
  ok(r.stroke && r.stroke !== r.redRGB, 'el propi no és mai vermell: ' + r.stroke);
  ok(r.eines === 'iqrt', 'a la desviació no s\'hi dibuixa: les eines de crear queden desactivades');
  const xs = await p.evaluate(() => [...document.querySelectorAll('#edXips [data-filtre]')].map(x => x.textContent).join(' · '));
  ok(/Sobra \(1\)/.test(xs) && /Canvia \(\d+\)/.test(xs), 'el que l\'ideal treu té el seu xip, a part de «Canvia»: ' + xs);
  ok(!/incompliment/i.test(r.text), 'i en lloc de l\'editor hi diu «incompliment»');
  const F = await rolXY('Qui porta l\'agenda');
  await p.mouse.click(F.x, F.y);
  await p.click('#edSelBar [data-acc=porta-real-rol]');
  ok(await p.evaluate(() => document.querySelector('#rols').value.split('\n').includes('Qui porta l\'agenda')), '«Porta-ho al real» l\'escriu als rols del real');
  await p.click('#edVistes input[value=real] + span');
}

console.log('\n7B.10 · Sense moviment si es demana');
{
  await p.emulateMedia({ reducedMotion: 'reduce' });
  await p.evaluate(() => document.querySelector('#edPols').scrollIntoView({ block: 'center' }));
  await p.click('#edPlay');
  const an = await p.evaluate(() => [...document.querySelectorAll('#edSvg .mv-p')].map(x => getComputedStyle(x).animationName));
  await pausa(2500);
  const ind = await p.textContent('#edPolsInd');
  ok(an.length > 0 && an.every(x => x === 'none'), `amb «menys moviment», les ${an.length} partícules no s'animen`);
  ok(/pas 1 de/.test(ind), 'i el pols no avança sol: es passa a mà (' + ind + ')');
  await p.click('#edStop');
  await p.emulateMedia({ reducedMotion: 'no-preference' });
}

console.log('\n7B.11 · Zoom i roda');
{
  await veuLlenc();
  await p.click('#edEncaixa');
  const k0 = await p.evaluate(() => window.__VS_ED.camera().k);
  await p.click('#edZp');
  const k1 = await p.evaluate(() => window.__VS_ED.camera().k);
  ok(Math.abs(k1 / k0 - 1.2) < 0.01, `«+» amplia un 20 % (${k0.toFixed(2)} → ${k1.toFixed(2)})`);
  await p.click('#edEncaixa');
  const k2 = await p.evaluate(() => window.__VS_ED.camera().k);
  ok(Math.abs(k2 - k0) < 0.001, '«Encaixa» torna a veure-ho tot');
  const c = await rect(LL);
  await p.mouse.move(c.cx, c.cy);
  await p.keyboard.down('Control'); await p.mouse.wheel(0, -240); await p.keyboard.up('Control');
  await pausa(100);
  const k3 = await p.evaluate(() => window.__VS_ED.camera().k);
  ok(k3 > k2 * 1.05, `Ctrl + roda amplia (${k2.toFixed(2)} → ${k3.toFixed(2)})`);
  const y0 = await p.evaluate(() => scrollY);
  await p.mouse.wheel(0, 300);
  await pausa(150);
  const r = await p.evaluate(() => ({ y: scrollY, k: window.__VS_ED.camera().k }));
  ok(r.y !== y0 && Math.abs(r.k - k3) < 1e-6, 'i la roda sola baixa la pàgina sense tocar el zoom');
}

/* ── 7C · El que la revisió va trobar, provat amb les mans ─────────────────
 * Cada fallo alt té aquí la seva prova: reanomenar amb un ideal, el focus
 * que no cau a <body>, la càmera que segueix el focus i moure un rol sense
 * arrossegar. */
console.log('\n7C.1 · Reanomenar al real amb un ideal: ho diu i ofereix què fer');
{
  await p.evaluate(() => { window.__VS_ED.comencaDeNou(); try { localStorage.clear(); } catch (e) { /* res */ } });
  await p.click('#btExemple');
  await p.evaluate(() => { window.__VS_ED.ideal('copia'); window.__VS_ED.vista('real'); });
  await veuLlenc();
  const A = await rolXY('Qui fa el vi');
  await p.mouse.click(A.x, A.y);
  await p.keyboard.press('F2');
  await p.keyboard.type('Qui elabora el vi'); await p.keyboard.press('Enter');
  const r = await p.evaluate(() => ({ avis: document.querySelector('#edAvis').textContent, vis: !document.querySelector('#edAvis').hidden,
    acc: [...document.querySelectorAll('#edAvis [data-acc]')].map(x => x.getAttribute('data-acc')), d: window.__VS_ED.desviacio() }));
  ok(r.vis && /A l'ideal segueix «Qui fa el vi»/.test(r.avis) && r.acc.includes('ideal-reanomena') && r.acc.includes('ideal-alies'),
    'F2 al real, amb un ideal: l\'avís ho diu i ofereix «Canvia\'l també a l\'ideal» i «Són el mateix rol»');
  ok(r.d.rols.falten.join() === 'Qui fa el vi' && r.d.rols.propis.join() === 'Qui elabora el vi', 'sense triar res, la desviació el llegeix com un rol que falta i un de propi');
  await p.click('#edAvis [data-acc=ideal-alies]');
  const r2 = await p.evaluate(() => ({ d: window.__VS_ED.desviacio(), al: (window.__VS_ED.exporta().ideal || {}).alies || {} }));
  ok(!r2.d.rols.falten.length && !r2.d.rols.propis.length && r2.al['Qui fa el vi'] === 'Qui elabora el vi', '«Són el mateix rol» hi posa l\'àlies i la desviació torna a ser neta');
  const B = await rolXY('Qui elabora el vi');
  await p.mouse.click(B.x, B.y);
  await p.keyboard.press('F2');
  await p.keyboard.type('Qui fa i guarda el vi'); await p.keyboard.press('Enter');
  const r3 = await p.evaluate(() => ({ d: window.__VS_ED.desviacio(), al: window.__VS_ED.exporta().ideal.alies, acc: document.querySelectorAll('#edAvis [data-acc=ideal-alies]').length }));
  ok(r3.al['Qui fa el vi'] === 'Qui fa i guarda el vi' && !r3.d.rols.falten.length && !r3.acc, 'i si es torna a reanomenar, l\'àlies segueix el nom nou sense preguntar res');
  await p.click('#edTabSel');
  const C = await rolXY('El poble');
  await p.mouse.click(C.x, C.y);
  await p.fill('#edIRolNom', 'Qui viu al poble'); await p.press('#edIRolNom', 'Enter');
  await p.locator('#edIRolNom').blur().catch(() => {});
  await pausa(100);
  const r4 = await p.evaluate(() => [...document.querySelectorAll('#edAvis [data-acc]')].map(x => x.getAttribute('data-acc')));
  ok(r4.includes('ideal-reanomena'), 'el camp «Nom» de l\'inspector avisa igual');
  await p.click('#edAvis [data-acc=ideal-reanomena]');
  const r5 = await p.evaluate(() => { const I = window.__VS_ED.exporta().ideal; return { d: window.__VS_ED.desviacio(), i: JSON.stringify([I.roles, I.pairs]) }; });
  ok(!r5.d.rols.falten.length && !r5.d.rols.propis.length && !/"El poble"/.test(r5.i) && (r5.i.match(/"Qui viu al poble"/g) || []).length >= 3,
    '«Canvia\'l també a l\'ideal» el reanomena a l\'ideal, amb els seus lliuraments' + (/"El poble"/.test(r5.i) ? ': ' + r5.i.slice(0, 200) : ''));
  await p.click('#edVistes input[value=desviacio] + span');
  await p.evaluate(() => { const E = window.__VS_ED; E.vista('real'); E.reanomena('El visitant', 'Qui ve de visita'); E.reanomena('El distribuïdor', 'Qui distribueix'); E.vista('desviacio'); });
  await p.click('#edTabDia');
  const sel = await p.evaluate(() => [...document.querySelectorAll('#edPanDia select[data-k^="alies:"]')].map(s => s.getAttribute('data-ideal')));
  ok(sel.length === 2 && sel.includes('El visitant') && sel.includes('El distribuïdor'), 'a la pestanya Diagnòstic hi ha un «és el mateix rol que…» per cada rol que falta: ' + sel.join(', '));
  await p.click('#edVistes input[value=real] + span');
}

console.log('\n7C.2 · El focus no cau a <body>');
{
  await p.evaluate(() => { window.__VS_ED.comencaDeNou(); try { localStorage.clear(); } catch (e) { /* res */ } });
  await p.click('#btExemple');
  await veuLlenc();
  const on = () => p.evaluate(() => { const a = document.activeElement; return a ? (a.id || a.getAttribute('data-acc') || a.getAttribute('data-rol') || a.tagName) : 'res'; });
  const A = await rolXY('El poble');
  await p.mouse.click(A.x, A.y);
  await p.focus('#edSelBar [data-acc=esborra]');
  await p.keyboard.press('Enter');
  ok((await on()) === 'edLlenc', '«× Esborra» de la barra deixa el focus al llenç');
  await p.keyboard.press('Control+z');
  const f1 = await on();
  ok(f1 !== 'BODY' && (await p.evaluate(() => window.__VS_ED.nivell().t.rols.includes('El poble'))), 'i Ctrl+Z el torna sense perdre el focus (' + f1 + ')');
  await p.click('#edTabLli');
  await p.focus('#edPanLli [data-acc=rol-puja][data-rol="Qui rep i explica"]');
  await p.keyboard.press('Enter');
  const f2 = await p.evaluate(() => { const a = document.activeElement; return { acc: a.getAttribute('data-acc'), rol: a.getAttribute('data-rol'), dis: a.disabled }; });
  ok(f2.rol === 'Qui rep i explica' && !f2.dis, `↑ a la Llista: el focus segueix el rol que has pujat (${f2.acc}, i no un botó desactivat)`);
  await p.click('#edTabDia');
  await p.focus('#edDiagLlista li [data-acc=mostra]');
  const id = await p.evaluate(() => document.activeElement.getAttribute('data-id'));
  await p.keyboard.press('Enter');
  await p.focus('#edTarja [data-acc=tanca-tarja]');
  await p.keyboard.press('Enter');
  const f3 = await p.evaluate(() => ({ acc: document.activeElement.getAttribute('data-acc'), id: document.activeElement.getAttribute('data-id') }));
  ok(f3.acc === 'mostra' && f3.id === id, 'tancar la targeta torna el focus al «Mostra-ho» que l\'havia oberta');
  const punt = await p.evaluate(() => { const b = document.querySelector('#edRegles .ed-punt'); return b ? b.getAttribute('data-regla') : null; });
  await p.focus('#edRegles .ed-punt');
  await p.keyboard.press('Enter');
  const obert = await p.evaluate(() => !!document.querySelector('#edRegles .ed-reglapop'));
  await p.keyboard.press('Escape');
  const f4 = await p.evaluate(() => ({ pop: !!document.querySelector('#edRegles .ed-reglapop'), r: document.activeElement.getAttribute('data-regla') }));
  ok(obert && !f4.pop && f4.r === punt, 'Esc tanca el detall d\'una regla i torna el focus al seu punt');
  await p.focus('#edDesfes');
  for (let i = 0; i < 60 && !(await p.evaluate(() => document.querySelector('#edDesfes').disabled)); i++) await p.keyboard.press('Enter');
  const f5 = await on();
  ok((await p.evaluate(() => document.querySelector('#edDesfes').disabled)) && f5 !== 'BODY', 'desfer fins que «Desfés» es desactiva deixa el focus en un lloc viu (' + f5 + ')');
  await p.evaluate(() => { window.__VS_ED.comencaDeNou(); });
  await p.click('#btExemple');
}

console.log('\n7C.3 · Amb zoom, la càmera segueix el focus; i el llenç es mou amb el teclat');
{
  await veuLlenc();
  await p.click('#edEncaixa');
  await p.evaluate(() => window.__VS_ED.zoom(4));
  const A = await p.evaluate(() => { const g = document.querySelector('#edSvg g.ed-n[role=button]'); return g ? g.getAttribute('data-rol') : null; });
  await p.evaluate(n => { const g = [...document.querySelectorAll('#edSvg g.ed-n[role=button]')].find(x => x.getAttribute('data-rol') === n); g.focus(); }, A);
  const fora = [];
  for (const k of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowLeft', 'ArrowUp', 'ArrowRight']) {
    await p.keyboard.press(k);
    const v = await p.evaluate(() => {
      const a = document.activeElement, L = document.querySelector('#edLlenc').getBoundingClientRect();
      if (!a || !a.getAttribute('data-rol')) return { rol: a ? a.tagName : 'res', dins: false };
      const c = a.querySelector('.mv-nc').getBoundingClientRect(), x = c.x + c.width / 2, y = c.y + c.height / 2;
      return { rol: a.getAttribute('data-rol'), dins: x >= L.left && x <= L.right && y >= L.top && y <= L.bottom };
    });
    if (!v.dins) fora.push(v.rol);
  }
  ok(!fora.length, 'a 400 %, les fletxes passen de rol en rol i cap queda fora del llenç' + (fora.length ? ': ' + fora.join(', ') : ''));
  const c0 = await p.evaluate(() => window.__VS_ED.camera());
  await p.focus(LL);
  await p.keyboard.press('Shift+ArrowRight');
  const c1 = await p.evaluate(() => window.__VS_ED.camera());
  ok(Math.abs((c0.tx - c1.tx) - 60) < 0.5 && c0.ty === c1.ty, 'Maj+→ desplaça el llenç cap a la dreta');
  await p.click('#edEncaixa');
}

console.log('\n7C.4 · Moure un rol sense arrossegar');
{
  await veuLlenc();
  const A = await rolXY('El poble');
  await p.mouse.click(A.x, A.y);
  await p.click('#edSelBar [data-acc=mou-rol]');
  const ab = await p.evaluate(() => window.__VS_ED.escena().nodes.find(n => n.nom === 'El poble'));
  const L = await rect(LL);
  await p.mouse.click(L.x + L.w * 0.12, L.y + L.h * 0.86);
  const r = await p.evaluate(() => ({ n: window.__VS_ED.escena().nodes.find(n => n.nom === 'El poble'), avis: window.__VS_ED.avis() }));
  ok(r.n && (r.n.x !== ab.x || r.n.y !== ab.y), `«✥ Mou» i un toc: «El poble» passa de (${ab.x}, ${ab.y}) a (${r.n.x}, ${r.n.y})`);
  const G = await rolXY('El poble');
  ok(Math.hypot(G.x - (L.x + L.w * 0.12), G.y - (L.y + L.h * 0.86)) < 140, 'i queda on s\'ha tocat (o al forat lliure més proper)');
  await p.click('.ed-eina[data-eina=h]');
  const c0 = await p.evaluate(() => window.__VS_ED.camera());
  await p.mouse.click(L.x + L.w * 0.25, L.y + L.h * 0.3);
  const c1 = await p.evaluate(() => window.__VS_ED.camera());
  const mig = await p.evaluate(() => { const r = document.querySelector('#edLlenc').getBoundingClientRect(); return [r.width / 2, r.height / 2]; });
  const dx = (L.w * 0.25 - c0.tx) / c0.k, wx = (mig[0] - c1.tx) / c1.k;
  ok(Math.abs(dx - wx) < 1, 'amb «Mou el llenç», un clic sense arrossegar hi posa el centre');
  await p.click('.ed-eina[data-eina=v]');
  await p.click('#edEncaixa');
}

console.log('\n7C.5 · Sense ideal, «Ideal» no dibuixa al real d\'amagat');
{
  await p.evaluate(() => { window.__VS_ED.comencaDeNou(); });
  await p.click('#btExemple');
  await veuLlenc();
  await p.click('#edVistes input[value=ideal] + span');
  const r = await p.evaluate(() => ({ dis: [...document.querySelectorAll('#edEines .ed-eina[data-eina]')].filter(b => b.disabled).map(b => b.getAttribute('data-eina')).sort().join(''), n: window.__VS_ED.nivell().t.rols.split('\n').length }));
  await p.focus(LL);
  await p.keyboard.press('r');
  const nom = await visible('#edNomCaixa');
  await p.keyboard.press('Escape');
  const v = await p.evaluate(() => document.querySelector('#edVistes input:checked').value);
  ok(r.dis === 'iqrt' && !nom, 'les eines de crear queden desactivades i R no obre res');
  ok(v === 'real', 'i Esc torna a Real');
}

console.log('\n7C.6 · El que es veu a la desviació');
{
  await p.evaluate(() => { window.__VS_ED.ideal('copia'); });
  await p.click('#edVistes input[value=desviacio] + span');
  const r = await p.evaluate(() => ({ on: (document.querySelector('#edOn') || {}).textContent || '', op: getComputedStyle(document.querySelector('#edSvg g.mv-n.igual') || document.body).opacity }));
  ok(/· Real$/.test(r.on), 'els sis camps escriuen al real, i ho diuen: ' + r.on);
  ok(r.op === '1', 'el que és igual no es dibuixa mig transparent (el text manté el contrast)');
  await p.click('#edVistes input[value=real] + span');
}

console.log('\n7D · La web que surt del mapa');
{
  await p.evaluate(() => { window.__VS_ED.comencaDeNou(); });
  await p.click('#btExemple');
  await p.click('#edTabWeb');
  const menu = () => p.evaluate(() => [...document.querySelectorAll('#edPanWeb [data-web-pag]')].map(b => b.textContent));
  const m0 = await menu();
  ok(m0[0] === 'Inici' && m0.includes('El visitant') && m0.includes('Serveis') && m0[m0.length - 1] === 'Per a l\'equip' && !m0.includes('Qui rep i explica'),
    'la pestanya «Web» mostra el menú: Inici, una porta per rol, Serveis i l\'equip');
  await p.click('#edPanWeb [data-web-pag="el-visitant"]');
  const v = await p.evaluate(() => ({ h: document.querySelector('#edWebPag h5').textContent, pas: [...document.querySelectorAll('#edWebPag li[data-pas]')].map(l => l.getAttribute('data-pas')).join(),
    cur: document.querySelector('#edPanWeb [aria-current=page]').getAttribute('data-web-pag'), focus: document.activeElement.getAttribute('data-web-pag'),
    xip: (document.querySelector('#edWebPag .ed-web-xips a') || {}).href || '' }));
  ok(v.h === 'El visitant' && v.pas === 'coneix,compte,connecta,primer,demanem', 'la porta del visitant porta la benvinguda en cinc passos');
  ok(v.cur === 'el-visitant' && v.focus === 'el-visitant', 'el menú marca la pàgina i el focus no es perd');
  ok(/conecta\/#catalogo$/.test(v.xip) && !/^file:\/\/\/conecta/.test(v.xip), 'les connexions porten al catàleg de /conecta/, també des del disc');
  await p.click('#edPanWeb [data-web-pag="serveis"]');
  const sv = await p.evaluate(() => [...document.querySelectorAll('#edWebPag h6')].map(h => h.textContent));
  ok(sv.slice(0, 3).join('|') === 'La visita|El dia al poble|La venda pel canal', 'Serveis: els processos del mapa, en ordre');
  await p.check('#edPanWeb [data-web-casa="Qui fa el vi"]');
  const m1 = await menu();
  ok(!m1.includes('Qui fa el vi') && m1.length === m0.length - 1, 'marcar un rol com a de casa li treu la porta');
  ok(await p.evaluate(() => document.activeElement.getAttribute('data-web-casa')) === 'Qui fa el vi', 'i el focus es queda a la casella');
  await p.evaluate(() => { const ed = window.__VS_ED; ed.rol('Qui porta l\'agenda'); });
  await p.click('#edTabWeb');
  ok((await menu()).includes('Qui porta l\'agenda'), 'un rol nou al mapa és una porta nova a la web');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#edWebJson')]);
  const j = JSON.parse(readFileSync(await dl.path(), 'utf8'));
  ok(dl.suggestedFilename() === 'web.json' && j.formato === 'tt-web-1' && j.casa.length === 2 && Array.isArray(j.alta), 'Descarrega web.json amb el format tt-web-1 i la casa triada');
  await p.fill('#edWebNom', 'Celler de prova');
  await p.fill('#edWebCorreu', 'hola@exemple.cat');
  await p.selectOption('#edWebLlengua', 'es');
  const [dz] = await Promise.all([p.waitForEvent('download'), p.click('#edWebZip')]);
  const z = readFileSync(await dz.path()), zs = z.toString('latin1');
  ok(dz.suggestedFilename() === 'celler-de-prova.zip' && zs.startsWith('PK') && zs.includes('permaweb.json') && zs.includes('<html lang="es">') && zs.includes('mailto:hola@exemple.cat'),
    'Descarrega la web (.zip): les pàgines en la llengua triada, el correu i permaweb.json');
  ok(['cerebro/mapa-real.json', 'cerebro/roles/', 'cerebro/decisiones.md', 'CLAUDE.md', 'LEEME.md', 'netlify.toml', '404.html', 'robots.txt'].every(r => zs.includes(r)) && zs.includes('"abast"'),
    'i és el repositori del client: el cervell del projecte, les regles i la configuració de Netlify');
  await p.click('#edPanWeb [data-web-pag="serveis"]');
  ok(await p.evaluate(() => document.querySelector('#edWebNom').value) === 'Celler de prova', 'el nom es manté en tornar a pintar');
  ok(zs.includes('registre.html') && zs.includes('name="registre"'), 'la web porta el formulari del registre viu');
  ok(['eines/nucli.mjs', 'eines/mcp.mjs', 'netlify/functions/submission-created.mjs', '.mcp.json', 'API.md'].every(r => zs.includes(r)) && zs.includes('function avisosDelFormulari') && zs.includes('function creaMcp'),
    'i l\'API: les eines, les funcions dels avisos i el servidor MCP, amb el codi de l\'editor');
  await p.waitForFunction(() => /TT_MAPA=/.test(document.querySelector('#edWebNetlify').href));
  const nh = await p.evaluate(() => document.querySelector('#edWebNetlify').href);
  const { inflateRawSync } = await import('node:zlib');
  const hv = new URLSearchParams(nh.split('#')[1]), mp = JSON.parse(inflateRawSync(Buffer.from(hv.get('TT_MAPA'), 'base64url')).toString('utf8'));
  ok(/^https:\/\/app\.netlify\.com\/start\/deploy\?repository=https:\/\/github\.com\/asolache\/teamtowershuma&create_from_path=SOS\/plantilla-web#/.test(nh)
    && hv.get('TT_NOM') === 'Celler de prova' && hv.get('TT_LLENGUA') === 'es' && hv.get('TT_CORREU') === 'hola@exemple.cat' && mp.roles.includes('El visitant') && !('pos' in mp),
    '«Publica-la a nom teu» porta a la plantilla de Netlify amb el nom, la llengua, el correu i el mapa comprimit');
  await p.click('#edWebVeure');
  await p.waitForFunction(() => { const f = document.querySelector('#edWebMarc'); return f && f.contentDocument && f.contentDocument.querySelector('nav a'); });
  const marc = () => p.evaluate(() => { const d = document.querySelector('#edWebMarc').contentDocument;
    return { lang: d.documentElement.lang, h1: (d.querySelector('h1') || {}).textContent || '', css: !!d.querySelector('style') && !d.querySelector('link[rel=stylesheet]'), ruta: document.querySelector('#edWebRuta').textContent,
      fons: getComputedStyle(d.body).fontFamily, scripts: [...d.scripts].every(x => x.type === 'application/ld+json') }; });
  const v0 = await marc();
  ok(v0.ruta === 'index.html' && v0.lang === 'es' && /Celler de prova/.test(v0.h1) && v0.css && v0.scripts, '«Vista prèvia» ensenya la web de debò al navegador, amb el seu estil i sense scripts');
  await p.evaluate(() => document.querySelector('#edWebMarc').contentDocument.querySelector('nav a[href="el-visitant.html"]').click());
  await p.waitForFunction(() => { const d = document.querySelector('#edWebMarc').contentDocument, h = d && d.querySelector('h1');
    return document.querySelector('#edWebRuta').textContent === 'el-visitant.html' && h && /visitant/i.test(h.textContent); });
  ok(true, 'els enllaços del menú porten a la pàgina de la porta, dins la vista prèvia');
  await p.evaluate(() => document.querySelector('#edWebMarc').contentDocument.querySelector('form button[type=submit]').click());
  await p.waitForFunction(() => document.querySelector('#edWebRuta').textContent === 'gracies.html');
  ok(true, 'enviar el formulari porta a la pàgina de gràcies');
  await p.fill('#edWebNom', 'Celler nou');
  await p.waitForFunction(() => { const d = document.querySelector('#edWebMarc').contentDocument; return !!d && /Celler nou/.test(d.title); });
  ok(true, 'canviar el nom es veu a l\'acte a la vista prèvia');
  await p.click('#edWebVeure');
  ok(await p.evaluate(() => !document.querySelector('#edWebMarc') && document.activeElement.id === 'edWebVeure'), 'es tanca amb el mateix botó, i el focus no es perd');
  await p.fill('#edWebNom', 'Celler de prova');
  await p.selectOption('#edWebLlengua', 'ca');
  await p.setInputFiles('#edWebReg', { name: 'registre.csv', mimeType: 'text/csv', buffer: Buffer.from('created_at,de,a,entregable,mena,valor,nom,correu\n'
    + '2026-10-01,Qui rep i explica,El visitant,"la visita, el tast i el relat de la casa",tangible,5,Anna,anna@exemple.cat\n2026-10-02,La cooperativa,Qui fa el vi,raïm,tangible,4,,\n') });
  await p.waitForSelector('#edRegResum');
  const rs = await p.evaluate(() => document.querySelector('#edRegResum').textContent);
  ok(/^2 transaccions: 1 flux viu, \d+ sense ús, 1 nou\. Donen i no reben: .*La cooperativa/.test(rs), 'carregar el CSV del registre diu què és viu, què no passa i qui no rep: ' + rs.slice(0, 70));
  const [di] = await Promise.all([p.waitForEvent('download'), p.click('#edRegInforme')]);
  const inf = readFileSync(await di.path(), 'utf8');
  ok(di.suggestedFilename() === 'informe.md' && /^# El registre, llegit/.test(inf) && !/Anna|@/.test(inf), 'Descarrega informe.md, sense cap dada personal del CSV');
  await p.click('#edRegObre');
  const ob = await p.evaluate(() => ({ v: document.querySelector('#edVistes input:checked').value, rols: window.__VS_ED.arbre().real.t.rols }));
  ok(ob.v === 'desviacio' && /La cooperativa/.test(ob.rols), '«Obre el mapa observat» el posa a l\'editor i ensenya la desviació');
  await p.evaluate(() => { window.__VS_ED.comencaDeNou(); });
}

console.log('\n7C.7 · Els patrons del flux: el fil, i el real al costat de l\'optimitzat');
{
  await p.evaluate(() => { window.__VS_ED.comencaDeNou(); });
  await p.click('#btExemple');
  await pausa(200);
  const a = await p.evaluate(() => ({ n: document.querySelectorAll('#edPatCos .ed-pat').length, cmp: document.querySelectorAll('#edPatCos .ed-pat-cmp').length,
    fil: (document.querySelector('#edPatCos .ed-pat[data-proc=visita] .ed-pat-fil') || {}).textContent || '' }));
  ok(a.n === 3 && a.cmp === 0, 'una fitxa per procés, i sense ideal cap comparació');
  ok(/Qui fa el vi/.test(a.fil) && /⋯/.test(a.fil), 'el fil de la visita, tallat on el valor salta: ' + a.fil.slice(0, 60));
  await p.click('#edPatCos [data-acc=pt-fil][data-id=visita]');
  const t = await p.evaluate(() => ({ on: !document.querySelector('#edTarja').hidden, txt: document.querySelector('#edTarja').textContent,
    escriu: !!document.querySelector('#edTarja [data-acc=escriu]:not([hidden])') }));
  ok(t.on && /El fil de «La visita»/.test(t.txt) && !t.escriu, '«Mostra el fil» obre la targeta, sense «escriu-ho» (no és cap troballa)');
  await p.click('#edTarja [data-acc=tanca-tarja]').catch(() => {});
  await p.evaluate(() => { window.__VS_ED.ideal('copia'); });
  await pausa(150);
  const c = await p.evaluate(() => document.querySelectorAll('#edPatCos .ed-pat-cmp').length);
  ok(c === 3, 'amb l\'ideal, cada procés té el real al costat de l\'optimitzat');
  await p.click('#edPatCos [data-acc=pt-vista][data-v=ideal][data-id=visita]');
  const v = await p.evaluate(() => document.querySelector('#edVistes input:checked').value);
  ok(v === 'ideal', '«L\'optimitzat» passa a la vista ideal');
  await p.click('#edVistes input[value=real] + span');
}

console.log('\n7C.8 · Pantalla completa, amb la definició al costat');
{
  await p.evaluate(() => window.__VS_ED.ple(true));
  await pausa(200);
  const a = await p.evaluate(() => { const e = document.querySelector('#editor').getBoundingClientRect(), l = document.querySelector('#edLlenc').getBoundingClientRect();
    return { ple: document.body.classList.contains('ed-ple'), w: e.width, iw: innerWidth, baix: l.bottom, ih: innerHeight, nav: !!document.querySelector('header.cap') && document.querySelector('header.cap').offsetParent !== null,
      def: !document.querySelector('#edPleDef').hidden };
  });
  ok(a.ple && Math.abs(a.w - a.iw) < 2 && !a.nav, 'l\'editor ocupa tota la pantalla, sense la capçalera');
  ok(a.baix <= a.ih + 1, 'i el llenç s\'acaba on s\'acaba la pantalla');
  ok(a.def, 'apareix «La definició»');
  await p.click('#edPleDef');
  await pausa(150);
  const d = await p.evaluate(() => ({ dins: document.querySelector('#escrit').parentElement.id, vis: (q => q.width > 200 && q.right <= innerWidth + 1 && getComputedStyle(document.querySelector('#escrit')).display !== 'none')(document.querySelector('#escrit').getBoundingClientRect()), ll: document.querySelector('#edLlenc').offsetParent !== null }));
  ok(d.dins === 'editor' && d.vis && d.ll, 'els sis camps s\'obren al costat del mapa, i es veuen tots dos');
  await p.evaluate(() => window.__VS_ED.ple(false));
  await pausa(150);
  const f = await p.evaluate(() => ({ ple: document.body.classList.contains('ed-ple'), dins: document.querySelector('#escrit').parentElement.id, pare: document.querySelector('#escrit').parentElement !== document.querySelector('#editor') }));
  ok(!f.ple && f.pare, 'en sortir, els sis camps tornen al seu lloc');
}

console.log('\n7B.12 · Al mòbil (390 px)');
{
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  m.on('pageerror', e => errs.push(e.message));
  await m.goto(PAG);
  await m.evaluate(() => { try { localStorage.clear(); } catch (e) { /* res */ } });
  await m.reload();
  await m.evaluate(() => document.querySelector('#btExemple').click());
  await m.waitForTimeout(300);
  const r = await m.evaluate(() => {
    const d = document.documentElement;
    const petits = [...document.querySelectorAll('#editor button')].filter(x => { const q = x.getBoundingClientRect(); return q.width > 0 && q.height > 0 && x.offsetParent !== null; })
      .filter(x => { const q = x.getBoundingClientRect(); return q.width < 43.5 || q.height < 43.5; }).map(x => (x.id || x.getAttribute('data-acc') || x.textContent.trim()).slice(0, 20));
    return { sw: d.scrollWidth, cw: d.clientWidth, petits, escrit: document.querySelector('#escrit').offsetParent !== null, llenc: document.querySelector('#edLlenc').offsetParent !== null };
  });
  ok(r.sw <= r.cw, `sense scroll horitzontal (${r.sw} ≤ ${r.cw})`);
  ok(!r.petits.length, 'tots els botons visibles de l\'editor fan almenys 44 × 44' + (r.petits.length ? ': ' + r.petits.join(', ') : ''));
  ok(r.llenc && !r.escrit, 'de sortida es veu el dibuix i el formulari escrit queda plegat');
  await m.tap('#edModeE');
  const e = await m.evaluate(() => ({ escrit: document.querySelector('#escrit').offsetParent !== null, llenc: document.querySelector('#edLlenc').offsetParent !== null }));
  ok(e.escrit && !e.llenc, '«Per escrit» canvia a les sis caselles');
  await m.tap('#edModeV');
  const v = await m.evaluate(() => ({ escrit: document.querySelector('#escrit').offsetParent !== null, llenc: document.querySelector('#edLlenc').offsetParent !== null, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  ok(v.llenc && !v.escrit && v.sw <= v.cw, 'i «Visual» torna al dibuix');
  await m.evaluate(() => document.querySelector('#edTabWeb').click());
  await m.tap('#edPanWeb [data-web-pag="l-operador-de-luxe"]');
  const w = await m.evaluate(() => {
    const d = document.documentElement, vis = x => { const q = x.getBoundingClientRect(); return q.width > 0 && q.height > 0 && x.offsetParent !== null; };
    const petits = [...document.querySelectorAll('#edPanWeb button, #edPanWeb label, #edPanWeb a')].filter(vis)
      .filter(x => { const q = x.getBoundingClientRect(); return q.width < 43.5 || q.height < 43.5; }).map(x => x.textContent.trim().slice(0, 20));
    return { sw: d.scrollWidth, cw: d.clientWidth, petits, h: (document.querySelector('#edWebPag h5') || {}).textContent };
  });
  ok(w.h === 'L\'operador de luxe' && w.sw <= w.cw, `la pestanya «Web» al mòbil, sense scroll horitzontal (${w.sw} ≤ ${w.cw})`);
  ok(!w.petits.length, 'i tot el que es toca a la web fa almenys 44 × 44' + (w.petits.length ? ': ' + w.petits.join(', ') : ''));
  await m.evaluate(() => { try { localStorage.clear(); } catch (e) { /* res */ } });
  await m.close();
}

console.log('\n7B.13 · Res es trenca');
{
  ok(!errs.length, 'cap error de JavaScript en tot el recorregut' + (errs.length ? ': ' + errs[0] : ''));
  await p.evaluate(() => { window.__VS_ED.comencaDeNou(); try { localStorage.clear(); } catch (e) { /* res */ } });
}

/* ── 6 · Sense errors, i sense res que surti ────────────────────────────── */
console.log('\n6 · El fre');
{
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  const net = await p.evaluate(() => ({
    fetch: /fetch\s*\(/.test(document.documentElement.innerHTML),
    clau: /x-api-key|anthropic/i.test(document.documentElement.innerHTML)
  }));
  ok(!net.fetch && !net.clau,
    'la consola no crida cap API ni demana cap clau: prepara el text i qui el fa servir decideix on el porta');
}

await b.close();
console.log('\n' + (fail ? `❌ ${fail} fallen de ${pass + fail}` : `✅ ${pass} assercions, totes verdes`));
process.exit(fail ? 1 : 0);
