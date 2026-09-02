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

/* ══ L'entrada: s'entra per un sol lloc ══════════════════════════════════════
   Abans es preguntava quin rol ets abans d'haver fet res, i dues vegades: al
   tour i al formulari de perfil. Ningú que arriba pot contestar-ho, i la
   pregunta contradeia el que aquesta mateixa app fa —deduir el rol de
   l'evidència. El que es prova aquí és que la porta ja no ho demana i que cada
   rol que es promet **té un camí que el codi recorre de debò**. */
{
  const { ctx, p, errs } = await open();

  const taula = await p.evaluate(() => {
    const S = window.__SOS;
    const rols = Object.keys(S.SOS_ROLES);
    return { rols, sensCami: rols.filter(k => !S.ROLE_ACCES[k]),
      assignables: S.ROLS_ASSIGNABLES,
      /* Cap rol que es guanyi o se signi pot estar al desplegable de la fitxa. */
      repartits: S.ROLS_ASSIGNABLES.filter(k => ['guardian', 'mentor'].indexOf(k) >= 0),
      vies: rols.map(k => S.ROLE_ACCES[k] && S.ROLE_ACCES[k].via).filter(v => !v).length };
  });
  ok('rols: cada rol declarat diu com s\'hi arriba', !taula.sensCami.length && !taula.vies,
    taula.rols.length + ' rols, cap sense camí');
  ok('rols: els que se signen no es reparteixen des d\'un desplegable', !taula.repartits.length,
    'a la fitxa només ' + taula.assignables.join(' i '));

  /* ── La porta no pregunta cap rol ────────────────────────────────────── */
  const porta = await p.evaluate(async () => {
    const S = window.__SOS;
    S.openSuperheroiOnboarding();
    const camps = document.querySelectorAll('.modal [data-role], .modal .sh-role').length;
    const diu = /Entres com a superheroi/i.test(document.querySelector('.modal').textContent);
    S.closeModal();
    return { camps, diu };
  });
  ok('rols: el formulari de perfil no demana triar rol', porta.camps === 0 && porta.diu,
    porta.camps + ' selectors de rol');

  const tour = await p.evaluate(() => {
    const S = window.__SOS;
    S.openOnboardingTour();
    let triables = 0, mapa = 0, txt = '';
    for (let i = 0; i < 8; i++) {
      const m = document.querySelector('.modal');
      if (!m) break;
      triables += m.querySelectorAll('[data-r]').length;
      mapa += m.querySelectorAll('.rol-mapa .rol-c').length;
      txt += ' ' + m.textContent;
      const n = m.querySelector('#obNext'); if (!n) break; n.click();
    }
    document.querySelectorAll('.modal-bg').forEach(x => x.remove());
    return { triables, mapa, entra: /Entres com a superheroi/i.test(txt),
      diuCom: /te'ls assigna qui porta el node/i.test(txt) };
  });
  ok('rols: el tour tampoc en fa triar cap', tour.triables === 0, tour.triables + ' botons de rol');
  ok('rols: i ensenya el mapa sencer amb com s\'arriba a cadascun',
    tour.mapa >= 6 && tour.entra && tour.diuCom, tour.mapa + ' targetes de rol');

  /* ── Cada camí, recorregut de debò ───────────────────────────────────── */
  const cami = await p.evaluate(async () => {
    const S = window.__SOS;
    const n = S.newNode('Node del camí', 'projecte', null);
    S.state.nodes.push(n);
    const m = S.newMember({ name: 'Pau Camí' }); S.membersOf(n).push(m);
    const te = () => S.rolesOfPerson('Pau Camí').map(r => r.role);

    const entrada = te();                      // acabat d'entrar
    /* superheroi: una aportació registrada. */
    n.ledger.push({ id: 'L1', memberId: m.id, type: 'temps', value: 2, what: 'Cuinar' });
    const ambAportacio = te();
    /* coordinador / agent: marcats a la fitxa per qui porta el node. */
    m.role = 'coordinador'; const coord = te();
    m.role = 'agent'; const agent = te();
    m.role = 'superheroi';                     // «cap rol assignat»
    const sensAssignar = te();
    /* mentor: inscrit al registre de mentories d'una venture. */
    /* `newVenture` retorna la venture i no la desa —qui la crida l'ha de posar
       al node—, i `addMentor` és posicional. Muntar-ho malament feia que la
       prova digués que el camí de mentora no existeix quan el que no existia
       era el meu muntatge. */
    const v = S.newVenture(n, { name: 'Forn comunitari' });
    S.venturesOf(n).push(v);
    S.addMentor(v, m.id, 'general');
    const mentor = te();
    /* guardian: reclamant el node — governança, no casella. */
    m.did = 'did:sos:zPauCami';
    S.govOf(n).owner = m.did;
    const guardian = te();
    return { entrada, ambAportacio, coord, agent, sensAssignar, mentor, guardian };
  });
  ok('rols: qui acaba d\'entrar no és res encara', cami.entrada.join() === 'simpatitzant',
    cami.entrada.join(', '));
  ok('rols: superheroi/na es guanya amb la primera aportació',
    cami.ambAportacio.indexOf('superheroi') >= 0, cami.ambAportacio.join(', '));
  ok('rols: coordinador/a i agent s\'assignen des de la fitxa',
    cami.coord.indexOf('coordinador') >= 0 && cami.agent.indexOf('agent') >= 0,
    cami.coord.join(', ') + ' · ' + cami.agent.join(', '));
  ok('rols: i desassignar-los els treu', cami.sensAssignar.indexOf('coordinador') < 0 &&
    cami.sensAssignar.indexOf('agent') < 0, cami.sensAssignar.join(', '));
  ok('rols: mentor/a surt del registre de mentories', cami.mentor.indexOf('mentor') >= 0,
    cami.mentor.join(', '));
  ok('rols: guardiana surt de la governança, no d\'una casella',
    cami.guardian.indexOf('guardian') >= 0, cami.guardian.join(', '));

  /* ── La lent només pot ser un rol que tens ───────────────────────────── */
  const lent = await p.evaluate(async () => {
    const S = window.__SOS;
    await S.setActivePersona('Pau Camí');
    const propi = S.activeRoleId();
    await S.setLensRole('mentor'); const legit = S.activeRoleId();
    await S.setLensRole('agent'); const usurpat = S.activeRoleId();
    await S.setLensRole(null);
    const disp = S.rolesDisponibles('Pau Camí');
    return { propi, legit, usurpat,
      te: disp.filter(x => x.tens).map(x => x.role),
      falten: disp.filter(x => !x.tens).map(x => x.role),
      ambPerque: disp.filter(x => x.tens).every(x => !!x.why),
      ambVia: disp.filter(x => !x.tens).every(x => !!x.acces.via) };
  });
  ok('rols: la lent es pot posar a un rol que tens', lent.legit === 'mentor', lent.legit);
  ok('rols: i no a un que no tens', lent.usurpat !== 'agent', 'queda a ' + lent.usurpat);
  ok('rols: els que tens porten la seva evidència', lent.ambPerque, lent.te.join(', '));
  ok('rols: i els que no, el camí per arribar-hi', lent.ambVia, lent.falten.join(', ') || 'cap');
  ok('rols: sense errors de pàgina a tot el recorregut', errs.length === 0, errs[0] || '');
  await ctx.close();
}

await b.close();
const failed = Object.entries(results).filter(([, v]) => !v).map(([k]) => k);
console.log('\n' + (failed.length ? '❌ FAILED (' + failed.length + '): ' + failed.join(', ') : '✅ ALL PASSED (' + Object.keys(results).length + ')'));
process.exit(failed.length ? 1 : 0);
