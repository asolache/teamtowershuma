/* V69 · La capa de la segona llengua.
   El que es prova aquí, sobretot, és el **pitjor cas**: què veu algú quan una
   cadena no està traduïda. Si la resposta fos «una clau crua» la capa no
   serviria, perquè amb 2.400 cadenes al codi el cas normal durant molt de temps
   serà justament aquest. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await b.newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.t);

console.log('\n1 · El pitjor cas: una cadena sense traduir');
const fallback = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.setLang('es');
  const inventada = 'Una frase que no és al diccionari i no hi serà mai';
  return { surt: S.t(inventada), lang: S.state.lang };
});
ok(fallback.surt === 'Una frase que no és al diccionari i no hi serà mai',
  'surt en català, tal qual — mai una clau crua');
ok(fallback.lang === 'es', 'i això passa amb el castellà activat, que és quan importa');

console.log('\n2 · El que sí que hi és, es tradueix');
const trad = await page.evaluate(() => {
  const S = window.__SOS;
  return { desa: S.t('Desa'), tanca: S.t('Tanca'), socis: S.t('👥 Socis') };
});
ok(trad.desa === 'Guardar', 'Desa → ' + trad.desa);
ok(trad.tanca === 'Cerrar', 'Tanca → ' + trad.tanca);
ok(trad.socis === '👥 Socios', '👥 Socis → ' + trad.socis);

console.log('\n3 · En català, la cadena original no es toca');
const ca = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.setLang('ca');
  return { desa: S.t('Desa'), lang: S.state.lang, html: document.documentElement.getAttribute('lang') };
});
ok(ca.desa === 'Desa' && ca.lang === 'ca', 'torna «Desa» sense passar per cap diccionari');
ok(ca.html === 'ca', 'i <html lang> segueix la tria: ' + ca.html);

console.log('\n4 · <html lang> canvia de debò, que és el que llegeix un lector de pantalla');
const lang = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.setLang('es');
  const es = document.documentElement.getAttribute('lang');
  await S.setLang('ca');
  return { es, ca: document.documentElement.getAttribute('lang') };
});
ok(lang.es === 'es' && lang.ca === 'ca', 'es ↔ ca al document: ' + lang.es + ' → ' + lang.ca);

console.log('\n5 · La tria es recorda en tornar a obrir l\'app');
const persist = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.setLang('es');
  S.state.lang = 'ca';                 // com si s'hagués reobert l'app
  const carregat = await S.loadLang();
  await S.setLang('ca');
  return carregat;
});
ok(persist === 'es', 'es recupera el castellà del disc');

console.log('\n6 · Una llengua que no existeix no trenca res');
const bad = await page.evaluate(async () => {
  const S = window.__SOS;
  const r = await S.setLang('klingon');
  const d = S.t('Desa');
  await S.setLang('ca');
  return { r, d };
});
ok(bad.r === 'ca' && bad.d === 'Desa', 'cau al català en comptes de deixar l\'app a mitges');

console.log('\n7 · Les variables se substitueixen');
const vars = await page.evaluate(() => window.__SOS.t('Hi ha {n} coses a {lloc}', { n: 3, lloc: 'Vilafranca' }));
ok(vars === 'Hi ha 3 coses a Vilafranca', vars);

console.log('\n8 · Les pestanyes del node canvien de llengua');
const tabs = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Banc', 'projecte', null); n.dynamicType = 'banc_temps';
  S.seedFromDynamic(n, S.dynById('banc_temps'));
  S.state.nodes.push(n); await S.persist(n);
  await S.setShowAllTabs(true);
  S.selectNode(n.id); await new Promise(r => setTimeout(r, 80));
  const cat = [...document.querySelectorAll('#workspace .tabs .tab')].map(x => x.textContent.trim());
  await S.setLang('es'); S.render(); S.selectNode(n.id);
  await new Promise(r => setTimeout(r, 80));
  const cast = [...document.querySelectorAll('#workspace .tabs .tab')].map(x => x.textContent.trim());
  await S.setLang('ca');
  return { cat, cast };
});
ok(tabs.cat.some(x => /Socis/.test(x)), 'en català: ' + tabs.cat.slice(0, 4).join(' · '));
ok(tabs.cast.some(x => /Socios/.test(x)), 'en castellà: ' + tabs.cast.slice(0, 4).join(' · '));

console.log('\n9 · El selector diu la cobertura real, sense vendre res');
const ui = await page.evaluate(async () => {
  const S = window.__SOS;
  S.openLangModal();
  await new Promise(r => setTimeout(r, 60));
  const txt = document.querySelector('.modal').textContent;
  const botons = document.querySelectorAll('#langList button').length;
  S.closeModal();
  return { txt, botons, cov: S.langCoverage('es') };
});
ok(ui.botons === 2, 'hi ha les dues llengües');
ok(/surt en català/.test(ui.txt), 'i avisa que el que no està traduït surt en català');
ok(new RegExp(ui.cov.traduides + ' textos').test(ui.txt),
  'i diu quants n\'hi ha de debò (' + ui.cov.traduides + '), no «disponible en castellà»');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
