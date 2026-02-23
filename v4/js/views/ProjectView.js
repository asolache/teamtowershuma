import { store } from '../core/store.js';
import { ValueMapView } from './ValueMapView.js';

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        
        if (!project) {
            return `<div style="padding:50px; text-align:center;"><h2>Proyecto no encontrado</h2><a href="#/" style="color:#58a6ff;">Volver al Dashboard</a></div>`;
        }

        const activeDynamicRoles = (project.dynamicRoles || []).filter(dr => !dr.isArchived);

        return `
            <div style="max-width: 1400px; margin: 0 auto; padding: 25px; font-family: sans-serif; color: #c9d1d9;">
                <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #30363d; padding-bottom: 20px; margin-bottom: 20px;">
                    <div>
                        <h1 style="color: #f0f6fc; margin: 0; font-size: 1.8rem; display: flex; align-items: center; gap: 15px;">
                            ${project.nombre} 
                            <a href="#/project/${projectId}/edit" style="font-size: 0.85rem; color: #a371f7; text-decoration: none; border: 1px solid #30363d; padding: 6px 12px; border-radius: 6px; font-weight: normal; background: #161b22;">
                                ⚙️ Editar Sistema
                            </a>
                        </h1>
                        <div style="color:#8b949e; font-size: 0.9rem; margin-top: 5px;">Sector: ${project.sector}</div>
                    </div>
                    <button onclick="location.hash='#/'" style="background:transparent; border:1px solid #30363d; color:#58a6ff; padding:8px 15px; border-radius:6px; cursor:pointer;">← Dashboard</button>
                </header>

                <nav style="display: flex; gap: 20px; border-bottom: 1px solid #30363d; padding-bottom: 15px; margin-bottom: 25px;">
                    <a href="#/project/${projectId}" style="color: #f0f6fc; text-decoration: none; font-weight: bold; border-bottom: 2px solid #58a6ff; padding-bottom: 14px; margin-bottom: -16px;">
                        🗺️ Mapa de Valor
                    </a>
                    <a href="#/project/${projectId}/accounting" style="color: #8b949e; text-decoration: none;">
                        💰 Contabilidad
                    </a>
                </nav>

                <div style="display: grid; grid-template-columns: 350px 1fr; gap: 30px;">
                    <aside>
                        <div style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px;">
                            <h4 style="font-size: 0.8rem; color: #f0f6fc; text-transform: uppercase; border-bottom: 1px solid #30363d; padding-bottom: 10px; margin-top: 0;">Nodos del Sistema</h4>
                            
                            <div style="margin-bottom: 15px;">
                                <strong style="font-size: 0.7rem; color: #8b949e;">ROLES BASE:</strong>
                                ${Object.keys(project.customRoles || {}).map(id => `
                                    <div style="font-size: 0.85rem; padding: 4px 0;">
                                        <span style="color:#238636; font-weight:bold;">${id}</span> <span style="color:#c9d1d9;">${project.customRoles[id]}</span>
                                    </div>
                                `).join('')}
                            </div>

                            ${activeDynamicRoles.length > 0 ? `
                                <div>
                                    <strong style="font-size: 0.7rem; color: #8b949e;">ESPECIALISTAS:</strong>
                                    ${activeDynamicRoles.map(dr => `
                                        <div style="background:#0d1117; border:1px solid #21262d; padding:8px; border-radius:4px; margin-top:5px; border-left: 3px solid #a371f7;">
                                            <div style="font-weight:bold; font-size:0.8rem; color:#f0f6fc;">${dr.name}</div>
                                            <div style="font-size:0.65rem; color:#8b949e;">${dr.area}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </aside>

                    <main>
                        <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 12px; height: 600px; position: relative;">
                            ${ValueMapView.render(projectId)}
                        </div>
                    </main>
                </div>
            </div>
        `;
    }
};
