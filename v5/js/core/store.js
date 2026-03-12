// ==========================================================================
// KERNEL v10.3 - SISTEMA OPERATIVO TEAMTOWERS (store.js)
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
            newState.config = { ...newState.config, ...action.payload };
            break;

        // --- ONTOLOGÍA DINÁMICA ---
        case 'ADD_ONTOLOGY_SECTOR':
            newState.ontology.sectores[action.payload.sectorId] = action.payload.rolesData;
            break;
            
        case 'ADD_SECTOR': {
            const sectorId = action.payload.id || action.payload.name || 'custom_sector';
            const sectorData = action.payload.data || action.payload.roles || action.payload;
            newState.ontology.sectores[sectorId] = sectorData;
            break;
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
            break;
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
            break;
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
            break;
        }

        case 'LOGIN_USER': {
            const user = newState.globalUsers.find(u => u.id === action.payload.userId);
            newState.session = { activeUserId: action.payload.userId, role: user ? (user.globalRole || 'network-user') : 'guest' };
            break;
        }
        
        case 'LOGOUT_USER': 
            newState.session = { activeUserId: null, role: 'guest' };
            break;

        // --- GESTIÓN DE PROYECTOS / REDES ---
        case 'ADD_PROJECT_RESTRICTED': {
            if (newState.session.role !== 'ecosystem-owner') return newState; 
            break;
        }

        case 'CREATE_PROJECT': // Arquitectura V10 Native
        case 'ADD_PROJECT': {
            const ownerId = action.payload.ownerId || newState.session.activeUserId;
            const pSector = action.payload.sector || 'startup';
            const projId = action.payload.id || ('proj-' + Date.now());
            const initHash = await generateSHA256(`GENESIS_${projId}_${Date.now()}`);

            newState.projects.push({
                id: projId, nombre: action.payload.nombre || 'Nuevo Proyecto', sector: pSector,
                archetype: action.payload.archetype || 'startup', ownerId: ownerId,
                roles: action.payload.roles || [], usuarios: [{ id: ownerId }], 
                vna_flows: [], work_orders: [], ledger: [], genesisHash: initHash 
            });
            break;
        }

        case 'UPDATE_PROJECT_INFO': {
            const p = newState.projects.find(p => p.id === action.payload.projectId);
            if (p) Object.assign(p, action.payload.updates);
            break;
        }

        case 'UPDATE_ROLE': {
            const p = newState.projects.find(p => p.id === action.payload.projectId);
            if (p) {
                const rIdx = p.roles.findIndex(r => r.id === action.payload.roleId);
                if (rIdx > -1) p.roles[rIdx] = { ...p.roles[rIdx], ...action.payload.updates };
            }
            break;
        }

        case 'ADD_ROLE': {
            const p = newState.projects.find(p => p.id === action.payload.projectId);
            if (p) p.roles.push({ id: action.payload.role.id || `role-${Date.now()}`, isArchived: false, ...action.payload.role });
            break;
        }

        case 'TOGGLE_ROLE_ARCHIVE': {
            const p = newState.projects.find(p => p.id === action.payload.projectId);
            if (p) {
                const r = p.roles.find(r => r.id === action.payload.roleId);
                if (r) r.isArchived = !r.isArchived;
            }
            break;
        }

        // --- ARQUITECTURA V10: FLOWS & ORDERS ---
        case 'ADD_FLOW': {
            const p = newState.projects.find(p => p.id === action.payload.projectId);
            if (p) {
                p.vna_flows = p.vna_flows || [];
                p.vna_flows.push({ id: action.payload.flow.id || ('flow_' + Date.now()), ...action.payload.flow });
            }
            break;
        }

        case 'UPDATE_FLOW': {
            const p = newState.projects.find(p => p.id === action.payload.projectId);
            if (p && p.vna_flows) {
                const f = p.vna_flows.find(f => f.id === action.payload.flowId);
                if (f) Object.assign(f, action.payload.updates);
            }
            break;
        }

        case 'DELETE_FLOW': {
            const p = newState.projects.find(p => p.id === action.payload.projectId);
            if (p && p.vna_flows) p.vna_flows = p.vna_flows.filter(f => f.id !== action.payload.flowId);
            break;
        }

        case 'SPAWN_WORK_ORDER': {
            const p = newState.projects.find(p => p.id === action.payload.projectId);
            if (p) {
                p.work_orders = p.work_orders || [];
                p.work_orders.push({ ...action.payload.workOrder, timestamp: Date.now() });
            }
            break;
        }

        case 'PING_WORK_ORDER':
        case 'REPORT_WORK_ORDER': {
            const p = newState.projects.find(p => p.id === action.payload.projectId);
            if (p && p.work_orders) {
                const wo = p.work_orders.find(t => t.hash === action.payload.woHash);
                if (wo) {
                    if (action.type === 'PING_WORK_ORDER') { wo.status = 'pinged'; wo.assigneeId = action.payload.userId; }
                    else { wo.status = 'reported'; wo.realHours = action.payload.realHours; }
                }
            }
            break;
        }

        case 'APPROVE_WORK_ORDER': {
            const p = newState.projects.find(p => p.id === action.payload.projectId);
            if (p && p.work_orders) {
                const wo = p.work_orders.find(t => t.hash === action.payload.woHash);
                if (wo) {
                    wo.status = 'consolidated';
                    const flow = p.vna_flows.find(f => f.id === wo.flowId);
                    const role = p.roles.find(r => r.id === (flow?.to || ''));
                    
                    const multiplier = role ? (role.multiplier || 1) : 1;
                    const fmv = role ? (role.fmv || 50) : 50;
                    
                    // Cálculo V10 exacto: Solo usamos Horas x FMV x Multiplicador del Rol
                    const slices = wo.realHours * fmv * multiplier;
                    
                    if (!p.ledger) p.ledger = [];
                    p.ledger.push({
                        id: 'blk_' + Date.now(), hash: wo.hash, userId: wo.assigneeId,
                        roleId: role?.id || 'unknown', horas: wo.realHours, valorCongelado: slices, timestamp: Date.now(),
                        description: flow?.template || 'Work Order'
                    });
                }
            }
            break;
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
            break;
        }
        case 'UPDATE_TRANSACTION': {
            const pTxUp = newState.projects.find(p => p.id === action.payload.projectId);
            if (pTxUp && pTxUp.transactions) {
                const txIdx = pTxUp.transactions.findIndex(t => t.hash === action.payload.txHash);
                if (txIdx > -1) pTxUp.transactions[txIdx] = { ...pTxUp.transactions[txIdx], ...action.payload.updates };
            }
            break;
        }
        case 'DELETE_TRANSACTION': {
            const pTxDel = newState.projects.find(p => p.id === action.payload.projectId);
            if (pTxDel && pTxDel.transactions) pTxDel.transactions = pTxDel.transactions.filter(t => t.hash !== action.payload.txHash);
            break;
        }
        case 'REQUEST_TRANSACTION': {
            const pReqTx = newState.projects.find(p => p.id === action.payload.projectId);
            if (pReqTx && pReqTx.transactions) {
                const txReq = pReqTx.transactions.find(tx => tx.hash === action.payload.txHash);
                if (txReq && txReq.status === 'theoretical') {
                    txReq.status = 'requested'; txReq.assigneeId = action.payload.userId; txReq.requestTimestamp = Date.now();
                }
            }
            break;
        }
        case 'PING_TRANSACTION': {
            const pPing = newState.projects.find(p => p.id === action.payload.projectId);
            if (pPing && pPing.transactions) {
                const txPing = pPing.transactions.find(tx => tx.hash === action.payload.txHash);
                if (txPing && (txPing.status === 'theoretical' || txPing.status === 'requested')) {
                    txPing.status = 'pinged'; txPing.assigneeId = action.payload.userId; txPing.pingTimestamp = Date.now();
                }
            }
            break;
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
            break;
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

                    const tStore = new Store();
                    const archFactor = tStore.getArchetypeFactor(pAppr.archetype);

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
            break;
        }

        // V7.4: INYECCIONES DE CAPITAL (SLICING PIE)
        case 'ADD_CAPITAL_INJECTION': {
            const pCap = newState.projects.find(p => p.id === action.payload.projectId);
            if (pCap) {
                let multiplier = 2.0; 
                if (action.payload.assetType === 'cash') multiplier = 4.0;
                
                const tStore = new Store();
                const archFactor = tStore.getArchetypeFactor(pCap.archetype);
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
            break;
        }
    }
    
    return newState; // Único punto de salida, 100% seguro.
} 

// 3. CLASE STORE: Controlador de Métodos
class Store {
    constructor() {
        const saved = localStorage.getItem('tt_sos_state');
        this.state = saved ? JSON.parse(saved) : initialState;
        this.listeners = [];
        this.initializeSoberanity();
    }

    initializeSoberanity() {
        if (!this.state.globalUsers.find(u => u.id === 'usr_alvaro_001')) this.state.globalUsers.unshift(initialState.globalUsers[0]);
        if (this.state.projects) {
            this.state.projects = this.state.projects.map(p => ({
                ...p, vna_flows: p.vna_flows || [], work_orders: p.work_orders || [], ledger: p.ledger || []
            }));
        }
    }

    getState() { return this.state; }
    
    saveState() {
        localStorage.setItem('tt_sos_state', JSON.stringify(this.state));
        this.listeners.forEach(l => l());
    }

    async dispatch(action) {
        const nextState = await asyncReducer(this.state, action);
        if (nextState) {
            this.state = nextState;
            this.saveState();
        } else {
            console.error("CRITICAL: Reducer returned undefined for action", action.type);
        }
    }
    
    subscribe(listener) { this.listeners.push(listener); }

    getArchetypeFactor(archetype) { return { 'startup': 2.0, 'corporate': 1.0, 'corp': 1.0, 'dao': 1.5 }[archetype] || 1.0; }

    calculateMaturityIndex(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return { score: 0 };
        const hasStructure = (p.vna_flows && p.vna_flows.length > 0) ? 50 : 0;
        const hasActivity = (p.work_orders && p.work_orders.length > 0) ? 50 : 0;
        return { score: hasStructure + hasActivity };
    }

    calculateResilience(projectId) { return 100; }
} 

export const store = new Store();
