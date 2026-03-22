// v8/js/components/SynapticCanvas.js
import { KB } from '../core/kb.js';

export class SynapticCanvas {
    constructor(containerEl, agentId) {
        this.container = containerEl;
        this.agentId = agentId;
        this.nodes = [];
        this.links = [];
        this.simulation = null;
        this.d3 = null;
    }

    async render() {
        this.container.innerHTML = `
            <style>
                .synaptic-layout { display: flex; width: 100%; height: 100%; background: #050508; border-radius: 20px; overflow: hidden; }
                
                /* PALETA LATERAL (BUSCADOR DE MEMES) */
                .synaptic-palette { width: 280px; background: rgba(10,10,15,0.9); border-right: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; z-index: 10;}
                .palette-header { padding: 15px; border-bottom: 1px dashed #333;}
                .palette-search { width: 100%; background: #000; border: 1px solid #444; color: var(--accent-green); padding: 10px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.85rem; outline: none; box-sizing: border-box; transition: 0.3s;}
                .palette-search:focus { border-color: var(--accent-green); box-shadow: inset 0 0 10px rgba(0,230,118,0.2);}
                
                .meme-results { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 8px;}
                .draggable-meme { background: rgba(255,255,255,0.03); border: 1px dashed var(--accent-purple); padding: 10px; border-radius: 8px; cursor: grab; transition: 0.2s; user-select: none;}
                .draggable-meme:hover { background: rgba(224,64,251,0.1); transform: translateX(3px); }
                .draggable-meme:active { cursor: grabbing; border-style: solid; background: var(--accent-purple); color: white;}
                .dm-cat { font-size: 0.65rem; color: var(--accent-orange); font-family: monospace; font-weight: bold; pointer-events: none;}
                .dm-title { font-size: 0.85rem; color: white; margin: 3px 0 0 0; font-weight: bold; pointer-events: none;}

                /* LIENZO D3 (EL CEREBRO) */
                .synaptic-d3 { flex: 1; position: relative; }
                .d3-target { width: 100%; height: 100%; outline: none; }
                .drop-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,230,118,0.1); border: 3px dashed var(--accent-green); box-sizing: border-box; display: none; justify-content: center; align-items: center; color: var(--accent-green); font-weight: 900; font-size: 1.5rem; pointer-events: none;}
                .synaptic-d3.drag-over .drop-overlay { display: flex; }
                
                .node-circle { transition: filter 0.3s; stroke: #333; stroke-width: 2px; cursor: pointer;}
                .node-circle:hover { filter: brightness(1.3); stroke: white; }
                .node-text { font-family: monospace; font-size: 10px; fill: white; pointer-events: none; font-weight: bold; text-shadow: 0 2px 4px black;}
                .link-line { stroke: rgba(255,255,255,0.15); stroke-width: 2px; }
            </style>

            <div class="synaptic-layout">
                <div class="synaptic-palette">
                    <div class="palette-header">
                        <input type="text" id="memeSearchInput" class="palette-search" placeholder="🔍 Buscar Conocimiento...">
                    </div>
                    <div class="meme-results" id="memeResultsList">
                        <div style="color:#666; font-size:0.8rem; text-align:center; padding:20px; font-style:italic;">Escribe para buscar Memes W3C en el LMS.</div>
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
            this.container.innerHTML = `<div style="color:var(--accent-red); padding:2rem;">⚠️ Fallo cargando motor gráfico (D3.js). Estás offline.</div>`;
        }
    }

    async loadInitialData() {
        await KB.init();
        const allNodes = await KB.getAllNodes();
        
        // Cargar Memes conectados al Agente
        const agentPrompts = allNodes.filter(n => n.targetId === this.agentId || n.roleTarget === this.agentId);
        const relatedMemes = allNodes.filter(n => n.keywords && n.keywords.includes(this.agentId));

        this.nodes = [{ id: this.agentId, name: this.agentId, group: 'agent', radius: 35, color: 'var(--accent-blue)' }];
        this.links = [];

        agentPrompts.forEach((p, i) => {
            const nId = p.id;
            this.nodes.push({ id: nId, name: 'Core Prompt', group: 'prompt', radius: 15, color: 'var(--accent-purple)' });
            this.links.push({ source: this.agentId, target: nId });
        });

        relatedMemes.forEach(m => {
            this.nodes.push({ id: m.id, name: m.title.substring(0,12)+'...', rawNode: m, group: 'meme', radius: 25, color: 'var(--accent-green)' });
            this.links.push({ source: this.agentId, target: m.id });
        });
    }

    initD3() {
        const canvas = this.container.querySelector('#d3CanvasInner');
        const width = canvas.clientWidth || 600;
        const height = canvas.clientHeight || 400;

        this.svg = this.d3.select(canvas).append("svg")
            .attr("width", "100%").attr("height", "100%")
            .attr("viewBox", [0, 0, width, height]);

        this.simulation = this.d3.forceSimulation(this.nodes)
            .force("link", this.d3.forceLink(this.links).id(d => d.id).distance(120))
            .force("charge", this.d3.forceManyBody().strength(-400))
            .force("center", this.d3.forceCenter(width / 2, height / 2))
            .force("collide", this.d3.forceCollide().radius(d => d.radius + 15));

        this.renderGraph();
    }

    renderGraph() {
        const g = this.svg;
        g.selectAll("*").remove(); // Limpiar y repintar (para actualizaciones dinámicas)

        const link = g.append("g").selectAll("line").data(this.links).join("line")
            .attr("class", "link-line");

        const node = g.append("g").selectAll("circle").data(this.nodes).join("circle")
            .attr("class", "node-circle")
            .attr("r", d => d.radius)
            .attr("fill", d => d.color)
            .call(this.dragD3());

        const text = g.append("g").selectAll("text").data(this.nodes).join("text")
            .attr("class", "node-text")
            .attr("text-anchor", "middle")
            .attr("dy", d => d.radius + 15)
            .text(d => d.name);

        // 🔥 EXPANSIÓN FRACTAL: Al hacer clic en un Meme, busca sus SOPs/SOCs anidados
        node.on("click", async (event, d) => {
            if (d.group !== 'meme') return;
            await KB.init();
            const allNodes = await KB.getAllNodes();
            // Buscar hijos (SOPs/SOCs que digan que este meme es su 'broader')
            const children = allNodes.filter(n => n.broader === d.id);
            
            if (children.length > 0) {
                let changed = false;
                children.forEach(child => {
                    if (!this.nodes.find(n => n.id === child.id)) {
                        this.nodes.push({ id: child.id, name: child.title.substring(0,10)+'...', rawNode: child, group: 'child', radius: 15, color: 'var(--accent-orange)' });
                        this.links.push({ source: d.id, target: child.id });
                        changed = true;
                    }
                });
                if (changed) {
                    this.simulation.nodes(this.nodes);
                    this.simulation.force("link").links(this.links);
                    this.renderGraph();
                    this.simulation.alpha(0.5).restart();
                }
            }
        });

        this.simulation.on("tick", () => {
            link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
            node.attr("cx", d => d.x).attr("cy", d => d.y);
            text.attr("x", d => d.x).attr("y", d => d.y);
        });
    }

    dragD3() {
        return this.d3.drag()
            .on("start", (event, d) => { if (!event.active) this.simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
            .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
            .on("end", (event, d) => { if (!event.active) this.simulation.alphaTarget(0); d.fx = null; d.fy = null; });
    }

    setupInteractivity() {
        const searchInput = this.container.querySelector('#memeSearchInput');
        const resultsList = this.container.querySelector('#memeResultsList');
        const dropZone = this.container.querySelector('#d3DropZone');

        // 1. Buscador de Memes
        searchInput.addEventListener('keyup', async (e) => {
            const term = e.target.value.toLowerCase().trim();
            if (term.length < 2) return resultsList.innerHTML = '<div style="color:#666; text-align:center; padding:20px;">Escribe más...</div>';
            
            await KB.init();
            const allMemes = await KB.getAllNodes({ type: 'meme' });
            const filtered = allMemes.filter(m => m.title.toLowerCase().includes(term) || (m.category && m.category.toLowerCase().includes(term)));
            
            if (filtered.length === 0) return resultsList.innerHTML = '<div style="color:#888; text-align:center; padding:20px;">No hay conocimiento para esa red.</div>';

            resultsList.innerHTML = filtered.slice(0, 15).map(m => `
                <div class="draggable-meme" draggable="true" data-id="${m.id}">
                    <div class="dm-cat">${m.category || 'MEME'}</div>
                    <div class="dm-title">${m.title}</div>
                </div>
            `).join('');

            // DRAG START
            resultsList.querySelectorAll('.draggable-meme').forEach(el => {
                el.addEventListener('dragstart', (dragEvent) => {
                    dragEvent.dataTransfer.setData('text/plain', el.dataset.id);
                });
            });
        });

        // 2. Lógica del Drop Zone (D3 Canvas)
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necesario para permitir el drop
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', (e) => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', async (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            const memeId = e.dataTransfer.getData('text/plain');
            if (!memeId) return;

            // Evitar duplicados visuales
            if (this.nodes.find(n => n.id === memeId)) return;

            await KB.init();
            const memeData = await KB.getNode(memeId);
            if (!memeData) return;

            // 🔥 MAGIA: Actualizamos la Base de Datos (Sinapsis Forjada)
            memeData.keywords = memeData.keywords || [];
            if (!memeData.keywords.includes(this.agentId)) {
                memeData.keywords.push(this.agentId);
                await KB.saveNode(memeData);
            }

            // Actualizamos el gráfico D3 en vivo
            this.nodes.push({ id: memeData.id, name: memeData.title.substring(0,12)+'...', rawNode: memeData, group: 'meme', radius: 25, color: 'var(--accent-green)' });
            this.links.push({ source: this.agentId, target: memeData.id });
            
            this.simulation.nodes(this.nodes);
            this.simulation.force("link").links(this.links);
            this.renderGraph();
            this.simulation.alpha(0.5).restart();

            // Emitimos evento para que AgentEditorView actualice la caja verde de Context Prompt
            window.dispatchEvent(new CustomEvent('synapse-forged', { detail: { agentId: this.agentId } }));
        });
    }
}
