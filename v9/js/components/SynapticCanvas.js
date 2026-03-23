// v9/js/components/SynapticCanvas.js
import { KB } from '../core/kb.js';
import { store } from '../core/store.js';

export class SynapticCanvas {
    constructor(containerEl, agentId = null) {
        this.container = containerEl;
        this.agentId = agentId; 
        this.nodes = [];
        this.links = [];
        this.simulation = null;
        this.d3 = null;
    }

    async render() {
        const isGlobalMode = !this.agentId;
        const panelTitle = isGlobalMode ? '🌌 Meta-Grafo del Kernel' : `🧠 Cerebro de ${this.agentId}`;

        this.container.innerHTML = `
            <style>
                .synaptic-layout { display: flex; width: 100%; height: 100%; background: #050508; border-radius: 20px; overflow: hidden; border: 1px solid var(--glass-border); box-shadow: inset 0 0 50px rgba(0,0,0,0.8);}
                
                /* PALETA LATERAL (BUSCADOR Y LECTURA) */
                .synaptic-palette { width: 320px; background: rgba(10,10,15,0.95); border-right: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; z-index: 10; backdrop-filter: blur(10px);}
                .palette-header { padding: 15px; border-bottom: 1px solid #333; display:flex; flex-direction:column; gap:10px;}
                .palette-title { color: white; font-weight: 900; font-size: 1.1rem; margin: 0;}
                .palette-search { width: 100%; background: #000; border: 1px solid #444; color: var(--accent-green); padding: 10px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.85rem; outline: none; box-sizing: border-box; transition: 0.3s;}
                .palette-search:focus { border-color: var(--accent-green); box-shadow: inset 0 0 10px rgba(0,230,118,0.2);}
                
                .meme-results { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px;}
                
                /* TARJETAS DE MEMES Y LECTURA */
                .draggable-meme { background: rgba(255,255,255,0.02); border: 1px dashed #555; padding: 12px; border-radius: 8px; cursor: pointer; transition: 0.2s; user-select: none; word-break: break-word;}
                .draggable-meme.can-drag { cursor: grab; border-color: var(--accent-purple); }
                .draggable-meme.can-drag:active { cursor: grabbing; border-style: solid; background: var(--accent-purple); color: white;}
                .draggable-meme:hover { background: rgba(255,255,255,0.05); transform: translateX(3px); }
                
                .dm-cat { font-size: 0.65rem; color: var(--accent-orange); font-family: monospace; font-weight: bold; pointer-events: none; text-transform: uppercase;}
                .dm-title { font-size: 0.95rem; color: white; margin: 5px 0; font-weight: bold; pointer-events: none; line-height: 1.3;}
                .dm-content { font-size: 0.85rem; color: #ccc; line-height: 1.5; font-family: 'Georgia', serif; display: block; overflow-y: auto; max-height: 400px; padding-right: 5px; margin-top: 10px;}
                .dm-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #444;}
                .dm-tag { font-size: 0.65rem; background: rgba(0,0,0,0.5); border-radius: 4px; padding: 2px 6px; color: #888;}

                .btn-inject-seeds { background: linear-gradient(135deg, rgba(0,230,118,0.1), rgba(0,176,255,0.1)); border: 1px solid var(--accent-green); color: white; padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.85rem; transition: 0.3s; width: 100%; text-transform: uppercase; letter-spacing: 1px; display: ${isGlobalMode ? 'block' : 'none'};}
                .btn-inject-seeds:hover { background: var(--accent-green); color: black; box-shadow: 0 0 15px rgba(0,230,118,0.4);}

                /* LIENZO D3 (EL CEREBRO) */
                .synaptic-d3 { flex: 1; position: relative; overflow: hidden; touch-action: none; /* Previene scroll nativo en iPad */ }
                .d3-target { width: 100%; height: 100%; outline: none; }
                
                .drop-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(224,64,251,0.1); border: 3px dashed var(--accent-purple); box-sizing: border-box; display: none; justify-content: center; align-items: center; color: var(--accent-purple); font-weight: 900; font-size: 1.5rem; pointer-events: none; z-index: 5;}
                .synaptic-d3.drag-over .drop-overlay { display: flex; }
                
                .node-circle { transition: filter 0.3s, transform 0.2s; stroke: #111; stroke-width: 2px; cursor: pointer;}
                .node-circle:hover { filter: brightness(1.3); stroke: white; }
                .node-circle.selected { stroke: var(--accent-blue); stroke-width: 4px; filter: brightness(1.5); }
                .node-text { font-family: var(--font-mono); font-size: 10px; fill: white; pointer-events: none; font-weight: bold; text-shadow: 0 2px 5px black, 0 0 10px black;}
                .link-line { stroke: rgba(255,255,255,0.1); stroke-width: 1.5px; transition: stroke 0.3s; }
                .link-line:hover { stroke: var(--accent-blue); stroke-width: 3px; }

                @media (max-width: 768px) {
                    .synaptic-layout { flex-direction: column-reverse; }
                    .synaptic-palette { width: 100%; height: 40%; border-right: none; border-top: 1px solid #333; }
                    .synaptic-d3 { height: 60%; }
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
                        <div style="color:#666; font-size:0.8rem; text-align:center; padding:20px; font-style:italic;">
                            ${isGlobalMode ? 'Haz tap/clic en un nodo del mapa para inspeccionar su código W3C.' : 'Arrastra Memes al mapa para forjar sinapsis con el Agente.'}
                        </div>
                    </div>
                </div>
                <div class="synaptic-d3" id="d3DropZone">
                    <div class="drop-overlay">⚡ SUELTA PARA FORJAR SINAPSIS ⚡</div>
                    <div class="d3-target" id="d3CanvasInner"></div>
                </div>
            </div>
        `;

        await this.loadInitialData();
        
        try {
            const d3Module = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
            this.d3 = d3Module.default || d3Module;
            this.initD3();
            this.setupInteractivity();
        } catch (e) {
            this.container.innerHTML = `<div style="color:var(--accent-red); padding:2rem;">⚠️ Fallo cargando motor gráfico (D3.js). Revisa tu conexión.</div>`;
            console.error("D3 Load Error:", e);
        }
    }

    async loadInitialData() {
        await KB.init();
        const allNodes = await KB.getAllNodes();
        const state = store.getState();

        this.nodes = [];
        this.links = [];

        // ==========================================
        // MODO AGENTE (Edición de Cerebro Individual)
        // ==========================================
        if (this.agentId) {
            const agentPrompts = allNodes.filter(n => n.targetId === this.agentId || n.roleTarget === this.agentId);
            const relatedMemes = allNodes.filter(n => n.keywords && n.keywords.includes(this.agentId));

            this.nodes.push({ id: this.agentId, name: this.agentId, group: 'agent', radius: 35, color: 'var(--accent-blue)', rawNode: { title: this.agentId, content: "Nodo Raíz del Agente" } });

            agentPrompts.forEach((p) => {
                this.nodes.push({ id: p.id, name: 'System Prompt', group: 'prompt', radius: 20, color: 'var(--accent-purple)', rawNode: p });
                this.links.push({ source: this.agentId, target: p.id });
            });

            relatedMemes.forEach(m => {
                const isEvergreen = m.category === 'evergreen';
                this.nodes.push({ id: m.id, name: m.title.substring(0,15)+'...', group: 'meme', radius: isEvergreen ? 25 : 18, color: isEvergreen ? '#ffd700' : 'var(--accent-green)', rawNode: m });
                this.links.push({ source: this.agentId, target: m.id });
            });
        } 
        // ==========================================
        // MODO MACRO (El Meta-Grafo Universal Interconectado)
        // ==========================================
        else {
            // 🔥 NODO CENTRAL (El Sol del Universo Antigravity)
            this.nodes.push({ 
                id: 'core_kernel', name: 'Antigravity Kernel', group: 'system', radius: 45, color: '#ffffff', 
                rawNode: { title: 'TeamTowers V9 Kernel', category: 'core_os', content: 'Núcleo central del Sistema Operativo de Sinergias. Gobierna el Ledger, la inmutabilidad de los datos y el enrutamiento P2P.' } 
            });

            // 1. Añadimos Proyectos y los conectamos al Kernel
            state.projects.forEach(p => {
                this.nodes.push({ id: p.id, name: p.nombre, group: 'project', radius: 30, color: 'var(--accent-blue)', rawNode: { title: p.nombre, category: 'project_core', content: p.presentation || p.prompt || 'Ecosistema Activo' } });
                this.links.push({ source: 'core_kernel', target: p.id });

                // 2. Añadimos Roles asociados al proyecto
                if(p.roles) {
                    p.roles.forEach(r => {
                        this.nodes.push({ id: r.id, name: r.name, group: 'role', radius: 20, color: 'var(--accent-purple)', rawNode: { title: r.name, category: 'role', content: `Nivel Jerárquico: ${r.levelId}\\nValor de Mercado (FMV): ${r.fmv}€/h\\nMultiplicador de Riesgo: ${r.multiplier}x` } });
                        this.links.push({ source: p.id, target: r.id });
                    });
                }

                // 3. Añadimos Tuberías (SOPs teóricos)
                if(p.vna_flows) {
                    p.vna_flows.forEach(f => {
                        const fId = 'flow_' + f.id;
                        this.nodes.push({ id: fId, name: (f.template||'').substring(0,10)+'...', group: 'sop', radius: 15, color: 'var(--accent-orange)', rawNode: { title: f.template, category: 'SOP', content: `Tipo de Valor: ${f.tipo}\\nHoras Estimadas: ${f.estimatedHours}h` } });
                        if (f.to) this.links.push({ source: f.to, target: fId });
                    });
                }
            });

            // 4. Añadimos Conocimiento W3C y Auto-Link Semántico
            allNodes.forEach(m => {
                if (m.type === 'system_state' || m.id === 'global_kernel_state') return;
                
                const isEvergreen = m.category === 'evergreen';
                const color = isEvergreen ? '#ffd700' : (m.category === 'skill' ? 'var(--accent-green)' : '#888');
                const radius = isEvergreen ? 22 : 12;

                if (!this.nodes.find(n => n.id === m.id)) {
                    this.nodes.push({ id: m.id, name: (m.title||'').substring(0,12)+'...', group: 'meme', radius: radius, color: color, rawNode: m });
                }

                let linked = false;
                
                // Conexión Directa al Proyecto
                if (m.projectId && m.projectId !== 'global' && this.nodes.find(n => n.id === m.projectId)) {
                    this.links.push({ source: m.projectId, target: m.id });
                    linked = true;
                }

                // 🔥 Conexión Inteligente por Keywords (Si un tag coincide con un nodo, se enlazan)
                if (m.keywords && Array.isArray(m.keywords)) {
                    m.keywords.forEach(kw => {
                        const targetNode = this.nodes.find(n => n.id === kw || n.name.toLowerCase() === kw.toLowerCase());
                        if (targetNode && targetNode.id !== m.id) {
                            this.links.push({ source: m.id, target: targetNode.id });
                            linked = true;
                        }
                    });
                }

                // Si un meme global (ej: GTD, Pomodoro) no se ha conectado a nada, lo anclamos al Kernel para que no sea Polvo Espacial
                if (!linked && m.projectId === 'global') {
                    this.links.push({ source: 'core_kernel', target: m.id });
                }
            });
        }
    }

    initD3() {
        const canvas = this.container.querySelector('#d3CanvasInner');
        const width = canvas.clientWidth || 800;
        const height = canvas.clientHeight || 600;

        // Soporte de Zoom Universal
        this.zoomObj = this.d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (e) => {
                this.svgGroup.attr("transform", e.transform);
            });

        this.svg = this.d3.select(canvas).append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", [0, 0, width, height])
            .call(this.zoomObj);

        this.svgGroup = this.svg.append("g");

        const linkDistance = this.agentId ? 120 : 90;
        const chargeStrength = this.agentId ? -400 : -250;

        this.simulation = this.d3.forceSimulation(this.nodes)
            .force("link", this.d3.forceLink(this.links).id(d => d.id).distance(linkDistance))
            .force("charge", this.d3.forceManyBody().strength(chargeStrength))
            .force("center", this.d3.forceCenter(width / 2, height / 2))
            .force("collide", this.d3.forceCollide().radius(d => d.radius + 10).iterations(2));

        this.renderGraphElements();
    }

    renderGraphElements() {
        const g = this.svgGroup;
        g.selectAll("*").remove(); 

        this.linkElements = g.append("g")
            .selectAll("line")
            .data(this.links)
            .join("line")
            .attr("class", "link-line");

        this.nodeElements = g.append("g")
            .selectAll("circle")
            .data(this.nodes)
            .join("circle")
            .attr("class", "node-circle")
            .attr("r", d => d.radius)
            .attr("fill", d => d.color)
            .call(this.dragD3());

        this.textElements = g.append("g")
            .selectAll("text")
            .data(this.nodes)
            .join("text")
            .attr("class", "node-text")
            .attr("text-anchor", "middle")
            .attr("dy", d => d.radius + 12)
            .text(d => d.name);

        // 🔥 FIX: EVENTO CLICK UNIVERSAL (Soporta iPad, Móvil y PC previniendo colisión con el Drag)
        this.nodeElements.on("click", (event, d) => {
            if (event.defaultPrevented) return; // Se ignorará si se desencadenó al final de un arrastre (Drag)
            
            // Iluminación visual del nodo seleccionado
            this.nodeElements.classed("selected", n => n.id === d.id);
            
            // Zoom inmersivo hacia el nodo clickado
            const canvas = this.container.querySelector('#d3CanvasInner');
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            
            this.svg.transition().duration(750).call(
                this.zoomObj.transform, 
                this.d3.zoomIdentity.translate(width / 2, height / 2).scale(1.5).translate(-d.x, -d.y)
            );

            this.showNodeDetailsInPalette(d);
        });

        this.simulation.on("tick", () => {
            this.linkElements
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            
            this.nodeElements
                .attr("cx", d => Math.max(d.radius, Math.min(3000, d.x)))
                .attr("cy", d => Math.max(d.radius, Math.min(3000, d.y)));
            
            this.textElements
                .attr("x", d => Math.max(d.radius, Math.min(3000, d.x)))
                .attr("y", d => Math.max(d.radius, Math.min(3000, d.y)));
        });
    }

    dragD3() {
        return this.d3.drag()
            .on("start", (event, d) => { 
                if (!event.active) this.simulation.alphaTarget(0.3).restart(); 
                d.fx = d.x; d.fy = d.y; 
            })
            .on("drag", (event, d) => { 
                d.fx = event.x; d.fy = event.y; 
            })
            .on("end", (event, d) => { 
                if (!event.active) this.simulation.alphaTarget(0); 
                d.fx = null; d.fy = null; 
            });
    }

    showNodeDetailsInPalette(d3Node) {
        const resultsList = this.container.querySelector('#memeResultsList');
        const m = d3Node.rawNode;
        if (!m) return;

        const tagsHtml = (m.keywords || []).map(t => `<span class="dm-tag">#${t}</span>`).join('');
        
        resultsList.innerHTML = `
            <div style="margin-bottom: 15px;">
                <button id="btnBackSearch" style="background:rgba(255,255,255,0.05); border:1px solid #444; color:#fff; border-radius:8px; cursor:pointer; font-family:var(--font-mono); font-size:0.8rem; padding:8px 12px; width:100%; transition:0.2s;">&larr; Volver al Explorador</button>
            </div>
            <div class="draggable-meme" style="border-color: ${d3Node.color}; cursor: default;">
                <div class="dm-cat" style="color: ${d3Node.color};">${m.category || d3Node.group}</div>
                <div class="dm-title" style="font-size:1.2rem; pointer-events:auto;">${m.title}</div>
                <div class="dm-content">${(m.content || '').replace(/\\n/g, '<br>')}</div>
                <div class="dm-tags">${tagsHtml}</div>
            </div>
            ${this.agentId ? `<div style="text-align:center; color:#888; font-size:0.75rem; margin-top:10px;">Arrastra memes desde la búsqueda para conectarlos.</div>` : ''}
        `;

        const btnBack = resultsList.querySelector('#btnBackSearch');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                this.nodeElements.classed("selected", false); // Quita la iluminación
                resultsList.innerHTML = '<div style="color:#666; font-size:0.8rem; text-align:center; padding:20px; font-style:italic;">Escribe arriba para buscar conocimiento o haz tap en un nodo.</div>';
                this.container.querySelector('#memeSearchInput').value = '';
            });
        }
    }

    setupInteractivity() {
        const searchInput = this.container.querySelector('#memeSearchInput');
        const resultsList = this.container.querySelector('#memeResultsList');
        const dropZone = this.container.querySelector('#d3DropZone');
        const btnInject = this.container.querySelector('#btnInjectSeeds');

        // 🔥 1. INYECTOR IMPERIAL DE SEMILLAS ANTIGRAVITY
        if (btnInject) {
            btnInject.addEventListener('click', async () => {
                btnInject.disabled = true;
                btnInject.innerText = "⏳ Inyectando Códigos Fundacionales...";
                
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

                alert("✅ Semillas Antigravity inyectadas en la Red Neuronal Local.");
                btnInject.style.display = 'none';
                
                this.loadInitialData().then(() => {
                    this.simulation.nodes(this.nodes);
                    this.simulation.force("link").links(this.links);
                    this.renderGraphElements();
                    this.simulation.alpha(0.5).restart();
                });
            });
        }

        // 2. Buscador de Memes
        searchInput.addEventListener('keyup', async (e) => {
            const term = e.target.value.toLowerCase().trim();
            if (term.length < 2) return resultsList.innerHTML = '<div style="color:#666; text-align:center; padding:20px;">Escribe más...</div>';
            
            await KB.init();
            const allMemes = await KB.getAllNodes(); 
            const filtered = allMemes.filter(m => m.title?.toLowerCase().includes(term) || m.category?.toLowerCase().includes(term) || (m.keywords && m.keywords.some(k => k.toLowerCase().includes(term))));
            
            if (filtered.length === 0) return resultsList.innerHTML = '<div style="color:#888; text-align:center; padding:20px;">No hay conocimiento para esa query.</div>';

            resultsList.innerHTML = filtered.slice(0, 15).map(m => {
                const canDrag = this.agentId ? 'can-drag' : '';
                return `
                    <div class="draggable-meme ${canDrag}" ${this.agentId ? 'draggable="true"' : ''} data-id="${m.id}">
                        <div class="dm-cat">${m.category || m.type}</div>
                        <div class="dm-title">${m.title}</div>
                    </div>
                `;
            }).join('');

            // DRAG START (Solo Modo Agente)
            if (this.agentId) {
                resultsList.querySelectorAll('.draggable-meme.can-drag').forEach(el => {
                    el.addEventListener('dragstart', (dragEvent) => {
                        dragEvent.dataTransfer.setData('text/plain', el.dataset.id);
                    });
                });
            } else {
                // Modo Macro: Clic en buscador centra la cámara en el nodo y abre el panel
                resultsList.querySelectorAll('.draggable-meme').forEach(el => {
                    el.addEventListener('click', () => {
                        const targetId = el.dataset.id;
                        const targetNode = this.nodes.find(n => n.id === targetId);
                        if (targetNode) {
                            const canvas = this.container.querySelector('#d3CanvasInner');
                            this.svg.transition().duration(750).call(
                                this.zoomObj.transform, 
                                this.d3.zoomIdentity.translate(canvas.clientWidth / 2, canvas.clientHeight / 2).scale(1.5).translate(-targetNode.x, -targetNode.y)
                            );
                            this.nodeElements.classed("selected", d => d.id === targetId);
                            this.showNodeDetailsInPalette(targetNode);
                        }
                    });
                });
            }
        });

        // 3. Drop Zone (Solo Modo Agente)
        if (this.agentId) {
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault(); 
                dropZone.classList.add('drag-over');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('drag-over');
            });

            dropZone.addEventListener('drop', async (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                
                const memeId = e.dataTransfer.getData('text/plain');
                if (!memeId) return;
                if (this.nodes.find(n => n.id === memeId)) return;

                await KB.init();
                const memeData = await KB.getNode(memeId);
                if (!memeData) return;

                memeData.keywords = memeData.keywords || [];
                if (!memeData.keywords.includes(this.agentId)) {
                    memeData.keywords.push(this.agentId);
                    await KB.saveNode(memeData);
                }

                this.nodes.push({ id: memeData.id, name: memeData.title.substring(0,12)+'...', rawNode: memeData, group: 'meme', radius: 25, color: 'var(--accent-green)' });
                this.links.push({ source: this.agentId, target: memeData.id });
                
                this.simulation.nodes(this.nodes);
                this.simulation.force("link").links(this.links);
                this.renderGraphElements();
                this.simulation.alpha(0.5).restart();

                window.dispatchEvent(new CustomEvent('synapse-forged', { detail: { agentId: this.agentId } }));
            });
        }
    }
}
