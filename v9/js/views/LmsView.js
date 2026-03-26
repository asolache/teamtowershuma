// v9/js/views/LmsView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import { SynapticCanvas } from '../components/SynapticCanvas.js'; 
import { Orchestrator } from '../core/Orchestrator.js';

export default class LmsView {
    constructor() {
        document.title = "La Forja LMS | TeamTowers V9";
        this.allNodes = [];
        this.currentTab = 'list';
        this.synapticInstance = null;
        this.draftMemory = null; // Memoria volátil para el Control de Versiones Visual
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
                .meme-category.core_os { background: rgba(0,230,118,0.1); color: var(--accent-green); border-color: rgba(0,230,118,0.3);}
                .meme-category.project_core { background: rgba(0,176,255,0.1); color: var(--accent-blue); border-color: rgba(0,176,255,0.3);}
                .meme-category.prompt_a2a { background: rgba(255,171,64,0.1); color: var(--accent-orange); border-color: rgba(255,171,64,0.3);}
                .meme-category.evergreen { background: rgba(255,215,0,0.1); color: #ffd700; border-color: rgba(255,215,0,0.3); text-shadow: 0 0 10px rgba(255,215,0,0.5);}
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

                /* MODAL OVERLAY - VERSION CONTROL UX */
                .modal-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(5,5,8,0.8); backdrop-filter: blur(10px); z-index: 1000; display: none; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s;}
                .modal-overlay.active { display: flex; opacity: 1; }
                .modal-card { background: linear-gradient(145deg, rgba(20,20,25,0.95), rgba(10,10,15,0.98)); border: 1px solid var(--accent-purple); border-radius: 20px; width: 100%; max-width: 1000px; padding: 2rem; box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(224,64,251,0.2); transform: translateY(20px); transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); max-height: 95vh; overflow-y: auto; display:flex; flex-direction:column;}
                .modal-overlay.active .modal-card { transform: translateY(0); }
                
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px dashed #333; padding-bottom: 1rem;}
                .modal-header h2 { margin: 0; color: white; font-size: 1.5rem; font-weight: 900;}
                .btn-close { background: transparent; border: none; color: #888; font-size: 1.5rem; cursor: pointer; transition: 0.2s;}
                .btn-close:hover { color: var(--accent-red); transform: scale(1.1);}

                /* DOS COLUMNAS EN EDICIÓN */
                .modal-body-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; flex: 1;}

                .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;}
                .form-group label { color: var(--accent-blue); font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;}
                .form-control { background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; padding: 12px; border-radius: 10px; font-family: var(--font-main); font-size: 0.95rem; outline: none; transition: 0.2s;}
                .form-control:focus { border-color: var(--accent-purple); box-shadow: 0 0 15px rgba(224,64,251,0.1);}
                .form-control.textarea { min-height: 250px; resize: vertical; font-family: 'Georgia', serif; line-height: 1.6;}
                
                /* DRAFT BANNER - ANTIFRAGILITY */
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
                        
                        <div class="lms-controls-row">
                            <div class="filters-bar" id="lmsFilters">
                                <button class="filter-btn active" data-filter="all">Todos</button>
                                <button class="filter-btn" data-filter="skill">🎒 Skills</button>
                                <button class="filter-btn" data-filter="reference">📚 References</button>
                                <button class="filter-btn" data-filter="eval">📋 Evals</button>
                                <button class="filter-btn" data-filter="script">⚡ Scripts</button>
                            </div>
                            
                            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                                <button class="btn-deep-research" id="btnNewNode" style="background:transparent; border-color:var(--accent-green); color:var(--accent-green);">
                                    <span style="font-size:1.2rem;">➕</span> Forjar Nodo
                                </button>
                                <button class="btn-deep-research" id="btnOpenResearch">
                                    <span style="font-size:1.2rem;">🧠</span> Deep Research (IA)
                                </button>
                            </div>
                        </div>

                        <div class="dropzone-area" id="skillDropzone">
                            <span style="font-size:1.5rem;">📥</span>
                            <span style="font-weight:bold;">Arrastra aquí un paquete (.skill o .zip) para inyectar su estructura en el Padrón.</span>
                        </div>

                        <div class="lms-grid" id="lmsGrid">
                            <div class="empty-lms">Cargando Memoria Profunda...</div>
                        </div>
                    </div>

                    <div id="tab-graph" class="tab-content ${this.currentTab === 'graph' ? 'active graph-active' : ''}">
                        <div id="synapticMountPoint"></div>
                    </div>

                    <div class="modal-overlay" id="editModal">
                        <div class="modal-card">
                            <div class="modal-header">
                                <h2>🧠 Forja de Conocimiento (Control de Versiones)</h2>
                                <button class="btn-close" id="btnCloseModal">&times;</button>
                            </div>
                            
                            <input type="hidden" id="editNodeId">
                            <input type="hidden" id="editNodeType">
                            <input type="hidden" id="editNodeProjectId">
                            
                            <div class="draft-banner" id="draftBanner">
                                <div class="draft-header">
                                    <span class="draft-title">✨ Mutación Propuesta por la IA</span>
                                    <div class="draft-actions">
                                        <button class="btn-micro discard" id="btnDiscardDraft">Descartar</button>
                                        <button class="btn-micro apply" id="btnApplyDraft">Aceptar Mutación</button>
                                    </div>
                                </div>
                                <div style="font-size: 0.9rem; margin-bottom: 10px;">Revisa los cambios en los campos de abajo. Si no te gustan, puedes editarlos antes de aceptar, o descartarlos para volver a la versión anterior.</div>
                            </div>

                            <div class="modal-body-grid">
                                
                                <div>
                                    <div style="display:flex; gap:15px;">
                                        <div class="form-group" style="flex:1;">
                                            <label>Categoría (W3C)</label>
                                            <input type="text" id="editNodeCat" class="form-control" placeholder="skill, reference, eval, script...">
                                        </div>
                                        <div class="form-group" style="flex:2;">
                                            <label>Título del Nodo</label>
                                            <input type="text" id="editNodeTitle" class="form-control" placeholder="Título descriptivo">
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>Descripción Corta (Trigger para RAG)</label>
                                        <input type="text" id="editNodeDesc" class="form-control" placeholder="Explica CUÁNDO debe invocar la IA esta skill...">
                                    </div>

                                    <div class="form-group" style="flex:1; display:flex; flex-direction:column;">
                                        <label>Instrucciones (SOPs / Content)</label>
                                        <textarea id="editNodeContent" class="form-control textarea" placeholder="Desarrollo del concepto, instrucciones o código..."></textarea>
                                    </div>
                                </div>

                                <div style="background: rgba(0,0,0,0.3); border: 1px solid #333; padding: 15px; border-radius: 12px; height: fit-content;">
                                    <div class="form-group">
                                        <label style="color:var(--accent-blue);">📚 References (IDs)</label>
                                        <input type="text" id="editNodeReferences" class="form-control" style="font-family:var(--font-mono); font-size:0.8rem;" placeholder="ref_1, ref_2">
                                        <div id="refLinksContainer" style="margin-top: 5px; display: flex; gap: 5px; flex-wrap: wrap;"></div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label style="color:var(--accent-orange);">📋 Evals (Test Cases - IDs)</label>
                                        <input type="text" id="editNodeEvals" class="form-control" style="font-family:var(--font-mono); font-size:0.8rem;" placeholder="eval_1, eval_2">
                                        <div id="evalLinksContainer" style="margin-top: 5px; display: flex; gap: 5px; flex-wrap: wrap;"></div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label style="color:var(--accent-green);">⚡ Scripts (Executable - IDs)</label>
                                        <input type="text" id="editNodeScripts" class="form-control" style="font-family:var(--font-mono); font-size:0.8rem;" placeholder="script_1">
                                        <div id="scriptLinksContainer" style="margin-top: 5px; display: flex; gap: 5px; flex-wrap: wrap;"></div>
                                    </div>

                                    <div class="form-group">
                                        <label style="color:var(--accent-purple);">🏷️ Tags (Gravedad 3D)</label>
                                        <input type="text" id="editNodeKeywords" class="form-control" style="font-family:var(--font-mono); font-size:0.8rem;" placeholder="tag1, tag2">
                                    </div>
                                </div>

                            </div>

                            <div class="modal-actions">
                                <button class="btn-modal btn-danger" id="btnDeleteNode">🗑️ Purgar</button>
                                <button class="btn-modal btn-export" id="btnExportSkill">📦 Exportar Package (.skill)</button>
                                <div style="flex:1;"></div>
                                <button class="btn-modal btn-expand" id="btnExpandNode">🌱 Solicitar Mejora a IA</button>
                                <button class="btn-modal btn-save" id="btnSaveNode">💾 Sellar Mutación Definitiva</button>
                            </div>
                        </div>
                    </div>

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
        await this.loadJSZip(); 

        this.dom = {
            grid: document.getElementById('lmsGrid'),
            filters: document.getElementById('lmsFilters'),
            dropzone: document.getElementById('skillDropzone'),
            
            modal: document.getElementById('editModal'),
            btnClose: document.getElementById('btnCloseModal'),
            btnSave: document.getElementById('btnSaveNode'),
            btnDelete: document.getElementById('btnDeleteNode'),
            btnExpand: document.getElementById('btnExpandNode'),
            btnExport: document.getElementById('btnExportSkill'),
            
            inpId: document.getElementById('editNodeId'),
            inpType: document.getElementById('editNodeType'),
            inpProjId: document.getElementById('editNodeProjectId'),
            inpCat: document.getElementById('editNodeCat'),
            inpTitle: document.getElementById('editNodeTitle'),
            inpDesc: document.getElementById('editNodeDesc'),
            inpContent: document.getElementById('editNodeContent'),
            inpKeywords: document.getElementById('editNodeKeywords'),
            
            inpReferences: document.getElementById('editNodeReferences'),
            refLinksContainer: document.getElementById('refLinksContainer'), 
            inpEvals: document.getElementById('editNodeEvals'),
            evalLinksContainer: document.getElementById('evalLinksContainer'),
            inpScripts: document.getElementById('editNodeScripts'),
            scriptLinksContainer: document.getElementById('scriptLinksContainer'),

            draftBanner: document.getElementById('draftBanner'),
            btnApplyDraft: document.getElementById('btnApplyDraft'),
            btnDiscardDraft: document.getElementById('btnDiscardDraft'),

            synapticMount: document.getElementById('synapticMountPoint'),

            btnNewNode: document.getElementById('btnNewNode'), 
            btnOpenResearch: document.getElementById('btnOpenResearch'),
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

        await this.loadData();
        this.setupFilters();
        this.setupModalEvents();
        this.setupDeepResearchEvents();
        this.setupDragAndDrop();
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

    setupDragAndDrop() {
        const dropzone = this.dom.dropzone;
        if (!dropzone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => dropzone.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false));
        ['dragenter', 'dragover'].forEach(eventName => dropzone.addEventListener(eventName, () => dropzone.classList.add('drag-over'), false));
        ['dragleave', 'drop'].forEach(eventName => dropzone.addEventListener(eventName, () => dropzone.classList.remove('drag-over'), false));

        dropzone.addEventListener('drop', async (e) => {
            const dt = e.dataTransfer;
            const file = dt.files[0];
            
            if (file && (file.name.endsWith('.zip') || file.name.endsWith('.skill'))) {
                dropzone.innerHTML = "⏳ Desempaquetando Architectura AgentSkills...";
                await this.parseZipSkillFile(file);
                dropzone.innerHTML = `<span style="font-size:1.5rem;">📥</span><span style="font-weight:bold;">Arrastra aquí un paquete (.skill o .zip) para inyectar su estructura en el Padrón.</span>`;
            } else {
                alert("Formato denegado. Se requiere un paquete (.skill o .zip).");
            }
        }, false);
    }

    async parseZipSkillFile(file) {
        if (!window.JSZip) await this.loadJSZip();
        try {
            const zip = new window.JSZip();
            const contents = await zip.loadAsync(file);
            
            const skillFileKey = Object.keys(contents.files).find(k => k.endsWith('SKILL.md') || k.endsWith('Skill.md'));
            if (!skillFileKey) return alert("Paquete Inválido: No se encontró 'SKILL.md' en el archivo.");
            
            const skillText = await contents.files[skillFileKey].async("text");
            const parsedSkill = this.extractFrontmatter(skillText, file.name.replace('.zip','').replace('.skill',''));
            
            const refIds = [];
            const evalIds = [];
            const scriptIds = [];

            await KB.init();

            for (const relativePath in contents.files) {
                const f = contents.files[relativePath];
                if (f.dir || relativePath === skillFileKey) continue;

                const rawText = await f.async("text");
                const fileName = f.name.split('/').pop();
                const cleanName = fileName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

                if (relativePath.includes('references/') || relativePath.includes('resources/')) {
                    const parsed = this.extractFrontmatter(rawText, fileName.replace('.md', ''));
                    const id = `ref_imp_${cleanName}_${Math.random().toString(36).substr(2,4)}`;
                    await KB.saveNode({
                        id, type: 'reference', category: 'reference', projectId: 'global', targetId: 'global',
                        title: parsed.title, description: parsed.description, content: parsed.content, keywords: ['#imported_ref']
                    });
                    refIds.push(id);
                } 
                else if (relativePath.includes('evals/')) {
                    const id = `eval_imp_${cleanName}_${Math.random().toString(36).substr(2,4)}`;
                    await KB.saveNode({
                        id, type: 'eval', category: 'eval', projectId: 'global', targetId: 'global',
                        title: fileName, description: `Test Cases for ${parsedSkill.title}`, content: rawText, keywords: ['#imported_eval']
                    });
                    evalIds.push(id);
                }
                else if (relativePath.includes('scripts/')) {
                    const id = `script_imp_${cleanName}_${Math.random().toString(36).substr(2,4)}`;
                    await KB.saveNode({
                        id, type: 'script', category: 'script', projectId: 'global', targetId: 'global',
                        title: fileName, description: `Executable code for ${parsedSkill.title}`, content: rawText, keywords: ['#imported_script']
                    });
                    scriptIds.push(id);
                }
            }

            const skillNode = {
                id: `skill_imported_${Date.now()}`,
                type: 'skill', category: 'skill', projectId: 'global', targetId: 'global',
                title: parsedSkill.title, description: parsedSkill.description, content: parsedSkill.content,
                references: refIds, evals: evalIds, scripts: scriptIds, keywords: ['#imported_skill']
            };

            await KB.saveNode(skillNode);
            alert(`✅ AgentSkill Instalada: ${parsedSkill.title} (${refIds.length} Refs, ${evalIds.length} Evals, ${scriptIds.length} Scripts)`);
            await this.loadData();
            await this.forceGraphRefresh();
        } catch (error) {
            alert("Error al desempaquetar la Skill: " + error.message);
        }
    }

    extractFrontmatter(text, defaultTitle) {
        let title = defaultTitle;
        let description = '';
        let content = text;
        const yamlRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = text.match(yamlRegex);
        if (match) {
            const yaml = match[1];
            content = match[2].trim();
            const nameMatch = yaml.match(/name:\s*(.+)/);
            if (nameMatch) title = nameMatch[1].trim();
            const descMatch = yaml.match(/description:\s*(.+)/);
            if (descMatch) description = descMatch[1].trim();
        }
        return { title, description, content };
    }

    async loadData() {
        try {
            await KB.init();
            this.allNodes = await KB.getAllNodes();
            const activeFilter = this.dom.filters.querySelector('.active')?.dataset.filter || 'all';
            this.renderNodes(activeFilter);
        } catch (error) {
            this.dom.grid.innerHTML = `<div class="empty-lms">⚠️ Error crítico leyendo IndexedDB.</div>`;
        }
    }

    renderNodes(filterCategory) {
        let nodesToRender = this.allNodes;
        if (filterCategory !== 'all') nodesToRender = this.allNodes.filter(n => n.category === filterCategory || n.type === filterCategory);
        nodesToRender.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));

        if (nodesToRender.length === 0) {
            this.dom.grid.innerHTML = `<div class="empty-lms"><div style="font-size: 3rem; margin-bottom: 10px;">🕳️</div><h3>Vacío Cognitivo</h3></div>`;
            return;
        }

        this.dom.grid.innerHTML = nodesToRender.map(node => {
            const safeCat = node.type === 'prompt_a2a' ? 'prompt_a2a' : (node.category || 'MEME');
            const tags = (node.keywords && Array.isArray(node.keywords)) ? node.keywords : [];
            let tagsHtml = tags.slice(0, 3).map(t => `<span class="meme-tag">#${t}</span>`).join('');
            const safeId = node.id.replace(/"/g, '&quot;');
            
            const refCount = (node.references && Array.isArray(node.references)) ? node.references.length : 0;
            const evalsCount = (node.evals && Array.isArray(node.evals)) ? node.evals.length : 0;
            const scriptsCount = (node.scripts && Array.isArray(node.scripts)) ? node.scripts.length : 0;

            let countsHtml = '';
            if (refCount > 0) countsHtml += `<span class="meme-tag" style="color:var(--accent-blue);">📚 ${refCount}</span>`;
            if (evalsCount > 0) countsHtml += `<span class="meme-tag" style="color:var(--accent-orange);">📋 ${evalsCount}</span>`;
            if (scriptsCount > 0) countsHtml += `<span class="meme-tag" style="color:var(--accent-green);">⚡ ${scriptsCount}</span>`;

            return `
                <div class="meme-card" data-id="${safeId}">
                    <div class="meme-category ${safeCat}">${safeCat}</div>
                    <h4 class="meme-title">${node.title || 'Sin Título'}</h4>
                    ${node.description ? `<div style="color:var(--accent-blue); font-size:0.75rem; font-weight:bold; margin-bottom:5px;">${node.description}</div>` : ''}
                    <div class="meme-content">${node.content || ''}</div>
                    <div class="meme-footer">
                        <span class="meme-tag" style="color:var(--accent-purple);">✏️ Editar</span>
                        ${countsHtml}
                        ${tagsHtml}
                    </div>
                </div>
            `;
        }).join('');

        this.dom.grid.querySelectorAll('.meme-card').forEach(card => card.addEventListener('click', (e) => this.openEditor(e.currentTarget.dataset.id)));
    }

    setupFilters() {
        const btns = this.dom.filters.querySelectorAll('.filter-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                btns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderNodes(e.target.dataset.filter);
            });
        });
    }

    renderLinkedNodes(idsArray, container, cssClass, icon) {
        if (!container) return;
        container.innerHTML = '';
        if (!idsArray || idsArray.length === 0) return;
        
        idsArray.forEach(id => {
            const node = this.allNodes.find(n => n.id === id);
            const title = node ? node.title : id;
            const badge = document.createElement('span');
            badge.className = cssClass;
            badge.innerHTML = `${icon} ${title} ↗`;
            badge.title = `Inspeccionar: ${id}`;
            badge.onclick = () => {
                this.closeEditor(); 
                setTimeout(() => this.openEditor(id), 350); 
            };
            container.appendChild(badge);
        });
    }

    openEditor(nodeId) {
        const node = this.allNodes.find(n => n.id === nodeId);
        if (!node) return;

        // Limpiamos memoria del Draft al abrir uno nuevo
        this.draftMemory = null;
        this.dom.draftBanner.classList.remove('active');

        this.dom.inpId.value = node.id;
        this.dom.inpType.value = node.type || 'custom'; 
        this.dom.inpProjId.value = node.projectId || 'global';
        this.dom.inpCat.value = node.category || '';
        this.dom.inpTitle.value = node.title || '';
        this.dom.inpDesc.value = node.description || '';
        this.dom.inpContent.value = node.content || '';
        this.dom.inpKeywords.value = (node.keywords && Array.isArray(node.keywords)) ? node.keywords.join(', ') : (node.keywords || '');
        
        const refArr = (node.references && Array.isArray(node.references)) ? node.references : [];
        const evalArr = (node.evals && Array.isArray(node.evals)) ? node.evals : [];
        const scriptArr = (node.scripts && Array.isArray(node.scripts)) ? node.scripts : [];

        this.dom.inpReferences.value = refArr.join(', ');
        this.dom.inpEvals.value = evalArr.join(', ');
        this.dom.inpScripts.value = scriptArr.join(', ');
        
        this.renderLinkedNodes(refArr, this.dom.refLinksContainer, 'ref-badge', '📚');
        this.renderLinkedNodes(evalArr, this.dom.evalLinksContainer, 'eval-badge', '📋');
        this.renderLinkedNodes(scriptArr, this.dom.scriptLinksContainer, 'script-badge', '⚡');

        const isKernel = this.dom.inpKeywords.value.includes('#kernel_sos');
        this.dom.btnDelete.style.display = isKernel ? 'none' : 'block';

        this.dom.modal.classList.add('active');
    }

    closeEditor() { 
        this.dom.modal.classList.remove('active'); 
        this.draftMemory = null;
        this.dom.draftBanner.classList.remove('active');
    }

    async forceGraphRefresh() {
        if (this.synapticInstance) {
            await this.synapticInstance.loadInitialData();
            if (this.synapticInstance.graph3D) this.synapticInstance.graph3D.graphData({ nodes: this.synapticInstance.nodes, links: this.synapticInstance.links });
        }
    }

    setupDeepResearchEvents() {
        this.dom.btnOpenResearch.addEventListener('click', () => this.dom.researchModal.classList.add('active'));
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
                await this.loadData(); await this.forceGraphRefresh();
            } catch (e) {
                alert("Fallo: " + e.message);
            } finally {
                this.dom.btnRunResearch.disabled = false;
                this.dom.btnRunResearch.innerText = "🚀 Iniciar Minado Neuronal";
            }
        });
    }

    setupModalEvents() {
        this.dom.btnClose.addEventListener('click', () => this.closeEditor());
        this.dom.modal.addEventListener('click', (e) => { if (e.target === this.dom.modal) this.closeEditor(); });

        if (this.dom.btnNewNode) {
            this.dom.btnNewNode.addEventListener('click', () => {
                this.dom.inpId.value = '';
                this.dom.inpType.value = 'custom';
                this.dom.inpProjId.value = 'global';
                this.dom.inpCat.value = 'skill';
                this.dom.inpTitle.value = '';
                this.dom.inpDesc.value = '';
                this.dom.inpContent.value = '';
                this.dom.inpKeywords.value = '';
                this.dom.inpReferences.value = '';
                this.dom.inpEvals.value = '';
                this.dom.inpScripts.value = '';
                
                this.renderLinkedNodes([], this.dom.refLinksContainer, '', '');
                this.renderLinkedNodes([], this.dom.evalLinksContainer, '', '');
                this.renderLinkedNodes([], this.dom.scriptLinksContainer, '', '');
                
                this.dom.btnDelete.style.display = 'none';
                this.draftMemory = null;
                this.dom.draftBanner.classList.remove('active');
                this.dom.modal.classList.add('active');
            });
        }

        this.dom.inpReferences.addEventListener('input', (e) => this.renderLinkedNodes(e.target.value.split(',').map(k=>k.trim()).filter(k=>k!==''), this.dom.refLinksContainer, 'ref-badge', '📚'));
        this.dom.inpEvals.addEventListener('input', (e) => this.renderLinkedNodes(e.target.value.split(',').map(k=>k.trim()).filter(k=>k!==''), this.dom.evalLinksContainer, 'eval-badge', '📋'));
        this.dom.inpScripts.addEventListener('input', (e) => this.renderLinkedNodes(e.target.value.split(',').map(k=>k.trim()).filter(k=>k!==''), this.dom.scriptLinksContainer, 'script-badge', '⚡'));

        this.dom.btnExport.addEventListener('click', async () => {
            if (!window.JSZip) await this.loadJSZip();
            const zip = new window.JSZip();

            const title = this.dom.inpTitle.value.trim() || 'Custom_Skill';
            const desc = this.dom.inpDesc.value.trim() || 'Skill generada por TeamTowers V9';
            const content = this.dom.inpContent.value.trim();
            
            const refArray = this.dom.inpReferences.value.split(',').map(r => r.trim()).filter(r => r !== '');
            const evalArray = this.dom.inpEvals.value.split(',').map(r => r.trim()).filter(r => r !== '');
            const scriptArray = this.dom.inpScripts.value.split(',').map(r => r.trim()).filter(r => r !== '');

            const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
            const rootFolder = zip.folder(safeTitle);

            const skillContent = `---\nname: ${title}\ndescription: ${desc}\n---\n\n${content}`;
            rootFolder.file("SKILL.md", skillContent);

            await KB.init();

            if (refArray.length > 0) {
                const resourcesFolder = rootFolder.folder("references");
                for (const refId of refArray) {
                    const refNode = await KB.getNode(refId);
                    if (refNode) {
                        const refNameSafe = (refNode.title || refNode.id).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
                        const refContent = `---\nname: ${refNode.title}\ndescription: ${refNode.description || ''}\n---\n\n${refNode.content}`;
                        resourcesFolder.file(`${refNameSafe}.md`, refContent);
                    }
                }
            }

            if (evalArray.length > 0) {
                const evalsFolder = rootFolder.folder("evals");
                let allEvalsJson = [];
                for (const evalId of evalArray) {
                    const evalNode = await KB.getNode(evalId);
                    if (evalNode) {
                        try {
                            const parsed = JSON.parse(evalNode.content);
                            if (Array.isArray(parsed)) allEvalsJson.push(...parsed);
                            else allEvalsJson.push(parsed);
                        } catch(e) {
                            allEvalsJson.push({ id: evalNode.id, prompt: evalNode.title, description: evalNode.description });
                        }
                    }
                }
                if (allEvalsJson.length > 0) {
                    const finalEvalFile = { skill_name: safeTitle, evals: allEvalsJson };
                    evalsFolder.file("evals.json", JSON.stringify(finalEvalFile, null, 2));
                }
            }

            if (scriptArray.length > 0) {
                const scriptsFolder = rootFolder.folder("scripts");
                for (const scriptId of scriptArray) {
                    const scriptNode = await KB.getNode(scriptId);
                    if (scriptNode) {
                        const sName = scriptNode.title.includes('.') ? scriptNode.title : `${scriptNode.title}.py`;
                        scriptsFolder.file(sName.replace(/[^a-zA-Z0-9_.-]/g, '_'), scriptNode.content);
                    }
                }
            }

            const blob = await zip.generateAsync({type:"blob"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${safeTitle}.skill`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });

        // 🔥 LÓGICA DE DRAFTS Y CONTROL DE VERSIONES VISUAL
        if (this.dom.btnExpand) {
            this.dom.btnExpand.addEventListener('click', async () => {
                const title = this.dom.inpTitle.value.trim();
                const content = this.dom.inpContent.value.trim();
                const cat = this.dom.inpCat.value.trim();
                const tags = this.dom.inpKeywords.value.trim();
                
                if (!title) return alert("Se necesita al menos un título para que la IA sepa qué desarrollar.");

                // Guardamos el estado original antes de mutar
                this.draftMemory = {
                    title: title,
                    desc: this.dom.inpDesc.value,
                    content: content,
                    keywords: tags,
                    references: this.dom.inpReferences.value
                };

                this.dom.btnExpand.disabled = true;
                this.dom.btnExpand.innerText = "⏳ El Synaptic Weaver está meditando...";

                try {
                    const optimizedData = await Orchestrator.expandNodeSemantics(title, cat, content, tags);
                    
                    // Inyectamos la mutación en la UI (Modo Vista Previa)
                    this.dom.inpTitle.value = optimizedData.title;
                    this.dom.inpDesc.value = optimizedData.description || '';
                    this.dom.inpContent.value = optimizedData.content;
                    this.dom.inpKeywords.value = optimizedData.keywords.join(', ');
                    
                    if (optimizedData.reference_docs && optimizedData.reference_docs.length > 0) {
                        await KB.init();
                        let currentRefs = this.dom.inpReferences.value.split(',').map(r => r.trim()).filter(r => r !== '');
                        
                        for (const refDoc of optimizedData.reference_docs) {
                            const cleanName = refDoc.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 25);
                            const newRefId = `ref_draft_${cleanName}_${Math.random().toString(36).substr(2,4)}`;
                            
                            // Guardamos las referencias generadas temporalmente (se purgarán si descartas)
                            await KB.saveNode({
                                id: newRefId, type: 'reference', category: 'reference', projectId: 'global', targetId: 'global',
                                title: refDoc.title, description: refDoc.description, content: refDoc.content, keywords: ['#ai_draft_ref']
                            });
                            currentRefs.push(newRefId);
                        }
                        
                        this.dom.inpReferences.value = currentRefs.join(', ');
                        this.renderLinkedNodes(currentRefs, this.dom.refLinksContainer, 'ref-badge', '📚'); 
                    }
                    
                    // Activamos el Banner de Control de Versiones
                    this.dom.draftBanner.classList.add('active');
                    this.dom.btnExpand.style.display = 'none'; // Ocultamos el botón de pedir mejoras para no apilar drafts
                    
                } catch (error) { 
                    alert("Fallo en la expansión: " + error.message); 
                    this.draftMemory = null;
                } finally { 
                    this.dom.btnExpand.disabled = false; 
                    this.dom.btnExpand.innerText = "🌱 Solicitar Mejora a IA"; 
                }
            });
        }

        this.dom.btnDiscardDraft.addEventListener('click', async () => {
            if (!this.draftMemory) return;
            
            // Restauramos los valores originales
            this.dom.inpTitle.value = this.draftMemory.title;
            this.dom.inpDesc.value = this.draftMemory.desc;
            this.dom.inpContent.value = this.draftMemory.content;
            this.dom.inpKeywords.value = this.draftMemory.keywords;
            this.dom.inpReferences.value = this.draftMemory.references;
            
            this.renderLinkedNodes(this.draftMemory.references.split(',').map(k=>k.trim()).filter(k=>k!==''), this.dom.refLinksContainer, 'ref-badge', '📚');

            // Limpieza de UI
            this.dom.draftBanner.classList.remove('active');
            this.dom.btnExpand.style.display = 'block';
            this.draftMemory = null;
            
            // Nota: Aquí se podrían purgar de la KB las #ai_draft_ref creadas
        });

        this.dom.btnApplyDraft.addEventListener('click', () => {
            // El humano aprueba el Draft. Limpiamos la UI y le indicamos que ahora debe Sellar (Guardar)
            this.dom.draftBanner.classList.remove('active');
            this.dom.btnExpand.style.display = 'block';
            this.draftMemory = null;
            
            // Destacamos el botón de Guardado
            this.dom.btnSave.style.boxShadow = "0 0 30px rgba(0, 230, 118, 0.8)";
            setTimeout(() => this.dom.btnSave.style.boxShadow = "", 1500);
        });

        this.dom.btnSave.addEventListener('click', async () => {
            if (this.draftMemory) return alert("Tienes una mutación de la IA pendiente. Acéptala o descártala antes de sellar.");

            const id = this.dom.inpId.value;
            const title = this.dom.inpTitle.value.trim();
            const desc = this.dom.inpDesc.value.trim();
            const content = this.dom.inpContent.value.trim();
            if (!title || !content) return alert("Título y contenido son obligatorios.");

            const keywordsArray = this.dom.inpKeywords.value.split(',').map(k => k.trim()).filter(k => k !== '');
            const referencesArray = this.dom.inpReferences.value.split(',').map(k => k.trim()).filter(k => k !== '');
            const evalsArray = this.dom.inpEvals.value.split(',').map(k => k.trim()).filter(k => k !== '');
            const scriptsArray = this.dom.inpScripts.value.split(',').map(k => k.trim()).filter(k => k !== '');
            
            const oldNode = this.allNodes.find(n => n.id === id) || {};
            
            const updatedNode = { 
                ...oldNode, 
                id: id || `custom_${Date.now()}_${Math.random().toString(36).substr(2,4)}`, 
                type: this.dom.inpType.value || oldNode.type || 'custom', 
                projectId: this.dom.inpProjId.value || oldNode.projectId || 'global', 
                category: this.dom.inpCat.value.trim() || oldNode.category || 'skill', 
                title: title, 
                description: desc, 
                content: content, 
                keywords: keywordsArray, 
                references: referencesArray,
                evals: evalsArray,     
                scripts: scriptsArray  
            };

            this.dom.btnSave.disabled = true; 
            this.dom.btnSave.innerText = "⏳ Sellando...";
            
            try {
                await KB.init(); 
                await KB.saveNode(updatedNode);
                await this.loadData(); 
                await this.forceGraphRefresh();
                this.closeEditor();
            } catch (e) { 
                alert(`Error al guardar: ${e.message}`); 
            } finally { 
                this.dom.btnSave.disabled = false; 
                this.dom.btnSave.innerText = "💾 Sellar Mutación Definitiva"; 
            }
        });

        this.dom.btnDelete.addEventListener('click', async () => {
            const id = this.dom.inpId.value;
            if (!confirm("⚠️ ¿Purgar este nodo?")) return;
            this.dom.btnDelete.disabled = true;
            try {
                await KB.init(); await KB.deleteNode(id);
                await this.loadData(); await this.forceGraphRefresh();
                this.closeEditor();
            } catch (e) { alert(`Error: ${e.message}`); } 
            finally { this.dom.btnDelete.disabled = false; }
        });
    }
}
