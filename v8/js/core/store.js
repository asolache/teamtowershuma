// v8/js/core/store.js
// Motor de Estado Global Inmutable (Redux Pattern) - V11 Kernel

const initialState = {
    config: {
        version: '9.11.0-A2A',
        theme: 'dark'
    },
    session: {
        activeUserId: null,
        role: 'guest'
    },
    globalUsers: [
        { id: '@genesi_ai', name: 'Gènesi AI', email: 'genesi@teamtowers.ai', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'creator' } },
        { id: '@cap_de_colla', name: 'Cap de Colla', email: 'cap@teamtowers.ai', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'ruler' } },
        { id: '@notari_ledger', name: 'Notari Ledger', email: 'notari@teamtowers.ai', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'sage' } },
        { id: '@seny_analyst', name: 'Seny Analyst', email: 'seny@teamtowers.ai', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'magician' } },
        { id: '@dharma_coach', name: 'Dharma Coach', email: 'dharma@teamtowers.ai', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'caregiver' } },
        { id: '@forca_worker', name: 'Força Worker', email: 'forca@teamtowers.ai', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'hero' } },
        // 🧠 El Guardián del Árbol de Habilidades (Instanciado)
        { id: '@mestre_escola', name: 'Mestre d\'Escola', email: 'mestre@teamtowers.ai', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'sage' } }
    ],
    projects: []
};

class Store {
    constructor() {
        this.state = JSON.parse(JSON.stringify(initialState));
        this.listeners = [];
    }

    getState() {
        return this.state;
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    }

    async dispatch(action) {
        this.state = this._reducer(this.state, action);
        this.listeners.forEach(listener => listener(this.state));
        return this.state;
    }

    _reducer(state, action) {
        let newState = { ...state };
        let proj, wo;

        switch (action.type) {
            case 'LOGIN_USER':
                newState.session.activeUserId = action.payload.userId;
                // Shadow Profile si no existe (Lazy Registration)
                if (!newState.globalUsers.find(u => u.id === action.payload.userId)) {
                    newState.globalUsers.push({ id: action.payload.userId, name: 'Anónimo', globalRole: 'network-user', profile: { sbt_skills: [] } });
                }
                break;
            case 'LOGOUT_USER':
                newState.session.activeUserId = null;
                break;
            case 'ADD_USER':
                if (!newState.globalUsers.find(u => u.id === action.payload.id)) {
                    newState.globalUsers.push({ ...action.payload, profile: { sbt_skills: [] } });
                }
                break;
            case 'CREATE_PROJECT':
                newState.projects.push({ ...action.payload, activeSprintId: 'sprint_1', logs: [] });
                break;
            case 'UPDATE_PROJECT_INFO':
                proj = newState.projects.find(p => p.id === action.payload.projectId);
                if (proj) Object.assign(proj, action.payload.updates);
                break;
            case 'ADD_FLOW':
                proj = newState.projects.find(p => p.id === action.payload.projectId);
                if (proj) proj.vna_flows.push(action.payload.flow);
                break;
            case 'SPAWN_WORK_ORDER':
                proj = newState.projects.find(p => p.id === action.payload.projectId);
                if (proj) proj.work_orders.push(action.payload.workOrder);
                break;
            case 'PING_WORK_ORDER':
                proj = newState.projects.find(p => p.id === action.payload.projectId);
                wo = proj?.work_orders.find(w => w.hash === action.payload.woHash);
                if (wo) { wo.status = 'in_progress'; wo.workerId = action.payload.userId; }
                break;
            case 'REPORT_WORK_ORDER':
                proj = newState.projects.find(p => p.id === action.payload.projectId);
                wo = proj?.work_orders.find(w => w.hash === action.payload.woHash);
                if (wo) { wo.status = 'reported'; wo.realHours = action.payload.realHours; wo.reportComment = action.payload.comentario; }
                break;
            case 'REVIEW_WORK_ORDER':
                proj = newState.projects.find(p => p.id === action.payload.projectId);
                wo = proj?.work_orders.find(w => w.hash === action.payload.woHash);
                if (wo) {
                    wo.status = 'in_review';
                    wo.auditorId = action.payload.auditorId;
                    if (wo.soc_checklist) {
                        wo.soc_checklist.forEach(soc => {
                            if (action.payload.socValidation[soc.id] !== undefined) {
                                soc.isChecked = action.payload.socValidation[soc.id];
                            }
                        });
                    }
                }
                break;
            case 'APPROVE_WORK_ORDER':
                proj = newState.projects.find(p => p.id === action.payload.projectId);
                wo = proj?.work_orders.find(w => w.hash === action.payload.woHash);
                if (proj && wo) {
                    wo.status = 'consolidated';
                    
                    // 1. Cálculo de Slicing Pie (con Merma preparatoria)
                    const flow = proj.vna_flows.find(f => f.id === wo.flowId);
                    const role = proj.roles.find(r => r.id === flow.to);
                    let finalSlices = 0;
                    
                    if (flow && role) {
                        let baseSlices = wo.realHours * role.fmv * role.multiplier;
                        
                        // Lógica de Merma: -10% por cada SOC fallido (Ejemplo)
                        let mermaPercent = 0;
                        if (wo.soc_checklist && wo.soc_checklist.length > 0) {
                            const failedSocs = wo.soc_checklist.filter(s => !s.isChecked).length;
                            mermaPercent = (failedSocs / wo.soc_checklist.length) * 0.5; // Máximo 50% de merma
                        }
                        finalSlices = baseSlices * (1 - mermaPercent);
                        
                        proj.ledger.push({
                            id: 'tx_' + Date.now(), type: 'SOP_EXECUTION',
                            userId: wo.workerId, roleId: role.id,
                            horas: wo.realHours, fmv: role.fmv, multiplier: role.multiplier,
                            valorCongelado: finalSlices, date: Date.now()
                        });
                    }

                    // 2. Experiencia (XP) SBT para el Árbol de Habilidades (Mestre d'Escola)
                    const user = newState.globalUsers.find(u => u.id === wo.workerId);
                    if (user && user.profile) {
                        if (!user.profile.sbt_skills) user.profile.sbt_skills = [];
                        user.profile.sbt_skills.push({ flowId: wo.flowId, exp: wo.realHours, date: Date.now() });
                    }
                }
                break;
            case 'ADD_CAPITAL_INJECTION':
                proj = newState.projects.find(p => p.id === action.payload.projectId);
                if (proj) {
                    // El multiplicador estándar de capital en Slicing Pie suele ser 4x
                    const capitalMultiplier = 4.0;
                    proj.ledger.push({
                        id: 'tx_cap_' + Date.now(), type: 'CAPITAL',
                        userId: action.payload.userId, roleId: 'CAPITAL_ASSET',
                        assetType: action.payload.assetType, amount: action.payload.amount, 
                        multiplier: capitalMultiplier,
                        valorCongelado: action.payload.amount * capitalMultiplier, 
                        description: action.payload.description, date: Date.now()
                    });
                }
                break;
        }
        return newState;
    }

    // ==========================================
    // MÉTODOS DE CONSULTA Y GOBERNANZA (RBAC)
    // ==========================================
    canUserViewProject(projectId, userId, globalRole) {
        if (globalRole === 'ecosystem-owner') return true;
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return false;
        if (!p.isPrivate) return true;
        if (p.ownerId === userId) return true;
        const isMember = p.usuarios && p.usuarios.find(u => u.id === userId);
        return !!isMember;
    }

    canUserCreateWorkOrder(projectId, userId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return false;
        if (p.ownerId === userId) return true;
        const userNode = p.usuarios && p.usuarios.find(u => u.id === userId);
        if (!userNode || !userNode.permissions) return false;
        
        if (p.governance && p.governance.workOrderCreation === 'custom') {
            return userNode.permissions.canCreateWO === true;
        }
        return p.governance?.workOrderCreation === 'open';
    }

    calculateHarvest(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.ledger) return [];
        
        const totals = {};
        let absoluteTotal = 0;
        
        p.ledger.forEach(tx => {
            if (!totals[tx.userId]) totals[tx.userId] = { userId: tx.userId, totalSlices: 0, percentage: 0 };
            totals[tx.userId].totalSlices += tx.valorCongelado;
            absoluteTotal += tx.valorCongelado;
        });

        const capTable = Object.values(totals).map(t => {
            t.percentage = absoluteTotal > 0 ? ((t.totalSlices / absoluteTotal) * 100).toFixed(2) : 0;
            return t;
        });
        
        return capTable.sort((a, b) => b.totalSlices - a.totalSlices);
    }
}

export const store = new Store();
