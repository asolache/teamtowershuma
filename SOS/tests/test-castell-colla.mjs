// La teva colla, dibuixada (SOS/lib/castell-colla.js) · la regla de l'ofici.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const C = require('../lib/castell-colla.js');
let n = 0, f = 0;
const ok = (c, m) => { n++; if (c) console.log('  ✓ ' + m); else { f++; console.log('  ✗ ' + m); } };

const pilar = C.posicions('pilar');
ok(pilar.pom.length === 1 && pilar.pom[0].join() === 'enxaneta', 'el pilar només porta enxaneta: ni dosos ni aixecador');
const tres = C.posicions('tres');
ok(tres.pom[0].join() === 'enxaneta,aixecador,dosos', 'el tres corona de dalt a baix: enxaneta, aixecador, dosos');
ok(tres.tronc[tres.tronc.length - 1] === 'baix', 'el tronc acaba als baixos');
ok(C.posicions('cinc').pom.length === 2 && C.posicions('nou').pom.length === 3, 'els compostos coronen cada part: el cinc dues, el nou tres');
const usades = new Set();
C.FIGURES.forEach(fg => { const p = C.posicions(fg.id); p.tronc.concat(...p.pom).forEach(x => usades.add(x)); });
C.PINYA.flat().forEach(x => usades.add(x));
ok([...usades].every(x => C.P[x] && C.P[x].ca && C.P[x].es), 'cada posició dibuixada té nom, castell i flux en català i castellà');
ok(Object.keys(C.T.ca.quan).join() === C.FIGURES.map(x => x.id).join() && Object.keys(C.T.es.quan).join() === Object.keys(C.T.ca.quan).join(), 'cada castell diu quan es fa, en les dues llengües');
const svg = C.dibuixa('pilar', 'ca');
ok(!/data-p="dosos"|data-p="aixecador"/.test(svg) && /data-p="enxaneta"/.test(svg), 'el dibuix del pilar no pinta ni dosos ni aixecador');
ok((C.dibuixa('nou', 'es').match(/data-p="enxaneta"/g) || []).length === 3, 'el nou pinta tres enxanetes');
console.log(f ? `\n❌ ${f} de ${n}` : `✓ La teva colla: ${n} proves`);
process.exit(f ? 1 : 0);
