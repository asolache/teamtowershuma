// =============================================================================
// TEAMTOWERS SOS V10 / V9.1 — STORE.JS
// Redux Pattern · Estado Global Inmutable · Ruta: /ia/dev/js/core/store.js
// =============================================================================

import { KB } from './kb.js';

// 🔥 DETECCIÓN ACTUALIZADA AL DIRECTORIO DE DESARROLLO DE LA V10
const isV10 = window.location.pathname.includes('/ia/dev/');
const STORAGE_KEY = isV10 ? 'tt_v10_kernel_state' : 'tt_v9_kernel_state';

const initialState = {
    config: {
        version: isV10 ? 'v10-Antigravity' : 'v9.1-Antigravity',
        theme: 'dark',
        economics: {
            markup_margin: 0.30,
            premium_features_fee: 0.05,
            base_pricing: {
                'anthropic': { input: 3.00,  output: 15.00 },
                'openai':    { input: 2.50,  output: 10.00 },
                'gemini':    { input: 0.075, output: 0.30  },
                'deepseek':  { input: 0.14,  output: 0.28  },
                'custom':    { input: 0.0,   output: 0.0   }
            }
        }
    },
    session: {
        activeUserId: null,
        role: 'guest'
    },
    globalUsers: [
        { id: '@agent_genesis_architect',  name: 'Genesis Architect',  globalRole: 'ai-agent', profile: { isAi: true, guardian: 'creator',   preferredEngine: 'anthropic', active_skills: ['skill_vna_architect'] } },
        { id: '@agent_dharma_ontologist',  name: 'Dharma Ontologist',  globalRole: 'ai-agent', profile: { isAi: true, guardian: 'caregiver', preferredEngine: 'anthropic', active_skills: ['skill_ikigai_ontologist'] } },
        { id: '@agent_skill_crafter',      name: 'Skill Crafter',      globalRole: 'ai-agent', profile: { isAi: true, guardian: 'magician',  preferredEngine: 'anthropic', active_skills: ['skill_crafter_master'] } },
        { id: '@agent_prompt_synthesizer', name: 'Prompt Synthesizer', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'ruler',     preferredEngine: 'anthropic', active_skills: ['skill_prompt_synthesizer'] } },
        { id: '@agent_tdd_auditor',        name: 'TDD Auditor',        globalRole: 'ai-agent', profile: { isAi: true, guardian: 'sage',      preferredEngine: 'anthropic', active_skills: ['skill_slicing_pie_notary'] } },
        { id: '@agent_synaptic_weaver',    name: 'Synaptic Weaver',    globalRole: 'ai-agent', profile: { isAi: true, guardian: 'explorer',  preferredEngine: 'anthropic', active_skills: ['skill_knowledge_harvest'] } },
        { id: '@agent_token_economist',    name: 'Token Economist',    globalRole: 'ai-agent', profile: { isAi: true, guardian: 'ruler',     preferredEngine: 'anthropic', active_skills: ['skill_antifragile_compressor'] } },
        { id: '@agent_media_generator',    name: 'Media Generator',    globalRole: 'ai-agent', profile: { isAi: true, guardian: 'hero',      preferredEngine: 'anthropic', active_skills: [] } },
        { id: '@agent_web_deployer',       name: 'Web Deployer',       globalRole: 'ai-agent', profile: { isAi: true, guardian: 'magician',  preferredEngine: 'anthropic', active_skills: ['skill_ui_component_forge'] } },
        { id: '@agent_codex_developer',    name: 'Codex Developer',    globalRole: 'ai-agent', profile: { isAi: true, guardian: 'creator', preferredEngine: 'anthropic', active_skills: ['skill_vault_monetization', 'skill_swa_packager'], castell_level: '@dosos', queen_role: 'packager', reports_to: '@agent_genesis_architect' } },
        { id: '@kaos_tester',              name: 'Kaos Tester',        globalRole: 'ai-agent', profile: { isAi: true, guardian: 'outlaw',    preferredEngine: 'anthropic', active_skills: ['skill_pentest_chaos'] } },
        { id: '@bard_narrator',            name: 'Bard Narrator',      globalRole: 'ai-agent', profile: { isAi: true, guardian: 'jester',    preferredEngine: 'anthropic', active_skills: ['skill_community_engagement'] } },
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

        const tag = isV10 ? 'V10' : 'V9.1';
        console.log(`🗼 [${tag} Kernel] Iniciando secuencia de arranque...`);
        try {
            const kbPromise = KB.init();
            const timeout   = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout: IndexedDB bloqueada.')), 4000)
            );
            await Promise.race([kbPromise, timeout]);
            console.log(`📂 [${tag} Kernel] IndexedDB conectada.`);

            const savedNode = await KB.getNode('global_kernel_state');

            if (savedNode?.content) {
                this.state = savedNode.content;
                console.log(`✅ [${tag} Kernel] Estado restaurado desde IndexedDB.`);
            } else {
                const legacy = localStorage.getItem(STORAGE_KEY);
                if (legacy) {
                    try {
                        this.state = JSON.parse(legacy);
                        console.log(`🔄 [${tag} Kernel] Estado restaurado desde localStorage.`);
                    } catch (_) { /* estado fresco */ }
                }
            }

            // Forzar versión y economics actuales
            this.state.config.version   = initialState.config.version;
            this.state.config.economics = initialState.config.economics;
            if (!this.state.globalUsers) this.state.globalUsers = [];

            // Hard sync del roster de agentes
            initialState.globalUsers.forEach(agent => {
                if (!this.state.globalUsers.find(u => u.id === agent.id)) {
                    this.state.globalUsers.push(agent);
                } else {
                    const idx = this.state.globalUsers.findIndex(u => u.id === agent.id);
                    if (this.state.globalUsers[idx].profile?.isAi) {
                        this.state.globalUsers[idx].profile.preferredEngine = 'anthropic';
                    }
                }
            });

        } catch (err) {
            console.error(`⚠️ [${tag} Kernel] Fallo en init, usando estado fresco:`, err.message);
        }

        this.isInitialized = true;
        this.state.lastUpdated = Date.now();

        // Asegurar que @alvaro siempre existe como ecosystem-owner
        if (!this.state.globalUsers.find(u => u.id === '@alvaro')) {
            this.state.globalUsers.unshift({
                id: '@alvaro', name: 'Alvaro (Master Architect)',
                globalRole: 'ecosystem-owner',
                profile: { sbt_skills: [], isAi: false }
            });
        }

        // Auto-login: forzar ecosystem-owner si sesión es guest/null
        const isGuest = !this.state.session?.activeUserId ||
                        this.state.session?.role === 'guest' ||
                        this.state.session?.activeUserId?.startsWith('0xNeo');
        if (isGuest) {
            const owner = this.state.globalUsers.find(u =>
                u.globalRole === 'ecosystem-owner' || u.id === '@alvaro'
            );
            if (owner) {
                this.state.session = {
                    activeUserId: owner.id,
                    role:         owner.globalRole || 'ecosystem-owner'
                };
                console.log(`🔐 [${tag} Kernel] Sesión iniciada como ${owner.name || owner.id}`);
            }
        }
    }

    getState() { return this.state; }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    }

    async dispatch(action) {
        this.state = this._reducer(JSON.parse(JSON.stringify(this.state)), action);
        this.state.lastUpdated = Date.now();
        await this.persistState();
        this.listeners.forEach(l => l(this.state));
        return this.state;
    }

    async persistState() {
        try {
            await KB.saveNode({ id: 'global_kernel_state', type: 'kernel', content: this.state });
        } catch (err) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        }
    }

    // ── REDUCER ─────────────────────────────────────────────────────
    _reducer(state, action) {
        let newState = { ...state };
        const findProject = (id) => newState.projects.findIndex(p => p.id === id);
        let projIdx;

        switch (action.type) {

            case 'REGISTER_USER':
            case 'ADD_USER':
                if (!newState.globalUsers.find(u => u.id === action.payload.id)) {
                    const u = { ...action.payload };
                    if (!u.profile) u.profile = {};
                    if (!u.profile.sbt_skills) u.profile.sbt_skills = [];
                    newState.globalUsers.push(u);
                }
                break;

            case 'UPDATE_USER':
                const uIdx = newState.globalUsers.findIndex(u => u.id === action.payload.id);
                if (uIdx > -1) {
                    newState.globalUsers[uIdx] = {
                        ...newState.globalUsers[uIdx],
                        ...action.payload,
                        profile: { ...newState.globalUsers[uIdx].profile, ...action.payload.profile }
                    };
                }
                break;

            case 'LOGIN_USER':
                newState.session.activeUserId = action.payload.userId;
                const existing = newState.globalUsers.find(u => u.id === action.payload.userId);
                if (!existing) newState.globalUsers.push({ id: action.payload.userId, name: 'Anónimo', globalRole: 'network-user', profile: { sbt_skills: [] } });
                newState.session.role = existing?.globalRole || 'network-user';
                break;

            case 'LOGOUT_USER':
                newState.session = { activeUserId: null, role: 'guest' };
                break;

            case 'CREATE_PROJECT':
                if (!newState.projects.find(p => p.id === action.payload.id)) {
                    newState.projects.push({
                        id:            action.payload.id,
                        nombre:        action.payload.nombre || 'Nuevo Ecosistema',
                        presentation:  action.payload.presentation || '',
                        ownerId:       action.payload.ownerId || null,
                        usuarios:      [],
                        roles:         [],
                        vna_flows:     [],
                        vna_nodes:     [],
                        vna_exchanges: [],
                        skills:        [],
                        ledger:        [],
                        telemetry:     [],
                        sprints:       [],
                        logs:          [],
                        activeSprintId: null,
                        work_orders:   action.payload.work_orders || [], 
                        transactions:  action.payload.transactions || [], 
                        isArchived:    false,
                        createdAt:     Date.now(),
                        ...action.payload
                    });
                }
                break;

            case 'UPDATE_PROJECT_INFO':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) Object.assign(newState.projects[projIdx], action.payload.updates);
                break;

            case 'ARCHIVE_PROJECT':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) newState.projects[projIdx].isArchived = true;
                break;

            case 'DELETE_PROJECT': 
                newState.projects = newState.projects.filter(p => p.id !== action.payload.projectId);
                break;

            case 'ADD_ROLE':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if (!newState.projects[projIdx].roles) newState.projects[projIdx].roles = [];
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

            case 'ADD_FLOW':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if (!newState.projects[projIdx].vna_flows) newState.projects[projIdx].vna_flows = [];
                    newState.projects[projIdx].vna_flows.push(action.payload.flow);
                }
                break;

            case 'VNA_NODE_ADD':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if (!newState.projects[projIdx].vna_nodes) newState.projects[projIdx].vna_nodes = [];
                    const nodeExists = newState.projects[projIdx].vna_nodes.find(n => n.id === action.payload.node.id);
                    if (!nodeExists) newState.projects[projIdx].vna_nodes.push(action.payload.node);
                }
                break;

            case 'VNA_NODE_UPDATE':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    const vnIdx = (newState.projects[projIdx].vna_nodes || []).findIndex(n => n.id === action.payload.nodeId);
                    if (vnIdx > -1) Object.assign(newState.projects[projIdx].vna_nodes[vnIdx], action.payload.updates);
                }
                break;

            case 'VNA_EXCHANGE_REGISTER':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if (!newState.projects[projIdx].vna_exchanges) newState.projects[projIdx].vna_exchanges = [];
                    newState.projects[projIdx].vna_exchanges.push({
                        ...action.payload.exchange,
                        registeredAt: Date.now()
                    });
                }
                break;

            case 'SKILL_CREATED':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if (!newState.projects[projIdx].skills) newState.projects[projIdx].skills = [];
                    newState.projects[projIdx].skills.push({
                        id:            action.payload.skillId,
                        name:          action.payload.skillName,
                        kbKey:         action.payload.kbKey,
                        createdBy:     action.payload.createdBy || 'node-claude-sonnet-v9',
                        slicesCharged: Number((action.payload.slicesCharged || 0).toFixed(3)),
                        timestamp:     Date.now()
                    });
                }
                break;

            case 'SKILL_CURATED':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    const skIdx = (newState.projects[projIdx].skills || []).findIndex(s => s.id === action.payload.skillId);
                    if (skIdx > -1) Object.assign(newState.projects[projIdx].skills[skIdx], {
                        ...action.payload.updates,
                        curatedAt: Date.now()
                    });
                }
                break;

            case 'LEDGER_UPDATE':
            case 'LOG_WORK':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if (!newState.projects[projIdx].ledger) newState.projects[projIdx].ledger = [];
                    newState.projects[projIdx].ledger.push({
                        ...action.payload,
                        slices:    Number(((action.payload.realHours || 0) * (action.payload.fmv || 50) * (action.payload.multiplier || 1)).toFixed(3)),
                        timestamp: Date.now()
                    });
                }
                break;

            case 'LEDGER_AI_COST':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if (!newState.projects[projIdx].ledger) newState.projects[projIdx].ledger = [];

                    const pricing  = newState.config.economics.base_pricing[action.payload.engine]
                                   || { input: 3.00, output: 15.00 };
                    const markup   = 1
                                   + (newState.config.economics.markup_margin          || 0)
                                   + (newState.config.economics.premium_features_fee   || 0);
                    const baseCost = (action.payload.input_tokens  / 1_000_000) * pricing.input
                                   + (action.payload.output_tokens / 1_000_000) * pricing.output;
                    const slices   = Number((baseCost * markup * (action.payload.multiplier || 2.0)).toFixed(3));

                    newState.projects[projIdx].ledger.push({
                        type:          'AI_COST',
                        agentId:       action.payload.agentId  || 'node-claude-sonnet-v9',
                        engine:        action.payload.engine   || 'anthropic',
                        routine:       action.payload.routine  || 'unknown',
                        input_tokens:  action.payload.input_tokens  || 0,
                        output_tokens: action.payload.output_tokens || 0,
                        cost_usd:      Number((baseCost * markup).toFixed(6)),
                        slices,
                        realHours:     (action.payload.latencyMs || 0) / 3_600_000,
                        timestamp:     Date.now()
                    });
                }
                break;

            case 'SPAWN_WORK_ORDER':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if (!newState.projects[projIdx].work_orders) newState.projects[projIdx].work_orders = [];
                    newState.projects[projIdx].work_orders.push(action.payload.workOrder);
                }
                break;

            case 'UPDATE_WORK_ORDER':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    const woArr = newState.projects[projIdx].work_orders || newState.projects[projIdx].workOrders || newState.projects[projIdx].transactions || [];
                    const woIdx = woArr.findIndex(wo => wo.hash === action.payload.hash || wo.id === action.payload.hash);
                    if (woIdx > -1) Object.assign(woArr[woIdx], action.payload.updates);
                }
                break;

            case 'LOG_TELEMETRY':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if (!newState.projects[projIdx].telemetry) newState.projects[projIdx].telemetry = [];
                    newState.projects[projIdx].telemetry.push({ ...action.payload, timestamp: Date.now() });
                }
                break;

            case 'ADD_LOG_ENTRY':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if (!newState.projects[projIdx].logs) newState.projects[projIdx].logs = [];
                    newState.projects[projIdx].logs.push(action.payload.log);
                }
                break;

            case 'MARK_LOG_READ':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    const logIdx = (newState.projects[projIdx].logs || []).findIndex(l => l.id === action.payload.logId);
                    if (logIdx > -1) {
                        if (!newState.projects[projIdx].logs[logIdx].readBy) {
                            newState.projects[projIdx].logs[logIdx].readBy = [];
                        }
                        if (!newState.projects[projIdx].logs[logIdx].readBy.includes(action.payload.userId)) {
                            newState.projects[projIdx].logs[logIdx].readBy.push(action.payload.userId);
                        }
                    }
                }
                break;

            case 'ADD_LEDGER_ENTRY':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if (!newState.projects[projIdx].ledger) newState.projects[projIdx].ledger = [];
                    newState.projects[projIdx].ledger.push({
                        ...action.payload.entry,
                        timestamp: action.payload.entry.timestamp || Date.now()
                    });
                }
                break;
                
            case 'ADD_CAPITAL_INJECTION': 
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if (!newState.projects[projIdx].ledger) newState.projects[projIdx].ledger = [];
                    newState.projects[projIdx].ledger.push({
                        type: 'CAPITAL_INJECTION',
                        userId: action.payload.userId,
                        roleId: 'CAPITAL_ASSET',
                        assetType: action.payload.assetType,
                        amount: action.payload.amount,
                        descripcion: action.payload.description,
                        valorCongelado: action.payload.amount * 4.0, 
                        timestamp: Date.now()
                    });
                }
                break;

            case 'UPDATE_WO_STATUS':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    const woArr = newState.projects[projIdx].work_orders
                               || newState.projects[projIdx].transactions
                               || [];
                    const woIdx2 = woArr.findIndex(wo => wo.hash === action.payload.hash || wo.id === action.payload.hash);
                    if (woIdx2 > -1) {
                        woArr[woIdx2].status     = action.payload.status;
                        woArr[woIdx2].assigneeId = action.payload.assigneeId || woArr[woIdx2].assigneeId;
                    }
                }
                break;

            case 'REPORT_WORK_ORDER': {
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    const woArr2 = newState.projects[projIdx].work_orders
                                || newState.projects[projIdx].transactions
                                || [];
                    const wi = woArr2.findIndex(wo => wo.hash === action.payload.woHash || wo.id === action.payload.woHash);
                    if (wi > -1) {
                        woArr2[wi].status      = 'reported';
                        woArr2[wi].realHours   = action.payload.realHours || 0;
                        woArr2[wi].comentario  = action.payload.comentario || '';
                        woArr2[wi].proofLink   = action.payload.proofLink  || '';
                    }
                }
                break;
            }
            
            case 'REVIEW_WORK_ORDER': {
                 projIdx = findProject(action.payload.projectId);
                 if (projIdx > -1) {
                     const woArr3 = newState.projects[projIdx].work_orders || newState.projects[projIdx].transactions || [];
                     const ri = woArr3.findIndex(wo => wo.hash === action.payload.woHash || wo.id === action.payload.woHash);
                     if (ri > -1) {
                         const isPassed = !Object.values(action.payload.socValidation || {}).includes(false);
                         woArr3[ri].tddPassed = isPassed;
                         if(!isPassed) {
                             woArr3[ri].status = 'reported'; 
                         }
                     }
                 }
                 break;
            }

            case 'APPROVE_WORK_ORDER':
            case 'CONSOLIDATE_WORK_ORDER': {
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    const woArr3 = newState.projects[projIdx].work_orders
                                || newState.projects[projIdx].transactions || [];
                    const ci = woArr3.findIndex(wo => wo.hash === action.payload.woHash || wo.id === action.payload.woHash);
                    
                    if (ci > -1) {
                        if (woArr3[ci].tddPassed === false) {
                            break;
                        }
                        
                        woArr3[ci].status        = 'consolidated';
                        woArr3[ci].consolidatedAt = Date.now();
                        woArr3[ci].evalsResult   = action.payload.evalsResult || {};
                        woArr3[ci].autoApproved  = action.payload.autoApproved || false;
                        
                        if (!newState.projects[projIdx].ledger) newState.projects[projIdx].ledger = [];
                        
                        const hours = woArr3[ci].realHours || 1;
                        const fmv = action.payload.fmv || 40;
                        const multi = action.payload.multiplier || 1.2;
                        const slicesCalculated = parseFloat((hours * fmv * multi).toFixed(3));
                        
                        newState.projects[projIdx].ledger.push({
                            type:          'SOP_EXECUTION',
                            userId:        woArr3[ci].assigneeId || woArr3[ci].workerId,
                            roleId:        woArr3[ci].from || woArr3[ci].to || 'generic_role',
                            horas:         hours,
                            fmv:           fmv,
                            multiplier:    multi,
                            valorCongelado: slicesCalculated,
                            slices:        slicesCalculated,
                            woHash:        action.payload.woHash,
                            timestamp:     Date.now(),
                            descripcion:   `WO consolidada: ${woArr3[ci].entregable || woArr3[ci].template || woArr3[ci].comentario}`
                        });
                    }
                }
                break;
            }
            
            case 'EVAL_CREATE':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if (!newState.projects[projIdx].evals) newState.projects[projIdx].evals = [];
                    const exists = newState.projects[projIdx].evals.find(e => e.id === action.payload.eval.id);
                    if (!exists) newState.projects[projIdx].evals.push({
                        ...action.payload.eval,
                        status:    action.payload.eval.status    || 'draft',
                        level:     action.payload.eval.level     ?? 0,
                        weight:    action.payload.eval.weight    ?? 1.0,
                        passThreshold: action.payload.eval.passThreshold ?? 0.8,
                        createdAt: Date.now()
                    });
                }
                break;

            case 'EVAL_UPDATE':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    const evals = newState.projects[projIdx].evals || [];
                    const ei = evals.findIndex(e => e.id === action.payload.evalId);
                    if (ei > -1) Object.assign(evals[ei], action.payload.updates, { updatedAt: Date.now() });
                }
                break;

            case 'NODE_PROMOTE': {
                const { projectId, nodeId, nodeType, newLevel, newMaturity } = action.payload;
                projIdx = findProject(projectId);
                if (projIdx > -1) {
                    if (nodeType === 'role') {
                        const roles = newState.projects[projIdx].roles || [];
                        const ri = roles.findIndex(r => r.id === nodeId);
                        if (ri > -1) {
                            roles[ri].maturity = newMaturity || 'validated';
                            roles[ri].level    = newLevel    ?? (roles[ri].level ?? 0) + 1;
                            roles[ri].promotedAt = Date.now();
                        }
                    }
                    if (nodeType === 'vna_node') {
                        const nodes = newState.projects[projIdx].vna_nodes || [];
                        const ni = nodes.findIndex(n => n.id === nodeId);
                        if (ni > -1) {
                            nodes[ni].maturity = newMaturity || 'validated';
                            nodes[ni].level    = newLevel    ?? (nodes[ni].level ?? 0) + 1;
                            nodes[ni].promotedAt = Date.now();
                        }
                    }
                    if (nodeType === 'user') {
                        const users = newState.globalUsers || [];
                        const ui2 = users.findIndex(u => u.id === nodeId);
                        if (ui2 > -1) {
                            if (!users[ui2].profile) users[ui2].profile = {};
                            users[ui2].profile.maturity = newMaturity || 'validated';
                            users[ui2].profile.level    = newLevel    ?? (users[ui2].profile.level ?? 0) + 1;
                        }
                    }
                }
                break;
            }

            default:
                break;
        }

        return newState;
    }

    canUserViewProject(projectId, userId, userRole) {
        if (userRole === 'ecosystem-owner') return true;
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return false;
        if (p.ownerId === userId) return true;
        if (p.usuarios && p.usuarios.some(u => u.id === userId)) return true;
        return !p.isPrivate;
    }

    calculateHarvest(projectId) {
        const project = this.state.projects?.find(p => p.id === projectId);
        if (!project?.ledger?.length) return [];

        const totals = {};

        for (const entry of project.ledger) {
            if (!entry.type || entry.type === 'CAPITAL_INJECTION' || entry.type === 'SOP_EXECUTION') {
                const uid = entry.userId || entry.agentId || 'unknown';
                if (!totals[uid]) totals[uid] = { userId: uid, totalSlices: 0, capitalSlices: 0, workSlices: 0 };
                const s = entry.valorCongelado || entry.slices || 0;
                totals[uid].totalSlices += s;
                if (entry.type === 'CAPITAL_INJECTION') totals[uid].capitalSlices += s;
                else                                    totals[uid].workSlices    += s;
                continue;
            }
            if (entry.type === 'AI_COST') {
                const uid = entry.agentId || 'node-claude-sonnet-v9';
                if (!totals[uid]) totals[uid] = { userId: uid, totalSlices: 0, capitalSlices: 0, workSlices: 0, aiCost: 0 };
                const s = Number((entry.slices || 0).toFixed(3));
                totals[uid].totalSlices += s;
                totals[uid].workSlices  += s;
                totals[uid].aiCost      = (totals[uid].aiCost || 0) + (entry.cost_usd || 0);
            }
        }

        const totalSlices = Object.values(totals).reduce((s, u) => s + u.totalSlices, 0);
        return Object.values(totals).map(u => ({
            ...u,
            totalSlices: Number(u.totalSlices.toFixed(3)),
            percentage:  totalSlices > 0 ? Number(((u.totalSlices / totalSlices) * 100).toFixed(2)) : 0
        }));
    }

    calculateResilience(projectId) {
        const project = this.state.projects?.find(p => p.id === projectId);
        if (!project) return 60;
        const flows    = (project.vna_flows || []).length + (project.vna_exchanges || []).length;
        const nodes    = (project.roles || []).length + (project.vna_nodes || []).length;
        const wos      = (project.work_orders || []).length;
        const hasAi    = (project.usuarios || []).some(u => this.state.globalUsers.find(g => g.id === u.id && g.profile?.isAi));
        let score = Math.min(40 + flows * 5 + nodes * 3 + (hasAi ? 15 : 0) + Math.min(wos, 5) * 2, 100);
        return Math.round(score);
    }
}

export const store = new Store();