// v8/js/views/ProjectView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import { KanbanRenderer } from '../components/KanbanRenderer.js'; 
import { Orchestrator } from '../core/Orchestrator.js'; 
import { KB } from '../core/kb.js';

export default class ProjectView {
    constructor() {
        document.title = "Kanban PULL | TeamTowers V15.9";
        this.activeProjectId = null;
        this.currentFilter = 'all'; 
        this.isProcessingAi = false; 
        
        this.pushTargetHash = null;
        this.pushTargetIsLegacy = false;
        
        this.draftedSopData = null; 
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
            title: "Mercado PULL (Kanban)",
            subtitle: project.nombre,
            tagline: "Motor de ejecución VNA. Asume responsabilidad, valida SOCs y ejecuta valor.",
            actionHtml: `<button id="btnToggleAvailability" class="${statusBtnClass}">${statusBtnText}</button>`,
            magicActions: [
                { id: 'ai_assign', label: 'Auto-Asignación IA', icon: '🤖', isAi: true, tokens: 50 }
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

                /* MODAL OVERLAY (Universal) */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 4000; opacity:0; transition:opacity 0.2s;}
                .modal-overlay.active { display: flex; opacity: 1;}
                .modal-content { background: var(--bg-panel); border: 1px solid var(--glass-border); padding: 2.5rem; border-radius: 16px; width: 600px; max-width: 95%; box-shadow: 0 20px 50px rgba(0,0,0,0.8); transform: translateY(20px); transition: transform 0.3s ease-out; box-sizing: border-box; max-height: 90vh; overflow-y: auto;}
                .modal-overlay.active .modal-content { transform: translateY(0); }
                
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 5px; font-weight: bold; }
                .form-control { background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 12px; border-radius: 8px; font-family: inherit; font-size: 0.95rem; outline: none; width: 100%; transition: 0.2s; box-sizing: border-box; }
                .form-control:focus { border-color: var(--accent-blue); }

                .soc-list { display: flex; flex-direction: column; gap: 10px; margin-top: 15px; }
                .soc-item { display: flex; align-items: flex-start; gap: 10px; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px solid #333; }
                .soc-item input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-green); margin-top: 2px; }
                .soc-item span { color: #ccc; font-size: 0.9rem; line-height: 1.4; }

                /* MODAL PUSH CIBERPUNK */
                .modal-push-content { background: linear-gradient(180deg, rgba(20,20,25,0.95), rgba(10,10,15,0.98)); border: 1px solid var(--accent-purple); border-top: 4px solid var(--accent-purple); padding: 2.5rem; border-radius: 20px; width: 100%; max-width: 450px; box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(224,64,251,0.2); }
                .btn-push-action { background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); color: white; border: none; padding: 15px; border-radius: 12px; font-weight: 900; font-size: 1rem; width: 100%; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 20px rgba(224,64,251,0.3);}
                .btn-push-action:hover { filter: brightness(1.2); transform: translateY(-2px);}

                /* FLOW CREATOR (MESTRE) */
                .new-flow-config { background: rgba(0,0,0,0.3); border: 1px dashed var(--accent-orange); border-radius: 12px; padding: 20px; margin-bottom: 20px; display: none; animation: fadeIn 0.3s ease-out;}
                .btn-mestre { width: 100%; background: rgba(224,64,251,0.1); border: 1px solid var(--accent-purple); color: var(--accent-purple); padding: 12px; border-radius: 8px; font-weight: 900; cursor: pointer; transition: 0.3s; display:flex; justify-content:center; align-items:center; gap:8px;}
                .btn-mestre:hover { background: var(--accent-purple); color: white; box-shadow: 0 0 20px rgba(224,64,251,0.4);}
                .btn-mestre:disabled { opacity: 0.5; cursor: not-allowed; }

                /* SOC LIST EN MODAL */
                .soc-edit-list { display: flex; flex-direction: column; gap: 8px; margin-top: 5px; }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

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
                                ${isPO ? `<button class="btn-create-task" id="btnOpenCreateTask">➕ Generar Work Order</button>` : ''}
                            </div>
                        </div>
                        
                        <div id="kanbanMountPoint"></div>
                    </div>
                </main>

                <div class="modal-overlay" id="createTaskModal">
                    <div class="modal-content">
                        <h2 style="color:white; margin-top:0; margin-bottom: 5px; font-weight:900; font-size:1.8rem; letter-spacing:-1px;">Abrir el Grifo de Valor</h2>
                        <p style="color:#aaa; font-size:0.95rem; margin-bottom:2rem; line-height:1.5;">Instancia una tarea desde una Tubería existente, o traza una nueva si falta en el mapa.</p>
                        
                        <div class="form-group">
                            <label>Tubería Base (Flow del Mapa)</label>
                            <select id="newTaskFlowId" class="form-control" style="background: rgba(0, 176, 255, 0.05); border-color: var(--accent-blue); font-weight:bold; color:var(--accent-blue);"></select>
                        </div>

                        <div id="newFlowContainer" class="new-flow-config">
                            <h4 style="color:var(--accent-orange); margin-top:0; margin-bottom:15px; font-size:0.9rem; text-transform:uppercase;">✨ Forjar Tubería Permanente</h4>
                            <div style="display:flex; gap:10px; margin-bottom:15px;">
                                <div style="flex:1;">
                                    <label style="color:#888;">Rol Origen</label>
                                    <select id="selNewFlowFrom" class="form-control" style="padding:10px; font-size:0.85rem;"></select>
                                </div>
                                <div style="flex:1;">
                                    <label style="color:#888;">Rol Destino</label>
                                    <select id="selNewFlowTo" class="form-control" style="padding:10px; font-size:0.85rem;"></select>
                                </div>
                            </div>
                            <div style="display:flex; gap:10px; margin-bottom:15px;">
                                <div style="flex:2;">
                                    <label style="color:#888;">Tipo de Valor</label>
                                    <select id="selNewFlowType" class="form-control" style="padding:10px; font-size:0.85rem;">
                                        <option value="tangible">🟢 Tangible (Contractual)</option>
                                        <option value="intangible">🟣 Intangible (Review/Audit)</option>
                                    </select>
                                </div>
                                <div style="flex:1;">
                                    <label style="color:#888;">Horas Est.</label>
                                    <input type="number" id="inpNewFlowHours" class="form-control" value="2" style="padding:10px; font-family:var(--font-mono); color:var(--accent-green); font-weight:bold;">
                                </div>
                            </div>
                        </div>

                        <div class="form-group" style="position:relative;">
                            <label>SOP / Instrucciones (Work Order)</label>
                            <textarea id="newTaskDesc" class="form-control" rows="3" placeholder="Define el contexto o pide a la IA que lo genere..."></textarea>
                        </div>
                        
                        <div id="mestreAiButtonContainer" style="display:none; margin-bottom: 20px;">
                            <button id="btnAiDraftSop" class="btn-mestre">🧠 Pedir a @mestre_escola que redacte SOP y SOCs</button>
                        </div>

                        <div class="form-group">
                            <label style="display:flex; justify-content:space-between; align-items:center;">
                                <span>Criterios de Aceptación (SOCs)</span>
                                <button id="btnAddNewSoc" style="background:transparent; border:1px dashed var(--accent-green); color:var(--accent-green); border-radius:6px; cursor:pointer; font-size:0.7rem; padding: 3px 8px;">+ Añadir SOC</button>
                            </label>
                            <div id="newTaskSocsList" class="soc-edit-list"></div>
                        </div>

                        <div class="form-group" style="margin-top: 20px; border-top: 1px dashed #333; padding-top: 20px;">
                            <label style="color:var(--accent-orange);">Asignar Directamente (PUSH)</label>
                            <select id="newTaskAssignee" class="form-control" style="border-color:#555;">
                                <option value="">-- Dejar Libre en "Oportunidades" --</option>
                            </select>
                        </div>

                        <div style="display: flex; justify-content: space-between; margin-top: 2.5rem; gap:15px;">
                            <button class="btn" style="flex:1; background:transparent; border:1px solid #555; color:white; padding:14px; border-radius:12px; cursor:pointer; font-weight:bold;" id="btnCancelCreateTask">Cancelar</button>
                            <button class="btn" style="flex:2; background:linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color:white; font-weight:900; border:none; padding:14px; border-radius:12px; cursor:pointer; box-shadow:0 5px 15px rgba(0,176,255,0.3);" id="btnConfirmCreateTask">🚀 Inyectar al Sprint</button>
                        </div>
                    </div>
                </div>

                <div class="modal-overlay" id="pushModal">
                    <div class="modal-push-content">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem; border-bottom: 1px dashed #333; padding-bottom: 1rem;">
                            <h2 style="color: white; margin:0; font-weight:900; font-size: 1.3rem;">👤 Asignar Tarea (PUSH)</h2>
                            <button id="btnClosePushModal" style="background:none; border:none; color:#888; font-size:2rem; line-height:1; cursor:pointer;">&times;</button>
                        </div>
                        <p style="color:#aaa; font-size:0.9rem; margin-bottom: 1.5rem;">Selecciona un humano o agente para asignar esta Work Order.</p>
                        
                        <select id="selPushTarget" class="form-control" style="font-weight:bold; margin-bottom:20px;">
                            <option value="">-- Selecciona talento --</option>
                            ${globalUsersOptions}
                        </select>

                        <button class="btn-push-action" id="btnConfirmPush">🚀 Despachar Work Order</button>
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
                isMacroMode: false 
            });
            this.kanbanRenderer.render();
        }

        // LÓGICA DE FILTROS
        const filterDropdown = document.getElementById('filterDropdown');
        if (filterDropdown) {
            filterDropdown.value = this.currentFilter;
            filterDropdown.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.kanbanRenderer.options.currentFilter = this.currentFilter;
                this.refreshRenderer();
            });
        }

        // ==========================================
        // 🔥 LÓGICA DE ASIGNACIÓN Y EVENTOS
        // ==========================================
        const pushModal = document.getElementById('pushModal');
        document.getElementById('btnClosePushModal')?.addEventListener('click', () => {
            pushModal.classList.remove('active');
            this.pushTargetHash = null;
        });

        document.getElementById('btnConfirmPush')?.addEventListener('click', async () => {
            const targetUserId = document.getElementById('selPushTarget').value;
            if(!targetUserId) return alert("Selecciona un usuario o agente destino.");
            
            const btn = document.getElementById('btnConfirmPush');
            btn.disabled = true; btn.innerText = "⏳ Asignando...";

            const actionType = this.pushTargetIsLegacy ? 'UPDATE_TRANSACTION_STATUS' : 'UPDATE_WO_STATUS';
            const payloadKey = this.pushTargetIsLegacy ? 'txHash' : 'hash';

            const currentProj = store.getState().projects.find(p => p.id === this.activeProjectId);
            const wList = this.pushTargetIsLegacy ? (currentProj.transactions || []) : (currentProj.work_orders || []);
            const wItem = wList.find(w => (w.hash || w.id) === this.pushTargetHash) || {};
            const safeSprintId = wItem.sprintId || currentProj.activeSprintId;

            // FUERZA BRUTA UPDATE
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

        // 🔥 ESCUCHADOR UNIVERSAL DE ACCIONES DEL KANBAN
        window.addEventListener('kanban-action', async (e) => {
            const { action, hash, isLegacy, userId, agentId, element } = e.detail;
            
            const currentProj = store.getState().projects.find(p => p.id === this.activeProjectId);
            const wList = isLegacy ? (currentProj.transactions || []) : (currentProj.work_orders || []);

            // PULL MÍO AUTOMÁTICO 
            if (action === 'force-pull') {
                const updatedList = wList.map(w => {
                    if ((w.hash || w.id) === hash) return { ...w, status: 'pinged', assigneeId: userId, sprintId: w.sprintId || currentProj.activeSprintId }; 
                    return w;
                });
                await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: this.activeProjectId, updates: { [isLegacy ? 'transactions' : 'work_orders']: updatedList } } });
                this.refreshRenderer();
                return;
            }

            // ABRIR MODAL PUSH
            if (action === 'open-push-modal') {
                if (!this.isPO) return alert("Solo el PO puede realizar PUSH.");
                this.pushTargetHash = hash;
                this.pushTargetIsLegacy = isLegacy;
                pushModal.classList.add('active');
                return;
            }

            // 🔥 FIX: SOLTAR TAREA (REJECT) - FUERZA BRUTA
            if (action === 'reject') {
                if(!confirm("¿Estás seguro de soltar esta tarea y devolverla a Oportunidades?")) return;
                
                const updatedList = wList.map(w => {
                    if ((w.hash || w.id) === hash) return { ...w, status: 'theoretical', assigneeId: null, sprintId: w.sprintId || currentProj.activeSprintId }; 
                    return w;
                });
                await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: this.activeProjectId, updates: { [isLegacy ? 'transactions' : 'work_orders']: updatedList } } });
                this.refreshRenderer();
                return;
            }

            // AUDITORÍA
            if (action === 'review') {
                this.openReviewModal(hash);
                return;
            }

            // EJECUCIÓN DE IA
            if (action === 'ai-exec') {
                await this.executeAIAgent(hash, element, store.getState().projects.find(p => p.id === this.activeProjectId), isLegacy);
                return;
            }
        });

        window.addEventListener('swarm_update', () => this.refreshRenderer());

        // 🔥 LÓGICA DE SPRINTS
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
                const spName = prompt("Nombre del nuevo ciclo temporal:", `Sprint ${nextNum}`);
                
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

        this.setupCreationModal();
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
    async executeAIAgent(txHash, btnElement, currProject, isLegacy) {
        if (this.isProcessingAi) return alert("Un Agente ya está trabajando en una Work Order. Espera.");
        this.isProcessingAi = true;
        
        const card = btnElement.closest('.task-card');
        if(card) card.classList.add('ai-processing');
        btnElement.innerText = "⏳ Orquestando...";
        
        try {
            const flows = isLegacy ? (currProject.transactions||[]) : (currProject.work_orders||[]);
            const wo = flows.find(w => (w.hash || w.id) === txHash);
            const parentFlow = (currProject.vna_flows||[]).find(f => f.id === wo.flowId) || wo; 
            
            // 🔥 Ruteo Inteligente: Usamos la API configurada por defecto o ChatGPT si lo configuraste.
            let provider = localStorage.getItem('tt_ai_provider') || 'openai';
            let apiKey = localStorage.getItem(`tt_key_${provider}`);
            
            if (!apiKey && provider !== 'custom') {
                // Fallback automático por si configuraste OpenAI y está en deepseek por error
                const testOpenAI = localStorage.getItem('tt_key_openai');
                if(testOpenAI) { provider = 'openai'; apiKey = testOpenAI; localStorage.setItem('tt_ai_provider', 'openai'); }
                else throw new Error("Configura tu API Key (OpenAI o DeepSeek) para ejecutar agentes.");
            }

            await KB.init();
            const aiContext = await KB.getDynamicContextPrompt(this.activeProjectId, wo.assigneeId, store.getState());

            const userPrompt = `
                TAREA A EJECUTAR: ${parentFlow.template || parentFlow.entregable}
                CONTEXTO ADICIONAL: ${wo.comentario || 'Ninguno.'}
                SOCs A CUMPLIR (Crítico): ${JSON.stringify((wo.soc_checklist || []).map(s => s.text))}
                
                Redacta el entregable final. Sé breve, directo y asegúrate de cumplir con los SOCs para aprobar la auditoría del Notario.
            `;

            const response = await Orchestrator.callLLM({
                provider, apiKey, systemPrompt: aiContext, userPrompt, responseFormat: "text", temperature: 0.3
            });

            // 🔥 FIX: Actualización por Fuerza Bruta para inyectar el texto sin amnesia de estado
            const updatedList = flows.map(w => {
                if ((w.hash || w.id) === txHash) {
                    return { ...w, status: 'reported', proofLink: 'Agent_Auto_Report', comentario: response.content, sprintId: w.sprintId || currProject.activeSprintId };
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

    // ==========================================
    // 🔥 EL GRIFO INTELIGENTE Y EDITABLE (NUEVO MODAL)
    // ==========================================
    setupCreationModal() {
        const createModal = document.getElementById('createTaskModal');
        
        // EVENT DELEGATION PARA BOTÓN CREAR (A prueba de fallos DOM)
        document.body.addEventListener('click', (e) => {
            if(e.target.closest('#btnOpenCreateTask')) {
                const activeProject = store.getState().projects.find(p => p.id === this.activeProjectId);
                
                // Soporte a prueba de balas para Legacy y V15
                const flows = (activeProject.vna_flows && activeProject.vna_flows.length > 0) ? activeProject.vna_flows : (activeProject.transactions || []);
                
                if (flows.length === 0) {
                    alert("Debes dibujar Tuberías permanentes en el Mapa VNA antes de poder generar Work Orders sueltas.");
                    window.location.href = '/v8/map';
                    return;
                }

                const flowSelect = document.getElementById('newTaskFlowId');
                let flowOpts = `<option value="NEW_FLOW" style="color:var(--accent-orange); font-weight:900;">✨ Trazar Nueva Tubería al vuelo...</option>`;
                flowOpts += `<optgroup label="Tuberías Permanentes">`;
                
                flows.forEach(f => {
                    const rFrom = (activeProject.roles||[]).find(r => r.id === f.from) || {name: 'Origen'};
                    const rTo = (activeProject.roles||[]).find(r => r.id === f.to) || {name: 'Destino'};
                    const title = f.template || f.entregable || 'SOP Sin Nombre';
                    flowOpts += `<option value="${f.id || f.hash}">[${rFrom.name} -> ${rTo.name}] ${title}</option>`;
                });
                flowOpts += `</optgroup>`;
                
                flowSelect.innerHTML = flowOpts;
                
                const roleOpts = (activeProject.roles||[]).map(r => `<option value="${r.id}">${r.levelId} - ${r.name}</option>`).join('');
                document.getElementById('selNewFlowFrom').innerHTML = roleOpts;
                document.getElementById('selNewFlowTo').innerHTML = roleOpts;

                let userOpts = `<option value="">-- Dejar Libre en "Oportunidades" --</option>`;
                store.getState().globalUsers.forEach(gUser => {
                    userOpts += `<option value="${gUser.id}">${gUser?.profile?.isAi ? '🤖 ' : ''}${gUser.name} (${gUser.id})</option>`;
                });
                document.getElementById('newTaskAssignee').innerHTML = userOpts;

                document.getElementById('newTaskDesc').value = '';
                this.renderEditableSocs([]);
                document.getElementById('newFlowContainer').style.display = 'block'; 
                document.getElementById('mestreAiButtonContainer').style.display = 'block';

                createModal.style.display = 'flex';
            }
        });

        const flowSelect = document.getElementById('newTaskFlowId');
        const newFlowContainer = document.getElementById('newFlowContainer');
        const mestreBtnContainer = document.getElementById('mestreAiButtonContainer');
        const btnAiDraftSop = document.getElementById('btnAiDraftSop');
        const descInput = document.getElementById('newTaskDesc');
        const socsList = document.getElementById('newTaskSocsList');
        
        this.renderEditableSocs = (socsArray) => {
            socsList.innerHTML = '';
            if(!socsArray || socsArray.length === 0) {
                socsList.innerHTML = '<div style="color:#666; font-size:0.8rem; font-style:italic;">No hay SOCs definidos. Añade uno para garantizar la calidad.</div>';
                return;
            }
            socsArray.forEach((soc) => {
                const text = typeof soc === 'string' ? soc : soc.text;
                socsList.appendChild(this.createSocInput(text));
            });
        };

        this.createSocInput = (text = '') => {
            const div = document.createElement('div');
            div.style.display = 'flex'; div.style.gap = '8px'; div.style.alignItems = 'center';
            div.innerHTML = `
                <input type="text" class="form-control soc-edit-input" value="${text}" style="padding:8px; margin-bottom:0; flex:1;" placeholder="Define un criterio de auditoría...">
                <button class="btn-del-soc" style="background:rgba(255,82,82,0.1); border:1px solid var(--accent-red); color:var(--accent-red); border-radius:8px; cursor:pointer; width:35px; height:35px; display:flex; justify-content:center; align-items:center; font-size:1.2rem;">&times;</button>
            `;
            div.querySelector('.btn-del-soc').addEventListener('click', (e) => {
                e.preventDefault();
                div.remove();
                if(socsList.children.length === 0) socsList.innerHTML = '<div style="color:#666; font-size:0.8rem; font-style:italic;">No hay SOCs. Añade uno.</div>';
            });
            return div;
        };

        document.getElementById('btnAddNewSoc')?.addEventListener('click', (e) => {
            e.preventDefault();
            if(socsList.innerHTML.includes('No hay SOCs')) socsList.innerHTML = '';
            socsList.appendChild(this.createSocInput(''));
        });

        flowSelect?.addEventListener('change', (e) => {
            const val = e.target.value;
            const activeProject = store.getState().projects.find(p => p.id === this.activeProjectId);
            const flows = (activeProject.vna_flows && activeProject.vna_flows.length > 0) ? activeProject.vna_flows : (activeProject.transactions || []);
            
            if (val === 'NEW_FLOW') {
                newFlowContainer.style.display = 'block';
                mestreBtnContainer.style.display = 'block';
                descInput.value = '';
                this.renderEditableSocs([]);
            } else {
                newFlowContainer.style.display = 'none';
                mestreBtnContainer.style.display = 'none';
                const parentFlow = flows.find(f => (f.id || f.hash) === val);
                if (parentFlow) {
                    descInput.value = parentFlow.comentario || parentFlow.template || parentFlow.entregable || '';
                    this.renderEditableSocs(parentFlow.soc_checklist || []);
                }
            }
        });

        btnAiDraftSop?.addEventListener('click', async (e) => {
            e.preventDefault();
            const desc = descInput.value.trim();
            if (!desc) return alert("Escribe en la caja del SOP qué necesitas que haga Mestre.");
            
            btnAiDraftSop.disabled = true;
            btnAiDraftSop.innerText = "🧠 Mestre d'Escola está forjando el SOP...";

            try {
                let provider = localStorage.getItem('tt_ai_provider') || 'openai';
                let apiKey = localStorage.getItem(`tt_key_${provider}`);
                
                if (!apiKey && provider !== 'custom') {
                    const testOpenAI = localStorage.getItem('tt_key_openai');
                    if(testOpenAI) { provider = 'openai'; apiKey = testOpenAI; localStorage.setItem('tt_ai_provider', 'openai'); }
                    else throw new Error("Configura tu API Key de ChatGPT en el menú principal para invocar a Mestre.");
                }

                const p = store.getState().projects.find(x => x.id === this.activeProjectId);
                const fromId = document.getElementById('selNewFlowFrom').value;
                const toId = document.getElementById('selNewFlowTo').value;
                const rFrom = (p.roles||[]).find(r=>r.id===fromId)?.name || 'Origen';
                const rTo = (p.roles||[]).find(r=>r.id===toId)?.name || 'Destino';

                const sysPrompt = `
                    Eres @mestre_escola. Experto en diseñar SOPs y matrices de calidad (SOCs) W3C. 
                    Vas a crear un entregable estructurado para una tubería de valor que va del rol [${rFrom}] hacia el rol [${rTo}].
                    El usuario necesita: "${desc}".
                    
                    Responde ÚNICAMENTE con un JSON puro con este formato exacto:
                    { "title": "Nombre del entregable", "description": "Descripción paso a paso del flujo", "socs": ["Criterio medible 1", "Criterio medible 2", "Criterio 3"] }
                `;

                const resp = await Orchestrator.callLLM({provider, apiKey, systemPrompt: sysPrompt, userPrompt: "Genera el JSON.", responseFormat: "json_object", temperature: 0.2});
                const data = JSON.parse(resp.content);

                this.draftedSopData = data; 
                descInput.value = data.description;
                this.renderEditableSocs(data.socs);

            } catch (err) {
                alert("Error del Oráculo: " + err.message);
            } finally {
                btnAiDraftSop.innerText = "🧠 Pedir a @mestre_escola que redacte SOP y SOCs";
                btnAiDraftSop.disabled = false;
            }
        });

        document.getElementById('btnCancelCreateTask')?.addEventListener('click', (e) => {
            e.preventDefault();
            createModal.style.display = 'none';
        });

        document.getElementById('btnConfirmCreateTask')?.addEventListener('click', async (e) => {
            e.preventDefault();
            const rawFlowId = document.getElementById('newTaskFlowId').value;
            const desc = descInput.value.trim();
            const assignee = document.getElementById('newTaskAssignee').value;
            
            const currProj = store.getState().projects.find(p => p.id === this.activeProjectId);
            let targetFlowId = rawFlowId;
            let finalSocs = [];
            
            document.querySelectorAll('.soc-edit-input').forEach((input, idx) => {
                if(input.value.trim()) finalSocs.push({ id: 'soc_'+Date.now()+'_'+idx, text: input.value.trim(), isChecked: false });
            });

            // FUERZA BRUTA: Añadir flujo si es nuevo
            if (rawFlowId === 'NEW_FLOW') {
                targetFlowId = 'flow_' + Date.now();
                const fromId = document.getElementById('selNewFlowFrom').value;
                const toId = document.getElementById('selNewFlowTo').value;
                const tipo = document.getElementById('selNewFlowType').value;
                const hrs = parseFloat(document.getElementById('inpNewFlowHours').value) || 2;
                const title = this.draftedSopData ? this.draftedSopData.title : (desc.substring(0, 30) || 'SOP Ad-Hoc');

                const newFlow = { id: targetFlowId, from: fromId, to: toId, template: title, tipo, estimatedHours: hrs, soc_checklist: finalSocs };
                const updatedFlows = [...(currProj.vna_flows || []), newFlow];
                
                await store.dispatch({
                    type: 'UPDATE_PROJECT_INFO',
                    payload: { projectId: this.activeProjectId, updates: { vna_flows: updatedFlows } }
                });
            }

            // FUERZA BRUTA: Añadir Work Order
            const newHash = 'wo_' + Math.random().toString(36).substr(2, 9);
            const newWo = {
                hash: newHash, 
                flowId: targetFlowId, 
                comentario: desc,
                status: assignee !== "" ? 'pinged' : 'theoretical', 
                realHours: 0,
                assigneeId: assignee || null,
                sprintId: currProj.activeSprintId,
                soc_checklist: finalSocs, 
                resources: []
            };

            const updatedWOs = [...(currProj.work_orders || []), newWo];
            await store.dispatch({
                type: 'UPDATE_PROJECT_INFO',
                payload: { projectId: this.activeProjectId, updates: { work_orders: updatedWOs } }
            });

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
            
            let taskRef = (currProject.work_orders || []).find(w => w.hash === hash);
            if (!taskRef) taskRef = (currProject.transactions || []).find(t => t.id === hash);
            if(!taskRef) return;

            document.getElementById('reviewTaskDeliverable').innerHTML = (taskRef.comentario || 'Sin comentario adjunto.').replace(/\n/g, '<br>');
            
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

        document.getElementById('btnAiAudit')?.addEventListener('click', async (e) => {
            if (!currentReviewHash) return;
            const btn = e.target;
            btn.innerText = "🧠 Procesando Oráculo...";
            
            const currProject = store.getState().projects.find(p => p.id === this.activeProjectId);
            let taskRef = (currProject.work_orders || []).find(w => w.hash === currentReviewHash);
            if (!taskRef) taskRef = (currProject.transactions || []).find(t => t.id === currentReviewHash);
            
            let provider = localStorage.getItem('tt_ai_provider') || 'openai';
            let apiKey = localStorage.getItem(`tt_key_${provider}`);

            if (!apiKey) {
                alert("Simulando Auditoría Offline. Marcando todos los SOCs como válidos.");
                document.querySelectorAll('.soc-checkbox').forEach(cb => cb.checked = true);
                btn.innerText = "🤖 Invocar Auditor IA (@notari_ledger)";
                return;
            }

            const systemPrompt = `
                Eres @notari_ledger, el Agente Auditor del ecosistema. Evalúa estrictamente si el entregable cumple con los SOCs.
                Entregable: "${taskRef.comentario}"
                Devuelve SOLO un objeto JSON con las claves de los SOCs (id) y true/false.
                SOCs a evaluar: ${JSON.stringify(taskRef.soc_checklist.map(s => ({id: s.id, text: s.text})))}
            `;

            try {
                const response = await Orchestrator.callLLM({ provider, apiKey, systemPrompt, userPrompt: "Evalúa el entregable. Sé estricto.", responseFormat: "json_object", temperature: 0.1 });
                const parsedAudit = JSON.parse(response.content);
                
                document.querySelectorAll('.soc-checkbox').forEach(cb => {
                    const socId = cb.getAttribute('data-socid');
                    if (parsedAudit[socId] !== undefined) cb.checked = parsedAudit[socId];
                });

            } catch (err) {
                alert("Fallo al contactar con el Oráculo IA. Evalúa manualmente.");
            }
            btn.innerText = "🤖 Invocar Auditor IA (@notari_ledger)";
        });

        document.getElementById('btnConfirmReview')?.addEventListener('click', async () => {
            if (!currentReviewHash) return;
            
            const socValidation = {};
            document.querySelectorAll('.soc-checkbox').forEach(cb => {
                socValidation[cb.getAttribute('data-socid')] = cb.checked;
            });

            const currProject = store.getState().projects.find(p => p.id === this.activeProjectId);
            const isLegacy = !(currProject.work_orders || []).find(w => w.hash === currentReviewHash);
            const taskObj = isLegacy ? currProject.transactions.find(t => t.id === currentReviewHash) : currProject.work_orders.find(w => w.hash === currentReviewHash);
            
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
                alert("❌ Auditoría Rechazada: Todos los SOCs deben cumplirse para generar Equity en el Ledger.");
            } else {
                document.getElementById('reviewTaskModal').style.display = 'none';
                currentReviewHash = null;
            }
            
            this.refreshRenderer();
        });
    }
}
