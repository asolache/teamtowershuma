/* V86 · El lateral passa a ser un taulell d'operacions.
   L'app sabia explicar-se i no deixava operar: tot el que et fa falta cada dia
   vivia darrere d'un modal diferent. Aquí es prova que el taulell digui l'estat
   de debò —i sobretot **la distinció que dona sentit a tot**: tenir una oferta
   no és que se't pugui trobar. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const page = await b.newPage({ viewport: { width: 1280, height: 900 } });
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.opsState);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

console.log('\n1 · Amb nodes però sense ningú actiu, el taulell no fingeix');
/* Amb zero nodes no es veu res de tot això —mana la pantalla d'entrada, i està
   bé que mani. El cas de debò és tenir nodes i encara no tenir perfil. */
const buit = await page.evaluate(async () => {
  const S = window.__SOS;
  const n0 = S.newNode('Torrelles de Foix', 'municipi', null);
  S.state.nodes.push(n0); await S.persist(n0);
  S.state.activePersona = null; S.render();
  const box = document.querySelector('#opsPanel');
  return { txt: box.textContent.replace(/\s+/g, ' '), botons: box.querySelectorAll('button').length };
});
ok(/Encara no hi ha ningú actiu/.test(buit.txt), 'diu que no hi ha ningú i què fer');
ok(buit.botons === 1, 'amb una sola sortida, no una llista de zeros');

const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const n = S.newNode('Banc de Temps de Torrelles', 'projecte', null);
  n.dynamicType = 'banc_temps';
  S.seedFromDynamic(n, S.dynById('banc_temps'));
  const m = S.newMember({ name: 'Marta Vidal' });
  S.membersOf(n).push(m);
  S.offersOf(n).push(S.newOffer({ kind: 'oferta', category: 'cuina', memberId: m.id, title: 'Cuino per a colles' }));
  S.state.nodes.push(n); await S.persist(n);
  await S.setActivePersona('Marta Vidal');
  S.render();
  return { id: n.id, mem: m.id };
});

console.log('\n══ El que importa: tenir una oferta no és que et trobin ══');

console.log('\n2 · Amb una oferta i sense publicar, el taulell ho distingeix');
const abans = await page.evaluate(() => {
  const S = window.__SOS, o = S.opsState();
  const txt = document.querySelector('#opsPanel').textContent.replace(/\s+/g, ' ');
  return { ofertes: o.ofertes, publicades: o.publicades, visible: o.visible, txt };
});
ok(abans.ofertes === 1 && abans.publicades === 0,
  'una oferta, cap publicada: ' + abans.publicades + '/' + abans.ofertes);
ok(!abans.visible && /Encara no et troben/.test(abans.txt),
  'i es diu amb totes les lletres, no amb un número sol');

console.log('\n3 · Publicant, canvia el taulell');
const desp = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  await S.setPublishScope(n, { skills: true, objects: false });
  S.render();
  const o = S.opsState();
  return { publicades: o.publicades, visible: o.visible,
    txt: document.querySelector('#opsPanel').textContent.replace(/\s+/g, ' ') };
}, seed);
ok(desp.publicades === 1 && desp.visible, 'ara 1/1 i visible');
ok(/Se’t pot trobar/.test(desp.txt), 'i el taulell ho diu: «Se’t pot trobar»');

console.log('\n4 · Publicar en un pas: una línia i ja està');
const pub = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  await S.setPublishScope(n, { skills: false, objects: false });
  S.openPublishHub();
  await new Promise(r => setTimeout(r, 150));
  const m = document.querySelector('.modal');
  const passos = m.querySelectorAll('.field').length;
  m.querySelector('#phTitle').value = 'Arreglo bicicletes';
  m.querySelector('#phGo').click();
  await new Promise(r => setTimeout(r, 400));
  const nn = S.byId(s.id);
  const nova = S.offersOf(nn).find(o => o.title === 'Arreglo bicicletes');
  return { passos, teOferta: !!nova, publica: S.publishesAnything(nn),
    obert: !!document.querySelector('.modal') };
}, seed);
ok(pub.passos <= 4, 'el formulari són ' + pub.passos + ' camps, no un recorregut');
ok(pub.teOferta, 'l\'oferta queda creada');
ok(pub.publica, 'i el node passa a publicar en la mateixa acció: era el pas que ningú feia');
ok(!pub.obert, 'i es tanca sol');

console.log('\n5 · El que se’n veu de fora segueix sent l’agregat');
const fora = await page.evaluate((s) => {
  const S = window.__SOS, n = S.byId(s.id);
  const pack = S.supplyPublicPack(n);
  const v = S.verifyNoLeak(pack);
  return { ok: v.ok, leaks: v.leaks, json: JSON.stringify(pack) };
}, seed);
ok(fora.ok, 'el paquet públic no filtra res');
ok(!/Marta Vidal/.test(fora.json) && !/Arreglo bicicletes/.test(fora.json),
  'ni el nom de qui ofereix ni el títol lliure surten de casa');

console.log('\n6 · El cost de publicar: zero mentre la caixa no pugui cobrar');
const cost = await page.evaluate((s) => {
  const S = window.__SOS, n = S.byId(s.id);
  const c0 = S.canPublish(n, s.mem);
  /* Ara amb un preu posat i sense saldo. */
  S.coopCfg(n).publicaCost = 5;
  const c1 = S.canPublish(n, s.mem);
  return { sensePreu: c0, ambPreu: c1, potCobrar: S.tpvStatus(n).potCobrar };
}, seed);
ok(cost.sensePreu.ok && cost.sensePreu.cost === 0,
  'per defecte publicar no costa res: «' + cost.sensePreu.motiu + '»');
ok(!cost.ambPreu.ok && /no et pot barrar el pas/.test(cost.ambPreu.motiu),
  'amb preu i sense manera de carregar, no barra el pas: «' + cost.ambPreu.motiu.slice(-70) + '»');

const passa = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  const off = S.newOffer({ kind: 'demanda', category: 'cures', memberId: s.mem, title: 'Necessito ajuda' });
  const r = await S.publishWithCredit(n, s.mem, off);
  return { cobrat: r.cobrat, saldo: S.walletBalance(n, s.mem).saldo };
}, seed);
ok(passa.cobrat === 0 && passa.saldo === 0,
  'i de fet publica igual i no cobra res: cobrar el que no es pot carregar seria un peatge sense pany');

console.log('\n7 · Amb saldo de debò, sí que es descompta');
const cobra = await page.evaluate(async (s) => {
  const S = window.__SOS, n = S.byId(s.id);
  const o = await S.newTopUp(n, { memberId: s.mem, amount: 20 });
  const rebut = { order: o.id, import: 20, ts: new Date().toISOString() };
  await S.signRecord(rebut);
  await S.confirmTopUp(n, o.id, rebut);
  const abans = S.walletBalance(n, s.mem).saldo;
  const off = S.newOffer({ kind: 'oferta', category: 'jardineria', memberId: s.mem, title: 'Podo' });
  const r = await S.publishWithCredit(n, s.mem, off);
  return { abans, cobrat: r.cobrat, despres: S.walletBalance(n, s.mem).saldo };
}, seed);
ok(cobra.abans === 20 && cobra.cobrat === 5 && cobra.despres === 15,
  'de ' + cobra.abans + ' a ' + cobra.despres + ': el cost surt del moneder com un apunt més');

console.log('\n8 · El taulell viu al tauler, no al lateral');
/* Aquesta comprovació afirmava que el taulell anava davant de tot **dins de
   l'arbre** (`.tree > div` començant per `opsPanel`). Es reescriu perquè el
   disseny ha canviat —el marc ha deixat de ser l'arbre i ha passat a ser el
   tauler—, no perquè l'asserció fos incorrecta: descrivia bé el layout d'abans.
   El contracte que es manté és el que importava: el taulell s'ha de veure sense
   fer cap clic. */
const conviu = await page.evaluate(() => {
  const S = window.__SOS;
  S.state.activeId = null; S.state.homeView = 'tauler'; S.render();
  return { ops: !!document.querySelector('#workspace #opsPanel .ops-row'),
    dinsArbre: !!document.querySelector('#treePanel #opsPanel'),
    arbre: !!document.querySelector('#treeList .tree-node') };
});
ok(conviu.ops && conviu.arbre, 'hi ha taulell al tauler i hi ha arbre al calaix');
ok(!conviu.dinsArbre,
  'i el taulell ja no viu dins de l\'arbre: no cal navegar per veure què t\'espera');

console.log('\n══ Que publicar sigui accessible: sense culs-de-sac, i amb teclat ══');

console.log('\n9 · Les files del taulell són operables amb teclat');
/* Eren `div` amb `onclick`: qui navega amb tabulador o amb lector de pantalla
   veia el número i no arribava mai a l'acció. Publicar era una d'aquestes. */
const tecla = await page.evaluate(() => {
  const files = [...document.querySelectorAll('#opsPanel .ops-row')];
  const clicables = files.filter(f => f.style.cursor === 'pointer');
  return {
    total: files.length, clicables: clicables.length,
    ambRol: clicables.filter(f => f.getAttribute('role') === 'button').length,
    tabulables: clicables.filter(f => f.getAttribute('tabindex') === '0').length,
    etiquetades: clicables.filter(f => (f.getAttribute('aria-label') || '').length > 3).length
  };
});
ok(tecla.clicables > 0 && tecla.ambRol === tecla.clicables && tecla.tabulables === tecla.clicables,
  'les ' + tecla.clicables + ' files que fan alguna cosa tenen role=button i tabindex=0');
ok(tecla.etiquetades === tecla.clicables,
  'i totes diuen què fan a qui no veu la icona');

const enter = await page.evaluate(async () => {
  const fila = [...document.querySelectorAll('#opsPanel .ops-row')]
    .find(f => /trobar/.test(f.textContent));
  fila.focus();
  const focusat = document.activeElement === fila;
  fila.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  await new Promise(r => setTimeout(r, 150));
  const obert = !!document.querySelector('.modal');
  window.__SOS.closeModal();
  return { focusat, obert };
});
ok(enter.focusat, 'la fila agafa el focus');
ok(enter.obert, 'i Enter obre el mateix que el clic: ja no cal ratolí');

console.log('\n10 · Sense banc de temps NO és un cul-de-sac: se n’obre un aquí mateix');
/* Abans deia «entra a un node o crea\'n un, i torna aquí» i et deixava allà.
   És exactament el que la veda 62 prohibeix. */
const nou = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.setActivePersona('Pau Ferrer');
  S.render();
  const llocs = S.publishPlaces('Pau Ferrer').length;
  S.openPublishHub();
  await new Promise(r => setTimeout(r, 150));
  const m = document.querySelector('.modal');
  return {
    llocs, txt: m.textContent.replace(/\s+/g, ' '),
    teMuni: !!m.querySelector('#phMuni'), teGo: !!m.querySelector('#phGo'),
    botons: [...m.querySelectorAll('.modal-actions button')].map(x => x.textContent.trim())
  };
});
ok(nou.llocs === 0, 'en Pau no és a cap banc de temps');
ok(nou.teMuni && nou.teGo, 'i tot i així el formulari hi és, amb el botó de publicar');
ok(!/torna aquí/.test(nou.txt), 'ja no hi ha cap «torna aquí»: ' + nou.botons.join(' · '));

const fet = await page.evaluate(async () => {
  const S = window.__SOS, m = document.querySelector('.modal');
  m.querySelector('#phMuni').value = 'Vilafranca del Penedès';
  m.querySelector('#phTitle').value = 'Faig pa';
  m.querySelector('#phGo').click();
  await new Promise(r => setTimeout(r, 600));
  const bt = S.publishPlaces('Pau Ferrer');
  const n = bt[0];
  return {
    llocs: bt.length, nom: n ? n.name : '',
    esSoci: n ? S.membersOf(n).some(x => S.personKey(x.name) === S.personKey('Pau Ferrer')) : false,
    teOferta: n ? S.offersOf(n).some(o => o.title === 'Faig pa') : false,
    publica: n ? S.publishesAnything(n) : false,
    sotaMunicipi: n ? (S.byId(n.parentId) || {}).nodeLevel : '',
    obert: !!document.querySelector('.modal')
  };
});
ok(fet.llocs === 1 && fet.esSoci, 'd\'una tirada surt «' + fet.nom + '» i ell n\'és soci');
ok(fet.sotaMunicipi === 'municipi', 'penjat del municipi de debò, no de l\'arrel');
ok(fet.teOferta && fet.publica, 'amb l\'oferta creada i el node ja publicant');
ok(!fet.obert, 'i el modal es tanca sol');

console.log('\n11 · I s’hi arriba des de fora del lateral');
const arreu = await page.evaluate(async () => {
  const S = window.__SOS;
  S.openLauncher();
  await new Promise(r => setTimeout(r, 150));
  const alMenu = /Publica una oferta/.test(document.querySelector('.modal').textContent);
  S.closeModal();
  /* I la paleta de cerca (⌘K), que és per on hi arriba qui ja sap què vol. */
  S.openSearchPalette();
  await new Promise(r => setTimeout(r, 100));
  const inp = document.querySelector('#spQ');
  inp.value = 'publica una oferta'; inp.dispatchEvent(new Event('input'));
  await new Promise(r => setTimeout(r, 100));
  const cerca = /Publica una oferta/.test(document.querySelector('#spResults').textContent);
  S.closeModal();
  return { alMenu, cerca };
});
ok(arreu.alMenu, 'el menú d\'accions el porta: publicar ja no viu només al lateral');
ok(arreu.cerca, 'i la cerca global també el troba');

console.log('\n12 · Sense ningú actiu, diu què falta i hi porta');
const senseJo = await page.evaluate(async () => {
  const S = window.__SOS;
  await S.setActivePersona('');
  S.openPublishHub();
  await new Promise(r => setTimeout(r, 150));
  const m = document.querySelector('.modal');
  const txt = m.textContent.replace(/\s+/g, ' ');
  const btns = [...m.querySelectorAll('.modal-actions button')].map(x => x.textContent.trim());
  S.closeModal();
  return { txt, btns };
});
ok(/qui ho publica/.test(senseJo.txt) && senseJo.btns.some(x => /perfil/i.test(x)),
  'diu que falta saber qui publica, i hi ha el botó: ' + senseJo.btns.join(' · '));

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
