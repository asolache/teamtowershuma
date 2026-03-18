// v8/js/components/SandboxRenderer.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';

export class SandboxRenderer {
    constructor(containerEl, options = {}) {
        this.container = containerEl;
        this.options = Object.assign({
            width: 800,
            height: 500
        }, options);
        
        this.nodes = [];
        this.links = [];
        
        // La Ontología Maestra
        this.PANTHEON = [
            { id: 'zeus', name: 'Zeus', domain: 'Corporativo/Gobernanza', icon: '👑', color: '#FFD700' },
            { id: 'apollo', name: 'Apol·lo', domain: 'Academia/I+D', icon: '🦉', color: '#00B0FF' },
            { id: 'athena', name: 'Atenea', domain: 'Ciberseguridad/Estrategia', icon: '🛡️', color: '#4CAF50' },
            { id: 'hestia', name: 'Hestia', domain: 'RRHH/Comunidad', icon: '🔥', color: '#FF9100' },
            { id: 'hermes', name: 'Hermes', domain: 'Marketing/Growth', icon: '⚡', color: '#E040FB' },
            { id: 'aphrodite', name: 'Afrodita', domain: 'UX/Diseño/Branding', icon: '✨', color: '#FF4081' },
            { id: 'hephaestus', name: 'Hefest', domain: 'Ingeniería/Fabricación', icon: '🔨', color: '#795548' },
            { id: 'demeter', name: 'Demèter', domain: 'Franquicias/Sostenibilidad', icon: '🌱', color: '#8BC34A' },
            { id: 'dionysus', name: 'Dionís', domain: 'Entretenimiento/Gaming', icon: '🎭', color: '#9C27B0' },
            { id: 'poseidon', name: 'Posidó', domain: 'Disrupción/Web3', icon: '🌊', color: '#00BCD4' },
            { id: 'hera', name: 'Hera', domain: 'B2B/Partnerships', icon: '🤝', color: '#3F51B5' },
            { id: 'hebe', name: 'Hebe', domain: 'DevOps/Operaciones', icon: '⚙️', color: '#607D8B' }
        ];
    }

    static getStyles() {
        return `
            .sandbox-widget { width: 100%; border: 1px dashed var(--accent-purple); border-radius: 16px; background: radial-gradient(circle at center, #111116 0%, #050505 100%); overflow: hidden; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.5);}
            .sandbox-header { background: rgba(224, 64, 251, 0.1); border-bottom: 1px solid rgba(224, 64, 251, 0.2); padding: 10px 15px; display: flex; justify-content: space-between; align-items: center;}
            .sandbox-title { font-family: var(--font-mono); font-size: 0.85rem; color: var(--accent-purple); font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0;}
            
            .sandbox-canvas { width: 100%; height: 500px; cursor: grab; outline: none; }
            .sandbox-canvas:active { cursor: grabbing; }
            
            .node-circle { transition: all 0.3s; stroke: #333; stroke-width: 2px;}
            .node-circle:hover { filter: brightness(1.2); stroke: white; }
            .node-text { font-family: var(--font-main); font-size: 12px; fill: white; pointer-events: none; font-weight: bold;}
            .node-icon { font-size: 18px; pointer-events: none; }
            .link-line { stroke: rgba(255,255,255,0.1); stroke-width: 1.5px; }

            /* PANEL LATERAL DE INSPECCIÓN */
            .sandbox-inspector { position: absolute; top: 50px; right: 0; width: 320px; height: calc(100% - 50px); background: rgba(10,10,15,0.95); border-left: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); display: flex; flex-direction: column; box-sizing: border-box; z-index: 10;}
            .sandbox-inspector.open { transform: translateX(0); box-shadow: -10px 0 30px rgba(0,0,0,0.5); }
            
            .inspector-header { padding: 15px; border-bottom: 1px dashed #333; display: flex; justify-content: space-between; align-items: center;}
            .inspector-title { margin: 0; color: white; font-size: 1.1rem; font-weight: 900;}
            .btn-close-inspector { background: none; border: none; color: #888; cursor: pointer; font-size: 1.5rem; transition: 0.2s; }
            .btn-close-inspector:hover { color: white; }
            
            .inspector-body { padding: 15px; flex: 1; overflow-y: auto; }
            .inspector-domain { font-size: 0.8rem; color: var(--accent-blue); text-transform: uppercase; font-family: var(--font-mono); font-weight: bold; margin-bottom: 15px; display: block;}
            
            .status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; font-family: var(--font-mono); margin-bottom: 15px;}
            .status-unmapped { background: rgba(255,82,82,0.1); color: var(--accent-red); border: 1px solid rgba(255,82,82,0.3); }
            .status-mapped { background: rgba(0,230,118,0.1); color: var(--accent-green); border: 1px solid rgba(0,230,118,0.3); }

            .btn-mestre { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 900; width: 100%; cursor: pointer; transition: 0.3s; display: flex; justify-content: center; align-items: center; gap: 8px; box-shadow: 0 5px 15px rgba(0,176,255,0.2);}
            .btn-mestre:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(224,64,251,0.4); }
            .btn-mestre:disabled { filter: grayscale(1); opacity: 0.6; cursor: not-allowed; }

            .memes-list { display: flex; flex-direction: column; gap: 8px; margin-top: 15px;}
            .meme-mini-card { background: rgba(255,255,255,0.05); border: 1px solid #333; padding: 10px; border-radius: 8px;}
            .meme-mini-cat { font-size: 0.65rem; color: var(--accent-orange); font-family: monospace; font-weight: bold;}
            .meme-mini-title { color: white; font-size: 0.85rem; margin: 3px 0 0 0; font-weight: bold;}
        `;
    }

    async render() {
        await KB.init();
        const allMemes = await KB.getAllNodes();
        
        // 1. Reconstruir datos de D3
        this.nodes = [{ id: 'core', name: 'Matriz SOS', group: 'root', radius: 30, color: '#111' }];
        this.links = [];

        this.PANTHEON.forEach(god => {
            // Verificar si este Dios ya tiene ontología en la KB
            const mappedOntology = allMemes.find(m => m.type === 'ontology' && m.keywords && m.keywords.includes(god.name));
            const isMapped = !!mappedOntology;

            this.nodes.push({
                id: god.id,
                name: god.name,
                domain: god.domain,
                icon: god.icon,
                color: god.color,
                radius: 25,
                group: 'god',
                isMapped: isMapped,
                memes: isMapped ? allMemes.filter(m => m.broader === mappedOntology.id || m.id === mappedOntology.id) : []
            });

            this.links.push({ source: 'core', target: god.id });
        });

        // 2. Inyectar HTML Base
        this.container.innerHTML = `
            <div class="sandbox-widget">
                <div class="sandbox-header">
                    <h4 class="sandbox-title">🌌 Constelación Panteón (Sandbox VNA)</h4>
                </div>
                <div class="sandbox-canvas" id="d3Canvas_${this.container.id}"></div>
                
                <div class="sandbox-inspector" id="inspector_${this.container.id}">
                    <div class="inspector-header">
                        <h3 class="inspector-title" id="inspName">Selecciona un Nodo</h3>
                        <button class="btn-close-inspector" id="btnCloseInsp">&times;</button>
                    </div>
                    <div class="inspector-body">
                        <span class="inspector-domain" id="inspDomain"></span>
                        <div id="inspStatus"></div>
                        <div id="inspAction"></div>
                        <div class="memes-list" id="inspMemes"></div>
                    </div>
                </div>
            </div>
        `;

        // 3. Inicializar D3.js (Import dinámico para no romper la app si no hay internet)
        import('https://cdn.jsdelivr.net/npm/d3@7/+esm').then(d3 => {
            this.initD3(d3.default || d3);
        });

        this.attachEvents();
    }

    initD3(d3) {
        const canvas = this.container.querySelector('.sandbox-canvas');
        const width = canvas.clientWidth || 800;
        const height = canvas.clientHeight || 500;

        const svg = d3.select(canvas).append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(d3.zoom().on("zoom", (event) => {
                g.attr("transform", event.transform);
            }))
            .append("g");

        const g = svg.append("g");

        const simulation = d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.links).id(d => d.id).distance(120))
            .force("charge", d3.forceManyBody().strength(-400))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(d => d.radius + 10));

        const link = g.append("g")
            .selectAll("line")
            .data(this.links)
            .join("line")
            .attr("class", "link-line");

        const node = g.append("g")
            .selectAll("g")
            .data(this.nodes)
            .join("g")
            .call(this.drag(simulation, d3));

        // Círculos de los Nodos
        node.append("circle")
            .attr("class", "node-circle")
            .attr("r", d => d.radius)
            .attr("fill", d => d.group === 'root' ? d.color : (d.isMapped ? d.color : '#222'))
            .attr("stroke", d => d.color)
            .attr("stroke-dasharray", d => d.isMapped ? "none" : "4 4");

        // Iconos
        node.append("text")
            .attr("class", "node-icon")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .text(d => d.icon || '🧠');

        // Etiquetas
        node.append("text")
            .attr("class", "node-text")
            .attr("text-anchor", "middle")
            .attr("dy", d => d.radius + 15)
            .text(d => d.name);

        // Evento Click en D3
        node.on("click", (event, d) => {
            if (d.group === 'root') return;
            this.openInspector(d);
        });

        simulation.on("tick", () => {
            link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });
    }

    drag(simulation, d3) {
        return d3.drag()
            .on("start", (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x; d.fy = d.y;
            })
            .on("drag", (event, d) => {
                d.fx = event.x; d.fy = event.y;
            })
            .on("end", (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null; d.fy = null;
            });
    }

    openInspector(godData) {
        const inspector = this.container.querySelector('.sandbox-inspector');
        this.container.querySelector('#inspName').innerText = `${godData.icon} ${godData.name}`;
        this.container.querySelector('#inspDomain').innerText = godData.domain;
        
        const statusEl = this.container.querySelector('#inspStatus');
        const actionEl = this.container.querySelector('#inspAction');
        const memesEl = this.container.querySelector('#inspMemes');

        if (godData.isMapped) {
            statusEl.innerHTML = `<span class="status-badge status-mapped">✅ Arquetipo Mapeado (W3C)</span>`;
            actionEl.innerHTML = ``;
            memesEl.innerHTML = godData.memes.map(m => `
                <div class="meme-mini-card">
                    <div class="meme-mini-cat">${m.category}</div>
                    <p class="meme-mini-title">${m.title}</p>
                </div>
            `).join('');
        } else {
            statusEl.innerHTML = `<span class="status-badge status-unmapped">⚠️ Vacío Neuronal</span>`;
            memesEl.innerHTML = `<p style="color:#888; font-size:0.85rem; font-style:italic;">El Sistema Operativo no tiene información sobre los flujos de valor de este sector. Asigna la tarea a @mestre_escola para generar la ontología.</p>`;
            actionEl.innerHTML = `
                <button class="btn-mestre" data-god="${godData.id}">
                    🧠 Asignar Entregable a @mestre_escola
                </button>
            `;
        }

        inspector.classList.add('open');
    }

    attachEvents() {
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('#btnCloseInsp')) {
                this.container.querySelector('.sandbox-inspector').classList.remove('open');
            }
            if (e.target.closest('.btn-mestre')) {
                const btn = e.target.closest('.btn-mestre');
                const godId = btn.dataset.god;
                const godData = this.PANTHEON.find(g => g.id === godId);
                
                // Disparar evento para que el Omni-Paper (o quien monte el componente) se encargue
                window.dispatchEvent(new CustomEvent('sandbox-action', {
                    detail: { action: 'invoke-mestre', god: godData, btnElement: btn }
                }));
            }
        });
    }
}
