/* L'Energia · repartir a parts iguals no estalvia igual
   ─────────────────────────────────────────────────────
   Aquesta pàgina dona xifres que un grup farà servir per decidir si es gasta
   desenes de milers d'euros. El que es prova no és que «funcioni» sinó que el
   que diu se sostingui:

   · **El coeficient no és l'estalvi.** Dues llars amb el mateix coeficient
     s'estalvien xifres molt diferents segons a quina hora consumeixen, i això
     no ho descobreix ningú fins a la primera factura — quan ja s'ha signat.
   · **Els coeficients sumen exactament 1.** És el que es comunica a la
     distribuïdora; una suma de 0,9999 la rebutja i ningú sap per què.
   · **L'excedent val un terç.** Barrejar el que deixes de comprar amb el que
     véns en una xifra sola amaga la que decideix les decisions.
   · **L'ajut té sostre.** Comptar el 40% sense el màxim de 3.000 € deixa un
     forat de cinc xifres al pressupost d'un grup.
   · **L'amortització es diu neta**, amb el cost d'operació descomptat, i amb
     el que l'estimació NO inclou escrit al costat. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'energia.html');
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
  await p.waitForFunction(() => window.__ENERGIA && window.__ENERGIA.estat().llars.length);
  return { ctx, p, errs };
};

console.log('\n1 · Els coeficients sumen exactament 1, els tres repartiments');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const E = window.__ENERGIA;
    return {
      sumes: ['igual', 'consum', 'dia'].map(m => E.sumaCoef(m)),
      llars: E.estat().llars.length,
      /* La forma decimal, que és la que es veu: ha de tenir quatre decimals i
         prou. Cinc no els accepta ningú i tres no reparteixen. */
      decimals: Object.keys(E.coeficients()).filter(k => k !== '__deu')
        .map(k => String(Math.round(E.coeficients()[k] * 10000))).length
    };
  });
  ok(r.sumes.every(s => s === 10000),
    `els tres repartiments sumen exactament 1 en deu-mil·lèsimes: ${r.sumes.join(', ')} de 10000`);
  ok(r.decimals === r.llars, `i hi ha un coeficient per cadascuna de les ${r.llars} llars`);
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n2 · Amb el mateix coeficient, l\'estalvi no és el mateix');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const E = window.__ENERGIA, G = E.estat();
    G.llars = []; G.kwp = 6;
    /* Dues llars idèntiques en tot menys en l'hora a la qual consumeixen. És
       l'experiment que la pàgina existeix per fer. */
    E.novaLlar('De dia', 3000, 80);
    E.novaLlar('De nit', 3000, 10);
    const r2 = E.repartiment('igual');
    const dia = r2.files.find(f => f.l.nom === 'De dia');
    const nit = r2.files.find(f => f.l.nom === 'De nit');
    return { coefIgual: dia.coef === nit.coef, coef: dia.coef,
      assignatIgual: Math.abs(dia.assignat - nit.assignat) < 1,
      diaAuto: Math.round(dia.auto), nitAuto: Math.round(nit.auto),
      diaAnual: Math.round(dia.anual * 100) / 100, nitAnual: Math.round(nit.anual * 100) / 100,
      diaAnys: Math.round(dia.anys * 10) / 10, nitAnys: Math.round(nit.anys * 10) / 10 };
  });
  ok(r.coefIgual && r.assignatIgual,
    `totes dues tenen el mateix coeficient (${r.coef}) i els toca la mateixa energia`);
  ok(r.diaAuto > r.nitAuto * 2,
    `però la de dia n'aprofita ${r.diaAuto} kWh i la de nit ${r.nitAuto}: l'hora ho decideix tot`);
  ok(r.diaAnual > r.nitAnual,
    `i s'estalvien ${r.diaAnual} € i ${r.nitAnual} € — amb la mateixa inversió`);
  ok(r.nitAnys > r.diaAnys,
    `l'amortització surt a ${r.diaAnys} anys i a ${r.nitAnys}: aquesta és la conversa que ` +
    'val més tenir abans de signar que a la primera factura');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n3 · L\'excedent val un terç, i es compta a part');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const E = window.__ENERGIA, P = E.PREUS;
    const r2 = E.repartiment();
    const f = r2.files[0];
    return { factura: P.factura, excedent: P.excedent,
      rao: Math.round(P.factura / P.excedent * 10) / 10,
      autoOk: Math.abs(f.estalviAuto - f.auto * P.factura) < 0.01,
      excOk: Math.abs(f.estalviExc - f.excedent * P.excedent) < 0.01,
      sumaFiles: Math.round(r2.files.reduce((a, x) => a + x.assignat, 0)),
      produccio: Math.round(E.produccio()),
      separat: r2.tot.estalviAuto > 0 && r2.tot.estalviExc > 0 &&
        Math.abs(r2.tot.anual - (r2.tot.estalviAuto + r2.tot.estalviExc - r2.tot.operacio)) < 0.01 };
  });
  ok(r.rao >= 2.5 && r.rao <= 4,
    `l'excedent val ${r.rao} vegades menys que el que deixes de comprar (${r.factura} vs ${r.excedent} €/kWh)`);
  ok(r.autoOk && r.excOk, 'cada peça es valora al seu preu, no a una mitjana');
  ok(r.separat,
    'i el net és el que no compres més el que véns MENYS el que costa tenir-ho engegat');
  ok(r.sumaFiles === r.produccio,
    `tota la producció es reparteix i no se'n perd cap kWh pel camí: ${r.sumaFiles} = ${r.produccio}`);
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n4 · L\'ajut té sostre, i el sostre mana');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const E = window.__ENERGIA, G = E.estat();
    G.kwp = 40;
    const gran = { inv: E.inversio(), ajut: E.ajutRebut(), pct: E.inversio() * G.ajut / 100 };
    G.kwp = 3;
    const petit = { inv: E.inversio(), ajut: E.ajutRebut(), pct: E.inversio() * G.ajut / 100 };
    return { gran, petit, max: E.PREUS.ajutMax };
  });
  ok(r.gran.ajut === r.max && r.gran.pct > r.max,
    `amb 40 kWp el percentatge donaria ${Math.round(r.gran.pct)} € i el sostre el talla a ${r.max}: ` +
    'comptar el percentatge sol deixaria un forat de cinc xifres al pressupost');
  ok(Math.abs(r.petit.ajut - r.petit.pct) < 0.01 && r.petit.ajut < r.max,
    `i amb una instal·lació petita mana el percentatge (${Math.round(r.petit.ajut)} €), no el sostre`);
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n5 · La coincidència horària és visible, i mou el resultat');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const E = window.__ENERGIA, G = E.estat();
    G.coin = 75; const conservador = E.repartiment().tot.anual;
    G.coin = 100; const optimista = E.repartiment().tot.anual;
    G.coin = 75;
    return { conservador, optimista, defecte: E.COINCIDENCIA,
      infla: Math.round((optimista / conservador - 1) * 100) };
  });
  ok(r.defecte === 75, `el valor per defecte és conservador: ${r.defecte}%`);
  ok(r.optimista > r.conservador,
    `suposar-la del 100% infla l'estalvi un ${r.infla}% — i és el que fa que dos pressupostos ` +
    'de fotovoltaica no es puguin comparar');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n6 · Sobredimensionar fa que els coeficients deixin de servir');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const E = window.__ENERGIA, G = E.estat();
    G.kwp = 10; const just = E.comparativa().map(c => Math.round(c.anual));
    G.kwp = 200; const massa = E.comparativa().map(c => Math.round(c.anual));
    G.kwp = 10;
    return { just, massa,
      justDif: Math.max(...just) - Math.min(...just),
      massaDif: Math.max(...massa) - Math.min(...massa),
      aprofitaMassa: Math.round(E.repartiment().tot.aprofita * 100) };
  });
  ok(r.justDif > 0,
    `amb la instal·lació ajustada, els tres repartiments donen resultats diferents (${r.just.join(' · ')} €)`);
  ok(r.massaDif === 0,
    'i amb una de sobredimensionada donen exactament el mateix: quan hi ha sol de sobra, ' +
    'el repartiment deixa de canviar res — i això és el senyal que sobra');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n7 · A la pantalla: el marc legal amb la seva data, i que aquí no es contracta res');
{
  const { ctx, p, errs } = await nova(1100, 900);
  await p.click('#tabs button[data-p="tramit"]');
  const r = await p.evaluate(() => {
    const E = window.__ENERGIA;
    const txt = document.body.textContent.replace(/\s+/g, ' ');
    return { passos: document.querySelectorAll('#tramit .pas').length,
      forade: document.querySelectorAll('#tramit .pas.crit').length,
      normes: document.querySelectorAll('#tLlei tbody tr').length,
      km: E.KM_AVUI.km, norma: E.KM_AVUI.norma, txt,
      tabs: document.querySelectorAll('#tabs button').length,
      pans: document.querySelectorAll('.pan').length };
  });
  ok(r.passos >= 6 && r.forade >= 3,
    `el tràmit té ${r.passos} passos i en marca ${r.forade} que no depenen del grup: ` +
    'planificar-los com si en depenguessin és el motiu més freqüent que un grup es desinfli');
  ok(r.normes >= 3 && new RegExp(String(r.km) + ' km').test(r.txt),
    `i el radi vigent surt amb la seva norma: ${r.km} km, ${r.norma}`);
  ok(/pregunta-li de quin any és/.test(r.txt),
    'amb l\'avís que una distància sense any no vol dir res');
  ok(/Aquí no es contracta res/.test(r.txt),
    'i la pàgina diu que no contracta ni dona d\'alta res');
  ok(r.tabs === r.pans && r.tabs === 7, `${r.tabs} pantalles, ${r.tabs} pestanyes`);
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n8 · Es desa, i a 390px no desborda');
{
  const { ctx, p, errs } = await nova(390, 800);
  const r = await p.evaluate(() => {
    const E = window.__ENERGIA;
    E.novaLlar('Llar Nova', 3000, 40);
    const desat = JSON.parse(localStorage.getItem(E.CLAU) || '{}');
    return { llars: (desat.llars || []).length,
      te: (desat.llars || []).some(l => l.nom === 'Llar Nova'),
      desborda: document.documentElement.scrollWidth > window.innerWidth + 1 };
  });
  ok(r.te && r.llars === 13, `una llar nova es desa al navegador (${r.llars} en total)`);
  ok(!r.desborda, 'i a 390px la pàgina no desborda de costat');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
