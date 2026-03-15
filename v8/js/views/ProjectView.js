// v8/js/views/ProjectView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js'; 
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class ProjectView {
    constructor() {
        document.title = "Matriz PULL | TeamTowers V9";
        this.activeProjectId = null;
        this.currentFilter = 'all'; 
        this.currentTab = 'oportunidades'; 
        this.isProcessingAi = false; 
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
            title: "Kanban PULL",
            subtitle: project.nombre,
            tagline: "Mercado interno de tareas. Asume responsabilidad, valida SOCs y ejecuta valor.",
            actionHtml: `<button id="btnToggleAvailability" class="${statusBtnClass}">${statusBtnText}</button>`,
            tabs: [
                { id: 'oportunidades', label: 'Oportunidades', active: this.currentTab === 'oportunidades' },
                { id: 'en-curso', label: 'En Curso (y Auditoría)', active: this.currentTab === 'en-curso' },
                { id: 'contabilizado', label: 'Selladas', active: this.currentTab === 'contabilizado' }
            ],
            magicActions: [
                { id: 'ai_assign', label: 'Auto-Asignación IA', icon: '🤖', isAi: true, tokens: 50 }
            ]
        };

        const canCreateWO = store.canUserCreateWorkOrder(project.id, activeUserId);
        const isPO = project.ownerId === activeUserId || state.session.role === 'ecosystem-owner';

        const sprints = project.sprints || [{id: 'sp_default', name: 'Sprint 1'}];
        const activeSprintId = project.activeSprintId || sprints[0].id;
        
        const sprintOptions = sprints.map(sp => `
            <option value="${sp.id}" ${sp.id === activeSprintId ? 'selected' : ''}>⏳ ${sp.name}</option>
        `).join('');

        return `
            <style>
                .workspace.is-open-to-work { box-shadow: inset 0 0 150px rgba(0, 230, 118, 0.03); }
                .kanban-container { width: 100%; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; }

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

                .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; align-items: start; padding-bottom: 5rem; width: 100%; }
                
                .task-card { 
                    box-sizing: border-box; width: 100%;
                    background: linear-gradient(180deg, rgba(25,25,30,0.8) 0%, rgba(10,10,15,0.9) 100%); 
                    border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.8rem; 
                    transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s; 
                    position: relative; display: flex; flex-direction: column; gap: 12px; 
                    backdrop-filter: blur(15px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5);
                }
                .task-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.15); box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 15px 40px rgba(0,0,0,0.8);}
                .task-card.ai-processing { border-color: var(--accent-purple); box-shadow: 0 0 30px rgba(224,64,251,0.3); animation: aiPulse 2s infinite; }
                
                .task-header { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
                .task-route { display: flex; gap: 8px; align-items: center; flex-wrap: wrap;}
                .route-badge { font-size: 0.7rem; padding: 4px 10px; border-radius: 8px; font-family: var(--font-mono); font-weight: 900; border: 1px solid; white-space: nowrap;}
                
                .task-title { color: white; font-size: 1.25rem; margin: 5px 0 0 0; line-height: 1.3; font-weight: 900; letter-spacing: -0.5px; word-break: break-word;}
                .task-desc-bubble { font-size: 0.85rem; color: #aaa; background: rgba(0,0,0,0.5); padding: 12px; border-radius: 8px; border-left: 3px solid var(--accent-blue); margin-bottom: 5px; font-style: italic; line-height: 1.5; word-break: break-word;}
                .task-ai-output { font-size: 0.85rem; color: #ddd; background: rgba(224, 64, 251, 0.05); border: 1px solid rgba(224, 64, 251, 0.2); padding: 12px; border-radius: 8px; margin-bottom: 5px; line-height: 1.5; max-height: 150px; overflow-y: auto;}

                .task-meta-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #888; background: rgba(0,0,0,0.4); padding: 12px 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);}
                .soc-progress { display: flex; align-items: center; gap: 5px; font-weight: bold; font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-blue); }
                
                .task-actions { margin-top: auto; padding-top: 15px; border-top: 1px dashed rgba(255,255,255,0.1); display: flex; flex-direction: row; gap: 10px;}
                
                .btn-pull, .btn-push { flex: 1; background: transparent; border: 1px solid #666; color: white; transition: 0.2s; padding: 12px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 0.9rem;}
                .btn-pull:hover { background: white; color: black; border-color: white;}
                .btn-push { border-style: dashed; border-color: var(--accent-purple); color: var(--accent-purple); }
                .btn-push:hover { background: rgba(224, 64, 251, 0.1); border-style: solid;}

                .btn-focus { flex: 1; background: linear-gradient(135deg, rgba(0,176,255,0.1), rgba(0,176,255,0.2)); border: 1px solid var(--accent-blue); color: var(--accent-blue); text-align: center; text-decoration: none; padding: 12px; border-radius: 10px; font-weight: 900; transition: 0.3s; font-size: 0.9rem;}
                .btn-focus:hover { background: var(--accent-blue); color: black; box-shadow: 0 0 20px rgba(0,176,255,0.4);}
                
                .btn-ai-exec { flex: 1; background: linear-gradient(135deg, rgba(224, 64, 251, 0.1), rgba(224, 64, 251, 0.2)); border: 1px solid var(--accent-purple); color: var(--accent-purple); text-align: center; text-decoration: none; padding: 12px; border-radius: 10px; font-weight: 900; transition: 0.3s; font-size: 0.9rem; cursor:pointer;}
                .btn-ai-exec:hover { background: var(--accent-purple); color: white; box-shadow: 0 0 25px rgba(224, 64, 251, 0.5);}

                .btn-review { flex: 1; background: var(--accent-blue); color: black; border: none; padding: 12px; border-radius: 10px; font-weight: 900; cursor: pointer; transition: 0.2s; font-size: 0.9rem;}
                .btn-review:hover { transform: scale(1.02); box-shadow: 0 0 15px rgba(0,176,255,0.4);}

                .empty-state { grid-column: 1 / -1; text-align: center; padding: 5rem 2rem; color: var(--text-muted); font-size: 1.2rem; border: 1px dashed var(--glass-border); border-radius: 20px; background: rgba(0,0,0,0.3);}

                @keyframes aiPulse { 0% { box-shadow: 0 0 10px rgba(224,64,251,0.2); } 50% { box-shadow: 0 0 40px rgba(224,64,251,0.6); } 100% { box-shadow: 0 0 10px rgba(224,64,251,0.2); } }

                /* MODAL OVERLAY */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 4000; }
                .modal-content { background: var(--bg-panel); border: 1px solid var(--glass-border); padding: 2.5rem; border-radius: 16px; width: 550px; max-width: 95%; box-shadow: 0 20px 50px rgba(0,0,0,0.8); animation: slideUp 0.3s ease-out; box-sizing: border-box; max-height: 90vh; overflow-y: auto;}
                
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 5px; font-weight: bold; }
                .form-control { background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 12px; border-radius: 8px; font-family: inherit; font-size: 0.95rem; outline: none; width: 100%; transition: 0.2s; box-sizing: border-box; }
                .form-control:focus { border-color: var(--accent-blue); }

                .soc-list { display: flex; flex-direction: column; gap: 10px; margin-top: 15px; }
                .soc-item { display: flex; align-items: flex-start; gap: 10px; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px solid #333; }
                .soc-item input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-green); margin-top: 2px; }
                .soc-item span { color: #ccc; font-size: 0.9rem; line-height: 1.4; }

                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .controls-row { flex-direction: column; align-items: stretch; }
                    .sprint-controls { justify-content: space-between; }
                    .filters-container { flex-direction: column; width: 100%; gap: 10px;}
                    .filter-dropdown, .btn-create-task { width: 100%; padding: 14px; }
                    .task-grid { grid-template-columns: 1fr; gap: 1.2rem; padding-bottom: 2rem; }
                    .task-actions { flex-direction: column; gap: 10px; }
                    .btn-pull, .btn-push, .btn-focus, .btn-ai-exec, .btn-review { width: 100%; padding: 14px;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/project')}

                <main class="workspace ${isOpen ? 'is-open-to-work' : ''}">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="kanban-container">
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
                                ${canCreateWO ? `<button class="btn-create-task" id="btnOpenCreateTask">➕ Generar Work Order</button>` : ''}
                            </div>
                        </div>
                        <div class="task-grid" id="taskGrid"></div>
                    </div>
                </main>

                <div class="modal-overlay" id="createTaskModal">
                    <div class="modal-content">
                        <h2 style="color:white; margin-top:0; margin-bottom: 5px; font-weight:900; font-size:1.8rem; letter-spacing:-1px;">Abrir el Grifo</h2>
                        <p style="color:#aaa; font-size:0.95rem; margin-bottom:2rem; line-height:1.5;">Instancia una receta (SOP) a partir de las tuberías permanentes del Mapa VNA.</p>
                        
                        <div class="form-group">
                            <label>Tubería de Valor Origen (Flow)</label>
                            <select id="newTaskFlowId" class="form-control
