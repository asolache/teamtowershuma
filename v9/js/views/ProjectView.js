// v9/js/views/ProjectView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import { KanbanRenderer } from '../components/KanbanRenderer.js'; 
import { Orchestrator } from '../core/Orchestrator.js'; 
import { KB } from '../core/kb.js';

export default class ProjectView {
    constructor() {
        document.title = "Kanban PULL | TeamTowers V9";
        this.activeProjectId = null;
        this.currentFilter = 'all'; 
        this.isProcessingAi = false; 
        
        this.pushTargetHash = null;
        this.pushTargetIsLegacy = false;
        
        this.draftedSopData = null; 
    }

    async getHtml() {
        // 🔥 ARRANQUE ASÍNCRONO DE INDEXEDDB (ANTIGRAVITY)
        await store.init();

        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const user = state.globalUsers.find(u => u.id === activeUserId);
        
        const userProjects = state.projects.filter(p => 
            state.session.role === 'ecosystem-owner' || 
            p.ownerId === activeUserId || 
            (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
        );

        let activeProjectId = localStorage.getItem('tt_active_project') || (userProjects.length > 0 ? userProjects[userProjects.length - 1].id : null);
        let project = state.projects.find(p => p.id === activeProjectId);

        if (!project) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/project')}
                    <main class="workspace" style="justify-content:center; align-items:center;">
                        <div class="glass-panel" style="text-align:center; max-width: 500px; margin: 0 auto; padding: 4rem;">
                             <div style="font-size: 5rem; margin-bottom: 1.5rem; line-height:1; opacity:0.8;">📋</div>
                             <h2 style="color:white; margin-top:0; font-weight:900; font-size:2rem;">Radar Vacío</h2>
                             <p style="color:var(--text-muted); margin-bottom: 2.5rem; font-size:1.1rem;">No hay ecosistemas activos para mostrar el Kanban.</p>
                             <a href="/v9/create" data-link class="btn-primary" style="text-decoration:none;">➕ Forjar Ecosistema</a>
                        </div>
                    </main>
                    ${BottomNav.getHtml('/project')}
                </div>
            `;
        }

        const isOpen = user?.profile?.isOpenToWork || false;
        const statusBtnClass = isOpen ? 'btn-status-open' : 'btn-status-closed';
        const statusBtnText = isOpen ? '🟢 Flujo Abierto' : '🔴 Modo Foco (DND)';

        const headerConfig = {
            title: "Mercado PULL (Kanban)",
            subtitle: project.nombre,
            tagline: "Motor de ejecución GTD. Asume la responsabilidad, valida SOCs y sella valor inmutable.",
            actionHtml: `<button id="btnToggleAvailability" class="${statusBtnClass}">${statusBtnText}</button>`,
            magicActions: [
                { id: 'ai_assign', label: 'Auto-Asignación IA (@cap_de_colla)', icon: '🤖', isAi: true, tokens: 50 }
            ]
        };

        const isPO = project.ownerId === activeUserId || state.session.role === 'ecosystem-owner';

        const sprints = project.sprints && project.sprints.length > 0 ? project.sprints : [{id: 'sp_default', name: 'Sprint 1', startDate: Date.now()}];
        const activeSprintId = project.activeSprintId || sprints[0].id;
        
        const sprintOptions = sprints.map(sp => `
            <option value="${sp.id}" ${sp.id === activeSprintId ? 'selected' : ''}>⏳ ${sp.name}</option>
        `).join('');

        const globalUsersOptions = state.globalUsers.map(u => 
            `<option value="${u.id}">${u.profile?.isAi ? '🤖' : '👤'} ${u.name} (${u.id})</option>`
        ).join('');

        return `
            <style>
                ${KanbanRenderer.getStyles()} 
                
                .workspace.is-open-to-work { box-shadow: inset 0 0 150px rgba(0, 230, 118, 0.03); }
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; box-sizing: border-box; width: 100%; background: radial-gradient(circle at center, #111116 0%, #050505 100%);}
                .kanban-page-container { width: 100%; margin: 0 auto; display: flex; flex-direction: column; }

                .btn-status-closed { background: rgba(255, 82, 82, 0.1); border: 1px solid var(--accent-red); color: var(--accent-red); padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; cursor:pointer; transition: all 0.2s;}
                .btn-status-open { background: rgba(0, 230, 118, 0.1); border: 1px solid var(--accent-green); color: var(--accent-green); padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; cursor:pointer; transition: all 0.2s; box-shadow: 0 0 15px rgba(0,230,118,0.2);}

                .controls-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; width: 100%; flex-wrap: wrap; gap: 15px;}
                .sprint-controls { display: flex; gap: 10px; align-items: center; background: rgba(0,0,0,0.5); padding: 5px; border-radius: 12px; border: 1px solid var(--glass-border);}
                .sprint-selector { background: transparent; border: none; color: var(--accent-orange); font-weight: 900; font-family: var(--font-mono); font-size: 1.1rem; padding: 10px; cursor: pointer; outline: none; }
                .sprint-selector option { background: #111; color: white; }
                .btn-add-sprint { background: transparent; border: 1px dashed var(--accent-orange); color: var(--accent-orange); padding: 8px 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.8rem;}
                .btn-add-sprint:hover { background: rgba(255, 171, 64, 0.1); }

                .filters-container { display:flex; gap: 15px; flex-wrap: wrap;}
                .filter-dropdown { background: rgba(10,10,15,0.8); border: 1px solid var(--glass-border); color: white; padding: 10px 20px; border-radius: 12px; font-family: inherit; font-size: 0.9rem; font-weight:bold; outline: none; cursor: pointer; transition: 0.3s; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);}
                .filter-dropdown:focus { border-color: var(--accent-blue); }

                /* MODAL OVERLAY (Universal) */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 4000; opacity:0; transition:opacity 0.2s;}
                .modal-overlay.active { display: flex; opacity: 1;}
                .modal-content { background: var(--bg-panel); border: 1px solid var(--glass-border); padding: 2.5rem; border-radius: 16px; width: 600px; max-width: 95%; box-shadow: 0 20px 50px rgba(0,0,0,0.8); transform: translateY(20px); transition: transform 0.3s ease-out; box-sizing: border-box; max-height: 90vh; overflow-y: auto;}
                .modal-overlay.active .modal-content { transform: translateY(0); }
                
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 5px; font-weight: bold; }
                .form-control { background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 12px; border-radius: 8px; font-family: inherit; font-size: 0.95rem; outline: none; width: 100%; transition: 0.2s; box-sizing: border-box; }
                .form-control:focus { border-color: var(--accent-blue); box-shadow: 0 0 10px rgba(0,176,255,0.1); }

                .soc-list { display: flex; flex-direction: column; gap: 10px; margin-top: 15px; }
                .soc-item { display: flex; align-items: flex-start; gap: 10px; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px solid #333; }
                .soc-item input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-green); margin-top: 2px; }
                .soc-item span { color: #ccc; font-size: 0.9rem; line-height: 1.4; }

                /* MODAL PUSH */
                .modal-push-content { background: linear-gradient(180deg, rgba(20,20,25,0.95), rgba(10,10,15,0.98)); border: 1px solid var(--accent-purple); border-top: 4px solid var(--accent-purple); padding: 2.5rem; border-radius: 20px; width: 100%; max-width: 450px; box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(224,64,251,0.2); }
                .btn-push-action { background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); color: white; border: none; padding: 15px; border-radius: 12px; font-weight: 900; font-size: 1rem; width: 100%; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 20px rgba(224,64,251,0.3);}
                .btn-push-action:hover { filter: brightness(1.2); transform: translateY(-2px);}

                /* 🔥 MODAL VNA ESTRUCTURAL */
                .vna-modal-overlay { position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); backdrop-filter:blur(5px); z-index:9000; display:none; justify-content:center; align-items:center; }
                .vna-modal-overlay.active { display:flex; }
                .vna-modal-card { background: linear-gradient(180deg, #1a1a20 0%, #0f0f15 100%); border: 1px solid var(--glass-border); border-top: 4px solid var(--accent-blue); border-radius: 16px; padding: 2rem; width: 100%; max-width: 550px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
                .vna-form-group { margin-bottom: 15px; }
                .vna-label { display:block; color:var(--accent-blue); font-size:0.75rem; font-weight:bold; text-transform:uppercase; margin-bottom:5px; }
                .vna-input { width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; border-radius: 8px; font-family: var(--font-main); box-sizing: border-box; outline: none; transition: border-color 0.3s;}
                .vna-input:focus { border-color: var(--accent-blue); }

                @media (max-width: 768px) {
                    .controls-row { flex-direction: column; align-items: stretch; }
                    .sprint-controls { justify-content: space-between; }
                    .filters-container { flex-direction: column; width: 100%; gap: 10px;}
                    .filter-dropdown { width: 100%; padding: 14px; }
                    .workspace { padding: 90px 1rem 120px 1rem; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/project')}

                <main class="workspace ${isOpen ? 'is-open-to-work' : ''}">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="kanban-page-container">
                        <div class="controls-row">
                            <div class="sprint-controls">
                                <select id="selActiveSprint" class="sprint-selector">${sprintOptions}</select>
                                ${isPO ? `<button class="btn-add-sprint" id="btnCreateSprint" title="Crear un nuevo ciclo temporal">+ Nuevo Sprint</button>` : ''}
                            </div>
                            <div class="filters-container">
                                <select id="filterDropdown" class="filter-dropdown">
                                    <option value="all">Filtros: Todas las tareas</option>
                                    <option value="mine">👤 Solo mis tareas</option>
                                    <option value="tangible">🟢 Solo Tangibles</option>
                                    <option value="intangible">🟣 Solo Intangibles</option>
                                </select>
                            </div>
                        </div>
                        
                        <div id="kanbanMountPoint"></div>
                    </div>
                </main>

                <div class="modal-overlay" id="pushModal">
                    <div class="modal-push-content">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem; border-bottom: 1px dashed #333; padding-bottom: 1rem;">
                            <h2 style="color: white; margin:0; font-weight:900; font-size: 1.3rem;">👤 Asignar Tarea (PUSH)</h2>
                            <button id="btnClosePushModal" style="background:none; border:none; color:#888; font-size:2rem; line-height:1; cursor:pointer;">&times;</button>
                        </div>
                        <p style="color:#aaa; font-size:0.9rem; margin-bottom: 1.5rem;">Selecciona un humano o agente IA de la Colla para asignar esta Work Order.</p>
                        
                        <select id="selPushTarget" class="form-control" style="font-weight:bold; margin-bottom:20px;">
                            <option value="">-- Selecciona talento --</option>
                            ${globalUsersOptions}
                        </select>

                        <button class="btn-push-action" id="btnConfirmPush">🚀 Despachar Work Order</button>
                    </div>
                </div>

                <div class="modal-overlay" id="reviewTaskModal">
                    <div class="modal-content" style="border-top-color: var(--accent-purple); background: linear-gradient(180deg, rgba(20,20,25,0.98), rgba(10,10,15,1));">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding-bottom:15px; margin-bottom:20px;">
                            <h2 style="color:white; margin:0; font-weight:900; font-size:1.5rem; letter-spacing:-1px;">Oráculo Notarial (Auditoría TDD)</h2>
                            <button id="btnCancelReviewTask" style="background:none; border:none; color:#aaa; font-size:2rem; cursor:pointer; line-height:1;">&times;</button>
                        </div>
                        
                        <div style="background: rgba(0,0,0,0.4); padding: 15px; border-radius: 12px; border-left: 3px solid var(--accent-blue); margin-bottom: 20px;">
                            <strong style="color: white; font-size: 0.8rem; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:8px;">📄 Entregable Presentado (Proof of Work):</strong>
                            <div id="reviewTaskDeliverable" style="color:#ccc; font-family:'Georgia',serif; line-height:1.5; max-height:200px; overflow-y:auto; padding-right:10px;"></div>
                        </div>

                        <div class="form-group">
                            <label style="color: var(--accent-green);">Checklist de Calidad (SOCs W3C)</label>
                            <div id="reviewSocsContainer" class="soc-list"></div>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 2rem;">
                            <button class="btn" id="btnAiAudit" style="background:linear-gradient(135deg, rgba(224,64,251,0.1), rgba(224,64,251,0.2)); border:1px solid var(--accent-purple); color:var(--accent-purple); font-weight:900; padding:14px; border-radius:12px; cursor:pointer; transition:0.3s; box-shadow: 0 5px 15px rgba(224,64,251,0.1);">🤖 Invocar Auditor IA (@notari_ledger)</button>
                            <button class="btn" id="btnConfirmReview" style="background:var(--accent-green); color:black; font-weight:900; border:none; padding:14px; border-radius:12px; cursor:pointer; box-shadow:0 5px 15px rgba(0,230,118,0.2); transition:0.3s;">✅ Sellar y Consolidar en Ledger</button>
                        </div>
                    </div>
                </div>
                
                <div class="vna-modal-overlay" id="vnaModalOverlay">
                    <div class="vna-modal-card">
                        <h3 style="color:white; margin:0 0 5px 0; font-size:1.4rem;">🕸️ Inyectar Flujo VNA</h3>
                        <p style="color:#888; font-size:0.85rem; margin-bottom:20px;">Crea una transacción formal entre dos roles para preservar la trazabilidad en el Meta-Grafo.</p>
                        
                        <div style="display:flex; gap:15px;">
                            <div class="vna-form-group" style="flex:1;">
                                <label class="vna-label">De (Origen)</label>
                                <select id="vnaFrom" class="vna-input"></select>
                            </div>
                            <div class="vna-form-group" style="flex:1;">
                                <label class="vna-label" style="color:var(--accent-purple);">Para (Destino)</label>
                                <select id="vnaTo" class="vna-input"></select>
                            </div>
                        </div>

                        <div class="vna-form-group">
                            <label class="vna-label" style="color:white;">Entregable (Proof of Work)</label>
                            <input type="text" id="vnaTitle" class="vna-input" placeholder="Ej: Componente Header React">
                        </div>

                        <div style="display:flex; gap:15px;">
                            <div class="vna-form-group" style="flex:1;">
                                <label class="vna-label" style="color:white;">Tipo</label>
                                <select id="vnaType" class="vna-input">
                                    <option value="tangible">Tangible (Código, Diseño)</option>
                                    <option value="intangible">Intangible (Decisión, QA)</option>
                                </select>
                            </div>
                            <div class="vna-form-group" style="flex:1;">
                                <label class="vna-label" style="color:white;">Horas Est.</label>
                                <input type="number" id="vnaHours" class="vna-input" value="1" step="0.5" min="0.1">
                            </div>
                        </div>

                        <div class="vna-form-group">
                            <label class="vna-label" style="color:white;">Contexto / Descripción</label>
                            <textarea id="vnaDesc" class="vna-input" style="min-height:80px; resize:vertical;"></textarea>
                        </div>

                        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
                            <button id="vnaCancel" style="background:transparent; border:1px solid #666; color:white; padding:10px 15px; border-radius:8px; cursor:pointer; font-weight:bold;">Cancelar</button>
                            <button id="vnaConfirm" style="background:linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); border:none; color:white; padding:10px 20px; border-radius:8px; font-weight:900; cursor:pointer; box-shadow: 0 5px 15px rgba(0,176,255,0.3);">💾 Sellar en Matriz</button>
                        </div>
                    </div>
                </div>

                ${BottomNav.getHtml('/project')}
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute(); 

        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        
        if (!project) return;
        this.activeProjectId = project.id;
        this.isPO = project.ownerId === activeUserId || state.session.role === 'ecosystem-owner';

        const mountPoint = document.getElementById('kanbanMountPoint');
        if (mountPoint) {
            this.kanbanRenderer = new KanbanRenderer(mountPoint, {
                project: project,
                activeUserId: activeUserId,
                isPO: this.isPO,
                currentFilter: this.currentFilter,
                isMacroMode: false 
            });
            this.kanbanRenderer.render();
        }

        const filterDropdown = document.getElementById('filterDropdown');
        if (filterDropdown) {
            filterDropdown.value = this.currentFilter;
            filterDropdown.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.kanbanRenderer.options.currentFilter = this.currentFilter;
                this.refreshRenderer();
            });
        }

        const pushModal = document.getElementById('pushModal');
        document.getElementById('btnClosePushModal')?.addEventListener('click', () => {
            pushModal.classList.remove('active');
            this.pushTargetHash = null;
        });

        document.getElementById('btnConfirmPush')?.addEventListener('click', async () => {
            const targetUserId = document.getElementById('selPushTarget').value;
            if(!targetUserId) return alert("Selecciona un humano o agente IA destino.");
            
            const btn = document.getElementById('btnConfirmPush');
            btn.disabled = true; btn.innerText = "⏳ Asignando...";

            const currentProj = store.getState().projects.find(p => p.id === this.activeProjectId);
            const wList = this.pushTargetIsLegacy ? (currentProj.transactions || []) : (currentProj.work_orders || []);
            const wItem = wList.find(w => (w.hash || w.id) === this.pushTargetHash) || {};
            const safeSprintId = wItem.sprintId || currentProj.activeSprintId;

            const updatedList = wList.map(w => {
                if ((w.hash || w.id) === this.pushTargetHash) {
                    return { ...w, status: 'pinged', assigneeId: targetUserId, sprintId: safeSprintId }; 
                }
                return w;
            });

            await store.dispatch({ 
                type: 'UPDATE_PROJECT_INFO', 
                payload: { projectId: this.activeProjectId, updates: { [this.pushTargetIsLegacy ? 'transactions' : 'work_orders']: updatedList } } 
            });

            btn.disabled = false; btn.innerText = "🚀 Despachar Work Order";
            pushModal.classList.remove('active');
            this.refreshRenderer();
        });

        // 🔥 MAGIA A2A: Auto-Asignación Inteligente (@cap_de_colla)
        window.addEventListener('ph-magic-action', async (e) => {
            if(e.detail.actionId === 'ai_assign') {
                const currentProj = store.getState().projects.find(p => p.id === this.activeProjectId);
                const freeTasks = (currentProj.work_orders || []).filter(w => w.status === 'theoretical' || !w.status);
                
                if (freeTasks.length === 0) return alert("No hay Work Orders libres en la columna de Oportunidades.");

                const btnMagic = document.getElementById('btnMagicDropdown');
                const originalText = btnMagic.innerHTML;
                btnMagic.innerHTML = "🧠 Orquestando Kanban...";
                btnMagic.style.pointerEvents = 'none';

                try {
                    let provider = localStorage.getItem('tt_ai_provider') || 'openai';
                    let apiKey = localStorage.getItem(`tt_key_${provider}`);
                    if (!apiKey) throw new Error("Configura una API Key en el Panteón para usar la auto-asignación (DeepSeek u OpenAI).");

                    const availableAgents = store.getState().globalUsers.map(u => ({ id: u.id, name: u.name, isAi: u.profile?.isAi }));
                    const rolesMap = currentProj.roles.map(r => ({ id: r.id, levelId: r.levelId, name: r.name }));
                    
                    const tasksToAssign = freeTasks.map(t => {
                        const flow = (currentProj.vna_flows || []).find(f => f.id === t.flowId);
                        const role = flow ? rolesMap.find(r => r.id === flow.to) : null;
                        return { hash: t.hash, title: flow ? flow.template : t.comentario?.substring(0,30), requiredRole: role ? role.levelId : 'Cualquier Nodo' };
                    });

                    const systemPrompt = `
                        Eres @cap_de_colla, el Orquestador Manager del Kanban.
                        Empareja las Tareas Libres con los Nodos Disponibles buscando eficiencia.
                        Nodos Disponibles: ${JSON.stringify(availableAgents)}
                        Devuelve ÚNICAMENTE UN JSON PURO con este formato: { "assignments": [ { "hash": "id_tarea", "assigneeId": "id_del_nodo" } ] }
                    `;

                    const response = await Orchestrator.callLLM({ 
                        provider, apiKey, systemPrompt, 
                        userPrompt: `Asigna estas tareas: ${JSON.stringify(tasksToAssign)}`, 
                        responseFormat: "json_object", temperature: 0.1 
                    });

                    const assignments = response.content.assignments || [];
                    let updatedList = [...currentProj.work_orders];
                    let assignmentsCount = 0;

                    assignments.forEach(assignment => {
                        const idx = updatedList.findIndex(w => w.hash === assignment.hash);
                        if (idx > -1 && assignment.assigneeId) {
                            updatedList[idx] = { ...updatedList[idx], status: 'pinged', assigneeId: assignment.assigneeId };
                            assignmentsCount++;
                        }
                    });

                    await store.dispatch({
                        type: 'UPDATE_PROJECT_INFO',
                        payload: { projectId: this.activeProjectId, updates: { work_orders: updatedList } }
                    });

                    alert(`✅ @cap_de_colla ha orquestado y asignado ${assignmentsCount} tareas con éxito.`);
                    this.refreshRenderer();

                } catch (error) {
                    alert("Fallo en la orquestación: " + error.message);
                } finally {
                    btnMagic.innerHTML = originalText;
                    btnMagic.style.pointerEvents = 'auto';
                }
            }
        });

        // 🔥 LISTENERS DE EVENTOS KANBAN
        window.addEventListener('kanban-action', async (e) => {
            const { action, hash, isLegacy, userId, agentId, element } = e.detail;
            
            const currentProj = store.getState().projects.find(p => p.id === this.activeProjectId);
            const wList = isLegacy ? (currentProj.transactions || []) : (currentProj.work_orders || []);

            if (action === 'force-pull') {
                const updatedList = wList.map(w => {
                    if ((w.hash || w.id) === hash) return { ...w, status: 'pinged', assigneeId: userId, sprintId: w.sprintId || currentProj.activeSprintId }; 
                    return w;
                });
                await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: this.activeProjectId, updates: { [isLegacy ? 'transactions' : 'work_orders']: updatedList } } });
                this.refreshRenderer();
                return;
            }

            if (action === 'open-push-modal') {
                if (!this.isPO) return alert("Solo el Architect (PO) puede realizar PUSH.");
                this.pushTargetHash = hash;
                this.pushTargetIsLegacy = isLegacy;
                pushModal.classList.add('active');
                return;
            }

            if (action === 'reject') {
                if(!confirm("⚠️ ¿Estás seguro de soltar esta tarea y devolverla a la columna Oportunidades? Perderás el PULL.")) return;
                
                const updatedList = wList.map(w => {
                    if ((w.hash || w.id) === hash) return { ...w, status: 'theoretical', assigneeId: null, sprintId: w.sprintId || currentProj.activeSprintId }; 
                    return w;
                });
                await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: this.activeProjectId, updates: { [isLegacy ? 'transactions' : 'work_orders']: updatedList } } });
                this.refreshRenderer();
                return;
            }

            if (action === 'review') {
                this.openReviewModal(hash);
                return;
            }

            if (action === 'ai-exec') {
                await this.executeAIAgent(hash, element, currentProj, isLegacy);
                return;
            }
        });

        const selActiveSprint = document.getElementById('selActiveSprint');
        if (selActiveSprint) {
            selActiveSprint.addEventListener('change', async (e) => {
                await store.dispatch({ type: 'SET_ACTIVE_SPRINT', payload: { projectId: this.activeProjectId, sprintId: e.target.value } });
                this.refreshRenderer();
            });
        }

        const btnCreateSprint = document.getElementById('btnCreateSprint');
        if (btnCreateSprint) {
            btnCreateSprint.addEventListener('click', async () => {
                const currentP = store.getState().projects.find(p => p.id === this.activeProjectId);
                const currentSprints = currentP.sprints && currentP.sprints.length > 0 ? currentP.sprints : [{id: 'sp_default', name: 'Sprint 1', startDate: Date.now()}];
                const nextNum = currentSprints.length + 1;
                const spName = prompt("Nombre del nuevo ciclo de aceleración (Sprint):", `Sprint ${nextNum}`);
                
                if (spName) {
                    const newSprintId = 'sp_' + Date.now();
                    const newSprints = [...currentSprints, { id: newSprintId, name: spName, startDate: Date.now() }];
                    
                    await store.dispatch({ 
                        type: 'UPDATE_PROJECT_INFO', 
                        payload: { projectId: this.activeProjectId, updates: { sprints: newSprints, activeSprintId: newSprintId } } 
                    });
                    window.location.reload(); 
                }
            });
        }

        this.setupReviewModal();

        // 🔥 LÓGICA DEL MODAL ESTRUCTURAL VNA
        const vnaOverlay = document.getElementById('vnaModalOverlay');
        const vnaFrom = document.getElementById('vnaFrom');
        const vnaTo = document.getElementById('vnaTo');
        const vnaTitle = document.getElementById('vnaTitle');
        const vnaType = document.getElementById('vnaType');
        const vnaHours = document.getElementById('vnaHours');
        const vnaDesc = document.getElementById('vnaDesc');
        
        window.addEventListener('open-create-wo-modal', () => {
            const currentProj = store.getState().projects.find(p => p.id === this.activeProjectId);
            const rolesHtml = (currentProj.roles || []).map(r => `<option value="${r.id}">${r.levelId} - ${r.name}</option>`).join('');
            vnaFrom.innerHTML = rolesHtml;
            vnaTo.innerHTML = rolesHtml;
            
            vnaTitle.value = '';
            vnaDesc.value = '';
            vnaHours.value = '1';
            
            vnaOverlay.classList.add('active');
        });

        document.getElementById('vnaCancel')?.addEventListener('click', () => {
            vnaOverlay.classList.remove('active');
        });

        document.getElementById('vnaConfirm')?.addEventListener('click', async () => {
            const title = vnaTitle.value.trim();
            if (!title) return alert('El entregable es obligatorio.');

            const btnConfirm = document.getElementById('vnaConfirm');
            btnConfirm.disabled = true;
            btnConfirm.innerText = "⏳...";

            const currentProj = store.getState().projects.find(p => p.id === this.activeProjectId);

            // 1. Crear el Flujo VNA (Transacción Estructural)
            const newFlowId = 'flow_' + Date.now();
            const newFlow = {
                id: newFlowId,
                from: vnaFrom.value,
                to: vnaTo.value,
                tipo: vnaType.value,
                entregable: title,
                context: vnaDesc.value.trim(),
                horas: parseFloat(vnaHours.value) || 1,
                soc_checklist: [] 
            };

            // 2. Crear la Work Order instanciada de este Flujo
            const newWO = {
                hash: 'wo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                flowId: newFlowId,
                status: 'theoretical',
                comentario: vnaDesc.value.trim() || 'Work Order inyectada en matriz.',
                sprintId: currentProj.activeSprintId || null,
                assigneeId: null,
                workerId: null
            };

            const updatedFlows = [...(currentProj.vna_flows || []), newFlow];
            const updatedWOs = [...(currentProj.work_orders || []), newWO];

            await store.dispatch({ 
                type: 'UPDATE_PROJECT_INFO', 
                payload: { 
                    projectId: currentProj.id, 
                    updates: { 
                        vna_flows: updatedFlows,
                        work_orders: updatedWOs
                    } 
                } 
            });
            
            vnaOverlay.classList.remove('active');
            window.location.reload();
        });
    }

    refreshRenderer() {
        if (!this.kanbanRenderer) return;
        this.kanbanRenderer.options.project = store.getState().projects.find(p => p.id === this.activeProjectId);
        this.kanbanRenderer.render();
    }

    async executeAIAgent(txHash, btnElement, currProject, isLegacy) {
        if (this.isProcessingAi) return alert("Un Agente A2A ya está trabajando en una Work Order. Espera tu turno.");
        this.isProcessingAi = true;
        
        const card = btnElement.closest('.task-card');
        if(card) card.classList.add('ai-processing');
        btnElement.innerText = "⏳ Computando...";
        
        try {
            const flows = isLegacy ? (currProject.transactions||[]) : (currProject.work_orders||[]);
            const wo = flows.find(w => (w.hash || w.id) === txHash);
            const parentFlow = (currProject.vna_flows || []).find(f => f.id === wo.flowId) || wo; 
            
            let provider = localStorage.getItem('tt_ai_provider') || 'openai';
            let apiKey = localStorage.getItem(`tt_key_${provider}`);
            
            if (!apiKey && provider !== 'custom') throw new Error("Configura tu API Key (DeepSeek/OpenAI/Gemini) en el Panteón para ejecutar agentes.");

            await KB.init();
            const aiContext = await KB.getDynamicContextPrompt(this.activeProjectId, wo.assigneeId, store.getState());

            const userPrompt = `
                TAREA A EJECUTAR: ${parentFlow.template || parentFlow.entregable}
                CONTEXTO: ${wo.comentario || 'Ninguno.'}
                SOCs A CUMPLIR (Crítico): ${JSON.stringify((wo.soc_checklist || []).map(s => s.text))}
                Redacta el entregable final. Sé técnico, breve y cumple los SOCs.
            `;

            const response = await Orchestrator.callLLM({
                provider, apiKey, systemPrompt: aiContext, userPrompt, responseFormat: "text", temperature: 0.3
            });

            const updatedList = flows.map(w => {
                if ((w.hash || w.id) === txHash) {
                    const hrs = parseFloat(parentFlow.estimatedHours) || parseFloat(parentFlow.horas) || 1;
                    return { ...w, status: 'reported', realHours: hrs, proofLink: 'Agent_Auto_Report', comentario: response.content, sprintId: w.sprintId || currProject.activeSprintId };
                }
                return w;
            });

            await store.dispatch({
                type: 'UPDATE_PROJECT_INFO',
                payload: { projectId: currProject.id, updates: { [isLegacy ? 'transactions' : 'work_orders']: updatedList } }
            });

        } catch (error) {
            alert(`Fallo en la ejecución de la IA: ${error.message}`);
        } finally {
            this.isProcessingAi = false;
            this.refreshRenderer();
        }
    }

    setupReviewModal() {
        const reviewModal = document.getElementById('reviewTaskModal');
        let currentReviewHash = null;

        this.openReviewModal = (hash) => {
            currentReviewHash = hash;
            const currProject = store.getState().projects.find(p => p.id === this.activeProjectId);
            
            let taskRef = (currProject.work_orders || []).find(w => w.hash === hash);
            if (!taskRef) taskRef = (currProject.transactions || []).find(t => t.id === hash);
            if(!taskRef) return;

            const isLegacy = !taskRef.flowId;
            const flowRef = isLegacy ? taskRef : (currProject.vna_flows || []).find(f => f.id === taskRef.flowId);
            
            const hoursReal = parseFloat(taskRef.realHours) || 0;
            const hoursEst = parseFloat(flowRef?.estimatedHours) || parseFloat(flowRef?.horas) || 1;

            let reportHtml = `
                <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px dashed #333; padding-bottom:10px;">
                    <div><span style="color:#888;">⏱ Tiempo Inyectado:</span> <span style="color:var(--accent-orange); font-family:var(--font-mono); font-weight:bold;">${hoursReal}h</span> <span style="color:#555; font-size:0.8rem;">(Est: ${hoursEst}h)</span></div>
                </div>
            `;

            if (taskRef.proofLink && taskRef.proofLink !== 'Agent_Auto_Report' && taskRef.proofLink !== 'Manual_Submission') {
                reportHtml += `<div style="margin-bottom:10px;"><a href="${taskRef.proofLink}" target="_blank" style="color:var(--accent-blue); font-weight:bold; text-decoration:none;">🔗 Abrir Enlace de Evidencia Externa</a></div>`;
            }

            reportHtml += (taskRef.comentario || 'Sin evidencia redactada.').replace(/\n/g, '<br>');
            document.getElementById('reviewTaskDeliverable').innerHTML = reportHtml;
            
            const socsContainer = document.getElementById('reviewSocsContainer');
            if (taskRef.soc_checklist && taskRef.soc_checklist.length > 0) {
                socsContainer.innerHTML = taskRef.soc_checklist.map(soc => `
                    <label class="soc-item">
                        <input type="checkbox" class="soc-checkbox" data-socid="${soc.id}" ${soc.isChecked ? 'checked' : ''}>
                        <span>${soc.text}</span>
                    </label>
                `).join('');
            } else {
                socsContainer.innerHTML = `<div style="color:#888; font-style:italic;">No hay Criterios (SOCs) definidos. Revisa el contenido y aprueba.</div>`;
            }

            reviewModal.classList.add('active'); 
        };

        document.getElementById('btnCancelReviewTask')?.addEventListener('click', () => {
            reviewModal.classList.remove('active');
            currentReviewHash = null;
        });

        document.getElementById('btnAiAudit')?.addEventListener('click', async (e) => {
            if (!currentReviewHash) return;
            const btn = e.target;
            btn.innerText = "🧠 Notario evaluando SOCs...";
            btn.disabled = true;
            
            const currProject = store.getState().projects.find(p => p.id === this.activeProjectId);
            let taskRef = (currProject.work_orders || []).find(w => w.hash === currentReviewHash);
            if (!taskRef) taskRef = (currProject.transactions || []).find(t => t.id === currentReviewHash);

            try {
                const auditResultJSON = await Orchestrator.notarizeWorkOrder(this.activeProjectId, taskRef.comentario, taskRef.soc_checklist);
                const parsedAudit = JSON.parse(auditResultJSON);
                
                let allPassed = true;
                document.querySelectorAll('.soc-checkbox').forEach(cb => {
                    const socId = cb.getAttribute('data-socid');
                    if (parsedAudit[socId] !== undefined) {
                        cb.checked = parsedAudit[socId];
                        if (!parsedAudit[socId]) allPassed = false;
                    }
                });

                if (allPassed) alert("✅ @notari_ledger confirma: Todos los SOCs se cumplen.");
                else alert("⚠️ @notari_ledger advierte: Faltan criterios por cumplir.");

            } catch (err) {
                alert("Fallo al contactar con el Oráculo IA. Evalúa manualmente.");
            } finally {
                btn.innerText = "🤖 Invocar Auditor IA (@notari_ledger)";
                btn.disabled = false;
            }
        });

        document.getElementById('btnConfirmReview')?.addEventListener('click', async () => {
            if (!currentReviewHash) return;
            
            const socValidation = {};
            let allChecked = true;
            document.querySelectorAll('.soc-checkbox').forEach(cb => {
                socValidation[cb.getAttribute('data-socid')] = cb.checked;
                if (!cb.checked) allChecked = false;
            });

            if (!allChecked) {
                const reject = confirm("⚠️ Hay SOCs sin marcar. Si continúas, la Work Order será RECHAZADA y devuelta al ejecutor sin minar Slices. ¿Deseas rechazar la tarea?");
                if (!reject) return; 
            }

            const currProject = store.getState().projects.find(p => p.id === this.activeProjectId);
            const isLegacy = !(currProject.work_orders || []).find(w => w.hash === currentReviewHash);
            
            if (!isLegacy) {
                await store.dispatch({
                    type: 'REVIEW_WORK_ORDER',
                    payload: { projectId: this.activeProjectId, woHash: currentReviewHash, auditorId: store.getState().session.activeUserId, socValidation }
                });
                await store.dispatch({
                    type: 'APPROVE_WORK_ORDER',
                    payload: { projectId: this.activeProjectId, woHash: currentReviewHash }
                });
            } else {
                const updatedList = currProject.transactions.map(w => {
                    if (w.id === currentReviewHash) return { ...w, status: 'consolidated' };
                    return w;
                });
                await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: this.activeProjectId, updates: { transactions: updatedList } } });
            }

            const updatedProj = store.getState().projects.find(p => p.id === this.activeProjectId);
            const updatedTask = isLegacy ? updatedProj.transactions.find(t => t.id === currentReviewHash) : updatedProj.work_orders.find(w => w.hash === currentReviewHash);

            if (updatedTask.status === 'reported') {
                alert("❌ Tarea devuelta: Criterios SOC no superados. El ejecutor debe iterar (TDD).");
            } else {
                reviewModal.classList.remove('active');
                currentReviewHash = null;
                
                // 🔥 LANZAR EL FEEDBACK LOOP EN SEGUNDO PLANO
                Orchestrator.harvestKnowledge(updatedTask, this.activeProjectId).then(learnedTitle => {
                    if (learnedTitle) console.log(`[Antigravity] Cosecha de Janitor completada: ${learnedTitle}`);
                });
            }
            
            this.refreshRenderer();
        });
    }
}
