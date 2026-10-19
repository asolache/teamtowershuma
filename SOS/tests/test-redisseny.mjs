/* El redisseny del SOS (18/10/2026), fases 0 a 5.
   · Fase 0: l'app porta la pell del lloc (paper i tinta), cap text per sota
     de 15 px, i el fosc és una opció de Configuració que es recorda.
   · Fase 1: la portada és «Avui»: el pols dels fluxos i «Què ha passat?», amb
     les altres portades a la fila «Més» i la resta del tauler plegada.
   · Fase 2: una sola barra «Què necessites?».
   · Fase 3: les lents sobre el mateix mapa (Torre, Equip, Repartiment, Saber)
     i el lliscador del temps.
   · Fase 4: cada flux es segueix com una comanda, amb la data de la propera.
   · Fase 5: la primera vegada, una pregunta que acaba al teu mapa.
   · Cada flux és un fil: qui el porta (persona o agent), el torn i la conversa.
   · Els avisos: «Què ha passat?» posa primer l'urgent i l'important (FluxViu.avis).
   · I dues coses que es buscaven i no es trobaven: «Totes les pàgines» amb els
     noms de debò, i «Importa un perfil» a la vista quan et dones d'alta. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
page.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });

/* Els textos per sota del terra, comptats al que es veu (no els dibuixos SVG,
   que van en unitats del dibuix). */
const sotaTerra = () => page.evaluate(() => {
  const out = [];
  document.querySelectorAll('body *').forEach(e => {
    if (e.closest('svg') || !e.offsetParent) return;
    const t = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!t) return;
    const fs = parseFloat(getComputedStyle(e).fontSize);
    if (fs < 14.9) out.push(e.tagName + '.' + e.className + ' ' + fs + 'px');
  });
  return out;
});

console.log('\n1 · La pell del lloc: paper, tinta i el terra de 15 px');
await page.goto(APP);
await page.waitForFunction(() => window.__SOS);
await page.waitForTimeout(800);
const fons = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
ok(fons === 'rgb(251, 250, 247)', 'el fons és el paper del lloc (' + fons + ')');
let sota = await sotaTerra();
ok(!sota.length, 'cap text de la porta per sota de 15 px' + (sota.length ? ': ' + sota.slice(0, 4).join(' · ') : ''));

console.log('\n2 · Avui, amb l\'exemple viu');
await page.goto(APP + '?viu');
await page.waitForFunction(() => window.__SOS);
await page.waitForTimeout(1200);
await page.evaluate(() => { const S = window.__SOS; S.state.activeId = null; S.state.homeView = 'tauler'; S.render(); });
await page.waitForSelector('#avui .av-qp');
const av = await page.evaluate(() => ({
  xifra: document.querySelector('#avui .av-xf b').textContent,
  de: document.querySelector('#avui .av-xf span').textContent,
  primer: (document.querySelector('#avui .av-fet') || {}).className || '',
  fets: document.querySelectorAll('#avui .av-fet').length,
  ordre: [...document.querySelectorAll('#avui .av-fet')].map(x => x.className.replace(/av-fet |av-aturat/g, '').trim()).join(),
  mot: (document.querySelector('#avui .av-fet .av-mot') || {}).textContent || '',
  avisos: (document.querySelector('#avAvisos') || {}).textContent || '',
  titol: document.title, campana: !!document.querySelector('#avui .av-qp #avNotif') === (window.Notification && Notification.permission === 'default'),
  mapa: !!document.querySelector('#avMapa svg path[data-ex]'),
  mes: [...document.querySelectorAll('.av-mes-b')].map(x => x.textContent),
  plec: !!document.querySelector('details.av-plec') && !document.querySelector('details.av-plec').open,
  dalt: Math.round(document.querySelector('#avui').getBoundingClientRect().top + scrollY)
}));
ok(av.xifra === '3' && /de 6 fluxos/.test(av.de), 'el pols diu 3 de 6 fluxos vius (' + av.xifra + ' ' + av.de + ')');
ok(/av-urgent/.test(av.primer) && av.ordre === 'av-urgent,av-important,av-important,av-apagant', '«Què ha passat?» avisa: primer l\'urgent, després l\'important i al final el que s\'apaga (' + av.ordre + ')');
ok(/Urgent · Ens toca respondre/.test(av.mot), 'i cada avís diu per què (' + av.mot + ')');
ok(/^\(1\) /.test(av.titol), 'el nombre d\'urgents, també al títol de la pestanya (' + av.titol + ')');
ok(av.campana, '«Avisa\'m» surt només si el navegador encara no ha dit sí o no als avisos del sistema');
ok(av.avisos === '1 urgent · 2 importants', 'el comptador d\'avisos, al costat del títol (' + av.avisos + ')');
ok(av.mapa, 'i el mapa del projecte que més circula hi és, petit');
ok(av.mes.length === 4, 'les altres quatre portades, a la fila «Més»');
ok(av.plec, 'la resta del tauler, plegada a «Més del tauler»');
ok(av.dalt < 844, 'Avui comença dins la primera pantalla del mòbil (' + av.dalt + ' px)');
sota = await sotaTerra();
ok(!sota.length, 'cap text d\'Avui per sota de 15 px' + (sota.length ? ': ' + sota.slice(0, 4).join(' · ') : ''));
await page.click('#avui .av-fet.av-aturat');
await page.waitForTimeout(400);
const anat = await page.evaluate(() => ({ id: window.__SOS.state.activeId, tab: window.__SOS.state.tab,
  n: (window.__SOS.byId(window.__SOS.state.activeId) || {}).exempleViu }));
ok(anat.n && anat.tab === 'map', 'tocar un flux parat porta al mapa del seu projecte');
await page.evaluate(() => { const S = window.__SOS; S.closeModal(); S.state.activeId = null; S.state.homeView = 'tauler'; S.render(); });
await page.click('.av-mes-b');
ok(await page.evaluate(() => window.__SOS.state.homeView) === 'missions', 'la fila «Més» porta a les tasques');

console.log('\n3 · Sense cap flux, Avui no queda buit');
const p2 = await (await b.newContext({ viewport: { width: 1280, height: 860 } })).newPage();
await p2.goto(APP);
await p2.waitForFunction(() => window.__SOS);
await p2.evaluate(async () => { const S = window.__SOS; const n = S.newNode('Sense fluxos', 'projecte', null);
  S.state.nodes.push(n); await S.persist(n); S.state.activeId = null; S.state.homeView = 'tauler'; S.render(); });
ok(await p2.waitForSelector('#avExemple', { state: 'attached' }).then(() => true, () => false), 'ofereix l\'exemple viu');

console.log('\n4 · El fosc, triat i recordat');
await page.evaluate(() => { document.querySelector('#btnMore').click(); document.querySelector('#btnSettings').click(); });
await page.waitForSelector('#stTema [data-t="fosc"]');
await page.click('#stTema [data-t="fosc"]');
const fosc = await page.evaluate(() => ({ t: document.documentElement.dataset.tema, f: getComputedStyle(document.body).backgroundColor }));
ok(fosc.t === 'fosc' && fosc.f === 'rgb(5, 5, 7)', 'el fosc s\'aplica (' + fosc.f + ')');
await page.reload();
await page.waitForFunction(() => window.__SOS);
ok(await page.evaluate(() => document.documentElement.dataset.tema) === 'fosc', 'i es recorda en tornar a obrir');
await page.evaluate(() => { document.querySelector('#btnMore').click(); document.querySelector('#btnSettings').click(); });
await page.click('#stTema [data-t=""]');
ok(await page.evaluate(() => !document.documentElement.dataset.tema), 'i es torna al clar');

console.log('\n5 · «Què necessites?»: una sola barra, amb les teves paraules');
const qn = await page.evaluate(async () => {
  const S = window.__SOS;
  S.closeModal();
  const barra = document.querySelector('#btnSearch');
  const r = { llançador: !!document.querySelector('#btnLauncher'), text: barra.textContent };
  S.openSearchPalette();
  await new Promise(x => setTimeout(x, 120));
  r.suggereix = document.querySelectorAll('#spResults .sp-hit').length;
  const prova = async q => { const i = document.querySelector('#spQ'); i.value = q; i.dispatchEvent(new Event('input'));
    await new Promise(x => setTimeout(x, 60)); return document.querySelector('#spResults').textContent; };
  r.fosc = /Configuraci/.test(await prova('fosc'));
  r.reunio = /Assemblea/.test(await prova('reunió'));
  r.accio = /Pings ecosistema|Diagnòstic comunitari/.test(await prova('diagnòstic'));
  r.totes = !!document.querySelector('#spTotes');
  S.closeModal();
  return r;
});
ok(!qn.llançador && /Què necessites/.test(qn.text), 'la barra «Què necessites?» substitueix el botó «Accions»');
ok(qn.suggereix > 0, 'sense escriure res, proposa el que ara serveix (' + qn.suggereix + ')');
ok(qn.fosc && qn.reunio, 'entén «fosc» i «reunió» encara que les accions es diguin d\'una altra manera');
ok(qn.accio, 'troba les accions del llançador, no només les de la cerca');
ok(qn.totes, 'i el llançador sencer queda a un clic');

console.log('\n6 · Les lents: el mateix mapa amb una altra pregunta');
await page.goto(APP + '?viu');
await page.waitForFunction(() => window.__SOS);
await page.waitForTimeout(1200);
const abans = await page.evaluate(() => ({
  barra: [...document.querySelectorAll('.lents .lent')].map(x => x.textContent),
  carregada: !!document.querySelector('script[src="lib/lents.js"]'),
  temps: !!document.querySelector('#lnTemps')
}));
ok(abans.barra.join() === 'Valor,Torre,Equip,Repartiment,Saber', 'el mapa té cinc lents (' + abans.barra.join(', ') + ')');
ok(!abans.carregada, 'i no pesen a l\'arrencada: lib/lents.js només es carrega en triar-ne una');
ok(abans.temps, 'i el lliscador del temps');
const lent = async l => {
  await page.click('.lent[data-lent=' + l + ']');
  await page.waitForFunction(l => document.querySelector('svg.ln-' + l) || l === 'valor', l);
  return page.evaluate(() => ({
    b: [...document.querySelectorAll('.vna-canvas .ln-b')].map(x => x.textContent),
    peu: document.querySelector('.lents-peu').hidden ? '' : document.querySelector('.lents-peu').textContent,
    vents: document.querySelectorAll('.vna-canvas path.ln-vent').length,
    halo: document.querySelectorAll('.vna-canvas .ln-h').length
  }));
};
let L = await lent('torre');
/* Comandes i Opinions tornen en una mena diferent: són vents. Pagaments torna
   tangible per tangible, i és una primera mà. */
ok(L.b.join() === '3/4,1/4,0/4,0/4,1/4' && L.vents === 2, 'Torre: cada rol és un pilar amb les seves rengles, i 2 lliuraments són vents (' + L.b.join(' ') + ' · ' + L.vents + ' vents)');
ok(/Sense cap vent[^.]*Aliats/.test(L.peu), 'i diu quin pilar és un silo: ' + L.peu.slice(0, 70));
L = await lent('equip');
ok(L.b.length === 5 && L.b.every(x => x === 'ningú') && /5 rols no tenen ningú/.test(L.peu), 'Equip: diu qui porta cada rol, i que aquí no en porta cap ningú');
L = await lent('repart');
ok(L.b.join() === '33 %,40 %,13 %,13 %,0 %' && L.halo === 4 && /Clients fa circular el 40 %/.test(L.peu), 'Repartiment: la part de cada rol, sense llesques encara, pel que ha circulat (' + L.b.join(' ') + ')');
L = await lent('saber');
ok(L.b.every(x => x === '?') && /5 rols no diuen què demana/.test(L.peu), 'Saber: demana què necessita cada rol quan no ho diu');
L = await lent('valor');
ok(!L.b.length && !L.peu, 'Valor torna el mapa de sempre, sense res a sobre');
const t = await page.evaluate(async () => {
  const r = document.querySelector('#lnTemps'), viu = () => document.querySelectorAll('.vna-canvas .fv-pols').length;
  await new Promise(x => setTimeout(x, 300));
  const ara = viu();
  r.value = 90; r.dispatchEvent(new Event('input'));
  await new Promise(x => setTimeout(x, 300));
  return { ara, abans: viu(), o: document.querySelector('.lents-t output').textContent };
});
/* Fa 90 dies només circulaven les idees de millora (fets de fa 110 dies). */
ok(t.ara === 3 && t.abans === 1 && t.o === 'Fa 90 dies', 'el lliscador torna el mapa enrere: avui circulen ' + t.ara + ' fluxos i fa 90 dies, ' + t.abans);
sota = await sotaTerra();
ok(!sota.length, 'cap text de les lents per sota de 15 px' + (sota.length ? ': ' + sota.slice(0, 4).join(' · ') : ''));

console.log('\n7 · Cada flux, seguit com una comanda');
await page.goto(APP + '?viu');
await page.waitForFunction(() => window.__SOS);
await page.waitForTimeout(1200);
const seg = async etiqueta => {
  await page.evaluate(() => window.__SOS.closeModal());
  const id = await page.evaluate(e => { const S = window.__SOS, n = S.state.nodes.find(x => x.id === S.state.activeId);
    return n.vna.exchanges.find(x => x.label === e).id; }, etiqueta);
  await page.click('.fl-sg[data-flux="' + id + '"]');
  await page.waitForSelector('.modal.sg');
  return { id, t: await page.evaluate(() => document.querySelector('.modal.sg').textContent) };
};
ok(await page.evaluate(() => document.querySelectorAll('.fl-sg').length) === 6, 'cada flux de la llista té el seu «Segueix-lo»');
let S = await seg('Comandes');
ok(/Circula al seu ritme/.test(S.t) && /d'aquí 6 dies/.test(S.t), 'un flux viu diu quan toca la propera (setmanal, fa 1 dia: d\'aquí 6 dies)');
S = await seg('Idees de millora');
ok(/Aturat/.test(S.t) && /fa 45 dies que s'espera/.test(S.t), 'un d\'aturat diu quant fa que s\'espera (mensual, fa 75 dies: 45)');
S = await seg('Recomanacions');
ok(/Encara no ha circulat cap cop/.test(S.t), 'i un sense estrenar ho diu, sense inventar-se cap data');
S = await seg('Comandes');
await page.click('.modal.sg .btn-primary');
await page.waitForTimeout(300);
const reg = await page.evaluate(id => ({ h: document.querySelector('.modal h2').textContent,
  flux: [...document.querySelectorAll('.modal select')].some(x => x.value === id) }), S.id);
ok(/Nova aportació/.test(reg.h) && reg.flux, '«Ha circulat» obre l\'apunt amb el flux ja triat');
await page.evaluate(() => { const S = window.__SOS; S.closeModal(); S.state.activeId = null; S.state.homeView = 'tauler'; S.render(); });
await page.waitForSelector('#avui .av-fet');
await page.click('#avui .av-fet.av-aturat');
await page.waitForSelector('.modal.sg');
ok(/Aturat/.test(await page.evaluate(() => document.querySelector('.modal.sg').textContent)), 'des d\'«Avui», tocar el que s\'ha parat n\'obre el seguiment');
await page.evaluate(() => window.__SOS.closeModal());
await page.evaluate(() => document.querySelector('.vna-canvas path[data-ex]:not([data-url])').dispatchEvent(new MouseEvent('click', { bubbles: true })));
await page.waitForSelector('.modal.sg');
ok(true, 'i també tocar un flux del mapa');
sota = await sotaTerra();
ok(!sota.length, 'cap text del seguiment per sota de 15 px' + (sota.length ? ': ' + sota.slice(0, 4).join(' · ') : ''));

console.log('\n8 · La primera vegada: una pregunta i el teu mapa');
await page.goto(APP + '?primer');
await page.waitForFunction(() => window.__SOS);
await page.waitForSelector('#pmNom');
await page.click('.modal .btn-primary');
ok(await page.evaluate(() => !!document.querySelector('#pmNom')), 'sense nom no dibuixa res i torna a demanar-lo');
await page.fill('#pmNom', 'La Fleca');
await page.click('#pmAmb [data-r="Aliats"]');
await page.fill('#pmMes', 'Ajuntament, Gestoria');
await page.click('.modal .btn-primary');
await page.waitForSelector('.vna-canvas .pm-pista');
const pm = await page.evaluate(() => { const S = window.__SOS, n = S.byId(S.state.activeId);
  return { nom: n.name, tab: S.state.tab, rols: n.vna.roles.map(r => r.name).join(), ex: n.vna.exchanges.length,
    retorn: n.vna.exchanges.every(e => n.vna.exchanges.some(f => f.from === e.to && f.to === e.from)) }; });
ok(pm.nom === 'La Fleca' && pm.tab === 'map', 'crea el negoci i obre directament el seu mapa');
ok(pm.rols === 'La Fleca,Clients,Equip,Proveïdors,Ajuntament,Gestoria', 'amb qui hi treballa: el que ha deixat marcat i el que ha afegit (' + pm.rols + ')');
ok(pm.ex === 12 && pm.retorn, 'i cada flux neix amb el seu retorn (' + pm.ex + ' fluxos)');
await page.evaluate(() => document.querySelector('.vna-canvas path[data-ex]').dispatchEvent(new MouseEvent('click', { bubbles: true })));
await page.waitForSelector('.modal.sg');
ok(/Encara no ha circulat/.test(await page.evaluate(() => document.querySelector('.modal.sg').textContent)), 'el mapa diu què tocar, i tocar un flux porta a apuntar-lo');
await page.evaluate(() => { const S = window.__SOS; S.closeModal(); S.state.nodes.forEach(n => { n.vna.exchanges = []; }); S.state.activeId = null; S.state.homeView = 'tauler'; S.render(); });
await page.waitForSelector('#avPrimer');
ok(await page.evaluate(() => document.querySelectorAll('#avui .btn-primary').length === 1 && !!document.querySelector('#avExemple')),
  'sense cap flux, «Avui» proposa dibuixar el teu negoci (un sol primari) i l\'exemple al costat');
sota = await sotaTerra();
ok(!sota.length, 'cap text de la primera vegada per sota de 15 px' + (sota.length ? ': ' + sota.slice(0, 4).join(' · ') : ''));

console.log('\n9 · Totes les pàgines i importar un perfil');
await page.evaluate(() => window.__SOS.openEines());
await page.waitForSelector('#einesBox .eina-c');
const ei = await page.evaluate(() => ({ txt: document.querySelector('#einesBox').textContent,
  t: document.querySelector('#einesBox .ec-t').textContent, lbl: document.querySelector('#einesBox .dd-lbl').textContent }));
ok(!/object/i.test(ei.txt), 'cap pàgina diu «[object Object]»');
ok(ei.t.length > 2 && /[a-zà]/i.test(ei.lbl), 'cada pàgina porta el seu nom i cada grup el seu títol (' + ei.lbl.trim() + ' · ' + ei.t + ')');
await page.evaluate(() => { const S = window.__SOS; S.closeModal(); S.openSuperheroiOnboarding({ via: 'importa' }); });
await page.waitForSelector('#shImp');
ok(await page.evaluate(() => !!document.querySelector('.modal h2 + .sh-importa')),
  'en crear el perfil, «Importa un perfil» és el primer que hi ha sota el títol');
const fitxer = (name, obj) => ({ name, mimeType: 'application/json', buffer: Buffer.from(typeof obj === 'string' ? obj : JSON.stringify(obj)) });
const tipus = await page.evaluate(() => ({ id: window.__SOS.IDENTITY_BACKUP_TYPE, tot: window.__SOS.SOS_BACKUP_TYPE }));
await page.setInputFiles('#shImpFile', fitxer('sos-identitat-x.json', { type: tipus.id, did: 'did:sos:x' }));
await page.waitForSelector('#ibText');
ok(await page.evaluate(() => /did:sos:x/.test(document.querySelector('#ibText').value)), 'la còpia de la identitat obre «Restaura la teva identitat» ja carregada');
await page.evaluate(() => { const S = window.__SOS; S.closeModal(); S.openSuperheroiOnboarding({ via: 'importa' }); });
await page.waitForSelector('#shImp');
await page.setInputFiles('#shImpFile', fitxer('sos-copia.json', { type: tipus.tot, enc: false, count: 7, ts: '2026-10-19' }));
await page.waitForSelector('#bkPeek .ent-card');
ok(/7 registres/.test(await page.evaluate(() => document.querySelector('#bkPeek').textContent)), 'la còpia de tot el SOS obre «Restaura una còpia» i ensenya què hi entrarà');
await page.evaluate(() => { const S = window.__SOS; S.closeModal(); S.openSuperheroiOnboarding({ via: 'importa' }); });
await page.waitForSelector('#shImp');
await page.setInputFiles('#shImpFile', { name: 'cv.txt', mimeType: 'text/plain', buffer: Buffer.from('12 anys de lampista. Tinc furgoneta.') });
await page.waitForFunction(() => /lampista/.test((document.querySelector('#shCV') || {}).value || ''));
ok(await page.evaluate(() => document.querySelector('#shMoreCv').open), 'un CV no és cap còpia: omple la trajectòria i l\'analitza en local');
await page.evaluate(() => window.__SOS.closeModal());

console.log('\n10 · Cada flux, un fil: qui el porta, de qui és el torn i què s\'hi ha dit');
await page.goto(APP + '?viu');
await page.waitForFunction(() => window.__SOS && window.FluxViu);
await page.evaluate(() => { const S = window.__SOS, n = S.state.nodes.find(x => x.exempleViu), f = n.vna.exchanges.find(x => x.label === 'Opinions'); return S.openSeguiment(n, f.id); });
await page.waitForSelector('.modal.sg .sg-fil');
const fil = await page.evaluate(() => ({ av: (document.querySelector('.sg-av') || {}).textContent || '', qui: document.querySelector('#sgQui').textContent,
  msgs: document.querySelectorAll('#sgMsgs li').length, ag: document.querySelectorAll('#sgMsgs li.ag').length,
  torn: (document.querySelector('.sg-tb.sel') || {}).textContent }));
ok(/^Urgent · Ens toca respondre/.test(fil.av), 'el seguiment diu l\'avís i per què (' + fil.av + ')');
ok(fil.qui === '🤖 Agent de respostes', 'qui el porta, i si és un agent d\'IA es veu (' + fil.qui + ')');
ok(fil.msgs === 2 && fil.ag === 1 && fil.torn === 'Ens toca a nosaltres', 'el fil porta la conversa (persona i agent) i de qui és el torn');
await page.fill('#sgTxt', 'Li he dit que sí, els dimecres.');
await page.click('#sgNou button');
await page.click('.sg-tb[data-espera="ells"]');
const desat = await page.evaluate(() => { const S = window.__SOS, n = S.state.nodes.find(x => x.exempleViu), f = n.vna.exchanges.find(x => x.label === 'Opinions');
  return { n: f.fil.length, darrer: f.fil[f.fil.length - 1].txt, espera: f.espera, avis: window.FluxViu.avis(f, (f.events || []).map(e => e.ts)).nivell }; });
ok(desat.n === 3 && /dimecres/.test(desat.darrer), 'escriure al fil hi afegeix la nota');
ok(desat.espera === 'ells' && desat.avis === null, 'passar el torn a l\'altre treu l\'avís urgent');
sota = await sotaTerra();
ok(!sota.length, 'cap text del fil per sota de 15 px' + (sota.length ? ': ' + sota.slice(0, 4).join(' · ') : ''));
await page.evaluate(() => window.__SOS.closeModal());

await b.close();
console.log(`\n${fail ? '❌' : '✅'} ${pass} ok · ${fail} malament`);
process.exit(fail ? 1 : 0);
