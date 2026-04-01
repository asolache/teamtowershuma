// =============================================================================
// SOS V10.1 — QueenAudit TESTS
// Ruta: /ia/dev/tests/queen_audit.test.js
// =============================================================================

import { assert, assertEqual, assertRange, assertAllHave,
         createMockStore, createMockKB, sampleVnaNetwork } from './helpers.js';

export async function QueenAuditTests(runner) {
    let QueenAudit;
    try { QueenAudit = (await import('../core/QueenAudit.js')).QueenAudit; }
    catch(_) { QueenAudit = null; }

    runner.describe('QueenAudit — módulo existe', () => {
        runner.it('QueenAudit importable', () => {
            assert(QueenAudit !== null, 'QueenAudit.js no existe en /ia/dev/core/. Crear el módulo.');
        });
        runner.it('métodos estáticos requeridos', () => {
            assert(QueenAudit, 'QueenAudit no importado');
            ['analyze', 'proposeFixes', 'applyFixes'].forEach(m => {
                assert(typeof QueenAudit[m] === 'function', `QueenAudit.${m}() debe ser método estático`);
            });
        });
    });

    runner.describe('QueenAudit.analyze()', () => {
        runner.it('detecta roles sin ninguna WO consolidada', () => {
            assert(QueenAudit, 'QueenAudit no importado');
            const project = {
                id: 'p1', nombre: 'Test',
                roles: [{ id: 'r1', name: 'RolA', levelId: '@baixos' }, { id: 'r2', name: 'RolB', levelId: '@dosos' }],
                work_orders: [
                    { hash: 'wo1', from: 'r1', status: 'consolidated', evalsResult: { score: 0.9 } }
                    // r2 no tiene ninguna WO → debe detectarse
                ],
                vna_flows: [], evals: [], ledger: []
            };
            const report = QueenAudit.analyze(project);
            assert(report.idle_roles && report.idle_roles.length > 0,
                'analyze() debe detectar roles sin WOs consolidadas (idle_roles)');
            assert(report.idle_roles.some(r => r.roleId === 'r2'),
                'r2 debe aparecer en idle_roles');
        });

        runner.it('detecta WOs con score < 0.8 repetidamente (patrón de baja calidad)', () => {
            assert(QueenAudit, 'QueenAudit no importado');
            const project = {
                id: 'p1', nombre: 'Test', roles: [{ id: 'r1', name: 'R', levelId: '@baixos' }],
                work_orders: [
                    { hash: 'wo1', from: 'r1', status: 'consolidated', evalsResult: { score: 0.65 } },
                    { hash: 'wo2', from: 'r1', status: 'consolidated', evalsResult: { score: 0.60 } },
                    { hash: 'wo3', from: 'r1', status: 'consolidated', evalsResult: { score: 0.55 } },
                ],
                vna_flows: [], evals: [], ledger: []
            };
            const report = QueenAudit.analyze(project);
            assert(report.quality_patterns && report.quality_patterns.length > 0,
                'analyze() debe detectar patrones de baja calidad');
            assert(report.quality_patterns.some(p => p.roleId === 'r1' && p.avg_score < 0.8),
                'r1 debe aparecer en quality_patterns con avg_score < 0.8');
        });

        runner.it('report incluye health_score y recommendation_count', () => {
            assert(QueenAudit, 'QueenAudit no importado');
            const project = {
                id: 'p1', nombre: 'Test', roles: [], work_orders: [], vna_flows: [], evals: [], ledger: []
            };
            const report = QueenAudit.analyze(project);
            assert(report.health_score !== undefined, 'report debe incluir health_score');
            assertRange(report.health_score, 0, 1, 'health_score debe estar en [0,1]');
            assert(report.recommendation_count !== undefined, 'report debe incluir recommendation_count');
        });

        runner.it('health_score 1.0 cuando todo está consolidado con score >= 0.8', () => {
            assert(QueenAudit, 'QueenAudit no importado');
            const project = {
                id: 'p1', nombre: 'Test',
                roles: [{ id: 'r1', name: 'R', levelId: '@baixos' }],
                work_orders: [
                    { hash: 'wo1', from: 'r1', status: 'consolidated', evalsResult: { score: 0.95 } },
                    { hash: 'wo2', from: 'r1', status: 'consolidated', evalsResult: { score: 0.88 } },
                ],
                vna_flows: [{ id: 'f1', from: 'r1', to: 'r1', tipo: 'tangible' }],
                evals: [], ledger: []
            };
            const report = QueenAudit.analyze(project);
            assert(report.health_score >= 0.8,
                `health_score con WOs de alta calidad debe ser >= 0.8, got: ${report.health_score}`);
        });
    });

    runner.describe('QueenAudit.proposeFixes()', () => {
        runner.it('devuelve fixes para idle_roles (roles sin transacciones)', () => {
            assert(QueenAudit, 'QueenAudit no importado');
            const report = { idle_roles: [{ roleId: 'r2', roleName: 'RolB' }], quality_patterns: [], health_score: 0.4, recommendation_count: 1 };
            const fixes  = QueenAudit.proposeFixes(report, sampleVnaNetwork());
            assert(Array.isArray(fixes), 'proposeFixes() debe devolver Array');
            assert(fixes.length > 0, 'Debe proponer al menos 1 fix para idle_roles');
            assert(fixes.some(f => f.type === 'add_transaction' || f.type === 'add_eval' || f.type === 'assign_agent'),
                'Fix para idle_role debe ser add_transaction, add_eval o assign_agent');
        });

        runner.it('fix incluye campos type, targetId, suggestion, priority', () => {
            assert(QueenAudit, 'QueenAudit no importado');
            const report = { idle_roles: [{ roleId: 'r1', roleName: 'R' }], quality_patterns: [], health_score: 0.5, recommendation_count: 1 };
            const fixes  = QueenAudit.proposeFixes(report, sampleVnaNetwork());
            fixes.forEach((f, i) => {
                ['type', 'targetId', 'suggestion', 'priority'].forEach(field => {
                    assert(f[field] !== undefined, `fix[${i}] debe tener campo '${field}'`);
                });
                assert(['high','medium','low'].includes(f.priority),
                    `fix[${i}].priority debe ser high|medium|low, got: '${f.priority}'`);
            });
        });
    });

    runner.describe('QueenAudit.applyFixes()', () => {
        runner.it('applyFixes() devuelve VnaNetwork actualizado sin mutar el original', () => {
            assert(QueenAudit, 'QueenAudit no importado');
            const net    = sampleVnaNetwork();
            const before = JSON.stringify(net);
            const report = { idle_roles: [], quality_patterns: [], health_score: 0.8, recommendation_count: 0 };
            const fixes  = [];
            const result = QueenAudit.applyFixes(net, fixes);
            assertEqual(JSON.stringify(net), before, 'applyFixes() no debe mutar la red original');
            assert(result, 'applyFixes() debe devolver el VNA actualizado');
        });
    });
}

// =============================================================================
// SOS V10.1 — PrimerEngine TESTS
// Ruta: /ia/dev/tests/primer_engine.test.js
// =============================================================================

export async function PrimerEngineTests(runner) {
    let PrimerEngine;
    try { PrimerEngine = (await import('../core/PrimerEngine.js')).PrimerEngine; }
    catch(_) { PrimerEngine = null; }

    runner.describe('PrimerEngine — módulo existe', () => {
        runner.it('PrimerEngine importable', () => {
            assert(PrimerEngine !== null, 'PrimerEngine.js no existe. Crear /ia/dev/core/PrimerEngine.js');
        });
        runner.it('métodos estáticos requeridos', () => {
            assert(PrimerEngine, 'PrimerEngine no importado');
            ['save', 'load', 'buildContext'].forEach(m => {
                assert(typeof PrimerEngine[m] === 'function', `PrimerEngine.${m}() debe ser método estático`);
            });
        });
    });

    runner.describe('PrimerEngine.save()', () => {
        runner.it('save() persiste session_summary en KB', async () => {
            assert(PrimerEngine, 'PrimerEngine no importado');
            const kb      = createMockKB();
            const project = { id: 'p1', nombre: 'Test', work_orders: [{ hash: 'wo1', status: 'consolidated' }], evals: [], vna_flows: [] };
            const summary = await PrimerEngine.save({ project, sessionId: 'sess-001' }, { kb });

            assert(summary.id && summary.id.includes('session_summary'),
                `summary.id debe incluir 'session_summary', got: '${summary.id}'`);
            const fromKb = await kb.getNode(summary.id);
            assert(fromKb !== null, 'session_summary debe estar guardado en KB');
        });

        runner.it('summary incluye pending_wos, completed_wos, health_score, blockers', async () => {
            assert(PrimerEngine, 'PrimerEngine no importado');
            const kb      = createMockKB();
            const project = {
                id: 'p1', nombre: 'Test',
                work_orders: [
                    { hash: 'wo1', status: 'consolidated', evalsResult: { score: 0.9 } },
                    { hash: 'wo2', status: 'theoretical' },
                ],
                evals: [], vna_flows: []
            };
            const summary = await PrimerEngine.save({ project, sessionId: 'sess-001' }, { kb });
            ['pending_wos', 'completed_wos', 'health_score', 'blockers', 'timestamp'].forEach(f => {
                assert(summary[f] !== undefined, `session_summary debe incluir '${f}'`);
            });
            assertEqual(summary.completed_wos.length, 1, 'completed_wos debe tener 1 WO consolidada');
            assertEqual(summary.pending_wos.length, 1, 'pending_wos debe tener 1 WO pendiente');
        });
    });

    runner.describe('PrimerEngine.load()', () => {
        runner.it('load() devuelve los últimos N session_summaries', async () => {
            assert(PrimerEngine, 'PrimerEngine no importado');
            const kb      = createMockKB();
            const project = { id: 'p1', nombre: 'T', work_orders: [], evals: [], vna_flows: [] };
            await PrimerEngine.save({ project, sessionId: 'sess-001' }, { kb });
            await new Promise(r => setTimeout(r, 5));
            await PrimerEngine.save({ project, sessionId: 'sess-002' }, { kb });

            const loaded = await PrimerEngine.load('p1', { kb, limit: 3 });
            assert(Array.isArray(loaded), 'load() debe devolver Array');
            assert(loaded.length >= 2, `load() debe devolver al menos 2 summaries, devolvió ${loaded.length}`);
        });

        runner.it('load() devuelve array vacío si no hay summaries', async () => {
            assert(PrimerEngine, 'PrimerEngine no importado');
            const kb     = createMockKB();
            const loaded = await PrimerEngine.load('proyecto-sin-historia', { kb });
            assert(Array.isArray(loaded), 'Debe ser Array');
            assertEqual(loaded.length, 0, 'Sin summaries → array vacío');
        });
    });

    runner.describe('PrimerEngine.buildContext()', () => {
        runner.it('buildContext() devuelve string no vacío con summaries previos', async () => {
            assert(PrimerEngine, 'PrimerEngine no importado');
            const summaries = [
                { id: 's1', projectId: 'p1', completed_wos: ['wo1'], pending_wos: ['wo2'], health_score: 0.7, blockers: [], timestamp: Date.now() - 1000 },
                { id: 's2', projectId: 'p1', completed_wos: ['wo3'], pending_wos: [],      health_score: 0.8, blockers: ['No hay FMV en rol X'], timestamp: Date.now() }
            ];
            const ctx = PrimerEngine.buildContext(summaries, 'p1');
            assert(typeof ctx === 'string' && ctx.length > 0,
                'buildContext() debe devolver string no vacío');
            assert(ctx.includes('wo3') || ctx.includes('pendiente') || ctx.includes('health'),
                'buildContext() debe mencionar WOs completadas y estado del proyecto');
        });

        runner.it('buildContext() devuelve string vacío con array vacío', () => {
            assert(PrimerEngine, 'PrimerEngine no importado');
            const ctx = PrimerEngine.buildContext([], 'p1');
            assert(typeof ctx === 'string', 'buildContext([]) debe devolver string (puede ser vacío)');
        });
    });
}

// =============================================================================
// SOS V10.1 — GateEngine TESTS
// Ruta: /ia/dev/tests/gate_engine.test.js
// =============================================================================

export async function GateEngineTests(runner) {
    let GateEngine;
    try { GateEngine = (await import('../core/GateEngine.js')).GateEngine; }
    catch(_) { GateEngine = null; }

    runner.describe('GateEngine — módulo existe', () => {
        runner.it('GateEngine importable', () => {
            assert(GateEngine !== null, 'GateEngine.js no existe. Crear /ia/dev/core/GateEngine.js');
        });
        runner.it('métodos estáticos requeridos', () => {
            assert(GateEngine, 'GateEngine no importado');
            ['check', 'wrap', 'promote', 'loadGates', 'DEFAULT_GATES'].forEach(m => {
                assert(GateEngine[m] !== undefined, `GateEngine.${m} debe existir`);
            });
        });
    });

    runner.describe('GateEngine.DEFAULT_GATES', () => {
        runner.it('DEFAULT_GATES incluye gates del Codex SOS V10', () => {
            assert(GateEngine, 'GateEngine no importado');
            const gates = GateEngine.DEFAULT_GATES;
            assert(Array.isArray(gates) && gates.length > 0, 'DEFAULT_GATES debe ser array no vacío');
            // Gates mínimas del Codex
            const gateNames = gates.map(g => g.name);
            assert(gateNames.some(n => n.includes('localStorage') || n.includes('local_storage')),
                'DEFAULT_GATES debe incluir gate para localStorage directa');
            assert(gateNames.some(n => n.includes('store') || n.includes('mutacion')),
                'DEFAULT_GATES debe incluir gate para mutación directa de store.state');
            assert(gateNames.some(n => n.includes('slices') || n.includes('toFixed')),
                'DEFAULT_GATES debe incluir gate para slices sin .toFixed(3)');
        });

        runner.it('cada gate tiene campos name, pattern, level, message, enabled', () => {
            assert(GateEngine, 'GateEngine no importado');
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
        runner.it('check() bloquea acción con payload que viola gate block', () => {
            assert(GateEngine, 'GateEngine no importado');
            const action = {
                type: 'UPDATE_PROJECT_INFO',
                payload: { code: 'localStorage.setItem("key", "val")' }
            };
            const result = GateEngine.check(action, GateEngine.DEFAULT_GATES);
            assert(result.blocked === true || result.level === 'block',
                'check() debe bloquear acción con localStorage directa en el payload');
        });

        runner.it('check() permite acción limpia sin violaciones', () => {
            assert(GateEngine, 'GateEngine no importado');
            const action = { type: 'NODE_UPDATED', payload: { id: 'node-1', slices: Number((2.5 * 40 * 1.2).toFixed(3)) } };
            const result = GateEngine.check(action, GateEngine.DEFAULT_GATES);
            assert(result.blocked === false || result.level === 'pass',
                'check() no debe bloquear una acción limpia');
        });

        runner.it('check() devuelve reason cuando bloquea', () => {
            assert(GateEngine, 'GateEngine no importado');
            const action = { type: 'DIRECT_MUTATION', payload: { code: 'store.state.projects = []' } };
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
        runner.it('wrap() devuelve función dispatch que bloquea acciones violadoras', async () => {
            assert(GateEngine, 'GateEngine no importado');
            const blocked = [];
            const mockDispatch = async (action) => action;
            const safeDispatch = GateEngine.wrap(mockDispatch, GateEngine.DEFAULT_GATES, {
                onBlocked: (action, result) => blocked.push({ action, result })
            });

            // Acción bloqueada
            await safeDispatch({ type: 'TEST', payload: { code: 'localStorage.setItem("k","v")' } });
            // Acción permitida
            await safeDispatch({ type: 'NODE_UPDATED', payload: { id: '1' } });

            assert(blocked.length >= 1, 'wrap() debe llamar onBlocked al menos una vez con la acción violadora');
        });
    });

    runner.describe('GateEngine.promote()', () => {
        runner.it('promote() añade nueva gate a las DEFAULT_GATES', () => {
            assert(GateEngine, 'GateEngine no importado');
            const before = GateEngine.DEFAULT_GATES.length;
            GateEngine.promote({ name: 'test-gate-promote', pattern: 'DANGER_PATTERN_XYZ', level: 'block', message: 'Test gate', enabled: true });
            const after  = GateEngine.DEFAULT_GATES.length;
            assert(after > before, 'promote() debe aumentar el número de DEFAULT_GATES');
            // cleanup
            const idx = GateEngine.DEFAULT_GATES.findIndex(g => g.name === 'test-gate-promote');
            if (idx > -1) GateEngine.DEFAULT_GATES.splice(idx, 1);
        });

        runner.it('promote() es idempotente — mismo nombre no duplica', () => {
            assert(GateEngine, 'GateEngine no importado');
            const gate = { name: 'idempotent-test-gate', pattern: 'IDEM_PATTERN', level: 'warn', message: 'Test', enabled: true };
            GateEngine.promote(gate);
            GateEngine.promote(gate);
            const count = GateEngine.DEFAULT_GATES.filter(g => g.name === 'idempotent-test-gate').length;
            assertEqual(count, 1, 'promote() con mismo nombre no debe duplicar la gate');
            // cleanup
            const idx = GateEngine.DEFAULT_GATES.findIndex(g => g.name === 'idempotent-test-gate');
            if (idx > -1) GateEngine.DEFAULT_GATES.splice(idx, 1);
        });
    });
}

// =============================================================================
// SOS V10.1 — ValueMapView (VnaMapRenderer) TESTS
// Ruta: /ia/dev/tests/value_map_view.test.js
// =============================================================================

export async function ValueMapViewTests(runner) {
    let VnaMapRenderer;
    try { VnaMapRenderer = (await import('../components/VnaMapRenderer.js')).VnaMapRenderer; }
    catch(_) { VnaMapRenderer = null; }

    runner.describe('VnaMapRenderer — módulo existe', () => {
        runner.it('VnaMapRenderer importable', () => {
            assert(VnaMapRenderer !== null, 'VnaMapRenderer.js no existe en /ia/dev/components/. Crear el módulo.');
        });
        runner.it('métodos estáticos requeridos', () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado');
            ['render', 'fromKB', 'toArtifact', 'buildLayout'].forEach(m => {
                assert(typeof VnaMapRenderer[m] === 'function', `VnaMapRenderer.${m}() debe ser método estático`);
            });
        });
    });

    runner.describe('VnaMapRenderer.buildLayout()', () => {
        runner.it('buildLayout() calcula posiciones para cada nodo del VNA', async () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado');
            const net    = sampleVnaNetwork();
            let VnaSeq;
            try { VnaSeq = (await import('../core/VnaSequencer.js')).VnaSequencer; } catch(_) {}
            const sequenced = VnaSeq ? VnaSeq.sequence(net) : net;
            const layout = VnaMapRenderer.buildLayout(sequenced, { width: 680 });

            assert(layout.nodes && Array.isArray(layout.nodes), 'buildLayout() debe devolver { nodes: [] }');
            assertEqual(layout.nodes.length, sequenced.nodes.length,
                'layout.nodes debe tener el mismo número de nodos que el VNA');
            layout.nodes.forEach((n, i) => {
                assert(typeof n.x === 'number' && typeof n.y === 'number',
                    `layout.nodes[${i}] debe tener x,y numéricos`);
                assert(n.x >= 0 && n.x <= 680, `layout.nodes[${i}].x fuera del viewBox (${n.x})`);
                assert(n.y >= 0,                `layout.nodes[${i}].y no puede ser negativo (${n.y})`);
            });
        });

        runner.it('exchanges incluyen las coordenadas de origen y destino', async () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado');
            const net    = sampleVnaNetwork();
            let VnaSeq;
            try { VnaSeq = (await import('../core/VnaSequencer.js')).VnaSequencer; } catch(_) {}
            const layout = VnaMapRenderer.buildLayout(VnaSeq ? VnaSeq.sequence(net) : net, { width: 680 });

            assert(layout.edges && Array.isArray(layout.edges), 'buildLayout() debe devolver { edges: [] }');
            layout.edges.forEach((e, i) => {
                assert(typeof e.x1 === 'number', `edge[${i}] debe tener x1`);
                assert(typeof e.y1 === 'number', `edge[${i}] debe tener y1`);
                assert(typeof e.x2 === 'number', `edge[${i}] debe tener x2`);
                assert(typeof e.y2 === 'number', `edge[${i}] debe tener y2`);
            });
        });

        runner.it('edges incluyen sequence_order si el VNA está secuenciado', async () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado');
            let VnaSeq;
            try { VnaSeq = (await import('../core/VnaSequencer.js')).VnaSequencer; } catch(_) {}
            if (!VnaSeq) return; // skip si VnaSequencer aún no existe
            const sequenced = VnaSeq.sequence(sampleVnaNetwork());
            const layout    = VnaMapRenderer.buildLayout(sequenced, { width: 680 });
            layout.edges.forEach((e, i) => {
                assert(e.sequence_order !== undefined,
                    `edge[${i}] debe incluir sequence_order para que el mapa muestre los números de secuencia`);
            });
        });
    });

    runner.describe('VnaMapRenderer.render()', () => {
        runner.it('render() devuelve SVG string que empieza con <svg', async () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado');
            const net = sampleVnaNetwork();
            const svg = VnaMapRenderer.render(net, { width: 680 });
            assert(typeof svg === 'string', 'render() debe devolver string');
            assert(svg.trim().startsWith('<svg'), `render() debe devolver SVG válido, got: '${svg.substring(0,50)}'`);
        });

        runner.it('SVG contiene los labels de los nodos del VNA', async () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado');
            const net = sampleVnaNetwork();
            const svg = VnaMapRenderer.render(net, { width: 680 });
            net.nodes.forEach(n => {
                assert(svg.includes(n.label) || svg.includes(n.id),
                    `SVG debe incluir label o id del nodo '${n.label || n.id}'`);
            });
        });

        runner.it('SVG incluye números de secuencia cuando VNA está secuenciado', async () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado');
            let VnaSeq;
            try { VnaSeq = (await import('../core/VnaSequencer.js')).VnaSequencer; } catch(_) {}
            if (!VnaSeq) return;
            const sequenced = VnaSeq.sequence(sampleVnaNetwork());
            const svg       = VnaMapRenderer.render(sequenced, { width: 680, showSequence: true });
            // Debe aparecer al menos el número "1" como badge de secuencia
            assert(svg.includes('sequence') || svg.includes('seq-badge') || />[1-9]</.test(svg),
                'SVG con showSequence=true debe incluir números de secuencia visibles en el mapa');
        });

        runner.it('SVG distingue flujos tangibles e intangibles visualmente', async () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado');
            const net = sampleVnaNetwork();
            const svg = VnaMapRenderer.render(net, { width: 680 });
            // Flujos intangibles → stroke-dasharray o clase 'intangible'
            assert(svg.includes('dasharray') || svg.includes('intangible') || svg.includes('dashed'),
                'SVG debe diferenciar visualmente flujos tangibles (línea sólida) e intangibles (línea punteada)');
        });

        runner.it('render() no lanza error con VNA vacío', async () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado');
            const empty = { ...sampleVnaNetwork(), nodes: [], exchanges: [] };
            let error = null;
            try { VnaMapRenderer.render(empty, { width: 680 }); }
            catch(e) { error = e; }
            assert(error === null, `render() con VNA vacío no debe lanzar error: ${error?.message}`);
        });
    });

    runner.describe('VnaMapRenderer.toArtifact()', () => {
        runner.it('toArtifact() devuelve objeto compatible con ArtifactEngine.persist()', async () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado');
            const net     = sampleVnaNetwork();
            const payload = VnaMapRenderer.toArtifact(net, 'p1');
            assert(payload.type === 'vna_viz',     'toArtifact().type debe ser vna_viz');
            assert(payload.content !== undefined,   'toArtifact() debe incluir content');
            assert(payload.projectId === 'p1',      'toArtifact() debe incluir projectId');
            assert(payload.title && payload.title.length > 0, 'toArtifact() debe incluir title');
        });
    });
}
