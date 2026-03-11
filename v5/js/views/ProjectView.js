// v5/js/views/ProjectView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';

export default class ProjectView {
    constructor() {
        document.title = "Tareas | TeamTowers";
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
        const statusBtnText = isOpen ? '🟢 Disponible' : '🔴 Ocupado';

        // Configuración del Header Universal
        const headerConfig = {
            title: "Tareas",
            subtitle: project ? project.nombre : '',
            tagline: "Kanban de oportunidades, en curso y contabilizado.",
            actionHtml: `
                <div style="display:flex; gap:10px; align-items:center;">
                    <button id="btnToggleAvailability" class="${statusBtnClass}" title="Alternar Estado de Matching">${statusBtnText}</button>
                </div>
            `,
            tabs: [
                { id: 'oportunidades', label: 'Oportunidades', active: this.currentTab === 'oportunidades', badge: '0' },
                { id: 'en-curso', label: 'En Curso', active: this.currentTab === 'en-curso', badge: '0' },
                { id: 'contabilizado', label: 'Contabilizado', active: this.currentTab === 'contabilizado', badge: '0' }
            ]
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { display: block; flex: 1; padding: 2rem 3rem; overflow-y: auto; height: 100%; box-sizing: border-box; scroll-behavior: smooth; transition: box-shadow 0.5s ease-out;}
                
                /* MAGIA VISUAL: Destello si estás disponible */
                .workspace.is-open-to-work { box-shadow: inset 0 0 120px rgba(0, 230, 118, 0.05); }

                /* ESTADOS DISPONIBILIDAD */
                .btn-status-closed { background: rgba(255, 82, 82, 0.1); border: 1px solid var(--accent-red); color: var(--accent-red); padding: 8px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; font-family: var(--font-mono); cursor:pointer; transition: all 0.2s;}
                .btn-status-open { background: rgba(0, 230, 118, 0.1); border: 1px solid var(--accent-green); color: var(--accent-green); padding: 8px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; font-family: var(--font-mono); cursor:pointer; transition: all 0.2s; box-shadow: 0 0 10px rgba(0,230,118,0.2);}

                /* CONTROLES SECUNDARIOS (Filtros y Crear) */
                .controls-row { display: flex; justify-content: flex-end; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 15px;}
                .filters-container { display:flex; gap: 10px; width: 100%; justify-content: flex-end;}
                .filter-dropdown { background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: white; padding: 8px 15px; border-radius: 8px; font-family: inherit; font-size: 0.85rem; outline: none; cursor: pointer; transition: border-color 0.2s;}
                .filter-dropdown:focus, .filter-dropdown:hover { border-color: var(--accent-blue); }

                .btn-create-task { background: linear-gradient(45deg, var(--accent-green), #00bfa5); color: black; border: none; padding: 8px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; display: none; align-items: center; justify-content:center; gap: 5px; white-space:nowrap;}
                .btn-create-task:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 230, 118, 0.3); }

                /* =========================================================
                   GRID DE TARJETAS (DESKTOP)
                   ========================================================= */
                .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; align-items: start; padding-bottom: 2rem;}
                
                .task-card { background: rgba(20, 20, 25, 0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; position: relative; display: flex; flex-direction: column; gap: 12px; backdrop-filter: blur(10px);}
                .task-card:hover { transform: translateY(-4px); border-color: #555; box-shadow: 0 10px 20px rgba(0,0,0,0.3);}
                
                .task-header { display: flex; justify-content: space-between; align-items: center; }
                .task-route { display: flex; gap: 6px; align-items: center; flex-wrap: wrap;}
                .route-badge { font-size: 0.65rem; padding: 4px 8px; border-radius: 6px; font-family: var(--font-mono); font-weight: bold; border: 1px solid;}
                .tx-hash { font-size: 0.65rem; color: #555; font-family: var(--font-mono); }
                
                .task-title { color: white; font-size: 1.15rem; margin: 5px 0; line-height: 1.4; font-weight: 600;}
                .task-desc-bubble { font-size: 0.8rem; color: #aaa; background: rgba(0,0,0,0.4); padding: 10px; border-radius: 8px; border-left: 2px solid var(--accent-blue); margin-bottom: 5px; font-style: italic;}
                
                .task-meta-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: #888; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; }
                
                .task-actions { margin-top: auto; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 8px;}
                
                /* BOTONES ESPECÍFICOS */
                .btn-pull { background: transparent; border: 1px solid var(--text-muted); color: white; transition: all 0.2s; width: 100%; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; justify-content: center; align-items: center; gap: 8px;}
                .btn-pull:hover { background: white; color: black; border-color: white;}
                
                .btn-push { background: transparent; border: 1px dashed var(--accent-purple); color: var(--accent-purple); transition: all 0.2s; width: 100%; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold; }
                .btn-push:hover { background: rgba(224, 64, 251, 0.1); }

                .btn-focus { background: linear-gradient(45deg, rgba(0, 176, 255, 0.1), rgba(0, 176, 255, 0.2)); border: 1px solid var(--accent-blue); color: var(--accent-blue); display: block; text-align: center; text-decoration: none; padding: 10px; border-radius: 8px; font-weight: bold; transition: all 0.2s;}
                .btn-focus:hover { background: var(--accent-blue); color: black; box-shadow: 0 0 15px rgba(0,176,255,0.4);}
                
                .btn-approve { background: var(--accent-green); color: black; border: none; padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: transform 0.2s; width: 100%;}
                .btn-approve:hover { transform: scale(1.02); box-shadow: 0 0 15px rgba(0,230,118,0.4);}

                .empty-state { grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: var(--text-muted); font-size: 1.1rem; border: 1px dashed #333; border-radius: 12px; background: rgba(0,0,0,0.2);}

                /* =========================================================
                   MODALS (CREAR TAREA Y FEEDBACK VNA)
                   ========================================================= */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); display: none; justify-content: center; align-items: center; z-index: 4000; }
                .modal-content { background: var(--bg-panel); border: 1px solid #333; padding: 2.5rem; border-radius: 12px; width: 500px; max-width: 95%; box-shadow: 0 20px 50px rgba(0,0,0,0.8); animation: slideUp 0.3s ease-out; box-sizing: border-box; max-height: 90vh; overflow-y:auto;}
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 5px; font-weight: bold; }
                .form-control { background: #050505; border: 1px solid #333; color: white; padding: 10px 12px; border-radius: 6px; font-family: inherit; font-size: 0.95rem; outline: none; width: 100%; transition: border-color 0.2s; box-sizing: border-box; }
                .form-control:focus { border-color: var(--accent-blue); }

                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                /* =========================================================
                   RESPONSIVE MOBILE LUXURY APP (FIELD APP)
                   ========================================================= */
                @media (max-width: 768px) {
                    .workspace { padding: 80px 1rem 90px 1rem; } 
                    
                    .controls-row { flex-direction: column; align-items: stretch; gap: 15px; margin-bottom: 1rem;}
                    .filters-container { flex-direction: column; width: 100%;}
                    .filter-dropdown { width: 100%; padding: 12px;}
                    .btn-create-task { width: 100%; padding: 12px;}
                    
                    /* LUXURY LIST VIEW PARA MÓVIL */
                    .task-grid { display: flex; flex-direction: column; gap: 12px;}
                    .task-card { 
                        padding: 1.2rem 1rem; 
                        border-radius: 16px; /* Más redondeado, tipo Wallet */
                        background: rgba(255, 255, 255, 0.03); 
                        border: 1px solid rgba(255, 255, 255, 0.08);
                    }
                    .task-title { font-size: 1.1rem; line-height: 1.3; }
                    .task-meta-row { background: transparent; padding: 0; margin-top: 5px; flex-wrap: wrap; gap: 5px;}
                    
                    /* Botones grandes y ergonómicos para el pulgar */
                    .task-actions { padding-top: 15px; margin-top: 10px; border-top: 1px dashed rgba(255,255,255,0.1); }
                    .btn-pull, .btn-push, .btn-focus, .btn-approve { padding: 14px; font-size: 0.95rem; border-radius: 10px;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/project')}

                <main class="workspace ${isOpen ? 'is-open-to-work' : ''}">
                    
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="controls-row">
                        <div class="filters-container">
                            <select id="filterDropdown" class="filter-dropdown">
                                <option value="all">Filtros: Todas las tareas</option>
                                <option value="mine">👤 Solo mis tareas</option>
                                <option value="tangible">🟢 Solo Tangibles</option>
                                <option value="intangible">🟣 Solo Intangibles</option>
                            </select>
                            <button class="btn-create-task" id="btnOpenCreateTask">➕ Nueva Tarea</button>
                        </div>
                    </div>

                    <div class="task-grid" id="taskGrid"></div>
                </main>

                <div class="modal-overlay" id="createTaskModal">
                    <div class="modal-content">
                        <h2 style="color:white; margin-top:0; margin-bottom: 5px;">Añadir Tarea</h2>
                        <p style="color:#888; font-size:0.8rem; margin-bottom:1.5rem;">Crea un entregable para la red.</p>
                        
                        <div style="display:flex; gap:10px;">
                            <div class="form-group" style="flex:1;">
                                <label>Origen (Quién lo hace)</label>
                                <select id="newTaskFrom" class="form-control"></select>
                            </div>
                            <div class="form-group" style="flex:1;">
                                <label>Destino (Quién lo recibe)</label>
                                <select id="newTaskTo" class="form-control"></select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Entregable</label>
                            <select id="newTaskTemplate" class="form-control" style="background: rgba(0, 176, 255, 0.1); border-color: var(--accent-blue);">
                                <option value="">Selecciona Origen primero...</option>
                            </select>
                            <input type="text" id="newTaskName" class="form-control" placeholder="Nombre del nuevo entregable..." style="display:none; margin-top:10px;">
                        </div>

                        <div class="form-group">
                            <label>Contexto / Instrucciones (Opcional)</label>
                            <textarea id="newTaskDesc" class="form-control" rows="2" placeholder="Detalles de lo que se espera de esta tarea..."></textarea>
                        </div>

                        <div style="display:flex; gap:10px;">
                            <div class="form-group" style="flex:1;">
                                <label>Tipo de Valor</label>
                                <select id="newTaskType" class="form-control">
                                    <option value="tangible">🟢 Tangible (Código, Diseño...)</option>
                                    <option value="intangible">🟣 Intangible (Auditoría, Plan...)</option>
                                </select>
                            </div>
                            <div class="form-group" style="width:100px;">
                                <label>Horas Est.</label>
                                <input type="number" id="newTaskHours" class="form-control" value="2" min="0.5" step="0.5">
                            </div>
                        </div>

                        <div class="form-group" style="margin-top: 10px; border-top: 1px dashed #333; padding-top: 15px;">
                            <label style="color:var(--accent-orange);">Asignar Directamente a (Opcional)</label>
                            <select id="newTaskAssignee" class="form-control">
                                <option value="">Dejar Libre en "Oportunidades"</option>
                            </select>
                        </div>

                        <div style="display: flex; justify-content: space-between; margin-top: 1.5rem;">
                            <button class="btn btn-outline" style="background:transparent; border:1px solid #555; color:white; padding:10px 20px; border-radius:8px; cursor:pointer;" id="btnCancelCreateTask">Cancelar</button>
                            <button class="btn btn-primary" style="background:var(--accent-blue); color:black; font-weight:bold; border:none; padding:10px 20px; border-radius:8px; cursor:pointer;" id="btnConfirmCreateTask">Añadir Tarea</button>
                        </div>
                    </div>
                </div>
                
                ${BottomNav.getHtml('/project')}
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute(); // Inicializa el selector móvil

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

        const isPO = project.ownerId === state.session.activeUserId || state.session.role === 'ecosystem-owner';
        
        // VISIBILIDAD DE BOTÓN CREAR
        if (!isPO) {
            this.currentFilter = 'all'; 
        } else {
            document.getElementById('btnOpenCreateTask').style.display = 'flex';
        }

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

        // -------------------------------------------------------------
        // EVENTO DISPONIBILIDAD (EL FIX DEL BUG)
        // -------------------------------------------------------------
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
                    
                    // Efectos visuales inmediatos
                    btnToggleAvailability.className = newStatus ? 'btn-status-open' : 'btn-status-closed';
                    btnToggleAvailability.innerText = newStatus ? '🟢 Disponible' : '🔴 Ocupado';
                    
                    const workspace = document.querySelector('.workspace');
                    if (newStatus) {
                        workspace.classList.add('is-open-to-work');
                    } else {
                        workspace.classList.remove('is-open-to-work');
                    }
                }
            });
        }

        // -------------------------------------------------------------
        // LÓGICA DE CREACIÓN DE TAREAS Y MAPA VNA
        // -------------------------------------------------------------
        const createModal = document.getElementById('createTaskModal');
        
        const selFrom = document.getElementById('newTaskFrom');
        const selTo = document.getElementById('newTaskTo');
        const selTemplate = document.getElementById('newTaskTemplate');
        const inpName = document.getElementById('newTaskName');
        const selType = document.getElementById('newTaskType');
        const inpHours = document.getElementById('newTaskHours');

        const updateTemplatesDropdown = () => {
            const p = store.getState().projects.find(proj => proj.id === this.activeProjectId);
            const roleId = selFrom.value;
            const r = p.roles.find(rol => rol.id === roleId);
            const levelId = r ? r.levelId : '@baixos';
            
            const sectorData = GLOBAL_ONTOLOGY[p.sector || 'startup_tech'];
            let templates = [];
            if (sectorData && sectorData[levelId] && sectorData[levelId].standard_deliverables) {
                templates = sectorData[levelId].standard_deliverables;
            }

            let html = `<option value="">-- Selecciona Entregable --</option>`;
            templates.forEach((t, i) => {
                html += `<option value="${i}" data-type="${t.tipo}" data-hrs="${t.estimatedHours}">${t.tipo === 'tangible' ? '🟢' : '🟣'} ${t.name}</option>`;
            });
            html += `<option value="manual" style="font-weight:bold; color:var(--accent-orange);">✍️ Crear Nuevo (Mutar Mapa VNA)...</option>`;
            
            selTemplate.innerHTML = html;
            inpName.style.display = 'none';
        };

        document.getElementById('btnOpenCreateTask').addEventListener('click', () => {
            const activeProject = store.getState().projects.find(p => p.id === this.activeProjectId);
            const roleOpts = activeProject.roles.filter(r => !r.isArchived).map(r => `<option value="${r.id}">${r.name} (${r.levelId})</option>`).join('');
            selFrom.innerHTML = roleOpts;
            selTo.innerHTML = roleOpts;
            if(activeProject.roles.length > 1) selTo.selectedIndex = 1;

            let userOpts = `<option value="">-- Dejar Libre en Mercado --</option>`;
            (activeProject.usuarios || []).forEach(u => {
                const gUser = store.getState().globalUsers.find(gu => gu.id === u.id);
                userOpts += `<option value="${u.id}">${gUser ? gUser.name : u.id}</option>`;
            });
            document.getElementById('newTaskAssignee').innerHTML = userOpts;

            updateTemplatesDropdown();
            createModal.style.display = 'flex';
        });

        selFrom.addEventListener('change', updateTemplatesDropdown);
        
        selTemplate.addEventListener('change', (e) => {
            if (e.target.value === 'manual') {
                inpName.style.display = 'block';
                inpName.value = '';
                inpName.focus();
            } else if (e.target.value !== "") {
                inpName.style.display = 'none';
                const selectedOpt = e.target.options[e.target.selectedIndex];
                selType.value = selectedOpt.getAttribute('data-type');
                inpHours.value = selectedOpt.getAttribute('data-hrs');
            } else {
                inpName.style.display = 'none';
            }
        });

        document.getElementById('btnCancelCreateTask').addEventListener('click', () => createModal.style.display = 'none');

        document.getElementById('btnConfirmCreateTask').addEventListener('click', async () => {
            const from = selFrom.value;
            const to = selTo.value;
            const desc = document.getElementById('newTaskDesc').value.trim();
            const assignee = document.getElementById('newTaskAssignee').value;
            
            let finalName = "";
            let type = selType.value;
            let hours = parseFloat(inpHours.value) || 1;
            
            const isManualNewFlow = selTemplate.value === 'manual';

            if (isManualNewFlow) {
                finalName = inpName.value.trim();
            } else {
                const selectedOpt = selTemplate.options[selTemplate.selectedIndex];
                if (!selectedOpt || selectedOpt.value === "") return alert("Selecciona un entregable o crea uno nuevo.");
                finalName = selectedOpt.innerText.replace('🟢 ', '').replace('🟣 ', '');
            }

            if(!finalName) return alert("Por favor, introduce el nombre del entregable.");
            if(from === to) return alert("Una tarea debe fluir entre dos roles diferentes para aportar valor.");

            const newHash = 'tx_' + Math.random().toString(36).substr(2, 9);

            await store.dispatch({
                type: 'ADD_TRANSACTION',
                payload: {
                    projectId: this.activeProjectId,
                    tx: {
                        hash: newHash,
                        from: from,
                        to: to,
                        entregable: finalName,
                        descripcionContexto: desc,
                        tipo: type,
                        horas: hours,
                        status: 'theoretical'
                    }
                }
            });

            if (assignee !== "") {
                await store.dispatch({
                    type: 'PING_TRANSACTION',
                    payload: { projectId: this.activeProjectId, txHash: newHash, userId: assignee }
                });
            }

            createModal.style.display = 'none';
            this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
        });

        // -------------------------------------------------------------
        // KANBAN ACTIONS LOGIC
        // -------------------------------------------------------------
        const taskGrid = document.getElementById('taskGrid');
        taskGrid.addEventListener('click', async (e) => {
            const target = e.target;
            const currentState = store.getState();
            const currProject = currentState.projects.find(p => p.id === this.activeProjectId);
            if (!currProject) return;

            if (target.classList.contains('btn-approve')) {
                const action = target.dataset.action;
                const txHash = target.dataset.hash;

                if (action === 'approve-pull') {
                    const targetUserId = target.dataset.userid;
                    await store.dispatch({ type: 'PING_TRANSACTION', payload: { projectId: currProject.id, txHash, userId: targetUserId } });
                    this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                } 
                else if (action === 'consolidate') {
                    if (confirm('¿Aprobar Proof of Work y generar Slices inmutables?')) {
                        await store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId: currProject.id, txHash } });
                        this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                    }
                }
                return;
            }

            if (target.classList.contains('btn-pull')) {
                const txHash = target.dataset.hash;
                const action = target.dataset.action;
                
                if (action === 'request') {
                    await store.dispatch({ type: 'REQUEST_TRANSACTION', payload: { projectId: currProject.id, txHash, userId: currentState.session.activeUserId } });
                } else {
                    await store.dispatch({ type: 'PING_TRANSACTION', payload: { projectId: currProject.id, txHash, userId: currentState.session.activeUserId } });
                }
                this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                return;
            }

            if (target.classList.contains('btn-push')) {
                const txHash = target.dataset.hash;
                const usersInProject = currProject.usuarios || [];
                
                if (usersInProject.length === 0) return alert("No hay miembros en la Colla para delegar.");
                
                let userListStr = "IDs disponibles:\n";
                usersInProject.forEach(u => {
                    const globalData = currentState.globalUsers.find(gu => gu.id === u.id);
                    userListStr += `- ${u.id} (${globalData ? globalData.name : 'Unknown'})\n`;
                });

                const targetUserId = prompt(`Introduce el ID del usuario al que asignarás esta tarea:\n\n${userListStr}`);
                
                if (targetUserId) {
                    const exists = usersInProject.find(u => u.id === targetUserId);
                    if (!exists && targetUserId !== currProject.ownerId) {
                        return alert("Ese usuario no es miembro del proyecto. Invítalo primero.");
                    }
                    await store.dispatch({ type: 'PING_TRANSACTION', payload: { projectId: currProject.id, txHash, userId: targetUserId } });
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

        const txs = project.transactions || [];
        const state = store.getState();
        const activeUser = state.session.activeUserId;
        const isPO = project.ownerId === activeUser || state.session.role === 'ecosystem-owner';
        
        let counts = { op: 0, cur: 0, con: 0 };
        let activeCardsHtml = [];

        txs.forEach(tx => {
            let tabCategory = '';
            if (tx.status === 'theoretical' || tx.status === 'requested') { tabCategory = 'oportunidades'; counts.op++; }
            else if (tx.status === 'pinged' || tx.status === 'reported') { tabCategory = 'en-curso'; counts.cur++; }
            else if (tx.status === 'consolidated' || tx.status === 'approved') { tabCategory = 'contabilizado'; counts.con++; }

            if (tabCategory !== this.currentTab) return;

            if (this.currentFilter === 'tangible' && tx.tipo !== 'tangible') return;
            if (this.currentFilter === 'intangible' && tx.tipo !== 'intangible') return;
            if (this.currentFilter === 'mine') {
                if (tx.status !== 'theoretical' && tx.assigneeId !== activeUser) return;
            }
            if (!isPO && this.currentFilter === 'all') {
                if (tabCategory !== 'oportunidades' && tx.assigneeId !== activeUser) return;
            }

            activeCardsHtml.push(this.createTaskCardHTML(tx, project, state.session, isPO));
        });

        // Actualizar Badges Nativos del Componente PageHeader
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
            if (this.currentTab === 'contabilizado') emptyMsg = "Aún no se han consolidado Slices en esta red.";
            
            grid.innerHTML = `<div class="empty-state">${emptyMsg}</div>`;
        }
    }

    createTaskCardHTML(tx, project, session, isPO) {
        const role = project.roles.find(r => r.id === tx.from) || { name: 'Nodo Borrado', levelId: '@baixos' };
        const receiverRole = project.roles.find(r => r.id === tx.to) || { name: 'Destino', levelId: '?' };
        
        const color = this.getColorForLevel(role.levelId);
        const receiverColor = this.getColorForLevel(receiverRole.levelId);
        const tipoColor = tx.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';
        const tipoEmoji = tx.tipo === 'tangible' ? '🟢' : '🟣';

        let actionHtml = '';
        let statusTag = '';

        if (tx.status === 'theoretical') {
            statusTag = `<span style="color:#aaa; font-size:0.75rem; border:1px solid #555; padding:2px 8px; border-radius:12px;">LIBRE</span>`;
            if (isPO) {
                actionHtml = `
                    <button class="btn-pull" data-hash="${tx.hash}" title="Adjudicarme la tarea">📥 Hacer PULL</button>
                    <button class="btn-push" data-hash="${tx.hash}" title="Asignar a un miembro de la Colla">👤 Delegar (PUSH)</button>
                `;
            } else {
                actionHtml = `<button class="btn-pull" data-action="request" data-hash="${tx.hash}">✋ Solicitar Tarea</button>`;
            }
        } 
        else if (tx.status === 'requested') {
            statusTag = `<span style="color:var(--accent-red); font-size:0.75rem; border:1px solid var(--accent-red); padding:2px 8px; border-radius:12px;">SOLICITADO</span>`;
            const requester = store.getState().globalUsers.find(u => u.id === tx.assigneeId);
            const reqName = requester ? requester.name : tx.assigneeId;
            
            if (isPO) {
                actionHtml = `
                    <div style="font-size: 0.85rem; color: #ccc; margin-bottom: 10px; background:rgba(0,0,0,0.5); padding:10px; border-radius:8px;">
                        <b>${reqName}</b> solicita ejecutar esto.
                    </div>
                    <button class="btn-approve" data-action="approve-pull" data-hash="${tx.hash}" data-userid="${tx.assigneeId}">✅ Aprobar Asignación</button>
                `;
            } else {
                actionHtml = `<div style="color: var(--accent-orange); font-size: 0.85rem; text-align: center; padding: 10px; border: 1px dashed var(--accent-orange); border-radius: 8px;">✋ Esperando aprobación del PO...</div>`;
            }
        }
        else if (tx.status === 'pinged') {
            statusTag = `<span style="color:var(--accent-orange); font-size:0.75rem; border:1px solid var(--accent-orange); padding:2px 8px; border-radius:12px;">EN CURSO</span>`;
            const isMine = tx.assigneeId === session.activeUserId;
            if (isMine) {
                actionHtml = `<a href="/v5/focus" class="btn-focus" data-link>▶ MODO FOCUS / REPORTAR</a>`;
            } else {
                const worker = store.getState().globalUsers.find(u => u.id === tx.assigneeId);
                actionHtml = `<div style="color: #888; font-size: 0.85rem; text-align: center; padding: 10px; background:rgba(0,0,0,0.3); border-radius: 8px;">Ejecutando: <span style="color:white; font-weight:bold;">${worker ? worker.name : tx.assigneeId}</span></div>`;
            }
        } 
        else if (tx.status === 'reported') {
            statusTag = `<span style="color:var(--accent-blue); font-size:0.75rem; border:1px solid var(--accent-blue); padding:2px 8px; border-radius:12px;">AUDITORÍA</span>`;
            actionHtml = `
                <div style="font-size: 0.85rem; color: #ccc; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 8px; margin-bottom: 10px; display:flex; justify-content:space-between;">
                    <span>Horas Reales: <strong style="color: white;">${tx.realHours}h</strong></span>
                    <a href="${tx.proofLink}" target="_blank" style="color: var(--accent-blue); font-weight:bold; text-decoration:none;">${tx.proofLink ? '🔗 Ver Proof' : 'No Link'}</a>
                </div>
                ${isPO ? `<button class="btn-approve" data-action="consolidate" data-hash="${tx.hash}">✅ Sellar en Ledger</button>` : `<div style="font-size:0.8rem; color:#888; text-align:center;">Pendiente de firma del PO.</div>`}
            `;
        }
        else if (tx.status === 'consolidated') {
            statusTag = `<span style="color:var(--accent-green); font-size:0.75rem; border:1px solid var(--accent-green); padding:2px 8px; border-radius:12px;">CONSOLIDADO</span>`;
            actionHtml = `
                <div style="color: var(--accent-green); font-size: 1.1rem; font-weight: bold; font-family: var(--font-mono); text-align: center; padding: 12px; background: rgba(0, 230, 118, 0.05); border-radius: 8px; border: 1px dashed var(--accent-green);">
                    +${Math.round(tx.valorCongelado || 0).toLocaleString()} Slices
                </div>
            `;
        }

        const borderStyle = tx.status === 'requested' ? 'border-color: var(--accent-red); box-shadow: 0 0 15px rgba(255,82,82,0.1);' : '';
        const contextHtml = tx.descripcionContexto ? `<div class="task-desc-bubble">💬 "${tx.descripcionContexto}"</div>` : '';

        return `
            <div class="task-card" style="${borderStyle}">
                <div class="task-header">
                    <div class="task-route">
                        <span class="route-badge" style="color: ${color}; border-color: ${color};" title="${role.name}">${role.levelId}</span>
                        <span style="color: #666;">&rarr;</span>
                        <span class="route-badge" style="color: #888; border-color: #444;" title="${receiverRole.name}">${receiverRole.levelId}</span>
                    </div>
                    ${statusTag}
                </div>
                
                <h3 class="task-title">${tx.entregable}</h3>
                ${contextHtml}
                
                <div class="task-meta-row">
                    <span style="font-weight:bold; color:white;">⏱ ${tx.horas}h <span style="color:#666; font-weight:normal;">Est.</span></span>
                    <span style="color: ${tipoColor}; font-weight: bold; font-size:0.7rem;">${tipoEmoji} ${tx.tipo.toUpperCase()}</span>
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
