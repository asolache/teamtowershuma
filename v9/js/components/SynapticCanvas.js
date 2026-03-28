// v9/js/components/SynapticCanvas.js
import { KB } from '../core/kb.js';
import { store } from '../core/store.js';

export class SynapticCanvas {
    constructor(containerEl, optionsOrAgentId = {}) {
        this.container = containerEl;
        
        let opts = {};
        if (typeof optionsOrAgentId === 'string') {
            opts = { agentId: optionsOrAgentId }; 
        } else if (optionsOrAgentId !== null && typeof optionsOrAgentId === 'object') {
            opts = optionsOrAgentId; 
        }

        this.agentId = opts.agentId || null; 
        this.projectId = opts.projectId || null;
        this.isVnaMode = opts.isVnaMode || false; 
        
        this.nodes = [];
        this.links = [];
        this.graph3D = null;
        this.resizeObserver = null;
        this.isFullscreen = false;
    }
    
    async render() {
        let panelTitle = '🌌 Meta-Grafo Cuántico (V9)';
        let helperText = 'Haz clic en un nodo o flujo para viajar hacia él y decodificar su estructura.';
        let backBtnHtml = '';
        
        if (this.agentId) {
            panelTitle = `🧠 Córtex 3D de ${this.agentId}`;
            helperText = 'Explora el cerebro del Agente y sus ramificaciones de conocimiento.';
        } else if (this.isVnaMode) {
            panelTitle = `⚙️ Matriz VNA 3D`;
            helperText = 'Visualizando gravedad Casteller y flujos de valor. Clica en una flecha para ver el Entregable.';
            backBtnHtml = `<button id="btnBackToGalaxy" style="background:rgba(255,255,255,0.05); border:1px solid #555; color:#aaa; padding:6px 12px; border-radius:6px; cursor:pointer; font-family:var(--font-mono); font-size:0.75rem; text-transform:uppercase; margin-bottom:10px; transition:0.2s; font-weight:bold; letter-spacing:1px;">&larr; Volver a la Galaxia</button>`;
        }

        this.container.innerHTML = `
            <style>
                .synaptic-layout { display: flex; width: 100%; height: 100%; background: #050508; border-radius: 20px; overflow: hidden; border: 1px solid var(--glass-border); box-shadow: inset 0 0 50px rgba(0,0,0,0.8); position: relative; transition: all 0.4s ease;}
                .synaptic-layout.fullscreen-mode { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999; border-radius: 0; border: none; }
                .btn-fullscreen { position: absolute; top: 20px; right: 20px; z-index: 50; background: rgba(0,0,0,0.5); border: 1px solid #555; color: white; border-radius: 8px; padding: 8px 12px; cursor: pointer; transition: 0.2s; font-size: 1.2rem;}
                .btn-fullscreen:hover { background: rgba(255,255,255,0.1); border-color: white;}
                .synaptic-palette { width: 340px; background: linear-gradient(90deg, rgba(5,5,8,0.95) 0%, rgba(10,10,15,0.8) 100%); border-right: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; z-index: 10; backdrop-filter: blur(15px); box-shadow: 10px 0 30px rgba(0,0,0,0.5);}
                .palette-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display:flex; flex-direction:column; gap:15px;}
                .palette-title { color: white; font-weight: 900; font-size: 1.2rem; margin: 0; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 0 10px rgba(255,255,255,0.2);}
                .palette-search { width: 100%; background: rgba(0,0,0,0.6); border: 1px solid #444; color: var(--accent-green); padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.9rem; outline: none; box-sizing: border-box; transition: 0.3s;}
                .palette-search:focus { border-color: var(--accent-green); box-shadow: inset 0 0 15px rgba(0,230,118,0.2);}
                .meme-results { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px;}
                
                .draggable-meme { background: rgba(255,255,255,0.03); border: 1px solid #444; padding: 15px; border-radius: 12px; cursor: default; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); position: relative; overflow: hidden;}
                .draggable-meme.is-search-result { cursor: pointer; }
                .draggable-meme.is-search-result:hover { background: rgba(255,255,255,0.08); transform: translateX(5px); box-shadow: 0 5px 15px rgba(0,0,0,0.5); border-color: var(--node-color, #888);}
                .draggable-meme::before { content: ''; position: absolute; top:0; left:0; width:4px; height:100%; background: var(--node-color, #444); }
                .dm-cat { font-size: 0.7rem; color: var(--node-color, var(--accent-orange)); font-family: var(--font-mono); font-weight: bold; pointer-events: none; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;}
                .dm-title { font-size: 1.05rem; color: white; margin: 0 0 10px 0; font-weight: 900; pointer-events: none; line-height: 1.3;}
                .dm-content { font-size: 0.9rem; color: #bbb; line-height: 1.6; font-family: 'Georgia', serif; display: block; overflow-y: auto; max-height: 400px; padding-right: 5px;}
                .dm-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 15px; padding-top: 15px; border-top: 1px dashed rgba(255,255,255,0.1);}
                .dm-tag { font-size: 0.7rem; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 3px 8px; color: #aaa; font-family: var(--font-mono);}
                
                .btn-action-panel { width: 100%; padding: 10px; border-radius: 8px; font-weight: 900; cursor: pointer; transition: 0.2s; font-size: 0.85rem; border: none; }
                .btn-action-panel:disabled { opacity: 0.5; cursor: not-allowed; }

                .btn-inject-seeds { background: linear-gradient(135deg, rgba(0,230,118,0.1), rgba(0,176,255,0.1)); border: 1px solid var(--accent-green); color: white; padding: 12px; border-radius: 8px; font-weight: 900; cursor: pointer; font-size: 0.85rem; transition: 0.3s; width: 100%; text-transform: uppercase; letter-spacing: 1px; display: ${(!this.agentId && !this.isVnaMode) ? 'block' : 'none'}; box-shadow: 0 5px 15px rgba(0,230,118,0.1);}
                .btn-inject-seeds:hover { background: var(--accent-green); color: black; }
                
                .synaptic-3d-container { flex: 1; position: relative; overflow: hidden; background: radial-gradient(circle at center, #0a0a10 0%, #000000 100%); }
                .webgl-target { width: 100%; height: 100%; outline: none; cursor: crosshair;}
                
                .graph-tooltip { position: absolute; background: rgba(10, 10, 15, 0.95); border: 1px solid #555; color: white; padding: 10px 15px; border-radius: 8px; font-family: var(--font-main); font-size: 0.85rem; pointer-events: none; z-index: 100; backdrop-filter: blur(10px); box-shadow: 0 10px 25px rgba(0,0,0,0.8); display: none; transform: translate(-50%, -150%); white-space: nowrap;}
                .graph-tooltip .tt-cat { font-size: 0.65rem; color: var(--accent-blue); font-family: var(--font-mono); text-transform: uppercase; font-weight: bold; margin-bottom: 3px;}
                .graph-tooltip .tt-title { font-weight: 900; font-size: 1rem; }
                
                .loader-3d { position: absolute; top:50%; left:50%; transform: translate(-50%, -50%); color: var(--accent-blue); font-family: var(--font-mono); font-weight: bold; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 2px; animation: pulse 1.5s infinite; pointer-events: none; z-index: 20;}
                @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; text-shadow: 0 0 20px var(--accent-blue); } 100% { opacity: 0.5; } }
                @media (max-width: 768px) { .synaptic-layout { flex-direction: column-reverse; } .synaptic-palette { width: 100%; height: 45%; border-right: none; border-top: 1px solid #333; } .synaptic-3d-container { height: 55%; } }
            </style>

            <div class="synaptic-layout" id="synapticMainLayout">
                <button class="btn-fullscreen" id="btnToggleFullscreen" title="Pantalla Completa">⛶</button>
                <div class="synaptic-palette">
                    <div class="palette-header">
                        ${backBtnHtml}
                        <h3 class="palette-title">${panelTitle}</h3>
                        ${!this.isVnaMode ? `<input type="text" id="memeSearchInput" class="palette-search" placeholder="🔍 Buscar nodos...">` : ''}
                        <button class="btn-inject-seeds" id="btnInjectSeeds">✨ Forjar Semillas Antigravity</button>
                    </div>
                    <div class="meme-results" id="memeResultsList">
                        <div style="color:#888; font-size:0.85rem; text-align:center; padding:30px; font-style:italic; line-height: 1.5;">
                            ${helperText}
                        </div>
                    </div>
                </div>
                <div class="synaptic-3d-container" id="d3DropZone">
                    <div class="loader-3d" id="loader3D">Iniciando Motor WebGL...</div>
                    <div class="webgl-target" id="webglCanvasInner"></div>
                    <div class="graph-tooltip" id="graphTooltip"></div>
                </div>
            </div>
        `;

        if (this.isVnaMode && this.projectId) {
            await this.loadVNAData();
        } else {
            await this.loadInitialData();
        }
        
        await this.initWebGLGraph();
        this.setupInteractivity();
    }

    async loadVNAData() {
        const state = store.getState();
        const project = state.projects.find(p => p.id === this.projectId);
        if (!project) return;

        this.nodes = [];
        this.links = [];

        const getVerticalGravity = (levelId) => {
            const l = (levelId || '').toLowerCase();
            if(l.includes('anx')) return 200;
            if(l.includes('aix')) return 100;
            if(l.includes('dos')) return 0;
            if(l.includes('baix')) return -100;
            if(l.includes('pin')) return -200;
            return 0;
        };

        const ARQUETYPES = ['zeus', 'apollo', 'athena', 'hestia', 'hermes', 'aphrodite', 'hephaestus', 'demeter', 'dionysus', 'poseidon', 'hera', 'hebe'];
        const getRadialAngle = (archetype) => {
            const index = ARQUETYPES.indexOf((archetype || '').toLowerCase());
            if (index === -1) return 0;
            return index * ( (2 * Math.PI) / 12 );
        };

        if (project.roles) {
            project.roles.forEach(r => {
                const yTarget = getVerticalGravity(r.levelId);
                const angle = getRadialAngle(r.domain || '');
                const radius = 150; 
                
                this.nodes.push({
                    id: r.id,
                    name: r.name,
                    group: 'role',
                    val: 35,
                    color: '#ff4081',
                    rawNode: { title: r.name, category: 'role', content: `Nivel: ${r.levelId} | FMV: ${r.fmv}` },
                    fy: yTarget, 
                    fx: Math.cos(angle) * radius, 
                    fz: Math.sin(angle) * radius  
                });
            });
        }

        if (project.vna_flows) {
            project.vna_flows.forEach(f => {
                if (f.from && f.to) {
                    this.links.push({
                        source: f.from,
                        target: f.to,
                        isDependencies: false,
                        rawTx: f,
                        tipo: f.tipo || 'tangible'
                    });
                }
            });
        }
    }

    async loadInitialData() {
        await KB.init();
        const allNodes = await KB.getAllNodes();
        const state = store.getState();

        this.nodes = [];
        this.links = [];

        const addNode = (id, name, group, val, color, rawNode) => {
            if (!this.nodes.find(n => n.id === id)) {
                this.nodes.push({ id, name, group, val, color, rawNode });
            }
        };

        const addLink = (source, target, isDependencies = false) => {
            if (!source || !target) return;
            if (this.nodes.some(n => n.id === source) && this.nodes.some(n => n.id === target)) {
                this.links.push({ source, target, isDependencies });
            }
        };

        const getColorAndMass = (category) => {
            if (!category) return { c: '#888888', m: 12 };
            if (category.startsWith('core.architecture')) return { c: '#00b0ff', m: 30 };
            if (category.startsWith('core.economy')) return { c: '#00e676', m: 30 };
            if (category.startsWith('core.cognition')) return { c: '#e040fb', m: 30 };
            if (category.startsWith('core.execution')) return { c: '#ff9100', m: 30 };
            if (category.startsWith('core.culture')) return { c: '#ff5252', m: 30 };
            
            switch(category) {
                case 'core_os': return { c: '#ffffff', m: 50 };
                case 'project_core': return { c: '#7c4dff', m: 45 }; 
                case 'role': return { c: '#ff4081', m: 35 }; 
                case 'agent': return { c: '#e040fb', m: 45 }; 
                case 'skill': return { c: '#00e676', m: 25 }; 
                case 'reference': return { c: '#00b0ff', m: 15 }; 
                case 'eval': return { c: '#ff9100', m: 18 }; 
                case 'script': return { c: '#ff5252', m: 18 }; 
                case 'evergreen': return { c: '#ffd700', m: 25 };
                case 'meta_prompt': return { c: '#ffffff', m: 35 };
                default: return { c: '#888888', m: 12 };
            }
        };

        if (this.agentId) {
            addNode(this.agentId, this.agentId, 'agent', 60, '#e040fb', { title: this.agentId, content: "Núcleo Biológico / Sintético" });

            const safeAgentId = this.agentId.replace('@','');
            const promptNode = allNodes.find(n => n.id === `prompt_global_${safeAgentId}`);
            
            if (promptNode) {
                addNode(promptNode.id, 'Cerebro (AGENT.md)', 'meta_prompt', 40, '#ffffff', promptNode);
                addLink(this.agentId, promptNode.id);
                
                if (promptNode.dependencies && Array.isArray(promptNode.dependencies)) {
                    promptNode.dependencies.forEach(skillId => {
                        const sNode = allNodes.find(n => n.id === skillId);
                        if (sNode) {
                            const { c, m: mass } = getColorAndMass(sNode.category);
                            addNode(sNode.id, sNode.title, sNode.category, mass, c, sNode);
                            addLink(promptNode.id, sNode.id, true);

                            ['references', 'evals', 'scripts'].forEach(depType => {
                                if (sNode[depType] && Array.isArray(sNode[depType])) {
                                    sNode[depType].forEach(childId => {
                                        const childNode = allNodes.find(n => n.id === childId);
                                        if (childNode) {
                                            const childData = getColorAndMass(childNode.type || childNode.category);
                                            addNode(childNode.id, childNode.title, childNode.type, childData.m, childData.c, childNode);
                                            addLink(sNode.id, childNode.id, true);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        } 
        else {
            addNode('core_kernel', 'V9 KERNEL', 'core_os', 80, '#ffffff', { title: 'TeamTowers V9', category: 'core_os', content: 'Singularidad Antigravity.' });

            state.projects.forEach(p => {
                addNode(p.id, p.nombre, 'project_core', 45, '#7c4dff', { title: p.nombre, category: 'project_core', content: p.presentation || 'Ecosistema' });
                addLink('core_kernel', p.id);

                if(p.roles) {
                    p.roles.forEach(r => {
                        const rId = `role_${p.id}_${r.id}`;
                        addNode(rId, r.name, 'role', 30, '#ff4081', { title: r.name, category: 'role', content: `Nivel: ${r.levelId}` });
                        addLink(p.id, rId);
                    });
                }
            });

            state.globalUsers.forEach(u => {
                if (u.profile?.isAi) {
                    addNode(u.id, u.name, 'agent', 45, '#e040fb', { title: u.name, category: 'agent', content: 'Agente Core Autonómo' });
                    addLink('core_kernel', u.id);

                    const promptNode = allNodes.find(n => n.id === `prompt_global_${u.id.replace('@','')}`);
                    if (promptNode) {
                        addNode(promptNode.id, 'AGENT.md', 'meta_prompt', 25, '#ffffff', promptNode);
                        addLink(u.id, promptNode.id);
                    }
                }
            });

            allNodes.forEach(m => {
                if (m.type === 'system_state' || m.id === 'global_kernel_state') return;
                if (m.id.startsWith('prompt_global')) return; 
                
                const { c, m: mass } = getColorAndMass(m.category || m.type);
                addNode(m.id, m.title, m.category, mass, c, m);

                let linked = false;

                state.globalUsers.forEach(u => {
                    const pNode = allNodes.find(n => n.id === `prompt_global_${u.id.replace('@','')}`);
                    if (pNode && pNode.dependencies && pNode.dependencies.includes(m.id)) {
                        addLink(pNode.id, m.id, true);
                        linked = true;
                    }
                });

                ['references', 'evals', 'scripts'].forEach(depType => {
                    if (m[depType] && Array.isArray(m[depType])) {
                        m[depType].forEach(childId => {
                            if (allNodes.find(n => n.id === childId)) {
                                addLink(m.id, childId, true);
                            }
                        });
                    }
                });

                if (m.projectId && m.projectId !== 'global' && this.nodes.find(n => n.id === m.projectId)) {
                    addLink(m.projectId, m.id);
                    linked = true;
                }

                if (!linked && m.projectId === 'global' && m.type === 'skill') {
                    addLink('core_kernel', m.id, true);
                }
            });
        }
    }

    async initWebGLGraph() {
        const canvasInner = this.container.querySelector('#webglCanvasInner');
        const loader = this.container.querySelector('#loader3D');
        const tooltip = this.container.querySelector('#graphTooltip');

        const loadScriptWithFallback = async (urls, globalVar) => {
            if (window[globalVar]) return; 
            for (const url of urls) {
                try {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = url;
                        script.crossOrigin = "anonymous"; 
                        script.onload = () => resolve();
                        script.onerror = () => reject(new Error(`Fallo en ${url}`));
                        document.head.appendChild(script);
                    });
                    return; 
                } catch (e) {
                    console.warn(`[Antigravity] CDN saltada: ${url}`);
                }
            }
            throw new Error(`Colapso CDN para ${globalVar}.`);
        };

        try {
            await loadScriptWithFallback(['https://unpkg.com/three@0.147.0/build/three.min.js', 'https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js'], 'THREE');
            await loadScriptWithFallback(['https://unpkg.com/three-spritetext', 'https://cdn.jsdelivr.net/npm/three-spritetext'], 'SpriteText');
            await loadScriptWithFallback(['https://unpkg.com/3d-force-graph', 'https://cdn.jsdelivr.net/npm/3d-force-graph'], 'ForceGraph3D');
        } catch (e) {
            console.error("Error definitivo al cargar WebGL:", e);
            if (loader) loader.innerText = "Error cargando Córtex 3D. Tu red bloquea las librerías.";
            return;
        }

        if (loader) loader.style.display = 'none';

        const gData = { nodes: this.nodes, links: this.links };

        this.graph3D = window.ForceGraph3D()(canvasInner)
            .graphData(gData)
            .nodeLabel('') 
            .linkColor(link => {
                if (this.isVnaMode && link.tipo) {
                    return link.tipo === 'tangible' ? 'rgba(0,230,118,0.6)' : 'rgba(224,64,251,0.6)';
                }
                const sourceNode = typeof link.source === 'object' ? link.source : this.nodes.find(n => n.id === link.source);
                const color = sourceNode ? sourceNode.color : 'rgba(0,176,255,1)';
                return link.isDependencies ? color.replace(')', ', 0.2)').replace('rgb', 'rgba') : color.replace(')', ', 0.5)').replace('rgb', 'rgba'); 
            })
            .linkWidth(link => link.isDependencies ? 0.8 : 2)
            .linkDirectionalParticles(link => this.isVnaMode ? 4 : (link.isDependencies ? 1 : 3)) 
            .linkDirectionalParticleSpeed(this.isVnaMode ? 0.005 : 0.01)
            .linkDirectionalParticleWidth(this.isVnaMode ? 3 : 2.5) 
            .linkDirectionalParticleColor(link => {
                if (this.isVnaMode && link.tipo) return link.tipo === 'tangible' ? '#00e676' : '#e040fb';
                const sourceNode = typeof link.source === 'object' ? link.source : this.nodes.find(n => n.id === link.source);
                return sourceNode ? sourceNode.color : '#ffffff';
            })
            .enableNodeDrag(false) 
            .nodeThreeObject(node => {
                const group = new window.THREE.Group();
                const geometry = new window.THREE.SphereGeometry(node.val * (this.isVnaMode ? 0.5 : 0.8), 24, 24);
                
                const isCore = node.group === 'core_os' || node.group === 'agent' || node.group === 'project_core' || node.group === 'role';
                const material = new window.THREE.MeshLambertMaterial({ 
                    color: node.color, transparent: true, opacity: isCore ? 0.95 : 0.7, depthWrite: false
                });
                
                const sphere = new window.THREE.Mesh(geometry, material);
                group.add(sphere);

                const sprite = new window.SpriteText(node.name);
                sprite.color = '#ffffff';
                sprite.textHeight = Math.max(3, node.val * 0.25); 
                sprite.fontWeight = isCore ? '900' : 'normal';
                if (this.isVnaMode) sprite.position.set(0, node.val * 0.6, 0);
                group.add(sprite);
                return group;
            })
            .onNodeHover(node => {
                if (node) {
                    canvasInner.style.cursor = 'pointer';
                    tooltip.style.display = 'block';
                    tooltip.innerHTML = `
                        <div class="tt-cat" style="color:${node.color}">${node.rawNode?.category || node.rawNode?.type || node.group}</div>
                        <div class="tt-title">${node.name}</div>
                    `;
                } else {
                    // Si no hay nodo, comprobamos si hay link hovered (manejado por onLinkHover)
                    if (tooltip.style.display !== 'block' || tooltip.dataset.isLink !== 'true') {
                        canvasInner.style.cursor = 'crosshair';
                        tooltip.style.display = 'none';
                    }
                }
            })
            .onNodeClick(node => {
                const distance = this.isVnaMode ? 200 : 120;
                const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
                this.graph3D.cameraPosition({ x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, node, 2000);
                this.showNodeDetailsInPalette(node);
            })
            // 🔥 INTERACTIVIDAD DE ENLACES (VNA FLOWS)
            .onLinkHover(link => {
                if (link && this.isVnaMode) {
                    canvasInner.style.cursor = 'pointer';
                    tooltip.style.display = 'block';
                    tooltip.dataset.isLink = 'true';
                    
                    const sourceName = link.source.name || link.source.id;
                    const targetName = link.target.name || link.target.id;
                    const txName = link.rawTx?.template || link.rawTx?.entregable || 'Transacción';
                    const color = link.tipo === 'tangible' ? '#00e676' : '#e040fb';

                    tooltip.innerHTML = `
                        <div class="tt-cat" style="color:${color};">Flujo de Valor: ${link.tipo?.toUpperCase()}</div>
                        <div class="tt-title">${txName}</div>
                        <div style="font-size:0.75rem; color:#aaa; margin-top:5px;">De: ${sourceName} &rarr; Para: ${targetName}</div>
                    `;
                } else if (!link) {
                    tooltip.dataset.isLink = 'false';
                    canvasInner.style.cursor = 'crosshair';
                    tooltip.style.display = 'none';
                }
            })
            .onLinkClick(link => {
                if (this.isVnaMode) {
                    this.showLinkDetailsInPalette(link);
                }
            });

        // 🔥 GRAVEDAD CUSTOM PARA MODO VNA
        if (this.isVnaMode) {
            this.graph3D.d3Force('charge').strength(-800); 
            this.graph3D.d3Force('link').distance(100);
            
            this.graph3D.linkThreeObjectExtend(true)
                .linkThreeObject(link => {
                    if (!link.rawTx) return null;
                    const deliverableName = link.rawTx.template || link.rawTx.entregable || 'Entregable';
                    const sprite = new window.SpriteText(`${link.rawTx.step_order || ''} - ${deliverableName}`);
                    sprite.color = 'white';
                    sprite.textHeight = 3.5;
                    sprite.backgroundColor = 'rgba(0,0,0,0.6)';
                    sprite.padding = 2;
                    sprite.borderRadius = 4;
                    return sprite;
                })
                .linkPositionUpdate((sprite, { start, end }) => {
                    const middlePos = Object.assign(...['x', 'y', 'z'].map(c => ({
                        [c]: start[c] + (end[c] - start[c]) / 2 
                    })));
                    Object.assign(sprite.position, middlePos);
                });

        } else {
            if (this.graph3D.d3Force('charge')) this.graph3D.d3Force('charge').strength(-400); 
            if (this.graph3D.d3Force('link')) this.graph3D.d3Force('link').distance(70); 
        }

        const ambientLight = new window.THREE.AmbientLight(0xffffff, 0.7);
        const dirLight = new window.THREE.DirectionalLight(0xffffff, 0.9);
        dirLight.position.set(1, 1, 1);
        this.graph3D.scene().add(ambientLight);
        this.graph3D.scene().add(dirLight);

        canvasInner.addEventListener('mousemove', (e) => {
            if (tooltip.style.display === 'block') {
                const rect = canvasInner.getBoundingClientRect();
                tooltip.style.left = `${e.clientX - rect.left}px`;
                tooltip.style.top = `${e.clientY - rect.top}px`;
            }
        });

        this.resizeObserver = new ResizeObserver(() => {
            if(canvasInner && this.graph3D) {
                this.graph3D.width(canvasInner.clientWidth);
                this.graph3D.height(canvasInner.clientHeight);
            }
        });
        this.resizeObserver.observe(canvasInner);
    }

    // 🔥 PANEL INTERACTIVO DE ENLACES (FLUJOS VNA)
    showLinkDetailsInPalette(link) {
        const resultsList = this.container.querySelector('#memeResultsList');
        if (!link.rawTx) return;
        
        const tx = link.rawTx;
        const sourceName = link.source.name || link.source.id;
        const targetName = link.target.name || link.target.id;
        const isTangible = tx.tipo === 'tangible';
        
        const safeColor = isTangible ? 'var(--accent-green)' : 'var(--accent-purple)';
        const typeLabel = isTangible ? '🟢 TANGIBLE' : '🟣 INTANGIBLE';

        resultsList.innerHTML = `
            <div style="margin-bottom: 15px;">
                <button id="btnBackSearch" style="background:rgba(255,255,255,0.05); border:1px solid #444; color:#fff; border-radius:8px; cursor:pointer; font-family:var(--font-mono); font-size:0.8rem; padding:10px 15px; width:100%; transition:0.2s; font-weight:bold; letter-spacing:1px; text-transform:uppercase;">&larr; Ocultar Flujo</button>
            </div>
            <div class="draggable-meme" style="--node-color: ${safeColor}; cursor: default;">
                <div class="dm-cat" style="color: ${safeColor};">${typeLabel}</div>
                <div class="dm-title" style="font-size:1.3rem;">${tx.template || tx.entregable || 'Entregable'}</div>
                <div style="margin-bottom:15px; font-size:0.85rem; color:#ccc; background:rgba(0,0,0,0.3); padding:10px; border-radius:8px;">
                    <div style="margin-bottom:5px;">📤 <strong>De:</strong> ${sourceName}</div>
                    <div>📥 <strong>Para:</strong> ${targetName}</div>
                </div>
                <div class="dm-content">${(tx.comentario || 'Intercambio de valor orgánico en el ecosistema.').replace(/\\n/g, '<br>')}</div>
                <div class="dm-tags">
                    <span class="dm-tag">⏱️ Estimación: ${tx.horas || 1}h</span>
                </div>
            </div>
            <div style="margin-top: 15px; text-align:center;">
                <button id="btnGoToPaper" style="background:linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); border:none; color:white; padding:12px 15px; border-radius:8px; font-weight:900; font-size:0.9rem; cursor:pointer; width:100%; transition:0.2s; box-shadow: 0 5px 15px rgba(0,176,255,0.2);">🚀 Ejecutar en Omni-Paper</button>
            </div>
        `;

        const btnBack = resultsList.querySelector('#btnBackSearch');
        if (btnBack) btnBack.addEventListener('click', () => {
            resultsList.innerHTML = '<div style="color:#888; font-size:0.85rem; text-align:center; padding:30px; font-style:italic; line-height: 1.5;">Haz clic en un nodo o flujo para interactuar.</div>';
        });

        const btnGoPaper = resultsList.querySelector('#btnGoToPaper');
        if (btnGoPaper) btnGoPaper.addEventListener('click', () => {
            if (this.projectId) localStorage.setItem('tt_active_project', this.projectId);
            window.location.href = '/v9/paper';
        });
    }

    // 🔥 PANEL INTERACTIVO DE NODOS
    showNodeDetailsInPalette(node3D) {
        const resultsList = this.container.querySelector('#memeResultsList');
        const m = node3D.rawNode;
        if (!m) return;

        const isAgent = node3D.group === 'agent';
        const isSkill = m.type === 'skill' || m.category === 'skill';
        const isProject = node3D.group === 'project_core';
        
        const tagsHtml = (m.keywords || []).map(t => `<span class="dm-tag">#${t}</span>`).join('');
        const safeColor = node3D.color || 'var(--accent-blue)';
        
        let badgesHtml = '';
        if (isSkill) {
            const r = (m.references || []).length;
            const e = (m.evals || []).length;
            const s = (m.scripts || []).length;
            if (r>0) badgesHtml += `<span style="background:rgba(0,176,255,0.1); color:var(--accent-blue); padding:3px 8px; border-radius:4px; font-size:0.7rem; font-weight:bold; margin-right:5px; border:1px solid rgba(0,176,255,0.3);">📚 ${r} Refs</span>`;
            if (e>0) badgesHtml += `<span style="background:rgba(255,171,64,0.1); color:var(--accent-orange); padding:3px 8px; border-radius:4px; font-size:0.7rem; font-weight:bold; margin-right:5px; border:1px solid rgba(255,171,64,0.3);">📋 ${e} Evals</span>`;
            if (s>0) badgesHtml += `<span style="background:rgba(0,230,118,0.1); color:var(--accent-green); padding:3px 8px; border-radius:4px; font-size:0.7rem; font-weight:bold; margin-right:5px; border:1px solid rgba(0,230,118,0.3);">⚡ ${s} Scripts</span>`;
        }
        
        let contentHtml = (m.content || '').replace(/\\n/g, '<br>');
        
        let interactivePanel = '';

        // 🔥 PROYECTO: Dive In a Matriz VNA
        if (isProject && !this.isVnaMode) {
            interactivePanel = `
                <div style="margin-top: 15px; display:flex; flex-direction:column; gap:10px;">
                    <button id="btnDiveVNA" class="btn-action-panel" style="background:linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); color:white; box-shadow:0 5px 15px rgba(224,64,251,0.2);">👁️ Desplegar Matriz VNA 3D</button>
                </div>
            `;
        }

        // 🔥 AGENTE: Equipar Skills
        if (isAgent) {
            const availableSkills = this.nodes.filter(n => n.group === 'skill' || n.rawNode?.category === 'skill');
            const options = availableSkills.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            
            interactivePanel = `
                <div style="margin-top: 15px; background: rgba(0,0,0,0.4); padding: 15px; border-radius: 12px; border: 1px solid #333;">
                    <label style="color:var(--accent-purple); font-size:0.75rem; font-weight:bold; text-transform:uppercase; display:block; margin-bottom:8px;">🎒 Equipar Skill al Agente</label>
                    <div style="display:flex; gap:10px;">
                        <select id="sel3DEquipSkill" class="palette-search" style="flex:1; padding:8px;">
                            <option value="">Selecciona skill de la red...</option>
                            ${options}
                        </select>
                        <button id="btn3DEquip" class="btn-action-panel" style="background:var(--accent-purple); color:white; width:auto; padding:0 15px;">Inyectar</button>
                    </div>
                </div>
            `;
        }

        // 🔥 SKILL: Testear y Editar
        if (isSkill) {
            interactivePanel = `
                <div style="margin-top: 15px; display:flex; flex-direction:column; gap:10px;">
                    <button id="btn3DEditSkill" class="btn-action-panel" style="background:var(--accent-blue); color:black;">🧠 Evolucionar en la Forja</button>
                    ${(m.evals && m.evals.length > 0) ? `<button id="btn3DTestSkill" class="btn-action-panel" style="background:transparent; border:1px solid var(--accent-orange); color:var(--accent-orange);">🧪 Ejecutar Pentest (CI/CD)</button>` : ''}
                </div>
            `;
        }

        resultsList.innerHTML = `
            <div style="margin-bottom: 15px;">
                <button id="btnBackSearch" style="background:rgba(255,255,255,0.05); border:1px solid #444; color:#fff; border-radius:8px; cursor:pointer; font-family:var(--font-mono); font-size:0.8rem; padding:10px 15px; width:100%; transition:0.2s; font-weight:bold; letter-spacing:1px; text-transform:uppercase;">&larr; Desanclar Cámara</button>
            </div>
            <div class="draggable-meme" style="--node-color: ${safeColor}; cursor: default;">
                <div class="dm-cat" style="color: ${safeColor};">${m.category || m.type || node3D.group}</div>
                <div class="dm-title" style="font-size:1.3rem;">${m.title || node3D.name}</div>
                ${badgesHtml ? `<div style="margin-bottom:10px;">${badgesHtml}</div>` : ''}
                <div class="dm-content">${contentHtml}</div>
                <div class="dm-tags">${tagsHtml}</div>
            </div>
            ${interactivePanel}
        `;

        const btnBack = resultsList.querySelector('#btnBackSearch');
        if (btnBack) btnBack.addEventListener('click', () => {
            resultsList.innerHTML = '<div style="color:#888; font-size:0.85rem; text-align:center; padding:30px; font-style:italic; line-height: 1.5;">Haz clic en un nodo o flujo para interactuar.</div>';
            this.graph3D.cameraPosition({ x: 0, y: 0, z: 800 }, { x: 0, y: 0, z: 0 }, 2000);
        });

        // Listeners Panel Activo
        const btnDive = resultsList.querySelector('#btnDiveVNA');
        if (btnDive) {
            btnDive.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('load-vna-graph', { detail: { projectId: m.id } }));
            });
        }

        const btnEquip = resultsList.querySelector('#btn3DEquip');
        if (btnEquip) {
            btnEquip.addEventListener('click', () => {
                const skillId = resultsList.querySelector('#sel3DEquipSkill').value;
                if (!skillId) return alert("Selecciona una skill");
                btnEquip.innerText = "⏳...";
                btnEquip.disabled = true;
                window.dispatchEvent(new CustomEvent('3d-equip-skill', { detail: { agentId: m.id, skillId: skillId } }));
            });
        }

        const btnEdit = resultsList.querySelector('#btn3DEditSkill');
        if (btnEdit) btnEdit.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('open-forge-modal', { detail: { nodeId: m.id } }));
        });

        const btnTest = resultsList.querySelector('#btn3DTestSkill');
        if (btnTest) btnTest.addEventListener('click', () => {
            btnTest.innerText = "🧪 Evaluando...";
            btnTest.disabled = true;
            window.dispatchEvent(new CustomEvent('3d-test-skill', { detail: { skillData: m } }));
        });
    }

    setupInteractivity() {
        const searchInput = this.container.querySelector('#memeSearchInput');
        const resultsList = this.container.querySelector('#memeResultsList');
        const btnInject = this.container.querySelector('#btnInjectSeeds');
        const btnFullscreen = this.container.querySelector('#btnToggleFullscreen');
        const mainLayout = this.container.querySelector('#synapticMainLayout');

        if (btnFullscreen && mainLayout) {
            btnFullscreen.addEventListener('click', () => {
                this.isFullscreen = !this.isFullscreen;
                if (this.isFullscreen) {
                    mainLayout.classList.add('fullscreen-mode');
                    btnFullscreen.innerHTML = '🗗 Reducir';
                    btnFullscreen.style.backgroundColor = 'rgba(255,82,82,0.2)';
                    btnFullscreen.style.borderColor = 'var(--accent-red)';
                } else {
                    mainLayout.classList.remove('fullscreen-mode');
                    btnFullscreen.innerHTML = '⛶';
                    btnFullscreen.style.backgroundColor = 'rgba(0,0,0,0.5)';
                    btnFullscreen.style.borderColor = '#555';
                }
                setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
            });
        }

        const btnBackGal = this.container.querySelector('#btnBackToGalaxy');
        if (btnBackGal) {
            btnBackGal.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('exit-vna-graph'));
            });
        }

        if (btnInject) {
            btnInject.addEventListener('click', async () => {
                btnInject.disabled = true;
                btnInject.innerText = "⏳ Inyectando...";
                alert("Semillas gestionadas ahora desde el CoreSeed en el arranque del Kernel.");
                btnInject.style.display = 'none';
            });
        }

        if (searchInput) {
            searchInput.addEventListener('keyup', async (e) => {
                const term = e.target.value.toLowerCase().trim();
                if (term.length < 2) return resultsList.innerHTML = '<div style="color:#666; text-align:center; padding:30px;">Buscando en la inmensidad...</div>';
                
                await KB.init();
                const allMemes = await KB.getAllNodes(); 
                const filtered = allMemes.filter(m => m.title?.toLowerCase().includes(term) || m.category?.toLowerCase().includes(term) || (m.keywords && m.keywords.some(k => k.toLowerCase().includes(term))));
                
                if (filtered.length === 0) return resultsList.innerHTML = '<div style="color:#888; text-align:center; padding:30px;">No se encontró señal en esa frecuencia.</div>';

                resultsList.innerHTML = filtered.slice(0, 15).map(m => {
                    return `<div class="draggable-meme is-search-result" data-id="${m.id}" style="--node-color: var(--accent-blue);"><div class="dm-cat">${m.category || m.type}</div><div class="dm-title">${m.title}</div><div style="font-size:0.8rem; color:#888; font-style:italic; margin-top:5px;">(Clic para viajar al nodo)</div></div>`;
                }).join('');

                resultsList.querySelectorAll('.draggable-meme').forEach(el => {
                    el.addEventListener('click', () => {
                        const targetNode = this.nodes.find(n => n.id === el.dataset.id);
                        if (targetNode && this.graph3D) {
                            const distRatio = 1 + 120/Math.hypot(targetNode.x, targetNode.y, targetNode.z);
                            this.graph3D.cameraPosition({ x: targetNode.x * distRatio, y: targetNode.y * distRatio, z: targetNode.z * distRatio }, targetNode, 1500);
                            this.showNodeDetailsInPalette(targetNode);
                        }
                    });
                });
            });
        }
    }

    destroy() {
        if (this.resizeObserver) this.resizeObserver.disconnect();
        if (this.graph3D) {
            this.graph3D._destructor();
            this.graph3D = null;
        }
    }
}
