/* ══ CÒPIES AUTOMÀTIQUES A UNA CARPETA · el SOS de la comunitat, a l'ordinador ══
   Encàrrec de l'Álvaro (21/11/2026): «que las personas que hacen la formación
   acción tengan una herramienta para gestionar los datos de su comunidad en
   local, desde su ordenador, con un sistema de automatización de hacer copias
   de seguridad, con contraseña».

   El que ja hi havia (index.html, veda V42): la còpia de tot el SOS en un
   fitxer xifrat (PBKDF2 210k · AES-GCM) i un recordatori que la demana sola.
   El que faltava: que la còpia **es fes sola**. Un navegador no pot desar un
   fitxer on vulgui, però a l'ordinador (Chrome i Edge) sí que pot escriure en
   **una carpeta que la persona li dona una vegada**. Això és aquesta peça:

   · **Una carpeta, una vegada.** La tria la persona (millor una que ja es
     copiï sola: un disc extern, la carpeta sincronitzada de l'entitat). El
     permís es guarda; si el navegador el torna a demanar en una altra sessió,
     surt un botó «Reprèn les còpies», i res més.
   · **Sempre amb contrasenya.** La clau es deriva de la contrasenya amb la
     mateixa funció de l'app (`_kekFromPass`) i es guarda **no extraïble** en
     aquest navegador: serveix per xifrar, no es pot llegir. La contrasenya no
     es guarda enlloc. Cada fitxer és una còpia completa normal (`sos-full-
     backup`), i es restaura amb «⭱ Restaura una còpia» i la contrasenya.
   · **Només quan hi ha canvis**, com a molt una cada `CADA_MIN` minuts, i en
     tancar o amagar la pestanya si n'hi ha de pendents. Es guarden les últimes
     `GUARDA`; les més velles s'esborren de la carpeta.
   · **Sense mentir.** Si el navegador no ho permet (mòbil, Firefox, Safari), ho
     diu i el recordatori de sempre continua fent la feina. Es diu la data de
     l'última còpia escrita, mai «estàs protegit».

   L'app hi connecta les seves peces (no es dupliquen aquí):
       CopiaCarpeta.connecta({ llegeix: dbGetAll, exporta: exportBackup,
                               clau: _kekFromPass, b64: _b64u, marca: copiaMarca })
   i obre la pantalla amb CopiaCarpeta.obre().

   Node (tests): module.exports = { nomFitxer, sobren, calCopia, empremta }. */
(function (g) {
  'use strict';
  var CADA_MIN = 10;        // com a molt una còpia cada 10 minuts
  var MIRA_MS = 2 * 60e3;   // es mira si hi ha canvis cada 2 minuts
  var GUARDA = 14;          // còpies que es queden a la carpeta
  var PREFIX = 'sos-copia-';

  function dos(n) { return (n < 10 ? '0' : '') + n; }
  function nomFitxer(d) {
    d = d || new Date();
    return PREFIX + d.getFullYear() + '-' + dos(d.getMonth() + 1) + '-' + dos(d.getDate()) +
      '-' + dos(d.getHours()) + dos(d.getMinutes()) + dos(d.getSeconds()) + '.json';
  }
  /* Els noms porten la data en ordre, i per tant ordenar-los és ordenar-los
     per data. Només es toquen els fitxers d'aquesta peça. */
  function sobren(noms, guarda) {
    var meus = noms.filter(function (n) { return n.indexOf(PREFIX) === 0 && /\.json$/.test(n); }).sort();
    return meus.slice(0, Math.max(0, meus.length - (guarda || GUARDA)));
  }
  function calCopia(o) {
    if (!o || !o.empremta || o.empremta === o.ultimaEmpremta) return false;
    if (o.ara_mateix) return true;
    return !o.ultimaTs || (o.ara - o.ultimaTs) >= (o.cadaMin || CADA_MIN) * 60e3;
  }
  /* L'empremta del que hi ha: si no canvia, no cal còpia. FNV-1a sobre el JSON. */
  function empremta(registres) {
    var s = JSON.stringify(registres || []), h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return (registres || []).length + ':' + s.length + ':' + h.toString(36);
  }

  if (typeof module === 'object' && module.exports) module.exports = { nomFitxer: nomFitxer, sobren: sobren, calCopia: calCopia, empremta: empremta, GUARDA: GUARDA };
  if (typeof document === 'undefined') return;

  var POT = typeof g.showDirectoryPicker === 'function';
  var D = null;               // les peces de l'app
  var E = { carpeta: null, clau: null, sal: '', ultimaTs: 0, ultimaEmpremta: '', ultimNom: '', error: '', actiu: false };
  var rellotge = 0, enCurs = false;

  /* ── El que es recorda: una base pròpia, petita, a part de la de l'app ── */
  function bd() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open('SOS_COPIES', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('c'); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function bdFes(mode, fn) {
    return bd().then(function (db) {
      return new Promise(function (res, rej) {
        var t = db.transaction('c', mode), s = t.objectStore('c'), out = fn(s);
        t.oncomplete = function () { res(out && out.result); };
        t.onerror = function () { rej(t.error); };
      });
    });
  }
  function desa() {
    return bdFes('readwrite', function (s) {
      return s.put({ carpeta: E.carpeta, clau: E.clau, sal: E.sal, ultimaTs: E.ultimaTs, ultimaEmpremta: E.ultimaEmpremta, ultimNom: E.ultimNom }, 'estat');
    });
  }
  function llegeix() { return bdFes('readonly', function (s) { return s.get('estat'); }); }
  function oblida() { return bdFes('readwrite', function (s) { return s.delete('estat'); }); }

  function permis(demana) {
    if (!E.carpeta || !E.carpeta.queryPermission) return Promise.resolve('denied');
    var o = { mode: 'readwrite' };
    return E.carpeta.queryPermission(o).then(function (p) {
      return p === 'granted' || !demana ? p : E.carpeta.requestPermission(o);
    });
  }

  /* ── Escriure una còpia ── */
  function escriu(ara_mateix) {
    if (enCurs || !D || !E.carpeta || !E.clau) return Promise.resolve(false);
    enCurs = true;
    var registres, emp;
    return D.llegeix().then(function (all) {
      registres = all; emp = empremta(all);
      if (!calCopia({ empremta: emp, ultimaEmpremta: E.ultimaEmpremta, ultimaTs: E.ultimaTs, ara: Date.now(), ara_mateix: ara_mateix })) return false;
      return permis(false).then(function (p) {
        if (p !== 'granted') { E.actiu = false; pastilla(); return false; }
        /* La còpia en clar només viu en memòria el temps de xifrar-la. */
        return D.exporta('').then(function (b) {
          var iv = crypto.getRandomValues(new Uint8Array(12));
          return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, E.clau, new TextEncoder().encode(JSON.stringify(b.data))).then(function (ct) {
            var f = Object.assign({}, b, { enc: true, alg: 'AES-GCM-PBKDF2', iters: 210000, salt: E.sal, iv: D.b64(iv), ct: D.b64(ct) });
            delete f.data;
            var nom = nomFitxer(new Date());
            return E.carpeta.getFileHandle(nom, { create: true }).then(function (fh) {
              return fh.createWritable();
            }).then(function (w) {
              return w.write(JSON.stringify(f)).then(function () { return w.close(); });
            }).then(function () {
              E.ultimaTs = Date.now(); E.ultimaEmpremta = emp; E.ultimNom = nom; E.error = '';
              return desa().then(neteja).then(function () {
                try { if (D.marca) D.marca({ identitat: !!b.hasIdentity, total: b.count }); } catch (e) { /* el recordatori és seu */ }
                return true;
              });
            });
          });
        });
      });
    }).catch(function (e) {
      E.error = (e && (e.msg || e.message)) || String(e);
      return false;
    }).then(function (r) { enCurs = false; pinta(); return r; });
  }
  function neteja() {
    if (!E.carpeta.values) return Promise.resolve();
    var noms = [];
    var it = E.carpeta.values();
    function seg() {
      return it.next().then(function (x) {
        if (x.done) return;
        if (x.value.kind === 'file') noms.push(x.value.name);
        return seg();
      });
    }
    return seg().then(function () {
      return Promise.all(sobren(noms).map(function (n) { return E.carpeta.removeEntry(n).catch(function () {}); }));
    }).catch(function () {});
  }

  function engega() {
    E.actiu = true;
    clearInterval(rellotge);
    rellotge = setInterval(function () { escriu(false); }, MIRA_MS);
    pastilla();
    return escriu(false);
  }

  /* ── Arrencada: si ja hi havia carpeta, es continua sense demanar res ── */
  function connecta(deps) {
    D = deps;
    if (!POT || !g.indexedDB) return;
    /* Uns segons de marge: la base de l'app s'obre en arrencar. */
    setTimeout(function () {
      llegeix().then(function (r) {
        if (!r || !r.carpeta || !r.clau) return;
        Object.assign(E, r);
        return permis(false).then(function (p) { if (p === 'granted') engega(); else pastilla(); });
      }).catch(function () {});
    }, 4000);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden' && E.actiu) escriu(true);
    });
  }

  /* Quan el navegador ha oblidat el permís (una sessió nova), un sol botó. */
  function pastilla() {
    var p = document.getElementById('tt-cc-p');
    if (E.actiu || !E.carpeta || !E.clau) { if (p) p.remove(); return; }
    if (p) return;
    css();
    p = document.createElement('button');
    p.id = 'tt-cc-p'; p.type = 'button'; p.className = 'tt-cc-p';
    p.textContent = '📁 Reprèn les còpies automàtiques';
    p.onclick = function () {
      permis(true).then(function (r) { if (r === 'granted') { p.remove(); engega(); } else obre(); });
    };
    document.body.appendChild(p);
  }

  /* ── La pantalla ── */
  function css() {
    if (document.getElementById('tt-cc-css')) return;
    var s = document.createElement('style');
    s.id = 'tt-cc-css';
    s.textContent = [
      '.tt-cc{max-width:min(94vw,34rem);border:1px solid var(--border);border-radius:14px;background:var(--card);color:var(--text);padding:1rem 1.1rem}',
      '.tt-cc::backdrop{background:rgba(0,0,0,.45)}',
      '.tt-cc h2{margin:.1rem 0 .4rem;font-size:1.15rem}.tt-cc p{margin:.35rem 0;font-size:var(--t0,15px);line-height:1.45}',
      '.tt-cc .tt-cc-e{background:var(--panel);border-radius:10px;padding:.55rem .7rem;margin:.5rem 0;font-size:var(--t0,15px)}',
      '.tt-cc label{display:block;font-size:var(--t0,15px);margin:.45rem 0 .15rem;color:var(--light)}',
      '.tt-cc input{width:100%;box-sizing:border-box;padding:.5rem .6rem;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font:inherit}',
      '.tt-cc .tt-cc-b{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.8rem}',
      '.tt-cc button{font:inherit;cursor:pointer;border-radius:999px;padding:.45rem .9rem;border:1px solid var(--border);background:var(--card);color:var(--text)}',
      '.tt-cc button.pri{background:var(--indigo);border-color:var(--indigo);color:var(--on-accent)}',
      '.tt-cc .tt-cc-m{min-height:1.2em;font-size:var(--t0,15px);color:var(--orange)}',
      '.tt-cc-p{position:fixed;right:.6rem;bottom:.6rem;z-index:85;font:600 var(--t0,15px)/1.2 inherit;cursor:pointer;border-radius:999px;padding:.5rem .85rem;',
      '  border:1px solid var(--indigo);background:var(--card);color:var(--text);box-shadow:0 2px 10px rgba(0,0,0,.12)}'
    ].join('\n');
    document.head.appendChild(s);
  }
  var dlg = null;
  function quan(ts) {
    if (!ts) return 'encara cap';
    var d = new Date(ts);
    return d.toLocaleDateString('ca', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('ca', { hour: '2-digit', minute: '2-digit' });
  }
  function pinta() {
    if (!dlg || !dlg.open) return;
    var b = dlg.querySelector('#ccCos'), h = '';
    if (!POT) {
      h = '<div class="tt-cc-e">⚠ <strong>Aquest navegador no deixa escriure en una carpeta.</strong> Passa en el mòbil, a Firefox i a Safari. ' +
        'Obre el SOS a l\'ordinador amb <strong>Chrome o Edge</strong> per tenir les còpies automàtiques. Mentrestant, el recordatori de la còpia continua demanant-la quan toca.</div>';
    } else if (E.carpeta && E.clau) {
      h = '<div class="tt-cc-e">📁 Carpeta: <strong>' + esc(E.carpeta.name || '') + '</strong><br>' +
        (E.actiu ? '✅ Actives: una còpia xifrada quan hi ha canvis, com a molt cada ' + CADA_MIN + ' minuts. Es guarden les últimes ' + GUARDA + '.'
          : '⏸ Aturades en aquesta sessió: el navegador torna a demanar permís per a la carpeta.') +
        '<br>Última còpia escrita: <strong>' + esc(quan(E.ultimaTs)) + '</strong>' + (E.ultimNom ? ' · <code>' + esc(E.ultimNom) + '</code>' : '') +
        (E.error ? '<br>⚠ L\'últim intent ha fallat: ' + esc(E.error) : '') + '</div>' +
        '<p>Per restaurar-ne una: <strong>Còpia de seguretat → ⭱ Restaura una còpia</strong>, tria el fitxer de la carpeta i posa la contrasenya.</p>' +
        '<div class="tt-cc-b">' + (E.actiu ? '<button class="pri" id="ccAra">💾 Fes-ne una ara</button>' : '<button class="pri" id="ccRep">▶ Reprèn les còpies</button>') +
        '<button id="ccNo">Atura i oblida la carpeta</button><button id="ccTanca">Tanca</button></div>';
    } else {
      h = '<p>Tria una carpeta de l\'ordinador —millor una que ja es copiï sola: un disc extern o la carpeta sincronitzada de l\'entitat— i una contrasenya. A partir d\'aquí, cada canvi al SOS deixa una còpia xifrada a la carpeta, sense que te n\'hagis de recordar.</p>' +
        '<label for="ccP1">Contrasenya de les còpies (8 caràcters o més)</label><input id="ccP1" type="password" autocomplete="new-password">' +
        '<label for="ccP2">Repeteix-la</label><input id="ccP2" type="password" autocomplete="new-password">' +
        '<p style="font-size:var(--t0,15px);color:var(--muted)">No es guarda enlloc. Sense ella les còpies no s\'obren: apunta-la on la comunitat guarda les coses importants.</p>' +
        '<div class="tt-cc-b"><button class="pri" id="ccTria">📁 Tria la carpeta i activa</button><button id="ccTanca">Tanca</button></div>';
    }
    if (!POT) h += '<div class="tt-cc-b"><button id="ccTanca">Tanca</button></div>';
    b.innerHTML = h + '<div class="tt-cc-m" id="ccMsg" role="status"></div>';
    var q = function (id) { return b.querySelector('#' + id); }, msg = function (t) { q('ccMsg').textContent = t; };
    if (q('ccTanca')) q('ccTanca').onclick = function () { dlg.close(); };
    if (q('ccAra')) q('ccAra').onclick = function () { msg('Escrivint…'); escriu(true).then(function (ok) { if (!E.error) msg(ok ? '' : 'No hi ha canvis des de l\'última còpia.'); }); };
    if (q('ccRep')) q('ccRep').onclick = function () { permis(true).then(function (r) { if (r === 'granted') engega().then(pinta); else msg('Sense permís per a la carpeta no es pot escriure.'); }); };
    if (q('ccNo')) q('ccNo').onclick = function () {
      clearInterval(rellotge);
      E = { carpeta: null, clau: null, sal: '', ultimaTs: 0, ultimaEmpremta: '', ultimNom: '', error: '', actiu: false };
      oblida().then(function () { pastilla(); pinta(); });
    };
    if (q('ccTria')) q('ccTria').onclick = function () {
      var p1 = q('ccP1').value, p2 = q('ccP2').value;
      if (p1.length < 8) return msg('La contrasenya ha de tenir 8 caràcters o més.');
      if (p1 !== p2) return msg('Les dues contrasenyes no coincideixen.');
      if (!D) return msg('Obre aquesta pantalla des de l\'app del SOS.');
      g.showDirectoryPicker({ id: 'sos-copies', mode: 'readwrite' }).then(function (dir) {
        msg('Preparant la clau…');
        return D.clau(p1).then(function (k) {
          Object.assign(E, { carpeta: dir, clau: k.kek, sal: k.salt, ultimaTs: 0, ultimaEmpremta: '', ultimNom: '', error: '' });
          return desa();
        }).then(function () { return engega(); }).then(function () { pinta(); });
      }).catch(function (e) { if (!e || e.name !== 'AbortError') msg('No s\'ha pogut: ' + ((e && e.message) || e)); });
    };
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function obre() {
    css();
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'tt-cc'; dlg.setAttribute('aria-labelledby', 'ccTitol');
      dlg.innerHTML = '<h2 id="ccTitol">📁 Còpies automàtiques a l\'ordinador</h2><div id="ccCos"></div>';
      document.body.appendChild(dlg);
    }
    if (!dlg.open) dlg.showModal();
    pinta();
  }

  g.CopiaCarpeta = { connecta: connecta, obre: obre, pot: POT, estat: function () { return Object.assign({}, E, { carpeta: E.carpeta ? E.carpeta.name : '' , clau: !!E.clau }); }, ara: function () { return escriu(true); } };
})(typeof window !== 'undefined' ? window : globalThis);
