// =============================================================================
// SOS V10.1 — GateEngine TESTS
// Ruta: /ia/dev/tests/gate_engine.test.js
// Tests para GateEngine.js — enforcement del Codex SOS en runtime (Sprint 4)
// =============================================================================

import { assert, assertEqual } from './helpers.js';

export async function GateEngineTests(runner) {

    let GateEngine;
    try {
        GateEngine = (await import('../core/GateEngine.js')).GateEngine;
    } catch(_) { GateEngine = null; }

    runner.describe('GateEngine — módulo existe', () => {
        runner.it('GateEngine importable', () => {
            assert(GateEngine !== null,
                'GateEngine.js no existe en /ia/dev/core/. Crear el módulo. (Sprint 4)');
        });
        runner.it('métodos y propiedades estáticas requeridos', () => {
            assert(GateEngine, 'GateEngine no importado');
            ['check', 'wrap', 'promote', 'loadGates', 'DEFAULT_GATES'].forEach(m => {
                assert(GateEngine[m] !== undefined, `GateEngine.${m} debe existir`);
            });
        });
    });

    runner.describe('GateEngine.DEFAULT_GATES', () => {
        runner.it('DEFAULT_GATES es array no vacío', () => {
            assert(GateEngine, 'GateEngine no importado — Sprint 4 pendiente');
            assert(Array.isArray(GateEngine.DEFAULT_GATES) && GateEngine.DEFAULT_GATES.length > 0,
                'DEFAULT_GATES debe ser array no vacío con las gates del Codex SOS V10');
        });

        runner.it('DEFAULT_GATES incluye gate para localStorage directa', () => {
            assert(GateEngine, 'GateEngine no importado — Sprint 4 pendiente');
            const names = GateEngine.DEFAULT_GATES.map(g => g.name);
            assert(names.some(n => n.includes('localStorage') || n.includes('local_storage')),
                'DEFAULT_GATES debe incluir gate que bloquee uso directo de localStorage');
        });

        runner.it('DEFAULT_GATES incluye gate para mutación store.state', () => {
            assert(GateEngine, 'GateEngine no importado — Sprint 4 pendiente');
            const names = GateEngine.DEFAULT_GATES.map(g => g.name);
            assert(names.some(n => n.includes('store') || n.includes('mutacion') || n.includes('mutation')),
                'DEFAULT_GATES debe incluir gate para mutación directa de store.state');
        });

        runner.it('DEFAULT_GATES incluye gate para slices sin .toFixed(3)', () => {
            assert(GateEngine, 'GateEngine no importado — Sprint 4 pendiente');
            const names = GateEngine.DEFAULT_GATES.map(g => g.name);
            assert(names.some(n => n.includes('slices') || n.includes('toFixed') || n.includes('precision')),
                'DEFAULT_GATES debe incluir gate para slices sin .toFixed(3)');
        });

        runner.it('cada gate tiene: name, pattern, level, message, enabled', () => {
            assert(GateEngine, 'GateEngine no importado — Sprint 4 pendiente');
            GateEngine.DEFAULT_GATES.forEach((g, i) => {
                ['name', 'pattern', 'level', 'message', 'enabled'].forEach(f => {
                    assert(g[f] !== undefined, `DEFAULT_GATES[${i}] debe tener campo '${f}'`);
                });
                assert(['block', 'warn'].includes(g.level),
                    `DEFAULT_GATES[${i}].level debe ser 'block' o 'warn', got: '${g.level}'`);
            });
        });
    });

    runner.describe('GateEngine.check()', () => {
        runner.it('check() bloquea acción con localStorage en payload', () => {
            assert(GateEngine, 'GateEngine no importado — Sprint 4 pendiente');
            const action = { type: 'UPDATE_PROJECT_INFO',
                payload: { code: 'localStorage.setItem("key", "val")' } };
            const result = GateEngine.check(action, GateEngine.DEFAULT_GATES);
            assert(result.blocked === true || result.level === 'block',
                'check() debe bloquear acción con localStorage directa en el payload');
        });

        runner.it('check() permite acción limpia', () => {
            assert(GateEngine, 'GateEngine no importado — Sprint 4 pendiente');
            const action = { type: 'NODE_UPDATED',
                payload: { id: 'node-1', slices: Number((2.5 * 40 * 1.2).toFixed(3)) } };
            const result = GateEngine.check(action, GateEngine.DEFAULT_GATES);
            assert(result.blocked === false || result.level === 'pass',
                'check() no debe bloquear acción limpia sin violaciones');
        });

        runner.it('check() devuelve reason y gate cuando bloquea', () => {
            assert(GateEngine, 'GateEngine no importado — Sprint 4 pendiente');
            const action = { type: 'DIRECT_MUTATION',
                payload: { code: 'store.state.projects = []' } };
            const result = GateEngine.check(action, GateEngine.DEFAULT_GATES);
            if (result.blocked) {
                assert(result.reason && result.reason.length > 0,
                    'check() debe incluir reason cuando bloquea');
                assert(result.gate && result.gate.name,
                    'check() debe incluir el gate que disparó el bloqueo');
            }
        });
    });

    runner.describe('GateEngine.wrap()', () => {
        runner.it('wrap() devuelve dispatch que bloquea acciones violadoras', async () => {
            assert(GateEngine, 'GateEngine no importado — Sprint 4 pendiente');
            const blocked = [];
            const mockDispatch = async (action) => action;
            const safeDispatch = GateEngine.wrap(mockDispatch, GateEngine.DEFAULT_GATES, {
                onBlocked: (action, result) => blocked.push({ action, result })
            });
            await safeDispatch({ type: 'TEST',
                payload: { code: 'localStorage.setItem("k","v")' } });
            await safeDispatch({ type: 'NODE_UPDATED', payload: { id: '1' } });
            assert(blocked.length >= 1,
                'wrap() debe llamar onBlocked al menos una vez con la acción violadora');
        });
    });

    runner.describe('GateEngine.promote()', () => {
        runner.it('promote() añade gate y es idempotente', () => {
            assert(GateEngine, 'GateEngine no importado — Sprint 4 pendiente');
            const gate = { name: 'test-idempotent-gate-sos', pattern: 'IDEM_XYZ',
                level: 'warn', message: 'Test gate', enabled: true };
            const before = GateEngine.DEFAULT_GATES.length;
            GateEngine.promote(gate);
            GateEngine.promote(gate); // segunda vez — no debe duplicar
            const count = GateEngine.DEFAULT_GATES.filter(g => g.name === gate.name).length;
            assertEqual(count, 1,
                'promote() con mismo nombre no debe duplicar la gate');
            assert(GateEngine.DEFAULT_GATES.length > before,
                'promote() debe añadir la gate si no existe');
            // cleanup
            const idx = GateEngine.DEFAULT_GATES.findIndex(g => g.name === gate.name);
            if (idx > -1) GateEngine.DEFAULT_GATES.splice(idx, 1);
        });
    });
}
