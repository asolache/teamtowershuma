// js/core/store.js
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';

const initialState = {
    config: { theme: 'dark', ecosystemName: 'TeamTowers Network', globalPrompt: '' },
    ontology: { sectores: {} },
    globalUsers: [],
    projects: [],
    session: { activeUserId: 'ecosystem-admin', role: 'admin' }
};

function reducer(state = initialState, action) {
    switch (action.type) {
        case 'UPDATE_GLOBAL_CONFIG':
            return { ...state, config: { ...state.config, ...action.payload } };

        case 'ADD_PROJECT': {
            const newProject = {
                id: action.payload.id || ('proj-' + Date.now()),
                nombre: action.payload.nombre || 'Nueva Red',
                sector: action.payload.sector || 'general',
                archetype: action.payload.archetype || 'startup', 
                ownerId: state.session.activeUserId,
                prompt: '',
                config: { tokenomics: 'startup' },
                roles: [], usuarios: [], asignaciones: [], transactions: [], ledger: [], alerts: []
            };
            return { ...state, projects: [...state.projects, newProject] };
        }

        // 🔥 FIX TEST: Edición de nombres de roles (Atomic Update)
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
            if (!action.payload.role) return state; // Prevent Crash
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

        case 'UPDATE_PROJECT_INFO':
            return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, ...action.payload.updates } : p) };

        case 'ASSIGN_USER_ROLE':
            return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, asignaciones: [...p.asignaciones.filter(a => a.roleId !== action.payload.roleId), { userId: action.payload.userId, roleId: action.payload.roleId }] } : p) };

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
        } catch (e) { console.error("KRNL_ERR:", e); }
    }
    subscribe(listener) { this.listeners.push(listener); }

    // 🎓 CAPA DIDÁCTICA (Verna Allee + Mike Moyer)
    calculateMaturityIndex(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return { score: 0, alerts: [] };
        let alerts = [];
        const roles = p.roles.filter(r => !r.isArchived);
        if (!roles.some(r => r.levelId === '@anxaneta')) alerts.push("🔴 <b>Falta Estrategia:</b> Sin un @anxaneta, el flujo intangible de 'Dirección' se pierde.");
        if (!roles.some(r => r.levelId === '@dosos')) alerts.push("🟡 <b>Falta Auditoría:</b> Sin @dosos, no hay control de calidad sobre el PoW.");
        if (!roles.some(r => r.levelId === '@pinya')) alerts.push("🔵 <b>Falta Soporte:</b> Los niveles altos se quemarán haciendo tareas base.");
        return { score: Math.max(0, 100 - (alerts.length * 25)), alerts };
    }

    calculateResilience(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return 100;
        const pending = p.transactions.filter(t => t.status === 'reported').length;
        return Math.max(0, 100 - (pending * 10));
    }
}

export const store = new Store();
