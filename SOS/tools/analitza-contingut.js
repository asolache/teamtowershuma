#!/usr/bin/env node
/* Analitzar el que dona el client · sense API
 * ─────────────────────────────────────────────────────────────────
 * Demanat per l'Àlvar (10/10/2026): un sistema automàtic d'anàlisi dels
 * continguts que dona el client i d'elaboració de l'esborrany de la web.
 *
 * Llegeix una carpeta de fonts (les pàgines de la seva web desades en HTML, un
 * catàleg en Markdown o text, el seu CSS, el logo en SVG) i en treu, sense cap
 * model ni xarxa:
 *
 *  · **Què diu cada font:** títol, descripció, encapçalaments, llengua.
 *  · **Qui hi surt:** els candidats a rol (qui compra, qui visita, qui revèn,
 *    qui produeix, el lloc…) amb les frases on surten, com a evidència.
 *  · **Què s'hi dona:** els candidats a lliurament (el producte, la visita, la
 *    reserva, el pedido…), també amb evidència.
 *  · **El que la web no diu:** les preguntes (sense formulari, sense telèfon,
 *    una sola llengua, preus que ja cobra o que no diu…).
 *  · **La cara:** el color, la lletra, el lema, la presentació, on són i el
 *    logo, per a `marca.json` (el format del bloc VS-SITE).
 *  · **Un esborrany de mapa** amb tot això, en el format de línies que llegeix
 *    `revisa-mapa.js`. Sortirà provisional: la web no diu els intangibles, i un
 *    mapa sense intangibles no passa la regla 3. És on entra la sessió de Claude
 *    amb la skill `mapa-de-valor`, no un forat de l'eina.
 *
 * El que no és a cap font no s'inventa: va a «por confirmar» o a les preguntes.
 * Correus, telèfons i imports de les frases d'evidència es tapen.
 *
 *   node SOS/tools/analitza-contingut.js fonts/ sortida/ [--nom "Nom"] [--llengua es|ca]
 *        [--baixa https://la-web.example]   (desa la portada i fins a 12 pàgines amb curl)
 *
 * Escriu `analisis.json` i `analisis.md`, i `marca.json` i `mapa-esbozo.json`
 * només si encara no hi són: el que una persona ja ha corregit no es trepitja. */
'use strict';
const { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } = require('node:fs');
const { join, extname, basename, relative } = require('node:path');

const ROLS = [
  { id: 'clientes', es: 'Quien compra', ca: 'Qui compra', re: /\b(clientes?|clients?|compradore?s?|compradors?|consumidore?s?)\b/i },
  { id: 'visitantes', es: 'Quien nos visita', ca: 'Qui ens visita', re: /\b(visitantes?|visitants?|turistas?|turistes|viajer[oa]s|huéspedes|hostes)\b/i },
  { id: 'empresas', es: 'La empresa o el grupo que contrata', ca: "L'empresa o el grup que contracta", re: /\b(empresas?|empreses|grupos?|grups|corporativ[oa]s?|agencias?|agències)\b/i },
  { id: 'canal', es: 'Quien lo revende o lo sirve', ca: 'Qui ho revèn o ho serveix', re: /\b(distribuidore?s?|distribuïdors?|restaurantes?|restaurants?|tiendas?(?!\s+online)|botigues|hostelería|hostaleria|vinotecas?|importadore?s?|cartas? de vinos)\b/i },
  { id: 'proveedores', es: 'Quien produce lo que ofrecemos', ca: 'Qui produeix el que oferim', re: /\b(proveedore?s?|proveïdors?|productore?s?|productors?|agricultore?s?|pagès|pagesos|viticultore?s?|bodegas|cellers|elaboradore?s?|artesan[oa]s|artesans)\b/i },
  { id: 'territorio', es: 'El lugar que lo sostiene', ca: 'El lloc que ho sosté', re: /\b(pueblo|poble|comarca|territorio|territori|ayuntamiento|ajuntament|denominación de origen|barrio|barri|región|regió)\b/i },
  { id: 'equipo', es: 'Quien trabaja en casa', ca: 'Qui treballa a casa', re: /\b(equipo|equip|sumiller|enólog[oa]|enòleg|guías|guies|cociner[oa]s?|cuiners?)\b/i },
  { id: 'comunidad', es: 'Quien forma parte del club', ca: 'Qui forma part del club', re: /\b(socios?|socis?|club|comunidad|comunitat|voluntari[oa]s?|suscriptore?s?|subscriptors?)\b/i },
  { id: 'formacion', es: 'Quien aprende con nosotros', ca: 'Qui aprèn amb nosaltres', re: /\b(alumn[oa]s|alumnes|estudiantes?|estudiants?|escuelas?|escoles?)\b/i },
  { id: 'prensa', es: 'Quien lo cuenta fuera', ca: 'Qui ho explica fora', re: /\b(prensa|premsa|periodistas?|periodistes|influencers?)\b/i }
];
/* `torna`: el que sol tornar qui rep (la reserva, el pedido, el pagament). */
const COSES = [
  { id: 'producto', es: 'el producto', ca: 'el producte', re: /\b(vinos?|vins?|productos?|productes?|cervezas?|cerveses|aceites?|oli|quesos?|formatges?)\b/i },
  { id: 'visita', es: 'la visita', ca: 'la visita', re: /\b(visitas?|visites|tours?|rutas?|rutes)\b/i },
  { id: 'cata', es: 'la cata', ca: 'el tast', re: /\b(catas?|tasts?|degustaci[oó]n(es)?|degustacions?|maridajes?|maridatges?)\b/i },
  { id: 'evento', es: 'el evento', ca: "l'esdeveniment", re: /\b(eventos?|esdeveniments?|celebraci[oó]n(es)?|celebracions?|bodas?|casaments?)\b/i },
  { id: 'formacion', es: 'el curso o el taller', ca: 'el curs o el taller', re: /\b(cursos?|cursos|talleres|taller|tallers|formaci[oó]n?|formació)\b/i },
  { id: 'consejo', es: 'el consejo y la selección', ca: "el consell i la tria", re: /\b(asesor[ií]a|assessorament|consejos?|consells?|recomendaci[oó]n(es)?|recomanacions?|selecci[oó]n|selecció)\b/i },
  { id: 'regalo', es: 'el regalo', ca: 'el regal', re: /\b(regalos?|regals?|lotes?|lots?)\b/i },
  { id: 'reserva', es: 'la reserva', ca: 'la reserva', re: /\b(reservas?|reserves|reservar)\b/i, torna: true },
  { id: 'pedido', es: 'el pedido', ca: 'la comanda', re: /\b(pedidos?|comandes?|comanda|carrito|cistella|tienda online|botiga en línia|envíos?|enviaments?)\b/i, torna: true },
  { id: 'suscripcion', es: 'la cuota', ca: 'la quota', re: /\b(suscripci[oó]n(es)?|subscripci[oó]|cuotas?|quotes?|quota)\b/i, torna: true },
  { id: 'pago', es: 'el pago', ca: 'el pagament', re: /\b(pagos?|pagament|pagar|factura)\b/i, torna: true }
];
const PREU = /\d[\d.,]*\s?(€|eur\b|euros?\b)|€\s?\d/gi;
const TXT = {
  es: { casa: 'Quien lleva la casa', confirmar: 'por confirmar', abast: 'Desde que alguien descubre la casa hasta que vuelve o la recomienda (frontera por revisar)',
    titol: 'Análisis de las fuentes', gen: 'Generado por `analitza-contingut.js` a partir de las fuentes. No se edita a mano: se vuelve a generar.',
    fonts: 'Las fuentes', rols: 'Quién sale (candidatos a rol)', coses: 'Qué se da (candidatos a entregable)', preguntes: 'Lo que la web no dice', marca: 'La cara (propuesta para marca.json)',
    veg: 'veces', cap: 'Ninguno.', esborrany: 'El esbozo del mapa', esbD: 'En `mapa-esbozo.json`. Sale provisional: la web no dice qué se devuelve en intangibles. Lo completa la sesión de Claude con la skill `mapa-de-valor` y lo guarda como `mapa.json`.',
    q: {
      desc: 'La web no tiene descripción: ¿cómo dirías en una frase lo que hacéis?',
      ld: 'Ninguna página lleva datos para buscadores e IA (JSON-LD): la web nueva los lleva en cada página.',
      form: 'No hay ningún formulario ni correo para escribiros: ¿por dónde os llega hoy quien quiere algo?',
      tel: 'No sale ningún teléfono: ¿queréis que os llamen?',
      llengua: 'La web habla una sola lengua: ¿en qué lenguas habla quien os compra o visita?',
      preus: 'La web publica {n} precios: antes de proponer algo nuevo, mirad qué se cobra ya y quién lo recibe.',
      senseP: 'La web no dice qué se cobra: ¿qué paga hoy quien compra, y cómo?',
      alt: '{n} imágenes sin texto alternativo: quien no ve no sabe qué muestran.',
      rol: '¿Qué recibe «{rol}» de vosotros, y qué os devuelve, además de pagar?',
      cosa: 'Sale mucho «{cosa}», pero no queda claro quién lo recibe ni qué devuelve.' } },
  ca: { casa: 'Qui porta la casa', confirmar: 'per confirmar', abast: 'Des que algú descobreix la casa fins que hi torna o la recomana (frontera per revisar)',
    titol: 'Anàlisi de les fonts', gen: 'Generat per `analitza-contingut.js` a partir de les fonts. No s\'edita a mà: es torna a generar.',
    fonts: 'Les fonts', rols: 'Qui hi surt (candidats a rol)', coses: 'Què s\'hi dona (candidats a lliurament)', preguntes: 'El que la web no diu', marca: 'La cara (proposta per a marca.json)',
    veg: 'vegades', cap: 'Cap.', esborrany: "L'esborrany del mapa", esbD: 'A `mapa-esbozo.json`. Surt provisional: la web no diu què es torna en intangibles. El completa la sessió de Claude amb la skill `mapa-de-valor` i el desa com a `mapa.json`.',
    q: {
      desc: 'La web no té descripció: com diríeu en una frase el que feu?',
      ld: 'Cap pàgina porta dades per a cercadors i IA (JSON-LD): la web nova les porta a cada pàgina.',
      form: 'No hi ha cap formulari ni correu per escriure-us: per on us arriba avui qui vol alguna cosa?',
      tel: 'No hi surt cap telèfon: voleu que us truquin?',
      llengua: 'La web parla una sola llengua: en quines llengües parla qui us compra o us visita?',
      preus: 'La web publica {n} preus: abans de proposar res de nou, mireu què es cobra ja i qui ho rep.',
      senseP: 'La web no diu què es cobra: què paga avui qui compra, i com?',
      alt: '{n} imatges sense text alternatiu: qui no hi veu no sap què ensenyen.',
      rol: 'Què rep «{rol}» de vosaltres, i què us torna, a més de pagar?',
      cosa: 'Hi surt molt «{cosa}», però no queda clar qui ho rep ni què torna.' } }
};

const ent = s => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n)).replace(/&[a-z]+;/gi, ' ');
const net = s => ent(String(s || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
/* Les frases d'evidència no porten dades de contacte ni imports. */
const tapa = s => s.replace(/[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}/gi, '[correo]').replace(/(\+?\d[\d .-]{7,}\d)/g, '[teléfono]').replace(PREU, '[precio]');

/* Una font: el que en diu l'HTML (o el text, si no n'és). */
function llegeixFont(nom, cos) {
  const html = /\.html?$/i.test(nom) || /<html|<body|<head/i.test(cos);
  const f = { nom, tipus: html ? 'html' : /\.css$/i.test(nom) ? 'css' : /\.svg$/i.test(nom) ? 'svg' : 'text' };
  if (f.tipus === 'svg') return f;
  if (f.tipus === 'css') { f.css = cos; return f; }
  if (!html) { f.text = cos.replace(/^#+\s*/gm, '').replace(/[*_`>]/g, ''); f.titol = (/^#\s+(.+)$/m.exec(cos) || [])[1] || ''; f.enc = (cos.match(/^#{1,3}\s+.+$/gm) || []).map(x => x.replace(/^#+\s*/, '')); return f; }
  const meta = n => { const m = new RegExp('<meta[^>]+(?:name|property)=["\']' + n + '["\'][^>]*>', 'i').exec(cos); return m ? ent((/content=["']([^"']*)["']/i.exec(m[0]) || [])[1] || '') : ''; };
  f.titol = net((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(cos) || [])[1]);
  f.descripcio = meta('description') || meta('og:description');
  f.siteName = meta('og:site_name');
  f.themeColor = meta('theme-color');
  f.lang = (/<html[^>]*\blang=["']?([a-z-]+)/i.exec(cos) || [])[1] || '';
  f.hreflang = (cos.match(/hreflang=/gi) || []).length;
  f.enc = (cos.match(/<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>/gi) || []).map(net).filter(Boolean).slice(0, 20);
  f.forms = (cos.match(/<form\b/gi) || []).length;
  f.mailto = (cos.match(/href=["']mailto:/gi) || []).length;
  f.tel = (cos.match(/href=["']tel:/gi) || []).length;
  f.imgs = (cos.match(/<img\b[^>]*>/gi) || []);
  f.senseAlt = f.imgs.filter(i => !/\balt=["'][^"']+["']/i.test(i)).length;
  f.ld = [];
  (cos.match(/<script[^>]+application\/ld\+json[^>]*>[\s\S]*?<\/script>/gi) || []).forEach(b => {
    try { const j = JSON.parse(b.replace(/^<script[^>]*>|<\/script>$/gi, '')); (Array.isArray(j) ? j : j['@graph'] || [j]).forEach(x => f.ld.push(x)); } catch (e) { /* un JSON-LD trencat no atura res */ }
  });
  f.css = (cos.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || []).join('\n') + '\n' + (cos.match(/style=["'][^"']*["']/gi) || []).join('\n');
  f.text = net(cos.replace(/<head\b[\s\S]*?<\/head>/i, ' ').replace(/<(script|style|noscript|svg|nav|footer)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<\/(p|li|h[1-6]|div|tr)>|<br\s*\/?>/gi, '. '))
    .replace(/([.!?:])(\s*\.)+/g, '$1');
  return f;
}

/* El color de la marca: el theme-color, o el color saturat que més es repeteix. */
function colorDe(fonts) {
  const tc = fonts.map(f => f.themeColor).find(c => /^#[0-9a-f]{3,6}$/i.test(c || ''));
  if (tc) return tc.toLowerCase();
  const n = {};
  fonts.forEach(f => (String(f.css || '').match(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi) || []).forEach(c => {
    const h = c.length === 4 ? '#' + c.slice(1).replace(/./g, x => x + x) : c.toLowerCase();
    const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const sat = mx === mn ? 0 : (mx - mn) / (1 - Math.abs(mx + mn - 1)), l = (mx + mn) / 2;
    if (sat > 0.25 && l > 0.08 && l < 0.85) n[h] = (n[h] || 0) + 1;
  }));
  return Object.keys(n).sort((a, b) => n[b] - n[a] || (a < b ? -1 : 1))[0] || '';
}
function lletraDe(fonts) {
  const ff = fonts.map(f => (String(f.css || '').match(/font-family\s*:[^;}"']+/gi) || []).join(' ')).join(' ').toLowerCase();
  if (!ff) return '';
  const serif = (ff.match(/georgia|garamond|playfair|lora|merriweather|times|baskerville|cormorant|libre caslon|\bserif/g) || []).filter(x => x !== 'serif' || !/sans-serif/.test(ff)).length;
  const mono = (ff.match(/mono|courier|consolas/g) || []).length, rod = (ff.match(/nunito|quicksand|varela|rounded|comfortaa/g) || []).length;
  return mono > serif && mono > rod ? 'mono' : rod > serif ? 'rodona' : serif ? 'serif' : 'sans';
}
function llenguaDe(text) {
  const t = ' ' + text.toLowerCase() + ' ', c = (t.match(/ (amb|què|també|els|perquè|però|aquest|vostre|nosaltres) /g) || []).length, s = (t.match(/ (con|qué|también|los|porque|pero|este|vuestro|nosotros|para) /g) || []).length;
  return c > s ? 'ca' : 'es';
}

function analitza(fitxers, opts) {
  const o = opts || {}, fonts = fitxers.map(x => llegeixFont(x.nom, x.cos));
  const pag = fonts.filter(f => f.tipus === 'html' || f.tipus === 'text');
  const text = pag.map(f => f.text || '').join(' . ');
  const llengua = TXT[o.llengua] ? o.llengua : llenguaDe(text), T = TXT[llengua];
  const ld = [].concat(...fonts.map(f => f.ld || []));
  const org = ld.find(x => /Organization|LocalBusiness|Store|Restaurant|Winery|Brewery|FoodEstablishment|LodgingBusiness/i.test([].concat(x['@type'] || []).join(' '))) || {};
  const nom = String(o.nom || org.name || (fonts.find(f => f.siteName) || {}).siteName || ((pag[0] || {}).titol || '').split(/\s[|·–—-]\s/)[0] || 'La casa').trim();
  const frases = text.split(/(?<=[.!?])\s+|\s\.\s/).map(s => s.trim()).filter(s => s.length > 20 && s.length < 400);
  const compta = (llista) => llista.map(x => {
    const on = frases.filter(s => x.re.test(s));
    return { id: x.id, nom: x[llengua], vegades: (text.match(new RegExp(x.re.source, 'gi')) || []).length, evidencia: on.slice(0, 2).map(s => tapa(s).slice(0, 180)), frases: on };
  }).filter(x => x.vegades > 0).sort((a, b) => b.vegades - a.vegades || (a.id < b.id ? -1 : 1));
  const rols = compta(ROLS), coses = compta(COSES);
  const preus = (text.match(PREU) || []).length;

  const preguntes = [];
  const alguna = k => pag.some(f => f[k]);
  if (!pag.some(f => f.descripcio)) preguntes.push(T.q.desc);
  if (!ld.length && pag.some(f => f.tipus === 'html')) preguntes.push(T.q.ld);
  if (!alguna('forms') && !alguna('mailto')) preguntes.push(T.q.form);
  if (!alguna('tel') && !org.telephone) preguntes.push(T.q.tel);
  if (!alguna('hreflang')) preguntes.push(T.q.llengua);
  preguntes.push(preus ? T.q.preus.replace('{n}', preus) : T.q.senseP);
  const sa = pag.reduce((n, f) => n + (f.senseAlt || 0), 0);
  if (sa) preguntes.push(T.q.alt.replace('{n}', sa));
  rols.filter(r => r.id !== 'equipo').slice(0, 5).forEach(r => preguntes.push(T.q.rol.replace('{rol}', r.nom)));
  if (coses[0] && !rols.some(r => r.frases.some(s => COSES.find(c => c.id === coses[0].id).re.test(s)))) preguntes.push(T.q.cosa.replace('{cosa}', coses[0].nom));

  /* La cara, per a marca.json. Només el que diuen les fonts. */
  const marca = {};
  const color = colorDe(fonts), lletra = lletraDe(fonts);
  if (color) marca.color = color;
  if (lletra) marca.lletra = lletra;
  const desc = (pag.find(f => f.descripcio) || {}).descripcio || org.description || '';
  if (desc) { marca.presentacio = desc.slice(0, 400); const l = desc.split(/(?<=[.!?])\s/)[0]; if (l.length <= 90) marca.lema = l.replace(/[.!]$/, ''); }
  const logo = fitxers.find(x => /\.svg$/i.test(x.nom) && /logo/i.test(x.nom));
  if (logo) marca.logo = logo.nom;
  const adr = org.address, c = {};
  if (adr) c.adreca = typeof adr === 'string' ? adr : [adr.streetAddress, adr.postalCode, adr.addressLocality].filter(Boolean).join(', ');
  if (org.telephone) c.telefon = String(org.telephone);
  if (org.openingHours) c.horari = [].concat(org.openingHours).join(' · ');
  if (Object.keys(c).length) marca.contacte = c;

  /* L'esborrany del mapa: casa i els candidats, amb el que surt a les seves
     frases. El que no surt, «per confirmar». */
  const casa = T.casa, fora = rols.filter(r => r.id !== 'equipo').slice(0, 9);
  const top = (r, torna) => {
    const dins = COSES.filter(x => !!x.torna === torna).map(x => [x, r.frases.filter(s => x.re.test(s)).length]).filter(x => x[1]).sort((a, b) => b[1] - a[1]);
    return dins[0] ? dins[0][0][llengua] : torna ? T.confirmar : ((coses.find(x => !COSES.find(y => y.id === x.id).torna) || {}).nom || T.confirmar);
  };
  const parells = fora.map(r => (r.id === 'proveedores'
    ? r.nom + ' | ' + casa + ' | t | ' + (COSES[0][llengua]) + ' | t | ' + top(r, true)
    : casa + ' | ' + r.nom + ' | t | ' + top(r, false) + ' | t | ' + top(r, true)));
  const esborrany = { abast: T.abast, rols: [casa].concat(fora.map(r => r.nom)), parells, processos: [], seq: [],
    troballes: preguntes.slice(0, 3).map(q => q.replace(/[:?].*$/, '') + ' | ' + q) };

  const net2 = x => x.map(({ frases, ...r }) => r);
  return {
    formato: 'tt-analisis-1', nom, llengua,
    fonts: fonts.map(f => ({ nom: f.nom, tipus: f.tipus, titol: f.titol || undefined, descripcio: f.descripcio || undefined, encapcalaments: f.enc && f.enc.length ? f.enc.slice(0, 8) : undefined, llengua: f.lang || undefined })),
    rols: net2(rols), coses: net2(coses), preus, preguntes, marca, esborrany
  };
}

function aMarkdown(a) {
  const T = TXT[a.llengua], l = [];
  l.push('# ' + T.titol + ' · ' + a.nom, '', '> ' + T.gen, '', '## ' + T.fonts, '');
  a.fonts.forEach(f => l.push('- `' + f.nom + '` · ' + f.tipus + (f.titol ? ' · ' + f.titol : '') + (f.descripcio ? ': ' + f.descripcio : '')));
  const sec = (t, x) => { l.push('', '## ' + t, ''); if (!x.length) l.push(T.cap); x.forEach(r => { l.push('- **' + r.nom + '** · ' + r.vegades + ' ' + T.veg); r.evidencia.forEach(s => l.push('  - «' + s + '»')); }); };
  sec(T.rols, a.rols); sec(T.coses, a.coses);
  l.push('', '## ' + T.preguntes, '');
  a.preguntes.forEach((q, i) => l.push((i + 1) + '. ' + q));
  l.push('', '## ' + T.marca, '', '```json', JSON.stringify(a.marca, null, 2), '```', '', '## ' + T.esborrany, '', T.esbD, '');
  return l.join('\n');
}

/* Les fonts d'una carpeta (sense entrar a web/ ni web-esbozo/, que surten d'aquí). */
function llegeixCarpeta(dir) {
  const out = [];
  const passa = d => readdirSync(d).sort().forEach(n => {
    const r = join(d, n);
    if (statSync(r).isDirectory()) { if (!/^(web|web-esbozo|node_modules|\.git)$/.test(n)) passa(r); return; }
    if (/\.(html?|md|markdown|txt|css|svg)$/i.test(n) && statSync(r).size < 2e6) out.push({ nom: relative(dir, r), cos: readFileSync(r, 'utf8') });
  });
  passa(dir);
  return out;
}

/* Baixa la portada i fins a 12 pàgines del mateix lloc amb curl (que fa servir
   el proxy de l'entorn, si n'hi ha). Sense curl o sense xarxa, ho diu i prou. */
function baixa(url, dir) {
  const { spawnSync } = require('node:child_process');
  const base = new URL(url), vist = new Set(), cua = [base.href], desats = [];
  mkdirSync(dir, { recursive: true });
  while (cua.length && desats.length < 13) {
    const u = cua.shift();
    if (vist.has(u)) continue;
    vist.add(u);
    const r = spawnSync('curl', ['-sL', '-m', '20', '-A', 'TeamTowers-propuesta/1', u], { encoding: 'utf8', maxBuffer: 8e6 });
    if (r.status !== 0 || !r.stdout || !/<html|<body/i.test(r.stdout)) continue;
    const nom = (new URL(u).pathname.replace(/\/$/, '/index').replace(/^\//, '').replace(/[^a-z0-9/-]+/gi, '-').replace(/\//g, '_') || 'index') + '.html';
    writeFileSync(join(dir, nom), r.stdout);
    desats.push(nom);
    (r.stdout.match(/href=["'][^"'#]+["']/gi) || []).forEach(h => {
      try { const x = new URL(h.slice(6, -1), u); x.hash = ''; if (x.host === base.host && !/\.(jpe?g|png|gif|webp|pdf|zip|css|js|xml|ico)$/i.test(x.pathname)) cua.push(x.href); } catch (e) { /* enllaç trencat */ }
    });
  }
  return desats;
}

module.exports = { analitza, aMarkdown, llegeixCarpeta, baixa, llegeixFont };

if (require.main === module) {
  const a = process.argv.slice(2), opts = {}, pos = [];
  for (let i = 0; i < a.length; i++) {
    if (/^--(nom|llengua|baixa)$/.test(a[i])) opts[a[i].slice(2)] = a[++i];
    else pos.push(a[i]);
  }
  if (pos.length < 2) { console.error('Ús: node SOS/tools/analitza-contingut.js fonts/ sortida/ [--nom …] [--llengua es|ca] [--baixa https://…]'); process.exit(2); }
  if (opts.baixa) { const d = baixa(opts.baixa, pos[0]); console.log(d.length ? '✅ ' + d.length + ' pàgines desades a ' + pos[0] : '⚠ No s\'ha pogut baixar res de ' + opts.baixa + ': desa les pàgines a mà a ' + pos[0]); }
  if (!existsSync(pos[0])) { console.error('❌ No hi ha la carpeta de fonts ' + pos[0]); process.exit(1); }
  const fit = llegeixCarpeta(pos[0]);
  if (!fit.length) { console.error('❌ La carpeta ' + pos[0] + ' no té cap font (.html, .md, .txt, .css, .svg)'); process.exit(1); }
  const r = analitza(fit, opts);
  mkdirSync(pos[1], { recursive: true });
  writeFileSync(join(pos[1], 'analisis.json'), JSON.stringify(r, null, 2) + '\n');
  writeFileSync(join(pos[1], 'analisis.md'), aMarkdown(r));
  const nou = [];
  if (!existsSync(join(pos[1], 'marca.json'))) {
    const m = Object.assign({}, r.marca);
    if (m.logo) m.logo = relative(pos[1], join(pos[0], m.logo));
    writeFileSync(join(pos[1], 'marca.json'), JSON.stringify(m, null, 2) + '\n'); nou.push('marca.json');
  }
  if (!existsSync(join(pos[1], 'mapa-esbozo.json'))) { writeFileSync(join(pos[1], 'mapa-esbozo.json'), JSON.stringify(r.esborrany, null, 2) + '\n'); nou.push('mapa-esbozo.json'); }
  console.log('✅ ' + fit.length + ' fonts · ' + r.rols.length + ' candidats a rol · ' + r.coses.length + ' a lliurament · ' + r.preguntes.length + ' preguntes'
    + ' → ' + join(pos[1], 'analisis.md') + (nou.length ? ' (i ' + nou.join(', ') + ')' : ''));
}
