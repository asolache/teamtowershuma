import { store } from '../core/store.js';
import { Selectors } from '../core/selectors.js';

export const DashboardView = {
    render: () => {
        const state = store.getState();
        const projects = state.projects || [];

        return `
            <div class="dashboard">
                <header><h1>Radar de Castells</h1></header>
                <div class="grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
                    ${projects.map(p => {
                        const health = Selectors.getProjectResilienceIndex(state, p.id);
                        return `
                            <div class="card" style="background:#1e293b; padding:20px; border-radius:12px; border:1px solid #334155;">
                                <span class="badge ${health.status}" style="font-size:0.7rem; padding:2px 8px; border-radius:10px; border:1px solid;">${health.status.toUpperCase()}</span>
                                <h2 style="margin:10px 0;">${p.nombre}</h2>
                                <p style="font-size:0.9rem; color:#94a3b8;">Salud VNA: ${(health.ratio * 100).toFixed(0)}%</p>
                                <a href="project.html?id=${p.id}" class="btn-link" style="color:#3b82f6; text-decoration:none; font-weight:bold;">Abrir Canvas →</a>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
};
