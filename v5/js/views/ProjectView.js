// v5/js/views/ProjectView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

export default class ProjectView {
    constructor() {
        document.title = "Tracción (Kanban) | TeamTowers";
        this.activeProjectId = null;
        this.currentFilter = 'all'; // all, mine, tangible, intangible
    }

    async getHtml() {
        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { flex: 1; padding: 2rem 3rem; overflow-x: auto; display: flex; flex-direction: column; }
                
                .view-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px;}
                .view-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; }
                .view-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 5px; }

                /* FILTROS */
                .kanban-filters { display: flex; gap: 10px; margin-bottom: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem;}
                .filter-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: var(--text-muted); padding: 6px 15px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s;}
                .filter-btn.active { background: rgba(0, 176, 255, 0.15); color: var(--accent-blue); border-color: var(--accent-blue); font-weight: bold;}

                /* KANBAN LAYOUT */
                .kanban-container { display: grid; grid-template-columns: repeat(3, minmax(300px, 1fr)); gap: 2rem; flex: 1; min-height: 0; align-items: start;}
                .kanban-col { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); display: flex; flex-direction: column; max-height: calc(100vh - 200px); overflow: hidden;}
                .col-title { padding: 1.2rem; font-weight: bold; font-size: 1.1rem; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3);}
                .col-body { padding: 1rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 1rem; }
                
                /* TASK CARDS */
                .task-card { background: var(--bg-panel); border: 1px solid var(--glass-border); border-radius: var(--border-radius-sm); padding: 1.2rem; transition: transform 0.2s, border-color 0.2s; position: relative;}
                .task-card:hover { transform: translateY(-3px); border-color: #555; }
                .task-title { color: white; font-size: 1.05rem; margin: 10px 0; line-height: 1.4;}
                .task-meta { display: flex; justify-content: space-between; font-size: 0.75rem; color: #888; margin-top: 10px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 10px;}
                
                .btn-pull { background: transparent; border: 1px solid var(--text-muted); color: var(--text-muted); transition: all 0.2s;}
                .btn-pull:hover { background: white; color: black; border-color: white;}
                .btn-focus { background: rgba(0, 176, 255, 0.1); border: 1px solid var(--accent-blue); color: var(--accent-blue); display: block; text-align: center; text-decoration: none; padding: 8px; border-radius: 6px; font-weight: bold; transition: all 0.2s;}
                .btn-focus:hover { background: var(--accent-blue); color: black;}
                .btn-approve { background: var(--accent-green); color: black; border: none; padding: 8px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: transform 0.2s;}
                .btn-approve:hover { transform: scale(1.02); }

                @media (max-width: 1024px) {
                    .kanban-container { display: flex; flex-direction: column; gap: 2rem; overflow-y: auto; }
                    .kanban-col { max-height: none; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/project')}

                <main class="workspace">
                    <div class="view-header">
                        <div>
                            <h1>Tracción de Red</h1>
                            <p>Convierte los entregables teóricos en Slices de Equity reales.</p>
                        </div>
                        <a href="/v5/map" class="btn btn-outline" data-link>⚙️ Ajustar VNA</a>
                    </div>

                    <div class="kanban-filters" id="kanbanFilters">
                        <button class="filter-btn active" data-filter="all">Todos los Flujos</button>
                        <button class="filter-btn" data-filter="mine">Mis Tareas (Pull)</button>
                        <button class="filter-btn" data-filter="tangible">Solo Tangibles 🟢</button>
                        <button class="filter-btn" data-filter="intangible">Solo Intangibles 🟣</button>
                    </div>

                    <div class="kanban-container">
                        <div class="kanban-col">
                            <div class="col-title" style="color: white;">📥 Mercado Teórico <span class="badge" id="count-theo">0</span></div>
                            <div class="col-body" id="theo-list"></div>
                        </div>

                        <div class="kanban-col" style="border-color: rgba(0, 176, 255, 0.3);">
                            <div class="col-title" style="color: var(--accent-blue);">🔥 Deep Work & Tracción <span class="badge" id="count-work">0</span></div>
                            <div class="col-body" id="work-list"></div>
                        </div>

                        <div class="kanban-col" style="border-color: rgba(0, 230, 118, 0.3);">
                            <div class="col-title" style="color: var(--accent-green);">⛓️ Ledger Consolidado <span class="badge" id="count-done">0</span></div>
                            <div class="col-body" id="done-list"></div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();

        const state = store.getState();
        let project = state.projects[state.projects.length - 1];

        if (!project) return;
        this.activeProjectId = project.id;
        
        // Setup Filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
            });
        });

        this.renderTasks(project);
    }

    renderTasks(project) {
        const lists = { theo: document.getElementById('theo-list'), work: document.getElementById('work-list'), done: document.getElementById('done-list') };
        Object.values(lists).forEach(l => l.innerHTML = '');

        const txs = project.transactions || [];
        const state = store.getState();
        const activeUser = state.session.activeUserId;
        
        let counts = { theo: 0, work: 0, done: 0 };

        txs.forEach(tx => {
            // Aplicar Filtros
            if (this.currentFilter === 'tangible' && tx.tipo !== 'tangible') return;
            if (this.currentFilter === 'intangible' && tx.tipo !== 'intangible') return;
            if (this.currentFilter === 'mine' && tx.assigneeId !== activeUser) return;

            const card = this.createTaskCard(tx, project, state.session);
            
            if (tx.status === 'theoretical') { 
                lists.theo.appendChild(card); counts.theo++; 
            } else if (tx.status === 'pinged' || tx.status === 'reported') { 
                lists.work.appendChild(card); counts.work++; 
            } else if (tx.status === 'consolidated' || tx.status === 'approved') { 
                lists.done.appendChild(card); counts.done++; 
            }
        });

        document.getElementById('count-theo').innerText = counts.theo;
        document.getElementById('count-work').innerText = counts.work;
        document.getElementById('count-done').innerText = counts.done;
    }

    createTaskCard(tx, project, session) {
        const role = project.roles.find(r => r.id === tx.from) || { name: 'Nodo', levelId: '@baixos' };
        const receiverRole = project.roles.find(r => r.id === tx.to) || { name: 'Destino', levelId: '?' };
        
        const card = document.createElement('div');
        card.className = 'task-card';
        const color = this.getColorForLevel(role.levelId);
        const tipoColor = tx.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';

        let actionHtml = '';

        if (tx.status === 'theoretical') {
            actionHtml = `<button class="btn btn-outline btn-pull" data-hash="${tx.hash}" style="width: 100%;">Hacer PULL (Asumir)</button>`;
        } 
        else if (tx.status === 'pinged') {
            const isMine = tx.assigneeId === session.activeUserId;
            if (isMine) {
                actionHtml = `
                    <div style="color: var(--accent-orange); font-size: 0.75rem; font-weight: bold; margin-bottom: 10px;">⏳ EN TU ESCRITORIO</div>
                    <a href="/v5/focus" class="btn btn-focus" style="width: 100%;" data-link>▶ Iniciar Focus / Reportar</a>
                `;
            } else {
                const worker = store.getState().globalUsers.find(u => u.id === tx.assigneeId);
                actionHtml = `<div style="color: #666; font-size: 0.8rem; text-align: center; padding: 10px; border: 1px dashed #333; border-radius: 6px;">Tomada por: ${worker ? worker.name : tx.assigneeId}</div>`;
            }
        } 
        else if (tx.status === 'reported') {
            actionHtml = `
                <div style="color: var(--accent-blue); font-size: 0.75rem; font-weight: bold; margin-bottom: 10px;">🛡️ ESPERANDO AUDITORÍA</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); background: rgba(0,0,0,0.5); padding: 8px; border-radius: 4px; margin-bottom: 10px;">
                    Horas Reales: <strong style="color: white;">${tx.realHours}h</strong><br>
                    Evidencia: <a href="${tx.proofLink}" target="_blank" style="color: var(--accent-blue);">${tx.proofLink ? 'Ver Trabajo' : 'Sin link'}</a>
                </div>
                <button class="btn btn-approve" data-hash="${tx.hash}" style="width: 100%;">Aprobar y Consolidar (Ledger)</button>
            `;
        }
        else if (tx.status === 'consolidated') {
            actionHtml = `
                <div style="color: var(--accent-green); font-size: 1rem; font-weight: bold; font-family: var(--font-mono); text-align: center; padding: 10px; background: rgba(0, 230, 118, 0.05); border-radius: 8px;">
                    +${Math.round(tx.valorCongelado).toLocaleString()} Slices Acuñados
                </div>
            `;
        }

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 5px; align-items: center;">
                    <span class="badge" style="color: ${color}; border-color: ${color}; font-size: 0.65rem;" title="De: ${role.name}">${role.levelId}</span>
                    <span style="color: #666;">&rarr;</span>
                    <span class="badge" style="color: #888; border-color: #444; font-size: 0.65rem;" title="Hacia: ${receiverRole.name}">${receiverRole.levelId}</span>
                </div>
                <span style="font-size: 0.6rem; color: var(--text-muted); font-family: var(--font-mono);">#${tx.hash.substring(0,6)}</span>
            </div>
            <h3 class="task-title">${tx.entregable}</h3>
            <div style="margin-bottom: 1rem;">${actionHtml}</div>
            <div class="task-meta">
                <span>⏱ ${tx.horas}h Est.</span>
                <span style="color: ${tipoColor}; font-weight: bold; text-transform: uppercase;">${tx.tipo}</span>
            </div>
        `;

        // LÓGICA DE BOTONES Y RBAC
        setTimeout(() => {
            const pullBtn = card.querySelector('.btn-pull');
            if (pullBtn) {
                pullBtn.addEventListener('click', () => {
                    if (session.role === 'ecosystem-owner') {
                        return alert("👑 Eres el Ecosystem Owner. Puedes ver todo, pero para ejecutar tareas debes asignarte una silla en 'La Colla'.");
                    }
                    
                    // RBAC: Verificar que el usuario tenga asignado el Rol de ORIGEN (From)
                    const userAssignments = project.asignaciones.filter(a => a.userId === session.activeUserId);
                    const canPull = userAssignments.find(a => a.roleId === tx.from);
                    
                    if (!canPull) {
                        return alert(`⛔ Acceso Denegado:\nEsta tarea pertenece al nodo [${role.levelId} - ${role.name}].\n\nNo estás sentado en esa silla. Si debes hacer esta tarea, solicita la asignación en 'La Colla'.`);
                    }

                    store.dispatch({
                        type: 'PING_TRANSACTION',
                        payload: { projectId: project.id, txHash: tx.hash, userId: session.activeUserId }
                    });
                    this.executeViewScript();
                });
            }

            const approveBtn = card.querySelector('.btn-approve');
            if (approveBtn) {
                approveBtn.addEventListener('click', () => {
                    // RBAC: Solo PO o Auditor (@dosos) puede aprobar
                    const isPO = project.ownerId === session.activeUserId || session.role === 'ecosystem-owner';
                    
                    // Comprobar si el usuario activo tiene una silla de Auditor (@dosos) en este proyecto
                    const myRoles = project.asignaciones.filter(a => a.userId === session.activeUserId).map(a => project.roles.find(r => r.id === a.roleId));
                    const isAuditor = myRoles.some(r => r && r.levelId === '@dosos');

                    if (!isPO && !isAuditor) {
                        return alert("⛔ Auditoría Denegada:\nSolo el Project Owner o un nodo con nivel [@dosos] puede aprobar el trabajo y acuñar equidad en el Ledger.");
                    }

                    if(confirm('¿Aprobar Proof of Work? Esto generará Slices inmutables en el Ledger.')) {
                        store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId: project.id, txHash: tx.hash } });
                        this.executeViewScript();
                    }
                });
            }
        }, 10);

        return card;
    }

    getColorForLevel(levelId) {
        const colors = { '@anxaneta': 'var(--accent-red)', '@aixecador': '#ff4081', '@dosos': 'var(--accent-purple)', '@baixos': 'var(--accent-indigo)', '@pinya': 'var(--accent-blue)' };
        return colors[levelId] || 'var(--text-main)';
    }
}
