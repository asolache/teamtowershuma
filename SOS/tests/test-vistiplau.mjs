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

// Escenari base: un banc de temps amb l'Anna (jo, fitxa reclamada... o no) i en Bru.
const SETUP = `
  const S=window.__SOS;
  const nd={id:'BT',name:'Banc de temps del barri',nodeLevel:'projecte',parentId:null,dynamicType:'banc_temps',
    metaskill:{},vna:{roles:[],exchanges:[]},kanban:{cards:[]},ledger:[],members:[],objects:[],offers:[],
    createdAt:'',updatedAt:''};
  S.state.nodes.push(nd); S.state.activeId='BT';
  const anna=S.newMember({name:'Anna Puig',kind:'persona'});
  const bru=S.newMember({name:'Bru Roca',kind:'persona'});
  nd.members.push(anna,bru);
  window.__T={nd,anna,bru};
`;

// ═══ 1. Sense fitxa reclamada, res canvia: el SOS segueix funcionant com abans ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { nd, anna, bru } = window.__T;
    const need = S.confirmersFor(nd, { memberId: anna.id, counterpartId: bru.id }, anna.id);
    const res = await S.submitEntry(nd, { id: 'E1', who: 'Anna Puig', what: 'Classes de guitarra', type: 'temps', value: 2, memberId: anna.id, counterpartId: bru.id, ts: new Date().toISOString() }, anna.id);
    return { need: need.length, status: res.status, ledger: nd.ledger.length, pend: S.pendingOf(nd).length };
  }, SETUP);
  ok('unclaimedNeedsNobody', r.need === 0, 'ningú a qui demanar permís');
  ok('unclaimedWritesStraightAway', r.status === 'registrat' && r.ledger === 1, 'entra al registre com sempre');
  ok('unclaimedQueuesNothing', r.pend === 0, 'cap petició pendent');
  ok('noErrors1', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 2. Amb la fitxa reclamada, ningú escriu al teu nom sense preguntar ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { nd, anna, bru } = window.__T;
    await S.claimMember(nd, bru);                    // en Bru diu «aquesta fitxa és meva»
    const res = await S.submitEntry(nd, { id: 'E1', who: 'Anna Puig', what: 'Classes de guitarra', type: 'temps', value: 2, memberId: anna.id, counterpartId: bru.id, ts: new Date().toISOString() }, anna.id);
    return { status: res.status, ledger: nd.ledger.length, pend: S.pendingOf(nd).length,
      need: res.need, bruNeeded: res.need.indexOf(bru.id) >= 0,
      pendSigned: !!(res.pending && res.pending.sig) };
  }, SETUP);
  ok('claimedFileNeedsConsent', r.status === 'pendent', 'queda com a petició');
  ok('nothingWrittenYet', r.ledger === 0, 'el registre segueix buit — una petició no és mitja comptabilitat');
  ok('theOneAskedIsTheClaimant', r.bruNeeded, 'esperant en Bru');
  ok('requestIsItselfSigned', r.pendSigned, 'la petició porta firma de qui la fa');
  ok('noErrors2', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 3. Dir que sí escriu l'apunt; dir que no no escriu res ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { nd, anna, bru } = window.__T;
    await S.claimMember(nd, bru);
    const a = await S.submitEntry(nd, { id: 'E1', who: 'Anna Puig', what: 'Guitarra', type: 'temps', value: 2, memberId: anna.id, counterpartId: bru.id, ts: '2026-01-01T00:00:00.000Z' }, anna.id);
    await S.confirmPending(nd, a.pending, bru.id);
    const afterYes = { ledger: nd.ledger.length, st: a.pending.status, e: nd.ledger[0] };
    const c = await S.submitEntry(nd, { id: 'E2', who: 'Anna Puig', what: 'Inventat', type: 'temps', value: 9, memberId: anna.id, counterpartId: bru.id, ts: new Date().toISOString() }, anna.id);
    await S.rejectPending(nd, c.pending, bru.id, 'Això no ha passat');
    const chain = await S.verifyLedger(nd.ledger);
    return { yesLedger: afterYes.ledger, yesStatus: afterYes.st,
      keepsOriginalTs: afterYes.e.ts === '2026-01-01T00:00:00.000Z',
      recordsWhoConfirmed: !!(afterYes.e.confirmedBy && afterYes.e.confirmedBy[0] && afterYes.e.confirmedBy[0].did),
      noLedger: nd.ledger.length, noStatus: c.pending.status, why: c.pending.why,
      chainOk: chain.chain.ok !== false && chain.chain !== false };
  }, SETUP);
  ok('yesWritesTheEntry', r.yesLedger === 1 && r.yesStatus === 'acceptat', 'acceptat i registrat');
  ok('entryKeepsWhenItHappened', r.keepsOriginalTs, 'la data és la del fet, no la del vistiplau');
  ok('entrySaysWhoValidatedIt', r.recordsWhoConfirmed, 'qui ho ha confirmat queda a dins, amb did');
  ok('noWritesNothing', r.noLedger === 1 && r.noStatus === 'rebutjat', 'el registre no creix');
  ok('rejectionKeepsTheReason', r.why === 'Això no ha passat', r.why);
  ok('chainStillVerifies', r.chainOk, 'la cadena de hash segueix bé');
  ok('noErrors3', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 4. Qui no hi té res a veure no pot confirmar ni rebutjar ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { nd, anna, bru } = window.__T;
    const cesc = S.newMember({ name: 'Cesc Munt', kind: 'persona' }); nd.members.push(cesc);
    await S.claimMember(nd, bru);
    const a = await S.submitEntry(nd, { id: 'E1', who: 'Anna', what: 'X', type: 'temps', value: 1, memberId: anna.id, counterpartId: bru.id, ts: new Date().toISOString() }, anna.id);
    let outsider = '', twice = '';
    try { await S.confirmPending(nd, a.pending, cesc.id); } catch (e) { outsider = e.msg || 'error'; }
    await S.confirmPending(nd, a.pending, bru.id);
    try { await S.confirmPending(nd, a.pending, bru.id); } catch (e) { twice = e.msg || 'error'; }
    return { outsider, twice, ledger: nd.ledger.length, got: a.pending.got.length };
  }, SETUP);
  ok('outsiderCannotConfirm', /no espera el teu vistiplau/i.test(r.outsider), r.outsider);
  ok('cannotConfirmTwice', /ja està resolta/i.test(r.twice), r.twice);
  ok('oneEntryOnly', r.ledger === 1 && r.got === 1, 'un vistiplau, un apunt');
  ok('noErrors4', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 5. Qui escriu sobre si mateix no s'ha de demanar permís a si mateix ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { nd, anna, bru } = window.__T;
    await S.claimMember(nd, anna);           // ara la fitxa reclamada és la de qui escriu
    const res = await S.submitEntry(nd, { id: 'E1', who: 'Anna', what: 'X', type: 'temps', value: 1, memberId: anna.id, counterpartId: bru.id, ts: new Date().toISOString() }, anna.id);
    // I si no sóc cap de les dues bandes, totes dues han de dir-hi la seva
    await S.claimMember(nd, bru).catch(() => {});
    const need2 = S.confirmersFor(nd, { memberId: anna.id, counterpartId: bru.id }, null);
    return { status: res.status, need2: need2.length };
  }, SETUP);
  ok('noSelfPermission', r.status === 'registrat', 'la meva pròpia fitxa no em demana permís a mi');
  ok('thirdPartyNeedsBothSides', r.need2 >= 1, r.need2 + ' banda(es) a confirmar quan qui escriu no hi és');
  ok('noErrors5', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 6. Un préstec també posa una responsabilitat a nom d'algú ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { nd, anna, bru } = window.__T;
    const o = S.newObject({ name: 'Trepant', category: 'bricolatge' }); nd.objects.push(o);
    await S.claimMember(nd, bru);
    const res = await S.submitLoan(nd, o, bru.id, null, anna.id);
    const before = { st: o.status, who: o.borrowerId };
    await S.confirmPending(nd, res.pending, bru.id);
    return { queued: res.status, beforeStatus: before.st, beforeWho: before.who,
      afterStatus: o.status, afterWho: o.borrowerId === bru.id,
      label: S.pendingLabel(nd, res.pending) };
  }, SETUP);
  ok('loanAlsoAsksFirst', r.queued === 'pendent', 'el préstec espera');
  ok('objectNotLentYet', r.beforeStatus !== 'prestat' && !r.beforeWho, 'no consta a les seves mans');
  ok('loanAppliesOnYes', r.afterStatus === 'prestat' && r.afterWho, 'després del sí, sí');
  ok('loanSaysWhatItIs', /trepant/i.test(r.label), r.label);
  ok('noErrors6', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 7. La safata: veig el que espera de mi, i el badge ho diu ═══
{
  const { ctx, p, errs } = await open();
  await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { nd, anna, bru } = window.__T;
    const id = await S.getIdentity();
    bru.did = id.did;                                    // la fitxa d'en Bru sóc jo
    await S.claimMember(nd, bru);
    await S.submitEntry(nd, { id: 'E1', who: 'Anna Puig', what: 'Classes de guitarra', type: 'temps', value: 2, memberId: anna.id, counterpartId: bru.id, ts: new Date().toISOString() }, anna.id);
    S.render();
  }, SETUP);
  await p.waitForTimeout(300);
  const badge = await p.evaluate(() => {
    const b = document.querySelector('#pendBadge');
    return { shown: !!b, n: (document.querySelector('#pendN') || {}).textContent,
      inbox: window.__SOS.pendingInbox().length,
      attention: window.__SOS.dashboardAttention().filter(a => /vistiplau/i.test(a.t)).length };
  });
  ok('inboxSeesIt', badge.inbox === 1, badge.inbox + ' esperant');
  ok('badgeShowsTheCount', badge.shown && badge.n === '1', 'pastilla ⏳ ' + badge.n);
  ok('dashboardRaisesIt', badge.attention === 1, 'surt al tauler d\'atenció');
  await p.evaluate(() => window.__SOS.openPendingInbox());
  await p.waitForTimeout(300);
  const modalTxt = await p.evaluate(() => (document.querySelector('.modal') || {}).innerText || '');
  ok('inboxNamesWhoAsks', /anna puig/i.test(modalTxt), 'diu qui ho demana');
  ok('inboxSaysNothingCountsYet', /no compta encara/i.test(modalTxt), 'diu clarament que encara no compta');
  ok('inboxExplainsConsequence', /entra al registre/i.test(modalTxt), 'diu què passarà si dic que sí');
  const clicked = await p.evaluate(async () => {
    document.querySelector('.pd-yes').click();
    await new Promise(r => setTimeout(r, 600));
    const nd = window.__SOS.byId('BT');
    return { ledger: nd.ledger.length, inbox: window.__SOS.pendingInbox().length,
      badge: !!document.querySelector('#pendBadge') };
  });
  ok('clickingYesRegisters', clicked.ledger === 1, 'un clic i l\'apunt hi és');
  /* La pastilla no s'amaga: desapareix. La barra torna a tenir els seus tres
     controls i prou. */
  ok('inboxEmptiesAfter', clicked.inbox === 0 && !clicked.badge, 'la safata queda neta i la pastilla se\'n va');
  ok('noErrors7', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 8. El formulari d'intercanvi ho diu abans de deixar-te marxar ═══
{
  const { ctx, p, errs } = await open();
  await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { nd, anna, bru } = window.__T;
    const id = await S.getIdentity();
    anna.did = id.did; await S.claimMember(nd, anna);     // jo sóc l'Anna
    await S.claimMember(nd, bru);                        // ...i en Bru també té fitxa reclamada
    S.render(); S.exchangeHours(nd, { fromId: anna.id, toId: bru.id, what: 'Guitarra' });
  }, SETUP);
  await p.waitForTimeout(300);
  await p.fill('#exH', '2');
  await p.click('#exSave');
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => {
    const nd = window.__SOS.byId('BT');
    return { ledger: nd.ledger.length, pend: window.__SOS.pendingOf(nd).length,
      toast: (document.querySelector("#toast") || {}).innerText || '' };
  });
  ok('formQueuesInsteadOfWriting', r.ledger === 0 && r.pend === 1, 'no s\'escriu, s\'envia');
  ok('formSaysItDoesNotCountYet', /no compta fins que/i.test(r.toast), r.toast);
  ok('formNamesWhoMustSayYes', /bru/i.test(r.toast), r.toast);
  ok('noErrors8', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 9. Vores: petició resolta, fitxa sense claim, i àlies després d'una fusió ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { nd, anna, bru } = window.__T;
    // did sense claim: no hi ha reclamació signada, així que no compta com a reclamada
    const dani = S.newMember({ name: 'Dani Sol', kind: 'persona' }); dani.did = 'did:sos:fals'; nd.members.push(dani);
    const needFake = S.confirmersFor(nd, { memberId: anna.id, counterpartId: dani.id }, anna.id);
    // àlies: la fitxa d'en Bru s'absorbeix i la petició ha de seguir el rastre
    await S.claimMember(nd, bru);
    const a = await S.submitEntry(nd, { id: 'E1', who: 'Anna', what: 'X', type: 'temps', value: 1, memberId: anna.id, counterpartId: bru.id, ts: new Date().toISOString() }, anna.id);
    const bru2 = S.newMember({ name: 'Bru Roca' , kind: 'persona' }); nd.members.push(bru2);
    await S.mergeMembers(nd, bru2.id, bru.id);
    let viaAlias = false;
    try { await S.confirmPending(nd, a.pending, bru2.id); viaAlias = a.pending.status === 'acceptat'; } catch (e) { viaAlias = 'error: ' + (e.msg || e); }
    // una petició ja resolta no es pot tornar a tocar
    let resolved = '';
    try { await S.rejectPending(nd, a.pending, bru.id, 'tard'); } catch (e) { resolved = e.msg || ''; }
    return { needFake: needFake.length, viaAlias, resolved, ledger: nd.ledger.length };
  }, SETUP);
  ok('didWithoutClaimIsNotAClaim', r.needFake === 0, 'un did sense reclamació signada no dona dret a res');
  ok('aliasFollowsTheMerge', r.viaAlias === true, 'la fitxa absorbida segueix podent confirmar');
  ok('resolvedCannotBeReopened', /ja està resolta/i.test(r.resolved), r.resolved);
  ok('stillOneEntry', r.ledger === 1, 'un sol apunt');
  ok('noErrors9', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

await b.close();
const failed = Object.entries(results).filter(([, v]) => !v).map(([k]) => k);
console.log('\n' + (failed.length ? '❌ FAILED (' + failed.length + '): ' + failed.join(', ') : '✅ ALL PASSED (' + Object.keys(results).length + ')'));
process.exit(failed.length ? 1 : 0);
