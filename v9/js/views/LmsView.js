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

                /* LISTA VIEW & DROPZONE */
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

                .meme-title { font-size: 1.1rem; color: white; margin: 10px 0 0 0; font-weight: 900;}
                .meme-content { color: #aaa; font-size: 0.9rem; line-height: 1.5; font-family: 'Georgia', serif; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;}
                
                .meme-footer { margin-top: auto; padding-top: 15px; border-top: 1px dashed #333; display: flex; flex-wrap: wrap; gap: 5px; align-items: center;}
                .meme-tag { background: rgba(0,0,0,0.6); color: #888; font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono);}

                .empty-lms { grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: #666; border: 1px dashed #333; border-radius: 20px;}

                #synapticMountPoint { width: 100%; flex: 1; min-height: 500px; border-radius: 20px; overflow: hidden; }

                /* MODAL OVERLAY */
                .modal-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(5,5,8,0.8); backdrop-filter: blur(10px); z-index: 1000; display: none; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s;}
                .modal-overlay.active { display: flex; opacity: 1; }
                .modal-card { background: linear-gradient(145deg, rgba(20,20,25,0.95), rgba(10,10,15,0.98)); border: 1px solid var(--accent-purple); border-radius: 20px; width: 100%; max-width: 650px; padding: 2rem; box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(224,64,251,0.2); transform: translateY(20px); transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); max-height: 90vh; overflow-y: auto;}
                .modal-overlay.active .modal-card { transform: translateY(0); }
                
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px dashed #333; padding-bottom: 1rem;}
                .modal-header h2 { margin: 0; color: white; font-size: 1.5rem; font-weight: 900;}
                .btn-close { background: transparent; border: none; color: #888; font-size: 1.5rem; cursor: pointer; transition: 0.2s;}
                .btn-close:hover { color: var(--accent-red); transform: scale(1.1);}

                .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;}
                .form-group label { color: var(--accent-blue); font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;}
                .form-control { background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; padding: 12px; border-radius: 10px; font-family: var(--font-main); font-size: 0.95rem; outline: none; transition: 0.2s;}
                .form-control:focus { border-color: var(--accent-purple); box-shadow: 0 0 15px rgba(224,64,251,0.1);}
                .form-control.textarea { min-height: 150px; resize: vertical; font-family: 'Georgia', serif; line-height: 1.6;}
                
                .modal-actions { display: flex; justify-content: flex-end; flex-wrap:wrap; gap: 10px; margin-top: 2rem; border-top: 1px dashed #333; padding-top: 1.5rem;}
                .btn-modal { padding: 12px 24px; border-radius: 10px; font-weight: 900; font-size: 0.9rem; cursor: pointer; transition: 0.3s; border: none;}
                .btn-save { background: var(--accent-purple); color: white; box-shadow: 0 5px 15px rgba(224,64,251,0.3);}
                .btn-save:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(224,64,251,0.5); filter: brightness(1.2);}
                .btn-danger { background: transparent; border: 1px solid var(--accent-red); color: var(--accent-red);}
                .btn-danger:hover { background: rgba(255,82,82,0.1); transform: translateY(-2px);}
                
                .btn-antigravity { background: linear-gradient(135deg, var(--accent-blue), var(--accent-green)); color: black; box-shadow: 0 5px 15px rgba(0,176,255,0.3); }
                .btn-antigravity:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,230,118,0.5); filter: brightness(1.2); }
                
                .btn-expand { background: linear-gradient(135deg, var(--accent-orange), #ff3d00); color: white; box-shadow: 0 5px 15px rgba(255,171,64,0.3); }
                .btn-expand:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(255,171,64,0.5); filter: brightness(1.2); }

                .btn-export { background: transparent; border: 1px dashed var(--accent-purple); color: var(--accent-purple); }
                .btn-export:hover { background: rgba(224,64,251,0.1); }

                @media (max-width: 768px) {
                    .workspace-lms { padding: 90px 1rem 120px 1rem; }
                    .lms-controls-row { flex-direction: column; align-items: stretch; }
                    .btn-deep-research { justify-content: center; }
                    .modal-card { padding: 1.5rem; border-radius: 16px; margin: 10px; }
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
                                <button class="filter-btn" data-filter="core_os">🔧 OS Kernel</button>
                                <button class="filter-btn" data-filter="skill">🎒 Skills</button>
                                <button class="filter-btn" data-filter="reference">📚 Referencias</button>
                                <button class="filter-btn" data-filter="prompt_a2a">🤖 Prompts AI</button>
                            </div>
                            <button class="btn-deep-research" id="btnOpenResearch"><span style="font-size:1.2rem;">🧠</span> Deep Research (IA)</button>
                        </div>

                        <div class="dropzone-area" id="skillDropzone">
                            <span style="font-size:1.5rem;">📥</span>
                            <span style="font-weight:bold;">Arrastra aquí un .skill, .zip o .md para inyectarlo en el Padrón.</span>
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
                                <h2>🧠 Forjar Nodo de Conocimiento</h2>
                                <button class="btn-close" id="btnCloseModal">&times;</button>
                            </div>
                            
                            <input type="hidden" id="editNodeId">
                            <input type="hidden" id="editNodeType">
                            <input type="hidden" id="editNodeProjectId">
                            
                            <div style="display:flex; gap:15px;">
                                <div class="form-group" style="flex:1;">
                                    <label>Categoría W3C</label>
                                    <input type="text" id="editNodeCat" class="form-control" placeholder="Ej: skill, reference...">
                                </div>
                                <div class="form-group" style="flex:2;">
                                    <label>Título del Nodo</label>
                                    <input type="text" id="editNodeTitle" class="form-control" placeholder="Título descriptivo">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Descripción Corta (Enrutamiento RAG)</label>
                                <input type="text" id="editNodeDesc" class="form-control" placeholder="Explica cuándo el agente debe invocar esta skill...">
                            </div>

                            <div class="form-group">
                                <label>Contenido Cognitivo (Instrucciones)</label>
                                <textarea id="editNodeContent" class="form-control textarea" placeholder="Desarrollo del concepto..."></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label>Dependencias / Referencias Requeridas (IDs separados por coma)</label>
                                <input type="text" id="editNodeReferences" class="form-control" style="font-family:var(--font-mono); color:var(--accent-blue);" placeholder="ref_os_vna, ref_os_codex">
                            </div>
                            
                            <div class="form-group">
                                <label>Tags (Gravedad 3D)</label>
                                <input type="text" id="editNodeKeywords" class="form-control" style="font-family:var(--font-mono); color:var(--accent-green);" placeholder="tag1, tag2">
                            </div>

                            <div class="modal-actions">
                                <button class="btn-modal btn-danger" id="btnDeleteNode">🗑️ Purgar</button>
                                <button class="btn-modal btn-export" id="btnExportSkill">📦 Exportar (.zip)</button>
                                <div style="flex:1;"></div>
                                <button class="btn-modal btn-expand" id="btnExpandNode">🌱 Desarrollar Skill (IA)</button>
                                <button class="btn-modal btn-antigravity" id="btnAntigravity">✨ Comprimir</button>
                                <button class="btn-modal btn-save" id="btnSaveNode">💾 Sellar</button>
                            </div>
                        </div>
                    </div>

                    <div class="modal-overlay" id="researchModal">
                        <div class="modal-card" style="border-top-color: var(--accent-blue);">
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
            btnAntigravity: document.getElementById('btnAntigravity'),
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

            synapticMount: document.getElementById('synapticMountPoint'),

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
            
            // 🔥 Añadido soporte nativo para '.skill'
            if (file && (file.name.endsWith('.zip') || file.name.endsWith('.skill'))) {
                dropzone.innerHTML = "⏳ Desempaquetando Paquete...";
                await this.parseZipSkillFile(file);
                dropzone.innerHTML = `<span style="font-size:1.5rem;">📥</span><span style="font-weight:bold;">Arrastra aquí un .skill, .zip o .md para inyectarlo.</span>`;
            } else if (file && file.name.endsWith('.md')) {
                this.parseMarkdownSkillFile(file);
            } else {
                alert("Formato denegado. Solo se admiten paquetes (.zip, .skill) o archivos markdown individuales (.md).");
            }
        }, false);
    }

    async parseZipSkillFile(file) {
        if (!window.JSZip) await this.loadJSZip();
        try {
            const zip = new window.JSZip();
            const contents = await zip.loadAsync(file);
            
            const skillFileKey = Object.keys(contents.files).find(k => k.endsWith('Skill.md'));
            if (!skillFileKey) return alert("Paquete Inválido: No se encontró 'Skill.md' en el archivo.");
            
            const skillText = await contents.files[skillFileKey].async("text");
            const parsedSkill = this.extractFrontmatter(skillText, file.name.replace('.zip','').replace('.skill',''));
            
            const referenceIds = [];
            for (const relativePath in contents.files) {
                const f = contents.files[relativePath];
                if (!f.dir && relativePath.includes('/') && relativePath.endsWith('.md') && !relativePath.endsWith('Skill.md')) {
                    const refText = await f.async("text");
                    const refParsed = this.extractFrontmatter(refText, f.name.split('/').pop().replace('.md', ''));
                    
                    const refNode = {
                        id: `ref_imported_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
                        type: 'reference', category: 'reference', projectId: 'global', targetId: 'global',
                        title: refParsed.title, description: refParsed.description, content: refParsed.content, keywords: ['#imported_ref']
                    };
                    await KB.init();
                    await KB.saveNode(refNode);
                    referenceIds.push(refNode.id);
                }
            }

            const skillNode = {
                id: `skill_imported_${Date.now()}`,
                type: 'skill', category: 'skill', projectId: 'global', targetId: 'global',
                title: parsedSkill.title, description: parsedSkill.description, content: parsedSkill.content,
                references: referenceIds, keywords: ['#imported_skill']
            };

            await KB.saveNode(skillNode);
            alert(`✅ Paquete Inyectado: ${parsedSkill.title} (${referenceIds.length} referencias asociadas)`);
            await this.loadData();
            await this.forceGraphRefresh();
        } catch (error) {
            alert("Error al desempaquetar: " + error.message);
        }
    }

    parseMarkdownSkillFile(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const parsed = this.extractFrontmatter(e.target.result, file.name.replace('.md', ''));
            const newNode = {
                id: `skill_imported_${Date.now()}`, type: 'skill', category: 'skill', projectId: 'global', targetId: 'global',
                title: parsed.title, description: parsed.description, content: parsed.content, keywords: ['#imported']
            };
            try {
                await KB.init(); await KB.saveNode(newNode);
                alert(`✅ Archivo individual inyectado: ${parsed.title}`);
                await this.loadData(); await this.forceGraphRefresh();
            } catch (err) { alert("Fallo inyectando: " + err.message); }
        };
        reader.readAsText(file);
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

            return `
                <div class="meme-card" data-id="${safeId}">
                    <div class="meme-category ${safeCat}">${safeCat}</div>
                    <h4 class="meme-title">${node.title || 'Sin Título'}</h4>
                    ${node.description ? `<div style="color:var(--accent-blue); font-size:0.75rem; font-weight:bold; margin-bottom:5px;">${node.description}</div>` : ''}
                    <div class="meme-content">${node.content || ''}</div>
                    <div class="meme-footer">
                        <span class="meme-tag" style="color:var(--accent-blue);">✏️ Editar</span>
                        ${refCount > 0 ? `<span class="meme-tag" style="color:var(--accent-orange);">📚 ${refCount} Refs</span>` : ''}
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

    openEditor(nodeId) {
        const node = this.allNodes.find(n => n.id === nodeId);
        if (!node) return;

        this.dom.inpId.value = node.id;
        this.dom.inpType.value = node.type || 'meme';
        this.dom.inpProjId.value = node.projectId || 'global';
        this.dom.inpCat.value = node.category || '';
        this.dom.inpTitle.value = node.title || '';
        this.dom.inpDesc.value = node.description || '';
        this.dom.inpContent.value = node.content || '';
        this.dom.inpKeywords.value = (node.keywords && Array.isArray(node.keywords)) ? node.keywords.join(', ') : (node.keywords || '');
        this.dom.inpReferences.value = (node.references && Array.isArray(node.references)) ? node.references.join(', ') : '';

        const isKernel = this.dom.inpKeywords.value.includes('#kernel_sos');
        this.dom.btnDelete.style.display = isKernel ? 'none' : 'block';

        this.dom.modal.classList.add('active');
    }

    closeEditor() { this.dom.modal.classList.remove('active'); }

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

        // 🔥 EXPORTADOR DE PAQUETES ZIP (AgentSkills Standard Strict)
        this.dom.btnExport.addEventListener('click', async () => {
            if (!window.JSZip) await this.loadJSZip();
            const zip = new window.JSZip();

            const title = this.dom.inpTitle.value.trim() || 'Custom_Skill';
            const desc = this.dom.inpDesc.value.trim() || 'Skill generada por TeamTowers V9';
            const content = this.dom.inpContent.value.trim();
            const refString = this.dom.inpReferences.value.trim();
            const refArray = refString ? refString.split(',').map(r => r.trim()).filter(r => r !== '') : [];

            // 🔥 CREAR CARPETA RAÍZ OBLIGATORIA (Estándar Claude)
            const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
            const rootFolder = zip.folder(safeTitle);

            const skillContent = `---\nname: ${title}\ndescription: ${desc}\n---\n\n${content}`;
            rootFolder.file("Skill.md", skillContent);

            if (refArray.length > 0) {
                // 🔥 La carpeta "resources" debe estar DENTRO de la carpeta de la skill
                const resourcesFolder = rootFolder.folder("resources");
                await KB.init();
                for (const refId of refArray) {
                    const refNode = await KB.getNode(refId);
                    if (refNode) {
                        const refNameSafe = (refNode.title || refNode.id).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
                        const refContent = `---\nname: ${refNode.title}\ndescription: ${refNode.description || ''}\n---\n\n${refNode.content}`;
                        resourcesFolder.file(`${refNameSafe}.md`, refContent);
                    }
                }
            }

            const blob = await zip.generateAsync({type:"blob"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${safeTitle}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });

        if (this.dom.btnExpand) {
            this.dom.btnExpand.addEventListener('click', async () => {
                const title = this.dom.inpTitle.value.trim();
                const content = this.dom.inpContent.value.trim();
                const cat = this.dom.inpCat.value.trim();
                const tags = this.dom.inpKeywords.value.trim();
                
                if (!title) return alert("Se necesita al menos un título para que la IA sepa qué desarrollar.");

                this.dom.btnExpand.disabled = true;
                this.dom.btnExpand.innerText = "⏳ Forjando Skill y Referencias...";

                try {
                    const optimizedData = await Orchestrator.expandNodeSemantics(title, cat, content, tags);
                    
                    this.dom.inpTitle.value = optimizedData.title;
                    this.dom.inpDesc.value = optimizedData.description || '';
                    this.dom.inpContent.value = optimizedData.content;
                    this.dom.inpKeywords.value = optimizedData.keywords.join(', ');
                    
                    if (optimizedData.reference_docs && optimizedData.reference_docs.length > 0) {
                        await KB.init();
                        let currentRefs = this.dom.inpReferences.value.split(',').map(r => r.trim()).filter(r => r !== '');
                        
                        for (const refDoc of optimizedData.reference_docs) {
                            const newRefId = `ref_ai_${Date.now()}_${Math.random().toString(36).substr(2,5)}`;
                            await KB.saveNode({
                                id: newRefId, type: 'reference', category: 'reference', projectId: 'global', targetId: 'global',
                                title: refDoc.title, description: refDoc.description, content: refDoc.content, keywords: ['#ai_generated', '#reference']
                            });
                            currentRefs.push(newRefId);
                        }
                        
                        this.dom.inpReferences.value = currentRefs.join(', ');
                        await this.loadData();
                        await this.forceGraphRefresh();
                        alert(`🌱 Skill expandida. Se han generado ${optimizedData.reference_docs.length} referencias teóricas adjuntas.`);
                    } else {
                        alert("🌱 Skill expandida. No se requirieron referencias adicionales.");
                    }
                    
                } catch (error) { 
                    alert("Fallo en la expansión: " + error.message); 
                } finally { 
                    this.dom.btnExpand.disabled = false; 
                    this.dom.btnExpand.innerText = "🌱 Desarrollar Skill (IA)"; 
                }
            });
        }

        if (this.dom.btnAntigravity) {
            this.dom.btnAntigravity.addEventListener('click', async () => {
                const title = this.dom.inpTitle.value.trim();
                const content = this.dom.inpContent.value.trim();
                const cat = this.dom.inpCat.value.trim();
                if (!content) return alert("El nodo debe tener contenido para optimizarse.");

                this.dom.btnAntigravity.disabled = true;
                this.dom.btnAntigravity.innerText = "⏳ Comprimiendo...";

                const systemPrompt = `Eres el Agente de Optimización Antigravity. Eleva la densidad semántica de este Nodo W3C. Comprime el texto, escribe una 'description' corta y genera 'keywords'. Devuelve JSON: { "title": "Título", "description": "Resumen...", "content": "Contenido...", "keywords": ["tag1"] }`;
                const userPrompt = `Título: ${title}\nCategoría: ${cat}\nContenido:\n${content}`;

                try {
                    let provider = localStorage.getItem('tt_ai_provider') || 'openai';
                    let apiKey = localStorage.getItem(`tt_key_${provider}`);
                    const response = await Orchestrator.callLLM({ provider, apiKey, systemPrompt, userPrompt, responseFormat: "json_object", temperature: 0.2 });
                    
                    this.dom.inpTitle.value = response.content.title;
                    this.dom.inpDesc.value = response.content.description || '';
                    this.dom.inpContent.value = response.content.content;
                    this.dom.inpKeywords.value = response.content.keywords.join(', ');
                } catch (error) { alert("Fallo: " + error.message); } 
                finally { this.dom.btnAntigravity.disabled = false; this.dom.btnAntigravity.innerText = "✨ Comprimir"; }
            });
        }

        this.dom.btnSave.addEventListener('click', async () => {
            const id = this.dom.inpId.value;
            const title = this.dom.inpTitle.value.trim();
            const desc = this.dom.inpDesc.value.trim();
            const content = this.dom.inpContent.value.trim();
            if (!title || !content) return alert("Título y contenido son obligatorios.");

            const keywordsArray = this.dom.inpKeywords.value.split(',').map(k => k.trim()).filter(k => k !== '');
            const referencesArray = this.dom.inpReferences.value.split(',').map(k => k.trim()).filter(k => k !== '');
            
            const updatedNode = { 
                id, type: this.dom.inpType.value, projectId: this.dom.inpProjId.value, category: this.dom.inpCat.value.trim(), 
                title, description: desc, content, keywords: keywordsArray, references: referencesArray 
            };

            this.dom.btnSave.disabled = true; this.dom.btnSave.innerText = "⏳ Sellando...";
            try {
                await KB.init(); await KB.saveNode(updatedNode);
                await this.loadData(); await this.forceGraphRefresh();
                this.closeEditor();
            } catch (e) { alert(`Error: ${e.message}`); } 
            finally { this.dom.btnSave.disabled = false; this.dom.btnSave.innerText = "💾 Sellar Mutación"; }
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
