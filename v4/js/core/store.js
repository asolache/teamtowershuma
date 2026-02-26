// js/core/store.js

const initialState = {
    config: {
        theme: 'dark',
        ecosystemName: 'TeamTowers Network',
        globalPrompt: 'Eres el orquestador principal de un sistema DAO enfocado en meritocracia y transparencia.'
    },
    ontology: {
        sectores: {
            "startup": {
                "@anxaneta": { name: "CEO / Founder", multiplier: 3.0, ai_prompt: "Eres el CEO. Evalúas impacto en negocio y runway.", standard_deliverables: [{estimatedHours: 10, name: "Pitch Deck"}, {estimatedHours: 5, name: "Roadmap Q1"}] },
                "@aixecador": { name: "Product Manager", multiplier: 2.0, ai_prompt: "Eres el PM. Evalúas viabilidad y scope.", standard_deliverables: [{estimatedHours: 5, name: "Backlog Grooming"}] },
                "@dosos": { name: "QA / Auditor", multiplier: 1.5, ai_prompt: "Eres QA. Buscas fallos y riesgos.", standard_deliverables: [{estimatedHours: 3, name: "Test Plan"}] },
                "@baixos": { name: "Desarrollador Senior", multiplier: 1.2, ai_prompt: "Eres Dev Senior. Revisas calidad de código.", standard_deliverables: [{estimatedHours: 8, name: "Feature Core"}] },
                "@pinya": { name: "Soporte / Junior", multiplier: 1.0, ai_prompt: "Eres Soporte. Validas ejecución de tareas base.", standard_deliverables: [{estimatedHours: 2, name: "Bugfix Minor"}] }
            }
        }
    },
    globalUsers: [
        { id: '@user1', name: 'Alice Node', walletOrSocial: '0x123...' },
        { id: '@user2', name: 'Bob Builder', walletOrSocial: 'bob@email.com' }
    ],
    // NUEVO: Aquí guardaremos las conexiones entre áreas/proyectos
    macroFlows: [], 
    projects: [
        {
            id: 'proj-1',
            nombre: 'Desarrollo Core App',
            sector: 'software',
            tipo: 'ecosystem',
            prompt: 'Contexto de desarrollo de software ágil.',
            config: { tokenomics: 'startup' },
            roles: [
                { id: 'r1', name: 'Arquitecto', levelId: '@anxaneta', multiplier: 3, fmv: 50, ai_prompt: '', standard_deliverables: [] },
                { id: 'r2', name: 'Frontend', levelId: '@baixos', multiplier: 1.5, fmv: 30, ai_prompt: '', standard_deliverables: [] }
            ],
            asignaciones: [
                { userId: '@user1', roleId: 'r1' }
            ],
            transactions: [],
            ledger: []
        },
        {
            id: 'proj-2',
            nombre: 'Marketing & Ventas',
            sector: 'agencia',
            tipo: 'ecosystem',
            prompt: 'Contexto comercial.',
            config: { tokenomics: 'profit-share' },
            roles: [
                { id: 'r3', name: 'CMO', levelId: '@anxaneta', multiplier: 2.5, fmv: 40, ai_prompt: '', standard_deliverables: [] }
            ],
            asignaciones: [],
            transactions: [],
            ledger: []
        }
    ],
    session: {
        activeUserId: 'ecosystem-admin',
        role: 'admin'
    }
};

function reducer(state = initialState, action) {
    switch (action.type) {
        
        case 'UPDATE_GLOBAL_CONFIG':
            return { ...state, config: { ...state.config, ...action.payload } };

        case 'ADD_ONTOLOGY_SECTOR':
            return {
                ...state,
                ontology: {
                    ...state.ontology,
                    sectores: {
                        ...state.ontology.sectores,
                        [action.payload.sectorId]: action.payload.rolesData
                    }
                }
            };

        case 'ADD_USER':
            if (state.globalUsers.find(u => u.id === action.payload.id)) {
                throw new Error("El identificador ya existe.");
            }
            return { ...state, globalUsers: [...state.globalUsers, action.payload] };

        case 'LOGIN_USER':
            return { ...state, session: { activeUserId: action.payload.userId, role: 'user' } };
            
        case 'LOGOUT_USER':
            return { ...state, session: { activeUserId: 'ecosystem-admin', role: 'admin' } };

        case 'CREATE_PROJECT':
            const newProject = {
                id: 'proj-' + Date.now(),
                nombre: action.payload.nombre,
                sector: action.payload.sector,
                tipo: action.payload.tipo,
                prompt: '',
                config: { tokenomics: 'startup' },
                roles: [],
                asignaciones: [],
                transactions: [],
                ledger: []
            };
            return { ...state, projects: [...state.projects, newProject] };

        // NUEVO: Acción para crear flechas en el Macro-Mapa
        case 'ADD_MACRO_FLOW':
            const newFlow = {
                id: 'mflow-' + Date.now(),
                from: action.payload.fromProjectId,
                to: action.payload.toProjectId,
                entregable: action.payload.entregable || 'Intercambio de Valor',
                tipo: action.payload.tipo || 'tangible'
            };
            return { ...state, macroFlows: [...(state.macroFlows || []), newFlow] };

        case 'UPDATE_PROJECT_INFO':
            return {
                ...state,
                projects: state.projects.map(p => 
                    p.id === action.payload.projectId 
                        ? { ...p, ...action.payload.updates } 
                        : p
                )
            };

        case 'UPDATE_PROJECT_CONFIG':
            return {
                ...state,
                projects: state.projects.map(p => 
                    p.id === action.payload.projectId 
                        ? { ...p, config: { ...p.config, ...action.payload.config } } 
                        : p
                )
            };

        case 'ADD_ROLE':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        return { ...p, roles: [...p.roles, action.payload.role] };
                    }
                    return p;
                })
            };

        case 'TOGGLE_ROLE_ARCHIVE':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        return {
                            ...p,
                            roles: p.roles.map(r => r.id === action.payload.roleId ? { ...r, isArchived: !r.isArchived } : r)
                        };
                    }
                    return p;
                })
            };

        case 'ASSIGN_USER_ROLE':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        const exists = p.asignaciones.find(a => a.roleId === action.payload.roleId);
                        if (exists) {
                            return {
                                ...p,
                                asignaciones: p.asignaciones.map(a => a.roleId === action.payload.roleId ? { ...a, userId: action.payload.userId } : a)
                            };
                        } else {
                            return { ...p, asignaciones: [...p.asignaciones, { userId: action.payload.userId, roleId: action.payload.roleId }] };
                        }
                    }
                    return p;
                })
            };

        case 'ADD_TRANSACTION':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        const newTx = {
                            hash: '0x' + Math.random().toString(16).slice(2, 10),
                            timestamp: Date.now(),
                            status: action.payload.tx.status || 'theoretical',
                            ...action.payload.tx
                        };
                        return { ...p, transactions: [...(p.transactions || []), newTx] };
                    }
                    return p;
                })
            };

        case 'PING_TRANSACTION':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        return {
                            ...p,
                            transactions: p.transactions.map(tx => {
                                if (tx.hash === action.payload.txHash) {
                                    return { ...tx, status: 'pinged', assigneeId: action.payload.userId };
                                }
                                return tx;
                            })
                        };
                    }
                    return p;
                })
            };

        case 'REPORT_TRANSACTION':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        return {
                            ...p,
                            transactions: p.transactions.map(tx => {
                                if (tx.hash === action.payload.txHash) {
                                    return { 
                                        ...tx, 
                                        status: 'reported', 
                                        realHours: action.payload.realHours,
                                        proofLink: action.payload.proofLink,
                                        reportComment: action.payload.comentario 
                                    };
                                }
                                return tx;
                            })
                        };
                    }
                    return p;
                })
            };

        case 'APPROVE_TRANSACTION':
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
                        
                        const valorGenerado = horas * fmv * roleMultiplier;

                        const newLedgerEntry = {
                            userId: txToApprove.assigneeId,
                            roleId: roleFrom ? roleFrom.id : 'unknown',
                            description: `[PoW] ${txToApprove.entregable}`,
                            horas: horas,
                            valorCongelado: valorGenerado,
                            timestamp: Date.now()
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

        default:
            return state;
    }
}

class Store {
    constructor() {
        const saved = localStorage.getItem('tt_sos_state');
        if (saved) {
            try { this.state = JSON.parse(saved); } catch(e) { this.state = initialState; }
        } else {
            this.state = initialState;
        }
        // Migración de datos viejos: asegurar que existe macroFlows
        if (!this.state.macroFlows) this.state.macroFlows = [];
        if (!this.state.config) this.state.config = { ecosystemName: 'TeamTowers Network', theme: 'dark', globalPrompt: '' };

        this.listeners = [];
    }
    getState() { return this.state; }
    dispatch(action) {
        this.state = reducer(this.state, action);
        localStorage.setItem('tt_sos_state', JSON.stringify(this.state));
        this.listeners.forEach(l => l());
    }
    subscribe(listener) { this.listeners.push(listener); }

    // Helpers
    calculateResilience(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.transactions || p.transactions.length === 0) return 100;
        const atascos = p.transactions.filter(t => t.status === 'reported' || t.status === 'pinged').length;
        const res = Math.max(0, 100 - (atascos * 5));
        return Math.round(res);
    }

    calculateHarvest(projectId, totalValuation) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.ledger || p.ledger.length === 0) return [];

        let capTable = {};
        let totalSlices = 0;

        p.ledger.forEach(l => {
            if (!capTable[l.userId]) capTable[l.userId] = 0;
            capTable[l.userId] += l.valorCongelado;
            totalSlices += l.valorCongelado;
        });

        if (totalSlices === 0) return [];

        return Object.keys(capTable).map(userId => {
            const percentage = (capTable[userId] / totalSlices);
            return {
                userId,
                slices: capTable[userId],
                percentage: (percentage * 100).toFixed(2) + '%',
                financialValue: (percentage * totalValuation).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
            };
        }).sort((a, b) => b.slices - a.slices);
    }
}

export const store = new Store();
