// v8/js/views/ProjectView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import { KanbanRenderer } from '../components/KanbanRenderer.js'; // 🔥 Magia DRY
import { Orchestrator } from '../core/Orchestrator.js'; // Para la ejecución de IA
import { KB } from '../core/kb.js';

export default class ProjectView {
    constructor() {
        document.title = "Kanban PULL | TeamTowers V14";
        this.activeProjectId = null;
        this.currentFilter = 'all'; 
        this.isProcessingAi = false; 
    }

    async getHtml() {
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
                        <div class="glass-panel" style="text-align:center; max-width: 500px; margin: 0 auto;">
                             <div style="font-size: 5rem; margin-bottom: 1.5rem; line-height:1;">📋</div>
                             <h2 style="color:white; margin-top:0;">Radar Vacío</h2>
                             <p style="color:var(--text-muted); margin-bottom: 2.5rem;">No hay redes activas para mostrar el Kanban.</p>
                             <a href="/v8/create" data-link class="btn-primary" style="text-decoration:none;">➕ Inicializar Red</a>
                        </div>
                    </main>
                    ${BottomNav.getHtml('/project')}
                </div>
            `;
        }

        const isOpen = user?.profile?.isOpenToWork || false;
        const statusBtnClass = isOpen ? 'btn-status-open' : 'btn-status-closed';
        const statusBtnText = isOpen ? '🟢 Abierto a Flow' : '🔴 Modo Oculto';

        const headerConfig = {
            title: "Kanban PULL",
            subtitle: project.nombre,
            tagline: "Mercado interno de tareas. Asume responsabilidad, valida SOCs y ejecuta valor.",
            actionHtml: `<button id="btnToggleAvailability" class="${statusBtnClass}">${statusBtnText}</button>`,
            magicActions: [
                { id: 'ai_assign', label: 'Auto-Asignación IA', icon: '🤖', isAi: true, tokens: 50 }
            ]
        };

        const canCreateWO = store.canUserCreateWorkOrder(project.id, activeUserId);
        const isPO = project.ownerId === activeUserId || state.session.role === 'ecosystem-owner';

        const sprints = project.sprints || [{id: 'sp_default', name: 'Sprint 1'}];
        const activeSprintId = project.activeSprintId || sprints[0].id;
        
        const sprintOptions = sprints.map(sp => `
            <option value="${sp.id}" ${sp.id === activeSprintId ? 'selected' : ''}>⏳ ${sp.name}</option>
        `).join('');

        return `
            <style>
                ${KanbanRenderer.getStyles()} /* Inyectamos el CSS universal del Kanban */
                
                .workspace.is-open-to-work { box-shadow: inset 0 0 150px rgba(0, 230, 118, 0.03); }
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; box-sizing: border-box; width: 100%;}
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

                .btn-create-task { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 10px 24px; border-radius: 12px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content:center; gap: 8px; white-space:nowrap; box-shadow: 0 5px 15px rgba(0,176,255,0.2); transition: 0.3s;}
                .btn-create-task:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(224,64,251,0.4); filter: brightness(1.1);}

                /* MODAL OVERLAY */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 4000; }
                .modal-content { background: var(--bg-panel); border: 1px solid var(--glass-border); padding: 2.5rem; border-radius: 16px; width: 550px; max-width: 95%; box-shadow: 0 20px 50px rgba(0,0,0,0.8); animation: slideUp 0.3s ease-out; box-sizing: border-box; max-height: 90vh; overflow-y: auto;}
                
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 5px; font-weight: bold; }
                .form-control { background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 12px; border-radius: 8px; font-family: inherit; font-size: 0.95rem; outline: none; width: 100%; transition: 0.2s; box-sizing: border-box; }
                .form-control:focus { border-color: var(--accent-blue); }

                .soc-list { display: flex; flex-direction: column; gap: 10px; margin-top: 15px; }
                .soc-item { display: flex; align-items: flex-start; gap: 10px; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px solid #333; }
                .soc-item input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-green); margin-top: 2px; }
                .soc-item span { color: #ccc; font-size: 0.9rem; line-height: 1.4; }

                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .controls-row { flex-direction: column; align-items: stretch; }
                    .sprint-controls { justify-content: space-between; }
                    .filters-container { flex-direction: column; width: 100%; gap: 10px;}
                    .filter-dropdown, .btn-create-task { width: 100%; padding: 14px; }
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
                                ${isPO ? `<button class="btn-add-sprint" id="btnCreateSprint" title="Crear un nuevo ciclo temporal">+ Nuevo</button>` : ''}
                            </div>
                            <div class="filters-container">
                                <select id="filterDropdown" class="filter-dropdown">
                                    <option value="all">Filtros: Todas las tareas</option>
                                    <option value="mine">👤 Solo mis tareas</option>
                                    <option value="tangible">🟢 Solo Tangibles</option>
                                    <option value="intangible">🟣 Solo Intangibles</option>
                                </select>
                                ${canCreateWO ? `<button class="btn-create-task" id="btnOpenCreateTask">➕ Generar Work Order</button>` : ''}
                            </div>
                        </div>
                        
                        <div id="kanbanMountPoint"></div>
                    </div>
                </main>

                <div class="modal-overlay" id="createTaskModal">
                    <div class="modal-content">
                        <h2 style="color:white; margin-top:0; margin-bottom: 5px; font-weight:900; font-size:1.8rem; letter-spacing:-1px;">Abrir el Grifo</h2>
                        <p style="color:#aaa; font-size:0.95rem; margin-bottom:2rem; line-height:1.5;">Instancia una receta (SOP) a partir de las tuberías permanentes del Mapa VNA.</p>
                        
                        <div class="form-group">
                            <label>Tubería de Valor Origen (Flow)</label>
                            <select id="newTaskFlowId" class="form-control" style="background: rgba(0, 176, 255, 0.05); border-color: var(--accent-blue); font-weight:bold; color:var(--accent-blue);"></select>
                        </div>
                        <div class="form-group">
                            <label>Contexto / Instrucciones</label>
                            <textarea id="newTaskDesc" class="form-control" rows="3" placeholder="Especificaciones, enlaces a repositorios..."></textarea>
                        </div>
                        <div class="form-group" style="margin-top: 20px; border-top: 1px dashed #333; padding-top: 20px;">
                            <label style="color:var(--accent-orange);">Asignar Directamente (Opcional)</label>
                            <select id="newTaskAssignee" class="form-control" style="border-color:#555;">
                                <option value="">-- Dejar Libre en "Oportunidades" --</option>
                            </select>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 2.5rem; gap:15px;">
                            <button class="btn" style="flex:1; background:transparent; border:1px solid #555; color:white; padding:14px; border-radius:12px; cursor:pointer; font-weight:bold;" id="btnCancelCreateTask">Cancelar</button>
                            <button class="btn" style="flex:2; background:linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color:white; font-weight:900; border:none; padding:14px; border-radius:12px; cursor:pointer;" id="btnConfirmCreateTask">🚀 Inyectar al Sprint</button>
                        </div>
                    </div>
                </div>

                <div class="modal-overlay" id="reviewTaskModal">
                    <div class="modal-content" style="border-top-color: var(--accent-purple);">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding-bottom:15px; margin-bottom:20px;">
                            <h2 style="color:white; margin:0; font-weight:900; font-size:1.5rem; letter-spacing:-1px;">Oráculo Notarial (Auditoría SOC)</h2>
                            <button id="btnCancelReviewTask" style="background:none; border:none; color:#aaa; font-size:2rem; cursor:pointer; line-height:1;">&times;</button>
                        </div>
                        
                        <div style="background: rgba(0,0,0,0.4); padding: 15px; border-radius: 12px; border-left: 3px solid var(--accent-blue); margin-bottom: 20px;">
                            <strong style="color: white; font-size: 0.8rem; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:8px;">📄 Entregable Presentado:</strong>
                            <div id="reviewTaskDeliverable" style="color:#ccc; font-style:italic; line-height:1.5; max-height:100px; overflow-y:auto;"></div>
                        </div>

                        <div class="form-group">
                            <label style="color: var(--accent-green);">Checklist de Conducta y Calidad (SOCs)</label>
                            <div id="reviewSocsContainer" class="soc-list"></div>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 2rem;">
                            <button class="btn" id="btnAiAudit" style="background:linear-gradient(135deg, rgba(224,64,251,0.1), rgba(224,64,251,0.2)); border:1px solid var(--accent-purple); color:var(--accent-purple); font-weight:900; padding:14px; border-radius:12px; cursor:pointer; transition:0.3s;">🤖 Invocar Auditor IA (@notari_ledger)</button>
                            <button class="btn" id="btnConfirmReview" style="background:var(--accent-green); color:black; font-weight:900; border:none; padding:14px; border-radius:12px; cursor:pointer; box-shadow:0 5px 15px rgba(0,230,118,0.2); transition:0.3s;">✅ Sellar y Consolidar en Ledger</button>
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

        // 🔥 MONTAJE DEL COMPONENTE KANBAN DRY
        const mountPoint = document.getElementById('kanbanMountPoint');
        if (mountPoint) {
            this.kanbanRenderer = new KanbanRenderer(mountPoint, {
                project: project,
                activeUserId: activeUserId,
                isPO: this.isPO,
                currentFilter: this.currentFilter,
                isMacroMode: false // 3 columnas completas
            });
            this.kanbanRenderer.render();
        }

        // Listener del CustomEvent que dispara el componente Kanban
        window.addEventListener('kanban-action', async (e) => {
            const { action, hash, isLegacy, userId, agentId, element } = e.detail;
            
            if (action === 'request') {
                const actType = isLegacy ? 'REQUEST_TRANSACTION' : 'REQUEST_WORK_ORDER';
                await store.dispatch({ type: actType, payload: isLegacy ? { projectId: project.id, txHash: hash, userId: activeUserId } : { projectId: project.id, woHash: hash, userId: activeUserId } });
                this.refreshRenderer();
            } else if (action === 'push') {
                if (!this.isPO) return alert("Solo el PO puede delegar.");
                const targetUserId = prompt(`Introduce el ID del usuario al que asignarás esta tarea:`);
                if (targetUserId) {
                    const actType = isLegacy ? 'PING_TRANSACTION' : 'PING_WORK_ORDER';
                    await store.dispatch({ type: actType, payload: isLegacy ? { projectId: project.id, txHash: hash, userId: targetUserId } : { projectId: project.id, woHash: hash, userId: targetUserId } });
                    this.refreshRenderer();
                }
            } else if (action === 'approve-pull') {
                const actType = isLegacy ? 'PING_TRANSACTION' : 'PING_WORK_ORDER';
                await store.dispatch({ type: actType, payload: isLegacy ? { projectId: project.id, txHash: hash, userId } : { projectId: project.id, woHash: hash, userId } });
                this.refreshRenderer();
            } else if (action === 'ai-exec') {
                await this.executeAIAgent(hash, element, store.getState().projects.find(p => p.id === this.activeProjectId));
            } else if (action === 'review') {
                this.openReviewModal(hash);
            }
        });

        window.addEventListener('swarm_update', () => this.refreshRenderer());

        // FILTROS Y SPRINTS
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
                const nextNum = (currentP.sprints?.length || 0) + 1;
                const spName = prompt("Nombre del nuevo ciclo temporal:", `Sprint ${nextNum}`);
                if (spName) {
                    await store.dispatch({ type: 'CREATE_SPRINT', payload: { projectId: this.activeProjectId, name: spName } });
                    window.location.reload(); 
                }
            });
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

        // CREACIÓN WO
        this.setupCreationModal();
        
        // REVISIÓN WO
        this.setupReviewModal();
    }

    refreshRenderer() {
        if (!this.kanbanRenderer) return;
        this.kanbanRenderer.options.project = store.getState().projects.find(p => p.id === this.activeProjectId);
        this.kanbanRenderer.render();
    }

    // ==========================================
    // EJECUCIÓN DE IA (MOTOR ORCHESTRATOR)
    // ==========================================
    async executeAIAgent(txHash, btnElement, currProject) {
        if (this.isProcessingAi) return alert("Un Agente ya está trabajando en una Work Order. Espera.");
        this.isProcessingAi = true;
        
        const card = btnElement.closest('.task-card');
        if(card) card.classList.add('ai-processing');
        btnElement.innerText = "⏳ Orquestando...";
        
        try {
            const wo = currProject.work_orders.find(w => w.hash === txHash);
            const flow = currProject.vna_flows.find(f => f.id === wo.flowId);
            
            const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
            const apiKey = localStorage.getItem(`tt_key_${provider}`);
            if (!apiKey && provider !== 'custom') throw new Error("Configura tu API Key para ejecutar agentes.");

            await KB.init();
            const customPrompt = await KB.getNode(`prompt_${currProject.id}_${flow.from}`);
            const systemPrompt = customPrompt ? customPrompt.content : `Eres el agente ejecutor de la tarea: ${flow.template}. Haz el trabajo solicitado de la forma más profesional posible.`;

            const userPrompt = `
                TAREA A EJECUTAR: ${flow.template}
                CONTEXTO: ${wo.comentario || 'Ninguno adicional.'}
                SOCs A CUMPLIR (Crítico): ${JSON.stringify(wo.soc_checklist.map(s => s.text))}
                
                Redacta el entregable final. Sé breve, directo y asegúrate de cumplir con los SOCs para aprobar la auditoría.
            `;

            const response = await Orchestrator.callLLM({
                provider, apiKey, systemPrompt, userPrompt, responseFormat: "text", temperature: 0.3
            });

            await store.dispatch({ 
                type: 'REPORT_WORK_ORDER', 
                payload: { 
                    projectId: currProject.id, 
                    woHash: txHash, 
                    realHours: flow.estimatedHours || 2, 
                    comentario: response.content, 
                    proofLink: 'Agent_Auto_Report' 
                } 
            });

        } catch (error) {
            alert(`Fallo en la ejecución de la IA: ${error.message}`);
        } finally {
            this.isProcessingAi = false;
            this.refreshRenderer();
        }
    }

    setupCreationModal() {
        const createModal = document.getElementById('createTaskModal');
        const btnOpenCreate = document.getElementById('btnOpenCreateTask');
        
        if (btnOpenCreate) {
            btnOpenCreate.addEventListener('click', () => {
                const activeProject = store.getState().projects.find(p => p.id === this.activeProjectId);
                const flows = activeProject.vna_flows || [];
                
                if (flows.length === 0) {
                    alert("Debes dibujar Tuberías en el Mapa VNA antes de poder generar tareas.");
                    window.location.href = '/v8/map';
                    return;
                }

                let flowOpts = '';
                flows.forEach(f => {
                    const rFrom = activeProject.roles.find(r => r.id === f.from);
                    const rTo = activeProject.roles.find(r => r.id === f.to);
                    flowOpts += `<option value="${f.id}">[${rFrom?.name} -> ${rTo?.name}] ${f.template}</option>`;
                });
                document.getElementById('newTaskFlowId').innerHTML = flowOpts;

                let userOpts = `<option value="">-- Dejar Libre en "Oportunidades" --</option>`;
                (activeProject.usuarios || []).forEach(u => {
                    const gUser = store.getState().globalUsers.find(gu => gu.id === u.id);
                    userOpts += `<option value="${u.id}">${gUser?.profile?.isAi ? '🤖 ' : ''}${gUser ? gUser.name : u.id}</option>`;
                });
                document.getElementById('newTaskAssignee').innerHTML = userOpts;

                createModal.style.display = 'flex';
            });
        }

        document.getElementById('btnCancelCreateTask')?.addEventListener('click', () => createModal.style.display = 'none');

        document.getElementById('btnConfirmCreateTask')?.addEventListener('click', async () => {
            const flowId = document.getElementById('newTaskFlowId').value;
            const desc = document.getElementById('newTaskDesc').value.trim();
            const assignee = document.getElementById('newTaskAssignee').value;
            if(!flowId) return alert("Selecciona un Flujo base.");

            const newHash = 'wo_' + Math.random().toString(36).substr(2, 9);
            const currProj = store.getState().projects.find(p => p.id === this.activeProjectId);
            
            const parentFlow = currProj.vna_flows.find(f => f.id === flowId);
            const socsClone = parentFlow.soc_checklist ? JSON.parse(JSON.stringify(parentFlow.soc_checklist)) : [];
            const resourcesClone = parentFlow.resources ? JSON.parse(JSON.stringify(parentFlow.resources)) : [];

            await store.dispatch({
                type: 'SPAWN_WORK_ORDER',
                payload: {
                    projectId: this.activeProjectId,
                    workOrder: {
                        hash: newHash, flowId: flowId, comentario: desc,
                        status: 'theoretical', realHours: 0,
                        sprintId: currProj.activeSprintId,
                        soc_checklist: socsClone, resources: resourcesClone
                    }
                }
            });

            if (assignee !== "") {
                await store.dispatch({ type: 'PING_WORK_ORDER', payload: { projectId: this.activeProjectId, woHash: newHash, userId: assignee } });
            }

            createModal.style.display = 'none';
            this.refreshRenderer();
        });
    }

    setupReviewModal() {
        const reviewModal = document.getElementById('reviewTaskModal');
        let currentReviewHash = null;

        this.openReviewModal = (hash) => {
            currentReviewHash = hash;
            const currProject = store.getState().projects.find(p => p.id === this.activeProjectId);
            const taskRef = currProject.work_orders.find(w => w.hash === hash);
            if(!taskRef) return;

            document.getElementById('reviewTaskDeliverable').innerText = taskRef.comentario || 'Sin comentario adjunto.';
            
            const socsContainer = document.getElementById('reviewSocsContainer');
            if (taskRef.soc_checklist && taskRef.soc_checklist.length > 0) {
                socsContainer.innerHTML = taskRef.soc_checklist.map(soc => `
                    <label class="soc-item">
                        <input type="checkbox" class="soc-checkbox" data-socid="${soc.id}" ${soc.isChecked ? 'checked' : ''}>
                        <span>${soc.text}</span>
                    </label>
                `).join('');
            } else {
                socsContainer.innerHTML = `<div style="color:#888; font-style:italic;">No hay SOCs definidos para esta receta. Se puede aprobar directamente.</div>`;
            }

            reviewModal.style.display = 'flex';
        };

        document.getElementById('btnCancelReviewTask')?.addEventListener('click', () => {
            reviewModal.style.display = 'none';
            currentReviewHash = null;
        });

        // AUDITORÍA IA
        document.getElementById('btnAiAudit')?.addEventListener('click', async (e) => {
            if (!currentReviewHash) return;
            const btn = e.target;
            btn.innerText = "🧠 Procesando Oráculo...";
            
            const currProject = store.getState().projects.find(p => p.id === this.activeProjectId);
            const wo = currProject.work_orders.find(w => w.hash === currentReviewHash);
            
            const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
            const apiKey = localStorage.getItem(`tt_key_${provider}`);

            if (!apiKey) {
                alert("Simulando Auditoría Offline. Marcando todos los SOCs como válidos.");
                document.querySelectorAll('.soc-checkbox').forEach(cb => cb.checked = true);
                btn.innerText = "🤖 Invocar Auditor IA (@notari_ledger)";
                return;
            }

            const systemPrompt = `
                Eres @notari_ledger, el Agente Auditor del ecosistema. Evalúa estrictamente si el entregable cumple con los SOCs.
                Entregable: "${wo.comentario}"
                Devuelve SOLO un objeto JSON con las claves de los SOCs y true/false.
                SOCs a evaluar: ${JSON.stringify(wo.soc_checklist.map(s => ({id: s.id, text: s.text})))}
            `;

            try {
                const response = await Orchestrator.callLLM({ provider, apiKey, systemPrompt, userPrompt: "Evalúa el entregable.", responseFormat: "json_object", temperature: 0.1 });
                const parsedAudit = response.content;
                
                document.querySelectorAll('.soc-checkbox').forEach(cb => {
                    const socId = cb.getAttribute('data-socid');
                    if (parsedAudit[socId] !== undefined) cb.checked = parsedAudit[socId];
                });

            } catch (err) {
                alert("Fallo al contactar con el Oráculo IA. Evalúa manualmente.");
            }
            btn.innerText = "🤖 Invocar Auditor IA (@notari_ledger)";
        });

        // SELLAR WORK ORDER
        document.getElementById('btnConfirmReview')?.addEventListener('click', async () => {
            if (!currentReviewHash) return;
            
            const socValidation = {};
            document.querySelectorAll('.soc-checkbox').forEach(cb => {
                socValidation[cb.getAttribute('data-socid')] = cb.checked;
            });

            await store.dispatch({
                type: 'REVIEW_WORK_ORDER',
                payload: { projectId: this.activeProjectId, woHash: currentReviewHash, auditorId: store.getState().session.activeUserId, socValidation }
            });

            await store.dispatch({
                type: 'APPROVE_WORK_ORDER',
                payload: { projectId: this.activeProjectId, woHash: currentReviewHash }
            });

            const updatedProj = store.getState().projects.find(p => p.id === this.activeProjectId);
            const updatedWo = updatedProj.work_orders.find(w => w.hash === currentReviewHash);

            if (updatedWo.status === 'reported') {
                alert("❌ Auditoría Rechazada: Todos los SOCs deben cumplirse para generar Equity en el Ledger.");
            } else {
                reviewModal.style.display = 'none';
                currentReviewHash = null;
            }
            
            this.refreshRenderer();
        });
    }
}
