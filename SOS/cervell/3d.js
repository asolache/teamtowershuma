/* El cerebro en tres dimensiones · las cinco koshas como esferas
   Un lienzo 2D con perspectiva hecha a mano: sin librerías, sin CDN, ligero en
   el móvil. Los cálculos (gravedad, enlaces cuánticos, disparo) están en
   forces.js; aquí solo se pinta y se toca. */
(function (raiz) {
  var F = raiz.CerebroFuerzas;

  function Cerebro3D(lienzo, op) {
    var cx = lienzo.getContext('2d'), css = getComputedStyle(lienzo);
    var tono = function (v, alt) { return (css.getPropertyValue(v) || '').trim() || alt; };
    var C = {
      tinta: tono('--ink', tono('--text', '#1c1a16')), apagado: tono('--muted', '#5e594d'), papel: tono('--surface', tono('--card', '#fff')),
      brahma: tono('--brahma-luz', '#eab308'), vishnu: tono('--vishnu-luz', '#2563eb'), shiva: tono('--shiva-luz', '#16a34a')
    };
    var kc = {}; ['anna', 'prana', 'mano', 'vijnana', 'ananda'].forEach(function (k) { kc[k] = tono('--k-' + k, '#888'); });
    var quieto = raiz.matchMedia && raiz.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var D, an, P, byId, sel = null, encima = null, luz = null, t0 = 0, vivo = false, raf = 0;
    var cam = { yaw: 0.6, pitch: -0.35, dist: 3.1 }, W = 0, H = 0, ppp = 1, proy = {}, ultimo = 0;

    function monta(datos, analisis) {
      D = datos; an = analisis; P = F.coloca(D, an); byId = {};
      D.nodos.forEach(function (n) { byId[n.id] = n; });
      if (sel && !byId[sel]) sel = null; luz = null; pinta();
    }
    function mide() {
      var r = lienzo.getBoundingClientRect(); ppp = Math.min(2, raiz.devicePixelRatio || 1);
      W = r.width; H = r.height; lienzo.width = Math.round(W * ppp); lienzo.height = Math.round(H * ppp);
    }
    function gira(p) {
      var cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
      var x = p[0] * cy - p[2] * sy, z = p[0] * sy + p[2] * cy, y = p[1] * cp - z * sp;
      z = p[1] * sp + z * cp;
      var e = Math.min(W, H) * 1.15 / (z + cam.dist);
      return { x: W / 2 + x * e, y: H / 2 - y * e, z: z, e: e };
    }
    function alfa(z) { return Math.max(0.15, Math.min(1, 0.75 - z * 0.45)); }

    function pinta(ahora) {
      if (!D || !W) return;
      ahora = ahora || performance.now();
      cx.setTransform(ppp, 0, 0, ppp, 0, 0); cx.clearRect(0, 0, W, H);
      /* Las esferas de cada kosha, del cuerpo (fuera) al propósito (dentro). */
      var c0 = gira([0, 0, 0]);
      Object.keys(F.RADIO).forEach(function (k) {
        cx.beginPath(); cx.arc(c0.x, c0.y, F.RADIO[k] * c0.e, 0, 6.2832);
        cx.strokeStyle = kc[k]; cx.globalAlpha = 0.28; cx.lineWidth = 1; cx.setLineDash([2, 5]); cx.stroke();
      });
      cx.setLineDash([]);
      proy = {}; D.nodos.forEach(function (n) { proy[n.id] = gira(P[n.id]); });
      var vecSel = sel ? an.vec[sel] : null, fase = (ahora - t0) / 1000;
      var encendida = function (id) {
        if (!luz || !luz[id]) return 0;
        var t = fase - luz[id].onda * 0.45; if (t < 0) return 0;
        return luz[id].f * Math.max(0, 1 - Math.max(0, t - 1.2) / 2.5);
      };
      /* Las citas: líneas finas; las de la veda elegida, en azul (Vishnu sostiene). */
      D.aristas.forEach(function (a) {
        var p = proy[a[0]], q = proy[a[1]]; if (!p || !q) return;
        var on = sel && (a[0] === sel || a[1] === sel), l = Math.min(encendida(a[0]), encendida(a[1]));
        cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(q.x, q.y);
        cx.strokeStyle = l ? C.brahma : on ? C.vishnu : C.apagado;
        cx.globalAlpha = l ? 0.4 + l * 0.6 : on ? 0.9 : sel ? 0.08 : 0.22 * alfa((p.z + q.z) / 2);
        cx.lineWidth = on || l ? 1.8 : 1; cx.stroke();
      });
      /* Los enlaces cuánticos: curvas punteadas en verde (Shiva transforma). */
      cx.setLineDash([3, 4]); cx.lineDashOffset = quieto ? 0 : -ahora / 60;
      an.cuanticos.forEach(function (e) {
        var p = proy[e.a], q = proy[e.b]; if (!p || !q) return;
        var on = sel && (e.a === sel || e.b === sel), l = Math.min(encendida(e.a), encendida(e.b));
        if (sel && !on && !l) return;
        cx.beginPath(); cx.moveTo(p.x, p.y);
        cx.quadraticCurveTo((p.x + q.x) / 2 + (q.y - p.y) * 0.2, (p.y + q.y) / 2 - (q.x - p.x) * 0.2, q.x, q.y);
        cx.strokeStyle = C.shiva; cx.globalAlpha = l ? 0.5 + l * 0.5 : on ? 0.85 : 0.12 + 0.1 * Math.min(1, e.f);
        cx.lineWidth = on || l ? 1.6 : 1; cx.stroke();
      });
      cx.setLineDash([]);
      /* Las vedas, de la más lejana a la más cercana. El tamaño es su masa. */
      var orden = D.nodos.slice().sort(function (a, b) { return proy[b.id].z - proy[a.id].z; });
      var q = sel ? cuantDe(sel) : null;
      orden.forEach(function (n) {
        var p = proy[n.id], r = (2.2 + Math.min(an.masa[n.id], 8) * 0.8) * p.e / 180, l = encendida(n.id);
        var cerca = !sel || n.id === sel || vecSel[n.id] || q[n.id];
        if (l) {
          cx.beginPath(); cx.arc(p.x, p.y, r + 4 + l * 10, 0, 6.2832);
          cx.fillStyle = C.brahma; cx.globalAlpha = 0.25 * l; cx.fill();
        }
        cx.beginPath(); cx.arc(p.x, p.y, Math.max(2, r), 0, 6.2832);
        cx.fillStyle = kc[n.capa]; cx.globalAlpha = (cerca || l ? 1 : 0.15) * alfa(p.z); cx.fill();
        if (n.id === sel || n.privado || n.fijada) {
          cx.lineWidth = n.id === sel ? 2.5 : 1.4; cx.strokeStyle = C.tinta; cx.globalAlpha = cerca ? 1 : 0.3;
          if (n.privado) cx.setLineDash([2, 2]);
          cx.stroke(); cx.setLineDash([]);
        }
      });
      cx.globalAlpha = 1;
      [sel, encima].forEach(function (id, i) {
        if (!id || !proy[id] || (i && id === sel)) return;
        var p = proy[id], n = byId[id], txt = n.n + ' · ' + n.t;
        if (txt.length > 48) txt = txt.slice(0, 46) + '…';
        cx.font = '600 12px "Space Grotesk", system-ui, sans-serif';
        var w = cx.measureText(txt).width, x = p.x + 12 + w > W - 6 ? p.x - 12 - w : p.x + 12;
        cx.lineWidth = 3; cx.strokeStyle = C.papel; cx.strokeText(txt, x, p.y - 8);
        cx.fillStyle = C.tinta; cx.fillText(txt, x, p.y - 8);
      });
    }
    function cuantDe(id) {
      var o = {}; an.cuanticos.forEach(function (e) { if (e.a === id) o[e.b] = e; if (e.b === id) o[e.a] = e; }); return o;
    }

    /* El bucle solo corre cuando la vista está abierta y la pestaña a la vista. */
    function bucle(ahora) {
      raf = 0; if (!vivo || document.hidden) return;
      var dt = Math.min(50, ahora - (ultimo || ahora)); ultimo = ahora;
      if (!quieto && !arrastre && !sel) cam.yaw += dt * 0.00012;
      pinta(ahora);
      raf = raiz.requestAnimationFrame(bucle);
    }
    function activa(si) {
      vivo = si; if (si) { mide(); ultimo = 0; if (!raf) raf = raiz.requestAnimationFrame(bucle); }
    }
    document.addEventListener('visibilitychange', function () { if (vivo && !document.hidden && !raf) raf = raiz.requestAnimationFrame(bucle); });
    raiz.addEventListener('resize', function () { if (vivo) { mide(); pinta(); } });

    function cercano(e) {
      var r = lienzo.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, mejor = null, md = 18 * 18;
      Object.keys(proy).forEach(function (k) {
        var p = proy[k], d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y);
        if (d < md && (!mejor || p.z < proy[mejor].z + 0.2 || d < md)) { md = d; mejor = k; }
      });
      return mejor;
    }
    var arrastre = null;
    lienzo.addEventListener('pointerdown', function (e) { arrastre = { x: e.clientX, y: e.clientY, yaw: cam.yaw, pitch: cam.pitch, movido: false }; });
    raiz.addEventListener('pointermove', function (e) {
      if (!arrastre) { if (e.target === lienzo) { var k = cercano(e); if (k !== encima) { encima = k; lienzo.style.cursor = k ? 'pointer' : 'grab'; if (quieto) pinta(); } } return; }
      var dx = e.clientX - arrastre.x, dy = e.clientY - arrastre.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) arrastre.movido = true;
      cam.yaw = arrastre.yaw + dx * 0.008;
      cam.pitch = Math.max(-1.4, Math.min(1.4, arrastre.pitch + dy * 0.008));
      if (quieto) pinta();
    });
    raiz.addEventListener('pointerup', function (e) {
      var a = arrastre; arrastre = null; if (!a || a.movido || e.target !== lienzo) return;
      var k = cercano(e); if (k) op.alElegir(k); else { sel = null; op.alElegir(null); pinta(); }
    });
    raiz.addEventListener('pointercancel', function () { arrastre = null; });
    lienzo.addEventListener('wheel', function (e) { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); zoom(e.deltaY > 0 ? 1.12 : 1 / 1.12); }, { passive: false });
    lienzo.addEventListener('keydown', function (e) {
      var m = { ArrowLeft: [-0.15, 0], ArrowRight: [0.15, 0], ArrowUp: [0, -0.15], ArrowDown: [0, 0.15] }[e.key];
      if (m) { e.preventDefault(); cam.yaw += m[0]; cam.pitch = Math.max(-1.4, Math.min(1.4, cam.pitch + m[1])); pinta(); }
      if ((e.key === 'Enter' || e.key === ' ') && sel) { e.preventDefault(); dispara(sel); }
    });

    function zoom(f) { cam.dist = Math.max(1.4, Math.min(6, cam.dist * f)); pinta(); }
    function centra() { cam = { yaw: 0.6, pitch: -0.35, dist: 3.1 }; pinta(); }
    function selecciona(id) { sel = id && byId[id] ? id : null; pinta(); }
    function dispara(id) {
      if (!byId[id]) return null;
      sel = id; luz = F.dispara(id, an.vec, an.cuanticos); t0 = performance.now(); pinta();
      return luz;
    }
    return { monta: monta, activa: activa, selecciona: selecciona, dispara: dispara, zoom: zoom, centra: centra };
  }
  raiz.Cerebro3D = Cerebro3D;
})(window);
