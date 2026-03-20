// v8/js/core/store.js
// Motor de Estado Global Inmutable (Redux Pattern) - V15.9 Usenet & Telemetry

const initialState = {
    config: {
        version: '15.9.0-Fractal',
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
            
            // 🔥 MIGRACIÓN Y BLINDAJE
            if (!this.state.config) this.state.config = { theme: 'dark' };
            this.state.config.version = initialState.config.version; 
            
            if (!this.state.globalUsers) this.state.globalUsers = initialState.globalUsers;
            if (!this.state.projects) this.state.projects = [];
            
            this.state.projects.forEach(p => {
                if (!p.telemetry) p.telemetry = [];
                if (!p.logs) p.logs = [];
                if (!p.vna_flows) p.vna_flows = [];
                if (!p.work_orders) p.work_orders = [];
                if (!p.ledger) p.ledger = [];
                if (!p.roles) p.roles = [];
                if (!p.sprints) p.sprints = [{ id: 'sp_default', name: 'Sprint 1', startDate: Date.now() }];
                if (!p.activeSprintId) p.activeSprintId = 'sp_default';
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
        // Ejecución Inmutable Pura
        this.state = this._reducer(JSON.parse(JSON.stringify(this.state)), action);
        localStorage.setItem('tt_v9_kernel_state', JSON.stringify(this.state));
        this.listeners.forEach(listener => listener(this.state));
        return this.state;
    }

    _reducer(state, action) {
        let newState = { ...state };
        let projIdx, proj, woIdx;

        const findProject = (id) => newState.projects.findIndex(p => p.id === id);

        switch (action.type) {
            case 'REGISTER_USER':
            case 'ADD_USER':
                if (!newState.globalUsers.find(u => u.id === action.payload.id)) {
                    const newUser = { ...action.payload };
                    if (!newUser.profile) newUser.profile = {};
                    if (!newUser.profile.sbt_skills) newUser.profile.sbt_skills = [];
                    newState.globalUsers.push(newUser);
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
            
            case 'CREATE_PROJECT':
                newState.projects.push({ ...action.payload, activeSprintId: 'sp_default', sprints: [{ id: 'sp_default', name: 'Sprint 1', startDate: Date.now() }], logs: [], telemetry: [] });
                break;
            case 'UPDATE_PROJECT_INFO':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) Object.assign(newState.projects[projIdx], action.payload.updates);
                break;

            // 🔥 FIX: CREACIÓN DE SPRINTS (AMNESIA PURGADA)
            case 'CREATE_SPRINT':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    const newSprintId = 'sp_' + Date.now();
                    newState.projects[projIdx].sprints.push({ id: newSprintId, name: action.payload.name, startDate: Date.now() });
                    newState.projects[projIdx].activeSprintId = newSprintId;
                }
                break;
            case 'SET_ACTIVE_SPRINT':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) newState.projects[projIdx].activeSprintId = action.payload.sprintId;
                break;

            case 'ADD_ROLE':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if(!newState.projects[projIdx].roles) newState.projects[projIdx].roles = [];
                    newState.projects[projIdx].roles.push(action.payload.role);
                }
                break;
            case 'UPDATE_ROLE':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    const rIdx = newState.projects[projIdx].roles.findIndex(r => r.id === action.payload.roleId);
                    if (rIdx > -1) Object.assign(newState.projects[projIdx].roles[rIdx], action.payload.updates);
                }
                break;
            case 'TOGGLE_ROLE_ARCHIVE':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    const rIdx = newState.projects[projIdx].roles.findIndex(r => r.id === action.payload.roleId);
                    if (rIdx > -1) newState.projects[projIdx].roles[rIdx].isArchived = !newState.projects[projIdx].roles[rIdx].isArchived;
                }
                break;

            case 'ADD_FLOW':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) newState.projects[projIdx].vna_flows.push(action.payload.flow);
                break;
            case 'UPDATE_FLOW':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    const fIdx = newState.projects[projIdx].vna_flows.findIndex(f => f.id === action.payload.flowId);
                    if(fIdx > -1) Object.assign(newState.projects[projIdx].vna_flows[fIdx], action.payload.updates);
                }
                break;
            case 'DELETE_FLOW':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    newState.projects[projIdx].vna_flows = newState.projects[projIdx].vna_flows.filter(f => f.id !== action.payload.flowId);
                }
                break;

            case 'SPAWN_WORK_ORDER':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) newState.projects[projIdx].work_orders.push(action.payload.workOrder);
                break;
            
            // 🔥 FIX: HOMOGENEIZACIÓN DE ESTADOS PULL/PUSH
            case 'PING_WORK_ORDER':
            case 'UPDATE_WO_STATUS':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    woIdx = newState.projects[projIdx].work_orders.findIndex(w => w.hash === (action.payload.woHash || action.payload.hash));
                    if (woIdx > -1) {
                        newState.projects[projIdx].work_orders[woIdx].status = action.payload.status || 'pinged';
                        if(action.payload.assigneeId !== undefined) newState.projects[projIdx].work_orders[woIdx].assigneeId = action.payload.assigneeId;
                        if(action.payload.userId !== undefined) newState.projects[projIdx].work_orders[woIdx].assigneeId = action.payload.userId;
                        if(action.payload.sprintId !== undefined) newState.projects[projIdx].work_orders[woIdx].sprintId = action.payload.sprintId;
                    }
                }
                break;

            case 'REPORT_WORK_ORDER':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    woIdx = newState.projects[projIdx].work_orders.findIndex(w => w.hash === action.payload.woHash);
                    if (woIdx > -1) {
                        newState.projects[projIdx].work_orders[woIdx].status = 'reported';
                        newState.projects[projIdx].work_orders[woIdx].realHours = action.payload.realHours;
                        newState.projects[projIdx].work_orders[woIdx].comentario = action.payload.comentario;
                        if (action.payload.proofLink) newState.projects[projIdx].work_orders[woIdx].proofLink = action.payload.proofLink;
                    }
                }
                break;
            
            case 'REVIEW_WORK_ORDER':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    woIdx = newState.projects[projIdx].work_orders.findIndex(w => w.hash === action.payload.woHash);
                    if (woIdx > -1) {
                        newState.projects[projIdx].work_orders[woIdx].status = 'in_review';
                        newState.projects[projIdx].work_orders[woIdx].auditorId = action.payload.auditorId;
                        if (newState.projects[projIdx].work_orders[woIdx].soc_checklist) {
                            newState.projects[projIdx].work_orders[woIdx].soc_checklist.forEach(soc => {
                                if (action.payload.socValidation[soc.id] !== undefined) {
                                    soc.isChecked = action.payload.socValidation[soc.id];
                                }
                            });
                        }
                    }
                }
                break;

            case 'APPROVE_WORK_ORDER':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    woIdx = newState.projects[projIdx].work_orders.findIndex(w => w.hash === action.payload.woHash);
                    const wo = newState.projects[projIdx].work_orders[woIdx];
                    
                    if (wo) {
                        let hasFailedSocs = false;
                        if (wo.soc_checklist && wo.soc_checklist.length > 0) {
                            if (wo.soc_checklist.filter(s => !s.isChecked).length > 0) hasFailedSocs = true;
                        }

                        if (hasFailedSocs) {
                            wo.status = 'reported'; // Rechazado
                        } else {
                            wo.status = 'consolidated'; // Aprobado
                            const flow = newState.projects[projIdx].vna_flows.find(f => f.id === wo.flowId);
                            if (flow) {
                                const role = newState.projects[projIdx].roles.find(r => r.id === flow.to);
                                if (role) {
                                    let finalSlices = wo.realHours * role.fmv * role.multiplier;
                                    newState.projects[projIdx].ledger.push({
                                        id: 'tx_' + Date.now(), type: 'SOP_EXECUTION',
                                        userId: wo.assigneeId || wo.workerId, roleId: role.id,
                                        horas: wo.realHours, fmv: role.fmv, multiplier: role.multiplier,
                                        valorCongelado: finalSlices, date: Date.now()
                                    });
                                }
                            }
                            
                            // XP en Perfil Global
                            const userIdx = newState.globalUsers.findIndex(u => u.id === (wo.assigneeId || wo.workerId));
                            if (userIdx > -1 && newState.globalUsers[userIdx].profile) {
                                if (!newState.globalUsers[userIdx].profile.sbt_skills) newState.globalUsers[userIdx].profile.sbt_skills = [];
                                newState.globalUsers[userIdx].profile.sbt_skills.push({ flowId: wo.flowId, exp: wo.realHours, date: Date.now() });
                            }
                        }
                    }
                }
                break;

            // Soporte Legacy (Eliminar en V16)
            case 'UPDATE_TRANSACTION_STATUS':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    const txIdx = newState.projects[projIdx].transactions?.findIndex(t => (t.hash || t.id) === action.payload.txHash);
                    if (txIdx > -1) {
                        Object.assign(newState.projects[projIdx].transactions[txIdx], {
                            status: action.payload.status,
                            assigneeId: action.payload.assigneeId !== undefined ? action.payload.assigneeId : newState.projects[projIdx].transactions[txIdx].assigneeId,
                            sprintId: action.payload.sprintId !== undefined ? action.payload.sprintId : newState.projects[projIdx].transactions[txIdx].sprintId
                        });
                    }
                }
                break;
            case 'DELETE_TRANSACTION':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1 && newState.projects[projIdx].transactions) {
                    newState.projects[projIdx].transactions = newState.projects[projIdx].transactions.filter(t => (t.hash || t.id) !== action.payload.txHash);
                }
                break;

            // Subsistemas
            case 'ADD_CAPITAL_INJECTION':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    newState.projects[projIdx].ledger.push({
                        id: 'tx_cap_' + Date.now(), type: 'CAPITAL',
                        userId: action.payload.userId, roleId: 'CAPITAL_ASSET',
                        assetType: action.payload.assetType, amount: action.payload.amount, 
                        multiplier: 4.0, valorCongelado: action.payload.amount * 4.0, 
                        description: action.payload.description, date: Date.now()
                    });
                }
                break;
            case 'LOG_TELEMETRY':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    newState.projects[projIdx].telemetry.push({
                        id: 'tel_' + Date.now(), date: Date.now(),
                        agentId: action.payload.agentId, engine: action.payload.engine,
                        actionType: action.payload.actionType, tokens: action.payload.tokens,
                        costInDollars: action.payload.costInDollars, recRatio: action.payload.recRatio, latencyMs: action.payload.latencyMs
                    });
                }
                break;
            case 'ADD_LOG_ENTRY':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) newState.projects[projIdx].logs.push(action.payload.log);
                break;
            case 'MARK_LOG_READ':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    const logIdx = newState.projects[projIdx].logs.findIndex(l => l.id === action.payload.logId);
                    if (logIdx > -1) {
                        if (!newState.projects[projIdx].logs[logIdx].readBy) newState.projects[projIdx].logs[logIdx].readBy = [];
                        if (!newState.projects[projIdx].logs[logIdx].readBy.includes(action.payload.userId)) {
                            newState.projects[projIdx].logs[logIdx].readBy.push(action.payload.userId);
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
