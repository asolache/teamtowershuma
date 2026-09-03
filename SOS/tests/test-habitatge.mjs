/* L'Habitatge en cessió d'ús · l'entrada, la quota i la sortida
   ─────────────────────────────────────────────────────────────────────────
   El que trenca un projecte d'habitatge cooperatiu no és el preu del metre
   quadrat: és que **l'aportació d'entrada i la quota mensual són la mateixa
   palanca**. Baixar-ne una puja l'altra, i cadascuna deixa fora gent diferent
   —qui no té estalvis o qui no té ingressos.

   Aquí es prova el model, no el text: que les quotes sumin el que costa
   l'edifici al cèntim, que la porta del 20% s'apliqui, que el recorregut de
   l'aportació tingui de debò la forma que la pàgina diu que té, i que qui marxa
   cobri el nominal —que és el que fa que això no sigui especulació. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const F = p => 'file://' + join(DIR, p);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const ctx = await b.newContext({ viewport: { width: 1100, height: 900 } });
const page = await ctx.newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(F('habitatge.html'));
await page.waitForTimeout(300);

console.log('\n1 · El cost i el repartiment: la suma de les quotes és el que costa l\'edifici');
{
  const r = await page.evaluate(() => {
    const H = window.__HABITATGE, G = H.estat();
    const rep = H.repartiment();
    const igual = H.repartiment(null, 'igual');
    return { llars: G.llars.length,
      m2p: H.m2Privats(), m2t: H.m2Totals(), comuns: G.comuns,
      cost: H.costTotal(), perLlar: H.costTotal() / G.llars.length,
      suma: H.sumaCoef(),
      totQuota: rep.tot.quota, grup: H.quotaGrup(),
      quotes: rep.files.map(f => f.quota),
      m2: rep.files.map(f => f.l.m2),
      igualQuotes: igual.files.map(f => Math.round(f.quota * 100) / 100),
      sumaIgual: H.sumaCoef('igual'), base: H.BASE };
  });
  ok(r.llars === 12, `el grup de mostra té ${r.llars} llars`);
  ok(Math.abs(r.m2t - r.m2p * (1 + r.comuns / 100)) < 0.01,
    `els comuns hi afegeixen un ${r.comuns}%: ${Math.round(r.m2p)} m² privats → ${Math.round(r.m2t)} construïts`);
  ok(r.suma === r.base && r.sumaIgual === r.base,
    'les parts sumen ' + r.base.toLocaleString('ca') + ' milionèsimes exactes amb els dos repartiments — en decimals no hi arribarien mai');
  ok(Math.abs(r.totQuota - r.grup) < 0.005,
    `i la suma de les quotes és el que costa el grup al cèntim: ${r.totQuota.toFixed(2)} €`);
  /* La comprovació que fa que el repartiment per m² vulgui dir el que diu. */
  const parells = r.quotes.map((q, i) => [r.m2[i], q]).sort((a, b2) => a[0] - b2[0]);
  ok(parells.every((p, i) => i === 0 || p[1] >= parells[i - 1][1] - 0.01),
    'repartint per m², qui té més metres paga més: la columna és monòtona');
  ok(Math.max(...r.igualQuotes) - Math.min(...r.igualQuotes) < 0.01,
    `i a parts iguals tothom paga el mateix (${r.igualQuotes[0]} €) fins al cèntim, que és una altra ` +
    'decisió i no la mateixa');
  ok(r.perLlar > 80000 && r.perLlar < 160000,
    `el cost per habitatge surt a ${Math.round(r.perLlar).toLocaleString('ca')} €, ` +
    'a l\'ordre de magnitud dels projectes en marxa');
}

console.log('\n2 · La porta del 20%: el que decideix si el projecte existeix');
{
  const r = await page.evaluate(() => {
    const H = window.__HABITATGE, G = H.estat();
    const base = { propis: H.pctPropis(), passa: H.passaPorta(), falta: H.falta() };
    /* Amb els títols que la mateixa pàgina diu que calen, ha de passar. */
    const cal = H.titolsNecessaris();
    G.titols = cal; H.pinta();
    const amb = { propis: H.pctPropis(), passa: H.passaPorta(), falta: H.falta() };
    /* I un euro menys no ha de passar: si passés, el llindar no seria el llindar. */
    G.titols = cal - 1; H.pinta();
    const menys = { propis: H.pctPropis(), passa: H.passaPorta() };
    G.titols = 0; H.pinta();
    return { base, amb, menys, cal, min: H.DADES.propisMin };
  });
  ok(!r.base.passa && r.base.propis < r.min,
    `amb l'aportació de referència sola, els recursos no bancaris són el ${r.base.propis.toFixed(1)}% ` +
    `i el mínim és el ${r.min}%: les aportacions soles no hi arriben, i això no és cosa d'aquest grup`);
  ok(r.base.falta > 0 && Math.round(r.base.falta) === Math.round(r.cal),
    `el forat es diu en euros —${Math.round(r.base.falta).toLocaleString('ca')} €— i és exactament ` +
    'el que la pàgina demana en títols participatius');
  /* El percentatge es compara arrodonit: qui posa exactament el que la pàgina li
     acaba de demanar ha de passar, i en coma flotant allò surt 19,999999…
     Aquest era el defecte que aquesta asserció va trobar. */
  ok(r.amb.passa && Math.round(r.amb.propis * 100) / 100 >= r.min && r.amb.falta === 0,
    `amb aquells títols passa la porta: ${r.amb.propis.toFixed(2)}% i cap euro pendent`);
  ok(!r.menys.passa,
    'i amb un euro menys no passa: el llindar és un llindar, no una orientació');
}

console.log('\n3 · L\'entrada i la quota es mouen en direccions contràries');
{
  const r = await page.evaluate(() => {
    const H = window.__HABITATGE;
    const t = H.tensio();
    return { t: t.map(p => ({ a: p.a, q: p.quota, fe: p.foraEntrada, fq: p.foraQuota, f: p.fora, porta: p.porta })),
      abs: H.millorAbsolut(), bo: H.millorPunt(),
      calAbs: H.titolsNecessaris(H.millorAbsolut().a) };
  });
  const t = r.t;
  ok(t.every((p, i) => i === 0 || p.q < t[i - 1].q),
    `pujar l'aportació sempre baixa la quota: de ${Math.round(t[0].q)} € sense entrada ` +
    `a ${Math.round(t[t.length - 1].q)} € amb ${t[t.length - 1].a.toLocaleString('ca')} €`);
  ok(t.every((p, i) => i === 0 || p.fe >= t[i - 1].fe),
    'i sempre deixa fora més gent per l\'entrada: la columna no baixa mai');
  ok(t.every((p, i) => i === 0 || p.fq <= t[i - 1].fq),
    'mentre que la que queda fora per la quota només pot baixar: són dues portes contràries');
  ok(t[0].fq > 0 && t[t.length - 1].fe > 0,
    `als extrems queda fora tothom per un motiu o per l'altre: ${t[0].fq} per la quota sense entrada, ` +
    `${t[t.length - 1].fe} per l'entrada al final`);
  ok(r.abs.fora < t[0].f && r.abs.fora < t[t.length - 1].f,
    `i enmig hi ha un mínim de debò: ${r.abs.a.toLocaleString('ca')} € d'aportació deixa fora ${r.abs.fora} ` +
    `de les 12, contra ${t[0].f} i ${t[t.length - 1].f} als extrems`);
  /* La troballa de la pantalla, i el motiu pel qual els títols participatius no
     són una manera de finançar més barat sinó de fer-hi cabre aquella gent. */
  if (!r.abs.porta) {
    ok(r.bo && r.bo.fora >= r.abs.fora && r.calAbs > 0,
      `el punt de mínima exclusió no passa la porta: la passa a partir de ` +
      `${r.bo.a.toLocaleString('ca')} €, i allà en queden fora ${r.bo.fora} en comptes de ${r.abs.fora}. ` +
      `Aquella diferència val ${Math.round(r.calAbs).toLocaleString('ca')} € en títols`);
  } else {
    ok(r.calAbs === 0, 'el punt de mínima exclusió ja passa la porta i no calen títols per fer-lo possible');
  }
}

console.log('\n4 · Qui marxa cobra el nominal, i se sap qui li ho torna');
{
  const r = await page.evaluate(() => {
    const H = window.__HABITATGE, G = H.estat();
    const s20 = H.sortida(20), s0 = H.sortida(0);
    const senseFons = H.fonsRetorn(20);
    G.reserva = 8; H.pinta();
    const ambFons = H.fonsRetorn(20);
    const quotaAmb = H.quotaGrup();
    G.reserva = 0; H.pinta();
    const quotaSense = H.quotaGrup();
    return { s20, s0, senseFons, ambFons, quotaAmb, quotaSense, ipc: G.ipc, ap: G.aportacio };
  });
  ok(r.s20.retorn === r.ap && r.s20.retorn === r.s20.posat,
    `qui marxa al cap de 20 anys cobra els ${r.ap.toLocaleString('ca')} € que va posar, ni un més: ` +
    'el retorn és nominal, i és el que impedeix que l\'habitatge torni a ser un actiu');
  ok(r.s20.equivalent > r.s20.retorn && r.s20.pctPerdut > 20,
    `i la pàgina en diu el preu: amb un IPC del ${r.ipc}%, aquells diners han perdut ` +
    `${r.s20.pctPerdut.toFixed(1)}% de poder adquisitiu (${Math.round(r.s20.perdua).toLocaleString('ca')} €)`);
  ok(r.s0.perdua === 0 && r.s0.retorn === r.s0.posat,
    'marxant el primer dia no es perd res: la pèrdua és del temps, no del model');
  ok(r.senseFons.cobertes === 0,
    'sense fons de retorn no hi ha cap sortida coberta: l\'aportació la torna qui entra, ' +
    'i si no entra ningú no es torna');
  ok(r.ambFons.cobertes > 0 && r.quotaAmb > r.quotaSense,
    `amb un 8% de la despesa al fons se'n cobreixen ${r.ambFons.cobertes} en vint anys, ` +
    `i la quota puja de ${Math.round(r.quotaSense)} € a ${Math.round(r.quotaAmb)} €: ` +
    'l\'assegurança d\'aquest model té preu i es veu');
}

console.log('\n5 · L\'esforç, i que no s\'inventa el que no se sap');
{
  const r = await page.evaluate(() => {
    const H = window.__HABITATGE, G = H.estat();
    H.novaLlar('Llar Sense Dades', 55, 2, 0, 20000);
    H.pinta();
    const rep = H.repartiment();
    const nova = rep.files.find(f => f.l.nom === 'Llar Sense Dades');
    const dupli = H.novaLlar('llar sense dades', 50, 1, 1000, 1000);
    const buida = H.novaLlar('', 50, 1, 1000, 1000);
    const out = { esforcNul: nova.esforc, foraQuota: nova.foraQuota,
      dupli: dupli.err || null, buida: buida.err || null,
      max: H.ESFORC_MAX,
      esforcs: rep.files.filter(f => f.esforc != null).map(f => f.esforc) };
    H.treuLlar(nova.l.id); H.pinta();
    return out;
  });
  ok(r.esforcNul === null && r.foraQuota === false,
    'una llar que no ha declarat ingressos no té esforç calculat i no compta com a exclosa: ' +
    'no se n\'inventa cap número');
  ok(r.dupli && /Ja hi ha/.test(r.dupli), `no s'admeten dues llars amb el mateix nom: «${r.dupli}»`);
  ok(r.buida && /nom/.test(r.buida), `ni una llar sense nom: «${r.buida}»`);
  ok(r.esforcs.every(e => e > 0 && e < 100) && r.max === 30,
    `els esforços de les altres van de ${Math.min(...r.esforcs).toFixed(0)}% a ` +
    `${Math.max(...r.esforcs).toFixed(0)}%, amb el llindar declarat al ${r.max}%`);
}

console.log('\n6 · La pàgina: pestanyes, menú i el que promet a la primera pantalla');
{
  const r = await page.evaluate(() => {
    const txt = document.body.textContent.replace(/\s+/g, ' ');
    return { tabs: document.querySelectorAll('#tabs button').length,
      pans: document.querySelectorAll('.pan').length,
      nav: !!document.querySelector('.sos-nav'),
      aqui: [...document.querySelectorAll('.sos-nav [aria-current]')].map(a => a.getAttribute('href')),
      files: document.querySelectorAll('#tTensio tbody tr').length,
      minMarcat: document.querySelectorAll('#tTensio tr.min').length,
      noCompra: /Aquí no es compra res/.test(txt),
      nominal: /no és un defecte del model, és el model/.test(txt),
      sol: /el sòl no s'ha pagat/.test(txt),
      dispositiu: /viu al navegador d'aquest dispositiu/.test(txt) };
  });
  ok(r.tabs === r.pans && r.tabs === 8, `${r.tabs} pantalles, ${r.tabs} pestanyes`);
  ok(r.nav && r.aqui.indexOf('habitatge.html') >= 0,
    'porta el menú del SOS i s\'hi marca a si mateixa');
  ok(r.files >= 12 && r.minMarcat === 1,
    `el recorregut de l'aportació té ${r.files} punts i n'hi ha un de marcat com a mínim d'exclusió`);
  ok(r.noCompra && r.dispositiu,
    'diu que aquí no es compra res i que el que s\'hi escriu no surt del dispositiu');
  ok(r.nominal, 'i defensa el retorn nominal en comptes de demanar-ne perdó');
  ok(r.sol, 'i diu d\'on ve de debò el preu: el sòl no s\'ha pagat');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
}

await ctx.close();

console.log('\n7 · Qui diu que ja té projecte d\'habitatge hi arriba des del diagnòstic');
{
  const c2 = await b.newContext({ viewport: { width: 900, height: 1000 } });
  const p2 = await c2.newPage();
  const e2 = []; p2.on('pageerror', e => e2.push(e.message));
  await p2.goto(F('diagnostic.html'));
  await p2.waitForTimeout(300);
  const r = await p2.evaluate(async () => {
    const $ = s => document.querySelector(s);
    $('#nom').value = 'Anna Prova'; $('#mail').value = 'a@b.cat';
    $('[data-go="2"]').click(); await new Promise(r2 => setTimeout(r2, 120));
    $('#orgType .opt[data-v="entitat"]').click();
    $('#municipi').value = 'Vilafranca';
    $('[data-go="3"]').click(); await new Promise(r2 => setTimeout(r2, 120));
    /* El que diu qui ja té un projecte d'habitatge en marxa. */
    $('#serveis .chip[data-v="habitatge"]').click();
    /* Cal marcar alguna necessitat: sense res a la pantalla 3, el pas a la 4 no
       avança i el diagnòstic no s'arriba a fer. */
    $('#need .chip[data-v="formacio"]').click();
    $('[data-go="4"]').click(); await new Promise(r2 => setTimeout(r2, 120));
    const b2 = [...document.querySelectorAll('button')].find(x => /diagn/i.test(x.textContent));
    if (b2) b2.click();
    await new Promise(r2 => setTimeout(r2, 500));
    return [...document.querySelectorAll('#rPortes .porta-c')].map(a => ({
      url: a.getAttribute('href'),
      per: (a.querySelector('.pq') || {}).textContent || '' }));
  });
  const porta = r.find(x => /habitatge\.html/.test(x.url));
  ok(!!porta, 'amb «habitatge cooperatiu» marcat, una de les portes del diagnòstic és aquesta pàgina');
  ok(porta && /entrada/.test(porta.per),
    'i diu per què hi porta, no només que hi porta: ' + (porta ? '«' + porta.per.slice(0, 60) + '…»' : '—'));
  ok(e2.length === 0, 'sense errors de pàgina al diagnòstic' + (e2.length ? ': ' + e2[0] : ''));
  await c2.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
