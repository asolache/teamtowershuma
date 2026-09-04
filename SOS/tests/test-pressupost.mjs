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

console.log('\n3 · El total és la suma de les forquilles, i es pot refer a mà');
{
  const { ctx, p, errs } = await nova(PONT);
  const r = await p.evaluate(() => {
    const marca = id => {
      const c = document.querySelector('input[name="paquet"][value="' + id + '"]');
      if (c) { c.checked = true; return { min: Number(c.dataset.min), max: Number(c.dataset.max) }; }
      return null;
    };
    /* Dos amb forquilla publicada. Se'n llegeix el valor de l'atribut, no d'una
       xifra escrita aquí: si el catàleg canvia, la prova segueix sent certa. */
    const a = marca('fluxos-ia'), b2 = marca('mapa-organitzacio');
    document.querySelector('#doProp').click();
    const t = document.querySelector('#rTotal').textContent;
    const nums = [...t.matchAll(/([\d.]+)/g)].map(m => Number(m[1].replace(/\./g, '')));
    return { a, b2, t, nums, files: document.querySelectorAll('#rLin li').length };
  });
  ok(r.a && r.b2, 'els dos paquets triats tenen forquilla declarada a l\'atribut');
  ok(r.files === 2, 'la proposta llista exactament els dos que s\'han triat');
  ok(r.nums[0] === r.a.min + r.b2.min, 'la banda baixa és la suma dels dos mínims');
  ok(r.nums[1] === r.a.max + r.b2.max, 'i la banda alta, la dels dos màxims');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n4 · Les hores per nivell entren al total amb el preu de l\'escala');
{
  const { ctx, p, errs } = await nova(PONT);
  const r = await p.evaluate(() => {
    document.querySelector('input[name="paquet"][value="impacte"]').checked = true;
    const c = document.querySelector('input[name="paquet"][value="impacte"]');
    const base = { min: Number(c.dataset.min), max: Number(c.dataset.max) };
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
      base, hora, nums,
      niv: camps.length,
      obert: !document.querySelector('#rHoresBox').hidden,
      linia: document.querySelector('#rHores').textContent.replace(/\s+/g, ' ')
    };
  });
  ok(r.niv === 3, 'l\'escala té tres nivells, com la de la portada');
  ok(r.obert, 'la secció d\'hores s\'obre quan se n\'hi posen');
  ok(r.nums[0] === r.base.min + 10 * r.hora, 'les hores se sumen a la banda baixa');
  ok(r.nums[1] === r.base.max + 10 * r.hora, 'i a l\'alta');
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
    document.querySelector('.pq-f[data-sec="privat"]').click();
    const privats = visibles();
    document.querySelector('.pq-f[data-sec="tot"]').click();
    return { total, abans, privats, tornen: visibles() };
  });
  ok(r.abans === r.total, 'en obrir, hi són tots: un filtre que amaga per defecte oculta oferta');
  ok(r.privats > 0 && r.privats < r.total, 'filtrant per empresa en queden menys, i en queden');
  ok(r.tornen === r.total, 'i «tot» els torna a mostrar');
  ok(!errs.length, 'cap error de JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
