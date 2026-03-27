// =============================================================================
// TEAMTOWERS SOS V10 — VALUE MAP VIEW
// Ruta: ia/dev/js/views/ValueMapView.js
// Topología VNA · Arquitectura Fractal · Bucle Imperial
// =============================================================================

import { store }        from '../core/store.js';
import { KB }           from '../core/kb.js';
import { Sidebar }      from '../components/Sidebar.js';
import { BottomNav }    from '../components/BottomNav.js';
import { PageHeader }   from '../components/PageHeader.js';
import { MapRenderer }  from '../components/MapRenderer.js';
import { Orchestrator } from '../core/Orchestrator.js';

export default class ValueMapView {

    constructor() {
        document.title     = 'Mapa VNA | TeamTowers V10';
        this.activeProjectId = null;
        this.selectedRoleId  = null;
        this.editingTxIndex  = null;
        this.flowFromId      = null;
        this.isSimulating    = false;
        this.isHeatmapActive = false;
        this.currentSimIndex = 0;
        this.simTimeoutId    = null;
        this.zoomVis         = 1;
        this.zoomEdit        = 1;
        this.mapVis          = null;
        this.mapEdit         = null;
        this.resizeObserver  = null;
        this.currentTab      = 'visual';
        this.isPO            = false;
        this.dom             = {};
    }

    async getHtml() {
        await store.init();

        const state        = store.getState();
        const activeUserId = state.session.activeUserId;

        let project = state.projects.find(p => p.id === localStorage.getItem('tt_active_project'));
        if (!project && state.projects.length > 0) project = state.projects.at(-1);

        if (!project) {
            return `
            <div class="app-layout">
                ${Sidebar.getHtml('/map')}
                <main class="workspace" style="justify-content:center; align-items:center;">
                    <div class="glass-panel" style="text-align:center; max-width:500px; margin:0 auto;">
                        <div style="font-size:5rem; margin-bottom:1.5rem; line-height:1;">🕸️</div>
                        <h2 style="color:white; margin-top:0; font-weight:900;">Lienzo Vacío</h2>
                        <p style="color:var(--text-muted); margin-bottom:2.5rem;">No tienes un Ecosistema activo para visualizar.</p>
                        <a href="/create" data-link class="btn-primary" style="text-decoration:none;">➕ Forjar Ecosistema</a>
                    </div>
                </main>
                ${BottomNav.getHtml('/map')}
            </div>`;
        }

        this.activeProjectId = project.id;
        this.isPO = project.ownerId === activeUserId || state.session.role === 'ecosystem-owner';

        const roleOptions = (project.roles || []).map(r =>
            `<option value="${r.id}">${r.name} (${r.levelId})</option>`
        ).join('');

        const flowsForTable = project.vna_flows?.length > 0 ? project.vna_flows : (project.transactions || []);
        const flowsHtml = flowsForTable.map((f, i) => {
            const from = project.roles?.find(r => r.id === f.from);
            const to   = project.roles?.find(r => r.id === f.to);
            return `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                <td style="padding:10px; color:#aaa; font-size:0.85rem;">${from?.name || f.from}</td>
                <td style="padding:10px; color:#aaa; font-size:0.85rem;">${to?.name || f.to}</td>
                <td style="padding:10px;"><span style="font-size:0.72rem; padding:2px 8px; border-radius:6px; background:${f.tipo==='tangible'?'rgba(0,230,118,0.1)':'rgba(224,64,251,0.1)'}; color:${f.tipo==='tangible'?'var(--accent-green)':'var(--accent-purple)'}; border:1px solid ${f.tipo==='tangible'?'rgba(0,230,118,0.3)':'rgba(224,64,251,0.3)'};">${f.tipo||'tangible'}</span></td>
                <td style="padding:10px; color:white; font-size:0.85rem; font-weight:bold;">${f.template || f.entregable || '—'}</td>
                <td style="padding:10px; color:var(--accent-indigo); font-family:var(--font-mono); font-size:0.82rem;">${f.horas || f.estimatedHours || '?'}h</td>
                ${this.isPO ? `<td style="padding:10px;"><button class="btn-del-flow" data-idx="${i}" style="background:transparent; border:1px solid var(--accent-red); color:var(--accent-red); padding:4px 10px; border-radius:6px; font-size:0.75rem; cursor:pointer;">✕</button></td>` : '<td></td>'}
            </tr>`;
        }).join('');

        const headerConfig = {
            title:   'Topología VNA',
            subtitle: project.nombre,
            tagline: 'Arquitectura fractal de Roles y Tuberías de Valor.',
            tabs: [
                { id: 'visual', label: '🕸️ Red Visual',     active: this.currentTab === 'visual' },
                { id: 'edit',   label: '✏️ Arquitecto',     active: this.currentTab === 'edit'   },
                { id: 'roles',  label: '🪑 Padrón Nodos',   active: this.currentTab === 'roles'  },
                { id: 'flow',   label: '📋 Tubos Base',     active: this.currentTab === 'flow'   }
            ],
            magicActions: [
                { id: 'sim_flow', label: 'Simular Tuberías',     icon: '▶' },
                { id: 'sim_heat', label: 'Heatmap de Carga',     icon: '🔥' },
                { id: 'sim_stop', label: 'Detener Visualización', icon: '⏹' }
            ]
        };

        return `
        <style>
            ${MapRenderer.getStyles()}

            .workspace-map { display:flex; flex-direction:column; flex:1; padding:2rem 3rem; overflow-y:auto; overflow-x:hidden; scroll-behavior:smooth; width:100%; box-sizing:border-box; }
            .tab-content        { display:none; flex-direction:column; flex:1; animation:fadeIn 0.4s ease-out; min-height:500px; position:relative; width:100%; }
            .tab-content.active { display:flex; }

            .map-container { position:relative; flex:1; min-height:420px; background:rgba(0,0,0,0.4); border-radius:16px; border:1px solid var(--glass-border); overflow:hidden; }
            .map-canvas    { position:relative; width:100%; height:100%; min-height:420px; }
            .map-canvas svg { position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; overflow:visible; }

            .map-container.fullscreen-mode { position:fixed!important; top:0!important; left:0!important; width:100vw!important; height:100dvh!important; z-index:99999!important; border-radius:0!important; background:#050508!important; }

            .zoom-controls { position:absolute; bottom:12px; right:12px; display:flex; gap:6px; z-index:10; }
            .btn-zoom { background:rgba(0,0,0,0.7); border:1px solid #333; color:white; width:32px; height:32px; border-radius:8px; cursor:pointer; font-size:1rem; display:flex; align-items:center; justify-content:center; transition:0.2s; }
            .btn-zoom:hover { background:var(--accent-indigo); border-color:var(--accent-indigo); }

            /* AI Copilot panel */
            .ai-copilot { position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(120%); width:90%; max-width:700px; background:rgba(10,10,15,0.97); border:1px solid rgba(99,102,241,0.4); border-radius:20px; padding:1.5rem; z-index:1000; transition:0.5s cubic-bezier(0.2,0.8,0.2,1); box-shadow:0 20px 50px rgba(0,0,0,0.8); }
            .ai-copilot.visible { transform:translateX(-50%) translateY(0); }
            .ai-copilot-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; }
            .ai-copilot-body   { color:#ccc; font-size:0.9rem; line-height:1.6; max-height:180px; overflow-y:auto; }

            /* Inspector modal */
            .inspector-overlay { position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); backdrop-filter:blur(10px); z-index:5000; display:none; justify-content:center; align-items:center; }
            .inspector-overlay.active { display:flex; }
            .inspector-card { background:var(--bg-dark); border:1px solid var(--accent-indigo); border-radius:20px; padding:2.5rem; width:100%; max-width:480px; box-shadow:0 30px 60px rgba(0,0,0,0.8); border-top:4px solid var(--accent-indigo); box-sizing:border-box; }
            .form-group { margin-bottom:1.25rem; }
            .form-group label { display:block; font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; font-weight:bold; letter-spacing:1px; margin-bottom:6px; }
            .form-control { width:100%; background:rgba(0,0,0,0.5); border:1px solid #333; color:white; padding:11px 14px; border-radius:10px; font-family:var(--font-main); font-size:0.92rem; outline:none; transition:0.3s; box-sizing:border-box; }
            .form-control:focus { border-color:var(--accent-indigo); }

            /* Flow table */
            .flow-table { width:100%; border-collapse:collapse; }
            .flow-table th { text-align:left; padding:10px; font-size:0.72rem; color:#888; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid rgba(255,255,255,0.1); }

            @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
            @media (max-width:768px) { .workspace-map { padding:80px 1rem 120px 1rem; } }
        </style>

        <div class="app-layout">
            ${Sidebar.getHtml('/map')}
            <main class="workspace-map">
                ${PageHeader.getHtml(headerConfig)}

                <!-- TAB VISUAL ───────────────────────────────── -->
                <div id="tab-visual" class="tab-content ${this.currentTab === 'visual' ? 'active' : ''}">
                    <div style="display:flex; gap:10px; font-size:0.78rem; font-weight:bold; color:#aaa; align-items:center; background:rgba(0,0,0,0.5); padding:8px 14px; border-radius:8px; border:1px solid var(--glass-border); width:max-content; margin-bottom:1rem;">
                        <div style="display:flex; align-items:center; gap:6px;"><div style="width:16px;height:3px;border-radius:2px;background:var(--accent-green);"></div> Tangible</div>
                        <div style="display:flex; align-items:center; gap:6px;"><div style="width:16px;height:3px;border-radius:2px;border-bottom:2px dashed var(--accent-purple);background:transparent;"></div> Intangible</div>
                    </div>
                    <div class="map-container">
                        <div class="map-canvas" id="mapCanvasVisual">
                            <svg id="edges-svg-visual">
                                <defs>
                                    <marker id="arrow-tangible-vis" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#00e676"/></marker>
                                    <marker id="arrow-intangible-vis" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#e040fb"/></marker>
                                </defs>
                                <g id="paths-group-vis"></g>
                            </svg>
                        </div>
                        <div class="zoom-controls">
                            <button class="btn-zoom" id="btnZoomInVis">➕</button>
                            <button class="btn-zoom" id="btnZoomOutVis">➖</button>
                        </div>
                    </div>
                </div>

                <!-- TAB EDIT ─────────────────────────────────── -->
                <div id="tab-edit" class="tab-content ${this.currentTab === 'edit' ? 'active' : ''}">
                    ${this.isPO ? `
                    <div style="background:rgba(99,102,241,0.05); border:1px dashed rgba(99,102,241,0.3); color:var(--accent-indigo); padding:14px 18px; border-radius:10px; font-size:0.88rem; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                        <span id="editTipText">💡 <b>Modo Arquitecto:</b> Haz clic en un nodo y luego en otro para trazar una tubería permanente.</span>
                        <div style="display:flex; gap:8px;">
                            <button id="btnStrategicAudit" style="background:rgba(99,102,241,0.1); border:1px solid var(--accent-indigo); color:var(--accent-indigo); padding:7px 14px; border-radius:8px; font-size:0.8rem; font-weight:bold; cursor:pointer; transition:0.2s;">🧠 Bucle Imperial</button>
                            <button id="btnUndoTx" style="background:rgba(255,82,82,0.1); border:1px solid var(--accent-red); color:var(--accent-red); padding:7px 14px; border-radius:8px; font-size:0.8rem; font-weight:bold; cursor:pointer; transition:0.2s;">↩ Deshacer</button>
                            <button id="btnFullscreen" style="background:rgba(255,255,255,0.05); border:1px solid #333; color:white; padding:7px 14px; border-radius:8px; font-size:0.8rem; cursor:pointer;">⛶ Pantalla Completa</button>
                        </div>
                    </div>` : ''}
                    <div class="map-container" id="editMapContainer">
                        <div class="map-canvas" id="mapCanvasEdit">
                            <svg id="edges-svg-edit">
                                <defs>
                                    <marker id="arrow-tangible-edit" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#00e676"/></marker>
                                    <marker id="arrow-intangible-edit" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#e040fb"/></marker>
                                </defs>
                                <g id="paths-group-edit"></g>
                            </svg>
                        </div>
                        <div class="zoom-controls">
                            <button class="btn-zoom" id="btnZoomInEdit">➕</button>
                            <button class="btn-zoom" id="btnZoomOutEdit">➖</button>
                        </div>
                    </div>
                </div>

                <!-- TAB ROLES ────────────────────────────────── -->
                <div id="tab-roles" class="tab-content ${this.currentTab === 'roles' ? 'active' : ''}">
                    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px,1fr)); gap:1.25rem; padding-bottom:4rem;">
                        ${(project.roles||[]).map(r => {
                            const asig = (project.asignaciones||[]).find(a => a.roleId === r.id);
                            const user = asig ? state.globalUsers.find(u => u.id === asig.userId) : null;
                            return `
                            <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.05); border-radius:14px; padding:1.25rem;">
                                <div style="font-weight:900; color:white; margin-bottom:6px;">${r.name}</div>
                                <div style="font-family:var(--font-mono); font-size:0.72rem; color:#666; margin-bottom:10px;">${r.levelId}</div>
                                <div style="display:flex; gap:8px; font-family:var(--font-mono); font-size:0.75rem; color:#888; flex-wrap:wrap; margin-bottom:10px;">
                                    <span>FMV: ${r.fmv}€/h</span><span>x${r.multiplier}</span>
                                    ${r.guardian ? `<span>🛡️ ${r.guardian}</span>` : ''}
                                </div>
                                ${user
                                    ? `<div style="display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.3); padding:7px 10px; border-radius:8px; font-size:0.85rem;"><span>${user.profile?.isAi?'🤖':'👤'}</span><span style="color:white; font-weight:bold;">${user.name}</span></div>`
                                    : `<div style="color:#555; font-style:italic; font-size:0.8rem; border:1px dashed #333; padding:7px 10px; border-radius:8px; text-align:center;">Vacante</div>`}
                            </div>`;
                        }).join('')}
                    </div>
                </div>

                <!-- TAB FLUJOS ───────────────────────────────── -->
                <div id="tab-flow" class="tab-content ${this.currentTab === 'flow' ? 'active' : ''}">
                    <div style="background:rgba(0,0,0,0.4); border:1px solid var(--glass-border); border-radius:14px; overflow:hidden; margin-bottom:4rem;">
                        <table class="flow-table">
                            <thead style="background:rgba(0,0,0,0.5);">
                                <tr><th>Desde</th><th>Hacia</th><th>Tipo</th><th>Entregable</th><th>Horas</th><th></th></tr>
                            </thead>
                            <tbody id="flowTableBody">${flowsHtml || `<tr><td colspan="6" style="text-align:center; color:#555; padding:2rem; font-style:italic;">Sin flujos VNA definidos.</td></tr>`}</tbody>
                        </table>
                    </div>
                </div>
            </main>

            <!-- AI Copilot ─────────────────────────────────── -->
            <div class="ai-copilot" id="aiCopilot">
                <div class="ai-copilot-header">
                    <span style="color:var(--accent-indigo); font-weight:900; font-size:0.9rem;" id="aiCopilotHeader">🧠 Análisis Estratégico</span>
                    <button id="btnCloseCopilot" style="background:transparent; border:none; color:#aaa; cursor:pointer; font-size:1.2rem;">✖</button>
                </div>
                <div class="ai-copilot-body" id="aiCopilotBody">Procesando análisis de red…</div>
            </div>

            <!-- Inspector Modal ─────────────────────────────── -->
            <div id="inspectorModal" class="inspector-overlay">
                <div class="inspector-card">
                    <h2 id="insName" style="margin-top:0; color:white; font-size:1.3rem; font-weight:900;">Nodo</h2>
                    <p id="insLevel" style="color:var(--accent-indigo); font-family:var(--font-mono); font-size:0.82rem; margin-bottom:1.5rem;"></p>
                    <div class="form-group">
                        <label>FMV (€/hora)</label>
                        <input type="number" id="inputFmv" class="form-control" min="5" step="5">
                    </div>
                    <div class="form-group">
                        <label>Multiplicador de Riesgo</label>
                        <input type="number" id="inputMult" class="form-control" min="0.5" max="5" step="0.1">
                    </div>
                    <div class="form-group">
                        <label>System Prompt / Ikigai del Rol</label>
                        <textarea id="insPrompt" class="form-control" rows="4" placeholder="Define el propósito y SOPs de este rol…"></textarea>
                    </div>
                    <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:1.5rem;">
                        <button id="btnCloseInspector" style="background:transparent; border:1px solid #444; color:#aaa; padding:10px 20px; border-radius:10px; cursor:pointer; font-weight:bold;">Cerrar</button>
                        <button id="btnSaveNodeData" class="btn-primary">💾 Sellar Datos del Nodo</button>
                    </div>
                </div>
            </div>

            <!-- Tooltip ────────────────────────────────────── -->
            <div id="txTooltip" style="display:none; position:fixed; background:rgba(10,10,14,0.97); border:1px solid var(--accent-indigo); color:white; padding:14px 18px; border-radius:12px; font-size:0.85rem; z-index:999999; box-shadow:0 20px 50px rgba(0,0,0,0.9); pointer-events:none; max-width:320px;"></div>

            ${BottomNav.getHtml('/map')}
        </div>`;
    }

    async afterRender() {
        Sidebar.initListeners();
        PageHeader.afterRender(
            // onTabChange
            (tabId) => {
                this.currentTab = tabId;
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(`tab-${tabId}`)?.classList.add('active');
                if (tabId === 'visual' || tabId === 'edit') {
                    setTimeout(() => {
                        this.mapVis?.renderEdges();
                        this.mapEdit?.renderEdges();
                    }, 50);
                }
            },
            // onMagicAction
            (actionId) => {
                if (actionId === 'sim_flow') { this.isHeatmapActive = false; if (this.mapVis) this.mapVis.options.isHeatmap = false; this.startSimulation(); }
                if (actionId === 'sim_heat') { this.stopSimulation(); this.isHeatmapActive = true; if (this.mapVis) { this.mapVis.options.isHeatmap = true; this.mapVis.renderEdges(); } this._triggerAiInsight('🔥 <b>Heatmap:</b> Las líneas más gruesas indican tuberías con más Proof of Work auditado.'); }
                if (actionId === 'sim_stop') { this.stopSimulation(); document.getElementById('aiCopilot')?.classList.remove('visible'); }
            }
        );

        const state   = store.getState();
        const project = state.projects.find(p => p.id === this.activeProjectId);
        if (!project) return;

        // ── DOM refs ──────────────────────────────────────────────
        this.dom = {
            canvasVis:        document.getElementById('mapCanvasVisual'),
            pathsVis:         document.getElementById('paths-group-vis'),
            canvasEdit:       document.getElementById('mapCanvasEdit'),
            pathsEdit:        document.getElementById('paths-group-edit'),
            aiCopilot:        document.getElementById('aiCopilot'),
            aiCopilotHeader:  document.getElementById('aiCopilotHeader'),
            aiCopilotBody:    document.getElementById('aiCopilotBody'),
            btnCloseCopilot:  document.getElementById('btnCloseCopilot'),
            btnStrategicAudit: document.getElementById('btnStrategicAudit'),
            btnUndoTx:        document.getElementById('btnUndoTx'),
            btnFullscreen:    document.getElementById('btnFullscreen'),
            editMapContainer: document.getElementById('editMapContainer'),
            inspectorModal:   document.getElementById('inspectorModal'),
            insName:          document.getElementById('insName'),
            insLevel:         document.getElementById('insLevel'),
            inputFmv:         document.getElementById('inputFmv'),
            inputMult:        document.getElementById('inputMult'),
            insPrompt:        document.getElementById('insPrompt'),
            tooltip:          document.getElementById('txTooltip')
        };

        // ── Map Visual ────────────────────────────────────────────
        this.mapVis = new MapRenderer(this.dom.canvasVis, this.dom.pathsVis, { isEditMode: false, isHeatmap: false });
        this.mapVis.setData(project.roles || [], project.vna_flows?.length ? project.vna_flows : (project.transactions || []));

        // ── Map Edit (PO only) ────────────────────────────────────
        if (this.isPO && this.dom.canvasEdit) {
            this.mapEdit = new MapRenderer(this.dom.canvasEdit, this.dom.pathsEdit, {
                isEditMode: true,
                onNodeClick: (nodeId) => this._handleNodeClick(nodeId),
                onEdgeClick: (idx) => {
                    this.editingTxIndex = idx;
                    this._openTxBuilderModal();
                }
            });
            this.mapEdit.setData(project.roles || [], project.vna_flows?.length ? project.vna_flows : (project.transactions || []));

            this.dom.canvasEdit.addEventListener('mousemove', (e) => {
                if (this.flowFromId && this.mapEdit) {
                    this.mapEdit.drawTempLine(this.flowFromId, e.clientX, e.clientY, this.zoomEdit);
                }
            });
        }

        // ── Zoom Visual ───────────────────────────────────────────
        document.getElementById('btnZoomInVis')?.addEventListener('click',  () => { this.zoomVis  = Math.min(this.zoomVis  + 0.1, 2.5); this.mapVis?.setZoom(this.zoomVis); });
        document.getElementById('btnZoomOutVis')?.addEventListener('click', () => { this.zoomVis  = Math.max(this.zoomVis  - 0.1, 0.4); this.mapVis?.setZoom(this.zoomVis); });
        document.getElementById('btnZoomInEdit')?.addEventListener('click',  () => { this.zoomEdit = Math.min(this.zoomEdit + 0.1, 2.5); this.mapEdit?.setZoom(this.zoomEdit); });
        document.getElementById('btnZoomOutEdit')?.addEventListener('click', () => { this.zoomEdit = Math.max(this.zoomEdit - 0.1, 0.4); this.mapEdit?.setZoom(this.zoomEdit); });

        // ── Copilot close ─────────────────────────────────────────
        this.dom.btnCloseCopilot?.addEventListener('click', () => this.dom.aiCopilot?.classList.remove('visible'));

        // ── Fullscreen ────────────────────────────────────────────
        this.dom.btnFullscreen?.addEventListener('click', () => {
            this.dom.editMapContainer?.classList.toggle('fullscreen-mode');
            const isFull = this.dom.editMapContainer?.classList.contains('fullscreen-mode');
            if (this.dom.btnFullscreen) this.dom.btnFullscreen.innerText = isFull ? '✕ Salir' : '⛶ Pantalla Completa';
            setTimeout(() => { this.mapEdit?.renderEdges(); }, 100);
        });

        // ── Undo last flow ────────────────────────────────────────
        this.dom.btnUndoTx?.addEventListener('click', async () => {
            const p = store.getState().projects.find(x => x.id === this.activeProjectId);
            if (!p?.vna_flows?.length) return alert('No hay flujos para deshacer.');
            if (!confirm('¿Eliminar el último flujo VNA?')) return;
            const updatedFlows = p.vna_flows.slice(0, -1);
            await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: p.id, updates: { vna_flows: updatedFlows } } });
            window.location.reload();
        });

        // ── Bucle Imperial (Strategic Audit) ─────────────────────
        this.dom.btnStrategicAudit?.addEventListener('click', () => this._runStrategicAudit());

        // ── Inspector Modal ───────────────────────────────────────
        document.getElementById('btnCloseInspector')?.addEventListener('click', () => document.getElementById('inspectorModal').classList.remove('active'));

        document.getElementById('btnSaveNodeData')?.addEventListener('click', async () => {
            if (!this.selectedRoleId) return;
            const fmv  = parseFloat(document.getElementById('inputFmv').value);
            const mult = parseFloat(document.getElementById('inputMult').value);
            const prompt = document.getElementById('insPrompt').value.trim();
            const p    = store.getState().projects.find(x => x.id === this.activeProjectId);
            const roles = p.roles.map(r => r.id === this.selectedRoleId ? { ...r, fmv, multiplier: mult, ai_prompt: prompt } : r);
            await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: p.id, updates: { roles } } });
            document.getElementById('inspectorModal').classList.remove('active');
            this.mapEdit?.setData(roles, p.vna_flows || []);
        });

        // ── Delete flow from table ────────────────────────────────
        document.querySelectorAll('.btn-del-flow').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const idx = parseInt(e.currentTarget.dataset.idx);
                if (!confirm('¿Eliminar este flujo VNA?')) return;
                const p      = store.getState().projects.find(x => x.id === this.activeProjectId);
                const flows  = [...(p.vna_flows?.length ? p.vna_flows : (p.transactions || []))];
                flows.splice(idx, 1);
                await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: p.id, updates: { vna_flows: flows } } });
                window.location.reload();
            });
        });

        // ── ResizeObserver ────────────────────────────────────────
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(() => {
                this.mapVis?.renderEdges();
                this.mapEdit?.renderEdges();
            });
            if (this.dom.canvasVis)  this.resizeObserver.observe(this.dom.canvasVis);
            if (this.dom.canvasEdit) this.resizeObserver.observe(this.dom.canvasEdit);
        }
    }

    // ── Handle node click (Arquitecto) ───────────────────────────
    _handleNodeClick(nodeId) {
        if (!this.isPO) return;
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);

        if (this.flowFromId === null) {
            this.flowFromId = nodeId;
            if (this.dom.editTipText) this.dom.editTipText.innerHTML = `⚡ Nodo origen seleccionado: <strong>${nodeId}</strong>. Haz clic en el nodo destino.`;
        } else if (this.flowFromId === nodeId) {
            // Abrir inspector
            this.flowFromId = null;
            this.selectedRoleId = nodeId;
            const role = p?.roles?.find(r => r.id === nodeId);
            if (role && this.dom.inspectorModal) {
                this.dom.insName.textContent  = role.name;
                this.dom.insLevel.textContent = role.levelId;
                this.dom.inputFmv.value       = role.fmv || 40;
                this.dom.inputMult.value      = role.multiplier || 1;
                this.dom.insPrompt.value      = role.ai_prompt || '';
                this.dom.inspectorModal.classList.add('active');
            }
            if (this.dom.editTipText) this.dom.editTipText.innerHTML = '💡 <b>Modo Arquitecto:</b> Haz clic en un nodo y luego en otro para trazar una tubería.';
        } else {
            this._createFlow(this.flowFromId, nodeId);
            this.flowFromId = null;
            if (this.dom.editTipText) this.dom.editTipText.innerHTML = '✅ Tubería trazada. Haz clic en dos nodos para continuar.';
        }
    }

    async _createFlow(fromId, toId) {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        if (!p) return;
        const newFlow = {
            id:       'flow_' + Date.now(),
            from:     fromId,
            to:       toId,
            tipo:     'tangible',
            template: 'Nuevo Flujo',
            horas:    4,
            soc_checklist: []
        };
        const updatedFlows = [...(p.vna_flows || []), newFlow];
        await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: p.id, updates: { vna_flows: updatedFlows } } });
        this.mapEdit?.setData(p.roles, updatedFlows);
        this.mapVis?.setData(p.roles, updatedFlows);
    }

    // ── Strategic Audit (Bucle Imperial) ─────────────────────────
    async _runStrategicAudit() {
        const btn = this.dom.btnStrategicAudit;
        if (btn) { btn.disabled = true; btn.innerText = '⏳ Analizando…'; }

        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        if (!p) return;

        const flows     = p.vna_flows?.length ? p.vna_flows : (p.transactions || []);
        const roles     = p.roles || [];
        const mappedFlows = flows.map(f => {
            const from = roles.find(r => r.id === f.from);
            const to   = roles.find(r => r.id === f.to);
            return `${from?.name || f.from} → ${to?.name || f.to} [${f.tipo || 'tangible'}] "${f.template || f.entregable || '?'}" (${f.horas || '?'}h)`;
        });

        const systemPrompt = `Eres @seny_analyst, auditor estratégico del Swarm SOS V10.
Analiza la topología VNA de un ecosistema y busca:
- Cuellos de botella de ejecución.
- Saltos jerárquicos peligrosos.
- Falta de tuberías intangibles (auditoría, revisión de calidad).
- Tareas automatizables con IA.
Devuelve un reporte en TEXTO PLANO estructurado con viñetas. No uses JSON.`;

        const userPrompt = `Ecosistema: ${p.nombre}
Roles: ${roles.map(r => `${r.name} (${r.levelId})`).join(', ')}
Flujos de Valor:
${mappedFlows.join('\n')}`;

        try {
            const response = await Orchestrator.callLLM({
                preferredEngine: 'anthropic',
                systemPrompt,
                userPrompt,
                responseFormat: 'text',
                temperature:    0.3
            });

            this._triggerAiInsight(response.content.replace(/\n/g, '<br>'), '🧠 Informe Estratégico (@seny_analyst)');
        } catch (err) {
            this._triggerAiInsight(`❌ Fallo en la matriz neuronal: ${err.message}`, 'Error Estratégico');
        } finally {
            if (btn) { btn.disabled = false; btn.innerText = '🧠 Bucle Imperial'; }
        }
    }

    _triggerAiInsight(html, title = '🧠 IA Copilot') {
        if (this.dom.aiCopilotHeader) this.dom.aiCopilotHeader.innerHTML = title;
        if (this.dom.aiCopilotBody)   this.dom.aiCopilotBody.innerHTML  = html;
        this.dom.aiCopilot?.classList.add('visible');
    }

    // ── Simulación de flujo ───────────────────────────────────────
    startSimulation() {
        if (this.isSimulating) return;
        this.isSimulating    = true;
        this.currentSimIndex = 0;
        const p     = store.getState().projects.find(x => x.id === this.activeProjectId);
        const flows = p?.vna_flows?.length ? p.vna_flows : (p?.transactions || []);
        if (!flows.length) { this._triggerAiInsight('Sin flujos para simular.'); this.isSimulating = false; return; }

        const step = () => {
            if (!this.isSimulating) return;
            const f = flows[this.currentSimIndex % flows.length];
            this._triggerAiInsight(`▶ Flujo activo: <strong>${f.template || f.entregable || '?'}</strong> → ${f.horas || '?'}h estimadas.`);
            this.currentSimIndex++;
            this.simTimeoutId = setTimeout(step, 2000);
        };
        step();
    }

    stopSimulation() {
        this.isSimulating = false;
        if (this.simTimeoutId) clearTimeout(this.simTimeoutId);
    }

    // Alias V9
    executeViewScript() { return this.afterRender(); }
}
