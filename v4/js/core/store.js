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
            case 'ADD_PROJECT': {
                const sectorKey = action.payload.sector || 'general';
                const sectorData = GLOBAL_ONTOLOGY[sectorKey] || GLOBAL_ONTOLOGY['general'] || { roles: [] };
                const sourceRoles = sectorData.roles || (Array.isArray(sectorData) ? sectorData : []);

                const baseRoles = sourceRoles.map((r, idx) => ({
                    id: `role-${r.levelId.replace('@','')}-${Date.now()}-${idx}`, // ID más robusto
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

            case 'ADD_ROLE': {
                const { projectId, role } = action.payload;
                if (!role || !projectId) return state; 
                const safeRole = {
                    id: role.id || `role-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    name: role.name || 'Nuevo Nodo',
                    levelId: role.levelId || '@baixos',
                    multiplier: role.multiplier || 1.0,
                    fmv: role.fmv || 50,
                    isArchived: false,
                    ...role
                };
                return { ...state, projects: state.projects.map(p => p.id === projectId ? { ...p, roles: [...p.roles, safeRole] } : p) };
            }

            case 'UPDATE_ROLE':
                return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, roles: p.roles.map(r => r.id === action.payload.roleId ? { ...r, ...action.payload.updates } : r) } : p) };

            case 'TOGGLE_ROLE_ARCHIVE':
                return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, roles: p.roles.map(r => r.id === action.payload.roleId ? { ...r, isArchived: !r.isArchived } : r) } : p) };

            case 'APPROVE_TRANSACTION':
                return { ...state, projects: state.projects.map(p => {
                    if (p.id !== action.payload.projectId) return p;
                    const tx = p.transactions.find(t => t.hash === action.payload.txHash);
                    if (!tx) return p;
                    const role = p.roles.find(r => r.id === tx.from);
                    const archMult = p.archetype === 'startup' ? 2.0 : (p.archetype === 'dao' ? 1.5 : 1.0);
                    const val = (tx.realHours || tx.horas || 0) * (role?.fmv || 50) * (role?.multiplier || 1) * archMult;
                    return { ...p, transactions: p.transactions.map(t => t.hash === tx.hash ? { ...t, status: 'consolidated', valorCongelado: val } : t),
                        ledger: [...p.ledger, { userId: tx.assigneeId, roleId: tx.from, description: tx.entregable, valorCongelado: val, timestamp: Date.now(), type: 'tangible' }] };
                })};

            case 'LOGIN_USER':
                return { ...state, session: { activeUserId: action.payload.userId, role: action.payload.userId === 'ecosystem-admin' ? 'admin' : 'user' } };

            default: return state;
        }
    } catch (e) { console.error("KRNL_PANIC:", e); return state; }
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

    // 🎓 DIDÁCTICA SUPERIOR: Probabilidad de Éxito (Slicing Pie + VNA)
    calculateSuccessProbability(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return 0;
        
        const roles = p.roles.filter(r => !r.isArchived);
        const hasTangible = p.ledger.length > 0; // ¿Hay Slicing Pie activo?
        const hasIntangible = roles.some(r => r.levelId === '@anxaneta') && roles.some(r => r.levelId === '@dosos'); // ¿Hay VNA/Estructura?

        let probability = 35; // Base de fracaso del 65%
        if (hasTangible) probability += 30; // El incentivo dinámico reduce conflictos
        if (hasIntangible) probability += 35; // La estructura de red reduce la entropía
        
        return {
            percentage: probability,
            label: probability > 70 ? "Alta Resiliencia" : (probability > 40 ? "Riesgo Moderado" : "Alta Fragilidad"),
            color: probability > 70 ? "var(--accent-green)" : (probability > 40 ? "var(--accent-gold)" : "var(--accent-red)")
        };
    }

    calculateMaturityIndex(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.roles.length) return { score: 0, alerts: ["⚠️ Red sin ADN biológico."] };
        let alerts = [];
        const roles = p.roles.filter(r => !r.isArchived);
        if (!roles.some(r => r.levelId === '@anxaneta')) alerts.push("🔴 <b>Sin @anxaneta:</b> No hay flujo de visión estratégica.");
        if (!roles.some(r => r.levelId === '@dosos')) alerts.push("🟡 <b>Sin @dosos:</b> Los entregables no se auditan; el equity se devalúa.");
        return { score: Math.max(0, 100 - (alerts.length * 30)), alerts };
    }
}
export const store = new Store();
