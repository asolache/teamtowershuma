/* E13.2 · L'índex a Nostr.
   La llista d'orígens (E13.1) resol que un lloc caigui, però no que en
   desaparegui un i ningú sàpiga on és el següent: la llista viu al teu
   navegador, i qui entra de nou no en té cap.

   La divisió que es prova aquí és **l'anunci per Nostr, els fitxers per HTTPS**.
   I sobretot la frontera de la veda 61 aplicada a això: la firma Nostr no es
   verifica al navegador, així que trobar un origen **no és afegir-lo** i el hash
   anunciat detecta un mirall que no quadra, no un atac. */
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

/* Un origen que serveix un índex conegut, per poder-ne calcular el hash de debò
   i comparar-lo amb el que un anunci diu. */
const IDX = { at: '2026-08-01T00:00:00.000Z', packs: [{ file: 'a.json', name: 'A' }, { file: 'b.json', name: 'B' }] };
await page.route('**/bo.example/**', r => r.fulfill({ status: 200,
  contentType: 'application/json', body: JSON.stringify(IDX) }));
await page.route('**/mut.example/**', r => r.fulfill({ status: 200,
  contentType: 'application/json', body: JSON.stringify({ at: IDX.at, packs: [] }) }));
await page.route('**/mort.example/**', r => r.fulfill({ status: 503, body: 'down' }));

await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.discoverOrigins);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

/* Relés simulats. No és un mock de l'app: és un WebSocket que parla el protocol
   NIP-01 tal com el parla un relé —REQ, EVENT, EOSE—, que és l'única manera de
   provar que el client el parla bé. */
await page.evaluate(() => {
  window.__RELAYS = {
    'wss://un.example': [
      { pubkey: 'aaa111', created_at: 100, content: JSON.stringify({ base: 'https://bo.example/', nota: 'Mirall bo', hash: '', packs: 2 }) },
      { pubkey: 'ccc333', created_at: 90, content: JSON.stringify({ base: 'http://insegur.example/', nota: 'Sense xifrar' }) },
      { pubkey: 'ddd444', created_at: 80, content: 'això no és json' }
    ],
    'wss://dos.example': [
      /* El mateix origen que el relé anterior, però amb un anunci més nou. */
      { pubkey: 'aaa111', created_at: 200, content: JSON.stringify({ base: 'https://bo.example', nota: 'Mirall bo (renovat)', hash: 'HASH-BO', packs: 2 }) },
      { pubkey: 'bbb222', created_at: 150, content: JSON.stringify({ base: 'https://mut.example/', nota: 'Mirall canviat', hash: 'HASH-QUE-JA-NO-ES', packs: 2 }) }
    ],
    'wss://mut.example': []
  };
  window.__SENT = [];
  class FakeWS {
    constructor(url) {
      this.url = url; this.readyState = 0;
      setTimeout(() => { this.readyState = 1; this.onopen && this.onopen(); }, 5);
    }
    send(raw) {
      window.__SENT.push(raw);
      const m = JSON.parse(raw);
      if (m[0] !== 'REQ') return;
      const sub = m[1], evs = window.__RELAYS[this.url] || [];
      setTimeout(() => {
        evs.forEach(e => this.onmessage && this.onmessage({ data: JSON.stringify(['EVENT', sub, e]) }));
        this.onmessage && this.onmessage({ data: JSON.stringify(['EOSE', sub]) });
      }, 10);
    }
    close() { this.readyState = 3; }
  }
  window.__realWS = window.WebSocket;
  window.WebSocket = FakeWS;
});

console.log('\n1 · L\'anunci és un event NIP-33 reemplaçable');
const evt = await page.evaluate(async () => {
  const S = window.__SOS;
  const e = await S.nostrBuildOriginAnnounce('https://bo.example/', { nota: 'El meu', hash: 'H', count: 2, pubkey: 'zz' });
  return { kind: e.kind, d: (e.tags.find(t => t[0] === 'd') || [])[1], c: JSON.parse(e.content) };
});
ok(evt.kind === 30078 && evt.d === 'sos-origen',
  'kind ' + evt.kind + ' amb d-tag «' + evt.d + '»: un sol anunci per clau, actualitzable');
ok(evt.c.base === 'https://bo.example/' && evt.c.packs === 2,
  'i porta on és i quants paquets serveix, no el contingut');

console.log('\n2 · El client de lectura parla REQ i s\'atura a EOSE');
const q = await page.evaluate(async () => {
  const S = window.__SOS;
  const r = await S.nostrQuery('wss://un.example', { kinds: [30078], '#d': ['sos-origen'], limit: 10 });
  const req = JSON.parse(window.__SENT[window.__SENT.length - 1]);
  return { status: r.status, n: r.events.length, verb: req[0], filtre: req[2] };
});
ok(q.verb === 'REQ' && q.filtre['#d'][0] === 'sos-origen', 'envia un REQ amb el filtre del d-tag');
ok(q.status === 'ok' && q.n === 3, 'i recull els ' + q.n + ' events fins a EOSE');

console.log('\n══ El que importa: trobar no és afegir ══');

console.log('\n3 · Es troben propostes, i la llista d\'orígens NO es toca');
const disc = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.saveOrigins([{ id: 'z', nom: 'Ja el tinc', base: 'https://mut.example/' }]);
  const abans = S.originsList().length;
  const r = await S.discoverOrigins({ relays: ['wss://un.example', 'wss://dos.example'], timeout: 1500 });
  return { abans, despres: S.originsList().length,
    bases: r.trobats.map(t => t.base), notes: r.trobats.map(t => t.nota),
    jaHiEs: r.trobats.filter(t => t.jaHiEs).map(t => t.base),
    relays: r.relays.map(x => x.status) };
});
ok(disc.despres === disc.abans,
  'després de buscar hi ha els mateixos ' + disc.despres + ' orígens: cap s\'ha afegit sol');
ok(disc.bases.length === 2 && disc.bases.includes('https://bo.example/'),
  'troba ' + disc.bases.length + ' propostes: ' + disc.bases.join(', '));
ok(disc.jaHiEs.includes('https://mut.example/'),
  'i marca el que ja tens per no afegir-lo dues vegades');

console.log('\n4 · El que no és https, i el que no és JSON, cau');
ok(!disc.bases.some(x => /^http:/.test(x)),
  'cap proposta http pelada: el mateix criteri que afegir-ne una a mà');
ok(disc.bases.length === 2, 'i un contingut que no és JSON no trenca la cerca, només no compta');

console.log('\n5 · El mateix origen a dos relés: guanya l\'anunci més nou');
ok(/renovat/.test(disc.notes.join(' ')),
  'es queda «' + disc.notes.find(n => /bo/i.test(n)) + '», que és el de created_at 200');

console.log('\n6 · El hash anunciat detecta un mirall que no quadra');
const quadra = await page.evaluate(async () => {
  const S = window.__SOS;
  /* El hash de debò del que serveix l'origen bo. */
  const h = await S.indexHash('https://bo.example/');
  const bo = await S.checkAnnounced({ base: 'https://bo.example/', hash: h.hash });
  const mal = await S.checkAnnounced({ base: 'https://bo.example/', hash: 'un-hash-que-no-hi-toca' });
  const sense = await S.checkAnnounced({ base: 'https://bo.example/', hash: '' });
  const mort = await S.checkAnnounced({ base: 'https://mort.example/', hash: 'x' });
  return { packs: h.count, bo, mal, sense, mort };
});
ok(quadra.bo.ok === true && quadra.packs === 2, 'quan quadra, es diu: «' + quadra.bo.diu + '»');
ok(quadra.mal.ok === false && /no diu qui l’ha tocat|no diu qui l'ha tocat/.test(quadra.mal.diu),
  'i quan no, es diu QUÈ es pot concloure i què no: «' + quadra.mal.diu + '»');
ok(quadra.sense.ok === null && quadra.mort.ok === null,
  'sense hash o amb l\'origen mort, no s\'inventa un veredicte: «' + quadra.sense.diu + '» / «' + quadra.mort.diu + '»');

console.log('\n7 · La pantalla no ven com a verificat el que no ho és');
const ui = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.setNostrRelays(['wss://un.example', 'wss://dos.example']);
  S.openOrigins();
  await new Promise(r => setTimeout(r, 120));
  const m = document.querySelector('.modal');
  m.querySelector('#orFind').click();
  await new Promise(r => setTimeout(r, 900));
  const txt = m.querySelector('#orFound').textContent.replace(/\s+/g, ' ');
  const targetes = m.querySelectorAll('#orFound .ent-card').length;
  const total = m.textContent.replace(/\s+/g, ' ');
  S.closeModal();
  return { txt, targetes, total };
});
ok(ui.targetes === 2, 'surten les ' + ui.targetes + ' propostes amb el seu botó d\'afegir');
ok(/firma Nostr no verificada aquí/.test(ui.txt),
  'i cadascuna diu que la seva firma Nostr NO es verifica al navegador');
ok(/propostes/.test(ui.total) && /les afegeixes tu/.test(ui.total),
  'la pantalla ho diu abans de buscar: són propostes i les afegeix la persona');

console.log('\n8 · Anunciar sense extensió NIP-07 es diu, no es fa a mitges');
const sense07 = await page.evaluate(async () => {
  const S = window.__SOS;
  delete window.nostr;
  try { await S.publishOriginAnnounce('https://bo.example/', { nota: 'x' }); return 'ha passat'; }
  catch (e) { return e.msg; }
});
ok(/NIP-07/.test(sense07), '«' + sense07 + '»');

await page.evaluate(() => { window.WebSocket = window.__realWS; });
await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
