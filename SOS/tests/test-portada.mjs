/* La primera pantalla de teamtowershuma.com · que s'entengui sense llegir
   ─────────────────────────────────────────────────────────────────────────
   El que es prova aquí no és que la portada «es vegi bé», sinó que la primera
   pantalla digui el negoci sola:

   · **Dos castells i no un graf.** Hi havia un diagrama de nodes abstracte amb
     la paraula «VNA» al mig, que és exactament el gergó que la veda 107 prohibeix
     a la cara de qui no és del gremi. Ara hi ha la metàfora que ja era al nom de
     la casa.
   · **El dibuix i el número diuen el mateix.** Si l'etiqueta diu 4 i n'hi ha 5
     pintats, la comparació és falsa i ningú se n'assabenta.
   · **El mateix clic als dos costats.** La diferència no pot ser el que li fem
     a cadascun: ha de ser quanta base tenia.
   · **Es veu sense fer scroll**, que és l'únic lloc on serveix de res.

   Veda 113. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const nova = async (w = 1280, h = 900) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(APP);
  await p.waitForSelector('#ctBtn');
  /* L'idioma es guarda al navegador i aquesta prova el vol conegut. */
  await p.evaluate(() => { try { localStorage.removeItem('tt_lang'); } catch (e) { } });
  return { ctx, p, errs };
};

console.log('\n1 · La metàfora és la del nom de la casa, no un graf abstracte');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const hero = document.querySelector('.hero');
    return {
      castells: !!hero.querySelector('.castells'),
      graf: !!hero.querySelector('.vna-diagram'),
      vna: /\bVNA\b/.test(hero.textContent),
      pinya: /pinya/i.test(hero.textContent),
      titol: !!hero.querySelector('.castells title'),
      desc: !!hero.querySelector('.castells desc')
    };
  });
  ok(r.castells, 'la primera pantalla ensenya els dos castells');
  ok(!r.graf, 'i ja no el diagrama de nodes que hi havia');
  ok(!r.vna, 'la paraula «VNA» no surt a la primera pantalla — era gergó a la cara de qui entra (veda 107)');
  ok(r.pinya, 'i sí que hi surt la pinya, que és el que explica el negoci');
  ok(r.titol && r.desc, 'el dibuix porta títol i descripció per a qui no el pot veure');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n2 · El dibuix i el número diuen el mateix');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    /* La pinya és la gent que NO forma part del tronc: tot `use` que no penja
       del grup que cau. Comptar-ho des del DOM i no des d'una constant és el
       que fa que la prova serveixi de res. */
    const pinya = g => [...document.querySelectorAll('#' + g + ' use')]
      .filter(u => !u.closest('.ct-torre')).length;
    const num = id => parseInt((document.getElementById(id).textContent.match(/\d+/) || [0])[0], 10);
    const tronc = g => document.querySelectorAll('#' + g + ' .ct-torre use').length;
    return { pE: pinya('ctEsq'), pD: pinya('ctDre'), nE: num('ctEstEsq'), nD: num('ctEstDre'),
      tE: tronc('ctEsq'), tD: tronc('ctDre') };
  });
  ok(r.pE === r.nE, `l'etiqueta de l'esquerra diu ${r.nE} i n'hi ha ${r.pE} pintats a la pinya`);
  ok(r.pD === r.nD, `la de la dreta diu ${r.nD} i n'hi ha ${r.pD}`);
  ok(r.pD > r.pE * 2, `i la diferència es veu: ${r.pD} contra ${r.pE}`);
  ok(r.tE === r.tD, `el castell de dalt és el mateix als dos costats (${r.tE} persones) — si no, no es compara res`);
  await ctx.close();
}

console.log('\n3 · En marxa una i passa el que passa a la vida');
{
  const { ctx, p, errs } = await nova();
  const abans = await p.evaluate(() => ({
    cau: document.getElementById('ctEsq').classList.contains('ct-cau'),
    foraE: document.getElementById('ctPeE').classList.contains('ct-fora'),
    foraD: document.getElementById('ctPeD').classList.contains('ct-fora')
  }));
  ok(!abans.cau && !abans.foraE && !abans.foraD, 'de bon principi hi són totes i el castell aguanta');

  await p.click('#ctBtn');
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => ({
    foraE: document.getElementById('ctPeE').classList.contains('ct-fora'),
    foraD: document.getElementById('ctPeD').classList.contains('ct-fora'),
    cauE: document.getElementById('ctEsq').classList.contains('ct-cau'),
    cauD: document.getElementById('ctDre').classList.contains('ct-cau'),
    koE: !document.getElementById('ctEstEsqKo').classList.contains('ct-amaga'),
    okE: !document.getElementById('ctEstEsq').classList.contains('ct-amaga'),
    okD: !document.getElementById('ctEstDreOk').classList.contains('ct-amaga'),
    girat: Math.round(new DOMMatrix(getComputedStyle(
      document.querySelector('#ctEsq .ct-torre')).transform).m21 * 100) !== 0
  }));
  ok(r.foraE && r.foraD, 'el mateix clic en treu una de cada costat — la diferència ha de ser la base, no el que els fem');
  ok(r.cauE && !r.cauD, 'cau el que en tenia quatre i no el que en tenia catorze');
  ok(r.girat, 'i el castell caigut es veu caigut, no només retolat');
  ok(r.koE && !r.okE, 'a l\'esquerra ho diu: «cau»');
  ok(r.okD, 'i a la dreta: «aguanta»');

  await p.click('#ctBtn');
  await p.waitForTimeout(900);
  const t = await p.evaluate(() => ({
    cau: document.getElementById('ctEsq').classList.contains('ct-cau'),
    fora: document.getElementById('ctPeE').classList.contains('ct-fora'),
    btn: document.getElementById('ctBtnA').hidden
  }));
  ok(!t.cau && !t.fora && !t.btn, 'i es pot tornar enrere: qui hi arriba pot provar-ho dues vegades');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n4 · Es veu sense fer scroll, que és on serveix de res');
for (const [w, h] of [[1280, 900], [1440, 900], [390, 844]]) {
  const { ctx, p } = await nova(w, h);
  const r = await p.evaluate(() => {
    const c = document.querySelector('.castells').getBoundingClientRect();
    const btn = document.getElementById('ctBtn').getBoundingClientRect();
    const cta = document.querySelector('.hero .btn-primary').getBoundingClientRect();
    return { dalt: Math.round(c.top), baix: Math.round(c.bottom), btn: Math.round(btn.bottom),
      cta: Math.round(cta.bottom), fold: innerHeight, ample: document.documentElement.scrollWidth };
  });
  ok(r.baix <= r.fold, `${w}px · el dibuix sencer cap a la primera pantalla (acaba a ${r.baix} de ${r.fold})`);
  ok(r.btn <= r.fold, `${w}px · i el botó per provar-ho també`);
  ok(r.ample <= w, `${w}px · la pàgina no se'n va de costat`);
  if (w >= 1280) ok(r.cta <= r.fold, `${w}px · i el botó de diagnòstic no cau per sota del plec (${r.cta})`);
  await ctx.close();
}

console.log('\n5 · També en castellà');
{
  const { ctx, p } = await nova();
  await p.click('.lang-btn[data-lang="es"]');
  await p.waitForTimeout(200);
  const r = await p.evaluate(() => {
    const hero = document.querySelector('.hero');
    return { pinya: /piña/i.test(hero.textContent), esq: document.getElementById('ctEstEsq').textContent,
      btn: document.getElementById('ctBtnA').textContent, ca: /pinya/i.test(hero.textContent) };
  });
  ok(r.pinya, 'la metàfora es tradueix i no es queda a mitges');
  ok(/sosteniendo/i.test(r.esq), 'els comptadors del dibuix també: «' + r.esq + '»');
  ok(!/En marxa/.test(r.btn), 'i el botó, que viu dins del dibuix: «' + r.btn + '»');
  await ctx.close();
}

console.log('\n6 · El que ja hi havia segueix sent-hi');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const hero = document.querySelector('.hero');
    return {
      dolor: hero.querySelectorAll('.hero-pains li').length,
      diag: !!hero.querySelector('a[href*="diagnostic"]'),
      /* La segona sortida era «veure el SOS en viu» i ara és demanar
         pressupost. Les dues tornen alguna cosa sense demanar res a canvi, que
         és el que la fa una sortida i no una crida a l'acció qualsevol; i el
         SOS segueix a un clic des de la barra de dalt, que és on el busca qui
         el vol veure. */
      segona: !!hero.querySelector('a[href*="pressupost"]') || !!hero.querySelector('a[href="/SOS/"]'),
      sosAlMenu: !!document.querySelector('.nav-links a[href="/SOS/"], nav a[href="/SOS/"]'),
      finan: /subvencions/i.test(hero.textContent),
      ordre: [...document.querySelectorAll('section[id]')].map(s => s.id)
    };
  });
  ok(r.dolor === 3, 'els tres dolors del principi no s\'han perdut pel camí');
  ok(r.diag && r.segona, 'els dos camins de sortida segueixen a la primera pantalla');
  ok(r.sosAlMenu, 'i el SOS és a un clic des de la barra de dalt');
  ok(r.finan, 'i la línia que diu qui ho paga, que és la primera pregunta d\'un ajuntament');
  /* Abans això comptava seccions. Comptar-les no diu res del que importa i peta
     el dia que se'n reordena una: el que ha de ser cert és **l'ordre del
     discurs**, benefici → procés → detall, que és el que fa que qui llegeix
     arribi al preu havent entès per què val això. */
  /* `cost` va just després del catàleg i no abans: primer es veu què es ven i
     amb quina forquilla, i llavors d'on surt el número. A l'inrevés seria
     explicar una comptabilitat a algú que encara no sap què li ofereixes. */
  const ESPINA = ['enfoc', 'glossari', 'relat', 'com', 'fentpinya',
                  'aprenent', 'cataleg', 'cost', 'sos', 'trajectoria', 'objeccions'];
  const pos = id => r.ordre.indexOf(id);
  const falten = ESPINA.filter(id => pos(id) < 0);
  ok(!falten.length, 'l\'espina de la pàgina hi és sencera' + (falten.length ? ': falta ' + falten.join(', ') : ''));
  const desordre = ESPINA.slice(1).filter((id, i) => pos(id) < pos(ESPINA[i]));
  ok(!desordre.length,
    'i va en ordre: primer el benefici, després el procés, i el preu al final'
    + (desordre.length ? ' — fora de lloc: ' + desordre.join(', ') : ''));
  await ctx.close();
}

console.log('\n7 · El catàleg: cap paquet a mitges, i cap preu que no es pugui contractar');
/* La pàgina no ven serveis, ven paquets tancats. La diferència és exactament
   això: un servei explica què és; un paquet diu qui el compra, quant dura, què
   t'endús, quant costa i quantes vegades s'ha fet. Sense les cinc, un tècnic
   municipal no ho pot portar a una junta. Veda 137. */
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const eur = t => Number(String(t).replace(/\./g, '').replace(/[^\d]/g, ''));
    const paquets = [...document.querySelectorAll('.paquet')].map(a => ({
      id: a.id,
      nom: (a.querySelector('h4') || {}).textContent || '',
      punt: (a.querySelector('.pk-punt') || {}).textContent || '',
      camps: [...a.querySelectorAll('.pk-dades dt')].map(d => d.textContent.trim()),
      endus: ((a.querySelector('.pk-endus') || {}).textContent || '').trim(),
      valor: ((a.querySelector('.pk-valor') || {}).textContent || '').trim(),
      perque: ((a.querySelector('.pk-perque') || {}).textContent || '').trim(),
      font: ((a.querySelector('.pk-font') || {}).textContent || ''),
      /* Un paquet sense xifra publicada. No és un descuit: el taller i les
         demostracions depenen de quanta gent hi ha, quanta colla cal moure i a
         quina distància, i cap d'aquestes tres coses la pot saber la pàgina. */
      mida: !!a.querySelector('.pk-mida'),
      capACost: ((a.querySelector('.pk-mida a') || {}).getAttribute
        ? a.querySelector('.pk-mida a').getAttribute('href') : ''),
      /* El preu és la xifra més baixa del bloc: a «De 1.500 a 3.000 €»,
         l'entrada és el que decideix si es pot contractar. */
      preu: Math.min(...([...((a.querySelector('.pk-preu') || {}).textContent || '')
        .matchAll(/(\d{1,3}(?:\.\d{3})+|\d{3,})/g)].map(m => eur(m[1])).filter(n => n >= 100)
        .concat([Infinity]))),
      qui: ((a.querySelectorAll('.pk-dades dd')[0] || {}).textContent || '')
    }));
    return {
      paquets,
      families: [...document.querySelectorAll('.pk-fam')].map(f => f.id),
      /* Els enllaços del catàleg, per comprovar que cap porta és falsa. */
      enllacos: [...document.querySelectorAll('.paquet h4 a')].map(a => a.getAttribute('href'))
    };
  });
  ok(r.paquets.length >= 15, r.paquets.length + ' paquets al catàleg');
  ok(r.families.length === 4, 'quatre famílies: ' + r.families.join(', '));

  const migFets = r.paquets.filter(x =>
    !x.nom.trim() || !x.endus || !(x.preu || x.mida) || !x.punt.trim() || x.camps.length !== 3
    || !x.valor || !x.perque || !x.font.trim());
  ok(!migFets.length, 'tots diuen les set coses (nom, entregable, aportació, per a qui, durada, diners, preu amb font i el que el mou)'
    + (migFets.length ? ' — a mitges: ' + migFets.map(x => x.id).join(', ') : ''));

  /* El sostre no és un caprici: per sobre, una proposta deixa de ser una
     decisió d'una regidoria i passa a ser un procediment. */
  const publics = r.paquets.filter(x => /ajuntament|consell|escola|afa|administracion|entitat/i.test(x.qui));
  /* Els que no publiquen xifra no hi entren: no tenen cap import que comparar,
     i el `Infinity` del mínim d'una llista buida no és un preu car —és cap. */
  const cars = publics.filter(x => !x.mida && x.preu > 5000);
  ok(publics.length >= 6, publics.length + ' paquets dirigits a administració o entitats');
  ok(!cars.length, 'i tots hi entren per sota dels 5.000 €'
    + (cars.length ? ' — ' + cars.map(x => x.id + ' (' + x.preu + ')').join(', ') : ''));
  /* El taller i les demostracions no publiquen preu, i això és una decisió: el
     que costen depèn de tres coses que la pàgina no pot saber. El que no pot
     passar és que es quedin mudes —«a mida» sense el mètode és el «consulta'ns»
     de sempre—, així que cada una ha de portar al mapa de cost. Veda 140. */
  const aMida = r.paquets.filter(x => x.mida);
  ok(aMida.length >= 2, aMida.length + ' paquets sense xifra publicada (el taller i les demos)');
  const mudes = aMida.filter(x => x.capACost !== '#cost');
  ok(!mudes.length, 'i tots porten al mapa de cost'
    + (mudes.length ? ' — muts: ' + mudes.map(x => x.id).join(', ') : ''));
  ok(r.paquets.some(x => /mapa de cost/i.test(x.font)) && r.paquets.some(x => /validar/i.test(x.font)),
    'i el preu diu d\'on surt: n\'hi ha segons mapa de cost i n\'hi ha a validar');

  const punts = new Set(r.paquets.map(x => x.punt.trim()));
  ok(punts.size >= 2, 'i no tots diuen el mateix punt d\'adaptació: ' + [...punts].join(' · '));
  ok(r.paquets.some(x => /provat/i.test(x.punt)) && r.paquets.some(x => /nou/i.test(x.punt)),
    'hi ha coses provades i coses noves, i es distingeixen');
  await ctx.close();
}

console.log('\n8 · El que encara no existeix, es diu');
/* La temptació de tota pàgina comercial és vendre el que estàs a punt de tenir.
   Aquí la regla és la mateixa que vigila Molekulandia: cap porta cap a un lloc
   que no hi és. Els contractes intel·ligents no estan construïts, i per això el
   que es ven és l'estudi. */
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const sos = document.querySelector('#sos');
    const contractes = document.querySelector('#pk-contractes');
    return {
      txtSos: sos ? sos.textContent.replace(/\s+/g, ' ') : '',
      contractes: contractes ? contractes.textContent.replace(/\s+/g, ' ') : '',
      lliure: sos ? /gratu|lliure/i.test(sos.textContent) : false,
      cos: document.body.textContent.replace(/\s+/g, ' ')
    };
  });
  ok(/estudi de viabilitat/i.test(r.contractes),
    'els contractes intel·ligents es venen com a estudi, no com a eina');
  ok(/no est(à|an) constru/i.test(r.txtSos) || /encara no/i.test(r.contractes),
    'i es diu obertament que encara no estan construïts');
  ok(r.lliure, 'la secció del SOS diu que l\'eina és lliure i funciona sense contractar res');
  ok(!/qu[àa]ntic/i.test(r.cos), 'i no es promet res de seguretat quàntica, que no existeix aquí');
  /* La guia de marca prohibeix aquestes: no diuen res i sonen a fullet. */
  const prohibides = ['disruptiu', 'disruptiva', 'solucions innovadores', 'ecosistema disruptiu'];
  const dites = prohibides.filter(w => new RegExp(w, 'i').test(r.cos));
  ok(!dites.length, 'cap paraula de fullet' + (dites.length ? ': ' + dites.join(', ') : ''));
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
