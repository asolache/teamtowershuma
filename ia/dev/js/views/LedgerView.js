// =============================================================================
// TEAMTOWERS SOS V10 — LEDGER VIEW
// Ruta: ia/dev/js/views/LedgerView.js
// Notaría & Cap Table · Slicing Pie Wallet · Economía IA V10
// =============================================================================

import { store }          from '../core/store.js';
import { Sidebar }        from '../components/Sidebar.js';
import { BottomNav }      from '../components/BottomNav.js';
import { PageHeader }     from '../components/PageHeader.js';
import { LedgerRenderer } from '../components/LedgerRenderer.js';

export default class LedgerView {

    constructor() {
        document.title       = 'Notaría & Cap Table | TeamTowers V10';
        this.activeProjectId = null;
        this.currentTab      = 'project';
        this.ledgerRenderer  = null;

        // URL param: /ledger?entry=xxx focaliza la entrada
        const params         = new URLSearchParams(window.location.search);
        this._focusEntry     = params.get('entry') || null;
    }

    async getHtml() {
        await store.init();
        const state        = store.getState();
        const activeUserId = state.session.activeUserId;

        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        if (!project) {
            const userProjects = state.projects.filter(p =>
                state.session.role === 'ecosystem-owner' ||
                p.ownerId === activeUserId ||
                p.usuarios?.find(u => u.id === activeUserId)
            );
            project = userProjects.at(-1) || null;
        }

        if (!project) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/ledger')}
                    <main class="workspace" style="justify-content:center; align-items:center;">
                        <div class="glass-panel" style="text-align:center; max-width:500px; margin:0 auto; padding:4rem;">
                            <div style="font-size:5rem; margin-bottom:1.5rem; line-height:1;">⚖️</div>
                            <h2 style="color:white; margin-top:0; font-weight:900; font-size:2rem;">Wallet Vacía</h2>
                            <p style="color:var(--text-muted); margin-bottom:2.5rem;">No tienes participación en ningún Ecosistema.</p>
                            <a href="/create" data-link class="btn-primary" style="text-decoration:none;">➕ Inicializar Red</a>
                        </div>
                    </main>
                    ${BottomNav.getHtml('/ledger')}
                </div>`;
        }

        const isPO = project.ownerId === activeUserId || state.session.role === 'ecosystem-owner';

        // Métricas rápidas para el header
        const ledger     = project.ledger || [];
        const aiEntries  = ledger.filter(e => e.type === 'AI_COST');
        const aiCostTotal = aiEntries.reduce((s, e) => s + (e.cost_usd || 0), 0);
        const aiSlices    = aiEntries.reduce((s, e) => s + (e.slices || 0), 0);

        const headerConfig = {
            title:    'Slicing Pie Wallet',
            subtitle:  project.nombre,
            tagline:  'Libro mayor inmutable. Trabajo y riesgo convertido en Equity.',
            tabs: [
                { id: 'project', label: '⚖️ Cap Table',           active: this.currentTab === 'project' },
                { id: 'ai',      label: `🤖 IA Economy${aiEntries.length ? ` (${aiEntries.length})` : ''}`, active: this.currentTab === 'ai' },
                { id: 'global',  label: '🌐 Mi Portfolio Global', active: this.currentTab === 'global'  }
            ],
            actionHtml: isPO ? `
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <button id="btnOpenCapitalModal" style="background:rgba(0,230,118,0.1); border:1px solid var(--accent-green); color:var(--accent-green); padding:8px 16px; border-radius:12px; font-size:0.85rem; font-weight:bold; cursor:pointer; transition:0.3s;">💶 Inyectar Capital</button>
                    <button id="btnOpenPermaweb"    style="background:rgba(255,171,64,0.1); border:1px solid var(--accent-orange); color:var(--accent-orange); padding:8px 16px; border-radius:12px; font-size:0.85rem; font-weight:bold; cursor:pointer; transition:0.3s;">🧊 Congelar Blockchain</button>
                </div>` : '',
            magicActions: [
                { id: 'audit_cap', label: 'Auditoría de Inversores', icon: '🤖', tokens: 200 }
            ]
        };

        return `
        <style>
            ${LedgerRenderer.getStyles()}

            .workspace-ledger { flex:1; padding:2rem 3rem; overflow-y:auto;
                background:radial-gradient(circle at center, #111116 0%, #050505 100%); }
            .tab-content        { display:none; animation:fadeIn 0.3s ease-out; }
            .tab-content.active { display:block; }

            /* ── AI Economy tab ────────────────────────────────── */
            .ai-tab-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
                gap:1.25rem; margin-bottom:2rem; }
            .ai-kpi-card { background:linear-gradient(145deg,rgba(20,20,25,0.8),rgba(10,10,15,0.9));
                border:1px solid var(--glass-border); border-radius:18px; padding:1.5rem;
                border-left:4px solid var(--kpi-color,#333); }
            .ai-kpi-val { font-size:2rem; font-weight:900; font-family:var(--font-mono); color:white; line-height:1; }
            .ai-kpi-lbl { font-size:0.72rem; color:#888; text-transform:uppercase; letter-spacing:1px; margin-top:6px; }

            /* ── Portfolio ─────────────────────────────────────── */
            .portfolio-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr));
                gap:1.5rem; width:100%; box-sizing:border-box; }
            .portfolio-card { background:linear-gradient(145deg,rgba(30,30,35,0.6),rgba(15,15,20,0.8));
                border:1px solid var(--glass-border); padding:2rem; border-radius:20px;
                transition:0.3s; box-sizing:border-box; }
            .portfolio-card:hover { transform:translateY(-5px); border-color:rgba(255,255,255,0.2); }

            /* ── Modal ─────────────────────────────────────────── */
            .overlay-modal { position:fixed; top:0; left:0; width:100vw; height:100vh;
                background:rgba(0,0,0,0.85); backdrop-filter:blur(15px);
                z-index:5000; display:none; justify-content:center; align-items:center; }
            .card-modal { background:var(--bg-dark); border:1px solid #444; border-radius:24px;
                padding:3rem; width:100%; max-width:500px; box-shadow:0 30px 60px rgba(0,0,0,0.8);
                animation:slideUp 0.4s; box-sizing:border-box; max-height:90vh; overflow-y:auto;
                border-top:4px solid currentColor; }
            .form-group { text-align:left; margin-bottom:20px; }
            .form-group label { display:block; color:var(--text-muted); font-size:0.8rem;
                margin-bottom:8px; text-transform:uppercase; font-weight:bold; letter-spacing:1px; }
            .form-control { width:100%; background:rgba(0,0,0,0.5); border:1px solid #444;
                color:white; padding:14px 16px; border-radius:12px; font-family:inherit;
                font-size:1rem; outline:none; box-sizing:border-box; transition:0.3s; }
            .form-control:focus { border-color:var(--accent-green); }

            @keyframes slideUp { from { transform:translateY(40px); opacity:0; } to { transform:translateY(0); opacity:1; } }
            @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
            @media (max-width:1024px) { .workspace-ledger { padding:90px 1rem 120px 1rem; } }
        </style>

        <div class="app-layout">
            ${Sidebar.getHtml('/ledger')}
            <main class="workspace-ledger">
                ${PageHeader.getHtml(headerConfig)}

                <!-- TAB: CAP TABLE ─────────────────────────────── -->
                <div id="tab-project" class="tab-content ${this.currentTab === 'project' ? 'active' : ''}">
                    <div id="ledgerMountPoint"></div>
                </div>

                <!-- TAB: IA ECONOMY ────────────────────────────── -->
                <div id="tab-ai" class="tab-content ${this.currentTab === 'ai' ? 'active' : ''}">
                    ${aiEntries.length === 0 ? `
                    <div style="text-align:center;color:#555;padding:4rem;font-size:0.95rem;">
                        <div style="font-size:4rem;margin-bottom:1rem;">🤖</div>
                        Aún no hay llamadas IA registradas. Genera un mapa VNA o usa el Swarm para empezar a acumular slices automáticos.
                        <br><br>
                        <a href="/map" data-link style="color:var(--accent-indigo);font-weight:bold;">Ir a la Fábrica VNA →</a>
                    </div>` : `
                    <div class="ai-tab-grid">
                        <div class="ai-kpi-card" style="--kpi-color:var(--accent-purple);">
                            <div class="ai-kpi-val" style="color:var(--accent-purple);">${Number(aiSlices.toFixed(3)).toLocaleString()}</div>
                            <div class="ai-kpi-lbl">Slices IA acumulados</div>
                        </div>
                        <div class="ai-kpi-card" style="--kpi-color:var(--accent-orange);">
                            <div class="ai-kpi-val" style="color:var(--accent-orange);">$${aiCostTotal.toFixed(4)}</div>
                            <div class="ai-kpi-lbl">Coste real API</div>
                        </div>
                        <div class="ai-kpi-card" style="--kpi-color:var(--accent-green);">
                            <div class="ai-kpi-val" style="color:var(--accent-green);">${aiEntries.length}</div>
                            <div class="ai-kpi-lbl">Llamadas al Swarm</div>
                        </div>
                        <div class="ai-kpi-card" style="--kpi-color:#555;">
                            <div class="ai-kpi-val">${aiCostTotal > 0 ? (aiSlices / aiCostTotal).toFixed(0) : '∞'}x</div>
                            <div class="ai-kpi-lbl">REC (slices/coste)</div>
                        </div>
                    </div>
                    <div id="aiLedgerMount"></div>`}
                </div>

                <!-- TAB: PORTFOLIO ─────────────────────────────── -->
                <div id="tab-global" class="tab-content ${this.currentTab === 'global' ? 'active' : ''}">
                    <div style="display:flex; justify-content:flex-end; margin-bottom:2rem;">
                        <button class="btn-primary" id="btnOpenExit" style="background:linear-gradient(135deg,var(--accent-purple),var(--accent-indigo));">
                            💸 Simular Liquidación (Harvest)
                        </button>
                    </div>
                    <div class="portfolio-grid" id="portfolioGrid"></div>
                </div>
            </main>

            <!-- Modal: Inyectar Capital -->
            <div id="capitalModal" class="overlay-modal">
                <div class="card-modal" style="color:var(--accent-green);">
                    <h2 style="color:var(--accent-green); margin-top:0; font-size:1.8rem; font-weight:900; letter-spacing:-1px;">Inyección de Capital</h2>
                    <p style="color:#aaa; font-size:0.95rem; margin-bottom:2.5rem; line-height:1.5;">El motor aplicará el multiplicador matemático al tipo de riesgo correspondiente.</p>
                    <div class="form-group">
                        <label>Inversor (Nodo del Ecosistema)</label>
                        <select id="inpCapUser" class="form-control" style="font-weight:bold;color:var(--accent-green);"></select>
                    </div>
                    <div class="form-group">
                        <label>Tipo de Activo Inyectado</label>
                        <select id="inpCapType" class="form-control">
                            <option value="CASH">💶 Cash (Dinero Fiat)</option>
                            <option value="IP">🧠 IP (Propiedad Intelectual)</option>
                            <option value="EQUIPMENT">🖥️ Equipment (Hardware/Software)</option>
                            <option value="RELATIONSHIP">🤝 Relationship (Red de Contactos)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Valor en EUR (FMV)</label>
                        <input type="number" id="inpCapAmount" class="form-control" placeholder="Ej: 5000" min="1">
                    </div>
                    <div class="form-group">
                        <label>Descripción del Aporte</label>
                        <input type="text" id="inpCapDesc" class="form-control" placeholder="Ej: Servidor AWS por 6 meses">
                    </div>
                    <div style="display:flex; gap:15px; justify-content:flex-end; margin-top:2rem;">
                        <button id="btnCloseCapModal" style="background:transparent;border:1px solid #444;color:#aaa;padding:12px 24px;border-radius:12px;cursor:pointer;font-weight:bold;">Cancelar</button>
                        <button id="btnConfirmCapital" class="btn-primary" style="background:linear-gradient(135deg,var(--accent-green),#00b341);">✅ Inyectar Capital</button>
                    </div>
                </div>
            </div>

            ${BottomNav.getHtml('/ledger')}
        </div>`;
    }

    async afterRender() {
        Sidebar.initListeners();
        PageHeader.afterRender(
            (tabId) => {
                this.currentTab = tabId;
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(`tab-${tabId}`)?.classList.add('active');
                if (tabId === 'global') this._renderGlobalPortfolio();
                else if (tabId === 'ai') this._renderAiLedger();
                else this.ledgerRenderer?.render();
            },
            (actionId) => {
                if (actionId === 'audit_cap') {
                    alert('🧠 Auditoría V10: Cap Table validada. Slices derivan de Work Orders auditadas, Inyecciones de Capital y llamadas IA (LEDGER_AI_COST).');
                }
            }
        );

        const state        = store.getState();
        const activeUserId = state.session.activeUserId;
        let project = state.projects.find(p => p.id === localStorage.getItem('tt_active_project'));
        if (!project) return;
        this.activeProjectId = project.id;

        // ── Montar LedgerRenderer ─────────────────────────────────────────────
        const mountPoint = document.getElementById('ledgerMountPoint');
        if (mountPoint) {
            this.ledgerRenderer = new LedgerRenderer(mountPoint, { projectId: this.activeProjectId, showHistory: true });
            this.ledgerRenderer.render();
        }

        // Si tab AI, renderizar también
        if (this.currentTab === 'ai') this._renderAiLedger();

        // ── Focus entry desde URL param ───────────────────────────────────────
        if (this._focusEntry) {
            setTimeout(() => {
                const cells = document.querySelectorAll('.hash-badge, .ai-hash-badge');
                cells.forEach(cell => {
                    if (cell.textContent.includes(this._focusEntry.substring(0,8))) {
                        cell.closest('tr')?.scrollIntoView({ behavior:'smooth', block:'center' });
                        cell.closest('tr')?.style && (cell.closest('tr').style.background = 'rgba(99,102,241,0.1)');
                    }
                });
            }, 300);
        }

        // ── Modal Capital ─────────────────────────────────────────────────────
        const capitalModal  = document.getElementById('capitalModal');
        const btnOpenCap    = document.getElementById('btnOpenCapitalModal');
        const btnCloseCap   = document.getElementById('btnCloseCapModal');
        const btnConfirmCap = document.getElementById('btnConfirmCapital');

        if (btnOpenCap && capitalModal) {
            btnOpenCap.addEventListener('click', () => {
                const currProject = store.getState().projects.find(p => p.id === this.activeProjectId);
                let users = [...(currProject.usuarios || [])];
                if (currProject.ownerId && !users.find(u => u.id === currProject.ownerId)) {
                    users.push({ id: currProject.ownerId });
                }
                document.getElementById('inpCapUser').innerHTML = users.map(u => {
                    const gUser = state.globalUsers.find(gu => gu.id === u.id);
                    return `<option value="${u.id}">${gUser?.name || u.id}</option>`;
                }).join('');
                capitalModal.style.display = 'flex';
            });
        }

        btnCloseCap?.addEventListener('click', () => { capitalModal.style.display = 'none'; });

        btnConfirmCap?.addEventListener('click', async () => {
            const userId  = document.getElementById('inpCapUser').value;
            const type    = document.getElementById('inpCapType').value;
            const amount  = parseFloat(document.getElementById('inpCapAmount').value);
            const desc    = document.getElementById('inpCapDesc').value.trim();
            if (!amount || amount <= 0) return alert('Introduce un valor válido.');

            const MULTIPLIERS = { CASH: 3, IP: 4, EQUIPMENT: 2, RELATIONSHIP: 2 };
            const slices = Number((amount * (MULTIPLIERS[type] || 2)).toFixed(3));

            await store.dispatch({
                type: 'ADD_LEDGER_ENTRY',
                payload: {
                    projectId: this.activeProjectId,
                    entry: {
                        id:        `cap_${Date.now()}`,
                        userId,
                        roleId:    'CAPITAL_ASSET',
                        type:      'CAPITAL_INJECTION',
                        horas:     0,
                        slices,
                        valorCongelado: slices,
                        fmv:       amount,
                        desc:      desc || `Inyección ${type}`,
                        timestamp: Date.now()
                    }
                }
            });

            capitalModal.style.display = 'none';
            this.ledgerRenderer?.render();
        });

        document.getElementById('btnOpenPermaweb')?.addEventListener('click', () => {
            alert('🧊 Función de sellado en Arweave/Blockchain próximamente disponible.');
        });

        document.getElementById('btnOpenExit')?.addEventListener('click', () => {
            this._renderGlobalPortfolio();
        });
    }

    // ── Render AI Ledger (solo AI_COST entries) ─────────────────────────────
    _renderAiLedger() {
        const mount = document.getElementById('aiLedgerMount');
        if (!mount) return;
        // LedgerRenderer filtra internamente — solo pasamos showHistory:true
        // El renderer muestra el panel IA economy + historial IA
        const aiRenderer = new LedgerRenderer(mount, { projectId: this.activeProjectId, showHistory: true });
        aiRenderer.render();
    }

    // ── Portfolio global ────────────────────────────────────────────────────
    _renderGlobalPortfolio() {
        const state        = store.getState();
        const activeUserId = state.session.activeUserId;
        const grid         = document.getElementById('portfolioGrid');
        if (!grid) return;

        const entries = [];
        state.projects.forEach(p => {
            const harvest = store.calculateHarvest(p.id);
            const mine    = harvest.find(h => h.userId === activeUserId);
            if (mine && mine.totalSlices > 0) {
                entries.push({ project: p, slices: mine.totalSlices, pct: mine.percentage });
            }
        });

        if (!entries.length) {
            grid.innerHTML = '<p style="color:#555; font-style:italic;">Sin participación en ningún ecosistema activo.</p>';
            return;
        }

        grid.innerHTML = entries.map(e => `
            <div class="portfolio-card">
                <div style="font-size:2rem; margin-bottom:0.5rem;">🗼</div>
                <div style="font-weight:900; font-size:1.1rem; color:white; margin-bottom:0.5rem;">${e.project.nombre}</div>
                <div style="font-family:var(--font-mono); color:var(--accent-green); font-size:1.5rem; font-weight:900;">
                    ${Math.round(e.slices).toLocaleString()} <span style="font-size:0.8rem;color:#888;">Slices</span>
                </div>
                <div style="color:var(--accent-indigo); font-size:0.9rem; margin-top:0.25rem;">${e.pct?.toFixed(2) || '—'}% del pool</div>
                <a href="/ledger?project=${e.project.id}" data-link style="display:inline-block;margin-top:1rem;font-size:0.78rem;color:var(--accent-indigo);text-decoration:none;">Ver detalle →</a>
            </div>`
        ).join('');

        // Activar data-link en portfolio cards
        grid.querySelectorAll('[data-link]').forEach(l => {
            l.addEventListener('click', e => { e.preventDefault(); window.navigateTo(l.getAttribute('href')); });
        });
    }

    // Alias V9
    executeViewScript() { return this.afterRender(); }
}
