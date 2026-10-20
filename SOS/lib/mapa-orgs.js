/* Qui ocupa els rols · organitzacions i l'escala de cada partner
 * ─────────────────────────────────────────────────────────────
 * Un rol no és una organització. Un celler pot fer el vi, acollir i dinamitzar
 * la visita (una organització, tres rols), i un mateix rol el poden ocupar
 * diversos cellers, que llavors es distingeixen pel seu posicionament.
 *
 * Aquí només es pinta i es demana. El que es llegeix (qui fa diversos rols,
 * quins rols no ocupa ningú, quins són compartits) i l'escala de cada partner
 * (Fitxa → Pàgina → Web pròpia → Node, amb el que falta per a cada porta) són
 * de lib/mapa-valor.js, que és el mateix nucli de l'editor. Desar és de l'app.
 *
 *   MapaOrgs.pinta(caixa, { m, orgs, rols, pot }, { desa(org), treu(id), obre(nom) })
 *     m     el mapa en forma canònica (MapaValor.exporta)
 *     orgs  les de l'app: [{ id, name, roles: [idRol], posicionament, oferta, web, cervell }]
 *     rols  els rols de l'app: [{ id, name }]
 */
(function () {
  var estil = false;
  function posaEstil() {
    if (estil) return; estil = true;
    var s = document.createElement('style');
    s.textContent =
      '.mo{margin-top:1rem}.mo-l{font-size:var(--t0);line-height:1.45;color:var(--light);margin:.3rem 0}' +
      '.mo-c{border:1px solid var(--border);border-radius:10px;padding:.6rem .7rem;margin:.5rem 0;background:var(--bg-panel)}' +
      '.mo-c b{display:block}.mo-p{font-style:italic;color:var(--light);font-size:var(--t0);margin:.2rem 0}' +
      '.mo-x{display:flex;flex-wrap:wrap;gap:.3rem;margin:.35rem 0}.mo-x span{font-size:var(--t0);padding:.1rem .5rem;border-radius:999px;border:1px solid var(--border)}' +
      '.mo-e{font-size:var(--t0);color:var(--muted);margin:.3rem 0 0}.mo-e strong{color:var(--indigo)}' +
      '.mo-b{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.45rem}' +
      '.mo-f label{display:block;margin:.45rem 0 .2rem;font-size:var(--t0);color:var(--muted)}.mo-f input[type=text]{width:100%}' +
      '.mo-f .mo-r{display:flex;flex-wrap:wrap;gap:.3rem .8rem}.mo-f .mo-r label{display:flex;gap:.3rem;align-items:center;margin:0;color:var(--text)}';
    document.head.appendChild(s);
  }
  function el(t, c, txt) { var e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; }
  function boto(txt, fn, cls) { var b = el('button', 'btn btn-sm ' + (cls || 'btn-ghost'), txt); b.type = 'button'; b.onclick = fn; return b; }
  function unio(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' i ' + a[a.length - 1]; }

  function lectura(caixa, m) {
    var L = MapaValor.lecturaOrgs(m);
    L.multi.forEach(function (o) {
      caixa.appendChild(el('p', 'mo-l', '🏢 ' + o.nom + ' fa ' + o.rols.length + ' rols (' + unio(o.rols) + '): si plega, se\'n van tots alhora.'));
    });
    L.compartits.forEach(function (c) {
      caixa.appendChild(el('p', 'mo-l', '⇄ «' + c.rol + '» l\'ocupen ' + unio(c.orgs) + '.'
        + (c.senseLloc.length ? ' A ' + unio(c.senseLloc) + ' li falta un posicionament propi per no ser intercanviable.' : ' Cadascuna amb el seu posicionament.')));
    });
    if (L.senseOrg.length && (m.orgs || []).length)
      caixa.appendChild(el('p', 'mo-l', '○ Ningú no ocupa ' + unio(L.senseOrg.map(function (r) { return '«' + r + '»'; })) + ': és una troballa, no un forat a amagar.'));
  }

  function targeta(caixa, o, d, op) {
    var c = el('div', 'mo-c'), noms = {};
    d.rols.forEach(function (r) { noms[r.id] = r.name; });
    c.dataset.org = o.id;
    c.appendChild(el('b', '', o.name));
    if (o.posicionament) c.appendChild(el('p', 'mo-p', o.posicionament));
    var x = el('div', 'mo-x');
    (o.roles || []).forEach(function (id) { if (noms[id]) x.appendChild(el('span', '', noms[id])); });
    c.appendChild(x);
    var e = MapaValor.escalaOrg(d.m, o.name);
    if (e) {
      var esg = MapaValor.ESCALA.filter(function (s) { return s.id === e.esglao; })[0];
      var p = el('p', 'mo-e');
      p.appendChild(el('strong', '', esg ? esg.t : 'Encara sense fitxa'));
      p.appendChild(document.createTextNode(e.seguent ? ' · per ser ' + e.t + ' falta ' + unio(e.falta) + '.' : ' · l\'escala sencera: és un node de la xarxa.'));
      c.appendChild(p);
    }
    var b = el('div', 'mo-b');
    if (MapaValor.mapaOrg(d.m, o.name)) b.appendChild(boto('🗂 El seu mapa', function () { op.obre(o.name); }));
    if (d.pot) b.appendChild(boto('✎ Edita', function () { c.replaceWith(formulari(o, d, op)); }));
    if (b.children.length) c.appendChild(b);
    caixa.appendChild(c);
  }

  function formulari(o, d, op) {
    var f = el('div', 'mo-c mo-f'), camps = {};
    function camp(k, etiqueta, ph) {
      var l = el('label', '', etiqueta), i = el('input'); i.type = 'text'; i.value = (o && o[k]) || ''; i.placeholder = ph || ''; i.dataset.camp = k;
      camps[k] = i; f.appendChild(l); f.appendChild(i);
    }
    camp('name', 'Qui és', 'El nom de l\'organització');
    camp('posicionament', 'El seu posicionament, en una frase', 'El que la fa diferent de les altres del mateix rol');
    f.appendChild(el('label', '', 'Quins rols ocupa'));
    var rr = el('div', 'mo-r'), marques = [];
    d.rols.forEach(function (r) {
      var l = el('label'), ch = el('input'); ch.type = 'checkbox'; ch.value = r.id; ch.checked = !!(o && (o.roles || []).indexOf(r.id) >= 0);
      marques.push(ch); l.appendChild(ch); l.appendChild(document.createTextNode(r.name)); rr.appendChild(l);
    });
    f.appendChild(rr);
    camp('oferta', 'La seva oferta, dita per ella', 'Què ofereix i en quines condicions');
    camp('web', 'La seva web', 'https://…');
    camp('cervell', 'El seu cervell', 'On viu el seu codex (repositori o adreça)');
    var b = el('div', 'mo-b');
    b.appendChild(boto('Desa', function () {
      var nom = camps.name.value.trim(); if (!nom) { camps.name.focus(); return; }
      var x = Object.assign({}, o || {}, { name: nom, roles: marques.filter(function (m) { return m.checked; }).map(function (m) { return m.value; }) });
      ['posicionament', 'oferta', 'web', 'cervell'].forEach(function (k) { x[k] = camps[k].value.trim(); });
      op.desa(x);
    }, 'btn-primary'));
    b.appendChild(boto('Cancel·la', function () { op.desa(null); }));
    if (o && o.id) b.appendChild(boto('Treu-la', function () { op.treu(o.id); }));
    f.appendChild(b);
    return f;
  }

  function pinta(caixa, d, op) {
    posaEstil();
    caixa.textContent = '';
    caixa.classList.add('mo');
    caixa.appendChild(el('h3', '', 'Qui ocupa els rols'));
    var orgs = d.orgs || [];
    if (!orgs.length) caixa.appendChild(el('p', 'mo-l', 'Un rol no és una organització: una mateixa casa en pot fer tres, i un rol el poden fer diverses cases. Digues qui ocupa cada rol.'));
    lectura(caixa, d.m);
    orgs.forEach(function (o) { targeta(caixa, o, d, op); });
    if (d.pot && d.rols.length) {
      var b = boto('+ Organització', function () { b.replaceWith(formulari(null, d, op)); });
      b.id = 'moNova'; caixa.appendChild(b);
    }
  }

  window.MapaOrgs = { pinta: pinta };
})();
