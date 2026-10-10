/* L'ajut d'inici · la primera pantalla que veu tothom.
   Tres coses que fallaven i que ningú comprovava, precisament perquè són el
   primer que passa i el que menys es torna a mirar:

   · Les etiquetes d'èmfasi sortien **literals** al text del tour.
   · L'últim pas no tenia cap manera de dir «ja està» que no fos «salta».
   · I un cop saltada, la introducció era irrecuperable per sempre.

   I una que ha canviat de lloc (pla-millora-sos.md, punt 3): el tour ja no
   surt sol en arribar. Qui arriba veu la portada i el botó d'apuntar-s'hi, i
   el tour, en tres pantalles, se li ofereix a la benvinguda quan ja ha creat
   el perfil. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
/* Context propi i sense tocar res: això ha de provar el **primer contacte** de
   debò, amb la base de dades buida. */
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS);
await page.waitForTimeout(2200);

console.log('\n1 · En arribar no surt res al davant: la portada i el botó d\'entrar');
const primer = await page.evaluate(() => {
  const ap = document.querySelector('#obApunta');
  return {
    obert: !!document.querySelector('.modal-bg'),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    top: ap ? Math.round(ap.getBoundingClientRect().top) : 9999
  };
});
ok(!primer.obert, 'cap tour tapant la portada');
ok(primer.top < 700, '«Apunta-t\'hi» es veu sense fer scroll a 390 px (top ' + primer.top + ')');
ok(primer.overflow === 0, 'i a 390 px no desborda');

console.log('\n2 · Després de crear el perfil, la benvinguda ofereix el tour curt');
await page.click('#obApunta');
await page.waitForSelector('#shSave');
await page.fill('#shName', 'Marta Vidal');
await page.fill('#shMuni', 'Vilafranca del Penedès');
await page.click('#shSave');
await page.waitForSelector('#wcTour', { timeout: 5000 }).catch(() => {});
const ofert = await page.evaluate(() => ({
  boto: (document.querySelector('#wcTour') || {}).textContent || '',
  benvinguda: !!document.querySelector('#wcLater')
}));
ok(ofert.benvinguda && /3 pantalles/.test(ofert.boto), 'hi ha el botó: «' + ofert.boto + '»');
await page.click('#wcTour');
await page.waitForTimeout(150);

console.log('\n══ El que importa: que la primera pantalla no ensenyi el codi ══');

console.log('\n3 · L\'èmfasi es veu com a èmfasi, no com a etiquetes');
const text = await page.evaluate(() => {
  const p = document.querySelector('.modal p');
  return { h: (document.querySelector('.modal h2') || {}).textContent || '',
    vist: p.textContent, negretes: p.querySelectorAll('strong,em').length };
});
ok(/univers/i.test(text.h), 'comença per la frase de la V76: «' + text.h + '»');
ok(!/<\/?strong>|<\/?em>|&lt;/.test(text.vist),
  'cap etiqueta literal al text que llegeix la persona');
ok(text.negretes >= 2, 'i les ' + text.negretes + ' negretes són negretes de debò');

const passos = () => page.evaluate(async () => {
  const out = [];
  for (let k = 0; k < 10; k++) {
    const m = document.querySelector('.modal'); if (!m) break;
    const p = m.querySelector('p');
    out.push({ h: (m.querySelector('h2') || {}).textContent || '',
      brut: /<\/?strong>|<\/?em>|&lt;/.test(p ? p.textContent : ''),
      skip: !!m.querySelector('#obSkip'), next: !!m.querySelector('#obNext'),
      done: !!m.querySelector('#obDone'), cta: !!m.querySelector('#obCta'),
      back: !!m.querySelector('#obBack') });
    const n = m.querySelector('#obNext'); if (!n) break;
    n.click(); await new Promise(r => setTimeout(r, 100));
  }
  return out;
});
const curt = await passos();
ok(curt.length === 3, 'són ' + curt.length + ' pantalles: ' + curt.map(s => s.h).join(' · '));
ok(!curt.some(s => /primer pas concret|Entres com a/i.test(s.h)),
  'i cap explica el que ja ha fet (entrar i fer-se el perfil)');
ok(!curt.some(s => s.brut), 'cap dels ' + curt.length + ' passos ensenya marcatge');

console.log('\n4 · De cada pas se’n pot sortir, i de l’últim també');
const ultim = curt[curt.length - 1];
ok(curt.every(s => s.skip || s.done),
  'tots els passos tenen una sortida: ni un cul-de-sac');
ok(ultim.done && !ultim.skip,
  'i l\'últim diu «Comença!» en comptes de «salta»: quan has arribat al final no queda res a saltar');
ok(curt.slice(1).every(s => s.back), 'des del segon pas es pot tornar enrere');

console.log('\n5 · Un cop vista, no es torna a oferir, però es pot tornar a veure sencera');
/* Explicar-se una sola vegada —i justament el moment en què encara no saps si
   t'interessa— és no explicar-se. */
const torna = await page.evaluate(async () => {
  const S = window.__SOS;
  const m = document.querySelector('#obDone');
  if (m) m.click();
  await new Promise(r => setTimeout(r, 200));
  const tancat = !document.querySelector('.modal-bg');
  const jaFet = !(await S.shouldRunOnboarding());
  /* Una segona benvinguda (un altre perfil al mateix aparell) ja no l'ofereix. */
  S.openWelcomeModal('Marta Vidal');
  await new Promise(r => setTimeout(r, 200));
  const reofert = !!document.querySelector('#wcTour');
  S.closeModal();
  /* Des de la guia, que és on va qui es perd. */
  S.openGuide();
  await new Promise(r => setTimeout(r, 200));
  const g = document.querySelector('.modal');
  const teBoto = !!g.querySelector('#gdIntro');
  g.querySelector('#gdIntro').click();
  await new Promise(r => setTimeout(r, 300));
  const h = (document.querySelector('.modal h2') || {}).textContent || '';
  return { tancat, jaFet, reofert, teBoto, h };
});
ok(torna.tancat && torna.jaFet, 'es tanca i queda marcada com a vista');
ok(!torna.reofert, 'i la benvinguda ja no la torna a oferir');
ok(torna.teBoto && /univers/i.test(torna.h),
  'des de la guia es torna a obrir pel principi: «' + torna.h + '»');
const sencer = await passos();
ok(sencer.length === 6 && !sencer.some(s => s.brut),
  'i qui la demana la veu sencera, ' + sencer.length + ' pantalles, sense marcatge');
await page.evaluate(() => window.__SOS.closeModal());

const cerca = await page.evaluate(async () => {
  const S = window.__SOS;
  S.closeModal();
  S.openSearchPalette();
  await new Promise(r => setTimeout(r, 120));
  const inp = document.querySelector('#spQ');
  inp.value = 'introducció'; inp.dispatchEvent(new Event('input'));
  await new Promise(r => setTimeout(r, 120));
  const hi = /Torna a veure la introducció/.test(document.querySelector('#spResults').textContent);
  S.closeModal();
  return hi;
});
ok(cerca, 'i la cerca global també hi arriba');

console.log('\n6 · Una presentació no interromp una feina començada');
/* `modal()` buida l'arrel, així que el tour arribant tard es menjava el que
   tinguessis obert, amb el que hi haguessis escrit a dins. */
const espera = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Prova', 'projecte', null);
  S.state.nodes.push(n); await S.persist(n);
  S.openMemberForm(n);
  await new Promise(r => setTimeout(r, 150));
  const abans = document.querySelector('.modal h2').textContent;
  const r = S.openOnboardingTour();
  await new Promise(r2 => setTimeout(r2, 200));
  const despres = document.querySelector('.modal h2').textContent;
  S.closeModal();
  return { abans, despres, tornat: r };
});
ok(espera.tornat === false && espera.abans === espera.despres,
  'amb un formulari obert el tour espera i no el trepitja: segueix «' + espera.despres + '»');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
