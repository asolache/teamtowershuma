/* ══ RECORRIDO · de quién entra a la persona que le contesta ═══════════════
   Pedido por Álvaro (14/11/2026): «que todo fluya automatizado hasta que
   llegas a la persona con la que tienes que interactuar». Plan y auditoría:
   /mnt/project-files/producto/recorrido-perfil/auditoria-y-flujo.md.

   **Una sola pieza para todas las páginas públicas** (regla DRY del 17/10):
   la carga el pie común que escribe `SOS/tools/build-nav.js`, así que no hay
   que tocar el HTML de cada página.

   Qué hace:
   1. **El perfil.** Lee `?perfil=` (negocio, empresa, consultor, comunidad,
      cliente) y `?de=` (la marca hermana que enlaza: teamtowers, ep) y los
      recuerda en el navegador. Así, quien llega desde teamtowers.eu con su
      perfil no empieza de cero.
   2. **«Habla con una persona».** Todos los enlaces de correo `.js-mail` (había
      seis copias, una por página) abren el mismo formulario corto. Va al
      formulario Netlify `contacto`, que `submission-created.mjs` pasa a Zoho
      como lead con «Marca:» y «Perfil:» en la primera línea. Antes, un
      `mailto` suelto: no entraba en el CRM ni decía de dónde venía.
   3. **Quién contesta y cuándo**, dicho al enviar.

   Si algo falla (sin JavaScript, sin red, un bloqueador), el enlace sigue
   siendo el correo de siempre: el `mailto` que cada página ya monta.
   Sin precios. Solo tokens de la piel (build-pell.js), ningún color a mano. */
(function () {
  'use strict';
  if (window.Recorrido) return;

  var PERFILS = ['negocio', 'empresa', 'consultor', 'comunidad', 'cliente'];
  var MARQUES = { ep: 'Events Penedès', teamtowers: 'TeamTowers', huma: 'TeamTowers' };
  var CLAU = 'tt-recorrido';

  function llegeix() {
    try { return JSON.parse(localStorage.getItem(CLAU) || '{}') || {}; } catch (e) { return {}; }
  }
  function desa(o) {
    try { localStorage.setItem(CLAU, JSON.stringify(o)); } catch (e) { /* sense emmagatzematge: només aquesta visita */ }
  }

  /* El perfil d'aquesta visita: el de l'adreça mana sobre el recordat. */
  var estat = llegeix();
  try {
    var q = new URLSearchParams(location.search);
    var p = (q.get('perfil') || '').toLowerCase();
    var de = (q.get('de') || '').toLowerCase();
    if (PERFILS.indexOf(p) >= 0) estat.perfil = p;
    if (MARQUES[de]) estat.de = de;
    if (p || de) desa(estat);
  } catch (e) { /* adreça rara: seguim sense perfil */ }

  function ll() { return (document.documentElement.lang || 'es').slice(0, 2) === 'ca' ? 'ca' : 'es'; }
  var TXT = {
    es: {
      tit: 'Habla con Álvaro', intro: 'Cuéntanos en una frase qué necesitas. Te contesta una persona, no un robot.',
      nom: 'Tu nombre', mail: 'Tu correo', msg: '¿Qué necesitas?', env: 'Enviar', tanca: 'Cerrar',
      ok: 'Recibido. Te escribe Álvaro a {0}, normalmente en un día laborable.',
      ko: 'No ha salido. Escríbenos por correo:', correu: 'Abrir el correo',
      priv: 'Solo usamos tu correo para contestarte.', falta: 'Faltan tu nombre y tu correo.'
    },
    ca: {
      tit: 'Parla amb l\'Àlvar', intro: 'Explica\'ns en una frase què necessites. Et contesta una persona, no un robot.',
      nom: 'El teu nom', mail: 'El teu correu', msg: 'Què necessites?', env: 'Envia', tanca: 'Tanca',
      ok: 'Rebut. T\'escriu l\'Àlvar a {0}, normalment en un dia laborable.',
      ko: 'No ha sortit. Escriu-nos per correu:', correu: 'Obre el correu',
      priv: 'Només fem servir el teu correu per contestar-te.', falta: 'Falten el teu nom i el teu correu.'
    }
  };
  function t(k) { return TXT[ll()][k]; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); }

  var CSS = '.tt-rc{border:1px solid var(--border);border-radius:14px;padding:0;max-width:min(30rem,calc(100vw - 32px));width:100%;background:var(--card,var(--bg));color:var(--text)}'
    + '.tt-rc::backdrop{background:rgba(0,0,0,.45)}'
    + '.tt-rc form{display:grid;gap:.75rem;padding:1.25rem}'
    + '.tt-rc h2{margin:0;font-size:1.25rem}'
    + '.tt-rc p{margin:0;color:var(--muted);font-size:15px}'
    + '.tt-rc label{display:grid;gap:.25rem;font-size:15px}'
    + '.tt-rc input,.tt-rc textarea{font:inherit;font-size:16px;padding:.6rem .7rem;border:1px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text)}'
    + '.tt-rc textarea{min-height:5.5rem;resize:vertical}'
    + '.tt-rc .rc-acc{display:flex;gap:.5rem;justify-content:flex-end;flex-wrap:wrap}'
    + '.tt-rc .rc-r{color:var(--text)}'
    + '.tt-rc [hidden]{display:none}';

  var dlg = null;
  function munta() {
    if (dlg) return dlg;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    dlg = document.createElement('dialog');
    dlg.className = 'tt-rc';
    dlg.setAttribute('aria-labelledby', 'ttRcTit');
    document.body.appendChild(dlg);
    return dlg;
  }

  function pinta(o) {
    var d = munta();
    d.innerHTML = '<form method="dialog" novalidate>'
      + '<h2 id="ttRcTit">' + esc(t('tit')) + '</h2>'
      + '<p>' + esc(t('intro')) + '</p>'
      + '<label>' + esc(t('nom')) + '<input name="nom" autocomplete="name" required maxlength="120"></label>'
      + '<label>' + esc(t('mail')) + '<input name="mail" type="email" autocomplete="email" required maxlength="100"></label>'
      + '<label>' + esc(t('msg')) + '<textarea name="missatge" maxlength="2000">' + esc(o.tema ? o.tema + '. ' : '') + '</textarea></label>'
      + '<p class="rc-r" role="status" aria-live="polite"></p>'
      + '<p>' + esc(t('priv')) + '</p>'
      + '<div class="rc-acc"><button type="button" class="btn btn-ghost btn-sm rc-x">' + esc(t('tanca')) + '</button>'
      + '<button type="submit" class="btn btn-primary btn-sm">' + esc(t('env')) + '</button></div>'
      + '</form>';
    var f = d.querySelector('form'), r = d.querySelector('.rc-r');
    d.querySelector('.rc-x').addEventListener('click', function () { d.close(); });
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var nom = f.nom.value.trim(), mail = f.mail.value.trim();
      if (!nom || !/.+@.+\..+/.test(mail)) { r.textContent = t('falta'); return; }
      var dades = {
        'form-name': 'contacto', 'bot-field': '',
        nom: nom, mail: mail, missatge: f.missatge.value.trim(),
        tema: o.tema || '', perfil: estat.perfil || '', de: estat.de || '',
        marca: MARQUES[estat.de] || 'TeamTowers', pagina: location.pathname + location.hash, llengua: ll()
      };
      var btn = f.querySelector('[type=submit]'); btn.disabled = true;
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(dades).toString()
      }).then(function (res) {
        if (!res.ok) throw new Error(res.status);
        f.querySelectorAll('label,button[type=submit]').forEach(function (x) { x.hidden = true; });
        r.textContent = t('ok').replace('{0}', mail);
      }).catch(function () {
        btn.disabled = false;
        r.innerHTML = esc(t('ko')) + (o.mailto ? ' <a href="' + esc(o.mailto) + '">' + esc(t('correu')) + '</a>' : '');
      });
    });
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    f.nom.focus();
  }

  /* `contacta({ tema, mailto })`: el que usará la pantalla de «¿Qué quieres
     hacer?» (fase 2) y cualquier botón que quiera llevar a una persona. */
  function contacta(o) {
    o = o || {};
    if (!window.fetch || !window.HTMLDialogElement) { if (o.mailto) location.href = o.mailto; return false; }
    pinta(o);
    return true;
  }

  /* Las respuestas de «¿Qué quieres hacer?» (`a[data-perfil]`, en la portada):
     se recuerda la elegida, también cuando el camino sigue en otra página. */
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[data-perfil]');
    if (!a || PERFILS.indexOf(a.dataset.perfil) < 0) return;
    estat.perfil = a.dataset.perfil; desa(estat);
  }, true);

  /* Los enlaces de correo de siempre. Fase de captura: va antes que los
     scripts de cada página, que solo ponen el `href`. */
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a.js-mail, a#ctaMail');
    if (!a || ev.defaultPrevented || ev.button || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
    var href = a.getAttribute('href') || '';
    var tema = a.dataset.asunto || '';
    if (!tema && /^mailto:/.test(href)) {
      try { tema = decodeURIComponent((href.split('subject=')[1] || '').split('&')[0]); } catch (e) { tema = ''; }
    }
    if (contacta({ tema: tema, mailto: /^mailto:/.test(href) ? href : '' })) ev.preventDefault();
  }, true);

  window.Recorrido = {
    perfil: function () { return estat.perfil || ''; },
    de: function () { return estat.de || ''; },
    contacta: contacta,
    PERFILS: PERFILS
  };
})();
