/* El cervell · l'explorador
 * ─────────────────────────────────────────────────────────────────────────────
 * La vista sencera d'un cervell per a una pàgina: les tres dimensions per
 * koshas, la castellera i les cinc capes, amb el mode temporal, el cercador, el
 * filtre per sabers, el zoom, la fitxa de cada veda, el tret, les forces i la
 * capa privada de GitHub. Va néixer a la pàgina del cervell d'Álvaro i viu aquí
 * perquè cada web filla l'hereti en lloc de copiar-la (veda 5): una millora
 * feta aquí arriba a totes. Els càlculs són a `forces.js`, el 3D a `3d.js`, les
 * franges a `pla.js` i les exportacions a `exporta.js`; aquí, la interacció.
 *
 * Pensat per al dit i per a la pantalla: en una pantalla ampla la fitxa va al
 * costat del grafe; en una d'estreta, a sota, i el grafe pla es dibuixa dret.
 *
 *   var x = CervellExplora.munta(caixa, D, op)
 *     D  = { nodos, aristas, capas, saberes?, fuentes? }  (el format de codex-parse.js)
 *     op = { lang: 'es' | 'ca',
 *            fuerzas: <element>          hi escriu la gravetat, el potencial, els enllaços quàntics i l'optimització
 *            privado: { entrar: url }    obre la capa privada (els codex dels teus repos privats, només en aquesta pestanya)
 *            alMontar: function (D, AN)  cada cop que canvien les vedes (en entrar o sortir de la capa privada) }
 *   x.lleva('md' | 'json' | 'html' | 'scorm', meta)  descarrega només el públic; torna una promesa amb el nom del fitxer
 *   x.selecciona(id) · x.dispara(id) · x.ver('3d' | 'castellera' | 'capas')
 */
(function (raiz) {
  var NS = 'http://www.w3.org/2000/svg', DIR = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');

  var T = {
    es: {
      v3d: 'Tres dimensiones', c3d: '3D', vcast: 'Castellera', vcapas: 'Cinco capas', ccapas: 'Capas', etVistas: 'Vista del cerebro',
      play: '▶ Cómo creció', pausa: '❚❚ Pausa', busca: 'Busca una veda por número o palabra', ninguna: 'Ninguna veda con eso.',
      mas: 'Acercar', menos: 'Alejar', todo: 'Todo', etZoom: 'Zoom del grafo', todos: 'Todos', etSab: 'Filtrar por saber',
      tria: 'Toca una veda para leerla y ver con cuáles conecta.', ley: 'Cómo leerlo', veda: 'Veda', privada: 'privada',
      fijada: '(fijada)', propuesta: '(propuesta)', soloTu: 'privada, solo la ves tú', ensena: 'Lo que enseña:',
      cita: 'Cita a', citan: 'La citan', ent: 'Entrelazadas', dispara: 'Disparar', cerrar: 'Cerrar',
      masa: 'Masa', pot: 'potencial', enc: function (v, c) { return 'enciende ' + v + ' vedas en ' + c + (c === 1 ? ' kosha' : ' koshas'); },
      tret: function (n, v, c, q) { return 'Disparo desde la veda ' + n + ': enciende ' + v + ' vedas en ' + c + ' koshas, ' + q + ' por enlace cuántico.'; },
      paso: function (n, t, c) { return 'Veda ' + n + ' · ' + t + ' · ' + c; },
      et3d: 'El cerebro en tres dimensiones: las cinco koshas como esferas, del cuerpo fuera al propósito en el centro. Gira arrastrando o con las flechas; usa el buscador para elegir una veda.',
      et2d: 'Grafo de las vedas por capa',
      L3d: 'Cada esfera es una kosha: el cuerpo fuera y el propósito en el centro. El tamaño de una veda es su masa. Las líneas grises son citas; las punteadas verdes, enlaces cuánticos. Arrastra para girar y acerca con los botones o con Ctrl y la rueda. Toca una veda y pulsa «Disparar» para ver qué enciende.',
      Lcast: 'Los tres pisos del castell: la pinya (cuerpo y energía) aguanta el tronc (mente y criterio), que sube el pom de dalt (propósito). De izquierda a derecha, el orden en que se escribió cada veda; las líneas son citas. Pulsa «Cómo creció» para verlo construirse.',
      Lcapas: 'De izquierda a derecha, el orden en que se escribió cada veda. Las líneas son citas entre vedas. Un borde oscuro es una capa ya fijada; el resto es propuesta. Un borde punteado es privado y solo lo ves tú. Acerca con los botones, arrastra para moverte y usa las flechas para pasar de una veda a la siguiente.',
      grav: 'Gravedad', gravP: 'Las vedas con más masa: las que más citan o más las citan. Sostienen el resto.', citas: ' citas',
      potT: 'Potencial', potP: 'Las que más cerebro encienden al dispararse. Toca una y pulsa «Disparar».',
      qT: 'Enlaces cuánticos', qP: function (n) { return n + ' pares de koshas distintas que no se citan y se activan juntas. Los más fuertes:'; },
      opt: 'Optimización', falten: 'Citas que faltan.', faltenP: 'Estas parejas se apoyan en las mismas vedas y aún no se citan: una cita entre ellas cerraría el circuito.',
      soltes: function (s, t, g) { return '<b>Vedas sueltas.</b> ' + s + ' de ' + t + ' no citan ni las citan. ' + g + ' de ellas ya tienen un enlace cuántico que dice con cuál conectarlas.'; },
      cast: function (p, t, d, ok) { return '<b>La castellera.</b> Pinya ' + p + ' · tronc ' + t + ' · pom de dalt ' + d + '. ' + (ok ? 'Aguanta: la pinya es más ancha que el tronco, como pide la regla de los castells.' : 'No aguanta: el tronco ha crecido más que la pinya. Toca bajar vedas a la obra y a la energía.'); },
      comp: 'comparten', y: ' y ', mateixa: 'citan la misma veda', mateixes: function (n) { return 'citan las mismas ' + n; },
      privIni: 'Capa privada: los codex de tus repos privados se leen en tu navegador con tu sesión de GitHub. Aquí no se publica nada de ellos.',
      entrar: 'Entrar con GitHub', salir: 'Salir', buscando: 'Buscando codex en tus repos privados…',
      privOk: function (v, r) { return 'Capa privada abierta: ' + v + ' vedas de ' + r + (r === 1 ? ' repo privado' : ' repos privados') + ', con borde punteado. Solo las ves tú, en esta pestaña.'; },
      privNo: function (ruta) { return 'Has entrado con GitHub, pero ninguno de tus repos privados tiene aún un codex en ' + ruta + '. Cuando lo tenga, aparecerá aquí.'; },
      caduca: 'Tu sesión de GitHub ha caducado. Vuelve a entrar para ver la capa privada.', ghNo: 'No se pudo leer GitHub ahora mismo. Vuelve a intentarlo en un rato.'
    },
    ca: {
      v3d: 'Tres dimensions', c3d: '3D', vcast: 'Castellera', vcapas: 'Cinc capes', ccapas: 'Capes', etVistas: 'Vista del cervell',
      play: '▶ Com va créixer', pausa: '❚❚ Pausa', busca: 'Cerca una veda per número o paraula', ninguna: 'Cap veda amb això.',
      mas: 'Apropa', menos: 'Allunya', todo: 'Tot', etZoom: 'Zoom del grafe', todos: 'Totes', etSab: 'Filtra per saber',
      tria: 'Toca una veda per llegir-la i veure amb quines connecta.', ley: 'Com es llegeix', veda: 'Veda', privada: 'privada',
      fijada: '(fixada)', propuesta: '(proposta)', soloTu: 'privada, només la veus tu', ensena: 'El que ensenya:',
      cita: 'Cita', citan: 'La citen', ent: 'Entrellaçades', dispara: 'Dispara', cerrar: 'Tanca',
      masa: 'Massa', pot: 'potencial', enc: function (v, c) { return 'encén ' + v + ' vedes en ' + c + (c === 1 ? ' kosha' : ' koshas'); },
      tret: function (n, v, c, q) { return 'Tret des de la veda ' + n + ': encén ' + v + ' vedes en ' + c + ' koshas, ' + q + ' per enllaç quàntic.'; },
      paso: function (n, t, c) { return 'Veda ' + n + ' · ' + t + ' · ' + c; },
      et3d: 'El cervell en tres dimensions: les cinc koshas com a esferes, del cos a fora al propòsit al centre. Gira arrossegant o amb les fletxes; fes servir el cercador per triar una veda.',
      et2d: 'Grafe de les vedes per capa',
      L3d: 'Cada esfera és una kosha: el cos a fora i el propòsit al centre. La mida d\'una veda és la seva massa. Les línies grises són cites; les puntejades verdes, enllaços quàntics. Arrossega per girar i apropa amb els botons o amb Ctrl i la roda. Toca una veda i prem «Dispara» per veure què encén.',
      Lcast: 'Els tres pisos del castell: la pinya (cos i energia) aguanta el tronc (ment i criteri), que puja el pom de dalt (propòsit). D\'esquerra a dreta, l\'ordre en què es va escriure cada veda; les línies són cites. Prem «Com va créixer» per veure\'l construir-se.',
      Lcapas: 'D\'esquerra a dreta, l\'ordre en què es va escriure cada veda. Les línies són cites entre vedes. Una vora fosca és una capa ja fixada; la resta és proposta. Una vora puntejada és privada i només la veus tu. Apropa amb els botons, arrossega per moure\'t i fes servir les fletxes per passar d\'una veda a la següent.',
      grav: 'Gravetat', gravP: 'Les vedes amb més massa: les que més citen o més les citen. Sostenen la resta.', citas: ' cites',
      potT: 'Potencial', potP: 'Les que més cervell encenen en disparar-se. Toca\'n una i prem «Dispara».',
      qT: 'Enllaços quàntics', qP: function (n) { return n + ' parelles de koshas diferents que no es citen i s\'activen juntes. Les més fortes:'; },
      opt: 'Optimització', falten: 'Cites que falten.', faltenP: 'Aquestes parelles s\'aguanten en les mateixes vedes i encara no es citen: una cita entre elles tancaria el circuit.',
      soltes: function (s, t, g) { return '<b>Vedes soltes.</b> ' + s + ' de ' + t + ' no citen ni les citen. ' + g + ' ja tenen un enllaç quàntic que diu amb quina connectar-les.'; },
      cast: function (p, t, d, ok) { return '<b>La castellera.</b> Pinya ' + p + ' · tronc ' + t + ' · pom de dalt ' + d + '. ' + (ok ? 'Aguanta: la pinya és més ampla que el tronc.' : 'No aguanta: el tronc ha crescut més que la pinya.'); },
      comp: 'comparteixen', y: ' i ', mateixa: 'citen la mateixa veda', mateixes: function (n) { return 'citen les mateixes ' + n; },
      privIni: 'Capa privada: els codex dels teus repos privats es llegeixen al teu navegador amb la teva sessió de GitHub. Aquí no se\'n publica res.',
      entrar: 'Entra amb GitHub', salir: 'Surt', buscando: 'Buscant codex als teus repos privats…',
      privOk: function (v, r) { return 'Capa privada oberta: ' + v + ' vedes de ' + r + (r === 1 ? ' repo privat' : ' repos privats') + ', amb vora puntejada. Només les veus tu, en aquesta pestanya.'; },
      privNo: function (ruta) { return 'Has entrat amb GitHub, però cap dels teus repos privats té encara un codex a ' + ruta + '. Quan en tingui, sortirà aquí.'; },
      caduca: 'La teva sessió de GitHub ha caducat. Torna a entrar per veure la capa privada.', ghNo: 'Ara mateix no s\'ha pogut llegir GitHub. Torna-ho a provar d\'aquí a una estona.'
    }
  };

  var CSS = [
    '.cx{--cx-s:var(--surface,#fff);--cx-l:var(--line,#e5e2da);--cx-i:var(--ink,#1c1a16);--cx-m:var(--muted,#5e594d);--cx-a:var(--accent,#1d4ed8);--cx-b:var(--bg,#faf9f6);--cx-r:var(--radius,14px)}',
    '.cx [hidden]{display:none!important}',
    '.cx-bar{display:flex;gap:8px;align-items:center;margin:0 0 10px}',
    '.cx-bar2{flex-wrap:wrap}',
    '.cx-tabs{display:flex;gap:4px;padding:4px;border:1px solid var(--cx-l);border-radius:999px;background:var(--cx-s);min-width:0;overflow-x:auto;scrollbar-width:none}',
    '.cx-lc{display:none}',
    '.cx-tabs::-webkit-scrollbar{display:none}',
    '.cx-tab{flex:0 0 auto;font:600 .9rem var(--sans,system-ui,sans-serif);padding:8px 16px;min-height:40px;border-radius:999px;border:0;background:transparent;color:var(--cx-i);cursor:pointer;white-space:nowrap}',
    '.cx-tab[aria-selected="true"]{background:var(--cx-i);color:var(--cx-s)}',
    '.cx-btn{font:600 .9rem var(--sans,system-ui,sans-serif);min-height:40px;min-width:40px;padding:8px 14px;border-radius:999px;border:1px solid var(--cx-l);background:var(--cx-s);color:var(--cx-i);cursor:pointer;white-space:nowrap}',
    '.cx-btn.on{background:var(--cx-a);border-color:var(--cx-a);color:#fff}',
    '@media (max-width:599px){.cx-tabs{flex:1 1 auto}.cx-tab{flex:1 1 0;padding:8px 10px}.cx-ll{display:none}.cx-lc{display:inline}.cx-play{font-size:0;padding:8px 0;width:44px}.cx-play::before{content:"\\25B6";font-size:.95rem}.cx-play.on::before{content:"\\275A\\275A";font-size:.8rem}}',
    '.cx button:focus-visible,.cx input:focus-visible,.cx canvas:focus-visible,.cx .cx-n:focus-visible circle{outline:2px solid var(--cx-a);outline-offset:2px}',
    '.cx-busca{position:relative;flex:1 1 220px;min-width:0}',
    '.cx-busca input{width:100%;font:500 1rem var(--sans,system-ui,sans-serif);min-height:40px;padding:8px 16px;border-radius:999px;border:1px solid var(--cx-l);background:var(--cx-s);color:var(--cx-i)}',
    '.cx-res{position:absolute;z-index:6;left:0;right:0;top:calc(100% + 4px);background:var(--cx-s);border:1px solid var(--cx-l);border-radius:12px;padding:6px;display:grid;gap:2px;max-height:min(320px,50vh);overflow:auto;box-shadow:0 8px 24px rgba(0,0,0,.14)}',
    '.cx-res button{text-align:left;font:500 .92rem var(--sans,system-ui,sans-serif);border:0;background:transparent;color:var(--cx-i);padding:9px 10px;border-radius:8px;cursor:pointer}',
    '.cx-res button:hover,.cx-res button:focus-visible{background:var(--cx-b)}',
    '.cx-res small,.cx-m{color:var(--cx-m)}',
    '.cx-zoom{display:flex;gap:4px}',
    '.cx-sab{display:flex;gap:6px;margin:0 0 10px;overflow-x:auto;scrollbar-width:thin;padding-bottom:2px}',
    '.cx-sab button{flex:0 0 auto;font:500 .82rem var(--sans,system-ui,sans-serif);min-height:34px;padding:4px 12px;border-radius:999px;border:1px solid var(--cx-l);background:var(--cx-b);color:var(--cx-i);cursor:pointer;white-space:nowrap}',
    '.cx-sab button[aria-pressed="true"]{background:var(--cx-a);border-color:var(--cx-a);color:#fff}',
    '.cx-ctl{display:flex;align-items:center;gap:12px;margin:0 0 8px}',
    '.cx-ctl input{flex:1;min-width:0;accent-color:var(--cx-a);min-height:32px}',
    '.cx-ctl output{font:500 .85rem ui-monospace,monospace;color:var(--cx-m);min-width:8ch;text-align:right}',
    '.cx-now{font:500 .95rem var(--sans,system-ui,sans-serif);margin:0 0 8px}.cx-now:empty{display:none}',
    '.cx-main{display:grid;gap:12px;grid-template-columns:minmax(0,1fr);grid-template-areas:"g" "tools" "panel"}',
    '.cx-g{grid-area:g}.cx-tools{grid-area:tools;min-width:0}.cx-panel{grid-area:panel}',
    '.cx-tools .cx-bar2,.cx-tools .cx-sab{margin:0}.cx-tools .cx-sab{margin-top:8px}',
    '@media (min-width:900px){.cx-main{grid-template-columns:minmax(0,1fr) 340px;grid-template-areas:"tools tools" "g panel";align-items:start}.cx-panel{position:sticky;top:12px;max-height:calc(100vh - 24px);overflow:auto}}',
    '.cx-g{background:var(--cx-s);border:1px solid var(--cx-l);border-radius:var(--cx-r);position:relative;overflow:hidden;min-width:0}',
    '.cx-g canvas{display:block;width:100%;height:min(70vh,620px);min-height:320px;cursor:grab;touch-action:pan-y}',
    '@media (max-width:599px){.cx-g canvas{height:min(92vw,62vh);min-height:300px}}',
    '.cx-k3{position:absolute;left:12px;bottom:10px;right:12px;display:flex;flex-wrap:wrap;gap:4px 12px;font:500 .74rem ui-monospace,monospace;color:var(--cx-m);pointer-events:none}',
    '.cx-k3 i{display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--c);margin-right:5px;vertical-align:-1px}',
    '.cx-g svg{display:block;width:100%;height:auto;touch-action:pan-y}',
    '.cx-g svg.pan{cursor:grab;touch-action:none}.cx-g svg.pan:active{cursor:grabbing}',
    '.cx-g svg text{font-family:var(--sans,system-ui,sans-serif)}',
    '.cx-band{opacity:.07}.cx-lane{font-weight:600}.cx-lane-s{fill:var(--cx-m);letter-spacing:.06em;font-family:ui-monospace,monospace!important}',
    '.cx-e{fill:none;stroke:var(--cx-m);stroke-opacity:.25;stroke-width:1}.cx-e.on{stroke:var(--cx-a);stroke-opacity:.9;stroke-width:1.8}.cx-e.hid{opacity:0}',
    '.cx-n{cursor:pointer;transition:opacity .3s}.cx-n:focus{outline:none}',
    '.cx-n circle{stroke:var(--cx-s);stroke-width:1.5}.cx-n.fix circle{stroke:var(--cx-i);stroke-width:2}.cx-n.priv circle{stroke:var(--cx-i);stroke-dasharray:2 2}',
    '.cx-n.sel circle{stroke:var(--cx-i);stroke-width:3}.cx-n.dim{opacity:.18}.cx-n.hid{opacity:0;pointer-events:none}',
    '.cx-lbl{font-weight:600;fill:var(--cx-i);paint-order:stroke;stroke:var(--cx-s);stroke-width:3px;stroke-linejoin:round;pointer-events:none}',
    '.cx-panel{background:var(--cx-s);border:1px solid var(--cx-l);border-left:4px solid var(--c,var(--cx-l));border-radius:var(--cx-r);padding:16px 18px;min-height:90px;min-width:0;overflow-wrap:anywhere}',
    '.cx-panel .cx-m{font:500 .78rem ui-monospace,monospace;letter-spacing:.03em}',
    '.cx-panel h3{margin:.3rem 0 .5rem;font-size:1.15rem;line-height:1.25}',
    '.cx-panel p{font-size:.95rem;margin:0 0 .5rem}',
    '.cx-panel .cx-cab{display:flex;justify-content:space-between;gap:8px;align-items:start}',
    '.cx-x{border:0;background:transparent;color:var(--cx-m);font-size:1.3rem;line-height:1;min-width:36px;min-height:36px;border-radius:50%;cursor:pointer}',
    '.cx-aprende{padding:10px 14px;background:var(--cx-b);border-radius:10px}',
    '.cx-tag{display:inline-block;font:500 .74rem ui-monospace,monospace;padding:2px 8px;margin:4px 4px 0 0;border-radius:999px;border:1px solid var(--cx-l);color:var(--cx-m)}',
    '.cx-go{font:500 .84rem var(--sans,system-ui,sans-serif);text-align:left;border:1px solid var(--cx-l);background:var(--cx-b);color:var(--cx-i);border-radius:999px;padding:5px 12px;margin:4px 4px 0 0;cursor:pointer;max-width:100%}',
    '.cx-go:hover{border-color:var(--cx-a)}',
    '.cx-dispara{font:600 .9rem var(--sans,system-ui,sans-serif);border:1px solid var(--cx-i);background:var(--cx-i);color:var(--cx-s);border-radius:999px;min-height:40px;padding:8px 18px;margin:12px 6px 0 0;cursor:pointer}',
    '.cx-ley{margin:10px 0 0;font-size:.88rem;color:var(--cx-m)}.cx-ley summary{cursor:pointer;font-weight:600;min-height:32px;display:flex;align-items:center}',
    '.cx-priv{background:var(--cx-s);border:1px dashed var(--cx-l);border-radius:var(--cx-r);padding:12px 16px;margin:14px 0 0;display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:space-between}',
    '.cx-priv p{font-size:.9rem;color:var(--cx-m);flex:1 1 260px;min-width:0;margin:0}',
    '.cx-priv button{font:600 .9rem var(--sans,system-ui,sans-serif);min-height:40px;padding:8px 18px;border-radius:999px;border:1px solid var(--cx-i);background:var(--cx-i);color:var(--cx-s);cursor:pointer}',
    '.cx-priv button.sec{background:transparent;color:var(--cx-i);border-color:var(--cx-l)}',
    '.cx-fz{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:14px}',
    '.cx-fz article{background:var(--cx-s);border:1px solid var(--cx-l);border-top:4px solid var(--c);border-radius:10px;padding:14px 18px;min-width:0}',
    '.cx-fz h3{font-size:1.05rem;margin:0 0 4px}.cx-fz p{font-size:.92rem;color:var(--cx-m);margin:0 0 6px}',
    '.cx-fz ol{padding-left:1.2rem;font-size:.9rem;margin:0}.cx-fz li{margin:.35rem 0}'
  ].join('\n');

  function el(t, at, p) { var e = document.createElementNS(NS, t); for (var k in at) e.setAttribute(k, at[k]); if (p) p.appendChild(e); return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function col(id) { return 'var(--k-' + id + ')'; }
  function llano(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  function munta(caixa, PUB, op) {
    op = op || {};
    var t = T[(op.lang || 'ca').slice(0, 2)] || T.ca, FZ = raiz.CerebroFuerzas, PL = raiz.CervellPla, CP = raiz.CodexParse;
    if (!document.getElementById('cx-css')) { var st = document.createElement('style'); st.id = 'cx-css'; st.textContent = CSS; document.head.appendChild(st); }
    PUB.saberes = PUB.saberes || {}; PUB.fuentes = PUB.fuentes || [];
    PUB.nodos.forEach(function (n) { n.saberes = n.saberes || []; });
    var capaDe = {}; PUB.capas.forEach(function (c) { capaDe[c.id] = c; });

    caixa.classList.add('cx');
    caixa.innerHTML =
      '<div class="cx-bar"><div class="cx-tabs" role="tablist" aria-label="' + esc(t.etVistas) + '">' +
        [['3d', t.v3d, t.c3d], ['castellera', t.vcast, t.vcast], ['capas', t.vcapas, t.ccapas]].map(function (v, i) { return '<button type="button" class="cx-tab" role="tab" data-v="' + v[0] + '" aria-selected="' + (i ? 'false' : 'true') + '"><span class="cx-ll">' + esc(v[1]) + '</span><span class="cx-lc" aria-hidden="true">' + esc(v[2]) + '</span></button>'; }).join('') +
      '</div><button type="button" class="cx-btn cx-play" data-cx="play" aria-label="' + esc(t.play.replace(/^\S+\s/, '')) + '">' + esc(t.play) + '</button></div>' +
      '<div class="cx-ctl" hidden><input type="range" min="1" value="1" aria-label="' + esc(t.play) + '"><output></output></div>' +
      '<p class="cx-now" aria-live="polite"></p>' +
      '<div class="cx-main"><div class="cx-tools">' +
      '<div class="cx-bar cx-bar2"><div class="cx-busca"><input type="search" placeholder="' + esc(t.busca) + '" aria-label="' + esc(t.busca) + '" autocomplete="off"><div class="cx-res" hidden></div></div>' +
        '<div class="cx-zoom" role="group" aria-label="' + esc(t.etZoom) + '"><button type="button" class="cx-btn" data-cx="mas" aria-label="' + esc(t.mas) + '">+</button><button type="button" class="cx-btn" data-cx="menos" aria-label="' + esc(t.menos) + '">−</button><button type="button" class="cx-btn" data-cx="todo">' + esc(t.todo) + '</button></div></div>' +
      '<div class="cx-sab" role="group" aria-label="' + esc(t.etSab) + '"></div></div>' +
      '<div class="cx-g cx-g3"><canvas tabindex="0" role="img" aria-label="' + esc(t.et3d) + '"></canvas><div class="cx-k3" aria-hidden="true"></div></div>' +
        '<div class="cx-g cx-g2" hidden><svg role="group" aria-label="' + esc(t.et2d) + '"><g></g><g></g><g></g><g></g></svg></div>' +
        '<aside class="cx-panel" aria-live="polite"></aside></div>' +
      '<details class="cx-ley"><summary>' + esc(t.ley) + '</summary><p></p></details>' +
      (op.privado ? '<div class="cx-priv"><p></p><span></span></div>' : '');
    var $ = function (s) { return caixa.querySelector(s); };
    var svg = $('svg'), gs = svg.querySelectorAll('g'), gB = gs[0], gE = gs[1], gN = gs[2], gL = gs[3];
    var panel = $('.cx-panel'), now = $('.cx-now'), g3 = $('.cx-g3'), g2 = $('.cx-g2'), ley = $('.cx-ley p');
    var rng = $('.cx-ctl input'), tv = $('.cx-ctl output'), ctl = $('.cx-ctl'), play = $('[data-cx="play"]');
    var q = $('.cx-busca input'), res = $('.cx-res'), sabs = $('.cx-sab');
    $('.cx-k3').innerHTML = PUB.capas.map(function (c) { return '<span style="--c:' + col(c.id) + '"><i></i>' + esc(c.s) + '</span>'; }).join('');

    var D, AN, byId, vec, cita, citada, pos = {}, nEls = {}, eEls = [], sel = null, sab = null, vista = '3d', timer = null;
    var W = 1000, H = 560, top = 24, estret = false;
    var C3 = raiz.Cerebro3D($('canvas'), { alElegir: function (id) { if (id) selecciona(id, true); else suelta(); } });

    /* Les vedes que es veuen: les públiques, i les privades que llegeixi el navegador. */
    function monta(priv) {
      priv = priv || { nodos: [] , aristas: [] };
      D = { nodos: PUB.nodos.slice(), aristas: PUB.aristas.slice(), capas: PUB.capas };
      if (priv.nodos.length) {
        D.nodos = D.nodos.concat(priv.nodos.map(function (n) { n.privado = true; n.saberes = n.saberes || []; return n; })).sort(function (a, b) {
          return (a.fecha || '9') < (b.fecha || '9') ? -1 : (a.fecha || '9') > (b.fecha || '9') ? 1 : (a.privado ? 1 : 0) - (b.privado ? 1 : 0) || a.n - b.n; });
        D.aristas = D.aristas.concat(priv.aristas);
      }
      byId = {}; vec = {}; cita = {}; citada = {};
      D.nodos.forEach(function (n, i) { n.i = i; byId[n.id] = n; vec[n.id] = {}; });
      D.aristas.forEach(function (a) { vec[a[0]][a[1]] = vec[a[1]][a[0]] = 1; (cita[a[0]] = cita[a[0]] || []).push(a[1]); (citada[a[1]] = citada[a[1]] || []).push(a[0]); });
      var ks = Object.keys(PUB.saberes);
      sabs.hidden = !ks.length; sab = null;
      sabs.innerHTML = '<button type="button" data-s="" aria-pressed="true">' + esc(t.todos) + '</button>' + ks.map(function (k) {
        var c = D.nodos.filter(function (n) { return n.saberes.indexOf(k) >= 0; }).length;
        return '<button type="button" data-s="' + esc(k) + '" aria-pressed="false">' + esc(PUB.saberes[k]) + ' · ' + c + '</button>';
      }).join('');
      AN = FZ.analiza(D);
      C3.monta(D, AN);
      if (op.fuerzas) fuerzas();
      dibuja();
      rng.max = D.nodos.length; rng.value = D.nodos.length; hasta(D.nodos.length, true);
      if (sel && byId[sel]) selecciona(sel, true); else suelta();
      if (op.alMontar) op.alMontar(D, AN);
    }

    /* El grafe pla: les franges i on va cada veda són de pla.js; en una pantalla estreta es dibuixa dret. */
    var esc1 = 1;
    function mides() {
      var w = g2.clientWidth || caixa.clientWidth || 1000;
      estret = w < 600; W = estret ? 600 : 1000; H = estret ? 760 : Math.round(1000 * Math.min(.9, Math.max(.56, 560 / w))); esc1 = W / w;
    }
    function dibuja() {
      mides();
      var bs = PL.franges({ capas: PUB.capas }, vista === 'castellera' ? 'castellera' : 'capes'), alto = (H - top - 16) / bs.length;
      var fs = 13 * esc1, x0 = estret ? 16 * esc1 : Math.min(W * .3, 130 * esc1);
      pos = PL.geometria(D, bs, { dalt: top, alt: alto, x0: x0, x1: W - 20 });
      gB.innerHTML = gE.innerHTML = gN.innerHTML = gL.innerHTML = '';
      bs.forEach(function (b, i) {
        var sub = alto / b.capas.length;
        b.capas.forEach(function (k, j) { el('rect', { x: -W, y: top + alto * i + sub * j, width: W * 3, height: sub, fill: col(k), 'class': 'cx-band' }, gB); });
        if (b.pis && i) el('line', { x1: 0, x2: W, y1: top + alto * i, y2: top + alto * i, stroke: 'var(--cx-l)', 'stroke-width': 1.5 }, gB);
        /* El nom de la franja: al costat en pantalla ampla; a dalt en l'estreta, perquè les vedes tinguin tota l'amplada. */
        var ly = estret ? top + alto * i + fs * 1.3 : top + alto * i + alto / 2 - 2, lx = estret ? 8 * esc1 : 10;
        var a = el('text', { x: lx, y: ly, fill: b.pis ? 'var(--cx-i)' : col(b.capas[0]), 'class': 'cx-lane', 'font-size': fs }, gB); a.textContent = b.n;
        var s = el('text', { x: estret ? lx + a.getComputedTextLength() + 8 * esc1 : lx, y: estret ? ly : ly + fs + 1, 'class': 'cx-lane-s', 'font-size': fs * .78 }, gB); s.textContent = String(b.s).toUpperCase();
      });
      eEls = D.aristas.map(function (a) { return { a: a, el: el('path', { d: PL.corba(pos[a[0]], pos[a[1]]), 'class': 'cx-e' }, gE) }; });
      nEls = {};
      D.nodos.forEach(function (n) {
        var g = el('g', { 'class': 'cx-n' + (n.fijada ? ' fix' : '') + (n.privado ? ' priv' : ''), tabindex: 0, role: 'button', 'aria-label': t.veda + ' ' + n.n + ': ' + n.t + (n.privado ? ' (' + t.privada + ')' : '') }, gN);
        var deg = Object.keys(vec[n.id]).length;
        el('circle', { cx: pos[n.id].x, cy: pos[n.id].y, r: (3 + Math.min(deg, 6) * .8) * Math.max(1, esc1 * .85), fill: col(n.capa) }, g);
        g.addEventListener('click', function () { if (!movido) selecciona(n.id); });
        g.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selecciona(n.id); }
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var m = D.nodos[n.i + (e.key === 'ArrowRight' ? 1 : -1)]; if (m) { selecciona(m.id); nEls[m.id].focus(); } }
        });
        nEls[n.id] = g;
      });
      vb = { x: 0, y: 0, w: W, h: H }; aplica();
      if (sab) filtra();
    }

    /* Les forces: el que diu l'anàlisi, amb cada veda a un toc. */
    function chip(id, extra) { var n = byId[id]; return '<button type="button" class="cx-go" data-id="' + esc(id) + '">' + n.n + ' · ' + esc(n.t) + (extra ? ' <small class="cx-m">· ' + esc(extra) + '</small>' : '') + '</button>'; }
    function chips(ids, txt) { return ids && ids.length ? '<p class="cx-m" style="margin-top:10px">' + txt + '</p>' + ids.map(function (k) { return chip(k); }).join('') : ''; }
    function porque(e) {
      var s = e.saberes.map(function (k) { return PUB.saberes[k] || k; }).join(t.y);
      return (s ? t.comp + ' ' + s : '') + (s && e.vecinos.length ? '; ' : '') + (e.vecinos.length ? (e.vecinos.length === 1 ? t.mateixa : t.mateixes(e.vecinos.length)) : '');
    }
    function fuerzas() {
      var conQ = {}; AN.cuanticos.forEach(function (e) { conQ[e.a] = conQ[e.b] = 1; });
      var cs = AN.castellera;
      op.fuerzas.classList.add('cx', 'cx-fz');
      op.fuerzas.innerHTML =
        '<article style="--c:var(--vishnu-luz,#2563eb)"><h3>' + t.grav + '</h3><p>' + t.gravP + '</p><ol>' + AN.gravedad.map(function (n) { return '<li>' + chip(n.id, AN.masa[n.id] + t.citas) + '</li>'; }).join('') + '</ol></article>' +
        '<article style="--c:var(--brahma-luz,#eab308)"><h3>' + t.potT + '</h3><p>' + t.potP + '</p><ol>' + AN.potentes.map(function (n) { var a = AN.alcance[n.id]; return '<li>' + chip(n.id, t.enc(a.vedas, a.capas)) + '</li>'; }).join('') + '</ol></article>' +
        '<article style="--c:var(--shiva-luz,#16a34a)"><h3>' + t.qT + '</h3><p>' + t.qP(AN.cuanticos.length) + '</p><ol>' + AN.cuanticos.slice(0, 6).map(function (e) { return '<li>' + chip(e.a) + ' ↔ ' + chip(e.b, porque(e)) + '</li>'; }).join('') + '</ol></article>' +
        '<article style="--c:var(--cx-i)"><h3>' + t.opt + '</h3><p><b>' + t.falten + '</b> ' + t.faltenP + '</p><ol>' + AN.faltan.slice(0, 5).map(function (e) { return '<li>' + chip(e.a) + ' ↔ ' + chip(e.b) + '</li>'; }).join('') + '</ol>' +
          '<p style="margin-top:10px">' + t.soltes(AN.sueltas.length, D.nodos.length, AN.sueltas.filter(function (n) { return conQ[n.id]; }).length) + '</p>' +
          '<p style="margin-top:10px">' + t.cast(cs[2].vedas, cs[1].vedas, cs[0].vedas, AN.aguanta) + '</p></article>';
    }

    function suelta() {
      sel = null; C3.selecciona(null); gL.innerHTML = '';
      Object.keys(nEls).forEach(function (k) { nEls[k].classList.remove('sel'); if (!sab) nEls[k].classList.remove('dim'); });
      eEls.forEach(function (e) { e.el.classList.remove('on'); });
      panel.style.removeProperty('--c'); panel.innerHTML = '<p class="cx-m">' + esc(t.tria) + '</p>';
    }
    function dispara(id) {
      if (vista !== '3d') ver('3d');
      var luz = C3.dispara(id); if (!luz) return;
      var ks = Object.keys(luz).filter(function (k) { return k !== id; }), c = {};
      ks.forEach(function (k) { c[byId[k].capa] = 1; });
      now.textContent = t.tret(byId[id].n, ks.length, Object.keys(c).length, ks.filter(function (k) { return luz[k].via === 'cuantico'; }).length);
    }
    function etiqueta(id) {
      gL.innerHTML = ''; if (!id || !pos[id]) return;
      var p = pos[id], n = byId[id], der = p.x > vb.x + vb.w * .62, fs = 12 * esc1 * vb.w / W;
      var tx = el('text', { x: der ? p.x - fs : p.x + fs, y: p.y - fs * .8, 'class': 'cx-lbl', 'text-anchor': der ? 'end' : 'start', 'font-size': fs }, gL);
      tx.textContent = n.n + ' · ' + n.t;
    }
    function ancla(n) { var f = PUB.fuentes.indexOf(n.fuente); return 'veda-' + (f > 0 ? f + '-' : '') + n.n; }
    function selecciona(id, quieto) {
      if (!byId[id]) return;
      sel = id; var n = byId[id], c = capaDe[n.capa] || { n: n.capa }; C3.selecciona(id);
      Object.keys(nEls).forEach(function (k) { nEls[k].classList.toggle('sel', k === id); nEls[k].classList.toggle('dim', k !== id && !vec[id][k]); });
      eEls.forEach(function (e) { e.el.classList.toggle('on', e.a[0] === id || e.a[1] === id); });
      if (!quieto) centra(id);
      etiqueta(id);
      var ent = AN.cuanticos.filter(function (e) { return e.a === id || e.b === id; }).map(function (e) { return e.a === id ? e.b : e.a; });
      panel.style.setProperty('--c', col(n.capa));
      panel.innerHTML = '<div class="cx-cab"><p class="cx-m">' + t.veda + ' ' + n.n + (n.fuente ? ' · ' + esc(n.fuente) : '') + (n.fecha ? ' · ' + esc(n.fecha) : '') + ' · ' + esc(c.n) +
          (n.fijada != null ? ' ' + (n.fijada ? t.fijada : t.propuesta) : '') + (n.tema ? ' · ' + esc(n.tema) : '') + (n.privado ? ' · ' + t.soloTu : '') + '</p>' +
          '<button type="button" class="cx-x" data-cx="cierra" aria-label="' + esc(t.cerrar) + '">×</button></div>' +
        '<h3>' + esc(n.t) + '</h3>' + (n.aprende ? '<p class="cx-aprende"><b>' + t.ensena + '</b> ' + esc(n.aprende) + '</p>' : '') +
        (n.txt ? '<p style="margin-top:10px">' + esc(n.txt) + '</p>' : '') +
        (n.saberes.length ? '<p>' + n.saberes.map(function (k) { return '<span class="cx-tag">' + esc(PUB.saberes[k] || k) + '</span>'; }).join('') + '</p>' : '') +
        chips(cita[id], t.cita) + chips(citada[id], t.citan) + chips(ent, t.ent) +
        '<p class="cx-m" style="margin-top:10px">' + t.masa + ' ' + AN.masa[id] + ' · ' + t.pot + ' ' + AN.potencial[id] + ' · ' + t.enc(AN.alcance[id].vedas, AN.alcance[id].capas) + '</p>' +
        '<button type="button" class="cx-dispara" data-dispara="' + esc(id) + '">' + t.dispara + '</button>';
      /* Només les vedes públiques tenen enllaç: el nom d'un repo privat no va a la barra d'adreces. */
      try { history.replaceState(null, '', n.privado ? location.pathname + '#privado' : '#' + ancla(n)); } catch (e) {}
    }

    /* Zoom i desplaçament: es mou la finestra (viewBox) sobre el grafe. */
    var vb = { x: 0, y: 0, w: W, h: H }, movido = false, arrastre = null;
    function aplica() {
      vb.w = Math.min(W, Math.max(W / 8, vb.w)); vb.h = vb.w * H / W;
      vb.x = Math.min(W - vb.w, Math.max(0, vb.x)); vb.y = Math.min(H - vb.h, Math.max(0, vb.y));
      svg.setAttribute('viewBox', vb.x + ' ' + vb.y + ' ' + vb.w + ' ' + vb.h);
      svg.classList.toggle('pan', vb.w < W);
    }
    function zoom(f, cx, cy) {
      if (cx == null) { cx = vb.x + vb.w / 2; cy = vb.y + vb.h / 2; }
      var w = Math.min(W, Math.max(W / 8, vb.w * f)), h = w * H / W;
      vb.x = cx - (cx - vb.x) * w / vb.w; vb.y = cy - (cy - vb.y) * h / vb.h; vb.w = w; vb.h = h; aplica();
      if (sel) etiqueta(sel);
    }
    function centra(id) { var p = pos[id]; if (p && vb.w < W) { vb.x = p.x - vb.w / 2; vb.y = p.y - vb.h / 2; aplica(); } }
    function punto(e) { var r = svg.getBoundingClientRect(); return { x: vb.x + (e.clientX - r.left) / r.width * vb.w, y: vb.y + (e.clientY - r.top) / r.height * vb.h }; }
    svg.addEventListener('wheel', function (e) { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); var p = punto(e); zoom(e.deltaY > 0 ? 1.15 : 1 / 1.15, p.x, p.y); }, { passive: false });
    svg.addEventListener('pointerdown', function (e) { if (vb.w >= W) return; arrastre = { x: e.clientX, y: e.clientY, vx: vb.x, vy: vb.y }; movido = false; });
    raiz.addEventListener('pointermove', function (e) {
      if (!arrastre) return; var r = svg.getBoundingClientRect(), dx = e.clientX - arrastre.x, dy = e.clientY - arrastre.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) movido = true;
      vb.x = arrastre.vx - dx / r.width * vb.w; vb.y = arrastre.vy - dy / r.height * vb.h; aplica();
    });
    raiz.addEventListener('pointerup', function () { arrastre = null; setTimeout(function () { movido = false; }, 0); });

    /* Cercar: pel número de la veda o per paraules del títol, del que ensenya i del text. */
    function busca() {
      var v = llano(q.value.trim()); if (!v) { res.hidden = true; return; }
      var num = /^\d+$/.test(v) ? +v : null, ps = v.split(/\s+/);
      var hits = D.nodos.filter(function (n) {
        if (num != null) return n.n === num;
        var s = llano(n.t + ' ' + (n.aprende || '') + ' ' + (n.txt || ''));
        return ps.every(function (p) { return s.indexOf(p) >= 0; });
      }).sort(function (a, b) { return (llano(b.t).indexOf(ps[0]) >= 0) - (llano(a.t).indexOf(ps[0]) >= 0); }).slice(0, 8);
      res.innerHTML = hits.length ? hits.map(function (n) { return '<button type="button" data-id="' + esc(n.id) + '">' + n.n + ' · ' + esc(n.t) + ' <small>· ' + esc((capaDe[n.capa] || {}).n) + (n.privado ? ' · ' + t.privada : '') + '</small></button>'; }).join('') : '<p class="cx-m" style="padding:6px 10px;margin:0">' + esc(t.ninguna) + '</p>';
      res.hidden = false;
    }
    q.addEventListener('input', busca);
    q.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { var b = res.querySelector('button'); if (b) { e.preventDefault(); b.click(); } }
      if (e.key === 'Escape') { q.value = ''; res.hidden = true; }
      if (e.key === 'ArrowDown') { var f = res.querySelector('button'); if (f) { e.preventDefault(); f.focus(); } }
    });
    res.addEventListener('keydown', function (e) {
      var bs = Array.prototype.slice.call(res.querySelectorAll('button')), i = bs.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' && bs[i + 1]) { e.preventDefault(); bs[i + 1].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); (bs[i - 1] || q).focus(); }
    });

    function filtra() {
      D.nodos.forEach(function (n) { nEls[n.id].classList.toggle('dim', !!sab && n.saberes.indexOf(sab) < 0); nEls[n.id].classList.remove('sel'); });
      eEls.forEach(function (x) { x.el.classList.remove('on'); }); gL.innerHTML = '';
    }
    function aLaVista(b) {
      /* Si la veda s'ha triat des de fora del grafe (una fitxa, una llista), es porta el grafe a la vista. */
      var g = vista === '3d' ? g3 : g2, r = g.getBoundingClientRect();
      if (r.bottom < 0 || r.top > (raiz.innerHeight || 800)) g.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    function clic(e) {
      if (!e.target.closest('.cx-busca')) res.hidden = true;
      var f = e.target.closest('.cx-sab [data-s]');
      if (f) { sab = f.getAttribute('data-s') || null; sabs.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === f ? 'true' : 'false'); }); filtra(); return; }
      var dp = e.target.closest('[data-dispara]'); if (dp) { dispara(dp.getAttribute('data-dispara')); return; }
      var cx = e.target.closest('[data-cx]');
      if (cx) {
        var k = cx.getAttribute('data-cx');
        if (k === 'cierra') { suelta(); try { history.replaceState(null, '', location.pathname); } catch (x) {} }
        if (k === 'play') { if (timer) para(); else creix(); }
        if (k === 'mas') { if (vista === '3d') C3.zoom(1 / 1.25); else zoom(1 / 1.6, sel ? pos[sel].x : null, sel ? pos[sel].y : null); }
        if (k === 'menos') { if (vista === '3d') C3.zoom(1.25); else zoom(1.6); }
        if (k === 'todo') { if (vista === '3d') C3.centra(); else { vb = { x: 0, y: 0, w: W, h: H }; aplica(); if (sel) etiqueta(sel); } }
        return;
      }
      var tb = e.target.closest('.cx-tab'); if (tb) { ver(tb.getAttribute('data-v')); return; }
      var b = e.target.closest('[data-id]'); if (!b) return;
      e.preventDefault(); selecciona(b.getAttribute('data-id'));
      if (b.closest('.cx-res')) { res.hidden = true; q.blur(); }
      if (!b.closest('.cx-panel')) aLaVista(b);
    }
    caixa.addEventListener('click', clic);
    if (op.fuerzas) op.fuerzas.addEventListener('click', clic);

    /* El mode temporal: el cervell creix veda a veda, amb les seves cites. */
    function hasta(k, quiet) {
      k = +k; tv.textContent = k + ' / ' + D.nodos.length;
      D.nodos.forEach(function (n) { nEls[n.id].classList.toggle('hid', n.i >= k); });
      eEls.forEach(function (e) { e.el.classList.toggle('hid', byId[e.a[0]].i >= k || byId[e.a[1]].i >= k); });
      var u = D.nodos[k - 1]; if (u && !quiet) { now.textContent = t.paso(u.n, u.t, (capaDe[u.capa] || {}).n); etiqueta(u.id); }
    }
    rng.addEventListener('input', function () { if (timer) para(); hasta(rng.value); });
    function para() { clearInterval(timer); timer = null; play.textContent = t.play; play.setAttribute('aria-label', t.play.replace(/^\S+\s/, '')); play.classList.remove('on'); }
    function creix() {
      if (vista === '3d') ver('castellera');
      ctl.hidden = false; suelta();
      if (+rng.value >= D.nodos.length) rng.value = 1;
      play.textContent = t.pausa; play.setAttribute('aria-label', t.pausa.replace(/^\S+\s/, '')); play.classList.add('on'); hasta(rng.value);
      var pas = Math.max(40, Math.min(160, 9000 / D.nodos.length));
      timer = setInterval(function () { if (+rng.value >= D.nodos.length) return para(); rng.value = +rng.value + 1; hasta(rng.value); }, pas);
    }
    var LEY = { '3d': t.L3d, castellera: t.Lcast, capas: t.Lcapas };
    function ver(v) {
      vista = v;
      caixa.querySelectorAll('.cx-tab').forEach(function (x) { x.setAttribute('aria-selected', x.getAttribute('data-v') === v ? 'true' : 'false'); });
      var tres = v === '3d';
      g3.hidden = !tres; g2.hidden = tres; C3.activa(tres); ley.textContent = LEY[v];
      para(); ctl.hidden = true; now.textContent = '';
      if (!tres) { dibuja(); hasta(D.nodos.length, true); }
      if (sel) selecciona(sel, true);
    }
    var ample = null;
    raiz.addEventListener('resize', function () {
      if (vista === '3d') return;
      var ara = g2.clientWidth < 600; if (ara === ample) return; ample = ara;
      var k = rng.value; dibuja(); hasta(ctl.hidden ? D.nodos.length : k, true); if (sel) selecciona(sel, true);
    });

    /* La capa privada. Amb la teva sessió de GitHub, el navegador busca un codex a cada repo
       privat al qual tens accés i el dibuixa aquí. Res no es desa ni es publica: el testimoni
       viu en aquesta pestanya (sessionStorage) i s'esborra en tancar-la o en sortir. */
    if (op.privado) {
      var ptxt = $('.cx-priv p'), pbtn = $('.cx-priv span');
      var token = function () { try { return sessionStorage.getItem('gh_token'); } catch (e) { return null; } };
      var sinSesion = function (msg) {
        ptxt.textContent = msg || t.privIni;
        pbtn.innerHTML = '<button type="button">' + esc(t.entrar) + '</button>';
        pbtn.firstChild.onclick = function () { location.href = op.privado.entrar; };
      };
      var cargaPrivado = function () {
        if (!token() || !CP) return sinSesion();
        ptxt.textContent = t.buscando; pbtn.innerHTML = '';
        /* La lectura és la de codex-parse.js: el manifest cervell.json de cada repo, la mateixa per a tothom. */
        CP.repos(token()).then(function (rs) {
          return Promise.all(rs.filter(function (r) { return r.privat; }).map(function (r) {
            var nom = r.repo.split('/')[1];
            return CP.deRepo(r.repo, { token: token() }).then(function (f) {
              return f ? CP.lee(f.codex, { nom: nom, herencia: f.herencia, matriz: f.fill ? PUB.fuentes[0] : null, plantilla: f.plantilla }) : null;
            }).catch(function (e) { if (e && e.sesion) throw e; return null; });
          }));
        }).then(function (ls) {
          var nodos = [], aristas = [], fuentes = [];
          ls.forEach(function (l) { if (l && l.nodos.length) { nodos = nodos.concat(l.nodos); aristas = aristas.concat(l.aristas); fuentes.push(l.nodos[0].fuente); } });
          monta({ nodos: nodos, aristas: CP.limpia(nodos, aristas, PUB.nodos.map(function (n) { return n.id; })) });
          ptxt.textContent = nodos.length ? t.privOk(nodos.length, fuentes.length) : t.privNo(CP.RUTA_CODEX);
          pbtn.innerHTML = '<button type="button" class="sec">' + esc(t.salir) + '</button>';
          pbtn.firstChild.onclick = function () { try { sessionStorage.removeItem('gh_token'); } catch (e) {} monta(); sinSesion(); };
        }).catch(function (e) {
          if (e && e.sesion) { try { sessionStorage.removeItem('gh_token'); } catch (x) {} return sinSesion(t.caduca); }
          sinSesion(t.ghNo);
        });
      };
    }

    /* Endur-se'l: només el públic, amb l'exportador comú. */
    function lleva(k, meta) {
      var CX = raiz.CervellExporta;
      if (!CX) return Promise.reject(new Error('exporta'));
      var pub = D.nodos.filter(function (n) { return !n.privado; }), ids = {}; pub.forEach(function (n) { ids[n.id] = 1; });
      var P = { nodos: pub, aristas: D.aristas.filter(function (a) { return ids[a[0]] && ids[a[1]]; }), capas: PUB.capas }, A = FZ.analiza(P), id = meta.id || 'cervell';
      var desa = function (nom, cos, tipo) {
        var bl = cos instanceof Blob ? cos : new Blob([cos], { type: tipo }), a = document.createElement('a');
        a.href = URL.createObjectURL(bl); a.download = nom; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000); return nom;
      };
      if (k === 'md') return Promise.resolve(desa(id + '.md', CX.md(P, A, meta), 'text/markdown'));
      if (k === 'json') return Promise.resolve(desa(id + '.json', CX.json(P, A, meta), 'application/json'));
      return Promise.all(['forces.js', '3d.js', 'vista.js'].map(function (f) { return fetch(DIR + f).then(function (r) { if (!r.ok) throw r.status; return r.text(); }); }))
        .then(function (c) { return k === 'html' ? desa(id + '.html', CX.html(P, meta, c), 'text/html') : desa(id + '-scorm.zip', CX.scorm(P, meta, c)); });
    }

    monta();
    ver('3d');
    if (op.privado) cargaPrivado();
    /* Enllaç directe a una veda: #veda-12, o #veda-1-4 a la segona font. */
    var m = location.hash.match(/^#veda-(?:(\d+)-)?(\d+)$/), dir = m && (PUB.fuentes[+(m[1] || 0)] || '') + ':' + m[2];
    if (dir && byId[dir]) { selecciona(dir); setTimeout(function () { g3.scrollIntoView({ block: 'start' }); }, 0); }

    return { selecciona: selecciona, dispara: dispara, ver: ver, lleva: lleva, datos: function () { return { D: D, AN: AN }; } };
  }

  raiz.CervellExplora = { munta: munta };
})(window);
