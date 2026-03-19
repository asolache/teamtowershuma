// v8/js/views/AgentEditorView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';
import { Orchestrator } from '../core/Orchestrator.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import { SynapticCanvas } from '../components/SynapticCanvas.js'; // 🔥 NUEVO IMPORT

export default class AgentEditorView {
    constructor() {
        document.title = "Padrón Neuronal | TeamTowers V15.5";
        this.selectedAgentId = null;
        this.synapticCanvas = null;
    }

    async getHtml() {
        const headerConfig = {
            title: "Padrón Neuronal (IDE A2A)",
            subtitle: "Laboratorio de Consciencia",
            tagline: "Forja el Alma (System) y arrastra Memes al cerebro del Agente para darle Contexto."
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-agents { flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; box-sizing: border-box;}
                
                .agent-grid { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; padding-bottom: 5rem; align-items: start;}
                
                .agent-list-panel { background: rgba(10,10,15,0.8); border: 1px solid var(--glass-border); border-radius: 20px; display: flex; flex-direction: column; height: calc(100vh - 180px); overflow: hidden; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5);}
                .list-header { padding: 20px; border-bottom: 1px dashed #333; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4);}
                .list-header h3 { margin: 0; color: white; font-weight: 900; font-size: 1.2rem;}
                .btn-new-agent { background: rgba(0,176,255,0.1); color: var(--accent-blue); border: 1px solid rgba(0,176,255,0.3); padding: 6px 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s;}
                .btn-new-agent:hover { background: var(--accent-blue); color: black;}
                
                .agent-list { flex: 1; overflow-y: auto; padding: 10px;}
                .agent-item { display: flex; align-items: center; gap: 15px; padding: 15px; border-radius: 12px; cursor: pointer; transition: 0.2s; border: 1px solid transparent; margin-bottom: 5px;}
                .agent-item:hover { background: rgba(255,255,255,0.03); border-color: #333; }
                .agent-item.active { background: rgba(0,176,255,0.1); border-color: var(--accent-blue); }
                .agent-avatar { font-size: 2rem; width: 45px; height: 45px; display: flex; justify-content: center; align-items: center; background: rgba(0,0,0,0.5); border-radius: 12px; border: 1px solid #333;}
                .agent-info h4 { margin: 0 0 5px 0; color: white; font-size: 1rem; font-weight: 900;}
                .agent-info p { margin: 0; color: #888; font-size: 0.75rem; font-family: var(--font-mono);}

                .agent-editor-panel { display: flex; flex-direction: column; gap: 2rem; display: none; animation: fadeIn 0.3s ease-out;}
                .agent-editor-panel.active { display: flex; }
                
                .editor-card { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.3);}
                
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;}
                .form-group { display: flex; flex-direction: column; gap: 8px;}
                .form-group label { color: var(--accent-blue); font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;}
                .form-control { background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; padding: 12px; border-radius: 10px; font-family: var(--font-main); font-size: 0.95rem; outline: none; transition: 0.2s;}
                .form-control:focus { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0,176,255,0.1);}
                
                .prompt-area { font-family: monospace; font-size: 0.9rem; line-height: 1.5; color: #ddd; resize: vertical;}
                
                .btn-ai-forge { background: linear-gradient(135deg, rgba(224,64,251,0.1), rgba(224,64,251,0.2)); border: 1px solid var(--accent-purple); color: var(--accent-purple); padding: 12px 20px; border-radius: 10px; font-weight: 900; cursor: pointer; transition: 0.3s; display: flex; justify-content: center; align-items: center; gap: 10px; width: 100%; margin-top: 10px;}
                .btn-ai-forge:hover:not(:disabled) { background: var(--accent-purple); color: white; box-shadow: 0 5px 20px rgba(224,64,251,0.4);}
                .btn-ai-forge:disabled { opacity: 0.6; cursor: not-allowed; }
                
                .btn-save { background: var(--accent-blue); color: black; border: none; padding: 14px; border-radius: 10px; font-weight: 900; cursor: pointer; transition: 0.3s; width: 100%; margin-top: 15px;}
                .btn-save:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,176,255,0.4);}

                /* CONTENEDOR DEL IDE VISUAL */
                .sandbox-wrapper-main { height: 400px; position: relative; }
                .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666; font-style: italic; padding: 2rem; text-align: center;}

                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 1024px) {
                    .agent-grid { grid-template-columns: 1fr; }
                    .agent-list-panel { height: 300px; }
                    .workspace-agents { padding: 90px 1rem 120px 1rem; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/agents')}
                <main class="workspace-agents">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="agent-grid">
                        <div class="agent-list-panel">
                            <div class="list-header">
                                <h3>Padrón Global</h3>
                                <button class="btn-new-agent" id="btnNewAgent">+ Crear Nodo</button>
                            </div>
                            <div class="agent-list" id="agentList"></div>
                        </div>

                        <div class="agent-editor-panel" id="editorPanel">
                            <div class="editor-card">
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label>Alias (ID)</label>
                                        <input type="text" id="inpAgentId" class="form-control" placeholder="ej: @hades">
                                    </div>
                                    <div class="form-group">
                                        <label>Nombre Completo</label>
                                        <input type="text" id="inpAgentName" class="form-control" placeholder="Hades (DevOps)">
                                    </div>
                                    <div class="form-group">
                                        <label>Guardián (Arquetipo)</label>
                                        <select id="inpAgentGuardian" class="form-control">
                                            <option value="creator">🎨 Creador / Hefest</option>
                                            <option value="ruler">👑 Gobernante / Zeus</option>
                                            <option value="sage">🦉 Sabio / Apol·lo</option>
                                            <option value="explorer">🧭 Explorador / Posidó</option>
                                            <option value="magician">✨ Mago / Hermes</option>
                                            <option value="hero">⚔️ Héroe / Atenea</option>
                                            <option value="caregiver">❤️ Cuidador / Hestia</option>
                                            <option value="everyman">🤝 Ciudadano / Demèter</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Motor Neuronal</label>
                                        <select id="inpAgentEngine" class="form-control">
                                            <option value="deepseek">DeepSeek (V3/R1)</option>
                                            <option value="openai">OpenAI (GPT-4o)</option>
                                            <option value="gemini">Google Gemini</option>
                                            <option value="anthropic">Anthropic Claude</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-group" style="margin-top: 15px;">
                                    <label style="color:var(--accent-purple);">System Prompt (Identidad Core)</label>
                                    <textarea id="inpAgentPrompt" class="form-control prompt-area" style="min-height: 120px;" placeholder="Instrucciones base del agente..."></textarea>
                                </div>
                                
                                <div class="form-group" style="margin-top: 10px;">
                                    <label style="color:var(--accent-green);">Context Prompt (Memoria A2A y Memes Heredados)</label>
                                    <textarea id="inpAgentContext" class="form-control prompt-area" style="min-height: 80px; color: #8bc34a; background: rgba(0,230,118,0.05);" readonly placeholder="Arrastra Memes al mapa neuronal de abajo y aparecerán aquí automáticamente..."></textarea>
                                </div>
                                
                                <button class="btn-ai-forge" id="btnAiForge">🧠 Autocompletar System Prompt con @genesi_ai</button>
                                <button class="btn-save" id="btnSaveAgent">💾 Sellar Mutación en el Kernel</button>
                            </div>

                            <div class="sandbox-wrapper-main" id="agentSynapticCanvas">
                                <div class="empty-state">Selecciona un Agente para forjar sus Sinapsis.</div>
                            </div>
                        </div>
                    </div>
                </main>
                ${BottomNav.getHtml('/agents')}
            </div>
        `;
    }

    async executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        this.dom = {
            list: document.getElementById('agentList'),
            editor: document.getElementById('editorPanel'),
            btnNew: document.getElementById('btnNewAgent'),
            btnSave: document.getElementById('btnSaveAgent'),
            btnForge: document.getElementById('btnAiForge'),
            inpId: document.getElementById('inpAgentId'),
            inpName: document.getElementById('inpAgentName'),
            inpGuardian: document.getElementById('inpAgentGuardian'),
            inpEngine: document.getElementById('inpAgentEngine'),
            inpPrompt: document.getElementById('inpAgentPrompt'),
            inpContext: document.getElementById('inpAgentContext'),
            canvasContainer: document.getElementById('agentSynapticCanvas')
        };

        this.renderList();

        // Escuchador del Drop Visual
        window.addEventListener('synapse-forged', async (e) => {
            if (e.detail.agentId === this.selectedAgentId) {
                await this.refreshContextPrompt(this.selectedAgentId);
            }
        });

        this.dom.btnNew.addEventListener('click', () => {
            this.selectedAgentId = null;
            this.dom.inpId.value = '@';
            this.dom.inpId.readOnly = false;
            this.dom.inpName.value = '';
            this.dom.inpPrompt.value = 'Eres un agente experto en...';
            this.dom.inpContext.value = '';
            this.dom.editor.classList.add('active');
            this.dom.canvasContainer.innerHTML = '<div class="empty-state" style="border:1px dashed #555; border-radius:20px;">Guarda el agente para inicializar el IDE Neuronal.</div>';
            
            document.querySelectorAll('.agent-item').forEach(i => i.classList.remove('active'));
        });

        this.dom.btnSave.addEventListener('click', async () => {
            let id = this.dom.inpId.value.trim();
            if (!id || id === '@') return alert("El Alias del Agente no puede estar vacío.");
            if (!id.startsWith('@')) id = '@' + id;

            const newUserData = {
                id: id,
                name: this.dom.inpName.value.trim(),
                globalRole: 'ai-agent',
                profile: {
                    isAi: true,
                    guardian: this.dom.inpGuardian.value,
                    preferredEngine: this.dom.inpEngine.value
                }
            };

            if (this.selectedAgentId) {
                await store.dispatch({ type: 'UPDATE_USER', payload: newUserData });
            } else {
                await store.dispatch({ type: 'ADD_USER', payload: newUserData });
            }

            await KB.init();
            const safeId = id.replace('@','');
            await KB.saveNode({
                id: `prompt_global_${safeId}`,
                type: 'prompt_a2a',
                category: 'meta_prompt',
                targetId: id,
                roleTarget: id,
                title: `Alma de ${newUserData.name}`,
                content: this.dom.inpPrompt.value.trim()
            });

            alert(`✅ Identidad de ${id} sellada correctamente.`);
            this.selectedAgentId = id;
            this.dom.inpId.readOnly = true;
            this.renderList();
            this.loadAgentData(id);
        });

        this.dom.btnForge.addEventListener('click', async () => {
            const name = this.dom.inpName.value.trim() || 'Agente Desconocido';
            const guardian = this.dom.inpGuardian.value;
            
            this.dom.btnForge.innerText = "⏳ @genesi_ai forjando el alma...";
            this.dom.btnForge.disabled = true;

            try {
                const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
                const apiKey = localStorage.getItem(`tt_key_${provider}`);
                
                const systemPrompt = `Eres @genesi_ai. Escribe un 'System Prompt' denso, profesional y W3C en primera persona para un Agente de IA llamado ${name}. Su arquetipo guardián es ${guardian}. El prompt debe programarlo para ser supereficiente, conciso y orientado a resultados. No uses markdown.`;
                const response = await Orchestrator.callLLM({ provider, apiKey, systemPrompt, userPrompt: "Forja el System Prompt.", responseFormat: "text", temperature: 0.4 });
                
                this.dom.inpPrompt.value = response.content;
            } catch(e) {
                alert(`Fallo en la forja: ${e.message}`);
            } finally {
                this.dom.btnForge.innerText = "🧠 Autocompletar System Prompt con @genesi_ai";
                this.dom.btnForge.disabled = false;
            }
        });
    }

    renderList() {
        const state = store.getState();
        const agents = state.globalUsers.filter(u => u.profile && u.profile.isAi);
        
        this.dom.list.innerHTML = agents.map(a => `
            <div class="agent-item ${a.id === this.selectedAgentId ? 'active' : ''}" data-id="${a.id}">
                <div class="agent-avatar">🤖</div>
                <div class="agent-info">
                    <h4>${a.name}</h4>
                    <p>${a.id} | ${a.profile?.guardian || 'everyman'}</p>
                </div>
            </div>
        `).join('');

        this.dom.list.querySelectorAll('.agent-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.selectedAgentId = id;
                document.querySelectorAll('.agent-item').forEach(i => i.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.loadAgentData(id);
            });
        });
    }

    async refreshContextPrompt(agentId) {
        await KB.init();
        const allNodes = await KB.getAllNodes();
        const relatedMemes = allNodes.filter(n => n.keywords && n.keywords.includes(agentId));
        const contextText = relatedMemes.map(m => `[${m.category}] ${m.title}: ${m.content}`).join('\n\n');
        this.dom.inpContext.value = contextText || 'Sin memoria heredada de la red. Busca un Meme en la paleta y arrástralo al cerebro del agente.';
    }

    async loadAgentData(id) {
        const state = store.getState();
        const agent = state.globalUsers.find(u => u.id === id);
        if (!agent) return;

        this.dom.inpId.value = agent.id;
        this.dom.inpId.readOnly = true;
        this.dom.inpName.value = agent.name;
        this.dom.inpGuardian.value = agent.profile?.guardian || 'everyman';
        this.dom.inpEngine.value = agent.profile?.preferredEngine || 'deepseek';

        await KB.init();
        const safeId = id.replace('@','');
        const promptNode = await KB.getNode(`prompt_global_${safeId}`);
        this.dom.inpPrompt.value = promptNode ? promptNode.content : `Eres ${agent.name}...`;

        await this.refreshContextPrompt(id);

        this.dom.editor.classList.add('active');
        
        // 🚀 INICIAMOS EL IDE VISUAL
        this.synapticCanvas = new SynapticCanvas(this.dom.canvasContainer, id);
        await this.synapticCanvas.render();
    }
}
