import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
/* La ruta surt d'on és aquest fitxer, no d'una ruta absoluta d'una màquina
   concreta: així els tests corren a qualsevol clon del repositori. */
const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
const results = {};
const ok = (k, v, x) => { results[k] = !!v; console.log((v ? '✅' : '❌') + ' ' + k + (x ? ' — ' + x : '')); };
/* El navegador el resol Playwright. `SOS_CHROMIUM` només cal si el tens en un
   lloc no estàndard (com a l'entorn de desenvolupament d'on surten aquests
   tests): sense la variable, funciona a qualsevol màquina amb `playwright
   install chromium` fet. */
const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
async function open(opts) {
  const ctx = await b.newContext(opts || {});
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(APP); await p.waitForFunction(() => window.__SOS, null, { timeout: 20000 });
  try { await p.waitForSelector('#obSkip', { timeout: 3000 }); await p.click('#obSkip'); } catch (e) {}
  await p.waitForTimeout(400);
  await p.evaluate(() => { try { window.__SOS.markOnboardingDone(); } catch (e) {} document.querySelectorAll('.modal-bg').forEach(m => m.remove()); });
  return { ctx, p, errs };
}

/* La Rut és sòcia d'una biblioteca i d'un banc de temps. Té un trepant d'algú
   altre a casa des de fa massa, algú vol registrar hores al seu nom, i al banc
   hi ha una oferta i una demanda que no s'han trobat. */
const SETUP = `
  const S=window.__SOS;
  const muni={id:'MAN',name:'Manresa',nodeLevel:'municipi',parentId:null,dynamicType:'',
    metaskill:{},vna:{roles:[],exchanges:[]},kanban:{cards:[]},ledger:[],members:[],objects:[],offers:[],
    createdAt:'',updatedAt:''};
  S.state.nodes.push(muni);
  const mk=(id,name,dyn)=>{const n={id,name,nodeLevel:'projecte',parentId:'MAN',dynamicType:dyn,
    metaskill:{},vna:{roles:[],exchanges:[]},kanban:{cards:[]},ledger:[],members:[],objects:[],offers:[],
    createdAt:'',updatedAt:''};S.state.nodes.push(n);return n;};
  const bib=mk('BIB','Biblioteca del barri','biblioteca_coses');
  const bt=mk('BT','Banc de temps','banc_temps');
  const rutB=S.newMember({name:'Rut Camps',kind:'persona'}); bib.members.push(rutB);
  const rutT=S.newMember({name:'Rut Camps',kind:'persona'}); bt.members.push(rutT);
  const eva=S.newMember({name:'Eva Roure',kind:'persona'}); bt.members.push(eva);
  const jan=S.newMember({name:'Jan Bosc',kind:'persona'}); bt.members.push(jan);
  // un objecte que la Rut té a casa i que ja hauria d'haver tornat
  const tr=S.newObject({name:'Trepant',typology:'bricolatge',ownerId:eva.id});
  tr.status='prestat'; tr.borrowerId=rutB.id; tr.since=new Date(Date.now()-20*864e5).toISOString();
  tr.dueDate=new Date(Date.now()-6*864e5).toISOString().slice(0,10);
  bib.objects.push(tr);
  // una oferta i una demanda de la mateixa cosa
  bt.offers.push(S.newOffer({kind:'oferta',title:'Faig classes de guitarra',category:'idiomes',memberId:eva.id}));
  bt.offers.push(S.newOffer({kind:'demanda',title:'Busco qui em faci classes',category:'idiomes',memberId:jan.id}));
  S.state.activeId=null; S.state.homeView='missions';
  window.__T={muni,bib,bt,rutB,rutT,eva,jan,tr};
`;

// ═══ 1. Sense perfil, la llista no fingeix ═══
{
  const { ctx, p, errs } = await open();
  await p.evaluate(async (setup) => { eval(setup); window.__SOS.render(); }, SETUP);
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => ({
    txt: document.querySelector('#workspace').innerText,
    cards: document.querySelectorAll('.ms-card').length
  }));
  ok('noProfileNoMissions', r.cards === 0, r.cards + ' targetes');
  ok('itAsksForAProfileFirst', /fes-te el perfil/i.test(r.txt), 'demana el perfil, no llista deures buits');
  ok('noErrors1', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 2. Amb perfil, cada missió diu QUÈ passarà si la fas ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS;
    await S.setActivePersona('Rut Camps');
    const ms = S.missions();
    return { n: ms.length, kinds: [...new Set(ms.map(m => m.kind))],
      allHaveEffect: ms.every(m => (m.effect || '').length > 10),
      allHaveAction: ms.every(m => typeof m.act === 'function'),
      allHaveTime: ms.every(m => m.mins > 0),
      titles: ms.map(m => m.kind + ': ' + m.title) };
  }, SETUP);
  ok('missionsAppear', r.n >= 3, r.n + ' missions: ' + r.kinds.join(', '));
  ok('everyMissionSaysWhatHappens', r.allHaveEffect, 'sense això seria una llista de deures');
  ok('everyMissionIsOneClick', r.allHaveAction, 'cada missió porta la seva acció');
  ok('everyMissionSaysHowLong', r.allHaveTime, 'i quant costa');
  ok('lateLoanIsAMission', r.titles.some(t => /^retorn: Torna «Trepant»/.test(t)), r.titles.find(t => /retorn/.test(t)) || '');
  ok('matchIsAMission', r.titles.some(t => /^coincidencia/.test(t)), r.titles.find(t => /coincidencia/.test(t)) || '');
  ok('noErrors2', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 3. L'ordre: primer qui espera algú, no el teu progrés ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { bt, rutT, eva } = window.__T;
    await S.setActivePersona('Rut Camps');
    const id = await S.getIdentity(); rutT.did = id.did;
    await S.claimMember(bt, rutT);
    // l'Eva vol registrar hores al nom de la Rut
    await S.submitEntry(bt, { id: 'E1', who: 'Eva Roure', what: 'Guitarra', type: 'temps', value: 2,
      memberId: eva.id, counterpartId: rutT.id, ts: new Date().toISOString() }, eva.id);
    const ms = S.missions();
    return { first: ms[0] && ms[0].kind, order: ms.map(m => m.kind),
      urgs: ms.map(m => m.urg), sorted: ms.every((m, i) => !i || m.urg >= ms[i - 1].urg),
      firstEffect: ms[0] && ms[0].effect, who: ms[0] && ms[0].who };
  }, SETUP);
  ok('whoWaitsComesFirst', r.first === 'vistiplau', 'primer: ' + r.first + ' · ordre ' + r.order.join(' → '));
  ok('orderIsByWhoIsBlocked', r.sorted, 'urgències ' + r.urgs.join(','));
  ok('itSaysNothingCountsUntilYouAnswer', /no compta per a ningú/i.test(r.firstEffect || ''), r.firstEffect);
  ok('itSaysWhoIsWaiting', /eva/i.test(r.who || ''), 'ho demana ' + r.who);
  ok('noErrors3', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 4. La pantalla: una llista, un botó per missió, res per configurar ═══
{
  const { ctx, p, errs } = await open({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
  await p.evaluate(async (setup) => {
    eval(setup);
    await window.__SOS.setActivePersona('Rut Camps');
    window.__SOS.render();
  }, SETUP);
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const cards = [...document.querySelectorAll('.ms-card')];
    return { n: cards.length,
      oneButtonEach: cards.every(c => c.querySelectorAll('button').length === 1),
      bigTargets: cards.every(c => c.querySelector('button').getBoundingClientRect().height >= 44),
      hasGroups: document.querySelectorAll('#workspace .ent-grp-lbl').length,
      noTree: !document.querySelector('#workspace .tabs'),
      txt: document.querySelector('#workspace').innerText,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
  ok('everyMissionIsACard', r.n >= 3, r.n + ' targetes');
  ok('oneButtonPerMission', r.oneButtonEach, 'una acció i prou per targeta');
  ok('tapTargetsAreBigEnough', r.bigTargets, 'botons de 44 px o més, per a un polze');
  ok('missionsAreGrouped', r.hasGroups >= 2, r.hasGroups + ' grups («Algú t\'espera», «El teu següent pas»…)');
  ok('noTabsInMissions', r.noTree, 'ni pestanyes ni arbre: no és la vista de gestió');
  ok('itSaysWhatThisScreenIsNotFor', /no et deixa configurar res/i.test(r.txt), 'ho diu explícitament');
  ok('noOverflowOnAPhone', r.overflow <= 0, r.overflow + ' px');
  ok('noErrors4', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 5. Fer-ho porta on toca, i les dues vistes es distingeixen ═══
{
  const { ctx, p, errs } = await open();
  await p.evaluate(async (setup) => {
    eval(setup);
    await window.__SOS.setActivePersona('Rut Camps');
    window.__SOS.render();
  }, SETUP);
  await p.waitForTimeout(400);
  const jumped = await p.evaluate(async () => {
    document.querySelector('.ms-card .ms-go').click();
    await new Promise(r => setTimeout(r, 600));
    return { tab: window.__SOS.state.tab, node: window.__SOS.state.activeId,
      modal: !!document.querySelector('.modal') };
  });
  ok('doingItTakesYouThere', jumped.tab === 'biblioteca' || jumped.modal,
    'va a ' + (jumped.modal ? 'la pantalla que toca' : jumped.node + '/' + jumped.tab));
  const back = await p.evaluate(async () => {
    const S = window.__SOS;
    S.state.activeId = null; S.state.homeView = 'missions'; S.render();
    await new Promise(r => setTimeout(r, 300));
    const toGest = [...document.querySelectorAll('#workspace button')].find(b => /gestió/i.test(b.innerText));
    toGest.click();
    await new Promise(r => setTimeout(r, 400));
    const dash = document.querySelector('#workspace').innerText;
    /* La pantalla es diu «les meves tasques» d'ençà que les vuit safates són
       una de sola; abans es deia «missions». El que ha de ser cert és que hi
       hagi camí de tornada, no com es digui el botó. */
    const toMis = [...document.querySelectorAll('#workspace button')].find(b => /tasques|missions/i.test(b.innerText));
    return { view: S.state.homeView, isDashboard: /tauler/i.test(dash), backBtn: !!toMis };
  });
  ok('youCanSwitchToManagement', back.view === 'tauler' && back.isDashboard, 'la vista de gestió és a un clic');
  ok('andBackToMissions', back.backBtn, 'i el camí de tornada també');
  ok('noErrors5', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 6. És enllaçable: #/missions ═══
{
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(APP + '#/missions');
  await p.waitForFunction(() => window.__SOS, null, { timeout: 20000 });
  await p.waitForTimeout(700);
  await p.evaluate(() => { try { window.__SOS.markOnboardingDone(); } catch (e) {} });
  const r = await p.evaluate(() => ({ view: window.__SOS.state.homeView, kind: window.__SOS.parseRoute('#/missions').kind }));
  ok('missionsRouteParses', r.kind === 'missions', 'kind=' + r.kind);
  ok('openingTheLinkLandsThere', r.view === 'missions', 'homeView=' + r.view);
  const written = await p.evaluate(async () => {
    const S = window.__SOS;
    S.state.activeId = null; S.state.homeView = 'missions'; S.render();
    await new Promise(r => setTimeout(r, 300));
    return location.hash;
  });
  ok('theUrlSaysWhereYouAre', written === '#/missions', written);
  ok('noErrors6', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 7. Sempre hi ha un següent pas: la llista no es queda muda ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async () => {
    const S = window.__SOS;
    const nd = { id: 'X', name: 'Node', nodeLevel: 'projecte', parentId: null, dynamicType: 'banc_temps',
      metaskill: {}, vna: { roles: [], exchanges: [] }, kanban: { cards: [] }, ledger: [], members: [], objects: [], offers: [], createdAt: '', updatedAt: '' };
    S.state.nodes.push(nd);
    await S.setActivePersona('Ningú Coneix');
    S.state.activeId = null; S.state.homeView = 'missions'; S.render();
    await new Promise(r => setTimeout(r, 300));
    const ms = S.missions();
    return { n: ms.length, kinds: ms.map(m => m.kind),
      urgent: ms.filter(m => m.urg <= 2).length,
      txt: document.querySelector('#workspace').innerText,
      cards: document.querySelectorAll('.ms-card').length };
  });
  /* Algú acabat d'arribar no té ningú esperant-lo ni res encallat, però tampoc
     es queda davant d'una pantalla muda: el seu camí i els seus reptes ja són
     missions. Que la llista mai sigui buida per a qui té perfil és la garantia
     que fa que la portada valgui la pena. */
  ok('nobodyIsWaitingOnANewcomer', r.urgent === 0, 'cap missió urgent, com toca');
  ok('butThereIsAlwaysANextStep', r.n >= 2 && r.cards === r.n, r.n + ' missions: ' + r.kinds.join(', '));
  ok('theyAreThePathAndTheChallenges', r.kinds.includes('cami') && r.kinds.includes('repte'),
    'el recorregut i els reptes del nivell');
  ok('spellingIsRight', !/Et acosta/.test(r.txt), 'diu «t\'acosta», no «et acosta»');
  ok('noErrors7', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

await b.close();
const failed = Object.entries(results).filter(([, v]) => !v).map(([k]) => k);
console.log('\n' + (failed.length ? '❌ FAILED (' + failed.length + '): ' + failed.join(', ') : '✅ ALL PASSED (' + Object.keys(results).length + ')'));
process.exit(failed.length ? 1 : 0);
