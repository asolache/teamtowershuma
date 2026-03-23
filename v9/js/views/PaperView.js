// v9/js/views/PaperView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js'; 
import { PageHeader } from '../components/PageHeader.js';

// 🔥 Ya no necesitamos cargar todo el peso de los Renderers. El PaperView es solo para texto, menciones semánticas y Pomodoro.
// Si alguien necesita ver el mapa, navega a /map. Zero Redundancy.

export default class PaperView {
    constructor() {
        document.title = "Omni-Paper | TeamTowers V9";
        this.woHash = new URLSearchParams(window.location.search).get('hash');
        this.activeTx = null; 
        this.activeProjectId = null;
        this.isMenuOpen = false;
        this.currentWord = "";
        
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
            tagline: "Lienzo de Ejecución GTD. Cronometra, documenta semánticamente y sella tu Proof of Work.",
            tabs: []
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width:100%;}
                .workspace-paper { flex: 1; display: flex; flex-direction: column; position: relative; background: radial-gradient(circle at center, #111116 0%, #050505 100%); overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; padding: 2rem 3rem; box-sizing: border-box; width: 100%; align-items: center;}
                
                .paper-container { width: 100%; max-width: 850px; display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; padding-bottom: 8rem;}
                
                .breadcrumb-bar { display: flex; align-items: center; background: rgba(10,10,15,0.8); padding: 10px 15px; border-radius: 12px 12px 0 0; border: 1px solid var(--glass-border); border-bottom: none; gap: 10px; flex-wrap: wrap;}
                .bc-select { background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; font-size: 0.9rem; font-weight: bold; font-family: var(--font-main); outline: none; cursor: pointer; padding: 8px 12px; border-radius: 8px; transition: 0.3s;}
                .bc-select:focus { border-color: var(--accent-blue); }
                .bc-separator { color: #555; font-weight: bold; }
                
                .live-context-bar { background: rgba(0,0,0,0.6); border: 1px solid var(--glass-border); padding: 12px 15px; border-radius: 0 0 12px 12px; display: flex; gap: 10px; align-items: center; min-height: 24px; transition: 0.3s; flex-wrap: wrap;}
                .live-context-label { font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; margin-right: 10px;}
                .context-badge { padding: 4px 10px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.8rem; font-weight: bold; animation: popIn 0.3s ease-out;}
                .cb-mention { background: rgba(0,176,255,0.1); color: var(--accent-blue); border: 1px solid rgba(0,176,255,0.3); }
                .cb-meme { background: rgba(224,64,251,0.1); color: var(--accent-purple); border: 1px solid rgba(224,64,251,0.3); }

                /* POMODORO TRACKER */
                .pomodoro-panel { background: linear-gradient(145deg, rgba(20,20,25,0.9), rgba(10,10,15,0.95)); border: 1px solid var(--accent-orange); border-radius: 24px; padding: 2.5rem; text-align: center; box-shadow: 0 15px 35px rgba(255,171,64,0.15), inset 0 0 20px rgba(255,171,64,0.05); transition: 0.3s;}
                .pomodoro-panel.running { border-color: var(--accent-green); box-shadow: 0 15px 35px rgba(0,230,118,0.2), inset 0 0 30px rgba(0,230,118,0.1); animation: breathe 4s infinite;}
                
                .timer-display { font-size: 5.5rem; font-weight: 900; font-family: var(--font-mono); color: white; margin: 1rem 0; text-shadow: 0 5px 15px rgba(0,0,0,0.8); font-variant-numeric: tabular-nums;}
                .pomodoro-panel.running .timer-display { color: var(--accent-green); }
                
                .timer-controls { display: flex; justify-content: center; gap: 15px; margin-top: 1.5rem;}
                .btn-timer { background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; width: 60px; height: 60px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center;}
                .btn-timer:hover { background: rgba(255,255,255,0.1); transform: scale(1.1); }
                .btn-timer.play { border-color: var(--accent-green); color: var(--accent-green); }
                .btn-timer.play:hover { background: var(--accent-green); color: black; box-shadow: 0 0 15px rgba(0,230,118,0.5); }
                .btn-timer.pause { border-color: var(--accent-orange); color: var(--accent-orange); }
                .btn-timer.pause:hover { background: var(--accent-orange); color: black; box-shadow: 0 0 15px rgba(255,171,64,0.5); }

                /* TASK CONTEXT PANEL */
                .task-context-panel { display:none; background: rgba(15,15,20,0.9); border: 1px solid var(--glass-border); border-left: 4px solid var(--accent-green); padding: 20px; border-radius: 12px; margin-top: 1rem; box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: fadeIn 0.3s ease-out;}
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
                .soc-item-check:hover { background: rgba(255,255,255,0.05); }
                .soc-item-check input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-green); margin-top: 2px; }
                .soc-item-check span { color: #ddd; font-size: 0.9rem; line-height: 1.4; }

                /* SEMANTIC EDITOR (JSON-LD COMPATIBLE) */
                .editor-wrapper { position: relative; width: 100%; margin-top: 1rem; background: rgba(10,10,15,0.8); border: 1px solid #333; border-radius: 16px; padding: 20px; box-sizing: border-box;}
                .semantic-editor { width: 100%; min-height: 25vh; background: transparent; border: none; color: #e0e0e0; font-family: 'Georgia', serif; font-size: 1.15rem; line-height: 1.6; outline: none;}
                .semantic-editor:empty:before { content: attr(data-placeholder); color: #555; font-style: italic; pointer-events: none;}
                .semantic-editor p { margin: 0 0 1rem 0; }
                
                .semantic-menu { position: fixed; background: rgba(10,10,15,0.98); border: 1px solid rgba(255,255,255,0.1); border-top: 3px solid var(--accent-blue); border-radius: 16px; max-height: 350px; overflow-y: auto; display: none; z-index: 9999; box-shadow: 0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(0,176,255,0.15); backdrop-filter: blur(20px); padding: 8px 0; min-width: 320px; animation: popIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); transform-origin: top left;}
                .semantic-item { padding: 12px 20px; color: white; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 15px; font-size: 0.95rem; font-family: var(--font-main); border-left: 2px solid transparent;}
                .semantic-item:hover, .semantic-item.selected { background: rgba(255,255,255,0.05); border-left-color: var(--accent-blue);}
                
                .mention-highlight { color: var(--accent-blue); font-weight: bold; background: rgba(0,176,255,0.1); padding: 2px 6px; border-radius: 6px; font-family: var(--font-mono); font-size: 1rem; cursor: pointer; transition: 0.2s; text-decoration: none;}
                .meme-highlight { color: var(--accent-purple); font-weight: bold; background: rgba(224,64,251,0.1); padding: 2px 6px; border-radius: 6px; font-family: var(--font-mono); font-size: 1rem; cursor: pointer; transition: 0.2s; text-decoration: none;}

                /* BLOCKCHAIN THREAD */
                .thread-container { margin-top: 2rem; border-top: 1px solid var(--glass-border); padding-top: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
                .thread-title { color: #888; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: flex; justify-content: space-between;}
                .log-bubble { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 16px; position: relative; transition:0.3s;}
                .log-bubble.ai-reply { border-left: 4px solid var(--accent-purple); background: rgba(224,64,251,0.05); }
                .log-bubble.human-reply { border-left: 4px solid var(--accent-blue); }
                .log-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;}
                .log-author { font-weight: 900; color: white; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;}
                .log-time { font-size: 0.75rem; color: #666; font-family: var(--font-mono);}
                .log-content { color: #ccc; line-height: 1.6; font-family: 'Georgia', serif; font-size: 1.05rem; white-space: pre-wrap; word-break: break-word;}
                .log-pow-link { display: inline-block; margin-top: 10px; background: rgba(0, 230, 118, 0.1); color: var(--accent-green); border: 1px solid var(--accent-green); padding: 5px 12px; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-family: var(--font-mono); font-weight: bold; transition: 0.2s;}
                .log-pow-link:hover { background: var(--accent-green); color: black;}

                /* GTD ACTIONS */
                .action-bar-fixed { position: fixed; bottom: 30px; right: 30px; display: flex; gap: 15px; z-index: 1000;}
                .btn-action-pow { background: linear-gradient(135deg, var(--accent-green), #00b0ff); color: black; border: none; padding: 16px 30px; border-radius: 30px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 10px 30px rgba(0, 230, 118, 0.3);}
                .btn-action-pow:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(0, 230, 118, 0.5); filter: brightness(1.2);}
                
                .btn-action-draft { background: rgba(255,171,64,0.1); border: 1px solid var(--accent-orange); color: var(--accent-orange); padding: 16px 30px; border-radius: 30px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(10px);}
                .btn-action-draft:hover { background: var(--accent-orange); color: black; box-shadow: 0 10px 30px rgba(255, 171, 64, 0.4); transform: translateY(-3px);}

                @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes breathe { 0% { box-shadow: 0 15px 35px rgba(0,230,118,0.1), inset 0 0 20px rgba(0,230,118,0.05); } 50% { box-shadow: 0 15px 35px rgba(0,230,118,0.3), inset 0 0 40px rgba(0,230,118,0.15); } 100% { box-shadow: 0 15px 35px rgba(0,230,118,0.1), inset 0 0 20px rgba(0,230,118,0.05); } }

                @media (max-width: 768px) {
                    .workspace-paper { padding: 90px 1rem 120px 1rem; }
                    .breadcrumb-bar { flex-direction: column; align-items: stretch; border-radius: 12px; border-bottom: 1px solid var(--glass-border); margin-bottom: 10px;}
                    .live-context-bar { border-radius: 12px; }
                    .bc-separator { display: none; }
                    .action-bar-fixed { bottom: 80px; right: 20px; left: 20px; justify-content: space-between; gap:10px; }
                    .btn-action-pow, .btn-action-draft { width: 100%; padding: 14px 10px; font-size: 0.95rem; text-align: center; justify-content:center;}
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
                        
                        <div class="live-context-bar" id="liveContextBar">
                            <span class="live-context-label">📌 Contexto Detectado:</span>
                            <div id="dynamicTags" style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
                                <span style="color:#555; font-style:italic; font-size:0.85rem;">Escribe @ o # para enlazar el conocimiento W3C...</span>
                            </div>
                        </div>

                        <div class="pomodoro-panel" id="pomoPanel" style="display:none;">
                            <div style="color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">Tiempo de Foco Activo</div>
                            <div class="timer-display" id="timeDisplay">00:00:00</div>
                            <div style="font-family: var(--font-mono); color: #888; font-size: 0.8rem;">La inyección automática en Slicing Pie está preparada.</div>
                            
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
                                    <div style="display:flex; align-items:center; gap:5px;">
                                        <input type="number" step="0.01" id="inpPowHours" class="pow-input mono" placeholder="Ej: 0.5" style="width:100px;" readonly title="El tiempo se inyecta desde el Pomodoro Tracker o se hereda de la estimación.">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="editor-wrapper">
                            <label id="editorLabel" style="display:none; font-size:0.75rem; color:#888; text-transform:uppercase; font-weight:bold; margin-bottom:5px;">Cuerpo del Entregable (Proof of Work)</label>
                            <div id="semanticEditor" class="semantic-editor" contenteditable="true" data-placeholder="El lienzo está en blanco.\n\nEscribe aquí tus notas, o redacta tu Proof of Work.\n\nUsa @ para invocar a la Colla.\nUsa # para buscar e inyectar Nodos de Conocimiento del LMS."><p><br></p></div>
                        </div>

                        <div class="thread-container" id="threadWrapper" style="display:none;">
                            <div class="thread-title">
                                <span>📡 Historial de Auditorías Notariales</span>
                                <span id="threadCount" style="color:var(--accent-blue);">0 Logs</span>
                            </div>
                            <div id="threadList"></div>
                        </div>
                    </div>
                    
                    <div class="action-bar-fixed">
                        <button class="btn-action-draft" id="btnConvertDraft">🚀 Convertir a Work Order</button>
                        <button class="btn-action-draft" id="btnSaveTaskDraft" style="display:none;">💾 Guardar Borrador</button>
                        <button class="btn-action-pow" id="btnSubmitReport" style="display:none;">🚀 Sellar Proof of Work (Ledger)</button>
                    </div>
                </main>
                
                <div id="semanticMenu" class="semantic-menu"></div>
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
            editorLabel: document.getElementById('editorLabel'),

            editor: document.getElementById('semanticEditor'),
            menu: document.getElementById('semanticMenu'),
            
            threadWrapper: document.getElementById('threadWrapper'),
            threadList: document.getElementById('threadList'),
            threadCount: document.getElementById('threadCount'),
            
            btnSubmit: document.getElementById('btnSubmitReport'),
            btnConvertDraft: document.getElementById('btnConvertDraft'),
            btnSaveTaskDraft: document.getElementById('btnSaveTaskDraft')
        };

        this.dom.editor.focus();

        this.loadProjectTasks = (projId) => {
            const p = state.projects.find(x => x.id === projId);
            if (!p) return;
            
            let tasks = [];
            const tasksSource = p.work_orders && p.work_orders.length > 0 ? p.work_orders : (p.transactions || []);
            
            if (state.session.role === 'ecosystem-owner' || p.ownerId === activeUserId) {
                tasks = tasksSource.filter(tx => tx.status !== 'theoretical'); 
            } else {
                tasks = tasksSource.filter(tx => tx.assigneeId === activeUserId || tx.workerId === activeUserId); 
            }

            let selectHtml = `<option value="draft">📝 Borrador Libre (Draft Mode)</option>`;
            if (tasks.length > 0) {
                selectHtml += `<optgroup label="🎯 Tareas Asignadas">`;
                tasks.forEach(t => {
                    const parentFlow = (p.vna_flows || []).find(f => f.id === t.flowId) || t;
                    const roleTo = p.roles.find(r => r.id === parentFlow.to);
                    
                    let resolvedName = parentFlow.template || parentFlow.entregable || t.comentario?.substring(0, 30) || 'Work Order';
                    if (resolvedName.length > 40) resolvedName = resolvedName.substring(0, 40) + '...';

                    selectHtml += `<option value="${t.id || t.hash}">[${roleTo ? roleTo.name : 'VNA'}] ${resolvedName}</option>`;
                });
                selectHtml += `</optgroup>`;
            }
            this.dom.omniSelector.innerHTML = selectHtml;
        };

        this.loadProjectTasks(this.activeProjectId);

        this.dom.selProject.addEventListener('change', (e) => {
            this.activeProjectId = e.target.value;
            localStorage.setItem('tt_active_project', this.activeProjectId);
            this.loadProjectTasks(this.activeProjectId);
            this.activeTx = null;
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
            } else {
                this.setDraftMode();
            }
        } else {
            this.setDraftMode();
        }

        this.dom.omniSelector.addEventListener('change', (e) => {
            const val = e.target.value;
            this.stopPomodoro(); 
            
            if (val === 'draft') {
                this.activeTx = null;
                this.setDraftMode();
            } else {
                const p = store.getState().projects.find(x => x.id === this.activeProjectId);
                this.activeTx = (p.work_orders || p.transactions || []).find(t => (t.id || t.hash) === val);
                this.setTaskMode();
            }
        });

        this.setupPomodoro();
        this.setupSemanticEditor();

        this.dom.btnSubmit.addEventListener('click', () => this.reportDeliverable());
        this.dom.btnSaveTaskDraft.addEventListener('click', () => this.saveTaskDraft());
        this.dom.btnConvertDraft.addEventListener('click', () => this.convertDraftToTask());
    }

    // ==========================================
    // 🔥 POMODORO TRACKER NATIVO (Antigravity)
    // ==========================================
    setupPomodoro() {
        const updateInputs = () => {
            const hrs = Math.floor(this.pomodoroSeconds / 3600);
            const mins = Math.floor((this.pomodoroSeconds % 3600) / 60);
            const secs = this.pomodoroSeconds % 60;
            this.dom.timeDisplay.innerText = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            
            const hoursDecimal = (this.pomodoroSeconds / 3600);
            if (this.pomodoroSeconds > 0) {
                this.dom.inpPowHours.value = hoursDecimal.toFixed(3); 
            }
        };

        this.tickPomodoro = () => {
            this.pomodoroSeconds++;
            updateInputs();
        };

        this.dom.btnPlay.addEventListener('click', () => {
            if (this.isPomodoroRunning) return;
            this.isPomodoroRunning = true;
            this.dom.btnPlay.style.display = 'none';
            this.dom.btnPause.style.display = 'flex';
            this.dom.pomoPanel.classList.add('running');
            this.pomodoroInterval = setInterval(this.tickPomodoro, 1000);
        });

        this.dom.btnPause.addEventListener('click', () => {
            this.stopPomodoro();
        });
    }

    stopPomodoro() {
        if (!this.isPomodoroRunning) return;
        this.isPomodoroRunning = false;
        this.dom.btnPlay.style.display = 'flex';
        this.dom.btnPause.style.display = 'none';
        this.dom.pomoPanel.classList.remove('running');
        clearInterval(this.pomodoroInterval);
    }

    setDraftMode() {
        this.dom.taskPanel.style.display = 'none';
        this.dom.pomoPanel.style.display = 'none';
        this.dom.threadWrapper.style.display = 'none';
        
        this.dom.btnSubmit.style.display = 'none';
        this.dom.btnSaveTaskDraft.style.display = 'none';
        this.dom.btnConvertDraft.style.display = 'block';
        
        this.dom.editor.setAttribute('data-placeholder', "El lienzo está en blanco.\n\nEscribe tu Borrador Libre.\n\nUsa @ para invocar a la Colla.\nUsa # para buscar Memes/SOPs del Cerebro LMS (W3C).");
        this.dom.editorLabel.style.display = 'none';
        this.dom.editor.innerHTML = '<p><br></p>';
    }

    setTaskMode() {
        if (!this.activeTx) return;
        
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const isLegacy = !this.activeTx.flowId;
        const parentFlow = isLegacy ? this.activeTx : (p.vna_flows || []).find(f => f.id === this.activeTx.flowId);
        
        this.dom.taskPanel.style.display = 'block';
        this.dom.pomoPanel.style.display = 'block';
        
        let resolvedTitle = parentFlow ? (parentFlow.template || parentFlow.entregable || this.activeTx.comentario) : 'Work Order';
        this.dom.taskTitle.innerText = resolvedTitle;
        
        const roleTo = p.roles.find(r => r.id === (parentFlow ? parentFlow.to : this.activeTx.to));
        this.dom.taskRole.innerText = roleTo ? `${roleTo.levelId} - ${roleTo.name}` : '@ecosistema';
        
        this.dom.taskStatus.innerText = this.activeTx.status === 'pinged' ? 'EN CURSO' : (this.activeTx.status === 'reported' ? 'EN AUDITORÍA' : this.activeTx.status.toUpperCase());
        this.dom.taskDesc.innerHTML = (this.activeTx.comentario || parentFlow?.comentario || 'Aplica GTD: Inicia el Pomodoro, completa la tarea y sella la evidencia.').replace(/\n/g, '<br>');

        const socs = this.activeTx.soc_checklist && this.activeTx.soc_checklist.length > 0 ? this.activeTx.soc_checklist : (parentFlow?.soc_checklist || []);
        if (socs.length > 0) {
            let socHtml = '<label>Criterios de Calidad (Para tu verificación local):</label>';
            socs.forEach(soc => {
                socHtml += `
                    <div class="soc-item-check">
                        <input type="checkbox" id="${soc.id}" ${soc.isChecked ? 'checked' : ''}>
                        <span>${soc.text}</span>
                    </div>
                `;
            });
            this.dom.taskSocs.innerHTML = socHtml;
        } else {
            this.dom.taskSocs.innerHTML = '<div style="color:#666; font-style:italic; font-size:0.85rem;">No hay SOCs asociados a este entregable.</div>';
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
        this.dom.threadWrapper.style.display = 'flex';
        this.dom.editorLabel.style.display = 'block';
        this.dom.editor.setAttribute('data-placeholder', "Documenta tu Proof of Work aquí...");
        this.dom.btnConvertDraft.style.display = 'none';
        
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

        this.renderThread(p);
    }

    // ==========================================
    // 🧠 EDITOR SEMÁNTICO JSON-LD (Antigravity)
    // ==========================================
    setupSemanticEditor() {
        const input = this.dom.editor;
        const menu = this.dom.menu;
        const state = store.getState();
        
        let lastKnownRect = null; 
        let savedRange = null; 

        const updateDetectedContext = () => {
            const text = input.innerText;
            const mentions = [...new Set(text.match(/@\w+/g) || [])];
            const tags = [...new Set(text.match(/#\w+/g) || [])];
            
            if (mentions.length === 0 && tags.length === 0) {
                this.dom.dynamicTags.innerHTML = `<span style="color:#555; font-style:italic; font-size:0.85rem;">Escribe @ o # para inyectar conocimiento W3C...</span>`;
            } else {
                let html = '';
                mentions.forEach(m => html += `<span class="context-badge cb-mention">${m}</span>`);
                tags.forEach(t => html += `<span class="context-badge cb-meme">${t}</span>`);
                this.dom.dynamicTags.innerHTML = html;
            }
        };

        input.addEventListener('input', updateDetectedContext);
        menu.addEventListener('mousedown', (e) => e.preventDefault());

        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !menu.contains(e.target)) {
                menu.style.display = 'none';
                this.isMenuOpen = false;
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
            
            // Invocación de Nodos / Agentes
            if (this.currentWord.startsWith('@')) {
                const search = this.currentWord.substring(1).toLowerCase();
                const users = state.globalUsers.filter(u => u.name.toLowerCase().includes(search) || u.id.toLowerCase().includes(search));
                
                if (users.length > 0) {
                    menu.innerHTML = `<div style="padding: 5px 15px; font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #333; margin-bottom: 5px;">Invocar Nodo / Agente IA</div>`;
                    menu.innerHTML += users.map(u => `
                        <div class="semantic-item type-mention" data-val="${u.id}" data-type="mention">
                            <span style="font-size:1.5rem;">${u.profile?.isAi ? '🤖' : '👤'}</span> 
                            <div>
                                <div style="font-weight:900;">${u.name}</div>
                                <div style="font-size:0.75rem; color:#888;">${u.profile?.isAi ? 'Agente A2A' : 'Humano'}</div>
                            </div>
                        </div>
                    `).join('');
                    this.showFloatingMenu(menu, lastKnownRect);
                } else {
                    menu.style.display = 'none';
                }
            } 
            // 🔥 RAG QUIRÚRGICO: Inyección W3C Directa en el Canvas
            else if (this.currentWord.startsWith('#')) {
                const search = this.currentWord.substring(1).toLowerCase();
                await KB.init();
                const allMemes = await KB.getAllNodes();
                let memes = allMemes.filter(m => m.projectId === 'global' || m.projectId === this.activeProjectId);
                if (search.length > 0) memes = memes.filter(m => m.title?.toLowerCase().includes(search) || m.id.toLowerCase().includes(search) || (m.keywords && m.keywords.some(k => k.toLowerCase().includes(search))));
                
                if (memes.length > 0) {
                    menu.innerHTML = `<div style="padding: 5px 15px; font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #333; margin-bottom: 5px;">Inyectar Conocimiento W3C</div>`;
                    menu.innerHTML += memes.slice(0, 8).map(m => {
                        const jsonPayload = encodeURIComponent(JSON.stringify(m)); // Empaquetamos todo el JSON-LD
                        return `
                        <div class="semantic-item type-meme" data-val="${m.id}" data-type="jsonld" data-payload="${jsonPayload}" title="${m.content}">
                            <span style="font-size:1.2rem; color:var(--accent-purple);">🧠</span> 
                            <div>
                                <div style="font-weight:900; font-size:0.85rem;">${m.title}</div>
                                <div style="font-size:0.7rem; color:#888; font-family:monospace;">[${m.category}]</div>
                            </div>
                        </div>
                    `}).join('');
                    this.showFloatingMenu(menu, lastKnownRect);
                } else {
                    menu.style.display = 'none';
                }
            } else {
                menu.style.display = 'none';
                this.isMenuOpen = false;
            }
        });

        menu.addEventListener('click', (e) => {
            const item = e.target.closest('.semantic-item');
            if (item && savedRange) {
                const replaceVal = item.getAttribute('data-val');
                const type = item.getAttribute('data-type');
                
                savedRange.setStart(savedRange.startContainer, savedRange.endOffset - this.currentWord.length);
                savedRange.deleteContents();
                
                let el;

                // 🔥 INYECCIÓN DE WEB COMPONENT SEMÁNTICO
                if (type === 'jsonld') {
                    const rawJson = decodeURIComponent(item.getAttribute('data-payload'));
                    const memeObj = JSON.parse(rawJson);
                    
                    el = document.createElement('semantic-knowledge-card');
                    el.setAttribute('data-id', memeObj.id);
                    el.setAttribute('data-title', memeObj.title);
                    el.setAttribute('data-category', memeObj.category);
                    el.setAttribute('data-content', memeObj.content);
                    el.setAttribute('data-jsonld', rawJson);
                    
                    // Aseguramos que no se pueda borrar a medias en el editor
                    el.contentEditable = "false";
                    
                    savedRange.insertNode(el);
                    const br = document.createElement('br');
                    el.parentNode.insertBefore(br, el.nextSibling);
                    savedRange.setStartAfter(br);

                } else if (type === 'mention') {
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
            menu.style.top = `${rect.bottom + 10}px`;
            menu.style.left = `${rect.left}px`;
        }
        menu.style.display = 'block';
        this.isMenuOpen = true;
    }

    // ==========================================
    // 💾 ACCIONES DE REDUX (GTD PUSH)
    // ==========================================
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
        // 🔥 MAGIA ANTIGRAVITY: Si no pusiste horas manuales, coge las del Pomodoro, si es 0, coge las del input (que trae las estimadas)
        let hoursToReport = this.pomodoroSeconds > 0 ? (this.pomodoroSeconds / 3600) : parseFloat(this.dom.inpPowHours.value);
        if (isNaN(hoursToReport) || hoursToReport <= 0) hoursToReport = 1; // Fallback extremo
        hoursToReport = parseFloat(hoursToReport.toFixed(3)); // Precisión Slicing Pie

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

            // 1. Reportar Tarea (Cambio de estado a 'reported')
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

            // 2. Registrar Log en la Blockchain (Hilo)
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

    async convertDraftToTask() {
        const textContent = this.dom.editor.innerText.trim(); 
        if (!textContent) return alert("⚠️ Escribe algo en el borrador antes de convertirlo.");
        if (!this.activeProjectId) return alert("Selecciona un Ecosistema en el selector superior.");
        
        const project = store.getState().projects.find(p => p.id === this.activeProjectId);
        if (!project) return;

        const words = textContent.split(/\s/);
        let assignee = store.getState().session.activeUserId; 
        for (const w of words) {
            if (w.startsWith('@') && w.length > 1) { assignee = w; break; }
        }

        const newHash = 'wo_draft_' + Math.random().toString(36).substr(2, 9);
        
        await store.dispatch({
            type: 'SPAWN_WORK_ORDER',
            payload: {
                projectId: this.activeProjectId,
                workOrder: {
                    hash: newHash, flowId: null, status: 'pinged', realHours: 0, sprintId: project.activeSprintId,
                    comentario: textContent, soc_checklist: [], assigneeId: assignee
                }
            }
        });

        window.location.href = `/v9/paper?hash=${newHash}`;
    }

    renderThread(project) {
        if (!project || !project.logs || !this.activeTx) return;
        const activeHash = this.activeTx.id || this.activeTx.hash;
        const thread = project.logs.filter(l => l.relatedTxHash === activeHash).sort((a,b) => a.date - b.date);
        
        this.dom.threadCount.innerText = `${thread.length} Logs P2P`;

        if (thread.length === 0) {
            this.dom.threadList.innerHTML = `<div style="text-align:center; color:#555; font-style:italic; padding: 2rem;">No hay historial de entregas o auditorías para esta Work Order.</div>`;
            return;
        }

        const state = store.getState();
        let html = '';
        
        thread.forEach(log => {
            const user = state.globalUsers.find(u => u.id === log.authorId);
            const isAi = user?.profile?.isAi;
            const authorName = user ? user.name : log.authorId;
            const authorIcon = isAi ? '🤖' : '👤';
            const timeStr = new Date(log.date).toLocaleDateString() + ' ' + new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            let formattedContent = log.content;
            if (log.mentions) {
                log.mentions.forEach(m => {
                    const rgx = new RegExp(`(?<!<[^>]*)${m}`, 'g');
                    formattedContent = formattedContent.replace(rgx, `<a href="/v9/profile?id=${m}" data-link class="mention-highlight">${m}</a>`);
                });
            }

            html += `
                <div class="log-bubble ${isAi ? 'ai-reply' : 'human-reply'}">
                    <div class="log-header">
                        <div class="log-author">${authorIcon} ${authorName}</div>
                        <div class="log-time">${timeStr}</div>
                    </div>
                    <div class="log-content">${formattedContent}</div>
                </div>
            `;
        });

        this.dom.threadList.innerHTML = html;
    }

    destroy() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }
}
