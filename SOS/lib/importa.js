/* L'importador · GENERAT per SOS/tools/build-vna-suport.js des del bloc
   VS-IMPORTA de SOS/vna-suport.html · no s'edita a mà. Navegador:
   window.Importa. Node: require(). */
(function (g) {
'use strict';
/*VS-IMPORTA*/
/* ── Importar el que el client ja té ───────────────────────────────────────
 * La web d'ara, documents i CSV, en text a `cerebro/fonts/` (el generador no
 * hi toca), perquè la IA n'escrigui el dossier i els continguts citant la font.
 *  · **Només text.** Un fitxer per font, amb una capçalera que diu d'on surt i
 *    quan. PDF i Word no es llegeixen aquí: es llisten per a la IA.
 *  · **Cap dada personal.** Correus, telèfons, IBAN i DNI s'amaguen, i les
 *    columnes de persona d'un CSV no hi entren: el repositori pot ser públic.
 *  · **Educat amb la web d'origen.** robots.txt, una petició cada cop amb pausa.
 *  · **Sense DOM ni imports**: el `fetch` i la pausa els posa qui crida. */
/* Noms de columna de persona, sense accents ni signes. «Nom del producte» no
   és ningú: nom/name/nombre, i client, contacte, soci…, només compten sols o
   amb un qualificatiu de persona («nom complet», «nom del client»); cognom o
   first/last name, sempre. Una columna plena de correus o telèfons cau igual. */
const IMP_PERSONAL = [
  /\b(e ?mail|correu|correo|mail)\b/, /\b(telefons?|telefonos?|phone|mobil|movil|tel|celular|whatsapp)\b/,
  /^(nom|name|nombre)( (complet|completo|i cognoms?|y apellidos?|de pila))?( (de |del |de la )?(client|cliente|contacte|contacto|persona|usuari|usuario|alumne|alumno|soci|socio|responsable))?$/,
  /^(client|cliente|customer|contacte|contacto|contact|persona|usuari|usuario|user|alumne|alumno|soci|socio|autor|author)$/,
  /\b(cognoms?|apellidos?|surname|(first|last|full|given|family|contact|customer|user) ?name)\b/, /\b(dni|nif|nie|passaport|pasaporte|passport)\b/,
  /\b(adreca|direccion|address|domicili|domicilio)\b/, /\b(iban|compte|cuenta bancaria|numero de cuenta|bank account)\b/,
  /\b(naixement|nacimiento|birth|birthday|birthdate|aniversari|cumpleanos)\b/, /\bip\b/
];
const impNorm = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const columnaPersonal = nom => IMP_PERSONAL.some(re => re.test(impNorm(nom)));
/* Correus i IBAN primer, que porten xifres que semblarien telèfons. Un telèfon
   són 9 xifres que comencen per 6-9, en grups 3-3-3, 3-2-2-2 o 2-3-2-2, o de 9
   a 15 amb prefix (+34, 0034): així no hi cauen anys, preus ni codis postals. */
function amagaPersonal(text) {
  const r = { text: String(text == null ? '' : text), correus: 0, telefons: 0, altres: 0 };
  const posa = (re, k, per, bo) => { r.text = r.text.replace(re, m => { if (bo && !bo(m.replace(/\D/g, ''))) return m; r[k]++; return per; }); };
  posa(/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, 'correus', '[correu]');
  posa(/\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){3,7}(?: ?[A-Z0-9]{1,3})?\b/g, 'altres', '[dada personal]');
  posa(/\b(?:[XYZ][ -]?\d{7}|\d{8})[ -]?[TRWAGMYFPDXBNJZSQVHLCKE]\b/g, 'altres', '[dada personal]');
  posa(/\(?(?:\+|\b00)\d{1,3}\)?(?:[ .-]?\(?\d+\)?){1,6}/g, 'telefons', '[telèfon]', d => { const n = d.replace(/^00/, '').length; return n >= 9 && n <= 15; });
  posa(/\b[6789]\d(?:\d(?:[ .-]?\d{3}){2}|\d(?:[ .-]?\d{2}){3}|[ .-]?\d{3}(?:[ .-]?\d{2}){2})\b/g, 'telefons', '[telèfon]', d => !/0{6}$/.test(d));
  return r;
}
/* Les vocals amb accent (&eacute; &Agrave; &iuml;…) es componen, no s'escriuen una a una. */
const IMP_ENT = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'', laquo: '«', raquo: '»', middot: '·', hellip: '…', mdash: '—', ndash: '–', lsquo: '‘',
  rsquo: '’', ldquo: '“', rdquo: '”', euro: '€', copy: '©', reg: '®', deg: '°', iexcl: '¡', iquest: '¿', bull: '•', ordf: 'ª', ordm: 'º', shy: '', ccedil: 'ç', Ccedil: 'Ç',
  ntilde: 'ñ', Ntilde: 'Ñ', ...Object.fromEntries([].concat(...'aeiouAEIOU'.split('').map(v => ['acute\u0301', 'grave\u0300', 'uml\u0308', 'circ\u0302']
    .map(x => [v + x.slice(0, -1), (v + x.slice(-1)).normalize('NFC')])))) };
const impEnt = s => String(s == null ? '' : s).replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (m, e) => { const n = e[0] !== '#' ? -1 : /x/i.test(e[1]) ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
  return n < 0 ? (Object.prototype.hasOwnProperty.call(IMP_ENT, e) ? IMP_ENT[e] : m) : n > 0 && n < 0x110000 && !(n >= 0xd800 && n < 0xe000) ? String.fromCodePoint(n) : ''; });
const impUrl = (h, base) => { try { const u = new URL(String(h).trim(), base || undefined); return /^(https?|mailto):$/.test(u.protocol) ? u : null; } catch (e) { return null; } };
const impWeb = u => !!u && /^https?:$/.test(u.protocol), impHost = u => u.hostname.replace(/^www\./, '');   // amb www o sense, és el mateix lloc
const IMP_DOC = /\.(pdf|docx?|xlsx?|odt|ods|odp|pptx?|rtf)$/i, IMP_ACTIU = /\.(jpe?g|png|gif|svg|webp|avif|ico|bmp|zip|rar|gz|mp3|mp4|m4a|mov|webm|ogg|wav|css|m?js|json|xml|rss|woff2?|ttf|eot)$/i;
const impAttr = (a, nom) => { const m = new RegExp('(?:^|\\s)' + nom + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i').exec(a || '');
  return m ? impEnt(m[1] != null ? m[1] : m[2] != null ? m[2] : m[3]) : null; };
/* webSlug és de VS-WEB, que no va a eines/nucli.mjs: allà es fa el mateix aquí. */
const impSlug = s => (typeof webSlug === 'function' ? webSlug(s) : impNorm(s).replace(/ /g, '-') || 'pagina');
/* Treu elements sencers de dins cap a fora (un <header> dins d'un altre no deixa anar text); `deixa(dins)` en salva un tros. */
function impTreu(html, tags, deixa) {
  for (let t = null, re = new RegExp('<(' + tags + ')\\b[^>]*>((?:(?!<\\1\\b)[\\s\\S])*?)</\\1\\s*>', 'gi'); t !== html;) { t = html; html = html.replace(re, (x, tag, d) => (deixa ? deixa(d) : '')); }
  return html;
}
const IMP_BLOC = /^(p|div|section|article|main|aside|blockquote|figure|figcaption|address|form|fieldset|dl|dt|dd|hr|pre|center|details|summary)$/;
/* L'HTML ja net, a Markdown, amb una màquina d'estats petita: dins d'un títol,
   d'un element de llista o d'una cel·la tot va en una línia. */
function impMd(html, base, imatges) {
  const out = [], enl = [], taules = [], re = /<(\/?)([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>|([^<]+)|</g;
  let ll = 0, li = 0, tit = 0, fila = null, cel = -1, m;
  const linia = () => tit || li || cel >= 0;
  const tancaCel = () => { if (cel >= 0) { fila.push(out.splice(cel).join('').replace(/\s+/g, ' ').trim().replace(/\|/g, '\\|')); cel = -1; } };
  const fiFila = () => { tancaCel(); if (fila && fila.length) { out.push('\n| ' + fila.join(' | ') + ' |'); if (taules.length && taules[taules.length - 1]++ === 0) out.push('\n|' + ' --- |'.repeat(fila.length)); } fila = null; };
  while ((m = re.exec(html))) {
    if (m[2] == null) { out.push((m[4] != null ? impEnt(m[4]) : '<').replace(/\s+/g, ' ')); continue; }
    const tanca = m[1] === '/', tag = m[2].toLowerCase(), at = m[3];
    if (/^h[1-6]$/.test(tag)) { out.push(tanca ? '\n\n' : '\n\n' + '#'.repeat(+tag[1]) + ' '); tit = tanca ? 0 : 1; }
    else if (tag === 'br') out.push(linia() ? ' ' : '\n');
    else if (tag === 'ul' || tag === 'ol') { ll = Math.max(0, ll + (tanca ? -1 : 1)); li = Math.min(li, ll); out.push('\n'); }
    else if (tag === 'li') { li = tanca ? Math.max(0, ll - 1) : Math.max(ll, 1); if (!tanca) out.push('\n' + '  '.repeat(Math.max(0, ll - 1)) + '- '); }
    else if (tag === 'a' && !tanca) { const h = impAttr(at, 'href'); enl.push({ u: h && h.trim()[0] !== '#' ? impUrl(h, base) : null, i: out.length }); }
    else if (tag === 'a' && enl.length) {
      /* Una targeta enllaçada (títol i text) no cap en [text](url): queda el bloc i l'adreça al darrere. */
      const e = enl.pop(), cru = out.splice(e.i).join(''), t = cru.replace(/\s+/g, ' ').trim(), h = e.u ? e.u.href.replace(/\)/g, '%29') : '';
      out.push(!t || !h ? cru : /\n/.test(cru) ? cru + '\n\n<' + h + '>\n\n' : '[' + t.replace(/[[\]]/g, '\\$&') + '](' + h + ')');
    }
    else if (tag === 'img') { const u = impUrl(impAttr(at, 'data-src') || impAttr(at, 'src') || '', base);
      if (impWeb(u) && !imatges.some(x => x.src === u.href)) imatges.push({ src: u.href, alt: (impAttr(at, 'alt') || '').replace(/\s+/g, ' ').trim() }); }
    else if (tag === 'table') { fiFila(); if (tanca) taules.pop(); else taules.push(0); out.push('\n\n'); }
    else if (tag === 'tr') { fiFila(); if (!tanca) fila = []; }
    else if (tag === 'td' || tag === 'th') { tancaCel(); if (!tanca) { fila = fila || []; cel = out.length; } }
    else if (IMP_BLOC.test(tag)) out.push(linia() ? ' ' : '\n\n');
  }
  fiFila();
  /* El sagnat de les llistes niades va abans del guió: es conserva a cada línia. */
  return out.join('').split('\n').map(l => (/^(?: {2})+(?=- )/.exec(l) || [''])[0] + l.replace(/[ \t\u00a0]+/g, ' ').trim())
    .filter(l => !/^(#{1,6}|-)$/.test(l.trim())).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
/* Els enllaços es cullen de tota la pàgina (el menú és on n'hi ha més); el text,
   sense menú ni capçalera, però amb l'h1 del <header> (el d'un article sol ser-hi)
   i el peu al final: hi solen ser l'adreça i l'horari (el personal s'amaga després). */
function htmlAText(html, base) {
  const s = String(html == null ? '' : html).replace(/<!-{2}[\s\S]*?-{2}>/g, '').replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '').replace(/<[!?][^>]*>/g, '');
  const pren = re => { const m = re.exec(s); return m ? m[1] : ''; }, net = x => String(x || '').replace(/\s+/g, ' ').trim();
  const metes = s.match(/<meta\b(?:"[^"]*"|'[^']*'|[^'">])*>/gi) || [], meta = k => metes.find(x => (impAttr(x, 'name') || impAttr(x, 'property') || '').toLowerCase() === k);
  const md = meta('description') || meta('og:description'), bt = impAttr(pren(/<base\b([^>]*)>/i), 'href');
  let b = impUrl(base || '', null);
  if (bt) b = impUrl(bt, b ? b.href : null) || b;
  const bh = impWeb(b) ? b.href : null, codi = impTreu(s, 'script|style|noscript|template|svg').replace(/<(script|style)\b[\s\S]*$/i, ''), enllacos = [], docs = [], vist = {}, peus = [], imatges = [];
  for (let m, re = /<a\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi; bh && (m = re.exec(codi));) {
    const h = impAttr(m[1], 'href'), u = h && h.trim()[0] !== '#' ? impUrl(h, bh) : null;
    if (!impWeb(u) || impHost(u) !== impHost(b)) continue;
    u.hash = '';
    if (!vist[u.href]) { vist[u.href] = 1; if (IMP_DOC.test(u.pathname)) docs.push(u.href); else if (!IMP_ACTIU.test(u.pathname)) enllacos.push(u.href); }
  }
  const cos = impTreu(impTreu(impTreu(codi, 'head|nav|iframe|select|textarea|object|canvas|dialog'), 'header', d => (d.match(/<h1\b[\s\S]*?<\/h1\s*>/gi) || []).join('')),
    'footer', d => { peus.push(d); return ''; }).replace(/<title\b[^>]*>[\s\S]*?<\/title\s*>/gi, '');
  const text = impMd(cos, bh, imatges), peu = impMd(peus.join('<p>'), bh, imatges);
  return { titol: net(impEnt(pren(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i))), descripcio: md ? net(impAttr(md, 'content')) : '',
    llengua: pren(/<html\b[^>]*\blang\s*=\s*["']?([A-Za-z]+)/i).toLowerCase(), text: (text + (peu ? '\n\n## Peu\n\n' + peu : '')).trim(), enllacos, docs, imatges };
}
/* Un sitemap dona pàgines; un índex de sitemaps, altres sitemaps. */
function sitemapUrls(xml) {
  const r = { urls: [], sitemaps: [] }, re = /<(url|sitemap)\b[^>]*>[\s\S]*?<loc\b[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/loc\s*>/gi;
  for (let m, u; (m = re.exec(String(xml || '')));) if ((u = impEnt(m[2]).trim())) r[/^url$/i.test(m[1]) ? 'urls' : 'sitemaps'].push(u);
  return r;
}
/* Només el grup «*». La regla més llarga que encaixa mana i, a igualtat,
   guanya Allow (com fa Google). Admet * i $ final. Sense regles, tot permès. */
function robotsPermet(txt, path) {
  const u = /^https?:/i.test(path) && impUrl(path, null), p = u ? u.pathname + u.search : String(path || '/'), grups = [];
  let g = null, ua = false, millor = null;
  String(txt || '').split(/\r?\n/).forEach(l => {
    const x = /^\s*([a-z-]+)\s*:\s*(.*?)\s*$/i.exec(l.replace(/#.*/, '')), k = x ? x[1].toLowerCase() : '';
    if (k === 'user-agent') { if (!ua) grups.push(g = { ua: [], regles: [] }); g.ua.push(x[2].toLowerCase()); ua = true; return; }
    if (x) ua = false;   // una altra línia tanca la llista d'agents del grup
    if ((k === 'allow' || k === 'disallow') && g && x[2]) g.regles.push({ si: k === 'allow', r: x[2] });
  });
  grups.filter(x => x.ua.indexOf('*') >= 0).forEach(x => x.regles.forEach(rg => {
    const fi = /\$$/.test(rg.r), cos = (fi ? rg.r.slice(0, -1) : rg.r).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*');
    if (new RegExp('^' + cos + (fi ? '$' : '')).test(p) && (!millor || rg.r.length > millor.r.length || (rg.r.length === millor.r.length && rg.si))) millor = rg;
  }));
  return !millor || millor.si;
}
/* El Crawl-delay del grup «*», en segons (com a molt 30). */
function robotsEspera(txt) {
  let dins = false, ua = false, s = 0;
  String(txt || '').split(/\r?\n/).forEach(l => {
    const x = /^\s*([a-z-]+)\s*:\s*(.*?)\s*(?:#.*)?$/i.exec(l), k = x && x[1].toLowerCase();
    if (k === 'user-agent') { if (!ua) dins = false; ua = true; if (x[2] === '*') dins = true; return; }
    if (x) ua = false;
    if (k === 'crawl-delay' && dins && Number(x[2]) > 0) s = Math.min(30, Number(x[2]));
  });
  return s;
}
const robotsSitemaps = txt => String(txt || '').split(/\r?\n/).map(l => /^\s*sitemap\s*:\s*(\S+)/i.exec(l)).filter(Boolean).map(x => x[1]);
/* El separador, el més comptat fora de cometes a la primera línia; a igualtat, ';' (l'Excel d'aquí) i el tabulador. */
function llegeixCsv(text) {
  const t = String(text || '').replace(/^\uFEFF/, ''), n = { ';': 0, '\t': 0, ',': 0 }, files = [];
  let dins = false, fila = [], camp = '';
  for (let i = 0; i < t.length && (dins || !/[\r\n]/.test(t[i])); i++) { if (t[i] === '"') dins = !dins; else if (!dins && t[i] in n) n[t[i]]++; }
  const tria = [';', '\t', ','].reduce((a, c) => (n[c] > n[a] ? c : a), ';'), sep = n[tria] ? tria : ',';
  dins = false;
  for (let i = 0, c; i <= t.length; i++) {
    c = t[i];
    if (dins && c !== undefined) { if (c !== '"') camp += c; else if (t[i + 1] === '"') { camp += '"'; i++; } else dins = false; }
    else if (c === '"' && !camp) dins = true;
    else if (c === sep) { fila.push(camp); camp = ''; }
    else if (c === '\n' || c === '\r' || c === undefined) { if (c === '\r' && t[i + 1] === '\n') i++; fila.push(camp); files.push(fila); fila = []; camp = ''; }
    else camp += c;
  }
  const bones = files.filter(f => f.some(x => x.trim()));
  return { sep, capcalera: (bones.shift() || []).map(x => x.trim()), files: bones };
}
/* Una taula entra per llista blanca: sense columnes triades, només la capçalera i
   quantes files té. Una columna «Observacions» pot portar salut o notes d'un client,
   i cap llista negra no ho veu. Les de persona (pel nom o per les cel·les) no hi
   entren ni triades. */
function csvAMd(text, nom, opts) {
  const o = opts || {}, T = IMP_TXT[o.llengua] || IMP_TXT.ca, c = llegeixCsv(text), cap = c.capcalera.map((h, i) => h || 'columna ' + (i + 1)), fora = [], queden = [], lliures = [];
  const triades = (o.columnes || []).map(impNorm);
  cap.forEach((h, i) => {
    const plenes = c.files.map(f => String(f[i] || '').trim()).filter(Boolean);
    const amb = plenes.filter(x => { const a = amagaPersonal(x); return a.correus + a.telefons + a.altres > 0; }).length;
    if (columnaPersonal(h) || amb * 2 > plenes.length) fora.push(i);
    else { lliures.push(i); if (triades.indexOf(impNorm(h)) >= 0) queden.push(i); }
  });
  const esc = s => String(s == null ? '' : s).trim().replace(/\|/g, '\\|').replace(/\r\n|\r|\n/g, '<br>'), fila = f => '| ' + queden.map(i => esc(f[i])).join(' | ') + ' |';
  const md = (nom ? ['# ' + String(nom).replace(/\s+/g, ' ').trim(), ''] : []).concat(queden.length ? [fila(cap), '|' + ' --- |'.repeat(queden.length)].concat(c.files.slice(0, 200).map(fila))
    : lliures.length ? [T.triaCol.replace('{n}', c.files.length).replace('{cols}', lliures.map(i => esc(cap[i])).join(', '))] : [T.capCol]);
  if (queden.length && c.files.length > 200) md.push('', '… ' + (c.files.length - 200) + ' ' + T.mes);
  return { md: md.join('\n'), fora: fora.map(i => cap[i]), files: c.files.length, columnes: lliures.map(i => cap[i]), triades: queden.map(i => cap[i]) };
}
/* La capçalera és nostra: valors d'una línia (entre cometes si YAML s'hi confondria) i cap «---»
   al cos, perquè un text importat no la pugui tancar ni imitar. «- - -» és la mateixa ratlla. */
function fontMd(f) {
  const v = x => { const s = String(x == null ? '' : x).replace(/\s+/g, ' ').trim(); return /^["'`#&*!|>%@,?:[\]{}-]|: | #/.test(s) ? JSON.stringify(s) : s; };
  return '---\nfont: ' + v(f.font) + '\ntipus: ' + v(f.tipus) + '\ntitol: ' + v(f.titol) + '\nimportat: ' + v(f.importat) + '\n---\n\n'
    + String(f.text == null ? '' : f.text).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').replace(/^[ \t]*-{3,}[ \t]*$/gm, '- - -').trim() + '\n';
}
const IMP_TXT = {
  ca: { titol: 'Fonts importades', importat: 'Importat el', intro: 'El que el projecte ja tenia, en text perquè la IA ho llegeixi, amb les dades personals amagades. Reimportar una font sobreescriu el seu fitxer. El dossier (cerebro/dossier.md) diu d\'on surt cada cosa.',
    resum: '{web} pàgines web, {docs} documents i {dades} taules · amagats: {correus} correus, {telefons} telèfons i {altres} dades personals més.', cap: '| Fitxer | D\'on surt | Tipus | Títol | Paraules | Amagat |',
    columnes: 'Columnes retirades per dades personals', llegirT: 'Documents per llegir amb la IA', llegirD: 'Aquí no es llegeixen PDF ni Word: dona\'ls a la IA i que en deixi el text a cerebro/fonts/docs/.',
    fora: 'El que no s\'ha importat', perLlegir: 'document per llegir amb la IA', format: 'format no suportat', buit: 'sense text (potser la web es pinta amb JavaScript)', mes: 'files més', capCol: 'Cap columna sense dades personals.',
    triaCol: '{n} files. Columnes: {cols}. Per importar-ne les files, tria les columnes que calen (a l\'editor, o amb --columnes "a,b"): una taula entra per llista blanca.',
    autoritzat: 'cal --autoritzat amb el domini: només la web de qui us ho demana, amb la seva autorització escrita',
    robots: 'robots.txt no ho permet', xarxa: 'error de xarxa', noHtml: 'no és una pàgina', foraLloc: 'porta fora del lloc', adreca: 'adreça no vàlida', fetch: 'cal Node 18 o més per llegir webs' },
  es: { titol: 'Fuentes importadas', importat: 'Importado el', intro: 'Lo que el proyecto ya tenía, en texto para que la IA lo lea, con los datos personales ocultos. Reimportar una fuente sobrescribe su fichero. El dosier (cerebro/dossier.md) dice de dónde sale cada cosa.',
    resum: '{web} páginas web, {docs} documentos y {dades} tablas · ocultos: {correus} correos, {telefons} teléfonos y {altres} datos personales más.', cap: '| Fichero | De dónde sale | Tipo | Título | Palabras | Oculto |',
    columnes: 'Columnas retiradas por datos personales', llegirT: 'Documentos para leer con la IA', llegirD: 'Aquí no se leen PDF ni Word: dáselos a la IA y que deje el texto en cerebro/fonts/docs/.',
    fora: 'Lo que no se ha importado', perLlegir: 'documento para leer con la IA', format: 'formato no soportado', buit: 'sin texto (quizá la web se pinta con JavaScript)', mes: 'filas más', capCol: 'Ninguna columna sin datos personales.',
    triaCol: '{n} filas. Columnas: {cols}. Para importar sus filas, elige las columnas que hacen falta (en el editor, o con --columnes "a,b"): una tabla entra por lista blanca.',
    autoritzat: 'hace falta --autoritzat con el dominio: solo la web de quien os lo pide, con su autorización escrita',
    robots: 'robots.txt no lo permite', xarxa: 'error de red', noHtml: 'no es una página', foraLloc: 'lleva fuera del sitio', adreca: 'dirección no válida', fetch: 'hace falta Node 18 o más para leer webs' }
};
/* La sortida no depèn de l'ordre d'arribada: es trien per tipus i per font. Amb `previ`
   (el fonts.json d'abans) l'índex conserva el que avui no es reimporta: la web avui i un
   CSV demà. La font també passa per amagaPersonal: una adreça pot portar un correu. */
function importaFonts(entrades, opts) {
  const o = opts || {}, T = IMP_TXT[o.llengua] || IMP_TXT.ca, ara = o.ara || new Date().toISOString().slice(0, 10);
  const ORDRE = { web: 0, doc: 1, dades: 2 }, CARP = { web: 'web', doc: 'docs', dades: 'dades' }, cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  const llista = (entrades || []).filter(e => e && ORDRE[e.tipus] != null).map(e => Object.assign({}, e, { font: amagaPersonal(e.font || e.nom || '').text }))
    .sort((a, b) => ORDRE[a.tipus] - ORDRE[b.tipus] || cmp(a.font, b.font));
  const previ = o.previ && Array.isArray(o.previ.fonts) ? o.previ : { fonts: [], fora: [] }, araF = {}, usats = {}, vist = {};
  llista.forEach(e => { araF[e.font] = 1; });
  const queden = previ.fonts.filter(f => f && /^cerebro\/fonts\/(web|docs|dades)\/[a-z0-9-]+\.md$/.test(f.ruta) && ORDRE[f.tipus] != null && !araF[f.font]);
  queden.forEach(f => { usats[f.ruta] = 1; });
  const ruta = (tipus, base) => { const b = 'cerebro/fonts/' + CARP[tipus] + '/' + impSlug(base).slice(0, 60).replace(/-$/, '');
    let k = b + '.md';
    for (let n = 2; usats[k]; n++) k = b + '-' + n + '.md';
    return (usats[k] = 1) && k; };
  const fitxers = [], fonts = [], fora = [], inf = { web: 0, docs: 0, dades: 0, correus: 0, telefons: 0, altres: 0, columnesFora: [], taules: [], fora, perLlegir: 0 };
  const col = e => (Array.isArray(o.columnes) ? o.columnes : (o.columnes || {})[e.nom || e.font] || []);
  const treu = (font, motiu) => { if (!fora.some(f => f.font === font && f.motiu === motiu)) fora.push({ font, motiu }); };
  llista.forEach(e => {
    const font = e.font, fitx = String(e.nom || font).split(/[?#]/)[0].split(/[\\/]/).pop(), ext = ((/\.([a-z0-9]+)$/i.exec(fitx) || [])[1] || '').toLowerCase();
    if (vist[font]) return;
    vist[font] = 1;
    let titol = '', text = '', base = fitx.replace(/\.[a-z0-9]+$/i, '') || 'font';
    if (e.tipus === 'web') {
      const h = htmlAText(e.cos, font), u = impUrl(font, null);
      titol = h.titol; text = (h.descripcio ? '> ' + h.descripcio + '\n\n' : '') + h.text;
      if (impWeb(u)) base = (u.pathname.replace(/\.(html?|php|aspx?)$/i, '').replace(/^\/+|\/+$/g, '') || 'inici') + u.search;
    } else if (e.tipus === 'dades') {
      const c = csvAMd(e.cos, base, { llengua: o.llengua, columnes: col(e) });
      inf.taules.push({ font, files: c.files, columnes: c.columnes, triades: c.triades, fora: c.fora });
      text = c.md + (c.fora.length ? '\n\n' + T.columnes + ': ' + c.fora.join(', ') + '.' : '');
      c.fora.forEach(x => { if (inf.columnesFora.indexOf(x) < 0) inf.columnesFora.push(x); });
    } else if (/^html?$/.test(ext)) { const h = htmlAText(e.cos, /^https?:/i.test(font) ? font : null); titol = h.titol; text = h.text; }
    else if (/^(md|markdown|txt|text)$/.test(ext)) {
      /* La capçalera d'un .md importat no és nostra: se'n salva el títol i prou. */
      const t = String(e.cos || '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n'), fm = /^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(t);
      text = fm ? t.slice(fm[0].length) : t;
      titol = fm ? (/^(?:title|t[ií]tol|t[ií]tulo)[ \t]*:[ \t]*["']?(.*?)["']?[ \t]*$/im.exec(fm[1]) || [])[1] || '' : '';
    } else { treu(font, IMP_DOC.test('.' + ext) ? T.perLlegir : T.format + (ext ? ' (.' + ext + ')' : '')); return; }
    if (!titol) titol = ((/^#{1,6}[ \t]+(.+)$/m.exec(text) || [])[1] || base).replace(/[#*_`[\]]/g, '');
    const a = amagaPersonal(text), at = amagaPersonal(String(titol).replace(/\s+/g, ' ').trim());
    if (!/\S/.test(a.text)) { treu(font, T.buit); return; }
    const r = ruta(e.tipus, base), am = { correus: a.correus + at.correus, telefons: a.telefons + at.telefons, altres: a.altres + at.altres };
    fitxers.push({ ruta: r, cos: fontMd({ font, tipus: e.tipus, titol: at.text, importat: ara, text: a.text }) });
    fonts.push({ ruta: r, font, tipus: e.tipus, titol: at.text, paraules: (a.text.match(/\S+/g) || []).length, amagats: am });
    inf[CARP[e.tipus]]++;
    Object.keys(am).forEach(k => { inf[k] += am[k]; });
  });
  (o.docs || []).forEach(u => treu(amagaPersonal(u).text, T.perLlegir));
  (o.fora || []).forEach(f => treu(amagaPersonal(f.font).text, String(f.motiu)));
  inf.perLlegir = fora.filter(f => f.motiu === T.perLlegir).length;
  const totes = queden.concat(fonts).sort((x, y) => ORDRE[x.tipus] - ORDRE[y.tipus] || cmp(x.ruta, y.ruta));
  const foraT = (previ.fora || []).filter(f => f && f.font && !araF[f.font] && !fora.some(x => x.font === f.font)).map(f => ({ font: String(f.font), motiu: String(f.motiu) })).concat(fora);
  const cel = s => String(s).replace(/\|/g, '\\|'), quants = { web: 0, docs: 0, dades: 0 }, suma = k => totes.reduce((s, f) => s + (Number((f.amagats || {})[k]) || 0), 0);
  totes.forEach(f => { quants[CARP[f.tipus]]++; });
  const md = ['# ' + T.titol, '', '> ' + T.importat + ' ' + ara + '. ' + T.intro, '', T.resum.replace(/\{(\w+)\}/g, (x, k) => (k in quants ? quants[k] : suma(k))), '', T.cap, '| --- | --- | --- | --- | ---: | ---: |']
    .concat(totes.map(f => { const rel = f.ruta.slice(14), am = f.amagats || {};
      return '| [' + rel + '](' + rel + ') | ' + cel(f.font) + ' | ' + f.tipus + ' | ' + cel(f.titol) + ' | ' + f.paraules + ' | ' + ((am.correus || 0) + (am.telefons || 0) + (am.altres || 0)) + ' |'; }));
  const llegir = foraT.filter(f => f.motiu === T.perLlegir), altres = foraT.filter(f => f.motiu !== T.perLlegir);
  if (inf.columnesFora.length) md.push('', '## ' + T.columnes, '', inf.columnesFora.map(cel).join(', '));
  if (llegir.length) md.push('', '## ' + T.llegirT, '', T.llegirD, '', ...llegir.map(f => '- ' + f.font));
  if (altres.length) md.push('', '## ' + T.fora, '', ...altres.map(f => '- ' + f.font + ' · ' + f.motiu));
  fitxers.push({ ruta: 'cerebro/fonts/index.md', cos: md.join('\n') + '\n' },
    { ruta: 'cerebro/fonts/fonts.json', cos: JSON.stringify({ formato: 'tt-fonts-1', importat: ara, fonts: totes, fora: foraT }, null, 2) + '\n' });
  return { fitxers, informe: inf };
}
/* Una petició cada cop, amb `dormir(espera)` entre totes (un segon, o el Crawl-delay si és més). L'ordre: l'inici, els seus
   enllaços (el menú porta a les pàgines que compten), el sitemap (que sovint comença
   pel blog) i la resta per amplada. Un error de xarxa va a «fora» i segueix. */
async function rastreja(inici, opts) {
  const o = opts || {}, T = IMP_TXT[o.llengua] || IMP_TXT.ca, max = Number(o.max) > 0 ? Math.floor(Number(o.max)) : 30;
  let espera = o.espera == null ? 1000 : Number(o.espera) || 0;
  const dormir = o.dormir || (ms => new Promise(r => setTimeout(r, ms)));
  const agent = o.agent || 'TeamTowers-importa/1 (+https://teamtowershuma.com)', res = { pagines: [], docs: [], fora: [] };
  const fora = (font, motiu) => { res.fora.push({ font, motiu }); }, u0 = impUrl(inici, null);
  if (!impWeb(u0) || typeof o.fetch !== 'function') { fora(String(inici), impWeb(u0) ? T.fetch : T.adreca); return res; }
  /* Només la web de qui ens ho demana: el domini autoritzat ha de ser el que es llegeix. */
  if (String(o.autoritzat || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/[/:].*$/, '').replace(/^www\./, '') !== impHost(u0)) { fora(String(inici), T.autoritzat); return res; }
  let n = 0, sembrat = false;
  const demana = async url => {
    if (n++) await dormir(espera);
    try {
      const temps = typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? { signal: AbortSignal.timeout(o.temps || 20000) } : {};   // un servidor encallat no ens encalla
      /* `redirect: 'manual'`: una redirecció no se segueix a cegues, la segueix
         `segueix`, que mira abans on porta. */
      const r = await o.fetch(url, Object.assign({ redirect: 'manual', headers: { 'User-Agent': agent, Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5' } }, temps));
      const ct = String((r.headers && r.headers.get && r.headers.get('content-type')) || ''), ok = r.status >= 200 && r.status < 300, llegeix = ok && (!ct || /html|xml|text\//i.test(ct));
      const loc = r.status >= 300 && r.status < 400 && r.headers && r.headers.get ? String(r.headers.get('location') || '') : '';
      if (!llegeix && r.body && r.body.cancel) r.body.cancel().catch(() => {});   // els binaris no es baixen
      return { ok, status: r.status, ct, loc, url: r.url || url, text: llegeix ? await r.text() : '' };
    } catch (e) { fora(url, T.xarxa + ': ' + String((e && e.message) || e).slice(0, 120)); return null; }
  };
  /* Una redirecció només se segueix si es queda al lloc (amb www o sense, http
     o https) i, quan ja hi ha robots.txt, si robots.txt deixa demanar on porta.
     Si no, no es demana: ni l'altre lloc ni la carpeta tancada. Cinc salts com
     a molt; cada salt és una petició, amb la seva pausa. */
  let robots = '';
  const segueix = async (url, mira) => {
    let r = await demana(url);
    for (let salts = 0; r && r.loc && salts < 5; salts++) {
      const u = impUrl(r.loc, url);
      if (!impWeb(u) || impHost(u) !== impHost(u0)) return { r: null, motiu: T.foraLloc };
      u.hash = '';
      if (mira && !robotsPermet(robots, u.pathname + u.search)) return { r: null, motiu: T.robots };
      url = u.href;
      r = await demana(url);
      if (r) r.url = url;
    }
    return { r };
  };
  const rb = (await segueix(u0.origin + '/robots.txt')).r;
  robots = rb && rb.ok && !/html/i.test(rb.ct) ? rb.text : '';
  espera = Math.max(espera, robotsEspera(robots) * 1000);
  const sm = robotsSitemaps(robots), llavor = [], vist = {}, fetes = {}, cua = [];
  if (!sm.length && robotsPermet(robots, '/sitemap.xml')) sm.push(u0.origin + '/sitemap.xml');
  for (let i = 0, fets = 0; i < sm.length && fets < 5; i++) {   // un índex en pot portar molts: amb 5 n'hi ha prou
    const u = impUrl(sm[i], u0.href), r = impWeb(u) && impHost(u) === impHost(u0) && !/\.gz$/i.test(u.pathname) && ++fets && (await segueix(u.href, true)).r;
    const x = r && r.ok ? sitemapUrls(r.text) : { urls: [], sitemaps: [] };
    x.urls.forEach(s => { if (llavor.length < max * 5) llavor.push(s); });
    x.sitemaps.forEach(s => { if (sm.indexOf(s) < 0) sm.push(s); });
  }
  /* A la cua només hi entra una pàgina nova del lloc que robots.txt deixa demanar. */
  const posa = l => l.forEach(s => {
    const u = impUrl(s, u0.href);
    if (!impWeb(u) || impHost(u) !== impHost(u0) || vist[u.href.split('#')[0]]) return;
    u.hash = '';
    vist[u.href] = 1;
    if (IMP_DOC.test(u.pathname)) res.docs.push(u.href);
    else if (!IMP_ACTIU.test(u.pathname)) { if (robotsPermet(robots, u.pathname + u.search)) cua.push(u.href); else fora(u.href, T.robots); }
  });
  const sembra = () => { if (!sembrat) { sembrat = true; posa(llavor); } };
  posa([u0.href]);
  for (let intents = 0; res.pagines.length < max && intents < max * 3 + 10; intents++) {
    if (!cua.length) { if (sembrat) break; sembra(); continue; }
    const url = cua.shift(), s = await segueix(url, true), r = s.r, fi = r && (impUrl(r.url, null) || impUrl(url, null));
    if (s.motiu) { fora(url, s.motiu); continue; }
    if (!r) continue;
    if (!r.ok) { fora(url, 'HTTP ' + r.status); continue; }
    /* Per si el `fetch` que es passa segueix les redireccions igualment: on ha
       acabat també ha de ser del lloc i obert per robots.txt. */
    if (!impWeb(fi) || impHost(fi) !== impHost(u0)) { fora(url, T.foraLloc); continue; }
    if (!robotsPermet(robots, fi.pathname + fi.search)) { fora(url, T.robots); continue; }
    if (/pdf|msword|officedocument|opendocument/i.test(r.ct)) { res.docs.push(url); continue; }
    if (!/text\/html|xhtml/i.test(r.ct) && (r.ct || !/^\s*</.test(r.text))) { fora(url, T.noHtml + ' (' + (r.ct.split(';')[0] || '?') + ')'); continue; }
    fi.hash = '';
    if (fetes[fi.href]) continue;   // dues adreces que porten a la mateixa pàgina
    fetes[fi.href] = vist[fi.href] = 1;
    res.pagines.push({ url: fi.href, html: r.text });
    if (o.avis) o.avis(fi.href);
    const h = htmlAText(r.text, fi.href);
    posa(h.docs.concat(h.enllacos)); sembra();
  }
  return res;
}

const Importa = { rastreja, htmlAText, amagaPersonal, robotsPermet };
if (typeof module !== 'undefined' && module.exports) module.exports = Importa; else g.Importa = Importa;
})(typeof globalThis !== 'undefined' ? globalThis : this);
