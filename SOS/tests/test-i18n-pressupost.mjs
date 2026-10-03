/* El formulari de pressupost, en les dues llengües
 * ─────────────────────────────────────────────────────────────────────────────
 * `pressupost.html` era **només en català**: ni `data-i18n`, ni `data-ca`, ni
 * botó de llengua — `<html lang="ca">` i prou. I és la pantalla on algú demana
 * un preu: qui ve del castellà hi arribava i havia de desxifrar-la, camp a
 * camp, per saber què li preguntaven.
 *
 * El diccionari el genera `build-formularis.js` i no la pàgina, perquè **mitja
 * pàgina la genera aquell fitxer** —els tipus d'organització, els rols, els
 * paquets, els camps de mida— i tenir-lo en dos llocs voldria dir que un dia
 * no coincidissin, i el que divergiria seria una llengua sencera.
 *
 * ── Els tres defectes que això vigila, i cap peta ───────────────────────────
 * · **Un `placeholder` sense clau.** El text d'exemple d'un camp es llegeix
 *   igual que una etiqueta, i un diccionari que només toca `textContent` el
 *   deixa en català sense que res avisi. Per això hi ha `data-i18n-ph`.
 * · **L'emoji fora del valor.** El marcatge escriu `🏛 Ajuntament` i el
 *   diccionari substitueix el `textContent` sencer: si el valor no porta
 *   l'emoji, canviar de llengua **esborra dotze icones** de la pantalla. Va
 *   passar, i es va veure mirant.
 * · **La tria que no es recorda.** Qui ha triat castellà per llegir el
 *   formulari no l'ha de tornar a triar quan la pàgina es recarrega.
 *
 * Ús:  node SOS/tests/test-i18n-pressupost.mjs
 */
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const PAGINA = pathToFileURL(join(import.meta.dirname, '..', 'pressupost.html')).href;

/* Paraules que només existeixen en català. No és un detector de llengua: és
   una xarxa prou espessa per caçar una etiqueta o un paràgraf sense traduir. */
const CA = /\b(amb|aquest|aquesta|això|què|però|perquè|véns|triat|cognoms|Següent|Enrere|teu|tria|seva|següent|antiguitat|sencer|esdeveniments|pràctica|cadascú|hi ha|teixit)\b/i;

let fail = 0;
const ok = (c, m) => { if (c) console.log('  ✓ ' + m); else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
p.on('pageerror', e => { fail++; console.log('  ✗ pageerror: ' + e.message); });
await p.goto(PAGINA);
await p.waitForTimeout(250);

/* ── 1 · El commutador hi és i obre en català ────────────────────────────── */
console.log('\n1 · El formulari es pot llegir en castellà');
{
  const r = await p.evaluate(() => ({
    botons: document.querySelectorAll('.lang-b').length,
    lang: document.documentElement.lang,
    h1: document.querySelector('h1').textContent,
    claus: document.querySelectorAll('[data-i18n],[data-i18n-html],[data-i18n-ph]').length
  }));
  ok(r.botons === 2, `hi ha els dos botons de llengua (${r.botons})`);
  ok(r.lang === 'ca' && /Demana/.test(r.h1), 'i obre en català: ' + r.h1);
  ok(r.claus > 60, `${r.claus} elements amb clau — abans no n'hi havia cap`);
}

/* ── 2 · LA QUE IMPORTA · què es queda en català ─────────────────────────── */
console.log('\n2 · I no es queda cap camp en català');
{
  await p.click('.lang-b[data-lang="es"]');
  await p.waitForTimeout(300);
  const r = await p.evaluate(sCA => {
    const re = new RegExp(sCA, 'i');
    /* Es mira **el que el diccionari havia de cobrir**: si un element amb clau
       segueix en català, la clau existeix i el valor castellà no. */
    const amb = [...document.querySelectorAll('[data-i18n],[data-i18n-html]')]
      .filter(e => re.test(e.textContent)).map(e => e.getAttribute('data-i18n')
        || e.getAttribute('data-i18n-html'));
    const ph = [...document.querySelectorAll('[data-i18n-ph]')]
      .filter(e => re.test(e.getAttribute('placeholder') || '')).length;
    return {
      lang: document.documentElement.lang,
      h1: document.querySelector('h1').textContent,
      amb, ph,
      /* Les quatre pantalles del formulari, pel seu títol. */
      passos: [...document.querySelectorAll('.step h2')].map(h => h.textContent),
      org: (document.querySelector('#orgType .o-t') || {}).textContent || '',
      rol: (document.querySelector('#rol option') || {}).textContent || '',
      exemple: (document.querySelector('#repte') || {}).placeholder || ''
    };
  }, CA.source);

  ok(r.lang === 'es', `l'atribut \`lang\` ho diu (${r.lang}) — sense això un lector `
    + 'de pantalla llegeix castellà amb fonètica catalana');
  ok(/Pide presupuesto/.test(r.h1), 'el títol: ' + r.h1);
  ok(!r.amb.length, 'cap element amb clau es queda en català'
    + (r.amb.length ? ': ' + r.amb.slice(0, 5).join(', ') : ''));
  /* El defecte que un diccionari de només `textContent` deixa passar. */
  ok(!r.ph, `i cap \`placeholder\` tampoc (${r.ph})`);
  ok(r.exemple.startsWith('p.ej.'), 'el text d\'exemple del camp obert, traduït');
  ok(r.passos.every(t => !CA.test(t)), 'els quatre passos: ' + r.passos.join(' · '));
  ok(/Ayuntamiento|Agencia|Empresa/.test(r.org), 'els tipus d\'organització: ' + r.org);
  ok(/Dirección/.test(r.rol), 'i els rols: ' + r.rol);
  /* L'emoji: el marcatge l'escriu al costat del text i el diccionari
     substitueix el `textContent` sencer. Si el valor no el porta, canviar de
     llengua esborra dotze icones i no peta res. */
  ok(/^\p{Extended_Pictographic}/u.test(r.org.trim()),
    'i les icones no desapareixen en canviar de llengua: ' + r.org.slice(0, 18));
}

/* ── 3 · La tria es recorda ──────────────────────────────────────────────── */
console.log('\n3 · I no s\'ha de tornar a triar');
{
  await p.reload();
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => ({
    lang: document.documentElement.lang,
    h1: document.querySelector('h1').textContent,
    marcat: (document.querySelector('.lang-b.on') || {}).dataset?.lang
  }));
  ok(r.lang === 'es' && /Pide/.test(r.h1), 'recarregant, segueix en castellà');
  ok(r.marcat === 'es', 'i el botó ho marca: ' + r.marcat);
  await p.click('.lang-b[data-lang="ca"]');
  await p.waitForTimeout(250);
  const t = await p.evaluate(() => document.querySelector('h1').textContent);
  ok(/Demana/.test(t), 'i es pot tornar al català: ' + t);
}

/* ── 4 · El formulari segueix funcionant amb l'altra llengua posada ──────── */
console.log('\n4 · I segueix sent un formulari');
{
  /* Traduir no pot trencar el que es desa: els `value` dels camps i de les
     opcions són identificadors, no text, i han de seguir en la seva forma. */
  await p.click('.lang-b[data-lang="es"]');
  await p.waitForTimeout(250);
  const r = await p.evaluate(() => ({
    vals: [...document.querySelectorAll('#termini option')].map(o => o.value),
    rols: [...document.querySelectorAll('#rol option')].map(o => o.value).slice(0, 3),
    orgs: [...document.querySelectorAll('#orgType .opt')].map(o => o.dataset.v).slice(0, 3)
  }));
  ok(r.vals.includes('curs') && r.vals.includes('explorant'),
    'els `value` dels desplegables no es tradueixen: ' + r.vals.join(', '));
  ok(r.rols.includes('direccio'), 'ni els dels rols: ' + r.rols.join(', '));
  ok(r.orgs.includes('ajuntament'), 'ni els dels tipus d\'organització: ' + r.orgs.join(', '));
}

/* ── 5 · LA QUE DECIDEIX UNA COMPRA · la proposta ─────────────────────────
   El formulari es va traduir el 02/10/2026 i **la proposta no**: qui l'omplia
   en castellà arribava al final i es trobava el total, el desglossament, com
   s'ha calculat i què falta per tancar-ho **sencers en català**. És la pantalla
   on algú decideix si ens truca.

   Els noms dels paquets i dels nivells no són diccionari: vénen del catàleg
   amb el seu `nomEs`, i per això es llegeixen de la pantalla i no del codi. */
console.log('\n5 · I la proposta que en surt, també');
{
  await p.goto(PAGINA);
  await p.waitForTimeout(200);
  await p.click('.lang-b[data-lang="es"]');
  await p.waitForTimeout(200);
  await p.fill('#nom', 'Ana Ruiz');
  await p.fill('#mail', 'ana@exemple.cat');
  await p.click('[data-go="2"]');
  await p.click('#orgType .opt[data-v="gran"]');
  await p.fill('#municipi', 'Sabadell');
  await p.click('[data-go="3"]');
  await p.waitForTimeout(150);
  await p.check('input[name="paquet"][value="mapa-organitzacio"]');
  await p.check('input[name="paquet"][value="fent-pinya"]');
  await p.click('[data-go="4"]');
  await p.waitForTimeout(150);
  await p.selectOption('#diners', 'subvencio');
  /* Una partida d'hores, perquè la taula de l'escala també hi surt. */
  const camps = await p.$$('#escBody input');
  if (camps[1]) await camps[1].fill('10');
  await p.click('#doProp');
  await p.waitForTimeout(350);

  const r = await p.evaluate(sCA => {
    const re = new RegExp(sCA, 'i');
    const t = id => (document.getElementById(id) || { innerText: '' }).innerText.trim();
    const res = document.getElementById('result');
    return {
      visible: res.offsetHeight > 200,
      totalD: t('rTotalD'), metode: t('rMetode'), falta: t('rFalta'),
      lead: t('rLead'), lin: t('rLin'), hores: t('rHores'), esc: t('escBody'),
      linies: res.innerText.split('\n').map(x => x.trim())
        .filter(x => x.length > 14 && re.test(x)).slice(0, 5)
    };
  }, CA.source);

  ok(r.visible, 'la proposta es veu de debò');
  ok(!CA.test(r.totalD), 'el peu del total: ' + r.totalD.slice(0, 60) + '…');
  ok(!CA.test(r.metode), 'com s\'ha calculat — la frase que sosté el preu');
  ok(!CA.test(r.falta), 'i què falta per tancar-ho');
  ok(/Para .+ · 2 paquetes/.test(r.lead), 'el lead, amb el plural que toca: ' + r.lead);
  ok(/a medida/.test(r.lin), 'i «a mida» al desglossament: ' + r.lin.replace(/\n/g, ' · ').slice(0, 70));
  ok(/Gestor/.test(r.hores), 'les hores per nivell, des del catàleg: ' + r.hores.replace(/\n/g, ' '));
  ok(!r.linies.length, 'cap línia de la proposta en català'
    + (r.linies.length ? ': ' + r.linies.join(' · ') : ''));

  /* El resum, al contrari: **ha de seguir en català**. No és una pantalla, és
     el que arriba a la nostra banda, amb els mateixos separadors que els dos
     diagnòstics. Si canviés de llengua amb el botó, la safata trobaria les
     seccions la meitat de les vegades. */
  const resum = await p.evaluate(() => window.__PRESSU && window.__PRESSU.resum
    ? window.__PRESSU.resum(window.__PRESSU.proposta()) : '');
  ok(/PETICIÓ DE PRESSUPOST/.test(resum) && /── QUÈ ──/.test(resum),
    'i el resum que viatja per correu segueix en català, amb els seus separadors');
  ok(/Mapa de valor d'una organització/.test(resum),
    'amb el nom català del paquet i no el de la pantalla');
}

/* ── 6 · LA QUE TROBA EL QUE NO TÉ CLAU ───────────────────────────────────
   Les quatre primeres regles miren **els elements amb clau**, i per això no
   veuen el que no en té. Això va deixar passar, amb el formulari donat per
   traduït: els vint-i-quatre noms de paquet del triador, les quatre
   capçaleres de família, el subtítol del pas 3, el paràgraf de la
   contractació per hores i la promesa de privacitat.

   Aquesta recorre **tot el text de la pàgina** i no pregunta si té clau. */
console.log('\n6 · I res de la pàgina es queda en català, tingui clau o no');
{
  await p.goto(PAGINA);
  await p.waitForTimeout(200);
  await p.click('.lang-b[data-lang="es"]');
  await p.waitForTimeout(300);
  const r = await p.evaluate(sCA => {
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
      out.push((k ? '[' + k + '] ' : '[sense clau] ') + t.slice(0, 60));
    }
    return out;
  }, CA.source);
  ok(!r.length, `cap fragment en català a tota la pàgina (${r.length})`
    + (r.length ? ':\n      ' + r.slice(0, 6).join('\n      ') : ''));
}

await ctx.close();
await b.close();
console.log(fail ? `\n❌ ${fail} fallen` : '\n✅ El pressupost es llegeix en les dues llengües');
process.exit(fail ? 1 : 0);
