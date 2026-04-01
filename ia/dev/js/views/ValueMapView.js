// =============================================================================
// TEAMTOWERS SOS V10 — VALUE MAP VIEW v2
// Ruta: /ia/dev/js/views/ValueMapView.js
// IDE-Like: Fábrica VNA · SynapticCanvas 3D · Work Order Generator
// URL semántica: /map · /map?project=xxx · /map?wo=xxx
// =============================================================================

import { store }           from '../core/store.js';
import { KB }              from '../core/kb.js';
import { Sidebar }         from '../components/Sidebar.js';
import { BottomNav }       from '../components/BottomNav.js';
import { PageHeader }      from '../components/PageHeader.js';
import { SynapticCanvas }  from '../components/SynapticCanvas.js';
import { Orchestrator }    from '../core/Orchestrator.js';
import { WoGenerator }     from '../core/WoGenerator.js';
import { QueenSwarm }      from '../core/QueenSwarm.js';
import { VnaSequencer }    from '../core/VnaSequencer.js';
import { VnaMapRenderer }  from '../components/VnaMapRenderer.js';

export default class ValueMapView {

    constructor() {
        document.title       = 'Fábrica VNA | TeamTowers V10';
        this.activeProjectId = null;
        this.isPO            = false;
        this.dom             = {};

        this._canvas      = null;
        this._network     = null;
        this._pendingWos  = [];
        this._woFlows     = [];
        this._telem       = { tokens: 0, cost: 0, slices: 0 };

        const params = new URLSearchParams(window.location.search);
        this._focusWoHash   = params.get('wo')      || null;
        this._initProjectId = params.get('project') || null;
    }

    async getHtml() {
        await store.init();

        const state        = store.getState();
        const activeUserId = state.session.activeUserId;

        let project = this._initProjectId
            ? state.projects.find(p => p.id === this._initProjectId)
            : state.projects.find(p => p.id === localStorage.getItem('tt_active_project'));
        if (!project && state.projects.length > 0) project = state.projects.at(-1);

        if (!project) {
            return `
            <div class="app-layout">
                ${Sidebar.getHtml('/map')}
                <main class="workspace" style="justify-content:center;align-items:center;display:flex;">
                    <div class="glass-panel" style="text-align:center;max-width:500px;margin:0 auto;padding:4rem;">
                        <div style="font-size:5rem;margin-bottom:1.5rem;line-height:1;">🕸️</div>
                        <h2 style="color:white;margin-top:0;font-weight:900;">Lienzo Vacío</h2>
                        <p style="color:var(--text-muted);margin-bottom:2.5rem;">Crea un ecosistema primero para mapear su red de valor.</p>
                        <a href="/create" data-link class="btn-primary" style="text-decoration:none;">➕ Forjar Ecosistema</a>
                    </div>
                </main>
                ${BottomNav.getHtml('/map')}
            </div>`;
        }

        this.activeProjectId = project.id;
        this.isPO = project.ownerId === activeUserId || state.session.role === 'ecosystem-owner';

        const automationLevel  = project.settings?.automation_level || 'review_first';
        const hasVna           = (project.vna_nodes || []).length > 0;
        const projectSkills    = project.skills || [];

        const headerConfig = {
            title:   'Fábrica VNA',
            subtitle: project.nombre,
            tagline: 'Red de valor cuántica · Work Orders generadas por el Swarm',
            tabs:    [],
            magicActions: hasVna ? [
                { id: 'remap',  label: 'Re-mapear red',   icon: '🗺️' },
                { id: 'heal',   label: 'Curar patologías', icon: '🔍' },
                { id: 'export', label: 'Exportar JSON-LD', icon: '📦' }
            ] : []
        };

        return `
        <style>
            .vmap-ide { display:flex; flex:1; min-height:0; overflow:hidden; }
            .vmap-left { width:320px; min-width:260px; display:flex; flex-direction:column;
                border-right:1px solid var(--glass-border); background:rgba(5,5,8,0.96);
                overflow-y:auto; flex-shrink:0; }
            .vmap-center { flex:1; display:flex; flex-direction:column; overflow:hidden; position:relative; }
            .vmap-right { width:300px; min-width:240px; display:flex; flex-direction:column;
                border-left:1px solid var(--glass-border); background:rgba(5,5,8,0.96);
                overflow:hidden; flex-shrink:0; transition:width 0.3s; }
            .vmap-right.hidden { width:0; min-width:0; }
            #vnaCanvasMount { flex:1; min-height:0; }
            #vnaCanvasMount .synaptic-layout { border-radius:0; border:none; height:100%; }
            .vmap-section { padding:1rem 1.25rem; border-bottom:1px solid rgba(255,255,255,0.05); }
            .vmap-stitle { font-size:0.68rem; font-weight:900; color:#555; text-transform:uppercase;
                letter-spacing:1.5px; margin-bottom:0.75rem; display:flex; align-items:center;
                justify-content:space-between; }
            .vmap-textarea { width:100%; background:rgba(0,0,0,0.4); border:1px solid #2a2a2a;
                color:white; padding:11px 13px; border-radius:9px; font-family:var(--font-main);
                font-size:0.85rem; outline:none; transition:border-color 0.2s; box-sizing:border-box;
                resize:vertical; min-height:90px; }
            .vmap-textarea:focus { border-color:rgba(224,64,251,0.4); }
            .vmap-textarea::placeholder { color:#2a2a2a; }
            .vmap-btn { width:100%; padding:10px 14px; border-radius:9px; font-weight:900;
                font-size:0.82rem; cursor:pointer; transition:0.2s; border:none;
                display:flex; align-items:center; justify-content:center; gap:7px; margin-top:8px; }
            .vmap-btn:hover:not(:disabled) { transform:translateY(-1px); }
            .vmap-btn:disabled { opacity:0.3; cursor:not-allowed; transform:none; }
            .vmap-btn-primary { background:linear-gradient(135deg,rgba(224,64,251,0.75),rgba(99,102,241,0.75)); color:white; }
            .vmap-btn-ghost   { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08)!important; color:#888; }
            .vmap-btn-green   { background:rgba(0,230,118,0.08); border:1px solid rgba(0,230,118,0.2)!important; color:var(--accent-green); }
            .vmap-btn-orange  { background:rgba(255,171,64,0.08); border:1px solid rgba(255,171,64,0.2)!important; color:var(--accent-orange); }
            .vmap-status { font-size:0.75rem; font-family:var(--font-mono); color:var(--accent-indigo);
                padding:8px 11px; background:rgba(99,102,241,0.06); border:1px dashed rgba(99,102,241,0.2);
                border-radius:7px; margin-top:8px; line-height:1.4; display:none; }
            .vmap-status.visible { display:block; }
            .vmap-status.error   { color:var(--accent-red); background:rgba(255,82,82,0.06); border-color:rgba(255,82,82,0.2); }
            .telem-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
            .telem-card { background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.04);
                border-radius:7px; padding:7px 10px; }
            .telem-val { font-size:1rem; font-weight:900; font-family:var(--font-mono); color:white; }
            .telem-lbl { font-size:0.6rem; color:#555; text-transform:uppercase; letter-spacing:1px; margin-top:2px; }
            .health-row { display:flex; align-items:center; gap:10px; }
            .health-score { font-size:1.3rem; font-weight:900; font-family:var(--font-mono); min-width:44px; }
            .health-bar-bg   { flex:1; height:5px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden; }
            .health-bar-fill { height:100%; border-radius:3px; transition:width 0.8s; }
            .wo-list { flex:1; overflow-y:auto; padding:0.75rem; display:flex; flex-direction:column; gap:7px; }
            .wo-card { background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.06);
                border-radius:9px; padding:10px 12px; transition:0.2s; }
            .wo-card:hover { border-color:rgba(99,102,241,0.3); }
            .wo-card.focused { border-color:var(--accent-indigo); }
            .wo-type-badge { font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:900;
                font-family:var(--font-mono); text-transform:uppercase; }
            .wo-tangible   { background:rgba(0,230,118,0.08); color:var(--accent-green); border:1px solid rgba(0,230,118,0.2); }
            .wo-intangible { background:rgba(224,64,251,0.08); color:var(--accent-purple); border:1px solid rgba(224,64,251,0.2); }
            .wo-hybrid     { background:rgba(255,171,64,0.08); color:var(--accent-orange); border:1px solid rgba(255,171,64,0.2); }
            .wo-auto-badge { font-size:0.58rem; padding:2px 5px; border-radius:4px; font-family:var(--font-mono); }
            .auto-auto  { background:rgba(0,230,118,0.06); color:#00e676; border:1px solid rgba(0,230,118,0.15); }
            .auto-hitl  { background:rgba(255,171,64,0.06); color:var(--accent-orange); border:1px solid rgba(255,171,64,0.15); }
            .auto-human { background:rgba(255,255,255,0.03); color:#666; border:1px solid rgba(255,255,255,0.08); }
            .wo-summary { display:flex; gap:10px; flex-wrap:wrap; font-size:0.72rem; font-family:var(--font-mono); color:#666; }
            .wo-summary b { color:white; }
            .wo-confirm-bar { padding:0.75rem; border-top:1px solid rgba(255,255,255,0.05); flex-shrink:0; }
            @media (max-width:1100px) { .vmap-right { display:none; } }
            @media (max-width:768px)  { .vmap-left { width:100%; max-width:none; } .vmap-ide { flex-direction:column; height:auto; } }
        </style>

        <div class="app-layout">
            ${Sidebar.getHtml('/map')}
            <div style="display:flex;flex:1;min-height:0;flex-direction:column;overflow:hidden;">
                <div style="padding:1rem 1.5rem 0;flex-shrink:0;">
                    ${PageHeader.getHtml(headerConfig)}
                </div>
                <div class="vmap-ide">

                    <!-- PANEL IZQUIERDO -->
                    <aside class="vmap-left">

                        <div class="vmap-section">
                            <div class="vmap-stitle">🧬 Genoma del Proyecto
                                <span style="font-weight:400;color:#333;text-transform:none;letter-spacing:0;font-size:0.68rem;">${project.nombre}</span>
                            </div>
                            <textarea id="vnaInput" class="vmap-textarea" rows="5"
                                placeholder="Describe el proyecto, negocio o proceso. Claude mapeará los roles y flujos de valor y generará las Work Orders del Swarm…">${project.vna_description || ''}</textarea>
                            <div style="display:flex;gap:8px;">
                                <button id="btnMap" class="vmap-btn vmap-btn-primary" style="flex:1;">
                                    ${hasVna ? '🔄 Re-mapear / Evolucionar red' : '🗺️ Mapear Red de Valor'}
                                </button>
                                <button id="btnQueenTDD" title="La Reina · Protocolo TDD inverso · Evals primero"
                                    style="padding:0 14px;background:linear-gradient(135deg,rgba(224,64,251,0.2),rgba(99,102,241,0.2));border:1px solid rgba(224,64,251,0.4);color:#e040fb;border-radius:10px;cursor:pointer;font-size:0.8rem;font-weight:bold;transition:0.2s;white-space:nowrap;">
                                    👑 Reina TDD
                                </button>
                            </div>
                            <div id="mapStatus" class="vmap-status"></div>
                        </div>

                        <div class="vmap-section">
                            <div class="vmap-stitle">⚡ Swarm</div>
                            <button id="btnSkills" class="vmap-btn vmap-btn-ghost" ${!hasVna ? 'disabled' : ''}>⚡ Crear Skills desde VNA</button>
                            <button id="btnAgent"  class="vmap-btn vmap-btn-ghost" ${!hasVna ? 'disabled' : ''}>🤖 Fabricar Agente Vertical</button>
                            <button id="btnHeal"   class="vmap-btn vmap-btn-orange" ${!hasVna ? 'disabled' : ''}>🔍 Curar Red</button>
                        </div>
                        <div class="vmap-section">
                            <div class="vmap-stitle">🗺️ Vista del Mapa</div>
                            <div style="display:flex;gap:6px;">
                                <button id="btnView2D" class="vmap-btn vmap-btn-primary" style="flex:1;margin-top:0;font-size:0.78rem;" ${!hasVna ? 'disabled' : ''}>
                                    📐 Grafo 2D
                                </button>
                                <button id="btnView3D" class="vmap-btn vmap-btn-ghost" style="flex:1;margin-top:0;font-size:0.78rem;" ${!hasVna ? 'disabled' : ''}>
                                    🌌 3D Canvas
                                </button>
                            </div>
                            <label style="display:flex;align-items:center;gap:7px;margin-top:8px;cursor:pointer;font-size:0.75rem;color:#888;">
                                <input type="checkbox" id="seqToggle" checked style="accent-color:var(--accent-indigo);">
                                Mostrar orden de ejecución
                            </label>
                        </div>

                        <div class="vmap-section">
                            <div class="vmap-stitle">⚙️ Automatización
                                <a href="/settings" data-link style="font-size:0.65rem;color:var(--accent-indigo);text-decoration:none;font-weight:400;text-transform:none;letter-spacing:0;">editar</a>
                            </div>
                            ${['full_auto','review_first','human_only'].map(level => `
                            <label style="display:flex;align-items:center;gap:9px;cursor:pointer;padding:7px 9px;border-radius:7px;
                                border:1px solid ${automationLevel===level?'rgba(99,102,241,0.3)':'rgba(255,255,255,0.04)'};
                                background:${automationLevel===level?'rgba(99,102,241,0.05)':'transparent'};margin-bottom:5px;">
                                <input type="radio" name="autoLevel" value="${level}" ${automationLevel===level?'checked':''} style="accent-color:var(--accent-indigo);">
                                <div>
                                    <div style="font-size:0.75rem;font-weight:bold;color:${automationLevel===level?'white':'#666'};">
                                        ${{full_auto:'⚡ Full Auto',review_first:'👁️ Review First',human_only:'👤 Human Only'}[level]}
                                    </div>
                                    <div style="font-size:0.62rem;color:#444;">
                                        ${{full_auto:'WOs → Swarm directo',review_first:'WOs → confirmar antes',human_only:'WOs → solo humanos'}[level]}
                                    </div>
                                </div>
                            </label>`).join('')}
                        </div>

                        <div class="vmap-section">
                            <div class="vmap-stitle">📡 Sesión</div>
                            <div class="telem-grid">
                                <div class="telem-card"><div class="telem-val" id="telemTokens">0</div><div class="telem-lbl">Tokens</div></div>
                                <div class="telem-card"><div class="telem-val" id="telemCost">$0.000</div><div class="telem-lbl">Coste</div></div>
                                <div class="telem-card"><div class="telem-val" id="telemSlices">0.000</div><div class="telem-lbl">Slices</div></div>
                                <div class="telem-card"><div class="telem-val" id="telemWos" style="font-size:1rem;">0</div><div class="telem-lbl">WOs</div></div>
                            </div>
                        </div>

                        <div class="vmap-section">
                            <div class="vmap-stitle">💚 Health Score</div>
                            <div class="health-row">
                                <div class="health-score" id="healthScore" style="color:var(--accent-green);">—</div>
                                <div style="flex:1;">
                                    <div class="health-bar-bg"><div class="health-bar-fill" id="healthFill" style="width:0%;background:var(--accent-green);"></div></div>
                                    <div style="font-size:0.65rem;color:#444;margin-top:3px;" id="healthLabel">Genera un mapa para ver el diagnóstico</div>
                                </div>
                            </div>
                        </div>

                        ${projectSkills.length > 0 ? `
                        <div class="vmap-section">
                            <div class="vmap-stitle">⚡ Skills (${projectSkills.length})</div>
                            ${projectSkills.slice(0,4).map(s => `
                            <div style="display:flex;align-items:center;gap:7px;padding:6px 9px;
                                background:rgba(0,230,118,0.04);border:1px solid rgba(0,230,118,0.1);
                                border-radius:7px;font-size:0.75rem;color:#aaa;margin-bottom:5px;">
                                <span style="color:var(--accent-green);">⚡</span>
                                <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${s.name}</span>
                                <span style="font-family:var(--font-mono);font-size:0.62rem;color:#444;">+${s.slicesCharged}</span>
                            </div>`).join('')}
                            ${projectSkills.length > 4 ? `<div style="font-size:0.68rem;color:#444;text-align:center;">+${projectSkills.length-4} más</div>` : ''}
                        </div>` : ''}

                    </aside>

                    <!-- CANVAS CENTRAL -->
                    <main class="vmap-center">
                        <div id="vnaPlaceholder" style="flex:1;display:${hasVna?'none':'flex'};flex-direction:column;
                            align-items:center;justify-content:center;
                            background:radial-gradient(circle at center,#0a0a12,#050508);">
                            <div style="font-size:4rem;margin-bottom:1rem;opacity:0.3;">🕸️</div>
                            <div style="color:#333;font-size:0.9rem;font-weight:bold;margin-bottom:0.4rem;">Red de valor vacía</div>
                            <div style="color:#222;font-size:0.78rem;">Describe el proyecto y haz clic en Mapear</div>
                        </div>
                        <!-- Grafo 2D secuenciado — ocupa todo el canvas central -->
                        <div id="vnaGraph2D" style="flex:1;display:${hasVna?'flex':'none'};flex-direction:column;overflow:auto;
                            background:radial-gradient(circle at center,#0a0a12,#050508);position:relative;">
                        </div>
                        <div id="vnaCanvasMount" style="flex:1;display:none;flex-direction:column;"></div>
                    </main>

                    <!-- PANEL DERECHO: WORK ORDERS -->
                    <aside class="vmap-right" id="woPanel">
                        <div class="vmap-section" style="flex-shrink:0;">
                            <div class="vmap-stitle">📋 Work Orders
                                <button id="btnCloseWoPanel" style="background:transparent;border:none;color:#444;cursor:pointer;font-size:0.9rem;padding:0;">✕</button>
                            </div>
                            <div id="woSummaryBar" class="wo-summary"></div>
                        </div>
                        <div class="wo-list" id="woList">
                            <div style="color:#333;font-size:0.78rem;font-style:italic;text-align:center;padding:2rem 0;">
                                Las Work Orders aparecerán aquí tras mapear la red.
                            </div>
                        </div>
                        <div class="wo-confirm-bar" id="woConfirmBar" style="display:none;">
                            <button id="btnConfirmAllWos" class="vmap-btn vmap-btn-green" style="margin-top:0;">✅ Confirmar todas al Kanban</button>
                            <button id="btnConfirmAutoOnly" class="vmap-btn vmap-btn-ghost">⚡ Solo WOs auto (Swarm)</button>
                        </div>
                    </aside>

                </div>
            </div>
            ${BottomNav.getHtml('/map')}
        </div>`;
    }

    async afterRender() {
        Sidebar.initListeners();
        PageHeader.afterRender(null, async (actionId) => {
            if (actionId === 'remap')  document.getElementById('btnMap')?.click();
            if (actionId === 'heal')   await this._runHeal();
            if (actionId === 'export') this._exportNetwork();
        });

        const state   = store.getState();
        const project = state.projects.find(p => p.id === this.activeProjectId);
        if (!project) return;

        this.dom = {
            btnMap:          document.getElementById('btnMap'),
            btnView2D:       document.getElementById('btnView2D'),
            btnView3D:       document.getElementById('btnView3D'),
            vnaGraph2D:      document.getElementById('vnaGraph2D'),
            seqToggle:       document.getElementById('seqToggle'),
            mapStatus:       document.getElementById('mapStatus'),
            btnSkills:       document.getElementById('btnSkills'),
            btnAgent:        document.getElementById('btnAgent'),
            btnHeal:         document.getElementById('btnHeal'),
            vnaPlaceholder:  document.getElementById('vnaPlaceholder'),
            vnaCanvasMount:  document.getElementById('vnaCanvasMount'),
            woPanel:         document.getElementById('woPanel'),
            woList:          document.getElementById('woList'),
            woSummaryBar:    document.getElementById('woSummaryBar'),
            woConfirmBar:    document.getElementById('woConfirmBar'),
            btnConfirmAll:   document.getElementById('btnConfirmAllWos'),
            btnConfirmAuto:  document.getElementById('btnConfirmAutoOnly'),
            btnCloseWoPanel: document.getElementById('btnCloseWoPanel'),
            telemTokens:     document.getElementById('telemTokens'),
            telemCost:       document.getElementById('telemCost'),
            telemSlices:     document.getElementById('telemSlices'),
            telemWos:        document.getElementById('telemWos'),
            healthScore:     document.getElementById('healthScore'),
            healthFill:      document.getElementById('healthFill'),
            healthLabel:     document.getElementById('healthLabel')
        };

        // Si ya hay VNA en el proyecto, mostrar grafo 2D secuenciado por defecto
        if ((project.vna_nodes || []).length > 0) {
            // Mostrar grafo 2D primero (más rápido y legible)
            if (this.dom.vnaPlaceholder) this.dom.vnaPlaceholder.style.display = 'none';
            if (this.dom.vnaGraph2D)     this.dom.vnaGraph2D.style.display     = 'flex';
            await this._render2DGraph();

            // Canvas 3D se inicializa lazy en background
            await this._initCanvas();
            await this._canvas?.loadVNAData();
            if (this._canvas?.graph3D) {
                this._canvas.graph3D.graphData({ nodes: this._canvas.nodes, links: this._canvas.links });
            }

            // Health score desde KB si existe
            const KB_net = await (async () => { try { await KB.init(); return await KB.getNode(`vna-network-${this.activeProjectId}`); } catch(_){ return null; } })();
            if (KB_net?.meta?.health_score != null) this._renderHealth(KB_net.meta.health_score);

            // Generar WOs si no existen aún
            const existingWos = project.work_orders || [];
            if (existingWos.length === 0) {
                const aLevel = project.settings?.automation_level || 'review_first';
                const fakeNetwork = { nodes: project.vna_nodes, exchanges: project.vna_exchanges };
                const { workOrders, flows } = WoGenerator.fromVnaNetwork(fakeNetwork, { automation_level: aLevel });
                this._pendingWos = workOrders;
                this._woFlows    = flows;
                if (this.dom.telemWos) this.dom.telemWos.textContent = workOrders.length;
                this._renderWoList(workOrders);
                this.dom.woPanel?.classList.remove('hidden');
                this._setStatus(`✅ Red importada desde Forge · ${project.vna_nodes.length} nodos · ${workOrders.length} WOs generadas. Confirma o re-mapea con Claude.`);
            } else {
                // WOs previas del Swarm
                const swarmWos = existingWos.filter(w => w.createdBy === 'node-claude-sonnet-v10');
                if (swarmWos.length) this._renderWoList(swarmWos);
                else this._renderWoList(existingWos.slice(0, 20));
                this.dom.woPanel?.classList.remove('hidden');
            }
        }

        // Radio automatización
        document.querySelectorAll('[name="autoLevel"]').forEach(radio => {
            radio.addEventListener('change', async (e) => {
                await store.dispatch({ type:'UPDATE_PROJECT_INFO', payload:{
                    projectId: this.activeProjectId,
                    updates: { settings: { ...project.settings, automation_level: e.target.value } }
                }});
                this._setStatus(`Nivel: ${e.target.value}`);
            });
        });

        this.dom.btnMap?.addEventListener('click', async () => {
            const desc = document.getElementById('vnaInput')?.value.trim();
            if (!desc) { this._setStatus('⚠️ Describe el proyecto primero.', true); return; }
            await this._runMap(desc);
        });

        // ── 👑 Reina TDD — protocolo completo en 5 pasos ─────────
        document.getElementById('btnQueenTDD')?.addEventListener('click', async () => {
            const desc = document.getElementById('vnaInput')?.value.trim();
            if (!desc) { this._setStatus('⚠️ Describe el proyecto primero.', true); return; }

            const btn = document.getElementById('btnQueenTDD');
            btn.disabled  = true;
            btn.textContent = '⏳ La Reina trabaja…';

            const project = store.getState().projects.find(p => p.id === this.activeProjectId);
            const mission = desc;
            const vision  = project?.vna_description || desc;
            const sector  = project?.sector || 'technology';

            // Sembrar skills del kernel si no existen
            await QueenSwarm.seedKernel();

            try {
                const result = await QueenSwarm.generateVnaWithTDD({
                    projectId: this.activeProjectId,
                    mission, vision, sector,
                    onProgress: (msg) => this._setStatus(msg)
                });

                // Recargar canvas con el nuevo VNA
                await this._initCanvas();
                await this._canvas?.loadVNAData();
                if (this._canvas?.graph3D) {
                    this._canvas.graph3D.graphData({
                        nodes: this._canvas.nodes,
                        links: this._canvas.links
                    });
                }
                if (this.dom.vnaPlaceholder) this.dom.vnaPlaceholder.style.display = 'none';
                if (this.dom.vnaCanvasMount) this.dom.vnaCanvasMount.style.display  = 'flex';

                // Mostrar resumen de conflictos para revisión humana (3 min)
                const { summary, conflicts, landing, bizModel } = result;
                const conflictHtml = (conflicts || []).map(c =>
                    `<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.76rem;">
                        <span style="color:${c.severity==='error'?'#ff5252':'#ff9100'};">
                            ${c.severity==='error'?'❌':'⚠️'} ${c.description}
                        </span>
                        ${c.suggestion ? `<div style="color:#555;font-size:0.68rem;margin-top:2px;">→ ${c.suggestion}</div>` : ''}
                    </div>`
                ).join('');

                this._setStatus(`
                    ✅ VNA generado con TDD · ${summary.rolesCount} roles · ${summary.transactionsCount} flujos · 
                    ${summary.evalsCount} evals · Health: ${(summary.healthScore*100).toFixed(0)}% · 
                    ${summary.errorsCount} errores · ${summary.warningsCount} warnings para revisar
                `);

                // Panel de revisión humana
                if (this.dom.woPanel) {
                    this.dom.woPanel.classList.remove('hidden');
                    const woList = this.dom.woPanel.querySelector('.wo-list');
                    const totalWarns = summary.errorsCount + summary.warningsCount;
                    const autoFixed  = summary.autoRepaired || 0;
                    const pending    = (summary.pendingWarnings || []).length;

                    if (woList) {
                        woList.innerHTML = `
                        <div style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.05);">

                            ${autoFixed > 0 ? `
                            <div style="font-size:0.7rem;color:#00e676;background:rgba(0,230,118,0.06);
                                border:1px solid rgba(0,230,118,0.2);border-radius:7px;padding:7px 10px;margin-bottom:8px;">
                                🔧 Auto-reparación: ${autoFixed} conflictos resueltos por el agente antes de persistir
                            </div>` : ''}

                            <div style="font-size:0.72rem;color:#e040fb;font-weight:bold;margin-bottom:8px;">
                                👑 REVISIÓN DE LA REINA
                                ${pending > 0 ? `— ${pending} warnings pendientes de revisión humana` : '— ✅ VNA validado'}
                            </div>

                            ${conflictHtml || '<div style="color:#555;font-size:0.76rem;">✅ Sin conflictos. El VNA está listo.</div>'}

                            ${pending > 0 ? `
                            <div style="display:flex;gap:6px;margin-top:10px;">
                                <button id="btnAutoRepairWarnings"
                                    style="flex:1;padding:8px;background:rgba(224,64,251,0.08);
                                    border:1px solid rgba(224,64,251,0.3);color:#e040fb;border-radius:7px;
                                    cursor:pointer;font-size:0.75rem;font-weight:bold;">
                                    🔧 Auto-reparar warnings con agente
                                </button>
                                <button id="btnIgnoreWarnings"
                                    style="padding:8px 12px;background:rgba(255,255,255,0.03);
                                    border:1px solid rgba(255,255,255,0.08);color:#555;border-radius:7px;
                                    cursor:pointer;font-size:0.75rem;">
                                    Ignorar →
                                </button>
                            </div>` : ''}

                            ${landing ? `
                            <div style="margin-top:10px;padding:10px;background:rgba(0,230,118,0.04);border:1px solid rgba(0,230,118,0.15);border-radius:8px;">
                                <div style="font-size:0.68rem;color:#00e676;font-weight:bold;margin-bottom:6px;">💰 LANDING MVP</div>
                                <div style="font-size:0.82rem;color:white;font-weight:bold;">${landing.headline}</div>
                                <div style="font-size:0.72rem;color:#888;margin-top:3px;">${landing.subheadline}</div>
                                <div style="font-size:0.7rem;color:#555;margin-top:5px;">${landing.cta_primary} · ${landing.pricing_hint}</div>
                            </div>` : ''}
                            ${bizModel?.first_revenue_path ? `
                            <div style="margin-top:8px;padding:8px 10px;background:rgba(99,102,241,0.05);border:1px solid rgba(99,102,241,0.15);border-radius:8px;">
                                <div style="font-size:0.68rem;color:#6366f1;font-weight:bold;margin-bottom:4px;">🎯 PRIMER INGRESO</div>
                                <div style="font-size:0.72rem;color:#888;">${bizModel.first_revenue_path}</div>
                            </div>` : ''}
                        </div>`;

                        // ── Botón auto-reparar warnings pendientes ──────────────
                        document.getElementById('btnAutoRepairWarnings')?.addEventListener('click', async () => {
                            const repBtn = document.getElementById('btnAutoRepairWarnings');
                            if (repBtn) { repBtn.disabled = true; repBtn.textContent = '⏳ Reparando…'; }
                            this._setStatus('🔧 Agente reparador analizando warnings pendientes…');
                            try {
                                // Re-ejecutar QueenSwarm solo con los warnings pendientes como contexto
                                const desc = document.getElementById('vnaInput')?.value.trim() || mission;
                                await this._runMap(desc);
                                this._setStatus('✅ Re-mapeo completado con warnings resueltos.');
                            } catch(e) {
                                this._setStatus('❌ Error en reparación: ' + e.message, true);
                            } finally {
                                if (repBtn) { repBtn.disabled = false; repBtn.textContent = '🔧 Auto-reparar warnings'; }
                            }
                        });
                        document.getElementById('btnIgnoreWarnings')?.addEventListener('click', () => {
                            document.getElementById('btnAutoRepairWarnings')?.closest('div[style*="gap"]')?.remove();
                        });
                    }
                }

            } catch (err) {
                this._setStatus(`❌ Error en protocolo Reina: ${err.message}`, true);
            } finally {
                btn.disabled    = false;
                btn.textContent = '👑 Reina TDD';
            }
        });

        this.dom.btnSkills?.addEventListener('click',  async () => { if (this._network?.nodes?.length) await this._runSkills(); });
        this.dom.btnAgent?.addEventListener('click',   async () => { if (this._network) await this._runAgent(); });
        this.dom.btnHeal?.addEventListener('click',    async () => await this._runHeal());
        this.dom.btnCloseWoPanel?.addEventListener('click', () => this.dom.woPanel?.classList.add('hidden'));

        // ── Toggle 2D / 3D ──────────────────────────────────────────────────
        this.dom.btnView2D?.addEventListener('click', async () => {
            if (this.dom.vnaGraph2D)     this.dom.vnaGraph2D.style.display     = 'flex';
            if (this.dom.vnaCanvasMount) this.dom.vnaCanvasMount.style.display = 'none';
            this.dom.btnView2D?.classList.replace('vmap-btn-ghost', 'vmap-btn-primary');
            this.dom.btnView3D?.classList.replace('vmap-btn-primary','vmap-btn-ghost');
            await this._render2DGraph();
        });
        this.dom.btnView3D?.addEventListener('click', async () => {
            if (this.dom.vnaGraph2D)     this.dom.vnaGraph2D.style.display     = 'none';
            if (this.dom.vnaCanvasMount) this.dom.vnaCanvasMount.style.display = 'flex';
            this.dom.btnView3D?.classList.replace('vmap-btn-ghost', 'vmap-btn-primary');
            this.dom.btnView2D?.classList.replace('vmap-btn-primary','vmap-btn-ghost');
        });
        this.dom.seqToggle?.addEventListener('change', async () => await this._render2DGraph());
        this.dom.btnConfirmAll?.addEventListener('click',   async () => await this._confirmWos(this._pendingWos));
        this.dom.btnConfirmAuto?.addEventListener('click',  async () => await this._confirmWos(this._pendingWos.filter(w => w.automation === 'auto')));

        if (this._focusWoHash) this._focusWoCard(this._focusWoHash);
    }

    async _runMap(description) {
        this._setBtns(true);
        this._setStatus('🧠 Claude analizando la red de valor…');
        try {
            await store.dispatch({ type:'UPDATE_PROJECT_INFO', payload:{
                projectId: this.activeProjectId, updates:{ vna_description: description }
            }});

            this._setStatus('🔭 Identificando roles y flujos…');
            const artifact = await Orchestrator.designVnaMap({ projectId: this.activeProjectId, description, domain:'auto' });
            const network  = artifact.payload;
            if (!network?.nodes?.length) throw new Error('Mapa VNA vacío. Reformula la descripción.');

            this._network = network;
            this._updateTelemetry(artifact.telemetry);
            this._renderHealth(network.meta?.health_score ?? network.health_score ?? 0);

            // Aplicar VnaSequencer al network recién generado
            let sequencedNetwork = network;
            try { sequencedNetwork = VnaSequencer.sequence(network); } catch(_) {}
            this._network = sequencedNetwork;

            this._setStatus('📐 Renderizando grafo 2D secuenciado…');
            this.dom.vnaPlaceholder.style.display = 'none';
            if (this.dom.vnaGraph2D)     { this.dom.vnaGraph2D.style.display = 'flex'; }
            if (this.dom.vnaCanvasMount) { this.dom.vnaCanvasMount.style.display = 'none'; }
            await this._render2DGraph(sequencedNetwork);

            // Canvas 3D en background
            await this._initCanvas();
            await this._canvas.loadVnaNetwork(sequencedNetwork);

            this._setStatus('📋 Generando Work Orders del Swarm…');
            const proj   = store.getState().projects.find(p => p.id === this.activeProjectId);
            const aLevel = proj?.settings?.automation_level || 'review_first';
            const { workOrders, flows } = WoGenerator.fromVnaNetwork(network, { automation_level: aLevel });
            this._pendingWos = workOrders;
            this._woFlows    = flows;
            if (this.dom.telemWos) this.dom.telemWos.textContent = workOrders.length;

            this._renderWoList(workOrders);
            this.dom.woPanel?.classList.remove('hidden');

            if (aLevel === 'full_auto') {
                this._setStatus('⚡ Full Auto: inyectando WOs…');
                await this._confirmWos(workOrders);
            }

            this._setStatus(`✅ ${network.nodes.length} nodos · ${network.exchanges?.length||0} intercambios · ${workOrders.length} WOs`);

        } catch (err) {
            this._setStatus(`❌ ${err.message}`, true);
        } finally {
            this._setBtns(false);
        }
    }

    async _confirmWos(wos) {
        if (!wos.length) return;
        const proj = store.getState().projects.find(p => p.id === this.activeProjectId);
        if (!proj) return;
        const newFlows = this._woFlows.filter(f => !(proj.vna_flows||[]).find(ef => ef.id === f.id));
        const newWos   = wos.filter(w => !(proj.work_orders||[]).find(ew => ew.hash === w.hash));
        await store.dispatch({ type:'UPDATE_PROJECT_INFO', payload:{
            projectId: this.activeProjectId,
            updates: { vna_flows:[...(proj.vna_flows||[]),...newFlows], work_orders:[...(proj.work_orders||[]),...newWos] }
        }});
        newWos.forEach(wo => {
            const card = document.querySelector(`[data-wo-hash="${wo.hash}"]`);
            if (card) { card.style.opacity='0.45'; card.style.borderColor='rgba(0,230,118,0.25)'; }
        });
        this._setStatus(`✅ ${newWos.length} WOs en Kanban · <a href="/project" data-link style="color:var(--accent-indigo);">Ver →</a>`);
        this.dom.woConfirmBar.style.display = 'none';
        document.querySelectorAll('#mapStatus [data-link]').forEach(l => {
            l.addEventListener('click', e => { e.preventDefault(); window.navigateTo(l.getAttribute('href')); });
        });
    }

    async _runSkills() {
        this._setBtns(true);
        let created = 0;
        for (const node of this._network.nodes) {
            this._setStatus(`⚡ Skill: ${node.label||node.id}…`);
            try {
                const art = await Orchestrator.createSkillFromVna({ projectId:this.activeProjectId, skillName:node.id, skillContext:node, roleName:node.label||node.id });
                this._updateTelemetry(art.telemetry);
                created++;
            } catch (_) {}
        }
        this._setStatus(`✅ ${created}/${this._network.nodes.length} skills creadas.`);
        this._setBtns(false);
    }

    async _runAgent() {
        this._setBtns(true);
        this._setStatus('🤖 Fabricando agente vertical…');
        try {
            const art = await Orchestrator.designVerticalAgent({
                projectId:this.activeProjectId, vertical:this.activeProjectId,
                sector:this._network.mission||'general', useCases:(this._network.nodes||[]).map(n=>n.label||n.id)
            });
            this._updateTelemetry(art.telemetry);
            const def = art.payload;
            this._setStatus(`✅ Agente <b>${def?.name||def?.id||'vertical'}</b> en el Swarm.`);
        } catch(err) { this._setStatus(`❌ ${err.message}`, true); }
        finally { this._setBtns(false); }
    }

    async _runHeal() {
        this._setBtns(true);
        this._setStatus('🔍 Analizando patologías…');
        try {
            const art = await Orchestrator.curateNetworkHealth({ projectId:this.activeProjectId });
            if (!art) throw new Error('Sin datos VNA.');
            this._updateTelemetry(art.telemetry);
            this._renderHealth(art.payload?.health_score??0);
            const n = art.payload?.pathologies?.length||0;
            this._setStatus(n===0?'✅ Red saludable.': `⚠️ ${n} patología(s) detectada(s).`);
        } catch(err) { this._setStatus(`❌ ${err.message}`, true); }
        finally { this._setBtns(false); }
    }

    _exportNetwork() {
        if (!this._network) return;
        const a = document.createElement('a');
        a.href     = URL.createObjectURL(new Blob([JSON.stringify(this._network,null,2)],{type:'application/json'}));
        a.download = `vna_${this.activeProjectId}_${Date.now()}.jsonld`;
        a.click();
    }

    async _initCanvas() {
        if (this._canvas) return;
        this._canvas = new SynapticCanvas(this.dom.vnaCanvasMount, { projectId:this.activeProjectId, isVnaMode:true });
        await this._canvas.render();
    }

    _renderWoList(wos) {
        if (!this.dom.woList) return;
        const s = WoGenerator.summary(wos);
        if (this.dom.woSummaryBar) this.dom.woSummaryBar.innerHTML =
            `<span><b>${s.total}</b> total</span><span><b style="color:var(--accent-green)">${s.auto}</b> auto</span><span><b style="color:var(--accent-orange)">${s.hitl}</b> hitl</span><span><b style="color:#555">${s.human}</b> human</span><span><b>${s.totalHours}h</b></span>`;
        if (!wos.length) { this.dom.woList.innerHTML='<div style="color:#333;font-size:0.78rem;font-style:italic;text-align:center;padding:2rem 0;">Sin Work Orders.</div>'; return; }
        const autoLabel  = {auto:'⚡ auto',hitl:'👁️ hitl',human:'👤 human'};
        const autoCls    = {auto:'auto-auto',hitl:'auto-hitl',human:'auto-human'};
        this.dom.woList.innerHTML = wos.map(wo => `
            <div class="wo-card" data-wo-hash="${wo.hash}">
                <div style="display:flex;align-items:center;gap:5px;margin-bottom:7px;flex-wrap:wrap;">
                    <span class="wo-type-badge wo-${wo.woType}">${wo.woType}</span>
                    <span class="wo-auto-badge ${autoCls[wo.automation]||'auto-human'}">${autoLabel[wo.automation]||wo.automation}</span>
                    <span style="font-size:0.62rem;color:#444;font-family:var(--font-mono);margin-left:auto;">${wo.estimatedHours}h</span>
                </div>
                <div style="font-weight:900;font-size:0.84rem;color:white;margin-bottom:3px;line-height:1.3;">${wo.entregable}</div>
                <div style="font-size:0.7rem;color:#555;margin-bottom:6px;">${wo.from} → ${wo.to}</div>
                <div style="font-size:0.68rem;color:#444;line-height:1.4;">${(wo.context||'').substring(0,90)}${(wo.context||'').length>90?'…':''}</div>
                <div style="display:flex;gap:5px;margin-top:7px;">
                    <button class="wo-confirm-btn" data-hash="${wo.hash}"
                        style="flex:1;padding:4px;background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.15);
                        color:var(--accent-indigo);border-radius:5px;cursor:pointer;font-size:0.68rem;font-weight:bold;">
                        + Kanban
                    </button>
                    <a href="/map?wo=${wo.hash}" data-link
                        style="padding:4px 7px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);
                        color:#444;border-radius:5px;font-size:0.68rem;text-decoration:none;">🔗</a>
                </div>
            </div>`).join('');
        this.dom.woList.querySelectorAll('.wo-confirm-btn').forEach(btn => {
            btn.addEventListener('click', async e => {
                const wo = this._pendingWos.find(w => w.hash === e.currentTarget.dataset.hash);
                if (wo) await this._confirmWos([wo]);
            });
        });
        this.dom.woList.querySelectorAll('[data-link]').forEach(l => {
            l.addEventListener('click', e => { e.preventDefault(); window.history.pushState(null,null,l.getAttribute('href')); });
        });
        if (this.dom.woConfirmBar) this.dom.woConfirmBar.style.display = 'flex';
    }

    _focusWoCard(hash) { document.querySelector(`[data-wo-hash="${hash}"]`)?.classList.add('focused'); }

    _setStatus(msg, isError=false) {
        const el = this.dom.mapStatus;
        if (!el) return;
        el.innerHTML = msg;
        el.classList.add('visible');
        el.classList.toggle('error', isError);
    }

    _setBtns(disabled) {
        if (this.dom.btnMap)    this.dom.btnMap.disabled    = disabled;
        if (this.dom.btnSkills) this.dom.btnSkills.disabled = disabled || !this._network;
        if (this.dom.btnAgent)  this.dom.btnAgent.disabled  = disabled || !this._network;
        if (this.dom.btnHeal)   this.dom.btnHeal.disabled   = disabled;
    }

    _updateTelemetry(t) {
        if (!t?.tokens) return;
        this._telem.tokens += t.tokens.total_tokens || 0;
        const base = ((t.tokens.prompt_tokens||0)/1e6)*3.00 + ((t.tokens.completion_tokens||0)/1e6)*15.00;
        this._telem.cost   += base * 1.35;
        this._telem.slices  = Number((this._telem.slices + base * 1.35 * 2.0).toFixed(3));
        if (this.dom.telemTokens) this.dom.telemTokens.textContent = this._telem.tokens.toLocaleString();
        if (this.dom.telemCost)   this.dom.telemCost.textContent   = `$${this._telem.cost.toFixed(3)}`;
        if (this.dom.telemSlices) this.dom.telemSlices.textContent = this._telem.slices.toFixed(3);
    }

    _renderHealth(score) {
        const pct   = Math.round((score||0)*100);
        const color = pct>=70?'var(--accent-green)':pct>=40?'var(--accent-orange)':'var(--accent-red)';
        if (this.dom.healthScore) { this.dom.healthScore.textContent=`${pct}%`; this.dom.healthScore.style.color=color; }
        if (this.dom.healthFill)  { this.dom.healthFill.style.width=`${pct}%`; this.dom.healthFill.style.background=color; }
        if (this.dom.healthLabel) this.dom.healthLabel.textContent =
            pct>=70?'Red saludable':pct>=40?'Patologías menores':'Red crítica — curar';
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  _render2DGraph — renderiza el VNA como grafo SVG en toda la zona central
    //  Usa VnaMapRenderer con layout por tier + labels en aristas + seq badges
    // ══════════════════════════════════════════════════════════════════════════
    async _render2DGraph(networkOverride = null) {
        const container = this.dom.vnaGraph2D;
        if (!container) return;

        const proj = store.getState().projects.find(p => p.id === this.activeProjectId);
        let net = networkOverride || this._network || (proj ? {
            nodes:     proj.vna_nodes     || [],
            exchanges: proj.vna_exchanges || [],
            mission:   proj.vna_description || proj.nombre || '',
            meta:      { health_score: proj.health_score }
        } : null);

        if (!net || !(net.nodes || []).length) {
            container.innerHTML = '<div style="flex:1;display:flex;align-items:center;justify-content:center;color:#222;">Sin datos VNA.</div>';
            return;
        }

        // Aplicar secuenciación si no está ya aplicada
        if (!net.sequencing_meta) {
            try { net = VnaSequencer.sequence(net); } catch(_) {}
        }

        const showSequence = this.dom.seqToggle?.checked !== false;
        const svg = this._buildFullSvg(net, showSequence);
        container.innerHTML = svg;

        // Hacer nodos clickables para seleccionar WOs relacionadas
        container.querySelectorAll('[data-node-id]').forEach(el => {
            el.style.cursor = 'pointer';
            el.addEventListener('click', () => {
                const nodeId = el.dataset.nodeId;
                const relatedWos = (this._pendingWos || []).filter(w => w.from === nodeId || w.to === nodeId);
                if (relatedWos.length) this._highlightWoCards(relatedWos.map(w => w.hash));
            });
        });
    }

    // ── Construir SVG completo con layout por nivel ───────────────────────────
    _buildFullSvg(net, showSequence = true) {
        const nodes     = net.nodes     || [];
        const exchanges = net.exchanges || [];
        if (!nodes.length) return '<svg width="100%" height="200"><text x="50%" y="100" text-anchor="middle" fill="#333">Sin nodos</text></svg>';

        // ── Layout por nivel casteller ─────────────────────────────────────────
        // tier 0 = @anxaneta (arriba), 4 = @pinya (abajo)
        // Invertir: mayor tier = más abajo en la pantalla
        const TIER_ORDER = { '@anxaneta':0,'@aixecador':1,'@dosos':2,'@baixos':3,'@pinya':4 };
        const tiers = {};
        nodes.forEach(n => {
            const t = n.tier ?? (TIER_ORDER[n.levelId] ?? 2);
            if (!tiers[t]) tiers[t] = [];
            tiers[t].push({ ...n, _tier: t });
        });

        const tierKeys = Object.keys(tiers).map(Number).sort((a,b) => a - b);
        const W = 900;
        const NODE_W = 150, NODE_H = 52, PAD_X = 24, GAP_Y = 110;
        const TOTAL_H = Math.max(600, tierKeys.length * GAP_Y + 120);

        const nodePos = {};
        tierKeys.forEach((tier, ti) => {
            const tierNodes = tiers[tier];
            const count     = tierNodes.length;
            const totalW    = count * NODE_W + (count - 1) * PAD_X;
            const startX    = (W - totalW) / 2;
            const y         = 60 + ti * GAP_Y;
            tierNodes.forEach((node, i) => {
                const x = startX + i * (NODE_W + PAD_X);
                nodePos[node.id] = { x, y, cx: x + NODE_W / 2, cy: y + NODE_H / 2, ...node };
            });
        });

        // ── Colores por rol ────────────────────────────────────────────────────
        const ROLE_FILL  = { human:'rgba(15,110,86,.18)', agent:'rgba(83,74,183,.18)', process:'rgba(153,60,29,.14)', organization:'rgba(24,95,165,.14)', resource:'rgba(59,109,17,.14)' };
        const ROLE_STR   = { human:'#0F6E56', agent:'#534AB7', process:'#993C1D', organization:'#185FA5', resource:'#3B6D11' };
        const ROLE_TXT   = { human:'#5ecfaa', agent:'#a8a3ee', process:'#f0a07a', organization:'#85B7EB', resource:'#a3d977' };

        // ── Aristas (edges) con label de entregable y badge de secuencia ───────
        const edgeSvg = exchanges.map((ex, i) => {
            const from = nodePos[ex.from];
            const to   = nodePos[ex.to];
            if (!from || !to) return '';

            const isTang  = ex.type !== 'intangible';
            const isPay   = ex.category === 'payment';
            const color   = isPay ? '#BA7517' : isTang ? '#1D9E75' : '#7F77DD';
            const dash    = isTang ? '' : 'stroke-dasharray="7 4"';
            const markerId = isPay ? 'arr-p' : isTang ? 'arr-t' : 'arr-i';
            const seq     = ex.sequence_order;

            // Calcular punto de salida/entrada en el borde del nodo
            const dx   = to.cx - from.cx;
            const dy   = to.cy - from.cy;
            const len  = Math.sqrt(dx*dx + dy*dy) || 1;
            const x1   = from.cx + (dx/len) * (NODE_W/2 + 3);
            const y1   = from.cy + (dy/len) * (NODE_H/2 + 2);
            const x2   = to.cx   - (dx/len) * (NODE_W/2 + 10);
            const y2   = to.cy   - (dy/len) * (NODE_H/2 + 2);

            // Punto medio para label y badge
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            // Label del entregable (truncado)
            const label = (ex.label || ex.entregable || '').substring(0, 28);
            const labelBg = `<rect x="${midX - label.length*3.2}" y="${midY - 10}" width="${label.length*6.4 + 10}" height="16" rx="4" fill="rgba(0,0,0,0.75)" stroke="${color}" stroke-width="0.4"/>`;
            const labelTxt = `<text x="${midX}" y="${midY + 2}" text-anchor="middle" font-size="9" fill="${color}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${label}</text>`;

            // Badge de secuencia
            const seqBadge = (showSequence && seq != null) ? `
                <circle cx="${x1 + (x2-x1)*0.15}" cy="${y1 + (y2-y1)*0.15}" r="10" fill="${color}" opacity="0.95"/>
                <text x="${x1 + (x2-x1)*0.15}" y="${y1 + (y2-y1)*0.15 + 3.5}" text-anchor="middle" font-size="9" font-weight="600" fill="#fff" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${seq}</text>` : '';

            return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
                        stroke="${color}" stroke-width="1.5" ${dash} marker-end="url(#${markerId})" fill="none"/>
                    ${labelBg}${labelTxt}${seqBadge}`;
        }).join('');

        // ── Nodos ─────────────────────────────────────────────────────────────
        const nodeSvg = Object.values(nodePos).map(n => {
            const fill  = ROLE_FILL[n.role]  || 'rgba(100,100,100,.1)';
            const str   = ROLE_STR[n.role]   || '#555';
            const txt   = ROLE_TXT[n.role]   || '#ccc';
            const label = (n.label || n.id || '').substring(0, 18);
            const lvl   = (n.levelId || '').replace('@','').substring(0, 7);
            return `<g data-node-id="${n.id}">
                <rect x="${n.x.toFixed(1)}" y="${n.y.toFixed(1)}" width="${NODE_W}" height="${NODE_H}" rx="8"
                    fill="${fill}" stroke="${str}" stroke-width="0.8"/>
                <text x="${n.cx.toFixed(1)}" y="${(n.y + NODE_H/2 - 7).toFixed(1)}"
                    text-anchor="middle" font-size="11" font-weight="500" fill="${txt}"
                    font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${label}</text>
                <text x="${n.cx.toFixed(1)}" y="${(n.y + NODE_H/2 + 9).toFixed(1)}"
                    text-anchor="middle" font-size="9" fill="${str}" opacity="0.7"
                    font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${lvl}</text>
            </g>`;
        }).join('');

        // ── Tier labels (izquierda) ───────────────────────────────────────────
        const TIER_LABELS = { 0:'@anxaneta', 1:'@aixecador', 2:'@dosos', 3:'@baixos', 4:'@pinya' };
        const tierLabelsSvg = tierKeys.map(t => {
            const y = 60 + tierKeys.indexOf(t) * GAP_Y + NODE_H / 2 + 5;
            return `<text x="8" y="${y}" font-size="8" fill="#333" font-family="monospace"
                transform="rotate(-90,8,${y})" text-anchor="middle">${TIER_LABELS[t] || ''}</text>`;
        }).join('');

        // ── Health badge ──────────────────────────────────────────────────────
        const hs = net.sequencing_meta?.health_score ?? net.meta?.health_score;
        const hsBadge = hs != null ? `
            <rect x="${W-80}" y="6" width="72" height="20" rx="6" fill="rgba(0,230,118,.1)" stroke="rgba(0,230,118,.3)" stroke-width="0.5"/>
            <text x="${W-44}" y="20" text-anchor="middle" font-size="10" fill="#00e676"
                font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">health ${Number(hs).toFixed(2)}</text>` : '';

        // ── Leyenda ───────────────────────────────────────────────────────────
        const legend = `
            <circle cx="20" cy="${TOTAL_H-18}" r="8" fill="rgba(0,230,118,.2)" stroke="#1D9E75" stroke-width="0.6"/>
            <text x="32" y="${TOTAL_H-13}" font-size="9" fill="#555" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">tangible</text>
            <line x1="72" y1="${TOTAL_H-18}" x2="88" y2="${TOTAL_H-18}" stroke="#7F77DD" stroke-width="1.5" stroke-dasharray="4 3"/>
            <text x="92" y="${TOTAL_H-13}" font-size="9" fill="#555" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">intangible</text>
            ${showSequence ? `<circle cx="145" cy="${TOTAL_H-18}" r="7" fill="#1D9E75" opacity="0.9"/>
            <text x="145" y="${TOTAL_H-14}" text-anchor="middle" font-size="8" fill="#fff">1</text>
            <text x="156" y="${TOTAL_H-13}" font-size="9" fill="#555" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">secuencia</text>` : ''}`;

        // ── Defs ──────────────────────────────────────────────────────────────
        const defs = `<defs>
            <marker id="arr-t" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke="#1D9E75" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </marker>
            <marker id="arr-i" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke="#7F77DD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </marker>
            <marker id="arr-p" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke="#BA7517" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </marker>
        </defs>`;

        return `<svg width="100%" viewBox="0 0 ${W} ${TOTAL_H}" xmlns="http://www.w3.org/2000/svg"
            style="min-height:${TOTAL_H}px;display:block;padding:8px;">
            ${defs}
            ${tierLabelsSvg}
            ${edgeSvg}
            ${nodeSvg}
            ${hsBadge}
            ${legend}
        </svg>`;
    }

    // ── Highlight WO cards ────────────────────────────────────────────────────
    _highlightWoCards(hashes) {
        document.querySelectorAll('.wo-card').forEach(c => c.style.borderColor = '');
        hashes.forEach(h => {
            const card = document.querySelector(`[data-wo-hash="${h}"]`);
            if (card) card.style.borderColor = 'var(--accent-indigo)';
        });
    }

    executeViewScript() { return this.afterRender(); }
}
