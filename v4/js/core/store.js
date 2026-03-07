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
    try {
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
                    isArchived: false,
                    standard_deliverables: r.standard_deliverables || []
                }));

                const newProject = {
                    id: action.payload.id || ('proj-' + Date.now()),
                    nombre: action.payload.nombre || 'Nueva Red',
                    sector: sectorKey,
                    archetype: action.payload.archetype || 'startup', 
                    ownerId: state.session.activeUserId,
                    prompt: action.payload.prompt || '',
                    config: { tokenomics: 'startup' },
                    roles: baseRoles,
                    usuarios: [], asignaciones: [], transactions: [], ledger: [], alerts: []
                };
                return { ...state, projects: [...state.projects, newProject] };
            }

            // 🛡️ FIX: ADD_ROLE Ultra-Protegido (Evita el Crash de 'undefined')
            case 'ADD_ROLE': {
                const { projectId, role } = action.payload;
                if (!role || !projectId) return state; 
                
                const safeRole = {
                    id: role.id || `role-${Date.now()}`,
                    name: role.name || 'Nuevo Nodo',
                    levelId: role.levelId || '@baixos',
                    multiplier: role.multiplier || 1.0,
                    fmv: role.fmv || 50,
                    isArchived: false,
                    ...role
                };

                return {
                    ...state,
                    projects: state.projects.map(p => p.id === projectId ? {
                        ...p, roles: [...p.roles, safeRole]
                    } : p)
                };
            }

            case 'UPDATE_ROLE':
                return {
                    ...state,
                    projects: state.projects.map(p => p.id === action.payload.projectId ? {
                        ...p, roles: p.roles.map(r => r.id === action.payload.roleId ? { ...r, ...action.payload.updates } : r)
                    } : p)
                };

            case 'ADD_TRANSACTION': {
                if (!action.payload.tx) return state;
                const newTx = {
                    hash: '0x' + Math.random().toString(16).slice(2, 10),
                    timestamp: Date.now(),
                    status: 'theoretical',
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
                        const archMult = p.archetype === 'startup' ? 2.0 : (p.archetype === 'dao' ? 1.5 : 1.0);
                        const val = (tx.realHours || tx.horas || 0) * (role?.fmv || 50) * (role?.multiplier || 1) * archMult;
                        
                        return {
                            ...p,
                            transactions: p.transactions.map(t => t.hash === tx.hash ? { ...t, status: 'consolidated', valorCongelado: val } : t),
                            ledger: [...p.ledger, { 
                                userId: tx.assigneeId, 
                                roleId: tx.from, 
                                description: tx.entregable, 
                                valorCongelado: val, 
                                timestamp: Date.now(),
                                type: 'tangible' // Mike Moyer's Side
                            }]
                        };
                    })
                };

            case 'LOGIN_USER':
                return { ...state, session: { activeUserId: action.payload.userId, role: action.payload.userId === 'ecosystem-admin' ? 'admin' : 'user' } };

            case 'ADD_USER':
                if (state.globalUsers.find(u => u.id === action.payload.id)) return state;
                return { ...state, globalUsers: [...state.globalUsers, action.payload] };

            default: return state;
        }
    } catch (e) {
        console.error("KERNEL_PANIC_RECOVERY:", e);
        return state;
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
        this.state = reducer(this.state, action);
        localStorage.setItem('tt_sos_state', JSON.stringify(this.state));
        this.listeners.forEach(l => l());
    }
    subscribe(listener) { this.listeners.push(listener); }

    // 🎓 CAPA DIDÁCTICA V6.5: VALOR TANGIBLE E INTANGIBLE
    calculateMaturityIndex(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.roles.length) return { score: 0, alerts: ["⚠️ Red sin ADN biológico."] };
        
        let alerts = [];
        const roles = p.roles.filter(r => !r.isArchived);
        
        // Verna Allee Logic: Equilibrium of Flows
        const hasStrategy = roles.some(r => r.levelId === '@anxaneta');
        const hasAudit = roles.some(r => r.levelId === '@dosos');
        const hasBase = roles.some(r => r.levelId === '@pinya');

        if (!hasStrategy) alerts.push("🔴 <b>Riesgo de Deriva:</b> Sin @anxaneta, los flujos intangibles de 'Propósito' no nutren a la red.");
        if (!hasAudit) alerts.push("🟡 <b>Riesgo de Inflación:</b> Sin @dosos, el valor tangible no se audita. Los Slices pierden credibilidad.");
        if (!hasBase) alerts.push("🔵 <b>Riesgo de Burnout:</b> Sin @pinya, el conocimiento no se documenta y los seniors se agotan.");

        return { score: Math.max(0, 100 - (alerts.length * 25)), alerts };
    }

    calculateResilience(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return 100;
        const reported = p.transactions.filter(t => t.status === 'reported').length;
        return Math.max(0, 100 - (reported * 10));
    }
}

export const store = new Store();
