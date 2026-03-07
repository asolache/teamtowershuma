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
            const sectorKey = action.payload.sector || 'general';
            const sectorData = GLOBAL_ONTOLOGY[sectorKey] || GLOBAL_ONTOLOGY['general'] || { roles: [] };
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
                roles: baseRoles,
                usuarios: [], asignaciones: [], transactions: [], ledger: [], alerts: []
            };
            return { ...state, projects: [...state.projects, newProject] };
        }

        // 📝 FIX TEST: Edición Atómica (Evita el error 'undefined' en roles)
        case 'UPDATE_ROLE':
            return {
                ...state,
                projects: state.projects.map(p => p.id === action.payload.projectId ? {
                    ...p, roles: p.roles.map(r => r.id === action.payload.roleId ? { ...r, ...action.payload.updates } : r)
                } : p)
            };

        // 🔒 FIX TEST: Inmutabilidad vía Archivado
        case 'TOGGLE_ROLE_ARCHIVE':
            return {
                ...state,
                projects: state.projects.map(p => p.id === action.payload.projectId ? {
                    ...p, roles: p.roles.map(r => r.id === action.payload.roleId ? { ...r, isArchived: !r.isArchived } : r)
                } : p)
            };

        // 🔗 FIX TEST: Transacciones (Previene el crash 'tx is undefined')
        case 'ADD_TRANSACTION': {
            const newTx = {
                hash: '0x' + Math.random().toString(16).slice(2, 10),
                timestamp: Date.now(),
                status: action.payload.tx.status || 'theoretical',
                ...action.payload.tx
            };
            return {
                ...state,
                projects: state.projects.map(p => p.id === action.payload.projectId ? {
                    ...p, transactions: [...(p.transactions || []), newTx]
                } : p)
            };
        }

        case 'APPROVE_TRANSACTION':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id !== action.payload.projectId) return p;
                    const tx = p.transactions.find(t => t.hash === action.payload.txHash);
                    if (!tx) return p;
                    const role = p.roles.find(r => r.id === tx.from);
                    const factors = { 'startup': 2.0, 'corporate': 1.0, 'dao': 1.5 };
                    const val = (tx.realHours || 0) * (role?.fmv || 50) * (role?.multiplier || 1) * (factors[p.archetype] || 1.0);
                    
                    return {
                        ...p,
                        transactions: p.transactions.map(t => t.hash === tx.hash ? { ...t, status: 'consolidated', valorCongelado: val } : t),
                        ledger: [...p.ledger, { userId: tx.assigneeId, roleId: tx.from, description: tx.entregable, valorCongelado: val, timestamp: Date.now() }]
                    };
                })
            };

        case 'LOGIN_USER':
            return { ...state, session: { activeUserId: action.payload.userId, role: action.payload.userId === 'ecosystem-admin' ? 'admin' : 'user' } };

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
            // 💾 FIX TEST: Persistencia inmediata
            localStorage.setItem('tt_sos_state', JSON.stringify(this.state));
            this.listeners.forEach(l => l());
        } catch (e) { console.error("KRNL_FATAL:", e); }
    }
    subscribe(listener) { this.listeners.push(listener); }

    // 🎓 LÓGICA VNA (Verna Allee)
    calculateMaturityIndex(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.roles.length) return { score: 0, alerts: ["⚠️ ADN vacío."] };
        let alerts = [];
        const roles = p.roles.filter(r => !r.isArchived);
        if (!roles.some(r => r.levelId === '@anxaneta')) alerts.push("🔴 <b>Falta Estrategia:</b> La red no tiene dirección.");
        if (!roles.some(r => r.levelId === '@dosos')) alerts.push("🟡 <b>Falta Auditoría:</b> Nadie valida el valor intangible.");
        return { score: Math.max(0, 100 - (alerts.length * 30)), alerts };
    }

    calculateResilience(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return 100;
        const reported = p.transactions.filter(t => t.status === 'reported').length;
        return Math.max(0, 100 - (reported * 10));
    }
}

export const store = new Store();
