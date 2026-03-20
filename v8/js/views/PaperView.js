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
}// v8/js/views/PaperView.js
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
        document.title = "Omni-Paper | TeamTowers V15.7";
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
            title: "Omni-Paper (Usenet)",
            subtitle: project ? project.nombre : 'Kernel V15.7',
            tagline: "El lienzo cognitivo. Escribe @ para Nodos, # para Memes, y / para Comandos."
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
                
                .paper-container { width: 100%; max-width: 850px; display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem;}
                
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

                /* EL LIENZO EN BLANCO */
                .editor-wrapper { position: relative; width: 100%; margin-top: 1rem;}
                .semantic-editor { width: 100%; min-height: 40vh; background: transparent; border: none; color: #e0e0e0; font-family: 'Georgia', serif; font-size: 1.25rem; line-height: 1.8; outline: none; padding: 10px 0;}
                .semantic-editor:empty:before { content: attr(data-placeholder); color: #555; font-style: italic; pointer-events: none;}
                .semantic-editor p { margin: 0 0 1rem 0; }

                /* WIDGETS COGNITIVOS (HABITADOS) */
                .omni-widget { margin: 1.5rem 0; border: 1px dashed var(--accent-blue); border-radius: 16px; background: rgba(10,10,15,0.8); overflow: hidden; user-select: none; box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: flex; flex-direction: column;}
                .omni-widget-header { background: rgba(0,176,255,0.1); border-bottom: 1px solid rgba(0,176,255,0.2); padding: 10px 15px; font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-blue); font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: flex; justify-content: space-between; align-items: center;}
                
                .resident-agent-btn { background: rgba(0,0,0,0.5); border: 1px solid currentColor; padding: 4px 10px; border-radius: 12px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 5px; font-size: 0.75rem;}
                .resident-agent-btn:hover { background: currentColor; color: #000 !important; }
                
                .widget-content-area { display: flex; flex-direction: row; position: relative; }
                .omni-widget-body { flex: 1; padding: 0; position: relative; overflow: hidden; transition: width 0.3s;}
                
                /* PANEL DE CHAT DEL WIDGET */
                .widget-chat-panel { width: 0; background: rgba(5,5,8,0.95); border-left: 1px dashed #333; display: flex; flex-direction: column; transition: width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); overflow: hidden; }
                .widget-chat-panel.open { width: 380px; }
                .widget-chat-history { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; font-family: var(--font-main); font-size: 0.9rem;}
                .chat-bubble { padding: 12px; border-radius: 8px; max-width: 90%; line-height: 1.4; word-break: break-word;}
                .chat-bubble.ai { background: rgba(255,255,255,0.05); color: #ddd; align-self: flex-start; border-top-left-radius: 0; border: 1px solid #333;}
                .chat-bubble.user { background: rgba(0,176,255,0.1); color: var(--accent-blue); align-self: flex-end; border-top-right-radius: 0; border: 1px solid rgba(0,176,255,0.3);}
                .widget-chat-input-area { padding: 10px; border-top: 1px solid #333; display: flex; gap: 5px; background: #000;}
                .widget-chat-input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid #444; color: white; padding: 8px 12px; border-radius: 8px; font-size: 0.85rem; outline: none; font-family: var(--font-main);}
                .widget-chat-input:focus { border-color: var(--accent-blue); }
                .widget-chat-send { background: var(--accent-blue); color: black; border: none; border-radius: 8px; padding: 0 12px; font-weight: bold; cursor: pointer;}
                
                /* 🔥 BOTONES DE ACCIÓN A2A DENTRO DEL CHAT */
                .btn-ai-action { display: block; width: 100%; margin-top: 10px; background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 900; font-size: 0.8rem; cursor: pointer; text-transform: uppercase; box-shadow: 0 5px 15px rgba(224,64,251,0.3); transition: 0.2s;}
                .btn-ai-action:hover { filter: brightness(1.2); transform: translateY(-2px);}

                /* MINI CONSOLAS INTERACTIVAS */
                .inline-console { padding: 1.5rem; display: flex; flex-direction: column; gap: 10px; background: rgba(0,0,0,0.4); }
                .inline-input { background: rgba(0,0,0,0.6); border: 1px solid #444; color: white; padding: 10px 15px; border-radius: 8px; font-family: var(--font-main); font-size: 0.95rem; outline: none; width: 100%; box-sizing: border-box;}
                .inline-input:focus { border-color: var(--accent-blue); }
                .inline-btn { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 900; cursor: pointer; transition: 0.3s; margin-top: 10px;}
                .inline-btn:hover:not(:disabled) { filter: brightness(1.2); }
                .inline-btn:disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(1); }
                .inline-success { color: var(--accent-green); font-weight: bold; padding: 1rem; text-align: center; background: rgba(0,230,118,0.1); border-top: 1px solid rgba(0,230,118,0.3);}

                /* UX DELUXE: MENÚ AUTOCOMPLETADO FLOTANTE */
                .semantic-menu { position: fixed; background: rgba(10,10,15,0.98); border: 1px solid rgba(255,255,255,0.1); border-top: 3px solid var(--accent-blue); border-radius: 16px; max-height: 350px; overflow-y: auto; display: none; z-index: 9999; box-shadow: 0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(0,176,255,0.15); backdrop-filter: blur(20px); padding: 8px 0; min-width: 320px; animation: popIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); transform-origin: top left;}
                .semantic-item { padding: 12px 20px; color: white; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 15px; font-size: 0.95rem; font-family: var(--font-main); border-left: 2px solid transparent;}
                .semantic-item:hover, .semantic-item.selected { background: rgba(255,255,255,0.05); border-left-color: var(--accent-blue);}
                .semantic-item.type-mention:hover { border-left-color: var(--accent-blue); background: rgba(0,176,255,0.1); }
                .semantic-item.type-meme:hover { border-left-color: var(--accent-purple); background: rgba(224,64,251,0.1); }
                .semantic-item.type-widget:hover { border-left-color: var(--accent-orange); background: rgba(255,171,64,0.1); }
                .semantic-item.type-action:hover { border-left-color: var(--accent-green); background: rgba(0,230,118,0.1); }
                .semantic-badge { background: rgba(255,255,255,0.1); padding: 3px 8px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); margin-left: auto; font-weight:bold;}

                /* HIGHLIGHTS (LINKS) */
                .mention-highlight { color: var(--accent-blue); font-weight: bold; background: rgba(0,176,255,0.1); padding: 2px 6px; border-radius: 6px; font-family: var(--font-mono); font-size: 1rem; cursor: pointer; transition: 0.2s; text-decoration: none;}
                .mention-highlight:hover { background: var(--accent-blue); color: black; box-shadow: 0 0 15px rgba(0,176,255,0.4);}
                .meme-highlight { color: var(--accent-purple); font-weight: bold; background: rgba(224,64,251,0.1); padding: 2px 6px; border-radius: 6px; font-family: var(--font-mono); font-size: 1rem; cursor: pointer; transition: 0.2s; text-decoration: none;}
                .meme-highlight:hover { background: var(--accent-purple); color: white; box-shadow: 0 0 15px rgba(224,64,251,0.4);}

                /* HILO DE CONVERSACIÓN (USENET LOGS) */
                .thread-container { margin-top: 2rem; border-top: 1px solid var(--glass-border); padding-top: 2rem; display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 6rem;}
                .thread-title { color: #888; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: flex; justify-content: space-between;}
                .log-bubble { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 16px; position: relative; transition:0.3s;}
                .log-bubble.ai-reply { border-left: 4px solid var(--accent-purple); background: rgba(224,64,251,0.05); }
                .log-bubble.human-reply { border-left: 4px solid var(--accent-blue); }
                .log-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;}
                .log-author { font-weight: 900; color: white; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;}
                .log-time { font-size: 0.75rem; color: #666; font-family: var(--font-mono);}
                .log-content { color: #ccc; line-height: 1.6; font-family: 'Georgia', serif; font-size: 1.05rem; white-space: pre-wrap; word-break: break-word;}
                .log-content img, .log-content video { max-width: 100%; border-radius: 8px; border: 1px solid #333; margin-top: 10px; }

                /* BOTONES DE ACCIÓN INFERIOR */
                .action-bar-fixed { position: fixed; bottom: 30px; right: 30px; display: flex; gap: 15px; z-index: 1000;}
                .btn-action-pow { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 16px 30px; border-radius: 30px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 10px 30px rgba(0, 176, 255, 0.3);}
                .btn-action-pow:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(224, 64, 251, 0.5); filter: brightness(1.1);}
                
                .btn-action-draft { background: rgba(255,171,64,0.1); border: 1px solid var(--accent-orange); color: var(--accent-orange); padding: 16px 30px; border-radius: 30px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(10px);}
                .btn-action-draft:hover { background: var(--accent-orange); color: black; box-shadow: 0 10px 30px rgba(255, 171, 64, 0.4); transform: translateY(-3px);}

                @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

                @media (max-width: 768px) {
                    .workspace-paper { padding: 90px 1rem 120px 1rem; }
                    .breadcrumb-bar { flex-direction: column; align-items: stretch; border-radius: 12px; border-bottom: 1px solid var(--glass-border); margin-bottom: 10px;}
                    .live-context-bar { border-radius: 12px; }
                    .bc-separator { display: none; }
                    .action-bar-fixed { bottom: 80px; right: 20px; left: 20px; justify-content: space-between; gap:10px; }
                    .btn-action-pow, .btn-action-draft { width: 100%; padding: 14px 10px; font-size: 0.95rem; text-align: center; justify-content:center;}
                    .widget-chat-panel.open { width: 100%; position: absolute; height: 100%; z-index: 10;}
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

                        <div class="editor-wrapper">
                            <div id="semanticEditor" class="semantic-editor" contenteditable="true" data-placeholder="El lienzo está en blanco.\n\nEscribe tu Proof of Work o empieza a redactar un Borrador (Draft).\n\nUsa @ para invocar a la Colla.\nUsa # para buscar Memes/SOPs del Cerebro LMS.\nUsa / para inyectar Componentes (/meme, /mapa, /kanban, /ledger...)."><p><br></p></div>
                        </div>

                        <div class="thread-container" id="threadWrapper" style="display:none;">
                            <div class="thread-title">
                                <span>📡 Historial Usenet (Pings)</span>
                                <span id="threadCount" style="color:var(--accent-blue);">0 Logs</span>
                            </div>
                            <div id="threadList"></div>
                        </div>

                    </div>
                    
                    <div class="action-bar-fixed">
                        <button class="btn-action-draft" id="btnConvertDraft">🚀 Convertir en Work Order</button>
                        <button class="btn-action-pow" id="btnSubmitReport" style="display:none;">⚖️ Enviar a Usenet (Sellar)</button>
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
            editor: document.getElementById('semanticEditor'),
            menu: document.getElementById('semanticMenu'),
            threadWrapper: document.getElementById('threadWrapper'),
            threadList: document.getElementById('threadList'),
            threadCount: document.getElementById('threadCount'),
            btnSubmit: document.getElementById('btnSubmitReport'),
            btnConvertDraft: document.getElementById('btnConvertDraft')
        };

        this.dom.editor.focus();

        this.loadProjectTasks = (projId) => {
            const p = state.projects.find(x => x.id === projId);
            if (!p) return;
            
            let tasks = [];
            const tasksSource = p.work_orders && p.work_orders.length > 0 ? p.work_orders : (p.transactions || []);
            
            if (state.session.role === 'ecosystem-owner' || p.ownerId === activeUserId) {
                tasks = tasksSource.filter(tx => tx.status === 'pinged');
            } else {
                tasks = tasksSource.filter(tx => tx.status === 'pinged' && tx.assigneeId === activeUserId);
            }

            let selectHtml = `<option value="draft">📝 Borrador Libre (Draft Mode)</option>`;
            if (tasks.length > 0) {
                selectHtml += `<optgroup label="🎯 Tareas en Curso">`;
                tasks.forEach(t => {
                    const roleFrom = p.roles.find(r => r.id === t.from);
                    let resolvedName = t.entregable || t.template;
                    if (!resolvedName && t.flowId) {
                        const parentFlow = (p.vna_flows || []).find(f => f.id === t.flowId);
                        if (parentFlow) resolvedName = parentFlow.template || parentFlow.entregable;
                    }
                    selectHtml += `<option value="${t.id || t.hash}">[${roleFrom ? roleFrom.name : 'VNA'}] ${resolvedName || 'Work Order'}</option>`;
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
                const p = state.projects.find(x => x.id === this.activeProjectId);
                this.activeTx = (p.work_orders || p.transactions || []).find(t => (t.id || t.hash) === val);
                this.setTaskMode();
            }
        });

        this.setupSemanticEditor();

        this.dom.btnSubmit.addEventListener('click', () => this.submitReport());
        this.dom.btnConvertDraft.addEventListener('click', () => this.convertDraftToTask());
        
        this.dom.editor.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-inline-action')) {
                await this.handleInlineConsoleAction(e.target);
            }
            // Toggle Chat de Widgets
            if (e.target.closest('.resident-agent-btn')) {
                const btn = e.target.closest('.resident-agent-btn');
                const widgetId = btn.dataset.wid;
                const chatPanel = document.getElementById(`chat_panel_${widgetId}`);
                if (chatPanel) chatPanel.classList.toggle('open');
            }
            // Enviar mensaje en Chat de Widget
            if (e.target.classList.contains('widget-chat-send')) {
                await this.handleWidgetChat(e.target);
            }
            // 🔥 Botón de Acción Automática (Inyección A2A)
            if (e.target.classList.contains('btn-ai-action')) {
                await this.executeAiDatabaseAction(e.target);
            }
        });
        
        // Soporte para Enter en los inputs de chat
        this.dom.editor.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('widget-chat-input')) {
                e.preventDefault();
                const sendBtn = e.target.nextElementSibling;
                if(sendBtn) await this.handleWidgetChat(sendBtn);
            }
        });
    }

    setDraftMode() {
        this.dom.threadWrapper.style.display = 'none';
        this.dom.btnSubmit.style.display = 'none';
        this.dom.btnConvertDraft.style.display = 'block';
    }

    setTaskMode() {
        if (!this.activeTx) return;
        this.dom.threadWrapper.style.display = 'flex';
        this.dom.btnSubmit.style.display = 'block';
        this.dom.btnConvertDraft.style.display = 'none';

        const state = store.getState();
        const p = state.projects.find(x => x.id === this.activeTx.projectId);
        this.renderThread(p);
    }

    renderThread(project) {
        if (!project || !project.logs || !this.activeTx) return;
        const activeHash = this.activeTx.id || this.activeTx.hash;
        const thread = project.logs.filter(l => l.relatedTxHash === activeHash).sort((a,b) => a.date - b.date);
        
        this.dom.threadCount.innerText = `${thread.length} Mensajes`;

        if (thread.length === 0) {
            this.dom.threadList.innerHTML = `<div style="text-align:center; color:#555; font-style:italic; padding: 2rem;">El historial de la Usenet está limpio para esta tarea.</div>`;
            return;
        }

        const state = store.getState();
        let html = '';
        
        thread.forEach(log => {
            const user = state.globalUsers.find(u => u.id === log.authorId);
            const isAi = user?.profile?.isAi;
            const authorName = user ? user.name : log.authorId;
            const authorIcon = isAi ? '🤖' : '👤';
            const timeStr = new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
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
        this.hydrateWidgetsInDOM(this.dom.threadList, project);
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
            containerElement.querySelectorAll('[id^="ledger_"]').forEach(container => {
                if (project) {
                    const lr = new LedgerRenderer(container, { projectId: project.id, showHistory: false });
                    lr.render();
                }
            });
            containerElement.querySelectorAll('[id^="sandbox_"]').forEach(container => {
                const sr = new SandboxRenderer(container);
                sr.render();
            });
        }, 100);
        setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);
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
                    
                    <div style="padding: 5px 15px; font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #333; margin-bottom: 5px; margin-top: 10px;">Forjar Estructura</div>
                    <div class="semantic-item type-action" data-val="/meme" data-type="action"><span style="font-size:1.5rem;">🧠</span> <div><b style="color:var(--accent-purple);">Forjar Meme W3C</b><br><span style="font-size:0.75rem;color:#888;">Crea conocimiento en el LMS.</span></div></div>
                    <div class="semantic-item type-action" data-val="/agente" data-type="action"><span style="font-size:1.5rem;">👤</span> <div><b style="color:var(--accent-green);">Añadir Nodo / Agente</b><br><span style="font-size:0.75rem;color:#888;">Registra talento en el Padrón.</span></div></div>
                    <div class="semantic-item type-action" data-val="/rol" data-type="action"><span style="font-size:1.5rem;">🪑</span> <div><b style="color:var(--accent-green);">Forjar Rol VNA (Silla)</b><br><span style="font-size:0.75rem;color:#888;">Añade un rol al ecosistema.</span></div></div>
                    <div class="semantic-item type-action" data-val="/tuberia" data-type="action"><span style="font-size:1.5rem;">🛤️</span> <div><b style="color:var(--accent-green);">Trazar Tubería (SOP)</b><br><span style="font-size:0.75rem;color:#888;">Define una entrega de valor.</span></div></div>

                    <div style="padding: 10px 15px 5px 15px; font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #333; margin-bottom: 5px; margin-top: 10px;">Generación Multimodal</div>
                    <div class="semantic-item type-action" data-val="/imagen" data-type="action"><span style="font-size:1.5rem;">🍌</span> <div><b style="color:var(--accent-green);">Generar Imagen (Nano Banana 2)</b><br><span style="font-size:0.75rem;color:#888;">Renderiza un asset visual con IA.</span></div></div>
                    <div class="semantic-item type-action" data-val="/video" data-type="action"><span style="font-size:1.5rem;">🎬</span> <div><b style="color:var(--accent-orange);">Generar Vídeo (Veo)</b><br><span style="font-size:0.75rem;color:#888;">Composición de vídeo generativo.</span></div></div>
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
                    
                    if (replaceVal === '/meme') {
                        el.innerHTML = `
                            <div class="omni-widget" contenteditable="false" id="${widgetId}">
                                <div class="omni-widget-header" style="background: rgba(224, 64, 251, 0.1); border-bottom-color: rgba(224, 64, 251, 0.2); color: var(--accent-purple);">🧠 Forjar Meme W3C</div>
                                <div class="inline-console">
                                    <div style="display:flex; gap:10px;">
                                        <select class="inline-input" id="meme_cat_${widgetId}" style="flex:1;">
                                            <option value="RULE">RULE (Regla general)</option>
                                            <option value="SOP">SOP (Procedimiento)</option>
                                            <option value="SOC">SOC (Criterio Auditoría)</option>
                                        </select>
                                        <input type="text" class="inline-input" id="meme_title_${widgetId}" placeholder="Título del concepto..." style="flex:3;">
                                    </div>
                                    <textarea class="inline-input" id="meme_content_${widgetId}" placeholder="Desarrollo del conocimiento..." rows="3"></textarea>
                                    <button class="inline-btn btn-inline-action" data-action="create-meme" data-wid="${widgetId}">Inyectar en el Cerebro LMS</button>
                                </div>
                            </div><p><br></p>
                        `;
                    } else if (replaceVal === '/imagen') {
                        el.innerHTML = `
                            <div class="omni-widget" contenteditable="false" id="${widgetId}">
                                <div class="omni-widget-header" style="background: rgba(0, 230, 118, 0.1); border-bottom-color: rgba(0, 230, 118, 0.2); color: var(--accent-green);">🍌 Generador Visual (Nano Banana 2)</div>
                                <div class="inline-console">
                                    <textarea class="inline-input" id="prompt_img_${widgetId}" placeholder="Describe la imagen con el máximo detalle..." rows="3"></textarea>
                                    <button class="inline-btn btn-inline-action" data-action="generate-image" data-wid="${widgetId}">🎨 Sintetizar Imagen</button>
                                </div>
                            </div><p><br></p>
                        `;
                    } else if (replaceVal === '/video') {
                        el.innerHTML = `
                            <div class="omni-widget" contenteditable="false" id="${widgetId}">
                                <div class="omni-widget-header" style="background: rgba(255, 171, 64, 0.1); border-bottom-color: rgba(255, 171, 64, 0.2); color: var(--accent-orange);">🎬 Generador de Movimiento (Veo)</div>
                                <div class="inline-console">
                                    <textarea class="inline-input" id="prompt_vid_${widgetId}" placeholder="Describe la escena, movimiento y estilo cinemático..." rows="3"></textarea>
                                    <button class="inline-btn btn-inline-action" data-action="generate-video" data-wid="${widgetId}" style="background: linear-gradient(135deg, var(--accent-orange), var(--accent-red));">🎥 Renderizar Vídeo</button>
                                </div>
                            </div><p><br></p>
                        `;
                    } else if (replaceVal === '/agente') {
                        el.innerHTML = `
                            <div class="omni-widget" contenteditable="false" id="${widgetId}">
                                <div class="omni-widget-header" style="background: rgba(0, 230, 118, 0.1); border-bottom-color: rgba(0, 230, 118, 0.2); color: var(--accent-green);">🤖 Forjar Nodo / Agente</div>
                                <div class="inline-console">
                                    <input type="text" class="inline-input" id="agent_id_${widgetId}" placeholder="Alias del Nodo (ej: @cyber_monk)">
                                    <input type="text" class="inline-input" id="agent_name_${widgetId}" placeholder="Nombre Completo (ej: Agente Auditor)">
                                    <select class="inline-input" id="agent_isai_${widgetId}">
                                        <option value="true">Es una Inteligencia Artificial (A2A)</option>
                                        <option value="false">Es un Humano</option>
                                    </select>
                                    <button class="inline-btn btn-inline-action" data-action="create-agent" data-wid="${widgetId}">Añadir al Padrón Global</button>
                                </div>
                            </div><p><br></p>
                        `;
                    } else if (replaceVal === '/rol') {
                        el.innerHTML = `
                            <div class="omni-widget" contenteditable="false" id="${widgetId}">
                                <div class="omni-widget-header" style="background: rgba(0, 176, 255, 0.1); border-bottom-color: rgba(0, 176, 255, 0.2); color: var(--accent-blue);">🪑 Forjar Silla (Rol VNA)</div>
                                <div class="inline-console">
                                    <select class="inline-input" id="role_level_${widgetId}">
                                        <option value="@anxaneta">@anxaneta (Cúspide / Dirección)</option>
                                        <option value="@aixecador">@aixecador (Estrategia)</option>
                                        <option value="@dosos">@dosos (Auditoría / Review)</option>
                                        <option value="@baixos" selected>@baixos (Producción Core)</option>
                                        <option value="@pinya">@pinya (Soporte / Infra)</option>
                                    </select>
                                    <input type="text" class="inline-input" id="role_name_${widgetId}" placeholder="Nombre del Rol (ej: Especialista en DevOps)">
                                    <input type="number" class="inline-input" id="role_fmv_${widgetId}" placeholder="Valor de Mercado (FMV €/h, ej: 45)" value="40">
                                    <button class="inline-btn btn-inline-action" data-action="create-role" data-wid="${widgetId}">Inyectar Rol en el Ecosistema</button>
                                </div>
                            </div><p><br></p>
                        `;
                    } else if (replaceVal === '/tuberia') {
                        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
                        let roleOptions = '';
                        if (p && p.roles && p.roles.length > 0) {
                            p.roles.forEach(r => { roleOptions += `<option value="${r.id}">[${r.levelId}] ${r.name}</option>`; });
                        } else {
                            roleOptions = `<option value="">Sin Ecosistema activo o sin roles</option>`;
                        }
                        
                        el.innerHTML = `
                            <div class="omni-widget" contenteditable="false" id="${widgetId}">
                                <div class="omni-widget-header" style="background: rgba(224, 64, 251, 0.1); border-bottom-color: rgba(224, 64, 251, 0.2); color: var(--accent-purple);">🛤️ Trazar Tubería de Valor (SOP)</div>
                                <div class="inline-console">
                                    <input type="text" class="inline-input" id="flow_name_${widgetId}" placeholder="Nombre del Entregable (ej: Refactor Componente UI)">
                                    <div style="display:flex; gap:10px;">
                                        <select class="inline-input" id="flow_from_${widgetId}" title="De (Rol Origen)">${roleOptions}</select>
                                        <span style="color:#666; font-size:1.5rem; align-self:center;">&rarr;</span>
                                        <select class="inline-input" id="flow_to_${widgetId}" title="A (Rol Destino)">${roleOptions}</select>
                                    </div>
                                    <div style="display:flex; gap:10px;">
                                        <input type="number" class="inline-input" id="flow_hours_${widgetId}" placeholder="Horas Est." value="4">
                                        <select class="inline-input" id="flow_type_${widgetId}">
                                            <option value="tangible">🟢 Tangible (Código, Diseño)</option>
                                            <option value="intangible">🟣 Intangible (Auditoría, Soporte)</option>
                                        </select>
                                    </div>
                                    <button class="inline-btn btn-inline-action" data-action="create-flow" data-wid="${widgetId}">Trazar Tubería en Mapa</button>
                                </div>
                            </div><p><br></p>
                        `;
                    } 
                    // 🔥 LOS WIDGETS HABITADOS
                    else if (replaceVal === '/mapa') {
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
                    const el = document.createElement('a');
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
                    
                    <div class="widget-chat-panel" id="chat_panel_${widgetId}">
                        <div class="widget-chat-history" id="chat_history_${widgetId}">
                            <div class="chat-bubble ai">Saludos. Soy ${agentId}. Estoy analizando los datos de este componente en tiempo real. ¿En qué te ayudo?</div>
                        </div>
                        <div class="widget-chat-input-area">
                            <input type="text" class="widget-chat-input" id="chat_input_${widgetId}" placeholder="Pregunta a ${agentId}...">
                            <button class="widget-chat-send" data-agent="${agentId}" data-wid="${widgetId}">➤</button>
                        </div>
                    </div>
                </div>
            </div><p><br></p>
        `;
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
    // 🔥 MAGIA A2A: CHAT Y EJECUCIÓN AUTÓNOMA
    // ==========================================
    async handleWidgetChat(btnElement) {
        const widgetId = btnElement.dataset.wid;
        const agentId = btnElement.dataset.agent;
        const inputEl = document.getElementById(`chat_input_${widgetId}`);
        const historyEl = document.getElementById(`chat_history_${widgetId}`);
        
        const userMsg = inputEl.value.trim();
        if (!userMsg) return;

        inputEl.value = '';
        historyEl.innerHTML += `<div class="chat-bubble user">${userMsg}</div>`;
        historyEl.scrollTop = historyEl.scrollHeight;
        
        const loadingId = 'load_' + Date.now();
        historyEl.innerHTML += `<div class="chat-bubble ai" id="${loadingId}">...</div>`;
        historyEl.scrollTop = historyEl.scrollHeight;

        try {
            const state = store.getState();
            const project = state.projects.find(p => p.id === this.activeProjectId);
            
            let componentData = "No hay datos para este componente.";
            if (agentId === '@genesi_ai') componentData = JSON.stringify({ roles: project?.roles, tuberias: project?.vna_flows }, null, 2);
            if (agentId === '@cap_de_colla') componentData = JSON.stringify({ oportunidades: project?.work_orders.filter(w => w.status === 'pinged') }, null, 2);
            if (agentId === '@notari_ledger') componentData = JSON.stringify({ capTable: project?.ledger }, null, 2);
            
            if (agentId === '@mestre_escola') {
                await KB.init();
                const allData = await KB.getAllNodes();
                componentData = "Catálogo de Memes actuales: \n" + allData.map(n => `ID: ${n.id} | Tipo: ${n.type} | Título: ${n.title}`).join('\n');
            }

            const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
            const apiKey = localStorage.getItem(`tt_key_${provider}`);
            
            const agentContext = await KB.getDynamicContextPrompt('global', agentId, state);
            
            // 🔥 INSTRUCCIÓN DE FUNCTION CALLING (ROOT PERMISSIONS)
            const systemPrompt = `
                ${agentContext}
                ===============================
                ESTADO ACTUAL DEL COMPONENTE:
                ===============================
                ${componentData}
                
                Instrucción: Eres ${agentId}. Responde a la duda del usuario de forma analítica. 
                🚨 REGLA DE SISTEMA MUY IMPORTANTE: Tienes permisos ROOT para modificar el sistema. Si el usuario te pide EXPLÍCITAMENTE modificar, actualizar o crear el System Prompt de un agente o el texto de un Meme, DEBES hacer dos cosas:
                1. Explica brevemente los cambios que vas a hacer.
                2. Al final exacto de tu respuesta, INYECTA UN BLOQUE JSON PURO (sin markdown, sin comillas invertidas) con este formato exacto:
                {"action": "UPDATE_NODE", "nodeId": "aqui_el_id_del_nodo_a_modificar", "content": "Aquí todo el texto nuevo completo..."}
            `;

            const response = await Orchestrator.callLLM({ provider, apiKey, systemPrompt, userPrompt: userMsg, responseFormat: "text", temperature: 0.4 });
            
            let rawResponse = response.content;
            let actionBlock = null;

            // Extraemos el JSON incluso si el LLM rebelde le pone Markdown
            const jsonMatch = rawResponse.match(/\{[\s\S]*"action"\s*:\s*"UPDATE_NODE"[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    actionBlock = JSON.parse(jsonMatch[0]);
                    rawResponse = rawResponse.replace(jsonMatch[0], ''); // Limpiamos el texto principal
                } catch (e) { console.warn("Fallo al parsear JSON de acción de la IA", e); }
            }

            const bubbleEl = document.getElementById(loadingId);
            bubbleEl.innerText = rawResponse.trim();
            
            // 🔥 PREVISUALIZACIÓN Y BOTÓN MÁGICO (El Arquitecto Audita y Edita)
            if (actionBlock && actionBlock.action === 'UPDATE_NODE') {
                const btnId = 'action_' + Date.now();
                const textareaId = 'edit_' + btnId;
                
                bubbleEl.innerHTML += `
                    <div style="margin-top: 10px; background: rgba(0,0,0,0.8); border: 1px solid var(--accent-purple); border-radius: 8px; padding: 10px; font-size: 0.8rem;">
                        <div style="color: var(--accent-purple); font-weight: bold; margin-bottom: 5px; text-transform: uppercase;">📝 Previsualización (Editable) - Nodo: ${actionBlock.nodeId}</div>
                        <textarea id="${textareaId}" style="width: 100%; min-height: 120px; background: rgba(0,0,0,0.5); color: #ccc; border: 1px dashed #555; border-radius: 8px; padding: 10px; font-family: monospace; resize: vertical; margin-bottom: 10px; outline: none;">${actionBlock.content}</textarea>
                        <button class="btn-ai-action" id="${btnId}" data-nodeid="${actionBlock.nodeId}" data-textid="${textareaId}">
                            💾 Confirmar Inyección en el Kernel
                        </button>
                    </div>
                `;
            }

            historyEl.scrollTop = historyEl.scrollHeight;
            
        } catch (e) {
            document.getElementById(loadingId).innerText = `[Error de Conexión: ${e.message}]`;
            document.getElementById(loadingId).style.color = "var(--accent-red)";
        }
    }

    // Ejecuta la orden cuando el humano pulsa el botón mágico en el chat
    async executeAiDatabaseAction(btnElement) {
        const nodeId = btnElement.dataset.nodeid;
        const textareaId = btnElement.dataset.textid;
        const textareaEl = document.getElementById(textareaId);
        
        if (!textareaEl) return alert("Error: No se encuentra el editor de contenido.");
        const newContent = textareaEl.value.trim();
        
        btnElement.disabled = true;
        btnElement.innerText = "⏳ Escribiendo en el LMS...";

        try {
            await KB.init();
            const existingNode = await KB.getNode(nodeId);
            
            if (existingNode) {
                existingNode.content = newContent;
                existingNode.lastUpdated = Date.now();
                await KB.saveNode(existingNode);
            } else {
                await KB.saveNode({
                    id: nodeId,
                    type: 'meme',
                    category: 'auto_generated',
                    projectId: 'global',
                    targetId: 'global',
                    title: `Concepto Forjado por IA`,
                    content: newContent,
                    keywords: ['#ai_generated']
                });
            }

            btnElement.style.background = "var(--accent-green)";
            btnElement.innerText = "✅ Mutación Sellada Exitosamente";
            textareaEl.readOnly = true;
            textareaEl.style.borderColor = "var(--accent-green)";
            
        } catch (error) {
            btnElement.style.background = "var(--accent-red)";
            btnElement.innerText = "❌ Fallo al Escribir";
            alert(`Error de escritura: ${error.message}`);
        }
    }

    // ==========================================
    // DELEGACIÓN DE EVENTOS (INLINE CONSOLES)
    // ==========================================
    async handleInlineConsoleAction(btnElement) {
        const action = btnElement.dataset.action;
        const wid = btnElement.dataset.wid;
        const widgetContainer = document.getElementById(wid);
        if (!widgetContainer) return;

        try {
            if (action === 'generate-image' || action === 'generate-video') {
                const isVideo = action === 'generate-video';
                const promptInput = document.getElementById(isVideo ? `prompt_vid_${wid}` : `prompt_img_${wid}`);
                const promptText = promptInput.value.trim();
                
                if (!promptText) throw new Error("Debes escribir un prompt para generar el asset.");

                btnElement.disabled = true;
                btnElement.innerText = "⏳ Sintetizando con IA...";

                const apiKey = localStorage.getItem(isVideo ? 'tt_key_veo' : 'tt_key_nano_banana');

                const { Orchestrator } = await import('../core/Orchestrator.js');
                const asset = await Orchestrator.generateAsset(promptText, isVideo ? 'video' : 'image', apiKey);
                
                if (isVideo) {
                    widgetContainer.innerHTML = `
                        <div style="padding: 15px; background: #000; text-align:center;">
                            <video src="${asset.url}" controls autoplay loop style="max-width: 100%; border-radius: 8px; border: 1px solid #333; box-shadow: 0 5px 15px rgba(0,0,0,0.5);"></video>
                            <div style="color: #888; font-size: 0.75rem; margin-top: 10px; font-family: monospace; background:rgba(255,255,255,0.05); padding:8px; border-radius:6px;">Prompt: "${promptText}"</div>
                        </div>
                    `;
                } else {
                    widgetContainer.innerHTML = `
                        <div style="padding: 15px; background: #000; text-align:center;">
                            <img src="${asset.url}" style="max-width: 100%; border-radius: 8px; border: 1px solid #333; box-shadow: 0 5px 15px rgba(0,0,0,0.5);" alt="${promptText}">
                            <div style="color: #888; font-size: 0.75rem; margin-top: 10px; font-family: monospace; background:rgba(255,255,255,0.05); padding:8px; border-radius:6px;">Prompt: "${promptText}"</div>
                        </div>
                    `;
                }
            }
            else if (action === 'create-meme') {
                const cat = document.getElementById(`meme_cat_${wid}`).value;
                const title = document.getElementById(`meme_title_${wid}`).value.trim();
                const content = document.getElementById(`meme_content_${wid}`).value.trim();
                
                if (!title || !content) throw new Error("Título y Contenido son obligatorios.");

                await KB.init();
                const targetProject = this.activeProjectId || 'global';
                
                await KB.saveNode({
                    id: `meme_${Date.now()}`, type: 'meme', category: cat,
                    projectId: targetProject, targetId: 'global',
                    title: title, content: content, keywords: []
                });
                widgetContainer.innerHTML = `<div class="inline-success">✅ Concepto [${title}] forjado en el Ecosistema local.</div>`;
            }
            else if (action === 'create-agent') {
                let id = document.getElementById(`agent_id_${wid}`).value.trim();
                const name = document.getElementById(`agent_name_${wid}`).value.trim();
                const isAi = document.getElementById(`agent_isai_${wid}`).value === 'true';
                
                if (!id || !name) throw new Error("Alias y Nombre son obligatorios.");
                if (!id.startsWith('@')) id = '@' + id; 

                await store.dispatch({ 
                    type: 'ADD_USER', 
                    payload: {
                        id: id, name: name, globalRole: isAi ? 'ai-agent' : 'network-user',
                        profile: { isAi: isAi, preferredEngine: 'deepseek', guardian: 'everyman' }
                    } 
                });
                widgetContainer.innerHTML = `<div class="inline-success">✅ Nodo ${id} inscrito en el Padrón Global.</div>`;
            } 
            else if (action === 'create-role') {
                if (!this.activeProjectId) throw new Error("No hay proyecto activo.");
                
                const level = document.getElementById(`role_level_${wid}`).value;
                const name = document.getElementById(`role_name_${wid}`).value.trim();
                const fmv = parseFloat(document.getElementById(`role_fmv_${wid}`).value) || 40;
                if (!name) throw new Error("Nombre del rol obligatorio.");

                const multipliers = { '@anxaneta': 3.0, '@aixecador': 2.0, '@dosos': 1.5, '@baixos': 1.2, '@pinya': 1.0 };
                const newRole = { id: 'role_' + Date.now(), levelId: level, name: name, fmv: fmv, multiplier: multipliers[level] || 1.0 };

                await store.dispatch({
                    type: 'UPDATE_PROJECT_INFO',
                    payload: { projectId: this.activeProjectId, updates: { roles: [...store.getState().projects.find(p=>p.id===this.activeProjectId).roles, newRole] } }
                });
                widgetContainer.innerHTML = `<div class="inline-success">✅ Silla ${name} (${level}) forjada en el Ecosistema.</div>`;
            }
            else if (action === 'create-flow') {
                if (!this.activeProjectId) throw new Error("No hay proyecto activo.");
                
                const name = document.getElementById(`flow_name_${wid}`).value.trim();
                const from = document.getElementById(`flow_from_${wid}`).value;
                const to = document.getElementById(`flow_to_${wid}`).value;
                const hours = parseFloat(document.getElementById(`flow_hours_${wid}`).value) || 4;
                const type = document.getElementById(`flow_type_${wid}`).value;

                if (!name || !from || !to) throw new Error("Faltan datos de la Tubería.");

                await store.dispatch({
                    type: 'ADD_FLOW',
                    payload: {
                        projectId: this.activeProjectId,
                        flow: {
                            id: 'flow_' + Date.now(),
                            template: name, from: from, to: to, estimatedHours: hours, tipo: type,
                            soc_checklist: [], required_skills: []
                        }
                    }
                });
                widgetContainer.innerHTML = `<div class="inline-success">✅ Tubería [${name}] trazada en el Mapa VNA.</div>`;
            }
        } catch (e) {
            alert(e.message);
        }
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

    async submitReport() {
        if (!this.activeTx) return;
        
        const htmlContent = this.dom.editor.innerHTML.trim();
        const textContent = this.dom.editor.innerText.trim(); 

        if (!textContent && htmlContent === '<p><br></p>') return alert("⚠️ No puedes enviar un mensaje vacío a la Usenet.");

        this.dom.btnSubmit.disabled = true;
        this.dom.btnSubmit.innerText = '⏳ Sellando en la Usenet...';
        
        const activeHash = this.activeTx.id || this.activeTx.hash;
        const mentions = [];
        const words = textContent.split(/\s/);
        words.forEach(w => {
            if (w.startsWith('@') && w.length > 1) mentions.push(w);
        });

        await store.dispatch({
            type: 'ADD_LOG_ENTRY',
            payload: {
                projectId: this.activeTx.projectId,
                log: {
                    id: 'log_' + Date.now(),
                    date: Date.now(),
                    authorId: store.getState().session.activeUserId,
                    relatedTxHash: activeHash,
                    content: htmlContent, 
                    mentions: mentions, 
                    readBy: []
                }
            }
        });

        this.dom.editor.innerHTML = '<p><br></p>';
        this.dom.dynamicTags.innerHTML = `<span style="color:#555; font-style:italic; font-size:0.85rem;">Escribe @ o # para enlazar el conocimiento...</span>`;
        this.setTaskMode(); 
        this.dom.btnSubmit.disabled = false;
        this.dom.btnSubmit.innerText = '⚖️ Enviar a Usenet (Sellar)';
    }
}
