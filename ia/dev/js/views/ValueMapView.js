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

        <div class="app-layout" style="flex-direction:column; overflow:hidden;">
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
                            <button id="btnMap" class="vmap-btn vmap-btn-primary">🗺️ Mapear Red de Valor</button>
                            <div id="mapStatus" class="vmap-status"></div>
                        </div>

                        <div class="vmap-section">
                            <div class="vmap-stitle">⚡ Swarm</div>
                            <button id="btnSkills" class="vmap-btn vmap-btn-ghost" ${!hasVna ? 'disabled' : ''}>⚡ Crear Skills desde VNA</button>
                            <button id="btnAgent"  class="vmap-btn vmap-btn-ghost" ${!hasVna ? 'disabled' : ''}>🤖 Fabricar Agente Vertical</button>
                            <button id="btnHeal"   class="vmap-btn vmap-btn-orange" ${!hasVna ? 'disabled' : ''}>🔍 Curar Red</button>
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
                        <div id="vnaCanvasMount" style="flex:1;display:${hasVna?'flex':'none'};flex-direction:column;"></div>
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

        // Si ya hay VNA en el proyecto, inicializar canvas
        if ((project.vna_nodes || []).length > 0) {
            await this._initCanvas();
            await this._canvas?.loadVNAData();
            if (this._canvas?.graph3D) {
                this._canvas.graph3D.graphData({ nodes: this._canvas.nodes, links: this._canvas.links });
            }
            // WOs previas del Swarm
            const prev = (project.work_orders || []).filter(w => w.createdBy === 'node-claude-sonnet-v10');
            if (prev.length) this._renderWoList(prev);
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

        this.dom.btnSkills?.addEventListener('click',  async () => { if (this._network?.nodes?.length) await this._runSkills(); });
        this.dom.btnAgent?.addEventListener('click',   async () => { if (this._network) await this._runAgent(); });
        this.dom.btnHeal?.addEventListener('click',    async () => await this._runHeal());
        this.dom.btnCloseWoPanel?.addEventListener('click', () => this.dom.woPanel?.classList.add('hidden'));
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

            this._setStatus('🌌 Renderizando red 3D…');
            await this._initCanvas();
            await this._canvas.loadVnaNetwork(network);
            this.dom.vnaPlaceholder.style.display = 'none';
            this.dom.vnaCanvasMount.style.display  = 'flex';

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

    executeViewScript() { return this.afterRender(); }
}
