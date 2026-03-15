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
                        </div>
                    </main>
                    ${BottomNav.getHtml('/agents')}
                </div>
            `;
        }

        const isPO = project.ownerId === activeUserId || state.session.role === 'ecosystem-owner';

        const headerConfig = {
            title: "Neuro-Ingeniería",
            subtitle: "Editor A2A",
            tagline: "Arrastra Memes (Unidades de Conocimiento) para calibrar el System Prompt de la Colla y los Nodos.",
            actionHtml: isPO ? `<div class="status-badge" style="background: rgba(0, 230, 118, 0.1); border: 1px solid var(--accent-green); color: var(--accent-green); padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 0.85rem;">🟢 Edición Global Permitida</div>` : `<div class="status-badge" style="background: rgba(255, 82, 82, 0.1); border: 1px solid var(--accent-red); color: var(--accent-red); padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 0.85rem;">🔒 Solo Lectura</div>`
        };

        // 1. Opciones de Nodos Locales del Proyecto
        const projectRoleOptions = project.roles.filter(r => !r.isArchived).map(r => `
            <option value="${r.id}">[Local] ${r.levelId} - ${r.name}</option>
        `).join('');

        // 2. Opciones de la Colla IA Global
        const coreAIs = state.globalUsers.filter(u => u.profile?.isAi);
        const coreAiOptions = coreAIs.map(ai => `
            <option value="${ai.id}">🤖 [Core] ${ai.name}</option>
        `).join('');

        return `
            <style>
                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .editor-workspace { display: flex; flex-direction: column; flex: 1; padding: 1.5rem 2rem; overflow: hidden; height: 100%; box-sizing: border-box; }
                
                .controls-bar { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.5); padding: 15px 25px; border-radius: 16px; border: 1px solid var(--glass-border); margin-bottom: 1.5rem; backdrop-filter: blur(10px);}
                .role-selector { background: rgba(10,10,15,0.9); border: 1px solid var(--accent-blue); color: white; padding: 10px 20px; border-radius: 12px; font-family: var(--font-mono); font-size: 1rem; font-weight:bold; outline: none; cursor: pointer; box-shadow: 0 0 15px rgba(0,176,255,0.2);}
                optgroup { font-family: var(--font-main); font-weight: bold; color: var(--accent-purple); background: #050508; }
                
                .main-layout { display: flex; gap: 1.5rem; flex: 1; overflow: hidden; }
                
                /* ARMERÍA DE MEMES (Sidebar Izquierdo) */
                .meme-armory { width: 340px; background: linear-gradient(180deg, rgba(20,20,25,0.9) 0%, rgba(10,10,15,0.95) 100%); border: 1px solid var(--glass-border); border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5);}
                .armory-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.4); }
                .armory-title { color: white; font-weight: 900; font-size: 1.2rem; margin: 0 0 5px 0; display:flex; align-items:center; gap:8px; }
                .armory-subtitle { color: #888; font-size: 0.8rem; margin: 0; }
                .armory-list { flex: 1; overflow-y: auto; padding: 0 15px 15px 15px; display: flex; flex-direction: column;}
                
                /* TAXONOMÍA W3C */
                .taxonomy-group-title { font-size: 0.75rem; color: var(--accent-blue); text-transform: uppercase; font-weight: 900; margin: 20px 0 10px 0; border-bottom: 1px solid rgba(0,176,255,0.3); padding-bottom: 5px; letter-spacing: 1px; display: flex; align-items: center; gap: 8px;}
                
                .meme-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; cursor: grab; transition: all 0.2s; position: relative; margin-bottom: 10px;}
                .meme-card:hover { background: rgba(255,255,255,0.06); border-color: var(--accent-purple); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(224,64,251,0.2);}
                .meme-card:active { cursor: grabbing; }
                .meme-category { font-size: 0.65rem; color: #888; text-transform: uppercase; font-weight: 900; letter-spacing: 1px; margin-bottom: 5px; display: block;}
                .meme-title { color: white; font-size: 0.95rem; font-weight: bold; margin-bottom: 8px; line-height: 1.2;}
                .meme-keywords { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px;}
                .keyword-tag { background: rgba(0,0,0,0.5); border: 1px solid #444; color: #aaa; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono);}

                /* MIND MAP CANVAS (Lienzo Central) */
                .mindmap-container { flex: 1; position: relative; background: #050508; border: 1px solid var(--glass-border); border-radius: 20px; overflow: hidden; background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0); background-size: 30px 30px; box-shadow: inset 0 0 50px rgba(0,0,0,0.8);}
                #mindmap-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
                #mindmap-nodes { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; pointer-events: none;}
                
                /* NODOS DEL GRAFO */
                .graph-node { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; pointer-events: auto; transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
                
                .node-root .circle { width: 100px; height: 100px; background: rgba(10,10,15,0.9); border: 3px solid var(--accent-blue); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 2.5rem; box-shadow: 0 0 40px rgba(0,176,255,0.3); backdrop-filter: blur(10px);}
                .node-root.global-ai .circle { border-color: var(--accent-purple); box-shadow: 0 0 40px rgba(224,64,251,0.3); }
                .node-root .title { margin-top: 15px; background: rgba(0,0,0,0.8); padding: 8px 15px; border-radius: 12px; color: white; font-weight: 900; font-size: 1rem; border: 1px solid var(--accent-blue); text-transform: uppercase; letter-spacing: 1px; text-align:center;}
                .node-root.global-ai .title { border-color: var(--accent-purple); }

                .node-branch .circle { width: auto; padding: 10px 20px; background: rgba(20,20,25,0.95); border: 2px solid #555; border-radius: 12px; color: white; font-weight: bold; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 20px rgba(0,0,0,0.5); backdrop-filter: blur(5px);}
                
                .node-leaf { width: 220px; align-items: flex-start; }
                .node-leaf .content-box { background: rgba(0,0,0,0.7); border: 1px solid rgba(255,255,255,0.1); border-left: 4px solid var(--accent-purple); padding: 15px; border-radius: 12px; backdrop-filter: blur(5px); box-shadow: 0 5px 15px rgba(0,0,0,0.5); transition: 0.2s; width: 100%; box-sizing: border-box; cursor: pointer;}
                .node-leaf .content-box:hover { border-color: var(--accent-purple); transform: translateX(5px); background: rgba(20,20,25,0.9);}
                .node-leaf .title { color: white; font-weight: 900; font-size: 0.85rem; margin-bottom: 5px; line-height: 1.3;}
                .node-leaf .desc { color: #aaa; font-size: 0.75rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;}
                .node-leaf .btn-remove { position: absolute; top: -10px; right: -10px; background: var(--accent-red); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 12px; font-weight: bold; cursor: pointer; opacity: 0; transition: 0.2s; display: flex; justify-content: center; align-items: center;}
                .node-leaf:hover .btn-remove { opacity: 1; }

                /* DROP ZONE OVERLAY */
                .drop-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,176,255,0.1); border: 4px dashed var(--accent-blue); z-index: 100; display: none; justify-content: center; align-items: center; border-radius: 20px; pointer-events: none;}
                .drop-overlay.active { display: flex; animation: pulseDrop 1.5s infinite;}
                .drop-msg { background: var(--accent-blue); color: black; padding: 15px 30px; border-radius: 30px; font-weight: 900; font-size: 1.2rem; box-shadow: 0 10px 30px rgba(0,176,255,0.5);}

                /* GHOST NODE (Sugerencias W3C SKOS) */
                .node-ghost { opacity: 0.6; filter: grayscale(80%); animation: floatGhost 3s infinite ease-in-out; cursor: pointer;}
                .node-ghost .content-box { border-style: dashed; border-color: var(--accent-green); }
                .node-ghost:hover { opacity: 1; filter: grayscale(0%); }

                .edge-line { fill: none; stroke: #444; stroke-width: 2; transition: stroke 0.3s; }
                .edge-line.highlight { stroke: var(--accent-blue); stroke-width: 3; }

                @keyframes pulseDrop { 0% { background: rgba(0,176,255,0.05); } 50% { background: rgba(0,176,255,0.15); } 100% { background: rgba(0,176,255,0.05); } }
                @keyframes floatGhost { 0% { transform: translate(-50%, -50%) translateY(0px); } 50% { transform: translate(-50%, -50%) translateY(-10px); } 100% { transform: translate(-50%, -50%) translateY(0px); } }

                @media (max-width: 900px) {
                    .main-layout { flex-direction: column; }
                    .meme-armory { width: 100%; height: 250px; }
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
                        <button id="btnCompile" class="btn-primary" style="display:none; padding:10px 20px; font-size:0.9rem;">👁️ Previsualizar Prompt (Flatten)</button>
                    </div>

                    <div class="main-layout">
                        <aside class="meme-armory">
                            <div class="armory-header">
                                <h3 class="armory-title">📚 Catálogo W3C (SKOS)</h3>
                                <p class="armory-subtitle">Arrastra Memes al cerebro de la IA.</p>
                            </div>
                            <div class="armory-list" id="memeCatalogList">
                                <div style="text-align:center; color:#666; font-size:0.8rem; margin-top:2rem;">Cargando taxonomía semántica...</div>
                            </div>
                        </aside>

                        <section class="mindmap-container" id="mindmapCanvas">
                            <svg id="mindmap-svg"><g id="edges-group"></g></svg>
                            <div id="mindmap-nodes"></div>
                            
                            <div class="drop-overlay" id="dropZone">
                                <div class="drop-msg">📥 SOLTAR PARA INYECTAR CONOCIMIENTO</div>
                            </div>
                        </section>
                    </div>
                </main>
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
            dropZone: document.getElementById('dropZone'),
            canvas: document.getElementById('mindmapCanvas'),
            btnCompile: document.getElementById('btnCompile')
        };

        await KB.init();
        
        // 1. Cargar Armería W3C
        await this.loadArmory();

        // 2. Escuchar Selector de Rol/Agente
        this.dom.selRole.addEventListener('change', async (e) => {
            this.selectedRoleId = e.target.value;
            if (this.selectedRoleId) {
                this.dom.btnCompile.style.display = 'block';
                await this.renderBrainGraph();
            } else {
                this.dom.btnCompile.style.display = 'none';
                this.dom.nodesContainer.innerHTML = '';
                this.dom.edgesGroup.innerHTML = '';
            }
        });

        // 3. Lógica de Drag & Drop
        this.initDragAndDrop();

        // 4. Previsualizador
        this.dom.btnCompile.addEventListener('click', async () => {
            const roleObj = this.getCurrentRoleObject();
            if (!roleObj) return;

            // Si es un agente global, leemos de toda su memoria ('global'). Si es local, del proyecto activo.
            const queryProjectId = roleObj.isGlobalAi ? 'global' : project.id;
            
            const prompt = await KB.getAgentContextFlattened(queryProjectId, roleObj, roleObj.vision || project.presentation || project.prompt);
            alert("🧠 SYSTEM PROMPT COMPILADO:\n\n" + prompt);
        });

        // Repintar flechas si cambia tamaño
        window.addEventListener('resize', () => {
            if(this.selectedRoleId) this.drawEdges();
        });
    }

    // Helper para saber si estamos editando un AI global o un nodo local
    getCurrentRoleObject() {
        const state = store.getState();
        const project = state.projects.find(p => p.id === this.activeProjectId);
        
        // Comprobamos si es de la Colla (empieza por @ y existe en globalUsers)
        if (this.selectedRoleId && this.selectedRoleId.startsWith('@')) {
            const globalAi = state.globalUsers.find(u => u.id === this.selectedRoleId);
            if (globalAi && globalAi.profile?.isAi) {
                return {
                    id: globalAi.id,
                    name: globalAi.name,
                    levelId: globalAi.id, 
                    guardian: globalAi.profile.guardian || 'magician',
                    vision: globalAi.profile.vision,
                    isGlobalAi: true
                };
            }
        }
        
        // Si no, es un rol local del proyecto
        const localRole = project.roles.find(r => r.id === this.selectedRoleId);
        if (localRole) {
            return { ...localRole, isGlobalAi: false };
        }
        return null;
    }

    async loadArmory() {
        const allNodes = await KB.getAllNodes();
        this.catalogMemes = allNodes.filter(n => n.targetId === 'global' || !n.targetId);

        if (this.catalogMemes.length === 0) {
            this.dom.catalogList.innerHTML = `<div style="text-align:center; color:#666; font-size:0.8rem; margin-top:2rem;">El catálogo está vacío. Ejecuta los Tests para sembrar la base de datos.</div>`;
            return;
        }

        const taxonomyGroups = {
            'Core OS (Leyes Sistémicas)': this.catalogMemes.filter(m => m.type === 'meme' && m.category === 'core_os'),
            'ADN (Arquetipos Ontológicos)': this.catalogMemes.filter(m => m.type === 'ontology'),
            'Skills (Frameworks & Técnicas)': this.catalogMemes.filter(m => m.type === 'meme' && m.category === 'skill'),
            'Otros (Uncategorized)': this.catalogMemes.filter(m => m.type !== 'ontology' && !(m.type === 'meme' && (m.category === 'core_os' || m.category === 'skill')))
        };

        let html = '';
        
        for (const [groupName, items] of Object.entries(taxonomyGroups)) {
            if (items.length === 0) continue;
            
            const groupIcon = groupName.includes('Core OS') ? '🌐' : (groupName.includes('ADN') ? '🧬' : '🎒');
            html += `<div class="taxonomy-group-title">${groupIcon} ${groupName}</div>`;
            
            html += items.map(meme => {
                const categoryLabel = meme.broader ? meme.broader.replace('root_', '').replace(/_/g, ' ') : (meme.category || meme.type);
                const title = meme.title || meme.jsonLd?.name || 'Meme sin título';
                const keywords = (meme.jsonLd?.keywords || '').split(',').filter(k => k.trim()).slice(0, 3);
                
                return `
                <div class="meme-card" draggable="true" data-id="${meme.id}">
                    <span class="meme-category">${categoryLabel}</span>
                    <div class="meme-title">${title}</div>
                    ${keywords.length > 0 ? `
                    <div class="meme-keywords">
                        ${keywords.map(k => `<span class="keyword-tag">${k.trim()}</span>`).join('')}
                    </div>
                    ` : ''}
                </div>
                `;
            }).join('');
        }

        this.dom.catalogList.innerHTML = html;
    }

    initDragAndDrop() {
        const isPO = store.getState().projects.find(p => p.id === this.activeProjectId)?.ownerId === store.getState().session.activeUserId || store.getState().session.role === 'ecosystem-owner';
        if (!isPO) return; 

        this.dom.catalogList.addEventListener('dragstart', (e) => {
            const card = e.target.closest('.meme-card');
            if (!card) return;
            const memeId = card.getAttribute('data-id');
            const memeData = this.catalogMemes.find(m => m.id === memeId);
            if (memeData) {
                e.dataTransfer.setData('application/json', JSON.stringify(memeData));
                this.dom.dropZone.classList.add('active');
            }
        });

        this.dom.catalogList.addEventListener('dragend', () => {
            this.dom.dropZone.classList.remove('active');
        });

        this.dom.canvas.addEventListener('dragover', (e) => { e.preventDefault(); });

        this.dom.canvas.addEventListener('drop', async (e) => {
            e.preventDefault();
            this.dom.dropZone.classList.remove('active');
            
            const roleObj = this.getCurrentRoleObject();
            if (!roleObj) return alert("Selecciona un Agente primero.");

            try {
                const memeData = JSON.parse(e.dataTransfer.getData('application/json'));
                
                // INYECCIÓN: Si es una IA Global, inyectamos el meme en toda la red (projectId: 'global')
                // Si es un nodo local, solo se inyecta para este proyecto.
                const injectionProjectId = roleObj.isGlobalAi ? 'global' : this.activeProjectId;

                const newNode = {
                    ...memeData,
                    id: 'meme_inst_' + Date.now(),
                    targetId: roleObj.id, 
                    projectId: injectionProjectId 
                };
                
                await KB.saveNode(newNode);
                await this.renderBrainGraph(); 

            } catch(err) {
                console.error("Error en Drop:", err);
            }
        });
    }

    async renderBrainGraph() {
        const state = store.getState();
        const project = state.projects.find(p => p.id === this.activeProjectId);
        const roleObj = this.getCurrentRoleObject();
        const isPO = project.ownerId === state.session.activeUserId || state.session.role === 'ecosystem-owner';

        if (!roleObj) return;

        // Si es global, el contexto viene de toda la matriz.
        const queryProjectId = roleObj.isGlobalAi ? 'global' : project.id;
        this.brainGraph = await KB.getAgentBrainGraph(queryProjectId, roleObj, roleObj.vision || project.presentation || project.prompt);
        
        this.dom.nodesContainer.innerHTML = '';
        this.dom.edgesGroup.innerHTML = '';

        // 1. NODO RAÍZ
        const rootIcon = roleObj.isGlobalAi ? '🤖' : ({ '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[roleObj.levelId] || '💻');
        const rootEl = document.createElement('div');
        rootEl.className = `graph-node node-root ${roleObj.isGlobalAi ? 'global-ai' : ''}`;
        rootEl.id = 'gn_root';
        rootEl.style.left = '15%';
        rootEl.style.top = '50%';
        rootEl.innerHTML = `
            <div class="circle">${rootIcon}</div>
            <div class="title" title="${roleObj.name}">${roleObj.name.substring(0, 18)}</div>
        `;
        this.dom.nodesContainer.appendChild(rootEl);

        // 2. RAMAS Y HOJAS
        const branchX = 45;
        const leafBaseX = 80;
        const startY = 15;
        const yStep = 80 / (this.brainGraph.branches.length - 1 || 1);

        this.brainGraph.branches.forEach((branch, bIdx) => {
            const bY = startY + (bIdx * yStep);
            
            const bEl = document.createElement('div');
            bEl.className = 'graph-node node-branch';
            bEl.id = `gn_branch_${bIdx}`;
            bEl.style.left = `${branchX}%`;
            bEl.style.top = `${bY}%`;
            bEl.innerHTML = `<div class="circle">${branch.name}</div>`;
            this.dom.nodesContainer.appendChild(bEl);

            const leaves = branch.nodes;
            if (leaves.length > 0) {
                const leafSpacing = 16;
                const totalHeight = (leaves.length - 1) * leafSpacing;
                let lY = bY - (totalHeight / 2);

                leaves.forEach((leaf, lIdx) => {
                    const lEl = document.createElement('div');
                    lEl.className = 'graph-node node-leaf';
                    lEl.id = `gn_leaf_${bIdx}_${lIdx}`;
                    lEl.style.left = `${leafBaseX}%`;
                    lEl.style.top = `${lY}%`;
                    
                    const isCustomMeme = bIdx === 1 || bIdx === 2; 
                    const delBtn = isPO && isCustomMeme ? `<button class="btn-remove" data-id="${leaf.id}" title="Eliminar Conexión">&times;</button>` : '';

                    lEl.innerHTML = `
                        <div class="content-box">
                            ${delBtn}
                            <div class="title">${leaf.title || 'Nodo de Conocimiento'}</div>
                            <div class="desc">${leaf.content}</div>
                        </div>
                    `;
                    this.dom.nodesContainer.appendChild(lEl);
                    lY += leafSpacing;

                    if (isPO && isCustomMeme) {
                        lEl.querySelector('.btn-remove').addEventListener('click', async () => {
                            if(confirm("¿Desconectar este nodo de la red neuronal del agente?")) {
                                const db = await KB.init();
                                const tx = db.transaction(['nodes'], 'readwrite');
                                tx.objectStore('nodes').delete(leaf.id);
                                tx.oncomplete = () => this.renderBrainGraph();
                            }
                        });
                    }

                    // -- SUGERENCIAS W3C (SKOS) --
                    const originalMeme = this.catalogMemes.find(m => m.title === leaf.title || m.jsonLd?.name === leaf.title);
                    if (originalMeme && originalMeme.jsonLd?.relatedLink && originalMeme.jsonLd.relatedLink.length > 0 && isPO) {
                        const relatedId = originalMeme.jsonLd.relatedLink[0];
                        const relatedMeme = this.catalogMemes.find(m => m.id === relatedId);
                        
                        const alreadyHasIt = this.brainGraph.branches.some(b => b.nodes.find(n => n.title === relatedMeme?.title || n.title === relatedMeme?.jsonLd?.name));
                        
                        if (relatedMeme && !alreadyHasIt) {
                            const gEl = document.createElement('div');
                            gEl.className = 'graph-node node-leaf node-ghost';
                            gEl.id = `gn_ghost_${bIdx}_${lIdx}`;
                            gEl.style.left = `${leafBaseX}%`;
                            gEl.style.top = `${lY}%`;
                            gEl.innerHTML = `
                                <div class="content-box" title="Sugerencia SKOS: Concepto Relacionado">
                                    <div class="title">✨ Sugerencia W3C: ${relatedMeme.title || relatedMeme.jsonLd?.name}</div>
                                    <div class="desc" style="color:var(--accent-green);">Clic para Inyectar conexión neuronal.</div>
                                </div>
                            `;
                            this.dom.nodesContainer.appendChild(gEl);
                            
                            gEl.addEventListener('click', async () => {
                                const targetProjectId = roleObj.isGlobalAi ? 'global' : this.activeProjectId;
                                await KB.saveNode({ ...relatedMeme, id: 'meme_inst_' + Date.now(), targetId: this.selectedRoleId, projectId: targetProjectId });
                                await this.renderBrainGraph();
                            });
                            
                            lY += leafSpacing;
                        }
                    }
                });
            } else {
                const lEl = document.createElement('div');
                lEl.className = 'graph-node node-leaf';
                lEl.id = `gn_leaf_${bIdx}_empty`;
                lEl.style.left = `${leafBaseX}%`;
                lEl.style.top = `${bY}%`;
                lEl.innerHTML = `<div class="content-box" style="border-color:#333; opacity:0.5;"><div class="desc">Rama neuronal vacía.</div></div>`;
                this.dom.nodesContainer.appendChild(lEl);
            }
        });

        setTimeout(() => this.drawEdges(), 50);
    }

    drawEdges() {
        if (!this.brainGraph || !this.dom.edgesGroup) return;
        this.dom.edgesGroup.innerHTML = '';
        
        const containerRect = this.dom.canvas.getBoundingClientRect();
        const rootEl = document.getElementById('gn_root');
        if (!rootEl) return;

        const getCenter = (el) => {
            const rect = el.getBoundingClientRect();
            return { x: rect.left + rect.width/2 - containerRect.left, y: rect.top + rect.height/2 - containerRect.top };
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

            const leavesCount = branch.nodes.length;
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

                    const ghostNode = document.getElementById(`gn_ghost_${bIdx}_${lIdx}`);
                    if (ghostNode) {
                        const gPos = getCenter(ghostNode);
                        const gTargetX = gPos.x - (ghostNode.offsetWidth / 2);
                        const p3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        p3.setAttribute('d', `M ${bPos.x} ${bPos.y} C ${(bPos.x + gTargetX)/2} ${bPos.y}, ${(bPos.x + gTargetX)/2} ${gPos.y}, ${gTargetX} ${gPos.y}`);
                        p3.setAttribute('class', 'edge-line');
                        p3.style.stroke = 'var(--accent-green)';
                        p3.style.strokeDasharray = '4,4';
                        this.dom.edgesGroup.appendChild(p3);
                    }
                });
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
