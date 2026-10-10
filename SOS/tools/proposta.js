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
 *      `estado.md` sempre;
 *   6. escriu `EMPIEZA-AQUI.html` a l'arrel del cervell: **el backoffice del
 *      client**. Demanat per l'Àlvar (10/10/2026): el negoci ja té web, i el que
 *      se li lliura és on segueix millorant el negoci, els serveis i la web. Una
 *      pàgina que s'obre amb doble clic, amb la seva marca, que porta la
 *      proposta i les preguntes tal com són (surten dels .md, no es copien) i
 *      diu què fer la primera mitja hora, cada mes i amb Claude.
 *
 *   node SOS/tools/proposta.js propuesta/ [--nom "Nom"] [--llengua es|ca] [--url https://…]
 *        [--correu x@y.z] [--casa "Rol"] [--baixa https://la-web.example]
 *
 * Surt amb 0 si hi ha web per lliurar (`web/`), i amb 3 si de moment només hi ha
 * l'esbós: el que falta és feina de criteri, i `estado.md` diu quina. */
'use strict';
const { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } = require('node:fs');
const { join, dirname, relative, basename } = require('node:path');
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
    r3: 'Lo que ha encontrado el diagnóstico', r4: 'Las preguntas', r4D: 'En [preguntas.md](preguntas.md).', r5: 'Lo que el mapa propone para tu web', r5D: 'Tu web sigue siendo la tuya. En `{web}/index.html` (doble clic) está lo que el mapa propone añadirle: una puerta para cada rol, lo que da y lo que recibe, datos para buscadores e IA y formularios que llegan por correo. Coge lo que te sirva. El diseño y los textos salen de `marca.json`.',
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
    r3: 'El que ha trobat el diagnòstic', r4: 'Les preguntes', r4D: 'A [preguntas.md](preguntas.md).', r5: 'El que el mapa proposa per a la teva web', r5D: 'La teva web segueix sent la teva. A `{web}/index.html` (doble clic) hi ha el que el mapa proposa afegir-hi: una porta per a cada rol, el que dona i el que rep, dades per a cercadors i IA i formularis que arriben per correu. Agafa el que et serveixi. El disseny i els textos surten de `marca.json`.',
    r6: 'Els passos següents', r6D: 'Per fluxos: una sessió per tancar el mapa, un taller amb qui fa la xarxa, o l\'acompanyament. Sense imports: el preu surt del pressupost per fluxos.',
    da: 'dona', torna: 'torna', met: '{r} rols · {d} % de densitat · {i} % intangibles'
  }
};

/* El backoffice del client: textos de la pàgina d'inici. */
const BO = {
  es: { titol: 'Tu backoffice', lang: 'es',
    intro: 'Tu web sigue siendo la tuya. Esto es lo que hay detrás: lo que sabe tu negocio, escrito para que tú, tu equipo y cualquier IA lo uséis para seguir mejorando el negocio, los servicios y la web.',
    nav: { empieza: 'Empieza', propuesta: 'La propuesta', preguntas: 'Las preguntas', mes: 'Cada mes', claude: 'Con Claude', carpeta: 'Qué hay aquí' },
    empieza: 'La primera media hora',
    pasos: ['**Lee la propuesta**, aquí debajo: el flujo que hemos mirado, tu mapa y lo que ha encontrado el diagnóstico.',
      '**Contesta las preguntas.** Con tus respuestas el mapa deja de ser un borrador. Basta con escribirlas en un correo o en tu proyecto de Claude.',
      '**Mira tu mapa** en [el editor]({editor}): se abre con doble clic y funciona sin internet. Pulsa «Obre un fitxer .json» y elige `{mapa}`. Si algo no es así, dilo: se corrige el mapa y todo lo demás sale de él.',
      '**Mira lo que el mapa propone para tu web** en [{webTxt}]({web}). No sustituye a tu web: coge lo que te sirva.'],
    mes: 'Cada mes, para seguir mejorando',
    mesL: ['**Cuando cambie algo de verdad** (un servicio nuevo, un canal, alguien con quien trabajas), cambia el mapa. El diagnóstico dice qué se ha movido y dónde se atasca.',
      '**Elige una pregunta** de la lista y llévala a tu web: una página, un párrafo, un formulario. Una al mes ya cambia mucho.',
      '**Apunta lo que decides y por qué** en [las decisiones]({decisiones}). Es lo único que se escribe a mano, y es lo que hace que la siguiente mejora no empiece de cero.',
      '**Lo que aprendes con tus clientes vuelve al mapa.** Quién pide qué, qué no se entiende, qué se repite: así el mapa sigue diciendo la verdad.'],
    claude: 'Con Claude',
    claudeD: 'Esta carpeta está preparada para trabajar con Claude: antes de tocar nada lee `CLAUDE.md` y el cerebro (`saber/`), y una comprobación avisa sola si algo de lo escrito deja de ser cierto. Pídele las cosas como se las pedirías a alguien de tu equipo:',
    ejemplos: ['«Escribe un texto para mi web que conteste la pregunta 1»', '«He empezado a trabajar con alguien nuevo: añádelo al mapa y dime qué cambia»',
      '«Revisa mi web actual contra las preguntas y dime qué falta»', '«Prepara un artículo a partir de lo que ha pasado esta semana»'],
    claudeF: 'Cada cambio llega como propuesta y tú decides si entra.',
    carpeta: 'Qué hay en esta carpeta',
    carpetaL: [['{prop}/', 'La propuesta, el mapa, las preguntas y lo que el mapa propone para tu web'], ['saber/', 'El cerebro: lo que una IA lee antes de tocar nada. Su página: [saber/cervell.html](saber/cervell.html)'],
      ['herramientas/', 'El editor del mapa y las herramientas que lo rehacen todo a partir de él'], ['guardas/', 'La comprobación que avisa cuando algo de lo escrito deja de ser cierto'],
      ['CLAUDE.md', 'Las reglas para quien trabaje aquí, persona o IA']],
    noVa: '**Lo que no va aquí:** datos personales de tus clientes, precios pactados y contratos. Van a tu CRM o a tu correo.',
    gen: 'Página generada a partir de la propuesta: se rehace cada vez que cambian el mapa, la propuesta o las preguntas.' },
  ca: { titol: 'El teu backoffice', lang: 'ca',
    intro: 'La teva web segueix sent la teva. Això és el que hi ha darrere: el que sap el teu negoci, escrit perquè tu, el teu equip i qualsevol IA ho feu servir per seguir millorant el negoci, els serveis i la web.',
    nav: { empieza: 'Comença', propuesta: 'La proposta', preguntas: 'Les preguntes', mes: 'Cada mes', claude: 'Amb Claude', carpeta: 'Què hi ha aquí' },
    empieza: 'La primera mitja hora',
    pasos: ['**Llegeix la proposta**, aquí sota: el flux que hem mirat, el teu mapa i el que ha trobat el diagnòstic.',
      '**Contesta les preguntes.** Amb les teves respostes el mapa deixa de ser un esborrany. N\'hi ha prou d\'escriure-les en un correu o al teu projecte de Claude.',
      '**Mira el teu mapa** a [l\'editor]({editor}): s\'obre amb doble clic i funciona sense internet. Prem «Obre un fitxer .json» i tria `{mapa}`. Si alguna cosa no és així, digues-ho: es corregeix el mapa i tota la resta en surt.',
      '**Mira el que el mapa proposa per a la teva web** a [{webTxt}]({web}). No substitueix la teva web: agafa el que et serveixi.'],
    mes: 'Cada mes, per seguir millorant',
    mesL: ['**Quan canviï alguna cosa de debò** (un servei nou, un canal, algú amb qui treballes), canvia el mapa. El diagnòstic diu què s\'ha mogut i on s\'encalla.',
      '**Tria una pregunta** de la llista i porta-la a la teva web: una pàgina, un paràgraf, un formulari. Una al mes ja canvia molt.',
      '**Apunta el que decideixes i per què** a [les decisions]({decisiones}). És l\'únic que s\'escriu a mà, i és el que fa que la millora següent no comenci de zero.',
      '**El que aprens amb els teus clients torna al mapa.** Qui demana què, què no s\'entén, què es repeteix: així el mapa segueix dient la veritat.'],
    claude: 'Amb Claude',
    claudeD: 'Aquesta carpeta està preparada per treballar amb Claude: abans de tocar res llegeix `CLAUDE.md` i el cervell (`saber/`), i una comprovació avisa sola si alguna cosa del que hi ha escrit deixa de ser certa. Demana-li les coses com les demanaries a algú del teu equip:',
    ejemplos: ['«Escriu un text per a la meva web que contesti la pregunta 1»', '«He començat a treballar amb algú nou: afegeix-lo al mapa i digues-me què canvia»',
      '«Revisa la meva web actual contra les preguntes i digues-me què hi falta»', '«Prepara un article a partir del que ha passat aquesta setmana»'],
    claudeF: 'Cada canvi arriba com a proposta i tu decideixes si entra.',
    carpeta: 'Què hi ha en aquesta carpeta',
    carpetaL: [['{prop}/', 'La proposta, el mapa, les preguntes i el que el mapa proposa per a la teva web'], ['saber/', 'El cervell: el que una IA llegeix abans de tocar res. La seva pàgina: [saber/cervell.html](saber/cervell.html)'],
      ['herramientas/', 'L\'editor del mapa i les eines que ho refan tot a partir d\'ell'], ['guardas/', 'La comprovació que avisa quan alguna cosa del que hi ha escrit deixa de ser certa'],
      ['CLAUDE.md', 'Les regles per a qui hi treballi, persona o IA']],
    noVa: '**El que no va aquí:** dades personals dels teus clients, preus pactats i contractes. Van al teu CRM o al teu correu.',
    gen: 'Pàgina generada a partir de la proposta: es refà cada vegada que canvien el mapa, la proposta o les preguntes.' }
};
/* Prou Markdown per a la proposta i les preguntes: títols, paràgrafs, llistes,
   taules, cites, negreta, cursiva, codi i enllaços. Tot s'escapa abans. */
function mdHtml(md, base, nivell) {
  const e = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const enl = h => (/^(https?:|mailto:|#)/.test(h) ? h : (base ? base + '/' : '') + h);
  const inl = s => e(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, h) => (/^[a-z][a-z0-9+.-]*:/i.test(h) && !/^(https?|mailto):/i.test(h) ? t : '<a href="' + enl(h) + '">' + t + '</a>'))
    .replace(/(^|[\s(])(https:\/\/[^\s<)]+)/g, '$1<a href="$2">$2</a>');
  const out = [], ls = String(md).replace(/<!--[\s\S]*?-->\n?/g, '').split('\n');
  for (let i = 0; i < ls.length;) {
    const l = ls[i];
    if (!l.trim()) { i++; continue; }
    const h = /^(#{1,6})\s+(.*)$/.exec(l);
    if (h) { const n = Math.min(6, h[1].length + (nivell || 0)); out.push('<h' + n + '>' + inl(h[2]) + '</h' + n + '>'); i++; continue; }
    if (/^\|/.test(l)) {
      const fil = []; while (i < ls.length && /^\|/.test(ls[i])) fil.push(ls[i++]);
      const cel = r => r.replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(c => inl(c.trim().replace(/\\\|/g, '|')));
      const cap = cel(fil[0]), cos = fil.slice(/^\|[\s:|-]+\|$/.test(fil[1] || '') ? 2 : 1).map(cel);
      out.push('<div class="taula"><table><thead><tr>' + cap.map(c => '<th scope="col">' + c + '</th>').join('') + '</tr></thead><tbody>'
        + cos.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>'); continue;
    }
    const li = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(l);
    if (li) {
      const ord = /\d/.test(li[2]), items = [];
      while (i < ls.length && /^\s*([-*]|\d+\.)\s+/.test(ls[i])) {
        let t = ls[i++].replace(/^\s*([-*]|\d+\.)\s+/, '');
        while (i < ls.length && /^\s{2,}\S/.test(ls[i]) && !/^\s*([-*]|\d+\.)\s+/.test(ls[i])) t += ' ' + ls[i++].trim();
        items.push('<li>' + inl(t) + '</li>');
      }
      out.push((ord ? '<ol>' : '<ul>') + items.join('') + (ord ? '</ol>' : '</ul>')); continue;
    }
    if (/^>\s?/.test(l)) { const q = []; while (i < ls.length && /^>\s?/.test(ls[i])) q.push(ls[i++].replace(/^>\s?/, '')); out.push('<blockquote><p>' + inl(q.join(' ')) + '</p></blockquote>'); continue; }
    if (/^```/.test(l)) { const c = []; i++; while (i < ls.length && !/^```/.test(ls[i])) c.push(ls[i++]); i++; out.push('<pre><code>' + e(c.join('\n')) + '</code></pre>'); continue; }
    const p = []; while (i < ls.length && ls[i].trim() && !/^(#{1,6}\s|\||>|```|\s*([-*]|\d+\.)\s)/.test(ls[i])) p.push(ls[i++].trim());
    out.push('<p>' + inl(p.join(' ')) + '</p>');
  }
  return out.join('\n');
}
/* EMPIEZA-AQUI.html: el backoffice, a l'arrel del cervell (o a la carpeta de la
   proposta si no n'hi ha). Fa servir el full d'estil de la web que surt del
   mapa: la mateixa marca, cap estil copiat. */
function paginaInici(dir, desti, nom, llengua) {
  const T = BO[llengua] || BO.es, arrel = existsSync(join(dir, '..', 'cervell.json')) ? join(dir, '..') : dir;
  const rel = f => relative(arrel, f).split('\\').join('/') || '.', prop = rel(dir), web = rel(desti);
  const editor = existsSync(join(arrel, 'herramientas', 'vna-suport.html')) ? 'herramientas/vna-suport.html' : 'https://teamtowershuma.com/SOS/vna-suport.html';
  const omple = s => s.replace('{editor}', editor).replace('{mapa}', (prop === '.' ? '' : prop + '/') + 'mapa.json').replace('{webTxt}', web + '/index.html').replace('{web}', web + '/index.html')
    .replace('{decisiones}', web + '/cerebro/decisiones.md').replace('{prop}', prop);
  const md = (f, n) => (existsSync(join(dir, f)) ? mdHtml(readFileSync(join(dir, f), 'utf8'), prop === '.' ? '' : prop, n) : '');
  const l = s => mdHtml(omple(s)).replace(/^<p>|<\/p>$/g, '');
  const lema = (() => { try { return JSON.parse(readFileSync(join(dir, 'marca.json'), 'utf8')).lema || ''; } catch (x) { return ''; } })();
  const e = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const sec = (id, h, cos) => '<section id="' + id + '" aria-labelledby="t-' + id + '">\n<h2 id="t-' + id + '">' + e(h) + '</h2>\n' + cos + '\n</section>';
  const html = '<!DOCTYPE html>\n<html lang="' + T.lang + '">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + '<meta name="robots" content="noindex">\n<title>' + e(T.titol + ' · ' + nom) + '</title>\n<link rel="stylesheet" href="' + e(web + '/estil.css') + '">\n'
    + '<style>section{margin-top:2.2rem}.taula{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:.95rem}th,td{border-bottom:1px solid var(--lin);padding:.45rem .5rem;text-align:left;vertical-align:top}'
    + 'blockquote{margin:1rem 0;padding:.25rem 1rem;border-left:3px solid var(--acc);color:var(--mut)}code{font-size:.9em}.ex li{font-style:italic}.intro{font-size:1.1rem}</style>\n</head>\n<body>\n'
    + '<header>\n<p class="marca">' + e(nom) + '</p>\n' + (lema ? '<p class="lema">' + e(lema) + '</p>\n' : '') + '<nav aria-label="' + e(T.titol) + '"><ul>'
    + Object.keys(T.nav).map(k => '<li><a href="#' + k + '">' + e(T.nav[k]) + '</a></li>').join('') + '</ul></nav>\n</header>\n<main id="contingut">\n'
    + '<h1>' + e(T.titol) + '</h1>\n<p class="intro">' + e(T.intro) + '</p>\n'
    + sec('empieza', T.empieza, '<ol>' + T.pasos.map(x => '<li>' + l(x) + '</li>').join('') + '</ol>') + '\n'
    + sec('propuesta', T.nav.propuesta, md('README.md', 1)) + '\n'
    + sec('preguntas', T.nav.preguntas, md('preguntas.md', 1)) + '\n'
    + sec('mes', T.mes, '<ul>' + T.mesL.map(x => '<li>' + l(x) + '</li>').join('') + '</ul>') + '\n'
    + sec('claude', T.claude, '<p>' + l(T.claudeD) + '</p>\n<ul class="ex">' + T.ejemplos.map(x => '<li>' + e(x) + '</li>').join('') + '</ul>\n<p>' + e(T.claudeF) + '</p>') + '\n'
    + sec('carpeta', T.carpeta, '<div class="taula"><table><tbody>' + T.carpetaL.filter(([a]) => existsSync(join(arrel, omple(a)))).map(([a, b]) => '<tr><th scope="row"><code>' + e(omple(a)) + '</code></th><td>' + l(b) + '</td></tr>').join('')
      + '</tbody></table></div>\n<p>' + l(T.noVa) + '</p>') + '\n'
    + '</main>\n<footer>\n<p>' + e(T.gen) + '</p>\n</footer>\n</body>\n</html>\n';
  writeFileSync(join(arrel, 'EMPIEZA-AQUI.html'), html);
  return join(arrel, 'EMPIEZA-AQUI.html');
}

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
  const inici = paginaInici(dir, desti, nom, llengua);
  return { final, provisional: diag.provisional, propi, web: desti, fitxers: fitxers.length, analisi: an, inici };
}
module.exports = { proposta, mdHtml };

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
      + ' · ' + r.analisi.rols.length + ' candidats a rol · ' + r.analisi.preguntes.length + ' preguntes · el que falta, a ' + join(pos[0], 'estado.md')
      + ' · el backoffice del client, a ' + r.inici);
    process.exit(r.final ? 0 : 3);
  }).catch(e => { console.error('❌ ' + e.message); process.exit(1); });
}
