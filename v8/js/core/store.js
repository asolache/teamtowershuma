// v8/js/core/store.js
// ==========================================================================
// KERNEL V8 - AGENTIC AI STORE
// Motor de Estado Local-First, Triple Entrada y Gobernanza P2P
// ==========================================================================

const initialState = {
    config: {
        version: '8.0.0',
        ecosystemName: 'TeamTowers Agentic Network',
        globalPrompt: 'Eres un Nodo Orquestador de una Colla Híbrida (Humanos + IA).',
        archetype: 'startup'
    },
    globalUsers: [
        {
            id: 'usr_alvaro_001',
            name: 'Alvaro',
            globalRole: 'ecosystem-owner',
            wallet: '0xMasterArchitect...',
            profile: {
                vision: "Master Architect V8. Guiando a la IA, no programando para ella.",
                structural_affinity: ["@anxaneta"],
                guardian_authority: ["creator", "magician"],
                isOpenToWork: true
            }
        }
    ],
    agents: [
        { id: '@PM_Sprint', role: '@aixecador', fmv: 100, active: true },
        { id: '@Dev_Store', role: '@dosos', fmv: 80, active: true },
        { id: '@UX_Weaver', role: '@baixos', fmv: 60, active: true }
    ],
    projects: [],
    session: { activeUserId: 'usr_alvaro_001', role: 'ecosystem-owner' }
};

async function asyncReducer(state, action) {
    let newState = JSON.parse(JSON.stringify(state)); 

    switch (action.type) {
        case 'INIT_PROJECT_GENESIS':
            if (!newState.projects.find(p => p.id === action.payload.id)) {
                newState.projects.push({ ...action.payload, createdAt: Date.now() });
            }
            break;
        case 'LOGOUT_USER':
            newState.session = { activeUserId: null, role: 'guest' };
            break;
    }
    return newState;
}

class Store {
    constructor() {
        this.storageKey = 'tt_sos_v8_state';
        this.listeners = [];
        this.loadState();
    }

    loadState() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                if (!this.state.agents) this.state.agents = initialState.agents;
            } catch (e) {
                console.error("Store V8: Error local. Reiniciando Génesis.", e);
                this.state = initialState;
            }
        } else {
            this.state = initialState;
        }
    }

    getState() { return this.state; }

    saveState() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        this.notifyListeners();
    }

    async dispatch(action) {
        console.log(`[Store V8 Agentic Signature] Mutating: ${action.type}`);
        this.state = await asyncReducer(this.state, action);
        this.saveState();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    }
    
    notifyListeners() { this.listeners.forEach(listener => listener()); }
}

export const store = new Store();
