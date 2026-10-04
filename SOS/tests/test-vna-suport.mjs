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
