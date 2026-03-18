// v8/js/views/LmsView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';
import { Orchestrator } from '../core/Orchestrator.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import '../components/SemanticElement.js'; 

export default class LmsView {
    constructor() {
        document.title = "Forja LMS | TeamTowers V14";
        this.activeProjectId = null;
        this.currentEditMemeId = null; 
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        if (!project && state.projects.length > 0) project = state.projects[state.projects.length - 1];

        const isPO = project && (project.ownerId === activeUserId || state.session.role === 'ecosystem-owner');

        const headerConfig = {
            title: "La Forja (Cerebro LMS)",
            subtitle: project ? project.nombre : 'Global',
            tagline: "Destila conocimiento industrial veraz en Memes W3C. La IA audita la red académica."
        };

        const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
        const apiKey = localStorage.getItem(`tt_key_${provider}`) || '';
        const hasKey = apiKey.length > 5;

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-lms { flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; box-sizing: border-box;}
                
                .lms-layout { display: grid; grid-template-columns: 450px 1fr; gap: 2rem; padding-bottom: 5rem; align-items: start;}
                
                /* PANEL IZQUIERDO: INGESTA Y RESEARCH */
                .forge-panel { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--accent-purple); border-radius: 24px; padding: 2rem; position: sticky; top: 0; box-shadow: 0 15px 40px rgba(0,0,0,0.5), inset 0 2px 15px rgba(224,64,251,0.05); backdrop-filter: blur(10px);}
                .forge-header { display: flex; align-items: center; gap: 15px; margin-bottom: 1.5rem; border-bottom: 1px dashed rgba(224,64,251,0.3); padding-bottom: 1rem;}
                .forge-icon { font-size: 2.5rem; filter: drop-shadow(0 0 10px rgba(224,64,251,0.5));}
                .forge-title { margin: 0; color: white; font-weight: 900; font-size: 1.3rem;}
                
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; font-size: 0.75rem; color: var(--accent-purple); text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 14px; border-radius: 12px; font-family: var(--font-main); font-size: 0.95rem; outline: none; transition: 0.3s; box-sizing: border-box; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);}
                .form-control:focus { border-color: var(--accent-purple); box-shadow: 0 0 15px rgba(224,64,251,0.15);}
                
                .btn-research { background: transparent; border: 1px dashed var(--accent-purple); color: var(--accent-purple); padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.3s; width: 100%; display:flex; justify-content:center; align-items:center; gap:8px;}
                .btn-research:hover:not(:disabled) { background: rgba(224,64,251,0.1); border-style: solid;}
                
                .btn-forge { background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; width: 100%; text-transform: uppercase; margin-top: 10px;}
                .btn-forge:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(224,64,251,0.4); }
                .btn-forge:disabled, .btn-research:disabled { opacity: 0.5; cursor: not-allowed; }

                /* PANEL DERECHO: GRID FRACTAL */
                .kb-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;}
                .kb-title { color: white; font-size: 1.3rem; font-weight: 900; margin: 0; display:flex; align-items:center; gap:10px;}
                
                .lms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
                .meme-wrapper { position: relative; cursor: pointer; transition: 0.2s;}
                .meme-wrapper:hover { transform: translateY(-4px); z-index:10; }
                .meme-wrapper:hover::after { content: '✏️ Editar Meme / Prompt'; position: absolute; bottom: -15px; left: 50%; transform: translateX(-50%); background: var(--accent-purple); color: white; font-size: 0.7rem; padding: 4px 10px; border-radius: 10px; font-weight: bold; pointer-events: none;}

                /* MODAL EDICIÓN FRACTAL */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(15px); display: none; justify-content: center; align-items: center; z-index: 5000; }
                .modal-content { background: var(--bg-dark); border: 1px solid var(--accent-purple); padding: 2.5rem; border-radius: 20px; width: 600px; max-width: 95%; box-shadow: 0 30px 60px rgba(0,0,0,0.9); border-top: 4px solid var(--accent-purple); max-height: 90vh; overflow-y:auto;}
                
                .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #333; padding-bottom:15px;}
                .btn-delete-meme { background: rgba(255,82,82,0.1); color: var(--accent-red); border: 1px solid var(--accent-red); padding: 8px 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.8rem; transition:0.2s;}
                .btn-delete-meme:hover { background: var(--accent-red); color: white;}

                .btn-enrich-meme { background: transparent; border: 1px dashed var(--accent-green); color: var(--accent-green); width: 100%; padding: 12px; border-radius: 12px; font-weight: bold; font-size: 0.9rem; cursor: pointer; transition: 0.3s; margin-bottom: 20px; display: flex; justify-content: center; align-items: center; gap: 8px; }
                .btn-enrich-meme:hover:not(:disabled) { background: rgba(0, 230, 118, 0.1); border-style: solid; box-shadow: 0 5px 15px rgba(0,230,118,0.2); }
                .btn-enrich-meme:disabled { opacity: 0.5; cursor: not-allowed; }

                .loading-box { display:none; background: rgba(224,64,251,0.05); border: 1px dashed var(--accent-purple); padding: 20px; text-align: center; border-radius: 12px; color: var(--accent-purple); font-family: monospace; font-weight: bold; margin-bottom: 15px;}

                @media (max-width: 900px) {
                    .workspace-lms { padding: 90px 1rem 120px 1rem; }
                    .lms-layout { grid-template-columns: 1fr; }
                    .forge-panel { position: relative; top: 0; margin-bottom: 2rem;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/lms')}
                
                <main class="workspace-lms">
                    ${PageHeader.getHtml(headerConfig)}
                    
                    ${!hasKey && isPO ? `
                        <div style="background: rgba(255,82,82,0.1); border: 1px solid var(--accent-red); color: white; padding: 15px; border-radius: 12px; margin-bottom: 2rem;">
                            ⚠️ <b>Atención:</b> No tienes una API Key configurada en el Panteón. La Búsqueda y Forja IA están desactivadas.
                        </div>
                    ` : ''}

                    <div class="lms-layout">
                        <div class="forge-panel">
                            <div class="forge-header">
                                <div class="forge-icon">🔥</div>
                                <div>
                                    <h3 class="forge-title">Oráculo & Destilería</h3>
                                    <p style="margin:5px 0 0 0; color:#888; font-size:0.8rem;">Consulta a la IA sobre estándares o pega tu propio manual para inyectarlo en el Cerebro.</p>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>1. Consultar Oráculo (Deep Research)</label>
                                <input type="text" id="inpTopic" class="form-control" placeholder="Ej: Metodologías de Clean Architecture en Rust...">
                            </div>
                            
                            <div style="display:flex; gap:10px; margin-bottom:20px;">
                                <select id="inpCategory" class="form-control" style="flex:1;">
                                    <option value="SOC">Condiciones de Auditoría (SOC)</option>
                                    <option value="SOP">Flujo Operativo (SOP)</option>
                                    <option value="SKILL">Competencias (SKILL)</option>
                                    <option value="RULE">Regla de Negocio (RULE)</option>
                                </select>
                                <button id="btnResearch" class="btn-research" ${!hasKey || !isPO ? 'disabled' : ''}>✨ Investigar</button>
                            </div>

                            <div id="loadingResearch" class="loading-box">Consultando repositorios y fuentes académicas...</div>

                            <div class="form-group">
                                <label>2. Texto Bruto / Resultados del Oráculo</label>
                                <textarea id="inpRawText" class="form-control" style="min-height: 180px;" placeholder="Pega un manual aquí o usa el botón de arriba para que la IA investigue por ti..."></textarea>
                            </div>

                            <div class="form-group">
                                <label>Rol Objetivo (Destinatario)</label>
                                <select id="inpTargetRole" class="form-control" style="color:var(--accent-blue); font-weight:bold;">
                                    <option value="Global">Global (Toda la red)</option>
                                    <option value="@anxaneta">👑 @anxaneta (Dirección)</option>
                                    <option value="@aixecador">🧭 @aixecador (Táctica)</option>
                                    <option value="@dosos">👁️ @dosos (Auditoría)</option>
                                    <option value="@baixos">⚙️ @baixos (Producción)</option>
                                    <option value="@pinya">🤝 @pinya (Soporte)</option>
                                </select>
                            </div>

                            <button id="btnDistill" class="btn-forge" ${!hasKey || !isPO ? 'disabled' : ''}>
                                🧠 Destilar a Memes W3C
                            </button>
                        </div>

                        <div>
                            <div class="kb-header">
                                <h3 class="kb-title"><span>🧬</span> Red Neuronal del Castell</h3>
                                <span style="color:var(--text-muted); font-family:var(--font-mono); font-size:0.8rem;" id="kbCount">0 Nodos</span>
                            </div>
                            
                            <div class="lms-grid" id="kbGrid"></div>
                        </div>
                    </div>
                </main>

                <div class="modal-overlay" id="editMemeModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 style="color:white; margin:0; font-weight:900;">✏️ Editor Cuántico</h2>
                            <button id="btnDeleteMeme" class="btn-delete-meme">🗑️ Extirpar</button>
                        </div>
                        
                        <button id="btnEnrichMeme" class="btn-enrich-meme" ${!hasKey || !isPO ? 'disabled' : ''}>
                            🌟 Enriquecer Meme con @mestre_escola (IA)
                        </button>

                        <div style="display:flex; gap:10px; margin-bottom:15px;">
                            <div class="form-group" style="flex:1; margin:0;">
                                <label>Categoría</label>
                                <select id="editMemeCat" class="form-control">
                                    <option value="SOC">SOC</option><option value="SOP">SOP</option>
                                    <option value="SKILL">SKILL</option><option value="RULE">RULE</option>
                                    <option value="meta_prompt" style="color:var(--accent-purple); font-weight:bold;">META PROMPT</option>
                                    <option value="core_os" style="color:var(--accent-green); font-weight:bold;">CORE OS</option>
                                </select>
                            </div>
                            <div class="form-group" style="flex:1; margin:0;">
                                <label>Target</label>
                                <input type="text" id="editMemeTarget" class="form-control">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Título del Concepto</label>
                            <input type="text" id="editMemeTitle" class="form-control" style="font-weight:bold; color:var(--accent-blue);">
                        </div>
                        
                        <div class="form-group">
                            <label>Desarrollo / Instrucción (Content)</label>
                            <textarea id="editMemeContent" class="form-control" style="min-height:150px; font-family: monospace;"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label>Keywords W3C (Tags)</label>
                            <input type="text" id="editMemeTags" class="form-control" placeholder="tag1, tag2">
                        </div>

                        <div style="display:flex; gap:15px; margin-top:2rem;">
                            <button id="btnCancelEdit" class="form-control" style="flex:1; background:transparent; cursor:pointer;">Cancelar</button>
                            <button id="btnSaveEdit" class="btn-forge" style="flex:2; margin:0;">💾 Guardar Mutación</button>
                        </div>
                    </div>
                </div>

                ${BottomNav.getHtml('/lms')}
            </div>
        `;
    }

    async executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        this.activeProjectId = localStorage.getItem('tt_active_project') || 'global';
        
        this.dom = {
            inpTopic: document.getElementById('inpTopic'),
            inpCategory: document.getElementById('inpCategory'),
            btnResearch: document.getElementById('btnResearch'),
            loadingResearch: document.getElementById('loadingResearch'),
            inpRawText: document.getElementById('inpRawText'),
            inpTargetRole: document.getElementById('inpTargetRole'),
            btnDistill: document.getElementById('btnDistill'),
            kbGrid: document.getElementById('kbGrid'),
            kbCount: document.getElementById('kbCount'),
            
            // Editor Modal
            modalEdit: document.getElementById('editMemeModal'),
            editTitle: document.getElementById('editMemeTitle'),
            editContent: document.getElementById('editMemeContent'),
            editCat: document.getElementById('editMemeCat'),
            editTarget: document.getElementById('editMemeTarget'),
            editTags: document.getElementById('editMemeTags'),
            btnSaveEdit: document.getElementById('btnSaveEdit'),
            btnCancelEdit: document.getElementById('btnCancelEdit'),
            btnDelete: document.getElementById('btnDeleteMeme'),
            btnEnrichMeme: document.getElementById('btnEnrichMeme') // 🔥 NUEVO
        };

        await KB.init();
        this.renderDocuments();

        // 1. DEEP RESEARCH
        if (this.dom.btnResearch) {
            this.dom.btnResearch.addEventListener('click', async () => {
                const topic = this.dom.inpTopic.value.trim();
                if (!topic) return alert("Escribe un tema para que el Oráculo investigue.");

                const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
                const apiKey = localStorage.getItem(`tt_key_${provider}`);

                this.dom.btnResearch.disabled = true;
                this.dom.loadingResearch.style.display = 'block';

                try {
                    const response = await Orchestrator.deepResearch(topic, this.dom.inpCategory.value, provider, apiKey);
                    let rawOutput = `--- RESULTADO DEL DEEP RESEARCH (${topic}) ---\n\n`;
                    if (response.memes) {
                        response.memes.forEach(m => {
                            rawOutput += `[${m.category || 'MEME'}] ${m.title}\n${m.content}\nKeywords: ${(m.keywords||[]).join(', ')}\n\n`;
                        });
                    } else {
                        rawOutput += JSON.stringify(response, null, 2);
                    }
                    this.dom.inpRawText.value = rawOutput;
                } catch (e) {
                    alert(`Fallo en el Oráculo: ${e.message}`);
                } finally {
                    this.dom.btnResearch.disabled = false;
                    this.dom.loadingResearch.style.display = 'none';
                }
            });
        }

        // 2. DESTILAR A MEMES
        if (this.dom.btnDistill) {
            this.dom.btnDistill.addEventListener('click', async () => {
                const text = this.dom.inpRawText.value.trim();
                const roleTarget = this.dom.inpTargetRole.value;
                if (!text) return alert("Pega o genera texto bruto antes de destilar.");

                this.dom.btnDistill.disabled = true;
                this.dom.btnDistill.innerText = "🔮 Procesando Red Neuronal...";

                try {
                    await this.distillKnowledge(text, roleTarget);
                    this.dom.inpRawText.value = ''; 
                    this.dom.inpTopic.value = '';
                } catch (error) {
                    alert(`Fallo en la destilación: ${error.message}`);
                } finally {
                    this.dom.btnDistill.disabled = false;
                    this.dom.btnDistill.innerText = "🧠 Destilar a Memes W3C";
                    this.renderDocuments();
                }
            });
        }

        // 3. EVENTOS DEL MODAL FRACTAL
        this.dom.btnCancelEdit.addEventListener('click', () => this.dom.modalEdit.style.display = 'none');
        
        this.dom.btnSaveEdit.addEventListener('click', async () => {
            if (!this.currentEditMemeId) return;
            const originalNode = await KB.getNode(this.currentEditMemeId);
            if (!originalNode) return;

            const updatedNode = {
                ...originalNode,
                title: this.dom.editTitle.value,
                content: this.dom.editContent.value,
                category: this.dom.editCat.value,
                roleTarget: this.dom.editTarget.value,
                keywords: this.dom.editTags.value.split(',').map(k=>k.trim())
            };

            await KB.saveNode(updatedNode);
            this.dom.modalEdit.style.display = 'none';
            this.renderDocuments();
        });

        this.dom.btnDelete.addEventListener('click', async () => {
            if (!this.currentEditMemeId) return;
            if (confirm("¿Estás seguro de extirpar este Nodo de la Base de Conocimiento? Los agentes perderán este contexto.")) {
                const db = await KB.init();
                const tx = db.transaction(['nodes'], 'readwrite');
                tx.objectStore('nodes').delete(this.currentEditMemeId);
                tx.oncomplete = () => {
                    this.dom.modalEdit.style.display = 'none';
                    this.renderDocuments();
                };
            }
        });

        // 🔥 LA MAGIA DEL ENRIQUECEDOR
        this.dom.btnEnrichMeme.addEventListener('click', async () => {
            const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
            const apiKey = localStorage.getItem(`tt_key_${provider}`);
            if (!apiKey && provider !== 'custom') return alert("API Key necesaria para enriquecer.");

            const memeData = {
                title: this.dom.editTitle.value,
                category: this.dom.editCat.value,
                content: this.dom.editContent.value
            };

            this.dom.btnEnrichMeme.disabled = true;
            this.dom.btnEnrichMeme.innerText = "⏳ El Oráculo está expandiendo el Meme...";

            try {
                const response = await Orchestrator.enrichMeme(memeData, provider, apiKey);
                
                // Autocompletar la vista con el conocimiento expandido
                if (response.title) this.dom.editTitle.value = response.title;
                if (response.content) this.dom.editContent.value = response.content;
                if (response.keywords && Array.isArray(response.keywords)) {
                    this.dom.editTags.value = response.keywords.join(', ');
                }
                
                // Efecto visual de éxito
                this.dom.editContent.style.boxShadow = "0 0 20px rgba(0, 230, 118, 0.4)";
                setTimeout(() => this.dom.editContent.style.boxShadow = "inset 0 2px 5px rgba(0,0,0,0.3)", 2000);

            } catch (error) {
                alert(`Error al enriquecer: ${error.message}`);
            } finally {
                this.dom.btnEnrichMeme.disabled = false;
                this.dom.btnEnrichMeme.innerText = "🌟 Enriquecer Meme con @mestre_escola (IA)";
            }
        });

        // DELEGACIÓN DE CLICK EN EL GRID PARA ABRIR EDICIÓN
        this.dom.kbGrid.addEventListener('click', async (e) => {
            const wrapper = e.target.closest('.meme-wrapper');
            if (!wrapper) return;
            
            const memeId = wrapper.getAttribute('data-id');
            const node = await KB.getNode(memeId);
            if (node) {
                this.currentEditMemeId = node.id;
                this.dom.editTitle.value = node.title || node.jsonLd?.name || '';
                this.dom.editContent.value = node.content || node.description || '';
                this.dom.editCat.value = node.category || 'RULE';
                this.dom.editTarget.value = node.roleTarget || 'Global';
                this.dom.editTags.value = (node.keywords || []).join(', ');
                this.dom.modalEdit.style.display = 'flex';
            }
        });
    }

    async distillKnowledge(rawText, roleTarget) {
        const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
        const apiKey = localStorage.getItem(`tt_key_${provider}`);

        const promptNode = await KB.getNode('prompt_mestre_research');
        const systemPrompt = promptNode ? promptNode.content : `
            Actúa como @mestre_escola, destilando el texto en "Memes" W3C.
            Tipos válidos de category: "SOP", "SOC", "SKILL", "RULE".
            DEVUELVE ÚNICAMENTE un JSON con el formato:
            { "memes": [{ "category": "SOC", "title": "...", "content": "...", "keywords": ["t1", "t2"] }] }
        `;

        const response = await Orchestrator.callLLM({
            provider, apiKey, systemPrompt, userPrompt: rawText, responseFormat: "json_object", temperature: 0.1
        });

        const data = response.content;
        if (!data || !data.memes || !Array.isArray(data.memes)) throw new Error("Formato JSON inválido.");

        for (const meme of data.memes) {
            await KB.saveNode({
                id: `meme_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                type: 'meme', category: meme.category || 'RULE',
                projectId: this.activeProjectId, targetId: 'global',
                roleTarget: roleTarget || 'Global',
                title: meme.title || 'Directriz', content: meme.content, keywords: meme.keywords || []
            });
        }
    }

    async renderDocuments() {
        if (!this.dom.kbGrid) return;
        
        const projectDocs = await KB.getAllDocuments(this.activeProjectId);
        const globalDocs = this.activeProjectId !== 'global' ? await KB.getAllDocuments('global') : [];
        const allDocs = [...projectDocs];
        globalDocs.forEach(gd => { if (!allDocs.find(d => d.id === gd.id)) allDocs.push(gd); });

        const memes = allDocs.filter(d => d.type === 'meme' || d.type === 'document');

        this.dom.kbCount.innerText = `${memes.length} Nodos Semánticos`;

        if (memes.length === 0) {
            this.dom.kbGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; border:1px dashed #444; border-radius:16px; color:#888;">El Cerebro Semántico está vacío. Realiza una Ingesta en la Forja.</div>`;
            return;
        }

        this.dom.kbGrid.innerHTML = memes.reverse().map(doc => {
            const jsonldString = JSON.stringify(doc.jsonLd || {}).replace(/"/g, '&quot;');
            
            const isMeta = doc.category === 'meta_prompt';
            const catColor = isMeta ? 'var(--accent-orange)' : 'var(--accent-purple)';
            const categoryBadge = doc.category ? `<span style="background:${catColor}; color:${isMeta ? 'black' : 'white'}; padding:2px 8px; border-radius:12px; font-size:0.7rem; font-family:monospace; font-weight:bold;">${doc.category}</span>` : '';
            const roleBadge = `<span style="color:#aaa; font-size:0.7rem; font-family:monospace; border:1px solid #444; padding:2px 6px; border-radius:8px;">${doc.roleTarget || 'Global'}</span>`;
            
            return `
                <div class="meme-wrapper" data-id="${doc.id}">
                    <tt-knowledge-card 
                        data-title="${doc.title}" 
                        data-role="${doc.roleTarget || 'Global'}" 
                        data-content="${doc.content}"
                        data-jsonld="${jsonldString}">
                    </tt-knowledge-card>
                    <div style="position:absolute; top:-10px; right:10px; z-index:10; display:flex; gap:5px;">
                        ${roleBadge} ${categoryBadge}
                    </div>
                </div>
            `;
        }).join('');
    }
}
