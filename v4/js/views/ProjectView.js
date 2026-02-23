import { store } from '../core/store.js';
import { ValueMapView } from './ValueMapView.js';

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div style="color:white;">Proyecto no encontrado</div>`;

        const salud = store.calculateResilience(projectId);

        return `
            <div style="max-width: 1400px; margin: 0 auto; padding: 20px; color: #c9d1d9;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h1 style="color: #f0f6fc;">🏰 ${project.nombre} <span style="font-size:0.9rem; color:#8b949e;">(${project.sector})</span></h1>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="location.hash='#/project/${projectId}/accounting'" style="background:#238636; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer;">💰 Contabilidad</button>
                        <button onclick="location.hash='#/'" style="background:#21262d; color:#c9d1d9; border:1px solid #30363d; padding:8px 15px; border-radius:6px; cursor:pointer;">Dashboard</button>
                    </div>
                </header>

                <div style="display: grid; grid-template-columns: 320px 1fr; gap: 20px;">
                    
                    <aside style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <div style="background: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 12px;">
                            <h3 style="font-size: 0.8rem; color: #58a6ff; text-transform: uppercase; margin-top: 0;">+ Nuevo Especialista</h3>
                            <input id="dyn-name" placeholder="Nombre (ej: Dr. García)" style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:10px; border-radius:6px;">
                            <select id="dyn-level" style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:15px; border-radius:6px;">
                                <option value="@anxaneta">Vincular a @anxaneta (Dirección)</option>
                                <option value="@aixecador">Vincular a @aixecador (Estructura)</option>
                                <option value="@dosos">Vincular a @dosos (Calidad)</option>
                                <option value="@baixos">Vincular a @baixos (Ejecución)</option>
                                <option value="@pinya">Vincular a @pinya (Base)</option>
                            </select>
                            <button onclick="window.addDynamicRole('${projectId}')" style="width: 100%; background: #30363d; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold;">Crear Nodo de Rol</button>
                        </div>

                        <div style="background: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 12px;">
                            <h3 style="font-size: 0.8rem; color: #a371f7; text-transform: uppercase; margin-top: 0;">⚡ Inyectar Flujo</h3>
                            <select id="tx-from" style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:8px; border-radius:6px; font-size:0.8rem;"></select>
                            <select id="tx-to" style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:8px; border-radius:6px; font-size:0.8rem;"></select>
                            <input id="tx-entregable" placeholder="¿Qué se entrega?" style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:8px; border-radius:6px;">
                            <select id="tx-tipo" style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:15px; border-radius:6px;">
                                <option value="tangible">Tangible (Continua)</option>
                                <option value="intangible">Intangible (Discontinua)</option>
                            </select>
                            <button onclick="window.sendValue('${projectId}')" style="width: 100%; background: #238636; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold;">Enviar Valor →</button>
                        </div>
                    </aside>

                    <main style="background: #0d1117; border: 1px solid #30363d; border-radius: 12px; height: 750px; position: relative; overflow: hidden;">
                        ${ValueMapView.render(projectId)}
                    </main>
                </div>
            </div>
        `;
    }
};

// Función para añadir el rol y que aparezca en el mapa
window.addDynamicRole = (projectId) => {
    const name = document.getElementById('dyn-name').value;
    const levelId = document.getElementById('dyn-level').value;
    if(!name) return alert("Nombre de especialista necesario");

    store.dispatch({
        type: 'ADD_DYNAMIC_ROLE',
        payload: { 
            projectId, 
            dynamicRole: { id: `dyn-${Date.now()}`, name, levelId, isArchived: false } 
        }
    });
    location.reload();
};
