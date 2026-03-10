// ==========================================================================
// KERNEL v7.0 - SISTEMA OPERATIVO TEAMTOWERS (store.js)
// Motor de Estado Global, RBAC, Contabilidad Triple Entrada y Slicing Pie
// INCLUYE: FASE 1.5 (INMUTABILIDAD), V6.5 (RBAC) y V7.0 (SHA-256 HASHING)
// ==========================================================================

import { GLOBAL_ONTOLOGY } from '../data/ontology.js';

// --- UTILIDAD CRIPTOGRÁFICA (V7.0) ---
// Genera un Hash SHA-256 real para la Contabilidad de Triple Entrada
async function generateSHA256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 1. ESTADO INICIAL (Base de datos en memoria)
const initialState = {
    config: {
        theme: 'dark',
        ecosystemName: 'TeamTowers Network',
        globalPrompt: 'Eres el orquestador principal de un sistema DAO enfocado en meritocracia y transparencia.',
        allowUserCreation: false // GOBERNANZA V4: Por defecto, los usuarios rasos no instancian ecosistemas.
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
async function asyncReducer(state, action) {
    let newState = JSON.parse(JSON.stringify(state)); // Deep copy para evitar mutaciones directas no deseadas

    switch (action.type) {
        
        // --- SISTEMA Y CONFIGURACIÓN ---
        case 'IMPORT_STATE':
            return { ...newState, ...action.payload };

        case 'UPDATE_GLOBAL_CONFIG':
            return { ...newState, config: { ...newState.config, ...action.payload } };

        // --- ONTOLOGÍA DINÁMICA ---
        case 'ADD_ONTOLOGY_SECTOR':
            return {
                ...newState,
                ontology: {
                    ...newState.ontology,
                    sectores: {
                        ...newState.ontology.sectores,
                        [action.payload.sectorId]: action.payload.rolesData
                    }
                }
            };

        case 'ADD_SECTOR': {
            const sectorId = action.payload.id || action.payload.name || 'custom_sector';
            const sectorData = action.payload.data || action.payload.roles || action.payload;
            return {
                ...newState,
                ontology: {
                    ...newState.ontology,
                    sectores: { ...newState.ontology.sectores, [sectorId]: sectorData }
                }
            };
        }

        // --- IDENTIDAD Y SEGURIDAD (RBAC V6.5) ---
        case 'ADD_USER': {
            const newId = action.payload.id || action.payload.userId;
            const existsGlobal = newState.globalUsers.find(u => u.id === newId);
            if (existsGlobal) {
                console.warn("El identificador de usuario ya existe en el ecosistema.");
                // No lanzamos throw para no romper el UI al invitar usuarios existentes al proyecto
            } else {
                const newUser = { 
                    id: newId, 
                    name: action.payload.name, 
                    walletOrSocial: action.payload.walletOrSocial,
                    globalRole: action.payload.globalRole || 'network-user'
                };
                newState.globalUsers.push(newUser);
            }
            
            if (action.payload.projectId) {
                const pUser = newState.projects.find(p => p.id === action.payload.projectId);
                if (pUser) {
                    const prev = pUser.usuarios || [];
                    if (!prev.find(u => u.id === newId)) pUser.usuarios.push({ id: newId, joinedAt: Date.now() });
                }
            }
            return newState;
        }

        case 'LOGIN_USER': {
            // RBAC: Detectamos el rol global del usuario al hacer login
            const user = newState.globalUsers.find(u => u.id === action.payload.userId);
            const userRole = user ? (user.globalRole || 'network-user') : 'guest';
            return { ...newState, session: { activeUserId: action.payload.userId, role: userRole } };
        }
            
        case 'LOGOUT_USER':
            // EXPULSIÓN REAL: Limpiamos la sesión para forzar la Landing Page del Bootloader
            return { ...newState, session: { activeUserId: null, role: 'guest' } };

        // --- GESTIÓN DE PROYECTOS / REDES ---
        case 'ADD_PROJECT_RESTRICTED': {
            if (newState.session.role !== 'ecosystem-owner') {
                console.warn("⛔ Acceso Denegado: Solo el Ecosystem Owner puede instanciar redes nuevas restringidas.");
                return newState; 
            }
            return newState; 
        }

        case 'ADD_PROJECT': {
            // VERIFICACIÓN GOBERNANZA V4
            const canCreate = newState.session.role === 'ecosystem-owner' || newState.config.allowUserCreation || action.payload.bypassSecurity;
            if (!canCreate && !action.payload.ownerId) {
                console.warn("⛔ Gobernanza: La creación de ecosistemas por usuarios está deshabilitada.");
                return newState; 
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
                const legacySectorData = newState.ontology.sectores[pSector] || {};
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
                baseRoles = action.payload.customRoles || [
                    { id: 'r1', levelId: '@anxaneta', name: 'Visionario', multiplier: 3.0, fmv: 60, standard_deliverables: [], history: [] },
                    { id: 'r2', levelId: '@aixecador', name: 'Orquestador', multiplier: 2.0, fmv: 50, standard_deliverables: [], history: [] },
                    { id: 'r3', levelId: '@dosos', name: 'Auditor', multiplier: 1.5, fmv: 45, standard_deliverables: [], history: [] },
                    { id: 'r4', levelId: '@baixos', name: 'Constructor', multiplier: 1.0, fmv: 40, standard_deliverables: [], history: [] },
                    { id: 'r5', levelId: '@pinya', name: 'Soporte', multiplier: 1.0, fmv: 30, standard_deliverables: [], history: [] }
                ];
            }

            const ownerId = action.payload.ownerId || newState.session.activeUserId;
            const arquetipo = action.payload.archetype || action.payload.arquetipo || (action.payload.config && action.payload.config.archetype) || 'startup';
            const projId = action.payload.id || ('proj-' + Date.now());

            // [V7] Generación asíncrona del Bloque Génesis
            const initHash = await generateSHA256(`GENESIS_${projId}_${Date.now()}`);

            const newProject = {
                id: projId,
                nombre: action.payload.nombre || 'Nuevo Proyecto',
                sector: pSector,
                tipo: action.payload.tipo || 'project', 
                archetype: arquetipo, 
                ownerId: ownerId, 
                prompt: action.payload.prompt || '',
                config: { tokenomics: 'startup', archetype: arquetipo },
                roles: baseRoles,
                usuarios: [{ id: ownerId }],
                asignaciones: [],
                transactions: [],
                ledger: [],
                alerts: [],
                genesisHash: initHash // Sello inmutable V7
            };
            
            newState.projects.push(newProject);
            return newState;
        }

        // --- COMUNICACIÓN Y ALERTAS ---
        case 'ADD_PROJECT_ALERT': {
            const pAlert = newState.projects.find(p => p.id === action.payload.projectId);
            if (pAlert) {
                const newAlert = { id: 'alert-' + Date.now(), message: action.payload.message, timestamp: Date.now(), resolved: false };
                pAlert.alerts = [...(pAlert.alerts || []), newAlert];
            }
            return newState;
        }

        case 'RESOLVE_PROJECT_ALERT': {
            const pRes = newState.projects.find(p => p.id === action.payload.projectId);
            if (pRes) {
                pRes.alerts = (pRes.alerts || []).map(a => a.id === action.payload.alertId ? { ...a, resolved: true } : a);
            }
            return newState;
        }

        case 'PROMOTE_TO_PO': {
            const pPO = newState.projects.find(p => p.id === action.payload.projectId);
            if (pPO) pPO.ownerId = action.payload.userId;
            return newState;
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
            newState.macroFlows = [...(newState.macroFlows || []), newFlow];
            return newState;
        }

        case 'UPDATE_PROJECT_INFO':
            const pInfo = newState.projects.find(p => p.id === action.payload.projectId);
            if (pInfo) Object.assign(pInfo, action.payload.updates);
            return newState;

        case 'UPDATE_ARCHETYPE':
        case 'UPDATE_PROJECT_CONFIG':
            const pArch = newState.projects.find(p => p.id === action.payload.projectId);
            if (pArch) {
                const newArch = action.payload.archetype || action.payload.arquetipo || (action.payload.config && action.payload.config.archetype) || pArch.archetype;
                pArch.archetype = newArch;
                pArch.config = { ...pArch.config, ...(action.payload.config || {}), archetype: newArch };
            }
            return newState;

        // --- GESTIÓN DE ROLES E INMUTABILIDAD (FASE 1.5) ---
        case 'UPDATE_ROLE':
            const pUpdRol = newState.projects.find(p => p.id === action.payload.projectId);
            if (pUpdRol) {
                const rIdx = pUpdRol.roles.findIndex(r => r.id === action.payload.roleId);
                if (rIdx > -1) {
                    const r = pUpdRol.roles[rIdx];
                    const isEconomicChange = (action.payload.field === 'fmv' || action.payload.field === 'multiplier') ||
                                             (action.payload.updates && (action.payload.updates.fmv !== undefined || action.payload.updates.multiplier !== undefined)) ||
                                             (action.payload.fmv !== undefined || action.payload.multiplier !== undefined);

                    let newHistory = r.history || [];
                    
                    if (isEconomicChange) {
                        newHistory = [...newHistory, { fmv: r.fmv, multiplier: r.multiplier, validUntil: Date.now() }];
                    }

                    if (action.payload.field) {
                        pUpdRol.roles[rIdx] = { ...r, [action.payload.field]: action.payload.value, history: newHistory };
                    } else {
                        const newName = action.payload.name || (action.payload.updates && action.payload.updates.name) || r.name;
                        pUpdRol.roles[rIdx] = { ...r, ...(action.payload.updates || {}), name: newName, history: newHistory };
                    }
                }
            }
            return newState;

        case 'ADD_ROLE': {
            const pAddRol = newState.projects.find(p => p.id === action.payload.projectId);
            if (pAddRol) {
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
                pAddRol.roles.push(safeRole);
            }
            return newState;
        }

        case 'TOGGLE_ROLE_ARCHIVE':
            const pTogArc = newState.projects.find(p => p.id === action.payload.projectId);
            if (pTogArc) {
                const rIdx = pTogArc.roles.findIndex(r => r.id === action.payload.roleId);
                if (rIdx > -1) {
                    pTogArc.roles[rIdx].isArchived = !pTogArc.roles[rIdx].isArchived;
                    if (pTogArc.roles[rIdx].isArchived) {
                        pTogArc.asignaciones = pTogArc.asignaciones.filter(a => a.roleId !== action.payload.roleId);
                    }
                }
            }
            return newState;

        case 'ASSIGN_USER_ROLE':
            const pAssUsr = newState.projects.find(p => p.id === action.payload.projectId);
            if (pAssUsr) {
                pAssUsr.asignaciones = pAssUsr.asignaciones.filter(a => a.roleId !== action.payload.roleId);
                pAssUsr.asignaciones.push({ roleId: action.payload.roleId, userId: action.payload.userId, assignedAt: Date.now() });
                
                const prevUsers = pAssUsr.usuarios || [];
                if (!prevUsers.find(u => u.id === action.payload.userId)) {
                    pAssUsr.usuarios.push({ id: action.payload.userId });
                }
            }
            return newState;

        // --- SISTEMA PULL Y TRIPLE ENTRADA ---
        case 'ADD_TRANSACTION':
            const pAddTx = newState.projects.find(p => p.id === action.payload.projectId);
            if (pAddTx) {
                const prevTx = pAddTx.transactions && pAddTx.transactions.length > 0 ? pAddTx.transactions[pAddTx.transactions.length - 1] : null;
                const newTx = {
                    hash: action.payload.tx?.hash || ('tx_' + Math.random().toString(36).substr(2, 9)),
                    prevHash: prevTx ? prevTx.hash : null,
                    timestamp: Date.now(),
                    status: action.payload.tx?.status || 'theoretical',
                    ...action.payload.tx
                };
                if (!pAddTx.transactions) pAddTx.transactions = [];
                pAddTx.transactions.push(newTx);
            }
            return newState;

        case 'UPDATE_TRANSACTION_PHASE':
            const pUpdPhs = newState.projects.find(p => p.id === action.payload.projectId);
            if (pUpdPhs) {
                const txPhs = pUpdPhs.transactions.find(tx => tx.hash === action.payload.txHash);
                if (txPhs) txPhs.fase = action.payload.fase;
            }
            return newState;

        case 'PING_TRANSACTION':
            const pPing = newState.projects.find(p => p.id === action.payload.projectId);
            if (pPing) {
                const txPing = pPing.transactions.find(tx => tx.hash === action.payload.txHash);
                if (txPing && txPing.status === 'theoretical') {
                    txPing.status = 'pinged';
                    txPing.assigneeId = action.payload.userId; 
                    txPing.pingTimestamp = Date.now();
                }
            }
            return newState;

        case 'REPORT_TRANSACTION':
            const pRep = newState.projects.find(p => p.id === action.payload.projectId);
            if (pRep) {
                const txRep = pRep.transactions.find(tx => tx.hash === action.payload.txHash);
                if (txRep && txRep.status === 'pinged') {
                    txRep.status = 'reported';
                    txRep.realHours = action.payload.realHours;
                    txRep.proofLink = action.payload.proofLink;
                    txRep.reportComment = action.payload.comentario;
                    txRep.reportTimestamp = Date.now();
                }
            }
            return newState;

        case 'APPROVE_TRANSACTION':
            const pAppr = newState.projects.find(p => p.id === action.payload.projectId);
            if (pAppr) {
                const txAppr = pAppr.transactions.find(tx => tx.hash === action.payload.txHash);
                if (txAppr && txAppr.status === 'reported') {
                    txAppr.status = 'consolidated';
                    txAppr.approveTimestamp = Date.now();
                    txAppr.auditorId = newState.session.activeUserId;

                    const tempStore = new Store();
                    const workTimestamp = txAppr.reportTimestamp || txAppr.pingTimestamp || Date.now();
                    const roleEconomics = tempStore.getRoleEconomicsAtTime(pAppr, txAppr.from, workTimestamp);
                    
                    const archFactor = tempStore.getArchetypeFactor(pAppr.archetype);
                    const horas = txAppr.realHours || txAppr.horas || 0;
                    
                    const valorGenerado = horas * roleEconomics.fmv * roleEconomics.multiplier * archFactor;

                    if (!pAppr.ledger) pAppr.ledger = [];
                    const lastLedgerHash = pAppr.ledger.length > 0 ? pAppr.ledger[pAppr.ledger.length - 1].hash : pAppr.genesisHash;
                    const blockData = `${lastLedgerHash}|${txAppr.assigneeId}|${roleEconomics.id}|${horas}|${valorGenerado}|${Date.now()}`;
                    
                    const realCryptoHash = await generateSHA256(blockData);

                    pAppr.ledger.push({
                        id: 'ledg_' + Math.random().toString(36).substr(2, 9),
                        hash: realCryptoHash,        // Sello inmutable
                        prevHash: lastLedgerHash,    // Cadena
                        previousHash: lastLedgerHash, 
                        userId: txAppr.assigneeId,
                        roleId: roleEconomics.id,
                        description: `[PoW] ${txAppr.entregable}`,
                        horas: horas, 
                        valorCongelado: valorGenerado, 
                        timestamp: Date.now() 
                    });

                    txAppr.valorCongelado = valorGenerado;
                }
            }
            return newState;

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

        // AUTO-MIGRACIÓN
        if (!this.state.globalUsers.find(u => u.id === 'usr_alvaro_001')) {
            this.state.globalUsers.unshift(initialState.globalUsers[0]);
        }

        // Si era el viejo admin, lo transicionamos
        if (this.state.session.activeUserId === 'ecosystem-admin') {
            this.state.session.activeUserId = 'usr_alvaro_001';
            this.state.session.role = 'ecosystem-owner';
        }

        // Aseguramos que existe el nodo config y la variable allowUserCreation
        if (!this.state.config) {
            this.state.config = initialState.config;
        } else if (this.state.config.allowUserCreation === undefined) {
            this.state.config.allowUserCreation = false;
        }

        if (this.state.projects) {
            this.state.projects = this.state.projects.map(p => ({
                ...p, 
                alerts: p.alerts || [],
                ownerId: p.ownerId || 'usr_alvaro_001',
                archetype: p.archetype || 'startup',
                genesisHash: p.genesisHash || ('0xGENESIS_LEGACY_' + p.id)
            }));
        }

        if (!this.state.macroFlows) this.state.macroFlows = [];

        this.listeners = [];
    }

    getState() { return this.state; }
    
    async dispatch(action) {
        this.state = await asyncReducer(this.state, action);
        localStorage.setItem('tt_sos_state', JSON.stringify(this.state));
        this.listeners.forEach(l => l());
    }
    
    subscribe(listener) { this.listeners.push(listener); }

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

    async importSessionJSON(arg1, arg2) {
        if (typeof arg1 === 'string' && !arg2) {
            try {
                const parsed = JSON.parse(arg1);
                await this.dispatch({ type: 'IMPORT_STATE', payload: parsed });
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
            await this.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId, updates: { ledger: [...(p.ledger || []), ...entries] } } });
            return true;
        }
    }
} 

export const store = new Store();
