// =============================================================================
// SOS V10.1 — PrimerEngine TESTS
// Ruta: /ia/dev/tests/primer_engine.test.js
// Tests para PrimerEngine.js — memoria entre sesiones (Recall Stack Layer 2+4)
// =============================================================================

import { assert, assertEqual, createMockKB } from './helpers.js';

export async function PrimerEngineTests(runner) {

    let PrimerEngine;
    try {
        PrimerEngine = (await import('../core/PrimerEngine.js')).PrimerEngine;
    } catch(_) { PrimerEngine = null; }

    runner.describe('PrimerEngine — módulo existe', () => {
        runner.it('PrimerEngine importable', () => {
            assert(PrimerEngine !== null,
                'PrimerEngine.js no existe en /ia/dev/core/. Crear el módulo. (Sprint 3)');
        });
        runner.it('métodos estáticos: save, load, buildContext', () => {
            assert(PrimerEngine, 'PrimerEngine no importado');
            ['save', 'load', 'buildContext'].forEach(m => {
                assert(typeof PrimerEngine[m] === 'function',
                    `PrimerEngine.${m}() debe ser método estático`);
            });
        });
    });

    runner.describe('PrimerEngine.save()', () => {
        runner.it('save() persiste session_summary en KB', async () => {
            assert(PrimerEngine, 'PrimerEngine no importado — Sprint 3 pendiente');
            const kb = createMockKB();
            const project = { id: 'p1', nombre: 'Test',
                work_orders: [{ hash: 'wo1', status: 'consolidated' }],
                evals: [], vna_flows: [] };
            const summary = await PrimerEngine.save({ project, sessionId: 'sess-001' }, { kb });
            assert(summary.id && summary.id.includes('session_summary'),
                `summary.id debe incluir 'session_summary', got: '${summary.id}'`);
            const fromKb = await kb.getNode(summary.id);
            assert(fromKb !== null, 'session_summary debe estar guardado en KB');
        });

        runner.it('summary incluye pending_wos, completed_wos, health_score, blockers', async () => {
            assert(PrimerEngine, 'PrimerEngine no importado — Sprint 3 pendiente');
            const kb = createMockKB();
            const project = { id: 'p1', nombre: 'Test',
                work_orders: [
                    { hash: 'wo1', status: 'consolidated', evalsResult: { score: 0.9 } },
                    { hash: 'wo2', status: 'theoretical' },
                ], evals: [], vna_flows: [] };
            const summary = await PrimerEngine.save({ project, sessionId: 'sess-001' }, { kb });
            ['pending_wos', 'completed_wos', 'health_score', 'blockers', 'timestamp'].forEach(f => {
                assert(summary[f] !== undefined, `session_summary debe incluir '${f}'`);
            });
            assertEqual(summary.completed_wos.length, 1, 'completed_wos debe tener 1 WO');
            assertEqual(summary.pending_wos.length, 1,   'pending_wos debe tener 1 WO');
        });
    });

    runner.describe('PrimerEngine.load()', () => {
        runner.it('load() devuelve los últimos N session_summaries', async () => {
            assert(PrimerEngine, 'PrimerEngine no importado — Sprint 3 pendiente');
            const kb = createMockKB();
            const project = { id: 'p1', nombre: 'T', work_orders: [], evals: [], vna_flows: [] };
            await PrimerEngine.save({ project, sessionId: 'sess-001' }, { kb });
            await new Promise(r => setTimeout(r, 5));
            await PrimerEngine.save({ project, sessionId: 'sess-002' }, { kb });
            const loaded = await PrimerEngine.load('p1', { kb, limit: 3 });
            assert(Array.isArray(loaded), 'load() debe devolver Array');
            assert(loaded.length >= 2, `load() debe devolver >=2 summaries, devolvió ${loaded.length}`);
        });

        runner.it('load() devuelve array vacío si no hay summaries', async () => {
            assert(PrimerEngine, 'PrimerEngine no importado — Sprint 3 pendiente');
            const kb = createMockKB();
            const loaded = await PrimerEngine.load('proyecto-sin-historia', { kb });
            assert(Array.isArray(loaded), 'Debe ser Array');
            assertEqual(loaded.length, 0, 'Sin summaries → array vacío');
        });
    });

    runner.describe('PrimerEngine.buildContext()', () => {
        runner.it('buildContext() devuelve string no vacío con summaries previos', () => {
            assert(PrimerEngine, 'PrimerEngine no importado — Sprint 3 pendiente');
            const summaries = [
                { id: 's1', projectId: 'p1', completed_wos: ['wo1'], pending_wos: ['wo2'],
                  health_score: 0.7, blockers: [], timestamp: Date.now() - 1000 },
                { id: 's2', projectId: 'p1', completed_wos: ['wo3'], pending_wos: [],
                  health_score: 0.8, blockers: ['Sin FMV en rol X'], timestamp: Date.now() }
            ];
            const ctx = PrimerEngine.buildContext(summaries, 'p1');
            assert(typeof ctx === 'string' && ctx.length > 0,
                'buildContext() debe devolver string no vacío');
        });

        runner.it('buildContext() devuelve string con array vacío', () => {
            assert(PrimerEngine, 'PrimerEngine no importado — Sprint 3 pendiente');
            const ctx = PrimerEngine.buildContext([], 'p1');
            assert(typeof ctx === 'string', 'buildContext([]) debe devolver string');
        });
    });
}
