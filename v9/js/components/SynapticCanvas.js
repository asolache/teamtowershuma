// v9/js/components/SynapticCanvas.js
import { KB } from '../core/kb.js';
import { store } from '../core/store.js';

export class SynapticCanvas {
    constructor(containerEl, agentId = null) {
        this.container = containerEl;
        this.agentId = agentId; 
        this.nodes = [];
        this.links = [];
        this.graph3D = null;
        this.resizeObserver = null;
        this.isFullscreen = false;
    }

    async render() {
        const isGlobalMode = !this.agentId;
        const panelTitle = isGlobalMode ? '🌌 Meta-Grafo Cuántico (V9)' : `🧠 Córtex 3D de ${this.agentId}`;

        this.container.innerHTML = `
            <style>
                .synaptic-layout { display: flex; width: 100%; height: 100%; background: #050508; border-radius: 20px; overflow: hidden; border: 1px solid var(--glass-border); box-shadow: inset 0 0 50px rgba(0,0,0,0.8); position: relative; transition: all 0.4s ease;}
                
                /* MODO PANTALLA COMPLETA */
                .synaptic-layout.fullscreen-mode { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999; border-radius: 0; border: none; }
                
                .btn-fullscreen { position: absolute; top: 20px; right: 20px; z-index: 50; background: rgba(0,0,0,0.5); border: 1px solid #555; color: white; border-radius: 8px; padding: 8px 12px; cursor: pointer; transition: 0.2s; font-size: 1.2rem;}
                .btn-fullscreen:hover { background: rgba(255,255,255,0.1); border-color: white;}

                .synaptic-palette { width: 340px; background: linear-gradient(90deg, rgba(5,5,8,0.95) 0%, rgba(10,10,15,0.8) 100%); border-right: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; z-index: 10; backdrop-filter: blur(15px); box-shadow: 10px 0 30px rgba(0,0,0,0.5);}
                .palette-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display:flex; flex-direction:column; gap:15px;}
                .palette-title { color: white; font-weight: 900; font-size: 1.2rem; margin: 0; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 0 10px rgba(255,255,255,0.2);}
                .palette-search { width: 100%; background: rgba(0,0,0,0.6); border: 1px solid #444; color: var(--accent-green); padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.9rem; outline: none; box-sizing: border-box; transition: 0.3s;}
                .palette-search:focus { border-color: var(--accent-green); box-shadow: inset 0 0 15px rgba(0,230,118,0.2);}
                
                .meme-results { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px;}
                
                .draggable-meme { background: rgba(255,255,255,0.03); border: 1px solid #444; padding: 15px; border-radius: 12px; cursor: pointer; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); user-select: none; word-break: break-word; position: relative; overflow: hidden;}
                .draggable-meme::before { content: ''; position: absolute; top:0; left:0; width:4px; height:100%; background: var(--node-color, #444); }
                .draggable-meme:hover { background: rgba(255,255,255,0.08); transform: translateX(5px); box-shadow: 0 5px 15px rgba(0,0,0,0.5); border-color: var(--node-color, #888);}
                
                .dm-cat { font-size: 0.7rem; color: var(--node-color, var(--accent-orange)); font-family: var(--font-mono); font-weight: bold; pointer-events: none; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;}
                .dm-title { font-size: 1.05rem; color: white; margin: 0 0 10px 0; font-weight: 900; pointer-events: none; line-height: 1.3;}
                .dm-content { font-size: 0.9rem; color: #bbb; line-height: 1.6; font-family: 'Georgia', serif; display: block; overflow-y: auto; max-height: 400px; padding-right: 5px;}
                .dm-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 15px; padding-top: 15px; border-top: 1px dashed rgba(255,255,255,0.1);}
                .dm-tag { font-size: 0.7rem; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 3px 8px; color: #aaa; font-family: var(--font-mono);}

                .btn-inject-seeds { background: linear-gradient(135deg, rgba(0,230,118,0.1), rgba(0,176,255,0.1)); border: 1px solid var(--accent-green); color: white; padding: 12px; border-radius: 8px; font-weight: 900; cursor: pointer; font-size: 0.85rem; transition: 0.3s; width: 100%; text-transform: uppercase; letter-spacing: 1px; display: ${isGlobalMode ? 'block' : 'none'}; box-shadow: 0 5px 15px rgba(0,230,118,0.1);}
                .btn-inject-seeds:hover { background: var(--accent-green); color: black; box-shadow: 0 0 20px rgba(0,230,118,0.5); transform: translateY(-2px);}

                .synaptic-3d-container { flex: 1; position: relative; overflow: hidden; background: radial-gradient(circle at center, #0a0a10 0%, #000000 100%); }
                .webgl-target { width: 100%; height: 100%; outline: none; cursor: crosshair;}
                
                .graph-tooltip { position: absolute; background: rgba(10, 10, 15, 0.95); border: 1px solid #555; color: white; padding: 10px 15px; border-radius: 8px; font-family: var(--font-main); font-size: 0.85rem; pointer-events: none; z-index: 100; backdrop-filter: blur(10px); box-shadow: 0 10px 25px rgba(0,0,0,0.8); display: none; transform: translate(-50%, -150%); white-space: nowrap;}
                .graph-tooltip .tt-cat { font-size: 0.65rem; color: var(--accent-blue); font-family: var(--font-mono); text-transform: uppercase; font-weight: bold; margin-bottom: 3px;}
                .graph-tooltip .tt-title { font-weight: 900; font-size: 1rem; }

                .loader-3d { position: absolute; top:50%; left:50%; transform: translate(-50%, -50%); color: var(--accent-blue); font-family: var(--font-mono); font-weight: bold; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 2px; animation: pulse 1.5s infinite; pointer-events: none; z-index: 20;}
                @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; text-shadow: 0 0 20px var(--accent-blue); } 100% { opacity: 0.5; } }

                .badge { font-family: var(--font-mono); font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; display: inline-block; margin-right: 5px; }
                .badge.ref { background: rgba(0,176,255,0.1); color: var(--accent-blue); border: 1px solid rgba(0,176,255,0.3); }
                .badge.eval { background: rgba(255,145,0,0.1); color: var(--accent-orange); border: 1px solid rgba(255,145,0,0.3); }
                .badge.script { background: rgba(0,230,118,0.1); color: var(--accent-green); border: 1px solid rgba(0,230,118,0.3); }

                @media (max-width: 768px) {
                    .synaptic-layout { flex-direction: column-reverse; }
                    .synaptic-palette { width: 100%; height: 45%; border-right: none; border-top: 1px solid #333; }
                    .synaptic-3d-container { height: 55%; }
                }
            </style>

            <div class="synaptic-layout" id="synapticMainLayout">
                <button class="btn-fullscreen" id="btnToggleFullscreen" title="Pantalla Completa">⛶</button>
                <div class="synaptic-palette">
                    <div class="palette-header">
                        <h3 class="palette-title">${panelTitle}</h3>
                        <input type="text" id="memeSearchInput" class="palette-search" placeholder="🔍 Buscar Memes, Agentes o Skills...">
                        <button class="btn-inject-seeds" id="btnInjectSeeds">✨ Forjar Semillas Antigravity</button>
                    </div>
                    <div class="meme-results" id="memeResultsList">
                        <div style="color:#888; font-size:0.85rem; text-align:center; padding:30px; font-style:italic; line-height: 1.5;">
                            ${isGlobalMode ? 'Haz clic en un nodo para viajar hacia él y decodificar su estructura.' : 'Explora el cerebro del Agente y sus ramificaciones de conocimiento.'}
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

        await this.loadInitialData();
        await this.initWebGLGraph();
        this.setupInteractivity();
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
            // Taxonomía Core
            if (category.startsWith('core.architecture')) return { c: '#00b0ff', m: 30 };
            if (category.startsWith('core.economy')) return { c: '#00e676', m: 30 };
            if (category.startsWith('core.cognition')) return { c: '#e040fb', m: 30 };
            if (category.startsWith('core.execution')) return { c: '#ff9100', m: 30 };
            if (category.startsWith('core.culture')) return { c: '#ff5252', m: 30 };
            
            // Entidades específicas
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

        // 🔥 MODOS DE VISUALIZACIÓN 🔥
        if (this.agentId) {
            // MODO: PERFIL NEURONAL (Un Agente específico)
            addNode(this.agentId, this.agentId, 'agent', 60, '#e040fb', { title: this.agentId, content: "Núcleo Biológico / Sintético" });

            const safeAgentId = this.agentId.replace('@','');
            const promptNode = allNodes.find(n => n.id === `prompt_global_${safeAgentId}`);
            
            if (promptNode) {
                addNode(promptNode.id, 'Cerebro (AGENT.md)', 'meta_prompt', 40, '#ffffff', promptNode);
                addLink(this.agentId, promptNode.id);
                
                // Mapear el cinturón de Skills del Agente (A2A Dependencies)
                if (promptNode.dependencies && Array.isArray(promptNode.dependencies)) {
                    promptNode.dependencies.forEach(skillId => {
                        const sNode = allNodes.find(n => n.id === skillId);
                        if (sNode) {
                            const { c, m: mass } = getColorAndMass(sNode.category);
                            addNode(sNode.id, sNode.title, sNode.category, mass, c, sNode);
                            addLink(promptNode.id, sNode.id, true);

                            // Mapear los hijos de la Skill (Referencias, Evals, Scripts)
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
            // MODO: META-GRAFO GLOBAL (Todo el universo)
            addNode('core_kernel', 'V9 KERNEL', 'core_os', 80, '#ffffff', { title: 'TeamTowers V9', category: 'core_os', content: 'Singularidad Antigravity.' });

            // 1. Proyectos y Roles
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

            // 2. Agentes y sus Cerebros
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

            // 3. Base de Conocimiento (LMS W3C) - Skills, Referencias, Memes
            allNodes.forEach(m => {
                if (m.type === 'system_state' || m.id === 'global_kernel_state') return;
                if (m.id.startsWith('prompt_global')) return; // Ya mapeados
                
                const { c, m: mass } = getColorAndMass(m.category || m.type);
                addNode(m.id, m.title, m.category, mass, c, m);

                let linked = false;

                // Conectar Skills a los Prompts de los agentes que las usan
                state.globalUsers.forEach(u => {
                    const pNode = allNodes.find(n => n.id === `prompt_global_${u.id.replace('@','')}`);
                    if (pNode && pNode.dependencies && pNode.dependencies.includes(m.id)) {
                        addLink(pNode.id, m.id, true);
                        linked = true;
                    }
                });

                // Conectar hijos (Referencias/Evals) a sus Skills padres
                ['references', 'evals', 'scripts'].forEach(depType => {
                    if (m[depType] && Array.isArray(m[depType])) {
                        m[depType].forEach(childId => {
                            if (allNodes.find(n => n.id === childId)) {
                                addLink(m.id, childId, true);
                            }
                        });
                    }
                });

                // Conectar a Proyectos vía Keywords o ProjectId
                if (m.projectId && m.projectId !== 'global' && this.nodes.find(n => n.id === m.projectId)) {
                    addLink(m.projectId, m.id);
                    linked = true;
                }

                // Nodos huérfanos orbitan el Kernel
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
                const sourceNode = typeof link.source === 'object' ? link.source : this.nodes.find(n => n.id === link.source);
                const color = sourceNode ? sourceNode.color : 'rgba(0,176,255,1)';
                return link.isDependencies ? color.replace(')', ', 0.2)').replace('rgb', 'rgba') : color.replace(')', ', 0.5)').replace('rgb', 'rgba'); 
            })
            .linkWidth(link => link.isDependencies ? 0.8 : 1.5)
            .linkDirectionalParticles(link => link.isDependencies ? 1 : 3) 
            .linkDirectionalParticleWidth(2.5) 
            .linkDirectionalParticleColor(link => {
                const sourceNode = typeof link.source === 'object' ? link.source : this.nodes.find(n => n.id === link.source);
                return sourceNode ? sourceNode.color : '#ffffff';
            })
            .enableNodeDrag(false) 
            .nodeThreeObject(node => {
                const group = new window.THREE.Group();
                const geometry = new window.THREE.SphereGeometry(node.val * 0.8, 24, 24);
                
                const isCore = node.group === 'core_os' || node.group === 'agent' || node.group === 'project_core';
                const material = new window.THREE.MeshLambertMaterial({ 
                    color: node.color, transparent: true, opacity: isCore ? 0.95 : 0.7, depthWrite: false
                });
                
                const sphere = new window.THREE.Mesh(geometry, material);
                group.add(sphere);

                const sprite = new window.SpriteText(node.name);
                sprite.color = '#ffffff';
                sprite.textHeight = Math.max(3, node.val * 0.25); 
                sprite.fontWeight = isCore ? '900' : 'normal';
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
                    canvasInner.style.cursor = 'crosshair';
                    tooltip.style.display = 'none';
                }
            })
            .onNodeClick(node => {
                const distance = 120;
                const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
                this.graph3D.cameraPosition({ x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, node, 2000);
                this.showNodeDetailsInPalette(node);
            });

        if (this.graph3D.d3Force('charge')) this.graph3D.d3Force('charge').strength(-400); 
        if (this.graph3D.d3Force('link')) this.graph3D.d3Force('link').distance(70); 

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

    showNodeDetailsInPalette(node3D) {
        const resultsList = this.container.querySelector('#memeResultsList');
        const m = node3D.rawNode;
        if (!m) return;

        const tagsHtml = (m.keywords || []).map(t => `<span class="dm-tag">#${t}</span>`).join('');
        const safeColor = node3D.color || 'var(--accent-blue)';
        
        let badgesHtml = '';
        if (m.type === 'skill') {
            const r = (m.references || []).length;
            const e = (m.evals || []).length;
            const s = (m.scripts || []).length;
            if (r>0) badgesHtml += `<span class="badge ref">📚 ${r} Referencias</span>`;
            if (e>0) badgesHtml += `<span class="badge eval">📋 ${e} Evals</span>`;
            if (s>0) badgesHtml += `<span class="badge script">⚡ ${s} Scripts</span>`;
        }
        
        // Formateo visual del contenido VNA
        let contentHtml = (m.content || '').replace(/\\n/g, '<br>');
        contentHtml = contentHtml.replace(/\[VNA_NODE\]/g, '<strong style="color:var(--accent-blue); display:block; margin-top:10px;">[VNA_NODE]</strong>');
        contentHtml = contentHtml.replace(/\[SOP\]/g, '<strong style="color:var(--accent-purple); display:block; margin-top:10px;">[SOP]</strong>');
        contentHtml = contentHtml.replace(/\[SOC\]/g, '<strong style="color:var(--accent-orange); display:block; margin-top:10px;">[SOC]</strong>');
        
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
            ${m.type === 'skill' || m.type === 'reference' || m.type === 'eval' ? `
            <div style="margin-top: 15px; text-align:center;">
                <button style="background:var(--accent-purple); border:none; color:white; padding:10px 15px; border-radius:8px; font-weight:900; font-size:0.85rem; cursor:pointer; width:100%; transition:0.2s;" onclick="window.dispatchEvent(new CustomEvent('open-forge-modal', {detail:{nodeId:'${m.id}'}}))">🧠 Evolucionar en la Forja</button>
            </div>` : ''}
        `;

        const btnBack = resultsList.querySelector('#btnBackSearch');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                resultsList.innerHTML = '<div style="color:#888; font-size:0.85rem; text-align:center; padding:30px; font-style:italic; line-height: 1.5;">Haz clic en un nodo del universo 3D para viajar hacia él y decodificar su estructura.</div>';
                this.container.querySelector('#memeSearchInput').value = '';
                this.graph3D.cameraPosition({ x: 0, y: 0, z: 800 }, { x: 0, y: 0, z: 0 }, 2000);
            });
        }
    }

    setupInteractivity() {
        const searchInput = this.container.querySelector('#memeSearchInput');
        const resultsList = this.container.querySelector('#memeResultsList');
        const btnInject = this.container.querySelector('#btnInjectSeeds');
        const btnFullscreen = this.container.querySelector('#btnToggleFullscreen');
        const mainLayout = this.container.querySelector('#synapticMainLayout');

        // Toggle Fullscreen Mágico
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
                // Trigger resize observer manually via CSS transition trickery
                setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
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

        searchInput.addEventListener('keyup', async (e) => {
            const term = e.target.value.toLowerCase().trim();
            if (term.length < 2) return resultsList.innerHTML = '<div style="color:#666; text-align:center; padding:30px;">Buscando en la inmensidad...</div>';
            
            await KB.init();
            const allMemes = await KB.getAllNodes(); 
            const filtered = allMemes.filter(m => m.title?.toLowerCase().includes(term) || m.category?.toLowerCase().includes(term) || (m.keywords && m.keywords.some(k => k.toLowerCase().includes(term))));
            
            if (filtered.length === 0) return resultsList.innerHTML = '<div style="color:#888; text-align:center; padding:30px;">No se encontró señal en esa frecuencia.</div>';

            resultsList.innerHTML = filtered.slice(0, 15).map(m => {
                return `<div class="draggable-meme" data-id="${m.id}" style="--node-color: var(--accent-blue);"><div class="dm-cat">${m.category || m.type}</div><div class="dm-title">${m.title}</div><div style="font-size:0.8rem; color:#888; font-style:italic; margin-top:5px;">(Clic para viajar al nodo)</div></div>`;
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

    destroy() {
        if (this.resizeObserver) this.resizeObserver.disconnect();
        if (this.graph3D) this.graph3D._destructor();
    }
}
