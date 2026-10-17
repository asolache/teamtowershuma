/* El cerebro · las fuerzas
   Cálculo puro sobre el grafo del codex, sin pintar nada: lo usa la vista en
   tres dimensiones de cerebro.html y se puede probar en Node. Es una metáfora
   medida, no física: cada número sale de las citas y los saberes del codex.

   - Gravedad: la masa de una veda es cuántas veces cita o la citan. Las vedas
     con masa atraen a las que citan, y los saberes compartidos acercan.
   - Enlaces cuánticos: dos vedas de capas distintas que no se citan pero se
     activan juntas, porque comparten saberes o citan (o las citan) las mismas.
   - Disparo: tocar una veda enciende las que cita y la citan, con menos fuerza
     a cada salto, y a la vez, sin distancia, las que tiene entrelazadas.
   - Potencial: cuánto cerebro enciende una veda al dispararse.
   - Optimización: las citas que faltan (enlaces cuánticos fuertes que aún no
     son citas) y las vedas sueltas, sin ninguna cita. */
(function (raiz, fabrica) {
  var api = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.CerebroFuerzas = api;
})(typeof self !== 'undefined' ? self : this, function () {
  /* La castellera: tres pisos donde caben las cinco capas. La base aguanta. */
  var CASTELLERA = [
    { id: 'pom', n: 'Pom de dalt', capas: ['ananda'] },
    { id: 'tronc', n: 'Tronc', capas: ['vijnana', 'mano'] },
    { id: 'pinya', n: 'Pinya', capas: ['prana', 'anna'] }
  ];
  /* Del centro hacia fuera: el propósito es el núcleo y el cuerpo, la piel. */
  var RADIO = { ananda: 0.22, vijnana: 0.44, mano: 0.63, prana: 0.81, anna: 1 };
  var DECAE = 0.5, SALTOS = 3, MAX_CUANTICOS = 3;

  function grafo(D) {
    var vec = {};
    D.nodos.forEach(function (n) { vec[n.id] = {}; });
    D.aristas.forEach(function (a) { if (vec[a[0]] && vec[a[1]]) { vec[a[0]][a[1]] = 1; vec[a[1]][a[0]] = 1; } });
    return vec;
  }

  /* Entrelazamiento entre dos vedas: saberes en común (Jaccard) más vecinos en
     común. Solo entre capas distintas y sin cita directa. */
  function cuanticos(D, vec) {
    vec = vec || grafo(D);
    var ns = D.nodos, pares = [];
    for (var i = 0; i < ns.length; i++) for (var j = i + 1; j < ns.length; j++) {
      var a = ns[i], b = ns[j];
      if (a.capa === b.capa || vec[a.id][b.id]) continue;
      var com = a.saberes.filter(function (s) { return b.saberes.indexOf(s) >= 0; });
      var uni = a.saberes.length + b.saberes.length - com.length;
      var vecinos = Object.keys(vec[a.id]).filter(function (k) { return vec[b.id][k]; });
      var f = (uni ? com.length / uni : 0) + 0.5 * vecinos.length;
      if (com.length < 2 && !vecinos.length) continue;
      pares.push({ a: a.id, b: b.id, f: Math.round(f * 100) / 100, saberes: com, vecinos: vecinos });
    }
    pares.sort(function (x, y) { return y.f - x.f || (x.a < y.a ? -1 : 1); });
    /* Cada veda guarda sus pocos enlaces más fuertes: el resto es ruido. */
    var cupo = {}, quedan = [];
    pares.forEach(function (p) {
      if ((cupo[p.a] || 0) >= MAX_CUANTICOS || (cupo[p.b] || 0) >= MAX_CUANTICOS) return;
      cupo[p.a] = (cupo[p.a] || 0) + 1; cupo[p.b] = (cupo[p.b] || 0) + 1; quedan.push(p);
    });
    return quedan;
  }

  /* El disparo: ondas por las citas y salto instantáneo por los enlaces cuánticos.
     Devuelve, por veda, la fuerza con que se enciende y en qué onda. */
  function dispara(id, vec, cuant) {
    var q = {}; cuant.forEach(function (p) { (q[p.a] = q[p.a] || []).push([p.b, p.f]); (q[p.b] = q[p.b] || []).push([p.a, p.f]); });
    var luz = {}; luz[id] = { f: 1, onda: 0, via: null };
    var frente = [id];
    for (var s = 1; s <= SALTOS && frente.length; s++) {
      var sig = [];
      frente.forEach(function (k) {
        var base = luz[k].f;
        Object.keys(vec[k]).forEach(function (m) { enciende(m, base * DECAE, s, 'cita', sig); });
        (q[k] || []).forEach(function (e) { enciende(e[0], base * DECAE * Math.min(1, e[1]), luz[k].onda, 'cuantico', sig); });
      });
      frente = sig;
    }
    function enciende(m, f, onda, via, sig) {
      if (f < 0.05 || (luz[m] && luz[m].f >= f)) return;
      luz[m] = { f: f, onda: onda, via: via }; sig.push(m);
    }
    return luz;
  }

  function analiza(D) {
    var vec = grafo(D), cuant = cuanticos(D, vec), byId = {};
    D.nodos.forEach(function (n) { byId[n.id] = n; });
    var masa = {}, potencial = {}, alcance = {};
    D.nodos.forEach(function (n) {
      masa[n.id] = Object.keys(vec[n.id]).length;
      var luz = dispara(n.id, vec, cuant), suma = 0, capas = {};
      Object.keys(luz).forEach(function (k) { if (k !== n.id) { suma += luz[k].f; capas[byId[k].capa] = 1; } });
      potencial[n.id] = Math.round(suma * 100) / 100;
      alcance[n.id] = { vedas: Object.keys(luz).length - 1, capas: Object.keys(capas).length };
    });
    var orden = function (m) { return D.nodos.slice().sort(function (a, b) { return m[b.id] - m[a.id] || a.i - b.i; }); };
    var castellera = CASTELLERA.map(function (p) {
      return { id: p.id, n: p.n, capas: p.capas, vedas: D.nodos.filter(function (n) { return p.capas.indexOf(n.capa) >= 0; }).length };
    });
    return {
      vec: vec, cuanticos: cuant, masa: masa, potencial: potencial, alcance: alcance,
      gravedad: orden(masa).slice(0, 6),
      potentes: orden(potencial).slice(0, 6),
      /* Lo que se puede optimizar, sin inventar: lo dicen las propias citas. */
      faltan: cuant.filter(function (p) { return p.vecinos.length; }).slice(0, 8),
      sueltas: D.nodos.filter(function (n) { return !masa[n.id]; }),
      castellera: castellera,
      /* Regla de los castells (build-castells.js en la matriz): la pinya crece más que el tronco. */
      aguanta: castellera[2].vedas > castellera[1].vedas && castellera[1].vedas >= castellera[0].vedas
    };
  }

  /* Posiciones en 3D: cada capa una esfera; las vedas buscan a las que citan,
     a sus entrelazadas y a las de su saber, y se separan de las demás. */
  function coloca(D, an, vueltas) {
    var sabs = [];
    D.nodos.forEach(function (n) { n.saberes.forEach(function (s) { if (sabs.indexOf(s) < 0) sabs.push(s); }); });
    var dir = {}, oro = Math.PI * (3 - Math.sqrt(5));
    sabs.forEach(function (s, i) {
      var y = 1 - 2 * (i + 0.5) / sabs.length, r = Math.sqrt(1 - y * y);
      dir[s] = [Math.cos(oro * i) * r, y, Math.sin(oro * i) * r];
    });
    var P = {};
    D.nodos.forEach(function (n) {
      var v = [0, 0, 0];
      n.saberes.forEach(function (s, k) { var w = k ? 0.5 : 1; v[0] += dir[s][0] * w; v[1] += dir[s][1] * w; v[2] += dir[s][2] * w; });
      var h = (n.n * 2654435761 % 1000) / 1000, g = ((n.n + n.id.length) * 40503 % 1000) / 1000;
      v[0] += Math.cos(h * 6.283) * 0.6; v[1] += (g - 0.5) * 0.6; v[2] += Math.sin(h * 6.283) * 0.6;
      P[n.id] = esfera(v, RADIO[n.capa] || 1);
    });
    var ns = D.nodos, links = D.aristas.map(function (a) { return [a[0], a[1], 0.06]; })
      .concat(an.cuanticos.map(function (p) { return [p.a, p.b, 0.02 * Math.min(1, p.f)]; }));
    for (var t = 0; t < (vueltas || 160); t++) {
      var F = {}; ns.forEach(function (n) { F[n.id] = [0, 0, 0]; });
      for (var i = 0; i < ns.length; i++) for (var j = i + 1; j < ns.length; j++) {
        var a = P[ns[i].id], b = P[ns[j].id], dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
        var d2 = dx * dx + dy * dy + dz * dz + 1e-4; if (d2 > 0.25) continue;
        var f = 0.0008 / d2;
        F[ns[i].id][0] += dx * f; F[ns[i].id][1] += dy * f; F[ns[i].id][2] += dz * f;
        F[ns[j].id][0] -= dx * f; F[ns[j].id][1] -= dy * f; F[ns[j].id][2] -= dz * f;
      }
      links.forEach(function (l) {
        var a = P[l[0]], b = P[l[1]]; if (!a || !b) return;
        /* La gravedad: la veda con más masa se mueve menos. */
        var ma = 1 + an.masa[l[0]], mb = 1 + an.masa[l[1]];
        for (var k = 0; k < 3; k++) { var d = (b[k] - a[k]) * l[2]; F[l[0]][k] += d * mb / (ma + mb) * 2; F[l[1]][k] -= d * ma / (ma + mb) * 2; }
      });
      ns.forEach(function (n) {
        var p = P[n.id], f = F[n.id];
        P[n.id] = esfera([p[0] + f[0], p[1] + f[1], p[2] + f[2]], RADIO[n.capa] || 1);
      });
    }
    return P;
  }
  function esfera(v, r) {
    var m = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1;
    return [v[0] / m * r, v[1] / m * r, v[2] / m * r];
  }

  return { CASTELLERA: CASTELLERA, RADIO: RADIO, grafo: grafo, cuanticos: cuanticos, dispara: dispara, analiza: analiza, coloca: coloca };
});
