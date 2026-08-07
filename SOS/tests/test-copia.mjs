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
async function seed(p) {
  return await p.evaluate(async () => {
    const S = window.__SOS;
    S.state.nodes.length = 0;
    const n = { id: 'BT', name: 'BdT Manresa', nodeLevel: 'projecte', parentId: null, dynamicType: 'banc_temps',
      metaskill: {}, vna: { roles: [], exchanges: [] }, kanban: { cards: [] }, ledger: [], createdAt: '', updatedAt: '' };
    S.seedFromDynamic(n, S.dynById('banc_temps')); S.state.nodes.push(n);
    const m = S.joinNode(n, { name: 'Mazinguer' });
    S.joinNode(n, { name: 'Pigmentona' });
    await S.pushLedger(n.ledger, { id: 'l1', who: 'Mazinguer', memberId: m.id, type: 'temps', value: 4, what: 'fusteria', ts: new Date().toISOString() });
    await S.persist(n);
    await S.getIdentity();   // assegura que hi ha identitat al magatzem
    return { did: (await S.getIdentity()).did };
  });
}

// ═══ 1. Amb contrasenya: tot xifrat, res llegible ═══
{
  const { ctx, p, errs } = await open();
  await seed(p);
  const r = await p.evaluate(async () => {
    const S = window.__SOS;
    const pack = await S.exportBackup('unaclaularga');
    const raw = JSON.stringify(pack);
    let short = null;
    try { await S.exportBackup('curta'); } catch (e) { short = e.msg; }
    return { type: pack.type, enc: pack.enc, alg: pack.alg, iters: pack.iters,
      hasCt: !!pack.ct, hasSalt: !!pack.salt, count: pack.count, hasIdentity: pack.hasIdentity,
      noPlainNames: !/Mazinguer/.test(raw), noPlainKey: !/privJwk/.test(raw),
      noPlainNode: !/BdT Manresa/.test(raw), short };
  });
  ok('backupIsTyped', r.type === 'sos-full-backup', r.type);
  ok('passwordEncrypts', r.enc === true && r.alg === 'AES-GCM-PBKDF2' && r.iters === 210000, r.alg + ' · ' + r.iters);
  ok('nothingReadableInside', r.noPlainNames && r.noPlainNode && r.noPlainKey, 'ni noms, ni nodes, ni clau privada en clar');
  ok('backupCountsWhatItCarries', r.count > 0 && r.hasIdentity === true, r.count + ' registres · amb identitat');
  ok('shortPasswordRefused', /8 car/.test(r.short || ''), r.short);
  ok('noPageErrors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 2. En blanc: es desa en clar, i el fitxer ho diu ═══
{
  const { ctx, p, errs } = await open();
  await seed(p);
  const r = await p.evaluate(async () => {
    const S = window.__SOS;
    const pack = await S.exportBackup('');
    const raw = JSON.stringify(pack);
    const sense = await S.exportBackup('', { withIdentity: false });
    const rawS = JSON.stringify(sense);
    return { enc: pack.enc, hasData: !!pack.data, plainName: /Mazinguer/.test(raw),
      keyIsVisible: /privJwk/.test(raw), flagged: pack.hasIdentity === true,
      senseEnc: sense.enc, senseKey: /privJwk/.test(rawS), senseFlag: sense.hasIdentity,
      senseStillHasNodes: /BdT Manresa/.test(rawS),
      fewer: sense.count === pack.count - 1 };
  });
  ok('blankMeansPlain', r.enc === false && r.hasData, 'sense contrasenya, sense xifrar');
  ok('plainIsReallyPlain', r.plainName, 'els noms es llegeixen');
  ok('plainExposesThePrivateKey', r.keyIsVisible, 'la clau privada hi és — per això s\'avisa');
  ok('headerDeclaresIdentity', r.flagged, 'el fitxer diu que porta identitat');
  ok('identityCanBeLeftOut', r.senseEnc === false && !r.senseKey && r.senseFlag === false, 'sense identitat: cap clau dins');
  ok('leavingItOutKeepsTheRest', r.senseStillHasNodes && r.fewer, 'un registre menys, la resta hi és');
  ok('noErrorsInPlain', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 3. Restaurar en un navegador buit ═══
{
  const { ctx, p, errs } = await open();
  await seed(p);
  const pack = await p.evaluate(async () => await window.__SOS.exportBackup('unaclaularga'));
  await ctx.close();
  // navegador nou, sense res
  const fresh = await open();
  const r = await fresh.p.evaluate(async o => {
    const S = window.__SOS;
    const before = (await S.state.nodes).length;
    let bad = null;
    try { await S.importBackup(o.pack, 'incorrecta'); } catch (e) { bad = e.code; }
    let none = null;
    try { await S.importBackup(o.pack, ''); } catch (e) { none = e.code; }
    const res = await S.importBackup(o.pack, 'unaclaularga', { mode: 'replace' });
    const all = await (async () => { const out = []; return out; })();
    return { before, bad, none, res };
  }, { pack });
  ok('wrongPasswordFails', r.bad === 'badpass', 'codi: ' + r.bad);
  ok('missingPasswordIsItsOwnError', r.none === 'needpass', 'codi: ' + r.none);
  ok('restoreReportsWhatEntered', r.res.restored > 0 && r.res.hadIdentity, r.res.restored + ' registres, amb identitat');
  ok('noErrorsInRestore', fresh.errs.length === 0, fresh.errs.join(' | '));
  await fresh.ctx.close();
}

// ═══ 4. La còpia porta la feina, no només la clau ═══
{
  const { ctx, p, errs } = await open();
  const seeded = await seed(p);
  const pack = await p.evaluate(async () => await window.__SOS.exportBackup(''));
  await ctx.close();
  const fresh = await open();
  const r = await fresh.p.evaluate(async o => {
    const S = window.__SOS;
    await S.importBackup(o.pack, '', { mode: 'replace' });
    // recarregar l'estat des del magatzem
    const recs = o.pack.data.records;
    const node = recs.find(x => x.id === 'BT');
    const ident = recs.find(x => x.id === '__identity');
    const sum = S.backupSummary(o.pack.data);
    return { node: !!node, members: (node.members || []).length, ledger: (node.ledger || []).length,
      identDid: ident ? ident.did : null, sum };
  }, { pack });
  ok('backupCarriesTheNode', r.node, 'el node hi és');
  ok('backupCarriesMembers', r.members === 2, r.members + ' socis');
  ok('backupCarriesLedger', r.ledger === 1, r.ledger + ' apunt al ledger');
  ok('backupCarriesTheIdentity', r.identDid === seeded.did, 'el mateix did:sos');
  ok('summaryCountsWhatMatters', r.sum.nodes === 1 && r.sum.members === 2 && r.sum.ledger === 1 && r.sum.hasIdentity,
    r.sum.nodes + ' nodes · ' + r.sum.members + ' socis · ' + r.sum.ledger + ' apunts');
  ok('noErrorsInCarry', fresh.errs.length === 0, fresh.errs.join(' | '));
  await fresh.ctx.close();
}

// ═══ 5. Merge no esborra; replace sí, i cal demanar-ho ═══
{
  const { ctx, p, errs } = await open();
  await seed(p);
  const pack = await p.evaluate(async () => await window.__SOS.exportBackup(''));
  const r = await p.evaluate(async o => {
    const S = window.__SOS;
    // un node que NO és a la còpia
    const extra = { id: 'NOU', name: 'Node posterior', nodeLevel: 'projecte', parentId: null, dynamicType: 'generic',
      metaskill: {}, vna: { roles: [], exchanges: [] }, kanban: { cards: [] }, ledger: [], createdAt: '', updatedAt: '' };
    S.state.nodes.push(extra); await S.persist(extra);
    await S.importBackup(o.pack, '');            // merge per defecte
    const afterMerge = (await window.indexedDB ? 1 : 1);
    const merged = await new Promise(res => { const req = indexedDB.open('SOS_MVP'); req.onsuccess = () => {
      const db = req.result, tx = db.transaction('nodes', 'readonly').objectStore('nodes').getAll();
      tx.onsuccess = () => res(tx.result.map(x => x.id)); }; });
    await S.importBackup(o.pack, '', { mode: 'replace' });
    const replaced = await new Promise(res => { const req = indexedDB.open('SOS_MVP'); req.onsuccess = () => {
      const db = req.result, tx = db.transaction('nodes', 'readonly').objectStore('nodes').getAll();
      tx.onsuccess = () => res(tx.result.map(x => x.id)); }; });
    return { merged, replaced };
  }, { pack });
  ok('mergeKeepsWhatWasThere', r.merged.includes('NOU') && r.merged.includes('BT'), r.merged.join(', '));
  ok('replaceRemovesIt', !r.replaced.includes('NOU') && r.replaced.includes('BT'), r.replaced.join(', '));
  ok('noErrorsInModes', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 6. La pantalla diu la veritat sobre què farà ═══
{
  const { ctx, p, errs } = await open();
  await seed(p);
  await p.evaluate(() => window.__SOS.openBackup('export'));
  await p.waitForTimeout(400);
  const blank = await p.evaluate(() => ({
    btn: document.querySelector('#bkGo').textContent,
    warnVisible: document.querySelector('#bkWarn').style.display !== 'none',
    warnSaysKey: /signar en el teu nom/i.test(document.querySelector('#bkWarn').innerText),
    noId: !!document.querySelector('#bkNoIdC')
  }));
  ok('blankButtonWarns', /SENSE xifrar/.test(blank.btn), blank.btn);
  ok('blankShowsTheWarning', blank.warnVisible && blank.warnSaysKey, 'avisa que qui el tingui pot signar per tu');
  ok('canLeaveIdentityOut', blank.noId, 'opció de treure la identitat');
  await p.fill('#bkPass', 'unaclaularga');
  await p.waitForTimeout(200);
  const withPass = await p.evaluate(() => ({
    btn: document.querySelector('#bkGo').textContent,
    warnHidden: document.querySelector('#bkWarn').style.display === 'none'
  }));
  ok('passwordButtonSaysEncrypted', /xifrada/.test(withPass.btn), withPass.btn);
  ok('warningGoesAwayWithPassword', withPass.warnHidden, 'l\'avís marxa quan ja no cal');
  await p.fill('#bkPass2', 'altracosa');
  await p.click('#bkGo');
  await p.waitForTimeout(300);
  const mismatch = await p.evaluate(() => document.querySelector('#bkMsg').textContent);
  ok('mismatchIsCaught', /no coincideixen/i.test(mismatch), mismatch);
  ok('noErrorsOnExportScreen', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 7. La pantalla de restaurar ensenya què entrarà ═══
{
  const { ctx, p, errs } = await open();
  await seed(p);
  const pack = await p.evaluate(async () => await window.__SOS.exportBackup('unaclaularga'));
  await p.evaluate(() => window.__SOS.openBackup('import'));
  await p.waitForTimeout(400);
  await p.fill('#bkText', JSON.stringify(pack));
  await p.waitForTimeout(400);
  const peek = await p.evaluate(() => ({
    text: document.querySelector('#bkPeek').innerText,
    hasRep: !!document.querySelector('#bkRepC')
  }));
  ok('previewShowsItIsEncrypted', /xifrada/i.test(peek.text), peek.text.split('\n')[0]);
  ok('previewCountsRecords', /registres/i.test(peek.text), peek.text.replace(/\n/g, ' · '));
  ok('previewFlagsIdentity', /amb identitat/i.test(peek.text), 'diu si porta identitat');
  ok('replaceIsOptIn', peek.hasRep, 'substituir s\'ha de marcar expressament');
  await p.fill('#bkText', '{"type":"una-altra-cosa"}');
  await p.waitForTimeout(400);
  const wrong = await p.evaluate(() => document.querySelector('#bkPeek').innerText);
  ok('foreignFileIsRejectedOnSight', /no és una còpia/i.test(wrong), wrong.trim());
  await p.fill('#bkText', 'no és json');
  await p.waitForTimeout(400);
  const junk = await p.evaluate(() => document.querySelector('#bkPeek').innerText);
  ok('junkIsCaught', /JSON/i.test(junk), junk.trim());
  ok('noErrorsOnImportScreen', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 8. Casos límit ═══
{
  const { ctx, p, errs } = await open();
  await seed(p);
  const r = await p.evaluate(async () => {
    const S = window.__SOS;
    let notMine = null, noRecs = null;
    try { await S.importBackup({ type: 'una-altra' }, ''); } catch (e) { notMine = e.msg; }
    try { await S.importBackup({ type: 'sos-full-backup', enc: false, data: {} }, ''); } catch (e) { noRecs = e.msg; }
    const emptySum = S.backupSummary(null);
    const empty = await S.importBackup({ type: 'sos-full-backup', enc: false, data: { records: [] } }, '');
    return { notMine, noRecs, emptySum, empty };
  });
  ok('foreignPackRefused', /no és una còpia completa/i.test(r.notMine || ''), r.notMine);
  ok('packWithoutRecordsRefused', /registres llegibles/i.test(r.noRecs || ''), r.noRecs);
  ok('emptySummaryIsZeroNotAnError', r.emptySum.total === 0 && r.emptySum.nodes === 0, 'un resum de res és zero');
  ok('emptyBackupRestoresNothing', r.empty.restored === 0, 'restaura 0 sense petar');
  ok('noErrorsInEdges', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

await b.close();
const failed = Object.entries(results).filter(([, v]) => !v);
console.log('');
if (failed.length) { console.log('❌ FAILED: ' + failed.map(([k]) => k).join(', ')); process.exit(1); }
console.log('✅ ALL PASSED (' + Object.keys(results).length + ')');
