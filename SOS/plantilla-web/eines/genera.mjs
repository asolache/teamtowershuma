#!/usr/bin/env node
// Generat per SOS/tools/build-plantilla.js des de SOS/vna-suport.html (repositori asolache/teamtowershuma). No s'edita a mà.
// Netlify l'executa a cada publicació: fa la web del mapa i la deixa a l'arrel.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { genera, EXEMPLE } from './motor.mjs';
const arrel = new URL('../', import.meta.url), e = process.env;
const llegeix = r => { const u = new URL(r, arrel); return existsSync(u) ? JSON.parse(readFileSync(u, 'utf8')) : null; };
let mapa = llegeix('cerebro/mapa-real.json'), font = 'cerebro/mapa-real.json';
if (!mapa && e.TT_MAPA) { mapa = JSON.parse(inflateRawSync(Buffer.from(e.TT_MAPA, 'base64url')).toString('utf8')); font = 'TT_MAPA'; }
if (!mapa) { mapa = EXEMPLE; font = 'l\'exemple del celler'; }
const ideal = llegeix('cerebro/mapa-ideal.json');
if (ideal) mapa = Object.assign({}, mapa, { ideal });
const fitxers = await genera(mapa, { nom: e.TT_NOM, correu: e.TT_CORREU, llengua: e.TT_LLENGUA, url: e.TT_URL || e.URL });
/* El que és del repositori no es trepitja: la configuració, el mapa i les decisions escrites a mà. */
const propis = ['netlify.toml', 'cerebro/mapa-real.json', 'cerebro/mapa-ideal.json', 'cerebro/decisiones.md'];
let n = 0;
for (const f of fitxers) {
  const u = new URL(f.ruta, arrel);
  if (propis.includes(f.ruta) && existsSync(u)) continue;
  mkdirSync(new URL('.', u), { recursive: true });
  writeFileSync(u, f.cos);
  n++;
}
console.log('✅ ' + n + ' fitxers, des de ' + font);
