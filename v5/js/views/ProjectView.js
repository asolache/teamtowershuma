// v5/js/views/ProjectView.js

export default class ProjectView {
    constructor() {
        document.title = "Kanban de Proyecto | TeamTowers";
    }

    async getHtml() {
        return `
            <style>
                /* Estilos específicos del App Shell */
                .top-navbar {
                    height: var(--top-nav-height); background: rgba(10, 10, 12, 0.9);
                    border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between;
                    align-items: center; padding: 0 2rem; z-index: 100; backdrop-filter: var(--glass-blur);
                }
                .logo { font-size: 1.2rem; font-weight: 800; display: flex; align-items: center; gap: 8px; }
                .logo span { color: var(--accent-blue); }
                .global-links a { color: var(--text-muted); margin-left: 2rem; font-size: 0.9rem; font-weight: 500; transition: color 0.2s;}
                .global-links a:hover { color: var(--accent-blue); }
                
                .app-body { display: flex; height: calc(100vh - var(--top-nav-height)); }
                
                /* Sidebar Local */
                .sidebar {
                    width: var(--sidebar-width); background: var(--glass-bg); border-right: 1px solid var(--glass-border);
                    padding: 1.5rem 1rem; display: flex; flex-direction: column; gap: 0.5rem;
                }
                .project-context-header { padding-bottom: 1rem; border-bottom: 1px solid var(--glass-border); margin-bottom: 1rem; }
                .project-context-header h3 { font-size: 1rem; margin-bottom: 4px; }
                .project-context-header p { font-size: 0.75rem; color: var(--accent-green); }
                
                .side-link {
                    padding: 0.8rem 1rem; border-radius: 8px; cursor: pointer; color: var(--text-muted);
                    font-size: 0.9rem; display: block; transition: all 0.2s;
                }
                .side-link:hover { background: rgba(255,255,255,0.05); color: var(--text-main); }
                .side-link.active { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); border-left: 3px solid var(--accent-blue); }

                /* Workspace Central (Kanban) */
                .workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; display: flex; flex-direction: column; }
                .view-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end;}
                .view-header h1 { font-size: 2rem; margin-bottom: 5px; }
                .view-header p { color: var(--text-muted); font-size: 0.9rem; }

                .kanban-container { display: flex; gap: 1.5rem; flex: 1; overflow-x: auto; padding-bottom: 1rem; }
                .kanban-col {
                    flex: 1; min-width: 300px; background: rgba(0,0,0,0.2); border-radius: 12px;
                    padding: 1rem; display: flex; flex-direction: column; gap: 1rem; border: 1px solid rgba(255,255,255,0.03);
                }
                .col-title { font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; display: flex; justify-content: space-between;}
                
                /* Task Cards */
                .task-card {
                    background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 8px;
                    padding: 1rem; cursor: grab; transition: transform 0.2s, border-color 0.2s;
                }
                .task-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.2); }
                .task-title { font-size: 1rem; margin: 0.5rem 0; line-height: 1.3; }
                .task-meta { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-muted); margin-top: 1rem;}
                
                /* Responsivo App Shell */
                @media (max-width: 768px) {
                    .sidebar { display: none; /* Ocultamos el sidebar en móvil por ahora */ }
                    .workspace { padding: 1rem; }
                    .global-links { display: none; }
                }
            </style>

            <header class="top-navbar">
                <div class="logo">🗼 <span>TeamTowers</span></div>
                <nav class="global-links">
                    <a href="/me" data-link>Mi Dashboard</a>
                    <a href="/eco" data-link>Macro-Redes</a>
                </nav>
                <div style="font-weight: bold; background: linear-gradient(45deg, var(--accent-blue), var(--accent-purple)); padding: 5px 12px; border-radius: 20px; font-size: 0.8rem;">AL</div>
            </header>

            <div class="app-body">
                
                <aside class="sidebar">
                    <div class="project-context-header">
                        <h3>App Salud Mental (IA)</h3>
                        <p>Arquetipo: Startup (x2.0)</p>
                    </div>
                    
                    <a href="/project" class="side-link active" data-link>📋 Backlog GTD (Pull)</a>
                    <a href="#" class="side-link">📊 Análisis & Salud</a>
                    <a href="/focus" class="side-link" data-link>⏱️ Deep Work (IA)</a>
                    <a href="/ledger" class="side-link" data-link>⛓️ Ledger (Auditoría)</a>
                </aside>

                <main class="workspace">
                    <div class="view-header">
                        <div>
                            <h1>Flujo de Tracción (Pull-System)</h1>
                            <p>Arrastra las tareas generadas por la IA o solicita nuevos prompts.</p>
                        </div>
                        <button class="btn btn-primary">+ Solicitar Entregable</button>
                    </div>

                    <div class="kanban-container">
                        <div class="kanban-col">
                            <div class="col-title">📥 Mercado Teórico <span>2</span></div>
                            
                            <div class="task-card">
                                <span class="badge" style="color: var(--role-anxaneta); background: rgba(255, 82, 82, 0.1);">@anxaneta</span>
                                <h3 class="task-title">Definir Modelo de Negocio Ético</h3>
                                <div class="task-meta"><span>⏱ 8h Est.</span><span style="color: var(--accent-blue);">Fase 1</span></div>
                            </div>

                            <div class="task-card">
                                <span class="badge" style="color: var(--role-dosos); background: rgba(224, 64, 251, 0.1);">@dosos</span>
                                <h3 class="task-title">Auditoría de Sesgos de la IA</h3>
                                <div class="task-meta"><span>⏱ 12h Est.</span><span style="color: var(--accent-blue);">Fase 1</span></div>
                            </div>
                        </div>

                        <div class="kanban-col" style="background: rgba(255, 145, 0, 0.05); border-color: rgba(255, 145, 0, 0.2);">
                            <div class="col-title" style="color: var(--accent-orange);">🔥 Deep Work <span>1</span></div>
                            
                            <div class="task-card" style="border-left: 3px solid var(--accent-orange);">
                                <span class="badge" style="color: var(--role-anxaneta); background: rgba(255, 82, 82, 0.1);">@anxaneta</span>
                                <h3 class="task-title">Pitch Deck y Contexto IA</h3>
                                
                                <a href="/focus" class="btn btn-focus" style="width: 100%; margin-top: 1rem;" data-link>
                                    ▶ Iniciar Pomodoro
                                </a>

                                <div class="task-meta" style="margin-top: 1rem;">
                                    <span>⏱ 12h Est.</span>
                                    <div style="width: 24px; height: 24px; background: var(--accent-blue); border-radius: 50%; color: white; display: flex; justify-content: center; align-items: center; font-size: 0.7rem; font-weight: bold;">Tú</div>
                                </div>
                            </div>
                        </div>

                        <div class="kanban-col">
                            <div class="col-title" style="color: var(--accent-green);">⛓️ Consolidado <span>0</span></div>
                            <div style="text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.8rem; border: 1px dashed var(--glass-border); border-radius: 8px;">
                                Arrastra tareas aquí para sellarlas en el Ledger y generar Slices.
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        console.log("Kanban inicializado.");
        // Aquí conectaremos la API Drag & Drop más adelante
    }
}
