// =============================================================================
// TEAMTOWERS SOS V10.1 — HOME VIEW
// Ruta: ia/dev/js/views/HomeView.js
// Dashboard global · Stats financieras · Costes IA · Archivado · IDE modal
// =============================================================================

import { store }    from '../core/store.js';
import { KB }       from '../core/kb.js';
import { Sidebar }  from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';

export default class HomeView {
    constructor() {
        document.title = 'TeamTowers V10 | Inicio';
    }

    // ── Calcular métricas financieras globales ────────────────────
    _calcFinancials(projects) {
        const byProvider = {};
        let totalAiCost  = 0;
        let totalSlices  = 0;
        let totalRevenue = 0; // cuando existan ventas reales
        let totalHours   = 0;

        projects.forEach(p => {
            // Costes IA del ledger
            (p.ledger || []).forEach(e => {
                if (e.type === 'AI_COST') {
                    const provider = e.provider || 'anthropic';
                    const cost     = e.cost_usd || 0;
                    if (!byProvider[provider]) byProvider[provider] = { cost: 0, calls: 0 };
                    byProvider[provider].cost  += cost;
                    byProvider[provider].calls += 1;
                    totalAiCost += cost;
                }
                // Ingresos reales (cuando existan)
                if (e.type === 'REVENUE') totalRevenue += e.amount || 0;
                // Horas trabajadas
                if (!e.type || e.type === 'work') totalHours += e.horas || 0;
            });

            // Telemetría como fuente alternativa de costes IA
            (p.telemetry || []).forEach(t => {
                const provider = t.engine || t.provider || 'anthropic';
                const cost     = t.costInDollars || 0;
                if (!byProvider[provider]) byProvider[provider] = { cost: 0, calls: 0 };
                byProvider[provider].cost  += cost;
                byProvider[provider].calls += 1;
                totalAiCost += cost;
            });

            // Slices del harvest
            const harvest = store.calculateHarvest?.(p.id) || [];
            harvest.forEach(h => { totalSlices += h.totalSlices || 0; });
        });

        return { byProvider, totalAiCost, totalSlices, totalRevenue, totalHours };
    }

    async getHtml() {
        await store.init();
        const state    = store.getState();
        const active   = state.projects.filter(p => !p.isArchived);
        const archived = state.projects.filter(p =>  p.isArchived);
        const fin      = this._calcFinancials(state.projects);

        const providerIcons = { anthropic:'🟣', openai:'🟢', deepseek:'🔵', gemini:'🟡' };

        const providerRows = Object.entries(fin.byProvider)
            .sort((a,b) => b[1].cost - a[1].cost)
            .map(([p, d]) => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                <div style="display:flex;align-items:center;gap:7px;font-size:0.8rem;">
                    <span>${providerIcons[p] || '⚪'}</span>
                    <span style="color:#ccc;font-family:var(--font-mono);">${p}</span>
                    <span style="color:#444;font-size:0.68rem;">${d.calls} calls</span>
                </div>
                <span style="color:var(--accent-red,#ff5252);font-family:var(--font-mono);font-size:0.8rem;font-weight:bold;">
                    $${d.cost.toFixed(4)}
                </span>
            </div>`).join('') || '<div style="color:#444;font-size:0.78rem;padding:8px 0;">Sin llamadas IA registradas aún.</div>';

        const projectCards = active.map(p => {
            const harvest    = store.calculateHarvest?.(p.id) || [];
            const slices     = harvest.reduce((s,h) => s + (h.totalSlices||0), 0);
            const wos        = (p.work_orders || p.workOrders || []).length;
            const aiCost     = (p.telemetry||[]).reduce((s,t) => s + (t.costInDollars||0), 0)
                             + (p.ledger||[]).filter(e=>e.type==='AI_COST').reduce((s,e) => s + (e.cost_usd||0), 0);
            const roles      = (p.roles || p.vna_nodes || []).length;
            const flows      = [...(p.vna_flows||[]),...(p.vna_exchanges||[])].length;
            const maturity   = p.settings?.automation_level || 'review_first';
            const matColor   = { full_auto:'var(--accent-green)', review_first:'var(--accent-orange)', human_only:'#6366f1' }[maturity] || '#888';

            return `
            <div class="eco-card" data-pid="${p.id}">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
                    <div class="eco-card-name">🗼 ${p.nombre}</div>
                    <div style="display:flex;gap:5px;">
                        <button class="btn-archive" data-pid="${p.id}" title="Archivar proyecto"
                            style="background:transparent;border:1px solid rgba(255,255,255,0.08);color:#444;border-radius:6px;padding:3px 7px;cursor:pointer;font-size:0.68rem;transition:0.2s;">
                            📦
                        </button>
                    </div>
                </div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <span class="eco-meta-pill">${roles} roles</span>
                    <span class="eco-meta-pill">${flows} flujos</span>
                    <span class="eco-meta-pill">${wos} WOs</span>
                    <span class="eco-meta-pill" style="color:${matColor};border-color:${matColor}33;">${maturity.replace('_',' ')}</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px;">
                    <div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--accent-green,#00e676);">
                        ⚡ ${Math.round(slices).toLocaleString()} slices
                    </div>
                    ${aiCost > 0 ? `<div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--accent-red,#ff5252);">$${aiCost.toFixed(3)} IA</div>` : ''}
                </div>
                <a href="/dashboard" data-link class="eco-card-link" style="display:block;margin-top:8px;text-align:center;padding:7px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:8px;color:var(--accent-indigo,#6366f1);font-size:0.76rem;font-weight:bold;text-decoration:none;transition:0.2s;">
                    Abrir ecosistema →
                </a>
            </div>`;
        }).join('');

        return `
        <style>
            .home-layout { display:flex; height:100dvh; width:100vw; overflow:hidden; background:var(--bg-dark); }
            .home-main   { flex:1; overflow-y:auto; padding:2rem 2.5rem; box-sizing:border-box;
                background:radial-gradient(circle at top left, rgba(99,102,241,0.04) 0%, transparent 50%); }

            /* Hero */
            .home-hero    { margin-bottom:2rem; animation:fadeIn 0.5s ease; }
            .home-hero h1 { font-size:2.2rem; font-weight:900; letter-spacing:-1px; margin:0 0 4px; color:white; }
            .home-hero h1 span { color:var(--accent-indigo,#6366f1); }
            .home-hero p  { color:#555; font-size:0.9rem; margin:0; }

            /* Stats globales */
            .stats-global { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr));
                gap:12px; margin-bottom:2rem; }
            .stat-pill { background:rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.06);
                border-radius:14px; padding:14px 16px; }
            .stat-pill-val { font-size:1.5rem; font-weight:900; font-family:var(--font-mono);
                color:white; line-height:1; margin-bottom:4px; }
            .stat-pill-lbl { font-size:0.65rem; color:#555; text-transform:uppercase;
                letter-spacing:1px; font-weight:700; }

            /* Sección 2 columnas */
            .home-cols { display:grid; grid-template-columns:1fr 340px; gap:1.5rem;
                margin-bottom:2rem; }
            @media (max-width:1100px) { .home-cols { grid-template-columns:1fr; } }

            /* Cards de proyectos */
            .eco-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
                gap:1rem; }
            .eco-card { background:linear-gradient(145deg,rgba(22,22,28,0.9),rgba(12,12,18,0.95));
                border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:1.25rem;
                display:flex; flex-direction:column; gap:8px; transition:0.2s; }
            .eco-card:hover { border-color:rgba(99,102,241,0.3); }
            .eco-card-name { font-weight:900; font-size:0.95rem; color:white; }
            .eco-meta-pill { font-size:0.65rem; padding:2px 7px; border-radius:5px;
                background:rgba(0,0,0,0.3); color:#666; border:1px solid rgba(255,255,255,0.06);
                font-family:var(--font-mono); }
            .btn-archive:hover { color:var(--accent-orange,#ff9100)!important;
                border-color:rgba(255,145,0,0.3)!important; }

            /* Panel financiero */
            .fin-panel { background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.06);
                border-radius:16px; padding:1.25rem; display:flex; flex-direction:column; gap:1rem; }
            .fin-title { font-size:0.75rem; font-weight:900; color:#888; text-transform:uppercase;
                letter-spacing:1.5px; margin-bottom:4px; }

            /* Ingresos hito */
            .revenue-hito { background:rgba(0,230,118,0.04); border:1px solid rgba(0,230,118,0.15);
                border-radius:10px; padding:12px; text-align:center; }
            .revenue-hito-val { font-size:1.8rem; font-weight:900; color:var(--accent-green,#00e676);
                font-family:var(--font-mono); }
            .revenue-hito-lbl { font-size:0.65rem; color:#555; text-transform:uppercase;
                letter-spacing:1px; margin-top:3px; }

            /* Archivados */
            .archived-section { margin-top:1.5rem; }
            .archived-toggle { background:transparent; border:none; color:#444; cursor:pointer;
                font-size:0.78rem; font-weight:bold; display:flex; align-items:center; gap:6px;
                padding:0 0 10px; transition:0.2s; }
            .archived-toggle:hover { color:#888; }
            .archived-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
                gap:8px; }
            .archived-card { background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.04);
                border-radius:10px; padding:10px 14px; display:flex; align-items:center;
                justify-content:space-between; gap:8px; opacity:0.6; }
            .archived-card:hover { opacity:0.9; }

            /* Crear */
            .eco-create { border:2px dashed rgba(255,255,255,0.07); border-radius:16px;
                padding:1.25rem; cursor:pointer; color:#444; display:flex; flex-direction:column;
                align-items:center; justify-content:center; gap:8px; min-height:130px;
                text-decoration:none; text-align:center; transition:0.2s; }
            .eco-create:hover { border-color:var(--accent-green,#00e676);
                color:var(--accent-green,#00e676); background:rgba(0,230,118,0.02); }

            /* Status bar */
            .status-bar { position:fixed; bottom:1rem; right:1rem;
                background:rgba(10,10,14,0.97); border:1px solid rgba(255,255,255,0.08);
                border-radius:8px; padding:5px 12px; font-family:var(--font-mono);
                font-size:0.68rem; color:#555; display:flex; align-items:center; gap:7px; z-index:10; }
            .status-dot { width:5px; height:5px; border-radius:50%;
                background:var(--accent-green,#00e676); animation:pulse 2s infinite; }

            @keyframes fadeIn { from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:none;} }
            @keyframes pulse  { 0%,100%{opacity:1;}50%{opacity:0.3;} }
            @media (max-width:768px) {
                .home-main { padding:80px 1rem 100px; }
                .home-hero h1 { font-size:1.6rem; }
            }
        </style>

        <div class="home-layout">
            ${Sidebar.getHtml('/')}

            <main class="home-main">
                <!-- Hero -->
                <div class="home-hero">
                    <h1>Team<span>Towers</span> V10</h1>
                    <p>Exoesqueleto Cognitivo · Antigravity Kernel · ${active.length} ecosistema${active.length !== 1 ? 's' : ''} activo${active.length !== 1 ? 's' : ''}</p>
                </div>

                <!-- Stats globales -->
                <div class="stats-global">
                    <div class="stat-pill">
                        <div class="stat-pill-val" style="color:var(--accent-indigo,#6366f1);">${active.length}</div>
                        <div class="stat-pill-lbl">Ecosistemas</div>
                    </div>
                    <div class="stat-pill">
                        <div class="stat-pill-val" style="color:var(--accent-purple,#e040fb);">${state.globalUsers.filter(u=>u.profile?.isAi).length}</div>
                        <div class="stat-pill-lbl">Agentes IA</div>
                    </div>
                    <div class="stat-pill">
                        <div class="stat-pill-val" style="color:var(--accent-green,#00e676);">${Math.round(fin.totalSlices).toLocaleString()}</div>
                        <div class="stat-pill-lbl">Slices Totales</div>
                    </div>
                    <div class="stat-pill">
                        <div class="stat-pill-val" style="color:var(--accent-orange,#ff9100);">${fin.totalHours.toFixed(1)}h</div>
                        <div class="stat-pill-lbl">Horas Minadas</div>
                    </div>
                    <div class="stat-pill">
                        <div class="stat-pill-val" style="color:var(--accent-red,#ff5252);">$${fin.totalAiCost.toFixed(3)}</div>
                        <div class="stat-pill-lbl">Coste IA Total</div>
                    </div>
                    <div class="stat-pill">
                        <div class="stat-pill-val" style="color:var(--accent-green,#00e676);">$${fin.totalRevenue.toFixed(2)}</div>
                        <div class="stat-pill-lbl">Ingresos Reales</div>
                    </div>
                </div>

                <!-- Columnas: proyectos + panel financiero -->
                <div class="home-cols">
                    <!-- Proyectos activos -->
                    <div>
                        <div class="fin-title" style="margin-bottom:12px;">Ecosistemas Activos</div>
                        <div class="eco-grid">
                            ${projectCards}
                            <a href="/create" data-link class="eco-create">
                                <div style="font-size:2rem;">+</div>
                                <div style="font-weight:700;font-size:0.82rem;">Instanciar Ecosistema</div>
                                <div style="font-size:0.7rem;">Forjar nueva red VNA</div>
                            </a>
                        </div>

                        <!-- Archivados -->
                        ${archived.length ? `
                        <div class="archived-section">
                            <button class="archived-toggle" id="btnToggleArchived">
                                📦 ${archived.length} proyecto${archived.length>1?'s':''} archivado${archived.length>1?'s':''}
                                <span id="archivedChevron">▶</span>
                            </button>
                            <div class="archived-grid" id="archivedGrid" style="display:none;">
                                ${archived.map(p => `
                                <div class="archived-card">
                                    <span style="font-size:0.8rem;color:#555;">📦 ${p.nombre}</span>
                                    <button class="btn-unarchive" data-pid="${p.id}"
                                        style="background:transparent;border:1px solid #333;color:#444;border-radius:5px;padding:2px 7px;cursor:pointer;font-size:0.68rem;transition:0.2s;">
                                        Restaurar
                                    </button>
                                </div>`).join('')}
                            </div>
                        </div>` : ''}
                    </div>

                    <!-- Panel financiero -->
                    <div class="fin-panel">
                        <!-- Ingresos hito -->
                        <div>
                            <div class="fin-title">💰 Ingresos de Servicios</div>
                            <div class="revenue-hito">
                                <div class="revenue-hito-val">$${fin.totalRevenue.toFixed(2)}</div>
                                <div class="revenue-hito-lbl">
                                    ${fin.totalRevenue === 0 ? '🎯 Hito pendiente — primera venta SOS' : 'Ingresos reales acumulados'}
                                </div>
                            </div>
                            ${fin.totalRevenue === 0 ? `
                            <div style="font-size:0.68rem;color:#333;margin-top:8px;line-height:1.4;text-align:center;">
                                Los ingresos aparecerán aquí cuando registres ventas de servicios generados por SOS via <code style="color:#555;">type:'REVENUE'</code> en el Ledger.
                            </div>` : ''}
                        </div>

                        <!-- Costes IA por proveedor -->
                        <div>
                            <div class="fin-title">🤖 Costes IA por Proveedor</div>
                            ${providerRows}
                            <div style="display:flex;justify-content:space-between;padding-top:8px;margin-top:4px;border-top:1px solid rgba(255,255,255,0.06);">
                                <span style="font-size:0.72rem;color:#555;font-weight:bold;">TOTAL</span>
                                <span style="font-family:var(--font-mono);font-size:0.78rem;color:var(--accent-red,#ff5252);font-weight:bold;">
                                    $${fin.totalAiCost.toFixed(4)}
                                </span>
                            </div>
                        </div>

                        <!-- ROI estimado -->
                        <div style="background:rgba(99,102,241,0.05);border:1px solid rgba(99,102,241,0.15);border-radius:10px;padding:12px;">
                            <div class="fin-title" style="margin-bottom:8px;">📈 ROI Estimado</div>
                            <div style="font-size:0.78rem;color:#888;line-height:1.6;">
                                <div style="display:flex;justify-content:space-between;">
                                    <span>Valor generado (slices)</span>
                                    <span style="color:var(--accent-green,#00e676);font-family:var(--font-mono);">${Math.round(fin.totalSlices).toLocaleString()}</span>
                                </div>
                                <div style="display:flex;justify-content:space-between;">
                                    <span>Coste IA</span>
                                    <span style="color:var(--accent-red,#ff5252);font-family:var(--font-mono);">$${fin.totalAiCost.toFixed(3)}</span>
                                </div>
                                ${fin.totalAiCost > 0 ? `
                                <div style="display:flex;justify-content:space-between;margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.06);">
                                    <span style="font-weight:bold;color:white;">REC Ratio</span>
                                    <span style="font-family:var(--font-mono);color:var(--accent-indigo,#6366f1);font-weight:bold;">
                                        ${(fin.totalSlices / fin.totalAiCost).toFixed(0)}x
                                    </span>
                                </div>` : ''}
                            </div>
                        </div>

                        <!-- Acceso rápido settings API keys -->
                        <a href="/settings" data-link style="display:block;text-align:center;padding:8px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#444;font-size:0.72rem;text-decoration:none;transition:0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#444'">
                            ⚙️ Gestionar API Keys → Settings
                        </a>
                    </div>
                </div>
            </main>

            ${BottomNav.getHtml('/')}
        </div>

        <div class="status-bar">
            <div class="status-dot"></div>
            SOS V10 · ${state.config?.version || 'Antigravity'} · ${state.globalUsers.filter(u=>u.profile?.isAi).length} agentes activos
        </div>`;
    }

    async afterRender() {
        Sidebar.initListeners();

        // ── Archivar proyecto ─────────────────────────────────────
        document.querySelectorAll('.btn-archive').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const pid = btn.dataset.pid;
                const state = store.getState();
                const p = state.projects.find(x => x.id === pid);
                if (!p) return;
                if (!confirm(`¿Archivar "${p.nombre}"? Podrás restaurarlo después.`)) return;
                await store.dispatch({ type: 'ARCHIVE_PROJECT', payload: { projectId: pid } });
                // Recargar vista
                if (typeof window.navigateTo === 'function') window.navigateTo('/');
                else window.location.reload();
            });
        });

        // ── Restaurar proyecto archivado ──────────────────────────
        document.querySelectorAll('.btn-unarchive').forEach(btn => {
            btn.addEventListener('click', async () => {
                const pid = btn.dataset.pid;
                await store.dispatch({
                    type: 'UPDATE_PROJECT_INFO',
                    payload: { projectId: pid, updates: { isArchived: false } }
                });
                if (typeof window.navigateTo === 'function') window.navigateTo('/');
                else window.location.reload();
            });
        });

        // ── Toggle archivados ─────────────────────────────────────
        document.getElementById('btnToggleArchived')?.addEventListener('click', () => {
            const grid    = document.getElementById('archivedGrid');
            const chevron = document.getElementById('archivedChevron');
            const shown   = grid.style.display !== 'none';
            grid.style.display    = shown ? 'none' : 'grid';
            chevron.textContent   = shown ? '▶' : '▼';
        });

        console.log('[HomeView] V10.1 renderizado correctamente.');
    }
}
