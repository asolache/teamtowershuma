// v9/js/views/PaperView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js'; 
import { PageHeader } from '../components/PageHeader.js';
import { Orchestrator } from '../core/Orchestrator.js'; 

export default class PaperView {
    constructor() {
        document.title = "Omni-Paper | TeamTowers V9";
        this.woHash = new URLSearchParams(window.location.search).get('hash');
        this.activeTx = null; 
        this.activeSkillLab = null; 
        this.activeProjectId = null;
        this.isMenuOpen = false;
        this.currentWord = "";
        
        this.currentMemesSearchResult = [];
        this.activeMemeFilter = 'all';

        this.pomodoroInterval = null;
        this.pomodoroSeconds = 0;
        this.isPomodoroRunning = false;
    }

    async getHtml() {
        await store.init();
        const state = store.getState();
        this.activeProjectId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === this.activeProjectId);
        if (!project && state.projects.length > 0) {
            project = state.projects[state.projects.length - 1];
            this.activeProjectId = project.id;
        }

        const headerConfig = {
            title: "Omni-Paper (Workspace)",
            subtitle: project ? project.nombre : 'Kernel V9',
            tagline: "Lienzo Dual: Ejecuta Work Orders (GTD) o testea AgentSkills en el Laboratorio.",
            tabs: []
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width:100%;}
                .workspace-paper { flex: 1; display: flex; flex-direction: column; position: relative; background: radial-gradient(circle at center, #111116 0%, #050505 100%); overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; padding: 2rem 3rem; box-sizing: border-box; width: 100%; align-items: center;}
                
                .paper-container { width: 100%; max-width: 900px; display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; padding-bottom: 8rem;}
                
                .breadcrumb-bar { display: flex; align-items: center; background: rgba(10,10,15,0.8); padding: 10px 15px; border-radius: 12px; border: 1px solid var(--glass-border); gap: 10px; flex-wrap: wrap;}
                .bc-select { background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; font-size: 0.9rem; font-weight: bold; font-family: var(--font-main); outline: none; cursor: pointer; padding: 8px 12px; border-radius: 8px; transition: 0.3s;}
                .bc-select:focus { border-color: var(--accent-blue); }
                .bc-separator { color: #555; font-weight: bold; }
                
                .live-context-bar { background: rgba(10,10,15,0.95); border: 1px solid var(--accent-purple); padding: 12px 15px; border-radius: 12px; display: flex; flex-direction: column; gap: 10px; min-height: 24px; transition: 0.3s; position: sticky; top: 10px; z-index: 50; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px);}
                .live-context-label { font-size: 0.75rem; color: var(--accent-purple); text-transform: uppercase; font-weight: bold; letter-spacing: 1px;}
                .action-chip-container { display: flex; flex-wrap: wrap; gap: 10px; }
                .action-chip { display: flex; align-items: center; background: rgba(255,255,255,0.05); border: 1px solid #444; border-radius: 8px; padding: 4px; gap: 8px; animation: popIn 0.3s ease-out;}
                .cb-mention { color: var(--accent-blue); font-family: var(--font-mono); font-size: 0.85rem; font-weight: bold; padding-left: 5px;}
                .btn-micro-action { background: rgba(0,0,0,0.5); border: 1px solid transparent; color: #ccc; font-size: 0.7rem; font-weight: bold; font-family: var(--font-main); padding: 4px 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;}
                .btn-micro-action.ping { border-color: var(--accent-green); color: var(--accent-green); }
                .btn-micro-action.ping:hover { background: var(--accent-green); color: black;}
                .btn-micro-action.assign { border-color: var(--accent-orange); color: var(--accent-orange); }
                .btn-micro-action.assign:hover { background: var(--accent-orange); color: black;}

                /* POMODORO TRACKER */
                .pomodoro-panel { background: linear-gradient(145deg, rgba(20,20,25,0.9), rgba(10,10,15,0.95)); border: 1px solid var(--accent-orange); border-radius: 24px; padding: 2rem; text-align: center; box-shadow: 0 15px 35px rgba(255,171,64,0.15), inset 0 0 20px rgba(255,171,64,0.05); transition: 0.3s;}
                .pomodoro-panel.running { border-color: var(--accent-green); box-shadow: 0 15px 35px rgba(0,230,118,0.2), inset 0 0 30px rgba(0,230,118,0.1); animation: breathe 4s infinite;}
                .timer-display { font-size: 5rem; font-weight: 900; font-family: var(--font-mono); color: white; margin: 0.5rem 0; text-shadow: 0 5px 15px rgba(0,0,0,0.8); font-variant-numeric: tabular-nums;}
                .pomodoro-panel.running .timer-display { color: var(--accent-green); }
                
                .timer-controls { display: flex; justify-content: center; gap: 15px; margin-top: 1rem;}
                .btn-timer { background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; width: 60px; height: 60px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center;}
                .btn-timer:hover { background: rgba(255,255,255,0.1); transform: scale(1.1); }
                .btn-timer.play { border-color: var(--accent-green); color: var(--accent-green); }
                .btn-timer.play:hover { background: var(--accent-green); color: black; box-shadow: 0 0 15px rgba(0,230,118,0.5); }
                .btn-timer.pause { border-color: var(--accent-orange); color: var(--accent-orange); }
                .btn-timer.pause:hover { background: var(--accent-orange); color: black; box-shadow: 0 0 15px rgba(255,171,64,0.5); }

                /* TASK CONTEXT PANEL */
                .task-context-panel { display:none; background: rgba(15,15,20,0.9); border: 1px solid var(--glass-border); border-left: 4px solid var(--accent-green); padding: 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);}
                .task-context-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
                .task-context-title { font-size: 1.3rem; color: white; font-weight: 900; margin: 0; }
                .task-context-desc { font-size: 0.95rem; color: #ccc; line-height: 1.5; font-style: italic; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px;}
                
                .pow-section { display: flex; gap: 15px; margin-top: 20px; flex-wrap: wrap; }
                .pow-input-group { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 5px; }
                .pow-input-group label { font-size: 0.75rem; color: var(--accent-green); text-transform: uppercase; font-weight: bold; }
                .pow-input { background: rgba(0,0,0,0.6); border: 1px solid #444; color: white; padding: 12px; border-radius: 8px; font-family: var(--font-main); outline:none; transition: 0.3s;}
                .pow-input:focus { border-color: var(--accent-green); box-shadow: inset 0 0 10px rgba(0,230,118,0.1); }
                .pow-input.mono { font-family: var(--font-mono); font-weight: bold; color: var(--accent-orange); }

                .soc-checklist-box { margin-top: 15px; }
                .soc-checklist-box label { display: block; font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; margin-bottom: 8px; }
                .soc-item-check { display: flex; align-items: flex-start; gap: 10px; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; border: 1px solid #333; margin-bottom: 5px; transition: 0.2s;}
                .soc-item-check input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-green); margin-top: 2px; }
                .soc-item-check span { color: #ddd; font-size: 0.9rem; line-height: 1.4; }

                /* 🔥 LAB CONTEXT PANEL (AGENT SKILLS VIEWER) */
                .lab-context-panel { display:none; background: rgba(15,15,20,0.9); border: 1px solid var(--accent-orange); border-top: 4px solid var(--accent-orange); padding: 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(255,171,64,0.15);}
                .lab-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 15px; margin-bottom: 15px; }
                .lab-title { font-size: 1.5rem; color: white; font-weight: 900; margin: 0; display:flex; align-items:center; gap:10px;}
                .lab-desc { font-size: 0.9rem; color: #ccc; line-height: 1.5; background: rgba(0,0,0,0.4); padding: 15px; border-radius: 8px; border-left: 3px solid var(--accent-orange); margin-bottom: 20px;}
                .lab-results-grid { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
                .lab-eval-item { background: rgba(0,0,0,0.5); border: 1px solid #333; border-radius: 12px; overflow: hidden; }
                .lab-eval-header { padding: 15px; background: rgba(255,255,255,0.02); display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #333;}
                .lab-eval-prompt { font-family: var(--font-mono); color: var(--accent-blue); font-size: 0.9rem; }
                .lab-eval-body { padding: 15px; color: #ccc; font-family: 'Georgia', serif; font-size: 0.95rem; line-height: 1.6; }
                .lab-eval-footer { padding: 10px 15px; background: rgba(0,0,0,0.8); border-top: 1px solid #333; display: flex; gap: 15px; font-size: 0.8rem; font-family: var(--font-mono); }
                .metric { color: #888; }
                .metric span { color: white; font-weight: bold; }

                /* SEMANTIC EDITOR */
                .editor-wrapper { position: relative; width: 100%; background: rgba(10,10,15,0.8); border: 1px solid #444; border-radius: 16px; padding: 20px; box-sizing: border-box; transition: 0.3s;}
                .editor-wrapper:focus-within { border-color: var(--accent-purple); box-shadow: 0 0 20px rgba(224,64,251,0.1);}
                .semantic-editor { width: 100%; min-height: 35vh; background: transparent; border: none; color: #e0e0e0; font-family: 'Georgia', serif; font-size: 1.15rem; line-height: 1.6; outline: none;}
                .semantic-editor:empty:before { content: attr(data-placeholder); color: #555; font-style: italic; pointer-events: none;}
                .semantic-editor p { margin: 0 0 1rem 0; }
                
                /* AJAX MENÚ FLOTANTE MEJORADO */
                .semantic-menu { position: fixed; background: rgba(10,10,15,0.98); border: 1px solid rgba(255,255,255,0.15); border-top: 3px solid var(--accent-blue); border-radius: 16px; max-height: 40vh; overflow: hidden; display: none; z-index: 9999; box-shadow: 0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(0,176,255,0.15); backdrop-filter: blur(20px); min-width: 320px; max-width: 90vw; animation: popIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); transform-origin: top left; flex-direction: column;}
                .sm-header { background: rgba(0,0,0,0.5); padding: 10px; border-bottom: 1px solid #333; position: sticky; top: 0; z-index: 10;}
                .sm-title { font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;}
                .sm-filters { display: flex; gap: 5px; overflow-x: auto; padding-bottom: 5px;}
                .sm-filters::-webkit-scrollbar { height: 2px; }
                .sm-filter { background: #111; border: 1px solid #444; color: #aaa; font-family: var(--font-mono); font-size: 0.7rem; padding: 4px 8px; border-radius: 6px; cursor: pointer; white-space: nowrap; transition: 0.2s;}
                .sm-filter:hover { border-color: var(--accent-blue); color: white;}
                .sm-filter.active { background: rgba(0,176,255,0.1); border-color: var(--accent-blue); color: var(--accent-blue);}
                
                .sm-results { overflow-y: auto; flex: 1; padding: 5px 0;}
                .semantic-item { padding: 12px 20px; color: white; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 15px; font-size: 0.95rem; font-family: var(--font-main); border-left: 2px solid transparent;}
                .semantic-item:hover, .semantic-item.selected { background: rgba(255,255,255,0.05); border-left-color: var(--accent-blue);}
                
                .mention-highlight { color: var(--accent-blue); font-weight: bold; background: rgba(0,176,255,0.1); padding: 2px 6px; border-radius: 6px; font-family: var(--font-mono); font-size: 1rem; cursor: pointer; transition: 0.2s; text-decoration: none;}

                /* GTD ACTIONS */
                .action-bar-fixed { position: fixed; bottom: 30px; right: 30px; display: flex; gap: 15px; z-index: 1000;}
                .btn-action-pow { background: linear-gradient(135deg, var(--accent-green), #00b0ff); color: black; border: none; padding: 16px 30px; border-radius: 30px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 10px 30px rgba(0, 230, 118, 0.3);}
                .btn-action-pow:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(0, 230, 118, 0.5); filter: brightness(1.2);}
                
                .btn-action-lab { background: linear-gradient(135deg, var(--accent-orange), #ff3d00); color: white; border: none; padding: 16px 30px; border-radius: 30px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 10px 30px rgba(255, 171, 64, 0.3);}
                .btn-action-lab:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(255, 171, 64, 0.5); filter: brightness(1.2);}

                .btn-action-draft { background: rgba(255,171,64,0.1); border: 1px solid var(--accent-orange); color: var(--accent-orange); padding: 16px 30px; border-radius: 30px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(10px);}
                .btn-action-draft:hover { background: var(--accent-orange); color: black; box-shadow: 0 10px 30px rgba(255, 171, 64, 0.4); transform: translateY(-3px);}

                @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @keyframes breathe { 0% { box-shadow: 0 15px 35px rgba(0,230,118,0.1), inset 0 0 20px rgba(0,230,118,0.05); } 50% { box-shadow: 0 15px 35px rgba(0,230,118,0.3), inset 0 0 40px rgba(0,230,118,0.15); } 100% { box-shadow: 0 15px 35px rgba(0,230,118,0.1), inset 0 0 20px rgba(0,230,118,0.05); } }

                @media (max-width: 768px) {
                    .workspace-paper { padding: 90px 1rem 120px 1rem; }
                    .breadcrumb-bar { flex-direction: column; align-items: stretch; margin-bottom: 10px;}
                    .bc-separator { display: none; }
                    .action-bar-fixed { bottom: 80px; right: 20px; left: 20px; justify-content: space-between; gap:10px; }
                    .btn-action-pow, .btn-action-draft, .btn-action-lab { width: 100%; padding: 14px 10px; font-size: 0.95rem; text-align: center; justify-content:center;}
                    .pow-section { flex-direction: column; }
                    .timer-display { font-size: 4rem; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/paper')}

                <main class="workspace-paper" id="paperWorkspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="paper-container">
                        
                        <div class="breadcrumb-bar">
                            <span style="font-size:1.2rem;">🏰</span>
                            <select id="selProject" class="bc-select">
                                ${state.projects.map(p => `<option value="${p.id}" ${p.id === this.activeProjectId ? 'selected' : ''}>Ecosistema: ${p.nombre}</option>`).join('')}
                            </select>
                            <span class="bc-separator">/</span>
                            <span style="font-size:1.2rem;">🎯</span>
                            <select id="omniSelector" class="bc-select" style="flex:1;">
                                <option value="draft" selected>📝 Borrador Libre (Draft Mode)</option>
                            </select>
                        </div>
                        
                        <div class="live-context-bar" id="liveContextBar" style="display:none;">
                            <span class="live-context-label">⚡ Acciones de Enjambre Disponibles:</span>
                            <div id="dynamicTags" class="action-chip-container"></div>
                        </div>

                        <div class="pomodoro-panel" id="pomoPanel" style="display:none;">
                            <div style="color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">Tiempo de Foco Activo</div>
                            <div class="timer-display" id="timeDisplay">00:00:00</div>
                            <div style="font-family: var(--font-mono); color: #888; font-size: 0.8rem;">El tiempo se inyectará en el Slicing Pie al sellar.</div>
                            
                            <div class="timer-controls">
                                <button class="btn-timer play" id="btnPlay" title="Iniciar Foco">▶</button>
                                <button class="btn-timer pause" id="btnPause" title="Pausar Foco" style="display:none;">⏸</button>
                            </div>
                        </div>

                        <div id="taskContextPanel" class="task-context-panel">
                            <div class="task-context-header">
                                <div>
                                    <h2 id="taskTitle" class="task-context-title">Título de la Tarea</h2>
                                    <div id="taskRole" style="color:var(--accent-blue); font-family:var(--font-mono); font-size:0.85rem; margin-top:5px; font-weight:bold;">@rol_destino</div>
                                </div>
                                <div style="text-align:right;">
                                    <div style="color:#888; font-size:0.75rem; text-transform:uppercase; font-weight:bold;">Estado</div>
                                    <div id="taskStatus" style="color:var(--accent-orange); font-family:var(--font-mono); font-weight:bold;">EN CURSO</div>
                                </div>
                            </div>
                            
                            <div id="taskDesc" class="task-context-desc">Cargando instrucciones...</div>
                            <div id="taskSocsContainer" class="soc-checklist-box"></div>

                            <div class="pow-section">
                                <div class="pow-input-group" style="flex:2;">
                                    <label>🔗 Enlace al Entregable Externo (Opcional)</label>
                                    <input type="text" id="inpPowLink" class="pow-input" placeholder="https://github.com/..., Figma, Drive...">
                                </div>
                                <div class="pow-input-group" style="flex: 1;">
                                    <label>⏱ Tiempo Imputado (Horas)</label>
                                    <input type="number" step="0.01" id="inpPowHours" class="pow-input mono" placeholder="Ej: 0.5" readonly title="Heredado del Pomodoro o la estimación.">
                                </div>
                            </div>
                        </div>

                        <div id="labContextPanel" class="lab-context-panel">
                            <div class="lab-header">
                                <h2 id="labTitle" class="lab-title"><span>🧪</span> Benchmark AgentSkills</h2>
                            </div>
                            <div id="labDesc" class="lab-desc">Cargando instrucciones del agente...</div>
                            <div id="labResults" class="lab-results-grid"></div>
                        </div>

                        <div class="editor-wrapper" id="editorWrapper">
                            <label id="editorLabel" style="display:none; font-size:0.75rem; color:#888; text-transform:uppercase; font-weight:bold; margin-bottom:5px;">Cuerpo del Entregable (Proof of Work)</label>
                            <div id="semanticEditor" class="semantic-editor" contenteditable="true" data-placeholder="El lienzo está en blanco.\n\nEscribe aquí tus notas, o redacta tu Proof of Work.\n\nUsa @ para invocar a la Colla y desplegar acciones (Pings / W.O.).\nUsa # para buscar e inyectar Nodos de Conocimiento del LMS."><p><br></p></div>
                        </div>

                    </div>
                    
                    <div class="action-bar-fixed">
                        <button class="btn-action-draft" id="btnSaveTaskDraft" style="display:none;">💾 Guardar Borrador</button>
                        <button class="btn-action-pow" id="btnSubmitReport" style="display:none;">🚀 Sellar Proof of Work</button>
                        
                        <button class="btn-action-lab" id="btnRunBenchmark" style="display:none;">🎯 Iniciar Benchmark (Evals)</button>
                    </div>
                </main>
                
                <div id="semanticMenu" class="semantic-menu">
                    <div class="sm-header">
                        <div class="sm-title" id="smTitle">Inyectar Conocimiento W3C</div>
                        <div class="sm-filters" id="smFilters" style="display:none;">
                            <button class="sm-filter active" data-f="all">Todos</button>
                            <button class="sm-filter" data-f="skill">Skills</button>
                            <button class="sm-filter" data-f="SOP">SOPs</button>
                            <button class="sm-filter" data-f="prompt_a2a">Prompts</button>
                            <button class="sm-filter" data-f="evergreen">Evergreen</button>
                        </div>
                    </div>
                    <div class="sm-results" id="smResults"></div>
                </div>
                
                ${BottomNav.getHtml('/paper')}
            </div>
        `;
    }

    async executeViewScript() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        
        Sidebar.initListeners();
        PageHeader.execute(); 

        this.dom = {
            workspace: document.getElementById('paperWorkspace'),
            selProject: document.getElementById('selProject'),
            omniSelector: document.getElementById('omniSelector'),
            liveContextBar: document.getElementById('liveContextBar'),
            dynamicTags: document.getElementById('dynamicTags'),
            
            pomoPanel: document.getElementById('pomoPanel'),
            timeDisplay: document.getElementById('timeDisplay'),
            btnPlay: document.getElementById('btnPlay'),
            btnPause: document.getElementById('btnPause'),

            taskPanel: document.getElementById('taskContextPanel'),
            taskTitle: document.getElementById('taskTitle'),
            taskRole: document.getElementById('taskRole'),
            taskStatus: document.getElementById('taskStatus'),
            taskDesc: document.getElementById('taskDesc'),
            taskSocs: document.getElementById('taskSocsContainer'),
            inpPowLink: document.getElementById('inpPowLink'),
            inpPowHours: document.getElementById('inpPowHours'),
            
            // 🔥 DOM DEL LABORATORIO
            labPanel: document.getElementById('labContextPanel'),
            labTitle: document.getElementById('labTitle'),
            labDesc: document.getElementById('labDesc'),
            labResults: document.getElementById('labResults'),
            btnRunBenchmark: document.getElementById('btnRunBenchmark'),

            editorWrapper: document.getElementById('editorWrapper'),
            editorLabel: document.getElementById('editorLabel'),
            editor: document.getElementById('semanticEditor'),
            
            menu: document.getElementById('semanticMenu'),
            smTitle: document.getElementById('smTitle'),
            smFilters: document.getElementById('smFilters'),
            smResults: document.getElementById('smResults'),
            
            btnSubmit: document.getElementById('btnSubmitReport'),
            btnSaveTaskDraft: document.getElementById('btnSaveTaskDraft')
        };

        this.dom.editor.focus();

        this.loadProjectTasks = async (projId) => {
            const p = state.projects.find(x => x.id === projId);
            if (!p) return;
            
            let tasks = [];
            const tasksSource = p.work_orders && p.work_orders.length > 0 ? p.work_orders : (p.transactions || []);
            if (state.session.role === 'ecosystem-owner' || p.ownerId === activeUserId) {
                tasks = tasksSource.filter(tx => tx.status !== 'theoretical'); 
            } else {
                tasks = tasksSource.filter(tx => tx.assigneeId === activeUserId || tx.workerId === activeUserId); 
            }

            // 🔥 Búsqueda de Skills para Laboratorio (AHORA MUESTRA TODAS)
            await KB.init();
            const allNodes = await KB.getAllNodes();
            const labSkills = allNodes.filter(n => n.type === 'skill' && (n.projectId === projId || n.projectId === 'global'));

            let selectHtml = `<option value="draft">📝 Borrador Libre (Draft Mode)</option>`;
            
            if (tasks.length > 0) {
                selectHtml += `<optgroup label="🎯 Tareas Asignadas (GTD)">`;
                tasks.forEach(t => {
                    const parentFlow = (p.vna_flows || []).find(f => f.id === t.flowId) || t;
                    let resolvedName = parentFlow.template || parentFlow.entregable || t.comentario?.substring(0, 30) || 'Work Order';
                    selectHtml += `<option value="${t.id || t.hash}">[WO] ${resolvedName.substring(0,40)}</option>`;
                });
                selectHtml += `</optgroup>`;
            }

            if (labSkills.length > 0) {
                selectHtml += `<optgroup label="🧪 Laboratorio de Agentes (Evals)">`;
                labSkills.forEach(s => {
                    selectHtml += `<option value="lab_${s.id}">[LAB] Skill: ${s.title.substring(0,40)}</option>`;
                });
                selectHtml += `</optgroup>`;
            }

            this.dom.omniSelector.innerHTML = selectHtml;
        };

        await this.loadProjectTasks(this.activeProjectId);

        this.dom.selProject.addEventListener('change', async (e) => {
            this.activeProjectId = e.target.value;
            localStorage.setItem('tt_active_project', this.activeProjectId);
            await this.loadProjectTasks(this.activeProjectId);
            this.activeTx = null;
            this.activeSkillLab = null;
            this.stopPomodoro(); 
            this.setDraftMode();
        });

        const urlParams = new URLSearchParams(window.location.search);
        const hashFromUrl = urlParams.get('hash');
        
        if (hashFromUrl) {
            const p = state.projects.find(x => x.id === this.activeProjectId);
            const task = (p?.work_orders || p?.transactions || []).find(t => (t.id || t.hash) === hashFromUrl);
            if (task) {
                this.activeTx = task;
                this.dom.omniSelector.value = hashFromUrl;
                this.setTaskMode();
            } else { this.setDraftMode(); }
        } else { this.setDraftMode(); }

        this.dom.omniSelector.addEventListener('change', async (e) => {
            const val = e.target.value;
            this.stopPomodoro(); 
            
            if (val === 'draft') {
                this.activeTx = null;
                this.activeSkillLab = null;
                this.setDraftMode();
            } else if (val.startsWith('lab_')) {
                // 🔥 ENRUTADOR: Entramos al Laboratorio
                this.activeTx = null;
                const skillId = val.replace('lab_', '');
                this.activeSkillLab = await KB.getNode(skillId);
                this.setLabMode();
            } else {
                // Modo Kanban (Work Order)
                this.activeSkillLab = null;
                const p = store.getState().projects.find(x => x.id === this.activeProjectId);
                this.activeTx = (p.work_orders || p.transactions || []).find(t => (t.id || t.hash) === val);
                this.setTaskMode();
            }
        });

        this.setupPomodoro();
        this.setupSemanticEditor();
        this.setupLabEngine();

        this.dom.btnSubmit.addEventListener('click', () => this.reportDeliverable());
        this.dom.btnSaveTaskDraft.addEventListener('click', () => this.saveTaskDraft());
    }

    // ==========================================
    // 🧪 MOTOR DE LABORATORIO (BENCHMARKING & META-SKILL)
    // ==========================================
    setupLabEngine() {
        this.dom.btnRunBenchmark.addEventListener('click', async () => {
            if (!this.activeSkillLab) return;
            
            this.dom.btnRunBenchmark.disabled = true;
            this.dom.btnRunBenchmark.innerText = "⏳ Ejecutando Pruebas...";
            this.dom.labResults.innerHTML = `<div style="text-align:center; padding:20px; color:#888;">Levantando entorno de pruebas aislado...</div>`;

            try {
                let testCases = [];
                for (const evalId of (this.activeSkillLab.evals || [])) {
                    const evalNode = await KB.getNode(evalId);
                    if (evalNode) {
                        try {
                            const parsed = JSON.parse(evalNode.content);
                            if (Array.isArray(parsed)) testCases.push(...parsed);
                            else testCases.push(parsed);
                        } catch(e) { console.warn("Eval inválido:", evalId); }
                    }
                }

                if (testCases.length === 0) throw new Error("No hay Test Cases.");

                let htmlResults = '';
                let totalTokens = 0;
                let totalTime = 0;
                let totalPassed = 0;

                for (let i = 0; i < testCases.length; i++) {
                    const test = testCases[i];
                    
                    const response = await Orchestrator.callLLM({ 
                        preferredEngine: 'openai', 
                        systemPrompt: `Eres un agente experto.\nINSTRUCCIONES DE TU SKILL:\n${this.activeSkillLab.content}`, 
                        userPrompt: `TEST PROMPT:\n${test.prompt || test.query}`, 
                        responseFormat: "text", 
                        temperature: 0.2 
                    });

                    const agentOutput = response.content;
                    const latency = response.telemetry.latencyMs;
                    const tokens = response.telemetry.tokens.total_tokens || 0;
                    
                    totalTime += latency;
                    totalTokens += tokens;

                    const socs = test.assertions || test.expected_output ? [{id: 'assert_1', text: test.expected_output || JSON.stringify(test.assertions)}] : [];
                    let passed = false;
                    let auditNote = "Auditado manualmente.";

                    if (socs.length > 0) {
                        const auditRaw = await Orchestrator.notarizeWorkOrder('global', agentOutput, socs);
                        const auditResult = JSON.parse(auditRaw);
                        passed = auditResult['assert_1'];
                        auditNote = passed ? '✅ Aserciones Superadas' : '❌ Aserciones Fallidas';
                        if (passed) totalPassed++;
                    }

                    const borderCol = passed ? 'var(--accent-green)' : 'var(--accent-red)';
                    htmlResults += `
                        <div class="lab-eval-item" style="border-left: 4px solid ${borderCol};">
                            <div class="lab-eval-header">
                                <span style="color:white; font-weight:bold;">Test Case #${i+1}</span>
                                <span style="font-size:0.8rem; color:${borderCol};">${auditNote}</span>
                            </div>
                            <div class="lab-eval-body">
                                <div style="color:var(--accent-blue); margin-bottom:10px; font-family:var(--font-mono); font-size:0.8rem;">> ${test.prompt || test.query}</div>
                                <div>${agentOutput.replace(/\n/g, '<br>')}</div>
                            </div>
                            <div class="lab-eval-footer">
                                <div class="metric">Latencia: <span>${(latency/1000).toFixed(2)}s</span></div>
                                <div class="metric">Tokens: <span>${tokens}</span></div>
                            </div>
                        </div>
                    `;
                }

                const passRate = ((totalPassed / testCases.length) * 100).toFixed(0);
                this.dom.labResults.innerHTML = `
                    <div style="display:flex; justify-content:space-between; background:rgba(255,171,64,0.1); padding:15px; border-radius:8px; border:1px solid var(--accent-orange); margin-bottom:15px;">
                        <div style="text-align:center;"><div style="font-size:1.5rem; font-weight:900; color:var(--accent-orange);">${passRate}%</div><div style="font-size:0.7rem; color:#aaa; text-transform:uppercase;">Pass Rate</div></div>
                        <div style="text-align:center;"><div style="font-size:1.5rem; font-weight:900; color:white;">${testCases.length}</div><div style="font-size:0.7rem; color:#aaa; text-transform:uppercase;">Tests</div></div>
                        <div style="text-align:center;"><div style="font-size:1.5rem; font-weight:900; color:white;">${totalTokens}</div><div style="font-size:0.7rem; color:#aaa; text-transform:uppercase;">Tokens Totales</div></div>
                        <div style="text-align:center;"><div style="font-size:1.5rem; font-weight:900; color:white;">${(totalTime/1000).toFixed(1)}s</div><div style="font-size:0.7rem; color:#aaa; text-transform:uppercase;">Latencia Total</div></div>
                    </div>
                    ${htmlResults}
                `;

            } catch (error) {
                this.dom.labResults.innerHTML = `<div style="color:var(--accent-red); padding:20px; text-align:center; border:1px solid var(--accent-red); border-radius:12px; background:rgba(255,82,82,0.1);">Error de Benchmarking: ${error.message}</div>`;
            } finally {
                this.dom.btnRunBenchmark.disabled = false;
                this.dom.btnRunBenchmark.innerText = "🎯 Iniciar Benchmark (Evals)";
            }
        });
    }

    // 🔥 EL INVOCADOR DE EVALS IN-SITU
    async autoForgeEvals() {
        const btn = document.getElementById('btnAutoForgeEvals');
        if(btn) { btn.disabled = true; btn.innerText = "⏳ Invocando Skill Creator..."; }
        
        try {
            const systemPrompt = `
                Eres el "Skill Creator". El usuario necesita generar casos de prueba cuantitativos (Evals) para una Skill específica.
                Analiza las instrucciones de la Skill y genera 3 casos de prueba realistas (prompts que un usuario final haría).
                Devuelve ÚNICAMENTE un objeto JSON estricto con esta estructura exacta:
                {
                    "evals": [
                        { "prompt": "Petición del usuario simulada...", "expected_output": "Aserción u objetivo claro que debe cumplirse (Ej: El texto contiene 3 viñetas)" }
                    ]
                }
            `;
            
            const response = await Orchestrator.callLLM({
                preferredEngine: 'openai',
                systemPrompt,
                userPrompt: `Forja los Evals para esta Skill:\nTÍTULO: ${this.activeSkillLab.title}\nCONTENIDO:\n${this.activeSkillLab.content}`,
                responseFormat: "json_object",
                temperature: 0.3
            });
            
            let evalsArray = response.content.evals;
            if (!evalsArray || !Array.isArray(evalsArray)) {
                throw new Error("El Orquestador no devolvió el array de Evals correctamente.");
            }

            await KB.init();
            const evalNode = await KB.saveNode({
                id: `eval_ai_${Date.now()}`,
                type: 'eval', category: 'eval', projectId: 'global', targetId: 'global',
                title: `Evals (SOCs) auto-generados para ${this.activeSkillLab.title}`,
                content: JSON.stringify(evalsArray, null, 2),
                keywords: ['#ai_generated', '#eval']
            });

            if (!this.activeSkillLab.evals) this.activeSkillLab.evals = [];
            this.activeSkillLab.evals.push(evalNode.id);
            await KB.saveNode(this.activeSkillLab); 
            
            alert("✅ Evals generados e inyectados en la Skill.");
            this.setLabMode(); // Recargar la vista del lab
            
        } catch(e) {
            alert("Fallo al forjar Evals: " + e.message);
            if(btn) { btn.disabled = false; btn.innerText = "🌱 Auto-Forjar Evals (IA)"; }
        }
    }

    setLabMode() {
        this.dom.taskPanel.style.display = 'none';
        this.dom.pomoPanel.style.display = 'none';
        this.dom.btnSubmit.style.display = 'none';
        this.dom.btnSaveTaskDraft.style.display = 'none';
        this.dom.editorWrapper.style.display = 'none'; 
        
        this.dom.labPanel.style.display = 'block';
        this.dom.labTitle.innerHTML = `<span>🧪</span> Agent Studio: ${this.activeSkillLab.title}`;
        this.dom.labDesc.innerText = this.activeSkillLab.description || 'Sin descripción en el SKILL.md.';

        // 🔥 LOGICA DINÁMICA: Si no hay Evals, muestra el botón de Forja In-Situ
        this.dom.labResults.innerHTML = '';
        if (!this.activeSkillLab.evals || this.activeSkillLab.evals.length === 0) {
            this.dom.labResults.innerHTML = `
                <div style="text-align:center; padding:2rem; background:rgba(255,171,64,0.05); border:1px dashed var(--accent-orange); border-radius:12px;">
                    <div style="font-size:3rem; margin-bottom:1rem;">⚠️</div>
                    <h3 style="color:var(--accent-orange); margin-top:0;">Faltan Test Cases (Evals)</h3>
                    <p style="color:#aaa; font-size:0.9rem; margin-bottom:1.5rem;">Esta Skill no tiene SOCs cuantitativos asignados. El Notario no puede auditarla.</p>
                    <button class="btn-action-draft" id="btnAutoForgeEvals" style="font-size:0.9rem; padding:10px 20px;">🌱 Auto-Forjar Evals (IA)</button>
                </div>
            `;
            document.getElementById('btnAutoForgeEvals').onclick = () => this.autoForgeEvals();
            this.dom.btnRunBenchmark.style.display = 'none';
        } else {
            this.dom.btnRunBenchmark.style.display = 'block';
            this.dom.labResults.innerHTML = '<div style="text-align:center; padding:2rem; color:#888;">Pulsa "Iniciar Benchmark" para lanzar la batería de pruebas y que @notari_ledger audite los resultados.</div>';
        }
    }

    setDraftMode() {
        this.dom.taskPanel.style.display = 'none';
        this.dom.pomoPanel.style.display = 'none';
        this.dom.btnSubmit.style.display = 'none';
        this.dom.btnSaveTaskDraft.style.display = 'none';
        this.dom.labPanel.style.display = 'none';
        this.dom.btnRunBenchmark.style.display = 'none';
        this.dom.editorWrapper.style.display = 'block';
        
        this.dom.editor.setAttribute('data-placeholder', "Borrador Libre.\nEscribe @ para invocar al equipo y asignar tareas.\nEscribe # para inyectar Nodos W3C.");
        this.dom.editorLabel.style.display = 'none';
        this.dom.editor.innerHTML = '<p><br></p>';
    }

    setTaskMode() {
        if (!this.activeTx) return;
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const isLegacy = !this.activeTx.flowId;
        const parentFlow = isLegacy ? this.activeTx : (p.vna_flows || []).find(f => f.id === this.activeTx.flowId);
        
        this.dom.labPanel.style.display = 'none';
        this.dom.btnRunBenchmark.style.display = 'none';
        this.dom.editorWrapper.style.display = 'block';

        this.dom.taskPanel.style.display = 'block';
        this.dom.pomoPanel.style.display = 'block';
        
        this.dom.taskTitle.innerText = parentFlow ? (parentFlow.template || parentFlow.entregable || this.activeTx.comentario) : 'Work Order';
        
        const roleTo = p.roles.find(r => r.id === (parentFlow ? parentFlow.to : this.activeTx.to));
        this.dom.taskRole.innerText = roleTo ? `${roleTo.levelId} - ${roleTo.name}` : '@ecosistema';
        this.dom.taskStatus.innerText = this.activeTx.status === 'pinged' ? 'EN CURSO' : this.activeTx.status.toUpperCase();
        this.dom.taskDesc.innerHTML = (this.activeTx.comentario || parentFlow?.comentario || 'Inicia el Pomodoro, completa la tarea y sella la evidencia.').replace(/\n/g, '<br>');

        const socs = this.activeTx.soc_checklist && this.activeTx.soc_checklist.length > 0 ? this.activeTx.soc_checklist : (parentFlow?.soc_checklist || []);
        if (socs.length > 0) {
            this.dom.taskSocs.innerHTML = '<label>Criterios de Calidad (Para tu verificación local):</label>' + socs.map(soc => `
                <div class="soc-item-check">
                    <input type="checkbox" id="${soc.id}" ${soc.isChecked ? 'checked' : ''}>
                    <span>${soc.text}</span>
                </div>
            `).join('');
        } else {
            this.dom.taskSocs.innerHTML = '<div style="color:#666; font-style:italic; font-size:0.85rem;">No hay SOCs asociados.</div>';
        }

        this.dom.inpPowLink.value = this.activeTx.draftLink || this.activeTx.proofLink || '';
        
        const savedHours = this.activeTx.draftHours || this.activeTx.realHours || 0;
        if (savedHours > 0) {
            this.pomodoroSeconds = Math.floor(savedHours * 3600);
            const hrs = Math.floor(this.pomodoroSeconds / 3600);
            const mins = Math.floor((this.pomodoroSeconds % 3600) / 60);
            const secs = this.pomodoroSeconds % 60;
            this.dom.timeDisplay.innerText = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            this.dom.inpPowHours.value = savedHours.toFixed(3);
        } else {
            this.pomodoroSeconds = 0;
            this.dom.timeDisplay.innerText = "00:00:00";
            this.dom.inpPowHours.value = (parentFlow?.estimatedHours || parentFlow?.horas || 1); 
        }

        this.dom.editor.innerHTML = this.activeTx.draftContent || '<p><br></p>';
        this.dom.editorLabel.style.display = 'block';
        this.dom.editor.setAttribute('data-placeholder', "Documenta tu Proof of Work aquí...");
        
        if (this.activeTx.status === 'pinged') {
            this.dom.btnSubmit.style.display = 'block';
            this.dom.btnSaveTaskDraft.style.display = 'block';
        } else {
            this.dom.btnSubmit.style.display = 'none';
            this.dom.btnSaveTaskDraft.style.display = 'none';
            this.dom.inpPowLink.disabled = true;
            this.dom.btnPlay.style.display = 'none';
            this.dom.taskSocs.querySelectorAll('input').forEach(i => i.disabled = true);
            this.dom.editor.contentEditable = "false";
        }
    }

    setupPomodoro() {
        const updateInputs = () => {
            const hrs = Math.floor(this.pomodoroSeconds / 3600);
            const mins = Math.floor((this.pomodoroSeconds % 3600) / 60);
            const secs = this.pomodoroSeconds % 60;
            this.dom.timeDisplay.innerText = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            if (this.pomodoroSeconds > 0) this.dom.inpPowHours.value = (this.pomodoroSeconds / 3600).toFixed(3); 
        };

        this.tickPomodoro = () => { this.pomodoroSeconds++; updateInputs(); };

        this.dom.btnPlay.addEventListener('click', () => {
            if (this.isPomodoroRunning) return;
            this.isPomodoroRunning = true;
            this.dom.btnPlay.style.display = 'none';
            this.dom.btnPause.style.display = 'flex';
            this.dom.pomoPanel.classList.add('running');
            this.pomodoroInterval = setInterval(this.tickPomodoro, 1000);
        });

        this.dom.btnPause.addEventListener('click', () => this.stopPomodoro());
    }

    stopPomodoro() {
        if (!this.isPomodoroRunning) return;
        this.isPomodoroRunning = false;
        this.dom.btnPlay.style.display = 'flex';
        this.dom.btnPause.style.display = 'none';
        this.dom.pomoPanel.classList.remove('running');
        clearInterval(this.pomodoroInterval);
    }

    setupSemanticEditor() {
        const input = this.dom.editor;
        const menu = this.dom.menu;
        const state = store.getState();
        
        let lastKnownRect = null; 
        let savedRange = null; 

        const updateDetectedContext = () => {
            const text = input.innerText;
            const mentions = [...new Set(text.match(/@\w+/g) || [])];
            
            if (mentions.length === 0) {
                this.dom.liveContextBar.style.display = 'none';
                this.dom.dynamicTags.innerHTML = '';
            } else {
                this.dom.liveContextBar.style.display = 'flex';
                let html = '';
                mentions.forEach(m => {
                    const cleanM = m.substring(1);
                    const user = state.globalUsers.find(u => u.id === m || u.name === cleanM);
                    if (user) {
                        html += `
                            <div class="action-chip">
                                <span class="cb-mention">${m}</span>
                                <button class="btn-micro-action ping" data-action="ping" data-target="${m}">🔔 Ping</button>
                                <button class="btn-micro-action assign" data-action="assign" data-target="${m}">🎯 Asignar (WO)</button>
                            </div>
                        `;
                    }
                });
                this.dom.dynamicTags.innerHTML = html;
            }
        };

        this.dom.dynamicTags.addEventListener('click', async (e) => {
            const btn = e.target.closest('.btn-micro-action');
            if (!btn) return;
            const action = btn.dataset.action;
            const targetId = btn.dataset.target;
            const textContent = input.innerText.trim();

            if (action === 'assign') {
                if (!textContent) return alert("Escribe el contenido de la tarea antes de asignarla.");
                if (!this.activeProjectId) return alert("Selecciona un Ecosistema arriba.");
                
                const p = store.getState().projects.find(x => x.id === this.activeProjectId);
                const newHash = 'wo_draft_' + Math.random().toString(36).substr(2, 9);
                
                await store.dispatch({
                    type: 'SPAWN_WORK_ORDER',
                    payload: {
                        projectId: this.activeProjectId,
                        workOrder: {
                            hash: newHash, flowId: null, status: 'pinged', realHours: 0, sprintId: p.activeSprintId,
                            comentario: textContent, soc_checklist: [], assigneeId: targetId
                        }
                    }
                });
                alert(`🚀 Tarea inyectada en el Kanban para ${targetId}.`);
                input.innerHTML = '<p><br></p>';
                updateDetectedContext();
            } else if (action === 'ping') {
                alert(`🔔 Ping simulado hacia ${targetId}. El Orquestador será notificado.`);
            }
        });

        input.addEventListener('input', updateDetectedContext);
        menu.addEventListener('mousedown', (e) => e.preventDefault());

        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !menu.contains(e.target)) {
                menu.style.display = 'none';
                this.isMenuOpen = false;
            }
        });

        const renderMenuResults = (type, items) => {
            if (items.length === 0) {
                this.dom.smResults.innerHTML = '<div style="padding:15px; color:#888; text-align:center;">No se encontró información.</div>';
                return;
            }
            if (type === 'users') {
                this.dom.smResults.innerHTML = items.map(u => `
                    <div class="semantic-item type-mention" data-val="${u.id}" data-type="mention">
                        <span style="font-size:1.5rem;">${u.profile?.isAi ? '🤖' : '👤'}</span> 
                        <div>
                            <div style="font-weight:900;">${u.name}</div>
                            <div style="font-size:0.75rem; color:#888;">${u.profile?.isAi ? 'Agente A2A' : 'Humano'}</div>
                        </div>
                    </div>
                `).join('');
            } else if (type === 'memes') {
                this.dom.smResults.innerHTML = items.map(m => {
                    const jsonPayload = encodeURIComponent(JSON.stringify(m)); 
                    return `
                    <div class="semantic-item type-meme" data-val="${m.id}" data-type="jsonld" data-payload="${jsonPayload}">
                        <span style="font-size:1.2rem; color:var(--accent-purple);">🧠</span> 
                        <div>
                            <div style="font-weight:900; font-size:0.85rem;">${m.title}</div>
                            <div style="font-size:0.7rem; color:#888; font-family:monospace;">[${m.category}]</div>
                        </div>
                    </div>
                `}).join('');
            }
        };

        this.dom.smFilters.addEventListener('click', (e) => {
            if (e.target.classList.contains('sm-filter')) {
                this.dom.smFilters.querySelectorAll('.sm-filter').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.activeMemeFilter = e.target.dataset.f;
                
                const filtered = this.activeMemeFilter === 'all' 
                    ? this.currentMemesSearchResult 
                    : this.currentMemesSearchResult.filter(m => m.category === this.activeMemeFilter || m.type === this.activeMemeFilter);
                
                renderMenuResults('memes', filtered);
            }
        });

        input.addEventListener('keyup', async (e) => {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            
            savedRange = selection.getRangeAt(0).cloneRange(); 
            const textBeforeCursor = savedRange.startContainer.textContent.substring(0, savedRange.startOffset);
            const words = textBeforeCursor.split(/\s/);
            this.currentWord = words[words.length - 1];

            const rect = savedRange.getBoundingClientRect();
            if (rect.top !== 0 && rect.left !== 0) lastKnownRect = rect;
            
            if (this.currentWord.startsWith('@')) {
                const search = this.currentWord.substring(1).toLowerCase();
                const users = state.globalUsers.filter(u => u.name.toLowerCase().includes(search) || u.id.toLowerCase().includes(search));
                
                if (users.length > 0) {
                    this.dom.smTitle.innerText = "Invocar Nodo / Agente";
                    this.dom.smFilters.style.display = 'none';
                    renderMenuResults('users', users);
                    this.showFloatingMenu(menu, lastKnownRect);
                } else { menu.style.display = 'none'; }
            } 
            else if (this.currentWord.startsWith('#')) {
                const search = this.currentWord.substring(1).toLowerCase();
                await KB.init();
                const allMemes = await KB.getAllNodes();
                let memes = allMemes.filter(m => m.projectId === 'global' || m.projectId === this.activeProjectId);
                if (search.length > 0) memes = memes.filter(m => m.title?.toLowerCase().includes(search) || m.id.toLowerCase().includes(search) || (m.keywords && m.keywords.some(k => k.toLowerCase().includes(search))));
                
                if (memes.length > 0) {
                    this.currentMemesSearchResult = memes; 
                    this.activeMemeFilter = 'all'; 
                    this.dom.smFilters.querySelectorAll('.sm-filter').forEach(b => b.classList.remove('active'));
                    this.dom.smFilters.querySelector('[data-f="all"]').classList.add('active');

                    this.dom.smTitle.innerText = "Inyectar Conocimiento W3C";
                    this.dom.smFilters.style.display = 'flex';
                    renderMenuResults('memes', memes.slice(0, 10)); 
                    this.showFloatingMenu(menu, lastKnownRect);
                } else { menu.style.display = 'none'; }
            } else {
                menu.style.display = 'none';
                this.isMenuOpen = false;
            }
        });

        this.dom.smResults.addEventListener('click', (e) => {
            const item = e.target.closest('.semantic-item');
            if (item && savedRange) {
                const replaceVal = item.getAttribute('data-val');
                const type = item.getAttribute('data-type');
                
                savedRange.setStart(savedRange.startContainer, savedRange.endOffset - this.currentWord.length);
                savedRange.deleteContents();
                
                let el;
                if (type === 'jsonld') {
                    const rawJson = decodeURIComponent(item.getAttribute('data-payload'));
                    const memeObj = JSON.parse(rawJson);
                    
                    el = document.createElement('semantic-knowledge-card');
                    el.setAttribute('data-id', memeObj.id);
                    el.setAttribute('data-title', memeObj.title);
                    el.setAttribute('data-category', memeObj.category);
                    el.setAttribute('data-content', memeObj.content);
                    el.setAttribute('data-jsonld', rawJson);
                    el.contentEditable = "false";
                    
                    savedRange.insertNode(el);
                    const br = document.createElement('br');
                    el.parentNode.insertBefore(br, el.nextSibling);
                    savedRange.setStartAfter(br);
                } 
                else if (type === 'mention') {
                    el = document.createElement('a');
                    el.className = 'mention-highlight';
                    el.href = `/v9/profile?id=${replaceVal}`;
                    el.setAttribute('data-link', '');
                    el.contentEditable = "false";
                    el.innerText = replaceVal;
                    
                    savedRange.insertNode(el);
                    const space = document.createTextNode('\u00A0'); 
                    el.parentNode.insertBefore(space, el.nextSibling);
                    savedRange.setStartAfter(space);
                }

                savedRange.collapse(true);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(savedRange);
                
                menu.style.display = 'none';
                this.isMenuOpen = false;
                updateDetectedContext();
            }
        });
    }

    showFloatingMenu(menu, rect) {
        if (!rect) {
            menu.style.top = '50%'; menu.style.left = '50%';
        } else {
            const screenWidth = window.innerWidth;
            const menuWidth = 320;
            let leftPos = rect.left;
            
            if (leftPos + menuWidth > screenWidth) {
                leftPos = screenWidth - menuWidth - 20;
            }
            
            menu.style.top = `${rect.bottom + 10}px`;
            menu.style.left = `${Math.max(10, leftPos)}px`;
        }
        menu.style.display = 'flex';
        this.isMenuOpen = true;
    }

    async saveTaskDraft() {
        if (!this.activeTx) return;
        this.dom.btnSaveTaskDraft.disabled = true;
        this.dom.btnSaveTaskDraft.innerText = "⏳ Guardando...";

        const link = this.dom.inpPowLink.value.trim();
        const hours = parseFloat(this.dom.inpPowHours.value) || 0;
        const htmlContent = this.dom.editor.innerHTML.trim();
        
        const socs = [];
        this.dom.taskSocs.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            socs.push({ id: cb.id, text: cb.nextElementSibling.innerText, isChecked: cb.checked });
        });

        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const isLegacy = !this.activeTx.flowId;
        const listType = isLegacy ? 'transactions' : 'work_orders';
        const hashTarget = this.activeTx.hash || this.activeTx.id;

        const updatedList = p[listType].map(w => {
            if ((w.hash || w.id) === hashTarget) {
                return { ...w, draftLink: link, draftHours: hours, draftContent: htmlContent, soc_checklist: socs.length > 0 ? socs : w.soc_checklist };
            }
            return w;
        });

        await store.dispatch({
            type: 'UPDATE_PROJECT_INFO',
            payload: { projectId: this.activeProjectId, updates: { [listType]: updatedList } }
        });

        setTimeout(() => {
            this.dom.btnSaveTaskDraft.disabled = false;
            this.dom.btnSaveTaskDraft.innerText = "💾 Guardar Borrador";
        }, 500);
    }

    async reportDeliverable() {
        if (!this.activeTx) return;
        this.stopPomodoro();

        const link = this.dom.inpPowLink.value.trim();
        let hoursToReport = this.pomodoroSeconds > 0 ? (this.pomodoroSeconds / 3600) : parseFloat(this.dom.inpPowHours.value);
        if (isNaN(hoursToReport) || hoursToReport <= 0) hoursToReport = 1; 
        hoursToReport = parseFloat(hoursToReport.toFixed(3)); 

        const htmlContent = this.dom.editor.innerHTML.trim();
        
        if (!link && htmlContent === '<p><br></p>') {
            return alert("⚠️ Debes incluir un Enlace al Entregable o escribir tu PoW en el lienzo antes de reportar.");
        }

        if (confirm(`¿Sellar Work Order con ${hoursToReport} horas inyectadas en el Ledger? La tarea pasará a la Notaría para su auditoría TDD.`)) {
            this.dom.btnSubmit.disabled = true;
            this.dom.btnSubmit.innerText = '🚀 Enviando a Usenet...';
            
            const isLegacy = !this.activeTx.flowId;
            const payloadKey = isLegacy ? 'txHash' : 'woHash';
            const targetHash = this.activeTx.hash || this.activeTx.id;

            await store.dispatch({
                type: 'REPORT_WORK_ORDER',
                payload: {
                    projectId: this.activeProjectId,
                    [payloadKey]: targetHash,
                    realHours: hoursToReport,
                    comentario: htmlContent === '<p><br></p>' ? 'Entregable adjunto en enlace.' : htmlContent,
                    proofLink: link
                }
            });

            const contentLog = `Proof of Work subido. Horas Inyectadas: ${hoursToReport}h.\n${link ? `<a href="${link}" target="_blank" class="log-pow-link">🔗 Ver Entregable</a><br><br>` : ''}${htmlContent}`;
            
            await store.dispatch({
                type: 'ADD_LOG_ENTRY',
                payload: {
                    projectId: this.activeProjectId,
                    log: {
                        id: 'log_' + Date.now(),
                        date: Date.now(),
                        authorId: store.getState().session.activeUserId,
                        relatedTxHash: targetHash,
                        content: contentLog, 
                        mentions: ['@notari_ledger', '@cap_de_colla'], 
                        readBy: []
                    }
                }
            });

            alert("✅ Proof of Work reportado exitosamente. La tarea ha pasado a Auditoría.");
            window.location.href = '/v9/project'; 
        }
    }
}
