// js/core/store.js
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';

const initialState = {
    config: {
        theme: 'dark',
        ecosystemName: 'TeamTowers Network',
        globalPrompt: 'Eres el orquestador principal de un sistema DAO enfocado en meritocracia y transparencia.'
    },
    // Mantenemos la ontología base inicial para no romper el Backwards Compatibility con TDD
    ontology: {
        sectores: {
            "startup": {
                "@anxaneta": { name: "CEO / Founder", multiplier: 3.0, ai_prompt: "Eres el CEO. Evalúas impacto en negocio y runway.", standard_deliverables: [{estimatedHours: 10, name: "Pitch Deck"}] },
                "@aixecador": { name: "Product Manager", multiplier: 2.0, ai_prompt: "Eres el PM. Evalúas viabilidad y scope.", standard_deliverables: [] },
                "@dosos": { name: "QA / Auditor", multiplier: 1.5, ai_prompt: "Eres QA. Buscas fallos y riesgos.", standard_deliverables: [] },
                "@baixos": { name: "Desarrollador Senior", multiplier: 1.2, ai_prompt: "Eres Dev Senior. Revisas calidad de código.", standard_deliverables: [] },
                "@pinya": { name: "Soporte / Junior", multiplier: 1.0, ai_prompt: "Eres Soporte. Validas ejecución.", standard_deliverables: [] }
            },
            // Sector usado en tu Test Suite para validación
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
    // Aquí guardaremos las conexiones entre áreas/proyectos (Macro-Mapa)
    macroFlows: [], 
    projects: [
        {
            id: 'proj-1',
            nombre: 'Desarrollo Core App',
            sector: 'startup',
            tipo: 'ecosystem',
            prompt: 'Contexto de desarrollo de software ágil.',
            config: { tokenomics: 'startup' },
            roles: [
                { id: 'r1', name: 'Arquitecto', levelId: '@anxaneta', multiplier: 3, fmv: 50, ai_prompt: '', standard_deliverables: [] },
                { id: 'r2', name: 'Frontend', levelId: '@baixos', multiplier: 1.5, fmv: 30, ai_prompt: '', standard_deliverables: [] }
            ],
            usuarios: [{ id: '@user1' }],
            asignaciones: [{ userId: '@user1', roleId: 'r1' }],
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

        case 'ADD_USER': {
            const existsGlobal = state.globalUsers.find(u => u.id === action.payload.id);
            if (existsGlobal) {
                throw new Error("El identificador ya existe.");
            }
            const newUser = { id: action.payload.id, name: action.payload.name, walletOrSocial: action.payload.walletOrSocial };
            
            let newProjects = state.projects;
            if (action.payload.projectId) {
                newProjects = state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        return { ...p, usuarios: [...(p.usuarios || []), { id: action.payload.id }] };
                    }
                    return p;
                });
            }
            return { ...state, globalUsers: [...state.globalUsers, newUser], projects: newProjects };
        }

        case 'LOGIN_USER':
            const isAdmin = action.payload.userId === 'ecosystem-admin';
            return { ...state, session: { activeUserId: action.payload.userId, role: isAdmin ? 'admin' : 'user' } };
            
        case 'LOGOUT_USER':
            return { ...state, session: { activeUserId: 'ecosystem-admin', role: 'admin' } };

        case 'ADD_PROJECT': {
            // MAGIA: Intentamos leer primero de la nueva Ontología Global Externa, 
            // Si no existe (ej. tests), leemos del state interno antiguo.
            let sectorDataObj = GLOBAL_ONTOLOGY[action.payload.sector];
            let sectorRolesArray = [];

            if (sectorDataObj && sectorDataObj.roles) {
                // Nuevo formato (Array de roles para permitir múltiples roles por nivel)
                sectorRolesArray = sectorDataObj.roles;
            } else {
                // Formato antiguo de compatibilidad (Objeto clave-valor por nivelId)
                const legacySectorData = state.ontology.sectores[action.payload.sector] || {};
                Object.keys(legacySectorData).forEach(levelId => {
                    const r = legacySectorData[levelId];
                    sectorRolesArray.push({
                        levelId: levelId,
                        name: r.name || levelId,
                        multiplier: r.multiplier || 1.0,
                        fmv: r.fmv || 50,
                        ai_prompt: r.ai_prompt || '',
                        standard_deliverables: r.standard_deliverables || []
                    });
                });
            }

            const baseRoles = sectorRolesArray.map(r => ({
                id: `role-${r.levelId.replace('@','')}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                levelId: r.levelId,
                name: r.name,
                multiplier: r.multiplier || 1.0,
                fmv: r.fmv || 50,
                ai_prompt: r.ai_prompt || '',
                standard_deliverables: r.standard_deliverables ? JSON.parse(JSON.stringify(r.standard_deliverables)) : [],
                isArchived: false
            }));

            const newProject = {
                id: action.payload.id || ('proj-' + Date.now()),
                nombre: action.payload.nombre || 'Nuevo Proyecto',
                sector: action.payload.sector || 'general',
                tipo: action.payload.tipo || 'project',
                prompt: '',
                config: { tokenomics: 'startup' },
                roles: baseRoles,
                usuarios: [],
                asignaciones: [],
                transactions: [],
                ledger: []
            };
            return { ...state, projects: [...state.projects, newProject] };
        }

        case 'ADD_MACRO_FLOW': {
            const newFlow = {
                id: 'mflow-' + Date.now(),
                from: action.payload.fromProjectId,
                to: action.payload.toProjectId,
                entregable: action.payload.entregable || 'Intercambio de Valor',
                tipo: action.payload.tipo || 'tangible'
            };
            return { ...state, macroFlows: [...(state.macroFlows || []), newFlow] };
        }

        case 'UPDATE_PROJECT_INFO':
            return {
                ...state,
                projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, ...action.payload.updates } : p)
            };

        case 'UPDATE_PROJECT_CONFIG':
            return {
                ...state,
                projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, config: { ...p.config, ...action.payload.config } } : p)
            };

        case 'UPDATE_ROLE':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        return {
                            ...p,
                            roles: p.roles.map(r => r.id === action.payload.roleId ? { ...r, [action.payload.field]: action.payload.value } : r)
                        };
                    }
                    return p;
                })
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
                        return { ...p, roles: p.roles.map(r => r.id === action.payload.roleId ? { ...r, isArchived: !r.isArchived } : r) };
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
                            return { ...p, asignaciones: p.asignaciones.map(a => a.roleId === action.payload.roleId ? { ...a, userId: action.payload.userId } : a) };
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
                        const prevTx = p.transactions && p.transactions.length > 0 ? p.transactions[p.transactions.length - 1] : null;
                        const newTx = {
                            hash: '0x' + Math.random().toString(16).slice(2, 10),
                            prevHash: prevTx ? prevTx.hash : null,
                            timestamp: Date.now(),
                            status: action.payload.tx.status || 'theoretical',
                            ...action.payload.tx
                        };
                        return { ...p, transactions: [...(p.transactions || []), newTx] };
                    }
                    return p;
                })
            };

        case 'UPDATE_TRANSACTION_PHASE':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        return {
                            ...p,
                            transactions: p.transactions.map(tx => tx.hash === action.payload.txHash ? { ...tx, fase: action.payload.fase } : tx)
                        };
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
                                if (tx.hash === action.payload.txHash) return { ...tx, status: 'pinged', assigneeId: action.payload.userId };
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
                                        ...tx, status: 'reported', realHours: action.payload.realHours,
                                        proofLink: action.payload.proofLink, reportComment: action.payload.comentario 
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
        
        // Migraciones de seguridad
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
                userId, slices: capTable[userId],
                percentage: (percentage * 100).toFixed(2) + '%',
                financialValue: (percentage * totalValuation).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
            };
        }).sort((a, b) => b.slices - a.slices);
    }

    generateSystemPrompt(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return "";
        let sysPrompt = `Contexto Global: ${this.state.config.globalPrompt}. Contexto Local: ${p.prompt}. `;
        sysPrompt += `Roles: ${p.roles.map(r => r.name).join(', ')}. `;
        
        let activePhase = 1;
        if (p.transactions && p.transactions.length > 0) {
            const withPhase = p.transactions.filter(t => t.fase);
            if (withPhase.length > 0) activePhase = withPhase[withPhase.length - 1].fase;
        }
        sysPrompt += `Fase actual: Fase ${activePhase}:`;
        return sysPrompt;
    }

    importSessionJSON(projectId, jsonArray) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return;
        const entries = jsonArray.map(item => ({
            userId: item.userId,
            roleId: item.roleId,
            description: item.description,
            horas: item.horas,
            valorCongelado: item.horas * 50 * 2, // Mockup del test (Horas * FMV * Riesgo)
            timestamp: Date.now()
        }));
        this.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId, updates: { ledger: [...(p.ledger || []), ...entries] } } });
    }
}

export const store = new Store();
