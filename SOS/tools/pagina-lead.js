/* La pàgina per al lead · el x % del seu mapa abans de la visita
 * ─────────────────────────────────────────────────────────────
 * Demanat per l'Àlvar (17/10/2026): una pàgina que s'envia al lead abans de
 * visitar-lo, amb el x % del seu mapa de valor que el sistema ja pot preparar,
 * perquè a la visita es parli de l'estratègic i el tàctic. Les quatre decisions
 * (on viu, què vol dir «IA integrada», què compta el x % i el permís) són seves
 * del mateix dia; el detall, al backlog («La pàgina per al lead»).
 *
 * `proposta.js --lead` la crida i escriu `lead.html` a la carpeta de la
 * proposta. Un sol fitxer: sense JavaScript, sense res que es carregui de fora,
 * `noindex` i sense referer. La xifra és la de `automatitza.js` (la regla de
 * l'app) i el dibuix, el de la landing.
 *
 * Abans d'escriure-la es comprova. Si alguna comprovació falla, no s'escriu, i
 * si n'hi havia una d'abans s'esborra: una pàgina vella que ja no passa no ha
 * d'anar a ningú.
 *
 *   · cap `<script>`, cap `on…=`, cap `src`, cap `<link>` i cap `url(` que no
 *     sigui del mateix dibuix;
 *   · `noindex` i `no-referrer`;
 *   · sense correus, telèfons ni imports al text;
 *   · sense cites de la web: cap tros de vuit paraules seguides de les fonts,
 *     amb les entitats desfetes (`&aacute;`, `&#8217;`) i comptant també el
 *     que porten els atributs (la descripció, el `alt`, el `title`). Els
 *     filtres no atrapen els noms de persones, i per això no s'hi copia res;
 *   · amb `revisat`, només d'un `mapa.json` que passa les regles dures, i en
 *     castellà només amb `preguntas-visita.md` (les del diagnòstic surten en
 *     català).
 *
 * Sense `revisat` la pàgina diu «ESBORRANY INTERN» i no porta botó.
 *
 * **La carpeta del lead va fora d'aquest repositori**, que es publica, i és
 * d'un sol negoci (`lead.json`): si és a dins o és d'un altre, no es fa res.
 * «Com s'ha fet» diu que es va llegir la web amb permís i respectant robots.txt
 * només si la baixada ho va deixar escrit (`fuentes/.lectura.json`,
 * d'`analitza-contingut.js`) i els fitxers que va desar encara hi són; si no,
 * diu de quantes fonts surt, sense prometre res. */
'use strict';
const { readFileSync, writeFileSync, existsSync, rmSync, realpathSync } = require('node:fs');
const { join, resolve, relative, isAbsolute, dirname, basename } = require('node:path');
const { randomBytes } = require('node:crypto');
const X = require('./automatitza.js');

const VISITA = 'https://teamtowershuma.com/visita/';
const IA = 'https://teamtowershuma.com/SOS/ia.html';
const LEGAL = 'https://teamtowershuma.com/avis-legal.html#navegador';

/* Els noms dels tipus d'entregable en castellà. Els de l'app (`ENTREGABLES`)
   només són en català; `test-pagina-lead.mjs` falla si l'app n'afegeix un que
   aquí no hi és. */
const TIPUS_ES = {
  acta: 'Acta de reunión', informe: 'Informe periódico', justificacio: 'Justificación de subvención', inventari: 'Inventario',
  convocatoria: 'Convocatoria', comanda: 'Pedido o reparto', fitxa: 'Ficha pública', pressupost: 'Presupuesto', proposta: 'Propuesta',
  resposta: 'Respuesta a una consulta', acord: 'Acuerdo o decisión', cobrament: 'Factura o cobro'
};

const TXT = {
  es: {
    lang: 'es', intern: 'BORRADOR INTERNO', internD: 'No se envía: falta revisarla y pasar proposta.js con --revisat.',
    titol: 'Borrador para {nom}', sub: 'Leído de {n} de su web pública', subF: 'Hecho con {n}', pag: ['página', 'páginas'], font: ['fuente', 'fuentes'], subRev: 'revisado por TeamTowers',
    segell: 'Estimación · borrador',
    xifra: 'De las {t} entregas de tu red, el sistema puede preparar {m}; {v} las decidimos en la visita.',
    xifra1: 'De las {t} entregas de tu red, el sistema puede preparar {m}; 1 la decidimos en la visita.',
    xifra0: 'De las {t} entregas de tu red, el sistema puede preparar {m}.',
    xifraP: 'Las otras {h} son de una persona, y así deben seguir.', xifraP1: 'La otra es de una persona, y así debe seguir.',
    xarxa: 'Tu red', xarxaD: 'Cada flecha es una entrega entre dos roles. Las gruesas son las que puede preparar el sistema.',
    llT: 'tangible (se puede reclamar)', llI: 'intangible (se espera, no se exige)', llM: 'la prepara el sistema',
    sistema: 'Lo que prepara el sistema', sistemaD: 'El sistema deja el borrador y una persona del rol lo acepta antes de que salga.',
    tipus: 'Tipo', accepta: 'Lo acepta', amb: 'Con', cap: 'Todavía ninguna: en la visita vemos cuáles pueden serlo.', capT: 'Ninguna en este mapa.',
    capS0: 'Ninguna en este mapa: lo que hay son intangibles, cobros y acuerdos.',
    teu: 'Lo que sigue siendo tuyo', teuD: 'Los intangibles, los cobros y los acuerdos. Es lo estratégico y lo táctico, y es donde vale la pena que pongas tu tiempo.',
    visita: 'Lo decidimos en la visita', visitaD: 'Todavía no sabemos qué entregable piden. Un mapa mejor automatiza más.',
    visitaD0: 'Todas las entregas tienen un tipo conocido: la visita es para lo estratégico y lo táctico.',
    preg: ['Una pregunta para la visita', 'Dos preguntas para la visita', 'Tres preguntas para la visita'],
    boto: 'Reservemos la visita', no: 'Esto no es así',
    com: 'Cómo se ha hecho',
    c1: 'Leímos {n} de tu web pública el {data}, con tu permiso, respetando robots.txt y sin prisa entre página y página.',
    c1F: 'Partimos de {n}: lo que nos enviaste o guardamos de tu web pública.',
    c2propi: 'Con eso se escribió el mapa de tu red con el método de TeamTowers.',
    c2esb: 'Con eso, un análisis automático dibujó un esbozo del mapa, sin ningún modelo de IA.',
    c2rev: 'Una persona de TeamTowers lo revisó antes de enviártelo.',
    c3: 'Lo pasamos por las reglas de la casa: {r}.', c3ok: 'pasa las reglas duras', c3no: 'todavía tiene reglas duras abiertas',
    c4: 'Cada entrega se clasificó con la misma regla que usa nuestra app: la prepara el sistema, la hace una persona o se decide en la visita.',
    c5: 'Esta página no llama a ningún modelo de IA y no cuenta visitas ni clics.',
    iaL: 'Cómo usamos la IA', legalL: 'Aviso legal',
    claude: 'Continúa con tu Claude', claudeD: 'Copia esto en tu propio Claude (o en otra IA) y sigue tú:',
    prompt: 'Este es el mapa de valor de mi negocio, en el formato de TeamTowers. Dime qué entregas podría preparar una máquina y cuáles tienen que seguir siendo de una persona, y hazme las preguntas que mejorarían el mapa.',
    peu: 'TeamTowers · {data}'
  },
  ca: {
    lang: 'ca', intern: 'ESBORRANY INTERN', internD: 'No s\'envia: falta revisar-la i passar proposta.js amb --revisat.',
    titol: 'Esborrany per a {nom}', sub: 'Llegit de {n} de la seva web pública', subF: 'Fet amb {n}', pag: ['pàgina', 'pàgines'], font: ['font', 'fonts'], subRev: 'revisat per TeamTowers',
    segell: 'Estimació · esborrany',
    xifra: 'Dels {t} lliuraments de la teva xarxa, el sistema en pot preparar {m}; {v} els decidim a la visita.',
    xifra1: 'Dels {t} lliuraments de la teva xarxa, el sistema en pot preparar {m}; 1 el decidim a la visita.',
    xifra0: 'Dels {t} lliuraments de la teva xarxa, el sistema en pot preparar {m}.',
    xifraP: 'Els altres {h} són d\'una persona, i així han de seguir.', xifraP1: 'L\'altre és d\'una persona, i així ha de seguir.',
    xarxa: 'La teva xarxa', xarxaD: 'Cada fletxa és un lliurament entre dos rols. Les gruixudes són les que pot preparar el sistema.',
    llT: 'tangible (es pot reclamar)', llI: 'intangible (s\'espera, no s\'exigeix)', llM: 'el prepara el sistema',
    sistema: 'El que prepara el sistema', sistemaD: 'El sistema deixa l\'esborrany i una persona del rol l\'accepta abans que surti.',
    tipus: 'Tipus', accepta: 'L\'accepta', amb: 'Amb', cap: 'Encara cap: a la visita mirem quins ho poden ser.', capT: 'Cap en aquest mapa.',
    capS0: 'Cap en aquest mapa: el que hi ha són intangibles, cobraments i acords.',
    teu: 'El que continua sent teu', teuD: 'Els intangibles, els cobraments i els acords. És l\'estratègic i el tàctic, i és on val la pena que hi posis el temps.',
    visita: 'Ho decidim a la visita', visitaD: 'Encara no sabem quin entregable demanen. Un mapa millor automatitza més.',
    visitaD0: 'Tots els lliuraments tenen un tipus conegut: la visita és per a l\'estratègic i el tàctic.',
    preg: ['Una pregunta per a la visita', 'Dues preguntes per a la visita', 'Tres preguntes per a la visita'],
    boto: 'Reservem la visita', no: 'Això no és així',
    com: 'Com s\'ha fet',
    c1: 'Vam llegir {n} de la teva web pública el {data}, amb el teu permís, respectant el robots.txt i sense presses entre pàgina i pàgina.',
    c1F: 'Vam partir de {n}: el que ens vas enviar o el que vam desar de la teva web pública.',
    c2propi: 'Amb això es va escriure el mapa de la teva xarxa amb el mètode de TeamTowers.',
    c2esb: 'Amb això, una anàlisi automàtica va dibuixar un esbós del mapa, sense cap model d\'IA.',
    c2rev: 'Una persona de TeamTowers el va revisar abans d\'enviar-te\'l.',
    c3: 'El vam passar per les regles de la casa: {r}.', c3ok: 'passa les regles dures', c3no: 'encara té regles dures obertes',
    c4: 'Cada lliurament es va classificar amb la mateixa regla que fa servir la nostra app: el prepara el sistema, el fa una persona o es decideix a la visita.',
    c5: 'Aquesta pàgina no crida cap model d\'IA i no compta visites ni clics.',
    iaL: 'Com fem servir la IA', legalL: 'Avís legal',
    claude: 'Continua amb el teu Claude', claudeD: 'Copia això al teu propi Claude (o a una altra IA) i segueix tu:',
    prompt: 'Aquest és el mapa de valor del meu negoci, en el format de TeamTowers. Digues-me quins lliuraments podria preparar una màquina i quins han de continuar sent d\'una persona, i fes-me les preguntes que millorarien el mapa.',
    peu: 'TeamTowers · {data}'
  }
};

/* La data d'avui, la del rellotge de qui ho fa i no la d'UTC. */
const avui = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const e = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nomTipus = (id, llengua) => {
  if (!id) return '';
  if (llengua === 'es' && TIPUS_ES[id]) return TIPUS_ES[id];
  const t = X.ENTREGABLES.find(x => x.id === id);
  return t ? t.nom : id;
};

/* Les entitats, desfetes totes: les numèriques (`&#8217;`, `&#xE9;`), les
   lletres amb accent (`&aacute;`, `&Ntilde;`) i les de puntuació corrents. Sense
   això, «s&aacute;bado» es partia en tres paraules i una cita passava. */
const ACCENT = { acute: '\u0301', grave: '\u0300', uml: '\u0308', circ: '\u0302', tilde: '\u0303', cedil: '\u0327', ring: '\u030A' };
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', laquo: '«', raquo: '»',
  hellip: '…', ndash: '–', mdash: '—', middot: '·', szlig: 'ß', aelig: 'æ', oslash: 'ø', euro: '€', iexcl: '¡', iquest: '¿', ordf: 'ª', ordm: 'º',
  deg: '°', copy: '©', reg: '®', trade: '™', bull: '•', sup1: '¹', sup2: '²', sup3: '³', ensp: ' ', emsp: ' ', thinsp: ' ', shy: '', zwnj: '', zwj: '' };
const desEnt = s => String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, k) => {
  if (k[0] === '#') { const n = k[1] === 'x' || k[1] === 'X' ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10); try { return String.fromCodePoint(n); } catch (e) { return ' '; } }
  if (ENT[k] != null) return ENT[k];
  const a = /^([a-z])(acute|grave|uml|circ|tilde|cedil|ring)$/i.exec(k);
  /* Una entitat que no coneixem no deixa les seves lletres al text: partiria
     la frase i la cita passaria. */
  return a ? (a[1] + ACCENT[a[2].toLowerCase()]).normalize('NFC') : '';
});
/* El text que es llegeix, sense etiquetes: és el que es comprova a la pàgina.
   Els atributs de la pàgina (els camins del dibuix) no són text i no compten. */
const text = html => desEnt(String(html).replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '));
/* D'una font, a més, el que porten els atributs que es llegeixen: la
   descripció, el `alt` d'una imatge, el `title`. És on sol viure la frase que
   un mapa acaba copiant. */
const textFont = html => text(html) + ' ' + [...String(html).matchAll(/\s(?:content|alt|title|aria-label)\s*=\s*("([^"]*)"|'([^']*)')/gi)].map(m => desEnt(m[2] != null ? m[2] : m[3])).join(' . ');
/* I el mateix sense les etiquetes de dins de la línia: un títol amb cada
   lletra en un <span> (els titulars animats) es llegeix sencer a la pantalla. */
const INLINE = /<\/?(?:span|b|strong|em|i|u|a|small|sup|sub|mark|abbr|font)\b[^>]*>/gi;
const textFontJunt = html => text(String(html).replace(INLINE, ''));
/* Els caràcters de format (el guionet opcional, l'espai de zero) no es veuen
   i no parteixen cap paraula. */
const paraules = s => String(s).normalize('NFC').replace(/\p{Cf}/gu, '').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
const TROS = 8;
function trossos(s) {
  const p = paraules(s), out = new Set();
  for (let i = 0; i + TROS <= p.length; i++) out.add(p.slice(i, i + TROS).join(' '));
  return out;
}

/* Les comprovacions. Tornen la llista del que falla, buida si tot passa. */
function comprova(html, o) {
  /* Al bloc del mapa (JSON dins de <pre>), un salt de línia és «\n»: es torna
     espai perquè la «n» no s'enganxi a la paraula següent. */
  const f = [], t = text(html).replace(/\\[ntr]/g, ' ');
  /* Per als correus, telèfons i imports, cada etiqueta fa de frontera: unes
     xifres de dos elements (l'any del títol del dibuix i el nombre de rols de
     la descripció) no fan un telèfon. */
  const td = desEnt(String(html).replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' | ')).replace(/\\[ntr]/g, ' ');
  if (/<script\b/i.test(html)) f.push('porta <script>');
  if (/\son[a-z]+\s*=/i.test(html)) f.push('porta un atribut on…=');
  if (/\ssrc\s*=/i.test(html) || /<link\b/i.test(html) || /<(img|iframe|object|embed|video|audio)\b/i.test(html)) f.push('carrega alguna cosa (src, link, img…)');
  if (/url\(\s*(?!#)/i.test(html) || /@import/i.test(html)) f.push('porta un url() o un @import que no és del mateix dibuix');
  if (/javascript:/i.test(html)) f.push('porta un enllaç javascript:');
  if (!/<meta name="robots" content="noindex/.test(html)) f.push('no porta noindex');
  if (!/<meta name="referrer" content="no-referrer">/.test(html)) f.push('no porta no-referrer');
  if (/[^\s@<>()"]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)*\.\p{L}{2,}/u.test(td)) f.push('el text porta un correu');
  if (/\+?\(?\d(?:[\s().\/-]{0,2}\d){8,}/.test(td)) f.push('el text porta un telèfon');
  if (/\d\s*(?:€|eur(?:os?)?\b)|€\s*\d|\beuros?\b|\bEUR\b/i.test(td)) f.push('el text porta un import');
  if (o.fonts && o.fonts.length) {
    const meus = trossos(t);
    const font = o.fonts.find(x => [...trossos(textFont(x.cos)), ...trossos(textFontJunt(x.cos))].some(k => meus.has(k)));
    if (font) f.push('cita la web: hi ha vuit paraules seguides de ' + font.nom);
  }
  if (o.revisat && /class="intern"/.test(html)) f.push('revisada però diu esborrany intern');
  if (!o.revisat && html.includes(VISITA)) f.push('l\'esborrany intern porta el botó');
  return f;
}

/* L'identificador de la pàgina: aleatori, es crea un cop i es guarda a
   `lead.json` amb el nom del negoci, perquè regenerar-la no canviï l'enllaç que
   ja té el lead. S'hi escriu només quan la pàgina passa les comprovacions.
   Mentre només hi ha hagut l'esborrany intern, que no s'envia, el nom es pot
   corregir i la referència es manté. Un cop s'ha escrit la pàgina revisada, la
   carpeta queda lligada al negoci (`revisat`): amb un altre nom no s'hi fa res,
   perquè el mapa, les fonts i la lectura serien de l'altre. Dos noms són el
   mateix si només canvien majúscules, espais o accents. */
const nomNet = s => String(s || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();
const mateixNom = (a, b) => nomNet(a) === nomNet(b);
function amoDeLaCarpeta(dir) {
  try { const x = JSON.parse(readFileSync(join(dir, 'lead.json'), 'utf8')); return /^[A-Za-z0-9_-]{16,}$/.test(x.ref) ? x : null; } catch (e) { return null; }
}
const lligada = (dir, nom) => { const x = amoDeLaCarpeta(dir); return x && x.revisat && !mateixNom(x.nom, nom) ? x.nom : null; };
const missatgeAltre = nom => 'aquesta carpeta és de «' + nom + '», que ja té la pàgina revisada (lead.json): per a un altre negoci, una carpeta nova; si és el mateix i el nom ha canviat, corregeix «nom» a lead.json';

/* La carpeta d'un lead no pot ser dins d'aquest repositori: es publica. Es
   mira pel camí de debò (un enllaç simbòlic no l'amaga), i també dins de
   qualsevol altra còpia del repositori: un worktree pot penjar d'una d'elles. */
const REPO = realpathSync(resolve(__dirname, '..', '..'));
function camiReal(dir) {
  let d = resolve(dir), resta = [];
  while (!existsSync(d)) { const p = dirname(d); if (p === d) break; resta.unshift(basename(d)); d = p; }
  try { d = realpathSync(d); } catch (e) { /* es queda com és */ }
  return join(d, ...resta);
}
function dinsDelRepo(dir) {
  const real = camiReal(dir), r = relative(REPO, real);
  if (!isAbsolute(r) && r.split(/[\\/]/)[0] !== '..') return true;
  for (let d = real; ; d = dirname(d)) {
    if (existsSync(join(d, 'SOS', 'tools', 'pagina-lead.js'))) return true;
    if (dirname(d) === d) return false;
  }
}

/* Les tres preguntes: les de qui revisa (`preguntas-visita.md`, una per línia,
   numerada («1.», «1)», «1.-») o amb guió; un guió sagnat amb dos espais o
   més és una nota i no surt) o, si no n'hi ha, les tres més greus del diagnòstic, que surten en
   català. */
function preguntes(dir, diag) {
  const f = join(dir, 'preguntas-visita.md');
  if (existsSync(f)) {
    const llista = readFileSync(f, 'utf8').split(/\r?\n/).map(l => /^(?:\s*\d+[.)º](?:\s*[-–—])?| ?[-*])\s+(.*\S)\s*$/.exec(l)).filter(m => m && /\p{L}/u.test(m[1])).map(m => m[1]).slice(0, 3);
    return { fitxer: true, propies: llista.length > 0, llista };
  }
  const ordre = { alta: 0, mitjana: 1, baixa: 2, nota: 3 };
  const llista = [...new Set(diag.troballes.filter(t => t.pregunta).sort((x, y) => (ordre[x.gravetat] ?? 9) - (ordre[y.gravetat] ?? 9)).map(t => t.pregunta))].slice(0, 3);
  return { fitxer: false, propies: false, llista };
}

function css(marca) {
  const acc = /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(marca.color || '') ? marca.color : '#1f4e79';
  const lletra = /^[a-z0-9 ,'"-]{1,80}$/i.test(marca.lletra || '') ? marca.lletra + ', ' : '';
  return ':root{--acc:' + acc + ';--text:#1b1b1f;--mut:#55555f;--lin:#d9d9de;--bg:#fbfbf8;--panel:#ffffff;--blue:#1d4ed8;--purple:#86198f;--indigo:#3730a3;color-scheme:light dark}'
    + '@media (prefers-color-scheme:dark){:root{--text:#ececf1;--mut:#a9a9b3;--lin:#3a3a44;--bg:#15151a;--panel:#1f1f26;--blue:#7aa2ff;--purple:#e08ef0;--indigo:#a5b4fc}}'
    + '*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:17px/1.55 ' + lletra + 'system-ui,-apple-system,"Segoe UI",sans-serif}'
    + 'main,header,footer{max-width:46rem;margin:0 auto;padding:0 16px}header{padding-top:1.5rem}'
    + '.marca{font-weight:700;color:var(--acc);margin:0}.sub{color:var(--mut);margin:.2rem 0 0;font-size:.95rem}'
    + '.segell{display:inline-block;margin:.9rem 0 0;padding:.15rem .55rem;border:1px solid var(--acc);border-radius:99px;font-size:.85rem;color:var(--acc)}'
    + 'h1{font-size:1.45rem;line-height:1.3;margin:.8rem 0 .4rem}h2{font-size:1.2rem;margin:2.2rem 0 .5rem}'
    + '.intern{background:#b42318;color:#fff;font-weight:700;text-align:center;padding:.6rem 16px;margin:0}.intern span{display:block;font-weight:400;font-size:.9rem}'
    + '.botons{display:flex;flex-wrap:wrap;gap:.7rem;margin:1.2rem 0}.boto{display:inline-block;padding:.75rem 1.1rem;border-radius:.5rem;text-decoration:none;font-weight:600;background:var(--acc);color:#fff}'
    + '.boto.no{background:transparent;color:var(--acc);border:1px solid var(--acc)}'
    + 'ul.ll{padding-left:1.1rem}ul.ll li{margin:.45rem 0}.ll small{display:block;color:var(--mut)}'
    + '.mapa{overflow-x:auto;border:1px solid var(--lin);border-radius:.5rem;background:var(--panel);margin:.6rem 0}'
    + '.mv-svg{display:block;width:100%;min-width:600px;height:auto}.mv-svg .mv-nc{fill:var(--panel)}.mv-svg .mv-n text{fill:var(--text);font-family:inherit}'
    + '.mv-pols{display:none}.mv-f[data-qui=maquina]{stroke-width:3.4;opacity:1}'
    + '.llegenda{display:flex;flex-wrap:wrap;gap:.4rem 1.2rem;font-size:.9rem;color:var(--mut);padding:0;list-style:none}'
    + '.llegenda b{display:inline-block;width:1.6rem;vertical-align:middle;margin-right:.35rem;border-top:2px solid var(--blue)}'
    + '.llegenda .i b{border-top:2px dashed var(--purple)}.llegenda .m b{border-top-width:4px}'
    + 'details{border:1px solid var(--lin);border-radius:.5rem;padding:.6rem .8rem;margin:1rem 0}summary{cursor:pointer;font-weight:600}'
    + 'pre{white-space:pre-wrap;word-break:break-word;font-size:.8rem;max-height:22rem;overflow:auto;background:var(--panel);padding:.6rem;border-radius:.4rem}'
    + 'a{color:var(--acc)}footer{color:var(--mut);font-size:.85rem;padding-bottom:2rem;margin-top:2.5rem}';
}

/* La pàgina. `o`: { dir, mapa, aut, diag, nom, llengua, marca, fonts, lectura,
   propi, revisat, data }. Torna { escrita, fitxer, falla[] }. */
function paginaLead(o) {
  const T = TXT[o.llengua] || TXT.es, llengua = T.lang, aut = o.aut, fitxer = join(o.dir, 'lead.html');
  const nega = falla => { rmSync(fitxer, { force: true }); return { escrita: false, fitxer, falla }; };
  if (dinsDelRepo(o.dir)) return { escrita: false, fitxer, falla: ['la carpeta del lead és dins del repositori de TeamTowers, que es publica: posa-la fora (per exemple, ../leads/<negoci>/)'] };
  if (existsSync(join(o.dir, 'lead.json')) && !amoDeLaCarpeta(o.dir)) return { escrita: false, fitxer, falla: ['lead.json no es pot llegir o no porta «ref»: arregla\'l o, si encara no s\'ha enviat res, esborra\'l'] };
  const altre = lligada(o.dir, o.nom);
  if (altre) return { escrita: false, fitxer, falla: [missatgeAltre(altre)] };
  const pq = preguntes(o.dir, o.diag);
  const previ = [];
  if (o.revisat && pq.fitxer && !pq.propies) previ.push('preguntas-visita.md no té cap pregunta: una per línia, numerada o amb guió');
  if (o.revisat && !o.propi) previ.push('--revisat demana mapa.json: l\'esbós no s\'envia');
  if (o.revisat && o.diag.provisional) previ.push('--revisat demana un mapa que passi les regles dures');
  if (o.revisat && llengua !== 'ca' && !pq.propies && !pq.fitxer) previ.push('--revisat en castellà demana preguntas-visita.md: les preguntes del diagnòstic surten en català');
  if (previ.length) return nega(previ);

  /* El que diu d'on surt, només si consta: la lectura de la web la deixa
     escrita la baixada; si no hi és, es diu de quantes fonts surt. */
  const noms = new Set((o.fonts || []).map(f => f.nom));
  const lec = o.lectura && Number(o.lectura.pagines) > 0 && /^\d{4}-\d{2}-\d{2}$/.test(o.lectura.data || '')
    && Array.isArray(o.lectura.fitxers) && o.lectura.fitxers.length === Number(o.lectura.pagines) && o.lectura.fitxers.every(n => noms.has(n)) ? o.lectura : null;
  const nFonts = (o.fonts || []).filter(f => /\.(html?|md|markdown|txt)$/i.test(f.nom)).length;
  const pl = (n, f) => n + ' ' + f[n === 1 ? 0 : 1];
  const pags = lec ? pl(Number(lec.pagines), T.pag) : pl(nFonts, T.font);
  /* En català, «de 1» i «el 1/…» s'apostrofen: «d'1 font», «l'1/10/2026». */
  const apo = s => llengua === 'ca' ? s.replace(/\bde (1|11) /g, 'd\'$1 ').replace(/\bel (1|11)\//g, 'l\'$1/') : s;
  const dm = d => d.split('-').map(Number).reverse().join('/');
  const data = dm(/^\d{4}-\d{2}-\d{2}$/.test(o.data || '') ? o.data : avui());
  const amo = amoDeLaCarpeta(o.dir), ref = amo ? amo.ref : randomBytes(12).toString('base64url');
  const de = q => aut.lliuraments.filter(l => l.qui === q);
  const fila = (l, extra) => '<li><b>' + e(l.que) + '</b> · ' + e(l.de) + ' → ' + e(l.a) + (extra ? '<small>' + extra + '</small>' : '') + '</li>';
  const TA = X.TXT[llengua] || X.TXT.ca;
  const motiu = l => l.motiu === 'intangible' ? TA.m.intangible : TA.m.tipus + ' (' + nomTipus(l.tipus, llengua) + ')';
  const llista = (ls, f, buit) => ls.length ? '<ul class="ll">' + ls.map(f).join('') + '</ul>' : buit ? '<p>' + e(buit) + '</p>' : '';
  const xifra = (aut.visita === 0 ? T.xifra0 : aut.visita === 1 ? T.xifra1 : T.xifra).replace('{t}', aut.total).replace('{m}', aut.maquina).replace('{v}', aut.visita);
  const xifraP = aut.persona === 0 ? '' : aut.persona === 1 ? T.xifraP1 : T.xifraP.replace('{h}', aut.persona);
  const botons = o.revisat ? '<p class="botons"><a class="boto" href="' + e(VISITA + '?r=' + ref + '&l=' + llengua + '&m=si') + '">' + e(T.boto) + '</a>'
    + '<a class="boto no" href="' + e(VISITA + '?r=' + ref + '&l=' + llengua + '&m=no') + '">' + e(T.no) + '</a></p>' : '';
  const svg = X.dibuix(o.mapa, { llengua, mesura: aut, id: 'mvLead' });
  const com = [apo(lec ? T.c1.replace('{n}', pags).replace('{data}', dm(lec.data)) : T.c1F.replace('{n}', pags)), (o.propi ? T.c2propi : T.c2esb) + (o.revisat ? ' ' + T.c2rev : ''),
    T.c3.replace('{r}', o.diag.provisional ? T.c3no : T.c3ok), T.c4, T.c5];
  const marca = o.marca || {};
  const html = '<!DOCTYPE html>\n<html lang="' + llengua + '">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + '<meta name="robots" content="noindex, nofollow">\n<meta name="referrer" content="no-referrer">\n'
    + '<title>' + e(T.titol.replace('{nom}', o.nom)) + '</title>\n<style>' + css(marca) + '</style>\n</head>\n<body>\n'
    + (o.revisat ? '' : '<p class="intern" role="note">' + e(T.intern) + '<span>' + e(T.internD) + '</span></p>\n')
    + '<header>\n<p class="marca">' + e(o.nom) + '</p>\n<p class="sub">' + e(T.titol.replace('{nom}', o.nom)) + ' · ' + e(apo((lec ? T.sub : T.subF).replace('{n}', pags))) + (o.revisat ? ' · ' + e(T.subRev) : '') + '</p>\n'
    + '<p class="segell">' + e(T.segell) + '</p>\n'
    + '<h1>' + e(xifra) + '</h1>\n'
    + (xifraP ? '<p>' + e(xifraP) + '</p>\n' : '') + botons + '\n</header>\n<main>\n'
    + '<section aria-labelledby="t-xarxa">\n<h2 id="t-xarxa">' + e(T.xarxa) + '</h2>\n<p>' + e(T.xarxaD) + '</p>\n<div class="mapa">' + svg + '</div>\n'
    + '<ul class="llegenda"><li><b></b>' + e(T.llT) + '</li><li class="i"><b></b>' + e(T.llI) + '</li><li class="m"><b></b>' + e(T.llM) + '</li></ul>\n</section>\n'
    + '<section aria-labelledby="t-sistema">\n<h2 id="t-sistema">' + e(T.sistema) + ' (' + aut.maquina + ')</h2>\n<p>' + e(T.sistemaD) + '</p>\n'
    + llista(de('maquina'), l => fila(l, e(T.tipus) + ': ' + e(nomTipus(l.tipus, llengua)) + ' · ' + e(T.accepta) + ': ' + e(l.de) + (l.producte ? ' · ' + e(T.amb) + ': ' + e(l.producte) : '')), aut.visita ? T.cap : T.capS0) + '\n</section>\n'
    + '<section aria-labelledby="t-teu">\n<h2 id="t-teu">' + e(T.teu) + ' (' + aut.persona + ')</h2>\n<p>' + e(T.teuD) + '</p>\n'
    + llista(de('persona'), l => fila(l, e(motiu(l))), T.capT) + '\n</section>\n'
    + '<section aria-labelledby="t-visita">\n<h2 id="t-visita">' + e(T.visita) + ' (' + aut.visita + ')</h2>\n<p>' + e(aut.visita ? T.visitaD : T.visitaD0) + '</p>\n'
    + llista(de('visita'), l => fila(l)) + '\n'
    + (pq.llista.length ? '<h3>' + e(T.preg[pq.llista.length - 1]) + '</h3>\n<ol>' + pq.llista.map(q => '<li>' + e(q) + '</li>').join('') + '</ol>\n' : '') + botons + '</section>\n'
    + '<section aria-labelledby="t-com">\n<h2 id="t-com">' + e(T.com) + '</h2>\n<ol>' + com.map(x => '<li>' + e(x) + '</li>').join('') + '</ol>\n'
    + '<p><a href="' + IA + '">' + e(T.iaL) + '</a> · <a href="' + LEGAL + '">' + e(T.legalL) + '</a></p>\n'
    + '<details>\n<summary>' + e(T.claude) + '</summary>\n<p>' + e(T.claudeD) + '</p>\n<pre>' + e(T.prompt + '\n\n' + JSON.stringify(o.mapa, null, 2)) + '</pre>\n</details>\n</section>\n'
    + '</main>\n<footer>\n<p>' + e(T.peu.replace('{data}', data)) + '</p>\n</footer>\n</body>\n</html>\n';
  const falla = comprova(html, { fonts: o.fonts, revisat: o.revisat });
  if (falla.length) return nega(falla);
  writeFileSync(join(o.dir, 'lead.json'), JSON.stringify({ ref, nom: o.nom, revisat: !!(o.revisat || (amo && amo.revisat)) }, null, 2) + '\n');
  writeFileSync(fitxer, html);
  return { escrita: true, fitxer, falla: [], ref };
}

module.exports = { paginaLead, comprova, dinsDelRepo, mateixNom, missatgeAltre, avui, TIPUS_ES, VISITA };
