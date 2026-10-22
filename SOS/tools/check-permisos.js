#!/usr/bin/env node
/* Guarda dels permisos · cap taula de `public` sense GRANT explícit
   ─────────────────────────────────────────────────────────────────────────
   Des del 30/10/2026 Supabase deixa de donar permisos per defecte a les
   taules i vistes noves de `public`. Una taula creada sense GRANT funciona
   a la base vella i queda muda a la nova: ni el navegador ni les funcions
   amb la clau de servei la veuen, i no avisa ningú.

   La regla: tota taula o vista que es crea a SOS/sql/*.sql porta, al mateix
   conjunt de fitxers, un `grant … to service_role` i una decisió per a qui
   la llegeix: un `grant … to anon` / `authenticated`, o el comentari
   «-- sense accés públic: <taula>» si només la toca el servidor.

   Ús:  node SOS/tools/check-permisos.js [carpeta]
*/
const fs = require('fs');
const path = require('path');

const carpeta = process.argv[2] || path.join(__dirname, '..', 'sql');
const nom = s => s.replace(/"/g, '').trim().replace(/^public\./, '');
const creades = new Map();
const permisos = new Map();
const dona = (t, rol) => { if (!permisos.has(t)) permisos.set(t, new Set()); permisos.get(t).add(rol); };

for (const f of fs.readdirSync(carpeta).filter(x => x.endsWith('.sql')).sort()) {
  const text = fs.readFileSync(path.join(carpeta, f), 'utf8');
  for (const m of text.matchAll(/--\s*sense accés públic:\s*([\w.]+)/gi)) dona(nom(m[1]), 'public');
  const sql = text.replace(/--[^\n]*/g, '');
  for (const m of sql.matchAll(/create\s+(?:or\s+replace\s+)?(?:materialized\s+)?(table|view)\s+(?:if\s+not\s+exists\s+)?public\.("?\w+"?)/gi)) {
    if (!creades.has(nom(m[2]))) creades.set(nom(m[2]), f);
  }
  for (const m of sql.matchAll(/\bgrant\s+[\w\s,]+?\s+on\s+(?!function|all\s|schema|sequence)(?:table\s+)?([\w.",\s]+?)\s+to\s+([\w\s,]+?);/gi)) {
    for (const t of m[1].split(',').map(nom).filter(Boolean)) {
      for (const r of m[2].split(',').map(x => x.trim().toLowerCase())) dona(t, r === 'anon' || r === 'authenticated' ? 'public' : r);
    }
  }
}

const errors = [];
for (const [t, f] of creades) {
  const r = permisos.get(t) || new Set();
  if (!r.has('service_role')) errors.push(`${t} (${f}): falta «grant … on public.${t} to service_role»`);
  if (!r.has('public')) errors.push(`${t} (${f}): falta el grant a anon/authenticated o «-- sense accés públic: ${t}»`);
}
if (errors.length) {
  for (const e of errors) console.log(`::error::${e}`);
  console.log(`\n✗ ${errors.length} permís(os) sense escriure.\n`);
  process.exit(1);
}
console.log(`✓ Les ${creades.size} taules i vistes de SOS/sql porten els permisos escrits.`);
