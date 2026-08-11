/* V82 · E10 · L'escala de comarca, mesurada abans de prometre-la.
   `test-escala` prova 500 nodes i 5.000 apunts, que és un cas sintètic. Una
   comarca de debò té una altra forma: molts nodes geogràfics buits, uns quants
   projectes vius i tota la gent concentrada en aquests pocs. Aquesta forma és la
   que fa mal, i no s'havia mesurat mai.

   Aquest fitxer no comprova cap regla nova: **posa números i té sostres**. Si
   algun dia una cosa que sembla innòcua els travessa, aquí saltarà —i pujar un
   sostre serà una decisió escrita, com a la guarda de KISS. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

/* Sostres declarats. Generosos a posta: han de saltar per una regressió gran,
   no per una màquina lenta un dimarts. */
const SOSTRE_SALUT_KB = 40;      // el que viatja en presentar-se
const SOSTRE_FUSIO_MS = 4000;    // fusionar la comarca sencera de zero
const SOSTRE_RENDER_MS = 2500;   // pintar la portada amb tot això a sobre
const SOSTRE_INDEX_MS = 400;     // calcular l'índex de sincronització

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await b.newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.syncIndex);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

console.log('\n1 · Una comarca amb la forma que tenen les comarques');
const fet = await page.evaluate(async () => {
  const S = window.__SOS;
  const t0 = performance.now();
  const com = S.newNode('Alt Penedès', 'comarca', null);
  S.state.nodes.push(com); await S.persist(com);
  const munis = [];
  for (let i = 0; i < 27; i++) {
    const m = S.newNode('Municipi ' + i, 'municipi', com.id);
    S.state.nodes.push(m); await S.persist(m); munis.push(m);
    for (let j = 0; j < 3; j++) {
      const bar = S.newNode('Barri ' + i + '-' + j, 'barri', m.id);
      S.state.nodes.push(bar); await S.persist(bar);
    }
  }
  /* Sis projectes vius, que és el que hi ha de debò a una comarca que comença:
     no un a cada poble. La gent es concentra en pocs llocs. */
  let apunts = 0, gent = 0;
  for (let k = 0; k < 6; k++) {
    const n = S.newNode('Projecte ' + k, 'projecte', munis[k * 4].id);
    n.dynamicType = k % 2 ? 'banc_temps' : 'biblioteca_coses';
    S.seedFromDynamic(n, S.dynById(n.dynamicType));
    const ms = [];
    for (let p = 0; p < 25; p++) {
      const m = S.newMember({ name: 'Persona ' + k + '-' + p });
      S.membersOf(n).push(m); ms.push(m); gent++;
    }
    for (let e = 0; e < 120; e++) {
      await S.pushLedger(n.ledger, { id: 'e' + k + '-' + e,
        ts: new Date(Date.now() - e * 86400000 / 4).toISOString(),
        type: 'temps', value: 2, memberId: ms[e % ms.length].id,
        category: ['cuina', 'cures', 'reparacions', 'jardineria'][e % 4] });
      apunts++;
    }
    S.state.nodes.push(n); await S.persist(n);
  }
  return { ms: Math.round(performance.now() - t0), nodes: S.state.nodes.length, apunts, gent };
});
ok(fet.nodes > 100 && fet.apunts === 720,
  fet.nodes + ' nodes · ' + fet.gent + ' persones · ' + fet.apunts + ' apunts signats · muntat en ' +
  (fet.ms / 1000).toFixed(1) + ' s');

console.log('\n2 · El que viatja en presentar-se');
const salut = await page.evaluate(() => {
  const S = window.__SOS;
  const t0 = performance.now();
  const idx = S.syncIndex();
  const tIdx = performance.now() - t0;
  const nou = JSON.stringify({ type: 'hello', proto: S.SYNC_PROTO, me: {}, idx,
    tombstones: S.state.tombstones }).length;
  const abans = JSON.stringify({ type: 'hello', me: {}, nodes: S.state.nodes,
    entities: S.state.entities, tombstones: S.state.tombstones }).length;
  return { kb: nou / 1024, abansKb: abans / 1024, tIdx: Math.round(tIdx), n: idx.length };
});
ok(salut.kb < SOSTRE_SALUT_KB,
  'la salutació són ' + salut.kb.toFixed(1) + ' KB (sostre ' + SOSTRE_SALUT_KB +
  ') · abans n\'eren ' + Math.round(salut.abansKb));
ok(salut.tIdx < SOSTRE_INDEX_MS,
  'i calcular l\'índex de ' + salut.n + ' entrades costa ' + salut.tIdx + ' ms (sostre ' + SOSTRE_INDEX_MS + ')');

console.log('\n3 · Rebre-ho tot de zero, que és el pitjor cas real');
const fusio = await page.evaluate(async () => {
  const S = window.__SOS;
  const copia = JSON.parse(JSON.stringify({ nodes: S.state.nodes, entities: S.state.entities }));
  const nodes = S.state.nodes, ents = S.state.entities;
  /* Es buida i es torna a rebre sencer: és el que li passa a qui s'acaba
     d'instal·lar el SOS i s'aparella amb algú de la seva comarca. */
  S.state.nodes = []; S.state.entities = [];
  const t0 = performance.now();
  await S.mergeIncoming({ nodes: copia.nodes, entities: copia.entities, tombstones: {} });
  const ms = Math.round(performance.now() - t0);
  const rebut = S.state.nodes.length;
  const apunts = S.state.nodes.reduce((a, n) => a + ((n.ledger || []).length), 0);
  S.state.nodes = nodes; S.state.entities = ents;
  return { ms, rebut, apunts };
});
ok(fusio.rebut > 100 && fusio.apunts === 720,
  'arriba sencer: ' + fusio.rebut + ' nodes i ' + fusio.apunts + ' apunts, cap perdut');
ok(fusio.ms < SOSTRE_FUSIO_MS,
  'i la fusió costa ' + fusio.ms + ' ms (sostre ' + SOSTRE_FUSIO_MS + ')');

console.log('\n4 · I amb tot això a sobre, la portada encara pinta');
const render = await page.evaluate(async () => {
  const S = window.__SOS;
  S.state.activeId = null; S.state.homeView = 'tauler';
  const t0 = performance.now();
  S.render();
  await new Promise(r => setTimeout(r, 40));
  const tauler = Math.round(performance.now() - t0);
  const t1 = performance.now();
  S.state.homeView = 'mapa'; S.render();
  await new Promise(r => setTimeout(r, 40));
  const mapa = Math.round(performance.now() - t1);
  const t2 = performance.now();
  const at = S.dashboardAttention();
  const atMs = Math.round(performance.now() - t2);
  return { tauler, mapa, atMs, avisos: at.length };
});
ok(render.tauler < SOSTRE_RENDER_MS && render.mapa < SOSTRE_RENDER_MS,
  'tauler ' + render.tauler + ' ms · mapa ' + render.mapa + ' ms (sostre ' + SOSTRE_RENDER_MS + ')');
ok(render.atMs < SOSTRE_RENDER_MS,
  'i el tauler d\'atenció, que ho recorre tot, ' + render.atMs + ' ms amb ' + render.avisos + ' avisos');

console.log('\n5 · El que aquesta mesura NO diu');
/* Escrit com a asserció perquè no es llegeixi el verd d'aquest fitxer com una
   promesa més gran del que és. */
const honest = await page.evaluate(() => {
  const S = window.__SOS;
  return { nodes: S.state.nodes.length, gent: S.comandoRoster().length };
});
ok(honest.nodes < 300,
  'això és UNA comarca (' + honest.nodes + ' nodes), no una vegueria ni un país: ' +
  'el cas de deu comarques federades segueix sense mesurar-se');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
