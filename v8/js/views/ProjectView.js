// v8/js/views/ProjectView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js'; 
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class ProjectView {
    constructor() {
        document.title = "Matriz PULL | TeamTowers V9";
        this.activeProjectId = null;
        this.currentFilter = 'all'; 
        this.currentTab = 'oportunidades'; 
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
            tabs: [
                { id: 'oportunidades', label: 'Oportunidades', active: this.currentTab === 'oportunidades' },
                { id: 'en-curso', label: 'En Curso (y Auditoría)', active: this.currentTab === 'en-curso' },
                { id: 'contabilizado', label: 'Selladas', active: this.currentTab === 'contabilizado' }
            ],
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
                .workspace.is-open-to-work { box-shadow: inset 0 0 150px rgba(0, 230, 118, 0.03); }
                .kanban-container { width: 100%; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; }

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

                .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; align-items: start; padding-bottom: 5rem; width: 100%; }
                
                .task-card { 
                    box-sizing: border-box; width: 100%;
                    background: linear-gradient(180deg, rgba(25,25,30,0.8) 0%, rgba(10,10,15,0.9) 100%); 
                    border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.8rem; 
                    transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s; 
                    position: relative; display: flex; flex-direction: column; gap: 12px; 
                    backdrop-filter: blur(15px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5);
                }
                .task-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.15); box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 15px 40px rgba(0,0,0,0.8);}
                .task-card.ai-processing { border-color: var(--accent-purple); box-shadow: 0 0 30px rgba(224,64,251,0.3); animation: aiPulse 2s infinite; }
                
                .task-header { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
                .task-route { display: flex; gap: 8px; align-items: center; flex-wrap: wrap;}
                .route-badge { font-size: 0.7rem; padding: 4px 10px; border-radius: 8px; font-family: var(--font-mono); font-weight: 900; border: 1px solid; white-space: nowrap;}
                
                .task-title { color: white; font-size: 1.25rem; margin: 5px 0 0 0; line-height: 1.3; font-weight: 900; letter-spacing: -0.5px; word-break: break-word;}
                .task-desc-bubble { font-size: 0.85rem; color: #aaa; background: rgba(0,0,0,0.5); padding: 12px; border-radius: 8px; border-left: 3px solid var(--accent-blue); margin-bottom: 5px; font-style: italic; line-height: 1.5; word-break: break-word;}
                .task-ai-output { font-size: 0.85rem; color: #ddd; background: rgba(224, 64, 251, 0.05); border: 1px solid rgba(224, 64, 251, 0.2); padding: 12px; border-radius: 8px; margin-bottom: 5px; line-height: 1.5; max-height: 150px; overflow-y: auto;}

                .task-meta-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #888; background: rgba(0,0,0,0.4); padding: 12px 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);}
                .soc-progress { display: flex; align-items: center; gap: 5px; font-weight: bold; font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-blue); }
                
                .task-actions { margin-top: auto; padding-top: 15px; border-top: 1px dashed rgba(255,255,255,0.1); display: flex; flex-direction: row; gap: 10px;}
                
                .btn-pull, .btn-push { flex: 1; background: transparent; border: 1px solid #666; color: white; transition: 0.2s; padding: 12px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 0.9rem;}
                .btn-pull:hover { background: white; color: black; border-color: white;}
                .btn-push { border-style: dashed; border-color: var(--accent-purple); color: var(--accent-purple); }
                .btn-push:hover { background: rgba(224, 64, 251, 0.1); border-style: solid;}

                .btn-focus { flex: 1; background: linear-gradient(135deg, rgba(0,176,255,0.1), rgba(0,176,255,0.2)); border: 1px solid var(--accent-blue); color: var(--accent-blue); text-align: center; text-decoration: none; padding: 12px; border-radius: 10px; font-weight: 900; transition: 0.3s; font-size: 0.9rem;}
                .btn-focus:hover { background: var(--accent-blue); color: black; box-shadow: 0 0 20px rgba(0,176,255,0.4);}
                
                .btn-ai-exec { flex: 1; background: linear-gradient(135deg, rgba(224, 64, 251, 0.1), rgba(224, 64, 251, 0.2)); border: 1px solid var(--accent-purple); color: var(--accent-purple); text-align: center; text-decoration: none; padding: 12px; border-radius: 10px; font-weight: 900; transition: 0.3s; font-size: 0.9rem; cursor:pointer;}
                .btn-ai-exec:hover { background: var(--accent-purple); color: white; box-shadow: 0 0 25px rgba(224, 64, 251, 0.5);}

                .btn-review { flex: 1; background: var(--accent-blue); color: black; border: none; padding: 12px; border-radius: 10px; font-weight: 900; cursor: pointer; transition: 0.2s; font-size: 0.9rem;}
                .btn-review:hover { transform: scale(1.02); box-shadow: 0 0 15px rgba(0,176,255,0.4);}

                .empty-state { grid-column: 1 / -1; text-align: center; padding: 5rem 2rem; color: var(--text-muted); font-size: 1.2rem; border: 1px dashed var(--glass-border); border-radius: 20px; background: rgba(0,0,0,0.3);}

                @keyframes aiPulse { 0% { box-shadow: 0 0 10px rgba(224,64,251,0.2); } 50% { box-shadow: 0 0 40px rgba(224,64,251,0.6); } 100% { box-shadow: 0 0 10px rgba(224,64,251,0.2); } }

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
                    .task-grid { grid-template-columns: 1fr; gap: 1.2rem; padding-bottom: 2rem; }
                    .task-actions { flex-direction: column; gap: 10px; }
                    .btn-pull, .btn-push, .btn-focus, .btn-ai-exec, .btn-review { width: 100%; padding: 14px;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/project')}

                <main class="workspace ${isOpen ? 'is-open-to-work' : ''}">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="kanban-container">
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
                        <div class="task-grid" id="taskGrid"></div>
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

        window.addEventListener('swarm_update', () => {
            this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
        });

        window.addEventListener('ph-tab-changed', (e) => {
            this.currentTab = e.detail.tabId;
            this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
        });

        // SPRINT SELECTOR
        const selActiveSprint = document.getElementById('selActiveSprint');
        if (selActiveSprint) {
            selActiveSprint.addEventListener('change', async (e) => {
                await store.dispatch({ type: 'SET_ACTIVE_SPRINT', payload: { projectId: this.activeProjectId, sprintId: e.target.value } });
                this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
            });
        }

        const btnCreateSprint = document.getElementById('btnCreateSprint');
        if (btnCreateSprint) {
            btnCreateSprint.addEventListener('click', async () => {
                const currentP = store.getState().projects.find(p => p.id === this.activeProjectId);
                const nextNum = (currentP.sprints?.length || 0) + 1;
                const spName = prompt("Nombre del nuevo ciclo de trabajo:", `Sprint ${nextNum}`);
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
                this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
            });
        }

        // WORK ORDER CREATION
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
            
            // Clonamos los SOCs y Resources del flujo a la nueva Tarea (SOP)
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
                        soc_checklist: socsClone,
                        resources: resourcesClone
                    }
                }
            });

            if (assignee !== "") {
                await store.dispatch({
                    type: 'PING_WORK_ORDER',
                    payload: { projectId: this.activeProjectId, woHash: newHash, userId: assignee }
                });
            }

            createModal.style.display = 'none';
            this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
        });

        // =========================================================================
        // LÓGICA DE AUDITORÍA (REVIEW MODAL)
        // =========================================================================
        const reviewModal = document.getElementById('reviewTaskModal');
        let currentReviewHash = null;

        document.getElementById('btnCancelReviewTask')?.addEventListener('click', () => {
            reviewModal.style.display = 'none';
            currentReviewHash = null;
        });

        // Invocar Auditor IA para chequear los SOCs
        document.getElementById('btnAiAudit')?.addEventListener('click', async (e) => {
            if (!currentReviewHash) return;
            const btn = e.target;
            btn.innerText = "🧠 Procesando Oráculo...";
            
            const currProject = store.getState().projects.find(p => p.id === this.activeProjectId);
            const wo = currProject.work_orders.find(w => w.hash === currentReviewHash);
            
            const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
            let apiKey = '';
            if (provider === 'deepseek') apiKey = localStorage.getItem('tt_key_deepseek');
            if (provider === 'openai') apiKey = localStorage.getItem('tt_key_openai');
            if (provider === 'gemini') apiKey = localStorage.getItem('tt_key_gemini');

            if (!apiKey) {
                alert("Simulando Auditoría Offline. Marcando todos los SOCs como válidos.");
                document.querySelectorAll('.soc-checkbox').forEach(cb => cb.checked = true);
                btn.innerText = "🤖 Invocar Auditor IA (@notari_ledger)";
                return;
            }

            const systemPrompt = `
                Eres @notari_ledger, el Agente Auditor del ecosistema.
                Tu misión es evaluar estrictamente si el entregable proporcionado cumple con los indicadores de conducta y calidad (SOCs) definidos.
                Entregable: "${wo.comentario}"
                
                Devuelve SOLO un objeto JSON donde las claves son los IDs de los SOCs y los valores booleanos (true/false) según si se cumplen o no.
                SOCs a evaluar: ${JSON.stringify(wo.soc_checklist.map(s => ({id: s.id, text: s.text})))}
            `;

            try {
                let aiResponseText = "";
                if (provider === 'openai') {
                    const res = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: "Evalúa el entregable." }], response_format: { type: "json_object" } })
                    });
                    const data = await res.json(); aiResponseText = data.choices[0].message.content;
                } else if (provider === 'deepseek') {
                    const res = await fetch('https://api.deepseek.com/chat/completions', {
                        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: "Evalúa el entregable." }], response_format: { type: "json_object" } })
                    });
                    const data = await res.json(); aiResponseText = data.choices[0].message.content;
                } else if (provider === 'gemini') {
                    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
                    });
                    const data = await res.json(); aiResponseText = data.candidates[0].content.parts[0].text;
                }

                // Limpiar JSON
                aiResponseText = aiResponseText.replace(/```json/gi, '').replace(/```/g, '').trim();
                const parsedAudit = JSON.parse(aiResponseText);
                
                // Actualizar checkboxes UI
                document.querySelectorAll('.soc-checkbox').forEach(cb => {
                    const socId = cb.getAttribute('data-socid');
                    if (parsedAudit[socId] !== undefined) {
                        cb.checked = parsedAudit[socId];
                    }
                });

            } catch (err) {
                alert("Fallo al contactar con el Oráculo IA. Evalúa manualmente.");
            }
            btn.innerText = "🤖 Invocar Auditor IA (@notari_ledger)";
        });

        // Botón Final Sellar
        document.getElementById('btnConfirmReview')?.addEventListener('click', async () => {
            if (!currentReviewHash) return;
            
            const socValidation = {};
            document.querySelectorAll('.soc-checkbox').forEach(cb => {
                socValidation[cb.getAttribute('data-socid')] = cb.checked;
            });

            const currProj = store.getState().projects.find(p => p.id === this.activeProjectId);
            
            // 1. Guardar estado de la auditoría (in_review + SOCs)
            await store.dispatch({
                type: 'REVIEW_WORK_ORDER',
                payload: { projectId: this.activeProjectId, woHash: currentReviewHash, auditorId: store.getState().session.activeUserId, socValidation }
            });

            // 2. Intentar consolidar (store validará si todos los SOCs están a true)
            await store.dispatch({
                type: 'APPROVE_WORK_ORDER',
                payload: { projectId: this.activeProjectId, woHash: currentReviewHash }
            });

            // Comprobar si fue exitoso (consolidated) o rechazado (reported)
            const updatedProj = store.getState().projects.find(p => p.id === this.activeProjectId);
            const updatedWo = updatedProj.work_orders.find(w => w.hash === currentReviewHash);

            if (updatedWo.status === 'reported') {
                alert("❌ Auditoría Rechazada: Todos los SOCs deben cumplirse para generar Equity en el Ledger.");
            } else {
                reviewModal.style.display = 'none';
                currentReviewHash = null;
            }
            
            this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
        });

        // KANBAN CARD ACTIONS
        const taskGrid = document.getElementById('taskGrid');
        taskGrid.addEventListener('click', async (e) => {
            const target = e.target.closest('button') || e.target.closest('a'); 
            if (!target || !target.dataset.hash) return;
            if (target.tagName === 'A') return; 

            const currentState = store.getState();
            const currProject = currentState.projects.find(p => p.id === this.activeProjectId);
            if (!currProject) return;

            const isLegacyTx = target.dataset.legacy === "true";
            const txHash = target.dataset.hash;
            const isPO = currProject.ownerId === activeUserId || currentState.session.role === 'ecosystem-owner';

            // AUTO-EJECUCIÓN DE IA (A2A)
            if (target.classList.contains('btn-ai-exec')) {
                if (this.isProcessingAi) return alert("Un Agente ya está trabajando en otra Work Order. Espera.");
                
                this.isProcessingAi = true;
                const card = target.closest('.task-card');
                card.classList.add('ai-processing');
                target.innerText = "⏳ Invocando LLM...";
                
                const taskRef = (currProject.work_orders || []).find(w => w.hash === txHash);
                const flowRef = (currProject.vna_flows || []).find(f => f.id === taskRef?.flowId);
                const estHours = flowRef ? (flowRef.estimatedHours || 2) : 2;

                const executingRole = currProject.roles.find(r => r.id === flowRef?.from) || { name: 'IA Node', levelId: '@baixos', guardian: 'everyman' };
                const projectVision = currProject.presentation || currProject.prompt || "Sin definir";

                const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
                let apiKey = '';
                if (provider === 'deepseek') apiKey = localStorage.getItem('tt_key_deepseek');
                if (provider === 'openai') apiKey = localStorage.getItem('tt_key_openai');
                if (provider === 'gemini') apiKey = localStorage.getItem('tt_key_gemini');

                let aiResponseText = "";

                if (!apiKey || apiKey.length < 5) {
                    await new Promise(r => setTimeout(r, 2000));
                    aiResponseText = `[Simulación Modo Offline]\nEl Agente IA ha procesado la Work Order basándose en el marco del proyecto. Documento estructurado entregado.`;
                } else {
                    let systemPrompt = "Actúas como un trabajador digital eficiente.";
                    try {
                        await KB.init();
                        systemPrompt = await KB.getAgentContext(currProject.id, executingRole, projectVision);
                    } catch(err) { }

                    const userPrompt = `
                        TAREA A EJECUTAR (Entregable esperado): ${flowRef?.template || 'Generar Entregable'}
                        CONTEXTO ADICIONAL DEL USUARIO: ${taskRef?.comentario || 'N/A'}
                        
                        Instrucción: Redacta el entregable final cumpliendo con los estándares de tu rol, tu arquetipo guardián, y la visión del proyecto. Sé directo, profesional y claro.
                    `;

                    try {
                        if (provider === 'openai') {
                            const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] }) });
                            const data = await res.json(); aiResponseText = data.choices[0].message.content;
                        } else if (provider === 'deepseek') {
                            const res = await fetch('https://api.deepseek.com/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] }) });
                            const data = await res.json(); aiResponseText = data.choices[0].message.content;
                        } else if (provider === 'gemini') {
                            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }] }) });
                            const data = await res.json(); aiResponseText = data.candidates[0].content.parts[0].text;
                        }
                    } catch(e) {
                        aiResponseText = `Error de API: ${e.message}. (Simulando entrega de emergencia)`;
                    }
                }

                await store.dispatch({ type: 'REPORT_WORK_ORDER', payload: { projectId: currProject.id, woHash: txHash, realHours: estHours, comentario: aiResponseText, proofLink: 'Agent_Auto_Report' } });
                this.isProcessingAi = false;
                this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                return;
            }

            // ABRIR MODAL DE AUDITORÍA
            if (target.classList.contains('btn-review')) {
                if (!isPO) return alert("Solo el dueño del ecosistema puede auditar tareas."); 
                
                const taskRef = currProject.work_orders.find(w => w.hash === txHash);
                if(!taskRef) return;

                currentReviewHash = txHash;
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
                return;
            }

            // OTROS BOTONES (PULL, PUSH, APROBAR DE LEGACY)
            if (target.classList.contains('btn-approve')) {
                if (!isPO) return;
                const action = target.dataset.action;
                if (action === 'approve-pull') {
                    const targetUserId = target.dataset.userid;
                    const actType = isLegacyTx ? 'PING_TRANSACTION' : 'PING_WORK_ORDER';
                    await store.dispatch({ type: actType, payload: isLegacyTx ? { projectId: currProject.id, txHash, userId: targetUserId } : { projectId: currProject.id, woHash: txHash, userId: targetUserId } });
                    this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                } 
                return;
            }

            if (target.classList.contains('btn-pull')) {
                const action = target.dataset.action;
                const actType = isLegacyTx ? (action === 'request' ? 'REQUEST_TRANSACTION' : 'PING_TRANSACTION') : (action === 'request' ? 'REQUEST_WORK_ORDER' : 'PING_WORK_ORDER');
                const payload = isLegacyTx ? { projectId: currProject.id, txHash, userId: currentState.session.activeUserId } : { projectId: currProject.id, woHash: txHash, userId: currentState.session.activeUserId };

                await store.dispatch({ type: actType, payload });
                this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                return;
            }

            if (target.classList.contains('btn-push')) {
                if (!isPO) return alert("Solo el PO puede forzar la delegación de tareas.");
                const usersInProject = currProject.usuarios || [];
                if (usersInProject.length === 0) return alert("No hay miembros en la Colla para delegar.");
                
                let userListStr = "IDs disponibles:\n";
                usersInProject.forEach(u => {
                    const globalData = currentState.globalUsers.find(gu => gu.id === u.id);
                    userListStr += `- ${u.id} (${globalData ? globalData.name : 'Unknown'})\n`;
                });

                const targetUserId = prompt(`Introduce el ID del usuario al que asignarás esta tarea:\n\n${userListStr}`);
                if (targetUserId) {
                    const actType = isLegacyTx ? 'PING_TRANSACTION' : 'PING_WORK_ORDER';
                    await store.dispatch({ type: actType, payload: isLegacyTx ? { projectId: currProject.id, txHash, userId: targetUserId } : { projectId: currProject.id, woHash: txHash, userId: targetUserId } });
                    this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                }
                return;
            }
        });

        this.renderTasks(project);
    }

    renderTasks(project) {
        const grid = document.getElementById('taskGrid');
        if(!grid) return;
        grid.innerHTML = '';

        const state = store.getState();
        const activeUser = state.session.activeUserId;
        const isPO = project.ownerId === activeUser || state.session.role === 'ecosystem-owner';
        
        let activeCardsHtml = [];

        let allTasks = [
            ...(project.work_orders || []).map(wo => ({ ...wo, isWorkOrder: true })),
            ...(project.transactions || []).map(tx => ({ ...tx, isWorkOrder: false }))
        ];

        const activeSprintId = project.activeSprintId;
        allTasks = allTasks.filter(tx => {
            if (!tx.isWorkOrder) return true; 
            return tx.sprintId === activeSprintId;
        });

        allTasks.forEach(tx => {
            let tabCategory = '';
            if (tx.status === 'theoretical' || tx.status === 'requested') tabCategory = 'oportunidades';
            else if (tx.status === 'pinged' || tx.status === 'reported' || tx.status === 'in_review') tabCategory = 'en-curso';
            else if (tx.status === 'consolidated' || tx.status === 'approved') tabCategory = 'contabilizado';

            if (tabCategory !== this.currentTab) return;

            let flowData = tx.isWorkOrder ? ((project.vna_flows || []).find(f => f.id === tx.flowId) || { tipo: 'tangible', template: 'Tarea Huérfana', estimatedHours: 0 }) : tx;

            if (this.currentFilter === 'tangible' && flowData.tipo !== 'tangible') return;
            if (this.currentFilter === 'intangible' && flowData.tipo !== 'intangible') return;
            
            if (this.currentFilter === 'mine' && tx.status !== 'theoretical' && tx.assigneeId !== activeUser) return;
            if (!isPO && this.currentFilter === 'all' && tabCategory !== 'oportunidades' && tx.assigneeId !== activeUser) return;

            activeCardsHtml.push(this.createTaskCardHTML(tx, flowData, project, state, isPO));
        });

        if (activeCardsHtml.length > 0) {
            grid.innerHTML = activeCardsHtml.join('');
        } else {
            let emptyMsg = "No hay tareas en esta categoría.";
            if (this.currentTab === 'oportunidades') emptyMsg = "No hay oportunidades libres en el mercado del Sprint actual.";
            if (this.currentTab === 'en-curso') emptyMsg = "No hay ninguna tarea activa en proceso o auditoría en este Sprint.";
            if (this.currentTab === 'contabilizado') emptyMsg = "Aún no se han sellado Slices en este Sprint.";
            
            grid.innerHTML = `<div class="empty-state">${emptyMsg}</div>`;
        }
    }

    createTaskCardHTML(tx, flowData, project, state, isPO) {
        const role = project.roles.find(r => r.id === flowData.from) || { name: 'Nodo Borrado', levelId: '@baixos' };
        const receiverRole = project.roles.find(r => r.id === flowData.to) || { name: 'Destino', levelId: '?' };
        
        const color = this.getColorForLevel(role.levelId);
        const tipoColor = flowData.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';
        const tipoEmoji = flowData.tipo === 'tangible' ? '🟢' : '🟣';
        
        const isLegacy = !tx.isWorkOrder;
        const hashAttr = `data-hash="${tx.hash}" data-legacy="${isLegacy}"`;

        let actionHtml = '';
        let statusTag = '';
        let aiOutputHtml = '';

        // SOCs Progress
        const socs = tx.soc_checklist || flowData.soc_checklist || [];
        const checkedCount = socs.filter(s => s.isChecked).length;
        const socHtml = socs.length > 0 ? `<div class="soc-progress">☑️ SOCs: ${checkedCount}/${socs.length}</div>` : '';

        if (tx.status === 'theoretical') {
            statusTag = `<span style="color:#aaa; font-size:0.7rem; border:1px solid #444; padding:4px 10px; border-radius:12px; font-weight:bold; letter-spacing:1px;">LIBRE</span>`;
            if (isPO) {
                actionHtml = `
                    <button class="btn-pull" data-action="request" ${hashAttr} title="Adjudicarme la tarea">📥 Hacer PULL</button>
                    <button class="btn-push" ${hashAttr} title="Asignar a un miembro de la Colla">👤 Delegar (PUSH)</button>
                `;
            } else {
                actionHtml = `<button class="btn-pull" data-action="request" ${hashAttr}>✋ Solicitar Asignación</button>`;
            }
        } 
        else if (tx.status === 'requested') {
            statusTag = `<span style="color:var(--accent-red); font-size:0.7rem; border:1px solid var(--accent-red); padding:4px 10px; border-radius:12px; font-weight:bold; letter-spacing:1px; background:rgba(255,82,82,0.1);">SOLICITADO</span>`;
            if (isPO) {
                actionHtml = `
                    <div style="font-size: 0.85rem; color: #ccc; margin-bottom: 10px; background:rgba(0,0,0,0.5); padding:10px; border-radius:8px; border-left:2px solid var(--accent-red);"><b>${tx.assigneeId}</b> solicita ejecutar.</div>
                    <button class="btn-approve" data-action="approve-pull" ${hashAttr} data-userid="${tx.assigneeId}">✅ Aprobar Asignación</button>
                `;
            } else {
                actionHtml = `<div style="color: var(--accent-orange); font-size: 0.85rem; text-align: center; padding: 10px; border: 1px dashed var(--accent-orange); border-radius: 8px;">✋ Esperando aprobación PO...</div>`;
            }
        }
        else if (tx.status === 'pinged') {
            statusTag = `<span style="color:var(--accent-orange); font-size:0.7rem; border:1px solid var(--accent-orange); padding:4px 10px; border-radius:12px; font-weight:bold; letter-spacing:1px; background:rgba(255,171,64,0.1);">EN CURSO</span>`;
            const worker = state.globalUsers.find(u => u.id === tx.assigneeId);
            const isMine = tx.assigneeId === state.session.activeUserId;

            if (isMine) actionHtml = `<a href="/v8/focus?hash=${tx.hash}&legacy=${isLegacy}" class="btn-focus" data-link data-hash="${tx.hash}">▶ MODO FOCUS / REPORTAR</a>`;
            else if (worker?.profile?.isAi && isPO) actionHtml = `<button class="btn-ai-exec" ${hashAttr}>⚡ EJECUTAR IA (${worker.name})</button>`;
            else actionHtml = `<div style="color: #888; font-size: 0.85rem; text-align: center; padding: 12px; background:rgba(0,0,0,0.4); border-radius: 10px; border:1px solid #333;">Ejecutando: <span style="color:white; font-weight:bold;">${worker ? worker.name : tx.assigneeId}</span></div>`;
        } 
        else if (tx.status === 'reported' || tx.status === 'in_review') {
            statusTag = `<span style="color:var(--accent-blue); font-size:0.7rem; border:1px solid var(--accent-blue); padding:4px 10px; border-radius:12px; font-weight:bold; letter-spacing:1px; background:rgba(0,176,255,0.1);">${tx.status === 'reported' ? 'REPORTADO' : 'AUDITORÍA (REVIEW)'}</span>`;
            if (tx.proofLink === 'Agent_Auto_Report') aiOutputHtml = `<div class="task-ai-output"><b>🤖 Output Generado:</b><br>${tx.comentario.replace(/\n/g, '<br>')}</div>`;

            actionHtml = `
                <div style="font-size: 0.85rem; color: #ccc; background: rgba(0,0,0,0.6); padding: 12px; border-radius: 10px; margin-bottom: 12px; display:flex; justify-content:space-between; align-items:center; border-left:3px solid var(--accent-blue);">
                    <span>PoW Est: <strong style="color: white; font-family:var(--font-mono); font-size:1rem;">${tx.realHours}h</strong></span>
                    <a href="${tx.proofLink === 'Agent_Auto_Report' ? '#' : tx.proofLink}" target="_blank" style="color: var(--accent-blue); font-weight:bold; text-decoration:none;">${tx.proofLink === 'Agent_Auto_Report' ? 'Ver Arriba' : '🔗 Ver Proof'}</a>
                </div>
                ${isPO ? `<button class="btn-review" ${hashAttr}>🔎 Auditar Receta (SOCs)</button>` : `<div style="font-size:0.8rem; color:#888; text-align:center; padding:10px; border:1px dashed #333; border-radius:8px;">Pendiente de Notaría.</div>`}
            `;
        }
        else if (tx.status === 'consolidated') {
            statusTag = `<span style="color:var(--accent-green); font-size:0.7rem; border:1px solid var(--accent-green); padding:4px 10px; border-radius:12px; font-weight:bold; letter-spacing:1px; background:rgba(0,230,118,0.1);">SELLADO</span>`;
            if (tx.proofLink === 'Agent_Auto_Report') aiOutputHtml = `<div class="task-ai-output" style="max-height:80px; opacity:0.8;"><b>🤖 Output:</b><br>${tx.comentario.replace(/\n/g, '<br>')}</div>`;

            actionHtml = `
                <div style="color: var(--accent-green); font-size: 1.2rem; font-weight: 900; font-family: var(--font-mono); text-align: center; padding: 15px; background: rgba(0, 230, 118, 0.05); border-radius: 12px; border: 1px dashed var(--accent-green);">
                    +${Math.round(tx.valorCongelado || 0).toLocaleString()} Slices
                </div>
            `;
        }

        const borderStyle = tx.status === 'requested' ? 'border-color: var(--accent-red); box-shadow: 0 0 20px rgba(255,82,82,0.15);' : '';
        const titleText = flowData.template || flowData.entregable || 'Work Order';
        let contextText = tx.comentario || tx.descripcionContexto || flowData.context || '';
        if (tx.proofLink === 'Agent_Auto_Report') contextText = ''; 

        const contextHtml = contextText ? `<div class="task-desc-bubble">💬 "${contextText}"</div>` : '';

        return `
            <div class="task-card" style="${borderStyle}">
                <div class="task-header">
                    <div class="task-route">
                        <span class="route-badge" style="color: ${color}; border-color: ${color};" title="${role.name}">${role.levelId}</span>
                        <span style="color: #666; font-size:0.8rem;">&rarr;</span>
                        <span class="route-badge" style="color: #888; border-color: #444;" title="${receiverRole.name}">${receiverRole.levelId}</span>
                    </div>
                    ${statusTag}
                </div>
                
                <h3 class="task-title">${titleText}</h3>
                ${contextHtml}
                ${aiOutputHtml}
                
                <div class="task-meta-row">
                    ${socHtml || `<span style="color: ${tipoColor}; font-weight: bold; font-size:0.75rem; letter-spacing:1px;">${tipoEmoji} ${flowData.tipo.toUpperCase()}</span>`}
                    <span style="font-weight:bold; color:white; font-family:var(--font-mono);">⏱ ${flowData.estimatedHours || flowData.horas || 1}h <span style="color:#666; font-weight:normal; font-family:var(--font-main);">Est.</span></span>
                </div>

                <div class="task-actions">
                    ${actionHtml}
                </div>
            </div>
        `;
    }

    getColorForLevel(levelId) {
        const colors = { '@anxaneta': 'var(--accent-red)', '@aixecador': 'var(--accent-orange)', '@dosos': 'var(--accent-purple)', '@baixos': 'var(--accent-blue)', '@pinya': 'var(--accent-green)' };
        return colors[levelId] || '#aaa';
    }
}
