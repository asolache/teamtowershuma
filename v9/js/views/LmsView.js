// =============================================================================
// TEAMTOWERS SOS V10 — LMS VIEW
// Ruta: ia/dev/js/views/LmsView.js
// La Forja · Cerebro LMS · Padrón W3C · Meta-Grafo 3D
// =============================================================================

import { store }          from '../core/store.js';
import { KB }             from '../core/kb.js';
import { Sidebar }        from '../components/Sidebar.js';
import { BottomNav }      from '../components/BottomNav.js';
import { PageHeader }     from '../components/PageHeader.js';
import { SynapticCanvas } from '../components/SynapticCanvas.js';
import { Orchestrator }   from '../core/Orchestrator.js';
import { SkillExplorer }  from '../components/SkillExplorer.js';
import { SkillForgeModal } from '../components/SkillForgeModal.js';

export default class LmsView {

    constructor() {
        document.title       = 'La Forja LMS | TeamTowers V10';
        this.currentTab      = 'list';
        this.synapticInstance = null;
        this.skillExplorer   = null;
        this.skillForgeModal = null;
        this.dom             = {};
    }

    async getHtml() {
        await store.init();

        const headerConfig = {
            title:   'La Forja (Cerebro LMS)',
            subtitle: 'Conocimiento W3C & Meta-Grafo',
            tagline: 'Explora la memoria, forja habilidades, testea el Córtex (CI/CD) y orquesta Agentes desde la vista de águila.',
            tabs: [
                { id: 'list',  label: '🗂️ Padrón W3C (Lista)', active: this.currentTab === 'list'  },
                { id: 'graph', label: '🌌 Meta-Grafo 3D',       active: this.currentTab === 'graph' }
            ],
            actionHtml: `<a href="/paper" data-link class="btn-primary" style="text-decoration:none; padding:8px 16px; font-size:0.85rem;">+ Crear en Omni-Paper</a>`
        };

        return `
        <style>
            .app-layout   { display:flex; height:100dvh; overflow:hidden; background:var(--bg-dark); font-family:var(--font-main); width:100%; }
            .workspace-lms { flex:1; padding:2rem 3rem; overflow-y:auto; overflow-x:hidden; scroll-behavior:smooth; box-sizing:border-box; position:relative; background:radial-gradient(circle at center,#111116 0%,#050505 100%); }

            .tab-content        { display:none; animation:fadeIn 0.4s ease-out; padding-bottom:5rem; width:100%; box-sizing:border-box; }
            .tab-content.active { display:block; }
            .tab-content.graph-active { display:flex; flex-direction:column; height:calc(100dvh - 190px); padding-bottom:0; }

            .lms-controls-row   { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:12px; }
            .filters-bar        { display:flex; gap:8px; background:rgba(0,0,0,0.5); padding:9px; border-radius:12px; border:1px solid var(--glass-border); overflow-x:auto; }
            .filter-btn         { background:transparent; border:1px solid #444; color:#888; padding:7px 14px; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.3s; white-space:nowrap; font-family:var(--font-mono); font-size:0.78rem; }
            .filter-btn:hover   { border-color:var(--accent-indigo); color:white; }
            .filter-btn.active  { background:rgba(99,102,241,0.1); border-color:var(--accent-indigo); color:var(--accent-indigo); }

            .btn-deep-research  { background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(224,64,251,0.1)); border:1px solid rgba(99,102,241,0.3); color:var(--accent-indigo); padding:9px 16px; border-radius:10px; font-weight:bold; cursor:pointer; transition:0.2s; display:flex; align-items:center; gap:6px; font-size:0.85rem; }
            .btn-deep-research:hover { background:var(--accent-indigo); color:white; box-shadow:0 0 20px rgba(99,102,241,0.3); }

            .dropzone-area      { border:2px dashed rgba(99,102,241,0.3); border-radius:14px; padding:1.5rem 2rem; display:flex; align-items:center; gap:1rem; color:#666; font-size:0.88rem; cursor:pointer; transition:0.3s; margin-bottom:1.5rem; }
            .dropzone-area:hover { border-color:var(--accent-indigo); color:#aaa; background:rgba(99,102,241,0.03); }
            .dropzone-area.drag-over { border-color:var(--accent-green); background:rgba(0,230,118,0.05); color:var(--accent-green); }

            .lms-grid           { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:1.25rem; }
            .empty-lms          { grid-column:1/-1; text-align:center; color:#555; padding:3rem; font-style:italic; border:1px dashed #333; border-radius:14px; }

            /* Modal overlay */
            .modal-overlay      { position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); backdrop-filter:blur(15px); z-index:5000; display:none; justify-content:center; align-items:center; }
            .modal-overlay.active { display:flex; }
            .modal-card         { background:var(--bg-dark); border:1px solid #444; border-radius:20px; padding:2.5rem; width:90%; max-width:560px; box-shadow:0 30px 60px rgba(0,0,0,0.8); border-top:4px solid var(--accent-indigo); box-sizing:border-box; max-height:90vh; overflow-y:auto; }
            .modal-header       { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
            .modal-header h2    { margin:0; color:white; font-size:1.3rem; font-weight:900; }
            .btn-close          { background:transparent; border:none; color:#888; font-size:1.4rem; cursor:pointer; transition:0.2s; }
            .btn-close:hover    { color:var(--accent-red); }
            .form-group         { display:flex; flex-direction:column; gap:7px; margin-bottom:14px; }
            .form-group label   { color:var(--accent-indigo); font-size:0.72rem; font-weight:bold; text-transform:uppercase; letter-spacing:1px; }
            .form-control       { background:rgba(0,0,0,0.5); border:1px solid #444; color:white; padding:11px; border-radius:10px; font-family:var(--font-main); font-size:0.92rem; outline:none; transition:0.2s; width:100%; box-sizing:border-box; }
            .form-control:focus { border-color:var(--accent-purple); }
            .modal-actions      { display:flex; justify-content:flex-end; gap:10px; margin-top:1.5rem; border-top:1px dashed #333; padding-top:1.5rem; }
            .btn-modal          { padding:11px 22px; border-radius:10px; font-weight:900; font-size:0.88rem; cursor:pointer; transition:0.3s; border:none; }

            @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
            @media (max-width:768px) { .workspace-lms { padding:80px 1rem 120px 1rem; } .modal-card { padding:1.5rem; } }
        </style>

        <div class="app-layout">
            ${Sidebar.getHtml('/lms')}
            <main class="workspace-lms">
                ${PageHeader.getHtml(headerConfig)}

                <!-- TAB: LISTA ───────────────────────────────── -->
                <div id="tab-list" class="tab-content ${this.currentTab === 'list' ? 'active' : ''}">
                    <div id="mount-skill-explorer"></div>
                </div>

                <!-- TAB: GRAFO 3D ────────────────────────────── -->
                <div id="tab-graph" class="tab-content ${this.currentTab === 'graph' ? 'active graph-active' : ''}">
                    <div id="synapticMountPoint" style="flex:1; min-height:400px;"></div>
                </div>

                <!-- Montar modales micro-frontend -->
                <div id="mount-forge-modal"></div>

                <!-- Modal: Deep Research ─────────────────────── -->
                <div class="modal-overlay" id="researchModal">
                    <div class="modal-card">
                        <div class="modal-header">
                            <h2>🔍 Deep Research (@mestre_escola)</h2>
                            <button class="btn-close" id="btnCloseResearch">✖</button>
                        </div>
                        <div class="form-group">
                            <label>Tema a Investigar</label>
                            <input type="text" id="inpResearchTopic" class="form-control" placeholder="Ej: Clean Architecture, VNA, Mecánica Cuántica…">
                        </div>
                        <div class="form-group">
                            <label>Categoría Ontológica</label>
                            <select id="inpResearchCat" class="form-control">
                                <option value="reference">📚 Reference (Teoría y Metodología)</option>
                                <option value="skill">🎒 Skill (Instrucciones Ejecutables)</option>
                                <option value="eval">📋 Eval (Aserciones y Tests)</option>
                                <option value="script">⚡ Script (Código fuente)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Motor de Investigación</label>
                            <select id="inpResearchEngine" class="form-control" style="color:var(--accent-indigo); font-weight:bold;">
                                <option value="">🦉 Motor Óptimo (Anthropic — Auto)</option>
                                <option value="anthropic">Anthropic (claude-sonnet-4)</option>
                                <option value="openai">OpenAI (GPT-4o)</option>
                                <option value="gemini">Google Gemini (Lectura Masiva)</option>
                                <option value="deepseek">DeepSeek</option>
                            </select>
                        </div>
                        <div class="modal-actions">
                            <button class="btn-modal" id="btnRunResearch"
                                    style="background:linear-gradient(135deg, var(--accent-indigo), var(--accent-purple)); color:white; width:100%;">
                                🚀 Iniciar Minado Neuronal
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            ${BottomNav.getHtml('/lms')}
        </div>`;
    }

    async afterRender() {
        Sidebar.initListeners();
        PageHeader.afterRender((tabId) => {
            this.currentTab = tabId;
            document.querySelectorAll('.tab-content').forEach(c => {
                c.classList.remove('active', 'graph-active');
            });
            const target = document.getElementById(`tab-${tabId}`);
            if (target) {
                target.classList.add('active');
                if (tabId === 'graph') target.classList.add('graph-active');
            }
            if (tabId === 'graph' && !this.synapticInstance) {
                this._initSynapticCanvas();
            }
        });

        // ── Micro-Frontends ───────────────────────────────────────
        this.skillForgeModal = new SkillForgeModal('mount-forge-modal');
        await this.skillForgeModal.render();

        this.skillExplorer = new SkillExplorer('mount-skill-explorer');
        await this.skillExplorer.render();

        // ── DOM refs ──────────────────────────────────────────────
        this.dom = {
            synapticMount:     document.getElementById('synapticMountPoint'),
            researchModal:     document.getElementById('researchModal'),
            btnCloseResearch:  document.getElementById('btnCloseResearch'),
            btnRunResearch:    document.getElementById('btnRunResearch'),
            inpResearchTopic:  document.getElementById('inpResearchTopic'),
            inpResearchCat:    document.getElementById('inpResearchCat'),
            inpResearchEngine: document.getElementById('inpResearchEngine')
        };

        // ── Eventos orquestación micro-frontends ──────────────────
        window.addEventListener('refresh-lms-data', async () => {
            if (this.skillExplorer)    await this.skillExplorer.loadData();
            if (this.synapticInstance) {
                await this.synapticInstance.loadInitialData?.();
                this.synapticInstance.graph3D?.graphData?.({
                    nodes: this.synapticInstance.nodes,
                    links: this.synapticInstance.links
                });
            }
        });

        window.addEventListener('process-skill-file', async (e) => {
            if (this.skillForgeModal) {
                await this.skillForgeModal.parseZipSkillFile(e.detail.file, e.detail.dropzone);
                window.dispatchEvent(new CustomEvent('refresh-lms-data'));
            }
        });

        window.addEventListener('open-research-modal', () => {
            this.dom.researchModal?.classList.add('active');
        });

        // ── Equip Skill desde 3D ──────────────────────────────────
        window.addEventListener('3d-equip-skill', async (e) => {
            const { agentId, skillId } = e.detail;
            try {
                await KB.init();
                const state = store.getState();
                const user  = state.globalUsers.find(u => u.id === agentId);
                if (!user?.profile) throw new Error('Agente no encontrado en el Padrón.');

                const activeSkills = [...(user.profile.active_skills || [])];
                if (!activeSkills.includes(skillId)) activeSkills.push(skillId);

                await store.dispatch({ type: 'UPDATE_USER', payload: { id: user.id, profile: { ...user.profile, active_skills: activeSkills } } });

                const promptId   = `prompt_global_${agentId.replace('@', '')}`;
                let promptNode   = await KB.getNode(promptId);
                const skillNode  = await KB.getNode(skillId);
                if (promptNode && skillNode) {
                    promptNode.dependencies = activeSkills;
                    promptNode.content     += `\n\n🔹 **NUEVA HERRAMIENTA**: ${skillNode.title}\n${skillNode.description || ''}`;
                    await KB.saveNode(promptNode);
                }

                alert(`✅ Skill "${skillNode?.title || skillId}" equipada a ${agentId}.`);
                window.dispatchEvent(new CustomEvent('refresh-lms-data'));
            } catch (err) {
                alert('Error al equipar: ' + err.message);
            }
        });

        // ── Pentest de Skill desde 3D ─────────────────────────────
        window.addEventListener('3d-test-skill', async (e) => {
            const { skillData } = e.detail;
            try {
                const systemPrompt = `Eres @kaos_tester, el Evaluador CI/CD del Kernel V10.
Testea la Skill contra sus propios Evals. Si todos pasan → éxito. Si alguno falla → devuelve artifact corregido.
Responde SOLO con JSON: { "message": "Reporte", "artifact": null }`;

                const response = await Orchestrator.callLLM({
                    preferredEngine: 'anthropic',
                    systemPrompt,
                    userPrompt:     `SKILL A EVALUAR:\n${JSON.stringify(skillData)}\n\nEJECUTAR PENTEST AHORA.`,
                    responseFormat: 'json_object',
                    temperature:    0.1
                });

                const parsed = response.content;
                if (parsed.artifact) {
                    alert('⚠️ PENTEST FALLIDO. @kaos_tester ha propuesto una mutación correctora. Abriendo la Forja…');
                    if (this.skillForgeModal?.openWithPreloadedData) {
                        this.skillForgeModal.openWithPreloadedData(parsed.artifact);
                    } else {
                        window.dispatchEvent(new CustomEvent('open-forge-modal', { detail: { preloadedData: parsed.artifact } }));
                    }
                } else {
                    alert(`✅ PENTEST SUPERADO. Skill robusta.\n\n${parsed.message}`);
                    window.dispatchEvent(new CustomEvent('refresh-lms-data'));
                }
            } catch (err) {
                alert(`⚠️ Error en Pentest: ${err.message}`);
            }
        });

        // ── Deep Research ─────────────────────────────────────────
        this._setupDeepResearch();
    }

    async _initSynapticCanvas() {
        if (!this.dom.synapticMount) return;
        this.dom.synapticMount.innerHTML = '<div style="color:#888; padding:2rem; text-align:center; font-family:var(--font-mono);">Iniciando Motor WebGL 3D…</div>';
        this.synapticInstance = new SynapticCanvas(this.dom.synapticMount, null);
        await this.synapticInstance.render();
    }

    _setupDeepResearch() {
        this.dom.btnCloseResearch?.addEventListener('click', () => {
            this.dom.researchModal?.classList.remove('active');
        });

        this.dom.btnRunResearch?.addEventListener('click', async () => {
            const topic  = this.dom.inpResearchTopic?.value.trim();
            const cat    = this.dom.inpResearchCat?.value || 'reference';
            const engine = this.dom.inpResearchEngine?.value || 'anthropic';

            if (!topic) return alert('Escribe un tema para investigar.');

            const btn = this.dom.btnRunResearch;
            btn.disabled  = true;
            btn.innerText = '⏳ @mestre_escola está minando conocimiento…';

            try {
                // Deep Research via Orchestrator (KB-first, sin localStorage)
                const systemPrompt = `Eres @mestre_escola, el Investigador Cognitivo del Swarm SOS V10.
Tu misión es generar un nodo de conocimiento de tipo "${cat}" sobre el tema indicado.
Devuelve SOLO un JSON con la siguiente estructura:
{
  "id": "ref_${Date.now()}",
  "type": "${cat}",
  "title": "Título del conocimiento",
  "description": "Resumen de 200 chars máx",
  "content": "Contenido detallado en Markdown",
  "keywords": ["keyword1", "keyword2"],
  "references": [],
  "evals": [],
  "scripts": []
}`;

                const response = await Orchestrator.callLLM({
                    preferredEngine: engine || 'anthropic',
                    systemPrompt,
                    userPrompt:     `TEMA A INVESTIGAR: ${topic}\nCATEGORÍA: ${cat}\n\nGenera el nodo de conocimiento.`,
                    responseFormat: 'json_object',
                    temperature:    0.3
                });

                const node = response.content;
                if (!node?.title) throw new Error('La IA no generó un nodo válido.');

                // Asegurar ID único
                node.id = node.id || `${cat}_${Date.now()}`;

                await KB.init();
                await KB.saveNode(node);

                alert(`✅ Nodo "${node.title}" minado y sellado en la Memoria Profunda.`);
                this.dom.researchModal?.classList.remove('active');
                window.dispatchEvent(new CustomEvent('refresh-lms-data'));

            } catch (err) {
                alert('Fallo en Deep Research: ' + err.message);
            } finally {
                btn.disabled  = false;
                btn.innerText = '🚀 Iniciar Minado Neuronal';
            }
        });
    }

    // Alias V9
    executeViewScript() { return this.afterRender(); }
}
