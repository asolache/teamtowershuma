/* El cromo a l'alta, i la porta d'apuntar-se.
 *
 * Tres coses que només es poden comprovar obrint-ho:
 *
 * 1. Que **el SOS segueixi sent el SOS**: qui s'apunta per muntar un banc de
 *    temps no ha de passar per cap cromo. El bloc només surt si s'hi arriba
 *    des del Comando, i això és una regla de producte, no un detall.
 * 2. Que la foto **no surti de l'aparell**. Viu al dossier, que és de tipus
 *    privat; la prova ho comprova pel camí que importa —que el dossier no
 *    entri mai a `state.nodes`, que és el que es publica.
 * 3. Que el botó d'apuntar-se **hi sigui i porti a algun lloc**. Hi havia una
 *    porta tres pantalles avall i el defecte no el veia cap prova, perquè
 *    totes criden les funcions directament.
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));
const APP = 'file://' + join(DIR, '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await b.newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.openSuperheroiOnboarding);

console.log('\n1 · La porta d\'apuntar-se és a dalt i porta a l\'alta');
const porta = await page.evaluate(() => {
  const btn = document.querySelector('#obApunta');
  if (!btn) return { hi: false };
  const paths = document.querySelector('.ob-paths');
  // Que sigui ABANS de les tres portes és el sentit del canvi, no un detall.
  const abans = paths ? !!(btn.compareDocumentPosition(paths) & Node.DOCUMENT_POSITION_FOLLOWING) : false;
  btn.click();
  const obert = !!document.querySelector('#modalRoot .modal #shName');
  window.__SOS.closeModal();
  return { hi: true, abans, obert, txt: btn.textContent.trim() };
});
ok(porta.hi, 'el botó d\'apuntar-se existeix a la portada del SOS');
ok(porta.abans, 'i és abans de les tres portes, no tres pantalles avall');
ok(porta.obert, 'i en prémer-lo s\'obre l\'alta de debò');

console.log('\n2 · El SOS segueix sent el SOS: el cromo només ve pel Comando');
const quan = await page.evaluate(() => {
  const S = window.__SOS;
  S.openSuperheroiOnboarding({});
  const normal = !!document.querySelector('.sh-cromo');
  S.closeModal();
  S.openSuperheroiOnboarding({ via: 'comando' });
  const com = !!document.querySelector('.sh-cromo');
  const peces = {
    avatar: !!document.querySelector('#shCromoAv canvas'),
    foto: !!document.querySelector('#shFoto'),
    taller: !!document.querySelector('.shc-acc a[href*="escola"]'),
    diuOnViu: /es queda en aquest navegador/i.test((document.querySelector('.shc-priv') || {}).textContent || '')
  };
  S.closeModal();
  return { normal, com, peces };
});
ok(quan.normal === false, 'una alta normal no demana cap cromo');
ok(quan.com === true, 'i una alta que ve del Comando sí');
ok(quan.peces.avatar && quan.peces.foto, 'amb la previsualització del cromo i la tria de foto');
ok(quan.peces.taller, 'i el pont cap al taller de cromos de l\'escola');
ok(quan.peces.diuOnViu, 'i diu on es queda la foto abans que ningú n\'hi posi cap');

console.log('\n3 · La ruta del Comando obre l\'alta amb el cromo');
await page.goto(APP + '#/alta/comando');
await page.waitForTimeout(900);
ok(await page.evaluate(() => !!document.querySelector('.sh-cromo')),
  '`#/alta/comando` obre l\'alta amb el pas del cromo, sense cap ruta modal nova');
await page.evaluate(() => window.__SOS.closeModal());

console.log('\n4 · La foto viu al dossier, i el dossier no es publica');
const priv = await page.evaluate(async () => {
  const S = window.__SOS;
  const uri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const buit = S.emptyDossier('X');
  const teCamp = Object.prototype.hasOwnProperty.call(buit, 'foto');
  // Es desa com ho desa la pantalla i es mira per on podria sortir.
  await S.saveDossier('Prova Foto', { foto: uri });
  const d = S.state.dossiers[S.personKey('Prova Foto')];
  const alsNodes = (S.state.nodes || []).some(n => JSON.stringify(n).includes('data:image'));
  const c = S.superheroCromo('Prova Foto');
  return { teCamp, desada: (d || {}).foto === uri, tipus: (d || {}).type, alsNodes, alCromo: c.foto === uri };
});
ok(priv.teCamp, 'el dossier declara el camp `foto`: no s\'hi cola per un costat');
ok(priv.desada && priv.tipus === 'dossier', 'la foto es desa al dossier, que és de tipus privat');
ok(priv.alsNodes === false, 'i no arriba a `state.nodes`, que és el que es publica');
ok(priv.alCromo, 'i el cromo la coneix per pintar-la');

console.log('\n5 · El cartell no espera ningú');
/* `downloadCromo` crida `cromoImage` i tot seguit `toDataURL`. Si el dibuix
   depengués d'un `onload`, el cartell sortiria sense cara la primera vegada i
   amb cara la segona: el pitjor defecte possible, perquè sembla que funcioni. */
const cartell = await page.evaluate(() => {
  const S = window.__SOS;
  const sense = S.cromoImage('Prova Foto').toDataURL('image/png').length;
  return { sense: sense > 1000, sincron: typeof S.precarregaFoto === 'function' };
});
ok(cartell.sense, 'el cartell es dibuixa i es pot exportar sense esperar cap imatge');
ok(cartell.sincron, 'i les cares es precarreguen a part, que és el que ho fa possible');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
