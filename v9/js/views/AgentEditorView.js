// v9/js/views/AgentEditorView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import { IdentityForge } from '../components/IdentityForge.js';

export default class AgentEditorView {
    constructor() {
        document.title = "Padrón Neuronal | TeamTowers V9";
        this.forgeComponent = null;
        this.currentFilter = 'all';
        this.isListCollapsed = false;
    }

    async getHtml() {
        await store.init();
        
        const headerConfig = {
            title: "Padrón Neuronal",
            subtitle: "Registro Central de Nodos",
            tagline: "Forja el Ikigai de Agentes y Humanos. Maximiza el espacio para conectar el Meta-Grafo."
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-agents { flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; box-sizing: border-box; background: radial-gradient(circle at center, #111116 0%, #050505 100%);}
                
                /* 🔥 GRID DINÁMICO (UX DELUX) */
                .agent-grid { 
                    display: grid; 
                    grid-template-columns: 350px 1fr; 
                    gap: 2rem; 
                    padding-bottom: 5rem; 
                    align-items: start;
                    transition: grid-template-columns 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                .agent-grid.collapsed { grid-template-columns: 85px 1fr; }
                
                .agent-list-panel { background: rgba(10,10,15,0.8); border: 1px solid var(--glass-border); border-radius: 20px; display: flex; flex-direction: column; height: calc(100vh - 180px); overflow: hidden; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5); transition: 0.4s;}
                
                .list-header { padding: 20px; border-bottom: 1px dashed #333; display: flex; flex-direction: column; gap: 15px; background: rgba(0,0,0,0.4); transition: 0.4s;}
                .agent-grid.collapsed .list-header { padding: 15px 10px; align-items: center; }

                .header-top { display: flex; justify-content: space-between; align-items: center; width: 100%;}
                .agent-grid.collapsed .header-top { flex-direction: column; gap: 15px; justify-content: center; }

                .panel-title-text { margin: 0; color: white; font-weight: 900; font-size: 1.2rem; white-space: nowrap;}
                .agent-grid.collapsed .panel-title-text { display: none; }

                .btn-toggle-list { background: transparent; border: none; color: #888; font-size: 1.2rem; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center; padding: 5px; border-radius: 8px;}
                .btn-toggle-list:hover { color: white; background: rgba(255,255,255,0.1); }
                .agent-grid.collapsed .btn-toggle-list { transform: rotate(180deg); }

                .btn-new-agent { background: rgba(0,176,255,0.1); color: var(--accent-blue); border: 1px solid rgba(0,176,255,0.3); padding: 8px 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 5px; white-space: nowrap;}
                .btn-new-agent:hover { background: var(--accent-blue); color: black;}
                .agent-grid.collapsed .btn-new-agent { padding: 10px; border-radius: 50%; width: 45px; height: 45px; justify-content: center; }
                .agent-grid.collapsed .btn-new-agent .text { display: none; }
                .agent-grid.collapsed .btn-new-agent .icon { font-size: 1.2rem; }
                
                .list-filters { display: flex; gap: 5px; }
                .agent-grid.collapsed .list-filters { display: none; }

                .list-filter { flex: 1; background: #111; border: 1px solid #444; color: #888; font-size: 0.75rem; padding: 6px; border-radius: 6px; cursor: pointer; transition: 0.2s; text-align: center; font-weight: bold;}
                .list-filter.active { background: rgba(224,64,251,0.1); border-color: var(--accent-purple); color: var(--accent-purple);}
                
                .agent-list { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 8px;}
                .agent-grid.collapsed .agent-list { padding: 10px 5px; align-items: center; }

                .agent-item { display: flex; align-items: center; gap: 15px; padding: 12px; border-radius: 12px; cursor: pointer; transition: 0.2s; border: 1px solid transparent;}
                .agent-item:hover { background: rgba(255,255,255,0.03); border-color: #333; }
                .agent-item.active { background: rgba(0,176,255,0.1); border-color: var(--accent-blue); }
                .agent-grid.collapsed .agent-item { padding: 8px; justify-content: center; width: 100%; box-sizing: border-box;}

                .agent-avatar { font-size: 1.8rem; width: 45px; height: 45px; min-width: 45px; display: flex; justify-content: center; align-items: center; background: rgba(0,0,0,0.5); border-radius: 12px; border: 1px solid #333;}
                .agent-grid.collapsed .agent-avatar { width: 50px; height: 50px; }

                .agent-info { overflow: hidden; white-space: nowrap; }
                .agent-grid.collapsed .agent-info { display: none; }
                .agent-info h4 { margin: 0 0 3px 0; color: white; font-size: 0.95rem; font-weight: 900; text-overflow: ellipsis; overflow: hidden;}
                .agent-info p { margin: 0; color: #888; font-size: 0.75rem; font-family: var(--font-mono); text-overflow: ellipsis; overflow: hidden;}

                .forge-mount-wrapper { min-width: 0; } /* Previene que el grid reviente el ancho */

                @media (max-width: 1024px) {
                    .agent-grid { grid-template-columns: 1fr !important; }
                    .agent-list-panel { height: 250px; }
                    .workspace-agents { padding: 90px 1rem 120px 1rem; }
                    .btn-toggle-list { display: none; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/team')}
                <main class="workspace-agents">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="agent-grid" id="mainAgentGrid">
                        <div class="agent-list-panel">
                            <div class="list-header">
                                <div class="header-top">
                                    <h3 class="panel-title-text">Directorio</h3>
                                    <div style="display:flex; gap:10px; align-items:center;">
                                        <button class="btn-new-agent" id="btnNewAgent" title="Crear Nuevo Nodo">
                                            <span class="icon">➕</span> <span class="text">Nuevo Nodo</span>
                                        </button>
                                        <button class="btn-toggle-list" id="btnToggleList" title="Colapsar/Expandir Panel">◀</button>
                                    </div>
                                </div>
                                <div class="list-filters">
                                    <button class="list-filter active" data-f="all">Todos</button>
                                    <button class="list-filter" data-f="ai">🤖 IAs</button>
                                    <button class="list-filter" data-f="human">👤 Humanos</button>
                                </div>
                            </div>
                            <div class="agent-list" id="agentList"></div>
                        </div>

                        <div class="forge-mount-wrapper" id="identityForgeMountPoint">
                            <div style="text-align:center; padding: 4rem; color:#666; font-style:italic; border: 1px dashed #333; border-radius: 20px;">
                                <div style="font-size:3rem; margin-bottom:1rem;">⚡</div>
                                Selecciona o crea un nodo para desplegar la Forja de Identidad.
                            </div>
                        </div>
                    </div>
                </main>
                ${BottomNav.getHtml('/team')}
            </div>
        `;
    }

    async executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        this.dom = {
            grid: document.getElementById('mainAgentGrid'),
            list: document.getElementById('agentList'),
            btnNew: document.getElementById('btnNewAgent'),
            btnToggle: document.getElementById('btnToggleList'),
            filters: document.querySelectorAll('.list-filter'),
            mountPoint: document.getElementById('identityForgeMountPoint')
        };

        this.forgeComponent = new IdentityForge('identityForgeMountPoint');

        this.renderList();

        // Lógica del Acordeón Manual
        this.dom.btnToggle.addEventListener('click', () => {
            this.isListCollapsed = !this.isListCollapsed;
            this.updateGridState();
        });

        // Filtros
        this.dom.filters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.dom.filters.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.f;
                this.renderList();
            });
        });

        // Nuevo Agente -> Auto-Colapso
        this.dom.btnNew.addEventListener('click', async () => {
            document.querySelectorAll('.agent-item').forEach(i => i.classList.remove('active'));
            this.isListCollapsed = true;
            this.updateGridState();
            await this.forgeComponent.render(null); 
        });

        window.addEventListener('identity-forged', () => {
            this.renderList();
        });
    }

    updateGridState() {
        if (this.isListCollapsed) {
            this.dom.grid.classList.add('collapsed');
        } else {
            this.dom.grid.classList.remove('collapsed');
        }
    }

    renderList() {
        const state = store.getState();
        let users = state.globalUsers || [];
        
        if (this.currentFilter === 'ai') users = users.filter(u => u.profile?.isAi);
        if (this.currentFilter === 'human') users = users.filter(u => !u.profile?.isAi);
        
        this.dom.list.innerHTML = users.map(u => `
            <div class="agent-item ${u.id === this.forgeComponent.activeNodeId ? 'active' : ''}" data-id="${u.id}" title="${u.name} (${u.id})">
                <div class="agent-avatar">${u.profile?.isAi ? '🤖' : '👤'}</div>
                <div class="agent-info">
                    <h4>${u.name}</h4>
                    <p>${u.id} | ${u.profile?.guardian || 'everyman'}</p>
                </div>
            </div>
        `).join('');

        this.dom.list.querySelectorAll('.agent-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                document.querySelectorAll('.agent-item').forEach(i => i.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // 🔥 AUTO-FOCO GTD: Colapsamos el panel al seleccionar un agente
                this.isListCollapsed = true;
                this.updateGridState();

                await this.forgeComponent.render(id);
            });
        });
    }
}
