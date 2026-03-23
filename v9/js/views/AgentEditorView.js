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
    }

    async getHtml() {
        await store.init();
        
        const headerConfig = {
            title: "Padrón Neuronal",
            subtitle: "Registro Central de Nodos",
            tagline: "Forja el Ikigai de Agentes y Humanos para conectarlos al Meta-Grafo Antigravity."
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-agents { flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; box-sizing: border-box; background: radial-gradient(circle at center, #111116 0%, #050505 100%);}
                
                .agent-grid { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; padding-bottom: 5rem; align-items: start;}
                
                .agent-list-panel { background: rgba(10,10,15,0.8); border: 1px solid var(--glass-border); border-radius: 20px; display: flex; flex-direction: column; height: calc(100vh - 180px); overflow: hidden; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5);}
                .list-header { padding: 20px; border-bottom: 1px dashed #333; display: flex; flex-direction: column; gap: 10px; background: rgba(0,0,0,0.4);}
                
                .header-top { display: flex; justify-content: space-between; align-items: center; }
                .header-top h3 { margin: 0; color: white; font-weight: 900; font-size: 1.2rem;}
                .btn-new-agent { background: rgba(0,176,255,0.1); color: var(--accent-blue); border: 1px solid rgba(0,176,255,0.3); padding: 6px 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s;}
                .btn-new-agent:hover { background: var(--accent-blue); color: black;}
                
                .list-filters { display: flex; gap: 5px; }
                .list-filter { flex: 1; background: #111; border: 1px solid #444; color: #888; font-size: 0.75rem; padding: 4px; border-radius: 6px; cursor: pointer; transition: 0.2s; text-align: center; font-weight: bold;}
                .list-filter.active { background: rgba(224,64,251,0.1); border-color: var(--accent-purple); color: var(--accent-purple);}
                
                .agent-list { flex: 1; overflow-y: auto; padding: 10px;}
                .agent-item { display: flex; align-items: center; gap: 15px; padding: 15px; border-radius: 12px; cursor: pointer; transition: 0.2s; border: 1px solid transparent; margin-bottom: 5px;}
                .agent-item:hover { background: rgba(255,255,255,0.03); border-color: #333; }
                .agent-item.active { background: rgba(0,176,255,0.1); border-color: var(--accent-blue); }
                .agent-avatar { font-size: 2rem; width: 45px; height: 45px; display: flex; justify-content: center; align-items: center; background: rgba(0,0,0,0.5); border-radius: 12px; border: 1px solid #333;}
                .agent-info h4 { margin: 0 0 5px 0; color: white; font-size: 1rem; font-weight: 900;}
                .agent-info p { margin: 0; color: #888; font-size: 0.75rem; font-family: var(--font-mono);}

                @media (max-width: 1024px) {
                    .agent-grid { grid-template-columns: 1fr; }
                    .agent-list-panel { height: 350px; }
                    .workspace-agents { padding: 90px 1rem 120px 1rem; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/team')}
                <main class="workspace-agents">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="agent-grid">
                        <div class="agent-list-panel">
                            <div class="list-header">
                                <div class="header-top">
                                    <h3>Directorio</h3>
                                    <button class="btn-new-agent" id="btnNewAgent">+ Nuevo Nodo</button>
                                </div>
                                <div class="list-filters">
                                    <button class="list-filter active" data-f="all">Todos</button>
                                    <button class="list-filter" data-f="ai">🤖 IAs</button>
                                    <button class="list-filter" data-f="human">👤 Humanos</button>
                                </div>
                            </div>
                            <div class="agent-list" id="agentList"></div>
                        </div>

                        <div id="identityForgeMountPoint">
                            <div style="text-align:center; padding: 4rem; color:#666; font-style:italic;">Selecciona o crea un nodo para abrir la Forja de Identidad.</div>
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
            list: document.getElementById('agentList'),
            btnNew: document.getElementById('btnNewAgent'),
            filters: document.querySelectorAll('.list-filter'),
            mountPoint: document.getElementById('identityForgeMountPoint')
        };

        this.forgeComponent = new IdentityForge('identityForgeMountPoint');

        this.renderList();

        this.dom.filters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.dom.filters.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.f;
                this.renderList();
            });
        });

        this.dom.btnNew.addEventListener('click', async () => {
            document.querySelectorAll('.agent-item').forEach(i => i.classList.remove('active'));
            await this.forgeComponent.render(null); 
        });

        window.addEventListener('identity-forged', () => {
            this.renderList();
        });
    }

    renderList() {
        const state = store.getState();
        let users = state.globalUsers || [];
        
        if (this.currentFilter === 'ai') users = users.filter(u => u.profile?.isAi);
        if (this.currentFilter === 'human') users = users.filter(u => !u.profile?.isAi);
        
        this.dom.list.innerHTML = users.map(u => `
            <div class="agent-item ${u.id === this.forgeComponent.activeNodeId ? 'active' : ''}" data-id="${u.id}">
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
                await this.forgeComponent.render(id);
            });
        });
    }
}
