/* /cliente/, pas a pas · la mateixa pàgina, una cosa cada vegada (16/11/2026)
 * ─────────────────────────────────────────────────────────────────────────────
 * L'Àlvar, obrint el seu enllaç de mapa: «esta página es terrorífica, tan
 * larga, sin un flujo de valor automatizado». Comptat al laboratori: 14.000 px
 * a l'escriptori i 21.500 al mòbil, unes 3.000 paraules, 82 botons i 31 camps
 * oberts alhora, i set seccions numerades que no diuen quina va primer.
 *
 * Això no reescriu la pàgina: la recorre. Cinc passos amb l'ordre de «La font i
 * la colla» (primer valor, després el teu mapa, els teus forats, el que va sol,
 * la web amb la quota, i enviar-ho), i a cada pas només es veu el que s'hi fa.
 * Res no s'esborra ni canvia de lloc: els mateixos camps, el mateix estat i el
 * mateix enviament. «Veure tota la pàgina» la torna com era.
 *
 *  · Triar un model al pas 1 porta sol al pas 2: el mapa ja té gent, i el que
 *    toca és mirar què hi falta.
 *  · Al pas 2 hi ha les dotze preguntes del panteó (`lib/panteo.js`, veda 19):
 *    les que ningú no respon són els forats de la colla, que és on entra algú
 *    nou o algú que ho vol aprendre fent. Es desen amb el mapa i viatgen amb
 *    l'enviament.
 *  · Una adreça amb #web, #cuenta… obre el seu pas; una que porta a una cosa
 *    que el pas a pas no ensenya (#cuentanos, #panel…) obre la pàgina sencera.
 *
 * Necessita de la pàgina `window.TTCliente = { estat(), desa() }`. Sense això,
 * el pas a pas funciona igual però no desa les preguntes.
 */
(function () {
  'use strict';
  if (window.GuiaCliente || !document.getElementById('alrededor')) return;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var LL = document.documentElement.lang === 'ca' ? 'ca' : 'es';
  var T = {
    es: {
      k: 'Tu colla en cinco pasos', valor: 'Primero, mira en un minuto qué aporta un mapa', ant: '← Anterior', seg: 'Siguiente: {0} →', fi: 'Ya está: envíanoslo arriba',
      tot: 'Ver toda la página', torna: 'Volver al paso a paso', pas: 'Paso {0} de {1}',
      auto: 'Ya hay gente a tu alrededor. Ahora, lo que falta.',
      p: [
        ['Tu mapa', 'Pon el nombre y elige lo que más se parece a lo que haces. Rellenamos quién suele estar a tu alrededor; luego lo cambias con tus palabras.'],
        ['Tus huecos', 'Quién falta, qué no circula y cuáles de las doce preguntas de toda colla no tienen a nadie. Cada hueco es una persona, una actividad o alguien que quiere aprenderlo.'],
        ['Lo que va solo', 'Cada cosa que se repite en tu mapa es una tarjeta. Las que puede preparar una máquina, las dejamos funcionando contigo.'],
        ['Tu web y tu cuota', 'Elige hasta dónde: de una página a la web viva, con cuota mensual. La estructura sale de tu mapa.'],
        ['Envíalo', 'Tu nombre y tu correo, y nos llega. Te contesta una persona.']
      ],
      pt: 'Las doce preguntas de toda colla', pd: 'Toca las que ya tienen a alguien en tu casa. Las que quedan son tus huecos.',
      pn: '{0} de 12 con alguien', pf: 'Huecos: {0}.', pz: 'Sin nadie en Zeus, nadie reparte el valor: es el primero que conviene ocupar.',
      pa: 'Aprende haciendo →', pr: 'Las 12 preguntas (Pantheon.work): con alguien {0}; huecos {1}'
    },
    ca: {
      k: 'La teva colla en cinc passos', valor: 'Primer, mira en un minut què aporta un mapa', ant: '← Anterior', seg: 'Següent: {0} →', fi: 'Ja està: envia-ho a dalt',
      tot: 'Veure tota la pàgina', torna: 'Tornar al pas a pas', pas: 'Pas {0} de {1}',
      auto: 'Ja hi ha gent al teu voltant. Ara, el que hi falta.',
      p: [
        ['El teu mapa', 'Posa-hi el nom i tria el que més s\'assembla al que fas. Omplim qui sol ser al teu voltant; després ho canvies amb les teves paraules.'],
        ['Els teus forats', 'Qui hi falta, què no circula i quines de les dotze preguntes de tota colla no tenen ningú. Cada forat és una persona, una activitat o algú que ho vol aprendre.'],
        ['El que va sol', 'Cada cosa que es repeteix al teu mapa és una targeta. Les que pot preparar una màquina, les deixem funcionant amb tu.'],
        ['La teva web i la quota', 'Tria fins on: d\'una pàgina a la web viva, amb quota mensual. L\'estructura surt del teu mapa.'],
        ['Envia-ho', 'El teu nom i el teu correu, i ens arriba. Et contesta una persona.']
      ],
      pt: 'Les dotze preguntes de tota colla', pd: 'Toca les que ja tenen algú a casa teva. Les que queden són els teus forats.',
      pn: '{0} de 12 amb algú', pf: 'Forats: {0}.', pz: 'Sense ningú a Zeus, ningú no reparteix el valor: és el primer que convé ocupar.',
      pa: 'Aprèn fent →', pr: 'Les 12 preguntes (Pantheon.work): amb algú {0}; forats {1}'
    }
  }[LL];
  var f = function (s) { var a = arguments; return s.replace(/\{(\d)\}/g, function (_, i) { return a[+i + 1]; }); };
  function h(tag, at, txt) { var e = document.createElement(tag); for (var k in (at || {})) e.setAttribute(k, at[k]); if (txt != null) e.textContent = txt; return e; }
  function guarda(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* sense memòria */ } }
  function llegeix(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  /* Què es veu a cada pas. `veu`: el que es mostra de cada secció (i el que ho
     conté); `amaga`: el que, a dins, sobra. Tot amb els id que la pàgina ja té. */
  var PASSOS = [
    { s: ['#alrededor'], veu: ['#cl-mapes', '#cl-org', '#cl-mapa-tit', '#cl-casa', '#cl-models', '#cl-bona', '#cl-rols'],
      amaga: ['#alrededor .cabeza', '#alrededor .manera', '.models-sec', '#cl-oficis', '#cl-sectors', '.busca-ofici'] },
    { s: ['#alrededor'], veu: ['#cl-files', '#cl-afegeix', '#gc-h-salut', '#cl-salut-n', '#cl-salut', '#gc-panteo', '#cl-ia'], amaga: ['#alrededor .cabeza'] },
    { s: ['#alrededor', '#tablero'], veu: ['#cl-auto', '#cl-caso', '#tablero > .container'], amaga: ['#alrededor .cabeza'] },
    { s: ['#web'], veu: ['#cl-nivells', '#gc-h-capes', '#cl-capes', '#cl-boceto', '#cl-boceto-r', '#cl-marc-caixa'], amaga: ['#web .cabeza'] },
    { s: ['#cuenta', '#enviar'], veu: ['#cl-nom', '#cl-crea', '#cl-entra', '#cl-compte', '#cl-priv', '#cl-envia', '#cl-envia-r', '#enviar > .container > .nota'],
      amaga: ['#cuenta .cabeza', '#enviar .cabeza', '#cl-baixa', '#cl-cervell', 'label[for="cl-carrega"]', '#cuenta .nota'] }
  ];
  /* Les adreces que obren un pas. La resta, si no es veu al pas a pas, obre la pàgina sencera. */
  var HASH = { alrededor: 0, 'cl-casa': 0, tablero: 2, web: 3, vista: 3, cuenta: 4, enviar: 4 };
  var FORA = ['panel', 'espacio'];

  /* Els dos títols sense id que el pas a pas necessita ensenyar. */
  var hs = $('#cl-salut-n'); if (hs && hs.previousElementSibling && hs.previousElementSibling.tagName === 'H3') hs.previousElementSibling.id = 'gc-h-salut';
  var hc = $('#cl-capes'); if (hc && hc.previousElementSibling && hc.previousElementSibling.tagName === 'H3') hc.previousElementSibling.id = 'gc-h-capes';

  var css = h('style');
  css.textContent =
    '.gc-on main>section:not(.gc-ara){display:none!important}.gc-on [data-gc="no"]{display:none!important}.gc-on #cl-avanc-p,.gc-on #cl-espai{display:none}.gc-on main>section.gc-ara:not(#gc){padding-top:1.25rem}.gc-t:focus{outline:none}' +
    '.gc{padding:2rem 0 .4rem}.gc-on .gc{display:block}.gc{display:none}' +
    '.gc-k{margin:0 0 .6rem;font:600 .78rem var(--mono,monospace);letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}.gc-k a{text-transform:none;letter-spacing:0;font-family:inherit;font-weight:600}' +
    '.gc-pas{display:flex;gap:.35rem;list-style:none;margin:0 0 1rem;padding:0}.gc-pas li{flex:1;min-width:0}' +
    '.gc-pas button{all:unset;box-sizing:border-box;display:block;width:100%;min-height:44px;padding:.45rem .5rem;border-radius:10px;border:1px solid var(--border);background:var(--card);cursor:pointer;font-size:.85rem;line-height:1.2;color:var(--muted);text-align:left}' +
    '.gc-pas button b{display:block;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase}.gc-pas button[aria-current="step"]{border-color:var(--indigo);color:var(--text);box-shadow:inset 0 -3px 0 var(--indigo)}.gc-pas button.fet{color:var(--text)}.gc-pas button.fet b::after{content:" ✓";color:var(--green)}' +
    '.gc-pas button:focus-visible,.gc-nav button:focus-visible{outline:2px solid var(--indigo);outline-offset:2px}' +
    '.gc-t{margin:.2rem 0 .3rem;font-size:var(--t3,1.5rem);line-height:1.15}.gc-d{margin:0;max-width:62ch;color:var(--light)}' +
    '.gc-nav{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;margin:2rem 0 0;padding-top:1.2rem;border-top:1px solid var(--border)}.gc-nav .gc-sp{flex:1}' +
    '.gc-nav .gc-tot{all:unset;cursor:pointer;color:var(--muted);text-decoration:underline;text-underline-offset:3px;font-size:.9rem;min-height:44px;display:inline-flex;align-items:center}' +
    '.gc-torna{position:fixed;left:1rem;bottom:1rem;z-index:60}.gc-on .gc-torna{display:none}' +
    '.gc-avis{margin:.8rem 0 0;padding:.6rem .8rem;border-left:3px solid var(--green);background:var(--panel);font-weight:600}' +
    '#gc-panteo>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:.5rem;min-height:44px;margin-top:1.2rem}#gc-panteo>summary::-webkit-details-marker{display:none}#gc-panteo>summary::before{content:"▸";color:var(--indigo)}#gc-panteo[open]>summary::before{content:"▾"}#gc-panteo>summary h3{margin:0}' +
    '.gc-pt{margin:1.6rem 0 .2rem}.gc-pd{margin:0 0 .6rem;color:var(--light)}' +
    '.gc-px{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,15rem),1fr));gap:.4rem;list-style:none;margin:0;padding:0}' +
    '.gc-px button{all:unset;box-sizing:border-box;display:flex;gap:.5rem;align-items:flex-start;width:100%;min-height:44px;padding:.5rem .6rem;border-radius:10px;border:1.5px dashed var(--border-strong);background:var(--card);cursor:pointer;font-size:.88rem;line-height:1.3;color:var(--light)}' +
    '.gc-px button b{display:block;color:var(--text)}.gc-px button[aria-pressed="true"]{border-style:solid;border-color:var(--green);color:var(--text)}.gc-px button[aria-pressed="true"] b::after{content:" ✓";color:var(--green)}' +
    '.gc-px button[aria-pressed="false"] b{color:var(--orange)}.gc-px button:focus-visible{outline:2px solid var(--indigo);outline-offset:2px}' +
    '.gc-pr{margin:.6rem 0 0;font-size:.95rem}.gc-pr b{color:var(--orange)}' +
    '@media (max-width:640px){.gc-pas button{text-align:center;padding:.45rem .2rem}.gc-pas button span{display:none}.gc-pas li:has(button[aria-current="step"]){flex:2.6}.gc-pas button[aria-current="step"] span{display:block}}';
  document.head.appendChild(css);

  /* ── La capçalera i la navegació ──────────────────────────────────────── */
  var main = $('main'), pas = 0;
  var cap = h('section', { class: 'gc', id: 'gc', 'aria-labelledby': 'gc-t', 'data-pantalla-fix': '' }), cc = h('div', { class: 'container' });
  var kick = h('p', { class: 'gc-k' }); kick.appendChild(document.createTextNode(T.k + ' · '));
  kick.appendChild(h('a', { href: '/SOS/la-font.html' }, T.valor));
  var ol = h('ol', { class: 'gc-pas' });
  var bts = PASSOS.map(function (_, i) {
    var li = h('li'), b = h('button', { type: 'button' });
    b.appendChild(h('b', {}, String(i + 1))); b.appendChild(h('span', {}, T.p[i][0]));
    b.setAttribute('aria-label', f(T.pas, i + 1, PASSOS.length) + ': ' + T.p[i][0]);
    b.addEventListener('click', function () { va(i, true); });
    li.appendChild(b); ol.appendChild(li); return b;
  });
  var tit = h('h2', { class: 'gc-t', id: 'gc-t', tabindex: '-1' }), des = h('p', { class: 'gc-d' }), avis = h('p', { class: 'gc-avis', role: 'status' });
  avis.hidden = true;
  [kick, ol, tit, des, avis].forEach(function (e) { cc.appendChild(e); });
  cap.appendChild(cc); main.insertBefore(cap, main.firstChild);
  cap.classList.add('gc-ara');

  var nav = h('div', { class: 'gc-nav' });
  var bAnt = h('button', { type: 'button', class: 'btn btn-ghost' }, T.ant), bSeg = h('button', { type: 'button', class: 'btn btn-primary' });
  var bTot = h('button', { type: 'button', class: 'gc-tot' }, T.tot);
  nav.appendChild(bAnt); nav.appendChild(h('span', { class: 'gc-sp' })); nav.appendChild(bTot); nav.appendChild(bSeg);
  bAnt.addEventListener('click', function () { va(pas - 1, true); });
  bSeg.addEventListener('click', function () { if (pas < PASSOS.length - 1) va(pas + 1, true); });
  bTot.addEventListener('click', function () { posa(false, true); });
  var torna = h('button', { type: 'button', class: 'btn btn-primary gc-torna' }, T.torna);
  torna.addEventListener('click', function () { posa(true, true); va(pas, true); });
  document.body.appendChild(torna);

  /* ── Les dotze preguntes del panteó, al pas dels forats ─────────────────── */
  var P = window.Panteo, cli = function () { return window.TTCliente && window.TTCliente.estat ? window.TTCliente.estat() : null; };
  var pBox = h('details', { id: 'gc-panteo' }), pRes = h('p', { class: 'gc-pr', 'aria-live': 'polite' });
  if (P) {
    /* Al pas a pas van obertes; a la pàgina en pantalles, plegades sota el seu títol. */
    var pSum = h('summary'); pSum.appendChild(h('h3', { class: 'gc-pt' }, T.pt)); pBox.appendChild(pSum); pBox.appendChild(h('p', { class: 'gc-pd' }, T.pd));
    var ul = h('ul', { class: 'gc-px' });
    P.ORDRE.forEach(function (id) {
      var a = P.ARQ[id], li = h('li'), b = h('button', { type: 'button', 'aria-pressed': 'false', 'data-arq': id });
      var tx = h('span'); tx.appendChild(h('b', {}, a.ic + ' ' + (LL === 'es' ? a.nomEs : a.nom))); tx.appendChild(document.createTextNode(LL === 'es' ? a.qEs : a.q));
      b.appendChild(tx);
      b.addEventListener('click', function () {
        var S = cli(), tots = S ? (S.panteo || []) : marcats();
        var i = tots.indexOf(id); if (i >= 0) tots.splice(i, 1); else tots.push(id);
        if (S) { S.panteo = tots; window.TTCliente.desa(); } else guarda('tt.guia.panteo', JSON.stringify(tots));
        pintaP();
      });
      li.appendChild(b); ul.appendChild(li);
    });
    pBox.appendChild(ul); pBox.appendChild(pRes);
    var salut = $('#cl-salut'); if (salut) salut.parentNode.insertBefore(pBox, salut.nextSibling);
  }
  function marcats() { var S = cli(); if (S) return S.panteo || []; try { return JSON.parse(llegeix('tt.guia.panteo') || '[]'); } catch (e) { return []; } }
  function pintaP() {
    if (!P) return;
    var m = marcats(), forats = P.ORDRE.filter(function (id) { return m.indexOf(id) < 0; });
    $$('[data-arq]', pBox).forEach(function (b) { b.setAttribute('aria-pressed', m.indexOf(b.getAttribute('data-arq')) >= 0 ? 'true' : 'false'); });
    pRes.textContent = '';
    pRes.appendChild(h('b', {}, f(T.pn, m.length) + '. '));
    if (forats.length) {
      pRes.appendChild(document.createTextNode(f(T.pf, forats.map(function (id) { return LL === 'es' ? P.ARQ[id].nomEs : P.ARQ[id].nom; }).join(', ')) + ' '));
      if (forats.indexOf('zeus') >= 0) pRes.appendChild(document.createTextNode(T.pz + ' '));
      pRes.appendChild(h('a', { href: '/SOS/formacio.html' }, T.pa));
    }
  }

  /* ── El pas a pas ─────────────────────────────────────────────────────── */
  /* El menú de dalt queda enganxat: el pas ha de quedar just a sota, no amagat. */
  function puja(e) {
    var dalt = 0;
    $$('header, nav').forEach(function (x) {
      if (x.closest('main')) return;
      var cs = getComputedStyle(x); if (cs.position !== 'sticky' && cs.position !== 'fixed') return;
      var r = x.getBoundingClientRect(); if (r.top <= 1 && r.height < 200) dalt = Math.max(dalt, r.bottom);
    });
    window.scrollTo(0, Math.max(0, e.getBoundingClientRect().top + window.pageYOffset - dalt - 8));
  }
  function neteja() { $$('[data-gc]').forEach(function (e) { e.removeAttribute('data-gc'); }); $$('main>section.gc-ara').forEach(function (s) { if (s !== cap) s.classList.remove('gc-ara'); }); }
  function aplica(i) {
    neteja();
    var md = $('#cl-models-d'); if (md && i === 0) md.open = true;
    var p = PASSOS[i], veu = [];
    p.veu.forEach(function (s) { $$(s).forEach(function (e) { veu.push(e); }); });
    p.s.forEach(function (sel) {
      var sec = $(sel); if (!sec) return;
      sec.classList.add('gc-ara');
      /* Un fill es veu si és, o conté, una cosa que el pas ensenya; si no, fora. */
      (function baixa(cont) {
        [].slice.call(cont.children).forEach(function (c) {
          var es = veu.indexOf(c) >= 0, te = veu.some(function (v) { return c !== v && c.contains(v); });
          if (es) return;
          if (te) baixa(c); else c.setAttribute('data-gc', 'no');
        });
      })(sec);
    });
    p.amaga.forEach(function (s) { $$(s).forEach(function (e) { e.setAttribute('data-gc', 'no'); }); });
    /* La navegació va al final de l'última secció del pas. */
    var ult = $(p.s[p.s.length - 1] + ' > .container') || $(p.s[p.s.length - 1]);
    ult.appendChild(nav); nav.removeAttribute('data-gc');
  }
  function va(i, mou) {
    pas = Math.max(0, Math.min(PASSOS.length - 1, i));
    guarda('tt.guia.pas', String(pas));
    if (!document.body.classList.contains('gc-on')) return;
    aplica(pas);
    bts.forEach(function (b, k) { b.setAttribute('aria-current', k === pas ? 'step' : 'false'); b.classList.toggle('fet', k < pas); });
    tit.textContent = (pas + 1) + ' · ' + T.p[pas][0]; des.textContent = T.p[pas][1];
    bAnt.hidden = pas === 0;
    bSeg.textContent = pas < PASSOS.length - 1 ? f(T.seg, T.p[pas + 1][0]) : T.fi;
    bSeg.disabled = pas === PASSOS.length - 1;
    if (pas !== 1) avis.hidden = true;
    if (pas === 1) pintaP();
    if (mou) { puja(cap); tit.focus({ preventScroll: true }); }
  }
  function posa(on, desa) {
    document.body.classList.toggle('gc-on', on);
    /* Amb el pas a pas tancat, la pàgina sencera va en pantalles (lib/pantalla.js,
       24/11/2026): mai un rotlle de trenta pantalles de mòbil. Mai els dos alhora. */
    pBox.open = on;
    if (on) document.body.setAttribute('data-pantalla-pausa', ''); else document.body.removeAttribute('data-pantalla-pausa');
    if (!on) { neteja(); nav.remove(); var md = $('#cl-models-d'), cr = $('#cl-rols'); if (md && cr && !cr.hidden) md.open = false; }
    if (desa) guarda('tt.guia', on ? null : 'off');
  }

  /* El pas 1 porta sol al 2 quan es tria un model: el mapa ja té gent. */
  ['#cl-models', '#cl-oficis', '#cl-sectors', '#cl-busca-r'].forEach(function (s) {
    var c = $(s); if (!c) return;
    c.addEventListener('click', function (e) {
      if (!e.target.closest('button') || pas !== 0 || !document.body.classList.contains('gc-on')) return;
      setTimeout(function () { va(1, true); avis.textContent = T.auto; avis.hidden = false; }, 700);
    });
  });

  /* L'adreça mana: #web obre el pas de la web; el que el pas a pas no ensenya,
     la pàgina sencera (sense desar-ho: la propera vegada torna el pas a pas). */
  function segueix() {
    var id = location.hash.slice(1);
    if (!id || !document.body.classList.contains('gc-on')) return;
    if (FORA.indexOf(id) >= 0 || /^sessio/.test(id)) { posa(false, false); return; }
    if (HASH[id] != null) { va(HASH[id], false); setTimeout(function () { puja(cap); }, 30); return; }
    var e = document.getElementById(id);
    if (e && !e.closest('#gc') && e.closest('main') && (e.closest('[data-gc="no"]') || !e.closest('.gc-ara'))) {
      var trobat = -1;
      for (var k = 0; k < PASSOS.length && trobat < 0; k++) { aplica(k); if (!e.closest('[data-gc="no"]') && e.closest('.gc-ara')) trobat = k; }
      if (trobat >= 0) va(trobat, false); else { posa(false, false); }
      setTimeout(function () { puja(e); }, 30);
    }
  }
  window.addEventListener('hashchange', segueix);

  var q = new URLSearchParams(location.search).get('guia');
  /* Qui arriba amb una invitació a nom seu (?para=) ja té la seva benvinguda de
     sis passos: no se li'n posen dues. Un ?org= sense nom (la font, un enllaç
     solt) sí que va pel pas a pas. */
  var inv = window.TTCliente && window.TTCliente.estat().invitacio;
  var convidat = !!(inv && inv.para && !inv.tancada);
  var on = q === '1' || (q !== '0' && !convidat && llegeix('tt.guia') !== 'off');
  posa(on, q === '1' || q === '0');
  var p0 = +(llegeix('tt.guia.pas') || 0);
  va(isFinite(p0) ? p0 : 0, false);
  segueix();

  window.GuiaCliente = {
    va: va, posa: posa,
    /* La línia que viatja amb l'enviament. */
    resum: function (S) {
      if (!P || !S || !S.panteo || !S.panteo.length) return '';
      var nom = function (id) { return P.ARQ[id].nomEs; };
      return '\n' + f(T.pr, S.panteo.map(nom).join(', '), P.ORDRE.filter(function (id) { return S.panteo.indexOf(id) < 0; }).map(nom).join(', ') || '—');
    }
  };
})();
