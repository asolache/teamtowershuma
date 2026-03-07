// js/core/store.js
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';

const initialState = {
    config: {
        theme: 'dark',
        ecosystemName: 'TeamTowers Network',
        globalPrompt: 'Eres el orquestador principal de un sistema DAO enfocado en meritocracia y transparencia.'
    },
    ontology: {
        sectores: {
            "startup": {
                "@anxaneta": { name: "CEO / Founder", multiplier: 3.0, ai_prompt: "Eres el CEO.", standard_deliverables: [] },
                "@aixecador": { name: "Product Manager", multiplier: 2.0, ai_prompt: "Eres el PM.", standard_deliverables: [] },
                "@dosos": { name: "QA / Auditor", multiplier: 1.5, ai_prompt: "Eres QA.", standard_deliverables: [] },
                "@baixos": { name: "Desarrollador Senior", multiplier: 1.2, ai_prompt: "Eres Dev.", standard_deliverables: [] },
                "@pinya": { name: "Soporte / Junior", multiplier: 1.0, ai_prompt: "Eres Soporte.", standard_deliverables: [] }
            },
            "marketing": {
                "@anxaneta": { name: "Strategy", multiplier: 3.0 },
                "@aixecador": { name: "Campaign Manager", multiplier: 2.0 },
                "@dosos": { name: "Analytics", multiplier: 1.5 },
                "@baixos": { name: "Content Creator", multiplier: 1.2 },
                "@pinya": { name: "Community Manager", multiplier: 1.0 }
            }
        }
    },
    globalUsers: [
        { id: '@user1', name: 'Alice Node', walletOrSocial: '0x123...' },
        { id: '@user2', name: 'Bob Builder', walletOrSocial: 'bob@email.com' }
    ],
    macroFlows: [], 
    projects: [],
    session: {
        activeUserId: 'ecosystem-admin',
        role: 'admin'
    }
};

function reducer(state = initialState, action) {
    switch (action.type) {
        case 'UPDATE_GLOBAL_CONFIG':
            return { ...state, config: { ...state.config, ...action.payload } };

        case 'LOGIN_USER':
            const isAdmin = action.payload.userId === 'ecosystem-admin';
            return { ...state, session: { activeUserId: action.payload.userId, role: isAdmin ? 'admin' : 'user' } };
            
        case 'LOGOUT_USER':
            return { ...state, session: { activeUserId: 'ecosystem-admin', role: 'admin' } };

        case 'ADD_PROJECT': {
            let sectorDataObj = GLOBAL_ONTOLOGY[action.payload.sector];
            let sectorRolesArray = [];

            if (sectorDataObj && sectorDataObj.roles) {
                sectorRolesArray = sectorDataObj.roles;
            } else {
                const legacySectorData = state.ontology.sectores[action.payload.sector] || {};
                Object.keys(legacySectorData).forEach(levelId => {
                    const r = legacySectorData[levelId];
                    sectorRolesArray.push({
                        levelId, name: r.name || levelId, multiplier: r.multiplier || 1.0,
                        fmv: r.fmv || 50, ai_prompt: r.ai_prompt || '', standard_deliverables: r.standard_deliverables || []
                    });
                });
            }

            const baseRoles = sectorRolesArray.map(r => ({
                id: `role-${r.levelId.replace('@','')}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                levelId: r.levelId, name: r.name, multiplier: r.multiplier || 1.0, fmv: r.fmv || 50,
                ai_prompt: r.ai_prompt || '', standard_deliverables: r.standard_deliverables || [], isArchived: false
            }));

            const newProject = {
                id: action.payload.id || ('proj-' + Date.now()),
                nombre: action.payload.nombre || 'Nuevo Proyecto',
                sector: action.payload.sector || 'general',
                tipo: action.payload.tipo || 'project',
                archetype: action.payload.archetype || 'startup', // 🚀 v6.1: Startup, Corporate o DAO
                ownerId: state.session.activeUserId,
                prompt: '',
                config: { tokenomics: 'startup' },
                roles: baseRoles,
                usuarios: [], asignaciones: [], transactions: [], ledger: [], alerts: []
            };
            return { ...state, projects: [...state.projects, newProject] };
        }

        case 'APPROVE_TRANSACTION': {
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        let txToApprove = p.transactions.find(tx => tx.hash === action.payload.txHash);
                        if (!txToApprove) return p;

                        const roleFrom = p.roles.find(r => r.id === txToApprove.from);
                        const roleMultiplier = roleFrom ? (roleFrom.multiplier || 1) : 1;
                        const fmv = roleFrom ? (roleFrom.fmv || 50) : 50;
                        const horas = txToApprove.realHours || txToApprove.horas || 0;

                        // 🚀 v6.1: Cálculo con Factor de Arquetipo
                        const factors = { 'startup': 2.0, 'corporate': 1.0, 'dao': 1.5 };
                        const archFactor = factors[p.archetype] || 1.0;
                        
                        const valorGenerado = horas * fmv * roleMultiplier * archFactor;

                        const newLedgerEntry = {
                            userId: txToApprove.assigneeId,
                            roleId: roleFrom ? roleFrom.id : 'unknown',
                            description: `[PoW] ${txToApprove.entregable}`,
                            horas: horas, valorCongelado: valorGenerado, timestamp: Date.now()
                        };

                        return {
                            ...p,
                            transactions: p.transactions.map(tx => tx.hash === action.payload.txHash ? { ...tx, status: 'consolidated', valorCongelado: valorGenerado } : tx),
                            ledger: [...(p.ledger || []), newLedgerEntry]
                        };
                    }
                    return p;
                })
            };
        }

        // Casos persistidos de versiones anteriores
        case 'ADD_PROJECT_ALERT':
            return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, alerts: [...(p.alerts || []), { id: 'alt-'+Date.now(), message: action.payload.message, timestamp: Date.now(), resolved: false }] } : p) };
        case 'RESOLVE_PROJECT_ALERT':
            return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, alerts: (p.alerts || []).map(a => a.id === action.payload.alertId ? { ...a, resolved: true } : a) } : p) };
        case 'UPDATE_PROJECT_INFO':
            return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, ...action.payload.updates } : p) };
        case 'UPDATE_PROJECT_CONFIG':
            return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, config: { ...p.config, ...action.payload.config } } : p) };
        case 'ADD_TRANSACTION':
            return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, transactions: [...(p.transactions || []), { hash: '0x' + Math.random().toString(16).slice(2, 10), timestamp: Date.now(), status: action.payload.tx.status || 'theoretical', ...action.payload.tx }] } : p) };
        case 'PING_TRANSACTION':
            return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, transactions: p.transactions.map(tx => tx.hash === action.payload.txHash ? { ...tx, status: 'pinged', assigneeId: action.payload.userId } : tx) } : p) };
        case 'REPORT_TRANSACTION':
            return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, transactions: p.transactions.map(tx => tx.hash === action.payload.txHash ? { ...tx, status: 'reported', realHours: action.payload.realHours, proofLink: action.payload.proofLink, reportComment: action.payload.comentario } : tx) } : p) };
        case 'ASSIGN_USER_ROLE':
            return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, asignaciones: [...p.asignaciones.filter(a => a.roleId !== action.payload.roleId), { userId: action.payload.userId, roleId: action.payload.roleId }] } : p) };
        case 'PROMOTE_TO_PO':
            return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, ownerId: action.payload.userId } : p) };

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
        this.state = reducer(this.state, action);
        localStorage.setItem('tt_sos_state', JSON.stringify(this.state));
        this.listeners.forEach(l => l());
    }
    subscribe(listener) { this.listeners.push(listener); }

    // 🚀 v6.1: MÉTODOS PEDAGÓGICOS
    getArchetypeFactor(archetype) {
        const factors = { 'startup': 2.0, 'corporate': 1.0, 'dao': 1.5 };
        return factors[archetype] || 1.0;
    }

    calculateMaturityIndex(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return { score: 0, alerts: [] };
        const roles = p.roles.filter(r => !r.isArchived);
        let alerts = [];
        if (!roles.some(r => r.levelId === '@anxaneta')) alerts.push("⚠️ Falta dirección estratégica (@anxaneta).");
        if (!roles.some(r => r.levelId === '@dosos')) alerts.push("⚠️ Falta rol de Auditoría (@dosos). Riesgo de deuda técnica.");
        if (!roles.some(r => r.levelId === '@pinya')) alerts.push("ℹ️ No hay roles de Soporte (@pinya).");
        return { score: Math.max(0, 100 - (alerts.length * 20)), alerts };
    }

    calculateResilience(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.transactions.length) return 100;
        const bottlenecks = p.transactions.filter(t => t.status === 'reported' || t.status === 'pinged').length;
        return Math.max(0, 100 - (bottlenecks * 5));
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
                userId, slices: capTable[userId],
                percentage: (ratio * 100).toFixed(2) + '%',
                financialValue: (ratio * totalValuation).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
            };
        }).sort((a, b) => b.slices - a.slices);
    }
}

export const store = new Store();
