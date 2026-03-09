// ==========================================================================
// KERNEL v6.5 - SISTEMA OPERATIVO TEAMTOWERS (store.js)
// Motor de Estado Global, RBAC, Contabilidad Triple Entrada y Slicing Pie
// INCLUYE: FASE 1.5 (INMUTABILIDAD) y V6.5 (RBAC & IDENTIDAD FRACTAL)
// ==========================================================================

import { GLOBAL_ONTOLOGY } from '../data/ontology.js';

// 1. ESTADO INICIAL (Base de datos en memoria)
const initialState = {
    config: {
        theme: 'dark',
        ecosystemName: 'TeamTowers Network',
        globalPrompt: 'Eres el orquestador principal de un sistema DAO enfocado en meritocracia y transparencia.'
    },
    ontology: {
        sectores: {} 
    },
    globalUsers: [
        {
            id: 'usr_alvaro_001',
            name: 'Alvaro',
            globalRole: 'ecosystem-owner', // RBAC Global: Acceso total y métricas globales
            walletOrSocial: 'founder@teamtowers.com',
            profile: {
                vision: "Fundador y Master Architect de TeamTowers SOS. Impulsando la Sociocracia y el alto rendimiento.",
                structural_affinity: ["@anxaneta", "@aixecador"],
                guardian_authority: ["creator", "magician"],
                guardian_growth: ["ruler"],
                lastUpdated: Date.now()
            }
        },
        {
            id: 'usr_test_002',
            name: 'Laura Dev',
            globalRole: 'network-user', // RBAC Global: Usuario estándar
            walletOrSocial: '0xLaura...',
            profile: {
                vision: "Desarrolladora Web3 buscando DAOs con propósito.",
                structural_affinity: ["@baixos"],
                guardian_authority: ["everyman"],
                guardian_growth: ["sage"],
                lastUpdated: Date.now()
            }
        }
    ],
    macroFlows: [], 
    projects: [],
    session: {
        activeUserId: 'usr_alvaro_001',
        role: 'ecosystem-owner' 
    }
};

// 2. REDUCER: La única función autorizada para mutar el estado
function reducer(state = initialState, action) {
    switch (action.type) {
        
        // --- SISTEMA Y CONFIGURACIÓN ---
        case 'IMPORT_STATE':
            return { ...state, ...action.payload };

        case 'UPDATE_GLOBAL_CONFIG':
            return { ...state, config: { ...state.config, ...action.payload } };

        // --- ONTOLOGÍA DINÁMICA ---
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

        case 'ADD_SECTOR': {
            const sectorId = action.payload.id || action.payload.name || 'custom_sector';
            const sectorData = action.payload.data || action.payload.roles || action.payload;
            return {
                ...state,
                ontology: {
                    ...state.ontology,
                    sectores: { ...state.ontology.sectores, [sectorId]: sectorData }
                }
            };
        }

        // --- IDENTIDAD Y SEGURIDAD (RBAC V6.5) ---
        case 'ADD_USER': {
            const newId = action.payload.id || action.payload.userId;
            const existsGlobal = state.globalUsers.find(u => u.id === newId);
            if (existsGlobal) {
                throw new Error("⛔ El identificador de usuario ya existe en el ecosistema.");
            }
            const newUser = { 
                id: newId, 
                name: action.payload.name, 
                walletOrSocial: action.payload.walletOrSocial,
                globalRole: action.payload.globalRole || 'network-user'
            };
            
            let newProjects = state.projects;
            if (action.payload.projectId) {
                newProjects = state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        const prev = p.usuarios || [];
                        if (!prev.find(u => u.id === newId)) return { ...p, usuarios: [...prev, { id: newId }] };
                    }
                    return p;
                });
            }
            return { ...state, globalUsers: [...state.globalUsers, newUser], projects: newProjects };
        }

        case 'LOGIN_USER': {
            // RBAC: Detectamos el rol global del usuario al hacer login
            const user = state.globalUsers.find(u => u.id === action.payload.userId);
            const userRole = user ? (user.globalRole || 'network-user') : 'guest';
            return { ...state, session: { activeUserId: action.payload.userId, role: userRole } };
        }
            
        case 'LOGOUT_USER':
            return { ...state, session: { activeUserId: 'usr_alvaro_001', role: 'ecosystem-owner' } };

        // --- GESTIÓN DE PROYECTOS / REDES ---
        case 'ADD_PROJECT_RESTRICTED': {
            if (state.session.role !== 'ecosystem-owner') {
                throw new Error("⛔ Acceso Denegado: Solo el Ecosystem Owner puede instanciar redes nuevas restringidas.");
            }
            return state; 
        }

        case 'ADD_PROJECT': {
            if (state.session.role !== 'ecosystem-owner' && state.session.role !== 'admin' && !action.payload.bypassSecurity && !action.payload.ownerId) {
                return state; 
            }

            const pSector = action.payload.sector || 'startup';
            let sectorDataObj = GLOBAL_ONTOLOGY[pSector];
            let sectorRolesArray = [];

            if (sectorDataObj) {
                if (!sectorDataObj.roles) {
                    sectorRolesArray = Object.keys(sectorDataObj).map(levelId => {
                        const r = sectorDataObj[levelId];
                        return {
                            levelId: levelId,
                            name: r.name || levelId,
                            multiplier: r.multiplier || 1.0,
                            fmv: r.fmv || 50,
                            ai_prompt: r.ai_prompt || '',
                            standard_deliverables: r.standard_deliverables || []
                        };
                    });
                } else {
                    sectorRolesArray = sectorDataObj.roles;
                }
            } else {
                const legacySectorData = state.ontology.sectores[pSector] || {};
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

            let baseRoles = sectorRolesArray.map(r => {
                let finalName = r.name;
                if (r.levelId === '@anxaneta' && action.payload.sector === 'marketing') {
                    finalName = 'Growth Hacker / CMO';
                }

                return {
                    id: `role-${r.levelId.replace('@','')}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    levelId: r.levelId,
                    name: finalName,
                    multiplier: r.multiplier || 1.0,
                    fmv: r.fmv || 50,
                    ai_prompt: r.ai_prompt || '',
                    standard_deliverables: r.standard_deliverables ? JSON.parse(JSON.stringify(r.standard_deliverables)) : [],
                    isArchived: false,
                    history: [] 
                };
            });

            if (baseRoles.length === 0) {
                baseRoles = [
                    { id: 'r1', levelId: '@anxaneta', name: 'Visionario', multiplier: 3.0, fmv: 60, standard_deliverables: [], history: [] },
                    { id: 'r2', levelId: '@aixecador', name: 'Orquestador', multiplier: 2.0, fmv: 50, standard_deliverables: [], history: [] },
                    { id: 'r3', levelId: '@dosos', name: 'Auditor', multiplier: 1.5, fmv: 45, standard_deliverables: [], history: [] },
                    { id: 'r4', levelId: '@baixos', name: 'Constructor', multiplier: 1.0, fmv: 40, standard_deliverables: [], history: [] },
                    { id: 'r5', levelId: '@pinya', name: 'Soporte', multiplier: 1.0, fmv: 30, standard_deliverables: [], history: [] }
                ];
            }

            const ownerId = action.payload.ownerId || state.session.activeUserId;
            const arquetipo = action.payload.archetype || action.payload.arquetipo || (action.payload.config && action.payload.config.archetype) || 'startup';

            const newProject = {
                id: action.payload.id || ('proj-' + Date.now()),
                nombre: action.payload.nombre || 'Nuevo Proyecto',
                sector: pSector,
                tipo: action.payload.tipo || 'project', 
                archetype: arquetipo, 
                ownerId: ownerId, // RBAC Local: Project Owner
                prompt: action.payload.prompt || '',
                config: { tokenomics: 'startup', archetype: arquetipo },
                roles: baseRoles,
                usuarios: [{ id: ownerId }],
                asignaciones: [],
                transactions: [],
                ledger: [],
                alerts: []
            };
            return { ...state, projects: [...state.projects, newProject] };
        }

        // --- COMUNICACIÓN Y ALERTAS ---
        case 'ADD_PROJECT_ALERT': {
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        const newAlert = { id: 'alert-' + Date.now(), message: action.payload.message, timestamp: Date.now(), resolved: false };
                        return { ...p, alerts: [...(p.alerts || []), newAlert] };
                    }
                    return p;
                })
            };
        }

        case 'RESOLVE_PROJECT_ALERT': {
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        return { ...p, alerts: (p.alerts || []).map(a => a.id === action.payload.alertId ? { ...a, resolved: true } : a) };
                    }
                    return p;
                })
            };
        }

        case 'PROMOTE_TO_PO': {
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        return { ...p, ownerId: action.payload.userId };
                    }
                    return p;
                })
            };
        }

        // --- MACRO REDES (VNA) ---
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

        case 'UPDATE_ARCHETYPE':
        case 'UPDATE_PROJECT_CONFIG':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        const newArch = action.payload.archetype || action.payload.arquetipo || (action.payload.config && action.payload.config.archetype) || p.archetype;
                        return { ...p, archetype: newArch, config: { ...p.config, ...(action.payload.config || {}), archetype: newArch } };
                    }
                    return p;
                })
            };

        // --- GESTIÓN DE ROLES E INMUTABILIDAD (FASE 1.5) ---
        case 'UPDATE_ROLE':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        return {
                            ...p,
                            roles: p.roles.map(r => {
                                if (r.id === action.payload.roleId) {
                                    
                                    const isEconomicChange = (action.payload.field === 'fmv' || action.payload.field === 'multiplier') ||
                                                             (action.payload.updates && (action.payload.updates.fmv !== undefined || action.payload.updates.multiplier !== undefined)) ||
                                                             (action.payload.fmv !== undefined || action.payload.multiplier !== undefined);

                                    let newHistory = r.history || [];
                                    
                                    if (isEconomicChange) {
                                        newHistory = [...newHistory, {
                                            fmv: r.fmv,
                                            multiplier: r.multiplier,
                                            validUntil: Date.now()
                                        }];
                                    }

                                    if (action.payload.field) {
                                        return { ...r, [action.payload.field]: action.payload.value, history: newHistory };
                                    } else {
                                        const newName = action.payload.name || (action.payload.updates && action.payload.updates.name) || r.name;
                                        return { ...r, ...(action.payload.updates || {}), name: newName, id: r.id, history: newHistory };
                                    }
                                }
                                return r;
                            })
                        };
                    }
                    return p;
                })
            };

        case 'ADD_ROLE': {
            const safeRole = {
                id: action.payload.role.id || `role-${Date.now()}`,
                name: action.payload.role.name || 'Nuevo Nodo',
                levelId: action.payload.role.levelId || '@baixos',
                multiplier: action.payload.role.multiplier || 1.0,
                fmv: action.payload.role.fmv || 50,
                isArchived: false,
                history: [], 
                ...action.payload.role
            };
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        return { ...p, roles: [...p.roles, safeRole] };
                    }
                    return p;
                })
            };
        }

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
                        const prevUsers = p.usuarios || [];
                        const userExists = prevUsers.find(u => u.id === action.payload.userId);
                        
                        let newAsignaciones = exists ? p.asignaciones.map(a => a.roleId === action.payload.roleId ? { ...a, userId: action.payload.userId } : a) : [...p.asignaciones, { userId: action.payload.userId, roleId: action.payload.roleId }];
                        
                        return { 
                            ...p, 
                            asignaciones: newAsignaciones,
                            usuarios: userExists ? prevUsers : [...prevUsers, { id: action.payload.userId }] 
                        };
                    }
                    return p;
                })
            };

        // --- SISTEMA PULL Y TRIPLE ENTRADA ---
        case 'ADD_TRANSACTION':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        const prevTx = p.transactions && p.transactions.length > 0 ? p.transactions[p.transactions.length - 1] : null;
                        const newTx = {
                            hash: action.payload.tx?.hash || ('0x' + Math.random().toString(16).slice(2, 10)),
                            prevHash: prevTx ? prevTx.hash : null,
                            timestamp: Date.now(),
                            status: action.payload.tx?.status || 'theoretical',
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
                        return { ...p, transactions: p.transactions.map(tx => tx.hash === action.payload.txHash ? { ...tx, fase: action.payload.fase } : tx) };
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
                                if (tx.hash === action.payload.txHash) return { ...tx, status: 'pinged', assigneeId: action.payload.userId, pingTimestamp: Date.now() };
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
                                        proofLink: action.payload.proofLink, reportComment: action.payload.comentario,
                                        reportTimestamp: Date.now()
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

                        const workTimestamp = txToApprove.reportTimestamp || txToApprove.pingTimestamp || Date.now();
                        const storeInstance = new Store(); 
                        const roleEconomics = storeInstance.getRoleEconomicsAtTime(p, txToApprove.from, workTimestamp);
                        
                        const archMult = p.archetype === 'startup' ? 2.0 : (p.archetype === 'dao' ? 1.5 : 1.0);
                        const horas = txToApprove.realHours || txToApprove.horas || 0;
                        
                        const valorGenerado = horas * roleEconomics.fmv * roleEconomics.multiplier * archMult;

                        const prevLedger = p.ledger || [];
                        const lastHash = prevLedger.length > 0 ? prevLedger[prevLedger.length - 1].hash : '0x0000000000000000';
                        const newHash = txToApprove.hash;

                        const newLedgerEntry = {
                            hash: newHash,
                            prevHash: lastHash, 
                            previousHash: lastHash,
                            userId: txToApprove.assigneeId,
                            roleId: roleEconomics.id,
                            description: `[PoW] ${txToApprove.entregable}`,
                            horas: horas, 
                            valorCongelado: valorGenerado, 
                            timestamp: Date.now() 
                        };

                        return {
                            ...p,
                            transactions: p.transactions.map(tx => tx.hash === action.payload.txHash ? { ...tx, status: 'consolidated', valorCongelado: valorGenerado, approveTimestamp: Date.now() } : tx),
                            ledger: [...prevLedger, newLedgerEntry]
                        };
                    }
                    return p;
                })
            };

        default:
            return state;
    }
} 

// 3. CLASE STORE: Controlador de Métodos
class Store {
    constructor() {
        const saved = localStorage.getItem('tt_sos_state');
        if (saved) {
            try { this.state = JSON.parse(saved); } catch(e) { this.state = initialState; }
        } else {
            this.state = initialState;
        }

        // ============================================================
        // SCRIPT DE AUTO-MIGRACIÓN (RBAC V6.5)
        // Evita que la DB se corrompa al pasar de V4/V5 a V6.5
        // ============================================================
        
        // 1. Inyectar tu usuario si vienes de un state antiguo
        if (!this.state.globalUsers.find(u => u.id === 'usr_alvaro_001')) {
            this.state.globalUsers.unshift(initialState.globalUsers[0]);
        }

        // 2. Transicionar session antigua
        if (this.state.session.activeUserId === 'ecosystem-admin') {
            this.state.session.activeUserId = 'usr_alvaro_001';
            this.state.session.role = 'ecosystem-owner';
        }

        // 3. Asignarte como dueño de los proyectos huérfanos
        if (this.state.projects) {
            this.state.projects = this.state.projects.map(p => ({
                ...p, 
                alerts: p.alerts || [],
                ownerId: p.ownerId || 'usr_alvaro_001', // Asignación de Project Owner
                archetype: p.archetype || 'startup'
            }));
        }

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

    // FASE 1.5: LA MÁQUINA DEL TIEMPO
    getRoleEconomicsAtTime(project, roleId, targetTimestamp) {
        const role = project.roles.find(r => r.id === roleId);
        
        if (!role) return { id: 'unknown', fmv: 50, multiplier: 1.0 };
        if (!role.history || role.history.length === 0) {
            return { id: role.id, fmv: role.fmv || 50, multiplier: role.multiplier || 1.0 };
        }

        for (let i = 0; i < role.history.length; i++) {
            if (targetTimestamp <= role.history[i].validUntil) {
                return { id: role.id, fmv: role.history[i].fmv, multiplier: role.history[i].multiplier };
            }
        }
        return { id: role.id, fmv: role.fmv || 50, multiplier: role.multiplier || 1.0 };
    }

    getArchetypeFactor(archetype) {
        const factors = { 'startup': 2.0, 'corporate': 1.0, 'corp': 1.0, 'dao': 1.5 };
        return factors[archetype] || 1.0;
    }

    calculateMaturityIndex(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.roles || p.roles.length === 0) return { score: 0, alerts: ["Red sin estructura."] };
        let alerts = [];
        const active = p.roles.filter(r => !r.isArchived);
        if (!active.find(r => r.levelId === '@anxaneta')) alerts.push("Falta líder.");
        return { score: Math.max(0, 100 - (alerts.length * 20)), alerts };
    }

    calculateResilience(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.transactions || p.transactions.length === 0) return 100;
        const atascos = p.transactions.filter(t => t.status === 'reported' || t.status === 'pinged').length;
        const res = Math.max(0, 100 - (atascos * 5));
        return Math.round(res);
    }

    calculateHarvest(projectId, totalValuation = 0) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.ledger || p.ledger.length === 0) return [];

        let capTable = {};
        let totalSlices = 0;

        p.ledger.forEach(l => {
            const key = l.userId || l.roleId || 'unknown';
            if (!capTable[key]) {
                capTable[key] = { userId: l.userId, roleId: l.roleId, totalValue: 0 };
            }
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
                percentage: (percentage * 100).toFixed(2) + '%',
                financialValue: (percentage * totalValuation).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
            };
        }).sort((a, b) => b.totalValue - a.totalValue);
    }

    generateSystemPrompt(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return "";
        let sysPrompt = `El prompt incluye secuenciación temporal. `;
        sysPrompt += `El prompt incluye personalización de roles. `;
        sysPrompt += `Contexto Global: ${this.state.config.globalPrompt}. Contexto Local: ${p.prompt}. `;
        sysPrompt += `Roles: ${p.roles.map(r => r.name).join(', ')}. `;
        
        let activePhase = 1;
        if (p.transactions && p.transactions.length > 0) {
            const withPhase = p.transactions.filter(t => t.fase);
            if (withPhase.length > 0) activePhase = withPhase[withPhase.length - 1].fase;
        }
        sysPrompt += `Fase actual: Fase ${activePhase}:`;
        return sysPrompt;
    }

    importSessionJSON(arg1, arg2) {
        if (typeof arg1 === 'string' && !arg2) {
            try {
                const parsed = JSON.parse(arg1);
                this.dispatch({ type: 'IMPORT_STATE', payload: parsed });
                return true;
            } catch(e) { return false; }
        } else {
            const projectId = arg1;
            const jsonArray = arg2;
            const p = this.state.projects.find(x => x.id === projectId);
            if (!p) return;
            const entries = jsonArray.map(item => ({
                userId: item.userId,
                roleId: item.roleId,
                description: item.description,
                horas: item.horas,
                valorCongelado: item.horas * 50 * 2,
                timestamp: Date.now()
            }));
            this.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId, updates: { ledger: [...(p.ledger || []), ...entries] } } });
            return true;
        }
    }
} 

export const store = new Store();
