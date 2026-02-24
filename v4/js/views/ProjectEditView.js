import { store } from '../core/store.js';

// 🛡️ EVENTOS BLINDADOS Y REACTIVOS (Sin Reload)
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

document.addEventListener('change', (e) => {
    if (e.target.classList.contains('seq-input')) {
        const projectId = e.target.getAttribute('data-pid');
        const rolId = e.target.getAttribute('data-rid');
        store.dispatch({ type: 'UPDATE_ROLE_SEQUENCE', payload: { projectId, rolId, sequence: e.target.value } });
    }
});

export const ProjectEditView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        
        if (!project) return `<div class="container text-center"><h2>Proyecto no encontrado</h2></div>`;

        const systemPrompt = store.generateSystemPrompt(projectId);
        const activeDynamicRoles = (project.dynamicRoles || []).filter(dr => !dr.isArchived);
        const defaultSeq = { "@anxaneta": 1, "@aixecador": 2, "@dosos": 3, "@baixos": 4, "@pinya": 5 };

        return `
            <div class="container">
                
                <header class="header-main">
                    <div>
                        <h1>⚙️ Diseñador: ${project.nombre}</h1>
                        <p class="text-muted" style="margin: 0;">Arquitectura, Ontología y Contexto IA</p>
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
                                    <label class="form-label">Sector Base</label>
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
                            <p class="text-muted text-small">Así leerá la IA la arquitectura de tu ecosistema:</p>
                            <pre style="background: var(--bg-base); padding: 15px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.8rem; white-space: pre-wrap; margin: 0; font-family: monospace;">${systemPrompt}</pre>
                        </section>
                    </div>

                    <section class="panel">
                        <h3>2. Secuenciación Lógica</h3>
                        <p class="text-muted text-small" style="margin-bottom: 20px;">
                            Define el orden del flujo de valor. Roles con Fase "99" operan como soporte transversal o externo.
                        </p>
                        
                        <div style="max-height: 450px; overflow-y: auto; padding-right: 10px; margin-bottom: 20px;">
                            
                            <h4 class="text-muted text-uppercase">Ontología Base</h4>
                            ${Object.keys(project.customRoles).map(id => {
                                const seq = project.sequences?.[id] || defaultSeq[id] || 99;
                                return `
                                <div class="panel-surface" style="padding: 10px; margin-bottom: 10px; display: flex; align-items: center; gap: 15px;">
                                    <div style="text-align: center;">
                                        <label class="text-muted" style="font-size: 0.6rem; display:block; margin-bottom:2px;">FASE</label>
                                        <input type="number" value="${seq}" class="form-control seq-input" data-pid="${projectId}" data-rid="${id}" style="width: 50px; padding: 5px; text-align: center; margin:0; color: var(--accent-blue); font-weight:bold;">
                                    </div>
                                    <div>
                                        <div class="text-accent" style="font-weight: bold; font-size: 0.9rem;">${id}</div>
                                        <div class="text-small">${project.customRoles[id]}</div>
                                    </div>
                                </div>
                                `;
                            }).join('')}
                            
                            <h4 class="text-muted text-uppercase" style="margin-top: 25px;">Especialistas del Gremio</h4>
                            ${activeDynamicRoles.length === 0 ? '<p class="text-muted text-small text-center">No hay especialistas inyectados aún.</p>' : ''}
                            ${activeDynamicRoles.map(dr => {
                                const seq = project.sequences?.[dr.id] || 99;
                                return `
                                <div class="panel-surface" style="padding: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                                    <div style="display: flex; align-items: center; gap: 15px;">
                                        <div style="text-align: center;">
                                            <input type="number" value="${seq}" class="form-control seq-input" data-pid="${projectId}" data-rid="${dr.id}" style="width: 50px; padding: 5px; text-align: center; margin:0; color: var(--accent-blue); font-weight:bold;">
                                        </div>
                                        <div>
                                            <div class="text-accent" style="font-weight: bold; font-size: 0.9rem;">${dr.name}</div>
                                            <div class="text-muted" style="font-size: 0.7rem;">Vinculado a: ${dr.levelId}</div>
                                        </div>
                                    </div>
                                    <button class="btn btn-outline btn-archive-role" data-pid="${projectId}" data-rid="${dr.id}" style="padding: 5px 10px; border-color: transparent;" title="Archivar (ocultar del mapa)">
                                        📥
                                    </button>
                                </div>
                                `;
                            }).join('')}
                        </div>

                        <div class="panel-surface" style="border-style: dashed;">
                            <h4 class="text-heading text-small" style="margin-top:0;">+ Inyectar Especialista Rápido</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                <div>
                                    <input id="nr-name-edit" type="text" class="form-control" placeholder="Nombre (ej: Devops Jr)" style="margin:0;">
                                </div>
                                <div>
                                    <select id="nr-level-edit" class="form-control" style="margin:0;">
                                        <option value="@anxaneta">-> @anxaneta</option>
                                        <option value="@aixecador">-> @aixecador</option>
                                        <option value="@dosos">-> @dosos</option>
                                        <option value="@baixos">-> @baixos</option>
                                        <option value="@pinya">-> @pinya</option>
                                    </select>
                                </div>
                                <div style="grid-column: span 2;">
                                    <button id="btn-add-role-edit" data-pid="${projectId}" class="btn btn-primary btn-block">Añadir al Sistema</button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }
};
