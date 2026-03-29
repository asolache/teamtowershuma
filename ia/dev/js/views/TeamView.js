// =============================================================================
// TEAMTOWERS SOS V10.1 — TEAM VIEW
// Ruta: ia/dev/js/views/TeamView.js
// IDE: Directorio izquierda · Identity Forge derecha
// Taxonomía · Sillas VNA · Skills · 13 Arquetipos · Madurez TDD
// Zero dependencias externas rotas — todo inline
// =============================================================================

import { store }        from '../core/store.js';
import { KB }           from '../core/kb.js';
import { Sidebar }      from '../components/Sidebar.js';
import { BottomNav }    from '../components/BottomNav.js';
import { PageHeader }   from '../components/PageHeader.js';
import { Orchestrator } from '../core/Orchestrator.js';

// ── 13 Arquetipos (Jung + Kin Maya) ──────────────────────────────────────────
const ARCHETYPES = [
    { id: 'innocent',   icon: '🕊️',  label: 'Inocente',    color: '#ffffff' },
    { id: 'explorer',   icon: '🧭',  label: 'Explorador',  color: '#00b0ff' },
    { id: 'sage',       icon: '🦉',  label: 'Sabio',       color: '#6366f1' },
    { id: 'hero',       icon: '⚔️',  label: 'Héroe',       color: '#ff9100' },
    { id: 'outlaw',     icon: '🏴',  label: 'Rebelde',     color: '#ff5252' },
    { id: 'magician',   icon: '✨',  label: 'Mago',        color: '#e040fb' },
    { id: 'lover',      icon: '🔥',  label: 'Amante',      color: '#ff4081' },
    { id: 'jester',     icon: '🃏',  label: 'Bufón',       color: '#ffd740' },
    { id: 'caregiver',  icon: '❤️',  label: 'Cuidador',    color: '#00e676' },
    { id: 'creator',    icon: '🎨',  label: 'Creador',     color: '#69f0ae' },
    { id: 'ruler',      icon: '👑',  label: 'Gobernante',  color: '#ffc400' },
    { id: 'everyman',   icon: '🤝',  label: 'Ciudadano',   color: '#aaa'    },
    { id: 'threshold',  icon: '🌀',  label: 'El Umbral',   color: '#e0e0e0' }  // 13º — Kin Maya
];

// ── Taxonomía de categorías ───────────────────────────────────────────────────
const TAXONOMY = {
    'core.architecture': { icon: '🌌', label: 'Arquitectura & VNA',    color: 'var(--accent-indigo,#6366f1)' },
    'core.economy':      { icon: '⚖️', label: 'Economía & Ledger',     color: 'var(--accent-green,#00e676)'  },
    'core.cognition':    { icon: '🧠', label: 'Cognición & Ontología', color: 'var(--accent-purple,#e040fb)' },
    'core.execution':    { icon: '⚡', label: 'Ejecución & Código',    color: 'var(--accent-orange,#ff9100)' },
    'core.culture':      { icon: '🎭', label: 'Cultura & Caos',        color: 'var(--accent-red,#ff5252)'    },
    'humans':            { icon: '👤', label: 'Humanidad (Biológicos)', color: '#ffffff'                     },
    'uncategorized':     { icon: '🧩', label: 'Agentes Custom',        color: '#888'                        }
};

// ── Niveles de madurez ────────────────────────────────────────────────────────
const MATURITY = {
    draft:       { label: 'Draft',       color: '#555',                      icon: '○' },
    validated:   { label: 'Validado',    color: 'var(--accent-orange)',       icon: '◐' },
    production:  { label: 'Producción',  color: 'var(--accent-green)',        icon: '●' },
    archived:    { label: 'Archivado',   color: '#333',                       icon: '✕' }
};

export default class TeamView {

    constructor() {
        document.title        = 'La Colla | TeamTowers V10.1';
        this.activeProjectId  = null;
        this.activeUserId     = null;   // nodo activo en el forge panel
        this.currentFilter    = 'all';
        this.currentTab       = 'nodos';
        this.skillsCache      = [];
        this.isListCollapsed  = false;
        this.dom              = {};
        this._synthesizing    = false;
    }

    // ══════════════════════════════════════════════════════════════
    //  getHtml
    // ══════════════════════════════════════════════════════════════
    async getHtml() {
        await store.init();
        const state        = store.getState();
        const activeUserId = state.session.activeUserId;

        let activeProjectId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === activeProjectId)
                   || state.projects.find(p => !p.isArchived)
                   || state.projects[0];

        if (!project) return `
            <div class="app-layout">
                ${Sidebar.getHtml('/team')}
                <main class="workspace" style="justify-content:center;align-items:center;display:flex;">
                    <div class="glass-panel" style="text-align:center;max-width:400px;padding:3rem;">
                        <div style="font-size:4rem;margin-bottom:1rem;">👥</div>
                        <h2 style="color:white;margin:0 0 1rem;">Sin Red Asignada</h2>
                        <a href="/create" data-link class="btn-primary" style="text-decoration:none;">➕ Forjar Ecosistema</a>
                    </div>
                </main>
            </div>`;

        this.activeProjectId = project.id;
        const isPO = project.ownerId === activeUserId || state.session.role === 'ecosystem-owner';

        const headerConfig = {
            title:   'La Colla',
            subtitle: project.nombre,
            tagline: 'Padrón Neuronal · Roles VNA · Skills · 13 Arquetipos',
            tabs: [
                { id: 'nodos',       label: `👥 Taxonomía (${(project.usuarios||[]).length})`, active: true  },
                { id: 'sillas',      label: '🪑 Sillas VNA',                                   active: false },
                { id: 'skills',      label: '⚡ Skills KB',                                     active: false }
            ],
            actionHtml: isPO ? `
                <button id="btnNewNode" class="btn-primary" style="font-size:0.82rem;padding:8px 14px;">
                    ➕ Nuevo Nodo
                </button>` : ''
        };

        return `
        <style>
            /* ── Layout IDE ────────────────────────────────── */
            .team-ide { display:flex; flex:1; min-height:0; overflow:hidden; }

            /* ── Panel izquierdo: directorio ───────────────── */
            .team-left { width:300px; min-width:72px; display:flex; flex-direction:column;
                border-right:1px solid var(--glass-border); background:rgba(5,5,8,0.97);
                overflow:hidden; flex-shrink:0; transition:width 0.3s ease; }
            .team-left.collapsed { width:72px; }

            .tl-header { padding:12px; border-bottom:1px solid rgba(255,255,255,0.05);
                display:flex; flex-direction:column; gap:8px; background:rgba(0,0,0,0.3); flex-shrink:0; }
            .tl-top { display:flex; justify-content:space-between; align-items:center; }
            .tl-title { font-size:0.82rem; font-weight:900; color:white; white-space:nowrap; }
            .team-left.collapsed .tl-title,
            .team-left.collapsed .tl-filters,
            .team-left.collapsed .tl-search { display:none; }

            .btn-collapse { background:transparent; border:none; color:#555; cursor:pointer;
                font-size:0.9rem; padding:4px; border-radius:6px; transition:0.2s; }
            .btn-collapse:hover { color:white; background:rgba(255,255,255,0.08); }

            .tl-search { background:rgba(0,0,0,0.4); border:1px solid #222; color:white;
                padding:6px 10px; border-radius:7px; font-size:0.78rem; outline:none;
                width:100%; box-sizing:border-box; }
            .tl-search:focus { border-color:var(--accent-indigo,#6366f1); }

            .tl-filters { display:flex; gap:3px; }
            .tl-filter { flex:1; background:#0a0a0a; border:1px solid #222; color:#555;
                font-size:0.65rem; padding:4px; border-radius:5px; cursor:pointer;
                transition:0.2s; text-align:center; font-weight:bold; }
            .tl-filter.active { background:rgba(224,64,251,0.08); border-color:rgba(224,64,251,0.3);
                color:var(--accent-purple,#e040fb); }

            .tl-list { flex:1; overflow-y:auto; padding:6px; display:flex; flex-direction:column; gap:4px; }

            .node-item { display:flex; align-items:center; gap:9px; padding:8px 9px;
                border-radius:8px; cursor:pointer; transition:0.15s; border:1px solid transparent; }
            .node-item:hover { background:rgba(255,255,255,0.03); border-color:#2a2a2a; }
            .node-item.active { background:rgba(99,102,241,0.1); border-color:rgba(99,102,241,0.3); }
            .team-left.collapsed .node-item { justify-content:center; padding:8px 4px; }

            .node-avatar { width:36px; height:36px; min-width:36px; border-radius:9px;
                display:flex; align-items:center; justify-content:center;
                background:rgba(0,0,0,0.5); border:1px solid #2a2a2a; font-size:1.1rem; }
            .node-info { overflow:hidden; flex:1; min-width:0; }
            .team-left.collapsed .node-info { display:none; }
            .node-name { font-weight:bold; color:white; font-size:0.82rem;
                overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            .node-sub  { font-size:0.62rem; color:#555; font-family:var(--font-mono);
                overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:1px; }
            .maturity-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }

            /* ── Panel central: tabs ───────────────────────── */
            .team-center { flex:1; display:flex; flex-direction:column; overflow:hidden; }
            .tab-content        { display:none; flex:1; overflow-y:auto; padding:1.25rem; }
            .tab-content.active { display:flex; flex-direction:column; gap:1rem; }

            /* Taxonomía */
            .taxo-group { background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.03);
                border-radius:14px; padding:1.25rem; }
            .taxo-header { display:flex; align-items:center; gap:9px; margin-bottom:1rem;
                padding-bottom:8px; border-bottom:1px dashed rgba(255,255,255,0.06); }
            .taxo-title  { font-size:0.9rem; font-weight:900; color:white; text-transform:uppercase;
                letter-spacing:1px; }
            .team-grid   { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
                gap:1rem; }

            .user-card { background:linear-gradient(145deg,rgba(22,22,28,0.8),rgba(12,12,18,0.9));
                border:1px solid rgba(255,255,255,0.05); border-radius:13px; padding:1.25rem;
                display:flex; flex-direction:column; gap:9px; transition:0.25s; cursor:pointer; }
            .user-card:hover { border-color:var(--accent-indigo,#6366f1); transform:translateY(-3px);
                box-shadow:0 8px 20px rgba(99,102,241,0.12); }
            .user-card.is-ai  { border-color:rgba(224,64,251,0.15); }
            .user-card.is-ai:hover { border-color:var(--accent-purple,#e040fb); }

            .uc-top { display:flex; align-items:center; gap:10px; justify-content:space-between; }
            .uc-avatar { width:40px; height:40px; border-radius:50%; flex-shrink:0;
                display:flex; align-items:center; justify-content:center;
                font-size:1rem; font-weight:900; background:rgba(0,0,0,0.5); border:2px solid; }
            .uc-name   { font-weight:900; color:white; font-size:0.88rem; }
            .uc-id     { font-family:var(--font-mono); font-size:0.65rem; color:#555; }
            .uc-slices { font-family:var(--font-mono); font-size:1rem; font-weight:900;
                color:var(--accent-green,#00e676); text-align:right; }
            .uc-slices-lbl { font-size:0.6rem; color:#555; text-transform:uppercase; }

            .skill-pill { font-size:0.62rem; padding:2px 7px; border-radius:4px;
                background:rgba(0,176,255,0.08); color:#00b0ff;
                border:1px solid rgba(0,176,255,0.2); font-family:var(--font-mono); }

            /* Sillas */
            .silla-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:1rem; }
            .silla-card { background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05);
                border-radius:12px; padding:1.1rem; }
            .silla-vacant { border-style:dashed; border-color:rgba(255,145,0,0.3); }

            /* Skills KB */
            .skill-card { background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05);
                border-radius:12px; padding:1rem; cursor:pointer; transition:0.2s; }
            .skill-card:hover { border-color:var(--accent-indigo,#6366f1); }

            /* ── Panel derecho: Identity Forge ─────────────── */
            .team-right { width:340px; min-width:280px; display:flex; flex-direction:column;
                border-left:1px solid var(--glass-border); background:rgba(5,5,8,0.97);
                overflow-y:auto; flex-shrink:0; }
            .forge-empty { flex:1; display:flex; flex-direction:column; align-items:center;
                justify-content:center; color:#333; padding:2rem; text-align:center; }

            /* Forge panel */
            .forge-header { padding:1rem 1.25rem; border-bottom:1px solid rgba(255,255,255,0.05);
                background:rgba(0,0,0,0.3); flex-shrink:0; }
            .forge-avatar { width:56px; height:56px; border-radius:50%; display:flex;
                align-items:center; justify-content:center; font-size:1.5rem; font-weight:900;
                border:3px solid; margin-bottom:8px; }
            .forge-name   { font-size:1rem; font-weight:900; color:white; }
            .forge-id     { font-size:0.68rem; color:#555; font-family:var(--font-mono); }

            .forge-section { padding:0.85rem 1.25rem; border-bottom:1px solid rgba(255,255,255,0.04); }
            .forge-stitle  { font-size:0.65rem; font-weight:900; color:#444; text-transform:uppercase;
                letter-spacing:1.5px; margin-bottom:0.6rem; display:flex; align-items:center;
                justify-content:space-between; }

            .archetype-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:4px; }
            .arch-btn { background:rgba(0,0,0,0.3); border:1px solid #1a1a1a; border-radius:7px;
                padding:5px 3px; cursor:pointer; transition:0.15s; text-align:center; }
            .arch-btn:hover { background:rgba(255,255,255,0.04); }
            .arch-btn.selected { border-color:var(--arch-color,#6366f1); background:rgba(99,102,241,0.08); }
            .arch-icon { font-size:1rem; display:block; }
            .arch-name { font-size:0.55rem; color:#666; display:block; margin-top:2px; }
            .arch-btn.selected .arch-name { color:var(--arch-color,#6366f1); }

            .maturity-row { display:flex; gap:5px; }
            .mat-btn { flex:1; padding:5px; border-radius:6px; border:1px solid #1a1a1a;
                background:rgba(0,0,0,0.3); cursor:pointer; transition:0.15s; text-align:center;
                font-size:0.65rem; color:#555; font-weight:bold; }
            .mat-btn:hover { background:rgba(255,255,255,0.03); }
            .mat-btn.active { border-color:var(--mat-color,#555); color:var(--mat-color,#555);
                background:rgba(255,255,255,0.03); }

            .forge-textarea { width:100%; background:rgba(0,0,0,0.4); border:1px solid #1a1a1a;
                color:#ccc; padding:9px 11px; border-radius:8px; font-family:var(--font-mono);
                font-size:0.76rem; outline:none; resize:vertical; min-height:90px;
                line-height:1.5; box-sizing:border-box; transition:0.2s; }
            .forge-textarea:focus { border-color:rgba(224,64,251,0.3); }

            .skill-select { width:100%; background:rgba(0,0,0,0.4); border:1px solid #1a1a1a;
                color:#888; padding:7px 9px; border-radius:7px; font-size:0.76rem;
                outline:none; cursor:pointer; font-family:var(--font-main); }
            .skill-select:focus { border-color:var(--accent-green,#00e676); color:white; }

            .equipped-skill { display:flex; align-items:center; gap:7px; padding:6px 9px;
                background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05);
                border-radius:7px; margin-bottom:5px; font-size:0.76rem; }
            .equipped-skill span { flex:1; color:#ccc; overflow:hidden;
                text-overflow:ellipsis; white-space:nowrap; }
            .btn-unequip { background:none; border:none; color:#333; cursor:pointer;
                font-size:0.8rem; padding:0; transition:0.2s; }
            .btn-unequip:hover { color:var(--accent-red,#ff5252); }

            .forge-actions { padding:0.85rem 1.25rem; display:flex; flex-direction:column; gap:6px;
                flex-shrink:0; border-top:1px solid rgba(255,255,255,0.05);
                background:rgba(0,0,0,0.2); position:sticky; bottom:0; }
            .forge-btn { padding:8px 14px; border-radius:8px; font-weight:900; font-size:0.78rem;
                cursor:pointer; transition:0.2s; border:none; width:100%; }
            .forge-btn-primary { background:linear-gradient(135deg,rgba(224,64,251,0.7),rgba(99,102,241,0.7));
                color:white; }
            .forge-btn-ghost   { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08)!important;
                color:#777; }
            .forge-btn:hover:not(:disabled) { transform:translateY(-1px); filter:brightness(1.15); }
            .forge-btn:disabled { opacity:0.3; cursor:not-allowed; }

            @keyframes fadeIn { from{opacity:0;}to{opacity:1;} }
            @media (max-width:1200px) { .team-right { display:none; } }
            @media (max-width:900px)  { .team-left  { display:none; } }
        </style>

        <div class="app-layout">
            ${Sidebar.getHtml('/team')}
            <div style="display:flex;flex:1;min-height:0;flex-direction:column;overflow:hidden;">
                <div style="padding:1rem 1.5rem 0;flex-shrink:0;">
                    ${PageHeader.getHtml(headerConfig)}
                </div>
                <div class="team-ide">

                    <!-- PANEL IZQUIERDO: directorio -->
                    <aside class="team-left" id="teamLeft">
                        <div class="tl-header">
                            <div class="tl-top">
                                <span class="tl-title">Directorio</span>
                                <button class="btn-collapse" id="btnCollapseLeft" title="Colapsar">◀</button>
                            </div>
                            <input type="text" id="nodeSearch" class="tl-search" placeholder="🔍 Buscar nodo…">
                            <div class="tl-filters">
                                <button class="tl-filter active" data-f="all">Todos</button>
                                <button class="tl-filter"        data-f="ai">🤖 IA</button>
                                <button class="tl-filter"        data-f="human">👤 Humanos</button>
                            </div>
                        </div>
                        <div class="tl-list" id="nodeList"></div>
                    </aside>

                    <!-- PANEL CENTRAL: tabs -->
                    <main class="team-center">
                        <!-- Tab: Taxonomía -->
                        <div id="tab-nodos" class="tab-content active">
                            <div id="taxonomyContainer"></div>
                        </div>
                        <!-- Tab: Sillas -->
                        <div id="tab-sillas" class="tab-content">
                            <div class="silla-grid" id="sillasContainer"></div>
                        </div>
                        <!-- Tab: Skills KB -->
                        <div id="tab-skills" class="tab-content">
                            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem;" id="skillsContainer"></div>
                        </div>
                    </main>

                    <!-- PANEL DERECHO: Identity Forge -->
                    <aside class="team-right" id="teamRight">
                        <div class="forge-empty" id="forgeEmpty">
                            <div style="font-size:3rem;margin-bottom:0.75rem;opacity:0.3;">⚡</div>
                            <div style="font-size:0.82rem;">Selecciona un nodo para<br>abrir la Forja de Identidad</div>
                        </div>
                        <div id="forgePanel" style="display:none;flex-direction:column;flex:1;"></div>
                    </aside>

                </div>
            </div>
            ${BottomNav.getHtml('/team')}
        </div>`;
    }

    // ══════════════════════════════════════════════════════════════
    //  afterRender
    // ══════════════════════════════════════════════════════════════
    async afterRender() {
        Sidebar.initListeners();
        PageHeader.afterRender((tabId) => {
            this.currentTab = tabId === 'nodos' ? 'nodos' : tabId === 'sillas' ? 'sillas' : 'skills';
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`tab-${this.currentTab}`)?.classList.add('active');
            if (this.currentTab === 'sillas') this._renderSillas();
            if (this.currentTab === 'skills') this._renderSkillsKB();
        });

        const state   = store.getState();
        const project = state.projects.find(p => p.id === this.activeProjectId);
        if (!project) return;

        this.dom = {
            teamLeft:    document.getElementById('teamLeft'),
            nodeList:    document.getElementById('nodeList'),
            nodeSearch:  document.getElementById('nodeSearch'),
            taxoCont:    document.getElementById('taxonomyContainer'),
            forgeEmpty:  document.getElementById('forgeEmpty'),
            forgePanel:  document.getElementById('forgePanel'),
            btnCollapse: document.getElementById('btnCollapseLeft'),
            btnNewNode:  document.getElementById('btnNewNode')
        };

        await KB.init();
        this.skillsCache = await KB.getAllNodes();

        // Render inicial
        this._renderNodeList(state.globalUsers, project);
        this._renderTaxonomy(project, state.globalUsers);

        // Colapsar sidebar izquierdo
        this.dom.btnCollapse?.addEventListener('click', () => {
            this.isListCollapsed = !this.isListCollapsed;
            this.dom.teamLeft.classList.toggle('collapsed', this.isListCollapsed);
            this.dom.btnCollapse.textContent = this.isListCollapsed ? '▶' : '◀';
        });

        // Búsqueda
        this.dom.nodeSearch?.addEventListener('input', e => {
            const q = e.target.value.toLowerCase();
            this._renderNodeList(state.globalUsers.filter(u =>
                u.name?.toLowerCase().includes(q) || u.id?.toLowerCase().includes(q)
            ), project);
        });

        // Filtros
        document.querySelectorAll('.tl-filter').forEach(btn => {
            btn.addEventListener('click', e => {
                document.querySelectorAll('.tl-filter').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentFilter = e.currentTarget.dataset.f;
                let users = state.globalUsers;
                if (this.currentFilter === 'ai')    users = users.filter(u =>  u.profile?.isAi);
                if (this.currentFilter === 'human') users = users.filter(u => !u.profile?.isAi);
                this._renderNodeList(users, project);
            });
        });

        // Nuevo nodo
        this.dom.btnNewNode?.addEventListener('click', () => this._openForge(null, project));

        // Refresh desde LMS
        window.addEventListener('refresh-lms-data', async () => {
            this.skillsCache = await KB.getAllNodes();
            const fresh = store.getState();
            const fp = fresh.projects.find(p => p.id === this.activeProjectId);
            this._renderNodeList(fresh.globalUsers, fp);
            this._renderTaxonomy(fp, fresh.globalUsers);
            if (this.activeUserId) {
                const fu = fresh.globalUsers.find(u => u.id === this.activeUserId);
                if (fu) this._openForge(fu, fp);
            }
        });
    }

    // ══════════════════════════════════════════════════════════════
    //  _renderNodeList — panel izquierdo
    // ══════════════════════════════════════════════════════════════
    _renderNodeList(users, project) {
        if (!this.dom.nodeList) return;
        const projectIds = new Set([
            ...(project.usuarios || []).map(u => u.id),
            project.ownerId
        ].filter(Boolean));

        const list = users.filter(u => projectIds.has(u.id));
        this.dom.nodeList.innerHTML = list.map(u => {
            const isAi      = u.profile?.isAi;
            const color     = isAi ? 'var(--accent-purple,#e040fb)' : 'var(--accent-green,#00e676)';
            const maturity  = u.profile?.maturity || 'draft';
            const matColor  = MATURITY[maturity]?.color || '#555';
            const archetype = ARCHETYPES.find(a => a.id === (u.profile?.guardian || 'everyman'));
            return `
            <div class="node-item ${u.id === this.activeUserId ? 'active' : ''}" data-id="${u.id}">
                <div class="node-avatar" style="border-color:${color};">
                    ${isAi ? '🤖' : (archetype?.icon || '👤')}
                </div>
                <div class="node-info">
                    <div class="node-name">${u.name || u.id}</div>
                    <div class="node-sub">${u.id}</div>
                </div>
                <div class="maturity-dot" style="background:${matColor};" title="${MATURITY[maturity]?.label}"></div>
            </div>`;
        }).join('') || '<div style="color:#333;font-size:0.76rem;padding:1rem;text-align:center;">Sin nodos</div>';

        this.dom.nodeList.querySelectorAll('.node-item').forEach(item => {
            item.addEventListener('click', () => {
                const u = store.getState().globalUsers.find(u => u.id === item.dataset.id);
                const p = store.getState().projects.find(p => p.id === this.activeProjectId);
                if (u && p) this._openForge(u, p);
            });
        });
    }

    // ══════════════════════════════════════════════════════════════
    //  _renderTaxonomy — tab nodos
    // ══════════════════════════════════════════════════════════════
    _renderTaxonomy(project, globalUsers) {
        const container = this.dom.taxoCont;
        if (!container || !project) return;

        const projectIds = new Set([
            ...(project.usuarios || []).map(u => u.id),
            project.ownerId
        ].filter(Boolean));
        const users = globalUsers.filter(u => projectIds.has(u.id));

        // Clasificar
        const groups = {};
        users.forEach(u => {
            let cat = 'humans';
            if (u.profile?.isAi) {
                const skill = this.skillsCache.find(s => u.profile.active_skills?.includes(s.id));
                cat = (skill && TAXONOMY[skill.category]) ? skill.category : 'uncategorized';
            }
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(u);
        });

        container.innerHTML = Object.entries(groups).map(([cat, catUsers]) => {
            if (!catUsers.length) return '';
            const tx = TAXONOMY[cat] || TAXONOMY.uncategorized;
            return `
            <div class="taxo-group">
                <div class="taxo-header">
                    <span style="font-size:1.3rem;">${tx.icon}</span>
                    <span class="taxo-title" style="color:${tx.color};">${tx.label}</span>
                    <span style="color:#444;font-size:0.72rem;font-family:var(--font-mono);margin-left:auto;">${catUsers.length}</span>
                </div>
                <div class="team-grid">
                    ${catUsers.map(u => this._userCardHtml(u, project)).join('')}
                </div>
            </div>`;
        }).join('') || '<div style="color:#333;text-align:center;padding:3rem;font-style:italic;">Sin nodos en este ecosistema.</div>';

        container.querySelectorAll('.user-card').forEach(card => {
            card.addEventListener('click', () => {
                const u = store.getState().globalUsers.find(u => u.id === card.dataset.id);
                const p = store.getState().projects.find(p => p.id === this.activeProjectId);
                if (u && p) this._openForge(u, p);
            });
        });
    }

    _userCardHtml(u, project) {
        const isAi     = u.profile?.isAi;
        const color    = isAi ? 'var(--accent-purple,#e040fb)' : 'var(--accent-green,#00e676)';
        const harvest  = store.calculateHarvest ? store.calculateHarvest(project.id) : [];
        const slices   = harvest.find(h => h.userId === u.id)?.totalSlices || 0;
        const arch     = ARCHETYPES.find(a => a.id === (u.profile?.guardian || 'everyman'));
        const maturity = u.profile?.maturity || 'draft';
        const skills   = (u.profile?.active_skills || []).slice(0, 3).map(sid => {
            const s = this.skillsCache.find(n => n.id === sid);
            return s ? `<span class="skill-pill">⚡ ${(s.title||s.id).substring(0,18)}</span>` : '';
        }).join('');

        return `
        <div class="user-card ${isAi ? 'is-ai' : ''}" data-id="${u.id}">
            <div class="uc-top">
                <div style="display:flex;align-items:center;gap:9px;">
                    <div class="uc-avatar" style="border-color:${color};color:${color};">
                        ${isAi ? '🤖' : (arch?.icon || '👤')}
                    </div>
                    <div>
                        <div class="uc-name">${u.name || u.id}</div>
                        <div class="uc-id">${u.id}</div>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div class="uc-slices">${Math.round(slices).toLocaleString()}</div>
                    <div class="uc-slices-lbl">slices</div>
                    <div style="font-size:0.6rem;color:${MATURITY[maturity]?.color||'#555'};margin-top:2px;">
                        ${MATURITY[maturity]?.icon} ${MATURITY[maturity]?.label}
                    </div>
                </div>
            </div>
            ${skills ? `<div style="display:flex;flex-wrap:wrap;gap:3px;">${skills}</div>` : ''}
        </div>`;
    }

    // ══════════════════════════════════════════════════════════════
    //  _renderSillas — tab sillas
    // ══════════════════════════════════════════════════════════════
    _renderSillas() {
        const container = document.getElementById('sillasContainer');
        const project   = store.getState().projects.find(p => p.id === this.activeProjectId);
        const state     = store.getState();
        if (!container || !project) return;

        const roles = project.roles || [];
        if (!roles.length) {
            container.innerHTML = '<div style="color:#333;font-size:0.85rem;text-align:center;padding:3rem;grid-column:1/-1;">Sin roles definidos. <a href="/map" data-link style="color:var(--accent-indigo);">Mapear VNA →</a></div>';
            return;
        }

        container.innerHTML = roles.map(role => {
            const assigned = (project.usuarios || []).find(u => u.roleId === role.id)
                          || state.globalUsers.find(u => u.id === role.assignee);
            const isVacant = !assigned;
            const levelColors = { '@anxaneta':'var(--accent-red,#ff5252)', '@aixecador':'#ff4081', '@dosos':'var(--accent-purple,#e040fb)', '@baixos':'var(--accent-indigo,#6366f1)', '@pinya':'var(--accent-green,#00e676)' };
            const lColor = levelColors[role.levelId] || '#888';

            return `
            <div class="silla-card ${isVacant ? 'silla-vacant' : ''}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem;">
                    <div>
                        <div style="font-weight:900;color:white;font-size:0.9rem;">${role.name}</div>
                        <div style="font-family:var(--font-mono);font-size:0.65rem;color:${lColor};">${role.levelId}</div>
                    </div>
                    <span style="font-size:0.65rem;padding:2px 7px;border-radius:9px;font-weight:bold;
                        background:${isVacant?'rgba(255,145,0,0.08)':'rgba(0,230,118,0.08)'};
                        color:${isVacant?'var(--accent-orange,#ff9100)':'var(--accent-green,#00e676)'};
                        border:1px solid ${isVacant?'rgba(255,145,0,0.25)':'rgba(0,230,118,0.25)'};">
                        ${isVacant ? 'VACANTE' : 'OCUPADO'}
                    </span>
                </div>
                <div style="display:flex;gap:8px;font-family:var(--font-mono);font-size:0.7rem;color:#666;flex-wrap:wrap;margin-bottom:0.75rem;">
                    <span>€${role.fmv}/h</span>
                    <span>×${role.multiplier}</span>
                    ${role.guardian ? `<span>${ARCHETYPES.find(a=>a.id===role.guardian)?.icon||'🤝'} ${role.guardian}</span>` : ''}
                </div>
                ${assigned
                    ? `<div style="display:flex;align-items:center;gap:8px;background:rgba(0,0,0,0.3);padding:7px 10px;border-radius:7px;">
                           <span>${assigned.profile?.isAi?'🤖':'👤'}</span>
                           <span style="color:white;font-weight:bold;font-size:0.82rem;">${assigned.name||assigned.id}</span>
                       </div>`
                    : `<button data-role="${role.id}" class="btn-assign-silla"
                           style="background:rgba(99,102,241,0.08);border:1px dashed rgba(99,102,241,0.3);
                           color:var(--accent-indigo,#6366f1);padding:7px;border-radius:7px;
                           font-size:0.76rem;font-weight:bold;cursor:pointer;width:100%;">
                           + Asignar Nodo
                       </button>`}
            </div>`;
        }).join('');

        // Links y data-link
        container.querySelectorAll('[data-link]').forEach(l => {
            l.addEventListener('click', e => { e.preventDefault(); window.navigateTo?.(l.getAttribute('href')); });
        });
    }

    // ══════════════════════════════════════════════════════════════
    //  _renderSkillsKB — tab skills
    // ══════════════════════════════════════════════════════════════
    _renderSkillsKB() {
        const container = document.getElementById('skillsContainer');
        if (!container) return;
        const skills = this.skillsCache.filter(n => n.type === 'skill' || n.category === 'skill');
        container.innerHTML = skills.map(s => `
            <div class="skill-card" data-skill="${s.id}">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px;">
                    <span style="font-size:1.1rem;">⚡</span>
                    <div style="font-weight:900;color:white;font-size:0.85rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${s.title||s.id}</div>
                </div>
                <div style="font-size:0.72rem;color:#666;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                    ${s.description||s.content?.substring(0,80)||'—'}
                </div>
                <div style="display:flex;gap:5px;margin-top:8px;flex-wrap:wrap;">
                    ${s.references?.length ? `<span class="skill-pill">📚 ${s.references.length}</span>` : ''}
                    ${s.evals?.length      ? `<span class="skill-pill">📋 ${s.evals.length}</span>` : ''}
                    ${s.projectId === 'global' ? '<span class="skill-pill">🌐 global</span>' : ''}
                </div>
            </div>`).join('')
        || '<div style="color:#333;grid-column:1/-1;text-align:center;padding:2rem;font-size:0.85rem;">Sin skills en KB.</div>';
    }

    // ══════════════════════════════════════════════════════════════
    //  _openForge — panel derecho Identity Forge
    // ══════════════════════════════════════════════════════════════
    async _openForge(user, project) {
        this.activeUserId = user?.id || null;
        const empty  = this.dom.forgeEmpty;
        const panel  = this.dom.forgePanel;
        if (!panel || !empty) return;

        // Actualizar lista
        this._renderNodeList(store.getState().globalUsers, project);

        if (!user) {
            // Modo: crear nuevo nodo
            empty.style.display = 'none';
            panel.style.display = 'flex';
            panel.innerHTML     = this._newNodeFormHtml();
            this._attachNewNodeEvents(panel, project);
            return;
        }

        empty.style.display = 'none';
        panel.style.display = 'flex';
        panel.style.flexDirection = 'column';

        const isAi     = user.profile?.isAi;
        const color    = isAi ? 'var(--accent-purple,#e040fb)' : 'var(--accent-green,#00e676)';
        const arch     = ARCHETYPES.find(a => a.id === (user.profile?.guardian || 'everyman'));
        const maturity = user.profile?.maturity || 'draft';
        const harvest  = store.calculateHarvest ? store.calculateHarvest(project.id) : [];
        const slices   = harvest.find(h => h.userId === user.id)?.totalSlices || 0;

        // Prompt del agente
        let promptContent = '';
        if (isAi) {
            await KB.init();
            const pn = await KB.getNode(`prompt_global_${user.id.replace('@','')}`);
            promptContent = pn?.content || `Eres ${user.id}, agente del Swarm SOS V10.`;
        }

        // Skills equipadas
        const equippedIds = user.profile?.active_skills || [];
        const equippedHtml = equippedIds.map(sid => {
            const s = this.skillsCache.find(n => n.id === sid);
            return s ? `
            <div class="equipped-skill">
                <span>⚡</span>
                <span>${(s.title||s.id).substring(0,28)}</span>
                <button class="btn-unequip" data-sid="${sid}" title="Desequipar">✕</button>
            </div>` : '';
        }).join('');

        // Skill selector (sin las ya equipadas)
        const skillOptions = this.skillsCache
            .filter(n => (n.type === 'skill' || n.category === 'skill') && !equippedIds.includes(n.id))
            .map(s => `<option value="${s.id}">${(s.title||s.id).substring(0,35)}</option>`)
            .join('');

        panel.innerHTML = `
        <div class="forge-header">
            <div style="display:flex;align-items:center;gap:12px;">
                <div class="forge-avatar" style="border-color:${color};color:${color};">
                    ${isAi ? '🤖' : (arch?.icon || '👤')}
                </div>
                <div>
                    <div class="forge-name">${user.name || user.id}</div>
                    <div class="forge-id">${user.id}</div>
                    <div style="font-size:0.65rem;margin-top:2px;color:${MATURITY[maturity]?.color||'#555'};">
                        ${MATURITY[maturity]?.icon} ${MATURITY[maturity]?.label} · ⚡ ${Math.round(slices).toLocaleString()} slices
                    </div>
                </div>
            </div>
        </div>

        <!-- Arquetipo -->
        <div class="forge-section">
            <div class="forge-stitle">🌀 Arquetipo (13)</div>
            <div class="archetype-grid" id="archetypeGrid">
                ${ARCHETYPES.map(a => `
                <div class="arch-btn ${a.id === (user.profile?.guardian||'everyman') ? 'selected' : ''}"
                     data-arch="${a.id}" style="--arch-color:${a.color};">
                    <span class="arch-icon">${a.icon}</span>
                    <span class="arch-name">${a.label}</span>
                </div>`).join('')}
            </div>
        </div>

        <!-- Madurez -->
        <div class="forge-section">
            <div class="forge-stitle">📈 Madurez TDD</div>
            <div class="maturity-row">
                ${Object.entries(MATURITY).map(([k,v]) => `
                <button class="mat-btn ${maturity===k?'active':''}" data-mat="${k}"
                        style="--mat-color:${v.color};">
                    ${v.icon} ${v.label}
                </button>`).join('')}
            </div>
        </div>

        ${isAi ? `
        <!-- System Prompt -->
        <div class="forge-section">
            <div class="forge-stitle">
                🧠 AGENT.md
                <button id="btnSynthPrompt" style="font-size:0.62rem;background:rgba(224,64,251,0.1);
                    border:1px solid rgba(224,64,251,0.3);color:var(--accent-purple,#e040fb);
                    padding:2px 7px;border-radius:5px;cursor:pointer;">✨ Sintetizar</button>
            </div>
            <textarea id="agentPromptArea" class="forge-textarea" rows="6">${promptContent}</textarea>
        </div>

        <!-- Skills -->
        <div class="forge-section">
            <div class="forge-stitle">⚡ Skills equipadas</div>
            <div id="equippedSkills">${equippedHtml || '<div style="color:#333;font-size:0.72rem;font-style:italic;">Sin skills equipadas.</div>'}</div>
            <select id="skillEquipSel" class="skill-select" style="margin-top:8px;">
                <option value="">➕ Equipar skill…</option>
                ${skillOptions}
            </select>
        </div>` : `
        <!-- Nodo humano -->
        <div class="forge-section">
            <div class="forge-stitle">📋 Rol en el proyecto</div>
            <div style="font-size:0.78rem;color:#666;">
                ${(project.roles||[]).find(r=>r.id===(project.usuarios||[]).find(u=>u.id===user.id)?.roleId)?.name || 'Sin rol asignado'}
            </div>
        </div>`}

        <div class="forge-actions">
            <button class="forge-btn forge-btn-primary" id="btnSaveForge">💾 Sellar Identidad</button>
            <button class="forge-btn forge-btn-ghost"   id="btnDeleteNode">✕ Eliminar Nodo</button>
        </div>`;

        this._attachForgeEvents(panel, user, project, isAi);
    }

    _attachForgeEvents(panel, user, project, isAi) {
        // Arquetipo
        panel.querySelectorAll('.arch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                panel.querySelectorAll('.arch-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });

        // Madurez
        panel.querySelectorAll('.mat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                panel.querySelectorAll('.mat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Equipar skill
        panel.querySelector('#skillEquipSel')?.addEventListener('change', async e => {
            const sid = e.target.value;
            if (!sid) return;
            e.target.value = '';
            await this._equipSkill(user, sid);
        });

        // Desequipar skill
        panel.querySelectorAll('.btn-unequip').forEach(btn => {
            btn.addEventListener('click', async () => {
                await this._unequipSkill(user, btn.dataset.sid);
            });
        });

        // Sintetizar prompt con IA
        panel.querySelector('#btnSynthPrompt')?.addEventListener('click', async () => {
            if (this._synthesizing) return;
            this._synthesizing = true;
            const btn = panel.querySelector('#btnSynthPrompt');
            btn.textContent = '⏳…';
            btn.disabled    = true;
            try {
                const area     = panel.querySelector('#agentPromptArea');
                const skills   = (user.profile?.active_skills || []);
                let skillCtx   = '';
                for (const sid of skills) {
                    const sn = this.skillsCache.find(n => n.id === sid);
                    if (sn) skillCtx += `\n🔹 ${sn.title}: ${sn.description || sn.content?.substring(0,120) || ''}`;
                }
                const response = await Orchestrator.callLLM({
                    preferredEngine: 'anthropic',
                    systemPrompt: `Eres @agent_prompt_synthesizer. Genera un AGENT.md optimizado para el agente ${user.id} con las skills indicadas. Devuelve SOLO el texto del system prompt, sin JSON ni markdown extra.`,
                    userPrompt:   `Prompt actual:\n${area?.value || ''}\n\nSkills equipadas:${skillCtx || ' ninguna'}`,
                    responseFormat: 'text',
                    temperature: 0.3
                });
                if (area && typeof response.content === 'string') area.value = response.content;
            } catch (err) {
                alert('Error síntesis: ' + err.message);
            } finally {
                this._synthesizing = false;
                btn.textContent = '✨ Sintetizar';
                btn.disabled    = false;
            }
        });

        // Guardar identidad
        panel.querySelector('#btnSaveForge')?.addEventListener('click', async () => {
            const selectedArch    = panel.querySelector('.arch-btn.selected')?.dataset.arch || user.profile?.guardian || 'everyman';
            const selectedMaturity = panel.querySelector('.mat-btn.active')?.dataset.mat    || user.profile?.maturity || 'draft';
            const promptContent   = panel.querySelector('#agentPromptArea')?.value?.trim();

            const updatedUser = {
                ...user,
                profile: { ...user.profile, guardian: selectedArch, maturity: selectedMaturity }
            };
            await store.dispatch({ type: 'UPDATE_USER', payload: updatedUser });

            if (isAi && promptContent) {
                await KB.init();
                const promptId = `prompt_global_${user.id.replace('@','')}`;
                let pn = await KB.getNode(promptId);
                if (!pn) pn = { id: promptId, type:'prompt_a2a', category:'meta_prompt', projectId:'global', targetId: user.id, title:`AGENT.md: ${user.name}`, dependencies: user.profile?.active_skills||[], keywords:['ai_agent'] };
                pn.content = promptContent;
                await KB.saveNode(pn);
            }

            const btn = panel.querySelector('#btnSaveForge');
            btn.textContent = '✅ Sellado';
            setTimeout(() => { btn.textContent = '💾 Sellar Identidad'; }, 1500);
            window.dispatchEvent(new CustomEvent('refresh-lms-data'));
        });

        // Eliminar nodo
        panel.querySelector('#btnDeleteNode')?.addEventListener('click', async () => {
            if (!confirm(`¿Eliminar ${user.name || user.id} del Swarm?`)) return;
            await store.dispatch({ type:'REMOVE_USER', payload:{ id: user.id } });
            this.activeUserId = null;
            this.dom.forgeEmpty.style.display = 'flex';
            this.dom.forgePanel.style.display  = 'none';
            window.dispatchEvent(new CustomEvent('refresh-lms-data'));
        });
    }

    async _equipSkill(user, skillId) {
        const skills = [...(user.profile?.active_skills || [])];
        if (skills.includes(skillId)) return;
        skills.push(skillId);
        const updated = { ...user, profile: { ...user.profile, active_skills: skills } };
        await store.dispatch({ type:'UPDATE_USER', payload: updated });
        await KB.init();
        const pn = await KB.getNode(`prompt_global_${user.id.replace('@','')}`);
        if (pn) { pn.dependencies = skills; await KB.saveNode(pn); }
        window.dispatchEvent(new CustomEvent('refresh-lms-data'));
    }

    async _unequipSkill(user, skillId) {
        const skills = (user.profile?.active_skills || []).filter(s => s !== skillId);
        const updated = { ...user, profile: { ...user.profile, active_skills: skills } };
        await store.dispatch({ type:'UPDATE_USER', payload: updated });
        window.dispatchEvent(new CustomEvent('refresh-lms-data'));
    }

    // ── Formulario nuevo nodo ─────────────────────────────────────
    _newNodeFormHtml() {
        const archOptions = ARCHETYPES.map(a =>
            `<option value="${a.id}">${a.icon} ${a.label}</option>`
        ).join('');
        return `
        <div class="forge-header">
            <div class="forge-name">Nuevo Nodo</div>
            <div class="forge-id">Forja de Identidad</div>
        </div>
        <div class="forge-section">
            <div class="forge-stitle">Nombre</div>
            <input id="newNodeName" class="forge-textarea" style="min-height:auto;resize:none;padding:8px 10px;font-family:var(--font-main);" placeholder="Nombre del nodo…">
        </div>
        <div class="forge-section">
            <div class="forge-stitle">ID (@alias)</div>
            <input id="newNodeId" class="forge-textarea" style="min-height:auto;resize:none;padding:8px 10px;font-family:var(--font-mono);" placeholder="@agent_nombre">
        </div>
        <div class="forge-section">
            <div class="forge-stitle">Tipo</div>
            <div style="display:flex;gap:8px;">
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.78rem;color:#ccc;">
                    <input type="radio" name="nodeType" value="ai" checked style="accent-color:var(--accent-purple,#e040fb);"> 🤖 Agente IA
                </label>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.78rem;color:#ccc;">
                    <input type="radio" name="nodeType" value="human"> 👤 Humano
                </label>
            </div>
        </div>
        <div class="forge-section">
            <div class="forge-stitle">Arquetipo</div>
            <select id="newNodeArch" class="skill-select">${archOptions}</select>
        </div>
        <div class="forge-actions">
            <button class="forge-btn forge-btn-primary" id="btnCreateNode">✨ Instanciar Nodo</button>
        </div>`;
    }

    _attachNewNodeEvents(panel, project) {
        panel.querySelector('#btnCreateNode')?.addEventListener('click', async () => {
            const name  = panel.querySelector('#newNodeName')?.value.trim();
            const id    = panel.querySelector('#newNodeId')?.value.trim();
            const type  = panel.querySelector('[name="nodeType"]:checked')?.value || 'ai';
            const arch  = panel.querySelector('#newNodeArch')?.value || 'everyman';
            if (!name || !id) { alert('Nombre e ID son obligatorios.'); return; }

            const newUser = {
                id, name,
                globalRole: type === 'ai' ? 'ai-agent' : 'network-user',
                profile: { isAi: type === 'ai', guardian: arch, maturity: 'draft',
                    preferredEngine: 'anthropic', active_skills: [] }
            };
            await store.dispatch({ type:'ADD_USER', payload: newUser });
            await store.dispatch({ type:'UPDATE_PROJECT_INFO', payload:{
                projectId: project.id,
                updates: { usuarios: [...(project.usuarios||[]), { id }] }
            }});
            window.dispatchEvent(new CustomEvent('refresh-lms-data'));
            const fresh = store.getState();
            const fp = fresh.projects.find(p => p.id === this.activeProjectId);
            const fu = fresh.globalUsers.find(u => u.id === id);
            if (fu && fp) this._openForge(fu, fp);
        });
    }

    executeViewScript() { return this.afterRender(); }
}
