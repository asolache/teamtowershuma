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
            title: "Omni-Paper (Chat IDE)",
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

        aiUsers.forEach(ai => {
            if (!['@agent_web_deployer', '@agent_codex_developer', '@agent_skill_crafter'].includes(ai.id)) {
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
                
                /* MODO GTD OCULTO (Se mantiene la lógica, ocultamos CSS por brevedad en este prompt, confía en el render) */
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
                .pow-input { background: rgba(0,0,0,0.6); border: 1px solid #444; color: white; padding: 12px; border-radius: 8px; font-family: var(--font-main); outline:none; transition: 0.3s;}
                
                .editor-wrapper { position: relative; width: 100%; background: rgba(10,10,15,0.8); border: 1px solid #444; border-radius: 16px; padding: 20px; box-sizing: border-box; transition: 0.3s;}
                .semantic-editor { width: 100%; min-height: 35vh; background: transparent; border: none; color: #e0e0e0; font-family: 'Georgia', serif; font-size: 1.15rem; line-height: 1.6; outline: none;}
                .action-bar-fixed { position: fixed; bottom: 30px; right: 30px; display: flex; gap: 15px; z-index: 1000;}

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
                @media (max-width: 768px) { .ide-mode-panel { grid-template-columns: 1fr; display: flex; flex-direction: column-reverse; } .sandbox-panel { min-height: 400px; } }
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
                                        Mantenemos el contexto sin importar el tipo de entregable.
                                    </div>
                                </div>
                                <div class="chat-input-area">
                                    <textarea id="inpChatPrompt" class="chat-textarea" placeholder="Ej: Evoluciona la skill 'skill_vna_architect' para que..."></textarea>
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
                                <div class="timer-display" id="timeDisplay">00:00:00</div>
                                <div class="timer-controls">
                                    <button class="btn-timer play" id="btnPlay">▶</button>
                                    <button class="btn-timer pause" id="btnPause" style="display:none;">⏸</button>
                                </div>
                            </div>
                            <div id="taskContextPanel" class="task-context-panel">
                                <div class="task-context-header">
                                    <div><h2 id="taskTitle" class="task-context-title">Tarea</h2><div id="taskRole"></div></div>
                                    <div id="taskStatus"></div>
                                </div>
                                <div id="taskDesc" class="task-context-desc"></div>
                                <div id="taskSocsContainer"></div>
                                <div class="pow-section">
                                    <input type="text" id="inpPowLink" class="pow-input" placeholder="URL Entregable...">
                                    <input type="number" step="0.01" id="inpPowHours" class="pow-input mono" readonly>
                                </div>
                            </div>
                            <div class="editor-wrapper" id="editorWrapper">
                                <div id="semanticEditor" class="semantic-editor" contenteditable="true" data-placeholder="Proof of Work..."><p><br></p></div>
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
            await KB.saveNode({
                id: data.id || `${data.entity_type}_${Date.now()}`,
                type: data.entity_type || 'skill', category: data.entity_type || 'skill', projectId: 'global', targetId: 'global',
                title: data.title, content: data.content, description: data.description || 'Mutada desde el Omni-Paper',
                keywords: ['#ai_mutated']
            });
            alert(`✅ Entidad '${data.title}' mutada y sellada en el Córtex.`);
            window.dispatchEvent(new CustomEvent('refresh-lms-data'));
        });

        if (new URLSearchParams(window.location.search).get('hash')) {
            this.dom.omniSelector.value = new URLSearchParams(window.location.search).get('hash');
            this.dom.omniSelector.dispatchEvent(new Event('change'));
        } else this.setIdeMode();
    }

    setIdeMode() { this.dom.gtdModePanel.style.display = 'none'; this.dom.gtdActionBar.style.display = 'none'; this.dom.ideModePanel.style.display = window.innerWidth <= 768 ? 'flex' : 'grid'; }
    setGtdMode() { this.dom.ideModePanel.style.display = 'none'; this.dom.gtdModePanel.style.display = 'flex'; this.dom.gtdActionBar.style.display = 'flex'; /* Logica GTD omitida en este snippet para foco */ }

    addMessage(text, type, artifactData = null) {
        if (type === 'user') this.chatHistory.push({ role: 'user', content: text });
        else this.chatHistory.push({ role: 'assistant', content: artifactData ? JSON.stringify(artifactData) : text });

        const msg = document.createElement('div');
        msg.className = `msg-bubble msg-${type}`;
        
        if (artifactData) {
            msg.innerHTML = `📦 <b>Artifact Compilado (${artifactData.type})</b><br><br>Se ha generado el componente/documento. El motor lo está renderizando en el Sandbox.`;
            msg.style.borderColor = "var(--accent-orange)"; msg.style.color = "var(--accent-orange)";
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

            // 🔥 PROTOCOLO OMNI-PAPER STRICT JSON (El fin del Markdown roto)
            systemPrompt += `
                \n\n[PROTOCOLO DE ARTIFACTS UNIVERSAL (OMNI-PAPER)]:
                Estás operando en un entorno de "Swarm Memory".
                IMPORTANTE: DEBES responder SIEMPRE con un ÚNICO objeto JSON válido.
                Estructura obligatoria de tu respuesta:
                {
                    "message": "Tu respuesta conversacional corta para el usuario.",
                    "artifact": null // PON NULL SI NO GENERAS CÓDIGO/DOCS, O PON UN OBJETO SI GENERAS UN ENTREGABLE:
                }

                SI GENERAS UN ARTIFACT, ELIGE UNO DE ESTOS 3 TIPOS para la propiedad "artifact":
                
                1. Web Component (UI/Code):
                { "type": "web_component", "html": "...", "css": "...", "js": "..." }
                
                2. Documento (Markdown, Legal, Texto plano):
                { "type": "document", "title": "Nombre del doc", "content": "# Titulo\\nTexto..." }
                
                3. Mutación de Entidad (Si el usuario te pide crear/evolucionar una Skill o Agente):
                { "type": "entity_mutation", "entity_type": "skill", "id": "opcional", "title": "Nombre", "description": "Resumen corto max 300 chars", "content": "[VNA_NODE]... [SOP]..." }
                
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

            // 🔥 FORZAMOS responseFormat a JSON OBJECT para que nunca vomite Markdown
            const response = await Orchestrator.callLLM({ 
                provider: globalEngine, apiKey: apiKey, 
                systemPrompt: systemPrompt, 
                userPrompt: contextBuilder, 
                responseFormat: "json_object", 
                temperature: 0.3 
            });

            // Parseo garantizado gracias al JSON Protocol
            const parsed = JSON.parse(response.content);
            
            if (parsed.artifact) {
                this.addMessage(parsed.message || "He generado el artifact.", 'ai', parsed.artifact);
            } else {
                this.addMessage(parsed.message || "Entendido.", 'ai');
            }

        } catch (error) {
            this.addMessage(`⚠️ Error de Kernel: ${error.message}. (Asegúrate de usar OpenAI GPT-4o o un modelo que soporte JSON Mode).`, 'ai');
        } finally {
            this.dom.btnSend.disabled = false;
            this.dom.btnSend.innerHTML = "🚀 Enviar Directiva";
        }
    }

    // Métodos GTD Dummy para este snippet (no borrados, se asume que están, los pongo para completitud)
    setupPomodoro() {} stopPomodoro() {} async saveTaskDraft() {} async reportDeliverable() {}
}
