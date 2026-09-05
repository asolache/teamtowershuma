#!/usr/bin/env node
/* El Comando, declarat en un sol lloc
 * ─────────────────────────────────────────────────────────────────────────────
 * El Comando estava escampat: la història als còmics viu a `comando.html`, els
 * personatges a `CANONICAL_HEROES` dins de l'app, el relat de com va començar
 * al blog, el perfil de superheroi/na i el kit narratiu són dos modals de
 * l'aplicació, i el poble on tot això passa és `molekulandia.html`. Cadascuna
 * d'aquestes peces és bona i cap diu que les altres existeixen.
 *
 * El que faltava no era una peça més: era **dir què és tot plegat**. És un
 * projecte per fer la primera pel·lícula col·laborativa amb 150.000 persones,
 * i cada peça hi fa un paper. Aquesta pàgina és on es veu sencer.
 *
 * ── Per què generat i no escrit a mà ────────────────────────────────────────
 * Les fitxes d'heroi de la pàgina estaven escrites a mà **copiant** la llista
 * de l'app. `check-comando.js` existeix precisament perquè un dia van
 * divergir, i la seva regla 4 no fa altra cosa que comparar les dues còpies.
 * Una guarda que vigila una còpia és millor que res; no tenir la còpia és
 * millor que la guarda. Ara les fitxes surten de `CANONICAL_HEROES`.
 *
 * ── El que aquí es declara i no es dedueix ──────────────────────────────────
 *   · `EIXOS`   — què és aquest projecte: art, ficció, educació, inspiració,
 *                 empoderament de les comunitats i autonomia. Sis paraules que
 *                 no volen dir res si no diuen **on** passen: cada eix porta la
 *                 pantalla on això és una cosa que es fa.
 *   · `PASSOS`  — com una persona hi entra i què fa el SOS a cada pas. Cada pas
 *                 apunta a un modal de l'app per la seva ruta (`MODAL_ROUTES`),
 *                 i la guarda comprova que la ruta existeixi.
 *   · `VIDEOS`  — l'inventari del que hi ha filmat i **del que no**. Un vídeo
 *                 sense enllaç no es pinta com una porta: es pinta dient que
 *                 encara no hi és. Prometre una porta tancada és pitjor que no
 *                 tenir-la (veda 116).
 *   · `POSTS`   — les entrades del blog que expliquen el Comando, amb la seva
 *                 àncora. La guarda comprova que l'àncora existeixi a `blog.html`.
 *
 * ── Ús ──────────────────────────────────────────────────────────────────────
 *   node SOS/tools/build-comando.js            escriu el que toqui
 *   node SOS/tools/build-comando.js --check    falla si està vell o incomplet
 */
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const SOS = join(ARREL, 'SOS');
const CHECK = process.argv.includes('--check');

/* ══ LA TESI ═════════════════════════════════════════════════════════════════
   El número no s'escriu aquí dues vegades: surt de `COMANDO_TARGET`, que és
   d'on el llegeix l'app. Si algun dia són 200.000, es canvia allà i prou. */
const TESI = {
  titol: 'La primera pel·lícula que farem 150.000 persones',
  entrada: 'Projecte obert · art, ficció i comunitat',
  sub: 'El <strong>Comando Molekulon</strong> és un còmic, una banda i una pel·lícula que encara ' +
    'no existeix. Es farà amb <strong>150.000 superherois reals</strong>: gent que aporta hores, ' +
    'objectes i coneixement al seu barri i que ho registra al SOS. El teu personatge no és un avatar ' +
    'inventat — és el que ja fas, amb nom i amb superarma. I el poble on passa tot plegat ' +
    'és <a href="molekulandia.html">Molekulandia</a>.'
};

/* ══ ELS SIS EIXOS ═══════════════════════════════════════════════════════════
   Sis paraules grosses. Cadascuna porta obligatòriament una pantalla on això
   és una cosa que es fa, i no una intenció: sense el `on`, això seria el
   apartat de valors d'una web corporativa.

   «Empoderament» va amb el seu objecte a posta. La guia de marca el prohibeix
   sol (i `check-landing.js` l'acusa) perquè empoderar **algú** és una cosa que
   es pot comprovar i «empoderament» a seques no vol dir res. */
const EIXOS = [
  { id: 'art', ic: '🎨', nom: 'Art',
    que: 'El còmic, la música i el dibuix no il·lustren el projecte: en són la matèria. Cada personatge té la seva superarma, el seu vers i el seu tema.',
    on: ['La història', '#historia'] },
  { id: 'ficcio', ic: '📖', nom: 'Ficció',
    que: 'Una història inventada és el permís per dir en veu alta el que passa de debò a la teva feina i al teu barri. El Mundo Muerto no és una metàfora amable.',
    on: ['Els herois canònics', '#herois'] },
  { id: 'educacio', ic: '🎓', nom: 'Educació',
    que: 'El mateix relat és material d\'aula: la Fàbrica de Superherois de 6 a 13 anys, i setze mòduls de N0 a N3 per a qui hi vulgui treballar.',
    on: ['A l\'escola', 'escola.html'] },
  { id: 'inspiracio', ic: '✨', nom: 'Inspiració',
    que: 'Ningú es mou per un informe. Es mou perquè algú altre s\'ha mogut i ho ha explicat prou bé perquè es vegi que es podia.',
    on: ['El blog del Comando', '#blog'] },
  { id: 'poder', ic: '💪', nom: 'Empoderament de les comunitats',
    que: 'Poder concret i comprovable: qui té les claus, qui decideix i qui cobra el que aporta. Cada aportació va signada i el registre és públic.',
    on: ['El registre públic', 'index.html#/registre'] },
  { id: 'autonomia', ic: '🕊', nom: 'Autonomia',
    que: 'Sense compte, sense contrasenya i sense demanar permís. La clau te la fa el navegador i no surt del teu aparell; si te\'n vas, t\'ho endús tot.',
    on: ['El teu perfil és teu', '#perfil'] }
];

/* ══ COM ES FA UNA PEL·LÍCULA AMB 150.000 PERSONES ═══════════════════════════
   Els mòduls del SOS que fan el Comando, en l'ordre en què una persona els
   troba. `ruta` és la clau a `MODAL_ROUTES` de l'app: la guarda comprova que
   existeixi, perquè un enllaç a un modal que ja no es diu així obre l'app per
   la portada i sembla que no hagi passat res. */
const PASSOS = [
  { n: 1, ic: '🦸', t: 'Fes el teu personatge', ruta: 'alta',
    d: 'Nom, població, fins a <strong>cinc superpoders</strong> i les teves <strong>superarmes</strong> — el que saps fer i el que pots deixar. Es fa al navegador i no puja enlloc.',
    cta: 'Crea el meu perfil' },
  { n: 2, ic: '🎬', t: 'Escriu la teva història amb IA', ruta: 'kit',
    d: 'El kit narratiu en treu sinopsi de còmic, himne i escena performativa a partir del que has fet <strong>de debò</strong>. La clau de la IA la poses tu i cap dada de ningú hi entra sense confirmar-ho.',
    cta: 'Obre el kit narratiu' },
  { n: 3, ic: '🌌', t: 'Entra al multivers', ruta: 'multivers',
    d: 'Cada història desada s\'apila amb les altres. El multivers <strong>és el guió</strong>: no l\'escriu ningú a soles, es va omplint.',
    cta: 'Mira el multivers' },
  { n: 4, ic: '🎞', t: 'Els crèdits són el registre', ruta: 'comando',
    d: 'Cada aportació signada surt als crèdits amb el seu nom i la seva data. <strong>Aquí no hi ha figurants</strong>: qui hi surt és perquè ha fet alguna cosa i algú altre ho ha confirmat.',
    cta: 'Obre el Comando a l\'app' }
];

/* El poble on passa. No és un pas: és el decorat, i ja existeix. */
const DECORAT = { href: 'molekulandia.html', t: 'Molekulandia',
  d: 'El poble sencer: onze edificis on entrar i nou professions. El bar és el banc de temps i la ferreteria és la biblioteca de les coses.' };

/* ══ EL QUE HI HA FILMAT, I EL QUE NO ════════════════════════════════════════
   Aquesta llista és mig inventari i mig encàrrec. Un vídeo amb `url` es pinta
   com un enllaç; un sense, es pinta dient que **encara no hi és**, amb qui és
   i què s'hi veurà. Les dues coses són informació; una porta que no obre, no.

   `qui` ha de ser un nom del roster quan la mena és `personatge`: la guarda ho
   comprova contra `CANONICAL_HEROES`, que és la mateixa regla de la veda 109. */
const VIDEOS = [
  { id: 'horacio', mena: 'tema', qui: 'Horacio Motomachi', titol: 'El tema d\'Horacio Motomachi',
    d: 'La cançó sencera. Sona també a la intro.', url: 'media/comando-horacio.mp3' },
  { id: 'reciclator', mena: 'personatge', qui: 'Reciclator', titol: 'Reciclator · el taller',
    d: 'Construeix les superarmes de la banda amb el que els altres han llençat.', url: null },
  { id: 'supergerminador', mena: 'personatge', qui: 'Supergerminador', titol: 'Supergerminador · germinar',
    d: 'Ensenya a germinar per menjar superaliments, i canta amb la seva rialla.', url: null },
  { id: 'fraktalman', mena: 'personatge', qui: 'Fraktalman', titol: 'Fraktalman · el tema',
    d: 'La forma que es repeteix a totes les escales, convertida en cançó.', url: null },
  { id: 'directe-banda', mena: 'directe', qui: null, titol: 'La banda en directe',
    d: 'El Comando tocant. És la prova que això no és una marca: hi ha gent que hi puja.', url: null },
  { id: 'directe-taller', mena: 'directe', qui: null, titol: 'Un taller, filmat',
    d: 'Una sessió de la Fàbrica de Superherois tal com passa, sense muntatge.', url: null }
];

/* ══ EL BLOG DEL COMANDO ═════════════════════════════════════════════════════
   Les entrades que expliquen d'on surt tot això. L'àncora es comprova contra
   `blog.html`: un enllaç a `#post-loquesigui` que ja no hi és no peta, només
   deixa el lector al capdamunt del blog sense saber què buscava. */
const POSTS = [
  { anc: 'post-origen', ic: '🎬', t: 'L\'origen',
    d: 'Mazinguer i Horacio Motomachi reben l\'encàrrec del Gran Molekulon i baixen a buscar els 150.000.' },
  { anc: 'post-molekulon', ic: '🧬', t: 'La síntesi, a peu de carrer',
    d: 'Amb l\'estructura i l\'energia alhora, què fa el Comando quan toca de peus a terra.' },
  { anc: 'post-seny', ic: '🏛', t: 'Seny',
    d: 'L\'estructura que sosté quan els reptes es tornen intensos. La pinya abans que els dosos.' },
  { anc: 'post-rauxa', ic: '🔥', t: 'Rauxa',
    d: 'L\'energia que encén una vegada la matriu ja està armada. Sense pinya, és soroll.' },
  { anc: 'post-2', ic: '🦸', t: 'El teu perfil és una xarxa neuronal creativa',
    d: 'Ja no cal triar de quina cosa ets: ets una persona amb una reputació que travessa totes les capes.' }
];

/* ══ LECTURA DE LES FONTS ════════════════════════════════════════════════════ */
const APP = readFileSync(join(SOS, 'index.html'), 'utf8');

const blocHeroi = (APP.match(/^const CANONICAL_HEROES=\[[\s\S]*?\n\];/m) || [''])[0];
/* Cada fitxa sencera, per poder-ne treure tots els camps sense inventar-ne cap. */
const HEROIS = [...blocHeroi.matchAll(/\{name:'((?:[^'\\]|\\.)*)'[\s\S]*?\}(?=,\n  \{name:|\n\];)/g)]
  .map(m => {
    const txt = m[0];
    const camp = k => {
      const r = txt.match(new RegExp(k + ":'((?:[^'\\\\]|\\\\.)*)'"));
      return r ? r[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\') : '';
    };
    return { name: m[1].replace(/\\'/g, "'"), role: camp('role'), on: camp('on'),
      power: camp('power'), arma: camp('arma'), lletra: camp('lletra'), vna: camp('vna') };
  });

const OBJECTIU = Number((APP.match(/const COMANDO_TARGET=(\d+)/) || [, 0])[1]);
const RUTES = new Set([...(APP.match(/^const MODAL_ROUTES=\{[\s\S]*?\n\};/m) || [''])[0]
  .matchAll(/^\s{2}(\w+):\{open:/gm)].map(m => m[1]));

if (!HEROIS.length || !OBJECTIU) {
  console.log('✗ no es poden llegir CANONICAL_HEROES o COMANDO_TARGET de SOS/index.html');
  process.exit(1);
}

/* ══ COMPROVACIONS DEL QUE ES DECLARA ════════════════════════════════════════
   Van aquí i no a `check-comando.js` perquè són sobre les llistes d'aquest
   fitxer: si el generador escriu una porta morta, el més barat és no
   escriure-la. La guarda mira la pàgina; això mira la declaració. */
let fails = 0;
const bad = m => { fails++; console.log('  ✗ ' + m); };

const noms = new Set(HEROIS.map(h => h.name));
VIDEOS.filter(v => v.mena === 'personatge').forEach(v => {
  if (!noms.has(v.qui)) bad(`el vídeo «${v.titol}» diu que és de ${v.qui}, que no és al roster`);
});
VIDEOS.filter(v => v.url && !/^https?:/.test(v.url)).forEach(v => {
  if (!existsSync(join(SOS, v.url))) bad(`el vídeo «${v.titol}» apunta a ${v.url}, que no existeix`);
});
PASSOS.forEach(p => { if (!RUTES.has(p.ruta)) bad(`el pas ${p.n} obre la ruta «${p.ruta}», que no és a MODAL_ROUTES`); });
const BLOG = readFileSync(join(SOS, 'blog.html'), 'utf8');
POSTS.forEach(p => { if (!BLOG.includes(`id="${p.anc}"`)) bad(`el blog no té cap entrada «${p.anc}»`); });
EIXOS.forEach(e => {
  const d = e.on[1];
  if (/^https?:/.test(d) || d.startsWith('#')) return;
  const f = d.split('#')[0];
  if (!existsSync(join(SOS, f))) bad(`l'eix «${e.nom}» apunta a ${f}, que no existeix`);
  const r = d.split('#/')[1];
  if (r && !RUTES.has(r)) bad(`l'eix «${e.nom}» obre la ruta «${r}», que no és a MODAL_ROUTES`);
});
if (fails) { console.log(`\n❌ ${fails} problema${fails === 1 ? '' : 's'} a la declaració del Comando.`); process.exit(1); }

/* ══ L'HTML ══════════════════════════════════════════════════════════════════ */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mil = n => n.toLocaleString('ca-ES').replace(/ /g, '.');

const htmlEixos = () =>
  `<div class="eixos">\n` + EIXOS.map(e =>
    `  <div class="eix"><div class="eix-ic">${e.ic}</div>` +
    `<div class="eix-n">${esc(e.nom)}</div>` +
    `<p class="eix-q">${esc(e.que)}</p>` +
    `<a class="eix-on" href="${e.on[1]}">${esc(e.on[0])} →</a></div>`).join('\n') + `\n</div>`;

const htmlPassos = () =>
  `<div class="passos">\n` + PASSOS.map(p =>
    `  <div class="pas"><div class="pas-n">${p.n}</div>` +
    `<div class="pas-t">${p.ic} ${esc(p.t)}</div>` +
    `<p class="pas-d">${p.d}</p>` +
    `<a class="pas-cta" href="index.html#/${p.ruta}">${esc(p.cta)} →</a></div>`).join('\n') +
  `\n</div>\n<a class="decorat" href="${DECORAT.href}"><span class="dec-ic">🏘</span>` +
  `<span><strong>I el poble on passa és ${esc(DECORAT.t)}.</strong> ${esc(DECORAT.d)}</span>` +
  `<span class="dec-fl">→</span></a>`;

const MENA_LBL = { personatge: 'Personatge', directe: 'Directe', tema: 'Tema' };
const htmlVideos = () => {
  const fitxa = v => {
    const cap = `<div class="vid-mena">${MENA_LBL[v.mena] || esc(v.mena)}</div>` +
      `<div class="vid-t">${esc(v.titol)}</div><p class="vid-d">${esc(v.d)}</p>`;
    if (v.url) {
      const fora = /^https?:/.test(v.url);
      return `  <a class="vid" href="${v.url}"${fora ? ' target="_blank" rel="noopener"' : ''}>${cap}` +
        `<span class="vid-go">▶ Mira-ho</span></a>`;
    }
    return `  <div class="vid vid-buit">${cap}<span class="vid-no">Encara no en tenim l'enllaç</span></div>`;
  };
  const falten = VIDEOS.filter(v => !v.url).length;
  return `<div class="vids">\n` + VIDEOS.map(fitxa).join('\n') + `\n</div>\n` +
    /* La nota diu «no tenen enllaç públic» i no «estan filmades»: si ho estan
       o no, ho sap l'autor i no aquest fitxer. Escriure-hi el que no se sap és
       la mateixa mentida amable que un «pròximament». */
    (falten ? `<p class="vids-nota">De les ${VIDEOS.length} peces que el projecte preveu, ` +
      `<strong>${falten} encara no tenen enllaç públic</strong>. Surten aquí perquè es vegi què hi ha i ` +
      `què falta — no com una promesa amb un enllaç que no obre: el dia que en tinguem l'adreça, ` +
      `aquesta mateixa targeta s'obre.</p>` : '');
};

const htmlPosts = () =>
  `<div class="posts">\n` + POSTS.map(p =>
    `  <a class="post" href="blog.html#${p.anc}"><span class="post-ic">${p.ic}</span>` +
    `<span><span class="post-t">${esc(p.t)}</span>` +
    `<span class="post-d">${esc(p.d)}</span></span></a>`).join('\n') + `\n</div>`;

/* Les fitxes d'heroi. El `hue` surt del nom perquè el mateix personatge tingui
   sempre el mateix color aquí i a l'app, que fa el mateix amb `_colorFromName`. */
const hue = nom => { let h = 0; for (const c of nom) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
const inicials = nom => nom.split(/[\s-]+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();

const htmlHerois = () => {
  const vidDe = n => VIDEOS.find(v => v.qui === n && v.url);
  return `<div class="heroes" style="text-align:left">\n` + HEROIS.map(h => {
    const v = vidDe(h.name);
    return `<div class="hcard">\n` +
      `<div class="hcard-head"><div class="hcard-avatar" style="background:hsl(${hue(h.name)},62%,44%)">${esc(inicials(h.name))}</div>\n` +
      `<div><div class="hcard-nm">${esc(h.name)}</div><div class="hcard-role">${esc(h.role)}</div></div></div>\n` +
      `<div class="hcard-power">${esc(h.power)}</div>\n` +
      (h.arma ? `<div class="hcard-arma"><span>Superarma</span> ${esc(h.arma)}</div>\n` : '') +
      (h.lletra ? `<div class="hcard-lletra">${esc(h.lletra)}</div>\n` : '') +
      `<div class="hcard-vna"><span>A un equip</span> ${esc(h.vna)}</div>\n` +
      `<div><span class="hfont">${esc(h.on)}</span>` +
      (v ? ` <a class="hfont hfont-go" href="${v.url}">▶ ${esc(MENA_LBL[v.mena] || v.mena)}</a>` : '') +
      `</div>\n</div>`;
  }).join('\n') + `\n</div>`;
};

const htmlComptador = () =>
  `<div class="counter">\n` +
  `<div class="item"><div class="n">${mil(OBJECTIU)}</div><div class="l">coprotagonistes</div></div>\n` +
  `<div class="item"><div class="n">${HEROIS.length}</div><div class="l">herois canònics</div></div>\n` +
  `<div class="item"><div class="n">2</div><div class="l">còmics publicats</div></div>\n` +
  `</div>`;

/* ══ ESCRIPTURA ══════════════════════════════════════════════════════════════ */
const BLOCS = [
  ['<!--CM-COMPTADOR-->', '<!--/CM-COMPTADOR-->', htmlComptador],
  ['<!--CM-EIXOS-->', '<!--/CM-EIXOS-->', htmlEixos],
  ['<!--CM-PASSOS-->', '<!--/CM-PASSOS-->', htmlPassos],
  ['<!--CM-VIDEOS-->', '<!--/CM-VIDEOS-->', htmlVideos],
  ['<!--CM-HEROIS-->', '<!--/CM-HEROIS-->', htmlHerois],
  ['<!--CM-POSTS-->', '<!--/CM-POSTS-->', htmlPosts]
];

function posa(html) {
  for (const [obre, tanca, fn] of BLOCS) {
    const i = html.indexOf(obre), k = html.indexOf(tanca);
    if (i < 0 || k < i) return { err: `hi falten les marques ${obre} … ${tanca}` };
    html = html.slice(0, i) + obre + '\n' + fn() + '\n' + html.slice(k);
  }
  return { html };
}

/* El document del projecte. Serveix per a dues coses que la pàgina no fa: dir
   què falta per filmar en una llista que es pot passar a algú, i deixar
   escrita la tesi perquè no s'hagi de reconstruir llegint HTML. */
const md = () => `# Comando Molekulon · el projecte de pel·lícula

> Generat per \`SOS/tools/build-comando.js\`. No l'editis a mà: edita el generador.

## La tesi

**${TESI.titol}.** ${TESI.sub.replace(/<[^>]+>/g, '')}

## Els sis eixos

| Eix | Què vol dir | On es fa |
|---|---|---|
${EIXOS.map(e => `| ${e.ic} ${e.nom} | ${e.que} | ${e.on[0]} (\`${e.on[1]}\`) |`).join('\n')}

## Com hi entra una persona

${PASSOS.map(p => `${p.n}. **${p.t}** — ${p.d.replace(/<[^>]+>/g, '')} → \`index.html#/${p.ruta}\``).join('\n')}

I el decorat és **${DECORAT.t}** (\`${DECORAT.href}\`).

## Els ${HEROIS.length} herois canònics

${HEROIS.map(h => `- **${h.name}** · ${h.role} — ${h.vna} _(${h.on})_`).join('\n')}

## Mitjans · què hi ha i què falta

| Peça | Mena | Qui | Estat |
|---|---|---|---|
${VIDEOS.map(v => `| ${v.titol} | ${MENA_LBL[v.mena] || v.mena} | ${v.qui || '—'} | ${v.url ? '`' + v.url + '`' : '**falta l\'enllaç**'} |`).join('\n')}

${VIDEOS.filter(v => !v.url).length
    ? `**Pendent d'enllaç:** ${VIDEOS.filter(v => !v.url).map(v => v.titol).join(', ')}. ` +
      'Mentre no hi siguin, la pàgina els ensenya dient que encara no hi són — no com una porta tancada.'
    : 'Totes les peces tenen enllaç.'}

## El blog del Comando

${POSTS.map(p => `- [${p.t}](../blog.html#${p.anc}) — ${p.d}`).join('\n')}
`;

const fPag = join(SOS, 'comando.html');
const fMd = join(SOS, 'knowledge', 'vision', 'comando-peli.md');

if (CHECK) {
  console.log('\nGuarda del Comando · la pàgina surt de les llistes declarades');
  let mal = 0;
  const pagina = readFileSync(fPag, 'utf8');
  const r = posa(pagina);
  if (r.err) { mal++; console.log(`  ✗ a comando.html ${r.err}`); }
  else if (r.html !== pagina) { mal++; console.log('  ✗ comando.html està vell: corre `node SOS/tools/build-comando.js`'); }
  else console.log(`  ✓ els ${BLOCS.length} blocs de comando.html quadren amb el generador`);
  if (!existsSync(fMd) || readFileSync(fMd, 'utf8') !== md()) {
    mal++; console.log('  ✗ knowledge/vision/comando-peli.md està vell: corre `node SOS/tools/build-comando.js`');
  } else console.log('  ✓ i el document del projecte també');
  console.log(mal ? `\n❌ ${mal} problema${mal === 1 ? '' : 's'}.` : '\n✅ El Comando quadra.');
  process.exit(mal ? 1 : 0);
}

const pagina = readFileSync(fPag, 'utf8');
const r = posa(pagina);
if (r.err) { console.log(`✗ a comando.html ${r.err}`); process.exit(1); }
if (r.html !== pagina) writeFileSync(fPag, r.html);
writeFileSync(fMd, md());
console.log(`✅ Comando escrit · ${BLOCS.length} blocs, ${HEROIS.length} herois, ${EIXOS.length} eixos, ` +
  `${PASSOS.length} passos, ${VIDEOS.length} peces (${VIDEOS.filter(v => !v.url).length} sense enllaç) i ${POSTS.length} entrades del blog`);

module.exports = { TESI, EIXOS, PASSOS, VIDEOS, POSTS, DECORAT };
