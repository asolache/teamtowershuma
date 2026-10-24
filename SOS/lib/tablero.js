/* El tauler de comandament · una sola peça per a SOS i Events Penedès.
   L'estructura és la del tauler d'Events Penedès (la referència): pestanyes
   agrupades per capes (operativa, tàctica, estratègia), cada una amb el seu
   enllaç real i el seu comptador. Els colors són les variables de la pell de
   qui la carrega (--border, --muted, --light, --indigo, --mono): no porta paleta.
   Navegador: window.Tablero. Node: require(). */
(function (g) {
'use strict';
/* Capes de SOS. Cada vista existent té un lloc i només un; les rutes són les
   de l'app (#/…), així que cada pestanya s'obre en fred des de qualsevol mòbil. */
const SOS = [
  { capa: 'Operativa', grups: [
    { grup: 'Dia a dia', items: [
      { href: '#/tauler', label: 'El meu dia', id: 'avui' },
      { href: '#/', label: 'Tasques', id: 'tasques' }] }] },
  { capa: 'Tàctica', grups: [
    { grup: 'Xarxa', items: [
      { href: '#/gent', label: 'Gent', id: 'gent' },
      { href: '#/aprop', label: 'A prop', id: 'aprop' },
      { href: '#/directori', label: 'Directori', id: 'directori' }] }] },
  { capa: 'Estratègia', grups: [
    { grup: 'Territori i valor', items: [
      { href: '#/territoris', label: 'Territoris', id: 'territoris' },
      { href: '#/fons', label: 'Fons', id: 'fons' },
      { href: '#/fons/impacte', label: 'Impacte', id: 'impacte' },
      { href: '#/fons/pla', label: 'Pla', id: 'pla' }] }] }
];
const CSS = '.tb-nav{display:flex;flex-wrap:wrap;gap:.35rem 1.1rem;align-items:flex-end;margin:0;padding:1rem 1.75rem .6rem;border-bottom:1px solid var(--border)}'
  + '.tb-capa{display:flex;flex-direction:column;gap:.2rem}'
  + '.tb-k{font-family:var(--mono,monospace);font-size:var(--t0,.9375rem);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}'
  + '.tb-g{display:flex;gap:.3rem;flex-wrap:wrap}'
  + '.tb-a{display:inline-flex;align-items:center;gap:.35rem;min-height:44px;padding:0 .85rem;border:1px solid var(--border);border-radius:999px;color:var(--light);text-decoration:none;font-size:var(--t0,.9375rem)}'
  + '.tb-a:hover,.tb-a:focus-visible{border-color:var(--indigo);color:var(--indigo)}'
  + '.tb-a[aria-current=page]{border-color:var(--indigo);background:var(--indigo);color:var(--bg)}'
  + '.tb-a b{font-weight:600;font-size:var(--t0,.9375rem);padding:0 .4rem;border-radius:999px;background:var(--border);color:var(--light)}'
  + '@media(max-width:620px){.tb-nav{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}.tb-capa{flex:none}.tb-g{flex-wrap:nowrap}}';
function estil(doc) {
  if (!doc || doc.getElementById('tb-css')) return;
  const s = doc.createElement('style'); s.id = 'tb-css'; s.textContent = CSS; doc.head.appendChild(s);
}
/* Llista plana d'ítems: la fa servir la guarda per comprovar que cap vista es queda sense lloc. */
function items(capes) {
  const r = [];
  (capes || []).forEach(c => c.grups.forEach(gr => gr.items.forEach(it => r.push(Object.assign({ capa: c.capa, grup: gr.grup }, it)))));
  return r;
}
/* nav(capes, {actual, compta, doc}) → <nav>. `actual` és el hash de la vista
   oberta; `compta` diu el número d'una pestanya pel seu id (0 o res = sense número). */
function nav(capes, o) {
  o = o || {};
  const doc = o.doc || g.document; estil(doc);
  const n = doc.createElement('nav'); n.className = 'tb-nav'; n.setAttribute('aria-label', o.label || 'Tauler');
  (capes || []).forEach(c => {
    const cp = doc.createElement('div'); cp.className = 'tb-capa';
    c.grups.forEach(gr => {
      const k = doc.createElement('span'); k.className = 'tb-k'; k.textContent = gr.grup; cp.appendChild(k);
      const fila = doc.createElement('div'); fila.className = 'tb-g';
      gr.items.forEach(it => {
        const a = doc.createElement('a'); a.className = 'tb-a'; a.href = it.href; a.dataset.id = it.id;
        a.textContent = it.label;
        if (o.actual === it.href) a.setAttribute('aria-current', 'page');
        let x = 0; try { x = o.compta ? o.compta(it.id) : 0; } catch (e) { x = 0; }
        if (x) { const b = doc.createElement('b'); b.textContent = x; a.appendChild(b); }
        fila.appendChild(a);
      });
      cp.appendChild(fila);
    });
    cp.title = c.capa;
    n.appendChild(cp);
  });
  return n;
}
const Tablero = { SOS, nav, items, estil };
if (typeof module !== 'undefined' && module.exports) module.exports = Tablero;
else g.Tablero = Tablero;
})(typeof window !== 'undefined' ? window : globalThis);
