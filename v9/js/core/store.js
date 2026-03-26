// v9/js/core/store.js
import { KB } from './kb.js'; 
import { CoreSeed } from './seed.js'; 

const initialState = {
    config: {
        version: 'v9-Antigravity',
        theme: 'dark',
        economics: {
            markup_margin: 0.30, 
            premium_features_fee: 0.05, 
            base_pricing: {
                'deepseek': { input: 0.14, output: 0.28 }, 
                'gemini': { input: 0.075, output: 0.30 },  
                'openai': { input: 2.50, output: 10.00 },  
                'anthropic': { input: 3.00, output: 15.00 }, 
                'custom': { input: 0.0, output: 0.0 }
            }
        }
    },
    session: {
        activeUserId: null,
        role: 'guest'
    },
    // 🔥 EL PADRÓN MAESTRO (CON SKILLS ENLAZADAS)
    globalUsers: [
        { id: '@agent_genesis_architect', name: 'Genesis Architect', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'creator', active_skills: ['skill_vna_architect'] } },
        { id: '@agent_dharma_ontologist', name: 'Dharma Ontologist', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'caregiver', active_skills: ['skill_ikigai_ontologist'] } },
        { id: '@agent_skill_crafter', name: 'Skill Crafter', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'magician', active_skills: ['skill_crafter_master'] } },
        { id: '@agent_prompt_synthesizer', name: 'Prompt Synthesizer', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'ruler', active_skills: ['skill_prompt_synthesizer'] } },
        { id: '@agent_tdd_auditor', name: 'TDD Auditor', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'sage', active_skills: ['skill_slicing_pie_notary', 'skill_legal_drafting'] } },
        { id: '@agent_synaptic_weaver', name: 'Synaptic Weaver', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'explorer', active_skills: ['skill_knowledge_harvest'] } },
        { id: '@agent_token_economist', name: 'Token Economist', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'ruler', active_skills: ['skill_antifragile_compressor', 'skill_vault_monetization'] } },
        { id: '@agent_media_generator', name: 'Media Generator', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'hero', active_skills: [] } },
        { id: '@agent_web_deployer', name: 'Web Deployer', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'magician', active_skills: ['skill_ui_component_forge'] } },
        { id: '@agent_codex_developer', name: 'Codex Developer', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'sage', active_skills: ['skill_vault_monetization'] } },
        { id: '@kaos_tester', name: 'Kaos Tester', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'outlaw', active_skills: ['skill_pentest_chaos'] } },
        { id: '@bard_narrator', name: 'Bard Narrator', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'jester', active_skills: ['skill_community_engagement'] } },
        { id: '@alvaro', name: 'Alvaro (Master Architect)', globalRole: 'ecosystem-owner', profile: { sbt_skills: [] } }
    ],
    projects: []
};

class Store {
    constructor() {
        this.state = JSON.parse(JSON.stringify(initialState));
        this.listeners = [];
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        console.log("🚀 [Kernel] Iniciando secuencia de arranque...");
        try {
            console.log("⏳ [Kernel] Conectando con IndexedDB...");
            
            const kbPromise = KB.init();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Timeout (4s): IndexedDB bloqueada por el navegador.")), 4000)
            );
            
            await Promise.race([kbPromise, timeoutPromise]);
            console.log("📂 [Kernel] IndexedDB conectada exitosamente.");
            
            try {
                if (CoreSeed && CoreSeed.inject) await CoreSeed.inject(KB);
            } catch (seedErr) {
                console.error("⚠️ [Kernel] Fallo inyectando ADN de Skills:", seedErr);
            }
            
            const savedNode = await KB.getNode('global_kernel_state');
            
            if (savedNode && savedNode.content) {
                this.state = savedNode.content;
            } else {
                const legacyState = localStorage.getItem('tt_v9_kernel_state') || localStorage.getItem('tt_sos_v8_state');
                if (legacyState) {
                    this.state = JSON.parse(legacyState);
                }
            }

            this.state.config.version = initialState.config.version; 
            if (!this.state.config.economics) this.state.config.economics = initialState.config.economics;

            if (!this.state.globalUsers) this.state.globalUsers = [];
            
            // 🔥 HARD SYNC NEURONAL: Forzamos la actualización de los Agentes Core
            initialState.globalUsers.forEach(coreAgent => {
                const existingIdx = this.state.globalUsers.findIndex(u => u.id === coreAgent.id);
                if (existingIdx === -1) {
                    // Si no existe, lo creamos
                    this.state.globalUsers.push(JSON.parse(JSON.stringify(coreAgent)));
                } else if (coreAgent.profile?.isAi) {
                    // Si ya existe en la BD y es IA, le APLASTAMOS el cerebro con el actual del código
                    // Esto asegura que los enlaces a las skills nunca se rompan
                    this.state.globalUsers[existingIdx].profile.active_skills = coreAgent.profile.active_skills;
                    this.state.globalUsers[existingIdx].profile.guardian = coreAgent.profile.guardian;
                    this.state.globalUsers[existingIdx].name = coreAgent.name;
                }
            });

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
                
                if (!p.usuarios) p.usuarios = [];
                this.state.globalUsers.filter(u => u.profile?.isAi).forEach(ai => {
                    if (!p.usuarios.find(pu => pu.id === ai.id)) {
                        p.usuarios.push({ id: ai.id, permissions: { canCreateWO: true, canApprove: false } });
                    }
                });
            });

            await this.persistState(); // Guardamos el estado purgado y corregido
            console.log("✅ [Kernel] Secuencia de arranque completada. Sincronización Neuronal Exitosa.");
            this.isInitialized = true;

        } catch (e) {
            console.error("💥 [KERNEL PANIC] Colapso total leyendo el estado:", e);
            this.state = JSON.parse(JSON.stringify(initialState));
            this.isInitialized = true; 
        }
    }

    async persistState() {
        try {
            await KB.saveNode({
                id: 'global_kernel_state',
                type: 'system_state',
                projectId: 'global',
                targetId: 'global',
                title: 'Kernel State V9',
                content: this.state
            });
        } catch (e) {
            console.warn("No se pudo persistir el estado (posible DB bloqueada).");
        }
    }

    getState() { return this.state; }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    }

    async dispatch(action) {
        this.state = this._reducer(JSON.parse(JSON.stringify(this.state)), action);
        await this.persistState();
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
                if (!existingUser) newState.globalUsers.push({ id: action.payload.userId, name: 'Anónimo', globalRole: 'network-user', profile: { sbt_skills: [] } });
                newState.session.role = existingUser ? existingUser.globalRole : 'network-user';
                break;
            case 'LOGOUT_USER':
                newState.session.activeUserId = null; newState.session.role = 'guest'; break;
            case 'CREATE_PROJECT':
                const newProj = { ...action.payload, activeSprintId: 'sp_default', sprints: [{ id: 'sp_default', name: 'Sprint 1', startDate: Date.now() }], logs: [], telemetry: [] };
                if (!newProj.usuarios) newProj.usuarios = [];
                newState.globalUsers.filter(u => u.profile?.isAi).forEach(ai => {
                    if (!newProj.usuarios.find(pu => pu.id === ai.id)) {
                        newProj.usuarios.push({ id: ai.id, permissions: { canCreateWO: true, canApprove: false } });
                    }
                });
                newState.projects.push(newProj);
                break;
            case 'UPDATE_PROJECT_INFO':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if (action.payload.updates.usuarios) {
                        const incomingUsers = action.payload.updates.usuarios;
                        newState.globalUsers.filter(u => u.profile?.isAi).forEach(ai => {
                            if (!incomingUsers.find(iu => iu.id === ai.id)) {
                                incomingUsers.push({ id: ai.id, permissions: { canCreateWO: true, canApprove: false } });
                            }
                        });
                    }
                    Object.assign(newState.projects[projIdx], action.payload.updates);
                }
                break;
            case 'DELETE_PROJECT':
                newState.projects = newState.projects.filter(p => p.id !== action.payload.projectId);
                break;
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
                if (projIdx > -1) newState.projects[projIdx].vna_flows = newState.projects[projIdx].vna_flows.filter(f => f.id !== action.payload.flowId);
                break;
            case 'SPAWN_WORK_ORDER':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) newState.projects[projIdx].work_orders.push(action.payload.workOrder);
                break;

            case 'PING_WORK_ORDER':
            case 'UPDATE_WO_STATUS':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    woIdx = newState.projects[projIdx].work_orders.findIndex(w => w.hash === (action.payload.woHash || action.payload.hash));
                    if (woIdx === -1 && newState.projects[projIdx].transactions) {
                        woIdx = newState.projects[projIdx].transactions.findIndex(t => (t.id || t.hash) === (action.payload.woHash || action.payload.hash));
                        if (woIdx > -1) {
                            newState.projects[projIdx].transactions[woIdx].status = action.payload.status || 'pinged';
                            if(action.payload.assigneeId !== undefined) newState.projects[projIdx].transactions[woIdx].assigneeId = action.payload.assigneeId;
                        }
                    } else if (woIdx > -1) {
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
                    let taskList = newState.projects[projIdx].work_orders;
                    woIdx = taskList.findIndex(w => w.hash === action.payload.woHash);
                    if (woIdx === -1 && newState.projects[projIdx].transactions) {
                        taskList = newState.projects[projIdx].transactions;
                        woIdx = taskList.findIndex(t => (t.id || t.hash) === action.payload.woHash);
                    }
                    if (woIdx > -1) {
                        taskList[woIdx].status = 'reported';
                        taskList[woIdx].realHours = (action.payload.realHours !== undefined && action.payload.realHours !== null) ? action.payload.realHours : 0;
                        taskList[woIdx].comentario = action.payload.comentario;
                        if (action.payload.proofLink) taskList[woIdx].proofLink = action.payload.proofLink;
                        taskList[woIdx].reportedDate = Date.now(); 
                    }
                }
                break;
            
            case 'REVIEW_WORK_ORDER':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    let taskList = newState.projects[projIdx].work_orders;
                    woIdx = taskList.findIndex(w => w.hash === action.payload.woHash);
                    if (woIdx === -1 && newState.projects[projIdx].transactions) {
                        taskList = newState.projects[projIdx].transactions;
                        woIdx = taskList.findIndex(t => (t.id || t.hash) === action.payload.woHash);
                    }
                    if (woIdx > -1) {
                        taskList[woIdx].status = 'in_review';
                        taskList[woIdx].auditorId = action.payload.auditorId;
                        if (taskList[woIdx].soc_checklist) {
                            taskList[woIdx].soc_checklist.forEach(soc => {
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
                    let isLegacy = false;
                    let taskList = newState.projects[projIdx].work_orders;
                    woIdx = taskList.findIndex(w => w.hash === action.payload.woHash);
                    
                    if (woIdx === -1 && newState.projects[projIdx].transactions) {
                        taskList = newState.projects[projIdx].transactions;
                        woIdx = taskList.findIndex(t => (t.id || t.hash) === action.payload.woHash);
                        isLegacy = true;
                    }

                    if (woIdx > -1) {
                        const wo = taskList[woIdx];
                        let hasFailedSocs = false;
                        if (wo.soc_checklist && wo.soc_checklist.length > 0) {
                            if (wo.soc_checklist.filter(s => !s.isChecked).length > 0) hasFailedSocs = true;
                        }

                        if (hasFailedSocs) {
                            wo.status = 'reported'; 
                        } else {
                            wo.status = 'consolidated'; 
                            
                            let fmv = 40;
                            let multiplier = 1.0;
                            let targetRoleId = 'general_role';
                            let estimatedHours = 1.0;

                            if (isLegacy) {
                                const role = newState.projects[projIdx].roles.find(r => r.id === wo.to);
                                if (role) {
                                    fmv = parseFloat(role.fmv) || 40;
                                    multiplier = parseFloat(role.multiplier) || 1.0;
                                    targetRoleId = role.id;
                                }
                                estimatedHours = parseFloat(wo.horas) || parseFloat(wo.estimatedHours) || 1.0;
                            } else {
                                const flow = newState.projects[projIdx].vna_flows.find(f => f.id === wo.flowId);
                                if (flow) {
                                    const role = newState.projects[projIdx].roles.find(r => r.id === flow.to);
                                    if (role) {
                                        fmv = parseFloat(role.fmv) || 40;
                                        multiplier = parseFloat(role.multiplier) || 1.0;
                                        targetRoleId = role.id;
                                    }
                                    estimatedHours = parseFloat(flow.estimatedHours) || 1.0;
                                }
                            }

                            let calcHours = parseFloat(wo.realHours);
                            if (isNaN(calcHours) || calcHours === 0) {
                                calcHours = estimatedHours;
                                wo.realHours = calcHours; 
                            }

                            let finalSlices = calcHours * fmv * multiplier;

                            newState.projects[projIdx].ledger.push({
                                id: 'tx_' + Date.now(), type: 'SOP_EXECUTION',
                                userId: wo.assigneeId || wo.workerId, roleId: targetRoleId,
                                horas: calcHours, fmv: fmv, multiplier: multiplier,
                                valorCongelado: finalSlices, date: Date.now()
                            });
                            
                            const userIdx = newState.globalUsers.findIndex(u => u.id === (wo.assigneeId || wo.workerId));
                            if (userIdx > -1 && newState.globalUsers[userIdx].profile) {
                                if (!newState.globalUsers[userIdx].profile.sbt_skills) newState.globalUsers[userIdx].profile.sbt_skills = [];
                                
                                let skillNameToCertify = wo.flowId || wo.id;
                                if (!isLegacy) {
                                    const flow = newState.projects[projIdx].vna_flows.find(f => f.id === wo.flowId);
                                    if (flow && flow.required_skills && flow.required_skills.length > 0) {
                                        skillNameToCertify = flow.required_skills.join(' | ');
                                    } else if (flow && flow.template) {
                                        skillNameToCertify = flow.template;
                                    }
                                }

                                const existingSbtIndex = newState.globalUsers[userIdx].profile.sbt_skills.findIndex(s => s.skillName === skillNameToCertify || s.flowId === skillNameToCertify);
                                
                                if (existingSbtIndex > -1) {
                                    newState.globalUsers[userIdx].profile.sbt_skills[existingSbtIndex].exp += calcHours;
                                    newState.globalUsers[userIdx].profile.sbt_skills[existingSbtIndex].date = Date.now();
                                } else {
                                    newState.globalUsers[userIdx].profile.sbt_skills.push({ 
                                        skillName: skillNameToCertify, 
                                        exp: calcHours, 
                                        date: Date.now() 
                                    });
                                }
                            }
                        }
                    }
                }
                break;

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
