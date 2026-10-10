#!/usr/bin/env node
// Generat des de SOS/vna-suport.html (repositori asolache/teamtowershuma). No s'edita a mà: es refà amb node eines/genera.mjs.
// Fa la web del mapa i la deixa a l'arrel. Netlify l'executa a cada publicació; en local, amb Node 18 o més.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { genera, EXEMPLE } from './motor.mjs';
const arrel = new URL('../', import.meta.url), e = process.env, hi = r => existsSync(new URL(r, arrel));
const llegeix = r => (hi(r) ? JSON.parse(readFileSync(new URL(r, arrel), 'utf8')) : null);
/* El que és del repositori i la web no genera: els continguts, el que s'ha importat, el dossier i els esborranys. */
const sota = d => (hi(d) ? readdirSync(new URL(d, arrel), { withFileTypes: true }).map(x => (x.isDirectory() ? sota(d + x.name + '/') : /\.(md|json)$/.test(x.name) ? [d + x.name] : [])).reduce((a, b) => a.concat(b), []).sort() : []);
const repo = ['cerebro/continguts/', 'cerebro/fonts/', 'cerebro/esborranys/'].map(sota).reduce((a, b) => a.concat(b), [])
  .concat(hi('cerebro/dossier.md') ? ['cerebro/dossier.md'] : []).map(ruta => ({ ruta, cos: readFileSync(new URL(ruta, arrel), 'utf8') }));
const continguts = repo.filter(f => /^cerebro\/continguts\/[^/]+\.md$/.test(f.ruta)).map(f => ({ id: f.ruta.slice(19, -3), text: f.cos }));
let mapa = llegeix('cerebro/mapa-real.json'), font = 'cerebro/mapa-real.json';
if (!mapa && e.TT_MAPA) { mapa = JSON.parse(inflateRawSync(Buffer.from(e.TT_MAPA, 'base64url')).toString('utf8')); font = 'TT_MAPA'; }
if (!mapa) {
  mapa = EXEMPLE; font = 'l\'exemple del celler';
  if (!e.NETLIFY) console.warn('⚠️  Falta cerebro/mapa-real.json: surt la web de l\'exemple. Desa-hi el JSON de l\'editor del mapa («Copia el JSON»).');
}
const ideal = llegeix('cerebro/mapa-ideal.json');
if (ideal) mapa = Object.assign({}, mapa, { ideal });
let casa;
try { casa = e.TT_CASA ? JSON.parse(e.TT_CASA) : undefined; } catch (x) { casa = undefined; }
const fitxers = await genera(mapa, { nom: e.TT_NOM, correu: e.TT_CORREU, llengua: e.TT_LLENGUA, url: e.TT_URL || e.URL, casa: Array.isArray(casa) ? casa : undefined, continguts, repo, avisa: m => console.warn('⚠️  ' + m) });
/* El que és del repositori no es trepitja: la configuració, el mapa, les decisions i el que s'escriu (dossier, fonts, continguts, esborranys). */
const propis = ['netlify.toml', 'cerebro/mapa-real.json', 'cerebro/mapa-ideal.json', 'cerebro/decisiones.md', 'cerebro/dossier.md'];
const escrit = r => /^cerebro\/(fonts|continguts|esborranys)\//.test(r);
let n = 0;
for (const f of fitxers) {
  const u = new URL(f.ruta, arrel);
  if ((propis.includes(f.ruta) || escrit(f.ruta)) && existsSync(u)) continue;
  mkdirSync(new URL('.', u), { recursive: true });
  writeFileSync(u, f.cos);
  n++;
}
console.log('✅ ' + n + ' fitxers, des de ' + font + (continguts.length ? ', amb ' + continguts.length + ' continguts' : ''));
