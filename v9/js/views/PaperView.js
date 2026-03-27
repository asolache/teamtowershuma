// v9/js/views/PaperView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js'; 
import { PageHeader } from '../components/PageHeader.js';
import { Orchestrator } from '../core/Orchestrator.js'; 
import { SandboxRenderer } from '../components/SandboxRenderer.js'; 

export default class PaperView {
    constructor() {
        document.title = "Omni-Paper | TeamTowers V9";
        this.woHash = new URLSearchParams(window.location.search).get('hash');
        this.activeTx = null; 
        this.activeProjectId = null;
        this.isMenuOpen = false;
        
        this.pomodoroInterval = null;
        this.pomodoroSeconds = 0;
        this.isPomodoroRunning = false;
        
        this.sandbox = null;
        this.chatHistory = []; // Swarm Memory
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

        if (!project) return `<div class="app-layout">${Sidebar.getHtml('/paper')}<main class="workspace" style="justify-content:center; align-items:center;"><div class="glass-panel" style="text-align:center;"><h2 style="color:white;">Sin Red Asignada</h2></div></main></div>`;

        const headerConfig = {
            title: "Omni-Paper (Chat IDE & GTD)",
            subtitle: project.nombre,
            tagline: "Lienzo Universal: Ejecuta Tareas o interactúa con el Enjambre para generar código, documentos o mutar agentes.",
            tabs: []
        };

        let agentOptions = '';
        const aiUsers = state.globalUsers.filter(u => u.profile?.isAi);
        
        const deployer = aiUsers.find(a => a.id === '@agent_web_deployer');
        if (deployer) agentOptions += `<option value="${deployer.id}">🤖 ${deployer.name} (Frontend & UI)</option>`;
        
        const crafter = aiUsers.find(a => a.id === '@agent_skill_crafter');
        if (crafter) agentOptions += `<option value="${crafter.id}">🤖 ${crafter.name} (Mutación de Skills/Agentes)</option>`;
        
        const codex = aiUsers.find(a => a.id === '@agent_codex_developer');
        if (codex) agentOptions += `<option value="${codex.id}">🤖 ${codex.name} (Lógica & Web3)</option>`;

        const tdd = aiUsers.find(a => a.id === '@agent_tdd_auditor');
        if (tdd) agentOptions += `<option value="${tdd.id}">🤖 ${tdd.name} (Redacción Legal & Docs)</option>`;

        aiUsers.forEach(ai => {
            if (!['@agent_web_deployer', '@agent_codex_developer', '@agent_skill_crafter', '@agent_tdd_auditor'].includes(ai.id)) {
                agentOptions += `<option value="${ai.id}">🤖 ${ai.name}</option>`;
            }
        });

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width:100%;}
                .workspace-paper { flex: 1; display: flex; flex-direction: column; position: relative; background: radial-gradient(circle at center, #111116 0%, #050505 100%); overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; padding: 2rem 3rem; box-sizing: border-box; width: 100%; align-items: center;}
                
                .paper-container { width: 100%; max-width: 1300px; display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; padding-bottom: 8rem; flex: 1;}
                
                .breadcrumb-bar { display: flex; align-items: center; background: rgba(10,10,15,0.8); padding: 10px 15px; border-radius: 12px; border: 1px solid var(--glass-border); gap: 10px; flex-wrap: wrap;}
                .bc-select { background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; font-size: 0.9rem; font-weight: bold; font-family: var(--font-main); outline: none; cursor: pointer; padding: 8px 12px; border-radius: 8px; transition: 0.3s;}
                .bc-select:focus { border-color: var(--accent-blue); }
                .bc-separator { color: #555; font-weight: bold; }
                
                /* ==================================================================== */
                /* 🔥 MODO GTD (WORK ORDERS) */
                /* ==================================================================== */
                .gtd-mode-panel { display: none; width: 100%; max-width: 900px; margin: 0 auto; flex-direction: column; gap: 20px;}
                .pomodoro-panel { background: linear-gradient(145deg, rgba(20,20,25,0.9), rgba(10,10,15,0.95)); border: 1px solid var(--accent-orange); border-radius: 24px; padding: 2rem; text-align: center; box-shadow: 0 15px 35px rgba(255,171,64,0.15), inset 0 0 20px rgba(255,171,64,0.05); transition: 0.3s;}
                .pomodoro-panel.running { border-color: var(--accent-green); box-shadow: 0 15px 35px rgba(0,230,118,0.2), inset 0 0 30px rgba(0,230,118,0.1); animation: breathe 4s infinite;}
                .timer-display { font-size: 5rem; font-weight: 900; font-family: var(--font-mono); color: white; margin: 0.5rem 0; text-shadow: 0 5px 15px rgba(0,0,0,0.8); font-variant-numeric: tabular-nums;}
                .pomodoro-panel.running .timer-display { color: var(--accent-green); }
                .timer-controls { display: flex; justify-content: center; gap: 15px; margin-top: 1rem;}
                .btn-timer { background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; width: 60px; height: 60px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center;}
                .btn-timer:hover { background: rgba(255,255,255,0.1); transform: scale(1.1); }
                .btn-timer.play { border-color: var(--accent-green); color: var(--accent-green); }
                .btn-timer.pause { border-color: var(--accent-orange); color: var(--accent-orange); }

                .task-context-panel { background: rgba(15,15,20,0.9); border: 1px solid var(--glass-border); border-left: 4px solid var(--accent-green); padding: 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);}
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

                .editor-wrapper { position: relative; width: 100%; background: rgba(10,10,15,0.8); border: 1px solid #444; border-radius: 16px; padding: 20px; box-sizing: border-box; transition: 0.3s;}
                .editor-wrapper:focus-within { border-color: var(--accent-purple); box-shadow: 0 0 20px rgba(224,64,251,0.1);}
                .semantic-editor { width: 100%; min-height: 35vh; background: transparent; border: none; color: #e0e0e0; font-family: 'Georgia', serif; font-size: 1.15rem; line-height: 1.6; outline: none;}
                .semantic-editor:empty:before { content: attr(data-placeholder); color: #555; font-style: italic; pointer-events: none;}
                
                .action-bar-fixed { position: fixed; bottom: 30px; right: 30px; display: flex; gap: 15px; z-index: 1000;}
                .btn-action-pow { background: linear-gradient(135deg, var(--accent-green), #00b0ff); color: black; border: none; padding: 16px 30px; border-radius: 30px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 10px 30px rgba(0, 230, 118, 0.3);}
                .btn-action-pow:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(0, 230, 118, 0.5); filter: brightness(1.2);}
                .btn-action-draft { background: rgba(255,171,64,0.1); border: 1px solid var(--accent-orange); color: var(--accent-orange); padding: 16px 30px; border-radius: 30px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(10px);}
                .btn-action-draft:hover { background: var(--accent-orange); color: black; box-shadow: 0 10px 30px rgba(255, 171, 64, 0.4); transform: translateY(-3px);}

                /* ==================================================================== */
                /* 🔥 MODO CHAT-IDE (ARTIFACTS POLIMÓRFICOS) */
                /* ==================================================================== */
                .ide-mode-panel { display: grid; grid-template-columns: 450px 1fr; gap: 20px; flex: 1; min-height: 550px; height: 100%;}
                
                .chat-panel { background: rgba(10,10,15,0.9); border: 1px solid var(--glass-border); border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05); }
                .chat-header { padding: 15px; border-bottom: 1px dashed rgba(255,255,255,0.1); background: rgba(0,0,0,0.5); }
                .chat-header select { background: #050508; border: 1px solid var(--accent-purple); color: var(--accent-purple); padding: 10px; border-radius: 8px; width: 100%; font-weight: bold; outline: none; cursor: pointer; }
                
                .chat-history { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; scroll-behavior: smooth;}
                .msg-bubble { max-width: 90%; padding: 12px 15px; border-radius: 12px; font-size: 0.95rem; line-height: 1.5; white-space: pre-wrap;}
                .msg-user { background: rgba(0,176,255,0.1); border: 1px solid rgba(0,176,255,0.2); color: white; align-self: flex-end; border-bottom-right-radius: 2px;}
                .msg-ai { background: rgba(224,64,251,0.05); border: 1px solid rgba(224,64,251,0.2); color: #ccc; align-self: flex-start; border-bottom-left-radius: 2px;}
                .msg-ai-artifact { border-color: var(--accent-orange); color: var(--accent-orange); font-family: var(--font-mono); font-size: 0.8rem; cursor: pointer; transition: 0.2s;}
                .msg-ai-artifact:hover { background: rgba(255,145,0,0.1); box-shadow: 0 0 15px rgba(255,145,0,0.2);}

                .chat-input-area { padding: 15px; background: rgba(0,0,0,0.6); border-top: 1px solid var(--glass-border); display: flex; flex-direction: column; gap: 10px;}
                .chat-textarea { width: 100%; background: #050508; border: 1px solid #444; color: white; border-radius: 10px; padding: 12px; font-family: var(--font-main); font-size: 0.95rem; resize: none; outline: none; transition: 0.3s; box-sizing: border-box; min-height: 80px;}
                .chat-textarea:focus { border-color: var(--accent-blue); box-shadow: inset 0 0 10px rgba(0,176,255,0.1);}
                
                .btn-send { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); border: none; color: white; padding: 12px; border-radius: 8px; font-weight: 900; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;}
                .btn-send:hover { filter: brightness(1.2); transform: translateY(-2px);}
                .btn-send:disabled { opacity: 0.5; pointer-events: none; filter: grayscale(1); }

                .sandbox-panel { background: repeating-linear-gradient(45deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 10px, transparent 10px, transparent 20px), #050508; border: 1px dashed #333; border-radius: 16px; display: flex; justify-content: center; align-items: center; overflow: hidden; position: relative;}
                .sandbox-empty { color: #555; text-align: center; font-family: var(--font-mono); font-size: 0.9rem; padding: 2rem;}

                @keyframes breathe { 0% { box-shadow: 0 15px 35px rgba(0,230,118,0.1), inset 0 0 20px rgba(0,230,118,0.05); } 50% { box-shadow: 0 15px 35px rgba(0,230,118,0.3), inset 0 0 40px rgba(0,230,118,0.15); } 100% { box-shadow: 0 15px 35px rgba(0,230,118,0.1), inset 0 0 20px rgba(0,230,118,0.05); } }
                @media (max-width: 1024px) { .ide-mode-panel { grid-template-columns: 350px 1fr; } }
                @media (max-width: 768px) { .ide-mode-panel { grid-template-columns: 1fr; display: flex; flex-direction: column-reverse; min-height: auto; } .sandbox-panel { min-height: 400px; } }
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
                                <option value="ide" selected>🚀 Omni-Sandbox (UI, Docs & Skills)</option>
                                </select>
                        </div>
                        
                        <div class="ide-mode-panel" id="ideModePanel">
                            <div class="chat-panel">
                                <div class="chat-header">
                                    <label style="font-size:0.7rem; color:#888; text-transform:uppercase; margin-bottom:5px; display:block;">🗣️ Interlocutor IA (Swarm Memory)</label>
                                    <select id="selAgentTarget">${agentOptions}</select>
                                </div>
                                <div class="chat-history" id="chatHistory">
                                    <div class="msg-bubble msg-ai">
                                        ¡Ommmm! Sandbox Universal activado.<br><br>
                                        • Pídele al <b>Web Deployer</b> que renderice un componente.<br>
                                        • Pídele al <b>Skill Crafter</b> que evolucione o genere una nueva Skill.<br>
                                        • Pídele al <b>TDD Auditor</b> que redacte un contrato.<br>
                                        Mantenemos el contexto en la Swarm Memory.
                                    </div>
                                </div>
                                <div class="chat-input-area">
                                    <textarea id="inpChatPrompt" class="chat-textarea" placeholder="Ej: Crea una skill para..."></textarea>
                                    <button class="btn-send" id="btnSendPrompt">🚀 Enviar Directiva</button>
                                </div>
                            </div>
                            <div class="sandbox-panel" id="sandboxMount">
                                <div class="sandbox-empty" id="sbEmptyState">
                                    <span style="font-size: 3rem; display: block; margin-bottom: 1rem; opacity: 0.5;">⚡</span>
                                    Esperando Artifact (Código, Doc o Mutación)...
                                </div>
                            </div>
                        </div>

                        <div class="gtd-mode-panel" id="gtdModePanel">
                            <div class="pomodoro-panel" id="pomoPanel">
                                <div style="color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">Tiempo de Foco Activo</div>
                                <div class="timer-display" id="timeDisplay">00:00:00</div>
                                <div style="font-family: var(--font-mono); color: #888; font-size: 0.8rem;">El tiempo se inyectará en el Slicing Pie al sellar.</div>
                                <div class="timer-controls">
                                    <button class="btn-timer play" id="btnPlay">▶</button>
                                    <button class="btn-timer pause" id="btnPause" style="display:none;">⏸</button>
                                </div>
                            </div>
                            <div id="taskContextPanel" class="task-context-panel">
                                <div class="task-context-header">
                                    <div><h2 id="taskTitle" class="task-context-title">Tarea</h2><div id="taskRole" style="color:var(--accent-blue); font-family:var(--font-mono); font-size:0.85rem; margin-top:5px; font-weight:bold;"></div></div>
                                    <div style="text-align:right;"><div style="color:#888; font-size:0.75rem; text-transform:uppercase; font-weight:bold;">Estado</div><div id="taskStatus" style="color:var(--accent-orange); font-family:var(--font-mono); font-weight:bold;"></div></div>
                                </div>
                                <div id="taskDesc" class="task-context-desc"></div>
                                <div id="taskSocsContainer" class="soc-checklist-box"></div>
                                <div class="pow-section">
                                    <div class="pow-input-group" style="flex:2;"><label>🔗 Enlace al Entregable</label><input type="text" id="inpPowLink" class="pow-input" placeholder="URL..."></div>
                                    <div class="pow-input-group" style="flex:1;"><label>⏱ Tiempo Imputado (H)</label><input type="number" step="0.01" id="inpPowHours" class="pow-input mono" readonly></div>
                                </div>
                            </div>
                            <div class="editor-wrapper" id="editorWrapper">
                                <label id="editorLabel" style="font-size:0.75rem; color:#888; text-transform:uppercase; font-weight:bold; margin-bottom:5px;">Proof of Work</label>
                                <div id="semanticEditor" class="semantic-editor" contenteditable="true" data-placeholder="Documenta tu Proof of Work aquí..."><p><br></p></div>
                            </div>
                        </div>

                    </div>
                    <div class="action-bar-fixed" id="gtdActionBar" style="display:none;">
                        <button class="btn-action-draft" id="btnSaveTaskDraft">💾 Guardar Borrador</button>
                        <button class="btn-action-pow" id="btnSubmitReport">🚀 Sellar Proof of Work</button>
                    </div>
                </main>
                ${BottomNav.getHtml('/paper')}
            </div>
        `;
    }

    async executeViewScript() {
        Sidebar.initListeners(); 
        PageHeader.execute(); 

        this.sandbox = new SandboxRenderer('sandboxMount');

        this.dom = {
            selProject: document.getElementById('selProject'), omniSelector: document.getElementById('omniSelector'),
            ideModePanel: document.getElementById('ideModePanel'), gtdModePanel: document.getElementById('gtdModePanel'), gtdActionBar: document.getElementById('gtdActionBar'),
            history: document.getElementById('chatHistory'), input: document.getElementById('inpChatPrompt'), btnSend: document.getElementById('btnSendPrompt'),
            selAgent: document.getElementById('selAgentTarget'), sbEmpty: document.getElementById('sbEmptyState'),
            pomoPanel: document.getElementById('pomoPanel'), timeDisplay: document.getElementById('timeDisplay'), btnPlay: document.getElementById('btnPlay'), btnPause: document.getElementById('btnPause'),
            taskTitle: document.getElementById('taskTitle'), taskRole: document.getElementById('taskRole'), taskStatus: document.getElementById('taskStatus'), taskDesc: document.getElementById('taskDesc'),
            taskSocs: document.getElementById('taskSocsContainer'), inpPowLink: document.getElementById('inpPowLink'), inpPowHours: document.getElementById('inpPowHours'),
            editor: document.getElementById('semanticEditor'), btnSubmit: document.getElementById('btnSubmitReport'), btnSaveTaskDraft: document.getElementById('btnSaveTaskDraft')
        };

        const state = store.getState();
        const activeUserId = state.session.activeUserId;

        this.loadProjectTasks = async (projId) => {
            const p = store.getState().projects.find(x => x.id === projId);
            if (!p) return;
            let tasks = p.work_orders && p.work_orders.length > 0 ? p.work_orders : (p.transactions || []);
            tasks = (state.session.role === 'ecosystem-owner' || p.ownerId === activeUserId) ? tasks.filter(tx => tx.status !== 'theoretical') : tasks.filter(tx => tx.assigneeId === activeUserId || tx.workerId === activeUserId); 

            let selectHtml = `<option value="ide" selected>🚀 Omni-Sandbox (UI, Docs & Skills)</option>`;
            if (tasks.length > 0) {
                selectHtml += `<optgroup label="🎯 Tareas Asignadas (Modo GTD)">`;
                tasks.forEach(t => {
                    const pf = (p.vna_flows || []).find(f => f.id === t.flowId) || t;
                    selectHtml += `<option value="${t.id || t.hash}">[WO] ${(pf.template || pf.entregable || t.comentario || 'WO').substring(0,40)}</option>`;
                });
                selectHtml += `</optgroup>`;
            }
            this.dom.omniSelector.innerHTML = selectHtml;
        };

        await this.loadProjectTasks(this.activeProjectId);

        this.dom.selProject.addEventListener('change', async (e) => {
            this.activeProjectId = e.target.value; localStorage.setItem('tt_active_project', this.activeProjectId);
            await this.loadProjectTasks(this.activeProjectId); this.activeTx = null; this.stopPomodoro(); this.setIdeMode();
        });

        this.dom.omniSelector.addEventListener('change', async (e) => {
            const val = e.target.value; this.stopPomodoro(); 
            if (val === 'ide') { this.activeTx = null; this.setIdeMode(); } 
            else { this.activeTx = (store.getState().projects.find(x => x.id === this.activeProjectId).work_orders || []).find(t => (t.id || t.hash) === val); this.setGtdMode(); }
        });

        this.dom.selAgent.addEventListener('change', () => {
            const newAgentName = this.dom.selAgent.options[this.dom.selAgent.selectedIndex].text;
            this.dom.history.innerHTML += `<div class="msg-bubble msg-ai" style="background:rgba(0,176,255,0.05); border-color:var(--accent-blue);">🔄 Enrutando comunicación a: <b>${newAgentName}</b>. Contexto preservado.</div>`;
            this.dom.history.scrollTop = this.dom.history.scrollHeight;
        });

        this.dom.btnSend.addEventListener('click', () => this.handleSendMessage());
        this.dom.input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.handleSendMessage(); } });

        this.setupPomodoro();
        this.dom.btnSubmit.addEventListener('click', () => this.reportDeliverable());
        this.dom.btnSaveTaskDraft.addEventListener('click', () => this.saveTaskDraft());

        // 🔥 EVENTO GLOBAL: Escuchar la orden de sellar una mutación desde el Sandbox
        window.addEventListener('save-entity-mutation', async (e) => {
            const data = e.detail;
            await KB.init();
            
            const refIds = [];
            const evalIds = [];
            const scriptIds = [];
            
            if (data.references && Array.isArray(data.references)) {
                for (const r of data.references) {
                    const rId = `ref_${Date.now()}_${Math.random().toString(36).substr(2,4)}`;
                    await KB.saveNode({ id: rId, type: 'reference', category: 'reference', projectId: 'global', targetId: 'global', title: r.title, content: r.content });
                    refIds.push(rId);
                }
            }
            
            if (data.evals && Array.isArray(data.evals)) {
                const eId = `eval_${Date.now()}_${Math.random().toString(36).substr(2,4)}`;
                await KB.saveNode({ id: eId, type: 'eval', category: 'eval', projectId: 'global', targetId: 'global', title: `Evals automáticos para ${data.title}`, content: JSON.stringify(data.evals) });
                evalIds.push(eId);
            }
            
            if (data.scripts && Array.isArray(data.scripts)) {
                for (const s of data.scripts) {
                    const sId = `script_${Date.now()}_${Math.random().toString(36).substr(2,4)}`;
                    await KB.saveNode({ id: sId, type: 'script', category: 'script', projectId: 'global', targetId: 'global', title: s.title, content: s.content });
                    scriptIds.push(sId);
                }
            }

            await KB.saveNode({
                id: data.id || `${data.entity_type}_${Date.now()}`,
                type: data.entity_type || 'skill', category: data.entity_type || 'skill', projectId: 'global', targetId: 'global',
                title: data.title, content: data.content, description: data.description || 'Mutada desde el Omni-Paper',
                references: refIds, evals: evalIds, scripts: scriptIds,
                keywords: ['#ai_mutated']
            });
            
            alert(`✅ Entidad '${data.title}' sellada en el Córtex junto con ${refIds.length} Refs y ${evalIds.length} Evals.`);
            window.dispatchEvent(new CustomEvent('refresh-lms-data'));
        });

        if (new URLSearchParams(window.location.search).get('hash')) {
            this.dom.omniSelector.value = new URLSearchParams(window.location.search).get('hash');
            this.dom.omniSelector.dispatchEvent(new Event('change'));
        } else this.setIdeMode();
    }

    setIdeMode() { this.dom.gtdModePanel.style.display = 'none'; this.dom.gtdActionBar.style.display = 'none'; this.dom.ideModePanel.style.display = window.innerWidth <= 768 ? 'flex' : 'grid'; }
    
    setGtdMode() { 
        this.dom.ideModePanel.style.display = 'none'; 
        this.dom.gtdModePanel.style.display = 'flex'; 
        this.dom.gtdActionBar.style.display = 'flex'; 

        if (!this.activeTx) return;
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const isLegacy = !this.activeTx.flowId;
        const parentFlow = isLegacy ? this.activeTx : (p.vna_flows || []).find(f => f.id === this.activeTx.flowId);
        
        this.dom.taskTitle.innerText = parentFlow ? (parentFlow.template || parentFlow.entregable || this.activeTx.comentario) : 'Work Order';
        const roleTo = p.roles.find(r => r.id === (parentFlow ? parentFlow.to : this.activeTx.to));
        this.dom.taskRole.innerText = roleTo ? `${roleTo.levelId} - ${roleTo.name}` : '@ecosistema';
        this.dom.taskStatus.innerText = this.activeTx.status === 'pinged' ? 'EN CURSO' : this.activeTx.status.toUpperCase();
        this.dom.taskDesc.innerHTML = (this.activeTx.comentario || parentFlow?.comentario || 'Completa la tarea y sella la evidencia.').replace(/\n/g, '<br>');

        const socs = this.activeTx.soc_checklist && this.activeTx.soc_checklist.length > 0 ? this.activeTx.soc_checklist : (parentFlow?.soc_checklist || []);
        if (socs.length > 0) {
            this.dom.taskSocs.innerHTML = '<label>Criterios de Aceptación (SOCs):</label>' + socs.map(soc => `
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
            this.updatePomodoroDisplay();
            this.dom.inpPowHours.value = savedHours.toFixed(3);
        } else {
            this.pomodoroSeconds = 0;
            this.updatePomodoroDisplay();
            this.dom.inpPowHours.value = (parentFlow?.estimatedHours || parentFlow?.horas || 1); 
        }

        this.dom.editor.innerHTML = this.activeTx.draftContent || '<p><br></p>';
        
        if (this.activeTx.status === 'pinged') {
            this.dom.btnSubmit.style.display = 'block';
            this.dom.btnSaveTaskDraft.style.display = 'block';
            this.dom.btnPlay.style.display = 'flex';
            this.dom.editor.contentEditable = "true";
            this.dom.inpPowLink.disabled = false;
        } else {
            this.dom.btnSubmit.style.display = 'none';
            this.dom.btnSaveTaskDraft.style.display = 'none';
            this.dom.btnPlay.style.display = 'none';
            this.dom.inpPowLink.disabled = true;
            this.dom.taskSocs.querySelectorAll('input').forEach(i => i.disabled = true);
            this.dom.editor.contentEditable = "false";
        }
    }

    addMessage(text, type, artifactData = null) {
        if (type === 'user') this.chatHistory.push({ role: 'user', content: text });
        else this.chatHistory.push({ role: 'assistant', content: artifactData ? JSON.stringify(artifactData) : text });

        const msg = document.createElement('div');
        msg.className = `msg-bubble msg-${type}`;
        
        if (artifactData) {
            msg.classList.add('msg-ai-artifact');
            msg.innerHTML = `📦 <b>Artifact Compilado (${artifactData.type})</b><br><br>Se ha generado el componente/documento. El motor lo está renderizando en el Sandbox.`;
            msg.addEventListener('click', () => {
                if (this.dom.sbEmpty) this.dom.sbEmpty.style.display = 'none';
                this.sandbox.renderArtifact(artifactData);
            });
            if (this.dom.sbEmpty) this.dom.sbEmpty.style.display = 'none';
            this.sandbox.renderArtifact(artifactData);
        } else {
            msg.innerHTML = text.replace(/\n/g, '<br>');
        }
        
        this.dom.history.appendChild(msg);
        this.dom.history.scrollTop = this.dom.history.scrollHeight;
    }

    async handleSendMessage() {
        const text = this.dom.input.value.trim();
        if (!text) return;

        const targetAgentId = this.dom.selAgent.value;
        const targetAgentName = this.dom.selAgent.options[this.dom.selAgent.selectedIndex].text;

        this.addMessage(text, 'user');
        this.dom.input.value = '';
        
        this.dom.btnSend.disabled = true;
        this.dom.btnSend.innerText = "⏳ Orquestando...";

        try {
            await KB.init();
            const promptNode = await KB.getNode(`prompt_global_${targetAgentId.replace('@','')}`);
            let systemPrompt = promptNode ? promptNode.content : `Eres ${targetAgentName}.`;

            if (promptNode && promptNode.dependencies) {
                systemPrompt += `\n\nSOPs DISPONIBLES:\n`;
                for (const skillId of promptNode.dependencies) {
                    const skillNode = await KB.getNode(skillId);
                    if (skillNode) systemPrompt += `\n--- SKILL: ${skillNode.title} ---\n${skillNode.content}\n`;
                }
            }

            const currentArtifactState = this.sandbox && this.sandbox.currentData ? JSON.stringify(this.sandbox.currentData) : "Ningún artifact activo.";

            // 🔥 PROTOCOLO OMNI-PAPER STRICT JSON (Avanzado para Skills Complejas)
            systemPrompt += `
                \n\n[PROTOCOLO DE ARTIFACTS UNIVERSAL (OMNI-PAPER)]:
                Estás operando en un entorno de "Swarm Memory".
                IMPORTANTE: DEBES responder SIEMPRE con un ÚNICO objeto JSON válido. NO uses bloques markdown.
                Estructura obligatoria de tu respuesta:
                {
                    "message": "Tu respuesta conversacional corta para el usuario.",
                    "artifact": null // PON NULL SI NO GENERAS CÓDIGO/DOCS/SKILLS, O PON UN OBJETO SI GENERAS UN ENTREGABLE
                }

                SI EL USUARIO TE PIDE CREAR/EVOLUCIONAR UNA SKILL COMPLEJA, usa este formato para "artifact" (Permite adjuntar teoría, tests y código como nodos separados):
                { 
                    "type": "entity_mutation", 
                    "entity_type": "skill", 
                    "title": "Nombre de la Skill", 
                    "description": "Resumen corto max 300 chars", 
                    "content": "[VNA_NODE]...\\n[SOP]...\\n[SOC]...",
                    "references": [ { "title": "Concepto.md", "content": "Teoría detallada..." } ],
                    "evals": [ { "prompt": "Prueba de usuario simulada", "expected_output": "Resultado esperado" } ],
                    "scripts": [ { "title": "script_de_apoyo.js", "content": "const a = 1;" } ]
                }
                
                SI TE PIDEN UN COMPONENTE WEB UI:
                { "type": "web_component", "html": "...", "css": "...", "js": "..." }

                SI TE PIDEN UN DOCUMENTO:
                { "type": "document", "title": "...", "content": "..." }
                
                ESTADO ACTUAL EN PANTALLA:
                ${currentArtifactState}
            `;

            let contextBuilder = "HISTORIAL DE CONVERSACIÓN:\n";
            if (this.chatHistory.length > 1) {
                this.chatHistory.forEach((msg, idx) => {
                    if (idx < this.chatHistory.length - 1) contextBuilder += `[${msg.role.toUpperCase()}]: ${msg.content}\n`;
                });
            }
            contextBuilder += `\n[NUEVA INSTRUCCIÓN DEL USUARIO PARA ${targetAgentName.toUpperCase()}]:\n${text}`;

            const globalEngine = localStorage.getItem('tt_ai_provider') || 'openai';
            const apiKey = localStorage.getItem(`tt_key_${globalEngine}`);
            if (!apiKey && globalEngine !== 'custom') throw new Error(`Falta API Key de ${globalEngine}.`);

            const response = await Orchestrator.callLLM({ 
                provider: globalEngine, apiKey: apiKey, 
                systemPrompt: systemPrompt, 
                userPrompt: contextBuilder, 
                responseFormat: "json_object", 
                temperature: 0.3 
            });

            // 🔥 SOLUCIÓN AL BUG DEL DOBLE PARSEO
            let parsed = response.content;
            if (typeof parsed === 'string') {
                try {
                    parsed = JSON.parse(parsed);
                } catch(e) {
                    // Extracción agresiva por si la IA es rebelde
                    const match = parsed.match(/\{[\s\S]*\}/);
                    if (match) parsed = JSON.parse(match[0]);
                    else throw new Error("La IA no devolvió un JSON parseable.");
                }
            }
            
            if (parsed.artifact) {
                this.addMessage(parsed.message || "He generado el artifact.", 'ai', parsed.artifact);
            } else {
                this.addMessage(parsed.message || "Entendido.", 'ai');
            }

        } catch (error) {
            this.addMessage(`⚠️ Error de Kernel: ${error.message}`, 'ai');
        } finally {
            this.dom.btnSend.disabled = false;
            this.dom.btnSend.innerHTML = "🚀 Enviar Directiva";
        }
    }

    updatePomodoroDisplay() {
        const hrs = Math.floor(this.pomodoroSeconds / 3600);
        const mins = Math.floor((this.pomodoroSeconds % 3600) / 60);
        const secs = this.pomodoroSeconds % 60;
        this.dom.timeDisplay.innerText = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        if (this.pomodoroSeconds > 0) this.dom.inpPowHours.value = (this.pomodoroSeconds / 3600).toFixed(3); 
    }

    setupPomodoro() {
        this.tickPomodoro = () => { this.pomodoroSeconds++; this.updatePomodoroDisplay(); };

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

    async saveTaskDraft() {
        if (!this.activeTx) return;
        this.dom.btnSaveTaskDraft.disabled = true; this.dom.btnSaveTaskDraft.innerText = "⏳...";

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

        await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: this.activeProjectId, updates: { [listType]: updatedList } } });

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
        if (!link && htmlContent === '<p><br></p>') return alert("⚠️ Adjunta enlace o escribe el PoW.");

        if (confirm(`¿Sellar Work Order con ${hoursToReport}h? Pasará a Auditoría TDD.`)) {
            this.dom.btnSubmit.disabled = true; this.dom.btnSubmit.innerText = '🚀...';
            
            const isLegacy = !this.activeTx.flowId;
            const payloadKey = isLegacy ? 'txHash' : 'woHash';
            const targetHash = this.activeTx.hash || this.activeTx.id;

            await store.dispatch({
                type: 'REPORT_WORK_ORDER',
                payload: { projectId: this.activeProjectId, [payloadKey]: targetHash, realHours: hoursToReport, comentario: htmlContent, proofLink: link }
            });

            alert("✅ Proof of Work reportado. Ha pasado a Notaría.");
            window.location.href = '/v9/project'; 
        }
    }
}
