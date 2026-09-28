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

/* ── 4 · Cap preu, i cap crida abans d'enviar ───────────────────────────── */
console.log('\n4 · El que promet la pantalla');
const res = await p.evaluate(() => {
  const $ = s => document.querySelector(s);
  $('#nom').value = 'Anna Prova'; $('#mail').value = 'anna@exemple.cat';
  document.querySelector('#orgType .opt[data-v="gran"]').click();
  $('#municipi').value = 'Barcelona';
  document.querySelector('#objTipus .opt[data-v="sostenir"]').click();
  $('#decideix').value = 'comite'; $('#termini').value = 'curs';
  $('#doDx').click();
  return { visible: $('#result').style.display === 'block',
    text: ($('#result').innerText || ''),
    mailto: ($('#bSend').getAttribute('href') || '').slice(0, 7) };
});
ok(res.visible, 'el diagnòstic es veu');
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

/* ── 6 · El text pla porta les seccions noves ───────────────────────────── */
console.log('\n6 · El resum manté el contracte de seccions');
['── QUI ──', '── D\'ON ──', '── QUÈ VOL ──', '── QUI DECIDEIX ──', '── DIAGNÒSTIC ──']
  .forEach(sec => ok(resum.includes(sec), 'hi és la secció ' + sec));

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
