// v9/js/views/LmsView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import { SynapticCanvas } from '../components/SynapticCanvas.js'; 
import { Orchestrator } from '../core/Orchestrator.js';

// Micro-Frontends
import { SkillExplorer } from '../components/SkillExplorer.js'; 
import { SkillForgeModal } from '../components/SkillForgeModal.js'; 

export default class LmsView {
    constructor() {
        document.title = "La Forja LMS | TeamTowers V9";
        this.currentTab = 'list';
        this.synapticInstance = null;
        this.skillExplorer = null;
        this.skillForgeModal = null;
    }

    async getHtml() {
        await store.init();

        const headerConfig = {
            title: "La Forja (Cerebro LMS)",
            subtitle: "Conocimiento W3C & Meta-Grafo",
            tagline: "Explora la memoria, forja habilidades y empaqueta AgentSkills (.zip / .skill) para la red.",
            tabs: [
                { id: 'list', label: '🗂️ Padrón W3C (Lista)', active: this.currentTab === 'list' },
                { id: 'graph', label: '🌌 Meta-Grafo 3D', active: this.currentTab === 'graph' }
            ],
            actionHtml: `<button class="ph-btn-magic" style="border-color:var(--accent-green); color:var(--accent-green);" onclick="window.location.href='/v9/paper'">+ Crear en Omni-Paper</button>`
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-lms { flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; box-sizing: border-box; position: relative;}
                
                .tab-content { display: none; animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); padding-bottom: 5rem; width: 100%; box-sizing: border-box;}
                .tab-content.active { display: block; }
                .tab-content.graph-active { display: flex; flex-direction: column; height: calc(100vh - 180px); padding-bottom: 0; }

                /* Estilos compartidos para Botones y Layout general */
                .lms-controls-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 15px;}
                .filters-bar { display: flex; gap: 10px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 12px; border: 1px solid var(--glass-border); overflow-x: auto;}
                .filter-btn { background: transparent; border: 1px solid #444; color: #888; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.3s; white-space: nowrap; font-family: var(--font-mono); font-size: 0.8rem;}
                .filter-btn:hover { border-color: var(--accent-blue); color: white;}
                .filter-btn.active { background: rgba(0,176,255,0.1); border-color: var(--accent-blue); color: var(--accent-blue);}

                .btn-deep-research { background: linear-gradient(135deg, rgba(0,176,255,0.1), rgba(224,64,251,0.1)); border: 1px solid var(--accent-blue); color: white; padding: 10px 20px; border-radius: 12px; font-weight: 900; cursor: pointer; display: flex; gap: 8px; align-items: center; transition: 0.3s; box-shadow: 0 5px 15px rgba(0,176,255,0.15);}
                .btn-deep-research:hover { background: var(--accent-blue); color: black; box-shadow: 0 8px 20px rgba(0,176,255,0.4); transform: translateY(-2px);}

                .dropzone-area { border: 2px dashed #444; border-radius: 16px; padding: 15px; text-align: center; color: #888; margin-bottom: 2rem; background: rgba(255,255,255,0.02); transition: 0.3s; display: flex; justify-content: center; align-items: center; gap: 10px;}
                .dropzone-area.drag-over { border-color: var(--accent-purple); background: rgba(224,64,251,0.05); color: white; transform: scale(1.02);}

                .lms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;}
                .meme-card { background: rgba(255,255,255,0.02); border: 1px solid #333; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 10px; transition: 0.3s; position: relative; overflow: hidden; cursor: pointer;}
                .meme-card:hover { border-color: var(--accent-purple); background: rgba(224,64,251,0.05); transform: translateY(-3px); box-shadow: 0 10px 30px rgba(224,64,251,0.1);}
                .meme-category { position: absolute; top: 0; right: 0; background: rgba(224,64,251,0.1); color: var(--accent-purple); padding: 5px 15px; border-radius: 0 0 0 12px; font-size: 0.7rem; font-family: var(--font-mono); font-weight: bold; border-left: 1px solid rgba(224,64,251,0.3); border-bottom: 1px solid rgba(224,64,251,0.3);}
                .meme-category.skill { background: rgba(0,230,118,0.1); color: var(--accent-green); border-color: rgba(0,230,118,0.3);}
                .meme-category.reference { background: rgba(0,176,255,0.1); color: var(--accent-blue); border-color: rgba(0,176,255,0.3);}
                .meme-category.script { background: rgba(255,82,82,0.1); color: var(--accent-red); border-color: rgba(255,82,82,0.3);}
                .meme-category.eval { background: rgba(255,171,64,0.1); color: var(--accent-orange); border-color: rgba(255,171,64,0.3);}
                .meme-title { font-size: 1.1rem; color: white; margin: 10px 0 0 0; font-weight: 900;}
                .meme-content { color: #aaa; font-size: 0.9rem; line-height: 1.5; font-family: 'Georgia', serif; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;}
                .meme-footer { margin-top: auto; padding-top: 15px; border-top: 1px dashed #333; display: flex; flex-wrap: wrap; gap: 5px; align-items: center;}
                .meme-tag { background: rgba(0,0,0,0.6); color: #888; font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono);}
                .empty-lms { grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: #666; border: 1px dashed #333; border-radius: 20px;}

                #synapticMountPoint { width: 100%; flex: 1; min-height: 500px; border-radius: 20px; overflow: hidden; }

                /* MODALES GLOBALES */
                .modal-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(5,5,8,0.8); backdrop-filter: blur(10px); z-index: 1000; display: none; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s;}
                .modal-overlay.active { display: flex; opacity: 1; }
                .modal-card { background: linear-gradient(145deg, rgba(20,20,25,0.95), rgba(10,10,15,0.98)); border: 1px solid var(--accent-purple); border-radius: 20px; width: 100%; max-width: 1000px; padding: 2rem; box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(224,64,251,0.2); transform: translateY(20px); transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); max-height: 95vh; overflow-y: auto; display:flex; flex-direction:column;}
                .modal-overlay.active .modal-card { transform: translateY(0); }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px dashed #333; padding-bottom: 1rem;}
                .modal-header h2 { margin: 0; color: white; font-size: 1.5rem; font-weight: 900;}
                .btn-close { background: transparent; border: none; color: #888; font-size: 1.5rem; cursor: pointer; transition: 0.2s;}
                .btn-close:hover { color: var(--accent-red); transform: scale(1.1);}
                .modal-body-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; flex: 1;}
                .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;}
                .form-group label { color: var(--accent-blue); font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;}
                .form-control { background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; padding: 12px; border-radius: 10px; font-family: var(--font-main); font-size: 0.95rem; outline: none; transition: 0.2s;}
                .form-control:focus { border-color: var(--accent-purple); box-shadow: 0 0 15px rgba(224,64,251,0.1);}
                .form-control.textarea { min-height: 250px; resize: vertical; font-family: 'Georgia', serif; line-height: 1.6;}
                
                .draft-banner { display:none; background: rgba(255,145,0,0.1); border: 1px solid var(--accent-orange); border-radius: 12px; padding: 15px; margin-bottom: 20px; color: #fff;}
                .draft-banner.active { display: block; animation: fadeIn 0.3s; }
                .draft-header { display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;}
                .draft-title { font-weight: bold; color: var(--accent-orange); font-size: 1.1rem;}
                .draft-actions { display: flex; gap: 10px;}
                .btn-micro { background: rgba(0,0,0,0.5); border: 1px solid #555; color: #ccc; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: bold; transition: 0.2s;}
                .btn-micro:hover { background: #333; color: white; }
                .btn-micro.apply { border-color: var(--accent-green); color: var(--accent-green); }
                .btn-micro.apply:hover { background: var(--accent-green); color: black; }
                .btn-micro.discard { border-color: var(--accent-red); color: var(--accent-red); }
                .btn-micro.discard:hover { background: var(--accent-red); color: black; }

                .modal-actions { display: flex; justify-content: flex-end; flex-wrap:wrap; gap: 10px; margin-top: 2rem; border-top: 1px dashed #333; padding-top: 1.5rem;}
                .btn-modal { padding: 12px 24px; border-radius: 10px; font-weight: 900; font-size: 0.9rem; cursor: pointer; transition: 0.3s; border: none;}
                .btn-save { background: var(--accent-purple); color: white; box-shadow: 0 5px 15px rgba(224,64,251,0.3);}
                .btn-save:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(224,64,251,0.5); filter: brightness(1.2);}
                .btn-danger { background: transparent; border: 1px solid var(--accent-red); color: var(--accent-red);}
                .btn-danger:hover { background: rgba(255,82,82,0.1); transform: translateY(-2px);}
                .btn-expand { background: linear-gradient(135deg, var(--accent-orange), #ff3d00); color: white; box-shadow: 0 5px 15px rgba(255,171,64,0.3); }
                .btn-expand:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(255,171,64,0.5); filter: brightness(1.2); }
                .btn-export { background: transparent; border: 1px dashed var(--accent-purple); color: var(--accent-purple); }
                .btn-export:hover { background: rgba(224,64,251,0.1); }
                .ref-badge { background: rgba(0,176,255,0.1); border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 5px 12px; border-radius: 8px; font-size: 0.8rem; cursor: pointer; transition: 0.2s; font-weight: bold; font-family: var(--font-mono); display:inline-block; margin-bottom:5px; margin-right:5px;}
                .eval-badge { background: rgba(255,171,64,0.1); border: 1px solid var(--accent-orange); color: var(--accent-orange); padding: 5px 12px; border-radius: 8px; font-size: 0.8rem; cursor: pointer; transition: 0.2s; font-weight: bold; font-family: var(--font-mono); display:inline-block; margin-bottom:5px; margin-right:5px;}
                .script-badge { background: rgba(0,230,118,0.1); border: 1px solid var(--accent-green); color: var(--accent-green); padding: 5px 12px; border-radius: 8px; font-size: 0.8rem; cursor: pointer; transition: 0.2s; font-weight: bold; font-family: var(--font-mono); display:inline-block; margin-bottom:5px; margin-right:5px;}

                @media (max-width: 768px) {
                    .workspace-lms { padding: 90px 1rem 120px 1rem; }
                    .lms-controls-row { flex-direction: column; align-items: stretch; }
                    .modal-card { padding: 1.5rem; border-radius: 16px; margin: 10px; }
                    .modal-body-grid { grid-template-columns: 1fr; }
                    .modal-actions { flex-direction: column; }
                    .btn-modal { width: 100%; text-align: center; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/lms')}
                <main class="workspace-lms">
                    ${PageHeader.getHtml(headerConfig)}
                    
                    <div id="tab-list" class="tab-content ${this.currentTab === 'list' ? 'active' : ''}">
                        <div id="mount-skill-explorer"></div>
                    </div>

                    <div id="tab-graph" class="tab-content ${this.currentTab === 'graph' ? 'active graph-active' : ''}">
                        <div id="synapticMountPoint"></div>
                    </div>

                    <div id="mount-forge-modal"></div>

                    <div class="modal-overlay" id="researchModal">
                        <div class="modal-card" style="border-top-color: var(--accent-blue); max-width: 600px;">
                            <div class="modal-header">
                                <h2>🔍 Deep Research (@mestre_escola)</h2>
                                <button class="btn-close" id="btnCloseResearch">&times;</button>
                            </div>
                            <div class="form-group">
                                <label>Tema a Investigar</label>
                                <input type="text" id="inpResearchTopic" class="form-control" placeholder="Ej: Clean Architecture, VNA, Mecánica Cuántica...">
                            </div>
                            <div class="form-group">
                                <label>Categoría Ontológica</label>
                                <select id="inpResearchCat" class="form-control">
                                    <option value="reference">📚 Reference (Teoría y Metodología)</option>
                                    <option value="skill">🎒 Skill (Instrucciones Ejecutables)</option>
                                    <option value="eval">📋 Eval (Aserciones y Tests JSON)</option>
                                    <option value="script">⚡ Script (Código fuente)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Motor de Investigación Cognitiva</label>
                                <select id="inpResearchEngine" class="form-control" style="font-family:var(--font-mono); color:var(--accent-blue); font-weight:bold;">
                                    <option value="">🧠 Motor Óptimo (Auto)</option>
                                    <option value="openai">OpenAI (GPT-4o)</option>
                                    <option value="gemini">Google Gemini (Lectura Masiva)</option>
                                    <option value="anthropic">Anthropic (Claude 3.5)</option>
                                    <option value="deepseek">DeepSeek</option>
                                </select>
                            </div>
                            <div class="modal-actions" style="margin-top: 1.5rem;">
                                <button class="btn-modal" id="btnRunResearch" style="background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; width: 100%;">🚀 Iniciar Minado Neuronal</button>
                            </div>
                        </div>
                    </div>

                </main>
                ${BottomNav.getHtml('/lms')}
            </div>
        `;
    }

    async executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        // 1. Instanciamos el Modal de Edición (Micro-Frontend)
        this.skillForgeModal = new SkillForgeModal('mount-forge-modal');
        await this.skillForgeModal.render();

        // 2. Instanciamos el Explorer (Micro-Frontend)
        this.skillExplorer = new SkillExplorer('mount-skill-explorer');
        await this.skillExplorer.render();

        this.dom = {
            synapticMount: document.getElementById('synapticMountPoint'),
            researchModal: document.getElementById('researchModal'),
            btnCloseResearch: document.getElementById('btnCloseResearch'),
            btnRunResearch: document.getElementById('btnRunResearch'),
            inpResearchTopic: document.getElementById('inpResearchTopic'),
            inpResearchCat: document.getElementById('inpResearchCat'),
            inpResearchEngine: document.getElementById('inpResearchEngine') 
        };

        window.addEventListener('ph-tab-changed', async (e) => {
            this.currentTab = e.detail.tabId;
            document.querySelectorAll('.tab-content').forEach(c => {
                c.classList.remove('active');
                c.classList.remove('graph-active');
            });
            const target = document.getElementById(`tab-${this.currentTab}`);
            if(target) {
                target.classList.add('active');
                if (this.currentTab === 'graph') target.classList.add('graph-active');
            }

            if (this.currentTab === 'graph' && !this.synapticInstance) {
                this.dom.synapticMount.innerHTML = '<div style="color:#888; padding:2rem; text-align:center;">Iniciando Motor WebGL 3D...</div>';
                this.synapticInstance = new SynapticCanvas(this.dom.synapticMount, null); 
                await this.synapticInstance.render();
            }
        });

        // 3. Eventos de Orquestación entre Micro-Frontends
        window.addEventListener('refresh-lms-data', async () => {
            if (this.skillExplorer) await this.skillExplorer.loadData();
            if (this.synapticInstance) {
                await this.synapticInstance.loadInitialData();
                if (this.synapticInstance.graph3D) this.synapticInstance.graph3D.graphData({ nodes: this.synapticInstance.nodes, links: this.synapticInstance.links });
            }
        });

        window.addEventListener('process-skill-file', async (e) => {
            // Reutilizamos el parser del modal porque tiene las utilidades de JSZip y extracción 
            // (En el futuro, esto iría a un PackageEngine puro sin UI)
            if (this.skillForgeModal) {
                await this.skillForgeModal.parseZipSkillFile(e.detail.file, e.detail.dropzone);
                window.dispatchEvent(new CustomEvent('refresh-lms-data'));
            }
        });

        window.addEventListener('open-research-modal', () => {
            this.dom.researchModal.classList.add('active');
        });

        this.setupDeepResearchEvents();
    }

    setupDeepResearchEvents() {
        this.dom.btnCloseResearch.addEventListener('click', () => this.dom.researchModal.classList.remove('active'));
        
        this.dom.btnRunResearch.addEventListener('click', async () => {
            const topic = this.dom.inpResearchTopic.value.trim();
            const cat = this.dom.inpResearchCat.value;
            const engine = this.dom.inpResearchEngine.value || null; 

            if (!topic) return alert("Escribe un tema para investigar.");

            this.dom.btnRunResearch.disabled = true;
            this.dom.btnRunResearch.innerText = "⏳ @mestre_escola está minando conocimiento...";

            try {
                await Orchestrator.runDeepResearch(topic, cat, 3, engine);
                alert("✅ Investigación completada.");
                this.dom.researchModal.classList.remove('active');
                window.dispatchEvent(new CustomEvent('refresh-lms-data'));
            } catch (e) {
                alert("Fallo: " + e.message);
            } finally {
                this.dom.btnRunResearch.disabled = false;
                this.dom.btnRunResearch.innerText = "🚀 Iniciar Minado Neuronal";
            }
        });
    }
}
