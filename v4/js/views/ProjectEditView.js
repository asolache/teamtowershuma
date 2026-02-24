import { store } from '../core/store.js';

// 🛡️ EVENTOS BLINDADOS Y REACTIVOS
document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-save-meta') {
        const projectId = e.target.getAttribute('data-pid');
        const nombre = document.getElementById('edit-name').value;
        const sector = document.getElementById('edit-sector').value;
        const description = document.getElementById('edit-desc').value;
        store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId, nombre, sector, description } });
    }

    if (e.target.id === 'btn-add-role-edit') {
        const projectId = e.target.getAttribute('data-pid');
        const name = document.getElementById('nr-name-edit').value;
        const levelId = document.getElementById('nr-level-edit').value;
        const area = document.getElementById('nr-area-edit').value;
        if(!name) return alert("El nombre es obligatorio");
        
        store.dispatch({ type: 'CREATE_CUSTOM_ROLE', payload: { projectId, name, levelId, area } });
    }

    if (e.target.classList.contains('btn-archive-role')) {
        const projectId = e.target.getAttribute('data-pid');
        const rolId = e.target.getAttribute('data-rid');
        if(confirm("¿Archivar rol? Dejará de aparecer en el mapa activo.")) {
            store.dispatch({ type: 'ARCHIVE_CUSTOM_ROLE', payload: { projectId, rolId } });
        }
    }
});

// Eventos para detectar cambios en inputs de texto/número
document.addEventListener('change', (e) => {
    // Detectar edición de nombres de roles base
    if (e.target.classList.contains('base-role-input')) {
        const projectId = e.target.getAttribute('data-pid');
        const roleId = e.target.getAttribute('data-rid');
        store.dispatch({ type: 'UPDATE_BASE_ROLE_NAME', payload: { projectId, roleId, newName: e.target.value } });
    }
    
    // Detectar cambio de fase en las transacciones
    if (e.target.classList.contains('tx-fase-input')) {
        const projectId = e.target.getAttribute('data-pid');
        const txHash = e.target.getAttribute('data-hash');
        store.dispatch({ type: 'UPDATE_TRANSACTION_PHASE', payload: { projectId, txHash, fase: e.target.value } });
    }
});

export const ProjectEditView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        
        if (!project) return `<div class="container text-center"><h2>Proyecto no encontrado</h2></div>`;

        const systemPrompt = store.generateSystemPrompt(projectId);
        const activeDynamicRoles = (project.dynamicRoles || []).filter(dr => !dr.isArchived);
        
        // Ordenamos las transacciones por fase para mostrarlas en la tabla
        const txsOrdered = [...(project.transactions || [])].sort((a, b) => (a.fase || 99) - (b.fase || 99));

        return `
            <div class="container">
                <header class="header-main">
                    <div>
                        <h1>⚙️ Diseñador: ${project.nombre}</h1>
                        <p class="text-muted" style="margin: 0;">Arquitectura, Ontología y Secuenciación de Procesos</p>
                    </div>
                    <button class="btn btn-primary" onclick="location.hash='#/project/${projectId}'">
                        Guardar y Volver ➔
                    </button>
                </header>

                <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 30px;">
                    
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <section class="panel">
                            <h3>1. Misión y Sector</h3>
                            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px;">
                                <div>
                                    <label class="form-label">Nombre del Ecosistema</label>
                                    <input id="edit-name" type="text" class="form-control" value="${project.nombre}">
                                </div>
                                <div>
                                    <label class="form-label">Sector Base (Plantilla)</label>
                                    <select id="edit-sector" class="form-control" style="text-transform:capitalize;">
                                        ${Object.keys(state.ontology.sectores).map(s => `
                                            <option value="${s}" ${project.sector === s ? 'selected' : ''}>${s}</option>
                                        `).join('')}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label class="form-label">Propósito / Directriz (Prompt Maestro)</label>
                                <textarea id="edit-desc" class="form-control" style="height: 100px; resize: vertical;" placeholder="Define el propósito del sistema...">${project.description || ''}</textarea>
                            </div>
                            <button id="btn-save-meta" data-pid="${projectId}" class="btn btn-secondary btn-block">
                                Actualizar Metadatos
                            </button>
                        </section>

                        <section class="panel" style="border-color: var(--accent-purple);">
                            <h3 style="color: var(--accent-purple);">🧠 Espejo de Consciencia</h3>
                            <p class="text-muted text-small">Así leerá la IA los roles y el proceso secuencial de tu proyecto:</p>
                            <pre style="background: var(--bg-base); padding: 15px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.8rem; white-space: pre-wrap; margin: 0; font-family: monospace; max-height: 400px; overflow-y: auto;">${systemPrompt}</pre>
                        </section>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <section class="panel">
                            <h3>2. Ontología de Roles</h3>
                            <p class="text-muted text-small" style="margin-bottom: 20px;">
                                Modifica el nombre de los roles base para adaptarlos a tu léxico interno.
                            </p>
                            
                            <div style="max-height: 250px; overflow-y: auto; padding-right: 10px; margin-bottom: 20px;">
                                <h4 class="text-muted text-uppercase">Roles Base (Editables)</h4>
                                ${Object.keys(project.customRoles).map(id => `
                                    <div class="panel-surface" style="padding: 10px; margin-bottom: 10px; display: flex; align-items: center; gap: 15px;">
                                        <div class="text-accent" style="font-weight: bold; font-size: 0.9rem; width: 85px;">${id}</div>
                                        <input type="text" value="${project.customRoles[id]}" class="form-control base-role-input" data-pid="${projectId}" data-rid="${id}" style="margin:0;">
                                    </div>
                                `).join('')}
                                
                                <h4 class="text-muted text-uppercase" style="margin-top: 25px;">Especialistas Activos</h4>
                                ${activeDynamicRoles.length === 0 ? '<p class="text-muted text-small text-center">No hay especialistas inyectados aún.</p>' : ''}
                                ${activeDynamicRoles.map(dr => `
                                    <div class="panel-surface" style="padding: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <div class="text-accent" style="font-weight: bold; font-size: 0.9rem;">${dr.name}</div>
                                            <div class="text-muted" style="font-size: 0.7rem;">Vinculado a: ${dr.levelId}</div>
                                        </div>
                                        <button class="btn btn-outline btn-archive-role" data-pid="${projectId}" data-rid="${dr.id}" style="padding: 5px 10px; border-color: transparent;" title="Archivar (ocultar del mapa)">📥</button>
                                    </div>
                                `).join('')}
                            </div>
                        </section>

                        <section class="panel" style="border-color: var(--accent-blue);">
                            <h3 style="color: var(--accent-blue);">3. Secuenciación del Flujo de Valor</h3>
                            <p class="text-muted text-small" style="margin-bottom: 20px;">
                                Asigna el orden lógico (Fase 1, 2, 3...) a las transacciones para crear el proceso. Un número "99" equivale a flujo transversal continuo.
                            </p>
                            
                            <div style="max-height: 300px; overflow-y: auto;">
                                ${txsOrdered.length === 0 ? `<p class="text-muted text-center text-small">Ve al Mapa e inyecta transacciones para secuenciarlas aquí.</p>` : ''}
                                ${txsOrdered.map(t => `
                                    <div class="panel-surface" style="padding: 10px; margin-bottom: 10px; display: flex; align-items: center; gap: 15px; border-left: 3px solid var(--accent-blue);">
                                        <div style="text-align: center;">
                                            <label class="text-muted" style="font-size: 0.6rem; display:block; margin-bottom:2px;">FASE</label>
                                            <input type="number" value="${t.fase || 99}" class="form-control tx-fase-input" data-pid="${projectId}" data-hash="${t.hash}" style="width: 55px; padding: 5px; text-align: center; margin:0; color: var(--accent-blue); font-weight:bold;">
                                        </div>
                                        <div style="flex-grow: 1;">
                                            <div style="font-size: 0.85rem; color: var(--text-heading); margin-bottom: 2px;"><b>${t.entregable}</b></div>
                                            <div style="font-size: 0.75rem; color: var(--text-muted);">
                                                <span class="text-accent">${t.from}</span> ➔ ${t.to}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </section>
                        
                    </div>
                </div>
            </div>
        `;
    }
};
