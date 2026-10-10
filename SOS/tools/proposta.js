#!/usr/bin/env node
/* La proposta inicial, d'un sol ordre · de les fonts a l'esborrany de web
 * ─────────────────────────────────────────────────────────────────
 * Demanat per l'Àlvar (10/10/2026): acabar el servei de desenvolupament de web
 * perquè el disseny i els continguts es personalitzin i s'automatitzin al
 * màxim, amb un sistema automàtic d'anàlisi dels continguts que dona el client
 * i d'elaboració de l'esborrany de la web.
 *
 * Fa en un ordre els passos de la skill `propuesta-inicial` que no demanen
 * criteri, i deixa escrit el que sí que en demana:
 *
 *   1. (opcional) baixa la web del negoci a `fuentes/`;
 *   2. l'analitza (`analitza-contingut.js`): `analisis.md`, `marca.json` i
 *      `mapa-esbozo.json`;
 *   3. revisa el mapa amb les regles de la casa (`revisa-mapa.js`): `mapa.json`
 *      si ja n'hi ha, i si no, l'esbós;
 *   4. en fa la web amb la marca (`web-del-mapa.js`): a `web/` si el mapa és
 *      `mapa.json` i passa les regles dures; si no, a `web-esbozo/`, perquè es
 *      vegi i ningú no el confongui amb el que es lliura;
 *   5. escriu `preguntas.md` i `README.md` mentre portin la marca de generat
 *      (qui els fa seus esborra la línia de la marca i ja no es toquen més), i
 *      `estado.md` sempre.
 *
 *   node SOS/tools/proposta.js propuesta/ [--nom "Nom"] [--llengua es|ca] [--url https://…]
 *        [--correu x@y.z] [--casa "Rol"] [--baixa https://la-web.example]
 *
 * Surt amb 0 si hi ha web per lliurar (`web/`), i amb 3 si de moment només hi ha
 * l'esbós: el que falta és feina de criteri, i `estado.md` diu quina. */
'use strict';
const { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } = require('node:fs');
const { join, dirname } = require('node:path');
const A = require('./analitza-contingut.js');
const { diagnostica } = require('./revisa-mapa.js');
const W = require('./web-del-mapa.js');

/* Mentre un fitxer porti aquesta línia, és de l'eina i es torna a escriure. */
const MARCA_GEN = '<!-- proposta.js: es regenera mentre aquesta línia hi sigui. Esborra-la per fer-lo teu. -->';
const meu = f => !existsSync(f) || readFileSync(f, 'utf8').includes(MARCA_GEN);

const TXT = {
  es: {
    estat: 'Estado de la propuesta', gen: 'Generado por `proposta.js`. Se vuelve a escribir cada vez.',
    fonts: 'Fuentes leídas', mapa: 'El mapa', web: 'La web', falta: 'Lo que falta (trabajo de criterio)',
    esbos: 'Esbozo automático (`mapa-esbozo.json`): todavía no hay `mapa.json`.', propi: '`mapa.json`',
    passa: 'pasa las reglas duras', prov: 'provisional: hay reglas duras abiertas', webOk: 'En `web/`: es la que se entrega, marcada como borrador.',
    webEsb: 'En `web-esbozo/`: sale del esbozo o de un mapa provisional. Sirve para verla, no para entregarla.',
    f1: 'Escribir `mapa.json` con la skill `mapa-de-valor`, a partir de `analisis.md` y del esbozo: roles dichos por lo que hacen, los intangibles en las dos direcciones, procesos y secuencia.',
    f2: 'Corregir el mapa hasta que no quede ninguna regla dura abierta, y volver a pasar `proposta.js`.',
    f3: 'Revisar `marca.json`: color, letra, lema, presentación, el nombre corto y la introducción de cada puerta.',
    f4: 'Repasar `preguntas.md` y `README.md`, y traducir las preguntas del diagnóstico (salen en catalán).',
    cap: 'Nada: la propuesta está lista para que la revise quien la entrega.',
    preg: 'Las preguntas que tu web no contesta', pregD: 'Borrador generado por `proposta.js`. Ordénalas por lo que más valor mueve y deja diez como mucho.',
    deFonts: 'De lo que dice (y no dice) la web', deDiag: 'Del diagnóstico del mapa (en catalán: tradúcelas sin cambiarles el sentido)',
    rd: 'Propuesta inicial · {nom} · BORRADOR', rdD: 'Borrador para revisar antes de enviarlo. Generado por `proposta.js` a partir del mapa y del diagnóstico.',
    r1: 'El flujo que hemos mirado', r2: 'El mapa', r2D: 'Ábrelo en el editor: https://teamtowershuma.com/SOS/vna-suport.html, botón «Obre un fitxer .json», con `mapa.json`.',
    r3: 'Lo que ha encontrado el diagnóstico', r4: 'Las preguntas', r4D: 'En [preguntas.md](preguntas.md).', r5: 'La web propuesta', r5D: 'Abre `{web}/index.html` con doble clic. El diseño y los textos propios salen de `marca.json`.',
    r6: 'Los siguientes pasos', r6D: 'Por flujos: una sesión para cerrar el mapa, un taller con quien hace la red, o el acompañamiento. Sin importes: el precio sale del presupuesto por flujos.',
    da: 'da', torna: 'devuelve', met: '{r} roles · {d} % de densidad · {i} % intangibles'
  },
  ca: {
    estat: 'Estat de la proposta', gen: 'Generat per `proposta.js`. Es torna a escriure cada vegada.',
    fonts: 'Fonts llegides', mapa: 'El mapa', web: 'La web', falta: 'El que falta (feina de criteri)',
    esbos: 'Esbós automàtic (`mapa-esbozo.json`): encara no hi ha `mapa.json`.', propi: '`mapa.json`',
    passa: 'passa les regles dures', prov: 'provisional: hi ha regles dures obertes', webOk: 'A `web/`: és la que es lliura, marcada com a esborrany.',
    webEsb: 'A `web-esbozo/`: surt de l\'esbós o d\'un mapa provisional. Serveix per veure-la, no per lliurar-la.',
    f1: 'Escriure `mapa.json` amb la skill `mapa-de-valor`, a partir d\'`analisis.md` i de l\'esbós: rols dits pel que fan, els intangibles en les dues direccions, processos i seqüència.',
    f2: 'Corregir el mapa fins que no quedi cap regla dura oberta, i tornar a passar `proposta.js`.',
    f3: 'Revisar `marca.json`: color, lletra, lema, presentació, el nom curt i la introducció de cada porta.',
    f4: 'Repassar `preguntas.md` i `README.md`.',
    cap: 'Res: la proposta és a punt perquè la revisi qui la lliura.',
    preg: 'Les preguntes que la teva web no contesta', pregD: 'Esborrany generat per `proposta.js`. Ordena-les pel que més valor mou i deixa\'n deu com a molt.',
    deFonts: 'Del que diu (i no diu) la web', deDiag: 'Del diagnòstic del mapa',
    rd: 'Proposta inicial · {nom} · ESBORRANY', rdD: 'Esborrany per revisar abans d\'enviar-lo. Generat per `proposta.js` a partir del mapa i del diagnòstic.',
    r1: 'El flux que hem mirat', r2: 'El mapa', r2D: 'Obre\'l a l\'editor: https://teamtowershuma.com/SOS/vna-suport.html, botó «Obre un fitxer .json», amb `mapa.json`.',
    r3: 'El que ha trobat el diagnòstic', r4: 'Les preguntes', r4D: 'A [preguntas.md](preguntas.md).', r5: 'La web proposada', r5D: 'Obre `{web}/index.html` amb doble clic. El disseny i els textos propis surten de `marca.json`.',
    r6: 'Els passos següents', r6D: 'Per fluxos: una sessió per tancar el mapa, un taller amb qui fa la xarxa, o l\'acompanyament. Sense imports: el preu surt del pressupost per fluxos.',
    da: 'dona', torna: 'torna', met: '{r} rols · {d} % de densitat · {i} % intangibles'
  }
};

async function proposta(dir, opts) {
  const o = opts || {}, fonts = join(dir, 'fuentes');
  mkdirSync(dir, { recursive: true });
  if (o.baixa) A.baixa(o.baixa, fonts);
  const fit = existsSync(fonts) ? A.llegeixCarpeta(fonts) : [];
  if (!fit.length) throw new Error('No hi ha fonts a ' + fonts + ': desa-hi les pàgines de la web (.html), el catàleg (.md, .txt), el CSS i el logo (.svg), o passa --baixa https://…');
  const an = A.analitza(fit, o), T = TXT[an.llengua];
  const nom = o.nom || an.nom, llengua = o.llengua || an.llengua;
  writeFileSync(join(dir, 'analisis.json'), JSON.stringify(an, null, 2) + '\n');
  writeFileSync(join(dir, 'analisis.md'), A.aMarkdown(an));
  const fMarca = join(dir, 'marca.json'), fEsb = join(dir, 'mapa-esbozo.json'), fMapa = join(dir, 'mapa.json');
  if (!existsSync(fMarca)) {
    const m = Object.assign({}, an.marca);
    if (m.logo) m.logo = 'fuentes/' + m.logo;
    writeFileSync(fMarca, JSON.stringify(m, null, 2) + '\n');
  }
  if (!existsSync(fEsb)) writeFileSync(fEsb, JSON.stringify(an.esborrany, null, 2) + '\n');

  const propi = existsSync(fMapa), mapa = JSON.parse(readFileSync(propi ? fMapa : fEsb, 'utf8'));
  const diag = diagnostica(mapa), final = propi && !diag.provisional;
  const desti = join(dir, final ? 'web' : 'web-esbozo');
  rmSync(join(dir, final ? 'web-esbozo' : 'web'), { recursive: true, force: true });
  rmSync(desti, { recursive: true, force: true });
  const fitxers = await W.genera(mapa, { nom, llengua, url: o.url, correu: o.correu, casa: o.casa || [], marca: W.llegeixMarca(fMarca) });
  fitxers.forEach(f => { const r = join(desti, f.ruta); mkdirSync(dirname(r), { recursive: true }); writeFileSync(r, f.cos); });

  const ordre = { alta: 0, mitjana: 1, baixa: 2, nota: 3 };
  const trob = diag.troballes.slice().sort((x, y) => (ordre[x.gravetat] ?? 9) - (ordre[y.gravetat] ?? 9));
  if (meu(join(dir, 'preguntas.md'))) {
    const dq = trob.filter(t => t.pregunta && (t.gravetat === 'alta' || t.gravetat === 'mitjana')).map(t => t.pregunta);
    writeFileSync(join(dir, 'preguntas.md'), [MARCA_GEN, '# ' + T.preg + ' · ' + nom, '', '> ' + T.pregD, '', '## ' + T.deFonts, '']
      .concat(an.preguntes.map((q, i) => (i + 1) + '. ' + q), dq.length ? ['', '## ' + T.deDiag, ''].concat([...new Set(dq)].map((q, i) => (i + 1) + '. ' + q)) : []).join('\n') + '\n');
  }
  if (meu(join(dir, 'README.md'))) {
    const m = (diag.nivells[0] || {}).metriques || {};
    const ab = mapa.abast || '', rols = mapa.rols || mapa.roles || [];
    const lin = (mapa.parells || []).map(p => p.split('|').map(x => x.trim())).concat((mapa.pairs || []).filter(Array.isArray)).filter(p => p.length >= 6 && p[3])
      .map(p => '- **' + p[0] + '** ' + T.da + ' «' + p[3] + '» a **' + p[1] + '**' + (p[5] ? ', que ' + T.torna + ' «' + p[5] + '»' : ''));
    writeFileSync(join(dir, 'README.md'), [MARCA_GEN, '# ' + T.rd.replace('{nom}', nom), '', '> ' + T.rdD, '',
      '## 1 · ' + T.r1, '', ab, '', '## 2 · ' + T.r2, '', T.met.replace('{r}', rols.length).replace('{d}', m.densitat ?? '—').replace('{i}', m.pctI ?? '—'), '']
      .concat(lin.length ? lin : [], ['', T.r2D, '', '## 3 · ' + T.r3, ''], trob.slice(0, 3).map(t => '- ' + (t.que || t.codi)),
        ['', '## 4 · ' + T.r4, '', T.r4D, '', '## 5 · ' + T.r5, '', T.r5D.replace('{web}', final ? 'web' : 'web-esbozo'), '', '## 6 · ' + T.r6, '', T.r6D, '']).join('\n'));
  }
  const falta = [];
  if (!propi) falta.push(T.f1);
  if (diag.provisional) falta.push(T.f2);
  falta.push(T.f3, T.f4);
  const dures = (diag.nivells[0] ? diag.nivells[0].revisio.regles : []).filter(r => r.dur && !r.ok);
  writeFileSync(join(dir, 'estado.md'), ['# ' + T.estat + ' · ' + nom, '', '> ' + T.gen, '',
    '## ' + T.fonts, '', fit.map(f => '`' + f.nom + '`').join(', '), '',
    '## ' + T.mapa, '', (propi ? T.propi : T.esbos) + ' · ' + (diag.provisional ? T.prov : T.passa)]
    .concat(dures.map(r => '- ✗ ' + r.t + ': ' + r.diu), ['', '## ' + T.web, '', final ? T.webOk : T.webEsb, '', '## ' + T.falta, ''],
      falta.map((x, i) => (i + 1) + '. ' + x)).join('\n') + '\n');
  return { final, provisional: diag.provisional, propi, web: desti, fitxers: fitxers.length, analisi: an };
}
module.exports = { proposta };

if (require.main === module) {
  const a = process.argv.slice(2), opts = { casa: [] }, pos = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--casa') opts.casa.push(a[++i]);
    else if (/^--(nom|correu|llengua|url|baixa)$/.test(a[i])) opts[a[i].slice(2)] = a[++i];
    else pos.push(a[i]);
  }
  if (!pos[0]) { console.error('Ús: node SOS/tools/proposta.js propuesta/ [--nom …] [--llengua es|ca] [--url …] [--correu …] [--casa …] [--baixa https://…]'); process.exit(2); }
  proposta(pos[0], opts).then(r => {
    console.log((r.final ? '✅ Web per lliurar' : '◐ De moment, l\'esbós') + ': ' + r.fitxers + ' fitxers a ' + r.web
      + ' · ' + r.analisi.rols.length + ' candidats a rol · ' + r.analisi.preguntes.length + ' preguntes · el que falta, a ' + join(pos[0], 'estado.md'));
    process.exit(r.final ? 0 : 3);
  }).catch(e => { console.error('❌ ' + e.message); process.exit(1); });
}
