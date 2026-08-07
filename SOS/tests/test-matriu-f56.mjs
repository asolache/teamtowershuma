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

const SETUP = `
  const S=window.__SOS;
  const terr={id:'T',name:'Poble',nodeLevel:'municipi',parentId:null,dynamicType:'',
    metaskill:{mission:'',vision:'',objectives:''},vna:{roles:[],exchanges:[]},kanban:{cards:[]},
    ledger:[],members:[],objects:[],offers:[],createdAt:'',updatedAt:''};
  const mat={id:'M',name:'MATRIU',nodeLevel:'projecte',parentId:'T',dynamicType:'matriu',
    metaskill:{mission:'',vision:'',objectives:''},vna:{roles:[],exchanges:[]},kanban:{cards:[]},
    ledger:[],members:[],objects:[],offers:[],ventures:[],createdAt:'',updatedAt:''};
  S.state.nodes.push(terr,mat); S.state.activeId='M';
  const lia=S.newMember({name:'Lia Bosc',kind:'persona'});
  const noa=S.newMember({name:'Noa Ferrer',kind:'persona'});
  mat.members.push(lia,noa);
  const v=S.newVenture(mat,{id:'a1',name:'Forn comunitari',roles:['Nucli','Veïnat'],pairs:[]});
  v.leadMemberId=lia.id; v.projectType='cooperativa';
  mat.ventures.push(v);
  const d=n=>new Date(Date.now()+n*864e5).toISOString().slice(0,10);
  window.__T={terr,mat,v,lia,noa,d};
`;

// ═══ 1. El pipeline separa el que has demanat del que és teu ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { mat, v, d } = window.__T;
    S.addFunding(v, { name: 'Subvenció entitats', kind: 'subvencio', amount: 5000, state: 'presentada', deadline: d(30) });
    S.addFunding(v, { name: 'Préstec Coop57', kind: 'prestec', amount: 10000, state: 'concedida' });
    S.addFunding(v, { name: 'Premi innovació', kind: 'premi', amount: 2000, state: 'denegada' });
    const su = S.fundingSummary(v);
    let noName = '';
    try { S.addFunding(v, { amount: 100 }); } catch (e) { noName = e.msg || ''; }
    return { total: su.total, demanat: su.demanat, concedit: su.concedit, obert: su.obert, noName };
  }, SETUP);
  ok('askedIsNotGranted', r.demanat === 7000 && r.concedit === 10000,
    'demanat ' + r.demanat + ' € · concedit ' + r.concedit + ' €');
  ok('deniedStaysOnTheAskedSide', r.demanat === 7000, 'el premi denegat no compta com a teu');
  ok('openOnesAreCounted', r.obert === 1, r.obert + ' en marxa');
  ok('aCallNeedsAName', /nom a la convocatòria/i.test(r.noName), r.noName);
  ok('noErrors1', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 2. El que caduca sola puja al capdamunt ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { mat, v, d } = window.__T;
    S.addFunding(v, { name: 'Llunyana', amount: 1000, state: 'preparant', deadline: d(90) });
    S.addFunding(v, { name: 'A tocar', amount: 3000, state: 'presentada', deadline: d(5) });
    S.addFunding(v, { name: 'Ja passada', amount: 4000, state: 'preparant', deadline: d(-3) });
    S.addFunding(v, { name: 'Tancada amb data', amount: 900, state: 'tancada', deadline: d(2) });
    const su = S.fundingSummary(v);
    const al = S.fundingAlerts(mat);
    const att = S.dashboardAttention().filter(a => /venç|ha passat/i.test(a.t));
    return { urgents: su.urgents.map(x => x.f.name), proper: su.proper && su.proper.f.name,
      alerts: al.map(x => x.f.name + '@' + x.dies), attention: att.map(a => a.t),
      sev: att.map(a => a.sev) };
  }, SETUP);
  ok('pastDeadlineComesFirst', r.urgents[0] === 'Ja passada', 'ordre: ' + r.urgents.join(' → '));
  ok('closedOnesDoNotAlarm', r.urgents.indexOf('Tancada amb data') < 0, 'una convocatòria tancada no venç');
  ok('farAwayIsNotUrgent', r.urgents.indexOf('Llunyana') < 0, 'a 90 dies encara no és urgent');
  ok('alertsReachTheDashboard', r.attention.length === 2, r.attention.join(' | '));
  ok('deadlinesAreTopSeverity', r.sev.every(s => s === 0), 'severitat màxima: és l\'únic que caduca sol');
  ok('itSaysAPastDeadlineIsLost', /ha passat fa 3 dies/.test(r.attention.join()), r.attention[0]);
  ok('noErrors2', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 3. Els tràmits: la llista que et demanaran ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { v } = window.__T;
    const undecided = S.legalChecklist(v);
    v.legalForm = 'SCCL';
    const decided = S.legalChecklist(v);
    const first = decided[0].steps[0];
    S.toggleLegalStep(v, first.id);
    const after = S.legalChecklist(v)[0];
    S.toggleLegalStep(v, first.id);
    const undone = S.legalChecklist(v)[0];
    // un tipus sense forma coneguda no ha de petar
    v.legalForm = 'una-cosa-inventada';
    const unknown = S.legalChecklist(v);
    return { undecided: undecided.map(l => l.form), decided: decided.map(l => l.form),
      steps: decided[0].total, afterDone: after.done, afterPct: after.pct,
      undoneDone: undone.done, unknown: unknown.length && unknown[0].total,
      hasReta: decided[0].steps.some(s => /Registre de Cooperatives/i.test(s.label)) };
  }, SETUP);
  ok('undecidedShowsTheOptions', r.undecided.length === 3, 'una cooperativa pot ser ' + r.undecided.join(', '));
  ok('decidedShowsOnlyItsOwn', r.decided.length === 1 && r.decided[0] === 'SCCL', r.decided.join());
  ok('stepsAreReal', r.steps >= 6 && r.hasReta, r.steps + ' passos, amb el Registre de Cooperatives');
  ok('tickingAStepCounts', r.afterDone === 1 && r.afterPct > 0, r.afterPct + '%');
  ok('andItCanBeUnticked', r.undoneDone === 0, 'es pot desmarcar');
  ok('unknownFormIsEmptyNotBroken', r.unknown === 0, 'una forma desconeguda dona zero passos, no un error');
  ok('noErrors3', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 4. Cada etapa té el seu mòdul, i la MATRIU per fi els cita ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { mat, v, lia, noa } = window.__T;
    const byStage = {};
    ['idea', 'prototip', 'validacio', 'graduacio'].forEach(st => { byStage[st] = S.stageModule(st).id; });
    const allExist = Object.values(byStage).every(id => !!S.moduleMeta(id));
    v.stage = 'validacio';
    await S.pushLedger(v.ledger, { id: 'L1', who: 'Noa Ferrer', what: 'Feina', type: 'temps', value: 3, memberId: noa.id, ts: new Date().toISOString() });
    const t0 = S.stageTraining(mat, v);
    S.markTraining(v, lia.id, t0.module.id);
    const t1 = S.stageTraining(mat, v);
    S.markTraining(v, noa.id, t1.module.id);
    const t2 = S.stageTraining(mat, v);
    S.markTraining(v, noa.id, t2.module.id, false);
    const t3 = S.stageTraining(mat, v);
    return { byStage, allExist, module: t0.module.id, title: t0.module.title,
      team: t0.rows.map(x => x.name), pct0: t0.pct, pct1: t1.pct, pct2: t2.pct, pct3: t3.pct,
      leadDone: t1.leadDone };
  }, SETUP);
  ok('everyStageHasItsModule', r.allExist, JSON.stringify(r.byStage));
  ok('validationIsSlicingPie', r.module === 'm6', r.module + ' · ' + r.title);
  ok('theTeamIsWhoActuallyIsThere', r.team.length === 2 && r.team.includes('Lia Bosc') && r.team.includes('Noa Ferrer'),
    'lead + qui ha aportat: ' + r.team.join(', '));
  ok('markingCounts', r.pct0 === 0 && r.pct1 === 50 && r.pct2 === 100, r.pct0 + ' → ' + r.pct1 + ' → ' + r.pct2 + '%');
  ok('andCanBeUnmarked', r.pct3 === 50, 'es pot desmarcar: ' + r.pct3 + '%');
  ok('leadIsTrackedApart', r.leadDone, 'se sap si la lead l\'ha fet');
  ok('noErrors4', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 5. La formació es veu però no bloqueja ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { mat, v, lia, noa } = window.__T;
    // fem la feina que la porta demana de debò
    const sp = S.newSprint(v, { name: 'S1' });
    S.addBacklogItem(sp, { title: 'Tasca' }); S.toggleBacklogItem(sp, sp.items[0].id); sp.status = 'done';
    for (let i = 0; i < 3; i++) await S.pushLedger(v.ledger, { id: 'A' + i, who: 'Lia', what: 'x', type: 'temps', value: 5, memberId: lia.id, ts: new Date().toISOString() });
    for (let i = 0; i < 3; i++) await S.pushLedger(v.ledger, { id: 'B' + i, who: 'Noa', what: 'x', type: 'temps', value: 5, memberId: noa.id, ts: new Date().toISOString() });
    v.revenues = [{ id: 'r1', src: 'Pa', kind: 'venda', price: 3, units: 900 }];
    v.costs = [{ id: 'c1', what: 'Local', kind: 'fix', amount: 800 }, { id: 'c2', what: 'Farina', kind: 'variable', amount: 1 }];
    const rd = S.ventureReadiness(mat, v);
    v.stage = 'validacio';
    await S.graduateVenture(mat, v);
    return { ready: rd.graduateReady, hard: rd.checks.map(c => c.k),
      soft: (rd.soft || []).map(c => c.k + ':' + (c.ok ? 'ok' : 'no')),
      softIsSoft: (rd.soft || []).every(c => c.soft === true),
      graduated: !!v.graduatedNodeId,
      trainingIncomplete: rd.training && rd.training.done < rd.training.total };
  }, SETUP);
  ok('trainingIsListed', r.soft.some(x => /^formacio/.test(x)), r.soft.join());
  ok('trainingIsNotAHardCheck', r.hard.indexOf('formacio') < 0, 'no és a les portes: ' + r.hard.join(', '));
  ok('softIsMarkedAsSoft', r.softIsSoft, 'porta soft:true');
  ok('itGraduatesWithoutTheModule', r.graduated && r.trainingIncomplete,
    'gradua amb la formació a mitges — ningú es queda aturat per una casella pròpia');
  ok('noErrors5', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 6. A la pantalla del projecte ═══
{
  const { ctx, p, errs } = await open({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
  await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { mat, v, d } = window.__T;
    S.addFunding(v, { name: 'Subvenció entitats', kind: 'subvencio', amount: 5000, state: 'presentada', deadline: d(4) });
    v.legalForm = 'SCCL';
    S.render(); S.openVentureDetail(mat, v);
  }, SETUP);
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => ({
    txt: (document.querySelector('.modal') || {}).innerText || '',
    fundCards: document.querySelectorAll('#vdFund .ent-card').length,
    legalSteps: document.querySelectorAll('#vdLegal .cg-st').length,
    trainBtns: document.querySelectorAll('#vdTrain button').length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  ok('fundingBlockIsThere', /finançament i tràmits/i.test(r.txt) && r.fundCards >= 1, r.fundCards + ' convocatòries');
  ok('itShoutsAboutTheDeadline', /venciment/i.test(r.txt) && /4 dies/.test(r.txt), 'avisa dels 4 dies');
  ok('legalStepsAreListed', r.legalSteps >= 6, r.legalSteps + ' tràmits d\'SCCL');
  ok('trainingBlockIsThere', /formació de l'etapa/i.test(r.txt) && r.trainBtns >= 2, r.trainBtns + ' controls');
  ok('itSaysTrainingDoesNotBlock', /no bloqueja la graduació/i.test(r.txt), 'ho diu explícitament');
  ok('noOverflowOnAPhone', r.overflow <= 0, r.overflow + ' px');
  const ticked = await p.evaluate(async () => {
    document.querySelector('#vdLegal .cg-st').click();
    await new Promise(r => setTimeout(r, 400));
    return document.querySelectorAll('#vdLegal .cg-st.done').length;
  });
  ok('tickingWorksFromTheScreen', ticked === 1, ticked + ' pas marcat');
  ok('noErrors6', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 7. Vores ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { mat, v } = window.__T;
    const empty = S.fundingSummary(v);
    const noAlerts = S.fundingAlerts(mat).length;
    S.addFunding(v, { name: 'Sense data ni import' });
    const one = S.fundingSummary(v);
    const gone = S.removeFunding(v, S.fundingOf(v)[0].id);
    const missing = S.setFundingState(v, 'no-existeix', 'concedida');
    const badState = S.addFunding(v, { name: 'Estat inventat', state: 'zzz' });
    const emptyTrain = S.stageTraining(mat, { stage: 'idea', ledger: [] });
    return { emptyTotal: empty.total, emptyProper: empty.proper, noAlerts,
      oneNoDate: one.venciments.length, removed: gone, missing,
      badState: badState.state, emptyTrainTotal: emptyTrain.total, emptyTrainPct: emptyTrain.pct };
  }, SETUP);
  ok('emptyPipelineIsZero', r.emptyTotal === 0 && r.emptyProper === null && r.noAlerts === 0, 'res apuntat, res que avisi');
  ok('noDateNoDeadline', r.oneNoDate === 0, 'una convocatòria sense data no genera venciment fals');
  ok('removingWorks', r.removed, 'es pot esborrar');
  ok('unknownIdIsNull', r.missing === null, 'canviar l\'estat d\'una que no hi és retorna null');
  ok('badStateFallsBack', r.badState === 'preparant', 'un estat inventat cau al primer, no trenca');
  ok('ventureWithoutTeamIsZero', r.emptyTrainTotal === 0 && r.emptyTrainPct === 0, 'sense equip, 0% i no NaN');
  ok('noErrors7', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

await b.close();
const failed = Object.entries(results).filter(([, v]) => !v).map(([k]) => k);
console.log('\n' + (failed.length ? '❌ FAILED (' + failed.length + '): ' + failed.join(', ') : '✅ ALL PASSED (' + Object.keys(results).length + ')'));
process.exit(failed.length ? 1 : 0);
