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
    }

    async render() {
        const isGlobalMode = !this.agentId;
        const panelTitle = isGlobalMode ? '🌌 Meta-Grafo Cuántico (V9)' : `🧠 Córtex 3D de ${this.agentId}`;

        this.container.innerHTML = `
            <style>
                .synaptic-layout { display: flex; width: 100%; height: 100%; background: #050508; border-radius: 20px; overflow: hidden; border: 1px solid var(--glass-border); box-shadow: inset 0 0 50px rgba(0,0,0,0.8); position: relative;}
                
                .synaptic-palette { width: 340px; background: linear-gradient(90deg, rgba(5,5,8,0.95) 0%, rgba(10,10,15,0.8) 100%); border-right: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; z-index: 10; backdrop-filter: blur(15px); box-shadow: 10px 0 30px rgba(0,0,0,0.5);}
                .palette-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display:flex; flex-direction:column; gap:15px;}
                .palette-title { color: white; font-weight: 900; font-size: 1.2rem; margin: 0; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 0 10px rgba(255,255,255,0.2);}
                .palette-search { width: 100%; background: rgba(0,0,0,0.6); border: 1px solid #444; color: var(--accent-green); padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.9rem; outline: none; box-sizing: border-box; transition: 0.3s;}
                .palette-search:focus { border-color: var(--accent-green); box-shadow: inset 0 0 15px rgba(0,230,118,0.2);}
                
                .meme-results { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px;}
                
                .draggable-meme { background: rgba(255,255,255,0.03); border: 1px solid #444; padding: 15px; border-radius: 12px; cursor: pointer; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); user-select: none; word-break: break-word; position: relative; overflow: hidden;}
                .draggable-meme::before { content: ''; position: absolute; top:0; left:0; width:4px; height:100%; background: var(--node-color, #444); }
                .draggable-meme.can-drag { cursor: grab; border-color: var(--accent-purple); }
                .draggable-meme.can-drag:active { cursor: grabbing; border-style: solid; background: var(--accent-purple); color: white;}
                .draggable-meme:hover { background: rgba(255,255,255,0.08); transform: translateX(5px); box-shadow: 0 5px 15px rgba(0,0,0,0.5); border-color: var(--node-color, #888);}
                
                .dm-cat { font-size: 0.7rem; color: var(--node-color, var(--accent-orange)); font-family: var(--font-mono); font-weight: bold; pointer-events: none; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;}
                .dm-title { font-size: 1.05rem; color: white; margin: 0 0 10px 0; font-weight: 900; pointer-events: none; line-height: 1.3;}
                .dm-content { font-size: 0.9rem; color: #bbb; line-height: 1.6; font-family: 'Georgia', serif; display: block; overflow-y: auto; max-height: 400px; padding-right: 5px;}
                .dm-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 15px; padding-top: 15px; border-top: 1px dashed rgba(255,255,255,0.1);}
                .dm-tag { font-size: 0.7rem; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 3px 8px; color: #aaa; font-family: var(--font-mono);}

                .btn-inject-seeds { background: linear-gradient(135deg, rgba(0,230,118,0.1), rgba(0,176,255,0.1)); border: 1px solid var(--accent-green); color: white; padding: 12px; border-radius: 8px; font-weight: 900; cursor: pointer; font-size: 0.85rem; transition: 0.3s; width: 100%; text-transform: uppercase; letter-spacing: 1px; display: ${isGlobalMode ? 'block' : 'none'}; box-shadow: 0 5px 15px rgba(0,230,118,0.1);}
                .btn-inject-seeds:hover { background: var(--accent-green); color: black; box-shadow: 0 0 20px rgba(0,230,118,0.5); transform: translateY(-2px);}

                .synaptic-3d-container { flex: 1; position: relative; overflow: hidden; background: radial-gradient(circle at center, #111116 0%, #000000 100%); }
                .webgl-target { width: 100%; height: 100%; outline: none; cursor: crosshair;}
                
                .graph-tooltip { position: absolute; background: rgba(10, 10, 15, 0.95); border: 1px solid #555; color: white; padding: 10px 15px; border-radius: 8px; font-family: var(--font-main); font-size: 0.85rem; pointer-events: none; z-index: 100; backdrop-filter: blur(10px); box-shadow: 0 10px 25px rgba(0,0,0,0.8); display: none; transform: translate(-50%, -150%); white-space: nowrap;}
                .graph-tooltip .tt-cat { font-size: 0.65rem; color: var(--accent-blue); font-family: var(--font-mono); text-transform: uppercase; font-weight: bold; margin-bottom: 3px;}
                .graph-tooltip .tt-title { font-weight: 900; font-size: 1rem; }

                .loader-3d { position: absolute; top:50%; left:50%; transform: translate(-50%, -50%); color: var(--accent-blue); font-family: var(--font-mono); font-weight: bold; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 2px; animation: pulse 1.5s infinite; pointer-events: none; z-index: 20;}
                @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; text-shadow: 0 0 20px var(--accent-blue); } 100% { opacity: 0.5; } }

                @media (max-width: 768px) {
                    .synaptic-layout { flex-direction: column-reverse; }
                    .synaptic-palette { width: 100%; height: 45%; border-right: none; border-top: 1px solid #333; }
                    .synaptic-3d-container { height: 55%; }
                }
            </style>

            <div class="synaptic-layout">
                <div class="synaptic-palette">
                    <div class="palette-header">
                        <h3 class="palette-title">${panelTitle}</h3>
                        <input type="text" id="memeSearchInput" class="palette-search" placeholder="🔍 Buscar Memes, Roles o SOPs...">
                        <button class="btn-inject-seeds" id="btnInjectSeeds">✨ Forjar Semillas Antigravity</button>
                    </div>
                    <div class="meme-results" id="memeResultsList">
                        <div style="color:#888; font-size:0.85rem; text-align:center; padding:30px; font-style:italic; line-height: 1.5;">
                            ${isGlobalMode ? 'Haz clic en un nodo para viajar hacia él y decodificar su estructura.' : 'Usa el selector de arriba para inyectar conocimiento a este nodo.'}
                        </div>
                    </div>
                </div>
                <div class="synaptic-3d-container" id="d3DropZone">
                    <div class="loader-3d" id="loader3D">Iniciando Inyección WebGL...</div>
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

        const addLink = (source, target) => {
            if (!source || !target) return;
            const sourceExists = this.nodes.some(n => n.id === source);
            const targetExists = this.nodes.some(n => n.id === target);
            if (sourceExists && targetExists) {
                this.links.push({ source, target });
            }
        };

        const getColorAndMass = (category) => {
            switch(category) {
                case 'core_os': return { c: '#ffffff', m: 50 };
                case 'project_core': return { c: '#00b0ff', m: 45 };
                case 'evergreen': return { c: '#ffd700', m: 35 };
                case 'prompt_a2a': return { c: '#e040fb', m: 30 };
                case 'meta_prompt': return { c: '#e040fb', m: 35 };
                case 'skill': return { c: '#00e676', m: 25 };
                case 'SOP': return { c: '#ff9100', m: 20 };
                case 'role': return { c: '#ff4081', m: 30 };
                default: return { c: '#888888', m: 15 };
            }
        };

        if (this.agentId) {
            // MODO CÓRTEX 3D DE AGENTE/HUMANO
            const relatedMemes = allNodes.filter(n => n.keywords && n.keywords.includes(this.agentId));
            addNode(this.agentId, this.agentId, 'agent', 50, 'var(--accent-blue)', { title: this.agentId, content: "Núcleo de la Identidad" });

            const safeAgentId = this.agentId.replace('@','');
            const promptNode = allNodes.find(n => n.id === `prompt_global_${safeAgentId}`);
            if (promptNode) {
                addNode(promptNode.id, 'System Prompt', 'meta_prompt', 35, '#e040fb', promptNode);
                addLink(this.agentId, promptNode.id);
            }

            relatedMemes.forEach(m => {
                const { c, m: mass } = getColorAndMass(m.category);
                addNode(m.id, m.title, m.category, mass, c, m);
                addLink(this.agentId, m.id);
            });
        } else {
            // MODO META-GRAFO GLOBAL
            addNode('core_kernel', 'OS KERNEL', 'core_os', 70, '#ffffff', { title: 'TeamTowers V9 Kernel', category: 'core_os', content: 'Punto Cero del Sistema Operativo de Sinergias.' });

            state.projects.forEach(p => {
                addNode(p.id, p.nombre, 'project_core', 45, '#00b0ff', { title: p.nombre, category: 'project_core', content: p.presentation || 'Ecosistema' });
                addLink('core_kernel', p.id);

                if(p.roles) {
                    p.roles.forEach(r => {
                        const rId = `role_${p.id}_${r.id}`;
                        addNode(rId, r.name, 'role', 30, '#ff4081', { title: r.name, category: 'role', content: `Nivel: ${r.levelId}` });
                        addLink(p.id, rId);
                    });
                }
                if(p.vna_flows) {
                    p.vna_flows.forEach(f => {
                        const fId = 'flow_' + p.id + '_' + f.id;
                        addNode(fId, f.template || 'SOP', 'SOP', 20, '#ff9100', { title: f.template, category: 'SOP', content: `Horas Est: ${f.estimatedHours}h` });
                        if (f.to) addLink(`role_${p.id}_${f.to}`, fId);
                        if (f.from) addLink(`role_${p.id}_${f.from}`, fId); 
                    });
                }
            });

            allNodes.forEach(m => {
                if (m.type === 'system_state' || m.id === 'global_kernel_state') return;
                const { c, m: mass } = getColorAndMass(m.category);
                addNode(m.id, m.title, m.category, mass, c, m);

                let linked = false;
                if (m.projectId && m.projectId !== 'global' && this.nodes.find(n => n.id === m.projectId)) {
                    addLink(m.projectId, m.id);
                    linked = true;
                }

                if (m.keywords && Array.isArray(m.keywords)) {
                    m.keywords.forEach(kw => {
                        const targetNode = this.nodes.find(n => n.id === kw || n.name.toLowerCase() === kw.toLowerCase() || n.id.includes(`role_${m.projectId}_${kw}`));
                        if (targetNode && targetNode.id !== m.id) {
                            addLink(m.id, targetNode.id);
                            linked = true;
                        }
                    });
                }

                if (!linked && m.projectId === 'global') addLink('core_kernel', m.id);
            });
        }
    }

    async initWebGLGraph() {
        const canvasInner = this.container.querySelector('#webglCanvasInner');
        const loader = this.container.querySelector('#loader3D');
        const tooltip = this.container.querySelector('#graphTooltip');

        // 🔥 FUNCIÓN SEGURA PARA INYECTAR SCRIPTS EXTERNOS SIN DUPLICAR NI ROMPER 'THREE'
        const loadScript = (src, globalVar) => {
            return new Promise((resolve, reject) => {
                if (window[globalVar]) return resolve(); // Evita cargar dos veces (Mata el warning de Multiple Instances)
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Failed to load ${src}`));
                document.head.appendChild(script);
            });
        };

        try {
            // 🔥 CONGELAMOS VERSIONES ESPECÍFICAS QUE EXPORTAN VARIABLES GLOBALES COMPATIBLES
            await loadScript('https://unpkg.com/three@0.147.0/build/three.min.js', 'THREE');
            await load
