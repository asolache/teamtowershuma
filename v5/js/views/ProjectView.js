// v5/js/views/ProjectView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

export default class ProjectView {
    constructor() {
        document.title = "Kanban de Tracción | TeamTowers";
        this.activeProjectId = null;
    }

    async getHtml() {
        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: #0a0a0c; font-family: 'Segoe UI', sans-serif; }
                
                /* Workspace */
                .workspace { flex: 1; padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; }
                .view-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;}
                .view-header h1 { font-size: 2rem; color: white; margin: 0; letter-spacing: -1px; }
                
                /* KANBAN COLUMNS */
                .kanban-container { display: flex; gap: 1.5rem; flex: 1; overflow-x: auto; padding-bottom: 1rem; align-items: flex-start; scroll-behavior: smooth;}
                .kanban-col {
                    flex: 1; min-width: 300px; max-width: 400px; background: rgba(255,255,255,0.02); border-radius: 16px;
                    padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; border: 1px solid rgba(255,255,255,0.05);
                    max-height: 100%; overflow-y: auto;
                }
                
                /* Scrollbar para las columnas */
                .kanban-col::-webkit-scrollbar { width: 6px; }
                .kanban-col::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

                .col-title { font-size: 0.8rem; font-weight: 800; color: #888; text-transform: uppercase; display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 10px; letter-spacing: 1px; }
                
                /* TASK CARDS */
                .task-card { background: #16161a; border: 1px solid #2a2a30; border-radius: 12px; padding: 1.2rem; transition: all 0.3s; animation: fadeInTask 0.4s ease forwards; }
                @keyframes fadeInTask { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .task-card:hover { border-color: #00b0ff; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
                .task-title { font-size: 1rem; margin: 0.8rem 0; line-height: 1.4; color: white; font-weight: 600; }
                .task-meta { display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #666; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #222;}
                
                /* BOTONES ACCIÓN */
                .btn-pull { background: transparent; border: 1px solid #00b0ff; color: #00b0ff; width: 100%; padding: 8px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; font-weight: bold; }
                .btn-pull:hover { background: rgba(0, 176, 255, 0.2); }
                .btn-focus { background: #00e676; border: none; color: black; width: 100%; display: block; text-align: center; padding: 10px; border-radius: 6px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; font-weight: bold; text-decoration: none; }
                .btn-focus:hover { background: #00c853; transform: scale(1.02); }
                .btn-approve { background: transparent; border: 1px solid #e040fb; color: #e040fb; width: 100%; padding: 8px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; font-weight: bold; margin-top: 10px; }
                .btn-approve:hover { background: rgba(224, 64, 251, 0.2); }

                /* MOBILE RESPONSIVE */
                @media (max-width: 768px) {
                    .app-layout { flex-direction: column; }
                    .workspace { padding: 1rem; }
                    .kanban-container { flex-direction: column; overflow-x: visible; }
                    .kanban-col { max-width: 100%; min-width: 100%; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/project')}

                <main class="workspace">
                    <div class="view-header">
                        <div>
                            <h1>Tracción de Red</h1>
                            <p style="color: #888; font-size: 0.9rem; margin-top: 5px;">Convierte los entregables teóricos en Slices de Equity reales.</p>
                        </div>
                        <a href="/v5/map" class="btn btn-outline" data-link style="border: 1px solid #333; padding: 10px 15px; border-radius: 8px; color: white; text-decoration: none; font-size: 0.9rem; transition: background 0.2s;">+ Diseñar Entregable VNA</a>
                    </div>

                    <div class="kanban-container">
                        <div class="kanban-col">
                            <div class="col-title">📥 Mercado Teórico <span id="count-theo">0</span></div>
                            <div id="theo-list" style="display: flex; flex-direction: column; gap: 1rem;"></div>
                        </div>

                        <div class="kanban-col" style="background: rgba(0, 176, 255, 0.03); border-color: rgba(0, 176, 255, 0.1);">
                            <div class="col-title" style="color: #00b0ff;">🔥 Deep Work <span id="count-work">0</span></div>
                            <div id="work-list" style="display: flex; flex-direction: column; gap: 1rem;"></div>
                        </div>

                        <div class="kanban-col">
                            <div class="col-title" style="color: #00e676;">⛓️ Ledger <span id="count-done">0</span></div>
                            <div id="done-list" style="display: flex; flex-direction: column; gap: 1rem;"></div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        // INICIALIZAR LISTENERS DEL SIDEBAR (Para el botón de Logout)
        Sidebar.initListeners();

        const state = store.getState();
        let project = state.projects[state.projects.length - 1];

        if (!project) return;
        this.activeProjectId = project.id;
        
        this.renderTasks(project);
    }

    renderTasks(project) {
        const lists = { theo: document.getElementById('theo-list'), work: document.getElementById('work-list'), done: document.getElementById('done-list') };
        Object.values(lists).forEach(l => l.innerHTML = '');

        const txs = project.transactions || [];
        let counts = { theo: 0, work: 0, done: 0 };

        txs.forEach(tx => {
            const card = this.createTaskCard(tx, project);
            if (tx.status === 'theoretical') { lists.theo.appendChild(card); counts.theo++; } 
            else if (tx.status === 'pinged' || tx.status === 'reported') { lists.work.appendChild(card); counts.work++; } 
            else if (tx.status === 'consolidated' || tx.status === 'approved') { lists.done.appendChild(card); counts.done++; }
        });

        document.getElementById('count-theo').innerText = counts.theo;
        document.getElementById('count-work').innerText = counts.work;
        document.getElementById('count-done').innerText = counts.done;
    }

    createTaskCard(tx, project) {
        const role = project.roles.find(r => r.id === tx.from) || { name: 'Nodo', levelId: '@baixos' };
        const card = document.createElement('div');
        card.className = 'task-card';
        const color = this.getColorForLevel(role.levelId);
        const tipoColor = tx.tipo === 'tangible' ? '#00e676' : '#e040fb';

        let actionHtml = '';

        if (tx.status === 'theoretical') {
            actionHtml = `<button class="btn-pull" data-hash="${tx.hash}">Hacer PULL</button>`;
        } 
        else if (tx.status === 'pinged') {
            actionHtml = `
                <div style="color: #ff9100; font-size: 0.75rem; font-weight: bold; margin-bottom: 10px;">⏳ EN PROCESO</div>
                <a href="/v5/focus" class="btn-focus" data-link>▶ Iniciar Pomodoro</a>
            `;
        } 
        else if (tx.status === 'reported') {
            actionHtml = `
                <div style="color: #00b0ff; font-size: 0.75rem; font-weight: bold; margin-bottom: 10px;">🛡️ ESPERANDO AUDITORÍA</div>
                <div style="font-size: 0.8rem; color: #888; background: #000; padding: 5px; border-radius: 4px;">Horas Reales: ${tx.realHours}h</div>
                <button class="btn-approve" data-hash="${tx.hash}">Aprobar y Consolidar</button>
            `;
        }
        else if (tx.status === 'consolidated') {
            actionHtml = `
                <div style="color: #00e676; font-size: 0.8rem; font-weight: bold; font-family: monospace;">
                    +${Math.round(tx.valorCongelado)} Slices
                </div>
            `;
        }

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="badge" style="color: ${color}; border-color: ${color}; font-size: 0.65rem;">${role.levelId}</span>
                <span style="font-size: 0.6rem; color: #555; font-family: monospace;">#${tx.hash.substring(0,6)}</span>
            </div>
            <h3 class="task-title">${tx.entregable}</h3>
            <div style="margin-bottom: 1rem;">${actionHtml}</div>
            <div class="task-meta">
                <span>⏱ ${tx.horas}h Est.</span>
                <span style="color: ${tipoColor}; font-weight: bold; text-transform: uppercase;">${tx.tipo}</span>
            </div>
        `;

        setTimeout(() => {
            const pullBtn = card.querySelector('.btn-pull');
            if (pullBtn) {
                pullBtn.addEventListener('click', () => {
                    const state = store.getState();
                    const activeUser = state.session.activeUserId;
                    
                    // VALIDACIÓN DE EDGE CASES INTACTA
                    if (activeUser === 'ecosystem-admin') {
                        alert("⚠️ Estás operando como Administrador Global. Para asumir una tarea, ve a 'Tripulación', identifícate con un usuario y asígnate un rol.");
                        return;
                    }
                    const hasRole = project.asignaciones.find(a => a.userId === activeUser);
                    if (!hasRole) {
                        alert("⚠️ No tienes ninguna silla (Rol) asignada en este Castell. Ve a 'Tripulación' y asígnate un rol antes de trabajar.");
                        return;
                    }

                    store.dispatch({
                        type: 'PING_TRANSACTION',
                        payload: { projectId: project.id, txHash: tx.hash, userId: activeUser }
                    });
                    this.executeViewScript();
                });
            }

            const approveBtn = card.querySelector('.btn-approve');
            if (approveBtn) {
                approveBtn.addEventListener('click', () => {
                    store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId: project.id, txHash: tx.hash } });
                    this.executeViewScript();
                });
            }
        }, 10);

        return card;
    }

    getColorForLevel(levelId) {
        const colors = { '@anxaneta': '#ff5252', '@aixecador': '#ff4081', '@dosos': '#e040fb', '@baixos': '#7c4dff', '@pinya': '#536dfe' };
        return colors[levelId] || '#ffffff';
    }
}
