#!/usr/bin/env node
/* Publicar la pàgina d'un lead · al repositori privat, i esborrar-la després
 * ─────────────────────────────────────────────────────────────────────────
 * Decidit per l'Àlvar el 17/10/2026 (backlog, «La pàgina per al lead», pas 7):
 * la pàgina viu en un repositori privat amb el seu lloc de Netlify, en una
 * carpeta que té per nom la referència aleatòria de `lead.json`, i s'esborra
 * després de la visita. Aquest repositori, que és públic, només en porta el
 * generador (`pagina-lead.js`) i aquesta eina.
 *
 *   node SOS/tools/publica-lead.js --inicia ../teamtowers-leads/
 *        la primera vegada: escriu la base del repositori privat (`public/`
 *        amb les capçaleres, una portada buida i el 404, `netlify.toml`,
 *        `README.md` i la marca `.teamtowers-leads`).
 *
 *   node SOS/tools/publica-lead.js ../leads/<negoci>/ ../teamtowers-leads/
 *        copia `lead.html` a `public/<ref>/index.html`, només si és la pàgina
 *        revisada del mateix `lead.json` i torna a passar les comprovacions
 *        amb les fonts de la carpeta.
 *
 *   node SOS/tools/publica-lead.js --esborra <ref> ../teamtowers-leads/
 *        després de la visita: treu `public/<ref>/`.
 *
 * El commit i el push del repositori privat els fa qui publica: aquesta eina
 * no toca cap git.
 *
 * Surt amb 0 si ho ha fet, 4 si no ho fa i diu per què, 2 si l'ordre està mal
 * escrit i 1 si hi ha hagut un error. */
'use strict';
const { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } = require('node:fs');
const { join } = require('node:path');
const L = require('./pagina-lead.js');
const A = require('./analitza-contingut.js');

const MARCA = '.teamtowers-leads';
const REF = /^[A-Za-z0-9_-]{16,32}$/;

/* La base del lloc privat. Les capçaleres fan a nivell del servidor el que la
   pàgina ja compleix: no s'indexa, no envia referer, no executa cap script ni
   carrega res de fora (CSP), i no es desa a cap memòria cau. Sense robots.txt:
   si el tanqués, els cercadors no veurien el noindex. */
const BASE = {
  'public/_headers': ['/*',
    '  X-Robots-Tag: noindex, nofollow, noarchive',
    '  Referrer-Policy: no-referrer',
    '  X-Content-Type-Options: nosniff',
    "  Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; img-src data:; form-action 'none'; frame-ancestors 'none'; base-uri 'none'",
    '  Cache-Control: no-store', ''].join('\n'),
  'public/index.html': '<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="robots" content="noindex, nofollow">\n<meta name="referrer" content="no-referrer">\n<title>TeamTowers</title>\n</head>\n<body>\n<p>TeamTowers</p>\n</body>\n</html>\n',
  'public/404.html': '<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="robots" content="noindex, nofollow">\n<meta name="referrer" content="no-referrer">\n<title>TeamTowers</title>\n</head>\n<body>\n<p>Esta página ya no está. Si esperabas verla, escríbenos desde <a href="https://teamtowershuma.com/visita/">teamtowershuma.com/visita/</a>.</p>\n</body>\n</html>\n',
  'netlify.toml': '[build]\n  publish = "public"\n  command = ""\n',
  [MARCA]: 'Repositori privat de les pàgines dels leads. El gestiona SOS/tools/publica-lead.js (asolache/teamtowershuma).\n'
};
const README = `# Páginas de los leads · privado

Cada lead recibe, antes de la visita, una página con el x % de su mapa de valor
que el sistema ya puede preparar. Vive aquí, en \`public/<ref>/\`, con la
referencia aleatoria de su \`lead.json\` como nombre. **Este repositorio es
privado y debe seguir siéndolo.** Se sirve en Netlify con \`noindex\`, sin
referer y sin scripts (\`public/_headers\`).

Todo se hace desde \`asolache/teamtowershuma\` (skill \`propuesta-inicial\`,
«Enviar antes de la visita»):

\`\`\`bash
node SOS/tools/publica-lead.js ../leads/<negocio>/ ../teamtowers-leads/   # publicar
node SOS/tools/publica-lead.js --esborra <ref> ../teamtowers-leads/       # después de la visita
\`\`\`

Después, commit y push aquí. Aquí no van datos personales, ni importes, ni
nada que no sea la página revisada: la carpeta del lead (mapa, fuentes,
\`lead.json\`) se queda fuera.
`;

function inicia(desti) {
  if (L.dinsDelRepo(desti)) return { ok: false, falla: ['el repositori de les pàgines dels leads no pot ser dins d\'aquest, que és públic'] };
  for (const [f, cos] of Object.entries(BASE)) {
    const r = join(desti, f);
    mkdirSync(join(r, '..'), { recursive: true });
    writeFileSync(r, cos);
  }
  if (!existsSync(join(desti, 'README.md'))) writeFileSync(join(desti, 'README.md'), README);
  return { ok: true, fets: Object.keys(BASE) };
}

/* Abans de copiar-la, el que garanteix que és la pàgina que toca: la revisada
   (`revisat` a `lead.json`), amb la seva referència als botons, sense l'avís
   intern, i que torna a passar totes les comprovacions amb les fonts que hi
   ha a la carpeta. */
function publica(dir, desti) {
  const falla = [];
  if (L.dinsDelRepo(desti)) return { ok: false, falla: ['el repositori de les pàgines dels leads no pot ser dins d\'aquest, que és públic'] };
  if (!existsSync(join(desti, MARCA))) return { ok: false, falla: [desti + ' no és el repositori de les pàgines dels leads: la primera vegada, --inicia'] };
  let lj = null;
  try { lj = JSON.parse(readFileSync(join(dir, 'lead.json'), 'utf8')); } catch (e) { /* es diu a sota */ }
  if (!lj || !REF.test(lj.ref || '')) return { ok: false, falla: ['falta lead.json, o no porta la referència: fes la pàgina amb proposta.js --lead --revisat'] };
  if (!lj.revisat) falla.push('lead.json diu que la pàgina no s\'ha revisat: proposta.js --lead --revisat');
  const fHtml = join(dir, 'lead.html');
  if (!existsSync(fHtml)) return { ok: false, falla: falla.concat('falta lead.html: proposta.js --lead --revisat') };
  const html = readFileSync(fHtml, 'utf8');
  if (!html.includes(L.VISITA + '?r=' + lj.ref + '&amp;')) falla.push('lead.html no porta la referència de lead.json: torna a fer la pàgina');
  const fonts = existsSync(join(dir, 'fuentes')) ? A.llegeixCarpeta(join(dir, 'fuentes')) : [];
  falla.push(...L.comprova(html, { revisat: true, fonts }));
  if (falla.length) return { ok: false, falla };
  const f = join(desti, 'public', lj.ref, 'index.html');
  mkdirSync(join(f, '..'), { recursive: true });
  writeFileSync(f, html);
  return { ok: true, ref: lj.ref, fitxer: f };
}

function esborra(ref, desti) {
  if (!REF.test(ref || '')) return { ok: false, falla: ['«' + ref + '» no és una referència'] };
  if (!existsSync(join(desti, MARCA))) return { ok: false, falla: [desti + ' no és el repositori de les pàgines dels leads'] };
  const d = join(desti, 'public', ref);
  if (!existsSync(d)) return { ok: false, falla: ['no hi ha cap pàgina amb la referència ' + ref] };
  rmSync(d, { recursive: true, force: true });
  return { ok: true, ref };
}

module.exports = { inicia, publica, esborra, BASE };

if (require.main === module) {
  const US = 'Ús: node SOS/tools/publica-lead.js ../leads/<negoci>/ ../teamtowers-leads/ · --inicia ../teamtowers-leads/ · --esborra <ref> ../teamtowers-leads/';
  const a = process.argv.slice(2);
  const surt = (r, ok) => {
    if (r.ok) { console.log('✅ ' + ok(r)); process.exit(0); }
    console.error('❌ No s\'ha fet:\n' + r.falla.map(x => '  · ' + x).join('\n'));
    process.exit(4);
  };
  try {
    if (a[0] === '--inicia' && a.length === 2) surt(inicia(a[1]), r => 'Base escrita: ' + r.fets.join(', ') + '. Ara commit i push, i connecta el repositori al seu lloc de Netlify.');
    else if (a[0] === '--esborra' && a.length === 3) surt(esborra(a[1], a[2]), r => 'Esborrada ' + r.ref + '. Ara commit i push.');
    else if (a.length === 2 && !a.some(x => x.startsWith('-'))) surt(publica(a[0], a[1]), r => 'Publicada a ' + r.fitxer + ' (al lloc, /' + r.ref + '/). Ara commit i push, i apunta a Zoho «enviat» i la data.');
    else { console.error(US); process.exit(2); }
  } catch (e) { console.error('❌ ' + e.message); process.exit(1); }
}
