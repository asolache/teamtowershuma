// v5/js/views/ProjectView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class ProjectView {
    constructor() {
        document.title = "Tareas | TeamTowers SOS";
        this.activeProjectId = null;
        this.currentFilter = 'all'; // all, mine, tangible, intangible
        this.currentTab = 'oportunidades'; // oportunidades, en-curso, contabilizado
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

        const isOpen = user?.profile?.isOpenToWork || false;
        const statusBtnClass = isOpen ? 'btn-status-open' : 'btn-status-closed';
        const statusBtnText = isOpen ? '🟢 Abierto a Flow' : '🔴 Modo Oculto';

        // EVALUACIÓN DE GOBERNANZA V11 (Motor de Permisos)
        const canCreateWO = store.canUserCreateWorkOrder(activeProjectId, activeUserId);

        // V12 MODULAR: ACTION DROPDOWN
        let magicActionsHtml = '';
        if (canCreateWO) {
            magicActionsHtml = `
                <div class="magic-action-group">
                    <select id="selKanbanMagic" class="magic-select">
                        <option value="" disabled selected>⚡ Acciones del Tablero...</option>
                        <option value="create_wo">➕ Inyectar Tarea (Work Order)</option>
                        <option value="ai_sprint" disabled>🤖 Auto-Sprint IA (V12.x)</option>
                    </select>
                    <button class="btn-sm btn-sm-primary" id="btnExecuteKanbanMagic">Ejecutar</button>
                </div>
            `;
        }

        // Configuración del Header Universal
        const headerConfig = {
            title: "Kanban PULL",
            subtitle: project ? project.nombre : '',
            tagline: "Mercado interno de tareas. Asume responsabilidad y ejecuta valor.",
            actionHtml: `
                <div style="display:flex; gap:15px; align-items:center; flex-wrap:wrap; justify-content:flex-end;">
                    <button id="btnToggleAvailability" class="${statusBtnClass}" title="Alternar Estado de Matching">${statusBtnText}</button>
                    ${magicActionsHtml}
                </div>
            `,
            tabs: [
                { id: 'oportunidades', label: 'Oportunidades', active: this.currentTab === 'oportunidades', badge: '0' },
                { id: 'en-curso', label: 'En Curso', active: this.currentTab === 'en-curso', badge: '0' },
                { id: 'contabilizado', label: 'Selladas', active: this.currentTab === 'contabilizado', badge: '0' }
            ]
        };

        return `
            <style>
                /* FIX SCROLL LATERAL & BOTTOM SAFE */
                .app-layout { display: flex; height: 100vh; height: 100dvh; width: 100vw; overflow: hidden; background: var(--bg-dark); }
                .workspace-kanban { display: block; flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; height: 100%; box-sizing: border-box; scroll-behavior: smooth; transition: box-shadow 0.5s ease-out; width: 100%;}
                
                /* MAGIA VISUAL: Destello si estás disponible */
                .workspace-kanban.is-open-to-work { box-shadow: inset 0 0 150px rgba(0, 230, 118, 0.05); }

                /* FIX TABS MOBILE PARA SIEMPRE (Pre-Master CSS) */
                .ph-tabs-container { flex-wrap: nowrap !important; overflow-x: auto !important; scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; flex-shrink: 0 !important; margin-bottom: 2rem !important; justify-content: flex-start !important;}
                .ph-tabs-container::-webkit-scrollbar { display: none; }
                .ph-tab-btn { flex: 0 0 auto !important; }

                /* WRAPPER MAESTRO PARA ALINEACIÓN PERFECTA */
                .kanban-container { width: 100%; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; box-sizing:border-box;}

                /* ESTADOS DISPONIBILIDAD */
                .btn-status-closed { background: rgba(255, 82, 82, 0.1); border: 1px solid var(--accent-red); color: var(--accent-red); padding: 8px 15px; border-radius: 12px; font-size: 0.85rem; font-weight: 900; cursor:pointer; transition: all 0.2s;}
                .btn-status-open { background: rgba(0, 230, 118, 0.1); border: 1px solid var(--accent-green); color: var(--accent-green); padding: 8px 15px; border-radius: 12px; font-size: 0.85rem; font-weight: 900; cursor:pointer; transition: all 0.2s; box-shadow: 0 0 15px rgba(0,230,118,0.2);}

                /* MODULAR UX: SELECTORES GLOBALES */
                .magic-action-group { display: flex; gap: 10px; align-items: center;}
                .magic-select { background: rgba(0,0,0,0.6); border: 1px solid var(--glass-border); color: white; padding: 10px 15px; border-radius: 8px; font-family: var(--font-main); font-weight: 900; outline: none; cursor: pointer; transition: 0.3s; box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);}
                .magic-select:focus { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0,176,255,0.2);}
                .magic-select option { background: #111; color: white; }
                
                .btn-sm-primary { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; box-shadow: 0 5px 15px rgba(0,176,255,0.2); padding: 10px 20px; font-size: 0.9rem; border-radius: 8px; font-weight: 900; cursor: pointer; border:none; transition:0.3s;}
                .btn-sm-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(224, 64, 251, 0.4); filter: brightness(1.1);}

                /* CONTROLES SECUNDARIOS (Filtros) */
                .controls-row { display: flex; justify-content: flex-end; align-items: center; margin-bottom: 1.5rem; width: 100%;}
                .filters-container { display:flex; gap: 15px; flex-wrap: wrap; justify-content: flex-end;}
                .filter-dropdown { background: rgba(0,0,0,0.4); border: 1px dashed #444; color: #aaa; padding: 8px 15px; border-radius: 8px; font-family: inherit; font-size: 0.85rem; font-weight:bold; outline: none; cursor: pointer; transition: all 0.3s;}
                .filter-dropdown:focus, .filter-dropdown:hover { border-color: var(--accent-blue); color:white;}

                /* =========================================================
                   GRID DE TARJETAS LUXURY (DESKTOP)
                   ========================================================= */
                .task-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); 
                    gap: 1.5rem; 
                    align-items: start; 
                    padding-bottom: 5rem;
                    width: 100%;
                }
                
                .task-card { 
                    box-sizing: border-box; width: 100%;
                    background: linear-gradient(180deg, rgba(25,25,30,0.8) 0%, rgba(10,10,15,0.9) 100%); 
                    border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 1.8rem; 
                    transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s; 
                    position: relative; display: flex; flex-direction: column; gap: 12px; 
                    backdrop-filter: blur(15px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.5);
                }
                .task-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2); box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 15px 40px rgba(0,0,0,0.8);}
                
                .task-header { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
                .task-route { display: flex; gap: 8px; align-items: center; flex-wrap: wrap;}
                .route-badge { font-size: 0.7rem; padding: 4px 10px; border-radius: 8px; font-family: var(--font-mono); font-weight: 900; border: 1px solid; white-space: nowrap;}
                
                .task-title { color: white; font-size: 1.25rem; margin: 5px 0 0 0; line-height: 1.3; font-weight: 900; letter-spacing: -0.5px; word-break: break-word;}
                .task-desc-bubble { font-size: 0.85rem; color: #aaa; background: rgba(0,0,0,0.5); padding: 12px; border-radius: 8px; border-left: 3px solid var(--accent-blue); margin-bottom: 5px; font-style: italic; line-height: 1.5; word-break: break-word;}
                
                .task-meta-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #888; background: rgba(0,0,0,0.4); padding: 12px 15px; border-radius: 12px; border: 1px solid #222;}
                
                /* BOTONES LADO A LADO EN DESKTOP */
                .task-actions { margin-top: auto; padding-top: 15px; border-top: 1px dashed rgba(255,255,255,0.1); display: flex; flex-direction: row; gap: 10px;}
                
                .btn-pull { flex: 1; box-sizing: border-box; background: transparent; border: 1px solid #666; color: white; transition: all 0.2s; padding: 12px; border-radius: 10px; cursor: pointer; font-weight: bold; display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 0.9rem;}
                .btn-pull:hover { background: white; color: black; border-color: white;}
                
                .btn-push { flex: 1; box-sizing: border-box; background: transparent; border: 1px dashed var(--accent-purple); color: var(--accent-purple); transition: all 0.2s; padding: 12px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 0.9rem; text-align: center;}
                .btn-push:hover { background: rgba(224, 64, 251, 0.1); border-style: solid;}

                .btn-focus { flex: 1; box-sizing: border-box; background: linear-gradient(135deg, rgba(0,176,255,0.1), rgba(0,176,255,0.2)); border: 1px solid var(--accent-blue); color: var(--accent-blue); display: block; text-align: center; text-decoration: none; padding: 12px; border-radius: 10px; font-weight: 900; transition: all 0.3s; font-size: 0.9rem;}
                .btn-focus:hover { background: var(--accent-blue); color: black; box-shadow: 0 0 20px rgba(0,176,255,0.4);}
                
                .btn-approve { flex: 1; box-sizing: border-box; background: var(--accent-green); color: black; border: none; padding: 12px; border-radius: 10px; font-weight: 900; cursor: pointer; transition: transform 0.2s; font-size: 0.9rem;}
                .btn-approve:hover { transform: scale(1.02); box-shadow: 0 0 15px rgba(0,230,118,0.4);}

                .empty-state { grid-column: 1 / -1; text-align: center; padding: 5rem 2rem; color: var(--text-muted); font-size: 1.2rem; border: 1px dashed #333; border-radius: 20px; background: rgba(0,0,0,0.3);}

                /* =========================================================
                   MODALS (CREAR WORK ORDER V10)
                   ========================================================= */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 4000; overflow-y:auto;}
                .modal-content { background: var(--bg-dark); border: 1px solid var(--glass-border); padding: 3rem; border-radius: 24px; width: 100%; max-width: 550px; box-shadow: 0 30px 60px rgba(0,0,0,0.9); animation: slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); box-sizing: border-box; max-height: 90vh; overflow-y:auto; margin: 2rem auto; border-top: 4px solid var(--accent-blue);}
                .form-group { margin-bottom: 20px; width:100%; }
                .form-group label { display: block; font-size: 0.8rem; color: #aaa; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing:1px; }
                .form-control { background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 14px 18px; border-radius: 12px; font-family: inherit; font-size: 1rem; outline: none; width: 100%; transition: all 0.3s; box-sizing: border-box; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);}
                .form-control:focus { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0,176,255,0.2);}

                @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }

                /* =========================================================
                   RESPONSIVE MOBILE LUXURY APP (BOTTOM SAFE FIX)
                   ========================================================= */
                @media (max-width: 768px) {
                    .workspace-kanban { 
                        padding: 90px 1rem 120px 1rem; /* 120px BOTTOM SAFE */
                    } 
                    
                    .kanban-container { width: 100%; display: block; }
                    
                    /* Magic Actions apiladas */
                    .magic-action-group { flex-direction: column; width: 100%; align-items: stretch; margin-top:10px;}
                    .magic-select, .btn-sm-primary { width: 100%; padding: 14px; font-size: 1rem;}

                    .controls-row { justify-content: stretch; margin-bottom: 1.5rem; }
                    .filters-container { flex-direction: column; width: 100%; gap: 10px;}
                    .filter-dropdown { width: 100%; padding: 14px; box-sizing: border-box; }
                    
                    /* RESTRICCIÓN GRID MÓVIL PARA EVITAR DEFORMACIONES */
                    .task-grid { 
                        grid-template-columns: 1fr; 
                        gap: 1.2rem; 
                        width: 100%;
                        display: grid;
                        padding-bottom: 2rem;
                    }
                    
                    .task-card { 
                        padding: 1.5rem; 
                        border-radius: 16px; 
                        width: 100%; 
                        max-width: 100%; 
                        margin: 0; 
                    }

                    .task-title { font-size: 1.15rem; }
                    .task-meta-row { flex-wrap: wrap; gap: 8px; }

                    /* Botones apilados en móvil para ergonomía de pulgares */
                    .task-actions { flex-direction: column; padding-top: 15px; margin-top: 10px; gap: 10px; }
                    .btn-pull, .btn-push, .btn-focus, .btn-approve { width: 100%; margin: 0; padding: 14px; font-size: 1rem;}
                    
                    .modal-content { padding: 2rem 1.5rem; width: 95%;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/project')}

                <main class="workspace-kanban ${isOpen ? 'is-open-to-work' : ''}">
                    
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="kanban-container">
                        <div class="controls-row">
                            <div class="filters-container">
                                <select id="filterDropdown" class="filter-dropdown">
                                    <option value="all">Filtros: Todas las tareas</option>
                                    <option value="mine">👤 Solo mis tareas</option>
                                    <option value="tangible">🟢 Solo Tangibles</option>
                                    <option value="intangible">🟣 Solo Intangibles</option>
                                </select>
                            </div>
                        </div>

                        <div class="task-grid" id="taskGrid"></div>
                    </div>
                </main>

                <div class="modal-overlay" id="createTaskModal">
                    <div class="modal-content">
                        <h2 style="color:white; margin-top:0; margin-bottom: 5px; font-weight:900; font-size:1.8rem; letter-spacing:-1px;">Abrir el Grifo</h2>
                        <p style="color:#aaa; font-size:0.95rem; margin-bottom:2.5rem; line-height:1.5;">Instancia una tarea real a partir de las tuberías permanentes diseñadas en el Mapa VNA.</p>
                        
                        <div class="form-group">
                            <label>Tubería de Valor Origen (Flow)</label>
                            <select id="newTaskFlowId" class="form-control" style="background: rgba(0, 176, 255, 0.05); border-color: var(--accent-blue); font-weight:bold; color:var(--accent-blue);"></select>
                        </div>

                        <div class="form-group">
                            <label>Contexto / Instrucciones Especiales</label>
                            <textarea id="newTaskDesc" class="form-control" rows="3" placeholder="Especificaciones, enlaces a repositorios o detalles tácticos..."></textarea>
                        </div>

                        <div class="form-group" style="margin-top: 25px; border-top: 1px dashed #333; padding-top: 20px;">
                            <label style="color:var(--accent-orange);">Asignar Directamente (Opcional)</label>
                            <select id="newTaskAssignee" class="form-control" style="border-color:#555;">
                                <option value="">-- Dejar Libre en "Oportunidades" --</option>
                            </select>
                        </div>

                        <div style="display: flex; justify-content: space-between; margin-top: 3rem; gap:15px;">
                            <button class="btn" style="flex:1; background:transparent; border:1px solid #555; color:white; padding:14px; border-radius:12px; cursor:pointer; font-weight:bold;" id="btnCancelCreateTask">Cancelar</button>
                            <button class="btn" style="flex:2; background:linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color:white; font-weight:900; border:none; padding:14px; border-radius:12px; cursor:pointer; box-shadow:0 5px 15px rgba(0,176,255,0.3);" id="btnConfirmCreateTask">🚀 Inyectar al Kanban</button>
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
        
        if (!project) {
            const userProjects = state.projects.filter(p => 
                state.session.role === 'ecosystem-owner' || 
                p.ownerId === activeUserId || 
                (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
            );
            project = userProjects.length > 0 ? userProjects[userProjects.length - 1] : null;
            if(project) localStorage.setItem('tt_active_project', project.id);
        }

        if (!project) return;
        this.activeProjectId = project.id;

        // TABS LOGIC
        const tabBtns = document.querySelectorAll('.ph-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const tabId = btn.dataset.tab;
                if (tabId) {
                    this.currentTab = tabId;
                    this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                }
            });
        });

        // FILTROS
        const filterDropdown = document.getElementById('filterDropdown');
        filterDropdown.value = this.currentFilter;
        filterDropdown.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
        });

        // EVENTO DISPONIBILIDAD
        const btnToggleAvailability = document.getElementById('btnToggleAvailability');
        if (btnToggleAvailability) {
            btnToggleAvailability.addEventListener('click', async () => {
                const currentState = store.getState();
                const userIndex = currentState.globalUsers.findIndex(u => u.id === activeUserId);
                
                if (userIndex > -1) {
                    const currentStatus = currentState.globalUsers[userIndex].profile?.isOpenToWork || false;
                    const newStatus = !currentStatus;
                    
                    await store.dispatch({
                        type: 'UPDATE_USER_PROFILE',
                        payload: { userId: activeUserId, profile: { isOpenToWork: newStatus } }
                    });
                    
                    btnToggleAvailability.className = newStatus ? 'btn-status-open' : 'btn-status-closed';
                    btnToggleAvailability.innerText = newStatus ? '🟢 Abierto a Flow' : '🔴 Modo Oculto';
                    
                    const workspace = document.querySelector('.workspace-kanban');
                    if (newStatus) workspace.classList.add('is-open-to-work');
                    else workspace.classList.remove('is-open-to-work');
                }
            });
        }

        // LÓGICA DE MAGIC ACTIONS (MODULAR)
        const selMagic = document.getElementById('selKanbanMagic');
        const btnExecuteMagic = document.getElementById('btnExecuteKanbanMagic');
        const createModal = document.getElementById('createTaskModal');

        if (btnExecuteMagic && selMagic) {
            btnExecuteMagic.addEventListener('click', () => {
                const action = selMagic.value;
                if (action === 'create_wo') {
                    const activeProject = store.getState().projects.find(p => p.id === this.activeProjectId);
                    const flows = activeProject.vna_flows || [];
                    
                    if (flows.length === 0) {
                        alert("Debes dibujar Tuberías (Flujos permanentes) en el Mapa VNA antes de poder generar tareas en el Kanban.");
                        window.location.href = '/v5/map';
                        return;
                    }

                    let flowOpts = '';
                    const selFlow = document.getElementById('newTaskFlowId');
                    flows.forEach(f => {
                        const rFrom = activeProject.roles.find(r => r.id === f.from);
                        const rTo = activeProject.roles.find(r => r.id === f.to);
                        const nameF = rFrom ? rFrom.name : 'Unknown';
                        const nameT = rTo ? rTo.name : 'Unknown';
                        flowOpts += `<option value="${f.id}">[${nameF} -> ${nameT}] ${f.template}</option>`;
                    });
                    selFlow.innerHTML = flowOpts;

                    let userOpts = `<option value="">-- Dejar Libre en "Oportunidades" --</option>`;
                    (activeProject.usuarios || []).forEach(u => {
                        const gUser = store.getState().globalUsers.find(gu => gu.id === u.id);
                        userOpts += `<option value="${u.id}">${gUser ? gUser.name : u.id}</option>`;
                    });
                    document.getElementById('newTaskAssignee').innerHTML = userOpts;

                    createModal.style.display = 'flex';
                }
            });
        }

        const btnCancelCreateTask = document.getElementById('btnCancelCreateTask');
        if (btnCancelCreateTask) {
            btnCancelCreateTask.addEventListener('click', () => createModal.style.display = 'none');
        }

        const btnConfirmCreateTask = document.getElementById('btnConfirmCreateTask');
        if (btnConfirmCreateTask) {
            btnConfirmCreateTask.addEventListener('click', async () => {
                const selFlow = document.getElementById('newTaskFlowId');
                const flowId = selFlow.value;
                const desc = document.getElementById('newTaskDesc').value.trim();
                const assignee = document.getElementById('newTaskAssignee').value;
                
                if(!flowId) return alert("Selecciona un Flujo base.");

                const newHash = 'wo_' + Math.random().toString(36).substr(2, 9);

                await store.dispatch({
                    type: 'SPAWN_WORK_ORDER',
                    payload: {
                        projectId: this.activeProjectId,
                        workOrder: {
                            hash: newHash,
                            flowId: flowId,
                            comentario: desc,
                            status: 'theoretical',
                            realHours: 0
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
                
                // Reset select
                if(selMagic) selMagic.selectedIndex = 0;
            });
        }

        // KANBAN ACTIONS LOGIC (V10 & V9 Legacy Support)
        const taskGrid = document.getElementById('taskGrid');
        taskGrid.addEventListener('click', async (e) => {
            const target = e.target.closest('button'); 
            if (!target) return;

            const currentState = store.getState();
            const currProject = currentState.projects.find(p => p.id === this.activeProjectId);
            if (!currProject) return;

            const isLegacyTx = target.dataset.legacy === "true";
            const txHash = target.dataset.hash;

            const isPO = currProject.ownerId === activeUserId || currentState.session.role === 'ecosystem-owner';

            if (target.classList.contains('btn-approve')) {
                if (!isPO) return alert("Solo el dueño del proyecto puede aprobar tareas."); // Muro de Cristal
                
                const action = target.dataset.action;
                if (action === 'approve-pull') {
                    const targetUserId = target.dataset.userid;
                    const actType = isLegacyTx ? 'PING_TRANSACTION' : 'PING_WORK_ORDER';
                    const payload = isLegacyTx ? { projectId: currProject.id, txHash, userId: targetUserId } : { projectId: currProject.id, woHash: txHash, userId: targetUserId };
                    await store.dispatch({ type: actType, payload });
                    this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                } 
                else if (action === 'consolidate') {
                    if (confirm('¿Aprobar Proof of Work y generar Slices inmutables?')) {
                        const actType = isLegacyTx ? 'APPROVE_TRANSACTION' : 'APPROVE_WORK_ORDER';
                        const payload = isLegacyTx ? { projectId: currProject.id, txHash } : { projectId: currProject.id, woHash: txHash };
                        await store.dispatch({ type: actType, payload });
                        this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                    }
                }
                return;
            }

            if (target.classList.contains('btn-pull')) {
                const action = target.dataset.action;
                const actType = isLegacyTx 
                    ? (action === 'request' ? 'REQUEST_TRANSACTION' : 'PING_TRANSACTION')
                    : (action === 'request' ? 'REQUEST_WORK_ORDER' : 'PING_WORK_ORDER');
                
                const payload = isLegacyTx 
                    ? { projectId: currProject.id, txHash, userId: currentState.session.activeUserId }
                    : { projectId: currProject.id, woHash: txHash, userId: currentState.session.activeUserId };

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
                    const payload = isLegacyTx ? { projectId: currProject.id, txHash, userId: targetUserId } : { projectId: currProject.id, woHash: txHash, userId: targetUserId };
                    await store.dispatch({ type: actType, payload });
                    this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                }
                return;
            }
        });

        this.renderTasks(project);
    }

    renderTasks(project) {
        const grid = document.getElementById('taskGrid');
        grid.innerHTML = '';

        const state = store.getState();
        const activeUser = state.session.activeUserId;
        const isPO = project.ownerId === activeUser || state.session.role === 'ecosystem-owner';
        
        let counts = { op: 0, cur: 0, con: 0 };
        let activeCardsHtml = [];

        const allTasks = [
            ...(project.work_orders || []).map(wo => ({ ...wo, isWorkOrder: true })),
            ...(project.transactions || []).map(tx => ({ ...tx, isWorkOrder: false }))
        ];

        allTasks.forEach(tx => {
            let tabCategory = '';
            if (tx.status === 'theoretical' || tx.status === 'requested') { tabCategory = 'oportunidades'; counts.op++; }
            else if (tx.status === 'pinged' || tx.status === 'reported') { tabCategory = 'en-curso'; counts.cur++; }
            else if (tx.status === 'consolidated' || tx.status === 'approved') { tabCategory = 'contabilizado'; counts.con++; }

            if (tabCategory !== this.currentTab) return;

            let flowData = null;
            if (tx.isWorkOrder) {
                flowData = (project.vna_flows || []).find(f => f.id === tx.flowId) || { tipo: 'tangible', template: 'Tarea Huérfana', estimatedHours: 0 };
            } else {
                flowData = tx; 
            }

            if (this.currentFilter === 'tangible' && flowData.tipo !== 'tangible') return;
            if (this.currentFilter === 'intangible' && flowData.tipo !== 'intangible') return;
            
            if (this.currentFilter === 'mine') {
                if (tx.status !== 'theoretical' && tx.assigneeId !== activeUser) return;
            }
            if (!isPO && this.currentFilter === 'all') {
                if (tabCategory !== 'oportunidades' && tx.assigneeId !== activeUser) return;
            }

            activeCardsHtml.push(this.createTaskCardHTML(tx, flowData, project, state.session, isPO));
        });

        const badgeOp = document.getElementById('badge-oportunidades');
        const badgeCur = document.getElementById('badge-en-curso');
        const badgeCon = document.getElementById('badge-contabilizado');
        
        if(badgeOp) badgeOp.innerText = counts.op;
        if(badgeCur) badgeCur.innerText = counts.cur;
        if(badgeCon) badgeCon.innerText = counts.con;

        if (activeCardsHtml.length > 0) {
            grid.innerHTML = activeCardsHtml.join('');
        } else {
            let emptyMsg = "No hay tareas en esta categoría.";
            if (this.currentTab === 'oportunidades') emptyMsg = "No hay oportunidades libres en el mercado de la red.";
            if (this.currentTab === 'en-curso') emptyMsg = "No hay ninguna tarea activa en proceso.";
            if (this.currentTab === 'contabilizado') emptyMsg = "Aún no se han sellado Slices en esta red.";
            
            grid.innerHTML = `<div class="empty-state">${emptyMsg}</div>`;
        }
    }

    createTaskCardHTML(tx, flowData, project, session, isPO) {
        const role = project.roles.find(r => r.id === flowData.from) || { name: 'Nodo Borrado', levelId: '@baixos' };
        const receiverRole = project.roles.find(r => r.id === flowData.to) || { name: 'Destino', levelId: '?' };
        
        const color = this.getColorForLevel(role.levelId);
        const tipoColor = flowData.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';
        const tipoEmoji = flowData.tipo === 'tangible' ? '🟢' : '🟣';
        
        const isLegacy = !tx.isWorkOrder;
        const hashAttr = `data-hash="${tx.hash}" data-legacy="${isLegacy}"`;

        let actionHtml = '';
        let statusTag = '';

        if (tx.status === 'theoretical') {
            statusTag = `<span style="color:#aaa; font-size:0.7rem; border:1px solid #444; padding:4px 10px; border-radius:12px; font-weight:bold; letter-spacing:1px;">LIBRE</span>`;
            if (isPO) {
                actionHtml = `
                    <button class="btn-pull" ${hashAttr} title="Adjudicarme la tarea">📥 Hacer PULL</button>
                    <button class="btn-push" ${hashAttr} title="Asignar a un miembro de la Colla">👤 Delegar (PUSH)</button>
                `;
            } else {
                actionHtml = `<button class="btn-pull" data-action="request" ${hashAttr}>✋ Solicitar Asignación</button>`;
            }
        } 
        else if (tx.status === 'requested') {
            statusTag = `<span style="color:var(--accent-red); font-size:0.7rem; border:1px solid var(--accent-red); padding:4px 10px; border-radius:12px; font-weight:bold; letter-spacing:1px; background:rgba(255,82,82,0.1);">SOLICITADO</span>`;
            const requester = store.getState().globalUsers.find(u => u.id === tx.assigneeId);
            const reqName = requester ? requester.name : tx.assigneeId;
            
            if (isPO) {
                actionHtml = `
                    <div style="font-size: 0.85rem; color: #ccc; margin-bottom: 10px; background:rgba(0,0,0,0.5); padding:10px; border-radius:8px; border-left:2px solid var(--accent-red);">
                        <b>${reqName}</b> solicita ejecutar esto.
                    </div>
                    <button class="btn-approve" data-action="approve-pull" ${hashAttr} data-userid="${tx.assigneeId}">✅ Aprobar Asignación</button>
                `;
            } else {
                actionHtml = `<div style="color: var(--accent-orange); font-size: 0.85rem; text-align: center; padding: 10px; border: 1px dashed var(--accent-orange); border-radius: 8px;">✋ Esperando aprobación del Project Owner...</div>`;
            }
        }
        else if (tx.status === 'pinged') {
            statusTag = `<span style="color:var(--accent-orange); font-size:0.7rem; border:1px solid var(--accent-orange); padding:4px 10px; border-radius:12px; font-weight:bold; letter-spacing:1px; background:rgba(255,171,64,0.1);">EN CURSO</span>`;
            const isMine = tx.assigneeId === session.activeUserId;
            if (isMine) {
                actionHtml = `<a href="/v5/focus?hash=${tx.hash}&legacy=${isLegacy}" class="btn-focus" data-link>▶ MODO FOCUS / REPORTAR</a>`;
            } else {
                const worker = store.getState().globalUsers.find(u => u.id === tx.assigneeId);
                actionHtml = `<div style="color: #888; font-size: 0.85rem; text-align: center; padding: 12px; background:rgba(0,0,0,0.4); border-radius: 10px; border:1px solid #333;">Ejecutando: <span style="color:white; font-weight:bold;">${worker ? worker.name : tx.assigneeId}</span></div>`;
            }
        } 
        else if (tx.status === 'reported') {
            statusTag = `<span style="color:var(--accent-blue); font-size:0.7rem; border:1px solid var(--accent-blue); padding:4px 10px; border-radius:12px; font-weight:bold; letter-spacing:1px; background:rgba(0,176,255,0.1);">AUDITORÍA</span>`;
            actionHtml = `
                <div style="font-size: 0.85rem; color: #ccc; background: rgba(0,0,0,0.6); padding: 12px; border-radius: 10px; margin-bottom: 12px; display:flex; justify-content:space-between; align-items:center; border-left:3px solid var(--accent-blue);">
                    <span>Horas Reales: <strong style="color: white; font-family:var(--font-mono); font-size:1rem;">${tx.realHours}h</strong></span>
                    <a href="${tx.proofLink}" target="_blank" style="color: var(--accent-blue); font-weight:bold; text-decoration:none;">${tx.proofLink ? '🔗 Ver Proof' : 'No Link'}</a>
                </div>
                ${isPO ? `<button class="btn-approve" data-action="consolidate" ${hashAttr}>✅ Sellar en Ledger</button>` : `<div style="font-size:0.8rem; color:#888; text-align:center; padding:10px; border:1px dashed #333; border-radius:8px;">Pendiente de firma del PO.</div>`}
            `;
        }
        else if (tx.status === 'consolidated') {
            statusTag = `<span style="color:var(--accent-green); font-size:0.7rem; border:1px solid var(--accent-green); padding:4px 10px; border-radius:12px; font-weight:bold; letter-spacing:1px; background:rgba(0,230,118,0.1);">SELLADO</span>`;
            actionHtml = `
                <div style="color: var(--accent-green); font-size: 1.2rem; font-weight: 900; font-family: var(--font-mono); text-align: center; padding: 15px; background: rgba(0, 230, 118, 0.05); border-radius: 12px; border: 1px dashed var(--accent-green);">
                    +${Math.round(tx.valorCongelado || 0).toLocaleString()} Slices
                </div>
            `;
        }

        const borderStyle = tx.status === 'requested' ? 'border-color: var(--accent-red); box-shadow: 0 0 20px rgba(255,82,82,0.15);' : '';
        const titleText = flowData.template || flowData.entregable || 'Work Order';
        
        const contextText = tx.comentario || tx.descripcionContexto || flowData.context || '';
        const contextHtml = contextText ? `<div class="task-desc-bubble">💬 "${contextText}"</div>` : '';
        const hoursText = flowData.estimatedHours || flowData.horas || 1;

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
                
                <div class="task-meta-row">
                    <span style="font-weight:bold; color:white; font-family:var(--font-mono);">⏱ ${hoursText}h <span style="color:#666; font-weight:normal; font-family:var(--font-main);">Est.</span></span>
                    <span style="color: ${tipoColor}; font-weight: bold; font-size:0.75rem; letter-spacing:1px;">${tipoEmoji} ${flowData.tipo.toUpperCase()}</span>
                </div>

                <div class="task-actions">
                    ${actionHtml}
                </div>
            </div>
        `;
    }

    getColorForLevel(levelId) {
        const colors = { '@anxaneta': 'var(--accent-red)', '@aixecador': '#ff4081', '@dosos': 'var(--accent-purple)', '@baixos': 'var(--accent-indigo)', '@pinya': 'var(--accent-blue)' };
        return colors[levelId] || '#aaa';
    }
}
