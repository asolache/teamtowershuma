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
import { createRequire } from 'node:module';

/* ⚠ **Tres pàgines des de l'endreça** (04/10/2026). El catàleg i «qui hi ha
   darrere» eren seccions d'aquesta pàgina i ara són `cataleg.html` i
   `qui-som.html`. Cada bloc diu quina mira: deixats tots aquí, una tercera
   part passarien en verd **per absència**, que és el defecte que el pla de
   l'endreça deia que podia cometre en silenci. */
const ARREL = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const APP = 'file://' + join(ARREL, 'index.html');
const CAT = 'file://' + join(ARREL, 'cataleg.html');
const QS = 'file://' + join(ARREL, 'qui-som.html');
const { TOTS } = createRequire(import.meta.url)('../tools/build-clients.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const nova = async (w = 1280, h = 900, url = APP) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url);
  if (url === APP) await p.waitForSelector('#ctBtn');
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
  await p.click('.lang-b[data-lang="es"]');
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

/* ── 5b · La paret de clients ──────────────────────────────────────────────
   Era una línia de sis noms separats per espais i ara és la llista sencera,
   maquetada, just sota del hero. Tres coses que només es veuen obrint-ho:

   · **Que hi siguin tots.** El generador en declara trenta-dos; si la pàgina
     en pinta menys, algú ha tocat el bloc a mà i el proper `--check` ho
     desfarà sense avisar que la portada portava dies ensenyant-ne vint.
   · **Que estiguin amunt.** Tota la gràcia és aquesta: si un dia una secció
     nova se'ls posa al davant, la prova més forta que tenim torna a quedar
     enterrada i no ho notaria ningú.
   · **Que el castellà els tradueixi.** Les línies de sector són trenta-dues
     claus noves de diccionari. Una que no hi fos deixaria aquell client en
     català enmig de la pàgina castellana —i com que el nom no es tradueix,
     es llegeix igual de bé i no es veu. */
console.log('\n5b · Els clients, sencers i amunt');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const s = document.querySelector('#clients');
    const seccions = [...document.querySelectorAll('section[id]')].map(x => x.id);
    return { hi: !!s, fitxes: s ? s.querySelectorAll('.clm-c').length : 0,
      grups: s ? s.querySelectorAll('.clm-g').length : 0,
      posicio: seccions.indexOf('clients'), seccions: seccions.length,
      ikea: s ? /IKEA/.test(s.textContent) : false,
      agencies: s ? /Laeski|We Barcelona/.test(s.textContent) : false,
      font: s ? /TeamTowers/.test((s.querySelector('.clm-nota') || {}).textContent || '') : false };
  });
  ok(r.hi && r.fitxes === 32, `els 32 clients hi són (${r.fitxes})`);
  ok(r.grups === 5, `en 5 grups (${r.grups}): una multinacional i una diputació no es llegeixen igual`);
  /* ⚠ **La paret ja no obre la pàgina** (04/10/2026): la tanca. La prova no obre
     una venda, i qui acaba de llegir què es compra és qui li treu profit; qui
     encara no sap de què va només hi veia trenta-dos logos. El que ha de
     seguir sent cert és que **hi és i és sencera**, i que no és al peu. */
  ok(r.posicio === r.seccions - 1, `i tanca la pàgina (${r.posicio + 1} de ${r.seccions}): la prova tanca la venda, no l'obre`);
  ok(r.agencies, 'les agències i partners hi són, que és el segment que el diagnòstic sap atendre');
  ok(r.font, 'i es diu de quin recorregut vénen els noms');
  await ctx.close();
}
{
  const { ctx, p } = await nova();
  await p.click('.lang-b[data-lang="es"]');
  await p.waitForTimeout(200);
  /* Es compara amb la declaració de debò i no amb una llista d'aquí: una còpia
     escrita a la prova envelliria sola i donaria verd sobre el que ja no hi és. */
  const esperat = TOTS.map(c => c.sec.es);
  const secs = await p.evaluate(() =>
    [...document.querySelectorAll('#clients .clm-s')].map(x => x.textContent.trim()));
  const mal = secs.map((t, i) => t === esperat[i] ? null : `${TOTS[i].n}: «${t}»`).filter(Boolean);
  ok(secs.length === esperat.length && !mal.length,
    'en castellà es tradueixen totes les línies de sector'
    + (mal.length ? ' — ' + mal.length + ' no: ' + mal.slice(0, 3).join(', ') : ''));
  await ctx.close();
}

console.log('\n6 · El que ja hi havia segueix sent-hi');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const hero = document.querySelector('.hero');
    return {
      /* Les tres veus van passar del hero a «El repte», i el repte sencer ha
         passat a `/SOS/`, que és on viu l'eina que el resol. El que ha de ser
         cert no és on viuen —això canvia— sinó que **no s'hagin perdut pel
         camí**, que és el que passa sempre quan una cosa es mou de pàgina.
         Es comprova a la pàgina on són ara, no aquí. */
      dolor: document.querySelectorAll('#enfoc .repte-veus li').length,
      /* I el que el hero diu ara al seu lloc: d'on ve la casa. Sense els dos
         noms i el recorregut entre ells, «flux de valor» és una promesa com
         qualsevol altra i el motiu per triar aquesta consultoria no surt fins
         a la vuitena pantalla. */
      evo: hero.querySelectorAll('.hero-evo li').length,
      llinatge: /TeamTowers Humà/.test(hero.textContent) && /2005/.test(hero.textContent),
      flux: /flux de valor/i.test(hero.textContent),
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
  ok(r.dolor === 0, 'el repte ja no és a la portada: ha marxat a /SOS/, on és l\'eina que el resol');
  ok(r.evo === 3, 'el hero explica d\'on ve la casa en tres passos');
  ok(r.llinatge, 'i nomena les dues cases i l\'any: TeamTowers → TeamTowers Humà');
  ok(r.flux, 'i diu què es mesura, que és el que es contracta');
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
  /* UNA SOLA JERARQUIA: el producte primer, i d'on ve, a sota.
     `fentpinya` obria la pàgina i ara va al pis de la història, just abans de
     «D'on ve això». No és una degradació: obrint, els castells es llegien com
     la marca —comprar una trajectòria— i el producte no sortia fins a la
     quarta pantalla.

     Ara obren `dues-vistes` (el mateix cas mirat de dues maneres), `rengles`
     (com es llegeix una pinya) i `rols` (el vocabulari), i els castells són la
     prova del mètode i no el mètode. `mapaval` ja no existeix com a secció:
     és la primera pestanya de `dues-vistes`. */
  /* `beneficis` ha marxat a /sos/ sencer, i `aprenent` i `sos` s'hi han quedat
     com a ponts: el que ajuda a decidir una compra es queda a la portada i el
     que ajuda a fer servir el model viu a l'app. Els dos ponts segueixen a
     l'espina perquè el camí cap al SOS no es pugui perdre —això ho vigila
     `check-landing.js` regla 7d—, però ja no són seccions de contingut. */
  /* ⚠ **L'espina de l'endreça** (04/10/2026): set blocs i no catorze. L'ordre
     és la proposta de valor —el problema, el producte, per a què serveix, com
     es fa, on anar després, i la prova al final— i el que marxa té la seva
     pàgina. La llista vella es queda escrita a sota perquè es vegi què se'n
     va i on, que és el que una llista esborrada no diu. */
  const ESPINA = ['enfoc', 'dues-vistes', 'decideix', 'com', 'camins', 'clients'];
  /* On ha anat cada un dels que hi havia:
       rengles, rols, fentpinya, xarxa  → /SOS/vna.html   (el mètode)
       glossari, aprenent, cataleg, cost → cataleg.html    (la compra)
       relat, trajectoria, objeccions   → qui-som.html    (la confiança)
       sos                              → SOS/intro.html  (la porta del SOS) */
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
  const { ctx, p } = await nova(1280, 900, CAT);
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
  /* Sense forquilles (09/10/2026, decidit per l'Àlvar): cap paquet porta xifra
     en euros, i tots diuen com es calcula —per fluxos o amb el mapa de cost—
     i porten al mètode. Una xifra que hi tornés sola seria un preu publicat
     que ningú ha decidit. */
  const ambXifra = await p.evaluate(() => [...document.querySelectorAll('.paquet')]
    .filter(a => /\d\s*€/.test((a.querySelector('.pk-preu strong') || {}).textContent || '')).map(a => a.id));
  ok(!ambXifra.length, 'cap paquet porta forquilla en euros' + (ambXifra.length ? ' — ' + ambXifra.join(', ') : ''));
  ok(r.paquets.every(x => /mapa de cost|per fluxos/i.test(x.font)) && r.paquets.every(x => x.capACost === '#cost'),
    'i tots diuen com es calcula (per fluxos o amb el mapa de cost) i hi porten');

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
    /* ⚠ **La banda del SOS se'n va a `SOS/intro.html`** (04/10/2026). A la
       portada queda el pont, a «els tres camins», i és allà on ha de dir què
       s'hi troba: que l'eina existeix encara que no ens contractin. */
    const sos = document.querySelector('.cami[href*="intro"]');
    return {
      txtSos: sos ? sos.textContent.replace(/\s+/g, ' ') : '',
      lliure: sos ? /gratu|lliure|no ens contractis/i.test(sos.textContent) : false,
      cos: document.body.textContent.replace(/\s+/g, ' ')
    };
  });
  /* Els tres paquets del SOS s'han mogut a `/sos/`, que és on es decideixen: es
     contracten quan algú ja és a dins de l'eina i no quan compara consultories.
     La regla no canvia de lloc perquè el paquet sí —el que no està construït
     s'ha de seguir dient—, i per això es comprova allà on ara viu. */
  const p2 = await ctx.newPage();
  await p2.goto(APP.replace(/index\.html$/, 'SOS/index.html'));
  const c = await p2.evaluate(() => {
    const pq = [...document.querySelectorAll('.ob-pq .pq')]
      .find(x => /contractes/i.test(x.textContent));
    return pq ? pq.textContent.replace(/\s+/g, ' ') : '';
  });
  await p2.close();
  ok(/estudi de viabilitat/i.test(c),
    'els contractes intel·ligents es venen com a estudi, no com a eina');
  ok(/encara no|no est(à|an) constru/i.test(c),
    'i es diu obertament que encara no estan construïts');
  ok(r.lliure, 'el camí cap al SOS diu que l\'eina funciona sense contractar res');
  ok(!/qu[àa]ntic/i.test(r.cos), 'i no es promet res de seguretat quàntica, que no existeix aquí');
  /* La guia de marca prohibeix aquestes: no diuen res i sonen a fullet. */
  const prohibides = ['disruptiu', 'disruptiva', 'solucions innovadores', 'ecosistema disruptiu'];
  const dites = prohibides.filter(w => new RegExp(w, 'i').test(r.cos));
  ok(!dites.length, 'cap paraula de fullet' + (dites.length ? ': ' + dites.join(', ') : ''));
  await ctx.close();
}

console.log('\n9 · Les dues portes porten a dos llocs diferents de debò');
/* **Tres portes, i cadascuna ha de canviar el que es veu.**

   Una porta que baixa al catàleg sense filtrar no peta ni es nota —l'àncora
   funciona igual— i deixa qui hi entra davant de vint-i-un paquets, la meitat
   dels quals no són per a ell. Ja va passar: el codi enganxava el filtre a
   `.hero-portes a[data-sec]` i les portes noves del repte queien fora del
   selector.

   I la trampa d'ara, que és nova: `data-sector` ha passat a ser **una
   llista**. Comparant la cadena sencera, «admin tercer» no és ni «admin» ni
   «tercer» i el paquet desapareix de les dues portes alhora — amb la fitxa
   correcta i la pàgina sencera funcionant. Per això es comprova que cada
   llista visible **contingui** el sector demanat, i que els paquets de dos
   compradors surtin a les dues portes. */
{
  const { ctx, p } = await nova();
  const SECS = ['admin', 'tercer', 'empresa'];
  /* ⚠ **Les portes i el filtre viuen a dues pàgines** (04/10/2026): les portes a
     la portada, el filtre a `cataleg.html`. La porta ja no filtra al moment:
     **navega amb el sector a l'adreça** (`/cataleg?s=admin`) i el catàleg
     l'aplica en carregar. Si el sector es perdés pel camí, qui ve d'una porta
     aterraria davant dels vint-i-un paquets i no petaria res — que és
     exactament el que les tres portes venen a evitar. */
  const r = await p.evaluate(() => {
    const q = s => [...document.querySelectorAll(s)];
    const bandes = q('.banda');
    const href = el => el ? el.getAttribute('href') : '';
    return {
      bandes: bandes.length,
      files: bandes.map(x => x.querySelectorAll('.banda-dl dt').length),
      secBandes: bandes.map(x => x.dataset.sec),
      repte: (document.querySelector('#enfoc') || {}).innerText || '',
      destins: q('[data-sec]').filter(x => x.tagName === 'A')
        .map(x => [x.dataset.sec, href(x)])
    };
  });
  /* I el que compta: que arribar-hi per aquella adreça canviï el que es veu. */
  const per = {}; let tot = 0, dobles = 0;
  {
    const p2 = await ctx.newPage();
    await p2.goto(CAT);
    await p2.waitForTimeout(150);
    const base = await p2.evaluate(() => ({
      tot: [...document.querySelectorAll('.paquet')].filter(x => !x.hidden).length,
      dobles: [...document.querySelectorAll('.paquet[data-sector]')]
        .filter(x => x.dataset.sector.split(' ').length > 1).length }));
    tot = base.tot; dobles = base.dobles;
    for (const sec of SECS) {
      await p2.goto(CAT + '?s=' + sec);
      await p2.waitForTimeout(150);
      per[sec] = await p2.evaluate(() => [...document.querySelectorAll('.paquet')]
        .filter(x => !x.hidden).map(x => x.dataset.sector.split(' ')));
    }
    await p2.close();
  }
  Object.assign(r, { tot, per, dobles, heroAdmin: per.admin.length });
  ok(r.bandes === 3, `el repte ensenya les ${r.bandes} bandes del mateix patró, una per sector`);
  ok(SECS.every(s => r.secBandes.includes(s)),
    'i cada banda diu de quin sector és, que és el que li dona el color');
  ok(r.files.every(n => n === 3),
    'i totes tres responen les mateixes tres preguntes: qui ho sosté, què no es veu, què passa quan marxen');
  ok(/empresa|cooperativa/i.test(r.repte) && /ajuntament|regidor|plec|mandat/i.test(r.repte)
    && /entitat|voluntàri|veïn|junta/i.test(r.repte),
    'el text del repte anomena els tres mons, no un ni dos');
  ok(/mateix objectiu/i.test(r.repte) && /fluxos de valor/i.test(r.repte),
    'i diu l\'objectiu compartit i com es mesura');
  SECS.forEach(s => {
    const v = r.per[s] || [];
    ok(v.length > 0 && v.length < r.tot && v.every(l => l.includes(s)),
      `la porta «${s}» filtra de debò: ${v.length} paquets de ${r.tot}, tots seus`);
  });
  const llistes = SECS.map(s => (r.per[s] || []).map(l => l.join('+')).join(','));
  ok(new Set(llistes).size === SECS.length,
    'i les tres portes donen tres llistes diferents, que és el que vol dir filtrar');
  ok(r.dobles > 0, `${r.dobles} paquets tenen més d'un comprador declarat, que és el motiu de la llista`);
  /* I que totes les portes —hero i repte— portin el sector a l'adreça. Una
     sola que se'l deixés obriria el catàleg sencer i no ho veuria ningú. */
  const sensS = r.destins.filter(([sec, h]) => sec !== 'tot' && !new RegExp('[?&]s=' + sec).test(h || ''));
  ok(!sensS.length, `les ${r.destins.length} portes porten el seu sector a l'adreça`
    + (sensS.length ? ' — sense: ' + sensS.map(x => x[0] + ' → ' + x[1]).join(', ') : ''));
  await ctx.close();
}

console.log('\n10 · I les objeccions cobreixen els tres sectors, a qui-som');
/* ⚠ **Mudades a `qui-som.html`** (04/10/2026): les preguntes que es fan abans
   de contractar van amb el perfil i la trajectòria, que és on algú va a
   decidir si es fia. */
{
  const { ctx, p } = await nova(1280, 900, QS);
  /* `textContent` i no `innerText`: un `<details>` tancat no té text visible,
     i llegint-lo amb `innerText` només arriben els titulars. La resposta és
     justament on viu el vocabulari de cada sector. */
  const r = await p.evaluate(() => [...document.querySelectorAll('.faq-item')]
    .map(d => d.textContent.replace(/\s+/g, ' ')));
  const pub = r.filter(t => /ajuntament|municipal|veïn|entitat|administració/i.test(t)).length;
  const pri = r.filter(t => /empresa|cooperativa|direcció de persones|organigrama/i.test(t)).length;
  ok(pub > 0, `${pub} objeccions parlen al sector públic`);
  ok(pri > 0, `i ${pri} a una empresa: qui ve d'aquella porta en troba alguna que és la seva`);
  /* La incòmoda. Un mapa de valor honest ensenya qui sosté què dins d'una
     organització amb jerarquia, i qui el compra té gent a càrrec. Que la
     pàgina digui què no és —i que no és material per acomiadar— ha de ser
     explícit: si desapareix, la venda es fa sense dir-ho. */
  ok(r.some(t => /no és una avaluació de rendiment|no es una evaluación de desempeño/i.test(t)),
    'i es diu que el mapa no és una avaluació de rendiment');
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
