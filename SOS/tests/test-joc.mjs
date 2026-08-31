/* El joc del Comando · que ensenyi el que passa de debò
   ─────────────────────────────────────────────────────
   Un joc que decora el producte no serveix de res. El que es prova aquí no és
   que «funcioni» sinó que les seves regles siguin les del SOS:

   · **Un poble es crema quan penja de massa poca gent.** És l'única manera de
     perdre, i ha de passar exactament quan la càrrega supera la capacitat —no
     abans, per no espantar, ni després, per no mentir.
   · **Una persona formada compta el doble.** És la traducció del quart pas del
     mètode: formar gent i marxar. Si no compta més, formar no serveix de res i
     el joc ensenya el contrari del que volem.
   · **El coneixement no es compra: s'obté ensenyant.** No hi pot haver cap
     camí que l'obri sense gent formada.
   · **Molekulàndia no és conquerir el mapa.** Demana lligams, cap node
     tensionat i la trobada feta. Tenir moltes comarques no hi porta.

   I el que McGragor ha de fer: no atacar, sinó oferir una cosa que va bé ara. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'joc.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const nova = async (w = 1280) => {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(APP);
  await p.waitForFunction(() => window.__JOC && window.__JOC.S.sel);
  return { ctx, p, errs };
};

console.log('\n1 · Comença amb el coneixement, no amb una eina');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC;
    return { comarques: J.COMARQUES.length, actives: J.actives(),
      gent: J.node('Alt Penedès').gent.length, sabers: J.S.sabers.length,
      diari: J.S.diari.map(l => l.txt).join(' ') };
  });
  ok(r.comarques === 42, 'les 42 comarques reals de Catalunya');
  ok(r.actives.length === 1 && r.actives[0] === 'Alt Penedès',
    'es comença per una sola comarca, la de casa');
  ok(r.gent === 2, 'i amb dues persones, no amb un equip fet');
  ok(/Molekulon passa el coneixement a Mazinguer i Horacio/.test(r.diari),
    'el diari diu d\'on ve el SOS: un saber que passa el Molekulon');
  ok(r.sabers === 0, 'i encara no se sap res: el coneixement s\'ha de guanyar');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n══ El que importa: es crema quan penja de massa poca gent ══');

console.log('\n2 · La càrrega per sobre de la capacitat, i no abans');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC, c = 'Alt Penedès', n = J.node(c);
    n.gent = [{ nom: 'A', rol: 'connecta', formada: false }, { nom: 'B', rol: 'cuida', formada: false }];
    const out = { cap0: J.capacitat(c) };
    n.dins = ['banctemps'];                       // càrrega 3, capacitat 2
    out.car1 = J.carrega(c); out.t1 = J.tensio(c);
    n.dins = [];
    n.gent.push({ nom: 'C', rol: 'sosté', formada: false },
                { nom: 'D', rol: 'ordena', formada: false });
    out.cap1 = J.capacitat(c);
    n.dins = ['banctemps'];                       // càrrega 3, capacitat 4
    out.t2 = J.tensio(c);
    n.dins = ['banctemps', 'biblioteca'];         // càrrega 5, capacitat 4
    out.t3 = J.tensio(c);
    return out;
  });
  ok(r.cap0 === 2 && r.car1 === 3 && r.t1 === 2,
    'amb 2 persones i una dinàmica de càrrega 3, es crema');
  ok(r.cap1 === 4 && r.t2 === 0, 'amb 4 persones, la mateixa dinàmica aguanta tranquil·la');
  ok(r.t3 === 2, 'i obrir-ne una segona sense més gent la torna a posar per sobre');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n3 · Formar algú compta el doble, que és tot el mètode');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC, c = 'Alt Penedès', n = J.node(c);
    n.gent = [{ nom: 'A', rol: 'connecta', formada: false }, { nom: 'B', rol: 'cuida', formada: false }];
    n.dins = ['banctemps'];
    const abans = { cap: J.capacitat(c), t: J.tensio(c) };
    n.gent[0].formada = true;
    const despres = { cap: J.capacitat(c), t: J.tensio(c) };
    return { abans, despres };
  });
  ok(r.abans.cap === 2 && r.abans.t === 2, 'abans: es crema');
  /* Puja de 2 a 3 i deixa la càrrega **just** a la capacitat: apaga el foc i
     no ho deixa còmode. La primera versió d'aquesta prova esperava tensió 0, i
     era la prova la que estava equivocada: dir que formar una persona ho
     arregla del tot seria vendre el mètode més barat del que és. */
  ok(r.despres.cap === 3 && r.despres.t === 1,
    'formar UNA persona puja la capacitat de 2 a 3 i atura la cremada, sense afegir ningú');
  ok(r.abans.t === 2 && r.despres.t < 2,
    'i el que importa: deixa d\'estar en cremada — però es queda al límit, no tranquil');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n4 · La cremada s\'emporta la dinàmica i una persona');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC, c = 'Alt Penedès', n = J.node(c);
    n.gent = [{ nom: 'A', rol: 'connecta', formada: false }, { nom: 'B', rol: 'cuida', formada: false }];
    n.dins = ['banctemps'];
    const mortAbans = J.S.mort;
    J.passaTorn();
    return { dins: n.dins.length, gent: n.gent.length, mort: J.S.mort > mortAbans,
      diari: J.S.diari.map(l => l.txt).join(' ') };
  });
  ok(r.dins === 0, 'la dinàmica cau');
  ok(r.gent === 1, 'i marxa una persona: qui s\'ha cremat no es queda a sostenir res més');
  ok(r.mort, 'el Mundo Muerto avança amb això');
  ok(/penjava de massa poca gent/i.test(r.diari),
    'i el diari diu el motiu de veritat, no «has perdut»');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n5 · El coneixement només s\'obre ensenyant');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC, c = 'Alt Penedès', n = J.node(c);
    /* Molta gent i moltes comarques, però ningú format. */
    for (let i = 0; i < 30; i++) n.gent.push({ nom: 'X' + i, rol: 'connecta', formada: false });
    J.activa('Garraf'); J.activa('Anoia'); J.activa('Osona');
    J.obreSabers();
    const senseFormar = J.S.sabers.length;
    n.gent.slice(0, 2).forEach(p => p.formada = true);
    J.obreSabers();
    return { senseFormar, ambDos: J.S.sabers.length, primer: J.S.sabers[0] };
  });
  ok(r.senseFormar === 0,
    'amb 32 persones i 4 comarques però ningú format, no s\'obre cap saber');
  ok(r.ambDos === 1 && r.primer === 'mapa',
    'i amb dues persones formades s\'obre el primer: el mapa de valor');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n6 · Una dinàmica demana els rols que demana');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC, c = 'Alt Penedès', n = J.node(c);
    n.gent = [{ nom: 'A', rol: 'connecta', formada: false }];
    const nomes1 = J.potEngegar(c, 'banctemps');          // cal connecta + cuida
    n.gent.push({ nom: 'B', rol: 'cuida', formada: false });
    const amb2 = J.potEngegar(c, 'banctemps');
    const altra = J.potEngegar(c, 'energia');             // cal finança + ordena
    return { nomes1, amb2, altra, cal: J.DINS.banctemps.cal };
  });
  ok(!r.nomes1 && r.amb2, 'el banc de temps necessita qui connecta I qui cuida');
  ok(!r.altra, 'i la comunitat energètica no s\'obre amb els rols equivocats');
  ok(r.cal.length === 2, 'els requisits són explícits, no una xifra opaca');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n7 · Molekulàndia no és conquerir el mapa');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC;
    const cs = J.COMARQUES.slice(0, 6).map(x => x[0]);
    cs.forEach(c => J.activa(c, true));
    /* Totes actives, ben poblades i sense tensió… però sense saber l'estat
       líquid, sense lligams i sense trobada. */
    cs.forEach(c => { const n = J.node(c);
      for (let i = 0; i < 6; i++) n.gent.push({ nom: 'P' + i, rol: 'connecta', formada: true });
      n.dins = ['banctemps', 'biblioteca']; });
    const senseSaber = J.clusterLiquid().length;
    J.S.sabers.push('liquid');
    const senseTrobada = J.clusterLiquid().length;
    cs.forEach(c => J.node(c).trobada = true);
    const senseponts = (J.clusterLiquid().sort((a, b) => b.length - a.length)[0] || []).length;
    for (let i = 0; i < cs.length - 1; i++) J.S.ponts.push([cs[i], cs[i + 1]]);
    const gran = (J.clusterLiquid().sort((a, b) => b.length - a.length)[0] || []).length;
    return { senseSaber, senseTrobada, senseponts, gran };
  });
  ok(r.senseSaber === 0, 'sense el coneixement de l\'estat líquid, no n\'hi ha');
  ok(r.senseTrobada === 0, 'ni amb sis comarques plenes si no s\'han vist en persona');
  ok(r.senseponts === 1, 'amb la trobada feta però sense lligams, cada node va sol');
  ok(r.gran === 6, 'i és lligant-les que es fa el grup: 6 comarques que s\'aguanten entre elles');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n8 · Un lligam reparteix la càrrega de debò');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC;
    J.activa('Garraf', true);
    const c = 'Alt Penedès';
    const abans = J.capacitat(c);
    J.S.ponts.push([c, 'Garraf']);
    return { abans, despres: J.capacitat(c) };
  });
  ok(r.despres === r.abans + 1,
    'lligar dues comarques puja la capacitat de totes dues: per això serveix una xarxa');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n9 · McGragor no ataca: ofereix, i el cost arriba després');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const J = window.__JOC;
    const c = 'Alt Penedès', n = J.node(c);
    n.gent.forEach(p => p.formada = true);
    J.S.torn = 4; J.passaTorn();                 // torn 5 → oferta
    const dlg = document.querySelector('#dlg');
    const txt = document.querySelector('#dlCos').innerText.replace(/\s+/g, ' ');
    const btns = [...document.querySelectorAll('#dlPeu button')].map(b => b.textContent);
    const econoAbans = J.S.econo, mortAbans = J.S.mort;
    document.querySelector('#dlPeu button').click();   // acceptar
    await new Promise(r => setTimeout(r, 100));
    return { obert: !!dlg && btns.length === 2, txt, btns,
      guanya: J.S.econo > econoAbans, paga: J.S.mort > mortAbans,
      desformats: J.actives().every(x => J.node(x).gent.every(p => !p.formada)) };
  });
  ok(r.obert, 'apareix amb dues sortides: acceptar o dir que no');
  ok(/No cal que ho aprengueu/.test(r.txt),
    'i el que ofereix és exactament la trampa del còmic: no cal que ho aprengueu');
  ok(r.guanya && r.paga,
    'acceptar dona estalvi immediat i alhora fa avançar el Mundo Muerto');
  ok(r.desformats, 'i el poble deixa de saber portar-ho: aquesta és la dependència');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n10 · Les accions es gasten i el torn les torna');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC;
    const inici = J.S.accions;
    J.fesTrobada('Alt Penedès');
    const despresD1 = J.S.accions;
    J.fesForma('Alt Penedès'); J.fesForma('Alt Penedès');
    const zero = J.S.accions;
    J.fesTrobada('Alt Penedès');     // ja no en queden
    const bloquejat = J.S.accions;
    J.passaTorn();
    return { inici, despresD1, zero, bloquejat, torn: J.S.accions };
  });
  ok(r.inici === 3 && r.despresD1 === 2, 'cada acció en gasta una');
  ok(r.zero === 0 && r.bloquejat === 0, 'i sense accions no es pot fer res més');
  ok(r.torn >= 3, 'passar el torn les torna');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n11 · Es pot jugar, i a 390 px també');
{
  const { ctx, p, errs } = await nova(390);
  await p.evaluate(() => document.querySelector('#dlg').close());
  const r = await p.evaluate(() => {
    const visible = e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
    return { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      caselles: document.querySelectorAll('.cas').length,
      petits: [...document.querySelectorAll('button')].filter(visible)
        .filter(e => e.getBoundingClientRect().height < 32).length };
  });
  ok(r.sw <= r.cw + 1, 'sense desbordament horitzontal (' + r.sw + ' ≤ ' + r.cw + ')');
  ok(r.caselles === 42, 'les 42 comarques es pinten');
  ok(!r.petits, 'cap botó minúscul');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n12 · Una partida sencera no peta');
/* Es juga a l'atzar 40 torns fent el que es pugui. No es comprova que es
   guanyi —depèn de la sort— sinó que res es trenqui pel camí, que és el que
   passa quan un joc té estats que ningú ha previst. */
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const J = window.__JOC;
    document.querySelector('#dlg').close();
    for (let t = 0; t < 40; t++) {
      const cs = J.actives();
      while (J.S.accions > 0 && !J.S.acabat) {
        const c = cs[Math.floor(Math.random() * cs.length)];
        const r = Math.random();
        if (r < 0.3) J.fesForma(c);
        else if (r < 0.55) { const lliure = J.COMARQUES.map(x => x[0]).filter(x => !J.S.nodes[x]);
          if (lliure.length) J.fesActiva ? J.fesActiva(lliure[0]) : J.activa(lliure[0]); else J.fesForma(c); }
        else if (r < 0.8) { const d = Object.keys(J.DINS).find(d => J.potEngegar(c, d));
          if (d) J.fesEngega(c, d); else J.fesForma(c); }
        else J.fesTrobada(c);
        if (J.S.accions === J.S.accions) { /* evita bucle infinit si res gasta */ }
        break;
      }
      J.passaTorn();
      if (J.S.acabat) break;
    }
    document.querySelectorAll('dialog[open]').forEach(d => d.close());
    return { torn: J.S.torn, nodes: J.actives().length, psico: J.S.psico,
      acabat: J.S.acabat, mort: J.S.mort };
  });
  ok(r.torn > 1, 'la partida avança (' + r.torn + ' torns, ' + r.nodes + ' comarques)');
  ok(typeof r.psico === 'number' && !Number.isNaN(r.psico), 'els comptadors segueixen sent números');
  ok(errs.length === 0, 'sense errors de pàgina en 40 torns' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
