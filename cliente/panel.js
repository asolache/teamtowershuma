/* El panel de Álvaro · /cliente/#panel
   ─────────────────────────────────────────────────────────────────────────
   Álvaro (05/11/2026): «haz que se puedan añadir desde mi panel». Se carga
   solo con #panel (no pesa en el espacio de nadie). Habla con
   netlify/functions/convidats.mjs con el testimonio de gestión
   (IA_CIERRE_TOKEN), que se escribe una vez y se queda en este aparato.

   · La IA: si está activa (y si no, por qué), lo de hoy y lo del mes.
   · Sus invitados: añadir, cambiar el tope, copiar el enlace, enlace nuevo,
     quitar; y cómo va cada espacio (en cifras, nunca el texto del dibujo). */
(function () {
    'use strict';
    var CT = 'tt.panel.clau', F = '/.netlify/functions/convidats', caixa = document.getElementById('panel');
    if (!caixa) return;
    var clau = ''; try { clau = localStorage.getItem(CT) || ''; } catch (e) { clau = ''; }
    var D = null, edita = null, msg = '', proj = '*';

    function el(tag, at, fills) {
        var n = document.createElement(tag);
        Object.keys(at || {}).forEach(function (k) { if (at[k] === true) n.setAttribute(k, ''); else if (at[k] != null && at[k] !== false) n.setAttribute(k, at[k]); });
        [].concat(fills == null ? [] : fills).forEach(function (f) { if (f != null) n.appendChild(typeof f === 'string' ? document.createTextNode(f) : f); });
        return n;
    }
    function boto(tx, fn, cls) { var b = el('button', { type: 'button', class: 'btn ' + (cls || 'btn-ghost') }, tx); b.addEventListener('click', fn); return b; }
    var usd = function (v) { return (Number(v) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $'; };
    var dia = function (s) { return s ? new Date(s).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }) : ''; };

    function crida(metode, cos, q) {
        return fetch(F + (q || ''), { method: metode, headers: { Authorization: 'Bearer ' + clau, 'Content-Type': 'application/json' }, body: cos ? JSON.stringify(cos) : undefined })
            .then(function (r) {
                if (r.status === 404) throw new Error('clau');
                return r.json().then(function (j) { if (!r.ok) throw new Error(j.motiu || 'No se ha podido'); return j; });
            });
    }
    function carrega() {
        return crida('GET').then(function (j) { D = j; pinta(); }).catch(function (e) {
            if (e.message === 'clau') { clau = ''; try { localStorage.removeItem(CT); } catch (x) { /* sin memoria */ } msg = 'Esa clave no entra. Comprueba IA_CIERRE_TOKEN.'; }
            else msg = e.message;
            pinta();
        });
    }
    function copia(tx, b) {
        var fet = function () { var v = b.textContent; b.textContent = 'Copiado ✓'; setTimeout(function () { b.textContent = v; }, 1800); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(tx).then(fet, function () { window.prompt('Copia el enlace:', tx); });
        else window.prompt('Copia el enlace:', tx);
    }

    function entrada(c) {
        c.appendChild(el('p', {}, 'Escribe la clave del panel (el valor de IA_CIERRE_TOKEN en Netlify). Se guarda solo en este aparato.'));
        var w = el('div', { class: 'camp' }), i = el('input', { id: 'pn-clau', type: 'password', autocomplete: 'current-password' });
        w.appendChild(el('label', { for: 'pn-clau' }, 'Clave del panel')); w.appendChild(i); c.appendChild(w);
        var a = el('div', { class: 'accions' });
        a.appendChild(boto('Entrar', function () { clau = i.value.trim(); if (!clau) return; try { localStorage.setItem(CT, clau); } catch (e) { /* sin memoria */ } msg = ''; carrega(); }, 'btn-primary'));
        c.appendChild(a);
    }

    function estatIA(c) {
        var ia = D.ia || {}, s = el('div', { class: 'pn-ia' });
        s.appendChild(el('h3', {}, 'La IA de los espacios'));
        s.appendChild(el('p', { class: ia.actiu ? 'pn-si' : 'pn-no' }, ia.actiu ? '● Activa' : '● Apagada: ' + (ia.motiu || 'sin motivo')));
        if (ia.actiu) {
            s.appendChild(el('p', {}, 'Hoy: ' + usd(D.dia.usd) + ' de ' + usd(ia.topeDia) + ' para toda la web. Este mes: ' + usd(D.mes.usd) + ' entre ' + D.mes.persones + ' personas.'));
            s.appendChild(el('p', { class: 'nota' }, 'Cada persona que entra con su correo tiene ' + usd(ia.tope) + '. Tus invitados, el tope que les pongas aquí (hasta 10 $), si entran por su enlace.'));
        }
        c.appendChild(s);
    }

    var CAMPS = [['mail', 'Su correo', 'email'], ['nom', 'Su nombre'], ['tope', 'Tope de IA ($)', 'number'], ['org', 'Su organización'], ['web', 'Su web de ahora'],
        ['pie', 'La otra web que va en su pie'], ['pieNom', 'El nombre de esa web'], ['para', 'El saludo («Hola, …»)'], ['nota', 'Nota para ti']];
    function formulari(c) {
        var x = edita || {}, p = x.params || {}, f = el('form', { class: 'pn-form' }), g = el('div', { class: 'camps dos' });
        f.appendChild(el('h3', {}, x.mail ? 'Cambiar a ' + (x.nom || x.mail) : 'Nuevo invitado'));
        CAMPS.forEach(function (k) {
            var v = k[0] in p ? p[k[0]] : x[k[0]], w = el('div', { class: 'camp' }), i = el('input', { id: 'pn-' + k[0], name: k[0], type: k[2] || 'text', value: v == null ? (k[0] === 'tope' ? '2' : '') : String(v) });
            if (k[0] === 'mail' && x.mail) i.readOnly = true;
            if (k[0] === 'tope') { i.min = '0.5'; i.max = '10'; i.step = '0.5'; }
            w.appendChild(el('label', { for: 'pn-' + k[0] }, k[1])); w.appendChild(i); g.appendChild(w);
        });
        f.appendChild(g);
        var lp = el('label', { class: 'cl-priv' }), ck = el('input', { type: 'checkbox', id: 'pn-procesos' }); ck.checked = p.procesos === 'programas' || !x.mail;
        lp.appendChild(ck); lp.appendChild(el('span', {}, ' Da cursos o programas (salen en su barra desde el principio)')); f.appendChild(lp);
        var a = el('div', { class: 'accions' }), b = el('button', { type: 'submit', class: 'btn btn-primary' }, x.mail ? 'Guardar' : 'Añadir y crear su enlace');
        a.appendChild(b);
        if (x.mail) a.appendChild(boto('Cancelar', function () { edita = null; pinta(); }));
        f.appendChild(a);
        f.addEventListener('submit', function (e) {
            e.preventDefault();
            var v = function (k) { return f.querySelector('#pn-' + k).value.trim(); };
            b.disabled = true;
            crida('PUT', { mail: v('mail'), nom: v('nom'), tope: v('tope'), nota: v('nota'),
                params: { org: v('org'), web: v('web'), pie: v('pie'), pieNom: v('pieNom'), para: v('para') || v('nom'), procesos: ck.checked ? 'programas' : '' } })
                .then(function (j) { edita = null; msg = 'Listo: ' + (j.convidat.nom || j.convidat.mail) + '. Copia su enlace y pégalo a mano en tu correo.'; return carrega(); })
                .catch(function (er) { b.disabled = false; msg = er.message; pinta(); });
        });
        c.appendChild(f);
    }

    function fitxa(x) {
        var li = el('li', { class: 'pn-conv', id: idDe(x), tabindex: '-1' }), e = x.espai, gast = Math.min(100, Math.round(100 * (x.gastat || 0) / (x.tope || 1)));
        li.appendChild(el('h4', {}, (x.nom || x.mail) + (x.params && x.params.org ? ' · ' + x.params.org : '')));
        li.appendChild(el('p', { class: 'nota' }, x.mail + (x.nota ? ' · ' + x.nota : '')));
        var b = el('span', { class: 'barra-e', role: 'meter', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(gast), 'aria-label': 'IA gastada' }), i = el('i'); i.style.width = gast + '%'; b.appendChild(i);
        var ia = el('p', { class: 'pn-gast' }); ia.appendChild(b); ia.appendChild(document.createTextNode(' IA: ' + usd(x.gastat) + ' de ' + usd(x.tope) + (x.voltes ? ' · ' + x.voltes + ' vueltas' : '') + (x.ultim ? ' · última, ' + dia(x.ultim) : '')));
        li.appendChild(ia);
        li.appendChild(el('p', {}, x.entrat ? 'Entró por su enlace el ' + dia(x.entrat) + '.' : 'Todavía no ha entrado por su enlace.'));
        if (e) li.appendChild(el('p', {}, 'Su espacio: ' + [e.persones + ' en su mapa', e.programes + ' programas', e.formularis == null ? 'formularios de partida' : e.formularis + ' formularios', e.disseny ? 'estructura revisada' : 'estructura sin revisar'].join(' · ') + (e.actualitzada ? '. Último cambio, ' + dia(e.actualitzada) + '.' : '.')));
        else li.appendChild(el('p', { class: 'nota' }, 'Su espacio aún no está guardado con su cuenta.'));
        var a = el('div', { class: 'accions' }), cp = boto('Copiar su enlace', function () { copia(x.enllac, cp); }, 'btn-primary btn-sm');
        a.appendChild(cp);
        a.appendChild(boto('Cambiar', function () { edita = x; pinta(); var f = caixa.querySelector('.pn-form'); if (f) f.scrollIntoView({ block: 'start' }); }, 'btn-ghost btn-sm'));
        a.appendChild(boto('Enlace nuevo', function () {
            if (!window.confirm('El enlace que tiene dejará de funcionar. ¿Hacemos uno nuevo?')) return;
            crida('PUT', { mail: x.mail, nou: true }).then(function () { msg = 'Enlace nuevo para ' + (x.nom || x.mail) + '. Mándaselo.'; return carrega(); }).catch(function (er) { msg = er.message; pinta(); });
        }, 'btn-ghost btn-sm'));
        a.appendChild(boto('Quitar', function () {
            if (!window.confirm('¿Quitar a ' + (x.nom || x.mail) + '? Su enlace dejará de funcionar. Su mapa no se borra.')) return;
            crida('DELETE', null, '?mail=' + encodeURIComponent(x.mail)).then(function () { msg = 'Quitado.'; return carrega(); }).catch(function (er) { msg = er.message; pinta(); });
        }, 'btn-ghost btn-sm'));
        li.appendChild(a);
        return li;
    }

    /* El tablero de clientes (11/11/2026): «que vaya también en el iPhone».
       Cada invitado es una tarjeta en su fase. La fase la pone él con las
       flechas; si no la ha puesto, sale de lo que ha hecho (si ya hay gente
       en su mapa, «Haciendo su mapa»). En el móvil las columnas se deslizan
       de lado y los botones de arriba llevan a cada una. */
    var FASES = [['invitado', 'Invitado'], ['mapa', 'Haciendo su mapa'], ['propuesta', 'Propuesta enviada'], ['marcha', 'En marcha'], ['entregado', 'Entregado']];
    function faseDe(x) { return x.fase || (x.espai && x.espai.persones ? 'mapa' : 'invitado'); }
    function idDe(x) { return 'pn-c-' + String(x.mail).replace(/[^a-z0-9]+/gi, '-'); }
    function mou(x, f) {
        var abans = x.fase; x.fase = f; pinta();
        var t = caixa.querySelector('[data-mail="' + x.mail + '"] button'); if (t) t.focus({ preventScroll: true });
        var cl = document.getElementById('pn-col-' + f); if (cl && window.matchMedia('(max-width: 899px)').matches) cl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        crida('PUT', { mail: x.mail, fase: f }).catch(function (er) { x.fase = abans; msg = 'No se ha movido: ' + er.message; pinta(); });
    }
    function tauler(c) {
        var per = {}; FASES.forEach(function (f) { per[f[0]] = []; });
        D.convidats.forEach(function (x) { per[faseDe(x)].push(x); });
        c.appendChild(el('h3', { id: 'pn-t-tauler' }, 'Tus clientes'));
        var xips = el('div', { class: 'pn-xips', role: 'group', 'aria-label': 'Ir a una fase' });
        FASES.forEach(function (f) {
            xips.appendChild(boto(f[1] + ' · ' + per[f[0]].length, function () { var cl = document.getElementById('pn-col-' + f[0]); if (cl) cl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' }); }, 'pn-xip'));
        });
        c.appendChild(xips);
        var t = el('div', { class: 'pn-tauler', 'aria-labelledby': 'pn-t-tauler' });
        FASES.forEach(function (f, i) {
            var col = el('section', { class: 'pn-col', id: 'pn-col-' + f[0], 'aria-label': f[1] });
            col.appendChild(el('h4', {}, [el('span', {}, f[1]), el('b', {}, String(per[f[0]].length))]));
            if (!per[f[0]].length) col.appendChild(el('p', { class: 'nota' }, 'Nadie.'));
            per[f[0]].forEach(function (x) {
                var e = x.espai, k = el('article', { class: 'pn-k', 'data-mail': x.mail });
                k.appendChild(el('b', {}, x.nom || x.mail));
                if (x.params && x.params.org) k.appendChild(el('span', {}, x.params.org));
                var on = [x.entrat ? 'entró el ' + dia(x.entrat) : 'sin entrar'];
                if (e && e.persones) on.push(e.persones + ' en su mapa');
                if (e && e.actualitzada) on.push('último cambio ' + dia(e.actualitzada));
                k.appendChild(el('small', {}, on.join(' · ')));
                var a = el('div', { class: 'pn-ka' });
                if (i < FASES.length - 1) a.appendChild(boto(FASES[i + 1][1] + ' →', function () { mou(x, FASES[i + 1][0]); }, 'btn-primary btn-sm'));
                if (i > 0) { var ba = boto('←', function () { mou(x, FASES[i - 1][0]); }, 'btn-ghost btn-sm'); ba.setAttribute('aria-label', 'Volver a «' + FASES[i - 1][1] + '»'); a.appendChild(ba); }
                a.appendChild(boto('Tareas', function () { proj = x.mail; pinta(); var b = document.getElementById('pn-tasques'); if (b) b.scrollIntoView({ block: 'start' }); }, 'btn-ghost btn-sm'));
                a.appendChild(boto('Ficha', function () { var li = document.getElementById(idDe(x)); if (li) { li.scrollIntoView({ block: 'start' }); li.focus({ preventScroll: true }); } }, 'btn-ghost btn-sm'));
                k.appendChild(a); col.appendChild(k);
            });
            t.appendChild(col);
        });
        c.appendChild(t);
    }

    /* Tu backlog de todo (13/11/2026, SOS/lib/kanban.js). Álvaro: «con una
       lógica fractal debería poderme conectar y ver mi Kanban filtrado siempre».
       Un árbol: tus tareas arriba y, colgando, el tablero de cada cliente (el
       mismo que ve ella en /cliente/). «Todo» los junta; elegir un proyecto lo
       filtra. Lo que cambias aquí vuelve al tablero de donde salió; lo nuevo
       en «Todo» o en «Lo mío» es tuyo. */
    function arbre() {
        return { id: '', projecte: 'Lo mío', kanban: D.meu || { cards: [] },
            fills: D.convidats.filter(function (x) { return x.kanban; }).map(function (x) { return { id: x.mail, projecte: (x.params && x.params.org) || x.nom || x.mail, kanban: x.kanban }; }) };
    }
    function tasques(c) {
        var K = window.Kanban; if (!K) return;
        var box = el('section', { id: 'pn-tasques', class: 'pn-tasques', 'aria-labelledby': 'pn-t-tasques' });
        box.appendChild(el('h3', { id: 'pn-t-tasques' }, 'Tu backlog de todo'));
        var a = arbre(), fonts = [a].concat(a.fills);
        if (proj !== '*' && !fonts.some(function (x) { return x.id === proj; })) proj = '*';
        var w = el('div', { class: 'camp' }), sel = el('select', { id: 'pn-proj' });
        sel.appendChild(el('option', { value: '*' }, 'Todo'));
        fonts.forEach(function (x) { sel.appendChild(el('option', { value: x.id }, x.projecte + ' · ' + ((x.kanban && x.kanban.cards) || []).length)); });
        sel.value = proj;
        sel.addEventListener('change', function () { proj = sel.value; pinta(); });
        w.appendChild(el('label', { for: 'pn-proj' }, 'Proyecto')); w.appendChild(sel); box.appendChild(w);
        var tot = proj === '*', src = tot ? null : fonts.filter(function (x) { return x.id === proj; })[0];
        var cards = tot ? K.ajunta([a]) : ((src.kanban && src.kanban.cards) || []), font = {}, nomP = {};
        if (tot) cards.forEach(function (x) { font[x.id] = x._font; nomP[x.id] = x._projecte.replace(/^Lo mío › /, ''); });
        var cont = el('div'); box.appendChild(cont); c.appendChild(box);
        K.pinta(cont, { kanban: { cards: cards }, jo: 'equipo', llengua: 'es', prefix: 'pn-tarea-', pomoClau: 'tt.panel.pomo',
            persones: [{ id: 'equipo', nom: 'Yo' }, { id: 'cliente', nom: 'El cliente' }, { id: 'maquina', nom: 'La máquina' }],
            projecte: tot ? function (x) { return nomP[x.id] || ''; } : null,
            onCanvi: function (k) {
                /* Cada tarjeta vuelve a su tablero; las nuevas, al tuyo. */
                var per = {};
                (tot ? fonts : [src]).forEach(function (x) { per[x.id] = { cards: [], fora: k.fora || [] }; });
                k.cards.forEach(function (x) { var f = tot ? (font[x.id] || '') : src.id; (per[f] || per[''] || (per[f] = { cards: [], fora: [] })).cards.push(x); });
                Object.keys(per).forEach(function (f) {
                    var x = fonts.filter(function (y) { return y.id === f; })[0];
                    if (tot && x && JSON.stringify(K.neteja(x.kanban).cards) === JSON.stringify(per[f].cards) && !(k.fora || []).length) return;
                    crida('PUT', f ? { mail: f, kanban: per[f] } : { kanban: per[f] }).then(function (j) {
                        if (f) { var cv = D.convidats.filter(function (y) { return y.mail === f; })[0]; if (cv) cv.kanban = j.kanban; } else D.meu = j.kanban;
                    }).catch(function (er) { msg = 'No se ha guardado: ' + er.message; pinta(); });
                    /* Mientras llega, lo que ves ya es lo nuevo. */
                    if (f) { var cv = D.convidats.filter(function (y) { return y.mail === f; })[0]; if (cv) cv.kanban = per[f]; } else D.meu = per[f];
                });
            } });
        var sense = D.convidats.filter(function (x) { return !x.kanban; }).length;
        if (sense) box.appendChild(el('p', { class: 'nota' }, sense + (sense === 1 ? ' cliente aún no tiene' : ' clientes aún no tienen') + ' su espacio guardado con su cuenta: su tablero aparecerá aquí cuando entre por su enlace.'));
    }

    function pinta() {
        var c = caixa.querySelector('.pn-cos'); c.textContent = '';
        if (msg) c.appendChild(el('p', { class: 'pn-msg', role: 'status' }, msg));
        if (!clau) { entrada(c); return; }
        if (!D) { c.appendChild(el('p', {}, 'Cargando…')); return; }
        tauler(c);
        tasques(c);
        estatIA(c);
        c.appendChild(el('h3', {}, 'Tus invitados (' + D.convidats.length + ')'));
        if (!D.convidats.length) c.appendChild(el('p', { class: 'nota' }, 'Todavía ninguno.'));
        var ul = el('ul', { class: 'pn-llista' }); D.convidats.forEach(function (x) { ul.appendChild(fitxa(x)); }); c.appendChild(ul);
        var vell = (D.variable || []).filter(function (m) { return !D.convidats.some(function (x) { return x.mail === m; }); });
        if (vell.length) c.appendChild(el('p', { class: 'nota' }, 'En la variable IA_INVITATS de Netlify (lo de antes): ' + vell.join(', ') + '. Añádelos aquí para darles su enlace; luego puedes vaciar la variable.'));
        formulari(c);
        c.appendChild(el('div', { class: 'accions' }, [boto('Actualizar', function () { msg = ''; carrega(); }), boto('Salir del panel', function () { clau = ''; D = null; try { localStorage.removeItem(CT); } catch (e) { /* sin memoria */ } pinta(); })]));
    }
    pinta();
    if (clau) carrega();
})();
