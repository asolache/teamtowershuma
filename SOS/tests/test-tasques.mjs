/* Les meves tasques · una safata i no vuit
   ────────────────────────────────────────
   El SOS sabia perfectament què calia fer. Ho sabia en vuit llocs diferents
   —missions, vistiplaus, tauler d'atenció, riscos, blocatges, alertes de
   cures, taulers de projecte i forats de la xarxa— i cap et deia «això és el
   que et toca a tu». Vuit safates és cap safata.

   El que es prova aquí no és que la pantalla es pinti, sinó les tres coses que
   la fan servir d'alguna cosa:

   · **Que hi arribi tot.** Una font que es despenja no peta mai: simplement
     desapareix, i el que estigui a punt de cremar-se deixa de sortir.
   · **Que els dos eixos filtrin de debò, i en les dues direccions.** Territori
     i tema ja existien al codi i no es feien servir junts. La direcció és el
     que és nou: cap enfora ha de veure el que et conté i tu no.
   · **Que només es pugui moure el que té estat desat.** La majoria d'aquestes
     tasques es calculen a cada pintada; deixar-les moure escriuria un estat
     que el següent render desmentiria.

   I la que no es pot fallar mai: **cap nom de les cures sense permís**. */
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
await page.goto(APP);
await page.waitForFunction(() => window.__SOS && window.__SOS.lesMevesTasques);
await page.evaluate(async () => { await window.__SOS.markOnboardingDone(); });

/* Un territori amb dos projectes a sota, per poder mirar amunt i avall. */
const seed = await page.evaluate(async () => {
  const S = window.__SOS;
  const pais = S.newNode('Alt Penedès', 'territori', null);
  pais.themes = ['energia'];
  S.state.nodes.push(pais); await S.persist(pais);

  const bt = S.newNode('Banc de temps de Foix', 'projecte', pais.id);
  bt.dynamicType = 'banc_temps'; S.seedFromDynamic(bt, S.dynById('banc_temps'));
  bt.themes = ['cures'];
  const marta = S.newMember({ name: 'Marta Vidal' });
  S.membersOf(bt).push(marta);
  bt.kanban.cards[0].col = 'doing';
  S.state.nodes.push(bt); await S.persist(bt);

  const bib = S.newNode('Biblioteca de Vilafranca', 'projecte', pais.id);
  bib.dynamicType = 'biblioteca_coses'; S.seedFromDynamic(bib, S.dynById('biblioteca_coses'));
  bib.themes = ['economia_circular'];
  S.state.nodes.push(bib); await S.persist(bib);

  S.setActivePersona('Marta Vidal');
  return { pais: pais.id, bt: bt.id, bib: bib.id, marta: marta.id,
    carta: bt.kanban.cards[0].id,
    /* Els dos projectes tenen tauler: la safata els ha de portar tots dos. */
    quantesCartes: bt.kanban.cards.length + bib.kanban.cards.length };
});

console.log('\n1 · Hi arriba el que abans vivia en vuit pantalles');
{
  const r = await page.evaluate(() => {
    const t = window.__SOS.lesMevesTasques({});
    return { n: t.length, menes: [...new Set(t.map(x => x.kind))],
      tauler: t.filter(x => x.kind === 'tauler').length,
      totsAmbEfecte: t.every(x => x.effect && x.effect.length > 10),
      totsAmbAccio: t.every(x => typeof x.act === 'function'),
      totsAmbColumna: t.every(x => ['todo', 'doing', 'done'].includes(x.col)) };
  });
  ok(r.n > 0, r.n + ' tasques a la safata única');
  ok(r.tauler === seed.quantesCartes,
    'les ' + r.tauler + ' targetes dels taulers dels dos projectes hi són, sense entrar-hi');
  ok(r.totsAmbEfecte, 'cada tasca diu què passarà si la fas, no només què és');
  ok(r.totsAmbAccio, 'i cada tasca porta a un lloc concret');
  ok(r.totsAmbColumna, 'totes cauen en una de les tres columnes del tauler');
}

console.log('\n2 · Les cures hi entren, i el nom només si el pots saber');
/* La pantalla comuna era la manera més fàcil de saltar-se el gate de
   `renderCures` sense adonar-se'n: una alerta que abans només veia qui sostenia
   el node, ara la veu qualsevol que obri la safata. */
{
  const r = await page.evaluate(async (s) => {
    const S = window.__SOS, nd = S.byId(s.bt);
    nd.dynamicType = 'suport_mutu';
    const cuida = S.newMember({ name: 'Rosa Puig' });
    const cuidat = S.newMember({ name: 'Joan Ferrer' });
    S.membersOf(nd).push(cuida, cuidat);
    /* Prou hores perquè passi el llindar de sobrecàrrega. */
    for (let i = 0; i < 4; i++)
      S.curesOf(nd).push(S.newCura({ cuidaId: cuida.id, cuidatId: cuidat.id,
        que: 'companyia', cada: 'setmana', hores: 3 }));
    await S.persist(nd);

    const ambPermis = S.lesMevesTasques({}).filter(x => /crema|sobrecarregad/i.test(x.title));
    /* Ara sense permís: un node d'un altre owner. */
    S.govOf(nd).owner = 'did:sos:ed25519:UNALTREUNALTREUNALTREUNALTRE00';
    const sensePermis = S.lesMevesTasques({}).filter(x => /crema|sobrecarregad/i.test(x.title));
    S.govOf(nd).owner = null;
    return { ambPermis: ambPermis.map(x => x.title), sensePermis: sensePermis.map(x => x.title) };
  }, seed);
  ok(r.ambPermis.length > 0, 'la sobrecàrrega de cures arriba a la safata: «' + r.ambPermis[0] + '»');
  ok(/Rosa Puig/.test(r.ambPermis.join(' ')),
    'i qui sosté el node veu de qui es tracta');
  ok(r.sensePermis.length > 0 && !/Rosa Puig/.test(r.sensePermis.join(' ')),
    'qui no el sosté veu que passa alguna cosa i no veu cap nom: «' + r.sensePermis[0] + '»');
}

console.log('\n3 · Territori, i les dues direccions');
{
  const r = await page.evaluate((s) => {
    const S = window.__SOS;
    const t = q => S.lesMevesTasques(q).length;
    const totes = S.lesMevesTasques({});
    const senseNode = totes.filter(x => !x._node).length;
    const delBt = totes.filter(x => x._node && x._node.id === s.bt).length;
    return { total: totes.length, senseNode, delBt,
      dinsBt: t({ ambit: s.bt, dins: 'dins' }),
      foraBt: t({ ambit: s.bt, dins: 'fora' }),
      dinsPais: t({ ambit: s.pais, dins: 'dins' }),
      foraPais: t({ ambit: s.pais, dins: 'fora' }),
      ambits: S.ambitsAmbTasques(totes).map(a => a.node.name) };
  }, seed);
  ok(r.senseNode > 0, r.senseNode + ' tasques no pengen de cap node (el teu camí, els reptes)');
  ok(r.dinsBt === r.delBt + r.senseNode,
    'cap endins del projecte: les seves ' + r.delBt + ' i les que no són de ningú');
  ok(r.foraBt === r.senseNode,
    'cap enfora del projecte NO inclou el projecte: en queden ' + r.foraBt);
  ok(r.dinsPais === r.total,
    'cap endins del territori les agafa totes (' + r.dinsPais + ')');
  ok(r.foraPais === r.senseNode,
    'i cap enfora de l\'arrel no té res per sobre: només les que no són de ningú');
  ok(r.ambits.includes('Alt Penedès') && r.ambits.includes('Banc de temps de Foix'),
    'els àmbits que s\'ofereixen són els que tenen tasques: ' + r.ambits.join(', '));
}

console.log('\n4 · Tema, i que es puguin creuar els dos eixos');
{
  const r = await page.evaluate((s) => {
    const S = window.__SOS;
    const t = q => S.lesMevesTasques(q).length;
    const senseNode = S.lesMevesTasques({}).filter(x => !x._node).length;
    return { senseNode,
      cures: t({ tema: 'cures' }),
      circular: t({ tema: 'economia_circular' }),
      fals: t({ tema: 'no-existeix-aquest-tema' }),
      creuat: t({ ambit: s.bib, dins: 'dins', tema: 'cures' }) };
  }, seed);
  ok(r.cures > r.senseNode, 'el tema «cures» filtra i deixa les del banc de temps');
  ok(r.circular > r.senseNode, 'i «economia circular» les de la biblioteca');
  ok(r.fals === r.senseNode,
    'un tema que no té ningú deixa només les que no són de cap territori');
  ok(r.creuat === r.senseNode,
    'i els dos eixos es creuen: a la biblioteca no hi ha res de cures');
}

console.log('\n5 · Només es mou el que té estat desat');
{
  const r = await page.evaluate(async (s) => {
    const S = window.__SOS;
    const t = S.lesMevesTasques({});
    const cartes = t.filter(x => x.card);
    const calculades = t.filter(x => !x.card);
    const cols = t.reduce((a, x) => { a[x.col] = (a[x.col] || 0) + 1; return a; }, {});
    /* Moure una targeta i comprovar que es desa de debò. */
    const c = cartes.find(x => x.card.id === s.carta);
    c.card.col = 'done'; await S.persist(c._node);
    const desat = (S.byId(s.bt).kanban.cards.find(x => x.id === s.carta) || {}).col;
    const desprès = S.lesMevesTasques({}).find(x => x.card && x.card.id === s.carta);
    return { cartes: cartes.length, calculades: calculades.length, cols,
      totesCalculadesTodo: calculades.every(x => x.col === 'todo'),
      desat, colDespres: desprès && desprès.col };
  }, seed);
  ok(r.cartes > 0 && r.calculades > 0,
    r.cartes + ' targetes amb estat desat i ' + r.calculades + ' tasques calculades');
  ok(r.totesCalculadesTodo,
    'les calculades sempre són «per fer»: no hi ha cap estat seu escrit enlloc');
  ok(r.desat === 'done' && r.colDespres === 'done',
    'moure una targeta la desa al node i la safata ho reflecteix');
}

console.log('\n6 · La pantalla es pinta i diu el que no fa');
{
  const r = await page.evaluate(() => {
    const S = window.__SOS;
    S.state.activeId = null; S.state.homeView = 'missions'; S.render();
    const w = document.querySelector('.tab-body');
    return {
      cols: [...document.querySelectorAll('.kcol')].map(c => c.className),
      cards: document.querySelectorAll('.tq-card').length,
      filtres: !!document.querySelector('.tq-filtres select'),
      txt: w ? w.textContent.replace(/\s+/g, ' ') : ''
    };
  });
  ok(r.cols.length === 3, 'tres columnes: ' + r.cols.length);
  ok(r.cards > 0, r.cards + ' targetes pintades');
  ok(r.filtres, 'i els filtres hi són');
  ok(/vuit safates|vuit/i.test(r.txt) || /es calcula sola/i.test(r.txt),
    'i la pantalla diu què s\'hi pot moure i què es calcula sol');
}

console.log('\n7 · Amb un filtre que no deixa res, no es diu que no tinguis feina');
/* «No tens res pendent» quan el que passa és que has filtrat massa és mentir a
   qui mira. La pantalla ha de dir quantes n'hi ha a la resta de la xarxa. */
{
  const r = await page.evaluate(() => {
    const S = window.__SOS;
    S.state.tascaTema = 'no-existeix-aquest-tema';
    S.state.activeId = null; S.state.homeView = 'missions'; S.render();
    const txt = document.querySelector('.tab-body').textContent.replace(/\s+/g, ' ');
    S.state.tascaTema = '';
    return txt;
  });
  ok(!/No tens res pendent/.test(r) || /amb aquests filtres/i.test(r),
    'amb filtres, no es diu «no tens res pendent» a seques');
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
