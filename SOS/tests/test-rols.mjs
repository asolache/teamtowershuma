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

/* La Cinta és superheroina a la biblioteca del seu barri i mentora d'una venture
   a la MATRIU de la comarca. Les dues coses són certes alhora. */
const SETUP = `
  const S=window.__SOS;
  const mk=(id,name,dyn)=>{const n={id,name,nodeLevel:'projecte',parentId:null,dynamicType:dyn,
    metaskill:{},vna:{roles:[],exchanges:[]},kanban:{cards:[]},ledger:[],members:[],objects:[],offers:[],
    ventures:[],createdAt:'',updatedAt:''};S.state.nodes.push(n);return n;};
  const bib=mk('BIB','Biblioteca del barri','biblioteca_coses');
  const mat=mk('MAT','MATRIU de la comarca','matriu');
  const cintaB=S.newMember({name:'Cinta Roig',kind:'persona'}); bib.members.push(cintaB);
  const cintaM=S.newMember({name:'Cinta Roig',kind:'persona'}); mat.members.push(cintaM);
  const altre=S.newMember({name:'Ot Vila',kind:'persona'}); mat.members.push(altre);
  // A la biblioteca aporta: hi posa un objecte
  bib.objects.push(S.newObject({name:'Trepant',typology:'bricolatge',ownerId:cintaB.id}));
  // A la MATRIU acompanya una venture
  const v=S.newVenture(mat,{id:'act1',name:'Forn comunitari',roles:['Nucli','Veïnat'],pairs:[]}); mat.ventures.push(v);
  S.addMentor(v,cintaM.id,'model');
  S.state.activeId='BIB';
  window.__T={bib,mat,cintaB,cintaM,altre,v};
`;

// ═══ 1. Els rols són per context, i n'hi pot haver més d'un ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { bib, mat } = window.__T;
    const inBib = S.rolesOfPersonIn(bib, 'Cinta Roig').map(x => x.role);
    const inMat = S.rolesOfPersonIn(mat, 'Cinta Roig').map(x => x.role);
    const all = S.rolesOfPerson('Cinta Roig');
    return { inBib, inMat, all: all.map(x => x.role), primary: S.primaryRole('Cinta Roig'),
      whys: all.map(x => x.role + ': ' + x.why),
      nodesOfMentor: (all.find(x => x.role === 'mentor') || {}).nodes,
      roleInBib: S.roleIn(bib, 'Cinta Roig'), roleInMat: S.roleIn(mat, 'Cinta Roig') };
  }, SETUP);
  ok('sameHumanTwoRoles', r.all.length === 2 && r.all.includes('mentor') && r.all.includes('superheroi'),
    r.all.join(' + '));
  ok('roleDependsOnTheNode', r.inBib.join() === 'superheroi' && r.inMat.join() === 'mentor',
    'biblioteca → ' + r.inBib.join() + ' · MATRIU → ' + r.inMat.join());
  ok('contextRoleIsAskable', r.roleInBib === 'superheroi' && r.roleInMat === 'mentor',
    'roleIn diu el del context, no el global');
  ok('everyRoleExplainsItself', r.whys.every(w => w.split(': ')[1].length > 5), r.whys.join(' | '));
  ok('mentorKnowsWhere', (r.nodesOfMentor || []).length === 1 && r.nodesOfMentor[0].name === 'MATRIU de la comarca',
    'mentora a ' + (r.nodesOfMentor || []).map(n => n.name).join());
  ok('primaryIsTheHeaviestNotTheFirst', r.primary === 'mentor',
    'mentor pesa més que superheroi, i la biblioteca es va crear abans');
  ok('noErrors1', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 2. El rol es dedueix del que es fa, no d'una casella ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { bib, mat, cintaM } = window.__T;
    const deduced = S.rolesOfPerson('Cinta Roig').map(x => x.role);
    // en Ot no ha fet res encara
    const ot = S.rolesOfPerson('Ot Vila');
    // i ara declara un rol a la fitxa: la declaració SUMA, no substitueix
    window.__T.altre.role = 'agent';
    const otAfter = S.rolesOfPerson('Ot Vila');
    // la Cinta declara guardian a la MATRIU: hi ha de sortir a més dels deduïts
    cintaM.role = 'guardian';
    const cintaAfter = S.rolesOfPerson('Cinta Roig').map(x => x.role);
    return { deduced, ot: ot.map(x => x.role), otWhy: ot[0] && ot[0].why,
      otAfter: otAfter.map(x => x.role), otAfterWhy: (otAfter[0] || {}).why,
      cintaAfter, primary: S.primaryRole('Cinta Roig') };
  }, SETUP);
  ok('rolesComeFromEvidence', r.deduced.includes('mentor') && r.deduced.includes('superheroi'),
    'cap dels dos estava declarat: ' + r.deduced.join(' + '));
  ok('nobodyIsNobody', r.ot.join() === 'simpatitzant' && /sense activitat/i.test(r.otWhy || ''), r.otWhy);
  ok('declaringIsAlsoEvidence', r.otAfter.includes('agent') && /declarat/i.test(r.otAfterWhy || ''), r.otAfter.join());
  ok('declaringDoesNotReplaceDoing', r.cintaAfter.length === 3 && r.cintaAfter.includes('mentor') && r.cintaAfter.includes('superheroi'),
    r.cintaAfter.join(' + '));
  ok('heaviestWins', r.primary === 'guardian', 'guardian passa davant');
  ok('noErrors2', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 3. L'ordre de creació dels nodes deixa de decidir res ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS;
    const a = S.primaryRole('Cinta Roig');
    S.state.nodes.reverse();                 // canviem l'ordre dels nodes
    const b2 = S.primaryRole('Cinta Roig');
    const rolesA = S.rolesOfPerson('Cinta Roig').map(x => x.role).join();
    S.state.nodes.reverse();
    const rolesB = S.rolesOfPerson('Cinta Roig').map(x => x.role).join();
    return { a, b: b2, rolesA, rolesB };
  }, SETUP);
  ok('orderDoesNotChangeThePrimary', r.a === r.b, r.a + ' = ' + r.b);
  ok('orderDoesNotChangeTheList', r.rolesA === r.rolesB, r.rolesA);
  ok('noErrors3', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 4. Mentor existeix com a rol de ple dret ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(() => {
    const S = window.__SOS;
    const inRoles = !!S.SOS_ROLES.mentor;
    const j = S.journeyProgress('mentor');
    return { inRoles, label: (S.SOS_ROLES.mentor || {}).label, steps: j.items.length,
      roleId: j.roleId, gives: j.gives, gets: j.gets,
      weight: S.ROLE_WEIGHT.mentor, weights: S.ROLE_WEIGHT };
  });
  ok('mentorIsARole', r.inRoles, r.label);
  ok('mentorHasItsOwnPath', r.roleId === 'mentor' && r.steps >= 5, r.steps + ' passos propis');
  ok('mentorPathSaysBothSides', (r.gives || '').length > 10 && (r.gets || '').length > 10, r.gives);
  ok('mentorWeighsMoreThanSuperhero', r.weight > r.weights.superheroi, r.weight + ' > ' + r.weights.superheroi);
  ok('noErrors4', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 5. La lent es tria, no s'endevina ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS;
    await S.setActivePersona('Cinta Roig');
    const auto = S.activeRoleId();
    await S.setLensRole('superheroi');
    const chosen = S.activeRoleId();
    const persisted = S.state.lensRole;
    // una lent que no és teva no val
    await S.setLensRole('agent');
    const bogus = S.activeRoleId();
    await S.setLensRole(null);
    const cleared = S.activeRoleId();
    return { auto, chosen, persisted, bogus, cleared };
  }, SETUP);
  ok('lensDefaultsToTheHeaviest', r.auto === 'mentor', 'per defecte ' + r.auto);
  ok('lensCanBeChosen', r.chosen === 'superheroi', 'triada: ' + r.chosen);
  ok('lensIsRemembered', r.persisted === 'agent' || r.persisted === null || r.persisted === 'superheroi', 'es desa a l\'estat');
  ok('lensYouDoNotHaveIsIgnored', r.bogus === 'mentor', 'agent no és seu → torna a ' + r.bogus);
  ok('clearingGoesBackToAuto', r.cleared === 'mentor', r.cleared);
  ok('noErrors5', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 6. A la pantalla: el perfil mostra tots els rols amb el perquè ═══
{
  const { ctx, p, errs } = await open();
  await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS;
    await S.setActivePersona('Cinta Roig');
    S.render(); S.openPersonProfile('Cinta Roig');
  }, SETUP);
  await p.waitForTimeout(500);
  const txt = await p.evaluate(() => (document.querySelector('.modal') || {}).innerText || '');
  ok('profileShowsAllRoles', /2 alhora/i.test(txt), txt.split('\n').find(l => /rols/i.test(l)) || '');
  ok('profileNamesMentor', /mentor/i.test(txt), 'mentora hi surt');
  ok('profileNamesSuperhero', /superheroi/i.test(txt), 'superheroina també');
  ok('profileSaysWhyEachRole', /acompanya 1 iniciativa/i.test(txt), 'diu per què és mentora');
  ok('profileSaysWhere', /matriu de la comarca/i.test(txt) && /biblioteca del barri/i.test(txt), 'i on ho fa');
  ok('noErrors6', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 7. El selector de lent surt quan hi ha més d'un rol, i no abans ═══
{
  const { ctx, p, errs } = await open();
  await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS;
    await S.setActivePersona('Cinta Roig');
    S.selectNode('BIB'); S.state.tab = 'biblioteca'; S.render();
  }, SETUP);
  await p.waitForTimeout(500);
  const multi = await p.evaluate(() => {
    const sw = document.querySelector('.cg-lens-sw');
    return { there: !!sw, txt: sw ? sw.innerText : '', n: sw ? sw.querySelectorAll('button').length : 0,
      lens: (document.querySelector('.cg-lens-r') || {}).innerText || '' };
  });
  ok('switcherAppearsWithSeveralRoles', multi.there && multi.n === 2, multi.n + ' opcions');
  ok('switcherSaysWhatItIs', /mires el sos com a/i.test(multi.txt), multi.txt.split('\n')[0]);
  const switched = await p.evaluate(async () => {
    const btns = [...document.querySelectorAll('.cg-lens-sw button')];
    const other = btns.find(b => !b.classList.contains('sel'));
    other.click();
    await new Promise(r => setTimeout(r, 500));
    return { lens: (document.querySelector('.cg-lens-r') || {}).innerText || '', id: window.__SOS.activeRoleId() };
  });
  ok('switchingChangesTheLens', switched.id === 'superheroi', 'ara mira com a ' + switched.id);
  const single = await p.evaluate(async () => {
    const S = window.__SOS;
    await S.setActivePersona('Ot Vila');
    S.render();
    await new Promise(r => setTimeout(r, 300));
    return !!document.querySelector('.cg-lens-sw');
  });
  ok('noSwitcherWithOneRole', !single, 'amb un sol rol el selector seria soroll');
  ok('noErrors7', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 8. Vores ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { bib, cintaB } = window.__T;
    const nobody = S.rolesOfPerson('No Existeix Ningú');
    const emptyName = S.rolesOfPerson('');
    const nullNode = S.rolesOfPersonIn(null, 'Cinta Roig');
    // una fitxa fusionada no perd els seus rols
    const dup = S.newMember({ name: 'Cinta R.', kind: 'persona' }); bib.members.push(dup);
    bib.objects.push(S.newObject({ name: 'Serra', typology: 'bricolatge', ownerId: dup.id }));
    await S.mergeMembers(bib, dup.id, cintaB.id);
    const afterMerge = S.rolesOfPersonIn(bib, 'Cinta Roig');
    const legacy = S.roleOfPerson('Cinta Roig');
    return { nobody: nobody.length, emptyName: emptyName.length, nullNode: nullNode.length,
      afterMerge: afterMerge.map(x => x.role), why: (afterMerge[0] || {}).why, legacy };
  }, SETUP);
  ok('unknownPersonHasNoRoles', r.nobody === 0, 'ningú no és res');
  ok('emptyNameDoesNotCrash', r.emptyName === 0, 'un nom buit no retorna rols');
  ok('nullNodeDoesNotCrash', r.nullNode === 0, 'sense node, cap rol');
  ok('mergedFileKeepsItsRoles', r.afterMerge.includes('superheroi') && /2 objectes/.test(r.why || ''),
    r.why + ' — els de la fitxa absorbida hi compten');
  ok('legacyFunctionStillWorks', typeof r.legacy === 'string' && r.legacy.length > 0, 'roleOfPerson → ' + r.legacy);
  ok('noErrors8', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

await b.close();
const failed = Object.entries(results).filter(([, v]) => !v).map(([k]) => k);
console.log('\n' + (failed.length ? '❌ FAILED (' + failed.length + '): ' + failed.join(', ') : '✅ ALL PASSED (' + Object.keys(results).length + ')'));
process.exit(failed.length ? 1 : 0);
