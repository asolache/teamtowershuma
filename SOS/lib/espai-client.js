/* L'espai del client al portal · el que hi posa TeamTowers Humà
 * ─────────────────────────────────────────────────────────────────────────────
 * L'Àlvaro, 23/10/2026: «si lo hemos puesto en teamtowershuma es para que tenga
 * algún sentido». El portal del pas 2 és un de sol per a totes les marques
 * (acceso.teamtowershuma.com, decisió del 22/10); quan hi entra un client de
 * TeamTowers, el seu espai ha de dir el que fem aquí, no només la conversa:
 *
 *   1 · el teu camí  → en quin esglaó ets i quin és el següent. Surt de
 *                      `camiClient` d'heretat.json, el mateix que hereten tots
 *                      els cervells; el pla del portal (ficha, pagina, web) diu
 *                      l'esglaó.
 *   2 · la teva proposta → la de /cliente/#propuesta (proposta.mjs), amb la
 *                      sessió del portal: el preu no és a cap pàgina ni a cap
 *                      repositori.
 *
 * El portal no en copia res: carrega aquest fitxer de teamtowershuma.com i hi
 * crida `EspaiClient.pinta(caixa, { plan, testimoni })`. Les classes són les
 * del portal (`app-card`), perquè s'hi vegi com a casa.
 */
(function () {
  'use strict';

  /* L'esglaó d'un pla del portal, i el següent. */
  function pas(passos, plan) {
    var i = (passos || []).findIndex(function (p) { return p.portal === (plan || 'ficha'); });
    if (i < 0) i = 0;
    return { ara: passos[i] || null, despres: passos[i + 1] || null, index: i };
  }

  /* El text en la veu del client (`tu`), en la llengua que toca. */
  function veu(p, ll) { var t = (p && p.tu) || {}; return t[ll] || t.es || p[ll] || p.es || { nom: p ? p.id : '', diu: '' }; }

  var preu = function (n) { return typeof n === 'number' ? n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €' : ''; };

  if (typeof module !== 'undefined' && module.exports) { module.exports = { pas: pas, veu: veu, preu: preu }; return; }

  var BASE = (document.currentScript && document.currentScript.src) || 'https://teamtowershuma.com/SOS/lib/espai-client.js';
  var url = function (cami) { return new URL(cami, BASE).href; };

  function el(tag, at, fills) {
    var e = document.createElement(tag);
    Object.keys(at || {}).forEach(function (k) { if (at[k] != null) e.setAttribute(k, at[k]); });
    (fills || []).forEach(function (f) { if (f != null) e.append(f); });
    return e;
  }
  var targeta = function (titol, fills) { return el('div', { class: 'app-card' }, [el('h3', {}, [titol])].concat(fills)); };

  function cami(passos, plan, ll) {
    var p = pas(passos, plan), llista = el('ol', { class: 'ec-cami' }, passos.map(function (x, i) {
      var v = veu(x, ll);
      return el('li', { 'aria-current': i === p.index ? 'step' : null, 'data-fet': i < p.index ? '' : null }, [el('b', {}, [v.nom]), ' · ', v.diu]);
    }));
    var seg = p.despres ? el('p', { class: 'app-nota' }, ['El siguiente paso: ', el('b', {}, [veu(p.despres, ll).nom]), '. Escríbenos y lo preparamos juntos.']) : null;
    return targeta('Tu camino', [llista, seg]);
  }

  function proposta(r) {
    if (!r || r.estat !== 'fet') {
      return targeta('Tu propuesta', [el('p', {}, [r && r.estat === 'cap' ? 'Todavía no tienes propuesta. Cuando hablemos, la verás aquí.' : 'Ahora no llego a tu propuesta. Prueba en un rato.'])]);
    }
    var p = r.proposta;
    var files = p.linies.map(function (l) { return el('tr', {}, [el('td', {}, [l.que]), el('td', {}, [l.hores != null ? l.hores + ' h' : '']), el('td', {}, [preu(l.import)])]); });
    var taula = el('table', { class: 'ec-prop' }, [
      el('tbody', {}, files),
      el('tfoot', {}, [el('tr', {}, [el('th', {}, ['Total' + (p.iva ? ', IVA incluido' : ', sin IVA')]), el('td', {}, []), el('th', {}, [preu(p.total)])])])
    ]);
    return targeta(p.titol, [taula, p.nota ? el('p', {}, [p.nota]) : null, p.valida ? el('p', { class: 'app-nota' }, ['Válida hasta el ' + p.valida + '.']) : null]);
  }

  /* `op`: { plan, testimoni (el access_token de Supabase), llengua }. */
  var ESTIL = '.ec-cami{display:grid;gap:.5rem;padding-left:1.2rem}.ec-cami li[data-fet]{opacity:.65}.ec-cami li[aria-current]{font-weight:600}' +
    '.ec-prop{width:100%;border-collapse:collapse}.ec-prop td,.ec-prop th{padding:.35rem .25rem;border-bottom:1px solid currentColor;border-color:rgba(127,127,127,.25);text-align:left}.ec-prop td:last-child,.ec-prop th:last-child{text-align:right;white-space:nowrap}';

  async function pinta(caixa, op) {
    op = op || {};
    if (!document.getElementById('ec-estil')) document.head.append(el('style', { id: 'ec-estil' }, [ESTIL]));
    var ll = op.llengua === 'ca' ? 'ca' : 'es';
    var [h, r] = await Promise.all([
      fetch(url('../knowledge/cervell/heretat.json')).then(function (x) { return x.json(); }).catch(function () { return null; }),
      op.testimoni
        ? fetch(url('/.netlify/functions/proposta'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ portal: op.testimoni }) })
          .then(function (x) { return x.json(); }).catch(function () { return null; })
        : null
    ]);
    var passos = h && h.camiClient ? h.camiClient.passos : [];
    caixa.replaceChildren.apply(caixa, [passos.length ? cami(passos, op.plan, ll) : null, op.testimoni ? proposta(r) : null].filter(Boolean));
    return caixa;
  }

  window.EspaiClient = { pinta: pinta, pas: pas };
})();
