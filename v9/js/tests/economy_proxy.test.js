// v9/js/tests/economy_proxy.test.js
import { assert, assertEqual, createMockStore } from './helpers.js';

export async function EconomyProxyTests(runner) {
    let Orchestrator;
    try { Orchestrator = (await import('../core/Orchestrator.js')).Orchestrator; } catch(_) { Orchestrator = null; }

    runner.describe('Orchestrator — Proxy vs P2P Routing', () => {
        runner.it('Modo PREMIUM enruta a través del SOS Proxy', () => {
            assert(Orchestrator !== null, 'Orchestrator no importado');
            const configPremium = { tier: 'premium', proxyUrl: 'https://api.teamtowershuma.com/v1/chat' };
            const endpoint = Orchestrator._resolveEndpoint('openai', configPremium);
            assertEqual(endpoint, 'https://api.teamtowershuma.com/v1/chat', 'Modo Premium debe usar el Proxy SOS.');
        });
    });

    runner.describe('Slicing Pie Ledger (T-008) — Cálculo Automático', () => {
        runner.it('CONSOLIDATE_WORK_ORDER inyecta Slices en el Ledger', async () => {
            const store = createMockStore({
                projects: [{
                    id: 'proj_sos_1',
                    roles: [{ id: 'r1', name: 'Developer', fmv: 60 }],
                    work_orders: [{ hash: 'wo_123', status: 'reported', to: 'r1', realHours: 2.5 }],
                    ledger: []
                }]
            });

            await store.dispatch({ type: 'CONSOLIDATE_WORK_ORDER', payload: { projectId: 'proj_sos_1', woHash: 'wo_123' } });
            
            const project = store.getState().projects.find(p => p.id === 'proj_sos_1');
            assert(project.ledger.length === 1, 'Ledger debe tener 1 TX');
            assertEqual(project.ledger[0].slices, 150, 'Slices deben ser 150 (2.5h * 60 FMV)');
        });
    });
}