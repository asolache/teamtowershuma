/* E13.3 · Publicar al teu propi origen.
   Els dos passos anteriors donen d'on llegir (E13.1) i com trobar-ho (E13.2).
   Aquest treu l'última dependència: publicar **sense el repositori de ningú**.

   El que faltava no era el fitxer del paquet —això ja se sabia fer— sinó
   l'índex que hi apunta, que es mantenia a mà. Aquí es prova que es generi i,
   sobretot, les dues coses que fan que serveixi: que índex i fitxers quadrin, i
   que el hash que s'anuncia sigui el de l'índex que es publica. */
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

/* Un origen de mentida servit amb el que el propi SOS acaba de generar: és
   l'única manera de provar que el cercle es tanca —publicar, servir, llegir. */
let SERVIT = null;
await page.route('**/meu.example/**', r => {
  const u = r.request().url();
  const path = u.split('meu.example/')[1].split('?')[0];
  const f = SERVIT && SERVIT.find(x => x.path === path);
  if (!f) return r.fulfill({ status: 404, body: 'no hi és' });
  r.fulfill({ status: 200, contentType: 'application/json', body: f.text });
});

await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.buildOriginBundle);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const muni = S.newNode('Torrelles de Foix', 'municipi', null);
  S.state.nodes.push(muni); await S.persist(muni);
  const n = S.newNode('Banc de temps de Torrelles', 'projecte', muni.id);
  n.dynamicType = 'banc_temps'; S.seedFromDynamic(n, S.dynById('banc_temps'));
  const m = S.newMember({ name: 'Marta Vidal' });
  S.membersOf(n).push(m);
  S.offersOf(n).push(S.newOffer({ kind: 'oferta', category: 'cuina', memberId: m.id, title: 'Cuino per a colles' }));
  S.offersOf(n).push(S.newOffer({ kind: 'demanda', category: 'cures', memberId: m.id, title: 'Necessito ajuda' }));
  S.state.nodes.push(n);
  await S.setPublishScope(n, { skills: true, objects: false });
  await S.persist(n);
  return { id: n.id };
});

console.log('\n1 · Es genera un origen sencer: l\'índex i el paquet');
const bundle = await page.evaluate(async () => {
  const S = window.__SOS;
  const b = await S.buildOriginBundle({ nom: 'Oferta de Torrelles', fitxer: 'torrelles' });
  return { camins: b.files.map(f => f.path), hash: b.hash,
    packs: b.index.packs, files: b.files.map(f => ({ path: f.path, json: JSON.parse(f.text) })),
    avisos: b.avisos, ctx: b.index['@context'], tipus: b.index['@type'] };
});
ok(bundle.camins.join(',') === 'supply/index.json,supply/torrelles.json',
  'surten els dos fitxers amb el seu camí: ' + bundle.camins.join(' + '));
ok(bundle.ctx && bundle.tipus === 'sos:SupplyManifest',
  'i l\'índex manté el @context i el @type del manifest de debò, no un format nou');

console.log('\n══ El que importa: que l\'índex i els fitxers quadrin ══');

console.log('\n2 · Tot el que l\'índex anomena existeix, i a l\'inrevés');
const quadra = await page.evaluate(async () => {
  const S = window.__SOS;
  const b = await S.buildOriginBundle({ fitxer: 'torrelles' });
  const bo = S.originBundleCheck(b);
  /* Un índex que anomena un fitxer que no hi és: l'error que aquesta peça
     existeix per evitar, i que amb un índex escrit a mà passa el segon dia. */
  const penjat = S.originBundleCheck({ files: b.files,
    index: { packs: [{ file: 'torrelles.json' }, { file: 'fantasma.json' }] } });
  /* I el revés: un fitxer que ningú nomena, que ningú llegirà mai. */
  const orfe = S.originBundleCheck({
    files: b.files.concat([{ path: 'supply/orfe.json', text: '{}' }]),
    index: b.index });
  return { bo, penjat, orfe };
});
ok(quadra.bo.ok, 'el que genera l\'app quadra');
ok(!quadra.penjat.ok && /fantasma\.json.*no hi és/.test(quadra.penjat.problemes[0]),
  'una referència morta es veu: «' + quadra.penjat.problemes[0] + '»');
ok(!quadra.orfe.ok && /ningú el llegirà mai/.test(quadra.orfe.problemes[0]),
  'i un fitxer que ningú nomena també: «' + quadra.orfe.problemes[0] + '»');

console.log('\n3 · El hash anunciat és el de l\'índex publicat');
/* Si no ho fos, el `checkAnnounced` del pas anterior diria «no quadra» del teu
   propi origen ben publicat, i una alarma que salta amb dades correctes
   s'aprèn a ignorar. */
const cercle = await page.evaluate(async () => {
  const S = window.__SOS;
  const b = await S.buildOriginBundle({ nom: 'Oferta de Torrelles', fitxer: 'torrelles' });
  window.__BUNDLE = b.files.map(f => ({ path: f.path, text: f.text }));
  return { hash: b.hash };
});
SERVIT = await page.evaluate(() => window.__BUNDLE);
const comprovat = await page.evaluate(async (h) => {
  const S = window.__SOS;
  const viu = await S.indexHash('https://meu.example/');
  const anunci = await S.checkAnnounced({ base: 'https://meu.example/', hash: h });
  return { igual: viu.hash === h, packs: viu.count, anunci };
}, cercle.hash);
ok(comprovat.igual, 'el hash del que se serveix és exactament el que es va anunciar');
ok(comprovat.anunci.ok === true, 'i checkAnnounced hi diu: «' + comprovat.anunci.diu + '»');

console.log('\n4 · I es pot llegir de debò des d\'allà, com qualsevol altre origen');
const llegit = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.saveOrigins([{ id: 'meu', nom: 'El meu origen', base: 'https://meu.example/' }]);
  /* Es buida el que és local perquè el que surti hagi vingut de l'origen. */
  const r = await S.updateCommonSupply(true);
  return { rows: r.rows, packs: r.packs, failed: r.failed,
    origen: r.origen && r.origen.nom, edat: r.edat && r.edat.text,
    diu: r.edat && r.edat.diu };
});
ok(llegit.rows > 0 && llegit.failed === 0,
  llegit.rows + ' files llegides de «' + llegit.origen + '», cap paquet fallat');
ok(llegit.diu && /avui/.test(llegit.edat),
  'i l\'índex generat SÍ que diu de quan és: ' + llegit.edat);

console.log('\n5 · El sedàs de sortida es passa abans de deixar-ho a fora');
const sedas = await page.evaluate(async () => {
  const S = window.__SOS;
  const b = await S.buildOriginBundle({ fitxer: 'torrelles' });
  const v = S.verifyNoLeak(b.pack);
  const json = JSON.stringify(b.pack);
  return { ok: v.ok, leaks: v.leaks, nom: /Marta Vidal/.test(json),
    titol: /Cuino per a colles/.test(json), avisos: b.avisos };
});
ok(sedas.ok && !sedas.nom && !sedas.titol,
  'ni el nom de qui ofereix ni el títol lliure surten de casa');
ok(!sedas.avisos.length, 'i no hi ha cap avís pendent: ' + (sedas.avisos.join(' · ') || 'cap'));

console.log('\n6 · Un origen buit es diu que és buit, i es genera igualment');
const buit = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.byId(S.state.nodes.find(x => x.dynamicType === 'banc_temps').id);
  await S.setPublishScope(n, { skills: false, objects: false });
  const b = await S.buildOriginBundle({ fitxer: 'torrelles' });
  const chk = S.originBundleCheck(b);
  return { files: b.files.length, rows: (b.pack.supply || []).length,
    avisos: b.avisos, quadra: chk.ok };
});
ok(buit.rows === 0 && buit.files === 2 && buit.quadra,
  'els dos fitxers es fan igual i quadren: un origen vàlid i buit no és un error');
ok(/serà vàlid però buit/.test(buit.avisos.join(' ')),
  'i es diu, en comptes de deixar-ho endevinar: «' + buit.avisos.join(' · ') + '»');

console.log('\n7 · La pantalla ensenya què sortirà abans de descarregar-ho');
const ui = await page.evaluate(async () => {
  const S = window.__SOS;
  S.openOrigins();
  await new Promise(r => setTimeout(r, 300));
  const m = document.querySelector('.modal');
  const txt = m.querySelector('#orBundle').textContent.replace(/\s+/g, ' ');
  const total = m.textContent.replace(/\s+/g, ' ');
  S.closeModal();
  return { txt, total };
});
ok(/supply\/index\.json/.test(ui.txt) && /hash de l’índex|hash de l'índex/.test(ui.txt),
  'es veuen els camins i el hash abans de baixar res: ' + ui.txt.slice(0, 90) + '…');
ok(/Sense token, sense repositori de ningú/.test(ui.total) && /L’índex es genera|L'índex es genera/.test(ui.total),
  'i es diu què és el que canvia: ni token ni repositori, i l\'índex no es manté a mà');

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
