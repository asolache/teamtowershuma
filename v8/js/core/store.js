// v8/js/core/store.js
// ==========================================================================
// KERNEL V8 - AGENTIC AI STORE (Fusión Definitiva)
// Motor de Estado Local-First, Triple Entrada, Gobernanza P2P y Slicing Pie
// ==========================================================================

const initialState = {
    config: {
        version: '8.0.2',
        ecosystemName: 'TeamTowers Agentic Network',
        globalPrompt: 'Eres un Nodo Orquestador de una Colla Híbrida (Humanos + IA).',
        archetype: 'startup',
        projectCreationMode: 'open'
    },
    globalUsers: [
        {
            id: 'usr_alvaro_001',
            name: 'Alvaro',
            globalRole: 'ecosystem-owner',
            wallet: '0xMasterArchitect...',
            profile: {
                vision: "Master Architect V8. Guiando a la IA, no programando para ella.",
                structural_affinity: ["@anxaneta"],
                guardian_authority: ["creator", "magician"],
                isOpenToWork: true
            }
        }
    ],
    agents: [
        { id: '@PM_Sprint', role: '@aixecador', fmv: 100, active: true },
        { id: '@Dev_Store', role: '@dosos', fmv: 80, active: true },
        { id: '@UX_Weaver', role: '@baixos', fmv: 60, active: true }
    ],
    projects: [],
    session: { activeUserId: 'usr_alvaro_001', role: 'ecosystem-owner' }
};

async function asyncReducer(state, action) {
    let newState = JSON.parse(JSON.stringify(state)); 

    switch (action.type) {
        case 'LOGOUT_USER':
            newState.session = { activeUserId: null, role: 'guest' };
            break;

        case 'UPDATE_GLOBAL_CONFIG': 
            newState.config = { ...newState.config, ...action.payload };
            break;
            
        case 'ADD_USER': {
            const exists = newState.globalUsers.find(u => u.id === action.payload.id);
            if (!exists) newState.globalUsers.push({ ...action.payload, globalRole: 'network-user' });
            break;
        }

        case 'UPDATE_USER_PROFILE': {
            const uIdx = newState.globalUsers.findIndex(u => u.id === action.payload.userId);
            if (uIdx > -1) {
                newState.globalUsers[uIdx].profile = { ...newState.globalUsers[uIdx].profile, ...action.payload.profile, lastUpdated: Date.now() };
            }
            break;
        }

        case 'INIT_PROJECT_GENESIS':
        case 'CREATE_PROJECT': {
            if (!newState.projects.find(p => p.id === action.payload.id)) {
                newState.projects.push({ 
                    ...action.payload, 
                    createdAt: Date.now(),
                    roles: action.payload.roles || [],
                    usuarios: action.payload.usuarios || [{ id: newState.session.activeUserId, permissions: { canCreateWO: true, canApprove: true } }],
                    vna_flows: action.payload.vna_flows || [],
                    work_orders: action.payload.work_orders || [],
                    ledger: action.payload.ledger || [],
                    asignaciones: action.payload.asignaciones || []
                });
            }
            break;
        }

        case 'UPDATE_PROJECT_INFO': {
            const pInfo = newState.projects.find(p => p.id === action.payload.projectId);
            if (pInfo) {
                if (action.payload.updates.usuarios) {
                    action.payload.updates.usuarios.forEach(newU => {
                        const idx = pInfo.usuarios.findIndex(u => u.id === newU.id);
                        if (idx > -1) pInfo.usuarios[idx] = { ...pInfo.usuarios[idx], ...newU };
                        else pInfo.usuarios.push(newU);
                    });
                    delete action.payload.updates.usuarios;
                }
                Object.assign(pInfo, action.payload.updates);
            }
            break;
        }

        // ==========================================
        // TOPOLOGÍA VNA Y ROLES (ValueMapView)
        // ==========================================
        case 'ADD_ROLE': {
            const pAddRol = newState.projects.find(p => p.id === action.payload.projectId);
            if (pAddRol) pAddRol.roles.push(action.payload.role);
            break;
        }
        case 'UPDATE_ROLE': {
            const pUpdRol = newState.projects.find(p => p.id === action.payload.projectId);
            if (pUpdRol) {
                const rIdx = pUpdRol.roles.findIndex(r => r.id === action.payload.roleId);
                if (rIdx > -1) Object.assign(pUpdRol.roles[rIdx], action.payload.updates);
            }
            break;
        }
        case 'TOGGLE_ROLE_ARCHIVE': {
            const pTog = newState.projects.find(p => p.id === action.payload.projectId);
            if (pTog) {
                const rIdx = pTog.roles.findIndex(r => r.id === action.payload.roleId);
                if (rIdx > -1) pTog.roles[rIdx].isArchived = !pTog.roles[rIdx].isArchived;
            }
            break;
        }
        case 'ADD_FLOW': {
            const pFlowAdd = newState.projects.find(p => p.id === action.payload.projectId);
            if (pFlowAdd) {
                if (!pFlowAdd.vna_flows) pFlowAdd.vna_flows = [];
                pFlowAdd.vna_flows.push({ ...action.payload.flow, id: action.payload.flow.id || ('flow_' + Date.now()) });
            }
            break;
        }
        case 'UPDATE_FLOW': {
            const pFlowUpd = newState.projects.find(p => p.id === action.payload.projectId);
            if (pFlowUpd && pFlowUpd.vna_flows) {
                const fIdx = pFlowUpd.vna_flows.findIndex(f => f.id === action.payload.flowId);
                if (fIdx > -1) Object.assign(pFlowUpd.vna_flows[fIdx], action.payload.updates);
            }
            break;
        }
        case 'DELETE_FLOW': {
            const pFlowDel = newState.projects.find(p => p.id === action.payload.projectId);
            if (pFlowDel && pFlowDel.vna_flows) {
                pFlowDel.vna_flows = pFlowDel.vna_flows.filter(f => f.id !== action.payload.flowId);
            }
            break;
        }
        
        // ==========================================
        // KANBAN CORE (WORK ORDERS)
        // ==========================================
        case 'SPAWN_WORK_ORDER': {
            const pWoAdd = newState.projects.find(p => p.id === action.payload.projectId);
            if (pWoAdd) {
                if (!pWoAdd.work_orders) pWoAdd.work_orders = [];
                pWoAdd.work_orders.push({ ...action.payload.workOrder, timestamp: Date.now() });
            }
            break;
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
            break;
        }
        case 'REPORT_WORK_ORDER': {
            const pWoRep = newState.projects.find(p => p.id === action.payload.projectId);
            if (pWoRep && pWoRep.work_orders) {
                const wo = pWoRep.work_orders.find(t => t.hash === action.payload.woHash);
                if (wo) {
                    wo.status = 'reported'; wo.realHours = action.payload.realHours;
                    wo.proofLink = action.payload.proofLink; wo.comentario = action.payload.comentario;
                }
            }
            break;
        }
        case 'APPROVE_WORK_ORDER': {
            const pWoApp = newState.projects.find(p => p.id === action.payload.projectId);
            if (pWoApp && pWoApp.work_orders) {
                const wo = pWoApp.work_orders.find(t => t.hash === action.payload.woHash);
                if (wo) {
                    wo.status = 'consolidated';
                    if (!pWoApp.ledger) pWoApp.ledger = [];
                    
                    let flow = (pWoApp.vna_flows || []).find(f => f.id === wo.flowId);
                    let multiplier = 1; let fmv = 50; let roleId = 'Unknown';
                    let deliverableName = 'Work Order Instanciada';

                    if (flow) {
                        roleId = flow.to; deliverableName = flow.template || flow.entregable || 'Entregable';
                        const role = pWoApp.roles.find(r => r.id === roleId);
                        if (role) { multiplier = role.multiplier || 1; fmv = role.fmv || 50; }
                    }

                    const slices = (wo.realHours || 1) * fmv * multiplier;
                    wo.valorCongelado = slices;

                    pWoApp.ledger.push({
                        id: 'blk_' + Date.now(), hash: wo.hash, userId: wo.assigneeId, roleId: roleId,
                        horas: wo.realHours || 1, multiplier: multiplier, fmv: fmv,
                        valorCongelado: slices, timestamp: Date.now(), description: deliverableName
                    });
                }
            }
            break;
        }

        // ==========================================
        // LEDGER & EQUITY (CAPITAL INJECTIONS)
        // ==========================================
        case 'ADD_CAPITAL_INJECTION': {
            const pCap = newState.projects.find(p => p.id === action.payload.projectId);
            if (pCap) {
                let multiplier = 2.0; 
                if (action.payload.assetType === 'cash') multiplier = 4.0;
                
                const archFactors = { 'startup': 2.0, 'corporate': 1.0, 'corp': 1.0, 'dao': 1.5 };
                const archFactor = archFactors[pCap.archetype] || 1.0;
                const valorGenerado = action.payload.amount * multiplier * archFactor;

                if (!pCap.ledger) pCap.ledger = [];
                
                pCap.ledger.push({
                    id: 'ledg_' + Math.random().toString(36).substr(2, 9),
                    hash: '0xCAP_' + Date.now(),
                    userId: action.payload.userId, 
                    roleId: 'CAPITAL_ASSET',
                    description: `[Capital: ${action.payload.assetType.toUpperCase()}] ${action.payload.description}`,
                    horas: 0, 
                    valorCongelado: valorGenerado, 
                    timestamp: Date.now()
                });
            }
            break;
        }
    }
    return newState;
}

class Store {
    constructor() {
        this.storageKey = 'tt_sos_v8_state';
        this.listeners = [];
        this.loadState();
    }

    loadState() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                if (!this.state.agents) this.state.agents = initialState.agents;
                
                if (this.state.projects) {
                    this.state.projects = this.state.projects.map(p => ({
                        ...p,
                        roles: p.roles || [],
                        ledger: p.ledger || [],
                        work_orders: p.work_orders || [],
                        vna_flows: p.vna_flows || [],
                        usuarios: p.usuarios || []
                    }));
                }
            } catch (e) {
                console.error("Store V8: Error local. Reiniciando Génesis.", e);
                this.state = initialState;
            }
        } else {
            this.state = initialState;
        }
    }

    getState() { return this.state; }

    saveState() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        this.notifyListeners();
    }

    async dispatch(action) {
        console.log(`[Store V8 Mutating] ${action.type}`);
        this.state = await asyncReducer(this.state, action);
        this.saveState();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    }
    
    notifyListeners() { this.listeners.forEach(listener => listener()); }

    // =========================================================
    // MÉTODOS DE GOBERNANZA Y SEGURIDAD (RBAC)
    // =========================================================
    
    canUserViewProject(projectId, userId, globalRole) {
        if (globalRole === 'ecosystem-owner') return true; 
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return false;
        if (p.ownerId === userId) return true;
        if (p.usuarios && p.usuarios.find(u => u.id === userId)) return true;
        if (p.isPrivate) return false; 
        return true;
    }

    canUserCreateWorkOrder(projectId, userId) {
        const globalUser = this.state.globalUsers.find(u => u.id === userId);
        if (globalUser && globalUser.globalRole === 'ecosystem-owner') return true;
        
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return false;
        
        if (p.ownerId === userId) return true; // El PO siempre puede
        
        const gov = p.governance || { workOrderCreation: 'open' };
        if (gov.workOrderCreation === 'open') return true;
        if (gov.workOrderCreation === 'po_only') return false;
        
        if (gov.workOrderCreation === 'custom') {
            const member = p.usuarios?.find(x => x.id === userId);
            return member?.permissions?.canCreateWO === true;
        }
        
        return false;
    }

    // =========================================================
    // MÉTODOS DE ANÁLISIS VNA Y ECONOMÍA
    // =========================================================

    calculateResilience(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return 100;
        
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
            return { 
                userId: entry.userId, 
                roleId: entry.roleId, 
                totalValue: entry.totalValue, 
                slices: entry.totalValue, 
                percentage: (percentage * 100).toFixed(2), 
                financialValue: (percentage * totalValuation) 
            };
        }).sort((a, b) => b.totalValue - a.totalValue);
    }
}

export const store = new Store();
