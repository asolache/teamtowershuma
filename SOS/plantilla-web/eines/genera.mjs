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
let mapa = llegeix('cerebro/mapa-real.json'), font = 'cerebro/mapa-real.json', exemple = false;
if (!mapa && e.TT_MAPA) { mapa = JSON.parse(inflateRawSync(Buffer.from(e.TT_MAPA, 'base64url')).toString('utf8')); font = 'TT_MAPA'; }
if (!mapa) {
  mapa = EXEMPLE; font = 'l\'exemple del celler'; exemple = true;
  if (!e.NETLIFY) console.warn('⚠️  Falta cerebro/mapa-real.json: surt la web de l\'exemple. Desa-hi el JSON de l\'editor del mapa («Copia el JSON»).');
}
const ideal = llegeix('cerebro/mapa-ideal.json');
if (ideal) mapa = Object.assign({}, mapa, { ideal });
/* El que es va triar a l'editor i la marca viatgen amb el repositori: sense llegir-los, refer la web la tornava al català, al rol que més lliura i sense marca. Les variables TT_* hi passen per sobre. */
const prova = r => { try { return llegeix(r); } catch (x) { console.warn('⚠️  ' + r + ' no és JSON vàlid: no es fa servir.'); return null; } };
const conf = prova('cerebro/configuracio.json') || {}, marca = prova('cerebro/marca.json');
if (marca && marca.logo === '../logo.svg' && hi('logo.svg')) marca.logoSvg = readFileSync(new URL('logo.svg', arrel), 'utf8');
let casa;
try { casa = e.TT_CASA ? JSON.parse(e.TT_CASA) : conf.casa; } catch (x) { casa = conf.casa; }
const fitxers = await genera(mapa, { nom: e.TT_NOM || conf.nom, correu: e.TT_CORREU || conf.correu, llengua: e.TT_LLENGUA || conf.llengua, url: e.TT_URL || conf.url || e.URL, casa: Array.isArray(casa) ? casa : undefined, marca: marca || undefined, continguts, repo, avisa: m => console.warn('⚠️  ' + m) });
/* El que és del repositori no es trepitja: la configuració, el mapa, les decisions i el que s'escriu (dossier, fonts, continguts, esborranys). */
const propis = ['netlify.toml', 'cerebro/mapa-real.json', 'cerebro/mapa-ideal.json', 'cerebro/decisiones.md', 'cerebro/dossier.md'];
const escrit = r => /^cerebro\/(fonts|continguts|esborranys)\//.test(r);
let n = 0;
for (const f of fitxers) {
  const u = new URL(f.ruta, arrel);
  if ((propis.includes(f.ruta) || escrit(f.ruta)) && existsSync(u)) continue;
  if (exemple && /^cerebro\/mapa-(real|ideal)\.json$/.test(f.ruta)) continue; // l'exemple no es desa com a mapa del client
  mkdirSync(new URL('.', u), { recursive: true });
  writeFileSync(u, f.cos);
  n++;
}
console.log('✅ ' + n + ' fitxers, des de ' + font + (continguts.length ? ', amb ' + continguts.length + ' continguts' : ''));
