/* El programa d'escola · que sigui el SOS i no una manualitat amb el logotip
   ─────────────────────────────────────────────────────────────────────────
   El que es prova aquí no és que la pàgina pinti, sinó que aguanti les quatre
   coses que la fan un programa i no un joc de superherois:

   · **El cromo es dissenya, els superpoders es guanyen.** Un cromo acabat de
     fer no té cap estrella, i no hi ha cap manera de posar-n'hi una que no sigui
     que una altra persona confirmi que l'has ajudada. És la regla del cromo dels
     adults (V78) a mida d'aula: si aquí la relaxéssim, ensenyaríem que el
     reconeixement el reparteix qui mana.
   · **Ningú es pot posar una estrella a si mateix.**
   · **Cap nom d'infant surt d'aquest navegador.** El que viatja a la IA és una
     llista tancada, i es comprova mirant el que es construeix de debò.
   · **Els superpoders i les superarmes són del catàleg del SOS**, que és el que
     fa que el mapa de la classe assagi el mapa d'un poble.

   Veda 114. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'escola.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const nova = async (w = 1280, h = 900) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(APP);
  await p.waitForFunction(() => window.__ESCOLA);
  /* Cada prova comença amb l'aula buida: la taula es desa al navegador i
     arrossegar-la entre proves faria que passessin per raons equivocades. */
  await p.evaluate(() => window.__ESCOLA.buida());
  return { ctx, p, errs };
};

console.log('\n1 · Un cromo acabat de fabricar no ha guanyat res');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const E = window.__ESCOLA;
    E.C.nom = 'Capitana Tramuntana'; E.pinta();
    E.afegeixCromo('Capitana Tramuntana', 'explicar', 'eines');
    E.pintaClasse();
    return { estrelles: E.estrelles('Capitana Tramuntana'),
      fila: document.querySelector('#tCromos').textContent,
      diu: document.body.textContent };
  });
  ok(r.estrelles === 0, 'surt de la Fàbrica amb zero estrelles');
  ok(/—/.test(r.fila), 'i a la taula de la classe hi surt sense cap');
  ok(/el cromo es dissenya, els superpoders es guanyen/i.test(r.diu),
    'la pàgina ho diu amb totes les lletres');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n2 · L\'estrella la posa qui rep l\'ajuda, i ningú més');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const E = window.__ESCOLA;
    E.afegeixCromo('Raig', 'explicar', 'eines');
    E.afegeixCromo('Molsa', 'plantes', 'llavors');
    const sol = E.afegeixInter('Raig', 'Raig', 'm\'ajudo jo');
    E.afegeixInter('Raig', 'Molsa', 'mates');
    const abans = E.estrelles('Raig');
    E.confirma(0);
    const despres = E.estrelles('Raig');
    /* Confirmar dues vegades el mateix no ha de donar dues estrelles. */
    E.confirma(0);
    return { sol: sol.err, abans, despres, repetit: E.estrelles('Raig'),
      inter: E.CLASSE().inter.length };
  });
  ok(!!r.sol, 'ajudar-se un mateix es refusa: «' + r.sol + '»');
  ok(r.inter === 1, 'i l\'intent no queda apuntat (' + r.inter + ' intercanvi)');
  ok(r.abans === 0 && r.despres === 1, 'apuntar l\'ajuda no dona estrella; confirmar-la, sí');
  ok(r.repetit === 1, 'i confirmar dues vegades el mateix no en dona dues');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n3 · La confirmació és un botó de qui l\'ha rebuda, no del mestre');
{
  const { ctx, p } = await nova();
  await p.evaluate(() => {
    const E = window.__ESCOLA;
    E.afegeixCromo('Raig', 'explicar', 'eines');
    E.afegeixCromo('Molsa', 'plantes', 'llavors');
    E.afegeixInter('Raig', 'Molsa', 'mates');
    E.pintaClasse();
  });
  const abans = await p.$$('#tInter [data-conf]');
  await p.click('#tInter [data-conf]');
  const r = await p.evaluate(() => ({
    e: window.__ESCOLA.estrelles('Raig'),
    txt: document.querySelector('#tInter').textContent
  }));
  ok(abans.length === 1, 'hi ha el botó de confirmar a la fila de l\'intercanvi');
  ok(r.e === 1 && /confirmat/.test(r.txt), 'i en prémer-lo apareix l\'estrella');
  const cap = await p.$$('#tCromos [data-conf]');
  ok(cap.length === 0, 'i enlloc del llistat de cromos hi ha cap manera de posar-ne una a mà');
  await ctx.close();
}

console.log('\n4 · Cap nom d\'infant surt d\'aquest navegador');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const E = window.__ESCOLA;
    E.C.nom = 'Capitana Tramuntana';
    const d = E.payloadIA(), brut = E.carregaIA();
    const inputs = [...document.querySelectorAll('input')].map(i =>
      (i.id || '') + '|' + (i.placeholder || '') + '|' +
      ((document.querySelector('label[for="' + i.id + '"]') || {}).textContent || ''));
    return { claus: Object.keys(d), camps: E.CAMPS_IA, brutClaus: Object.keys(brut),
      inputs, sistema: E.IA_SISTEMA };
  });
  ok(r.claus.every(k => r.camps.includes(k)),
    'a la IA hi va exactament la llista tancada: ' + r.claus.join(', '));
  ok(r.brutClaus.every(k => r.camps.includes(k)),
    'i el que es construeix no té cap camp de més que la llista no filtri');
  ok(!r.claus.some(k => /cognom|alumn|classe|curs|escola|real/i.test(k)),
    'cap clau que pugui ser un nom real, un curs o una escola');
  ok(!r.inputs.some(t => /cognom|alumn|nom real|nom i /i.test(t)),
    'i enlloc de la pàgina hi ha un camp on escriure el nom d\'un infant');
  ok(/no inventis dades de cap infant real/i.test(r.sistema),
    'la instrucció a la IA també ho diu, per si algú hi enganxa un nom al camp d\'heroi');
  await ctx.close();
}

console.log('\n5 · Els poders i les armes són del catàleg del SOS');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const E = window.__ESCOLA;
    return { poders: E.PODERS.length, armes: E.ARMES.length,
      cats: E.PODERS.map(x => x.cat), typs: E.ARMES.map(x => x.typ),
      senseCat: E.PODERS.filter(x => !x.cat).length,
      senseTyp: E.ARMES.filter(x => !x.typ).length,
      opcionsPoder: document.querySelectorAll('#fPoder option').length,
      opcionsArma: document.querySelectorAll('#fArma option').length };
  });
  ok(r.senseCat === 0, `els ${r.poders} superpoders porten la categoria del banc de temps`);
  ok(r.senseTyp === 0, `les ${r.armes} superarmes porten el tipus de la biblioteca de les coses`);
  ok(r.opcionsPoder === r.poders && r.opcionsArma === r.armes,
    'i el desplegable ofereix exactament els que hi ha declarats — ni un de més');
  ok(new Set(r.cats).size >= 8, `${new Set(r.cats).size} categories diferents: el mapa de la classe té gruix`);
  await ctx.close();
}

console.log('\n6 · El mapa de la classe diu qui hi ha i qui no hi és');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const E = window.__ESCOLA;
    E.afegeixCromo('Raig', 'explicar', 'eines');
    E.afegeixCromo('Espurna', 'explicar', 'pilota');
    E.afegeixCromo('Molsa', 'plantes', 'llavors');
    E.pintaClasse();
    return { mapa: document.querySelector('#tMapaP').textContent,
      armes: document.querySelector('#tMapaA').textContent };
  });
  ok(/Raig/.test(r.mapa) && /Espurna/.test(r.mapa),
    'el poder repetit ensenya les dues persones que el tenen');
  ok(/Ningú encara/.test(r.mapa),
    'i els poders que no té ningú també es diuen — és la pregunta de la sessió 3');
  ok(/eines|caixa/i.test(r.armes), 'les superarmes també s\'agrupen');
  await ctx.close();
}

console.log('\n7 · Un heroi no es pot duplicar');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const E = window.__ESCOLA;
    E.afegeixCromo('Raig', 'explicar', 'eines');
    return { dup: E.afegeixCromo('raig', 'festa', 'pilota').err,
      buit: E.afegeixCromo('   ', 'festa', 'pilota').err,
      n: E.CLASSE().cromos.length };
  });
  ok(!!r.dup, 'dos herois amb el mateix nom es refusa: sense això les estrelles anirien a parar a qualsevol dels dos');
  ok(!!r.buit, 'i un cromo sense nom també');
  ok(r.n === 1, 'a la classe hi ha un sol cromo');
  await ctx.close();
}

console.log('\n8 · El cromo és un fitxer que es pot imprimir');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const E = window.__ESCOLA;
    E.C.nom = 'Capitana Tramuntana de la Serra Alta';
    const cv = E.pinta();
    const dades = cv.toDataURL('image/png');
    /* El nom llarg s'ha d'encongir abans de retallar-se. */
    const x = cv.getContext('2d');
    const petit = E.encabeix(x, 'Capitana Tramuntana', 300, -100, 460, 40, 24, '700');
    return { w: cv.width, h: cv.height, png: dades.slice(0, 22), pes: dades.length,
      mida: petit.mida, text: petit.text };
  });
  ok(r.w === 600 && r.h === 840, 'el cromo és una imatge de 600×840, feta per imprimir');
  ok(r.png === 'data:image/png;base64,' && r.pes > 5000, 'i es converteix en PNG de debò');
  ok(r.text === 'Capitana Tramuntana', 'un nom llarg s\'encongeix i no es retalla: «' + r.text + '» a ' + r.mida + 'px');
  ok(r.mida < 40, 'perquè la lletra baixa fins que hi cap');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n9 · La guia del professorat hi és sencera i porta a la formació');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => ({
    sessions: document.querySelectorAll('details.sessio').length,
    edats: document.querySelectorAll('.edat').length,
    mods: [...document.querySelectorAll('a[href*="formacio.html#"]')].map(a => a.getAttribute('href')),
    dades: !!document.querySelector('#dades'),
    accions: document.querySelectorAll('.acc').length,
    avaluacio: /No es mira/.test(document.body.textContent)
  }));
  ok(r.sessions >= 6, `${r.sessions} sessions desplegables a la guia`);
  ok(r.edats === 3, 'les tres franges d\'edat: 6-8, 9-10 i 11-13');
  ok(r.accions === 2, 'les dues accions del programa');
  ok(r.mods.length >= 6, `${r.mods.length} enllaços a mòduls de formació de debò`);
  ok(r.dades, 'i l\'apartat de dades dels infants');
  ok(r.avaluacio, 'l\'avaluació diu també què NO es mira, que és la meitat que importa');
  await ctx.close();
}

console.log('\n10 · Cap al mòbil, que és on hi ha la tauleta de l\'aula');
for (const [w, h] of [[390, 844], [820, 1180]]) {
  const { ctx, p, errs } = await nova(w, h);
  const r = await p.evaluate(() => ({
    ample: document.documentElement.scrollWidth,
    cv: Math.round(document.querySelector('#cvCromo').getBoundingClientRect().width)
  }));
  ok(r.ample <= w, `${w}px · la pàgina no se'n va de costat`);
  ok(r.cv > 200 && r.cv <= w, `${w}px · el cromo es veu sencer (${r.cv}px)`);
  ok(errs.length === 0, `${w}px · sense errors de pàgina`);
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
