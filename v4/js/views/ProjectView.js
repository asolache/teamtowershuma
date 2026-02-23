import { store } from '../core/store.js';
import { ValueMapView } from './ValueMapView.js';

// 🛡️ EVENTOS BLINDADOS CONTRA SES
document.addEventListener('click', (e) => {
    // Evento: Añadir Nuevo Rol (Especialista)
    if (e.target.id === 'btn-add-role-view') {
        const projectId = e.target.getAttribute('data-pid');
        const name = document.getElementById('nr-name').value;
        const levelId = document.getElementById('nr-level').value;
        if(!name) return alert("Por favor, introduce un nombre para el especialista.");
        
        store.dispatch({ type: 'CREATE_CUSTOM_ROLE', payload: { projectId, name, levelId, area: 'Especialista' } });
        location.reload();
    }
    
    // Evento: Añadir Nueva Transacción (Flujo)
    if (e.target.id === 'btn-add-tx-view') {
        const projectId = e.target.getAttribute('data-pid');
        const from = document.getElementById('tx-from').value;
        const to = document.getElementById('tx-to').value;
        const entregable = document.getElementById('tx-entregable').value;
        const tipo = document.getElementById('tx-tipo').value;

        if (!entregable) return alert("Por favor, define qué se entrega en esta transacción.");

        store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId, tx: { from, to, entregable, tipo, liquidación: 0, horas: 1 } } });
        location.reload();
    }
});

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div style="color:white; padding: 50px;">Proyecto no encontrado</div>`;

        const salud = store.calculateResilience(projectId);
        
        // Recopilamos todos los nodos activos para los desplegables
        const allActiveNodes = [
            ...Object.keys(project.customRoles || {}).map(id => ({ id, label: project.customRoles[id] })),
            ...(project.dynamicRoles || []).filter(dr => !dr.isArchived).map(dr => ({ id: dr.id, label: dr.name }))
        ];
        const optionsHtml = allActiveNodes.map(n => `<option value="${n.id}">${n.label} (${n.id})</option>`).join('');

        return `
            <div style="max-width: 1400px; margin: 0 auto; padding: 20px; color: #c9d1d9;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h1 style="color: #f0f6fc; margin: 0;">🏰 ${project.nombre}</h1>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="location.hash='#/project/${projectId}/edit'" style="background:#161b22; color:#58a6ff; border:1px solid #30363d; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold;">⚙️ Diseñar Ecosistema</button>
                        <button onclick="location.hash='#/project/${projectId}/accounting'" style="background:#238636; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold;">💰 Contabilidad</button>
                    </div>
                </header>

                <div style="display: grid; grid-template-columns: 320px 1fr; gap: 20px;">
                    <aside style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <div style="background: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 12px;">
                            <h3 style="font-size: 0.8rem; color: #58a6ff; text-transform: uppercase; margin-top: 0;">+ Nuevo Especialista</h3>
                            <input id="nr-name" placeholder="Nombre (ej: Dr. García)" style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:10px; border-radius:6px; box-sizing:border-box;">
                            <select id="nr-level" style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:15px; border-radius:6px; box-sizing:border-box;">
                                <option value="@anxaneta">Vincular a @anxaneta</option>
                                <option value="@aixecador">Vincular a @aixecador</option>
                                <option value="@dosos">Vincular a @dosos</option>
                                <option value="@baixos">Vincular a @baixos</option>
                                <option value="@pinya">Vincular a @pinya</option>
                            </select>
                            <button id="btn-add-role-view" data-pid="${projectId}" style="width: 100%; background: #30363d; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold;">Añadir al Gremio</button>
                        </div>

                        <div style="background: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 12px;">
                            <h3 style="font-size: 0.8rem; color: #a371f7; text-transform: uppercase; margin-top: 0;">⚡ Nueva Transacción</h3>
                            <label style="font-size:0.65rem; color:#8b949e;">DE (Origen):</label>
                            <select id="tx-from" style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:8px; border-radius:6px; box-sizing:border-box;">${optionsHtml}</select>
                            
                            <label style="font-size:0.65rem; color:#8b949e;">PARA (Destino):</label>
                            <select id="tx-to" style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:8px; border-radius:6px; box-sizing:border-box;">${optionsHtml}</select>
                            
                            <input id="tx-entregable" placeholder="¿Qué se entrega?" style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:8px; border-radius:6px; box-sizing:border-box;">
                            
                            <select id="tx-tipo" style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:8px; margin-bottom:15px; border-radius:6px; box-sizing:border-box;">
                                <option value="tangible">Tangible (Continua)</option>
                                <option value="intangible">Intangible (Discontinua)</option>
                            </select>
                            <button id="btn-add-tx-view" data-pid="${projectId}" style="width: 100%; background: #238636; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold;">Registrar Flujo →</button>
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
