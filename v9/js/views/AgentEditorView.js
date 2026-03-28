// =============================================================================
// TEAMTOWERS SOS V10 — AGENT EDITOR VIEW
// Ruta: ia/dev/js/views/AgentEditorView.js
// Padrón Neuronal · IdentityForge · Directorio de Nodos
// =============================================================================

import { store }         from '../core/store.js';
import { Sidebar }       from '../components/Sidebar.js';
import { BottomNav }     from '../components/BottomNav.js';
import { PageHeader }    from '../components/PageHeader.js';
import { IdentityForge } from '../components/IdentityForge.js';

export default class AgentEditorView {

    constructor() {
        document.title        = 'Padrón Neuronal | TeamTowers V10';
        this.forgeComponent   = null;
        this.currentFilter    = 'all';
        this.isListCollapsed  = false;
        this.dom              = {};
    }

    async getHtml() {
        await store.init();

        const headerConfig = {
            title:   'Padrón Neuronal',
            subtitle: 'Registro Central de Nodos',
            tagline: 'Forja el Ikigai de Agentes y Humanos. Maximiza el espacio para conectar el Meta-Grafo.'
        };

        return `
        <style>
            .app-layout       { display:flex; height:100dvh; overflow:hidden; background:var(--bg-dark); font-family:var(--font-main); width:100%; }
            .workspace-agents { flex:1; padding:2rem 3rem; overflow-y:auto; overflow-x:hidden; scroll-behavior:smooth; box-sizing:border-box; background:radial-gradient(circle at center, #111116 0%, #050505 100%); }

            .agent-grid { display:grid; grid-template-columns:350px 1fr; gap:2rem; padding-bottom:5rem; align-items:start; transition:grid-template-columns 0.4s cubic-bezier(0.2,0.8,0.2,1); }
            .agent-grid.collapsed { grid-template-columns:85px 1fr; }

            .agent-list-panel { background:rgba(10,10,15,0.8); border:1px solid var(--glass-border); border-radius:18px; display:flex; flex-direction:column; height:calc(100dvh - 200px); overflow:hidden; box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5); transition:0.4s; }

            .list-header { padding:18px; border-bottom:1px dashed #333; display:flex; flex-direction:column; gap:12px; background:rgba(0,0,0,0.4); transition:0.4s; }
            .agent-grid.collapsed .list-header { padding:14px 8px; align-items:center; }

            .header-top { display:flex; justify-content:space-between; align-items:center; width:100%; }
            .agent-grid.collapsed .header-top { flex-direction:column; gap:12px; justify-content:center; }

            .panel-title-text { margin:0; color:white; font-weight:900; font-size:1.1rem; white-space:nowrap; }
            .agent-grid.collapsed .panel-title-text { display:none; }

            .btn-toggle-list { background:transparent; border:none; color:#888; font-size:1.1rem; cursor:pointer; transition:0.2s; display:flex; justify-content:center; align-items:center; padding:5px; border-radius:8px; }
            .btn-toggle-list:hover { color:white; background:rgba(255,255,255,0.1); }
            .agent-grid.collapsed .btn-toggle-list { transform:rotate(180deg); }

            .btn-new-agent { background:rgba(99,102,241,0.1); color:var(--accent-indigo); border:1px solid rgba(99,102,241,0.3); padding:8px 12px; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s; display:flex; align-items:center; gap:5px; white-space:nowrap; font-size:0.85rem; }
            .btn-new-agent:hover { background:var(--accent-indigo); color:white; }
            .agent-grid.collapsed .btn-new-agent { padding:10px; border-radius:50%; width:44px; height:44px; justify-content:center; }
            .agent-grid.collapsed .btn-new-agent .text { display:none; }

            .list-filters { display:flex; gap:4px; }
            .agent-grid.collapsed .list-filters { display:none; }
            .list-filter { flex:1; background:#111; border:1px solid #444; color:#888; font-size:0.72rem; padding:6px; border-radius:6px; cursor:pointer; transition:0.2s; text-align:center; font-weight:bold; }
            .list-filter.active { background:rgba(224,64,251,0.1); border-color:var(--accent-purple); color:var(--accent-purple); }

            .agent-list { flex:1; overflow-y:auto; padding:8px; display:flex; flex-direction:column; gap:6px; }
            .agent-grid.collapsed .agent-list { padding:8px 4px; align-items:center; }

            .agent-item { display:flex; align-items:center; gap:12px; padding:11px; border-radius:10px; cursor:pointer; transition:0.2s; border:1px solid transparent; }
            .agent-item:hover  { background:rgba(255,255,255,0.03); border-color:#333; }
            .agent-item.active { background:rgba(99,102,241,0.1); border-color:var(--accent-indigo); }
            .agent-grid.collapsed .agent-item { padding:8px; justify-content:center; width:100%; box-sizing:border-box; }

            .agent-avatar { font-size:1.6rem; width:42px; height:42px; min-width:42px; display:flex; justify-content:center; align-items:center; background:rgba(0,0,0,0.5); border-radius:10px; border:1px solid #333; }
            .agent-grid.collapsed .agent-avatar { width:48px; height:48px; }

            .agent-info { overflow:hidden; white-space:nowrap; }
            .agent-grid.collapsed .agent-info { display:none; }
            .agent-info h4 { margin:0 0 2px 0; color:white; font-size:0.9rem; font-weight:900; text-overflow:ellipsis; overflow:hidden; }
            .agent-info p  { margin:0; color:#888; font-size:0.72rem; font-family:var(--font-mono); text-overflow:ellipsis; overflow:hidden; }

            .forge-mount-wrapper { min-width:0; }

            @media (max-width:1024px) {
                .agent-grid { grid-template-columns:1fr!important; }
                .agent-list-panel { height:220px; }
                .workspace-agents { padding:80px 1rem 120px 1rem; }
                .btn-toggle-list { display:none; }
            }
        </style>

        <div class="app-layout">
            ${Sidebar.getHtml('/team')}
            <main class="workspace-agents">
                ${PageHeader.getHtml(headerConfig)}

                <div class="agent-grid" id="mainAgentGrid">
                    <!-- Panel lista izquierdo -->
                    <div class="agent-list-panel">
                        <div class="list-header">
                            <div class="header-top">
                                <h3 class="panel-title-text">Directorio</h3>
                                <div style="display:flex; gap:8px; align-items:center;">
                                    <button class="btn-new-agent" id="btnNewAgent" title="Crear Nuevo Nodo">
                                        <span class="icon">➕</span> <span class="text">Nuevo Nodo</span>
                                    </button>
                                    <button class="btn-toggle-list" id="btnToggleList" title="Colapsar/Expandir Panel">◀</button>
                                </div>
                            </div>
                            <div class="list-filters">
                                <button class="list-filter active" data-f="all">Todos</button>
                                <button class="list-filter"        data-f="ai">🤖 IAs</button>
                                <button class="list-filter"        data-f="human">👤 Humanos</button>
                            </div>
                        </div>
                        <div class="agent-list" id="agentList"></div>
                    </div>

                    <!-- Forge panel derecho -->
                    <div class="forge-mount-wrapper" id="identityForgeMountPoint">
                        <div style="text-align:center; padding:4rem; color:#555; font-style:italic; border:1px dashed #333; border-radius:18px;">
                            <div style="font-size:3rem; margin-bottom:1rem;">⚡</div>
                            Selecciona o crea un nodo para desplegar la Forja de Identidad.
                        </div>
                    </div>
                </div>
            </main>

            ${BottomNav.getHtml('/team')}
        </div>`;
    }

    async afterRender() {
        Sidebar.initListeners();
        PageHeader.afterRender();

        this.dom = {
            grid:       document.getElementById('mainAgentGrid'),
            list:       document.getElementById('agentList'),
            btnNew:     document.getElementById('btnNewAgent'),
            btnToggle:  document.getElementById('btnToggleList'),
            filters:    document.querySelectorAll('.list-filter'),
            mountPoint: document.getElementById('identityForgeMountPoint')
        };

        this.forgeComponent = new IdentityForge('identityForgeMountPoint');
        this._renderList();

        // Acordeón
        this.dom.btnToggle?.addEventListener('click', () => {
            this.isListCollapsed = !this.isListCollapsed;
            this.dom.grid.classList.toggle('collapsed', this.isListCollapsed);
        });

        // Filtros
        this.dom.filters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.dom.filters.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentFilter = e.currentTarget.dataset.f;
                this._renderList();
            });
        });

        // Nuevo nodo
        this.dom.btnNew?.addEventListener('click', async () => {
            document.querySelectorAll('.agent-item').forEach(i => i.classList.remove('active'));
            this.isListCollapsed = true;
            this.dom.grid.classList.add('collapsed');
            await this.forgeComponent.render(null);
        });

        // Evento de actualización tras forjar
        window.addEventListener('identity-forged', () => this._renderList());
    }

    _renderList() {
        const state = store.getState();
        let users   = state.globalUsers || [];

        if (this.currentFilter === 'ai')    users = users.filter(u =>  u.profile?.isAi);
        if (this.currentFilter === 'human') users = users.filter(u => !u.profile?.isAi);

        this.dom.list.innerHTML = users.map(u => `
            <div class="agent-item ${u.id === this.forgeComponent?.activeNodeId ? 'active' : ''}" data-id="${u.id}" title="${u.name} (${u.id})">
                <div class="agent-avatar">${u.profile?.isAi ? '🤖' : '👤'}</div>
                <div class="agent-info">
                    <h4>${u.name || u.id}</h4>
                    <p>${u.id} · ${u.profile?.guardian || 'everyman'}</p>
                </div>
            </div>`
        ).join('');

        this.dom.list.querySelectorAll('.agent-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                document.querySelectorAll('.agent-item').forEach(i => i.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.isListCollapsed = true;
                this.dom.grid.classList.add('collapsed');
                await this.forgeComponent.render(id);
            });
        });
    }

    // Alias V9
    executeViewScript() { return this.afterRender(); }
}
