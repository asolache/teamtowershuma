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

console.log(fails ? `\n❌ ${fails} cas${fails === 1 ? '' : 'os'} on la guarda no ha fet el que promet.`
  : '\n✅ La guarda peta quan toca, i només llavors.');
process.exit(fails ? 1 : 0);
