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
        if(!name) return alert("El nombre es obligatorio");
        store.dispatch({ type: 'CREATE_ROLE', payload: { projectId, name, levelId } });
    }

    if (e.target.classList.contains('btn-archive-role')) {
        const projectId = e.target.getAttribute('data-pid');
        const roleId = e.target.getAttribute('data-rid');
        if(confirm("¿Eliminar este rol? Desaparecerá del mapa, pero las transacciones financieras previas se mantendrán intactas en el Libro Mayor.")) {
            store.dispatch({ type: 'ARCHIVE_ROLE', payload: { projectId, roleId } });
        }
    }
});

// Detectar cambios en inputs (Nombres, Niveles, Precios, Multiplicadores, Fases)
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('role-input')) {
        const projectId = e.target.getAttribute('data-pid');
        const roleId = e.target.getAttribute('data-rid');
        const field = e.target.getAttribute('data-field');
        store.dispatch({ type: 'UPDATE_ROLE', payload: { projectId, roleId, field, value: e.target.value } });
    }
    
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
        const activeRoles = (project.roles || []).filter(r => !r.isArchived);
        const txsOrdered = [...(project.transactions || [])].sort((a, b) => (a.fase || 99) - (b.fase || 99));

        return `
            <div class="container">
                <header class="header-main">
                    <div>
                        <h1>⚙️ Diseñador: ${project.nombre}</h1>
                        <p class="text-muted" style="margin: 0;">Arquitectura Unificada, Finanzas y Procesos</p>
                    </div>
                    <button class="btn btn-primary" onclick="location.hash='#/project/${projectId}'">
                        Guardar y Volver ➔
                    </button>
                </header>

                <div style="display: grid; grid-template-columns: 1fr 1.6fr; gap: 30px;">
                    
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <section class="panel">
                            <h3>1. Misión y Propósito</h3>
                            <div style="margin-bottom: 15px;">
                                <label class="form-label">Nombre del Ecosistema</label>
                                <input id="edit-name" type="text" class="form-control" value="${project.nombre}">
                                <label class="form-label">Sector</label>
                                <select id="edit-sector" class="form-control" style="text-transform:capitalize;">
                                    ${Object.keys(state.ontology.sectores).map(s => `<option value="${s}" ${project.sector === s ? 'selected' : ''}>${s}</option>`).join('')}
                                </select>
                                <label class="form-label">Prompt Maestro</label>
                                <textarea id="edit-desc" class="form-control" style="height: 100px;">${project.description || ''}</textarea>
                            </div>
                            <button id="btn-save-meta" data-pid="${projectId}" class="btn btn-secondary btn-block">Actualizar Metadatos</button>
                        </section>

                        <section class="panel" style="border-color: var(--accent-purple);">
                            <h3 style="color: var(--accent-purple);">🧠 Contexto IA</h3>
                            <pre style="background: var(--bg-base); padding: 15px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.75rem; white-space: pre-wrap; max-height: 400px; overflow-y: auto;">${systemPrompt}</pre>
                        </section>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <section class="panel">
                            <h3 style="margin-bottom: 5px;">2. Ontología Unificada (Roles y Finanzas)</h3>
                            <p class="text-muted text-small" style="margin-bottom: 20px;">Modifica el nombre, jerarquía (órbita) y valor financiero de cualquier nodo. Puedes borrar roles innecesarios.</p>
                            
                            <div style="display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr auto; gap: 10px; margin-bottom: 10px; padding: 0 10px;">
                                <span class="text-muted text-small">NOMBRE DEL ROL</span>
                                <span class="text-muted text-small">NIVEL / ÓRBITA</span>
                                <span class="text-muted text-small text-center">MULTI (x)</span>
                                <span class="text-muted text-small text-center">PRECIO (€/h)</span>
                                <span style="width: 30px;"></span>
                            </div>

                            <div style="max-height: 350px; overflow-y: auto; padding-right: 5px; margin-bottom: 20px;">
                                ${activeRoles.map(r => `
                                    <div class="panel-surface" style="padding: 10px; margin-bottom: 8px; display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr auto; gap: 10px; align-items: center;">
                                        
                                        <input type="text" value="${r.name}" class="form-control role-input" data-field="name" data-pid="${projectId}" data-rid="${r.id}" style="margin:0; font-weight: bold; border-color: transparent;">
                                        
                                        <select class="form-control role-input" data-field="levelId" data-pid="${projectId}" data-rid="${r.id}" style="margin:0; font-size: 0.75rem; padding: 8px;">
                                            <option value="@anxaneta" ${r.levelId === '@anxaneta' ? 'selected' : ''}>@anxaneta (Dirección)</option>
                                            <option value="@aixecador" ${r.levelId === '@aixecador' ? 'selected' : ''}>@aixecador (Management)</option>
                                            <option value="@dosos" ${r.levelId === '@dosos' ? 'selected' : ''}>@dosos (Calidad)</option>
                                            <option value="@baixos" ${r.levelId === '@baixos' ? 'selected' : ''}>@baixos (Operativa)</option>
                                            <option value="@pinya" ${r.levelId === '@pinya' ? 'selected' : ''}>@pinya (Soporte)</option>
                                        </select>
                                        
                                        <input type="number" step="0.1" value="${r.multiplier}" class="form-control role-input" data-field="multiplier" data-pid="${projectId}" data-rid="${r.id}" style="margin:0; text-align: center; color: var(--accent-blue);">
                                        
                                        <input type="number" step="1" value="${r.price}" class="form-control role-input" data-field="price" data-pid="${projectId}" data-rid="${r.id}" style="margin:0; text-align: center; color: var(--accent-green);">
                                        
                                        <button class="btn btn-outline btn-archive-role" data-pid="${projectId}" data-rid="${r.id}" style="padding: 6px; border:none; color: var(--accent-red);" title="Borrar Rol">🗑️</button>
                                    </div>
                                `).join('')}
                            </div>

                            <div class="panel-surface" style="border-style: dashed; padding: 15px;">
                                <h4 class="text-heading text-small" style="margin-top:0;">+ Añadir Nuevo Rol a la Estructura</h4>
                                <div style="display: grid; grid-template-columns: 2fr 1.5fr auto; gap: 10px;">
                                    <input id="nr-name-edit" type="text" class="form-control" placeholder="Nombre (ej: Data Analyst)" style="margin:0;">
                                    <select id="nr-level-edit" class="form-control" style="margin:0;">
                                        <option value="@anxaneta">Órbita @anxaneta</option>
                                        <option value="@aixecador">Órbita @aixecador</option>
                                        <option value="@dosos">Órbita @dosos</option>
                                        <option value="@baixos">Órbita @baixos</option>
                                        <option value="@pinya">Órbita @pinya</option>
                                    </select>
                                    <button id="btn-add-role-edit" data-pid="${projectId}" class="btn btn-primary">Inyectar</button>
                                </div>
                            </div>
                        </section>

                        <section class="panel" style="border-color: var(--accent-blue);">
                            <h3 style="color: var(--accent-blue);">3. Secuenciación del Flujo Temporal</h3>
                            <div style="max-height: 250px; overflow-y: auto;">
                                ${txsOrdered.length === 0 ? `<p class="text-muted text-center text-small">Ve al Mapa e inyecta transacciones para secuenciarlas aquí.</p>` : ''}
                                ${txsOrdered.map(t => {
                                    const rFrom = project.roles.find(r => r.id === t.from)?.name || 'Ecosistema';
                                    const rTo = project.roles.find(r => r.id === t.to)?.name || 'Ecosistema';
                                    return `
                                    <div class="panel-surface" style="padding: 10px; margin-bottom: 8px; display: flex; align-items: center; gap: 15px; border-left: 3px solid var(--accent-blue);">
                                        <div style="text-align: center;">
                                            <input type="number" value="${t.fase || 99}" class="form-control tx-fase-input" data-pid="${projectId}" data-hash="${t.hash}" style="width: 55px; padding: 5px; text-align: center; margin:0; color: var(--accent-blue); font-weight:bold;">
                                        </div>
                                        <div>
                                            <div style="font-size: 0.85rem; color: var(--text-heading);"><b>${t.entregable}</b></div>
                                            <div style="font-size: 0.75rem; color: var(--text-muted);"><span class="text-accent">${rFrom}</span> ➔ ${rTo}</div>
                                        </div>
                                    </div>
                                    `
                                }).join('')}
                            </div>
                        </section>
                        
                    </div>
                </div>
            </div>
        `;
    }
};
