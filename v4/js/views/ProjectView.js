import { store } from '../core/store.js';
import { ValueMapView } from './ValueMapView.js';

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div style="padding:100px; text-align:center; color:white;"><h2>🏰 Proyecto no encontrado</h2><a href="#/" style="color:#58a6ff;">Volver al Dashboard</a></div>`;

        const salud = store.calculateResilience(projectId);
        const activeDynamicRoles = (project.dynamicRoles || []).filter(dr => !dr.isArchived);

        return `
            <div style="max-width: 1400px; margin: 0 auto; padding: 25px; color: #c9d1d9;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid #30363d; padding-bottom: 20px;">
                    <div>
                        <h1 style="margin: 0; color: #f0f6fc; font-size: 1.8rem;">${project.nombre}</h1>
                        <div style="display: flex; align-items: center; gap: 20px; margin-top: 8px;">
                            <span style="color: #8b949e; font-size: 0.9rem;">Sector: <b style="color:#58a6ff; text-transform:uppercase;">${project.sector}</b></span>
                            <span style="font-size: 0.9rem; color: ${salud < 30 ? '#f85149' : '#238636'}; font-weight: bold;">Salud del Sistema: ${salud}%</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button onclick="location.hash='#/project/${projectId}/accounting'" style="background: #238636; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">💰 Contabilidad</button>
                        <button onclick="location.hash='#/'" style="background: #21262d; color: #c9d1d9; border: 1px solid #30363d; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Dashboard</button>
                    </div>
                </header>

                <div style="display: grid; grid-template-columns: 320px 1fr; gap: 25px;">
                    
                    <aside style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <div style="background: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 12px;">
                            <h3 style="font-size: 0.75rem; color: #8b949e; text-transform: uppercase; margin: 0 0 15px 0; border-bottom: 1px solid #30363d; padding-bottom: 10px;">Estructura Base</h3>
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                ${Object.keys(project.customRoles || {}).map(roleId => `
                                    <div>
                                        <div style="font-size: 0.85rem; color: #58a6ff; font-weight: bold;">${roleId}</div>
                                        <div style="font-size: 0.8rem; color: #c9d1d9;">${project.customRoles[roleId]}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div style="background: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 12px;">
                            <h3 style="font-size: 0.75rem; color: #8b949e; text-transform: uppercase; margin: 0 0 15px 0;">+ Nuevo Especialista</h3>
                            <input id="dyn-name" placeholder="Nombre (ej: Pepe)" style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:10px; border-radius:6px; box-sizing: border-box;">
                            
                            <label style="font-size: 0.65rem; color: #8b949e; display:block; margin-bottom:5px;">VINCULAR A JERARQUÍA:</label>
                            <select id="dyn-level" style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:15px; border-radius:6px;">
                                <option value="@pinya">@pinya (Base/Apoyo)</option>
                                <option value="@baixos">@baixos (Ejecución)</option>
                                <option value="@dosos">@dosos (Calidad)</option>
                                <option value="@aixecador">@aixecador (Estructura)</option>
                                <option value="@anxaneta">@anxaneta (Dirección)</option>
                            </select>
                            
                            <button onclick="window.addDynamicRole('${projectId}')" style="width: 100%; background: #30363d; color: white; border: 1px solid #484f58; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold;">Inyectar al Gremio</button>
                        </div>

                        ${activeDynamicRoles.length > 0 ? `
                            <div style="background: #0d1117; border: 1px solid #21262d; padding: 15px; border-radius: 8px;">
                                <h4 style="font-size: 0.7rem; color: #8b949e; margin-top: 0;">ESPECIALISTAS ACTIVOS:</h4>
                                ${activeDynamicRoles.map(dr => `
                                    <div style="font-size: 0.8rem; padding: 5px 0; border-bottom: 1px solid #21262d; color:#f0f6fc;">
                                        ${dr.name} <span style="color:#8b949e; font-size:0.7rem;">(${dr.levelId})</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </aside>

                    <main style="background: #0d1117; border: 1px solid #30363d; border-radius: 12px; height: 700px; position: relative; overflow: hidden; box-shadow: inset 0 0 40px rgba(0,0,0,0.8);">
                        ${ValueMapView.render(projectId)}
                        <div style="position: absolute; bottom: 20px; right: 20px; background: rgba(22,27,34,0.8); padding: 10px; border-radius: 6px; border: 1px solid #30363d; font-size: 0.7rem; color: #8b949e;">
                            * El mapa conecta automáticamente a los especialistas con sus roles de referencia.
                        </div>
                    </main>
                </div>
            </div>
        `;
    }
};

window.addDynamicRole = (projectId) => {
    const name = document.getElementById('dyn-name').value;
    const levelId = document.getElementById('dyn-level').value;
    if(!name) return alert("El especialista necesita un nombre");

    const dynamicRole = {
        id: `dyn-${Date.now()}`,
        name: name,
        levelId: levelId, // Asociación directa a @anxaneta, etc.
        isArchived: false
    };

    store.dispatch({
        type: 'ADD_DYNAMIC_ROLE',
        payload: { projectId, dynamicRole }
    });
    
    location.reload();
};
