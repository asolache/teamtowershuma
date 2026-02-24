import { store } from '../core/store.js';
import { ValueMapView } from './ValueMapView.js';

// 🛡️ EVENTOS BLINDADOS CONTRA SES
document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-add-role-view') {
        const projectId = e.target.getAttribute('data-pid');
        const name = document.getElementById('nr-name').value;
        const levelId = document.getElementById('nr-level').value;
        if(!name) return alert("Por favor, introduce un nombre para el especialista.");
        
        store.dispatch({ type: 'CREATE_CUSTOM_ROLE', payload: { projectId, name, levelId, area: 'Especialista' } });
    }
    
    if (e.target.id === 'btn-add-tx-view') {
        const projectId = e.target.getAttribute('data-pid');
        const from = document.getElementById('tx-from').value;
        const to = document.getElementById('tx-to').value;
        const entregable = document.getElementById('tx-entregable').value;
        const tipo = document.getElementById('tx-tipo').value;

        if (!entregable) return alert("Por favor, define qué se entrega en esta transacción.");

        store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId, tx: { from, to, entregable, tipo, liquidación: 0, horas: 1 } } });
    }
});

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        
        if (!project) return `
            <div class="container text-center">
                <h2>🏰 Proyecto no encontrado</h2>
                <button class="btn btn-outline" onclick="location.hash='#/'">Volver al Dashboard</button>
            </div>`;

        const salud = store.calculateResilience(projectId);
        const colorSalud = salud > 40 ? 'var(--accent-green)' : 'var(--accent-red)';
        
        // Recopilamos todos los nodos activos para los desplegables
        const allActiveNodes = [
            ...Object.keys(project.customRoles || {}).map(id => ({ id, label: project.customRoles[id] })),
            ...(project.dynamicRoles || []).filter(dr => !dr.isArchived).map(dr => ({ id: dr.id, label: dr.name }))
        ];
        const optionsHtml = allActiveNodes.map(n => `<option value="${n.id}">${n.label} (${n.id})</option>`).join('');

        return `
            <div class="container">
                <header class="header-main">
                    <div>
                        <h1>🏰 ${project.nombre}</h1>
                        <div style="display: flex; gap: 15px; align-items: center; margin-top: 5px;">
                            <span class="text-muted text-uppercase">Sector: <b class="text-accent">${project.sector}</b></span>
                            <span class="text-uppercase" style="color: ${colorSalud}; font-weight: bold; font-size: 0.8rem;">
                                Resiliencia: ${salud}%
                            </span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-outline" onclick="location.hash='#/project/${projectId}/edit'">⚙️ Diseñar Ecosistema</button>
                        <button class="btn btn-primary" onclick="location.hash='#/project/${projectId}/accounting'">💰 Contabilidad</button>
                    </div>
                </header>

                <div class="grid-layout">
                    <aside style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <div class="panel">
                            <h3 class="text-accent text-uppercase text-small">+ Nuevo Especialista</h3>
                            
                            <label class="form-label">Nombre del Nodo</label>
                            <input id="nr-name" class="form-control" placeholder="Ej: Dr. García">
                            
                            <label class="form-label">Vinculación (Órbita)</label>
                            <select id="nr-level" class="form-control">
                                <option value="@anxaneta">@anxaneta (Estrategia)</option>
                                <option value="@aixecador">@aixecador (Estructura)</option>
                                <option value="@dosos">@dosos (Calidad)</option>
                                <option value="@baixos">@baixos (Producción)</option>
                                <option value="@pinya">@pinya (Soporte Base)</option>
                            </select>
                            
                            <button id="btn-add-role-view" data-pid="${projectId}" class="btn btn-secondary btn-block" style="margin-top: 10px;">
                                Añadir al Gremio
                            </button>
                        </div>

                        <div class="panel" style="border-color: var(--accent-purple);">
                            <h3 class="text-uppercase text-small" style="color: var(--accent-purple);">⚡ Nueva Transacción</h3>
                            
                            <label class="form-label">DE (Origen):</label>
                            <select id="tx-from" class="form-control text-small">${optionsHtml}</select>
                            
                            <label class="form-label">PARA (Destino):</label>
                            <select id="tx-to" class="form-control text-small">${optionsHtml}</select>
                            
                            <label class="form-label">Entregable de Valor:</label>
                            <input id="tx-entregable" class="form-control text-small" placeholder="¿Qué fluye aquí?">
                            
                            <label class="form-label">Naturaleza del Flujo:</label>
                            <select id="tx-tipo" class="form-control text-small">
                                <option value="tangible">Tangible (Línea Continua)</option>
                                <option value="intangible">Intangible (Línea Discontinua)</option>
                            </select>
                            
                            <button id="btn-add-tx-view" data-pid="${projectId}" class="btn btn-primary btn-block" style="margin-top: 10px;">
                                Registrar Flujo →
                            </button>
                        </div>
                    </aside>

                    <main class="map-container">
                        ${ValueMapView.render(projectId)}
                    </main>
                </div>
            </div>
        `;
    }
};
