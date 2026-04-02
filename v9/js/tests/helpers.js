// v9/js/tests/helpers.js
// =============================================================================
// V9.1 TEST HELPERS (Backported from V10)
// =============================================================================

export function assert(condition, message) {
    if (!condition) throw new Error(`ASSERT FAILED: ${message}`);
}

export function assertEqual(a, b, msg) {
    if (a !== b) throw new Error(`ASSERT EQUAL FAILED: ${msg} — expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

export function createMockStore(initialState = {}) {
    let state = {
        config: { economics: { markup_margin: 0.30, premium_features_fee: 0.0, base_pricing: { 'openai': { input: 2.50, output: 10.00 } } } },
        projects: [],
        globalUsers: [],
        session: { activeUserId: '@admin', role: 'ecosystem-owner' },
        ...initialState
    };
    
    return {
        getState: () => state,
        dispatch: async (action) => {
            if (action.type === 'CONSOLIDATE_WORK_ORDER') {
                const p = state.projects.find(x => x.id === action.payload.projectId);
                if (p) {
                    const wo = p.work_orders.find(w => w.hash === action.payload.woHash);
                    if (wo) {
                        wo.status = 'consolidated';
                        const role = p.roles.find(r => r.id === wo.to);
                        const fmv = role ? role.fmv : 0;
                        const slices = (wo.realHours || 0) * fmv * 1; // Multiplicador x1 por defecto
                        p.ledger.push({ id: `tx_${Date.now()}`, woHash: wo.hash, slices, timestamp: Date.now() });
                    }
                }
            }
        }
    };
}

export function createMockKB() {
    const nodes = new Map();
    return {
        init: async () => {},
        getNode: async (id) => nodes.get(id),
        saveNode: async (node) => { nodes.set(node.id, node); },
        getAllNodes: async () => Array.from(nodes.values())
    };
}