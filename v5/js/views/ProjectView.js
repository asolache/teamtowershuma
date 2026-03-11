// v5/js/views/ProjectView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { GLOBAL_ONTOLOGY } from '../data/ontology.js'; // Necesario para los templates

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
        const userProjects = state.projects.filter(p => 
            state.session.role === 'ecosystem-owner' || 
            p.ownerId === activeUserId || 
            (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
        );

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; display: flex; flex-direction: column; position: relative; scroll-behavior: smooth;}
                
                /* =========================================================
                   MOBILE TOP BAR
                   ========================================================= */
                .mobile-top-bar {
                    display: none; justify-content: space-between; align-items: center; padding: 15px 20px;
                    background: rgba(10, 10, 14, 0.95); border-bottom: 1px solid rgba(255,255,255,0.05);
                    backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 1000;
                    margin: -2rem -3rem 1.5rem -3rem; 
                }
                .mob-brand { display: flex; align-items: center; gap: 10px; color: white; text-decoration: none; font-weight: bold; font-size: 1.2rem;}
                .mob-project-select { background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: var(--accent-blue); padding: 5px 10px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.8rem; outline: none; max-width: 150px; }
                .mob-user { display: flex; align-items: center; justify-content: center; width: 35px; height: 35px; background: var(--accent-purple); color: white; border-radius: 50%; font-weight: bold; text-decoration: none; font-size: 0.9rem; }

                /* =========================================================
                   CABECERA Y CONTROLES
                   ========================================================= */
                .view-header { margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px;}
                .view-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; }
                .view-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 5px; }

                .controls-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border); margin-bottom: 2rem; flex-wrap: wrap; gap: 15px;}
                
                .tabs-container { display: flex; gap: 20px; overflow-x: auto; scrollbar-width: none; }
                .tabs-container::-webkit-scrollbar { display: none; }
                
                .tab-btn { background: transparent; border: none; color: var(--text-muted); font-size: 1rem; font-weight: bold; padding: 10px 5px 15px 5px; cursor: pointer; position: relative; transition: color 0.2s; white-space: nowrap; display: flex; align-items: center; gap: 8px;}
                .tab-btn:hover { color: white; }
                .tab-btn.active { color: var(--accent-blue); }
                .tab-btn.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 3px; background: var(--accent-blue); border-radius: 3px 3px 0 0; }
                
                .tab-badge { background: rgba(255,255,255,0.1); color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 12px; font-family: var(--font-mono); }
                .tab-btn.active .tab-badge { background: rgba(0, 176, 255, 0.2); color: var(--accent-blue); }

                .filters-container { padding-bottom: 5px; display:flex; gap: 10px;}
                .filter-dropdown { background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: white; padding: 8px 15px; border-radius: 8px; font-family: inherit; font-size: 0.85rem; outline: none; cursor: pointer; transition: border-color 0.2s;}
                .filter-dropdown:focus, .filter-dropdown:hover { border-color: var(--accent-blue); }

                .btn-create-task { background: linear-gradient(45deg, var(--accent-green), #00bfa5); color: black; border: none; padding: 8px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; display: none; align-items: center; gap: 5px;}
                .btn-create-task:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 230, 118, 0.3); }

                /* =========================================================
                   GRID DE TARJETAS
                   ========================================================= */
                .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; align-items: start; padding-bottom: 2rem;}
                
                .task-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1.5rem; transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; position: relative; display: flex; flex-direction: column; gap: 12px;}
                .task-card:hover { transform: translateY(-4px); border-color: #555; box-shadow: 0 10px 20px rgba(0,0,0,0.3);}
                
                .task-header { display: flex; justify-content: space-between; align-items: center; }
                .task-route { display: flex; gap: 8px; align-items: center; }
                .route-badge { font-size: 0.65rem; padding: 4px 8px; border-radius: 6px; font-family: var(--font-mono); font-weight: bold; border: 1px solid;}
                .tx-hash { font-size: 0.65rem; color: #555; font-family: var(--font-mono); }
                
                .task-title { color: white; font-size: 1.15rem; margin: 5px 0; line-height: 1.4; font-weight: 600;}
                .task-desc-bubble { font-size: 0.8rem; color: #aaa; background: rgba(0,0,0,0.4); padding: 10px; border-radius: 8px; border-left: 2px solid var(--accent-blue); margin-bottom: 5px; font-style: italic;}
                
                .task-meta-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: #888; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; }
                
                .task-actions { margin-top: auto; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 8px;}
                
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

                /* FEEDBACK VNA MODAL */
                #vnaFeedbackModal { z-index: 5000; background: rgba(5,5,7,0.95); backdrop-filter: blur(20px); flex-direction: column; text-align: center;}
                .vna-mini-map { display: flex; align-items: center; justify-content: center; gap: 15px; margin-top: 2rem; width: 100%; max-width: 400px;}
                .vna-node { width: 70px; height: 70px; border-radius: 50%; border: 2px solid white; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; background: rgba(255,255,255,0.05); position: relative;}
                .vna-node span { position: absolute; bottom: -25px; font-size: 0.7rem; color: #aaa; white-space: nowrap; font-family: var(--font-mono);}
                .vna-vector { flex: 1; height: 3px; background: var(--accent-green); position: relative; animation: flowPulse 0.8s infinite; }
                .vna-vector::after { content: '▶'; position: absolute; right: -10px; top: -9px; color: var(--accent-green); font-size: 1.2rem;}
                
                @keyframes flowPulse {
                    0% { opacity: 0.3; transform: scaleX(0.9); box-shadow: none; }
                    50% { opacity: 1; transform: scaleX(1); box-shadow: 0 0 20px var(--accent-green); }
                    100% { opacity: 0.3; transform: scaleX(0.9); box-shadow: none;}
                }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                /* =========================================================
                   RESPONSIVE
                   ========================================================= */
                @media (max-width: 768px) {
                    .workspace { padding: 1.5rem 1rem; padding-bottom: 90px;} 
                    .mobile-top-bar { display: flex; margin: -1.5rem -1rem 1.5rem -1rem; }
                    .view-header { flex-direction: column; align-items: flex-start; }
                    .view-header h1 { font-size: 1.8rem; }
                    .controls-row { flex-direction: column; align-items: stretch; gap: 15px; border-bottom: none;}
                    .tabs-container { border-bottom: 1px solid var(--glass-border); width: 100%; justify-content: space-between;}
                    .tab-btn { font-size: 0.9rem; padding: 10px 0; flex: 1; justify-content: center;}
                    .filters-container { flex-direction: column; width: 100%;}
                    .filter-dropdown { width: 100%; }
                    .btn-create-task { justify-content: center; padding: 12px; }
                    .task-grid { grid-template-columns: 1fr; gap: 1rem;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/project')}

                <main class="workspace">
                    <header class="mobile-top-bar">
                        <a href="/v5/" data-link class="mob-brand">🗼</a>
                        <select class="mob-project-select" id="mobProjectSelect">
                            ${userProjects.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}
                        </select>
                        <a href="/v5/profile" data-link class="mob-user" title="Mi Perfil">
                            ${state.globalUsers.find(u => u.id === activeUserId)?.name.charAt(0).toUpperCase() || '?'}
                        </a>
                    </header>

                    <div class="view-header">
                        <div>
                            <h1 id="viewTitle">Tareas</h1>
                            <p>Kanban de oportunidades, tareas en curso y contabilizado.</p>
                        </div>
                        <a href="/v5/map" class="btn btn-outline" data-link style="padding: 8px 15px; border-radius: 8px; text-decoration:none; font-size:0.9rem;">⚙️ Mapa VNA</a>
                    </div>

                    <div class="controls-row">
                        <div class="tabs-container" id="tabsContainer">
                            <button class="tab-btn active" data-tab="oportunidades">
                                Oportunidades <span class="tab-badge" id="count-op">0</span>
                            </button>
                            <button class="tab-btn" data-tab="en-curso">
                                En Curso <span class="tab-badge" id="count-cur">0</span>
                            </button>
                            <button class="tab-btn" data-tab="contabilizado">
                                Contabilizado <span class="tab-badge" id="count-con">0</span>
                            </button>
                        </div>
                        
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

                <div class="modal-overlay" id="vnaFeedbackModal">
                    <h2 style="color: white; font-size: 2.5rem; margin-bottom: 5px;">🗺️ Mapa VNA Actualizado</h2>
                    <p style="color: var(--accent-green); font-family: var(--font-mono);">Nuevo vector de valor detectado e inyectado en la red estructural.</p>
                    
                    <div class="vna-mini-map">
                        <div class="vna-node" id="fbNodeFrom" style="border-color: var(--accent-blue);">⚙️<span>Origen</span></div>
                        <div class="vna-vector" id="fbVector"></div>
                        <div class="vna-node" id="fbNodeTo" style="border-color: #888;">👁️<span>Destino</span></div>
                    </div>
                    <div style="margin-top: 40px; color: #888; font-size: 0.8rem;">Actualizando Kanban...</div>
                </div>
                
                ${BottomNav.getHtml('/project')}
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();

        const state = store.getState();
        
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        
        if (!project) {
            const userProjects = state.projects.filter(p => 
                state.session.role === 'ecosystem-owner' || 
                p.ownerId === state.session.activeUserId || 
                (p.usuarios && p.usuarios.find(u => u.id === state.session.activeUserId))
            );
            project = userProjects.length > 0 ? userProjects[userProjects.length - 1] : null;
            if(project) localStorage.setItem('tt_active_project', project.id);
        }

        if (!project) return;
        this.activeProjectId = project.id;
        
        document.getElementById('viewTitle').innerText = `Tareas (${project.nombre})`;

        const mobSelect = document.getElementById('mobProjectSelect');
        if (mobSelect) {
            mobSelect.value = this.activeProjectId;
            mobSelect.addEventListener('change', (e) => {
                localStorage.setItem('tt_active_project', e.target.value);
                window.location.reload(); 
            });
        }

        const isPO = project.ownerId === state.session.activeUserId || state.session.role === 'ecosystem-owner';
        if (!isPO) {
            this.currentFilter = 'all'; 
        } else {
            document.getElementById('btnOpenCreateTask').style.display = 'flex';
        }

        const tabsContainer = document.getElementById('tabsContainer');
        const filterDropdown = document.getElementById('filterDropdown');

        tabsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.tab-btn');
            if (btn) {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTab = btn.dataset.tab;
                this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
            }
        });

        filterDropdown.value = this.currentFilter;
        filterDropdown.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
        });

        // -------------------------------------------------------------
        // LOGICA DE CREACIÓN DE TAREAS Y MAPA VNA
        // -------------------------------------------------------------
        const createModal = document.getElementById('createTaskModal');
        const fbModal = document.getElementById('vnaFeedbackModal');
        
        const selFrom = document.getElementById('newTaskFrom');
        const selTo = document.getElementById('newTaskTo');
        const selTemplate = document.getElementById('newTaskTemplate');
        const inpName = document.getElementById('newTaskName');
        const selType = document.getElementById('newTaskType');
        const inpHours = document.getElementById('newTaskHours');

        // Función para cargar templates basados en el rol origen
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

            const activeProject = store.getState().projects.find(p => p.id === this.activeProjectId);
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
            
            // Lógica de Feedback Visual VNA
            if (isManualNewFlow) {
                const rFrom = activeProject.roles.find(r => r.id === from);
                const rTo = activeProject.roles.find(r => r.id === to);
                
                document.getElementById('fbNodeFrom').innerHTML = `${this.getIcon(rFrom.levelId)}<span>${rFrom.name}</span>`;
                document.getElementById('fbNodeFrom').style.borderColor = this.getColorForLevel(rFrom.levelId);
                
                document.getElementById('fbNodeTo').innerHTML = `${this.getIcon(rTo.levelId)}<span>${rTo.name}</span>`;
                document.getElementById('fbNodeTo').style.borderColor = this.getColorForLevel(rTo.levelId);
                
                const vColor = type === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';
                const vector = document.getElementById('fbVector');
                vector.style.backgroundColor = vColor;
                
                // Aplicamos pseudo-elemento de flecha cambiando la clase
                vector.style.boxShadow = `0 0 20px ${vColor}`;

                fbModal.style.display = 'flex';
                
                setTimeout(() => {
                    fbModal.style.display = 'none';
                    this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                }, 2800);
            } else {
                this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
            }
        });


        // -------------------------------------------------------------
        // KANBAN ACTIONS LOGIC (Delegación)
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

        document.getElementById('count-op').innerText = counts.op;
        document.getElementById('count-cur').innerText = counts.cur;
        document.getElementById('count-con').innerText = counts.con;

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
                    <button class="btn-pull" data-hash="${tx.hash}" title="Adjudicarme la tarea">📥 Hacer PULL (Asumírmela)</button>
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

    getIcon(l) { return { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[l] || '💠'; }
    getColorForLevel(levelId) {
        const colors = { '@anxaneta': 'var(--accent-red)', '@aixecador': '#ff4081', '@dosos': 'var(--accent-purple)', '@baixos': 'var(--accent-indigo)', '@pinya': 'var(--accent-blue)' };
        return colors[levelId] || '#aaa';
    }
}
