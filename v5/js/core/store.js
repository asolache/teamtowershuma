// ==========================================================================
// KERNEL v10.2 - SISTEMA OPERATIVO TEAMTOWERS (store.js)
// Motor de Estado Global, RBAC, Contabilidad Triple Entrada, Slicing Pie, Privacidad, Capital e Identidad Fractal
// ==========================================================================

import { GLOBAL_ONTOLOGY } from '../data/ontology.js';

// --- UTILIDAD CRIPTOGRÁFICA (V7.0) ---
async function generateSHA256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 1. ESTADO INICIAL
const initialState = {
    config: {
        theme: 'dark',
        ecosystemName: 'TeamTowers Network',
        globalPrompt: 'Eres el orquestador principal de un sistema DAO enfocado en meritocracia y transparencia.',
        allowUserCreation: false,
        archetype: 'startup' // V9.9
    },
    ontology: { sectores: {} },
    globalUsers: [
        {
            id: 'usr_alvaro_001',
            name: 'Alvaro',
            globalRole: 'ecosystem-owner', 
            walletOrSocial: 'founder@teamtowers.com',
            email: 'founder@teamtowers.com',
            wallet: '0xMasterArchitect...',
            profile: {
                vision: "Fundador y Master Architect de TeamTowers SOS.",
                structural_affinity: ["@anxaneta", "@aixecador"],
                guardian_authority: ["creator", "magician"],
                guardian_growth: ["ruler"],
                lastUpdated: Date.now()
            }
        },
        {
            id: 'usr_test_002',
            name: 'Laura Dev',
            globalRole: 'network-user', 
            walletOrSocial: '0xLaura...',
            email: 'laura@dao.com',
            wallet: '0xLaura...',
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
    session: { activeUserId: 'usr_alvaro_001', role: 'ecosystem-owner' }
};

// 2. REDUCER ASÍNCRONO BLINDADO
async function asyncReducer(state, action) {
    let newState = JSON.parse(JSON.stringify(state)); 

    switch (action.type) {
        
        // --- SISTEMA Y CONFIGURACIÓN ---
        case 'IMPORT_STATE': 
            return { ...newState, ...action.payload };
            
        case 'UPDATE_GLOBAL_CONFIG': 
        case 'UPDATE_CONFIG': // V9.9
            return { ...newState, config: { ...newState.config, ...action.payload } };

        // --- ONTOLOGÍA DINÁMICA ---
        case 'ADD_ONTOLOGY_SECTOR':
            newState.ontology.sectores[action.payload.sectorId] = action.payload.rolesData;
            return newState;
            
        case 'ADD_SECTOR': {
            const sectorId = action.payload.id || action.payload.name || 'custom_sector';
            const sectorData = action.payload.data || action.payload.roles || action.payload;
            newState.ontology.sectores[sectorId] = sectorData;
            return newState;
        }

        // --- V8.0: IDENTIDAD FRACTAL (PERMAWEB BRIDGE) ---
        case 'REGISTER_GLOBAL_USER': {
            const newId = action.payload.id.toLowerCase();
            const existsGlobal = newState.globalUsers.find(u => u.id === newId);
            
            if (!existsGlobal) {
                newState.globalUsers.push({
                    id: newId,
                    name: action.payload.name,
                    email: action.payload.email || '',
                    wallet: action.payload.wallet || '',
                    social: action.payload.social || '',
                    walletOrSocial: action.payload.email || action.payload.wallet || '', 
                    globalRole: action.payload.globalRole || 'network-user',
                    profile: action.payload.profile || { lastUpdated: Date.now() }
                });
            }
            return newState;
        }

        case 'UPDATE_USER_PROFILE': {
            const uIdx = newState.globalUsers.findIndex(u => u.id === action.payload.userId);
            if (uIdx > -1) {
                newState.globalUsers[uIdx].profile = {
                    ...newState.globalUsers[uIdx].profile,
                    ...action.payload.profile,
                    lastUpdated: Date.now()
                };
            }
            return newState;
        }

        // --- IDENTIDAD Y SEGURIDAD (LEGACY / COLLA SCOPE) ---
        case 'ADD_USER': {
            const newId = action.payload.id || action.payload.userId;
            const existsGlobal = newState.globalUsers.find(u => u.id === newId);
            
            if (!existsGlobal) {
                newState.globalUsers.push({ 
                    id: newId, 
                    name: action.payload.name, 
                    email: action.payload.email || '',
                    wallet: action.payload.wallet || '',
                    social: action.payload.social || '',
                    walletOrSocial: action.payload.walletOrSocial || action.payload.email || '', 
                    globalRole: action.payload.globalRole || 'network-user',
                    profile: action.payload.profile || { lastUpdated: Date.now() }
                });
            }
            
            if (action.payload.projectId) {
                const pUser = newState.projects.find(p => p.id === action.payload.projectId);
                if (pUser) {
                    pUser.usuarios = pUser.usuarios || [];
                    if (!pUser.usuarios.find(u => u.id === newId)) pUser.usuarios.push({ id: newId, joinedAt: Date.now() });
                }
            }
            return newState;
        }

        case 'LOGIN_USER': {
            const user = newState.globalUsers.find(u => u.id === action.payload.userId);
            newState.session.activeUserId = action.payload.userId;
            newState.session.role = user ? (user.globalRole || 'network-user') : 'guest';
            return newState;
        }
        
        case 'LOGOUT_USER': 
            newState.session.activeUserId = null;
            newState.session.role = 'guest';
            return newState;

        // --- GESTIÓN DE PROYECTOS / REDES ---
        case 'ADD_PROJECT_RESTRICTED': {
            if (newState.session.role !== 'ecosystem-owner') return newState; 
            return newState; 
        }

        case 'CREATE_PROJECT': // Arquitectura V10 Native
        case 'ADD_PROJECT': {
            const canCreate = newState.session.role === 'ecosystem-owner' || newState.config.allowUserCreation || action.payload.bypassSecurity;
            if (!canCreate && !action.payload.ownerId) return newState; 

            const pSector = action.payload.sector || 'startup';
            let sectorDataObj = GLOBAL_ONTOLOGY[pSector];
            let sectorRolesArray = [];

            if (sectorDataObj) {
                if (!sectorDataObj.roles) {
                    sectorRolesArray = Object.keys(sectorDataObj).filter(k => k !== '_meta').map(levelId => {
                        const r = sectorDataObj[levelId];
                        return { levelId, name: r.name || levelId, multiplier: r.multiplier || 1.0, fmv: r.fmv || 50, ai_prompt: r.ai_prompt || '', standard_deliverables: r.standard_deliverables || [] };
                    });
                } else {
                    sectorRolesArray = sectorDataObj.roles;
                }
            } else {
                const legacySectorData = newState.ontology.sectores[pSector] || {};
                Object.keys(legacySectorData).forEach(levelId => {
                    const r = legacySectorData[levelId];
                    sectorRolesArray.push({ levelId, name: r.name || levelId, multiplier: r.multiplier || 1.0, fmv: r.fmv || 50, ai_prompt: r.ai_prompt || '', standard_deliverables: r.standard_deliverables || [] });
                });
            }

            let baseRoles = sectorRolesArray.map(r => ({
                id: `role-${r.levelId.replace('@','')}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                levelId: r.levelId, name: (r.levelId === '@anxaneta' && action.payload.sector === 'marketing') ? 'Growth Hacker / CMO' : r.name,
                multiplier: r.multiplier || 1.0, fmv: r.fmv || 50, ai_prompt: r.ai_prompt || '', standard_deliverables: r.standard_deliverables ? JSON.parse(JSON.stringify(r.standard_deliverables)) : [],
                isArchived: false, history: [] 
            }));

            if (baseRoles.length === 0) {
                baseRoles = action.payload.customRoles || action.payload.roles || [
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

            const initHash = await generateSHA256(`GENESIS_${projId}_${Date.now()}`);

            // V10: Inyección de estructuras separadas
            newState.projects.push({
                id: projId, nombre: action.payload.nombre || 'Nuevo Proyecto', sector: pSector, tipo: action.payload.tipo || 'project', 
                archetype: arquetipo, ownerId: ownerId, prompt: action.payload.prompt || '', config: { tokenomics: 'startup', archetype: arquetipo },
                isPrivate: action.payload.isPrivate !== undefined ? action.payload.isPrivate : false, 
                roles: baseRoles, 
                usuarios: action.payload.usuarios || [{ id: ownerId }], 
                asignaciones: [], 
                transactions: action.payload.transactions || [], // V9 Legacy
                vna_flows: action.payload.vna_flows || [],       // V10 Tuberías
                work_orders: action.payload.work_orders || [],   // V10 Instancias
                ledger: action.payload.ledger || [], 
                alerts: [], 
                invitations: [], 
                genesisHash: initHash 
            });
            return newState;
        }

        case 'LOG_INVITATION': {
            const pInv = newState.projects.find(p => p.id === action.payload.projectId);
            if (pInv) {
                pInv.invitations = pInv.invitations || [];
                pInv.invitations.push({ email: action.payload.email, sentAt: Date.now(), invitedBy: newState.session.activeUserId });
            }
            return newState;
        }

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
            if (pRes) pRes.alerts = (pRes.alerts || []).map(a => a.id === action.payload.alertId ? { ...a, resolved: true } : a);
            return newState;
        }

        case 'PROMOTE_TO_PO': {
            const pPO = newState.projects.find(p => p.id === action.payload.projectId);
            if (pPO) pPO.ownerId = action.payload.userId;
            return newState;
        }

        case 'ADD_MACRO_FLOW': {
            newState.macroFlows = [...(newState.macroFlows || []), {
                id: 'mflow-' + Date.now(), from: action.payload.fromProjectId, to: action.payload.toProjectId,
                entregable: action.payload.entregable || 'Intercambio de Valor', tipo: action.payload.tipo || 'tangible'
            }];
            return newState;
        }

        case 'UPDATE_PROJECT_INFO': {
            const pInfo = newState.projects.find(p => p.id === action.payload.projectId);
            if (pInfo) Object.assign(pInfo, action.payload.updates);
            return newState;
        }

        case 'UPDATE_ARCHETYPE':
        case 'UPDATE_PROJECT_CONFIG': {
            const pArch = newState.projects.find(p => p.id === action.payload.projectId);
            if (pArch) {
                const newArch = action.payload.archetype || action.payload.arquetipo || (action.payload.config && action.payload.config.archetype) || pArch.archetype;
                pArch.archetype = newArch;
                pArch.config = { ...pArch.config, ...(action.payload.config || {}), archetype: newArch };
            }
            return newState;
        }

        case 'UPDATE_ROLE': {
            const pUpdRol = newState.projects.find(p => p.id === action.payload.projectId);
            if (pUpdRol) {
                const rIdx = pUpdRol.roles.findIndex(r => r.id === action.payload.roleId);
                if (rIdx > -1) {
                    const r = pUpdRol.roles[rIdx];
                    const isEconomicChange = (action.payload.field === 'fmv' || action.payload.field === 'multiplier') ||
                                             (action.payload.updates && (action.payload.updates.fmv !== undefined || action.payload.updates.multiplier !== undefined)) ||
                                             (action.payload.fmv !== undefined || action.payload.multiplier !== undefined);
                    let newHistory = r.history || [];
                    if (isEconomicChange) newHistory = [...newHistory, { fmv: r.fmv, multiplier: r.multiplier, validUntil: Date.now() }];

                    if (action.payload.field) {
                        pUpdRol.roles[rIdx] = { ...r, [action.payload.field]: action.payload.value, history: newHistory };
                    } else {
                        const newName = action.payload.name || (action.payload.updates && action.payload.updates.name) || r.name;
                        pUpdRol.roles[rIdx] = { ...r, ...(action.payload.updates || {}), name: newName, history: newHistory };
                    }
                }
            }
            return newState;
        }

        case 'ADD_ROLE': {
            const pAddRol = newState.projects.find(p => p.id === action.payload.projectId);
            if (pAddRol) {
                pAddRol.roles.push({
                    id: action.payload.role.id || `role-${Date.now()}`, name: action.payload.role.name || 'Nuevo Nodo',
                    levelId: action.payload.role.levelId || '@baixos', multiplier: action.payload.role.multiplier || 1.0,
                    fmv: action.payload.role.fmv || 50, isArchived: false, history: [], ...action.payload.role
                });
            }
            return newState;
        }

        case 'TOGGLE_ROLE_ARCHIVE': {
            const pTogArc = newState.projects.find(p => p.id === action.payload.projectId);
            if (pTogArc) {
                const rIdx = pTogArc.roles.findIndex(r => r.id === action.payload.roleId);
                if (rIdx > -1) {
                    pTogArc.roles[rIdx].isArchived = !pTogArc.roles[rIdx].isArchived;
                    if (pTogArc.roles[rIdx].isArchived) pTogArc.asignaciones = pTogArc.asignaciones.filter(a => a.roleId !== action.payload.roleId);
                }
            }
            return newState;
        }

        case 'ASSIGN_USER_ROLE': {
            const pAssUsr = newState.projects.find(p => p.id === action.payload.projectId);
            if (pAssUsr) {
                pAssUsr.asignaciones = pAssUsr.asignaciones.filter(a => a.roleId !== action.payload.roleId);
                pAssUsr.asignaciones.push({ roleId: action.payload.roleId, userId: action.payload.userId, assignedAt: Date.now() });
                const prevUsers = pAssUsr.usuarios || [];
                if (!prevUsers.find(u => u.id === action.payload.userId)) pAssUsr.usuarios.push({ id: action.payload.userId });
            }
            return newState;
        }

        // =========================================================
        // ARQUITECTURA V10: SEPARACIÓN DE MODELO E INSTANCIA
        // =========================================================

        // --- 1. LAS TUBERÍAS (VNA FLOWS) ---
        case 'ADD_FLOW': {
            const pFlowAdd = newState.projects.find(p => p.id === action.payload.projectId);
            if (pFlowAdd) {
                if (!pFlowAdd.vna_flows) pFlowAdd.vna_flows = [];
                pFlowAdd.vna_flows.push({
                    ...action.payload.flow,
                    id: action.payload.flow.id || ('flow_' + Date.now())
                });
            }
            return newState; // FIX: Return enforced
        }

        case 'UPDATE_FLOW': {
            const pFlowUpd = newState.projects.find(p => p.id === action.payload.projectId);
            if (pFlowUpd && pFlowUpd.vna_flows) {
                const fIdx = pFlowUpd.vna_flows.findIndex(f => f.id === action.payload.flowId);
                if (fIdx > -1) {
                    pFlowUpd.vna_flows[fIdx] = { ...pFlowUpd.vna_flows[fIdx], ...action.payload.updates };
                }
            }
            return newState; // FIX: Return enforced
        }

        case 'DELETE_FLOW': {
            const pFlowDel = newState.projects.find(p => p.id === action.payload.projectId);
            if (pFlowDel && pFlowDel.vna_flows) {
                pFlowDel.vna_flows = pFlowDel.vna_flows.filter(f => f.id !== action.payload.flowId);
            }
            return newState; // FIX: Return enforced
        }

        // --- 2. EL AGUA (WORK ORDERS EN KANBAN) ---
        case 'SPAWN_WORK_ORDER': {
            const pWoAdd = newState.projects.find(p => p.id === action.payload.projectId);
            if (pWoAdd) {
                if (!pWoAdd.work_orders) pWoAdd.work_orders = [];
                pWoAdd.work_orders.push({
                    ...action.payload.workOrder,
                    timestamp: Date.now()
                });
            }
            return newState; // FIX: Return enforced
        }

        case 'UPDATE_WORK_ORDER': {
            const pWoUp = newState.projects.find(p => p.id === action.payload.projectId);
            if (pWoUp && pWoUp.work_orders) {
                const woIdx = pWoUp.work_orders.findIndex(t => t.hash === action.payload.woHash);
                if (woIdx > -1) {
                    pWoUp.work_orders[woIdx] = { ...pWoUp.work_orders[woIdx], ...action.payload.updates };
                }
            }
            return newState; // FIX: Return enforced
        }

        case 'DELETE_WORK_ORDER': {
            const pWoDel = newState.projects.find(p => p.id === action.payload.projectId);
            if (pWoDel && pWoDel.work_orders) {
                pWoDel.work_orders = pWoDel.work_orders.filter(t => t.hash !== action.payload.woHash);
            }
            return newState; // FIX: Return enforced
        }

        case 'REQUEST_WORK_ORDER':
        case 'PING_WORK_ORDER': {
            const pWoPing = newState.projects.find(p => p.id === action.payload.projectId);
            if (pWoPing && pWoPing.work_orders) {
                const wo = pWoPing.work_orders.find(t => t.hash === action.payload.woHash);
                if (wo) {
                    wo.status = action.type === 'REQUEST_WORK_ORDER' ? 'requested' : 'pinged';
                    wo.assigneeId = action.payload.userId;
                }
            }
            return newState; // FIX: Return enforced
        }

        case 'REPORT_WORK_ORDER': {
            const pWoRep = newState.projects.find(p => p.id === action.payload.projectId);
            if (pWoRep && pWoRep.work_orders) {
                const wo = pWoRep.work_orders.find(t => t.hash === action.payload.woHash);
                if (wo) {
                    wo.status = 'reported';
                    wo.realHours = action.payload.realHours;
                    wo.proofLink = action.payload.proofLink;
                    wo.comentario = action.payload.comentario;
                }
            }
            return newState; // FIX: Return enforced
        }

        case 'APPROVE_WORK_ORDER': {
            const pWoApp = newState.projects.find(p => p.id === action.payload.projectId);
            if (pWoApp && pWoApp.work_orders) {
                const wo = pWoApp.work_orders.find(t => t.hash === action.payload.woHash);
                if (wo) {
                    wo.status = 'consolidated';
                    if (!pWoApp.ledger) pWoApp.ledger = [];
                    
                    let flow = (pWoApp.vna_flows || []).find(f => f.id === wo.flowId);
                    let multiplier = 1;
                    let fmv = 50;
                    let roleId = 'Unknown';
                    let deliverableName = 'Work Order Instanciada';

                    if (flow) {
                        roleId = flow.to;
                        deliverableName = flow.template || flow.entregable || 'Entregable';
                        const role = pWoApp.roles.find(r => r.id === roleId);
                        if (role) {
                            multiplier = role.multiplier || 1;
                            fmv = role.fmv || 50;
                        }
                    }

                    const tStore = new Store();
                    const archFactor = tStore.getArchetypeFactor(pWoApp.archetype);

                    const slices = (wo.realHours * fmv) * multiplier * archFactor;
                    wo.valorCongelado = slices;

                    pWoApp.ledger.push({
                        id: 'blk_' + Date.now(),
                        hash: wo.hash,
                        userId: wo.assigneeId,
                        roleId: roleId,
                        horas: wo.realHours,
                        multiplier: multiplier,
                        fmv: fmv,
                        valorCongelado: slices,
                        timestamp: Date.now(),
                        description: deliverableName
                    });
                }
            }
            return newState; // FIX: Return enforced
        }

        // =========================================================
        // MANTENIMIENTO LEGACY V9 (Evita crashes temporales en Kanban/Mapas V9)
        // =========================================================
        case 'ADD_TRANSACTION': {
            const pAddTx = newState.projects.find(p => p.id === action.payload.projectId);
            if (pAddTx) {
                const prevTx = pAddTx.transactions && pAddTx.transactions.length > 0 ? pAddTx.transactions[pAddTx.transactions.length - 1] : null;
                if (!pAddTx.transactions) pAddTx.transactions = [];
                pAddTx.transactions.push({
                    hash: action.payload.tx?.hash || ('tx_' + Math.random().toString(36).substr(2, 9)),
                    prevHash: prevTx ? prevTx.hash : null, timestamp: Date.now(), status: action.payload.tx?.status || 'theoretical', ...action.payload.tx
                });
            }
            return newState; // FIX: Return enforced
        }
        case 'UPDATE_TRANSACTION': {
            const pTxUp = newState.projects.find(p => p.id === action.payload.projectId);
            if (pTxUp && pTxUp.transactions) {
                const txIdx = pTxUp.transactions.findIndex(t => t.hash === action.payload.txHash);
                if (txIdx > -1) pTxUp.transactions[txIdx] = { ...pTxUp.transactions[txIdx], ...action.payload.updates };
            }
            return newState; // FIX: Return enforced
        }
        case 'DELETE_TRANSACTION': {
            const pTxDel = newState.projects.find(p => p.id === action.payload.projectId);
            if (pTxDel && pTxDel.transactions) pTxDel.transactions = pTxDel.transactions.filter(t => t.hash !== action.payload.txHash);
            return newState; // FIX: Return enforced
        }
        case 'REQUEST_TRANSACTION': {
            const pReqTx = newState.projects.find(p => p.id === action.payload.projectId);
            if (pReqTx && pReqTx.transactions) {
                const txReq = pReqTx.transactions.find(tx => tx.hash === action.payload.txHash);
                if (txReq && txReq.status === 'theoretical') {
                    txReq.status = 'requested'; txReq.assigneeId = action.payload.userId; txReq.requestTimestamp = Date.now();
                }
            }
            return newState; // FIX: Return enforced
        }
        case 'PING_TRANSACTION': {
            const pPing = newState.projects.find(p => p.id === action.payload.projectId);
            if (pPing && pPing.transactions) {
                const txPing = pPing.transactions.find(tx => tx.hash === action.payload.txHash);
                if (txPing && (txPing.status === 'theoretical' || txPing.status === 'requested')) {
                    txPing.status = 'pinged'; txPing.assigneeId = action.payload.userId; txPing.pingTimestamp = Date.now();
                }
            }
            return newState; // FIX: Return enforced
        }
        case 'REPORT_TRANSACTION': {
            const pRep = newState.projects.find(p => p.id === action.payload.projectId);
            if (pRep && pRep.transactions) {
                const txRep = pRep.transactions.find(tx => tx.hash === action.payload.txHash);
                if (txRep && txRep.status === 'pinged') {
                    txRep.status = 'reported'; txRep.realHours = action.payload.realHours;
                    txRep.proofLink = action.payload.proofLink; txRep.reportComment = action.payload.comentario; txRep.reportTimestamp = Date.now();
                }
            }
            return newState; // FIX: Return enforced
        }
        case 'APPROVE_TRANSACTION': {
            const pAppr = newState.projects.find(p => p.id === action.payload.projectId);
            if (pAppr && pAppr.transactions) {
                const txAppr = pAppr.transactions.find(tx => tx.hash === action.payload.txHash);
                if (txAppr && txAppr.status === 'reported') {
                    txAppr.status = 'consolidated'; txAppr.approveTimestamp = Date.now(); txAppr.auditorId = newState.session.activeUserId;
                    
                    let roleEconomics = { fmv: 50, multiplier: 1.0, id: txAppr.to };
                    const role = pAppr.roles.find(r => r.id === txAppr.to);
                    if (role) {
                        roleEconomics.fmv = role.fmv || 50;
                        roleEconomics.multiplier = role.multiplier || 1.0;
                    }

                    const archFactors = { 'startup': 2.0, 'corporate': 1.0, 'corp': 1.0, 'dao': 1.5 };
                    const archFactor = archFactors[pAppr.archetype] || 1.0;

                    const horas = txAppr.realHours || txAppr.horas || 0;
                    const valorGenerado = horas * roleEconomics.fmv * roleEconomics.multiplier * archFactor;

                    if (!pAppr.ledger) pAppr.ledger = [];
                    const lastLedgerHash = pAppr.ledger.length > 0 ? pAppr.ledger[pAppr.ledger.length - 1].hash : pAppr.genesisHash;
                    
                    const fakeHash = '0xMOCK_' + Date.now();

                    pAppr.ledger.push({
                        id: 'ledg_' + Math.random().toString(36).substr(2, 9),
                        hash: fakeHash, prevHash: lastLedgerHash, previousHash: lastLedgerHash, 
                        userId: txAppr.assigneeId, roleId: roleEconomics.id, description: `[PoW] ${txAppr.entregable}`,
                        horas: horas, valorCongelado: valorGenerado, timestamp: Date.now() 
                    });
                    txAppr.valorCongelado = valorGenerado;
                }
            }
            return newState; // FIX: Return enforced
        }

        // V7.4: INYECCIONES DE CAPITAL (SLICING PIE)
        case 'ADD_CAPITAL_INJECTION': {
            const pCap = newState.projects.find(p => p.id === action.payload.projectId);
            if (pCap) {
                let multiplier = 2.0; 
                if (action.payload.assetType === 'cash') multiplier = 4.0;
                
                const archFactors = { 'startup': 2.0, 'corporate': 1.0, 'corp': 1.0, 'dao': 1.5 };
                const archFactor = archFactors[pCap.archetype] || 1.0;
                const valorGenerado = action.payload.amount * multiplier * archFactor;

                if (!pCap.ledger) pCap.ledger = [];
                const lastLedgerHash = pCap.ledger.length > 0 ? pCap.ledger[pCap.ledger.length - 1].hash : pCap.genesisHash;
                
                pCap.ledger.push({
                    id: 'ledg_' + Math.random().toString(36).substr(2, 9),
                    hash: '0xCAP_' + Date.now(),
                    prevHash: lastLedgerHash,
                    previousHash: lastLedgerHash,
                    userId: action.payload.userId, roleId: 'CAPITAL_ASSET',
                    description: `[Capital: ${action.payload.assetType.toUpperCase()}] ${action.payload.description}`,
                    horas: 0, valorCongelado: valorGenerado, timestamp: Date.now()
                });
            }
            return newState; // FIX: Return enforced
        }

        default: 
            return state; // Válvula de seguridad si el case no existe
    }
    
    return newState; // Doble seguro final
} 

// 3. CLASE STORE: Controlador de Métodos
class Store {
    constructor() {
        const saved = localStorage.getItem('tt_sos_state');
        if (saved) { try { this.state = JSON.parse(saved); } catch(e) { this.state = initialState; } } else { this.state = initialState; }

        if (!this.state.globalUsers.find(u => u.id === 'usr_alvaro_001')) this.state.globalUsers.unshift(initialState.globalUsers[0]);
        if (this.state.session.activeUserId === 'ecosystem-admin') { this.state.session.activeUserId = 'usr_alvaro_001'; this.state.session.role = 'ecosystem-owner'; }
        if (!this.state.config) this.state.config = initialState.config; else if (this.state.config.allowUserCreation === undefined) this.state.config.allowUserCreation = false;

        if (this.state.projects) {
            this.state.projects = this.state.projects.map(p => ({
                ...p, alerts: p.alerts || [], ownerId: p.ownerId || 'usr_alvaro_001', archetype: p.archetype || 'startup', genesisHash: p.genesisHash || ('0xGENESIS_LEGACY_' + p.id),
                isPrivate: p.isPrivate !== undefined ? p.isPrivate : false, invitations: p.invitations || [],
                vna_flows: p.vna_flows || [], work_orders: p.work_orders || [] // Inicializador seguro V10
            }));
        }
        if (!this.state.macroFlows) this.state.macroFlows = [];
        this.listeners = [];
    }

    getState() { return this.state; }
    
    saveState() {
        localStorage.setItem('tt_sos_state', JSON.stringify(this.state));
        this.listeners.forEach(l => l());
    }

    async dispatch(action) {
        this.state = await asyncReducer(this.state, action);
        this.saveState();
    }
    
    subscribe(listener) { this.listeners.push(listener); }

    canUserViewProject(projectId, userId, globalRole) {
        if (globalRole === 'ecosystem-owner') return true; 
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return false;
        if (!p.isPrivate) return true; 
        if (p.ownerId === userId) return true;
        if (p.usuarios && p.usuarios.find(u => u.id === userId)) return true;
        return false;
    }

    getRoleEconomicsAtTime(project, roleId, targetTimestamp) {
        const role = project.roles.find(r => r.id === roleId);
        if (!role) return { id: 'unknown', fmv: 50, multiplier: 1.0 };
        if (!role.history || role.history.length === 0) return { id: role.id, fmv: role.fmv || 50, multiplier: role.multiplier || 1.0 };
        for (let i = 0; i < role.history.length; i++) {
            if (targetTimestamp <= role.history[i].validUntil) return { id: role.id, fmv: role.history[i].fmv, multiplier: role.history[i].multiplier };
        }
        return { id: role.id, fmv: role.fmv || 50, multiplier: role.multiplier || 1.0 };
    }

    getArchetypeFactor(archetype) { return { 'startup': 2.0, 'corporate': 1.0, 'corp': 1.0, 'dao': 1.5 }[archetype] || 1.0; }

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
        if (!p) return 100;
        
        // Evaluamos atascos tanto en V9 (transactions) como en V10 (work_orders)
        const oldStuck = (p.transactions || []).filter(t => t.status === 'reported' || t.status === 'pinged').length;
        const newStuck = (p.work_orders || []).filter(t => t.status === 'reported' || t.status === 'pinged').length;
        const atascos = oldStuck + newStuck;
        
        return Math.round(Math.max(0, 100 - (atascos * 5)));
    }

    calculateHarvest(projectId, totalValuation = 0) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.ledger || p.ledger.length === 0) return [];
        let capTable = {};
        let totalSlices = 0;
        p.ledger.forEach(l => {
            const key = l.userId || l.roleId || 'unknown';
            if (!capTable[key]) capTable[key] = { userId: l.userId, roleId: l.roleId, totalValue: 0 };
            capTable[key].totalValue += l.valorCongelado;
            totalSlices += l.valorCongelado;
        });
        if (totalSlices === 0) return [];
        return Object.keys(capTable).map(key => {
            const entry = capTable[key];
            const percentage = (entry.totalValue / totalSlices);
            return { userId: entry.userId, roleId: entry.roleId, totalValue: entry.totalValue, slices: entry.totalValue, percentage: (percentage * 100).toFixed(2) + '%', financialValue: (percentage * totalValuation).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) };
        }).sort((a, b) => b.totalValue - a.totalValue);
    }

    generateSystemPrompt(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return "";
        let sysPrompt = `El prompt incluye secuenciación temporal. El prompt incluye personalización de roles. Contexto Global: ${this.state.config.globalPrompt}. Contexto Local: ${p.prompt}. Roles: ${p.roles.map(r => r.name).join(', ')}. `;
        let activePhase = 1;
        if (p.transactions && p.transactions.length > 0) {
            const withPhase = p.transactions.filter(t => t.fase);
            if (withPhase.length > 0) activePhase = withPhase[withPhase.length - 1].fase;
        }
        return sysPrompt + `Fase actual: Fase ${activePhase}:`;
    }

    async importSessionJSON(arg1, arg2) {
        if (typeof arg1 === 'string' && !arg2) {
            try { const parsed = JSON.parse(arg1); await this.dispatch({ type: 'IMPORT_STATE', payload: parsed }); return true; } catch(e) { return false; }
        } else {
            const projectId = arg1; const jsonArray = arg2; const p = this.state.projects.find(x => x.id === projectId); if (!p) return;
            const entries = jsonArray.map(item => ({ userId: item.userId, roleId: item.roleId, description: item.description, horas: item.horas, valorCongelado: item.horas * 50 * 2, timestamp: Date.now() }));
            await this.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId, updates: { ledger: [...(p.ledger || []), ...entries] } } });
            return true;
        }
    }
} 
export const store = new Store();
