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
      /* En quin moment del dia es mira (`dia`) i, si és una proposta, en quin
         pas de la comanda és. Opcionals, com l'espera. */
      if ('fase' in f) { if (FASES[f.fase]) x.fase = f.fase; else delete x.fase; }
      if ('pas' in f) { if (PASSOS.indexOf(f.pas) >= 0) x.pas = f.pas; else delete x.pas; }
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
     es llegeix del flux (on els deixa `importa`). Un flux `ajornat` fins a una
     data no avisa fins llavors: ho ha decidit algú, i el motiu ho diu.
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
    var aj = +new Date('ajornat' in ctx ? ctx.ajornat : flux.ajornat);
    if (isFinite(aj) && aj > ara) return r(null, 'Ajornat fins d\'aquí ' + durada((aj - ara) / HORA));
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

  /* ── El dia, en ordre ──────────────────────────────────────────────────
     El que una persona fa cada dia amb la seva xarxa, en cinc passos i en
     aquest ordre: respondre, moure les propostes, produir, cobrar i cuidar
     la xarxa. Cada flux va a un sol pas: el que diu el flux (`fase`, del
     paquet o de qui l'ha dibuixat) o, si no ho diu, el que es dedueix de qui
     espera, del termini, del nom i de la mena. Serveix igual per a un negoci,
     una associació o un equip: només llegeix el mapa.

       dia(fluxos, ara) → [{id, nom, que, items:[{x, motiu}]}]
       fluxos = [{flux, ts, ...}]  (qualsevol altra cosa hi passa intacta) */
  var FASES = {
    respon: ['Respon', 'el que t\'espera'],
    proposta: ['Mou les propostes', 'cada una amb el seu pas següent'],
    produeix: ['Produeix', 'el que toca els propers 14 dies'],
    cobra: ['Cobra', 'el que s\'ha de cobrar i el que falta'],
    xarxa: ['Cuida la xarxa', 'qui fa temps que no hi és']
  };
  var PASSOS = ['demanada', 'enviada', 'acceptada', 'cobrada', 'feta'];
  var NOM = {
    proposta: /propost|pressupost|presupuest|oferta|comand|encàrrec|encarrec|encargo|petici|sol·licitud|lead/i,
    cobra: /pag|cobr|factur|diner|dinero|reserva|liquida|quota|cuota|abonament/i,
    produeix: /event|servei|servicio|producci|taller|lliura|entrega|matèria|materia|munta|feina/i,
    xarxa: /recomana|aliat|aliad|partner|soci|xarxa|red\b|visita|contacte|opini|idea/i
  };
  function fase(flux, ara) {
    if (FASES[flux.fase]) return flux.fase;
    if (flux.espera === 'nosaltres') return 'respon';
    var l = (flux.label || '') + ' ' + (flux.nomA || '') + ' ' + (flux.nomB || ''), tm = +new Date(flux.termini);
    if (NOM.proposta.test(flux.label || '')) return 'proposta';
    if (NOM.cobra.test(flux.label || '')) return 'cobra';
    if (NOM.produeix.test(flux.label || '') || (isFinite(tm) && tm - ara < 14 * DIA && tm > ara - DIA)) return 'produeix';
    if (NOM.xarxa.test(l) || flux.kind === 'intangible') return 'xarxa';
    return null;
  }
  function dia(fluxos, ara) {
    ara = ara || Date.now();
    var per = {}; Object.keys(FASES).forEach(function (k) { per[k] = []; });
    fluxos.forEach(function (x) {
      var f = x.flux, k = fase(f, ara); if (!k) return;
      var e = estat(f, x.ts, ara), av = avis(f, x.ts, ara), tm = +new Date(f.termini), m;
      if (av.nivell === null && /^Ajornat/.test(av.motiu)) return;
      if (k === 'respon') m = av.motiu || 'Ens toca moure fitxa';
      else if (k === 'proposta') { var p = f.pas || (e.darrer ? 'enviada' : 'demanada'), i = PASSOS.indexOf(p);
        m = 'És ' + p + (i < PASSOS.length - 1 ? ' · el pas següent: ' + ['enviar-la', 'que l\'acceptin', 'cobrar-la', 'fer-la'][i] : ''); }
      else if (k === 'produeix') m = isFinite(tm) ? (tm < ara ? 'Havia de ser fa ' + Math.round((ara - tm) / DIA) + ' dies' : 'D\'aquí ' + Math.round((tm - ara) / DIA) + ' dies') : (e.darrer ? 'L\'últim cop, fa ' + e.dies + ' dies' : 'Encara no ha passat mai');
      else if (k === 'cobra') m = av.nivell ? av.motiu : e.darrer ? 'L\'últim cobrament, fa ' + e.dies + ' dies' : 'Encara no s\'ha cobrat mai';
      else m = e.darrer ? NOMS[e.estat].replace(/^./, function (c) { return c.toUpperCase(); }) + ' · l\'últim intercanvi, fa ' + e.dies + ' dies' : 'Encara no hi ha hagut cap intercanvi';
      per[k].push({ x: x, motiu: m, pes: (av.nivell === 'urgent' ? 0 : av.nivell === 'important' ? 1 : 2) * 1e4 - (k === 'xarxa' ? (e.dies || 999) : 0) + (isFinite(tm) ? (tm - ara) / DIA : 999) });
    });
    return Object.keys(FASES).map(function (k) {
      return { id: k, nom: FASES[k][0], que: FASES[k][1], items: per[k].sort(function (a, b) { return a.pes - b.pes; }) };
    });
  }
  /* El dia pintat: cinc passos numerats, cadascun amb els seus fluxos (fins
     a 4) i el que en toca fer. `op.nom(x)` diu el nom del flux i `op.obre(x)`
     què passa en tocar-lo. Sense colors fixos: hereta els de la pàgina. */
  function pintaDia(caixa, grups, op) {
    posaEstil();
    if (!document.getElementById('fv-dia')) {
      var s = document.createElement('style'); s.id = 'fv-dia';
      s.textContent = '.fv-dia{list-style:none;margin:0;padding:0;counter-reset:fvd}' +
        '.fv-dia>li{counter-increment:fvd;padding:.7rem 0;border-top:1px solid var(--border,#ddd)}.fv-dia>li:first-child{border-top:0}' +
        '.fv-dh{display:flex;flex-wrap:wrap;align-items:center;gap:.1rem .5rem;font-weight:700}.fv-dh::before{content:counter(fvd);display:inline-grid;place-items:center;min-width:1.6rem;height:1.6rem;border-radius:50%;background:var(--text,#222);color:var(--bg,#fff);font-size:var(--t0,15px)}' +
        '.fv-dh small{order:3;flex-basis:100%;padding-left:2.1rem;font-weight:400;color:var(--muted,#666);font-size:var(--t0,15px)}.fv-dn{margin-left:auto;font-family:"JetBrains Mono",monospace;color:var(--muted,#666)}' +
        '.fv-di{display:flex;flex-direction:column;align-items:flex-start;width:100%;text-align:left;font:inherit;color:inherit;background:none;border:0;border-left:3px solid var(--border,#ddd);margin:.4rem 0 0 .7rem;padding:.25rem .6rem;cursor:pointer;min-height:40px}' +
        '.fv-di.fv-urgent{border-left-color:var(--red,#c00)}.fv-di.fv-important{border-left-color:var(--orange,#e80)}' +
        '.fv-di span{color:var(--muted,#666);font-size:var(--t0,15px)}.fv-buit{margin:.3rem 0 0 2.1rem;color:var(--muted,#666);font-size:var(--t0,15px)}';
      document.head.appendChild(s);
    }
    var ol = document.createElement('ol'); ol.className = 'fv-dia';
    grups.forEach(function (g) {
      var li = document.createElement('li'); li.setAttribute('data-fase', g.id);
      li.innerHTML = '<div class="fv-dh">' + g.nom + ' <small>' + g.que + '</small><span class="fv-dn">' + g.items.length + '</span></div>';
      if (!g.items.length) { var p = document.createElement('p'); p.className = 'fv-buit'; p.textContent = 'Res per ara.'; li.appendChild(p); }
      g.items.slice(0, 4).forEach(function (it) {
        var b = document.createElement('button'), av = avis(it.x.flux, it.x.ts).nivell;
        b.className = 'fv-di' + (av ? ' fv-' + av : ''); b.type = 'button';
        var t = document.createElement('b'); t.textContent = op.nom(it.x); var m = document.createElement('span'); m.textContent = it.motiu;
        b.appendChild(t); b.appendChild(m); b.onclick = function () { op.obre(it.x); }; li.appendChild(b);
      });
      if (g.items.length > 4) { var q = document.createElement('p'); q.className = 'fv-buit'; q.textContent = 'I ' + (g.items.length - 4) + ' més.'; li.appendChild(q); }
      ol.appendChild(li);
    });
    caixa.appendChild(ol);
    return ol;
  }

  return { RITMES: RITMES, TIPUS: TIPUS, FASES: FASES, PASSOS: PASSOS, ritmeDies: ritmeDies, estat: estat, propera: propera, avis: avis, fase: fase, dia: dia, pintaDia: pintaDia, pinta: pinta, importa: importa, exemple: exemple };
})();
