/* El nick, el territori i l'entrada des del SOS
   ─────────────────────────────────────────────────────────────────────────
   El directori demanava el municipi com a text lliure i no tenia cap manera
   d'anomenar ningú. El que es prova aquí és el que això arregla, i sobretot
   **el que no promet**:

   · El nick es normalitza abans de firmar, i per tant «Marta_Vidal» i
     «marta-vidal» són el mateix nick i xoquen.
   · Un xoc de nick **avisa i deixa continuar**. No hi ha ningú que reparteixi
     noms aquí, i posar-hi un porter seria inventar una autoritat que aquesta
     xarxa no té. Qui identifica és el `did`.
   · El municipi es tria d'una llista amb la comarca al costat, i la comarca no
     es demana: es dedueix.
   · Qui no és de Catalunya ni d'Euskadi no es queda fora: país i poble a mà.
   · I entrar-hi des del SOS omple el formulari **sense publicar res**.

   Veda 144. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const PAG = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'online.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const nova = async (hash = '') => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  /* El directori parla amb un servei de debò. Aquí no hi ha xarxa i no n'hi ha
     d'haver: el que es prova és el que passa al navegador, no el servei. */
  await p.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await p.goto(PAG + hash);
  await p.waitForFunction(() => !!window.__ONLINE);
  return { ctx, p, errs };
};

console.log('\n1 · El nick es normalitza abans de firmar, no en pintar-lo');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const O = window.__ONLINE;
    const n = O.normNick;
    const f1 = O.bastirFitxa({ nom: 'Marta', nick: 'Marta_Vidal', municipi: 'Gelida', did: 'did:sos:x' });
    const f2 = O.bastirFitxa({ nom: 'Marta', nick: '  marta-vidal  ', municipi: 'Gelida', did: 'did:sos:x' });
    return {
      accents: n('Ígor Peña'), espais: n('  marta  vidal  '), llarg: n('a'.repeat(40)),
      guions: n('--marta---vidal--'), buit: n(''), simbols: n('@marta!!'),
      f1: f1.nick, f2: f2.nick, camp: 'nick' in f1
    };
  });
  ok(r.camp, 'la fitxa porta el camp `nick`');
  ok(r.f1 === r.f2, 'dues escriptures del mateix nom donen el mateix nick: ' + r.f1);
  ok(r.accents === 'igor-pena', 'els accents es pleguen: ' + r.accents);
  ok(r.espais === 'marta-vidal', 'els espais es tornen guions');
  ok(r.guions === 'marta-vidal', 'i no queden guions dobles ni als extrems: ' + r.guions);
  ok(r.simbols === 'marta', 'els símbols cauen: ' + r.simbols);
  ok(r.llarg.length <= 20, 'i no passa de 20 caràcters (' + r.llarg.length + ')');
  ok(r.buit === '', 'un nick buit segueix sent buit: és opcional');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n2 · Un xoc de nick avisa, i deixa continuar');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const O = window.__ONLINE;
    O.S.fitxes = [{ did: 'did:sos:altre', nom: 'Una altra Marta', nick: 'marta-vidal', municipi: 'Gelida' }];
    O.S.jo = { did: 'did:sos:jo' };
    const camp = document.querySelector('#fNick'), avis = document.querySelector('#nickAvis');
    camp.value = 'Marta_Vidal'; O.avisNick();
    const xoc = { txt: avis.textContent, marcat: avis.classList.contains('avis-xoc'), bloquejat: camp.disabled };
    camp.value = 'marta-nova'; O.avisNick();
    const lliure = { txt: avis.textContent, marcat: avis.classList.contains('avis-xoc') };
    return { xoc, lliure };
  });
  ok(/ja el fa servir/i.test(r.xoc.txt), 'diu que el nick ja el fa servir algú');
  ok(r.xoc.marcat, 'i es veu que és un avís');
  ok(!r.xoc.bloquejat, 'però no bloqueja: aquí ningú reparteix noms');
  ok(/firma/i.test(r.xoc.txt), 'i recorda que qui distingeix és la firma');
  ok(!r.lliure.marcat && /lliure/i.test(r.lliure.txt), 'un nick lliure es diu lliure');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n3 · El municipi es tria, i la comarca es dedueix');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const O = window.__ONLINE;
    document.querySelector('#fPais').value = 'cat'; O.pintaMunicipis();
    const cat = document.querySelectorAll('#llistaMuni option').length;
    document.querySelector('#fPais').value = 'eus'; O.pintaMunicipis();
    const eus = document.querySelectorAll('#llistaMuni option').length;
    return {
      cat, eus, nCat: O.GEO_CAT.length, nEus: O.GEO_EUS.length,
      gelida: O.comarcaDe('Gelida', 'cat'),
      minuscula: O.comarcaDe('gelida', 'cat'),
      inventat: O.comarcaDe('Vilanovadelesflors', 'cat'),
      creuat: O.comarcaDe('Gelida', 'eus')
    };
  });
  ok(r.cat === r.nCat && r.cat > 100, r.cat + ' municipis de Catalunya a la llista');
  ok(r.eus === r.nEus && r.eus > 50, r.eus + ' d\'Euskadi, i canvien en canviar de territori');
  ok(r.gelida === 'Alt Penedès', 'la comarca es dedueix del poble: ' + r.gelida);
  ok(r.minuscula === r.gelida, 'i no depèn de com s\'escrigui');
  ok(r.inventat === '', 'un poble que no hi és no s\'inventa cap comarca');
  ok(r.creuat === '', 'i no es busca a la llista equivocada');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n4 · Qui és de fora no es queda fora');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const O = window.__ONLINE;
    const sel = document.querySelector('#fPais');
    sel.value = 'altre'; O.pintaMunicipis();
    document.querySelector('#fPaisAltre').value = 'DE';
    document.querySelector('#fMuni').value = 'Berlín';
    const f = O.bastirFitxa({ nom: 'Ana', nick: '', municipi: 'Berlín', pais: O.paisActual(), did: 'did:sos:x' });
    return {
      blocPais: !document.querySelector('#blocPaisAltre').hidden,
      blocMuni: !document.querySelector('#blocMuni').hidden,
      llista: document.querySelectorAll('#llistaMuni option').length,
      paisos: O.PAISOS.length, pais: f.pais, muni: f.municipi
    };
  });
  ok(r.blocPais, 'triant «un altre lloc» surt el selector de país');
  ok(r.blocMuni, 'i el poble se segueix podent escriure');
  ok(r.llista === 0, 'sense llista de municipis, que allà no en tenim');
  ok(r.paisos > 50, r.paisos + ' països a triar');
  ok(r.pais === 'de' && r.muni === 'Berlín', 'i la fitxa desa el codi de país, no el nom traduïble');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n5 · El nick i la comarca es poden buscar');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const O = window.__ONLINE;
    const f = { nom: 'Marta Vidal', nick: 'marta-v', municipi: 'Gelida', pais: 'cat',
      ofereix: [{ cat: 'cuina', txt: 'Cuino per a colles' }], busca: [] };
    const t = O.textCercable(f);
    return { t, arrova: t.includes('@marta-v'), sense: t.includes('marta-v'),
      comarca: t.includes('alt penedès') };
  });
  ok(r.arrova && r.sense, 'el nick es troba amb arrova i sense');
  ok(r.comarca, 'i la comarca també, encara que la fitxa no la porti');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n6 · Entrar des del SOS omple el formulari i no publica res');
{
  const { ctx, p, errs } = await nova('#alta-sos');
  /* `window.__ONLINE` es publica **abans** que `init()` acabi —és la línia de
     sobre de la crida— així que esperar-lo no vol dir que la pàgina hagi
     arrencat. El que diu que ha arrencat és el diàleg obert. */
  await p.waitForFunction(() => document.querySelector('#dlgAlta').open, null, { timeout: 5000 })
    .catch(() => { });
  const r = await p.evaluate(() => ({
    obert: document.querySelector('#dlgAlta').open,
    previ: !!document.querySelector('#previ').textContent.trim(),
    /* El que compta: cap fitxa publicada. Sense identitat ni perfil al
       navegador no hi haurà res per portar, i és igual —el que es prova és
       que arribar-hi no dispara cap publicació. */
    avis: document.querySelector('#perfilAvis').textContent
  }));
  ok(r.obert, 'el formulari s\'obre sol en arribar des del SOS');
  ok(r.previ, 'i la previsualització hi és: es veu abans de res');
  ok(!/publicat|s\'ha publicat/i.test(r.avis), 'i no s\'ha publicat res');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n7 · El relé: la sala i el que hi passa');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const O = window.__ONLINE;
    const url = O.relayWsUrl();
    return {
      url, ws: /^wss:/.test(url), realtime: /realtime\/v1\/websocket/.test(url),
      clau: /apikey=/.test(url),
      /* Que la clau que hi va sigui la publicable i no cap altra: és la mateixa
         amb què ja es llegeixen les fitxes, i és publicable per disseny. */
      privada: /service_role|secret/i.test(url),
      sencer: O.relayEnvia('blob-de-prova') === false
    };
  });
  ok(r.ws && r.realtime, 'la sala va per WebSocket al canal de temps real');
  ok(r.clau && !r.privada, 'amb la clau publicable, que és la que ja fa servir el directori');
  ok(r.sencer, 'i enviar sense sala oberta retorna fals: no es fa veure que ha sortit');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
