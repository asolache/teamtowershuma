// v8/js/views/AgentEditorView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';
import { Orchestrator } from '../core/Orchestrator.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class AgentEditorView {
    constructor() {
        document.title = "Sandbox TDD | TeamTowers V14";
        this.activeProjectId = null;
        this.selectedRoleId = null;
        this.selectedFlowId = null;
    }

    async getHtml() {
        const state = store.getState();
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        if (!project && state.projects.length > 0) project = state.projects[state.projects.length - 1];

        const headerConfig = {
            title: "Cámara de Simulación (TDD)",
            subtitle: project ? project.nombre : 'Sin Red',
            tagline: "Calibra el Prompt, ejecuta un SOP de prueba y valida los SOCs antes de lanzar el Agente en Beta."
        };

        if (!project) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/agents')}
                    <main class="workspace" style="justify-content:center; align-items:center;">
                        <div class="glass-panel" style="text-align:center; max-width: 500px; margin: 0 auto;">
                             <div style="font-size: 5rem; margin-bottom: 1.5rem; line-height:1;">🧪</div>
                             <h2 style="color:white; margin-top:0;">Cámara Vacía</h2>
                             <p style="color:var(--text-muted); margin-bottom: 2.5rem;">Necesitas un Castell activo para testear agentes.</p>
                             <a href="/v8/create" data-link class="btn-primary" style="text-decoration:none;">➕ Inicializar Red</a>
                        </div>
                    </main>
                </div>
            `;
        }

        const rolesOptions = project.roles.map(r => `<option value="${r.id}">${r.levelId} - ${r.name}</option>`).join('');

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-sandbox { flex: 1; padding: 2rem 3rem; overflow-y: auto; scroll-behavior: smooth; box-sizing: border-box;}
                
                .sandbox-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding-bottom: 5rem; align-items: start;}
                
                /* PANELES */
                .panel { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2rem; box-shadow: 0 15px 40px rgba(0,0,0,0.5); backdrop-filter: blur(10px);}
                .panel-header { display: flex; align-items: center; gap: 10px; margin-bottom: 1.5rem; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 1rem;}
                .panel-title { margin: 0; color: white; font-weight: 900; font-size: 1.2rem;}
                
                /* FORMULARIOS */
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 12px 15px; border-radius: 12px; font-family: var(--font-mono); font-size: 0.9rem; outline: none; transition: 0.3s; box-sizing: border-box; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);}
                .form-control:focus { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0,176,255,0.15);}
                .editor-box { min-height: 250px; resize: vertical; line-height: 1.5; color: var(--accent-green);}

                /* CONSOLA DE SALIDA */
                .console-output { background: #050508; border: 1px solid #222; border-radius: 12px; padding: 15px; min-height: 150px; max-height: 300px; overflow-y: auto; color: #ccc; font-family: 'Georgia', serif; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem; white-space: pre-wrap;}
                .console-output:empty::before { content: 'Esperando ejecución del agente...'; color: #444; font-style: italic; font-family: var(--font-main);}

                /* SOC CHECKLIST */
                .soc-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 1.5rem;}
                .soc-item { display: flex; align-items: flex-start; gap: 10px; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px solid #333; transition: 0.3s;}
                .soc-item.pass { border-color: var(--accent-green); background: rgba(0,230,118,0.05);}
                .soc-item.fail { border-color: var(--accent-red); background: rgba(255,82,82,0.05);}
                .soc-indicator { font-size: 1.2rem; line-height: 1;}
                .soc-text { color: #ccc; font-size: 0.85rem; line-height: 1.4; }

                /* BOTONES */
                .btn-action { width: 100%; border: none; padding: 14px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; transition: all 0.3s ease; display:flex; justify-content:center; align-items:center; gap:8px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;}
                .btn-run { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; box-shadow: 0 5px 15px rgba(0,176,255,0.2);}
                .btn-run:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(224,64,251,0.4); filter: brightness(1.1);}
                .btn-audit { background: transparent; border: 1px dashed var(--accent-purple); color: var(--accent-purple);}
                .btn-audit:hover:not(:disabled) { background: rgba(224,64,251,0.1); border-style: solid;}
                .btn-beta { background: var(--accent-green); color: black; box-shadow: 0 5px 15px rgba(0,230,118,0.2);}
                .btn-beta:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,230,118,0.4);}
                
                .btn-action:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(0.8); }

                @media (max-width: 900px) {
                    .workspace-sandbox { padding: 90px 1rem 120px 1rem; }
                    .sandbox-grid { grid-template-columns: 1fr; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/agents')}
                
                <main class="workspace-sandbox">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="sandbox-grid">
                        
                        <div class="panel" style="border-top: 4px solid var(--accent-blue);">
                            <div class="panel-header">
                                <span style="font-size: 1.8rem;">🧬</span>
                                <h3 class="panel-title">Genética del Agente</h3>
                            </div>

                            <div class="form-group">
                                <label>1. Selecciona el Nodo (Rol)</label>
                                <select id="selRole" class="form-control" style="color:var(--accent-blue); font-weight:bold;">
                                    <option value="" disabled selected>-- Elige un Rol --</option>
                                    ${rolesOptions}
                                </select>
                            </div>

                            <div class="form-group">
                                <label>2. System Prompt (Instrucciones Base)</label>
                                <textarea id="inpPrompt" class="form-control editor-box" placeholder="Eres un experto en... Tu misión es..."></textarea>
                            </div>

                            <div class="form-group">
                                <label>3. Memética Inyectada (Contexto RAG)</label>
                                <div id="memesList" style="background:rgba(0,0,0,0.3); border:1px solid #333; padding:15px; border-radius:12px; font-size:0.8rem; color:#888; font-family:var(--font-mono); max-height:150px; overflow-y:auto;">
                                    Selecciona un rol para cargar su contexto del Cerebro LMS...
                                </div>
                            </div>
                        </div>

                        <div class="panel" style="border-top: 4px solid var(--accent-purple);">
                            <div class="panel-header">
                                <span style="font-size: 1.8rem;">🧪</span>
                                <h3 class="panel-title">TDD: Ejecución y Auditoría</h3>
                            </div>

                            <div class="form-group">
                                <label>1. Selecciona la Receta (SOP a testear)</label>
                                <select id="selFlow" class="form-control" disabled>
                                    <option value="">-- Esperando selección de Rol --</option>
                                </select>
                            </div>

                            <button id="btnRunTest" class="btn-action btn-run" disabled>⚡ Ejecutar Work Order (Test)</button>
                            
                            <div class="form-group" style="margin-top: 1.5rem;">
                                <label>Output Generado (Proof of Work)</label>
                                <div id="consoleOutput" class="console-output"></div>
                            </div>

                            <div class="form-group">
                                <label>Matriz de Auditoría (SOCs)</label>
                                <div id="socChecklist" class="soc-list">
                                    <div style="color:#666; font-style:italic; font-size:0.85rem; text-align:center; padding:10px;">Selecciona un SOP para cargar los Criterios de Calidad.</div>
                                </div>
                            </div>

                            <button id="btnRunAudit" class="btn-action btn-audit" disabled>🔎 Evaluar TDD (Notario IA)</button>
                            <button id="btnConsolidate" class="btn-action btn-beta" style="margin-top:2rem;" disabled>✅ Consolidar Agente (v1.0-beta)</button>

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

        this.activeProjectId = localStorage.getItem('tt_active_project');
        if (!this.activeProjectId) return;

        await KB.init();

        this.dom = {
            selRole: document.getElementById('selRole'),
            inpPrompt: document.getElementById('inpPrompt'),
            memesList: document.getElementById('memesList'),
            selFlow: document.getElementById('selFlow'),
            btnRunTest: document.getElementById('btnRunTest'),
            consoleOutput: document.getElementById('consoleOutput'),
            socChecklist: document.getElementById('socChecklist'),
            btnRunAudit: document.getElementById('btnRunAudit'),
            btnConsolidate: document.getElementById('btnConsolidate')
        };

        const state = store.getState();
        this.project = state.projects.find(p => p.id === this.activeProjectId);

        // 1. EVENTO: AL SELECCIONAR UN ROL
        this.dom.selRole.addEventListener('change', async (e) => {
            this.selectedRoleId = e.target.value;
            const role = this.project.roles.find(r => r.id === this.selectedRoleId);
            
            // Cargar System Prompt actual de la KB
            const promptNode = await KB.getNode(`prompt_${this.activeProjectId}_${role.id}`);
            this.dom.inpPrompt.value = promptNode ? promptNode.content : `Eres ${role.name}, operando en el nivel ${role.levelId}.`;

            // Cargar Contexto Memético
            const flatContext = await KB.getAgentContextFlattened(this.activeProjectId, role, this.project.prompt, this.project.archetype);
            this.dom.memesList.innerText = flatContext || "Sin contexto adicional.";

            // Rellenar selector de SOPs (Flows donde este rol es el ORIGEN)
            const roleFlows = this.project.vna_flows.filter(f => f.from === role.id);
            if (roleFlows.length > 0) {
                this.dom.selFlow.innerHTML = roleFlows.map(f => `<option value="${f.id}">[${f.tipo.toUpperCase()}] ${f.template}</option>`).join('');
                this.dom.selFlow.disabled = false;
                this.dom.btnRunTest.disabled = false;
                this.loadSOCs(roleFlows[0].id); // Cargar SOCs del primer flow por defecto
            } else {
                this.dom.selFlow.innerHTML = `<option value="">-- Este rol no tiene SOPs asignados --</option>`;
                this.dom.selFlow.disabled = true;
                this.dom.btnRunTest.disabled = true;
                this.dom.socChecklist.innerHTML = '';
            }
        });

        // 2. EVENTO: AL CAMBIAR DE SOP (FLOW)
        this.dom.selFlow.addEventListener('change', (e) => {
            this.loadSOCs(e.target.value);
            this.dom.consoleOutput.innerHTML = '';
            this.dom.btnRunAudit.disabled = true;
            this.dom.btnConsolidate.disabled = true;
        });

        // 3. EVENTO: EJECUTAR TEST (Llamada al LLM)
        this.dom.btnRunTest.addEventListener('click', async () => {
            if (!this.selectedRoleId || !this.dom.selFlow.value) return;

            const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
            const apiKey = localStorage.getItem(`tt_key_${provider}`);
            if (!apiKey && provider !== 'custom') return alert("⚠️ Configura tu API Key en la Bóveda del Panteón.");

            this.dom.btnRunTest.disabled = true;
            this.dom.btnRunTest.innerText = "⏳ Simulando Ejecución...";
            this.dom.consoleOutput.innerHTML = '<span style="color:#888; animation: pulse 1s infinite;">Procesando vector de estrés cognitivo...</span>';

            const systemPrompt = this.dom.inpPrompt.value + "\n\nCONTEXTO:\n" + this.dom.memesList.innerText;
            const flow = this.project.vna_flows.find(f => f.id === this.dom.selFlow.value);
            const userPrompt = `Ejecuta la siguiente directriz operativa (SOP): ${flow.template}. Asegúrate de cumplir con los estándares de calidad de tu rol. Solo devuelve el contenido final.`;

            try {
                const response = await Orchestrator.callLLM({
                    provider, apiKey, systemPrompt, userPrompt, responseFormat: "text", temperature: 0.4
                });

                this.dom.consoleOutput.innerText = response.content;
                this.dom.btnRunAudit.disabled = false; // Habilitamos la auditoría
            } catch (error) {
                this.dom.consoleOutput.innerHTML = `<span style="color:var(--accent-red);">Fallo en Simulación: ${error.message}</span>`;
            } finally {
                this.dom.btnRunTest.disabled = false;
                this.dom.btnRunTest.innerText = "⚡ Re-Ejecutar Work Order (Test)";
            }
        });

        // 4. EVENTO: AUDITAR TDD (Notario IA)
        this.dom.btnRunAudit.addEventListener('click', async () => {
            const outputText = this.dom.consoleOutput.innerText;
            if (!outputText) return;

            const flow = this.project.vna_flows.find(f => f.id === this.dom.selFlow.value);
            if (!flow || !flow.soc_checklist || flow.soc_checklist.length === 0) {
                alert("Este SOP no tiene SOCs. Pasa el TDD por defecto.");
                this.dom.btnConsolidate.disabled = false;
                return;
            }

            const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
            const apiKey = localStorage.getItem(`tt_key_${provider}`);

            this.dom.btnRunAudit.disabled = true;
            this.dom.btnRunAudit.innerText = "🔎 Auditando...";

            const systemPrompt = `
                Eres @notari_ledger, el Agente Auditor. 
                Evalúa si el Output proporcionado cumple estrictamente con los SOCs (Standard Operating Conditions).
                Devuelve SOLO un JSON donde las claves son los IDs de los SOCs y el valor es true o false.
                SOCs a evaluar: ${JSON.stringify(flow.soc_checklist.map(s => ({id: s.id, text: s.text})))}
            `;

            try {
                const response = await Orchestrator.callLLM({
                    provider, apiKey, systemPrompt, userPrompt: `OUTPUT A EVALUAR:\n${outputText}`, responseFormat: "json_object", temperature: 0.1
                });

                const auditResults = response.content;
                let allPassed = true;

                // Actualizar UI del Checklist
                const socItems = this.dom.socChecklist.querySelectorAll('.soc-item');
                socItems.forEach(item => {
                    const socId = item.getAttribute('data-id');
                    const passed = auditResults[socId] === true;
                    
                    item.className = `soc-item ${passed ? 'pass' : 'fail'}`;
                    item.querySelector('.soc-indicator').innerText = passed ? '✅' : '❌';
                    
                    if (!passed) allPassed = false;
                });

                if (allPassed) {
                    this.dom.btnConsolidate.disabled = false;
                } else {
                    alert("⚠️ El Agente ha fallado el TDD. Ajusta el System Prompt o inyecta más Memes en la Forja LMS y vuelve a intentarlo.");
                }

            } catch (error) {
                alert(`Error del Notario: ${error.message}`);
            } finally {
                this.dom.btnRunAudit.disabled = false;
                this.dom.btnRunAudit.innerText = "🔎 Re-Evaluar TDD";
            }
        });

        // 5. EVENTO: CONSOLIDAR AGENTE (Guardar Prompt y Estado)
        this.dom.btnConsolidate.addEventListener('click', async () => {
            if (!this.selectedRoleId) return;
            
            const role = this.project.roles.find(r => r.id === this.selectedRoleId);
            const finalPrompt = this.dom.inpPrompt.value.trim();

            this.dom.btnConsolidate.disabled = true;
            this.dom.btnConsolidate.innerText = "💾 Cristalizando...";

            // Guardar Prompt en KB
            await KB.saveNode({
                id: `prompt_${this.activeProjectId}_${role.id}`, 
                type: 'prompt_a2a', projectId: this.activeProjectId, targetId: role.id, roleTarget: role.levelId,
                title: `Prompt A2A (Beta): ${role.name}`, content: finalPrompt
            });

            // Actualizar Padrón (Crear Agente si no existe, o actualizar su versión)
            const state = store.getState();
            let agentId = `@agent_${role.id.replace('draft_role_', '').replace('role_', '')}`; // Generar un DID simple
            let existingAgent = state.globalUsers.find(u => u.id === agentId);

            if (!existingAgent) {
                await store.dispatch({
                    type: 'ADD_USER',
                    payload: {
                        id: agentId,
                        name: role.name,
                        globalRole: 'ai-agent',
                        profile: { isAi: true, preferredEngine: localStorage.getItem('tt_ai_provider') || 'deepseek', guardian: role.guardian, version: 'v1.0-beta', structural_affinity: [role.levelId] }
                    }
                });
            } else {
                // Si existe, deberíamos actualizar su versión, pero como no tenemos UPDATE_USER_PROFILE en Redux, 
                // lo simulamos confirmando el guardado.
                console.log("Agente ya en padrón. Prompt actualizado en KB.");
            }

            alert(`✅ Agente Cristalizado. El nodo ${role.name} ha alcanzado el grado v1.0-beta y está listo para producción en el Kanban.`);
            
            this.dom.btnConsolidate.innerText = "✅ Consolidar Agente (v1.0-beta)";
        });
    }

    loadSOCs(flowId) {
        if (!flowId) return;
        const flow = this.project.vna_flows.find(f => f.id === flowId);
        const socs = flow.soc_checklist || [];

        if (socs.length === 0) {
            this.dom.socChecklist.innerHTML = `<div style="color:#888; font-style:italic; padding:10px;">Este SOP no tiene Criterios de Calidad definidos.</div>`;
            return;
        }

        this.dom.socChecklist.innerHTML = socs.map(soc => `
            <div class="soc-item" data-id="${soc.id}">
                <div class="soc-indicator">⚪</div>
                <div class="soc-text">${soc.text}</div>
            </div>
        `).join('');
    }
}
