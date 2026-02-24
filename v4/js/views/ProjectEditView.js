import { store } from '../core/store.js';

// 🛡️ GESTIÓN DE EVENTOS DE EDICIÓN
document.addEventListener('change', (e) => {
    // 1. Editar Nombre del Rol
    if (e.target.classList.contains('edit-role-name')) {
        const projectId = e.target.getAttribute('data-pid');
        const roleId = e.target.getAttribute('data-rid');
        store.dispatch({ 
            type: 'UPDATE_ROLE', 
            payload: { projectId, roleId, field: 'name', value: e.target.value } 
        });
    }

    // 2. Editar Órbita/Nivel
    if (e.target.classList.contains('edit-role-level')) {
        const projectId = e.target.getAttribute('data-pid');
        const roleId = e.target.getAttribute('data-rid');
        store.dispatch({ 
            type: 'UPDATE_ROLE', 
            payload: { projectId, roleId, field: 'levelId', value: e.target.value } 
        });
        // Re-render para mostrar los cambios financieros si los hubiera
        const app = document.getElementById('app');
        app.innerHTML = ProjectEditView.render(projectId);
    }
});

document.addEventListener('click', (e) => {
    // Guardar Metadatos del Proyecto
    const btnSave = e.target.closest('#btn-save-meta');
    if (btnSave) {
        const projectId = btnSave.getAttribute('data-pid');
        store.dispatch({ 
            type: 'UPDATE_PROJECT_INFO', 
            payload: { 
                projectId, 
                nombre: document.getElementById('edit-name').value, 
                sector: document.getElementById('edit-sector').value, 
                description: document.getElementById('edit-desc').value 
            } 
        });
        alert("✅ Configuración guardada");
        const app = document.getElementById('app');
        app.innerHTML = ProjectEditView.render(projectId);
    }

    // Inyectar Nuevo Rol
    if (e.target.id === 'btn-add-role-edit') {
        const projectId = e.target.getAttribute('data-pid');
        const name = document.getElementById('nr-name-edit').value;
        const levelId = document.getElementById('nr-level-edit').value;
        if(!name) return alert("Indica el nombre del rol");
        store.dispatch({ type: 'CREATE_ROLE', payload: { projectId, name, levelId } });
        const app = document.getElementById('app');
        app.innerHTML = ProjectEditView.render(projectId);
    }
});

export const ProjectEditView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div class="container"><h2>Proyecto no encontrado</h2></div>`;

        const activeRoles = project.roles.filter(r => !r.isArchived);

        // Mapeo de niveles con formato: "Nombre (@id)"
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
                        <h1>⚙️ Diseñador de Ontología: ${project.nombre}</h1>
                        <p class="text-muted">Personalización de roles y órbitas de valor</p>
                    </div>
                    <button class="btn btn-secondary" onclick="location.hash='#/project/${projectId}'">← Volver al Mapa</button>
                </header>

                <div style="display: grid; grid-template-columns: 350px 1fr; gap: 30px;">
                    
                    <section class="panel">
                        <h3>Misión y Propósito</h3>
                        <div style="margin-bottom: 15px;">
                            <label class="form-label">Nombre del Proyecto</label>
                            <input id="edit-name" type="text" class="form-control" value="${project.nombre}">
                            
                            <label class="form-label">Sector Operativo</label>
                            <select id="edit-sector" class="form-control">
                                ${Object.keys(state.ontology.sectores).map(s => `
                                    <option value="${s}" ${project.sector === s ? 'selected' : ''}>${s.toUpperCase()}</option>
                                `).join('')}
                            </select>
                            
                            <label class="form-label">Descripción Estratégica</label>
                            <textarea id="edit-desc" class="form-control" style="height: 100px;">${project.description || ''}</textarea>
                        </div>
                        <button id="btn-save-meta" data-pid="${projectId}" class="btn btn-primary btn-block">Guardar Cambios</button>
                        
                        <div style="margin-top: 20px; padding: 10px; background: rgba(163, 113, 247, 0.1); border-radius: 8px;">
                            <h4 style="color: var(--accent-purple); margin:0;">🧠 Contexto IA</h4>
                            <p class="text-small text-muted">Este texto alimenta el diagnóstico automático del ecosistema.</p>
                        </div>
                    </section>

                    <section class="panel">
                        <h3>Gestión de Roles</h3>
                        <p class="text-muted text-small">Edita los nombres y cambia las órbitas para ajustar el peso financiero (Slicing Pie).</p>
                        
                        <div style="margin-bottom: 20px;">
                            ${activeRoles.map(r => `
                                <div class="panel-surface" style="display: grid; grid-template-columns: 1fr 1fr 40px; gap: 15px; align-items: center; margin-bottom: 10px;">
                                    <div>
                                        <label class="text-small text-muted" style="display:block; font-size:0.6rem;">NOMBRE DEL ROL</label>
                                        <input type="text" 
                                               class="form-control edit-role-name" 
                                               data-pid="${projectId}" 
                                               data-rid="${r.id}" 
                                               value="${r.name}" 
                                               style="margin:0;">
                                    </div>
                                    <div>
                                        <label class="text-small text-muted" style="display:block; font-size:0.6rem;">ÓRBITA (NIVEL)</label>
                                        <select class="form-control edit-role-level" 
                                                data-pid="${projectId}" 
                                                data-rid="${r.id}" 
                                                style="margin:0; font-size: 0.85rem;">
                                            ${levelOptions.map(opt => `
                                                <option value="${opt.id}" ${r.levelId === opt.id ? 'selected' : ''}>${opt.label}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    <button class="btn-archive-role" data-pid="${projectId}" data-rid="${r.id}" style="background:none; border:none; cursor:pointer; font-size:1.2rem;">🗑️</button>
                                </div>
                            `).join('')}
                        </div>

                        <div class="panel-surface" style="border: 2px dashed var(--border-color); background: none;">
                            <h4 style="margin-top:0;">+ Inyectar Nuevo Rol</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px;">
                                <input id="nr-name-edit" type="text" class="form-control" placeholder="Nombre del Rol" style="margin:0;">
                                <select id="nr-level-edit" class="form-control" style="margin:0;">
                                    ${levelOptions.map(opt => `<option value="${opt.id}">${opt.label}</option>`).join('')}
                                </select>
                                <button id="btn-add-role-edit" data-pid="${projectId}" class="btn btn-primary">Añadir</button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }
};
