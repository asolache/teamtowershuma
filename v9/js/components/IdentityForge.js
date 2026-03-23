// v9/js/components/IdentityForge.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';
import { Orchestrator } from '../core/Orchestrator.js';
import { SynapticCanvas } from './SynapticCanvas.js'; // 🔥 MOTOR 3D IMPORTADO A LA FORJA

export class IdentityForge {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.activeNodeId = null;
        this.isAiNode = true;
        this.synapticCanvas = null;
    }

    async render(nodeId = null) {
        if (!this.container) return;
        this.activeNodeId = nodeId;
        
        const state = store.getState();
        let nodeData = { id: '@', name: '', profile: { isAi: true, guardian: 'everyman', preferredEngine: 'deepseek' } };
        let promptContent = '';
        let ikigai = { pasion: '', mision: '', vocacion: '', profesion: '' };

        if (this.activeNodeId) {
            const existing = state.globalUsers.find(u => u.id === this.activeNodeId);
            if (existing) {
                nodeData = existing;
                this.isAiNode = !!existing.profile?.isAi;
            }
            await KB.init();
            const promptNode = await KB.getNode(`prompt_global_${this.activeNodeId.replace('@','')}`);
            if (promptNode) {
                promptContent = promptNode.content;
                ikigai = promptNode.ikigai || ikigai;
            }
        } else {
            this.isAiNode = true;
        }

        this.container.innerHTML = `
            <style>
                .forge-card { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.3); animation: fadeIn 0.3s ease-out;}
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;}
                .form-group { display: flex; flex-direction: column; gap: 8px;}
                .form-group label { color: var(--accent-blue); font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;}
                .form-control { background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; padding: 12px; border-radius: 10px; font-family: var(--font-main); font-size: 0.95rem; outline: none; transition: 0.2s;}
                .form-control:focus { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0,176,255,0.1);}
                
                .ikigai-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1px dashed var(--accent-purple); margin-bottom: 20px;}
                .ikigai-title { grid-column: 1 / -1; color: var(--accent-purple); font-weight: 900; margin: 0; font-size: 1.1rem; display: flex; align-items: center; justify-content: space-between;}
                
                .prompt-area { font-family: var(--font-mono); font-size: 0.85rem; line-height: 1.5; color: #ddd; resize: vertical; min-height: 120px;}
                
                .eval-panel { display: none; background: rgba(0,230,118,0.1); border: 1px solid var(--accent-green); border-radius: 12px; padding: 15px; margin-bottom: 20px; align-items: center; gap: 15px;}
                .eval-grade { font-size: 3rem; font-weight: 900; color: var(--accent-green); line-height: 1; font-family: var(--font-mono);}
                .eval-feedback { flex: 1; color: #ccc; font-size: 0.85rem; line-height: 1.4;}
                
                .btn-forge { background: linear-gradient(135deg, rgba(224,64,251,0.1), rgba(224,64,251,0.2)); border: 1px solid var(--accent-purple); color: var(--accent-purple); padding: 12px 20px; border-radius: 10px; font-weight: 900; cursor: pointer; transition: 0.3s; display: flex; justify-content: center; align-items: center; gap: 10px; width: 100%; margin-bottom: 15px;}
                .btn-forge:hover:not(:disabled) { background: var(--accent-purple); color: white; box-shadow: 0 5px 20px rgba(224,64,251,0.4);}
                
                .btn-save { background: var(--accent-blue); color: black; border: none; padding: 14px; border-radius: 10px; font-weight: 900; cursor: pointer; transition: 0.3s; width: 100%; margin-bottom: 2rem;}
                .btn-save:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,176,255,0.4);}
                
                .toggle-type { display: flex; gap: 10px; margin-bottom: 20px; background: #111; padding: 5px; border-radius: 12px; border: 1px solid #333;}
                .toggle-btn { flex: 1; padding: 10px; text-align: center; cursor: pointer; border-radius: 8px; font-weight: bold; color: #888; transition: 0.3s;}
                .toggle-btn.active { background: var(--accent-blue); color: black; }

                /* CONTENEDOR DEL CÓRTEX 3D */
                .cortex-container { border: 1px solid #333; border-radius: 16px; overflow: hidden; background: #000; }
                .cortex-header { background: rgba(0,0,0,0.8); padding: 15px; border-bottom: 1px dashed #333; color: var(--accent-green); font-weight: bold; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; display:flex; justify-content: space-between;}
                #agentSynapticCanvas { height: 500px; width: 100%; }
                .empty-cortex { display: flex; justify-content: center; align-items: center; height: 100%; color: #666; font-style: italic; text-align: center; padding: 2rem;}
            </style>

            <div class="forge-card">
                <div class="toggle-type">
                    <div class="toggle-btn ${this.isAiNode ? 'active' : ''}" id="btnTypeAi">🤖 Agente A2A</div>
                    <div class="toggle-btn ${!this.isAiNode ? 'active' : ''}" id="btnTypeHuman">👤 Humano (Talento)</div>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Alias / Wallet ID</label>
                        <input type="text" id="ifId" class="form-control" placeholder="ej: @hades o 0x..." value="${nodeData.id}" ${this.activeNodeId ? 'readonly' : ''}>
                    </div>
                    <div class="form-group">
                        <label>Nombre Público</label>
                        <input type="text" id="ifName" class="form-control" placeholder="Ej: Hades (DevOps)" value="${nodeData.name}">
                    </div>
                    <div class="form-group">
                        <label>Guardián (Arquetipo)</label>
                        <select id="ifGuardian" class="form-control">
                            <option value="creator" ${nodeData.profile?.guardian === 'creator' ? 'selected' : ''}>🎨 Creador</option>
                            <option value="ruler" ${nodeData.profile?.guardian === 'ruler' ? 'selected' : ''}>👑 Gobernante</option>
                            <option value="explorer" ${nodeData.profile?.guardian === 'explorer' ? 'selected' : ''}>🧭 Explorador</option>
                            <option value="caregiver" ${nodeData.profile?.guardian === 'caregiver' ? 'selected' : ''}>❤️ Cuidador</option>
                            <option value="everyman" ${nodeData.profile?.guardian === 'everyman' ? 'selected' : ''}>🤝 Ciudadano</option>
                        </select>
                    </div>
                    <div class="form-group" style="display: ${this.isAiNode ? 'flex' : 'none'};" id="ifEngineGroup">
                        <label>Motor Neuronal Primario</label>
                        <select id="ifEngine" class="form-control">
                            <option value="deepseek" ${nodeData.profile?.preferredEngine === 'deepseek' ? 'selected' : ''}>DeepSeek (Lógica/TDD)</option>
                            <option value="openai" ${nodeData.profile?.preferredEngine === 'openai' ? 'selected' : ''}>OpenAI (General)</option>
                            <option value="gemini" ${nodeData.profile?.preferredEngine === 'gemini' ? 'selected' : ''}>Gemini (Multimodal)</option>
                        </select>
                    </div>
                </div>

                <div class="ikigai-grid">
                    <div class="ikigai-title">
                        <span>⛩️ Matriz Ikigai (Propósito Ontológico)</span>
                    </div>
                    <div class="form-group">
                        <label style="color:#e91e63;">Lo que amas (Pasión)</label>
                        <textarea id="ikiPasion" class="form-control" rows="2">${ikigai.pasion || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label style="color:#00bcd4;">Lo que el mundo necesita (Misión)</label>
                        <textarea id="ikiMision" class="form-control" rows="2">${ikigai.mision || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label style="color:#ff9800;">Por lo que te pagan (Profesión)</label>
                        <textarea id="ikiProfesion" class="form-control" rows="2">${ikigai.profesion || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label style="color:#4caf50;">En lo que eres bueno (Vocación)</label>
                        <textarea id="ikiVocacion" class="form-control" rows="2">${ikigai.vocacion || ''}</textarea>
                    </div>
                </div>

                <button class="btn-forge" id="btnEvalPrompt">✨ Evaluar y Asimilar Conocimiento (IA)</button>

                <div class="eval-panel" id="evalPanel">
                    <div class="eval-grade" id="evalGrade">A+</div>
                    <div class="eval-feedback" id="evalFeedback">Cargando oráculo...</div>
                </div>

                <div class="form-group">
                    <label>System Prompt (Identidad Core Inmutable)</label>
                    <textarea id="ifPrompt" class="form-control prompt-area" placeholder="Instrucciones inmutables...">${promptContent}</textarea>
                </div>

                <div class="form-group" style="margin-bottom: 20px;">
                    <label>Tags Semánticos (Fuerza de Gravedad)</label>
                    <input type="text" id="ifTags" class="form-control" placeholder="#backend, #javascript..." style="color:var(--accent-green); font-family:var(--font-mono);">
                </div>

                <button class="btn-save" id="btnSaveIdentity">💾 Sellar Identidad en el Padrón</button>

                <div class="cortex-container">
                    <div class="cortex-header">
                        <span>🧠 Córtex 3D (Memoria Asignada)</span>
                        <span style="color:#888;">Arrastra nodos desde el explorador</span>
                    </div>
                    <div id="agentSynapticCanvas">
                        ${this.activeNodeId ? '<div style="color:#888; text-align:center; padding:3rem;">Cargando motor WebGL...</div>' : '<div class="empty-cortex">Guarda la identidad primero para inicializar su cerebro 3D.</div>'}
                    </div>
                </div>
            </div>
        `;

        this.attachEvents();
        
        // Carga diferida del WebGL 3D solo si el nodo ya existe
        if (this.activeNodeId) {
            setTimeout(async () => {
                const canvasContainer = this.container.querySelector('#agentSynapticCanvas');
                canvasContainer.innerHTML = ''; // Limpiamos el loader
                this.synapticCanvas = new SynapticCanvas(canvasContainer, this.activeNodeId);
                await this.synapticCanvas.render();
            }, 100);
        }
    }

    attachEvents() {
        const btnTypeAi = this.container.querySelector('#btnTypeAi');
        const btnTypeHuman = this.container.querySelector('#btnTypeHuman');
        const engineGroup = this.container.querySelector('#ifEngineGroup');
        const btnEval = this.container.querySelector('#btnEvalPrompt');
        const btnSave = this.container.querySelector('#btnSaveIdentity');

        btnTypeAi.addEventListener('click', () => {
            this.isAiNode = true;
            btnTypeAi.classList.add('active'); btnTypeHuman.classList.remove('active');
            engineGroup.style.display = 'flex';
        });

        btnTypeHuman.addEventListener('click', () => {
            this.isAiNode = false;
            btnTypeHuman.classList.add('active'); btnTypeAi.classList.remove('active');
            engineGroup.style.display = 'none';
        });

        // 🔥 EL EVALUADOR ANTIGRAVITY (CON ASIMILACIÓN RAG)
        btnEval.addEventListener('click', async () => {
            const ikigaiData = {
                pasion: this.container.querySelector('#ikiPasion').value.trim(),
                mision: this.container.querySelector('#ikiMision').value.trim(),
                profesion: this.container.querySelector('#ikiProfesion').value.trim(),
                vocacion: this.container.querySelector('#ikiVocacion').value.trim()
            };
            
            const currentPrompt = this.container.querySelector('#ifPrompt').value.trim();
            const name = this.container.querySelector('#ifName').value.trim();
            const id = this.container.querySelector('#ifId').value.trim();

            if (!name) return alert("El nombre es obligatorio.");

            btnEval.disabled = true;
            btnEval.innerText = "⏳ Orquestador Asimilando Contexto...";

            try {
                let provider = localStorage.getItem('tt_ai_provider') || 'openai';
                let apiKey = localStorage.getItem(`tt_key_${provider}`);
                if (!apiKey && provider !== 'custom') throw new Error("API Key requerida.");

                // Leer contexto del IndexedDB (Memes anclados al agente)
                await KB.init();
                const allNodes = await KB.getAllNodes();
                const relatedMemes = allNodes.filter(n => n.keywords && n.keywords.includes(id));
                const contextText = relatedMemes.map(m => `[Habilidad/Meme Aprendido] ${m.title}: ${m.content}`).join('\n\n');

                const systemPrompt = `
                    Eres el Evaluador Antigravity del Kernel V9.
                    Analiza la información del Nodo y asimila las habilidades (Memes) que ha aprendido.
                    Genera un System Prompt condensado (Máxima densidad, mínimo gasto de tokens).
                    NO cites los memes literalmente, FUSIONA su conocimiento en la "consciencia" o instrucciones directas del Agente.
                    Evalúa la calidad del nuevo prompt con una nota (A, B, C, D, F).
                    Devuelve UNICAMENTE un JSON:
                    {
                        "grade": "A",
                        "feedback": "Comentario sobre qué habilidades se han asimilado.",
                        "optimizedPrompt": "Eres [Nombre]. Tu misión es... [Instrucciones asimilando los memes]",
                        "tags": ["#tag1", "#tag2"]
                    }
                `;

                const userPrompt = `
                    Nodo: ${name} (${this.isAiNode ? 'IA' : 'Humano'})
                    Ikigai: ${JSON.stringify(ikigaiData)}
                    Memes a Asimilar: ${contextText || 'Ninguno nuevo'}
                    Prompt Original: ${currentPrompt || 'Ninguno'}
                `;

                const response = await Orchestrator.callLLM({ provider, apiKey, systemPrompt, userPrompt, responseFormat: "json_object", temperature: 0.2 });
                const result = response.content;

                const evalPanel = this.container.querySelector('#evalPanel');
                evalPanel.style.display = 'flex';
                this.container.querySelector('#evalGrade').innerText = result.grade;
                this.container.querySelector('#evalGrade').style.color = result.grade.includes('A') ? 'var(--accent-green)' : (result.grade.includes('B') || result.grade.includes('C') ? 'var(--accent-orange)' : 'var(--accent-red)');
                this.container.querySelector('#evalFeedback').innerText = result.feedback;
                
                this.container.querySelector('#ifPrompt').value = result.optimizedPrompt;
                this.container.querySelector('#ifTags').value = result.tags.join(', ');

            } catch (error) {
                alert(`Fallo en la asimilación: ${error.message}`);
            } finally {
                btnEval.disabled = false;
                btnEval.innerText = "✨ Evaluar y Asimilar Conocimiento (IA)";
            }
        });

        btnSave.addEventListener('click', async () => {
            let id = this.container.querySelector('#ifId').value.trim();
            if (!id || id === '@') return alert("El Alias / ID no puede estar vacío.");
            if (this.isAiNode && !id.startsWith('@')) id = '@' + id;

            const newUserData = {
                id: id,
                name: this.container.querySelector('#ifName').value.trim(),
                globalRole: this.isAiNode ? 'ai-agent' : 'network-user',
                profile: { isAi: this.isAiNode, guardian: this.container.querySelector('#ifGuardian').value, preferredEngine: this.isAiNode ? this.container.querySelector('#ifEngine').value : null }
            };

            if (this.activeNodeId) await store.dispatch({ type: 'UPDATE_USER', payload: newUserData });
            else await store.dispatch({ type: 'ADD_USER', payload: newUserData });

            await KB.init();
            const rawTags = this.container.querySelector('#ifTags').value;
            const keywordsArray = rawTags.split(',').map(k => k.trim().replace('#','')).filter(k => k !== '');
            keywordsArray.push(this.isAiNode ? 'ai_agent' : 'human');

            const ikigaiData = {
                pasion: this.container.querySelector('#ikiPasion').value.trim(),
                mision: this.container.querySelector('#ikiMision').value.trim(),
                profesion: this.container.querySelector('#ikiProfesion').value.trim(),
                vocacion: this.container.querySelector('#ikiVocacion').value.trim()
            };

            await KB.saveNode({
                id: `prompt_global_${id.replace('@','')}`,
                type: 'prompt_a2a', category: 'meta_prompt', targetId: id, roleTarget: id,
                title: `Identidad de ${newUserData.name}`,
                content: this.container.querySelector('#ifPrompt').value.trim(),
                ikigai: ikigaiData, keywords: keywordsArray
            });

            alert(`✅ Identidad sellada. El nodo ${id} está sincronizado.`);
            window.dispatchEvent(new CustomEvent('identity-forged', { detail: { id } }));
            
            // Si es un nuevo agente, recargamos para que aparezca su Córtex 3D
            if (!this.activeNodeId) this.render(id);
        });

        // Refresco de Evaluador cuando se forja una sinapsis en 3D
        window.addEventListener('synapse-forged', (e) => {
            if (e.detail.agentId === this.activeNodeId) {
                const evalPanel = this.container.querySelector('#evalPanel');
                evalPanel.style.display = 'flex';
                this.container.querySelector('#evalGrade').innerText = "❗";
                this.container.querySelector('#evalGrade').style.color = "var(--accent-orange)";
                this.container.querySelector('#evalFeedback').innerHTML = "<b>Nuevo conocimiento detectado en el Córtex.</b> Pulsa 'Evaluar' para asimilar los Memes y fusionarlos en tu System Prompt.";
            }
        });
    }
}
