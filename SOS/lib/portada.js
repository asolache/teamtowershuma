/* ══ PORTADA PER PERFIL · una pantalla, una idea (14/11/2026) ═══════════════
   Àlvaro: «aplicar més la pantalla següent en funció de l'usuari i no posar
   tant de rotllo a sota; no som ni molt Apple, ni molt Amazon, ni molt Claude».

   La portada ja no és un rotllo de quinze pantalles:
     1. la pel·lícula del flux de valor (lib/mapa-anima.js);
     2. «Què vols fer?»: les cinc portes de recorrido.js, en gran;
     3. en triar-ne una, la pantalla d'aquell perfil: el seu camí (CAMINS de
        recorrido.js, el mateix que surt a la barra de cada pàgina), la seva
        crida, i només les seccions que li parlen.
   No s'esborra res: tota la resta queda a l'HTML (cercadors, sense JS) i
   torna amb «Mira-ho tot». «Ja treballo amb vosaltres» va directe al seu
   espai, com abans. El perfil es recorda amb Recorrido.tria. */
(function () {
  'use strict';
  var H = document.documentElement;
  /* Quines seccions de la portada parlen a cada perfil (pels seus id). */
  var SEC = {
    negocio: ['avantatges', 'cami', 'automatitza', 'com'],
    empresa: ['avantatges', 'serveis', 'enfoc', 'decideix', 'confianca'],
    consultor: ['intelligencia', 'dues-vistes', 'decideix', 'serveis'],
    comunidad: ['enfoc', 'dues-vistes', 'confianca', 'serveis']
  };
  var T = {
    ca: { per: { negocio: 'El teu negoci, dibuixat en cinc minuts. I la web i el que va sol, després.',
        empresa: 'El teu equip veient el mateix flux, i acordant on millorar-lo.',
        consultor: 'El mètode i l\'eina, per fer-ho tu amb els teus clients.',
        comunidad: 'La teva comunitat, organitzada com una xarxa que es cuida.' },
      cami: 'El teu camí', canvia: '← Una altra porta', tot: 'Mira-ho tot ↓', amaga: 'Torna a la versió curta ↑',
      tria: 'Tria una porta i et mostro només el que et serveix.' },
    es: { per: { negocio: 'Tu negocio, dibujado en cinco minutos. Y la web y lo que va solo, después.',
        empresa: 'Tu equipo viendo el mismo flujo, y acordando dónde mejorarlo.',
        consultor: 'El método y la herramienta, para hacerlo tú con tus clientes.',
        comunidad: 'Tu comunidad, organizada como una red que se cuida.' },
      cami: 'Tu camino', canvia: '← Otra puerta', tot: 'Míralo todo ↓', amaga: 'Vuelve a la versión corta ↑',
      tria: 'Elige una puerta y te enseño solo lo que te sirve.' }
  };
  var CSS = '.pt-pant{padding:3rem 0 1rem}.pt-pant[hidden]{display:none}.pt-box{max-width:46rem;margin:0 auto;padding:0 16px;text-align:center}'
    + '.pt-k{margin:0 0 .4rem;font-family:var(--mono);font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}'
    + '.pt-h{margin:0 0 1.6rem;font-size:clamp(1.6rem,4.4vw,2.6rem);line-height:1.15;letter-spacing:-.01em}'
    + '.pt-cami{list-style:none;margin:0 0 1.6rem;padding:0;display:flex;flex-wrap:wrap;justify-content:center;gap:.6rem}'
    + '.pt-cami li{display:flex;align-items:center;gap:.5rem;padding:.55rem .9rem;border:1px solid var(--border);border-radius:999px;background:var(--card)}'
    + '.pt-cami b{display:grid;place-items:center;width:1.5rem;height:1.5rem;border-radius:50%;background:var(--green);color:#fff;font-size:.8rem}'
    + '.pt-cami a{color:var(--text);text-decoration:none}.pt-acc{display:flex;flex-wrap:wrap;justify-content:center;gap:.6rem;margin:0}'
    + '.pt-tria{margin:0;text-align:center;color:var(--muted)}.pt-peu{text-align:center;padding:2.5rem 16px}';
  function ll() { return H.lang === 'es' ? 'es' : 'ca'; }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  var nav, hero, pant, peu, perfil = '';
  function R() { return window.Recorrido; }

  function mostra(p) {
    perfil = SEC[p] ? p : '';
    if (perfil && R()) R().tria(perfil);
    H.setAttribute('data-perfil', perfil);
    [].forEach.call(document.querySelectorAll('main > .pt-vis'), function (s) { s.classList.remove('pt-vis'); });
    (SEC[perfil] || []).forEach(function (id) { var s = document.getElementById(id); if (s) s.classList.add('pt-vis'); });
    if (nav) [].forEach.call(nav.querySelectorAll('a[data-perfil]'), function (a) { a.setAttribute('aria-current', a.getAttribute('data-perfil') === perfil ? 'true' : 'false'); });
    pinta();
  }
  /* La pantalla del perfil: una frase, el camí en passos i la seva crida. */
  function pinta() {
    var L = ll(), t = T[L], k = L === 'ca' ? 1 : 0;
    pant.textContent = '';
    if (!perfil) { pant.appendChild(el('p', 'pt-tria', t.tria)); pant.hidden = false; return; }
    var c = (R() && R().CAMINS[perfil]) || [], a = nav && nav.querySelector('a[data-perfil="' + perfil + '"]');
    var box = el('div', 'pt-box');
    box.appendChild(el('p', 'pt-k', (R() ? R().NOMS[perfil][k] : '')));
    box.appendChild(el('h2', 'pt-h', t.per[perfil]));
    var ol = el('ol', 'pt-cami'); ol.setAttribute('aria-label', t.cami);
    c.forEach(function (pas, i) {
      var li = el('li'), b = el('b', null, i + 1);
      li.appendChild(b);
      if (pas.a) { var x = el('a', null, pas[L]); x.href = pas.a; li.appendChild(x); }
      else { var y = el('a', 'js-mail', pas[L]); y.href = '#'; y.addEventListener('click', function (ev) { ev.preventDefault(); if (R()) R().contacta({ tema: pas[L] }); }); li.appendChild(y); }
      ol.appendChild(li);
    });
    box.appendChild(ol);
    var acc = el('p', 'pt-acc');
    if (a) { var go = el('a', 'btn-primary', (c[0] && c[0][L] ? c[0][L] : a.textContent) + ' →'); go.href = a.getAttribute('href'); acc.appendChild(go); }
    var bk = el('a', 'btn-ghost', t.canvia); bk.href = '#inici';
    bk.addEventListener('click', function () { mostra(''); });
    acc.appendChild(bk);
    box.appendChild(acc);
    pant.appendChild(box); pant.hidden = false;
  }
  function peuTot() {
    var t = T[ll()], b = el('button', 'btn-ghost pt-tot', H.classList.contains('pt-tot') ? t.amaga : t.tot);
    b.type = 'button';
    b.addEventListener('click', function () { H.classList.toggle('pt-tot'); peu.textContent = ''; peu.appendChild(peuTot()); if (!H.classList.contains('pt-tot')) hero.scrollIntoView(); });
    return b;
  }
  function engega() {
    hero = document.getElementById('inici');
    nav = hero && hero.querySelector('.hero-perfils');
    if (!hero || !nav) { H.classList.remove('pt'); return; }
    var st = el('style'); st.textContent = CSS; document.head.appendChild(st);
    pant = el('section', 'pt-pant'); pant.id = 'per'; pant.setAttribute('aria-live', 'polite');
    hero.parentNode.insertBefore(pant, hero.nextSibling);
    peu = el('div', 'pt-peu container');
    var fi = document.querySelector('main > .cta-final');
    if (fi) fi.parentNode.insertBefore(peu, fi); else hero.parentNode.appendChild(peu);
    peu.appendChild(peuTot());
    nav.addEventListener('click', function (ev) {
      var a = ev.target.closest && ev.target.closest('a[data-perfil]');
      if (!a || !SEC[a.getAttribute('data-perfil')]) return; // «cliente» va al seu espai
      ev.preventDefault(); mostra(a.getAttribute('data-perfil'));
      pant.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    mostra(R() ? R().perfil() : '');
    new MutationObserver(function () { pinta(); peu.textContent = ''; peu.appendChild(peuTot()); }).observe(H, { attributes: true, attributeFilter: ['lang'] });
  }
  /* Després de DOMContentLoaded: recorrido.js (al peu) ja s'ha carregat. */
  if (document.readyState === 'complete') engega(); else document.addEventListener('DOMContentLoaded', engega);
})();
