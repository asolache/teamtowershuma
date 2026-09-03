/* Molekulandia · el poble, i les nou professions que en surten
   ─────────────────────────────────────────────────────────────────────────
   La pregunta que ningú sap contestar quan li expliques el SOS és «i això, què
   és?». Un catàleg de dotze dinàmiques és una llista; un poble amb onze portes
   és un lloc on entrar.

   El risc d'aquesta pàgina no és equivocar-se de xifra: és quedar-se en un
   dibuix. El criteri estava escrit abans de començar —«si des de la pàgina no
   s'hi pot entrar a fer alguna cosa, és una il·lustració»— i aquí es prova que
   es compleix: que de cada edifici s'hi entri, que els que no tenen eina ho
   diguin, que el perfil que portes de la resta del SOS reordeni les
   professions, i que els números surtin del catàleg i no d'una còpia. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const F = p => 'file://' + join(DIR, p);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const ctx = await b.newContext({ viewport: { width: 1100, height: 900 } });
const page = await ctx.newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(F('molekulandia.html'));
await page.waitForTimeout(300);

console.log('\n1 · Els números surten del catàleg, no d\'una còpia');
{
  /* El contrast que val: els mateixos rols, comptats aquí des de l'app. Si
     algun dia el bloc generat es queda enrere, aquesta prova ho veu encara que
     la guarda no s'hagi corregut. */
  const APP = readFileSync(join(DIR, 'index.html'), 'utf8');
  const compta = nom => {
    const i = APP.indexOf('const ' + nom + '=['); const j = APP.indexOf('\n];', i);
    const cos = APP.slice(i, j);
    return [...cos.matchAll(/roles:\[([\s\S]*?)\]/g)]
      .reduce((a, m) => a + [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].length, 0);
  };
  const seves = compta('DYNAMICS') + compta('CRITICAL_ACTIVITIES') + compta('PROTOTYPE_MAPS');
  const r = await page.evaluate(() => {
    const M = window.__MOLEK, D = M.D;
    return { resum: D.resum, fonts: D.fonts,
      sumaNatures: D.resum.ofici + D.resum.part + D.resum.fora + D.resum.peca,
      rols: D.rols.length,
      senseNatura: D.rols.filter(x => !x.natura).length,
      oficiSensePro: D.rols.filter(x => x.natura === 'ofici' && !x.professio).length,
      proSenseOfici: D.rols.filter(x => x.natura !== 'ofici' && x.professio).length,
      capes: document.querySelectorAll('#capes .capa').length };
  });
  ok(r.resum.caselles === seves,
    `les ${r.resum.caselles} caselles de rol de la pàgina són les que hi ha a l'app (${seves})`);
  ok(r.rols === r.resum.unics && r.sumaNatures === r.resum.unics,
    `els ${r.resum.unics} noms diferents es reparteixen sencers entre les quatre natures ` +
    `(${r.resum.ofici}+${r.resum.part}+${r.resum.fora}+${r.resum.peca})`);
  ok(r.senseNatura === 0, 'cap rol es queda sense natura: no hi ha calaix de sastre');
  ok(r.oficiSensePro === 0 && r.proSenseOfici === 0,
    'i professió i ofici van sempre junts: tot ofici en té una, i res que no ho sigui n\'agafa cap');
  ok(r.resum.ofici < r.resum.unics / 2,
    `menys de la meitat dels noms són oficis (${r.resum.ofici} de ${r.resum.unics}): ` +
    'agrupar-los tots hauria donat una llista de sinònims');
  ok(r.fonts.length === 3 && r.capes === 4, 'les tres fonts i les quatre xifres surten a la pantalla');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
}

console.log('\n2 · De cada edifici s\'hi entra, i cap porta és falsa');
{
  const r = await page.evaluate(() => {
    const M = window.__MOLEK, D = M.D;
    const out = { edificis: D.edificis.length, botons: document.querySelectorAll('.ed').length, fitxes: [] };
    D.edificis.forEach(e => {
      M.obre(e.din);
      const f = document.querySelector('#fitxa .fitxa');
      const porta = f && f.querySelector('.porta');
      out.fitxes.push({ din: e.din, nom: e.nom,
        te: !!f,
        titol: f ? f.querySelector('h4').textContent.trim() : '',
        rols: f ? f.querySelectorAll('.xip').length : 0,
        porta: porta ? porta.getAttribute('href') : null,
        avisa: !!(f && f.querySelector('.nota.avis')),
        eina: !!e.eina });
    });
    M.obre(null);
    return out;
  });
  ok(r.botons === r.edificis, `el poble dibuixa els ${r.edificis} edificis`);
  /* Les posicions són tant per cent escrits al generador, i dos edificis
     encavalcats no peten mai: només tapen un rètol. Va passar amb el de la
     plaça, que quedava sota la casa del mig i no es llegia. */
  const xoc = await page.evaluate(() => {
    const caixes = [...document.querySelectorAll('.ed')].map(e =>
      ({ n: e.querySelector('.nm').textContent, b: e.getBoundingClientRect() }));
    caixes.push({ n: 'la plaça', b: document.querySelector('.placa').getBoundingClientRect() });
    const toca = (a, c) => a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom;
    const out = [];
    for (let i = 0; i < caixes.length; i++)
      for (let k = i + 1; k < caixes.length; k++)
        if (toca(caixes[i].b, caixes[k].b)) out.push(caixes[i].n + ' ↔ ' + caixes[k].n);
    return out;
  });
  ok(xoc.length === 0,
    'i cap dels onze es trepitja amb un altre ni amb el rètol de la plaça' +
    (xoc.length ? ': ' + xoc.join(', ') : ''));
  ok(r.fitxes.every(f => f.te), 'i de tots s\'hi pot entrar: tots obren fitxa');
  ok(r.fitxes.every(f => f.rols >= 4),
    `cada fitxa ensenya els rols del seu mapa (mínim ${Math.min(...r.fitxes.map(f => f.rols))})`);
  ok(r.fitxes.every(f => (f.porta ? 1 : 0) + (f.avisa ? 1 : 0) === 1),
    'i cadascuna té exactament una sortida: o una porta a una eina, o l\'avís que encara no n\'hi ha');
  ok(r.fitxes.every(f => !!f.porta === f.eina),
    `${r.fitxes.filter(f => f.porta).length} porten a una eina i ` +
    `${r.fitxes.filter(f => !f.porta).length} diuen que no en tenen — i és el que diuen les dades`);
  const bar = r.fitxes.find(f => f.din === 'banc_temps');
  ok(bar && /El bar/.test(bar.titol) && /Banc de Temps/i.test(bar.titol),
    `el bar és el banc de temps: «${bar ? bar.titol : '—'}»`);
  const ferr = r.fitxes.find(f => f.din === 'biblioteca_coses');
  ok(ferr && /La ferreteria/.test(ferr.titol) && /Biblioteca/i.test(ferr.titol),
    `i la ferreteria és la biblioteca de les coses: «${ferr ? ferr.titol : '—'}»`);
}

console.log('\n3 · El perfil que portes de la resta del SOS reordena les professions');
{
  const r = await page.evaluate(() => {
    const M = window.__MOLEK;
    /* Es desa amb la clau compartida: el que segueix simula haver-lo omplert al
       mapa de valor i haver arribat aquí. */
    localStorage.setItem(M.PERFIL_CLAU, JSON.stringify(['ofici', 'espai']));
    M.pinta();
    const mans = M.professionsOrdenades();
    localStorage.setItem(M.PERFIL_CLAU, JSON.stringify(['veu', 'cura', 'temps']));
    M.pinta();
    const veu = M.professionsOrdenades();
    localStorage.removeItem(M.PERFIL_CLAU);
    M.pinta();
    const buit = M.professionsOrdenades();
    return { clau: M.PERFIL_CLAU,
      mans: mans.map(p => p.id), veu: veu.map(p => p.id), buit: buit.map(p => p.id),
      manTop: mans[0], veuTop: veu[0], buitPunts: buit.map(p => p.punts),
      diuBuit: document.querySelector('#profsDiu').textContent };
  });
  ok(r.clau === 'sos_perfil_aports',
    'el perfil es llegeix de la clau compartida del SOS: qui l\'ha omplert al mapa de valor el porta posat');
  ok(r.mans[0] !== r.veu[0],
    `dos perfils diferents donen dos primers diferents: amb ofici i espai surt «${r.manTop.nom}», ` +
    `amb veu i cura surt «${r.veuTop.nom}»`);
  ok(['terra', 'circular'].includes(r.mans[0]),
    `qui porta un ofici i un espai va a parar a la producció o a la reparació, no a coordinar (${r.mans[0]})`);
  ok(r.buitPunts.every(p => p === 0),
    'i amb el perfil buit tots els encaixos són zero: no s\'inventa un rànquing que no vol dir res');
  ok(/no vol dir res/.test(r.diuBuit),
    'i la pàgina ho diu en comptes de fingir-lo');
}

console.log('\n4 · El que hi ha encès al teu poble ho marques tu');
{
  const r = await page.evaluate(() => {
    const M = window.__MOLEK;
    localStorage.removeItem(M.ENCES_CLAU); M.pinta();
    const zero = { on: document.querySelectorAll('.ed.on').length,
      diu: document.querySelector('#placaDiu').textContent };
    M.commutaEnces('banc_temps'); M.commutaEnces('matriu'); M.pinta();
    const dos = { on: document.querySelectorAll('.ed.on').length,
      desats: M.llegeixEncesos(),
      diu: document.querySelector('#placaDiu').textContent };
    M.commutaEnces('banc_temps'); M.pinta();
    const un = M.llegeixEncesos();
    /* Un edifici que no existeix no s'encén: el que es desa ha de ser del poble. */
    M.commutaEnces('inventat'); M.pinta();
    const inventat = M.llegeixEncesos();
    localStorage.removeItem(M.ENCES_CLAU); M.pinta();
    return { zero, dos, un, inventat, tot: M.D.edificis.length };
  });
  ok(r.zero.on === 0 && /no comptat/.test(r.zero.diu),
    'sense res marcat no s\'encén cap edifici, i la pàgina diu que és un poble no comptat, no un poble buit');
  ok(r.dos.on === 2 && r.dos.desats.length === 2,
    'marcar-ne dos n\'encén dos i es recorden');
  ok(new RegExp('2 de ' + r.tot).test(r.dos.diu),
    `i el text ho diu amb el seu número: «${(r.dos.diu.match(/\d+ de \d+ encesos/) || [''])[0]}»`);
  ok(r.un.length === 1 && r.un[0] === 'matriu', 'tornar-hi a clicar l\'apaga, i no toca els altres');
  ok(r.inventat.length === 1, 'i un edifici que no és al poble no s\'hi pot encendre');
}

console.log('\n5 · La troballa: hi ha professions que a l\'arcada no s\'aprenen');
{
  const r = await page.evaluate(() => {
    const M = window.__MOLEK, D = M.D;
    const orfes = M.nomesAlTerme();
    localStorage.setItem(M.PERFIL_CLAU, JSON.stringify(['veu'])); M.pinta();
    const txt = document.querySelector('#profsDiu').textContent;
    localStorage.removeItem(M.PERFIL_CLAU); M.pinta();
    return { orfes: orfes.map(p => p.nom), total: D.professions.length,
      perEdifici: D.edificis.map(e => M.professionsDe(e).length), txt,
      cobertes: [...new Set(D.edificis.flatMap(e => M.professionsDe(e).map(p => p.id)))].length };
  });
  ok(r.perEdifici.every(n => n >= 1),
    `cap edifici es queda sense cap professió (mínim ${Math.min(...r.perEdifici)}, màxim ${Math.max(...r.perEdifici)})`);
  ok(r.cobertes + r.orfes.length === r.total,
    `l'arcada ensenya ${r.cobertes} de les ${r.total} professions, i ${r.orfes.length === 1 ? 'l\'altra no' : `les altres ${r.orfes.length} no`}`);
  ok(r.orfes.length > 0 && new RegExp(r.orfes[0]).test(r.txt),
    `i la pàgina diu quina i per què: «${r.orfes.join(', ')}» només existeix al terme — ` +
    'és un forat del catàleg, i es veu perquè es calcula');
}

console.log('\n6 · La pàgina: pestanyes, menú, mòbil');
{
  const r = await page.evaluate(() => ({
    tabs: document.querySelectorAll('#tabs button').length,
    pans: document.querySelectorAll('.pan').length,
    nav: !!document.querySelector('.sos-nav'),
    aqui: [...document.querySelectorAll('.sos-nav [aria-current]')].map(a => a.getAttribute('href')),
    act: document.querySelectorAll('#activitats .tg').length,
    pro: document.querySelectorAll('#prototips .tg').length,
    inputs: document.querySelectorAll('input').length
  }));
  ok(r.tabs === r.pans && r.tabs === 4, `${r.tabs} pantalles, ${r.tabs} pestanyes`);
  ok(r.nav && r.aqui.indexOf('molekulandia.html') >= 0, 'porta el menú del SOS i s\'hi marca a si mateixa');
  ok(r.act === 14 && r.pro === 6, `el terme ensenya les ${r.act} activitats crítiques i les ${r.pro} formes`);
  ok(r.inputs === 0, 'i no hi ha cap camp on escriure res de ningú: aquí no es demana cap dada');
  await ctx.close();
}
{
  const c2 = await b.newContext({ viewport: { width: 390, height: 800 } });
  const p2 = await c2.newPage();
  const e2 = []; p2.on('pageerror', e => e2.push(e.message));
  await p2.goto(F('molekulandia.html'));
  await p2.waitForTimeout(300);
  const r = await p2.evaluate(() => ({
    ed: document.querySelectorAll('.ed').length,
    visibles: [...document.querySelectorAll('.ed')].filter(x => x.getBoundingClientRect().width > 0).length,
    desborda: document.documentElement.scrollWidth > window.innerWidth + 1
  }));
  ok(r.ed === r.visibles && r.ed === 11,
    `a 390px el dibuix es torna llista i no desapareix cap edifici (${r.visibles} de ${r.ed})`);
  ok(!r.desborda, 'i la pàgina no desborda de costat');
  ok(e2.length === 0, 'sense errors de pàgina a mòbil' + (e2.length ? ': ' + e2[0] : ''));
  await c2.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
