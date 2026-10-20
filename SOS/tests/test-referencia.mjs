/* Models de referència per àmbit (v2). Un sol motor de mapes; el model amb què
   es compara cada entitat depèn del que és: un negoci no rep els rols del banc
   de temps, i el sector (CCAE-2009) tria el model. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });

const primer = async (nom, sector) => {
  await page.goto(APP + '?primer');
  await page.waitForFunction(() => window.__SOS);
  await page.waitForSelector('#pmNom');
  await page.fill('#pmNom', nom);
  if (sector) await page.selectOption('#pmSector', sector);
  await page.click('.modal .btn-primary');
  await page.waitForSelector('.vna-canvas');
};

console.log('\n1 · Un negoci nou es compara amb un model de negoci');
await primer('La Fleca');
let r = await page.evaluate(() => { const S = window.__SOS, n = S.byId(S.state.activeId), d = S.desviacioMapa(n, S.protoSuggerit(n).id);
  return { ambit: S.ambitDe(n), sug: S.protoSuggerit(n).id, falten: d.rolsFalten.join(), models: S.modelsPer(n).map(m => m.id).join(), cobert: d.cobert }; });
ok(r.ambit === 'negoci', 'el que fa «La primera vegada» és un negoci');
ok(r.sug === 'negoci', 'el model suggerit és «El meu negoci» (' + r.sug + ')');
ok(!/Persones oferents|Nucli gestor|Referent territorial/.test(r.falten), 'i no li falten rols del banc de temps (' + (r.falten || 'cap') + ')');
ok(r.cobert === 100, 'el negoci mateix compta com a «El negoci»: el mapa nou cobreix el model sencer (' + r.cobert + '%)');
ok(!/cura_social/.test(r.models), 'els models que se li ofereixen són de negoci (' + r.models + ')');

console.log('\n2 · El sector tria el model');
await primer('Taller Roca', 'C');
r = await page.evaluate(() => { const S = window.__SOS, n = S.byId(S.state.activeId);
  return { sector: n.sector && n.sector.codi, sis: n.sector && n.sector.sistema, pref: S.modelPreferit(n).id, seccions: S.SECTORS_CCAE.length }; });
ok(r.sector === 'C' && r.sis === 'CCAE-2009', 'el sector queda al node amb el seu sistema (' + r.sis + ' ' + r.sector + ')');
ok(r.pref === 'producte_artesa', 'manufactura → model de producte artesà (' + r.pref + ')');
ok(r.seccions === 21, 'les 21 seccions, de la A a la U');

console.log('\n3 · Una entitat social continua amb models socials');
r = await page.evaluate(() => { const S = window.__SOS, n = S.newNode('Banc de temps del barri', 'projecte', null);
  S.seedFromDynamic(n, S.dynById('banc_temps'));
  return { ambit: S.ambitDe(n), models: S.modelsPer(n).map(m => m.id).join(), sug: S.protoSuggerit(n).id }; });
ok(r.ambit === 'social' && !/negoci/.test(r.models), 'el banc de temps és social i no rep «El meu negoci» (' + r.models + ')');

console.log('\n4 · La MATRIU sense IA tria entre els models del tipus de projecte');
r = await page.evaluate(async () => { const S = window.__SOS;
  return { emp: (await S.aiPlanValueFlows('vull obrir una botiga al poble', { projectType: 'empresa' })).fromPrototype,
    com: (await S.aiPlanValueFlows('volem fer alguna cosa al barri', { projectType: 'comunitari' })).fromPrototype }; });
ok(r.emp === 'negoci', 'una empresa sense paraules clau rep «El meu negoci», no el servei de proximitat (' + r.emp + ')');
ok(r.com === 'servei_proximitat', 'un projecte comunitari continua amb el servei de proximitat (' + r.com + ')');

await b.close();
console.log(`\n${pass} ✓ · ${fail} ✗`);
process.exit(fail ? 1 : 0);
