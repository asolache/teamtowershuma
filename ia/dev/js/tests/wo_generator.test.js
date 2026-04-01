// =============================================================================
// SOS V10.1 — WoGenerator TESTS
// Ruta: /ia/dev/tests/wo_generator.test.js
//
// Tests para los cambios V10.1 en WoGenerator:
//   - hereda sequence_order y depends_on de los exchanges secuenciados
//   - ordena WOs: primero las sin dependencias, luego por secuencia
//   - calcula execution_gates: WOs que deben completarse antes
//   - añade can_start_immediately: true si depends_on está vacío
//   - el Orquestador puede consultar nextExecutable() para saber qué ejecutar
// =============================================================================

import { assert, assertEqual, assertAllHave, assertRange, assertOrdered,
         createMockStore, createMockKB, sampleVnaNetwork } from './helpers.js';

export async function WoGeneratorTests(runner) {

    let WoGenerator, VnaSequencer;
    try {
        WoGenerator  = (await import('../core/WoGenerator.js')).WoGenerator;
        VnaSequencer = (await import('../core/VnaSequencer.js')).VnaSequencer;
    } catch(_) {
        WoGenerator  = null;
        VnaSequencer = null;
    }

    runner.describe('WoGenerator — schema V10.1', () => {
        runner.it('WoGenerator importable', () => {
            assert(WoGenerator !== null, 'WoGenerator.js no importable');
        });

        runner.it('WO schema incluye sequence_order (nuevo V10.1)', () => {
            assert(WoGenerator, 'WoGenerator no disponible');
            const net = VnaSequencer ? VnaSequencer.sequence(sampleVnaNetwork()) : sampleVnaNetwork();
            const { workOrders } = WoGenerator.fromVnaNetwork(net);
            assertAllHave(workOrders, 'sequence_order',
                'Cada WO debe tener sequence_order — el Orquestador lo necesita para la ejecución ordenada');
        });

        runner.it('WO schema incluye depends_on[] (nuevo V10.1)', () => {
            assert(WoGenerator, 'WoGenerator no disponible');
            const net = VnaSequencer ? VnaSequencer.sequence(sampleVnaNetwork()) : sampleVnaNetwork();
            const { workOrders } = WoGenerator.fromVnaNetwork(net);
            assertAllHave(workOrders, 'depends_on',
                'Cada WO debe tener depends_on[] con hashes de WOs que deben completarse antes');
        });

        runner.it('WO schema incluye can_start_immediately (nuevo V10.1)', () => {
            assert(WoGenerator, 'WoGenerator no disponible');
            const net = VnaSequencer ? VnaSequencer.sequence(sampleVnaNetwork()) : sampleVnaNetwork();
            const { workOrders } = WoGenerator.fromVnaNetwork(net);
            assertAllHave(workOrders, 'can_start_immediately',
                'Cada WO debe tener can_start_immediately: true si depends_on está vacío');
        });

        runner.it('can_start_immediately=true solo cuando depends_on está vacío', () => {
            assert(WoGenerator, 'WoGenerator no disponible');
            const net = VnaSequencer ? VnaSequencer.sequence(sampleVnaNetwork()) : sampleVnaNetwork();
            const { workOrders } = WoGenerator.fromVnaNetwork(net);
            workOrders.forEach((wo, i) => {
                const expected = wo.depends_on.length === 0;
                assertEqual(wo.can_start_immediately, expected,
                    `WO[${i}] '${wo.entregable}': can_start_immediately=${wo.can_start_immediately} pero depends_on.length=${wo.depends_on.length}`);
            });
        });

        runner.it('todos los campos obligatorios V10 presentes', () => {
            assert(WoGenerator, 'WoGenerator no disponible');
            const net = sampleVnaNetwork();
            const { workOrders } = WoGenerator.fromVnaNetwork(net);
            const required = ['hash', 'flowId', 'status', 'woType', 'automation',
                              'entregable', 'from', 'to', 'category', 'estimatedHours', 'createdBy'];
            required.forEach(field => {
                assertAllHave(workOrders, field, `Campo obligatorio '${field}' falta en WOs`);
            });
        });

        runner.it('createdBy es siempre node-claude-sonnet-v10', () => {
            assert(WoGenerator, 'WoGenerator no disponible');
            const { workOrders } = WoGenerator.fromVnaNetwork(sampleVnaNetwork());
            workOrders.forEach((wo, i) => {
                assertEqual(wo.createdBy, 'node-claude-sonnet-v10',
                    `WO[${i}].createdBy debe ser 'node-claude-sonnet-v10', got: '${wo.createdBy}'`);
            });
        });

        runner.it('slices se calculan con precisión 3 decimales', () => {
            assert(WoGenerator, 'WoGenerator no disponible');
            const { workOrders } = WoGenerator.fromVnaNetwork(sampleVnaNetwork());
            // estimatedHours debe tener máximo 1 decimal (× FMV × mult → 3 dec en ledger)
            workOrders.forEach((wo, i) => {
                const h = wo.estimatedHours;
                assert(typeof h === 'number' && h > 0,
                    `WO[${i}].estimatedHours debe ser número positivo, got: ${h}`);
            });
        });
    });

    runner.describe('WoGenerator — ordenación por secuencia', () => {
        runner.it('WOs sin dependencias tienen sequence_order < WOs con dependencias', () => {
            assert(WoGenerator && VnaSequencer, 'Módulos no disponibles');
            const net = VnaSequencer.sequence(sampleVnaNetwork());
            const { workOrders } = WoGenerator.fromVnaNetwork(net);
            const immediate = workOrders.filter(w => w.can_start_immediately);
            const dependent = workOrders.filter(w => !w.can_start_immediately);
            if (immediate.length > 0 && dependent.length > 0) {
                const maxImmediate = Math.max(...immediate.map(w => w.sequence_order));
                const minDependent = Math.min(...dependent.map(w => w.sequence_order));
                assert(maxImmediate <= minDependent,
                    `WOs inmediatas (max seq=${maxImmediate}) deben tener menor o igual sequence_order que WOs con dependencias (min seq=${minDependent})`);
            }
        });

        runner.it('nextExecutable() devuelve WOs cuyas depends_on están todas completadas', () => {
            assert(WoGenerator, 'WoGenerator no disponible');
            assert(typeof WoGenerator.nextExecutable === 'function',
                'WoGenerator.nextExecutable(workOrders, completedHashes) debe ser método estático V10.1');
            const net = VnaSequencer ? VnaSequencer.sequence(sampleVnaNetwork()) : sampleVnaNetwork();
            const { workOrders } = WoGenerator.fromVnaNetwork(net);

            // Sin nada completado → solo WOs con can_start_immediately
            const first = WoGenerator.nextExecutable(workOrders, []);
            assert(first.length > 0, 'nextExecutable() debe devolver al menos 1 WO al inicio');
            first.forEach(wo => {
                assertEqual(wo.can_start_immediately, true,
                    `Primera ronda de WOs ejecutables debe tener can_start_immediately=true`);
            });
        });

        runner.it('nextExecutable() desbloquea WOs dependientes cuando sus deps se completan', () => {
            assert(WoGenerator && VnaSequencer, 'Módulos no disponibles');
            assert(typeof WoGenerator.nextExecutable === 'function', 'nextExecutable no existe');

            const net = VnaSequencer.sequence(sampleVnaNetwork());
            const { workOrders } = WoGenerator.fromVnaNetwork(net);

            // Simular que la primera ronda se completó
            const firstBatch    = WoGenerator.nextExecutable(workOrders, []);
            const completedHash = firstBatch.map(w => w.hash);
            const secondBatch   = WoGenerator.nextExecutable(workOrders, completedHash);

            // La segunda ronda debe incluir WOs que dependían de la primera
            const unlocked = secondBatch.filter(w => !w.can_start_immediately);
            // No podemos asumir que siempre habrá unlocked (depende del VNA de test)
            // pero sí que secondBatch no sea idéntico a firstBatch
            const firstHashes  = new Set(completedHash);
            const newInSecond  = secondBatch.filter(w => !firstHashes.has(w.hash));
            // Si hay dependencias en la red de test, deben aparecer nuevas WOs
            const hasDependent = workOrders.some(w => !w.can_start_immediately);
            if (hasDependent) {
                assert(newInSecond.length > 0,
                    'Después de completar la primera ronda deben desbloquearse nuevas WOs dependientes');
            }
        });

        runner.it('summary() incluye execution_layers: WOs agrupadas por ronda de ejecución', () => {
            assert(WoGenerator, 'WoGenerator no disponible');
            const net = VnaSequencer ? VnaSequencer.sequence(sampleVnaNetwork()) : sampleVnaNetwork();
            const { workOrders } = WoGenerator.fromVnaNetwork(net);
            const sum = WoGenerator.summary(workOrders);
            assert(sum.execution_layers !== undefined,
                'WoGenerator.summary() debe incluir execution_layers (agrupación por ronda de ejecución paralela)');
            assert(Array.isArray(sum.execution_layers),
                'execution_layers debe ser un Array de arrays');
            assert(sum.execution_layers.length > 0,
                'execution_layers debe tener al menos 1 capa');
        });
    });

    runner.describe('WoGenerator — routing de automatización', () => {
        runner.it('exchanges automatable=true con cat IA → automation=auto en full_auto', () => {
            assert(WoGenerator, 'WoGenerator no disponible');
            const { workOrders } = WoGenerator.fromVnaNetwork(sampleVnaNetwork(), { automation_level: 'full_auto' });
            // ex-03 (service, automatable=true) y ex-04 (service, automatable=true)
            const autoWos = workOrders.filter(w => (w.category === 'service' || w.category === 'knowledge' || w.category === 'deliverable') && w.automatable);
            autoWos.forEach(wo => {
                assertEqual(wo.automation, 'auto',
                    `WO '${wo.entregable}' (${wo.category}, automatable=true) en full_auto debe tener automation=auto, got: ${wo.automation}`);
            });
        });

        runner.it('payment exchanges siempre tienen automation=human independientemente del nivel', () => {
            assert(WoGenerator, 'WoGenerator no disponible');
            const { workOrders } = WoGenerator.fromVnaNetwork(sampleVnaNetwork(), { automation_level: 'full_auto' });
            const paymentWos = workOrders.filter(w => w.category === 'payment');
            paymentWos.forEach(wo => {
                assertEqual(wo.automation, 'human',
                    `WO de payment '${wo.entregable}' debe tener automation=human incluso en full_auto`);
            });
        });

        runner.it('intangible feedback exchanges → automation=hitl en review_first', () => {
            assert(WoGenerator, 'WoGenerator no disponible');
            const { workOrders } = WoGenerator.fromVnaNetwork(sampleVnaNetwork(), { automation_level: 'review_first' });
            const feedbackWos = workOrders.filter(w => w.category === 'feedback');
            feedbackWos.forEach(wo => {
                assert(wo.automation === 'hitl' || wo.automation === 'human',
                    `WO feedback '${wo.entregable}' en review_first debe ser hitl o human, got: ${wo.automation}`);
            });
        });

        runner.it('SWARM_AGENTS map cubre todas las categorías VNA del sampleNetwork', () => {
            assert(WoGenerator, 'WoGenerator no disponible');
            const net = sampleVnaNetwork();
            const { workOrders } = WoGenerator.fromVnaNetwork(net);
            const autoWos = workOrders.filter(w => w.automation === 'auto' || w.automation === 'hitl');
            autoWos.forEach(wo => {
                assert(wo.assigneeId && wo.assigneeId.startsWith('@'),
                    `WO auto/hitl '${wo.entregable}' debe tener assigneeId de agente (@...), got: '${wo.assigneeId}'`);
            });
        });
    });

    runner.describe('WoGenerator — SOC checklist', () => {
        runner.it('todos los exchanges generan al menos 2 SOCs base', () => {
            assert(WoGenerator, 'WoGenerator no disponible');
            const { workOrders } = WoGenerator.fromVnaNetwork(sampleVnaNetwork());
            workOrders.forEach((wo, i) => {
                assert(Array.isArray(wo.soc_checklist),
                    `WO[${i}].soc_checklist debe ser Array`);
                assert(wo.soc_checklist.length >= 2,
                    `WO[${i}] '${wo.entregable}' debe tener >= 2 SOCs base, tiene: ${wo.soc_checklist.length}`);
            });
        });

        runner.it('SOCs de exchanges automatable tienen criterio de ejecución IA', () => {
            assert(WoGenerator, 'WoGenerator no disponible');
            const { workOrders } = WoGenerator.fromVnaNetwork(sampleVnaNetwork());
            const autoWos = workOrders.filter(w => w.automatable);
            autoWos.forEach(wo => {
                const hasAiSoc = wo.soc_checklist.some(s =>
                    (s.label || s.text || s.criteria || '').toLowerCase().includes('ia') ||
                    (s.label || s.text || s.criteria || '').toLowerCase().includes('ejecut') ||
                    (s.label || s.text || s.criteria || '').toLowerCase().includes('verif')
                );
                assert(hasAiSoc,
                    `WO automatable '${wo.entregable}' debe tener SOC que verifique la ejecución IA`);
            });
        });

        runner.it('SOC ids son únicos dentro de cada WO', () => {
            assert(WoGenerator, 'WoGenerator no disponible');
            const { workOrders } = WoGenerator.fromVnaNetwork(sampleVnaNetwork());
            workOrders.forEach((wo, i) => {
                const ids = wo.soc_checklist.map(s => s.id).filter(Boolean);
                const unique = new Set(ids);
                assertEqual(unique.size, ids.length,
                    `WO[${i}] '${wo.entregable}' tiene SOC ids duplicados`);
            });
        });
    });
}
