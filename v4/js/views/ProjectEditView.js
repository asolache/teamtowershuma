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

    // Roles
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
        if(confirm("¿Eliminar este rol? Desaparecerá del mapa, pero el historial de transacciones se mantiene.")) {
            store.dispatch({ type: 'ARCHIVE_ROLE', payload: { projectId, roleId } });
        }
    }

    // Rondas
    if (e.target.id === 'btn-add-ronda-edit') {
        const projectId = e.target.getAttribute('data-pid');
        const name = document.getElementById('nr-ronda-name').value;
        const multiplier = document.getElementById('nr-ronda-multi').value;
        const startDate = document.getElementById('nr-ronda-start').value;
        if(!name) return alert("El nombre de la fase/ronda es obligatorio");
        store.dispatch({ type: 'CREATE_RONDA', payload: { projectId, name, multiplier, startDate } });
    }
    if (e.target.classList.contains('btn-delete-ronda')) {
        const projectId = e.target.getAttribute('data-pid');
        const rondaId = e.target.getAttribute('data-rid');
        if(confirm("¿Eliminar esta fase? Esto podría afectar la forma en que se filtran las transacciones antiguas en Contabilidad.")) {
            store.dispatch({ type: 'DELETE_RONDA', payload: { projectId, rondaId } });
        }
    }
});

// Detectar cambios en inputs (Nombres, Niveles, Precios, Rondas)
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('role-input')) {
        const projectId = e.target.getAttribute('data-pid');
        const roleId = e.target.getAttribute('data-rid');
        const field = e.target.getAttribute('data-field');
        store.dispatch({ type: 'UPDATE_ROLE', payload: { projectId, roleId, field, value: e.target.value } });
    }
    if (e.target.classList.contains('ronda-input')) {
        const projectId = e.target.getAttribute('data-pid');
        const rondaId = e.target.getAttribute('data-rid');
        const field = e.target.getAttribute('data-field');
        store.dispatch({ type: 'UPDATE_RONDA', payload: { projectId, rondaId, field, value: e.target.value } });
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
        const rondas = project.rondas || [];

        return `
            <div class="container">
                <header class="header-main">
                    <div>
                        <h1>⚙️ Diseñador: ${project.nombre}</h1>
                        <p class="text-muted" style="margin: 0;">Arquitectura Unificada, Finanzas y Ciclos de Vida</p>
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
                            <h3 style="margin-bottom: 5px;">2. Ontología (Roles)</h3>
                            
                            <div style="display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr auto; gap: 10px; margin-bottom: 10px; padding: 0 10px;">
                                <span class="text-muted text-small">NOMBRE DEL ROL</span>
                                <span class="text-muted text-small">NIVEL / ÓRBITA</span>
                                <span class="text-muted text-small text-center">MULTI (x)</span>
                                <span class="text-muted text-small text-center">PRECIO (€/h)</span>
                                <span style="width: 30px;"></span>
                            </div>

                            <div style="max-height: 250px; overflow-y: auto; padding-right: 5px; margin-bottom: 15px;">
                                ${activeRoles.map(r => `
                                    <div class="panel-surface" style="padding: 10px; margin-bottom: 8px; display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr auto; gap: 10px; align-items: center;">
                                        <input type="text" value="${r.name}" class="form-control role-input" data-field="name" data-pid="${projectId}" data-rid="${r.id}" style="margin:0; font-weight: bold; border-color: transparent;">
                                        <select class="form-control role-input" data-field="levelId" data-pid="${projectId}" data-rid="${r.id}" style="margin:0; font-size: 0.75rem; padding: 8px;">
                                            <option value="@anxaneta" ${r.levelId === '@anxaneta' ? 'selected' : ''}>@anxaneta</option>
                                            <option value="@aixecador" ${r.levelId === '@aixecador' ? 'selected' : ''}>@aixecador</option>
                                            <option value="@dosos" ${r.levelId === '@dosos' ? 'selected' : ''}>@dosos</option>
                                            <option value="@baixos" ${r.levelId === '@baixos' ? 'selected' : ''}>@baixos</option>
                                            <option value="@pinya" ${r.levelId === '@pinya' ? 'selected' : ''}>@pinya</option>
                                        </select>
                                        <input type="number" step="0.1" value="${r.multiplier}" class="form-control role-input" data-field="multiplier" data-pid="${projectId}" data-rid="${r.id}" style="margin:0; text-align: center; color: var(--accent-blue);">
                                        <input type="number" step="1" value="${r.price}" class="form-control role-input" data-field="price" data-pid="${projectId}" data-rid="${r.id}" style="margin:0; text-align: center; color: var(--accent-green);">
                                        <button class="btn btn-outline btn-archive-role" data-pid="${projectId}" data-rid="${r.id}" style="padding: 6px; border:none; color: var(--accent-red);" title="Borrar Rol">🗑️</button>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="panel-surface" style="border-style: dashed; padding: 15px;">
                                <div style="display: grid; grid-template-columns: 2fr 1.5fr auto; gap: 10px;">
                                    <input id="nr-name-edit" type="text" class="form-control" placeholder="Nuevo Rol (ej: Data Analyst)" style="margin:0;">
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

                        <section class="panel" style="border-color: #d29922;">
                            <h3 style="color: #d29922; margin-bottom: 5px;">3. Tokenomics y Fases de Vida</h3>
                            <p class="text-muted text-small" style="margin-bottom: 15px;">Define los ciclos de vida. Las rondas tempranas (mayor riesgo) deben tener un multiplicador mayor (modelo <i>Slicing Pie</i>).</p>

                            <div style="display: grid; grid-template-columns: 2fr 1.2fr 1.2fr 1fr auto; gap: 10px; margin-bottom: 10px; padding: 0 10px;">
                                <span class="text-muted text-small">NOMBRE DE FASE</span>
                                <span class="text-muted text-small text-center">INICIO</span>
                                <span class="text-muted text-small text-center">FIN</span>
                                <span class="text-muted text-small text-center">RIESGO (x)</span>
                                <span style="width: 30px;"></span>
                            </div>

                            <div style="max-height: 200px; overflow-y: auto; padding-right: 5px; margin-bottom: 15px;">
                                ${rondas.map(r => `
                                    <div class="panel-surface" style="padding: 10px; margin-bottom: 8px; display: grid; grid-template-columns: 2fr 1.2fr 1.2fr 1fr auto; gap: 10px; align-items: center; border-left: 3px solid #d29922;">
                                        <input type="text" value="${r.name}" class="form-control ronda-input" data-field="name" data-pid="${projectId}" data-rid="${r.id}" style="margin:0; font-weight: bold; border-color: transparent;">
                                        <input type="date" value="${r.startDate}" class="form-control ronda-input" data-field="startDate" data-pid="${projectId}" data-rid="${r.id}" style="margin:0; font-size: 0.75rem; padding: 8px;">
                                        <input type="date" value="${r.endDate}" class="form-control ronda-input" data-field="endDate" data-pid="${projectId}" data-rid="${r.id}" style="margin:0; font-size: 0.75rem; padding: 8px;">
                                        <input type="number" step="0.5" value="${r.multiplier}" class="form-control ronda-input" data-field="multiplier" data-pid="${projectId}" data-rid="${r.id}" style="margin:0; text-align: center; color: #d29922; font-weight: bold;">
                                        <button class="btn btn-outline btn-delete-ronda" data-pid="${projectId}" data-rid="${r.id}" style="padding: 6px; border:none; color: var(--accent-red);" title="Borrar Ronda">🗑️</button>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <div class="panel-surface" style="border-style: dashed; padding: 15px; border-color: rgba(210, 153, 34, 0.4);">
                                <div style="display: grid; grid-template-columns: 2fr 1.2fr 1fr auto; gap: 10px;">
                                    <input id="nr-ronda-name" type="text" class="form-control" placeholder="Nueva Ronda (ej: Seed Round)" style="margin:0;">
                                    <input id="nr-ronda-start" type="date" class="form-control" style="margin:0;" value="${new Date().toISOString().split('T')[0]}">
                                    <input id="nr-ronda-multi" type="number" step="0.5" class="form-control" placeholder="Riesgo (ej: 1.5)" style="margin:0;">
                                    <button id="btn-add-ronda-edit" data-pid="${projectId}" class="btn btn-primary" style="background-color: #d29922;">Añadir</button>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        `;
    }
};
