/* Restaurar una còpia i que el tauler surti en blanc.
   Reportat per qui fa servir l'app. Dues causes, i totes dues valen la pena:

   1 · Una còpia antiga porta nodes sense els camps que s'han anat afegint
       —`vna`, `kanban`, `ledger` a `null`— i el codi que els llegeix dona per
       fet que hi són.
   2 · I quan una vista peta, `renderWorkspace` **ja ha buidat** la pantalla:
       queda un blanc mut. Vist des de fora, «s'ha trencat l'app», «he perdut
       les dades» i «no hi ha res» s'assemblen molt, i només una és certa.

   Per això aquí es prova el cicle sencer de debò —exportar, esborrar, importar,
   recarregar— i també el pitjor cas: què veu la persona quan alguna cosa peta. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

console.log('\n1 · El cicle sencer: exportar, substituir, recarregar');
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(APP);
  await p.waitForFunction(() => window.__SOS);
  const pack = await p.evaluate(async () => {
    const S = window.__SOS; await S.markOnboardingDone();
    const mu = S.newNode('Torrelles', 'municipi', null); S.state.nodes.push(mu); await S.persist(mu);
    const n = S.newNode('Banc de temps', 'projecte', mu.id);
    n.dynamicType = 'banc_temps'; S.seedFromDynamic(n, S.dynById('banc_temps'));
    const m = S.newMember({ name: 'Marta Vidal' }); S.membersOf(n).push(m);
    S.offersOf(n).push(S.newOffer({ kind: 'oferta', category: 'cuina', memberId: m.id, title: 'Cuino' }));
    S.state.nodes.push(n); await S.persist(n);
    await S.setActivePersona('Marta Vidal');
    return await S.exportBackup('');
  });
  await p.evaluate(async (pk) => { await window.__SOS.importBackup(pk, '', { mode: 'replace' }); }, pack);
  await p.reload();
  await p.waitForFunction(() => window.__SOS, null, { timeout: 20000 });
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const w = document.querySelector('#workspace');
    return { nodes: window.__SOS.state.nodes.length, persona: window.__SOS.state.activePersona,
      chars: (w.innerText || '').trim().length, ops: !!w.querySelector('#opsPanel') };
  });
  ok(r.nodes === 2 && r.persona === 'Marta Vidal', 'torna amb ' + r.nodes + ' nodes i la persona activa');
  ok(r.chars > 200 && r.ops, 'i el tauler es pinta amb el taulell (' + r.chars + ' caràcters)');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n══ El que importa: una còpia antiga no pot deixar la pantalla en blanc ══');

console.log('\n2 · Nodes d\'una versió anterior, amb camps que llavors no existien');
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(APP);
  await p.waitForFunction(() => window.__SOS);
  /* Tal com els escriuria una còpia d'abans: sense `vna`, sense `kanban`,
     amb `ledger` a null i sense els camps de les tandes recents. */
  const antic = [
    { id: 'v1', name: 'Municipi antic', nodeLevel: 'municipi', parentId: null,
      ledger: null, createdAt: '', updatedAt: '' },
    { id: 'v2', name: 'Projecte antic', nodeLevel: 'projecte', parentId: 'v1',
      vna: null, kanban: null, ledger: null, members: null, createdAt: '', updatedAt: '' },
    { id: '__persona', type: 'meta', name: 'Marta Vidal' }
  ];
  await p.evaluate(async (recs) => {
    const S = window.__SOS; await S.markOnboardingDone();
    await S.importBackup({ type: 'sos-full-backup', data: { records: recs } }, '', { mode: 'replace' });
  }, antic);
  await p.reload();
  await p.waitForFunction(() => window.__SOS, null, { timeout: 20000 });
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const S = window.__SOS, w = document.querySelector('#workspace');
    const n = S.byId('v2');
    return { nodes: S.state.nodes.length, chars: (w.innerText || '').trim().length,
      vna: !!(n && n.vna && Array.isArray(n.vna.roles)),
      kanban: !!(n && n.kanban && Array.isArray(n.kanban.cards)),
      ledger: Array.isArray(n && n.ledger) };
  });
  ok(r.nodes === 2 && r.chars > 200, 'el tauler es pinta amb la còpia antiga (' + r.chars + ' caràcters)');
  ok(r.vna && r.kanban && r.ledger,
    'i els camps que hi faltaven s\'han normalitzat en llegir-los, buits: no s\'inventa contingut');
  /* I ara entrant a cada pestanya del node antic, que és on petava. */
  const tabs = await p.evaluate(async () => {
    const S = window.__SOS; S.selectNode('v2');
    const out = {};
    for (const t of ['resum', 'map', 'kanban', 'socis', 'ledger', 'banctemps']) {
      S.state.tab = t; S.renderWorkspace();
      await new Promise(r => setTimeout(r, 60));
      const w = document.querySelector('#workspace');
      out[t] = { chars: (w.innerText || '').trim().length,
        error: !!w.querySelector('.merge-warn-t') };
    }
    return out;
  });
  const totes = Object.entries(tabs);
  ok(totes.every(([, v]) => v.chars > 50), 'cap pestanya es queda en blanc: ' +
    totes.map(([k, v]) => k + ' ' + v.chars).join(' · '));
  ok(totes.every(([, v]) => !v.error), 'i cap ha d\'ensenyar la pantalla d\'error');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n3 · I si tot i així alguna cosa peta, no es queda en blanc');
/* És el pitjor cas i el que fa que això sigui estable: cap dada futura que no
   hàgim previst pot tornar a deixar una pantalla muda. */
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(APP);
  await p.waitForFunction(() => window.__SOS && window.__SOS.paintRenderError);
  const r = await p.evaluate(async () => {
    const S = window.__SOS; await S.markOnboardingDone();
    const n = S.newNode('T', 'municipi', null); S.state.nodes.push(n); await S.persist(n);
    S.render();
    const w = document.querySelector('#workspace');
    S.paintRenderError(w, new Error('dada inesperada'), 'la portada «tauler»');
    const txt = w.innerText.replace(/\s+/g, ' ');
    const btns = [...w.querySelectorAll('button')].map(x => x.textContent.trim());
    /* La sortida ha de funcionar de debò, no ser un botó decoratiu. */
    w.querySelector('button').click();
    await new Promise(r => setTimeout(r, 250));
    return { txt, btns, tornat: !S.state.activeId && S.state.homeView === 'tauler',
      pintaDesprés: (document.querySelector('#workspace').innerText || '').trim().length };
  });
  ok(/no s’ha pogut pintar|no s'ha pogut pintar/.test(r.txt),
    'diu que la pantalla no s\'ha pogut pintar, en comptes de callar');
  ok(/dada inesperada/.test(r.txt) && /portada «tauler»/.test(r.txt),
    'diu QUÈ ha fallat i ON: no un «hi ha hagut un error»');
  ok(/no s’ha tocat|no s'ha tocat/.test(r.txt),
    'i diu el que sí que se sap del cert: que el que hi ha desat segueix sencer');
  ok(r.btns.length >= 3 && /tauler/i.test(r.btns[0]),
    'amb sortides de debò: ' + r.btns.join(' · '));
  ok(r.tornat && r.pintaDesprés > 100,
    'i la primera funciona: torna al tauler i el tauler es pinta');
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
