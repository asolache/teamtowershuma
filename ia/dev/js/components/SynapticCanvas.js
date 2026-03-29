// =============================================================================
// TEAMTOWERS SOS V10 — SYNAPTIC CANVAS
// Ruta: ia/dev/js/components/SynapticCanvas.js
// Motor WebGL 3D · Meta-Grafo Cuántico · Modo VNA · Modo Agente
// V10.2: Labels en exchanges · Gravedad Casteller · Click nodo/link → edición
// =============================================================================

import { KB }           from '../core/kb.js';
import { store }        from '../core/store.js';
import { WoGenerator }  from '../core/WoGenerator.js';

export class SynapticCanvas {

    constructor(containerEl, optionsOrAgentId = {}) {
        this.container = containerEl;

        let opts = {};
        if (typeof optionsOrAgentId === 'string')                                opts = { agentId: optionsOrAgentId };
        else if (optionsOrAgentId && typeof optionsOrAgentId === 'object') opts = optionsOrAgentId;

        this.agentId    = opts.agentId    || null;
        this.projectId  = opts.projectId  || null;
        this.isVnaMode  = opts.isVnaMode  || false;

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

        if (this.agentId)   { panelTitle = `🧠 Córtex 3D de ${this.agentId}`;       helperText = 'Explora el cerebro del Agente y sus ramificaciones.'; }
        if (this.isVnaMode) { panelTitle = `⚙️ Matriz VNA 3D (Flujo de Valor)`;      helperText = 'Clic en un rol o entregable para ver su detalle y editarlo.'; }

        this.container.innerHTML = `
        <style>
            .synaptic-layout { display:flex; width:100%; height:100%; background:#050508; border-radius:18px; overflow:hidden; border:1px solid var(--glass-border); box-shadow:inset 0 0 50px rgba(0,0,0,0.8); position:relative; transition:all 0.4s ease; }
            .synaptic-layout.fullscreen-mode { position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:9999; border-radius:0; border:none; }
            .btn-fullscreen { position:absolute; top:16px; right:16px; z-index:50; background:rgba(0,0,0,0.5); border:1px solid #555; color:white; border-radius:8px; padding:7px 11px; cursor:pointer; transition:0.2s; font-size:1.1rem; }
            .btn-fullscreen:hover { background:rgba(99,102,241,0.2); border-color:var(--accent-indigo,#6366f1); }

            .synaptic-palette { width:300px; background:linear-gradient(90deg,rgba(5,5,8,0.97),rgba(10,10,15,0.85)); border-right:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; z-index:10; backdrop-filter:blur(15px); box-shadow:10px 0 30px rgba(0,0,0,0.5); }
            .palette-header { padding:16px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; flex-direction:column; gap:10px; }
            .palette-title  { color:white; font-weight:900; font-size:1rem; margin:0; text-transform:uppercase; letter-spacing:1px; }
            .palette-search { background:rgba(0,0,0,0.5); border:1px solid #444; color:white; padding:9px 12px; border-radius:9px; font-family:var(--font-main); font-size:0.85rem; outline:none; width:100%; box-sizing:border-box; transition:0.2s; }
            .palette-search:focus { border-color:var(--accent-indigo,#6366f1); }
            .btn-inject-seeds { background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(224,64,251,0.1)); border:1px solid rgba(99,102,241,0.3); color:var(--accent-indigo,#6366f1); padding:8px 12px; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s; font-size:0.78rem; }
            .btn-inject-seeds:hover { background:var(--accent-indigo,#6366f1); color:white; }
            .meme-results-list { flex:1; overflow-y:auto; padding:10px; display:flex; flex-direction:column; gap:7px; }

            .dm-card { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:11px; padding:12px; transition:0.2s; cursor:pointer; }
            .dm-card:hover { border-color:var(--accent-indigo,#6366f1); background:rgba(99,102,241,0.05); }
            .dm-cat    { font-size:0.62rem; font-family:var(--font-mono); color:var(--accent-indigo,#6366f1); text-transform:uppercase; font-weight:bold; margin-bottom:4px; }
            .dm-title  { font-weight:900; color:white; font-size:0.9rem; margin-bottom:5px; }
            .dm-content{ color:#888; font-size:0.78rem; line-height:1.5; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
            .dm-tags   { display:flex; flex-wrap:wrap; gap:4px; margin-top:7px; }
            .dm-tag    { background:rgba(0,0,0,0.5); color:#666; font-size:0.62rem; padding:2px 5px; border-radius:4px; font-family:var(--font-mono); }

            /* Botones de acción en el panel */
            .dm-action-btn { display:block; width:100%; padding:7px 12px; border-radius:7px;
                font-size:0.75rem; font-weight:bold; cursor:pointer; transition:0.2s;
                text-align:center; text-decoration:none; margin-top:6px; }
            .dm-btn-edit   { background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.3);
                color:var(--accent-indigo,#6366f1); }
            .dm-btn-edit:hover { background:rgba(99,102,241,0.2); }
            .dm-btn-paper  { background:rgba(0,176,255,0.08); border:1px solid rgba(0,176,255,0.25);
                color:#00b0ff; }
            .dm-btn-paper:hover { background:rgba(0,176,255,0.15); }
            .dm-btn-wo     { background:rgba(0,230,118,0.08); border:1px solid rgba(0,230,118,0.25);
                color:var(--accent-green,#00e676); }
            .dm-btn-wo:hover { background:rgba(0,230,118,0.15); }
            .dm-btn-danger { background:rgba(255,82,82,0.08); border:1px solid rgba(255,82,82,0.25);
                color:var(--accent-red,#ff5252); }

            /* Badge tipo exchange */
            .exchange-badge { display:inline-flex; align-items:center; gap:5px;
                padding:3px 8px; border-radius:5px; font-size:0.65rem; font-weight:bold;
                font-family:var(--font-mono); text-transform:uppercase; }
            .badge-tang { background:rgba(0,230,118,0.08); color:var(--accent-green,#00e676); border:1px solid rgba(0,230,118,0.2); }
            .badge-int  { background:rgba(224,64,251,0.08); color:var(--accent-purple,#e040fb); border:1px solid rgba(224,64,251,0.2); }
            .badge-auto { background:rgba(99,102,241,0.08); color:var(--accent-indigo,#6366f1); border:1px solid rgba(99,102,241,0.2); }

            .synaptic-3d-container { flex:1; position:relative; overflow:hidden; background:radial-gradient(circle at center,#0a0a10 0%,#000 100%); }
            .webgl-target  { width:100%; height:100%; outline:none; cursor:crosshair; }
            .graph-tooltip { position:absolute; background:rgba(10,10,15,0.97); border:1px solid #555; color:white; padding:9px 13px; border-radius:8px; font-family:var(--font-main); font-size:0.8rem; pointer-events:none; z-index:100; backdrop-filter:blur(10px); box-shadow:0 10px 25px rgba(0,0,0,0.8); display:none; transform:translate(-50%,-150%); white-space:nowrap; }
            .tt-cat   { font-size:0.6rem; color:var(--accent-indigo,#6366f1); font-family:var(--font-mono); text-transform:uppercase; font-weight:bold; margin-bottom:2px; }
            .tt-title { font-weight:900; font-size:0.9rem; }
            .tt-sub   { font-size:0.72rem; color:#aaa; margin-top:2px; }
            .loader-3d { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:var(--accent-indigo,#6366f1); font-family:var(--font-mono); font-weight:bold; font-size:1rem; text-transform:uppercase; letter-spacing:2px; animation:pulse 1.5s infinite; pointer-events:none; z-index:20; }
            @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;text-shadow:0 0 20px var(--accent-indigo,#6366f1);} }
            @media (max-width:768px) { .synaptic-layout{flex-direction:column-reverse;} .synaptic-palette{width:100%;height:40%;border-right:none;border-top:1px solid #333;} .synaptic-3d-container{height:60%;} }
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
                    <div style="color:#555;font-size:0.78rem;text-align:center;padding:24px;font-style:italic;line-height:1.6;">${helperText}</div>
                </div>
            </div>
            <div class="synaptic-3d-container" id="d3DropZone">
                <div class="loader-3d" id="loader3D">Iniciando Motor WebGL V10…</div>
                <div class="webgl-target"  id="webglCanvasInner"></div>
                <div class="graph-tooltip" id="graphTooltip"></div>
            </div>
        </div>`;

        if (this.isVnaMode && this.projectId) await this.loadVNAData();
        else                                  await this.loadInitialData();

        await this._initWebGLGraph();
        this._setupInteractivity();
    }

    // ══════════════════════════════════════════════════════════════
    //  loadInitialData — KB completo (modo global)
    // ══════════════════════════════════════════════════════════════
    async loadInitialData() {
        await KB.init();
        const allNodes = await KB.getAllNodes();
        const state    = store.getState();

        this.nodes = [];
        this.links = [];

        const addNode = (id, name, group, val, color, rawNode) => {
            if (!this.nodes.find(n => n.id === id)) this.nodes.push({ id, name, group, val, color, rawNode });
        };
        const addLink = (source, target, isDep = false) => {
            if (!source || !target) return;
            if (this.nodes.some(n => n.id === source) && this.nodes.some(n => n.id === target))
                this.links.push({ source, target, isDependencies: isDep });
        };

        const getColorAndMass = (cat) => {
            if (!cat) return { c:'#888', m:12 };
            if (cat.startsWith('core.architecture')) return { c:'#6366f1', m:30 };
            if (cat.startsWith('core.economy'))      return { c:'#00e676', m:30 };
            if (cat.startsWith('core.cognition'))    return { c:'#e040fb', m:30 };
            if (cat.startsWith('core.execution'))    return { c:'#ff9100', m:30 };
            if (cat.startsWith('core.culture'))      return { c:'#ff5252', m:30 };
            if (cat === 'skill')                     return { c:'#ffd740', m:18 };
            if (cat === 'reference')                 return { c:'#00b0ff', m:14 };
            if (cat === 'eval')                      return { c:'#ff9100', m:12 };
            if (cat === 'script')                    return { c:'#69f0ae', m:12 };
            return { c:'#888', m:10 };
        };

        addNode('core_kernel', 'SOS V10 Kernel', 'core_os', 50, '#6366f1', null);

        state.projects?.forEach(p => { addNode(p.id, p.nombre, 'project_core', 35, '#00e676', p); addLink('core_kernel', p.id); });

        state.globalUsers?.forEach(u => {
            if (!u.profile?.isAi) return;
            const pid = `prompt_global_${u.id.replace('@','')}`;
            addNode(pid, u.name, 'agent', 28, '#6366f1', { ...u, type:'agent', category:'agent' });
            addLink('core_kernel', pid);
        });

        allNodes.forEach(m => {
            const { c, m: mass } = getColorAndMass(m.category || m.type);
            addNode(m.id, m.title || m.id, m.category || m.type, mass, c, m);
            state.globalUsers?.forEach(u => {
                const pNode = allNodes.find(n => n.id === `prompt_global_${u.id.replace('@','')}`);
                if (pNode?.dependencies?.includes(m.id)) addLink(pNode.id, m.id, true);
            });
            ['references','evals','scripts'].forEach(dep => {
                if (Array.isArray(m[dep])) m[dep].forEach(cid => { if (allNodes.find(n => n.id === cid)) addLink(m.id, cid, true); });
            });
            if (m.projectId && m.projectId !== 'global' && this.nodes.find(n => n.id === m.projectId)) addLink(m.projectId, m.id);
            else if (m.projectId === 'global' && m.type === 'skill') addLink('core_kernel', m.id, true);
        });
    }

    // ══════════════════════════════════════════════════════════════
    //  loadVNAData — V10: vna_nodes + vna_exchanges
    //  Gravedad Casteller: @anxaneta arriba → @pinya abajo
    // ══════════════════════════════════════════════════════════════
    async loadVNAData() {
        const project = store.getState().projects.find(p => p.id === this.projectId);
        if (!project) return;
        this._buildVnaGraph(project.vna_nodes || [], project.vna_exchanges || []);
    }

    async loadVnaNetwork(network) {
        if (!network?.nodes) return;
        this._buildVnaGraph(network.nodes, network.exchanges || []);
        if (this.graph3D) this.graph3D.graphData({ nodes: this.nodes, links: this.links });
    }

    _buildVnaGraph(vnaNodes, vnaExchanges) {
        this.nodes = [];
        this.links = [];

        // ── Paleta semántica por rol ──────────────────────────────
        const roleColors = {
            agent:        '#6366f1',
            human:        '#00e676',
            organization: '#ff9100',
            resource:     '#00b0ff',
            process:      '#e040fb'
        };

        // ── Gravedad Casteller — posición Y fija por nivel ────────
        // Estructura: @anxaneta arriba (fy alto) → @pinya abajo (fy negativo)
        const levelGravity = {
            '@anxaneta':  400,   // cúspide
            '@aixecador': 250,   // segundo nivel
            '@dosos':     100,   // tercer nivel
            '@baixos':   -100,   // cuarto nivel
            '@pinya':    -300    // base
        };

        // Si el nodo tiene levelId propio (viene del Forge), usar esa gravedad
        // Si no, usar el tier del VNA
        const gravityForNode = (n) => {
            if (n.levelId && levelGravity[n.levelId] !== undefined) return levelGravity[n.levelId];
            const t = Number(n.tier ?? 2);
            return t === 0 ? 300 : t === 1 ? 150 : t === 2 ? 0 : -200;
        };

        const sizeForNode = (n) => {
            if (n.levelId) {
                const s = { '@anxaneta':40, '@aixecador':30, '@dosos':24, '@baixos':18, '@pinya':14 };
                return s[n.levelId] ?? 20;
            }
            const t = Number(n.tier ?? 2);
            return t === 0 ? 40 : t === 1 ? 28 : t === 2 ? 20 : 14;
        };

        vnaNodes.forEach(n => {
            this.nodes.push({
                id:      n.id,
                name:    n.label || n.id,
                group:   n.role  || 'process',
                val:     sizeForNode(n),
                color:   roleColors[n.role] || '#888',
                rawNode: { ...n, type:'vna-node', category: n.role || 'process' },
                fy:      gravityForNode(n)   // ← fuerza Y fija para estructura Casteller
            });
        });

        vnaExchanges.forEach(e => {
            if (!this.nodes.find(n => n.id === e.from)) return;
            if (!this.nodes.find(n => n.id === e.to))   return;
            this.links.push({
                source:      e.from,
                target:      e.to,
                isDep:       false,
                rawTx:       e,
                tipo:        e.type      || 'tangible',
                category:    e.category  || 'deliverable',
                automatable: e.automatable || false,
                label:       e.label     || e.template || e.entregable || ''
            });
        });
    }

    // ══════════════════════════════════════════════════════════════
    //  _initWebGLGraph
    // ══════════════════════════════════════════════════════════════
    async _initWebGLGraph() {
        const canvasInner = this.container.querySelector('#webglCanvasInner');
        const loader      = this.container.querySelector('#loader3D');
        const tooltip     = this.container.querySelector('#graphTooltip');

        const loadScript = async (urls, globalVar) => {
            if (window[globalVar]) return;
            for (const url of urls) {
                try {
                    await new Promise((res, rej) => {
                        const s = document.createElement('script');
                        s.src = url; s.crossOrigin = 'anonymous';
                        s.onload = res; s.onerror = () => rej(new Error(`CDN fail: ${url}`));
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

            // ── Colores de links ──────────────────────────────────
            .linkColor(link => {
                if (this.isVnaMode && link.tipo)
                    return link.tipo === 'tangible' ? 'rgba(0,230,118,0.7)' : 'rgba(224,64,251,0.7)';
                const src = typeof link.source === 'object' ? link.source : this.nodes.find(n => n.id === link.source);
                const c   = src?.color || 'rgba(99,102,241,1)';
                return link.isDependencies ? c.replace(')',',0.2)').replace('rgb','rgba') : c.replace(')',',0.5)').replace('rgb','rgba');
            })
            .linkWidth(link => this.isVnaMode ? 2.5 : (link.isDependencies ? 0.8 : 2))

            // ── Partículas animadas ───────────────────────────────
            .linkDirectionalParticles(link => this.isVnaMode ? 5 : (link.isDependencies ? 1 : 3))
            .linkDirectionalParticleSpeed(this.isVnaMode ? 0.004 : 0.01)
            .linkDirectionalParticleWidth(this.isVnaMode ? 3.5 : 2.5)
            .linkDirectionalParticleColor(link => {
                if (this.isVnaMode && link.tipo)
                    return link.tipo === 'tangible' ? '#00e676' : '#e040fb';
                const src = typeof link.source === 'object' ? link.source : this.nodes.find(n => n.id === link.source);
                return src?.color || '#ffffff';
            })

            // ── Label en el centro del link (entregable) ──────────
            .linkThreeObjectExtend(true)
            .linkThreeObject(link => {
                if (!this.isVnaMode) return null;
                const label = link.label || link.rawTx?.label || link.rawTx?.template || link.rawTx?.entregable || '';
                if (!label) return null;

                const sprite = new window.SpriteText(label);
                sprite.color           = link.tipo === 'intangible' ? '#e040fb' : '#00e676';
                sprite.textHeight      = 3.5;
                sprite.fontWeight      = 'bold';
                sprite.backgroundColor = 'rgba(0,0,0,0.55)';
                sprite.padding         = 2;
                sprite.borderRadius    = 3;
                return sprite;
            })
            .linkPositionUpdate((sprite, { start, end }) => {
                if (!sprite) return;
                // Posicionar en el centro del link
                const middlePos = {
                    x: start.x + (end.x - start.x) / 2,
                    y: start.y + (end.y - start.y) / 2,
                    z: start.z + (end.z - start.z) / 2
                };
                Object.assign(sprite.position, middlePos);
            })

            .enableNodeDrag(false)

            // ── Objeto 3D de nodo ─────────────────────────────────
            .nodeThreeObject(node => {
                const group  = new window.THREE.Group();
                const radius = node.val * (this.isVnaMode ? 0.5 : 0.8);
                const geo    = new window.THREE.SphereGeometry(radius, 28, 28);
                const isCore = ['core_os','agent','project_core','role'].includes(node.group);
                const isVna  = node.rawNode?.type === 'vna-node';

                // Glow ring para nodos VNA de nivel alto
                if (isVna && (node.rawNode?.levelId === '@anxaneta' || node.rawNode?.tier === 0)) {
                    const ringGeo = new window.THREE.TorusGeometry(radius * 1.4, 0.5, 8, 32);
                    const ringMat = new window.THREE.MeshBasicMaterial({ color: node.color, transparent: true, opacity: 0.3 });
                    group.add(new window.THREE.Mesh(ringGeo, ringMat));
                }

                const mat = new window.THREE.MeshLambertMaterial({
                    color: node.color, transparent: true,
                    opacity: isCore || isVna ? 0.95 : 0.7,
                    depthWrite: false
                });
                group.add(new window.THREE.Mesh(geo, mat));

                // Label del nodo
                const sprite       = new window.SpriteText(node.name);
                sprite.color       = '#ffffff';
                sprite.textHeight  = Math.max(2.5, node.val * 0.22);
                sprite.fontWeight  = (isCore || (isVna && node.rawNode?.tier <= 1)) ? '900' : '600';
                sprite.position.set(0, radius + 4, 0);
                group.add(sprite);

                // Badge de nivel Casteller
                if (isVna && node.rawNode?.levelId) {
                    const levelBadge = new window.SpriteText(node.rawNode.levelId);
                    levelBadge.color      = node.color;
                    levelBadge.textHeight = 2;
                    levelBadge.fontWeight = 'bold';
                    levelBadge.position.set(0, -(radius + 4), 0);
                    group.add(levelBadge);
                }

                return group;
            })

            // ── Hover tooltip ─────────────────────────────────────
            .onNodeHover(node => {
                canvasInner.style.cursor = node ? 'pointer' : 'crosshair';
                if (node) {
                    tooltip.style.display = 'block';
                    const levelLabel = node.rawNode?.levelId ? `<div class="tt-sub">${node.rawNode.levelId}</div>` : '';
                    tooltip.innerHTML = `
                        <div class="tt-cat" style="color:${node.color}">${node.rawNode?.category || node.rawNode?.type || node.group}</div>
                        <div class="tt-title">${node.name}</div>
                        ${levelLabel}`;
                } else {
                    tooltip.style.display = 'none';
                }
            })

            // ── Click en link (entregable) ────────────────────────
            .onLinkClick(link => {
                if (this.isVnaMode) this._showExchangeDetails(link);
            })
            .onLinkHover(link => {
                canvasInner.style.cursor = (link && this.isVnaMode) ? 'pointer' : 'crosshair';
                if (link && this.isVnaMode && link.label) {
                    tooltip.style.display = 'block';
                    const tipo = link.tipo || 'tangible';
                    const color = tipo === 'intangible' ? '#e040fb' : '#00e676';
                    tooltip.innerHTML = `
                        <div class="tt-cat" style="color:${color}">exchange · ${tipo}</div>
                        <div class="tt-title">${link.label || '—'}</div>
                        <div class="tt-sub">${link.rawTx?.frequency || ''} ${link.automatable ? '· ⚡ auto' : ''}</div>`;
                } else if (!link) {
                    tooltip.style.display = 'none';
                }
            })

            // ── Click en nodo ─────────────────────────────────────
            .onNodeClick(node => {
                const dist = this.isVnaMode ? 300 : 200;
                if (this.graph3D) {
                    const dr = 1 + dist / Math.hypot(node.x, node.y, node.z || 1);
                    this.graph3D.cameraPosition(
                        { x: node.x * dr, y: node.y * dr, z: (node.z || 0) * dr },
                        node, 1000
                    );
                }
                if (this.isVnaMode) this._showVnaNodeDetails(node);
                else                this._showNodeDetails(node);
            });

        // Tooltip sigue al ratón
        canvasInner.addEventListener('mousemove', (e) => {
            if (tooltip.style.display === 'block') {
                const rect = canvasInner.getBoundingClientRect();
                tooltip.style.left = `${e.clientX - rect.left}px`;
                tooltip.style.top  = `${e.clientY - rect.top}px`;
            }
        });

        // ResizeObserver
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

    // ══════════════════════════════════════════════════════════════
    //  _showVnaNodeDetails — panel lateral para nodo VNA
    // ══════════════════════════════════════════════════════════════
    _showVnaNodeDetails(node3D) {
        const panel = this.container.querySelector('#memeResultsList');
        const m     = node3D.rawNode || {};
        const color = node3D.color || 'var(--accent-indigo,#6366f1)';

        // WOs relacionadas con este nodo
        const project    = store.getState().projects.find(p => p.id === this.projectId) || {};
        const relatedWos = (project.work_orders || []).filter(w => w.from === node3D.id || w.to === node3D.id);
        const relatedFlows = (project.vna_flows || []).filter(f => f.from === node3D.id || f.to === node3D.id);
        const woCount    = relatedWos.length + relatedFlows.length;

        const levelBadge = m.levelId
            ? `<span class="exchange-badge badge-tang">${m.levelId}</span>`
            : '';
        const roleBadge  = `<span class="exchange-badge badge-auto">${m.role || node3D.group}</span>`;
        const tierBadge  = m.tier != null ? `<span class="exchange-badge badge-int">tier ${m.tier}</span>` : '';

        panel.innerHTML = `
        <div class="dm-card" style="border-color:${color};">
            <button id="btnBackSearch" style="background:transparent;border:none;color:#666;cursor:pointer;font-size:0.78rem;margin-bottom:10px;padding:0;">← Volver</button>
            <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px;">
                ${levelBadge}${roleBadge}${tierBadge}
            </div>
            <div class="dm-title" style="color:${color};">${node3D.name}</div>
            <div class="dm-content" style="margin-top:6px;">
                ${m.description || m.content?.substring(0,120) || 'Nodo VNA del ecosistema.'}
            </div>
            ${m.fmv ? `<div style="font-size:0.7rem;color:#666;margin-top:6px;font-family:var(--font-mono);">FMV: €${m.fmv}/h · Slices: ${Number((m.slices||0).toFixed(3))}</div>` : ''}
            ${woCount > 0 ? `<div style="font-size:0.72rem;color:var(--accent-orange,#ff9100);margin-top:6px;">📋 ${woCount} WO(s) relacionadas</div>` : ''}

            <div style="display:flex;flex-direction:column;gap:6px;margin-top:12px;">
                <button class="dm-action-btn dm-btn-edit" id="btnEditNode">✏️ Editar en Project Forge</button>
                <button class="dm-action-btn dm-btn-paper" id="btnOpenPaper">📝 Abrir en Omni-Paper</button>
                ${woCount > 0 ? `<button class="dm-action-btn dm-btn-wo" id="btnViewWos">📋 Ver Work Orders</button>` : ''}
            </div>
        </div>`;

        panel.querySelector('#btnBackSearch')?.addEventListener('click', () => this._resetPanel());
        panel.querySelector('#btnEditNode')?.addEventListener('click', () => {
            // Navega a /create con el proyecto activo para editar roles
            if (typeof window.navigateTo === 'function') window.navigateTo(`/create?project=${this.projectId}&role=${node3D.id}`);
        });
        panel.querySelector('#btnOpenPaper')?.addEventListener('click', () => {
            // Abre Omni-Paper con contexto del nodo
            window.dispatchEvent(new CustomEvent('paper:open-node', { detail: { nodeId: node3D.id, nodeName: node3D.name, projectId: this.projectId } }));
            if (typeof window.navigateTo === 'function') window.navigateTo('/paper');
        });
        panel.querySelector('#btnViewWos')?.addEventListener('click', () => {
            if (typeof window.navigateTo === 'function') window.navigateTo('/project');
        });
    }

    // ══════════════════════════════════════════════════════════════
    //  _showExchangeDetails — panel lateral para un exchange/link
    // ══════════════════════════════════════════════════════════════
    _showExchangeDetails(link) {
        const panel   = this.container.querySelector('#memeResultsList');
        const e       = link.rawTx || {};
        const tipo    = link.tipo || e.type || 'tangible';
        const color   = tipo === 'intangible' ? '#e040fb' : '#00e676';
        const label   = link.label || e.label || e.template || e.entregable || 'Exchange';

        const fromNode = this.nodes.find(n => n.id === (typeof link.source === 'object' ? link.source.id : link.source));
        const toNode   = this.nodes.find(n => n.id === (typeof link.target === 'object' ? link.target.id : link.target));

        const project  = store.getState().projects.find(p => p.id === this.projectId) || {};
        const relatedWo = (project.work_orders || []).find(w => w.flowId === e.id || w.from === e.from);

        panel.innerHTML = `
        <div class="dm-card" style="border-color:${color};">
            <button id="btnBackSearch" style="background:transparent;border:none;color:#666;cursor:pointer;font-size:0.78rem;margin-bottom:10px;padding:0;">← Volver</button>
            <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px;">
                <span class="exchange-badge ${tipo === 'intangible' ? 'badge-int' : 'badge-tang'}">${tipo}</span>
                ${link.automatable ? '<span class="exchange-badge badge-auto">⚡ auto</span>' : ''}
                ${e.frequency ? `<span class="exchange-badge badge-auto">${e.frequency}</span>` : ''}
            </div>
            <div class="dm-title" style="color:${color};">${label}</div>
            <div style="display:flex;align-items:center;gap:8px;margin:8px 0;font-size:0.75rem;color:#888;">
                <span style="color:${fromNode?.color||'#888'};font-weight:bold;">${fromNode?.name||'?'}</span>
                <span style="color:#444;">──▶</span>
                <span style="color:${toNode?.color||'#888'};font-weight:bold;">${toNode?.name||'?'}</span>
            </div>
            <div class="dm-content">${e.context || e.description || 'Intercambio de valor entre roles.'}</div>
            ${e.horas || e.estimatedHours ? `<div style="font-size:0.7rem;color:#666;margin-top:6px;font-family:var(--font-mono);">⏱ ${e.estimatedHours || e.horas}h estimadas</div>` : ''}
            ${relatedWo ? `<div style="font-size:0.72rem;color:var(--accent-orange,#ff9100);margin-top:6px;">📋 WO: ${relatedWo.status || 'theoretical'}</div>` : ''}

            <div style="display:flex;flex-direction:column;gap:6px;margin-top:12px;">
                ${relatedWo
                    ? `<button class="dm-action-btn dm-btn-paper" id="btnOpenWo">📝 Abrir WO en Omni-Paper</button>`
                    : `<button class="dm-action-btn dm-btn-wo" id="btnCreateWo">➕ Crear Work Order</button>`
                }
                <button class="dm-action-btn dm-btn-edit" id="btnEditExchange">✏️ Editar exchange</button>
            </div>
        </div>`;

        panel.querySelector('#btnBackSearch')?.addEventListener('click', () => this._resetPanel());

        panel.querySelector('#btnOpenWo')?.addEventListener('click', () => {
            if (relatedWo && typeof window.navigateTo === 'function')
                window.navigateTo(`/paper?hash=${relatedWo.hash}`);
        });

        panel.querySelector('#btnCreateWo')?.addEventListener('click', async () => {
            // Crear WO desde el exchange y navegar a /project
            const autoLevel = (store.getState().projects.find(p=>p.id===this.projectId)?.settings?.automation_level) || 'review_first';
            const { workOrders } = WoGenerator.fromVnaNetwork(
                { nodes: this.nodes.map(n=>n.rawNode), exchanges: [e] },
                { automation_level: autoLevel }
            );
            if (workOrders.length) {
                const proj = store.getState().projects.find(p=>p.id===this.projectId);
                await store.dispatch({ type:'UPDATE_PROJECT_INFO', payload:{
                    projectId: this.projectId,
                    updates: { work_orders: [...(proj.work_orders||[]), ...workOrders] }
                }});
                panel.querySelector('#btnCreateWo').innerText = '✅ WO creada';
                setTimeout(() => { if (typeof window.navigateTo === 'function') window.navigateTo('/project'); }, 800);
            }
        });

        panel.querySelector('#btnEditExchange')?.addEventListener('click', () => {
            // Emitir evento para que ValueMapView abra un modal de edición
            window.dispatchEvent(new CustomEvent('vna:edit-exchange', { detail: { exchange: e, projectId: this.projectId } }));
        });
    }

    // ══════════════════════════════════════════════════════════════
    //  _showNodeDetails — panel para nodos KB (modo global)
    // ══════════════════════════════════════════════════════════════
    _showNodeDetails(node3D) {
        const panel = this.container.querySelector('#memeResultsList');
        const m     = node3D.rawNode;
        if (!m) return;

        const isAgent = node3D.group === 'agent';
        const isSkill = m.type === 'skill' || m.category === 'skill';
        const color   = node3D.color || 'var(--accent-indigo,#6366f1)';
        const tags    = (m.keywords || []).map(t => `<span class="dm-tag">#${t}</span>`).join('');
        const content = m.content ? m.content.substring(0, 280) + (m.content.length > 280 ? '…' : '') : '';

        let badges = '';
        if (isSkill) {
            const r = m.references?.length || 0, ev = m.evals?.length || 0, s = m.scripts?.length || 0;
            if (r>0) badges += `<span style="background:rgba(0,176,255,0.1);color:#00b0ff;padding:2px 7px;border-radius:4px;font-size:0.65rem;font-weight:bold;margin-right:4px;border:1px solid rgba(0,176,255,0.3);">📚 ${r}</span>`;
            if (ev>0) badges += `<span style="background:rgba(255,171,64,0.1);color:var(--accent-orange);padding:2px 7px;border-radius:4px;font-size:0.65rem;font-weight:bold;margin-right:4px;border:1px solid rgba(255,171,64,0.3);">📋 ${ev}</span>`;
            if (s>0) badges += `<span style="background:rgba(0,230,118,0.1);color:var(--accent-green);padding:2px 7px;border-radius:4px;font-size:0.65rem;font-weight:bold;border:1px solid rgba(0,230,118,0.3);">⚡ ${s}</span>`;
        }

        let actions = '';
        if (isAgent) {
            actions = `
            <select id="sel3DEquipSkill" style="background:#111;border:1px solid #444;color:white;padding:7px;border-radius:7px;width:100%;font-size:0.78rem;outline:none;margin-top:10px;">
                <option value="">-- Equipar Skill --</option>
                ${this.nodes.filter(n => n.rawNode?.type === 'skill').map(n => `<option value="${n.id}">${n.name}</option>`).join('')}
            </select>
            <button class="dm-action-btn dm-btn-edit" id="btn3DEquip" style="margin-top:6px;">⚙️ Equipar Skill</button>`;
        } else if (isSkill) {
            actions = `
            <button class="dm-action-btn dm-btn-edit"   id="btn3DEditSkill" style="margin-top:10px;">✏️ Editar en la Forja</button>
            <button class="dm-action-btn dm-btn-danger" id="btn3DTestSkill">🧪 CI/CD Pentest</button>`;
        }

        panel.innerHTML = `
        <div class="dm-card" style="border-color:${color};">
            <button id="btnBackSearch" style="background:transparent;border:none;color:#666;cursor:pointer;font-size:0.78rem;margin-bottom:9px;padding:0;">← Volver</button>
            <div class="dm-cat" style="color:${color}">${m.category || m.type || node3D.group}</div>
            <div class="dm-title">${node3D.name}</div>
            ${badges ? `<div style="margin-bottom:7px;">${badges}</div>` : ''}
            <div class="dm-content">${content}</div>
            <div class="dm-tags">${tags}</div>
            ${actions}
        </div>`;

        panel.querySelector('#btnBackSearch')?.addEventListener('click', () => this._resetPanel());
        panel.querySelector('#btn3DEquip')?.addEventListener('click', () => {
            const sid = panel.querySelector('#sel3DEquipSkill')?.value;
            if (!sid) return alert('Selecciona una skill');
            window.dispatchEvent(new CustomEvent('3d-equip-skill', { detail: { agentId: m.id, skillId: sid } }));
        });
        panel.querySelector('#btn3DEditSkill')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('open-forge-modal', { detail: { nodeId: m.id } }));
        });
        panel.querySelector('#btn3DTestSkill')?.addEventListener('click', e => {
            e.currentTarget.innerText = '🧪 Evaluando…';
            e.currentTarget.disabled  = true;
            window.dispatchEvent(new CustomEvent('3d-test-skill', { detail: { skillData: m } }));
        });
    }

    _resetPanel() {
        const panel = this.container.querySelector('#memeResultsList');
        panel.innerHTML = `<div style="color:#555;font-size:0.78rem;text-align:center;padding:24px;font-style:italic;">Clic en un rol o entregable para ver su detalle.</div>`;
        this.graph3D?.cameraPosition({ x:0, y:0, z:800 }, { x:0, y:0, z:0 }, 2000);
    }

    // ══════════════════════════════════════════════════════════════
    //  _setupInteractivity — búsqueda, seeds, fullscreen
    // ══════════════════════════════════════════════════════════════
    _setupInteractivity() {
        const searchInput   = this.container.querySelector('#memeSearchInput');
        const resultsList   = this.container.querySelector('#memeResultsList');
        const btnInject     = this.container.querySelector('#btnInjectSeeds');
        const btnFullscreen = this.container.querySelector('#btnToggleFullscreen');
        const mainLayout    = this.container.querySelector('#synapticMainLayout');

        searchInput?.addEventListener('input', async () => {
            const q = searchInput.value.toLowerCase().trim();
            if (!q) { this._resetPanel(); return; }
            await KB.init();
            const allNodes = await KB.getAllNodes();
            const matches  = allNodes.filter(n => n.title?.toLowerCase().includes(q) || n.id.toLowerCase().includes(q));
            resultsList.innerHTML = matches.slice(0, 12).map(n => `
                <div class="dm-card" data-id="${n.id}">
                    <div class="dm-cat">${n.category || n.type || '?'}</div>
                    <div class="dm-title">${n.title || n.id}</div>
                    <div class="dm-content">${n.description || n.content?.substring(0,80) || ''}</div>
                </div>`).join('')
                || `<div style="color:#555;text-align:center;padding:20px;font-size:0.78rem;">Sin resultados.</div>`;

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
                    await KB.deleteNode('skill_vna_architect');
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
}
