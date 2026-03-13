// v8/js/core/store.js
// ==========================================================================
// KERNEL V8 - AGENTIC AI STORE (Fusión V7 + V8)
// Motor de Estado Local-First, Triple Entrada, Gobernanza P2P y Slicing Pie
// ==========================================================================

const initialState = {
    config: {
        version: '8.0.1',
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
        case 'LOGOUT_USER':
            newState.session = { activeUserId: null, role: 'guest' };
            break;

        case 'INIT_PROJECT_GENESIS':
        case 'CREATE_PROJECT': {
            if (!newState.projects.find(p => p.id === action.payload.id)) {
                newState.projects.push({ 
                    ...action.payload, 
                    createdAt: Date.now(),
                    roles: action.payload.roles || [],
                    usuarios: action.payload.usuarios || [{ id: newState.session.activeUserId, permissions: { canCreateWO: true, canApprove: true } }],
                    vna_flows: action.payload.vna_flows || [],
                    work_orders: action.payload.work_orders || [],
                    ledger: action.payload.ledger || [],
                    asignaciones: action.payload.asignaciones || []
                });
            }
            break;
        }

        case 'UPDATE_PROJECT_INFO': {
            const pInfo = newState.projects.find(p => p.id === action.payload.projectId);
            if (pInfo) {
                // Merge seguro de usuarios
                if (action.payload.updates.usuarios) {
                    action.payload.updates.usuarios.forEach(newU => {
                        const idx = pInfo.usuarios.findIndex(u => u.id === newU.id);
                        if (idx > -1) pInfo.usuarios[idx] = { ...pInfo.usuarios[idx], ...newU };
                        else pInfo.usuarios.push(newU);
                    });
                    delete action.payload.updates.usuarios;
                }
                Object.assign(pInfo, action.payload.updates);
            }
            break;
        }
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
                
                // Asegurar que los proyectos antiguos tengan las matrices necesarias para no fallar
                if (this.state.projects) {
                    this.state.projects = this.state.projects.map(p => ({
                        ...p,
                        roles: p.roles || [],
                        ledger: p.ledger || [],
                        work_orders: p.work_orders || [],
                        vna_flows: p.vna_flows || [],
                        usuarios: p.usuarios || []
                    }));
                }
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
        console.log(`[Store V8 Mutating] ${action.type}`);
        this.state = await asyncReducer(this.state, action);
        this.saveState();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    }
    
    notifyListeners() { this.listeners.forEach(listener => listener()); }

    // =========================================================
    // MÉTODOS DE ANÁLISIS VNA Y ECONOMÍA (Heredados de V7)
    // =========================================================
    
    canUserViewProject(projectId, userId, globalRole) {
        if (globalRole === 'ecosystem-owner') return true; 
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return false;
        if (p.ownerId === userId) return true;
        if (p.usuarios && p.usuarios.find(u => u.id === userId)) return true;
        if (p.isPrivate) return false; 
        return true;
    }

    calculateResilience(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return 100;
        
        // Sumar transacciones atascadas
        const oldStuck = (p.transactions || []).filter(t => t.status === 'reported' || t.status === 'pinged').length;
        const newStuck = (p.work_orders || []).filter(t => t.status === 'reported' || t.status === 'pinged').length;
        const atascos = oldStuck + newStuck;
        
        return Math.round(Math.max(0, 100 - (atascos * 5)));
    }

    calculateHarvest(projectId, totalValuation = 0) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.ledger || p.ledger.length === 0) return [];
        
        let capTable = {};
        let totalSlices = 0;
        
        p.ledger.forEach(l => {
            const key = l.userId || l.roleId || 'unknown';
            if (!capTable[key]) capTable[key] = { userId: l.userId, roleId: l.roleId, totalValue: 0 };
            capTable[key].totalValue += l.valorCongelado;
            totalSlices += l.valorCongelado;
        });
        
        if (totalSlices === 0) return [];
        
        return Object.keys(capTable).map(key => {
            const entry = capTable[key];
            const percentage = (entry.totalValue / totalSlices);
            return { 
                userId: entry.userId, 
                roleId: entry.roleId, 
                totalValue: entry.totalValue, 
                slices: entry.totalValue, 
                percentage: (percentage * 100).toFixed(2), 
                financialValue: (percentage * totalValuation) 
            };
        }).sort((a, b) => b.totalValue - a.totalValue);
    }
}

export const store = new Store();
