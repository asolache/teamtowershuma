// =============================================================================
// TEAMTOWERS SOS V10 — LMS VIEW
// Ruta: ia/dev/js/views/LmsView.js
// La Forja · Cerebro LMS · Meta-Grafo WebGL · Skill Antigravity
// =============================================================================

import { store }            from '../core/store.js';
import { KB }               from '../core/kb.js';
import { Sidebar }          from '../components/Sidebar.js';
import { BottomNav }        from '../components/BottomNav.js';
import { PageHeader }       from '../components/PageHeader.js';
import { SynapticCanvas }   from '../components/SynapticCanvas.js';
import { Orchestrator }     from '../core/Orchestrator.js';
import { SkillAntigravity } from '../core/SkillAntigravity.js';
// SkillExplorer y SkillForgeModal se importan dinámicamente en afterRender
// para aislar errores de componentes externos

export default class LmsView {

    constructor() {
        document.title        = 'La Forja LMS | TeamTowers V10';
        this.currentTab       = 'list';
        this.synapticInstance = null;
        this.skillExplorer    = null;
        this.skillForgeModal  = null;
        this.dom              = {};
        this._ac              = new AbortController(); // limpia listeners al navegar
    }

    async getHtml() {
        await store.init();

        const headerConfig = {
            title:    'La Forja (Cerebro LMS)',
            subtitle: 'Conocimiento W3C & Meta-Grafo',
            tagline:  'Explora la memoria, forja habilidades, testea el Córtex (CI/CD) y orquesta Agentes.',
            tabs: [
                { id: 'list',        label: '🎒 Biblioteca de Skills',  active: this.currentTab === 'list'        },
                { id: 'antigravity', label: '⚡ Antigravity',            active: this.currentTab === 'antigravity' },
                { id: 'graph',       label: '🌌 Córtex 3D',              active: this.currentTab === 'graph'       }
            ],
            magicActions: [
                { id: 'research', icon: '🔭', label: 'Deep Research (Minar Web)', tokens: 800 },
                { id: 'scout',    icon: '🕵️', label: 'Scout Skills Externas',    tokens: 200 },
                { id: 'inject',   icon: '💉', label: 'Inyectar Semillas Antigravity', tokens: 0 }
            ]
        };

        return `
        <style>
            .app-layout    { display:flex; height:100dvh; width:100vw; overflow:hidden; background:var(--bg-dark); }
            .workspace-lms {
                flex:1; display:flex; flex-direction:column;
                padding:2rem 3rem; overflow-y:auto; overflow-x:hidden;
                background:radial-gradient(circle at top, #0d0d14 0%, #050507 100%);
                box-sizing:border-box;
            }

            .lms-tab-content        { display:none; flex:1; flex-direction:column; animation:fadeIn 0.3s ease; }
            .lms-tab-content.active { display:flex; }
            .lms-tab-content.graph-active { height:calc(100dvh - 180px); }

            #synapticMountPoint { width:100%; flex:1; min-height:500px; border-radius:18px; overflow:hidden; }

            /* ── Antigravity tab ───────────────────────────────── */
            .ag-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:1rem; padding-bottom:3rem; }

            .ag-card { background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05);
                border-radius:14px; padding:1.25rem; display:flex; flex-direction:column; gap:10px;
                transition:0.2s; }
            .ag-card:hover { border-color:rgba(224,64,251,0.3); }
            .ag-card.has-ag { border-color:rgba(224,64,251,0.2); background:rgba(224,64,251,0.03); }

            .ag-title { font-weight:900; color:white; font-size:0.9rem;
                overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            .ag-desc  { font-size:0.75rem; color:#666; line-height:1.4;
                display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

            .ag-meta  { display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
            .ag-badge { font-size:0.62rem; padding:2px 7px; border-radius:4px;
                font-family:var(--font-mono); font-weight:bold; }
            .ag-badge-human { background:rgba(255,215,64,0.1); color:#ffd740;
                border:1px solid rgba(255,215,64,0.2); }
            .ag-badge-ag    { background:rgba(224,64,251,0.1); color:#e040fb;
                border:1px solid rgba(224,64,251,0.2); }
            .ag-badge-pct   { background:rgba(0,230,118,0.08); color:#00e676;
                border:1px solid rgba(0,230,118,0.2); }

            .ag-compression { height:3px; background:rgba(255,255,255,0.05);
                border-radius:2px; overflow:hidden; }
            .ag-compression-bar { height:100%; border-radius:2px;
                background:linear-gradient(90deg,#e040fb,#6366f1); transition:width 0.5s; }

            .ag-mission { font-size:0.75rem; color:#aaa; font-style:italic;
                background:rgba(0,0,0,0.3); padding:7px 10px; border-radius:7px;
                border-left:2px solid rgba(224,64,251,0.4); }

            .ag-socs { display:flex; flex-direction:column; gap:4px; }
            .ag-soc  { font-size:0.7rem; color:#888; display:flex; gap:6px; align-items:flex-start; }
            .ag-soc::before { content:'✓'; color:rgba(0,230,118,0.5); flex-shrink:0; }

            .btn-compile { width:100%; padding:8px; border-radius:8px; font-weight:900;
                font-size:0.76rem; cursor:pointer; border:none; transition:0.2s; }
            .btn-compile-pending { background:rgba(224,64,251,0.1);
                border:1px solid rgba(224,64,251,0.3); color:#e040fb; }
            .btn-compile-pending:hover { background:rgba(224,64,251,0.2); }
            .btn-compile-done    { background:rgba(0,0,0,0.2);
                border:1px solid rgba(255,255,255,0.05); color:#444; cursor:default; }

            .ag-prompt-box { background:rgba(0,0,0,0.5); border:1px solid #1a1a1a;
                border-radius:8px; padding:10px; font-family:var(--font-mono);
                font-size:0.68rem; color:#888; line-height:1.5; white-space:pre-wrap;
                max-height:120px; overflow-y:auto; display:none; }
            .ag-prompt-box.visible { display:block; }

            .ag-toolbar { display:flex; gap:8px; margin-bottom:1.25rem; align-items:center;
                flex-wrap:wrap; }
            .ag-filter-btn { padding:5px 12px; border-radius:6px; font-size:0.72rem;
                font-weight:bold; cursor:pointer; border:1px solid #1a1a1a;
                background:transparent; color:#555; transition:0.15s; }
            .ag-filter-btn.active { background:rgba(224,64,251,0.1);
                border-color:rgba(224,64,251,0.3); color:#e040fb; }
            .ag-compile-all { padding:7px 16px; border-radius:8px; font-size:0.76rem;
                font-weight:900; cursor:pointer; border:none; transition:0.2s;
                background:linear-gradient(135deg,rgba(224,64,251,0.6),rgba(99,102,241,0.6));
                color:white; margin-left:auto; }
            .ag-compile-all:hover { filter:brightness(1.2); }
            .ag-compile-all:disabled { opacity:0.4; cursor:not-allowed; }

            /* Research Modal */
            .lms-modal-overlay { position:fixed; inset:0; background:rgba(5,5,8,0.85);
                backdrop-filter:blur(10px); z-index:6000; display:none;
                justify-content:center; align-items:center; }
            .lms-modal-overlay.active { display:flex; }
            .lms-modal-card { background:linear-gradient(145deg,rgba(20,20,25,0.97),rgba(10,10,15,0.99));
                border:1px solid var(--accent-indigo,#6366f1); border-radius:18px;
                width:100%; max-width:580px; padding:2rem;
                box-shadow:0 20px 50px rgba(0,0,0,0.9); max-height:90vh; overflow-y:auto; }
            .lms-modal-header { display:flex; justify-content:space-between; align-items:center;
                margin-bottom:1.5rem; border-bottom:1px dashed #333; padding-bottom:1rem; }
            .lms-modal-header h2 { margin:0; color:white; font-size:1.3rem; font-weight:900; }

            @keyframes fadeIn { from{opacity:0;}to{opacity:1;} }
            @media (max-width:768px) { .workspace-lms { padding:90px 1rem 120px 1rem; } }
        </style>

        <div class="app-layout">
            ${Sidebar.getHtml('/lms')}

            <main class="workspace-lms">
                ${PageHeader.getHtml(headerConfig)}

                <!-- TAB: BIBLIOTECA -->
                <div id="lms-tab-list" class="lms-tab-content ${this.currentTab === 'list' ? 'active' : ''}">
                    <div id="mount-skill-explorer"></div>
                </div>

                <!-- TAB: ANTIGRAVITY ──────────────────────────── -->
                <div id="lms-tab-antigravity" class="lms-tab-content ${this.currentTab === 'antigravity' ? 'active' : ''}">
                    <div class="ag-toolbar">
                        <button class="ag-filter-btn active" data-agf="all">Todas</button>
                        <button class="ag-filter-btn" data-agf="compiled">⚡ Compiladas</button>
                        <button class="ag-filter-btn" data-agf="pending">○ Pendientes</button>
                        <button class="ag-compile-all" id="btnCompileAll">⚡ Compilar todas</button>
                    </div>
                    <div class="ag-grid" id="agGrid">
                        <div style="color:#444;font-size:0.82rem;text-align:center;padding:3rem;grid-column:1/-1;">
                            Cargando skills…
                        </div>
                    </div>
                </div>

                <!-- TAB: CÓRTEX 3D -->
                <div id="lms-tab-graph" class="lms-tab-content ${this.currentTab === 'graph' ? 'active graph-active' : ''}">
                    <div id="synapticMountPoint" style="color:#888;padding:2rem;text-align:center;">
                        Activa la pestaña Córtex 3D para inicializar el motor WebGL.
                    </div>
                </div>

                <div id="mount-forge-modal"></div>
            </main>

            ${BottomNav.getHtml('/lms')}
        </div>

        <!-- Scout Modal -->
        <div class="lms-modal-overlay" id="scoutModal">
            <div class="lms-modal-card">
                <div class="lms-modal-header">
                    <h2>🕵️ Scout Skills Externas</h2>
                    <button id="btnCloseScout" style="background:transparent;border:none;color:#888;font-size:1.4rem;cursor:pointer;">✖</button>
                </div>
                <div style="margin-bottom:12px;">
                    <label style="font-size:0.75rem;color:#888;text-transform:uppercase;font-weight:bold;display:block;margin-bottom:6px;">Dominio a explorar</label>
                    <input type="text" id="inpScoutDomain" class="lux-input" placeholder="Ej: Value Network Analysis, TDD, Agentes IA…">
                </div>
                <div style="margin-bottom:12px;">
                    <label style="font-size:0.75rem;color:#888;text-transform:uppercase;font-weight:bold;display:block;margin-bottom:6px;">Contexto adicional (opcional)</label>
                    <textarea id="inpScoutContext" class="lux-input" rows="3" style="resize:vertical;" placeholder="Describe el proyecto o los gaps que quieres cubrir…"></textarea>
                </div>
                <div id="scoutResults" style="display:none;margin-bottom:14px;"></div>
                <button id="btnRunScout" style="background:linear-gradient(135deg,rgba(0,176,255,0.7),rgba(99,102,241,0.7));color:white;border:none;padding:12px;border-radius:10px;font-weight:900;cursor:pointer;width:100%;font-size:0.9rem;">
                    🕵️ Explorar Skills Externas
                </button>
            </div>
        </div>
        <div class="lms-modal-overlay" id="researchModal">
            <div class="lms-modal-card">
                <div class="lms-modal-header">
                    <h2>🔭 Deep Research — Minar la Web</h2>
                    <button id="btnCloseResearch" style="background:transparent;border:none;color:#888;font-size:1.4rem;cursor:pointer;">✖</button>
                </div>
                <div style="margin-bottom:14px;">
                    <label style="font-size:0.75rem;color:#888;text-transform:uppercase;font-weight:bold;display:block;margin-bottom:6px;">Tema a Investigar</label>
                    <input type="text" id="inpResearchTopic" class="lux-input"
                           placeholder="Ej: Value Network Analysis aplicada a startups DAO…">
                </div>
                <div style="margin-bottom:14px;">
                    <label style="font-size:0.75rem;color:#888;text-transform:uppercase;font-weight:bold;display:block;margin-bottom:6px;">Categoría de Destino</label>
                    <select id="inpResearchCat" class="lux-input">
                        <option value="core.architecture">🌌 Arquitectura & VNA</option>
                        <option value="core.economy">⚖️ Economía & Ledger</option>
                        <option value="core.cognition">🧠 Cognición & Ontología</option>
                        <option value="core.execution">⚡ Ejecución & Código</option>
                        <option value="skill">🎒 Skill General</option>
                    </select>
                </div>
                <div style="margin-bottom:14px;">
                    <label style="font-size:0.75rem;color:#888;text-transform:uppercase;font-weight:bold;display:block;margin-bottom:6px;">Motor IA</label>
                    <select id="inpResearchEngine" class="lux-input" style="color:var(--accent-indigo,#6366f1);font-weight:bold;">
                        <option value="anthropic">Anthropic (Claude) — Primario V10</option>
                        <option value="openai">OpenAI (GPT-4o)</option>
                        <option value="deepseek">DeepSeek (Coder)</option>
                        <option value="gemini">Google Gemini</option>
                    </select>
                </div>
                <button id="btnRunResearch"
                        style="background:linear-gradient(135deg,var(--accent-indigo,#6366f1),var(--accent-purple,#e040fb));
                               color:white;border:none;padding:14px;border-radius:12px;font-weight:900;
                               cursor:pointer;width:100%;font-size:1rem;">
                    🚀 Iniciar Minado Neuronal
                </button>
            </div>
        </div>`;
    }

    async executeViewScript() { return this.afterRender(); }

    async afterRender() {
        Sidebar.initListeners();
        PageHeader.afterRender(
            async (tabId) => {
                this.currentTab = tabId;
                document.querySelectorAll('.lms-tab-content').forEach(c => c.classList.remove('active','graph-active'));
                const target = document.getElementById(`lms-tab-${tabId}`);
                if (target) {
                    target.classList.add('active');
                    if (tabId === 'graph') target.classList.add('graph-active');
                }
                if (tabId === 'antigravity') await this._renderAntigravityTab();
                if (tabId === 'graph' && !this.synapticInstance) {
                    const mount = document.getElementById('synapticMountPoint');
                    if (mount) {
                        mount.innerHTML = '<div style="color:#888;padding:2rem;text-align:center;">Iniciando Motor WebGL 3D…</div>';
                        this.synapticInstance = new SynapticCanvas(mount, null);
                        await this.synapticInstance.render();
                    }
                }
            },
            async (actionId) => {
                if (actionId === 'research') {
                    document.getElementById('researchModal')?.classList.add('active');
                } else if (actionId === 'scout') {
                    document.getElementById('scoutModal')?.classList.add('active');
                } else if (actionId === 'inject') {
                    try {
                        const { CoreSeed } = await import('../core/seed.js');
                        await KB.init();
                        if (CoreSeed?.inject) {
                            await KB.deleteNode('skill_vna_architect').catch(() => {});
                            await CoreSeed.inject(KB);
                        }
                        window.dispatchEvent(new CustomEvent('refresh-lms-data'));
                        alert('✅ Semillas Antigravity inyectadas.');
                    } catch (e) { alert('Error: ' + e.message); }
                }
            }
        );

        // Forge Modal — import dinámico para aislar errores
        try {
            const { SkillForgeModal } = await import('../components/SkillForgeModal.js');
            this.skillForgeModal = new SkillForgeModal('mount-forge-modal');
            await this.skillForgeModal.render();
        } catch(_) { /* componente no disponible */ }

        // Skill Explorer — import dinámico para aislar errores
        try {
            const { SkillExplorer } = await import('../components/SkillExplorer.js');
            this.skillExplorer = new SkillExplorer('mount-skill-explorer');
            await this.skillExplorer.render();
        } catch(_) { /* componente no disponible */ }

        this.dom = {
            researchModal:     document.getElementById('researchModal'),
            btnCloseResearch:  document.getElementById('btnCloseResearch'),
            btnRunResearch:    document.getElementById('btnRunResearch'),
            inpResearchTopic:  document.getElementById('inpResearchTopic'),
            inpResearchCat:    document.getElementById('inpResearchCat'),
            inpResearchEngine: document.getElementById('inpResearchEngine'),
            agGrid:            document.getElementById('agGrid'),
            btnCompileAll:     document.getElementById('btnCompileAll'),
            scoutModal:        document.getElementById('scoutModal'),
            btnCloseScout:     document.getElementById('btnCloseScout'),
            btnRunScout:       document.getElementById('btnRunScout'),
            inpScoutDomain:    document.getElementById('inpScoutDomain'),
            inpScoutContext:   document.getElementById('inpScoutContext'),
            scoutResults:      document.getElementById('scoutResults'),
        };

        // Scout eventos
        this.dom.btnCloseScout?.addEventListener('click', () => this.dom.scoutModal?.classList.remove('active'));
        this.dom.btnRunScout?.addEventListener('click', () => this._runSkillScout());

        // Filtros Antigravity
        document.querySelectorAll('.ag-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ag-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this._filterAgGrid(btn.dataset.agf);
            });
        });

        // Compilar todas
        this.dom.btnCompileAll?.addEventListener('click', async () => {
            this.dom.btnCompileAll.disabled  = true;
            this.dom.btnCompileAll.innerText = '⏳ Compilando…';
            await this._compileAllPending();
            this.dom.btnCompileAll.disabled  = false;
            this.dom.btnCompileAll.innerText = '⚡ Compilar todas';
        });

        // Research
        this.dom.btnCloseResearch?.addEventListener('click', () => this.dom.researchModal?.classList.remove('active'));
        this.dom.btnRunResearch?.addEventListener('click', () => this._runDeepResearch());

        // Eventos globales
        const sig = { signal: this._ac.signal };

        window.addEventListener('refresh-lms-data', async () => {
            if (this.skillExplorer) await this.skillExplorer.loadData?.();
            if (this.currentTab === 'antigravity') await this._renderAntigravityTab();
            if (this.synapticInstance) {
                await this.synapticInstance.loadInitialData();
                if (this.synapticInstance.graph3D)
                    this.synapticInstance.graph3D.graphData({ nodes: this.synapticInstance.nodes, links: this.synapticInstance.links });
            }
        }, sig);

        window.addEventListener('process-skill-file', async (e) => {
            if (this.skillForgeModal) {
                await this.skillForgeModal.parseZipSkillFile?.(e.detail.file, e.detail.dropzone);
                window.dispatchEvent(new CustomEvent('refresh-lms-data'));
            }
        }, sig);

        window.addEventListener('open-research-modal', () => this.dom.researchModal?.classList.add('active'), sig);

        window.addEventListener('3d-equip-skill', async (e) => {
            const { agentId, skillId } = e.detail;
            try {
                await KB.init();
                const state = store.getState();
                const user  = state.globalUsers.find(u => u.id === agentId);
                if (!user?.profile) throw new Error('Agente no encontrado.');
                if (!user.profile.active_skills) user.profile.active_skills = [];
                if (!user.profile.active_skills.includes(skillId)) {
                    user.profile.active_skills.push(skillId);
                    await store.dispatch({ type: 'UPDATE_USER', payload: user });
                }
                alert(`✅ Skill equipada a ${agentId}`);
                window.dispatchEvent(new CustomEvent('refresh-lms-data'));
            } catch (err) { alert('Error equipando Skill: ' + err.message); }
        }, sig);
    }

    // ══════════════════════════════════════════════════════════════
    //  _renderAntigravityTab — renderiza la pestaña AG
    // ══════════════════════════════════════════════════════════════
    async _renderAntigravityTab() {
        const grid = this.dom.agGrid || document.getElementById('agGrid');
        if (!grid) return;

        grid.innerHTML = '<div style="color:#444;font-size:0.78rem;text-align:center;padding:2rem;grid-column:1/-1;">Cargando…</div>';

        await KB.init();
        const all    = await KB.getAllNodes();
        const skills = all.filter(n => n.type === 'skill' || n.category === 'skill');
        const agMap  = {};
        all.filter(n => n.type === 'skill_antigravity').forEach(ag => { agMap[ag.sourceId] = ag; });

        this._agSkills = skills;
        this._agMap    = agMap;

        if (!skills.length) {
            grid.innerHTML = '<div style="color:#444;font-size:0.82rem;text-align:center;padding:3rem;grid-column:1/-1;">Sin skills en KB. Usa Deep Research o inyecta semillas.</div>';
            return;
        }

        grid.innerHTML = skills.map(s => this._skillAgCardHtml(s, agMap[s.id])).join('');
        this._attachAgCardEvents(grid, skills, agMap);
    }

    // ── Card HTML ─────────────────────────────────────────────────
    _skillAgCardHtml(skill, agNode) {
        const hasAg = !!agNode;
        const pct   = hasAg ? Math.round((1 - agNode.compression) * 100) : 0;
        const tokens = hasAg ? agNode.tokenCount : '—';

        const socHtml = hasAg && agNode.socs?.length
            ? agNode.socs.slice(0,3).map(s => `<div class="ag-soc">${s}</div>`).join('')
            : '';

        return `
        <div class="ag-card ${hasAg ? 'has-ag' : ''}" data-skill-id="${skill.id}">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
                <div class="ag-title">${skill.title || skill.id}</div>
                <div style="display:flex;gap:4px;flex-shrink:0;">
                    <span class="ag-badge ag-badge-human">👤 ${Math.round((typeof skill.content === 'string' ? skill.content.length : 200) / 4)}t</span>
                    ${hasAg ? `<span class="ag-badge ag-badge-ag">⚡ ${tokens}t</span>` : ''}
                </div>
            </div>

            <div class="ag-desc">${skill.description || ''}</div>

            ${hasAg ? `
            <div class="ag-compression">
                <div class="ag-compression-bar" style="width:${100 - pct}%;"></div>
            </div>
            <div style="font-size:0.65rem;color:#444;text-align:right;">
                ${pct}% menos tokens · ratio ${agNode.compression?.toFixed(2)}
            </div>` : ''}

            ${hasAg && agNode.mission ? `<div class="ag-mission">${agNode.mission}</div>` : ''}
            ${hasAg && socHtml ? `<div class="ag-socs">${socHtml}</div>` : ''}

            ${hasAg ? `
            <div style="display:flex;gap:6px;">
                <button class="btn-compile btn-compile-done" disabled>✅ Compilada</button>
                <button class="btn-show-prompt" data-ag-id="${agNode.id}"
                    style="flex-shrink:0;padding:7px 10px;border-radius:7px;border:1px solid #1a1a1a;
                    background:rgba(0,0,0,0.3);color:#555;cursor:pointer;font-size:0.7rem;transition:0.2s;"
                    title="Ver prompt AG">👁</button>
            </div>
            <div class="ag-prompt-box" data-prompt-for="${agNode.id}"></div>
            ` : `
            <button class="btn-compile btn-compile-pending" data-skill-id="${skill.id}">
                ⚡ Compilar versión Antigravity
            </button>`}
        </div>`;
    }

    // ── Eventos de cards ──────────────────────────────────────────
    _attachAgCardEvents(grid, skills, agMap) {
        // Compilar skill individual
        grid.querySelectorAll('.btn-compile-pending').forEach(btn => {
            btn.addEventListener('click', async () => {
                const skillId = btn.dataset.skillId;
                btn.disabled  = true;
                btn.innerText = '⏳ Compilando…';
                try {
                    const agNode = await SkillAntigravity.compile(skillId);
                    agMap[skillId] = agNode;
                    // Rerender la card
                    const card = btn.closest('.ag-card');
                    const skill = skills.find(s => s.id === skillId);
                    if (card && skill) {
                        card.outerHTML = this._skillAgCardHtml(skill, agNode);
                        // Re-attach en el nuevo elemento
                        const newCard = grid.querySelector(`[data-skill-id="${skillId}"]`);
                        if (newCard) this._attachSingleCardEvents(newCard, agNode);
                    }
                } catch (err) {
                    btn.disabled  = false;
                    btn.innerText = '⚡ Compilar versión Antigravity';
                    alert('Error compilando: ' + err.message);
                }
            });
        });

        // Ver prompt AG
        grid.querySelectorAll('.btn-show-prompt').forEach(btn => {
            const agId = btn.dataset.agId;
            const ag   = Object.values(agMap).find(a => a.id === agId);
            btn.addEventListener('click', () => {
                const box = grid.querySelector(`[data-prompt-for="${agId}"]`);
                if (!box) return;
                const isVisible = box.classList.contains('visible');
                if (!isVisible && ag) {
                    box.textContent = SkillAntigravity.buildPromptForAgent(ag);
                    box.classList.add('visible');
                    btn.style.color = '#e040fb';
                } else {
                    box.classList.remove('visible');
                    btn.style.color = '#555';
                }
            });
        });
    }

    _attachSingleCardEvents(card, agNode) {
        card.querySelector('.btn-show-prompt')?.addEventListener('click', () => {
            const box = card.querySelector('.ag-prompt-box');
            if (!box) return;
            const isVisible = box.classList.contains('visible');
            if (!isVisible) {
                box.textContent = SkillAntigravity.buildPromptForAgent(agNode);
                box.classList.add('visible');
            } else { box.classList.remove('visible'); }
        });
    }

    // ── Filtro ────────────────────────────────────────────────────
    _filterAgGrid(filter) {
        const grid = document.getElementById('agGrid');
        if (!grid) return;
        grid.querySelectorAll('.ag-card').forEach(card => {
            const hasAg = card.classList.contains('has-ag');
            card.style.display =
                filter === 'all'      ? 'flex' :
                filter === 'compiled' ? (hasAg  ? 'flex' : 'none') :
                filter === 'pending'  ? (!hasAg ? 'flex' : 'none') : 'flex';
        });
    }

    // ── Compilar todas las pendientes ─────────────────────────────
    async _compileAllPending() {
        await KB.init();
        const all    = await KB.getAllNodes();
        const skills = all.filter(n => n.type === 'skill' || n.category === 'skill');
        const agIds  = new Set(all.filter(n => n.type === 'skill_antigravity').map(n => n.sourceId));
        const pending = skills.filter(s => !agIds.has(s.id));

        for (const skill of pending) {
            try { await SkillAntigravity.compile(skill.id); } catch (_) { /* continuar */ }
        }
        await this._renderAntigravityTab();
    }

    // ── Deep Research ─────────────────────────────────────────────
    async _runDeepResearch() {
        const topic  = this.dom.inpResearchTopic?.value.trim();
        const cat    = this.dom.inpResearchCat?.value;
        const engine = this.dom.inpResearchEngine?.value || 'anthropic';
        if (!topic) return alert('Introduce un tema.');

        this.dom.btnRunResearch.innerText = '⏳ Minando…';
        this.dom.btnRunResearch.disabled  = true;

        try {
            const response = await Orchestrator.callLLM({
                preferredEngine: engine,
                systemPrompt: `Eres @agent_synaptic_weaver. Investiga el tema y genera una Skill estructurada SOS V10.
Devuelve SOLO JSON:
{
  "title": "Título de la Skill",
  "description": "Descripción breve",
  "content": "SOP paso a paso + SOCs de verificación",
  "keywords": ["#tag1","#tag2"]
}`,
                userPrompt:     `Tema: ${topic}\nCategoría objetivo: ${cat}`,
                responseFormat: 'json_object',
                temperature:    0.3
            });

            const data = response.content;
            if (data.title && data.content) {
                await KB.init();
                const skillId = `skill_research_${Date.now()}`;
                await KB.saveNode({
                    id: skillId, type: 'skill', category: cat,
                    projectId: 'global', targetId: 'global',
                    title: data.title, description: data.description || '',
                    content: data.content, keywords: data.keywords || []
                });
                window.dispatchEvent(new CustomEvent('refresh-lms-data'));
                this.dom.researchModal?.classList.remove('active');
                alert(`✅ Skill "${data.title}" minada y sellada en el Córtex.`);
            }
        } catch (err) {
            alert('Error en Deep Research: ' + err.message);
        } finally {
            this.dom.btnRunResearch.innerText = '🚀 Iniciar Minado Neuronal';
            this.dom.btnRunResearch.disabled  = false;
        }
    }

    // ── Skills Scout ─────────────────────────────────────────────
    async _runSkillScout() {
        const domain  = this.dom.inpScoutDomain?.value.trim();
        const context = this.dom.inpScoutContext?.value.trim();
        if (!domain) return alert('Introduce un dominio.');

        this.dom.btnRunScout.innerText = '⏳ Explorando…';
        this.dom.btnRunScout.disabled  = true;

        try {
            const suggestions = await Orchestrator.scoutExternalSkills({ domain, context, maxSuggestions: 5 });
            const priorityColor = { high:'#ff5252', medium:'#ff9100', low:'#6366f1' };

            this.dom.scoutResults.style.display = 'block';
            this.dom.scoutResults.innerHTML = !suggestions.length
                ? '<div style="color:#555;font-size:0.82rem;">Sin sugerencias encontradas.</div>'
                : `<div style="font-size:0.72rem;color:#888;margin-bottom:10px;font-weight:bold;">
                    ${suggestions.length} skills candidatas · guardadas en KB para revisión
                   </div>
                   ${suggestions.map(s => `
                   <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.05);
                        border-radius:9px;padding:10px 12px;margin-bottom:6px;">
                       <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:3px;">
                           <div style="font-weight:900;color:white;font-size:0.82rem;">${s.title}</div>
                           <span style="font-size:0.6rem;padding:2px 6px;border-radius:4px;font-weight:bold;
                               color:${priorityColor[s.priority]||'#888'};background:rgba(255,255,255,0.04);">
                               ${s.priority||'medium'}
                           </span>
                       </div>
                       <div style="font-size:0.72rem;color:#666;">${s.description}</div>
                       ${s.gaps ? `<div style="font-size:0.67rem;color:#444;font-style:italic;margin-top:3px;">Gap: ${s.gaps}</div>` : ''}
                   </div>`).join('')}`;

            window.dispatchEvent(new CustomEvent('refresh-lms-data'));
        } catch (err) {
            alert('Error Scout: ' + err.message);
        } finally {
            this.dom.btnRunScout.innerText = '🕵️ Explorar Skills Externas';
            this.dom.btnRunScout.disabled  = false;
        }
    }
}
