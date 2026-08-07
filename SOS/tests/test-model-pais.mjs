/* V54 · Catalunya deixa de ser un cas soldat i passa a ser un model editable.
   El que es comprova aquí és sobretot que NO canvia res per a qui ja té un SOS:
   un node sense model s'ha de comportar exactament com abans. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await b.newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.CATALUNYA_MODEL);

console.log('\n1 · Catalunya segueix sent Catalunya');
const base = await page.evaluate(() => {
  const S = window.__SOS;
  const lv = S.levelsOf(S.CATALUNYA_MODEL);
  return {
    ids: lv.map(l => l.id),
    labels: lv.map(l => l.label),
    children: lv.map(l => l.child),
    childLabels: lv.map(l => l.childLabel),
    ref: S.CATALUNYA_MODEL.ref,
    size: S.skeletonSize(S.CATALUNYA_MODEL),
    nProv: S.geoFor('provincia').length,
    nCom: S.geoFor('comarca').length
  };
});
ok(base.ids.join(',') === 'pais,provincia,comarca,municipi,barri', 'els cinc nivells canònics, en ordre');
ok(base.labels.join(',') === 'País,Província,Comarca,Municipi,Barri', 'les etiquetes són les de sempre');
ok(base.children.join(',') === 'provincia,comarca,municipi,barri,' , 'la cadena de fills es deriva de l\'ordre');
ok(base.childLabels[0] === 'província', 'l\'etiqueta del fill va en minúscula, com abans');
ok(base.ref === true, 'Catalunya està marcada com a referència');
ok(base.nProv === 4 && base.nCom === 42, 'el catàleg de Catalunya porta 4 províncies i 42 comarques');
ok(base.size === 1 + base.nProv + base.nCom, 'skeletonSize diu quants territoris es crearan abans de crear-los');

console.log('\n2 · Un node sense model es comporta com abans');
const legacy = await page.evaluate(() => {
  const S = window.__SOS;
  // Un node tal com el crearia una versió anterior: sense `modelId` enlloc.
  const pais = S.newNode('Catalunya', 'pais', null);
  const prov = S.newNode('Barcelona', 'provincia', pais.id);
  S.state.nodes.push(pais, prov);
  return {
    paisLabel: S.metaOf(pais).label,
    provLabel: S.metaOf(prov).label,
    next: S.nextLevelOf(prov),
    childLabel: S.metaOf(pais).childLabel,
    modelId: S.modelOf(prov).id,
    rootIsPais: S.rootOf(prov).id === pais.id
  };
});
ok(legacy.paisLabel === 'País' && legacy.provLabel === 'Província', 'els nivells es diuen igual que abans del canvi');
ok(legacy.next === 'comarca', 'el nivell següent segueix sent la comarca');
ok(legacy.childLabel === 'província', 'el botó «+ província» diu el mateix');
ok(legacy.modelId === 'catalunya', 'sense model declarat, s\'assumeix Catalunya');
ok(legacy.rootIsPais, 'l\'arrel es resol pujant per parentId');

console.log('\n3 · Forkejar no toca l\'original');
const fork = await page.evaluate(() => {
  const S = window.__SOS;
  const f = S.forkModel('catalunya', { name: 'Euskadi', flag: '🏴' });
  // Renombra i retalla: tres nivells, amb noms propis.
  f.levels = [{ id: 'pais', label: 'Herrialdea' }, { id: 'provincia', label: 'Lurraldea' }, { id: 'municipi', label: 'Udalerria' }];
  f.institutions.pais = ['Eusko Jaurlaritza', 'Foru Aldundiak', 'Herritarrak'];
  return {
    newId: f.id !== 'catalunya',
    forkedFrom: f.forkedFrom,
    notRef: !f.ref,
    ownGeo: !!f.geo && Array.isArray(f.geo.comarca),
    forkLevels: S.levelsOf(f).map(l => l.label),
    forkChild: S.levelsOf(f).map(l => l.child),
    forkInst: S.institutionsFor(f, 'pais'),
    catStillFive: S.levelsOf(S.CATALUNYA_MODEL).length,
    catStillLabels: S.levelsOf(S.CATALUNYA_MODEL).map(l => l.label).join(','),
    catInstStill: S.institutionsFor(S.CATALUNYA_MODEL, 'pais')[0]
  };
});
ok(fork.newId && fork.forkedFrom === 'catalunya' && fork.notRef, 'la còpia té id propi i recorda d\'on ve');
ok(fork.ownGeo, 'la còpia materialitza la seva pròpia geografia, no comparteix la del pare');
ok(fork.forkLevels.join(',') === 'Herrialdea,Lurraldea,Udalerria', 'els nivells es diuen com vol el model');
ok(fork.forkChild.join(',') === 'provincia,municipi,', 'retallar un nivell del mig el salta de debò: província → municipi');
ok(!fork.forkInst.join(' ').includes('Generalitat'), 'el mapa de valor d\'Euskadi no parla de la Generalitat');
ok(fork.forkInst[0] === 'Eusko Jaurlaritza', 'hi surten les institucions que s\'hi han escrit');
ok(fork.catStillFive === 5 && fork.catStillLabels === 'País,Província,Comarca,Municipi,Barri', 'Catalunya no ha canviat gens');
ok(fork.catInstStill === 'Generalitat', 'i les seves institucions tampoc');

console.log('\n4 · Dos països alhora, cadascun amb el seu idioma');
const two = await page.evaluate(async () => {
  const S = window.__SOS;
  const f = S.forkModel('catalunya', { name: 'Euskadi', flag: '🏴' });
  f.levels = [{ id: 'pais', label: 'Herrialdea' }, { id: 'provincia', label: 'Lurraldea' }, { id: 'municipi', label: 'Udalerria' }];
  await S.saveModels([f]);
  const eus = S.newNode('Euskadi', 'pais', null);
  eus.modelId = f.id;
  const lur = S.newNode('Bizkaia', 'provincia', eus.id);
  S.state.nodes.push(eus, lur);
  const cat = S.state.nodes.find(n => n.name === 'Catalunya' && !n.parentId);
  const bcn = S.state.nodes.find(n => n.name === 'Barcelona');
  return {
    eusRoot: S.metaOf(eus).label,
    eusChild: S.metaOf(lur).label,
    eusNext: S.nextLevelOf(lur),
    catRoot: S.metaOf(cat).label,
    catChild: S.metaOf(bcn).label,
    catNext: S.nextLevelOf(bcn),
    inList: S.countryModels().length
  };
});
ok(two.eusRoot === 'Herrialdea' && two.eusChild === 'Lurraldea', 'l\'arbre d\'Euskadi parla en basc');
ok(two.catRoot === 'País' && two.catChild === 'Província', 'i el de Catalunya segueix en català, al mateix SOS');
ok(two.eusNext === 'municipi' && two.catNext === 'comarca', 'cada arbre segueix la seva pròpia cadena de nivells');
ok(two.inList === 3, 'el model guardat surt al catàleg al costat dels dos de referència');

console.log('\n5 · La cadena territorial ja no diu «Catalunya» a pinyó');
const chain = await page.evaluate(() => {
  const S = window.__SOS;
  const cat = S.resolveChainFromMunicipi('Torrelles de Foix');
  const f = S.forkModel('catalunya', { name: 'Euskadi' });
  f.geo.pais = [{ n: 'Euskadi' }];
  f.geo.provincia = [{ n: 'Bizkaia', p: 'Euskadi' }];
  f.geo.comarca = [{ n: 'Uribe', p: 'Bizkaia' }];
  f.geo.municipi = [{ n: 'Getxo', p: 'Uribe' }];
  return {
    cat, catCom: S.resolveChainFromComarca('Garraf'),
    eus: S.resolveChainFromMunicipi('Getxo', f),
    eusCom: S.resolveChainFromComarca('Uribe', f),
    unknown: S.resolveChainFromMunicipi('Lisboa')
  };
});
ok(chain.cat && chain.cat.pais === 'Catalunya' && chain.cat.comarca === 'Alt Penedès', 'sense model, Torrelles segueix resolent a Catalunya');
ok(chain.catCom && chain.catCom.provincia === 'Barcelona', 'i la comarca segueix trobant la seva província');
ok(chain.eus && chain.eus.pais === 'Euskadi' && chain.eus.provincia === 'Bizkaia', 'amb model propi, el país surt del seu catàleg');
ok(chain.eusCom && chain.eusCom.pais === 'Euskadi', 'i la comarca també, no «Catalunya»');
ok(chain.unknown === null, 'un municipi desconegut segueix retornant null, no una cadena inventada');

console.log('\n6 · L\'assistent de país existeix i no toca la referència');
await page.evaluate(() => window.__SOS.openCountryWizard());
await page.waitForSelector('.modal .fork-card');
const wiz = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('.modal .fork-card')];
  return {
    n: cards.length,
    hasCat: cards.some(c => /catalunya/i.test(c.innerText)),
    hasRef: cards.some(c => /refer[èe]ncia/i.test(c.innerText)),
    hasZero: cards.some(c => c.dataset.src === '__zero'),
    saysCopy: /c[òo]pia editable/i.test(document.querySelector('.modal .m-sub').innerText)
  };
});
ok(wiz.hasCat && wiz.hasRef, 'Catalunya hi surt com a model de referència');
ok(wiz.hasZero, 'i també es pot començar des de zero');
ok(wiz.saysCopy, 'diu explícitament que el model de referència no es modifica');

console.log('\n7 · Crear un país deixa un país viu, no un node buit');
await page.evaluate(() => window.__SOS.closeModal());
const built = await page.evaluate(async () => {
  const S = window.__SOS;
  const f = S.forkModel('catalunya', { name: 'Galiza', flag: '🏴' });
  f.levels = [{ id: 'pais', label: 'País' }, { id: 'provincia', label: 'Provincia' }, { id: 'comarca', label: 'Comarca' }];
  f.geo = { pais: [{ n: 'Galiza' }], provincia: [{ n: 'A Coruña', p: 'Galiza' }, { n: 'Lugo', p: 'Galiza' }],
            comarca: [{ n: 'Bergantiños', p: 'A Coruña' }, { n: 'A Mariña', p: 'Lugo' }] };
  await S.saveModels(S.customModels().concat([f]));
  const before = S.state.nodes.length;
  const r = await S.loadModelSkeleton(f, 'Galiza');
  const kids = S.children(r.root.id);
  return {
    size: S.skeletonSize(f),
    created: r.created,
    grew: S.state.nodes.length - before,
    rootModel: r.root.modelId === f.id,
    kidLabel: kids.length ? S.metaOf(kids[0]).label : null,
    grandkids: kids.length ? S.children(kids[0].id).length : 0
  };
});
ok(built.size === 5, 'skeletonSize compta l\'arrel més els dos nivells del catàleg');
ok(built.created === 5 && built.grew === 5, 'i es creen exactament aquests, ni un més');
ok(built.rootModel, 'el model queda escrit al node arrel, que és d\'on el llegeix tot l\'arbre');
ok(built.kidLabel === 'Provincia', 'els fills es diuen com diu el model, no com diu Catalunya');
ok(built.grandkids === 1, 'i cada província rep les seves comarques del catàleg');

console.log('\n8 · Eliminar un model no esborra territoris');
const del = await page.evaluate(async () => {
  const S = window.__SOS;
  const gal = S.state.nodes.find(n => n.name === 'Galiza' && !n.parentId);
  const n0 = S.state.nodes.length;
  await S.saveModels([]);
  return { nodesKept: S.state.nodes.length === n0, fallback: S.metaOf(gal).label, modelsLeft: S.countryModels().length };
});
ok(del.nodesKept, 'els nodes segueixen tots on eren');
ok(del.fallback === 'País', 'i el país torna als noms de nivell per defecte en comptes de petar');
ok(del.modelsLeft === 2, 'els models de referència no es poden eliminar: sempre hi queden');

console.log('\n9 · Euskadi ve de sèrie, amb estructura foral');
const eus = await page.evaluate(() => {
  const S = window.__SOS;
  const E = S.EUSKADI_MODEL;
  const lv = S.levelsOf(E);
  return {
    inList: S.countryModels().map(m => m.id).sort(),
    ref: E.ref,
    labels: lv.map(l => l.label),
    prov: S.geoFor('provincia', null, E).map(x => x.n),
    nCom: S.geoFor('comarca', null, E).length,
    comAraba: S.geoFor('comarca', 'Araba/Álava', E).length,
    comBiz: S.geoFor('comarca', 'Bizkaia', E).length,
    comGip: S.geoFor('comarca', 'Gipuzkoa', E).length,
    size: S.skeletonSize(E),
    orphanCom: S.geoFor('comarca', null, E).filter(c => !S.geoFor('provincia', null, E).some(p => p.n === c.p)).map(c => c.n),
    orphanMuni: S.geoFor('municipi', null, E).filter(m => !S.geoFor('comarca', null, E).some(c => c.n === m.p)).map(m => m.n)
  };
});
ok(eus.inList.join(',') === 'catalunya,euskadi', 'els dos models de referència hi són de sèrie');
ok(eus.ref === true, 'Euskadi també és de només lectura');
ok(eus.labels[1] === 'Territori Històric', 'el nivell intermedi no és una província: és un Territori Històric');
ok(eus.labels[2] === 'Comarca / Quadrilla', 'i el de sota admet les dues coses, perquè a Araba són quadrilles');
ok(eus.prov.join(',') === 'Araba/Álava,Bizkaia,Gipuzkoa', 'els tres territoris històrics, amb el nom oficial bilingüe');
ok(eus.comAraba === 7 && eus.comBiz === 7 && eus.comGip === 7, 'set comarques o quadrilles a cada territori');
ok(eus.nCom === 21, 'vint-i-una en total');
ok(eus.size === 1 + 3 + 21, 'skeletonSize ho diu abans de crear res');
ok(!eus.orphanCom.length, 'cap comarca penja d\'un territori que no existeix: ' + eus.orphanCom.join(', '));
ok(!eus.orphanMuni.length, 'cap municipi penja d\'una comarca que no existeix: ' + eus.orphanMuni.join(', '));

console.log('\n10 · El mapa foral no és el català');
const foral = await page.evaluate(() => {
  const S = window.__SOS;
  const E = S.EUSKADI_MODEL;
  const roles = S.institutionsFor(E, 'pais');
  const flows = S.institutionFlowsFor(E, 'pais', roles);
  const conc = flows.find(f => /concert/i.test(f[3] || ''));
  const kinds = new Set(flows.map(f => f[2]));
  const deg = {}; flows.forEach(f => { deg[f[0]] = (deg[f[0]] || 0) + 1; });
  return {
    roles, nFlows: flows.length,
    noGeneralitat: !roles.join(' ').includes('Generalitat'),
    hasJaurlaritza: roles.includes('Eusko Jaurlaritza'),
    hasJuntes: roles.includes('Juntes Generals'),
    concertFrom: conc ? conc[0] : null, concertTo: conc ? conc[1] : null,
    bothKinds: kinds.has('tangible') && kinds.has('intangible'),
    maxDeg: Math.max(...Object.values(deg)), nRolesWithFlows: Object.keys(deg).length,
    catRoles: S.institutionsFor(S.CATALUNYA_MODEL, 'pais')
  };
});
ok(foral.noGeneralitat && foral.hasJaurlaritza && foral.hasJuntes, 'els rols són els forals, no els catalans');
ok(foral.roles.length >= 5, 'entre 5 i 8 rols, com demana la metodologia');
ok(foral.nFlows === 24, 'dotze parells expandits en les dues direccions');
ok(foral.concertFrom === 'Diputacions Forals' && foral.concertTo === 'Eusko Jaurlaritza',
  'el Concert Econòmic va de les Diputacions al Govern, no al revés');
ok(foral.bothKinds, 'barreja tangibles i intangibles');
ok(foral.maxDeg <= foral.nFlows / 2, 'cap rol concentra la meitat dels fluxos: no és una estrella');
ok(foral.catRoles[0] === 'Generalitat', 'i Catalunya segueix amb els seus');

console.log('\n11 · Crear Euskadi deixa un país foral sencer');
const built2 = await page.evaluate(async (n0) => {
  const S = window.__SOS;
  const E = S.EUSKADI_MODEL;
  const before = S.state.nodes.length;
  const r = await S.loadModelSkeleton(E, 'Euskadi');
  const kids = S.children(r.root.id);
  const araba = kids.find(k => /Araba/.test(k.name));
  return {
    created: r.created, grew: S.state.nodes.length - before,
    nProv: S.children(r.root.id).length,
    nCom: S.children(r.root.id).reduce((a, k) => a + S.children(k.id).length, 0),
    kidLabel: kids.length ? S.metaOf(kids[0]).label : null,
    kidNext: kids.length ? S.nextLevelOf(kids[0]) : null,
    arabaKids: araba ? S.children(araba.id).length : 0,
    arabaChildLabel: araba ? S.metaOf(S.children(araba.id)[0]).label : null,
    entTypes: S.entityTypesFor('provincia', E).map(t => t[1]),
    entMeta: S.entTypeMeta('juntes').label
  };
});
ok(built2.grew === built2.created, 'no es creen nodes que el recompte no digui');
ok(built2.nProv === 3 && built2.nCom === 21, 'l\'arbre queda amb 3 territoris i 21 comarques, reaprofitant els que ja hi eren');
ok(built2.kidLabel === 'Territori Històric', 'l\'arbre parla de territoris històrics');
ok(built2.kidNext === 'comarca', 'i per sota hi van les comarques i quadrilles');
ok(built2.arabaKids === 7, 'Araba rep les seves 7 quadrilles');
ok(built2.arabaChildLabel === 'Comarca / Quadrilla', 'que es diuen com el model diu');
ok(built2.entTypes.includes('Diputació Foral') && built2.entTypes.includes('Juntes Generals'),
  'els tipus d\'entitat del territori històric són els forals');
ok(built2.entMeta === 'Juntes Generals', 'i el seu nom es troba allà on es dibuixen, no surt l\'id cru');

console.log('\n12 · Forkejar Euskadi conserva el mapa; editar-lo no el trenca');
const forkEus = await page.evaluate(() => {
  const S = window.__SOS;
  const f = S.forkModel('euskadi', { name: 'Nafarroa' });
  const rolesBefore = S.institutionsFor(f, 'pais');
  const flowsBefore = S.institutionFlowsFor(f, 'pais', rolesBefore);
  // Treu un rol: els seus fluxos han de desaparèixer, la resta quedar-se.
  const kept = rolesBefore.filter(r => r !== 'Juntes Generals');
  const flowsAfter = S.institutionFlowsFor(f, 'pais', kept);
  return {
    keepsPairs: flowsBefore.length === 24,
    ownGeo: S.geoFor('comarca', null, f).length === 21,
    after: flowsAfter.length,
    noneDangling: !flowsAfter.some(x => x[0] === 'Juntes Generals' || x[1] === 'Juntes Generals'),
    eusUntouched: S.institutionFlowsFor(S.EUSKADI_MODEL, 'pais').length === 24
  };
});
ok(forkEus.keepsPairs, 'la còpia s\'endú els intercanvis, no només els noms dels rols');
ok(forkEus.ownGeo, 'i la geografia foral sencera');
ok(forkEus.after < 24 && forkEus.after > 0, 'treure un rol es queda amb els fluxos que encara tenen els dos extrems');
ok(forkEus.noneDangling, 'i cap flux apunta a un rol que ja no hi és');
ok(forkEus.eusUntouched, 'Euskadi no ha canviat');

console.log('\n13 · Cap model de referència es pot sobreescriure ni esborrar');
const guard = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.saveModels([{ id: 'euskadi', name: 'Segrestada' }, { id: 'catalunya', name: 'També' }, { id: 'propi-x', name: 'Propi' }]);
  return {
    stored: S.customModels().map(m => m.id),
    eus: S.modelById('euskadi').name,
    cat: S.modelById('catalunya').name,
    total: S.countryModels().length
  };
});
ok(guard.stored.join(',') === 'propi-x', 'desar un model amb l\'id d\'un de referència no l\'escriu');
ok(guard.eus === 'Euskadi' && guard.cat === 'Catalunya', 'i els de referència segueixen sent els seus');
ok(guard.total === 3, 'els dos de sèrie més el propi');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
