// =============================================================================
// TEAMTOWERS SOS V10 — DASHBOARD VIEW
// Ruta: ia/dev/js/views/DashboardView.js
// Ojo del Castell · Centro de Mando Antigravity
// =============================================================================

import { store }          from '../core/store.js';
import { KB }             from '../core/kb.js';
import { Sidebar }        from '../components/Sidebar.js';
import { BottomNav }      from '../components/BottomNav.js';
import { PageHeader }     from '../components/PageHeader.js';
import { MapRenderer }    from '../components/MapRenderer.js';
import { LedgerRenderer } from '../components/LedgerRenderer.js';
import { Orchestrator }   from '../core/Orchestrator.js';

export default class DashboardView {

    constructor() {
        document.title       = 'Ojo del Castell | TeamTowers V10';
        this.activeProjectId  = null;
        this.currentTab       = 'overview';
    }

    async getHtml() {
        await store.init();

        const state        = store.getState();
        const activeUserId = state.session.activeUserId;
        const globalRole   = state.session.role;

        let project = state.projects.find(p => p.id === localStorage.getItem('tt_active_project'));
        if (!project && state.projects.length > 0) {
            project = state.projects.find(p => !p.isArchived) || state.projects[0];
        }

        // ── Sin proyecto ──────────────────────────────────────────
        if (!project) {
            return `
            <div class="app-layout">
                ${Sidebar.getHtml('/dashboard')}
                <main class="workspace" style="justify-content:center; align-items:center; display:flex; background:radial-gradient(circle at center, #1a1a2e 0%, #0f0f1a 100%);">
                    <div class="glass-panel" style="text-align:center; padding:5rem; max-width:600px;">
                        <div style="font-size:6rem; margin-bottom:2rem; line-height:1; filter:drop-shadow(0 0 30px rgba(99,102,241,0.6));">🌌</div>
                        <h2 style="color:white; margin-top:0; font-weight:900; font-size:2.5rem; letter-spacing:-1px;">Radar Despejado</h2>
                        <p style="color:#aaa; margin-bottom:3rem; font-size:1.1rem; line-height:1.6;">El Kernel V10 está listo. Eres el Master Architect.</p>
                        <a href="/create" data-link class="btn-primary" style="text-decoration:none; font-size:1.1rem; padding:14px 28px;">⚡ Forjar Primer Ecosistema</a>
                    </div>
                </main>
            </div>`;
        }

        // ── Acceso ────────────────────────────────────────────────
        const hasAccess = store.canUserViewProject?.(project.id, activeUserId, globalRole) ?? true;
        if (!hasAccess) {
            return `
            <div class="app-layout">
                ${Sidebar.getHtml('/dashboard')}
                <main class="workspace" style="justify-content:center; align-items:center; display:flex;">
                    <div class="glass-panel" style="text-align:center; border:1px dashed var(--accent-red); padding:4rem; max-width:500px;">
                        <div style="font-size:5rem; margin-bottom:1.5rem;">🔒</div>
                        <h1 style="color:var(--accent-red); margin-top:0; font-weight:900;">ACCESO DENEGADO</h1>
                        <p style="color:#ccc;">No eres un nodo reconocido en la topología de este ecosistema.</p>
                    </div>
                </main>
            </div>`;
        }

        this.activeProjectId = project.id;

        // ── Métricas ──────────────────────────────────────────────
        const harvest       = store.calculateHarvest?.(project.id) || [];
        const totalSlices   = harvest.reduce((s, h) => s + h.totalSlices, 0);
        const totalHours    = (project.ledger || []).reduce((s, l) => s + (l.horas || 0), 0);
        const resilience    = store.calculateResilience?.(project.id) ?? (project.vna_flows?.length > 3 ? 95 : 60);

        const rolesActivos  = (project.roles || []).filter(r => !r.isArchived);
        const sillasVacias  = rolesActivos.filter(r => !(project.asignaciones || []).find(a => a.roleId === r.id));
        const tareasPend    = (project.work_orders || []).filter(w => w.status !== 'consolidated' && w.status !== 'rejected').length;

        // ── Insight banner ────────────────────────────────────────
        let insightMsg   = '';
        let insightColor = 'var(--accent-indigo)';
        if (project.isArchived) {
            insightMsg   = '🗄️ MODO CRIPTA: Ecosistema archivado. Solo lectura para preservar el Proof of Work.';
            insightColor = '#888';
        } else if (sillasVacias.length > 0) {
            insightMsg   = `Tienes ${sillasVacias.length} roles estructurales vacíos. Ve al Mercado Interno para asignar Humanos o IAs.`;
            insightColor = 'var(--accent-orange)';
        } else if (!project.vna_flows?.length) {
            insightMsg   = 'La topología VNA está vacía. Entra en el mapa y forja los flujos de valor entre los roles.';
            insightColor = 'var(--accent-red)';
        } else if (tareasPend > 0) {
            insightMsg   = `Hay ${tareasPend} Work Orders activas en la red. El ecosistema está en movimiento.`;
            insightColor = 'var(--accent-green)';
        } else {
            insightMsg   = 'Red operativa. Ve al Omni-Paper para inyectar nuevas tareas en el Kanban.';
            insightColor = 'var(--accent-purple)';
        }

        // ── Economía IA ───────────────────────────────────────────
        let aiGrossValue = 0;
        let realApiCost  = 0;
        let totalTokens  = 0;
        (project.ledger || []).forEach(tx => {
            const u = state.globalUsers.find(u => u.id === tx.userId);
            const v = (tx.fmv || 50) * (tx.multiplier || 1) * (tx.horas || 1);
            if (u?.profile?.isAi) aiGrossValue += v;
        });
        (project.telemetry || []).forEach(log => {
            realApiCost += log.costInDollars || 0;
            totalTokens += log.tokens?.total_tokens || 0;
        });
        const recRatio      = realApiCost > 0 ? (aiGrossValue / realApiCost).toFixed(0) : '∞';
        const savingsPct    = aiGrossValue > 0 ? ((aiGrossValue - realApiCost) / aiGrossValue * 100).toFixed(1) : '0';

        // ── Swarm IA ──────────────────────────────────────────────
        const aisInProject  = (project.usuarios || [])
            .map(u => state.globalUsers.find(g => g.id === u.id))
            .filter(u => u?.profile?.isAi);
        const aiEngineIcons = { anthropic: '🦉', openai: '🧠', deepseek: '🐋', gemini: '✨' };
        const aiAvatarsHtml = aisInProject.length > 0
            ? aisInProject.map(ai => `<div style="width:32px;height:32px;border-radius:50%;background:rgba(224,64,251,0.2);border:1px solid rgba(224,64,251,0.4);display:flex;align-items:center;justify-content:center;font-size:1rem;" title="${ai.name} (${ai.profile?.preferredEngine||'anthropic'})">${aiEngineIcons[ai.profile?.preferredEngine||'anthropic']||'🤖'}</div>`).join('')
            : '<div style="color:#555; font-size:0.8rem; font-style:italic;">Red puramente humana.</div>';

        // ── Vacantes ──────────────────────────────────────────────
        const roleIcons   = { '@anxaneta':'👑','@aixecador':'🧭','@dosos':'👁️','@baixos':'⚙️','@pinya':'🤝' };
        const vacantesHtml = sillasVacias.length === 0
            ? `<div style="color:var(--accent-green); padding:1.5rem; text-align:center; border:1px dashed rgba(0,230,118,0.3); border-radius:12px;">✅ Arquitectura completa. Sin vacantes estructurales.</div>`
            : sillasVacias.map(r => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:1rem 1.25rem; border-radius:12px; border:1px solid rgba(255,255,255,0.05); margin-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="font-size:1.5rem;">${roleIcons[r.levelId]||'💠'}</div>
                        <div>
                            <div style="font-weight:bold; color:white;">${r.name}</div>
                            <div style="font-size:0.75rem; color:#888; font-family:var(--font-mono);">${r.levelId} · FMV: <span style="color:var(--accent-green);">${r.fmv}€/h</span></div>
                        </div>
                    </div>
                    <button class="btn-invite" data-rolename="${r.name}" style="background:rgba(99,102,241,0.1); border:1px solid var(--accent-indigo); color:var(--accent-indigo); padding:7px 14px; border-radius:8px; cursor:pointer; font-size:0.8rem; font-weight:900; transition:0.2s;">➕ Invitar</button>
                </div>`).join('');

        // ── Pitch & tags ──────────────────────────────────────────
        const pitchText = project.presentation || project.prompt || 'El propósito fundacional de esta red está en fase de definición…';
        const tagsHtml  = (project.tags?.length > 0 ? project.tags : ['VNA'])
            .map(t => `<span style="font-family:var(--font-mono); font-size:0.7rem; color:var(--accent-purple); border:1px solid rgba(224,64,251,0.3); padding:3px 8px; border-radius:6px; background:rgba(224,64,251,0.1);">#${t}</span>`)
            .join('');

        const headerConfig = {
            title:    project.isArchived ? `[ARCHIVADO] ${project.nombre}` : project.nombre,
            subtitle: project.archetype,
            tagline:  'Ojo del Castell · Centro de Mando Antigravity V10',
            tabs: [
                { id: 'overview', label: '📊 Resumen Operativo', active: this.currentTab === 'overview' },
                { id: 'market',   label: `🎯 Mercado Interno${sillasVacias.length ? ` (${sillasVacias.length})` : ''}`, active: this.currentTab === 'market' },
                { id: 'settings', label: '⚙️ Configuración',     active: this.currentTab === 'settings' }
            ],
            magicActions: project.isArchived ? [] : [
                { id: 'audit',  label: 'Auditoría VNA & Equity', icon: '🧠', tokens: 150 },
                { id: 'legal',  label: 'Emitir Pacto de Socios', icon: '⚖️', tokens: 300 },
                { id: 'evolve', label: 'Meta-Cognición Proyecto', icon: '🔮', tokens: 200 }
            ]
        };

        return `
        <style>
            ${MapRenderer.getStyles()}
            ${LedgerRenderer.getStyles()}

            .workspace-dash { flex:1; padding:2rem 3rem; overflow-y:auto; overflow-x:hidden; scroll-behavior:smooth; box-sizing:border-box; background:radial-gradient(circle at top right, rgba(99,102,241,0.03) 0%, transparent 40%); }
            .tab-content        { display:none; animation:fadeIn 0.4s ease-out; padding-bottom:5rem; width:100%; box-sizing:border-box; }
            .tab-content.active { display:block; }

            .insight-banner { display:flex; align-items:center; gap:12px; padding:14px 20px; border-radius:12px; border-left:4px solid var(--insight-color, var(--accent-indigo)); background:rgba(0,0,0,0.4); font-size:0.9rem; color:#ccc; margin-bottom:2rem; }

            .kpi-stripe { display:grid; grid-template-columns:repeat(auto-fit, minmax(180px,1fr)); gap:1.25rem; margin-bottom:2rem; }
            .kpi-card   { background:linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.4)); border:1px solid rgba(255,255,255,0.05); padding:1.4rem; border-radius:14px; display:flex; flex-direction:column; border-left:4px solid var(--kpi-color, #333); transition:0.3s; }
            .kpi-card:hover { transform:translateY(-2px); background:rgba(255,255,255,0.04); }
            .kpi-val { font-size:2.2rem; font-weight:900; color:white; font-family:var(--font-mono); line-height:1; margin-bottom:6px; }
            .kpi-lbl { font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; font-weight:bold; }

            .dash-grid   { display:grid; grid-template-columns:1fr 1fr; gap:2rem; margin-bottom:2rem; }
            .dash-panel  { background:linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border:1px solid var(--glass-border); border-radius:22px; padding:2rem; box-shadow:0 15px 35px rgba(0,0,0,0.5); display:flex; flex-direction:column; position:relative; overflow:hidden; box-sizing:border-box; }
            .dash-panel::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; background:var(--panel-color, var(--glass-border)); }
            .panel-title { color:white; font-size:1rem; font-weight:900; margin:0 0 1.5rem 0; display:flex; justify-content:space-between; align-items:center; gap:8px; }

            .economy-panel { display:flex; flex-direction:column; gap:1rem; }
            .eco-row { display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed rgba(255,255,255,0.08); padding-bottom:10px; }
            .eco-row:last-child { border-bottom:none; padding-bottom:0; }
            .eco-lbl { color:#888; font-size:0.82rem; font-weight:bold; text-transform:uppercase; }
            .eco-val { color:white; font-size:1.1rem; font-weight:900; font-family:var(--font-mono); }
            .eco-val.positive { color:var(--accent-green); }

            .presentation-text { color:#ccc; font-size:0.92rem; line-height:1.7; flex:1; margin-bottom:1.5rem; }
            .btn-cta { display:block; background:linear-gradient(135deg, var(--accent-indigo), var(--accent-purple)); color:white; text-decoration:none; text-align:center; padding:12px 20px; border-radius:12px; font-weight:900; font-size:0.9rem; transition:0.3s; border:none; cursor:pointer; margin-top:0.5rem; }
            .btn-cta:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(99,102,241,0.4); }

            .map-overlay-link { font-size:0.78rem; color:var(--accent-indigo); text-decoration:none; font-weight:bold; padding:6px 12px; border:1px solid rgba(99,102,241,0.4); border-radius:8px; transition:0.2s; }
            .map-overlay-link:hover { background:var(--accent-indigo); color:white; }

            /* Modal IA */
            .modal-ia { position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.9); z-index:4000; display:none; align-items:center; justify-content:center; backdrop-filter:blur(10px); }
            .modal-ia-content { background:var(--bg-dark); width:90%; max-width:800px; max-height:85vh; border-radius:20px; border:1px solid var(--glass-border); display:flex; flex-direction:column; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.8); border-top:4px solid var(--accent-purple); }

            @media (max-width:1024px) { .dash-grid { grid-template-columns:1fr; } }
            @media (max-width:768px)  { .workspace-dash { padding:80px 1rem 120px 1rem; } .dash-panel { padding:1.25rem; } }
            @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        </style>

        <div class="app-layout">
            ${Sidebar.getHtml('/dashboard')}
            <main class="workspace-dash">
                ${PageHeader.getHtml(headerConfig)}

                <!-- TAB: OVERVIEW ─────────────────────────────── -->
                <div id="tab-overview" class="tab-content ${this.currentTab === 'overview' ? 'active' : ''}">

                    <div class="insight-banner" style="--insight-color:${insightColor};">
                        <span>💡</span> ${insightMsg}
                    </div>

                    <section class="kpi-stripe">
                        <div class="kpi-card" style="--kpi-color:var(--accent-green);">
                            <span class="kpi-val">${Math.round(totalSlices).toLocaleString()}</span>
                            <span class="kpi-lbl">Slices Minados</span>
                        </div>
                        <div class="kpi-card" style="--kpi-color:var(--accent-indigo);">
                            <span class="kpi-val">${totalHours.toFixed(1)}h</span>
                            <span class="kpi-lbl">Esfuerzo Auditado</span>
                        </div>
                        <div class="kpi-card" style="--kpi-color:${resilience > 50 ? 'var(--accent-purple)' : 'var(--accent-red)'};">
                            <span class="kpi-val">${resilience}%</span>
                            <span class="kpi-lbl">Salud Estructural</span>
                        </div>
                        <div class="kpi-card" style="--kpi-color:#888;">
                            <span class="kpi-val">${(project.usuarios||[]).length}</span>
                            <span class="kpi-lbl">Nodos en Colla</span>
                        </div>
                    </section>

                    <div class="dash-grid">
                        <div style="display:flex; flex-direction:column; gap:2rem;">
                            <!-- Misión -->
                            <div class="dash-panel" style="--panel-color:var(--accent-purple);">
                                <div class="panel-title">
                                    <span>📖 Misión Ecosistema</span>
                                    <div style="display:flex; gap:5px; flex-wrap:wrap;">${tagsHtml}</div>
                                </div>
                                <div class="presentation-text">${pitchText.replace(/\n/g,'<br>')}</div>
                                <a href="/paper" data-link class="btn-cta ${project.isArchived ? 'disabled' : ''}">📝 Desarrollar en Omni-Paper</a>
                                ${!project.isArchived ? `<button id="btnEvolveVision" class="btn-cta" style="background:rgba(99,102,241,0.1); border:1px solid var(--accent-indigo); color:var(--accent-indigo); margin-top:8px;">🔮 Meta-Cognición (IA)</button>` : ''}
                            </div>

                            <!-- Economía IA -->
                            <div class="dash-panel" style="--panel-color:var(--accent-green);">
                                <div class="panel-title">
                                    <span>🤖 Economía del Swarm</span>
                                    <div style="display:flex; gap:6px; align-items:center;">${aiAvatarsHtml}</div>
                                </div>
                                <div class="economy-panel">
                                    <div class="eco-row">
                                        <span class="eco-lbl">Valor Generado por IA</span>
                                        <span class="eco-val positive">${aiGrossValue.toFixed(2)}€</span>
                                    </div>
                                    <div class="eco-row">
                                        <span class="eco-lbl">Coste Real API</span>
                                        <span class="eco-val">$${realApiCost.toFixed(4)}</span>
                                    </div>
                                    <div class="eco-row">
                                        <span class="eco-lbl">REC (Retorno/Coste)</span>
                                        <span class="eco-val positive">${recRatio}x</span>
                                    </div>
                                    <div class="eco-row">
                                        <span class="eco-lbl">Ahorro vs Humano</span>
                                        <span class="eco-val positive">${savingsPct}%</span>
                                    </div>
                                    <div class="eco-row" style="border-bottom:none;">
                                        <span class="eco-lbl">Tokens Consumidos</span>
                                        <span class="eco-val">${totalTokens.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style="display:flex; flex-direction:column; gap:2rem;">
                            <!-- Mapa VNA mini -->
                            <div class="dash-panel" style="--panel-color:var(--accent-indigo); min-height:280px;">
                                <div class="panel-title">
                                    <span>🕸️ Topología VNA</span>
                                    <a href="/map" data-link class="map-overlay-link">Editar Arquitectura →</a>
                                </div>
                                <div style="position:relative; flex:1; min-height:200px; overflow:hidden; border-radius:12px;">
                                    <div class="map-canvas" id="dashMapCanvas" style="width:100%; height:100%;">
                                        <svg id="dashMapPaths" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; overflow:visible;">
                                            <defs>
                                                <marker id="arrow-t-dash" markerWidth="10" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 10 3, 0 6" fill="var(--accent-green)"/></marker>
                                                <marker id="arrow-i-dash" markerWidth="10" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 10 3, 0 6" fill="var(--accent-purple)"/></marker>
                                            </defs>
                                            <g id="paths-group-dash"></g>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <!-- Ledger mini -->
                            <div class="dash-panel" style="--panel-color:#555; padding:0;">
                                <div class="panel-title" style="padding:1.5rem 2rem 0 2rem; border:none; margin-bottom:0;">
                                    <span>⚖️ Distribución de Equidad</span>
                                </div>
                                <div id="dashLedgerContainer" style="padding:1rem 2rem;"></div>
                                <div style="background:rgba(255,255,255,0.02); padding:12px 2rem; text-align:right; border-top:1px solid rgba(255,255,255,0.05);">
                                    <a href="/ledger" data-link style="color:#aaa; font-size:0.82rem; text-decoration:none; font-weight:bold; transition:0.2s;">Ir a la Notaría →</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TAB: MERCADO INTERNO ──────────────────────── -->
                <div id="tab-market" class="tab-content ${this.currentTab === 'market' ? 'active' : ''}">
                    <div class="dash-panel" style="--panel-color:var(--accent-orange); max-width:800px; margin:0 auto;">
                        <h2 style="color:white; margin-top:0; font-size:1.4rem; font-weight:900;">🎯 Mercado Interno (Vacantes)</h2>
                        <p style="color:#888; font-size:0.9rem; margin-bottom:1.5rem; line-height:1.5;">Roles estructurales sin talento asignado.</p>
                        ${vacantesHtml}
                    </div>
                </div>

                <!-- TAB: CONFIGURACIÓN ───────────────────────── -->
                <div id="tab-settings" class="tab-content ${this.currentTab === 'settings' ? 'active' : ''}">
                    <div class="dash-panel" style="--panel-color:#555; max-width:600px; margin:0 auto; text-align:center;">
                        <div style="font-size:4rem; margin-bottom:1rem;">⚙️</div>
                        <h2 style="color:white; margin-top:0;">Configuración de Red</h2>
                        <p style="color:#888; margin-bottom:2rem;">Gobernanza, APIs multimodales y Padrón gestionados en la Consola Global.</p>
                        <a href="/settings" data-link class="btn-cta">Ir al Panteón Global →</a>
                    </div>
                </div>
            </main>

            <!-- Modal IA ────────────────────────────────────── -->
            <div id="aiModal" class="modal-ia">
                <div class="modal-ia-content">
                    <div style="padding:18px 28px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
                        <h2 id="aiModalTitle" style="margin:0; font-size:1.1rem; color:var(--accent-purple); font-weight:900; text-transform:uppercase; letter-spacing:1px;">Procesando…</h2>
                        <button id="aiModalClose" style="background:transparent; border:none; color:#aaa; cursor:pointer; font-size:1.4rem;">✖</button>
                    </div>
                    <div style="padding:28px; overflow-y:auto; color:#ccc; font-size:0.95rem; line-height:1.7; white-space:pre-wrap; flex:1;" id="aiModalBody"></div>
                    <div style="padding:18px 28px; border-top:1px solid rgba(255,255,255,0.05); display:flex; justify-content:flex-end; gap:12px; background:rgba(0,0,0,0.5);">
                        <button id="btnAcceptEvolution" class="btn-primary" style="display:none; background:var(--accent-green);">✅ Aplicar Meta-Cognición</button>
                        <button id="btnDownloadPDF"    class="btn-primary" style="display:none;">⬇️ Descargar Informe (.TXT)</button>
                    </div>
                </div>
            </div>

            ${BottomNav.getHtml('/dashboard')}
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
            },
            // onMagicAction
            (actionId) => { this._runAI(actionId); }
        );

        const state   = store.getState();
        const project = state.projects.find(p => p.id === this.activeProjectId);
        if (!project) return;

        // ── MapRenderer mini ──────────────────────────────────────
        const dashMapCanvas = document.getElementById('dashMapCanvas');
        const dashMapPaths  = document.getElementById('dashMapPaths');
        if (dashMapCanvas && dashMapPaths && project.roles?.length) {
            const mr = new MapRenderer(dashMapCanvas, dashMapPaths, {
                isMacro: true, isHeatmap: false, markerSuffix: 'dash', trimSize: 22
            });
            mr.setData(project.roles, project.vna_flows || []);
        }

        // ── LedgerRenderer mini ───────────────────────────────────
        const ledgerMount = document.getElementById('dashLedgerContainer');
        if (ledgerMount) {
            const lr = new LedgerRenderer(ledgerMount, { projectId: project.id, showHistory: false });
            lr.render();
        }

        // ── Vacantes: invitar ─────────────────────────────────────
        document.querySelectorAll('.btn-invite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roleName = e.currentTarget.dataset.rolename;
                const alias = prompt(`Invitar nodo para el rol [${roleName}]. Introduce email o Alias (@id):`);
                if (alias) alert(`Invitación a ${alias} pendiente de integración P2P.`);
            });
        });

        // ── Evolve Vision ─────────────────────────────────────────
        document.getElementById('btnEvolveVision')?.addEventListener('click', () => this._runAI('evolve'));

        // ── Modal close ───────────────────────────────────────────
        document.getElementById('aiModalClose')?.addEventListener('click', () => {
            document.getElementById('aiModal').style.display = 'none';
        });
    }

    async _runAI(type) {
        const modal       = document.getElementById('aiModal');
        const modalBody   = document.getElementById('aiModalBody');
        const modalTitle  = document.getElementById('aiModalTitle');
        const btnDownload = document.getElementById('btnDownloadPDF');
        const btnAccept   = document.getElementById('btnAcceptEvolution');
        if (!modal) return;

        const state   = store.getState();
        const project = state.projects.find(p => p.id === this.activeProjectId);
        if (!project) return;

        modal.style.display = 'flex';
        modalBody.innerHTML = `<div style="text-align:center; padding:4rem;"><div style="font-size:4rem; animation:pulse 2s infinite;">🧠</div><p style="color:var(--accent-purple); margin-top:1.5rem; font-family:var(--font-mono); font-weight:bold;">Consultando KB y construyendo contexto…</p></div>`;
        btnDownload.style.display = 'none';
        btnAccept.style.display   = 'none';

        const titles = { audit: 'Auditoría VNA & Equity', legal: 'Pacto de Socios (Slicing Pie)', evolve: 'Meta-Cognición: Evolución del Proyecto' };
        modalTitle.innerText = titles[type] || 'Procesando…';

        const harvest     = store.calculateHarvest?.(project.id) || [];
        const totalSlices = harvest.reduce((s, h) => s + h.totalSlices, 0);
        const capTable    = harvest.length > 0 && totalSlices > 0
            ? harvest.map(h => {
                const u    = state.globalUsers.find(g => g.id === (h.user || h.userId));
                const name = u?.name || h.user || h.userId || 'Desconocido';
                return `- ${name}: ${((h.totalSlices / totalSlices) * 100).toFixed(2)}%`;
              })
            : ['Ledger vacío.'];

        const dataPayload = {
            nombre:             project.nombre,
            arquetipo:          project.archetype,
            vision:             project.presentation || project.prompt || 'Sin definir',
            roles_y_flujos:     `Roles: ${project.roles?.length || 0}. Flujos: ${project.vna_flows?.length || 0}`,
            wo_completadas:     (project.work_orders || []).filter(w => w.status === 'consolidated').length,
            horas_invertidas:   (project.ledger || []).reduce((s, l) => s + (l.horas || 0), 0),
            cap_table:          capTable
        };

        await KB.init();
        let systemPrompt = '';
        let isEvolveMode = false;
        let responseFormat = 'text';

        if (type === 'audit') {
            const skill = await KB.getNode('skill_slicing_pie_notary');
            systemPrompt = skill
                ? `Eres un Agente equipado con [${skill.title}]. SOP:\n\n${skill.content}`
                : 'Eres un auditor Slicing Pie. Evalúa topología y distribución de equidad.';
        } else if (type === 'legal') {
            const skill = await KB.getNode('skill_legal_drafting');
            systemPrompt = skill
                ? `Eres un Agente Legal con [${skill.title}]. Redacta el contrato:\n\n${skill.content}`
                : 'Redacta un Pacto de Socios formal basado en el Cap Table.';
        } else if (type === 'evolve') {
            isEvolveMode  = true;
            responseFormat = 'json_object';
            const skill   = await KB.getNode('skill_vna_architect');
            systemPrompt  = (skill ? `Eres el Master Architect con [${skill.title}].\nSOP:\n${skill.content}\n\n` : 'Eres el Master Architect VNA.\n\n')
                + `Evalúa el Data Payload y devuelve ÚNICAMENTE un JSON con:
{
  "new_vision": "Versión mejorada de la visión fundacional.",
  "optimized_genesis_prompt": "Nuevo System Prompt detallado para el arquitecto.",
  "soc_reliability": "Análisis de los SOCs: ¿son deterministas para auditoría IA?",
  "recommendation": "¿Mantener proceso continuo o iniciar fase de cierre?"
}`;
        }

        try {
            const response = await Orchestrator.callLLM({
                preferredEngine: 'anthropic',
                systemPrompt,
                userPrompt:     `Data Payload:\n${JSON.stringify(dataPayload, null, 2)}`,
                responseFormat,
                temperature:    isEvolveMode ? 0.3 : 0.2
            });

            if (isEvolveMode) {
                const evo = response.content;
                modalBody.innerHTML = `
                    <div style="font-family:var(--font-main);">
                        <h3 style="color:var(--accent-indigo); margin-top:0;">🔮 Nueva Visión</h3>
                        <p style="color:#ccc; line-height:1.7; margin-bottom:1.5rem;">${evo.new_vision || '—'}</p>
                        <h3 style="color:var(--accent-green);">⚙️ Genesis Prompt Optimizado</h3>
                        <pre style="background:rgba(0,0,0,0.5); padding:1rem; border-radius:8px; font-size:0.8rem; color:#aaa; white-space:pre-wrap; margin-bottom:1.5rem;">${evo.optimized_genesis_prompt || '—'}</pre>
                        <h3 style="color:var(--accent-orange);">📋 Fiabilidad SOCs</h3>
                        <p style="color:#ccc; line-height:1.7; margin-bottom:1.5rem;">${evo.soc_reliability || '—'}</p>
                        <h3 style="color:var(--accent-purple);">🎯 Recomendación</h3>
                        <p style="color:#ccc; line-height:1.7;">${evo.recommendation || '—'}</p>
                    </div>`;
                btnAccept.style.display = 'block';
                btnAccept.onclick = async () => {
                    if (evo.new_vision) {
                        await store.dispatch({
                            type:    'UPDATE_PROJECT_INFO',
                            payload: { projectId: project.id, updates: { presentation: evo.new_vision } }
                        });
                    }
                    modal.style.display = 'none';
                    window.location.reload();
                };
            } else {
                const text = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
                modalBody.innerHTML = `<div style="font-family:var(--font-main);">${text.replace(/\n/g,'<br>')}</div>`;
                btnDownload.style.display = 'block';
                btnDownload.onclick = () => {
                    const a = document.createElement('a');
                    a.href     = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
                    a.download = `${type}_${project.nombre.replace(/ /g,'_')}.txt`;
                    a.click();
                };
            }
        } catch (err) {
            modalBody.innerHTML = `<div style="text-align:center; padding:2rem;"><div style="font-size:3rem; margin-bottom:1rem;">⚠️</div><h3 style="color:var(--accent-red);">Fallo Neural</h3><p style="color:#888;">${err.message}</p></div>`;
        }
    }

    // Alias V9
    executeViewScript() { return this.afterRender(); }
}
