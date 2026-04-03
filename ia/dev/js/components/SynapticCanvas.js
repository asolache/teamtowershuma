// =============================================================================
// TEAMTOWERS SOS V10 — SYNAPTIC CANVAS
// Ruta: ia/dev/js/components/SynapticCanvas.js
// Motor WebGL 3D · Meta-Grafo Cuántico · VNA overlay · Drill-down fractal
// V10.3: repulsión fuerte · VNA en global · drill-down doble clic · agentes hijos
// =============================================================================

import { KB }          from '../core/kb.js';
import { store }       from '../core/store.js';
import { WoGenerator } from '../core/WoGenerator.js';

// ── Constantes de layout ──────────────────────────────────────────────────────
const REPULSION_GLOBAL = -800;   // Repulsión modo global — nodos bien separados
const REPULSION_VNA    = -600;   // Repulsión modo VNA
const REPULSION_DRILL  = -400;   // Repulsión modo drill-down (subgrafo compacto)

const LEVEL_GRAVITY = {          // Gravedad Casteller por levelId
    '@anxaneta':  400,
    '@aixecador': 250,
    '@dosos':     100,
    '@baixos':   -100,
    '@pinya':    -300
};

const ROLE_COLORS = {
    agent: '#6366f1', human: '#00e676', organization: '#ff9100',
    resource: '#00b0ff', process: '#e040fb'
};

export class SynapticCanvas {

    constructor(containerEl, optionsOrAgentId = {}) {
        this.container = containerEl;

        let opts = {};
        if (typeof optionsOrAgentId === 'string')                               opts = { agentId: optionsOrAgentId };
        else if (optionsOrAgentId && typeof optionsOrAgentId === 'object') opts = optionsOrAgentId;

        this.agentId   = opts.agentId   || null;
        this.projectId = opts.projectId || null;
        this.isVnaMode = opts.isVnaMode || false;

        this.nodes          = [];
        this.links          = [];
        this.graph3D        = null;
        this.resizeObserver = null;
        this.isFullscreen   = false;

        // Drill-down state
        this._drillNode   = null;   // nodo activo en drill-down
        this._globalNodes = [];     // snapshot del grafo global para volver
        this._globalLinks = [];
        this._isDrillMode = false;
    }

    // ══════════════════════════════════════════════════════════════
    //  render
    // ══════════════════════════════════════════════════════════════
    async render() {
        if (!this.container) return;

        const isVna   = this.isVnaMode;
        const panelTitle = isVna
            ? '⚙️ Matriz VNA 3D'
            : (this.agentId ? `🧠 Córtex 3D de ${this.agentId}` : '🌌 Meta-Grafo Cuántico (V10)');
        const helperText = isVna
            ? 'Clic → detalle · Doble clic → mapa interno del rol'
            : 'Clic → detalle · Doble clic → subgrafo del rol';

        this.container.innerHTML = `
        <style>
            .synaptic-layout { display:flex; width:100%; height:100%; background:#050508;
                border-radius:18px; overflow:hidden; border:1px solid var(--glass-border);
                box-shadow:inset 0 0 50px rgba(0,0,0,0.8); position:relative; transition:all 0.4s; }
            .synaptic-layout.fullscreen-mode { position:fixed; top:0; left:0; width:100vw; height:100vh;
                z-index:9999; border-radius:0; border:none; }

            .btn-fullscreen { position:absolute; top:14px; right:14px; z-index:50;
                background:rgba(0,0,0,0.5); border:1px solid #555; color:white;
                border-radius:8px; padding:6px 10px; cursor:pointer; font-size:1rem; transition:0.2s; }
            .btn-fullscreen:hover { background:rgba(99,102,241,0.2); border-color:var(--accent-indigo,#6366f1); }

            /* Botón drill-back — visible solo en drill-down */
            #btnDrillBack { position:absolute; top:14px; left:14px; z-index:50;
                background:rgba(99,102,241,0.15); border:1px solid var(--accent-indigo,#6366f1);
                color:var(--accent-indigo,#6366f1); border-radius:8px; padding:6px 12px;
                cursor:pointer; font-size:0.82rem; font-weight:bold; transition:0.2s; display:none; }
            #btnDrillBack:hover { background:rgba(99,102,241,0.3); }
            #btnDrillBack.visible { display:block; }

            /* Breadcrumb nivel */
            #drillBreadcrumb { position:absolute; bottom:14px; left:50%; transform:translateX(-50%);
                z-index:50; background:rgba(0,0,0,0.7); border:1px solid #333; color:#888;
                border-radius:20px; padding:4px 14px; font-size:0.72rem; font-family:var(--font-mono);
                pointer-events:none; display:none; white-space:nowrap; }
            #drillBreadcrumb.visible { display:block; }

            .synaptic-palette { width:288px; background:linear-gradient(90deg,rgba(5,5,8,0.97),rgba(10,10,15,0.85));
                border-right:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column;
                z-index:10; backdrop-filter:blur(15px); box-shadow:10px 0 30px rgba(0,0,0,0.5); }
            .palette-header { padding:14px; border-bottom:1px solid rgba(255,255,255,0.05);
                display:flex; flex-direction:column; gap:9px; }
            .palette-title  { color:white; font-weight:900; font-size:0.95rem; margin:0;
                text-transform:uppercase; letter-spacing:1px; }
            .palette-search { background:rgba(0,0,0,0.5); border:1px solid #444; color:white;
                padding:8px 11px; border-radius:9px; font-family:var(--font-main); font-size:0.82rem;
                outline:none; width:100%; box-sizing:border-box; transition:0.2s; }
            .palette-search:focus { border-color:var(--accent-indigo,#6366f1); }
            .btn-inject-seeds { background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(224,64,251,0.1));
                border:1px solid rgba(99,102,241,0.3); color:var(--accent-indigo,#6366f1);
                padding:7px 12px; border-radius:8px; font-weight:bold; cursor:pointer;
                transition:0.2s; font-size:0.76rem; }
            .btn-inject-seeds:hover { background:var(--accent-indigo,#6366f1); color:white; }
            .meme-results-list { flex:1; overflow-y:auto; padding:9px; display:flex; flex-direction:column; gap:6px; }

            .dm-card { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06);
                border-radius:10px; padding:11px; transition:0.2s; cursor:pointer; }
            .dm-card:hover { border-color:var(--accent-indigo,#6366f1); background:rgba(99,102,241,0.05); }
            .dm-cat   { font-size:0.6rem; font-family:var(--font-mono); color:var(--accent-indigo,#6366f1);
                text-transform:uppercase; font-weight:bold; margin-bottom:4px; }
            .dm-title { font-weight:900; color:white; font-size:0.88rem; margin-bottom:5px; }
            .dm-content { color:#777; font-size:0.76rem; line-height:1.5;
                display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
            .dm-tags  { display:flex; flex-wrap:wrap; gap:3px; margin-top:6px; }
            .dm-tag   { background:rgba(0,0,0,0.5); color:#555; font-size:0.6rem;
                padding:2px 5px; border-radius:4px; font-family:var(--font-mono); }

            .dm-action-btn { display:block; width:100%; padding:6px 10px; border-radius:7px;
                font-size:0.73rem; font-weight:bold; cursor:pointer; transition:0.2s;
                text-align:center; text-decoration:none; margin-top:5px; }
            .dm-btn-edit  { background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.3);
                color:var(--accent-indigo,#6366f1); }
            .dm-btn-paper { background:rgba(0,176,255,0.08); border:1px solid rgba(0,176,255,0.25); color:#00b0ff; }
            .dm-btn-wo    { background:rgba(0,230,118,0.08); border:1px solid rgba(0,230,118,0.25);
                color:var(--accent-green,#00e676); }
            .dm-btn-drill { background:rgba(224,64,251,0.08); border:1px solid rgba(224,64,251,0.3);
                color:var(--accent-purple,#e040fb); }
            .dm-btn-danger{ background:rgba(255,82,82,0.08); border:1px solid rgba(255,82,82,0.25);
                color:var(--accent-red,#ff5252); }
            .dm-action-btn:hover { filter:brightness(1.3); }

            .exchange-badge { display:inline-flex; align-items:center; gap:4px; padding:2px 7px;
                border-radius:5px; font-size:0.62rem; font-weight:bold; font-family:var(--font-mono); }
            .badge-tang { background:rgba(0,230,118,0.08); color:var(--accent-green,#00e676); border:1px solid rgba(0,230,118,0.2); }
            .badge-int  { background:rgba(224,64,251,0.08); color:var(--accent-purple,#e040fb); border:1px solid rgba(224,64,251,0.2); }
            .badge-auto { background:rgba(99,102,241,0.08); color:var(--accent-indigo,#6366f1); border:1px solid rgba(99,102,241,0.2); }

            .synaptic-3d-container { flex:1; position:relative; overflow:hidden;
                background:radial-gradient(circle at center,#0a0a10 0%,#000 100%); }
            .webgl-target  { width:100%; height:100%; outline:none; cursor:crosshair; }
            .graph-tooltip { position:absolute; background:rgba(10,10,15,0.97); border:1px solid #555;
                color:white; padding:8px 12px; border-radius:8px; font-family:var(--font-main);
                font-size:0.78rem; pointer-events:none; z-index:100; backdrop-filter:blur(10px);
                box-shadow:0 8px 20px rgba(0,0,0,0.8); display:none; transform:translate(-50%,-150%);
                white-space:nowrap; }
            .tt-cat  { font-size:0.58rem; color:var(--accent-indigo,#6366f1); font-family:var(--font-mono);
                text-transform:uppercase; font-weight:bold; margin-bottom:2px; }
            .tt-title{ font-weight:900; font-size:0.88rem; }
            .tt-sub  { font-size:0.7rem; color:#aaa; margin-top:2px; }
            .loader-3d { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
                color:var(--accent-indigo,#6366f1); font-family:var(--font-mono); font-weight:bold;
                font-size:1rem; text-transform:uppercase; letter-spacing:2px;
                animation:pulse3d 1.5s infinite; pointer-events:none; z-index:20; }
            @keyframes pulse3d { 0%,100%{opacity:0.4;} 50%{opacity:1;text-shadow:0 0 20px var(--accent-indigo,#6366f1);} }
            @media (max-width:768px) { .synaptic-layout{flex-direction:column-reverse;}
                .synaptic-palette{width:100%;height:40%;border-right:none;border-top:1px solid #333;}
                .synaptic-3d-container{height:60%;} }
        </style>

        <div class="synaptic-layout" id="synapticMainLayout">
            <button class="btn-fullscreen" id="btnToggleFullscreen" title="Pantalla Completa">⛶</button>
            <button id="btnDrillBack">← Subir nivel</button>
            <div id="drillBreadcrumb">🌌 Global</div>

            <div class="synaptic-palette">
                <div class="palette-header">
                    <h3 class="palette-title">${panelTitle}</h3>
                    <input type="text" id="memeSearchInput" class="palette-search" placeholder="🔍 Buscar nodos…">
                    <button class="btn-inject-seeds" id="btnInjectSeeds">✨ Forjar Semillas Antigravity</button>
                </div>
                <div class="meme-results-list" id="memeResultsList">
                    <div style="color:#444;font-size:0.76rem;text-align:center;padding:22px;font-style:italic;line-height:1.6;">${helperText}</div>
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
    //  loadInitialData — KB + VNA overlay + agentes hijos
    // ══════════════════════════════════════════════════════════════
    async loadInitialData() {
        await KB.init();
        const allNodes = await KB.getAllNodes();
        const state    = store.getState();
        const project  = state.projects.find(p => p.id === localStorage.getItem('tt_active_project'))
                      || state.projects.at(-1);

        this.nodes = [];
        this.links = [];

        const addNode = (id, name, group, val, color, rawNode, extra = {}) => {
            if (!this.nodes.find(n => n.id === id))
                this.nodes.push({ id, name, group, val, color, rawNode, ...extra });
        };
        const addLink = (source, target, isDep = false, linkData = {}) => {
            if (!source || !target) return;
            if (this.nodes.some(n => n.id === source) && this.nodes.some(n => n.id === target))
                this.links.push({ source, target, isDependencies: isDep, ...linkData });
        };

        const colorMass = (cat) => {
            if (!cat) return { c:'#888', m:10 };
            if (cat.startsWith('core.architecture')) return { c:'#6366f1', m:28 };
            if (cat.startsWith('core.economy'))      return { c:'#00e676', m:28 };
            if (cat.startsWith('core.cognition'))    return { c:'#e040fb', m:28 };
            if (cat.startsWith('core.execution'))    return { c:'#ff9100', m:28 };
            if (cat.startsWith('core.culture'))      return { c:'#ff5252', m:28 };
            if (cat === 'skill')                     return { c:'#ffd740', m:16 };
            if (cat === 'reference')                 return { c:'#00b0ff', m:13 };
            if (cat === 'eval')                      return { c:'#ff9100', m:11 };
            if (cat === 'script')                    return { c:'#69f0ae', m:11 };
            return { c:'#888', m:10 };
        };

        // Kernel
        addNode('core_kernel', 'SOS V10 Kernel', 'core_os', 50, '#6366f1', null);

        // Proyectos
        state.projects?.forEach(p => {
            addNode(p.id, p.nombre, 'project_core', 32, '#00e676', p);
            addLink('core_kernel', p.id);
        });

        // ── Clustering V10.2 — Orquestadores como centros de gravedad ──
        const allUsers = state.globalUsers || [];
        const isOrchestrator = (u) =>
            u.profile?.isAi && (
                u.profile?.role === 'orchestrator' ||
                u.globalRole   === 'orchestrator'  ||
                u.id.includes('orchestrator') ||
                u.id.includes('synthesizer')  ||
                u.id.includes('architect')    ||
                u.id === 'node-claude-sonnet-v10'
            );

        const orchUsers  = allUsers.filter(isOrchestrator);
        const agentUsers = allUsers.filter(u => u.profile?.isAi && !isOrchestrator(u));

        // Orquestadores — anclados con fx/fz, radio según cuántos hay
        orchUsers.forEach((orch, i) => {
            const oid   = `orch_${orch.id.replace(/[@\s]/g,'_')}`;
            const angle = (i / Math.max(orchUsers.length, 1)) * Math.PI * 2;
            const R     = orchUsers.length === 1 ? 0 : 260;
            addNode(oid, orch.name || orch.id, 'orchestrator', 38, '#e040fb',
                { ...orch, type: 'orchestrator', category: 'orchestration' }, {
                _isOrchestrator: true, _userId: orch.id,
                fx: Math.cos(angle) * R,
                fy: 0,
                fz: Math.sin(angle) * R
            });
            addLink('core_kernel', oid, false, { tipo: 'orchestration', label: 'swarm' });
        });

        // Agentes — SIN posición fija, la simulación de fuerzas los separa
        // El link al orquestador actúa como atractor, la repulsión global los distribuye
        agentUsers.forEach((u, i) => {
            const pid     = `agent_${u.id.replace(/[@\s]/g,'_')}`;
            const orchIdx = i % Math.max(orchUsers.length, 1);
            const orch    = orchUsers[orchIdx];
            const orchId  = orch ? `orch_${orch.id.replace(/[@\s]/g,'_')}` : 'core_kernel';
            const archColor = this._archetypeColor(u.profile?.guardian || 'everyman');
            // Sin fx/fz — la física los distribuye con repulsión natural
            addNode(pid, u.name || u.id, 'agent', 18, archColor,
                { ...u, type: 'agent', category: 'agent' }, {
                _isAgent: true, _userId: u.id
            });
            addLink(orchId, pid, false, { tipo: 'swarm-member', label: '🤖' });
        });

        // Nodos KB
        // ── KB nodes — lazy: solo core + máximo 40 nodos al inicio ──
        // El detalle se carga bajo demanda al hacer click (expandNode)
        const MAX_INITIAL_KB = 40;
        const PRIORITY_TYPES = ['prompt_a2a','business_model','landing','cluster','eval'];

        // Ordenar por prioridad: core primero, luego por tipo, luego el resto
        const sortedNodes = [...allNodes].sort((a, b) => {
            const aPrio = PRIORITY_TYPES.includes(a.type) ? 0 : 1;
            const bPrio = PRIORITY_TYPES.includes(b.type) ? 0 : 1;
            if (aPrio !== bPrio) return aPrio - bPrio;
            // Skills del kernel antes que skills importadas
            if (a.category === 'core.architecture') return -1;
            if (b.category === 'core.architecture') return 1;
            return 0;
        });

        const visibleNodes = sortedNodes.slice(0, MAX_INITIAL_KB);
        const hiddenCount  = allNodes.length - visibleNodes.length;

        visibleNodes.forEach(m => {
            const { c, m: mass } = colorMass(m.category || m.type);
            addNode(m.id, m.title || m.id, m.category || m.type, mass, c, m);
            state.globalUsers?.forEach(u => {
                const pNode = allNodes.find(n => n.id === `prompt_global_${u.id.replace('@','')}`);
                if (pNode?.dependencies?.includes(m.id)) addLink(pNode.id, m.id, true);
            });
            ['references','evals','scripts'].forEach(dep => {
                if (Array.isArray(m[dep])) m[dep].forEach(cid => {
                    if (visibleNodes.find(n => n.id === cid)) addLink(m.id, cid, true);
                });
            });
            if (m.projectId && m.projectId !== 'global' && this.nodes.find(n => n.id === m.projectId))
                addLink(m.projectId, m.id);
            else if (m.projectId === 'global' && m.type === 'skill')
                addLink('core_kernel', m.id, true);
        });

        // Nodo resumen "más nodos" si hay ocultos
        if (hiddenCount > 0) {
            addNode('_kb_more', `+${hiddenCount} nodos en KB`, 'kb_summary', 12, '#333', null, {
                _isKbMore: true, _hiddenCount: hiddenCount, _allNodes: allNodes
            });
            addLink('core_kernel', '_kb_more', true);
        }

        // Guardar referencia al KB completo para expansión bajo demanda
        this._allKbNodes = allNodes;

        // ── Overlay VNA del proyecto activo ───────────────────────
        if (project) {
            const vnaNodes     = project.vna_nodes     || [];
            const vnaExchanges = project.vna_exchanges || [];

            vnaNodes.forEach(n => {
                const vid = `vna_${n.id}`;
                const gravity = LEVEL_GRAVITY[n.levelId] || (n.tier != null ? [300,150,0,-150,-300][Math.min(n.tier,4)] : 0);
                addNode(vid, n.label || n.id, 'vna-overlay', this._vnaSize(n), ROLE_COLORS[n.role] || '#888',
                    { ...n, type:'vna-node', category: n.role || 'process' },
                    { fy: gravity, _isVna: true, _rawVna: n });
                addLink(project.id, vid, false, { _isVnaLink: true, tipo: 'vna-role' });
            });

            vnaExchanges.forEach(e => {
                const src = `vna_${e.from}`;
                const tgt = `vna_${e.to}`;
                if (!this.nodes.find(n => n.id === src) || !this.nodes.find(n => n.id === tgt)) return;
                this.links.push({
                    source: src, target: tgt,
                    isDependencies: false, _isVnaLink: true,
                    tipo: e.type || 'tangible', category: e.category || 'deliverable',
                    label: e.label || e.template || '',
                    automatable: e.automatable || false,
                    rawTx: e
                });
            });
        }

        // Guardar snapshot global
        this._globalNodes = [...this.nodes];
        this._globalLinks = [...this.links];
    }

    // ══════════════════════════════════════════════════════════════
    //  loadVNAData / loadVnaNetwork — modo VNA puro
    // ══════════════════════════════════════════════════════════════
    async loadVNAData() {
        const project = store.getState().projects.find(p => p.id === this.projectId);
        if (!project) return;
        this._buildVnaGraph(project.vna_nodes || [], project.vna_exchanges || []);
        this._globalNodes = [...this.nodes];
        this._globalLinks = [...this.links];
    }

    async loadVnaNetwork(network) {
        if (!network?.nodes) return;
        this._buildVnaGraph(network.nodes, network.exchanges || []);
        this._globalNodes = [...this.nodes];
        this._globalLinks = [...this.links];
        if (this.graph3D) this.graph3D.graphData({ nodes: this.nodes, links: this.links });
    }

    _buildVnaGraph(vnaNodes, vnaExchanges) {
        this.nodes = [];
        this.links = [];

        // ── Nodo central virtual — ancla gravitacional ────────────
        // No tiene visual propio, solo actúa como centro de masa
        this.nodes.push({
            id:      'vna_center',
            name:    '⬡',
            group:   'vna_center',
            val:     6,
            color:   'rgba(255,255,255,0.08)',
            rawNode: { type: 'vna_center', category: 'vna_center' },
            fx: 0, fy: 0, fz: 0,   // anclado en el origen
            _isVnaCenter: true
        });

        // ── Distribuir roles radialmente ──────────────────────────
        // Cada nivel Casteller tiene su radio — @anxaneta más cerca del centro
        const LEVEL_RADIUS = {
            '@anxaneta':  80,
            '@aixecador': 160,
            '@dosos':     240,
            '@baixos':    320,
            '@pinya':     400
        };
        const DEFAULT_RADIUS = 200;

        // Agrupar nodos por nivel para distribuirlos angularmente
        const byLevel = {};
        vnaNodes.forEach(n => {
            const lv = n.levelId || `tier_${n.tier || 2}`;
            if (!byLevel[lv]) byLevel[lv] = [];
            byLevel[lv].push(n);
        });

        // Asignar posición angular dentro de cada nivel
        vnaNodes.forEach(n => {
            const lv      = n.levelId || `tier_${n.tier || 2}`;
            const group   = byLevel[lv];
            const idx     = group.indexOf(n);
            const total   = group.length;
            const angle   = (idx / Math.max(total, 1)) * Math.PI * 2;
            const radius  = LEVEL_RADIUS[n.levelId] || DEFAULT_RADIUS;

            this.nodes.push({
                id:      n.id,
                name:    n.label || n.id,
                group:   n.role  || 'process',
                val:     this._vnaSize(n),
                color:   ROLE_COLORS[n.role] || '#888',
                rawNode: { ...n, type:'vna-node', category: n.role || 'process' },
                // Posición inicial sugerida — la simulación la refinará
                // fx/fz fijos para que queden en su anillo, fy libre
                fx: Math.cos(angle) * radius,
                fz: Math.sin(angle) * radius,
                fy: 0,
                _isVna:  true,
                _rawVna: n
            });

            // Link invisible al centro — fuerza de atracción radial
            this.links.push({
                source: 'vna_center', target: n.id,
                _isCenterLink: true,
                isDependencies: true,
                tipo: 'gravity'
            });
        });

        // ── Exchanges como links visibles ─────────────────────────
        vnaExchanges.forEach(e => {
            if (!this.nodes.find(n => n.id === e.from) || !this.nodes.find(n => n.id === e.to)) return;
            this.links.push({
                source: e.from, target: e.to, isDependencies: false,
                tipo: e.type || 'tangible', category: e.category || 'deliverable',
                label: e.label || e.template || e.entregable || '',
                automatable: e.automatable || false, rawTx: e
            });
        });
    }

    // ══════════════════════════════════════════════════════════════
    //  LAZY LOADING — expansión de nodos bajo demanda
    // ══════════════════════════════════════════════════════════════

    // Expande los vecinos directos de un nodo (nodos que lo referencian o son referenciados)
    _expandNeighbors(node) {
        if (!this._allKbNodes || !this.graph3D) return;
        const existing = new Set(this.nodes.map(n => n.id));
        const toAdd    = [];

        this._allKbNodes.forEach(m => {
            if (existing.has(m.id)) return;
            const refs = [...(m.references||[]), ...(m.evals||[]), ...(m.scripts||[])];
            const isNeighbor = refs.includes(node.id)
                || (m.projectId === node.id)
                || (node.rawNode?.references||[]).includes(m.id)
                || (node.rawNode?.evals||[]).includes(m.id);
            if (isNeighbor) toAdd.push(m);
        });

        if (!toAdd.length) return;

        const { c: defColor, m: defMass } = { c:'#888', m:10 };
        const colorMass = (cat) => {
            if (!cat) return { c:'#888', m:10 };
            if (cat.startsWith('core.architecture')) return { c:'#6366f1', m:28 };
            if (cat.startsWith('core.economy'))      return { c:'#00e676', m:28 };
            if (cat.startsWith('core.cognition'))    return { c:'#e040fb', m:28 };
            if (cat.startsWith('core.execution'))    return { c:'#ff9100', m:28 };
            if (cat === 'skill')                     return { c:'#ffd740', m:16 };
            if (cat === 'eval')                      return { c:'#ff9100', m:11 };
            return { c:'#888', m:10 };
        };

        toAdd.forEach(m => {
            const { c, m: mass } = colorMass(m.category || m.type);
            // Posicionar cerca del nodo padre
            const spread = 60;
            this.nodes.push({
                id: m.id, name: m.title || m.id,
                group: m.category || m.type,
                val: mass, color: c, rawNode: m,
                x: (node.x||0) + (Math.random()-0.5)*spread,
                y: (node.y||0) + (Math.random()-0.5)*spread,
                z: (node.z||0) + (Math.random()-0.5)*spread
            });
            this.links.push({ source: node.id, target: m.id, isDependencies: true });
        });

        // Actualizar grafo sin reiniciar la simulación
        this.graph3D.graphData({ nodes: this.nodes, links: this.links });
        console.log(`[Canvas] +${toAdd.length} vecinos expandidos desde "${node.name}"`);
    }

    // Expande todos los nodos ocultos del KB (al hacer click en el nodo "+N")
    _expandKbAll() {
        if (!this._allKbNodes || !this.graph3D) return;
        const existing = new Set(this.nodes.map(n => n.id));
        // Eliminar nodo resumen
        this.nodes = this.nodes.filter(n => n.id !== '_kb_more');
        this.links = this.links.filter(l => {
            const s = typeof l.source === 'object' ? l.source.id : l.source;
            const t = typeof l.target === 'object' ? l.target.id : l.target;
            return s !== '_kb_more' && t !== '_kb_more';
        });

        this._allKbNodes.forEach(m => {
            if (existing.has(m.id) || m.id === '_kb_more') return;
            this.nodes.push({ id:m.id, name:m.title||m.id, group:m.category||m.type, val:10, color:'#555', rawNode:m });
            if (m.projectId === 'global' && m.type === 'skill')
                this.links.push({ source:'core_kernel', target:m.id, isDependencies:true });
        });

        this.graph3D.graphData({ nodes:this.nodes, links:this.links });
        console.log(`[Canvas] KB completo expandido: ${this.nodes.length} nodos totales`);
    }

    _vnaSize(n) {
        if (n.levelId) return { '@anxaneta':42,'@aixecador':32,'@dosos':24,'@baixos':18,'@pinya':14 }[n.levelId] || 20;
        const t = Number(n.tier || 2);
        return t === 0 ? 40 : t === 1 ? 28 : t === 2 ? 20 : 14;
    }

    // ══════════════════════════════════════════════════════════════
    //  _archetypeAngle — ángulo en radianes del sector de un arquetipo
    //  360° / 13 = 27.69° por sector
    // ══════════════════════════════════════════════════════════════
    _archetypeAngle(archetypeId) {
        const ORDER = [
            'innocent','explorer','sage','hero','outlaw','magician',
            'lover','jester','caregiver','creator','ruler','everyman','threshold'
        ];
        const idx = ORDER.indexOf(archetypeId);
        const pos = idx >= 0 ? idx : Math.floor(Math.random() * 13);
        return (pos / 13) * Math.PI * 2;
    }

    // ── Color por arquetipo ───────────────────────────────────────
    _archetypeColor(archetypeId) {
        const COLORS = {
            innocent:'#ffffff', explorer:'#00b0ff', sage:'#6366f1',
            hero:'#ff9100',     outlaw:'#ff5252',   magician:'#e040fb',
            lover:'#ff4081',    jester:'#ffd740',   caregiver:'#00e676',
            creator:'#69f0ae',  ruler:'#ffc400',    everyman:'#aaaaaa',
            threshold:'#e0e0e0'
        };
        return COLORS[archetypeId] || '#888';
    }

    // ══════════════════════════════════════════════════════════════
    //  Drill-down — subgrafo de un rol con 13 sectores arquetípicos
    // ══════════════════════════════════════════════════════════════
    async _drillInto(node3D) {
        const state   = store.getState();
        const project = state.projects.find(p => p.id === (this.projectId || localStorage.getItem('tt_active_project')));
        if (!project) return;

        if (!this._isDrillMode) {
            this._globalNodes = [...this.nodes];
            this._globalLinks = [...this.links];
        }
        this._isDrillMode = true;
        this._drillNode   = node3D;

        const rawVna = node3D._rawVna || node3D.rawNode;
        const roleId = rawVna?.id || node3D.id.replace('vna_','');
        const color  = node3D.color || '#6366f1';

        const drillNodes = [];
        const drillLinks = [];

        const addD = (id, name, group, val, c, raw, extra = {}) =>
            drillNodes.push({ id, name, group, val, color: c, rawNode: raw, ...extra });
        const addL = (s, t, data = {}) => {
            if (drillNodes.find(n => n.id === s) && drillNodes.find(n => n.id === t))
                drillLinks.push({ source: s, target: t, ...data });
        };

        // ── Nodo central ──────────────────────────────────────────
        addD('drill_center', node3D.name, 'drill_center', 45, color, rawVna, { fx: 0, fy: 0, fz: 0 });

        // ── Anillos de distancia por tipo de nodo ─────────────────
        const R_WO     = 180;   // Work Orders — anillo interior
        const R_AGENT  = 300;   // Agentes     — anillo medio
        const R_SKILL  = 240;   // Skills      — anillo medio-bajo
        const R_EVAL   = 380;   // Evals       — anillo exterior

        // ── WOs — posicionadas por arquetipo del flow ─────────────
        const wos   = (project.work_orders || []).filter(w => w.from === roleId || w.to === roleId);
        const flows = (project.vna_flows   || []).filter(f => f.from === roleId || f.to === roleId);

        ;[...wos, ...flows].slice(0, 12).forEach((w, i) => {
            const wId    = `drill_wo_${i}`;
            const label  = w.entregable || w.template || w.comentario || `WO ${i+1}`;
            const wColor = w.automation === 'auto' ? '#6366f1' : w.woType === 'intangible' ? '#e040fb' : '#00e676';
            // Distribuir en 13 sectores si hay arquetipo, si no uniformemente
            const arch  = w.archetype || null;
            const angle = arch ? this._archetypeAngle(arch) : (i / Math.max(wos.length + flows.length, 1)) * Math.PI * 2;
            addD(wId, label.substring(0, 28), 'work_order', 14, wColor,
                { ...w, type: 'work_order', category: w.woType || 'deliverable' }, {
                fx: Math.cos(angle) * R_WO,
                fz: Math.sin(angle) * R_WO,
                fy: 0
            });
            addL('drill_center', wId, { tipo: w.tipo || w.woType || 'tangible', label: label.substring(0, 22), rawTx: w });
        });

        // ── Agentes — distribuidos por arquetipo ──────────────────
        const assignedIds = new Set([
            ...wos.map(w => w.assigneeId).filter(Boolean),
            ...(project.usuarios || []).filter(u => u.roleId === roleId).map(u => u.id)
        ]);

        const agents = state.globalUsers.filter(u => assignedIds.has(u.id) || u.profile?.isAi).slice(0, 13);
        agents.forEach((u, i) => {
            const aId    = `drill_agent_${i}`;
            const arch   = u.profile?.guardian || 'everyman';
            const angle  = this._archetypeAngle(arch);
            const aColor = this._archetypeColor(arch);
            addD(aId, u.name, 'agent', 20, aColor,
                { ...u, type: 'agent' }, {
                fx: Math.cos(angle) * R_AGENT,
                fz: Math.sin(angle) * R_AGENT,
                fy: 60
            });
            addL('drill_center', aId, { tipo: 'intangible', label: u.profile?.isAi ? '🤖 IA' : '👤 casteller' });
        });

        // ── Skills — por arquetipo de la skill ────────────────────
        await KB.init();
        const allKb  = await KB.getAllNodes();
        const skills = allKb.filter(n =>
            (n.type === 'skill' || n.type === 'skill_antigravity') &&
            (n.projectId === project.id || n.projectId === 'global')
        ).slice(0, 13);

        skills.forEach((s, i) => {
            const sId    = `drill_skill_${i}`;
            const arch   = s.archetype || s.guardian || 'creator';
            const angle  = this._archetypeAngle(arch);
            const sColor = s.type === 'skill_antigravity' ? '#e040fb' : '#ffd740';
            const label  = s.type === 'skill_antigravity' ? `[AG] ${s.title}` : s.title || s.id;
            addD(sId, label.substring(0, 28), 'skill', s.type === 'skill_antigravity' ? 10 : 12, sColor, s, {
                fx: Math.cos(angle) * R_SKILL,
                fz: Math.sin(angle) * R_SKILL,
                fy: -60
            });
            addL('drill_center', sId, { isDependencies: true, tipo: 'knowledge', label: s.type === 'skill_antigravity' ? '⚡ AG' : '⚡ skill' });
        });

        // ── Evals — anillo exterior, distribuidos por arquetipo ────
        const projectEvals = (project.evals || []).filter(e => e.parentId === roleId);
        projectEvals.slice(0, 13).forEach((e, i) => {
            const eId    = `drill_eval_${i}`;
            const arch   = e.archetype || 'sage';
            const angle  = this._archetypeAngle(arch);
            const eColor = e.status === 'passed' ? '#00e676' : e.status === 'failed' ? '#ff5252' : e.status === 'active' ? '#ff9100' : '#444';
            const icon   = e.status === 'passed' ? '✅' : e.status === 'failed' ? '❌' : e.status === 'active' ? '🔄' : '○';
            addD(eId, `${icon} ${e.criteria?.substring(0, 22) || 'Eval'}`, 'eval', 9, eColor,
                { ...e, type: 'eval' }, {
                fx: Math.cos(angle) * R_EVAL,
                fz: Math.sin(angle) * R_EVAL,
                fy: -120
            });
            addL('drill_center', eId, { tipo: 'eval', label: `L${e.level || 0}`, _isEvalLink: true });
        });

        // ── Sector rings visuales (labels de arquetipos en el canvas) ──
        // Los 13 labels flotantes que muestran qué arquetipo está en cada sector
        const ARCH_LABELS = [
            { id:'innocent',icon:'🕊️'}, { id:'explorer',icon:'🧭'}, { id:'sage',icon:'🦉'},
            { id:'hero',icon:'⚔️'},      { id:'outlaw',icon:'🏴'},   { id:'magician',icon:'✨'},
            { id:'lover',icon:'🔥'},     { id:'jester',icon:'🃏'},   { id:'caregiver',icon:'❤️'},
            { id:'creator',icon:'🎨'},   { id:'ruler',icon:'👑'},    { id:'everyman',icon:'🤝'},
            { id:'threshold',icon:'🌀'}
        ];
        const R_LABEL = 460;
        ARCH_LABELS.forEach((a, i) => {
            const angle = (i / 13) * Math.PI * 2;
            addD(`drill_arch_${i}`, a.icon, 'archetype_label', 6, this._archetypeColor(a.id),
                { type: 'archetype', id: a.id }, {
                fx: Math.cos(angle) * R_LABEL,
                fz: Math.sin(angle) * R_LABEL,
                fy: 0
            });
        });

        this.nodes = drillNodes;
        this.links = drillLinks;

        if (this.graph3D) {
            this.graph3D.graphData({ nodes: drillNodes, links: drillLinks });
            try { this.graph3D.d3Force('charge')?.strength(REPULSION_DRILL); } catch(_) {}
            this.graph3D.cameraPosition({ x: 0, y: 0, z: 700 }, { x: 0, y: 0, z: 0 }, 800);
        }

        const btnBack = this.container.querySelector('#btnDrillBack');
        const crumb   = this.container.querySelector('#drillBreadcrumb');
        if (btnBack) btnBack.classList.add('visible');
        if (crumb)   { crumb.textContent = `🌌 Global → ${node3D.name}`; crumb.classList.add('visible'); }

        this._showVnaNodeDetails(node3D);
    }

    _drillBack() {
        if (!this._isDrillMode) return;
        this._isDrillMode = false;
        this._drillNode   = null;
        this.nodes        = [...this._globalNodes];
        this.links        = [...this._globalLinks];

        if (this.graph3D) {
            this.graph3D.graphData({ nodes: this.nodes, links: this.links });
            const rep = this.isVnaMode ? REPULSION_VNA : REPULSION_GLOBAL;
            this.graph3D.d3Force('charge')?.strength(rep);
            this.graph3D.cameraPosition({ x:0, y:0, z:800 }, { x:0, y:0, z:0 }, 800);
        }

        const btnBack = this.container.querySelector('#btnDrillBack');
        const crumb   = this.container.querySelector('#drillBreadcrumb');
        if (btnBack) btnBack.classList.remove('visible');
        if (crumb)   crumb.classList.remove('visible');

        this._resetPanel();
    }

    // ══════════════════════════════════════════════════════════════
    //  _initWebGLGraph
    // ══════════════════════════════════════════════════════════════
    async _initWebGLGraph() {
        const canvasInner = this.container.querySelector('#webglCanvasInner');
        const loader      = this.container.querySelector('#loader3D');
        const tooltip     = this.container.querySelector('#graphTooltip');

        const loadScript = async (urls, gv) => {
            if (window[gv]) return;
            for (const url of urls) {
                try {
                    await new Promise((res, rej) => {
                        const s = document.createElement('script');
                        s.src = url; s.crossOrigin = 'anonymous';
                        s.onload = res; s.onerror = () => rej();
                        document.head.appendChild(s);
                    });
                    return;
                } catch (_) {}
            }
            throw new Error(`CDN colapso: ${gv}`);
        };

        try {
            await loadScript(['https://unpkg.com/three@0.147.0/build/three.min.js','https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js'], 'THREE');
            await loadScript(['https://unpkg.com/three-spritetext','https://cdn.jsdelivr.net/npm/three-spritetext'], 'SpriteText');
            await loadScript(['https://unpkg.com/3d-force-graph','https://cdn.jsdelivr.net/npm/3d-force-graph'], 'ForceGraph3D');
        } catch (e) {
            if (loader) loader.innerText = 'Error CDN. Red bloqueando scripts externos.';
            return;
        }
        if (loader) loader.style.display = 'none';

        const repulsion = this.isVnaMode ? REPULSION_VNA : REPULSION_GLOBAL;

        this.graph3D = window.ForceGraph3D()(canvasInner)
            .graphData({ nodes: this.nodes, links: this.links })
            .nodeLabel('')
            .d3AlphaDecay(0.02)
            .d3VelocityDecay(0.3)

            // ── Colores de links ──────────────────────────────────
            .linkColor(link => {
                if (link._isCenterLink)                              return 'rgba(0,0,0,0)';  // invisible
                if (link._isVnaLink && link.tipo === 'vna-role')     return 'rgba(255,255,255,0.04)';
                if (link.tipo === 'tangible')    return 'rgba(0,230,118,0.65)';
                if (link.tipo === 'intangible')  return 'rgba(224,64,251,0.65)';
                if (link.tipo === 'knowledge')   return 'rgba(255,215,64,0.5)';
                const src = typeof link.source === 'object' ? link.source : this.nodes.find(n => n.id === link.source);
                const c   = src?.color || 'rgba(99,102,241,1)';
                return link.isDependencies ? c.replace(')',',0.15)').replace('rgb','rgba') : c.replace(')',',0.45)').replace('rgb','rgba');
            })
            .linkWidth(link => {
                if (link._isCenterLink)                              return 0;    // invisible
                if (link._isVnaLink && link.tipo === 'vna-role')     return 0.5;
                return link.isDependencies ? 0.6 : 2;
            })

            // ── Partículas ────────────────────────────────────────
            .linkDirectionalParticles(link => {
                if (link._isCenterLink)                              return 0;
                if (link._isVnaLink && link.tipo === 'vna-role')     return 0;
                if (link.tipo === 'tangible' || link.tipo === 'intangible') return 5;
                return link.isDependencies ? 0 : 2;
            })
            .linkDirectionalParticleSpeed(0.004)
            .linkDirectionalParticleWidth(3)
            .linkDirectionalParticleColor(link => {
                if (link.tipo === 'tangible')   return '#00e676';
                if (link.tipo === 'intangible') return '#e040fb';
                if (link.tipo === 'knowledge')  return '#ffd740';
                const src = typeof link.source === 'object' ? link.source : this.nodes.find(n => n.id === link.source);
                return src?.color || '#ffffff';
            })

            // ── Labels en links VNA ───────────────────────────────
            .linkThreeObjectExtend(true)
            .linkThreeObject(link => {
                const label = link.label;
                if (!label || (link._isVnaLink && link.tipo === 'vna-role') || link.isDependencies) return null;
                const sp = new window.SpriteText(label.substring(0, 28));
                sp.color           = link.tipo === 'intangible' ? '#e040fb' : (link.tipo === 'knowledge' ? '#ffd740' : '#00e676');
                sp.textHeight      = 3;
                sp.fontWeight      = 'bold';
                sp.backgroundColor = 'rgba(0,0,0,0.5)';
                sp.padding         = 2;
                sp.borderRadius    = 3;
                return sp;
            })
            .linkPositionUpdate((sprite, { start, end }) => {
                if (!sprite) return;
                Object.assign(sprite.position, {
                    x: start.x + (end.x - start.x) / 2,
                    y: start.y + (end.y - start.y) / 2,
                    z: start.z + (end.z - start.z) / 2
                });
            })

            .enableNodeDrag(false)

            // ── Objetos 3D de nodos ───────────────────────────────
            .nodeThreeObject(node => {
                // Nodo resumen KB "+N nodos" — invita a expandir
                if (node._isKbMore) {
                    const sp = new window.SpriteText(`+${node._hiddenCount}`);
                    sp.color      = '#444';
                    sp.textHeight = 8;
                    sp.fontWeight = '900';
                    return sp;
                }

                // Nodo central VNA — semitransparente, solo sirve de ancla
                if (node.group === 'vna_center' || node._isVnaCenter) {
                    const sp = new window.SpriteText('⬡');
                    sp.color      = 'rgba(255,255,255,0.12)';
                    sp.textHeight = 8;
                    return sp;
                }

                // Nodos de label arquetípico — solo texto flotante semitransparente
                if (node.group === 'archetype_label') {
                    const sp = new window.SpriteText(node.name);
                    sp.color       = node.color;
                    sp.textHeight  = 5;
                    sp.fontWeight  = '400';
                    sp.opacity     = 0.25;
                    return sp;
                }

                // Orquestadores — doble anillo, masa alta, corona
                if (node.group === 'orchestrator' || node._isOrchestrator) {
                    const g = new window.THREE.Group();
                    const r = node.val * 0.6;
                    // Esfera principal
                    g.add(new window.THREE.Mesh(
                        new window.THREE.SphereGeometry(r, 32, 32),
                        new window.THREE.MeshLambertMaterial({ color: '#e040fb', transparent: true, opacity: 0.9, depthWrite: false })
                    ));
                    // Anillo exterior — pulso
                    g.add(new window.THREE.Mesh(
                        new window.THREE.TorusGeometry(r * 1.6, 0.8, 8, 32),
                        new window.THREE.MeshBasicMaterial({ color: '#e040fb', transparent: true, opacity: 0.2 })
                    ));
                    // Anillo interior
                    g.add(new window.THREE.Mesh(
                        new window.THREE.TorusGeometry(r * 1.2, 0.4, 8, 32),
                        new window.THREE.MeshBasicMaterial({ color: '#6366f1', transparent: true, opacity: 0.35 })
                    ));
                    const sp = new window.SpriteText(node.name);
                    sp.color = '#e040fb'; sp.textHeight = Math.max(3, r * 0.22);
                    sp.fontWeight = '900'; sp.position.set(0, r + 5, 0);
                    g.add(sp);
                    const icon = new window.SpriteText('⚙️');
                    icon.textHeight = Math.max(4, r * 0.3); icon.position.set(0, 0, 0);
                    g.add(icon);
                    return g;
                }

                const group  = new window.THREE.Group();
                const radius = node.val * 0.55;
                const isCore = ['core_os','project_core'].includes(node.group);
                const isVna  = node._isVna || node.group === 'vna-overlay';
                const isDrillCenter = node.group === 'drill_center';

                // Glow ring para nodos importantes
                if (isDrillCenter || (isVna && (node._rawVna?.levelId === '@anxaneta' || node._rawVna?.tier === 0))) {
                    const rg = new window.THREE.TorusGeometry(radius * 1.5, 0.6, 8, 32);
                    const rm = new window.THREE.MeshBasicMaterial({ color: node.color, transparent:true, opacity: 0.25 });
                    group.add(new window.THREE.Mesh(rg, rm));
                }

                // Esfera principal
                const geo = new window.THREE.SphereGeometry(radius, 28, 28);
                const mat = new window.THREE.MeshLambertMaterial({
                    color: node.color, transparent: true,
                    opacity: (isCore || isVna || isDrillCenter) ? 0.95 : 0.65,
                    depthWrite: false
                });
                group.add(new window.THREE.Mesh(geo, mat));

                // Label nombre
                const sp       = new window.SpriteText(node.name);
                sp.color       = '#ffffff';
                sp.textHeight  = Math.max(2.2, node.val * 0.2);
                sp.fontWeight  = (isCore || isVna || isDrillCenter) ? '900' : '500';
                sp.position.set(0, radius + 3.5, 0);
                group.add(sp);

                // Badge de nivel Casteller
                if (isVna && node._rawVna?.levelId) {
                    const lb       = new window.SpriteText(node._rawVna.levelId);
                    lb.color       = node.color;
                    lb.textHeight  = 1.8;
                    lb.fontWeight  = 'bold';
                    lb.position.set(0, -(radius + 3.5), 0);
                    group.add(lb);
                }

                // Icono para agentes
                if (node.group === 'agent' || node._isAgent) {
                    const icon = new window.SpriteText('🤖');
                    icon.textHeight = Math.max(3, node.val * 0.3);
                    icon.position.set(0, 0, 0);
                    group.add(icon);
                }

                return group;
            })

            // ── Hover tooltip + guardar último nodo ───────────────
            .onNodeHover(node => {
                this._lastHoveredNode = node || null;
                canvasInner.style.cursor = node ? 'pointer' : 'crosshair';
                if (node) {
                    tooltip.style.display = 'block';
                    const level = node._rawVna?.levelId ? `<div class="tt-sub">${node._rawVna.levelId}</div>` : '';
                    const isDrillable = node._isVna || node.group === 'vna-overlay' || node.group === 'project_core';
                    const hint  = isDrillable ? '<div class="tt-sub" style="color:#555;">doble clic → mapa interno</div>' : '';
                    tooltip.innerHTML = `
                        <div class="tt-cat" style="color:${node.color}">${node.rawNode?.category || node.group}</div>
                        <div class="tt-title">${node.name}</div>
                        ${level}${hint}`;
                } else { tooltip.style.display = 'none'; }
            })
            .onLinkHover(link => {
                canvasInner.style.cursor = (link?.label) ? 'pointer' : 'crosshair';
                if (link?.label) {
                    tooltip.style.display = 'block';
                    const color = link.tipo === 'intangible' ? '#e040fb' : '#00e676';
                    tooltip.innerHTML = `
                        <div class="tt-cat" style="color:${color}">exchange · ${link.tipo||'?'}</div>
                        <div class="tt-title">${link.label}</div>
                        ${link.automatable ? '<div class="tt-sub">⚡ automatizable</div>' : ''}`;
                } else if (!link) { tooltip.style.display = 'none'; }
            })

            // ── Single click — detalle ────────────────────────────
            .onNodeClick(node => {
                const dist = 250;
                if (this.graph3D) {
                    const dr = 1 + dist / Math.hypot(node.x, node.y, node.z || 1);
                    this.graph3D.cameraPosition(
                        { x: node.x * dr, y: node.y * dr, z: (node.z||0) * dr },
                        node, 800
                    );
                }

                // Nodo resumen "+N nodos" — expande el KB completo
                if (node._isKbMore) {
                    this._expandKbAll();
                    return;
                }

                // Expansión lazy: cargar vecinos del KB que referencian este nodo
                if (node.id && this._allKbNodes) this._expandNeighbors(node);

                if (node._isVna || node.group === 'vna-overlay') this._showVnaNodeDetails(node);
                else if (node.group === 'work_order')             this._showWoDetails(node);
                else                                              this._showNodeDetails(node);
            })
            .onLinkClick(link => {
                if (link.rawTx) this._showExchangeDetails(link);
            })

            // ── Double click — drill-down ─────────────────────────
            .onNodeRightClick(node => {
                // Right-click como alternativa al double-click en 3D
                if (node._isVna || node.group === 'vna-overlay' || node.group === 'project_core') {
                    this._drillInto(node);
                }
            });

        // Configurar fuerzas — repulsión fuerte + distancia de links
        setTimeout(() => {
            try {
                this.graph3D.d3Force('charge')?.strength(repulsion);

                // En modo VNA: links de gravedad atraen al centro,
                // exchanges tienen distancia proporcional al nivel
                this.graph3D.d3Force('link')
                    ?.distance(link => {
                        if (link._isCenterLink)               return 0;    // pegado al centro (ya tienen fx/fz)
                        if (link.tipo === 'swarm-member')      return 120;
                        if (link.tipo === 'orchestration')     return 200;
                        if (link._isVnaLink)                   return 180;
                        if (link.isDependencies)               return 80;
                        return 150;
                    })
                    ?.strength(link => {
                        if (link._isCenterLink)               return 0;    // fx/fz ya fijan posición
                        if (link.tipo === 'swarm-member')      return 0.8;
                        if (link.tipo === 'orchestration')     return 0.5;
                        if (this.isVnaMode)                    return 0.6;  // exchanges VNA más tensos
                        return 0.3;
                    });

                // Cámara centrada al inicio en modo VNA
                if (this.isVnaMode) {
                    this.graph3D.cameraPosition({ x: 0, y: 0, z: 700 }, { x: 0, y: 0, z: 0 }, 0);
                }

                this.graph3D.d3ReheatSimulation();
            } catch(_) {}
        }, 100);

        // Double-click nativo sobre el canvas
        canvasInner.addEventListener('dblclick', () => {
            // El grafo no expone el nodo bajo el cursor en dblclick,
            // así que tomamos el último nodo en hover
            if (this._lastHoveredNode && (this._lastHoveredNode._isVna || this._lastHoveredNode.group === 'vna-overlay' || this._lastHoveredNode.group === 'project_core')) {
                this._drillInto(this._lastHoveredNode);
            }
        });

        // Tooltip sigue ratón
        canvasInner.addEventListener('mousemove', e => {
            if (tooltip.style.display === 'block') {
                const r = canvasInner.getBoundingClientRect();
                tooltip.style.left = `${e.clientX - r.left}px`;
                tooltip.style.top  = `${e.clientY - r.top}px`;
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
    //  Paneles de detalle
    // ══════════════════════════════════════════════════════════════
    _showVnaNodeDetails(node3D) {
        const panel   = this.container.querySelector('#memeResultsList');
        const m       = node3D._rawVna || node3D.rawNode || {};
        const color   = node3D.color || '#6366f1';
        const project = store.getState().projects.find(p => p.id === (this.projectId || localStorage.getItem('tt_active_project'))) || {};
        const roleId  = m.id || node3D.id.replace('vna_','');
        const wos     = (project.work_orders || []).filter(w => w.from === roleId || w.to === roleId);

        panel.innerHTML = `
        <div class="dm-card" style="border-color:${color};">
            <button id="btnBackSearch" style="background:transparent;border:none;color:#555;cursor:pointer;font-size:0.75rem;margin-bottom:9px;padding:0;">← Volver</button>
            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:7px;">
                ${m.levelId ? `<span class="exchange-badge badge-tang">${m.levelId}</span>` : ''}
                <span class="exchange-badge badge-auto">${m.role || node3D.group}</span>
                ${m.tier != null ? `<span class="exchange-badge badge-int">tier ${m.tier}</span>` : ''}
            </div>
            <div class="dm-title" style="color:${color};">${node3D.name}</div>
            <div class="dm-content" style="margin-top:5px;">${m.description || 'Nodo VNA del ecosistema.'}</div>
            ${m.fmv ? `<div style="font-size:0.68rem;color:#555;margin-top:5px;font-family:var(--font-mono);">FMV €${m.fmv}/h</div>` : ''}
            ${wos.length ? `<div style="font-size:0.7rem;color:var(--accent-orange,#ff9100);margin-top:5px;">📋 ${wos.length} WO(s)</div>` : ''}
            <div style="display:flex;flex-direction:column;gap:5px;margin-top:10px;">
                <button class="dm-action-btn dm-btn-drill" id="btnDrillIn">🔍 Ver mapa interno del rol</button>
                <button class="dm-action-btn dm-btn-edit"  id="btnEditNode">✏️ Editar en Project Forge</button>
                <button class="dm-action-btn dm-btn-paper" id="btnOpenPaper">📝 Abrir en Omni-Paper</button>
                ${wos.length ? `<button class="dm-action-btn dm-btn-wo" id="btnViewWos">📋 Ver Work Orders</button>` : ''}
            </div>
        </div>`;

        panel.querySelector('#btnBackSearch')?.addEventListener('click', () => this._resetPanel());
        panel.querySelector('#btnDrillIn')?.addEventListener('click',   () => this._drillInto(node3D));
        panel.querySelector('#btnEditNode')?.addEventListener('click',  () => {
            window.navigateTo?.(`/create?project=${this.projectId || project.id}&role=${roleId}`);
        });
        panel.querySelector('#btnOpenPaper')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('paper:open-node', { detail: { nodeId: roleId, nodeName: node3D.name, projectId: this.projectId } }));
            window.navigateTo?.('/paper');
        });
        panel.querySelector('#btnViewWos')?.addEventListener('click', () => window.navigateTo?.('/project'));
    }

    _showWoDetails(node3D) {
        const panel = this.container.querySelector('#memeResultsList');
        const w     = node3D.rawNode || {};
        const color = node3D.color || '#00e676';
        panel.innerHTML = `
        <div class="dm-card" style="border-color:${color};">
            <button id="btnBackSearch" style="background:transparent;border:none;color:#555;cursor:pointer;font-size:0.75rem;margin-bottom:9px;padding:0;">← Volver</button>
            <div class="dm-cat" style="color:${color}">Work Order · ${w.woType || 'tangible'}</div>
            <div class="dm-title">${node3D.name}</div>
            <div class="dm-content" style="margin-top:5px;">${w.context || w.comentario || '—'}</div>
            ${w.estimatedHours ? `<div style="font-size:0.68rem;color:#555;margin-top:5px;font-family:var(--font-mono);">⏱ ${w.estimatedHours}h</div>` : ''}
            <div style="display:flex;flex-direction:column;gap:5px;margin-top:10px;">
                <button class="dm-action-btn dm-btn-paper" id="btnOpenWo">📝 Abrir en Omni-Paper</button>
            </div>
        </div>`;
        panel.querySelector('#btnBackSearch')?.addEventListener('click', () => this._resetPanel());
        panel.querySelector('#btnOpenWo')?.addEventListener('click', () => {
            if (w.hash) window.navigateTo?.(`/paper?hash=${w.hash}`);
        });
    }

    _showExchangeDetails(link) {
        const panel   = this.container.querySelector('#memeResultsList');
        const e       = link.rawTx || {};
        const tipo    = link.tipo || 'tangible';
        const color   = tipo === 'intangible' ? '#e040fb' : '#00e676';
        const label   = link.label || e.label || e.template || 'Exchange';
        const from    = this.nodes.find(n => n.id === (typeof link.source==='object' ? link.source.id : link.source));
        const to      = this.nodes.find(n => n.id === (typeof link.target==='object' ? link.target.id : link.target));
        const project = store.getState().projects.find(p => p.id === (this.projectId || localStorage.getItem('tt_active_project'))) || {};
        const relWo   = (project.work_orders || []).find(w => w.flowId === e.id || (w.from === e.from && w.to === e.to));

        panel.innerHTML = `
        <div class="dm-card" style="border-color:${color};">
            <button id="btnBackSearch" style="background:transparent;border:none;color:#555;cursor:pointer;font-size:0.75rem;margin-bottom:9px;padding:0;">← Volver</button>
            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:7px;">
                <span class="exchange-badge ${tipo==='intangible'?'badge-int':'badge-tang'}">${tipo}</span>
                ${link.automatable ? '<span class="exchange-badge badge-auto">⚡ auto</span>' : ''}
            </div>
            <div class="dm-title" style="color:${color};">${label}</div>
            <div style="font-size:0.72rem;color:#666;margin:6px 0;">
                <span style="color:${from?.color||'#888'}">${from?.name||'?'}</span>
                <span style="color:#333"> ──▶ </span>
                <span style="color:${to?.color||'#888'}">${to?.name||'?'}</span>
            </div>
            <div class="dm-content">${e.context || e.description || '—'}</div>
            ${e.estimatedHours||e.horas ? `<div style="font-size:0.68rem;color:#555;margin-top:5px;font-family:var(--font-mono);">⏱ ${e.estimatedHours||e.horas}h</div>` : ''}
            <div style="display:flex;flex-direction:column;gap:5px;margin-top:10px;">
                ${relWo
                    ? `<button class="dm-action-btn dm-btn-paper" id="btnOpenWo">📝 Abrir WO en Paper</button>`
                    : `<button class="dm-action-btn dm-btn-wo" id="btnCreateWo">➕ Crear Work Order</button>`}
            </div>
        </div>`;

        panel.querySelector('#btnBackSearch')?.addEventListener('click', () => this._resetPanel());
        panel.querySelector('#btnOpenWo')?.addEventListener('click', () => {
            if (relWo?.hash) window.navigateTo?.(`/paper?hash=${relWo.hash}`);
        });
        panel.querySelector('#btnCreateWo')?.addEventListener('click', async () => {
            const aLevel = (store.getState().projects.find(p=>p.id===this.projectId)?.settings?.automation_level) || 'review_first';
            const { workOrders } = WoGenerator.fromVnaNetwork({ nodes: this.nodes.map(n=>n.rawNode||n), exchanges: [e] }, { automation_level: aLevel });
            if (workOrders.length) {
                const proj = store.getState().projects.find(p=>p.id===this.projectId);
                await store.dispatch({ type:'UPDATE_PROJECT_INFO', payload:{ projectId:this.projectId, updates:{ work_orders:[...(proj.work_orders||[]),...workOrders] } } });
                panel.querySelector('#btnCreateWo').innerText = '✅ WO creada';
                setTimeout(() => window.navigateTo?.('/project'), 900);
            }
        });
    }

    _showNodeDetails(node3D) {
        const panel   = this.container.querySelector('#memeResultsList');
        const m       = node3D.rawNode;
        if (!m) { this._resetPanel(); return; }

        const isAgent = node3D.group === 'agent' || node3D._isAgent;
        const isSkill = m.type === 'skill' || m.category === 'skill';
        const color   = node3D.color || '#6366f1';
        const tags    = (m.keywords||[]).map(t=>`<span class="dm-tag">#${t}</span>`).join('');
        const content = (typeof m.content === 'string') ? m.content.substring(0,260)+(m.content.length>260?'…':'') : '';

        let badges = '';
        if (isSkill) {
            const r=m.references?.length||0, ev=m.evals?.length||0, s=m.scripts?.length||0;
            if (r>0) badges += `<span style="background:rgba(0,176,255,0.1);color:#00b0ff;padding:2px 6px;border-radius:4px;font-size:0.62rem;font-weight:bold;margin-right:4px;border:1px solid rgba(0,176,255,0.25);">📚${r}</span>`;
            if (ev>0) badges += `<span style="background:rgba(255,171,64,0.1);color:var(--accent-orange);padding:2px 6px;border-radius:4px;font-size:0.62rem;font-weight:bold;margin-right:4px;border:1px solid rgba(255,171,64,0.25);">📋${ev}</span>`;
            if (s>0) badges += `<span style="background:rgba(0,230,118,0.1);color:var(--accent-green);padding:2px 6px;border-radius:4px;font-size:0.62rem;font-weight:bold;border:1px solid rgba(0,230,118,0.25);">⚡${s}</span>`;
        }

        let actions = '';
        if (isAgent) {
            actions = `
            <select id="sel3DEquipSkill" style="background:#0a0a0a;border:1px solid #333;color:white;padding:6px;border-radius:7px;width:100%;font-size:0.76rem;outline:none;margin-top:9px;">
                <option value="">-- Equipar Skill --</option>
                ${this.nodes.filter(n=>n.rawNode?.type==='skill').map(n=>`<option value="${n.id}">${n.name}</option>`).join('')}
            </select>
            <button class="dm-action-btn dm-btn-edit" id="btn3DEquip">⚙️ Equipar Skill</button>`;
        } else if (isSkill) {
            actions = `
            <button class="dm-action-btn dm-btn-edit"   id="btn3DEditSkill" style="margin-top:9px;">✏️ Editar en la Forja</button>
            <button class="dm-action-btn dm-btn-danger" id="btn3DTestSkill">🧪 CI/CD Pentest</button>`;
        }

        panel.innerHTML = `
        <div class="dm-card" style="border-color:${color};">
            <button id="btnBackSearch" style="background:transparent;border:none;color:#555;cursor:pointer;font-size:0.75rem;margin-bottom:8px;padding:0;">← Volver</button>
            <div class="dm-cat" style="color:${color}">${m.category||m.type||node3D.group}</div>
            <div class="dm-title">${node3D.name}</div>
            ${badges?`<div style="margin-bottom:6px;">${badges}</div>`:''}
            <div class="dm-content">${content}</div>
            <div class="dm-tags">${tags}</div>
            ${actions}
        </div>`;

        panel.querySelector('#btnBackSearch')?.addEventListener('click', () => this._resetPanel());
        panel.querySelector('#btn3DEquip')?.addEventListener('click', () => {
            const sid = panel.querySelector('#sel3DEquipSkill')?.value;
            if (sid) window.dispatchEvent(new CustomEvent('3d-equip-skill', { detail:{ agentId:m.id, skillId:sid } }));
        });
        panel.querySelector('#btn3DEditSkill')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('open-forge-modal', { detail:{ nodeId:m.id } }));
        });
        panel.querySelector('#btn3DTestSkill')?.addEventListener('click', e => {
            e.currentTarget.innerText='🧪 Evaluando…'; e.currentTarget.disabled=true;
            window.dispatchEvent(new CustomEvent('3d-test-skill', { detail:{ skillData:m } }));
        });
    }

    _resetPanel() {
        const panel = this.container.querySelector('#memeResultsList');
        if (panel) panel.innerHTML = `<div style="color:#444;font-size:0.76rem;text-align:center;padding:22px;font-style:italic;">Clic → detalle · Doble clic → mapa interno</div>`;
        this.graph3D?.cameraPosition({ x:0, y:0, z:800 }, { x:0,y:0,z:0 }, 1200);
    }

    // ══════════════════════════════════════════════════════════════
    //  _setupInteractivity
    // ══════════════════════════════════════════════════════════════
    _setupInteractivity() {
        const searchInput   = this.container.querySelector('#memeSearchInput');
        const resultsList   = this.container.querySelector('#memeResultsList');
        const btnInject     = this.container.querySelector('#btnInjectSeeds');
        const btnFullscreen = this.container.querySelector('#btnToggleFullscreen');
        const mainLayout    = this.container.querySelector('#synapticMainLayout');
        const btnDrillBack  = this.container.querySelector('#btnDrillBack');

        btnDrillBack?.addEventListener('click', () => this._drillBack());

        searchInput?.addEventListener('input', async () => {
            const q = searchInput.value.toLowerCase().trim();
            if (!q) { this._resetPanel(); return; }
            await KB.init();
            const all     = await KB.getAllNodes();
            const matches = all.filter(n => n.title?.toLowerCase().includes(q) || n.id.toLowerCase().includes(q));
            resultsList.innerHTML = matches.slice(0,12).map(n => `
                <div class="dm-card" data-id="${n.id}">
                    <div class="dm-cat">${n.category||n.type||'?'}</div>
                    <div class="dm-title">${n.title||n.id}</div>
                    <div class="dm-content">${n.description||(typeof n.content === 'string' ? n.content.substring(0,70) : '')||''}</div>
                </div>`).join('')
                || `<div style="color:#555;text-align:center;padding:18px;font-size:0.76rem;">Sin resultados.</div>`;

            resultsList.querySelectorAll('.dm-card').forEach(card => {
                card.addEventListener('click', () => {
                    window.dispatchEvent(new CustomEvent('open-forge-modal', { detail:{ nodeId: card.dataset.id } }));
                });
            });
        });

        btnInject?.addEventListener('click', async () => {
            btnInject.disabled  = true;
            btnInject.innerText = '⏳ Inyectando…';
            try {
                const { CoreSeed } = await import('../core/seed.js');
                await KB.init();
                if (CoreSeed?.inject) { await KB.deleteNode('skill_vna_architect'); await CoreSeed.inject(KB); }
                window.dispatchEvent(new CustomEvent('refresh-lms-data'));
                await this.loadInitialData();
                if (this.graph3D) this.graph3D.graphData({ nodes:this.nodes, links:this.links });
                alert('✅ Semillas Antigravity inyectadas en el Córtex.');
            } catch (e) { alert('Error: ' + e.message); }
            finally { btnInject.disabled=false; btnInject.innerText='✨ Forjar Semillas Antigravity'; }
        });

        btnFullscreen?.addEventListener('click', () => {
            mainLayout?.classList.toggle('fullscreen-mode');
            const isFull = mainLayout?.classList.contains('fullscreen-mode');
            btnFullscreen.innerText = isFull ? '✕' : '⛶';
            setTimeout(() => {
                const c = this.container.querySelector('#webglCanvasInner');
                if (c && this.graph3D) { this.graph3D.width(c.clientWidth); this.graph3D.height(c.clientHeight); }
            }, 100);
        });
    }
}
