// =============================================================================
// TEAMTOWERS SOS V10 — SYNAPTIC CANVAS
// Ruta: ia/dev/js/components/SynapticCanvas.js
// Motor WebGL 3D · Meta-Grafo Cuántico · Modo VNA · Modo Agente
// =============================================================================

import { KB }    from '../core/kb.js';
import { store } from '../core/store.js';
import { WoGenerator } from '../core/WoGenerator.js';

export class SynapticCanvas {

    constructor(containerEl, optionsOrAgentId = {}) {
        this.container = containerEl;

        // Anti-fragilidad: acepta string (legacy) u objeto u null
        let opts = {};
        if (typeof optionsOrAgentId === 'string')  opts = { agentId: optionsOrAgentId };
        else if (optionsOrAgentId && typeof optionsOrAgentId === 'object') opts = optionsOrAgentId;

        this.agentId   = opts.agentId   || null;
        this.projectId = opts.projectId || null;
        this.isVnaMode = opts.isVnaMode || false;

        this.nodes          = [];
        this.links          = [];
        this.graph3D        = null;
        this.resizeObserver = null;
        this.isFullscreen   = false;
    }

    async render() {
        if (!this.container) return;

        let panelTitle = '🌌 Meta-Grafo Cuántico (V10)';
        let helperText = 'Haz clic en un nodo para viajar hacia él y decodificar su estructura.';

        if (this.agentId)   { panelTitle = `🧠 Córtex 3D de ${this.agentId}`; helperText = 'Explora el cerebro del Agente y sus ramificaciones de conocimiento.'; }
        if (this.isVnaMode) { panelTitle = `⚙️ Matriz VNA 3D (Flujo de Valor)`;  helperText = 'Visualizando gravedad Casteller y flujo de entregables en tiempo real.'; }

        this.container.innerHTML = `
        <style>
            .synaptic-layout { display:flex; width:100%; height:100%; background:#050508; border-radius:18px; overflow:hidden; border:1px solid var(--glass-border); box-shadow:inset 0 0 50px rgba(0,0,0,0.8); position:relative; transition:all 0.4s ease; }
            .synaptic-layout.fullscreen-mode { position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:9999; border-radius:0; border:none; }
            .btn-fullscreen { position:absolute; top:16px; right:16px; z-index:50; background:rgba(0,0,0,0.5); border:1px solid #555; color:white; border-radius:8px; padding:7px 11px; cursor:pointer; transition:0.2s; font-size:1.1rem; }
            .btn-fullscreen:hover { background:rgba(99,102,241,0.2); border-color:var(--accent-indigo,#6366f1); }

            .synaptic-palette { width:320px; background:linear-gradient(90deg,rgba(5,5,8,0.97) 0%,rgba(10,10,15,0.85) 100%); border-right:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; z-index:10; backdrop-filter:blur(15px); box-shadow:10px 0 30px rgba(0,0,0,0.5); }
            .palette-header { padding:18px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; flex-direction:column; gap:12px; }
            .palette-title  { color:white; font-weight:900; font-size:1.1rem; margin:0; text-transform:uppercase; letter-spacing:1px; }
            .palette-search { background:rgba(0,0,0,0.5); border:1px solid #444; color:white; padding:10px 14px; border-radius:10px; font-family:var(--font-main); font-size:0.88rem; outline:none; width:100%; box-sizing:border-box; transition:0.2s; }
            .palette-search:focus { border-color:var(--accent-indigo,#6366f1); }
            .btn-inject-seeds { background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(224,64,251,0.1)); border:1px solid rgba(99,102,241,0.3); color:var(--accent-indigo,#6366f1); padding:9px 14px; border-radius:9px; font-weight:bold; cursor:pointer; transition:0.2s; font-size:0.82rem; }
            .btn-inject-seeds:hover { background:var(--accent-indigo,#6366f1); color:white; }
            .meme-results-list { flex:1; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:8px; }

            .dm-card { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:14px; transition:0.2s; cursor:pointer; }
            .dm-card:hover { border-color:var(--accent-indigo,#6366f1); background:rgba(99,102,241,0.05); }
            .dm-cat   { font-size:0.65rem; font-family:var(--font-mono); color:var(--accent-indigo,#6366f1); text-transform:uppercase; font-weight:bold; margin-bottom:5px; }
            .dm-title { font-weight:900; color:white; font-size:0.95rem; margin-bottom:6px; }
            .dm-content { color:#888; font-size:0.8rem; line-height:1.5; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
            .dm-tags  { display:flex; flex-wrap:wrap; gap:4px; margin-top:8px; }
            .dm-tag   { background:rgba(0,0,0,0.5); color:#666; font-size:0.65rem; padding:2px 6px; border-radius:4px; font-family:var(--font-mono); }

            .synaptic-3d-container { flex:1; position:relative; overflow:hidden; background:radial-gradient(circle at center,#0a0a10 0%,#000000 100%); }
            .webgl-target   { width:100%; height:100%; outline:none; cursor:crosshair; }
            .graph-tooltip  { position:absolute; background:rgba(10,10,15,0.97); border:1px solid #555; color:white; padding:10px 14px; border-radius:8px; font-family:var(--font-main); font-size:0.82rem; pointer-events:none; z-index:100; backdrop-filter:blur(10px); box-shadow:0 10px 25px rgba(0,0,0,0.8); display:none; transform:translate(-50%,-150%); white-space:nowrap; }
            .graph-tooltip .tt-cat   { font-size:0.62rem; color:var(--accent-indigo,#6366f1); font-family:var(--font-mono); text-transform:uppercase; font-weight:bold; margin-bottom:3px; }
            .graph-tooltip .tt-title { font-weight:900; font-size:0.95rem; }
            .loader-3d { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:var(--accent-indigo,#6366f1); font-family:var(--font-mono); font-weight:bold; font-size:1.1rem; text-transform:uppercase; letter-spacing:2px; animation:pulse 1.5s infinite; pointer-events:none; z-index:20; }
            @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1; text-shadow:0 0 20px var(--accent-indigo,#6366f1);} }
            @media (max-width:768px) { .synaptic-layout{flex-direction:column-reverse;} .synaptic-palette{width:100%;height:45%;border-right:none;border-top:1px solid #333;} .synaptic-3d-container{height:55%;} }
        </style>

        <div class="synaptic-layout" id="synapticMainLayout">
            <button class="btn-fullscreen" id="btnToggleFullscreen" title="Pantalla Completa">⛶</button>
            <div class="synaptic-palette">
                <div class="palette-header">
                    <h3 class="palette-title">${panelTitle}</h3>
                    <input type="text" id="memeSearchInput" class="palette-search" placeholder="🔍 Buscar nodos…">
                    <button class="btn-inject-seeds" id="btnInjectSeeds">✨ Forjar Semillas Antigravity</button>
                </div>
                <div class="meme-results-list" id="memeResultsList">
                    <div style="color:#888;font-size:0.82rem;text-align:center;padding:28px;font-style:italic;line-height:1.6;">${helperText}</div>
                </div>
            </div>
            <div class="synaptic-3d-container" id="d3DropZone">
                <div class="loader-3d" id="loader3D">Iniciando Motor WebGL V10…</div>
                <div class="webgl-target"   id="webglCanvasInner"></div>
                <div class="graph-tooltip"  id="graphTooltip"></div>
            </div>
        </div>`;

        if (this.isVnaMode && this.projectId) await this.loadVNAData();
        else                                  await this.loadInitialData();

        await this._initWebGLGraph();
        this._setupInteractivity();
    }

    // ── Carga KB completo ────────────────────────────────────────
    async loadInitialData() {
        await KB.init();
        const allNodes = await KB.getAllNodes();
        const state    = store.getState();

        this.nodes = [];
        this.links = [];

        const addNode = (id, name, group, val, color, rawNode) => {
            if (!this.nodes.find(n => n.id === id)) this.nodes.push({ id, name, group, val, color, rawNode });
        };
        const addLink = (source, target, isDependencies = false) => {
            if (!source || !target) return;
            if (this.nodes.some(n => n.id === source) && this.nodes.some(n => n.id === target))
                this.links.push({ source, target, isDependencies });
        };

        const getColorAndMass = (category) => {
            if (!category) return { c: '#888', m: 12 };
            if (category.startsWith('core.architecture')) return { c: '#6366f1', m: 30 };
            if (category.startsWith('core.economy'))      return { c: '#00e676', m: 30 };
            if (category.startsWith('core.cognition'))    return { c: '#e040fb', m: 30 };
            if (category.startsWith('core.execution'))    return { c: '#ff9100', m: 30 };
            if (category.startsWith('core.culture'))      return { c: '#ff5252', m: 30 };
            if (category === 'skill')                     return { c: '#ffd740', m: 18 };
            if (category === 'reference')                 return { c: '#00b0ff', m: 14 };
            if (category === 'eval')                      return { c: '#ff9100', m: 12 };
            if (category === 'script')                    return { c: '#69f0ae', m: 12 };
            return { c: '#888', m: 10 };
        };

        // Nodo kernel
        addNode('core_kernel', 'SOS V10 Kernel', 'core_os', 50, '#6366f1', null);

        // Proyectos
        state.projects?.forEach(p => {
            addNode(p.id, p.nombre, 'project_core', 35, '#00e676', p);
            addLink('core_kernel', p.id);
        });

        // Agentes
        state.globalUsers?.forEach(u => {
            if (!u.profile?.isAi) return;
            const promptId = `prompt_global_${u.id.replace('@','')}`;
            addNode(promptId, u.name, 'agent', 28, '#6366f1', { ...u, type: 'agent', category: 'agent' });
            addLink('core_kernel', promptId);
        });

        // Nodos KB
        allNodes.forEach(m => {
            const { c, m: mass } = getColorAndMass(m.category || m.type);
            addNode(m.id, m.title || m.id, m.category || m.type, mass, c, m);

            state.globalUsers?.forEach(u => {
                const pNode = allNodes.find(n => n.id === `prompt_global_${u.id.replace('@','')}`);
                if (pNode?.dependencies?.includes(m.id)) addLink(pNode.id, m.id, true);
            });

            ['references','evals','scripts'].forEach(dep => {
                if (Array.isArray(m[dep])) {
                    m[dep].forEach(childId => {
                        if (allNodes.find(n => n.id === childId)) addLink(m.id, childId, true);
                    });
                }
            });

            if (m.projectId && m.projectId !== 'global' && this.nodes.find(n => n.id === m.projectId))
                addLink(m.projectId, m.id);
            else if (m.projectId === 'global' && m.type === 'skill')
                addLink('core_kernel', m.id, true);
        });
    }

    // ── Carga VNA 3D ──────────────────────────────────────────────
    async loadVNAData() {
    const project = store.getState().projects.find(p => p.id === this.projectId);
    if (!project) return;

    this.nodes = [];
    this.links = [];

    // ── V10: vna_nodes + vna_exchanges del JSON-LD ────────────────────────
    const vnaNodes     = project.vna_nodes     || [];
    const vnaExchanges = project.vna_exchanges || [];

    // Paleta semántica por rol VNA
    const roleColors = {
        'agent':        '#6366f1',
        'human':        '#00e676',
        'organization': '#ff9100',
        'resource':     '#00b0ff',
        'process':      '#e040fb'
    };

    // Tamaño del nodo según tier (tier 0 = hub central, tier 3 = hoja)
    const tierSize = (tier) => {
        const t = Number(tier ?? 2);
        return t === 0 ? 40 : t === 1 ? 28 : t === 2 ? 20 : 14;
    };

    // Gravedad vertical por tier — hub arriba, hojas abajo
    const tierGravity = (tier) => {
        const t = Number(tier ?? 2);
        return t === 0 ? 250 : t === 1 ? 100 : t === 2 ? -100 : -250;
    };

    // Registrar nodos VNA V10
    vnaNodes.forEach(n => {
        this.nodes.push({
            id:      n.id,
            name:    n.label || n.id,
            group:   n.role  || 'process',
            val:     tierSize(n.tier),
            color:   roleColors[n.role] || '#888',
            rawNode: { ...n, type: 'vna-node', category: n.role || 'process' },
            fy:      tierGravity(n.tier)
        });
    });

    // Registrar exchanges como links
    vnaExchanges.forEach(e => {
        const srcExists = this.nodes.find(n => n.id === e.from);
        const tgtExists = this.nodes.find(n => n.id === e.to);
        if (!srcExists || !tgtExists) return;

        this.links.push({
            source:          e.from,
            target:          e.to,
            isDependencies:  false,
            rawTx:           e,
            tipo:            e.type     || 'tangible',
            category:        e.category || 'deliverable',
            automatable:     e.automatable || false,
            label:           e.label    || ''
        });
    });
}

// ─── AÑADIR loadVnaNetwork() JUSTO DESPUÉS de loadVNAData() ──────────────────
//
// Este método acepta directamente un VnaNetwork JSON-LD (sin necesitar
// que esté persistido en el proyecto). Úsalo desde ValueMapView para
// mostrar el mapa inmediatamente tras generarlo con Claude.

async loadVnaNetwork(network) {
    if (!network?.nodes) return;

    this.nodes = [];
    this.links = [];

    const roleColors = {
        'agent':        '#6366f1',
        'human':        '#00e676',
        'organization': '#ff9100',
        'resource':     '#00b0ff',
        'process':      '#e040fb'
    };

    const tierSize    = (tier) => { const t = Number(tier ?? 2); return t === 0 ? 40 : t === 1 ? 28 : t === 2 ? 20 : 14; };
    const tierGravity = (tier) => { const t = Number(tier ?? 2); return t === 0 ? 250 : t === 1 ? 100 : t === 2 ? -100 : -250; };

    (network.nodes || []).forEach(n => {
        this.nodes.push({
            id:      n.id,
            name:    n.label || n.id,
            group:   n.role  || 'process',
            val:     tierSize(n.tier),
            color:   roleColors[n.role] || '#888',
            rawNode: { ...n, type: 'vna-node', category: n.role || 'process' },
            fy:      tierGravity(n.tier)
        });
    });

    (network.exchanges || []).forEach(e => {
        if (!this.nodes.find(n => n.id === e.from)) return;
        if (!this.nodes.find(n => n.id === e.to))   return;
        this.links.push({
            source:         e.from,
            target:         e.to,
            isDependencies: false,
            rawTx:          e,
            tipo:           e.type       || 'tangible',
            category:       e.category   || 'deliverable',
            automatable:    e.automatable || false,
            label:          e.label      || ''
        });
    });

    // Si el grafo ya está inicializado, actualizar datos en caliente
    if (this.graph3D) {
        this.graph3D.graphData({ nodes: this.nodes, links: this.links });
    }
}


    // ── WebGL Graph ───────────────────────────────────────────────
    async _initWebGLGraph() {
        const canvasInner = this.container.querySelector('#webglCanvasInner');
        const loader      = this.container.querySelector('#loader3D');
        const tooltip     = this.container.querySelector('#graphTooltip');

        const loadScript = async (urls, globalVar) => {
            if (window[globalVar]) return;
            for (const url of urls) {
                try {
                    await new Promise((res, rej) => {
                        const s    = document.createElement('script');
                        s.src      = url;
                        s.crossOrigin = 'anonymous';
                        s.onload   = res;
                        s.onerror  = () => rej(new Error(`CDN fail: ${url}`));
                        document.head.appendChild(s);
                    });
                    return;
                } catch (e) { console.warn('[SynapticCanvas] CDN saltada:', url); }
            }
            throw new Error(`Colapso CDN para ${globalVar}`);
        };

        try {
            await loadScript(['https://unpkg.com/three@0.147.0/build/three.min.js','https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js'], 'THREE');
            await loadScript(['https://unpkg.com/three-spritetext','https://cdn.jsdelivr.net/npm/three-spritetext'], 'SpriteText');
            await loadScript(['https://unpkg.com/3d-force-graph','https://cdn.jsdelivr.net/npm/3d-force-graph'], 'ForceGraph3D');
        } catch (e) {
            if (loader) loader.innerText = 'Error cargando Córtex 3D. Red bloqueando CDNs.';
            return;
        }

        if (loader) loader.style.display = 'none';

        this.graph3D = window.ForceGraph3D()(canvasInner)
            .graphData({ nodes: this.nodes, links: this.links })
            .nodeLabel('')
            .linkColor(link => {
                if (this.isVnaMode && link.tipo) return link.tipo === 'tangible' ? 'rgba(0,230,118,0.6)' : 'rgba(224,64,251,0.6)';
                const src = typeof link.source === 'object' ? link.source : this.nodes.find(n => n.id === link.source);
                const c   = src?.color || 'rgba(99,102,241,1)';
                return link.isDependencies ? c.replace(')', ',0.2)').replace('rgb','rgba') : c.replace(')', ',0.5)').replace('rgb','rgba');
            })
            .linkWidth(link => link.isDependencies ? 0.8 : 2)
            .linkDirectionalParticles(link => this.isVnaMode ? 4 : (link.isDependencies ? 1 : 3))
            .linkDirectionalParticleSpeed(this.isVnaMode ? 0.005 : 0.01)
            .linkDirectionalParticleWidth(this.isVnaMode ? 3 : 2.5)
            .linkDirectionalParticleColor(link => {
                if (this.isVnaMode && link.tipo) return link.tipo === 'tangible' ? '#00e676' : '#e040fb';
                const src = typeof link.source === 'object' ? link.source : this.nodes.find(n => n.id === link.source);
                return src?.color || '#ffffff';
            })
            .enableNodeDrag(false)
            .nodeThreeObject(node => {
                const group    = new window.THREE.Group();
                const geo      = new window.THREE.SphereGeometry(node.val * (this.isVnaMode ? 0.5 : 0.8), 24, 24);
                const isCore   = ['core_os','agent','project_core','role'].includes(node.group);
                const mat      = new window.THREE.MeshLambertMaterial({ color: node.color, transparent: true, opacity: isCore ? 0.95 : 0.7, depthWrite: false });
                group.add(new window.THREE.Mesh(geo, mat));
                const sprite   = new window.SpriteText(node.name);
                sprite.color   = '#ffffff';
                sprite.textHeight = Math.max(3, node.val * 0.25);
                sprite.fontWeight = isCore ? '900' : 'normal';
                if (this.isVnaMode) sprite.position.set(0, node.val * 0.6, 0);
                group.add(sprite);
                return group;
            })
            .onNodeHover(node => {
                canvasInner.style.cursor = node ? 'pointer' : 'crosshair';
                if (node) {
                    tooltip.style.display = 'block';
                    tooltip.innerHTML = `
                        <div class="tt-cat" style="color:${node.color}">${node.rawNode?.category || node.rawNode?.type || node.group}</div>
                        <div class="tt-title">${node.name}</div>`;
                } else {
                    tooltip.style.display = 'none';
                }
            })
            .onNodeClick(node => {
                const dist = this.isVnaMode ? 300 : 200;
                if (this.graph3D) {
                    const distRatio = 1 + dist / Math.hypot(node.x, node.y, node.z || 1);
                    this.graph3D.cameraPosition({ x: node.x * distRatio, y: node.y * distRatio, z: (node.z || 0) * distRatio }, node, 1000);
                }
                this._showNodeDetails(node);
            });

        canvasInner.addEventListener('mousemove', (e) => {
            if (tooltip.style.display === 'block') {
                const rect = canvasInner.getBoundingClientRect();
                tooltip.style.left = `${e.clientX - rect.left}px`;
                tooltip.style.top  = `${e.clientY - rect.top}px`;
            }
        });

        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(() => {
                if (canvasInner && this.graph3D) {
                    this.graph3D.width(canvasInner.clientWidth);
                    this.graph3D.height(canvasInner.clientHeight);
                }
            });
            this.resizeObserver.observe(canvasInner);
        }
    }

    // ── Interactividad: búsqueda, fullscreen, seeds ───────────────
    _setupInteractivity() {
        const searchInput  = this.container.querySelector('#memeSearchInput');
        const resultsList  = this.container.querySelector('#memeResultsList');
        const btnInject    = this.container.querySelector('#btnInjectSeeds');
        const btnFullscreen = this.container.querySelector('#btnToggleFullscreen');
        const mainLayout   = this.container.querySelector('#synapticMainLayout');

        searchInput?.addEventListener('input', async () => {
            const q = searchInput.value.toLowerCase().trim();
            if (!q) { resultsList.innerHTML = `<div style="color:#888;font-size:0.82rem;text-align:center;padding:24px;font-style:italic;">Haz clic en un nodo para interactuar.</div>`; return; }
            await KB.init();
            const allNodes = await KB.getAllNodes();
            const matches  = allNodes.filter(n => n.title?.toLowerCase().includes(q) || n.id.toLowerCase().includes(q));
            resultsList.innerHTML = matches.slice(0, 12).map(n => `
                <div class="dm-card" data-id="${n.id}">
                    <div class="dm-cat">${n.category || n.type || '?'}</div>
                    <div class="dm-title">${n.title || n.id}</div>
                    <div class="dm-content">${n.description || n.content?.substring(0,80) || ''}</div>
                </div>`).join('') || `<div style="color:#555;text-align:center;padding:20px;font-size:0.82rem;">Sin resultados.</div>`;

            resultsList.querySelectorAll('.dm-card').forEach(card => {
                card.addEventListener('click', () => {
                    window.dispatchEvent(new CustomEvent('open-forge-modal', { detail: { nodeId: card.dataset.id } }));
                });
            });
        });

        btnInject?.addEventListener('click', async () => {
            btnInject.disabled  = true;
            btnInject.innerText = '⏳ Inyectando…';
            try {
                const { CoreSeed } = await import('../core/seed.js');
                await KB.init();
                if (CoreSeed?.inject) {
                    await KB.deleteNode('skill_vna_architect'); // fuerza reinject
                    await CoreSeed.inject(KB);
                }
                window.dispatchEvent(new CustomEvent('refresh-lms-data'));
                await this.loadInitialData();
                if (this.graph3D) this.graph3D.graphData({ nodes: this.nodes, links: this.links });
                alert('✅ Semillas Antigravity inyectadas en el Córtex.');
            } catch (e) {
                alert('Error: ' + e.message);
            } finally {
                btnInject.disabled  = false;
                btnInject.innerText = '✨ Forjar Semillas Antigravity';
            }
        });

        btnFullscreen?.addEventListener('click', () => {
            mainLayout?.classList.toggle('fullscreen-mode');
            const isFull = mainLayout?.classList.contains('fullscreen-mode');
            if (btnFullscreen) btnFullscreen.innerText = isFull ? '✕' : '⛶';
            setTimeout(() => {
                const c = this.container.querySelector('#webglCanvasInner');
                if (c && this.graph3D) { this.graph3D.width(c.clientWidth); this.graph3D.height(c.clientHeight); }
            }, 100);
        });
    }

    // ── Panel de detalle de nodo ──────────────────────────────────
    _showNodeDetails(node3D) {
        const resultsList = this.container.querySelector('#memeResultsList');
        const m = node3D.rawNode;
        if (!m) return;

        const isAgent = node3D.group === 'agent';
        const isSkill = m.type === 'skill' || m.category === 'skill';
        const tagsHtml = (m.keywords || []).map(t => `<span class="dm-tag">#${t}</span>`).join('');
        const color    = node3D.color || 'var(--accent-indigo,#6366f1)';

        let badgesHtml = '';
        if (isSkill) {
            const r = m.references?.length || 0;
            const e = m.evals?.length     || 0;
            const s = m.scripts?.length   || 0;
            if (r>0) badgesHtml += `<span style="background:rgba(0,176,255,0.1);color:#00b0ff;padding:3px 8px;border-radius:4px;font-size:0.68rem;font-weight:bold;margin-right:5px;border:1px solid rgba(0,176,255,0.3);">📚 ${r}</span>`;
            if (e>0) badgesHtml += `<span style="background:rgba(255,171,64,0.1);color:var(--accent-orange);padding:3px 8px;border-radius:4px;font-size:0.68rem;font-weight:bold;margin-right:5px;border:1px solid rgba(255,171,64,0.3);">📋 ${e}</span>`;
            if (s>0) badgesHtml += `<span style="background:rgba(0,230,118,0.1);color:var(--accent-green);padding:3px 8px;border-radius:4px;font-size:0.68rem;font-weight:bold;border:1px solid rgba(0,230,118,0.3);">⚡ ${s}</span>`;
        }

        const contentHtml = m.content ? m.content.substring(0, 300) + (m.content.length > 300 ? '…' : '') : '';

        let interactivePanel = '';
        if (isAgent) {
            interactivePanel = `
            <div style="margin-top:12px; display:flex; flex-direction:column; gap:8px;">
                <select id="sel3DEquipSkill" style="background:#111; border:1px solid #444; color:white; padding:8px; border-radius:8px; width:100%; font-size:0.8rem; outline:none;">
                    <option value="">-- Equipar Skill al Agente --</option>
                    ${this.nodes.filter(n => n.rawNode?.type === 'skill').map(n => `<option value="${n.id}">${n.name}</option>`).join('')}
                </select>
                <button id="btn3DEquip" style="background:rgba(99,102,241,0.2);border:1px solid var(--accent-indigo,#6366f1);color:var(--accent-indigo,#6366f1);padding:8px;border-radius:8px;cursor:pointer;font-weight:bold;font-size:0.8rem;width:100%;">⚙️ Equipar Skill</button>
            </div>`;
        } else if (isSkill) {
            interactivePanel = `
            <div style="margin-top:12px; display:flex; flex-direction:column; gap:8px;">
                <button id="btn3DEditSkill" style="background:rgba(99,102,241,0.1);border:1px solid var(--accent-indigo,#6366f1);color:var(--accent-indigo,#6366f1);padding:8px;border-radius:8px;cursor:pointer;font-weight:bold;font-size:0.8rem;width:100%;">✏️ Editar en la Forja</button>
                <button id="btn3DTestSkill" style="background:rgba(255,171,64,0.1);border:1px solid var(--accent-orange);color:var(--accent-orange);padding:8px;border-radius:8px;cursor:pointer;font-weight:bold;font-size:0.8rem;width:100%;">🧪 CI/CD Pentest</button>
            </div>`;
        }

        resultsList.innerHTML = `
        <div class="dm-card" style="border-color:${color};">
            <button id="btnBackSearch" style="background:transparent;border:none;color:#888;cursor:pointer;font-size:0.8rem;margin-bottom:10px;padding:0;">← Volver</button>
            <div class="dm-cat" style="color:${color}">${m.category || m.type || node3D.group}</div>
            <div class="dm-title">${node3D.name}</div>
            ${badgesHtml ? `<div style="margin-bottom:8px;">${badgesHtml}</div>` : ''}
            <div class="dm-content">${contentHtml}</div>
            <div class="dm-tags">${tagsHtml}</div>
            ${interactivePanel}
        </div>`;

        resultsList.querySelector('#btnBackSearch')?.addEventListener('click', () => {
            resultsList.innerHTML = `<div style="color:#888;font-size:0.82rem;text-align:center;padding:24px;font-style:italic;">Haz clic en un nodo para interactuar.</div>`;
            this.graph3D?.cameraPosition({ x:0, y:0, z:800 }, { x:0, y:0, z:0 }, 2000);
        });

        resultsList.querySelector('#btn3DEquip')?.addEventListener('click', () => {
            const skillId = resultsList.querySelector('#sel3DEquipSkill')?.value;
            if (!skillId) return alert('Selecciona una skill');
            window.dispatchEvent(new CustomEvent('3d-equip-skill', { detail: { agentId: m.id, skillId } }));
        });

        resultsList.querySelector('#btn3DEditSkill')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('open-forge-modal', { detail: { nodeId: m.id } }));
        });

        resultsList.querySelector('#btn3DTestSkill')?.addEventListener('click', (e) => {
            e.currentTarget.innerText = '🧪 Evaluando…';
            e.currentTarget.disabled  = true;
            window.dispatchEvent(new CustomEvent('3d-test-skill', { detail: { skillData: m } }));
        });
    }
}
