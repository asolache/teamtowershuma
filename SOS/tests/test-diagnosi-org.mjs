/* El diagnòstic d'organització · què vols que passi
 *
 * Quatre coses que només es poden comprovar obrint-ho, i la darrera és la que
 * evita el defecte que costaria més de veure:
 *
 * · **Objectius diferents han de donar propostes diferents.** Si tots tornen
 *   el mateix, la segmentació és decorativa i no ho notaria ningú mirant la
 *   pantalla —sempre sortiria una proposta raonable.
 * · **Cap preu.** Aquest diagnòstic no en diu cap a posta; la xifra es parla.
 * · **Cap crida de xarxa fins que algú prem enviar.** És la promesa escrita al
 *   botó de la portada: te l'endús, l'enviïs o no.
 * · **El que en surt ha d'entrar sencer al CRM.** `fromJson` donava per bona
 *   qualsevol cosa amb `persona` i es menjava la resta sense avisar. Un lead
 *   buit és pitjor que cap: sembla que has recollit alguna cosa.
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const DIR = dirname(fileURLToPath(import.meta.url));
const url = f => 'file://' + join(DIR, '..', f);
const require = createRequire(import.meta.url);
const { PAQUETS, SOS_PAQUETS } = require('../tools/build-oferta.js');
const CATALEG = PAQUETS.concat(SOS_PAQUETS).map(p => p.id);

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

/* ── 1 · La tria d'entrada ──────────────────────────────────────────────── */
console.log('\n1 · La tria porta als dos diagnòstics i no pregunta res');
{
  const p = await b.newPage();
  p.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
  await p.goto(url('diagnostic.html'));
  const r = await p.evaluate(() => ({
    portes: [...document.querySelectorAll('.porta')].map(a => a.getAttribute('href')),
    camps: document.querySelectorAll('input,select,textarea').length
  }));
  ok(r.portes.includes('diagnostic-org.html') && r.portes.includes('diagnostic-territori.html'),
    'les dues portes hi són · ' + r.portes.join(' i '));
  ok(r.camps === 0, 'i no demana res: la primera pregunta és la que més abandona');
  await p.close();
}

/* ── 2 · L'eix és l'objectiu ────────────────────────────────────────────── */
console.log('\n2 · Objectius diferents donen propostes diferents');
const xarxa = [];
const p = await b.newPage();
p.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
p.on('request', r => { if (!r.url().startsWith('file://')) xarxa.push(r.url()); });
await p.goto(url('diagnostic-org.html'));
await p.waitForFunction(() => window.__DXORG);

const props = await p.evaluate(() => {
  const S = window.__DXORG, out = {};
  Object.keys(S.OBJECTIUS).forEach(id => {
    document.querySelector('#objTipus .opt[data-v="' + id + '"]').click();
    const d = S.diagnose();
    out[id] = { paq: d.paq.map(x => x.id), despres: d.despres.map(x => x.id) };
  });
  return out;
});
const ids = Object.keys(props);
ok(ids.length === 6, `${ids.length} objectius`);
const firmes = new Set(ids.map(k => props[k].paq.join('+')));
ok(firmes.size === ids.length,
  `${firmes.size} propostes diferents de ${ids.length} objectius: la segmentació decideix alguna cosa`);
const orfes = ids.flatMap(k => props[k].paq.concat(props[k].despres)).filter(x => !CATALEG.includes(x));
ok(orfes.length === 0, 'i cap proposta apunta a un paquet que no és al catàleg de debò'
  + (orfes.length ? ' · ' + orfes.join(', ') : ''));

/* ── 3 · Les preguntes que s'obren ──────────────────────────────────────── */
console.log('\n3 · No es pregunta res que no canviï la resposta');
const branques = await p.evaluate(() => {
  const S = window.__DXORG, out = {};
  Object.keys(S.OBJECTIUS).forEach(id => {
    document.querySelector('#objTipus .opt[data-v="' + id + '"]').click();
    out[id] = { format: !document.querySelector('#qFormat').hidden,
      dolor: !document.querySelector('#qDolor').hidden };
  });
  return out;
});
const totsUn = Object.keys(branques).every(k => branques[k].format !== branques[k].dolor);
ok(totsUn, 'cada objectiu obre un bloc de preguntes i només un');
ok(branques.obrir.format && branques.mapa.dolor,
  'un acte pregunta pel format; una manera de treballar, pel dolor');

/* ── 4 · Cap preu, i cap crida abans d'enviar ───────────────────────────────
   Això s'omple **clicant els botons de Següent**, i no posant valors i cridant
   `#doDx` com feia abans. La diferència no és cosmètica: `showStep()` amagava
   totes les caixes `.step` —i el resultat n'és una—, així que qui omplia el
   formulari de debò arribava al final i **no veia res**, mentre la prova, que
   s'havia saltat els passos, passava verda.

   I per això ara es mira l'alçada de debò i no `style.display`: l'element el
   tenia a `block` amb el pare amagat a sobre. Un estat correcte i una pantalla
   en blanc. */
console.log('\n4 · El que promet la pantalla');
/* Des del 09/10/2026 el contacte va al final: primer es dona valor —què
   vols que passi, quina casa sou, el que ho afina— i només quan el
   diagnòstic ja està calculat es demana a qui adreçar-lo. */
const primer = await p.evaluate(() => {
  const s1 = document.querySelector('#s1');
  return { visible: !s1.hidden, demanaCorreu: !!s1.querySelector('#mail'),
    correuAlFinal: !!document.querySelector('#s4 #mail') };
});
ok(primer.visible && !primer.demanaCorreu, 'el primer pas no demana cap dada de contacte');
ok(primer.correuAlFinal, 'el correu es demana al darrer pas');
await p.click('#objTipus .opt[data-v="sostenir"]');
await p.fill('#ampliacio', 'Som dues coses alhora i cap casella ho diu del tot.');
await p.click('[data-next="2"]');
await p.click('#orgType .opt[data-v="gran"]');
await p.fill('#municipi', 'Barcelona');
await p.click('[data-next="3"]');
await p.selectOption('#decideix', 'comite'); await p.selectOption('#termini', 'curs');
await p.click('[data-next="4"]');
const avanc = await p.evaluate(() => ({
  t: document.querySelector('#avT').textContent.trim(),
  l: document.querySelector('#avL').textContent.trim(),
  n: document.querySelectorAll('#avP li').length,
  alt: document.querySelector('#avanc').getBoundingClientRect().height }));
ok(avanc.t && avanc.l.length > 40 && avanc.n > 0 && avanc.alt > 60,
  `abans de demanar el contacte ja ensenya el que hem llegit i ${avanc.n} peça(es) que hi encaixen`);
await p.click('#doDx');
const sensa = await p.evaluate(() => document.querySelector('#result').style.display);
ok(sensa !== 'block', 'sense nom ni correu no s\'obre el diagnòstic sencer');
await p.fill('#nom', 'Anna Prova'); await p.fill('#mail', 'anna@exemple.cat');
await p.click('#doDx');
const res = await p.evaluate(() => {
  const $ = s => document.querySelector(s);
  return { alt: $('#result').getBoundingClientRect().height,
    text: ($('#result').innerText || ''),
    formFora: $('#dxForm').style.display === 'none',
    mailto: ($('#bSend').getAttribute('href') || '').slice(0, 7) };
});
ok(res.alt > 200 && res.text.length > 200,
  `el diagnòstic es veu de debò · ${Math.round(res.alt)}px i ${res.text.length} caràcters de text`);
ok(res.formFora, 'i el formulari s\'aparta');
const portes = await p.evaluate(() => [...document.querySelectorAll('#result .ara-c')].map(x => x.getAttribute('href')));
ok(['vna-suport.html', 'index.html#/node', 'index.html#/alta'].every(h => portes.includes(h)),
  'i acaba portant al mapa de valor, al node i al perfil');
ok(await p.evaluate(() => !!document.querySelector('#result .ara-op a[href="/#operatiu"]')),
  'i ofereix el servei: el negoci operatiu');
ok(res.text.includes('cap casella ho diu del tot'),
  'el que ha escrit ell surt al diagnòstic, i no només l\'etiqueta que ha triat');
ok(!/\d[\d.]*\s*€/.test(res.text), 'i no hi surt cap preu: la xifra es parla');
ok(res.mailto === 'mailto:', 'el correu es prepara amb tot escrit');
ok(xarxa.length === 0, `cap crida de xarxa fins aquí (${xarxa.length}): te l'endús, l'enviïs o no`);

/* ── 5 · El lead entra sencer al CRM ────────────────────────────────────── */
console.log('\n5 · El que en surt entra sencer al CRM');
const json = await p.evaluate(() => JSON.stringify(window.__DXORG.buildJson(window.__DXORG.diagnose())));
const resum = await p.evaluate(() => window.__DXORG.buildSummary(window.__DXORG.diagnose()));
await p.close();

{
  const c = await b.newPage();
  c.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
  await c.goto(url('crm.html'));
  await c.waitForFunction(() => window.__CRM);
  const lead = await c.evaluate(j => window.__CRM.fromJson(JSON.parse(j)), json);
  ok(lead.mena === 'organitzacio', 'el CRM sap de quin dels dos diagnòstics ve');
  ok(!!lead.objectiuNom && lead.objectiu === 'sostenir', 'i l\'objectiu hi arriba · ' + lead.objectiuNom);
  ok((lead.paquets || []).length > 0, `i els ${(lead.paquets || []).length} paquets proposats també`);
  ok(lead.quiDecideix === 'comite', 'i qui pot dir que sí');
  ok(!!lead.nom && !!lead.email, 'amb el contacte sencer');
  const pri = await c.evaluate(l => window.__CRM.priority(l), lead);
  const priDeci = await c.evaluate(l => window.__CRM.priority(Object.assign({}, l, { quiDecideix: 'jo', termini: 'data' })), lead);
  ok(priDeci > pri, `qui té data i pot decidir puja a la llista (${pri} → ${priDeci})`);
  await c.close();
}

/* ── 5b · El que es tria es VEU que s'ha triat ──────────────────────────── */
console.log('\n5b · El que es tria es veu');
{
  const v = await b.newPage();
  v.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
  await v.goto(url('diagnostic-org.html'));
  await v.waitForFunction(() => window.__DXORG);
  /* Es mira el COLOR i no la classe: el defecte era justament que la classe
     hi era i el CSS no la pintava, i una prova que mirés l'estat hauria
     passat igual mentre a la pantalla no passava res. */
  const marca = await v.evaluate(() => {
    const mir = sel => {
      const e = document.querySelector(sel);
      /* Sense la transició: amb el pas visible (l'objectiu ara és el primer)
         el color es llegia a mig camí i semblava que no canviava. */
      e.style.transition = 'none';
      const abans = getComputedStyle(e).borderColor;
      e.click();
      return { canvia: getComputedStyle(e).borderColor !== abans, sel: e.classList.contains('sel') };
    };
    return { org: mir('#orgType .opt'), obj: mir('#objTipus .opt') };
  });
  ok(marca.org.canvia && marca.org.sel, 'el tipus d\'organització es marca i es veu');
  ok(marca.obj.canvia && marca.obj.sel, 'i l\'objectiu també');
  await v.close();
}

/* ── 5c · La data s'escull, i es llegeix ────────────────────────────────── */
console.log('\n5c · La data');
{
  const d = await b.newPage();
  d.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
  await d.goto(url('diagnostic-org.html'));
  await d.waitForFunction(() => window.__DXORG);
  const r = await d.evaluate(() => {
    document.querySelector('#objTipus .opt[data-v="obrir"]').click();
    const q = document.querySelector('#quan');
    q.value = '2026-03-14';
    return { tipus: q.type, obert: !document.querySelector('#qFormat').hidden,
      escrit: window.__DXORG.dataLlegible('2026-03-14'),
      buit: window.__DXORG.dataLlegible('') };
  });
  ok(r.tipus === 'date', 'el «quan» obre el calendari del telèfon · type=' + r.tipus);
  ok(r.obert, 'i només surt quan l\'objectiu és un acte amb data');
  /* Una data en text lliure arribava com «al març», «2n trimestre» o «14/3» i
     cap de les tres es podia comparar amb l'agenda; una en ISO no es llegeix
     en veu alta. Es guarda en ISO i es diu com es diu. */
  ok(r.escrit === '14 de març de 2026', 'i al resum hi va escrita · ' + r.escrit);
  ok(r.buit === '', 'sense data, no s\'inventa cap dia');
  await d.close();
}

/* ── 6 · El text pla porta les seccions noves ───────────────────────────── */
console.log('\n6 · El resum manté el contracte de seccions');
['── QUI ──', '── D\'ON ──', '── QUÈ VOL ──', '── QUI DECIDEIX ──', '── DIAGNÒSTIC ──']
  .forEach(sec => ok(resum.includes(sec), 'hi és la secció ' + sec));

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
