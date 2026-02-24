import { store } from '../core/store.js';

// 🛡️ EVENTOS BLINDADOS
document.addEventListener('click', (e) => {
    // 1. REPARACIÓN: Guardar Metadatos
    const btnSave = e.target.closest('#btn-save-meta');
    if (btnSave) {
        const projectId = btnSave.getAttribute('data-pid');
        const nombre = document.getElementById('edit-name').value;
        const sector = document.getElementById('edit-sector').value;
        const description = document.getElementById('edit-desc').value;
        
        store.dispatch({ 
            type: 'UPDATE_PROJECT_INFO', 
            payload: { projectId, nombre, sector, description } 
        });
        alert("✅ Configuración del Castell actualizada");
        // Forzamos re-render para actualizar el Prompt IA
        const app = document.getElementById('app');
        app.innerHTML = ProjectEditView.render(projectId);
    }

    // 2. Añadir Rol
    if (e.target.id === 'btn-add-role-edit') {
        const projectId = e.target.getAttribute('data-pid');
        const name = document.getElementById('nr-name-edit').value;
        const levelId = document.getElementById('nr-level-edit').value;
        if(!name) return alert("El nombre es obligatorio");
        store.dispatch({ type: 'CREATE_ROLE', payload: { projectId, name, levelId } });
        const app = document.getElementById('app');
        app.innerHTML = ProjectEditView.render(projectId);
    }

    // 3. Archivar Rol
    if (e.target.classList.contains('btn-archive-role')) {
        const projectId = e.target.getAttribute('data-pid');
        const roleId = e.target.getAttribute('data-rid');
        if(confirm("¿Archivar este rol?")) {
            store.dispatch({ type: 'ARCHIVE_ROLE', payload: { projectId, roleId } });
            const app = document.getElementById('app');
            app.innerHTML = ProjectEditView.render(projectId);
        }
    }
});

export const ProjectEditView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div class="container"><h2>Proyecto no encontrado</h2></div>`;

        const systemPrompt = store.generateSystemPrompt(projectId);
        const activeRoles = project.roles.filter(r => !r.isArchived);

        // Mapeo para los desplegables con nombres descriptivos
        const levelOptions = [
            { id: "@anxaneta", label: "Strategy (@anxaneta)" },
            { id: "@aixecador", label: "Creative/Coord (@aixecador)" },
            { id: "@dosos", label: "Quality/Audit (@dosos)" },
            { id: "@baixos", label: "Operational (@baixos)" },
            { id: "@pinya", label: "Support/Base (@pinya)" }
        ];

        return `
            <div class="container">
                <header class="header-main">
                    <div>
                        <h1>⚙️ Diseñador: ${project.nombre}</h1>
                        <p class="text-muted">Ajuste de Ontología y Misión SOS</p>
                    </div>
                    <button class="btn btn-primary" onclick="location.hash='#/project/${projectId}'">
                        Ver Mapa ➔
                    </button>
                </header>

                <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 30px;">
                    
                    <section class="panel">
                        <h3>1. Misión y Propósito</h3>
                        <div style="margin-bottom: 15px;">
                            <label class="form-label">Nombre del Castell</label>
                            <input id="edit-name" type="text" class="form-control" value="${project.nombre}">
                            
                            <label class="form-label">Sector Operativo</label>
                            <select id="edit-sector" class="form-control">
                                ${Object.keys(state.ontology.sectores).map(s => `
                                    <option value="${s}" ${project.sector === s ? 'selected' : ''}>${s.toUpperCase()}</option>
                                `).join('')}
                            </select>
                            
                            <label class="form-label">Misión Estratégica (Contexto IA)</label>
                            <textarea id="edit-desc" class="form-control" style="height: 120px;" placeholder="Describe el objetivo de este ecosistema...">${project.description || ''}</textarea>
                        </div>
                        <button id="btn-save-meta" data-pid="${projectId}" class="btn btn-secondary btn-block">
                            Actualizar Metadatos
                        </button>

                        <div style="margin-top: 30px;">
                            <h3 style="color: var(--accent-purple);">🧠 Contexto IA (Prompt Maestro)</h3>
                            <pre style="background: #0d1117; padding: 15px; border-radius: 8px; font-size: 0.75rem; color: var(--text-muted); white-space: pre-wrap; border: 1px solid var(--border-color);">${systemPrompt}</pre>
                        </div>
                    </section>

                    <section class="panel">
                        <h3>2. Ontología (Roles y Órbitas)</h3>
                        
                        <div style="max-height: 400px; overflow-y: auto; margin-bottom: 20px;">
                            ${activeRoles.map(r => `
                                <div class="panel-surface" style="display: grid; grid-template-columns: 1.5fr 1.5fr 40px; gap: 10px; align-items: center; margin-bottom: 10px; padding: 10px;">
                                    <input type="text" value="${r.name}" class="form-control" style="margin:0; font-weight: bold;" readonly>
                                    
                                    <select class="form-control" style="margin:0; font-size: 0.8rem;" disabled>
                                        ${levelOptions.map(opt => `
                                            <option value="${opt.id}" ${r.levelId === opt.id ? 'selected' : ''}>${opt.label}</option>
                                        `).join('')}
                                    </select>
                                    
                                    <button class="btn btn-outline btn-archive-role" data-pid="${projectId}" data-rid="${r.id}" style="color: var(--accent-red); border:none;">🗑️</button>
                                </div>
                            `).join('')}
                        </div>

                        <div class="panel-surface" style="border-style: dashed; border-color: var(--accent-blue);">
                            <h4 style="margin-top:0;">+ Inyectar Nuevo Rol</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px;">
                                <input id="nr-name-edit" type="text" class="form-control" placeholder="Nombre (ej: QA Engineer)" style="margin:0;">
                                <select id="nr-level-edit" class="form-control" style="margin:0;">
                                    ${levelOptions.map(opt => `<option value="${opt.id}">${opt.label}</option>`).join('')}
                                </select>
                                <button id="btn-add-role-edit" data-pid="${projectId}" class="btn btn-primary">Inyectar</button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }
};
