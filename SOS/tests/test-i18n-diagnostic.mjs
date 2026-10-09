/* Els tres diagnòstics, en les dues llengües
 * ─────────────────────────────────────────────────────────────────────────────
 * Els dos formularis de diagnòstic **ja portaven les claus** `data-i18n` dels
 * blocs compartits —les escriu `build-formularis.js`, que és qui genera el bloc
 * de «qui ets» i el de «d'on véns»— i **no tenien cap diccionari que les
 * llegís**. El resultat era que les claus hi eren, el text es quedava en català
 * i no petava res. És el mateix defecte que ja es va trobar a la portada: una
 * guarda que compta el que hi ha mai no troba el que no hi és.
 *
 * I la pàgina de tria (`diagnostic.html`), que és la **primera** pantalla del
 * diagnòstic, no en tenia cap: qui venia del castellà ni arribava a triar porta.
 *
 * ── Els quatre defectes que això vigila ────────────────────────────────────
 * · **Una clau sense valor castellà.** Si el diccionari no la porta, el text es
 *   queda en català i la pantalla surt meitat i meitat.
 * · **Un `placeholder` sense traduir.** Es llegeix igual que una etiqueta i un
 *   diccionari de només `textContent` el deixa passar.
 * · **El resultat del diagnòstic en l'altra llengua.** És la pantalla que es
 *   ven, i la munta el JavaScript des dels catàlegs. Si els catàlegs no porten
 *   el castellà, el formulari es llegeix traduït i el diagnòstic no.
 * · **El resum en text pla, que ha de seguir en català.** El llegeix
 *   `crm.html` pels seus separadors: si canviés de llengua amb el botó, el CRM
 *   deixaria de trobar les seccions. És l'única cosa que *no* s'ha de traduir, i
 *   per tant també s'ha de comprovar.
 *
 * Ús:  node SOS/tests/test-i18n-diagnostic.mjs
 */
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const url = f => pathToFileURL(join(import.meta.dirname, '..', f)).href;

/* Paraules que només existeixen en català. No és un detector de llengua: és
   una xarxa prou espessa per caçar una etiqueta o un paràgraf sense traduir. */
const CA = /\b(amb|aquest|aquesta|això|què|però|perquè|véns|teniu|vostre|vostra|cognoms|Següent|Enrere|tria|teu|seva|cap ni una|mòduls|fins que)\b/i;

let fail = 0;
const ok = (c, m) => { if (c) console.log('  ✓ ' + m); else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } });
const p = await ctx.newPage();
p.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });

/* Mira una pàgina sencera: commutador, claus i què es queda en català. */
async function mira(fitxer, titol, esperaEs) {
  console.log('\n· ' + fitxer);
  await p.goto(url(fitxer));
  /* S'esborra la tria desada abans de mirar amb què obre: la tria es comparteix
     entre les quatre pantalles **a posta**, i sense esborrar-la aquesta prova
     comprovaria el que ha deixat la pàgina anterior i no el valor per defecte. */
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await p.reload();
  await p.waitForTimeout(250);
  const abans = await p.evaluate(() => ({
    botons: document.querySelectorAll('.lang-b').length,
    lang: document.documentElement.lang,
    h1: document.querySelector('h1').textContent.trim(),
    claus: document.querySelectorAll('[data-i18n],[data-i18n-html],[data-i18n-ph]').length
  }));
  ok(abans.botons === 2, `els dos botons de llengua (${abans.botons})`);
  ok(abans.lang === 'ca' && abans.h1 === titol, 'i obre en català: ' + abans.h1);
  ok(abans.claus > 10, `${abans.claus} elements amb clau`);

  await p.click('.lang-b[data-lang="es"]');
  await p.waitForTimeout(300);
  const r = await p.evaluate(sCA => {
    const re = new RegExp(sCA, 'i');
    /* Es mira **el que el diccionari havia de cobrir**: si un element amb clau
       segueix en català, la clau existeix i el valor castellà no. */
    const amb = [...document.querySelectorAll('[data-i18n],[data-i18n-html]')]
      .filter(e => re.test(e.textContent))
      .map(e => e.getAttribute('data-i18n') || e.getAttribute('data-i18n-html'));
    const ph = [...document.querySelectorAll('[data-i18n-ph]')]
      .filter(e => re.test(e.getAttribute('placeholder') || ''))
      .map(e => e.getAttribute('data-i18n-ph'));
    return {
      lang: document.documentElement.lang,
      h1: document.querySelector('h1').textContent.trim(),
      marcat: (document.querySelector('.lang-b.on') || {}).dataset?.lang,
      amb, ph
    };
  }, CA.source);

  ok(r.lang === 'es', `l'atribut \`lang\` ho diu (${r.lang}) — sense això un lector `
    + 'de pantalla llegeix castellà amb fonètica catalana');
  ok(r.h1 === esperaEs, 'el títol: ' + r.h1);
  ok(r.marcat === 'es', 'el botó ho marca');
  ok(!r.amb.length, 'cap element amb clau es queda en català'
    + (r.amb.length ? ': ' + r.amb.slice(0, 6).join(', ') : ''));
  ok(!r.ph.length, 'i cap `placeholder` tampoc'
    + (r.ph.length ? ': ' + r.ph.slice(0, 4).join(', ') : ''));

  /* La tria es recorda: qui ha triat castellà no l'ha de tornar a triar. */
  await p.reload();
  await p.waitForTimeout(300);
  const t = await p.evaluate(() => ({
    lang: document.documentElement.lang,
    h1: document.querySelector('h1').textContent.trim()
  }));
  ok(t.lang === 'es' && t.h1 === esperaEs, 'recarregant, segueix en castellà');
  /* I es torna, que és la meitat que es deixa de provar. */
  await p.click('.lang-b[data-lang="ca"]');
  await p.waitForTimeout(250);
  const v = await p.evaluate(() => document.querySelector('h1').textContent.trim());
  ok(v === titol, 'i es pot tornar al català');

  /* ── LA QUE TROBA EL QUE NO TÉ CLAU ──────────────────────────────────────
     Tot l'anterior mira **els elements amb clau**, i per això no veu el que no
     en té. Al pressupost això va deixar passar vint-i-quatre noms de paquet i
     tres paràgrafs sencers amb el formulari donat per traduït. Aquesta
     recorre tot el text de la pàgina i no pregunta si té clau. */
  await p.click('.lang-b[data-lang="es"]');
  await p.waitForTimeout(300);
  const tot = await p.evaluate(sCA => {
    const re = new RegExp(sCA, 'i');
    const out = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      if (n.parentElement && /SCRIPT|STYLE/.test(n.parentElement.tagName)) continue;
      const t = n.textContent.trim();
      if (t.length < 12 || !re.test(t)) continue;
      let e = n.parentElement, k = null;
      while (e && !k) {
        k = e.getAttribute && (e.getAttribute('data-i18n') || e.getAttribute('data-i18n-html'));
        e = e.parentElement;
      }
      out.push((k ? '[' + k + '] ' : '[sense clau] ') + t.slice(0, 56));
    }
    return out;
  }, CA.source);
  ok(!tot.length, `i cap fragment en català a tota la pàgina (${tot.length})`
    + (tot.length ? ':\n      ' + tot.slice(0, 5).join('\n      ') : ''));
}

console.log('\n1 · Les tres pantalles es poden llegir en castellà');
await mira('diagnostic.html', 'Quin diagnòstic et toca?', '¿Qué diagnóstico te toca?');
await mira('diagnostic-org.html', 'Diagnòstic d\'organització', 'Diagnóstico de organización');
await mira('diagnostic-territori.html', 'Diagnòstic comunitari', 'Diagnóstico comunitario');

/* ── 2 · LA QUE IMPORTA · el resultat, que és el que es ven ──────────────── */
console.log('\n2 · I el diagnòstic que en surt, també');
{
  /* El d'organització: es recorren els quatre passos i es mira el resultat. */
  await p.goto(url('diagnostic-org.html'));
  await p.waitForTimeout(200);
  await p.click('.lang-b[data-lang="es"]');
  await p.waitForTimeout(200);
  /* L'ordre és el del valor: l'objectiu primer i el contacte al final. */
  await p.click('#objTipus .opt[data-v="mapa"]');
  await p.click('[data-next="2"]');
  await p.click('#orgType .opt[data-v="gran"]');
  await p.fill('#municipi', 'Sabadell');
  await p.click('[data-next="3"]');
  await p.selectOption('#decideix', 'comite');
  await p.click('[data-next="4"]');
  ok(!/[àèòï]|l'|ç/.test(await p.evaluate(() => document.querySelector('#avanc').innerText)),
    'l\'avanç d\'abans del contacte, en castellà');
  await p.fill('#nom', 'Ana Ruiz');
  await p.fill('#mail', 'ana@exemple.cat');
  await p.click('#doDx');
  await p.waitForTimeout(350);

  const r = await p.evaluate(sCA => {
    const re = new RegExp(sCA, 'i');
    const t = id => (document.getElementById(id) || { textContent: '' }).textContent.trim();
    const res = document.getElementById('result');
    const linies = res.innerText.split('\n').map(x => x.trim())
      .filter(x => x.length > 14 && re.test(x));
    return {
      visible: res.offsetHeight > 200,
      title: t('rTitle'), llegim: t('rLlegim'), nota: t('rNotaOrg'),
      paq: t('rPaq').slice(0, 70), preu: t('rPreu').slice(0, 40), next: t('rNext'),
      linies: linies.slice(0, 4),
      /* I el resum, que ha de seguir en català. */
      resum: window.__DXORG ? '' : 'sense hook'
    };
  }, CA.source);

  ok(r.visible, 'el resultat es veu de debò (i no només té `display:block`)');
  ok(/organización|valor fluye|Entender/i.test(r.title), 'el títol de l\'objectiu: ' + r.title);
  ok(!CA.test(r.llegim), 'la lectura del cas, en castellà: ' + r.llegim.slice(0, 54) + '…');
  ok(!CA.test(r.nota), 'la nota del tipus d\'organització: ' + r.nota.slice(0, 54) + '…');
  ok(!CA.test(r.paq), 'els paquets, des del catàleg: ' + r.paq);
  ok(!CA.test(r.preu), 'i el per què no hi ha xifra: ' + r.preu + '…');
  ok(!CA.test(r.next), 'el primer pas: ' + r.next.slice(0, 54) + '…');
  ok(!r.linies.length, 'cap línia del resultat en català'
    + (r.linies.length ? ': ' + r.linies.join(' · ') : ''));

  /* El resum, al contrari: **ha de seguir en català**, perquè el llegeix
     `crm.html` pels separadors. Si es traduís, el CRM no trobaria res. */
  const resum = await p.evaluate(() => {
    const d = window.__DXORG.diagnose();
    return window.__DXORG.buildSummary(d);
  });
  ok(/── QUI ──/.test(resum) && /── D'ON ──/.test(resum),
    'i el resum manté els separadors que `crm.html` llegeix');
  ok(/DIAGNÒSTIC D'ORGANITZACIÓ/.test(resum),
    'en català amb el castellà posat, que és el correcte: no és una pantalla');
}

/* ── 3 · El de territori, igual ──────────────────────────────────────────── */
console.log('\n3 · I el del territori, que és el que en té més');
{
  await p.goto(url('diagnostic-territori.html'));
  await p.waitForTimeout(200);
  await p.click('.lang-b[data-lang="es"]');
  await p.waitForTimeout(200);
  /* També aquí el contacte va al final, després de l'avanç, i el primer
     que es pregunta és què us falta, no qui sou. */
  const primer = await p.evaluate(() => ({ need: !!document.querySelector('#s1 #need'),
    org: !!document.querySelector('#s1 #orgType'), nom: !!document.querySelector('#s1 #nom') }));
  ok(primer.need && !primer.org && !primer.nom, 'el primer pas del territori és què us falta, no qui sou');
  await p.click('#need .chip[data-v="relleu"]');
  await p.click('#need .chip[data-v="impacte"]');
  await p.click('#s1 [data-go="2"]');
  await p.click('#have .chip[data-v="persones"]');
  await p.click('#serveis .chip[data-v="banctemps"]');
  await p.click('#s2 [data-go="3"]');
  await p.click('#orgType .opt[data-v="ajuntament"]');
  await p.fill('#municipi', 'Igualada');
  await p.click('#s3 [data-go="4"]');
  const av = await p.evaluate(() => ({ t: document.querySelector('#avanc').innerText,
    n: document.querySelectorAll('#avP li').length, demanaAbans: !!document.querySelector('#s1 #mail') }));
  ok(av.n === 2 && !av.demanaAbans, 'l\'avanç del territori surt abans del correu, amb el que cal desfer');
  ok(!/[àèòï]|l'|ç/.test(av.t), 'i en castellà');
  await p.fill('#nom', 'Ana Ruiz');
  await p.fill('#mail', 'ana@exemple.cat');
  await p.click('#doDx');
  await p.waitForTimeout(350);

  const r = await p.evaluate(sCA => {
    const re = new RegExp(sCA, 'i');
    const t = id => (document.getElementById(id) || { innerText: '' }).innerText.trim();
    const res = document.getElementById('result');
    const linies = res.innerText.split('\n').map(x => x.trim())
      .filter(x => x.length > 14 && re.test(x));
    return {
      visible: res.offsetHeight > 300,
      seg: t('rSeg'), title: t('rTitle'), lead: t('rLead'),
      metrics: t('rMetrics'), have: t('rHave'), gaps: t('rGaps'),
      mods: t('rMods').slice(0, 60), svcs: t('rSvcs').slice(0, 80),
      fund: t('rFund'), next: t('rNext'), portes: t('rPortes'),
      linies: linies.slice(0, 5)
    };
  }, CA.source);

  ok(r.visible, 'el diagnòstic es veu');
  ok(/Ayuntamiento/.test(r.title), 'el perfil: ' + r.title);
  ok(!CA.test(r.seg) && !CA.test(r.lead), 'el segment i la lectura del perfil');
  ok(!CA.test(r.metrics), 'les quatre mètriques: ' + r.metrics.replace(/\n/g, ' · ').slice(0, 64));
  ok(!CA.test(r.have) && !CA.test(r.gaps), 'amb què compten i què cal desfer');
  ok(!CA.test(r.mods), 'els mòduls de l\'itinerari: ' + r.mods.replace(/\n/g, ' · '));
  ok(!CA.test(r.svcs), 'els serveis');
  ok(!CA.test(r.fund), 'd\'on poden sortir els diners');
  ok(!CA.test(r.next), 'el primer pas');
  ok(!CA.test(r.portes), 'i les portes cap al SOS, amb el seu per què');
  ok(!r.linies.length, 'cap línia del resultat en català'
    + (r.linies.length ? ': ' + r.linies.join(' · ') : ''));

  /* El forat de la xifra. La frase de la porta de formació porta `{n}` i si no
     se substitueix, a la pantalla hi surt escrit tal com està. */
  ok(!/\{n\}/.test(r.portes), 'i cap `{n}` sense substituir a la pantalla');

  const resum = await p.evaluate(() => {
    const d = window.__DX.diagnose();
    return window.__DX.buildSummary(d);
  });
  ok(/── QUÈ TENEN ──/.test(resum) && /── QUÈ NECESSITEN ──/.test(resum),
    'el resum manté els separadors de `crm.html`');
  ok(/Banc de temps/.test(resum) && !/Banco de tiempo/.test(resum),
    'i els xips hi van en català, no com es llegeixen a la pantalla');
}

/* ── 4 · Canviar de llengua amb el diagnòstic a la pantalla ──────────────── */
console.log('\n4 · I es pot canviar de llengua amb el diagnòstic ja fet');
{
  await p.click('.lang-b[data-lang="ca"]');
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => ({
    title: (document.getElementById('rTitle') || {}).innerText || '',
    next: (document.getElementById('rNext') || {}).innerText || ''
  }));
  ok(/Ajuntament/.test(r.title), 'el resultat es torna a escriure: ' + r.title);
  ok(/relleu|mapa de valor|calendari/i.test(r.next), 'i el primer pas també');
}

await ctx.close();
await b.close();
console.log(fail ? `\n❌ ${fail} fallen` : '\n✅ Els tres diagnòstics es llegeixen en les dues llengües');
process.exit(fail ? 1 : 0);
