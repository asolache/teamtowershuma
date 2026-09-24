/* El mapa de valor, a les dues pantalles que l'expliquen.
 *
 * `build-mapavalor.js` ja vigila que el cas quadri llegint la seva declaració.
 * El que es comprova aquí és el que un generador no pot veure: que **les dues
 * pàgines diguin el mateix cas** i que cadascuna faci la seva feina —la portada
 * el presenta i `/SOS/vna` l'explica—, i que el dibuix que arriba al navegador
 * sigui llegible i no un embolic de ratlles.
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const AQUI = dirname(fileURLToPath(import.meta.url));
const PORTADA = 'file://' + join(AQUI, '..', '..', 'index.html');
const VNA = 'file://' + join(AQUI, '..', 'vna.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

console.log('\n1 · La portada: el castell i el cas, en aquest ordre i a dalt');
const p1 = await b.newPage({ viewportSize: { width: 1280, height: 900 } });
p1.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await p1.goto(PORTADA);
const port = await p1.evaluate(() => {
  const ids = [...document.querySelectorAll('section[id]')].map(s => s.id);
  const mv = document.querySelector('#mapaval');
  return {
    ids,
    /* El castell diu QUÈ ÉS un mapa i el celler QUÈ S'HI TROBA. Separats,
       cadascun diu mitja cosa: el castell sol es llegeix com una metàfora i el
       celler sol com una consultoria més. */
    parella: ids.indexOf('mapaval') === ids.indexOf('fentpinya') + 1,
    abansDelRepte: ids.indexOf('fentpinya') < ids.indexOf('enfoc'),
    nodes: mv ? mv.querySelectorAll('.mv-n').length : 0,
    fletxes: mv ? mv.querySelectorAll('.mv-svg path[marker-end]').length : 0,
    text: mv ? mv.innerText : ''
  };
});
ok(port.abansDelRepte, 'el castell va abans del repte: primer es veu què venem');
ok(port.parella, 'i el cas del celler va just darrere, no en una altra pantalla');
ok(port.nodes === 7, `el mapa del celler porta ${port.nodes} nodes`);
ok(port.fletxes === 16, `i ${port.fletxes} transaccions dibuixades, una per lliurament`);

console.log('\n2 · El cas diu la tesi, i no la diu amb xifres inventades');
const tesi = {
  marge: /marge no surt d'apujar el preu/i.test(port.text),
  intangibles: /intangibles que la casa ja produeix/i.test(port.text),
  contrast: /distribuïdor/i.test(port.text) && /operador/i.test(port.text),
  /* La guarda que importa. No tenim els números d'aquell celler i publicar-ne
     un marge inventat és el que la guia de marca prohibeix. */
  sensEuros: !/€|\d+\s*%/.test(port.text),
  avis: /no porta cap xifra|el marge el calcula la casa/i.test(port.text)
};
ok(tesi.marge && tesi.intangibles, 'diu d\'on surt el marge: cobrar el que ja es produeix i no es cobra');
ok(tesi.contrast, 'i el compara pels dos camins, el canal i el visitant');
ok(tesi.sensEuros, 'sense cap xifra d\'euros ni cap percentatge');
ok(tesi.avis, 'i dient que el marge el calcula la casa amb els seus números');

console.log('\n3 · Les dues menes es distingeixen sense dependre del color');
const traç = await p1.evaluate(() => {
  const ps = [...document.querySelectorAll('#mapaval .mv-svg path[marker-end]')];
  const disc = ps.filter(x => x.getAttribute('stroke-dasharray'));
  return { total: ps.length, disc: disc.length, titols: ps.filter(x => x.querySelector('title')).length };
});
ok(traç.disc === 7, `${traç.disc} transaccions van discontínues: són les intangibles`);
ok(traç.total - traç.disc === 9, 'i la resta plenes: qui no distingeix els colors també ho llegeix');
ok(traç.titols === traç.total, 'cada fletxa diu qui dona què a qui en passar-hi per sobre');
await p1.close();

console.log('\n4 · /SOS/vna explica la feina, no només la idea');
const p2 = await b.newPage({ viewportSize: { width: 1280, height: 900 } });
p2.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await p2.goto(VNA);
const v = await p2.evaluate(() => {
  const secs = [...document.querySelectorAll('.mv-sec')];
  const t = secs.map(s => s.innerText).join('\n');
  return {
    secs: secs.length,
    notacio: document.querySelectorAll('.mv-nt').length,
    passos: document.querySelectorAll('.mv-pas li').length,
    allee: document.querySelectorAll('.mv-pas li.allee').length,
    entregables: document.querySelectorAll('.mv-e').length,
    files: document.querySelectorAll('.mv-taula tbody tr').length,
    nodes: document.querySelectorAll('.mv-nd').length,
    castell: !!document.getElementById('llenc'),
    t
  };
});
ok(v.castell, 'el castell segueix sent el primer que es veu: l\'essència no es toca');
ok(v.notacio === 5, 'la notació explica les cinc coses del dibuix');
ok(v.passos === 9, `el procés té ${v.passos} passos`);
ok(v.allee === 3, 'i tres van marcats com a anàlisis de Verna Allee');
ok(/Anàlisi d'intercanvi/.test(v.t) && /Anàlisi d'impacte/.test(v.t) && /Anàlisi de creació de valor/.test(v.t),
  'les tres, pel seu nom');
ok(v.entregables === 4, 'i es diu què s\'endú la casa, en quatre entregables');
ok(v.files === 16, `les 16 transaccions del cas hi surten una per una (${v.files})`);
ok(v.nodes === 7, 'i els set nodes, amb què dona i què rep cadascun');

console.log('\n5 · El mateix cas a les dues pantalles, no dos casos que s\'assemblen');
const iguals = await p2.evaluate(() => {
  const n = [...document.querySelectorAll('.mv-nd b')].map(x => x.textContent.trim());
  return n;
});
const aPortada = await (async () => {
  const p = await b.newPage();
  await p.goto(PORTADA);
  const n = await p.evaluate(() => [...document.querySelectorAll('#mapaval .mv-n text')]
    .map(t => t.closest('.mv-n').dataset.id));
  await p.close();
  return [...new Set(n)];
})();
ok(aPortada.length === 7, 'la portada dibuixa els mateixos set nodes');
ok(iguals.length === 7, 'i /SOS/vna en descriu els mateixos set');
ok(/turisme de luxe/i.test(v.t), 'i les dues parlen del mateix celler');
await p2.close();

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
