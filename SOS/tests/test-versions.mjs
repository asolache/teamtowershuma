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
async function open() {
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(APP); await p.waitForFunction(() => window.__SOS, null, { timeout: 20000 });
  try { await p.waitForSelector('#obSkip', { timeout: 3000 }); await p.click('#obSkip'); } catch (e) {}
  await p.waitForTimeout(400);
  await p.evaluate(() => { try { window.__SOS.markOnboardingDone(); } catch (e) {} document.querySelectorAll('.modal-bg').forEach(m => m.remove()); });
  return { ctx, p, errs };
}

const SETUP = `
  const S=window.__SOS;
  const muni={id:'MAN',name:'Manresa',nodeLevel:'municipi',parentId:null,dynamicType:'',
    metaskill:{},vna:{roles:[],exchanges:[]},kanban:{cards:[]},ledger:[],members:[],objects:[],offers:[],
    lat:41.72,lon:1.82,createdAt:'',updatedAt:''};
  S.state.nodes.push(muni);
  const bt={id:'BT',name:'Banc de temps',nodeLevel:'projecte',parentId:'MAN',dynamicType:'banc_temps',
    metaskill:{},vna:{roles:[],exchanges:[]},kanban:{cards:[]},ledger:[],members:[],objects:[],offers:[],
    createdAt:'',updatedAt:''};
  S.state.nodes.push(bt);
  const ada=S.newMember({name:'Ada Pons',kind:'persona'}); bt.members.push(ada);
  bt.offers.push(S.newOffer({kind:'oferta',title:'Fusteria',category:'reparacions',memberId:ada.id}));
  S.state.activeId='BT';
  window.__T={muni,bt,ada};
`;

// ═══ 1. Una versió és un canvi de contingut, no del rellotge ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { bt } = window.__T;
    await S.setPublishScope(bt, { skills: true, objects: true });
    const p1 = S.supplyPublicPack();
    await new Promise(r => setTimeout(r, 40));
    const p2 = S.supplyPublicPack();
    const c1 = await S.publicationCid(p1), c2 = await S.publicationCid(p2);
    const a = await S.recordPublication(p1);
    const bb = await S.recordPublication(p2);
    const list = await S.loadPublications();
    return { sameCid: c1 === c2, differentGenerated: p1.generated !== p2.generated || true,
      firstIsNew: a.isNew, secondIsNew: bb.isNew, versions: list.length, cid: c1 };
  }, SETUP);
  ok('cidIgnoresTheClock', r.sameCid, 'el mateix contingut dona el mateix CID');
  ok('firstPublicationIsAVersion', r.firstIsNew, 'v1 creada');
  ok('identicalContentIsNotANewVersion', !r.secondIsNew && r.versions === 1,
    r.versions + ' versió: repetir el mateix amb una data nova no és versionar');
  ok('cidLooksLikeACid', /^sha256:/.test(r.cid), r.cid.slice(0, 20) + '…');
  ok('noErrors1', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 2. Cada versió sap qui és el seu pare ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { bt, ada } = window.__T;
    await S.setPublishScope(bt, { skills: true, objects: true });
    const v1 = await S.recordPublication(S.supplyPublicPack());
    bt.offers.push(S.newOffer({ kind: 'oferta', title: 'Cuino', category: 'cuina', memberId: ada.id }));
    const v2 = await S.recordPublication(S.supplyPublicPack());
    const list = await S.loadPublications();
    return { v1: v1.version.cid, v2: v2.version.cid, parent: v2.version.parent,
      firstParent: v1.version.parent, versions: list.length,
      newest: list[0].cid, counts: list.map(x => x.count) };
  }, SETUP);
  ok('secondVersionIsNew', r.v1 !== r.v2 && r.versions === 2, r.versions + ' versions');
  ok('childKnowsItsParent', r.parent === r.v1, 'v2.parent === v1.cid');
  ok('firstHasNoParent', r.firstParent === null, 'la primera no en té');
  ok('newestFirst', r.newest === r.v2 && r.counts[0] > r.counts[1], r.counts.join(' ← '));
  ok('noErrors2', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 3. Es pot veure QUÈ ha canviat, no només que ha canviat ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { bt, ada } = window.__T;
    await S.setPublishScope(bt, { skills: true, objects: true });
    const before = S.supplyPublicPack();
    await S.recordPublication(before);
    // un afegit, un canvi de recompte, i una retirada
    bt.offers.push(S.newOffer({ kind: 'oferta', title: 'Cuino', category: 'cuina', memberId: ada.id }));
    bt.offers.push(S.newOffer({ kind: 'oferta', title: 'Munto mobles', category: 'reparacions', memberId: ada.id }));
    const mid = S.supplyPublicPack();
    const d1 = S.publicationDiff({ supply: before.supply }, { supply: mid.supply });
    bt.offers = bt.offers.filter(o => o.category !== 'cuina');
    const after = S.supplyPublicPack();
    const d2 = S.publicationDiff({ supply: mid.supply }, { supply: after.supply });
    const st = await S.pubStatus();
    return { added: d1.added.map(x => x.category), changed: d1.changed.map(x => x.from.count + '→' + x.to.count),
      removed: d2.removed.map(x => x.category), fresh: st.fresh, pending: st.diff.total };
  }, SETUP);
  ok('diffSeesWhatIsNew', r.added.join() === 'cuina', 'nou: ' + r.added.join());
  ok('diffSeesACountChange', r.changed.join() === '1→2', 'reparacions ' + r.changed.join());
  ok('diffSeesWhatWasWithdrawn', r.removed.join() === 'cuina', 'retirat: ' + r.removed.join());
  ok('statusKnowsItIsStale', !r.fresh && r.pending > 0, r.pending + ' canvis sense publicar');
  ok('noErrors3', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 4. Tornar enrere no esborra el que va passar ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { bt, ada } = window.__T;
    await S.setPublishScope(bt, { skills: true, objects: true });
    const v1 = await S.recordPublication(S.supplyPublicPack());
    bt.offers.push(S.newOffer({ kind: 'oferta', title: 'Cuino', category: 'cuina', memberId: ada.id }));
    await S.recordPublication(S.supplyPublicPack());
    const back = await S.rollbackPublication(v1.version.cid);
    const list = await S.loadPublications();
    let missing = '';
    try { await S.rollbackPublication('sha256:no-existeix'); } catch (e) { missing = e.msg || ''; }
    return { versions: list.length, newestCount: list[0].count, v1Count: v1.version.count,
      historyStillHasAll: list.length === 3, note: list[0].note,
      packCount: back.pack.count, localOffers: bt.offers.length, missing,
      newestParent: list[0].parent === list[1].cid };
  }, SETUP);
  ok('rollbackAddsAVersion', r.historyStillHasAll, r.versions + ' versions: cap esborrada');
  ok('rollbackRestoresTheContent', r.newestCount === r.v1Count && r.packCount === r.v1Count,
    r.newestCount + ' files, com la v1');
  ok('rollbackChainsOnTop', r.newestParent, 'el pare és la versió que hi havia, no la restaurada');
  ok('rollbackSaysWhatItIs', /torna a la versió/i.test(r.note || ''), r.note);
  ok('rollbackDoesNotTouchLocalData', r.localOffers === 2, 'el SOS local segueix amb les seves 2 ofertes');
  ok('unknownVersionIsRefused', /no hi és/i.test(r.missing), r.missing);
  ok('noErrors4', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 5. L'automàtic versiona sol, i no es salta la comprovació ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { bt, ada } = window.__T;
    await S.setPublishScope(bt, { skills: true, objects: true });
    const offWhenOff = await S.autoPublishTick();
    await S.setAutoPublish(true);
    const after = await S.loadPublications();
    bt.offers.push(S.newOffer({ kind: 'oferta', title: 'Cuino', category: 'cuina', memberId: ada.id }));
    await S.autoPublishTick();
    const list = await S.loadPublications();
    await S.setAutoPublish(false);
    const stillOn = S.state.autoPublish;
    return { offWhenOff, first: after.length, second: list.length,
      autoFlagged: list[0].auto === true, stillOn };
  }, SETUP);
  ok('doesNothingWhileOff', r.offWhenOff === null, 'apagat no versiona res');
  ok('turningItOnStampsTheCurrentState', r.first === 1, r.first + ' versió en encendre\'l');
  ok('everyChangeBecomesAVersion', r.second === 2, r.second + ' versions');
  ok('automaticVersionsSayTheyAre', r.autoFlagged, 'marcada com a automàtica');
  ok('canBeTurnedOff', !r.stillOn, 'es pot apagar');
  ok('noErrors5', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 6. L'automatisme no es salta la comprovació de fuita ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { bt } = window.__T;
    await S.setPublishScope(bt, { skills: true, objects: true });
    await S.setAutoPublish(true);
    const before = (await S.loadPublications()).length;
    /* Fem que el paquet filtri: un node amb el nom d'una persona real hi
       posaria el nom a `nodeName`, i la comprovació ho ha de veure. */
    const m = S.membersOf(bt)[0];
    bt.name = m.name;
    const tick = await S.autoPublishTick();
    const after = (await S.loadPublications()).length;
    return { before, after, blocked: !!(tick && tick.blocked), what: tick && tick.blocked };
  }, SETUP);
  ok('leakBlocksTheAutomatic', r.blocked, (r.what || []).join(' · '));
  ok('nothingIsVersionedOnALeak', r.after === r.before, r.after + ' versions, cap de nova');
  ok('noErrors6', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 7. A la pantalla ═══
{
  const { ctx, p, errs } = await open();
  await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { bt, ada } = window.__T;
    await S.setPublishScope(bt, { skills: true, objects: true });
    await S.recordPublication(S.supplyPublicPack());
    bt.offers.push(S.newOffer({ kind: 'oferta', title: 'Cuino', category: 'cuina', memberId: ada.id }));
    S.render(); S.openPublishSupply();
  }, SETUP);
  await p.waitForTimeout(700);
  const pub = await p.evaluate(() => (document.querySelector('.modal') || {}).innerText || '');
  ok('publishScreenSaysWhatIsPending', /1 canvi des de l'última versió/i.test(pub) || /canvis des de l'última versió/i.test(pub),
    (pub.split('\n').find(l => /última versió/i.test(l)) || '').slice(0, 90));
  ok('autoSaysItDoesNotUpload', /no puja res a cap servidor/i.test(pub), 'no promet el que no fa');
  await p.evaluate(() => document.querySelector('#psHist').click());
  await p.waitForTimeout(700);
  const hist = await p.evaluate(() => (document.querySelector('.modal') || {}).innerText || '');
  ok('historyListsVersions', /v1/.test(hist), hist.split('\n').find(l => /^v\d/.test(l.trim())) || '');
  ok('historyShowsTheCid', /sha256:/.test(hist), 'amb el CID a la vista');
  ok('historySaysWhatIsPending', /sense publicar/i.test(hist), 'diu què queda per publicar');
  ok('historyExplainsRollback', /no esborra/i.test(hist), 'diu que tornar enrere no esborra res');
  ok('noErrors7', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 8. Vores ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS;
    const st = await S.pubStatus();          // sense res publicat ni res a publicar
    const emptyDiff = S.publicationDiff(null, null);
    const list = await S.loadPublications();
    // més de 50 versions no han de créixer sense fre
    return { noLast: st.last === null, fresh: st.fresh, pending: st.diff.total,
      emptyDiff: emptyDiff.total, list: list.length };
  }, SETUP);
  ok('nothingPublishedIsNotAnError', r.noLast && r.list === 0, 'historial buit');
  ok('emptyScopeIsFresh', r.fresh && r.pending === 0, 'sense res a compartir, res pendent');
  ok('nullDiffDoesNotCrash', r.emptyDiff === 0, 'diff de res amb res = 0');
  ok('noErrors8', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

await b.close();
const failed = Object.entries(results).filter(([, v]) => !v).map(([k]) => k);
console.log('\n' + (failed.length ? '❌ FAILED (' + failed.length + '): ' + failed.join(', ') : '✅ ALL PASSED (' + Object.keys(results).length + ')'));
process.exit(failed.length ? 1 : 0);
