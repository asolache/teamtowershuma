/* La portada del SOS · el teu tauler, qui ets, i el que ara serveix
 * ─────────────────────────────────────────────────────────────────────────────
 * L'app obria al tauler del node: quinze blocs que diuen què passa a fora.
 * El Kanban de la persona era una portada de segona a la qual s'arribava per
 * un botó secundari, i el perfil no tenia ni portada ni pestanya.
 *
 * El que es prova aquí és el que no es veuria mirant la pantalla:
 *
 * · **Que el càlcul decideixi alguna cosa.** Si el 80/20 torna la mateixa
 *   llista amb un estat buit i amb un estat ple, és decoratiu — i no ho
 *   notaria ningú, perquè sempre sortirien accions raonables. És la mateixa
 *   asserció que al diagnòstic d'organització va destapar que la segmentació
 *   no decidia res.
 * · **Que l'estat buit no sigui ni buit ni sencer.** Cap acció és una paret;
 *   trenta-sis és el directori que això venia a substituir.
 * · **Que no es tanqui cap porta.** El que s'amaga ha de tenir la clau a la
 *   mateixa pantalla, o és un calaix (vedes 62/63).
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
p.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await p.goto(APP);
await p.waitForFunction(() => window.__SOS, { timeout: 30000 });

/* ── 1 · La portada ──────────────────────────────────────────────────────── */
console.log('\n1 · En entrar, el teu tauler');
{
  const r = await p.evaluate(() => ({
    primera: window.__SOS.HOME_VIEWS[0],
    quantes: window.__SOS.HOME_VIEWS.length,
    estat: window.__SOS.state.homeView
  }));
  ok(r.primera === 'missions', 'la primera portada és el tauler de tasques · ' + r.primera);
  ok(r.estat === 'missions', 'i és la que l\'app té posada en arrencar');
  ok(r.quantes === 5, `segueixen sent ${r.quantes} portades: el sostre no s'ha tocat per fer això`);
}

/* ── 2 · Qui ets, a la pantalla ──────────────────────────────────────────── */
console.log('\n2 · El perfil deixa de viure només dins de modals');
{
  const r = await p.evaluate(() => {
    const S = window.__SOS;
    const w = document.createElement('div');
    S.state.activePersona = 'Prova Prova';
    S.renderMissions(w);
    const jo = w.querySelector('.tq-jo');
    return { hi: !!jo, nom: jo ? (jo.textContent || '') : '', clic: !!(jo && jo.onclick) };
  });
  ok(r.hi, 'la portada porta qui ets, i no només una pastilla al capdamunt');
  ok(/Prova/.test(r.nom), 'amb el teu nom · ' + r.nom.trim().slice(0, 40));
  ok(r.clic, 'i s\'obre el perfil des d\'allà');
  await p.evaluate(() => { window.__SOS.state.activePersona = null; });
}

/* ── 3 · El 80/20, i que decideixi alguna cosa ───────────────────────────── */
console.log('\n3 · El que ara serveix, calculat');
{
  const r = await p.evaluate(() => {
    const S = window.__SOS;
    const base = { jo: false, nd: null, nodes: 0, gent: 0, ledger: 0, tasques: 0, visible: false, codi: 'sense-perfil', caps: {}, pulse: null };
    const ambJo = Object.assign({}, base, { jo: true, nodes: 1, gent: 1 });
    const rodat = Object.assign({}, base, { jo: true, nodes: 4, gent: 9, ledger: 30, tasques: 6, visible: true, caps: { dossier: true, pings: true, ancoratge: true } });
    const noms = c => S.accionsAra(3, c).map(a => a.t);
    return {
      buit: noms(base), ambJo: noms(ambJo), rodat: noms(rodat),
      serveixenBuit: S.ACCIONS.filter(a => S.serveixAra(a, base)).length,
      serveixenRodat: S.ACCIONS.filter(a => S.serveixAra(a, rodat)).length,
      total: S.ACCIONS.length
    };
  });
  ok(r.buit.length > 0 && r.buit.length <= 3,
    `amb l'estat buit surten ${r.buit.length} accions, no cap i no ${r.total} · ` + r.buit.join(' · '));
  /* Qui acaba d'entrar no té res: l'única cosa que desbloqueja la resta és
     dir qui és. Si el càlcul proposés qualsevol altra cosa primer, la
     pantalla estaria enviant algú a una paret. */
  ok(/perfil/i.test(r.buit[0] || ''),
    'i la primera és fer-se el perfil, que és l\'única que desbloqueja la resta · ' + r.buit[0]);
  ok(r.serveixenBuit > 0 && r.serveixenBuit < r.total,
    `${r.serveixenBuit} de ${r.total} accions serveixen amb l'estat buit: ni una paret ni el directori sencer`);
  ok(r.serveixenRodat > r.serveixenBuit,
    `i un node rodat en té més (${r.serveixenRodat}): el que s'amaga torna sol quan es pot fer servir`);
  /* LA QUE IMPORTA. Si les tres llistes fossin iguals, el càlcul seria
     decoratiu i sempre sortirien accions raonables: no ho veuria ningú. */
  const firmes = new Set([r.buit.join('|'), r.ambJo.join('|'), r.rodat.join('|')]);
  ok(firmes.size === 3,
    `tres estats, ${firmes.size} propostes diferents: el càlcul decideix alguna cosa`
    + (firmes.size < 3 ? ' — ' + [r.buit[0], r.ambJo[0], r.rodat[0]].join(' / ') : ''));
}

/* ── 4 · Cap porta tancada ───────────────────────────────────────────────── */
console.log('\n4 · El que s\'amaga té la clau a la mateixa pantalla');
{
  await p.evaluate(() => window.__SOS.openLauncher());
  const r = await p.evaluate(() => {
    const m = document.querySelector('#modalRoot');
    return { obert: !!m.querySelector('.lch-it'), clau: !!m.querySelector('#lchAll'),
      visibles: m.querySelectorAll('.lch-it').length };
  });
  ok(r.obert, `el menú s'obre amb ${r.visibles} accions`);
  ok(r.visibles < 36, 'i no amb les 36: ensenya el que ara serveix');
  ok(r.clau, 'però la clau per veure-les totes és a la mateixa pantalla');
  await p.evaluate(() => window.__SOS.closeModal());
}

/* ── 5 · El tauler del node no s'ha perdut ───────────────────────────────── */
console.log('\n5 · I el que hi havia segueix arribant-hi');
{
  const r = await p.evaluate(() => {
    const S = window.__SOS;
    const rutes = ['#/', '#/missions', '#/tauler', '#/fons', '#/gent']
      .map(h => S.parseRoute(h).kind);
    S.state.homeView = 'tauler';
    const rt = S.buildRoute();
    S.state.homeView = 'missions';
    return { rutes, rt, home: S.buildRoute(), teBoto: typeof S.nodeViewBtn === 'function' };
  });
  ok(r.rutes.join(',') === 'home,missions,tauler,fons,gent',
    'les cinc adreces segueixen resolent-se · ' + r.rutes.join(', '));
  ok(r.rt === '#/tauler', 'el tauler del node ara és enllaçable · ' + r.rt);
  ok(r.home === '#/', 'i la portada per defecte segueix sent l\'arrel');
  ok(r.teBoto, 'i des del tauler de tasques s\'hi arriba amb un botó');
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
