/* El mapa viu · el que circula i el que no (18/10/2026).
   Cada flux té un ritme (el declarat, o el que surt dels seus apunts) i una
   data de l'últim cop que va circular. Amb tots dos el mapa el pinta viu,
   apagant-se, aturat o mai no circulat. I la xarxa real (leads, correus,
   apunts) entra com un paquet privat que no surt mai del navegador.
   Una sola còpia: la carreguen l'app i l'editor del mapa amb carregaLib. */
var FluxViu = (function () {
  var DIA = 864e5, HORA = 36e5;
  var RITMES = { setmana: 7, quinzena: 14, mes: 30, trimestre: 91, any: 365 };
  var NOMS = { viu: 'viu', apagant: 'apagant-se', aturat: 'aturat', mai: 'mai no ha circulat' };

  function temps(tss) {
    return (tss || []).map(function (x) { return +new Date(x); }).filter(isFinite).sort(function (a, b) { return a - b; });
  }

  /* El ritme en dies: el declarat, o la mediana entre apunts quan n'hi ha
     tres o més. Sense cap dels dos, 0: no se sap què esperar. */
  function ritmeDies(flux, tss) {
    if (flux && RITMES[flux.ritme]) return RITMES[flux.ritme];
    var t = temps(tss);
    if (t.length < 3) return 0;
    var d = [];
    for (var i = 1; i < t.length; i++) d.push(t[i] - t[i - 1]);
    d.sort(function (a, b) { return a - b; });
    return Math.max(1, Math.round(d[d.length >> 1] / DIA));
  }

  /* Sense ritme es compta com un flux mensual: és el que es demana a un
     negoci que tot just comença a apuntar. */
  function estat(flux, tss, ara) {
    ara = ara || Date.now();
    var t = temps(tss);
    if (!t.length) return { estat: 'mai', ritme: ritmeDies(flux, t), n90: 0, darrer: null };
    var r = ritmeDies(flux, t), darrer = t[t.length - 1], fa = (ara - darrer) / DIA, base = r || 30;
    var n90 = t.filter(function (x) { return ara - x < 90 * DIA; }).length;
    return { estat: fa <= base ? 'viu' : fa <= 2 * base ? 'apagant' : 'aturat', ritme: r, n90: n90, darrer: darrer, dies: Math.floor(fa) };
  }

  var estil = false;
  function posaEstil() {
    if (estil) return; estil = true;
    var s = document.createElement('style');
    s.textContent =
      '.fv-pols{fill:none;stroke-linecap:round;stroke-width:3;stroke-opacity:.95;stroke-dasharray:1.5 11;animation:fvp var(--fv,3s) linear infinite;pointer-events:none}' +
      '@keyframes fvp{to{stroke-dashoffset:-50}}' +
      '.fv-apagant{stroke-opacity:.28}' +
      '.fv-aturat{stroke:var(--orange,#ff9100);stroke-opacity:.85}' +
      '.fv-mai{stroke:var(--muted,#82828d);stroke-opacity:.35;stroke-width:1}' +
      '.fv-marca{font:700 10px "JetBrains Mono",monospace;fill:var(--orange,#ff9100);pointer-events:none}' +
      '[data-url]{cursor:pointer}' +
      '@media (prefers-reduced-motion:reduce){.fv-pols{animation:none;stroke-dasharray:none;stroke-width:2.4;stroke-opacity:.6}}';
    document.head.appendChild(s);
  }

  function fa(dies) { return dies === 0 ? 'avui' : dies === 1 ? 'ahir' : 'fa ' + dies + ' dies'; }

  /* Pinta damunt l'SVG que ja ha dibuixat l'app: cada camí porta data-ex, i
     cada rol o flux amb origen porta data-url. `fluxos` és {id: {flux, ts}}.
     Si cap flux no ha circulat mai, el mapa és encara un disseny i no es toca. */
  function pinta(svg, fluxos, ara) {
    posaEstil();
    var ns = 'http://www.w3.org/2000/svg';
    var algun = Object.keys(fluxos).some(function (k) { return (fluxos[k].ts || []).length; });
    if (algun) svg.querySelectorAll('path[data-ex]').forEach(function (p) {
      var f = fluxos[p.getAttribute('data-ex')]; if (!f) return;
      var e = estat(f.flux, f.ts, ara);
      p.classList.add('fv-' + e.estat);
      var tt = p.querySelector('title');
      if (tt) tt.textContent += ' · ' + NOMS[e.estat] + (e.darrer ? ' (' + fa(e.dies) + (e.ritme ? ', cada ' + e.ritme + ' dies' : '') + ')' : '');
      if (e.estat === 'viu') {
        var q = document.createElementNS(ns, 'path');
        q.setAttribute('d', p.getAttribute('d'));
        q.setAttribute('class', 'fv-pols');
        /* El color del traç el pot dir l'atribut o una classe de la pàgina. */
        q.setAttribute('stroke', getComputedStyle(p).stroke || p.getAttribute('stroke'));
        q.style.setProperty('--fv', Math.max(.8, 4 - Math.min(e.n90, 30) / 10) + 's');
        p.parentNode.insertBefore(q, p.nextSibling);
      } else if (e.estat === 'aturat' && p.getAttribute('data-m')) {
        var m = p.getAttribute('data-m').split(',');
        var t = document.createElementNS(ns, 'text');
        t.setAttribute('x', m[0]); t.setAttribute('y', +m[1] + 4);
        t.setAttribute('text-anchor', 'middle'); t.setAttribute('class', 'fv-marca');
        t.textContent = '⏸';
        p.parentNode.appendChild(t);
      }
    });
    svg.querySelectorAll('[data-url]').forEach(function (el) {
      var u = el.getAttribute('data-url');
      var obre = function () { window.open(u, '_blank', 'noopener'); };
      el.addEventListener('click', obre);
      el.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') obre(); });
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', 0);
    });
  }

  /* ── La xarxa real ─────────────────────────────────────────────────────
     Un paquet {type:'sos-xarxa-real', v:1, nodes:[], fluxos:[]} que prepara
     Claude amb els connectors (Zoho, Gmail, el registre) i que la persona
     arrossega al seu SOS. Cada peça porta el seu `orig` (p. ex. zoho:123,
     gmail:abc): tornar-lo a carregar actualitza, no duplica. Les dades són
     personals i només viuen al navegador de qui el carrega. */
  var TIPUS = 'sos-xarxa-real';
  function text(x, n) { return String(x == null ? '' : x).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n); }
  function url(x) { x = String(x || ''); return /^https:\/\/[^\s"'<>]+$/.test(x) ? x.slice(0, 500) : ''; }

  function importa(node, pak, uid) {
    if (!pak || pak.type !== TIPUS || !Array.isArray(pak.nodes)) throw new Error('Aquest fitxer no és un paquet de xarxa real');
    var vna = node.vna, roles = vna.roles, ex = vna.exchanges, compte = { rols: 0, fluxos: 0, fets: 0 };
    var perOrig = {};
    roles.forEach(function (r) { if (r.orig) perOrig[r.orig] = r; });
    pak.nodes.forEach(function (n) {
      var o = text(n.id, 120); if (!o) return;
      var r = perOrig[o];
      if (!r) { r = { id: uid(), orig: o }; roles.push(r); perOrig[o] = r; compte.rols++; }
      r.name = text(n.name, 80) || r.name || o;
      if (n.kind) r.realKind = text(n.kind, 20);
      var u = url(n.url); if (u) r.url = u;
    });
    (pak.fluxos || []).forEach(function (f) {
      var a = perOrig[text(f.from, 120)], b = perOrig[text(f.to, 120)], o = text(f.id, 160);
      if (!a || !b || !o) return;
      var x = ex.find(function (y) { return y.orig === o; });
      if (!x) { x = { id: uid(), orig: o, from: a.id, to: b.id, kind: f.kind === 'tangible' ? 'tangible' : 'intangible', events: [] }; ex.push(x); compte.fluxos++; }
      x.label = text(f.label, 60) || x.label || '';
      if (RITMES[f.ritme]) x.ritme = f.ritme;
      /* Qui ha de moure fitxa i per quan. Opcionals: un paquet que no els porta
         no toca el que hi havia; un que els porta buits, els treu. */
      if ('espera' in f) { if (ESPERES[f.espera]) x.espera = f.espera; else delete x.espera; }
      if ('termini' in f) { var tm = new Date(f.termini); if (f.termini && isFinite(tm)) x.termini = tm.toISOString(); else delete x.termini; }
      var u = url(f.url); if (u) x.url = u;
      /* El flux com un fil: qui el porta (una persona o un agent d'IA) i què
         s'hi ha dit. Les notes, com els fets, entren una vegada per `id`. */
      if (f.porta && text(f.porta.nom, 80)) x.porta = { nom: text(f.porta.nom, 80), agent: !!f.porta.agent };
      if (Array.isArray(f.fil)) {
        x.fil = x.fil || [];
        f.fil.forEach(function (m) {
          var mo = text(m.id, 160), mt = new Date(m.ts), tx = text(m.txt, 600);
          if (!mo || !tx || !isFinite(mt) || x.fil.some(function (y) { return y.orig === mo; })) return;
          x.fil.push({ orig: mo, ts: mt.toISOString(), qui: text(m.qui, 80), agent: !!m.agent, txt: tx });
        });
        x.fil.sort(function (a, b) { return a.ts < b.ts ? -1 : 1; });
      }
      x.events = x.events || [];
      (f.fets || []).forEach(function (ev) {
        var eo = text(ev.id, 160), ts = new Date(ev.ts);
        if (!eo || !isFinite(ts) || x.events.some(function (y) { return y.orig === eo; })) return;
        x.events.push({ orig: eo, ts: ts.toISOString(), what: text(ev.what, 120), url: url(ev.url) || undefined });
        compte.fets++;
      });
    });
    return compte;
  }

  /* ── Els avisos ────────────────────────────────────────────────────────
     Una sola regla per dir què no pot esperar, la mateixa a l'app i als
     taulers que en copien aquest fitxer.
       urgent     ens toca respondre i fa més de 24 h del darrer fet, o el
                  termini és d'aquí menys de 48 h (o ja ha passat)
       important  el flux s'ha aturat, ens toca respondre fa entre 4 i 24 h
                  (o encara no hi ha cap fet), o el termini és d'aquí menys
                  de 7 dies
     `ctx` = {espera:'nosaltres'|'ells'|null, termini: ISO|null}; si no hi és,
     es llegeix del flux (on els deixa `importa`).
     Torna {nivell:'urgent'|'important'|null, motiu, termini} (termini en ms). */
  var ESPERES = { nosaltres: 1, ells: 1 };
  function durada(h) { return h < 24 ? Math.max(1, Math.round(h)) + ' h' : Math.round(h / 24) + (Math.round(h / 24) === 1 ? ' dia' : ' dies'); }
  function avis(flux, tss, ara, ctx) {
    ara = ara || Date.now(); ctx = ctx || {}; flux = flux || {};
    var espera = 'espera' in ctx ? ctx.espera : flux.espera;
    var tm = 'termini' in ctx ? ctx.termini : flux.termini;
    var t = temps(tss), darrer = t.length ? t[t.length - 1] : null;
    var q = tm ? +new Date(tm) : NaN, termini = isFinite(q) ? q : null;
    var falta = termini === null ? null : (termini - ara) / HORA;
    var deu = espera === 'nosaltres', h = deu && darrer ? (ara - darrer) / HORA : null;
    var r = function (nivell, motiu) { return { nivell: nivell, motiu: motiu, termini: termini }; };
    if (h !== null && h > 24) return r('urgent', 'Ens toca respondre, i fa ' + durada(h));
    if (falta !== null && falta < 0) return r('urgent', 'El termini va passar fa ' + durada(-falta));
    if (falta !== null && falta < 48) return r('urgent', 'El termini és d\'aquí ' + durada(falta));
    if (estat(flux, t, ara).estat === 'aturat') return r('important', 'S\'ha aturat: no circula al seu ritme');
    if (h !== null && h >= 4) return r('important', 'Ens toca respondre, i fa ' + durada(h));
    if (deu && !darrer) return r('important', 'Ens toca fer el primer pas');
    if (falta !== null && falta < 7 * 24) return r('important', 'El termini és d\'aquí ' + durada(falta));
    return r(null, '');
  }

  /* Un exemple inventat, per veure els quatre estats sense dades pròpies.
     Les dates es compten des d'avui perquè sempre surti igual. */
  function exemple(ara) {
    ara = ara || Date.now();
    var d = function (n) { return new Date(ara - n * DIA).toISOString(); };
    var fets = function (pre, dies) { return dies.map(function (n, i) { return { id: pre + i, ts: d(n), what: 'Exemple' }; }); };
    return { type: TIPUS, v: 1, nodes: [
      { id: 'ex:negoci', name: 'El negoci', url: 'https://teamtowershuma.com/SOS/blog.html#post-mapa-viu' },
      { id: 'ex:clients', name: 'Clients' }, { id: 'ex:prov', name: 'Proveïdors' },
      { id: 'ex:equip', name: 'Equip' }, { id: 'ex:aliats', name: 'Aliats' }],
      fluxos: [
        { id: 'ex:f1', from: 'ex:negoci', to: 'ex:clients', label: 'Comandes', kind: 'tangible', ritme: 'setmana', fets: fets('a', [1, 6, 12, 19, 26]) },
        { id: 'ex:f2', from: 'ex:clients', to: 'ex:negoci', label: 'Pagaments', kind: 'tangible', ritme: 'setmana', termini: d(-5), fets: fets('b', [2, 9, 16]) },
        { id: 'ex:f3', from: 'ex:prov', to: 'ex:negoci', label: 'Matèria primera', kind: 'tangible', ritme: 'setmana', fets: fets('c', [11, 18]) },
        { id: 'ex:f4', from: 'ex:equip', to: 'ex:negoci', label: 'Idees de millora', ritme: 'mes', fets: fets('d', [75, 110]) },
        { id: 'ex:f5', from: 'ex:negoci', to: 'ex:aliats', label: 'Recomanacions', ritme: 'mes' },
        { id: 'ex:f6', from: 'ex:clients', to: 'ex:negoci', label: 'Opinions', ritme: 'mes', espera: 'nosaltres', fets: fets('e', [4, 33, 61]),
          porta: { nom: 'Agent de respostes', agent: true },
          fil: [{ id: 'e-m1', ts: d(4), qui: 'Una clienta', txt: 'El pa d\'espelta de dissabte era boníssim. En fareu també entre setmana?' },
            { id: 'e-m2', ts: d(3.9), qui: 'Agent de respostes', agent: true, txt: 'Esborrany preparat: sí, els dimecres. Falta que algú de l\'equip el revisi i l\'enviï.' }] }] };
  }

  /* La propera vegada, com la data d'entrega d'una comanda: el darrer cop més
     el ritme (o un mes, si no se sap). `dies` positiu és el que falta;
     negatiu, els dies que fa que s'espera. Sense cap fet, no hi ha data. */
  function propera(flux, tss, ara) {
    ara = ara || Date.now();
    var e = estat(flux, tss, ara);
    if (!e.darrer) return null;
    var quan = e.darrer + (e.ritme || 30) * DIA;
    return { quan: quan, dies: Math.round((quan - ara) / DIA), estat: e };
  }

  return { RITMES: RITMES, TIPUS: TIPUS, ritmeDies: ritmeDies, estat: estat, propera: propera, avis: avis, pinta: pinta, importa: importa, exemple: exemple };
})();
