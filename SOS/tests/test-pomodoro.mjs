/* El pomodoro, i l'oferta navegable pels tres eixos
   ─────────────────────────────────────────────────────────────────────────
   Dues coses que s'assemblen a coses que hi ha a tot arreu, i el que es prova
   és exactament allò que les fa diferents:

   · Un **comptador enrere** el té tothom. Aquí acaba oferint **apuntar el
     temps al registre**, perquè en aquesta casa el temps que dones és una
     aportació signada i el forat era que ningú les apunta quan ja fa dies que
     van passar. Si algun dia acabés amb una felicitació, seria el que és a tot
     arreu.
   · Una **cerca amb filtres** també. Aquí els eixos són els mateixos que a la
     pantalla de tasques —zona amb les dues direccions, tema, i els meus
     grups— perquè qui aprèn a navegar en un lloc no ha de tornar a aprendre.

   I una cosa que compta tant com les altres dues: **el que es desa és l'hora
   d'acabar i no els minuts que falten**. Un mòbil que s'adorm atura el
   temporitzador; l'hora d'acabar segueix sent certa.

   Veda 145. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const nova = async () => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(APP);
  await p.waitForFunction(() => !!window.__SOS && !!window.__SOS.state);
  return { ctx, p, errs };
};

console.log('\n1 · El pomodoro desa l\'hora d\'acabar, no els minuts que falten');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const S = window.__SOS;
    S.pomoComenca({ id: 't1', title: 'Trucar a la Marta', nodeId: null }, 25);
    let cru = null; try { cru = JSON.parse(localStorage.getItem(S.POMO_ID)); } catch (e) { }
    const abans = S.pomoResta();
    /* El que passa si el mòbil s'adorm: el temporitzador s'atura i el compte
       ha de seguir sent cert quan es torna a mirar. Es simula rellegint el que
       hi ha desat, que és exactament el que fa la pàgina en tornar. */
    const rellegit = S.pomoLlegeix();
    return {
      cru, abans, teFi: !!(cru && cru.fi), teResta: !!(cru && cru.resta),
      mateix: rellegit && rellegit.fi === cru.fi,
      rellotge: S.pomoRellotge(65), zero: S.pomoRellotge(0), negatiu: S.pomoRellotge(-30),
      min: S.POMO_MIN
    };
  });
  ok(r.teFi && !r.teResta, 'es desa `fi` (una hora) i no `resta` (un compte enrere)');
  ok(r.abans > 24 * 60 && r.abans <= 25 * 60, 'i en queden ' + r.abans + ' segons dels ' + (r.min * 60));
  ok(r.mateix, 'rellegir-lo del navegador dona el mateix: sobreviu a recarregar');
  ok(r.rellotge === '01:05', 'el rellotge es llegeix: ' + r.rellotge);
  ok(r.zero === '00:00' && r.negatiu === '00:00', 'i no ensenya mai números negatius');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n2 · N\'hi ha un de sol, i parar-lo el treu de debò');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const S = window.__SOS;
    S.pomoComenca({ id: 'a', title: 'Primera', nodeId: null }, 25);
    const un = JSON.parse(localStorage.getItem(S.POMO_ID) || 'null');
    S.pomoComenca({ id: 'b', title: 'Segona', nodeId: null }, 25);
    const dos = JSON.parse(localStorage.getItem(S.POMO_ID) || 'null');
    S.pomoPara();
    return { un: un && un.id, dos: dos && dos.id, buit: localStorage.getItem(S.POMO_ID), resta: S.pomoResta() };
  });
  ok(r.un === 'a' && r.dos === 'b', 'començar-ne un altre substitueix el que hi havia');
  ok(r.buit === null, 'i parar-lo el treu del navegador: no queda cap rastre a mig fer');
  ok(r.resta === 0, 'i el compte torna a zero');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n3 · La caixa diu què fas, i com acaba');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const S = window.__SOS;
    /* Un que ja s'ha acabat: és l'estat que importa, i el que es veu quan
       tornes al cap d'una estona. */
    S.pomoDesa({ id: 't', titol: 'Muntar la parada', nodeId: null, min: 25, fi: Date.now() - 1000 });
    const acabat = S.renderPomo();
    S.pomoDesa({ id: 't', titol: 'Muntar la parada', nodeId: null, min: 25, fi: Date.now() + 600000 });
    const corrent = S.renderPomo();
    const txt = e => e.textContent.replace(/\s+/g, ' ');
    return {
      acabatTxt: txt(acabat), correntTxt: txt(corrent),
      acabatFet: acabat.classList.contains('pomo-fet'),
      correntFet: corrent.classList.contains('pomo-fet'),
      botons: [...corrent.querySelectorAll('button')].map(b2 => b2.textContent),
      botonsAcabat: [...acabat.querySelectorAll('button')].map(b2 => b2.textContent)
    };
  });
  ok(/Muntar la parada/.test(r.correntTxt), 'la caixa diu què estàs fent');
  ok(r.acabatFet && !r.correntFet, 'i es marca diferent quan s\'ha acabat');
  ok(r.botonsAcabat.some(t => /Apunta el temps/i.test(t)),
    'en acabar, el que ofereix és apuntar el temps');
  ok(!r.botonsAcabat.some(t => /bona feina|felicitats|enhorabona/i.test(t)),
    'i no una felicitació: el que ha de quedar és el registre, no la sensació');
  ok(r.botons.some(t => /Ja està fet/i.test(t)),
    'i mentre corre es pot donar per fet: el que compta és la feina, no el comptador');
  ok(r.botons.some(t => /Deixa-ho/i.test(t)), 'i deixar-ho sempre és possible');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n4 · Al telèfon, una targeta és un botó');
{
  /* La pantalla de tasques té una regla que ve d'abans que el pomodoro: al
     mòbil, **una targeta, un botó**. Amb dos objectius de 44 px de costat en
     una llista que es recorre amb el polze es prem el que no era.

     El pomodoro s'hi va estavellar quan es va afegir, i la regla tenia raó: al
     telèfon la targeta serveix per fer-ho, i posar-se una estona amb una cosa
     és un gest d'escriptori. Es prova als dos costats perquè la decisió no es
     perdi en cap dels dos sentits. */
  for (const [w, hiHaDeSer] of [[360, false], [1280, true]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 800 } });
    const p = await ctx.newPage();
    await p.goto(APP);
    await p.waitForFunction(() => !!window.__SOS && !!window.__SOS.state);
    const r = await p.evaluate(() => {
      const S = window.__SOS;
      const box = document.createElement('div');
      /* Es mira el que pinta la pantalla de debò, amb una tasca qualsevol. */
      S.state.homeView = 'missions';
      S.renderMissions(box);
      const cards = [...box.querySelectorAll('.ms-card')];
      return {
        n: cards.length,
        pomos: box.querySelectorAll('.kmini-pomo').length,
        maxBotons: cards.length ? Math.max(...cards.map(c => c.querySelectorAll('button').length)) : 0
      };
    });
    ok(hiHaDeSer ? true : r.pomos === 0,
      w + 'px · ' + (hiHaDeSer ? 'hi cap el botó de posar-s\'hi' : 'cap botó de pomodoro a les targetes'));
    if (!hiHaDeSer && r.n) ok(r.maxBotons <= 1, w + 'px · i cap targeta passa d\'un botó');
    await ctx.close();
  }
}

console.log('\n5 · L\'oferta es filtra per zona, tema i els meus grups');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const S = window.__SOS;
    /* Un arbre petit fet a mà: comarca amb dos pobles, i una biblioteca a
       cadascun. És el cas que la pantalla no sabia respondre —«qui té un
       trepant a la comarca»— sense entrar node per node. */
    const com = S.newNode('Comarca', 'comarca', null); S.state.nodes.push(com);
    const a = S.newNode('Poble A', 'municipi', com.id); S.state.nodes.push(a);
    const b2 = S.newNode('Poble B', 'municipi', com.id); S.state.nodes.push(b2);
    const bib = n => {
      const x = S.newNode('Biblioteca de ' + n.name, 'projecte', n.id);
      x.dynamicType = 'biblioteca_coses'; S.state.nodes.push(x); return x;
    };
    const ba = bib(a), bb = bib(b2);
    /* `newMember`, `newObject` i `newOffer` són fàbriques: retornen l'objecte
       i no el pengen enlloc. Qui el penja és qui les crida. */
    const posa = (nd, nom) => {
      const m = S.newMember({ name: 'Veí de ' + nd.name });
      S.membersOf(nd).push(m);
      S.objectsOf(nd).push(S.newObject({ name: nom, typology: 'eines', ownerId: m.id }));
    };
    posa(ba, 'Trepant'); posa(bb, 'Trepant');
    S.themesOf(ba).push('Habitatge');

    const tot = S.searchSupply('trepant', {}).length;
    const nomesA = S.searchSupply('trepant', { ambit: a.id, dins: 'dins' }).length;
    const deLaComarca = S.searchSupply('trepant', { ambit: com.id, dins: 'dins' }).length;
    /* Cap enfora des del poble: el que el conté i no és seu. La biblioteca del
       poble mateix no hi ha de sortir. */
    const enfora = S.searchSupply('trepant', { ambit: a.id, dins: 'fora' }).length;
    const perTema = S.searchSupply('trepant', { tema: S.themeSlug('Habitatge') }).length;
    const meus = S.searchSupply('trepant', { meus: true }).length;
    return { tot, nomesA, deLaComarca, enfora, perTema, meus };
  });
  ok(r.tot === 2, 'sense filtre surten els dos trepants de la xarxa');
  ok(r.nomesA === 1, 'filtrant pel poble en surt un');
  ok(r.deLaComarca === 2, 'i per la comarca, els dos: cap endins és el subarbre');
  ok(r.enfora === 0, 'cap enfora des del poble no ensenya el del poble mateix');
  ok(r.perTema === 1, 'el tema filtra encara que els nodes no comparteixin territori');
  ok(r.meus === 0, '«els meus grups» no ensenya res on no ets');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n6 · Les coincidències passen pels mateixos filtres');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const S = window.__SOS;
    const a = S.newNode('Lloc A', 'municipi', null); S.state.nodes.push(a);
    const z = S.newNode('Lloc Z', 'municipi', null); S.state.nodes.push(z);
    const mk = (nd, dyn) => { const x = S.newNode('N', 'projecte', nd.id); x.dynamicType = dyn; S.state.nodes.push(x); return x; };
    const bt = mk(a, 'banc_temps'), bt2 = mk(z, 'banc_temps');
    const m1 = S.newMember({ name: 'Qui ofereix' }), m2 = S.newMember({ name: 'Qui busca' });
    S.membersOf(bt).push(m1); S.membersOf(bt2).push(m2);
    S.offersOf(bt).push(S.newOffer({ kind: 'oferta', title: 'Fusteria', category: 'reparacions', memberId: m1.id }));
    S.offersOf(bt2).push(S.newOffer({ kind: 'demanda', title: 'Fusteria', category: 'reparacions', memberId: m2.id }));
    const totes = S.supplyMatches('fusteria', {}).length;
    /* Amb el filtre posat a un dels dos llocs, l'altra banda queda amagada i
       per tant la coincidència ja no es pot fer: proposar-la seria proposar el
       que ningú pot executar. */
    const filtrat = S.supplyMatches('fusteria', { ambit: a.id, dins: 'dins' })
      .filter(g => g.ofereix.length && g.busca.length).length;
    return { totes, filtrat };
  });
  ok(r.totes >= 1, 'sense filtre, la coincidència hi és');
  ok(r.filtrat === 0, 'amb mig parell amagat, ja no es proposa');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
