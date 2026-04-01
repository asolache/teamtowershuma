// =============================================================================
// SOS V10.1 TEST HELPERS
// Ruta: /ia/dev/tests/helpers.js
// =============================================================================

// ── Test primitives ───────────────────────────────────────────────────────────

export function assert(condition, message) {
    if (!condition) throw new Error(`ASSERT FAILED: ${message}`);
}

export function assertEqual(a, b, msg) {
    if (a !== b) throw new Error(`ASSERT EQUAL FAILED: ${msg} — expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

export function assertDeepEqual(a, b, msg) {
    const sa = JSON.stringify(a), sb = JSON.stringify(b);
    if (sa !== sb) throw new Error(`ASSERT DEEP EQUAL FAILED: ${msg}\n  expected: ${sb}\n  got:      ${sa}`);
}

export function assertThrows(fn, msg) {
    let threw = false;
    try { fn(); } catch(_) { threw = true; }
    if (!threw) throw new Error(`ASSERT THROWS FAILED: ${msg} — expected an error but none was thrown`);
}

export function assertContains(arr, item, msg) {
    if (!arr.includes(item)) throw new Error(`ASSERT CONTAINS FAILED: ${msg} — array does not include ${JSON.stringify(item)}`);
}

export function assertType(val, type, msg) {
    if (typeof val !== type) throw new Error(`ASSERT TYPE FAILED: ${msg} — expected ${type}, got ${typeof val}`);
}

export function assertRange(val, min, max, msg) {
    if (val < min || val > max) throw new Error(`ASSERT RANGE FAILED: ${msg} — ${val} not in [${min}, ${max}]`);
}

export function assertAllHave(arr, key, msg) {
    const missing = arr.filter(item => item[key] === undefined || item[key] === null);
    if (missing.length > 0) throw new Error(`ASSERT ALL HAVE FAILED: ${msg} — ${missing.length} items missing key '${key}'`);
}

export function assertUnique(arr, key, msg) {
    const vals = arr.map(i => i[key]);
    const set  = new Set(vals);
    if (set.size !== vals.length) throw new Error(`ASSERT UNIQUE FAILED: ${msg} — duplicate values for key '${key}'`);
}

export function assertOrdered(arr, key, msg) {
    for (let i = 1; i < arr.length; i++) {
        if (arr[i][key] < arr[i-1][key]) {
            throw new Error(`ASSERT ORDERED FAILED: ${msg} — item[${i}].${key}=${arr[i][key]} < item[${i-1}].${key}=${arr[i-1][key]}`);
        }
    }
}

// ── Test runner ───────────────────────────────────────────────────────────────

export class TestRunner {
    constructor() {
        this.results = [];
        this.current_suite = null;
    }

    describe(name, fn) {
        this.current_suite = name;
        try { fn(); }
        catch(e) {
            this.results.push({ suite: name, name: '(suite setup)', passed: false, error: e.message });
        }
        this.current_suite = null;
    }

    it(name, fn) {
        const suite = this.current_suite || '(root)';
        try {
            const result = fn();
            if (result && typeof result.then === 'function') {
                // Silenciar el rechazo de la promesa en la consola del browser.
                // El runner la captura en run() — el "Uncaught (in promise)" es un falso
                // positivo que aparece porque la promesa rechaza antes de que el runner
                // le asigne el .catch(). Añadimos un .catch() vacío inmediatamente.
                result.catch(() => {});
                this.results.push({ suite, name, passed: 'pending', promise: result });
            } else {
                this.results.push({ suite, name, passed: true });
            }
        } catch(e) {
            this.results.push({ suite, name, passed: false, error: e.message });
        }
    }

    async run(suites) {
        for (const suite of suites) {
            await suite(this);
        }

        // Resolve pending async tests
        const pending = this.results.filter(r => r.passed === 'pending');
        for (const p of pending) {
            try {
                await p.promise;
                p.passed = true;
            } catch(e) {
                p.passed = false;
                p.error  = e.message;
            }
            delete p.promise;
        }

        return this.summary();
    }

    summary() {
        const total   = this.results.length;
        const passed  = this.results.filter(r => r.passed === true).length;
        const failed  = this.results.filter(r => r.passed === false).length;
        const pct     = total > 0 ? Math.round((passed/total)*100) : 0;
        return { total, passed, failed, pct, results: this.results };
    }
}

// ── Mock Store ────────────────────────────────────────────────────────────────
// In-memory store mock — does NOT import the real store.js
// This means tests run without IndexedDB, without side effects

export function createMockStore(initialState = {}) {
    let state = {
        config: { version: 'v10-Antigravity', economics: { markup_margin: 0.30, base_pricing: { anthropic: { input: 3.00, output: 15.00 } } } },
        session: { activeUserId: '@alvaro', role: 'ecosystem-owner' },
        globalUsers: [],
        projects: [],
        ...initialState
    };
    const listeners = [];
    const dispatched = [];

    return {
        getState:   () => ({ ...state }),
        dispatch:   async (action) => {
            dispatched.push(action);
            // Apply simple reducers for test assertions
            state = _mockReducer(state, action);
            listeners.forEach(l => l(state));
            return state;
        },
        subscribe:  (fn) => { listeners.push(fn); return () => {}; },
        dispatched: () => [...dispatched],
        lastAction: () => dispatched[dispatched.length - 1],
        reset:      (s = {}) => { state = { ...state, ...s }; dispatched.length = 0; }
    };
}

function _mockReducer(state, action) {
    const s = JSON.parse(JSON.stringify(state));
    switch (action.type) {
        case 'CREATE_PROJECT':
            s.projects.push({ id: action.payload.id, nombre: action.payload.nombre || 'Test', work_orders: [], evals: [], ledger: [], logs: [], ...action.payload });
            break;
        case 'UPDATE_PROJECT_INFO': {
            const idx = s.projects.findIndex(p => p.id === action.payload.projectId);
            if (idx > -1) Object.assign(s.projects[idx], action.payload.updates);
            break;
        }
        case 'CONSOLIDATE_WORK_ORDER': {
            const pi = s.projects.findIndex(p => p.id === action.payload.projectId);
            if (pi > -1) {
                const wos = s.projects[pi].work_orders || [];
                const wi  = wos.findIndex(w => w.hash === action.payload.woHash);
                if (wi > -1) { wos[wi].status = 'consolidated'; wos[wi].evalsResult = action.payload.evalsResult; }
                if (!s.projects[pi].ledger) s.projects[pi].ledger = [];
                s.projects[pi].ledger.push({ type: 'SOP_EXECUTION', woHash: action.payload.woHash, timestamp: Date.now() });
            }
            break;
        }
        case 'ARTIFACT_CREATED': {
            const pi = s.projects.findIndex(p => p.id === action.payload.projectId);
            if (pi > -1) {
                if (!s.projects[pi].artifacts) s.projects[pi].artifacts = [];
                s.projects[pi].artifacts.push(action.payload.artifact);
            }
            break;
        }
        case 'GATE_BLOCKED':
            if (!s.gateViolations) s.gateViolations = { count: 0, log: [] };
            s.gateViolations.count++;
            s.gateViolations.log.push(action.payload);
            break;
        default: break;
    }
    s.lastUpdated = Date.now();
    return s;
}

// ── Mock KB ───────────────────────────────────────────────────────────────────

export function createMockKB() {
    const store = new Map();
    return {
        init:       async () => true,
        saveNode:   async (node) => { if (!node?.id) throw new Error('[MockKB] node needs id'); store.set(node.id, { ...node }); return node; },
        getNode:    async (id)   => store.get(id) || null,
        deleteNode: async (id)   => { store.delete(id); return true; },
        getAllNodes: async ()     => [...store.values()],
        getNodesByType:    async (type) => [...store.values()].filter(n => n.type === type),
        getNodesByProject: async (pid)  => [...store.values()].filter(n => n.projectId === pid),
        purge:      async ()     => { store.clear(); return true; },
        exportAll:  async ()     => ({ version: 'v10', count: store.size, nodes: [...store.values()] }),
        _raw:       store
    };
}

// ── Sample VnaNetwork for tests ───────────────────────────────────────────────

export function sampleVnaNetwork(overrides = {}) {
    return {
        '@context': 'https://teamtowers.io/sos/v10/vna',
        '@type':    'VnaNetwork',
        id:         'vna-test-001',
        mission:    'Plataforma de formación online para profesionales del diseño',
        vision:     'Ecosistema donde diseñadores aprenden, colaboran y monetizan',
        sector:     'edtech',
        nodes: [
            { id: 'n-plataforma',  label: 'Plataforma',      role: 'process',      tier: 0, fmv: 0,  slices: 0 },
            { id: 'n-instructor',  label: 'Instructor',       role: 'human',        tier: 1, fmv: 60, slices: 0 },
            { id: 'n-estudiante',  label: 'Estudiante',       role: 'human',        tier: 1, fmv: 0,  slices: 0 },
            { id: 'n-contenido',   label: 'Contenido Curso',  role: 'resource',     tier: 2, fmv: 40, slices: 0 },
            { id: 'n-ia-tutor',    label: 'IA Tutor',         role: 'agent',        tier: 0, fmv: 0.015, slices: 0 },
            { id: 'n-mercado',     label: 'Marketplace',      role: 'organization', tier: 3, fmv: 0,  slices: 0 },
        ],
        exchanges: [
            { id: 'ex-01', from: 'n-instructor', to: 'n-contenido',  type: 'tangible',   category: 'deliverable', label: 'Crea módulo didáctico',       trigger: 'on-demand',  frequency: 'once',      automatable: false },
            { id: 'ex-02', from: 'n-contenido',  to: 'n-plataforma',  type: 'tangible',   category: 'resource',    label: 'Sube contenido a plataforma', trigger: 'on-demand',  frequency: 'once',      automatable: true  },
            { id: 'ex-03', from: 'n-plataforma', to: 'n-estudiante',  type: 'tangible',   category: 'service',     label: 'Acceso a curso',              trigger: 'on-enroll',  frequency: 'recurring', automatable: true  },
            { id: 'ex-04', from: 'n-ia-tutor',   to: 'n-estudiante',  type: 'tangible',   category: 'service',     label: 'Feedback IA personalizado',   trigger: 'on-submit',  frequency: 'recurring', automatable: true  },
            { id: 'ex-05', from: 'n-estudiante', to: 'n-instructor',  type: 'intangible', category: 'feedback',    label: 'Valoración del curso',        trigger: 'on-complete',frequency: 'once',      automatable: false },
            { id: 'ex-06', from: 'n-instructor', to: 'n-mercado',     type: 'tangible',   category: 'deliverable', label: 'Publica en marketplace',      trigger: 'on-demand',  frequency: 'once',      automatable: true  },
            { id: 'ex-07', from: 'n-mercado',    to: 'n-instructor',  type: 'tangible',   category: 'payment',     label: 'Revenue share',               trigger: 'on-sale',    frequency: 'recurring', automatable: true  },
            { id: 'ex-08', from: 'n-plataforma', to: 'n-ia-tutor',    type: 'intangible', category: 'knowledge',   label: 'Datos de aprendizaje',        trigger: 'continuous', frequency: 'recurring', automatable: true  },
        ],
        meta: { health_score: 0.72, reasoning: 'Red equilibrada con flujo bidireccional', assumptions: [], open_question: null },
        ...overrides
    };
}
