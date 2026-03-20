// v8/js/views/PaperView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js'; 
import { PageHeader } from '../components/PageHeader.js';
import { MapRenderer } from '../components/MapRenderer.js'; 
import { KanbanRenderer } from '../components/KanbanRenderer.js'; 
import { LedgerRenderer } from '../components/LedgerRenderer.js'; 
import { FocusRenderer } from '../components/FocusRenderer.js';
import { SandboxRenderer } from '../components/SandboxRenderer.js'; 
import { Orchestrator } from '../core/Orchestrator.js';
import { KB } from '../core/kb.js';

export default class PaperView {
    constructor() {
        document.title = "Omni-Paper | TeamTowers V15.9";
        this.activeTx = null; 
        this.activeProjectId = null;
        this.isMenuOpen = false;
        this.currentWord = "";
    }

    async getHtml() {
        const state = store.getState();
        this.activeProjectId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === this.activeProjectId);
        if (!project && state.projects.length > 0) {
            project = state.projects[state.projects.length - 1];
            this.activeProjectId = project.id;
        }

        const headerConfig = {
            title: "Omni-Paper (Workspace)",
            subtitle: project ? project.nombre : 'Kernel V15.9',
            tagline: "Lienzo de Ejecución. Completa SOPs, verifica SOCs y sella tu Proof of Work."
        };

        return `
            <style>
                ${MapRenderer.getStyles()}
                ${KanbanRenderer.getStyles()} 
                ${LedgerRenderer.getStyles()} 
                ${FocusRenderer.getStyles()}
                ${SandboxRenderer ? SandboxRenderer.getStyles() : ''}

                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width:100%;}
                .workspace-paper { flex: 1; display: flex; flex-direction: column; position: relative; background: var(--bg-dark); overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; padding: 2rem 3rem; box-sizing: border-box; width: 100%; align-items: center;}
                
                .paper-container { width: 100%; max-width: 850px; display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; padding-bottom: 8rem;}
                
                /* BREADCRUMB & CONTEXT BAR */
                .breadcrumb-bar { display: flex; align-items: center; background: rgba(10,10,15,0.8); padding: 10px 15px; border-radius: 12px 12px 0 0; border: 1px solid var(--glass-border); border-bottom: none; gap: 10px; flex-wrap: wrap;}
                .bc-select { background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; font-size: 0.9rem; font-weight: bold; font-family: var(--font-main); outline: none; cursor: pointer; padding: 8px 12px; border-radius: 8px; transition: 0.3s;}
                .bc-select:focus { border-color: var(--accent-blue); }
                .bc-separator { color: #555; font-weight: bold; }
                
                .live-context-bar { background: rgba(0,0,0,0.6); border: 1px solid var(--glass-border); padding: 12px 15px; border-radius: 0 0 12px 12px; display: flex; gap: 10px; align-items: center; min-height: 24px; transition: 0.3s; flex-wrap: wrap;}
                .live-context-label { font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; margin-right: 10px;}
                .context-badge { padding: 4px 10px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.8rem; font-weight: bold; animation: popIn 0.3s ease-out;}
                .cb-mention { background: rgba(0,176,255,0.1); color: var(--accent-blue); border: 1px solid rgba(0,176,255,0.3); }
                .cb-meme { background: rgba(224,64,251,0.1); color: var(--accent-purple); border: 1px solid rgba(224,64,251,0.3); }

                /* 🔥 PANEL DE EJECUCIÓN (WORK ORDER) */
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

                /* EL LIENZO EN BLANCO */
                .editor-wrapper { position: relative; width: 100%; margin-top: 1rem;}
                .semantic-editor { width: 100%; min-height: 25vh; background: transparent; border: none; color: #e0e0e0; font-family: 'Georgia', serif; font-size: 1.15rem; line-height: 1.6; outline: none; padding: 10px 0;}
                .semantic-editor:empty:before { content: attr(data-placeholder); color: #555; font-style: italic; pointer-events: none;}
                .semantic-editor p { margin: 0 0 1rem 0; }

                /* WIDGETS COGNITIVOS */
                .omni-widget { margin: 1.5rem 0; border: 1px dashed var(--accent-blue); border-radius: 16px; background: rgba(10,10,15,0.8); overflow: hidden; user-select: none; box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: flex; flex-direction: column;}
                .omni-widget-header { background: rgba(0,176,255,0.1); border-bottom: 1px solid rgba(0,176,255,0.2); padding: 10px 15px; font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-blue); font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: flex; justify-content: space-between; align-items: center;}
                .resident-agent-btn { background: rgba(0,0,0,0.5); border: 1px solid currentColor; padding: 4px 10px; border-radius: 12px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 5px; font-size: 0.75rem;}
                .resident-agent-btn:hover { background: currentColor; color: #000 !important; }
                
                /* UX DELUXE: MENÚ AUTOCOMPLETADO FLOTANTE */
                .semantic-menu { position: fixed; background: rgba(10,10,15,0.98); border: 1px solid rgba(255,255,255,0.1); border-top: 3px solid var(--accent-blue); border-radius: 16px; max-height: 350px; overflow-y: auto; display: none; z-index: 9999; box-shadow: 0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(0,176,255,0.15); backdrop-filter: blur(20px); padding: 8px 0; min-width: 320px; animation: popIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); transform-origin: top left;}
                .semantic-item { padding: 12px 20px; color: white; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 15px; font-size: 0.95rem; font-family: var(--font-main); border-left: 2px solid transparent;}
                .semantic-item:hover, .semantic-item.selected { background: rgba(255,255,255,0.05); border-left-color: var(--accent-blue);}
                
                /* HIGHLIGHTS (LINKS) */
                .mention-highlight { color: var(--accent-blue); font-weight: bold; background: rgba(0,176,255,0.1); padding: 2px 6px; border-radius: 6px; font-family: var(--font-mono); font-size: 1rem; cursor: pointer; transition: 0.2s; text-decoration: none;}
                .meme-highlight { color: var(--accent-purple); font-weight: bold; background: rgba(224,64,251,0.1); padding: 2px 6px; border-radius: 6px; font-family: var(--font-mono); font-size: 1rem; cursor: pointer; transition: 0.2s; text-decoration: none;}

                /* HILO DE CONVERSACIÓN (REGISTRO HISTÓRICO) */
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

                /* BOTONES DE ACCIÓN INFERIOR */
                .action-bar-fixed { position: fixed; bottom: 30px; right: 30px; display: flex; gap: 15px; z-index: 1000;}
                .btn-action-pow { background: linear-gradient(135deg, var(--accent-green), #00b0ff); color: black; border: none; padding: 16px 30px; border-radius: 30px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 10px 30px rgba(0, 230, 118, 0.3);}
                .btn-action-pow:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(0, 230, 118, 0.5); filter: brightness(1.2);}
                
                .btn-action-draft { background: rgba(255,171,64,0.1); border: 1px solid var(--accent-orange); color: var(--accent-orange); padding: 16px 30px; border-radius: 30px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(10px);}
                .btn-action-draft:hover { background: var(--accent-orange); color: black; box-shadow: 0 10px 30px rgba(255, 171, 64, 0.4); transform: translateY(-3px);}

                @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .workspace-paper { padding: 90px 1rem 120px 1rem; }
                    .breadcrumb-bar { flex-direction: column; align-items: stretch; border-radius: 12px; border-bottom: 1px solid var(--glass-border); margin-bottom: 10px;}
                    .live-context-bar { border-radius: 12px; }
                    .bc-separator { display: none; }
                    .action-bar-fixed { bottom: 80px; right: 20px; left: 20px; justify-content: space-between; gap:10px; }
                    .btn-action-pow, .btn-action-draft { width: 100%; padding: 14px 10px; font-size: 0.95rem; text-align: center; justify-content:center;}
                    .pow-section { flex-direction: column; }
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
                                <span style="color:#555; font-style:italic; font-size:0.85rem;">Escribe @ o # para enlazar el conocimiento...</span>
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
                                <div class="pow-input-group">
                                    <label>🔗 Enlace al Entregable (Proof of Work)</label>
                                    <input type="text" id="inpPowLink" class="pow-input" placeholder="https://github.com/..., Figma, Drive...">
                                </div>
                                <div class="pow-input-group" style="flex: 0.5;">
                                    <label>⏱ Tiempo Dedicado (Horas)</label>
                                    <input type="number" step="0.5" id="inpPowHours" class="pow-input mono" placeholder="Ej: 2.5" title="Próximamente: Sincronización Automática con Pomodoro Timer">
                                </div>
                            </div>
                        </div>

                        <div class="editor-wrapper">
                            <label style="display:none;" id="editorLabel" style="font-size:0.75rem; color:#888; text-transform:uppercase; font-weight:bold; margin-bottom:5px;">Notas Adicionales del Entregable</label>
                            <div id="semanticEditor" class="semantic-editor" contenteditable="true" data-placeholder="El lienzo está en blanco.\n\nEscribe aquí tus notas, o úsalo como borrador libre.\n\nUsa @ para invocar a la Colla.\nUsa # para buscar Memes/SOPs del Cerebro LMS.\nUsa / para inyectar Componentes (/meme, /mapa...)."><p><br></p></div>
                        </div>

                        <div class="thread-container" id="threadWrapper" style="display:none;">
                            <div class="thread-title">
                                <span>📡 Historial de Entregas y Auditorías</span>
                                <span id="threadCount" style="color:var(--accent-blue);">0 Logs</span>
                            </div>
                            <div id="threadList"></div>
                        </div>

                    </div>
                    
                    <div class="action-bar-fixed">
                        <button class="btn-action-draft" id="btnConvertDraft">🚀 Convertir en Work Order</button>
                        <button class="btn-action-draft" id="btnSaveTaskDraft" style="display:none;">💾 Guardar Borrador</button>
                        <button class="btn-action-pow" id="btnSubmitReport" style="display:none;">🚀 Reportar Entregable</button>
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

        this.loadProjectTasks = (projId) => {
            const p = store.getState().projects.find(x => x.id === projId);
            if (!p) return;
            
            let tasks = [];
            const tasksSource = p.work_orders && p.work_orders.length > 0 ? p.work_orders : (p.transactions || []);
            
            // Filtramos tareas que estén asignadas a mí o en auditoría (para histórico)
            if (store.getState().session.role === 'ecosystem-owner' || p.ownerId === activeUserId) {
                tasks = tasksSource.filter(tx => tx.status !== 'theoretical'); // PO ve todo lo que no sea libre
            } else {
                tasks = tasksSource.filter(tx => tx.assigneeId === activeUserId || tx.workerId === activeUserId); // Worker ve las suyas
            }

            let selectHtml = `<option value="draft">📝 Borrador Libre (Draft Mode)</option>`;
            if (tasks.length > 0) {
                selectHtml += `<optgroup label="🎯 Tareas Asignadas">`;
                tasks.forEach(t => {
                    const parentFlow = (p.vna_flows || []).find(f => f.id === t.flowId) || t;
                    const roleTo = p.roles.find(r => r.id === parentFlow.to);
                    const resolvedName = parentFlow.template || parentFlow.entregable || 'Work Order';
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
            this.setDraftMode();
        });

        // Carga por URL (cuando vienes del Kanban)
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
            if (val === 'draft') {
                this.activeTx = null;
                this.setDraftMode();
            } else {
                const p = store.getState().projects.find(x => x.id === this.activeProjectId);
                this.activeTx = (p.work_orders || p.transactions || []).find(t => (t.id || t.hash) === val);
                this.setTaskMode();
            }
        });

        this.setupSemanticEditor();

        // 🔥 BOTONES DE ACCIÓN
        this.dom.btnSubmit.addEventListener('click', () => this.reportDeliverable());
        this.dom.btnSaveTaskDraft.addEventListener('click', () => this.saveTaskDraft());
        this.dom.btnConvertDraft.addEventListener('click', () => this.convertDraftToTask());
    }

    setDraftMode() {
        this.dom.taskPanel.style.display = 'none';
        this.dom.threadWrapper.style.display = 'none';
        
        this.dom.btnSubmit.style.display = 'none';
        this.dom.btnSaveTaskDraft.style.display = 'none';
        this.dom.btnConvertDraft.style.display = 'block';
        
        this.dom.editor.setAttribute('data-placeholder', "El lienzo está en blanco.\n\nEscribe tu Borrador Libre.\n\nUsa @ para invocar a la Colla.\nUsa # para buscar Memes/SOPs del Cerebro LMS.\nUsa / para inyectar Componentes (/meme, /mapa, /kanban, /ledger...).");
        this.dom.editorLabel.style.display = 'none';
    }

    setTaskMode() {
        if (!this.activeTx) return;
        
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const isLegacy = !this.activeTx.flowId;
        const parentFlow = isLegacy ? this.activeTx : (p.vna_flows || []).find(f => f.id === this.activeTx.flowId);
        
        // 1. Rellenar Panel de Misión
        this.dom.taskPanel.style.display = 'block';
        this.dom.taskTitle.innerText = parentFlow ? (parentFlow.template || parentFlow.entregable || 'SOP') : 'Work Order';
        
        const roleTo = p.roles.find(r => r.id === (parentFlow ? parentFlow.to : this.activeTx.to));
        this.dom.taskRole.innerText = roleTo ? `${roleTo.levelId} - ${roleTo.name}` : '@ecosistema';
        
        this.dom.taskStatus.innerText = this.activeTx.status === 'pinged' ? 'EN CURSO' : (this.activeTx.status === 'reported' ? 'EN AUDITORÍA' : this.activeTx.status.toUpperCase());
        this.dom.taskDesc.innerHTML = (this.activeTx.comentario || parentFlow?.comentario || 'Sin instrucciones detalladas.').replace(/\n/g, '<br>');

        // 2. Rellenar SOCs Checkboxes
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

        // 3. Rellenar Inputs de PoW (Si guardó borrador)
        this.dom.inpPowLink.value = this.activeTx.draftLink || this.activeTx.proofLink || '';
        this.dom.inpPowHours.value = this.activeTx.draftHours || this.activeTx.realHours || parentFlow?.estimatedHours || 1;
        this.dom.editor.innerHTML = this.activeTx.draftContent || '<p><br></p>';

        // 4. Ajustar Vista y Botones
        this.dom.threadWrapper.style.display = 'flex';
        this.dom.editorLabel.style.display = 'block';
        this.dom.editor.setAttribute('data-placeholder', "Añade notas, comentarios para el Auditor o contexto sobre tu entregable aquí...");
        
        this.dom.btnConvertDraft.style.display = 'none';
        
        if (this.activeTx.status === 'pinged') {
            this.dom.btnSubmit.style.display = 'block';
            this.dom.btnSaveTaskDraft.style.display = 'block';
        } else {
            // Si ya está reportada o sellada, no se puede volver a reportar
            this.dom.btnSubmit.style.display = 'none';
            this.dom.btnSaveTaskDraft.style.display = 'none';
            this.dom.inpPowLink.disabled = true;
            this.dom.inpPowHours.disabled = true;
            this.dom.taskSocs.querySelectorAll('input').forEach(i => i.disabled = true);
            this.dom.editor.contentEditable = "false";
        }

        this.renderThread(p);
    }

    // 🔥 ACCIÓN: Guardar el progreso sin enviarlo a auditar
    async saveTaskDraft() {
        if (!this.activeTx) return;
        this.dom.btnSaveTaskDraft.disabled = true;
        this.dom.btnSaveTaskDraft.innerText = "💾 Guardando...";

        const link = this.dom.inpPowLink.value.trim();
        const hours = parseFloat(this.dom.inpPowHours.value) || 0;
        const htmlContent = this.dom.editor.innerHTML.trim();
        
        // Guardar estado de checkboxes
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
            alert("Borrador guardado localmente.");
        }, 500);
    }

    // 🔥 ACCIÓN: Enviar el Entregable a Auditoría (Report)
    async reportDeliverable() {
        if (!this.activeTx) return;
        
        const link = this.dom.inpPowLink.value.trim();
        const hours = parseFloat(this.dom.inpPowHours.value) || 0;
        const htmlContent = this.dom.editor.innerHTML.trim();
        
        if (!link && htmlContent === '<p><br></p>') {
            return alert("⚠️ Debes incluir un Enlace al Entregable o escribir notas en el lienzo antes de reportar.");
        }

        if (hours <= 0) {
            return alert("⚠️ Debes registrar un tiempo dedicado válido (Horas > 0).");
        }

        this.dom.btnSubmit.disabled = true;
        this.dom.btnSubmit.innerText = '🚀 Enviando a Usenet...';
        
        const isLegacy = !this.activeTx.flowId;
        const payloadKey = isLegacy ? 'txHash' : 'woHash';
        const targetHash = this.activeTx.hash || this.activeTx.id;

        // 1. Reportar Tarea (Cambia Status a 'reported' y asigna horas/link)
        await store.dispatch({
            type: 'REPORT_WORK_ORDER',
            payload: {
                projectId: this.activeProjectId,
                [payloadKey]: targetHash,
                realHours: hours,
                comentario: htmlContent === '<p><br></p>' ? 'Entregable adjunto en enlace.' : htmlContent,
                proofLink: link
            }
        });

        // 2. Registrar en la Usenet (Log histórico)
        const contentLog = `Proof of Work subido. Horas: ${hours}h.\n${link ? `<a href="${link}" target="_blank" class="log-pow-link">🔗 Ver Entregable</a><br><br>` : ''}${htmlContent}`;
        
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
                    mentions: ['@notari_ledger', '@cap_de_colla'], // Avisar a la IA y al PO
                    readBy: []
                }
            }
        });

        alert("✅ Proof of Work reportado exitosamente. La tarea ha pasado a Auditoría.");
        window.location.href = '/v8/dashboard'; // Redirigir al Kanban para ver el cambio de columna
    }

    renderThread(project) {
        if (!project || !project.logs || !this.activeTx) return;
        const activeHash = this.activeTx.id || this.activeTx.hash;
        const thread = project.logs.filter(l => l.relatedTxHash === activeHash).sort((a,b) => a.date - b.date);
        
        this.dom.threadCount.innerText = `${thread.length} Reportes/Pings`;

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
                    formattedContent = formattedContent.replace(rgx, `<a href="/v8/profile?id=${m}" data-link class="mention-highlight">${m}</a>`);
                });
            }
            formattedContent = formattedContent.replace(/(?<!<[^>]*)(#[a-zA-Z0-9_]+)/g, `<a href="/v8/lms" data-link class="meme-highlight">$1</a>`);

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

    // ==========================================
    // EL RESTO ES EL CÓDIGO DEL EDITOR SEMÁNTICO Y WIDGETS
    // (Mantenido intacto para la funcionalidad base del Paper)
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
                this.dom.dynamicTags.innerHTML = `<span style="color:#555; font-style:italic; font-size:0.85rem;">Escribe @ o # para enlazar el conocimiento...</span>`;
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
            if (!input.contains(e.target) && !menu.contains(e.target) && !e.target.classList.contains('btn-inline-action') && !e.target.closest('.resident-agent-btn') && !e.target.closest('.widget-chat-panel') && !e.target.classList.contains('btn-ai-action')) {
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
                            <span class="semantic-badge">${u.id}</span>
                        </div>
                    `).join('');
                    this.showFloatingMenu(menu, lastKnownRect);
                } else {
                    menu.style.display = 'none';
                }
            } 
            else if (this.currentWord.startsWith('#')) {
                const search = this.currentWord.substring(1).toLowerCase();
                await KB.init();
                let memes = await KB.getAllNodes({ type: 'meme' });
                memes = memes.filter(m => m.projectId === 'global' || m.projectId === this.activeProjectId);
                if (search.length > 0) memes = memes.filter(m => m.title.toLowerCase().includes(search) || m.id.toLowerCase().includes(search) || (m.keywords && m.keywords.some(k => k.toLowerCase().includes(search))));
                
                if (memes.length > 0) {
                    menu.innerHTML = `<div style="padding: 5px 15px; font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #333; margin-bottom: 5px;">Inyectar Conocimiento W3C</div>`;
                    menu.innerHTML += memes.slice(0, 8).map(m => `
                        <div class="semantic-item type-meme" data-val="#${m.id.replace('meme_','')}" data-type="meme" title="${m.content}">
                            <span style="font-size:1.2rem; color:var(--accent-purple);">🧠</span> 
                            <div>
                                <div style="font-weight:900; font-size:0.85rem;">${m.title}</div>
                                <div style="font-size:0.7rem; color:#888; font-family:monospace;">[${m.category}] ${m.roleTarget || 'Global'}</div>
                            </div>
                        </div>
                    `).join('');
                    this.showFloatingMenu(menu, lastKnownRect);
                } else {
                    menu.style.display = 'none';
                }
            } 
            else if (this.currentWord.startsWith('/')) {
                menu.innerHTML = `
                    <div style="padding: 5px 15px; font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #333; margin-bottom: 5px;">Widgets Cognitivos Habitados</div>
                    <div class="semantic-item type-widget" data-val="/mapa" data-type="widget"><span style="font-size:1.5rem;">🕸️</span> <div><b style="color:white;">Mapa VNA (Topología)</b><br><span style="font-size:0.75rem;color:#888;">Habitado por @genesi_ai</span></div></div>
                    <div class="semantic-item type-widget" data-val="/kanban" data-type="widget"><span style="font-size:1.5rem;">📋</span> <div><b style="color:white;">Mercado Kanban PULL</b><br><span style="font-size:0.75rem;color:#888;">Habitado por @cap_de_colla</span></div></div>
                    <div class="semantic-item type-widget" data-val="/ledger" data-type="widget"><span style="font-size:1.5rem;">⚖️</span> <div><b style="color:white;">Ledger (Slicing Pie)</b><br><span style="font-size:0.75rem;color:#888;">Habitado por @notari_ledger</span></div></div>
                    <div class="semantic-item type-widget" data-val="/sandbox" data-type="widget"><span style="font-size:1.5rem; color:var(--accent-purple);">🌌</span> <div><b style="color:white;">Sandbox VNA</b><br><span style="font-size:0.75rem;color:#888;">Habitado por @mestre_escola</span></div></div>
                `;
                this.showFloatingMenu(menu, lastKnownRect);
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

                if (type === 'widget' || type === 'action') {
                    const widgetId = 'wid_' + Date.now();
                    el = document.createElement('div');
                    
                    if (replaceVal === '/mapa') {
                        el.innerHTML = this.getHabitableWidgetHtml(widgetId, '🕸️ Topología VNA', 'canvas', '@genesi_ai', 'var(--accent-blue)', '350px', 'background:#050508;');
                    } else if (replaceVal === '/kanban') {
                        el.innerHTML = this.getHabitableWidgetHtml(widgetId, '📋 Mercado Kanban PULL', 'kanban', '@cap_de_colla', 'var(--accent-purple)', 'auto', 'padding: 1.5rem; background: radial-gradient(circle at top right, #111116 0%, #050505 100%);');
                    } else if (replaceVal === '/ledger') {
                        el.innerHTML = this.getHabitableWidgetHtml(widgetId, '⚖️ Slicing Pie (Cap Table)', 'ledger', '@notari_ledger', 'var(--accent-green)', 'auto', 'padding: 2rem; background: rgba(0,0,0,0.5);');
                    } else if (replaceVal === '/sandbox') {
                        el.innerHTML = this.getHabitableWidgetHtml(widgetId, '🌌 Sandbox VNA (Arquetipos)', 'sandbox', '@mestre_escola', 'var(--accent-orange)', 'auto', 'padding:0;');
                    }
                    
                    savedRange.insertNode(el);
                    savedRange.setStartAfter(el.nextSibling);
                    
                    if (['/mapa', '/kanban', '/ledger', '/sandbox'].includes(replaceVal)) {
                        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
                        this.hydrateWidgetsInDOM(el, p);
                    }

                } else {
                    const htmlClass = type === 'mention' ? 'mention-highlight' : 'meme-highlight';
                    el = document.createElement('a');
                    el.className = htmlClass;
                    el.href = type === 'mention' ? `/v8/profile?id=${replaceVal}` : `/v8/lms`;
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

    getHabitableWidgetHtml(widgetId, title, prefix, agentId, color, height, bodyStyle) {
        return `
            <div class="omni-widget" contenteditable="false" id="widget_${widgetId}" style="border-color:${color};">
                <div class="omni-widget-header" style="background: ${color.replace(')', ', 0.1)').replace('var(', 'rgba(')}; border-bottom-color: ${color.replace(')', ', 0.2)').replace('var(', 'rgba(')}; color: ${color};">
                    <span>${title}</span>
                    <button class="resident-agent-btn" data-wid="${widgetId}" style="color: ${color};">
                        🤖 Conversar con ${agentId} ▾
                    </button>
                </div>
                <div class="widget-content-area">
                    <div class="omni-widget-body ${prefix === 'canvas' ? 'omni-map-canvas' : ''}" id="${prefix}_${widgetId}" style="height:${height}; ${bodyStyle}">
                        ${prefix === 'canvas' ? `
                            <svg style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:1; pointer-events:none;">
                                <defs>
                                    <marker id="arrow-tangible-vis" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#00e676"/></marker>
                                    <marker id="arrow-intangible-vis" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#e040fb"/></marker>
                                </defs>
                                <g id="svg_${widgetId}"></g>
                            </svg>
                        ` : ''}
                    </div>
                </div>
            </div><p><br></p>
        `;
    }

    hydrateWidgetsInDOM(containerElement, project) {
        setTimeout(() => {
            containerElement.querySelectorAll('.omni-map-canvas').forEach(canvas => {
                const svg = canvas.querySelector('svg > g');
                if(svg && project) {
                    const flows = project.vna_flows && project.vna_flows.length > 0 ? project.vna_flows : (project.transactions || []);
                    const mr = new MapRenderer(canvas, svg, { isMacro: true });
                    mr.setData(project.roles, flows);
                }
            });
            containerElement.querySelectorAll('[id^="kanban_"]').forEach(container => {
                if (project) {
                    const activeUserId = store.getState().session.activeUserId;
                    const isPO = project.ownerId === activeUserId || store.getState().session.role === 'ecosystem-owner';
                    const kr = new KanbanRenderer(container, { project: project, activeUserId: activeUserId, isPO: isPO, currentTab: 'oportunidades', currentFilter: 'all', isMacroMode: true });
                    kr.render();
                }
            });
        }, 100);
    }

    async convertDraftToTask() {
        const textContent = this.dom.editor.innerText.trim(); 
        if (!textContent) return alert("⚠️ Escribe algo en el borrador antes de convertirlo.");

        if (!this.activeProjectId) return alert("Selecciona o crea un Ecosistema en el selector superior.");
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
                    hash: newHash, 
                    flowId: null, 
                    status: 'pinged', 
                    realHours: 0,
                    sprintId: project.activeSprintId,
                    comentario: textContent,
                    soc_checklist: [],
                    assigneeId: assignee
                }
            }
        });

        alert(`🚀 Borrador convertido en Work Order y asignado a ${assignee}. Refrescando interfaz...`);
        window.location.href = `/v8/paper?hash=${newHash}`;
    }
}
