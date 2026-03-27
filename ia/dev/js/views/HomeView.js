// =============================================================================
// TEAMTOWERS SOS V10 — HOME VIEW
// Vista de inicio · Ruta: /ia/dev/js/views/HomeView.js
// =============================================================================

import { store } from '../core/store.js';

export default class HomeView {
    constructor() {
        document.title = 'TeamTowers V10 | Inicio';
    }

    async getHtml() {
        const state = store.getState();
        const user  = state.globalUsers.find(u => u.id === state.session.activeUserId);
        const projects = state.projects.filter(p => !p.isArchived);

        return `
            <style>
                .home-layout { display: flex; height: 100dvh; width: 100vw; overflow: hidden; background: var(--bg-dark); }
                .home-main { flex: 1; overflow-y: auto; padding: var(--space-8) var(--space-12); }

                .home-hero { margin-bottom: var(--space-12); animation: fadeIn 0.6s var(--ease-out); }
                .home-hero h1 { font-size: var(--text-3xl); font-weight: 800; letter-spacing: -1.5px; margin-bottom: var(--space-2); }
                .home-hero h1 span { color: var(--accent-indigo); }
                .home-hero p { color: var(--text-muted); font-size: var(--text-lg); }

                .home-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-4); margin-top: var(--space-8); }

                .eco-card {
                    background: linear-gradient(145deg, rgba(25,25,32,0.9), rgba(10,10,15,0.95));
                    border: 1px solid var(--glass-border); border-radius: var(--radius-xl);
                    padding: var(--space-6); cursor: pointer; text-decoration: none; color: inherit;
                    transition: all var(--duration-base) var(--ease-out);
                    display: flex; flex-direction: column; gap: var(--space-3);
                    animation: slideUp 0.4s var(--ease-out);
                }
                .eco-card:hover { border-color: var(--accent-indigo); transform: translateY(-3px); box-shadow: var(--shadow-indigo); }
                .eco-card-name { font-weight: 800; font-size: var(--text-lg); }
                .eco-card-meta { color: var(--text-muted); font-size: var(--text-sm); font-family: var(--font-mono); }

                .eco-create {
                    border: 2px dashed rgba(255,255,255,0.08); border-radius: var(--radius-xl);
                    padding: var(--space-6); cursor: pointer; color: var(--text-muted);
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    gap: var(--space-3); min-height: 140px; text-decoration: none;
                    transition: all var(--duration-base) var(--ease-out); text-align: center;
                }
                .eco-create:hover { border-color: var(--accent-green); color: var(--accent-green); background: rgba(0,230,118,0.02); }
                .eco-create .plus { font-size: 2.5rem; }

                .status-bar {
                    position: fixed; bottom: var(--space-4); right: var(--space-4);
                    background: var(--bg-elevated); border: 1px solid var(--glass-border);
                    border-radius: var(--radius-md); padding: var(--space-2) var(--space-4);
                    font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted);
                    display: flex; align-items: center; gap: var(--space-2);
                }
                .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-green); animation: pulse 2s infinite; }

                @media (max-width: 768px) {
                    .home-main { padding: 80px var(--space-4) 100px var(--space-4); }
                    .home-hero h1 { font-size: var(--text-2xl); }
                }
            </style>

            <div class="home-layout">
                <main class="home-main">
                    <div class="home-hero">
                        <h1>TeamTowers <span>V10</span></h1>
                        <p>Exoesqueleto Cognitivo · Antigravity Kernel · ${projects.length} ecosistema${projects.length !== 1 ? 's' : ''} activo${projects.length !== 1 ? 's' : ''}</p>
                    </div>

                    <div class="home-grid">
                        ${projects.map(p => `
                            <a href="/ia/dashboard" data-link class="eco-card">
                                <div class="eco-card-name">🗼 ${p.nombre}</div>
                                <div class="eco-card-meta">${(p.roles || []).length} roles · ${(p.vna_flows || []).length} flujos · ${(p.ledger || []).length} PoW</div>
                            </a>
                        `).join('')}

                        <a href="/ia/settings" data-link class="eco-create">
                            <div class="plus">+</div>
                            <div style="font-weight:700; font-size:var(--text-sm);">Instanciar Ecosistema</div>
                            <div style="font-size:var(--text-xs);">Forjar nueva red VNA</div>
                        </a>
                    </div>
                </main>
            </div>

            <div class="status-bar">
                <div class="status-dot"></div>
                SOS V10 · ${state.config.version} · Claude Orchestrator
            </div>
        `;
    }

    afterRender() {
        // Listener para crear proyecto — se expandirá en siguientes iteraciones
        console.log('[HomeView] V10 renderizado correctamente.');
    }
}
