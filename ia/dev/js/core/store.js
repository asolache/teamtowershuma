// =============================================================================
// TEAMTOWERS SOS V10 — STORE.JS
// Redux Pattern · Estado Global Inmutable · Ruta: /ia/dev/js/core/store.js
// Migrado desde v9 · Kernel: Antigravity V10
// =============================================================================

import { KB } from './kb.js';

const initialState = {
    config: {
        version: 'v10-Antigravity',
        theme: 'dark',
        economics: {
            markup_margin: 0.30,
            premium_features_fee: 0.05,
            base_pricing: {
                'anthropic': { input: 3.00,  output: 15.00 },  // ← Default V10
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
        { id: '@agent_codex_developer',    name: 'Codex Developer',    globalRole: 'ai-agent', profile: { isAi: true, guardian: 'sage',      preferredEngine: 'anthropic', active_skills: ['skill_vault_monetization'] } },
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

        console.log('🗼 [V10 Kernel] Iniciando secuencia de arranque...');
        try {
            const kbPromise = KB.init();
            const timeout   = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout: IndexedDB bloqueada.')), 4000)
            );
            await Promise.race([kbPromise, timeout]);
            console.log('📂 [V10 Kernel] IndexedDB conectada.');

            // Cargar estado persistido
            const savedNode = await KB.getNode('global_kernel_state_v10');

            if (savedNode?.content) {
                this.state = savedNode.content;
                console.log('✅ [V10 Kernel] Estado restaurado desde IndexedDB.');
            } else {
                // Migración desde v9 si existe
                const legacy = localStorage.getItem('tt_v9_kernel_state');
                if (legacy) {
                    try {
                        this.state = JSON.parse(legacy);
                        console.log('🔄 [V10 Kernel] Estado migrado desde V9.');
                    } catch (_) { /* estado fresco */ }
                }
            }

            // Forzar versión y economics actuales
            this.state.config.version   = initialState.config.version;
            this.state.config.economics = initialState.config.economics;
            if (!this.state.globalUsers) this.state.globalUsers = [];

            // Hard sync del roster de agentes V10
            initialState.globalUsers.forEach(agent => {
                if (!this.state.globalUsers.find(u => u.id === agent.id)) {
                    this.state.globalUsers.push(agent);
                } else {
                    // Actualizar preferredEngine a anthropic para agentes IA
                    const idx = this.state.globalUsers.findIndex(u => u.id === agent.id);
                    if (this.state.globalUsers[idx].profile?.isAi) {
                        this.state.globalUsers[idx].profile.preferredEngine = 'anthropic';
                    }
                }
            });

        } catch (err) {
            console.error('⚠️ [V10 Kernel] Fallo en init, usando estado fresco:', err.message);
        }

        this.isInitialized = true;
        this.state.lastUpdated = Date.now();
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
            await KB.saveNode({ id: 'global_kernel_state_v10', type: 'kernel', content: this.state });
        } catch (err) {
            // Fallback a localStorage si IndexedDB falla
            localStorage.setItem('tt_v10_kernel_state', JSON.stringify(this.state));
        }
    }

    // ── REDUCER ─────────────────────────────────────────────────────
    _reducer(state, action) {
        let newState = { ...state };
        const findProject = (id) => newState.projects.findIndex(p => p.id === id);
        let projIdx;

        switch (action.type) {

            // ── USUARIOS ──────────────────────────────────────────
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

            // ── PROYECTOS ─────────────────────────────────────────
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
                        vna_nodes:     [],    // ← V10: nodos VNA del mapa
                        vna_exchanges: [],    // ← V10: intercambios VNA
                        skills:        [],    // ← V10: skills creadas en el proyecto
                        ledger:        [],
                        telemetry:     [],
                        sprints:       [],
                        logs:          [],
                        activeSprintId: null,
                        workOrders:    [],
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

            // ── ROLES ─────────────────────────────────────────────
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

            // ── FLOWS VNA (legacy V9 — mantener) ─────────────────
            case 'ADD_FLOW':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if (!newState.projects[projIdx].vna_flows) newState.projects[projIdx].vna_flows = [];
                    newState.projects[projIdx].vna_flows.push(action.payload.flow);
                }
                break;

            // ── VNA NODES V10 ─────────────────────────────────────
            case 'VNA_NODE_ADD':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if (!newState.projects[projIdx].vna_nodes) newState.projects[projIdx].vna_nodes = [];
                    // Idempotente: evitar duplicados por id
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

            // ── SKILLS V10 ────────────────────────────────────────
            case 'SKILL_CREATED':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if (!newState.projects[projIdx].skills) newState.projects[projIdx].skills = [];
                    newState.projects[projIdx].skills.push({
                        id:            action.payload.skillId,
                        name:          action.payload.skillName,
                        kbKey:         action.payload.kbKey,
                        createdBy:     action.payload.createdBy || 'node-claude-sonnet-v10',
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

            // ── LEDGER / SLICING PIE ──────────────────────────────
            case 'LEDGER_UPDATE':
            case 'LOG_WORK':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if (!newState.projects[projIdx].ledger) newState.projects[projIdx].ledger = [];
                    newState.projects[projIdx].ledger.push({
                        ...action.payload,
                        // Slices siempre con 3 decimales — Codex V10
                        slices:    Number(((action.payload.realHours || 0) * (action.payload.fmv || 50) * (action.payload.multiplier || 1)).toFixed(3)),
                        timestamp: Date.now()
                    });
                }
                break;

            // ── LEDGER AI COST V10 (coste real IA → Slicing Pie) ──
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
                        agentId:       action.payload.agentId  || 'node-claude-sonnet-v10',
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

            // ── WORK ORDERS ───────────────────────────────────────
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
                    const woArr = newState.projects[projIdx].work_orders || newState.projects[projIdx].workOrders || [];
                    const woIdx = woArr.findIndex(wo => wo.hash === action.payload.hash);
                    if (woIdx > -1) Object.assign(woArr[woIdx], action.payload.updates);
                }
                break;

            // ── TELEMETRÍA ────────────────────────────────────────
            case 'LOG_TELEMETRY':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    if (!newState.projects[projIdx].telemetry) newState.projects[projIdx].telemetry = [];
                    newState.projects[projIdx].telemetry.push({ ...action.payload, timestamp: Date.now() });
                }
                break;

            // ── LOGS (Usenet + Auto-Heal) ─────────────────────────
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

            // ── ADD_LEDGER_ENTRY (Capital + trabajo manual desde LedgerView) ──
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

            // ── UPDATE_WO_STATUS (usado por ProjectView + KanbanRenderer) ──
            case 'UPDATE_WO_STATUS':
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    const woArr = newState.projects[projIdx].work_orders
                               || newState.projects[projIdx].workOrders
                               || [];
                    const woIdx2 = woArr.findIndex(wo => wo.hash === action.payload.hash);
                    if (woIdx2 > -1) {
                        woArr[woIdx2].status     = action.payload.status;
                        woArr[woIdx2].assigneeId = action.payload.assigneeId || woArr[woIdx2].assigneeId;
                    }
                }
                break;

            // ── REPORT_WORK_ORDER (sella WO con Proof of Work) ──────────
            case 'REPORT_WORK_ORDER': {
                projIdx = findProject(action.payload.projectId);
                if (projIdx > -1) {
                    const woArr2 = newState.projects[projIdx].work_orders
                                || newState.projects[projIdx].workOrders
                                || [];
                    const wi = woArr2.findIndex(wo => wo.hash === action.payload.woHash);
                    if (wi > -1) {
                        woArr2[wi].status      = 'reported';
                        woArr2[wi].realHours   = action.payload.realHours || 0;
                        woArr2[wi].comentario  = action.payload.comentario || '';
                        woArr2[wi].proofLink   = action.payload.proofLink  || '';
                    }
                }
                break;
            }

            default:
                break;
        }

        return newState;
    }

    // ── calculateHarvest ─────────────────────────────────────────────────────
    // Suma slices por participante para el cap table.
    // Incluye trabajo humano (valorCongelado) + trabajo IA (AI_COST slices).
    calculateHarvest(projectId) {
        const project = this.state.projects?.find(p => p.id === projectId);
        if (!project?.ledger?.length) return [];

        const totals = {};

        for (const entry of project.ledger) {
            // ── Entrada de trabajo humano (LEDGER_UPDATE / LOG_WORK / ADD_LEDGER_ENTRY) ──
            if (!entry.type || entry.type === 'CAPITAL_INJECTION') {
                const uid = entry.userId || entry.agentId || 'unknown';
                if (!totals[uid]) totals[uid] = { userId: uid, totalSlices: 0, capitalSlices: 0, workSlices: 0 };
                const s = entry.valorCongelado || entry.slices || 0;
                totals[uid].totalSlices += s;
                if (entry.type === 'CAPITAL_INJECTION') totals[uid].capitalSlices += s;
                else                                    totals[uid].workSlices    += s;
                continue;
            }
            // ── Entrada AI_COST ───────────────────────────────────────────────
            if (entry.type === 'AI_COST') {
                const uid = entry.agentId || 'node-claude-sonnet-v10';
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

    // ── calculateResilience ──────────────────────────────────────────────────
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
