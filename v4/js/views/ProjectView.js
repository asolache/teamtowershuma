import { store } from '../core/store.js';
import { ValueMapView } from './ValueMapView.js';

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div style="color:white;">Proyecto no encontrado</div>`;

        return `
            <div style="max-width: 1400px; margin: 0 auto; padding: 20px; color: #c9d1d9;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h1 style="color: #f0f6fc;">🏰 ${project.nombre}</h1>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="location.hash='#/project/${projectId}/edit'" style="background:#161b22; color:#58a6ff; border:1px solid #30363d; padding:8px 15px; border-radius:6px; cursor:pointer;">⚙️ Diseñar Ecosistema</button>
                        <button onclick="location.hash='#/project/${projectId}/accounting'" style="background:#238636; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer;">💰 Contabilidad</button>
                    </div>
                </header>

                <div style="display: grid; grid-template-columns: 320px 1fr; gap: 20px;">
                    <aside style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <div style="background: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 12px;">
                            <h3 style="font-size: 0.8rem; color: #58a6ff; text-transform: uppercase; margin-top: 0;">+ Nuevo Rol</h3>
                            <input id="nr-name" placeholder="Nombre (ej: Dr. García)" style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:10px; border-radius:6px; box-sizing:border-box;">
                            <select id="nr-level" style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:15px; border-radius:6px;">
                                <option value="@anxaneta">Anxaneta (Estrategia)</option>
                                <option value="@aixecador">Aixecador (Estructura)</option>
                                <option value="@dosos">Dosos (Refinamiento)</option>
                                <option value="@baixos">Baixos (Producción)</option>
                                <option value="@pinya">Pinya (Soporte)</option>
                            </select>
                            <button onclick="window.createRoleFromView('${projectId}')" style="width: 100%; background: #30363d; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold;">Crear Nodo de Rol</button>
                        </div>

                        <div style="background: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 12px;">
                            <h3 style="font-size: 0.8rem; color: #a371f7; text-transform: uppercase; margin-top: 0;">⚡ Nueva Transacción</h3>
                            <select id="tx-from" style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:8px; border-radius:6px;"></select>
                            <select id="tx-to" style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:8px; border-radius:6px;"></select>
                            <input id="tx-entregable" placeholder="Nombre entregable..." style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:8px; border-radius:6px; box-sizing:border-box;">
                            <select id="tx-tipo" style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:15px; border-radius:6px;">
                                <option value="tangible">Tangible (Continua)</option>
                                <option value="intangible">Intangible (Discontinua)</option>
                            </select>
                            <button onclick="window.sendValue('${projectId}')" style="width: 100%; background: #238636; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold;">Registrar Flujo →</button>
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

window.createRoleFromView = (projectId) => {
    const name = document.getElementById('nr-name').value;
    const levelId = document.getElementById('nr-level').value;
    if(!name) return alert("Nombre obligatorio");
    store.dispatch({ type: 'CREATE_CUSTOM_ROLE', payload: { projectId, name, levelId } });
    location.reload();
};
