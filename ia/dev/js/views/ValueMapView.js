// =============================================================================
// TEAMTOWERS SOS V10.1 — VALUE MAP VIEW v4 — Sprint 1
// [#TEAMTOWERS_V10_ANTIGRAVITY_KERNEL]
// Ruta: /ia/dev/js/views/ValueMapView.js
//
// Sprint 1: Fases 2 y 3 editables + drag-and-drop sequence_order nativo
//   Fase 1 → Roles como actividades (editable)
//   Fase 2 → Flujos generados → lista editable con D&D → confirmar → mapa
//   Fase 3 → SOCs como chips editables → confirmar → Work Orders
// =============================================================================

import { store }          from '../core/store.js';
import { KB }             from '../core/kb.js';
import { Sidebar }        from '../components/Sidebar.js';
import { BottomNav }      from '../components/BottomNav.js';
import { PageHeader }     from '../components/PageHeader.js';
import { Orchestrator }   from '../core/Orchestrator.js';
import { WoGenerator }    from '../core/WoGenerator.js';
import { VnaSequencer }   from '../core/VnaSequencer.js';
import { VnaMapRenderer } from '../components/VnaMapRenderer.js';
import { VnaCalibrator, VnaCalibratorEngine } from '../core/VnaCalibrator.js';

export default class ValueMapView {

    constructor() {
        document.title       = 'Mapa de Valor | TeamTowers V10';
        this.activeProjectId = null;
        this.dom             = {};
        this._network        = { nodes: [], exchanges: [], meta: {} };
        this._phase          = 0;
        this._pendingWos     = [];
        this._telem          = { tokens: 0, cost: 0, slices: 0 };
        this._dragSrcIdx     = null; // drag-and-drop state

        const params = new URLSearchParams(window.location.search);
        this._initProjectId = params.get('project') || null;
    }

    async getHtml() {
        await store.init();
        const state   = store.getState();
        const project = this._initProjectId
            ? state.projects.find(p => p.id === this._initProjectId)
            : state.projects.find(p => p.id === localStorage.getItem('tt_active_project'))
              || state.projects.find(p => !p.isArchived);

        if (!project) {
            return `<div class="app-layout">
                ${Sidebar.getHtml('/map')}
                <main class="workspace" style="display:flex;align-items:center;justify-content:center;">
                    <div class="glass-panel" style="text-align:center;max-width:480px;padding:4rem;">
                        <div style="font-size:4rem;margin-bottom:1rem;">🕸️</div>
                        <h2 style="color:white;margin-top:0;">Lienzo vacío</h2>
                        <p style="color:var(--text-muted);">Crea un ecosistema primero.</p>
                        <a href="/ia/dev/" data-link style="color:var(--accent-indigo);">← Volver al inicio</a>
                    </div>
                </main>
                ${BottomNav.getHtml('/map')}
            </div>`;
        }

        this.activeProjectId = project.id;

        return `
        <style>
            .vmap-shell  { display:flex; flex:1; min-height:0; overflow:hidden; }
            .vmap-left   { width:300px; min-width:260px; display:flex; flex-direction:column;
                border-right:1px solid var(--glass-border); background:rgba(5,5,8,0.97);
                overflow-y:auto; flex-shrink:0; }
            .vmap-center { flex:1; display:flex; flex-direction:column; overflow:hidden;
                background:radial-gradient(circle at center,#0a0a12,#050508); position:relative; }

            .vmap-sec    { padding:1rem 1.2rem; border-bottom:1px solid rgba(255,255,255,0.04); }
            .vmap-stitle { font-size:0.67rem; font-weight:900; color:#444; text-transform:uppercase;
                letter-spacing:1.5px; margin-bottom:0.7rem; }
            .vmap-textarea { width:100%; background:rgba(0,0,0,0.4); border:1px solid #222;
                color:white; padding:10px 12px; border-radius:9px; font-family:var(--font-base);
                font-size:0.84rem; outline:none; resize:vertical; min-height:80px;
                box-sizing:border-box; transition:border-color 0.2s; }
            .vmap-textarea:focus { border-color:rgba(99,102,241,0.4); }
            .vmap-textarea::placeholder { color:#2a2a2a; }

            .phase-btn { width:100%; padding:11px 14px; border-radius:9px; font-weight:900;
                font-size:0.83rem; cursor:pointer; transition:0.2s; border:none; margin-top:7px;
                display:flex; align-items:center; justify-content:center; gap:8px; }
            .phase-btn:disabled { opacity:0.25; cursor:not-allowed; transform:none !important; }
            .phase-btn:hover:not(:disabled) { transform:translateY(-1px); }
            .phase-btn-1  { background:linear-gradient(135deg,rgba(99,102,241,0.8),rgba(83,74,183,0.8)); color:white; }
            .phase-btn-2  { background:linear-gradient(135deg,rgba(0,230,118,0.7),rgba(29,158,117,0.7)); color:white; }
            .phase-btn-3  { background:linear-gradient(135deg,rgba(255,145,0,0.7),rgba(186,117,23,0.7)); color:white; }
            .phase-btn-wo { background:linear-gradient(135deg,rgba(224,64,251,0.7),rgba(99,102,241,0.7)); color:white; }
            .phase-btn-ok { background:linear-gradient(135deg,rgba(0,230,118,0.8),rgba(29,158,117,0.8)); color:white; }
            .phase-btn-reset { background:transparent; border:1px dashed rgba(255,82,82,0.3)!important;
                color:rgba(255,82,82,0.5); font-size:0.72rem; padding:6px; margin-top:4px; }

            .phase-tracker { display:flex; gap:5px; padding:0.8rem 1.2rem;
                border-bottom:1px solid rgba(255,255,255,0.04); }
            .phase-dot { flex:1; height:3px; border-radius:2px; background:rgba(255,255,255,0.06); transition:background 0.4s; }
            .phase-dot.active { background:var(--accent-indigo); }
            .phase-dot.done   { background:var(--accent-green); }

            .vmap-status { font-size:0.74rem; font-family:var(--font-mono); color:var(--accent-indigo);
                padding:8px 10px; background:rgba(99,102,241,0.06); border:1px dashed rgba(99,102,241,0.2);
                border-radius:7px; margin-top:8px; line-height:1.5; display:none; }
            .vmap-status.on  { display:block; }
            .vmap-status.err { color:var(--accent-red); background:rgba(255,82,82,0.06); border-color:rgba(255,82,82,0.2); }

            .telem-row  { display:flex; gap:6px; }
            .telem-card { flex:1; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.04); border-radius:7px; padding:6px 8px; }
            .telem-val  { font-size:0.95rem; font-weight:900; font-family:var(--font-mono); color:white; }
            .telem-lbl  { font-size:0.58rem; color:#444; text-transform:uppercase; letter-spacing:1px; margin-top:1px; }

            .health-row { display:flex; align-items:center; gap:10px; }
            .health-num { font-size:1.2rem; font-weight:900; font-family:var(--font-mono); min-width:42px; }
            .health-bar { flex:1; height:4px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden; }
            .health-fill{ height:100%; border-radius:3px; transition:width 0.8s; }

            #vnaCanvas { flex:1; overflow:auto; }
            #vnaCanvas svg { min-height:100%; }
            #vnaPlaceholder { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; }

            #vnaDetail { position:absolute; top:1rem; right:1rem; width:260px;
                background:rgba(10,10,15,0.97); border:1px solid var(--glass-border);
                border-radius:12px; padding:1rem; font-size:0.78rem; color:#aaa;
                display:none; z-index:10; box-shadow:0 8px 30px rgba(0,0,0,0.5); }
            #vnaDetail.on { display:block; }
            .detail-title { font-weight:900; color:white; font-size:0.85rem; margin-bottom:6px; }
            .detail-soc   { background:rgba(255,145,0,0.06); border:1px solid rgba(255,145,0,0.2);
                border-radius:6px; padding:5px 8px; margin-top:5px; font-size:0.7rem; color:var(--accent-orange); }

            /* ── Roles list (Fase 1) ── */
            #rolesList { padding:0.6rem 1.2rem; overflow-y:auto; flex:1; }
            .role-item  { display:flex; align-items:flex-start; gap:8px; padding:8px 0;
                border-bottom:1px solid rgba(255,255,255,0.04); }
            .role-edit-name  { background:transparent; border:none; border-bottom:1px solid #333;
                color:white; font-size:0.8rem; font-weight:700; outline:none; width:100%;
                padding:2px 0; font-family:var(--font-base); transition:border-color 0.2s; }
            .role-edit-name:focus  { border-bottom-color:var(--accent-indigo); }
            .role-edit-deliv { background:transparent; border:none; border-bottom:1px solid #222;
                color:#888; font-size:0.72rem; outline:none; width:100%;
                padding:2px 0; font-family:var(--font-base); transition:border-color 0.2s; }
            .role-edit-deliv:focus { border-bottom-color:var(--accent-green); }

            /* ── Flows list (Fase 2) — drag & drop ── */
            #flowsList { padding:0.5rem 1rem; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:5px; }
            .flow-item { display:flex; align-items:center; gap:6px; padding:7px 8px;
                background:rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.06);
                border-radius:8px; cursor:grab; transition:0.15s; user-select:none; }
            .flow-item:active { cursor:grabbing; }
            .flow-item.drag-over { border-color:var(--accent-indigo); background:rgba(99,102,241,0.08); }
            .flow-item.dragging  { opacity:0.4; }
            .flow-drag-handle { color:#333; font-size:0.9rem; flex-shrink:0; cursor:grab; }
            .flow-seq  { font-size:0.65rem; font-weight:900; font-family:var(--font-mono);
                color:var(--accent-indigo); min-width:18px; text-align:center; }
            .flow-route{ font-size:0.65rem; color:#555; font-family:var(--font-mono); white-space:nowrap; flex-shrink:0; }
            .flow-edit-label { background:transparent; border:none; border-bottom:1px solid #222;
                color:white; font-size:0.75rem; outline:none; flex:1; min-width:0;
                padding:1px 0; font-family:var(--font-base); transition:border-color 0.2s; }
            .flow-edit-label:focus { border-bottom-color:var(--accent-green); }
            .flow-type-badge { font-size:0.6rem; padding:2px 5px; border-radius:4px; font-weight:900;
                flex-shrink:0; cursor:pointer; transition:0.15s; }
            .flow-type-t { background:rgba(29,158,117,0.15); color:#1D9E75; border:1px solid rgba(29,158,117,0.3); }
            .flow-type-i { background:rgba(127,119,221,0.15); color:#7F77DD; border:1px solid rgba(127,119,221,0.3); }
            .flow-del    { background:transparent; border:none; color:#333; cursor:pointer; font-size:0.75rem;
                padding:0 3px; flex-shrink:0; transition:color 0.15s; }
            .flow-del:hover { color:var(--accent-red); }

            /* ── SOCs list (Fase 3) ── */
            #socsList { padding:0.5rem 1rem; overflow-y:auto; flex:1; }
            .soc-exchange { margin-bottom:12px; }
            .soc-exchange-title { font-size:0.68rem; font-weight:900; color:#555;
                text-transform:uppercase; letter-spacing:1px; margin-bottom:5px; }
            .soc-chips { display:flex; flex-wrap:wrap; gap:5px; }
            .soc-chip  { display:flex; align-items:center; gap:4px; padding:3px 8px;
                background:rgba(255,145,0,0.06); border:1px solid rgba(255,145,0,0.2);
                border-radius:20px; font-size:0.68rem; color:var(--accent-orange); }
            .soc-chip-text { outline:none; background:transparent; border:none;
                color:var(--accent-orange); font-size:0.68rem; min-width:60px;
                font-family:var(--font-base); }
            .soc-chip-del  { background:transparent; border:none; color:rgba(255,145,0,0.4);
                cursor:pointer; font-size:0.75rem; padding:0; line-height:1; }
            .soc-chip-del:hover { color:var(--accent-red); }
            .soc-add-btn   { background:transparent; border:1px dashed rgba(255,145,0,0.3);
                color:rgba(255,145,0,0.5); border-radius:20px; padding:3px 8px;
                font-size:0.65rem; cursor:pointer; transition:0.15s; }
            .soc-add-btn:hover { border-color:var(--accent-orange); color:var(--accent-orange); }

            @media (max-width:768px) {
                .vmap-shell { flex-direction:column; }
                .vmap-left  { width:100%; max-height:50vh; }
            }
        </style>

        <div class="app-layout">
            ${Sidebar.getHtml('/map')}
            <div style="display:flex;flex:1;min-height:0;flex-direction:column;overflow:hidden;">
                <div style="padding:0.75rem 1.5rem 0;flex-shrink:0;">
                    ${PageHeader.getHtml({ title:'Mapa de Valor', subtitle: project.nombre,
                        tagline:'Red de valor · 3 fases · Roles como actividades con entregables', tabs:[] })}
                </div>

                <div class="vmap-shell">
                    <!-- PANEL IZQUIERDO -->
                    <aside class="vmap-left">

                        <div class="phase-tracker">
                            <div class="phase-dot" id="dot1" title="Fase 1: Roles"></div>
                            <div class="phase-dot" id="dot2" title="Fase 2: Flujos"></div>
                            <div class="phase-dot" id="dot3" title="Fase 3: SOCs"></div>
                        </div>

                        <div class="vmap-sec">
                            <div class="vmap-stitle">🧬 Ecosistema</div>
                            <textarea id="vnaInput" class="vmap-textarea" rows="4"
                                placeholder="Describe el sistema, negocio o proceso a mapear…">${project.vna_description || ''}</textarea>

                            <button id="btnPhase1" class="phase-btn phase-btn-1">👥 Fase 1 — Identificar Roles</button>
                            <button id="btnPhase2" class="phase-btn phase-btn-2" disabled>🔀 Fase 2 — Mapear Flujos</button>
                            <button id="btnPhase3" class="phase-btn phase-btn-3" disabled>✅ Fase 3 — Definir SOCs</button>
                            <button id="btnGenWos" class="phase-btn phase-btn-wo" disabled>📋 Generar Work Orders</button>
                            <button id="btnReset"  class="phase-btn phase-btn-reset">↺ Reiniciar mapa</button>

                            <div id="mapStatus" class="vmap-status"></div>
                        </div>

                        <!-- Fase 1: Lista editable de roles -->
                        <div id="rolesSection" style="display:none;flex-direction:column;flex:1;min-height:0;">
                            <div style="padding:0.7rem 1.2rem 0.4rem;border-bottom:1px solid rgba(255,255,255,0.04);">
                                <div class="vmap-stitle">👥 Roles
                                    <span id="rolesCount" style="color:var(--accent-indigo);font-weight:900;font-size:0.75rem;"></span>
                                </div>
                                <div style="font-size:0.68rem;color:#444;">Edita antes de continuar a Fase 2</div>
                            </div>
                            <div id="rolesList"></div>
                        </div>

                        <!-- Fase 2: Lista editable de flujos con D&D -->
                        <div id="flowsSection" style="display:none;flex-direction:column;flex:1;min-height:0;">
                            <div style="padding:0.7rem 1.2rem 0.4rem;border-bottom:1px solid rgba(255,255,255,0.04);">
                                <div class="vmap-stitle">🔀 Flujos
                                    <span id="flowsCount" style="color:var(--accent-green);font-weight:900;font-size:0.75rem;"></span>
                                </div>
                                <div style="font-size:0.68rem;color:#444;margin-bottom:4px;">
                                    Arrastra ↕ para reordenar · Edita el entregable · T=tangible I=intangible
                                </div>
                                <button id="btnConfirmFlows" class="phase-btn phase-btn-ok" style="margin-top:4px;">
                                    ✓ Confirmar flujos y ver mapa
                                </button>
                            </div>
                            <div id="flowsList"></div>
                        </div>

                        <!-- Fase 3: SOCs como chips editables -->
                        <div id="socsSection" style="display:none;flex-direction:column;flex:1;min-height:0;">
                            <div style="padding:0.7rem 1.2rem 0.4rem;border-bottom:1px solid rgba(255,255,255,0.04);">
                                <div class="vmap-stitle">✅ SOCs por flujo</div>
                                <div style="font-size:0.68rem;color:#444;margin-bottom:4px;">
                                    Edita criterios · + añadir · ✕ eliminar
                                </div>
                                <button id="btnConfirmSocs" class="phase-btn phase-btn-ok" style="margin-top:4px;">
                                    ✓ Confirmar SOCs
                                </button>
                            </div>
                            <div id="socsList"></div>
                        </div>

                        <!-- Telemetría + Health -->
                        <div class="vmap-sec" style="margin-top:auto;flex-shrink:0;">
                            <div class="vmap-stitle">📡 Sesión</div>
                            <div class="telem-row">
                                <div class="telem-card"><div class="telem-val" id="telemTokens">0</div><div class="telem-lbl">Tokens</div></div>
                                <div class="telem-card"><div class="telem-val" id="telemCost">$0.000</div><div class="telem-lbl">Coste</div></div>
                                <div class="telem-card"><div class="telem-val" id="telemSlices">0.000</div><div class="telem-lbl">Slices</div></div>
                            </div>
                            <div style="margin-top:8px;">
                                <div class="vmap-stitle">💚 Health</div>
                                <div class="health-row">
                                    <div class="health-num" id="healthScore" style="color:var(--accent-green);">—</div>
                                    <div style="flex:1;">
                                        <div class="health-bar"><div class="health-fill" id="healthFill" style="width:0%;background:var(--accent-green);"></div></div>
                                        <div style="font-size:0.62rem;color:#333;margin-top:3px;" id="healthLabel">Genera el mapa para ver el diagnóstico</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </aside>

                    <!-- CANVAS CENTRAL -->
                    <main class="vmap-center">
                        <div id="vnaPlaceholder">
                            <div style="font-size:3.5rem;opacity:0.15;margin-bottom:1rem;">🕸️</div>
                            <div style="color:#2a2a2a;font-size:0.9rem;font-weight:700;">Red de valor vacía</div>
                            <div style="color:#1a1a1a;font-size:0.75rem;margin-top:4px;">Describe el ecosistema y pulsa Fase 1</div>
                        </div>
                        <div id="vnaCanvas" style="display:none;flex:1;overflow:auto;"></div>

                        <div id="vnaDetail">
                            <button id="btnCloseDetail" style="position:absolute;top:8px;right:8px;background:transparent;border:none;color:#444;cursor:pointer;font-size:0.9rem;">✕</button>
                            <div class="detail-title" id="detailTitle">—</div>
                            <div id="detailBody" style="color:#666;font-size:0.73rem;line-height:1.6;"></div>
                        </div>
                    </main>
                </div>
            </div>
            ${BottomNav.getHtml('/map')}
        </div>`;
    }

    async afterRender() {
        Sidebar.initListeners();

        const state   = store.getState();
        const project = state.projects.find(p => p.id === this.activeProjectId);
        if (!project) return;

        this.dom = {
            input:          document.getElementById('vnaInput'),
            btnPhase1:      document.getElementById('btnPhase1'),
            btnPhase2:      document.getElementById('btnPhase2'),
            btnPhase3:      document.getElementById('btnPhase3'),
            btnGenWos:      document.getElementById('btnGenWos'),
            btnReset:       document.getElementById('btnReset'),
            status:         document.getElementById('mapStatus'),
            rolesSection:   document.getElementById('rolesSection'),
            rolesList:      document.getElementById('rolesList'),
            rolesCount:     document.getElementById('rolesCount'),
            flowsSection:   document.getElementById('flowsSection'),
            flowsList:      document.getElementById('flowsList'),
            flowsCount:     document.getElementById('flowsCount'),
            socsSection:    document.getElementById('socsSection'),
            socsList:       document.getElementById('socsList'),
            placeholder:    document.getElementById('vnaPlaceholder'),
            canvas:         document.getElementById('vnaCanvas'),
            detail:         document.getElementById('vnaDetail'),
            detailTitle:    document.getElementById('detailTitle'),
            detailBody:     document.getElementById('detailBody'),
            dot1:           document.getElementById('dot1'),
            dot2:           document.getElementById('dot2'),
            dot3:           document.getElementById('dot3'),
            telemTokens:    document.getElementById('telemTokens'),
            telemCost:      document.getElementById('telemCost'),
            telemSlices:    document.getElementById('telemSlices'),
            healthScore:    document.getElementById('healthScore'),
            healthFill:     document.getElementById('healthFill'),
            healthLabel:    document.getElementById('healthLabel'),
        };

        // Restaurar estado si existe VNA guardado
        const savedNetwork = await (async () => {
            try { await KB.init(); return await KB.getNode('vna-network-' + this.activeProjectId); }
            catch(_) { return null; }
        })();
        if (savedNetwork && savedNetwork.nodes && savedNetwork.nodes.length) {
            this._network = savedNetwork;
            this._phase   = savedNetwork.exchanges && savedNetwork.exchanges.length ? 2 : 1;
            this._renderMap();
            this._updatePhaseUI();
            if (savedNetwork.meta && savedNetwork.meta.health_score != null) {
                this._renderHealth(savedNetwork.meta.health_score);
            }
        }

        // ── Fase 1 ────────────────────────────────────────────────────────────
        this.dom.btnPhase1.addEventListener('click', async () => {
            const desc = this.dom.input.value.trim();
            if (!desc) { this._status('⚠️ Describe el ecosistema primero.', true); return; }
            await this._runPhase1(desc);
        });

        // ── Fase 2 ────────────────────────────────────────────────────────────
        this.dom.btnPhase2.addEventListener('click', async () => {
            if (!this._network.nodes || !this._network.nodes.length) {
                this._status('⚠️ Ejecuta primero la Fase 1.', true); return;
            }
            this._collectRoleEdits();
            await this._runPhase2();
        });

        // ── Confirmar flujos (tras edición Fase 2) ────────────────────────────
        document.getElementById('btnConfirmFlows').addEventListener('click', () => {
            this._collectFlowEdits();
            this._showFlowsSection(false);
            try { this._network = VnaSequencer.sequence(this._network); } catch(_) {}
            this._renderMap();
            this._updatePhaseUI();
            this._setDot(2, 'done');
            this._status('✅ Flujos confirmados. Mapa actualizado. Pulsa Fase 3 para definir SOCs o genera Work Orders directamente.');
        });

        // ── Fase 3 ────────────────────────────────────────────────────────────
        this.dom.btnPhase3.addEventListener('click', async () => {
            if (!this._network.exchanges || !this._network.exchanges.length) {
                this._status('⚠️ Ejecuta primero la Fase 2.', true); return;
            }
            await this._runPhase3();
        });

        // ── Confirmar SOCs ────────────────────────────────────────────────────
        document.getElementById('btnConfirmSocs').addEventListener('click', () => {
            this._collectSocEdits();
            this._showSocsSection(false);
            this._setDot(3, 'done');
            this._status('✅ SOCs confirmados. Genera Work Orders cuando estés listo.');
        });

        // ── Generar Work Orders ───────────────────────────────────────────────
        this.dom.btnGenWos.addEventListener('click', async () => {
            await this._runGenWos();
        });

        // ── Reset ─────────────────────────────────────────────────────────────
        this.dom.btnReset.addEventListener('click', async () => {
            if (!confirm('¿Reiniciar el mapa? Se perderán los roles y flujos actuales.')) return;
            this._network = { nodes: [], exchanges: [], meta: {} };
            this._phase   = 0;
            try {
                await KB.init();
                await KB.deleteNode('vna-network-' + this.activeProjectId);
                await KB.deleteNode('vna-roles-draft-' + this.activeProjectId);
            } catch(_) {}
            this._showFlowsSection(false);
            this._showSocsSection(false);
            if (this.dom.rolesSection) this.dom.rolesSection.style.display = 'none';
            this._renderMap();
            this._updatePhaseUI();
            this._renderHealth(0);
            this._status('↺ Mapa reiniciado.');
        });

        // ── Cerrar detalle ────────────────────────────────────────────────────
        document.getElementById('btnCloseDetail').addEventListener('click', () => {
            this.dom.detail.classList.remove('on');
        });
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  FASE 1
    // ══════════════════════════════════════════════════════════════════════════
    async _runPhase1(description) {
        this._setBtns(true);
        this._status('👥 Identificando roles como actividades con entregables…');
        this._setDot(1, 'active');
        try {
            await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: {
                projectId: this.activeProjectId, updates: { vna_description: description }
            }});
            const artifact = await Orchestrator.designVnaRoles({ projectId: this.activeProjectId, description });
            const payload  = artifact.payload;
            if (!payload || !payload.nodes || !payload.nodes.length) throw new Error('No se identificaron roles. Amplía la descripción.');

            this._network.nodes   = payload.nodes;
            this._network.mission = (payload.meta && payload.meta.mission) ? payload.meta.mission : description;
            this._network.meta    = payload.meta || {};
            this._phase = 1;

            this._updateTelemetry(artifact.telemetry);
            this._renderRolesList(payload.nodes);
            this._renderMap();
            this._updatePhaseUI();
            this._setDot(1, 'done');
            this._status('✅ ' + payload.nodes.length + ' roles identificados. Revisa y edita. Pulsa Fase 2 cuando estés listo.');
        } catch(err) {
            this._status('❌ ' + err.message, true);
            this._setDot(1, '');
        } finally {
            this._setBtns(false);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  FASE 2 — genera flujos y muestra lista editable con D&D
    // ══════════════════════════════════════════════════════════════════════════
    async _runPhase2() {
        this._setBtns(true);
        this._status('🔀 Mapeando flujos tangibles e intangibles…');
        this._setDot(2, 'active');
        try {
            const artifact = await Orchestrator.designVnaFlows({
                projectId: this.activeProjectId,
                nodes:     this._network.nodes,
                mission:   this._network.mission
            });
            const payload = artifact.payload;
            if (!payload || !payload.exchanges || !payload.exchanges.length) throw new Error('No se generaron flujos. Revisa los roles.');

            this._network.exchanges = payload.exchanges;
            if (payload.meta) this._network.meta = Object.assign({}, this._network.meta, payload.meta);
            this._phase = 2;

            this._updateTelemetry(artifact.telemetry);
            if (payload.meta && payload.meta.health_score != null) this._renderHealth(payload.meta.health_score);

            // Mostrar lista editable — el usuario revisa antes de ver el mapa
            this._renderFlowsList(this._network.exchanges);
            this._showFlowsSection(true);
            this._setDot(2, 'active');

            const t = payload.exchanges.filter(function(e){ return e.type === 'tangible'; }).length;
            const i = payload.exchanges.filter(function(e){ return e.type === 'intangible'; }).length;
            this._status('🔀 ' + payload.exchanges.length + ' flujos generados (' + t + ' tangibles · ' + i + ' intangibles). Revisa, reordena con drag-and-drop y confirma.');
        } catch(err) {
            this._status('❌ ' + err.message, true);
            this._setDot(2, '');
        } finally {
            this._setBtns(false);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  FASE 3 — genera SOCs y muestra chips editables
    // ══════════════════════════════════════════════════════════════════════════
    async _runPhase3() {
        this._setBtns(true);
        this._status('✅ Definiendo criterios de calidad (SOCs)…');
        this._setDot(3, 'active');
        try {
            const artifact = await Orchestrator.designVnaSocs({
                projectId: this.activeProjectId,
                exchanges: this._network.exchanges,
                nodes:     this._network.nodes
            });
            const payload = artifact.payload;
            this._phase = 3;

            const socsMap = {};
            (payload && payload.enriched_exchanges ? payload.enriched_exchanges : []).forEach(function(e){ socsMap[e.id] = e.socs; });
            this._network.exchanges = this._network.exchanges.map(function(ex){
                return Object.assign({}, ex, { socs: socsMap[ex.id] || ex.socs || [] });
            });
            if (payload && payload.health_score != null) {
                this._network.meta.health_score = payload.health_score;
                this._renderHealth(payload.health_score);
            }

            this._updateTelemetry(artifact.telemetry);

            // Mostrar chips editables
            this._renderSocsList(this._network.exchanges);
            this._showSocsSection(true);
            this._setDot(3, 'active');

            var totalSocs = payload && payload.summary ? (payload.summary.total_socs || 0) : 0;
            this._status('✅ ' + totalSocs + ' SOCs generados. Edita, añade o elimina criterios. Confirma cuando estés listo.');
        } catch(err) {
            this._status('❌ ' + err.message, true);
            this._setDot(3, '');
        } finally {
            this._setBtns(false);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  Generar Work Orders
    // ══════════════════════════════════════════════════════════════════════════
    async _runGenWos() {
        this._setBtns(true);
        this._status('📋 Generando Work Orders desde los flujos…');
        try {
            var proj   = store.getState().projects.find(function(p){ return p.id === this.activeProjectId; }.bind(this));
            var aLevel = (proj && proj.settings && proj.settings.automation_level) ? proj.settings.automation_level : 'review_first';
            var result = WoGenerator.fromVnaNetwork(this._network, { automation_level: aLevel });
            var workOrders = result.workOrders;
            this._pendingWos = workOrders;

            for (var i = 0; i < workOrders.length; i++) {
                await store.dispatch({ type: 'SPAWN_WORK_ORDER', payload: {
                    projectId: this.activeProjectId, workOrder: workOrders[i]
                }});
            }

            this._status('✅ ' + workOrders.length + ' Work Orders generadas. <a href="/project" data-link style="color:var(--accent-indigo);">Ver Kanban →</a>');
            var self = this;
            document.querySelectorAll('#mapStatus [data-link]').forEach(function(l) {
                l.addEventListener('click', function(e) { e.preventDefault(); if (window.navigateTo) window.navigateTo(l.getAttribute('href')); });
            });
        } catch(err) {
            this._status('❌ ' + err.message, true);
        } finally {
            this._setBtns(false);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  RENDER — Lista de roles (Fase 1)
    // ══════════════════════════════════════════════════════════════════════════
    _renderRolesList(nodes) {
        if (!this.dom.rolesList) return;
        var ROLE_COLORS_MAP = { human:'#5ecfaa', agent:'#a8a3ee', process:'#f0a07a', organization:'#85B7EB', resource:'#a3d977' };
        this.dom.rolesList.innerHTML = nodes.map(function(n) {
            return '<div class="role-item" data-role-id="' + n.id + '">' +
                '<div style="font-size:1rem;margin-top:2px;">' + VnaMapRenderer._roleIcon(n.role) + '</div>' +
                '<div style="flex:1;min-width:0;">' +
                '<input class="role-edit-name" data-field="label" value="' + (n.label || '') + '" style="color:' + (ROLE_COLORS_MAP[n.role] || '#ccc') + ';" placeholder="Nombre del rol (actividad)">' +
                '<input class="role-edit-deliv" data-field="main_deliverable" value="' + (n.main_deliverable || '') + '" placeholder="Entregable principal">' +
                '</div></div>';
        }).join('');
        if (this.dom.rolesCount) this.dom.rolesCount.textContent = nodes.length;
        this.dom.rolesSection.style.display = 'flex';
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  RENDER — Lista de flujos con D&D (Fase 2)
    // ══════════════════════════════════════════════════════════════════════════
    _renderFlowsList(exchanges) {
        if (!this.dom.flowsList) return;
        var self = this;

        // Construir mapa de nombres de roles
        var roleNames = {};
        (this._network.nodes || []).forEach(function(n){ roleNames[n.id] = n.label || n.id; });

        this.dom.flowsList.innerHTML = exchanges.map(function(ex, idx) {
            var fromName = (roleNames[ex.from] || ex.from || '?').substring(0, 12);
            var toName   = (roleNames[ex.to]   || ex.to   || '?').substring(0, 12);
            var isTang   = ex.type !== 'intangible';
            var typeClass = isTang ? 'flow-type-t' : 'flow-type-i';
            var typeLabel = isTang ? 'T' : 'I';
            var label     = ex.label || ex.entregable || '';
            return '<div class="flow-item" draggable="true" data-idx="' + idx + '" data-flow-id="' + (ex.id || idx) + '">' +
                '<span class="flow-drag-handle">⠿</span>' +
                '<span class="flow-seq">' + (idx + 1) + '</span>' +
                '<span class="flow-route">' + fromName + '→' + toName + '</span>' +
                '<input class="flow-edit-label" data-field="label" value="' + label + '" placeholder="Entregable (máx 28 chars)" maxlength="28">' +
                '<span class="flow-type-badge ' + typeClass + '" data-toggle-type="true" title="Click para cambiar tipo">' + typeLabel + '</span>' +
                '<button class="flow-del" data-del-idx="' + idx + '" title="Eliminar flujo">✕</button>' +
                '</div>';
        }).join('');

        if (this.dom.flowsCount) this.dom.flowsCount.textContent = exchanges.length;

        // ── Drag & Drop nativo ────────────────────────────────────────────────
        this._bindFlowsDragDrop();

        // ── Toggle tangible/intangible ────────────────────────────────────────
        this.dom.flowsList.querySelectorAll('[data-toggle-type]').forEach(function(badge) {
            badge.addEventListener('click', function() {
                var item  = badge.closest('.flow-item');
                var idx   = parseInt(item.dataset.idx);
                var ex    = self._network.exchanges[idx];
                if (!ex) return;
                ex.type = ex.type === 'intangible' ? 'tangible' : 'intangible';
                var isTang = ex.type !== 'intangible';
                badge.textContent  = isTang ? 'T' : 'I';
                badge.className    = 'flow-type-badge ' + (isTang ? 'flow-type-t' : 'flow-type-i');
            });
        });

        // ── Eliminar flujo ────────────────────────────────────────────────────
        this.dom.flowsList.querySelectorAll('[data-del-idx]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var idx = parseInt(btn.dataset.delIdx);
                self._network.exchanges.splice(idx, 1);
                self._renderFlowsList(self._network.exchanges);
            });
        });
    }

    // ── Drag & Drop binding ───────────────────────────────────────────────────
    _bindFlowsDragDrop() {
        var self  = this;
        var items = this.dom.flowsList.querySelectorAll('.flow-item');

        items.forEach(function(item) {
            item.addEventListener('dragstart', function(e) {
                self._dragSrcIdx = parseInt(item.dataset.idx);
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            item.addEventListener('dragend', function() {
                item.classList.remove('dragging');
                self.dom.flowsList.querySelectorAll('.flow-item').forEach(function(i){ i.classList.remove('drag-over'); });
            });

            item.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                self.dom.flowsList.querySelectorAll('.flow-item').forEach(function(i){ i.classList.remove('drag-over'); });
                item.classList.add('drag-over');
            });

            item.addEventListener('drop', function(e) {
                e.preventDefault();
                var targetIdx = parseInt(item.dataset.idx);
                if (self._dragSrcIdx === null || self._dragSrcIdx === targetIdx) return;

                // Reordenar el array
                var exs = self._network.exchanges;
                var moved = exs.splice(self._dragSrcIdx, 1)[0];
                exs.splice(targetIdx, 0, moved);

                // Actualizar sequence_order
                exs.forEach(function(ex, i){ ex.sequence_order = i + 1; });

                self._dragSrcIdx = null;
                self._renderFlowsList(exs);
            });
        });
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  RENDER — SOCs como chips editables (Fase 3)
    // ══════════════════════════════════════════════════════════════════════════
    _renderSocsList(exchanges) {
        if (!this.dom.socsList) return;
        var self = this;
        var roleNames = {};
        (this._network.nodes || []).forEach(function(n){ roleNames[n.id] = n.label || n.id; });

        // Solo mostrar flujos que tengan SOCs o sean tangibles
        var relevant = exchanges.filter(function(ex){ return ex.socs && ex.socs.length > 0; });
        if (!relevant.length) relevant = exchanges.slice(0, 10);

        this.dom.socsList.innerHTML = relevant.map(function(ex, exIdx) {
            var title = (ex.label || ex.entregable || ex.id || '').substring(0, 30);
            var from  = (roleNames[ex.from] || ex.from || '').substring(0, 10);
            var to    = (roleNames[ex.to]   || ex.to   || '').substring(0, 10);
            var socs  = ex.socs || [];

            var chipsHtml = socs.map(function(soc, socIdx) {
                return '<span class="soc-chip" data-ex-id="' + ex.id + '" data-soc-idx="' + socIdx + '">' +
                    '<span class="soc-chip-text" contenteditable="true">' + soc + '</span>' +
                    '<button class="soc-chip-del" data-ex-id="' + ex.id + '" data-soc-idx="' + socIdx + '">✕</button>' +
                    '</span>';
            }).join('');

            return '<div class="soc-exchange" data-ex-id="' + ex.id + '">' +
                '<div class="soc-exchange-title">' + from + ' → ' + to + ' · ' + title + '</div>' +
                '<div class="soc-chips" id="chips-' + ex.id + '">' + chipsHtml + '</div>' +
                '<button class="soc-add-btn" data-ex-id="' + ex.id + '">+ SOC</button>' +
                '</div>';
        }).join('');

        // ── Eliminar SOC ──────────────────────────────────────────────────────
        this.dom.socsList.querySelectorAll('.soc-chip-del').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var exId   = btn.dataset.exId;
                var socIdx = parseInt(btn.dataset.socIdx);
                var ex = self._network.exchanges.find(function(e){ return e.id === exId; });
                if (ex && ex.socs) {
                    ex.socs.splice(socIdx, 1);
                    self._renderSocsList(self._network.exchanges);
                }
            });
        });

        // ── Añadir SOC ────────────────────────────────────────────────────────
        this.dom.socsList.querySelectorAll('.soc-add-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var exId = btn.dataset.exId;
                var ex   = self._network.exchanges.find(function(e){ return e.id === exId; });
                if (!ex) return;
                if (!ex.socs) ex.socs = [];
                ex.socs.push('Nuevo criterio');
                self._renderSocsList(self._network.exchanges);
                // Focus en el nuevo chip
                var chips = document.getElementById('chips-' + exId);
                if (chips) {
                    var lastText = chips.querySelector('.soc-chip:last-child .soc-chip-text');
                    if (lastText) { lastText.focus(); document.execCommand('selectAll'); }
                }
            });
        });
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  COLLECT — recoger ediciones del usuario
    // ══════════════════════════════════════════════════════════════════════════
    _collectRoleEdits() {
        if (!this.dom.rolesList) return;
        var self = this;
        this.dom.rolesList.querySelectorAll('[data-role-id]').forEach(function(row) {
            var node = self._network.nodes.find(function(n){ return n.id === row.dataset.roleId; });
            if (!node) return;
            var nameInp  = row.querySelector('[data-field="label"]');
            var delivInp = row.querySelector('[data-field="main_deliverable"]');
            if (nameInp  && nameInp.value.trim())  node.label            = nameInp.value.trim();
            if (delivInp && delivInp.value.trim()) node.main_deliverable = delivInp.value.trim();
        });
    }

    _collectFlowEdits() {
        if (!this.dom.flowsList) return;
        var self = this;
        this.dom.flowsList.querySelectorAll('.flow-item').forEach(function(item) {
            var idx   = parseInt(item.dataset.idx);
            var ex    = self._network.exchanges[idx];
            if (!ex) return;
            var labelInp = item.querySelector('[data-field="label"]');
            if (labelInp && labelInp.value.trim()) {
                ex.label     = labelInp.value.trim();
                ex.entregable = ex.label;
            }
            ex.sequence_order = idx + 1;
        });
    }

    _collectSocEdits() {
        if (!this.dom.socsList) return;
        var self = this;
        this.dom.socsList.querySelectorAll('.soc-exchange').forEach(function(exDiv) {
            var exId = exDiv.dataset.exId;
            var ex   = self._network.exchanges.find(function(e){ return e.id === exId; });
            if (!ex) return;
            var chips = exDiv.querySelectorAll('.soc-chip-text');
            ex.socs = [];
            chips.forEach(function(chip) {
                var text = chip.textContent.trim();
                if (text) ex.socs.push(text);
            });
        });
        // Persistir en KB
        KB.init().then(function() {
            KB.saveNode(Object.assign({ id: 'vna-network-' + self.activeProjectId, type: 'vna-network', projectId: self.activeProjectId }, self._network));
        }).catch(function(){});
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  SHOW/HIDE secciones del panel
    // ══════════════════════════════════════════════════════════════════════════
    _showFlowsSection(show) {
        if (!this.dom.flowsSection) return;
        this.dom.flowsSection.style.display = show ? 'flex' : 'none';
        if (this.dom.rolesSection) this.dom.rolesSection.style.display = show ? 'none' : (this._phase >= 1 ? 'flex' : 'none');
    }

    _showSocsSection(show) {
        if (!this.dom.socsSection) return;
        this.dom.socsSection.style.display = show ? 'flex' : 'none';
        if (this.dom.flowsSection) this.dom.flowsSection.style.display = show ? 'none' : 'none';
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  RENDER MAP
    // ══════════════════════════════════════════════════════════════════════════
    _renderMap() {
        var canvas = this.dom.canvas;
        if (!canvas) return;
        var net = this._network;
        if (!net.nodes || !net.nodes.length) {
            this.dom.placeholder.style.display = 'flex';
            canvas.style.display = 'none';
            return;
        }
        this.dom.placeholder.style.display = 'none';
        canvas.style.display = 'block';

        var svg = this._phase <= 1
            ? VnaMapRenderer.renderPhase1(net, { width: 860 })
            : VnaMapRenderer.render(net, { width: 860, showSequence: true, showLabels: true });

        canvas.innerHTML = svg;
        this._bindMapEvents();
    }

    _bindMapEvents() {
        var self = this;
        var canvas = this.dom.canvas;
        if (!canvas) return;
        canvas.querySelectorAll('[data-node-id]').forEach(function(el) {
            el.style.cursor = 'pointer';
            el.addEventListener('click', function() {
                var node = self._network.nodes && self._network.nodes.find(function(n){ return n.id === el.dataset.nodeId; });
                if (node) self._showDetail('node', node);
            });
        });
        canvas.querySelectorAll('[data-edge-id]').forEach(function(el) {
            el.style.cursor = 'pointer';
            el.addEventListener('click', function() {
                var edge = self._network.exchanges && self._network.exchanges.find(function(e){ return e.id === el.dataset.edgeId; });
                if (edge) self._showDetail('edge', edge);
            });
        });
    }

    _showDetail(type, item) {
        if (!this.dom.detail) return;
        if (type === 'node') {
            this.dom.detailTitle.textContent = item.label || item.id;
            this.dom.detailBody.innerHTML =
                '<div style="color:#666;margin-bottom:6px;">' + (item.description || '—') + '</div>' +
                '<div style="color:#555;font-size:0.68rem;margin-bottom:8px;"><b style="color:#888;">Tipo:</b> ' + (item.role || '—') + ' &nbsp;|&nbsp; <b style="color:#888;">Nivel:</b> ' + (item.levelId || '—') + '</div>' +
                (item.main_deliverable ? '<div style="color:var(--accent-green);font-size:0.72rem;margin-bottom:4px;">📦 <b>Entregable:</b> ' + item.main_deliverable + '</div>' : '') +
                ((item.deliverables && item.deliverables.length > 1) ? '<div style="font-size:0.68rem;color:#555;margin-top:4px;">' + item.deliverables.slice(1).map(function(d){ return '· ' + d; }).join('<br>') + '</div>' : '');
        } else {
            this.dom.detailTitle.textContent = item.label || item.id;
            this.dom.detailBody.innerHTML =
                '<div style="color:#666;margin-bottom:6px;">' + (item.from || '') + ' → ' + (item.to || '') + '</div>' +
                '<div style="color:#555;font-size:0.68rem;margin-bottom:8px;"><b style="color:#888;">Tipo:</b> ' + (item.type || '—') + ' &nbsp;|&nbsp; <b style="color:#888;">Cat:</b> ' + (item.category || '—') + '</div>' +
                (item.entregable ? '<div style="color:#aaa;font-size:0.72rem;margin-bottom:8px;">' + item.entregable + '</div>' : '') +
                (item.socs || []).map(function(s){ return '<div class="detail-soc">✓ ' + s + '</div>'; }).join('');
        }
        this.dom.detail.classList.add('on');
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  UI HELPERS
    // ══════════════════════════════════════════════════════════════════════════
    _updatePhaseUI() {
        var p = this._phase;
        if (this.dom.btnPhase2) this.dom.btnPhase2.disabled = p < 1;
        if (this.dom.btnPhase3) this.dom.btnPhase3.disabled = p < 2;
        if (this.dom.btnGenWos) this.dom.btnGenWos.disabled = p < 2;
    }

    _setDot(n, state) {
        var dot = this.dom['dot' + n];
        if (!dot) return;
        dot.classList.remove('active', 'done');
        if (state) dot.classList.add(state);
    }

    _setBtns(disabled) {
        var self = this;
        ['btnPhase1','btnPhase2','btnPhase3','btnGenWos'].forEach(function(id) {
            var btn = self.dom[id];
            if (btn) btn.disabled = disabled;
        });
    }

    _status(msg, isError) {
        var el = this.dom.status;
        if (!el) return;
        el.innerHTML = msg;
        el.className = 'vmap-status on' + (isError ? ' err' : '');
    }

    _renderHealth(score) {
        var pct   = Math.round((score || 0) * 100);
        var color = pct >= 70 ? 'var(--accent-green)' : pct >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)';
        if (this.dom.healthScore) { this.dom.healthScore.textContent = pct + '%'; this.dom.healthScore.style.color = color; }
        if (this.dom.healthFill)  { this.dom.healthFill.style.width = pct + '%'; this.dom.healthFill.style.background = color; }
        if (this.dom.healthLabel) this.dom.healthLabel.textContent =
            pct >= 70 ? 'Red saludable' : pct >= 40 ? 'Patologías menores' : 'Red crítica';
    }

    _updateTelemetry(t) {
        if (!t || !t.tokens) return;
        this._telem.tokens += t.tokens.total_tokens || 0;
        var base = ((t.tokens.prompt_tokens || 0) / 1e6) * 3.00
                 + ((t.tokens.completion_tokens || 0) / 1e6) * 15.00;
        this._telem.cost   += base * 1.35;
        this._telem.slices  = Number((this._telem.slices + base * 1.35 * 2.0).toFixed(3));
        if (this.dom.telemTokens) this.dom.telemTokens.textContent = this._telem.tokens.toLocaleString();
        if (this.dom.telemCost)   this.dom.telemCost.textContent   = '$' + this._telem.cost.toFixed(3);
        if (this.dom.telemSlices) this.dom.telemSlices.textContent = this._telem.slices.toFixed(3);
    }

    executeViewScript() { return this.afterRender(); }
}
