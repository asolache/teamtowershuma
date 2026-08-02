#!/usr/bin/env node
/* Comprovació de sintaxi dels HTML autocontinguts.
   El SOS és un sol fitxer amb tot el codi a dins: un error de sintaxi no el
   detecta cap linter de projecte, i el navegador simplement no arrenca —
   `window.__SOS` no existeix i tota la pàgina queda en blanc. Fins ara la CI
   passava en verd igualment. Aquí s'extreu cada bloc <script> i es passa pel
   comprovador de sintaxi de Node. Falla amb codi 1 si algun no compila. */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const os = require('os');

const FILES = process.argv.slice(2);
if (!FILES.length) { console.error('ús: check-syntax.js <fitxer.html> [...]'); process.exit(2); }

const RE = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
let checked = 0, failed = 0;

for (const file of FILES) {
  if (!fs.existsSync(file)) { console.error('✗ no existeix: ' + file); failed++; continue; }
  const html = fs.readFileSync(file, 'utf8');
  let m, i = 0;
  while ((m = RE.exec(html)) !== null) {
    const attrs = m[1] || '', body = m[2] || '';
    i++;
    if (/\bsrc\s*=/.test(attrs)) continue;                    // script extern, res a comprovar
    if (/type\s*=\s*["'](?!text\/javascript|module|application\/javascript)/i.test(attrs)) continue; // JSON-LD i companyia
    if (!body.trim()) continue;
    const isModule = /type\s*=\s*["']module["']/i.test(attrs);
    const tmp = path.join(os.tmpdir(), 'sos-syntax-' + process.pid + '-' + i + (isModule ? '.mjs' : '.js'));
    fs.writeFileSync(tmp, body);
    try {
      execFileSync(process.execPath, ['--check', tmp], { stdio: ['ignore', 'ignore', 'pipe'] });
      checked++;
    } catch (e) {
      failed++;
      const out = (e.stderr || '').toString().split('\n').filter(l => l.trim()).slice(0, 6).join('\n');
      console.error('✗ ' + file + ' · <script> #' + i + (isModule ? ' (module)' : '') + '\n' + out);
    } finally { try { fs.unlinkSync(tmp); } catch (e2) {} }
  }
}

if (failed) { console.error('\n✗ ' + failed + ' bloc(s) amb error de sintaxi'); process.exit(1); }
console.log('✓ ' + checked + ' bloc(s) de script sense errors de sintaxi');
