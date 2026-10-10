/* Els continguts de la web (cerebro/continguts/<id>.md): el Markdown petit de
   VS-SITE, que no pot trencar la web ni colar-hi res.  node SOS/tests/test-continguts.mjs */
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../vna-suport.html', import.meta.url), 'utf8');
const bloc = nom => { const a = html.indexOf('/*' + nom + '*/'), b = html.indexOf('/*/' + nom + '*/'); if (a < 0 || b <= a) throw new Error('Falta ' + nom); return html.slice(a, b); };
const { llegeixContingut, mdAHtml } = new Function(['VS-WEB', 'VS-SITE', 'VS-TASQUES', 'VS-IMPORTA'].map(bloc).join('\n') + '\nreturn { llegeixContingut, mdAHtml };')();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const eq = (a, b, m) => ok(a === b, m + '\n     got: ' + JSON.stringify(a) + '\n     exp: ' + JSON.stringify(b));

// front matter
let r = llegeixContingut('﻿---\r\ntitol: Qui som\r\nmenu: sí\r\nfont: cerebro/fonts/web/qui-som.md\r\n---\r\nHola\r\n');
eq(r.meta.titol, 'Qui som', 'titol'); eq(r.meta.menu, true, 'menu sí'); eq(r.meta.font, 'cerebro/fonts/web/qui-som.md', 'font'); eq(r.cos, 'Hola\n', 'cos');
eq(llegeixContingut('---\nmenu: no\n---\n').meta.menu, false, 'menu no');
eq(llegeixContingut('---\nmenu: potser\n---\nx').meta.menu, undefined, 'menu desconegut');
eq(llegeixContingut('Sense capçalera').cos, 'Sense capçalera', 'sense front matter');
eq(llegeixContingut('---\ntitol: "Entre cometes"\n---\n').meta.titol, 'Entre cometes', 'cometes');

// elements
eq(mdAHtml('# Un\n## Dos\n### Tres\n#### Quatre'), '<h2>Un</h2>\n<h2>Dos</h2>\n<h3>Tres</h3>\n<h4>Quatre</h4>', 'títols');
eq(mdAHtml('Primera línia\nsegona línia\n\nAltre paràgraf'), '<p>Primera línia segona línia</p>\n<p>Altre paràgraf</p>', 'paràgrafs');
eq(mdAHtml('- u\n- dos\n  continua\n* tres'), '<ul><li>u</li><li>dos continua</li><li>tres</li></ul>', 'llista');
eq(mdAHtml('1. u\n2) dos'), '<ol><li>u</li><li>dos</li></ol>', 'llista ordenada');
eq(mdAHtml('- a\n1. b'), '<ul><li>a</li></ul>\n<ol><li>b</li></ol>', 'canvi de llista');
eq(mdAHtml('Text\n- a'), '<p>Text</p>\n<ul><li>a</li></ul>', 'paràgraf i llista');
eq(mdAHtml('**fort** i *cursiva* i _també_ i `codi <b>`'), '<p><strong>fort</strong> i <em>cursiva</em> i <em>també</em> i <code>codi &lt;b&gt;</code></p>', 'estils');
eq(mdAHtml('un_nom_de_fitxer i 2*3*4'), '<p>un_nom_de_fitxer i 2*3*4</p>', 'sense cursives falses');
eq(mdAHtml('**sense tancar'), '<p>**sense tancar</p>', 'negreta sense tancar');
eq(mdAHtml('> Una cita'), '<blockquote><p>Una cita</p></blockquote>', 'cita');
eq(mdAHtml('---'), '<hr>', 'hr');
eq(mdAHtml('[Qui som](qui-som.html) i [web](https://exemple.cat/x?a=1&b=2) i [correu](mailto:hola@exemple.cat) i [ancora](#seccio)'),
  '<p><a href="qui-som.html">Qui som</a> i <a href="https://exemple.cat/x?a=1&amp;b=2" rel="noopener">web</a> i <a href="mailto:hola@exemple.cat">correu</a> i <a href="#seccio">ancora</a></p>', 'enllaços bons');
eq(mdAHtml('[**fort**](a.html)'), '<p><a href="a.html"><strong>fort</strong></a></p>', 'estil dins d\'enllaç');
eq(mdAHtml('![El celler](imatges/celler.jpg)'), '<p><img src="imatges/celler.jpg" alt="El celler" loading="lazy"></p>', 'imatge pròpia');
eq(mdAHtml('![De fora](https://evil.example/x.png)'), '<p>De fora</p>', 'imatge de fora: només alt');

// XSS
const dolents = [
  '<script>alert(1)</script>', '<img src=x onerror=alert(1)>', '[x](javascript:alert(1))', '[x](JaVaScRiPt:alert(1))',
  '[x](jav&#x61;script:alert(1))', '[x](data:text/html,<script>alert(1)</script>)', '[x](//evil.com)', '[x](vbscript:msgbox)',
  '[a](x.html" onmouseover="y)', '[a](x.html"onmouseover="y)', "[a](x.html'onmouseover='y)", '![x](javascript:alert(1))',
  '[x](java\tscript:alert(1))', '[x](mailto:x@y.z?body=<script>)', '**<i>x</i>**', '`<script>`'];
dolents.forEach(d => {
  const h = mdAHtml(d);
  const tags = h.match(/<[^>]*>/g) || [];
  const net = tags.every(t => /^<\/?(p|h[2-4]|ul|ol|li|strong|em|code|blockquote|hr|a|img)(\s+(href|src|alt|rel|loading)="[^"]*")*>$/.test(t));
  ok(net && !/href="(javascript|data|vbscript|jav&)|href="\/\//i.test(h), 'XSS: ' + d + ' → ' + h);
  ok(!/href="[^"]*["'][^"]*"/.test(h), 'atribut tancat: ' + h);
});
eq(mdAHtml('[x](javascript:alert(1))'), '<p>x)</p>', 'enllaç dolent: text');
eq(mdAHtml('<b>hola</b> & "cometes"'), '<p>&lt;b&gt;hola&lt;/b&gt; &amp; &quot;cometes&quot;</p>', 'HTML escapat');
eq(mdAHtml('a\u0000b'), mdAHtml('a\u0000b'), 'determinista');
eq(mdAHtml(''), '', 'buit');
eq(mdAHtml(null), '', 'null');

console.log((fail ? '❌ ' : '✅ ') + pass + ' correctes, ' + fail + ' errors');
process.exit(fail ? 1 : 0);
