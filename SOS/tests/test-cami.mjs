/* El meu camí (22/10/2026) · el SOS com a canal per formar.
   Una sola lectura: el teu ikigai, on ets, els mòduls del rol i el pas d'avui.
   S'hi arriba des de la portada, des de ?cami, des del progrés a «Avui» i
   escrivint «formació». La docència no es copia: cada mòdul obre formacio.html. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';

const DIR = dirname(fileURLToPath(import.meta.url));
const APP = 'file://' + join(DIR, '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await b.newPage({ viewport: { width: 390, height: 844 } });
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS);
await page.waitForTimeout(1200);

console.log('\n1 · La portada diu que aquí també et formes, i porta al camí');
const porta = await page.evaluate(() => {
  const b = document.querySelector('#onboarding #obCami');
  return { hi: !!b, txt: b ? b.closest('p').textContent : '' };
});
ok(porta.hi, 'hi ha «El meu camí →» a la portada');
ok(/et formes/.test(porta.txt) && /ikigai/.test(porta.txt) && /món una mica millor/.test(porta.txt),
  'i la frase diu per a què: «' + porta.txt.trim().slice(0, 90) + '…»');
await page.click('#obCami');
await page.waitForSelector('#cami', { timeout: 5000 }).catch(() => {});
const sense = await page.evaluate(() => {
  const m = document.querySelector('#cami');
  return m ? { h: m.querySelector('h2').textContent, txt: m.textContent,
    mods: m.querySelectorAll('.cm-m').length,
    links: [...m.querySelectorAll('.cm-m a')].map(a => a.getAttribute('href')),
    primari: (m.querySelector('.btn-primary') || {}).textContent || '',
    eines: [...m.querySelectorAll('#cmEines a')].map(a => a.getAttribute('href')),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth } : null;
});
ok(sense && /El meu camí/.test(sense.h), 'el modal s\'obre: «' + (sense && sense.h) + '»');
ok(sense && /compromís amb les teves arrels/.test(sense.txt), 'l\'ikigai porta el compromís amb les arrels');
ok(sense && /1 · Per a què/.test(sense.txt) && /2 · On ets/.test(sense.txt) && /3 · Què toca/.test(sense.txt) && /4 · El pas d'avui/.test(sense.txt),
  'es llegeix en quatre passos, de dalt a baix');
ok(sense && sense.mods > 0, 'amb els mòduls del rol: ' + (sense && sense.mods));
ok(sense && sense.links.every(h => /^formacio\.html#m\d+$/.test(h)), 'cada mòdul obre la seva lliçó a formacio.html');
const anc = readFileSync(join(DIR, '..', 'formacio.html'), 'utf8');
ok(sense && sense.links.every(h => anc.includes('id="' + h.split('#')[1] + '"')), 'i l\'àncora existeix de debò');
ok(sense && ['banc-temps.html','biblioteca.html','compra.html','energia.html','habitatge.html'].every(h => sense.eines.includes(h)), 'i on es practica: les eines psicosocials del SOS');
ok(sense && /Crea el teu perfil/.test(sense.primari), 'sense perfil, el pas és crear-lo: «' + (sense && sense.primari) + '»');
ok(sense && sense.overflow === 0, 'a 390 px no desborda');
await page.evaluate(() => document.querySelector('#modalRoot').innerHTML = '');

console.log('\n2 · Els mòduls s\'ordenen pel nivell que ja demostres');
const ord = await page.evaluate(() => {
  const M = [
    { id: 'm1', n: 1, title: 'a', hours: 1, level: 'N0', roles: ['x'] },
    { id: 'm2', n: 2, title: 'b', hours: 1, level: 'N1', roles: ['x'] },
    { id: 'm5', n: 5, title: 'c', hours: 1, level: 'N2', roles: ['x'] },
    { id: 'm16', n: 16, title: 'd', hours: 1, level: 'N3', roles: ['x'] },
    { id: 'm9', n: 9, title: 'e', hours: 1, level: 'N1', roles: ['y'] }
  ];
  return window.Cami.moduls({ rol: 'x', moduls: M }, 'N1').map(x => x.m.id + ':' + x.estat).join(' ');
});
ok(ord === 'm1:fet m2:ara m5:ara m16:despres', 'N1: el N0 ja es demostra, N1 i N2 toquen ara, N3 després, i els d\'un altre rol no hi surten (' + ord + ')');

console.log('\n3 · Amb perfil: l\'ikigai a dalt, el nivell i el pas de registrar');
await page.click('#obHero');
await page.waitForSelector('#shSave');
await page.fill('#shName', 'Marta Vidal');
await page.fill('#shMuni', 'Vilafranca del Penedès');
await page.click('#shSave');
await page.waitForTimeout(400);
await page.evaluate(async () => {
  document.querySelector('#modalRoot').innerHTML = '';
  const S = window.__SOS; S.state.activeId = null; S.state.homeView = 'tauler'; S.render();
  await new Promise(r => setTimeout(r, 250));
});
await page.waitForSelector('#prCami', { timeout: 5000 }).catch(() => {});
ok(await page.$('#prCami'), 'el progrés a «Avui» porta al camí');
await page.click('#prCami');
await page.waitForSelector('#cami', { timeout: 5000 }).catch(() => {});
const amb = await page.evaluate(() => {
  const m = document.querySelector('#cami');
  return m ? { iki: m.querySelectorAll('.iki-q').length, nv: (m.querySelector('.ent-nm') || {}).textContent || '',
    primari: (m.querySelector('.btn-primary') || {}).textContent || '' } : null;
});
ok(amb && amb.iki === 4, 'els quatre quadrants de l\'ikigai: ' + (amb && amb.iki));
ok(amb && /^N[0-3] · /.test(amb.nv), 'i el nivell: «' + (amb && amb.nv) + '»');
ok(amb && /Registra el que has fet/.test(amb.primari), 'el pas d\'avui és fer: «' + (amb && amb.primari) + '»');
await page.evaluate(() => document.querySelector('#modalRoot').innerHTML = '');

console.log('\n4 · I escrivint «formació» a «Què necessites?»');
const src = readFileSync(join(DIR, '..', 'index.html'), 'utf8');
ok(/id:'qn_cami'[^}]*openCami\(\)/.test(src) && /formacio:'cami'/.test(src), 'l\'acció hi és i «formació» la troba');
ok(/\[\?&\]cami\\b/.test(src), 'i ?cami l\'obre directament');

await b.close();
console.log('\n' + pass + ' ok · ' + fail + ' malament');
process.exit(fail ? 1 : 0);
