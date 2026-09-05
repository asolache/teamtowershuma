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
import { readFileSync } from 'node:fs';

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
  /* Una plaça acabada de començar només té oberta la primera dinàmica: el
     desbloqueig és progressiu i cada onada aguantada n'obre una altra. La
     majoria de proves parlen d'altres regles i han de poder plantar el que els
     toca provar, i criden `obreTot()`. La prova del desbloqueig, no. */
  await p.evaluate(() => { window.obreTot = () => window.__JOC.actives()
    .forEach(x => { window.__JOC.node(x).placa.aguantades = window.__JOC.DESBLOQUEIG.length; }); });
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
    window.obreTot();
    /* Sense caselles d'aportació: es sembren a l'atzar i el seu bonus canvia les
       hores i el cost de la plantada següent. Aquesta prova parla dels rols i de
       les hores, i amb elles passava o fallava segons on haguessin caigut. */
    n.placa.valor = [];
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
  /* Els noms es llegeixen de `COMANDO_VILLAINS`, que és d'on els llegeix l'app,
     i no s'escriuen aquí. Escrits a mà eren una quarta còpia del mateix nom, i
     va passar el que havia de passar: el supervilà va viure amb dues grafies
     —«Mc Greggor» a les dades i «McGragor» al text dels còmics— i aquest test
     defensava la vella. Una prova que copia el que hauria de comprovar dona
     verd el dia que la font canvia i vermell el dia que es corregeix. */
  const APP_SRC = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html'), 'utf8');
  const canonics = [...(APP_SRC.match(/^const COMANDO_VILLAINS=\[[\s\S]*?\n\];/m) || [''])[0]
    .matchAll(/name:'((?:[^'\\]|\\.)*)'/g)].map(m => m[1].replace(/\\'/g, "'"));
  const falten = canonics.filter(n => !r.noms.includes(n));
  ok(canonics.length === 3 && !falten.length,
    'són els tres supervilans que declara l\'app: ' + r.noms.join(', ')
    + (falten.length ? ' — hi falta ' + falten.join(', ') : ''));
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
    window.obreTot();
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
    window.obreTot();
    J.entra(c);
    n.placa.valor = [];        // el bonus d'una casella canviaria les xifres
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
    /* El banc de temps no ingressa res: **deixa caure** una fitxa d'hores i
       algú l'ha de recollir. La que ningú agafa, es perd. */
    J.planta(c, 2, 0, 'banctemps');
    n.placa.caigudes = [];
    n.placa.cel[2][0].tic = 5000;
    const horesAbans = n.hores;
    J.tic();
    const fitxes = n.placa.caigudes.length, sensToTocar = n.hores;
    const guany = J.recull(n.placa.caigudes[0] && n.placa.caigudes[0].id);
    return { viusFila0, viusFila1, fitxes, horesAbans,
      queda: sensToTocar === horesAbans, guany, hores: n.hores };
  });
  ok(r.viusFila0 === 0, 'la festa dissol el rumor de la seva fila');
  ok(r.viusFila1 === 1, 'i no toca el de la fila del costat: neteja on és, no pertot');
  ok(r.fitxes === 1, 'el banc de temps deixa caure una fitxa d\'hores');
  ok(r.queda, 'i mentre no la toques NO tens les hores: no ingressa sol');
  ok(r.guany > 0 && r.hores === r.horesAbans + r.guany,
    'recollir-la amb el dit és el que les dona (+' + r.guany + ')');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n9 · El primer cop surt el veïnat; el segon, s\'emporten algú');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC, c = 'Alt Penedès', n = J.node(c);
    J.entra(c);
    n.gent.push({ nom: 'X', rol: 'cuida', formada: false });
    const gentAbans = n.gent.length, mortAbans = J.S.mort;
    /* Primera arribada per la fila 0: la salvada de la fila encara hi és. */
    n.placa.vilans = [{ mena: 'rumor', f: 0, x: -0.4, vida: 80, max: 80 }];
    n.placa.corrent = true; n.placa.cua = [];
    J.tic();
    const un = { gent: n.gent.length, mort: J.S.mort, salva: n.placa.salva[0],
      fora: n.placa.vilans.length };
    /* Segona arribada per la mateixa fila: el poble ja ha sortit un cop. */
    n.placa.vilans = [{ mena: 'rumor', f: 0, x: -0.4, vida: 80, max: 80 }];
    n.placa.corrent = true; n.placa.cua = [];
    J.tic();
    return { gentAbans, mortAbans, un, gent: n.gent.length, mort: J.S.mort,
      fora: n.placa.vilans.length, diari: J.S.diari.map(l => l.txt).join(' ') };
  });
  ok(r.un.gent === r.gentAbans && r.un.mort === r.mortAbans,
    'la primera vegada surt el veïnat i no costa ningú: un error pot ser gratuït un cop');
  ok(r.un.salva === false, 'i la fila es gasta: la segona vegada el poble ja està cansat');
  ok(r.gent === r.gentAbans - 1, 'la segona arribada per la mateixa fila sí que costa una persona');
  ok(r.mort > r.mortAbans && r.fora === 0, 'el Mundo Muerto avança i el vilà desapareix');
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
      window.obreTot();          // el fuzz prova el model, no el desbloqueig
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

/* La introducció explicava tres regles escrites i cap de provada, i el que
   decideix la partida —la càrrega contra la capacitat— en una frase no es veu.
   Ara el tercer pas la deixa tocar, i el que ha d'aguantar és que **les xifres
   que ensenya surtin del model de debò**: si en tingués una còpia, el dia que
   el model canviés el tutorial seguiria ensenyant les regles velles i no ho
   notaria ningú. Veda 117. */
console.log('\n21 · La introducció ensenya el joc, no un resum del joc');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC;
    /* Les xifres del laboratori han de coincidir amb el que diuen les funcions
       que decideixen la partida, per a qualsevol estat. */
    const casos = [];
    /* Cal obrir el pas del laboratori: el que es compara és el que hi ha
       PINTAT contra el que diu el model, i sense el pas muntat no hi ha res
       pintat —la prova passaria sense mirar res. */
    J.obreIntro(2);
    J.labAcciona('reset');
    for (const q of ['dins', 'dins', 'forma', 'gent', 'dins']) {
      J.labAcciona(q);
      casos.push({ q, cap: J.capacitatDe(J.LAB), car: J.carregaDe(J.LAB), t: J.tensioDe(J.LAB),
        pintat: document.getElementById('labCap') && +document.getElementById('labCap').textContent,
        pintatCar: document.getElementById('labCar') && +document.getElementById('labCar').textContent });
    }
    J.labAcciona('reset');
    return { passos: J.INTRO.length, casos,
      inici: { cap: J.capacitatDe(J.LAB), car: J.carregaDe(J.LAB), t: J.tensioDe(J.LAB) },
      /* I que les tres funcions per nom donin el mateix que les de node solt. */
      mateix: (() => {
        const c = J.actives()[0], n = J.node(c);
        return J.capacitat(c) >= J.capacitatDe(n) && J.carrega(c) === J.carregaDe(n)
          && J.tensio(c) === J.tensioDe(n, J.capacitat(c) - J.capacitatDe(n));
      })() };
  });
  ok(r.passos === 8, `vuit passos a la introducció (${r.passos})`);
  ok(r.inici.t === 0, 'comença en verd: el primer que veu qui entra no és un error seu');
  ok(r.casos.every(c => c.pintat === c.cap && c.pintatCar === c.car),
    'el que pinta el laboratori és el que diuen capacitatDe i carregaDe, a cada pas');
  ok(r.casos.some(c => c.t === 2), 'i es pot arribar a cremar tocant botons: la regla es prova, no es llegeix');
  const recupera = r.casos.findIndex(c => c.q === 'forma');
  ok(recupera > 0 && r.casos[recupera].cap > r.casos[recupera - 1].cap + 0,
    'formar una persona puja la capacitat — el doble, que és el quart pas del mètode');
  ok(r.mateix, 'i les funcions per nom i les de node solt donen el mateix: no hi ha dos models');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n22 · S\'obre sola el primer cop, i després és al botó');
{
  const { ctx, p } = await nova();
  await p.waitForTimeout(700);
  const primer = await p.evaluate(() => !document.getElementById('intro').hidden);
  await p.evaluate(() => window.__JOC.tancaIntro());
  const tancada = await p.evaluate(() => document.getElementById('intro').hidden);
  await p.click('#btnAjuda');
  const r = await p.evaluate(() => ({
    oberta: !document.getElementById('intro').hidden,
    pas: window.__JOC.pas(),
    titol: document.getElementById('inT').textContent
  }));
  ok(primer, 'la primera vegada s\'obre sola');
  ok(tancada, 'i es pot tancar');
  ok(r.oberta && r.pas === 0, 'el botó «?» la torna a obrir pel principi');
  ok(!!r.titol, 'amb títol: «' + r.titol + '»');
  await ctx.close();
}

console.log('\n23 · La introducció no s\'inventa el contingut del joc');
{
  const { ctx, p } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC, out = [];
    for (let i = 0; i < J.INTRO.length; i++) { J.obreIntro(i); out.push(document.getElementById('inCos').textContent); }
    const tot = out.join(' ');
    return { tot, vilans: Object.keys(J.VILANS).map(k => J.VILANS[k].nom),
      nivells: J.NIVELLS.map(n => n.nom), accions: J.S.accions };
  });
  ok(r.vilans.every(v => r.tot.includes(v)),
    'els tres vilans surten amb el nom que tenen al joc: ' + r.vilans.join(', '));
  ok(r.nivells.every(n => r.tot.includes(n)),
    'i els quatre nivells amb el seu: ' + r.nivells.join(', '));
  ok(r.tot.includes('Comences amb ' + r.accions),
    'el nombre d\'accions surt de l\'estat, no d\'una frase escrita a mà');
  ok(/formació/.test(r.tot), 'i el darrer pas porta a la formació de veritat');
  await ctx.close();
}

console.log('\n══ El repte és la velocitat, no la dificultat de cada pas ══');

console.log('\n24 · Les hores no arriben soles: cauen, i la que no reculls es perd');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC, c = 'Alt Penedès', n = J.node(c);
    J.entra(c);
    const p2 = n.placa;
    /* Una fitxa caduca: si ningú la toca, no dona res. Al banc de temps de
       debò passa igual —una hora oferta que no agafa ningú es perd. */
    p2.caigudes = []; J.deixaFitxa(p2, 1, 1, 30);
    const horesAbans = n.hores;
    p2.caigudes[0].viu = 100;   // menys d'un tic de vida: al següent ja no hi és
    J.tic();
    const caducada = { fitxes: p2.caigudes.length, hores: n.hores };
    /* I una que sí que es recull. */
    J.deixaFitxa(p2, 2, 2, 30);
    const id = p2.caigudes[0].id;
    const guany = J.recull(id);
    const tornar = J.recull(id);   // no es pot recollir dues vegades
    /* La caiguda ambient hi és perquè qui encara no té banc de temps tingui
       sortida: sense això, un poble sense cap projecte queda encallat. */
    p2.caigudes = []; p2.cai = 0;
    for (let i = 0; i < 80; i++) J.tic();
    return { horesAbans, caducada, guany, tornar, ambient: p2.caigudes.length > 0,
      hores: n.hores };
  });
  ok(r.caducada.fitxes === 0 && r.caducada.hores === r.horesAbans,
    'la fitxa que no es toca desapareix i no dona res');
  ok(r.guany === 30, 'i la que es toca dona les hores que porta (' + r.guany + ')');
  ok(r.tornar === 0, 'una fitxa no es pot recollir dues vegades');
  ok(r.ambient, 'sempre acaba caient alguna cosa: sense banc de temps encara hi ha sortida');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n25 · L\'onada ve sola, i no fer-la esperar es paga');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC, c = 'Alt Penedès', n = J.node(c);
    J.entra(c);
    const p2 = n.placa;
    const esperaInici = p2.espera, onadaInici = p2.onada;
    /* Sense tocar cap botó, el compte enrere s'acaba i l'onada arrenca. */
    for (let i = 0; i < Math.ceil(J.ESPERA_PRIMERA / 120) + 2; i++) J.tic();
    const sola = { onada: p2.onada, corrent: p2.corrent };
    /* I la barra baixa mentre s'espera: el número és el que fa córrer. */
    p2.corrent = false; p2.vilans = []; p2.cua = []; p2.espera = 6000;
    const abansHores = n.hores;
    const guany = J.avancaOnada(c);
    return { esperaInici, onadaInici, sola, guany, hores: n.hores, abansHores,
      onadaFinal: p2.onada };
  });
  ok(r.esperaInici > 0 && r.onadaInici === 0, 'la plaça comença amb un compte enrere, no aturada');
  ok(r.sola.onada === 1 && r.sola.corrent,
    'i l\'onada arrenca sense prémer res: el temps corre encara que tu no facis res');
  ok(r.guany > 0 && r.hores === r.abansHores + r.guany,
    'avançar-la paga les hores que no has gastat esperant (+' + r.guany + ')');
  ok(r.onadaFinal === 2, 'i l\'onada següent comença de debò');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n26 · Cada pas és fàcil: una dinàmica, i una més per onada');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC, c = 'Alt Penedès', n = J.node(c);
    J.entra(c);
    /* El primer moviment ha de ser sempre possible: els dos primers que
       apareixen són els rols que demana la dinàmica que ja tens oberta. */
    const primera = J.DESBLOQUEIG[0];
    const primerMoviment = !J.motiuNo(c, primera);
    const obertes = J.desbloquejades(n).length;
    const tancada = J.planta(c, 0, 0, J.DESBLOQUEIG[3]);
    n.hores = 500;
    const posa = J.planta(c, 0, 0, primera);
    /* Acabada de plantar, no es pot repetir: s'està recarregant. */
    const recarrega = J.planta(c, 1, 1, primera);
    n.placa.rec[primera] = 0;
    /* I es pot treure el que has posat: un pas fàcil ha de ser reversible. */
    const treu = J.llevaPlanta(c, 0, 0);
    const tancaAlNode = !n.dins.includes(primera);
    /* Que l'onada ARRENQUI no obre res: la dinàmica nova ha d'arribar quan
       l'has guanyada, no quan te la venen a sobre. */
    J.comencaOnada(c);
    const durant = J.desbloquejades(n).length;
    n.placa.aguantades = 1;
    return { primerMoviment, obertes, tancada, posa, recarrega, treu, tancaAlNode, durant,
      despres: J.desbloquejades(n).length, total: J.DESBLOQUEIG.length,
      totes: J.DESBLOQUEIG.slice().sort().join() === Object.keys(J.DINS).sort().join() };
  });
  ok(r.primerMoviment, 'el primer moviment sempre és possible: els dos que hi ha porten els rols que cal');
  ok(r.obertes === 1, 'es comença amb UNA dinàmica oberta, no amb vuit targetes apagades');
  ok(!r.tancada.ok && /encara no/.test(r.tancada.per),
    'una que encara no saps portar es refusa i diu per què: «' + r.tancada.per + '»');
  ok(r.posa.ok && !r.recarrega.ok && /recarreg/.test(r.recarrega.per),
    'i acabada de plantar s\'està recarregant: el límit és el temps, no el saldo');
  ok(r.treu && r.tancaAlNode, 'treure-la de la plaça la tanca també al node: una sola comptabilitat');
  ok(r.durant === 1, 'començar una onada no obre res: la nova arriba per haver-la aguantada');
  ok(r.despres === 2, 'cada onada aguantada n\'obre una altra');
  ok(r.totes && r.total === 8, 'i l\'ordre les conté totes, sense inventar-ne ni perdre\'n cap');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n27 · Les caselles de bonus són aportacions a projectes del SOS');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const J = window.__JOC, c = 'Alt Penedès', n = J.node(c);
    J.entra(c); window.obreTot();
    const p2 = n.placa;
    const quantes = p2.valor.length;
    const dinsCatàleg = p2.valor.every(v => !!J.valorPer(v.proj));
    /* Plantar-hi és aportar-hi: queda registrat al node i el bonus és el que
       aquell projecte dona de debò. */
    n.hores = 900;
    p2.valor = [{ proj: 'banc_temps', f: 3, co: 0 }];
    const horesAbans = n.hores - 0;
    const posa = J.planta(c, 3, 0, 'banctemps');
    const apo = (n.aportacions || []).slice();
    const marcaConsumida = p2.valor.length === 0;
    /* Segona plantada al mateix lloc: la casella ja no hi és, no torna a pagar. */
    J.llevaPlanta(c, 3, 0);
    J.planta(c, 3, 0, 'banctemps');
    const apoDespres = (n.aportacions || []).length;
    /* Cada bonus declarat ha de fer alguna cosa. */
    const fan = J.VALOR.map(v => {
      const foto = () => JSON.stringify([n.hores, n.gent.length, p2.gratis, p2.veure, p2.salva,
        n.gent.filter(x => x.formada).length]);
      const abans = foto();
      p2.cel[0][0] = { d: 'banctemps', vida: 100, max: 100, parat: 0, tic: 0 };
      p2.salva = [false, false, false, false];
      J.aplicaBonus(c, v.proj, 0, 0);
      const cel = p2.cel[0][0];
      const despres = foto();
      return { proj: v.proj, canvia: despres !== abans || cel.max > 100 || !!cel.doble };
    });
    return { quantes, dinsCatàleg, posa, apo, marcaConsumida, apoDespres,
      fan, total: J.VALOR.length, compta: J.aportacions() >= apoDespres,
      calN2: !!J.NIVELLS.find(x => x.id === 'N2').cal.aportacions };
  });
  ok(r.quantes === 3 && r.dinsCatàleg, 'cada plaça neix amb tres caselles, i totes són del catàleg');
  ok(r.posa.ok && r.posa.valor === 'banc_temps' && r.apo.length === 1,
    'plantar-hi registra una aportació al node, amb el nom del projecte');
  ok(r.marcaConsumida && r.apoDespres === 1,
    'i la casella es consumeix: no és una font infinita de bonus');
  ok(r.fan.every(x => x.canvia), 'cada bonus declarat fa alguna cosa: ' +
    r.fan.filter(x => !x.canvia).map(x => x.proj).join(', '));
  ok(r.total === 8 && r.compta, 'les vuit aportacions compten a l\'escala del país');
  ok(r.calN2, 'i el nivell de Gestor/a en demana: és el criteri de la porta 2 de la MATRIU');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
