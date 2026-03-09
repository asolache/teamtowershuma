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
            <div class="app-layout">
                ${Sidebar.getHtml('/project')}

                <main class="workspace">
                    <div class="view-header">
                        <div>
                            <h1>Tracción de Red</h1>
                            <p>Convierte los entregables teóricos en Slices de Equity reales.</p>
                        </div>
                        <a href="/v5/map" class="btn btn-outline" data-link>+ Diseñar Entregable VNA</a>
                    </div>

                    <div class="kanban-container">
                        <div class="kanban-col">
                            <div class="col-title">📥 Mercado Teórico <span class="badge" id="count-theo">0</span></div>
                            <div id="theo-list" style="display: flex; flex-direction: column; gap: 1rem;"></div>
                        </div>

                        <div class="kanban-col" style="background: rgba(0, 176, 255, 0.03); border-color: rgba(0, 176, 255, 0.1);">
                            <div class="col-title" style="color: var(--accent-blue);">🔥 Deep Work <span class="badge" id="count-work">0</span></div>
                            <div id="work-list" style="display: flex; flex-direction: column; gap: 1rem;"></div>
                        </div>

                        <div class="kanban-col">
                            <div class="col-title" style="color: var(--accent-green);">⛓️ Ledger <span class="badge" id="count-done">0</span></div>
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
        const tipoColor = tx.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';

        let actionHtml = '';

        if (tx.status === 'theoretical') {
            actionHtml = `<button class="btn btn-outline btn-pull" data-hash="${tx.hash}" style="width: 100%;">Hacer PULL</button>`;
        } 
        else if (tx.status === 'pinged') {
            actionHtml = `
                <div style="color: var(--accent-orange); font-size: 0.75rem; font-weight: bold; margin-bottom: 10px;">⏳ EN PROCESO</div>
                <a href="/v5/focus" class="btn btn-focus" style="width: 100%;" data-link>▶ Iniciar Pomodoro</a>
            `;
        } 
        else if (tx.status === 'reported') {
            actionHtml = `
                <div style="color: var(--accent-blue); font-size: 0.75rem; font-weight: bold; margin-bottom: 10px;">🛡️ ESPERANDO AUDITORÍA</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); background: rgba(0,0,0,0.5); padding: 8px; border-radius: 4px; margin-bottom: 10px;">Horas Reales: <strong style="color: white;">${tx.realHours}h</strong></div>
                <button class="btn btn-primary btn-approve" data-hash="${tx.hash}" style="width: 100%;">Aprobar y Consolidar</button>
            `;
        }
        else if (tx.status === 'consolidated') {
            actionHtml = `
                <div style="color: var(--accent-green); font-size: 1rem; font-weight: bold; font-family: var(--font-mono); text-align: center; padding: 10px; background: rgba(0, 230, 118, 0.05); border-radius: 8px;">
                    +${Math.round(tx.valorCongelado)} Slices
                </div>
            `;
        }

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="badge" style="color: ${color}; border-color: ${color}; font-size: 0.65rem;">${role.levelId}</span>
                <span style="font-size: 0.6rem; color: var(--text-muted); font-family: var(--font-mono);">#${tx.hash.substring(0,6)}</span>
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
        const colors = { '@anxaneta': 'var(--accent-red)', '@aixecador': '#ff4081', '@dosos': 'var(--accent-purple)', '@baixos': 'var(--accent-indigo)', '@pinya': 'var(--accent-blue)' };
        return colors[levelId] || 'var(--text-main)';
    }
}
