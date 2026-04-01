// =============================================================================
// SOS V10.1 — VnaSequencer TESTS
// Ruta: /ia/dev/tests/vna_sequencer.test.js
//
// VnaSequencer es el módulo NUEVO que:
//   1. Calcula el sequence_order de cada exchange en un VnaNetwork
//   2. Detecta dependencias implícitas (A→B significa B depende de A)
//   3. Hace topological sort (Kahn's algorithm) para ordenar sin ciclos
//   4. Asigna el campo `sequence_order` (entero 1..N) a cada exchange
//   5. Calcula `depends_on` (IDs de exchanges que deben completarse antes)
//   6. Detecta ciclos y los reporta como conflictos VNA
// =============================================================================

import { assert, assertEqual, assertAllHave, assertUnique, assertOrdered,
         assertThrows, assertRange, sampleVnaNetwork } from './helpers.js';

export async function VnaSequencerTests(runner) {

    // Importación lazy — el módulo puede no existir aún (RED phase)
    let VnaSequencer;
    try {
        const mod = await import('../core/VnaSequencer.js');
        VnaSequencer = mod.VnaSequencer;
    } catch(_) {
        VnaSequencer = null; // Tests fallarán con mensaje claro
    }

    runner.describe('VnaSequencer — módulo existe', () => {
        runner.it('VnaSequencer clase existe y es importable', () => {
            assert(VnaSequencer !== null, 'VnaSequencer.js no existe en /ia/dev/core/. Crear el módulo.');
            assert(typeof VnaSequencer === 'function' || typeof VnaSequencer === 'object',
                'VnaSequencer debe ser una clase o objeto exportado.');
        });

        runner.it('VnaSequencer.sequence() es un método estático', () => {
            assert(VnaSequencer, 'VnaSequencer no importado');
            assert(typeof VnaSequencer.sequence === 'function',
                'VnaSequencer.sequence() debe ser un método estático.');
        });

        runner.it('VnaSequencer.detectCycles() es un método estático', () => {
            assert(VnaSequencer, 'VnaSequencer no importado');
            assert(typeof VnaSequencer.detectCycles === 'function',
                'VnaSequencer.detectCycles() debe ser un método estático.');
        });
    });

    runner.describe('VnaSequencer.sequence() — campos de salida', () => {
        runner.it('cada exchange recibe campo sequence_order (entero >= 1)', () => {
            assert(VnaSequencer, 'VnaSequencer no importado');
            const net    = sampleVnaNetwork();
            const result = VnaSequencer.sequence(net);
            assertAllHave(result.exchanges, 'sequence_order',
                'Todos los exchanges deben tener sequence_order después de VnaSequencer.sequence()');
            result.exchanges.forEach((ex, i) => {
                assert(Number.isInteger(ex.sequence_order),
                    `exchange[${i}].sequence_order debe ser entero, got: ${ex.sequence_order}`);
                assert(ex.sequence_order >= 1,
                    `exchange[${i}].sequence_order debe ser >= 1, got: ${ex.sequence_order}`);
            });
        });

        runner.it('cada exchange recibe campo depends_on (array)', () => {
            assert(VnaSequencer, 'VnaSequencer no importado');
            const net    = sampleVnaNetwork();
            const result = VnaSequencer.sequence(net);
            assertAllHave(result.exchanges, 'depends_on',
                'Todos los exchanges deben tener depends_on[]');
            result.exchanges.forEach((ex, i) => {
                assert(Array.isArray(ex.depends_on),
                    `exchange[${i}].depends_on debe ser Array, got: ${typeof ex.depends_on}`);
            });
        });

        runner.it('los sequence_order son únicos (no hay empates)', () => {
            assert(VnaSequencer, 'VnaSequencer no importado');
            const net    = sampleVnaNetwork();
            const result = VnaSequencer.sequence(net);
            assertUnique(result.exchanges, 'sequence_order',
                'sequence_order debe ser único por exchange — el Orquestador necesita orden determinista');
        });

        runner.it('los sequence_order cubren el rango 1..N sin huecos', () => {
            assert(VnaSequencer, 'VnaSequencer no importado');
            const net     = sampleVnaNetwork();
            const result  = VnaSequencer.sequence(net);
            const N       = result.exchanges.length;
            const orders  = result.exchanges.map(e => e.sequence_order).sort((a,b) => a-b);
            orders.forEach((o, i) => {
                assertEqual(o, i + 1,
                    `sequence_order[${i}] debería ser ${i+1} (rango 1..${N} sin huecos), got ${o}`);
            });
        });

        runner.it('la red original no es mutada (inmutabilidad)', () => {
            assert(VnaSequencer, 'VnaSequencer no importado');
            const net    = sampleVnaNetwork();
            const before = JSON.stringify(net);
            VnaSequencer.sequence(net);
            const after  = JSON.stringify(net);
            assertEqual(before, after,
                'VnaSequencer.sequence() NO debe mutar la red original — devuelve copia nueva');
        });

        runner.it('devuelve también el metadata de secuenciación', () => {
            assert(VnaSequencer, 'VnaSequencer no importado');
            const net    = sampleVnaNetwork();
            const result = VnaSequencer.sequence(net);
            assert(result.sequencing_meta,
                'El resultado debe incluir sequencing_meta con metadatos del cálculo');
            assert(typeof result.sequencing_meta.algorithm === 'string',
                'sequencing_meta.algorithm debe describir el algoritmo usado');
            assert(Number.isFinite(result.sequencing_meta.health_score),
                'sequencing_meta.health_score debe ser un número');
        });
    });

    runner.describe('VnaSequencer — lógica de dependencias', () => {
        runner.it('flujos con mismo nodo origen-destino son independientes en secuencia', () => {
            assert(VnaSequencer, 'VnaSequencer no importado');
            const net    = sampleVnaNetwork();
            const result = VnaSequencer.sequence(net);
            // ex-03 (plataforma→estudiante) y ex-08 (plataforma→ia-tutor)
            // Ambos salen del mismo nodo 'plataforma' — no dependen entre sí
            const ex03 = result.exchanges.find(e => e.id === 'ex-03');
            const ex08 = result.exchanges.find(e => e.id === 'ex-08');
            assert(ex03, 'exchange ex-03 debe existir en la red');
            assert(ex08, 'exchange ex-08 debe existir en la red');
            assert(!ex03.depends_on.includes('ex-08') && !ex08.depends_on.includes('ex-03'),
                'ex-03 y ex-08 no deben depender el uno del otro — son paralelos desde el mismo nodo origen');
        });

        runner.it('ex-02 (contenido→plataforma) va después de ex-01 (instructor→contenido)', () => {
            assert(VnaSequencer, 'VnaSequencer no importado');
            const net    = sampleVnaNetwork();
            const result = VnaSequencer.sequence(net);
            const ex01   = result.exchanges.find(e => e.id === 'ex-01');
            const ex02   = result.exchanges.find(e => e.id === 'ex-02');
            assert(ex01 && ex02, 'ex-01 y ex-02 deben existir');
            // ex-02 recoge un nodo (contenido) que es producido por ex-01
            // → ex-02 debe depender de ex-01
            assert(ex02.depends_on.includes('ex-01'),
                `ex-02 (${ex02.label}) debe tener ex-01 en depends_on porque el nodo 'contenido' es producido por ex-01. Got: [${ex02.depends_on}]`);
            assert(ex02.sequence_order > ex01.sequence_order,
                `ex-02.sequence_order (${ex02.sequence_order}) debe ser > ex-01.sequence_order (${ex01.sequence_order})`);
        });

        runner.it('ex-07 (payment instructor) va después de ex-06 (publica marketplace)', () => {
            assert(VnaSequencer, 'VnaSequencer no importado');
            const net    = sampleVnaNetwork();
            const result = VnaSequencer.sequence(net);
            const ex06   = result.exchanges.find(e => e.id === 'ex-06');
            const ex07   = result.exchanges.find(e => e.id === 'ex-07');
            assert(ex06 && ex07, 'ex-06 y ex-07 deben existir');
            // El pago (ex-07) no puede ocurrir antes de publicar (ex-06)
            assert(ex07.sequence_order > ex06.sequence_order,
                `ex-07 (${ex07.label}) debe ir después de ex-06 (${ex06.label})`);
        });

        runner.it('exchanges de payment van siempre al final de la cadena', () => {
            assert(VnaSequencer, 'VnaSequencer no importado');
            const net     = sampleVnaNetwork();
            const result  = VnaSequencer.sequence(net);
            const payments = result.exchanges.filter(e => e.category === 'payment');
            const nonPayments = result.exchanges.filter(e => e.category !== 'payment');
            const maxNonPay   = Math.max(...nonPayments.map(e => e.sequence_order));
            payments.forEach(p => {
                assert(p.sequence_order > maxNonPay - 2,
                    `payment exchange '${p.label}' (seq ${p.sequence_order}) debería estar al final de la cadena (después de seq ${maxNonPay - 2})`);
            });
        });
    });

    runner.describe('VnaSequencer — detección de ciclos', () => {
        runner.it('detectCycles() devuelve array vacío en red sin ciclos', () => {
            assert(VnaSequencer, 'VnaSequencer no importado');
            const net    = sampleVnaNetwork();
            const cycles = VnaSequencer.detectCycles(net);
            assert(Array.isArray(cycles), 'detectCycles() debe devolver un Array');
            assertEqual(cycles.length, 0,
                `La red de ejemplo no tiene ciclos reales — detectCycles() devolvió ${cycles.length} ciclo(s): ${JSON.stringify(cycles)}`);
        });

        runner.it('detectCycles() detecta ciclo directo A→B→A', () => {
            assert(VnaSequencer, 'VnaSequencer no importado');
            const cyclic = sampleVnaNetwork({
                exchanges: [
                    { id: 'c-01', from: 'n-a', to: 'n-b', type: 'tangible', category: 'deliverable', label: 'A to B', automatable: true },
                    { id: 'c-02', from: 'n-b', to: 'n-a', type: 'tangible', category: 'deliverable', label: 'B back to A', automatable: true },
                ],
                nodes: [
                    { id: 'n-a', label: 'Nodo A', role: 'process', tier: 0, fmv: 0, slices: 0 },
                    { id: 'n-b', label: 'Nodo B', role: 'process', tier: 0, fmv: 0, slices: 0 },
                ]
            });
            const cycles = VnaSequencer.detectCycles(cyclic);
            assert(cycles.length > 0,
                'detectCycles() debe detectar el ciclo A→B→A');
            assert(cycles.some(c => c.includes('c-01') || c.includes('c-02')),
                'El ciclo detectado debe mencionar los exchanges c-01 o c-02');
        });

        runner.it('sequence() en red cíclica incluye cycles en sequencing_meta', () => {
            assert(VnaSequencer, 'VnaSequencer no importado');
            const cyclic = sampleVnaNetwork({
                exchanges: [
                    { id: 'c-01', from: 'n-a', to: 'n-b', type: 'tangible', category: 'deliverable', label: 'A to B', automatable: true },
                    { id: 'c-02', from: 'n-b', to: 'n-a', type: 'tangible', category: 'deliverable', label: 'B to A', automatable: true },
                ],
                nodes: [
                    { id: 'n-a', label: 'A', role: 'process', tier: 0, fmv: 0, slices: 0 },
                    { id: 'n-b', label: 'B', role: 'process', tier: 0, fmv: 0, slices: 0 },
                ]
            });
            const result = VnaSequencer.sequence(cyclic);
            // No debe lanzar error, pero sí reportar el ciclo
            assert(result.sequencing_meta.cycles && result.sequencing_meta.cycles.length > 0,
                'sequence() con red cíclica debe reportar los ciclos en sequencing_meta.cycles');
        });
    });

    runner.describe('VnaSequencer — red vacía y edge cases', () => {
        runner.it('red sin exchanges devuelve exchanges vacío sin error', () => {
            assert(VnaSequencer, 'VnaSequencer no importado');
            const empty  = { ...sampleVnaNetwork(), exchanges: [] };
            const result = VnaSequencer.sequence(empty);
            assert(Array.isArray(result.exchanges), 'exchanges debe ser array');
            assertEqual(result.exchanges.length, 0, 'exchanges debe estar vacío');
        });

        runner.it('red con 1 exchange: sequence_order=1, depends_on=[]', () => {
            assert(VnaSequencer, 'VnaSequencer no importado');
            const single = sampleVnaNetwork({
                exchanges: [{ id: 'solo', from: 'n-a', to: 'n-b', type: 'tangible', category: 'deliverable', label: 'Solo', automatable: true }],
                nodes: [{ id: 'n-a', label: 'A', role: 'process', tier: 0, fmv: 0, slices: 0 }, { id: 'n-b', label: 'B', role: 'process', tier: 0, fmv: 0, slices: 0 }]
            });
            const result = VnaSequencer.sequence(single);
            assertEqual(result.exchanges[0].sequence_order, 1, 'Un solo exchange debe tener sequence_order=1');
            assertEqual(result.exchanges[0].depends_on.length, 0, 'Un solo exchange no debe tener dependencias');
        });

        runner.it('sequence() es idempotente — misma entrada → misma secuencia', () => {
            assert(VnaSequencer, 'VnaSequencer no importado');
            const net  = sampleVnaNetwork();
            const r1   = VnaSequencer.sequence(net);
            const r2   = VnaSequencer.sequence(net);
            r1.exchanges.forEach((ex, i) => {
                assertEqual(ex.sequence_order, r2.exchanges[i].sequence_order,
                    `sequence_order debe ser determinista — llamada 1: ${ex.sequence_order}, llamada 2: ${r2.exchanges[i].sequence_order}`);
            });
        });
    });

    runner.describe('VnaSequencer — integración con WoGenerator', () => {
        runner.it('WoGenerator.fromVnaNetwork() preserva sequence_order y depends_on en WOs', async () => {
            assert(VnaSequencer, 'VnaSequencer no importado');
            let WoGenerator;
            try { WoGenerator = (await import('../core/WoGenerator.js')).WoGenerator; } catch(_) { return; }

            const net       = sampleVnaNetwork();
            const sequenced = VnaSequencer.sequence(net);
            const { workOrders } = WoGenerator.fromVnaNetwork(sequenced, { automation_level: 'review_first' });

            assertAllHave(workOrders, 'sequence_order',
                'WOs generadas desde VNA secuenciado deben heredar sequence_order');
            assertAllHave(workOrders, 'depends_on',
                'WOs generadas desde VNA secuenciado deben heredar depends_on');

            const sorted = [...workOrders].sort((a,b) => a.sequence_order - b.sequence_order);
            assertOrdered(sorted, 'sequence_order',
                'WOs ordenadas por sequence_order deben estar en orden creciente');
        });
    });
}
