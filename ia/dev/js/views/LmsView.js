// =============================================================================
// TEAMTOWERS SOS V10 — LMS VIEW
// Ruta: ia/dev/js/views/LmsView.js
// La Forja · Cerebro LMS · Meta-Grafo WebGL
// =============================================================================

import { store }         from '../core/store.js';
import { KB }            from '../core/kb.js';
import { Sidebar }       from '../components/Sidebar.js';
import { BottomNav }     from '../components/BottomNav.js';
import { PageHeader }    from '../components/PageHeader.js';
import { SynapticCanvas } from '../components/SynapticCanvas.js';
import { SkillExplorer }  from '../components/SkillExplorer.js';
import { SkillForgeModal } from '../components/SkillForgeModal.js';
import { Orchestrator }  from '../core/Orchestrator.js';

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
            title:    'La Forja (Cerebro LMS)',
            subtitle: 'Conocimiento W3C & Meta-Grafo',
            tagline:  'Explora la memoria, forja habilidades, testea el Córtex (CI/CD) y orquesta Agentes.',
            tabs: [
                { id: 'list',  label: '🎒 Biblioteca de Skills', active: this.currentTab === 'list'  },
                { id: 'graph', label: '🌌 Córtex 3D',            active: this.currentTab === 'graph' }
            ],
            magicActions: [
                { id: 'research', icon: '🔭', label: 'Deep Research (Minar Web)', tokens: 800 },
                { id: 'inject',   icon: '💉', label: 'Inyectar Semillas Antigravity', tokens: 0 }
            ]
        };

        return `
        <style>
            .app-layout    { display:flex; height:100dvh; width:100vw; overflow:hidden; background:var(--bg-dark); }
            .workspace-lms {
                flex:1; display:flex; flex-direction:column;
                padding:2rem 3rem 2rem 3rem; overflow-y:auto; overflow-x:hidden;
                background:radial-gradient(circle at top, #0d0d14 0%, #050507 100%);
                box-sizing:border-box;
            }

            /* Tabs */
            .lms-tab-content        { display:none; flex:1; flex-direction:column; animation:fadeIn 0.3s ease; }
            .lms-tab-content.active { display:flex; }
            .lms-tab-content.graph-active { height:calc(100dvh - 180px); }

            #synapticMountPoint { width:100%; flex:1; min-height:500px; border-radius:18px; overflow:hidden; }

            /* Research Modal */
            .lms-modal-overlay { position:fixed; inset:0; background:rgba(5,5,8,0.85); backdrop-filter:blur(10px);
                z-index:6000; display:none; justify-content:center; align-items:center; }
            .lms-modal-overlay.active { display:flex; }
            .lms-modal-card { background:linear-gradient(145deg,rgba(20,20,25,0.97),rgba(10,10,15,0.99));
                border:1px solid var(--accent-indigo,#6366f1); border-radius:18px; width:100%; max-width:580px;
                padding:2rem; box-shadow:0 20px 50px rgba(0,0,0,0.9); max-height:90vh; overflow-y:auto; }
            .lms-modal-header { display:flex; justify-content:space-between; align-items:center;
                margin-bottom:1.5rem; border-bottom:1px dashed #333; padding-bottom:1rem; }
            .lms-modal-header h2 { margin:0; color:white; font-size:1.3rem; font-weight:900; }

            @media (max-width:768px) { .workspace-lms { padding:90px 1rem 120px 1rem; } }
        </style>

        <div class="app-layout">
            ${Sidebar.getHtml('/lms')}

            <main class="workspace-lms">
                ${PageHeader.getHtml(headerConfig)}

                <!-- TAB: BIBLIOTECA -->
                <div id="lms-tab-list" class="lms-tab-content ${this.currentTab === 'list' ? 'active' : ''}">
                    <div id="mount-skill-explorer"></div>
                </div>

                <!-- TAB: CÓRTEX 3D -->
                <div id="lms-tab-graph" class="lms-tab-content ${this.currentTab === 'graph' ? 'active graph-active' : ''}">
                    <div id="synapticMountPoint" style="color:#888;padding:2rem;text-align:center;">
                        Activa la pestaña Córtex 3D para inicializar el motor WebGL.
                    </div>
                </div>

                <!-- Modal Forge -->
                <div id="mount-forge-modal"></div>
            </main>

            ${BottomNav.getHtml('/lms')}
        </div>

        <!-- Research Modal -->
        <div class="lms-modal-overlay" id="researchModal">
            <div class="lms-modal-card">
                <div class="lms-modal-header">
                    <h2>🔭 Deep Research — Minar la Web</h2>
                    <button id="btnCloseResearch" style="background:transparent;border:none;color:#888;font-size:1.4rem;cursor:pointer;">✖</button>
                </div>
                <div style="margin-bottom:14px;">
                    <label style="font-size:0.75rem;color:#888;text-transform:uppercase;font-weight:bold;display:block;margin-bottom:6px;">Tema a Investigar</label>
                    <input type="text" id="inpResearchTopic" class="lux-input"
                           placeholder="Ej: Value Network Analysis aplicada a startups DAO…">
                </div>
                <div style="margin-bottom:14px;">
                    <label style="font-size:0.75rem;color:#888;text-transform:uppercase;font-weight:bold;display:block;margin-bottom:6px;">Categoría de Destino</label>
                    <select id="inpResearchCat" class="lux-input">
                        <option value="core.architecture">🌌 Arquitectura & VNA</option>
                        <option value="core.economy">⚖️ Economía & Ledger</option>
                        <option value="core.cognition">🧠 Cognición & Ontología</option>
                        <option value="core.execution">⚡ Ejecución & Código</option>
                        <option value="skill">🎒 Skill General</option>
                    </select>
                </div>
                <div style="margin-bottom:14px;">
                    <label style="font-size:0.75rem;color:#888;text-transform:uppercase;font-weight:bold;display:block;margin-bottom:6px;">Motor IA</label>
                    <select id="inpResearchEngine" class="lux-input" style="color:var(--accent-indigo,#6366f1);font-weight:bold;">
                        <option value="anthropic">Anthropic (Claude) — Primario V10</option>
                        <option value="openai">OpenAI (GPT-4o)</option>
                        <option value="deepseek">DeepSeek (Coder)</option>
                        <option value="gemini">Google Gemini</option>
                    </select>
                </div>
                <button id="btnRunResearch"
                        style="background:linear-gradient(135deg,var(--accent-indigo,#6366f1),var(--accent-purple,#e040fb));
                               color:white;border:none;padding:14px;border-radius:12px;font-weight:900;
                               cursor:pointer;width:100%;font-size:1rem;">
                    🚀 Iniciar Minado Neuronal
                </button>
            </div>
        </div>`;
    }

    async executeViewScript() {
        return this.afterRender();
    }

    async afterRender() {
        Sidebar.initListeners();
        PageHeader.afterRender(
            // onTabChange
            async (tabId) => {
                this.currentTab = tabId;
                document.querySelectorAll('.lms-tab-content').forEach(c => {
                    c.classList.remove('active', 'graph-active');
                });
                const target = document.getElementById(`lms-tab-${tabId}`);
                if (target) {
                    target.classList.add('active');
                    if (tabId === 'graph') target.classList.add('graph-active');
                }

                if (tabId === 'graph' && !this.synapticInstance) {
                    const mount = document.getElementById('synapticMountPoint');
                    if (mount) {
                        mount.innerHTML = '<div style="color:#888;padding:2rem;text-align:center;">Iniciando Motor WebGL 3D…</div>';
                        this.synapticInstance = new SynapticCanvas(mount, null);
                        await this.synapticInstance.render();
                    }
                }
            },
            // onMagicAction
            async (actionId) => {
                if (actionId === 'research') {
                    document.getElementById('researchModal')?.classList.add('active');
                } else if (actionId === 'inject') {
                    try {
                        const { CoreSeed } = await import('../core/seed.js');
                        await KB.init();
                        if (CoreSeed?.inject) {
                            await KB.deleteNode('skill_vna_architect').catch(() => {});
                            await CoreSeed.inject(KB);
                        }
                        window.dispatchEvent(new CustomEvent('refresh-lms-data'));
                        alert('✅ Semillas Antigravity inyectadas.');
                    } catch (e) { alert('Error: ' + e.message); }
                }
            }
        );

        // Forge Modal
        this.skillForgeModal = new SkillForgeModal('mount-forge-modal');
        await this.skillForgeModal.render();

        // Skill Explorer
        this.skillExplorer = new SkillExplorer('mount-skill-explorer');
        await this.skillExplorer.render();

        this.dom = {
            researchModal:    document.getElementById('researchModal'),
            btnCloseResearch: document.getElementById('btnCloseResearch'),
            btnRunResearch:   document.getElementById('btnRunResearch'),
            inpResearchTopic: document.getElementById('inpResearchTopic'),
            inpResearchCat:   document.getElementById('inpResearchCat'),
            inpResearchEngine: document.getElementById('inpResearchEngine'),
        };

        // Cerrar modal
        this.dom.btnCloseResearch?.addEventListener('click', () => {
            this.dom.researchModal?.classList.remove('active');
        });

        // Deep Research
        this.dom.btnRunResearch?.addEventListener('click', async () => {
            const topic  = this.dom.inpResearchTopic?.value.trim();
            const cat    = this.dom.inpResearchCat?.value;
            const engine = this.dom.inpResearchEngine?.value || 'anthropic';
            if (!topic) return alert('Introduce un tema.');

            this.dom.btnRunResearch.innerText  = '⏳ Minando…';
            this.dom.btnRunResearch.disabled   = true;

            try {
                const response = await Orchestrator.callLLM({
                    preferredEngine: engine,
                    systemPrompt: `Eres @agent_synaptic_weaver. Investiga en profundidad el tema dado y genera una Skill estructurada en formato SOS V10.
Devuelve SOLO JSON:
{
  "title": "Título de la Skill",
  "description": "Descripción breve",
  "content": "SOP paso a paso + SOCs de verificación",
  "keywords": ["#tag1","#tag2"]
}`,
                    userPrompt:   `Tema: ${topic}\nCategoría objetivo: ${cat}`,
                    responseFormat: 'json_object',
                    temperature: 0.3
                });

                const data = response.content;
                if (data.title && data.content) {
                    await KB.init();
                    await KB.saveNode({
                        id:          `skill_research_${Date.now()}`,
                        type:        'skill',
                        category:    cat,
                        projectId:   'global',
                        targetId:    'global',
                        title:       data.title,
                        description: data.description || '',
                        content:     data.content,
                        keywords:    data.keywords || []
                    });
                    window.dispatchEvent(new CustomEvent('refresh-lms-data'));
                    this.dom.researchModal?.classList.remove('active');
                    alert(`✅ Skill "${data.title}" minada y sellada en el Córtex.`);
                }
            } catch (err) {
                alert('Error en Deep Research: ' + err.message);
            } finally {
                this.dom.btnRunResearch.innerText = '🚀 Iniciar Minado Neuronal';
                this.dom.btnRunResearch.disabled  = false;
            }
        });

        // Eventos de orquestación
        window.addEventListener('refresh-lms-data', async () => {
            if (this.skillExplorer) await this.skillExplorer.loadData?.();
            if (this.synapticInstance) {
                await this.synapticInstance.loadInitialData();
                if (this.synapticInstance.graph3D) {
                    this.synapticInstance.graph3D.graphData({
                        nodes: this.synapticInstance.nodes,
                        links: this.synapticInstance.links
                    });
                }
            }
        });

        window.addEventListener('process-skill-file', async (e) => {
            if (this.skillForgeModal) {
                await this.skillForgeModal.parseZipSkillFile?.(e.detail.file, e.detail.dropzone);
                window.dispatchEvent(new CustomEvent('refresh-lms-data'));
            }
        });

        window.addEventListener('open-research-modal', () => {
            this.dom.researchModal?.classList.add('active');
        });

        window.addEventListener('3d-equip-skill', async (e) => {
            const { agentId, skillId } = e.detail;
            try {
                await KB.init();
                const state = store.getState();
                const user  = state.globalUsers.find(u => u.id === agentId);
                if (!user?.profile) throw new Error('Agente no encontrado.');
                if (!user.profile.active_skills) user.profile.active_skills = [];
                if (!user.profile.active_skills.includes(skillId)) {
                    user.profile.active_skills.push(skillId);
                    await store.dispatch({ type: 'UPDATE_USER', payload: user });
                }
                alert(`✅ Skill equipada a ${agentId}`);
                window.dispatchEvent(new CustomEvent('refresh-lms-data'));
            } catch (err) {
                alert('Error equipando Skill: ' + err.message);
            }
        });
    }
}
