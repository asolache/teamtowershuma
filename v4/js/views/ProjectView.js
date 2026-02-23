import { store } from '../core/store.js';
import { ValueMapView } from './ValueMapView.js';

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div style="padding:50px;color:white;">Proyecto no encontrado</div>`;

        const salud = store.calculateResilience(projectId);

        return `
            <div style="max-width:1400px;margin:0 auto;padding:20px;color:#c9d1d9;">
                <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <div>
                        <h1 style="margin:0;color:#f0f6fc;">🏰 ${project.nombre}</h1>
                        <span style="color:${salud < 30 ? '#f85149' : '#238636'};font-weight:bold;">Resiliencia: ${salud}%</span>
                    </div>
                    <div style="display:flex;gap:10px;">
                        <button onclick="location.hash='#/project/${projectId}/accounting'" style="background:#238636;color:white;border:none;padding:8px 15px;border-radius:6px;cursor:pointer;font-weight:bold;">💰 Contabilidad</button>
                        <button onclick="location.hash='#/'" style="background:#21262d;color:#c9d1d9;border:1px solid #30363d;padding:8px 15px;border-radius:6px;cursor:pointer;">Dashboard</button>
                    </div>
                </header>

                <div style="display:grid;grid-template-columns:300px 1fr;gap:20px;">
                    <aside style="background:#161b22;border:1px solid #30363d;padding:15px;border-radius:8px;">
                        <h3 style="font-size:0.8rem;color:#8b949e;text-transform:uppercase;margin-top:0;">Nodos Gremiales</h3>
                        ${Object.keys(project.customRoles || {}).map(role => `
                            <div style="padding:5px 0;border-bottom:1px solid #21262d;font-size:0.9rem;">
                                <b style="color:#58a6ff;">${role}:</b> ${project.customRoles[role]}
                            </div>
                        `).join('')}
                    </aside>
                    <main style="background:#0d1117;border:1px solid #30363d;border-radius:12px;height:600px;position:relative;overflow:hidden;">
                        ${ValueMapView.render(projectId)}
                    </main>
                </div>
            </div>`;
    }
};
