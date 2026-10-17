/* La pàgina per al lead · el x % del seu mapa abans de la visita
 * ─────────────────────────────────────────────────────────────
 * `proposta.js --lead` escriu `lead.html` amb la xifra d'`automatitza.js` i el
 * dibuix de la landing. Sense `--revisat` és un esborrany intern sense botó; amb
 * `--revisat`, només d'un `mapa.json` que passa. La pàgina no porta JavaScript
 * ni res de fora, i si porta un correu, un telèfon, un import o vuit paraules
 * seguides de la web, no s'escriu.
 *
 *   node SOS/tests/test-pagina-lead.mjs
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const DIR = dirname(fileURLToPath(import.meta.url)), TOOLS = join(DIR, '..', 'tools');
const req = createRequire(import.meta.url);
const L = req('../tools/pagina-lead.js'), X = req('../tools/automatitza.js');
let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log(`  ${c ? '✓' : '✗'} ${m}`); };

const WEB = `<!DOCTYPE html><html lang="ca"><head><title>Celler de Prova</title>
<meta name="description" content="Fem vins de vinyes velles i els expliquem a qui ve al poble a tastar-los.">
<style>body{font-family:Georgia,serif}h1{color:#7a1f3d}</style></head><body><h1>Celler de Prova</h1>
<p>Al celler rebem visitants cada dissabte i els expliquem com treballem la vinya vella del costat del riu.</p>
<p>Els distribuïdors fan la comanda per correu i el visitant compra a la botiga del poble.</p></body></html>`;
const ex = spawnSync(process.execPath, [join(TOOLS, 'revisa-mapa.js'), '--exemple'], { encoding: 'utf8' }).stdout;

const dir = mkdtempSync(join(tmpdir(), 'tt-lead-'));
mkdirSync(join(dir, 'fuentes'));
writeFileSync(join(dir, 'fuentes', 'index.html'), WEB);
const corre = (...x) => spawnSync(process.execPath, [join(TOOLS, 'proposta.js'), dir, '--llengua', 'ca', ...x], { encoding: 'utf8' });
const f = r => (existsSync(join(dir, r)) ? readFileSync(join(dir, r), 'utf8') : '');

console.log('\nL\'esborrany intern');
{
  const r = corre('--lead', '--revisat');
  ok(r.status === 4 && /mapa\.json/.test(r.stderr) && !f('lead.html'), 'amb --revisat i només l\'esbós, no s\'escriu: l\'esbós no s\'envia');
  const r2 = corre('--lead');
  const h = f('lead.html');
  ok(r2.status === 3 && /ESBORRANY INTERN/.test(h) && !h.includes(L.VISITA), 'sense --revisat: diu ESBORRANY INTERN i no porta botó');
  ok(/Estimació · esborrany/.test(h) && /un esbós del mapa, sense cap model d'IA/.test(h), 'de l\'esbós: el segell d\'estimació, i «com s\'ha fet» diu que no hi ha cap model');
}

console.log('\nLa pàgina revisada');
writeFileSync(join(dir, 'mapa.json'), ex);
{
  const r = corre('--lead', '--revisat');
  const h = f('lead.html'), aut = X.mesura(JSON.parse(ex));
  ok(r.status === 0 && h && !/ESBORRANY INTERN/.test(h), 'amb mapa.json que passa i --revisat: la pàgina, sense l\'avís intern');
  ok(h.includes(`Dels ${aut.total} lliuraments de la teva xarxa, el sistema en pot preparar ${aut.maquina}; ${aut.visita} els decidim a la visita.`),
    `la xifra és la d'automatitza.js: ${aut.maquina} de ${aut.total}, ${aut.visita} a la visita`);
  const ref = JSON.parse(f('lead.json')).ref;
  ok(/^[A-Za-z0-9_-]{16}$/.test(ref) && h.includes(L.VISITA + '?r=' + ref + '&amp;l=ca&amp;m=si') && h.includes('&amp;m=no'), 'els dos botons van a /visita/ amb la referència aleatòria de la pàgina');
  corre('--lead', '--revisat');
  ok(JSON.parse(f('lead.json')).ref === ref, 'regenerar-la no canvia l\'enllaç');
  ok((h.match(/<path class="mv-f"[^>]*data-qui="maquina"/g) || []).length === aut.maquina && /\.mv-f\[data-qui=maquina\]\{stroke-width/.test(h), 'el mapa dibuixat, amb les fletxes de la màquina marcades');
  ok(['t-sistema', 't-teu', 't-visita', 't-com'].every(id => h.includes(`id="${id}"`)) && /Factura o cobrament|Comanda o repartiment/.test(h), 'les seccions: el que prepara el sistema (amb el tipus), el que és teu, la visita i com s\'ha fet');
  ok(/<h3>Tres preguntes per a la visita<\/h3>\n<ol>(<li>[^<]+<\/li>){3}<\/ol>/.test(h), 'les tres preguntes més greus del diagnòstic');
  ok(/Claude va escriure el mapa/.test(h) && /el va revisar abans d'enviar-te'l/.test(h) && /no crida cap model d'IA i no compta visites ni clics/.test(h)
    && h.includes('https://teamtowershuma.com/SOS/ia.html') && h.includes('avis-legal.html#navegador'), '«com s\'ha fet»: el que ha fet la IA, que la pàgina no crida cap model ni compta res, i els enllaços');
  ok(/<details>\n<summary>Continua amb el teu Claude<\/summary>/.test(h) && h.includes('&quot;abast&quot;'), 'el bloc per continuar amb el seu Claude, amb el mapa');
  ok(L.comprova(h, { revisat: true, fonts: [{ nom: 'index.html', cos: WEB }] }).length === 0, 'la pàgina que surt passa les seves pròpies comprovacions');
}

console.log('\nEl que fa que no s\'escrigui');
{
  const h = f('lead.html'), fonts = [{ nom: 'index.html', cos: WEB }];
  const amb = x => h.replace('</main>', '<p>' + x + '</p></main>');
  ok(L.comprova(h.replace('</body>', '<script>x()</script></body>'), { revisat: true }).some(x => /script/.test(x)), 'un <script>');
  ok(L.comprova(h.replace('<body>', '<body><img src="https://pixel.example/x.gif">'), { revisat: true }).some(x => /carrega/.test(x)), 'una imatge de fora (un píxel)');
  ok(L.comprova(h.replace('</style>', 'b{background:url(https://x.example/a.png)}</style>'), { revisat: true }).some(x => /url\(\)/.test(x)), 'un url() de fora al CSS');
  ok(L.comprova(amb('escriu a hola@celler.example'), { revisat: true }).some(x => /correu/.test(x)), 'un correu');
  ok(L.comprova(amb('truca al 600 111 222'), { revisat: true }).some(x => /telèfon/.test(x)), 'un telèfon');
  ok(L.comprova(amb('la visita val 25 €'), { revisat: true }).some(x => /import/.test(x)), 'un import');
  ok(L.comprova(amb('rebem visitants cada dissabte i els expliquem com treballem'), { revisat: true, fonts }).some(x => /cita la web/.test(x)), 'vuit paraules seguides de la web');
  ok(L.comprova(h.replace('<meta name="robots" content="noindex, nofollow">', ''), { revisat: true }).some(x => /noindex/.test(x)), 'sense noindex');
  writeFileSync(join(dir, 'marca.json'), JSON.stringify({ lema: 'x' }));
  const m = JSON.parse(ex); m.parells[0] = m.parells[0].replace('el vi, la verema i el celler obert', 'escriu a vi@celler.example');
  writeFileSync(join(dir, 'mapa.json'), JSON.stringify(m));
  const r = corre('--lead', '--revisat');
  ok(r.status === 4 && /correu/.test(r.stderr) && !existsSync(join(dir, 'lead.html')), 'si no passa, no s\'escriu i la d\'abans s\'esborra');
  writeFileSync(join(dir, 'mapa.json'), ex);
}

console.log('\nEn castellà');
{
  const corre2 = (...x) => spawnSync(process.execPath, [join(TOOLS, 'proposta.js'), dir, '--llengua', 'es', ...x], { encoding: 'utf8' });
  const r = corre2('--lead', '--revisat');
  ok(r.status === 4 && /preguntas-visita\.md/.test(r.stderr), 'revisada en castellà, demana preguntas-visita.md: les del diagnòstic surten en català');
  writeFileSync(join(dir, 'preguntas-visita.md'), '# Preguntas\n\n1. ¿Quién confirma las visitas?\n2. ¿Qué pide el distribuidor cada mes?\n3. ¿Qué cuenta el pueblo de vosotros?\n4. Sobra\n');
  const r2 = corre2('--lead', '--revisat'), h = f('lead.html');
  ok(r2.status === 0 && /<html lang="es">/.test(h) && /el sistema puede preparar/.test(h) && /Pedido o reparto/.test(h) && /Reservemos la visita/.test(h), 'la pàgina en castellà, amb els tipus en castellà');
  ok(/<li>¿Quién confirma las visitas\?<\/li>/.test(h) && !/Sobra/.test(h), 'les preguntes de qui revisa, tres com a màxim');
  ok(X.ENTREGABLES.every(t => L.TIPUS_ES[t.id]), 'cada tipus d\'entregable de l\'app té nom en castellà');
}

rmSync(dir, { recursive: true, force: true });
console.log(`\n${fail ? '❌' : '✅'} ${pass + fail} assercions, ${fail} vermelles`);
process.exit(fail ? 1 : 0);
