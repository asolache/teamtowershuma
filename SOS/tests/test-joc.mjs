/* El joc del Comando · que ensenyi el que passa de debò
   ─────────────────────────────────────────────────────
   El Comando és **la cara fantàstica del SOS**, i per això el joc no pot
   ensenyar res que l'eina no faci. El que es prova aquí no és que «funcioni»
   sinó que les seves regles siguin les del SOS:

   · **Un poble es crema quan penja de massa poca gent.** És l'única manera de
     perdre, i ha de passar exactament quan la càrrega supera la capacitat.
   · **Una persona formada compta el doble.** Traducció del quart pas del
     mètode. Si no comptés més, formar no serviria i el joc ensenyaria el
     contrari del que volem.
   · **El coneixement no es compra: s'obté ensenyant.**
   · **Plantar a la plaça és obrir al node.** Si fossin dues coses separades, la
     plaça seria un videojoc al costat i no el SOS.
   · **Els tres que ataquen són els del còmic**, amb el seu poder: la por
     paralitza, el rumor s'escampa, l'extracció et buida.
   · **Els nivells són els del SOS** i citen els mòduls de formació de veritat.
   · **Molekulàndia no és conquerir el mapa.** */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'joc.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

/* Per defecte, el mòbil: és per a on està fet. */
const nova = async (w = 390, h = 844) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(APP);
  await p.waitForFunction(() => window.__JOC && window.__JOC.S.sel);
  await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach(d => d.close()));
  return { ctx, p, errs };
};

console.log('\n1 · Comença amb el coneixement, no amb una eina');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC;
    return { comarques: J.COMARQUES.length, actives: J.actives(),
      gent: J.node('Alt Penedès').gent.length, sabers: J.S.sabers.length, nivell: J.S.nivell,
      diari: J.S.diari.map(l => l.txt).join(' ') };
  });
  ok(r.comarques === 42, 'les 42 comarques reals de Catalunya');
  ok(r.actives.length === 1 && r.actives[0] === 'Alt Penedès', 'es comença per una sola, la de casa');
  ok(r.gent === 2, 'amb dues persones, no amb un equip fet');
  ok(/Molekulon passa el coneixement a Mazinguer i Horacio/.test(r.diari),
    'el diari diu d\'on ve el SOS: un saber que passa el Molekulon');
  ok(r.sabers === 0 && r.nivell === 'N0', 'i encara no se sap res: s\'ha de guanyar');
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
    n.dins = ['banctemps']; out.car1 = J.carrega(c); out.t1 = J.tensio(c);
    n.dins = [];
    n.gent.push({ nom: 'C', rol: 'sosté', formada: false }, { nom: 'D', rol: 'ordena', formada: false });
    out.cap1 = J.capacitat(c);
    n.dins = ['banctemps']; out.t2 = J.tensio(c);
    n.dins = ['banctemps', 'biblioteca']; out.t3 = J.tensio(c);
    return out;
  });
  ok(r.cap0 === 2 && r.car1 === 3 && r.t1 === 2, 'amb 2 persones i càrrega 3, es crema');
  ok(r.cap1 === 4 && r.t2 === 0, 'amb 4 persones la mateixa dinàmica aguanta');
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
    return { abans, despres: { cap: J.capacitat(c), t: J.tensio(c) } };
  });
  ok(r.abans.cap === 2 && r.abans.t === 2, 'abans: es crema');
  /* Puja de 2 a 3 i deixa la càrrega just a la capacitat: apaga el foc i no ho
     deixa còmode. Dir que formar una persona ho arregla del tot seria vendre el
     mètode més barat del que és. */
  ok(r.despres.cap === 3 && r.despres.t === 1,
    'formar UNA persona puja la capacitat de 2 a 3 i atura la cremada');
  ok(r.abans.t === 2 && r.despres.t < 2, 'deixa d\'estar en cremada — però es queda al límit');
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
    n.placa.cel[0][0] = { d: 'banctemps', vida: 100, max: 100, parat: 0, tic: 0 };
    const mortAbans = J.S.mort;
    J.passaTorn();
    return { dins: n.dins.length, gent: n.gent.length, mort: J.S.mort > mortAbans,
      placa: n.placa.cel[0][0], diari: J.S.diari.map(l => l.txt).join(' ') };
  });
  ok(r.dins === 0, 'la dinàmica cau');
  ok(r.gent === 1, 'i marxa una persona: qui s\'ha cremat no es queda a sostenir res més');
  ok(r.placa === null, 'i desapareix també de la plaça: no són dues coses');
  ok(r.mort, 'el Mundo Muerto avança amb això');
  ok(/penjava de massa poca gent/i.test(r.diari), 'el diari diu el motiu, no «has perdut»');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n══ La plaça: plantar amb el polze ══');

console.log('\n5 · Plantar a la plaça és obrir al node');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC, c = 'Alt Penedès', n = J.node(c);
    n.gent = [{ nom: 'A', rol: 'connecta', formada: false }, { nom: 'B', rol: 'cuida', formada: false }];
    n.dins = []; n.hores = 200;
    const out = {};
    out.faltaRol = J.planta(c, 0, 0, 'energia');        // cal finança + ordena
    out.ok = J.planta(c, 0, 0, 'banctemps');
    out.dinsNode = n.dins.slice();
    out.aLaPlaca = !!n.placa.cel[0][0];
    out.ocupada = J.planta(c, 0, 0, 'banctemps');
    n.gent.push({ nom: 'C', rol: 'ordena', formada: false }, { nom: 'D', rol: 'fabrica', formada: false });
    n.hores = 5;
    out.senseHores = J.planta(c, 1, 1, 'biblioteca');   // costa 25
    return out;
  });
  ok(!r.faltaRol.ok && /Falta qui/.test(r.faltaRol.per),
    'sense els rols no es planta, i diu quins falten: «' + r.faltaRol.per + '»');
  ok(r.ok.ok && r.aLaPlaca, 'amb els rols, es planta a la casella');
  ok(r.dinsNode.includes('banctemps'),
    'i la mateixa acció obre la dinàmica al node: la plaça no és un joc a part');
  ok(!r.ocupada.ok, 'no s\'hi pot plantar dues vegades a sobre');
  ok(!r.senseHores.ok && /hores/i.test(r.senseHores.per), 'i sense hores tampoc: «' + r.senseHores.per + '»');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n6 · Els tres del còmic, amb el seu poder');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC;
    return { noms: Object.values(J.VILANS).map(v => v.nom),
      paralitza: !!J.VILANS.por, rapid: J.VILANS.rumor.vel > J.VILANS.por.vel,
      roba: J.VILANS.extraccio.roba > 0, dur: J.VILANS.extraccio.vida > J.VILANS.rumor.vida };
  });
  ok(r.noms.includes('Max Miedox') && r.noms.includes('Mala Yerbax') && r.noms.includes('Mc Greggor'),
    'són els tres supervilans del còmic: ' + r.noms.join(', '));
  ok(r.rapid, 'el rumor va més de pressa que la por');
  ok(r.roba && r.dur, 'i l\'extracció et pren hores mentre camina, i costa més de tombar');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n7 · Una onada de debò: la por para el projecte i el rumor s\'escampa');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const J = window.__JOC, c = 'Alt Penedès', n = J.node(c);
    J.entra(c);
    n.gent = [{ nom: 'A', rol: 'cuida', formada: true }, { nom: 'B', rol: 'sosté', formada: true },
              { nom: 'C', rol: 'ensenya', formada: true }, { nom: 'D', rol: 'connecta', formada: true }];
    n.hores = 300;
    J.planta(c, 1, 0, 'cures');
    /* Un vilà just davant del projecte: ha de fer mal i, si és la por, parar-lo. */
    n.placa.vilans = [{ mena: 'por', f: 1, x: 0.3, vida: 200, max: 200 }];
    n.placa.corrent = true; n.placa.cua = [];
    const vidaAbans = n.placa.cel[1][0].vida;
    J.tic();
    const cel = n.placa.cel[1][0];
    return { vidaAbans, vidaDespres: cel ? cel.vida : 0, parat: cel ? cel.parat : 0 };
  });
  ok(r.vidaDespres < r.vidaAbans, 'el vilà fa mal al projecte que té davant');
  ok(r.parat > 0, 'i la por el PARA: és el seu poder, no més dany');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n8 · Cada projecte defensa a la seva manera');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC, c = 'Alt Penedès', n = J.node(c);
    J.entra(c);
    n.gent = [{ nom: 'A', rol: 'encén', formada: true }, { nom: 'B', rol: 'ritme', formada: true },
              { nom: 'C', rol: 'connecta', formada: true }, { nom: 'D', rol: 'cuida', formada: true }];
    n.hores = 400;
    // La festa dissol el rumor de tota la fila
    J.planta(c, 0, 0, 'festa');
    n.placa.cel[0][0].tic = 5000;
    n.placa.vilans = [{ mena: 'rumor', f: 0, x: 3, vida: 80, max: 80 },
                      { mena: 'rumor', f: 1, x: 3, vida: 80, max: 80 }];
    n.placa.corrent = true; n.placa.cua = [];
    J.tic();
    const viusFila0 = n.placa.vilans.filter(v => v.f === 0).length;
    const viusFila1 = n.placa.vilans.filter(v => v.f === 1).length;
    // El banc de temps genera hores
    J.planta(c, 2, 0, 'banctemps');
    n.placa.cel[2][0].tic = 5000;
    const horesAbans = n.hores;
    J.tic();
    return { viusFila0, viusFila1, genera: n.hores > horesAbans };
  });
  ok(r.viusFila0 === 0, 'la festa dissol el rumor de la seva fila');
  ok(r.viusFila1 === 1, 'i no toca el de la fila del costat: neteja on és, no pertot');
  ok(r.genera, 'i el banc de temps genera hores: sense ell no es pot plantar res més');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n9 · Si arriben al final, s\'emporten algú');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC, c = 'Alt Penedès', n = J.node(c);
    J.entra(c);
    n.gent.push({ nom: 'X', rol: 'cuida', formada: false });
    const gentAbans = n.gent.length, mortAbans = J.S.mort;
    n.placa.vilans = [{ mena: 'rumor', f: 0, x: -0.4, vida: 80, max: 80 }];
    n.placa.corrent = true; n.placa.cua = [];
    J.tic();
    return { gentAbans, gent: n.gent.length, mort: J.S.mort > mortAbans,
      fora: n.placa.vilans.length, diari: J.S.diari.map(l => l.txt).join(' ') };
  });
  ok(r.gent === r.gentAbans - 1, 'travessar la plaça costa una persona');
  ok(r.mort && r.fora === 0, 'el Mundo Muerto avança i el vilà desapareix');
  ok(/plega/.test(r.diari), 'i el diari ho diu amb el nom de qui plega');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n══ Integració amb el SOS ══');

console.log('\n10 · Els nivells són els del SOS i citen la formació de debò');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC;
    return { ids: J.NIVELLS.map(n => n.id), noms: J.NIVELLS.map(n => n.nom),
      rols: J.NIVELLS.map(n => n.rol),
      moduls: J.NIVELLS.flatMap(n => n.moduls.map(m => m[0])) };
  });
  ok(r.ids.join(',') === 'N0,N1,N2,N3', 'els quatre nivells de SOS_LEVELS');
  ok(r.noms.includes('Gestor/a SOS') && r.noms.includes('Mentor/a'),
    'amb el seu nom: ' + r.noms.join(' → '));
  ok(r.rols.includes('superheroi') && r.rols.includes('coordinador') && r.rols.includes('mentor'),
    'i cada nivell obre un rol de SOS_ROLES');
  ok(r.moduls.every(m => /^m\d+$/.test(m)) && r.moduls.includes('m16'),
    'i cita mòduls de la formació de veritat, inclòs el de formació de formadors');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n11 · Es puja de nivell fent, i no acumulant punts');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC, c = 'Alt Penedès', n = J.node(c);
    const out = { inici: J.S.nivell };
    /* Molta gent i moltes hores però res obert: no puja. */
    for (let i = 0; i < 20; i++) n.gent.push({ nom: 'P' + i, rol: 'connecta', formada: false });
    n.hores = 9999; J.S.psico = 500;
    J.pujaNivell(); out.nomesGent = J.S.nivell;
    n.dins = ['banctemps', 'biblioteca'];
    J.pujaNivell(); out.ambDues = J.S.nivell;
    return Object.assign(out, { rols: J.S.rols.slice() });
  });
  ok(r.inici === 'N0', 'es comença a Explorador/a');
  ok(r.nomesGent === 'N0', 'amb 22 persones i 500 de vincle però res obert, NO puja');
  ok(r.ambDues === 'N1', 'i puja a Practicant en operar dues dinàmiques de debò');
  ok(r.rols.includes('superheroi'), 'i s\'obre el rol de Superheroi/na');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n12 · El coneixement només s\'obre ensenyant');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC, n = J.node('Alt Penedès');
    for (let i = 0; i < 30; i++) n.gent.push({ nom: 'X' + i, rol: 'connecta', formada: false });
    J.activa('Garraf'); J.activa('Anoia'); J.activa('Osona');
    J.obreSabers();
    const senseFormar = J.S.sabers.length;
    n.gent.slice(0, 2).forEach(p => p.formada = true);
    J.obreSabers();
    return { senseFormar, ambDos: J.S.sabers.length, primer: J.S.sabers[0] };
  });
  ok(r.senseFormar === 0, 'amb 32 persones i 4 comarques però ningú format, cap saber');
  ok(r.ambDos === 1 && r.primer === 'mapa', 'i amb dues formades s\'obre el mapa de valor');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n13 · Molekulàndia no és conquerir el mapa');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC;
    const cs = J.COMARQUES.slice(0, 6).map(x => x[0]);
    cs.forEach(c => J.activa(c, true));
    cs.forEach(c => { const n = J.node(c);
      for (let i = 0; i < 6; i++) n.gent.push({ nom: 'P' + i, rol: 'connecta', formada: true });
      n.dins = ['banctemps', 'biblioteca']; });
    const senseSaber = J.clusterLiquid().length;
    J.S.sabers.push('liquid');
    const senseTrobada = J.clusterLiquid().length;
    cs.forEach(c => J.node(c).trobada = true);
    const senseponts = (J.clusterLiquid().sort((a, b) => b.length - a.length)[0] || []).length;
    for (let i = 0; i < cs.length - 1; i++) J.S.ponts.push([cs[i], cs[i + 1]]);
    return { senseSaber, senseTrobada, senseponts,
      gran: (J.clusterLiquid().sort((a, b) => b.length - a.length)[0] || []).length };
  });
  ok(r.senseSaber === 0, 'sense el coneixement de l\'estat líquid, no n\'hi ha');
  ok(r.senseTrobada === 0, 'ni amb sis comarques plenes si no s\'han vist en persona');
  ok(r.senseponts === 1, 'amb la trobada feta però sense lligams, cada node va sol');
  ok(r.gran === 6, 'i és lligant-les que es fa el grup');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n14 · McGragor no ataca: ofereix, i el cost arriba després');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const J = window.__JOC;
    J.node('Alt Penedès').gent.forEach(p => p.formada = true);
    J.S.torn = 4; J.passaTorn();
    const txt = document.querySelector('#dlCos').innerText.replace(/\s+/g, ' ');
    const btns = [...document.querySelectorAll('#dlPeu button')].map(b => b.textContent);
    const econoAbans = J.S.econo, mortAbans = J.S.mort;
    document.querySelector('#dlPeu button').click();
    await new Promise(r => setTimeout(r, 80));
    return { txt, btns, guanya: J.S.econo > econoAbans, paga: J.S.mort > mortAbans,
      desformats: J.actives().every(x => J.node(x).gent.every(p => !p.formada)) };
  });
  ok(r.btns.length === 2, 'apareix amb dues sortides: acceptar o dir que no');
  ok(/No cal que ho aprengueu/.test(r.txt), 'i ofereix la trampa del còmic literal');
  ok(r.guanya && r.paga, 'acceptar dona estalvi immediat i fa avançar el Mundo Muerto');
  ok(r.desformats, 'i el poble deixa de saber portar-ho: aquesta és la dependència');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n══ Els minijocs alimenten el model, no donen punts per punts ══');

console.log('\n15 · Reparteix la càrrega: la regla de la cremada com a trencaclosques');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const J = window.__JOC, c = 'Alt Penedès', n = J.node(c);
    n.gent = [{ nom: 'Ana P', rol: 'cuida', formada: false }, { nom: 'Pau R', rol: 'sosté', formada: false },
              { nom: 'Neus M', rol: 'ordena', formada: false }];
    n.dins = ['banctemps', 'biblioteca', 'cures'];
    J.mjCarrega();
    const txt = document.querySelector('#dlCos').innerText;
    /* Es reparteix malament a posta: tot a la primera persona. */
    for (let k = 0; k < 3; k++) {
      document.querySelector('#dlCos [data-g="0"]').click();
      await new Promise(r => setTimeout(r, 20));
    }
    await new Promise(r => setTimeout(r, 900));
    const final = document.querySelector('#dlCos').innerText;
    return { txt, final, mort: J.S.mort };
  });
  ok(/ningú pot portar-ne més de dues/i.test(r.txt), 'diu la regla abans de jugar');
  /* Es llegeix el modal FINAL, que és l'últim que veu qui hi juga. La primera
     versió mirava la pantalla intermèdia, que als 600 ms ja no hi era. */
  ok(/no cau el projecte: cau la persona/i.test(r.final),
    'i amb tres feines a la mateixa persona diu el que passa de debò: no cau el projecte, cau la persona');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n16 · Aparella: el que fa un banc de temps, i dona hores');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const J = window.__JOC, c = 'Alt Penedès', n = J.node(c);
    const horesAbans = n.hores;
    J.mjAparella();
    const txt = document.querySelector('#dlCos').innerText;
    /* Es resol sencer: cada oferta amb la seva demanda pel seu índex. */
    for (let k = 0; k < 4; k++) {
      const o = document.querySelector('#dlCos [data-o]:not([disabled])');
      if (!o) break;
      const i = o.dataset.o; o.click();
      await new Promise(r => setTimeout(r, 20));
      const d = document.querySelector('#dlCos [data-d="' + i + '"]');
      if (d) d.click();
      await new Promise(r => setTimeout(r, 20));
    }
    return { txt, hores: n.hores, guany: n.hores > horesAbans,
      final: document.querySelector('#dlCos').innerText };
  });
  ok(/no es troben sols/i.test(r.txt), 'explica per què cal creuar-los');
  ok(r.guany, 'resoldre\'l dona hores de debò al node (' + r.hores + ')');
  ok(/no inventa res/i.test(r.final), 'i diu què és això al SOS: ensenyar el que ja encaixava');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n17 · Es juga amb el polze i a una sola pantalla');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC;
    const visible = e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
    const mapa = { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      caselles: document.querySelectorAll('.cas').length,
      pagina: document.body.scrollHeight <= window.innerHeight + 2 };
    J.entra('Alt Penedès');
    const barra = document.querySelector('#polze').getBoundingClientRect();
    const cel = document.querySelectorAll('.cel').length;
    const petits = [...document.querySelectorAll('#polze button')].filter(visible)
      .filter(e => e.getBoundingClientRect().height < 40).length;
    return Object.assign(mapa, { barra: Math.round(barra.top), alt: window.innerHeight,
      cel, petits, sw2: document.documentElement.scrollWidth });
  });
  ok(r.sw <= r.cw + 1 && r.sw2 <= r.cw + 1, 'sense desbordament horitzontal a cap de les dues pantalles');
  ok(r.pagina, 'la pàgina no fa scroll: el joc no mou el terra mentre hi jugues');
  ok(r.caselles === 42, 'les 42 comarques es pinten');
  ok(r.cel === 20, 'i la plaça té 20 caselles (4×5), totes al pols del dit');
  ok(r.barra > r.alt * 0.55,
    'la barra d\'accions viu a la meitat baixa de la pantalla, on arriba el polze (' + r.barra + ' de ' + r.alt + ')');
  ok(!r.petits, 'cap botó de la barra per sota de 40 px');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n18 · Tocar una comarca activa hi entra, i es pot tornar');
{
  const { ctx, p, errs } = await nova();
  await p.click('.cas[data-c="Alt Penedès"]');
  const dins = await p.evaluate(() => ({ pant: window.__JOC.S.pantalla,
    enrere: !document.querySelector('#btnEnrere').hidden,
    placa: !!document.querySelector('#placa .cel') }));
  await p.click('#btnEnrere');
  const fora = await p.evaluate(() => window.__JOC.S.pantalla);
  ok(dins.pant === 'comarca' && dins.placa, 'tocar-la hi entra directament, sense passos de més');
  ok(dins.enrere, 'i surt el botó de tornar');
  ok(fora === 'mapa', 'que torna al mapa');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n19 · Una partida sencera no peta');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const J = window.__JOC;
    for (let t = 0; t < 30; t++) {
      const cs = J.actives();
      const c = cs[Math.floor(Math.random() * cs.length)];
      const r = Math.random();
      if (r < 0.3) J.fesForma(c);
      else if (r < 0.5) { const lliure = J.COMARQUES.map(x => x[0]).filter(x => !J.S.nodes[x]);
        if (lliure.length) J.fesActiva(lliure[0]); }
      else if (r < 0.75) { const d = Object.keys(J.DINS).find(d => J.potEngegar(c, d));
        if (d) { J.node(c).hores += 100; J.planta(c, t % 4, t % 5, d); } }
      else J.fesTrobada(c);
      J.passaTorn();
      if (J.S.acabat) break;
    }
    /* I un tram de plaça de debò, amb vilans i tot. */
    const c = J.actives()[0];
    J.entra(c); J.comencaOnada(c);
    for (let i = 0; i < 120; i++) J.tic();
    document.querySelectorAll('dialog[open]').forEach(d => d.close());
    return { torn: J.S.torn, nodes: J.actives().length, psico: J.S.psico, nivell: J.S.nivell,
      vilans: J.node(c).placa.vilans.length };
  });
  ok(r.torn > 1, 'la partida avança (' + r.torn + ' torns, ' + r.nodes + ' comarques, nivell ' + r.nivell + ')');
  ok(typeof r.psico === 'number' && !Number.isNaN(r.psico), 'els comptadors segueixen sent números');
  ok(typeof r.vilans === 'number', 'i l\'onada s\'ha resolt sense trencar res');
  ok(errs.length === 0, 'sense errors de pàgina en tota la partida' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

/* La capçalera va caure dues vegades: el títol es llegia «El joc del…» i el
   subtítol es tallava a mitja paraula —«Practi»—, que en una pantalla petita
   sembla que la pàgina estigui trencada. No és cosmètica: si el primer que
   veus és un tall, el joc ja t'ha dit que no està acabat. Es mesura a les
   amplades reals dels mòbils, amb el nom de comarca posat. */
console.log('\n20 · La capçalera no es talla en cap mòbil');
for (const [w, h] of [[320, 568], [360, 740], [390, 844], [430, 932]]) {
  const { ctx, p, errs } = await nova(w, h);
  const r = await p.evaluate(() => {
    const q = s => document.querySelector(s);
    const talla = e => !!e && e.scrollWidth > e.clientWidth + 1;
    const mesura = () => {
      const t = q('#hudTit');
      return { tit: talla(t), sub: talla(t.querySelector('small')), hud: talla(q('.hud')),
        alt: Math.round(q('.hud').getBoundingClientRect().height) };
    };
    const mapa = mesura();
    window.__JOC.entra(window.__JOC.actives()[0]);
    const polze = q('.polze');
    return { mapa, comarca: mesura(), amplada: document.documentElement.scrollWidth,
      polzeDins: !!polze && polze.getBoundingClientRect().bottom <= innerHeight + 1 };
  });
  ok(!r.mapa.tit && !r.mapa.sub, w + 'px · al mapa el títol i el subtítol es llegeixen sencers');
  ok(!r.comarca.tit && !r.comarca.sub, w + 'px · dins la comarca, també');
  ok(!r.mapa.hud && r.amplada <= w, w + 'px · la capçalera no surt de la pantalla');
  ok(r.comarca.alt <= 90, w + 'px · i no es menja la plaça (' + r.comarca.alt + 'px)');
  ok(r.polzeDins, w + 'px · la barra del polze queda dins la pantalla');
  ok(errs.length === 0, w + 'px · sense errors de pàgina');
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
