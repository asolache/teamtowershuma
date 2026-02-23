import { store } from '../core/store.js';
import { ValueMapView } from './ValueMapView.js';

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div style="padding:50px; color:white;">Proyecto no encontrado</div>`;

        const salud = store.calculateResilience(projectId);

        return `
            <div style="max-width: 1400px; margin: 0 auto; padding: 20px; color: #c9d1d9;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid #30363d; padding-bottom: 20px;">
                    <div>
                        <h1 style="margin: 0; color: #f0f6fc;">🏰 ${project.nombre}</h1>
                        <div style="display: flex; align-items: center; gap: 15px; margin-top: 5px;">
                            <span style="color: #8b949e;">Sector: <b>${project.sector}</b></span>
                            <span style="color: ${salud < 30 ? '#f85149' : '#238636'}; font-weight: bold;">Resiliencia: ${salud}%</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="location.hash='#/project/${projectId}/accounting'" style="background: #238636; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">💰 Contabilidad</button>
                        <button onclick="location.hash='#/'" style="background: #21262d; color: #c9d1d9; border: 1px solid #30363d; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Dashboard</button>
                    </div>
                </header>

                <div style="display: grid; grid-template-columns: 320px 1fr; gap: 25px;">
                    <aside style="background: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 12px;">
                        <h3 style="font-size: 0.75rem; color: #8b949e; text-transform: uppercase; margin-top: 0; border-bottom: 1px solid #30363d; padding-bottom: 10px; margin-bottom: 15px;">Estructura del Castell</h3>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            ${Object.keys(project.customRoles || {}).map(roleId => `
                                <div>
                                    <div style="font-size: 0.85rem; color: #58a6ff; font-weight: bold;">${roleId}</div>
                                    <div style="font-size: 0.8rem; color: #c9d1d9;">${project.customRoles[roleId]}</div>
                                </div>
                            `).join('')}
                        </div>
                        <hr style="border: 0; border-top: 1px solid #30363d; margin: 20px 0;">
                        <button onclick="location.hash='#/project/${projectId}/edit'" style="width: 100%; background: transparent; border: 1px solid #30363d; color: #a371f7; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">⚙️ Configurar Ontología</button>
                    </aside>

                    <main style="background: #0d1117; border: 1px solid #30363d; border-radius: 12px; height: 650px; position: relative; overflow: hidden; box-shadow: inset 0 0 40px rgba(0,0,0,0.5);">
                        ${ValueMapView.render(projectId)}
                    </main>
                </div>
            </div>
        `;
    }
};
