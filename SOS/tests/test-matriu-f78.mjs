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
  const lia=S.newMember({name:'Lia Bosc',kind:'persona'}); mat.members.push(lia);
  const mkV=(id,name)=>{const v=S.newVenture(mat,{id,name,roles:['A','B'],pairs:[]});mat.ventures.push(v);return v;};
  const v=mkV('a1','Forn comunitari');
  const ago=m=>new Date(Date.now()-m*30.44*864e5).toISOString();
  window.__T={terr,mat,v,lia,mkV,ago};
`;

// ═══ 1. Abans de graduar no hi ha res a seguir ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { mat, v } = window.__T;
    const pg = S.postGradReviews(v);
    const sv = S.survivalRate(mat);
    let err = '';
    try { S.addReview(v, { months: 3, alive: true }); } catch (e) { err = e.msg || ''; }
    return { graduated: pg.graduated, rows: pg.rows.length, sv, err };
  }, SETUP);
  ok('nothingToFollowBeforeGraduating', !r.graduated && r.rows === 0, 'cap revisió');
  ok('cannotReviewWhatHasNotGraduated', /encara no ha graduat/i.test(r.err), r.err);
  ok('survivalIsUnknownNotZero', r.sv.taxa === null && r.sv.graduades === 0,
    'taxa=' + r.sv.taxa + ' · ' + r.sv.why);
  ok('noErrors1', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 2. Les revisions vencen amb el temps, no abans ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { v, ago } = window.__T;
    v.graduatedAt = ago(1); v.graduatedNodeId = 'nou';
    const m1 = S.postGradReviews(v);
    v.graduatedAt = ago(4);
    const m4 = S.postGradReviews(v);
    v.graduatedAt = ago(13);
    const m13 = S.postGradReviews(v);
    return { m1: m1.due.map(x => x.months), m4: m4.due.map(x => x.months), m13: m13.due.map(x => x.months),
      months: m13.months, dueAt: m1.rows[0].dueAt };
  }, SETUP);
  ok('nothingDueAtOneMonth', r.m1.length === 0, 'al mes no es pregunta res: no informaria');
  ok('threeMonthsBecomesDue', r.m4.join() === '3', 'als 4 mesos toca la de 3');
  ok('allThreeDueAfterAYear', r.m13.join() === '3,6,12', 'als 13 mesos toquen les tres');
  ok('itSaysWhenEachIsDue', /^\d{4}-\d{2}-\d{2}$/.test(r.dueAt), 'data prevista: ' + r.dueAt);
  ok('noErrors2', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 3. La resposta la posa una persona, no el registre ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { mat, v, ago } = window.__T;
    v.graduatedAt = ago(13); v.graduatedNodeId = 'nou';
    S.addReview(v, { months: 3, alive: true, grew: false, note: 'Va costar arrencar' });
    S.addReview(v, { months: 6, alive: true, grew: true });
    const before = S.survivalRate(mat);
    // es pot corregir una revisió: rectificar no és falsejar
    S.addReview(v, { months: 6, alive: false, note: 'Van plegar al setembre' });
    const after = S.survivalRate(mat);
    let bad = '';
    try { S.addReview(v, { months: 9, alive: true }); } catch (e) { bad = e.msg || ''; }
    return { n: S.reviewsOf(v).length, before: before.taxa, after: after.taxa,
      lastWins: S.postGradReviews(v).last.months, bad,
      grew: after.creixen, alive: after.vives };
  }, SETUP);
  ok('reviewsAreStored', r.n === 2, r.n + ' revisions, una per fita');
  ok('itCanBeCorrected', r.before === 100 && r.after === 0, r.before + '% → ' + r.after + '%');
  ok('theLatestReviewDecides', r.lastWins === 6 && r.alive === 0, 'mana la de 6 mesos, la més recent');
  /* Corregir una revisió la **substitueix sencera**: és la resposta a la
     pregunta d'aquell moment, i la nova resposta mana. No es barregen trossos
     de dues respostes diferents. */
  ok('correctingReplacesTheWholeAnswer', r.grew === 0,
    'la correcció substitueix la resposta sencera, no només el tros que canvies');
  ok('onlyTheThreeMilestones', /3, 6 i 12/.test(r.bad), r.bad);
  ok('noErrors3', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 4. La taxa és de la incubadora, i només sobre el que s'ha mirat ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { mat, mkV, ago } = window.__T;
    const a = mkV('v1', 'Viva'), c = mkV('v2', 'Morta'), d = mkV('v3', 'Recent');
    [a, c].forEach(x => { x.graduatedAt = ago(13); x.graduatedNodeId = 'n' + x.id; });
    d.graduatedAt = ago(1); d.graduatedNodeId = 'n3';
    S.addReview(a, { months: 12, alive: true, grew: true });
    S.addReview(c, { months: 12, alive: false });
    const sv = S.survivalRate(mat);
    return { graduades: sv.graduades, revisades: sv.revisades, vives: sv.vives,
      taxa: sv.taxa, pendents: sv.pendents, why: sv.why };
  }, SETUP);
  ok('recentGraduateDoesNotInflate', r.graduades === 3 && r.revisades === 2,
    r.graduades + ' graduades · ' + r.revisades + ' revisades');
  ok('rateIsOverReviewedOnly', r.taxa === 50, r.taxa + '% — ' + r.why);
  /* Revisar als 12 mesos respon millor que la dels 3 que ningú va fer: les
     fites passades queden supersedides i deixen de reclamar-se. */
  ok('laterReviewSupersedesTheOnesMissed', r.pendents === 0,
    r.pendents + ' pendents: qui ha revisat als 12 no ha d\'inventar-se la dels 3');
  ok('noErrors4', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 5. Evidències: hash sempre, i el fitxer no viatja ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { mat, v } = window.__T;
    const sp = S.newSprint(v, { name: 'S1' });
    const it = S.addBacklogItem(sp, { title: 'Obrir el local' });
    S.toggleBacklogItem(sp, it.id);
    const link = await S.addEvidence(it, { kind: 'enllac', url: 'https://exemple.cat/acta.pdf' });
    const note = await S.addEvidence(it, { kind: 'nota', text: 'Acta signada per les cinc sòcies' });
    const file = await S.addEvidence(it, { kind: 'fitxer', label: 'Foto',
      file: new File([new Uint8Array([1, 2, 3, 4])], 'foto.png', { type: 'image/png' }) });
    let badUrl = '', emptyNote = '', noFile = '';
    try { await S.addEvidence(it, { kind: 'enllac', url: 'exemple.cat' }); } catch (e) { badUrl = e.msg || ''; }
    try { await S.addEvidence(it, { kind: 'nota', text: '   ' }); } catch (e) { emptyNote = e.msg || ''; }
    try { await S.addEvidence(it, { kind: 'fitxer' }); } catch (e) { noFile = e.msg || ''; }
    const all = await window.__SOS.state && null;
    const blob = await S.loadEvidenceBlob(file);
    const inNode = JSON.stringify(v).includes('AQIDBA');
    return { n: S.evidenceOf(it).length, hashes: S.evidenceOf(it).map(e => !!e.hash),
      linkHash: link.hash, sameHash: link.hash === (await S.sha256('https://exemple.cat/acta.pdf')),
      fileHasNoData: file.data === undefined && !!file.blobId,
      blobSize: blob ? blob.size : 0, inNode, badUrl, emptyNote, noFile,
      labelFallback: note.label };
  }, SETUP);
  ok('everyEvidenceHasAHash', r.n === 3 && r.hashes.every(Boolean), r.n + ' proves, totes amb hash');
  ok('hashIsOfTheContent', r.sameHash, 'el hash de l\'enllaç és el del text de l\'enllaç');
  ok('fileStaysOutOfTheNode', r.fileHasNoData && !r.inNode, 'al backlog només hi ha el hash i el nom');
  ok('butTheFileIsRecoverable', r.blobSize === 4, r.blobSize + ' bytes recuperats d\'IndexedDB');
  ok('aLinkMustBeALink', /http:\/\/ o https:\/\//.test(r.badUrl), r.badUrl);
  ok('anEmptyNoteIsNotAProof', /nota buida no és una prova/i.test(r.emptyNote), r.emptyNote);
  ok('aFileEvidenceNeedsAFile', /tria un fitxer/i.test(r.noFile), r.noFile);
  ok('labelFallsBackToContent', /acta signada/i.test(r.labelFallback || ''), r.labelFallback);
  ok('noErrors5', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 6. La cobertura es mira sobre el que està fet, i no bloqueja ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { mat, v, lia } = window.__T;
    const sp = S.newSprint(v, { name: 'S1' });
    const a = S.addBacklogItem(sp, { title: 'Fet amb prova' });
    const c = S.addBacklogItem(sp, { title: 'Fet sense prova' });
    const d = S.addBacklogItem(sp, { title: 'Per fer' });
    S.toggleBacklogItem(sp, a.id); S.toggleBacklogItem(sp, c.id);
    await S.addEvidence(a, { kind: 'nota', text: 'Aquí està' });
    const cov = S.evidenceCoverage(v);
    // i ara la porta: ha de graduar igualment
    v.leadMemberId = lia.id; sp.status = 'done';
    const m2 = S.newMember({ name: 'Company', kind: 'persona' }); S.membersOf(mat).push(m2);
    for (let i = 0; i < 3; i++) await S.pushLedger(v.ledger, { id: 'A' + i, who: 'Lia', what: 'x', type: 'temps', value: 5, memberId: lia.id, ts: new Date().toISOString() });
    for (let i = 0; i < 3; i++) await S.pushLedger(v.ledger, { id: 'B' + i, who: 'C', what: 'x', type: 'temps', value: 5, memberId: m2.id, ts: new Date().toISOString() });
    const rd = S.ventureReadiness(mat, v);
    v.stage = 'validacio';
    await S.graduateVenture(mat, v);
    return { done: cov.done, amb: cov.amb, pct: cov.pct, sense: cov.sense.map(x => x.title),
      softKeys: (rd.soft || []).map(x => x.k), hardKeys: rd.checks.map(x => x.k),
      graduated: !!v.graduatedNodeId, evOk: (rd.soft || []).find(x => x.k === 'evidencia').ok };
  }, SETUP);
  ok('coverageIgnoresUndoneItems', r.done === 2, r.done + ' items fets de 3');
  ok('coverageCountsProofs', r.amb === 1 && r.pct === 50, r.pct + '%');
  ok('itNamesWhatIsMissing', r.sense.join() === 'Fet sense prova', r.sense.join());
  ok('evidenceIsSoft', r.softKeys.includes('evidencia') && !r.hardKeys.includes('evidencia'),
    'soft: ' + r.softKeys.join(',') + ' · portes: ' + r.hardKeys.join(','));
  ok('itGraduatesWithoutFullProof', r.graduated && !r.evOk,
    'gradua amb el 50% de proves — demanar-la com a porta convidaria a adjuntar qualsevol cosa');
  ok('noErrors6', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 7. A la pantalla ═══
{
  const { ctx, p, errs } = await open({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
  await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { mat, v, ago } = window.__T;
    v.graduatedAt = ago(7); v.graduatedNodeId = 'T';
    const sp = S.newSprint(v, { name: 'S1' });
    const it = S.addBacklogItem(sp, { title: 'Obrir el local' });
    S.toggleBacklogItem(sp, it.id);
    await S.addEvidence(it, { kind: 'enllac', label: 'Acta', url: 'https://exemple.cat/a.pdf' });
    S.state.tab = 'cartera'; S.render(); S.openVentureDetail(mat, v);
  }, SETUP);
  await p.waitForTimeout(700);
  const rev = await p.evaluate(async () => {
    const S = window.__SOS, v = S.venturesOf(S.byId('M'))[0];
    S.openReviewForm(S.byId('M'), v, 6);
    await new Promise(r => setTimeout(r, 400));
    const t = (document.querySelector('.modal') || {}).innerText || '';
    S.closeModal();
    S.openVentureDetail(S.byId('M'), v);
    await new Promise(r => setTimeout(r, 400));
    return t;
  });
  const r = await p.evaluate(() => ({
    txt: (document.querySelector('.modal') || {}).innerText || '',
    postCards: document.querySelectorAll('#vdPost .ent-card').length,
    evBadges: document.querySelectorAll('.sp-ev .ent-b').length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  ok('postGradBlockIsThere', /després de graduar/i.test(r.txt) && r.postCards >= 3, r.postCards + ' targetes');
  ok('itSaysWhichReviewIsDue', /toca fer-la/i.test(r.txt), 'diu la que toca');
  ok('itSaysItIsNotDeducible', /no es dedueix del registre/i.test(rev) && /ledger quiet i estar viu/i.test(rev),
    'la pantalla de revisió diu per què ho ha de mirar una persona');
  ok('evidenceShowsOnTheItem', r.evBadges === 1, r.evBadges + ' prova visible al backlog');
  ok('noOverflowOnAPhone', r.overflow <= 0, r.overflow + ' px');
  const survival = await p.evaluate(async () => {
    window.__SOS.closeModal();
    const S = window.__SOS;
    S.addReview(S.venturesOf(S.byId('M'))[0], { months: 6, alive: true, grew: true });
    S.state.tab = 'cartera'; S.renderWorkspace ? S.renderWorkspace() : S.render();
    await new Promise(r => setTimeout(r, 400));
    return document.querySelector('#workspace').innerText;
  });
  ok('survivalPanelIsInTheCartera', /després de graduar · com li va a la matriu/i.test(survival),
    'panell de supervivència');
  ok('itExplainsWhyTheRateIsPartial', /només sobre les revisades/i.test(survival), 'diu sobre què es calcula');
  ok('noErrors7', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

await b.close();
const failed = Object.entries(results).filter(([, v]) => !v).map(([k]) => k);
console.log('\n' + (failed.length ? '❌ FAILED (' + failed.length + '): ' + failed.join(', ') : '✅ ALL PASSED (' + Object.keys(results).length + ')'));
process.exit(failed.length ? 1 : 0);
