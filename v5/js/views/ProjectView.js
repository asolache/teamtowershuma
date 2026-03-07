// v5/js/views/ProjectView.js
import { store } from '../core/store.js';

export default class ProjectView {
    constructor() {
        document.title = "Kanban de Tracción | TeamTowers";
        this.activeProjectId = null;
    }

    async getHtml() {
        const state = store.getState();
        // Intentar obtener el último proyecto creado o uno por defecto
        const project = state.projects[state.projects.length - 1] || { 
            nombre: "Sin Proyecto", 
            archetype: "startup", 
            transactions: [],
            id: 'null'
        };
        this.activeProjectId = project.id;

        const resiliencia = store.calculateResilience(this.activeProjectId);
        const madurez = store.calculateMaturityIndex(this.activeProjectId).score;

        return `
            <style>
                .top-navbar {
                    height: var(--top-nav-height); background: rgba(10, 10, 12, 0.95);
                    border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between;
                    align-items: center; padding: 0 2rem; z-index: 100; backdrop-filter: var(--glass-blur);
                }
                .logo { font-size: 1.2rem; font-weight: 800; display: flex; align-items: center; gap: 8px; cursor: pointer; }
                .logo span { color: var(--accent-blue); }
                
                .app-body { display: flex; height: calc(100vh - var(--top-nav-height)); overflow: hidden; }
                
                /* Sidebar Local */
                .sidebar {
                    width: var(--sidebar-width); background: rgba(15, 15, 18, 0.5); border-right: 1px solid var(--glass-border);
                    padding: 1.5rem 1rem; display: flex; flex-direction: column; gap: 0.5rem;
                }
                .project-context-header { 
                    padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 12px;
                    border: 1px solid var(--glass-border); margin-bottom: 1.5rem; 
                }
                .project-context-header h3 { font-size: 0.95rem; margin-bottom: 4px; color: white; }
                .project-context-header p { font-size: 0.7rem; color: var(--accent-blue); text-transform: uppercase; font-weight: bold; }
                
                .health-mini-card { margin-top: auto; padding: 1rem; background: #000; border-radius: 10px; border: 1px solid #222; }
                .health-bar { height: 4px; background: #222; border-radius: 2px; margin-top: 8px; overflow: hidden; }
                .health-fill { height: 100%; background: var(--accent-green); transition: width 0.5s; }

                .side-link {
                    padding: 0.8rem 1rem; border-radius: 8px; cursor: pointer; color: var(--text-muted);
                    font-size: 0.85rem; display: flex; align-items: center; gap: 10px; transition: all 0.2s; text-decoration: none;
                }
                .side-link:hover { background: rgba(255,255,255,0.05); color: var(--text-main); }
                .side-link.active { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); font-weight: bold; }

                /* Workspace Central */
                .workspace { flex: 1; padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; background: #0a0a0c; }
                .view-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;}
                .view-header h1 { font-size: 1.8rem; letter-spacing: -1px; }
                
                .kanban-container { display: flex; gap: 1.5rem; flex: 1; overflow-x: auto; padding-bottom: 1rem; align-items: flex-start; }
                .kanban-col {
                    flex: 1; min-width: 320px; background: rgba(255,255,255,0.02); border-radius: 16px;
                    padding: 1.2rem; display: flex; flex-direction: column; gap: 1rem; border: 1px solid rgba(255,255,255,0.05);
                    max-height: 100%; overflow-y: auto;
                }
                .col-title { 
                    font-size: 0.75rem; font-weight: 800; color: var(--text-muted); 
                    text-transform: uppercase; display: flex; justify-content: space-between; 
                    padding: 0 5px 10px 5px; border-bottom: 1px solid #222; margin-bottom: 5px;
                }
                
                /* Task Cards Evolucionadas */
                .task-card {
                    background: #16161a; border: 1px solid #2a2a30; border-radius: 12px;
                    padding: 1.2rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    animation: fadeInTask 0.4s ease forwards;
                }
                @keyframes fadeInTask { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                .task-card:hover { border-color: var(--accent-blue); transform: scale(1.02); box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
                .task-title { font-size: 0.95rem; margin: 0.6rem 0; line-height: 1.4; color: #eee; font-weight: 500; }
                .task-meta { display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #222;}
                
                .btn-pull { 
                    background: transparent; border: 1px solid var(--accent-blue); color: var(--accent-blue);
                    padding: 6px 12px; border-radius: 6px; font-size: 0.7rem; cursor: pointer; transition: all 0.2s;
                }
                .btn-pull:hover { background: var(--accent-blue); color: white; }

                @media (max-width: 768px) {
                    .sidebar { display: none; }
                    .workspace { padding: 1rem; }
                    .view-header h1 { font-size: 1.4rem; }
                }
            </style>

            <header class="top-navbar">
                <div class="logo" onclick="location.href='/v5/'">🗼 <span>TeamTowers</span></div>
                <nav style="display: flex; gap: 1.5rem;">
                    <a href="/v5/map" class="side-link" data-link style="padding: 5px 10px;">🌐 Mapa de Valor</a>
                    <div style="width: 32px; height: 32px; background: #333; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 0.8rem; border: 1px solid var(--accent-blue);">AL</div>
                </nav>
            </header>

            <div class="app-body">
                <aside class="sidebar">
                    <div class="project-context-header">
                        <h3>${project.nombre}</h3>
                        <p>MODELO: ${project.archetype.toUpperCase()}</p>
                    </div>
                    
                    <a href="/v5/project" class="side-link active" data-link>📋 Backlog (Tracción)</a>
                    <a href="/v5/map" class="side-link" data-link>📊 VNA (Flujos de Valor)</a>
                    <a href="/v5/tests" class="side-link" data-link>🛠 Diagnóstico Kernel</a>
                    
                    <div class="health-mini-card">
                        <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: #888;">
                            <span>RESILIENCIA</span>
                            <span style="color: var(--accent-green);">${resiliencia}%</span>
                        </div>
                        <div class="health-bar"><div class="health-fill" style="width: ${resiliencia}%"></div></div>
                        
                        <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: #888; margin-top: 12px;">
                            <span>MADUREZ</span>
                            <span style="color: var(--accent-blue);">${madurez}%</span>
                        </div>
                        <div class="health-bar"><div class="health-fill" style="width: ${madurez}%; background: var(--accent-blue);"></div></div>
                    </div>
                </aside>

                <main class="workspace">
                    <div class="view-header">
                        <div>
                            <h1>Tracción de Red</h1>
                            <p style="color: var(--text-muted); font-size: 0.9rem;">Gestiona los entregables y consolida el valor en el Ledger.</p>
                        </div>
                        <button class="btn btn-primary" id="btnRequest">✨ Solicitar Prompt</button>
                    </div>

                    <div class="kanban-container">
                        <div class="kanban-col" id="col-theoretical">
                            <div class="col-title">📥 Mercado Teórico <span id="count-theo">0</span></div>
                            <div id="theo-list" style="display: flex; flex-direction: column; gap: 1rem;">
                                </div>
                        </div>

                        <div class="kanban-col" id="col-work" style="background: rgba(0, 176, 255, 0.03); border-color: rgba(0, 176, 255, 0.1);">
                            <div class="col-title" style="color: var(--accent-blue);">🔥 Deep Work <span id="count-work">0</span></div>
                            <div id="work-list" style="display: flex; flex-direction: column; gap: 1rem;">
                                </div>
                        </div>

                        <div class="kanban-col" id="col-done">
                            <div class="col-title" style="color: var(--accent-green);">⛓️ Ledger <span id="count-done">0</span></div>
                            <div id="done-list" style="display: flex; flex-direction: column; gap: 1rem;">
                                </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        const state = store.getState();
        const project = state.projects[state.projects.length - 1];
        if (!project) return;

        this.renderTasks(project);

        document.getElementById('btnRequest').addEventListener('click', () => {
            alert("Sincronizando con la IA para generar nuevos entregables tácticos...");
        });
    }

    renderTasks(project) {
        const lists = {
            theo: document.getElementById('theo-list'),
            work: document.getElementById('work-list'),
            done: document.getElementById('done-list')
        };
        
        // Limpiar
        Object.values(lists).forEach(l => l.innerHTML = '');

        const txs = project.transactions || [];
        let counts = { theo: 0, work: 0, done: 0 };

        txs.forEach(tx => {
            const card = this.createTaskCard(tx, project);
            
            if (tx.status === 'theoretical') {
                lists.theo.appendChild(card);
                counts.theo++;
            } else if (tx.status === 'pinged' || tx.status === 'reported') {
                lists.work.appendChild(card);
                counts.work++;
            } else if (tx.status === 'consolidated' || tx.status === 'approved') {
                lists.done.appendChild(card);
                counts.done++;
            }
        });

        document.getElementById('count-theo').innerText = counts.theo;
        document.getElementById('count-work').innerText = counts.work;
        document.getElementById('count-done').innerText = counts.done;
    }

    createTaskCard(tx, project) {
        const role = project.roles.find(r => r.id === tx.from) || { name: 'Nodo', levelId: '@baixos' };
        const card = document.createElement('div');
        card.className = 'task-card';
        
        const isStartup = project.archetype === 'startup';
        const color = this.getColorForLevel(role.levelId);

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="badge" style="color: ${color}; border-color: ${color}; font-size: 0.65rem;">${role.levelId}</span>
                <span style="font-size: 0.6rem; color: #555; font-family: monospace;">#${tx.hash.substring(0,6)}</span>
            </div>
            <h3 class="task-title">${tx.entregable}</h3>
            
            ${tx.status === 'theoretical' ? `<button class="btn-pull">Hacer PULL</button>` : ''}
            ${tx.status === 'pinged' ? `<div style="color: var(--accent-orange); font-size: 0.7rem; font-weight: bold;">⏳ EN PROCESO</div>` : ''}

            <div class="task-meta">
                <span>⏱ ${tx.horas}h Est.</span>
                <span style="color: ${tx.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)'}; font-weight: bold;">
                    ${tx.tipo.toUpperCase()}
                </span>
            </div>
        `;

        if (tx.status === 'theoretical') {
            card.querySelector('.btn-pull').addEventListener('click', (e) => {
                e.stopPropagation();
                store.dispatch({
                    type: 'PING_TRANSACTION',
                    payload: { projectId: project.id, txHash: tx.hash, userId: 'current-user' }
                });
                this.executeViewScript(); // Re-render
            });
        }

        return card;
    }

    getColorForLevel(levelId) {
        const colors = { '@anxaneta': '#ff5252', '@aixecador': '#ff4081', '@dosos': '#e040fb', '@baixos': '#7c4dff', '@pinya': '#536dfe' };
        return colors[levelId] || '#ffffff';
    }
}
