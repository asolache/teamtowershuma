// v8/js/views/NetworkView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { PageHeader } from '../components/PageHeader.js';
import { BottomNav } from '../components/BottomNav.js';

export default class NetworkView {
    constructor() {
        document.title = "Radar Global | TeamTowers V8";
    }

    async getHtml() {
        const state = store.getState();
        const headerConfig = {
            title: "Radar Global",
            subtitle: "Network",
            tagline: "Explora todos los Ecosistemas (Castells) instanciados en este Kernel."
        };

        const projectsHtml = state.projects.map(p => {
            const h = store.calculateHarvest(p.id) || [];
            const tSlices = h.reduce((sum, x) => sum + x.slices, 0);
            
            return `
                <div class="net-card">
                    <h3 class="net-title">${p.nombre}</h3>
                    <div style="color:var(--accent-purple); font-size:0.8rem; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:15px;">${p.archetype || 'Startup'} | Sector: ${p.sector}</div>
                    
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span style="color:#888; font-size:0.85rem;">Nodos:</span>
                        <span style="color:white; font-weight:bold;">${(p.usuarios || []).length}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span style="color:#888; font-size:0.85rem;">Tuberías Activas:</span>
                        <span style="color:white; font-weight:bold;">${(p.vna_flows || []).length}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:15px; border-top:1px dashed #333; padding-top:10px;">
                        <span style="color:var(--accent-green); font-size:0.85rem; font-weight:bold;">Market Cap:</span>
                        <span style="color:var(--accent-green); font-family:var(--font-mono); font-weight:bold;">${Math.round(tSlices)} Slices</span>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <style>
                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); }
                .net-workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; scroll-behavior: smooth; }
                
                .net-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; padding-bottom: 5rem; }
                
                .net-card { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); padding: 2rem; border-radius: 20px; transition: 0.3s; backdrop-filter: blur(10px); }
                .net-card:hover { border-color: var(--accent-blue); transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,176,255,0.1); }
                .net-title { color: white; margin-top: 0; font-size: 1.4rem; font-weight: 900; letter-spacing: -0.5px; }

                @media (max-width: 768px) {
                    .net-workspace { padding: 80px 1.5rem 100px 1.5rem; }
                    .net-grid { grid-template-columns: 1fr; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/network')}
                
                <main class="net-workspace">
                    ${PageHeader.getHtml(headerConfig)}
                    <div class="net-grid">
                        ${projectsHtml || '<div style="color:#888; padding:3rem; text-align:center; border:1px dashed #444; border-radius:16px;">El Radar está vacío.</div>'}
                    </div>
                </main>

                ${BottomNav.getHtml('/network')}
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();
    }
}
