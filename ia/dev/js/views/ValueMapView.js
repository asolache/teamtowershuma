// =============================================================================
// TEAMTOWERS SOS V10.1 — VALUE MAP VIEW v3
// [#TEAMTOWERS_V10_ANTIGRAVITY_KERNEL]
// Ruta: /ia/dev/js/views/ValueMapView.js
//
// Flujo de 3 fases manuales y secuenciales:
//   Fase 1 → Arquitectura de roles (actividades con entregables)
//   Fase 2 → Flujos de valor (tangibles + intangibles, reciprocidad forzada)
//   Fase 3 → SOCs y criterios de calidad (alimenta Work Orders)
//
// UI limpia: solo lo necesario en cada fase.
// Vista 2D con VnaMapRenderer v2 (bezier, anti-solapamiento, edición inline).
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
        this._phase          = 0;   // 0=inicio 1=roles 2=flujos 3=socs
        this._pendingWos     = [];
        this._telem          = { tokens: 0, cost: 0, slices: 0 };
        this._calibrator     = null;

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
        const hasVna = (project.vna_nodes || []).length > 0;

        return `
        <style>
            /* ── Layout ── */
            .vmap-shell { display:flex; flex:1; min-height:0; overflow:hidden; }
            .vmap-left  { width:300px; min-width:260px; display:flex; flex-direction:column;
                border-right:1px solid var(--glass-border); background:rgba(5,5,8,0.97);
                overflow-y:auto; flex-shrink:0; }
            .vmap-center { flex:1; display:flex; flex-direction:column; overflow:hidden;
                background:radial-gradient(circle at center,#0a0a12,#050508); position:relative; }

            /* ── Panel izquierdo ── */
            .vmap-sec { padding:1rem 1.2rem; border-bottom:1px solid rgba(255,255,255,0.04); }
            .vmap-stitle { font-size:0.67rem; font-weight:900; color:#444; text-transform:uppercase;
                letter-spacing:1.5px; margin-bottom:0.7rem; }
            .vmap-textarea { width:100%; background:rgba(0,0,0,0.4); border:1px solid #222;
                color:white; padding:10px 12px; border-radius:9px; font-family:var(--font-base);
                font-size:0.84rem; outline:none; resize:vertical; min-height:80px;
                box-sizing:border-box; transition:border-color 0.2s; }
            .vmap-textarea:focus { border-color:rgba(99,102,241,0.4); }
            .vmap-textarea::placeholder { color:#2a2a2a; }

            /* ── Botones de fase ── */
            .phase-btn { width:100%; padding:11px 14px; border-radius:9px; font-weight:900;
                font-size:0.83rem; cursor:pointer; transition:0.2s; border:none; margin-top:7px;
                display:flex; align-items:center; justify-content:center; gap:8px; }
            .phase-btn:disabled { opacity:0.25; cursor:not-allowed; transform:none !important; }
            .phase-btn:hover:not(:disabled) { transform:translateY(-1px); }
            .phase-btn-1 { background:linear-gradient(135deg,rgba(99,102,241,0.8),rgba(83,74,183,0.8)); color:white; }
            .phase-btn-2 { background:linear-gradient(135deg,rgba(0,230,118,0.7),rgba(29,158,117,0.7)); color:white; }
            .phase-btn-3 { background:linear-gradient(135deg,rgba(255,145,0,0.7),rgba(186,117,23,0.7)); color:white; }
            .phase-btn-wo { background:linear-gradient(135deg,rgba(224,64,251,0.7),rgba(99,102,241,0.7)); color:white; }
            .phase-btn-reset { background:transparent; border:1px dashed rgba(255,82,82,0.3)!important;
                color:rgba(255,82,82,0.5); font-size:0.72rem; padding:6px; margin-top:4px; }

            /* ── Indicador de fase ── */
            .phase-tracker { display:flex; gap:5px; padding:0.8rem 1.2rem;
                border-bottom:1px solid rgba(255,255,255,0.04); }
            .phase-dot { flex:1; height:3px; border-radius:2px; background:rgba(255,255,255,0.06);
                transition:background 0.4s; }
            .phase-dot.active { background:var(--accent-indigo); }
            .phase-dot.done   { background:var(--accent-green); }

            /* ── Status ── */
            .vmap-status { font-size:0.74rem; font-family:var(--font-mono); color:var(--accent-indigo);
                padding:8px 10px; background:rgba(99,102,241,0.06); border:1px dashed rgba(99,102,241,0.2);
                border-radius:7px; margin-top:8px; line-height:1.5; display:none; }
            .vmap-status.on  { display:block; }
            .vmap-status.err { color:var(--accent-red); background:rgba(255,82,82,0.06);
                border-color:rgba(255,82,82,0.2); }

            /* ── Telemetría ── */
            .telem-row { display:flex; gap:6px; }
            .telem-card { flex:1; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.04);
                border-radius:7px; padding:6px 8px; }
            .telem-val { font-size:0.95rem; font-weight:900; font-family:var(--font-mono); color:white; }
            .telem-lbl { font-size:0.58rem; color:#444; text-transform:uppercase; letter-spacing:1px; margin-top:1px; }

            /* ── Health ── */
            .health-row { display:flex; align-items:center; gap:10px; }
            .health-num { font-size:1.2rem; font-weight:900; font-family:var(--font-mono); min-width:42px; }
            .health-bar { flex:1; height:4px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden; }
            .health-fill { height:100%; border-radius:3px; transition:width 0.8s; }

            /* ── Canvas ── */
            #vnaCanvas { flex:1; overflow:auto; }
            #vnaCanvas svg { min-height:100%; }

            /* ── Placeholder ── */
            #vnaPlaceholder { flex:1; display:flex; flex-direction:column;
                align-items:center; justify-content:center; }

            /* ── Panel de detalle (clic en nodo/flujo) ── */
            #vnaDetail { position:absolute; top:1rem; right:1rem; width:260px;
                background:rgba(10,10,15,0.97); border:1px solid var(--glass-border);
                border-radius:12px; padding:1rem; font-size:0.78rem; color:#aaa;
                display:none; z-index:10; box-shadow:0 8px 30px rgba(0,0,0,0.5); }
            #vnaDetail.on { display:block; }
            .detail-title { font-weight:900; color:white; font-size:0.85rem; margin-bottom:6px; }
            .detail-soc { background:rgba(255,145,0,0.06); border:1px solid rgba(255,145,0,0.2);
                border-radius:6px; padding:5px 8px; margin-top:5px; font-size:0.7rem;
                color:var(--accent-orange); }

            /* ── Lista de roles (Fase 1) ── */
            #rolesList { padding:0.6rem 1.2rem; overflow-y:auto; flex:1; }
            .role-item { display:flex; align-items:flex-start; gap:8px; padding:8px 0;
                border-bottom:1px solid rgba(255,255,255,0.04); }
            .role-edit-name { background:transparent; border:none; border-bottom:1px solid #333;
                color:white; font-size:0.8rem; font-weight:700; outline:none; width:100%;
                padding:2px 0; font-family:var(--font-base); transition:border-color 0.2s; }
            .role-edit-name:focus { border-bottom-color:var(--accent-indigo); }
            .role-edit-deliv { background:transparent; border:none; border-bottom:1px solid #222;
                color:#888; font-size:0.72rem; outline:none; width:100%;
                padding:2px 0; font-family:var(--font-base); transition:border-color 0.2s; }
            .role-edit-deliv:focus { border-bottom-color:var(--accent-green); }

            @media (max-width:768px) {
                .vmap-shell { flex-direction:column; }
                .vmap-left { width:100%; max-height:50vh; }
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

                        <!-- Tracker de fases -->
                        <div class="phase-tracker">
                            <div class="phase-dot" id="dot1" title="Fase 1: Roles"></div>
                            <div class="phase-dot" id="dot2" title="Fase 2: Flujos"></div>
                            <div class="phase-dot" id="dot3" title="Fase 3: SOCs"></div>
                        </div>

                        <!-- Descripción del ecosistema -->
                        <div class="vmap-sec">
                            <div class="vmap-stitle">🧬 Ecosistema</div>
                            <textarea id="vnaInput" class="vmap-textarea" rows="4"
                                placeholder="Describe el sistema, negocio o proceso a mapear. Cuanto más contexto, mejor el mapa…">${project.vna_description || ''}</textarea>

                            <button id="btnPhase1" class="phase-btn phase-btn-1">
                                👥 Fase 1 — Identificar Roles
                            </button>
                            <button id="btnPhase2" class="phase-btn phase-btn-2" disabled>
                                🔀 Fase 2 — Mapear Flujos
                            </button>
                            <button id="btnPhase3" class="phase-btn phase-btn-3" disabled>
                                ✅ Fase 3 — Definir SOCs
                            </button>
                            <button id="btnGenWos" class="phase-btn phase-btn-wo" disabled>
                                📋 Generar Work Orders
                            </button>
                            <button id="btnReset" class="phase-btn phase-btn-reset">
                                ↺ Reiniciar mapa
                            </button>

                            <div id="mapStatus" class="vmap-status"></div>
                        </div>

                        <!-- Lista editable de roles (aparece tras Fase 1) -->
                        <div id="rolesSection" style="display:none;flex-direction:column;flex:1;min-height:0;">
                            <div style="padding:0.7rem 1.2rem 0.4rem;border-bottom:1px solid rgba(255,255,255,0.04);">
                                <div class="vmap-stitle">👥 Roles identificados
                                    <span id="rolesCount" style="color:var(--accent-indigo);font-weight:900;font-size:0.75rem;"></span>
                                </div>
                                <div style="font-size:0.68rem;color:#444;margin-top:-4px;">
                                    Edita nombre y entregable antes de continuar a Fase 2
                                </div>
                            </div>
                            <div id="rolesList"></div>
                        </div>

                        <!-- Telemetría -->
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
                            <div style="color:#1a1a1a;font-size:0.75rem;margin-top:4px;">
                                Describe el ecosistema y pulsa Fase 1
                            </div>
                        </div>
                        <div id="vnaCanvas" style="display:none;flex:1;overflow:auto;"></div>

                        <!-- Panel de detalle al clicar nodo/flujo -->
                        <div id="vnaDetail">
                            <button id="btnCloseDetail"
                                style="position:absolute;top:8px;right:8px;background:transparent;border:none;color:#444;cursor:pointer;font-size:0.9rem;">✕</button>
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

        // ── Refs DOM ──────────────────────────────────────────────────────────
        this.dom = {
            input:        document.getElementById('vnaInput'),
            btnPhase1:    document.getElementById('btnPhase1'),
            btnPhase2:    document.getElementById('btnPhase2'),
            btnPhase3:    document.getElementById('btnPhase3'),
            btnGenWos:    document.getElementById('btnGenWos'),
            btnReset:     document.getElementById('btnReset'),
            status:       document.getElementById('mapStatus'),
            rolesSection: document.getElementById('rolesSection'),
            rolesList:    document.getElementById('rolesList'),
            rolesCount:   document.getElementById('rolesCount'),
            placeholder:  document.getElementById('vnaPlaceholder'),
            canvas:       document.getElementById('vnaCanvas'),
            detail:       document.getElementById('vnaDetail'),
            detailTitle:  document.getElementById('detailTitle'),
            detailBody:   document.getElementById('detailBody'),
            dot1:         document.getElementById('dot1'),
            dot2:         document.getElementById('dot2'),
            dot3:         document.getElementById('dot3'),
            telemTokens:  document.getElementById('telemTokens'),
            telemCost:    document.getElementById('telemCost'),
            telemSlices:  document.getElementById('telemSlices'),
            healthScore:  document.getElementById('healthScore'),
            healthFill:   document.getElementById('healthFill'),
            healthLabel:  document.getElementById('healthLabel'),
        };

        // ── Si ya hay VNA guardado, restaurar estado ──────────────────────────
        const savedNetwork = await (async () => {
            try { await KB.init(); return await KB.getNode(`vna-network-${this.activeProjectId}`); }
            catch(_) { return null; }
        })();

        if (savedNetwork?.nodes?.length) {
            this._network = savedNetwork;
            this._phase   = savedNetwork.exchanges?.length ? 2 : 1;
            this._renderMap();
            this._updatePhaseUI();
            if (savedNetwork.meta?.health_score != null) {
                this._renderHealth(savedNetwork.meta.health_score);
            }
        }

        // ── FASE 1 ────────────────────────────────────────────────────────────
        this.dom.btnPhase1.addEventListener('click', async () => {
            const desc = this.dom.input.value.trim();
            if (!desc) { this._status('⚠️ Describe el ecosistema primero.', true); return; }
            await this._runPhase1(desc);
        });

        // ── FASE 2 ────────────────────────────────────────────────────────────
        this.dom.btnPhase2.addEventListener('click', async () => {
            if (!this._network.nodes?.length) {
                this._status('⚠️ Ejecuta primero la Fase 1.', true); return;
            }
            // Recoger ediciones del usuario en la lista de roles
            this._collectRoleEdits();
            await this._runPhase2();
        });

        // ── FASE 3 ────────────────────────────────────────────────────────────
        this.dom.btnPhase3.addEventListener('click', async () => {
            if (!this._network.exchanges?.length) {
                this._status('⚠️ Ejecuta primero la Fase 2.', true); return;
            }
            await this._runPhase3();
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
            try { await KB.init(); await KB.deleteNode(`vna-network-${this.activeProjectId}`);
                  await KB.deleteNode(`vna-roles-draft-${this.activeProjectId}`); } catch(_) {}
            this._renderMap();
            this._updatePhaseUI();
            this._renderHealth(0);
            this._status('↺ Mapa reiniciado. Listo para nueva sesión.');
        });

        // ── Cerrar panel detalle ──────────────────────────────────────────────
        document.getElementById('btnCloseDetail')?.addEventListener('click', () => {
            this.dom.detail.classList.remove('on');
        });
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  FASE 1 — Identificar roles
    // ══════════════════════════════════════════════════════════════════════════
    async _runPhase1(description) {
        this._setBtns(true);
        this._status('👥 Identificando roles como actividades con entregables…');
        this._setDot(1, 'active');

        try {
            await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: {
                projectId: this.activeProjectId, updates: { vna_description: description }
            }});

            const artifact = await Orchestrator.designVnaRoles({
                projectId: this.activeProjectId, description
            });

            const payload = artifact.payload;
            if (!payload?.nodes?.length) throw new Error('No se identificaron roles. Amplía la descripción.');

            this._network.nodes   = payload.nodes;
            this._network.mission = payload.meta?.mission || description;
            this._network.meta    = payload.meta || {};
            this._phase = 1;

            this._updateTelemetry(artifact.telemetry);
            this._renderRolesList(payload.nodes);
            this._renderMap();
            this._updatePhaseUI();
            this._setDot(1, 'done');

            this._status(`✅ ${payload.nodes.length} roles identificados. Revisa y edita los nombres y entregables. Cuando estés listo, pulsa Fase 2.`);

        } catch(err) {
            this._status(`❌ ${err.message}`, true);
            this._setDot(1, '');
        } finally {
            this._setBtns(false);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  FASE 2 — Mapear flujos
    // ══════════════════════════════════════════════════════════════════════════
    async _runPhase2() {
        this._setBtns(true);
        this._status('🔀 Mapeando flujos tangibles e intangibles con reciprocidad forzada…');
        this._setDot(2, 'active');

        try {
            const artifact = await Orchestrator.designVnaFlows({
                projectId: this.activeProjectId,
                nodes:     this._network.nodes,
                mission:   this._network.mission
            });

            const payload = artifact.payload;
            if (!payload?.exchanges?.length) throw new Error('No se generaron flujos. Revisa los roles.');

            this._network.exchanges = payload.exchanges;
            if (payload.meta) this._network.meta = { ...this._network.meta, ...payload.meta };
            this._phase = 2;

            this._updateTelemetry(artifact.telemetry);
            if (payload.meta?.health_score != null) this._renderHealth(payload.meta.health_score);

            // Secuenciar y renderizar
            try { this._network = VnaSequencer.sequence(this._network); } catch(_) {}
            this._renderMap();
            this._updatePhaseUI();
            this._setDot(2, 'done');

            const t = payload.exchanges.filter(e => e.type === 'tangible').length;
            const i = payload.exchanges.filter(e => e.type === 'intangible').length;
            this._status(`✅ ${payload.exchanges.length} flujos mapeados (${t} tangibles · ${i} intangibles). Revisa el mapa. Pulsa Fase 3 para definir SOCs o genera Work Orders directamente.`);

        } catch(err) {
            this._status(`❌ ${err.message}`, true);
            this._setDot(2, '');
        } finally {
            this._setBtns(false);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  FASE 3 — Definir SOCs
    // ══════════════════════════════════════════════════════════════════════════
    async _runPhase3() {
        this._setBtns(true);
        this._status('✅ Definiendo criterios de calidad (SOCs) por intercambio…');
        this._setDot(3, 'active');

        try {
            const artifact = await Orchestrator.designVnaSocs({
                projectId: this.activeProjectId,
                exchanges: this._network.exchanges,
                nodes:     this._network.nodes
            });

            const payload = artifact.payload;
            this._phase = 3;

            // Mergear SOCs en los exchanges locales
            const socsMap = {};
            (payload?.enriched_exchanges || []).forEach(e => { socsMap[e.id] = e.socs; });
            this._network.exchanges = this._network.exchanges.map(ex => ({
                ...ex, socs: socsMap[ex.id] || ex.socs || []
            }));
            if (payload?.health_score != null) {
                this._network.meta.health_score = payload.health_score;
                this._renderHealth(payload.health_score);
            }

            this._updateTelemetry(artifact.telemetry);
            this._renderMap();
            this._updatePhaseUI();
            this._setDot(3, 'done');

            this._status(`✅ SOCs definidos · ${payload?.summary?.total_socs || 0} criterios en total. El mapa está completo. Genera Work Orders cuando estés listo.`);

        } catch(err) {
            this._status(`❌ ${err.message}`, true);
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
            const proj   = store.getState().projects.find(p => p.id === this.activeProjectId);
            const aLevel = proj?.settings?.automation_level || 'review_first';
            const { workOrders } = WoGenerator.fromVnaNetwork(this._network, { automation_level: aLevel });
            this._pendingWos = workOrders;

            // Persistir en store
            for (const wo of workOrders) {
                await store.dispatch({ type: 'SPAWN_WORK_ORDER', payload: {
                    projectId: this.activeProjectId, workOrder: wo
                }});
            }

            this._status(`✅ ${workOrders.length} Work Orders generadas y añadidas al Kanban. <a href="/project" data-link style="color:var(--accent-indigo);">Ver Kanban →</a>`);
            document.querySelectorAll('#mapStatus [data-link]').forEach(l => {
                l.addEventListener('click', e => { e.preventDefault(); window.navigateTo?.(l.getAttribute('href')); });
            });
        } catch(err) {
            this._status(`❌ ${err.message}`, true);
        } finally {
            this._setBtns(false);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  RENDER — SVG del mapa con VnaMapRenderer v2
    // ══════════════════════════════════════════════════════════════════════════
    _renderMap() {
        const canvas = this.dom.canvas;
        if (!canvas) return;

        const net = this._network;
        if (!net.nodes?.length) {
            this.dom.placeholder.style.display = 'flex';
            canvas.style.display = 'none';
            return;
        }

        this.dom.placeholder.style.display = 'none';
        canvas.style.display = 'block';

        // Fase 1: solo nodos. Fase 2+: mapa completo con flujos
        const svg = this._phase <= 1
            ? VnaMapRenderer.renderPhase1(net, { width: 860, showSequence: false })
            : VnaMapRenderer.render(net, { width: 860, showSequence: true, showLabels: true });

        canvas.innerHTML = svg;
        this._bindMapEvents();
    }

    // ── Eventos del mapa (clic en nodo → panel detalle) ───────────────────────
    _bindMapEvents() {
        const canvas = this.dom.canvas;
        if (!canvas) return;

        // Clic en nodo
        canvas.querySelectorAll('[data-node-id]').forEach(el => {
            el.style.cursor = 'pointer';
            el.addEventListener('click', () => {
                const node = this._network.nodes?.find(n => n.id === el.dataset.nodeId);
                if (node) this._showDetail('node', node);
            });
        });

        // Clic en arista
        canvas.querySelectorAll('[data-edge-id]').forEach(el => {
            el.style.cursor = 'pointer';
            el.addEventListener('click', () => {
                const edge = this._network.exchanges?.find(e => e.id === el.dataset.edgeId);
                if (edge) this._showDetail('edge', edge);
            });
        });
    }

    // ── Panel de detalle ──────────────────────────────────────────────────────
    _showDetail(type, item) {
        if (!this.dom.detail) return;

        if (type === 'node') {
            this.dom.detailTitle.textContent = item.label || item.id;
            this.dom.detailBody.innerHTML = `
                <div style="color:#666;margin-bottom:6px;">${item.description || '—'}</div>
                <div style="color:#555;font-size:0.68rem;margin-bottom:8px;">
                    <b style="color:#888;">Tipo:</b> ${item.role || '—'} &nbsp;|&nbsp;
                    <b style="color:#888;">Nivel:</b> ${item.levelId || '—'}
                </div>
                ${item.main_deliverable ? `<div style="color:var(--accent-green);font-size:0.72rem;margin-bottom:4px;">📦 <b>Entregable:</b> ${item.main_deliverable}</div>` : ''}
                ${(item.deliverables || []).length > 1 ? `<div style="font-size:0.68rem;color:#555;margin-top:4px;">${item.deliverables.slice(1).map(d => `· ${d}`).join('<br>')}</div>` : ''}`;
        } else {
            this.dom.detailTitle.textContent = item.label || item.id;
            this.dom.detailBody.innerHTML = `
                <div style="color:#666;margin-bottom:6px;">${item.from} → ${item.to}</div>
                <div style="color:#555;font-size:0.68rem;margin-bottom:8px;">
                    <b style="color:#888;">Tipo:</b> ${item.type || '—'} &nbsp;|&nbsp;
                    <b style="color:#888;">Cat:</b> ${item.category || '—'}
                </div>
                ${item.entregable ? `<div style="color:#aaa;font-size:0.72rem;margin-bottom:8px;">${item.entregable}</div>` : ''}
                ${(item.socs || []).map(s => `<div class="detail-soc">✓ ${s}</div>`).join('')}`;
        }

        this.dom.detail.classList.add('on');
    }

    // ── Lista editable de roles (Fase 1) ──────────────────────────────────────
    _renderRolesList(nodes) {
        if (!this.dom.rolesList) return;
        const ROLE_COLORS_MAP = {
            human:'#5ecfaa', agent:'#a8a3ee', process:'#f0a07a',
            organization:'#85B7EB', resource:'#a3d977'
        };
        this.dom.rolesList.innerHTML = nodes.map(n => `
            <div class="role-item" data-role-id="${n.id}">
                <div style="font-size:1rem;margin-top:2px;">${VnaMapRenderer._roleIcon(n.role)}</div>
                <div style="flex:1;min-width:0;">
                    <input class="role-edit-name" data-field="label" value="${n.label || ''}"
                        style="color:${ROLE_COLORS_MAP[n.role]||'#ccc'};" placeholder="Nombre del rol (actividad)">
                    <input class="role-edit-deliv" data-field="main_deliverable" value="${n.main_deliverable || ''}"
                        placeholder="Entregable principal">
                </div>
            </div>`).join('');

        if (this.dom.rolesCount) this.dom.rolesCount.textContent = `${nodes.length}`;
        this.dom.rolesSection.style.display = 'flex';
    }

    // ── Recoger ediciones del usuario en la lista de roles ────────────────────
    _collectRoleEdits() {
        if (!this.dom.rolesList) return;
        this.dom.rolesList.querySelectorAll('[data-role-id]').forEach(row => {
            const roleId = row.dataset.roleId;
            const node   = this._network.nodes?.find(n => n.id === roleId);
            if (!node) return;
            const nameInput  = row.querySelector('[data-field="label"]');
            const delivInput = row.querySelector('[data-field="main_deliverable"]');
            if (nameInput?.value.trim())  node.label            = nameInput.value.trim();
            if (delivInput?.value.trim()) node.main_deliverable = delivInput.value.trim();
        });
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  UI helpers
    // ══════════════════════════════════════════════════════════════════════════
    _updatePhaseUI() {
        const p = this._phase;
        if (this.dom.btnPhase2) this.dom.btnPhase2.disabled = p < 1;
        if (this.dom.btnPhase3) this.dom.btnPhase3.disabled = p < 2;
        if (this.dom.btnGenWos) this.dom.btnGenWos.disabled = p < 2;
    }

    _setDot(n, state) {
        const dot = this.dom[`dot${n}`];
        if (!dot) return;
        dot.classList.remove('active', 'done');
        if (state) dot.classList.add(state);
    }

    _setBtns(disabled) {
        ['btnPhase1','btnPhase2','btnPhase3','btnGenWos'].forEach(id => {
            const btn = this.dom[id];
            if (btn) btn.disabled = disabled;
        });
    }

    _status(msg, isError = false) {
        const el = this.dom.status;
        if (!el) return;
        el.innerHTML = msg;
        el.className = 'vmap-status on' + (isError ? ' err' : '');
    }

    _renderHealth(score) {
        const pct   = Math.round((score || 0) * 100);
        const color = pct >= 70 ? 'var(--accent-green)' : pct >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)';
        if (this.dom.healthScore) { this.dom.healthScore.textContent = `${pct}%`; this.dom.healthScore.style.color = color; }
        if (this.dom.healthFill)  { this.dom.healthFill.style.width = `${pct}%`; this.dom.healthFill.style.background = color; }
        if (this.dom.healthLabel) this.dom.healthLabel.textContent =
            pct >= 70 ? 'Red saludable' : pct >= 40 ? 'Patologías menores detectadas' : 'Red crítica — revisar flujos';
    }

    _updateTelemetry(t) {
        if (!t?.tokens) return;
        this._telem.tokens += t.tokens.total_tokens || 0;
        const base = ((t.tokens.prompt_tokens || 0) / 1e6) * 3.00
                   + ((t.tokens.completion_tokens || 0) / 1e6) * 15.00;
        this._telem.cost   += base * 1.35;
        this._telem.slices  = Number((this._telem.slices + base * 1.35 * 2.0).toFixed(3));
        if (this.dom.telemTokens) this.dom.telemTokens.textContent = this._telem.tokens.toLocaleString();
        if (this.dom.telemCost)   this.dom.telemCost.textContent   = `$${this._telem.cost.toFixed(3)}`;
        if (this.dom.telemSlices) this.dom.telemSlices.textContent = this._telem.slices.toFixed(3);
    }

    executeViewScript() { return this.afterRender(); }
}
