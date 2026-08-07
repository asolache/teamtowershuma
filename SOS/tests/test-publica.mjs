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

/* Manresa, un banc de temps i una biblioteca. Amb noms, telèfons i títols
   lliures que contenen exactament el que no pot sortir mai. */
const SETUP = `
  const S=window.__SOS;
  const muni={id:'MAN',name:'Manresa',nodeLevel:'municipi',parentId:null,dynamicType:'',
    metaskill:{},vna:{roles:[],exchanges:[]},kanban:{cards:[]},ledger:[],members:[],objects:[],offers:[],
    lat:41.7286,lon:1.8236,createdAt:'',updatedAt:''};
  S.state.nodes.push(muni);
  const mk=(id,name,dyn)=>{const n={id,name,nodeLevel:'projecte',parentId:'MAN',dynamicType:dyn,
    metaskill:{},vna:{roles:[],exchanges:[]},kanban:{cards:[]},ledger:[],members:[],objects:[],offers:[],
    createdAt:'',updatedAt:''};S.state.nodes.push(n);return n;};
  const bt=mk('BT','Banc de temps del Barri Antic','banc_temps');
  const bib=mk('BIB','Biblioteca de les coses de Manresa','biblioteca_coses');
  const berta=S.newMember({name:'Berta Solanes',kind:'persona',phone:'600112233',email:'berta@example.cat'});
  const quim=S.newMember({name:'Quim Ferrer',kind:'persona',phone:'600445566'});
  bt.members.push(berta,quim); bib.members.push(berta);
  bt.offers.push(S.newOffer({kind:'oferta',title:'Fusteria a casa de la Berta Solanes',category:'reparacions',memberId:berta.id}));
  bt.offers.push(S.newOffer({kind:'oferta',title:'Arreglo mobles',category:'reparacions',memberId:quim.id}));
  bt.offers.push(S.newOffer({kind:'demanda',title:'Necessito classes de català',category:'idiomes',memberId:quim.id}));
  const tr=S.newObject({name:'Trepant d\\'en Quim Ferrer',typology:'bricolatge',ownerId:berta.id});
  bib.objects.push(tr);
  bt.ledger.push({id:'L1',who:'Berta Solanes',what:'Fusteria per a Quim Ferrer',type:'temps',value:2,memberId:berta.id,ts:new Date().toISOString()});
  S.state.activeId='BT';
  window.__T={muni,bt,bib,berta,quim,tr};
`;

// ═══ 1. Deny by default: sense demanar-ho, no surt res ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { bt } = window.__T;
    const empty = S.supplyPublicPack();
    const scope = S.publishScopeOf(bt);
    const anyOn = S.state.nodes.filter(n => S.publishesAnything(n)).length;
    return { count: empty.count, nodes: empty.nodes, rows: empty.supply.length,
      scope, anyOn, type: empty['@type'] };
  }, SETUP);
  ok('nothingLeavesByDefault', r.count === 0 && r.rows === 0, 'el paquet surt buit');
  ok('noNodePublishesByDefault', r.anyOn === 0 && !r.scope.skills && !r.scope.objects, 'cap node activat');
  ok('packIsTypedAnyway', r.type === 'sos:SupplyPack', r.type);
  ok('noErrors1', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 2. El gra: categoria, municipi i quants. Res més ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { bt, bib } = window.__T;
    await S.setPublishScope(bt, { skills: true, objects: false });
    await S.setPublishScope(bib, { skills: false, objects: true });
    const pack = S.supplyPublicPack();
    const rep = pack.supply.find(x => x.category === 'reparacions');
    const obj = pack.supply.find(x => x.kind === 'objecte');
    return { count: pack.count, nodes: pack.nodes,
      keys: [...new Set(pack.supply.flatMap(x => Object.keys(x)))].sort(),
      rep, obj, allowed: S.PUBLIC_SUPPLY_FIELDS };
  }, SETUP);
  ok('aggregatedByCategory', r.rep && r.rep.count === 2 && r.rep.people === 2,
    r.rep ? r.rep.count + ' files agregades de ' + r.rep.people + ' persones' : 'no hi és');
  ok('saysWhereNotWho', r.rep && r.rep.place === 'Manresa' && r.rep.nodeName === 'Banc de temps del Barri Antic',
    r.rep ? r.rep.place + ' · ' + r.rep.nodeName : '');
  ok('carriesCoordinates', r.rep && r.rep.lat > 41 && r.rep.lon > 1, 'lat/lon del municipi');
  ok('carriesTheDomainBridge', r.rep && r.rep.domain === 'reparacio', r.rep && r.rep.domainLabel);
  ok('objectsComeFromTheOtherNode', r.obj && r.obj.category === 'bricolatge' && r.obj.nodeName.includes('Biblioteca'),
    r.obj ? r.obj.label + ' a ' + r.obj.nodeName : '');
  ok('onlyWhitelistedKeys', r.keys.every(k => r.allowed.includes(k)), r.keys.join(','));
  ok('noPersonIdKeys', !r.keys.includes('who') && !r.keys.includes('whoId') && !r.keys.includes('title'),
    'ni qui, ni whoId, ni títol');
  ok('noErrors2', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 3. La comprovació de no-fuita és codi, no només un test ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { bt, bib } = window.__T;
    await S.setPublishScope(bt, { skills: true, objects: true });
    await S.setPublishScope(bib, { skills: true, objects: true });
    const pack = S.supplyPublicPack();
    const txt = JSON.stringify(pack);
    const clean = S.verifyNoLeak(pack);
    // i ara un paquet embrutat a mà: la comprovació l'ha de caçar
    const dirty = JSON.parse(txt);
    dirty.supply[0].who = 'Berta Solanes';
    const caught = S.verifyNoLeak(dirty);
    const dirty2 = JSON.parse(txt);
    dirty2.supply[0].nodeName = 'Trucar al 600112233';
    const caught2 = S.verifyNoLeak(dirty2);
    return { clean: clean.ok, leaks: clean.leaks,
      hasName: /Berta|Quim/.test(txt), hasPhone: /6001122|6004455/.test(txt),
      hasEmail: /example\\.cat/.test(txt), hasTitle: /Fusteria a casa|Trepant d/.test(txt),
      hasLedger: /Fusteria per a/.test(txt),
      caught: caught.ok, caughtWhat: caught.leaks,
      caught2: caught2.ok, caught2What: caught2.leaks };
  }, SETUP);
  ok('noNamesInThePack', !r.hasName, 'ni Berta ni Quim');
  ok('noPhonesOrEmails', !r.hasPhone && !r.hasEmail, 'cap contacte');
  ok('noFreeTextTitles', !r.hasTitle, 'un títol pot portar un nom a dins: no hi surt');
  ok('noLedgerEntries', !r.hasLedger, 'el registre es queda a casa');
  ok('verifyPassesOnACleanPack', r.clean, r.leaks.join(' | ') || 'net');
  ok('verifyCatchesAnAddedField', !r.caught && /camp no permès/i.test(r.caughtWhat.join()), r.caughtWhat.join());
  ok('verifyCatchesAHiddenPhone', !r.caught2 && /contacte/i.test(r.caught2What.join()), r.caught2What.join());
  ok('noErrors3', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 4. Cada node decideix per separat, i per cada mena de cosa ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { bt, bib } = window.__T;
    await S.setPublishScope(bt, { skills: true, objects: true });
    const onlyBt = S.supplyPublicPack();
    await S.setPublishScope(bt, { skills: false, objects: true });
    const noSkills = S.supplyPublicPack();
    await S.setPublishScope(bt, { skills: false, objects: false });
    const off = S.supplyPublicPack();
    return { onlyBt: onlyBt.nodes, onlyBtKinds: [...new Set(onlyBt.supply.map(x => x.kind))],
      noSkills: noSkills.supply.filter(x => x.kind === 'habilitat').length,
      off: off.count };
  }, SETUP);
  ok('onlyTheNodesThatAskedFor', r.onlyBt === 1, r.onlyBt + ' node al paquet, la biblioteca no hi és');
  ok('skillsCanBePublishedWithoutObjects', r.noSkills === 0, 'apagant habilitats no en surt cap');
  ok('turningItOffEmptiesThePack', r.off === 0, 'es pot deixar de publicar el que encara no ha sortit');
  ok('noErrors4', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 5. Llegir el paquet d'algú altre passa pel mateix sedàs ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { bt } = window.__T;
    await S.setPublishScope(bt, { skills: true, objects: true });
    const pack = S.supplyPublicPack();
    const back = S.readSupplyPack(JSON.parse(JSON.stringify(pack)));
    // un paquet manipulat que intenta injectar camps nous
    const evil = JSON.parse(JSON.stringify(pack));
    evil.supply[0].script = '<img onerror=1>';
    evil.supply[0].who = 'Berta Solanes';
    const filtered = S.readSupplyPack(evil);
    let notAPack = '', broken = '';
    try { S.readSupplyPack({ '@type': 'una-altra-cosa' }); } catch (e) { notAPack = e.msg || ''; }
    try { S.readSupplyPack({ '@type': 'sos:SupplyPack' }); } catch (e) { broken = e.msg || ''; }
    return { roundTrip: back.length === pack.count,
      keys: Object.keys(filtered[0]), notAPack, broken,
      sameShape: JSON.stringify(back) === JSON.stringify(pack.supply) };
  }, SETUP);
  ok('packRoundTrips', r.roundTrip && r.sameShape, 'surt i torna a entrar igual');
  ok('injectedFieldsAreDropped', !r.keys.includes('script') && !r.keys.includes('who'), r.keys.join(','));
  ok('somethingElseIsRefused', /no és un paquet/i.test(r.notAPack), r.notAPack);
  ok('brokenPackIsRefused', /malmès/i.test(r.broken), r.broken);
  ok('noErrors5', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 6. La pantalla ensenya exactament què sortirà, abans ═══
{
  const { ctx, p, errs } = await open();
  await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS;
    S.render(); S.openPublishSupply();
  }, SETUP);
  await p.waitForTimeout(500);
  const before = await p.evaluate(() => ({
    txt: (document.querySelector('.modal') || {}).innerText || '',
    disabled: document.querySelector('#psGo').disabled,
    nodes: document.querySelectorAll('#psNodes .ent-card').length
  }));
  ok('screenWarnsItCannotBeUndone', /no es pot desfer/i.test(before.txt), 'ho diu de cara');
  ok('screenSaysWhereNotWho', /on preguntar, no a qui/i.test(before.txt), 'diu el gra');
  ok('cannotPublishAnEmptyPack', before.disabled, 'el botó està desactivat sense res a publicar');
  ok('screenListsTheCandidateNodes', before.nodes === 2, before.nodes + ' nodes triables');
  const after = await p.evaluate(async () => {
    document.querySelectorAll('#psNodes .ent-card')[0].querySelectorAll('button')[0].click();
    await new Promise(r => setTimeout(r, 500));
    const t = (document.querySelector('.modal') || {}).innerText || '';
    return { txt: t, rows: document.querySelectorAll('.ledger-table tbody tr').length,
      disabled: document.querySelector('#psGo').disabled };
  });
  ok('turningANodeOnShowsTheRows', after.rows >= 2, after.rows + ' files a la taula');
  ok('tableShowsCountsNotNames', !/Berta|Quim/.test(after.txt), 'cap nom a la previsualització');
  ok('checkIsShownToTheUser', /cap nom, contacte, identitat/i.test(after.txt), 'diu que ho ha comprovat');
  ok('buttonEnablesOnlyWithContent', !after.disabled, 'ara sí que es pot descarregar');
  ok('noErrors6', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 7. Vores ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS, { bt, muni } = window.__T;
    // un node sense territori pare no ha de petar
    const orfe = { id: 'ORF', name: 'Node orfe', nodeLevel: 'projecte', parentId: null, dynamicType: 'banc_temps',
      metaskill: {}, vna: { roles: [], exchanges: [] }, kanban: { cards: [] }, ledger: [], members: [], objects: [], offers: [], createdAt: '', updatedAt: '' };
    const m = S.newMember({ name: 'Sol Prat', kind: 'persona' }); orfe.members.push(m);
    orfe.offers.push(S.newOffer({ kind: 'oferta', title: 'Cuino', category: 'cuina', memberId: m.id }));
    S.state.nodes.push(orfe);
    await S.setPublishScope(orfe, { skills: true, objects: true });
    const pack = S.supplyPublicPack();
    const orphanRow = pack.supply.find(x => x.nodeId === 'ORF');
    const leak = S.verifyNoLeak(pack);
    // una oferta sense soci assignat compta com a fila però no com a persona
    orfe.offers.push(S.newOffer({ kind: 'oferta', title: 'Sense ningú', category: 'cuina', memberId: null }));
    const pack2 = S.supplyPublicPack();
    const row2 = pack2.supply.find(x => x.nodeId === 'ORF' && x.category === 'cuina');
    const emptyLeak = S.verifyNoLeak({ '@type': 'sos:SupplyPack', supply: [] });
    return { orphanPlace: orphanRow && orphanRow.place, leakOk: leak.ok,
      count: row2 && row2.count, people: row2 && row2.people, emptyLeak: emptyLeak.ok };
  }, SETUP);
  ok('orphanNodeDoesNotCrash', r.orphanPlace === 'Node orfe' || r.orphanPlace === '',
    'lloc = «' + r.orphanPlace + '» sense inventar-se un municipi');
  ok('orphanStillLeaksNothing', r.leakOk, 'segueix net');
  ok('rowWithoutAMemberCountsAsZeroPeople', r.count === 2 && r.people === 1,
    r.count + ' files · ' + r.people + ' persona identificada');
  ok('emptyPackIsClean', r.emptyLeak, 'un paquet buit no filtra res');
  ok('noErrors7', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

await b.close();
const failed = Object.entries(results).filter(([, v]) => !v).map(([k]) => k);
console.log('\n' + (failed.length ? '❌ FAILED (' + failed.length + '): ' + failed.join(', ') : '✅ ALL PASSED (' + Object.keys(results).length + ')'));
process.exit(failed.length ? 1 : 0);
