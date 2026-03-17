// v8/js/core/store.js
// Motor de Estado Global Inmutable (Redux Pattern) - V13 Usenet & Telemetry

const initialState = {
    config: {
        version: '13.0.0-Fractal',
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
        { id: '@mestre_escola', name: 'Mestre d\'Escola', email: 'mestre@teamtowers.ai', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'sage' } },
        { id: '@alvaro', name: 'Alvaro (Master Architect)', email: 'alvaro@teamtowers.ai', globalRole: 'ecosystem-owner', profile: { sbt_skills: [] } }
    ],
    projects: []
};

class Store {
    constructor() {
        const savedState = localStorage.getItem('tt_v9_kernel_state');
        
        if (savedState) {
            this.state = JSON.parse(savedState);
            
            // 🔥 MIGRACIÓN Y BLINDAJE (Previene Kernel Panics por datos legacy)
            if (!this.state.config) this.state.config = { theme: 'dark' };
            this.state.config.version = initialState.config.version; // Forzar versión actual
            
            if (!this.state.globalUsers) this.state.globalUsers = initialState.globalUsers;
            if (!this.state.projects) this.state.projects = [];
            
            // Hidratar proyectos antiguos con las nuevas tuberías de la V13
            this.state.projects.forEach(p => {
                if (!p.telemetry) p.telemetry = [];
                if (!p.logs) p.logs = [];
                if (!p.vna_flows) p.vna_flows = [];
                if (!p.work_orders) p.work_orders = [];
                if (!p.ledger) p.ledger = [];
                if (!p.roles) p.roles = [];
            });
            
        } else {
            this.state = JSON.parse(JSON.stringify(initialState));
        }
        
        this.listeners = [];
    }

    getState() { return this.state; }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    }

    async dispatch(action) {
        this.state = this._reducer(this.state, action);
        localStorage.setItem('tt_v9_kernel_state', JSON.stringify(this.state));
        this.listeners.forEach(listener => listener(this.state));
        return this.state;
    }

    _reducer(state, action) {
        let newState = { ...state };
        let proj, wo;

        switch (action.type) {
            case 'REGISTER_USER':
                if (!newState.globalUsers.find(u => u.id === action.payload.id)) {
                    newState.globalUsers.push(action.payload);
                }
                break;
            case 'LOGIN_USER':
                newState.session.activeUserId = action.payload.userId;
                const existingUser = newState.globalUsers.find(u => u.id === action.payload.userId);
                if (!existingUser) {
                    newState.globalUsers.push({ id: action.payload.userId, name: 'Anónimo', globalRole: 'network-user', profile: { sbt_skills: [] } });
                }
                newState.session.role = existingUser ? existingUser.globalRole : 'network-user';
                break;
            case 'LOGOUT_USER':
                newState.session.activeUserId = null;
                newState.session.role = 'guest';
                break;
            case 'ADD_USER':
                if (!newState.globalUsers.find(u => u.id === action.payload.id)) {
                    newState.globalUsers.push({ ...action.payload, profile: { sbt_skills: [] } });
                }
                break;
            case 'CREATE_PROJECT':
                newState.projects.push({ ...action.payload, activeSprintId: 'sprint_1', logs: [], telemetry: [] });
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
                    const flow = proj.vna_flows.find(f => f.id === wo.flowId);
                    const role = proj.roles.find(r => r.id === flow.to);
                    let finalSlices = 0;
                    
                    if (flow && role) {
                        let baseSlices = wo.realHours * role.fmv * role.multiplier;
                        let mermaPercent = 0;
                        if (wo.soc_checklist && wo.soc_checklist.length > 0) {
                            const failedSocs = wo.soc_checklist.filter(s => !s.isChecked).length;
                            mermaPercent = (failedSocs / wo.soc_checklist.length) * 0.5; 
                        }
                        finalSlices = baseSlices * (1 - mermaPercent);
                        
                        proj.ledger.push({
                            id: 'tx_' + Date.now(), type: 'SOP_EXECUTION',
                            userId: wo.workerId, roleId: role.id,
                            horas: wo.realHours, fmv: role.fmv, multiplier: role.multiplier,
                            valorCongelado: finalSlices, date: Date.now()
                        });
                    }

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
            case 'LOG_TELEMETRY':
                proj = newState.projects.find(p => p.id === action.payload.projectId);
                if (proj) {
                    proj.telemetry.push({
                        id: 'tel_' + Date.now(),
                        date: Date.now(),
                        agentId: action.payload.agentId,
                        engine: action.payload.engine,
                        actionType: action.payload.actionType,
                        tokens: action.payload.tokens,
                        costInDollars: action.payload.costInDollars,
                        recRatio: action.payload.recRatio,
                        latencyMs: action.payload.latencyMs
                    });
                }
                break;
            case 'ADD_LOG_ENTRY':
                proj = newState.projects.find(p => p.id === action.payload.projectId);
                if (proj) {
                    proj.logs.push(action.payload.log);
                }
                break;
            case 'MARK_LOG_READ':
                proj = newState.projects.find(p => p.id === action.payload.projectId);
                if (proj && proj.logs) {
                    const log = proj.logs.find(l => l.id === action.payload.logId);
                    if (log) {
                        if (!log.readBy) log.readBy = [];
                        if (!log.readBy.includes(action.payload.userId)) {
                            log.readBy.push(action.payload.userId);
                        }
                    }
                }
                break;
        }
        return newState;
    }

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
