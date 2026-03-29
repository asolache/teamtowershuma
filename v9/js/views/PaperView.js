// v9/js/views/PaperView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js'; 
import { PageHeader } from '../components/PageHeader.js';
import { Orchestrator } from '../core/Orchestrator.js'; 
import { SandboxRenderer } from '../components/SandboxRenderer.js'; 
import '../components/GtdPanel.js'; // 🔥 IMPORTAMOS EL NUEVO WEB COMPONENT

export default class PaperView {
    constructor() {
        document.title = "Omni-Paper | TeamTowers V9";
        this.woHash = new URLSearchParams(window.location.search).get('hash');
        this.activeTx = null; 
        this.activeProjectId = null;
        this.isMenuOpen = false;
        
        this.sandbox = null;
        this.chatHistory = []; // Swarm Memory
        this.attachedNodes = []; // MEMORIA RAG MANUAL
        this.currentChatId = null; // IDENTIFICADOR DE SESIÓN PERSISTENTE
        this.chatMessagesMap = {}; // Mapa para inyección de PoW
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
            tagline: "Lienzo Universal: Ejecuta Tareas, adjunta recursos del Córtex e interactúa con el Enjambre.",
            tabs: []
        };

        let agentOptions = '';
        const aiUsers = state.globalUsers.filter(u => u.profile?.isAi);
        
        const deployer = aiUsers.find(a => a.id === '@agent_web_deployer');
        if (deployer) agentOptions += `<option value="${deployer.id}">🤖 ${deployer.name} (Frontend & UI)</option>`;
        
        const crafter = aiUsers.find(a => a.id === '@agent_skill_crafter');
        if (crafter) agentOptions += `<option value="${crafter.id}">🤖 ${crafter.name} (Mutación de Skills)</option>`;
        
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
                
                /* 🔥 MODO CHAT-IDE (ARTIFACTS POLIMÓRFICOS) */
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
                
                .attachments-tray { display: flex; flex-wrap: wrap; gap: 5px; }
                .attachment-pill { background: rgba(0,176,255,0.1); border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-family: var(--font-mono); font-weight: bold; display: flex; align-items: center; gap: 5px;}
                .btn-remove-att { background: transparent; border: none; color: var(--accent-blue); cursor: pointer; font-size: 1rem; line-height: 1; padding: 0;}
                .btn-remove-att:hover { color: white; }
                .input-controls-row { display: flex; gap: 10px; }
                .sel-attach { background: rgba(255,255,255,0.05); border: 1px solid #444; color: #ccc; padding: 10px; border-radius: 8px; flex: 1; font-family: var(--font-main); font-size: 0.85rem; outline: none; cursor: pointer; transition: 0.2s;}
                .sel-attach:focus { border-color: var(--accent-blue); color: white; }

                .chat-textarea { width: 100%; background: #050508; border: 1px solid #444; color: white; border-radius: 10px; padding: 12px; font-family: var(--font-main); font-size: 0.95rem; resize: none; outline: none; transition: 0.3s; box-sizing: border-box; min-height: 80px;}
                .chat-textarea:focus { border-color: var(--accent-blue); box-shadow: inset 0 0 10px rgba(0,176,255,0.1);}
                
                .btn-send { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); border: none; color: white; padding: 12px; border-radius: 8px; font-weight: 900; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;}
                .btn-send:hover { filter: brightness(1.2); transform: translateY(-2px);}
                .btn-send:disabled { opacity: 0.5; pointer-events: none; filter: grayscale(1); }

                /* 🔥 BOTONES DE EVIDENCIA EN BURBUJA CHAT */
                .btn-inject-pow { background: rgba(0,230,118,0.1); border: 1px solid var(--accent-green); color: var(--accent-green); padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: 0.2s; width: 100%; display: block; margin-top: 10px; text-transform: uppercase; font-family: var(--font-mono); }
                .btn-inject-pow:hover { background: var(--accent-green); color: black; box-shadow: 0 0 10px rgba(0,230,118,0.3);}

                .sandbox-panel { background: repeating-linear-gradient(45deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 10px, transparent 10px, transparent 20px), #050508; border: 1px dashed #333; border-radius: 16px; display: flex; justify-content: center; align-items: center; overflow: hidden; position: relative;}
                .sandbox-empty { color: #555; text-align: center; font-family: var(--font-mono); font-size: 0.9rem; padding: 2rem;}

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
                                    </div>
                                <div class="chat-input-area">
                                    <div id="attachedNodesContainer" class="attachments-tray"></div>
                                    <div class="input-controls-row">
                                        <select id="selAttachNode" class="sel-attach">
                                            <option value="">📎 Adjuntar Referencia del Córtex...</option>
                                        </select>
                                    </div>
                                    <textarea id="inpChatPrompt" class="chat-textarea" placeholder="Ej: Escribe tu directiva aquí..."></textarea>
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

                        <gtd-panel id="gtdComponent"></gtd-panel>

                    </div>
                </main>
                ${BottomNav.getHtml('/paper')}
            </div>
        `;
    }

    async afterRender() {
        await this.executeViewScript();
    }

    async executeViewScript() {
        try { if (typeof Sidebar.initListeners === 'function') Sidebar.initListeners(); else if (typeof Sidebar.afterRender === 'function') await Sidebar.afterRender(); } catch(e) { console.warn("Sidebar binding issue:", e); }
        try { if (typeof PageHeader.execute === 'function') PageHeader.execute(); else if (typeof PageHeader.afterRender === 'function') await PageHeader.afterRender(); } catch(e) { console.warn("PageHeader binding issue:", e); }

        this.sandbox = new SandboxRenderer('sandboxMount');

        this.dom = {
            selProject: document.getElementById('selProject'), 
            omniSelector: document.getElementById('omniSelector'),
            ideModePanel: document.getElementById('ideModePanel'), 
            gtdComponent: document.getElementById('gtdComponent'),
            history: document.getElementById('chatHistory'), 
            input: document.getElementById('inpChatPrompt'), 
            btnSend: document.getElementById('btnSendPrompt'),
            selAgent: document.getElementById('selAgentTarget'), 
            sbEmpty: document.getElementById('sbEmptyState'),
            selAttachNode: document.getElementById('selAttachNode'), 
            attachedNodesContainer: document.getElementById('attachedNodesContainer')
        };

        const state = store.getState();
        const activeUserId = state.session.activeUserId;

        // Escuchar eventos emitidos por el GtdPanel
        this.dom.gtdComponent.addEventListener('pow-submitted', () => {
            alert("✅ Proof of Work reportado. Ha pasado a Notaría.");
            window.location.href = '/v9/project'; 
        });

        // CARGAR NODOS ADJUNTABLES
        await KB.init();
        const allNodes = await KB.getAllNodes();
        const attachables = allNodes.filter(n => n.type === 'reference' || n.type === 'skill' || n.type === 'SOP' || n.type === 'script');
        let optionsHtml = '<option value="">📎 Adjuntar Referencia del Córtex...</option>';
        attachables.forEach(n => {
            optionsHtml += `<option value="${n.id}">[${n.type.toUpperCase()}] ${n.title}</option>`;
        });
        this.dom.selAttachNode.innerHTML = optionsHtml;

        this.dom.selAttachNode.addEventListener('change', async (e) => {
            const nodeId = e.target.value;
            if (!nodeId) return;
            const node = allNodes.find(n => n.id === nodeId);
            if (node && !this.attachedNodes.find(n => n.id === nodeId)) {
                this.attachedNodes.push(node);
                this.renderAttachments();
            }
            this.dom.selAttachNode.value = ''; 
        });

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
            await this.loadProjectTasks(this.activeProjectId); this.activeTx = null; await this.setIdeMode();
        });

        this.dom.omniSelector.addEventListener('change', async (e) => {
            const val = e.target.value; 
            if (val === 'ide') { 
                this.activeTx = null; 
                await this.setIdeMode(); 
            } else { 
                this.activeTx = (store.getState().projects.find(x => x.id === this.activeProjectId).work_orders || []).find(t => (t.id || t.hash) === val); 
                await this.setGtdMode(); 
            }
        });

        this.dom.selAgent.addEventListener('change', () => {
            const newAgentName = this.dom.selAgent.options[this.dom.selAgent.selectedIndex].text;
            this.dom.history.innerHTML += `<div class="msg-bubble msg-ai" style="background:rgba(0,176,255,0.05); border-color:var(--accent-blue);">🔄 Enrutando comunicación a: <b>${newAgentName}</b>. Contexto preservado.</div>`;
            this.dom.history.scrollTop = this.dom.history.scrollHeight;
        });

        this.dom.btnSend.addEventListener('click', () => this.handleSendMessage());
        this.dom.input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.handleSendMessage(); } });

        // 🔥 EVENTO GLOBAL: Feedback Negativo del Artifact (Cierre de Bucle CI/CD T-011)
        window.addEventListener('artifact-feedback-negative', (e) => {
            const { feedback, artifact } = e.detail;
            
            const prompt = `[FEEDBACK DE CALIDAD - CORRECCIÓN REQUERIDA (T-011)]\nEl artifact que acabas de generar (${artifact.type}) no cumple los requisitos o tiene el siguiente problema:\n\n"${feedback}"\n\nINSTRUCCIÓN:\n1. Analiza el error.\n2. Genera una nueva versión corregida del artifact aplicando el feedback.\n3. Si el error se debe a una falta de contexto en tu SOP, debes autoevaluarte y generar un artifact de tipo 'entity_mutation' para actualizar tu propia Skill y que no vuelva a ocurrir en el futuro.`;
            
            // Inyectamos el prompt directamente en el input del usuario
            this.dom.input.value = prompt;
            
            // Ocultamos la barra de feedback en el Sandbox para dar confirmación visual
            const inputWrapper = document.getElementById('sbFeedbackInputWrapper');
            if(inputWrapper) inputWrapper.innerHTML = `<span style="color:var(--accent-orange); font-size:0.85rem; font-weight:bold; font-family:var(--font-mono);">Orquestando corrección en la Swarm Memory... 🔄</span>`;

            // Simulamos el envío para que fluya natural
            this.handleSendMessage();
        });

        // EVENTOS GLOBALES DE MÚTACIÓN Y CI/CD
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

        window.addEventListener('run-skill-pentest', async (e) => {
            const skillData = e.detail;
            this.addMessage(`Iniciando protocolo de Pentest CI/CD para la skill: **${skillData.title}**...\nEvaluando ${skillData.evals.length} casos de prueba.`, 'user');

            this.dom.btnSend.disabled = true;
            this.dom.btnSend.innerText = "🧪 Kaos Tester activo...";

            try {
                const systemPrompt = `
                    Eres @kaos_tester, el Evaluador de Córtex (CI/CD) del Kernel V9.
                    Tu misión es testear una Skill recién forjada simulando su ejecución contra sus propios Evals.
                    
                    INSTRUCCIONES:
                    1. Analiza el SOP de la Skill.
                    2. Aplícalo mentalmente contra cada 'prompt' en el array de 'evals'.
                    3. Compara tu resultado con el 'expected_output'.
                    4. Si TODOS pasan, devuelve un mensaje de éxito sin artifact.
                    5. Si ALGUNO falla o es ambiguo, DEBES devolver un "artifact" de tipo "entity_mutation" con la Skill corregida (mejora su SOP/SOC para que no vuelva a fallar).

                    DEBES RESPONDER ÚNICAMENTE CON UN OBJETO JSON VÁLIDO:
                    {
                        "message": "Reporte detallado del testeo (PASA/FALLA y por qué).",
                        "artifact": null // PON NULL SI PASA. SI FALLA, PON EL JSON DE LA SKILL CORREGIDA AQUÍ.
                    }
                `;

                const userPrompt = `SKILL A EVALUAR:\n${JSON.stringify(skillData)}\n\nEJECUTAR PENTEST AHORA.`;

                const globalEngine = localStorage.getItem('tt_ai_provider') || 'openai';
                const apiKey = localStorage.getItem(`tt_key_${globalEngine}`);

                const response = await Orchestrator.callLLM({ 
                    provider: globalEngine, apiKey: apiKey, 
                    systemPrompt: systemPrompt, 
                    userPrompt: userPrompt, 
                    responseFormat: "json_object", 
                    temperature: 0.1 
                });

                let parsed = response.content;
                if (typeof parsed === 'string') {
                    try { parsed = JSON.parse(parsed); } 
                    catch(e) { parsed = JSON.parse(parsed.match(/\{[\s\S]*\}/)[0]); }
                }
                
                if (parsed.artifact) {
                    this.addMessage(`⚠️ **PENTEST FALLIDO**. Se han detectado fisuras en el SOP.\n\n` + parsed.message, 'ai', parsed.artifact, false, response.telemetry);
                } else {
                    this.addMessage(`✅ **PENTEST SUPERADO**. La Skill es robusta y predecible.\n\n` + parsed.message, 'ai', null, false, response.telemetry);
                    const btnPentest = document.getElementById('btnPentestSkill');
                    if (btnPentest) { btnPentest.innerText = "✅ Pentest OK"; btnPentest.style.background = "var(--accent-green)"; }
                }

            } catch (error) {
                this.addMessage(`⚠️ Error en Pentest: ${error.message}`, 'ai');
            } finally {
                this.dom.btnSend.disabled = false;
                this.dom.btnSend.innerHTML = "🚀 Enviar Directiva";
            }
        });

        // 🔥 INICIAR CARGA DE MODO SEGÚN URL
        if (new URLSearchParams(window.location.search).get('hash')) {
            this.dom.omniSelector.value = new URLSearchParams(window.location.search).get('hash');
            this.dom.omniSelector.dispatchEvent(new Event('change'));
        } else {
            await this.setIdeMode();
        }
    }

    // 🔥 GESTIÓN DE SWARM MEMORY PERSISTENTE EN INDEXEDDB
    async loadChatHistory(chatId) {
        this.currentChatId = chatId;
        this.chatHistory = [];
        this.chatMessagesMap = {}; // Limpiar mapa
        this.dom.history.innerHTML = '';
        
        await KB.init();
        const node = await KB.getNode(chatId);
        
        if (node && node.content) {
            try {
                const history = JSON.parse(node.content);
                for (const msg of history) {
                    this.addMessage(msg._uiText || msg.content, msg.role === 'user' ? 'user' : 'ai', msg._uiArtifact, true, msg._telemetry);
                }
            } catch (e) {
                console.error("Error parseando chat history", e);
                this.renderDefaultGreeting();
            }
        } else {
            this.renderDefaultGreeting();
        }
    }

    async saveChatHistory() {
        if (!this.currentChatId) return;
        await KB.init();
        await KB.saveNode({
            id: this.currentChatId,
            type: 'chat_session',
            category: 'chat',
            projectId: this.activeProjectId,
            targetId: 'global',
            title: `Chat Session: ${this.currentChatId}`,
            content: JSON.stringify(this.chatHistory)
        });
    }

    renderDefaultGreeting() {
        this.dom.history.innerHTML = `
            <div class="msg-bubble msg-ai">
                ¡Ommmm! Sandbox Universal activado.<br><br>
                • Pídele al <b>Web Deployer</b> que renderice un componente.<br>
                • Pídele al <b>Skill Crafter</b> que evolucione o genere una nueva Skill.<br>
                • Pídele al <b>TDD Auditor</b> que redacte un contrato.<br>
                Mantenemos el contexto en la Swarm Memory.
            </div>
        `;
    }

    renderAttachments() {
        this.dom.attachedNodesContainer.innerHTML = '';
        this.attachedNodes.forEach((n, idx) => {
            const pill = document.createElement('div');
            pill.className = 'attachment-pill';
            pill.innerHTML = `📚 ${n.title} <button class="btn-remove-att" data-idx="${idx}">&times;</button>`;
            this.dom.attachedNodesContainer.appendChild(pill);
        });
        this.dom.attachedNodesContainer.querySelectorAll('.btn-remove-att').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                this.attachedNodes.splice(idx, 1);
                this.renderAttachments();
            });
        });
    }

    async setIdeMode() { 
        this.dom.gtdComponent.loadTask(null, this.activeProjectId, null); 
        this.dom.ideModePanel.style.display = window.innerWidth <= 768 ? 'flex' : 'grid'; 
        await this.loadChatHistory(`chat_${this.activeProjectId}_ide`);
    }
    
    async setGtdMode() { 
        this.dom.ideModePanel.style.display = 'none'; 
        const chatId = `chat_${this.activeProjectId}_wo_${this.activeTx.hash || this.activeTx.id}`;
        
        await this.loadChatHistory(chatId);
        this.dom.gtdComponent.loadTask(this.activeTx, this.activeProjectId, chatId);
    }

    addMessage(text, type, artifactData = null, skipSave = false, telemetry = null) {
        if (type === 'user') {
            this.chatHistory.push({ role: 'user', content: text, _uiText: text });
        } else {
            this.chatHistory.push({ role: 'assistant', content: artifactData ? JSON.stringify(artifactData) : text, _uiText: text, _uiArtifact: artifactData, _telemetry: telemetry });
        }

        const msgId = 'msg_' + Date.now() + Math.floor(Math.random() * 1000);
        this.chatMessagesMap[msgId] = { text, artifactData };

        const msg = document.createElement('div');
        msg.className = `msg-bubble msg-${type}`;
        
        let costHtml = '';
        if (telemetry && type === 'ai') {
            const state = store.getState();
            const ecoConfig = state.config?.economics || {
                markup_margin: 0.0, premium_features_fee: 0.0,
                base_pricing: { 'deepseek': { input: 0.14, output: 0.28 }, 'gemini': { input: 0.075, output: 0.30 }, 'openai': { input: 2.50, output: 10.00 }, 'anthropic': { input: 3.00, output: 15.00 }, 'custom': { input: 0.0, output: 0.0 } }
            };
            const priceMatrix = ecoConfig.base_pricing[telemetry.provider] || { input: 0, output: 0 };
            const costInCents = ((telemetry.tokens.prompt_tokens / 1000000) * priceMatrix.input) + ((telemetry.tokens.completion_tokens / 1000000) * priceMatrix.output);
            const finalCost = costInCents * (1 + ecoConfig.markup_margin + ecoConfig.premium_features_fee);
            const costEur = finalCost.toFixed(4);
            const totalTokens = telemetry.tokens.prompt_tokens + telemetry.tokens.completion_tokens;
            
            costHtml = `
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.1); font-size: 0.7rem; color: #888; font-family: var(--font-mono); display: flex; justify-content: space-between; align-items:center;">
                    <span title="Tokens In/Out: ${telemetry.tokens.prompt_tokens} / ${telemetry.tokens.completion_tokens}">⚡ ${(telemetry.latencyMs / 1000).toFixed(1)}s | 🪙 ${totalTokens.toLocaleString()} tk</span>
                    <span style="color:var(--accent-green);">💶 €${costEur} (${telemetry.provider})</span>
                </div>
            `;
        }

        let evidenceBtn = '';
        if (type === 'ai' && this.activeTx && this.activeTx.status === 'pinged') {
            evidenceBtn = `<button class="btn-inject-pow" id="btn_inject_${msgId}">📥 Inyectar como Proof of Work</button>`;
        }

        if (artifactData) {
            msg.classList.add('msg-ai-artifact');
            msg.innerHTML = `📦 <b>Artifact Compilado (${artifactData.type})</b><br><br>Se ha generado el componente/documento. El motor lo está renderizando en el Sandbox. ${evidenceBtn} ${costHtml}`;
            msg.addEventListener('click', (e) => {
                if(e.target.tagName === 'BUTTON') return; 
                if (this.dom.sbEmpty) this.dom.sbEmpty.style.display = 'none';
                this.sandbox.renderArtifact(artifactData);
            });
            if (!skipSave) {
                if (this.dom.sbEmpty) this.dom.sbEmpty.style.display = 'none';
                this.sandbox.renderArtifact(artifactData);
            }
        } else {
            msg.innerHTML = text.replace(/\n/g, '<br>') + evidenceBtn + costHtml;
        }
        
        this.dom.history.appendChild(msg);
        
        const btnInject = msg.querySelector(`#btn_inject_${msgId}`);
        if (btnInject) {
            btnInject.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('inject-evidence', { detail: { msgId: msgId, text: text, artifactData: artifactData } }));
            });
        }

        this.dom.history.scrollTop = this.dom.history.scrollHeight;

        if (!skipSave) this.saveChatHistory();
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

            if (this.attachedNodes.length > 0) {
                systemPrompt += `\n\n[RECURSOS INYECTADOS POR EL USUARIO PARA ESTA TAREA]:\n`;
                this.attachedNodes.forEach(node => {
                    systemPrompt += `\n--- REFERENCIA (${node.type}): ${node.title} ---\n${node.content}\n`;
                });
            }

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

            let parsed = response.content;
            if (typeof parsed === 'string') {
                try {
                    parsed = JSON.parse(parsed);
                } catch(e) {
                    const match = parsed.match(/\{[\s\S]*\}/);
                    if (match) parsed = JSON.parse(match[0]);
                    else throw new Error("La IA no devolvió un JSON parseable.");
                }
            }
            
            if (parsed.artifact) {
                this.addMessage(parsed.message || "He generado el artifact.", 'ai', parsed.artifact, false, response.telemetry);
            } else {
                this.addMessage(parsed.message || "Entendido.", 'ai', null, false, response.telemetry);
            }

            this.attachedNodes = [];
            this.renderAttachments();

        } catch (error) {
            this.addMessage(`⚠️ Error de Kernel: ${error.message}`, 'ai');
        } finally {
            this.dom.btnSend.disabled = false;
            this.dom.btnSend.innerHTML = "🚀 Enviar Directiva";
        }
    }
}
