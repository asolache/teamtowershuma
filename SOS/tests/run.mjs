/* Passa tots els tests i en resumeix el resultat.
   Ús:  node SOS/tests/run.mjs            · tots
        node SOS/tests/run.mjs vistiplau  · només els que continguin «vistiplau»

   Cada test obre l'app amb Playwright sobre `file://`, així que no cal servidor
   ni instal·lar res més enllà de playwright + chromium. */
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const filter = process.argv[2] || '';
const files = readdirSync(here).filter(f => /^test-.*\.mjs$/.test(f) && f.includes(filter)).sort();

if (!files.length) { console.log('Cap test coincideix amb «' + filter + '»'); process.exit(1); }

const run = f => new Promise(res => {
  const p = spawn(process.execPath, [join(here, f)], { stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '';
  p.stdout.on('data', d => out += d);
  p.stderr.on('data', d => out += d);
  p.on('close', code => res({ f, code, out }));
});

const results = [];
for (const f of files) {
  process.stdout.write('· ' + f.padEnd(26));
  const r = await run(f);
  const last = r.out.trim().split('\n').filter(Boolean).pop() || '';
  console.log(r.code === 0 ? last : '❌ ' + last);
  results.push(r);
}
const bad = results.filter(r => r.code !== 0);
console.log('\n' + (bad.length
  ? '❌ ' + bad.length + ' de ' + results.length + ' fitxers amb errors: ' + bad.map(r => r.f).join(', ')
  : '✅ ' + results.length + ' fitxers, tots verds'));
if (bad.length) { console.log('\n--- detall del primer que falla ---\n' + bad[0].out); }
process.exit(bad.length ? 1 : 0);
