// v8/js/views/AgentEditorView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js'; 
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class AgentEditorView {
    constructor() {
        document.title = "Editor de Agentes | TeamTowers V9";
        this.activeProjectId = null;
        this.selectedRoleId = null;
        this.brainGraph = null;
        this.catalogMemes = [];
        
        // Variables para el Zoom & Pan
        this.scale = 1;
        this.pointX = 0;
        this.pointY = 0;
        this.panning = false;
        this.startX = 0;
        this.startY = 0;
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        if (!project && state.projects.length > 0) project = state.projects[state.projects.length - 1];

        if (!project) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/agents')}
                    <main class="workspace" style="justify-content:center; align-items:center;">
                        <div class="glass-panel" style="text-align:center; max-width: 500px; margin: 0 auto;">
                             <div style="font-size: 5rem; margin-bottom: 1.5rem; line-height:1;">🧠</div>
                             <h2 style="color:white; margin-top:0;">Ecosistema Vacío</h2>
                             <p style="color:var(--text-muted); margin-bottom: 2.5rem;">Instancia una red para empezar a editar el cerebro de sus agentes.</p>
                             <a href="/v8/create" data-link class="btn-primary" style="text-decoration:none;">➕ Crear Proyecto</a>
                        </div>
                    </main>
                    ${BottomNav.getHtml('/agents')}
                </div>
            `;
        }

        const isPO = project.ownerId === activeUserId || state.session.role === 'ecosystem-owner';

        const headerConfig = {
            title: "Neuro-Ingeniería",
            subtitle: "Editor A2A Infinito",
            tagline: "Navega por el mapa mental (Zoom/Pan), inyecta y extirpa nodos del cerebro de la Colla.",
            actionHtml: isPO ? `<div class="status-badge" style="background: rgba(0, 230, 118, 0.1); border: 1px solid var(--accent-green); color: var(--accent-green); padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 0.85rem;">🟢 Edición Global Permitida</div>` : `<div class="status-badge" style="background: rgba(255, 82, 82, 0.1); border: 1px solid var(--accent-red); color: var(--accent-red); padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 0.85rem;">🔒 Solo Lectura</div>`
        };

        const projectRoleOptions = project.roles.filter(r => !r.isArchived).map(r => `
            <option value="${r.id}">[Local: ${project.nombre.substring(0,10)}] ${r.levelId} - ${r.name}</option>
        `).join('');

        const coreAIs = state.globalUsers.filter(u => u.profile?.isAi);
        const coreAiOptions = coreAIs.map(ai => `
            <option value="${ai.id}">🤖 [Core Global] ${ai.name}</option>
        `).join('');

        return `
            <style>
                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .editor-workspace { display: flex; flex-direction: column; flex: 1; padding: 1.5rem 2rem; overflow: hidden; height: 100%; box-sizing: border-box; }
                
                .controls-bar { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.5); padding: 15px 25px; border-radius: 16px; border: 1px solid var(--glass-border); margin-bottom: 1.5rem; backdrop-filter: blur(10px); z-index: 10;}
                .role-selector { background: rgba(10,10,15,0.9); border: 1px solid var(--accent-blue); color: white; padding: 10px 20px; border-radius: 12px; font-family: var(--font-mono); font-size: 1rem; font-weight:bold; outline: none; cursor: pointer; box-shadow: 0 0 15px rgba(0,176,255,0.2);}
                optgroup { font-family: var(--font-main); font-weight: bold; color: var(--accent-purple); background: #050508; }
                
                .main-layout { display: flex; gap: 1.5rem; flex: 1; overflow: hidden; }
                
                /* ARMERÍA DE MEMES */
                .meme-armory { width: 360px; min-width: 360px; background: linear-gradient(180deg, rgba(20,20,25,0.9) 0%, rgba(10,10,15,0.95) 100%); border: 1px solid var(--glass-border); border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5); z-index: 10;}
                .armory-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.4); }
                .armory-title { color: white; font-weight: 900; font-size: 1.2rem; margin: 0 0 5px 0; display:flex; align-items:center; justify-content: space-between; gap:8px; }
                
                .armory-filter-input { background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; padding: 8px 12px; border-radius: 8px; font-family: inherit; font-size: 0.8rem; outline: none; transition: 0.2s; width: 100%; box-sizing: border-box; }
                .armory-filter-input:focus { border-color: var(--accent-blue); }
                
                .armory-list { flex: 1; overflow-y: auto; padding: 0 15px 15px 15px; display: flex; flex-direction: column;}
                .taxonomy-group-title { font-size: 0.75rem; color: var(--accent-blue); text-transform: uppercase; font-weight: 900; margin: 20px 0 10px 0; border-bottom: 1px solid rgba(0,176,255,0.3); padding-bottom: 5px; letter-spacing: 1px; display: flex; align-items: center; gap: 8px;}
                
                .meme-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; transition: all 0.2s; position: relative; margin-bottom: 10px; display: flex; flex-direction: column;}
                .meme-card:hover { background: rgba(255,255,255,0.06); border-color: var(--accent-purple); box-shadow: 0 5px 15px rgba(224,64,251,0.2);}
                
                .meme-category { font-size: 0.65rem; color: #888; text-transform: uppercase; font-weight: 900; letter-spacing: 1px; margin-bottom: 5px; display: block;}
                .meme-title { color: white; font-size: 0.95rem; font-weight: bold; margin-bottom: 8px; line-height: 1.2;}
                .meme-keywords { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; margin-bottom: 15px;}
                .keyword-tag { background: rgba(0,0,0,0.5); border: 1px solid #444; color: #aaa; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono);}
                
                .btn-inject { background: linear-gradient(135deg, rgba(0,176,255,0.1), rgba(0,176,255,0.2)); border: 1px solid var(--accent-blue); color: var(--accent-blue); border-radius: 8px; padding: 8px; font-weight: bold; font-size: 0.8rem; cursor: pointer; transition: 0.2s; width: 100%; margin-top: auto;}
                .btn-inject:hover { background: var(--accent-blue); color: black; box-shadow: 0 0 15px rgba(0,176,255,0.4); }

                .btn-create-knowledge { background: transparent; border: 1px dashed var(--accent-purple); color: var(--accent-purple); padding: 5px 10px; border-radius: 8px; font-size: 0.75rem; cursor: pointer; transition: 0.2s;}
                .btn-create-knowledge:hover { background: rgba(224,64,251,0.1); border-style: solid;}

                /* MIND MAP CANVAS (INFINITO) */
                .mindmap-viewport { flex: 1; position: relative; background: #050508; border: 1px solid var(--glass-border); border-radius: 20px; overflow: hidden; cursor: grab; box-shadow: inset 0 0 50px rgba(0,0,0,0.8); background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0); background-size: 40px 40px;}
                .mindmap-viewport:active { cursor: grabbing; }
                
                /* El lienzo virtual de 4000x4000 donde viven los nodos */
                .mindmap-layer { position: absolute; top: 0; left: 0; width: 4000px; height: 4000px; transform-origin: 0 0; }
                
                #mindmap-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; overflow: visible;}
                #mindmap-nodes { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; pointer-events: none;}
                
                /* CONTROLES DE ZOOM FLOTANTES */
                .zoom-controls { position: absolute; bottom: 20px; right: 20px; display: flex; gap: 5px; background: rgba(0,0,0,0.7); padding: 8px; border-radius: 12px; border: 1px solid var(--glass-border); z-index: 100; backdrop-filter: blur(10px);}
                .btn-zoom { background: rgba(255,255,255,0.1); color: white; border: none; border-radius: 6px; width: 36px; height: 36px; font-size: 1.2rem; font-weight: bold; cursor: pointer; transition: 0.2s;}
                .btn-zoom:hover { background: var(--accent-blue); color: black; }
                .btn-zoom-reset { font-size: 0.8rem; width: auto; padding: 0 10px; font-family: var(--font-mono); }

                /* NODOS DEL GRAFO (POSICIONADOS CON PX, NO %) */
                .graph-node { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; pointer-events: auto; }
                
                .node-root .circle { width: 120px; height: 120px; background: rgba(10,10,15,0.9); border: 4px solid var(--accent-blue); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 3rem; box-shadow: 0 0 50px rgba(0,176,255,0.4); backdrop-filter: blur(10px);}
                .node-root.global-ai .circle { border-color: var(--accent-purple); box-shadow: 0 0 50px rgba(224,64,251,0.4); }
                .node-root .title { margin-top: 20px; background: rgba(0,0,0,0.8); padding: 10px 20px; border-radius: 12px; color: white; font-weight: 900; font-size: 1.1rem; border: 1px solid var(--accent-blue); text-transform: uppercase; letter-spacing: 1px; text-align:center;}
                .node-root.global-ai .title { border-color: var(--accent-purple); }

                .node-branch .circle { width: auto; padding: 12px 25px; background: rgba(20,20,25,0.95); border: 2px solid #555; border-radius: 16px; color: white; font-weight: bold; font-size: 1rem; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 20px rgba(0,0,0,0.5); backdrop-filter: blur(5px);}
                
                .node-leaf { width: 280px; align-items: flex-start; }
                .node-leaf .content-box { background: rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.15); border-left: 5px solid var(--accent-purple); padding: 20px; border-radius: 16px; backdrop-filter: blur(8px); box-shadow: 0 8px 25px rgba(0,0,0,0.6); transition: 0.2s; width: 100%; box-sizing: border-box;}
                .node-leaf .content-box:hover { border-color: var(--accent-purple); transform: translateX(8px); background: rgba(20,20,25,0.95);}
                .node-leaf .title { color: white; font-weight: 900; font-size: 1rem; margin-bottom: 8px; line-height: 1.3;}
                .node-leaf .desc { color: #bbb; font-size: 0.85rem; line-height: 1.5; }
                
                /* BOTÓN ELIMINAR GIGANTE Y VISIBLE */
                .node-leaf .btn-remove { position: absolute; top: -12px; right: -12px; background: var(--accent-red); color: white; border: 2px solid #111; border-radius: 50%; width: 32px; height: 32px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center; box-shadow: 0 5px 10px rgba(0,0,0,0.5); z-index: 10;}
                .node-leaf .btn-remove:hover { transform: scale(1.2); box-shadow: 0 0 20px rgba(255,82,82,0.8); }

                .node-ghost { opacity: 0.6; filter: grayscale(50%); cursor: pointer; transition: 0.3s;}
                .node-ghost .content-box { border-style: dashed; border-color: var(--accent-green); border-left-width: 3px;}
                .node-ghost:hover { opacity: 1; filter: grayscale(0%); transform: scale(1.05); }

                .edge-line { fill: none; stroke: #444; stroke-width: 3; transition: stroke 0.3s; }
                .error-box { background: rgba(255,82,82,0.1); border: 1px solid var(--accent-red); padding: 20px; border-radius: 12px; color: white; margin: auto; text-align: center; max-width: 80%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10;}

                /* MODAL NUEVO CONOCIMIENTO */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 4000; }
                .modal-content { background: var(--bg-panel); border: 1px solid var(--glass-border); padding: 2.5rem; border-radius: 16px; width: 500px; max-width: 95%; box-shadow: 0 20px 50px rgba(0,0,0,0.8); animation: slideUp 0.3s ease-out; box-sizing: border-box;}
                .form-control { background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 12px; border-radius: 8px; font-family: inherit; font-size: 0.95rem; outline: none; width: 100%; transition: 0.2s; box-sizing: border-box; margin-bottom: 15px;}
                .form-control:focus { border-color: var(--accent-blue); }
                
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 900px) {
                    .main-layout { flex-direction: column; }
                    .meme-armory { width: 100%; height: 350px; min-width: auto; }
                    .zoom-controls { bottom: 100px; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/agents')}
                <main class="editor-workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="controls-bar">
                        <select id="selRole" class="role-selector">
                            <option value="">-- Selecciona una Inteligencia --</option>
                            <optgroup label="La Colla (IAs Globales)">
                                ${coreAiOptions}
                            </optgroup>
                            <optgroup label="Nodos del Proyecto">
                                ${projectRoleOptions}
                            </optgroup>
                        </select>
                        <button id="btnCompile" class="btn-primary" style="display:none; padding:10px 20px; font-size:0.9rem;">👁️ Previsualizar Prompt</button>
                    </div>

                    <div class="main-layout">
                        <aside class="meme-armory">
                            <div class="armory-header">
                                <div class="armory-title">
                                    <span>📚 Catálogo W3C</span>
                                    ${isPO ? `<button class="btn-create-knowledge" id="btnOpenCreateNode">➕ Crear</button>` : ''}
                                </div>
                                <div style="display:flex; flex-direction:column; gap:8px; margin-top:15px;">
                                    <input type="text" id="armorySearch" class="armory-filter-input" placeholder="🔍 Buscar SOC, Skill, Ontología...">
                                    <div style="display:flex; gap:8px;">
                                        <select id="armoryLevelFilter" class="armory-filter-input" style="flex:1;">
                                            <option value="">Nivel (Todos)</option>
                                            <option value="@anxaneta">👑 @anxaneta</option>
                                            <option value="@aixecador">🧭 @aixecador</option>
                                            <option value="@dosos">👁️ @dosos</option>
                                            <option value="@baixos">⚙️ @baixos</option>
                                            <option value="@pinya">🤝 @pinya</option>
                                        </select>
                                        <select id="armoryGuardianFilter" class="armory-filter-input" style="flex:1;">
                                            <option value="">Guardián (Todos)</option>
                                            <option value="ruler">👑 Ruler</option>
                                            <option value="creator">🎨 Creator</option>
                                            <option value="sage">🦉 Sage</option>
                                            <option value="hero">⚔️ Hero</option>
                                            <option value="magician">✨ Magician</option>
                                            <option value="caregiver">❤️ Caregiver</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="armory-list" id="memeCatalogList">
                                <div style="text-align:center; color:#666; font-size:0.8rem; margin-top:2rem;">Cargando taxonomía...</div>
                            </div>
                        </aside>

                        <section class="mindmap-viewport" id="mindmapViewport">
                            <div class="zoom-controls">
                                <button id="btnZoomOut" class="btn-zoom" title="Alejar">-</button>
                                <button id="btnZoomReset" class="btn-zoom btn-zoom-reset" title="Centrar">100%</button>
                                <button id="btnZoomIn" class="btn-zoom" title="Acercar">+</button>
                            </div>
                            <div class="mindmap-layer" id="mindmapLayer">
                                <svg id="mindmap-svg"><g id="edges-group"></g></svg>
                                <div id="mindmap-nodes"></div>
                            </div>
                        </section>
                    </div>
                </main>
                
                <div class="modal-overlay" id="createNodeModal">
                    <div class="modal-content">
                        <h2 style="color:white; margin-top:0; font-weight:900; letter-spacing:-1px;">Crear Nuevo Conocimiento</h2>
                        <select id="newNodeType" class="form-control">
                            <option value="skill">🎒 Skill (Habilidad Transversal)</option>
                            <option value="soc">✅ SOC (Regla de Auditoría)</option>
                            <option value="ontology">🧬 ADN (Variante de Rol/Sector)</option>
                        </select>
                        <input type="text" id="newNodeTitle" class="form-control" placeholder="Título (Ej: Auditoría ReactJS)">
                        <textarea id="newNodeContent" class="form-control" rows="4" placeholder="Define las instrucciones o reglas claras..."></textarea>
                        <input type="text" id="newNodeKeywords" class="form-control" placeholder="Keywords W3C (separadas por comas)">
                        <div style="display:flex; gap:15px; margin-top:20px;">
                            <button id="btnCancelNode" class="btn-lux btn-lux-outline" style="flex:1;">Cancelar</button>
                            <button id="btnSaveNode" class="btn-lux btn-lux-primary" style="flex:2;">Inyectar al Agente</button>
                        </div>
                    </div>
                </div>

                ${BottomNav.getHtml('/agents')}
            </div>
        `;
    }

    async executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        const state = store.getState();
        let project = state.projects.find(p => p.id === localStorage.getItem('tt_active_project'));
        if (!project && state.projects.length > 0) project = state.projects[state.projects.length - 1];
        if (!project) return;
        this.activeProjectId = project.id;

        this.dom = {
            selRole: document.getElementById('selRole'),
            catalogList: document.getElementById('memeCatalogList'),
            nodesContainer: document.getElementById('mindmap-nodes'),
            edgesGroup: document.getElementById('edges-group'),
            viewport: document.getElementById('mindmapViewport'),
            layer: document.getElementById('mindmapLayer'),
            btnCompile: document.getElementById('btnCompile'),
            searchInput: document.getElementById('armorySearch'),
            levelFilter: document.getElementById('armoryLevelFilter'),
            guardianFilter: document.getElementById('armoryGuardianFilter'),
            modalNode: document.getElementById('createNodeModal')
        };

        try {
            await KB.init();
            await this.loadArmory();

            this.dom.searchInput.addEventListener('input', () => this.filterAndRenderArmory());
            this.dom.levelFilter.addEventListener('change', () => this.filterAndRenderArmory());
            this.dom.guardianFilter.addEventListener('change', () => this.filterAndRenderArmory());

            this.dom.selRole.addEventListener('change', async (e) => {
                this.selectedRoleId = e.target.value;
                if (this.selectedRoleId) {
                    this.dom.btnCompile.style.display = 'block';
                    await this.renderBrainGraphSafe();
                } else {
                    this.dom.btnCompile.style.display = 'none';
                    this.dom.nodesContainer.innerHTML = '';
                    this.dom.edgesGroup.innerHTML = '';
                }
            });

            // INYECCIÓN VÍA BOTÓN
            this.dom.catalogList.addEventListener('click', async (e) => {
                const btn = e.target.closest('.btn-inject');
                if (!btn) return;
                
                const memeId = btn.getAttribute('data-id');
                const roleObj = this.getCurrentRoleObject();
                if (!roleObj) return alert("Selecciona una Inteligencia o Rol en el centro primero.");

                const memeData = this.catalogMemes.find(m => m.id === memeId);
                if (memeData) {
                    btn.innerText = "⏳";
                    const targetProjectId = roleObj.isGlobalAi ? 'global' : this.activeProjectId;
                    const newNode = { ...memeData, id: 'meme_inst_' + Date.now(), targetId: this.selectedRoleId, projectId: targetProjectId };
                    
                    await KB.saveNode(newNode);
                    await this.renderBrainGraphSafe();
                    btn.innerText = "➕ Inyectar";
                }
            });

            this.dom.btnCompile.addEventListener('click', async () => {
                const roleObj = this.getCurrentRoleObject();
                if (!roleObj) return;
                const queryProjectId = roleObj.isGlobalAi ? 'global' : project.id;
                const archetype = project ? project.archetype : 'startup';
                const prompt = await KB.getAgentContextFlattened(queryProjectId, roleObj, roleObj.vision || project.presentation || project.prompt, archetype);
                alert("🧠 SYSTEM PROMPT COMPILADO:\n\n" + prompt);
            });

            // MODAL LOGIC
            document.getElementById('btnOpenCreateNode')?.addEventListener('click', () => {
                if (!this.selectedRoleId) return alert("Selecciona un Agente a la derecha antes de crear y asignarle un nuevo conocimiento.");
                this.dom.modalNode.style.display = 'flex';
            });
            document.getElementById('btnCancelNode')?.addEventListener('click', () => this.dom.modalNode.style.display = 'none');
            
            document.getElementById('btnSaveNode')?.addEventListener('click', async () => {
                const typeVal = document.getElementById('newNodeType').value;
                const title = document.getElementById('newNodeTitle').value.trim();
                const content = document.getElementById('newNodeContent').value.trim();
                const keywords = document.getElementById('newNodeKeywords').value.trim().split(',');

                if (!title || !content) return alert("Título y contenido son obligatorios.");

                const roleObj = this.getCurrentRoleObject();
                const targetProjectId = roleObj.isGlobalAi ? 'global' : this.activeProjectId;
                const nodeType = typeVal === 'ontology' ? 'ontology' : 'meme';
                const category = typeVal === 'ontology' ? undefined : typeVal;

                const newNode = {
                    id: 'meme_inst_' + Date.now(), type: nodeType, category: category,
                    title: `Custom: ${title}`, content: content, keywords: keywords,
                    targetId: this.selectedRoleId, projectId: targetProjectId
                };

                await KB.saveNode(newNode);
                this.dom.modalNode.style.display = 'none';
                
                document.getElementById('newNodeTitle').value = '';
                document.getElementById('newNodeContent').value = '';
                document.getElementById('newNodeKeywords').value = '';

                await this.renderBrainGraphSafe();
            });

            if (this.dom.selRole.options.length > 1) {
                this.dom.selRole.selectedIndex = 1;
                this.dom.selRole.dispatchEvent(new Event('change'));
            }

            // INIT PAN & ZOOM
            this.initPanAndZoom();

        } catch(e) {
            console.error("Fallo general en AgentEditorView:", e);
        }
    }

    // ==========================================
    // LÓGICA INFINITE CANVAS (PAN & ZOOM)
    // ==========================================
    initPanAndZoom() {
        const vp = this.dom.viewport;
        const layer = this.dom.layer;
        
        // Centrar Inicialmente (Raíz en el centro)
        // La raíz está en (1000, 2000) en nuestro nuevo cálculo de coordenadas
        setTimeout(() => {
            const vpW = vp.clientWidth;
            const vpH = vp.clientHeight;
            this.pointX = (vpW / 2) - 1000;
            this.pointY = (vpH / 2) - 2000;
            this.updateTransform();
        }, 100);

        vp.addEventListener('mousedown', (e) => {
            if (e.target.closest('.graph-node')) return; // No mover si hacemos clic en un nodo
            e.preventDefault();
            this.startX = e.clientX - this.pointX;
            this.startY = e.clientY - this.pointY;
            this.panning = true;
        });

        vp.addEventListener('mousemove', (e) => {
            if (!this.panning) return;
            e.preventDefault();
            this.pointX = e.clientX - this.startX;
            this.pointY = e.clientY - this.startY;
            this.updateTransform();
        });

        vp.addEventListener('mouseup', () => { this.panning = false; });
        vp.addEventListener('mouseleave', () => { this.panning = false; });

        vp.addEventListener('wheel', (e) => {
            e.preventDefault();
            const xs = (e.clientX - vp.getBoundingClientRect().left - this.pointX) / this.scale;
            const ys = (e.clientY - vp.getBoundingClientRect().top - this.pointY) / this.scale;
            
            const delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
            if (delta > 0) this.scale *= 1.1;
            else this.scale /= 1.1;
            
            this.scale = Math.min(Math.max(0.3, this.scale), 3); // Limitar zoom
            
            this.pointX = (e.clientX - vp.getBoundingClientRect().left) - xs * this.scale;
            this.pointY = (e.clientY - vp.getBoundingClientRect().top) - ys * this.scale;
            this.updateTransform();
        });

        // Botones UI
        document.getElementById('btnZoomIn').addEventListener('click', () => { this.scale *= 1.2; this.updateTransform(); });
        document.getElementById('btnZoomOut').addEventListener('click', () => { this.scale /= 1.2; this.updateTransform(); });
        document.getElementById('btnZoomReset').addEventListener('click', () => { 
            this.scale = 1; 
            const vpW = vp.clientWidth; const vpH = vp.clientHeight;
            this.pointX = (vpW / 2) - 1000; this.pointY = (vpH / 2) - 2000;
            this.updateTransform(); 
        });
    }

    updateTransform() {
        this.dom.layer.style.transform = `translate(${this.pointX}px, ${this.pointY}px) scale(${this.scale})`;
    }

    getCurrentRoleObject() {
        const state = store.getState();
        const project = state.projects.find(p => p.id === this.activeProjectId);
        if (!this.selectedRoleId) return null;

        if (this.selectedRoleId.startsWith('@')) {
            const globalAi = state.globalUsers.find(u => u.id === this.selectedRoleId);
            if (globalAi && globalAi.profile?.isAi) {
                return { id: globalAi.id, name: globalAi.name, levelId: globalAi.id, guardian: globalAi.profile.guardian || 'magician', vision: globalAi.profile.vision, isGlobalAi: true };
            }
        }
        const localRole = project.roles.find(r => r.id === this.selectedRoleId);
        if (localRole) return { ...localRole, isGlobalAi: false };
        return null;
    }

    async loadArmory() {
        const allNodes = await KB.getAllNodes();
        this.catalogMemes = allNodes.filter(n => n.targetId === 'global' || !n.targetId);
        this.filterAndRenderArmory();
    }

    filterAndRenderArmory() {
        if (!this.catalogMemes || this.catalogMemes.length === 0) {
            this.dom.catalogList.innerHTML = `<div style="text-align:center; color:#666; font-size:0.8rem; margin-top:2rem;">El catálogo está vacío.</div>`;
            return;
        }

        const searchTerm = this.dom.searchInput.value.toLowerCase();
        const levelFilter = this.dom.levelFilter.value;
        const guardianFilter = this.dom.guardianFilter.value;

        const filteredMemes = this.catalogMemes.filter(m => {
            const searchStr = `${m.title || m.jsonLd?.name} ${m.content} ${m.jsonLd?.keywords || ''} ${m.category || m.type}`.toLowerCase();
            const matchesText = searchStr.includes(searchTerm);
            const matchesLevel = levelFilter ? searchStr.includes(levelFilter) : true;
            const matchesGuardian = guardianFilter ? searchStr.includes(guardianFilter) : true;
            return matchesText && matchesLevel && matchesGuardian;
        });

        if (filteredMemes.length === 0) {
            this.dom.catalogList.innerHTML = `<div style="text-align:center; color:#888; font-size:0.85rem; margin-top:2rem;">No hay ADNs o Skills que coincidan.</div>`;
            return;
        }

        const taxonomyGroups = {
            'Core OS (Leyes Sistémicas)': filteredMemes.filter(m => m.type === 'meme' && m.category === 'core_os'),
            'ADN (Arquetipos Ontológicos)': filteredMemes.filter(m => m.type === 'ontology'),
            'SOCs (Checklists & Reglas)': filteredMemes.filter(m => m.type === 'meme' && m.category === 'soc'),
            'Skills (Frameworks & Técnicas)': filteredMemes.filter(m => m.type === 'meme' && m.category === 'skill')
        };

        let html = '';
        for (const [groupName, items] of Object.entries(taxonomyGroups)) {
            if (items.length === 0) continue;
            
            const groupIcon = groupName.includes('Core OS') ? '🌐' : (groupName.includes('ADN') ? '🧬' : (groupName.includes('SOCs') ? '✅' : '🎒'));
            html += `<div class="taxonomy-group-title">${groupIcon} ${groupName} <span style="margin-left:auto; background:rgba(0,176,255,0.2); padding:2px 8px; border-radius:10px; color:white;">${items.length}</span></div>`;
            
            html += items.map(meme => {
                const categoryLabel = meme.broader ? meme.broader.replace('root_', '').replace(/_/g, ' ') : (meme.category || meme.type);
                const title = meme.title || meme.jsonLd?.name || 'Meme sin título';
                const keywords = (meme.jsonLd?.keywords || '').split(',').filter(k => k.trim()).slice(0, 3);
                
                return `
                <div class="meme-card" title="${meme.content.replace(/"/g, '&quot;')}">
                    <span class="meme-category">${categoryLabel}</span>
                    <div class="meme-title">${title}</div>
                    <div class="meme-desc" style="font-size:0.75rem; color:#888; margin-bottom:10px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${meme.content}</div>
                    ${keywords.length > 0 ? `<div class="meme-keywords">${keywords.map(k => `<span class="keyword-tag">${k.trim()}</span>`).join('')}</div>` : ''}
                    <button class="btn-inject" data-id="${meme.id}">➕ Inyectar</button>
                </div>
                `;
            }).join('');
        }

        this.dom.catalogList.innerHTML = html;
    }

    async renderBrainGraphSafe() {
        try {
            await this.renderBrainGraph();
        } catch (error) {
            console.error("Error crítico renderizando el mapa neuronal:", error);
            this.dom.nodesContainer.innerHTML = `
                <div class="error-box">
                    <h3 style="margin:0 0 10px 0;">💥 Error de Inyección Fractal</h3>
                    <p style="font-family:monospace; font-size:0.8rem;">${error.message}</p>
                </div>
            `;
        }
    }

    async renderBrainGraph() {
        const state = store.getState();
        const project = state.projects.find(p => p.id === this.activeProjectId);
        const roleObj = this.getCurrentRoleObject();
        const isPO = project.ownerId === state.session.activeUserId || state.session.role === 'ecosystem-owner';

        if (!roleObj) throw new Error("Objeto de Rol/Agente no encontrado en el estado actual.");

        const queryProjectId = roleObj.isGlobalAi ? 'global' : project.id;
        const archetype = project ? project.archetype : 'startup';
        
        this.brainGraph = await KB.getAgentBrainGraph(queryProjectId, roleObj, roleObj.vision || project.presentation || project.prompt || '', archetype);
        if (!this.brainGraph) throw new Error("El compilador KB no pudo construir el árbol neuronal.");

        this.dom.nodesContainer.innerHTML = '';
        this.dom.edgesGroup.innerHTML = '';

        // COORDENADAS BASE EN PIXELES (En un lienzo virtual de 4000x4000)
        const rootX = 1000;
        const rootY = 2000;
        const branchX = 1600;
        const leafBaseX = 2200;

        // 1. NODO RAÍZ
        const rootIcon = roleObj.isGlobalAi ? '🤖' : ({ '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[roleObj.levelId] || '💻');
        const rootEl = document.createElement('div');
        rootEl.className = `graph-node node-root ${roleObj.isGlobalAi ? 'global-ai' : ''}`;
        rootEl.id = 'gn_root';
        rootEl.style.left = `${rootX}px`;
        rootEl.style.top = `${rootY}px`;
        rootEl.innerHTML = `
            <div class="circle">${rootIcon}</div>
            <div class="title" title="${roleObj.name}">${roleObj.name.substring(0, 20)}</div>
        `;
        this.dom.nodesContainer.appendChild(rootEl);

        // 2. RAMAS Y HOJAS
        const numBranches = this.brainGraph.branches.length;
        const branchSpacing = 500;
        const startY = rootY - ((numBranches - 1) * branchSpacing) / 2;

        this.brainGraph.branches.forEach((branch, bIdx) => {
            const bY = startY + (bIdx * branchSpacing);
            
            const bEl = document.createElement('div');
            bEl.className = 'graph-node node-branch';
            bEl.id = `gn_branch_${bIdx}`;
            bEl.style.left = `${branchX}px`;
            bEl.style.top = `${bY}px`;
            bEl.innerHTML = `<div class="circle">${branch.name}</div>`;
            this.dom.nodesContainer.appendChild(bEl);

            const leaves = branch.nodes || [];
            if (leaves.length > 0) {
                const leafSpacing = 160;
                const totalHeight = (leaves.length - 1) * leafSpacing;
                let lY = bY - (totalHeight / 2);

                leaves.forEach((leaf, lIdx) => {
                    const lEl = document.createElement('div');
                    lEl.className = 'graph-node node-leaf';
                    lEl.id = `gn_leaf_${bIdx}_${lIdx}`;
                    lEl.style.left = `${leafBaseX}px`;
                    lEl.style.top = `${lY}px`;
                    
                    const isCustomMeme = bIdx === 1 || bIdx === 2; 
                    const delBtn = isPO && isCustomMeme && leaf.id.startsWith('meme_inst') ? `<button class="btn-remove" data-id="${leaf.id}" title="Eliminar Conocimiento">❌</button>` : '';

                    lEl.innerHTML = `
                        <div class="content-box">
                            ${delBtn}
                            <div class="title">${leaf.title || 'Nodo de Conocimiento'}</div>
                            <div class="desc">${leaf.content || ''}</div>
                        </div>
                    `;
                    this.dom.nodesContainer.appendChild(lEl);
                    lY += leafSpacing;

                    if (isPO && isCustomMeme && leaf.id.startsWith('meme_inst')) {
                        lEl.querySelector('.btn-remove').addEventListener('click', async () => {
                            if(confirm("¿Seguro que quieres extirpar este conocimiento de la IA?")) {
                                const db = await KB.init();
                                const tx = db.transaction(['nodes'], 'readwrite');
                                tx.objectStore('nodes').delete(leaf.id);
                                tx.oncomplete = () => this.renderBrainGraphSafe();
                            }
                        });
                    }
                });
                
                // AUTO-SUGERENCIA FRACTAL (Magia W3C Mejorada)
                if (bIdx === 2 && isPO && this.catalogMemes) {
                    const adnNodes = this.brainGraph.branches[1].nodes || [];
                    const currentSkillTitles = branch.nodes.map(n => n.title);
                    
                    const normalize = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                    
                    let adnContext = adnNodes.map(n => n.title + ' ' + n.content).join(' ');
                    adnContext += ` ${roleObj.name} ${roleObj.guardian} ${roleObj.levelId}`;
                    adnContext = normalize(adnContext);

                    let suggestedMemes = [];
                    
                    this.catalogMemes.forEach(m => {
                        if (m.category === 'skill' || m.category === 'soc') {
                            const mKeywords = (m.jsonLd?.keywords || '').split(',').map(k => normalize(k.trim()));
                            const hasMatch = mKeywords.some(k => k.length > 2 && adnContext.includes(k));
                            
                            if (hasMatch && !currentSkillTitles.includes(m.title) && !suggestedMemes.find(sm => sm.id === m.id)) {
                                suggestedMemes.push(m);
                            }
                        }
                    });

                    suggestedMemes.slice(0, 3).forEach((sugMeme, sIdx) => {
                        const gEl = document.createElement('div');
                        gEl.className = 'graph-node node-leaf node-ghost';
                        gEl.id = `gn_ghost_${bIdx}_${sIdx}`;
                        gEl.style.left = `${leafBaseX}px`;
                        gEl.style.top = `${lY}px`;
                        gEl.innerHTML = `
                            <div class="content-box" title="Recomendado por Resonancia Léxica y W3C">
                                <div class="title">✨ Sugerencia W3C: ${sugMeme.title || sugMeme.jsonLd?.name}</div>
                                <div class="desc" style="color:var(--accent-green);">Clic para auto-inyectar.</div>
                            </div>
                        `;
                        this.dom.nodesContainer.appendChild(gEl);
                        
                        gEl.addEventListener('click', async () => {
                            const targetProjectId = roleObj.isGlobalAi ? 'global' : this.activeProjectId;
                            await KB.saveNode({ ...sugMeme, id: 'meme_inst_' + Date.now(), targetId: this.selectedRoleId, projectId: targetProjectId });
                            await this.renderBrainGraphSafe();
                        });
                        
                        lY += leafSpacing;
                    });
                }

            } else {
                const lEl = document.createElement('div');
                lEl.className = 'graph-node node-leaf';
                lEl.id = `gn_leaf_${bIdx}_empty`;
                lEl.style.left = `${leafBaseX}px`;
                lEl.style.top = `${bY}px`;
                lEl.innerHTML = `<div class="content-box" style="border-color:#333; opacity:0.5;"><div class="desc">Rama vacía. Sinápsis inactiva.</div></div>`;
                this.dom.nodesContainer.appendChild(lEl);
            }
        });

        // Aseguramos dibujado de SVG tras la inyección DOM
        requestAnimationFrame(() => {
            setTimeout(() => this.drawEdgesSafe(), 50);
        });
    }

    drawEdgesSafe() {
        try {
            this.drawEdges();
        } catch(e) {
            console.warn("Fallo leve al repintar enlaces SVG:", e);
        }
    }

    drawEdges() {
        if (!this.brainGraph || !this.dom.edgesGroup) return;
        this.dom.edgesGroup.innerHTML = '';
        
        const rootEl = document.getElementById('gn_root');
        if (!rootEl) return;

        // Como usamos PX absolutos, el centro del nodo es simplemente left/top porque tienen translate(-50%,-50%)
        const getCenter = (el) => {
            return { 
                x: parseFloat(el.style.left), 
                y: parseFloat(el.style.top) 
            };
        };

        const rootPos = getCenter(rootEl);
        const isGlobal = rootEl.classList.contains('global-ai');
        const rootColor = isGlobal ? 'var(--accent-purple)' : 'var(--accent-blue)';

        this.brainGraph.branches.forEach((branch, bIdx) => {
            const bEl = document.getElementById(`gn_branch_${bIdx}`);
            if (!bEl) return;
            const bPos = getCenter(bEl);

            const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            p1.setAttribute('d', `M ${rootPos.x} ${rootPos.y} C ${(rootPos.x + bPos.x)/2} ${rootPos.y}, ${(rootPos.x + bPos.x)/2} ${bPos.y}, ${bPos.x} ${bPos.y}`);
            p1.setAttribute('class', 'edge-line');
            p1.style.stroke = rootColor;
            p1.style.strokeWidth = '4';
            this.dom.edgesGroup.appendChild(p1);

            const leavesCount = branch.nodes ? branch.nodes.length : 0;
            if (leavesCount > 0) {
                branch.nodes.forEach((leaf, lIdx) => {
                    const lEl = document.getElementById(`gn_leaf_${bIdx}_${lIdx}`);
                    if (!lEl) return;
                    const lPos = getCenter(lEl);
                    const targetX = lPos.x - (lEl.offsetWidth / 2); 
                    
                    const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    p2.setAttribute('d', `M ${bPos.x} ${bPos.y} C ${(bPos.x + targetX)/2} ${bPos.y}, ${(bPos.x + targetX)/2} ${lPos.y}, ${targetX} ${lPos.y}`);
                    p2.setAttribute('class', 'edge-line');
                    this.dom.edgesGroup.appendChild(p2);
                });

                let ghostIdx = 0;
                while(true) {
                    const ghostNode = document.getElementById(`gn_ghost_${bIdx}_${ghostIdx}`);
                    if (!ghostNode) break;
                    const gPos = getCenter(ghostNode);
                    const gTargetX = gPos.x - (ghostNode.offsetWidth / 2);
                    
                    const p3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    p3.setAttribute('d', `M ${bPos.x} ${bPos.y} C ${(bPos.x + gTargetX)/2} ${bPos.y}, ${(bPos.x + gTargetX)/2} ${gPos.y}, ${gTargetX} ${gPos.y}`);
                    p3.setAttribute('class', 'edge-line');
                    p3.style.stroke = 'var(--accent-green)';
                    p3.style.strokeDasharray = '4,4';
                    this.dom.edgesGroup.appendChild(p3);
                    ghostIdx++;
                }
            } else {
                const emptyEl = document.getElementById(`gn_leaf_${bIdx}_empty`);
                if(emptyEl) {
                    const lPos = getCenter(emptyEl);
                    const targetX = lPos.x - (emptyEl.offsetWidth / 2);
                    const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    p2.setAttribute('d', `M ${bPos.x} ${bPos.y} C ${(bPos.x + targetX)/2} ${bPos.y}, ${(bPos.x + targetX)/2} ${lPos.y}, ${targetX} ${lPos.y}`);
                    p2.setAttribute('class', 'edge-line');
                    p2.style.strokeDasharray = '4,4';
                    this.dom.edgesGroup.appendChild(p2);
                }
            }
        });
    }
}
