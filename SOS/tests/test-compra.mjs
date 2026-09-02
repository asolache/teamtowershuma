/* La Compra · que les xifres siguin defensables davant d'un pagès
   ──────────────────────────────────────────────────────────────
   Aquesta pàgina dona números de diners que algú farà servir per negociar. El
   que es prova aquí no és que «funcioni» sinó que el que diu se sostingui:

   · **El 80% es mesura en euros de despesa**, no en nombre d'articles. Comptant
     articles, una cistella amb vint espècies locals i el gruix dels diners en
     processats passaria la regla.
   · **La comanda arrodoneix cap amunt a formats sencers.** Un sac de 5 kg no es
     parteix, i el que sobra s'ha de veure.
   · **El sobrant de format no és una pèrdua.** És rebost pagat per avançat o
     fresc a repartir. Restar-lo de l'estalvi feia que comprar junts sortís
     negatiu, que és fals.
   · **Perseguir un tram pot ser una pèrdua.** Comprar 200 € de més per guanyar
     24 no és estalviar, i la pàgina ho ha de dir.
   · **Aquí no es cobra res.** Cap camp de targeta, cap cobrament confirmat. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'compra.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const prop = (a, b, t = 0.01) => Math.abs(a - b) < t;

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const nova = async (w = 1100, h = 900) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(APP);
  await p.waitForFunction(() => window.__COMPRA && window.__COMPRA.G.socis.length);
  return { ctx, p, errs };
};

console.log('\n1 · La cistella per defecte és una compra sencera, no una graella buida');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const C = window.__COMPRA;
    const c = C.cistellaPerDefecte(1);
    return { productes: C.PRODUCTES.length,
      ambQuantitat: C.PRODUCTES.filter(x => (c[x.id] || 0) > 0).length,
      cats: [...new Set(C.PRODUCTES.map(x => x.cat))].length,
      pct: C.despesa(c).pct, setmana: C.despesa(c).tot,
      socis: C.G.socis.length, pers: C.personesTotals() };
  });
  ok(r.ambQuantitat === r.productes && r.productes > 25,
    `els ${r.productes} productes venen amb quantitat: qui entra veu una compra, no una llista per omplir`);
  ok(r.cats >= 6, `i cobreix ${r.cats} categories, no només rebost sec`);
  ok(r.pct >= 80, `la cistella per defecte arriba al ${Math.round(r.pct * 10) / 10}% de proximitat, bàsic i sa`);
  ok(r.setmana > 15 && r.setmana < 35,
    `i la despesa per persona i setmana és creïble: ${Math.round(r.setmana * 100) / 100} €`);
  ok(r.socis === 12 && r.pers === 30, `amb un grup d'exemple de ${r.socis} llars i ${r.pers} persones`);
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n2 · El 80% es mesura en euros, no en nombre d\'articles');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const C = window.__COMPRA;
    /* Una cistella amb MOLTS articles que compleixen les tres condicions però
       de calderilla, i un de sol que no compleix i s'emporta els diners.
       Comptant articles passaria de llarg; comptant euros, no. */
    const bons = C.PRODUCTES.filter(x => C.compta(x)).slice(0, 8);
    const car = C.PRODUCTES.filter(x => !C.compta(x)).sort((a, b) => b.grup - a.grup)[0];
    const c = {};
    bons.forEach(x => { c[x.id] = 0.01; });
    c[car.id] = 5;
    const d = C.despesa(c);
    const nArticles = bons.length, total = nArticles + 1;
    return { pct: d.pct, perArticles: nArticles * 100 / total, car: car.nom,
      motiu: C.perQueNo(car), primer: C.desequilibri(c)[0].p.id, carId: car.id };
  });
  ok(r.perArticles >= 80, `comptant articles la cistella passaria: ${Math.round(r.perArticles)}%`);
  ok(r.pct < 80, `comptant euros no hi arriba: ${Math.round(r.pct * 10) / 10}% — és la mesura bona`);
  ok(r.primer === r.carId, `i el que la desequilibra s'assenyala pel nom: ${r.car}`);
  ok(!!r.motiu, `dient per què no compta: «${r.motiu}»`);
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n3 · La comanda: formats sencers, i el ritme de cada pagès');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const C = window.__COMPRA;
    const out = [];
    Object.keys(C.PRODUCTORS).forEach(id => {
      const c = C.comandaDe(id);
      out.push({ id, cada: c.pr.cada, enc: c.encarregat, dem: c.demanat, falta: c.falta,
        sencers: c.linies.every(l => Math.abs(l.compra / l.p.format - Math.round(l.compra / l.p.format)) < 1e-9),
        cobreix: c.linies.every(l => l.compra >= l.cal - 1e-9),
        sobra: c.linies.every(l => Math.abs(l.sobra - (l.compra - l.cal)) < 0.011) });
    });
    /* El ritme importa: el mateix producte demanat cada setmana o cada mes no
       arriba al mateix subtotal. Sec = mensual, i per això arriba al mínim. */
    const sec = C.comandaDe('secans'), fresc = C.comandaDe('horta');
    return { out, secCada: sec.pr.cada, frescCada: fresc.pr.cada,
      secSetmanes: C.CICLES[sec.pr.cada].setmanes };
  });
  ok(r.out.every(x => x.sencers), 'tot s\'encarrega en formats sencers: un sac de 5 kg no es parteix');
  ok(r.out.every(x => x.cobreix), 'i mai per sota del que cal: s\'arrodoneix cap amunt, no cap avall');
  ok(r.out.every(x => x.sobra), 'el sobrant de cada línia és exactament el que es compra de més');
  ok(r.out.every(x => x.enc >= x.dem - 0.01), 'l\'encarregat mai és menys que el demanat');
  ok(r.secCada === 'mes' && r.frescCada === 'setmana' && r.secSetmanes > 4,
    'el sec va mensual i el fresc setmanal: agrupar en el temps també és agregar volum');
  ok(r.out.every(x => x.falta === 0), 'i amb el grup d\'exemple tots els productors arriben al seu mínim');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n4 · El mínim de comanda és el que trenca els grups');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const C = window.__COMPRA;
    /* Un grup d'una sola llar d'una persona: no arriba enlloc, i la pàgina ho
       ha de dir amb la xifra que falta, no amb un silenci. */
    C.G.socis.length = 0;
    C.nouSoci('Llar sola', 1);
    const curts = Object.keys(C.PRODUCTORS).map(id => {
      const c = C.comandaDe(id);
      return { id, falta: c.falta, minim: c.pr.minim, enc: c.encarregat };
    });
    return { curts, quants: curts.filter(x => x.falta > 0).length,
      exacte: curts.every(x => x.falta === 0 || Math.abs(x.falta - (x.minim - x.enc)) < 0.01) };
  });
  ok(r.quants > 0, `amb una sola llar, ${r.quants} productors es queden per sota del mínim`);
  ok(r.exacte, 'i el que falta és exactament el mínim menys l\'encarregat: una xifra, no un avís genèric');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n5 · Els trams: s\'apliquen al llindar, i perseguir-los pot ser una pèrdua');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const C = window.__COMPRA;
    const t = C.TRAMS.map(x => x.des);
    const abans = C.tramDe(t[1] - 0.01), just = C.tramDe(t[1]), amunt = C.tramDe(t[2]);
    /* El cas que ho ensenya tot: la granja és a tocar del tram i val la pena;
       l'horta n'és lluny i perseguir-lo seria comprar el que no necessites. */
    const g = C.comandaDe('granja'), h = C.comandaDe('horta');
    return { abans, just, amunt, dte1: C.TRAMS[1].dte,
      g: g.seguent && { extra: g.seguent.extra, guany: g.seguent.guany, val: C.valLaPena(g.seguent) },
      h: h.seguent && { extra: h.seguent.extra, guany: h.seguent.guany, val: C.valLaPena(h.seguent) },
      /* i el descompte és exactament el % sobre l'encarregat */
      exacte: Math.abs(g.volum - g.encarregat * g.dte / 100) < 0.01 };
  });
  ok(r.abans === 0 && r.just === r.dte1, `el tram salta al llindar i no abans (0% → ${r.just}%)`);
  ok(r.amunt > r.just, 'i el següent puja més amunt');
  ok(r.exacte, 'el descompte és el percentatge sobre el que s\'encarrega, no sobre el que es demana');
  ok(r.g && r.g.val && r.g.extra < r.g.guany,
    `a tocar del tram, surt a compte: ${Math.round(r.g.extra * 100) / 100} € de més per guanyar-ne ${Math.round(r.g.guany * 100) / 100}`);
  ok(r.h && !r.h.val && r.h.extra > r.h.guany,
    `i lluny, no: ${Math.round(r.h.extra * 100) / 100} € de més per guanyar-ne ${Math.round(r.h.guany * 100) / 100} — comprar de més no és estalviar`);
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n6 · L\'estalvi, dit per la seva causa — i el sobrant no és una pèrdua');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const C = window.__COMPRA;
    const e = C.estalvi();
    return { botiga: e.botiga, grup: e.grup, estr: e.estructural, vol: e.volum,
      net: e.net, pct: e.pct, pctVol: e.pctVolum, av: e.avancat, ex: e.excedent,
      suma: Math.abs(e.net - (e.estructural + e.volum)) < 0.01,
      estrOk: Math.abs(e.estructural - (e.botiga - e.grup)) < 0.01,
      fonts: [...new Set(C.PRODUCTES.map(x => x.font))],
      totesAmbFont: C.PRODUCTES.every(x => !!C.FONTS[x.font]) };
  });
  ok(r.net > 0 && r.pct > 5, `comprar junts surt a compte: ${Math.round(r.net)} € al mes, un ${Math.round(r.pct * 10) / 10}%`);
  ok(r.suma, 'el net és estructural + volum, i res més');
  ok(r.estrOk, 'i l\'estructural és exactament la botiga menys el preu de grup');
  ok(r.av > 0 || r.ex > 0, `el sobrant de format es diu a part: ${Math.round(r.av)} € avançats i ${Math.round(r.ex)} € de fresc a repartir`);
  ok(!r.suma || (r.net > 0 && r.net === r.estr + r.vol),
    'i NO es resta del net: restar-lo feia que comprar junts sortís negatiu, que és fals');
  ok(r.pctVol < 50, `el volum només és el ${Math.round(r.pctVol * 10) / 10}% de l'estalvi: el gruix és com es compra, no quant`);
  ok(r.fonts.length >= 3 && r.totesAmbFont,
    `cada preu té la seva causa declarada (${r.fonts.join(', ')}): un preu més baix sense causa és una promesa`);
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n7 · Els socis: llista pròpia, i els totals quadren amb el del grup');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const C = window.__COMPRA;
    const e = C.estalvi(), s = C.perSoci();
    const sumaGrup = s.files.reduce((t, f) => t + f.grup, 0);
    const sumaVol = s.files.reduce((t, f) => t + f.volum, 0);
    C.G.repartiment = 'igual';
    const igual = C.perSoci();
    const sumaIgual = igual.files.reduce((t, f) => t + f.volum, 0);
    const totsIguals = igual.files.every(f => Math.abs(f.volum - igual.files[0].volum) < 0.01);
    C.G.repartiment = 'prop';
    const prop = C.perSoci().files;
    const gran = prop.slice().sort((a, b) => b.grup - a.grup)[0];
    const petit = prop.slice().sort((a, b) => a.grup - b.grup)[0];
    const abans = C.G.socis.length;
    C.nouSoci('Llar nova', 3);
    const creix = C.personesTotals();
    return { sumaGrup, grup: e.grup, sumaVol, vol: e.volum, sumaIgual, totsIguals,
      propOrdenat: gran.volum > petit.volum, abans, despres: C.G.socis.length, creix,
      duplicat: C.nouSoci('Llar nova', 2).err || '' };
  });
  ok(prop(r.sumaGrup, r.grup, 0.05), 'la suma del que paga cada llar és el total del grup');
  ok(prop(r.sumaVol, r.vol, 0.05) && prop(r.sumaIgual, r.vol, 0.05),
    'i les dues regles de repartiment reparteixen el mateix descompte, ni més ni menys');
  ok(r.totsIguals, 'a parts iguals, totes les llars s\'emporten el mateix');
  ok(r.propOrdenat, 'i proporcional, qui més demana més se n\'emporta');
  ok(r.despres === r.abans + 1, 'es pot donar d\'alta una llar nova');
  ok(/Ja hi ha/.test(r.duplicat), `i no dues amb el mateix nom: «${r.duplicat}»`);
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n8 · Aquí no es cobra res, i el que escrius no surt d\'aquest dispositiu');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const camps = [...document.querySelectorAll('input,select,textarea')].map(e =>
      (e.name || '') + ' ' + (e.id || '') + ' ' + (e.placeholder || '') + ' ' + (e.type || ''));
    return { camps,
      pagament: camps.filter(c => /targeta|tarjeta|iban|cvv|caducitat/i.test(c)).length,
      diu: document.body.textContent.includes('Aquí no es cobra res'),
      cobrat: /(s'ha cobrat|s'ha pagat|pagament confirmat)/i.test(document.body.textContent),
      clau: window.__COMPRA.CLAU };
  });
  ok(r.pagament === 0, `cap dels ${r.camps.length} camps demana dades de pagament`);
  ok(r.diu, 'i la pàgina ho diu on es veu, no en un peu de pàgina');
  ok(!r.cobrat, 'enlloc es diu que s\'hagi cobrat o pagat res');
  // Sobreviu a recarregar, i sense servidor.
  await p.evaluate(() => { window.__COMPRA.nouSoci('Llar de prova', 4); });
  await p.reload();
  await p.waitForFunction(() => window.__COMPRA && window.__COMPRA.G.socis.length);
  const r2 = await p.evaluate(() => ({
    hi: window.__COMPRA.G.socis.some(s => s.nom === 'Llar de prova'),
    quantes: window.__COMPRA.G.socis.length }));
  ok(r2.hi, `el grup sobreviu a recarregar (${r2.quantes} llars), i viu a localStorage['${r.clau}']`);
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n9 · Les dues dinàmiques del catàleg, i la pàgina que es pinta');
{
  const { ctx, p, errs } = await nova(390, 844);
  const r = await p.evaluate(() => {
    const C = window.__COMPRA, txt = document.body.textContent;
    const pans = [...document.querySelectorAll('.pan')].map(x => x.id);
    return { dins: C.DINAMIQUES.map(d => d.nom), txt,
      pans, tabs: document.querySelectorAll('#tabs button').length,
      data: C.PREUS_REVISIO,
      files: document.querySelectorAll('#tCistella tbody tr').length,
      ample: document.documentElement.scrollWidth <= window.innerWidth + 1 };
  });
  ok(r.dins.every(n => r.txt.includes(n)),
    'les dues dinàmiques surten pel seu nom: ' + r.dins.join(' i '));
  ok(r.txt.includes(r.data), `i els preus diuen quan es van revisar: ${r.data}`);
  /* Cada pestanya ha de tenir la seva pantalla i cap pantalla ha de quedar
     sense pestanya: una pantalla òrfena és feina feta que no veurà ningú. */
  ok(r.tabs === 7 && r.pans.length === 7, `${r.tabs} pantalles, ${r.tabs} pestanyes`);
  ok(r.files > 30, `la taula de la cistella es pinta sencera (${r.files} files)`);
  ok(r.ample, 'i a 390px la pàgina no desborda de costat');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n10 · Connecta amb els dos tipus de projecte, amb el seu mapa de valor');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const C = window.__COMPRA;
    const ids = C.DINAMIQUES.map(d => d.id);
    const teMapa = ids.every(i => !!C.MAPA[i]);
    const camps = ids.every(i => ['mission', 'vision', 'objectives', 'gov', 'roles', 'pairs', 'kanban']
      .every(k => !!C.MAPA[i][k] && C.MAPA[i][k].length));
    /* Cada parella ha de donar lliurament als DOS sentits: un intercanvi amb
       una sola direcció no és un intercanvi, és una extracció. */
    const reciproc = ids.every(i => {
      const ll = C.lliuraments(i);
      return ll.length === C.MAPA[i].pairs.length * 2 &&
        C.MAPA[i].pairs.every(([a, b]) =>
          ll.some(x => x.de === a && x.a === b) && ll.some(x => x.de === b && x.a === a));
    });
    const menes = ids.flatMap(i => C.lliuraments(i).map(x => x.mena));
    /* El que la pàgina diu produir ha de ser un lliurament del mapa. */
    const totsLl = new Set(ids.flatMap(i => C.lliuraments(i).map(x => x.que)));
    const faReals = Object.keys(C.FA).every(k => totsLl.has(k));
    const rolsReals = Object.keys(C.OMPLE).every(r => ids.some(i => C.MAPA[i].roles.includes(r)));
    return { teMapa, camps, reciproc, faReals, rolsReals,
      ll: ids.reduce((t, i) => t + C.lliuraments(i).length, 0),
      fets: ids.reduce((t, i) => t + C.analisi(i).fets.length, 0),
      tangibles: menes.filter(m => m === 'tangible').length,
      intangibles: menes.filter(m => m === 'intangible').length,
      rols: ids.reduce((t, i) => t + C.MAPA[i].roles.length, 0) };
  });
  ok(r.teMapa && r.camps,
    'les dues dinàmiques porten missió, visió, objectius, rols, intercanvis, passos i governança');
  ok(r.reciproc, `els ${r.ll} lliuraments van als dos sentits: cap intercanvi és d'una sola direcció`);
  ok(r.tangibles > 0 && r.intangibles > 0,
    `i hi ha les dues menes de valor: ${r.tangibles} que es veuen i ${r.intangibles} que no`);
  ok(r.fets > 0 && r.fets < r.ll,
    `la pàgina produeix ${r.fets} dels ${r.ll} lliuraments — ni cap ni tots: la resta la fa la gent`);
  ok(r.faReals, 'i tot el que diu produir és un lliurament que existeix al mapa');
  ok(r.rolsReals, `els rols que diu omplir són rols del mapa (${r.rols} en total)`);
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n11 · El mapa diu qui l\'omple, qui posa més del que rep i qui falta');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const C = window.__COMPRA, din = 'consum_agroecologic';
    const a0 = C.analisi(din);
    const soci = a0.rols.find(x => x.rol === 'Unitats familiars');
    const buit = a0.rols.find(x => !x.ple);
    /* Posar-hi nom ha de fer viure els fluxos que hi toquen: el mapa es fa
       del grup, no es queda de mostra. */
    C.posaRol(din, buit.rol, 'La Nau del carrer Major');
    const a1 = C.analisi(din);
    const ara = a1.rols.find(x => x.rol === buit.rol);
    C.posaRol(din, buit.rol, '');
    const a2 = C.analisi(din);
    return { sociApp: soci.qui.app, sociTxt: soci.qui.txt,
      buit: buit.rol, buitsAbans: a0.buits.length, buitsDespres: a1.buits.length,
      viusAbans: a0.vius.length, viusDespres: a1.vius.length, total: a0.ll.length,
      omplert: ara.ple, tornaBuit: a2.buits.length === a0.buits.length,
      exposats: a0.rols.filter(x => x.exposat).map(x => x.rol),
      intangibles: a0.rols.filter(x => x.totIntangible).map(x => x.rol),
      saldos: a0.rols.map(x => x.rol + ':' + x.saldoT) };
  });
  ok(r.sociApp && /llars/.test(r.sociTxt),
    `els rols que omple la pàgina ho diuen amb la xifra de debò: «${r.sociTxt}»`);
  ok(r.buitsAbans > 0, `i els que no, es diuen buits (${r.buitsAbans}) en comptes de fer com si res`);
  ok(r.omplert && r.buitsDespres === r.buitsAbans - 1,
    `posar nom a «${r.buit}» l'omple: el mapa es fa del grup`);
  ok(r.viusDespres > r.viusAbans,
    `i fa viure fluxos que abans no ho estaven (${r.viusAbans} → ${r.viusDespres} de ${r.total})`);
  ok(r.tornaBuit, 'esborrar el nom el torna a deixar buit: no s\'inventa ningú');
  ok(r.exposats.length > 0,
    `assenyala qui posa més del que es veu que no rep: ${r.exposats.join(', ')} — és qui es crema`);
  ok(r.intangibles.length > 0,
    `i qui es mou només amb el que no es veu: ${r.intangibles.join(', ')}`);
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n12 · I el mapa es pinta, amb el graf i les taules');
{
  const { ctx, p, errs } = await nova(390, 844);
  await p.click('#tabs button[data-p=mapa]');
  const r = await p.evaluate(() => {
    const C = window.__COMPRA;
    const txt = document.getElementById('pMapa').textContent;
    return { grafs: document.querySelectorAll('#mapes .graf').length,
      seccions: document.querySelectorAll('#mapes section').length,
      inputs: document.querySelectorAll('#mapes [data-rol]').length,
      mission: C.MAPA.consum_agroecologic.mission,
      pas: C.MAPA.compra_collectiva.kanban[0],
      lliurament: C.MAPA.consum_agroecologic.pairs[0][3],
      txt, ample: document.documentElement.scrollWidth <= window.innerWidth + 1 };
  });
  ok(r.seccions === 2 && r.grafs === 2, 'una secció i un graf per dinàmica');
  ok(r.txt.includes(r.mission) && r.txt.includes(r.pas) && r.txt.includes(r.lliurament),
    'i s\'hi llegeix la missió, els passos i els lliuraments, no només un dibuix');
  ok(r.inputs > 0, `amb ${r.inputs} rols on el grup pot posar qui ho fa`);
  ok(r.ample, 'i a 390px tampoc desborda');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n13 · El perfil: proposa un rol, no l\'assigna');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const C = window.__COMPRA, din = 'consum_agroecologic';
    C.desaPerfil([]);
    const buit = C.encaixos(din)[0];
    /* Amb perfil buit, cap rol pot puntuar: proposar-ne un seria inventar. */
    const capPunt = C.encaixos(din).every(x => x.punts === 0);
    C.desaPerfil(['espai', 'temps']);
    const ll = C.encaixos(din);
    const top = ll[0];
    /* El primer ha de ser un que cobreixi tot el que demana, si n'hi ha cap. */
    const plens = ll.filter(x => !x.falten.length);
    return { capPunt, top: top.rol, punts: top.punts, falten: top.falten.length,
      per: top.per, cal: top.cal, te: top.te,
      ordenat: ll.every((x, i) => i === 0 || ll[i - 1].punts >= x.punts),
      primerPle: plens.length ? plens[0].rol === top.rol : true,
      /* i el motiu ha de ser un lliurament que aquell rol fa de debò */
      citaReal: C.lliuraments(din).some(l => l.de === top.rol && l.que === top.per) };
  });
  ok(r.capPunt, 'sense perfil, cap rol puntua: proposar-ne un seria inventar');
  ok(r.top && r.falten === 0 && r.primerPle,
    `amb espai i temps proposa «${r.top}» (${r.punts}), que és el que cobreix del tot`);
  ok(r.ordenat, 'i la llista va de més a menys encaix, no per l\'ordre del mapa');
  ok(r.citaReal, `el motiu és un lliurament que aquell rol fa de debò: «${r.per}»`);
  ok(r.cal.length > 0 && r.te.length > 0, 'i diu què demana i què hi poses tu');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n14 · Agafar un rol l\'omple al mapa i fa viure els seus fluxos');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const C = window.__COMPRA, din = 'consum_agroecologic';
    C.desaPerfil(['espai', 'temps']);
    const a0 = C.analisi(din), rol = C.encaixos(din)[0].rol;
    C.agafaRol(din, rol);
    const a1 = C.analisi(din);
    const meu = C.elMeu(din);
    /* Agafar-ne un altre allibera el primer: no es poden tenir dos rols alhora
       fent veure que hi ha dues persones. */
    const altre = C.MAPA[din].roles.find(x => x !== rol && !C.OMPLE[x]);
    C.agafaRol(din, altre);
    const dos = C.MAPA[din].roles.filter(x => (C.G.rols[din] || {})[x] === C.MEU).length;
    C.agafaRol(din, altre);   // tornar-lo a prémer el deixa
    return { rol, meu, dos, deixat: C.elMeu(din),
      viusAbans: a0.vius.length, viusDespres: a1.vius.length,
      buitsAbans: a0.buits.length, buitsDespres: a1.buits.length };
  });
  ok(r.meu === r.rol, `agafar «${r.rol}» l'omple al mapa`);
  ok(r.buitsDespres === r.buitsAbans - 1 && r.viusDespres > r.viusAbans,
    `i els seus fluxos passen a viure (${r.viusAbans} → ${r.viusDespres})`);
  ok(r.dos === 1, 'agafar-ne un altre allibera el primer: no es fan dues persones d\'una');
  ok(r.deixat === null, 'i tornar a prémer el deixa: no és una condemna');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n15 · El perfil es declara un cop i val a tots els mapes');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const C = window.__COMPRA;
    C.desaPerfil(['ordre', 'numeros', 'contactes']);
    return { clau: C.PERFIL_CLAU, cru: localStorage.getItem(C.PERFIL_CLAU),
      aports: C.APORTS.length,
      /* El que es demana són capacitats i prou: cap camp d'identitat. */
      camps: C.APORTS.map(a => a.id),
      pesos: C.PES };
  });
  /* La mateixa clau, llegida des de l'altra pàgina amb mapa. */
  await p.goto(APP.replace('compra.html', 'vna.html'));
  await p.waitForFunction(() => window.__VNA);
  const v = await p.evaluate(() => {
    const V = window.__VNA;
    return { clau: V.PERFIL_CLAU, perfil: V.llegeixPerfil(),
      aports: V.APORTS.map(a => a.id), pesos: V.PES,
      top: V.encaixos()[0].curt, punts: V.encaixos()[0].punts };
  });
  ok(v.clau === r.clau, `les dues pàgines desen el perfil a la mateixa clau: «${r.clau}»`);
  ok(v.perfil.join() === 'ordre,numeros,contactes',
    'i el perfil declarat a La Compra ja el porta posat el mapa de la colla');
  ok(v.aports.join() === r.camps.join() && v.aports.length === 10,
    `el mateix vocabulari de ${v.aports.length} capacitats a totes dues`);
  ok(JSON.stringify(v.pesos) === JSON.stringify(r.pesos), 'i els mateixos pesos de puntuació');
  ok(!r.camps.some(c => /nom|correu|edat|dni|telefon/i.test(c)),
    'cap capacitat és una dada d\'identitat: es demana què pots posar, no qui ets');
  ok(!!v.top, `i la colla li proposa «${v.top}» (${v.punts})`);
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

/* ── La caixa ─────────────────────────────────────────────────────────────
   És la part que trenca els grups de consum, i és la part on una pàgina té més
   ganes de mentir: d'apuntar qui deu quant a dir que algú ha pagat només hi ha
   una paraula. El que es prova és que els números quadrin al cèntim i que la
   pàgina no digui mai el que no pot saber. */
console.log('\n9 · Fins que la comanda no es tanca, no deu res ningú');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const C = window.__COMPRA, G = C.estat();
    const abans = C.caixaGrup();
    const cap = G.socis.map(s => C.compteDe(s.id).carregat);
    const prev = C.repartComanda();
    return { comandes: abans.comandes, carregat: abans.carregat,
      cap: cap.filter(x => x !== 0).length,
      previst: prev.total, llars: G.socis.length };
  });
  ok(r.comandes === 0 && r.carregat === 0,
    'sense cap comanda tancada, la caixa és a zero');
  ok(r.cap === 0, 'i cap de les 12 llars té res carregat, encara que la comanda ja estigui calculada');
  ok(r.previst > 0, `el càlcul hi és igualment: la comanda d'ara valdria ${r.previst} €`);
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n10 · Tancada, el que deu cada llar suma el total exacte');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const C = window.__COMPRA;
    const t = C.tancaComanda();
    const G = C.estat();
    const parts = G.socis.map(s => C.compteDe(s.id).carregat);
    const suma = Math.round(parts.reduce((a, x) => a + x, 0) * 100) / 100;
    /* El que el grup posa a cada productor és el que encarrega menys el tram:
       si la suma dels productors no fos el total, la caixa demanaria diners
       que ningú deu a ningú. */
    const prod = Math.round(t.comanda.perProductor.reduce((a, x) => a + x.paga, 0) * 100) / 100;
    return { total: t.comanda.total, suma, prod, parts: parts.length,
      zero: parts.filter(x => x <= 0).length, resta: t.comanda.resta,
      quan: t.comanda.quan, id: t.comanda.id };
  });
  ok(r.suma === r.total,
    `la suma del que deu cada llar és el total de la comanda, al cèntim: ${r.suma} = ${r.total} €`);
  ok(r.prod === r.total, `i el total és el que es posa a cada productor: ${r.prod} €`);
  ok(r.zero === 0, 'cap llar surt a zero: totes han demanat alguna cosa i totes hi posen');
  ok(Math.abs(r.resta) <= 0.05,
    `l'arrodoniment que sobra és d'un cèntim o dos (${r.resta} €) i va a la llar que més hi posa, ` +
    'no es perd');
  ok(/^\d{4}-\d{2}-\d{2}$/.test(r.quan), `i queda amb data: ${r.quan}`);
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n11 · Posar diners baixa el saldo d\'aquella llar i de ningú més');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const C = window.__COMPRA;
    C.tancaComanda();
    const G = C.estat(), un = G.socis[0], altre = G.socis[1];
    const a0 = C.compteDe(un.id), b0 = C.compteDe(altre.id);
    const mov = C.posaACaixa(un.id, 50, 'transferència');
    const a1 = C.compteDe(un.id), b1 = C.compteDe(altre.id);
    const treta = C.treuMoviment(mov.mov.id);
    const a2 = C.compteDe(un.id);
    const errAltre = C.posaACaixa('no-existeix', 10).err;
    const errZero = C.posaACaixa(un.id, 0).err;
    return { a0: a0.saldo, a1: a1.saldo, a2: a2.saldo, b0: b0.saldo, b1: b1.saldo,
      posat: a1.posat, treta, camps: Object.keys(mov.mov).join(','),
      blanca: C.MOVIMENT_CAMPS.join(','), errAltre, errZero };
  });
  ok(Math.abs(r.a0 - r.a1 - 50) < 0.005,
    `posar 50 € baixa el saldo d'aquella llar de ${r.a0} a ${r.a1}`);
  ok(r.b0 === r.b1, 'i no toca el de cap altra: ' + r.b1 + ' abans i després');
  ok(r.a2 === r.a0 && r.treta, 'treure el moviment ho desfà exacte: apuntar-se malament es pot corregir');
  ok(r.camps === r.blanca,
    `el moviment desa exactament els camps declarats (${r.camps}) i cap més`);
  ok(!/persona|titular|nom|iban|targeta/i.test(r.camps),
    'i cap és el nom d\'una persona: els comptes són per llar, com tota la pàgina');
  ok(!!r.errAltre && !!r.errZero,
    `no s'apunta res a una llar que no hi és («${r.errAltre}») ni per zero euros («${r.errZero}»)`);
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n12 · La caixa del grup quadra, i el que no quadra es diu pel seu nom');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const C = window.__COMPRA;
    C.tancaComanda();
    const G = C.estat();
    /* Dues llars hi posen: una just el que li toca i una altra de més. */
    const un = G.socis[0], altre = G.socis[1];
    C.posaACaixa(un.id, C.compteDe(un.id).carregat);
    C.posaACaixa(altre.id, C.compteDe(altre.id).carregat + 20);
    const k = C.caixaGrup();
    const sumaSaldos = Math.round(k.comptes.reduce((a, c) => a + c.saldo, 0) * 100) / 100;
    /* I el forat que s'ha de dir: donar de baixa una llar carregada deixa un
       càrrec que ja no és de ningú. */
    C.treuSoci(G.socis[2].id);
    const k2 = C.caixaGrup();
    return { carregat: k.carregat, posat: k.posat, dif: k.diferencia, sumaSaldos,
      deuen: k.deuen.length, favor: k.favor.length, orfe0: k.orfe,
      orfe: k2.orfe, llars: k2.comptes.length,
      quadra2: Math.round((k2.comptes.reduce((a, c) => a + c.carregat, 0) + k2.orfe) * 100) / 100 };
  });
  ok(Math.abs(r.carregat - r.posat - r.dif) < 0.005,
    `carregat ${r.carregat} − declarat ${r.posat} = ${r.dif} €`);
  ok(Math.abs(r.dif - r.sumaSaldos) < 0.02,
    'i la diferència és exactament la suma dels saldos de les llars: no hi ha diners a cap racó');
  ok(r.deuen === 10 && r.favor === 1,
    `${r.deuen} llars encara no hi han posat res i ${r.favor} hi té a favor — totes dues coses dites`);
  ok(r.orfe0 === 0, 'mentre hi són totes les llars, no hi ha cap càrrec orfe');
  ok(r.orfe > 0 && r.llars === 11,
    `donar de baixa una llar carregada deixa ${r.orfe} € que ja no són de ningú, i es compten a part`);
  ok(Math.abs(r.quadra2 - r.carregat) < 0.005,
    'sumant l\'orfe torna a quadrar amb el total: el forat es diu, no s\'amaga');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n13 · A la pantalla: es tanca, es desa i no es diu mai que ningú hagi pagat');
{
  const { ctx, p, errs } = await nova();
  await p.click('#tabs button[data-p="caixa"]');
  const r = await p.evaluate(async () => {
    const C = window.__COMPRA;
    const visible = !!document.querySelector('#pCaixa.on');
    document.querySelector('#btnTanca').click();
    const G = C.estat();
    const un = G.socis[0];
    document.querySelector('#movSoci').value = un.id;
    document.querySelector('#movEur').value = '25';
    document.querySelector('#btnMov').click();
    const txt = document.querySelector('#pCaixa').textContent.replace(/\s+/g, ' ');
    /* Es desa: rellegint el que hi ha al navegador ha de sortir el mateix. */
    const desat = JSON.parse(localStorage.getItem(C.CLAU) || '{}');
    return { visible, txt, comandes: (desat.comandes || []).length,
      caixa: (desat.caixa || []).length,
      camps: Object.keys((desat.caixa || [])[0] || {}).join(','),
      files: document.querySelectorAll('#tComptes tbody tr').length,
      movs: document.querySelectorAll('#movs [data-treu]').length };
  });
  ok(r.visible, 'la pestanya «6 · La caixa» obre la seva pantalla');
  ok(r.comandes === 1 && r.caixa === 1,
    'tancar i apuntar es desa al navegador: en tornar-hi demà, els comptes hi són');
  ok(r.camps === 'id,soci,eur,quan,nota',
    `i el que es desa de cada moviment són els camps declarats: ${r.camps}`);
  ok(r.files >= 13 && r.movs === 1, `${r.files - 1} llars a la taula de comptes i ${r.movs} moviment amb el seu botó de treure`);
  ok(/no és un rebut/i.test(r.txt), 'la pantalla diu que això no és un rebut i no prova res');
  ok(/ja se n'ha tancat una pel mateix import/.test(r.txt),
    'i avisa abans de tancar-ne una segona igual el mateix dia: carregar-ho tot dos cops és ' +
    'l\'error més fàcil i el més car');
  ok(!/pag(at|ats|ada|ades|ament|aments|ar)\b/i.test(r.txt),
    'i enlloc de la caixa hi surt la paraula «pagat»: aquí es posa i es declara');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
