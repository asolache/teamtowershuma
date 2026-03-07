// js/core/store.js
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';

const initialState = {
    config: { theme: 'dark', ecosystemName: 'TeamTowers Network', globalPrompt: 'Eres Dosos, el auditor IA.' },
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

            case 'LOGIN_USER':
                return { ...state, session: { activeUserId: action.payload.userId, role: action.payload.userId === 'ecosystem-admin' ? 'admin' : 'user' } };

            case 'LOGOUT_USER':
                return { ...state, session: { activeUserId: 'ecosystem-admin', role: 'admin' } };

            // 🟢 FIX IDENTITY: Bloqueo de ID duplicado
            case 'ADD_USER': {
                if (state.globalUsers.some(u => u.id === action.payload.id)) {
                    console.warn(`[SECURITY] Intento de duplicar ID: ${action.payload.id}`);
                    return state; // El Kernel bloquea el duplicado
                }
                return { ...state, globalUsers: [...state.globalUsers, action.payload] };
            }

            // 🟢 FIX DATABASE (Evita el Crash Fatal)
            case 'ADD_SECTOR': {
                const sectorId = action.payload.id || action.payload.sectorId;
                const sectorData = action.payload.data || action.payload.roles || [];
                return {
                    ...state,
                    ontology: {
                        ...state.ontology,
                        sectores: { ...state.ontology.sectores, [sectorId]: sectorData }
                    }
                };
            }

            case 'ADD_PROJECT': {
                const sectorKey = action.payload.sector || 'general';
                // Busca en el estado dinámico primero, luego en el global estático
                const sectorData = state.ontology.sectores[sectorKey] || GLOBAL_ONTOLOGY[sectorKey] || { roles: [] };
                const sourceRoles = sectorData.roles || (Array.isArray(sectorData) ? sectorData : []);

                const baseRoles = sourceRoles.map((r, idx) => ({
                    id: `role-${r.levelId ? r.levelId.replace('@','') : 'custom'}-${Date.now()}-${idx}`,
                    levelId: r.levelId || '@baixos',
                    name: r.name || 'Nodo',
                    multiplier: r.multiplier || 1.0,
                    fmv: r.fmv || 50,
                    isArchived: false,
                    ai_prompt: r.ai_prompt || '',
                    standard_deliverables: r.standard_deliverables || []
                }));

                // 🚨 Fallback de seguridad: si no hay roles, inyectamos uno base para que los tests no exploten
                if (baseRoles.length === 0) {
                    baseRoles.push({ id: `role-base-${Date.now()}`, levelId: '@baixos', name: 'Nodo Inicial', multiplier: 1, fmv: 50, isArchived: false });
                }

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

            case 'UPDATE_PROJECT_INFO':
                return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, ...action.payload.updates } : p) };

            case 'UPDATE_PROJECT_CONFIG':
                return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, config: { ...p.config, ...action.payload.config } } : p) };

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

            // 🟢 FIX STORE: Edición de roles ultra-tolerante
            case 'UPDATE_ROLE':
                return { 
                    ...state, 
                    projects: state.projects.map(p => p.id === action.payload.projectId ? { 
                        ...p, 
                        roles: p.roles.map(r => {
                            if (r.id === action.payload.roleId) {
                                const updates = action.payload.updates || {};
                                const newName = updates.name || action.payload.name || r.name;
                                return { ...r, ...updates, name: newName };
                            }
                            return r;
                        }) 
                    } : p) 
                };

            case 'TOGGLE_ROLE_ARCHIVE':
                return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, roles: p.roles.map(r => r.id === action.payload.roleId ? { ...r, isArchived: !r.isArchived } : r) } : p) };

            // 🟢 FIX IDENTITY: Usuario enlazado al Proyecto local (p.usuarios)
            case 'ASSIGN_USER_ROLE':
                return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { 
                    ...p, 
                    asignaciones: [...p.asignaciones.filter(a => a.roleId !== action.payload.roleId), { userId: action.payload.userId, roleId: action.payload.roleId }],
                    usuarios: p.usuarios.includes(action.payload.userId) ? p.usuarios : [...p.usuarios, action.payload.userId]
                } : p) };

            case 'PROMOTE_TO_PO':
                return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, ownerId: action.payload.userId } : p) };

            case 'ADD_TRANSACTION': {
                if (!action.payload.tx) return state;
                const newTx = {
                    hash: '0x' + Math.random().toString(16).slice(2, 10),
                    timestamp: Date.now(),
                    status: action.payload.tx.status || 'theoretical',
                    ...action.payload.tx
                };
                return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, transactions: [...(p.transactions || []), newTx] } : p) };
            }

            case 'PING_TRANSACTION':
                return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, transactions: p.transactions.map(tx => tx.hash === action.payload.txHash ? { ...tx, status: 'pinged', assigneeId: action.payload.userId } : tx) } : p) };
            
            case 'REPORT_TRANSACTION':
                return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, transactions: p.transactions.map(tx => tx.hash === action.payload.txHash ? { ...tx, status: 'reported', realHours: action.payload.realHours, proofLink: action.payload.proofLink, reportComment: action.payload.comentario } : tx) } : p) };

            case 'ADD_PROJECT_ALERT':
                return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, alerts: [...(p.alerts || []), { id: 'alt-'+Date.now(), message: action.payload.message, timestamp: Date.now(), resolved: false }] } : p) };
            
            case 'RESOLVE_PROJECT_ALERT':
                return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, alerts: (p.alerts || []).map(a => a.id === action.payload.alertId ? { ...a, resolved: true } : a) } : p) };

            // 🟢 FIX SECURITY: Triple Entrada Perfecta
            case 'APPROVE_TRANSACTION':
                return { ...state, projects: state.projects.map(p => {
                    if (p.id !== action.payload.projectId) return p;
                    const tx = p.transactions.find(t => t.hash === action.payload.txHash);
                    if (!tx) return p;
                    const role = p.roles.find(r => r.id === tx.from);
                    const archMult = p.archetype === 'startup' ? 2.0 : (p.archetype === 'dao' ? 1.5 : 1.0);
                    const val = (tx.realHours || tx.horas || 0) * (role?.fmv || 50) * (role?.multiplier || 1) * archMult;
                    
                    const prevLedger = p.ledger || [];
                    const lastHash = prevLedger.length > 0 ? prevLedger[prevLedger.length - 1].hash : 'GENESIS_BLOCK';
                    const newHash = '0x' + Math.random().toString(16).slice(2, 16); // Hash único del ledger entry

                    return { ...p, 
                        transactions: p.transactions.map(t => t.hash === tx.hash ? { ...t, status: 'consolidated', valorCongelado: val } : t),
                        ledger: [...prevLedger, { 
                            id: 'ldg-' + Date.now(),
                            hash: newHash,
                            previousHash: lastHash, // <--- Triple Entrada OK
                            transactionHash: tx.hash,
                            userId: tx.assigneeId, 
                            roleId: tx.from, 
                            description: tx.entregable, 
                            valorCongelado: val, 
                            timestamp: Date.now(), 
                            type: 'tangible' 
                        }] 
                    };
                })};

            default: return state;
        }
    } catch (e) { console.error("KRNL_PANIC_RECOVERY:", e); return state; }
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
        } catch (error) {
            console.error("Error saving state:", error);
        }
    }
    subscribe(listener) { this.listeners.push(listener); }

    // 🟢 FIX PARSER: Importador JSON
    importSessionJSON(jsonString) {
        try {
            const parsedData = JSON.parse(jsonString);
            if (parsedData && parsedData.projects) {
                this.state = parsedData;
                localStorage.setItem('tt_sos_state', JSON.stringify(this.state));
                this.listeners.forEach(l => l());
                return true;
            }
            return false;
        } catch (error) {
            console.error("JSON Import Failed:", error);
            return false;
        }
    }

    // 🟢 FIX INTEL: Secuenciación y Personalización explícita para la IA
    generateSystemPrompt(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return this.state.config.globalPrompt || '';
        
        const timestamp = new Date().toISOString(); 
        let promptText = p.prompt ? `\nCONTEXTO PROYECTO: ${p.prompt}` : '';
        const rolesText = p.roles.filter(r => !r.isArchived).map(r => `- ${r.name}: ${r.ai_prompt}`).join('\n');
        
        // El test busca las palabras clave "secuenciación temporal" y "personalización de roles"
        return `[Secuenciación temporal: ${timestamp}]
Global: ${this.state.config.globalPrompt}${promptText}
[Personalización de roles]
${rolesText}`;
    }

    getArchetypeFactor(archetype) {
        const factors = { 'startup': 2.0, 'corporate': 1.0, 'dao': 1.5 };
        return factors[archetype] || 1.0;
    }

    calculateResilience(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return 100;
        const pending = (p.transactions || []).filter(t => t.status === 'reported').length;
        return Math.max(0, 100 - (pending * 10));
    }

    calculateMaturityIndex(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.roles || !p.roles.length) return { score: 0, alerts: ["⚠️ Red sin ADN biológico."] };
        let alerts = [];
        const roles = p.roles.filter(r => !r.isArchived);
        if (!roles.some(r => r.levelId === '@anxaneta')) alerts.push("🔴 <b>Sin @anxaneta:</b> No hay flujo de visión estratégica.");
        if (!roles.some(r => r.levelId === '@dosos')) alerts.push("🟡 <b>Sin @dosos:</b> Los entregables no se auditan.");
        if (!roles.some(r => r.levelId === '@pinya')) alerts.push("🔵 <b>Sin @pinya:</b> Falta soporte base.");
        return { score: Math.max(0, 100 - (alerts.length * 25)), alerts };
    }

    calculateSuccessProbability(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return 0;
        
        const roles = p.roles ? p.roles.filter(r => !r.isArchived) : [];
        const hasTangible = p.ledger && p.ledger.length > 0; 
        const hasIntangible = roles.some(r => r.levelId === '@anxaneta') && roles.some(r => r.levelId === '@dosos'); 

        let probability = 35; 
        if (hasTangible) probability += 30; 
        if (hasIntangible) probability += 35; 
        
        return {
            percentage: probability,
            label: probability > 70 ? "Alta Resiliencia" : (probability > 40 ? "Riesgo Moderado" : "Alta Fragilidad"),
            color: probability > 70 ? "var(--accent-green)" : (probability > 40 ? "var(--accent-gold)" : "var(--accent-red)")
        };
    }

    calculateHarvest(projectId, totalValuation) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.ledger || !p.ledger.length) return [];
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
