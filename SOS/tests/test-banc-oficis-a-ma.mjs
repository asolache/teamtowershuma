/* Els oficis sense API (guardia.md, peça 15): el lot a mà i les respostes de la sessió
   passen pel mateix camí que les de l'API (salut, descartats, sense duplicats). */
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { BASE, BANC, codisLot, escriuLotAMa, respostesDeFitxer, ingereixOficis, llegeixResposta } from '../tools/banc-mapes.mjs';

const J = f => JSON.parse(readFileSync(f, 'utf8'));
const base = J(BASE), antic = J(join(BANC, '..', 'base', 'fonts', 'sos-antic.json'));
const bo = J(join(BANC, 'oficis.json')).oficis.find(o => o.id === 'restaurant');
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };

/* 1 · el lot a mà: deu classes en l'ordre de pendents, amb el sistema, l'esquema i el context de cada una */
const gen = { versio: 1, estat: 'esborrany', oficis: [], descartats: [] };
const codis = codisLot(base, gen, 10);
ok(codis.length === 10 && codis[0] === base.pendents[0], 'el lot segueix pendents');
const dir = mkdtempSync(join(tmpdir(), 'a-ma-'));
const f = escriuLotAMa(codis, base, antic, '2026-11-20', dir), lot = J(f);
ok(/lot-2026-11-20-\d\d_\d+\.json$/.test(f), 'nom del fitxer amb la data i el primer codi');
ok(lot.peticions.length === 10 && lot.peticions[0].custom_id === 'cnae-' + codis[0].replace('.', '_'), 'una petició per classe');
ok(lot.sistema.includes('doce áreas') && lot.esquema.properties.es, 'porta el sistema i l\'esquema');
ok(lot.peticions.every(p => p.user.includes('<lo_que_ya_sabemos>')), 'cada petició porta el context de la classe');
rmSync(dir, { recursive: true });

/* 2 · les respostes: una bona, una sota 70, una que no és JSON, una a mitges, una buida, una d'una classe que no existeix */
const id = c => 'cnae-' + c.replace('.', '_');
const dolent = JSON.parse(JSON.stringify(bo)); dolent.es.pairs = dolent.es.pairs.slice(0, 1).map(p => [p[0], p[1], 'tangible', p[3], 'tangible', p[5]]);
const items = respostesDeFitxer({ respostes: [
  { custom_id: id(codis[0]), ofici: bo },
  { custom_id: id(codis[1]), ofici: dolent },
  { custom_id: id(codis[2]), ofici: '{no és json' },
  { custom_id: id(codis[3]), ofici: { es: bo.es } },
  { custom_id: id(codis[4]) },
  { custom_id: 'cnae-99_99', ofici: bo }] }, 'sessio-pla');
const errors = ingereixOficis(items, base, gen, '2026-11-20');
ok(gen.oficis.length === 1 && gen.oficis[0].cnae === codis[0] && gen.oficis[0].estat === 'esborrany', 'la bona entra com a esborrany');
ok(gen.oficis[0].model === 'sessio-pla' && gen.oficis[0].salut >= 70 && Array.isArray(gen.oficis[0].arees_falten), 'amb model, salut i àrees que falten');
const motiu = c => (gen.descartats.find(d => d.cnae === c) || {}).motiu || '';
ok(/^salut \d+/.test(motiu(codis[1])), 'sota 70 es descarta amb el motiu');
ok(motiu(codis[2]) === 'json' && motiu(codis[3]) === 'esquema', 'json i esquema es descarten');
ok(!motiu(codis[4]) && errors.some(e => e.startsWith(codis[4])), 'la buida no es descarta: torna al lot següent');
ok(errors.some(e => e.includes('desconeguda')), 'una classe que no existeix és un error');

/* 3 · tornar a passar el mateix fitxer no duplica; el format { custom_id: ofici } també val */
ingereixOficis(respostesDeFitxer({ [id(codis[0])]: bo }), base, gen, '2026-11-20');
ok(gen.oficis.length === 1, 'sense duplicats');
ok(codisLot(base, gen, 10)[0] === codis[4], 'el lot següent salta el que ja és dins i els descartats');

/* 4 · el camí de l'API fa servir el mateix lector */
ok(llegeixResposta({ content: [{ type: 'text', text: JSON.stringify(bo) }] }).o.es.nom === bo.es.nom, 'resposta de l\'API llegida');
ok(llegeixResposta({ content: [{ type: 'text', text: 'res' }] }).cru === 'res', 'resposta que no és JSON');

console.log('✓ oficis a mà · ' + n + ' comprovacions');
