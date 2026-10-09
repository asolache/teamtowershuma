/* El formulari de pressupost · que en surti una proposta que es pugui defensar
   ─────────────────────────────────────────────────────────────────────────
   El que es prova no és que el formulari «funcioni», sinó les quatre coses que
   el fan diferent d'un «contacta'ns»:

   · **El pont amb el diagnòstic.** Els dos formularis comparteixen els blocs
     «qui ets» i «d'on véns», i qui ja ha passat pel primer no ha de tornar a
     escriure el seu nom. Es prova sembrant el pont i comprovant que el segon
     comença directament al pas 3.
   · **La suma és refeta.** El total ha de ser exactament la suma de les
     forquilles del que s'ha triat més les hores per nivell. Si no, és una xifra
     que ningú pot comprovar — que és el que això ve a evitar.
   · **El que no té preu, no en té enlloc.** El taller i les demostracions no
     porten xifra a la portada; el formulari tampoc pot inventar-los-en una ni
     colar-los dins del total.
   · **No envia res sol.** La pàgina ho promet en negreta, i el botó d'enviar és
     un `mailto:` que obre el client de la persona.

   Veda 141. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));
const PAG = 'file://' + join(DIR, '..', 'pressupost.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

/* `pont` sembra el que hauria deixat el diagnòstic. Es fa amb addInitScript
   perquè ha d'existir abans que la pàgina llegeixi res. */
const nova = async (pont = null) => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  if (pont) await p.addInitScript(d => {
    try { localStorage.setItem('tt.form.qui', JSON.stringify(d)); } catch (e) { }
  }, pont);
  await p.goto(PAG);
  await p.waitForSelector('#pForm');
  return { ctx, p, errs };
};

const PONT = {
  nom: 'Júlia Ferrer', rol: 'persones', carrec: 'Direcció de persones',
  mail: 'julia@example.org', tel: '', org: 'cooperativa', orgNom: 'La Cooperativa',
  municipi: 'Vilafranca del Penedès', comarca: 'Alt Penedès', poblacio: '40000'
};

console.log('\n1 · Sense res desat, el formulari comença pel principi');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => ({
    pas1: !document.querySelector('#s1').hidden,
    pas3: !document.querySelector('#s3').hidden,
    nom: document.querySelector('#nom').value,
    err: document.querySelector('#e1').classList.contains('on')
  }));
  ok(r.pas1 && !r.pas3, 'arrenca al pas 1');
  ok(r.nom === '', 'i el nom és buit');
  ok(!r.err, 'sense acusar de res: qui acaba d\'arribar no ha fet res malament');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n2 · El pont amb el diagnòstic: no es torna a preguntar el que ja se sap');
{
  const { ctx, p, errs } = await nova(PONT);
  const r = await p.evaluate(() => ({
    pas3: !document.querySelector('#s3').hidden,
    nom: document.querySelector('#nom').value,
    mail: document.querySelector('#mail').value,
    municipi: document.querySelector('#municipi').value,
    rol: document.querySelector('#rol').value,
    orgSel: (document.querySelector('#orgType .opt.sel') || {}).dataset?.v || ''
  }));
  ok(r.nom === PONT.nom && r.mail === PONT.mail, 'el nom i el correu ja hi són');
  ok(r.municipi === PONT.municipi, 'i el municipi també');
  ok(r.rol === 'persones', 'el rol directiu es recupera');
  ok(r.orgSel === 'cooperativa', 'i el tipus d\'organització queda marcat');
  ok(r.pas3, 'i el formulari comença directament al pas 3, que és el que aporta');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n3 · Sense forquilles: els paquets van per fluxos i fora del total');
{
  const { ctx, p, errs } = await nova(PONT);
  const r = await p.evaluate(() => {
    const marca = id => {
      const c = document.querySelector('input[name="paquet"][value="' + id + '"]');
      if (c) { c.checked = true; return { min: c.dataset.min, fluxos: c.dataset.fluxos, txt: c.parentElement.querySelector('.pq-p').textContent }; }
      return null;
    };
    const a = marca('fluxos-ia'), b2 = marca('mapa-organitzacio');
    document.querySelector('#doProp').click();
    return { a, b2, fora: document.querySelector('#rTotalD').textContent,
      files: [...document.querySelectorAll('#rLin li')].map(li => li.textContent),
      xifres: [...document.querySelectorAll('.pq-p')].filter(x => /\d\s*€/.test(x.textContent)).length };
  });
  ok(r.a && r.b2 && r.a.fluxos === '1' && r.b2.fluxos === '1' && r.a.min === undefined, 'els paquets no porten forquilla a l\'atribut: van per fluxos');
  ok(r.xifres === 0 && /per fluxos/.test(r.a.txt), 'i la llista no ensenya cap xifra en euros, sinó «per fluxos»');
  ok(r.files.length === 2 && r.files.every(t => /per fluxos/.test(t)), 'la proposta llista els dos triats, cadascun «per fluxos»');
  ok(/per fluxos/.test(r.fora), 'i diu que es pressuposten per fluxos, fora del total');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n4 · Les hores per nivell sí que fan el total, amb el preu de l\'escala');
{
  const { ctx, p, errs } = await nova(PONT);
  const r = await p.evaluate(() => {
    document.querySelector('input[name="paquet"][value="impacte"]').checked = true;
    const camps = [...document.querySelectorAll('#escBody input')];
    /* 10 h del nivell del mig, que és el que més es contracta. */
    const mig = camps[1];
    mig.value = '10';
    mig.dispatchEvent(new Event('input', { bubbles: true }));
    const hora = Number(mig.dataset.hora);
    document.querySelector('#doProp').click();
    const nums = [...document.querySelector('#rTotal').textContent.matchAll(/([\d.]+)/g)]
      .map(m => Number(m[1].replace(/\./g, '')));
    return {
      hora, nums,
      niv: camps.length,
      obert: !document.querySelector('#rHoresBox').hidden,
      linia: document.querySelector('#rHores').textContent.replace(/\s+/g, ' ')
    };
  });
  ok(r.niv === 3, 'l\'escala té tres nivells, com la de la portada');
  ok(r.obert, 'la secció d\'hores s\'obre quan se n\'hi posen');
  ok(r.nums[0] === 10 * r.hora && r.nums.length === 1, 'el total són les hores al preu del nivell (' + r.nums.join('–') + ')');
  ok(/10 h ×/.test(r.linia), 'i el desglossament diu les hores i el preu, no només el total');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n5 · El que no té preu publicat no en té aquí, ni entra al total');
{
  const { ctx, p, errs } = await nova(PONT);
  const r = await p.evaluate(() => {
    const c = document.querySelector('input[name="paquet"][value="fent-pinya"]');
    const etiqueta = c.closest('label').textContent.replace(/\s+/g, ' ');
    c.checked = true;
    document.querySelector('#doProp').click();
    return {
      etiqueta,
      mida: c.dataset.mida,
      preuAtr: c.dataset.min,
      total: document.querySelector('#rTotal').textContent,
      nota: document.querySelector('#rTotalD').textContent,
      linia: document.querySelector('#rLin').textContent.replace(/\s+/g, ' ')
    };
  });
  ok(r.mida === '1' && !r.preuAtr, 'el taller no porta cap xifra a l\'atribut');
  ok(/a mida/i.test(r.etiqueta) && !/\d[\d.]*\s*€/.test(r.etiqueta),
    'ni a l\'etiqueta que es llegeix');
  ok(/a mida/i.test(r.linia), 'la proposta el llista dient «a mida»');
  ok(/0 €/.test(r.total) || !/\d{3}/.test(r.total),
    'i no se n\'inventa cap import per al total');
  ok(/mapa de cost/i.test(r.nota), 'i diu que es pressuposta amb el mapa de cost');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n6 · No envia res sol, i el que s\'envia ho obre el teu client de correu');
{
  const { ctx, p, errs } = await nova(PONT);
  let peticions = 0;
  p.on('request', req => { if (/^https?:/.test(req.url())) peticions++; });
  const r = await p.evaluate(() => {
    document.querySelector('input[name="paquet"][value="impacte"]').checked = true;
    document.querySelector('#repte').value = 'Volem justificar amb dades i no amb activitats.';
    document.querySelector('#doProp').click();
    const href = document.querySelector('#bSend').getAttribute('href');
    return {
      href,
      esMailto: href.startsWith('mailto:'),
      cos: decodeURIComponent(href.split('body=')[1] || ''),
      priv: document.querySelector('.priv').textContent.replace(/\s+/g, ' ')
    };
  });
  ok(r.esMailto, 'el botó d\'enviar és un mailto: i no una crida a cap servidor');
  ok(peticions === 0, 'la pàgina no ha fet cap petició de xarxa' + (peticions ? ' (' + peticions + ')' : ''));
  ok(/PETICI/i.test(r.cos) && /TOTAL ORIENTATIU/.test(r.cos),
    'el cos del correu porta la proposta sencera, no un «hola, truca\'m»');
  ok(/sense IVA/i.test(r.cos), 'i diu que el total és sense IVA');
  ok(/no envia res sol/i.test(r.priv), 'i la pàgina ho segueix prometent per escrit');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n7 · El filtre no amaga res que no s\'hagi demanat');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(() => {
    const total = document.querySelectorAll('.pq').length;
    const visibles = () => [...document.querySelectorAll('.pq')].filter(l => !l.hidden).length;
    const abans = visibles();
    /* Els sectors es llegeixen **dels botons** i no d'una llista escrita aquí:
       la prova anava a buscar `data-sec="privat"`, que va deixar d'existir el
       dia que les portes van passar de dues a tres, i petava amb un `null` en
       comptes de dir què havia canviat. */
    const secs = [...document.querySelectorAll('.pq-f')].map(b => b.dataset.sec)
      .filter(x => x !== 'tot');
    const per = {};
    secs.forEach(sec => {
      document.querySelector('.pq-f[data-sec="' + sec + '"]').click();
      per[sec] = visibles();
    });
    /* I que cada paquet visible porti de debò el sector demanat: `data-sector`
       és una llista, i comparant la cadena sencera «admin tercer» no és ni
       l'un ni l'altre. */
    document.querySelector('.pq-f[data-sec="' + secs[0] + '"]').click();
    const tots = [...document.querySelectorAll('.pq')].filter(l => !l.hidden)
      .every(l => l.dataset.sector.split(' ').includes(secs[0]));
    document.querySelector('.pq-f[data-sec="tot"]').click();
    return { total, abans, secs, per, tots, tornen: visibles() };
  });
  ok(r.abans === r.total, 'en obrir, hi són tots: un filtre que amaga per defecte oculta oferta');
  ok(r.secs.length === 3, `hi ha ${r.secs.length} portes de sector: ${r.secs.join(', ')}`);
  Object.entries(r.per).forEach(([sec, n]) =>
    ok(n > 0 && n < r.total, `filtrant per «${sec}» en queden ${n} de ${r.total}: menys, i en queden`));
  ok(r.tots, `i els que queden porten de debò el sector demanat (${r.secs[0]})`);
  ok(new Set(Object.values(r.per)).size > 1, 'i els tres no donen el mateix número');
  ok(r.tornen === r.total, 'i «tot» els torna a mostrar');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
