/* L'aplicació deixa de ser un cul-de-sac
   ─────────────────────────────────────────────────────────────────────────
   Les setze pàgines del SOS porten al SOS —«Obre SOS →» a la barra—, i de dins
   de l'aplicació no hi havia manera d'arribar a cap d'elles. Ni al mapa de
   valor, ni a La Compra, ni a L'Energia, ni a la MATRIU. Els dos enllaços a
   `compra.html` i `vna.html` que hi havia al fitxer eren **comentaris**.

   Això no peta mai: qui és a dins simplement no sap que existeixen.

   Aquí es prova el que ho arregla, als dos nivells:

   · **Accés** — una entrada de menú obre les eines, i la llista és la mateixa
     declaració que pinta el menú de les setze pàgines (`tools/build-nav.js`),
     no una segona còpia.
   · **Integració** — des d'un projecte d'un tipus que té eina, l'eina surt a
     la fitxa del projecte. I no surt on no toca: ni a les dinàmiques que es fan
     dins de l'app, ni a les que encara no en tenen. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const APP = 'file://' + join(DIR, 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await b.newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.einaDe);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

console.log('\n1 · La llista d\'eines és la declarada, i no una còpia');
{
  const r = await page.evaluate(() => {
    const S = window.__SOS, D = S.EINES_SOS;
    return { grups: D.grups.map(g => ({ lbl: g.lbl, n: g.links.length })),
      destins: D.grups.flatMap(g => g.links.map(l => l.h)),
      eines: D.eines,
      capApp: D.grups.flatMap(g => g.links).filter(l => l.h === 'index.html').length,
      senseText: D.grups.flatMap(g => g.links).filter(l => !l.t || !l.d).length };
  });
  ok(r.grups.length === 4 && r.destins.length >= 15,
    `hi ha ${r.grups.length} grups i ${r.destins.length} destins: ${r.grups.map(g => g.lbl + ' ' + g.n).join(' · ')}`);
  ok(r.capApp === 0, 'i l\'aplicació no s\'ofereix a si mateixa: ja hi ets');
  ok(r.senseText === 0, 'cada destí porta nom i una línia del que hi trobaràs');
  /* El contrast que val: els fitxers existeixen de debò al disc. */
  const morts = r.destins.filter(h => !existsSync(join(DIR, h)));
  ok(morts.length === 0, 'i tots els destins són un fitxer que existeix' + (morts.length ? ': ' + morts.join(', ') : ''));
  const einesMortes = [...new Set(Object.values(r.eines).map(e => e[0]))].filter(h => !existsSync(join(DIR, h)));
  ok(einesMortes.length === 0,
    `les ${Object.keys(r.eines).length} eines per dinàmica també` + (einesMortes.length ? ': ' + einesMortes.join(', ') : ''));
}

console.log('\n2 · El menú les obre, i s\'obren fora');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS;
    document.querySelector('#btnEines').click();
    await new Promise(r2 => setTimeout(r2, 200));
    const m = document.querySelector('.modal');
    const cartes = [...document.querySelectorAll('.eina-c')];
    const out = { obert: !!m,
      cartes: cartes.length,
      grups: document.querySelectorAll('#einesBox .dd-lbl').length,
      fora: cartes.filter(a => a.getAttribute('target') === '_blank').length,
      segures: cartes.filter(a => (a.getAttribute('rel') || '').includes('noopener')).length,
      destins: cartes.map(a => a.getAttribute('href')),
      ruta: !!S.MODAL_ROUTES.eines };
    document.querySelector('#einesClose').click();
    await new Promise(r2 => setTimeout(r2, 120));
    out.tancat = !document.querySelector('.modal');
    return out;
  });
  ok(r.obert && r.cartes >= 15, `el menú obre les eines: ${r.cartes} targetes en ${r.grups} grups`);
  ok(r.fora === r.cartes && r.segures === r.cartes,
    'totes s\'obren en una pestanya nova i amb noopener: el que fas al SOS no es perd');
  ok(new Set(r.destins).size === r.destins.length, 'i cap destí surt dues vegades');
  ok(r.ruta, 'té ruta pròpia, o sigui que s\'hi pot enllaçar des de fora');
  ok(r.tancat, 'i es tanca');
}

console.log('\n3 · Des d\'un projecte, l\'eina del seu tipus');
{
  const r = await page.evaluate(async () => {
    const S = window.__SOS;
    const mira = async din => {
      const n = S.newNode('Prova ' + din, 'projecte', null);
      n.dynamicType = din;
      S.seedFromDynamic(n, S.dynById(din));
      S.state.nodes.push(n); await S.persist(n);
      S.selectNode(n.id);
      await new Promise(r2 => setTimeout(r2, 260));
      const a = document.querySelector('.dd-eina');
      return { h: a ? a.getAttribute('href') : null, txt: a ? a.textContent.trim() : null,
        target: a ? a.getAttribute('target') : null,
        nota: !!document.querySelector('.dd-eina-d'),
        recursos: !!document.querySelector('.dd-res') };
    };
    const out = {};
    for (const d of ['comunitat_energetica', 'habitatge_cessio', 'consum_agroecologic',
      'matriu', 'banc_temps', 'suport_mutu']) out[d] = await mira(d);
    return out;
  });
  ok(r.comunitat_energetica.h === 'energia.html' && /L'Energia/.test(r.comunitat_energetica.txt),
    `un projecte de comunitat energètica ofereix L'Energia: «${r.comunitat_energetica.txt}»`);
  ok(r.habitatge_cessio.h === 'habitatge.html' && r.consum_agroecologic.h === 'compra.html'
    && r.matriu.h === 'matriu.html',
    'i cada tipus la seva: habitatge → L\'Habitatge, consum → La Compra, matriu → La MATRIU');
  ok(r.comunitat_energetica.target === '_blank' && r.comunitat_energetica.nota,
    's\'obre en una pestanya nova i la fitxa diu que el que hi calculis no torna sol');
  /* On NO ha de sortir, que és la meitat del disseny. */
  ok(r.banc_temps.h === null,
    'el banc de temps no n\'ofereix cap: es fa dins de l\'app i un enllaç a l\'app des de l\'app no porta enlloc');
  ok(r.suport_mutu.h === null,
    'i el suport mutu tampoc: encara no té eina, i inventar-li una porta seria pitjor que no tenir-ne');
  ok(r.comunitat_energetica.recursos,
    'i els recursos externs del catàleg segueixen sortint al costat, com abans');
}

console.log('\n4 · Sense el bloc generat, l\'app no peta');
{
  /* Si algú se salta el generador, el pitjor que pot passar és que no hi hagi
     eines. El que no pot passar és que l'aplicació no arrenqui. */
  /* Es fa amb una còpia en un fitxer temporal i no interceptant la petició:
     `route.fetch` no sap parlar `file:`, i l'app s'ha de carregar igual que a
     la resta de proves. */
  const cru = readFileSync(join(DIR, 'index.html'), 'utf8');
  const sense = join(tmpdir(), 'sos-sense-eines-' + Date.now() + '.html');
  writeFileSync(sense, cru.replace(/<script id="sos-eines"[\s\S]*?<\/script>/, ''));
  const c2 = await b.newContext();
  const p2 = await c2.newPage();
  const e2 = []; p2.on('pageerror', e => e2.push(e.message));
  try {
    await p2.goto('file://' + sense);
    await p2.waitForFunction(() => window.__SOS && window.__SOS.einaDe, { timeout: 20000 });
    const r = await p2.evaluate(() => ({
      grups: window.__SOS.EINES_SOS.grups.length,
      eina: window.__SOS.einaDe('comunitat_energetica'),
      viu: !!document.querySelector('.topbar')
    }));
    ok(r.grups === 0 && r.eina === null, 'sense bloc no hi ha eines, i `einaDe` torna null en comptes de petar');
    ok(r.viu && e2.length === 0, 'i l\'aplicació arrenca igualment' + (e2.length ? ': ' + e2[0] : ''));
  } finally {
    await c2.close();
    try { unlinkSync(sense); } catch (e) { /* ja no hi és */ }
  }
}

ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
