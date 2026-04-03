// =============================================================================
// TEAMTOWERS SOS V10.1 — VNA SEQUENCER
// Ruta: /ia/dev/js/core/VnaSequencer.js
//
// Asigna sequence_order (1..N) y depends_on[] a cada exchange de un VnaNetwork.
// El Orquestador usa esta información para ejecutar WOs en el orden correcto,
// respetando dependencias y maximizando la ejecución paralela.
//
// Algoritmo: Kahn's Algorithm (topological sort por BFS)
//   1. Construir grafo dirigido nodo → exchanges que lo consumen
//   2. Calcular in-degree de cada exchange (cuántos exchanges lo "bloquean")
//   3. Procesar en capas BFS — cada capa es una "ronda de ejecución paralela"
//   4. Payments siempre al final (post-procesamiento)
//   5. Asignar sequence_order único y secuencial dentro del orden de capas
//
// Reglas de dependencia:
//   - Si exchange A produce nodo X (A.to === X) y exchange B consume nodo X
//     (B.from === X), entonces B depende de A (B.depends_on incluye A.id)
//   - Exchanges que salen del mismo nodo origen son independientes entre sí
//   - Exchanges de categoría 'payment' se colocan siempre al final
//
// Inmutabilidad: VnaSequencer NUNCA muta la red original. Devuelve copia nueva.
// =============================================================================

export class VnaSequencer {

    // ══════════════════════════════════════════════════════════════════════════
    //  sequence — punto de entrada principal
    //  Entrada:  VnaNetwork JSON-LD (no mutado)
    //  Salida:   nueva VnaNetwork con sequence_order y depends_on en exchanges
    //            + sequencing_meta con algoritmo, health_score y ciclos
    // ══════════════════════════════════════════════════════════════════════════
    static sequence(network) {
        // Deep copy — inmutabilidad garantizada
        const net = JSON.parse(JSON.stringify(network));

        if (!net.exchanges || net.exchanges.length === 0) {
            return {
                ...net,
                exchanges: [],
                sequencing_meta: {
                    algorithm:    'kahn-bfs',
                    health_score: 1.0,
                    cycles:       [],
                    layers:       [],
                    total:        0
                }
            };
        }

        // ── Paso 1: Detectar ciclos antes de ordenar ──────────────────────────
        const cycles = VnaSequencer._findCycles(net.exchanges);

        // ── Paso 2: Calcular depends_on por exchange ──────────────────────────
        // Regla: si ex_A.to === ex_B.from → ex_B depende de ex_A
        const dependsOnMap = VnaSequencer._buildDependsOnMap(net.exchanges);

        // ── Paso 3: Separar payments del flujo principal ──────────────────────
        const payments    = net.exchanges.filter(e => e.category === 'payment');
        const nonPayments = net.exchanges.filter(e => e.category !== 'payment');

        // ── Paso 4: Kahn's BFS sobre nonPayments ─────────────────────────────
        const layers = VnaSequencer._kahnSort(nonPayments, dependsOnMap, cycles);

        // ── Paso 5: Añadir payments al final como última capa ─────────────────
        if (payments.length > 0) {
            layers.push(payments.map(p => p.id));
        }

        // ── Paso 6: Asignar sequence_order (1..N) y depends_on a cada exchange ─
        let counter = 1;
        const orderMap   = {};  // exchangeId → sequence_order
        const depsMap    = {};  // exchangeId → depends_on[]

        layers.forEach((layer, layerIdx) => {
            layer.forEach(exId => {
                orderMap[exId] = counter++;
                // depends_on = exchanges de capas anteriores que este exchange necesita
                depsMap[exId]  = dependsOnMap[exId] || [];
            });
        });

        // ── Paso 7: Enriquecer los exchanges en la copia ─────────────────────
        const enriched = net.exchanges.map(ex => ({
            ...ex,
            sequence_order:       orderMap[ex.id] || counter++,
            depends_on:           depsMap[ex.id]  || [],
            can_start_immediately: (depsMap[ex.id]?.length || 0) === 0
        }));

        // Ordenar el array por sequence_order para consistencia
        enriched.sort((a, b) => a.sequence_order - b.sequence_order);

        // ── Paso 8: Calcular health_score ─────────────────────────────────────
        const healthScore = VnaSequencer._calcHealthScore(enriched, cycles, net.nodes || []);

        return {
            ...net,
            exchanges: enriched,
            sequencing_meta: {
                algorithm:    'kahn-bfs',
                health_score: healthScore,
                cycles,
                layers,
                total:        enriched.length,
                parallel_rounds: layers.length,
                payment_count:   payments.length
            }
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  detectCycles — API pública para detectar ciclos en el grafo
    //  Devuelve array de arrays: cada sub-array es un ciclo (IDs de exchanges)
    // ══════════════════════════════════════════════════════════════════════════
    static detectCycles(network) {
        if (!network?.exchanges?.length) return [];
        return VnaSequencer._findCycles(network.exchanges);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  _buildDependsOnMap — construye el mapa de dependencias
    //  Para cada exchange B, determina qué exchanges A deben completarse antes.
    //  Regla: si A.to === B.from entonces B.depends_on incluye A.id
    // ══════════════════════════════════════════════════════════════════════════
    static _buildDependsOnMap(exchanges) {
        const map = {};

        // Inicializar todos a array vacío
        exchanges.forEach(ex => { map[ex.id] = []; });

        // Para cada exchange B, buscar exchanges A donde A.to === B.from
        exchanges.forEach(exB => {
            exchanges.forEach(exA => {
                if (exA.id === exB.id) return; // no auto-dependencia
                // Si el nodo destino de A es el nodo origen de B → B depende de A
                if (exA.to === exB.from) {
                    // Evitar duplicados
                    if (!map[exB.id].includes(exA.id)) {
                        map[exB.id].push(exA.id);
                    }
                }
            });
        });

        return map;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  _kahnSort — Kahn's Algorithm (BFS topological sort)
    //  Agrupa exchanges en capas: cada capa puede ejecutarse en paralelo.
    //  Los exchanges sin dependencias pendientes van primero.
    //  Devuelve: array de capas, cada capa es array de exchange IDs.
    // ══════════════════════════════════════════════════════════════════════════
    static _kahnSort(exchanges, dependsOnMap, cycles) {
        if (exchanges.length === 0) return [];

        // IDs en ciclos — tratarlos con in-degree 0 para no bloquear el sort
        const cycleIds = new Set(cycles.flat());

        // Calcular in-degree de cada exchange (cuántos predecesores tiene)
        const inDegree = {};
        exchanges.forEach(ex => {
            const deps = (dependsOnMap[ex.id] || [])
                .filter(depId => exchanges.some(e => e.id === depId)); // solo dentro del subconjunto
            inDegree[ex.id] = cycleIds.has(ex.id) ? 0 : deps.length;
        });

        const layers   = [];
        const visited  = new Set();
        const remaining = new Set(exchanges.map(e => e.id));

        while (remaining.size > 0) {
            // Capa actual: exchanges con in-degree 0 no visitados
            const layer = [...remaining].filter(id => inDegree[id] === 0);

            if (layer.length === 0) {
                // Quedan exchanges con dependencias circulares — añadir el de menor in-degree
                const fallback = [...remaining].sort((a, b) => inDegree[a] - inDegree[b]);
                layer.push(fallback[0]);
            }

            // Ordenar dentro de la capa: determinista (por id string)
            layer.sort();
            layers.push(layer);

            // Marcar como visitados y reducir in-degree de sus dependientes
            layer.forEach(id => {
                visited.add(id);
                remaining.delete(id);
                // Reducir in-degree de exchanges que dependen de este
                exchanges.forEach(ex => {
                    if ((dependsOnMap[ex.id] || []).includes(id)) {
                        inDegree[ex.id] = Math.max(0, (inDegree[ex.id] || 0) - 1);
                    }
                });
            });
        }

        return layers;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  _findCycles — detecta ciclos usando DFS con coloración (blanco/gris/negro)
    //  Solo reporta ciclos donde TODOS los exchanges son tangibles.
    //  Los ciclos que incluyen exchanges intangibles (feedback, trust, knowledge)
    //  son feedback loops válidos en un VNA — no son errores de dependencia.
    //  Devuelve array de ciclos problemáticos (solo tangibles), cada uno es array de IDs.
    // ══════════════════════════════════════════════════════════════════════════
    static _findCycles(exchanges) {
        const allCycles = [];
        const color     = {};
        const exMap     = {};

        exchanges.forEach(ex => { color[ex.id] = 'white'; exMap[ex.id] = ex; });

        // Grafo dirigido: A → exchanges que dependen de A (A.to === B.from)
        const adj = {};
        exchanges.forEach(ex => { adj[ex.id] = []; });
        exchanges.forEach(exB => {
            exchanges.forEach(exA => {
                if (exA.to === exB.from && exA.id !== exB.id) {
                    adj[exA.id].push(exB.id);
                }
            });
        });

        const dfs = (id, path) => {
            color[id] = 'gray';
            path.push(id);

            for (const neighbor of (adj[id] || [])) {
                if (color[neighbor] === 'gray') {
                    const cycleStart = path.indexOf(neighbor);
                    const cycle      = path.slice(cycleStart);
                    const cycleKey   = [...cycle].sort().join(',');
                    if (!allCycles.some(c => [...c].sort().join(',') === cycleKey)) {
                        allCycles.push([...cycle]);
                    }
                } else if (color[neighbor] === 'white') {
                    dfs(neighbor, path);
                }
            }

            path.pop();
            color[id] = 'black';
        };

        exchanges.forEach(ex => {
            if (color[ex.id] === 'white') dfs(ex.id, []);
        });

        // Filtrar: solo ciclos REALMENTE problemáticos.
        // No reportar si el ciclo incluye:
        //   - exchanges intangibles (feedback loops VNA válidos)
        //   - exchanges de categoría payment (flujos bidireccionales normales: servicio↔pago)
        const EXEMPT_CATS = new Set(['knowledge','trust','feedback','collaboration','payment']);
        return allCycles.filter(cycle => {
            return cycle.every(exId => {
                const ex = exMap[exId];
                if (!ex) return false;
                // Excluir ciclos que contienen intangibles o payments
                return ex.type === 'tangible' && !EXEMPT_CATS.has(ex.category);
            });
        });
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  _calcHealthScore — score 0.0-1.0 de la calidad del VNA secuenciado
    //  Penaliza: ciclos, roles aislados, exchanges sin depends_on lógico
    // ══════════════════════════════════════════════════════════════════════════
    static _calcHealthScore(enrichedExchanges, cycles, nodes) {
        let score = 1.0;

        // Penalizar ciclos (-0.15 por ciclo, máx -0.45)
        const cyclePenalty = Math.min(cycles.length * 0.15, 0.45);
        score -= cyclePenalty;

        // Penalizar si más del 50% son can_start_immediately
        // (significa red plana sin estructura de dependencias)
        const immediateRatio = enrichedExchanges.length > 0
            ? enrichedExchanges.filter(e => e.can_start_immediately).length / enrichedExchanges.length
            : 0;
        if (immediateRatio > 0.8 && enrichedExchanges.length > 3) {
            score -= 0.1; // red demasiado plana
        }

        // Verificar reciprocidad: nodos que solo emiten o solo reciben
        if (nodes.length > 0) {
            const emitters  = new Set(enrichedExchanges.map(e => e.from));
            const receivers = new Set(enrichedExchanges.map(e => e.to));
            const isolated  = nodes.filter(n => !emitters.has(n.id) && !receivers.has(n.id));
            score -= Math.min(isolated.length * 0.05, 0.2);
        }

        return Number(Math.max(0, Math.min(1, score)).toFixed(3));
    }
}
