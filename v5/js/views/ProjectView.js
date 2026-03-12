// v5/js/views/ProjectView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class ProjectView {
    constructor() {
        document.title = "Tareas | TeamTowers SOS";
        this.activeProjectId = null;
        this.currentFilter = 'all'; 
        // Adaptativo: PC ve tablero completo, móvil ve fase por fase
        this.currentTab = window.innerWidth > 768 ? 'all' : 'oportunidades'; 
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

        const canCreateWO = store.canUserCreateWorkOrder(activeProjectId, activeUserId);

        let magicActionsHtml = '';
        if (canCreateWO) {
            magicActionsHtml = `
                <div class="magic-action-group">
                    <select id="selKanbanMagic" class="magic-select">
                        <option value="" disabled selected>⚡ Acción IA / Tablero...</option>
                        <option value="create_wo">➕ Tarea (WO)</option>
                        <option value="ai_sprint" disabled>🤖 Sprint IA</option>
                    </select>
                    <button class="btn-magic-exec" id="btnExecuteKanbanMagic">Ejecutar</button>
                </div>
            `;
        }

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
                { id: 'all', label: '🗂️ Tablero Completo', active: this.currentTab === 'all', hideOnMobile: true },
                { id: 'oportunidades', label: 'Libres', active: this.currentTab === 'oportunidades', badge: '0' },
                { id: 'en-curso', label: 'En Curso', active: this.currentTab === 'en-curso', badge: '0' },
                { id: 'contabilizado', label: 'Selladas', active: this.currentTab === 'contabilizado', badge: '0' }
            ]
        };

        return `
            <style>
                .workspace-kanban { display: flex; flex-direction: column; flex: 1; overflow: hidden; height: 100%; box-sizing: border-box; }
                .kanban-container { width: 100%; height: 100%; display: flex; flex-direction: column; min-height: 0; padding-bottom: 2rem; }
                .controls-row { display: flex; justify-content: flex-end; align-items: center; margin-bottom: 1rem; width: 100%; flex-shrink: 0;}
                
                /* GRID KANBAN TRELLO STYLE */
                .kanban-board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; width: 100%; flex: 1; min-height: 0; }
                .kanban-col { background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; display: flex; flex-direction: column; height: 100%; overflow: hidden; box-shadow: inset 0 5px 20px rgba(0,0,0,0.3); }
                .col-header { flex-shrink: 0; padding: 15px; color: white; font-weight: 900; text-transform: uppercase; font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); }
                
                .col-body {
                    flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 15px;
                    scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) rgba(0,0,0,0.2);
                }
                .col-body::-webkit-scrollbar { width: 8px; }
                .col-body::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px; }
                .col-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }

                .kanban-board.single-col-mode { grid-template-columns: 1fr; }
                .kanban-board.single-col-mode .kanban-col { border: none; background: transparent; box-shadow: none; overflow: visible;}
                .kanban-board.single-col-mode .col-header { display: none; }
                .kanban-board.single-col-mode .col-body { padding: 0; overflow: visible; }

                @media (max-width: 768px) {
                    .kanban-board { display: flex; flex-direction: column; gap: 1.2rem; padding-bottom: 2rem; height: auto;}
                    .kanban-col { border: none; padding: 0; background: transparent; height: auto; box-shadow:none;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/project')}
                <main class="workspace workspace-kanban ${isOpen ? 'is-open-to-work' : ''}">
                    ${PageHeader.getHtml(headerConfig)}
                    <div class="kanban-container">
                        <div class="controls-row">
                            <select id="filterDropdown" class="form-control" style="width: auto; height: 40px; font-size: 0.85rem; background: rgba(0,0,0,0.5); border-color: #333;">
                                <option value="all">Filtros: Todas las tareas</option>
                                <option value="mine">👤 Solo mis tareas</option>
                                <option value="tangible">🟢 Solo Tangibles</option>
                                <option value="intangible">🟣 Solo Intangibles</option>
                            </select>
                        </div>
                        <div class="kanban-board" id="taskGrid"></div>
                    </div>
                </main>

                <div class="modal-overlay" id="createTaskModal">
                    <div class="modal-content">
                        <h2 style="color:white; margin-top:0; font-weight:900;">Abrir el Grifo</h2>
                        <p style="color:#888; font-size:0.9rem; margin-bottom: 1.5rem;">Crea una instancia de tarea desde el mapa VNA.</p>
                        <div class="form-group">
                            <label>Tubería de Valor (Flow)</label>
                            <select id="newTaskFlowId" class="form-control"></select>
                        </div>
                        <div class="form-group">
                            <label>Contexto / Instrucciones</label>
                            <textarea id="newTaskDesc" class="form-control" rows="3" placeholder="Detalles específicos..."></textarea>
                        </div>
                        <div style="display: flex; gap:15px; margin-top: 3rem;">
                            <button class="btn-outline" id="btnCancelCreateTask" style="flex:1">Cancelar</button>
                            <button class="btn-primary" id="btnConfirmCreateTask" style="flex:2">🚀 Inyectar</button>
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
        
        let project = state.projects.find(p => p.id === (localStorage.getItem('tt_active_project') || state.projects[0]?.id));
        if (!project) return;
        this.activeProjectId = project.id;

        // V12.5 DRY TABS: Escuchar evento global
        window.addEventListener('ph-tab-changed', (e) => {
            if (e.detail && e.detail.tabId) {
                this.currentTab = e.detail.tabId;
                this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
            }
        });

        // FILTROS
        const filterDropdown = document.getElementById('filterDropdown');
        if(filterDropdown) {
            filterDropdown.value = this.currentFilter;
            filterDropdown.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
            });
        }

        // EVENTO DISPONIBILIDAD
        document.getElementById('btnToggleAvailability')?.addEventListener('click', async () => {
            const currentStatus = store.getState().globalUsers.find(u => u.id === activeUserId)?.profile?.isOpenToWork || false;
            await store.dispatch({
                type: 'UPDATE_USER_PROFILE',
                payload: { userId: activeUserId, profile: { isOpenToWork: !currentStatus } }
            });
            window.location.reload(); // Recarga para aplicar el destello visual
        });

        // LÓGICA DE MAGIC ACTIONS
        document.getElementById('btnExecuteKanbanMagic')?.addEventListener('click', () => {
            const action = document.getElementById('selKanbanMagic').value;
            if (action === 'create_wo') {
                const activeProject = store.getState().projects.find(p => p.id === this.activeProjectId);
                const flows = activeProject.vna_flows || [];
                if (flows.length === 0) return alert("Dibuja tuberías en el Mapa VNA primero.");
                
                document.getElementById('newTaskFlowId').innerHTML = flows.map(f => `<option value="${f.id}">${f.template}</option>`).join('');
                document.getElementById('createTaskModal').style.display = 'flex';
            }
        });

        document.getElementById('btnCancelCreateTask')?.addEventListener('click', () => document.getElementById('createTaskModal').style.display = 'none');
        
        document.getElementById('btnConfirmCreateTask')?.addEventListener('click', async () => {
            const flowId = document.getElementById('newTaskFlowId').value;
            const desc = document.getElementById('newTaskDesc').value.trim();
            const newHash = 'wo_' + Math.random().toString(36).substr(2, 9);

            await store.dispatch({
                type: 'SPAWN_WORK_ORDER',
                payload: { projectId: this.activeProjectId, workOrder: { hash: newHash, flowId, comentario: desc, status: 'theoretical', realHours: 0 } }
            });

            document.getElementById('createTaskModal').style.display = 'none';
            this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
        });

        // ACTIONS LOGIC (Grid delegación)
        document.getElementById('taskGrid')?.addEventListener('click', async (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            const hash = target.dataset.hash;
            const isLegacy = target.dataset.legacy === "true";
            const action = target.dataset.action;

            if (target.classList.contains('btn-pull')) {
                const type = isLegacy ? (action === 'request' ? 'REQUEST_TRANSACTION' : 'PING_TRANSACTION') : (action === 'request' ? 'REQUEST_WORK_ORDER' : 'PING_WORK_ORDER');
                await store.dispatch({ type, payload: { projectId: this.activeProjectId, [isLegacy ? 'txHash' : 'woHash']: hash, userId: activeUserId } });
                this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
            }
            
            if (target.classList.contains('btn-approve')) {
                const isConsolidate = action === 'consolidate';
                const type = isLegacy ? (isConsolidate ? 'APPROVE_TRANSACTION' : 'PING_TRANSACTION') : (isConsolidate ? 'APPROVE_WORK_ORDER' : 'PING_WORK_ORDER');
                await store.dispatch({ type, payload: { projectId: this.activeProjectId, [isLegacy ? 'txHash' : 'woHash']: hash, userId: target.dataset.userid } });
                this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
            }
        });

        this.renderTasks(project);
    }

    renderTasks(project) {
        const board = document.getElementById('taskGrid');
        if (!board) return;
        board.innerHTML = '';
        
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const isPO = project.ownerId === activeUserId || state.session.role === 'ecosystem-owner';
        
        const cols = {
            'oportunidades': { title: 'Libres (Oportunidades)', html: [] },
            'en-curso': { title: 'En Curso (Asignadas)', html: [] },
            'contabilizado': { title: 'Selladas (Auditadas)', html: [] }
        };

        const allTasks = [
            ...(project.work_orders || []).map(wo => ({ ...wo, isWorkOrder: true })),
            ...(project.transactions || []).map(tx => ({ ...tx, isWorkOrder: false }))
        ];

        let counts = { op: 0, cur: 0, con: 0 };

        allTasks.forEach(tx => {
            let cat = '';
            if (tx.status === 'theoretical' || tx.status === 'requested') { cat = 'oportunidades'; counts.op++; }
            else if (tx.status === 'pinged' || tx.status === 'reported') { cat = 'en-curso'; counts.cur++; }
            else if (tx.status === 'consolidated' || tx.status === 'approved') { cat = 'contabilizado'; counts.con++; }

            if (this.currentFilter === 'mine' && tx.assigneeId !== activeUserId) return;
            // Otros filtros de tangible/intangible aquí...

            const card = this.createTaskCardHTML(tx, project, isPO, activeUserId);
            if (cols[cat]) cols[cat].html.push(card);
        });

        // Actualizar badges
        ['oportunidades', 'en-curso', 'contabilizado'].forEach(id => {
            const b = document.getElementById(`badge-${id}`);
            if(b) b.innerText = id === 'oportunidades' ? counts.op : (id === 'en-curso' ? counts.cur : counts.con);
        });

        if (this.currentTab === 'all') {
            board.className = 'kanban-board';
            board.innerHTML = Object.keys(cols).map(k => `
                <div class="kanban-col">
                    <div class="col-header">${cols[k].title} <span>${cols[k].html.length}</span></div>
                    <div class="col-body">${cols[k].html.join('') || '<div style="text-align:center;color:#444;padding:2rem;">Vacío</div>'}</div>
                </div>
            `).join('');
        } else {
            board.className = 'kanban-board single-col-mode';
            board.innerHTML = `<div class="col-body">${cols[this.currentTab]?.html.join('') || '<div class="empty-state">No hay tareas</div>'}</div>`;
        }
    }

    createTaskCardHTML(tx, project, isPO, activeUserId) {
        const isLegacy = !tx.isWorkOrder;
        const hashAttr = `data-hash="${tx.hash}" data-legacy="${isLegacy}"`;
        let flowData = tx.isWorkOrder ? (project.vna_flows.find(f => f.id === tx.flowId) || { template: 'Tarea' }) : { template: tx.entregable };
        
        let actionHtml = '';
        if (tx.status === 'theoretical') {
            actionHtml = isPO ? `<button class="btn-pull" ${hashAttr}>Hacer PULL</button>` : `<button class="btn-pull" data-action="request" ${hashAttr}>Solicitar</button>`;
        } else if (tx.status === 'requested') {
            actionHtml = isPO ? `<button class="btn-approve" ${hashAttr} data-userid="${tx.assigneeId}">Aprobar</button>` : `<div style="font-size:0.7rem;color:orange;">Esperando PO...</div>`;
        } else if (tx.status === 'pinged') {
            actionHtml = tx.assigneeId === activeUserId ? `<a href="/v5/focus?hash=${tx.hash}" class="btn-focus" data-link>▶ FOCUS</a>` : `<div style="font-size:0.7rem;color:#888;">Ejecutando...</div>`;
        } else if (tx.status === 'reported') {
            actionHtml = isPO ? `<button class="btn-approve" data-action="consolidate" ${hashAttr}>Sellar Ledger</button>` : `<div style="font-size:0.7rem;color:cyan;">Auditoría...</div>`;
        } else if (tx.status === 'consolidated') {
            actionHtml = `<div style="color:var(--accent-green);font-weight:900;">SELLADO</div>`;
        }

        return `
            <div class="task-card">
                <div class="task-header">
                    <span class="route-badge" style="border-color:#444;color:#888;">VNA</span>
                    <span class="route-badge" style="border-color:var(--accent-blue);color:var(--accent-blue);">${tx.status.toUpperCase()}</span>
                </div>
                <h3 class="task-title">${flowData.template || 'Sin título'}</h3>
                ${tx.comentario ? `<div class="task-desc-bubble">"${tx.comentario}"</div>` : ''}
                <div class="task-meta-row">⏱ ${tx.realHours || 0}h reales</div>
                <div class="task-actions">${actionHtml}</div>
            </div>
        `;
    }

    getColorForLevel(levelId) {
        const colors = { '@anxaneta': 'var(--accent-red)', '@aixecador': '#ff4081', '@dosos': 'var(--accent-purple)', '@baixos': 'var(--accent-indigo)', '@pinya': 'var(--accent-blue)' };
        return colors[levelId] || '#aaa';
    }
}
