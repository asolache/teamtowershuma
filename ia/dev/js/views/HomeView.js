// =============================================================================
// TEAMTOWERS SOS V10 — HOME VIEW
// Ruta: ia/dev/js/views/HomeView.js
// =============================================================================

import { store }   from '../core/store.js';
import { Sidebar }  from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';

export default class HomeView {
    constructor() {
        document.title = 'TeamTowers V10 | Inicio';
    }

    async getHtml() {
        const state    = store.getState();
        const projects = state.projects.filter(p => !p.isArchived);

        return `
        <style>
            .home-layout { display:flex; height:100dvh; width:100vw; overflow:hidden; background:var(--bg-dark); }
            .home-main   { flex:1; overflow-y:auto; padding:var(--space-8) var(--space-12); }

            .home-hero   { margin-bottom:var(--space-12); animation:fadeIn 0.6s var(--ease-out,ease); }
            .home-hero h1 { font-size:var(--text-3xl,3rem); font-weight:800; letter-spacing:-1.5px; margin-bottom:var(--space-2); color:white; }
            .home-hero h1 span { color:var(--accent-indigo,#6366f1); }
            .home-hero p  { color:var(--text-muted,#5c5c70); font-size:var(--text-lg,1.25rem); }

            .home-grid {
                display:grid; grid-template-columns:repeat(auto-fill, minmax(280px,1fr));
                gap:var(--space-4,1rem); margin-top:var(--space-8,2rem);
            }

            .eco-card {
                background:linear-gradient(145deg,rgba(25,25,32,0.9),rgba(10,10,15,0.95));
                border:1px solid var(--glass-border); border-radius:var(--radius-xl,1.5rem);
                padding:var(--space-6,1.5rem); cursor:pointer; text-decoration:none; color:inherit;
                transition:all 0.25s ease; display:flex; flex-direction:column; gap:var(--space-3,.75rem);
            }
            .eco-card:hover { border-color:var(--accent-indigo,#6366f1); transform:translateY(-3px); box-shadow:0 8px 30px rgba(99,102,241,0.25); }
            .eco-card-name { font-weight:800; font-size:var(--text-lg,1.25rem); color:white; }
            .eco-card-meta { color:var(--text-muted,#5c5c70); font-size:var(--text-sm,.875rem); font-family:var(--font-mono,monospace); }

            .eco-create {
                border:2px dashed rgba(255,255,255,0.08); border-radius:var(--radius-xl,1.5rem);
                padding:var(--space-6,1.5rem); cursor:pointer; color:var(--text-muted,#5c5c70);
                display:flex; flex-direction:column; align-items:center; justify-content:center;
                gap:var(--space-3,.75rem); min-height:140px; text-decoration:none; text-align:center;
                transition:all 0.25s ease;
            }
            .eco-create:hover { border-color:var(--accent-green,#00e676); color:var(--accent-green,#00e676); background:rgba(0,230,118,0.02); }
            .eco-create .plus { font-size:2.5rem; }

            .status-bar {
                position:fixed; bottom:var(--space-4,1rem); right:var(--space-4,1rem);
                background:var(--bg-elevated,#111118); border:1px solid var(--glass-border);
                border-radius:var(--radius-md,.75rem); padding:6px 14px;
                font-family:var(--font-mono,monospace); font-size:0.7rem; color:var(--text-muted,#5c5c70);
                display:flex; align-items:center; gap:8px; z-index:10;
            }
            .status-dot { width:6px; height:6px; border-radius:50%; background:var(--accent-green,#00e676); animation:pulse 2s infinite; }

            @media (max-width:768px) {
                .home-main { padding:80px var(--space-4,1rem) 100px var(--space-4,1rem); }
                .home-hero h1 { font-size:var(--text-2xl,2rem); }
            }
        </style>

        <div class="home-layout">
            ${Sidebar.getHtml('/')}

            <main class="home-main">
                <div class="home-hero">
                    <h1>Team<span>Towers</span> V10</h1>
                    <p>Exoesqueleto Cognitivo · Antigravity Kernel · ${projects.length} ecosistema${projects.length !== 1 ? 's' : ''} activo${projects.length !== 1 ? 's' : ''}</p>
                </div>

                <div class="home-grid">
                    ${projects.map(p => `
                        <a href="/dashboard" data-link class="eco-card">
                            <div class="eco-card-name">🗼 ${p.nombre}</div>
                            <div class="eco-card-meta">
                                ${(p.roles||[]).length} roles · ${(p.vna_flows||[]).length} flujos · ${(p.work_orders||[]).length} PoW
                            </div>
                        </a>
                    `).join('')}

                    <a href="/create" data-link class="eco-create">
                        <div class="plus">+</div>
                        <div style="font-weight:700; font-size:var(--text-sm,.875rem);">Instanciar Ecosistema</div>
                        <div style="font-size:var(--text-xs,.72rem);">Forjar nueva red VNA</div>
                    </a>
                </div>
            </main>

            ${BottomNav.getHtml('/')}
        </div>

        <div class="status-bar">
            <div class="status-dot"></div>
            SOS V10 · ${state.config?.version || 'Antigravity'} · Claude Orchestrator
        </div>`;
    }

    async afterRender() {
        Sidebar.initListeners();
        console.log('[HomeView] V10 renderizado correctamente.');
    }
}
