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
                
                /* PALETA LATERAL (BUSCADOR Y LECTURA) */
                .synaptic-palette { width: 340px; background: linear-gradient(90deg, rgba(5,5,8,0.95) 0%, rgba(10,10,15,0.8) 100%); border-right: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; z-index: 10; backdrop-filter: blur(15px); box-shadow: 10px 0 30px rgba(0,0,0,0.5);}
                .palette-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display:flex; flex-direction:column; gap:15px;}
                .palette-title { color: white; font-weight: 900; font-size: 1.2rem; margin: 0; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 0 10px rgba(255,255,255,0.2);}
                .palette-search { width: 100%; background: rgba(0,0,0,0.6); border: 1px solid #444; color: var(--accent-green); padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.9rem; outline: none; box-sizing: border-box; transition: 0.3s;}
                .palette-search:focus { border-color: var(--accent-green); box-shadow: inset 0 0 15px rgba(0,230,118,0.2);}
                
                .meme-results { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px;}
                
                /* TARJETAS DE MEMES Y LECTURA */
                .draggable-meme { background: rgba(255,255,255,0.03); border: 1px solid #444; padding: 15px; border-radius: 12px; cursor: pointer; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); user-select: none; word-break: break-word; position: relative; overflow: hidden;}
                .draggable-meme::before { content: ''; position: absolute; top:0; left:0; width:4px; height:100%; background: var(--node-color, #444); }
                .draggable-meme.can-drag { cursor: grab; border-color: var(--accent-purple); }
                .draggable-meme.can-drag:active { cursor: grabbing; border-style: solid; background: var(--accent-purple); color: white;}
                .draggable-meme:hover { background: rgba(255,255,255,0.08); transform: translateX(5px); box-shadow: 0 5px 15px rgba(0,0,0,0.5); border-color: var(--node-color, #888);}
                
                .dm-cat { font-size: 0.7rem; color: var(--node-color, var(--accent-orange)); font-family: var(--font-mono); font-weight: bold; pointer-events: none; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;}
                .dm-title { font-size: 1.05rem; color: white; margin: 0 0 10px 0; font-weight: 900; pointer-events: none; line-height: 1.3;}
                .dm-content { font-size: 0.9rem; color: #bbb; line-height: 1.6; font-family: 'Georgia', serif; display: block; overflow-y: auto; max-height: 400px; padding-right: 5px;}
                .dm-content::-webkit-scrollbar { width: 4px; }
                .dm-content::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; }
                
                .dm-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 15px; padding-top: 15px; border-top: 1px dashed rgba(255,255,255,0.1);}
                .dm-tag { font-size: 0.7rem; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 3px 8px; color: #aaa; font-family: var(--font-mono);}

                /* BOTONES IMPERIALES */
                .btn-inject-seeds { background: linear-gradient(135deg, rgba(0,230,118,0.1), rgba(0,176,255,0.1)); border: 1px solid var(--accent-green); color: white; padding: 12px; border-radius: 8px; font-weight: 900; cursor: pointer; font-size: 0.85rem; transition: 0.3s; width: 100%; text-transform: uppercase; letter-spacing: 1px; display: ${isGlobalMode ? 'block' : 'none'}; box-shadow: 0 5px 15px rgba(0,230,118,0.1);}
                .btn-inject-seeds:hover { background: var(--accent-green); color: black; box-shadow: 0 0 20px rgba(0,230,118,0.5); transform: translateY(-2px);}

                /* LIENZO 3D WEBGL */
                .synaptic-3d-container { flex: 1; position: relative; overflow: hidden; background: radial-gradient(circle at center, #111116 0%, #000000 100%); }
                .webgl-target { width: 100%; height: 100%; outline: none; cursor: crosshair;}
                
                /* TOOLTIP 3D */
                .graph-tooltip { position: absolute; background: rgba(10, 10, 15, 0.95); border: 1px solid #555; color: white; padding: 10px 15px; border-radius: 8px; font-family: var(--font-main); font-size: 0.85rem; pointer-events: none; z-index: 100; backdrop-filter: blur(10px); box-shadow: 0 10px 25px rgba(0,0,0,0.8); display: none; transform: translate(-50%, -150%); white-space: nowrap;}
                .graph-tooltip .tt-cat { font-size: 0.65rem; color: var(--accent-blue); font-family: var(--font-mono); text-transform: uppercase; font-weight: bold; margin-bottom: 3px;}
                .graph-tooltip .tt-title { font-weight: 900; font-size: 1rem; }

                /* LOADER */
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
                            ${isGlobalMode ? 'Haz clic en un nodo del universo 3D para viajar hacia él y decodificar su estructura W3C.' : 'Arrastra Memes al espacio para forjar sinapsis gravitacionales con el Agente.'}
                        </div>
                    </div>
                </div>
                <div class="synaptic-3d-container" id="d3DropZone">
                    <div class="loader-3d" id="loader3D">Inicializando Motor WebGL...</div>
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
            this.links.push({ source, target });
        };

        // ==========================================
        // MODO AGENTE (Vista Local)
        // ==========================================
        if (this.agentId) {
            const agentPrompts = allNodes.filter(n => n.targetId === this.agentId || n.roleTarget === this.agentId);
            const relatedMemes = allNodes.filter(n => n.keywords && n.keywords.includes(this.agentId));

            addNode(this.agentId, this.agentId, 'agent', 40, 'var(--accent-blue)', { title: this.agentId, content: "Córtex Central del Agente" });

            agentPrompts.forEach(p => {
                addNode(p.id, 'System Prompt', 'prompt', 20, 'var(--accent-purple)', p);
                addLink(this.agentId, p.id);
            });

            relatedMemes.forEach(m => {
                const isEvergreen = m.category === 'evergreen';
                addNode(m.id, m.title, 'meme', isEvergreen ? 25 : 15, isEvergreen ? '#ffd700' : 'var(--accent-green)', m);
                addLink(this.agentId, m.id);
            });
        } 
        // ==========================================
        // MODO MACRO (El Meta-Grafo Cuántico Universal)
        // ==========================================
        else {
            // 🔥 El Núcleo de la Gravedad
            addNode('core_kernel', 'Antigravity Kernel', 'system', 60, '#ffffff', { title: 'TeamTowers V9 Kernel', category: 'core_os', content: 'Punto Cero del Sistema Operativo de Sinergias. Gobierna la inmutabilidad y la física del espacio semántico.' });

            state.projects.forEach(p => {
                addNode(p.id, p.nombre, 'project', 35, '#00b0ff', { title: p.nombre, category: 'Ecosistema', content: p.presentation || p.prompt || 'Ecosistema Activo' });
                addLink('core_kernel', p.id);

                if(p.roles) {
                    p.roles.forEach(r => {
                        addNode(r.id, r.name, 'role', 20, '#e040fb', { title: r.name, category: 'Rol (Nodo)', content: `Nivel: ${r.levelId}\nFMV: ${r.fmv}€/h\nRiesgo: ${r.multiplier}x` });
                        addLink(p.id, r.id);
                    });
                }

                if(p.vna_flows) {
                    p.vna_flows.forEach(f => {
                        const fId = 'flow_' + f.id;
                        addNode(fId, f.template || 'SOP', 'sop', 15, '#ff9100', { title: f.template, category: 'SOP (Tubería)', content: `Tipo: ${f.tipo}\nHoras Estimadas: ${f.estimatedHours}h` });
                        if (f.to) addLink(f.to, fId); // El SOP orbita alrededor del rol que lo ejecuta
                    });
                }
            });

            allNodes.forEach(m => {
                if (m.type === 'system_state' || m.id === 'global_kernel_state') return;
                
                const isEvergreen = m.category === 'evergreen';
                const color = isEvergreen ? '#ffd700' : (m.category === 'skill' ? '#00e676' : '#888888');
                const mass = isEvergreen ? 25 : 12;

                addNode(m.id, m.title, 'meme', mass, color, m);

                let linked = false;
                
                if (m.projectId && m.projectId !== 'global' && this.nodes.find(n => n.id === m.projectId)) {
                    addLink(m.projectId, m.id);
                    linked = true;
                }

                // Gravedad Cuántica: Auto-linkeado por Tags
                if (m.keywords && Array.isArray(m.keywords)) {
                    m.keywords.forEach(kw => {
                        const targetNode = this.nodes.find(n => n.id === kw || n.name.toLowerCase() === kw.toLowerCase());
                        if (targetNode && targetNode.id !== m.id) {
                            addLink(m.id, targetNode.id);
                            linked = true;
                        }
                    });
                }

                // Atraídos por el Agujero Negro Central si están aislados
                if (!linked && m.projectId === 'global') {
                    addLink('core_kernel', m.id);
                }
            });
        }
    }

    async initWebGLGraph() {
        const canvasInner = this.container.querySelector('#webglCanvasInner');
        const loader = this.container.querySelector('#loader3D');
        const tooltip = this.container.querySelector('#graphTooltip');

        // 🔥 Inyección Antigravity Dinámica del motor 3D-Force-Graph
        await new Promise((resolve, reject) => {
            if (window.ForceGraph3D) return resolve();
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/3d-force-graph';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });

        if (loader) loader.style.display = 'none';

        // Preparar los datos para el motor 3D
        const gData = {
            nodes: this.nodes,
            links: this.links
        };

        this.graph3D = ForceGraph3D()(canvasInner)
            .graphData(gData)
            .nodeLabel('') // Desactivamos el tooltip nativo feo
            .nodeColor(node => node.color)
            .nodeVal(node => node.val) // La "Masa" del nodo (su tamaño gravitacional)
            .linkColor(link => 'rgba(255, 255, 255, 0.15)')
            .linkWidth(1.5)
            .enableNodeDrag(false) // Desactivamos arrastre para mejorar rendimiento y usar clics puros
            .onNodeHover(node => {
                if (node) {
                    canvasInner.style.cursor = 'pointer';
                    tooltip.style.display = 'block';
                    tooltip.innerHTML = `
                        <div class="tt-cat" style="color:${node.color}">${node.rawNode?.category || node.group}</div>
                        <div class="tt-title">${node.name}</div>
                    `;
                } else {
                    canvasInner.style.cursor = 'crosshair';
                    tooltip.style.display = 'none';
                }
            })
            .onNodeClick(node => {
                // 🔥 NAVEGACIÓN TÁCTICA 3D (Fly-To Camera)
                const distance = 150;
                const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

                this.graph3D.cameraPosition(
                    { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, 
                    node, // lookAt ({ x, y, z })
                    2000  // transition duration ms
                );

                this.showNodeDetailsInPalette(node);
            });

        // Actualizamos posición del tooltip personalizado
        this.graph3D.onEngineTick(() => {
            // El DOM no sigue automáticamente las coordenadas 3D, pero podemos simularlo si fuera necesario.
            // Para mantener el rendimiento, el tooltip simplemente seguirá el ratón mediante CSS.
        });

        canvasInner.addEventListener('mousemove', (e) => {
            if (tooltip.style.display === 'block') {
                const rect = canvasInner.getBoundingClientRect();
                tooltip.style.left = `${e.clientX - rect.left}px`;
                tooltip.style.top = `${e.clientY - rect.top}px`;
            }
        });

        // Ajuste de Responsive
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
        
        resultsList.innerHTML = `
            <div style="margin-bottom: 15px;">
                <button id="btnBackSearch" style="background:rgba(255,255,255,0.05); border:1px solid #444; color:#fff; border-radius:8px; cursor:pointer; font-family:var(--font-mono); font-size:0.8rem; padding:10px 15px; width:100%; transition:0.2s; font-weight:bold; letter-spacing:1px; text-transform:uppercase;">&larr; Volver al Rastreador</button>
            </div>
            <div class="draggable-meme" style="--node-color: ${safeColor}; cursor: default;">
                <div class="dm-cat" style="color: ${safeColor};">${m.category || node3D.group}</div>
                <div class="dm-title" style="font-size:1.3rem;">${m.title}</div>
                <div class="dm-content">${(m.content || '').replace(/\\n/g, '<br>')}</div>
                <div class="dm-tags">${tagsHtml}</div>
            </div>
            <div style="margin-top: 15px; text-align:center;">
                <button style="background:transparent; border:1px dashed ${safeColor}; color:${safeColor}; padding:8px 15px; border-radius:8px; font-weight:bold; font-size:0.8rem; cursor:pointer; width:100%; transition:0.2s;" onclick="window.location.href='/v9/paper'">✏️ Editar en Omni-Paper</button>
            </div>
        `;

        const btnBack = resultsList.querySelector('#btnBackSearch');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                resultsList.innerHTML = '<div style="color:#888; font-size:0.85rem; text-align:center; padding:30px; font-style:italic; line-height: 1.5;">Haz clic en un nodo del universo 3D para viajar hacia él y decodificar su estructura W3C.</div>';
                this.container.querySelector('#memeSearchInput').value = '';
                
                // Reiniciar cámara al centro
                this.graph3D.cameraPosition({ x: 0, y: 0, z: 800 }, { x: 0, y: 0, z: 0 }, 2000);
            });
        }
    }

    setupInteractivity() {
        const searchInput = this.container.querySelector('#memeSearchInput');
        const resultsList = this.container.querySelector('#memeResultsList');
        const btnInject = this.container.querySelector('#btnInjectSeeds');

        // 🔥 1. INYECTOR IMPERIAL DE SEMILLAS ANTIGRAVITY
        if (btnInject) {
            btnInject.addEventListener('click', async () => {
                btnInject.disabled = true;
                btnInject.innerText = "⏳ Forjando Big Bang...";
                
                await KB.init();
                
                const antigravitySeeds = [
                    {
                        id: "meme_kernel_gtd_pomodoro", type: "meme", category: "core_os", projectId: "global", targetId: "global",
                        title: "Filosofía de Ejecución: GTD + Pomodoro",
                        content: "La interfaz (UX) del sistema operativo se centra en la acción inmediata (GTD). Toda Work Order en curso debe ejecutarse usando el 'Pomodoro Tracker' del Omni-Paper, que asegura la inyección exacta de la variable 'realHours' en el Ledger para el cálculo inmutable del Slicing Pie.",
                        keywords: ["#kernel_sos", "#gtd", "#pomodoro", "#antigravity"]
                    },
                    {
                        id: "meme_kernel_slicing_pie", type: "meme", category: "core_os", projectId: "global", targetId: "global",
                        title: "Ecuación de Equidad Inmutable (Ledger)",
                        content: "El Ledger de SOS utiliza una implementación estricta del Slicing Pie. La ecuación para la consolidación de bloques es: Slices = realHours * fmv * multiplier. Se requiere una precisión de 3 decimales para evitar fugas de valor. Si realHours es 0.0, el contrato inteligente local hereda 'estimatedHours'.",
                        keywords: ["#kernel_sos", "#slicing_pie", "#equity", "#math"]
                    },
                    {
                        id: "prompt_agent_janitor", type: "prompt_a2a", category: "prompt_a2a", projectId: "global", targetId: "@janitor", roleTarget: "Background Daemon",
                        title: "Misión del Destilador: @janitor",
                        content: "Eres @janitor, el daemon de fondo del Learning Loop. Tu trabajo es leer silenciosamente los Entregables aprobados por los Notarios, destilar las lecciones aprendidas, las mejores prácticas W3C o las optimizaciones de código, y forjarlas como 'Evergreen Memes' en IndexedDB para que los arquitectos no cometan dos veces el mismo error.",
                        keywords: ["#kernel_sos", "@janitor", "#learning_loop"]
                    },
                    {
                        id: "prompt_agent_seny", type: "prompt_a2a", category: "prompt_a2a", projectId: "global", targetId: "@seny_analyst", roleTarget: "Auditor Estratégico",
                        title: "Misión Analítica: @seny_analyst",
                        content: "Eres @seny_analyst. El guardián del Bucle Imperial. Tu función es aplicar el Value Network Analysis (VNA) al grafo de proyectos. Analiza los roles, las dependencias y los saltos jerárquicos de las Work Orders. Si detectas redundancias o sobrecostes en tokens/horas, emite alertas rojas para optimizar la red.",
                        keywords: ["#kernel_sos", "@seny_analyst", "#vna_audit"]
                    }
                ];

                for (const seed of antigravitySeeds) {
                    await KB.saveNode(seed);
                }

                alert("✅ Big Bang completado. Semillas Antigravity inyectadas en la Red Neuronal 3D.");
                btnInject.style.display = 'none';
                
                // Recargar el Grafo 3D
                await this.loadInitialData();
                this.graph3D.graphData({ nodes: this.nodes, links: this.links });
            });
        }

        // 2. Rastreador Cuántico (Buscador)
        searchInput.addEventListener('keyup', async (e) => {
            const term = e.target.value.toLowerCase().trim();
            if (term.length < 2) return resultsList.innerHTML = '<div style="color:#666; text-align:center; padding:30px; font-style:italic;">Buscando en la inmensidad...</div>';
            
            await KB.init();
            const allMemes = await KB.getAllNodes(); 
            const filtered = allMemes.filter(m => m.title?.toLowerCase().includes(term) || m.category?.toLowerCase().includes(term) || (m.keywords && m.keywords.some(k => k.toLowerCase().includes(term))));
            
            if (filtered.length === 0) return resultsList.innerHTML = '<div style="color:#888; text-align:center; padding:30px;">No se encontró ninguna señal con esa frecuencia.</div>';

            resultsList.innerHTML = filtered.slice(0, 15).map(m => {
                return `
                    <div class="draggable-meme" data-id="${m.id}" style="--node-color: var(--accent-blue);">
                        <div class="dm-cat">${m.category || m.type}</div>
                        <div class="dm-title">${m.title}</div>
                        <div style="font-size:0.8rem; color:#888; font-style:italic; margin-top:5px;">(Clic para fijar coordenadas)</div>
                    </div>
                `;
            }).join('');

            // Al hacer clic en un resultado de la búsqueda, la cámara vuela hacia el nodo 3D
            resultsList.querySelectorAll('.draggable-meme').forEach(el => {
                el.addEventListener('click', () => {
                    const targetId = el.dataset.id;
                    const targetNode = this.nodes.find(n => n.id === targetId);
                    if (targetNode && this.graph3D) {
                        const distance = 120;
                        const distRatio = 1 + distance/Math.hypot(targetNode.x, targetNode.y, targetNode.z);
                        this.graph3D.cameraPosition(
                            { x: targetNode.x * distRatio, y: targetNode.y * distRatio, z: targetNode.z * distRatio },
                            targetNode,
                            1500
                        );
                        this.showNodeDetailsInPalette(targetNode);
                    }
                });
            });
        });
    }

    // Limpieza al desmontar la vista
    destroy() {
        if (this.resizeObserver) this.resizeObserver.disconnect();
        if (this.graph3D) this.graph3D._destructor();
    }
}
