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
  await p.goto(APP); await p.waitForFunction(() => window.__SOS, null, { timeout: 30000 });
  try { await p.waitForSelector('#obSkip', { timeout: 3000 }); await p.click('#obSkip'); } catch (e) {}
  await p.waitForTimeout(400);
  await p.evaluate(() => { try { window.__SOS.markOnboardingDone(); } catch (e) {} document.querySelectorAll('.modal-bg').forEach(m => m.remove()); });
  return { ctx, p, errs };
}

/* 500 nodes i 5.000 apunts. No és una xifra rodona per fer bonic: és l'ordre de
   magnitud d'una comarca amb els seus municipis, barris i projectes al cap d'un
   parell d'anys. Si el SOS s'ofega aquí, s'ofegarà amb la primera comunitat que
   el faci servir de debò. */
const BIG = `
  const S=window.__SOS;
  const t0=performance.now();
  const N=500, L=5000;
  const cat=['reparacions','cuina','idiomes','transport','infants'];
  const typ=['bricolatge','cuina','jardineria','electronica','jocs'];
  const pais={id:'CAT',name:'Catalunya',nodeLevel:'pais',parentId:null,dynamicType:'',
    metaskill:{},vna:{roles:[],exchanges:[]},kanban:{cards:[]},ledger:[],members:[],objects:[],offers:[],
    lat:41.8,lon:1.6,createdAt:'',updatedAt:''};
  S.state.nodes.push(pais);
  const nodes=[pais];
  for(let i=0;i<N;i++){
    const parent=nodes[Math.floor(Math.random()*Math.min(nodes.length,40))];
    const n={id:'N'+i,name:'Node '+i,nodeLevel:i%5===0?'municipi':'projecte',parentId:parent.id,
      dynamicType:i%2?'banc_temps':'biblioteca_coses',
      metaskill:{},vna:{roles:[],exchanges:[]},kanban:{cards:[]},ledger:[],members:[],objects:[],offers:[],
      createdAt:'',updatedAt:new Date().toISOString()};
    for(let m=0;m<6;m++)n.members.push(S.newMember({name:'Persona '+i+'-'+m,kind:'persona'}));
    for(let o=0;o<3;o++)n.offers.push(S.newOffer({kind:o%2?'demanda':'oferta',title:'Cosa '+o,
      category:cat[o%cat.length],memberId:n.members[o%6].id}));
    for(let o=0;o<2;o++)n.objects.push(S.newObject({name:'Objecte '+o,typology:typ[o%typ.length],ownerId:n.members[o%6].id}));
    S.state.nodes.push(n);nodes.push(n);
  }
  // 5.000 apunts repartits
  for(let e=0;e<L;e++){
    const n=nodes[1+(e%N)];
    n.ledger.push({id:'E'+e,who:n.members[e%6].name,what:'Aportació '+e,type:e%7===0?'moneda':'temps',
      value:1,memberId:n.members[e%6].id,counterpartId:e%3===0?n.members[(e+1)%6].id:null,
      ts:new Date(Date.now()-e*6e4).toISOString(),hash:'h'+e,sig:'s'+e,signer:{did:'did:sos:x'}});
  }
  S.state.activeId='N1';
  window.__BUILD=performance.now()-t0;
`;

const time = `
  window.__T=async(label,fn)=>{const a=performance.now();const r=await fn();return{label,ms:Math.round(performance.now()-a),n:(r&&r.length)||0};};
`;

// ═══ 1. Construir i pintar 500 nodes ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (args) => {
    const [big, t] = args;
    eval(big); eval(t);
    const S = window.__SOS;
    const out = {};
    out.build = Math.round(window.__BUILD);
    out.render = (await window.__T('render', () => { S.render(); return []; })).ms;
    out.render2 = (await window.__T('render2', () => { S.render(); return []; })).ms;
    out.nodes = S.state.nodes.length;
    out.entries = S.state.nodes.reduce((a, n) => a + (n.ledger || []).length, 0);
    out.domNodes = document.querySelectorAll('*').length;
    return out;
  }, [BIG, time]);
  console.log('   · ' + r.nodes + ' nodes · ' + r.entries + ' apunts · DOM ' + r.domNodes + ' elements');
  ok('scaleIsWhatWeAskedFor', r.nodes === 501 && r.entries === 5000, r.nodes + ' / ' + r.entries);
  ok('firstRenderUnder2s', r.render < 2000, r.render + ' ms');
  ok('reRenderUnder1s', r.render2 < 1000, r.render2 + ' ms');
  ok('domStaysReasonable', r.domNodes < 20000, r.domNodes + ' elements al DOM');
  ok('noErrors1', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

// ═══ 2. Les funcions que recorren tot el SOS ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (args) => {
    const [big, t] = args;
    eval(big); eval(t);
    const S = window.__SOS;
    S.render();
    const out = {};
    for (const [k, fn] of [
      ['ledgerIndex', () => S.ledgerIndex()],
      ['supplyIndex', () => S.supplyIndex()],
      ['searchSupply', () => S.searchSupply('cosa', { from: S.myPlace() })],
      ['supplyMatches', () => S.supplyMatches('', { from: S.myPlace() })],
      ['knownPersons', () => S.knownPersons()],
      ['dashboardAttention', () => S.dashboardAttention()],
      ['rolesOfPerson', () => S.rolesOfPerson('Persona 3-1')],
      ['personProfile', () => [S.personProfile('Persona 3-1')]],
      ['circularStats', () => [S.circularStats(S.byId('N2'))]],
      ['supplyPublicPack', () => [S.supplyPublicPack()]]
    ]) out[k] = await window.__T(k, fn);
    return out;
  }, [BIG, time]);
  Object.values(r).forEach(x => console.log('   · ' + x.label.padEnd(20) + x.ms + ' ms' + (x.n ? ' (' + x.n + ' files)' : '')));
  const slow = Object.values(r).filter(x => x.ms > 1500).map(x => x.label + ' ' + x.ms + 'ms');
  ok('noWholeSosScanOver1500ms', slow.length === 0, slow.join(', ') || 'cap per sobre d\'1,5 s');
  ok('ledgerIndexUnder1s', r.ledgerIndex.ms < 1000, r.ledgerIndex.ms + ' ms per a 5.000 apunts');
  ok('searchStaysUsable', r.searchSupply.ms < 800, r.searchSupply.ms + ' ms');
  ok('rolesAreCheap', r.rolesOfPerson.ms < 500, r.rolesOfPerson.ms + ' ms');
  ok('noErrors2', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

// ═══ 3. La comprovació de fuita, que és la més cara de totes ═══
{
  const { ctx, p, errs } = await open();
  const r = await p.evaluate(async (args) => {
    const [big, t] = args;
    eval(big); eval(t);
    const S = window.__SOS;
    // publiquem 20 nodes: un cas realista, no tot Catalunya de cop
    S.state.nodes.slice(1, 21).forEach(n => { n.publish = { skills: true, objects: true }; });
    const pack = await window.__T('supplyPublicPack', () => [S.supplyPublicPack()]);
    const p1 = S.supplyPublicPack();
    const leak = await window.__T('verifyNoLeak', () => [S.verifyNoLeak(p1)]);
    return { pack: pack.ms, leak: leak.ms, rows: p1.count, clean: S.verifyNoLeak(p1).ok };
  }, [BIG, time]);
  console.log('   · pack ' + r.pack + ' ms · verifyNoLeak ' + r.leak + ' ms · ' + r.rows + ' files');
  ok('packBuildsFast', r.pack < 1500, r.pack + ' ms');
  ok('leakCheckIsAffordable', r.leak < 3000, r.leak + ' ms — es fa un cop per publicació, però no pot penjar la pestanya');
  ok('leakCheckStillCorrect', r.clean, 'i segueix dient que està net');
  ok('noErrors3', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

// ═══ 4. Accessibilitat · el que es pot comprovar sense opinar ═══
{
  const { ctx, p, errs } = await open();
  /* Comprovar l'accessibilitat de la pantalla d'entrada buida no comprova res:
     no hi ha ni camps ni imatges, i tot passa per no haver-hi res. Es carrega un
     node amb dades i s'obre un formulari de debò. */
  await p.evaluate(async (big) => {
    eval(big);
    const S = window.__SOS;
    S.state.nodes = S.state.nodes.slice(0, 30);
    S.state.activeId = 'N1'; S.state.tab = 'socis'; S.render();
    S.openMemberForm(S.byId('N1'), null);
    await new Promise(r => setTimeout(r, 300));
  }, BIG);
  const r = await p.evaluate(() => {
    const out = {};
    out.lang = document.documentElement.getAttribute('lang');
    out.title = !!(document.title || '').trim();
    // Cap tabindex positiu: trenca l'ordre natural de tabulació
    out.positiveTab = [...document.querySelectorAll('[tabindex]')]
      .filter(e => Number(e.getAttribute('tabindex')) > 0).length;
    // Tot botó ha de tenir nom accessible
    const named = e => !!((e.innerText || '').trim() || e.getAttribute('aria-label') || e.getAttribute('title') ||
      (e.getAttribute('aria-labelledby') && document.getElementById(e.getAttribute('aria-labelledby'))));
    const btns = [...document.querySelectorAll('button')].filter(e => e.offsetParent !== null || e.id);
    out.unnamed = btns.filter(e => !named(e)).map(e => e.id || e.className).slice(0, 6);
    out.btns = btns.length;
    // Imatges amb alt
    out.imgNoAlt = [...document.querySelectorAll('img')].filter(e => !e.hasAttribute('alt')).length;
    // Camps de formulari amb etiqueta
    const labelled = e => !!(e.getAttribute('aria-label') || e.getAttribute('placeholder') ||
      (e.id && document.querySelector('label[for="' + e.id + '"]')) || e.closest('label') ||
      (e.closest('.field') && e.closest('.field').querySelector('label')));
    const fields = [...document.querySelectorAll('input,select,textarea')].filter(e => e.type !== 'hidden');
    out.unlabelled = fields.filter(e => !labelled(e)).map(e => e.id || e.name || e.type).slice(0, 6);
    out.fields = fields.length;
    // Un sol h1 i sense salts de nivell
    const hs = [...document.querySelectorAll('h1,h2,h3,h4')].filter(e => e.offsetParent !== null)
      .map(e => Number(e.tagName[1]));
    /* Els <h1> amagats (la portada quan ja hi ha nodes) no els llegeix ningú:
       compten els visibles, que són els que un lector de pantalla anuncia. */
    out.h1 = [...document.querySelectorAll('h1')].filter(e => e.offsetParent !== null).length;
    out.jumps = hs.filter((n, i) => i && n - hs[i - 1] > 1).length;
    return out;
  });
  ok('pageDeclaresItsLanguage', r.lang === 'ca', 'lang=' + r.lang);
  ok('pageHasATitle', r.title, 'té <title>');
  ok('noPositiveTabindex', r.positiveTab === 0, r.positiveTab + ' tabindex positius');
  ok('thereWereButtonsToCheck', r.btns >= 10, r.btns + ' botons visibles');
  ok('everyButtonHasAName', r.unnamed.length === 0, r.unnamed.join(', ') || r.btns + ' botons, tots amb nom');
  ok('everyImageHasAlt', r.imgNoAlt === 0, r.imgNoAlt + ' imatges sense alt');
  ok('thereWereFieldsToCheck', r.fields >= 3, r.fields + ' camps a la pantalla — si fossin 0, el test no comprovaria res');
  ok('everyFieldIsLabelled', r.unlabelled.length === 0, r.unlabelled.join(', ') || r.fields + ' camps etiquetats');
  ok('exactlyOneH1', r.h1 === 1, r.h1 + ' <h1>');
  ok('noHeadingJumps', r.jumps === 0, r.jumps + ' salts de nivell');
  ok('noErrors4', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

// ═══ 5. Teclat: es pot arribar i sortir sense ratolí ═══
{
  const { ctx, p, errs } = await open();
  const reachable = await p.evaluate(() => {
    const sel = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const vis = [...document.querySelectorAll(sel)].filter(e => e.offsetParent !== null);
    return { n: vis.length, first: vis[0] && (vis[0].id || vis[0].tagName) };
  });
  ok('thereIsSomethingToTabTo', reachable.n > 3, reachable.n + ' elements enfocables · el primer és ' + reachable.first);
  await p.evaluate(() => window.__SOS.openSupplySearch());
  await p.waitForTimeout(400);
  const inModal = await p.evaluate(() => {
    const m = document.querySelector('.modal');
    const sel = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])';
    return { n: m ? m.querySelectorAll(sel).length : 0, active: document.activeElement && document.activeElement.tagName };
  });
  ok('modalIsKeyboardOperable', inModal.n > 2, inModal.n + ' controls dins del modal');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  const closed = await p.evaluate(() => !document.querySelector('.modal-bg'));
  ok('escapeClosesTheModal', closed, 'Escape tanca: sortir sense ratolí');
  ok('noErrors5', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

// ═══ 6. Amb 500 nodes, la pantalla petita segueix sense desbordar ═══
{
  const { ctx, p, errs } = await open({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
  const r = await p.evaluate(async (big) => {
    eval(big);
    window.__SOS.render();
    await new Promise(r => setTimeout(r, 300));
    return { overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      /* Que un fill surti del seu contenidor no és un defecte si el contenidor
         llisca: la barra de pestanyes ho fa a posta. El que no pot passar és
         que llisqui la PÀGINA. */
      wide: [...document.querySelectorAll('body *')].filter(e => {
        if (e.getBoundingClientRect().right <= document.documentElement.clientWidth + 0.5) return false;
        let par = e.parentElement;
        while (par && par !== document.body) {
          if (/auto|scroll/.test(getComputedStyle(par).overflowX)) return false;
          par = par.parentElement;
        }
        return true;
      }).map(e => e.className || e.tagName).slice(0, 4) };
  }, BIG);
  ok('noHorizontalOverflowAtScale', r.overflow <= 0, r.overflow + ' px de desbordament');
  ok('nothingSticksOut', r.wide.length === 0, r.wide.join(', ') || 'res surt de la pantalla');
  ok('noErrors6', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

await b.close();
const failed = Object.entries(results).filter(([, v]) => !v).map(([k]) => k);
console.log('\n' + (failed.length ? '❌ FAILED (' + failed.length + '): ' + failed.join(', ') : '✅ ALL PASSED (' + Object.keys(results).length + ')'));
process.exit(failed.length ? 1 : 0);
