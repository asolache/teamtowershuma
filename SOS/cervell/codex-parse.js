/* El cerebro · lector del codex
   Una sola lectura del codex para los dos sitios que la usan: la herramienta
   que genera cerebro-datos.js (Node) y la capa privada de cerebro.html, que lee
   en el navegador los codex de los repos a los que tienes acceso con GitHub.
   Aquí no hay datos de ningún repo: solo cómo se lee un codex. */
(function (raiz, fabrica) {
  var api = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.CodexParse = api;
})(typeof self !== 'undefined' ? self : this, function () {
  /* Las cinco capas, de la más densa a la más sutil (los cinco koshas de la
     Taittiriya Upanishad). Las palabras están en catalán porque el codex lo está. */
  var CAPAS = [
    { id: 'anna', n: 'Cuerpo', s: 'Annamaya', d: 'La obra: el código, las páginas, las herramientas y las guardas que la sostienen.',
      k: ['w3c', 'html', 'css', 'pàgina', 'fitxer', 'codi', 'eina', 'test', 'prova', 'guarda', 'pwa', 'navegador', 'build', 'barra', 'pell', 'botó', 'zip', 'netlify', 'funció'] },
    { id: 'prana', n: 'Energía', s: 'Pranamaya', d: 'Lo que circula: valor, dinero, intercambios, el registro y quién aporta qué.',
      k: ['valor', 'diner', 'comptab', 'fons', 'pagament', 'cobr', 'token', 'slicing', 'pie', 'ledger', 'registre', 'intercanvi', 'comissió', 'preu', 'euro', 'quota', 'aportació', 'transacció', 'flux'] },
    { id: 'mano', n: 'Mente', s: 'Manomaya', d: 'Lo que se recuerda y se ordena: datos, mapas, el cerebro, la taxonomía y el backlog.',
      k: ['dada', 'dades', 'mapa', 'memòria', 'cervell', 'coneixement', 'backlog', 'taxonomia', 'font', 'índex', 'json', 'llista', 'catàleg', 'document', 'llengua', 'traducció', 'perfil'] },
    { id: 'vijnana', n: 'Criterio', s: 'Vijnanamaya', d: 'El criterio: decir solo lo que se puede sostener, medir antes de estimar, el sedàs.',
      k: ['veritat', 'estimació', 'null', 'sedàs', 'decid', 'criteri', 'verific', 'afirma', 'mesura', 'comprova', 'honest', 'invent', 'fals', 'evidència', 'regla', 'llei'] },
    { id: 'ananda', n: 'Propósito', s: 'Anandamaya', d: 'Para qué: la misión, la comunidad, las personas, el cuidado y el relato que lo une.',
      k: ['missió', 'comunitat', 'persona', 'cura', 'mitolog', 'shiva', 'shakti', 'molekulon', 'superheroi', 'identitat', 'territori', 'colla', 'castell', 'confiança', 'reconeixement', 'visió', 'propòsit'] }
  ];
  /* Los saberes de Álvaro: la lista cerrada con la que se etiqueta cada veda. */
  var SABERES = {
    vna: 'Mapa de valor', contabilidad: 'Contabilidad de valor y tokenomics', defi: 'DeFi y P2P',
    conocimiento: 'Gestión del conocimiento', personas: 'Personas y equipos', proyectos: 'Proyectos, kanban y backlog',
    desarrollo: 'Desarrollo web y SOS', comunidad: 'Comunidad y territorio', relato: 'Relato y marca'
  };
  /* Dónde vive el codex: en la matriz, en SOS; en un hijo, donde diga su cervell.json. */
  var RUTA_CODEX = 'SOS/knowledge/codex.md', RUTA_HERENCIA = 'SOS/knowledge/cervell/heretat.json',
    RUTA_PLANTILLA = 'SOS/knowledge/cervell/plantilla/saber/codex.md', RUTA_HIJO = 'cervell.json';
  /* Los títulos de las vedas de la plantilla de la matriz. */
  function plantilla(texto) {
    return new Set(Array.from(String(texto || '').matchAll(/^## Veda \d+ — (.+)$/gm)).map(function (m) { return m[1].trim(); }));
  }

  /* Lee un codex y devuelve sus vedas y las citas entre ellas.
     op: { nom, herencia (el JSON de heretat.json), fijadas (capas.json), sint (sintesis.json),
           matriz: el nombre de la matriz si este codex es de un hijo, plantilla: títulos de las
           vedas de la plantilla, que en un hijo no se cuentan porque ya son de la matriz (veda 5) } */
  function lee(codex, op) {
    op = op || {};
    var nom = op.nom, fijadas = op.fijadas || {}, sint = op.sint || { vedas: {} };
    var hijo = !!op.matriz, plantilla = op.plantilla || new Set();
    var her = (op.herencia && op.herencia.vedes) || {}, temaDe = {};
    Object.keys(her).forEach(function (t) { her[t].forEach(function (n) { temaDe[n] = t; }); });
    var caps = Array.from(codex.matchAll(/^##+ (?:Veda (\d+) — (.+)|V(\d+) · (.+))$/gm));
    var nodos = [], aristas = [];
    caps.forEach(function (m, i) {
      var num = +(m[1] || m[3]);
      if (hijo && plantilla.has((m[2] || m[4]).trim())) return;
      var titulo = (m[2] || m[4]).replace(/^Veda (de |del |d'|dels )?/i, '').trim();
      var cuerpo = codex.slice(m.index + m[0].length, i + 1 < caps.length ? caps[i + 1].index : codex.length);
      var plano = cuerpo.replace(/```[\s\S]*?```/g, '').replace(/[*`#>|]/g, '').replace(/\s+/g, ' ').trim();
      var fecha = (cuerpo.match(/(\d{2})\/(\d{2})\/(20\d\d)/) || []).slice(1).reverse().join('-') || null;
      var id = nom + ':' + num;
      var texto = (titulo + ' ' + plano).toLowerCase();
      /* Al principio de palabra: «ci» no ha de contar dentro de «decisió». */
      var puntos = CAPAS.map(function (c) {
        return c.k.reduce(function (s, k) { return s + (texto.match(new RegExp('(?<![\\p{L}])' + k.replace(/[€]/, '\\$&'), 'gu')) || []).length; }, 0);
      });
      var max = Math.max.apply(null, puntos);
      var propuesta = max ? CAPAS[puntos.indexOf(max)].id : 'vijnana';
      var s = sint.vedas[hijo ? id : num] || {};
      nodos.push({ id: id, fuente: nom, n: num, t: titulo, fecha: fecha, tema: temaDe[num] || null,
        capa: fijadas[id] || propuesta, fijada: !!fijadas[id],
        saberes: s.saberes || [], aprende: s.aprende || null,
        txt: plano.length > 420 ? plano.slice(0, 420).replace(/\s\S*$/, '') + '…' : plano });
      /* El hijo cita sus vedas y, si no las tiene, las de la matriz. */
      new Set(Array.from(cuerpo.matchAll(/\b(?:[Vv]ed[ae]s?|V)\s?(\d{1,3})\b/g)).map(function (x) { return +x[1]; }))
        .forEach(function (c) { if (c !== num) aristas.push([id, nom + ':' + c, hijo ? op.matriz + ':' + c : null]); });
    });
    return { nodos: nodos, aristas: aristas };
  }

  /* Lleva a la matriz las citas de un hijo a vedas que él no tiene, y quita las
     que no llevan a ninguna veda y las repetidas en los dos sentidos.
     ids: las vedas que ya existen fuera de estas (p. ej. las públicas). */
  function limpia(nodos, aristas, ids) {
    ids = new Set(Array.from(ids || []).concat(nodos.map(function (n) { return n.id; })));
    var vistas = new Set();
    return aristas.map(function (a) { return [a[0], ids.has(a[1]) ? a[1] : a[2]]; }).filter(function (a) {
      var k = a.slice().sort().join('|');
      if (!ids.has(a[1]) || vistas.has(k)) return false;
      vistas.add(k); return true;
    });
  }

  /* L'estructura estàndard d'un SOS: cada repositori porta a l'arrel un
     `cervell.json` que diu on és cada peça (codex, taxonomia, mapa, backlog,
     contracte de la IA, folksonomia, documents). Qui llegeix un cervell no
     endevina carpetes: llegeix el manifest i, si no n'hi ha, prova on la matriu
     té el codex. PECES és la llista de les claus que compten com a peces. */
  var PECES = [
    ['codex', 'El codex', 'la llei: els errors pagats, escrits com a vedes'],
    ['taxonomia', 'La taxonomia', 'on va cada cosa'],
    ['mapa', 'El mapa', 'què hi ha, generat'],
    ['backlog', 'El backlog', 'què queda per fer'],
    ['comunicacio', 'La comunicació', 'com es treballa amb la IA'],
    ['folksonomia', 'La folksonomia', 'les etiquetes del seu ecosistema'],
    ['documents', 'Els documents', 'els documents estratègics etiquetats']
  ];
  var MATRIU = 'asolache/teamtowershuma';
  /* Un lector és function (repo, ruta) → promesa del text o null. Sense testimoni,
     raw.githubusercontent.com (només públics; no gasta la quota de l'API). Amb el
     testimoni de GitHub de la pestanya, l'API: llegeix també els repos privats
     als quals tens accés, i llança { sesion: true } si el testimoni ha caducat. */
  function lector(token) {
    if (!token) return function (repo, ruta) {
      return fetch('https://raw.githubusercontent.com/' + repo + '/HEAD/' + ruta.replace(/^\.?\//, ''), { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.text() : null; }).catch(function () { return null; });
    };
    return function (repo, ruta) {
      return fetch('https://api.github.com/repos/' + repo + '/contents/' + ruta.replace(/^\.?\//, ''), { headers: { authorization: 'Bearer ' + token, accept: 'application/vnd.github.raw' }, cache: 'no-store' })
        .then(function (r) { if (r.status === 401) throw { sesion: true }; return r.ok ? r.text() : null; });
    };
  }
  /* Els repos que pots llegir amb el testimoni: els de les instal·lacions de la
     GitHub App del cervell (només lectura) a les quals tens accés. */
  function repos(token) {
    var cap = { authorization: 'Bearer ' + token, accept: 'application/vnd.github+json' };
    var vol = function (ruta) {
      return fetch('https://api.github.com' + ruta, { headers: cap, cache: 'no-store' })
        .then(function (r) { if (r.status === 401) throw { sesion: true }; if (!r.ok) throw new Error(r.status); return r.json(); });
    };
    var tots = function (ruta, clau) {
      var acc = [];
      return (function pagina(p) {
        return vol(ruta + (ruta.indexOf('?') < 0 ? '?' : '&') + 'per_page=100&page=' + p).then(function (j) {
          var rs = (j && j[clau]) || []; acc = acc.concat(rs);
          return rs.length === 100 && p < 10 ? pagina(p + 1) : acc;
        });
      })(1);
    };
    return tots('/user/installations', 'installations').then(function (ins) {
      return Promise.all(ins.map(function (i) { return tots('/user/installations/' + i.id + '/repositories', 'repositories'); }));
    }).then(function (ll) {
      var vist = {};
      return [].concat.apply([], ll).filter(function (r) { return vist[r.full_name] ? false : (vist[r.full_name] = 1); })
        .map(function (r) { return { repo: r.full_name, privat: !!r.private, diu: r.description || '' }; })
        .sort(function (x, y) { return x.repo < y.repo ? -1 : 1; });
    });
  }

  /* El codex d'un repositori: on digui el seu `cervell.json` o, sense manifest, a
     SOS/knowledge/codex.md. op.token llegeix amb la teva sessió de GitHub: aleshores
     un cervell `"privat": true` també es llegeix, perquè només el veus tu, a la
     pestanya. Sense testimoni, un privat llança { privat: true } (veda 168).
     Torna { codex, fill, nom, herencia, plantilla, conf, peces } o null; peces
     diu, de cada peça estàndard, la ruta declarada o null. */
  function deRepo(repo, op) {
    op = op || {};
    var cru = op.llegeix || lector(op.token), conf = null;
    return cru(repo, RUTA_HIJO).then(function (c) {
      try { conf = c ? JSON.parse(c) : null; } catch (e) { conf = null; }
      if (conf && conf.privat === true && !op.token) throw { privat: true };
      var ruta = conf && conf.codex ? String(conf.codex).replace(/^\.?\//, '') : RUTA_CODEX;
      return cru(repo, ruta).then(function (x) {
        if (!x && ruta !== RUTA_CODEX) return cru(repo, RUTA_CODEX).then(function (y) { return y ? { codex: y, ruta: RUTA_CODEX } : null; });
        return x ? { codex: x, ruta: ruta } : null;
      });
    }).then(function (f) {
      if (!f) return null;
      var fill = f.ruta !== RUTA_CODEX;
      return Promise.all([cru(repo, RUTA_HERENCIA), fill ? lector()(MATRIU, RUTA_PLANTILLA) : null]).then(function (v) {
        var her = null; try { her = v[0] ? JSON.parse(v[0]) : null; } catch (e) {}
        var peces = {};
        PECES.forEach(function (p) { var r = conf && conf[p[0]]; peces[p[0]] = r ? (Array.isArray(r) ? r.length + ' fitxers' : String(r)) : (p[0] === 'codex' ? f.ruta : null); });
        return { codex: f.codex, fill: fill, nom: conf && conf.nom, herencia: her, plantilla: plantilla(v[1]), conf: conf, peces: peces };
      });
    });
  }

  return { CAPAS: CAPAS, SABERES: SABERES, RUTA_CODEX: RUTA_CODEX, RUTA_HERENCIA: RUTA_HERENCIA, RUTA_PLANTILLA: RUTA_PLANTILLA, RUTA_HIJO: RUTA_HIJO, MATRIU: MATRIU, PECES: PECES, plantilla: plantilla, lee: lee, limpia: limpia, lector: lector, repos: repos, deRepo: deRepo };
});
