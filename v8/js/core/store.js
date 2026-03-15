// v8/js/core/store.js
// ==========================================================================
// KERNEL V9.0 - AGENTIC AI STORE & WEB3 IDENTITY
// Motor Local-First con Memética SOP/SOCs, VNA y Auditoría Fractal
// ==========================================================================

import { KB } from './kb.js';

const initialState = {
    config: {
        version: '9.0.0', // <-- VERSIÓN KERNEL V9
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
                vision: "Master Architect V9. Guiando a la IA mediante Memes y Fractales.",
                structural_affinity: ["@anxaneta", "@aixecador"],
                guardian_authority: ["creator", "magician"],
                isOpenToWork: true,
                sbt_skills: []
            }
        },
        // --- LOS 6 GUARDIANES IA (La Colla Nativa del Ecosistema) ---
        { id: '@cap_de_colla', name: 'Cap de Colla (Orquestador)', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'ruler', apiCostPerHour: 0.30, vision: "Monta los equipos para cada castell. Orquesta a los demás agentes, asigna tareas y vela por la sintonía general del ecosistema.", structural_affinity: ["@anxaneta", "@aixecador"] } },
        { id: '@genesi_ai', name: 'Gènesi (Creador de Proyectos)', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'creator', apiCostPerHour: 0.25, vision: "Posee todos los SOPs y SOCs de todos los sectores. Genera redes neuronales de valor y topologías adaptadas a cada arquetipo de empresa.", structural_affinity: ["@anxaneta"] } },
        { id: '@notari_ledger', name: 'Notari (Auditor de SOCs)', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'sage', apiCostPerHour: 0.20, vision: "Autoconfigurable para evaluar SOCs y la coherencia entre la request y el entregable. Garantiza auditorías ciegas y sella el Ledger.", structural_affinity: ["@dosos"] } },
        { id: '@seny_analyst', name: 'Seny (Analista de Red)', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'magician', apiCostPerHour: 0.15, vision: "Experto en topología VNA, cuellos de botella y optimización de conversión de valor intangible a tangible.", structural_affinity: ["@dosos"] } },
        { id: '@dharma_coach', name: 'Dharma (Ikigai Coach)', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'caregiver', apiCostPerHour: 0.05, vision: "Sintetiza perfiles usando arquetipos del Panteón y asiste en el desarrollo cognitivo de los nodos humanos.", structural_affinity: ["@pinya"] } },
        { id: '@forca_worker', name: 'Força (Deep Work Exec)', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'hero', apiCostPerHour: 0.40, vision: "Fuerza bruta. Ejecuta las recetas (SOP) paso a paso, iterando hasta cumplir el objetivo.", structural_affinity: ["@baixos"] } }
    ],
    projects: [],
    session: { activeUserId: null, role: 'guest' } // Arranque Zero Trust
};

function inferSkillCategory(levelId, deliverableName) {
    const descLower = deliverableName.toLowerCase();
    if (descLower.includes('código') || descLower.includes('api') || descLower.includes('dev')) return 'Ingeniería Software';
    if (descLower.includes('diseño') || descLower.includes('ui') || descLower.includes('ux')) return 'Diseño Producto';
    if (descLower.includes('estrategia') || descLower.includes('modelo')) return 'Visión Estratégica';
    if (descLower.includes('qa') || descLower.includes('auditor')) return 'Quality Assurance';
    
    const levelMap = { '@anxaneta': 'Liderazgo', '@aixecador': 'Management', '@dosos': 'Auditoría', '@baixos': 'Ejecución Técnica', '@pinya': 'Operaciones' };
    return levelMap[levelId] || 'Contribución General';
}

async function asyncReducer(state, action) {
    let newState = JSON.parse(JSON.stringify(state)); 

    switch (action.type) {
        case 'LOGIN_USER': {
            const rawId = action.payload.userId.trim();
            const exists = newState.globalUsers.find(u => u.id === rawId || u.wallet === rawId || u.email === rawId);
            if (exists) {
                newState.session = { activeUserId: exists.id, role: exists.globalRole };
            } else {
                const newId = rawId.startsWith('0x') ? rawId : (rawId.startsWith('@') ? rawId : '@' + rawId);
                const isWallet = newId.startsWith('0x');
                const newUser = {
                    id: newId, name: isWallet ? `${newId.substring(0, 6)}...${newId.substring(newId.length - 4)}` : newId.replace('@', ''),
                    globalRole: 'network-user', wallet: isWallet ? newId : '', profile: { sbt_skills: [], isOpenToWork: true }
                };
                newState.globalUsers.push(newUser);
                newState.session = { activeUserId: newUser.id, role: 'network-user' };
            }
            break;
        }
        case 'LOGOUT_USER': newState.session = { activeUserId: null, role: 'guest' }; break;
        case 'UPDATE_GLOBAL_CONFIG': newState.config = { ...newState.config, ...action.payload }; break;
        case 'ADD_USER': {
            const exists = newState.globalUsers.find(u => u.id === action.payload.id);
            if (!exists) newState.globalUsers.push({ ...action.payload, globalRole: 'network-user', profile: { sbt_skills: [] } });
            break;
        }
        case 'UPDATE_USER_PROFILE': {
            const uIdx = newState.globalUsers.findIndex(u => u.id === action.payload.userId);
            if (uIdx > -1) newState.globalUsers[uIdx].profile = { ...newState.globalUsers[uIdx].profile, ...action.payload.profile, lastUpdated: Date.now() };
            break;
        }
        case 'CREATE_PROJECT': {
            if (!newState.projects.find(p => p.id === action.payload.id)) {
                const sprintId = 'sp_' + Date.now();
                newState.projects.push({ 
                    ...action.payload, createdAt: Date.now(), roles: action.payload.roles || [],
                    usuarios: action.payload.usuarios || [
                        { id: newState.session.activeUserId, permissions: { canCreateWO: true, canApprove: true } },
                        { id: '@genesi_ai', permissions: { canCreateWO: true, canApprove: false } },
                        { id: '@aixecador_pm', permissions: { canCreateWO: true, canApprove: false } }
                    ],
                    vna_flows: action.payload.vna_flows || [], work_orders: action.payload.work_orders || [], ledger: action.payload.ledger || [], asignaciones: action.payload.asignaciones || [],
                    sprints: [{ id: sprintId, name: 'Sprint 1', status: 'active', createdAt: Date.now() }],
                    activeSprintId: sprintId
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
        case 'CREATE_SPRINT': {
            const pSp = newState.projects.find(p => p.id === action.payload.projectId);
            if (pSp) {
                const newSprint = { id: 'sp_' + Date.now(), name: action.payload.name, status: 'active', createdAt: Date.now() };
                if (!pSp.sprints) pSp.sprints = [];
                pSp.sprints.push(newSprint);
                pSp.activeSprintId = newSprint.id;
            }
            break;
        }
        case 'SET_ACTIVE_SPRINT': {
            const pSpAct = newState.projects.find(p => p.id === action.payload.projectId);
            if (pSpAct) pSpAct.activeSprintId = action.payload.sprintId;
            break;
        }
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
        // KANBAN CORE: SOP, SOCs y AUDITORÍA
        // ==========================================
        case 'SPAWN_WORK_ORDER': {
            const pWoAdd = newState.projects.find(p => p.id === action.payload.projectId);
            if (pWoAdd) {
                if (!pWoAdd.work_orders) pWoAdd.work_orders = [];
                pWoAdd.work_orders.push({ 
                    ...action.payload.workOrder, 
                    sprintId: action.payload.workOrder.sprintId || pWoAdd.activeSprintId,
                    timestamp: Date.now() 
                });
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
        case 'REVIEW_WORK_ORDER': {
            const pWoRev = newState.projects.find(p => p.id === action.payload.projectId);
            if (pWoRev && pWoRev.work_orders) {
                const wo = pWoRev.work_orders.find(t => t.hash === action.payload.woHash);
                if (wo) {
                    wo.status = 'in_review';
                    wo.auditorId = action.payload.auditorId;
                    
                    if (action.payload.socValidation && wo.soc_checklist) {
                        wo.soc_checklist = wo.soc_checklist.map(soc => ({
                            ...soc,
                            isChecked: action.payload.socValidation[soc.id] !== undefined ? action.payload.socValidation[soc.id] : soc.isChecked
                        }));
                    }
                }
            }
            break;
        }
        case 'APPROVE_WORK_ORDER': {
            const pWoApp = newState.projects.find(p => p.id === action.payload.projectId);
            if (pWoApp && pWoApp.work_orders) {
                const wo = pWoApp.work_orders.find(t => t.hash === action.payload.woHash);
                if (wo) {
                    const allSocsPassed = wo.soc_checklist ? wo.soc_checklist.every(soc => soc.isChecked) : true;
                    if(!allSocsPassed) {
                        console.warn("Auditoría Rechazada: No se han cumplido todos los SOCs requeridos para el sello notarial.");
                        wo.status = 'reported'; 
                        break;
                    }

                    wo.status = 'consolidated';
                    if (!pWoApp.ledger) pWoApp.ledger = [];
                    
                    let flow = (pWoApp.vna_flows || []).find(f => f.id === wo.flowId);
                    let multiplier = 1; let fmv = 50; let roleId = 'Unknown';
                    let deliverableName = 'Work Order Instanciada';
                    let levelId = '@baixos';

                    if (flow) {
                        roleId = flow.to; deliverableName = flow.template || flow.entregable || 'Entregable';
                        const role = pWoApp.roles.find(r => r.id === roleId);
                        if (role) { multiplier = role.multiplier || 1; fmv = role.fmv || 50; levelId = role.levelId; }
                    }

                    const slices = (wo.realHours || 1) * fmv * multiplier;
                    wo.valorCongelado = slices;

                    pWoApp.ledger.push({
                        id: 'blk_' + Date.now(), hash: wo.hash, userId: wo.assigneeId, roleId: roleId, sprintId: wo.sprintId,
                        horas: wo.realHours || 1, multiplier: multiplier, fmv: fmv,
                        valorCongelado: slices, timestamp: Date.now(), description: deliverableName,
                        auditorId: wo.auditorId || 'PO_Direct'
                    });

                    const gUserIndex = newState.globalUsers.findIndex(u => u.id === wo.assigneeId);
                    if (gUserIndex > -1) {
                        let profile = newState.globalUsers[gUserIndex].profile;
                        if (!profile.sbt_skills) profile.sbt_skills = [];
                        
                        const skillName = inferSkillCategory(levelId, deliverableName);
                        const expGained = wo.realHours || 1;

                        const existingSkill = profile.sbt_skills.find(s => s.name === skillName);
                        if (existingSkill) {
                            existingSkill.exp += expGained;
                            existingSkill.level = Math.floor(Math.sqrt(existingSkill.exp)) + 1;
                        } else {
                            profile.sbt_skills.push({ name: skillName, exp: expGained, level: 1 });
                        }
                    }

                    const kbDoc = {
                        id: 'kb_auto_' + Date.now(), projectId: action.payload.projectId, type: 'manual',
                        sector: pWoApp.sector || 'general', roleTarget: levelId, title: `Caso de Éxito SOP: ${deliverableName}`,
                        content: `Resolución validada de SOP (${wo.realHours}h). \n\nContexto: ${wo.comentario || 'N/A'}\n\nPrueba de Trabajo (PoW): ${wo.proofLink || 'Ejecución Interna'}`
                    };
                    KB.saveDocument(kbDoc).catch(e => console.error("Fallo al inyectar auto-aprendizaje en LMS", e));
                }
            }
            break;
        }

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
                    userId: action.payload.userId, roleId: 'CAPITAL_ASSET',
                    description: `[Capital: ${action.payload.assetType.toUpperCase()}] ${action.payload.description}`,
                    horas: 0, valorCongelado: valorGenerado, timestamp: Date.now()
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
        this.swarmChannel = new BroadcastChannel('teamtowers_swarm_v8');
        this.setupP2P();
        this.loadState();
    }

    setupP2P() {
        this.swarmChannel.onmessage = (event) => {
            if (event.data.type === 'STATE_SYNC') {
                try {
                    this.state = JSON.parse(event.data.payload);
                    this.notifyListeners();
                    window.dispatchEvent(new Event('swarm_update'));
                } catch(e) { console.error("Error P2P:", e); }
            }
        };
    }

    loadState() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                
                // --- KERNEL MIGRATION PATCH ---
                // Forzamos la actualización de la versión del config desde el initialState para evitar 
                // que el localStorage mantenga la red anclada en una versión anterior (V8.3 -> V9)
                if (this.state.config && this.state.config.version !== initialState.config.version) {
                    console.log(`[KERNEL] Migrando State de v${this.state.config.version} a v${initialState.config.version}`);
                    this.state.config.version = initialState.config.version;
                }

                if (!this.state.agents) this.state.agents = initialState.agents;
                
                initialState.globalUsers.forEach(initialU => {
                    // Verificamos por ID para inyectar/actualizar correctamente la nueva configuración de la Colla
                    const existingUIdx = this.state.globalUsers.findIndex(u => u.id === initialU.id);
                    if (existingUIdx === -1 && initialU.globalRole === 'ai-agent') {
                        this.state.globalUsers.push(initialU);
                    } else if (existingUIdx > -1 && initialU.globalRole === 'ai-agent') {
                        // Actualizamos el perfil de la IA si ya existía pero cambió (Ej: Nuevo Guardian o Visión)
                        this.state.globalUsers[existingUIdx].profile = { ...this.state.globalUsers[existingUIdx].profile, ...initialU.profile };
                        this.state.globalUsers[existingUIdx].name = initialU.name;
                    }
                });

                if (this.state.projects) {
                    this.state.projects = this.state.projects.map(p => ({
                        ...p,
                        roles: p.roles || [], ledger: p.ledger || [], work_orders: p.work_orders || [], vna_flows: p.vna_flows || [], usuarios: p.usuarios || [],
                        sprints: p.sprints && p.sprints.length > 0 ? p.sprints : [{ id: 'sp_default', name: 'Sprint 1', status: 'active', createdAt: Date.now() }],
                        activeSprintId: p.activeSprintId || p.sprints?.[0]?.id || 'sp_default'
                    }));
                }
            } catch (e) { this.state = initialState; }
        } else {
            this.state = initialState;
        }
    }

    getState() { return this.state; }

    saveState() {
        const stateString = JSON.stringify(this.state);
        localStorage.setItem(this.storageKey, stateString);
        this.notifyListeners();
        this.swarmChannel.postMessage({ type: 'STATE_SYNC', payload: stateString });
    }

    async dispatch(action) {
        this.state = await asyncReducer(this.state, action);
        this.saveState();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    }
    
    notifyListeners() { this.listeners.forEach(listener => listener()); }

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
        if (globalUser && (globalUser.globalRole === 'ecosystem-owner' || globalUser.globalRole === 'ai-agent')) return true;
        
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return false;
        if (p.ownerId === userId) return true; 
        
        const gov = p.governance || { workOrderCreation: 'open' };
        if (gov.workOrderCreation === 'open') return true;
        if (gov.workOrderCreation === 'po_only') return false;
        if (gov.workOrderCreation === 'custom') {
            const member = p.usuarios?.find(x => x.id === userId);
            return member?.permissions?.canCreateWO === true;
        }
        return false;
    }

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
                userId: entry.userId, roleId: entry.roleId, totalValue: entry.totalValue, 
                slices: entry.totalValue, percentage: (percentage * 100).toFixed(2), financialValue: (percentage * totalValuation) 
            };
        }).sort((a, b) => b.totalValue - a.totalValue);
    }
}

export const store = new Store();
