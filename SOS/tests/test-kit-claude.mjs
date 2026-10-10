/* Prova dels textos del kit de Claude (KIT_TXT, bloc VS-SITE de
   SOS/vna-suport.html): estructura igual en ca i es, skills amb capçalera YAML
   vàlida, cap preu, cap promesa d'una IA que faci la feina sola, el camí
   gratuït honest i els límits de línies.
     node SOS/tests/test-kit-claude.mjs */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(dir, '..', 'vna-suport.html'), 'utf8'), k0 = html.indexOf('const KIT_TXT = {'), k1 = html.indexOf('const SITE_TXT = {', k0);
if (k0 < 0 || k1 < 0) { console.error('✗ No trobo KIT_TXT a SOS/vna-suport.html'); process.exit(1); }
const KIT_TXT = new Function(html.slice(k0, k1) + '\nreturn KIT_TXT;')();
let fallades = 0, proves = 0;
const ok = (c, msg) => { proves++; if (!c) { fallades++; console.error('✗ ' + msg); } };
const linies = a => a.join('\n').split('\n');
const tots = (o, cami, out) => {
  if (typeof o === 'string') out.push([cami, o]);
  else if (Array.isArray(o)) o.forEach((x, i) => tots(x, cami + '[' + i + ']', out));
  else if (o && typeof o === 'object') Object.keys(o).forEach(k => tots(o[k], cami + '.' + k, out));
  return out;
};

/* 1 · Les dues llengües, amb les mateixes claus i la mateixa forma. */
const forma = (a, b, cami) => {
  if (Array.isArray(a) || Array.isArray(b)) {
    ok(Array.isArray(a) && Array.isArray(b), cami + ': un és llista i l\'altre no');
    if (Array.isArray(a) && Array.isArray(b)) ok(a.every(x => typeof x === 'string') === b.every(x => typeof x === 'string'), cami + ': tipus dels elements');
    return;
  }
  if (typeof a === 'string' || typeof b === 'string') return ok(typeof a === typeof b, cami + ': un és text i l\'altre no');
  ok(a && b && typeof a === 'object' && typeof b === 'object', cami + ': no és objecte');
  if (!a || !b) return;
  const ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
  ok(ka.join('|') === kb.join('|'), cami + ': claus diferents (' + ka.filter(k => !kb.includes(k)).concat(kb.filter(k => !ka.includes(k))).join(', ') + ')');
  ka.filter(k => kb.includes(k)).forEach(k => forma(a[k], b[k], cami + '.' + k));
};
ok(Object.keys(KIT_TXT).sort().join() === 'ca,es', 'llengües: ca i es');
forma(KIT_TXT.ca, KIT_TXT.es, 'KIT_TXT');
const CLAUS = ['claude', 'stub', 'guia', 'skills', 'tasques'];
const MOTIUS = ['intangible', 'mena desconeguda', 'sense entregable declarat', 'el tipus no surt d\'una màquina', 'de fora'];

['ca', 'es'].forEach(l => {
  const T = KIT_TXT[l];
  CLAUS.forEach(k => ok(T[k], l + ': falta ' + k));
  ['claude', 'stub', 'guia'].forEach(k => ok(Array.isArray(T[k]) && T[k].every(x => typeof x === 'string' && !x.includes('\n')), l + '.' + k + ': llista de línies'));

  /* 2 · Les skills: capçalera YAML que Claude Code llegeix. */
  ok(Object.keys(T.skills).sort().join() === 'continguts,importa,tasca', l + ': les tres skills');
  Object.keys(T.skills).forEach(n => {
    const s = T.skills[n].join('\n'), m = /^---\n([\s\S]*?)\n---\n/.exec(s);
    ok(s.startsWith('---\nname: '), l + '.skills.' + n + ': ha de començar per ---\\nname: ');
    ok(m, l + '.skills.' + n + ': capçalera YAML sense tancar');
    if (!m) return;
    const cap = {};
    m[1].split('\n').forEach(x => { const k = /^([a-z-]+): (.+)$/.exec(x); ok(k, l + '.skills.' + n + ': línia YAML estranya «' + x + '»'); if (k) cap[k[1]] = k[2]; });
    ok(cap.name === n, l + '.skills.' + n + ': name ha de ser ' + n);
    ok(cap.description && cap.description.length > 40, l + '.skills.' + n + ': falta description');
    /* Sense «: » ni « #» perquè el YAML sense cometes no es trenqui, i dient quan fer-la servir. */
    ok(cap.description && !/: | #/.test(cap.description), l + '.skills.' + n + ': description amb caràcters que trenquen el YAML');
    ok(cap.description && /(Fes-la servir|Úsala) /.test(cap.description), l + '.skills.' + n + ': description ha de dir quan fer-la servir');
    ok(cap['argument-hint'] && /^"[^"]+"$/.test(cap['argument-hint']), l + '.skills.' + n + ': argument-hint entre cometes');
    ok(/\n1\. /.test(s) && /\n2\. /.test(s), l + '.skills.' + n + ': passos numerats');
    ok(s.includes('$ARGUMENTS'), l + '.skills.' + n + ': fa servir $ARGUMENTS');
    ok((s.match(/```/g) || []).length % 2 === 0, l + '.skills.' + n + ': blocs de codi sense tancar');
  });
  const imp = T.skills.importa.join('\n'), con = T.skills.continguts.join('\n'), tas = T.skills.tasca.join('\n');
  ok(imp.includes('node eines/importa.mjs') && imp.includes('cerebro/fonts/index.md') && imp.includes('cerebro/dossier.md') && imp.includes('cerebro/proposta-mapa.json'), l + '.importa: rutes');
  ok(/claude\.ai/.test(imp), l + '.importa: el cas sense Node (claude.ai)');
  ok(/"pairs"/.test(imp) && /"seq"/.test(imp) && /"troballes"/.test(imp) && /"dubtes"/.test(imp) && /6 a 12/.test(imp), l + '.importa: format del mapa');
  ok(/Per confirmar|Por confirmar/.test(imp), l + '.importa: llista per confirmar');
  ['equip', 'registre', 'gracies', '404', 'estil', 'web', 'index'].forEach(r => ok(con.includes('`' + r + '`'), l + '.continguts: id reservat ' + r));
  ok(/\[a completar\]/.test(con) && /node eines\/genera\.mjs/.test(con) && /menu: si/.test(con) && /imatges\//.test(con), l + '.continguts: regles');
  ok(/cerebro\/tasques-ia\.json/.test(tas) && /pot: true/.test(tas) && /cerebro\/esborranys\/AAAA-MM-DD-<id>\.md/.test(tas) && /\[a completar\]/.test(tas) && /`cal`/.test(tas) && /`surt`/.test(tas) && /`accepta`/.test(tas), l + '.tasca: regles');

  /* 3 · Els límits de línies i el nom de la web als títols. */
  ok(linies(T.claude).length <= 60, l + '.claude: ' + linies(T.claude).length + ' línies (màx. 60)');
  ok(linies(T.stub).length <= 20, l + '.stub: ' + linies(T.stub).length + ' línies (màx. 20)');
  ok(linies(T.guia).length <= 70, l + '.guia: ' + linies(T.guia).length + ' línies (màx. 70)');
  ok(/^# .*\{nom\}/.test(T.claude[0]), l + '.claude: {nom} al títol');
  ok(/^# .*\{nom\}/.test(T.guia[0]), l + '.guia: {nom} al títol');
  ok(T.tasques.titol.includes('{nom}'), l + '.tasques: {nom} al títol');

  /* 4 · El CLAUDE.md diu el que ha de dir. */
  const cl = T.claude.join('\n');
  ['cerebro/mapa-real.json', 'cerebro/mapa-ideal.json', 'cerebro/continguts/', 'cerebro/fonts/', 'cerebro/dossier.md', 'cerebro/decisiones.md',
    'cerebro/esborranys/', 'netlify.toml', 'node eines/genera.mjs', 'Node 18', '/importa', '/continguts', '/tasca', 'cerebro/tasques-ia.md',
    '[a completar]', 'CRM', 'Netlify Forms', 'API.md', '.mcp.json', 'eines/mcp.mjs', 'node eines/registre.mjs', 'Copia el JSON', 'PR', 'JavaScript']
    .forEach(x => ok(cl.includes(x), l + '.claude: falta «' + x + '»'));
  ok(cl.includes(l === 'ca' ? 'TREBALLAR-AMB-CLAUDE.md' : 'TRABAJAR-CON-CLAUDE.md'), l + '.claude: enllaç a la guia');

  /* 5 · La guia, honesta amb els plans. */
  const g = T.guia.join('\n'), gratis = g.slice(g.indexOf('## 1'), g.indexOf('## 2'));
  ok(gratis.length > 0 && /Claude Code no (és|es|està|está) (al|en el) plan? gratu/.test(gratis), l + '.guia: el camí gratuït ha de dir que Claude Code no és gratis');
  ok(g.includes('https://claude.com/pricing') && /octubre de 2026/.test(g), l + '.guia: data i enllaç als plans');
  ok(/Sync/.test(gratis) && /Upload files/.test(gratis) && /5 /.test(gratis) && /Code execution and file creation/.test(gratis), l + '.guia: passos i límits del camí gratuït');
  ok(/Pro/.test(g) && /API/.test(g) && /claude\.ai\/code/.test(g) && /Sistema viu/.test(g), l + '.guia: Claude Code i TeamTowers');
  ok(/\| --- \| --- \|/.test(g) && /CRM/.test(g), l + '.guia: taula «què va on»');

  /* 6 · Les etiquetes de tasques-ia.md. */
  const tq = T.tasques;
  ok(['titol', 'generat', 'regla', 'recompte', 'maquina', 'persona', 'senseTipus', 'deFora', 'perConfirmar', 'cols', 'motius'].every(k => tq[k]), l + '.tasques: claus');
  ok(tq.recompte.includes('{m}') && tq.recompte.includes('{t}'), l + '.tasques.recompte: {m} i {t}');
  ok(Object.keys(tq.cols).sort().join() === 'accepta,cal,deA,q,surt,tipus', l + '.tasques.cols');
  ok(Object.keys(tq.motius).sort().join('|') === MOTIUS.slice().sort().join('|'), l + '.tasques.motius: les quatre claus de fluxAutomatitzable i «de fora»');
  ok(['persona', 'senseTipus', 'deFora'].every(k => Array.isArray(tq[k]) && tq[k].length === 2), l + '.tasques: persona, senseTipus i deFora són [títol, línia]');
  /* 6b · Qui accepta i on: la PR és l'acceptació, i el repositori, privat. */
  ok(/fet: esborrany fet amb IA/.test(con) && /\*\*(Acceptar|Aceptar) la PR/.test(con), l + '.continguts: diu qui ho ha fet i que acceptar la PR és acceptar el text');
  ok(/Private/.test(g), l + '.guia: el repositori, privat');

  /* 7 · Cap preu, cap promesa d'autonomia, cap dada personal, a cap text. */
  tots(T, l, []).forEach(([cami, s]) => {
    ok(!/[€$]\s?\d|\d\s?[€$]|\d\s?(euros?|EUR|USD)\b/i.test(s), cami + ': sembla un preu «' + s + '»');
    ok(!/aut[oòó]nom/i.test(s), cami + ': promesa d\'autonomia «' + s + '»');
    ok(!/gestiona[tdr]/i.test(s), cami + ': «gestionat per la IA» no: la IA prepara i una persona accepta «' + s + '»');
    ok(!/[\w.+-]+@[\w-]+\.[\w.]+/.test(s), cami + ': sembla un correu');
    ok(!/(\+34|\b[6789]\d{2})[ .]?\d{3}[ .]?\d{3}\b/.test(s), cami + ': sembla un telèfon');
    ok(!/\{(?!nom\}|m\}|t\})[a-z]+\}/.test(s), cami + ': marcador desconegut');
  });
});

console.log(fallades ? '✗ ' + fallades + ' de ' + proves + ' proves fallen' : '✓ ' + proves + ' proves del kit de Claude');
process.exit(fallades ? 1 : 0);
