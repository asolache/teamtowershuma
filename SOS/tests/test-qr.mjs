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

/* Un fals BarcodeDetector que llegeix el QR de debò no es pot fer; el que sí es
   pot comprovar és que el SOS el fa servir bé quan hi és, i que quan no hi és
   ho diu en comptes de fer com si res. */
const FAKE_BD = `
  window.__bdCalls=[];
  window.BarcodeDetector=class{
    static async getSupportedFormats(){return ['qr_code','ean_13'];}
    constructor(o){window.__bdOpts=o;}
    async detect(src){
      window.__bdCalls.push(src&&src.tagName||String(src&&src.constructor&&src.constructor.name));
      return window.__bdNext?[{rawValue:window.__bdNext,format:'qr_code'}]:[];
    }
  };
`;

// ═══ 1. Es diu què sap fer aquest navegador, sense fer-se el valent ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async () => {
    const S = window.__SOS;
    const caps = await S.qrCapabilities();
    let err = '';
    try { await S.decodeQR(new Blob([''], { type: 'image/png' })); } catch (e) { err = (e && e.msg) || ''; }
    return { caps, err };
  });
  ok('reportsNoNativeDetector', r.caps.native === false && r.caps.usable === false,
    'BarcodeDetector no hi és en aquest Chromium — i el SOS ho sap');
  ok('refusesInsteadOfPretending', /no sap llegir codis qr/i.test(r.err), r.err);
  ok('errorPointsToWhatWorks', /enganxa el codi/i.test(r.err), 'diu el camí que sí funciona');
  ok('noErrors1', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 2. Quan el navegador sí que en sap, es fa servir ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (fake) => {
    eval(fake);
    const S = window.__SOS;
    const caps = await S.qrCapabilities();
    window.__bdNext = 'Z2H4sIA-codi-de-sincronitzacio';
    const cv = document.createElement('canvas'); cv.width = 40; cv.height = 40;
    const got = await S.decodeQR(cv);
    window.__bdNext = null;
    const none = await S.decodeQR(cv);
    return { caps, got, none, opts: window.__bdOpts, calls: window.__bdCalls };
  }, FAKE_BD);
  ok('detectsTheCapability', r.caps.native && r.caps.qr && r.caps.usable, 'natiu i amb qr_code');
  ok('asksOnlyForQr', r.opts && r.opts.formats && r.opts.formats.join() === 'qr_code',
    'no demana tots els formats: ' + (r.opts && r.opts.formats));
  ok('returnsTheCode', r.got === 'Z2H4sIA-codi-de-sincronitzacio', r.got);
  ok('noQrIsNullNotAnError', r.none === null, 'una imatge sense QR retorna null, no peta');
  ok('noErrors2', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 3. La pantalla d'escàner diu la veritat sobre el que pot fer ═══
{
  const { ctx, p, errs } = await open();
  await p.evaluate(() => { window.__SOS.render(); window.__SOS.openQRScanner(c => { window.__code = c; }); });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => ({
    txt: (document.querySelector('.modal') || {}).innerText || '',
    hasFile: !!document.querySelector('#qsFile'),
    videoShown: (document.querySelector('#qsView') || {}).style && document.querySelector('#qsView').style.display !== 'none'
  }));
  ok('scannerSaysItCannotHere', /no sap llegir qr/i.test(r.txt), 'ho diu de cara');
  ok('scannerNamesTheMissingApi', /barcodedetector/i.test(r.txt), 'i diu què li falta');
  ok('scannerSaysMobileWorks', /al mòbil normalment sí/i.test(r.txt), 'i on sí que va');
  ok('scannerAlwaysOffersThePasteRoute', /enganxa el codi a mà/i.test(r.txt), 'el camí que no depèn de res');
  ok('scannerStillOffersAPhoto', r.hasFile, 'el selector d\'imatge hi és igualment');
  ok('noCameraWithoutSupport', !r.videoShown, 'no obre la càmera si no sabrà què fer-ne');
  ok('noErrors3', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 4. Amb detector i càmera, s'obre el visor i el codi arriba ═══
{
  const { ctx, p, errs } = await open({ permissions: ['camera'] });
  await p.evaluate(async (fake) => {
    eval(fake);
    /* Càmera falsa: un MediaStream d'un canvas. El que es comprova és el
       cablejat —que el visor s'obre i que el codi trobat arriba a qui l'espera—
       no que Chromium sàpiga descodificar. */
    const cv = document.createElement('canvas'); cv.width = 120; cv.height = 120;
    cv.getContext('2d').fillRect(0, 0, 120, 120);
    const fakeStream = cv.captureStream(5);
    navigator.mediaDevices.getUserMedia = async () => fakeStream;
    window.__SOS.render();
    window.__SOS.openQRScanner(c => { window.__code = c; });
  }, FAKE_BD);
  await p.waitForTimeout(700);
  const opened = await p.evaluate(() => ({
    videoShown: document.querySelector('#qsView').style.display !== 'none',
    calls: (window.__bdCalls || []).length, tags: [...new Set(window.__bdCalls || [])]
  }));
  ok('cameraViewOpens', opened.videoShown, 'el visor s\'obre');
  ok('itKeepsLooking', opened.calls >= 2, opened.calls + ' intents de lectura sobre ' + opened.tags.join());
  ok('itReadsTheVideoDirectly', opened.tags.includes('VIDEO'), 'passa el <video> al detector, sense canvas intermedi');
  const got = await p.evaluate(async () => {
    window.__bdNext = 'CODI-DEL-QR-EN-VIU';
    await new Promise(r => setTimeout(r, 900));
    return { code: window.__code, modalGone: !document.querySelector('#qsView') };
  });
  ok('codeReachesTheCaller', got.code === 'CODI-DEL-QR-EN-VIU', got.code);
  ok('scannerClosesOnSuccess', got.modalGone, 'es tanca sol: ja no hi ha res a mirar');
  const stopped = await p.evaluate(() => {
    const s = document.querySelector('video');
    return !s;
  });
  ok('cameraIsReleased', stopped, 'el visor desapareix i la càmera s\'allibera');
  ok('noErrors4', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 5. Una imatge triada també val ═══
{
  const { ctx, p, errs } = await open();
  await p.evaluate((fake) => { eval(fake); window.__SOS.render(); window.__SOS.openQRScanner(c => { window.__code = c; }); }, FAKE_BD);
  await p.waitForTimeout(400);
  await p.evaluate(() => { window.__bdNext = 'CODI-DE-LA-FOTO'; });
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==', 'base64');
  await p.setInputFiles('#qsFile', { name: 'qr.png', mimeType: 'image/png', buffer: png });
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => ({ code: window.__code }));
  ok('photoIsRead', r.code === 'CODI-DE-LA-FOTO', r.code);
  // i una foto sense QR ho diu, en comptes de callar
  await p.evaluate((fake) => { eval(fake); window.__bdNext = null; window.__SOS.openQRScanner(() => {}); }, FAKE_BD);
  await p.waitForTimeout(400);
  await p.setInputFiles('#qsFile', { name: 'buida.png', mimeType: 'image/png', buffer: png });
  await p.waitForTimeout(700);
  const none = await p.evaluate(() => (document.querySelector('#qsOut') || {}).innerText || '');
  ok('emptyPhotoSaysSo', /no s'hi ha trobat cap qr/i.test(none), none.trim().slice(0, 60));
  ok('emptyPhotoSuggestsWhatToDo', /més nítida|més a prop/i.test(none), 'i què provar');
  ok('noErrors5', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ═══ 6. Enganxat al lloc on serveix: aparellar ═══
{
  const { ctx, p, errs } = await open();
  await p.evaluate((fake) => { eval(fake); window.__SOS.render(); window.__SOS.openSyncModal(); }, FAKE_BD);
  await p.waitForTimeout(500);
  await p.click('#syRoleB');
  await p.waitForTimeout(300);
  const there = await p.evaluate(() => !!document.querySelector('#syScan'));
  ok('joinerCanScan', there, 'el botó d\'escanejar és a la pantalla de qui rep la invitació');
  const filled = await p.evaluate(async () => {
    window.__bdNext = 'CODI-INVITACIO-ESCANEJAT';
    document.querySelector('#syScan').click();
    await new Promise(r => setTimeout(r, 400));
    const f = document.querySelector('#qsFile');
    return { scannerOpen: !!f };
  });
  ok('scanOpensTheScanner', filled.scannerOpen, 'obre l\'escàner, no un altre lloc');
  ok('noErrors6', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

await b.close();
const failed = Object.entries(results).filter(([, v]) => !v).map(([k]) => k);
console.log('\n' + (failed.length ? '❌ FAILED (' + failed.length + '): ' + failed.join(', ') : '✅ ALL PASSED (' + Object.keys(results).length + ')'));
process.exit(failed.length ? 1 : 0);
