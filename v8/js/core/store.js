// v8/core/store.js
// ==========================================================================
// KERNEL V8 - AGENTIC AI STORE
// Motor de Estado Local-First, Triple Entrada y Gobernanza P2P
// ==========================================================================

// 1. ESTADO INICIAL (Génesis)
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
    // Aquí residen las instancias de los Agentes Autónomos V8
    agents: [
        { id: '@PM_Sprint', role: '@aixecador', fmv: 100, active: true },
        { id: '@Dev_Store', role: '@dosos', fmv: 80, active: true },
        { id: '@UX_Weaver', role: '@baixos', fmv: 60, active: true }
    ],
    projects: [],
    session: { activeUserId: 'usr_alvaro_001', role: 'ecosystem-owner' }
};

// 2. REDUCER ASÍNCRONO (Pureza y Mutación Controlada)
async function asyncReducer(state, action) {
    let newState = JSON.parse(JSON.stringify(state)); // Deep Clone seguro

    switch (action.type) {
        case 'INIT_PROJECT_GENESIS':
            // Creación del proyecto desde un Payload
            if (!newState.projects.find(p => p.id === action.payload.id)) {
                newState.projects.push({
                    ...action.payload,
                    createdAt: Date.now()
                });
            }
            break;

        case 'ADD_WORK_ORDER':
            const projWO = newState.projects.find(p => p.id === action.payload.projectId);
            if (projWO) {
                projWO.work_orders = projWO.work_orders || [];
                projWO.work_orders.push({ ...action.payload.workOrder, timestamp: Date.now() });
            }
            break;

        case 'UPDATE_USER_PROFILE':
            const uIdx = newState.globalUsers.findIndex(u => u.id === action.payload.userId);
            if (uIdx > -1) {
                newState.globalUsers[uIdx].profile = { 
                    ...newState.globalUsers[uIdx].profile, 
                    ...action.payload.profile 
                };
            }
            break;

        case 'LOGOUT_USER':
            newState.session = { activeUserId: null, role: 'guest' };
            break;

        // Nuevos reducers Agentic se añadirán en el Sprint 1 (Testing)
    }

    return newState;
}

// 3. CLASE STORE (Patrón Singleton + Suscripciones)
class Store {
    constructor() {
        this.storageKey = 'tt_sos_v8_state';
        this.listeners = [];
        this.loadState();
    }

    // LOCAL-FIRST: Carga de memoria persistente
    loadState() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                // Migración o parcheo si falta algo crucial
                if (!this.state.agents) this.state.agents = initialState.agents;
            } catch (e) {
                console.error("Store V8: Error leyendo disco local. Reiniciando Génesis.", e);
                this.state = initialState;
            }
        } else {
            this.state = initialState;
        }
    }

    getState() {
        return this.state;
    }

    saveState() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        this.notifyListeners();
    }

    async dispatch(action) {
        // En V8, los agentes dejarán aquí su "Thought Signature" en el logger antes de mutar
        console.log(`[Store V8] Mutating: ${action.type}`);
        this.state = await asyncReducer(this.state, action);
        this.saveState();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    
    notifyListeners() {
        this.listeners.forEach(listener => listener());
    }
}

// Exportamos la instancia única
export const store = new Store();
