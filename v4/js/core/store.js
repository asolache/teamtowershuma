// js/core/store.js
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';

const initialState = {
    config: { theme: 'dark', ecosystemName: 'TeamTowers Network', globalPrompt: '' },
    ontology: { sectores: GLOBAL_ONTOLOGY || {} },
    globalUsers: [],
    projects: [],
    session: { activeUserId: 'ecosystem-admin', role: 'admin' }
};

function reducer(state = initialState, action) {
    switch (action.type) {
        case 'UPDATE_GLOBAL_CONFIG':
            return { ...state, config: { ...state.config, ...action.payload } };

        case 'ADD_PROJECT': {
            // 🧬 v6.3: Lógica de Inyección de ADN Robusta
            const sectorKey = action.payload.sector || 'general';
            const sectorData = GLOBAL_ONTOLOGY[sectorKey] || GLOBAL_ONTOLOGY['general'] || { roles: [] };
            
            // Si la ontología viene como objeto directo o con propiedad .roles
            const sourceRoles = sectorData.roles || (Array.isArray(sectorData) ? sectorData : []);

            const baseRoles = sourceRoles.map(r => ({
                id: `role-${r.levelId.replace('@','')}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                levelId: r.levelId,
                name: r.name,
                multiplier: r.multiplier || 1.0,
                fmv: r.fmv || 50,
                ai_prompt: r.ai_prompt || '',
                standard_deliverables: r.standard_deliverables || [],
                isArchived: false
            }));

            const newProject = {
                id: action.payload.id || ('proj-' + Date.now()),
                nombre: action.payload.nombre || 'Nueva Red',
                sector: sectorKey,
                archetype: action.payload.archetype || 'startup', 
                ownerId: state.session.activeUserId,
                prompt: '',
                config: { tokenomics: 'startup' },
                roles: baseRoles, // Aquí nacen los 5-6 roles de golpe
                usuarios: [], 
                asignaciones: [], 
                transactions: [], 
                ledger: [], 
                alerts: []
            };
            return { ...state, projects: [...state.projects, newProject] };
        }

        case 'UPDATE_ROLE': {
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        return {
                            ...p,
                            roles: p.roles.map(r => r.id === action.payload.roleId ? { ...r, ...action.payload.updates } : r)
                        };
                    }
                    return p;
                })
            };
        }

        case 'ADD_ROLE': {
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        return { ...p, roles: [...p.roles, action.payload.role] };
                    }
                    return p;
                })
            };
        }

        case 'APPROVE_TRANSACTION': {
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        let tx = p.transactions.find(t => t.hash === action.payload.txHash);
                        if (!tx) return p;
                        const role = p.roles.find(r => r.id === tx.from);
                        const factors = { 'startup': 2.0, 'corporate': 1.0, 'dao': 1.5 };
                        const archFactor = factors[p.archetype] || 1.0;
                        const val = (tx.realHours || 0) * (role?.fmv || 50) * (role?.multiplier || 1) * archFactor;
                        
                        return {
                            ...p,
                            transactions: p.transactions.map(t => t.hash === tx.hash ? { ...t, status: 'consolidated', valorCongelado: val } : t),
                            ledger: [...p.ledger, { userId: tx.assigneeId, roleId: tx.from, description: tx.entregable, valorCongelado: val, timestamp: Date.now() }]
                        };
                    }
                    return p;
                })
            };
        }

        case 'LOGIN_USER':
            return { ...state, session: { activeUserId: action.payload.userId, role: action.payload.userId === 'ecosystem-admin' ? 'admin' : 'user' } };

        case 'ADD_USER':
            if (state.globalUsers.find(u => u.id === action.payload.id)) return state;
            return { ...state, globalUsers: [...state.globalUsers, action.payload] };

        default: return state;
    }
}

class Store {
    constructor() {
        const saved = localStorage.getItem('tt_sos_state');
        this.state = saved ? JSON.parse(saved) : initialState;
        this.listeners = [];
    }
    getState() { return this.state; }
    dispatch(action) {
        try {
            this.state = reducer(this.state, action);
            localStorage.setItem('tt_sos_state', JSON.stringify(this.state));
            this.listeners.forEach(l => l());
        } catch (e) { console.error("FATAL_KRNL_CRASH:", e); }
    }
    subscribe(listener) { this.listeners.push(listener); }

    calculateMaturityIndex(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.roles.length) return { score: 0, alerts: ["⚠️ Red sin ADN (roles vacíos)."] };
        let alerts = [];
        const roles = p.roles.filter(r => !r.isArchived);
        if (!roles.some(r => r.levelId === '@anxaneta')) alerts.push("🔴 <b>Falta Estrategia:</b> Sin dirección, la red colapsará por entropía.");
        if (!roles.some(r => r.levelId === '@dosos')) alerts.push("🟡 <b>Falta Auditoría:</b> Nadie valida el PoW. Riesgo de fraude.");
        return { score: Math.max(0, 100 - (alerts.length * 30)), alerts };
    }

    calculateResilience(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return 100;
        const pending = p.transactions.filter(t => t.status === 'reported').length;
        return Math.max(0, 100 - (pending * 10));
    }

    calculateHarvest(projectId, totalValuation) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.ledger.length) return [];
        let capTable = {}; let totalSlices = 0;
        p.ledger.forEach(l => {
            capTable[l.userId] = (capTable[l.userId] || 0) + l.valorCongelado;
            totalSlices += l.valorCongelado;
        });
        return Object.keys(capTable).map(userId => {
            const ratio = capTable[userId] / totalSlices;
            return {
                userId, percentage: (ratio * 100).toFixed(2) + '%',
                financialValue: (ratio * totalValuation).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
            };
        });
    }
}

export const store = new Store();
