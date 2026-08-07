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
  const nd={id:'BIB',name:'Biblioteca de les coses',nodeLevel:'projecte',parentId:null,dynamicType:'biblioteca_coses',
    metaskill:{},vna:{roles:[],exchanges:[]},kanban:{cards:[]},ledger:[],members:[],objects:[],offers:[],
    createdAt:'',updatedAt:''};
  S.state.nodes.push(nd); S.state.activeId='BIB';
  const rosa=S.newMember({name:'Rosa Camps',kind:'persona'});
  const iu=S.newMember({name:'Iu Blanc',kind:'persona'});
  const teo=S.newMember({name:'Teo Prat',kind:'persona'});
  nd.members.push(rosa,iu,teo);
  window.__T={nd,rosa,iu,teo};
`;

// ═══ 1. Donar i posar a disposició no són el mateix ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { nd, rosa } = window.__T;
    const don = S.newObject({ name: 'Escala', typology: 'bricolatge', ownerId: rosa.id, mode: 'donacio' });
    const disp = S.newObject({ name: 'Trepant', typology: 'bricolatge', ownerId: rosa.id, mode: 'disposicio' });
    nd.objects.push(don, disp);
    await S.recordDonation(nd, don, rosa.id);
    const afterDon = { n: nd.ledger.length, e: nd.ledger[0] };
    const w = await S.recordLoanWear(nd, don, rosa.id);          // el que és del comú no desgasta ningú
    const lv = S.loanValue(nd, disp);
    const base = S.oracleObjectValue(nd, disp);
    return { donLedger: afterDon.n, donType: afterDon.e.type, donValue: afterDon.e.value,
      donIsEstimate: afterDon.e.estimate === true, donTag: afterDon.e.circular,
      hasOracle: !!(afterDon.e.oracle && afterDon.e.oracle.base),
      donatedNoWear: w === null, base, loanEur: lv.eur, why: lv.why,
      ledgerAfter: nd.ledger.length };
  }, SETUP);
  ok('donationEntersOnce', r.donLedger === 1 && r.donValue > 0, 'donació de ' + r.donValue + ' €');
  ok('donationIsItsOwnType', r.donType === 'objecte', 'type=' + r.donType + ' · ni hores ni diner');
  ok('donationIsMarkedAsEstimate', r.donIsEstimate && r.hasOracle, 'estimate=true amb la font de l\'oracle');
  ok('donationIsTagged', r.donTag === 'donacio', r.donTag);
  ok('donatedThingWearsNobody', r.donatedNoWear && r.ledgerAfter === 1,
    'el que és del comú no genera desgast per a ningú en particular');
  ok('loanIsWorthAFractionNotThePrice', r.loanEur > 0 && r.loanEur < r.base / 2,
    r.loanEur + ' € per préstec sobre ' + r.base + ' € de valor');
  ok('loanValueExplainsItself', /desgast, risc i revisió/i.test(r.why), r.why);
  ok('noErrors1', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 2. El valor s'acumula amb l'ús real, no amb una declaració ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { nd, rosa } = window.__T;
    const trepant = S.newObject({ name: 'Trepant', typology: 'bricolatge', ownerId: rosa.id, mode: 'disposicio' });
    const tenda = S.newObject({ name: 'Tenda', typology: 'esport', ownerId: rosa.id, mode: 'disposicio' });
    nd.objects.push(trepant, tenda);
    const atStart = nd.ledger.length;
    for (let i = 0; i < 8; i++) { trepant.loans = (trepant.loans || 0) + 1; await S.recordLoanWear(nd, trepant, rosa.id); }
    for (let i = 0; i < 2; i++) { tenda.loans = (tenda.loans || 0) + 1; await S.recordLoanWear(nd, tenda, rosa.id); }
    const cs = S.circularStats(nd);
    const trepantEarned = trepant.wearEarned, tendaEarned = tenda.wearEarned;
    return { atStart, entries: nd.ledger.length, trepantEarned, tendaEarned,
      valorDesgast: cs.valorDesgast, prestecs: cs.prestecs, compraEvitada: cs.compraEvitada,
      valorDonat: cs.valorDonat };
  }, SETUP);
  ok('nothingUntilItIsUsed', r.atStart === 0, 'posar-lo a disposició no escriu res');
  ok('everyReturnIsOneEntry', r.entries === 10, r.entries + ' apunts per 10 préstecs');
  ok('usedMoreIsWorthMore', r.trepantEarned > r.tendaEarned,
    'trepant ' + r.trepantEarned + ' € (8 préstecs) > tenda ' + r.tendaEarned + ' € (2)');
  ok('statsAddUp', Math.abs(r.valorDesgast - (r.trepantEarned + r.tendaEarned)) < 0.02,
    r.valorDesgast + ' € de desgast');
  ok('avoidedPurchaseIsCounted', r.compraEvitada > 0 && r.prestecs === 10, r.compraEvitada + ' € de compra evitada');
  ok('noDonationsNoDonatedValue', r.valorDonat === 0, 'res donat, res comptat com a donació');
  ok('noErrors2', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 3. L'aprenent no és un cost: aporta valor mentre aprèn ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { nd, rosa, iu, teo } = window.__T;
    const o = S.newObject({ name: 'Trepant', typology: 'bricolatge', ownerId: rosa.id }); nd.objects.push(o);
    await S.logRepair(nd, { objectId: o.id, mentorId: rosa.id, learnerIds: [iu.id, teo.id], hours: 2, what: 'Canvi d\'escombretes' }, rosa.id);
    const ents = nd.ledger.slice();
    const byRole = {};
    ents.forEach(e => { byRole[e.role] = (byRole[e.role] || 0) + 1; });
    const cs = S.circularStats(nd);
    const iuBal = S.memberBalance(nd, iu.id);
    const chain = await S.verifyLedger(nd.ledger);
    return { n: ents.length, byRole, repairs: o.repairs,
      learnerHours: cs.horesFormatives, mentorHours: cs.horesMentoria,
      learners: cs.aprenents, mentors: cs.mentors, saved: cs.objectesReparats,
      iuGiven: iuBal.given, allTemps: ents.every(e => e.type === 'temps'),
      chainOk: chain.chain !== false && chain.chain.ok !== false,
      learnerText: (ents.find(e => e.role === 'aprenent') || {}).deliverables };
  }, SETUP);
  ok('everyoneWhoPutTimeGetsAnEntry', r.n === 3 && r.byRole.mentor === 1 && r.byRole.aprenent === 2,
    '1 mentora + 2 aprenents = ' + r.n + ' apunts');
  ok('learnerHoursAreRealHours', r.allTemps && r.learnerHours === 4, r.learnerHours + ' h formatives, tipus temps');
  ok('learnerBuildsReputation', r.iuGiven === 2, 'l\'aprenent suma ' + r.iuGiven + ' h aportades, no en resta');
  ok('learnerDeliversValue', /reparació feta aprenent/i.test(r.learnerText || ''), r.learnerText);
  ok('objectCountsAsSaved', r.repairs === 1 && r.saved === 1, 'un objecte salvat de l\'abocador');
  ok('bothSidesCounted', r.mentors === 1 && r.learners === 2, r.mentors + ' mentora · ' + r.learners + ' aprenents');
  ok('chainSurvives', r.chainOk, 'la cadena segueix verificant');
  ok('noErrors3', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 4. Un valor estimat no es cola on hi ha d'haver diner real ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { nd, rosa, iu } = window.__T;
    const o = S.newObject({ name: 'Escala', typology: 'bricolatge', ownerId: rosa.id, mode: 'donacio' });
    nd.objects.push(o);
    await S.recordDonation(nd, o, rosa.id);   // ~80 € estimats
    await S.pushLedger(nd.ledger, { id: 'H1', who: 'Iu Blanc', what: 'Taller', type: 'temps', value: 4, memberId: iu.id, ts: new Date().toISOString() });
    const idx = S.ledgerIndex().filter(x => x.nodeId === 'BIB');
    const t = S.ledgerTotals(idx);
    const eq = S.computeEquity(nd);
    const rosaSlices = (eq.find(x => x.memberId === rosa.id) || {}).slices;
    const iuSlices = (eq.find(x => x.memberId === iu.id) || {}).slices;
    const cfg = S.equityCfg(nd);
    return { hores: t.hores, euros: t.euros, objectes: t.objectes,
      rosaSlices, iuSlices, fmv: cfg.fmv, nonCash: cfg.nonCash,
      expectedRosa: 80 * cfg.nonCash, expectedIu: 4 * cfg.fmv * cfg.nonCash };
  }, SETUP);
  ok('objectValueIsNotCountedAsHours', r.hores === 4, r.hores + ' h — les 80 € de l\'escala no s\'hi han colat');
  ok('objectValueIsNotCountedAsCash', r.euros === 0, r.euros + ' € de diner real');
  ok('objectValueHasItsOwnColumn', r.objectes > 0, r.objectes + ' € en objectes');
  ok('objectSlicesAreNotMultipliedByHourlyRate', Math.abs(r.rosaSlices - r.expectedRosa) < 0.01,
    r.rosaSlices + ' slices, no ' + (r.expectedRosa * r.fmv));
  ok('hoursStillUseTheHourlyRate', Math.abs(r.iuSlices - r.expectedIu) < 0.01, r.iuSlices + ' slices per 4 h');
  ok('noErrors4', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 5. La pantalla ho diu abans de desar, i diu que és una estimació ═══
{
  const { ctx, p, errs } = await open();
  await p.evaluate(async (setup) => { eval(setup); window.__SOS.render(); window.__SOS.openObjectForm(window.__T.nd, null); }, SETUP);
  await p.waitForTimeout(400);
  const disp = await p.evaluate(() => (document.querySelector('#obVal') || {}).innerText || '');
  ok('disposalSaysNothingEntersNow', /cada retorn/i.test(disp), disp.slice(0, 90));
  ok('disposalShowsTheCalculation', /desgast, risc i revisió/i.test(disp), 'ensenya d\'on surt el número');
  ok('disposalSaysItIsAnEstimate', /estimació de l'oracle/i.test(disp) || /estimació de l’oracle/i.test(disp), 'ho diu');
  await p.evaluate(() => document.querySelector('.ob-m[data-m="donacio"]').click());
  await p.waitForTimeout(200);
  const don = await p.evaluate(() => (document.querySelector('#obVal') || {}).innerText || '');
  ok('donationSaysItEntersOnce', /una sola vegada/i.test(don), don.slice(0, 90));
  ok('donationSaysItIsNotAPrice', /no és un preu de venda/i.test(don), 'no es fa passar per preu');
  const saved = await p.evaluate(async () => {
    document.querySelector('#obName').value = 'Escala de 3 m';
    document.querySelector('#obSave').click();
    await new Promise(r => setTimeout(r, 700));
    const nd = window.__SOS.byId('BIB');
    return { objs: nd.objects.length, mode: nd.objects[0].mode, ledger: nd.ledger.length,
      toast: (document.querySelector('#toast') || {}).innerText || '' };
  });
  ok('savingADonationRegistersIt', saved.objs === 1 && saved.mode === 'donacio' && saved.ledger === 1, saved.toast);
  ok('toastSaysItIsAnEstimate', /estimació de l'oracle/i.test(saved.toast) || /estimació de l’oracle/i.test(saved.toast), saved.toast);
  ok('noErrors5', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 6. El panell circular a la biblioteca ═══
{
  const { ctx, p, errs } = await open();
  await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { nd, rosa, iu } = window.__T;
    const o = S.newObject({ name: 'Trepant', typology: 'bricolatge', ownerId: rosa.id, mode: 'disposicio' });
    nd.objects.push(o);
    o.loans = 3; await S.recordLoanWear(nd, o, rosa.id);
    await S.logRepair(nd, { objectId: o.id, mentorId: rosa.id, learnerIds: [iu.id], hours: 1.5, what: 'Cable' }, rosa.id);
    S.state.tab = 'biblioteca'; S.render();
  }, SETUP);
  await p.waitForTimeout(500);
  const txt = await p.evaluate(() => document.querySelector('#workspace') ? document.querySelector('#workspace').innerText : document.body.innerText);
  ok('panelIsThere', /economia circular/i.test(txt), 'panell present');
  ok('panelShowsAvoidedPurchase', /compra evitada/i.test(txt), 'compra evitada');
  ok('panelShowsLearnerHours', /aprenent fent/i.test(txt), 'les hores d\'aprenent tenen el seu lloc');
  ok('panelSaysWhichNumbersAreEstimates', /estimacions de l'oracle/i.test(txt) || /estimacions de l’oracle/i.test(txt),
    'diu quins números són estimació');
  ok('panelSaysHoursAreReal', /hores són reals/i.test(txt), 'i quins són reals');
  ok('noErrors6', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 7. El vistiplau també val aquí ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { nd, rosa, iu } = window.__T;
    await S.claimMember(nd, iu);      // l'Iu diu que aquesta fitxa és seva
    const o = S.newObject({ name: 'Trepant', typology: 'bricolatge', ownerId: rosa.id }); nd.objects.push(o);
    const res = await S.logRepair(nd, { objectId: o.id, mentorId: rosa.id, learnerIds: [iu.id], hours: 2, what: 'X' }, rosa.id);
    const cs = S.circularStats(nd);
    return { pending: res.pending, ledger: nd.ledger.length, learnerHours: cs.horesFormatives,
      mentorHours: cs.horesMentoria };
  }, SETUP);
  ok('claimedLearnerMustAgree', r.pending === 1, 'l\'apunt de l\'aprenent espera el seu vistiplau');
  ok('mentorEntryGoesStraight', r.ledger === 1 && r.mentorHours === 2, 'el de la mentora entra: l\'escriu ella');
  ok('unconfirmedHoursDoNotCount', r.learnerHours === 0, 'les hores no confirmades no inflen l\'indicador');
  ok('noErrors7', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 8. Vores ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { nd, rosa } = window.__T;
    const empty = S.circularStats(nd);
    const o = S.newObject({ name: 'Trepant', typology: 'bricolatge', ownerId: rosa.id }); nd.objects.push(o);
    let noHours = '', noBody = '', noObj = '';
    try { await S.logRepair(nd, { objectId: o.id, mentorId: rosa.id, hours: 0 }, rosa.id); } catch (e) { noHours = e.msg || ''; }
    try { await S.logRepair(nd, { objectId: o.id, hours: 2, learnerIds: [] }, rosa.id); } catch (e) { noBody = e.msg || ''; }
    try { await S.logRepair(nd, { objectId: 'NOEXISTEIX', mentorId: rosa.id, hours: 2 }, rosa.id); } catch (e) { noObj = e.msg || ''; }
    // un objecte molt vell no baixa de terra
    const vell = S.newObject({ name: 'Serra antiga', typology: 'bricolatge', ownerId: rosa.id, years: 40 });
    const floor = S.oracleObjectValue(nd, vell);
    return { emptyOk: empty.objectes === 0 && empty.valorTotal === 0 && empty.compraEvitada === 0,
      noHours, noBody, noObj, floor, ledger: nd.ledger.length };
  }, SETUP);
  ok('emptyLibraryIsZeroNotAnError', r.emptyOk, 'una biblioteca buida val zero');
  ok('repairNeedsHours', /alguna estona/i.test(r.noHours), r.noHours);
  ok('repairNeedsSomebody', /qui repara/i.test(r.noBody), r.noBody);
  ok('repairNeedsARealObject', /no hi és/i.test(r.noObj), r.noObj);
  ok('nothingWrittenOnRefusal', r.ledger === 0, 'cap apunt de les tres crides refusades');
  ok('oldThingsKeepAFloorValue', r.floor > 0, 'una serra de 40 anys val ' + r.floor + ' €, no zero');
  ok('noErrors8', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

await b.close();
const failed = Object.entries(results).filter(([, v]) => !v).map(([k]) => k);
console.log('\n' + (failed.length ? '❌ FAILED (' + failed.length + '): ' + failed.join(', ') : '✅ ALL PASSED (' + Object.keys(results).length + ')'));
process.exit(failed.length ? 1 : 0);
