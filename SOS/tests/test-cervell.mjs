/* L'eina del cervell · trencada a posta
 * ────────────────────────────────────────────────────────
 * Una guarda que no s'ha vist petar no és una guarda. Aquí s'instal·la la
 * plantilla del cervell en una carpeta temporal amb `--nou`, tal com ho faria
 * un projecte nou, es comprova que passa, i
 * després es trenca de cada manera que la guarda promet trobar: una carpeta
 * sense cara, una cita a un fitxer que no hi és, una funció que no existeix,
 * una afirmació negativa que deixa de ser certa i un mapa vell. Cadascuna ha
 * de fer petar `cervell.js --check`, i desfer-la l'ha de tornar a verd.
 *
 *   node SOS/tests/test-cervell.mjs
 */
import { cpSync, mkdtempSync, existsSync, rmSync, mkdirSync, writeFileSync, appendFileSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const DIR = dirname(fileURLToPath(import.meta.url));
const EINA = join(DIR, '..', 'tools', 'cervell.js');

let fails = 0;
/* Es prova l'eina instal·lada al projecte, no la del repositori: és la que el
   client tindrà, i ha de funcionar des de la seva carpeta sense res nostre. */
const INSTAL = arrel => join(arrel, 'guardas', 'cervell.js');
const comprova = arrel => spawnSync(process.execPath, [INSTAL(arrel), '--arrel', arrel, '--check'], { encoding: 'utf8' });
const cas = (nom, trenca, desfa) => {
  const arrel = mkdtempSync(join(tmpdir(), 'cervell-'));
  rmSync(arrel, { recursive: true });
  spawnSync(process.execPath, [EINA, '--nou', arrel, '--nom', 'prova'], { encoding: 'utf8' });
  spawnSync(process.execPath, [INSTAL(arrel), '--arrel', arrel], { encoding: 'utf8' });
  const abans = comprova(arrel);
  trenca(arrel);
  const durant = comprova(arrel);
  /* Desfer pot afegir un fitxer (la funció que faltava), i això mou el recompte
     del mapa: es regenera, que és el que faria qui arregla el problema. */
  if (desfa) { desfa(arrel); spawnSync(process.execPath, [INSTAL(arrel), '--arrel', arrel], { encoding: 'utf8' }); }
  const despres = desfa ? comprova(arrel) : { status: 0 };
  rmSync(arrel, { recursive: true, force: true });
  const bo = abans.status === 0 && durant.status === 1 && despres.status === 0;
  if (!bo) fails++;
  console.log(`  ${bo ? '✓' : '✗'} ${nom}` + (bo ? '' : `  (abans ${abans.status}, trencat ${durant.status}, desfet ${despres.status})\n${abans.stdout}${durant.stdout}`));
};

console.log('\nL\'eina del cervell · trencada a posta');
{
  const arrel = mkdtempSync(join(tmpdir(), 'cervell-'));
  rmSync(arrel, { recursive: true });
  spawnSync(process.execPath, [EINA, '--nou', arrel], { encoding: 'utf8' });
  const torna = spawnSync(process.execPath, [EINA, '--nou', arrel], { encoding: 'utf8' });
  const bo = existsSync(join(arrel, 'guardas', 'cervell.js')) && torna.status === 1;
  if (!bo) fails++;
  console.log(`  ${bo ? '✓' : '✗'} --nou instal·la l'eina amb la plantilla i no trepitja un cervell que ja hi és`);
  rmSync(arrel, { recursive: true, force: true });
}
cas('una carpeta sense cara peta', a => mkdirSync(join(a, 'nova')), a => rmSync(join(a, 'nova'), { recursive: true }));
cas('una cita a un fitxer que no hi és peta',
  a => appendFileSync(join(a, 'saber', 'para-la-ia.md'), '\nVer `saber/no-existe.md`.\n'));
cas('una cita al que git ignora no peta; sense el .gitignore, sí',
  a => appendFileSync(join(a, 'saber', 'para-la-ia.md'), '\nLos contactos van a `privat/`.\n'),
  a => writeFileSync(join(a, '.gitignore'), 'privat/\n'));
cas('una funció citada que cap codi defineix peta',
  a => appendFileSync(join(a, 'saber', 'codex.md'), '\nTodo pasa por `funcionInventada()`.\n'),
  a => writeFileSync(join(a, 'guardas', 'x.js'), 'function funcionInventada() {}\n'));
cas('una afirmació negativa que deixa de ser certa peta',
  a => mkdirSync(join(a, 'misc')), a => rmSync(join(a, 'misc'), { recursive: true }));
cas('un mapa editat a mà peta', a => appendFileSync(join(a, 'saber', 'MAPA.md'), '\nuna línia a mà\n'));
cas('una pàgina del cervell editada a mà peta', a => appendFileSync(join(a, 'saber', 'cervell.html'), '<!-- a mà -->\n'));
cas('una veda nova sense regenerar la pàgina peta',
  a => appendFileSync(join(a, 'saber', 'codex.md'), '\n## Veda 4 — Una de nova\n\nText.\n'));
cas('una peça del cervell que falta peta', a => rmSync(join(a, 'saber', 'backlog.md')));
cas('un idioma sense textos peta', a => {
  const p = join(a, 'cervell.json'), c = JSON.parse(readFileSync(p, 'utf8'));
  writeFileSync(p, JSON.stringify({ ...c, idioma: 'xx' }));
});

/* El seguiment: --actualitza torna l'herència a com és avui i no toca el que
   és del projecte. */
{
  const arrel = mkdtempSync(join(tmpdir(), 'cervell-'));
  rmSync(arrel, { recursive: true });
  spawnSync(process.execPath, [EINA, '--nou', arrel], { encoding: 'utf8' });
  const her = join(arrel, 'saber', 'vedas-heredadas.md'), propi = join(arrel, 'saber', 'codex.md');
  const original = readFileSync(her, 'utf8');
  writeFileSync(her, 'tocat a mà\n');
  appendFileSync(propi, '\n## Veda 4 — Una de pròpia\n');
  const propiAbans = readFileSync(propi, 'utf8');
  const r = spawnSync(process.execPath, [EINA, '--actualitza', arrel], { encoding: 'utf8' });
  const bo = r.status === 0 && readFileSync(her, 'utf8') === original && readFileSync(propi, 'utf8') === propiAbans
    && /### Veda 161/.test(original) && existsSync(join(arrel, '.claude', 'skills', 'mapa-de-valor', 'SKILL.md'));
  if (!bo) fails++;
  console.log(`  ${bo ? '✓' : '✗'} --actualitza porta l'herència d'avui (vedes, skill) i no toca les vedes pròpies`);
  rmSync(arrel, { recursive: true, force: true });
}

/* La propuesta inicial, de punta a punta al projecte del client i sense res
   nostre: l'editor heretat revisa el mapa d'exemple, un mapa amb una regla dura
   oberta queda aturat, i la web surt del mapa. */
{
  const arrel = mkdtempSync(join(tmpdir(), 'cervell-'));
  rmSync(arrel, { recursive: true });
  spawnSync(process.execPath, [EINA, '--nou', arrel], { encoding: 'utf8' });
  const eina = f => join(arrel, 'herramientas', 'tools', f);
  const ex = spawnSync(process.execPath, [eina('revisa-mapa.js'), '--exemple'], { encoding: 'utf8' });
  const mapa = join(arrel, 'mapa.json'), mal = join(arrel, 'mal.json');
  writeFileSync(mapa, ex.stdout);
  const o = JSON.parse(ex.stdout); o.parells[0] = o.parells[0].split('|').slice(0, 4).join('|') + '|  | ';
  writeFileSync(mal, JSON.stringify(o));
  const bo1 = spawnSync(process.execPath, [eina('revisa-mapa.js'), mapa], { encoding: 'utf8' }).status === 0;
  const bo2 = spawnSync(process.execPath, [eina('revisa-mapa.js'), mal], { encoding: 'utf8' }).status === 1;
  const w = spawnSync(process.execPath, [eina('web-del-mapa.js'), mapa, join(arrel, 'web'), '--llengua', 'es'], { encoding: 'utf8' });
  const bo3 = w.status === 0 && existsSync(join(arrel, 'web', 'index.html')) && existsSync(join(arrel, 'web', 'permaweb.json'));
  /* I l'ordre sencer, amb les eines heretades: de les fonts a l'esbós, i del
     mapa revisat a la web per lliurar. */
  const prop = join(arrel, 'propuesta');
  mkdirSync(join(prop, 'fuentes'), { recursive: true });
  writeFileSync(join(prop, 'fuentes', 'web.md'), '# El celler\n\nFem vins i els expliquem als visitants que vénen al poble. Els restaurants ens demanen el vi.');
  const p1 = spawnSync(process.execPath, [eina('proposta.js'), prop], { encoding: 'utf8' }).status;
  writeFileSync(join(prop, 'mapa.json'), ex.stdout);
  const p2 = spawnSync(process.execPath, [eina('proposta.js'), prop], { encoding: 'utf8' }).status;
  const bo4 = p1 === 3 && p2 === 0 && existsSync(join(prop, 'analisis.md')) && existsSync(join(prop, 'web', 'index.html')) && existsSync(join(prop, 'README.md'))
    && /href="herramientas\/vna-suport\.html"/.test(readFileSync(join(arrel, 'EMPIEZA-AQUI.html'), 'utf8')) && /href="propuesta\/web\/estil\.css"/.test(readFileSync(join(arrel, 'EMPIEZA-AQUI.html'), 'utf8'))
;
  const bo = bo1 && bo2 && bo3 && bo4;
  if (!bo) fails++;
  console.log(`  ${bo ? '✓' : '✗'} al client, el mapa es revisa amb les regles de la casa, s'atura si en trenca una de dura, en surt la web, i proposta.js va de les fonts a l'esbós, del mapa a la web i deixa EMPIEZA-AQUI.html (el backoffice) a l'arrel`);
  rmSync(arrel, { recursive: true, force: true });
}

/* El zip de la web ja és el repositori del client, amb `cerebro/`. Instal·lar-hi
   el cervell no pot fer petar la primera comprovació per una carpeta nostra. */
{
  const arrel = mkdtempSync(join(tmpdir(), 'cervell-zip-'));
  const ex = spawnSync(process.execPath, [join(DIR, '..', 'tools', 'revisa-mapa.js'), '--exemple'], { encoding: 'utf8' }).stdout;
  writeFileSync(join(arrel, 'mapa.json'), ex);
  spawnSync(process.execPath, [join(DIR, '..', 'tools', 'web-del-mapa.js'), join(arrel, 'mapa.json'), join(arrel, 'web')], { encoding: 'utf8' });
  const web = join(arrel, 'web');
  spawnSync(process.execPath, [EINA, '--nou', web, '--nom', 'El celler'], { encoding: 'utf8' });
  spawnSync(process.execPath, [INSTAL(web), '--arrel', web], { encoding: 'utf8' });
  const bo = comprova(web).status === 0 && /^- `cerebro`/m.test(readFileSync(join(web, 'saber', 'taxonomia.md'), 'utf8'));
  if (!bo) fails++;
  console.log(`  ${bo ? '✓' : '✗'} el cervell s'instal·la sobre el zip de la web, i declara sol les carpetes que hi porta (cerebro, eines, netlify)`);
  rmSync(arrel, { recursive: true, force: true });
}

/* El sedàs de l'herència: una casa de prova amb una veda heretable que porta un
   import ha de quedar aturada, i sense l'import ha de passar. */
{
  const casa = mkdtempSync(join(tmpdir(), 'casa-'));
  const SOS = join(casa, 'SOS');
  mkdirSync(join(SOS, 'tools'), { recursive: true });
  cpSync(join(DIR, '..', 'knowledge', 'cervell'), join(SOS, 'knowledge', 'cervell'), { recursive: true });
  cpSync(EINA, join(SOS, 'tools', 'cervell.js'));
  writeFileSync(join(SOS, 'knowledge', 'cervell', 'heretat.json'), JSON.stringify({
    font: 'https://exemple.org/', sedas: ['\\d[\\d.,]*\\s?€'], vedes: { Prova: [1] }, fitxers: {}
  }));
  const instal = text => {
    writeFileSync(join(SOS, 'knowledge', 'codex.md'), `## Veda 1 — Una\n\n${text}\n`);
    const d = join(casa, 'client-' + Math.random().toString(36).slice(2));
    return spawnSync(process.execPath, [join(SOS, 'tools', 'cervell.js'), '--nou', d], { encoding: 'utf8' }).status;
  };
  const bo = instal('Costa 4.000 € i prou.') === 1 && instal('No diu cap import.') === 0;
  if (!bo) fails++;
  console.log(`  ${bo ? '✓' : '✗'} el sedàs atura una herència que porta un import, i deixa passar la que no`);
  rmSync(casa, { recursive: true, force: true });
}

/* La pujada: un fill amb una veda pròpia, una amb un import i un producte
   declarat. La neta es proposa amb el text, la de l'import surt sense text,
   les de la plantilla no es proposen, i una adoptada no torna a proposar-se. */
{
  const casa = mkdtempSync(join(tmpdir(), 'casa-'));
  const SOS = join(casa, 'SOS');
  mkdirSync(join(SOS, 'tools'), { recursive: true });
  cpSync(join(DIR, '..', 'knowledge', 'cervell'), join(SOS, 'knowledge', 'cervell'), { recursive: true });
  rmSync(join(SOS, 'knowledge', 'cervell', 'pujades.json'), { force: true });
  cpSync(EINA, join(SOS, 'tools', 'cervell.js'));
  const fill = join(casa, 'fill');
  spawnSync(process.execPath, [EINA, '--nou', fill, '--nom', 'Fill'], { encoding: 'utf8' });
  const conf = JSON.parse(readFileSync(join(fill, 'cervell.json'), 'utf8'));
  writeFileSync(join(fill, 'cervell.json'), JSON.stringify({ ...conf, productes: 'saber/productos.md' }));
  appendFileSync(join(fill, 'saber', 'codex.md'), '\n## Veda 4 — El proveedor mantiene su ficha\n\nCada partner corrige sus datos.\n\n## Veda 5 — La tarifa\n\nCuesta 120 € la hora.\n');
  writeFileSync(join(fill, 'saber', 'productos.md'), '# Productos\n\n## Producto — Tablero de mando\n\nZoho y el correo en una pantalla.\n');
  const recull = () => spawnSync(process.execPath, [join(SOS, 'tools', 'cervell.js'), '--recull', fill], { encoding: 'utf8' });
  const r1 = recull();
  const md = () => readFileSync(join(SOS, 'knowledge', 'cervell', 'pujades.md'), 'utf8');
  const m1 = md();
  const REG = join(SOS, 'knowledge', 'cervell', 'pujades.json');
  const reg = JSON.parse(readFileSync(REG, 'utf8'));
  reg.Fill['veda 4'].estat = 'adoptada 999';
  writeFileSync(REG, JSON.stringify(reg));
  const r2 = recull();
  const m2 = md();
  const bo = r1.status === 0 && r2.status === 0
    && m1.includes('Cada partner corrige sus datos.') && m1.includes('Aturada pel sedàs') && !m1.includes('120 €')
    && m1.includes('producte Tablero de mando') && !m1.includes('Siempre hay un backlog')
    && m2.includes('veda 4 — El proveedor mantiene su ficha · adoptada 999') && !m2.includes('Cada partner corrige sus datos.')
    && spawnSync(process.execPath, [join(SOS, 'tools', 'cervell.js'), '--recull', casa], { encoding: 'utf8' }).status === 1;
  if (!bo) fails++;
  console.log(`  ${bo ? '✓' : '✗'} la pujada proposa les vedes i els productes nous d'un fill, passa el sedàs i no repeteix les adoptades`);
  if (!bo) console.log(r1.stdout + r2.stdout + m2);

  /* El mateix fill, ara privat: del que ja s'havia pujat només queda el
     número i l'estat, i un producte nou no hi deixa el nom. */
  writeFileSync(join(fill, 'cervell.json'), JSON.stringify({ ...conf, productes: 'saber/productos.md', privat: true }));
  appendFileSync(join(fill, 'saber', 'productos.md'), '\n## Producto — Liquidaciones por partner\n\nCada uno cobra lo suyo.\n');
  const r3 = recull(), m3 = md(), j3 = readFileSync(REG, 'utf8');
  const priv = r3.status === 0 && m3.includes('### veda 5 · proposada') && m3.includes('Ve d\'un projecte privat')
    && !m3.includes('El proveedor mantiene su ficha') && !m3.includes('La tarifa') && !m3.includes('Liquidaciones')
    && !j3.includes('El proveedor mantiene su ficha') && !j3.includes('Liquidaciones') && /producte privat [0-9a-f]{8}/.test(j3);
  if (!priv) fails++;
  console.log(`  ${priv ? '✓' : '✗'} d'un fill privat només puja el número: ni títol, ni text, ni el nom d'un producte nou`);
  if (!priv) console.log(r3.stdout + m3);
  rmSync(casa, { recursive: true, force: true });
}

/* Els serveis s'enllacen (veda 169): un fill tria els que fa servir i rep
   només els seus enllaços; un que la matriu no té, o un que enllaça un fitxer
   que no hi és, atura l'herència. */
{
  const casa = mkdtempSync(join(tmpdir(), 'casa-'));
  const fill = join(casa, 'fill');
  spawnSync(process.execPath, [EINA, '--nou', fill, '--nom', 'Fill'], { encoding: 'utf8' });
  const conf = JSON.parse(readFileSync(join(fill, 'cervell.json'), 'utf8'));
  const tots = readFileSync(join(fill, 'saber', 'servicios.md'), 'utf8');
  const usa = ids => {
    writeFileSync(join(fill, 'cervell.json'), JSON.stringify({ ...conf, serveis: { usa: ids } }));
    return spawnSync(process.execPath, [EINA, '--actualitza', fill], { encoding: 'utf8' }).status;
  };
  const r1 = usa(['crm']), un = readFileSync(join(fill, 'saber', 'servicios.md'), 'utf8');
  const r2 = usa(['inventat']);
  const SOS = join(casa, 'SOS');
  mkdirSync(join(SOS, 'tools'), { recursive: true });
  cpSync(join(DIR, '..', 'knowledge', 'cervell'), join(SOS, 'knowledge', 'cervell'), { recursive: true });
  cpSync(join(DIR, '..', 'knowledge', 'codex.md'), join(SOS, 'knowledge', 'codex.md'));
  cpSync(join(DIR, '..', '..', 'conecta'), join(casa, 'conecta'), { recursive: true });
  cpSync(EINA, join(SOS, 'tools', 'cervell.js'));
  const H = JSON.parse(readFileSync(join(SOS, 'knowledge', 'cervell', 'heretat.json'), 'utf8'));
  H.fitxers = {};
  H.serveis.llista = [{ ...H.serveis.llista[0], path: 'SOS/no-hi-es.html' }];
  writeFileSync(join(SOS, 'knowledge', 'cervell', 'heretat.json'), JSON.stringify(H));
  const r3 = spawnSync(process.execPath, [join(SOS, 'tools', 'cervell.js'), '--nou', join(casa, 'altre')], { encoding: 'utf8' });
  const bo = tots.includes('## El CRM') && tots.includes('## El cerebro') && tots.includes('https://teamtowershuma.com/SOS/crm.html')
    && r1 === 0 && un.includes('## El CRM') && !un.includes('## El cerebro') && r2 === 1
    && r3.status === 1 && r3.stdout.includes('SOS/no-hi-es.html');
  if (!bo) fails++;
  console.log(`  ${bo ? '✓' : '✗'} els serveis arriben com a enllaços, el fill tria els seus, i un servei que no hi és atura l'herència`);
  if (!bo) console.log(r3.stdout);
  rmSync(casa, { recursive: true, force: true });
}

console.log(fails ? `\n❌ ${fails} cas${fails === 1 ? '' : 'os'} on la guarda no ha fet el que promet.`
  : '\n✅ La guarda peta quan toca, i només llavors.');
process.exit(fails ? 1 : 0);
