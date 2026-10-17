/* El cervell · el que se n'emporta cadascú
 * ─────────────────────────────────────────────────────────────────────────────
 * Tres sortides del mateix cervell, totes fetes al navegador (no s'envia res):
 *
 *   · `md`    — el context per a les IA: les vedes per kosha, les que sostenen
 *               i les que s'activen juntes. Es desa com a CLAUDE.md o s'enganxa
 *               com a instruccions d'un projecte, a qualsevol IA.
 *   · `json`  — les mateixes dades per a una eina que les vulgui llegir.
 *   · `html`  — el cervell sencer en un sol fitxer que funciona sense connexió,
 *               amb la vista de `vista.js` a dins (no una còpia: el seu codi).
 *   · `scorm` — aquell HTML dins d'un paquet SCORM 1.2, que és el format que
 *               importa gairebé qualsevol LMS local (Moodle, Chamilo…).
 *
 * No hi ha cap xifra que no surti del codex (veda 67): massa, potencial i
 * enllaços quàntics els calcula `forces.js` amb les cites i els sabers.
 */
(function (raiz) {
  function llista(ns, f) { return ns.map(f).join('\n'); }
  function curt(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n).replace(/\s\S*$/, '') + '…' : s; }

  var MD = {
    ca: { t: 'El cervell de ', ctx: function (f, d, u) { return 'Context per a una IA. Surt del codex de ' + f + ' (' + d + '), dibuixat a ' + u + '.'; },
      veda: 'Cada veda és un error que ja es va pagar. Abans d\'actuar, comprova que no en trenques cap.', com: 'Com fer-lo servir',
      us: ['Desa\'l com a `CLAUDE.md` a l\'arrel del projecte, o enganxa\'l a les instruccions o al coneixement del projecte de la teva IA.',
        'Llegeix primer les vedes que sostenen: són les que més se citen.',
        'Si en toques una que té enllaços quàntics, revisa també l\'altra: s\'activen juntes.',
        'Si una feina t\'ensenya una regla nova, proposa-la com a veda amb qui la va dir, quan i l\'error que evita.'],
      sost: 'Les que sostenen', cites: ' cites', juntes: 'S\'activen juntes' },
    es: { t: 'El cerebro de ', ctx: function (f, d, u) { return 'Contexto para una IA. Sale del codex de ' + f + ' (' + d + '), dibujado en ' + u + '.'; },
      veda: 'Cada veda es un error que ya se pagó. Antes de actuar, comprueba que no rompes ninguna.', com: 'Cómo usarlo',
      us: ['Guárdalo como `CLAUDE.md` en la raíz del proyecto, o pégalo en las instrucciones o el conocimiento del proyecto de tu IA.',
        'Lee primero las vedas que sostienen: son las más citadas.',
        'Si tocas una que tiene enlaces cuánticos, revisa también la otra: se activan juntas.',
        'Si un trabajo te enseña una regla nueva, propónla como veda con quién la dijo, cuándo y el error que evita.'],
      sost: 'Las que sostienen', cites: ' citas', juntes: 'Se activan juntas' }
  };
  function md(D, AN, meta) {
    var byId = {}, t = MD[(meta.lang || 'ca').slice(0, 2)] || MD.ca; D.nodos.forEach(function (n) { byId[n.id] = n; });
    var v = function (id) { var n = byId[id]; return 'V' + n.n + ' · ' + n.t; };
    var ordre = D.capas.slice().reverse();
    return '# ' + t.t + meta.nom + '\n\n> ' + t.ctx(meta.font, meta.data, meta.url) + '\n> ' + t.veda + '\n\n' +
      '## ' + t.com + '\n\n' + t.us.map(function (u) { return '- ' + u; }).join('\n') + '\n\n' +
      '## ' + t.sost + '\n\n' + llista(AN.gravedad, function (n) { return '- **' + v(n.id) + '** · ' + AN.masa[n.id] + t.cites; }) + '\n\n' +
      ordre.map(function (c) {
        var ns = D.nodos.filter(function (n) { return n.capa === c.id; });
        return ns.length ? '## ' + c.s + '\n\n' + llista(ns, function (n) { return '- **V' + n.n + ' · ' + n.t + '.** ' + curt(n.aprende || n.txt, 260); }) + '\n\n' : '';
      }).join('') +
      '## ' + t.juntes + '\n\n' + llista(AN.cuanticos.slice(0, 20), function (e) { return '- ' + v(e.a) + ' ↔ ' + v(e.b); }) + '\n';
  }

  function json(D, AN, meta) {
    return JSON.stringify({
      nom: meta.nom, font: meta.font, generat: meta.data, capas: D.capas.map(function (c) { return { id: c.id, s: c.s, d: c.d }; }),
      nodos: D.nodos.map(function (n) { return { id: n.id, n: n.n, t: n.t, capa: n.capa, fecha: n.fecha, saberes: n.saberes, aprende: n.aprende, txt: n.txt, masa: AN.masa[n.id], potencial: AN.potencial[n.id] }; }),
      aristas: D.aristas, cuanticos: AN.cuanticos.map(function (e) { return [e.a, e.b, e.f]; })
    }, null, 1);
  }

  /* El fitxer sense connexió: dades i codi a dins, cap petició a fora. */
  function html(D, meta, codi, scorm) {
    var dades = JSON.stringify({ nodos: D.nodos, aristas: D.aristas, capas: D.capas }).replace(/</g, '\\u003c');
    var tanca = function (s) { return s.replace(/<\/script/gi, '<\\/script'); };
    var es = meta.lang === 'es', tit = (es ? 'El cerebro de ' : 'El cervell de ') + meta.nom.replace(/</g, '&lt;');
    var peu = (es ? 'Del codex de ' : 'Del codex de ') + meta.font.replace(/</g, '&lt;') + ' · ' + meta.data + (es ? ' · funciona sin conexión.' : ' · funciona sense connexió.');
    return '<!DOCTYPE html>\n<html lang="' + meta.lang + '">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
      '<title>' + tit + '</title>\n<style>body{margin:0;background:#fbfaf7;color:#15130f;font:17px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}' +
      'main{max-width:1040px;margin:0 auto;padding:24px 16px}h1{font-size:clamp(1.6rem,5vw,2.4rem);line-height:1.15;margin:.2em 0}.m{color:#5e594d;font-size:.9rem}</style>\n</head>\n<body>\n<main>\n' +
      '<h1>' + tit + '</h1>\n<p class="m">' + peu + '</p>\n<div id="cv"></div>\n</main>\n' +
      '<script>window.CERVELL=' + dades + ';</script>\n' +
      codi.map(function (c) { return '<script>\n' + tanca(c) + '\n</script>'; }).join('\n') + '\n' +
      '<script>CervellVista.munta(document.getElementById("cv"),window.CERVELL,{lang:"' + meta.lang + '"});' +
      (scorm ? SCORM_JS : '') + '</script>\n</body>\n</html>\n';
  }
  /* SCORM 1.2: avisa el LMS que s'ha obert i, en sortir, que s'ha vist. */
  var SCORM_JS = '(function(){var w=window,a=null,i=0;while(w&&!a&&i<10){a=w.API||null;w=w.parent===w?null:w.parent;i++}' +
    'if(!a&&window.opener)a=window.opener.API||null;if(!a)return;a.LMSInitialize("");a.LMSSetValue("cmi.core.lesson_status","completed");a.LMSCommit("");' +
    'window.addEventListener("pagehide",function(){a.LMSFinish("")})})();';

  function manifest(meta) {
    var x = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    return '<?xml version="1.0" encoding="UTF-8"?>\n<manifest identifier="cervell-' + x(meta.id) + '" version="1.0" xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2">\n' +
      ' <metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>\n' +
      ' <organizations default="org"><organization identifier="org"><title>El cervell de ' + x(meta.nom) + '</title>\n' +
      '  <item identifier="i1" identifierref="r1"><title>El cervell de ' + x(meta.nom) + '</title></item></organization></organizations>\n' +
      ' <resources><resource identifier="r1" type="webcontent" adlcp:scormtype="sco" href="index.html"><file href="index.html"/></resource></resources>\n</manifest>\n';
  }
  function scorm(D, meta, codi) {
    return zip([{ nom: 'imsmanifest.xml', text: manifest(meta) }, { nom: 'index.html', text: html(D, meta, codi, true) }]);
  }

  /* Un zip sense compressió: prou per a un paquet de dos fitxers, i sense dependències. */
  var CRC = (function () { var t = [], c; for (var n = 0; n < 256; n++) { c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(fitxers) {
    var enc = new TextEncoder(), parts = [], centre = [], off = 0;
    var le = function (n, b) { var a = []; for (var i = 0; i < b; i++) a.push((n >>> (8 * i)) & 255); return a; };
    fitxers.forEach(function (f) {
      var nom = enc.encode(f.nom), dades = enc.encode(f.text), crc = crc32(dades);
      var cap = [].concat([0x50, 0x4b, 3, 4], le(20, 2), le(0x0800, 2), le(0, 2), le(0, 2), le(0x21, 2), le(crc, 4), le(dades.length, 4), le(dades.length, 4), le(nom.length, 2), le(0, 2));
      parts.push(new Uint8Array(cap), nom, dades);
      centre.push(new Uint8Array([].concat([0x50, 0x4b, 1, 2], le(20, 2), le(20, 2), le(0x0800, 2), le(0, 2), le(0, 2), le(0x21, 2), le(crc, 4), le(dades.length, 4), le(dades.length, 4), le(nom.length, 2), le(0, 2), le(0, 2), le(0, 2), le(0, 2), le(0, 4), le(off, 4))), nom);
      off += cap.length + nom.length + dades.length;
    });
    var mida = centre.reduce(function (s, p) { return s + p.length; }, 0);
    var fi = new Uint8Array([].concat([0x50, 0x4b, 5, 6], le(0, 2), le(0, 2), le(fitxers.length, 2), le(fitxers.length, 2), le(mida, 4), le(off, 4), le(0, 2)));
    return new Blob(parts.concat(centre, [fi]), { type: 'application/zip' });
  }

  raiz.CervellExporta = { md: md, json: json, html: html, scorm: scorm, zip: zip, crc32: crc32 };
})(typeof self !== 'undefined' ? self : this);
