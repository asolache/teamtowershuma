// v9/js/components/IdentityForge.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';
import { Orchestrator } from '../core/Orchestrator.js';

export default class IdentityForge {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.activeAgentId = null;
        this.agentSkills = []; // Array de IDs de las skills equipadas
        this.isSimulating = false;
    }

    async render(agentId = null) {
        if (!this.container) return;
        this.activeAgentId = agentId;
        
        const state = store.getState();
        let agentData = { id: '@', name: '', profile: { isAi: true, guardian: 'creator', preferredEngine: 'deepseek', orchestration: 'react' } };
        let promptContent = '';

        if (this.activeAgentId) {
            const existing = state.globalUsers.find(u => u.id === this.activeAgentId);
            if (existing && existing.profile?.isAi) {
                agentData = existing;
                if (!agentData.profile.orchestration) agentData.profile.orchestration = 'react';
            }
            
            await KB.init();
            const promptNode = await KB.getNode(`prompt_global_${this.activeAgentId.replace('@','')}`);
            if (promptNode) {
                promptContent = promptNode.content;
                this.agentSkills = promptNode.dependencies || []; // Usamos dependencies para las Skills del Agente
            }
        }

        this.container.innerHTML = `
            <style>
                .forge-layout { display: grid; grid-template-columns: 350px 1fr 400px; gap: 20px; height: 100%; min-height: 80vh;}
                @media (max-width: 1400px) { .forge-layout { grid-template-columns: 1fr 1fr; } .terminal-col { grid-column: 1 / -1; } }
                @media (max-width: 900px) { .forge-layout { grid-template-columns: 1fr; } }

                .forge-panel { background: linear-gradient(145deg, rgba(20,20,25,0.9), rgba(10,10,15,0.95)); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem; display: flex; flex-direction: column; box-shadow: 0 15px 35px rgba(0,0,0,0.5); backdrop-filter: blur(10px); overflow-y: auto;}
                .panel-header { font-size: 1.1rem; color: white; font-weight: 900; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; border-bottom: 1px dashed #333; padding-bottom: 10px;}
                
                .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;}
                .form-group label { color: var(--accent-blue); font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;}
                .form-control { background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; padding: 12px; border-radius: 10px; font-family: var(--font-main); font-size: 0.95rem; outline: none; transition: 0.2s; width: 100%; box-sizing: border-box;}
                .form-control:focus { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0,176,255,0.1);}
                
                .prompt-area { font-family: var(--font-mono); font-size: 0.85rem; line-height: 1.6; color: #ddd; resize: vertical; flex: 1; min-height: 200px;}
                
                .agent-dropzone { border: 2px dashed #444; border-radius: 12px; padding: 20px; text-align: center; color: #888; background: rgba(255,255,255,0.02); transition: 0.3s; display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 15px;}
                .agent-dropzone.drag-over { border-color: var(--accent-purple); background: rgba(224,64,251,0.05); color: white; transform: scale(1.02);}

                .skills-list { display: flex; flex-direction: column; gap: 10px; max-height: 300px; overflow-y: auto; padding-right: 5px; margin-bottom: 15px;}
                .skill-slot { background: rgba(0,230,118,0.05); border: 1px solid rgba(0,230,118,0.3); padding: 10px 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; transition: 0.2s;}
                .skill-slot:hover { border-color: var(--accent-green); background: rgba(0,230,118,0.1); }
                .skill-slot-title { color: white; font-weight: bold; font-size: 0.9rem; font-family: var(--font-mono);}
                .btn-remove-skill { background: transparent; border: none; color: var(--accent-red); cursor: pointer; font-size: 1.2rem; }

                .btn-lux { padding: 12px 20px; border-radius: 10px; font-weight: 900; font-size: 0.9rem; cursor: pointer; transition: 0.3s; border: none; display: flex; justify-content: center; align-items: center; gap: 8px;}
                .btn-primary { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; box-shadow: 0 5px 15px rgba(0,176,255,0.2);}
                .btn-primary:hover { filter: brightness(1.2); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,176,255,0.4);}
                .btn-success { background: var(--accent-green); color: black; box-shadow: 0 5px 15px rgba(0,230,118,0.2);}
                .btn-success:hover { filter: brightness(1.2); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,230,118,0.4);}
                .btn-outline { background: transparent; border: 1px dashed #888; color: #aaa; }
                .btn-outline:hover { background: rgba(255,255,255,0.05); color: white; border-color: white;}

                .terminal-container { flex: 1; background: #050508; border: 1px solid #333; border-radius: 12px; padding: 15px; font-family: var(--font-mono); font-size: 0.8rem; overflow-y: auto; color: #aaa; display: flex; flex-direction: column; gap: 10px;}
                .term-log { border-left: 2px solid #444; padding-left: 10px; margin-bottom: 5px; line-height: 1.4;}
                .term-log.thought { color: #a0a0a0; border-color: #888; }
                .term-log.action { color: var(--accent-blue); border-color: var(--accent-blue); font-weight: bold;}
                .term-log.observation { color: var(--accent-orange); border-color: var(--accent-orange); }
                .term-log.final { color: var(--accent-green); border-color: var(--accent-green); font-weight: bold; background: rgba(0,230,118,0.05); padding: 10px;}
                .term-log.error { color: var(--accent-red); border-color: var(--accent-red); background: rgba(255,82,82,0.05); padding: 10px;}
            </style>

            <div class="agent-dropzone" id="globalDropzone">
                <span style="font-size:2rem;">📥</span>
                <span>Arrastra un <b>.agent</b> para importar, o un <b>.skill</b> para equiparlo al agente actual.</span>
            </div>

            <div class="forge-layout">
                
                <div class="forge-panel">
                    <div class="panel-header"><span>🧬</span> Identidad Core</div>
                    <div class="form-group">
                        <label>ID / Alias</label>
                        <input type="text" id="ifId" class="form-control" placeholder="ej: @hades_devops" value="${agentData.id}" ${this.activeAgentId ? 'readonly' : ''}>
                    </div>
                    <div class="form-group">
                        <label>Nombre Público</label>
                        <input type="text" id="ifName" class="form-control" placeholder="Ej: Hades (DevOps)" value="${agentData.name}">
                    </div>
                    <div class="form-group">
                        <label>Motor Neuronal</label>
                        <select id="ifEngine" class="form-control">
                            <option value="anthropic" ${agentData.profile?.preferredEngine === 'anthropic' ? 'selected' : ''}>Anthropic (Claude 3.5)</option>
                            <option value="deepseek" ${agentData.profile?.preferredEngine === 'deepseek' ? 'selected' : ''}>DeepSeek (Coder)</option>
                            <option value="openai" ${agentData.profile?.preferredEngine === 'openai' ? 'selected' : ''}>OpenAI (GPT-4o)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label style="color:var(--accent-orange);">Patrón de Orquestación</label>
                        <select id="ifOrchestration" class="form-control" style="color:var(--accent-orange); font-weight:bold;">
                            <option value="react" ${agentData.profile?.orchestration === 'react' ? 'selected' : ''}>ReAct (Autónomo Dinámico)</option>
                            <option value="pipeline" ${agentData.profile?.orchestration === 'pipeline' ? 'selected' : ''}>Sequential Pipeline (Estricto)</option>
                            <option value="a2a" ${agentData.profile?.orchestration === 'a2a' ? 'selected' : ''}>A2A Swarm (Delegador)</option>
                        </select>
                    </div>
                    
                    <div style="flex:1;"></div>
                    <button class="btn-lux btn-success" id="btnSaveAgent">💾 Sellar en el Padrón</button>
                    <button class="btn-lux btn-outline" id="btnExportAgent" style="margin-top:10px;">📦 Exportar .agent</button>
                </div>

                <div class="forge-panel">
                    <div class="panel-header"><span>🧠</span> Cerebro y Herramientas (MCP)</div>
                    <div class="form-group" style="flex:1; display:flex; flex-direction:column;">
                        <label>AGENT.md (System Prompt Inmutable)</label>
                        <textarea id="ifPrompt" class="form-control prompt-area" placeholder="Eres un Agente experto en... Tu misión es...">${promptContent}</textarea>
                    </div>
                    
                    <div class="panel-header" style="margin-top:20px;"><span>🎒</span> Cinturón de Skills</div>
                    <div class="skills-list" id="agentSkillsList">
                        <div style="color:#888; text-align:center; padding:20px; font-style:italic;">Cargando herramientas...</div>
                    </div>
                    <button class="btn-lux btn-outline" id="btnBrowseSkills" style="border-style:dashed;">➕ Explorar Knowledge Base</button>
                </div>

                <div class="forge-panel terminal-col">
                    <div class="panel-header"><span>🧪</span> Simulador ReAct (Laboratorio)</div>
                    <div class="form-group">
                        <label>Simular Work Order (Input)</label>
                        <textarea id="simInput" class="form-control" rows="3" placeholder="Ej: Optimiza el archivo auth.js y verifica que pase los tests." style="font-family:var(--font-mono);"></textarea>
                    </div>
                    <button class="btn-lux btn-primary" id="btnRunSim" style="margin-bottom:15px;">▶ Ejecutar Simulación</button>
                    
                    <div class="terminal-container" id="simTerminal">
                        <div style="color:#555;">[System] Esperando inyección de prompt...</div>
                    </div>
                </div>

            </div>
        `;

        this.attachEvents();
        await this.renderSkillsList();
    }

    async renderSkillsList() {
        const listEl = this.container.querySelector('#agentSkillsList');
        if (!listEl) return;

        if (this.agentSkills.length === 0) {
            listEl.innerHTML = '<div style="color:#555; text-align:center; padding:10px; font-style:italic; font-size:0.85rem;">Agente desnudo. No tiene Skills equipadas.</div>';
            return;
        }

        await KB.init();
        let html = '';
        for (const skillId of this.agentSkills) {
            const node = await KB.getNode(skillId);
            if (node) {
                html += `
                    <div class="skill-slot">
                        <div>
                            <div class="skill-slot-title">🎒 ${node.title}</div>
                            <div style="font-size:0.7rem; color:var(--accent-green); margin-top:3px;">ID: ${node.id}</div>
                        </div>
                        <button class="btn-remove-skill" data-id="${skillId}" title="Desequipar Skill">&times;</button>
                    </div>
                `;
            }
        }
        listEl.innerHTML = html;

        listEl.querySelectorAll('.btn-remove-skill').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.agentSkills = this.agentSkills.filter(id => id !== e.target.dataset.id);
                this.renderSkillsList();
            });
        });
    }

    loadJSZip() {
        return new Promise((resolve) => {
            if (window.JSZip) return resolve();
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    attachEvents() {
        this.dom = {
            btnSave: this.container.querySelector('#btnSaveAgent'),
            btnExport: this.container.querySelector('#btnExportAgent'),
            btnRunSim: this.container.querySelector('#btnRunSim'),
            btnBrowseSkills: this.container.querySelector('#btnBrowseSkills'),
            dropzone: this.container.querySelector('#globalDropzone'),
            simInput: this.container.querySelector('#simInput'),
            simTerminal: this.container.querySelector('#simTerminal')
        };

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => this.dom.dropzone.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false));
        ['dragenter', 'dragover'].forEach(eventName => this.dom.dropzone.addEventListener(eventName, () => this.dom.dropzone.classList.add('drag-over'), false));
        ['dragleave', 'drop'].forEach(eventName => this.dom.dropzone.addEventListener(eventName, () => this.dom.dropzone.classList.remove('drag-over'), false));

        this.dom.dropzone.addEventListener('drop', async (e) => {
            const file = e.dataTransfer.files[0];
            if (!file) return;

            if (file.name.endsWith('.skill')) {
                const skillId = await this.importSkillZip(file);
                if (skillId && !this.agentSkills.includes(skillId)) {
                    this.agentSkills.push(skillId);
                    this.renderSkillsList();
                    alert(`✅ Skill equipada en la memoria volátil del Agente.`);
                }
            } else if (file.name.endsWith('.agent') || file.name.endsWith('.zip')) {
                await this.importAgentZip(file);
            } else {
                alert("Formato no soportado. Usa .agent o .skill");
            }
        });

        this.dom.btnBrowseSkills.addEventListener('click', async () => {
            await KB.init();
            const allNodes = await KB.getAllNodes({ type: 'skill' });
            
            let promptText = "Catálogo de Skills Disponibles (Introduce el ID exacto):\n\n";
            allNodes.forEach(n => promptText += `- [${n.id}] ${n.title}\n`);
            
            const selectedId = prompt(promptText);
            if (selectedId && allNodes.find(n => n.id === selectedId)) {
                if (!this.agentSkills.includes(selectedId)) {
                    this.agentSkills.push(selectedId);
                    this.renderSkillsList();
                }
            } else if (selectedId) {
                alert("ID no encontrado en la Knowledge Base.");
            }
        });

        this.dom.btnSave.addEventListener('click', async () => {
            let id = this.container.querySelector('#ifId').value.trim();
            if (!id) return alert("El Alias / ID es obligatorio.");
            if (!id.startsWith('@')) id = '@' + id;

            this.dom.btnSave.disabled = true;
            this.dom.btnSave.innerText = "⏳ Sellando Córtex...";

            try {
                const newUserData = {
                    id: id,
                    name: this.container.querySelector('#ifName').value.trim() || 'Agente Anónimo',
                    globalRole: 'ai-agent',
                    profile: { 
                        isAi: true, 
                        guardian: 'creator', 
                        preferredEngine: this.container.querySelector('#ifEngine').value,
                        orchestration: this.container.querySelector('#ifOrchestration').value
                    }
                };

                if (this.activeAgentId) await store.dispatch({ type: 'UPDATE_USER', payload: newUserData });
                else await store.dispatch({ type: 'ADD_USER', payload: newUserData });

                await KB.init();
                await KB.saveNode({
                    id: `prompt_global_${id.replace('@','')}`,
                    type: 'prompt_a2a', category: 'meta_prompt', targetId: id, roleTarget: id,
                    title: `AGENT.md: ${newUserData.name}`,
                    content: this.container.querySelector('#ifPrompt').value.trim(),
                    dependencies: this.agentSkills, // Aquí guardamos las Skills equipadas
                    keywords: ['ai_agent', id]
                });

                alert(`✅ Agente ${id} ensamblado y listo para el despliegue.`);
                if (!this.activeAgentId) this.render(id);
            } catch (e) {
                alert("Error al guardar: " + e.message);
            } finally {
                this.dom.btnSave.disabled = false;
                this.dom.btnSave.innerText = "💾 Sellar en el Padrón";
            }
        });

        this.dom.btnExport.addEventListener('click', async () => {
            if (!window.JSZip) await this.loadJSZip();
            const id = this.container.querySelector('#ifId').value.trim() || 'unnamed_agent';
            const name = this.container.querySelector('#ifName').value.trim();
            const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase() || 'agent';
            this.dom.btnExport.disabled = true;
            this.dom.btnExport.innerText = "⏳ Empaquetando...";

            try {
                const zip = new window.JSZip();
                const rootFolder = zip.folder(safeName);
                const promptContent = this.container.querySelector('#ifPrompt').value.trim();
                rootFolder.file("AGENT.md", `---\nalias: ${id}\nname: ${name}\n---\n\n${promptContent}`);
                const configData = { version: "1.0", engine: this.container.querySelector('#ifEngine').value, orchestration: this.container.querySelector('#ifOrchestration').value, skills: this.agentSkills };
                rootFolder.file("config.json", JSON.stringify(configData, null, 2));
                if (this.agentSkills.length > 0) {
                    const skillsFolder = rootFolder.folder("skills");
                    await KB.init();
                    for (const skillId of this.agentSkills) {
                        const skillNode = await KB.getNode(skillId);
                        if (skillNode) {
                            skillsFolder.file(`${skillNode.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`, JSON.stringify(skillNode, null, 2));
                        }
                    }
                }
                const blob = await zip.generateAsync({type:"blob"});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `${safeName}.agent`;
                document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
            } catch (e) { alert("Fallo al exportar: " + e.message); } finally { this.dom.btnExport.disabled = false; this.dom.btnExport.innerText = "📦 Exportar .agent"; }
        });

        // 🔥 SIMULADOR REACT (LOGIC LOOP CON INYECCIÓN DE SKILLS)
        this.dom.btnRunSim.addEventListener('click', async () => {
            if (this.isSimulating) return;
            const taskInput = this.dom.simInput.value.trim();
            if (!taskInput) return alert("Escribe una tarea para simular.");

            this.isSimulating = true;
            this.dom.btnRunSim.innerText = "⏳ Simulando Bucle Cognitivo...";
            this.dom.simTerminal.innerHTML = `<div class="term-log thought">[Sim] Iniciando protocolo de orquestación [${this.container.querySelector('#ifOrchestration').value.toUpperCase()}]...</div>`;

            try {
                await KB.init();
                let toolsDescriptions = "HERRAMIENTAS MCP DISPONIBLES (AgentSkills):\n";
                for (const skillId of this.agentSkills) {
                    const skillNode = await KB.getNode(skillId);
                    if (skillNode) {
                        // Limpiamos la descripción para el System Prompt
                        const cleanDesc = (skillNode.description || skillNode.title).replace(/\n/g, ' ');
                        toolsDescriptions += `- [${skillNode.id}]: ${cleanDesc}\n`;
                    }
                }

                if (this.agentSkills.length === 0) toolsDescriptions = "Sin herramientas MCP disponibles. Solo puedes usar tu conocimiento interno.";

                const systemPrompt = `
                    Eres un Agente en un simulador. Tu System Prompt nativo es:
                    """${this.container.querySelector('#ifPrompt').value.trim()}"""
                    
                    Tu patrón de orquestación es ReAct. Tienes acceso a estas herramientas MCP:
                    ${toolsDescriptions}
                    
                    Debe resolver la tarea del usuario.
                    Muestra tu cadena de pensamiento EXACTAMENTE en este formato:
                    THOUGHT: [Tu razonamiento de qué hacer ahora]
                    ACTION: [ID de la Herramienta o "Ninguna"]
                    OBSERVATION: [Lo que esperas que pase o el resultado simulado]
                    FINAL: [Tu respuesta final o entregable]
                `;

                const provider = this.container.querySelector('#ifEngine').value;
                const apiKey = localStorage.getItem(`tt_key_${provider}`);

                // LLAMADA 1: El Agente piensa y decide usar una Tool
                let response = await Orchestrator.callLLM({ preferredEngine: provider, apiKey: apiKey, systemPrompt: systemPrompt, userPrompt: `TAREA: ${taskInput}`, responseFormat: "text", temperature: 0.2 });
                let rawText = response.content;
                
                // Formateamos y pintamos la primera respuesta
                this.formatTerminalOutput(rawText);

                // 🔥 LOGICA DEL SIMULADOR: ¿El Agente quiere usar una Skill?
                if (rawText.includes('ACTION: Ninguna') || rawText.includes('FINAL:')) {
                    this.isSimulating = false; // Bucle cerrado
                } else {
                    // El Agente quiere usar una Tool. Detectamos cuál.
                    const actionMatch = rawText.match(/ACTION:\s*([^\n]+)/);
                    if (actionMatch) {
                        const toolId = actionMatch[1].trim();
                        if (toolId === 'skill_global_project_navigator') {
                            this.dom.simTerminal.innerHTML += `<div class="term-log action">⏳ [Kernel] Ejecutando Skill 'project_navigator' in-situ...</div>`;
                            
                            // 🔥 MOCKEAMOS LA SALIDA DEL NAVEGADOR
                            // En producción, aquí Orchestrator consultaría el Ledger.
                            const state = store.getState();
                            const pId = localStorage.getItem('tt_active_project');
                            const proj = state.projects.find(x => x.id === pId);
                            
                            if (proj) {
                                let total = 0;
                                let ledger = 0;
                                if (proj.transactions) {
                                    total = proj.transactions.length;
                                    ledger = proj.transactions.filter(tx => tx.status === 'theoretical' || tx.status === '理論上').length;
                                } else if (proj.work_orders) {
                                    total = proj.work_orders.length;
                                    ledger = proj.work_orders.filter(tx => tx.status === 'ledger').length;
                                }

                                const mockOutput = JSON.stringify({
                                    projectId: pId,
                                    projectName: proj.nombre,
                                    totalWorkOrders: total,
                                    workOrdersInLedger: ledger,
                                    currency: 'SLICES'
                                });

                                // Inyectamos la Observación simulada
                                this.dom.simTerminal.innerHTML += `<div class="term-log observation">👁️ Observación Real (from DB): ${mockOutput}</div>`;
                                
                                // LLAMADA 2: Le devolvemos el JSON de la DB al Agente para que dé su respuesta FINAL.
                                this.dom.simTerminal.innerHTML += `<div class="term-log thought">⏳ [Sim] Agente calculando resultado final...</div>`;
                                
                                const nextUserPrompt = `[OBSERVATION FROM KERNEL]: ${mockOutput}. Basado en esto, da tu 'FINAL:'.`;
                                response = await Orchestrator.callLLM({ preferredEngine: provider, apiKey: apiKey, systemPrompt: systemPrompt, userPrompt: nextUserPrompt, responseFormat: "text", temperature: 0.2 });
                                this.formatTerminalOutput(response.content);
                            } else {
                                this.dom.simTerminal.innerHTML += `<div class="term-log error">💥 [Error] No hay proyecto activo en el navegador.</div>`;
                            }
                        } else {
                            this.dom.simTerminal.innerHTML += `<div class="term-log observation">👁️ Observación Simulada: El orquestador de simulación no tiene implementado el Mock para la skill '${toolId}'. Asumiendo éxito.</div>`;
                        }
                    }
                }

            } catch (e) {
                this.dom.simTerminal.innerHTML += `<div class="term-log error">💥 ERROR DE KERNEL: ${e.message}</div>`;
            } finally {
                this.isSimulating = false;
                this.dom.btnRunSim.innerText = "▶ Ejecutar Simulación";
                this.dom.simTerminal.scrollTop = this.dom.simTerminal.scrollHeight;
            }
        });
    }

    formatTerminalOutput(rawText) {
        const lines = rawText.split('\n');
        let formattedHtml = '';
        lines.forEach(l => {
            if (l.startsWith('THOUGHT:')) formattedHtml += `<div class="term-log thought">🧠 ${l.substring(8)}</div>`;
            else if (l.startsWith('ACTION:')) formattedHtml += `<div class="term-log action">⚡ Acción (MCP Tool): ${l.substring(7)}</div>`;
            else if (l.startsWith('OBSERVATION:')) formattedHtml += `<div class="term-log observation">👁️ Observación Simulada: ${l.substring(12)}</div>`;
            else if (l.startsWith('FINAL:')) formattedHtml += `<div class="term-log final">✅ Entregable FINAL: ${l.substring(6)}</div>`;
            else if (l.trim().length > 0) formattedHtml += `<div class="term-log thought">${l}</div>`;
        });
        this.dom.simTerminal.innerHTML += formattedHtml;
    }

    async importSkillZip(file) {
        if (!window.JSZip) await this.loadJSZip();
        try {
            const zip = new window.JSZip();
            const contents = await zip.loadAsync(file);
            const skillFileKey = Object.keys(contents.files).find(k => k.endsWith('SKILL.md'));
            if (!skillFileKey) throw new Error("No es una skill válida.");
            
            const skillText = await contents.files[skillFileKey].async("text");
            const nameMatch = skillText.match(/name:\s*(.+)/);
            const title = nameMatch ? nameMatch[1].trim() : file.name;
            
            const newNodeId = `skill_imported_${Date.now()}`;
            await KB.init();
            await KB.saveNode({
                id: newNodeId, type: 'skill', category: 'skill', projectId: 'global', targetId: 'global',
                title: title, description: 'Skill inyectada vía AgentForge', content: skillText
            });
            return newNodeId;
        } catch (e) {
            alert("Fallo inyectando Skill: " + e.message);
            return null;
        }
    }

    async importAgentZip(file) {
        if (!window.JSZip) await this.loadJSZip();
        try {
            const zip = new window.JSZip();
            const contents = await zip.loadAsync(file);
            
            const configKey = Object.keys(contents.files).find(k => k.endsWith('config.json'));
            const agentKey = Object.keys(contents.files).find(k => k.endsWith('AGENT.md'));
            
            if (!configKey || !agentKey) throw new Error("Paquete .agent corrupto. Falta config.json o AGENT.md");

            const configText = await contents.files[configKey].async("text");
            const agentText = await contents.files[agentKey].async("text");
            
            const config = JSON.parse(configText);
            
            let promptContent = agentText;
            let alias = `@imported_agent_${Math.floor(Math.random()*1000)}`;
            let name = "Agente Importado";
            
            const yamlRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
            const match = agentText.match(yamlRegex);
            if (match) {
                const yaml = match[1];
                promptContent = match[2].trim();
                const aliasMatch = yaml.match(/alias:\s*(.+)/);
                if (aliasMatch) alias = aliasMatch[1].trim();
                const nameMatch = yaml.match(/name:\s*(.+)/);
                if (nameMatch) name = nameMatch[1].trim();
            }

            this.container.querySelector('#ifId').value = alias;
            this.container.querySelector('#ifName').value = name;
            this.container.querySelector('#ifEngine').value = config.engine || 'openai';
            this.container.querySelector('#ifOrchestration').value = config.orchestration || 'react';
            this.container.querySelector('#ifPrompt').value = promptContent;
            
            // En una iteración profunda, leeríamos la carpeta /skills/ del ZIP y las inyectaríamos en el KB
            this.agentSkills = [];
            this.renderSkillsList();

            alert(`📥 Córtex de ${name} extraído. Revisa los datos, equipa las Skills necesarias y dale a 'Sellar'.`);

        } catch(e) {
            alert("Fallo desempaquetando Agente: " + e.message);
        }
    }
}
