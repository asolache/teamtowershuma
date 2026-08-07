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

/* El cas de la vida real: un banc de temps on la Nadia ofereix «petites
   reparacions de la llar» i una biblioteca on en Pol busca un trepant, que hi és
   catalogat com a «bricolatge». Dues taxonomies, la mateixa tarda de dissabte. */
const SETUP = `
  const S=window.__SOS;
  const mk=(id,name,dyn)=>{const n={id,name,nodeLevel:'projecte',parentId:null,dynamicType:dyn,
    metaskill:{},vna:{roles:[],exchanges:[]},kanban:{cards:[]},ledger:[],members:[],objects:[],offers:[],
    createdAt:'',updatedAt:''};S.state.nodes.push(n);return n;};
  const bt=mk('BT','Banc de temps del barri','banc_temps');
  const bib=mk('BIB','Biblioteca de les coses','biblioteca_coses');
  const nadia=S.newMember({name:'Nadia Ferrer',kind:'persona'}); bt.members.push(nadia);
  const pol=S.newMember({name:'Pol Sans',kind:'persona'}); bib.members.push(pol);
  bt.offers.push(S.newOffer({kind:'oferta',title:'Munto mobles i arreglo aixetes',category:'reparacions',memberId:nadia.id}));
  const trepant=S.newObject({name:'Trepant Bosch',typology:'bricolatge'});
  trepant.status='prestat'; trepant.reservations=[pol.id];
  bib.objects.push(trepant);
  S.state.activeId='BT';
  window.__T={bt,bib,nadia,pol,trepant};
`;

// ═══ 1. El pont existeix, i no s'inventa equivalències ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(() => {
    const S = window.__SOS;
    const bridged = S.bridgedDomains().map(d => d.id);
    const both = S.SUPPLY_DOMAINS.filter(d => d.objecte.length && d.habilitat.length).length;
    const oneSided = S.SUPPLY_DOMAINS.filter(d => !d.objecte.length || !d.habilitat.length).map(d => d.id);
    // cap categoria d'una taxonomia pot caure en dos àmbits
    const dupes = [];
    const seen = {};
    S.SUPPLY_DOMAINS.forEach(d => {
      d.objecte.forEach(c => { const k = 'o:' + c; if (seen[k]) dupes.push(k); seen[k] = 1; });
      d.habilitat.forEach(c => { const k = 'h:' + c; if (seen[k]) dupes.push(k); seen[k] = 1; });
    });
    return { bridged, both, oneSided, dupes,
      repar: S.domainOf('habilitat', 'reparacions'),
      brico: S.domainOf('objecte', 'bricolatge'),
      unknown: S.domainOf('habilitat', 'no-existeix-aixo'),
      crossTaxonomy: S.domainOf('objecte', 'reparacions') };
  });
  ok('bridgeJoinsRepairsAndDIY', r.repar === 'reparacio' && r.brico === 'reparacio', 'reparacions ↔ bricolatge');
  ok('categoryBelongsToOneDomain', r.dupes.length === 0, r.dupes.join(', ') || 'cap categoria repetida');
  ok('unknownCategoryHasNoDomain', r.unknown === null, 'el que no és al mapa no s\'hi fica a la força');
  ok('taxonomiesStaySeparate', r.crossTaxonomy === null, 'una categoria del banc no és una categoria de la biblioteca');
  ok('someDomainsAreOneSidedOnPurpose', r.oneSided.length > 0 && r.bridged.length > 0,
    r.bridged.length + ' fan de pont · ' + r.oneSided.length + ' tenen una sola banda');
  ok('noErrors1', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 2. La coincidència que abans no existia ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS;
    const idx = S.supplyIndex();
    const ms = S.supplyMatches('', { from: null, onlyAvailable: false });
    const dom = ms.find(g => !g.exact && g.domain === 'reparacio');
    return { rows: idx.length,
      domainsOnRows: idx.map(x => x.kind + ':' + x.thing + '→' + x.domain),
      found: !!dom,
      offers: dom ? dom.ofereix.map(x => x.kind + ':' + x.thingLabel) : [],
      seeks: dom ? dom.busca.map(x => x.kind + ':' + x.thingLabel) : [],
      label: dom ? dom.label : '',
      exactCount: ms.filter(g => g.exact).length };
  }, SETUP);
  ok('everyRowCarriesItsDomain', /habilitat:reparacions→reparacio/.test(r.domainsOnRows.join('|')) &&
    /objecte:bricolatge→reparacio/.test(r.domainsOnRows.join('|')), r.domainsOnRows.join(' | '));
  ok('crossTaxonomyMatchAppears', r.found, 'apareix la coincidència d\'àmbit «' + r.label + '»');
  ok('itPairsTheSkillWithTheObject', /habilitat/.test(r.offers.join()) && /objecte/.test(r.seeks.join()),
    r.offers.join() + ' ↔ ' + r.seeks.join());
  ok('exactMatchIsTheObjectItself', r.exactCount === 1,
    r.exactCount + ' exacta: qui espera el trepant i el trepant. L\'àmbit hi afegeix qui repara.');
  ok('noErrors2', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 3. Un àmbit que no afegeix res no ocupa lloc ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS;
    const { bt, nadia } = window.__T;
    // Algú del MATEIX banc busca reparacions: això ja és una coincidència exacta
    const jan = S.newMember({ name: 'Jan Prat', kind: 'persona' }); bt.members.push(jan);
    bt.offers.push(S.newOffer({ kind: 'demanda', title: 'Se m\'ha trencat una porta', category: 'reparacions', memberId: jan.id }));
    // ...i deixem la biblioteca fora perquè l'àmbit no travessi res de nou
    S.state.nodes = S.state.nodes.filter(n => n.id !== 'BIB');
    const ms = S.supplyMatches('', { from: null, onlyAvailable: false });
    return { exact: ms.filter(g => g.exact).length, dom: ms.filter(g => !g.exact).length,
      labels: ms.map(g => (g.exact ? 'E:' : 'D:') + g.label) };
  }, SETUP);
  ok('exactMatchStillWorks', r.exact === 1, 'la coincidència exacta hi és');
  ok('redundantDomainIsHidden', r.dom === 0, r.labels.join(' | ') + ' — l\'àmbit no repeteix el que ja diu l\'exacta');
  ok('noErrors3', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 4. Filtrar per àmbit porta les dues bandes ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS;
    const all = S.searchSupply('', { from: null });
    const dom = S.searchSupply('', { from: null, domain: 'reparacio' });
    const other = S.searchSupply('', { from: null, domain: 'animals' });
    const text = S.searchSupply('reparacions', { from: null });
    return { all: all.length, dom: dom.length, other: other.length, text: text.length,
      kinds: [...new Set(dom.map(x => x.kind))].sort() };
  }, SETUP);
  ok('domainFilterBringsBothSides', r.dom === 3 && r.kinds.join() === 'habilitat,objecte',
    r.dom + ' files · ' + r.kinds.join(' + '));
  ok('textSearchAloneMissesTheOther', r.text === 1, 'buscar «reparacions» pel text només troba ' + r.text);
  ok('emptyDomainIsEmpty', r.other === 0, 'un àmbit sense res no inventa files');
  ok('noErrors4', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 5. A la pantalla es distingeix una cosa de l'altra ═══
{
  const { ctx, p, errs } = await open();
  await p.evaluate(async (setup) => { eval(setup); window.__SOS.openSupplySearch(); }, SETUP);
  await p.waitForTimeout(500);
  await p.evaluate(() => { const a = document.querySelector('#spAvail'); if (a && a.classList.contains('sel')) a.click(); });
  await p.waitForTimeout(400);
  const txt = await p.evaluate(() => (document.querySelector('#spMatch') || {}).innerText || '');
  ok('bandLabelsTheDomainMatch', /mateix àmbit/i.test(txt), txt.split('\n').slice(0, 4).join(' / '));
  ok('bandSaysItIsNotTheSameThing', /no és la mateixa cosa/i.test(txt), 'ho diu explícitament');
  ok('bandNamesBothSides', /reparacions/i.test(txt) && /bricolatge/i.test(txt), 'diu quines dues coses creua');
  const after = await p.evaluate(async () => {
    document.querySelector('.sp-match-dom').click();
    await new Promise(r => setTimeout(r, 400));
    return { chip: (document.querySelector('.sp-chip') || {}).innerText || '',
      q: document.querySelector('#spQ').value,
      rows: document.querySelectorAll('#spList .sp-r').length };
  });
  ok('clickingSetsTheDomainChip', /reparar i bricolar/i.test(after.chip), after.chip);
  ok('clickingDoesNotFakeATextQuery', after.q === '', 'la caixa de cerca queda neta, no amb text inventat');
  ok('bothSidesAreListed', after.rows === 3, after.rows + ' files a la llista');
  const cleared = await p.evaluate(async () => {
    document.querySelector('.sp-chip').click();
    await new Promise(r => setTimeout(r, 400));
    return { chip: !!document.querySelector('.sp-chip'), rows: document.querySelectorAll('#spList .sp-r').length };
  });
  ok('chipCanBeRemoved', !cleared.chip && cleared.rows === 3, 'el filtre es treu');
  ok('noErrors5', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 6. Quan no hi ha res, s'ofereix l'altra banda del pont ═══
{
  const { ctx, p, errs } = await open();
  await p.evaluate(async (setup) => {
    eval(setup);
    const S = window.__SOS;
    // Només queda l'habilitat: qui escrigui «bricolatge» no trobarà res pel text
    S.state.nodes = S.state.nodes.filter(n => n.id !== 'BIB');
    S.openSupplySearch();
  }, SETUP);
  await p.waitForTimeout(500);
  await p.fill('#spQ', 'bricolatge');
  await p.waitForTimeout(500);
  const txt = await p.evaluate(() => (document.querySelector('#spList') || {}).innerText || '');
  ok('noResultsOffersTheBridge', /prova l'àmbit/i.test(txt) || /prova l’àmbit/i.test(txt), txt.split('\n').slice(0, 3).join(' / '));
  ok('bridgeExplainsWhyItIsThere', /categories diferents/i.test(txt), 'explica per què no s\'ha trobat');
  const jumped = await p.evaluate(async () => {
    document.querySelector('#spList .sp-match').click();
    await new Promise(r => setTimeout(r, 400));
    return { rows: document.querySelectorAll('#spList .sp-r').length, chip: !!document.querySelector('.sp-chip') };
  });
  ok('bridgeJumpFindsSomething', jumped.rows === 1 && jumped.chip, jumped.rows + ' fila trobada per l\'àmbit');
  ok('noErrors6', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 7. Vores ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(() => {
    const S = window.__SOS;
    return { nullKind: S.domainOf(null, null), emptyBridge: S.bridgedCats('objecte', 'no-existeix').length,
      brico: S.bridgedCats('objecte', 'bricolatge').map(c => c.kind + ':' + c.label),
      cura: S.bridgedCats('objecte', 'salut').length,
      noMatchesOnEmptySos: S.supplyMatches('', { from: null }).length };
  });
  ok('nullsDoNotCrash', r.nullKind === null, 'sense categoria no hi ha àmbit');
  ok('unknownHasNoBridge', r.emptyBridge === 0, 'no s\'inventa l\'altra banda');
  ok('bridgePointsToTheOtherTaxonomy', r.brico.join() === 'habilitat:Petites reparacions de la llar', r.brico.join());
  ok('domainCanBridgeToSeveral', r.cura === 2, 'salut → ' + r.cura + ' categories del banc');
  ok('emptySosHasNoMatches', r.noMatchesOnEmptySos === 0, 'un SOS buit no aparella res');
  ok('noErrors7', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

await b.close();
const failed = Object.entries(results).filter(([, v]) => !v).map(([k]) => k);
console.log('\n' + (failed.length ? '❌ FAILED (' + failed.length + '): ' + failed.join(', ') : '✅ ALL PASSED (' + Object.keys(results).length + ')'));
process.exit(failed.length ? 1 : 0);
