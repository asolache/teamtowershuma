#!/usr/bin/env node
/* La guia de certificació · una pràctica per mòdul, escrita en un sol lloc
 * ─────────────────────────────────────────────────────────────────────────────
 * 21/11/2026, encàrrec de l'Álvaro: que la formació digui com s'obté la
 * certificació posant el model en marxa a la comunitat, amb la IA del SOS com a
 * tutora. Cada mòdul té una pràctica real, una evidència i el que en revisa la
 * IA. Això es declara **una vegada**, a `SOS/knowledge/formacio/certificacio.json`,
 * i aquest generador ho escriu a dos llocs:
 *
 *   · `SOS/certificacio.html`, pantalla «Les 22 pràctiques» (ca, i el castellà
 *     a `CE_PRACTIQUES_ES`).
 *   · `SOS/formacio.html`, al final de cada mòdul, la caixa «Per certificar».
 *
 * Els noms no són al JSON (veda 187: cada nom viu en un sol lloc):
 *   · títol i rol en català → l'h2 i el `p.mod-rol` de cada mòdul a formacio.html
 *   · títol i rol en castellà → la taula de SOS/knowledge/dev/noms-oficials.md
 *   · hores → el `div.num` del mòdul · nivell → FORMACIO_MODULES (SOS/index.html)
 *
 * Ús:  node SOS/tools/build-certificacio.js          escriu
 *      node SOS/tools/build-certificacio.js --check  falla si cal regenerar
 */
const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const SOS = join(__dirname, '..');
const CHECK = process.argv.includes('--check');
const F_FORM = join(SOS, 'formacio.html');
const F_CERT = join(SOS, 'certificacio.html');
const dades = JSON.parse(readFileSync(join(SOS, 'knowledge', 'formacio', 'certificacio.json'), 'utf8'));
const noms = readFileSync(join(SOS, 'knowledge', 'dev', 'noms-oficials.md'), 'utf8');
const app = readFileSync(join(SOS, 'index.html'), 'utf8');
let form = readFileSync(F_FORM, 'utf8');
let cert = readFileSync(F_CERT, 'utf8');

let errors = 0;
const no = m => { errors++; console.log('  ✗ ' + m); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const net = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/* Castellà: la taula dels 22 de noms-oficials.md. */
const ES = {};
for (const m of noms.matchAll(/^\| (m\d+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|/gm))
  ES[m[1]] = { t: m[3].trim(), r: m[4].trim() };

/* Nivell de cada mòdul a l'app. */
const NIV = {}, APP = {};
const iF = app.indexOf('const FORMACIO_MODULES=[');
for (const m of app.slice(iF, app.indexOf('\n];', iF)).matchAll(/\{id:'(m\d+)',n:(\d+),title:'(?:[^'\\]|\\.)*',hours:([\d.]+),level:'(N\d)',roles:\[([^\]]*)\]/g)) {
  NIV[m[1]] = m[4];
  APP[m[1]] = { n: +m[2], h: +m[3], roles: m[5].split(',').map(r => r.replace(/'/g, '').trim()).filter(Boolean) };
}

/* Cada mòdul de formacio.html: on comença, on acaba, títol, rol i hores. */
function modul(id) {
  const i = form.indexOf(`id="${id}"`);
  if (i < 0) return null;
  const fi = form.indexOf('</section>', i);
  const tros = form.slice(i, fi);
  const h2 = (tros.match(/<h2>([\s\S]*?)<\/h2>/) || [])[1];
  const rol = (tros.match(/<p class="mod-rol">([\s\S]*?)<\/p>/) || [])[1] || '';
  const hores = ((tros.match(/<div class="num">[^·]*·\s*([^·<]+?h)\b/) || [])[1] || '').trim();
  return { fi, t: h2 ? net(h2) : '', r: net(rol).replace(/^Forma:\s*/, ''), hores };
}

const ROL = { ca: 'Forma', es: 'Forma' };
const LBL = {
  ca: { p: 'Pràctica', e: 'Evidència', ia: 'Revisa la IA', n: 'Nivell' },
  es: { p: 'Práctica', e: 'Evidencia', ia: 'Revisa la IA', n: 'Nivel' }
};

const html = [], moduls = [], dicES = {
  'pr.lp': LBL.es.p, 'pr.le': LBL.es.e, 'pr.li': LBL.es.ia
};
const caixes = {};

console.log('\nLa guia de certificació · 22 pràctiques');
dades.blocs.forEach(b => {
  html.push(`<div class="bloc-p" id="area-${b.id.toLowerCase()}">`,
    `<h3 data-i18n-html="pr.b${b.id}">Àrea ${b.id} · ${esc(b.ca)}</h3>`);
  dicES['pr.b' + b.id] = `Área ${b.id} · ${esc(b.es)}`;
  b.mods.forEach(id => {
    const M = modul(id), P = dades.practiques[id], E = ES[id], nv = NIV[id] || '';
    if (!M) return no(`${id}: no és a formacio.html`);
    if (!M.t) return no(`${id}: formacio.html no té h2`);
    if (!P || !P.ca || !P.es) return no(`${id}: falta la pràctica (ca i es) a certificacio.json`);
    if (!E) return no(`${id}: falta a la taula de noms-oficials.md`);
    if (!nv) no(`${id}: FORMACIO_MODULES no en diu el nivell`);
    const meta = l => [M.hores, nv].filter(Boolean).join(' · ');
    html.push(`<article class="pr b${b.id}" id="c${id}">`,
      `  <h4><a href="formacio.html#${id}">${id.slice(1)} · <span data-i18n-html="pr.${id}.t">${esc(M.t)}</span></a></h4>`,
      `  <p class="rol"><span data-i18n-html="pr.${id}.r">${ROL.ca}: ${esc(M.r)}</span> · ${esc(meta())}</p>`,
      `  <dl><dt data-i18n-html="pr.lp">${LBL.ca.p}</dt><dd data-i18n-html="pr.${id}.p">${esc(P.ca.p)}</dd>`,
      `  <dt data-i18n-html="pr.le">${LBL.ca.e}</dt><dd data-i18n-html="pr.${id}.e">${esc(P.ca.e)}</dd>`,
      `  <dt data-i18n-html="pr.li">${LBL.ca.ia}</dt><dd data-i18n-html="pr.${id}.i">${esc(P.ca.ia)}</dd></dl>`,
      `</article>`);
    Object.assign(dicES, {
      [`pr.${id}.t`]: esc(E.t), [`pr.${id}.r`]: `${ROL.es}: ${esc(E.r)}`,
      [`pr.${id}.p`]: esc(P.es.p), [`pr.${id}.e`]: esc(P.es.e), [`pr.${id}.i`]: esc(P.es.ia)
    });
    moduls.push({ id, n: (APP[id] || {}).n || +id.slice(1), bloc: b.id, nivell: nv, hores: (APP[id] || {}).h || 0,
      horesText: M.hores, rols: (APP[id] || {}).roles || [],
      t: { ca: M.t, es: E.t }, rol: { ca: M.r, es: E.r },
      practica: { ca: P.ca, es: P.es } });
    caixes[id] = [`<!--TT-CERT-${id}-->`,
      `<div class="box cert-pr"><h4>🎓 Per certificar · la pràctica a la comunitat</h4>`,
      `<p><strong>Què fas:</strong> ${esc(P.ca.p)}</p>`,
      `<p><strong>L'evidència que queda:</strong> ${esc(P.ca.e)}</p>`,
      `<p><strong>Què revisa la IA tutora:</strong> ${esc(P.ca.ia)}</p>`,
      `<p><a href="certificacio.html#c${id}">Com es valida i es certifica →</a></p></div>`,
      `<!--/TT-CERT-${id}-->`].join('\n');
  });
  html.push('</div>');
});

const totes = dades.blocs.reduce((n, b) => n + b.mods.length, 0);
const ancores = [...form.matchAll(/<section class="module mod-\d+" id="(m\d+)"/g)].map(m => m[1]);
const sense = ancores.filter(id => !dades.blocs.some(b => b.mods.includes(id)));
if (sense.length) no(`mòduls de formacio.html sense pràctica: ${sense.join(', ')}`);
if (errors) { console.log(`\n❌ ${errors} error(s)`); process.exit(1); }

function posa(src, obre, tanca, cos) {
  const a = src.indexOf(obre), z = src.indexOf(tanca);
  if (a < 0 || z < a) throw new Error('no hi ha les marques ' + obre);
  return src.slice(0, a + obre.length) + '\n' + cos + '\n' + src.slice(z);
}
const GEN = '<!-- GENERAT per SOS/tools/build-certificacio.js des de SOS/knowledge/formacio/certificacio.json · no s\'edita a mà. -->';
let cert2 = posa(cert, '<!--TT-PRACTIQUES-->', '<!--/TT-PRACTIQUES-->', GEN + '\n' + html.join('\n'));
cert2 = posa(cert2, '/*TT-PRACTIQUES-ES*/', '/*/TT-PRACTIQUES-ES*/',
  '/* GENERAT per SOS/tools/build-certificacio.js · no s\'edita a mà. */\nconst CE_PRACTIQUES_ES = ' + JSON.stringify(dicES, null, 1) + ';');

/* formacio.html: la caixa va just abans del </section> de cada mòdul. Es
   treballa del final cap al principi perquè les posicions no es moguin. */
let form2 = form.replace(/\n?<!--TT-CERT-(m\d+)-->[\s\S]*?<!--\/TT-CERT-\1-->/g, '');
const ordre = Object.keys(caixes).map(id => {
  const i = form2.indexOf(`id="${id}"`);
  return { id, fi: form2.indexOf('</section>', i) };
}).sort((a, b) => b.fi - a.fi);
ordre.forEach(({ id, fi }) => { form2 = form2.slice(0, fi) + caixes[id] + '\n' + form2.slice(fi); });

/* Les mateixes dades, en una peça que llegeix el navegador (el pla de
   desenvolupament, SOS/lib/pla-desenvolupament.js): generada, no s'edita. */
const F_MOD = join(SOS, 'knowledge', 'formacio', 'moduls.json');
let modAra = ''; try { modAra = readFileSync(F_MOD, 'utf8'); } catch (e) { /* primera vegada */ }
const mod2 = JSON.stringify({ _generat: 'SOS/tools/build-certificacio.js · no s\'edita a mà', blocs: dades.blocs, moduls }, null, 1) + '\n';
const canvis = [[F_CERT, cert, cert2], [F_FORM, form, form2], [F_MOD, modAra, mod2]].filter(([, a, b]) => a !== b);
if (CHECK) {
  if (canvis.length) { canvis.forEach(([f]) => no(`${f.replace(SOS, 'SOS')} no està al dia: corre build-certificacio.js`)); process.exit(1); }
  console.log(`  ✓ ${totes} pràctiques al dia a certificacio.html, formacio.html i moduls.json`);
} else {
  canvis.forEach(([f, , b]) => writeFileSync(f, b));
  console.log(`  ✓ ${totes} pràctiques · ${canvis.length} fitxer(s) escrit(s)`);
}
